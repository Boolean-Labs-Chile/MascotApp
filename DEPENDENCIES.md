# Dependencias adicionales del Proyecto

## @react-native-community/datetimepicker

- **Versión**: 8.4.4
- **Finalidad**: Proporcionar componentes nativos para la selección de fechas y horas (DatePicker y TimePicker) en iOS y Android.
- **Motivo:** Permitir a los usuarios seleccionar fechas y horas de forma intuitiva, consistente y adaptada al diseño y comportamiento nativo de cada sistema operativo (iOS y Android).
- **Categoría:** dependencies
- **Config:** Ninguna adicional
  - **Instalación:** Mediante `npx expo install @react-native-community/datetimepicker`
  - **Uso:** Importar DateTimePicker desde @react-native-community/datetimepicker indicando las propiedades clave (value, mode, display, onChange).

- **Responsable:** @gramzdev

## expo-image-picker

- **Versión**: ~17.0.11
- **Finalidad**: Proporcionar acceso al carrete de fotos, la biblioteca multimedia y la cámara del dispositivo para seleccionar o tomar imágenes y videos.
- **Motivo:** Permitir a los usuarios adjuntar imágenes, cambiar fotos de perfil o capturar fotos/videos desde la aplicación de forma sencilla.
- **Categoría:** dependencies
- **Config:**
  - **Instalación:** Mediante `npx expo install expo-image-picker`
  - **Permisos:** Se configura automáticamente en Expo Go / Development Builds, o mediante el plugin en app.json (app.config.js) para personalizar los mensajes de solicitud de permisos (cámara y biblioteca de fotos)
  - **Uso:** Uso: Solicitar permisos en tiempo de ejecución con `requestMediaLibraryPermissionsAsync()` / `requestCameraPermissionsAsync()` y lanzar el selector con `launchImageLibraryAsync()` o `launchCameraAsync()`.
- **Responsable:** @gramzdev
