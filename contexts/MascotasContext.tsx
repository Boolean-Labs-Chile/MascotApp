import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSQLiteContext } from "expo-sqlite";
import type { Mascota } from "@/db/mascotas";
import { almacenamientoImagenes } from "@/services/imagenesMascota";
import { crearServicioMascotasLocales } from "@/services/mascotasLocales";

function useEstadoMascotas() {
  const db = useSQLiteContext();
  const servicio = useMemo(
    () => crearServicioMascotasLocales(db, almacenamientoImagenes),
    [db],
  );
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [seleccionada, seleccionar] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const solicitud = useRef(0);
  const refrescar = useCallback(async () => {
    const turno = ++solicitud.current;
    setCargando(true);
    setError(null);
    try {
      const lista = await servicio.listar();
      if (turno !== solicitud.current) return;
      setMascotas(lista);
      seleccionar((actual) =>
        lista.some((m) => m.id_mascota === actual)
          ? actual
          : (lista[0]?.id_mascota ?? null),
      );
    } catch (e) {
      if (turno === solicitud.current)
        setError(
          e instanceof Error
            ? e.message
            : "No se pudieron cargar las mascotas.",
        );
    } finally {
      if (turno === solicitud.current) setCargando(false);
    }
  }, [servicio]);
  return {
    servicio,
    mascotas,
    activa: mascotas.find((m) => m.id_mascota === seleccionada) ?? null,
    seleccionar,
    cargando,
    error,
    refrescar,
  };
}
const Contexto = createContext<ReturnType<typeof useEstadoMascotas> | null>(
  null,
);
export function MascotasProvider({ children }: { children: ReactNode }) {
  const estado = useEstadoMascotas();
  return <Contexto.Provider value={estado}>{children}</Contexto.Provider>;
}
export function useMascotas() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("Falta MascotasProvider.");
  return contexto;
}
