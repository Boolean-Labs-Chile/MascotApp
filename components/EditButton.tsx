import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

interface EditButtonProps {
  onPress?: () => void;
}

export function EditButton({ onPress }: EditButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center justify-center p-2 active:opacity-70"
    >
      <Ionicons name="pencil" size={28} color="#022f2e" />
    </Pressable>
  );
}
