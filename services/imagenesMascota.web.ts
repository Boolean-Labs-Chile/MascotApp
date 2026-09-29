import { detectarFormato } from "@/utils/formatoImagen";

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const solicitud = indexedDB.open("mascotapp-fotos", 1);
    solicitud.onupgradeneeded = () =>
      solicitud.result.createObjectStore("fotos");
    solicitud.onsuccess = () => resolve(solicitud.result);
    solicitud.onerror = () =>
      reject(new Error("No se pudo abrir el almacenamiento de fotos."));
  });
}

async function operar<T>(
  modo: IDBTransactionMode,
  accion: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await abrir();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction("fotos", modo);
      const request = accion(tx.objectStore("fotos"));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () =>
        reject(
          tx.error ??
            new Error(
              "No se pudo guardar la foto. Revisa el espacio del navegador.",
            ),
        );
      tx.onerror = () =>
        reject(tx.error ?? new Error("Falló el almacenamiento de fotos."));
    });
  } finally {
    db.close();
  }
}

export async function leerFotoWeb(uri: string): Promise<Blob> {
  const foto = await operar<Blob | undefined>("readonly", (store) =>
    store.get(uri),
  );
  if (!foto)
    throw new Error("La foto ya no está disponible en este navegador.");
  return foto;
}

export const almacenamientoImagenes = {
  async guardar(uri: string): Promise<string> {
    if (
      !uri.startsWith("blob:") &&
      !uri.startsWith("data:image/") &&
      !uri.startsWith("mascot-photo://")
    )
      throw new Error("Selecciona una foto de tu dispositivo.");
    const foto = uri.startsWith("mascot-photo://")
      ? await leerFotoWeb(uri)
      : await (await fetch(uri)).blob();
    if (foto.size === 0 || foto.size > 5 * 1024 * 1024)
      throw new Error("La foto debe pesar entre 1 byte y 5 MB.");
    const extension = detectarFormato(
      new Uint8Array(await foto.slice(0, 12).arrayBuffer()),
    );
    if (!extension) throw new Error("Usa una imagen JPG, PNG o WebP.");
    const id = `mascot-photo://${crypto.randomUUID()}.${extension}`;
    await operar("readwrite", (store) => store.put(foto, id));
    return id;
  },
  async eliminar(uri: string): Promise<void> {
    if (uri.startsWith("mascot-photo://"))
      await operar("readwrite", (store) => store.delete(uri));
  },
};
