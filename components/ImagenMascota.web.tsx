import { Image as ExpoImage, type ImageProps } from "expo-image";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { leerFotoWeb } from "@/services/imagenesMascota.web";

export function Image(props: ImageProps) {
  const source = props.source;
  const uri =
    source &&
    typeof source === "object" &&
    !Array.isArray(source) &&
    "uri" in source
      ? source.uri
      : undefined;
  const [foto, setFoto] = useState<{ uri: string; url: string } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false);
    if (!uri?.startsWith("mascot-photo://")) return;
    let vigente = true;
    let url: string | undefined;
    void leerFotoWeb(uri)
      .then((blob) => {
        if (!vigente) return;
        url = URL.createObjectURL(blob);
        setFoto({ uri, url });
      })
      .catch(() => {
        if (vigente) setError(true);
      });
    return () => {
      vigente = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [uri]);
  if (!uri?.startsWith("mascot-photo://")) return <ExpoImage {...props} />;
  if (error)
    return (
      <View style={props.style}>
        <Text>Foto no disponible</Text>
      </View>
    );
  return (
    <ExpoImage
      {...props}
      source={foto?.uri === uri ? { uri: foto.url } : undefined}
    />
  );
}
