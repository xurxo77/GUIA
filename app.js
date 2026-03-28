// ================================================================
// GALICIA APP — JAVASCRIPT MEJORADO 2025
// PWA Moderna + MD3 Expressive + Optimizaciones de Performance
// ================================================================

'use strict';

// ── CONFIGURACIÓN GLOBAL ───────────────────────────────────────
const CONFIG = {
  VERSION: '2025.3.28',
  CACHE_NAME: 'galicia-guide-v2',
  PASSWORD: 'caamaño',
  ANIMATION_DURATION: 350,
  DEBOUNCE_DELAY: 150,
  MAP_ZOOM_DEFAULT: 7,
  MAP_CENTER: [42.6, -8.4],
  TOTAL_SABIAS_QUE: 17000,
  TEXT_FADE_AT: 15000
};

// ── ESTADO GLOBAL ─────────────────────────────────────────────
const state = {
  mainMap: null,
  fsMap: null,
  markers: {},
  fullscreenMarkers: {},
  userLocation: null,
  userMarker: null,
  selectedPlaces: [],
  favorites: [],
  currentSection: 'hero',
  isOnline: navigator.onLine,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  touchStartY: 0,
  touchEndY: 0,
  isPulling: false
};

// ── DATOS ─────────────────────────────────────────────────────
const bloques = [
  { id: "acoruna", nombre: "A Coruña", nombreCorto: "A Coruña", subtitulo: "Costa da Morte, Ártabro, Santiago...", emoji: "🌊" },
  { id: "lugo", nombre: "Lugo", nombreCorto: "Lugo", subtitulo: "Rías Altas, Os Ancares...", emoji: "🌲" },
  { id: "ourense", nombre: "Ourense", nombreCorto: "Ourense", subtitulo: "Ribeira Sacra, Cañón del Sil...", emoji: "🏔️" },
  { id: "pontevedra", nombre: "Pontevedra", nombreCorto: "Pontevedra", subtitulo: "Rías Baixas, Cíes, Ons...", emoji: "🌅" }
];

const categorias = [
  { id: "ciudades", nombre: "Ciudades", nombreCorto: "Ciudad", emoji: "🏛️" },
  { id: "villas", nombre: "Villas", nombreCorto: "Villa", emoji: "🏘️" },
  { id: "pueblos", nombre: "Pueblos", nombreCorto: "Pueblo", emoji: "⚓" },
  { id: "costa", nombre: "Costa", nombreCorto: "Costa", emoji: "🏖️" },
  { id: "naturaleza", nombre: "Naturaleza", nombreCorto: "Naturaleza", emoji: "🌿" },
  { id: "patrimonio", nombre: "Patrimonio", nombreCorto: "Patrimonio", emoji: "🏰" },
  { id: "magicos", nombre: "Mágicos", nombreCorto: "Mágico", emoji: "✨" },
  { id: "termalismo", nombre: "Termalismo", nombreCorto: "Termalismo", emoji: "♨️" }
];

const curiosidades = [
  "<strong>La diáspora gallega es uno de los movimientos migratorios más grandes de Europa.</strong> Se calcula que, entre finales del siglo XIX y el siglo XX, más de 2 millones de gallegos emigraron, sobre todo a países como Argentina, Cuba y Uruguay.<br><br>👉 Hoy, hay casi tantos descendientes de gallegos fuera como en la propia Galicia.",
  
  "<strong>Galicia no solo tiene más de 1.000 ríos, sino que es una potencia en producción de energía eléctrica.</strong> En 2024, generó más de 23.000 GWh de electricidad, gran parte con energías limpias como la hidráulica, eólica y solar.<br><br>👉 Aproximadamente el 40% de esa energía sobrante se exportó a otras partes de España y Europa.",
  
  "<strong>Galicia fue uno de los primeros reinos de Europa.</strong> Tras la caída del Imperio Romano, en el siglo V, Galicia se consolidó como el Reino de los Suevos.<br><br>👉 Se convirtió en uno de los primeros reinos establecidos en toda Europa occidental.",
  
  "<strong>Galicia mantiene huellas vivas de su cultura celta.</strong> Los antiguos castros de piedra, la música con gaitas y muchas de sus tradiciones y leyendas populares reflejan la herencia celta que aún late en nuestra tierra.",

  "<strong>Para los romanos, Galicia era el literal 'Fin del Mundo'.</strong> Al llegar a Fisterra (Finis Terrae) y ver el sol hundirse en el océano, las legiones romanas creían que el mar hervía y no había nada más allá.<br><br>👉 Hoy es el final épico para muchos peregrinos del Camino de Santiago.",

  "<strong>Breogán aparece en el Lebor Gabála Érenn.</strong> Este texto medieval irlandés cuenta cómo Breogán levantó una gran torre en Galicia desde la que sus descendientes vieron Irlanda, iniciando su viaje hacia la isla.<br><br>👉 La tradición sitúa esa torre en la actual Torre de Hércules, reforzando el vínculo mítico entre Galicia e Irlanda.",

  "<strong>Ourense es una de las capitales termales de Europa.</strong> Solo Budapest la supera en volumen de aguas termales. De la fuente de As Burgas, en pleno centro, el agua sale humeando a más de 60ºC.<br><br>👉 Puedes bañarte gratis en pozas naturales a orillas del río Miño, incluso en pleno invierno.",

  "<strong>El gallego y el portugués nacieron exactamente del mismo idioma.</strong> Durante la Edad Media, el galaico-portugués era la lengua de la poesía y el romance en toda la Península Ibérica.<br><br>👉 Por eso, si hablas gallego, puedes entenderte casi a la perfección con alguien en Portugal o Brasil.",

  "<strong>Galicia está llena de 'hórreos', las despensas mágicas de piedra y madera.</strong> Hay más de 30.000 repartidos por la comunidad, diseñados para guardar el grano lejos de la humedad y los roedores.<br><br>👉 El hórreo de Carnota mide casi 35 metros de largo. ¡Es más grande que muchas casas!",

  "<strong>Cuidado con pasear de noche por los bosques: podrías cruzarte con la Santa Compaña.</strong> La leyenda gallega más famosa habla de una procesión de almas en pena que vagan en la oscuridad.<br><br>👉 Dicen que huele a cera quemada a su paso, y no debes mirarles directamente si no quieres unirte a ellos.",

  "<strong>Galicia fue refugio durante la última glaciación.</strong> Su clima más suave permitió que muchísimas especies animales y vegetales sobrevivieran aquí.<br><br>👉 Mientras gran parte de Europa quedaba completamente congelada, esta tierra fue un auténtico santuario de vida.",

  "<strong>El "verde gallego" no es tan natural como parece.</strong> Gran parte del paisaje está ocupado por eucaliptos, una especie introducida de crecimiento rápido.<br><br>👉 Aunque a la vista resulte frondoso, este árbol desplaza al bosque autóctono y altera el equilibrio natural de la tierra.",

  "<strong>Los gaiteiros fueron durante siglos los músicos del pueblo.</strong> Recorrían aldeas tocando en romerías y marcaban el ritmo social de la comunidad, desde bodas hasta procesiones.<br><br>👉 Con el tiempo, pasaron de ser músicos populares a convertirse en símbolos absolutos de la cultura gallega.",

  "<strong>Los marinos gallegos fueron clave en la expansión marítima española.</strong> Durante siglos, formaron parte de grandes expediciones y rutas comerciales, curtidos por su experiencia en el duro Atlántico.<br><br>👉 No es casualidad: Galicia ha vivido siempre de cara al mar, y esa tradición sigue presente hoy en su forma de entender la vida.",

  "<strong>Rosalía de Castro dio voz a Galicia cuando casi nadie la escuchaba.</strong> En el siglo XIX, fue una de las primeras autoras en escribir en gallego tras siglos de abandono, dignificando la lengua y reflejando la morriña de su pueblo.<br><br>👉 Su inmensa obra marcó el inicio del Rexurdimento y la convirtió en el pilar fundamental de nuestra identidad cultural."
];

