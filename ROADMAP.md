# Roadmap: Primer Entregable MascotApp

Fecha de Entrega: Viernes 2 de Octubre de 2026.

## Hito 1: Setup, Arquitectura Base y Diseño Básico

**Fecha tentativa**: 14 - 18 de Septiembre

**Objetivo**: Aplicación corriendo con la navegación estructurada, la base de datos lista para recibir información e identidad visual aplicada.

- **Issue #1: Configuración del Entorno y Dependencias**
  - **Descripción:** Inicializar el proyecto con Expo y configurar las librerías principales.
  - **Tareas:**

    - [x] Inicializar proyecto Expo con Expo Router.
    - [x] Instalar e inicializar NativeWind.
    - [x] Instalar librerías para gestión de base de datos y archivos (sugeridas por Google: `expo-sqlite` y `expo-file-system` respectivamente).

- **Issue #2: Implementación del Sistema de Diseño**
  - **Descripción:** Configurar los colores y tipografías en el archivo de configuración.
  - **Tareas:**

    - [x] Seleccionar e importar 1 fuente principal (ej. vía Google Fonts o recursos locales, como mejor nos parezca).
    - [x] Definir 3 colores globales: Primario, Secundario, Fondo/Texto en tailwind.config.js.
    - [x] Crear un componente de botón base y contenedor de tarjeta base usando las clases de NativeWind.

