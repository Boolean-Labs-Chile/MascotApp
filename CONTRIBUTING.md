# Contribuir a MascotApp

Este proyecto se desarrolla en equipo y todas las contribuciones deben seguir estas reglas para mantener consistencia.

## Estructura del proyecto

Navegación por archivos con Expo Router. El directorio `app/` **es** el enrutador: el nombre del archivo define la ruta y los grupos entre paréntesis organizan el flujo sin aparecer en la URL.

```text
app/
├── _layout.tsx            # Layout raíz: Stack, carga de fuentes y SplashScreen
├── index.tsx              # /            Pantalla de bienvenida
├── mascota-nueva.tsx      # /mascota-nueva   Registro de mascota (Stack, fuera del Drawer)
├── (auth)/
│   ├── _layout.tsx        # Layout de auth: Stack + KeyboardAvoidingView
│   ├── login.tsx          # /login
│   └── registrarse.tsx    # /registrarse
└── (drawer)/
    ├── _layout.tsx        # Layout de Drawer: menú lateral + CustomDrawerContent
    └── (tabs)/
        ├── _layout.tsx    # Layout de Tabs: Perfil | Registro Médico | Contactos
        ├── home.tsx       # /home (título de la pestaña: Perfil)
        ├── registro-medico.tsx
        └── contactos.tsx
components/                # Componentes base reutilizables
assets/                    # Imágenes, íconos y fuentes Nunito
```

### Convenciones de estructura

- **Cada archivo en `app/` es una pantalla.** Los layouts (`_layout.tsx`) definen la navegación compartida de su grupo.
- **Agregar una pestaña** implica crear el archivo en `app/(drawer)/(tabs)/` y registrarlo en `app/(drawer)/(tabs)/_layout.tsx` con su `title` e ícono. El archivo `home.tsx` expone la pestaña con título "Perfil".
- **El menú lateral vive en `app/(drawer)/_layout.tsx`**, no en `(tabs)`. El contenido del drawer se delega a `components/CustomDrawerContent.tsx`.
- **Los componentes reutilizables** van en `components/`, no dentro de `app/`.
- **Importa componentes con el alias `@/`** (definido en `tsconfig.json`): `@/components/Button`. Evita rutas relativas.
- **Tipado de rutas activo** (`typedRoutes: true` en `app.json`): una ruta inexistente es un error de TypeScript. Si `npx tsc --noEmit` se queja de una ruta, es que el archivo se movió o renombró.

## Reglas Base

Documentar dependencias adicionales en `DEPENDENCIES.md`

| Campo                        | Por qué                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| **Versión** exacta (o rango) | Permite reproducir el entorno y detecta cambios nocivos    |
| **Finalidad**                | Qué problema resuelve en el proyecto                       |
| **Motivo de selección**      | Por qué esta librería y no otra (alternativas descartadas) |
| **Categoría**                | `dependencies` o `devDependencies`                         |
| **Configuración adicional**  | Pasos post-instalación (archivos de config, nativos, etc.) |
| **Responsable**              | Quién la agregó                                            |

### Ejemplo de entrada

> ### react-native-gesture-handler
>
> - **Versión**: 2.16.2
> - **Finalidad**: Gestos táctiles (swipe, pinch, pan)
> - **Motivo:** Estándar de facto en RN; compatible con Reanimated 3
> - **Categoría:** dependencies
> - **Config:** Requiere `npx pod-install` en iOS
> - **Responsable:** @jorge

## Comandos de uso diario

**ESLint (Linter)**

Sirve para detectar errores sintácticos, problemas en el código y buenas prácticas. La configuración usa `eslint-config-expo` en modo flat (ver `eslint.config.js`).

**Checkeo de errores:**

```bash
npm run lint
```

**Corregir errores:**

```bash
npx eslint . --fix
```

**TypeScript**

El proyecto corre con `strict: true`. Antes de abrir un PR, verifica los tipos:

```bash
npx tsc --noEmit
```

**Prettier (Formateador)**

Sirve para dar formato de estilo al código (sangrías, comillas, punto y coma, orden de las clases de Tailwind, etc.). La configuración vive en `.prettierrc` y activa `prettier-plugin-tailwindcss`.

```bash
npm run format        # aplica el formato a todo el proyecto
npm run format:check  # verifica sin escribir
```

**Qué se formatea y qué no:** los archivos `.md` están excluidos en `.prettierignore` y se mantienen a mano. También quedan fuera `package-lock.json`, los binarios de `assets/` y los artefactos de build.

**Integración continua:** `.github/workflows/ci.yml` corre `npx eslint .` y `npx prettier --check .` en cada PR contra `main` y en cada push a `main`. Ambos checks deben pasar para poder mergear.

## Convenciones de ramas

Formato:

```text
feature/<descripcion-corta>
fix/<descripcion-corta>
chore/<descripcion-corta>
docs/<descripcion-corta>
```

Ejemplos:

```text
feature/tratamientos
fix/ruta-login-home
docs/actualizar-readme
```

## Commits

Convención:

```text
tipo(alcance): mensaje
```

Tipos sugeridos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

Ejemplo: `fix(auth): corregir redirección de login hacia /home`

## Pull Requests

Cada PR debe incluir:

- Resumen funcional del cambio.
- Pasa linting y formateador (Prettier).
- Si el cambio agrega una dependencia, su entrada en `DEPENDENCIES.md`.
- Si el cambio mueve o renombra una pantalla, actualizar el árbol de `README.md` y `CONTRIBUTING.md`.
- Riesgos y consideraciones de despliegue (si aplica).