// Lugares (truncado para brevedad - mantén tu array completo)
const lugares = [
  // ... tu array completo de lugares aquí ...
  // Incluyo algunos ejemplos estructurales:
  { 
    id: 1, 
    nombre: "Santiago de Compostela", 
    bloque: "acoruna", 
    categorias: ["ciudades", "patrimonio"], 
    horas: 5, 
    imagen: "img/santiago.jpg", 
    lat: 42.8800, 
    lng: -8.5450, 
    porQueVenir: "Santiago es el corazón cultural de Galicia...", 
    momentoPerfecto: "A cualquier hora, pero especialmente al atardecer...", 
    imprescindibles: ["Catedral de Santiago", "Plaza del Obradoiro", "Casco histórico", "Mercado de Abastos"], 
    comer: "Pulpo, empanada, marisco y producto gallego...", 
    tomar: "Vino gallego (albariño, ribeiro) o cerveza...", 
    secreto: "Además de perderse por el casco histórico...", 
    masTiempo: ["Noia", "Padrón", "Excursiones en tren"], 
    advertencias: ["Mucho turismo en temporada alta", "Lluvia frecuente", "Precios más altos en el centro"], 
    miOpinion: "Santiago es, en el fondo, una aldea grande..."
  }
  // ... resto de lugares ...
];

// ── UTILIDADES ─────────────────────────────────────────────────

const utils = {
  // Debounce para eventos frecuentes
  debounce: (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // Throttle para scroll/resize
  throttle: (fn, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Sanitización básica de HTML
  sanitizeHTML: (str) => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  },

  // Formateo de tiempo
  formatTime: (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours === 1) return '1h';
    return `${hours}h`;
  },

  // Detección de touch
  isTouch: () => window.matchMedia('(pointer: coarse)').matches,

  // Prefers reduced motion
  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  // Generar ID único
  generateId: () => `_${Math.random().toString(36).substr(2, 9)}`,

  // Interpolación de colores
  interpolateColor: (color1, color2, factor) => {
    // Implementación básica de interpolación de colores
    return color1; // Simplificado para el ejemplo
  },

  // Observer de intersección optimizado
  createObserver: (callback, options = {}) => {
    return new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options
    });
  },

  // Medición de Core Web Vitals
  measureWebVitals: () => {
    if ('web-vitals' in window) {
      import('https://unpkg.com/web-vitals@3?module').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  },

  // Lazy loading de imágenes con IntersectionObserver
  lazyLoadImages: () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
  },

  // Animación de contador
  animateCounter: (element, target, duration = 1000) => {
    const start = 0;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = Math.floor(start + (target - start) * easeProgress);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  },

  // Gestos táctiles
  detectSwipe: (element, callbacks) => {
    let startX, startY, endX, endY;
    const threshold = 50;

    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const diffX = endX - startX;
      const diffY = endY - startY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
          diffX > 0 ? callbacks.onSwipeRight?.() : callbacks.onSwipeLeft?.();
        }
      } else {
        if (Math.abs(diffY) > threshold) {
          diffY > 0 ? callbacks.onSwipeDown?.() : callbacks.onSwipeUp?.();
        }
      }
    }, { passive: true });
  },

  // Vibración háptica
  haptic: (type = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        error: [30, 100, 30]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  },

  // Copiar al portapapeles
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Error al copiar:', err);
      return false;
    }
  },

  // Compartir nativo
  share: async (data) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error al compartir:', err);
        }
        return false;
      }
    }
    return false;
  }
};

// ── GESTIÓN DE SERVICE WORKER ─────────────────────────────────

const swManager = {
  register: async () => {
    if (!('serviceWorker' in navigator)) return false;

    try {
      // Unregister old service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports'
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nueva versión disponible
            showUpdateNotification(newWorker);
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('Error registrando SW:', error);
      return false;
    }
  },

  update: () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
      });
    }
  },

  // Forzar recarga para nueva versión
  skipWaiting: () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      });
    }
  }
};

// ── GESTIÓN DE CACHÉ ──────────────────────────────────────────

const cacheManager = {
  // Precaching de assets críticos
  precache: async (assets) => {
    const cache = await caches.open(CONFIG.CACHE_NAME);
    return cache.addAll(assets);
  },

  // Estrategia Stale-While-Revalidate
  fetchWithCache: async (request) => {
    const cache = await caches.open(CONFIG.CACHE_NAME);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
      cache.put(request, response.clone());
      return response;
    }).catch(() => cached);

    return cached || fetchPromise;
  },

  // Limpiar caches antiguos
  cleanOldCaches: async () => {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => name !== CONFIG.CACHE_NAME);
    return Promise.all(oldCaches.map(name => caches.delete(name)));
  },

  // Cache de imágenes con límite
  cacheImage: async (url, maxAge = 7 * 24 * 60 * 60 * 1000) => {
    const cache = await caches.open(`${CONFIG.CACHE_NAME}-images`);
    const cached = await cache.match(url);
    
    if (cached) {
      const date = new Date(cached.headers.get('date'));
      if (Date.now() - date.getTime() < maxAge) {
        return cached;
      }
    }
    
    const response = await fetch(url);
    cache.put(url, response.clone());
    return response;
  }
};

// ── GESTIÓN DE AUTENTICACIÓN ──────────────────────────────────

const authManager = {
  check: () => {
    return localStorage.getItem('galicia_auth') === 'true';
  },

  login: (password) => {
    const normalized = password.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const valid = normalized === CONFIG.PASSWORD || normalized === 'caamanho';
    
    if (valid) {
      localStorage.setItem('galicia_auth', 'true');
      localStorage.setItem('galicia_auth_time', Date.now().toString());
    }
    
    return valid;
  },

  logout: () => {
    localStorage.removeItem('galicia_auth');
    localStorage.removeItem('galicia_auth_time');
    localStorage.removeItem('galicia_favorites');
    localStorage.removeItem('galicia_lat');
    localStorage.removeItem('galicia_lng');
  },

  // Verificar si la sesión expiró (1 año)
  isSessionValid: () => {
    const authTime = localStorage.getItem('galicia_auth_time');
    if (!authTime) return false;
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    return Date.now() - parseInt(authTime) < oneYear;
  }
};

// ── GESTIÓN DE FAVORITOS ────────────────────────────────────

