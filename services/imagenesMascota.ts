import { Directory, File, Paths } from "expo-file-system";
import { validarImagen } from "@/utils/image_validacion";

export interface AlmacenamientoImagenes {
  guardar(uri: string): Promise<string>;
  eliminar(uri: string): Promise<void>;
}

export const almacenamientoImagenes: AlmacenamientoImagenes = {
  async guardar(uri) {
    const validacion = await validarImagen(uri);
    if (!validacion.valido) throw new Error(validacion.mensaje);
    const carpeta = new Directory(Paths.document, "mascotas");
    carpeta.create({ intermediates: true, idempotent: true });
    const destino = new File(
      carpeta,
      `${Date.now()}-${Math.random().toString(36).slice(2)}.${validacion.extension}`,
    );
    if (destino.exists)
      throw new Error(
        "No se pudo generar un nombre único para la foto. Reintenta.",
      );
    try {
      new File(uri).copy(destino);
      return destino.uri;
    } catch (error) {
      try {
        if (destino.exists) destino.delete();
      } catch {}
      throw error;
    }
  },
  async eliminar(uri) {
    if (!uri.startsWith("file://")) return;
    const archivo = new File(uri);
    const carpeta = new Directory(Paths.document, "mascotas");
    if (archivo.parentDirectory.uri === carpeta.uri && archivo.exists)
      archivo.delete();
  },
};
