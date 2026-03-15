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
    content.innerHTML = '<div class="selection-empty">Toca puntos en el mapa o usa la lista</div>';
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
    html += '<button class="btn-secondary" onclick="clearSelection()"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Limpiar selección</button>';
    html += '</div>';
    content.innerHTML = html;
  }
} // <--- ESTA ES LA LLAVE QUE FALTABA
