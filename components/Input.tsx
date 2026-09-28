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
        <Text className="text-text font-semibold text-sm mb-1">{label}</Text>
      )}
      {/* Campo de entrada */}
      <View className="relative justify-center">
        <TextInput
          {...props}
          onChangeText={onChangeText}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          className={`bg-white border ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-xl px-4 text-text font-normal text-base ${
            multiline ? "py-3 min-h-[100px]" : "py-3"
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
            <Text className="text-xs text-text opacity-60 font-semibold">
              {showPassword ? "Ocultar" : "Mostrar"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Mensaje de error */}
      {error && (
        <Text className="text-red-500 text-xs mt-1 font-normal">{error}</Text>
      )}
    </View>
  );
}
