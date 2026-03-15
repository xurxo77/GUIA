// ====== GESTIÓN DE LA PANTALLA DE CONTRASEÑA ======
document.getElementById('splashForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var input = document.getElementById('passwordInput');
  var val = input.value.trim().toLowerCase();
  
  if (val === 'caamaño' || val === 'caamanho') {
    document.getElementById('splashScreen').classList.add('hidden');
    document.getElementById('mainContent').classList.add('visible');
    localStorage.setItem('galicia_auth', 'true');
    // TRUCO VITAL: Esperamos 300ms para que el CSS dibuje la pantalla, y ENTONCES cargamos el mapa.
    setTimeout(initApp, 300);
  } else {
    document.getElementById('splashError').textContent = 'Contraseña incorrecta';
    input.value = '';
  }
});

document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('galicia_auth') === 'true') {
    document.getElementById('splashScreen').classList.add('hidden');
    document.getElementById('mainContent').classList.add('visible');
    setTimeout(initApp, 100);
  }
});

// ====== VARIABLES GLOBALES ======
var mainMap = null, fsMap = null;
var markers = {}, fullscreenMarkers = {};
var userLocation = null;
var selectedPlaces = [];
var favorites = [];

// DATOS ESTRUCTURALES
var bloques = [
  { id: "acoruna", nombre: "A Coruña", emoji: "🌊" },
  { id: "lugo", nombre: "Lugo", emoji: "🌲" },
  { id: "ourense", nombre: "Ourense", emoji: "🏔️" },
  { id: "pontevedra", nombre: "Pontevedra", emoji: "🌅" }
];