- **Issue #3: Estructura de Navegación y Sidebar**
  - **Descripción:** Armar el esqueleto de navegación de la app.
  - **Tareas:**

    - [x] Configurar la navegación principal del Stack con Expo Router.
    - [x] Implementar el menú lateral (Sidebar) para poder alternar fácilmente entre los perfiles de mascotas.

    > **Nota**: además del Stack principal se añadió un grupo `(auth)` (login y registrarse) y una navegación por `Tabs` con tres secciones: **Perfil**, **Registro Médico** y **Contactos**. El Sidebar se implementó envolviendo los `Tabs` en un `Drawer` (`app/(drawer)/_layout.tsx`) con contenido propio (`components/CustomDrawerContent.tsx`). Sigue pendiente conectarlo a los perfiles reales de SQLite (Issue #6).

- **Issue #4: Inicialización de Base de Datos SQLite**
  - **Descripción:** Crear el script de arranque que instancie las tablas necesarias en el dispositivo.
  - **Tareas:**

    - [x] Configurar conexión local con `expo-sqlite` (Si es que vamos con esa librería finalmente).
    - [x] Escribir query de creación para tablas `Usuario` y `Mascota` y `Tratamiento`, incluyendo la restricción de imagen.

## Hito 2: Operaciones CRUD Mascota y Persistencia Local

**Fecha tentativa:** 21 - 25 de Septiembre

**Objetivo:** El Usuario debe poder gestionar completamente los perfiles de sus mascotas, interactuando directamente con SQLite.

- **Issue #5: UI - Formulario de Registro de Mascota**
  - **Descripción:** Construir la interfaz de captura de datos básicos.
  - **Tareas:**

    - [x] Crear inputs para Nombre y Edad.
    - [x] Crear selectores para Género, Estado de Esterilización y Tipo de Animal.
    - [x] Integar selector de imagen de perfil asegurando formato estándar.

    > **Nota**: la UI del formulario está completa y vive en `app/mascota-nueva.tsx`, como pantalla del Stack principal (fuera de los `Tabs`). La "Edad" se implementó como "Fecha de nacimiento" (se agregó además "Fecha de adopción"), y el "Tipo de Animal" es un campo de texto libre (`especie`) en lugar de un selector. El selector de foto usa `expo-image-picker` con recorte 1:1 y calidad 0.7. Falta la persistencia (Issue #6).

- **Issue #6: Crear y leer datos de Mascota**
  - **Descripción:** Construir la interfaz de captura de datos básicos.
  - **Tareas:**

    - [x] Implementar función `INSERT` en SQLite para guardar la mascota.
    - [x] Guardar la URL de la imagen en el dispositivo con `expo-file-system` (si escogemos esa librería).
    - [x] Implementar función `SELECT` en SQLite para cargar las mascotas en el Sidebar.
    - [x] Construir la vista principal de detalles de la mascota.

    > **Nota**: el selector de foto ya funciona a nivel de interfaz (Issue #5), pero la imagen aún no se persiste en disco. El handler `handleGuardar` en `app/mascota-nueva.tsx` es un placeholder: todo el CRUD queda pendiente.

- **Issue #7: Actualizar y eliminar registros de Mascota**
  - **Descripción:** Finalizar el CRUD permitiendo la edición y eliminación.
  - **Tareas:**

    - [x] Habilitar modo edición en la vista de detalles y ejecutar `UPDATE` en SQLite.
    - [x] Implementar botón de eliminar con confirmación y ejecutar `DELETE` en SQLite

## Hito 3: Registro de Tratamientos y Cierre de Entregable

**Fecha tentativa:** 28 de Septiembre - 1 de Octubre.

**Objetivo:** El Usuario debe poder registrar tratamientos asociados a una Mascota. Preparación final para el entregable del 2 de Octubre.

- **Issue #8: UI/UX - Gestión de Tratamientos**
  - **Descripción:** Finalizar el CRUD permitiendo la edición y eliminación.
  - **Tareas:**

    - [x] Crear formulario con campos: `nombre_producto`, `tipo_tratamiento` (Interno/Externo), `fecha_aplicación` y `fecha_siguiente_dosis`.
    - [x] Crear lista o tabla en la vista de la mascota para visualizar su historial de tratamientos.

    > **Nota**: la UI está completa en `app/(drawer)/(tabs)/registro-medico/`. El índice (`index.tsx`) lista cinco secciones y solo habilita **Tratamientos**; el resto responde "próximamente". El alta vive en `nuevo.tsx` con `nombreProducto`, tres fechas vía `@react-native-community/datetimepicker` y comentarios. Dos salvedades: el formulario **no incluye `tipo_tratamiento` (Interno/Externo)** que pedía el issue, y la lista de `[tipo].tsx` renderiza desde un array vacío, así que todavía no hay historial visible. Ambas cosas caen en el Issue #9.

- **Issue #9: Persistencia de Tratamientos**
  - **Descripción:** Conectar el formulario de tratamientos con SQLite
  - **Tareas:**

    - [ ] Implementar función `INSERT` relacionando el tratamiento mediante clave foránea `id_mascota`.
    - [ ] Implementar función `SELECT` para renderizar el historial de tratamientos de la mascota activa.

- **Issue #10: Testing Local, Correcciones Visuales y Code Freeze**
  - **Descripción:** Preparación final para el entregable del 2 de Octubre.
  - **Tareas:**

    - [ ] Comprobar que la navegación de pantallas no se rompa al alternar mascotas.
    - [ ] Validar que el borrado en cascada (eliminar mascota borre sus tratamientos) funcione en SQLite.
    - [ ] Ajustes finales de NativeWind (márgenes, paddings) según los 3 colores definidos.
    - [ ] Generar la build lista para presentar en Expo Go.

## Hito 4: Autenticación Real (Evaluado)

**Fecha tentativa:** Por definir

**Objetivo:** Usuario autenticado y persistencia segura en cliente.

- **Issue #11: Backend — API de Autenticación**
  - **Descripción:** Implementar endpoints de auth.
  - **Tareas:**
    - [ ] **Creación de cuentas e inicio de sesión:** Habilitar el registro de nuevos usuarios y el acceso seguro con correo y contraseña.
    - [ ] `useAuth` hook: estado de usuario, login, logout, refresh automático, persistencia en `expo-secure-store`.
    - [ ] Guard de rutas `(app)` que redirija a `/login` si no hay sesión válida.
    - [ ] **Navegación protegida:** Restringir el acceso a las pantallas principales de la aplicación para que solo puedan ser vistas una vez que los Usuarios hayan iniciado sesión correctamente.

## Hito 5: Validaciones y Unicidad en BD (Evaluado)

**Fecha tentativa:** Por definir

**Objetivo:** Incorporar las pantallas clave para la salud de las mascotas y garantizar la integridad de datos con constraints de unicidad y validaciones en Mascotas, Usuarios y Tratamientos.

- **Issue #12: Pantallas de registro de Salud**
  - **Descripción:** Crear e incorporar las pantallas restantes de la app. Para la evaluación **no se necesita** conectar con BD, basta con redireccionar, pueden incorporarse datos fijos (placeholders)
  - **Tareas:**
    - [ ] **Pantalla Peso:** Seguimiento e historial del peso de la mascota.
    - [ ] **Pantalla Vacunas:** Registro y control de esquemas de vacunación.
    - [ ] **Pantalla Tratamientos:** Control de medicamentos y procedimientos en curso.
    - [ ] **Pantalla Notas:** Apuntes y observaciones generales del cuidado diario.
    - [ ] **Pantalla Archivos Clínicos:** Módulo para adjuntar y visualizar documentos o exámenes médicos.
    - [ ] **Pantalla Contactos:** Datos de contacto del propietario y copropietario si fuera el caso.

- **Issue #13: Backend — Constraints de Unicidad y Validaciones**
  - **Descripción:** Añadir constraints únicas y validaciones a nivel de base de datos y API.
  - **Tareas:**
    - [ ] Constraint `UNIQUE` en `Usuario.email` (índice único en BD). Garantizar que no existan dos usuarios con el mismo correo electrónico.
    - [ ] Constraint `UNIQUE` en `Mascota.nombre` por `usuario_id`. Impedir que un mismo usuario registre dos mascotas con exactamente el mismo nombre.
    - [ ] Constraint `UNIQUE` en `Tratamiento` combinado: `mascota_id` + `nombre_producto` + `fecha_aplicacion` (evitar duplicados exactos).
    - [ ] **Validación en API:** responder con mensaje claro al violar unicidad.
    - [ ] Evitar que se guarden tratamientos idénticos (misma mascota, mismo producto y fecha) por error.
    - [ ] **Avisos claros en pantalla:** Si el usuario intenta registrar algo que ya existe (por ejemplo, una mascota con un nombre ya usado), la aplicación le mostrará un aviso visual muy claro explicando el problema.
    - [ ] **Validación previa**: Comprobar que los campos obligatorios estén completos antes de permitir enviar la información. Ayudando a que el Usuario corrija sus errores al instante.

## Hito 6: Despliegue en Firebase / Supabase y Dockering.

**Fecha tentativa:** Por definir

**Objetivo:** Empaquetar el sistema para facilitar su despliegue, configurar la infraestructura definitiva en la nube y preparar la aplicación para su despliegue en entorno de producción definitivo.

- **Issue #14: Dockerización**
  - **Descripción:** Desplegar app, base de datos y autenticación en la plataforma elegida.
    - [ ] Crear la configuración de contenedores para la aplicación, asegurando que el sistema se ejecute de forma idéntica e independiente en cualquier servidor o entorno.

- **Issue #15: Backend — Deploy y Configuración en Firebase / Supabase**
  - **Descripción:** Desplegar app, base de datos y autenticación en la plataforma elegida.
  - **Tareas:**
    - [ ] Configurar proyecto en Firebase **o** Supabase.
    - [ ] Migrar esquemas y constraints a la BD gestionada.
    - [ ] **Pruebas finales de funcionamiento:** Comprobar que el registro, el inicio de sesión y el funcionamiento general operen sin fallos en el entorno definitivo antes de dar el proyecto por finalizado.

## Fuera del alcance planificado

Todo lo no listado en Hitos 1–6 queda fuera del alcance evaluado.

- Conexión de pantallas de Issue #12 a Backend.
- Notificaciones push, recordatorios, calendario, centro de notificaciones.
- CI/CD completo con Docker, GitHub Actions, staging, rollback automático.
- Autenticación social (Google, Apple) — solo email/password evaluado.
