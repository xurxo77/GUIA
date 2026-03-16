// ANTÍDOTO PARA ELIMINAR CACHÉ ANTIGUA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (var registration of registrations) { registration.unregister(); }
  });
}

// ===== CONTRASEÑA =====
document.getElementById('splashForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var input = document.getElementById('passwordInput');
  var error = document.getElementById('splashError');
  var value = input.value.trim().toLowerCase();
  
  if (value === 'caamaño' || value === 'caamanho') {
    document.getElementById('splashScreen').classList.add('hidden');
    document.getElementById('mainContent').classList.add('visible');
    localStorage.setItem('galicia_auth', 'true');
    setTimeout(initApp, 300);
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
    setTimeout(initApp, 100);
  }
});

// ===== VARIABLES GLOBALES ARREGLADAS =====
var mainMap = null, fsMap = null;
var markers = {}, fullscreenMarkers = {};
var userLocation = null, userMarker = null;
var selectedPlaces = [];
var favorites = [];

var bloques = [
  { id: "acoruna", nombre: "A Coruña", nombreCorto: "A Coruña", subtitulo: "Costa da Morte, Ártabro, Santiago...", emoji: "🌊" },
  { id: "lugo", nombre: "Lugo", nombreCorto: "Lugo", subtitulo: "Rías Altas, Os Ancares...", emoji: "🌲" },
  { id: "ourense", nombre: "Ourense", nombreCorto: "Ourense", subtitulo: "Ribeira Sacra, Cañón del Sil...", emoji: "🏔️" },
  { id: "pontevedra", nombre: "Pontevedra", nombreCorto: "Pontevedra", subtitulo: "Rías Baixas, Cíes, Ons...", emoji: "🌅" }
];

var categorias = [
  { id: "ciudades", nombre: "Ciudades", nombreCorto: "Ciudad", emoji: "🏛️" },
  { id: "villas", nombre: "Villas", nombreCorto: "Villa", emoji: "🏘️" },
  { id: "pueblos", nombre: "Pueblos", nombreCorto: "Pueblo", emoji: "⚓" },
  { id: "costa", nombre: "Costa", nombreCorto: "Costa", emoji: "🏖️" },
  { id: "naturaleza", nombre: "Naturaleza", nombreCorto: "Naturaleza", emoji: "🌿" },
  { id: "patrimonio", nombre: "Patrimonio", nombreCorto: "Patrimonio", emoji: "🏰" },
  { id: "magicos", nombre: "Mágicos", nombreCorto: "Mágico", emoji: "✨" },
  { id: "termalismo", nombre: "Termalismo", nombreCorto: "Termalismo", emoji: "♨️" }
];

function getCategoryName(catId) { var cat = categorias.find(function(c) { return c.id === catId; }); return cat ? cat.nombreCorto : ''; }
function getCategoryEmoji(catId) { var cat = categorias.find(function(c) { return c.id === catId; }); return cat ? cat.emoji : ''; }