// LISTADO COMPLETO DE LUGARES (LOS 38 INTACTOS)
var lugares = [
  { id: 1, nombre: "Santiago de Compostela", bloque: "acoruna", horas: 5, imagen: "img/santiago.jpg", lat: 42.8800, lng: -8.5450, info: "Ciudad santa y monumental." },
  { id: 2, nombre: "A Coruña", bloque: "acoruna", horas: 4, imagen: "img/acoruna.jpg", lat: 43.3700, lng: -8.4000, info: "Ciudad de cristal y Faro de Hércules." },
  { id: 3, nombre: "Betanzos", bloque: "acoruna", horas: 2, imagen: "img/betanzos.jpg", lat: 43.2833, lng: -8.2167, info: "Villa medieval, tortilla famosa." },
  { id: 4, nombre: "Cedeira", bloque: "acoruna", horas: 2, imagen: "img/cedeira.jpg", lat: 43.6667, lng: -8.0500, info: "Playa y puerto pesquero." },
  { id: 5, nombre: "Ortigueira", bloque: "acoruna", horas: 3, imagen: "img/ortigueira.jpg", lat: 43.6333, lng: -7.8500, info: "Paisajes de Rías Altas." },
  { id: 6, nombre: "Estaca de Bares", bloque: "acoruna", horas: 2, imagen: "img/estacadebares.jpg", lat: 43.7833, lng: -7.6833, info: "Punto más al norte de España." },
  { id: 7, nombre: "Costa da Morte", bloque: "acoruna", horas: 6, imagen: "img/costadamorte.jpg", lat: 43.0000, lng: -9.0000, info: "Faros, mar salvaje y naufragios." },
  { id: 8, nombre: "Fragas do Eume", bloque: "acoruna", horas: 4, imagen: "img/eume.jpg", lat: 43.4167, lng: -8.0667, info: "El bosque atlántico más mágico." },
  { id: 9, nombre: "Monte Pindo", bloque: "acoruna", horas: 3, imagen: "img/pindo.jpg", lat: 42.9000, lng: -9.1000, info: "El Olimpo Celta de granito." },
  { id: 10, nombre: "Cascada del Ézaro", bloque: "acoruna", horas: 1, imagen: "img/ezaro.jpg", lat: 42.8667, lng: -9.1167, info: "Única cascada que cae directo al mar." },
  { id: 11, nombre: "Padrón", bloque: "acoruna", horas: 2, imagen: "img/padron.jpg", lat: 42.7333, lng: -8.6500, info: "Pimientos y cuna de Rosalía de Castro." },
  { id: 12, nombre: "San Andrés de Teixido", bloque: "acoruna", horas: 3, imagen: "img/teixido.jpg", lat: 43.6333, lng: -8.2500, info: "Santuario de peregrinación mística." },
  { id: 13, nombre: "Muros", bloque: "acoruna", horas: 2, imagen: "img/muros.jpg", lat: 42.7667, lng: -9.0500, info: "Precioso pueblo marinero en la ría." },
  { id: 14, nombre: "Noia", bloque: "acoruna", horas: 2, imagen: "img/noia.jpg", lat: 42.7833, lng: -8.8833, info: "El 'Pequeño Santiago' medieval." },
  { id: 15, nombre: "Ferrol", bloque: "acoruna", horas: 3, imagen: "img/ferrol.jpg", lat: 43.4833, lng: -8.2333, info: "Arsenal naval e historia ilustrada." },
  { id: 16, nombre: "Lugo", bloque: "lugo", horas: 3, imagen: "img/lugo.jpg", lat: 43.0100, lng: -7.5600, info: "Muralla romana Patrimonio de la Humanidad." },
  { id: 17, nombre: "Viveiro", bloque: "lugo", horas: 3, imagen: "img/viveiro.jpg", lat: 43.6500, lng: -7.6000, info: "Casco histórico y puerta de Carlos V." },
  { id: 18, nombre: "Mondoñedo", bloque: "lugo", horas: 2, imagen: "img/mondonedo.jpg", lat: 43.4667, lng: -7.4500, info: "Catedral y tarta tradicional." },
  { id: 19, nombre: "Ribadeo", bloque: "lugo", horas: 4, imagen: "img/ribadeo.jpg", lat: 43.5333, lng: -7.0333, info: "Playa de las Catedrales y frontera asturiana." },
  { id: 20, nombre: "Serra dos Ancares", bloque: "lugo", horas: 5, imagen: "img/ancares.jpg", lat: 42.7833, lng: -7.2000, info: "Montaña virgen y antiguas pallozas." },
  { id: 21, nombre: "Chantada", bloque: "lugo", horas: 2, imagen: "img/chantada.jpg", lat: 42.6167, lng: -7.7667, info: "Corazón vitivinícola del Miño." },
  { id: 22, nombre: "Ourense", bloque: "ourense", horas: 3, imagen: "img/ourense.jpg", lat: 42.3350, lng: -7.8640, info: "Capital termal, burgas y puente romano." },
  { id: 23, nombre: "Allariz", bloque: "ourense", horas: 2, imagen: "img/allariz.jpg", lat: 42.1833, lng: -7.8000, info: "Una de las villas más bonitas de España." },
  { id: 24, nombre: "Ribadavia", bloque: "ourense", horas: 2, imagen: "img/ribadavia.jpg", lat: 42.2833, lng: -8.1500, info: "Barrio judío y cuna del vino Ribeiro." },
  { id: 25, nombre: "Monforte de Lemos", bloque: "ourense", horas: 3, imagen: "img/monforte.jpg", lat: 42.5167, lng: -7.5167, info: "Capital de la Ribeira Sacra." },
  { id: 26, nombre: "Castro Caldelas", bloque: "ourense", horas: 2, imagen: "img/castro.jpg", lat: 42.3581, lng: -7.4649, info: "Castillo y vistas a las montañas." },
  { id: 27, nombre: "Cañón del Sil", bloque: "ourense", horas: 5, imagen: "img/sil.jpg", lat: 42.4167, lng: -7.7500, info: "Naturaleza brutal, miradores y viñedos heroicos." },
  { id: 28, nombre: "Ribeira Sacra", bloque: "ourense", horas: 6, imagen: "img/ribeira.jpg", lat: 42.4500, lng: -7.5500, info: "Monasterios mágicos ocultos en el bosque." },
  { id: 29, nombre: "Vigo", bloque: "pontevedra", horas: 4, imagen: "img/vigo.jpg", lat: 42.2406, lng: -8.7207, info: "Motor industrial, marisco y ambiente nocturno." },
  { id: 30, nombre: "Pontevedra", bloque: "pontevedra", horas: 3, imagen: "img/pontevedra.jpg", lat: 42.4333, lng: -8.6333, info: "Ciudad peatonal y plazas con mucho encanto." },
  { id: 31, nombre: "Tui", bloque: "pontevedra", horas: 3, imagen: "img/tui.jpg", lat: 42.0500, lng: -8.6333, info: "Catedral-fortaleza en la frontera con Portugal." },
  { id: 32, nombre: "Cambados", bloque: "pontevedra", horas: 3, imagen: "img/cambados.jpg", lat: 42.5167, lng: -8.8167, info: "La capital mundial del vino Albariño." },
  { id: 33, nombre: "Baiona", bloque: "pontevedra", horas: 3, imagen: "img/baiona.jpg", lat: 42.1167, lng: -8.8500, info: "Fortaleza junto al mar, primer anuncio de América." },
  { id: 34, nombre: "Combarro", bloque: "pontevedra", horas: 2, imagen: "img/combarro.jpg", lat: 42.3833, lng: -8.7167, info: "Hórreos de piedra bañados por el mar." },
  { id: 35, nombre: "O Grove", bloque: "pontevedra", horas: 4, imagen: "img/ogrove.jpg", lat: 42.3881, lng: -8.8833, info: "El gran paraíso del marisco gallego." },
  { id: 36, nombre: "A Illa de Arousa", bloque: "pontevedra", horas: 3, imagen: "img/arousa.jpg", lat: 42.5573, lng: -8.8618, info: "Parque natural, playas vírgenes y faro." },
  { id: 37, nombre: "A Guarda", bloque: "pontevedra", horas: 3, imagen: "img/aguarda.jpg", lat: 41.9000, lng: -8.8667, info: "Poblado celta en el Monte Santa Trega." },
  { id: 38, nombre: "Cíes y Ons", bloque: "pontevedra", horas: 6, imagen: "img/ciesyons.jpg", lat: 42.2244, lng: -8.9031, info: "Islas paradisíacas Parque Nacional." }
];

