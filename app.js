// ================================================================
// GALICIA APP — JAVASCRIPT COMPLETO CORREGIDO 2025
// PWA Moderna + MD3 Expressive + Flujo de Auth Arreglado
// ================================================================

'use strict';

// ── CONFIGURACIÓN GLOBAL ───────────────────────────────────────
const CONFIG = {
  VERSION: '2025.3.28',
  CACHE_NAME: 'galicia-guide-v2',
  PASSWORD: 'caamaño',
  ANIMATION_DURATION: 350,
  DEBOUNCE_DELAY: 150,
  MAP_ZOOM_DEFAULT: 7,
  MAP_CENTER: [42.6, -8.4],
  TOTAL_SABIAS_QUE: 4000, // Reducido a 4 segundos
  TEXT_FADE_AT: 3500
};

// ── ESTADO GLOBAL ─────────────────────────────────────────────
const state = {
  mainMap: null,
  fsMap: null,
  markers: {},
  fullscreenMarkers: {},
  userLocation: null,
  userMarker: null,
  selectedPlaces: [],
  favorites: [],
  currentSection: 'hero',
  isOnline: navigator.onLine,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  appInitialized: false // Flag crítico para evitar doble inicialización
};

// ── DATOS ─────────────────────────────────────────────────────
const bloques = [
  { id: "acoruna", nombre: "A Coruña", nombreCorto: "A Coruña", subtitulo: "Costa da Morte, Ártabro, Santiago...", emoji: "🌊" },
  { id: "lugo", nombre: "Lugo", nombreCorto: "Lugo", subtitulo: "Rías Altas, Os Ancares...", emoji: "🌲" },
  { id: "ourense", nombre: "Ourense", nombreCorto: "Ourense", subtitulo: "Ribeira Sacra, Cañón del Sil...", emoji: "🏔️" },
  { id: "pontevedra", nombre: "Pontevedra", nombreCorto: "Pontevedra", subtitulo: "Rías Baixas, Cíes, Ons...", emoji: "🌅" }
];

const categorias = [
  { id: "ciudades", nombre: "Ciudades", nombreCorto: "Ciudad", emoji: "🏛️" },
  { id: "villas", nombre: "Villas", nombreCorto: "Villa", emoji: "🏘️" },
  { id: "pueblos", nombre: "Pueblos", nombreCorto: "Pueblo", emoji: "⚓" },
  { id: "costa", nombre: "Costa", nombreCorto: "Costa", emoji: "🏖️" },
  { id: "naturaleza", nombre: "Naturaleza", nombreCorto: "Naturaleza", emoji: "🌿" },
  { id: "patrimonio", nombre: "Patrimonio", nombreCorto: "Patrimonio", emoji: "🏰" },
  { id: "magicos", nombre: "Mágicos", nombreCorto: "Mágico", emoji: "✨" },
  { id: "termalismo", nombre: "Termalismo", nombreCorto: "Termalismo", emoji: "♨️" }
];

const curiosidades = [
  "<strong>La diáspora gallega es uno de los movimientos migratorios más grandes de Europa.</strong> Se calcula que, entre finales del siglo XIX y el siglo XX, más de 2 millones de gallegos emigraron, sobre todo a países como Argentina, Cuba y Uruguay.<br><br>👉 Hoy, hay casi tantos descendientes de gallegos fuera como en la propia Galicia.",
  
  "<strong>Galicia no solo tiene más de 1.000 ríos, sino que es una potencia en producción de energía eléctrica.</strong> En 2024, generó más de 23.000 GWh de electricidad, gran parte con energías limpias como la hidráulica, eólica y solar.<br><br>👉 Aproximadamente el 40% de esa energía sobrante se exportó a otras partes de España y Europa.",
  
  "<strong>Galicia fue uno de los primeros reinos de Europa.</strong> Tras la caída del Imperio Romano, en el siglo V, Galicia se consolidó como el Reino de los Suevos.<br><br>👉 Se convirtió en uno de los primeros reinos establecidos en toda Europa occidental.",
  
  "<strong>Galicia mantiene huellas vivas de su cultura celta.</strong> Los antiguos castros de piedra, la música con gaitas y muchas de sus tradiciones y leyendas populares reflejan la herencia celta que aún late en nuestra tierra.",

  "<strong>Para los romanos, Galicia era el literal 'Fin del Mundo'.</strong> Al llegar a Fisterra (Finis Terrae) y ver el sol hundirse en el océano, las legiones romanas creían que el mar hervía y no había nada más allá.<br><br>👉 Hoy es el final épico para muchos peregrinos del Camino de Santiago.",

  "<strong>Breogán aparece en el Lebor Gabála Érenn.</strong> Este texto medieval irlandés cuenta cómo Breogán levantó una gran torre en Galicia desde la que sus descendientes vieron Irlanda, iniciando su viaje hacia la isla.<br><br>👉 La tradición sitúa esa torre en la actual Torre de Hércules, reforzando el vínculo mítico entre Galicia e Irlanda.",

  "<strong>Ourense es una de las capitales termales de Europa.</strong> Solo Budapest la supera en volumen de aguas termales. De la fuente de As Burgas, en pleno centro, el agua sale humeando a más de 60ºC.<br><br>👉 Puedes bañarte gratis en pozas naturales a orillas del río Miño, incluso en pleno invierno.",

  "<strong>El gallego y el portugués nacieron exactamente del mismo idioma.</strong> Durante la Edad Media, el galaico-portugués era la lengua de la poesía y el romance en toda la Península Ibérica.<br><br>👉 Por eso, si hablas gallego, puedes entenderte casi a la perfección con alguien en Portugal o Brasil.",

  "<strong>Galicia está llena de 'hórreos', las despensas mágicas de piedra y madera.</strong> Hay más de 30.000 repartidos por la comunidad, diseñados para guardar el grano lejos de la humedad y los roedores.<br><br>👉 El hórreo de Carnota mide casi 35 metros de largo. ¡Es más grande que muchas casas!",

  "<strong>Cuidado con pasear de noche por los bosques: podrías cruzarte con la Santa Compaña.</strong> La leyenda gallega más famosa habla de una procesión de almas en pena que vagan en la oscuridad.<br><br>👉 Dicen que huele a cera quemada a su paso, y no debes mirarles directamente si no quieres unirte a ellos.",

  "<strong>Galicia fue refugio durante la última glaciación.</strong> Su clima más suave permitió que muchísimas especies animales y vegetales sobrevivieran aquí.<br><br>👉 Mientras gran parte de Europa quedaba completamente congelada, esta tierra fue un auténtico santuario de vida.",

  "<strong>El \u00abverde gallego\u00bb no es tan natural como parece.</strong> Gran parte del paisaje está ocupado por eucaliptos, una especie introducida de crecimiento rápido.<br><br>👉 Aunque a la vista resulte frondoso, este árbol desplaza al bosque autóctono y altera el equilibrio natural de la tierra.",

  "<strong>Los gaiteiros fueron durante siglos los músicos del pueblo.</strong> Recorrían aldeas tocando en romerías y marcaban el ritmo social de la comunidad, desde bodas hasta procesiones.<br><br>👉 Con el tiempo, pasaron de ser músicos populares a convertirse en símbolos absolutos de la cultura gallega.",

  "<strong>Los marinos gallegos fueron clave en la expansión marítima española.</strong> Durante siglos, formaron parte de grandes expediciones y rutas comerciales, curtidos por su experiencia en el duro Atlántico.<br><br>👉 No es casualidad: Galicia ha vivido siempre de cara al mar, y esa tradición sigue presente hoy en su forma de entender la vida.",

  "<strong>Rosalía de Castro dio voz a Galicia cuando casi nadie la escuchaba.</strong> En el siglo XIX, fue una de las primeras autoras en escribir en gallego tras siglos de abandono, dignificando la lengua y reflejando la morriña de su pueblo.<br><br>👉 Su inmensa obra marcó el inicio del Rexurdimento y la convirtió en el pilar fundamental de nuestra identidad cultural."
];

