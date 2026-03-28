// ================================================================
// GALICIA APP — JAVASCRIPT COMPLETO CORREGIDO 2025
// PWA Moderna + MD3 Expressive + Flujo de Auth Arreglado
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
  TOTAL_SABIAS_QUE: 4000, // Reducido a 4 segundos
  TEXT_FADE_AT: 3500
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
  appInitialized: false // Flag crítico para evitar doble inicialización
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

// Lugares (array completo - mantén todos tus lugares aquí)
const lugares = [
  { 
    id: 1, 
    nombre: "Santiago de Compostela", 
    bloque: "acoruna", 
    categorias: ["ciudades", "patrimonio"], 
    horas: 5, 
    imagen: "img/santiago.jpg", 
    lat: 42.8800, 
    lng: -8.5450, 
    porQueVenir: "Santiago es el corazón cultural de Galicia. Más que una ciudad monumental, es un lugar vivido: piedra, historia y ambiente constante. Es el final del Camino, pero también un sitio al que siempre apetece volver.", 
    momentoPerfecto: "A cualquier hora, pero especialmente al atardecer, cuando la luz cae sobre la piedra y la ciudad se vuelve más tranquila. Con lluvia también tiene su encanto.", 
    imprescindibles: ["<strong>Catedral de Santiago</strong>", "<strong>Plaza del Obradoiro</strong>", "<strong>Casco histórico:</strong> perderse es obligatorio.", "<strong>Mercado de Abastos</strong>"], 
    comer: "Pulpo, empanada, marisco y producto gallego en general. Zonas recomendadas: Rúa do Franco y Rúa de San Pedro.", 
    tomar: "Vino gallego (albariño, ribeiro) o cerveza (Estrella Galicia).",
    secreto: "Además de perderse por el casco histórico, si tienes tiempo merece mucho la pena salir un poco del centro y recorrer los paseos fluviales del río Sar. Es un sitio muy local, tranquilo y diferente, ideal si ya has visto lo principal y te quedas varios días.", 
    masTiempo: ["<strong>Noia</strong>", "<strong>Padrón</strong>", "<strong>Excursiones en tren:</strong> a A Coruña o Vigo (rápidas y cómodas, con llegada directa al centro)."], 
    advertencias: ["Mucho turismo en temporada alta.", "Lluvia frecuente.", "Precios más altos en el centro."],
    miOpinion: "Santiago es, en el fondo, una aldea grande. Probablemente la aldea más grande de Europa. Es pequeña, pero tiene ese aire de capital que la hace especial. Es una ciudad de piedra, con siglos de historia, muy viva y siempre con gente. Estudiantil, dinámica y acogedora. Y lo mejor: por muchas veces que pasees por ella, siempre acabas descubriendo algo nuevo."
  },
  { 
    id: 2, 
    nombre: "A Coruña", 
    bloque: "acoruna", 
    categorias: ["ciudades", "costa"], 
    horas: 4, 
    imagen: "img/acoruna.jpg", 
    lat: 43.3700, 
    lng: -8.4000, 
    porQueVenir: "A Coruña combina ciudad y mar como pocas. Rascacielos frente a playas, historia en cada esquina y un paseo marítimo que es de los más largos de Europa. Ciudad viva, siempre con gente en movimiento, mercados, cafés y tiendas. Conocida como la \"Ciudad de Cristal\", destaca por sus galerías acristaladas de la Marina, diseñadas para captar luz y calor, formando uno de los conjuntos acristalados más extensos del mundo.", 
    momentoPerfecto: "Por la mañana en el casco histórico para ver la Plaza de María Pita y la Torre de Hércules, o al atardecer para pasear por el paseo marítimo y disfrutar de la luz sobre el Atlántico.", 
    imprescindibles: ["<strong>Torre de Hércules:</strong> faro romano en funcionamiento más antiguo del mundo, Patrimonio de la Humanidad.", "<strong>Plaza de María Pita:</strong> centro histórico con bares y ambiente constante.", "<strong>Casco viejo:</strong> calles empedradas, plazas escondidas y esencia local.", "<strong>Paseo marítimo:</strong> el más largo de Europa, ideal para caminatas atlánticas.", "<strong>Museo de Bellas Artes y Domus:</strong> historia y ciencia al alcance de todos."], 
    comer: "Marisco, pescado fresco y tapas gallegas. Zonas recomendadas: Zona de Vinos (Calles Galera, Barrera y Estrella), Ciudad Vieja y Plaza de María Pita, Monte de San Pedro, Cuatro Caminos y Ensanche, Matogrande.", 
    tomar: "Estrella Galicia, albariño o ribeiro según acompañamiento.",
    secreto: "<strong>Paseo marítimo hasta Orzán y Riazor:</strong> kilómetros de costa urbana que pocos turistas aprovechan del todo.<br><br><strong>Miradores del Monte de San Pedro:</strong> vistas panorámicas increíbles y jardines poco conocidos.", 
    masTiempo: ["<strong>Excursión rápida a Betanzos:</strong> villa medieval cercana.", "<strong>Costa da Morte:</strong> paisaje salvaje y natural."], 
    planLluvia: ["<strong>Museo de Bellas Artes y Domus:</strong> historia y ciencia al alcance de todos.", "<strong>Museo de las Ciencias:</strong> exposiciones interactivas y aprendizaje para todas las edades.", "<strong>Aquarium Finisterrae:</strong> vida marina y experiencias atlánticas sin mojarse."],
    advertencias: ["Ciudad húmeda y ventosa, sobre todo en invierno.", "Aparcar en el centro puede ser un reto.", "Playas urbanas con oleaje: precaución."],
    miOpinion: "A Coruña es energía pura: ciudad activa, atlántica y viva, con un carácter señorial muy marcado. Mezcla perfecta de ciudad y playa, historia y modernidad. Sus galerías acristaladas, la Torre de Hércules y su paseo marítimo la convierten en única."
  },
  // ... (resto de tus lugares) ...
  { id: 3, nombre: "Betanzos", bloque: "acoruna", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/betanzos.jpg", lat: 43.2833, lng: -8.2167, porQueVenir: "Villa medieval con casco histórico.", momentoPerfecto: "Mañana.", imprescindibles: ["Plaza Mayor", "Iglesia de Santa María", "Murallas"], comer: "Tortilla de Betanzos.", tomar: "Vino de la tierra.", secreto: "Jardines del Pasatiempo.", masTiempo: "Paseo por el río.", advertencias: "Fuertes pendientes." },
  { id: 4, nombre: "Cedeira", bloque: "acoruna", categorias: ["costa", "naturaleza"], horas: 2, imagen: "img/cedeira.jpg", lat: 43.6667, lng: -8.0500, porQueVenir: "Playa de Magdalena y puerto pesquero.", momentoPerfecto: "Verano.", imprescindibles: ["Playa de Magdalena", "Puerto", "Monte da Sartá"], comer: "Marisco.", tomar: "Vino blanco.", secreto: "Senda costera.", masTiempo: "Paseo al faro.", advertencias: "Mar peligroso." },
  // ... continúa con todos tus lugares ...
];

// ── UTILIDADES ─────────────────────────────────────────────────

const utils = {
  debounce: (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },

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

  sanitizeHTML: (str) => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  },

  formatTime: (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours === 1) return '1h';
    return `${hours}h`;
  },

  isTouch: () => window.matchMedia('(pointer: coarse)').matches,

  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,

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
  }
};

