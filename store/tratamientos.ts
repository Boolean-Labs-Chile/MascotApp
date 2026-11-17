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

export const MAX_ANIOS_SIGUIENTE_DOSIS = 3;
export const MAX_ANIOS_VENCIMIENTO = 5;

// Segundos máximos que se espera la confirmación de Firestore antes de dar
// el respaldo por no realizado (por ejemplo, sin internet).
const ESPERA_RESPALDO_MS = 5000;

function fechaLimite(aniosDesdeHoy: number) {
  const limite = new Date();
  limite.setFullYear(limite.getFullYear() + aniosDesdeHoy);
  return limite;
}

function aTexto(fecha: Date) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function fechaMaximaSiguienteDosis() {
  return fechaLimite(MAX_ANIOS_SIGUIENTE_DOSIS);
}

export function fechaMaximaVencimiento() {
  return fechaLimite(MAX_ANIOS_VENCIMIENTO);
}

export function validarFechasTratamiento(datos: DatosTratamiento) {
  if (
    datos.fechaSiguienteDosis &&
    datos.fechaSiguienteDosis > aTexto(fechaMaximaSiguienteDosis())
  ) {
    return `La siguiente dosis no puede ser a más de ${MAX_ANIOS_SIGUIENTE_DOSIS} años desde hoy.`;
  }

  if (
    datos.fechaVencimiento &&
    datos.fechaVencimiento > aTexto(fechaMaximaVencimiento())
  ) {
    return `La fecha de vencimiento no puede ser a más de ${MAX_ANIOS_VENCIMIENTO} años desde hoy.`;
  }

  return null;
}

function conLimiteDeTiempo<T>(promesa: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const temporizador = setTimeout(
      () => reject(new Error("Tiempo de espera agotado")),
      ms,
    );

    promesa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolve(valor);
      },
      (error) => {
        clearTimeout(temporizador);
        reject(error);
      },
    );
  });
}

// Copia el tratamiento a Firestore en usuarios/{uid}/tratamientos/{id}.
// SQLite sigue siendo la base principal: si esto falla o tarda demasiado,
// el tratamiento igual queda guardado en el teléfono.
async function respaldarTratamiento(
  idMascota: number,
  idTratamiento: number,
  datos: DatosTratamiento,
  esNuevo: boolean,
) {
  const usuarioFirebase = auth.currentUser;

  if (!usuarioFirebase) return false;

  try {
    await conLimiteDeTiempo(
      setDoc(
        doc(
          firestore,
          "usuarios",
          usuarioFirebase.uid,
          "tratamientos",
          String(idTratamiento),
        ),
        {
          idTratamientoLocal: idTratamiento,
          idMascotaLocal: idMascota,
          nombreProducto: datos.nombreProducto,
          fechaAplicacion: datos.fechaAplicacion,
          fechaVencimiento: datos.fechaVencimiento,
          fechaSiguienteDosis: datos.fechaSiguienteDosis,
          comentarios: datos.comentarios,
          ...(esNuevo ? { creadoEn: serverTimestamp() } : {}),
          actualizadoEn: serverTimestamp(),
        },
        { merge: true },
      ),
      ESPERA_RESPALDO_MS,
    );

    return true;
  } catch {
    return false;
  }
}

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
  if (validarFechasTratamiento(datos)) {
    return { guardado: false, respaldadoFirestore: false };
  }

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

  const respaldadoFirestore = await respaldarTratamiento(
    idMascota,
    resultado.lastInsertRowId,
    datos,
    true,
  );

  return { guardado: true, respaldadoFirestore };
}

export async function actualizarTratamiento(
  db: SQLiteDatabase,
  idMascota: number,
  idTratamiento: number,
  datos: DatosTratamiento,
): Promise<ResultadoGuardarTratamiento> {
  if (validarFechasTratamiento(datos)) {
    return { guardado: false, respaldadoFirestore: false };
  }

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

  if (resultado.changes !== 1) {
    return { guardado: false, respaldadoFirestore: false };
  }

  const respaldadoFirestore = await respaldarTratamiento(
    idMascota,
    idTratamiento,
    datos,
    false,
  );

  return { guardado: true, respaldadoFirestore };
}
