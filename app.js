// ANTÍDOTO CACHÉ
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    for(let reg of regs) reg.unregister();
  });
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
  } else {
    alert('Contraseña incorrecta');
  }
});

// NAVEGACIÓN ENTRE PESTAÑAS
function switchTab(tabId) {
  const explorar = document.getElementById('explorar-section');
  const recomendaciones = document.getElementById('recomendaciones-section');
  const menuItems = document.querySelectorAll('.menu-item');

  menuItems.forEach(item => {
    item.classList.remove('active');
    if(item.getAttribute('onclick').includes(tabId)) item.classList.add('active');
  });

  if (tabId === 'explorar') {
    explorar.style.display = 'block';
    recomendaciones.style.display = 'none';
  } else {
    explorar.style.display = 'none';
    recomendaciones.style.display = 'block';
  }
  window.scrollTo(0,0);
}

function toggleAccordion(el) {
  el.classList.toggle('active');
}

// DATOS (Santiago con 1 sola foto)
const lugares = [
  { 
    id: 1, 
    nombre: "Santiago de Compostela", 
    bloque: "acoruna", 
    categorias: ["ciudades", "patrimonio"], 
    horas: 5, 
    imagen: "img/santiago.jpg", // Solo una foto
    lat: 42.8800, lng: -8.5450, 
    porQueVenir: "Fin del Camino. Ciudad monumental y viva.",
    opinion: "Nuestra favorita. Piérdete por sus calles de piedra mojada.",
    imprescindibles: ["Catedral", "Mercado de Abastos", "Parque de la Alameda"],
    comer: "Pulpo en el Franco.",
    beber: "Vino blanco en tazas.",
    secreto: "La sombra del peregrino en Quintana.",
    advertencias: "Suele llover, lleva paraguas."
  }
  // ... añade el resto de lugares aquí siguiendo este formato
];

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
        <div class="place-image-container">
          <img src="${l.imagen}" alt="${l.nombre}">
        </div>
        <div style="padding: 20px;">
          <h3 style="margin-bottom:10px;">${l.nombre}</h3>
          <p class="info-text">${l.porQueVenir}</p>
          <div style="margin-top:15px;">
            <button class="geo-btn" onclick="toggleFavorite(${l.id})">❤ Favorito</button>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function initMap() {
  const map = L.map('map').setView([42.8, -8.4], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  lugares.forEach(l => {
    L.marker([l.lat, l.lng]).addTo(map).bindPopup(l.nombre);
  });
}

// Cargar al inicio si ya está autenticado
if (localStorage.getItem('galicia_auth') === 'true') {
  document.getElementById('splashScreen').classList.add('hidden');
  initApp();
}
