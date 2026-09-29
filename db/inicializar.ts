import type { SQLiteDatabase } from "expo-sqlite";
import { migrateDbIfNeeded } from "@/db/schema";
import { inicializarUsuarioLocal } from "@/db/usuarioLocal";

export async function inicializarBaseDeDatos(
  db: SQLiteDatabase,
): Promise<void> {
  await migrateDbIfNeeded(db);
  await inicializarUsuarioLocal(db);
}
