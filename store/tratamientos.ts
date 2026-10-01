import type { SQLiteDatabase } from "expo-sqlite";

export type Tratamiento = {
  id: number;
  nombreProducto: string;
  fechaAplicacion: string;
  fechaVencimiento: string;
  fechaSiguienteDosis: string;
  comentarios: string;
};

export type DatosTratamiento = {
  nombreProducto: string;
  fechaAplicacion: string;
  fechaVencimiento: string;
  fechaSiguienteDosis: string;
  comentarios: string;
};

export async function obtenerTratamientos(
  db: SQLiteDatabase,
  idMascota: number,
) {
  return db.getAllAsync<Tratamiento>(
    `SELECT
      t.id_tratamiento AS id,
      t.nombre_producto AS nombreProducto,
      COALESCE(t.fecha_aplicacion, '') AS fechaAplicacion,
      COALESCE(t.fecha_vencimiento, '') AS fechaVencimiento,
      COALESCE(t.fecha_siguiente_dosis, '') AS fechaSiguienteDosis,
      COALESCE(t.comentarios, '') AS comentarios
    FROM tratamiento t
    INNER JOIN mascota m ON m.id_mascota = t.id_mascota
    WHERE t.id_mascota = ?
      AND m.id_usuario = (
        SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1
      )
    ORDER BY t.fecha_aplicacion DESC, t.id_tratamiento DESC`,
    idMascota,
  );
}

export async function guardarTratamiento(
  db: SQLiteDatabase,
  idMascota: number,
  datos: DatosTratamiento,
) {
  const resultado = await db.runAsync(
    `INSERT INTO tratamiento (
      id_mascota,
      nombre_producto,
      fecha_aplicacion,
      fecha_vencimiento,
      fecha_siguiente_dosis,
      comentarios
    )
    SELECT id_mascota, ?, ?, ?, ?, ?
    FROM mascota
    WHERE id_mascota = ?
      AND id_usuario = (
        SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1
      )`,
    datos.nombreProducto,
    datos.fechaAplicacion,
    datos.fechaVencimiento,
    datos.fechaSiguienteDosis,
    datos.comentarios,
    idMascota,
  );

  return resultado.changes === 1;
}
