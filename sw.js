// sw.js - Service Worker para Galicia Guide PWA
const CACHE_NAME = 'galicia-guide-v2-2025';
const STATIC_CACHE = 'galicia-static-v2';
const IMAGE_CACHE = 'galicia-images-v2';
const DYNAMIC_CACHE = 'galicia-dynamic-v2';

// Assets críticos para precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/offline.html'
];

// Instalación: Precaching
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.error('[SW] Error en precache:', err))
  );
});

// Activación: Limpieza de caches antiguas
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('galicia-') && 
                   name !== STATIC_CACHE && 
                   name !== IMAGE_CACHE &&
                   name !== DYNAMIC_CACHE;
          })
          .map((name) => {
            console.log('[SW] Eliminando cache antigua:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategias de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones no GET
  if (request.method !== 'GET') return;

  // Estrategia 1: Cache First para assets estáticos
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Estrategia 2: Stale While Revalidate para imágenes
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // Estrategia 3: Network First para API/datos
  if (url.pathname.includes('/api/') || request.headers.get('Accept')?.includes('application/json')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Estrategia 4: Network with cache fallback para navegación
  if (request.mode === 'navigate') {
    event.respondWith(networkWithCacheFallback(request, STATIC_CACHE));
    return;
  }

  // Default: Cache first
  event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
});

// Helpers de estrategias
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    // Si es una imagen, retornar placeholder
    if (request.destination === 'image') {
      return cache.match('/img/placeholder.jpg');
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    
    // Retornar respuesta offline para APIs
    return new Response(JSON.stringify({ offline: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function networkWithCacheFallback(request, cacheName) {
  try {
    return await fetch(request);
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    
    // Página offline como último recurso
    return cache.match('/offline.html');
  }
}

function isStaticAsset(request) {
  const destinations = ['style', 'script', 'font', 'manifest'];
  const extensions = ['.css', '.js', '.json', '.woff2', '.woff'];
  
  return destinations.includes(request.destination) ||
         extensions.some(ext => request.url.endsWith(ext));
}

// Background Sync para acciones offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncFavorites() {
  // Sincronizar favoritos cuando vuelva la conexión
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_COMPLETE', data: 'favorites' });
  });
}

// Push Notifications (preparado para futuro)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'Nueva actualización en Galicia Guide',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: data.tag || 'default',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Galicia Guide', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Mensajes desde la app
self.addEventListener('message', (event) => {
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CACHE_NAME });
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then(names => 
          Promise.all(names.map(name => caches.delete(name)))
        )
      );
      break;
  }
});
