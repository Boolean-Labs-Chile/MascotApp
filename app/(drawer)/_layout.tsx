import { CustomDrawerContent } from "@/components/CustomDrawerContent";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: "#ffffff", // Color de fondo del sistema de diseño (bg-background)
            borderColor: "#e5e7eb",
            borderWidth: 1,
            width: 225,
          },
        }}
      ></Drawer>
    </GestureHandlerRootView>
  );
}
