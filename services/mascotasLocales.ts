import type { ConexionMascotas, DatosMascota } from "@/db/mascotas";
import { obtenerUsuarioLocal } from "@/db/usuarioLocal";
import type { AlmacenamientoImagenes } from "@/services/imagenesMascota";
import { crearServicioMascotas } from "@/services/mascotas";

export function crearServicioMascotasLocales(
  db: ConexionMascotas,
  imagenes: AlmacenamientoImagenes,
) {
  const mascotas = crearServicioMascotas(db, imagenes);
  const usuario = async () => (await obtenerUsuarioLocal(db)).id_usuario;
  return {
    listar: async () => mascotas.listar(await usuario()),
    obtener: async (idMascota: number) =>
      mascotas.obtener(await usuario(), idMascota),
    crear: async (datos: DatosMascota) =>
      mascotas.crear(await usuario(), datos),
    actualizar: async (idMascota: number, datos: DatosMascota) =>
      mascotas.actualizar(await usuario(), idMascota, datos),
    eliminar: async (idMascota: number) =>
      mascotas.eliminar(await usuario(), idMascota),
  };
}
