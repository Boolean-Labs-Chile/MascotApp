import { Directory, File, Paths } from "expo-file-system";
import type { SQLiteDatabase } from "expo-sqlite";

export class NombreMascotaDuplicadoError extends Error {
  constructor() {
    super("Ya tienes una mascota con ese nombre. Elige otro.");
    this.name = "NombreMascotaDuplicadoError";
  }
}

function normalizarNombreMascota(nombre: string) {
  return nombre.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
}

export type Mascota = {
  id_mascota: number;
  nombre: string;
  genero: "macho" | "hembra";
  estado_esterilizacion: number;
  tipo_animal: string | null;
  fecha_nacimiento: string | null;
  fecha_adopcion: string | null;
  color: string | null;
  raza: string | null;
  rasgos: string | null;
  imagen_perfil: string | null;
  imagen_web: string | null;
};

export type DatosMascota = {
  nombre: string;
  genero: "macho" | "hembra";
  esterilizado: boolean;
  tipoAnimal: string;
  fechaNacimiento: string;
  fechaAdopcion: string;
  color: string;
  rasgos: string;
  raza: string;
  imagenPerfil: string | null;
  imagenWeb: string | null;
  fotoNueva?: {
    uri: string;
    extension: string;
    plataforma: "web" | "nativa";
  };
};

export async function obtenerMascotas(db: SQLiteDatabase) {
  return db.getAllAsync<Mascota>(
    "SELECT * FROM mascota WHERE id_usuario = (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1) ORDER BY id_mascota",
  );
}

export async function guardarMascota(
  db: SQLiteDatabase,
  datos: DatosMascota,
  idMascota?: number,
) {
  const nombreNormalizado = normalizarNombreMascota(datos.nombre);

  const nombresGuardados = await db.getAllAsync<{
    id_mascota: number;
    nombre: string;
  }>(
    `SELECT id_mascota, nombre
     FROM mascota
     WHERE id_usuario = (
       SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1
     )`,
  );

  const nombreOcupado = nombresGuardados.some(
    (mascota) =>
      mascota.id_mascota !== idMascota &&
      normalizarNombreMascota(mascota.nombre) === nombreNormalizado,
  );

  if (nombreOcupado) {
    throw new NombreMascotaDuplicadoError();
  }

  let copia: File | null = null;

  try {
    let imagenPerfil = datos.imagenPerfil;
    let imagenWeb = datos.imagenWeb;
    if (datos.fotoNueva) {
      if (datos.fotoNueva.plataforma === "web") {
        imagenWeb = datos.fotoNueva.uri;
        imagenPerfil = null;
      } else {
        const carpeta = new Directory(Paths.document, "mascotas");
        carpeta.create({ idempotent: true, intermediates: true });
        copia = new File(
          carpeta,
          `${Date.now()}-${Math.random().toString(36).slice(2)}.${datos.fotoNueva.extension}`,
        );
        new File(datos.fotoNueva.uri).copy(copia);
        imagenPerfil = copia.uri;
        imagenWeb = null;
      }
    }

    const valores = [
      datos.nombre.normalize("NFC").trim().replace(/\s+/g, " "),
      datos.genero,
      Number(datos.esterilizado),
      datos.tipoAnimal,
      datos.fechaNacimiento,
      datos.fechaAdopcion,
      datos.color,
      datos.rasgos,
      datos.raza,
      imagenPerfil,
      imagenWeb,
    ];

    if (idMascota !== undefined) {
      const resultado = await db.runAsync(
        "UPDATE mascota SET nombre=?, genero=?, estado_esterilizacion=?, tipo_animal=?, fecha_nacimiento=?, fecha_adopcion=?, color=?, rasgos=?, raza=?, imagen_perfil=?, imagen_web=? WHERE id_mascota=? AND id_usuario=(SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1)",
        ...valores,
        idMascota,
      );
      if (resultado.changes !== 1) {
        throw new Error("No se encontró la mascota para actualizar.");
      }
      copia = null;
      return idMascota;
    }

    const resultado = await db.runAsync(
      "INSERT INTO mascota (nombre, genero, estado_esterilizacion, tipo_animal, fecha_nacimiento, fecha_adopcion, color, rasgos, raza, imagen_perfil, imagen_web, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1))",
      ...valores,
    );
    copia = null;
    return resultado.lastInsertRowId;
  } catch (error) {
    try {
      if (copia?.exists) copia.delete();
    } catch {
      console.warn("No se pudo retirar la copia de la foto que no se guardó.");
    }
    throw error;
  }
}

/////*****REVISAR ESTO POR FAVOR********
export async function eliminarMascota(db: SQLiteDatabase, idMascota: number) {
  const mascota = await db.getFirstAsync<{ imagen_perfil: string | null }>(
    "SELECT imagen_perfil FROM mascota WHERE id_mascota=? AND id_usuario=(SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1)",
    idMascota,
  );
  if (!mascota) {
    throw new Error("No se encontró la mascota para eliminar.");
  }

  //INDICACIONES DE LOS CAMBIOS!!!!
  // Los tratamientos de la mascota se eliminan automáticamente por la
  // restricción ON DELETE CASCADE de la tabla tratamiento.
  const resultado = await db.runAsync(
    "DELETE FROM mascota WHERE id_mascota=? AND id_usuario=(SELECT id_usuario FROM usuario ORDER BY id_usuario LIMIT 1)",
    idMascota,
  );
  if (resultado.changes !== 1) {
    throw new Error("No se pudo eliminar la mascota.");
  }

  // La foto se borra DESPUÉS de eliminar el registro: si la base de datos
  // fallara, la mascota conserva su foto. Solo se borran archivos que la app
  // guardó en su propia carpeta "mascotas", y un fallo aquí no es crítico.
  try {
    const carpeta = new Directory(Paths.document, "mascotas");
    const prefijo = `${carpeta.uri.replace(/\/$/, "")}/`;
    if (mascota.imagen_perfil?.startsWith(prefijo)) {
      const foto = new File(mascota.imagen_perfil);
      if (foto.exists) foto.delete();
    }
  } catch {
    console.warn("No se pudo borrar la foto de la mascota eliminada.");
  }
}
