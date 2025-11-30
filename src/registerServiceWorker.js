// Register a simple service worker (public/sw.js).
// Call registerServiceWorker() from src/index.js (only in production builds).

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/sw.js`;
      navigator.serviceWorker.register(swUrl)
        .then((registration) => {
          console.log('Service Worker registrado con scope:', registration.scope);
          // optional: listen for updates
          registration.onupdatefound = () => {
            const installing = registration.installing;
            if (!installing) return;
            installing.onstatechange = () => {
              if (installing.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content available, you could notify user to refresh
                  console.log('Nuevo contenido disponible; recargar para ver cambios.');
                } else {
                  console.log('Contenido cacheado para uso offline.');
                }
              }
            };
          };
        })
        .catch((err) => {
          console.warn('Error registrando Service Worker:', err);
        });
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) {
        reg.unregister();
      }
    });
  }
}