import Button from "@/components/Button";
import Input from "@/components/Input";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Login() {
  const router = useRouter();

  // Estados locales para capturar las credenciales
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Aquí irá la lógica de autenticación o validación local
    console.log("Iniciar sesión con:", email, password);
    router.replace("/(tabs)/perfil");
  };

  return (
    <View className="flex-1 bg-background">
      {/* Enlace para regresar a la pantalla de bienvenida o registro */}
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
            ¡Bienvenido de nuevo!
          </Text>
          <Text className="text-base font-normal text-text opacity-70">
            Ingresa tus datos para acceder a la app
          </Text>
        </View>

        {/* Formulario */}
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

        {/* Botón Acción Principal */}
        <Button label="Iniciar Sesión" onPress={handleLogin} />
      </View>
    </View>
  );
}
