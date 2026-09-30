import Button from "@/components/Button";
import { ImageSelector } from "@/components/ImageSelector";
import Input from "@/components/Input";
import RadioButton from "@/components/RadioButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MascotaNueva() {
  const router = useRouter();

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

  const handleGuardar = () => {
    console.log("Guardando mascota:", {
      nombre,
      genero,
      esterilizado,
      fechaNacimiento,
      fechaAdopcion,
      especie,
      color,
      signosDistintivos,
      raza,
      fotoUri,
    });
    router.replace("/home");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView>
        <View className="px-6 py-8">
          <Text className="mb-2 text-3xl font-bold text-text">
            Registra a tu mascota
          </Text>
          <Text className="mb-6 text-base font-normal text-text opacity-70">
            Completa la información de tu nueva mascota
          </Text>

          {/* Foto de home */}
          <ImageSelector imageUri={fotoUri} onImageSelected={setFotoUri} />

          {/* Nombre */}
          <Input
            label="Nombre"
            placeholder="Nombre de tu mascota"
            value={nombre}
            onChangeText={setNombre}
          />

          {/* Género */}
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

          {/* Esterilizado */}
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

          {/* Fecha de nacimiento */}
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
            {showPickerNacimiento && (
              <DateTimePicker
                value={fechaNacimiento}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowPickerNacimiento(false);
                  if (selectedDate) {
                    setFechaNacimiento(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Fecha de adopción */}
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
            {showPickerAdopcion && (
              <DateTimePicker
                value={fechaAdopcion}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowPickerAdopcion(false);
                  if (selectedDate) {
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
            <Button label="Guardar mascota" onPress={handleGuardar} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
