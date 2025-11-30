# PWA Support for BarStage

Esta aplicación es una Progressive Web App (PWA) que soporta funcionamiento offline y sincronización con Firestore.

## Características PWA

### Instalación
- La app puede instalarse en dispositivos móviles y escritorio
- En Chrome, aparecerá un icono de instalación en la barra de direcciones
- En iOS Safari, usa "Añadir a pantalla de inicio" desde el menú de compartir

### Funcionamiento Offline
- Los assets estáticos se cachean automáticamente
- La navegación funciona sin conexión gracias al Service Worker
- Los datos se sincronizan cuando se recupera la conexión

### Iconos
Los iconos de la app se encuentran en `public/icons/`:
- `icon-192.png` - Icono 192x192 (principal)
- `icon-256.png` - Icono 256x256
- `icon-384.png` - Icono 384x384
- `icon-512.png` - Icono 512x512
- `icon-192-alt.png` - Icono alternativo 192x192

Iconos adicionales:
- `public/apple-touch-icon.png` - Icono para iOS (180x180)
- `public/favicon.ico` - Favicon multi-resolución

## Service Worker

El Service Worker (`src/service-worker.js`) implementa las siguientes estrategias:

### Estrategias de Caché
1. **Navegación (HTML)**: Network-first con fallback a caché
2. **Assets estáticos**: Cache-first con fallback a red
3. **Requests Firebase**: Siempre van a la red (nunca se cachean)

### Dominios excluidos del caché
- `firebasestorage.googleapis.com`
- `firestore.googleapis.com`
- `firebase.googleapis.com`
- `identitytoolkit.googleapis.com`
- `securetoken.googleapis.com`
- Paths que empiezan con `/__/`

## Firestore IndexedDB Persistence

La persistencia de IndexedDB permite que los datos de Firestore estén disponibles offline:

```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Múltiples pestañas abiertas
      console.warn('Persistence only works in one tab at a time');
    } else if (err.code === 'unimplemented') {
      // Navegador no soportado
      console.warn('Persistence not supported');
    }
  });
```

### Notas importantes sobre persistencia
- **Una sola pestaña**: La persistencia solo funciona en una pestaña a la vez
- **Datos locales**: Los cambios se guardan localmente y se sincronizan cuando hay conexión
- **Conflictos**: En caso de conflicto, gana el último cambio sincronizado

## Pruebas

### Probar PWA en desarrollo
1. Ejecuta `npm run build`
2. Sirve el build: `npx serve -s build`
3. Abre la URL en el navegador

### Probar modo offline
1. Abre DevTools > Application > Service Workers
2. Marca "Offline"
3. Navega por la app - debería funcionar sin conexión

### Probar instalación
1. En Chrome, busca el icono de instalación en la barra de direcciones
2. En móvil, usa el menú "Añadir a pantalla de inicio"

### Verificar manifiesto
1. DevTools > Application > Manifest
2. Verifica que todos los iconos se carguen correctamente

## Actualizaciones

Cuando hay una nueva versión disponible:
1. El Service Worker detecta el cambio
2. Se muestra una notificación al usuario
3. El usuario puede recargar para obtener la nueva versión

## Solución de problemas

### El Service Worker no se registra
- Asegúrate de estar en HTTPS o localhost
- Verifica que no hay errores en la consola
- Limpia caché y recarga

### La persistencia de Firestore falla
- Verifica que solo tienes una pestaña abierta
- Comprueba compatibilidad del navegador
- Revisa los errores en consola

### Los iconos no se muestran
- Verifica las rutas en `manifest.json`
- Asegúrate de que los archivos existen en `public/icons/`
- Limpia caché del navegador
