import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: "#cbfbf1", // Color de fondo del sistema de diseño (bg-background)
            width: 280,
          },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Mis Mascotas",
            title: "Mascotas",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
