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
    - [] Implementar el menú lateral (Sidebar) para poder alternar fácilmente entre los perfiles de mascotas.

    > **Nota**: además del Stack principal se añadió un grupo `(auth)` (login y registrarse) y una navegación por `Tabs` con tres secciones: **Perfil**, **Registro Médico** y **Contactos**. El Sidebar sigue pendiente.

- **Issue #4: Inicialización de Base de Datos SQLite**
  - **Descripción:** Crear el script de arranque que instancie las tablas necesarias en el dispositivo.
  - **Tareas:**

    - [ ] Configurar conexión local con `expo-sqlite` (Si es que vamos con esa librería finalmente).
    - [ ] Escribir query de creación para tablas `Usuario` y `Mascota` y `Tratamiento`, incluyendo la restricción de imagen.

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

    - [ ] Implementar función `INSERT` en SQLite para guardar la mascota.
    - [ ] Guardar la URL de la imagen en el dispositivo con `expo-file-system` (si escogemos esa librería).
    - [ ] Implementar función `SELECT` en SQLite para cargar las mascotas en el Sidebar.
    - [ ] Construir la vista principal de detalles de la mascota.

    > **Nota**: el selector de foto ya funciona a nivel de interfaz (Issue #5), pero la imagen aún no se persiste en disco. El handler `handleGuardar` en `app/mascota-nueva.tsx` es un placeholder: todo el CRUD queda pendiente.

- **Issue #7: Actualizar y eliminar registros de Mascota**
  - **Descripción:** Finalizar el CRUD permitiendo la edición y eliminación.
  - **Tareas:**

    - [ ] Habilitar modo edición en la vista de detalles y ejecutar `UPDATE` en SQLite.
    - [ ] Implementar botón de eliminar con confirmación y ejecutar `DELETE` en SQLite

## Hito 3: Registro de Tratamientos y Cierre de Entregable

**Fecha tentativa:** 28 de Septiembre - 1 de Octubre.

**Objetivo:** El Usuario debe poder registrar tratamientos asociados a una Mascota. Preparación final para el entregable del 2 de Octubre.

- **Issue #8: UI/UX - Gestión de Tratamientos**
  - **Descripción:** Finalizar el CRUD permitiendo la edición y eliminación.
  - **Tareas:**

    - [ ] Crear formulario con campos: `nombre_producto`, `tipo_tratamiento` (Interno/Externo), `fecha_aplicación` y `fecha_siguiente_dosis`.
    - [ ] Crear lista o tabla en la vista de la mascota para visualizar su historial de tratamientos.

    > **Nota**: la pantalla `app/(tabs)/registro-medico.tsx` ya existe como pestaña de los `Tabs`, pero es un placeholder sin funcionalidad.

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

## Fuera del alcance planificado

Funcionalidad añadida durante el desarrollo que **no figura en ningún issue** de este roadmap.
Decidir si se incorpora al alcance o se retira antes del code freeze:

- **Autenticación (UI):** pantallas de login y registro con validación local pendiente. Hoy el "registro" no crea usuario: solo navega al alta de mascota.
