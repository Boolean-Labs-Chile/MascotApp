# Contribuir a MascotApp

Este proyecto se desarrolla en equipo y todas las contribuciones deben seguir estas reglas para mantener consistencia.

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
| Ejemplo:                     |

> ### react-native-gesture-handler
>
> - **Versión**: 2.16.2
> - **Finalidad**: Gestos táctiles (swipe, pinch, pan)
> - **Motivo:** Estándar de facto en RN; compatible con Reanimated 3
> - **Categoría:** dependencies
> - **Config:** Requiere `npx pod-install` en iOS
> - **Responsable:** @jorge

### Comandos de uso diario

**ESLint (Linter)**

Sirve para detectar errores sintácticos, problemas en el código y buenas prácticas.

**Checkeo de errores**

```bash
npx eslint
```

**Corregir errores:**

```bash
npx eslint . --fix
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
```

Ejemplos:

```text
feature/tratamientos
fix/escala-grafico-peso
```

## Commits

Convención:

```text
tipo(alcance): mensaje
```

Tipos sugeridos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

## Pull Requests

Cada PR debe incluir:

- Resumen funcional del cambio.
- Pasa linting (eslint) y formateador (Prettier)
- Riesgos y consideraciones de despliegue (si aplica).