// ── GESTIÓN DE AUTENTICACIÓN ──────────────────────────────────

const authManager = {
  check: () => localStorage.getItem('galicia_auth') === 'true',

  set: (value) => {
    if (value) {
      localStorage.setItem('galicia_auth', 'true');
      localStorage.setItem('galicia_auth_time', Date.now().toString());
    } else {
      localStorage.removeItem('galicia_auth');
      localStorage.removeItem('galicia_auth_time');
    }
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
    return index === -1;
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
          ui.updateGeoUI(false, error.message);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  },

  toggle: () => {
    if (state.userLocation) {
      state.userLocation = null;
      mapManager.hideUserLocation();
      localStorage.removeItem('galicia_lat');
      localStorage.removeItem('galicia_lng');
      ui.updateGeoUI(false);
      utils.haptic('light');
    } else {
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

      L.control.zoom({ position: 'bottomright' }).addTo(state.mainMap);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2
      }).addTo(state.mainMap);

      lugares.forEach((lugar, index) => {
        if (!lugar.lat || !lugar.lng) return;
        mapManager.addMarker(lugar, index);
      });

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
    const btnText = isSelected ? '❌ Quitar' : '➕ Añadir';
    const btnColor = isSelected ? '#B3261E' : '#1a5276';

    const popupHtml = `
      <div style="text-align:center; min-width:160px; font-family:sans-serif;">
        <img src="${lugar.imagen}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;margin-bottom:10px;" onerror="this.style.display='none'">
        <div style="font-weight:700;font-size:1rem;margin-bottom:6px;">${utils.sanitizeHTML(lugar.nombre)}</div>
        <div style="font-size:0.8rem;color:#666;margin-bottom:12px;">${lugar.horas}h · ${categorias.find(c => c.id === lugar.categorias[0])?.nombreCorto || ''}</div>
        <button onclick="routeManager.togglePlace(${lugar.id}); mapManager.refreshPopup(this, ${lugar.id});" 
                style="background:${btnColor};color:white;border:none;padding:10px 16px;border-radius:12px;font-weight:600;cursor:pointer;width:100%;font-size:0.9rem;">
          ${btnText}
        </button>
      </div>
    `;

    L.popup({ closeButton: false, offset: [0, -10] })
      .setLatLng(latlng)
      .setContent(popupHtml)
      .openOn(mapInstance);
  },

  refreshPopup: (btn, id) => {
    const isSelected = state.selectedPlaces.includes(id);
    btn.textContent = isSelected ? '❌ Quitar' : '➕ Añadir';
    btn.style.background = isSelected ? '#B3261E' : '#1a5276';
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

    ui.updateSelectionUI();
    
    const marker = state.markers[id];
    if (marker) {
      const element = marker.getElement();
      if (element) {
        element.classList.toggle('selected-ring', index === -1);
      }
    }

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
    
    Object.keys(state.markers).forEach(id => {
      const marker = state.markers[id];
      if (marker) {
        const element = marker.getElement();
        if (element) {
          element.classList.remove('selected-ring');
        }
      }
    });
    
    ui.updateFullscreenUI();
    utils.haptic('light');
  },

  generateItinerary: () => {
    if (state.selectedPlaces.length === 0) {
      alert('Selecciona al menos un lugar en el mapa.');
      return;
    }

    const waypoints = [];
    
    if (state.userLocation) {
      waypoints.push(`${state.userLocation.lat},${state.userLocation.lng}`);
    }

    state.selectedPlaces.forEach(id => {
      const lugar = lugares.find(l => l.id === id);
      if (lugar?.lat && lugar?.lng) {
        waypoints.push(`${lugar.lat},${lugar.lng}`);
      }
    });

    if (waypoints.length === 0) {
      alert('No se encontraron coordenadas válidas.');
      return;
    }

    const url = `https://www.google.com/maps/dir/${waypoints.join('/')}`;
    window.open(url, '_blank');
  },

  getTotalHours: () => {
    return state.selectedPlaces.reduce((sum, id) => {
      const lugar = lugares.find(l => l.id === id);
      return sum + (lugar?.horas || 0);
    }, 0);
  }
};

