// sw.js — Galicia Guide — GitHub Pages /GUIA/
const CACHE = 'galicia-v6';
const BASE  = '/GUIA';

const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/styles.css',
  BASE + '/app.js',
  BASE + '/manifest.json',
  BASE + '/data.json'
];

self.addEventListener('install', () => {
  self.skipWaiting();
  caches.open(CACHE).then(cache =>
    Promise.allSettled(ASSETS.map(url => cache.add(url).catch(() => {})))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// data.json: red primero (para pillar actualizaciones), caché como fallback
// Imágenes: caché primero
// Todo lo demás: red primero
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isImage = event.request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname);

  if (isImage) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(c => c.put(event.request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Red primero, caché como fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(c => c.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
