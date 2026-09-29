import { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
}

export default function Input({
  label,
  error,
  onChangeText,
  isPassword,
  className = "",
  multiline = false,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4 w-full">
      {/* Etiqueta del campo */}
      {label && (
        <Text className="mb-1 text-sm font-semibold text-text">{label}</Text>
      )}
      {/* Campo de entrada */}
      <View className="relative justify-center">
        <TextInput
          {...props}
          onChangeText={onChangeText}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          className={`border bg-white ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-xl px-4 text-base font-normal text-text ${
            multiline ? "min-h-[100px] py-3" : "py-3"
          } ${isPassword ? "pr-20" : ""} ${className}`}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
        />
        {/* Botón para alternar visibilidad de contraseña */}
        {isPassword && (
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text className="text-xs font-semibold text-text opacity-60">
              {showPassword ? "Ocultar" : "Mostrar"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Mensaje de error */}
      {error && (
        <Text className="mt-1 text-xs font-normal text-red-500">{error}</Text>
      )}
    </View>
  );
}
