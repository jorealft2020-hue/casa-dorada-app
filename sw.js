const CACHE_NAME = 'casa-dorada-v2';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then((resp) => {
      const respClone = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(e.request, respClone));
      return resp;
    }).catch(() => caches.match(e.request))
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
