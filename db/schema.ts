import type { SQLiteDatabase } from "expo-sqlite";

export const DATABASE_NAME = "mascotapp.db";

const DATABASE_VERSION = 2;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync("PRAGMA foreign_keys = ON;");
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  let currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
            CREATE TABLE IF NOT EXISTS usuario (
                id_usuario integer primary key autoincrement,
                nombre text not null,
                telefono Text,
                correo Text,
                direccion Text,
                contacto_emergencia Text
            
            );

            CREATE TABLE IF NOT EXISTS mascota (
                id_mascota integer primary key autoincrement,
                id_usuario integer not null,
                nombre text not null,
                edad integer,
                genero text not null check (genero IN ('macho','hembra')),
                estado_esterilizacion integer default 0 check (estado_esterilizacion in (0,1)),
                tipo_animal Text,
                imagen_perfil text check (
                   imagen_perfil is null
                   or imagen_perfil like '%.jpg'
                   or imagen_perfil like '%.jpeg'
                   or imagen_perfil like '%.png'
                   or imagen_perfil like '%.webp'
                   or imagen_perfil like 'file://%'
                   or imagen_perfil like 'content://%'
                   or imagen_perfil like 'http%'   
                ),
                numero_chip Text,
                pasaporte Text,
                rasgos Text,
                foreign key (id_usuario) references usuario (id_usuario) on delete cascade 
            );
            
            CREATE TABLE IF NOT EXISTS tratamiento (
                id_tratamiento integer primary key autoincrement,
                id_mascota integer not null,
                nombre_producto text not null,
                fecha_aplicacion Text,
                fecha_siguiente_dosis Text,
                tipo_tratamiento text check (tipo_tratamiento in ('interno','externo')),
                foreign key (id_mascota) references mascota (id_mascota) on delete cascade 

            );
         `);

    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
                ALTER TABLE mascota ADD COLUMN fecha_nacimiento TEXT;
                ALTER TABLE mascota ADD COLUMN fecha_adopcion TEXT;
                ALTER TABLE mascota ADD COLUMN color TEXT;
                ALTER TABLE mascota ADD COLUMN raza TEXT;
                PRAGMA user_version = 2;
            `);
    });
  }
}
