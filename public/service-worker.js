/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'count-game-cache-v1';

// Core assets that must be available offline
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-256.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
  '/apple-touch-icon.png'
];

// Firebase domains to skip caching - these should never be cached
// to avoid conflicts with Firestore persistence and stale data
const FIREBASE_DOMAINS = [
  'firestore.googleapis.com',
  'firebasestorage.googleapis.com',
  'firebase.googleapis.com',
  'firebaseio.com',
  'firebaseapp.com'
];

/**
 * Check if a URL is a Firebase-related request
 * @param {URL} url - The URL to check
 * @returns {boolean} - True if the URL is Firebase-related
 */
function isFirebaseRequest(url) {
  // Check for Firebase domains
  for (const domain of FIREBASE_DOMAINS) {
    if (url.hostname === domain || url.hostname.endsWith('.' + domain)) {
      return true;
    }
  }
  
  // Check for Firebase internal paths
  if (url.pathname.startsWith('/__/')) {
    return true;
  }
  
  return false;
}

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Cache assets gracefully - continue even if some fail
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Some assets failed to cache:', error.message);
        });
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
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
  // This prevents conflicts with Firestore IndexedDB persistence
  if (isFirebaseRequest(url)) {
    return;
  }

  // For navigation requests (HTML), use network-first strategy
  // This ensures the app updates when online
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