// ===== LUGARES CON TODA LA INFORMACIÓN INTACTA =====
var lugares = [
  { id: 1, nombre: "Santiago de Compostela", bloque: "acoruna", categorias: ["ciudades", "patrimonio"], horas: 5, imagen: "img/santiago.jpg", lat: 42.8800, lng: -8.5450, porQueVenir: "Fin del Camino. Ciudad santa, monumental y viva.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Catedral", "Plaza del Obradoiro", "Mercado de Abastos"], comer: "Pulpo en el Mercado.", tomar: "Café en Plaza de Cervantes.", secreto: "Jardines de la Universidad.", masTiempo: "Monte do Gozo.", advertencias: "Muchos turistas." },
  { id: 2, nombre: "A Coruña", bloque: "acoruna", categorias: ["ciudades", "costa"], horas: 4, imagen: "img/acoruna.jpg", lat: 43.3700, lng: -8.4000, porQueVenir: "Ciudad de cristal, faro romano, paseo marítimo.", momentoPerfecto: "Atardecer.", imprescindibles: ["Torre de Hércules", "Paseo marítimo", "Playa de Riazor"], comer: "Pulpería Ezequiela.", tomar: "Estrella Galicia.", secreto: "Inscripciones romanas.", masTiempo: "Aquarium.", advertencias: "Siempre hace aire." },
  { id: 3, nombre: "Betanzos", bloque: "acoruna", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/betanzos.jpg", lat: 43.2833, lng: -8.2167, porQueVenir: "Villa medieval con casco histórico.", momentoPerfecto: "Mañana.", imprescindibles: ["Plaza Mayor", "Iglesia de Santa María", "Murallas"], comer: "Tortilla de Betanzos.", tomar: "Vino de la tierra.", secreto: "Jardines del Pasatiempo.", masTiempo: "Paseo por el río.", advertencias: "Fuertes pendientes." },
  { id: 4, nombre: "Cedeira", bloque: "acoruna", categorias: ["costa", "naturaleza"], horas: 2, imagen: "img/cedeira.jpg", lat: 43.6667, lng: -8.0500, porQueVenir: "Playa de Magdalena y puerto pesquero.", momentoPerfecto: "Verano.", imprescindibles: ["Playa de Magdalena", "Puerto", "Monte da Sartá"], comer: "Marisco.", tomar: "Vino blanco.", secreto: "Senda costera.", masTiempo: "Paseo al faro.", advertencias: "Mar peligroso." },
  { id: 5, nombre: "Ortigueira", bloque: "acoruna", categorias: ["costa", "naturaleza"], horas: 3, imagen: "img/ortigueira.jpg", lat: 43.6333, lng: -7.8500, porQueVenir: "Playa de Ortigueira, una de las mejores.", momentoPerfecto: "Marea baja.", imprescindibles: ["Playa de Ortigueira", "Cabo Ortegal", "Puerto"], comer: "Marisco.", tomar: "Sidra.", secreto: "Estaca de Bares.", masTiempo: "Cabo Ortegal.", advertencias: "Marea alta cubre la playa." },
  { id: 6, nombre: "Estaca de Bares", bloque: "acoruna", categorias: ["magicos", "costa"], horas: 2, imagen: "img/estacadebares.jpg", lat: 43.7833, lng: -7.6833, porQueVenir: "Punto más al norte de España.", momentoPerfecto: "Atardecer.", imprescindibles: ["Faro", "Mirador", "Paseo hasta el faro"], comer: "En Ortigueira.", tomar: "Lo que lleves.", secreto: "Amanecer.", masTiempo: "Ortigueira.", advertencias: "Viento muy fuerte." },
  { id: 7, nombre: "Costa da Morte", bloque: "acoruna", categorias: ["magicos", "naturaleza", "costa"], horas: 6, imagen: "img/costadamorte.jpg", lat: 43.0000, lng: -9.0000, porQueVenir: "Tramo de costa con naufragios y faros.", momentoPerfecto: "Otoño o invierno.", imprescindibles: ["Faro de Fisterra", "Muxía", "Camariñas"], comer: "Pulpo.", tomar: "Albariño.", secreto: "Playa de Traba.", masTiempo: "Ruta completa.", advertencias: "Mar siempre peligroso." },
  { id: 8, nombre: "Fragas do Eume", bloque: "acoruna", categorias: ["naturaleza"], horas: 4, imagen: "img/eume.jpg", lat: 43.4167, lng: -8.0667, porQueVenir: "Bosque atlántico mejor conservado.", momentoPerfecto: "Primavera.", imprescindibles: ["Monasterio de Caaveiro", "Ruta del río", "Miradores"], comer: "Picnic.", tomar: "Agua.", secreto: "Ruta nocturna guiada.", masTiempo: "Monfero.", advertencias: "Cierres por lluvia." },
  { id: 9, nombre: "Monte Pindo", bloque: "acoruna", categorias: ["naturaleza", "magicos"], horas: 3, imagen: "img/pindo.jpg", lat: 42.9000, lng: -9.1000, porQueVenir: "Monte sagrado, granito rosa.", momentoPerfecto: "Día despejado.", imprescindibles: ["Cumbre", "Leyendas", "Vistas"], comer: "En Fisterra.", tomar: "Agua.", secreto: "Petroglifos.", masTiempo: "Fisterra.", advertencias: "Roca resbaladiza." },
  { id: 10, nombre: "Cascada del Ézaro", bloque: "acoruna", categorias: ["naturaleza", "costa"], horas: 1, imagen: "img/ezaro.jpg", lat: 42.8667, lng: -9.1167, porQueVenir: "Única cascada que cae al mar.", momentoPerfecto: "Tras lluvias.", imprescindibles: ["Mirador", "Playa", "Faro"], comer: "En Fisterra.", tomar: "Agua.", secreto: "Noche con luna.", masTiempo: "Fisterra.", advertencias: "Menos agua en verano." },
  { id: 11, nombre: "Padrón", bloque: "acoruna", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/padron.jpg", lat: 42.7333, lng: -8.6500, porQueVenir: "Cuna del peregrino.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Iria Flavia", "Fonte do Carme", "Pedrón"], comer: "Pimientos de Padrón.", tomar: "Vino.", secreto: "Casa de Rosalía.", masTiempo: "Paseo del río.", advertencias: "Pican algunos." },
  { id: 12, nombre: "San Andrés de Teixido", bloque: "acoruna", categorias: ["magicos"], horas: 3, imagen: "img/teixido.jpg", lat: 43.6333, lng: -8.2500, porQueVenir: "Santuario donde van los que no van en vida.", momentoPerfecto: "Peregrinación.", imprescindibles: ["Santuario", "Ruta", "Vistas"], comer: "Lo que lleves.", tomar: "Agua.", secreto: "Amanecer.", masTiempo: "Cedeira.", advertencias: "Carretera estrecha." },
  { id: 13, nombre: "Muros", bloque: "acoruna", categorias: ["pueblos"], horas: 2, imagen: "img/muros.jpg", lat: 42.7667, lng: -9.0500, porQueVenir: "Puerto pesquero con quintas indias.", momentoPerfecto: "Mañana.", imprescindibles: ["Puerto", "Quintas", "Playa"], comer: "Pescado fresco.", tomar: "Vino.", secreto: "Ruta de las Quintas.", masTiempo: "Noia.", advertencias: "Aparcar difícil." },
  { id: 14, nombre: "Noia", bloque: "acoruna", categorias: ["pueblos"], horas: 2, imagen: "img/noia.jpg", lat: 42.7833, lng: -8.8833, porQueVenir: "Puerto fluvial con casco histórico.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Puerto", "Casco histórico", "Ría"], comer: "Marisco.", tomar: "Vino.", secreto: "Sendero.", masTiempo: "Muros.", advertencias: "Nada especial." },
  { id: 15, nombre: "Ferrol", bloque: "acoruna", categorias: ["ciudades", "patrimonio"], horas: 3, imagen: "img/ferrol.jpg", lat: 43.4833, lng: -8.2333, porQueVenir: "Ciudad naval ilustrada.", momentoPerfecto: "Mañana.", imprescindibles: ["Arsenales", "Castillo de San Felipe", "Barrio de la Magdalena"], comer: "Marisco.", tomar: "Estrella Galicia.", secreto: "Cabo Prior.", masTiempo: "Cedeira.", advertencias: "Lluvia frecuente." },
  { id: 16, nombre: "Lugo", bloque: "lugo", categorias: ["ciudades", "patrimonio"], horas: 3, imagen: "img/lugo.jpg", lat: 43.0100, lng: -7.5600, porQueVenir: "Muralla romana mejor conservada.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Muralla", "Catedral", "Casco histórico"], comer: "Pulpo.", tomar: "Cerveza.", secreto: "Paseo nocturno.", masTiempo: "Termas romanas.", advertencias: "Ciudad tranquila." },
  { id: 17, nombre: "Viveiro", bloque: "lugo", categorias: ["villas", "costa"], horas: 3, imagen: "img/viveiro.jpg", lat: 43.6500, lng: -7.6000, porQueVenir: "Villa marinera medieval.", momentoPerfecto: "Verano.", imprescindibles: ["Puerto", "Casco histórico", "Playa de Covas"], comer: "Marisco.", tomar: "Sidra.", secreto: "Fiestas del Carmen.", masTiempo: "Playa de Covas.", advertencias: "Lleno en verano." },
  { id: 18, nombre: "Mondoñedo", bloque: "lugo", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/mondonedo.jpg", lat: 43.4667, lng: -7.4500, porQueVenir: "Antigua capital del reino de Galicia.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Catedral", "Casco histórico", "Miradores"], comer: "Empanada.", tomar: "Vino.", secreto: "Festival de la Cocina.", masTiempo: "Senda ecológica.", advertencias: "Lluvia frecuente." },
  { id: 19, nombre: "Ribadeo", bloque: "lugo", categorias: ["costa"], horas: 4, imagen: "img/ribadeo.jpg", lat: 43.5333, lng: -7.0333, porQueVenir: "Villa marinera y playa de las Catedrales.", momentoPerfecto: "Marea baja.", imprescindibles: ["Playa de las Catedrales", "Torre de los Moreno", "Paseo marítimo"], comer: "Marisco.", tomar: "Sidra.", secreto: "Faro de la Isla Pancha.", masTiempo: "Mondoñedo.", advertencias: "Reserva en Catedrales." },
  { id: 20, nombre: "Serra dos Ancares", bloque: "lugo", categorias: ["naturaleza"], horas: 5, imagen: "img/ancares.jpg", lat: 42.7833, lng: -7.2000, porQueVenir: "Montaña, pallozas, sosiego.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Pallozas", "Rutas", "Vistas"], comer: "Cocina tradicional.", tomar: "Agua.", secreto: "Cascada secreta.", masTiempo: "Ruta completa.", advertencias: "Carreteras de montaña." },
  { id: 21, nombre: "Chantada", bloque: "lugo", categorias: ["patrimonio"], horas: 2, imagen: "img/chantada.jpg", lat: 42.6167, lng: -7.7667, porQueVenir: "Villa con tradición vinícola.", momentoPerfecto: "Otoño.", imprescindibles: ["Casco histórico", "Bodegas", "Paisajes"], comer: "Vino y queso.", tomar: "Mencía.", secreto: "Rutas del vino.", masTiempo: "Carballeira.", advertencias: "Calor en verano." },
  { id: 22, nombre: "Ourense", bloque: "ourense", categorias: ["ciudades", "termalismo"], horas: 3, imagen: "img/ourense.jpg", lat: 42.3350, lng: -7.8640, porQueVenir: "Termas romanas, casco histórico.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Puente romano", "Termas", "Casco viejo"], comer: "Pulpo.", tomar: "Mencía.", secreto: "Termas libres.", masTiempo: "Ribeira Sacra.", advertencias: "Calor en verano." },
  { id: 23, nombre: "Allariz", bloque: "ourense", categorias: ["villas", "termalismo"], horas: 2, imagen: "img/allariz.jpg", lat: 42.1833, lng: -7.8000, porQueVenir: "Villa medieval peatonal.", momentoPerfecto: "Tarde.", imprescindibles: ["Casco histórico", "Río Arnoia", "Artesanía"], comer: "Cocina gallega.", tomar: "Vino.", secreto: "Ruta del Arnoia.", masTiempo: "Playa fluvial.", advertencias: "Nada." },
  { id: 24, nombre: "Ribadavia", bloque: "ourense", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/ribadavia.jpg", lat: 42.2833, lng: -8.1500, porQueVenir: "Capital del vino y judería.", momentoPerfecto: "Fiesta del vino.", imprescindibles: ["Judería", "Casco histórico", "Bodegas"], comer: "Vino y tapas.", tomar: "Mencía.", secreto: "Fiesta del vino.", masTiempo: "Riberas del Miño.", advertencias: "Fiestas en agosto." },
  { id: 25, nombre: "Monforte de Lemos", bloque: "ourense", categorias: ["patrimonio"], horas: 3, imagen: "img/monforte.jpg", lat: 42.5167, lng: -7.5167, porQueVenir: "Colegiata y torre del homenaje.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Colexiata", "Torre da Homenaxe", "Huerta"], comer: "Pulpo.", tomar: "Mencía.", secreto: "Vistas desde la torre.", masTiempo: "Ribeira Sacra.", advertencias: "Cuesta arriba." },
  { id: 26, nombre: "Castro Caldelas", bloque: "ourense", categorias: ["patrimonio"], horas: 2, imagen: "img/castro.jpg", lat: 42.3581, lng: -7.4649, porQueVenir: "Castillo medieval y vistas.", momentoPerfecto: "Mañana.", imprescindibles: ["Castillo", "Pueblo", "Miradores"], comer: "Cocina tradicional.", tomar: "Mencía.", secreto: "Atardecer.", masTiempo: "Cañón del Sil.", advertencias: "Carretera curvas." },
  { id: 27, nombre: "Cañón del Sil", bloque: "ourense", categorias: ["naturaleza"], horas: 5, imagen: "img/sil.jpg", lat: 42.4167, lng: -7.7500, porQueVenir: "Cañones más espectaculares.", momentoPerfecto: "Primavera y otoño.", imprescindibles: ["Catamarán", "Miradores", "Monasterios"], comer: "Adegas.", tomar: "Mencía.", secreto: "Sendero de los Monjes.", masTiempo: "Castro Caldelas.", advertencias: "Carreteras estrechas." },
  { id: 28, nombre: "Ribeira Sacra", bloque: "ourense", categorias: ["magicos", "naturaleza", "patrimonio"], horas: 6, imagen: "img/ribeira.jpg", lat: 42.4500, lng: -7.5500, porQueVenir: "Tierra de monjes y milagros.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Monasterios", "Cañones", "Catamarán"], comer: "Mencía.", tomar: "Godello.", secreto: "Monasterio de San Pedro de Rocas.", masTiempo: "Varios días.", advertencias: "Carreteras de montaña." },
  { id: 29, nombre: "Vigo", bloque: "pontevedra", categorias: ["ciudades", "costa"], horas: 4, imagen: "img/vigo.jpg", lat: 42.2406, lng: -8.7207, porQueVenir: "Puerto, marisco y puerta de las Cíes.", momentoPerfecto: "Tarde-noche.", imprescindibles: ["Tabernas del Berbés", "Playa de Samil", "Monte del Castro"], comer: "Pulpo, navajas, ostras.", tomar: "Blanco de la casa.", secreto: "Taberna de Cervantes.", masTiempo: "Monte del Castro.", advertencias: "Llenísimo fines de semana." },
  { id: 30, nombre: "Pontevedra", bloque: "pontevedra", categorias: ["ciudades"], horas: 3, imagen: "img/pontevedra.jpg", lat: 42.4333, lng: -8.6333, porQueVenir: "Ciudad amable con el peatón.", momentoPerfecto: "Tarde para cenar.", imprescindibles: ["Plaza da Ferrería", "Peregrina", "Callejear sin mapa"], comer: "Tabernas en calles estrechas.", tomar: "Vino de la casa.", secreto: "Convento de San Francisco.", masTiempo: "Paseo a la ría.", advertencias: "Muy segura." },
  { id: 31, nombre: "Tui", bloque: "pontevedra", categorias: ["villas", "patrimonio"], horas: 3, imagen: "img/tui.jpg", lat: 42.0500, lng: -8.6333, porQueVenir: "Ciudad episcopal, frontera con Portugal.", momentoPerfecto: "Tarde.", imprescindibles: ["Catedral", "Casco histórico", "Mirador del Miño"], comer: "Marisco.", tomar: "Albariño.", secreto: "Paseo hasta Portugal.", masTiempo: "Valença.", advertencias: "Lluvia frecuente." },
  { id: 32, nombre: "Cambados", bloque: "pontevedra", categorias: ["villas"], horas: 3, imagen: "img/cambados.jpg", lat: 42.5167, lng: -8.8167, porQueVenir: "Capital del Albariño.", momentoPerfecto: "Fiesta del Albariño.", imprescindibles: ["Pazo de Fefiñáns", "Casco histórico", "Bodegas"], comer: "Marisco.", tomar: "Albariño.", secreto: "Playa de la Lajinha.", masTiempo: "Playa fluvial.", advertencias: "Agosto lleno." },
  { id: 33, nombre: "Baiona", bloque: "pontevedra", categorias: ["pueblos", "costa"], horas: 3, imagen: "img/baiona.jpg", lat: 42.1167, lng: -8.8500, porQueVenir: "Primer puerto en recibir la noticia del Nuevo Mundo.", momentoPerfecto: "Verano.", imprescindibles: ["Fortaleza", "Puerto", "Playa"], comer: "Marisco.", tomar: "Albariño.", secreto: "Arribada.", masTiempo: "Islas Cíes.", advertencias: "Lleno en verano." },
  { id: 34, nombre: "Combarro", bloque: "pontevedra", categorias: ["pueblos"], horas: 2, imagen: "img/combarro.jpg", lat: 42.3833, lng: -8.7167, porQueVenir: "Hórreos sobre el mar.", momentoPerfecto: "Atardecer.", imprescindibles: ["Hórreos", "Paseo marítimo", "Puerto"], comer: "Marisco.", tomar: "Albariño.", secreto: "Noche.", masTiempo: "Poio.", advertencias: "Muy turístico." },
  { id: 35, nombre: "O Grove", bloque: "pontevedra", categorias: ["costa"], horas: 4, imagen: "img/ogrove.jpg", lat: 42.3881, lng: -8.8833, porQueVenir: "Paraíso del marisco.", momentoPerfecto: "Verano.", imprescindibles: ["Playa de la Lanzada", "Marisquerías", "Paseo"], comer: "Marisco.", tomar: "Albariño.", secreto: "La Toxa.", masTiempo: "Isla de Ons.", advertencias: "Muy concurrido." },
  { id: 36, nombre: "A Illa de Arousa", bloque: "pontevedra", categorias: ["costa"], horas: 3, imagen: "img/arousa.jpg", lat: 42.5573, lng: -8.8618, porQueVenir: "Isla con playas salvajes.", momentoPerfecto: "Verano.", imprescindibles: ["Faro", "Playas", "Paseo"], comer: "Marisco.", tomar: "Albariño.", secreto: "Carretera del faro.", masTiempo: "O Grove.", advertencias: "Puente de dos sentidos." },
  { id: 37, nombre: "A Guarda", bloque: "pontevedra", categorias: ["magicos", "patrimonio"], horas: 3, imagen: "img/aguarda.jpg", lat: 41.9000, lng: -8.8667, porQueVenir: "Citania de Santa Trega.", momentoPerfecto: "Atardecer.", imprescindibles: ["Citania", "Faro", "Monte Trega"], comer: "Marisco.", tomar: "Albariño.", secreto: "Portugal.", masTiempo: "Tui.", advertencias: "Viento." },
  { id: 38, nombre: "Cíes y Ons", bloque: "pontevedra", categorias: ["naturaleza", "costa"], horas: 6, imagen: "img/ciesyons.jpg", lat: 42.2244, lng: -8.9031, porQueVenir: "Dos archipiélagos protegidos.", momentoPerfecto: "Junio o septiembre.", imprescindibles: ["Playa de Rodas", "Monte Faro", "Playa de Melide"], comer: "Lleva comida.", tomar: "Agua.", secreto: "Playa de Figueiras.", masTiempo: "Camping en Cíes.", advertencias: "Reserva obligatoria." }
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
  try { 
    var saved = localStorage.getItem('galicia_favorites'); 
    if (saved) favorites = JSON.parse(saved); 
  } catch(e) { favorites = []; } 
}

