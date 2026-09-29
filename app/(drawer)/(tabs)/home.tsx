import { ButtonCard } from "@/components/ButtonCard";
import { EditButton } from "@/components/EditButton";
import { SidebarToggler } from "@/components/SidebarToggler";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const handleCardPress = (section: string) => {
    console.log(`Abrir sección: ${section}`);
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-between bg-background">
      <View className="mt-4 w-full flex-row items-center justify-between px-4">
        <SidebarToggler nombreMascota="Canela" />
        <EditButton onPress={() => console.log("Edit button pressed")} />
      </View>
      <Text className="font-sans-bold text-2xl text-text">
        Página Principal
      </Text>
      <Text className="mt-2 font-sans text-base text-text opacity-70">
        Bienvenido a MascotApp
      </Text>
      <View className="mt-6 w-full px-4">
        <View>
          <ButtonCard
            title="Chip Electrónico"
            iconName="chip"
            iconFamily="material"
            onPress={() => handleCardPress("Chip Electrónico")}
          />
        </View>
        <View>
          <ButtonCard
            title="Pasaporte"
            iconName="passport"
            iconFamily="material"
            onPress={() => handleCardPress("Pasaporte")}
          />
        </View>
        <View>
          <ButtonCard
            title="Alergias"
            iconName="bacteria"
            iconFamily="material"
            onPress={() => handleCardPress("Alergias")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
