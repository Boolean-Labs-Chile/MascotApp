import { File } from "expo-file-system";
import { detectarFormato } from "@/utils/formatoImagen";
export { detectarFormato } from "@/utils/formatoImagen";

const MAXIMO_BYTES = 5 * 1024 * 1024;
export async function validarImagen(uri: string): Promise<{
  valido: boolean;
  mensaje?: string;
  extension?: "jpg" | "png" | "webp";
}> {
  if (!uri.startsWith("file://") && !uri.startsWith("content://")) {
    return {
      valido: false,
      mensaje: "Selecciona una imagen local del dispositivo.",
    };
  }
  try {
    const archivo = new File(uri);
    if (!archivo.exists || archivo.size <= 0)
      return { valido: false, mensaje: "La imagen no existe o está vacía." };
    if (archivo.size > MAXIMO_BYTES)
      return { valido: false, mensaje: "La imagen pesa más de 5 MB." };
    const extension = detectarFormato(await archivo.bytes());
    if (!extension)
      return { valido: false, mensaje: "Usa una imagen JPG, PNG o WebP." };
    return { valido: true, extension };
  } catch {
    return { valido: false, mensaje: "No se pudo leer la imagen." };
  }
}