// Lugares (array completo - mantén todos tus lugares aquí)
const lugares = [
{ 
    id: 1, 
    nombre: "Santiago de Compostela", 
    bloque: "acoruna", 
    categorias: ["ciudades", "patrimonio"], 
    horas: 5, 
    imagen: "img/santiago.jpg", 
    lat: 42.8800, 
    lng: -8.5450, 
    
    porQueVenir: "Santiago es el corazón cultural de Galicia. Más que una ciudad monumental, es un lugar vivido: piedra, historia y ambiente constante. Es el final del Camino, pero también un sitio al que siempre apetece volver.", 
    momentoPerfecto: "A cualquier hora, pero especialmente al atardecer, cuando la luz cae sobre la piedra y la ciudad se vuelve más tranquila. Con lluvia también tiene su encanto.", 
    
    imprescindibles: [
      "<strong>Catedral de Santiago</strong>", 
      "<strong>Plaza del Obradoiro</strong>", 
      "<strong>Casco histórico:</strong> perderse es obligatorio.",
      "<strong>Mercado de Abastos</strong>"
    ], 
    
    comer: "Pulpo, empanada, marisco y producto gallego en general. Zonas recomendadas: Rúa do Franco y Rúa de San Pedro.", 
    tomar: "Vino gallego (albariño, ribeiro) o cerveza (Estrella Galicia).",
    
    secreto: "Además de perderse por el casco histórico, si tienes tiempo merece mucho la pena salir un poco del centro y recorrer los paseos fluviales del río Sar. Es un sitio muy local, tranquilo y diferente, ideal si ya has visto lo principal y te quedas varios días.", 
    
    masTiempo: [
      "<strong>Noia</strong>",
      "<strong>Padrón</strong>",
      "<strong>Excursiones en tren:</strong> a A Coruña o Vigo (rápidas y cómodas, con llegada directa al centro)."
    ], 
    
    advertencias: [
      "Mucho turismo en temporada alta.",
      "Lluvia frecuente.",
      "Precios más altos en el centro."
    ],
    
    miOpinion: "Santiago es, en el fondo, una aldea grande. Probablemente la aldea más grande de Europa. Es pequeña, pero tiene ese aire de capital que la hace especial. Es una ciudad de piedra, con siglos de historia, muy viva y siempre con gente. Estudiantil, dinámica y acogedora. Y lo mejor: por muchas veces que pasees por ella, siempre acabas descubriendo algo nuevo."},  
{ 
    id: 2, 
    nombre: "A Coruña", 
    bloque: "acoruna", 
    categorias: ["ciudades", "costa"], 
    horas: 4, 
    imagen: "img/acoruna.jpg", 
    lat: 43.3700, 
    lng: -8.4000, 
    
    porQueVenir: "A Coruña combina ciudad y mar como pocas. Rascacielos frente a playas, historia en cada esquina y un paseo marítimo que es de los más largos de Europa. Ciudad viva, siempre con gente en movimiento, mercados, cafés y tiendas. Conocida como la \"Ciudad de Cristal\", destaca por sus galerías acristaladas de la Marina, diseñadas para captar luz y calor, formando uno de los conjuntos acristalados más extensos del mundo. Además, hay un toque de rivalidad con otras ciudades gallegas, especialmente Vigo y Santiago, que se percibe tanto en lo cultural como en lo deportivo (Dépor vs. Celta) y en debates sobre calidad de vida.", 
    
    momentoPerfecto: "Por la mañana en el casco histórico para ver la Plaza de María Pita y la Torre de Hércules, o al atardecer para pasear por el paseo marítimo y disfrutar de la luz sobre el Atlántico.", 
    
    imprescindibles: [
      "<strong>Torre de Hércules:</strong> faro romano en funcionamiento más antiguo del mundo, Patrimonio de la Humanidad.",
      "<strong>Plaza de María Pita:</strong> centro histórico con bares y ambiente constante.",
      "<strong>Casco viejo:</strong> calles empedradas, plazas escondidas y esencia local.",
      "<strong>Paseo marítimo:</strong> el más largo de Europa, ideal para caminatas atlánticas.",
      "<strong>Museo de Bellas Artes y Domus:</strong> historia y ciencia al alcance de todos."
    ], 
    
    comer: "Marisco, pescado fresco y tapas gallegas.<br><br><strong>Zonas recomendadas:</strong><br>• <strong>Zona de Vinos (Calles Galera, Barrera y Estrella):</strong> tapeo por excelencia.<br>• <strong>Ciudad Vieja y Plaza de María Pita:</strong> mesones tradicionales y restaurantes de producto de alta calidad.<br>• <strong>Monte de San Pedro:</strong> comer con vistas panorámicas de la ciudad y el Atlántico.<br>• <strong>Cuatro Caminos y Ensanche:</strong> zonas más comerciales y residenciales con oferta variada.<br>• <strong>Matogrande:</strong> centro de negocios, opciones modernas y rápidas.", 
    
    tomar: "Estrella Galicia, albariño o ribeiro según acompañamiento.",
    
    secreto: "<strong>Paseo marítimo hasta Orzán y Riazor:</strong> kilómetros de costa urbana que pocos turistas aprovechan del todo.<br><br><strong>Miradores del Monte de San Pedro:</strong> vistas panorámicas increíbles y jardines poco conocidos.", 
    
    masTiempo: [
      "<strong>Excursión rápida a Betanzos:</strong> villa medieval cercana.",
      "<strong>Costa da Morte:</strong> paisaje salvaje y natural."
    ], 
    
    planLluvia: [
      "<strong>Museo de Bellas Artes y Domus:</strong> historia y ciencia al alcance de todos.",
      "<strong>Museo de las Ciencias:</strong> exposiciones interactivas y aprendizaje para todas las edades.",
      "<strong>Aquarium Finisterrae:</strong> vida marina y experiencias atlánticas sin mojarse."
    ],
    
    advertencias: [
      "Ciudad húmeda y ventosa, sobre todo en invierno.",
      "Aparcar en el centro puede ser un reto.",
      "Playas urbanas con oleaje: precaución."
    ],
    
    miOpinion: "A Coruña es energía pura: ciudad activa, atlántica y viva, con un carácter señorial muy marcado. Mezcla perfecta de ciudad y playa, historia y modernidad. Sus galerías acristaladas, la Torre de Hércules y su paseo marítimo la convierten en única. La zona del puerto es fantástica para pasear y descubrir la vida local. Y si te quedas sin planes, o eres fanático de la Estrella Galicia, visitar su museo merece la pena. Cada esquina tiene algo que descubrir, y pese a la rivalidad cultural con Vigo o Santiago, nadie duda de su carácter especial como capital atlántica gallega."
  },  { id: 3, nombre: "Betanzos", bloque: "acoruna", categorias: ["villas", "patrimonio"], horas: 2, imagen: "img/betanzos.jpg", lat: 43.2833, lng: -8.2167, porQueVenir: "Villa medieval con casco histórico.", momentoPerfecto: "Mañana.", imprescindibles: ["Plaza Mayor", "Iglesia de Santa María", "Murallas"], comer: "Tortilla de Betanzos.", tomar: "Vino de la tierra.", secreto: "Jardines del Pasatiempo.", masTiempo: "Paseo por el río.", advertencias: "Fuertes pendientes." },
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
{ 
    id: 29, 
    nombre: "Vigo", 
    bloque: "pontevedra", 
    categorias: ["ciudades", "costa"], 
    horas: 4, 
    imagen: "img/vigo.jpg", 
    lat: 42.2406, 
    lng: -8.7207, 
    
    porQueVenir: "Vigo es una ciudad dinámica y abierta al Atlántico, famosa por su puerto pesquero, su ría y su proximidad a playas espectaculares. Combina zonas señoriales y barrios históricos con parques, miradores y una gastronomía reconocida, especialmente en marisco y pescado fresco. Además, es un punto estratégico cercano a las Islas Cíes y a Portugal, lo que le da un valor añadido.", 
    
    momentoPerfecto: "Por la mañana para recorrer el casco histórico y los miradores, o al atardecer para disfrutar de la ría y de los atardeceres sobre las Islas Cíes.", 
    
    imprescindibles: [
      "<strong>Casco Vello:</strong> calles estrechas, plazas y ambiente tradicional.",
      "<strong>Puerto y Ría de Vigo:</strong> paseos marítimos y actividad portuaria, corazón de la ciudad.",
      "<strong>Islas Cíes:</strong> parque natural, playas de arena blanca y aguas cristalinas (accesibles en barco).",
      "<strong>Parque de Castrelos:</strong> jardines históricos y espacios verdes para pasear.",
      "<strong>Miradores:</strong> O Castro y Monte Alba, con vistas panorámicas de la ciudad y la ría."
    ], 
    
    comer: "Marisco, pescado fresco, ostras, tapas y torta de nata.<br><br><strong>Zonas recomendadas:</strong><br>• <strong>Casco Vello:</strong> tradición y ambiente local.<br>• <strong>Puerto y Paseo Marítimo:</strong> restaurantes con vistas a la ría y la actividad portuaria.<br>• <strong>Bouzas y Coia:</strong> barrios tranquilos con oferta gastronómica cercana a playas.<br>• <strong>Príncipe y centro comercial:</strong> zonas modernas con bares de tapas y locales de moda.", 
    
    tomar: "Vinos gallegos (albariño, ribeiro) y cervezas locales; ambiente animado en los bares del centro y la zona portuaria.",
    
    secreto: "<strong>Paseo de la Playa de Samil:</strong> kilómetros de costa urbana con parques, pistas deportivas y vistas a las Cíes.<br><br><strong>Miradores de O Castro y Monte Alba:</strong> panorámicas espectaculares de la ciudad y la ría.<br><br><strong>Rutas por barrios menos turísticos:</strong> como Bouzas y Coia, para conocer el auténtico ambiente local.", 
    
    masTiempo: [
      "<strong>Excursión rápida a las Islas Cíes:</strong> playas vírgenes y senderos naturales.",
      "<strong>Ruta por la Ría de Vigo:</strong> ferry o paseo en barco para conocer la ciudad desde el mar."
    ], 
    
    planLluvia: [
      "<strong>Museo del Mar de Galicia:</strong> historia marítima y vida atlántica.",
      "<strong>Museo Quiñones de León:</strong> arte, historia y jardines cubiertos.",
      "<strong>Centros comerciales:</strong> o paseos por el casco histórico cubierto."
    ],
    
    advertencias: [
      "Ciudad con muchas cuestas y desniveles; prepárate para caminar.",
      "Aparcar en el centro puede ser difícil.",
      "Algunas playas son urbanas, precaución con el oleaje."
    ],
    
    miOpinion: "Vigo es una ciudad vibrante y llena de energía, hasta en el tráfico. Combina su carácter portuario con zonas señoriales, parques, miradores y playas de primer nivel. Tiene ese microclima propio de las Rías Baixas, y si vienes en invierno no te pierdas sus famosas luces de Navidad: son tan espectaculares que merece la pena traerse gafas de sol para contemplarlas.<br><br>El puerto y el paseo marítimo son fantásticos para pasear y empaparse del ambiente local. Vigo destaca por su ocio nocturno activo y una oferta cultural de primer nivel. Además, su cercanía a las Islas Cíes y a Portugal añade un valor extra. La ría de Vigo es preciosa, y las vistas del puente de Rande o del Lazareto de San Simón son simplemente impresionantes. Si eres amante del marisco y la vida atlántica, Vigo es un destino que no puedes perderte."
  },  { id: 30, nombre: "Pontevedra", bloque: "pontevedra", categorias: ["ciudades"], horas: 3, imagen: "img/pontevedra.jpg", lat: 42.4333, lng: -8.6333, porQueVenir: "Ciudad amable con el peatón.", momentoPerfecto: "Tarde para cenar.", imprescindibles: ["Plaza da Ferrería", "Peregrina", "Callejear sin mapa"], comer: "Tabernas en calles estrechas.", tomar: "Vino de la casa.", secreto: "Convento de San Francisco.", masTiempo: "Paseo a la ría.", advertencias: "Muy segura." },
  { id: 31, nombre: "Tui", bloque: "pontevedra", categorias: ["villas", "patrimonio"], horas: 3, imagen: "img/tui.jpg", lat: 42.0500, lng: -8.6333, porQueVenir: "Ciudad episcopal, frontera con Portugal.", momentoPerfecto: "Tarde.", imprescindibles: ["Catedral", "Casco histórico", "Mirador del Miño"], comer: "Marisco.", tomar: "Albariño.", secreto: "Paseo hasta Portugal.", masTiempo: "Valença.", advertencias: "Lluvia frecuente." },
  { id: 32, nombre: "Cambados", bloque: "pontevedra", categorias: ["villas"], horas: 3, imagen: "img/cambados.jpg", lat: 42.5167, lng: -8.8167, porQueVenir: "Capital del Albariño.", momentoPerfecto: "Fiesta del Albariño.", imprescindibles: ["Pazo de Fefiñáns", "Casco histórico", "Bodegas"], comer: "Marisco.", tomar: "Albariño.", secreto: "Playa de la Lajinha.", masTiempo: "Playa fluvial.", advertencias: "Agosto lleno." },
  { id: 33, nombre: "Baiona", bloque: "pontevedra", categorias: ["pueblos", "costa"], horas: 3, imagen: "img/baiona.jpg", lat: 42.1167, lng: -8.8500, porQueVenir: "Primer puerto en recibir la noticia del Nuevo Mundo.", momentoPerfecto: "Verano.", imprescindibles: ["Fortaleza", "Puerto", "Playa"], comer: "Marisco.", tomar: "Albariño.", secreto: "Arribada.", masTiempo: "Islas Cíes.", advertencias: "Lleno en verano." },
  { id: 34, nombre: "Combarro", bloque: "pontevedra", categorias: ["pueblos"], horas: 2, imagen: "img/combarro.jpg", lat: 42.3833, lng: -8.7167, porQueVenir: "Hórreos sobre el mar.", momentoPerfecto: "Atardecer.", imprescindibles: ["Hórreos", "Paseo marítimo", "Puerto"], comer: "Marisco.", tomar: "Albariño.", secreto: "Noche.", masTiempo: "Poio.", advertencias: "Muy turístico." },
  { id: 35, nombre: "O Grove", bloque: "pontevedra", categorias: ["costa"], horas: 4, imagen: "img/ogrove.jpg", lat: 42.3881, lng: -8.8833, porQueVenir: "Paraíso del marisco.", momentoPerfecto: "Verano.", imprescindibles: ["Playa de la Lanzada", "Marisquerías", "Paseo"], comer: "Marisco.", tomar: "Albariño.", secreto: "La Toxa.", masTiempo: "Isla de Ons.", advertencias: "Muy concurrido." },
  { id: 36, nombre: "A Illa de Arousa", bloque: "pontevedra", categorias: ["costa"], horas: 3, imagen: "img/arousa.jpg", lat: 42.5573, lng: -8.8618, porQueVenir: "Isla con playas salvajes.", momentoPerfecto: "Verano.", imprescindibles: ["Faro", "Playas", "Paseo"], comer: "Marisco.", tomar: "Albariño.", secreto: "Carretera del faro.", masTiempo: "O Grove.", advertencias: "Puente de dos sentidos." },
  { id: 37, nombre: "A Guarda", bloque: "pontevedra", categorias: ["magicos", "patrimonio"], horas: 3, imagen: "img/aguarda.jpg", lat: 41.9000, lng: -8.8667, porQueVenir: "Citania de Santa Trega.", momentoPerfecto: "Atardecer.", imprescindibles: ["Citania", "Faro", "Monte Trega"], comer: "Marisco.", tomar: "Albariño.", secreto: "Portugal.", masTiempo: "Tui.", advertencias: "Viento." },
{ id: 38, nombre: "Cíes y Ons", bloque: "pontevedra", categorias: ["naturaleza", "costa"], horas: 6, imagen: "img/ciesyons.jpg", lat: 42.2244, lng: -8.9031, porQueVenir: "Dos archipiélagos protegidos.", momentoPerfecto: "Junio o septiembre.", imprescindibles: ["Playa de Rodas", "Monte Faro", "Playa de Melide"], comer: "Lleva comida.", tomar: "Agua.", secreto: "Playa de Figueiras.", masTiempo: "Camping en Cíes.", advertencias: "Reserva obligatoria." },
  
{ 
    id: 39, 
    nombre: "Fisterra y alrededores", 
    bloque: "acoruna", 
    categorias: ["costa", "magicos", "naturaleza"], 
    horas: 5, 
    imagen: "img/fisterra.jpg", 
    lat: 42.9049, 
    lng: -9.2625, 
    
    porQueVenir: "Finisterre es el punto más al oeste de la península ibérica: frente a ti, solo hay mar… y América. Aquí los paisajes son de película: acantilados, playas salvajes y un faro que marca “el fin del mundo”. La zona está llena de historias ligadas al mar y a lo mágico, y es perfecta para quien busca naturaleza y leyenda.", 
    momentoPerfecto: "Mañana o tarde con buen tiempo. Consulta siempre la previsión meteorológica: si hay niebla, no verás ni el mar aunque lo tengas justo delante.", 
    
    imprescindibles: [
      "<strong>Faro de Finisterre:</strong> icono del fin del mundo, sobre los acantilados.", 
      "<strong>Playas y acantilados:</strong> vistas espectaculares del Atlántico abierto.", 
      "<strong>Hórreos de Carnota y Lira:</strong> antiguos graneros típicos de Galicia, los más grandes, fascinantes y poco conocidos."
    ], 
    
    comer: "Marisco y pescado fresco de la Costa da Morte. Sencillo, auténtico y con productos locales.", 
    tomar: "Vino gallego o cerveza local (Estrella Galicia), según prefieras.",
    
    playasYAlrededores: [
      "<strong>Playa de Langosteira:</strong> La más extensa y familiar, con aguas tranquilas, servicios y posibilidades de deportes acuáticos.",
      "<strong>Playa de Mar de Fóra:</strong> Salvaje y abierta al Atlántico, ideal para pasear y disfrutar de puestas de sol, aunque el baño es peligroso por las corrientes.",
      "<strong>Playa de O Rostro:</strong> Gran playa natural y espectacular, rodeada de dunas y vegetación; baño arriesgado, perfecta para pasear.",
      "<strong>Playa de Lariño:</strong> Arena dorada y oleaje potente en un entorno espectacular.",
      "<strong>Playa de Arnela:</strong> Pequeña y tranquila, rodeada de acantilados, ideal para desconectar en un entorno natural.",
      "<strong>Hórreos de Carnota y Lira:</strong> Una joya patrimonial impresionante para ver y fotografiar muy cerca de la costa."
    ],
    
    secreto: "El pueblo en sí es pequeño; lo verdaderamente impresionante está en los alrededores: acantilados, playas, hórreos y el faro. Si tienes tiempo, perderse por los caminos costeros es un descubrimiento inolvidable.", 
    
    masTiempo: [
      "Explorar la Costa da Morte hacia Camariñas o Muxía.",
      "Senderos por los acantilados y rutas cercanas."
    ], 
    
    advertencias: [
      "Clima cambiante, niebla frecuente.",
      "Corrientes fuertes en playas abiertas.",
      "Pueblo pequeño, no esperes vida urbana intensa."
    ],
    
    miOpinion: "Finisterre merece la pena sobre todo por sus alrededores: el faro, las playas, los hórreos y el mar abierto. El pueblo no impresiona por sí mismo, pero la sensación de estar “al final del mundo” es única. Paisajes que quitan el aliento, historias de mar y leyenda, y playas que parecen secretas: un lugar para quienes buscan naturaleza y magia en estado puro."
  }
];