// ====== FUNCIÓN DE ARRANQUE ======
function initApp() { 
  renderPlaces();
  initMap(); 
  updateSelectionUI();
  initBottomMenu();
}

// ====== RENDERIZAR LAS TARJETAS DE LUGARES ======
function renderPlaces() {
  var container = document.getElementById('placesContainer');
  if (!container) return;
  var html = '', globalIndex = 0;
  
  bloques.forEach(function(bloque) {
    var arr = lugares.filter(function(l) { return l.bloque === bloque.id; });
    if (!arr.length) return;

    // BLOQUE PROVINCIA
    html += '<div class="bloque-card" id="bloque-' + bloque.id + '">';
    html += '<div class="bloque-header" onclick="toggleBloque(\'bloque-' + bloque.id + '\')">';
    html += '<span class="bloque-emoji">' + bloque.emoji + '</span>';
    html += '<span class="bloque-nombre">' + bloque.nombre + '</span>';
    html += '<div class="bloque-arrow"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>';
    html += '</div>';
    
    // CONTENIDO PROVINCIA (TARJETAS DE LUGARES)
    html += '<div class="bloque-content">';
    arr.forEach(function(l) {
      globalIndex++;
      html += '<article class="place-card" id="place-' + l.id + '">';
      html += '<div class="place-image">';
      html += '<img src="' + l.imagen + '" onerror="this.src=\'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop\'">';
      html += '<span class="place-number-badge">' + globalIndex + '</span>';
      html += '<div class="place-title-overlay">' + l.nombre + '</div>';
      html += '</div>';
      html += '<div class="place-header" onclick="togglePlace(\'place-' + l.id + '\')">';
      html += '<span style="font-size:0.9rem; color:var(--fg-muted)">' + l.horas + 'h estimadas</span>';
      html += '<div class="place-header-right">';
      html += '<svg class="place-toggle-icon" viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
      html += '</div></div>';
      html += '<div class="place-content">';
      html += '<p style="color:var(--fg-muted); margin-bottom:12px;">' + l.info + '</p>';
      html += '<button class="btn-primary" onclick="togglePlaceSelection(' + l.id + ')" style="padding:10px; font-size:0.9rem;">Añadir/Quitar de la ruta</button>';
      html += '</div></article>';
    });
    html += '</div></div>';
  });
  container.innerHTML = html;
}

window.toggleBloque = function(id) { 
  var b = document.getElementById(id); 
  if(b) b.classList.toggle('expanded'); 
}
window.togglePlace = function(id) { 
  var p = document.getElementById(id); 
  if(p) p.classList.toggle('expanded'); 
}

// ====== MAPA NORMAL (ESTABLE) ======
function initMap() {
  if (mainMap) return; // Evita inicializar dos veces
  mainMap = L.map('map', { center: [42.6, -8.4], zoom: 7, zoomControl: false, dragging: false, scrollWheelZoom: false }); 
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mainMap);
  
  lugares.forEach(function(l, i) {
    var m = L.marker([l.lat, l.lng], {
      icon: L.divIcon({ className: 'custom-marker', html: (i+1), iconSize: [32, 32] })
    }).addTo(mainMap);
    
    m.on('click', function() { togglePlaceSelection(l.id); });
    markers[l.id] = m;
  });

  // Forzamos al mapa a medir su contenedor ahora que es visible
  setTimeout(function() { mainMap.invalidateSize(); }, 500);
}

