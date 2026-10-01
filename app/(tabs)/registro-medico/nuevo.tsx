import Button from "@/components/Button";
import Card from "@/components/Card";
import Input from "@/components/Input";
import { useMascotas } from "@/components/SidebarToggler";
import { guardarTratamiento } from "@/store/tratamientos";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useRef, useState } from "react";
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

export default function TratamientoNuevo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const { activa } = useMascotas();
  const guardando = useRef(false);

  const [nombreProducto, setNombreProducto] = useState("");
  const [fechaAplicacion, setFechaAplicacion] = useState(new Date());
  const [fechaVencimiento, setFechaVencimiento] = useState(new Date());
  const [fechaSiguienteDosis, setFechaSiguienteDosis] = useState(new Date());
  const [comentarios, setComentarios] = useState("");

  const [showPickerAplicacion, setShowPickerAplicacion] = useState(false);
  const [showPickerVencimiento, setShowPickerVencimiento] = useState(false);
  const [showPickerDosis, setShowPickerDosis] = useState(false);

  const avisar = (mensaje: string) => {
    if (Platform.OS === "web") {
      window.alert(mensaje);
    } else {
      Alert.alert("Tratamiento", mensaje);
    }
  };

  const fechaSQL = (fecha: Date) =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

  const handleGuardar = async () => {
    if (guardando.current) return;

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
      const guardado = await guardarTratamiento(db, activa.id_mascota, {
        nombreProducto: nombreProducto.trim(),
        fechaAplicacion: fechaSQL(fechaAplicacion),
        fechaVencimiento: fechaSQL(fechaVencimiento),
        fechaSiguienteDosis: fechaSQL(fechaSiguienteDosis),
        comentarios: comentarios.trim(),
      });

      if (!guardado) {
        avisar("La mascota seleccionada ya no está disponible.");
        return;
      }

      router.back();
    } catch {
      avisar(
        "No se pudo guardar el tratamiento. Los datos siguen en el formulario; vuelve a intentarlo.",
      );
    } finally {
      guardando.current = false;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Encabezado */}
      <View className="flex-row items-center px-6 pb-4 pt-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color="#022f2e" />
        </Pressable>
        <Text className="flex-1 pr-7 text-center font-sans-bold text-xl text-text">
          Agregar tratamiento
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="px-6 pb-6"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-4 font-sans text-base text-text opacity-70">
          Ingresa el tratamiento (interno y/o externo)
        </Text>

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
      </ScrollView>

      <View className="px-6 pb-4">
        <Button label="Guardar tratamiento" onPress={handleGuardar} />
      </View>
    </View>
  );
}
