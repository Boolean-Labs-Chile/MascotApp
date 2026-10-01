import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

export interface ImageSelectorProps {
  imageUri: string | null;
  onImageSelected: (uri: string | null) => void;
}

export function ImageSelector({
  imageUri,
  onImageSelected,
}: ImageSelectorProps) {
  const handleSelectPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tus fotos para elegir la imagen de tu mascota.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
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
