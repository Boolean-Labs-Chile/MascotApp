import { Text, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-text font-sans-bold text-2xl">
        Página Principal
      </Text>
      <Text className="text-text font-sans text-base opacity-70 mt-2">
        Bienvenido a MascotApp
      </Text>
    </View>
  );
}
