import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

//!!!!!!!!!!!!!!!
// Colores sólidos para el estado deshabilitado. Se ven igual que "bg-white" y
// "text-text" al 50 % de opacidad sobre el fondo de la app (#cbfbf1), pero sin
// transparencia real: en Android, opacity + sombra (elevation) dibuja una
// franja clara en el medio de la card.
const COLOR_TEXTO = "#022f2e";
const COLOR_TEXTO_DESHABILITADO = "#739693";

export interface ButtonCardProps {
  title: string;
  iconName: string;
  iconFamily?: "ionicons" | "material";
  onPress: () => void;
  disabled?: boolean;
}

export function ButtonCard({
  title,
  iconName,
  iconFamily = "ionicons",
  onPress,
  disabled = false,
}: ButtonCardProps) {
  const IconComponent =
    iconFamily === "ionicons" ? Ionicons : MaterialCommunityIcons;
  const colorContenido = disabled ? COLOR_TEXTO_DESHABILITADO : COLOR_TEXTO;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`mb-4 w-full flex-row items-center justify-between rounded-3xl border border-text/10 p-4 ${
        disabled ? "bg-[#e5fdf8]" : "bg-white shadow-sm active:opacity-80"
      }`}
    >
      {/* Contenedor de Ícono + Título */}
      <View className="flex-row items-center gap-4">
        <IconComponent
          name={iconName as any}
          size={24}
          color={colorContenido}
        />
        <Text
          className={`font-sans-semibold text-lg ${
            disabled ? "text-[#739693]" : "text-text"
          }`}
        >
          {title}
        </Text>
      </View>
      <Ionicons name="add" size={24} color={colorContenido} />
    </Pressable>
  );
}
