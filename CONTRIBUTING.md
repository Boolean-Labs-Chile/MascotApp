# Contribuir a MascotApp

Este proyecto se desarrolla en equipo y todas las contribuciones deben seguir estas reglas para mantener consistencia.

## Estructura del proyecto

Navegación por archivos con Expo Router. El directorio `app/` **es** el enrutador: el nombre del archivo define la ruta y los grupos entre paréntesis organizan el flujo sin aparecer en la URL.

```text
app/
├── _layout.tsx            # Layout raíz: Stack, carga de fuentes y SplashScreen
├── index.tsx              # /            Pantalla de bienvenida
├── mascota-nueva.tsx      # /mascota-nueva   Alta de mascota (Stack, fuera de los Tabs)
├── (auth)/
│   ├── _layout.tsx        # Layout de auth: Stack + KeyboardAvoidingView
│   ├── login.tsx          # /login
│   └── registrarse.tsx    # /registrarse
└── (tabs)/
    ├── _layout.tsx        # Layout de Tabs: Perfil | Registro Médico | Contactos
    ├── perfil.tsx         # /(tabs)/perfil
    ├── registro-medico.tsx# /(tabs)/registro-medico
    └── contactos.tsx      # /(tabs)/contactos
components/                # Componentes base reutilizables
assets/                    # Imágenes e íconos
```

### Convenciones de estructura

- **Cada archivo en `app/` es una pantalla.** Los layouts (`_layout.tsx`) definen la navegación compartida de su grupo.
- **Agregar una pestaña** implica crear el archivo en `(tabs)/` y registrarlo en `app/(tabs)/_layout.tsx` con su `title` e ícono.
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

Sirve para dar formato de estilo al código (sangrías, comillas, punto y coma, etc.).

```bash
npx prettier --check .
```

```bash
npx prettier --write .
```

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
fix/ruta-login-perfil
docs/actualizar-readme
```

## Commits

Convención:

```text
tipo(alcance): mensaje
```

Tipos sugeridos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

Ejemplo: `fix(auth): corregir redirección de login hacia /perfil`

## Pull Requests

Cada PR debe incluir:

- Resumen funcional del cambio.
- Pasa linting y formateador (Prettier).
- Si el cambio agrega una dependencia, su entrada en `DEPENDENCIES.md`.
- Si el cambio mueve o renombra una pantalla, actualizar el árbol de `README.md` y `CONTRIBUTING.md`.
- Riesgos y consideraciones de despliegue (si aplica).
