// ANTÍDOTO CACHÉ
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => { for(let reg of regs) reg.unregister(); });
}

// LOGIN
const CORRECT_PASSWORD = 'caamanho';
document.getElementById('splashForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const val = document.getElementById('passwordInput').value.trim().toLowerCase();
  if (val === CORRECT_PASSWORD) {
    document.getElementById('splashScreen').classList.add('hidden');
    localStorage.setItem('galicia_auth', 'true');
    initApp();
  } else {
    document.getElementById('splashError').textContent = 'Error';
  }
});

// FUNCIÓN PESTAÑAS
function showTab(tabId, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  element.classList.add('active');
  window.scrollTo(0,0);
}

// TUS 38 LUGARES (Recuperados)
const lugares = [
  { id: 1, nombre: "Santiago de Compostela", bloque: "acoruna", categorias: ["ciudades", "patrimonio"], horas: 5, imagen: "img/santiago.jpg", lat: 42.88, lng: -8.54, porQueVenir: "Fin del Camino.", opinion: "Especial.", imprescindibles: ["Catedral"], comer: "Pulpo.", beber: "Vino.", secreto: "Quintana.", masTiempo: "Gozo.", advertencias: "Lluvia.", masInfo: "" },
  { id: 2, nombre: "A Coruña", bloque: "acoruna", categorias: ["ciudades", "costa"], horas: 4, imagen: "img/acoruna.jpg", lat: 43.37, lng: -8.40, porQueVenir: "Ciudad de cristal.", opinion: "Paseo único.", imprescindibles: ["Torre"], comer: "Pescado.", beber: "Estrella.", secreto: "San Pedro.", masTiempo: "Aquarium.", advertencias: "Aire.", masInfo: "" },
  { id: 3, nombre: "Betanzos", bloque: "acoruna", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/betanzos.jpg", lat: 43.28, lng: -8.21, porQueVenir: "Villa medieval.", opinion: "Tortilla increíble.", imprescindibles: ["Plaza Mayor"], comer: "Tortilla.", beber: "Vino.", secreto: "Pasatiempo.", masTiempo: "Río.", advertencias: "Cuestas.", masInfo: "" },
  // ... (Aquí van el resto hasta el 38, asegúrate de mantener tu lista completa aquí)
  { id: 38, nombre: "Cíes y Ons", bloque: "pontevedra", categorias: ["naturaleza", "costa"], horas: 6, imagen: "img/ciesyons.jpg", lat: 42.22, lng: -8.9, porQueVenir: "Paraíso.", opinion: "Aguas cristalinas.", imprescindibles: ["Rodas"], comer: "Bocata.", beber: "Agua.", secreto: "Melide.", masTiempo: "Camping.", advertencias: "Frío.", masInfo: "" }
];

// ARREGLO SANTIAGO (ID 1) Y CARRUSEL
lugares.forEach(l => {
  if (l.imagen) {
    var puntoIndex = l.imagen.lastIndexOf('.');
    var rutaBase = l.imagen.substring(0, puntoIndex); 
    var extension = l.imagen.substring(puntoIndex);   
    l.imagenes = [l.imagen]; // Empezamos con la principal
    
    // SI NO ES SANTIAGO (ID 1), añadimos las 5 fotos extra
    if (l.id !== 1) {
      for (var i = 1; i <= 5; i++) {
        l.imagenes.push(rutaBase + i + extension);
      }
    }
    // Santiago se queda solo con la original
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
        <div class="place-image-container"><img src="${l.imagen}"></div>
        <div style="padding:20px;">
          <h3 style="font-family:'Cormorant Garamond'; font-size:1.7rem;">${l.nombre}</h3>
          <p class="info-text">${l.porQueVenir}</p>
          <div style="margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
            <p class="info-text" style="font-style:italic;">"${l.opinion}"</p>
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