// ====== MAPA FULLSCREEN ======
window.openFullscreenMap = function() {
  var container = document.getElementById('mapFullscreen');
  container.classList.add('active');
  
  setTimeout(function() {
    if (!fsMap) {
      fsMap = L.map('mapFullscreenMap', { center: [42.6, -8.4], zoom: 8 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(fsMap);
      
      lugares.forEach(function(l, i) {
        var m = L.marker([l.lat, l.lng], {
          icon: L.divIcon({ className: 'custom-marker touchable', html: (i+1), iconSize: [44, 44] })
        }).addTo(fsMap);
        
        m.on('click', function() { togglePlaceSelection(l.id); });
        fullscreenMarkers[l.id] = m;
      });
    }
    fsMap.invalidateSize(); // El truco mágico para que Leaflet no se rompa
    updateFullscreenUI();
  }, 400); // Dar tiempo a la transición CSS
}

window.closeFullscreenMap = function() { document.getElementById('mapFullscreen').classList.remove('active'); }

// ====== SELECCIÓN Y RUTAS ======
window.togglePlaceSelection = function(id) {
  var idx = selectedPlaces.indexOf(id);
  if (idx > -1) selectedPlaces.splice(idx, 1);
  else selectedPlaces.push(id);
  
  updateSelectionUI();
  updateFullscreenUI();
  
  // Actualizar marcadores en AMBOS mapas
  [markers[id], fullscreenMarkers[id]].forEach(function(m) {
    if(m && m.getElement()) {
      if(idx > -1) m.getElement().classList.remove('selected-ring');
      else m.getElement().classList.add('selected-ring');
    }
  });
}

function updateSelectionUI() {
  var totalH = 0;
  var html = '';
  
  if (selectedPlaces.length === 0) {
    html = '<div style="text-align:center; padding:20px; color:var(--fg-muted);">Tu ruta está vacía. Selecciona lugares arriba.</div>';
  } else {
    selectedPlaces.forEach(function(id) {
      var l = lugares.find(function(x) { return x.id === id; });
      totalH += l.horas;
      html += '<div class="selection-item"><img src="' + l.imagen + '" onerror="this.src=\'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop\'"><div class="selection-item-info"><div class="selection-item-name">' + l.nombre + '</div></div><button class="selection-item-remove" onclick="togglePlaceSelection(' + l.id + ')">×</button></div>';
    });
    html += '<button class="btn-primary" onclick="generateGoogleMapsUrl()" style="margin-top:16px;">Ir a Google Maps (' + selectedPlaces.length + ' paradas)</button>';
    html += '<button class="btn-secondary" onclick="clearSelection()">Limpiar ruta</button>';
  }
  
  var c = document.getElementById('selectionContent');
  if(c) c.innerHTML = html;
  
  var s = document.getElementById('selectionStats');
  if(s) s.textContent = selectedPlaces.length + ' lugares · ' + totalH + 'h';
}

function updateFullscreenUI() {
  var s = document.getElementById('mapSelectionCount');
  if(s) s.textContent = selectedPlaces.length + ' seleccionados';
}

window.clearSelection = function() {
  selectedPlaces = [];
  updateSelectionUI();
  updateFullscreenUI();
  Object.values(markers).forEach(function(m) { if(m.getElement()) m.getElement().classList.remove('selected-ring'); });
  Object.values(fullscreenMarkers).forEach(function(m) { if(m.getElement()) m.getElement().classList.remove('selected-ring'); });
}

window.generateGoogleMapsUrl = function() {
  if (selectedPlaces.length === 0) return;
  var base = "https://www.google.com/maps/dir/";
  var coords = [];
  
  if (userLocation) coords.push(userLocation.lat + "," + userLocation.lng);
  selectedPlaces.forEach(function(id) {
    var l = lugares.find(function(x) { return x.id === id; });
    if(l) coords.push(l.lat + "," + l.lng);
  });
  
  window.open(base + coords.join("/"), '_blank');
}

// ====== MENÚ Y GEOLOCALIZACIÓN ======
function initBottomMenu() {
  var items = document.querySelectorAll('.menu-item');
  items.forEach(function(i) {
    i.addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById(i.getAttribute('href').substring(1)).scrollIntoView({ behavior: 'smooth' });
    });
  });
}

window.toggleGeolocation = function() {
  var btn = document.getElementById('geoBtn');
  var status = document.getElementById('geoStatus');
  if (userLocation) {
    userLocation = null;
    btn.textContent = 'Activar';
    btn.style.background = 'var(--accent-sea)';
    status.textContent = 'Ubicación desactivada';
  } else {
    btn.textContent = 'Buscando...';
    navigator.geolocation.getCurrentPosition(function(p) {
      userLocation = { lat: p.coords.latitude, lng: p.coords.longitude };
      btn.textContent = 'Desactivar';
      btn.style.background = 'var(--accent-red)';
      status.textContent = 'Ubicación activada para la ruta';
    });
  }
}
