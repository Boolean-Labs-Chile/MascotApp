import Button from "@/components/Button";
import { obtenerMascotas, type Mascota } from "@/store/mascotas";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

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
  const router = useRouter();
  const { mascotas, activa, seleccionar, recargar, error } = useMascotas();
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => {
          setAbierto(true);
          void recargar().catch(() => undefined);
        }}
        className="flex-row justify-between gap-2 rounded-full border bg-white px-6 py-4 shadow-sm active:opacity-80"
      >
        <Ionicons name="menu" size={20} color="#000000" />
        <Text className="align-middle font-sans-semibold text-sm text-[#000000]">
          {activa?.nombre ?? nombreMascota ?? "Mis mascotas"}
        </Text>
      </Pressable>
      <Modal
        visible={abierto}
        transparent
        animationType="fade"
        onRequestClose={() => setAbierto(false)}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
        >
          <View
            className="bg-background px-6 py-12"
            style={{ width: "80%", maxWidth: 340 }}
          >
            <Button
              label="Cerrar menú"
              onPress={() => setAbierto(false)}
              variant="light"
            />
            <ScrollView className="my-6">
              {error ? <Text>{error}</Text> : null}
              {!mascotas.length && !error ? (
                <Text>Aún no hay mascotas registradas.</Text>
              ) : null}
              {mascotas.map((mascota) => (
                <Pressable
                  key={mascota.id_mascota}
                  className="py-4"
                  onPress={() => {
                    seleccionar(mascota.id_mascota);
                    setAbierto(false);
                  }}
                >
                  <Text className="font-sans-semibold text-base text-text">
                    {mascota.nombre}
                    {activa?.id_mascota === mascota.id_mascota ? " ✓" : ""}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button
              label="Añadir mascota"
              onPress={() => {
                setAbierto(false);
                router.push("/mascota-nueva");
              }}
            />
          </View>
          <Pressable
            accessibilityLabel="Cerrar menú"
            style={{ flex: 1 }}
            onPress={() => setAbierto(false)}
          />
        </View>
      </Modal>
    </>
  );
}
