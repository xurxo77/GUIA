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
  placeDays: {},
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

// ── DATOS (cargados desde data.json) ────────────────────────
let categorias = [];
let curiosidades = [];
let lugares = [];
let recomendaciones = {};

async function loadData() {
  try {
    // Funciona tanto en GitHub Pages (/GUIA/) como en raíz (/)
    const base = location.pathname.endsWith('/')
      ? location.pathname.slice(0, -1)
      : location.pathname.replace(/\/[^\/]*$/, '');
    const res = await fetch(base + '/data.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    categorias      = data.categorias      || [];
    curiosidades    = data.curiosidades    || [];
    lugares         = data.lugares         || [];
    recomendaciones = data.recomendaciones || {};
    console.log(`[data] Cargados: ${lugares.length} lugares, ${curiosidades.length} curiosidades`);
  } catch (e) {
    console.error('[data] Error cargando data.json:', e);
  }
}
// ── UTILIDADES ───────────────────────────────────────────────

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
      const patterns = { light: 10, medium: 20, heavy: 30, success: [10, 50, 10], error: [30, 100, 30] };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  },

  showToast: (message, duration = 3000) => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
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

// ── GESTIÓN DE FAVORITOS ──────────────────────────────────────

const favoritesManager = {
  load: () => {
    try {
      const saved = localStorage.getItem('galicia_favorites');
      state.favorites = saved ? JSON.parse(saved) : [];
    } catch (e) {
      state.favorites = [];
    }
  },

  save: () => {
    localStorage.setItem('galicia_favorites', JSON.stringify(state.favorites));
  },

  toggle: (id) => {
    const idx = state.favorites.indexOf(id);
    if (idx > -1) {
      state.favorites.splice(idx, 1);
    } else {
      state.favorites.push(id);
    }
    favoritesManager.save();
    ui.updateFavBtn(id);
    ui.renderFavoritesSection();
    utils.haptic('light');
  },

  remove: (id) => {
    state.favorites = state.favorites.filter(f => f !== id);
    favoritesManager.save();
    ui.renderFavoritesSection();
  },

  isFavorite: (id) => state.favorites.includes(id)
};

// ── GESTIÓN DE GEOLOCALIZACIÓN ────────────────────────────────

