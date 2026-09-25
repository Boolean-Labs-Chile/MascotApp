import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Pressable, Text, View } from "react-native";

interface Props {
  imagenUri: string | null;
  onImagenSeleccionada: (uri: string) => void;
}

export function SelectorImagenPerfil({
  imagenUri,
  onImagenSeleccionada,
}: Props) {
  async function elegirImagen() {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tu galeria para elegir la imagen de la mascota."
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!resultado.canceled) {
      onImagenSeleccionada(resultado.assets[0].uri);
    }
  }

  return (
    <View className="items-center mb-6">
      <Pressable onPress={elegirImagen}>
        {imagenUri ? (
          <Image
            source={{ uri: imagenUri }}
            className="w-36 h-36 rounded-full"
          />
        ) : (
          <View className="w-36 h-36 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-gray-500 text-sm text-center px-2">
              Toca para{"\n"}elegir foto
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
