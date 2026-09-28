import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import Button from "../components/Button";
import "../global.css";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <View className="mx-auto mb-8 mt-16 h-72 w-72 items-center justify-center">
        <Image
          source={require("../assets/images/logo.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="mb-3 text-center font-sans-bold text-3xl text-text">
          ¡Bienvenido a MascotApp!
        </Text>
        <Text className="font-sans-light mb-4 text-center text-sm text-text">
          Crea una cuenta o inicia sesión para explorar nuestra app
        </Text>
      </View>
      <View className="flex-1 justify-end gap-3 px-6 pb-12">
        <Button
          label="Registrarse"
          onPress={() => router.push("/registrarse")}
        />
        <Button
          label="Iniciar Sesión"
          onPress={() => router.push("/login")}
          variant="light"
        />
      </View>
    </View>
  );
}
