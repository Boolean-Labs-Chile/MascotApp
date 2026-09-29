import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

export interface ButtonCardProps {
  title: string;
  iconName: string;
  iconFamily?: "ionicons" | "material";
  onPress: () => void;
}

export function ButtonCard({
  title,
  iconName,
  iconFamily = "ionicons",
  onPress,
}: ButtonCardProps) {
  const IconComponent =
    iconFamily === "ionicons" ? Ionicons : MaterialCommunityIcons;

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 w-full flex-row items-center justify-between rounded-3xl border border-text/10 bg-white p-4 shadow-sm active:opacity-80"
    >
      {/* Contenedor de Ícono + Título */}
      <View className="flex-row items-center gap-4">
        <IconComponent name={iconName as any} size={24} color="#022f2e" />
        <Text className="font-sans-semibold text-lg text-text">{title}</Text>
      </View>
      <Ionicons name="add" size={24} color="#022f2e" />
    </Pressable>
  );
}
