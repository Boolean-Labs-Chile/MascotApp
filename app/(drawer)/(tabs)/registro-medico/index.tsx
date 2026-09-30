import { ButtonCard } from "@/components/ButtonCard";
import { SidebarToggler } from "@/components/SidebarToggler";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECCIONES = [
  {
    titulo: "Peso",
    slug: "peso",
    icono: "scale-bathroom",
    habilitada: false,
  },
  {
    titulo: "Vacunas",
    slug: "vacunas",
    icono: "needle",
    habilitada: false,
  },
  {
    titulo: "Tratamientos",
    slug: "tratamientos",
    icono: "pill",
    habilitada: true,
  },
  {
    titulo: "Notas",
    slug: "notas",
    icono: "note-text-outline",
    habilitada: false,
  },
  {
    titulo: "Archivos clínicos",
    slug: "archivos-clinicos",
    icono: "folder-outline",
    habilitada: false,
  },
];

export default function RegistroMedico() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView>
        <View className="px-6 py-6">
          {/* Botón del Sidebar: alterna entre perfiles de mascotas.
              TODO: pasar el nombre de la mascota activa con la prop
              nombreMascota (hoy usa el valor por defecto, "Canela"). */}
          <View className="mb-6 flex-row">
            <SidebarToggler />
          </View>

          <Text className="mb-6 font-sans-bold text-2xl text-text">
            Registros médicos
          </Text>

          {SECCIONES.map((seccion) => (
            <View
              key={seccion.slug}
              className={seccion.habilitada ? "" : "opacity-50"}
              pointerEvents={seccion.habilitada ? "auto" : "none"}
            >
              <ButtonCard
                title={seccion.titulo}
                iconName={seccion.icono}
                iconFamily="material"
                onPress={() => router.push(`/registro-medico/${seccion.slug}`)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
