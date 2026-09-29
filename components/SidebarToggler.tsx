import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";

interface SidebarTogglerProps {
  nombreMascota?: string;
}

export function SidebarToggler({
  nombreMascota = "Canela",
}: SidebarTogglerProps) {
  const navigation = useNavigation();

  const handleToggleSidebar = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <Pressable
      onPress={handleToggleSidebar}
      className="flex-row justify-between gap-2 rounded-full border bg-white px-6 py-4 shadow-sm active:opacity-80"
    >
      <Ionicons name="menu" size={20} color="#000000" />
      <Text className="align-middle font-sans-semibold text-sm text-[#000000]">
        {nombreMascota}
      </Text>
    </Pressable>
  );
}
