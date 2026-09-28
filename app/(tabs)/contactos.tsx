import { Text, View } from "react-native";

export default function Contactos() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-text font-sans-bold text-2xl">Contactos</Text>
      <Text className="text-text font-sans text-base opacity-70 mt-2">
        Aquí puedes agregar contactos de emergencia para tu mascota
      </Text>
    </View>
  );
}
