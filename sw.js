const CACHE_NAME = 'casa-dorada-v3';

// MODO OFFLINE BÁSICO: se precargan los archivos esenciales de la app apenas
// se instala el service worker, para que funcione sin conexión desde la
// PRIMERA vez (antes solo se guardaba en caché lo que ya se había visitado).
const ARCHIVOS_ESENCIALES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_ESENCIALES)).catch((err) => console.error('Error precargando app shell:', err))
  );
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((nombres) => Promise.all(
      nombres.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
    ))
  );
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then((resp) => {
      const respClone = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(e.request, respClone));
      return resp;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});

/* ===== ALARMAS PROPIAS (push notifications con sonido/vibracion) ===== */
self.addEventListener('push', (event) => {
  let data = { title: 'Casa Dorada', body: 'Tienes un recordatorio pendiente.' };
  try { data = event.data.json(); } catch (e) {}

  const options = {
    body: data.body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [300, 150, 300, 150, 300],
    tag: data.tag || 'casa-dorada-alarma',
    requireInteraction: true,
    data: { url: './' },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
