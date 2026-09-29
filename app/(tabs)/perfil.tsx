import { Text, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="font-sans-bold text-2xl text-text">
        Página Principal
      </Text>
      <Text className="mt-2 font-sans text-base text-text opacity-70">
        Bienvenido a MascotApp
      </Text>
    </View>
  );
}
