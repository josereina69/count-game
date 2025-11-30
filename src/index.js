import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Callback for when a new service worker update is available
const onUpdateCallback = (registration) => {
  console.log('New version available! Close all tabs to update.');
  // You can add custom UI notification here if desired
  // For example, show a toast or banner prompting the user to refresh
};

// Register service worker for PWA functionality
// This enables offline capabilities and caching
serviceWorkerRegistration.register('/service-worker.js', {
  onUpdate: onUpdateCallback,
  onSuccess: () => {
    console.log('Service worker registered successfully');
  }
});
