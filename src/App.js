import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Enable IndexedDB persistence for offline support
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('[Firestore] IndexedDB persistence enabled successfully');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open - persistence can only be enabled in one tab at a time
      console.warn('[Firestore] Persistence failed: Multiple tabs open. Persistence is only available in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('[Firestore] Persistence not supported by this browser.');
    } else {
      console.error('[Firestore] Error enabling persistence:', err);
    }
  });

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>BarStage</h1>
        <p>Gestor de Puntuación Colaborativo</p>
        {!isOnline && (
          <p style={{ color: '#ff9800' }}>
            ⚠️ Sin conexión - Modo offline activo
          </p>
        )}
      </header>
      <main>
        <p>
          Bienvenido a BarStage, tu marcador de puntuación para juegos de cartas.
        </p>
      </main>
    </div>
  );
}

export { db };
export default App;
