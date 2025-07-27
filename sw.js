const CACHE_NAME = 'selettas-v1';
// Lista de archivos que se guardarán en caché para funcionar offline
const urlsToCache = [
  '/',
  '/Index.html',
  '/Ver-anuncios.html',
  '/login.html',
  '/registro.html',
  '/admin.html',
  '/mis-anuncios.html',
  '/favoritos.html',
  '/Anuncio.html',
  '/Styles.css',
  '/Script.js',
  '/favicon.png' 
];

// Evento de instalación: se abre la caché y se añaden los archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch: responde desde la caché si es posible
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el recurso está en la caché, lo devuelve. Si no, lo busca en la red.
        return response || fetch(event.request);
      })
  );
});
