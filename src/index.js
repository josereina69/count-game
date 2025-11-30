// Ejemplo de entry que registra el service worker en producción.
// Si ya tienes un index.js, añade (o merge) las líneas de registro al final.
// Asegúrate de importar registerServiceWorker y llamarlo solo en producción.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Si usas el archivo que te di:
import { registerServiceWorker } from './registerServiceWorker';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Registrar SW solo en producción (evita interferir con dev server)
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker();
}