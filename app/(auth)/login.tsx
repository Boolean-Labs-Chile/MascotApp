import Button from "@/components/Button";
import Input from "@/components/Input";
import { auth } from "@/config/auth";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  // Estados locales para capturar las credenciales
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [iniciando, setIniciando] = useState(false);
  const inicioEnCurso = useRef(false);

  const handleLogin = async () => {
    // Aquí irá la lógica de autenticación o validación local
    if (inicioEnCurso.current) return;

    const correoLimpio = email.trim();

    if (!correoLimpio || !password) {
      Alert.alert("Iniciar sesión", "Introduce tu correo y contraseña.");
      return;
    }

    inicioEnCurso.current = true;
    setIniciando(true);

    try {
      await signInWithEmailAndPassword(auth, correoLimpio, password);

      setPassword("");
    } catch (error) {
      let mensaje = "No se pudo iniciar sesión. Inténtalo nuevamente.";

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-email":
            mensaje = "Introduce un correo electrónico válido.";
            break;
          case "auth/invalid-credential":
          case "auth/user-not-found":
          case "auth/wrong-password":
            mensaje = "El correo o la contraseña son incorrectos.";
            break;
          case "auth/user-disabled":
            mensaje = "Esta cuenta está deshabilitada.";
            break;
          case "auth/network-request-failed":
            mensaje = "No se pudo conectar con Firebase. Revisa tu conexión.";
            break;
          case "auth/too-many-requests":
            mensaje = "Hubo demasiados intentos. Espera antes de reintentar.";
            break;
          case "auth/operation-not-allowed":
            mensaje = "El acceso con correo y contraseña no está habilitado.";
            break;
        }
      }

      Alert.alert("Iniciar sesión", mensaje);
    } finally {
      inicioEnCurso.current = false;
      setIniciando(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
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
        <Button
          label={iniciando ? "Ingresando..." : "Iniciar Sesión"}
          onPress={handleLogin}
        />
      </View>
    </SafeAreaView>
  );
}
