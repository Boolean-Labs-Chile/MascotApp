import { Text, View } from "react-native";

export default function RegistroMedico() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="font-sans-bold text-2xl text-text">Registro Médico</Text>
      <Text className="mt-2 font-sans text-base text-text opacity-70">
        Tratamientos, alergias, etc. de tu mascota
      </Text>
    </View>
  );
}