const favoritesManager = {
  load: () => {
    try {
      const saved = localStorage.getItem('galicia_favorites');
      state.favorites = saved ? JSON.parse(saved) : [];
    } catch (e) {
      state.favorites = [];
    }
    return state.favorites;
  },

  save: () => {
    localStorage.setItem('galicia_favorites', JSON.stringify(state.favorites));
  },

  toggle: (id) => {
    const index = state.favorites.indexOf(id);
    if (index > -1) {
      state.favorites.splice(index, 1);
      utils.haptic('light');
    } else {
      state.favorites.push(id);
      utils.haptic('medium');
    }
    favoritesManager.save();
    ui.updateFavoriteButton(id);
    ui.renderFavoritesSection();
    return index === -1; // true si se añadió
  },

  isFavorite: (id) => state.favorites.includes(id),

  remove: (id) => {
    const index = state.favorites.indexOf(id);
    if (index > -1) {
      state.favorites.splice(index, 1);
      favoritesManager.save();
      ui.updateFavoriteButton(id);
      ui.renderFavoritesSection();
      utils.haptic('light');
    }
  }
};

// ── GESTIÓN DE GEOLOCALIZACIÓN ────────────────────────────────

const geoManager = {
  request: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          state.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          localStorage.setItem('galicia_lat', state.userLocation.lat);
          localStorage.setItem('galicia_lng', state.userLocation.lng);
          
          mapManager.showUserLocation();
          ui.updateGeoUI(true);
          utils.haptic('success');
          
          resolve(state.userLocation);
        },
        (error) => {
          console.error('Error de geolocalización:', error);
          ui.updateGeoUI(false, error.message);
          reject(error);
        },
        options
      );
    });
  },

  toggle: () => {
    if (state.userLocation) {
      // Desactivar
      state.userLocation = null;
      mapManager.hideUserLocation();
      localStorage.removeItem('galicia_lat');
      localStorage.removeItem('galicia_lng');
      ui.updateGeoUI(false);
      utils.haptic('light');
    } else {
      // Activar
      geoManager.request();
    }
  },

  checkSaved: () => {
    const lat = localStorage.getItem('galicia_lat');
    const lng = localStorage.getItem('galicia_lng');
    
    if (lat && lng) {
      state.userLocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        accuracy: 0,
        timestamp: Date.now()
      };
      ui.updateGeoUI(true);
      return true;
    }
    return false;
  },

  calculateDistance: (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};

// ── GESTIÓN DE MAPAS ─────────────────────────────────────────

