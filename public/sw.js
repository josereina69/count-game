// Simple service worker for basic PWA offline support.
// Strategy: cache-first for navigation and assets, network fallback.
// This is intentionally small and robust for Create React App builds.
// NOTE: During "npm run build" CRA will fingerprint assets; this SW doesn't try to pre-cache them.
// It will cache responses at runtime as they are requested.

const CACHE_NAME = 'barstage-shell-v1';
const FALLBACK_HTML = '/index.html';
const ALLOWED_METHOD = 'GET';

// Files we attempt to pre-cache (index + root). Keep minimal.
const PRE_CACHE = [
  '/',
  FALLBACK_HTML,
  '/favicon.svg',
  '/logo.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE).catch(() => {
        // ignore errors (some assets may not exist in dev)
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET requests
  if (req.method !== ALLOWED_METHOD) return;

  // For navigation requests (SPA), try network first, fallback to cache/index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        // put a clone in cache
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(FALLBACK_HTML))
    );
    return;
  }

  // For other requests (assets), use cache-first then network fallback and cache new resources
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // only cache successful responses (status 200) and same-origin requests
        try {
          const requestUrl = new URL(req.url);
          if (!res || res.status !== 200 || requestUrl.origin !== location.origin) {
            return res;
          }
        } catch (e) {
          return res;
        }
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, copy);
        });
        return res;
      }).catch(() => {
        // final fallback: if request is for image, return a 1x1 transparent gif dataURI
        if (req.destination === 'image') {
          return new Response(
            atob('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='),
            { headers: { 'Content-Type': 'image/gif' } }
          );
        }
      });
    })
  );
});