function saveFavorites() { localStorage.setItem('galicia_favorites', JSON.stringify(favorites)); }

function toggleFavorite(id) { 
  var idx = favorites.indexOf(id); 
  if (idx > -1) favorites.splice(idx, 1); 
  else favorites.push(id); 
  saveFavorites(); 
  updateFavoriteButton(id); 
  renderFavoritesSection(); 
}

function isFavorite(id) { return favorites.indexOf(id) > -1; }

function updateFavoriteButton(id) { 
  var btn = document.querySelector('.fav-btn[data-id="' + id + '"]'); 
  if (btn) btn.classList.toggle('active', isFavorite(id)); 
}

function renderFavoritesSection() {
  var container = document.getElementById('favoritesSection') || document.querySelector('.favorites-section');
  if (!container) return;
  if (favorites.length === 0) { 
    container.innerHTML = '<div class="favorites-empty">Sin favoritos. Toca el corazón en cualquier lugar.</div>'; 
    return; 
  }
  var html = '<div class="favorites-header"><div class="favorites-title"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Mis favoritos</div><span class="favorites-count">' + favorites.length + '</span></div><div class="favorites-list">';
  favorites.forEach(function(id) {
    var l = lugares.find(function(x) { return x.id === id; });
    if (!l) return;
    html += '<div class="favorite-item"><img src="' + l.imagen + '" onerror="this.src=\'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop\'"><div class="favorite-info"><div class="favorite-name">' + l.nombre + '</div><div class="favorite-time">' + l.horas + 'h</div></div><button class="favorite-remove" onclick="removeFavorite(' + l.id + ')"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function removeFavorite(id) { 
  var idx = favorites.indexOf(id); 
  if (idx > -1) { 
    favorites.splice(idx, 1); 
    saveFavorites(); 
    updateFavoriteButton(id); 
    renderFavoritesSection(); 
  } 
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
    if (userMarker) { mainMap.removeLayer(userMarker); userMarker = null; } 
    localStorage.removeItem('galicia_lat'); 
    localStorage.removeItem('galicia_lng'); 
    updateGeoUI(false); 
  } else { requestLocation(); } 
}

function requestLocation() {
  var btn = document.getElementById('geoBtn'), status = document.getElementById('geoStatus');
  btn.disabled = true; btn.textContent = 'Buscando...'; status.textContent = 'Localizando...';
  if (!navigator.geolocation) { status.textContent = 'No soportado'; btn.disabled = false; btn.textContent = 'Activar'; return; }
  navigator.geolocation.getCurrentPosition(
    function(p) { 
      userLocation = { lat: p.coords.latitude, lng: p.coords.longitude }; 
      localStorage.setItem('galicia_lat', userLocation.lat); localStorage.setItem('galicia_lng', userLocation.lng); 
      showUserOnMap(userLocation); updateGeoUI(true); 
      if(mainMap) mainMap.setView([userLocation.lat, userLocation.lng], 10); 
    },
    function(err) { status.textContent = err.code === 1 ? 'Permiso denegado' : 'Error'; btn.disabled = false; btn.textContent = 'Reintentar'; },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function showUserOnMap(loc) { 
  if (!mainMap) return; 
  if (userMarker) mainMap.removeLayer(userMarker); 
  userMarker = L.marker([loc.lat, loc.lng], { icon: L.divIcon({ className: 'user-location-marker', iconSize: [14, 14], iconAnchor: [7, 7] }) }).addTo(mainMap); 
}

function updateGeoUI(active) { 
  var btn = document.getElementById('geoBtn'), status = document.getElementById('geoStatus'); 
  if (active) { btn.textContent = 'Desactivar'; btn.disabled = false; btn.style.background = 'var(--accent-red)'; status.textContent = 'Ubicación activada'; status.classList.add('active'); } 
  else { btn.textContent = 'Activar'; btn.disabled = false; btn.style.background = ''; status.textContent = 'Actívala para calcular distancias'; status.classList.remove('active'); } 
}

// ===== SELECCIÓN DE RUTA =====
window.togglePlaceSelection = function(id) {
  var idx = selectedPlaces.indexOf(id);
  if (idx > -1) selectedPlaces.splice(idx, 1);
  else selectedPlaces.push(id);
  updateSelectionUI();
  updateMarkerSelection(id);
}

function updateSelectionUI() {
  var totalHours = selectedPlaces.reduce(function(sum, id) {
    var l = lugares.find(function(x) { return x.id === id; });
    return sum + (l ? l.horas : 0);
  }, 0);
  
  var statsEl = document.getElementById('selectionStats');
  if (statsEl) statsEl.textContent = selectedPlaces.length + ' lugares · ' + totalHours + 'h';
  
  var content = document.getElementById('selectionContent');
  if (!content) return;
  
  if (selectedPlaces.length === 0) {
    content.innerHTML = '<div class="selection-empty">Toca puntos en el mapa para añadirlos</div>';
  } else {
    var html = '<div class="selection-list">';
    selectedPlaces.forEach(function(id) {
      var l = lugares.find(function(x) { return x.id === id; });
      if (!l) return;
      html += '<div class="selection-item">';
      html += '<img src="' + l.imagen + '" onerror="this.src=\'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop\'">';
      html += '<div class="selection-item-info">';
      html += '<div class="selection-item-name">' + l.nombre + '</div>';
      html += '<div class="selection-item-time">' + l.horas + 'h</div>';
      html += '</div>';
      html += '<button class="selection-item-remove" onclick="togglePlaceSelection(' + l.id + ')"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="action-buttons">';
    html += '<button class="btn-primary" onclick="generateItinerary()"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> Crear ruta en Google Maps</button>';
    html += '<button class="btn-secondary" onclick="clearSelection()"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Limpiar ruta</button>';
    html += '</div>';
    content.innerHTML = html;
  }
}

window.clearSelection = function() { selectedPlaces = []; updateSelectionUI(); updateAllMarkers(); updateFullscreenUI(); }

function updateMarkerSelection(id) {
  var isSelected = selectedPlaces.indexOf(id) > -1;
  var m = markers[id];
  if (m && m.getElement()) {
    if (isSelected) m.getElement().classList.add('selected-ring');
    else m.getElement().classList.remove('selected-ring');
  }
  var fm = fullscreenMarkers[id];
  if (fm && fm.getElement()) {
    if (isSelected) fm.getElement().classList.add('selected-ring');
    else fm.getElement().classList.remove('selected-ring');
  }
}

function updateAllMarkers() { lugares.forEach(function(l) { updateMarkerSelection(l.id); }); }
window.togglePlaceFromPopup = function(id) { togglePlaceSelection(id); }

// ===== EL DIBUJO BONITO DE LOS LUGARES CON TODA LA INFO =====
// ===== EL DIBUJO BONITO DE LOS LUGARES (AHORA CON CARRUSEL HORIZONTAL) =====
function renderPlaces() {
  var c = document.getElementById('placesContainer');
  if (!c) return;
  var html = '', gi = 0;
  
  bloques.forEach(function(bloque) {
    var arr = lugares.filter(function(l) { return l.bloque === bloque.id; });
    if (!arr.length) return;

    html += '<div class="province-box" id="prov-' + bloque.id + '">';
    
    html += '<div class="province-header" onclick="toggleProvincia(\'prov-' + bloque.id + '\')">';
    html += '<h3>' + bloque.emoji + ' ' + bloque.nombre + ' <span style="font-size: 0.9rem; color: var(--fg-muted); font-weight: normal; font-family: \'Montserrat\', sans-serif;">(' + arr.length + ')</span></h3>';
    html += '<div class="province-arrow"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>';
    html += '</div>';
    
    html += '<div class="province-content">';
    // AQUÍ ESTÁ LA MAGIA: Usamos horizontal-scroll
    html += '<div class="horizontal-scroll places-carousel">';

    arr.forEach(function(l) {
      gi++;
      var isFav = isFavorite(l.id);
      
      html += '<article class="place-card ' + l.bloque + '" id="place-' + l.id + '">';
      html += '<div class="place-image"><img src="' + l.imagen + '" alt="' + l.nombre + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop\'"><span class="place-number-badge">' + gi + '</span><div class="place-title-overlay"><h3 class="place-title">' + l.nombre + '</h3></div></div>';
      
      html += '<div class="place-header" onclick="togglePlace(\'place-' + l.id + '\')">';
      html += '<div class="place-header-left">';
      l.categorias.forEach(function(catId) { html += '<span class="place-category-chip ' + catId + '">' + getCategoryName(catId) + '</span>'; });
      html += '</div>';
      html += '<div class="place-header-right"><button class="fav-btn ' + (isFav ? 'active' : '') + '" data-id="' + l.id + '" onclick="event.stopPropagation(); toggleFavorite(' + l.id + ')"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button><svg class="place-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div></div>';
      
      html += '<div class="place-content"><div class="place-content-inner">';
      html += '<div class="place-category-tags">';
      l.categorias.forEach(function(catId) { html += '<span class="place-category-tag ' + catId + '">' + getCategoryEmoji(catId) + ' ' + getCategoryName(catId) + '</span>'; });
      html += '</div>';
      
      html += renderInfoBlock('✨', 'POR QUÉ VENIR', l.porQueVenir);
      html += renderInfoBlock('🕐', 'EL MOMENTO', l.momentoPerfecto);
      if (l.imprescindibles) html += renderListBlock('⭐', 'IMPRESCINDIBLES', l.imprescindibles);
      html += renderInfoBlock('🍽️', 'COMER', l.comer);
      html += renderInfoBlock('🍷', 'TOMAR', l.tomar);
      html += renderInfoBlock('🔮', 'SECRETO', l.secreto);
      html += renderInfoBlock('⏳', 'MÁS TIEMPO', l.masTiempo);
      html += renderInfoBlock('⚠️', 'ADVERTENCIAS', l.advertencias);
      
      html += '<button class="btn-primary" onclick="togglePlaceSelection(' + l.id + ')" style="width:100%; margin-top:16px;">Añadir / Quitar de la ruta</button>';

      html += '</div></div></article>';
    });

    html += '</div></div></div>';
  });

  c.innerHTML = html;
  initAnimations();
}

window.toggleBloque = function(id) { 
  var card = document.getElementById(id); 
  if (!card) return; 
  var exp = card.classList.contains('expanded'); 
  document.querySelectorAll('.bloque-card.expanded').forEach(function(x) { x.classList.remove('expanded'); }); 
  if (!exp) card.classList.add('expanded'); 
}

window.togglePlace = function(id) {
  var card = document.getElementById(id);
  if (card) {
      card.classList.toggle('expanded');
      if(card.classList.contains('expanded')) {
        setTimeout(function() { card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 150);
      }
  }
}

function renderInfoBlock(icon, title, text) { 
  if (!text) return ''; 
  return '<div class="info-block"><div class="info-header"><span class="info-icon">' + icon + '</span><span class="info-title">' + title + '</span></div><p class="info-text">' + text + '</p></div>'; 
}

function renderListBlock(icon, title, items) { 
  if (!items || !items.length) return ''; 
  return '<div class="info-block"><div class="info-header"><span class="info-icon">' + icon + '</span><span class="info-title">' + title + '</span></div><ul class="info-list">' + items.map(function(i) { return '<li>' + i + '</li>'; }).join('') + '</ul></div>'; 
}

// ===== MAPA NORMAL CON EL PARCHE PARA QUE NO SE CONGELE =====
function initMap() {
  setTimeout(function() {
    if (mainMap) return;
    
    mainMap = L.map('map', { 
      center: [42.6, -8.4], zoom: 7, 
      dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, zoomControl: false 
    }); 
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '', maxZoom: 18 }).addTo(mainMap);
    
    lugares.forEach(function(l, i) {
      if (!l.lat || !l.lng) return;
      var isSelected = selectedPlaces.indexOf(l.id) > -1;
      var m = L.marker([l.lat, l.lng], {
        icon: L.divIcon({ className: 'custom-marker ' + l.bloque + (isSelected ? ' selected-ring' : ''), html: '<span>' + (i+1) + '</span>', iconSize: [32, 32], iconAnchor: [16, 16] })
      }).addTo(mainMap);
      
      m.on('click', function(e) {
        var isSel = selectedPlaces.indexOf(l.id) > -1;
        var btnText = isSel ? '❌ Quitar de la ruta' : '➕ Añadir a la ruta';
        var btnColor = isSel ? 'var(--accent-red)' : 'var(--accent-sea)';
        var popupHtml = '<div style="text-align:center; min-width: 140px;">';
        popupHtml += '<img src="' + l.imagen + '" style="width:100%; height:85px; object-fit:cover; border-radius:6px; margin-bottom:8px;">';
        popupHtml += '<div class="popup-title">' + l.nombre + '</div>';
        popupHtml += '<div style="font-size:0.75rem; color:var(--fg-muted); margin-bottom:10px;">' + l.horas + 'h · ' + getCategoryName(l.categorias[0]) + '</div>';
        popupHtml += '<button class="popup-btn" style="background:' + btnColor + ';" onclick="togglePlaceFromPopup(' + l.id + ')">' + btnText + '</button>';
        popupHtml += '</div>';
        L.popup({closeButton: false, offset: [0, -10]}).setLatLng(e.latlng).setContent(popupHtml).openOn(mainMap);
      });
      markers[l.id] = m;
    });
  }, 150);
}

// ===== MAPA FULLSCREEN CON EL PARCHE =====
window.openFullscreenMap = function() {
  var container = document.getElementById('mapFullscreen');
  container.classList.add('active');
  
  setTimeout(function() {
    if (!window.myBigMap) {
      window.myBigMap = L.map('mapFullscreenMap', { center: [42.6, -8.4], zoom: 9, zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '', maxZoom: 18 }).addTo(window.myBigMap);
      
      lugares.forEach(function(l, i) {
        if (!l.lat || !l.lng) return;
        var isSelected = selectedPlaces.indexOf(l.id) > -1;
        var m = L.marker([l.lat, l.lng], {
          icon: L.divIcon({ className: 'custom-marker touchable ' + l.bloque + (isSelected ? ' selected-ring' : ''), html: '<span>' + (i+1) + '</span>', iconSize: [48, 48], iconAnchor: [24, 24] })
        }).addTo(window.myBigMap);
        
        m.on('click', function(e) {
          var isSel = selectedPlaces.indexOf(l.id) > -1;
          var btnText = isSel ? '❌ Quitar de la ruta' : '➕ Añadir a la ruta';
          var btnColor = isSel ? 'var(--accent-red)' : 'var(--accent-sea)';
          var popupHtml = '<div style="text-align:center; min-width: 150px;">';
          popupHtml += '<img src="' + l.imagen + '" style="width:100%; height:95px; object-fit:cover; border-radius:6px; margin-bottom:8px;">';
          popupHtml += '<div class="popup-title">' + l.nombre + '</div>';
          popupHtml += '<div style="font-size:0.8rem; color:var(--fg-muted); margin-bottom:10px;">' + l.horas + 'h · ' + getCategoryName(l.categorias[0]) + '</div>';
          popupHtml += '<button class="popup-btn" style="background:' + btnColor + ';" onclick="togglePlaceFromPopup(' + l.id + ')">' + btnText + '</button>';
          popupHtml += '</div>';
          L.popup({closeButton: false, offset: [0, -15]}).setLatLng(e.latlng).setContent(popupHtml).openOn(window.myBigMap);
        });
        fullscreenMarkers[l.id] = m;
      });
    } else {
      lugares.forEach(function(l) { updateFullscreenMarker(l.id); });
    }
    updateFullscreenUI();
    window.myBigMap.invalidateSize();
  }, 150);
}

window.closeFullscreenMap = function() { document.getElementById('mapFullscreen').classList.remove('active'); }

function updateFullscreenMarker(id) {
  var isSelected = selectedPlaces.indexOf(id) > -1;
  var m = fullscreenMarkers[id];
  if (m && m.getElement()) {
    if (isSelected) m.getElement().classList.add('selected-ring');
    else m.getElement().classList.remove('selected-ring');
  }
}

function updateFullscreenUI() {
  var totalHours = selectedPlaces.reduce(function(sum, id) {
    var l = lugares.find(function(x) { return x.id === id; });
    return sum + (l ? l.horas : 0);
  }, 0);
  
  document.getElementById('mapSelectionCount').textContent = selectedPlaces.length + ' seleccionados';
  document.getElementById('mapSelectionTime').textContent = totalHours + 'h';
  
  var floatingBtn = document.getElementById('mapFloatingSelection');
  var floatingCount = document.getElementById('mapFloatingCount');
  if (floatingBtn && floatingCount) {
    if (selectedPlaces.length > 0) { floatingBtn.style.display = 'flex'; floatingCount.textContent = selectedPlaces.length; } 
    else { floatingBtn.style.display = 'none'; }
  }
  
  var placesContainer = document.getElementById('mapSelectionPlaces');
  if (selectedPlaces.length === 0) {
    placesContainer.innerHTML = '';
  } else {
    var html = '';
    selectedPlaces.forEach(function(id) {
      var l = lugares.find(function(x) { return x.id === id; });
      if (!l) return;
      html += '<div class="map-selection-chip">' + l.nombre;
      html += '<span class="remove" onclick="event.stopPropagation(); togglePlaceSelection(' + l.id + '); updateFullscreenUI();"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></div>';
    });
    placesContainer.innerHTML = html;
  }
}

window.scrollToMapFooter = function() {
  var footer = document.getElementById('mapFullscreenFooter');
  if (footer) footer.scrollIntoView({ behavior: 'smooth' });
}

// ===== ABRIR EN GOOGLE MAPS =====
window.generateItinerary = function() {
  if (selectedPlaces.length === 0) { alert('Selecciona al menos un lugar en el mapa.'); return; }
  let googleMapsUrl = "https://www.google.com/maps/dir/";
  let paradas = [];
  if (typeof userLocation !== 'undefined' && userLocation !== null && userLocation.lat) {
    paradas.push(userLocation.lat + "," + userLocation.lng);
  }
  selectedPlaces.forEach(function(id) {
    let lugar = lugares.find(l => l.id == id);
    if (lugar && lugar.lat && lugar.lng) paradas.push(lugar.lat + "," + lugar.lng); 
  });
  if (paradas.length === 0) { alert('No se encontraron coordenadas para la ruta.'); return; }
  googleMapsUrl += paradas.join("/");
  window.open(googleMapsUrl, '_blank');
};

// ===== HELPERS =====
// ===== MENÚ INFERIOR TIPO APP NATIVA =====
function initBottomMenu() {
  var items = document.querySelectorAll('.menu-item');
  
  // Convertimos las secciones en "pantallas"
  var screens = {
    'hero': document.getElementById('hero'),
    'recomendaciones': document.getElementById('recomendaciones'),
    'lugares': document.getElementById('lugares'),
    'generador': document.getElementById('generador')
  };

  // Les añadimos la clase base a todas
  Object.values(screens).forEach(function(screen) {
    if(screen) screen.classList.add('app-screen');
  });

  items.forEach(function(i) {
    i.addEventListener('click', function(e) {
      e.preventDefault();
      var targetId = i.getAttribute('data-section');
      
      // 1. Apagar todos los botones y encender el tocado
      items.forEach(function(item) { item.classList.remove('active'); });
      i.classList.add('active');

      // 2. Ocultar todas las pantallas y mostrar solo la elegida
      Object.keys(screens).forEach(function(key) {
        var screen = screens[key];
        if (screen) {
          if (key === targetId) {
            screen.classList.add('active-screen');
          } else {
            screen.classList.remove('active-screen');
          }
        }
      });

      // 3. Subir la vista arriba del todo mágicamente
      window.scrollTo(0, 0);

      // 4. PARCHE VITAL PARA EL MAPA: Si entramos a la pestaña de la ruta, 
      // tenemos que decirle al mapa que recalcule su tamaño para que no se vea gris.
      if (targetId === 'generador') {
        setTimeout(function() { 
          if (mainMap) mainMap.invalidateSize(); 
        }, 100);
      }
    });
  });

  // Arrancar la app activando automáticamente la primera pantalla (Inicio)
  document.querySelector('.menu-item[data-section="hero"]').click();
}

function initAnimations() { 
  var obs = new IntersectionObserver(function(e) { 
    e.forEach(function(x) { if (x.isIntersecting) x.target.classList.add('visible'); }); 
  }, { threshold: 0.1 }); 
  document.querySelectorAll('.fade-in').forEach(function(el) { obs.observe(el); }); 
}
// ABRIR Y CERRAR ACORDEÓN DE RECOMENDACIONES (UNA TARJETA + RESETEO)
window.toggleCategoria = function(id) {
  var row = document.getElementById(id);
  if (!row) return;
  
  var isExpanding = !row.classList.contains('expanded');
  
  // 1. Cerrar los demás acordeones y resetear su scroll al principio
  document.querySelectorAll('.category-row.expanded').forEach(function(el) {
    if (el.id !== id) {
      el.classList.remove('expanded');
      var scrollBox = el.querySelector('.horizontal-scroll');
      if (scrollBox) {
        // Le damos tiempo a que se cierre para resetearlo sin que el usuario lo vea
        setTimeout(function() { scrollBox.scrollLeft = 0; }, 400); 
      }
    }
  });

  if (isExpanding) {
    // 2. Antes de abrir este, nos aseguramos de que el scroll esté en el primer elemento
    var scrollBox = row.querySelector('.horizontal-scroll');
    if (scrollBox) scrollBox.scrollLeft = 0;

    row.classList.add('expanded');
    
    // 3. Centramos la pantalla en el acordeón abierto
    setTimeout(function() { 
      var headerOffset = 80; 
      var elementPosition = row.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
      window.scrollTo({
           top: offsetPosition,
           behavior: "smooth"
      });
    }, 350);
  } else {
    // 4. Si el usuario cierra el acordeón manualmente, también reseteamos el scroll
    row.classList.remove('expanded');
    var scrollBox = row.querySelector('.horizontal-scroll');
    if (scrollBox) {
      setTimeout(function() { scrollBox.scrollLeft = 0; }, 400);
    }
  }
}
// ===== ABRIR Y CERRAR PROVINCIAS (MODO INTELIGENTE) =====
window.toggleProvincia = function(id) {
  var row = document.getElementById(id);
  if (!row) return;
  
  var isExpanding = !row.classList.contains('expanded');
  
  // 1. Cerrar las demás provincias automáticamente
  document.querySelectorAll('.province-box.expanded').forEach(function(el) {
    if (el.id !== id) el.classList.remove('expanded');
  });

  if (isExpanding) {
    row.classList.add('expanded');
    
    // 2. Espera a que se abra y centra la pantalla perfectamente
    setTimeout(function() { 
      var headerOffset = 70; // Espacio para que respire por arriba
      var elementPosition = row.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
      window.scrollTo({
           top: offsetPosition,
           behavior: "smooth"
      });
    }, 350);
  } else {
    row.classList.remove('expanded');
  }
}