const mapManager = {
  init: () => {
    if (state.mainMap) return;

    setTimeout(() => {
      state.mainMap = L.map('map', {
        center: CONFIG.MAP_CENTER,
        zoom: CONFIG.MAP_ZOOM_DEFAULT,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: 'center',
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomControl: false,
        fadeAnimation: !utils.prefersReducedMotion(),
        markerZoomAnimation: false,
        attributionControl: false
      });

      // Control de zoom personalizado
      L.control.zoom({ position: 'bottomright' }).addTo(state.mainMap);

      // Capa de tiles optimizada
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2
      }).addTo(state.mainMap);

      // Añadir marcadores
      lugares.forEach((lugar, index) => {
        if (!lugar.lat || !lugar.lng) return;
        mapManager.addMarker(lugar, index);
      });

      // Si hay ubicación guardada, mostrarla
      if (state.userLocation) {
        mapManager.showUserLocation();
      }
    }, 100);
  },

  addMarker: (lugar, index) => {
    const isSelected = state.selectedPlaces.includes(lugar.id);
    const marker = L.marker([lugar.lat, lugar.lng], {
      icon: L.divIcon({
        className: `custom-marker ${lugar.bloque} ${isSelected ? 'selected-ring' : ''}`,
        html: `<span>${index + 1}</span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      })
    }).addTo(state.mainMap);

    marker.on('click', (e) => {
      mapManager.showPopup(lugar, e.latlng, state.mainMap);
    });

    state.markers[lugar.id] = marker;
  },

  showPopup: (lugar, latlng, mapInstance) => {
    const isSelected = state.selectedPlaces.includes(lugar.id);
    const btnText = isSelected ? '❌ Quitar de la ruta' : '➕ Añadir a la ruta';
    const btnColor = isSelected ? 'var(--accent-red)' : 'var(--accent-sea)';

    const popupHtml = `
      <div style="text-align:center; min-width: 160px; font-family: 'Google Sans', sans-serif;">
        <img src="${lugar.imagen}" 
             style="width:100%; height:90px; object-fit:cover; border-radius:8px; margin-bottom:10px; display:block;"
             onerror="this.style.display='none'">
        <div style="font-weight:700; font-size:1rem; margin-bottom:6px; color:var(--fg-ink);">${utils.sanitizeHTML(lugar.nombre)}</div>
        <div style="font-size:0.8rem; color:var(--fg-muted); margin-bottom:12px;">
          ${lugar.horas}h · ${categorias.find(c => c.id === lugar.categorias[0])?.nombreCorto || ''}
        </div>
        <button class="popup-btn" 
                style="background:${btnColor}; color:white; border:none; padding:10px 16px; border-radius:12px; font-weight:600; cursor:pointer; width:100%; font-family:inherit; font-size:0.9rem;"
                onclick="routeManager.togglePlace(${lugar.id}); mapManager.refreshPopup(${lugar.id}, this);">
          ${btnText}
        </button>
      </div>
    `;

    L.popup({ closeButton: false, offset: [0, -10] })
      .setLatLng(latlng)
      .setContent(popupHtml)
      .openOn(mapInstance);
  },

  refreshPopup: (id, btnElement) => {
    const isSelected = state.selectedPlaces.includes(id);
    btnElement.textContent = isSelected ? '❌ Quitar de la ruta' : '➕ Añadir a la ruta';
    btnElement.style.background = isSelected ? 'var(--accent-red)' : 'var(--accent-sea)';
  },

  showUserLocation: () => {
    if (!state.mainMap || !state.userLocation) return;

    if (state.userMarker) {
      state.mainMap.removeLayer(state.userMarker);
    }

    state.userMarker = L.marker([state.userLocation.lat, state.userLocation.lng], {
      icon: L.divIcon({
        className: 'user-location-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(state.mainMap);

    // Círculo de precisión
    if (state.userLocation.accuracy) {
      L.circle([state.userLocation.lat, state.userLocation.lng], {
        radius: state.userLocation.accuracy,
        color: 'var(--accent-red)',
        fillColor: 'var(--accent-red)',
        fillOpacity: 0.1,
        weight: 1
      }).addTo(state.mainMap);
    }
  },

  hideUserLocation: () => {
    if (state.userMarker) {
      state.mainMap?.removeLayer(state.userMarker);
      state.userMarker = null;
    }
  },

  openFullscreen: () => {
    const container = document.getElementById('mapFullscreen');
    container.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (!state.fsMap) {
        state.fsMap = L.map('mapFullscreenMap', {
          center: CONFIG.MAP_CENTER,
          zoom: 9,
          zoomControl: true,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18
        }).addTo(state.fsMap);

        lugares.forEach((lugar, index) => {
          if (!lugar.lat || !lugar.lng) return;
          
          const isSelected = state.selectedPlaces.includes(lugar.id);
          const marker = L.marker([lugar.lat, lugar.lng], {
            icon: L.divIcon({
              className: `custom-marker touchable ${lugar.bloque} ${isSelected ? 'selected-ring' : ''}`,
              html: `<span>${index + 1}</span>`,
              iconSize: [48, 48],
              iconAnchor: [24, 24]
            })
          }).addTo(state.fsMap);

          marker.on('click', (e) => {
            mapManager.showPopup(lugar, e.latlng, state.fsMap);
          });

          state.fullscreenMarkers[lugar.id] = marker;
        });
      } else {
        // Actualizar marcadores existentes
        lugares.forEach(lugar => {
          const marker = state.fullscreenMarkers[lugar.id];
          if (marker) {
            const isSelected = state.selectedPlaces.includes(lugar.id);
            const element = marker.getElement();
            if (element) {
              element.classList.toggle('selected-ring', isSelected);
            }
          }
        });
        state.fsMap.invalidateSize();
      }

      ui.updateFullscreenUI();
    }, 150);
  },

  closeFullscreen: () => {
    const container = document.getElementById('mapFullscreen');
    container.classList.remove('active');
    document.body.style.overflow = '';
  },

  scrollToFooter: () => {
    document.getElementById('mapFullscreenFooter')?.scrollIntoView({ behavior: 'smooth' });
  }
};

// ── GESTIÓN DE RUTAS ──────────────────────────────────────────

const routeManager = {
  togglePlace: (id) => {
    const index = state.selectedPlaces.indexOf(id);
    if (index > -1) {
      state.selectedPlaces.splice(index, 1);
      utils.haptic('light');
    } else {
      state.selectedPlaces.push(id);
      utils.haptic('medium');
    }

    // Actualizar UI
    ui.updateSelectionUI();
    mapManager.updateMarkerSelection(id);
    
    // Actualizar marcador en fullscreen si existe
    const fsMarker = state.fullscreenMarkers[id];
    if (fsMarker) {
      const element = fsMarker.getElement();
      if (element) {
        element.classList.toggle('selected-ring', index === -1);
      }
    }

    return index === -1;
  },

  clear: () => {
    state.selectedPlaces = [];
    ui.updateSelectionUI();
    
    // Actualizar todos los marcadores
    Object.keys(state.markers).forEach(id => {
      mapManager.updateMarkerSelection(parseInt(id));
    });
    
    ui.updateFullscreenUI();
    utils.haptic('light');
  },

  generateItinerary: () => {
    if (state.selectedPlaces.length === 0) {
      ui.showToast('Selecciona al menos un lugar en el mapa', 'warning');
      return;
    }

    const waypoints = [];
    
    // Añadir ubicación del usuario como inicio si existe
    if (state.userLocation) {
      waypoints.push(`${state.userLocation.lat},${state.userLocation.lng}`);
    }

    // Añadir lugares seleccionados
    state.selectedPlaces.forEach(id => {
      const lugar = lugares.find(l => l.id === id);
      if (lugar?.lat && lugar?.lng) {
        waypoints.push(`${lugar.lat},${lugar.lng}`);
      }
    });

    if (waypoints.length === 0) {
      ui.showToast('No se encontraron coordenadas válidas', 'error');
      return;
    }

    // Abrir Google Maps
    const url = `https://www.google.com/maps/dir/${waypoints.join('/')}`;
    
    // Intentar compartir nativo primero
    utils.share({
      title: 'Mi ruta por Galicia',
      text: `Ruta con ${state.selectedPlaces.length} lugares (${routeManager.getTotalHours()}h)`,
      url: url
    }).then(shared => {
      if (!shared) {
        window.open(url, '_blank');
      }
    });
  },

  getTotalHours: () => {
    return state.selectedPlaces.reduce((sum, id) => {
      const lugar = lugares.find(l => l.id === id);
      return sum + (lugar?.horas || 0);
    }, 0);
  },

  getSelectedPlacesData: () => {
    return state.selectedPlaces.map(id => lugares.find(l => l.id === id)).filter(Boolean);
  }
};

// ── UI Y RENDERIZADO ──────────────────────────────────────────

const ui = {
  // Referencias a elementos DOM cacheados
  elements: {},

  cacheElements: () => {
    ui.elements = {
      splashScreen: document.getElementById('splashScreen'),
      mainContent: document.getElementById('mainContent'),
      passwordInput: document.getElementById('passwordInput'),
      splashError: document.getElementById('splashError'),
      splashForm: document.getElementById('splashForm'),
      placesContainer: document.getElementById('placesContainer'),
      favoritesSection: document.getElementById('favoritesSection'),
      selectionContent: document.getElementById('selectionContent'),
      selectionStats: document.getElementById('selectionStats'),
      geoBtn: document.getElementById('geoBtn'),
      geoStatus: document.getElementById('geoStatus'),
      mapFullscreen: document.getElementById('mapFullscreen'),
      mapSelectionCount: document.getElementById('mapSelectionCount'),
      mapSelectionTime: document.getElementById('mapSelectionTime'),
      mapSelectionPlaces: document.getElementById('mapSelectionPlaces'),
      mapFloatingSelection: document.getElementById('mapFloatingSelection'),
      mapFloatingCount: document.getElementById('mapFloatingCount'),
      sabiasQueScreen: document.getElementById('sabiasQueScreen'),
      textoSabiasQue: document.getElementById('texto-sabias-que'),
      sabiasQueProgress: document.getElementById('sabiasQueProgress')
    };
  },

  // Renderizado de lugares
  renderPlaces: () => {
    const container = ui.elements.placesContainer;
    if (!container) return;

    let html = '';
    let globalIndex = 0;

    bloques.forEach(bloque => {
      const lugaresBloque = lugares.filter(l => l.bloque === bloque.id);
      if (!lugaresBloque.length) return;

      html += `<div class="province-box" id="prov-${bloque.id}">`;
      
      // Header del bloque
      html += `
        <div class="province-header ${bloque.id}" onclick="ui.toggleProvincia('prov-${bloque.id}')">
          <div class="bloque-map-sidebar">
            <div class="bloque-map-mini">
              <img src="img/mapa_${bloque.id}.svg" alt="Mapa" loading="lazy" onerror="this.style.display='none'">
            </div>
          </div>
          <div class="bloque-body">
            <div class="bloque-content-wrapper">
              <div class="bloque-nombre">${bloque.emoji} ${bloque.nombre}</div>
              <span class="bloque-subtitulo">${bloque.subtitulo}</span>
            </div>
          </div>
          <div class="bloque-actions">
            <div class="bloque-contador">${lugaresBloque.length} lugares</div>
            <div class="province-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>
      `;

      // Contenido con carrusel horizontal
      html += '<div class="province-content"><div class="horizontal-scroll places-carousel">';

      lugaresBloque.forEach(lugar => {
        globalIndex++;
        const isFav = favoritesManager.isFavorite(lugar.id);
        
        html += `
          <article class="place-card ${lugar.bloque}" id="place-${lugar.id}">
            <div class="place-image">
              <img src="${lugar.imagen}" alt="${utils.sanitizeHTML(lugar.nombre)}" loading="lazy" 
                   onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop'">
              <span class="place-number-badge">${globalIndex}</span>
              <div class="place-title-overlay">
                <h3 class="place-title">${utils.sanitizeHTML(lugar.nombre)}</h3>
              </div>
            </div>
            
            <div class="place-header" onclick="ui.togglePlace('place-${lugar.id}')">
              <div class="place-header-left">
                ${lugar.categorias.map(catId => `
                  <span class="place-category-chip ${catId}">${categorias.find(c => c.id === catId)?.nombreCorto || catId}</span>
                `).join('')}
              </div>
              <div class="place-header-right">
                <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${lugar.id}" 
                        onclick="event.stopPropagation(); favoritesManager.toggle(${lugar.id})">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <svg class="place-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            
            <div class="place-content">
              <div class="place-content-inner">
                <div class="place-category-tags">
                  ${lugar.categorias.map(catId => `
                    <span class="place-category-tag ${catId}">
                      ${categorias.find(c => c.id === catId)?.emoji || ''} ${categorias.find(c => c.id === catId)?.nombreCorto || catId}
                    </span>
                  `).join('')}
                </div>
                
                ${ui.renderInfoBlock('✨', 'POR QUÉ VENIR', lugar.porQueVenir)}
                ${ui.renderInfoBlock('🕐', 'EL MOMENTO', lugar.momentoPerfecto)}
                ${lugar.imprescindibles ? ui.renderListBlock('⭐', 'IMPRESCINDIBLES', lugar.imprescindibles) : ''}
                ${ui.renderInfoBlock('🍽️', 'COMER', lugar.comer)}
                ${ui.renderInfoBlock('🍷', 'BEBER', lugar.tomar)}
                ${lugar.playasYAlrededores ? ui.renderListBlock('🏖️', 'PLAYAS Y ALREDEDORES', lugar.playasYAlrededores) : ''}
                ${ui.renderInfoBlock('🔮', 'SECRETO', lugar.secreto)}
                ${Array.isArray(lugar.masTiempo) ? ui.renderListBlock('⏳', 'MÁS TIEMPO', lugar.masTiempo) : ui.renderInfoBlock('⏳', 'MÁS TIEMPO', lugar.masTiempo)}
                ${lugar.planLluvia ? (Array.isArray(lugar.planLluvia) ? ui.renderListBlock('☔', 'PLAN PARA DÍA DE LLUVIA', lugar.planLluvia) : ui.renderInfoBlock('☔', 'PLAN PARA DÍA DE LLUVIA', lugar.planLluvia)) : ''}
                ${Array.isArray(lugar.advertencias) ? ui.renderListBlock('⚠️', 'ADVERTENCIAS', lugar.advertencias) : ui.renderInfoBlock('⚠️', 'ADVERTENCIAS', lugar.advertencias)}
                ${ui.renderInfoBlock('❤️', 'MI OPINIÓN', lugar.miOpinion)}
                
                <button class="btn-primary" onclick="routeManager.togglePlace(${lugar.id})" style="width:100%; margin-top:16px;">
                  ${state.selectedPlaces.includes(lugar.id) ? '❌ Quitar de la ruta' : '➕ Añadir a la ruta'}
                </button>
              </div>
            </div>
          </article>
        `;
      });

      html += '</div></div></div>';
    });

    container.innerHTML = html;
    ui.initAnimations();
    utils.lazyLoadImages();
  },

  renderInfoBlock: (icon, title, text) => {
    if (!text) return '';
    return `
      <div class="info-block">
        <div class="info-header">
          <span class="info-icon">${icon}</span>
          <span class="info-title">${title}</span>
        </div>
        <p class="info-text">${text}</p>
      </div>
    `;
  },

  renderListBlock: (icon, title, items) => {
    if (!items?.length) return '';
    return `
      <div class="info-block">
        <div class="info-header">
          <span class="info-icon">${icon}</span>
          <span class="info-title">${title}</span>
        </div>
        <ul class="info-list">
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  },

  // Toggle de provincia
  toggleProvincia: (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const wasExpanded = element.classList.contains('expanded');
    
    // Cerrar todas las demás
    document.querySelectorAll('.province-box.expanded').forEach(el => {
      if (el.id !== id) el.classList.remove('expanded');
    });

    if (!wasExpanded) {
      element.classList.add('expanded');
      
      // Scroll suave al elemento
      setTimeout(() => {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 350);
    } else {
      element.classList.remove('expanded');
    }

    utils.haptic('light');
  },

  // Toggle de lugar individual
  togglePlace: (id) => {
    const card = document.getElementById(id);
    if (!card) return;

    const isExpanded = card.classList.toggle('expanded');
    
    if (isExpanded) {
      setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }, 150);
      utils.haptic('medium');
    } else {
      utils.haptic('light');
    }
  },

  // Toggle de recomendaciones
  toggleRec: (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const wasExpanded = element.classList.contains('expanded');
    
    document.querySelectorAll('#recomendaciones .province-box.expanded').forEach(el => {
      if (el.id !== id) el.classList.remove('expanded');
    });

    element.classList.toggle('expanded', !wasExpanded);
    
    if (!wasExpanded) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }

    utils.haptic('light');
  },

  // Actualizar botón de favorito
  updateFavoriteButton: (id) => {
    const btn = document.querySelector(`.fav-btn[data-id="${id}"]`);
    if (btn) {
      btn.classList.toggle('active', favoritesManager.isFavorite(id));
    }
  },

  // Renderizar sección de favoritos
  renderFavoritesSection: () => {
    const container = ui.elements.favoritesSection;
    if (!container) return;

    if (state.favorites.length === 0) {
      container.innerHTML = `
        <div class="favorites-empty">
          <div class="empty-state-icon">💙</div>
          <div class="empty-state-title">Sin favoritos aún</div>
          <div class="empty-state-text">Toca el corazón en cualquier lugar para guardarlo</div>
        </div>
      `;
      return;
    }

    let html = `
      <div class="favorites-header">
        <div class="favorites-title">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Mis favoritos
        </div>
        <span class="favorites-count">${state.favorites.length}</span>
      </div>
      <div class="favorites-list">
    `;

    state.favorites.forEach(id => {
      const lugar = lugares.find(l => l.id === id);
      if (!lugar) return;

      html += `
        <div class="favorite-item">
          <img src="${lugar.imagen}" loading="lazy" 
               onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop'" 
               alt="${utils.sanitizeHTML(lugar.nombre)}">
          <div class="favorite-info">
            <div class="favorite-name">${utils.sanitizeHTML(lugar.nombre)}</div>
            <div class="favorite-time">${lugar.horas}h · ${categorias.find(c => c.id === lugar.categorias[0])?.nombreCorto || ''}</div>
          </div>
          <button class="favorite-remove" onclick="favoritesManager.remove(${lugar.id})" aria-label="Eliminar de favoritos">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  },

  // Actualizar UI de selección de ruta
  updateSelectionUI: () => {
    const totalHours = routeManager.getTotalHours();
    const statsEl = ui.elements.selectionStats;
    if (statsEl) {
      statsEl.textContent = `${state.selectedPlaces.length} lugares · ${totalHours}h`;
    }

    const content = ui.elements.selectionContent;
    if (!content) return;

    if (state.selectedPlaces.length === 0) {
      content.innerHTML = `
        <div class="selection-empty">
          <div class="empty-state-icon">🗺️</div>
          <div class="empty-state-title">Tu ruta está vacía</div>
          <div class="empty-state-text">Toca los puntos en el mapa para añadir lugares</div>
        </div>
      `;
      return;
    }

    let html = '<div class="selection-list">';
    
    state.selectedPlaces.forEach(id => {
      const lugar = lugares.find(l => l.id === id);
      if (!lugar) return;

      html += `
        <div class="selection-item">
          <img src="${lugar.imagen}" class="selection-item-img" loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop'" 
               alt="${utils.sanitizeHTML(lugar.nombre)}">
          <div class="selection-item-info">
            <div class="selection-item-name">${utils.sanitizeHTML(lugar.nombre)}</div>
            <div class="selection-item-time">${lugar.horas}h</div>
          </div>
          <button class="selection-item-remove" onclick="routeManager.togglePlace(${lugar.id})" aria-label="Quitar de la ruta">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;
    });

    html += '</div>';
    
    html += `
      <div class="action-buttons">
        <button class="btn-primary" onclick="routeManager.generateItinerary()">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Crear ruta en Google Maps
        </button>
        <button class="btn-secondary" onclick="routeManager.clear()">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Limpiar ruta
        </button>
      </div>
    `;

    content.innerHTML = html;
  },

  // Actualizar UI de geolocalización
  updateGeoUI: (active, errorMessage = null) => {
    const btn = ui.elements.geoBtn;
    const status = ui.elements.geoStatus;

    if (!btn || !status) return;

    if (active) {
      btn.textContent = 'Desactivar';
      btn.disabled = false;
      btn.style.background = 'var(--accent-red)';
      status.textContent = state.userLocation ? 
        `📍 ${state.userLocation.lat.toFixed(4)}, ${state.userLocation.lng.toFixed(4)}` : 
        'Ubicación activada';
      status.classList.add('active');
    } else {
      btn.textContent = 'Activar';
      btn.disabled = false;
      btn.style.background = '';
      status.textContent = errorMessage || 'Actívala para calcular distancias';
      status.classList.remove('active');
    }
  },

  // Actualizar UI de mapa fullscreen
  updateFullscreenUI: () => {
    const totalHours = routeManager.getTotalHours();
    
    if (ui.elements.mapSelectionCount) {
      ui.elements.mapSelectionCount.textContent = `${state.selectedPlaces.length} seleccionados`;
    }
    
    if (ui.elements.mapSelectionTime) {
      ui.elements.mapSelectionTime.textContent = `${totalHours}h`;
    }

    const floatingBtn = ui.elements.mapFloatingSelection;
    const floatingCount = ui.elements.mapFloatingCount;
    
    if (floatingBtn && floatingCount) {
      if (state.selectedPlaces.length > 0) {
        floatingBtn.style.display = 'flex';
        floatingCount.textContent = state.selectedPlaces.length;
      } else {
        floatingBtn.style.display = 'none';
      }
    }

    const placesContainer = ui.elements.mapSelectionPlaces;
    if (!placesContainer) return;

    if (state.selectedPlaces.length === 0) {
      placesContainer.innerHTML = '';
      return;
    }

    let html = '';
    state.selectedPlaces.forEach(id => {
      const lugar = lugares.find(l => l.id === id);
      if (!lugar) return;

      html += `
        <div class="map-selection-chip">
          ${utils.sanitizeHTML(lugar.nombre)}
          <span class="remove" onclick="event.stopPropagation(); routeManager.togglePlace(${lugar.id}); ui.updateFullscreenUI();">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </span>
        </div>
      `;
    });

    placesContainer.innerHTML = html;
  },

  // Inicializar animaciones de scroll
  initAnimations: () => {
    if (utils.prefersReducedMotion()) return;

    const observer = utils.createObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    });

    document.querySelectorAll('.fade-in, .sr').forEach(el => {
      el.classList.add('sr');
      observer.observe(el);
    });
  },

  // Mostrar toast notification
  showToast: (message, type = 'info', duration = 3000) => {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;

    // Estilos inline para el toast
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: ${type === 'success' ? 'var(--accent-green)' : type === 'error' ? 'var(--accent-red)' : type === 'warning' ? 'var(--accent-orange)' : 'var(--accent-sea)'};
      color: white;
      padding: 12px 24px;
      border-radius: 16px;
      font-weight: 500;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 10000;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    document.body.appendChild(toast);

    // Animación de entrada
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Auto-remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);

    utils.haptic(type === 'success' ? 'success' : type === 'error' ? 'error' : 'light');
  },

  // Pantalla "¿Sabías que?"
  showSabiasQue: (callback) => {
    const screen = ui.elements.sabiasQueScreen;
    const texto = ui.elements.textoSabiasQue;
    const barra = ui.elements.sabiasQueProgress;

    if (!screen || !texto || !barra) {
      callback?.();
      return;
    }

    const curiosidad = curiosidades[Math.floor(Math.random() * curiosidades.length)];
    texto.innerHTML = curiosidad;
    screen.style.display = 'flex';

    let startTime = null;
    let animationId = null;
    let textFaded = false;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Actualizar barra de progreso
      const progress = Math.min(elapsed / CONFIG.TOTAL_SABIAS_QUE, 1);
      barra.style.width = `${progress * 100}%`;

      // Fade out del texto
      if (!textFaded && elapsed >= CONFIG.TEXT_FADE_AT) {
        textFaded = true;
        texto.style.transition = 'opacity 1.2s ease';
        texto.style.opacity = '0';
      }

      // Completar
      if (elapsed >= CONFIG.TOTAL_SABIAS_QUE) {
        finish();
        return;
      }

      animationId = requestAnimationFrame(animate);
    };

    const finish = () => {
      cancelAnimationFrame(animationId);
      screen.style.transition = 'opacity 0.8s ease';
      screen.style.opacity = '0';
      
      setTimeout(() => {
        screen.style.display = 'none';
        screen.style.opacity = '1';
        texto.style.opacity = '1';
        barra.style.width = '0%';
        callback?.();
      }, 800);
    };

    // Swipe para saltar
    utils.detectSwipe(screen, {
      onSwipeUp: finish,
      onSwipeDown: finish,
      onSwipeLeft: finish,
      onSwipeRight: finish
    });

    animationId = requestAnimationFrame(animate);
  }
};

// ── GESTIÓN DE NAVEGACIÓN ────────────────────────────────────

const navigationManager = {
  SECTION_ORDER: ['hero', 'recomendaciones', 'lugares', 'generador'],
  currentIndex: 0,

  init: () => {
    const toolbarItems = document.querySelectorAll('.toolbar-item');
    
    toolbarItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.dataset.section;
        navigationManager.navigateTo(targetId, index);
      });
    });

    // Inicializar en hero
    navigationManager.navigateTo('hero', 0);
  },

  navigateTo: (targetId, targetIndex) => {
    if (targetId === state.currentSection) return;

    const fromId = state.currentSection;
    const fromIndex = navigationManager.currentIndex;
    const direction = targetIndex > fromIndex ? 'forward' : 'backward';

    // Actualizar botones
    document.querySelectorAll('.toolbar-item').forEach((item, idx) => {
      item.classList.toggle('active', idx === targetIndex);
    });

    // Animar transición de pantalla
    const fromScreen = document.getElementById(fromId);
    const toScreen = document.getElementById(targetId);

    if (fromScreen && toScreen) {
      // Añadir clases de animación
      fromScreen.classList.add(direction === 'forward' ? 'screen-exit-left' : 'screen-exit-right');
      
      setTimeout(() => {
        fromScreen.classList.remove('active-screen', 'screen-exit-left', 'screen-exit-right');
        toScreen.classList.add('active-screen', direction === 'forward' ? 'screen-enter-right' : 'screen-enter-left');
        
        setTimeout(() => {
          toScreen.classList.remove('screen-enter-right', 'screen-enter-left');
        }, 360);
      }, 200);
    }

    // Actualizar estado
    state.currentSection = targetId;
    navigationManager.currentIndex = targetIndex;

    // Scroll al top
    window.scrollTo(0, 0);

    // Parchar mapa si es necesario
    if (targetId === 'generador' && state.mainMap) {
      setTimeout(() => state.mainMap.invalidateSize(), 100);
    }

    utils.haptic('light');
  },

  // Navegación por gestos
  initSwipeNavigation: () => {
    const screens = document.querySelectorAll('#hero, #recomendaciones, #lugares, #generador');
    
    screens.forEach(screen => {
      utils.detectSwipe(screen, {
        onSwipeLeft: () => {
          if (navigationManager.currentIndex < navigationManager.SECTION_ORDER.length - 1) {
            const nextIndex = navigationManager.currentIndex + 1;
            navigationManager.navigateTo(navigationManager.SECTION_ORDER[nextIndex], nextIndex);
          }
        },
        onSwipeRight: () => {
          if (navigationManager.currentIndex > 0) {
            const prevIndex = navigationManager.currentIndex - 1;
            navigationManager.navigateTo(navigationManager.SECTION_ORDER[prevIndex], prevIndex);
          }
        }
      });
    });
  }
};

// ── PULL TO REFRESH ───────────────────────────────────────────

const pullToRefresh = {
  init: () => {
    const mainContent = ui.elements.mainContent;
    if (!mainContent) return;

    let touchStartY = 0;
    let touchEndY = 0;
    let isPulling = false;

    mainContent.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        isPulling = true;
      }
    }, { passive: true });

    mainContent.addEventListener('touchmove', (e) => {
      if (!isPulling || window.scrollY > 0) return;
      
      touchEndY = e.touches[0].clientY;
      const pullDistance = touchEndY - touchStartY;

      if (pullDistance > 0 && pullDistance < 150) {
        document.body.style.setProperty('--pull-progress', pullDistance / 150);
        
        // Mostrar indicador visual
        if (pullDistance > 80 && !document.querySelector('.pull-indicator')) {
          const indicator = document.createElement('div');
          indicator.className = 'pull-indicator';
          indicator.innerHTML = '↓ Suelta para actualizar';
          indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-sea);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
            z-index: 9998;
            opacity: ${Math.min((pullDistance - 80) / 40, 1)};
            transition: opacity 0.2s;
          `;
          document.body.appendChild(indicator);
        }
      }
    }, { passive: true });

    mainContent.addEventListener('touchend', () => {
      if (!isPulling) return;
      
      const pullDistance = touchEndY - touchStartY;
      const indicator = document.querySelector('.pull-indicator');
      
      if (indicator) indicator.remove();
      
      if (pullDistance > 120) {
        // Activar refresh
        location.reload();
      } else {
        // Cancelar
        document.body.style.setProperty('--pull-progress', '0');
      }
      
      isPulling = false;
      touchStartY = 0;
      touchEndY = 0;
    });
  }
};

// ── INSTALACIÓN DE PWA ───────────────────────────────────────

const installManager = {
  deferredPrompt: null,

  init: () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      installManager.deferredPrompt = e;
      ui.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      installManager.deferredPrompt = null;
      ui.hideInstallBanner();
      ui.showToast('¡Galicia Guide instalada!', 'success');
    });
  },

  showPrompt: async () => {
    if (!installManager.deferredPrompt) return;
    
    installManager.deferredPrompt.prompt();
    const { outcome } = await installManager.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      ui.showToast('¡Gracias por instalar!', 'success');
    }
    
    installManager.deferredPrompt = null;
  }
};

