const CACHE_NAME = 'selettas-v2'; // Hemos subido la versión para que se actualice
// Una lista más pequeña y segura de archivos esenciales para guardar
const urlsToCache = [
  '/',
  '/Index.html',
  '/Styles.css',
  '/Script.js',
  '/favicon.png',
  '/Images/icons/icon-192x192.png',
  '/Images/icons/icon-512x512.png'
];

// Evento de instalación: guarda los archivos esenciales en la caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta y guardando archivos esenciales');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Evento de activación: limpia las cachés antiguas
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento de fetch: estrategia "Network First" (primero red, luego caché)
self.addEventListener('fetch', event => {
  event.respondWith(
    // 1. Intenta obtener el recurso de la red
    fetch(event.request)
      .catch(() => {
        // 2. Si falla (estás sin conexión), intenta servirlo desde la caché
        return caches.match(event.request);
      })
  );
});
