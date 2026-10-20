import type { SQLiteDatabase } from "expo-sqlite";

export async function inicializarBase(db: SQLiteDatabase) {
  await db.execAsync("PRAGMA foreign_keys = ON;");
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS usuario (
        id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL, telefono TEXT, correo TEXT,
        direccion TEXT, contacto_emergencia TEXT
      );
      CREATE TABLE IF NOT EXISTS mascota (
        id_mascota INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        nombre TEXT NOT NULL, edad INTEGER,
        genero TEXT NOT NULL CHECK (genero IN ('macho','hembra')),
        estado_esterilizacion INTEGER DEFAULT 0 CHECK (estado_esterilizacion IN (0,1)),
        tipo_animal TEXT,
        imagen_perfil TEXT CHECK (
          imagen_perfil IS NULL OR imagen_perfil LIKE '%.jpg'
          OR imagen_perfil LIKE '%.jpeg' OR imagen_perfil LIKE '%.png'
          OR imagen_perfil LIKE '%.webp' OR imagen_perfil LIKE 'file://%'
          OR imagen_perfil LIKE 'content://%' OR imagen_perfil LIKE 'http%'
        ),
        numero_chip TEXT, pasaporte TEXT, rasgos TEXT
      );
      CREATE TABLE IF NOT EXISTS tratamiento (
        id_tratamiento INTEGER PRIMARY KEY AUTOINCREMENT,
        id_mascota INTEGER NOT NULL REFERENCES mascota(id_mascota) ON DELETE CASCADE,
        nombre_producto TEXT NOT NULL, fecha_aplicacion TEXT,
        fecha_siguiente_dosis TEXT,
        tipo_tratamiento TEXT CHECK (tipo_tratamiento IN ('interno','externo'))
      );
    `);
    const columnas = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info(mascota)",
    );
    for (const columna of [
      "fecha_nacimiento",
      "fecha_adopcion",
      "color",
      "raza",
      "imagen_web",
    ]) {
      if (!columnas.some(({ name }) => name === columna)) {
        await db.execAsync(`ALTER TABLE mascota ADD COLUMN ${columna} TEXT`);
      }
    }
    const columnasTratamiento = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info(tratamiento)",
    );

    for (const columna of ["fecha_vencimiento", "comentarios"]) {
      if (!columnasTratamiento.some(({ name }) => name === columna)) {
        await db.execAsync(
          `ALTER TABLE tratamiento ADD COLUMN ${columna} TEXT`,
        );
      }
    }
    const columnasUsuario = await db.getAllAsync<{ name: string }>(
      "PRAGMA table_info(usuario)",
    );

    if (!columnasUsuario.some(({ name }) => name === "firebase_uid")) {
      await db.execAsync("ALTER TABLE usuario ADD COLUMN firebase_uid TEXT");
    }

    // Cada cuenta de Firebase tiene un único usuario local. Ese usuario se
    // crea al iniciar sesión (store/usuarios.ts), no aquí: así no quedan
    // usuarios sin firebase_uid en instalaciones nuevas.
    await db.execAsync(
      "CREATE UNIQUE INDEX IF NOT EXISTS usuario_firebase_uid_unico ON usuario(firebase_uid)",
    );
  });
}
