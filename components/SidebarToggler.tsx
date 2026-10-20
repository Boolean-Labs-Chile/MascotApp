import { useSesion } from "@/contexts/sesion-context";
import { obtenerMascotas, type Mascota } from "@/store/mascotas";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Pressable, Text } from "react-native";

const MascotasContext = createContext<{
  mascotas: Mascota[];
  activa: Mascota | undefined;
  seleccionar: (id: number | null) => void;
  recargar: () => Promise<void>;
  cargando: boolean;
  error: string;
} | null>(null);

export function useMascotas() {
  const contexto = useContext(MascotasContext);
  if (!contexto) throw new Error("Falta inicializar las mascotas");
  return contexto;
}

export function MascotasProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const { usuario } = useSesion();
  const uid = usuario?.uid ?? null;
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [idActivo, seleccionar] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // Identifica la consulta más reciente: si el usuario cambia mientras una
  // consulta anterior sigue en curso, su resultado se descarta.
  const consultaActual = useRef(0);

  const recargar = useCallback(async () => {
    const consulta = ++consultaActual.current;
    try {
      const filas = await obtenerMascotas(db);
      if (consulta !== consultaActual.current) return;
      setMascotas(filas);
      setError("");
    } catch {
      if (consulta !== consultaActual.current) return;
      setError("No se pudieron cargar las mascotas. Intenta nuevamente.");
      throw new Error("No se pudieron cargar las mascotas");
    } finally {
      if (consulta === consultaActual.current) setCargando(false);
    }
  }, [db]);

  // Al iniciar o cerrar sesión se limpia la lista y la mascota seleccionada,
  // y se vuelven a consultar las mascotas del usuario conectado.
  useEffect(() => {
    setMascotas([]);
    seleccionar(null);
    setError("");
    setCargando(true);
    void recargar().catch(() => undefined);
  }, [recargar, uid]);

  const activa =
    mascotas.find((mascota) => mascota.id_mascota === idActivo) ?? mascotas[0];
  return (
    <MascotasContext.Provider
      value={{ mascotas, activa, seleccionar, recargar, cargando, error }}
    >
      {children}
    </MascotasContext.Provider>
  );
}

interface SidebarTogglerProps {
  nombreMascota?: string;
}

export function SidebarToggler({ nombreMascota }: SidebarTogglerProps) {
  const navigation = useNavigation();
  const { activa } = useMascotas();

  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      className="flex-row justify-between gap-2 rounded-full border bg-white px-6 py-4 shadow-sm active:opacity-80"
    >
      <Ionicons name="menu" size={20} color="#000000" />
      <Text className="align-middle font-sans-semibold text-sm text-[#000000]">
        {activa?.nombre ?? nombreMascota ?? "Mis mascotas"}
      </Text>
    </Pressable>
  );
}
