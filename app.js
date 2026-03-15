// ANTÍDOTO PARA ELIMINAR CACHÉ ANTIGUA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (var registration of registrations) {
      registration.unregister();
    }
  });
}

// ===== CONTRASEÑA =====
document.getElementById('splashForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var input = document.getElementById('passwordInput');
  var error = document.getElementById('splashError');
  var value = input.value.trim().toLowerCase();
  
  // Comprobación doble: caamaño o caamanho
  if (value === 'caamaño' || value === 'caamanho') {
    document.getElementById('splashScreen').classList.add('hidden');
    document.getElementById('mainContent').classList.add('visible');
    localStorage.setItem('galicia_auth', 'true');
    initApp();
  } else {
    input.classList.add('error');
    error.textContent = 'Contraseña incorrecta';
    setTimeout(function() { input.classList.remove('error'); }, 400);
    input.value = '';
    input.focus();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('galicia_auth') === 'true') {
    document.getElementById('splashScreen').classList.add('hidden');
    document.getElementById('mainContent').classList.add('visible');
    initApp();
  } else {
    setTimeout(function() { 
      var input = document.getElementById('passwordInput');
      if(input) input.focus(); 
    }, 100);
  }
});

// ===== VARIABLES GLOBALES =====
var map = null, mapFullscreen = null, markers = {}, fullscreenMarkers = {};
var userLocation = null, userMarker = null;
var selectedPlaces = [];
var favorites = [];
var carouselsState = {};

// ===== CATEGORÍAS Y BLOQUES =====
var bloques = [
  { id: "acoruna", nombre: "A Coruña", emoji: "🌊", subtitulo: "Costa da Morte, Ártabro..." },
  { id: "lugo", nombre: "Lugo", emoji: "🌲", subtitulo: "Rías Altas, Ancares..." },
  { id: "ourense", nombre: "Ourense", emoji: "🏔️", subtitulo: "Ribeira Sacra, Sil..." },
  { id: "pontevedra", nombre: "Pontevedra", emoji: "🌅", subtitulo: "Rías Baixas, Cíes..." }
];

var categorias = [
  { id: "ciudades", nombreCorto: "Ciudad", emoji: "🏛️" },
  { id: "villas", nombreCorto: "Villa", emoji: "🏘️" },
  { id: "pueblos", nombreCorto: "Pueblo", emoji: "⚓" },
  { id: "costa", nombreCorto: "Costa", emoji: "🏖️" },
  { id: "naturaleza", nombreCorto: "Naturaleza", emoji: "🌿" },
  { id: "patrimonio", nombreCorto: "Patrimonio", emoji: "🏰" },
  { id: "magicos", nombreCorto: "Mágico", emoji: "✨" },
  { id: "termalismo", nombreCorto: "Termalismo", emoji: "♨️" }
];

function getCategoryName(id) { var c = categorias.find(x => x.id === id); return c ? c.nombreCorto : ''; }
function getCategoryEmoji(id) { var c = categorias.find(x => x.id === id); return c ? c.emoji : ''; }

