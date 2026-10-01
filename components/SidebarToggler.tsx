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
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [idActivo, seleccionar] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const recargar = useCallback(async () => {
    try {
      const filas = await obtenerMascotas(db);
      setMascotas(filas);
      setError("");
    } catch {
      setError("No se pudieron cargar las mascotas. Intenta nuevamente.");
      throw new Error("No se pudieron cargar las mascotas");
    } finally {
      setCargando(false);
    }
  }, [db]);

  useEffect(() => {
    void recargar().catch(() => undefined);
  }, [recargar]);

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
