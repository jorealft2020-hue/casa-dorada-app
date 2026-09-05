const CACHE_NAME = 'casa-dorada-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  // Estrategia simple: red primero, y si falla usa caché (para poder abrir la app sin señal)
  e.respondWith(
    fetch(e.request).then((resp) => {
      const respClone = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(e.request, respClone));
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