// ── INICIALIZACIÓN ───────────────────────────────────────────

const app = {
  init: async () => {
    // Cachear elementos DOM
    ui.cacheElements();

    // Verificar autenticación
    if (!authManager.check() || !authManager.isSessionValid()) {
      app.showLogin();
      return;
    }

    // Mostrar "¿Sabías que?" y luego inicializar
    ui.showSabiasQue(() => {
      app.initializeApp();
    });
  },

  showLogin: () => {
    const splash = ui.elements.splashScreen;
    const main = ui.elements.mainContent;
    
    if (splash) splash.style.visibility = '';
    if (main) main.style.visibility = 'hidden';

    // Evento de login
    ui.elements.splashForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = ui.elements.passwordInput?.value || '';
      
      if (authManager.login(password)) {
        splash?.classList.add('hidden');
        main?.classList.add('visible');
        main.style.visibility = '';
        
        setTimeout(() => {
          ui.showSabiasQue(() => {
            app.initializeApp();
          });
        }, 500);
      } else {
        ui.elements.passwordInput?.classList.add('error');
        if (ui.elements.splashError) {
          ui.elements.splashError.textContent = 'Contraseña incorrecta';
        }
        
        setTimeout(() => {
          ui.elements.passwordInput?.classList.remove('error');
        }, 400);
        
        if (ui.elements.passwordInput) {
          ui.elements.passwordInput.value = '';
          ui.elements.passwordInput.focus();
        }
      }
    });
  },

  initializeApp: () => {
    // Cargar datos guardados
    favoritesManager.load();
    geoManager.checkSaved();

    // Inicializar componentes
    ui.renderPlaces();
    mapManager.init();
    navigationManager.init();
    navigationManager.initSwipeNavigation();
    pullToRefresh.init();

    // Configurar eventos globales
    app.setupEventListeners();

    // Registrar Service Worker
    swManager.register();

    // Medir performance
    utils.measureWebVitals();

    // Marcar como inicializado
    document.body.classList.add('app-initialized');
    
    console.log(`🌊 Galicia Guide v${CONFIG.VERSION} iniciada`);
  },

  setupEventListeners: () => {
    // Online/offline
    window.addEventListener('online', () => {
      state.isOnline = true;
      ui.showToast('Conexión restaurada', 'success');
    });

    window.addEventListener('offline', () => {
      state.isOnline = false;
      ui.showToast('Sin conexión - Modo offline activo', 'warning');
    });

     // Visibility change (pausar animaciones cuando no visible)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        document.body.classList.add('paused');
      } else {
        document.body.classList.remove('paused');
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape para cerrar modales
      if (e.key === 'Escape') {
        mapManager.closeFullscreen();
        document.querySelectorAll('.province-box.expanded, .place-card.expanded').forEach(el => {
          el.classList.remove('expanded');
        });
      }

      // Navegación con teclado
      if (e.key === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        const nextIndex = Math.min(navigationManager.currentIndex + 1, navigationManager.SECTION_ORDER.length - 1);
        navigationManager.navigateTo(navigationManager.SECTION_ORDER[nextIndex], nextIndex);
      }
      
      if (e.key === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        const prevIndex = Math.max(navigationManager.currentIndex - 1, 0);
        navigationManager.navigateTo(navigationManager.SECTION_ORDER[prevIndex], prevIndex);
      }
    });

    // Resize con debounce
    window.addEventListener('resize', utils.debounce(() => {
      state.mainMap?.invalidateSize();
      state.fsMap?.invalidateSize();
    }, 250));

    // Before unload - guardar estado
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('galicia_last_section', state.currentSection);
      localStorage.setItem('galicia_selected_places', JSON.stringify(state.selectedPlaces));
    });

    // Restaurar estado si existe
    const lastSection = localStorage.getItem('galicia_last_section');
    const savedSelection = localStorage.getItem('galicia_selected_places');
    
    if (lastSection && navigationManager.SECTION_ORDER.includes(lastSection)) {
      const index = navigationManager.SECTION_ORDER.indexOf(lastSection);
      setTimeout(() => navigationManager.navigateTo(lastSection, index), 500);
    }
    
    if (savedSelection) {
      try {
        state.selectedPlaces = JSON.parse(savedSelection);
        ui.updateSelectionUI();
      } catch (e) {
        console.error('Error restaurando selección:', e);
      }
    }
  },

  // Logout
  logout: () => {
    authManager.logout();
    location.reload();
  }
};

