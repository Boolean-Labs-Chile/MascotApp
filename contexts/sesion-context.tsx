import { auth } from "@/config/auth";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

type SesionContextValue = {
  usuario: User | null;
  cargandoSesion: boolean;
};

const SesionContext = createContext<SesionContextValue | undefined>(undefined);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    const dejarDeEscuchar = onAuthStateChanged(auth, (usuarioActual) => {
      setUsuario(usuarioActual);
      setCargandoSesion(false);
    });

    return dejarDeEscuchar;
  }, []);

  return (
    <SesionContext.Provider value={{ usuario, cargandoSesion }}>
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion() {
  const contexto = useContext(SesionContext);

  if (contexto === undefined) {
    throw new Error("useSesion debe utilizarse dentro de SesionProvider.");
  }

  return contexto;
}