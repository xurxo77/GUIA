// ANTÍDOTO: Borrar caché atascada en dispositivos
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

// ===== CONTRASEÑA =====
var CORRECT_PASSWORD = 'Caamanho';

document.getElementById('splashForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var input = document.getElementById('passwordInput');
  var error = document.getElementById('splashError');
  var value = input.value.trim(); 
  
  if (value === CORRECT_PASSWORD) {
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
    setTimeout(function() { document.getElementById('passwordInput').focus(); }, 100);
  }
});

// ===== VARIABLES GLOBALES =====
var map = null, mapFullscreen = null, markers = {}, fullscreenMarkers = {};
var userLocation = null, userMarker = null;
var selectedPlaces = [];
var favorites = [];
var currentRouteFilter = 'all';
var currentPreviewPlace = null; 

// ===== CATEGORÍAS Y BLOQUES =====
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

function getCategoryName(catId) { 
  var cat = categorias.find(function(c) { return c.id === catId; }); 
  return cat ? cat.nombreCorto : ''; 
}

function getCategoryEmoji(catId) { 
  var cat = categorias.find(function(c) { return c.id === catId; }); 
  return cat ? cat.emoji : ''; 
}

// ===== LUGARES =====
var lugares = [
  { id: 1, nombre: "Santiago de Compostela", bloque: "acoruna", categorias: ["ciudades", "patrimonio"], horas: 5, imagen: "img/santiago.jpg", lat: 42.8800, lng: -8.5450, porQueVenir: "Fin del Camino. Ciudad santa, monumental y viva.", opinion: "Para nosotros es la ciudad más especial. Piérdete por la zona vieja de noche cuando llueve, es pura magia.", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Catedral", "Plaza del Obradoiro", "Mercado de Abastos"], comer: "Pulpo en el Mercado.", beber: "Café en Plaza de Cervantes.", secreto: "Jardines de la Universidad.", masTiempo: "Monte do Gozo.", advertencias: "Muchos turistas.", masInfo: "<a href='https://santiagoturismo.com' target='_blank'>Web oficial de Turismo</a>" },
  { id: 2, nombre: "A Coruña", bloque: "acoruna", categorias: ["ciudades", "costa"], horas: 4, imagen: "img/acoruna.jpg", lat: 43.3700, lng: -8.4000, porQueVenir: "Ciudad de cristal, faro romano, paseo marítimo.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Atardecer.", imprescindibles: ["Torre de Hércules", "Paseo marítimo", "Playa de Riazor"], comer: "Pulpería Ezequiela.", beber: "Estrella Galicia.", secreto: "Inscripciones romanas.", masTiempo: "Aquarium.", advertencias: "Siempre hace aire.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 3, nombre: "Betanzos", bloque: "acoruna", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/betanzos.jpg", lat: 43.2833, lng: -8.2167, porQueVenir: "Villa medieval con casco histórico.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Mañana.", imprescindibles: ["Plaza Mayor", "Iglesia de Santa María", "Murallas"], comer: "Tortilla de Betanzos.", beber: "Vino de la tierra.", secreto: "Jardines del Pasatiempo.", masTiempo: "Paseo por el río.", advertencias: "Fuertes pendientes.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 4, nombre: "Cedeira", bloque: "acoruna", categorias: ["costa", "naturaleza"], horas: 2, imagen: "img/cedeira.jpg", lat: 43.6667, lng: -8.0500, porQueVenir: "Playa de Magdalena y puerto pesquero.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Verano.", imprescindibles: ["Playa de Magdalena", "Puerto", "Monte da Sartá"], comer: "Marisco.", beber: "Vino blanco.", secreto: "Senda costera.", masTiempo: "Paseo al faro.", advertencias: "Mar peligroso.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 5, nombre: "Ortigueira", bloque: "acoruna", categorias: ["costa", "naturaleza"], horas: 3, imagen: "img/ortigueira.jpg", lat: 43.6333, lng: -7.8500, porQueVenir: "Playa de Ortigueira, una de las mejores.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Marea baja.", imprescindibles: ["Playa de Ortigueira", "Cabo Ortegal", "Puerto"], comer: "Marisco.", beber: "Sidra.", secreto: "Estaca de Bares.", masTiempo: "Cabo Ortegal.", advertencias: "Marea alta cubre la playa.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 6, nombre: "Estaca de Bares", bloque: "acoruna", categorias: ["magicos", "costa"], horas: 2, imagen: "img/estacadebares.jpg", lat: 43.7833, lng: -7.6833, porQueVenir: "Punto más al norte de España.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Atardecer.", imprescindibles: ["Faro", "Mirador", "Paseo hasta el faro"], comer: "En Ortigueira.", beber: "Lo que lleves.", secreto: "Amanecer.", masTiempo: "Ortigueira.", advertencias: "Viento muy fuerte.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 7, nombre: "Costa da Morte", bloque: "acoruna", categorias: ["magicos", "naturaleza", "costa"], horas: 6, imagen: "img/costadamorte.jpg", lat: 43.0000, lng: -9.0000, porQueVenir: "Tramo de costa con naufragios y faros.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Otoño o invierno.", imprescindibles: ["Faro de Fisterra", "Muxía", "Camariñas"], comer: "Pulpo.", beber: "Albariño.", secreto: "Playa de Traba.", masTiempo: "Ruta completa.", advertencias: "Mar siempre peligroso.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 8, nombre: "Fragas do Eume", bloque: "acoruna", categorias: ["naturaleza"], horas: 4, imagen: "img/eume.jpg", lat: 43.4167, lng: -8.0667, porQueVenir: "Bosque atlántico mejor conservado.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Primavera.", imprescindibles: ["Monasterio de Caaveiro", "Ruta del río", "Miradores"], comer: "Picnic.", beber: "Agua.", secreto: "Ruta nocturna guiada.", masTiempo: "Monfero.", advertencias: "Cierres por lluvia.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 9, nombre: "Monte Pindo", bloque: "acoruna", categorias: ["naturaleza", "magicos"], horas: 3, imagen: "img/pindo.jpg", lat: 42.9000, lng: -9.1000, porQueVenir: "Monte sagrado, granito rosa.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Día despejado.", imprescindibles: ["Cumbre", "Leyendas", "Vistas"], comer: "En Fisterra.", beber: "Agua.", secreto: "Petroglifos.", masTiempo: "Fisterra.", advertencias: "Roca resbaladiza.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 10, nombre: "Cascada del Ézaro", bloque: "acoruna", categorias: ["naturaleza", "costa"], horas: 1, imagen: "img/ezaro.jpg", lat: 42.8667, lng: -9.1167, porQueVenir: "Única cascada que cae al mar.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Tras lluvias.", imprescindibles: ["Mirador", "Playa", "Faro"], comer: "En Fisterra.", beber: "Agua.", secreto: "Noche con luna.", masTiempo: "Fisterra.", advertencias: "Menos agua en verano.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 11, nombre: "Padrón", bloque: "acoruna", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/padron.jpg", lat: 42.7333, lng: -8.6500, porQueVenir: "Cuna del peregrino.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Iria Flavia", "Fonte do Carme", "Pedrón"], comer: "Pimientos de Padrón.", beber: "Vino.", secreto: "Casa de Rosalía.", masTiempo: "Paseo del río.", advertencias: "Pican algunos.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 12, nombre: "San Andrés de Teixido", bloque: "acoruna", categorias: ["magicos"], horas: 3, imagen: "img/teixido.jpg", lat: 43.6333, lng: -8.2500, porQueVenir: "Santuario donde van los que no van en vida.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Peregrinación.", imprescindibles: ["Santuario", "Ruta", "Vistas"], comer: "Lo que lleves.", beber: "Agua.", secreto: "Amanecer.", masTiempo: "Cedeira.", advertencias: "Carretera estrecha.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 13, nombre: "Muros", bloque: "acoruna", categorias: ["pueblos"], horas: 2, imagen: "img/muros.jpg", lat: 42.7667, lng: -9.0500, porQueVenir: "Puerto pesquero con quintas indias.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Mañana.", imprescindibles: ["Puerto", "Quintas", "Playa"], comer: "Pescado fresco.", beber: "Vino.", secreto: "Ruta de las Quintas.", masTiempo: "Noia.", advertencias: "Aparcar difícil.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 14, nombre: "Noia", bloque: "acoruna", categorias: ["pueblos"], horas: 2, imagen: "img/noia.jpg", lat: 42.7833, lng: -8.8833, porQueVenir: "Puerto fluvial con casco histórico.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Puerto", "Casco histórico", "Ría"], comer: "Marisco.", beber: "Vino.", secreto: "Sendero.", masTiempo: "Muros.", advertencias: "Nada especial.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 15, nombre: "Lugo", bloque: "lugo", categorias: ["ciudades", "patrimonio"], horas: 3, imagen: "img/lugo.jpg", lat: 43.0100, lng: -7.5600, porQueVenir: "Muralla romana mejor conservada.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Muralla", "Catedral", "Casco histórico"], comer: "Pulpo.", beber: "Cerveza.", secreto: "Paseo nocturno.", masTiempo: "Termas romanas.", advertencias: "Ciudad tranquila.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 16, nombre: "Viveiro", bloque: "lugo", categorias: ["villas", "costa"], horas: 3, imagen: "img/viveiro.jpg", lat: 43.6500, lng: -7.6000, porQueVenir: "Villa marinera medieval.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Verano.", imprescindibles: ["Puerto", "Casco histórico", "Playa de Covas"], comer: "Marisco.", beber: "Sidra.", secreto: "Fiestas del Carmen.", masTiempo: "Playa de Covas.", advertencias: "Lleno en verano.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 17, nombre: "Mondoñedo", bloque: "lugo", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/mondonedo.jpg", lat: 43.4667, lng: -7.4500, porQueVenir: "Antigua capital del reino de Galicia.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Catedral", "Casco histórico", "Miradores"], comer: "Empanada.", beber: "Vino.", secreto: "Festival de la Cocina.", masTiempo: "Senda ecológica.", advertencias: "Lluvia frecuente.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 18, nombre: "Ribadeo", bloque: "lugo", categorias: ["costa"], horas: 4, imagen: "img/ribadeo.jpg", lat: 43.5333, lng: -7.0333, porQueVenir: "Villa marinera y playa de las Catedrales.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Marea baja.", imprescindibles: ["Playa de las Catedrales", "Torre de los Moreno", "Paseo marítimo"], comer: "Marisco.", beber: "Sidra.", secreto: "Faro de la Isla Pancha.", masTiempo: "Mondoñedo.", advertencias: "Reserva en Catedrales.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 19, nombre: "Serra dos Ancares", bloque: "lugo", categorias: ["naturaleza"], horas: 5, imagen: "img/ancares.jpg", lat: 42.7833, lng: -7.2000, porQueVenir: "Montaña, pallozas, sosiego.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Pallozas", "Rutas", "Vistas"], comer: "Cocina tradicional.", beber: "Agua.", secreto: "Cascada secreta.", masTiempo: "Ruta completa.", advertencias: "Carreteras de montaña.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 20, nombre: "Chantada", bloque: "lugo", categorias: ["patrimonio"], horas: 2, imagen: "img/chantada.jpg", lat: 42.6167, lng: -7.7667, porQueVenir: "Villa con tradición vinícola.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Otoño.", imprescindibles: ["Casco histórico", "Bodegas", "Paisajes"], comer: "Vino y queso.", beber: "Mencía.", secreto: "Rutas del vino.", masTiempo: "Carballeira.", advertencias: "Calor en verano.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 21, nombre: "Ourense", bloque: "ourense", categorias: ["ciudades", "termalismo"], horas: 3, imagen: "img/ourense.jpg", lat: 42.3350, lng: -7.8640, porQueVenir: "Termas romanas, casco histórico.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Puente romano", "Termas", "Casco viejo"], comer: "Pulpo.", beber: "Mencía.", secreto: "Termas libres.", masTiempo: "Ribeira Sacra.", advertencias: "Calor en verano.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 22, nombre: "Allariz", bloque: "ourense", categorias: ["villas", "termalismo"], horas: 2, imagen: "img/allariz.jpg", lat: 42.1833, lng: -7.8000, porQueVenir: "Villa medieval peatonal.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Tarde.", imprescindibles: ["Casco histórico", "Río Arnoia", "Artesanía"], comer: "Cocina gallega.", beber: "Vino.", secreto: "Ruta del Arnoia.", masTiempo: "Playa fluvial.", advertencias: "Nada.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 23, nombre: "Ribadavia", bloque: "ourense", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/ribadavia.jpg", lat: 42.2833, lng: -8.1500, porQueVenir: "Capital del vino y judería.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Fiesta del vino.", imprescindibles: ["Judería", "Casco histórico", "Bodegas"], comer: "Vino y tapas.", beber: "Mencía.", secreto: "Fiesta del vino.", masTiempo: "Riberas del Miño.", advertencias: "Fiestas en agosto.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 24, nombre: "Monforte de Lemos", bloque: "ourense", categorias: ["patrimonio"], horas: 3, imagen: "img/monforte.jpg", lat: 42.5167, lng: -7.5167, porQueVenir: "Colegiata y torre del homenaje.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Colexiata", "Torre da Homenaxe", "Huerta"], comer: "Pulpo.", beber: "Mencía.", secreto: "Vistas desde la torre.", masTiempo: "Ribeira Sacra.", advertencias: "Cuesta arriba.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 25, nombre: "Castro Caldelas", bloque: "ourense", categorias: ["patrimonio"], horas: 2, imagen: "img/castro.jpg", lat: 42.3581, lng: -7.4649, porQueVenir: "Castillo medieval y vistas.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Mañana.", imprescindibles: ["Castillo", "Pueblo", "Miradores"], comer: "Cocina tradicional.", beber: "Mencía.", secreto: "Atardecer.", masTiempo: "Cañón del Sil.", advertencias: "Carretera curvas.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 26, nombre: "Ferrol", bloque: "acoruna", categorias: ["ciudades", "patrimonio", "costa"], horas: 3, imagen: "img/ferrol.jpg", lat: 43.4833, lng: -8.2333, porQueVenir: "El Arsenal Ilustrado, modernismo y playas salvajes.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Mañana.", imprescindibles: ["Barrio de la Magdalena", "Arsenal Militar", "Castillo de San Felipe"], comer: "Marisco y pescado.", beber: "Estrella Galicia.", secreto: "Ruta de las Meninas de Canido.", masTiempo: "Playas de Doniños.", advertencias: "Clima muy cambiante.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 27, nombre: "Cañón del Sil", bloque: "ourense", categorias: ["naturaleza"], horas: 5, imagen: "img/sil.jpg", lat: 42.4167, lng: -7.7500, porQueVenir: "Cañones más espectaculares.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Primavera y otoño.", imprescindibles: ["Catamarán", "Miradores", "Monasterios"], comer: "Adegas.", beber: "Mencía.", secreto: "Sendero de los Monjes.", masTiempo: "Castro Caldelas.", advertencias: "Carreteras estrechas.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 28, nombre: "Ribeira Sacra", bloque: "ourense", categorias: ["magicos", "naturaleza", "patrimonio"], horas: 6, imagen: "img/ribeira.jpg", lat: 42.4500, lng: -7.5500, porQueVenir: "Tierra de monjes y milagros.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Cualquier momento.", imprescindibles: ["Monasterios", "Cañones", "Catamarán"], comer: "Mencía.", beber: "Godello.", secreto: "Monasterio de San Pedro de Rocas.", masTiempo: "Varios días.", advertencias: "Carreteras de montaña.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 29, nombre: "Vigo", bloque: "pontevedra", categorias: ["ciudades", "costa"], horas: 4, imagen: "img/vigo.jpg", lat: 42.2406, lng: -8.7207, porQueVenir: "Puerto, marisco y puerta de las Cíes.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Tarde-noche.", imprescindibles: ["Tabernas del Berbés", "Playa de Samil", "Monte del Castro"], comer: "Pulpo, navajas, ostras.", beber: "Blanco de la casa.", secreto: "Taberna de Cervantes.", masTiempo: "Monte del Castro.", advertencias: "Llenísimo fines de semana.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 30, nombre: "Pontevedra", bloque: "pontevedra", categorias: ["ciudades"], horas: 3, imagen: "img/pontevedra.jpg", lat: 42.4333, lng: -8.6333, porQueVenir: "Ciudad amable con el peatón.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Tarde para cenar.", imprescindibles: ["Plaza da Ferrería", "Peregrina", "Callejear sin mapa"], comer: "Tabernas en calles estrechas.", beber: "Vino de la casa.", secreto: "Convento de San Francisco.", masTiempo: "Paseo a la ría.", advertencias: "Muy segura.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 31, nombre: "Tui", bloque: "pontevedra", categorias: ["villas", "patrimonio"], horas: 3, imagen: "img/tui.jpg", lat: 42.0500, lng: -8.6333, porQueVenir: "Ciudad episcopal, frontera con Portugal.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Tarde.", imprescindibles: ["Catedral", "Casco histórico", "Mirador del Miño"], comer: "Marisco.", beber: "Albariño.", secreto: "Paseo hasta Portugal.", masTiempo: "Valença.", advertencias: "Lluvia frecuente.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 32, nombre: "Cambados", bloque: "pontevedra", categorias: ["villas"], horas: 3, imagen: "img/cambados.jpg", lat: 42.5167, lng: -8.8167, porQueVenir: "Capital del Albariño.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Fiesta del Albariño.", imprescindibles: ["Pazo de Fefiñáns", "Casco histórico", "Bodegas"], comer: "Marisco.", beber: "Albariño.", secreto: "Playa de la Lajinha.", masTiempo: "Playa fluvial.", advertencias: "Agosto lleno.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 33, nombre: "Baiona", bloque: "pontevedra", categorias: ["pueblos", "costa"], horas: 3, imagen: "img/baiona.jpg", lat: 42.1167, lng: -8.8500, porQueVenir: "Primer puerto en recibir la noticia del Nuevo Mundo.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Verano.", imprescindibles: ["Fortaleza", "Puerto", "Playa"], comer: "Marisco.", beber: "Albariño.", secreto: "Arribada.", masTiempo: "Islas Cíes.", advertencias: "Lleno en verano.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 34, nombre: "Combarro", bloque: "pontevedra", categorias: ["pueblos"], horas: 2, imagen: "img/combarro.jpg", lat: 42.3833, lng: -8.7167, porQueVenir: "Hórreos sobre el mar.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Atardecer.", imprescindibles: ["Hórreos", "Paseo marítimo", "Puerto"], comer: "Marisco.", beber: "Albariño.", secreto: "Noche.", masTiempo: "Poio.", advertencias: "Muy turístico.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 35, nombre: "O Grove", bloque: "pontevedra", categorias: ["costa"], horas: 4, imagen: "img/ogrove.jpg", lat: 42.3881, lng: -8.8833, porQueVenir: "Paraíso del marisco.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Verano.", imprescindibles: ["Playa de la Lanzada", "Marisquerías", "Paseo"], comer: "Marisco.", beber: "Albariño.", secreto: "La Toja.", masTiempo: "Isla de Ons.", advertencias: "Muy concurrido.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 36, nombre: "A Illa de Arousa", bloque: "pontevedra", categorias: ["costa"], horas: 3, imagen: "img/arousa.jpg", lat: 42.5573, lng: -8.8618, porQueVenir: "Isla con playas salvajes.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Verano.", imprescindibles: ["Faro", "Playas", "Paseo"], comer: "Marisco.", beber: "Albariño.", secreto: "Carretera del faro.", masTiempo: "O Grove.", advertencias: "Puente de dos sentidos.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 37, nombre: "A Guarda", bloque: "pontevedra", categorias: ["magicos", "patrimonio"], horas: 3, imagen: "img/aguarda.jpg", lat: 41.9000, lng: -8.8667, porQueVenir: "Citania de Santa Trega.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Atardecer.", imprescindibles: ["Citania", "Faro", "Monte Trega"], comer: "Marisco.", beber: "Albariño.", secreto: "Portugal.", masTiempo: "Tui.", advertencias: "Viento.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" },
  { id: 38, nombre: "Cíes y Ons", bloque: "pontevedra", categorias: ["naturaleza", "costa"], horas: 6, imagen: "img/ciesyons.jpg", lat: 42.2244, lng: -8.9031, porQueVenir: "Dos archipiélagos protegidos.", opinion: "Escribe aquí tu opinión personal...", momentoPerfecto: "Junio o septiembre.", imprescindibles: ["Playa de Rodas", "Monte Faro", "Playa de Melide"], comer: "Lleva comida.", beber: "Agua.", secreto: "Playa de Figueiras.", masTiempo: "Camping en Cíes.", advertencias: "Reserva obligatoria.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" }
];