// ===== BASE DE DATOS DE LUGARES =====
var lugares = [
  { id: 1, nombre: "Santiago de Compostela", bloque: "acoruna", categorias: ["ciudades", "patrimonio"], horas: 5, imagen: "img/santiago.jpg", lat: 42.8800, lng: -8.5450, porQueVenir: "Fin del Camino. Ciudad santa, monumental y viva.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Catedral", "Plaza del Obradoiro", "Mercado de Abastos"], comer: "Pulpo en el Mercado.", tomar: "Café en Plaza de Cervantes.", secreto: "Jardines de la Universidad.", masTiempo: "Monte do Gozo.", advertencias: "Muchos turistas." },
  { id: 2, nombre: "A Coruña", bloque: "acoruna", categorias: ["ciudades", "costa"], horas: 4, imagen: "img/acoruna.jpg", lat: 43.3700, lng: -8.4000, porQueVenir: "Ciudad de cristal, faro romano, paseo marítimo.", momentoPerfecto: "Atardecer.", imprescindibles: ["Torre de Hércules", "Paseo marítimo", "Playa de Riazor"], comer: "Pulpería Ezequiela.", tomar: "Estrella Galicia.", secreto: "Inscripciones romanas.", masTiempo: "Aquarium.", advertencias: "Siempre hace aire." },
  { id: 3, nombre: "Betanzos", bloque: "acoruna", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/betanzos.jpg", lat: 43.2833, lng: -8.2167, porQueVenir: "Villa medieval con casco histórico.", momentoPerfecto: "Mañana.", imprescindibles: ["Plaza Mayor", "Iglesia de Santa María"], comer: "Tortilla de Betanzos.", secreto: "Jardines del Pasatiempo.", advertencias: "Fuertes pendientes." },
  { id: 4, nombre: "Cedeira", bloque: "acoruna", categorias: ["costa", "naturaleza"], horas: 2, imagen: "img/cedeira.jpg", lat: 43.6667, lng: -8.0500, porQueVenir: "Playa de Magdalena y puerto pesquero.", momentoPerfecto: "Verano.", imprescindibles: ["Playa de Magdalena", "Puerto"], comer: "Marisco.", secreto: "Senda costera.", advertencias: "Mar peligroso." },
  { id: 5, nombre: "Ortigueira", bloque: "acoruna", categorias: ["costa", "naturaleza"], horas: 3, imagen: "img/ortigueira.jpg", lat: 43.6333, lng: -7.8500, porQueVenir: "Playa de Ortigueira, una de las mejores.", momentoPerfecto: "Marea baja.", imprescindibles: ["Playa", "Cabo Ortegal"], comer: "Marisco.", secreto: "Estaca de Bares.", advertencias: "Marea alta cubre la playa." },
  { id: 6, nombre: "Estaca de Bares", bloque: "acoruna", categorias: ["magicos", "costa"], horas: 2, imagen: "img/estacadebares.jpg", lat: 43.7833, lng: -7.6833, porQueVenir: "Punto más al norte de España.", momentoPerfecto: "Atardecer.", imprescindibles: ["Faro", "Mirador"], secreto: "Amanecer.", advertencias: "Viento muy fuerte." },
  { id: 7, nombre: "Costa da Morte", bloque: "acoruna", categorias: ["magicos", "costa"], horas: 6, imagen: "img/costadamorte.jpg", lat: 43.0000, lng: -9.0000, porQueVenir: "Tramo de costa con naufragios y faros.", momentoPerfecto: "Otoño o invierno.", imprescindibles: ["Faro de Fisterra", "Muxía", "Camariñas"], comer: "Pulpo.", secreto: "Playa de Traba.", advertencias: "Mar siempre peligroso." },
  { id: 8, nombre: "Fragas do Eume", bloque: "acoruna", categorias: ["naturaleza"], horas: 4, imagen: "img/eume.jpg", lat: 43.4167, lng: -8.0667, porQueVenir: "Bosque atlántico mejor conservado.", momentoPerfecto: "Primavera.", imprescindibles: ["Monasterio de Caaveiro", "Ruta del río"], comer: "Picnic.", secreto: "Ruta nocturna guiada.", advertencias: "Cierres por lluvia." },
  { id: 10, nombre: "Cascada del Ézaro", bloque: "acoruna", categorias: ["naturaleza", "costa"], horas: 1, imagen: "img/ezaro.jpg", lat: 42.8667, lng: -9.1167, porQueVenir: "Única cascada que cae al mar.", momentoPerfecto: "Tras lluvias.", imprescindibles: ["Mirador", "Playa"], secreto: "Noche con luna.", advertencias: "Menos agua en verano." },
  { id: 11, nombre: "Padrón", bloque: "acoruna", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/padron.jpg", lat: 42.7333, lng: -8.6500, porQueVenir: "Cuna del peregrino.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Pedrón", "Casa de Rosalía"], comer: "Pimientos de Padrón.", secreto: "Iria Flavia.", advertencias: "Pican algunos." },
  { id: 12, nombre: "San Andrés de Teixido", bloque: "acoruna", categorias: ["magicos"], horas: 3, imagen: "img/teixido.jpg", lat: 43.6333, lng: -8.2500, porQueVenir: "Santuario donde van los que no van en vida.", momentoPerfecto: "Peregrinación.", imprescindibles: ["Santuario", "Vistas"], secreto: "Hierba de enamorar.", advertencias: "Carretera estrecha." },
  { id: 13, nombre: "Muros", bloque: "acoruna", categorias: ["pueblos"], horas: 2, imagen: "img/muros.jpg", lat: 42.7667, lng: -9.0500, porQueVenir: "Puerto pesquero con quintas indias.", momentoPerfecto: "Mañana.", imprescindibles: ["Puerto", "Casco Histórico"], comer: "Pescado fresco.", secreto: "Ruta de las Quintas.", advertencias: "Aparcar difícil." },
  { id: 16, nombre: "Lugo", bloque: "lugo", categorias: ["ciudades", "patrimonio"], horas: 3, imagen: "img/lugo.jpg", lat: 43.0100, lng: -7.5600, porQueVenir: "Muralla romana mejor conservada.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Muralla", "Catedral", "Casco histórico"], comer: "Pulpo.", secreto: "Paseo nocturno.", advertencias: "Ciudad tranquila." },
  { id: 19, nombre: "Ribadeo", bloque: "lugo", categorias: ["costa"], horas: 4, imagen: "img/ribadeo.jpg", lat: 43.5333, lng: -7.0333, porQueVenir: "Villa marinera y playa de las Catedrales.", momentoPerfecto: "Marea baja.", imprescindibles: ["Playa de las Catedrales", "Faro Isla Pancha"], comer: "Marisco.", secreto: "Faro de la Isla Pancha.", advertencias: "Reserva en Catedrales." },
  { id: 22, nombre: "Ourense", bloque: "ourense", categorias: ["ciudades", "termalismo"], horas: 3, imagen: "img/ourense.jpg", lat: 42.3350, lng: -7.8640, porQueVenir: "Termas romanas, casco histórico.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Puente romano", "Termas"], comer: "Pulpo.", secreto: "Termas libres.", advertencias: "Calor en verano." },
  { id: 28, nombre: "Ribeira Sacra", bloque: "ourense", categorias: ["magicos", "naturaleza"], horas: 6, imagen: "img/ribeira.jpg", lat: 42.4500, lng: -7.5500, porQueVenir: "Tierra de monjes y milagros.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Monasterios", "Cañones", "Catamarán"], comer: "Mencía.", secreto: "San Pedro de Rocas.", advertencias: "Carreteras de montaña." },
  { id: 29, nombre: "Vigo", bloque: "pontevedra", categorias: ["ciudades", "costa"], horas: 4, imagen: "img/vigo.jpg", lat: 42.2406, lng: -8.7207, porQueVenir: "Puerto, marisco y puerta de las Cíes.", momentoPerfecto: "Tarde-noche.", imprescindibles: ["O Castro", "Puerto", "Casco Vello"], comer: "Ostras en la Piedra.", secreto: "Taberna de Cervantes.", advertencias: "Cuestas pronunciadas." },
  { id: 30, nombre: "Pontevedra", bloque: "pontevedra", categorias: ["ciudades"], horas: 3, imagen: "img/pontevedra.jpg", lat: 42.4333, lng: -8.6333, porQueVenir: "Ciudad amable con el peatón.", momentoPerfecto: "Tarde para cenar.", imprescindibles: ["Plaza da Ferrería", "La Peregrina"], comer: "Tapeo por las plazas.", secreto: "Convento de San Francisco.", advertencias: "Muy segura." },
  { id: 34, nombre: "Combarro", bloque: "pontevedra", categorias: ["pueblos"], horas: 2, imagen: "img/combarro.jpg", lat: 42.3833, lng: -8.7167, porQueVenir: "Hórreos sobre el mar.", momentoPerfecto: "Atardecer.", imprescindibles: ["Hórreos", "Paseo marítimo"], comer: "Marisco.", secreto: "Noche.", advertencias: "Muy turístico." },
  { id: 38, nombre: "Cíes y Ons", bloque: "pontevedra", categorias: ["naturaleza", "costa"], horas: 6, imagen: "img/ciesyons.jpg", lat: 42.2244, lng: -8.9031, porQueVenir: "Dos archipiélagos protegidos.", momentoPerfecto: "Junio o septiembre.", imprescindibles: ["Playa de Rodas", "Monte Faro"], comer: "Lleva comida.", secreto: "Playa de Figueiras.", advertencias: "Reserva obligatoria." }
];

