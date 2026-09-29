import { Alert } from "@/utils/alertas";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Image } from "@/components/ImagenMascota";
import { useFocusEffect, useRouter } from "expo-router";
import Button from "@/components/Button";
import { EditButton } from "@/components/EditButton";
import { SidebarToggler } from "@/components/SidebarToggler";
import { MascotasSidebar } from "@/components/MascotasSidebar";
import { useMascotas } from "@/contexts/MascotasContext";

export default function Perfil() {
  const { activa, cargando, error, refrescar, servicio } = useMascotas();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const ocupado = useRef(false);
  useFocusEffect(
    useCallback(() => {
      void refrescar();
    }, [refrescar]),
  );
  const confirmarEliminar = () => {
    if (!activa || ocupado.current) return;
    const mascota = activa;
    Alert.alert(
      "Eliminar mascota",
      `¿Eliminar a ${mascota.nombre}? También se eliminarán sus tratamientos. Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            if (ocupado.current) return;
            ocupado.current = true;
            setEliminando(true);
            try {
              const resultado = await servicio.eliminar(mascota.id_mascota);
              if (resultado.advertencia)
                Alert.alert("Mascota eliminada", resultado.advertencia);
              await refrescar();
            } catch (e) {
              Alert.alert(
                "No se pudo eliminar",
                e instanceof Error ? e.message : "Inténtalo nuevamente.",
              );
            } finally {
              ocupado.current = false;
              setEliminando(false);
            }
          },
        },
      ],
    );
  };
  if (cargando)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <Text>Cargando mascotas…</Text>
      </View>
    );
  if (error)
    return (
      <View className="flex-1 justify-center gap-4 bg-background p-6">
        <Text>{error}</Text>
        <Button label="Reintentar" onPress={() => void refrescar()} />
      </View>
    );
  const campos = activa
    ? [
        ["Especie", activa.tipo_animal],
        ["Género", activa.genero === "macho" ? "Macho" : "Hembra"],
        ["Esterilizado", activa.estado_esterilizacion ? "Sí" : "No"],
        ["Nacimiento", activa.fecha_nacimiento],
        ["Adopción", activa.fecha_adopcion],
        ["Edad registrada", activa.edad == null ? null : `${activa.edad} años`],
        ["Color", activa.color],
        ["Raza", activa.raza],
        ["Signos distintivos", activa.rasgos],
        ["Número de chip", activa.numero_chip],
        ["Pasaporte", activa.pasaporte],
      ]
    : [];
  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <SidebarToggler
          nombreMascota={activa?.nombre ?? "Mis mascotas"}
          onPress={() => setMenu(true)}
          disabled={eliminando}
        />
        {activa ? (
          <>
            {activa.imagen_perfil && (
              <Image
                source={{ uri: activa.imagen_perfil }}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  alignSelf: "center",
                }}
                contentFit="cover"
                accessibilityLabel={`Foto de ${activa.nombre}`}
              />
            )}
            <View className="flex-row items-center justify-between">
              <Text className="font-sans-bold text-3xl text-text">
                {activa.nombre}
              </Text>
              {!eliminando && (
                <EditButton
                  onPress={() =>
                    router.push({
                      pathname: "/mascota-nueva",
                      params: { id: activa.id_mascota },
                    })
                  }
                />
              )}
            </View>
            {campos.map(([label, valor]) => (
              <View key={label} className="rounded-xl bg-white p-4">
                <Text className="font-sans-semibold text-text">{label}</Text>
                <Text className="text-text">{valor || "Sin información"}</Text>
              </View>
            ))}
            <Button
              label={eliminando ? "Eliminando…" : "Eliminar mascota"}
              onPress={confirmarEliminar}
              disabled={eliminando}
              variant="light"
            />
          </>
        ) : (
          <>
            <Text className="font-sans-bold text-2xl text-text">
              Todavía no tienes mascotas
            </Text>
            <Text className="text-text">
              Agrega tu primera mascota para ver su perfil.
            </Text>
          </>
        )}
        <Button
          label="Agregar mascota"
          onPress={() => router.push("/mascota-nueva")}
          disabled={eliminando}
        />
      </ScrollView>
      <MascotasSidebar visible={menu} cerrar={() => setMenu(false)} />
    </View>
  );
}
