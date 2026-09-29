import type { SQLiteDatabase } from "expo-sqlite";

export interface UsuarioLocal {
  id_usuario: number;
  nombre: string;
}

export async function inicializarUsuarioLocal(
  db: SQLiteDatabase,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    const tx = db;
    await tx.execAsync(`
      CREATE TABLE IF NOT EXISTS perfil_local (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        id_usuario INTEGER NOT NULL UNIQUE,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE RESTRICT
      );
    `);
    const perfil = await tx.getFirstAsync<{ id_usuario: number }>(
      "SELECT id_usuario FROM perfil_local WHERE id = 1",
    );
    if (perfil) return;

    const existente = await tx.getFirstAsync<UsuarioLocal>(
      "SELECT id_usuario, nombre FROM usuario ORDER BY id_usuario LIMIT 1",
    );
    const idUsuario = existente
      ? existente.id_usuario
      : (
          await tx.runAsync(
            "INSERT INTO usuario (nombre) VALUES (?)",
            "Mi perfil",
          )
        ).lastInsertRowId;
    await tx.runAsync(
      "INSERT INTO perfil_local (id, id_usuario) VALUES (1, ?)",
      idUsuario,
    );
  });
}

export async function obtenerUsuarioLocal(
  db: Pick<SQLiteDatabase, "getFirstAsync">,
): Promise<UsuarioLocal> {
  const usuario = await db.getFirstAsync<UsuarioLocal>(
    `SELECT u.id_usuario, u.nombre FROM usuario u
     INNER JOIN perfil_local p ON p.id_usuario = u.id_usuario WHERE p.id = 1`,
  );
  if (!usuario)
    throw new Error("El perfil local todavía no se ha inicializado.");
  return usuario;
}
