import Button from "@/components/Button";
import { ImageSelector } from "@/components/ImageSelector";
import Input from "@/components/Input";
import RadioButton from "@/components/RadioButton";
import { useMascotas } from "@/components/SidebarToggler";
import {
  eliminarMascota,
  guardarMascota,
  NombreMascotaDuplicadoError,
} from "@/store/mascotas";
import { respaldarMascota } from "@/store/respaldo-firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { ImagePickerAsset } from "expo-image-picker";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function MascotaNueva() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const db = useSQLiteContext();
  const { mascotas, cargando, recargar, seleccionar } = useMascotas();
  const existente = mascotas.find(
    (mascota) => String(mascota.id_mascota) === id,
  );

  const cargado = useRef<string | null>(null);
  const guardando = useRef(false);
  const saliendo = useRef(false);
  const alertaAbierta = useRef(false);

  const [ocupado, setOcupado] = useState(false);
  const [fotoNueva, setFotoNueva] = useState(false);
  const [extension, setExtension] = useState("jpg");
  const [nombre, setNombre] = useState("");
  const [genero, setGenero] = useState<"macho" | "hembra" | null>(null);
  const [esterilizado, setEsterilizado] = useState(false);
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [fechaAdopcion, setFechaAdopcion] = useState(new Date());
  const [especie, setEspecie] = useState("");
  const [color, setColor] = useState("");
  const [signosDistintivos, setSignosDistintivos] = useState("");
  const [raza, setRaza] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [showPickerNacimiento, setShowPickerNacimiento] = useState(false);
  const [showPickerAdopcion, setShowPickerAdopcion] = useState(false);

  const avisar = (mensaje: string) => {
    if (Platform.OS === "web") {
      window.alert(mensaje);
    } else {
      Alert.alert("Mascota", mensaje);
    }
  };

  useEffect(() => {
    if (!existente || !id || cargado.current === id) return;

    cargado.current = id;
    setNombre(existente.nombre);
    setGenero(existente.genero);
    setEsterilizado(Boolean(existente.estado_esterilizacion));
    setFechaNacimiento(
      existente.fecha_nacimiento
        ? new Date(`${existente.fecha_nacimiento}T12:00:00`)
        : new Date(),
    );
    setFechaAdopcion(
      existente.fecha_adopcion
        ? new Date(`${existente.fecha_adopcion}T12:00:00`)
        : new Date(),
    );
    setEspecie(existente.tipo_animal ?? "");
    setColor(existente.color ?? "");
    setSignosDistintivos(existente.rasgos ?? "");
    setRaza(existente.raza ?? "");
    setFotoUri(existente.imagen_web ?? existente.imagen_perfil);
  }, [existente, id]);

  const fechaSQL = (fecha: Date) =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

  const hoyFecha = new Date();
  const fechaMinimaNacimiento = new Date(hoyFecha);
  fechaMinimaNacimiento.setFullYear(hoyFecha.getFullYear() - 35);
  const hoy = fechaSQL(hoyFecha);

  const hayCambios =
    existente !== undefined &&
    (nombre !== existente.nombre ||
      genero !== existente.genero ||
      esterilizado !== Boolean(existente.estado_esterilizacion) ||
      fechaSQL(fechaNacimiento) !== (existente.fecha_nacimiento ?? hoy) ||
      fechaSQL(fechaAdopcion) !== (existente.fecha_adopcion ?? hoy) ||
      especie !== (existente.tipo_animal ?? "") ||
      color !== (existente.color ?? "") ||
      signosDistintivos !== (existente.rasgos ?? "") ||
      raza !== (existente.raza ?? "") ||
      fotoNueva);

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

  const handleImageSelected = (asset: ImagePickerAsset) => {
    const nombreArchivo = (asset.fileName ?? asset.uri).split(/[?#]/)[0];
    const sufijo = nombreArchivo.split(".").pop()?.toLowerCase();

    const formatos: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };

    const tipo = asset.mimeType ?? formatos[sufijo ?? ""] ?? "";

    if (!["image/jpeg", "image/png", "image/webp"].includes(tipo)) {
      avisar("Selecciona una imagen JPG, PNG o WebP.");
      return;
    }

    if ((asset.fileSize ?? 0) > 5 * 1024 * 1024) {
      avisar("La foto debe pesar menos de 5 MB.");
      return;
    }

    if (Platform.OS === "web" && !asset.base64) {
      avisar("No se pudo leer la foto. Selecciónala nuevamente.");
      return;
    }

    setFotoUri(
      Platform.OS === "web" ? `data:${tipo};base64,${asset.base64}` : asset.uri,
    );
    setExtension(tipo === "image/jpeg" ? "jpg" : tipo.split("/")[1]);
    setFotoNueva(true);
  };

  const handleGuardar = async () => {
    if (guardando.current || cargando) return;

    if (id && !existente) {
      avisar("Esta mascota ya no está disponible.");
      return;
    }

    if (!nombre.trim() || !genero || !especie.trim()) {
      avisar("Completa el nombre, el género y la especie.");
      return;
    }

    const nacimiento = fechaSQL(fechaNacimiento);
    const adopcion = fechaSQL(fechaAdopcion);

    if (
      Number.isNaN(fechaNacimiento.getTime()) ||
      Number.isNaN(fechaAdopcion.getTime()) ||
      nacimiento < fechaSQL(fechaMinimaNacimiento) ||
      nacimiento > hoy ||
      adopcion < nacimiento ||
      adopcion > hoy
    ) {
      avisar(
        "Revisa las fechas: la mascota debe tener como máximo 35 años y la adopción debe estar entre su nacimiento y hoy.",
      );
      return;
    }

    guardando.current = true;
    setOcupado(true);

    try {
      const mascotaId = await guardarMascota(
        db,
        {
          nombre: nombre.trim(),
          genero,
          esterilizado,
          tipoAnimal: especie.trim(),
          fechaNacimiento: nacimiento,
          fechaAdopcion: adopcion,
          color: color.trim(),
          rasgos: signosDistintivos.trim(),
          raza: raza.trim(),
          imagenPerfil: existente?.imagen_perfil ?? null,
          imagenWeb: existente?.imagen_web ?? null,
          fotoNueva:
            fotoNueva && fotoUri
              ? {
                  uri: fotoUri,
                  extension,
                  plataforma: Platform.OS === "web" ? "web" : "nativa",
                }
              : undefined,
        },
        existente?.id_mascota,
      );

      void respaldarMascota(db, mascotaId).catch((error) => {
        console.warn("No se pudo respaldar en Firebase:", error);

        const detalle =
          error instanceof Error ? error.message : "Error desconocido.";

        avisar(
          `La mascota se guardó en este teléfono, pero Firebase no pudo respaldarla.\n\n${detalle}`,
        );
      });

      saliendo.current = true;
      await recargar().catch(() => undefined);
      seleccionar(mascotaId);
      router.replace("/home");
    } catch (error) {
      guardando.current = false;
      setOcupado(false);

      if (error instanceof NombreMascotaDuplicadoError) {
        avisar(error.message);
        return;
      }

      console.error("Error al guardar la mascota:", error);

      avisar(
        "No se pudo guardar la mascota. Tus datos siguen en el formulario; vuelve a intentarlo." +
          (__DEV__
            ? `\n\nDetalle: ${error instanceof Error ? error.message : String(error)}`
            : ""),
      );
    }
  };

  const handleEliminar = async () => {
    if (guardando.current || cargando || !existente) return;

    const confirmado = await confirmar(
      "Eliminar mascota",
      "¿Estás seguro de eliminar el perfil de tu mascota?",
      "Cancelar",
      "Eliminar",
    );

    if (!confirmado || guardando.current) return;

    guardando.current = true;

    try {
      await eliminarMascota(db, existente.id_mascota);
    } catch {
      avisar("No se pudo eliminar la mascota. Vuelve a intentarlo.");
      guardando.current = false;
      return;
    }

    saliendo.current = true;
    seleccionar(null);
    await recargar().catch(() => undefined);
    router.replace("/home");
  };

  const formatDate = (fecha: Date) =>
    fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView>
        <View className="px-6 py-8">
          <Text className="mb-2 text-3xl font-bold text-text">
            {id ? "Edita a tu mascota" : "Registra a tu mascota"}
          </Text>

          <Text className="mb-6 text-base font-normal text-text opacity-70">
            {id
              ? "Actualiza la información de tu mascota"
              : "Completa la información de tu nueva mascota"}
          </Text>

          <ImageSelector
            imageUri={fotoUri}
            onImageSelected={handleImageSelected}
          />

          <Input
            label="Nombre"
            placeholder="Nombre de tu mascota"
            value={nombre}
            onChangeText={setNombre}
          />

          <View className="mb-4">
            <Text className="mb-2 text-base font-semibold text-text">
              Género
            </Text>

            <RadioButton
              label="Macho"
              selected={genero === "macho"}
              onPress={() => setGenero("macho")}
            />

            <RadioButton
              label="Hembra"
              selected={genero === "hembra"}
              onPress={() => setGenero("hembra")}
            />
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-text">
              Esterilizado
            </Text>

            <Switch
              value={esterilizado}
              onValueChange={setEsterilizado}
              trackColor={{ false: "#D1D5DB", true: "#46ecd5" }}
              thumbColor={esterilizado ? "#022f2e" : "#f4f3f4"}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-1 text-base font-semibold text-text">
              Fecha de nacimiento
            </Text>

            <TouchableOpacity
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
              onPress={() => setShowPickerNacimiento(true)}
            >
              <Text className="text-base font-normal text-text">
                {formatDate(fechaNacimiento)}
              </Text>
            </TouchableOpacity>

            {showPickerNacimiento &&
              (Platform.OS === "web" ? (
                <input
                  aria-label="Fecha de nacimiento"
                  type="date"
                  value={fechaSQL(fechaNacimiento)}
                  min={fechaSQL(fechaMinimaNacimiento)}
                  max={hoy}
                  onChange={(event) => {
                    if (event.target.value) {
                      setFechaNacimiento(
                        new Date(`${event.target.value}T12:00:00`),
                      );
                    }
                  }}
                />
              ) : (
                <DateTimePicker
                  value={fechaNacimiento}
                  mode="date"
                  minimumDate={fechaMinimaNacimiento}
                  maximumDate={hoyFecha}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowPickerNacimiento(false);

                    if (selectedDate) {
                      setFechaNacimiento(selectedDate);
                    }
                  }}
                />
              ))}
          </View>

          <View className="mb-4">
            <Text className="mb-1 text-base font-semibold text-text">
              Fecha de adopción
            </Text>

            <TouchableOpacity
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
              onPress={() => setShowPickerAdopcion(true)}
            >
              <Text className="text-base font-normal text-text">
                {formatDate(fechaAdopcion)}
              </Text>
            </TouchableOpacity>

            {showPickerAdopcion &&
              (Platform.OS === "web" ? (
                <input
                  aria-label="Fecha de adopción"
                  type="date"
                  value={fechaSQL(fechaAdopcion)}
                  min={fechaSQL(fechaNacimiento)}
                  max={hoy}
                  onChange={(event) => {
                    if (event.target.value) {
                      setFechaAdopcion(
                        new Date(`${event.target.value}T12:00:00`),
                      );
                    }
                  }}
                />
              ) : (
                <DateTimePicker
                  value={fechaAdopcion}
                  mode="date"
                  minimumDate={fechaNacimiento}
                  maximumDate={hoyFecha}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowPickerAdopcion(false);

                    if (selectedDate) {
                      setFechaAdopcion(selectedDate);
                    }
                  }}
                />
              ))}
          </View>

          <Input
            label="Especie"
            placeholder="Ej: Perro, Gato, etc."
            value={especie}
            onChangeText={setEspecie}
          />

          <Input
            label="Color"
            placeholder="Color de tu mascota"
            value={color}
            onChangeText={setColor}
          />

          <Input
            label="Signos distintivos"
            placeholder="Marcas o características especiales"
            value={signosDistintivos}
            onChangeText={setSignosDistintivos}
            multiline
          />

          <Input
            label="Raza"
            placeholder="Raza de tu mascota"
            value={raza}
            onChangeText={setRaza}
          />

          <View className="mt-6">
            <Button
              label={
                ocupado
                  ? "Guardando…"
                  : id
                    ? "Guardar cambios"
                    : "Guardar mascota"
              }
              onPress={handleGuardar}
            />

            {id ? (
              <Button
                label="Eliminar mascota"
                variant="light"
                onPress={handleEliminar}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
