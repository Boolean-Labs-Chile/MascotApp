import { auth } from "@/config/auth";
import type { SQLiteDatabase } from "expo-sqlite";

export async function obtenerIdUsuarioLocal(
  db: SQLiteDatabase,
): Promise<number> {
  const usuarioFirebase = auth.currentUser;

  if (!usuarioFirebase) {
    throw new Error("Debes iniciar sesión para acceder a tus datos.");
  }

  const uid = usuarioFirebase.uid;

  // displayName puede llegar vacío justo después del registro, porque
  // onAuthStateChanged se dispara antes de que termine updateProfile.
  // Por eso el nombre se actualiza en las siguientes llamadas, cuando ya existe.
  const nombre = usuarioFirebase.displayName?.trim() || null;

  await db.runAsync(
    `INSERT INTO usuario (nombre, correo, firebase_uid)
     VALUES (COALESCE(?, 'Mi perfil'), ?, ?)
     ON CONFLICT(firebase_uid) DO UPDATE SET
       nombre = COALESCE(?, usuario.nombre),
       correo = excluded.correo`,
    nombre,
    usuarioFirebase.email,
    uid,
    nombre,
  );

  const usuarioLocal = await db.getFirstAsync<{ id_usuario: number }>(
    "SELECT id_usuario FROM usuario WHERE firebase_uid = ?",
    uid,
  );

  if (!usuarioLocal) {
    throw new Error("No se pudo obtener el usuario local.");
  }

  return usuarioLocal.id_usuario;
}