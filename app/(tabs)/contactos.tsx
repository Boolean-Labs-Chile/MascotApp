import { Text, View } from "react-native";

export default function Contactos() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="font-sans-bold text-2xl text-text">Contactos</Text>
      <Text className="mt-2 font-sans text-base text-text opacity-70">
        Datos del dueño de la mascota, copropietario, etc. (Nombre, teléfono,
        correo electrónico, etc.)
      </Text>
    </View>
  );
}
