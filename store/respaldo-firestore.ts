import { auth } from "@/config/auth";
import { firestore, storage } from "@/config/firebase";
import { File } from "expo-file-system";
import type { SQLiteDatabase } from "expo-sqlite";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import type { Mascota } from "./mascotas";

function obtenerBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const solicitud = new XMLHttpRequest();

    solicitud.onload = () => {
      resolve(solicitud.response as Blob);
    };

    solicitud.onerror = () => {
      reject(new Error("No se pudo leer la foto seleccionada."));
    };

    solicitud.responseType = "blob";
    solicitud.open("GET", uri, true);
    solicitud.send(null);
  });
}

export async function respaldarMascota(db: SQLiteDatabase, idMascota: number) {
  const usuario = auth.currentUser;
  if (!usuario) return;

  const mascota = await db.getFirstAsync<Mascota>(
    "SELECT * FROM mascota WHERE id_mascota = ?",
    idMascota,
  );
  if (!mascota) return;

  const documentoMascota = doc(
    firestore,
    "usuarios",
    usuario.uid,
    "mascotas",
    String(idMascota),
  );

  await setDoc(documentoMascota, {
    nombre: mascota.nombre,
    genero: mascota.genero,
    esterilizado: mascota.estado_esterilizacion === 1,
    tipo_animal: mascota.tipo_animal,
    raza: mascota.raza,
    color: mascota.color,
    rasgos: mascota.rasgos,
    fecha_nacimiento: mascota.fecha_nacimiento,
    fecha_adopcion: mascota.fecha_adopcion,
    tiene_foto: Boolean(mascota.imagen_perfil),
    foto_url: null,
    actualizado_en: serverTimestamp(),
  });

  if (!mascota.imagen_perfil) return;

  const archivo = new File(mascota.imagen_perfil);
  if (!archivo.exists) return;

  const referencia = ref(
    storage,
    `usuarios/${usuario.uid}/mascotas/${idMascota}/perfil`,
  );

  await uploadBytes(referencia, await obtenerBlob(mascota.imagen_perfil), {
    contentType: archivo.type || "image/jpeg",
  });

  const fotoUrl = await getDownloadURL(referencia);

  await setDoc(
    documentoMascota,
    {
      foto_url: fotoUrl,
      actualizado_en: serverTimestamp(),
    },
    { merge: true },
  );
}
