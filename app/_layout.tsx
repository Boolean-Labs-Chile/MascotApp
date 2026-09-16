import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Nunito-Regular': require('../assets/fonts/Nunito/Nunito-Regular.ttf'),
    'Nunito-Bold': require('../assets/fonts/Nunito/Nunito-Bold.ttf'),
    'Nunito-SemiBold': require('../assets/fonts/Nunito/Nunito-SemiBold.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  
  return <Stack />;
}