// ── UTILIDADES ─────────────────────────────────────────────────

const utils = {
  debounce: (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  throttle: (fn, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  sanitizeHTML: (str) => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  },

  formatTime: (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours === 1) return '1h';
    return `${hours}h`;
  },

  isTouch: () => window.matchMedia('(pointer: coarse)').matches,

  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  haptic: (type = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        error: [30, 100, 30]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  },

  detectSwipe: (element, callbacks) => {
    let startX, startY, endX, endY;
    const threshold = 50;

    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const diffX = endX - startX;
      const diffY = endY - startY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
          diffX > 0 ? callbacks.onSwipeRight?.() : callbacks.onSwipeLeft?.();
        }
      } else {
        if (Math.abs(diffY) > threshold) {
          diffY > 0 ? callbacks.onSwipeDown?.() : callbacks.onSwipeUp?.();
        }
      }
    }, { passive: true });
  }
};

// ── GESTIÓN DE AUTENTICACIÓN ──────────────────────────────────

const authManager = {
  check: () => localStorage.getItem('galicia_auth') === 'true',

  set: (value) => {
    if (value) {
      localStorage.setItem('galicia_auth', 'true');
      localStorage.setItem('galicia_auth_time', Date.now().toString());
    } else {
      localStorage.removeItem('galicia_auth');
      localStorage.removeItem('galicia_auth_time');
    }
  }
};

// ── GESTIÓN DE FAVORITOS ────────────────────────────────────

const favoritesManager = {
  load: () => {
    try {
      const saved = localStorage.getItem('galicia_favorites');
      state.favorites = saved ? JSON.parse(saved) : [];
    } catch (e) {
      state.favorites = [];
    }
    return state.favorites;
  },

  save: () => {
    localStorage.setItem('galicia_favorites', JSON.stringify(state.favorites));
  },

  toggle: (id) => {
    const index = state.favorites.indexOf(id);
    if (index > -1) {
      state.favorites.splice(index, 1);
      utils.haptic('light');
    } else {
      state.favorites.push(id);
      utils.haptic('medium');
    }
    favoritesManager.save();
    ui.updateFavoriteButton(id);
    ui.renderFavoritesSection();
    return index === -1;
  },

  isFavorite: (id) => state.favorites.includes(id),

  remove: (id) => {
    const index = state.favorites.indexOf(id);
    if (index > -1) {
      state.favorites.splice(index, 1);
      favoritesManager.save();
      ui.updateFavoriteButton(id);
      ui.renderFavoritesSection();
      utils.haptic('light');
    }
  }
};

// ── GESTIÓN DE GEOLOCALIZACIÓN ────────────────────────────────

const geoManager = {
  request: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          state.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          localStorage.setItem('galicia_lat', state.userLocation.lat);
          localStorage.setItem('galicia_lng', state.userLocation.lng);
          
          mapManager.showUserLocation();
          ui.updateGeoUI(true);
          utils.haptic('success');
          
          resolve(state.userLocation);
        },
        (error) => {
          ui.updateGeoUI(false, error.message);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  },

  toggle: () => {
    if (state.userLocation) {
      state.userLocation = null;
      mapManager.hideUserLocation();
      localStorage.removeItem('galicia_lat');
      localStorage.removeItem('galicia_lng');
      ui.updateGeoUI(false);
      utils.haptic('light');
    } else {
      geoManager.request();
    }
  },

  checkSaved: () => {
    const lat = localStorage.getItem('galicia_lat');
    const lng = localStorage.getItem('galicia_lng');
    
    if (lat && lng) {
      state.userLocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        accuracy: 0,
        timestamp: Date.now()
      };
      ui.updateGeoUI(true);
      return true;
    }
    return false;
  }
};

// ── GESTIÓN DE MAPAS ─────────────────────────────────────────

