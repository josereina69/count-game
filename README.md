# count-game

Marcador colaborativo (PWA) — instrucciones rápidas.

Instalación
1. Instala dependencias:
   npm install

Desarrollo
1. Ejecuta en modo desarrollo:
   npm start

Build producción
1. Crear build:
   npm run build

Despliegue
- Recomiendo Vercel para despliegue continuo y HTTPS.
- Alternativa rápida: GitHub Pages (usar gh-pages) o servir la carpeta build con `npx serve -s build`.

Notas
- Añade tu logo en `public/logo.svg` y los iconos en `public/icons/icon-192.png` y `public/icons/icon-512.png`.
- No subas archivos con secretos. Si usas Firebase, puedes incluir `src/firebaseConfig.js` con la configuración pública (apiKey, projectId), pero no subas claves de servidor.
- Si ya tienes `src/index.js`, solo añade la llamada a `registerServiceWorker()` como muestro en `src/index.js` ejemplo.