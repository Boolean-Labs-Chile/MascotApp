import { MascotasProvider } from "@/components/SidebarToggler";
import { SesionProvider, useSesion } from "@/contexts/sesion-context";
import { inicializarBase } from "@/store/database";
import { useFonts } from "expo-font";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense, useEffect } from "react";
import { Text } from "react-native";

import "@/global.css";

// Previene que la pantalla de carga (Splash Screen) se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SesionProvider>
      <ContenidoPrincipal />
    </SesionProvider>
  );
}

function ContenidoPrincipal() {
  const { usuario, cargandoSesion } = useSesion();
  const router = useRouter();
  const segmentos = useSegments();
  const navegacion = useRootNavigationState();

  const [fontsLoaded, fontError] = useFonts({
    "Nunito-Regular": require("../assets/fonts/Nunito/Nunito-Regular.ttf"),
    "Nunito-Bold": require("../assets/fonts/Nunito/Nunito-Bold.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/Nunito/Nunito-SemiBold.ttf"),
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && !cargandoSesion) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, cargandoSesion]);

  // Stack.Protected bloquea las rutas, pero no cambia de pantalla por sí solo
  // cuando la sesión cambia con la app abierta. Esta redirección lo hace:
  // al iniciar sesión o registrarse lleva a /home, y al cerrar sesión a "/".
  useEffect(() => {
    if (cargandoSesion || !navegacion?.key) return;

    // "/" (bienvenida) no tiene segmentos; login y registro están en (auth)
    const primerSegmento = segmentos[0] as string | undefined;
    const enZonaPublica = !primerSegmento || primerSegmento === "(auth)";

    if (usuario && enZonaPublica) {
      router.replace("/home");
    } else if (!usuario && !enZonaPublica) {
      router.replace("/");
    }
  }, [usuario, cargandoSesion, navegacion?.key, segmentos, router]);

  // Si las fuentes aún no cargan, se mantiene la Splash Screen visible
  if ((!fontsLoaded && !fontError) || cargandoSesion) {
    return null;
  }

  if (fontError) {
    throw fontError;
  }

  return (
    <Suspense fallback={<Text>Cargando mascotas…</Text>}>
      <SQLiteProvider
        databaseName="mascotapp.db"
        onInit={inicializarBase}
        useSuspense
      >
        {/* Sin "key": si el Stack se reconstruye al cambiar la sesión, la
            redirección de arriba no encuentra la ruta (drawer). Las mascotas
            se recargan solas al cambiar de usuario (MascotasProvider). */}
        <MascotasProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(drawer)" />
            <Stack.Screen name="mascota-nueva" />
          </Stack>
        </MascotasProvider>
      </SQLiteProvider>
    </Suspense>
  );
}