// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  console.log('Push notification received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || '레버리지 투자 도우미';
  const options = {
    body: data.body || '새로운 알림이 있습니다.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});
