import React, { useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'your-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'your-auth-domain',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'your-storage-bucket',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || 'your-messaging-sender-id',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || 'your-app-id'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable IndexedDB persistence for offline support
// This is called asynchronously and errors are handled gracefully
const initializePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Firestore persistence enabled successfully');
  } catch (err) {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn(
        'Firestore persistence failed: Multiple tabs open. ' +
        'Persistence can only be enabled in one tab at a time.'
      );
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required for persistence.
      console.warn(
        'Firestore persistence failed: Browser does not support IndexedDB persistence.'
      );
    } else {
      console.error('Firestore persistence error:', err);
    }
  }
};

// Initialize persistence (non-blocking)
initializePersistence();

function App() {
  useEffect(() => {
    // App initialization logic can go here
    console.log('App initialized with Firestore');
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Count Game</h1>
        <p>Welcome to the Count Game!</p>
      </header>
    </div>
  );
}

export { db };
export default App;
