// Main entry point for BarStage PWA
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Service Worker Registration
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Register service worker with update notification
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    console.log('Nueva versión disponible. Recarga la página para actualizar.');
    // Optionally show a notification to the user
    if (window.confirm('Hay una nueva versión disponible. ¿Deseas recargar la página?')) {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    }
  },
  onSuccess: () => {
    console.log('Contenido cacheado para uso offline.');
  }
});