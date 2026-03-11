const CACHE_NAME = 'galicia-v2'; // Cambiamos la versión para forzar la actualización

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // Cacheamos las librerías externas críticas para que el mapa funcione offline
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  // Iconos base del mapa (necesarios para que Leaflet funcione)
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
];

// Instalación: precargamos lo esencial
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.log('Cache error:', err))
  );
});

// Activación: limpiamos cachés viejas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia de Fetch
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // 1. ESTRATEGIA PARA IMÁGENES (Cache First)
  // Si es una imagen (jpg, png, svg), la guardamos para siempre.
  if (request.destination === 'image' || /\.(jpg|png|svg|webp)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => caches.match('./index.html')); // Fallback si falla red y no está en cache
      })
    );
    return;
  }

  // 2. ESTRATEGIA PARA GOOGLE FONTS
  // Cacheamos las fuentes para que la tipografía funcione offline
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    e.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 3. ESTRATEGIA PARA EL RESTO (Network First)
  // Intentamos la red, si falla, vamos a la caché (ideal para HTML y JSON)
  e.respondWith(
    fetch(request)
      .then(response => {
        // Guardamos una copia de lo que traigamos de la red (excepto mapas tiles que son muchos)
        if (request.method === 'GET' && !url.href.includes('tile.openstreetmap')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
  );
});