// ── UI Y RENDERIZADO ──────────────────────────────────────────

const ui = {
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

  renderPlaces: () => {
    const container = ui.elements.placesContainer;
    if (!container) return;

    let html = '';
    let globalIndex = 0;

    bloques.forEach(bloque => {
      const lugaresBloque = lugares.filter(l => l.bloque === bloque.id);
      if (!lugaresBloque.length) return;

      html += `<div class="province-box" id="prov-${bloque.id}">`;
      
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

  toggleProvincia: (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const wasExpanded = element.classList.contains('expanded');
    
    document.querySelectorAll('.province-box.expanded').forEach(el => {
      if (el.id !== id) el.classList.remove('expanded');
    });

    if (!wasExpanded) {
      element.classList.add('expanded');
      
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

  updateFavoriteButton: (id) => {
    const btn = document.querySelector(`.fav-btn[data-id="${id}"]`);
    if (btn) {
      btn.classList.toggle('active', favoritesManager.isFavorite(id));
    }
  },

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

  initAnimations: () => {
    if (utils.prefersReducedMotion()) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in, .sr').forEach(el => {
      el.classList.add('sr');
      observer.observe(el);
    });
  },

  showSabiasQue: (callback) => {
    const screen = ui.elements.sabiasQueScreen;
    const texto = ui.elements.textoSabiasQue;
    const barra = ui.elements.sabiasQueProgress;
    
    if (!screen || !texto || !barra) {
      if (callback) callback();
      return;
    }

    const curiosidad = curiosidades[Math.floor(Math.random() * curiosidades.length)];
    texto.innerHTML = curiosidad;
    
    screen.style.display = 'flex';
    screen.style.opacity = '1';
    
    let startTime = null;
    let animationId = null;
    let finished = false;

    function animate(timestamp) {
      if (finished) return;
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / CONFIG.TOTAL_SABIAS_QUE, 1);
      
      barra.style.width = (progress * 100) + '%';
      
      if (elapsed >= CONFIG.TOTAL_SABIAS_QUE) {
        finished = true;
        cerrar();
        return;
      }
      
      animationId = requestAnimationFrame(animate);
    }

    function cerrar() {
      cancelAnimationFrame(animationId);
      screen.style.transition = 'opacity 0.5s ease';
      screen.style.opacity = '0';
      
      setTimeout(() => {
        screen.style.display = 'none';
        screen.style.opacity = '1';
        screen.style.transition = '';
        barra.style.width = '0%';
        texto.style.opacity = '1';
        
        if (callback) callback();
      }, 500);
    }

    screen.addEventListener('click', function saltear() {
      if (finished) return;
      finished = true;
      screen.removeEventListener('click', saltear);
      cerrar();
    });
    
    let touchStartY = 0;
    screen.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    screen.addEventListener('touchend', (e) => {
      if (finished) return;
      const diff = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (diff > 30) {
        finished = true;
        cerrar();
      }
    }, { passive: true });

    animationId = requestAnimationFrame(animate);
  }
};

// ── NAVEGACIÓN ───────────────────────────────────────────────

const navigationManager = {
  SECTION_ORDER: ['hero', 'recomendaciones', 'lugares', 'generador'],
  currentIndex: 0,

  init: () => {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.dataset.section;
        navigationManager.navigateTo(targetId, index);
      });
    });

    // Activar primera sección
    navigationManager.navigateTo('hero', 0);
  },

  navigateTo: (targetId, targetIndex) => {
    if (targetId === state.currentSection) return;

    const fromId = state.currentSection;
    const fromIndex = navigationManager.currentIndex;
    const direction = targetIndex > fromIndex ? 'forward' : 'backward';

    // Actualizar botones
    document.querySelectorAll('.menu-item').forEach((item, idx) => {
      item.classList.toggle('active', idx === targetIndex);
    });

    // Animar transición
    const fromScreen = document.getElementById(fromId);
    const toScreen = document.getElementById(targetId);

    if (fromScreen && toScreen) {
      fromScreen.classList.add(direction === 'forward' ? 'screen-exit-left' : 'screen-exit-right');
      
      setTimeout(() => {
        fromScreen.classList.remove('active-screen', 'screen-exit-left', 'screen-exit-right');
        toScreen.classList.add('active-screen', direction === 'forward' ? 'screen-enter-right' : 'screen-enter-left');
        
        setTimeout(() => {
          toScreen.classList.remove('screen-enter-right', 'screen-enter-left');
        }, 360);
      }, 200);
    }

    state.currentSection = targetId;
    navigationManager.currentIndex = targetIndex;

    window.scrollTo(0, 0);

    if (targetId === 'generador' && state.mainMap) {
      setTimeout(() => state.mainMap.invalidateSize(), 100);
    }

    utils.haptic('light');
  }
};

