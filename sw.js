/**
 * GestikFit - Service Worker für 100% Offline-Betrieb & PWA Support
 */

const CACHE_NAME = 'gestikfit-v1';
const ASSETS = [
  './',
  './index.html',
  './css/custom.css',
  './js/audio.js',
  './js/gestures-data.js',
  './js/detector.js',
  './js/adaptive.js',
  './js/confetti.js',
  './js/app.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('GestikFit SW cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Für Online-CDNs (z.B. MediaPipe, Tailwind) Netzwerk bevorzugen, sonst Cache
  if (event.request.url.includes('cdn.jsdelivr.net') || event.request.url.includes('cdn.tailwindcss.com')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Für lokale Ressourcen: Cache First mit Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
