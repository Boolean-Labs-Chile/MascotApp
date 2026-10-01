import Button from "@/components/Button";
import Card from "@/components/Card";
import Input from "@/components/Input";
import { useMascotas } from "@/components/SidebarToggler";
import {
  actualizarTratamiento,
  guardarTratamiento,
  obtenerTratamientos,
  type Tratamiento,
} from "@/store/tratamientos";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const avisar = (mensaje: string) => {
  if (Platform.OS === "web") {
    window.alert(mensaje);
  } else {
    Alert.alert("Tratamiento", mensaje);
  }
};

const fechaSQL = (fecha: Date) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

// Convierte "YYYY-MM-DD" (como viene de SQLite) a Date; si está vacía o no es
// válida, usa la fecha de hoy.
const desdeSQL = (fecha: string) => {
  if (!fecha) return new Date();
  const valor = new Date(`${fecha}T12:00:00`);
  return Number.isNaN(valor.getTime()) ? new Date() : valor;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
// Pregunta de confirmación que funciona en móvil (Alert) y en web (confirm).
// Devuelve true si la persona elige la opción de confirmar.
function confirmar(
  titulo: string,
  mensaje: string,
  textoCancelar: string,
  textoConfirmar: string,
): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensaje}`));
  }

  return new Promise((resolve) => {
    Alert.alert(
      titulo,
      mensaje,
      [
        {
          text: textoCancelar,
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: textoConfirmar,
          style: "destructive",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

export default function TratamientoNuevo() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  // Si llega "id", la pantalla funciona en modo edición
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { activa } = useMascotas();
  const idMascota = activa?.id_mascota;
  const editando = id !== undefined;

  const guardando = useRef(false);
  const cargado = useRef<string | null>(null);
  // true cuando la salida de la pantalla es intencional (guardar o descartar
  // cambios): evita que la alerta de "cambios sin guardar" reaparezca
  const saliendo = useRef(false);
  const alertaAbierta = useRef(false);
  // Tratamiento tal como está guardado, para detectar cambios sin guardar
  const [original, setOriginal] = useState<Tratamiento | null>(null);

  const [cargandoDatos, setCargandoDatos] = useState(editando);
  const [nombreProducto, setNombreProducto] = useState("");
  const [fechaAplicacion, setFechaAplicacion] = useState(new Date());
  const [fechaVencimiento, setFechaVencimiento] = useState(new Date());
  const [fechaSiguienteDosis, setFechaSiguienteDosis] = useState(new Date());
  const [comentarios, setComentarios] = useState("");
  const [showPickerAplicacion, setShowPickerAplicacion] = useState(false);
  const [showPickerVencimiento, setShowPickerVencimiento] = useState(false);
  const [showPickerDosis, setShowPickerDosis] = useState(false);

  // Modo edición: carga el tratamiento y rellena el formulario
  useEffect(() => {
    if (!id || !idMascota || cargado.current === id) return;

    let vigente = true;

    const cargar = async () => {
      try {
        const filas = await obtenerTratamientos(db, idMascota);
        if (!vigente) return;

        const tratamiento = filas.find((fila) => String(fila.id) === id);
        if (!tratamiento) {
          avisar("Este tratamiento ya no está disponible.");
          router.back();
          return;
        }

        cargado.current = id;
        setOriginal(tratamiento);
        setNombreProducto(tratamiento.nombreProducto);
        setNombreProducto(tratamiento.nombreProducto);
        setFechaAplicacion(desdeSQL(tratamiento.fechaAplicacion));
        setFechaVencimiento(desdeSQL(tratamiento.fechaVencimiento));
        setFechaSiguienteDosis(desdeSQL(tratamiento.fechaSiguienteDosis));
        setComentarios(tratamiento.comentarios);
        setCargandoDatos(false);
      } catch {
        if (vigente) {
          avisar("No se pudo cargar el tratamiento. Vuelve a intentarlo.");
          router.back();
        }
      }
    };

    void cargar();

    return () => {
      vigente = false;
    };
  }, [db, id, idMascota, router]);

  // Solo hay "cambios sin guardar" al editar un tratamiento ya cargado:
  // compara lo que hay en el formulario contra lo que está guardado.
  const hoy = fechaSQL(new Date());
  const hayCambios =
    original !== null &&
    (nombreProducto !== original.nombreProducto ||
      fechaSQL(fechaAplicacion) !== (original.fechaAplicacion || hoy) ||
      fechaSQL(fechaVencimiento) !== (original.fechaVencimiento || hoy) ||
      fechaSQL(fechaSiguienteDosis) !== (original.fechaSiguienteDosis || hoy) ||
      comentarios !== original.comentarios);

  // Intercepta TODAS las formas de volver atrás (botón físico de Android,
  // gesto de iOS y la flecha del encabezado).
  useEffect(() => {
    return navigation.addListener("beforeRemove", (evento) => {
      // Salida intencional: dejar pasar
      if (saliendo.current) return;

      // Guardando: no se puede salir hasta terminar
      if (guardando.current) {
        evento.preventDefault();
        return;
      }

      // Sin cambios pendientes: dejar pasar
      if (!hayCambios) return;

      evento.preventDefault();
      if (alertaAbierta.current) return;
      alertaAbierta.current = true;

      void confirmar(
        "¿Cancelar Edición?",
        "¡Perderás los cambios aplicados!",
        "Seguir editando",
        "Salir",
      )
        .then((salir) => {
          if (salir) {
            saliendo.current = true;
            navigation.dispatch(evento.data.action);
          }
        })
        .finally(() => {
          alertaAbierta.current = false;
        });
    });
  }, [navigation, hayCambios]);

  const handleGuardar = async () => {
    if (guardando.current || cargandoDatos) return;

    if (!activa) {
      avisar("Selecciona una mascota antes de guardar un tratamiento.");
      return;
    }

    if (!nombreProducto.trim()) {
      avisar("Ingresa el nombre del tratamiento.");
      return;
    }

    if (
      [fechaAplicacion, fechaVencimiento, fechaSiguienteDosis].some((fecha) =>
        Number.isNaN(fecha.getTime()),
      )
    ) {
      avisar("Revisa las fechas del tratamiento.");
      return;
    }

    guardando.current = true;

    try {
      const datos = {
        nombreProducto: nombreProducto.trim(),
        fechaAplicacion: fechaSQL(fechaAplicacion),
        fechaVencimiento: fechaSQL(fechaVencimiento),
        fechaSiguienteDosis: fechaSQL(fechaSiguienteDosis),
        comentarios: comentarios.trim(),
      };

      const guardado = editando
        ? await actualizarTratamiento(db, activa.id_mascota, Number(id), datos)
        : await guardarTratamiento(db, activa.id_mascota, datos);

      if (!guardado) {
        avisar(
          editando
            ? "Este tratamiento ya no está disponible."
            : "La mascota seleccionada ya no está disponible.",
        );
        return;
      }

      // Se guardó: la salida es intencional
      saliendo.current = true;
      router.back();
    } catch {
      avisar(
        "No se pudo guardar el tratamiento. Los datos siguen en el formulario; vuelve a intentarlo.",
      );
    } finally {
      guardando.current = false;
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Encabezado */}
      <View className="flex-row items-center px-6 pb-4 pt-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color="#022f2e" />
        </Pressable>
        <Text className="flex-1 pr-7 text-center font-sans-bold text-xl text-text">
          {editando ? "Editar tratamiento" : "Agregar tratamiento"}
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="px-6 pb-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-4 font-sans text-base text-text opacity-70">
          {editando
            ? "Modifica los datos del tratamiento"
            : "Ingresa el tratamiento (interno y/o externo)"}
        </Text>

        {cargandoDatos ? (
          <Text className="text-center font-sans text-base text-text opacity-60">
            Cargando tratamiento…
          </Text>
        ) : (
          <Card>
            {/* Nombre */}
            <Input
              label="Nombre tratamiento (Producto)"
              value={nombreProducto}
              onChangeText={setNombreProducto}
            />

            {/* Fecha de aplicación */}
            <View className="mb-4">
              <Text className="mb-1 text-sm font-semibold text-text">
                Fecha aplicación
              </Text>
              <TouchableOpacity
                className="rounded-xl border border-gray-200 bg-white px-4 py-3"
                onPress={() => setShowPickerAplicacion(true)}
              >
                <Text className="text-base font-normal text-text">
                  {formatDate(fechaAplicacion)}
                </Text>
              </TouchableOpacity>
              {showPickerAplicacion && (
                <DateTimePicker
                  value={fechaAplicacion}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowPickerAplicacion(false);
                    if (selectedDate) {
                      setFechaAplicacion(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Fecha de vencimiento */}
            <View className="mb-4">
              <Text className="mb-1 text-sm font-semibold text-text">
                Fecha vencimiento
              </Text>
              <TouchableOpacity
                className="rounded-xl border border-gray-200 bg-white px-4 py-3"
                onPress={() => setShowPickerVencimiento(true)}
              >
                <Text className="text-base font-normal text-text">
                  {formatDate(fechaVencimiento)}
                </Text>
              </TouchableOpacity>
              {showPickerVencimiento && (
                <DateTimePicker
                  value={fechaVencimiento}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowPickerVencimiento(false);
                    if (selectedDate) {
                      setFechaVencimiento(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Fecha siguiente dosis */}
            <View className="mb-4">
              <Text className="mb-1 text-sm font-semibold text-text">
                Fecha siguiente dosis
              </Text>
              <TouchableOpacity
                className="rounded-xl border border-gray-200 bg-white px-4 py-3"
                onPress={() => setShowPickerDosis(true)}
              >
                <Text className="text-base font-normal text-text">
                  {formatDate(fechaSiguienteDosis)}
                </Text>
              </TouchableOpacity>
              {showPickerDosis && (
                <DateTimePicker
                  value={fechaSiguienteDosis}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowPickerDosis(false);
                    if (selectedDate) {
                      setFechaSiguienteDosis(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Comentarios (opcional) */}
            <Input
              label="Comentarios (opcional)"
              placeholder="Ej: sirve como interno y externo"
              value={comentarios}
              onChangeText={setComentarios}
              multiline
            />
          </Card>
        )}
      </ScrollView>

      <View className="px-6 pb-4">
        <Button
          label={editando ? "Guardar cambios" : "Guardar tratamiento"}
          onPress={handleGuardar}
        />
      </View>
    </View>
  );
}
