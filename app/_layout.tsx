import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense, useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

import { inicializarBaseDeDatos } from "@/db/inicializar";
import { DATABASE_NAME } from "@/db/schema";
import { MascotasProvider } from "@/contexts/MascotasContext";
import "../global.css";

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
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      }
    >
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        onInit={inicializarBaseDeDatos}
        useSuspense={Platform.OS === "web"}
      >
        <MascotasProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
        </MascotasProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