// ── EXPOSE GLOBAL FUNCTIONS ───────────────────────────────────

// Navegación
window.toggleProvincia = ui.toggleProvincia;
window.togglePlace = ui.togglePlace;
window.abrirSoloUnaRec = ui.toggleRec;

// Favoritos
window.toggleFavorite = favoritesManager.toggle;
window.removeFavorite = favoritesManager.remove;

// Mapa
window.openFullscreenMap = mapManager.openFullscreen;
window.closeFullscreenMap = mapManager.closeFullscreen;
window.toggleGeolocation = geoManager.toggle;
window.scrollToMapFooter = mapManager.scrollToFooter;

// Ruta
window.togglePlaceSelection = routeManager.togglePlace;
window.togglePlaceFromPopup = (id) => {
  routeManager.togglePlace(id);
  ui.updateFullscreenUI();
};
window.clearSelection = routeManager.clear;
window.generateItinerary = routeManager.generateItinerary;

// ── SERVICE WORKER (INLINE PARA DESARROLLO) ─────────────────

// Este código se ejecuta en el contexto del SW
const swCode = `
const CACHE_NAME = 'galicia-guide-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

// Precache en install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Limpiar caches antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Estrategias de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Assets estáticos: Cache First
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Imágenes: Stale While Revalidate
  if (request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // API: Network First
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(networkWithCacheFallback(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function networkWithCacheFallback(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

// Mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;

// Crear blob y registrar SW inline (para desarrollo)
if ('serviceWorker' in navigator && location.hostname === 'localhost') {
  const swBlob = new Blob([swCode], { type: 'application/javascript' });
  const swUrl = URL.createObjectURL(swBlob);
  
  navigator.serviceWorker.register(swUrl).then((registration) => {
    console.log('SW de desarrollo registrado:', registration);
  }).catch((error) => {
    console.error('Error registrando SW de desarrollo:', error);
  });
}

// ── INICIAR APP ───────────────────────────────────────────────

// Esperar a que DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', app.init);
} else {
  app.init();
}

// ── POLYFILLS Y UTILIDADES ADICIONALES ───────────────────────

// Smooth scroll polyfill para Safari antiguo
if (!('scrollBehavior' in document.documentElement.style)) {
  import('https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js')
    .then(() => window.smoothscroll.polyfill())
    .catch(() => console.log('Smooth scroll polyfill no disponible'));
}

// Intersection Observer polyfill para IE11 (si es necesario)
if (!('IntersectionObserver' in window)) {
  import('https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver')
    .catch(() => console.log('IntersectionObserver polyfill no disponible'));
}

// ── COMPONENTES ADICIONALES DE UI ─────────────────────────────

// Sistema de modales accesible
const modalSystem = {
  activeModal: null,

  open: (content, options = {}) => {
    const { title, onClose, size = 'medium' } = options;
    
    // Cerrar modal existente
    modalSystem.close();

    const modal = document.createElement('div');
    modal.className = `modal modal-${size}`;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    
    modal.innerHTML = `
      <div class="modal-backdrop" onclick="modalSystem.close()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modal-title" class="modal-title">${title || ''}</h2>
          <button class="modal-close" onclick="modalSystem.close()" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    // Estilos inline para el modal
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;

    const backdrop = modal.querySelector('.modal-backdrop');
    backdrop.style.cssText = `
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity 0.3s;
    `;

    const content = modal.querySelector('.modal-content');
    content.style.cssText = `
      position: relative;
      background: white;
      border-radius: 24px;
      width: 100%;
      max-width: ${size === 'small' ? '400px' : size === 'large' ? '800px' : '560px'};
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: scale(0.9) translateY(20px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    `;

    document.body.appendChild(modal);
    modalSystem.activeModal = modal;

    // Animación de entrada
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      content.style.transform = 'scale(1) translateY(0)';
      content.style.opacity = '1';
    });

    // Foco al modal
    content.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();

    // Trap focus
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    });

    utils.haptic('medium');
    onClose && (modalSystem.onCloseCallback = onClose);
  },

  close: () => {
    if (!modalSystem.activeModal) return;

    const modal = modalSystem.activeModal;
    const backdrop = modal.querySelector('.modal-backdrop');
    const content = modal.querySelector('.modal-content');

    backdrop.style.opacity = '0';
    content.style.transform = 'scale(0.9) translateY(20px)';
    content.style.opacity = '0';

    setTimeout(() => {
      modal.remove();
      modalSystem.activeModal = null;
      modalSystem.onCloseCallback?.();
    }, 300);
  },

  onCloseCallback: null
};

