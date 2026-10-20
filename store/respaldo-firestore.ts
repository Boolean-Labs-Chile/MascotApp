import { auth } from "@/config/auth";
import { firestore } from "@/config/firebase";
import type { SQLiteDatabase } from "expo-sqlite";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import type { Mascota } from "./mascotas";

// Copia una mascota de SQLite a Firestore en usuarios/{uid}/mascotas/{id}.
// SQLite sigue siendo la base principal: si esto falla (por ejemplo, sin
// internet), la mascota igual queda guardada en el teléfono.
export async function respaldarMascota(db: SQLiteDatabase, idMascota: number) {
  const usuario = auth.currentUser;
  if (!usuario) return;

  const mascota = await db.getFirstAsync<Mascota>(
    "SELECT * FROM mascota WHERE id_mascota = ?",
    idMascota,
  );
  if (!mascota) return;

  await setDoc(
    doc(firestore, "usuarios", usuario.uid, "mascotas", String(idMascota)),
    {
      nombre: mascota.nombre,
      genero: mascota.genero,
      esterilizado: mascota.estado_esterilizacion === 1,
      tipo_animal: mascota.tipo_animal,
      raza: mascota.raza,
      color: mascota.color,
      rasgos: mascota.rasgos,
      fecha_nacimiento: mascota.fecha_nacimiento,
      fecha_adopcion: mascota.fecha_adopcion,
      tiene_foto: Boolean(mascota.imagen_perfil || mascota.imagen_web),
      actualizado_en: serverTimestamp(),
    },
  );
}