// ===== MAGIA: AUTOGENERAR LAS 5 IMÁGENES DEL CARRUSEL =====
lugares.forEach(function(l) {
  if (l.imagen) {
    if (!l.imagen.startsWith('img/')) {
      l.imagen = 'img/' + l.imagen;
    }
    var puntoIndex = l.imagen.lastIndexOf('.');
    var rutaBase = l.imagen.substring(0, puntoIndex); 
    var extension = l.imagen.substring(puntoIndex);   
    l.imagenes = [];
    for (var i = 1; i <= 5; i++) {
      l.imagenes.push(rutaBase + i + extension);
    }
    l.imagen = l.imagenes[0];
  }
});

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
  initSearch();
  initRouteFilters();
  initBackToTop();
}

function initBottomMenu() {
  var menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(function(item) {
    item.addEventListener('click', function() {
      menuItems.forEach(function(i) { i.classList.remove('active'); });
      this.classList.add('active');
    });
  });
}

// ===== MAPA NORMAL =====
function initMap() {
  var mapEl = document.getElementById('map');
  if (!mapEl) return;
  
  map = L.map('map', { 
    zoomControl: false,       
    dragging: false,          
    touchZoom: false,         
    scrollWheelZoom: false,   
    doubleClickZoom: false,   
    boxZoom: false,
    keyboard: false
  });
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
    attribution: '', 
    maxZoom: 18 
  }).addTo(map);
  
  var mapBounds = [];

  lugares.forEach(function(l, i) {
    if (!l.lat || !l.lng) return;
    mapBounds.push([l.lat, l.lng]);
    var m = L.marker([l.lat, l.lng], {
      icon: L.divIcon({ className: 'custom-marker ' + l.bloque, html: '<span>' + (i+1) + '</span>', iconSize: [28, 28], iconAnchor: [14, 14] }),
      interactive: false 
    }).addTo(map);
    markers[l.id] = m;
  });

  if (mapBounds.length > 0) {
    map.fitBounds(mapBounds, { padding: [15, 15] });
  }

  mapEl.style.cursor = 'pointer';
  map.on('click', function() { openFullscreenMap(); });

  setTimeout(function() {
    map.invalidateSize();
    if (mapBounds.length > 0) {
      map.fitBounds(mapBounds, { padding: [15, 15] });
    }
  }, 600); // Tiempo extra para que los puntos caigan bien con la letra a 20px
}

