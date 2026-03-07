// 🔥 스파링클럽 통합 서비스 워커 파일 (캐싱 & 푸시 알림 완벽 지원)

const CACHE_NAME = 'sparring-club-cache-v20260307';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json',
    '/logo.png',
    '/icon-192.png',
    '/icon-512.png'
];

// 1. Install 이벤트: 파일 캐싱
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] 정적 에셋 캐싱 중...');
            return cache.addAll(STATIC_ASSETS).catch(err => console.warn('일부 캐시 실패(무시가능):', err));
        })
    );
});

// 2. Activate 이벤트: 구버전 캐시 삭제 및 제어권 즉시 획득
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] 이전 캐시 삭제:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// 3. Fetch 이벤트: 네트워크 우선(Network First) 전략
self.addEventListener('fetch', (event) => {
    // API 요청이나 외부 스토리지 요청은 캐싱하지 않음
    if (!event.request.url.startsWith(self.location.origin)) return;

    if (event.request.mode === 'navigate' || event.request.url.includes('/index.html')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request).then((response) => {
                    // 응답이 정상일 때만 캐시에 저장
                    if(response && response.status === 200 && response.type === 'basic') {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                });
            })
        );
    }
});

// 4. FCM 푸시 알림 백그라운드 수신 이벤트
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || '새로운 알림이 도착했습니다.',
            icon: '/logo.png',
            badge: '/logo.png',
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
            return clients.openWindow('/');
        })
    );
});