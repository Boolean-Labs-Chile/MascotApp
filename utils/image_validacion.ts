import * as FileSystem from 'expo-file-system';

const TAMAÑO_MAXIMO_BYTES = 5 * 1024 * 1024;
const EXTENSIONES_VALIDAS = ['.jpg', '.jpeg', '.png', '.webp'];

export async function validarImagen(uri: string): Promise<{ valido: boolean; mensaje?: string }> {
  const uriLower = uri.toLowerCase();
  const tieneExtensionValida = EXTENSIONES_VALIDAS.some(ext => uriLower.endsWith(ext));
  const esUriMovil = uriLower.startsWith('content://') || uriLower.startsWith('file://');

  if (!tieneExtensionValida && !esUriMovil) {
    return { 
      valido: false, 
      mensaje: 'El formato de la imagen no es compatible. Usa JPG, PNG o WEBP.' 
    };
  }

  if (uriLower.startsWith('file://') || uriLower.startsWith('content://')) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        return { valido: false, mensaje: 'El archivo de imagen seleccionado no existe.' };
      }

      if (fileInfo.size && fileInfo.size > TAMAÑO_MAXIMO_BYTES) {
        return { 
          valido: false, 
          mensaje: 'La imagen pesa más de 5 MB. Por favor elige una más liviana.' 
        };
      }
    } catch (error) {
      return { valido: false, mensaje: 'No se pudo leer el peso de la imagen.' };
    }
  }

  return { valido: true };
}