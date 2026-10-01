import { AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function CustomDrawerContent(props: any) {
  const router = useRouter();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 justify-between p-4">
        <View>
          {/* Header */}
          <View className="flex-row items-center justify-between p-3">
            <Text className="font-sans-bold text-lg text-text">Perfil</Text>
            <Ionicons
              name="menu"
              size={24}
              color="black"
              onPress={() => props.navigation.closeDrawer()}
            />
          </View>

          <Pressable
            onPress={() => console.log("Abrir sección: Perfil")}
            className="flex-row items-center gap-3 rounded-md p-3 active:opacity-70"
          >
            <Ionicons name="person-circle-outline" size={28} color="black" />
            <Text className="font-sans text-base text-text">Mi Perfil</Text>
          </Pressable>

          <Text className="mb-2 mt-4 px-3 font-sans-bold text-lg text-text">
            Mascotas
          </Text>

          <Pressable
            onPress={() => console.log("Abrir sección: Mascotas")}
            className="flex-row items-center gap-3 rounded-md p-3 active:opacity-70"
          >
            <FontAwesome5 name="cat" size={24} color="black" />
            <Text className="font-sans text-base text-text">Canela</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              router.push("/mascota-nueva");
              // props.navigation.closeDrawer();
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