// ===== INIT APP =====
function initApp() { 
  loadFavorites();
  initAnimations(); 
  renderPlaces(); 
  initBottomMenu(); 
  initMap(); 
  checkSavedLocation(); 
  renderFavoritesSection();
  updateSelectionUI();
}

// ===== FAVORITOS =====
function loadFavorites() { 
  var saved = localStorage.getItem('galicia_favorites'); 
  if (saved) favorites = JSON.parse(saved); 
}

function saveFavorites() { 
  localStorage.setItem('galicia_favorites', JSON.stringify(favorites)); 
}

function toggleFavorite(id) { 
  var idx = favorites.indexOf(id); 
  if (idx > -1) { favorites.splice(idx, 1); } else { favorites.push(id); } 
  saveFavorites(); 
  updateFavoriteButton(id); 
  renderFavoritesSection(); 
}

function isFavorite(id) { return favorites.indexOf(id) > -1; }

function updateFavoriteButton(id) { 
  var btn = document.querySelector('.fav-btn[data-id="' + id + '"]'); 
  if (btn) { btn.classList.toggle('active', isFavorite(id)); } 
}

function renderFavoritesSection() {
  var container = document.getElementById('favoritesSection');
  if (!container) return;
  if (favorites.length === 0) { 
    container.innerHTML = '<div class="favorites-empty">Sin favoritos. Toca el corazón en cualquier lugar.</div>'; 
    return; 
  }
  var html = '<div class="favorites-header"><div class="favorites-title"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Mis favoritos</div></div><div class="favorites-list">';
  favorites.forEach(function(id) {
    var l = lugares.find(x => x.id === id);
    if (!l) return;
    html += '<div class="favorite-item"><img src="' + l.imagen + '" onerror="this.src=\'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop\'"><div class="favorite-info"><div class="favorite-name">' + l.nombre + '</div></div><button class="favorite-remove" onclick="toggleFavorite(' + l.id + ')"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

// ===== GEOLOCATION =====
function checkSavedLocation() { 
  var lat = localStorage.getItem('galicia_lat'), lng = localStorage.getItem('galicia_lng'); 
  if (lat && lng) { 
    userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) }; 
    showUserOnMap(userLocation); 
    updateGeoUI(true); 
  } 
}

function toggleGeolocation() { 
  if (userLocation) { 
    userLocation = null; 
    if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
    localStorage.removeItem('galicia_lat'); 
    localStorage.removeItem('galicia_lng'); 
    updateGeoUI(false); 
  } else { requestLocation(); } 
}

function requestLocation() {
  var btn = document.getElementById('geoBtn'), status = document.getElementById('geoStatus');
  btn.disabled = true; btn.textContent = '...'; 
  navigator.geolocation.getCurrentPosition(
    function(p) { 
      userLocation = { lat: p.coords.latitude, lng: p.coords.longitude }; 
      localStorage.setItem('galicia_lat', userLocation.lat); 
      localStorage.setItem('galicia_lng', userLocation.lng); 
      showUserOnMap(userLocation); 
      updateGeoUI(true); 
      map.setView([userLocation.lat, userLocation.lng], 10); 
    },
    function() { updateGeoUI(false); btn.disabled = false; btn.textContent = 'Activar'; },
    { enableHighAccuracy: true, timeout: 5000 }
  );
}

function showUserOnMap(loc) { 
  if (!map) return; 
  if (userMarker) map.removeLayer(userMarker); 
  userMarker = L.marker([loc.lat, loc.lng], { icon: L.divIcon({ className: 'user-location-marker', iconSize: [14, 14] }) }).addTo(map); 
}

function updateGeoUI(active) { 
  var btn = document.getElementById('geoBtn'), status = document.getElementById('geoStatus'); 
  if (btn) {
    btn.textContent = active ? 'Desactivar' : 'Activar';
    btn.style.background = active ? 'var(--accent-red)' : '';
  }
  if (status) {
    status.textContent = active ? 'Ubicación activada' : 'Actívala para calcular distancias';
    status.classList.toggle('active', active);
  }
}

// ===== SELECCIÓN Y RUTA =====
function togglePlaceSelection(id) {
  var idx = selectedPlaces.indexOf(id);
  if (idx > -1) { selectedPlaces.splice(idx, 1); } else { selectedPlaces.push(id); }
  updateSelectionUI();
  updateMarkerSelection(id);
  if (navigator.vibrate) navigator.vibrate(10); // Vibración al tocar mapa
}

function updateSelectionUI() {
  var totalHours = selectedPlaces.reduce(function(sum, id) {
    var l = lugares.find(x => x.id === id); return sum + (l ? l.horas : 0);
  }, 0);
  
  var statsEl = document.getElementById('selectionStats');
  if (statsEl) statsEl.textContent = selectedPlaces.length + ' lugares · ' + totalHours + 'h';
  
  var content = document.getElementById('selectionContent');
  if (!content) return;
  
  if (selectedPlaces.length === 0) {
    content.innerHTML = '<div class="selection-empty">Toca puntos en el mapa para añadir</div>';
  } else {
    var html = '<div class="selection-list">';
    selectedPlaces.forEach(function(id) {
      var l = lugares.find(x => x.id === id);
      if (!l) return;
      html += '<div class="selection-item"><img src="' + l.imagen + '" class="selection-item-img"><div class="selection-item-info"><div class="selection-item-name">' + l.nombre + '</div></div><button class="selection-item-remove" onclick="togglePlaceSelection(' + l.id + ')"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>';
    });
    html += '</div><div class="action-buttons"><button class="btn-primary" onclick="generateItinerary()">Crear ruta en Google Maps</button><button class="btn-secondary" onclick="clearSelection()">Limpiar selección</button></div>';
    content.innerHTML = html;
  }
}

function clearSelection() {
  selectedPlaces = [];
  updateSelectionUI();
  updateAllMarkers();
}

function updateMarkerSelection(id) {
  var isSelected = selectedPlaces.indexOf(id) > -1;
  [markers[id], fullscreenMarkers[id]].forEach(m => {
    if (m && m.getElement()) m.getElement().classList.toggle('selected-ring', isSelected);
  });
}

function updateAllMarkers() { lugares.forEach(l => updateMarkerSelection(l.id)); }

// ===== MAPAS (SIN BOTONES / SIN POPUPS) =====
function initMap() {
  map = L.map('map', { center: [42.6, -8.4], zoom: 7, dragging: false, zoomControl: false, scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
  lugares.forEach(function(l, i) {
    var isSelected = selectedPlaces.indexOf(l.id) > -1;
    var m = L.marker([l.lat, l.lng], {
      icon: L.divIcon({
        className: 'custom-marker ' + l.bloque + (isSelected ? ' selected-ring' : ''),
        html: '<span>' + (i+1) + '</span>',
        iconSize: [32, 32]
      })
    }).addTo(map);
    m.on('click', function() { togglePlaceSelection(l.id); });
    markers[l.id] = m;
  });
}

window.generateItinerary = function() {
  if (selectedPlaces.length === 0) return alert('Selecciona algún lugar.');
  let baseUrl = "https://www.google.com/maps/dir/?api=1";
  let origin = userLocation ? "&origin=" + userLocation.lat + "," + userLocation.lng : "";
  let stops = [];
  selectedPlaces.forEach(id => { let l = lugares.find(x => x.id == id); if (l) stops.push(l.lat + "," + l.lng); });
  if (!origin) origin = "&origin=" + stops.shift();
  let destination = stops.pop() || "";
  let waypoints = stops.length > 0 ? "&waypoints=" + stops.join('|') : "";
  window.open(baseUrl + origin + "&destination=" + (destination || "") + waypoints + "&travelmode=driving", '_blank');
};

// ===== RENDER CARDS =====
function renderPlaces() {
  var container = document.getElementById('placesContainer');
  if (!container) return;
  var html = '', count = 0;
  
  bloques.forEach(function(bloque) {
    var arr = lugares.filter(l => l.bloque === bloque.id);
    html += '<div class="bloque-card" id="bloque-' + bloque.id + '"><div class="bloque-header ' + bloque.id + '" onclick="toggleBloque(\'bloque-' + bloque.id + '\')"><div class="bloque-body"><span class="bloque-emoji">' + bloque.emoji + '</span><span class="bloque-nombre">' + bloque.nombre + '</span></div><div class="bloque-arrow">▼</div></div><div class="bloque-content"><div class="bloque-content-inner">';
    
    arr.forEach(function(l) {
      count++;
      html += '<article class="place-card ' + l.bloque + '" id="place-' + l.id + '"><div class="place-image"><img src="' + l.imagen + '" loading="lazy"><span class="place-number-badge">' + count + '</span><div class="place-title-overlay"><h3 class="place-title">' + l.nombre + '</h3></div></div><div class="place-header" onclick="toggleExpand(\'place-' + l.id + '\')"><div class="place-header-left">' + l.categorias.map(c => '<span class="place-category-chip ' + c + '">' + getCategoryName(c) + '</span>').join('') + '</div><div class="place-header-right"><button class="fav-btn ' + (isFavorite(l.id) ? 'active' : '') + '" data-id="' + l.id + '" onclick="event.stopPropagation(); toggleFavorite(' + l.id + ')"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button></div></div><div class="place-content"><div class="place-content-inner"><p>' + l.porQueVenir + '</p><div class="info-block"><strong>Imprescindibles:</strong> ' + (l.imprescindibles ? l.imprescindibles.join(', ') : 'Todo') + '</div><div class="info-block"><strong>Comer:</strong> ' + l.comer + '</div></div></div></article>';
    });
    html += '</div></div></div>';
  });
  container.innerHTML = html;
}

function toggleBloque(id) { 
  var el = document.getElementById(id); 
  var wasExpanded = el.classList.contains('expanded');
  document.querySelectorAll('.bloque-card').forEach(x => x.classList.remove('expanded'));
  if (!wasExpanded) el.classList.add('expanded');
}

function toggleExpand(id) { 
  var el = document.getElementById(id); 
  el.classList.toggle('expanded'); 
  if (el.classList.contains('expanded')) {
    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 300);
  }
}

// ===== MENÚ Y ANIMACIONES =====
function initBottomMenu() {
  document.querySelectorAll('.menu-item').forEach(i => {
    i.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.getElementById(this.getAttribute('href').substring(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function initAnimations() { 
  var obs = new IntersectionObserver(e => { e.forEach(x => { if (x.isIntersecting) x.target.classList.add('visible'); }); }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el)); 
}
