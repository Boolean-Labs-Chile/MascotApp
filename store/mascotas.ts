import { Directory, File, Paths } from "expo-file-system";
import type { SQLiteDatabase } from "expo-sqlite";

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
      datos.nombre,
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