// ===== ACORDEÓN RECOMENDACIONES =====
function toggleAccordion(btn) {
  var item = btn.parentElement;
  var isActive = item.classList.contains('active');
  if (!isActive) {
    item.classList.add('active');
  } else {
    item.classList.remove('active');
  }
}

// ===== BOTÓN VOLVER ARRIBA =====
function initBackToTop() {
  var btn = document.getElementById('backToTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
}

// ===== FAVORITOS =====
function loadFavorites() { 
  try { 
    var saved = localStorage.getItem('galicia_favorites'); 
    if (saved) favorites = JSON.parse(saved); 
  } catch(e) { 
    favorites = []; 
  } 
}

function saveFavorites() { 
  localStorage.setItem('galicia_favorites', JSON.stringify(favorites)); 
}

function toggleFavorite(id) { 
  var idx = favorites.indexOf(id); 
  if (idx > -1) { 
    favorites.splice(idx, 1); 
  } else { 
    favorites.push(id); 
  } 
  saveFavorites(); 
  updateFavoriteButton(id); 
  renderFavoritesSection(); 
}

function isFavorite(id) { 
  return favorites.indexOf(id) > -1; 
}

function updateFavoriteButton(id) { 
  var btn = document.querySelector('.fav-btn[data-id="' + id + '"]'); 
  if (btn) { 
    btn.classList.toggle('active', isFavorite(id)); 
  } 
}

function renderFavoritesSection() {
  var container = document.getElementById('favoritesSection');
  if (!container) return;
  
  if (favorites.length === 0) { 
    container.innerHTML = '<div class="favorites-empty">Toca el corazón en los lugares de la guía y aparecerán aquí.</div>'; 
    return; 
  }
  
  var html = '<div class="favorites-header"><div class="favorites-title"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> Tus favoritos</div></div>';
  html += '<div class="favorites-list">';
  
  favorites.forEach(function(id) {
    var l = lugares.find(function(x) { return x.id === id; });
    if (!l) return;
    
    var isSelected = selectedPlaces.indexOf(id) > -1;
    
    html += '<div class="favorite-item ' + (isSelected ? 'selected' : '') + '" onclick="togglePlaceSelection(' + l.id + ')" style="cursor:pointer;">';
    html += '<img src="' + l.imagen + '" onerror="this.src=\'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop\'">';
    html += '<div class="favorite-info"><div class="favorite-name">' + l.nombre + '</div><div class="favorite-time">' + l.horas + 'h</div></div>';
    html += '<div class="place-item-check" style="width:24px; height:24px; border:2px solid var(--border-aged); border-radius:6px; display:flex; align-items:center; justify-content:center; transition:all 0.2s ease;' + (isSelected ? 'background:var(--accent-sea); border-color:var(--accent-sea);' : '') + '"><svg viewBox="0 0 24 24" fill="none" stroke-width="3" style="width:14px; height:14px; stroke:white; opacity:' + (isSelected ? '1' : '0') + '"><polyline points="20 6 9 17 4 12"/></svg></div>';
    html += '</div>';
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
    if (userMarker) { 
      map.removeLayer(userMarker); 
      userMarker = null; 
    } 
    localStorage.removeItem('galicia_lat'); 
    localStorage.removeItem('galicia_lng'); 
    updateGeoUI(false); 
  } else { 
    requestLocation(); 
  } 
}

function requestLocation() {
  var btn = document.getElementById('geoBtn'), status = document.getElementById('geoStatus');
  btn.disabled = true; 
  btn.textContent = 'Buscando...'; 
  status.textContent = 'Localizando...';
  if (!navigator.geolocation) { 
    status.textContent = 'No soportado'; 
    btn.disabled = false; 
    btn.textContent = 'Activar'; 
    return; 
  }
  navigator.geolocation.getCurrentPosition(
    function(p) { 
      userLocation = { lat: p.coords.latitude, lng: p.coords.longitude }; 
      localStorage.setItem('galicia_lat', userLocation.lat); 
      localStorage.setItem('galicia_lng', userLocation.lng); 
      showUserOnMap(userLocation); 
      updateGeoUI(true); 
      map.setView([userLocation.lat, userLocation.lng], 10); 
    },
    function(err) { 
      status.textContent = err.code === 1 ? 'Permiso denegado' : 'Error'; 
      btn.disabled = false; 
      btn.textContent = 'Reintentar'; 
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function showUserOnMap(loc) { 
  if (!map) return; 
  if (userMarker) map.removeLayer(userMarker); 
  userMarker = L.marker([loc.lat, loc.lng], { icon: L.divIcon({ className: 'user-location-marker', iconSize: [14, 14], iconAnchor: [7, 7] }) }).addTo(map); 
}

function updateGeoUI(active) { 
  var btn = document.getElementById('geoBtn'), status = document.getElementById('geoStatus'); 
  if (active) { 
    btn.textContent = 'Desactivar'; 
    btn.disabled = false; 
    btn.style.background = 'var(--accent-red)'; 
    status.textContent = 'Ubicación activada'; 
    status.classList.add('active'); 
  } else { 
    btn.textContent = 'Activar'; 
    btn.disabled = false; 
    btn.style.background = ''; 
    status.textContent = 'Actívala para calcular distancias'; 
    status.classList.remove('active'); 
  } 
}

// ===== SELECCIÓN Y FILTROS RUTA =====
function initRouteFilters() {
  var chips = document.querySelectorAll('.route-filter-chip');
  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      chips.forEach(function(c) { c.classList.remove('active'); });
      this.classList.add('active');
      currentRouteFilter = this.dataset.cat;
      updateMapFilters();
    });
  });
}

function updateMapFilters() {
  var visibleBounds = [];

  lugares.forEach(function(l) {
    var match = currentRouteFilter === 'all' || l.categorias.includes(currentRouteFilter);

    if (map && markers[l.id]) {
      if (match) {
        if (!map.hasLayer(markers[l.id])) markers[l.id].addTo(map);
        visibleBounds.push([l.lat, l.lng]);
      } else {
        if (map.hasLayer(markers[l.id])) markers[l.id].removeFrom(map);
      }
    }

    if (mapFullscreen && fullscreenMarkers[l.id]) {
      if (match) {
        if (!mapFullscreen.hasLayer(fullscreenMarkers[l.id])) fullscreenMarkers[l.id].addTo(mapFullscreen);
      } else {
        if (mapFullscreen.hasLayer(fullscreenMarkers[l.id])) fullscreenMarkers[l.id].removeFrom(mapFullscreen);
      }
    }
  });

  if (map && visibleBounds.length > 0) {
    map.fitBounds(visibleBounds, { padding: [15, 15] });
  }
}

function togglePlaceSelection(id) {
  var idx = selectedPlaces.indexOf(id);
  if (idx > -1) {
    selectedPlaces.splice(idx, 1);
  } else {
    selectedPlaces.push(id);
  }
  updateSelectionUI();
  updateMarkerSelection(id);
  
  if (currentPreviewPlace === id) {
    updateFloatingCardBtn();
  }
}

function updateSelectionUI() {
  var totalHours = selectedPlaces.reduce(function(sum, id) {
    var l = lugares.find(function(x) { return x.id === id; });
    return sum + (l ? l.horas : 0);
  }, 0);
  
  var selectionStatsEl = document.getElementById('selectionStats');
  if (selectionStatsEl) selectionStatsEl.textContent = selectedPlaces.length + ' lugares · ' + totalHours + 'h';
  
  var content = document.getElementById('selectionContent');
  if (content) {
    if (selectedPlaces.length === 0) {
      content.innerHTML = '<div class="selection-empty">Toca puntos en el mapa o en tus favoritos</div>';
    } else {
      var html = '<div class="selection-list">';
      selectedPlaces.forEach(function(id) {
        var l = lugares.find(function(x) { return x.id === id; });
        if (!l) return;
        html += '<div class="selection-item">';
        html += '<img class="selection-item-img" src="' + l.imagen + '" onerror="this.src=\'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop\'">';
        html += '<div class="selection-item-info">';
        html += '<div class="selection-item-name">' + l.nombre + '</div>';
        html += '<div class="selection-item-time">' + l.horas + 'h</div>';
        html += '</div>';
        html += '<button class="selection-item-remove" onclick="togglePlaceSelection(' + l.id + ')"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
        html += '</div>';
      });
      html += '</div>';
      html += '<div class="action-buttons">';
      html += '<button class="btn-primary" onclick="generateItinerary()"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> Crear ruta</button>';
      html += '<button class="btn-secondary" onclick="clearSelection()"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Limpiar selección</button>';
      html += '</div>';
      content.innerHTML = html;
    }
  }
  
  renderFavoritesSection();
}

function clearSelection() {
  selectedPlaces = [];
  updateSelectionUI();
  updateAllMarkers();
  updateFloatingCardBtn();
}

function updateMarkerSelection(id) {
  var isSelected = selectedPlaces.indexOf(id) > -1;
  
  var m = markers[id];
  if (m) {
    var el = m.getElement();
    if (el) {
      if (isSelected) {
        el.classList.add('selected-ring');
      } else {
        el.classList.remove('selected-ring');
      }
    }
  }
  
  var fm = fullscreenMarkers[id];
  if (fm) {
    var fel = fm.getElement();
    if (fel) {
      if (isSelected) {
        fel.classList.add('selected-ring');
      } else {
        fel.classList.remove('selected-ring');
      }
    }
  }
}

function updateAllMarkers() {
  lugares.forEach(function(l) {
    updateMarkerSelection(l.id);
  });
}

// ===== MAPA FULLSCREEN Y TARJETA FLOTANTE =====
function openFullscreenMap() {
  var container = document.getElementById('mapFullscreen');
  if (!container) return;
  container.classList.add('active');
  hideFloatingCard();
  
  if (!mapFullscreen) {
    mapFullscreen = L.map('mapFullscreenMap', { center: [42.6, -8.4], zoom: 9, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '', maxZoom: 18 }).addTo(mapFullscreen);
    
    mapFullscreen.on('click', function() { hideFloatingCard(); }); 
    
    lugares.forEach(function(l, i) {
      if (!l.lat || !l.lng) return;
      var isSelected = selectedPlaces.indexOf(l.id) > -1;
      var m = L.marker([l.lat, l.lng], {
        icon: L.divIcon({
          className: 'custom-marker touchable ' + l.bloque + (isSelected ? ' selected-ring' : ''),
          html: '<span>' + (i+1) + '</span>',
          iconSize: [44, 44], iconAnchor: [22, 22]
        })
      }).addTo(mapFullscreen);
      
      m.on('click', function(e) {
        L.DomEvent.stopPropagation(e);
        showFloatingCard(l);
      });
      fullscreenMarkers[l.id] = m;
    });

    if (currentRouteFilter !== 'all') updateMapFilters();
  }
  
  updateFullscreenUI();
  setTimeout(function() { mapFullscreen.invalidateSize(); }, 100);
}

function closeFullscreenMap() {
  var container = document.getElementById('mapFullscreen');
  if (container) container.classList.remove('active');
  hideFloatingCard();
}

function showFloatingCard(lugar) {
  currentPreviewPlace = lugar.id;
  
  document.getElementById('mfcImage').src = lugar.imagen;
  document.getElementById('mfcTitle').textContent = lugar.nombre;
  document.getElementById('mfcHours').textContent = lugar.horas;
  
  updateFloatingCardBtn();
  
  document.getElementById('mapFloatingCard').classList.add('active');
  mapFullscreen.setView([lugar.lat, lugar.lng]);
}

function hideFloatingCard() {
  document.getElementById('mapFloatingCard').classList.remove('active');
  currentPreviewPlace = null;
}

function updateFloatingCardBtn() {
  if (!currentPreviewPlace) return;
  var isSelected = selectedPlaces.indexOf(currentPreviewPlace) > -1;
  var btn = document.getElementById('mfcBtn');
  
  if (isSelected) {
    btn.className = 'map-floating-card-btn remove';
    btn.innerHTML = 'Quitar de la Ruta';
  } else {
    btn.className = 'map-floating-card-btn add';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Añadir a Ruta';
  }
}

function handleFloatingCardBtn() {
  if (currentPreviewPlace) {
    togglePlaceSelection(currentPreviewPlace);
    updateFullscreenUI();
  }
}

function updateFullscreenUI() {
  var totalHours = selectedPlaces.reduce(function(sum, id) {
    var l = lugares.find(function(x) { return x.id === id; });
    return sum + (l ? l.horas : 0);
  }, 0);
  
  var btnCount = document.getElementById('mapSelectionCountBtn');
  if (btnCount) btnCount.textContent = selectedPlaces.length;
  
  var placesContainer = document.getElementById('mapSelectionPlaces');
  if (placesContainer) {
    if (selectedPlaces.length === 0) {
      placesContainer.innerHTML = '';
    } else {
      var html = '';
      selectedPlaces.forEach(function(id) {
        var l = lugares.find(function(x) { return x.id === id; });
        if (!l) return;
        html += '<div class="map-selection-chip">';
        html += l.nombre;
        html += '<span class="remove" onclick="event.stopPropagation(); togglePlaceSelection(' + l.id + '); updateFullscreenUI();"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>';
        html += '</div>';
      });
      placesContainer.innerHTML = html;
    }
  }
}

// ===== RENDER PLACES CON GALERÍA =====
function renderPlaces() {
  var c = document.getElementById('placesContainer');
  if (!c) return;
  var html = '', gi = 0;
  var catOrder = { "ciudades": 1, "villas": 2, "pueblos": 3, "costa": 4, "naturaleza": 5, "patrimonio": 6, "magicos": 7, "termalismo": 8 };

  bloques.forEach(function(bloque) {
    var arr = lugares.filter(function(l) { return l.bloque === bloque.id; });
    if (!arr.length) return;

    arr.sort(function(a, b) {
      var aVal = catOrder[a.categorias[0]] || 99;
      var bVal = catOrder[b.categorias[0]] || 99;
      return aVal - bVal;
    });

    html += '<div class="bloque-card" id="bloque-' + bloque.id + '">';
    html += '<div class="bloque-header ' + bloque.id + '" onclick="toggleBloque(\'bloque-' + bloque.id + '\')">';
    html += '<div class="bloque-map-sidebar"><div class="bloque-map-mini"><img src="' + bloque.id + '.svg" alt="Mapa" onerror="this.parentElement.parentElement.style.display=\'none\'"></div></div>';
    html += '<div class="bloque-body"><div class="bloque-content-wrapper">';
    html += '<span class="bloque-emoji">' + bloque.emoji + '</span><span class="bloque-nombre">' + bloque.nombre + '</span><span class="bloque-subtitulo">' + bloque.subtitulo + '</span>';
    html += '</div></div>';
    html += '<div class="bloque-actions"><span class="bloque-contador">' + arr.length + '</span><div class="bloque-arrow"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div></div></div>';
    html += '<div class="bloque-content"><div class="bloque-content-inner">';

    arr.forEach(function(l) {
      gi++;
      var isFav = isFavorite(l.id);
      
      html += '<article class="place-card ' + l.bloque + '" id="place-' + l.id + '">';
      
      html += '<div class="place-image-container">';
      html += '<div class="place-image-gallery" onscroll="updateGalleryDots(event, ' + l.id + ')">';
      if (l.imagenes && l.imagenes.length > 0) {
        l.imagenes.forEach(function(imgUrl) {
          html += '<img src="' + imgUrl + '" alt="' + l.nombre + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop\'">';
        });
      } else {
        html += '<img src="' + l.imagen + '" alt="' + l.nombre + '" loading="lazy">';
      }
      html += '</div>';
      
      if (l.imagenes && l.imagenes.length > 1) {
        html += '<div class="gallery-indicators">';
        l.imagenes.forEach(function(_, idx) {
          html += '<div class="gallery-dot ' + (idx === 0 ? 'active' : '') + '"></div>';
        });
        html += '</div>';
      }

      html += '<span class="place-number-badge">' + gi + '</span>';
      html += '<div class="place-title-overlay"><h3 class="place-title">' + l.nombre + '</h3></div>';
      html += '</div>';
      
      html += '<div class="place-header" onclick="togglePlace(\'place-' + l.id + '\')">';
      html += '<div class="place-header-left">';
      l.categorias.forEach(function(catId) {
        html += '<span class="place-category-chip ' + catId + '">' + getCategoryName(catId) + '</span>';
      });
      html += '</div>';
      html += '<div class="place-header-right">';
      html += '<div style="display:flex; gap:4px;">';
      html += '<button class="fav-btn" onclick="event.stopPropagation(); sharePlace(lugares.find(l => l.id === ' + l.id + '))">';
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
      html += '</button>';
      html += '<button class="fav-btn ' + (isFav ? 'active' : '') + '" data-id="' + l.id + '" onclick="event.stopPropagation(); toggleFavorite('