const mapManager = {
  init: () => {
    if (state.mainMap) return;

    setTimeout(() => {
      state.mainMap = L.map('map', {
        center: CONFIG.MAP_CENTER,
        zoom: CONFIG.MAP_ZOOM_DEFAULT,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: 'center',
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomControl: false,
        fadeAnimation: !utils.prefersReducedMotion(),
        markerZoomAnimation: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(state.mainMap);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2
      }).addTo(state.mainMap);

      lugares.forEach((lugar, index) => {
        if (!lugar.lat || !lugar.lng) return;
        mapManager.addMarker(lugar, index);
      });

      // Forzar recálculo de tamaño y centrado correcto en Galicia
      setTimeout(() => {
        state.mainMap.invalidateSize();
        state.mainMap.setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM_DEFAULT);
      }, 200);

      if (state.userLocation) {
        mapManager.showUserLocation();
      }
    }, 100);
  },

  addMarker: (lugar, index) => {
    const isSelected = state.selectedPlaces.includes(lugar.id);
    const marker = L.marker([lugar.lat, lugar.lng], {
      icon: L.divIcon({
        className: `custom-marker ${lugar.bloque} ${isSelected ? 'selected-ring' : ''}`,
        html: `<span>${index + 1}</span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      })
    }).addTo(state.mainMap);

    marker.on('click', (e) => {
      mapManager.showPopup(lugar, e.latlng, state.mainMap);
    });

    state.markers[lugar.id] = marker;
  },

  showPopup: (lugar, latlng, mapInstance) => {
    const isSelected = state.selectedPlaces.includes(lugar.id);
    const btnText = isSelected ? '❌ Quitar' : '➕ Añadir';
    const btnColor = isSelected ? '#B3261E' : '#1a5276';

    const popupHtml = `
      <div style="text-align:center; min-width:160px; font-family:sans-serif;">
        <img src="${lugar.imagen}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;margin-bottom:10px;" onerror="this.style.display='none'">
        <div style="font-weight:700;font-size:1rem;margin-bottom:6px;">${utils.sanitizeHTML(lugar.nombre)}</div>
        <div style="font-size:0.8rem;color:#666;margin-bottom:12px;">${lugar.horas}h · ${categorias.find(c => c.id === lugar.categorias[0])?.nombreCorto || ''}</div>
        <button onclick="routeManager.togglePlace(${lugar.id}); mapManager.refreshPopup(this, ${lugar.id});" 
                style="background:${btnColor};color:white;border:none;padding:10px 16px;border-radius:12px;font-weight:600;cursor:pointer;width:100%;font-size:0.9rem;">
          ${btnText}
        </button>
      </div>
    `;

    L.popup({ closeButton: false, offset: [0, -10] })
      .setLatLng(latlng)
      .setContent(popupHtml)
      .openOn(mapInstance);
  },

  refreshPopup: (btn, id) => {
    const isSelected = state.selectedPlaces.includes(id);
    btn.textContent = isSelected ? '❌ Quitar' : '➕ Añadir';
    btn.style.background = isSelected ? '#B3261E' : '#1a5276';
  },

  showUserLocation: () => {
    if (!state.mainMap || !state.userLocation) return;

    if (state.userMarker) {
      state.mainMap.removeLayer(state.userMarker);
    }

    state.userMarker = L.marker([state.userLocation.lat, state.userLocation.lng], {
      icon: L.divIcon({
        className: 'user-location-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(state.mainMap);
  },

  hideUserLocation: () => {
    if (state.userMarker) {
      state.mainMap?.removeLayer(state.userMarker);
      state.userMarker = null;
    }
  },

  openFullscreen: () => {
    const container = document.getElementById('mapFullscreen');
    container.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (!state.fsMap) {
        state.fsMap = L.map('mapFullscreenMap', {
          center: CONFIG.MAP_CENTER,
          zoom: 9,
          zoomControl: true,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18
        }).addTo(state.fsMap);

        lugares.forEach((lugar, index) => {
          if (!lugar.lat || !lugar.lng) return;
          
          const isSelected = state.selectedPlaces.includes(lugar.id);
          const marker = L.marker([lugar.lat, lugar.lng], {
            icon: L.divIcon({
              className: `custom-marker touchable ${lugar.bloque} ${isSelected ? 'selected-ring' : ''}`,
              html: `<span>${index + 1}</span>`,
              iconSize: [48, 48],
              iconAnchor: [24, 24]
            })
          }).addTo(state.fsMap);

          marker.on('click', (e) => {
            mapManager.showPopup(lugar, e.latlng, state.fsMap);
          });

          state.fullscreenMarkers[lugar.id] = marker;
        });
      } else {
        lugares.forEach(lugar => {
          const marker = state.fullscreenMarkers[lugar.id];
          if (marker) {
            const isSelected = state.selectedPlaces.includes(lugar.id);
            const element = marker.getElement();
            if (element) {
              element.classList.toggle('selected-ring', isSelected);
            }
          }
        });
        state.fsMap.invalidateSize();
      }

      ui.updateFullscreenUI();
    }, 150);
  },

  closeFullscreen: () => {
    const container = document.getElementById('mapFullscreen');
    container.classList.remove('active');
    document.body.style.overflow = '';
  },

  scrollToFooter: () => {
    document.getElementById('mapFullscreenFooter')?.scrollIntoView({ behavior: 'smooth' });
  }
};

// ── GESTIÓN DE RUTAS ──────────────────────────────────────────

const routeManager = {
  togglePlace: (id) => {
    const index = state.selectedPlaces.indexOf(id);
    if (index > -1) {
      state.selectedPlaces.splice(index, 1);
      utils.haptic('light');
    } else {
      state.selectedPlaces.push(id);
      utils.haptic('medium');
    }

    ui.updateSelectionUI();
    
    const marker = state.markers[id];
    if (marker) {
      const element = marker.getElement();
      if (element) {
        element.classList.toggle('selected-ring', index === -1);
      }
    }

    const fsMarker = state.fullscreenMarkers[id];
    if (fsMarker) {
      const element = fsMarker.getElement();
      if (element) {
        element.classList.toggle('selected-ring', index === -1);
      }
    }

    return index === -1;
  },

  clear: () => {
    state.selectedPlaces = [];
    ui.updateSelectionUI();
    
    Object.keys(state.markers).forEach(id => {
      const marker = state.markers[id];
      if (marker) {
        const element = marker.getElement();
        if (element) {
          element.classList.remove('selected-ring');
        }
      }
    });
    
    ui.updateFullscreenUI();
    utils.haptic('light');
  },

  generateItinerary: () => {
    if (state.selectedPlaces.length === 0) {
      alert('Selecciona al menos un lugar en el mapa.');
      return;
    }

    const waypoints = [];
    
    if (state.userLocation) {
      waypoints.push(`${state.userLocation.lat},${state.userLocation.lng}`);
    }

    state.selectedPlaces.forEach(id => {
      const lugar = lugares.find(l => l.id === id);
      if (lugar?.lat && lugar?.lng) {
        waypoints.push(`${lugar.lat},${lugar.lng}`);
      }
    });

    if (waypoints.length === 0) {
      alert('No se encontraron coordenadas válidas.');
      return;
    }

    const url = `https://www.google.com/maps/dir/${waypoints.join('/')}`;
    window.open(url, '_blank');
  },

  getTotalHours: () => {
    return state.selectedPlaces.reduce((sum, id) => {
      const lugar = lugares.find(l => l.id === id);
      return sum + (lugar?.horas || 0);
    }, 0);
  }
};

// ── DATOS DE RECOMENDACIONES ──────────────────────────────────

const recomendaciones = {
  antes: [
    { img: 'img/rec_chaqueta.jpg', alt: 'Chaqueta', titulo: '🧥 Trae una prenda de abrigo. Siempre.', cuerpo: 'Aunque vengas en agosto y veas sol en la previsión, en Galicia <strong>refresca al caer la tarde</strong>, sobre todo cerca del mar.<br><br>No es drama, pero se agradece no acabar comprando una sudadera de emergencia.' },
    { img: 'img/rec_lluvia.jpg', alt: 'Lluvia', titulo: '🌦️ La lluvia no avisa.', cuerpo: 'No es que llueva todo el día; es peor (o mejor): <strong>puede llover cinco minutos, parar, salir el sol… y repetir</strong>. Incluso te puede pillar justo cuando te pones el bañador.<br><br>Un chubasquero ligero suele ser mejor idea que un paraguas. Y ojo, en verano también hay días de tiempo espectacular.' },
    { img: 'img/rec_clima.jpg', alt: 'Clima', titulo: '🌫️ El clima cambia en horas.', cuerpo: 'Puedes salir con cielo despejado y encontrarte niebla cerrada en la costa en media hora. <strong>Galicia no tiene un clima: tiene varios a la vez.</strong><br><br>Si vas a la playa, consulta la meteorología (viento, niebla, mar) porque puede estar perfecto tierra adentro y torcerse en la costa.' },
    { img: 'img/rec_hambre.jpg', alt: 'Hambre', titulo: '🍽️ Ven con hambre.', cuerpo: 'Las raciones no son simbólicas. <strong>Aquí se come en serio</strong>, y repetir no está mal visto.<br><br>En invierno, además, los platos son especialmente contundentes.' },
    { img: 'img/rec_planes.jpg', alt: 'Planes', titulo: '🧭 No planifiques demasiado.', cuerpo: 'Galicia no encaja bien con horarios rígidos. Muchas veces lo mejor aparece sin buscarlo.<br><br><strong>Deja hueco para improvisar:</strong> suele ser ahí donde aciertas.' },
    { img: 'img/rec_idioma.jpg', alt: 'Idioma', titulo: '🗣️ El gallego existe (y se usa).', cuerpo: 'Escucharás palabras distintas, y es parte del viaje. <strong>Es nuestra identidad y nuestra lengua…</strong> y si quieres, también puede ser un poco la tuya.<br><br>Decir "boas" o "grazas" suma puntos.' },
    { img: 'img/rec_preguntar.jpg', alt: 'Preguntar', titulo: '❓ Pregunta sin miedo.', cuerpo: 'La gente puede parecer seca al principio, pero <strong>si preguntas, te ayudan</strong>. Y muchas veces, mejor que cualquier app.<br><br>Prepárate, eso sí, para respuestas tipo: "depende", "puede ser"… ayudamos, pero a nuestra manera.' },
    { img: 'img/rec_reservas.jpg', alt: 'Reservas', titulo: '📅 Ojo con las reservas.', cuerpo: 'En sitios conocidos o en verano, <strong>reserva</strong>. Donde menos te lo esperas, se llena.<br><br>Algunos lugares muy demandados <strong>requieren antelación</strong>: Islas Cíes y Ons, el Pórtico de la Gloria o la Playa de las Catedrales.' },
    { img: 'img/rec_gallegos.jpg', alt: 'Gallegos', titulo: '🧍 Los gallegos no somos bordes, somos prudentes.', cuerpo: 'No esperes entusiasmo inmediato. Aquí <strong>primero se observa, luego se confía.</strong><br><br>Pero cuando entras, entras de verdad.' }
  ],
  comer: [
    { img: 'img/rec_pan.jpg', alt: 'Pan', titulo: '🥖 El pan importa. Mucho.', cuerpo: 'No es un simple acompañamiento. En serio: <strong>si el pan falla, desconfía.</strong><br><br>Los mejores: Pan de Cea (horno de leña), Pan de Carral (molete con moño), Pan de Neda (corteza gruesa), Pan de O Porriño (bollas famosas).' },
    { img: 'img/rec_queso.jpg', alt: 'Queso', titulo: '🧀 Quesos con carácter.', cuerpo: 'Entra en cualquier taberna con buena pinta y pide una tabla de quesos gallegos.<br><br>Desde el cremoso hasta el ahumado: <strong>prueba sin prejuicios</strong>, algunos sorprenden mucho.' },
    { img: 'img/rec_empanada.jpg', alt: 'Empanada', titulo: '🥟 Empanada: simple en apariencia, seria en ejecución.', cuerpo: 'Clásicas: <strong>bonito, bacalao con pasas o zamburiñas</strong>, pero también hay versiones con cualquier producto local. La masa varía según la zona.<br><br>Ideal para un picnic improvisado o como sustituto del bocadillo.' },
    { img: 'img/rec_pulpo.jpg', alt: 'Pulpo', titulo: '🐙 Pulpo: menos espectáculo, más respeto.', cuerpo: 'Solo necesita sal, aceite y pimentón. <strong>Si está duro… no vuelvas.</strong> Para garantías, busca una buena pulpeira.<br><br>El <strong>pulpo á feira</strong> es la opción clásica y casi siempre la mejor.' },
    { img: 'img/rec_raxo.jpg', alt: 'Raxo', titulo: '🐖 Raxo y zorza: el cerdo bien tratado.', cuerpo: 'Platos sencillos y sabrosos, <strong>raciones estrella</strong> de las tabernas gallegas.<br><br>Perfectos para compartir o como plato único.' },
    { img: 'img/rec_pimientos.jpg', alt: 'Pimientos', titulo: '🌶️ Pimientos: una ruleta.', cuerpo: '"Unos pican, otros no". Los auténticos pimientos de Padrón <strong>se cultivan en Herbón</strong>.<br><br>No todos los que se encuentran fuera de Galicia son reales. Aprovecha mientras estás aquí.' },
    { img: 'img/rec_pescado.jpg', alt: 'Pescados', titulo: '🐟 Pescados: Galicia habla claro.', cuerpo: 'Merluza, rodaballo, lubina… <strong>frescos y sin adornos innecesarios.</strong><br><br>A la brasa, en caldeirada o directo de la ría: sencillo y delicioso.' },
    { img: 'img/rec_lacon.jpg', alt: 'Lacón', titulo: '🥬 Lacón con grelos: contundente.', cuerpo: 'No es ligero, pero <strong>es Galicia en plato</strong>.<br><br>Plato de temporada: si aparece en la carta, pídelo sin dudar.' },
    { img: 'img/rec_ternera.jpg', alt: 'Ternera', titulo: '🥩 Ternera Gallega: otra liga.', cuerpo: '<strong>Carne con sabor real.</strong><br><br>Poco más que decir: prepárate para disfrutar… y para abrir la cartera si quieres lo mejor.' },
    { img: 'img/rec_mariscada.jpg', alt: 'Marisco', titulo: '🦐 Marisco: cuando es bueno, se nota.', cuerpo: 'Y cuando no, también. No todo vale: <strong>busca locales con producto fresco y buena rotación.</strong><br><br>Para una experiencia de verdad, calcula <strong>no menos de 70 € por persona</strong>. La tarjeta es casi obligatoria, pero cada bocado lo vale.' }
  ],
  beber: [
    { img: 'img/rec_albarino.jpg', alt: 'Albariño', titulo: '🍇 Albariño: fácil de entender, difícil de olvidar.', cuerpo: 'Fresco, aromático y muy agradecido. Se cultiva en las Rías Baixas, donde el clima atlántico le da ese punto ácido y salino.<br><br>👉 <strong>Cuándo:</strong> comida al mediodía, días de calor.<br>👉 <strong>Con qué:</strong> marisco, pescado, arroces.' },
    { img: 'img/rec_ribeiro.jpg', alt: 'Ribeiro', titulo: '🍷 Ribeiro: el vino de las tabernas.', cuerpo: 'Más ligero que el albariño, muy refrescante. Siempre en esos vasos blancos bajitos.<br><br>👉 <strong>Cuándo:</strong> de tapas, en bares tradicionales.<br>👉 <strong>Con qué:</strong> empanada, chorizos, queso.' },
    { img: 'img/rec_mencia.jpg', alt: 'Mencía', titulo: '🍷 Mencía: el tinto que sorprende.', cuerpo: 'Si crees que en Galicia solo hay blancos, el mencía te cambia la perspectiva. Frutoso, con carácter propio.<br><br>👉 <strong>Cuándo:</strong> cenas, con carne o pulpo.<br>👉 <strong>Dónde:</strong> Ribeira Sacra y Valdeorras.' },
    { img: 'img/rec_godello.jpg', alt: 'Godello', titulo: '✨ Godello: el blanco con más personalidad.', cuerpo: 'Si el albariño es el rey de la costa, el godello es el rey del interior. Más complejo, con más cuerpo.<br><br>👉 <strong>Cuándo:</strong> con carnes blancas, quesos curados.<br>👉 <strong>Dónde:</strong> Valdeorras.' },
    { img: 'img/rec_orujo.jpg', alt: 'Orujo', titulo: '🔥 Orujo: el chupito de Galicia.', cuerpo: 'El orujo gallego es cosa seria. Blanco, de hierbas o de miel. En invierno, el <strong>queimada</strong> es un ritual.<br><br>👉 <strong>Cuándo:</strong> de postre, para el frío.<br>👉 <strong>Cuidado:</strong> tiene más grados de los que parece.' },
    { img: 'img/rec_estrella.jpg', alt: 'Estrella Galicia', titulo: '🍺 Estrella Galicia: la de aquí.', cuerpo: 'No es solo cerveza: es parte de la identidad. Fría y de grifo, acompaña cualquier momento.<br><br>👉 <strong>Consejo:</strong> en verano, no hay nada mejor con mariscos o pimientos de Padrón.' }
  ],
  disfrutar: [
    { img: 'img/rec_distancias.jpg', alt: 'Distancias', titulo: '🗺️ No midas en kilómetros, mide en tiempo.', cuerpo: 'Las distancias engañan. 50 km pueden ser 1 hora o más.<br><br>👉 <strong>Error típico:</strong> querer ver demasiado en un día.' },
    { img: 'img/rec_coche.jpg', alt: 'Coche', titulo: '🚗 Sin coche, te pierdes Galicia.', cuerpo: 'El transporte público no llega a todo.<br><br>👉 <strong>Regla:</strong> alquila coche si quieres libertad.<br>👉 <strong>Ganancia:</strong> acceso a sitios que no salen en ninguna guía.' },
    { img: 'img/rec_gps.jpg', alt: 'GPS', titulo: '📍 El GPS no siempre tiene razón.', cuerpo: 'Te puede meter por carreteras estrechas o caminos raros.<br><br>👉 <strong>Regla:</strong> si dudas, no sigas a ciegas.<br>👉 <strong>Mejor opción:</strong> parar y preguntar.' },
    { img: 'img/rec_mirador.jpg', alt: 'Mirador', titulo: '📸 Si ves un mirador, párate.', cuerpo: 'No todos salen en Google.<br><br>👉 <strong>Regla:</strong> si hay hueco para parar, para.<br>👉 <strong>Resultado:</strong> muchas veces, lo mejor del día.' },
    { img: 'img/rec_mar_impone.jpg', alt: 'Mar', titulo: '🌊 El mar aquí impone.', cuerpo: 'Especialmente en costa abierta. Respeta las olas y las corrientes.<br><br>👉 <strong>Aviso:</strong> esto es el Atlántico. No es una broma.' },
    { img: 'img/rec_playas.jpg', alt: 'Playas', titulo: '🏖️ No todas las playas son iguales.', cuerpo: 'Ría ≠ océano.<br><br>👉 <strong>Rías:</strong> más tranquilas, familiares.<br>👉 <strong>Abiertas:</strong> más espectaculares, pero más exigentes.' },
    { img: 'img/rec_mareas.jpg', alt: 'Mareas', titulo: '🌗 Mira las mareas antes de ir.', cuerpo: 'Cambian completamente el paisaje.<br><br>👉 <strong>Regla:</strong> consulta mareas si vas a calas o playas largas.<br>👉 <strong>Prueba:</strong> busca "Galicia coche marea". Vas a flipar.' },
    { img: 'img/rec_barco.jpg', alt: 'Barco', titulo: '⛴️ Cruza la ría en barco si puedes.', cuerpo: 'No es solo transporte, es parte del viaje.<br><br>👉 <strong>Ejemplo:</strong> la línea Moaña–Vigo es rápida, barata y muy recomendable.' },
    { img: 'img/rec_chiringuitos.jpg', alt: 'Chiringuitos', titulo: '🍻 Aquí chiringuitos, pocos.', cuerpo: 'No esperes servicios en todas las playas. Muchas están prácticamente vírgenes.<br><br>👉 <strong>Clave:</strong> ven preparado. Y sí, a nosotros nos gusta así.' },
    { img: 'img/rec_interior.jpg', alt: 'Interior', titulo: '🌿 El interior es otra Galicia.', cuerpo: 'Ríos, bosques, fervenzas.<br><br>👉 <strong>Regla:</strong> no te quedes solo en la costa.<br>👉 <strong>Premio:</strong> menos gente, más autenticidad.' },
    { img: 'img/rec_islas.jpg', alt: 'Islas', titulo: '🏝️ Las islas cambian el ritmo.', cuerpo: 'Cíes, Ons… otra velocidad.<br><br>👉 <strong>Regla:</strong> planifica con antelación.<br>👉 <strong>Consejo:</strong> si vas, recórrelas. Merece la pena.' },
    { img: 'img/rec_caminar.jpg', alt: 'Caminar', titulo: '🥾 Caminar es parte del viaje.', cuerpo: 'Galicia no se disfruta solo en coche.<br><br>👉 <strong>Regla:</strong> baja, camina, explora.<br>👉 <strong>Resultado:</strong> lo que no ve todo el mundo.' },
    { img: 'img/rec_fiesta.jpg', alt: 'Fiesta', titulo: '🎉 Si hay fiesta, quédate.', cuerpo: 'Da igual cuál sea. Es Galicia en estado puro.<br><br>👉 <strong>Pista:</strong> aquí hay más fiestas que días. Mira: <a href="https://festigaleiros.com/" target="_blank" rel="noopener">festigaleiros.com</a>' },
    { img: 'img/rec_magia.jpg', alt: 'Magia', titulo: '🌫️ Galicia también es mágica.', cuerpo: 'Mouras, mouros, trasgos, meigas, la Santa Compaña… hay más historias que kilómetros.<br><br>👉 <strong>Clave:</strong> la magia, la muerte, el mar y el misterio forman parte de lo que somos.' },
    { img: 'img/rec_clavefinal.jpg', alt: 'Clave final', titulo: '💡 Clave final:', cuerpo: 'Disfruta de todo, cuida el entorno, sé buena gente… <strong>y vuelve.</strong>' }
  ]
};

// ── UI Y RENDERIZADO ──────────────────────────────────────────

const ui = {
  cacheElements: () => {
    ui.elements = {
      splashScreen: document.getElementById('splashScreen'),
      mainContent: document.getElementById('mainContent'),
      passwordInput: document.getElementById('passwordInput'),
      splashError: document.getElementById('splashError'),
      splashForm: document.getElementById('splashForm'),
      placesContainer: document.getElementById('placesContainer'),
      favoritesSection: document.getElementById('favoritesSection'),
      selectionContent: document.getElementById('selectionContent'),
      selectionStats: document.getElementById('selectionStats'),
      geoBtn: document.getElementById('geoBtn'),
      geoStatus: document.getElementById('geoStatus'),
      mapFullscreen: document.getElementById('mapFullscreen'),
      mapSelectionCount: document.getElementById('mapSelectionCount'),
      mapSelectionTime: document.getElementById('mapSelectionTime'),
      mapSelectionPlaces: document.getElementById('mapSelectionPlaces'),
      mapFloatingSelection: document.getElementById('mapFloatingSelection'),
      mapFloatingCount: document.getElementById('mapFloatingCount'),
      sabiasQueScreen: document.getElementById('sabiasQueScreen'),
      textoSabiasQue: document.getElementById('texto-sabias-que'),
      sabiasQueProgress: document.getElementById('sabiasQueProgress')
    };
  },

  renderRecommendations: () => {
    const htmlAntes = `
            <div class="rec-card">
              <img src="img/rec_chaqueta.jpg" class="rec-card-img" alt="Chaqueta" onerror="this.style.display='none'">
              <h4>🧥 Trae una prenda de abrigo. Siempre.</h4>
              <p style="margin-bottom: 8px !important;">Aunque vengas en agosto y veas sol en la previsión, en Galicia <strong>refresca al caer la tarde</strong>, sobre todo cerca del mar.</p>
              <p>No es drama, pero se agradece no acabar comprando una sudadera de emergencia.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_lluvia.jpg" class="rec-card-img" alt="Lluvia" onerror="this.style.display='none'">
              <h4>🌦️ La lluvia no avisa.</h4>
              <p style="margin-bottom: 8px !important;">No es que llueva todo el día; es peor (o mejor): <strong>puede llover cinco minutos, parar, salir el sol… y repetir</strong>. Incluso te puede pillar justo cuando te pones el bañador.</p>
              <p>Un chubasquero ligero suele ser mejor idea que un paraguas. Y ojo, en verano también hay días de tiempo espectacular.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_clima.jpg" class="rec-card-img" alt="Clima" onerror="this.style.display='none'">
              <h4>🌫️ El clima cambia en horas.</h4>
              <p style="margin-bottom: 8px !important;">Puedes salir con cielo despejado y encontrarte niebla cerrada en la costa en media hora. <strong>Galicia no tiene un clima: tiene varios a la vez.</strong></p>
              <p>Si vas a la playa, consulta la meteorología (viento, niebla, mar) porque puede estar perfecto tierra adentro y torcerse en la costa.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_hambre.jpg" class="rec-card-img" alt="Hambre" onerror="this.style.display='none'">
              <h4>🍽️ Ven con hambre.</h4>
              <p style="margin-bottom: 8px !important;">Las raciones no son simbólicas. <strong>Aquí se come en serio</strong>, y repetir no está mal visto.</p>
              <p>En invierno, además, los platos son especialmente contundentes.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_planes.jpg" class="rec-card-img" alt="Planes" onerror="this.style.display='none'">
              <h4>🧭 No planifiques demasiado.</h4>
              <p style="margin-bottom: 8px !important;">Galicia no encaja bien con horarios rígidos. Muchas veces lo mejor aparece sin buscarlo.</p>
              <p><strong>Deja hueco para improvisar:</strong> suele ser ahí donde aciertas.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_idioma.jpg" class="rec-card-img" alt="Idioma" onerror="this.style.display='none'">
              <h4>🗣️ El gallego existe (y se usa).</h4>
              <p style="margin-bottom: 8px !important;">Escucharás palabras distintas, y es parte del viaje. <strong>Es nuestra identidad y nuestra lengua…</strong> y si quieres, también puede ser un poco la tuya.</p>
              <p>Decir “boas” o “grazas” suma puntos.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_preguntar.jpg" class="rec-card-img" alt="Preguntar" onerror="this.style.display='none'">
              <h4>❓ Pregunta sin miedo.</h4>
              <p style="margin-bottom: 8px !important;">La gente puede parecer seca al principio, pero <strong>si preguntas, te ayudan</strong>. Y muchas veces, mejor que cualquier app.</p>
              <p>Prepárate, eso sí, para respuestas tipo: “depende”, “puede ser”… ayudamos, pero a nuestra manera.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_reservas.jpg" class="rec-card-img" alt="Reservas" onerror="this.style.display='none'">
              <h4>📅 Ojo con las reservas.</h4>
              <p style="margin-bottom: 8px !important;">En sitios conocidos o en verano, <strong>reserva</strong>. Donde menos te lo esperas, se llena.</p>
              <p>Algunos lugares muy demandados <strong>requieren antelación</strong>: Islas Cíes y Ons, el Pórtico de la Gloria o la Playa de las Catedrales.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_gallegos.jpg" class="rec-card-img" alt="Gallegos" onerror="this.style.display='none'">
              <h4>🧍 Los gallegos no somos bordes, somos prudentes.</h4>
              <p style="margin-bottom: 8px !important;">No esperes entusiasmo inmediato. Aquí <strong>primero se observa, luego se confía.</strong></p>
              <p>Pero cuando entras, entras de verdad.</p>
            </div>
          </div>
`;
    const htmlComer = `
            <div class="rec-card">
              <img src="img/rec_pan.jpg" class="rec-card-img" alt="Pan" onerror="this.style.display='none'">
              <h4>🥖 El pan importa. Mucho.</h4>
              <p style="margin-bottom: 6px !important;">No es un simple acompañamiento. En serio: <strong>si el pan falla, desconfía.</strong></p>
              <p style="margin-bottom: 4px !important;">Top 3:</p>
              <ul style="font-size: 0.85rem; line-height: 1.4; color: #555; list-style-type: disc; padding-left: 20px; margin: 0 0 8px 0;">
                <li><strong>Pan de Cea:</strong> el tradicional, horno de leña.</li>
                <li><strong>Pan de Carral:</strong> “molete” con moño.</li>
                <li><strong>Pan de Neda:</strong> corteza gruesa y durabilidad asegurada.</li>
                <li><strong>Pan de O Porriño:</strong> famoso por sus bollas.</li>
              </ul>
              <p>💡 <strong>Consejo:</strong> buen pan puedes encontrarlo en casi cualquier rincón de Galicia.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_queso.jpg" class="rec-card-img" alt="Queso" onerror="this.style.display='none'">
              <h4>🧀 Quesos con carácter</h4>
              <p style="margin-bottom: 8px !important;">Entra en cualquier taberna con buena pinta y pide una tabla de quesos gallegos.</p>
              <p>Desde el cremoso hasta el ahumado: <strong>prueba sin prejuicios</strong>, algunos sorprenden mucho.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_empanada.jpg" class="rec-card-img" alt="Empanada" onerror="this.style.display='none'">
              <h4>🥟 Empanada: simple en apariencia, seria en ejecución</h4>
              <p style="margin-bottom: 8px !important;">Clásicas: <strong>bonito, bacalao con pasas o zamburiñas</strong>, pero también hay versiones con cualquier producto local. La masa varía según la zona.</p>
              <p>Ideal para un picnic improvisado o como sustituto del bocadillo.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_pulpo.jpg" class="rec-card-img" alt="Pulpo" onerror="this.style.display='none'">
              <h4>🐙 Pulpo: menos espectáculo, más respeto</h4>
              <p style="margin-bottom: 8px !important;">Solo necesita sal, aceite y pimentón. <strong>Si está duro… no vuelvas.</strong> Para garantías, busca una buena pulpeira.</p>
              <p>El <strong>pulpo á feira</strong> es la opción clásica y casi siempre la mejor.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_raxo.jpg" class="rec-card-img" alt="Raxo" onerror="this.style.display='none'">
              <h4>🐖 Raxo y zorza: el cerdo bien tratado</h4>
              <p style="margin-bottom: 8px !important;">Platos sencillos y sabrosos, <strong>raciones estrella</strong> de las tabernas gallegas.</p>
              <p>Perfectos para compartir o como plato único.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_pimientos.jpg" class="rec-card-img" alt="Pimientos" onerror="this.style.display='none'">
              <h4>🌶️ Pimientos: una ruleta</h4>
              <p style="margin-bottom: 8px !important;">“Unos pican, otros no”. Los auténticos pimientos de Padrón <strong>se cultivan en Herbón</strong>.</p>
              <p>No todos los que se encuentran fuera de Galicia son reales. Aprovecha mientras estás aquí.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_pescado.jpg" class="rec-card-img" alt="Pescados" onerror="this.style.display='none'">
              <h4>🐟 Pescados: Galicia habla claro</h4>
              <p style="margin-bottom: 8px !important;">Merluza, rodaballo, lubina… <strong>frescos y sin adornos innecesarios.</strong></p>
              <p>A la brasa, en caldeirada o directo de la ría: sencillo y delicioso.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_lacon.jpg" class="rec-card-img" alt="Lacón" onerror="this.style.display='none'">
              <h4>🥬 Lacón con grelos: contundente</h4>
              <p style="margin-bottom: 8px !important;">No es ligero, pero <strong>es Galicia en plato</strong>.</p>
              <p>Plato de temporada: si aparece en la carta, pídelo sin dudar.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_ternera.jpg" class="rec-card-img" alt="Ternera" onerror="this.style.display='none'">
              <h4>🥩 Ternera Gallega: otra liga</h4>
              <p style="margin-bottom: 8px !important;"><strong>Carne con sabor real.</strong></p>
              <p>Poco más que decir: prepárate para disfrutar… y para abrir la cartera si quieres lo mejor.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_furanchos.jpg" class="rec-card-img" alt="Furanchos" onerror="this.style.display='none'">
              <h4>🍷 Furanchos: comer como un local</h4>
              <p style="margin-bottom: 6px !important;"><strong>Qué es:</strong> Casas particulares que venden su vino acompañado de comida casera sencilla.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Dónde:</strong> Sobre todo Rías Baixas, zonas rurales y alrededores de pueblos.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> Temporada concreta según producción de vino.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Lo que mola:</strong> Autenticidad total: sin carta, sin postureo, comida de verdad y ambiente de siempre.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Qué pedir:</strong> Vino de la casa, tortilla, chorizo, zorza... lo que haya ese día.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Recomendación:</strong> Si ves un cartel "Furancho" y no eres muy tiquismiquis, entra sin dudar. No esperes un restaurante al uso y, desde luego, lleva efectivo: no hay otra forma de pagar.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_churrasco.jpg" class="rec-card-img" alt="Churrasco" onerror="this.style.display='none'">
              <h4>🔥 El churrasco: religión en Galicia</h4>
              <p style="margin-bottom: 6px !important;"><strong>Qué es:</strong> Carne a la parrilla (normalmente cerdo o ternera) hecha al fuego, en tiras largas y con su punto de grasa.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Origen:</strong> Llegó desde Latinoamérica y se popularizó en Galicia en los años 70, con parrilladas pioneras en la zona de Lalín.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Dónde:</strong> Parrilladas y casas particulares.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Lo que mola:</strong> Sabor a brasa, raciones abundantes y ambiente de mesa larga, ruido y cero prisas.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Qué pedir:</strong> Churrasco mixto, criollos, patatas y ensalada. Y vino o cerveza.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Recomendación:</strong> Ven con hambre y sin prisas. No esperes cocina "fina": esto va de brasas y disfrutar. Si hay humo y gente alrededor de una parrilla, vas bien.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mariscada.jpg" class="rec-card-img" alt="Marisco" onerror="this.style.display='none'">
              <h4>🦐 Marisco: cuando es bueno, se nota</h4>
              <p style="margin-bottom: 8px !important;">Y cuando no, también. No todo vale: <strong>busca locales con producto fresco y buena rotación.</strong></p>
              <p>Para una experiencia de verdad, calcula <strong>no menos de 70 € por persona</strong>. La tarjeta es casi obligatoria, pero cada bocado lo vale.</p>
            </div>
          </div>
        </div>
      </div>
`;
    const htmlBeber = `
            <div class="rec-card">
              <img src="img/rec_albarino.jpg" class="rec-card-img" alt="Albariño" onerror="this.style.display='none'">
              <h4>🍇 Albariño: fácil de entender, difícil de olvidar</h4>
              <p style="margin-bottom: 12px !important;">Fresco, aromático y muy agradecido. Se cultiva en las Rías Baixas, donde el clima atlántico le da ese punto ácido y salino.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> comida al mediodía, días de calor.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> marisco, pescado, arroces.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> frío, pero no helado.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_ribeiro.jpg" class="rec-card-img" alt="Ribeiro" onerror="this.style.display='none'">
              <h4>🍷 Ribeiro: el clásico que vuelve</h4>
              <p style="margin-bottom: 12px !important;">Histórico y con personalidad. Fue uno de los vinos más exportados en la Edad Media. Hoy vuelve con fuerza.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> comidas largas, sin prisa.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> cocina tradicional, pulpo, carnes suaves.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> déjalo abrirse un poco, gana mucho.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_godello.jpg" class="rec-card-img" alt="Godello" onerror="this.style.display='none'">
              <h4>🍾 Godello: un paso más</h4>
              <p style="margin-bottom: 12px !important;">Más estructura y profundidad. Recuperado hace relativamente poco, ahora juega en primera división.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> cenas, cuando quieres algo más serio.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> pescados potentes, carnes blancas.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> temperatura media, no demasiado frío.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mencia.jpg" class="rec-card-img" alt="Mencía" onerror="this.style.display='none'">
              <h4>🍷 Mencía: el tinto gallego</h4>
              <p style="margin-bottom: 12px !important;">Ligero, afrutado, muy bebible. Especialmente en Ribeira Sacra.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> tarde-noche, tapeo o cena informal.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> raxo, zorza, embutidos.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> ligeramente fresco, incluso en verano.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_barrantes.jpg" class="rec-card-img" alt="Barrantes" onerror="this.style.display='none'">
              <h4>🍶 Barrantes: el raro</h4>
              <p style="margin-bottom: 12px !important;">Turbio, ácido, muy local. Vino de casa, sin filtros.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> taberna, sin postureo.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> marisco, empanada.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> sin pensar demasiado, se bebe y ya.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_licores.jpg" class="rec-card-img" alt="Licores" onerror="this.style.display='none'">
              <h4>🥃 Licores: cuidado que engañan</h4>
              <p style="margin-bottom: 12px !important;">De hierbas o de café, a partir de aguardiente tradicional.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> después de comer.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> sobremesa, conversación larga.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> despacio… aunque no lo parezca.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_queimada.jpg" class="rec-card-img" alt="Queimada" onerror="this.style.display='none'">
              <h4>🔥 Queimada: no es solo beber</h4>
              <p style="margin-bottom: 12px !important;">Ritual con fuego y “conxuro” incluido. Tradición pura.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> de noche.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> grupo, ambiente, ganas de alargar.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> sin prisas. Es experiencia, no solo bebida.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_estrella.jpg" class="rec-card-img" alt="Estrella Galicia" onerror="this.style.display='none'">
              <h4>🍺 Estrella Galicia: juega en casa</h4>
              <p style="margin-bottom: 12px !important;">Clásica, constante, parte del día a día desde 1906.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> siempre.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Con qué:</strong> cualquier tapa, cualquier momento.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Cómo:</strong> bien tirada y fría. No tiene más misterio.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_brindis.jpg" class="rec-card-img" alt="Brindis" onerror="this.style.display='none'">
              <h4>💡 Clave general:</h4>
              <p style="margin-bottom: 12px !important;">En Galicia no se bebe rápido. Se bebe acompañando, conversando y comiendo. Si tienes prisa, te estás perdiendo la mitad.</p>
            </div>
          </div>
        </div>
      </div>
`;
    const htmlDisfrutar = `
            <div class="rec-card">
              <img src="img/rec_distancias.jpg" class="rec-card-img" alt="Distancias" onerror="this.style.display='none'">
              <h4>🗺️ No midas en kilómetros, mide en tiempo</h4>
              <p style="margin-bottom: 12px !important;">Las distancias engañan.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> 50 km pueden ser 1 hora o más.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Error típico:</strong> querer ver demasiado en un día.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_coche.jpg" class="rec-card-img" alt="Coche" onerror="this.style.display='none'">
              <h4>🚗 Sin coche, te pierdes Galicia</h4>
              <p style="margin-bottom: 12px !important;">El transporte público no llega a todo.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> alquila coche si quieres libertad.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Ganancia:</strong> acceso a sitios que no salen en ninguna guía.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_gps.jpg" class="rec-card-img" alt="GPS" onerror="this.style.display='none'">
              <h4>📍 El GPS no siempre tiene razón</h4>
              <p style="margin-bottom: 12px !important;">Te puede meter por carreteras estrechas o caminos raros.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> si dudas, no sigas a ciegas.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Mejor opción:</strong> parar y preguntar.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mirador.jpg" class="rec-card-img" alt="Mirador" onerror="this.style.display='none'">
              <h4>📸 Si ves un mirador, párate</h4>
              <p style="margin-bottom: 12px !important;">No todos salen en Google.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> si hay hueco para parar, para.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Resultado:</strong> muchas veces, lo mejor del día.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mar_impone.jpg" class="rec-card-img" alt="Mar" onerror="this.style.display='none'">
              <h4>🌊 El mar aquí impone</h4>
              <p style="margin-bottom: 12px !important;">Especialmente en costa abierta.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> respeta las olas y las corrientes.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Error típico:</strong> confiarse en playas salvajes.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Aviso:</strong> esto es el Atlántico. No es una broma.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_playas.jpg" class="rec-card-img" alt="Playas" onerror="this.style.display='none'">
              <h4>🏖️ No todas las playas son iguales</h4>
              <p style="margin-bottom: 12px !important;">Ría ≠ océano.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Rías:</strong> más tranquilas, familiares.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Abiertas:</strong> más espectaculares, pero más exigentes.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mareas.jpg" class="rec-card-img" alt="Mareas" onerror="this.style.display='none'">
              <h4>🌗 Mira las mareas antes de ir</h4>
              <p style="margin-bottom: 12px !important;">Cambian completamente el paisaje.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> consulta mareas si vas a calas o playas largas.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Ejemplo:</strong> puedes quedarte sin arena… o sin salida. Incluso sin coche.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Prueba:</strong> busca “Galicia coche marea”. Vas a flipar.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_barco.jpg" class="rec-card-img" alt="Barco" onerror="this.style.display='none'">
              <h4>⛴️ Cruza la ría en barco si puedes</h4>
              <p style="margin-bottom: 12px !important;">Algunas rías permiten cruzar en transporte público marítimo, como en Ferrol o Vigo.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> no es solo transporte, es parte del viaje.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Experiencia:</strong> ver la costa desde el agua cambia completamente la perspectiva.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Ejemplo:</strong> la línea Moaña–Vigo es rápida, barata y muy recomendable.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_chiringuitos.jpg" class="rec-card-img" alt="Chiringuitos" onerror="this.style.display='none'">
              <h4>🍻 Aquí chiringuitos, pocos</h4>
              <p style="margin-bottom: 12px !important;">No esperes servicios en todas las playas.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Realidad:</strong> muchas están prácticamente vírgenes.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Clave:</strong> ven preparado. Y sí, a nosotros nos gusta así.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_interior.jpg" class="rec-card-img" alt="Interior" onerror="this.style.display='none'">
              <h4>🌿 El interior es otra Galicia</h4>
              <p style="margin-bottom: 12px !important;">Ríos, bosques, fervenzas.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> no te quedes solo en la costa.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Premio:</strong> menos gente, más autenticidad.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_rias.jpg" class="rec-card-img" alt="Rías" onerror="this.style.display='none'">
              <h4>🌊 Las rías lo explican todo</h4>
              <p style="margin-bottom: 12px !important;">Paisaje, comida, clima.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Regla:</strong> si entiendes las rías, entiendes la mitad de Galicia.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_islas.jpg" class="rec-card-img" alt="Islas" onerror="this.style.display='none'">
              <h4>🏝️ Las islas cambian el ritmo</h4>
              <p style="margin-bottom: 12px !important;">Cíes, Ons… otra velocidad.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> planifica con antelación.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Consejo:</strong> si vas, recórrelas. Merece la pena.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_caminar.jpg" class="rec-card-img" alt="Caminar" onerror="this.style.display='none'">
              <h4>🥾 Caminar es parte del viaje</h4>
              <p style="margin-bottom: 12px !important;">Galicia no se disfruta solo en coche.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> baja, camina, explora.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Resultado:</strong> lo que no ve todo el mundo.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_fiesta.jpg" class="rec-card-img" alt="Fiesta" onerror="this.style.display='none'">
              <h4>🎉 Si hay fiesta, quédate</h4>
              <p style="margin-bottom: 12px !important;">Da igual cuál sea.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> si te coincide una, no la esquives.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Realidad:</strong> es Galicia en estado puro.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Pista:</strong> aquí hay más fiestas que días. Si quieres curiosear, mira: <a href="https://festigaleiros.com/" target="_blank" style="color: var(--accent-sea); font-weight: 600; text-decoration: none;">https://festigaleiros.com/</a></p>
            </div>
            <div class="rec-card">
              <img src="img/rec_magia.jpg" class="rec-card-img" alt="Magia" onerror="this.style.display='none'">
              <h4>🌫️ Galicia también es mágica</h4>
              <p style="margin-bottom: 12px !important;">No todo es paisaje.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Regla:</strong> escucha y pregunta.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Extra:</strong> mouras, mouros, trasgos, meigas, la Santa Compaña… hay más historias que kilómetros.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Clave:</strong> la magia, la muerte, el mar y el misterio forman parte de lo que somos.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_traineras.jpg" class="rec-card-img" alt="Traiñeiras" onerror="this.style.display='none'">
              <h4>⛵ Las traiñeiras: el mar también se vive compitiendo</h4>
              <p style="margin-bottom: 6px !important;"><strong>Qué es:</strong> Regatas de embarcaciones tradicionales a remo, con equipos locales y mucha historia.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Dónde:</strong> Toda la costa gallega, especialmente Rías Baixas y Rías Altas. Puertos y villas marineras.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> Verano (julio–septiembre), coincidiendo con ligas y fiestas locales.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Lo que mola:</strong> Ambiente, rivalidad entre pueblos, sonido de los remos y todo muy cerca del agua.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Plan perfecto:</strong> Ver la regata desde el puerto y luego comer o tomar algo por la zona.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Detalle extra:</strong> El timonel de la tripulación vencedora recoge una bandera, que es el premio, y la tiene que ondear.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Error típico:</strong> No mirar el calendario y pensar que hay regata cualquier día. Si coincide, no lo dudes. No es algo preparado para el visitante: es tradición real, y se nota.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_mariscadoras.jpg" class="rec-card-img" alt="Mariscadoras" onerror="this.style.display='none'">
              <h4>🐚 Mariscadoras: As fillas da ría</h4>
              <p style="margin-bottom: 6px !important;"><strong>Qué es:</strong> Mujeres que trabajan el marisqueo a pie, recogiendo almejas, berberechos y otros mariscos.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Dónde:</strong> Rías y zonas intermareales de toda Galicia.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Cuándo:</strong> Depende de la marea: bajamar = trabajo en la arena.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Lo que mola:</strong> Trabajo duro, tradición y relación directa con el mar.</p>
              <p style="margin-bottom: 4px !important;">👉 <strong>Plan perfecto:</strong> Paseo por la ría → verlas trabajar → comer marisco después.</p>
              <p style="margin-bottom: 0 !important;">👉 <strong>Error típico:</strong> Pensar que es algo "turístico". Es trabajo real. Respeta distancias. Después de verlo, el marisco sabe distinto.</p>
            </div>
            <div class="rec-card">
              <img src="img/rec_clavefinal.jpg" class="rec-card-img" alt="Clave final" onerror="this.style.display='none'">
              <h4>💡 Clave final:</h4>
              <p style="margin-bottom: 0 !important;">Disfruta de todo, cuida el entorno, sé buena gente… <strong>y vuelve.</strong></p>
            </div>
          </div>
`;
    const map = {
      'rec-antes': htmlAntes,
      'rec-comer': htmlComer,
      'rec-beber': htmlBeber,
      'rec-disfrutar': htmlDisfrutar
    };
    Object.entries(map).forEach(([id, html]) => {
      const scroll = document.querySelector(`#${id} .horizontal-scroll`);
      if (!scroll) return;
      scroll.innerHTML = html;

      // Swipe hint
      const existing = scroll.parentNode.querySelector('.swipe-hint');
      if (!existing) {
        const hint = document.createElement('div');
        hint.className = 'swipe-hint';
        hint.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg> desliza para ver más`;
        scroll.parentNode.insertBefore(hint, scroll.nextSibling);
      }

      // Leer más en cada tarjeta
      scroll.querySelectorAll('.rec-card').forEach(card => {
        const img  = card.querySelector('img');
        const h4   = card.querySelector('h4');
        const body = [...card.children].filter(el => el !== img && el !== h4);
        if (!body.length) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'rec-card-body';
        body.forEach(el => wrapper.appendChild(el));

        const btn = document.createElement('button');
        btn.className = 'rec-card-toggle';
        btn.innerHTML = `Leer más <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
        btn.addEventListener('click', () => {
          const open = wrapper.classList.toggle('visible');
          btn.classList.toggle('open', open);
          btn.innerHTML = open
            ? `Leer menos <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`
            : `Leer más <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
        });

        card.appendChild(wrapper);
        card.appendChild(btn);
      });
    });
  },

  renderPlaces: () => {
    const container = ui.elements.placesContainer;
    if (!container) return;

    let html = '';
    let globalIndex = 0;

    bloques.forEach(bloque => {
      const lugaresBloque = lugares.filter(l => l.bloque === bloque.id);
      if (!lugaresBloque.length) return;

      html += `<div class="province-box" id="prov-${bloque.id}">`;
      
      html += `
        <div class="province-header ${bloque.id}" onclick="ui.toggleProvincia('prov-${bloque.id}')">
          <div class="bloque-map-sidebar">
            <div class="bloque-map-mini">
              <img src="img/mapa_${bloque.id}.svg" alt="Mapa" loading="lazy" onerror="this.style.display='none'">
            </div>
          </div>
          <div class="bloque-body">
            <div class="bloque-content-wrapper">
              <div class="bloque-nombre">${bloque.emoji} ${bloque.nombre}</div>
              <span class="bloque-subtitulo">${bloque.subtitulo}</span>
            </div>
          </div>
          <div class="bloque-actions">
            <div class="bloque-contador">${lugaresBloque.length} lugares</div>
            <div class="province-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>
      `;

      html += '<div class="province-content"><div class="horizontal-scroll places-carousel">';

      lugaresBloque.forEach(lugar => {
        globalIndex++;
        const isFav = favoritesManager.isFavorite(lugar.id);
        
        html += `
          <article class="place-card ${lugar.bloque}" id="place-${lugar.id}">
            <div class="place-image">
              <img src="${lugar.imagen}" alt="${utils.sanitizeHTML(lugar.nombre)}" loading="lazy" 
                   onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop'">
              <span class="place-number-badge">${globalIndex}</span>
              <div class="place-title-overlay">
                <h3 class="place-title">${utils.sanitizeHTML(lugar.nombre)}</h3>
              </div>
            </div>
            
            <div class="place-header" onclick="ui.togglePlace('place-${lugar.id}')">
              <div class="place-header-left">
                ${lugar.categorias.map(catId => `
                  <span class="place-category-chip ${catId}">${categorias.find(c => c.id === catId)?.nombreCorto || catId}</span>
                `).join('')}
              </div>
              <div class="place-header-right">
                <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${lugar.id}" 
                        onclick="event.stopPropagation(); favoritesManager.toggle(${lugar.id})">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <svg class="place-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            
            <div class="place-content">
              <div class="place-content-inner">
                <div class="place-category-tags">
                  ${lugar.categorias.map(catId => `
                    <span class="place-category-tag ${catId}">
                      ${categorias.find(c => c.id === catId)?.emoji || ''} ${categorias.find(c => c.id === catId)?.nombreCorto || catId}
                    </span>
                  `).join('')}
                </div>
                
                ${ui.renderInfoBlock('✨', 'POR QUÉ VENIR', lugar.porQueVenir)}
                ${ui.renderInfoBlock('🕐', 'EL MOMENTO', lugar.momentoPerfecto)}
                ${lugar.imprescindibles ? ui.renderListBlock('⭐', 'IMPRESCINDIBLES', lugar.imprescindibles) : ''}
                ${ui.renderInfoBlock('🍽️', 'COMER', lugar.comer)}
                ${ui.renderInfoBlock('🍷', 'BEBER', lugar.tomar)}
                ${lugar.playasYAlrededores ? ui.renderListBlock('🏖️', 'PLAYAS Y ALREDEDORES', lugar.playasYAlrededores) : ''}
                ${ui.renderInfoBlock('🔮', 'SECRETO', lugar.secreto)}
                ${Array.isArray(lugar.masTiempo) ? ui.renderListBlock('⏳', 'MÁS TIEMPO', lugar.masTiempo) : ui.renderInfoBlock('⏳', 'MÁS TIEMPO', lugar.masTiempo)}
                ${lugar.planLluvia ? (Array.isArray(lugar.planLluvia) ? ui.renderListBlock('☔', 'PLAN PARA DÍA DE LLUVIA', lugar.planLluvia) : ui.renderInfoBlock('☔', 'PLAN PARA DÍA DE LLUVIA', lugar.planLluvia)) : ''}
                ${Array.isArray(lugar.advertencias) ? ui.renderListBlock('⚠️', 'ADVERTENCIAS', lugar.advertencias) : ui.renderInfoBlock('⚠️', 'ADVERTENCIAS', lugar.advertencias)}
                ${ui.renderInfoBlock('❤️', 'MI OPINIÓN', lugar.miOpinion)}
                
                <button class="btn-primary" onclick="routeManager.togglePlace(${lugar.id})" style="width:100%; margin-top:16px;">
                  ${state.selectedPlaces.includes(lugar.id) ? '❌ Quitar de la ruta' : '➕ Añadir a la ruta'}
                </button>
              </div>
            </div>
          </article>
        `;
      });

      html += '</div></div></div>';
    });

    container.innerHTML = html;
    ui.initAnimations();
  },

  renderInfoBlock: (icon, title, text) => {
    if (!text) return '';
    return `
      <div class="info-block">
        <div class="info-header">
          <span class="info-icon">${icon}</span>
          <span class="info-title">${title}</span>
        </div>
        <p class="info-text">${text}</p>
      </div>
    `;
  },

  renderListBlock: (icon, title, items) => {
    if (!items?.length) return '';
    return `
      <div class="info-block">
        <div class="info-header">
          <span class="info-icon">${icon}</span>
          <span class="info-title">${title}</span>
        </div>
        <ul class="info-list">
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  },

  toggleProvincia: (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const wasExpanded = element.classList.contains('expanded');

    // Cerrar todos los demás province-box y resetear su scroll al inicio
    const container = element.closest('section') || document.body;
    container.querySelectorAll('.province-box.expanded').forEach(el => {
      if (el.id !== id) {
        el.classList.remove('expanded');
        // Resetear scroll cuando la animación de cierre ya ha terminado (invisible)
        setTimeout(() => {
          const scroll = el.querySelector('.horizontal-scroll');
          if (scroll) scroll.scrollLeft = 0;
        }, 450);
      }
    });

    if (!wasExpanded) {
      element.classList.add('expanded');
      setTimeout(() => {
        const section = element.closest('#recomendaciones, #lugares');
        if (section) {
          const top = element.offsetTop - 70;
          section.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
        // Animación de hint en la primera tarjeta
        const firstCard = element.querySelector('.rec-card');
        if (firstCard) {
          firstCard.classList.remove('rec-scroll-hint');
          void firstCard.offsetWidth; // reflow para reiniciar animación
          firstCard.classList.add('rec-scroll-hint');
          setTimeout(() => firstCard.classList.remove('rec-scroll-hint'), 1200);
        }
      }, 300);
    } else {
      element.classList.remove('expanded');
      // Resetear cuando ya está cerrado y el usuario no lo ve
      setTimeout(() => {
        const scroll = element.querySelector('.horizontal-scroll');
        if (scroll) scroll.scrollLeft = 0;
      }, 450);
    }

    utils.haptic('light');
  },

  togglePlace: (id) => {
    const card = document.getElementById(id);
    if (!card) return;

    const isExpanded = card.classList.toggle('expanded');

    if (isExpanded) {
      setTimeout(() => {
        const section = card.closest('#lugares');
        if (section) {
          const top = card.offsetTop - 70;
          section.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      }, 150);
      utils.haptic('medium');
    } else {
      utils.haptic('light');
    }
  },

  updateFavoriteButton: (id) => {
    const btn = document.querySelector(`.fav-btn[data-id="${id}"]`);
    if (!btn) return;
    const isNowFav = favoritesManager.isFavorite(id);
    btn.classList.toggle('active', isNowFav);

    if (isNowFav) {
      // Animación burst
      btn.classList.remove('burst');
      void btn.offsetWidth;
      btn.classList.add('burst');
      setTimeout(() => btn.classList.remove('burst'), 500);

      // Partículas
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      angles.forEach(angle => {
        const p = document.createElement('span');
        p.className = 'fav-particle';
        const rad = angle * Math.PI / 180;
        const dist = 20 + Math.random() * 10;
        p.style.setProperty('--tx', `${Math.cos(rad) * dist}px`);
        p.style.setProperty('--ty', `${Math.sin(rad) * dist}px`);
        p.style.left = '50%';
        p.style.top  = '50%';
        p.style.marginLeft = '-3px';
        p.style.marginTop  = '-3px';
        btn.appendChild(p);
        setTimeout(() => p.remove(), 550);
      });
    }
  },

  renderFavoritesSection: () => {
    const container = ui.elements.favoritesSection;
    if (!container) return;

    if (state.favorites.length === 0) {
      container.innerHTML = `
        <div class="favorites-empty">
          <div class="empty-state-icon">💙</div>
          <div class="empty-state-title">Sin favoritos aún</div>
          <div class="empty-state-text">Toca el corazón en cualquier lugar para guardarlo</div>
        </div>
      `;
      return;
    }

    let html = `
      <div class="favorites-header">
        <div class="favorites-title">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Mis favoritos
        </div>
        <span class="favorites-count">${state.favorites.length}</span>
      </div>
      <div class="favorites-list">
    `;

    state.favorites.forEach(id => {
      const lugar = lugares.find(l => l.id === id);
      if (!lugar) return;

      html += `
        <div class="favorite-item">
          <img src="${lugar.imagen}" loading="lazy" 
               onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop'" 
               alt="${utils.sanitizeHTML(lugar.nombre)}">
          <div class="favorite-info">
            <div class="favorite-name">${utils.sanitizeHTML(lugar.nombre)}</div>
            <div class="favorite-time">${lugar.horas}h · ${categorias.find(c => c.id === lugar.categorias[0])?.nombreCorto || ''}</div>
          </div>
          <button class="favorite-remove" onclick="favoritesManager.remove(${lugar.id})" aria-label="Eliminar de favoritos">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  },

  updateSelectionUI: () => {
    const totalHours = routeManager.getTotalHours();
    const statsEl = ui.elements.selectionStats;
    if (statsEl) {
      statsEl.textContent = `${state.selectedPlaces.length} lugares · ${totalHours}h`;
    }

    const content = ui.elements.selectionContent;
    if (!content) return;

    if (state.selectedPlaces.length === 0) {
      content.innerHTML = `
        <div class="selection-empty">
          <div class="empty-state-icon">🗺️</div>
          <div class="empty-state-title">Tu ruta está vacía</div>
          <div class="empty-state-text">Toca los puntos en el mapa para añadir lugares</div>
        </div>
      `;
      return;
    }

    let html = '<div class="selection-list">';
    
    state.selectedPlaces.forEach(id => {
      const lugar = lugares.find(l => l.id === id);
      if (!lugar) return;

      html += `
        <div class="selection-item">
          <img src="${lugar.imagen}" class="selection-item-img" loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop'" 
               alt="${utils.sanitizeHTML(lugar.nombre)}">
          <div class="selection-item-info">
            <div class="selection-item-name">${utils.sanitizeHTML(lugar.nombre)}</div>
            <div class="selection-item-time">${lugar.horas}h</div>
          </div>
          <button class="selection-item-remove" onclick="routeManager.togglePlace(${lugar.id})" aria-label="Quitar de la ruta">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `;
    });

    html += '</div>';
    
    html += `
      <div class="action-buttons">
        <button class="btn-primary" onclick="routeManager.generateItinerary()">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Crear ruta en Google Maps
        </button>
        <button class="btn-secondary" onclick="routeManager.clear()">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Limpiar ruta
        </button>
      </div>
    `;

    content.innerHTML = html;
  },

  updateGeoUI: (active, errorMessage = null) => {
    const btn = ui.elements.geoBtn;
    const status = ui.elements.geoStatus;

    if (!btn || !status) return;

    if (active) {
      btn.textContent = 'Desactivar';
      btn.disabled = false;
      btn.style.background = 'var(--accent-red)';
      status.textContent = state.userLocation ? 
        `📍 ${state.userLocation.lat.toFixed(4)}, ${state.userLocation.lng.toFixed(4)}` : 
        'Ubicación activada';
      status.classList.add('active');
    } else {
      btn.textContent = 'Activar';
      btn.disabled = false;
      btn.style.background = '';
      status.textContent = errorMessage || 'Actívala para calcular distancias';
      status.classList.remove('active');
    }
  },

  updateFullscreenUI: () => {
    const totalHours = routeManager.getTotalHours();
    
    if (ui.elements.mapSelectionCount) {
      ui.elements.mapSelectionCount.textContent = `${state.selectedPlaces.length} seleccionados`;
    }
    
    if (ui.elements.mapSelectionTime) {
      ui.elements.mapSelectionTime.textContent = `${totalHours}h`;
    }

    const floatingBtn = ui.elements.mapFloatingSelection;
    const floatingCount = ui.elements.mapFloatingCount;
    
    if (floatingBtn && floatingCount) {
      if (state.selectedPlaces.length > 0) {
        floatingBtn.style.display = 'flex';
        floatingCount.textContent = state.selectedPlaces.length;
      } else {
        floatingBtn.style.display = 'none';
      }
    }

    const placesContainer = ui.elements.mapSelectionPlaces;
    if (!placesContainer) return;

    if (state.selectedPlaces.length === 0) {
      placesContainer.innerHTML = '';
      return;
    }

    let html = '';
    state.selectedPlaces.forEach(id => {
      const lugar = lugares.find(l => l.id === id);
      if (!lugar) return;

      html += `
        <div class="map-selection-chip">
          ${utils.sanitizeHTML(lugar.nombre)}
          <span class="remove" onclick="event.stopPropagation(); routeManager.togglePlace(${lugar.id}); ui.updateFullscreenUI();">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </span>
        </div>
      `;
    });

    placesContainer.innerHTML = html;
  },

  initAnimations: () => {
    if (utils.prefersReducedMotion()) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in, .sr').forEach(el => {
      el.classList.add('sr');
      observer.observe(el);
    });
  },

  showSabiasQue: (callback) => {
    const screen = ui.elements.sabiasQueScreen;
    const texto = ui.elements.textoSabiasQue;
    const barra = ui.elements.sabiasQueProgress;
    
    if (!screen || !texto || !barra) {
      if (callback) callback();
      return;
    }

    const curiosidad = curiosidades[Math.floor(Math.random() * curiosidades.length)];
    texto.innerHTML = curiosidad;
    
    screen.style.display = 'flex';
    screen.style.opacity = '1';
    
    let startTime = null;
    let animationId = null;
    let finished = false;

    function animate(timestamp) {
      if (finished) return;
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / CONFIG.TOTAL_SABIAS_QUE, 1);
      
      barra.style.width = (progress * 100) + '%';
      
      if (elapsed >= CONFIG.TOTAL_SABIAS_QUE) {
        finished = true;
        cerrar();
        return;
      }
      
      animationId = requestAnimationFrame(animate);
    }

    function cerrar() {
      cancelAnimationFrame(animationId);
      screen.style.transition = 'opacity 0.5s ease';
      screen.style.opacity = '0';
      
      setTimeout(() => {
        screen.style.display = 'none';
        screen.style.opacity = '1';
        screen.style.transition = '';
        barra.style.width = '0%';
        texto.style.opacity = '1';
        
        if (callback) callback();
      }, 500);
    }

    screen.addEventListener('click', function saltear() {
      if (finished) return;
      finished = true;
      screen.removeEventListener('click', saltear);
      cerrar();
    });
    
    let touchStartY = 0;
    screen.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    screen.addEventListener('touchend', (e) => {
      if (finished) return;
      const diff = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (diff > 30) {
        finished = true;
        cerrar();
      }
    }, { passive: true });

    animationId = requestAnimationFrame(animate);
  }
};

// ── NAVEGACIÓN ───────────────────────────────────────────────

const navigationManager = {
  SECTION_ORDER: ['hero', 'recomendaciones', 'lugares', 'generador'],
  currentIndex: 0,

  init: () => {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.dataset.section;
        navigationManager.navigateTo(targetId, index);
      });
    });

    // Activar primera sección
    navigationManager.navigateTo('hero', 0);
  },

  navigateTo: (targetId, targetIndex) => {
    if (targetId === state.currentSection) return;

    const fromId = state.currentSection;
    const fromIndex = navigationManager.currentIndex;
    const direction = targetIndex > fromIndex ? 'forward' : 'backward';

    // Actualizar botones
    document.querySelectorAll('.menu-item').forEach((item, idx) => {
      item.classList.toggle('active', idx === targetIndex);
    });

    // Animar transición
    const fromScreen = document.getElementById(fromId);
    const toScreen = document.getElementById(targetId);

    if (fromScreen && toScreen) {
      fromScreen.classList.add(direction === 'forward' ? 'screen-exit-left' : 'screen-exit-right');
      
      setTimeout(() => {
        fromScreen.classList.remove('active-screen', 'screen-exit-left', 'screen-exit-right');
        toScreen.classList.add('active-screen', direction === 'forward' ? 'screen-enter-right' : 'screen-enter-left');
        
        setTimeout(() => {
          toScreen.classList.remove('screen-enter-right', 'screen-enter-left');
        }, 360);
      }, 200);
    }

    state.currentSection = targetId;
    navigationManager.currentIndex = targetIndex;

    window.scrollTo(0, 0);

    if (targetId === 'generador' && state.mainMap) {
      setTimeout(() => {
        state.mainMap.invalidateSize();
        state.mainMap.setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM_DEFAULT);
      }, 300);
    }

    utils.haptic('light');
  }
};

// ── INICIALIZACIÓN PRINCIPAL ──────────────────────────────────

const app = {
  init: () => {
    if (state.appInitialized) {
      console.log('App ya inicializada, ignorando llamada duplicada');
      return;
    }

    console.log('🌊 Inicializando Galicia Guide...');
    
    ui.cacheElements();
    favoritesManager.load();
    geoManager.checkSaved();
    
    ui.renderRecommendations();
    ui.renderPlaces();
    mapManager.init();
    navigationManager.init();
    ui.renderFavoritesSection();
    ui.updateSelectionUI();
    
    // Configurar eventos globales
    window.addEventListener('online', () => {
      state.isOnline = true;
      console.log('Conexión restaurada');
    });

    window.addEventListener('offline', () => {
      state.isOnline = false;
      console.log('Sin conexión');
    });

    state.appInitialized = true;
    console.log('✅ App lista');
  }
};

// ── FLUJO DE AUTENTICACIÓN ───────────────────────────────────

function handleLogin(e) {
  e.preventDefault();
  e.stopPropagation();

  const input = document.getElementById('passwordInput');
  const error = document.getElementById('splashError');
  const value = input.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (value === CONFIG.PASSWORD || value === 'caamanho' || value === 'caamano') {
    // ÉXITO: Guardar auth y mostrar app
    authManager.set(true);
    
    error.textContent = '';
    input.classList.remove('error');

    const splash = document.getElementById('splashScreen');
    const main = document.getElementById('mainContent');

    splash.classList.add('hidden');
    main.classList.add('visible');

    // Mostrar "¿Sabías que?" y luego iniciar app
    setTimeout(() => {
      ui.showSabiasQue(() => {
        app.init();
      });
    }, 300);

  } else {
    // ERROR: Mostrar feedback
    input.classList.add('error');
    error.textContent = 'Contraseña incorrecta';

    setTimeout(() => {
      input.classList.remove('error');
    }, 400);

    input.value = '';
    input.focus();
  }
}

// Evento de login
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('splashForm');
  if (form) {
    form.addEventListener('submit', handleLogin);
  }

  // Verificar si ya está autenticado
  setTimeout(() => {
    if (authManager.check()) {
      // Ya autenticado: mostrar "¿Sabías que?" directamente
      const splash = document.getElementById('splashScreen');
      const main = document.getElementById('mainContent');

      // Ocultar temporalmente para mostrar "¿Sabías que?"
      splash.style.visibility = 'hidden';
      main.style.visibility = 'hidden';

      ui.cacheElements();
      
      ui.showSabiasQue(() => {
        // Restaurar visibilidad y mostrar app
        splash.style.visibility = '';
        main.style.visibility = '';
        
        splash.classList.add('hidden');
        main.classList.add('visible');
        
        app.init();
      });
    }
    // Si no está autenticado, el formulario está listo
  }, 100);
});

// ── EXPONER FUNCIONES GLOBALES ────────────────────────────────

window.toggleProvincia = ui.toggleProvincia;
window.togglePlace = ui.togglePlace;
window.abrirSoloUnaRec = (id) => ui.toggleProvincia(id); // Alias para compatibilidad
window.toggleFavorite = favoritesManager.toggle;
window.removeFavorite = favoritesManager.remove;
window.openFullscreenMap = mapManager.openFullscreen;
window.closeFullscreenMap = mapManager.closeFullscreen;
window.toggleGeolocation = geoManager.toggle;
window.scrollToMapFooter = mapManager.scrollToFooter;
window.togglePlaceSelection = routeManager.togglePlace;
window.togglePlaceFromPopup = (id) => {
  routeManager.togglePlace(id);
  ui.updateFullscreenUI();
};
window.clearSelection = routeManager.clear;
window.generateItinerary = routeManager.generateItinerary;

// Debug: Reset auth
window.resetAuth = () => {
  authManager.set(false);
  localStorage.removeItem('galicia_favorites');
  localStorage.removeItem('galicia_lat');
  localStorage.removeItem('galicia_lng');
  localStorage.removeItem('galicia_last_section');
  localStorage.removeItem('galicia_selected_places');
  location.reload();
};

// Log inicial
console.log('Galicia Guide v' + CONFIG.VERSION + ' cargado. Usa resetAuth() para limpiar sesión.');
