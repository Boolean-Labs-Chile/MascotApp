import Button from "@/components/Button";
import Input from "@/components/Input";
import { auth } from "@/config/auth";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Registrarse() {

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const registroEnCurso = useRef(false);

  const handleRegister = async () => {
    // Aquí irá la lógica de registro
    if (registroEnCurso.current) return;

    const nombreLimpio = nombre.trim();
    const correoLimpio = email.trim();

    if (!nombreLimpio || !correoLimpio || !password || !confirmPassword) {
      Alert.alert("Registro", "Completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Registro", "Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Registro",
        "La contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }

    registroEnCurso.current = true;
    setRegistrando(true);

    try {
      const credencial = await createUserWithEmailAndPassword(
        auth,
        correoLimpio,
        password,
      );

      let nombreGuardado = true;

      try {
        await updateProfile(credencial.user, {
          displayName: nombreLimpio,
        });
      } catch {
        nombreGuardado = false;
      }

      setPassword("");
      setConfirmPassword("");

      Alert.alert(
        "Cuenta creada",
        nombreGuardado
          ? "Tu cuenta se creó correctamente."
          : "Tu cuenta se creó, pero no se pudo guardar el nombre del perfil. No necesitas registrarte nuevamente.",
      );

    } catch (error) {
      let mensaje = "No se pudo crear la cuenta. Inténtalo nuevamente.";

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            mensaje = "Ese correo ya tiene una cuenta. Inicia sesión.";
            break;
          case "auth/invalid-email":
            mensaje = "Introduce un correo electrónico válido.";
            break;
          case "auth/weak-password":
          case "auth/password-does-not-meet-requirements":
            mensaje = "La contraseña no cumple los requisitos de seguridad.";
            break;
          case "auth/network-request-failed":
            mensaje = "No se pudo conectar con Firebase. Revisa tu conexión.";
            break;
          case "auth/too-many-requests":
            mensaje = "Hubo demasiados intentos. Espera un momento.";
            break;
          case "auth/operation-not-allowed":
            mensaje = "El registro con correo y contraseña no está habilitado.";
            break;
        }
      }

      Alert.alert("Registro", mensaje);
    } finally {
      registroEnCurso.current = false;
      setRegistrando(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
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
          editable={!registrando}
        />

        <Input
          label="Correo electrónico"
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          editable={!registrando}
        />

        <Input
          label="Contraseña"
          placeholder="********"
          isPassword
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
          editable={!registrando}
        />

        <Input
          label="Confirmar contraseña"
          placeholder="********"
          isPassword
          autoCapitalize="none"
          autoCorrect={false}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!registrando}
        />

        <Button
          label={registrando ? "Creando cuenta..." : "Crear cuenta"}
          onPress={handleRegister}
        />
      </View>
    </SafeAreaView>
  );
}