window.modalSystem = modalSystem;

// Sistema de notificaciones push (si se implementa)
const pushNotificationSystem = {
  requestPermission: async () => {
    if (!('Notification' in window)) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  subscribe: async () => {
    if (!('serviceWorker' in navigator)) return null;

    const registration = await navigator.serviceWorker.ready;
    
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('TU_CLAVE_PUBLICA_VAPID')
      });
      
      // Enviar subscription al servidor
      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  },

  show: (title, options = {}) => {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-72.png',
          ...options
        });
      });
    }
  }
};

window.pushNotificationSystem = pushNotificationSystem;

// Helper para convertir VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ── ANALYTICS Y MONITORING (OPCIONAL) ─────────────────────────

const analytics = {
  track: (eventName, data = {}) => {
    // Implementación con Google Analytics 4, Plausible, etc.
    if (window.gtag) {
      gtag('event', eventName, data);
    }
    
    // Log en desarrollo
    if (location.hostname === 'localhost') {
      console.log('📊 Analytics:', eventName, data);
    }
  },

  trackError: (error, context = {}) => {
    analytics.track('error', {
      message: error.message,
      stack: error.stack,
      context: JSON.stringify(context)
    });
  }
};

window.addEventListener('error', (e) => analytics.trackError(e.error, { type: 'window' }));
window.addEventListener('unhandledrejection', (e) => analytics.trackError(e.reason, { type: 'promise' }));

// ── EXPORTAR PARA TESTING ────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    app,
    utils,
    state,
    CONFIG,
    authManager,
    favoritesManager,
    geoManager,
    mapManager,
    routeManager,
    ui,
    navigationManager
  };
}
