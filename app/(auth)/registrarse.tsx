import Button from "@/components/Button";
import Input from "@/components/Input";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Registrarse() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    // Aquí irá la lógica de registro
    console.log("Registrando:", { nombre, email, password });
    router.replace("/mascota-nueva");
  };

  return (
    <View className="flex-1 bg-background">
      <TouchableOpacity
        className="mt-6 items-center"
        onPress={() => router.back()}
      >
        <Text className="text-sm font-semibold text-text opacity-80">
          Volver al inicio
        </Text>
      </TouchableOpacity>

      <View className="flex-1 justify-center px-8">
        <View className="mb-8">
          <Text className="mb-2 text-3xl font-bold text-text">
            ¡Crea tu cuenta!
          </Text>
          <Text className="text-base font-normal text-text opacity-70">
            Regístrate para comenzar a usar la app
          </Text>
        </View>

        <Input
          label="Nombre"
          placeholder="Tu nombre"
          value={nombre}
          onChangeText={setNombre}
        />

        <Input
          label="Correo electrónico"
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Input
          label="Contraseña"
          placeholder="********"
          isPassword
          value={password}
          onChangeText={setPassword}
        />

        <Input
          label="Confirmar contraseña"
          placeholder="********"
          isPassword
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Button label="Crear cuenta" onPress={handleRegister} />
      </View>
    </View>
  );
}
