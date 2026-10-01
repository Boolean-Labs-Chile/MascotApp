import type { ImagePickerAsset } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface ImageSelectorProps {
  imageUri: string | null;
  onImageSelected: (asset: ImagePickerAsset) => void;
}

export function ImageSelector({
  imageUri,
  onImageSelected,
}: ImageSelectorProps) {
  const handleSelectPhoto = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permiso denegado",
            "Necesitamos acceso a tus fotos para elegir la imagen de tu mascota.",
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: Platform.OS === "web",
      });

      if (!result.canceled) {
        onImageSelected(result.assets[0]);
      }
    } catch {
      const mensaje = "No se pudo abrir la foto. Vuelve a intentarlo.";
      if (Platform.OS === "web") window.alert(mensaje);
      else Alert.alert("Mascota", mensaje);
    }
  };

  return (
    <View className="mb-4 items-center">
      <TouchableOpacity
        onPress={handleSelectPhoto}
        className="h-60 w-60 items-center justify-center overflow-hidden rounded-full border-2 border-button-dark bg-gray-200"
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="h-full w-full" />
        ) : (
          <Text className="text-text">Seleccionar Foto</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
