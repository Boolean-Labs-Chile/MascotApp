import { ButtonCard } from "@/components/ButtonCard";
import { EditButton } from "@/components/EditButton";
import { SidebarToggler, useMascotas } from "@/components/SidebarToggler";
import { StatCard } from "@/components/StatCard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function calcularEdad(fechaNacimiento: string | null) {
  if (!fechaNacimiento) return "Sin dato";

  const nacimiento = new Date(`${fechaNacimiento}T12:00:00`);
  if (Number.isNaN(nacimiento.getTime()) || nacimiento > new Date()) {
    return "Sin dato";
  }

  const hoy = new Date();
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  if (hoy.getDate() < nacimiento.getDate()) meses -= 1;
  if (meses < 0) {
    años -= 1;
    meses += 12;
  }

  if (años > 0) return `${años} ${años === 1 ? "año" : "años"}`;
  if (meses > 0) return `${meses} ${meses === 1 ? "mes" : "meses"}`;
  return "Menos de 1 mes";
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return "Sin registrar";

  const valor = new Date(`${fecha}T12:00:00`);
  return Number.isNaN(valor.getTime())
    ? "Sin registrar"
    : valor.toLocaleDateString("es-CL");
}

export default function Home() {
  const router = useRouter();
  const { activa, recargar, cargando, error } = useMascotas();

  const handleCardPress = (section: string) => {
    Alert.alert(section, "Esta sección estará disponible próximamente.");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="my-2 w-full flex-row items-center justify-between">
          <SidebarToggler />
          {activa ? (
            <EditButton
              onPress={() =>
                router.push({
                  pathname: "/mascota-nueva",
                  params: { id: String(activa.id_mascota) },
                })
              }
            />
          ) : null}
        </View>

        {cargando ? (
          <Text className="mt-8 text-center font-sans text-base text-text opacity-70">
            Cargando mascotas…
          </Text>
        ) : error ? (
          <View className="mt-8 items-center gap-3">
            <Text className="text-center font-sans text-base text-text">
              {error}
            </Text>
            <Pressable
              onPress={() => void recargar().catch(() => undefined)}
              className="rounded-md bg-button-dark px-5 py-3 active:opacity-80"
            >
              <Text className="font-sans-semibold text-white">Reintentar</Text>
            </Pressable>
          </View>
        ) : activa ? (
          <>
            <View className="mt-4 items-center">
              {activa.imagen_web || activa.imagen_perfil ? (
                <Image
                  source={{ uri: activa.imagen_web ?? activa.imagen_perfil! }}
                  style={{ width: 192, height: 192, borderRadius: 96 }}
                  contentFit="cover"
                />
              ) : (
                <View className="h-48 w-48 items-center justify-center rounded-full border-2 border-button-dark bg-white">
                  <Text className="font-sans text-sm text-text opacity-60">
                    Sin foto
                  </Text>
                </View>
              )}
              <Text className="mt-4 font-sans-bold text-2xl text-text">
                {activa.nombre}
              </Text>
              <Text className="mb-1 font-sans text-base capitalize text-text opacity-70">
                {activa.tipo_animal || "Especie sin registrar"}
              </Text>
            </View>

            <View className="my-4 flex-row gap-2 py-2">
              <StatCard
                label="Edad"
                value={calcularEdad(activa.fecha_nacimiento)}
              />
              <StatCard
                label="Esterilizado/a"
                value={activa.estado_esterilizacion ? "Sí" : "No"}
              />
              <StatCard
                label="Género"
                value={activa.genero === "hembra" ? "Hembra" : "Macho"}
              />
            </View>

            <View className="mb-5 mt-2">
              <Text className="mb-1 font-sans-bold text-lg text-text">
                Detalles del perfil
              </Text>
              {[
                ["Nacimiento", formatearFecha(activa.fecha_nacimiento)],
                ["Adopción", formatearFecha(activa.fecha_adopcion)],
                ["Color", activa.color || "Sin registrar"],
                ["Raza", activa.raza || "Sin registrar"],
                ["Rasgos", activa.rasgos || "Sin registrar"],
              ].map(([label, valor]) => (
                <View
                  key={label}
                  className="flex-row items-start justify-between border-b border-text/10 py-3"
                >
                  <Text className="font-sans-semibold text-sm text-text opacity-70">
                    {label}
                  </Text>
                  <Text className="ml-4 flex-1 text-right font-sans text-sm text-text">
                    {valor}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-2 w-full">
              <ButtonCard
                title="Chip Electrónico"
                iconName="memory"
                iconFamily="material"
                onPress={() => handleCardPress("Chip Electrónico")}
              />
              <ButtonCard
                title="Pasaporte"
                iconName="passport"
                iconFamily="material"
                onPress={() => handleCardPress("Pasaporte")}
              />
              <ButtonCard
                title="Alergias"
                iconName="bacteria-outline"
                iconFamily="material"
                onPress={() => handleCardPress("Alergias")}
              />
            </View>
          </>
        ) : (
          <View className="mt-12 items-center gap-4">
            <Text className="text-center font-sans-bold text-xl text-text">
              Aún no hay mascotas registradas
            </Text>
            <Text className="text-center font-sans text-base text-text opacity-70">
              Agrega una mascota para ver aquí su perfil.
            </Text>
            <Pressable
              onPress={() => router.push("/mascota-nueva")}
              className="rounded-md bg-button-dark px-5 py-3 active:opacity-80"
            >
              <Text className="font-sans-semibold text-white">
                Agregar mascota
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
