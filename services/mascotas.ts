import {
  crearMascota,
  listarMascotas,
  obtenerMascota,
  actualizarMascota,
  eliminarMascota,
  validarDatosMascota,
  validarId,
  type ConexionMascotas,
  type DatosMascota,
} from "@/db/mascotas";
import type { AlmacenamientoImagenes } from "@/services/imagenesMascota";

const colas = new WeakMap<ConexionMascotas, Promise<unknown>>();

export function crearServicioMascotas(
  db: ConexionMascotas,
  imagenes: AlmacenamientoImagenes,
) {
  function escribir<T>(operacion: () => Promise<T>): Promise<T> {
    const pendiente = (colas.get(db) ?? Promise.resolve()).then(operacion);
    colas.set(
      db,
      pendiente.catch(() => undefined),
    );
    return pendiente;
  }

  async function limpiar(uri: string | null): Promise<string | null> {
    if (!uri) return null;
    try {
      const referencia = await db.getFirstAsync(
        "SELECT id_mascota FROM mascota WHERE imagen_perfil = ? LIMIT 1",
        uri,
      );
      if (!referencia) await imagenes.eliminar(uri);
      return null;
    } catch {
      return "No se pudo limpiar una foto sin uso. El cambio en la base de datos ya se realizó.";
    }
  }

  return {
    listar: (idUsuario: number) => listarMascotas(db, idUsuario),
    obtener: (idUsuario: number, idMascota: number) =>
      obtenerMascota(db, idUsuario, idMascota),
    crear(idUsuario: number, datos: DatosMascota) {
      return escribir(async () => {
        validarId(idUsuario);
        validarDatosMascota(datos);
        let foto: string | null = null;
        try {
          foto = datos.imagen_perfil
            ? await imagenes.guardar(datos.imagen_perfil)
            : null;
          return await crearMascota(db, idUsuario, {
            ...datos,
            imagen_perfil: foto,
          });
        } catch (error) {
          await limpiar(foto);
          throw error;
        }
      });
    },
    actualizar(idUsuario: number, idMascota: number, datos: DatosMascota) {
      return escribir(async () => {
        validarDatosMascota(datos);
        const anterior = await obtenerMascota(db, idUsuario, idMascota);
        if (!anterior)
          throw new Error("La mascota no existe para este usuario.");
        const seleccion =
          datos.imagen_perfil === undefined
            ? anterior.imagen_perfil
            : datos.imagen_perfil;
        const cambia = seleccion !== anterior.imagen_perfil;
        let nueva: string | null = null;
        try {
          nueva =
            cambia && seleccion ? await imagenes.guardar(seleccion) : seleccion;
          await actualizarMascota(db, idUsuario, idMascota, {
            ...datos,
            imagen_perfil: nueva,
          });
        } catch (error) {
          if (cambia) await limpiar(nueva);
          throw error;
        }
        return {
          advertencia: cambia ? await limpiar(anterior.imagen_perfil) : null,
        };
      });
    },
    eliminar(idUsuario: number, idMascota: number) {
      return escribir(async () => {
        const anterior = await obtenerMascota(db, idUsuario, idMascota);
        if (!anterior)
          throw new Error("La mascota no existe para este usuario.");
        await eliminarMascota(db, idUsuario, idMascota);
        return { advertencia: await limpiar(anterior.imagen_perfil) };
      });
    },
  };
}
