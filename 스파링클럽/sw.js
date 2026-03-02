// 서비스 워커 파일 (sw.js)

const CACHE_NAME = 'sparring-club-v1';
// 캐싱할 파일 목록 (우선 핵심 파일만 등록)
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json'
];

// 1. 설치 단계: 필요한 파일들을 브라우저 창고(Cache)에 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] 파일 캐싱 중...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 2. 활성화 단계: 오래된 캐시 삭제 및 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] 이전 캐시 삭제 중:', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// 3. 호출 단계: 네트워크가 안 될 때 저장된 파일을 대신 보여줌
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});