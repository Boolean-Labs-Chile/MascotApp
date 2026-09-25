import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { ChipSelector } from "../../components/ChipSelector";
import { SelectorImagenPerfil } from "../../components/SelectorImagenPerfil";
import { GRADIENT_BACKGROUND } from "../../constants/theme";
import { Genero, MascotaForm, TipoAnimal } from "../../types/mascota";

const GENEROS: Genero[] = ["Macho", "Hembra"];
const TIPOS_ANIMAL: TipoAnimal[] = ["Perro", "Gato", "Otro"];
const OPCIONES_SI_NO: ("Sí" | "No")[] = ["Sí", "No"];

export default function NuevaMascotaScreen() {
    const [form, setForm] = useState<MascotaForm>({
        nombre: "",
        edad: "",
        genero: null,
        esterilizado: null,
        tipoAnimal: null,
        imagenUri: null,
    });

    function validar(): string | null {
        if (form.nombre.trim().length === 0) {
            return "El nombre es obligatorio.";
        }

        if (form.edad.trim().length === 0) {
            return "La edad es obligatoria.";
        }

        if (isNaN(Number(form.edad)) || Number(form.edad) < 0) {
            return "La edad debe ser un número válido.";
        }

        if (!form.genero) {
            return "Selecciona el género.";
        }

        if (form.esterilizado === null) {
            return "Indica si está esterilizado.";
        }

        if (!form.tipoAnimal) {
            return "Selecciona el tipo de animal.";
        }

        return null;
    }

    function handleSubmit() {
        const error = validar();

        if (error) {
            Alert.alert("Faltan datos", error);
            return;
        }

        console.log("Mascota a guardar:", form);
        router.back();
    }

    return (
        <LinearGradient
            {...GRADIENT_BACKGROUND}
            style={{flex:1}} 
        >
            <ScrollView className="flex-1 px-5 pt-6">
                <Text className="text-2xl font-bold text-text mb-6">
                    Registra una nueva mascota
                </Text>

                <SelectorImagenPerfil
                    imagenUri={form.imagenUri}
                    onImagenSeleccionada={(uri) =>
                        setForm((f) => ({ ...f, imagenUri: uri }))
                    }
                />

                <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">
                        Nombre
                    </Text>

                    <TextInput
                        value={form.nombre}
                        onChangeText={(v) => setForm((f) => ({ ...f, nombre: v }))}
                        placeholder="Ej: Firulais"
                        className="border border-gray-300 rounded-lg px-4 py-3 bg-white text-text"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-medium text-text mb-2">
                        Edad
                    </Text>

                    <TextInput
                        value={form.edad}
                        onChangeText={(v) => setForm((f) => ({ ...f, edad: v }))}
                        placeholder="Ej: 3"
                        keyboardType="numeric"
                        className="border border-gray-300 rounded-lg px-4 py-3 bg-white text-text"
                    />
                </View>

                <ChipSelector
                    label="Género"
                    options={GENEROS}
                    value={form.genero}
                    onChange={(v) => setForm((f) => ({ ...f, genero: v }))}
                />

                <ChipSelector
                    label="¿Esterilizado/a?"
                    options={OPCIONES_SI_NO}
                    value={
                        form.esterilizado === null
                            ? null
                            : form.esterilizado
                                ? "Sí"
                                : "No"
                    }
                    onChange={(v) =>
                        setForm((f) => ({ ...f, esterilizado: v === "Sí" }))
                    }
                />

                <ChipSelector
                    label="Tipo de animal"
                    options={TIPOS_ANIMAL}
                    value={form.tipoAnimal}
                    onChange={(v) => setForm((f) => ({ ...f, tipoAnimal: v }))}
                />

                <View className="mt-4 mb-10">
                    <Text
                        onPress={handleSubmit}
                        className="bg-button-dark text-white text-center font-semibold py-3 rounded-lg"
                    >
                        Guardar mascota
                    </Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}
