/* eslint-disable no-restricted-globals */

// Service Worker for BarStage PWA
// Strategies:
// - Navigation requests: Network-first with cache fallback
// - Static assets: Cache-first with network fallback
// - Firebase requests: Always network (never cache)

const CACHE_NAME = 'barstage-cache-v1';
const STATIC_CACHE_NAME = 'barstage-static-v1';

// Assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-256.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png'
];

// Firebase domains that should never be cached
const FIREBASE_DOMAINS = [
  'firebasestorage.googleapis.com',
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com'
];

// Check if a request should bypass the cache (Firebase or internal paths)
function shouldBypassCache(url) {
  try {
    const parsedUrl = new URL(url);
    
    // Check Firebase domains
    if (FIREBASE_DOMAINS.some(domain => parsedUrl.hostname.includes(domain))) {
      return true;
    }
    
    // Check internal paths starting with /__/
    if (parsedUrl.pathname.startsWith('/__/')) {
      return true;
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Some precache assets failed:', err);
        // Don't fail the install if some assets are missing
      });
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Never cache Firebase requests
  if (shouldBypassCache(request.url)) {
    return;
  }
  
  // Navigation requests: Network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache, then to index.html for SPA navigation
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }
  
  // Other requests (assets): Cache-first strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      
      return fetch(request).then((response) => {
        // Only cache successful same-origin responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        
        return response;
      }).catch(() => {
        // Return placeholder for failed image requests
        if (request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        return new Response('Network error', { status: 408 });
      });
    })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
