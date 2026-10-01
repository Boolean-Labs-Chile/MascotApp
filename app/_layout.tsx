import { MascotasProvider } from "@/components/SidebarToggler";
import { inicializarBase } from "@/store/database";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense, useEffect } from "react";
import { Text } from "react-native";

import "@/global.css";

// Previene que la pantalla de carga (Splash Screen) se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Nunito-Regular": require("../assets/fonts/Nunito/Nunito-Regular.ttf"),
    "Nunito-Bold": require("../assets/fonts/Nunito/Nunito-Bold.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/Nunito/Nunito-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Si las fuentes aún no cargan, se mantiene la Splash Screen visible
  if (!fontsLoaded) {
    return null;
  }

  return (
    <Suspense fallback={<Text>Cargando mascotas…</Text>}>
      <SQLiteProvider
        databaseName="mascotapp.db"
        onInit={inicializarBase}
        useSuspense
      >
        <MascotasProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="mascota-nueva" />
          </Stack>
        </MascotasProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
