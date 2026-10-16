// Shared public shell for the academy and existing Sparring Club PWA.
const CACHE_NAME = 'sparring-club-cache-v20261016-editorial';
const STATIC_ASSETS = [
  '/', '/index.html', '/club.html', '/style.css', '/club.css', '/club-ui.js',
  '/academy.css', '/academy.js', '/booking.js', '/manifest.json', '/icon-192.png', '/icon-512.png',
  '/assets/academy-logo.png', '/assets/first-round-concept.jpg', '/assets/academy-training.webp', '/assets/boxing-mobile.webp', '/assets/boxing-wide.webp', '/assets/pretendard-variable.woff2'
];
const PUBLIC_ASSETS = new Set(STATIC_ASSETS);
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names
    .filter(name => name.startsWith('sparring-club-cache-') && name !== CACHE_NAME)
    .map(name => caches.delete(name)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Never cache API, auth, uploads, Firebase or non-GET requests.
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    const shell = url.pathname === '/' || url.pathname === '/index.html' ? '/index.html'
      : ['/club.html', '/club'].includes(url.pathname) ? '/club.html' : null;
    if (!shell) return;
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(shell, copy)));
      }
      return response;
    }).catch(() => caches.match(shell)));
    return;
  }
  if (!PUBLIC_ASSETS.has(url.pathname) || url.search) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});

// 4. FCM 푸시 알림 백그라운드 수신 이벤트
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || '새로운 알림이 도착했습니다.',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200]
        };
        event.waitUntil(self.registration.showNotification(data.title || '스파링클럽', options));
    }
});

// 5. 알림 클릭 시 앱 열기 이벤트
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/club.html');
        })
    );
});
