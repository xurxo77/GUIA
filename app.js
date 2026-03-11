// ===== MAPA NORMAL =====
function initMap() {
  var mapEl = document.getElementById('map');
  if (!mapEl) return;
  
  // 1. Inicializamos el mapa con TODAS las interacciones bloqueadas
  map = L.map('map', { 
    zoomControl: false,       // Quita los botones de + y -
    dragging: false,          // Impide arrastrar con el dedo o ratón
    touchZoom: false,         // Impide hacer zoom pellizcando
    scrollWheelZoom: false,   // Impide el zoom con la rueda del ratón
    doubleClickZoom: false,   // Impide zoom con doble clic
    boxZoom: false,
    keyboard: false
  });
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
    attribution: '', 
    maxZoom: 18 
  }).addTo(map);
  
  // Array para guardar todas las coordenadas y encuadrar la vista
  var mapBounds = [];

  lugares.forEach(function(l, i) {
    if (!l.lat || !l.lng) return;
    
    // Añadimos las coordenadas al array de límites
    mapBounds.push([l.lat, l.lng]);

    var m = L.marker([l.lat, l.lng], {
      icon: L.divIcon({
        className: 'custom-marker ' + l.bloque,
        html: '<span>' + (i+1) + '</span>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      }),
      interactive: false // Evita que el marcador robe el clic al mapa
    }).addTo(map);
    
    markers[l.id] = m;
  });

  // 2. Encuadramos matemáticamente toda Galicia en la caja
  if (mapBounds.length > 0) {
    map.fitBounds(mapBounds, { padding: [15, 15] });
  }

  // 3. Hacemos que la caja parezca un botón
  mapEl.style.cursor = 'pointer';

  // 4. Cualquier clic o toque en esta caja abre el mapa en grande
  map.on('click', function() {
    openFullscreenMap();
  });
}
