import Button from "@/components/Button";
import Card from "@/components/Card";
import { EditButton } from "@/components/EditButton";
import { SidebarToggler, useMascotas } from "@/components/SidebarToggler";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const { activa, recargar, cargando, error } = useMascotas();

  const fecha = (valor: string | null) =>
    valor
      ? new Date(valor + "T12:00:00").toLocaleDateString("es-CL")
      : "Sin registrar";
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-6 py-8"
    >
      <View className="mb-6 flex-row">
        <SidebarToggler />
      </View>
      <Text className="font-sans-bold text-2xl text-text">
        Página Principal
      </Text>
      <Text className="mt-2 font-sans text-base text-text opacity-70">
        Bienvenido a MascotApp
      </Text>
      {cargando ? (
        <Text>Cargando mascotas…</Text>
      ) : error ? (
        <View className="mt-6">
          <Text>{error}</Text>
          <Button
            label="Reintentar"
            onPress={() => {
              void recargar().catch(() => undefined);
            }}
          />
        </View>
      ) : activa ? (
        <View className="mt-6 gap-4">
          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="font-sans-bold text-2xl text-text">
                {activa.nombre}
              </Text>
              <EditButton
                onPress={() => {
                  router.push({
                    pathname: "/mascota-nueva",
                    params: { id: activa.id_mascota },
                  });
                }}
              />
            </View>
            {activa.imagen_web || activa.imagen_perfil ? (
              <Image
                source={{ uri: activa.imagen_web ?? activa.imagen_perfil! }}
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                  alignSelf: "center",
                  marginVertical: 16,
                }}
                contentFit="cover"
              />
            ) : null}
            {[
              ["Género", activa.genero],
              ["Esterilizado", activa.estado_esterilizacion ? "Sí" : "No"],
              ["Fecha de nacimiento", fecha(activa.fecha_nacimiento)],
              ["Fecha de adopción", fecha(activa.fecha_adopcion)],
              ["Especie", activa.tipo_animal],
              ["Color", activa.color],
              ["Signos distintivos", activa.rasgos],
              ["Raza", activa.raza],
            ].map(([label, valor]) => (
              <View key={label} className="mt-3">
                <Text className="font-sans-semibold text-base text-text">
                  {label}
                </Text>
                <Text className="font-sans text-base text-text">
                  {valor || "Sin registrar"}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      ) : (
        <Text className="my-6 font-sans text-base text-text">
          Aún no hay mascotas registradas.
        </Text>
      )}
    </ScrollView>
  );
}
