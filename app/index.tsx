import { Image, Text, View } from "react-native";
import Button from "../components/Button";
import "../global.css";


export default function Index() {
  return (
    <View className="flex-1 bg-background">   
      <View className="items-center justify-center w-64 h-64 mx-auto mt-16 mb-8">
        <Image 
          source={require("../assets/images/logo.png")} 
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain" 
        />
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-text font-sans-bold text-3xl text-center mb-3">
          ¡Bienvenido a MascotApp!
        </Text>
        <Text className="text-text font-sans-light text-sm mb-4 text-center">
          Crea una cuenta o inicia sesión para explorar nuestra app
        </Text>
      </View>
      <View className="flex-1 justify-end pb-12 px-6 gap-3">
        <Button label="Registrarse" onPress={() => {}} />
        <Button label="Iniciar Sesión" onPress={() => {}} variant="light" />
      </View>
    </View>
  );
}