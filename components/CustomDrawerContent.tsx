import { useMascotas } from "@/components/SidebarToggler";
import { AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { mascotas, activa, seleccionar, cargando, error, recargar } =
    useMascotas();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 justify-between p-4">
        <View>
          {/* Header */}
          <View className="flex-row items-center justify-between p-3">
            <Text className="font-sans-bold text-lg text-text">Perfil</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar menú"
              onPress={() => props.navigation.closeDrawer()}
            >
              <Ionicons name="menu" size={24} color="black" />
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              props.navigation.closeDrawer();
              router.push("/home");
            }}
            className="flex-row items-center gap-3 rounded-md p-3 active:opacity-70"
          >
            <Ionicons name="person-circle-outline" size={28} color="black" />
            <Text className="font-sans text-base text-text">Mi Perfil</Text>
          </Pressable>

          <Text className="mb-2 mt-4 px-3 font-sans-bold text-lg text-text">
            Mascotas
          </Text>

          {cargando ? (
            <Text className="px-3 py-2 font-sans text-sm text-text opacity-70">
              Cargando mascotas…
            </Text>
          ) : error ? (
            <Pressable
              onPress={() => void recargar().catch(() => undefined)}
              className="px-3 py-2"
            >
              <Text className="font-sans text-sm text-red-600">
                No se pudieron cargar. Toca para reintentar.
              </Text>
            </Pressable>
          ) : mascotas.length ? (
            mascotas.map((mascota) => {
              const seleccionada = mascota.id_mascota === activa?.id_mascota;
              return (
                <Pressable
                  key={mascota.id_mascota}
                  accessibilityRole="button"
                  accessibilityState={{ selected: seleccionada }}
                  onPress={() => {
                    seleccionar(mascota.id_mascota);
                    props.navigation.closeDrawer();
                  }}
                  className={`flex-row items-center gap-3 rounded-md p-3 active:opacity-70 ${
                    seleccionada ? "bg-button-light" : ""
                  }`}
                >
                  <FontAwesome5 name="cat" size={24} color="black" />
                  <Text className="flex-1 font-sans text-base text-text">
                    {mascota.nombre}
                  </Text>
                  {seleccionada ? (
                    <Ionicons name="checkmark" size={20} color="#022f2e" />
                  ) : null}
                </Pressable>
              );
            })
          ) : (
            <Text className="px-3 py-2 font-sans text-sm text-text opacity-70">
              Aún no hay mascotas registradas.
            </Text>
          )}

          <Pressable
            onPress={() => {
              props.navigation.closeDrawer();
              router.push("/mascota-nueva");
            }}
            className="mt-2 flex-row items-center gap-3 rounded-md bg-button-light bg-button-light p-5 active:opacity-70"
          >
            <AntDesign name="plus" size={16} color="black" />
            <Text className="font-sans text-base text-text">
              Agregar Mascota
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => {
            router.replace("/login");
          }}
          className="flex-row items-center justify-center gap-3 rounded-md border-t border-gray-300 p-3 active:opacity-70"
        >
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
          <Text className="font-sans-semibold text-red-500">Cerrar Sesión</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}
