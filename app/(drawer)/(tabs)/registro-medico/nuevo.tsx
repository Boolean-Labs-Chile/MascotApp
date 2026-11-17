import Button from "@/components/Button";
import Card from "@/components/Card";
import Input from "@/components/Input";
import { useMascotas } from "@/components/SidebarToggler";
import {
  actualizarTratamiento,
  fechaMaximaSiguienteDosis,
  fechaMaximaVencimiento,
  guardarTratamiento,
  obtenerTratamientos,
  validarFechasTratamiento,
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

const desdeSQL = (fecha: string) => {
  if (!fecha) return new Date();

  const valor = new Date(`${fecha}T12:00:00`);

  return Number.isNaN(valor.getTime()) ? new Date() : valor;
};

const formatDate = (fecha: Date) =>
  fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

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
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { activa } = useMascotas();
  const idMascota = activa?.id_mascota;
  const editando = id !== undefined;

  const guardando = useRef(false);
  const cargado = useRef<string | null>(null);
  const saliendo = useRef(false);
  const alertaAbierta = useRef(false);

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

  const hoyFecha = new Date();
  const hoy = fechaSQL(hoyFecha);

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

  const hayCambios =
    original !== null &&
    (nombreProducto !== original.nombreProducto ||
      fechaSQL(fechaAplicacion) !== (original.fechaAplicacion || hoy) ||
      fechaSQL(fechaVencimiento) !== (original.fechaVencimiento || hoy) ||
      fechaSQL(fechaSiguienteDosis) !== (original.fechaSiguienteDosis || hoy) ||
      comentarios !== original.comentarios);

  useEffect(() => {
    return navigation.addListener("beforeRemove", (evento) => {
      if (saliendo.current) return;

      if (guardando.current) {
        evento.preventDefault();
        return;
      }

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

    const aplicacion = fechaSQL(fechaAplicacion);
    const vencimiento = fechaSQL(fechaVencimiento);
    const siguienteDosis = fechaSQL(fechaSiguienteDosis);

    if (aplicacion > hoy) {
      avisar("La fecha de aplicación no puede ser posterior a hoy.");
      return;
    }

    if (vencimiento < aplicacion) {
      avisar(
        "La fecha de vencimiento no puede ser anterior a la fecha de aplicación.",
      );
      return;
    }

    if (siguienteDosis < aplicacion) {
      avisar(
        "La fecha de siguiente dosis no puede ser anterior a la fecha de aplicación.",
      );
      return;
    }
    const errorLimites = validarFechasTratamiento({
      nombreProducto,
      fechaAplicacion: aplicacion,
      fechaVencimiento: vencimiento,
      fechaSiguienteDosis: siguienteDosis,
      comentarios,
    });

    if (errorLimites) {
      avisar(errorLimites);
      return;
    }

    guardando.current = true;

    try {
      const datos = {
        nombreProducto: nombreProducto.trim(),
        fechaAplicacion: aplicacion,
        fechaVencimiento: vencimiento,
        fechaSiguienteDosis: siguienteDosis,
        comentarios: comentarios.trim(),
      };

      const resultado = editando
        ? await actualizarTratamiento(db, activa.id_mascota, Number(id), datos)
        : await guardarTratamiento(db, activa.id_mascota, datos);

      if (!resultado.guardado) {
        avisar(
          editando
            ? "Este tratamiento ya no está disponible."
            : "La mascota seleccionada ya no está disponible.",
        );
        return;
      }

      if (!resultado.respaldadoFirestore) {
        avisar(
          "El tratamiento se guardó en el teléfono, pero no se pudo respaldar en Firebase.",
        );
      }

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
            <Input
              label="Nombre tratamiento (Producto)"
              value={nombreProducto}
              onChangeText={setNombreProducto}
            />

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
                  maximumDate={hoyFecha}
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
                  minimumDate={fechaAplicacion}
                  maximumDate={fechaMaximaVencimiento()}
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
                  minimumDate={fechaAplicacion}
                  maximumDate={fechaMaximaSiguienteDosis()}
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
