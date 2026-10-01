import Button from "@/components/Button";
import Card from "@/components/Card";
import { useMascotas } from "@/components/SidebarToggler";
import { obtenerTratamientos, type Tratamiento } from "@/store/tratamientos";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

//ISSUE 9!!!!

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <View className="mb-3">
      <Text className="font-sans-semibold text-base text-text opacity-60">
        {label}
      </Text>
      <Text className="min-h-[20px] font-sans-semibold text-base text-text">
        {valor}
      </Text>
    </View>
  );
}

export default function RegistroPorTipo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tipo } = useLocalSearchParams<{ tipo: string }>();

  const db = useSQLiteContext();
  const { activa } = useMascotas();
  const idMascota = activa?.id_mascota;
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let vigente = true;

      setTratamientos([]);
      setError("");

      if (tipo !== "tratamientos" || !idMascota) {
        setCargando(false);
        return;
      }

      setCargando(true);

      const cargar = async () => {
        try {
          const filas = await obtenerTratamientos(db, idMascota);

          if (vigente) {
            setTratamientos(filas);
          }
        } catch {
          if (vigente) {
            setError(
              "No se pudieron cargar los tratamientos. Vuelve a entrar para intentarlo nuevamente.",
            );
          }
        } finally {
          if (vigente) {
            setCargando(false);
          }
        }
      };

      void cargar();

      return () => {
        vigente = false;
      };
    }, [db, idMascota, tipo]),
  );

  //solo función para tratamiento sgn lo solicitado
  if (tipo !== "tratamientos") {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="px-6 pt-4">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={28} color="#022f2e" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-sans text-base text-text opacity-70">
            Esta sección estará disponible próximamente.
          </Text>
        </View>
      </View>
    );
  }

  //Tratamientos
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Encabezado */}
      <View className="flex-row items-center px-6 pb-4 pt-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color="#022f2e" />
        </Pressable>
        <Text className="flex-1 pr-7 text-center font-sans-bold text-xl text-text">
          Tratamientos
        </Text>
      </View>

      <ScrollView contentContainerClassName="px-6 pb-8">
        <Text className="mb-4 font-sans text-base text-text opacity-70">
          Aquí puedes <Text className="font-sans-bold italic">agregar</Text>,{" "}
          <Text className="font-sans-bold italic">ver</Text> y{" "}
          <Text className="font-sans-bold italic">editar</Text> los tratamientos
          (desparasitación o medicación) de tu mascota. Toca un tratamiento para
          editarlo.
        </Text>

        <View className="mb-6">
          <Button
            label="Agregar tratamiento"
            onPress={() => router.push("/registro-medico/nuevo")}
          />
        </View>

        {cargando ? (
          <Text className="text-center font-sans text-base text-text opacity-60">
            Cargando tratamientos…
          </Text>
        ) : error ? (
          <Text className="text-center font-sans text-base text-text opacity-60">
            {error}
          </Text>
        ) : !idMascota ? (
          <Text className="text-center font-sans text-base text-text opacity-60">
            Selecciona una mascota para ver sus tratamientos.
          </Text>
        ) : tratamientos.length === 0 ? (
          <Text className="text-center font-sans text-base text-text opacity-60">
            Aún no hay tratamientos registrados.
          </Text>
        ) : (
          tratamientos.map((t) => (
            <Pressable
              key={t.id}
              accessibilityRole="button"
              accessibilityLabel={`Editar tratamiento ${t.nombreProducto}`}
              onPress={() =>
                router.push({
                  pathname: "/registro-medico/nuevo",
                  params: { id: String(t.id) },
                })
              }
              className="mb-4 active:scale-[0.98]"
            >
              <Card>
                <Dato
                  label="Nombre tratamiento (Producto)"
                  valor={t.nombreProducto}
                />
                <Dato label="Fecha aplicación" valor={t.fechaAplicacion} />
                <Dato label="Fecha vencimiento" valor={t.fechaVencimiento} />
                <Dato
                  label="Fecha siguiente dosis"
                  valor={t.fechaSiguienteDosis}
                />
                {t.comentarios !== "" && (
                  <Dato label="Comentarios" valor={t.comentarios} />
                )}
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