// ── INICIALIZACIÓN PRINCIPAL ──────────────────────────────────

const app = {
  init: () => {
    if (state.appInitialized) {
      console.log('App ya inicializada, ignorando llamada duplicada');
      return;
    }

    console.log('🌊 Inicializando Galicia Guide...');
    
    ui.cacheElements();
    favoritesManager.load();
    geoManager.checkSaved();
    
    ui.renderPlaces();
    mapManager.init();
    navigationManager.init();
    ui.renderFavoritesSection();
    ui.updateSelectionUI();
    
    // Configurar eventos globales
    window.addEventListener('online', () => {
      state.isOnline = true;
      console.log('Conexión restaurada');
    });

    window.addEventListener('offline', () => {
      state.isOnline = false;
      console.log('Sin conexión');
    });

    state.appInitialized = true;
    console.log('✅ App lista');
  }
};

// ── FLUJO DE AUTENTICACIÓN ───────────────────────────────────

function handleLogin(e) {
  e.preventDefault();
  e.stopPropagation();

  const input = document.getElementById('passwordInput');
  const error = document.getElementById('splashError');
  const value = input.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (value === CONFIG.PASSWORD || value === 'caamanho') {
    // ÉXITO: Guardar auth y mostrar app
    authManager.set(true);
    
    error.textContent = '';
    input.classList.remove('error');

    const splash = document.getElementById('splashScreen');
    const main = document.getElementById('mainContent');

    splash.classList.add('hidden');
    main.classList.add('visible');

    // Mostrar "¿Sabías que?" y luego iniciar app
    setTimeout(() => {
      ui.showSabiasQue(() => {
        app.init();
      });
    }, 300);

  } else {
    // ERROR: Mostrar feedback
    input.classList.add('error');
    error.textContent = 'Contraseña incorrecta';

    setTimeout(() => {
      input.classList.remove('error');
    }, 400);

    input.value = '';
    input.focus();
  }
}

