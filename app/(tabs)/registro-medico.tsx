import { Text, View } from "react-native";

export default function RegistroMedico() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-text font-sans-bold text-2xl">Registro Médico</Text>
      <Text className="text-text font-sans text-base opacity-70 mt-2">
        Tratamientos, alergias, etc. de tu mascota
      </Text>
    </View>
  );
}
