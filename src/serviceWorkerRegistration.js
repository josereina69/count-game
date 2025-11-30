// Service Worker Registration Helper
// Handles registration, unregistration, and update notifications

const isLocalhost = Boolean(
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/))
);

/**
 * Configuration options for service worker registration
 * @typedef {Object} Config
 * @property {Function} [onSuccess] - Called when content is cached for offline use
 * @property {Function} [onUpdate] - Called when new content is available
 */

/**
 * Register the service worker
 * @param {Config} config - Configuration options
 */
export function register(config) {
  if (process.env.NODE_ENV === 'production' || isLocalhost) {
    if ('serviceWorker' in navigator) {
      const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
      
      // SW won't work if PUBLIC_URL is on a different origin
      if (publicUrl.origin !== window.location.origin) {
        console.warn('[SW] PUBLIC_URL is on a different origin. Not registering service worker.');
        return;
      }

      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
        
        if (isLocalhost) {
          // Running on localhost - check if SW exists
          checkValidServiceWorker(swUrl, config);
          navigator.serviceWorker.ready.then(() => {
            console.log('[SW] Running in localhost mode with service worker.');
          });
        } else {
          // Production - register SW normally
          registerValidSW(swUrl, config);
        }
      });
    }
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('[SW] Service worker registered with scope:', registration.scope);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log('[SW] New content available; please refresh.');
              
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Content is cached for offline use
              console.log('[SW] Content is cached for offline use.');
              
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('[SW] Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker file exists
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found - reload the page
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found - proceed with registration
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[SW] No internet connection found. App is running in offline mode.');
    });
}

/**
 * Unregister all service workers
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('[SW] Error unregistering service worker:', error.message);
      });
  }
}
