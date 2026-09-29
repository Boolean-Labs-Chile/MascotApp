import type { SQLiteDatabase } from "expo-sqlite";

export interface DatosMascota {
  nombre: string;
  genero: "macho" | "hembra";
  edad?: number | null;
  estado_esterilizacion?: 0 | 1;
  tipo_animal?: string | null;
  imagen_perfil?: string | null;
  numero_chip?: string | null;
  pasaporte?: string | null;
  rasgos?: string | null;
  fecha_nacimiento?: string | null;
  fecha_adopcion?: string | null;
  color?: string | null;
  raza?: string | null;
}

export type Mascota = Required<DatosMascota> & {
  id_mascota: number;
  id_usuario: number;
};
export type ConexionMascotas = Pick<
  SQLiteDatabase,
  "runAsync" | "getFirstAsync" | "getAllAsync"
>;

export function validarId(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new Error("El identificador debe ser un entero positivo.");
}

const camposTexto = [
  "tipo_animal",
  "imagen_perfil",
  "numero_chip",
  "pasaporte",
  "rasgos",
  "fecha_nacimiento",
  "fecha_adopcion",
  "color",
  "raza",
] as const;

function texto(valor: string | null | undefined) {
  return valor?.trim() || null;
}

function validarFecha(valor: string | null | undefined) {
  if (valor == null) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor))
    throw new Error("La fecha debe usar YYYY-MM-DD.");
  const fecha = new Date(`${valor}T00:00:00Z`);
  if (
    !Number.isFinite(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== valor
  ) {
    throw new Error("La fecha no es válida.");
  }
}

export function validarDatosMascota(datos: DatosMascota) {
  if (typeof datos.nombre !== "string" || !datos.nombre.trim())
    throw new Error("El nombre es obligatorio.");
  if (datos.genero !== "macho" && datos.genero !== "hembra")
    throw new Error("El género debe ser macho o hembra.");
  if (
    datos.edad != null &&
    (!Number.isSafeInteger(datos.edad) || datos.edad < 0)
  )
    throw new Error("La edad debe ser un entero no negativo.");
  if (
    datos.estado_esterilizacion !== undefined &&
    datos.estado_esterilizacion !== 0 &&
    datos.estado_esterilizacion !== 1
  )
    throw new Error("La esterilización debe ser 0 o 1.");
  for (const campo of camposTexto) {
    if (datos[campo] != null && typeof datos[campo] !== "string")
      throw new Error(`El campo ${campo} debe ser texto.`);
  }
  validarFecha(datos.fecha_nacimiento);
  validarFecha(datos.fecha_adopcion);
  if (
    datos.fecha_nacimiento &&
    datos.fecha_adopcion &&
    datos.fecha_adopcion < datos.fecha_nacimiento
  ) {
    throw new Error("La adopción no puede ser anterior al nacimiento.");
  }
}

function valores(datos: DatosMascota) {
  validarDatosMascota(datos);
  return [
    datos.nombre.trim(),
    datos.genero,
    datos.edad ?? null,
    datos.estado_esterilizacion ?? 0,
    ...camposTexto.map((campo) => texto(datos[campo])),
  ];
}

export async function crearMascota(
  db: ConexionMascotas,
  idUsuario: number,
  datos: DatosMascota,
): Promise<number> {
  validarId(idUsuario);
  const parametros = valores(datos);
  const usuario = await db.getFirstAsync(
    "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
    idUsuario,
  );
  if (!usuario)
    throw new Error(
      "El usuario no existe. Debe registrarse antes de crear mascotas.",
    );
  const resultado = await db.runAsync(
    `INSERT INTO mascota
    (nombre, genero, edad, estado_esterilizacion, tipo_animal, imagen_perfil,
     numero_chip, pasaporte, rasgos, fecha_nacimiento, fecha_adopcion, color, raza, id_usuario)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [...parametros, idUsuario],
  );
  return resultado.lastInsertRowId;
}

export async function listarMascotas(
  db: ConexionMascotas,
  idUsuario: number,
): Promise<Mascota[]> {
  validarId(idUsuario);
  return db.getAllAsync<Mascota>(
    "SELECT * FROM mascota WHERE id_usuario = ? ORDER BY nombre COLLATE NOCASE, id_mascota",
    idUsuario,
  );
}

export async function obtenerMascota(
  db: ConexionMascotas,
  idUsuario: number,
  idMascota: number,
): Promise<Mascota | null> {
  validarId(idUsuario);
  validarId(idMascota);
  return db.getFirstAsync<Mascota>(
    "SELECT * FROM mascota WHERE id_usuario = ? AND id_mascota = ?",
    idUsuario,
    idMascota,
  );
}

export async function actualizarMascota(
  db: ConexionMascotas,
  idUsuario: number,
  idMascota: number,
  datos: DatosMascota,
): Promise<void> {
  validarId(idUsuario);
  validarId(idMascota);
  const resultado = await db.runAsync(
    `UPDATE mascota SET nombre = ?, genero = ?, edad = ?, estado_esterilizacion = ?,
    tipo_animal = ?, imagen_perfil = ?, numero_chip = ?, pasaporte = ?, rasgos = ?,
    fecha_nacimiento = ?, fecha_adopcion = ?, color = ?, raza = ?
    WHERE id_usuario = ? AND id_mascota = ?`,
    [...valores(datos), idUsuario, idMascota],
  );
  if (!resultado.changes)
    throw new Error("La mascota no existe para este usuario.");
}

export async function eliminarMascota(
  db: ConexionMascotas,
  idUsuario: number,
  idMascota: number,
): Promise<void> {
  validarId(idUsuario);
  validarId(idMascota);
  const resultado = await db.runAsync(
    "DELETE FROM mascota WHERE id_usuario = ? AND id_mascota = ?",
    idUsuario,
    idMascota,
  );
  if (!resultado.changes)
    throw new Error("La mascota no existe para este usuario.");
}
