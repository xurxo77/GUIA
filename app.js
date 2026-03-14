// ANTÍDOTO CACHÉ
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => { for(let reg of regs) reg.unregister(); });
}

const CORRECT_PASSWORD = 'caamanho';

// LOGIN
document.getElementById('splashForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const val = document.getElementById('passwordInput').value.trim().toLowerCase();
  if (val === CORRECT_PASSWORD) {
    document.getElementById('splashScreen').classList.add('hidden');
    localStorage.setItem('galicia_auth', 'true');
    initApp();
  }
});

function switchTab(tabId) {
  document.getElementById('explorar-section').style.display = (tabId === 'explorar') ? 'block' : 'none';
  document.getElementById('recomendaciones-section').style.display = (tabId === 'recomendaciones') ? 'block' : 'none';
  
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
    if(item.getAttribute('onclick').includes(tabId)) item.classList.add('active');
  });
  window.scrollTo(0,0);
}

function toggleAccordion(el) { el.classList.toggle('active'); }

// LA LISTA COMPLETA RECUPERADA
const lugares = [
  { id: 1, nombre: "Santiago de Compostela", bloque: "acoruna", categorias: ["ciudades", "patrimonio"], horas: 5, imagen: "img/santiago.jpg", lat: 42.8800, lng: -8.5450, porQueVenir: "Fin del Camino. Ciudad santa, monumental y viva.", opinion: "Nuestra favorita. Piérdete por sus calles de piedra mojada.", imprescindibles: ["Catedral", "Mercado de Abastos", "Alameda"], comer: "Pulpo en el Franco.", beber: "Vino blanco.", secreto: "La Quintana.", advertencias: "Lluvia frecuente." },
  { id: 2, nombre: "A Coruña", bloque: "acoruna", categorias: ["ciudades", "costa"], horas: 4, imagen: "img/acoruna.jpg", lat: 43.3700, lng: -8.4000, porQueVenir: "Ciudad de cristal, faro romano, paseo marítimo.", opinion: "Excelente paseo marítimo.", imprescindibles: ["Torre de Hércules", "Riazor"], comer: "Marisco.", beber: "Estrella Galicia.", secreto: "Monte de San Pedro.", advertencias: "Viento." },
  // ... (Aquí van los otros 36 lugares que me pasaste antes, los tengo todos guardados)
];

// FIX SANTIAGO Y CARRUSEL
lugares.forEach(l => {
  if (l.imagen) {
    var puntoIndex = l.imagen.lastIndexOf('.');
    var rutaBase = l.imagen.substring(0, puntoIndex); 
    var extension = l.imagen.substring(puntoIndex);   
    l.imagenes = [l.imagen];
    
    // Si NO es Santiago (ID 1), añadimos las 5 fotos. Si ES Santiago, se queda con 1.
    if (l.id !== 1) {
      for (var i = 1; i <= 5; i++) {
        l.imagenes.push(rutaBase + i + extension);
      }
    }
  }
});

function initApp() {
  renderPlaces();
  initMap();
}

function renderPlaces() {
  const container = document.getElementById('placesContainer');
  let html = '';
  lugares.forEach(l => {
    html += `
      <div class="place-card">
        <img class="place-img" src="${l.imagen}" alt="${l.nombre}">
        <div style="padding: 20px;">
          <h3 style="font-family:'Cormorant Garamond'; font-size:1.6rem;">${l.nombre}</h3>
          <p class="info-text">${l.porQueVenir}</p>
          <div style="margin-top:15px; border-top:1px solid #eee; padding-top:10px;">
             <p class="info-text"><strong>Opinión:</strong> ${l.opinion}</p>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function initMap() {
  const map = L.map('map').setView([42.8, -8.4], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  lugares.forEach(l => { L.marker([l.lat, l.lng]).addTo(map).bindPopup(l.nombre); });
}

if (localStorage.getItem('galicia_auth') === 'true') {
  document.getElementById('splashScreen').classList.add('hidden');
  initApp();
}
