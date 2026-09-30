# MascotApp

[![CI](https://github.com/Boolean-Labs-Chile/MascotApp/actions/workflows/ci.yml/badge.svg)](https://github.com/Boolean-Labs-Chile/MascotApp/actions/workflows/ci.yml)

App móvil para gestionar el perfil, los tratamientos y los contactos de emergencia de tus mascotas.

Construida con **Expo SDK 54** y **Expo Router**, con navegación por archivos, estilos con
**NativeWind** y persistencia local prevista en **SQLite**.

## Estado del proyecto

| Hito              | Issues   | Estado                                             |
| ----------------- | -------- | -------------------------------------------------- |
| 1 · Base y diseño | #1 – #4  | #1 [x] #2 [x] · #3 falta el Sidebar · #4 ...       |
| 2 · CRUD Mascota  | #5 – #7  | #5 [x] (UI lista, sin persistir) · #6 ... · #7 ... |
| 3 · Tratamientos  | #8 – #10 | ...                                                |

**Ya implementado**

- Navegación: Stack raíz + grupo `(auth)` (login / registrarse) + `Tabs` (Perfil, Registro Médico, Contactos).
- Sistema de diseño: paleta Tailwind y tipografías Nunito cargadas desde `assets/fonts`.
- Componentes base: `Button`, `Card`, `Input` y `RadioButton`.
- Formulario de registro de mascota completo, con selector de foto de perfil.
- `expo-sqlite` y `expo-file-system` instalados y configurados en `app.json` (aún sin usar).

**Próximos pasos:** corregir la ruta de redirección del login, inicializar SQLite (Issue #4),
persistir la mascota (Issue #6) y completar el CRUD.

> Detalle completo de hitos y tareas en [ROADMAP.md](./ROADMAP.md).

## Stack

| Área       | Tecnología                                           |
| ---------- | ---------------------------------------------------- |
| Framework  | Expo SDK 54, React Native 0.81, React 19.1           |
| Navegación | Expo Router 6 (file-based routing, typed routes)     |
| Estilos    | NativeWind 4 + Tailwind CSS 3                        |
| Lenguaje   | TypeScript 5.9                                       |
| Datos      | `expo-sqlite` (pendiente de uso), `expo-file-system` |
| Multimedia | `expo-image`, `expo-image-picker`, `datetimepicker`  |
| Otros      | `expo-font`, `expo-splash-screen`, `expo-haptics`    |

## Requisitos

- **Node.js 20.19.x** o superior (mínimo exigido por Expo SDK 54).
- npm.
- Para probar en dispositivo: la app **Expo Go**. Alternativamente, emulador de Android o simulador de iOS.

## Cómo empezar

1. Instalar las dependencias:

   ```bash
   npx expo install
   ```

2. Levantar el servidor de desarrollo:

   ```bash
   npx expo start
   ```

## Lint y formato

```bash
npm run lint          # ESLint
npm run format        # aplica Prettier
npm run format:check  # verifica el formato sin escribir
npx tsc --noEmit      # verifica los tipos
```

Ambos checks se ejecutan automáticamente en cada PR contra `main` mediante
[GitHub Actions](./.github/workflows/ci.yml). La configuración de Prettier está en
`.prettierrc` y los archivos excluidos en `.prettierignore` (los `.md` se formatean a mano).

## Estructura

```text
app/
├── _layout.tsx            # Stack raíz, carga de fuentes Nunito y SplashScreen
├── index.tsx              # Bienvenida → registro / login
├── mascota-nueva.tsx      # Alta de mascota (pantalla del Stack, fuera de los Tabs)
├── (auth)/
│   ├── _layout.tsx        # Stack + KeyboardAvoidingView
│   ├── login.tsx
│   └── registrarse.tsx
└── (tabs)/
    ├── _layout.tsx        # Tabs: Perfil | Registro Médico | Contactos
    ├── perfil.tsx         # Placeholder
    ├── registro-medico/   # Stack anidado de Registro Médico
    │   ├── _layout.tsx    # Layout del Stack
    │   ├── index.tsx      # /registro-medico
    │   ├── [tipo].tsx     # /registro-medico/tratamientos (ruta dinámica)
    │   └── nuevo.tsx      # /registro-medico/nuevo
    └── contactos.tsx      # Placeholder (fuera del alcance del ROADMAP)
components/
├── Button.tsx
├── Card.tsx
├── Input.tsx
└── RadioButton.tsx
```

## Sistema de diseño

Tokens definidos en `tailwind.config.js`:

| Token           | Clase             | Valor     |
| --------------- | ----------------- | --------- |
| Fondo           | `bg-background`   | `#cbfbf1` |
| Botón principal | `bg-button-dark`  | `#46ecd5` |
| Botón claro     | `bg-button-light` | `#f0fdfa` |
| Texto           | `text-text`       | `#022f2e` |

Tipografías **Nunito**: `font-sans` (Regular), `font-sans-bold` (Bold) y
`font-sans-semibold` (SemiBold).

## Documentación del equipo

- [ROADMAP.md](./ROADMAP.md) — hitos, issues y tareas.
- [CONTRIBUTING.md](./CONTRIBUTING.md) — estructura, convenciones de ramas, commits y PRs.
- [DEPENDENCIES.md](./DEPENDENCIES.md) — formato para documentar dependencias nuevas.
