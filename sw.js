// sw.js — Galicia Guide v5
// Código siempre desde la red. Solo imágenes en caché.
const IMG_CACHE = 'galicia-img-v5';

// Instalar y activar inmediatamente sin esperar
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  // Borrar TODOS los cachés anteriores
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== IMG_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isImage = event.request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname);

  if (isImage) {
    // Solo imágenes: caché primero, red como fallback
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(IMG_CACHE).then(c => c.put(event.request, copy));
          }
          return response;
        });
      })
    );
  }
  // Todo lo demás (HTML, JS, CSS): directo desde la red, sin interceptar
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
