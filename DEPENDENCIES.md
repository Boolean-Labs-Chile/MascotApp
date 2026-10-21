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

## @react-navigation/drawer

- **Versión**: ^7.5.0
- **Finalidad:** Proporcionar el navegador de tipo cajón (Drawer) de React Navigation, que `expo-router` expone como `expo-router/drawer`, para el menú lateral de la app.
- **Motivo:** Permitir alternar entre los perfiles de mascotas desde un panel deslizable, accesible con un botón en el header o arrastrando desde el borde de la pantalla.
- **Categoría:** dependencies
- **Config:** Ninguna adicional
  - **Instalación:** Mediante `npx expo install @react-navigation/drawer`
  - **Uso:** Importar `Drawer` desde `expo-router/drawer` dentro de un `_layout.tsx`, y `DrawerContentScrollView` desde `@react-navigation/drawer` para el contenido propio del panel.
- **Responsable:** @gramzdev

## react-native-gesture-handler

- **Versión**: ~2.28.0
- **Finalidad**: Proveer los gestos que requiere el `Drawer` (deslizar para abrir y cerrar el menú lateral).
- **Motivo**: `@react-navigation/drawer` no funciona sin esta librería. Pasó a ser obligatoria al adoptar el Sidebar (Issue #3); hasta entonces solo la transitaba Reanimated.
- **Categoría:** dependencies
- **Config:**
  - **Instalación:** Mediante `npx expo install react-native-gesture-handler`
  - **Uso:** Envolver el `Drawer` con `GestureHandlerRootView` en `app/(drawer)/_layout.tsx`, y alternar el menú con `DrawerActions.toggleDrawer()` desde `components/SidebarToggler.tsx`. Sin el `GestureHandlerRootView` en la raíz del Drawer el menú no responde.
- **Responsable:** @gramzdev

## firebase

- **Versión**: ^13.0.0
- **Finalidad**: SDK web (JavaScript) de Firebase. Provee Authentication (registro, inicio y cierre de sesión con correo y contraseña) y Firestore (base de datos en la nube).
- **Motivo:** Implementar la autenticación real del Hito 4 (Issue #11) y respaldar las mascotas en Firestore. Se eligió el SDK web en lugar de `@react-native-firebase` porque este último no funciona en Expo Go, donde se presenta la app.
- **Categoría:** dependencies
- **Config:**
  - **Instalación:** Mediante `npm install firebase`
  - **Configuración:** `config/firebase.ts` construye `firebaseConfig` a partir de `google-services.json` (raíz del proyecto), el archivo que entrega Firebase al registrar la app Android. `app.json` lo declara en `android.googleServicesFile` para cuando se compile la app.
  - **Uso:** Importar `auth` desde `@/config/auth` para las funciones de `firebase/auth` (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `onAuthStateChanged`), y `firestore` desde `@/config/firebase` para las de `firebase/firestore` (`doc`, `setDoc`). El estado de la sesión se lee con `useSesion()` de `@/contexts/sesion-context`.
- **Responsable:** @Darkhee

## @react-native-async-storage/async-storage

- **Versión**: 2.2.0
- **Finalidad**: Almacenamiento local de pares clave-valor en el dispositivo.
- **Motivo:** Firebase Auth la necesita para guardar la sesión en React Native. Sin ella, el usuario tendría que iniciar sesión cada vez que abre la app.
- **Categoría:** dependencies
- **Config:**
  - **Instalación:** Mediante `npx expo install @react-native-async-storage/async-storage`
  - **Uso:** No se usa directamente en las pantallas. `config/auth.ts` la entrega a Firebase con `initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) })`.
- **Responsable:** @Darkhee