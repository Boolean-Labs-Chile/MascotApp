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
          <View className="mb-6 flex-row">
            <SidebarToggler />
          </View>

          <Text className="mb-6 font-sans-bold text-2xl text-text">
            Registros médicos
          </Text>

          {SECCIONES.map((seccion) => (
            <ButtonCard
              key={seccion.slug}
              title={seccion.titulo}
              iconName={seccion.icono}
              iconFamily="material"
              disabled={!seccion.habilitada}
              onPress={() => router.push(`/registro-medico/${seccion.slug}`)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
