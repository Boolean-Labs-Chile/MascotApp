import { ButtonCard } from "@/components/ButtonCard";
import { EditButton } from "@/components/EditButton";
import { ImageSelector } from "@/components/ImageSelector";
import { SidebarToggler } from "@/components/SidebarToggler";
import { StatCard } from "@/components/StatCard";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const handleCardPress = (section: string) => {
    console.log(`Abrir sección: ${section}`);
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-between bg-background">
      <View className="my-2 w-full flex-row items-center justify-between px-4">
        <SidebarToggler nombreMascota="Canela" />
        <EditButton onPress={() => console.log("Edit button pressed")} />
      </View>
      <ImageSelector
        imageUri={selectedImage}
        onImageSelected={setSelectedImage}
      />
      <Text className="font-sans-bold text-2xl text-text">Canela</Text>
      <Text className="mb-1 font-sans text-base text-text opacity-70">
        Gato
      </Text>
      <View className="my-4 flex-row gap-4 px-4 py-2">
        <StatCard label="Edad" value="2 años" />
        <StatCard label="Esterilizado/a" value="Sí" />
        <StatCard label="Género" value="Hembra" />
      </View>
      <View className="mt-4 w-full justify-between gap-3 px-4">
        <View>
          <ButtonCard
            title="Chip Electrónico"
            iconName="memory"
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
            iconName="bacteria-outline"
            iconFamily="material"
            onPress={() => handleCardPress("Alergias")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
