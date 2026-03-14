/* INCLUYE AQUÍ TODO TU INICIO DE APP.JS (SW, LOGIN, VARIABLES GLOBALES) */

// ===== FUNCIÓN DE PESTAÑAS (Añadida) =====
function switchTab(tabId) {
  // Ocultar todas
  document.getElementById('tab-explorar').classList.remove('active');
  document.getElementById('tab-consejos').classList.remove('active');
  
  // Mostrar la elegida
  document.getElementById('tab-' + tabId).classList.add('active');
  
  // Actualizar menú
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
    if(item.getAttribute('onclick').includes(tabId)) item.classList.add('active');
  });
  window.scrollTo(0,0);
}

// ===== TUS 38 LUGARES (INTEGROS) =====
var lugares = [
  { id: 1, nombre: "Santiago de Compostela", bloque: "acoruna", categorias: ["ciudades", "patrimonio"], horas: 5, imagen: "img/santiago.jpg", lat: 42.8800, lng: -8.5450, porQueVenir: "Fin del Camino...", opinion: "Para nosotros es la ciudad más especial...", imprescindibles: ["Catedral", "Plaza del Obradoiro", "Mercado de Abastos"], comer: "Pulpo en el Mercado.", beber: "Café en Plaza de Cervantes.", secreto: "Jardines de la Universidad.", masTiempo: "Monte do Gozo.", advertencias: "Muchos turistas.", masInfo: "<a href='https://santiagoturismo.com' target='_blank'>Web</a>" },
  // ... PEGA AQUÍ LOS OTROS 37 LUGARES EXACTAMENTE COMO LOS TENÍAS ...
  { id: 38, nombre: "Cíes y Ons", bloque: "pontevedra", categorias: ["naturaleza", "costa"], horas: 6, imagen: "img/ciesyons.jpg", lat: 42.2244, lng: -8.9031, porQueVenir: "Dos archipiélagos protegidos...", opinion: "Escribe aquí tu opinión...", momentoPerfecto: "Junio o septiembre.", imprescindibles: ["Playa de Rodas", "Monte Faro"], comer: "Lleva comida.", beber: "Agua.", secreto: "Playa de Figueiras.", masTiempo: "Camping en Cíes.", advertencias: "Reserva obligatoria.", masInfo: "<a href='#' target='_blank'>Enlace web</a>" }
];

// ===== CORRECCIÓN MAGIA IMÁGENES (Skip Santiago) =====
lugares.forEach(function(l) {
  if (l.imagen) {
    if (!l.imagen.startsWith('img/')) { l.imagen = 'img/' + l.imagen; }
    var puntoIndex = l.imagen.lastIndexOf('.');
    var rutaBase = l.imagen.substring(0, puntoIndex); 
    var extension = l.imagen.substring(puntoIndex);   
    
    l.imagenes = [l.imagen]; // Empezamos con la imagen base
    
    // SI NO ES SANTIAGO (ID 1), intentamos añadir las 5 automáticas
    if (l.id !== 1) {
      for (var i = 1; i <= 5; i++) {
        l.imagenes.push(rutaBase + i + extension);
      }
    }
  }
});

/* AQUÍ SIGUEN TODAS TUS FUNCIONES ORIGINALES:
   initApp(), initMap(), loadFavorites(), toggleFavorite(), 
   renderPlaces(), togglePlaceSelection(), generateItinerary(), etc.
   NO BORRES NADA DE TU LÓGICA DE MAPAS NI FILTROS.
*/
