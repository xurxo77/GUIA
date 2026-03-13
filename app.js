id + ')"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>';
      html += '</div></div></div>';

      html += '<div class="place-details">';
      html += '<div class="place-stats">';
      html += '<div class="stat"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ' + l.horas + ' h</div>';
      html += '<div class="stat"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + bloque.nombreCorto + '</div>';
      html += '</div>';

      html += '<div class="place-info-grid">';
      html += '<div class="info-item"><div class="info-label">Por qué venir</div><div class="info-value">' + l.porQueVenir + '</div></div>';
      html += '<div class="info-item"><div class="info-label">Mi opinión</div><div class="info-value"><em>"' + l.opinion + '"</em></div></div>';
      html += '<div class="info-item"><div class="info-label">Imprescindibles</div><div class="info-value"><ul class="bullet-list">';
      l.imprescindibles.forEach(function(imp) { html += '<li>' + imp + '</li>'; });
      html += '</ul></div></div>';
      html += '</div>';

      html += '<div class="accordion-container">';
      html += '<div class="accordion-item">';
      html += '<button class="accordion-header" onclick="toggleAccordion(this)"><span>Gastronomía y Secretos</span><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>';
      html += '<div class="accordion-content"><div class="accordion-content-inner">';
      html += '<div class="info-grid-2">';
      html += '<div class="info-item"><div class="info-label">Dónde comer</div><div class="info-value">' + l.comer + '</div></div>';
      html += '<div class="info-item"><div class="info-label">Dónde beber</div><div class="info-value">' + l.beber + '</div></div>';
      html += '<div class="info-item"><div class="info-label">Secreto</div><div class="info-value">' + l.secreto + '</div></div>';
      html += '<div class="info-item"><div class="info-label">Advertencia</div><div class="info-value">' + l.advertencias + '</div></div>';
      html += '</div></div></div></div>';
      html += '</div>';

      html += '<div class="place-actions">';
      html += '<button class="btn-outline" onclick="openMapApp(' + l.lat + ', ' + l.lng + ')"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> Cómo llegar</button>';
      html += '<button class="btn-primary" onclick="togglePlaceSelection(' + l.id + ')">';
      var isSel = selectedPlaces.indexOf(l.id) > -1;
      html += isSel ? 'Quitar de la Ruta' : 'Añadir a Ruta';
      html += '</button>';
      html += '</div>';

      html += '</div></article>';
    });
    html += '</div></div></div>';
  });
  c.innerHTML = html;
}

function updateGalleryDots(event, placeId) {
  var gallery = event.target;
  var scrollLeft = gallery.scrollLeft;
  var width = gallery.clientWidth;
  var index = Math.round(scrollLeft / width);
  
  var placeEl = document.getElementById('place-' + placeId);
  if (!placeEl) return;
  
  var dots = placeEl.querySelectorAll('.gallery-dot');
  if (dots.length > 0 && index >= 0 && index < dots.length) {
    dots.forEach(function(dot) { dot.classList.remove('active'); });
    dots[index].classList.add('active');
  }
}

function toggleBloque(id) {
  var b = document.getElementById(id);
  if (b.classList.contains('open')) {
    b.classList.remove('open');
  } else {
    b.classList.add('open');
  }
}

function togglePlace(id) {
  var p = document.getElementById(id);
  if (p.classList.contains('expanded')) {
    p.classList.remove('expanded');
  } else {
    document.querySelectorAll('.place-card.expanded').forEach(function(el) {
      el.classList.remove('expanded');
    });
    p.classList.add('expanded');
    p.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ===== BUSCADOR =====
function initSearch() {
  var input = document.getElementById('searchInput');
  if (!input) return;
  
  input.addEventListener('input', function(e) {
    var val = e.target.value.toLowerCase().trim();
    
    if (val === '') {
      document.querySelectorAll('.bloque-card').forEach(function(b) { b.style.display = 'block'; });
      document.querySelectorAll('.place-card').forEach(function(p) { p.style.display = 'block'; });
      return;
    }
    
    bloques.forEach(function(bloque) {
      var bloqueEl = document.getElementById('bloque-' + bloque.id);
      if (!bloqueEl) return;
      
      var matchBloque = false;
      var lugaresBloque = lugares.filter(function(l) { return l.bloque === bloque.id; });
      
      lugaresBloque.forEach(function(l) {
        var placeEl = document.getElementById('place-' + l.id);
        if (!placeEl) return;
        
        var text = (l.nombre + ' ' + l.porQueVenir + ' ' + l.imprescindibles.join(' ')).toLowerCase();
        if (text.includes(val)) {
          placeEl.style.display = 'block';
          matchBloque = true;
        } else {
          placeEl.style.display = 'none';
        }
      });
      
      if (matchBloque) {
        bloqueEl.style.display = 'block';
        bloqueEl.classList.add('open');
      } else {
        bloqueEl.style.display = 'none';
      }
    });
  });
}

// ===== UTILIDADES =====
function openMapApp(lat, lng) {
  var url = '';
  if ((navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPad") != -1) || (navigator.platform.indexOf("iPod") != -1)) {
    url = 'maps://maps.apple.com/?q=' + lat + ',' + lng;
  } else {
    url = 'https://maps.google.com/?q=' + lat + ',' + lng;
  }
  window.open(url, '_blank');
}

function sharePlace(lugar) {
  if (navigator.share) {
    navigator.share({
      title: lugar.nombre,
      text: 'Mira este lugar en Galicia: ' + lugar.nombre + '. ' + lugar.porQueVenir,
      url: window.location.href
    }).catch(function(error) { console.log('Error compartiendo', error); });
  } else {
    alert('Tu navegador no soporta compartir directamente.');
  }
}

function generateItinerary() {
  if (selectedPlaces.length === 0) {
    alert('Selecciona algún lugar primero.');
    return;
  }
  alert('Función de generar PDF o enlace de ruta en desarrollo.');
}

function initAnimations() {
  document.body.classList.add('loaded');
}
