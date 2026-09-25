export type Genero = "Macho" | "Hembra";
export type TipoAnimal = "Perro" | "Gato" | "Otro";

export interface MascotaForm {
    nombre: string;
    edad: string;
    genero: Genero | null;
    esterilizado: boolean | null;
    tipoAnimal: TipoAnimal | null;
    imagenUri: string | null;
}