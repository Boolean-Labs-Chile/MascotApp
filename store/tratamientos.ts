import { auth } from "@/config/auth";
import { firestore } from "@/config/firebase";
import type { SQLiteDatabase } from "expo-sqlite";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { obtenerIdUsuarioLocal } from "./usuarios";

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

type ResultadoGuardarTratamiento = {
  guardado: boolean;
  respaldadoFirestore: boolean;
};

export async function obtenerTratamientos(
  db: SQLiteDatabase,
  idMascota: number,
) {
  const idUsuario = await obtenerIdUsuarioLocal(db);

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
      AND m.id_usuario = ?
    ORDER BY t.fecha_aplicacion DESC, t.id_tratamiento DESC`,
    idMascota,
    idUsuario,
  );
}

export async function guardarTratamiento(
  db: SQLiteDatabase,
  idMascota: number,
  datos: DatosTratamiento,
): Promise<ResultadoGuardarTratamiento> {
  const idUsuario = await obtenerIdUsuarioLocal(db);

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
      AND id_usuario = ?`,
    datos.nombreProducto,
    datos.fechaAplicacion,
    datos.fechaVencimiento,
    datos.fechaSiguienteDosis,
    datos.comentarios,
    idMascota,
    idUsuario,
  );

  if (resultado.changes !== 1) {
    return { guardado: false, respaldadoFirestore: false };
  }

  const usuarioFirebase = auth.currentUser;

  if (!usuarioFirebase) {
    return { guardado: true, respaldadoFirestore: false };
  }

  try {
    await setDoc(
      doc(
        firestore,
        "usuarios",
        usuarioFirebase.uid,
        "tratamientos",
        String(resultado.lastInsertRowId),
      ),
      {
        idTratamientoLocal: resultado.lastInsertRowId,
        idMascotaLocal: idMascota,
        nombreProducto: datos.nombreProducto,
        fechaAplicacion: datos.fechaAplicacion,
        fechaVencimiento: datos.fechaVencimiento,
        fechaSiguienteDosis: datos.fechaSiguienteDosis,
        comentarios: datos.comentarios,
        creadoEn: serverTimestamp(),
      },
    );

    return { guardado: true, respaldadoFirestore: true };
  } catch {
    return { guardado: true, respaldadoFirestore: false };
  }
}

//*****REVISAR POR FAVOR******
export async function actualizarTratamiento(
  db: SQLiteDatabase,
  idMascota: number,
  idTratamiento: number,
  datos: DatosTratamiento,
) {
  const idUsuario = await obtenerIdUsuarioLocal(db);

  const resultado = await db.runAsync(
    `UPDATE tratamiento
     SET nombre_producto = ?,
         fecha_aplicacion = ?,
         fecha_vencimiento = ?,
         fecha_siguiente_dosis = ?,
         comentarios = ?
     WHERE id_tratamiento = ?
       AND id_mascota = ?
       AND id_mascota IN (
         SELECT id_mascota FROM mascota
         WHERE id_usuario = ?
       )`,
    datos.nombreProducto,
    datos.fechaAplicacion,
    datos.fechaVencimiento,
    datos.fechaSiguienteDosis,
    datos.comentarios,
    idTratamiento,
    idMascota,
    idUsuario,
  );

  return resultado.changes === 1;
}
