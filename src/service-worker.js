/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'count-game-cache-v1';
// Core assets that must be available offline
// Note: React build generates hashed filenames; these paths are for basic assets.
// For full PWA support with hashed assets, consider using Workbox in production.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-256.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use addAll for required assets, but handle failures gracefully
        // since some assets may not exist during development
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch((error) => {
              console.warn(`Failed to cache ${url}:`, error.message);
              return null;
            })
          )
        );
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip Firebase-related requests to avoid caching dynamic data
  // Use endsWith for hostname checks to prevent subdomain bypass attacks
  if (
    url.hostname === 'firestore.googleapis.com' ||
    url.hostname.endsWith('.firestore.googleapis.com') ||
    url.hostname === 'firebaseio.com' ||
    url.hostname.endsWith('.firebaseio.com') ||
    url.hostname === 'firebase.google.com' ||
    url.hostname.endsWith('.firebase.google.com') ||
    url.hostname === 'firebaseapp.com' ||
    url.hostname.endsWith('.firebaseapp.com') ||
    url.pathname.startsWith('/__/auth') ||
    url.pathname.startsWith('/__/firebase')
  ) {
    return;
  }

  // For navigation requests (HTML), use network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cached version if network fails
          return caches.match(request).then((response) => {
            return response || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For other static assets, use cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
  );
});
