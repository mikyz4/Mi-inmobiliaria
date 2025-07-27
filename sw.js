// sw.js (Versión Segura - Sin Caché)

// Este evento se dispara cuando el service worker se instala.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalado (versión segura)');
  // Forzamos al nuevo service worker a activarse en cuanto termine la instalación.
  self.skipWaiting();
});

// Este evento se dispara cuando el service worker se activa.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activado (versión segura)');
  // Toma el control de las páginas abiertas.
  return self.clients.claim();
});

// NOTA IMPORTANTE:
// Deliberadamente no hay un evento 'fetch'.
// Esto significa que el service worker no interceptará ninguna petición.
// La web funcionará con normalidad, pidiendo todo a la red como siempre.