const geoManager = {
  request: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        ui.updateGeoUI(false, 'Tu dispositivo no soporta geolocalización');
        reject(new Error('No soportado'));
        return;
      }
      const btn = ui.elements.geoBtn;
      const status = ui.elements.geoStatus;
      if (btn) { btn.textContent = '...'; btn.disabled = true; }
      if (status) status.textContent = 'Obteniendo ubicación...';

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
          if (state.mainMap) mapManager.showUserLocation();
          if (state.fsMap)   mapManager.showUserLocation();
          ui.updateGeoUI(true);
          utils.haptic('success');
          resolve(state.userLocation);
        },
        (error) => {
          const msgs = {
            1: 'Permiso denegado. Actívalo en ajustes del navegador.',
            2: 'No se pudo obtener la ubicación.',
            3: 'Tiempo de espera agotado. Inténtalo de nuevo.'
          };
          ui.updateGeoUI(false, msgs[error.code] || 'Error al obtener ubicación');
          reject(error);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
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

  loadHeroWeather: async () => {
    const widget = document.getElementById('heroWeather');
    if (!widget) return;

    const cities = [
      { name: 'A Coruña',   lat: 43.37, lng: -8.40 },
      { name: 'Santiago',   lat: 42.88, lng: -8.54 },
      { name: 'Lugo',       lat: 43.01, lng: -7.56 },
      { name: 'Ourense',    lat: 42.34, lng: -7.86 },
      { name: 'Pontevedra', lat: 42.43, lng: -8.65 },
      { name: 'Vigo',       lat: 42.24, lng: -8.72 }
    ];

    const weatherIcon = (code) => {
      if (code === 0)  return '☀️';
      if (code <= 3)   return '🌤️';
      if (code <= 48)  return '🌫️';
      if (code <= 55)  return '🌦️';
      if (code <= 65)  return '🌧️';
      if (code <= 77)  return '🌨️';
      if (code <= 82)  return '🌦️';
      return '⛈️';
    };

    try {
      const results = await Promise.all(cities.map(async c => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current=temperature_2m,weather_code&timezone=auto`;
        const res  = await fetch(url);
        const data = await res.json();
        return { name: c.name, temp: Math.round(data.current.temperature_2m), code: data.current.weather_code };
      }));

      widget.innerHTML = results.map(r => `
        <div class="weather-city">
          <span class="weather-icon">${weatherIcon(r.code)}</span>
          <span class="weather-temp">${r.temp}°</span>
          <span class="weather-name">${r.name}</span>
        </div>
      `).join('');
    } catch (e) {
      widget.innerHTML = '<span style="font-size:0.72rem;color:var(--fg-muted)">Sin conexión</span>';
    }
  },

  renderRecommendations: () => {
    const htmlAntes = `
            <div class="rec-card">
              <img src="img/rec_chaqueta.jpg" class="rec-card-img" alt="Chaqueta" onerror="this.style.display='none'">
              <h4>🧥 Trae una prenda de abrigo. Siempre.</h4>
              <p style="margin-bottom: 8px !important;">Aunque vengas en agosto y veas sol en la previsión, en Galicia <strong>refresca al caer la tarde</strong>, sobre todo cerca del mar.</p>
              <p>No es drama, pero se agradece no acabar comprando una sudadera de emergencia.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_lluvia.jpg" class="rec-card-img" alt="Lluvia" onerror="this.style.display='none'">
              <h4>🌦️ La lluvia no avisa.</h4>
              <p style="margin-bottom: 8px !important;">No es que llueva todo el día; es peor (o mejor): <strong>puede llover cinco minutos, parar, salir el sol… y repetir</strong>. Incluso te puede pillar justo cuando te pones el bañador.</p>
              <p>Un chubasquero ligero suele ser mejor idea que un paraguas. Y ojo, en verano también hay días de tiempo espectacular.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_clima.jpg" class="rec-card-img" alt="Clima" onerror="this.style.display='none'">
              <h4>🌫️ El clima cambia en horas.</h4>
              <p style="margin-bottom: 8px !important;">Puedes salir con cielo despejado y encontrarte niebla cerrada en la costa en media hora. <strong>Galicia no tiene un clima: tiene varios a la vez.</strong></p>
              <p>Si vas a la playa, consulta la meteorología (viento, niebla, mar) porque puede estar perfecto tierra adentro y torcerse en la costa.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_hambre.jpg" class="rec-card-img" alt="Hambre" onerror="this.style.display='none'">
              <h4>🍽️ Ven con hambre.</h4>
              <p style="margin-bottom: 8px !important;">Las raciones no son simbólicas. <strong>Aquí se come en serio</strong>, y repetir no está mal visto.</p>
              <p>En invierno, además, los platos son especialmente contundentes.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_planes.jpg" class="rec-card-img" alt="Planes" onerror="this.style.display='none'">
              <h4>🧭 No planifiques demasiado.</h4>
              <p style="margin-bottom: 8px !important;">Galicia no encaja bien con horarios rígidos. Muchas veces lo mejor aparece sin buscarlo.</p>
              <p><strong>Deja hueco para improvisar:</strong> suele ser ahí donde aciertas.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_idioma.jpg" class="rec-card-img" alt="Idioma" onerror="this.style.display='none'">
              <h4>🗣️ El gallego existe (y se usa).</h4>
              <p style="margin-bottom: 8px !important;">Escucharás palabras distintas, y es parte del viaje. <strong>Es nuestra identidad y nuestra lengua…</strong> y si quieres, también puede ser un poco la tuya.</p>
              <p>Decir “boas” o “grazas” suma puntos.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_preguntar.jpg" class="rec-card-img" alt="Preguntar" onerror="this.style.display='none'">
              <h4>❓ Pregunta sin miedo.</h4>
              <p style="margin-bottom: 8px !important;">La gente puede parecer seca al principio, pero <strong>si preguntas, te ayudan</strong>. Y muchas veces, mejor que cualquier app.</p>
              <p>Prepárate, eso sí, para respuestas tipo: “depende”, “puede ser”… ayudamos, pero a nuestra manera.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_reservas.jpg" class="rec-card-img" alt="Reservas" onerror="this.style.display='none'">
              <h4>📅 Ojo con las reservas.</h4>
              <p style="margin-bottom: 8px !important;">En sitios conocidos o en verano, <strong>reserva</strong>. Donde menos te lo esperas, se llena.</p>
              <p>Algunos lugares muy demandados <strong>requieren antelación</strong>: Islas Cíes y Ons, el Pórtico de la Gloria o la Playa de las Catedrales.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_gallegos.jpg" class="rec-card-img" alt="Gallegos" onerror="this.style.display='none'">
              <h4>🧍 Los gallegos no somos bordes, somos prudentes.</h4>
              <p style="margin-bottom: 8px !important;">No esperes entusiasmo inmediato. Aquí <strong>primero se observa, luego se confía.</strong></p>
              <p>Pero cuando entras, entras de verdad.</p>
            </div>
          </div>
`;
    const htmlComer = `
            <div class="rec-card">
              <img src="img/rec_pan.jpg" class="rec-card-img" alt="Pan" onerror="this.style.display='none'">
              <h4>🥖 El pan importa. Mucho.</h4>
              <p style="margin-bottom: 6px !important;">No es un simple acompañamiento. En serio: <strong>si el pan falla, desconfía.</strong></p>
              <p style="margin-bottom: 4px !important;">Top 3:</p>
              <ul style="font-size: 0.85rem; line-height: 1.4; color: #555; list-style-type: disc; padding-left: 20px; margin: 0 0 8px 0;">
                <li><strong>Pan de Cea:</strong> el tradicional, horno de leña.</li>
                <li><strong>Pan de Carral:</strong> “molete” con moño.</li>
                <li><strong>Pan de Neda:</strong> corteza gruesa y durabilidad asegurada.</li>
                <li><strong>Pan de O Porriño:</strong> famoso por sus bollas.</li>
              </ul>
              <p>💡 <strong>Consejo:</strong> buen pan puedes encontrarlo en casi cualquier rincón de Galicia.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_queso.jpg" class="rec-card-img" alt="Queso" onerror="this.style.display='none'">
              <h4>🧀 Quesos con carácter</h4>
              <p style="margin-bottom: 8px !important;">Entra en cualquier taberna con buena pinta y pide una tabla de quesos gallegos.</p>
              <p>Desde el cremoso hasta el ahumado: <strong>prueba sin prejuicios</strong>, algunos sorprenden mucho.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_empanada.jpg" class="rec-card-img" alt="Empanada" onerror="this.style.display='none'">
              <h4>🥟 Empanada: simple en apariencia, seria en ejecución</h4>
              <p style="margin-bottom: 8px !important;">Clásicas: <strong>bonito, bacalao con pasas o zamburiñas</strong>, pero también hay versiones con cualquier producto local. La masa varía según la zona.</p>
              <p>Ideal para un picnic improvisado o como sustituto del bocadillo.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_pulpo.jpg" class="rec-card-img" alt="Pulpo" onerror="this.style.display='none'">
              <h4>🐙 Pulpo: menos espectáculo, más respeto</h4>
              <p style="margin-bottom: 8px !important;">Solo necesita sal, aceite y pimentón. <strong>Si está duro… no vuelvas.</strong> Para garantías, busca una buena pulpeira.</p>
              <p>El <strong>pulpo á feira</strong> es la opción clásica y casi siempre la mejor.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_raxo.jpg" class="rec-card-img" alt="Raxo" onerror="this.style.display='none'">
              <h4>🐖 Raxo y zorza: el cerdo bien tratado</h4>
              <p style="margin-bottom: 8px !important;">Platos sencillos y sabrosos, <strong>raciones estrella</strong> de las tabernas gallegas.</p>
              <p>Perfectos para compartir o como plato único.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_pimientos.jpg" class="rec-card-img" alt="Pimientos" onerror="this.style.display='none'">
              <h4>🌶️ Pimientos: una ruleta</h4>
              <p style="margin-bottom: 8px !important;">“Unos pican, otros no”. Los auténticos pimientos de Padrón <strong>se cultivan en Herbón</strong>.</p>
              <p>No todos los que se encuentran fuera de Galicia son reales. Aprovecha mientras estás aquí.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_pescado.jpg" class="rec-card-img" alt="Pescados" onerror="this.style.display='none'">
              <h4>🐟 Pescados: Galicia habla claro</h4>
              <p style="margin-bottom: 8px !important;">Merluza, rodaballo, lubina… <strong>frescos y sin adornos innecesarios.</strong></p>
              <p>A la brasa, en caldeirada o directo de la ría: sencillo y delicioso.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_lacon.jpg" class="rec-card-img" alt="Lacón" onerror="this.style.display='none'">
              <h4>🥬 Lacón con grelos: contundente</h4>
              <p style="margin-bottom: 8px !important;">No es ligero, pero <strong>es Galicia en plato</strong>.</p>
              <p>Plato de temporada: si aparece en la carta, pídelo sin dudar.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_ternera.jpg" class="rec-card-img" alt="Ternera" onerror="this.style.display='none'">
              <h4>🥩 Ternera Gallega: otra liga</h4>
              <p style="margin-bottom: 8px !important;"><strong>Carne con sabor real.</strong></p>
              <p>Poco más que decir: prepárate para disfrutar… y para abrir la cartera si quieres lo mejor.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_furanchos.jpg" class="rec-card-img" alt="Furanchos" onerror="this.style.display='none'">
              <h4>🍷 Furanchos: comer como un local</h4>
              <p style="margin-bottom: 6px !important;"><strong>Qué es:</strong> Casas particulares que venden su vino acompañado de comida casera sencilla.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Dónde:</strong> Sobre todo Rías Baixas, zonas rurales y alrededores de pueblos.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> Temporada concreta según producción de vino.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Lo que mola:</strong> Autenticidad total: sin carta, sin postureo, comida de verdad y ambiente de siempre.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Qué pedir:</strong> Vino de la casa, tortilla, chorizo, zorza... lo que haya ese día.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Recomendación:</strong> Si ves un cartel "Furancho" y no eres muy tiquismiquis, entra sin dudar. No esperes un restaurante al uso y, desde luego, lleva efectivo: no hay otra forma de pagar.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_churrasco.jpg" class="rec-card-img" alt="Churrasco" onerror="this.style.display='none'">
              <h4>🔥 El churrasco: religión en Galicia</h4>
              <p style="margin-bottom: 6px !important;"><strong>Qué es:</strong> Carne a la parrilla (normalmente cerdo o ternera) hecha al fuego, en tiras largas y con su punto de grasa.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Origen:</strong> Llegó desde Latinoamérica y se popularizó en Galicia en los años 70, con parrilladas pioneras en la zona de Lalín.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Dónde:</strong> Parrilladas y casas particulares.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Lo que mola:</strong> Sabor a brasa, raciones abundantes y ambiente de mesa larga, ruido y cero prisas.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Qué pedir:</strong> Churrasco mixto, criollos, patatas y ensalada. Y vino o cerveza.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Recomendación:</strong> Ven con hambre y sin prisas. No esperes cocina "fina": esto va de brasas y disfrutar. Si hay humo y gente alrededor de una parrilla, vas bien.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mariscada.jpg" class="rec-card-img" alt="Marisco" onerror="this.style.display='none'">
              <h4>🦐 Marisco: cuando es bueno, se nota</h4>
              <p style="margin-bottom: 8px !important;">Y cuando no, también. No todo vale: <strong>busca locales con producto fresco y buena rotación.</strong></p>
              <p>Para una experiencia de verdad, calcula <strong>no menos de 70 € por persona</strong>. La tarjeta es casi obligatoria, pero cada bocado lo vale.</p>
            </div>
          </div>
        </div>
      </div>
`;
    const htmlBeber = `
            <div class="rec-card">
              <img src="img/rec_albarino.jpg" class="rec-card-img" alt="Albariño" onerror="this.style.display='none'">
              <h4>🍇 Albariño: fácil de entender, difícil de olvidar</h4>
              <p style="margin-bottom: 12px !important;">Fresco, aromático y muy agradecido. Se cultiva en las Rías Baixas, donde el clima atlántico le da ese punto ácido y salino.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> comida al mediodía, días de calor.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> marisco, pescado, arroces.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> frío, pero no helado.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_ribeiro.jpg" class="rec-card-img" alt="Ribeiro" onerror="this.style.display='none'">
              <h4>🍷 Ribeiro: el clásico que vuelve</h4>
              <p style="margin-bottom: 12px !important;">Histórico y con personalidad. Fue uno de los vinos más exportados en la Edad Media. Hoy vuelve con fuerza.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> comidas largas, sin prisa.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> cocina tradicional, pulpo, carnes suaves.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> déjalo abrirse un poco, gana mucho.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_godello.jpg" class="rec-card-img" alt="Godello" onerror="this.style.display='none'">
              <h4>🍾 Godello: un paso más</h4>
              <p style="margin-bottom: 12px !important;">Más estructura y profundidad. Recuperado hace relativamente poco, ahora juega en primera división.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> cenas, cuando quieres algo más serio.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> pescados potentes, carnes blancas.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> temperatura media, no demasiado frío.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mencia.jpg" class="rec-card-img" alt="Mencía" onerror="this.style.display='none'">
              <h4>🍷 Mencía: el tinto gallego</h4>
              <p style="margin-bottom: 12px !important;">Ligero, afrutado, muy bebible. Especialmente en Ribeira Sacra.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> tarde-noche, tapeo o cena informal.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> raxo, zorza, embutidos.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> ligeramente fresco, incluso en verano.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_barrantes.jpg" class="rec-card-img" alt="Barrantes" onerror="this.style.display='none'">
              <h4>🍶 Barrantes: el raro</h4>
              <p style="margin-bottom: 12px !important;">Turbio, ácido, muy local. Vino de casa, sin filtros.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> taberna, sin postureo.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> marisco, empanada.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> sin pensar demasiado, se bebe y ya.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_licores.jpg" class="rec-card-img" alt="Licores" onerror="this.style.display='none'">
              <h4>🥃 Licores: cuidado que engañan</h4>
              <p style="margin-bottom: 12px !important;">De hierbas o de café, a partir de aguardiente tradicional.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> después de comer.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> sobremesa, conversación larga.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> despacio… aunque no lo parezca.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_queimada.jpg" class="rec-card-img" alt="Queimada" onerror="this.style.display='none'">
              <h4>🔥 Queimada: no es solo beber</h4>
              <p style="margin-bottom: 12px !important;">Ritual con fuego y “conxuro” incluido. Tradición pura.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> de noche.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> grupo, ambiente, ganas de alargar.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> sin prisas. Es experiencia, no solo bebida.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_estrella.jpg" class="rec-card-img" alt="Estrella Galicia" onerror="this.style.display='none'">
              <h4>🍺 Estrella Galicia: juega en casa</h4>
              <p style="margin-bottom: 12px !important;">Clásica, constante, parte del día a día desde 1906.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> siempre.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> cualquier tapa, cualquier momento.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> bien tirada y fría. No tiene más misterio.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_brindis.jpg" class="rec-card-img" alt="Brindis" onerror="this.style.display='none'">
              <h4>💡 Clave general:</h4>
              <p style="margin-bottom: 12px !important;">En Galicia no se bebe rápido. Se bebe acompañando, conversando y comiendo. Si tienes prisa, te estás perdiendo la mitad.</p>
            </div>
          </div>
        </div>
      </div>
`;
    const htmlDisfrutar = `
            <div class="rec-card">
              <img src="img/rec_distancias.jpg" class="rec-card-img" alt="Distancias" onerror="this.style.display='none'">
              <h4>🗺️ No midas en kilómetros, mide en tiempo</h4>
              <p style="margin-bottom: 12px !important;">Las distancias engañan.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> 50 km pueden ser 1 hora o más.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Error típico:</strong> querer ver demasiado en un día.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_coche.jpg" class="rec-card-img" alt="Coche" onerror="this.style.display='none'">
              <h4>🚗 Sin coche, te pierdes Galicia</h4>
              <p style="margin-bottom: 12px !important;">El transporte público no llega a todo.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> alquila coche si quieres libertad.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Ganancia:</strong> acceso a sitios que no salen en ninguna guía.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_gps.jpg" class="rec-card-img" alt="GPS" onerror="this.style.display='none'">
              <h4>📍 El GPS no siempre tiene razón</h4>
              <p style="margin-bottom: 12px !important;">Te puede meter por carreteras estrechas o caminos raros.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> si dudas, no sigas a ciegas.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Mejor opción:</strong> parar y preguntar.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mirador.jpg" class="rec-card-img" alt="Mirador" onerror="this.style.display='none'">
              <h4>📸 Si ves un mirador, párate</h4>
              <p style="margin-bottom: 12px !important;">No todos salen en Google.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> si hay hueco para parar, para.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Resultado:</strong> muchas veces, lo mejor del día.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mar_impone.jpg" class="rec-card-img" alt="Mar" onerror="this.style.display='none'">
              <h4>🌊 El mar aquí impone</h4>
              <p style="margin-bottom: 12px !important;">Especialmente en costa abierta.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> respeta las olas y las corrientes.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Error típico:</strong> confiarse en playas salvajes.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Aviso:</strong> esto es el Atlántico. No es una broma.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_playas.jpg" class="rec-card-img" alt="Playas" onerror="this.style.display='none'">
              <h4>🏖️ No todas las playas son iguales</h4>
              <p style="margin-bottom: 12px !important;">Ría ≠ océano.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Rías:</strong> más tranquilas, familiares.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Abiertas:</strong> más espectaculares, pero más exigentes.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mareas.jpg" class="rec-card-img" alt="Mareas" onerror="this.style.display='none'">
              <h4>🌗 Mira las mareas antes de ir</h4>
              <p style="margin-bottom: 12px !important;">Cambian completamente el paisaje.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> consulta mareas si vas a calas o playas largas.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Ejemplo:</strong> puedes quedarte sin arena… o sin salida. Incluso sin coche.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Prueba:</strong> busca “Galicia coche marea”. Vas a flipar.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_barco.jpg" class="rec-card-img" alt="Barco" onerror="this.style.display='none'">
              <h4>⛴️ Cruza la ría en barco si puedes</h4>
              <p style="margin-bottom: 12px !important;">Algunas rías permiten cruzar en transporte público marítimo, como en Ferrol o Vigo.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> no es solo transporte, es parte del viaje.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Experiencia:</strong> ver la costa desde el agua cambia completamente la perspectiva.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Ejemplo:</strong> la línea Moaña–Vigo es rápida, barata y muy recomendable.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_chiringuitos.jpg" class="rec-card-img" alt="Chiringuitos" onerror="this.style.display='none'">
              <h4>🍻 Aquí chiringuitos, pocos</h4>
              <p style="margin-bottom: 12px !important;">No esperes servicios en todas las playas.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Realidad:</strong> muchas están prácticamente vírgenes.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Clave:</strong> ven preparado. Y sí, a nosotros nos gusta así.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_interior.jpg" class="rec-card-img" alt="Interior" onerror="this.style.display='none'">
              <h4>🌿 El interior es otra Galicia</h4>
              <p style="margin-bottom: 12px !important;">Ríos, bosques, fervenzas.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> no te quedes solo en la costa.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Premio:</strong> menos gente, más autenticidad.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_rias.jpg" class="rec-card-img" alt="Rías" onerror="this.style.display='none'">
              <h4>🌊 Las rías lo explican todo</h4>
              <p style="margin-bottom: 12px !important;">Paisaje, comida, clima.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Regla:</strong> si entiendes las rías, entiendes la mitad de Galicia.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_islas.jpg" class="rec-card-img" alt="Islas" onerror="this.style.display='none'">
              <h4>🏝️ Las islas cambian el ritmo</h4>
              <p style="margin-bottom: 12px !important;">Cíes, Ons… otra velocidad.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> planifica con antelación.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Consejo:</strong> si vas, recórrelas. Merece la pena.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_caminar.jpg" class="rec-card-img" alt="Caminar" onerror="this.style.display='none'">
              <h4>🥾 Caminar es parte del viaje</h4>
              <p style="margin-bottom: 12px !important;">Galicia no se disfruta solo en coche.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> baja, camina, explora.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Resultado:</strong> lo que no ve todo el mundo.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_fiesta.jpg" class="rec-card-img" alt="Fiesta" onerror="this.style.display='none'">
              <h4>🎉 Si hay fiesta, quédate</h4>
              <p style="margin-bottom: 12px !important;">Da igual cuál sea.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> si te coincide una, no la esquives.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Realidad:</strong> es Galicia en estado puro.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Pista:</strong> aquí hay más fiestas que días. Si quieres curiosear, mira: <a href="https://festigaleiros.com/" target="_blank" style="color: var(--accent-sea); font-weight: 600; text-decoration: none;">https://festigaleiros.com/</a></p>
            </div>
            <div class="rec-card">
              <img src="img/rec_magia.jpg" class="rec-card-img" alt="Magia" onerror="this.style.display='none'">
              <h4>🌫️ Galicia también es mágica</h4>
              <p style="margin-bottom: 12px !important;">No todo es paisaje.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> escucha y pregunta.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Extra:</strong> mouras, mouros, trasgos, meigas, la Santa Compaña… hay más historias que kilómetros.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Clave:</strong> la magia, la muerte, el mar y el misterio forman parte de lo que somos.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_traineras.jpg" class="rec-card-img" alt="Traiñeiras" onerror="this.style.display='none'">
              <h4>⛵ Las traiñeiras: el mar también se vive compitiendo</h4>
              <p style="margin-bottom: 6px !important;"><strong>Qué es:</strong> Regatas de embarcaciones tradicionales a remo, con equipos locales y mucha historia.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Dónde:</strong> Toda la costa gallega, especialmente Rías Baixas y Rías Altas. Puertos y villas marineras.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> Verano (julio–septiembre), coincidiendo con ligas y fiestas locales.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Lo que mola:</strong> Ambiente, rivalidad entre pueblos, sonido de los remos y todo muy cerca del agua.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Plan perfecto:</strong> Ver la regata desde el puerto y luego comer o tomar algo por la zona.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Detalle extra:</strong> El timonel de la tripulación vencedora recoge una bandera, que es el premio, y la tiene que ondear.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Error típico:</strong> No mirar el calendario y pensar que hay regata cualquier día. Si coincide, no lo dudes. No es algo preparado para el visitante: es tradición real, y se nota.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mariscadoras.jpg" class="rec-card-img" alt="Mariscadoras" onerror="this.style.display='none'">
              <h4>🐚 Mariscadoras: As fillas da ría</h4>
              <p style="margin-bottom: 6px !important;"><strong>Qué es:</strong> Mujeres que trabajan el marisqueo a pie, recogiendo almejas, berberechos y otros mariscos.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Dónde:</strong> Rías y zonas intermareales de toda Galicia.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> Depende de la marea: bajamar = trabajo en la arena.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Lo que mola:</strong> Trabajo duro, tradición y relación directa con el mar.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Plan perfecto:</strong> Paseo por la ría → verlas trabajar → comer marisco después.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Error típico:</strong> Pensar que es algo "turístico". Es trabajo real. Respeta distancias. Después de verlo, el marisco sabe distinto.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_clavefinal.jpg" class="rec-card-img" alt="Clave final" onerror="this.style.display='none'">
              <h4>💡 Clave final:</h4>
              <p style="margin-bottom: 0 !important;">Disfruta de todo, cuida el entorno, sé buena gente… <strong>y vuelve.</strong></p>
            </div>
          </div>
`;
    const map = {
      'rec-antes': htmlAntes,
      'rec-comer': htmlComer,
      'rec-beber': htmlBeber,
      'rec-disfrutar': htmlDisfrutar,
      'rec-curiosidades': `
            <div class="rec-card">
              <img src="img/cur_diaspora.jpg" class="rec-card-img" alt="Diáspora gallega" onerror="this.style.display='none'">
              <h4>🗺️ La diáspora gallega</h4>
              <p>Más de 2 millones de gallegos emigraron entre finales del XIX y el XX, sobre todo a Argentina, Cuba y Uruguay.</p>
              <p>👉 Hoy hay casi tantos descendientes fuera como gallegos en Galicia.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_energia.jpg" class="rec-card-img" alt="Energía" onerror="this.style.display='none'">
              <h4>⚡ Potencia energética</h4>
              <p>Galicia generó más de 23.000 GWh en 2024, en gran parte con energías limpias.</p>
              <p>👉 El 40% sobrante se exportó a otras partes de España y Europa.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_suevos.jpg" class="rec-card-img" alt="Reino Suevo" onerror="this.style.display='none'">
              <h4>👑 Uno de los primeros reinos de Europa</h4>
              <p>Tras la caída de Roma, en el siglo V, Galicia se consolidó como el Reino de los Suevos.</p>
              <p>👉 Uno de los primeros reinos establecidos en toda Europa occidental.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_celtas.jpg" class="rec-card-img" alt="Raíces celtas" onerror="this.style.display='none'">
              <h4>🏴󠁧󠁢󠁳󠁣󠁴󠁿 Raíces celtas</h4>
              <p>Los castros de piedra, la música con gaitas y muchas tradiciones y leyendas reflejan la herencia celta que aún late en Galicia.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_finisterre.jpg" class="rec-card-img" alt="Fisterra" onerror="this.style.display='none'">
              <h4>🌊 El fin del mundo para los romanos</h4>
              <p>Al llegar a Fisterra, las legiones romanas creían que el mar hervía y no había nada más allá.</p>
              <p>👉 Hoy es el final épico para muchos peregrinos del Camino.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_torre.jpg" class="rec-card-img" alt="Torre de Hércules" onerror="this.style.display='none'">
              <h4>🇮🇪 El vínculo con Irlanda</h4>
              <p>Un texto medieval irlandés cuenta cómo Breogán levantó una torre en Galicia desde la que sus descendientes vieron Irlanda.</p>
              <p>👉 La tradición sitúa esa torre en la actual Torre de Hércules.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_termal.jpg" class="rec-card-img" alt="Termas de Ourense" onerror="this.style.display='none'">
              <h4>♨️ Capital termal de Europa</h4>
              <p>Solo Budapest supera a Ourense en volumen de aguas termales. En As Burgas el agua sale a más de 60ºC.</p>
              <p>👉 Puedes bañarte gratis en pozas naturales del Miño, en pleno invierno.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_idioma.jpg" class="rec-card-img" alt="Gallego y portugués" onerror="this.style.display='none'">
              <h4>🇵🇹 Gallego y portugués: el mismo origen</h4>
              <p>Durante la Edad Media, el galaico-portugués era la lengua de la poesía en toda la Península Ibérica.</p>
              <p>👉 Si hablas gallego, puedes entenderte casi a la perfección con alguien en Portugal o Brasil.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_horreos.jpg" class="rec-card-img" alt="Hórreos" onerror="this.style.display='none'">
              <h4>🏛️ Más de 30.000 hórreos</h4>
              <p>Diseñados para guardar el grano lejos de la humedad y los roedores.</p>
              <p>👉 El hórreo de Carnota mide casi 35 metros. ¡Más grande que muchas casas!</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_santacompana.jpg" class="rec-card-img" alt="Santa Compaña" onerror="this.style.display='none'">
              <h4>👻 La Santa Compaña</h4>
              <p>La leyenda más famosa de Galicia: una procesión de almas en pena que vagan de noche.</p>
              <p>👉 Dicen que huele a cera quemada a su paso. No les mires si no quieres unirte.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_glaciacion.jpg" class="rec-card-img" alt="Glaciación" onerror="this.style.display='none'">
              <h4>🧊 Refugio de la glaciación</h4>
              <p>Mientras Europa quedaba congelada, el clima suave de Galicia permitió sobrevivir a muchísimas especies.</p>
              <p>👉 Esta tierra fue un auténtico santuario de vida.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_eucaliptos.jpg" class="rec-card-img" alt="Eucaliptos" onerror="this.style.display='none'">
              <h4>🌿 El «verde gallego» no es natural</h4>
              <p>Gran parte del paisaje está ocupado por eucaliptos, una especie introducida que desplaza al bosque autóctono.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_gaiteiros.jpg" class="rec-card-img" alt="Gaiteiros" onerror="this.style.display='none'">
              <h4>🎵 Los gaiteiros, músicos del pueblo</h4>
              <p>Durante siglos recorrieron aldeas tocando en romerías, marcando el ritmo de bodas y procesiones.</p>
              <p>👉 Hoy son símbolo absoluto de la cultura gallega.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_marinos.jpg" class="rec-card-img" alt="Marinos" onerror="this.style.display='none'">
              <h4>⚓ Marinos clave en la expansión española</h4>
              <p>Los gallegos formaron parte de grandes expediciones marítimas, curtidos por el duro Atlántico.</p>
              <p>👉 Galicia ha vivido siempre de cara al mar.</p>
            </div>
            <div class="rec-card">
              <img src="img/cur_rosalia.jpg" class="rec-card-img" alt="Rosalía" onerror="this.style.display='none'">
              <h4>📖 Rosalía de Castro</h4>
              <p>En el siglo XIX fue una de las primeras autoras en escribir en gallego, dignificando la lengua y reflejando la morriña.</p>
              <p>👉 Su obra marcó el inicio del Rexurdimento cultural gallego.</p>
            </div>
      `
    };
    Object.entries(map).forEach(([id, html]) => {
      const scroll = document.querySelector(`#${id} .horizontal-scroll`);
      if (!scroll) return;
      scroll.innerHTML = html;

      // Swipe hint
      const existing = scroll.parentNode.querySelector('.swipe-hint');
      if (!existing) {
        const hint = document.createElement('div');
        hint.className = 'swipe-hint';
        hint.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg> desliza para ver más`;
        scroll.parentNode.insertBefore(hint, scroll.nextSibling);
      }

      // Leer más en cada tarjeta
      scroll.querySelectorAll('.rec-card').forEach(card => {
        const img  = card.querySelector('img');
        const h4   = card.querySelector('h4');
        const body = [...card.children].filter(el => el !== img && el !== h4);
        if (!body.length) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'rec-card-body';
        body.forEach(el => wrapper.appendChild(el));

        const btn = document.createElement('button');
        btn.className = 'rec-card-toggle';
        btn.innerHTML = `Leer más <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
        btn.addEventListener('click', () => {
          const open = wrapper.classList.toggle('visible');
          btn.classList.toggle('open', open);
          btn.innerHTML = open
            ? `Leer menos <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`
            : `Leer más <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
        });

        card.appendChild(wrapper);
        card.appendChild(btn);
      });
    });
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

    // Cerrar todos los demás province-box y resetear su scroll al inicio
    const container = element.closest('section') || document.body;
    container.querySelectorAll('.province-box.expanded').forEach(el => {
      if (el.id !== id) {
        el.classList.remove('expanded');
        setTimeout(() => {
          const scroll = el.querySelector('.horizontal-scroll');
          if (scroll) scroll.scrollLeft = 0;
          el.querySelectorAll('.rec-card-body.visible').forEach(b => b.classList.remove('visible'));
          el.querySelectorAll('.rec-card-toggle.open').forEach(btn => {
            btn.classList.remove('open');
            btn.innerHTML = `Leer más <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
          });
        }, 450);
      }
    });

    if (!wasExpanded) {
      element.classList.add('expanded');
      setTimeout(() => {
        const section = element.closest('#recomendaciones, #lugares');
        if (section) {
          const top = element.offsetTop - 70;
          section.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
        const firstCard = element.querySelector('.rec-card');
        if (firstCard) {
          firstCard.classList.remove('rec-scroll-hint');
          void firstCard.offsetWidth;
          firstCard.classList.add('rec-scroll-hint');
          setTimeout(() => firstCard.classList.remove('rec-scroll-hint'), 1200);
        }
      }, 300);
    } else {
      element.classList.remove('expanded');
      setTimeout(() => {
        const scroll = element.querySelector('.horizontal-scroll');
        if (scroll) scroll.scrollLeft = 0;
        element.querySelectorAll('.rec-card-body.visible').forEach(b => b.classList.remove('visible'));
        element.querySelectorAll('.rec-card-toggle.open').forEach(btn => {
          btn.classList.remove('open');
          btn.innerHTML = `Leer más <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
        });
      }, 450);
    }

    utils.haptic('light');
  },

  togglePlace: (id) => {
    const card = document.getElementById(id);
    if (!card) return;

    const isExpanded = card.classList.toggle('expanded');

    if (isExpanded) {
      setTimeout(() => {
        const section = card.closest('#lugares');
        if (section) {
          const top = card.offsetTop - 70;
          section.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      }, 150);
      utils.haptic('medium');
    } else {
      utils.haptic('light');
    }
  },

  updateFavoriteButton: (id) => {
    const btn = document.querySelector(`.fav-btn[data-id="${id}"]`);
    if (!btn) return;
    const isNowFav = favoritesManager.isFavorite(id);
    btn.classList.toggle('active', isNowFav);

    if (isNowFav) {
      // Animación burst
      btn.classList.remove('burst');
      void btn.offsetWidth;
      btn.classList.add('burst');
      setTimeout(() => btn.classList.remove('burst'), 500);

      // Partículas
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      angles.forEach(angle => {
        const p = document.createElement('span');
        p.className = 'fav-particle';
        const rad = angle * Math.PI / 180;
        const dist = 20 + Math.random() * 10;
        p.style.setProperty('--tx', `${Math.cos(rad) * dist}px`);
        p.style.setProperty('--ty', `${Math.sin(rad) * dist}px`);
        p.style.left = '50%';
        p.style.top  = '50%';
        p.style.marginLeft = '-3px';
        p.style.marginTop  = '-3px';
        btn.appendChild(p);
        setTimeout(() => p.remove(), 550);
      });
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

    // Calcular número máximo de días asignados
    const maxDay = Math.max(...Object.values(state.placeDays || {}), 1);

    // Agrupar lugares por día
    const byDay = {};
    state.selectedPlaces.forEach(id => {
      const day = (state.placeDays || {})[id] || 1;
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(id);
    });
    const days = Object.keys(byDay).map(Number).sort((a,b) => a - b);

    let html = '';

    days.forEach(day => {
      const dayHours = byDay[day].reduce((sum, id) => {
        const l = lugares.find(x => x.id === id);
        return sum + (l?.horas || 0);
      }, 0);

      html += `
        <div class="day-group">
          <div class="day-group-header">
            <span class="day-badge">Día ${day}</span>
            <span class="day-hours">${dayHours}h</span>
          </div>
      `;

      byDay[day].forEach(id => {
        const lugar = lugares.find(l => l.id === id);
        if (!lugar) return;
        const currentDay = (state.placeDays || {})[id] || 1;

        // Generar opciones de días (hasta maxDay + 1 para poder añadir día nuevo)
        let dayOptions = '';
        for (let d = 1; d <= maxDay + 1; d++) {
          dayOptions += `<option value="${d}" ${d === currentDay ? 'selected' : ''}>Día ${d}</option>`;
        }

        html += `
          <div class="selection-item">
            <img src="${lugar.imagen}" class="selection-item-img" loading="lazy"
                 onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop'"
                 alt="${utils.sanitizeHTML(lugar.nombre)}">
            <div class="selection-item-info">
              <div class="selection-item-name">${utils.sanitizeHTML(lugar.nombre)}</div>
              <div class="selection-item-meta">
                <span class="selection-item-time">⏱ ${lugar.horas}h</span>
                <select class="day-select" onchange="routeManager.setDay(${lugar.id}, parseInt(this.value))">
                  ${dayOptions}
                </select>
              </div>
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

      html += `</div>`;
    });

    html += `
      <div class="action-buttons">
        <button class="btn-primary" onclick="routeManager.generateItinerary()">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Abrir en Google Maps
        </button>
        <button class="btn-share" onclick="routeManager.share()">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Compartir ruta
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
      ui.elements.mapSelectionCount.textContent = `${state.selectedPlaces.length} seleccionado${state.selectedPlaces.length !== 1 ? 's' : ''}`;
    }
    // Buscar también en el DOM en tiempo real por si no estaba cacheado
    const countEl = document.getElementById('mapSelectionCount');
    if (countEl) countEl.textContent = `${state.selectedPlaces.length} seleccionado${state.selectedPlaces.length !== 1 ? 's' : ''}`;
    
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

// ── GESTIÓN DE MAPAS ─────────────────────────────────────────

const mapManager = {
  init: () => {
    if (state.mainMap) return;
    setTimeout(() => {
      state.mainMap = L.map('map', {
        center: CONFIG.MAP_CENTER,
        zoom: CONFIG.MAP_ZOOM_DEFAULT,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomControl: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
        attributionControl: false
      });

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

      setTimeout(() => {
        state.mainMap.invalidateSize();
        state.mainMap.setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM_DEFAULT);
      }, 200);

      if (state.userLocation) mapManager.showUserLocation();
    }, 100);
  },

  addMarker: (lugar, index) => {
    const isSelected = state.selectedPlaces.includes(lugar.id);
    const marker = L.marker([lugar.lat, lugar.lng], {
      icon: L.divIcon({
        className: `custom-marker ${lugar.bloque} ${isSelected ? 'selected-ring' : ''}`,
        html: `<span>${index + 1}</span>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      })
    }).addTo(state.mainMap);
    state.markers[lugar.id] = marker;
  },

  showPopup: (lugar, latlng, mapInstance) => {
    const isSelected = state.selectedPlaces.includes(lugar.id);
    const btnText = isSelected ? '❌ Quitar' : '✚ Añadir';
    const btnColor = isSelected ? '#B3261E' : '#1a5276';
    const popupHtml = `
      <div style="text-align:center; min-width:160px; font-family:sans-serif;">
        <img src="${lugar.imagen}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;margin-bottom:10px;" onerror="this.style.display='none'">
        <div style="font-weight:700;font-size:1rem;margin-bottom:6px;">${utils.sanitizeHTML(lugar.nombre)}</div>
        <div style="font-size:0.8rem;color:#666;margin-bottom:12px;">${lugar.horas}h</div>
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
    btn.textContent = isSelected ? '❌ Quitar' : '✚ Añadir';
    btn.style.background = isSelected ? '#B3261E' : '#1a5276';
  },

  showUserLocation: () => {
    if (!state.userLocation) return;
    const addToMap = (map) => {
      if (!map) return;
      if (state.userMarker) {
        try { map.removeLayer(state.userMarker); } catch(e) {}
      }
      state.userMarker = L.marker([state.userLocation.lat, state.userLocation.lng], {
        icon: L.divIcon({
          className: 'user-location-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(map);
    };
    addToMap(state.mainMap);
    addToMap(state.fsMap);
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
          zoom: CONFIG.MAP_ZOOM_DEFAULT,
          zoomControl: true,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(state.fsMap);

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
          marker.on('click', (e) => { mapManager.showPopup(lugar, e.latlng, state.fsMap); });
          state.fullscreenMarkers[lugar.id] = marker;
        });
      } else {
        lugares.forEach(lugar => {
          const marker = state.fullscreenMarkers[lugar.id];
          if (marker) {
            const element = marker.getElement();
            if (element) element.classList.toggle('selected-ring', state.selectedPlaces.includes(lugar.id));
          }
        });
        state.fsMap.invalidateSize();
      }

      if (state.userLocation) mapManager.showUserLocation();
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
  save: () => {
    localStorage.setItem('galicia_selected_places', JSON.stringify(state.selectedPlaces));
    localStorage.setItem('galicia_place_days', JSON.stringify(state.placeDays));
  },

  load: () => {
    try {
      const saved = localStorage.getItem('galicia_selected_places');
      if (saved) state.selectedPlaces = JSON.parse(saved) || [];
      const savedDays = localStorage.getItem('galicia_place_days');
      if (savedDays) state.placeDays = JSON.parse(savedDays) || {};
    } catch (e) {
      state.selectedPlaces = [];
      state.placeDays = {};
    }
  },

  setDay: (id, day) => {
    if (!state.placeDays) state.placeDays = {};
    state.placeDays[id] = day;
    routeManager.save();
    ui.updateSelectionUI();
  },

  togglePlace: (id) => {
    const index = state.selectedPlaces.indexOf(id);
    if (index > -1) {
      state.selectedPlaces.splice(index, 1);
      if (state.placeDays) delete state.placeDays[id];
      utils.haptic('light');
    } else {
      state.selectedPlaces.push(id);
      utils.haptic('medium');
    }
    routeManager.save();
    ui.updateSelectionUI();

    const marker = state.markers[id];
    if (marker) {
      const element = marker.getElement();
      if (element) element.classList.toggle('selected-ring', index === -1);
    }
    const fsMarker = state.fullscreenMarkers[id];
    if (fsMarker) {
      const element = fsMarker.getElement();
      if (element) element.classList.toggle('selected-ring', index === -1);
    }
    return index === -1;
  },

  clear: () => {
    state.selectedPlaces = [];
    state.placeDays = {};
    routeManager.save();
    ui.updateSelectionUI();
    Object.keys(state.markers).forEach(id => {
      const marker = state.markers[id];
      if (marker) {
        const element = marker.getElement();
        if (element) element.classList.remove('selected-ring');
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
    if (state.userLocation) waypoints.push(`${state.userLocation.lat},${state.userLocation.lng}`);
    state.selectedPlaces.forEach(id => {
      const lugar = lugares.find(l => l.id === id);
      if (lugar?.lat && lugar?.lng) waypoints.push(`${lugar.lat},${lugar.lng}`);
    });
    if (waypoints.length === 0) { alert('No se encontraron coordenadas válidas.'); return; }
    window.open(`https://www.google.com/maps/dir/${waypoints.join('/')}`, '_blank');
  },

  share: () => {
    if (state.selectedPlaces.length === 0) {
      alert('Añade lugares a tu ruta antes de compartirla.');
      return;
    }
    const totalHoras = routeManager.getTotalHours();
    const byDay = {};
    state.selectedPlaces.forEach(id => {
      const day = (state.placeDays || {})[id] || 1;
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(id);
    });
    const days = Object.keys(byDay).map(Number).sort((a,b) => a - b);
    let bloques = '';
    days.forEach(day => {
      const dayHours = byDay[day].reduce((sum, id) => {
        const l = lugares.find(x => x.id === id);
        return sum + (l?.horas || 0);
      }, 0);
      bloques += `\n📅 Día ${day} (${dayHours}h)\n`;
      byDay[day].forEach((id, i) => {
        const lugar = lugares.find(l => l.id === id);
        if (lugar) bloques += `  ${i + 1}. ${lugar.nombre} (${lugar.horas}h)\n`;
      });
    });
    const texto = `🗺️ Mi ruta por Galicia\n${bloques}\n⏱️ Tiempo total: ${totalHoras}h\n\nCreada con la Guía de Galicia de Xurxo & Raquel 💚`;
    if (navigator.share) {
      navigator.share({ title: 'Mi ruta por Galicia', text: texto })
        .catch(() => routeManager._copyToClipboard(texto));
    } else {
      routeManager._copyToClipboard(texto);
    }
  },

  _copyToClipboard: (texto) => {
    navigator.clipboard?.writeText(texto).then(() => {
      utils.showToast('Ruta copiada al portapapeles 📋');
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = texto;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      utils.showToast('Ruta copiada al portapapeles 📋');
    });
  },

  getTotalHours: () => {
    return state.selectedPlaces.reduce((sum, id) => {
      const lugar = lugares.find(l => l.id === id);
      return sum + (lugar?.horas || 0);
    }, 0);
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

    // Actualizar botones
    document.querySelectorAll('.menu-item').forEach((item, idx) => {
      item.classList.toggle('active', idx === targetIndex);
    });

    const fromScreen = document.getElementById(fromId);
    const toScreen   = document.getElementById(targetId);

    if (fromScreen && toScreen) {
      // Cerrar todos los acordeones abiertos al salir de una sección
      fromScreen.querySelectorAll('.province-box.expanded').forEach(el => {
        el.classList.remove('expanded');
        setTimeout(() => {
          const scroll = el.querySelector('.horizontal-scroll');
          if (scroll) scroll.scrollLeft = 0;
          // Resetear los "Leer más"
          el.querySelectorAll('.rec-card-body.visible').forEach(body => {
            body.classList.remove('visible');
          });
          el.querySelectorAll('.rec-card-toggle.open').forEach(btn => {
            btn.classList.remove('open');
            btn.innerHTML = `Leer más <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
          });
        }, 350);
      });

      fromScreen.classList.remove('active-screen');
      toScreen.classList.add('active-screen');

      if (targetId === 'generador' && state.mainMap) {
        setTimeout(() => {
          state.mainMap.invalidateSize();
          state.mainMap.setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM_DEFAULT);
        }, 100);
      }
    }

    state.currentSection = targetId;
    navigationManager.currentIndex = targetIndex;
    utils.haptic('light');
  }
};

// ── WIDGET DEL TIEMPO ─────────────────────────────────────────

const weatherManager = {
  cities: [
    { name: 'A Coruña',    lat: 43.37, lng: -8.40 },
    { name: 'Santiago',    lat: 42.88, lng: -8.54 },
    { name: 'Lugo',        lat: 43.01, lng: -7.56 },
    { name: 'Ourense',     lat: 42.34, lng: -7.86 },
    { name: 'Pontevedra',  lat: 42.43, lng: -8.64 },
    { name: 'Vigo',        lat: 42.24, lng: -8.72 }
  ],

  codeToEmoji: (code) => {
    if (code === 0) return '☀️';
    if (code <= 2)  return '⛅';
    if (code <= 3)  return '☁️';
    if (code <= 48) return '🌫️';
    if (code <= 57) return '🌦️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '🌨️';
    if (code <= 82) return '🌧️';
    if (code <= 86) return '❄️';
    return '⛈️';
  },

  load: async () => {
    const container = document.getElementById('weatherCities');
    if (!container) return;

    try {
      const lats  = weatherManager.cities.map(c => c.lat).join(',');
      const lngs  = weatherManager.cities.map(c => c.lng).join(',');
      const url   = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current_weather=true&temperature_unit=celsius&timezone=Europe%2FMadrid`;
      const res   = await fetch(url);
      const data  = await res.json();

      const results = Array.isArray(data) ? data : [data];
      let html = '';

      weatherManager.cities.forEach((city, i) => {
        const w    = results[i]?.current_weather;
        if (!w) return;
        const icon = weatherManager.codeToEmoji(w.weathercode);
        const temp = Math.round(w.temperature);
        html += `
          <div class="weather-city-row">
            <span class="weather-city-name">${city.name}</span>
            <div class="weather-city-right">
              <span class="weather-city-icon">${icon}</span>
              <span class="weather-city-temp">${temp}°</span>
            </div>
          </div>`;
      });

      container.innerHTML = html || '<span style="font-size:0.78rem;color:var(--fg-muted)">Sin datos disponibles</span>';
    } catch (e) {
      container.innerHTML = '<span style="font-size:0.78rem;color:var(--fg-muted)">Sin conexión</span>';
    }
  }
};

// ── INICIALIZACIÓN PRINCIPAL ──────────────────────────────────

const app = {
  init: async () => {
    if (state.appInitialized) {
      console.log('App ya inicializada, ignorando llamada duplicada');
      return;
    }

    console.log('🌊 Cargando datos...');
    await loadData();
    console.log(`🌊 Datos listos — ${lugares.length} lugares, iniciando app...`);

    try {
      ui.cacheElements();
      favoritesManager.load();
      routeManager.load();
      geoManager.checkSaved();
      
      ui.renderRecommendations();
      ui.renderPlaces();
      mapManager.init();
      navigationManager.init();
      ui.renderFavoritesSection();
      ui.updateSelectionUI();
      ui.loadHeroWeather();
      
      window.addEventListener('online',  () => { state.isOnline = true; });
      window.addEventListener('offline', () => { state.isOnline = false; });

      state.appInitialized = true;
      console.log('✅ App lista');

      weatherManager.load();
    } catch (err) {
      console.error('❌ Error en app.init():', err);
      throw err; // Re-lanzar para que el .catch() del login lo capture
    }
  }
};

// ── FLUJO DE AUTENTICACIÓN ───────────────────────────────────

function handleLogin(e) {
  e.preventDefault();
  e.stopPropagation();

  const input = document.getElementById('passwordInput');
  const error = document.getElementById('splashError');
  const value = input.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (value === CONFIG.PASSWORD || value === 'caamanho' || value === 'caamano') {
    authManager.set(true);
    error.textContent = '';
    input.classList.remove('error');

    const btn = document.querySelector('.splash-btn');
    if (btn) { btn.textContent = '...'; btn.disabled = true; }

    const splash = document.getElementById('splashScreen');
    const main   = document.getElementById('mainContent');

    app.init()
      .then(() => {
        splash.classList.add('hidden');
        main.classList.add('visible');
      })
      .catch(err => {
        console.error('Error en app.init():', err);
        // Mostrar la app igualmente aunque haya fallado algo
        splash.classList.add('hidden');
        main.classList.add('visible');
        if (btn) { btn.textContent = 'Entrar'; btn.disabled = false; }
      });

  } else {
    input.classList.add('error');
    error.textContent = 'Contraseña incorrecta';
    setTimeout(() => input.classList.remove('error'), 400);
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
      const splash = document.getElementById('splashScreen');
      const main   = document.getElementById('mainContent');

      app.init()
        .then(() => {
          splash.classList.add('hidden');
          main.classList.add('visible');
        })
        .catch(err => {
          console.error('Error en app.init() (auth guardada):', err);
          splash.classList.add('hidden');
          main.classList.add('visible');
        });
    }
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
window.shareRoute = routeManager.share;

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


// ── INSTALACIÓN PWA ───────────────────────────────────────────

let deferredInstallPrompt = null;

// Capturar el evento antes de que el navegador lo muestre por su cuenta
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;

  // Mostrar el banner solo si el usuario no lo ha descartado antes
  if (!localStorage.getItem('pwa_install_dismissed')) {
    const banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'flex';
  }
});

// Botón Instalar
document.getElementById('installBtn')?.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === 'accepted') {
    document.getElementById('installBanner').style.display = 'none';
  }
  deferredInstallPrompt = null;
});

// Botón Cerrar
document.getElementById('installClose')?.addEventListener('click', () => {
  document.getElementById('installBanner').style.display = 'none';
  localStorage.setItem('pwa_install_dismissed', '1');
});

// Cuando ya está instalada, ocultar el banner
window.addEventListener('appinstalled', () => {
  document.getElementById('installBanner').style.display = 'none';
  deferredInstallPrompt = null;
});

// Hint de instalación para iOS (no soporta beforeinstallprompt)
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
if (isIOS && !isStandalone && !localStorage.getItem('ios_hint_dismissed')) {
  const hint = document.getElementById('iosInstallHint');
  if (hint) setTimeout(() => hint.style.display = 'flex', 2000);
}