// Evento de login
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('splashForm');
  if (form) {
    form.addEventListener('submit', handleLogin);
  }

  // Verificar si ya está autenticado
  setTimeout(() => {
    if (authManager.check()) {
      // Ya autenticado: mostrar "¿Sabías que?" directamente
      const splash = document.getElementById('splashScreen');
      const main = document.getElementById('mainContent');

      // Ocultar temporalmente para mostrar "¿Sabías que?"
      splash.style.visibility = 'hidden';
      main.style.visibility = 'hidden';

      ui.cacheElements();
      
      ui.showSabiasQue(() => {
        // Restaurar visibilidad y mostrar app
        splash.style.visibility = '';
        main.style.visibility = '';
        
        splash.classList.add('hidden');
        main.classList.add('visible');
        
        app.init();
      });
    }
    // Si no está autenticado, el formulario está listo
  }, 100);
});

// ── EXPONER FUNCIONES GLOBALES ────────────────────────────────

window.toggleProvincia = ui.toggleProvincia;
window.togglePlace = ui.togglePlace;
window.abrirSoloUnaRec = (id) => ui.toggleProvincia(id); // Alias para compatibilidad
window.toggleFavorite = favoritesManager.toggle;
window.removeFavorite = favoritesManager.remove;
window.openFullscreenMap = mapManager.openFullscreen;
window.closeFullscreenMap = mapManager.closeFullscreen;
window.toggleGeolocation = geoManager.toggle;
window.scrollToMapFooter = mapManager.scrollToFooter;
window.togglePlaceSelection = routeManager.togglePlace;
window.togglePlaceFromPopup = (id) => {
  routeManager.togglePlace(id);
  ui.updateFullscreenUI();
};
window.clearSelection = routeManager.clear;
window.generateItinerary = routeManager.generateItinerary;

// Debug: Reset auth
window.resetAuth = () => {
  authManager.set(false);
  localStorage.removeItem('galicia_favorites');
  localStorage.removeItem('galicia_lat');
  localStorage.removeItem('galicia_lng');
  localStorage.removeItem('galicia_last_section');
  localStorage.removeItem('galicia_selected_places');
  location.reload();
};

// Log inicial
console.log('Galicia Guide v' + CONFIG.VERSION + ' cargado. Usa resetAuth() para limpiar sesión.');
