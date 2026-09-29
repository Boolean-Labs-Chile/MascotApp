import { Alert } from "@/utils/alertas";
import Button from "@/components/Button";
import Input from "@/components/Input";
import RadioButton from "@/components/RadioButton";
import DateTimePicker from "@/components/SelectorFecha";
import { Image } from "@/components/ImagenMascota";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMascotas } from "@/contexts/MascotasContext";
import type { Mascota } from "@/db/mascotas";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MascotaNueva() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const idMascota =
    typeof id === "string" && /^\d+$/.test(id) ? Number(id) : null;
  const editando = id !== undefined;
  const { servicio, seleccionar } = useMascotas();
  const [original, setOriginal] = useState<Mascota | null>(null);
  const [cargando, setCargando] = useState(editando);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eligiendoFoto, setEligiendoFoto] = useState(false);
  const ocupado = useRef(false);
  const fotoOcupada = useRef(false);

  const [nombre, setNombre] = useState("");
  const [genero, setGenero] = useState<"macho" | "hembra" | null>(null);
  const [esterilizado, setEsterilizado] = useState(false);
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(
    new Date(),
  );
  const [fechaAdopcion, setFechaAdopcion] = useState<Date | null>(new Date());
  const [especie, setEspecie] = useState("");
  const [color, setColor] = useState("");
  const [signosDistintivos, setSignosDistintivos] = useState("");
  const [raza, setRaza] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  const [showPickerNacimiento, setShowPickerNacimiento] = useState(false);
  const [showPickerAdopcion, setShowPickerAdopcion] = useState(false);

  useEffect(() => {
    if (!editando) return;
    let vigente = true;
    setCargando(true);
    setErrorCarga(null);
    const cargar = async () => {
      try {
        if (!idMascota || !Number.isSafeInteger(idMascota))
          throw new Error("La mascota no es válida.");
        const mascota = await servicio.obtener(idMascota);
        if (!mascota) throw new Error("La mascota ya no existe.");
        if (!vigente) return;
        setOriginal(mascota);
        setNombre(mascota.nombre);
        setGenero(mascota.genero);
        setEsterilizado(mascota.estado_esterilizacion === 1);
        setFechaNacimiento(
          mascota.fecha_nacimiento
            ? new Date(mascota.fecha_nacimiento + "T12:00:00")
            : null,
        );
        setFechaAdopcion(
          mascota.fecha_adopcion
            ? new Date(mascota.fecha_adopcion + "T12:00:00")
            : null,
        );
        setEspecie(mascota.tipo_animal ?? "");
        setColor(mascota.color ?? "");
        setSignosDistintivos(mascota.rasgos ?? "");
        setRaza(mascota.raza ?? "");
        setFotoUri(mascota.imagen_perfil);
      } catch (e) {
        if (vigente)
          setErrorCarga(
            e instanceof Error ? e.message : "No se pudo cargar la mascota.",
          );
      } finally {
        if (vigente) setCargando(false);
      }
    };
    void cargar();
    return () => {
      vigente = false;
    };
  }, [editando, idMascota, servicio]);

  const fechaLocal = (fecha: Date | null) =>
    fecha
      ? [
          fecha.getFullYear(),
          String(fecha.getMonth() + 1).padStart(2, "0"),
          String(fecha.getDate()).padStart(2, "0"),
        ].join("-")
      : null;

  const handleGuardar = async () => {
    if (ocupado.current || fotoOcupada.current || cargando || errorCarga)
      return;
    if (!genero) {
      Alert.alert("Falta información", "Selecciona el género de tu mascota.");
      return;
    }
    ocupado.current = true;
    setGuardando(true);
    try {
      const datos = {
        ...original,
        nombre,
        genero,
        estado_esterilizacion: esterilizado ? (1 as const) : (0 as const),
        fecha_nacimiento: fechaLocal(fechaNacimiento),
        fecha_adopcion: fechaLocal(fechaAdopcion),
        tipo_animal: especie,
        color,
        rasgos: signosDistintivos,
        raza,
        imagen_perfil: fotoUri,
      };
      let guardada: number;
      if (editando) {
        if (!original) throw new Error("No se ha cargado la mascota.");
        const resultado = await servicio.actualizar(original.id_mascota, datos);
        guardada = original.id_mascota;
        if (resultado.advertencia)
          Alert.alert("Cambios guardados", resultado.advertencia);
      } else {
        guardada = await servicio.crear(datos);
      }
      seleccionar(guardada);
      router.replace("/(tabs)/perfil");
    } catch (e) {
      Alert.alert(
        "No se pudo guardar",
        e instanceof Error ? e.message : "Inténtalo nuevamente.",
      );
    } finally {
      ocupado.current = false;
      setGuardando(false);
    }
  };

  const handleSelectPhoto = async () => {
    if (fotoOcupada.current || ocupado.current) return;
    fotoOcupada.current = true;
    setEligiendoFoto(true);
    try {
      const permission =
        Platform.OS === "web"
          ? { granted: true }
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos acceso a tus fotos para elegir la imagen de tu mascota.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setFotoUri(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert(
        "No se pudo seleccionar la foto",
        e instanceof Error ? e.message : "Inténtalo nuevamente.",
      );
    } finally {
      fotoOcupada.current = false;
      setEligiendoFoto(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Sin fecha";
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (cargando || errorCarga) {
    return (
      <View className="flex-1 justify-center gap-4 bg-background p-6">
        <Text>{errorCarga ?? "Cargando mascota…"}</Text>
        {errorCarga && (
          <Button
            label="Volver al perfil"
            onPress={() => router.replace("/(tabs)/perfil")}
          />
        )}
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View
        className="px-6 py-8"
        pointerEvents={guardando || eligiendoFoto ? "none" : "auto"}
      >
        <Text className="mb-2 text-3xl font-bold text-text">
          {editando ? "Edita tu mascota" : "Registra a tu mascota"}
        </Text>
        <Text className="mb-6 text-base font-normal text-text opacity-70">
          {editando
            ? "Actualiza la información de tu mascota"
            : "Completa la información de tu nueva mascota"}
        </Text>

        {/* Foto de perfil */}
        <View className="mb-6 items-center">
          <TouchableOpacity
            onPress={handleSelectPhoto}
            className="h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-button-dark bg-gray-200"
          >
            {fotoUri ? (
              <Image
                source={{ uri: fotoUri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <Text className="px-2 text-center text-sm text-gray-400">
                Toca para agregar foto
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {fotoUri && (
          <Button
            label="Quitar foto"
            variant="light"
            onPress={() => setFotoUri(null)}
          />
        )}

        {/* Nombre */}
        <Input
          label="Nombre"
          placeholder="Nombre de tu mascota"
          value={nombre}
          onChangeText={setNombre}
        />

        {/* Género */}
        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-text">Género</Text>
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

        {/* Esterilizado */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-text">Esterilizado</Text>
          <Switch
            value={esterilizado}
            onValueChange={setEsterilizado}
            trackColor={{ false: "#D1D5DB", true: "#46ecd5" }}
            thumbColor={esterilizado ? "#022f2e" : "#f4f3f4"}
          />
        </View>

        {/* Fecha de nacimiento */}
        <View className="mb-4">
          <Text className="mb-1 text-sm font-semibold text-text">
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
          {showPickerNacimiento && (
            <DateTimePicker
              value={fechaNacimiento ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowPickerNacimiento(false);
                if (event.type === "set" && selectedDate) {
                  setFechaNacimiento(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Fecha de adopción */}
        <View className="mb-4">
          <Text className="mb-1 text-sm font-semibold text-text">
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
          {showPickerAdopcion && (
            <DateTimePicker
              value={fechaAdopcion ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowPickerAdopcion(false);
                if (event.type === "set" && selectedDate) {
                  setFechaAdopcion(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Especie */}
        <Input
          label="Especie"
          placeholder="Ej: Perro, Gato, etc."
          value={especie}
          onChangeText={setEspecie}
        />

        {/* Color */}
        <Input
          label="Color"
          placeholder="Color de tu mascota"
          value={color}
          onChangeText={setColor}
        />

        {/* Signos distintivos */}
        <Input
          label="Signos distintivos"
          placeholder="Marcas o características especiales"
          value={signosDistintivos}
          onChangeText={setSignosDistintivos}
          multiline
        />

        {/* Raza */}
        <Input
          label="Raza"
          placeholder="Raza de tu mascota"
          value={raza}
          onChangeText={setRaza}
        />

        {/* Botón guardar */}
        <View className="mt-6">
          <Button
            label={
              guardando
                ? "Guardando…"
                : eligiendoFoto
                  ? "Seleccionando foto…"
                  : editando
                    ? "Guardar cambios"
                    : "Guardar mascota"
            }
            onPress={handleGuardar}
            disabled={guardando || eligiendoFoto}
          />
          <View className="mt-3">
            <Button
              label="Cancelar"
              variant="light"
              onPress={() => router.replace("/(tabs)/perfil")}
              disabled={guardando || eligiendoFoto}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
