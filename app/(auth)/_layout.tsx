import { Stack } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";

export default function AuthLayout() {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "android" ? "padding" : "height"}
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="registrarse" />
      </Stack>
    </KeyboardAvoidingView>
  );
}
