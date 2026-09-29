import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Button from "@/components/Button";
import { useMascotas } from "@/contexts/MascotasContext";

export function MascotasSidebar({
  visible,
  cerrar,
}: {
  visible: boolean;
  cerrar: () => void;
}) {
  const { mascotas, activa, seleccionar } = useMascotas();
  const router = useRouter();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cerrar}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <SafeAreaView
          style={{
            width: "80%",
            maxWidth: 360,
            backgroundColor: "#f0fdfa",
            padding: 20,
          }}
        >
          <Text className="mb-4 font-sans-bold text-2xl text-text">
            Mis mascotas
          </Text>
          <Button label="Cerrar menú" onPress={cerrar} variant="light" />
          <ScrollView className="my-4">
            {mascotas.length === 0 && (
              <Text>No tienes mascotas registradas.</Text>
            )}
            {mascotas.map((m) => (
              <Pressable
                key={m.id_mascota}
                accessibilityRole="button"
                accessibilityState={{
                  selected: m.id_mascota === activa?.id_mascota,
                }}
                onPress={() => {
                  seleccionar(m.id_mascota);
                  cerrar();
                }}
                className="mb-3 rounded-xl border border-text/20 bg-white p-4"
              >
                <Text className="font-sans-semibold text-lg text-text">
                  {m.nombre}
                  {m.id_mascota === activa?.id_mascota ? " ✓" : ""}
                </Text>
                <Text className="text-text">
                  {m.tipo_animal ?? "Sin especie"}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Button
            label="Agregar mascota"
            onPress={() => {
              cerrar();
              router.push("/mascota-nueva");
            }}
          />
        </SafeAreaView>
        <Pressable
          style={{ flex: 1 }}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
          onPress={cerrar}
        />
      </View>
    </Modal>
  );
}
