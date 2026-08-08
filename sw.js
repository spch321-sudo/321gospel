/* =========================================================
   321 福音同行　Service Worker
   國度321空中團契
   每次更新內容，只要改下面這一行的版本號即可。
   ========================================================= */
const VERSION = '4.4.1';
const CACHE = 'g321-' + VERSION;

/* 預先快取：離線也要能完整使用的檔案 */
const PRECACHE = [
  './',
  './index.html',
  './a01-new-life.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(
        PRECACHE.map(u => c.add(u).catch(() => null))   // 單一檔案失敗不拖垮整批
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // 外站資源交給瀏覽器自己處理

  /* 頁面導覽：網路優先，離線時回快取。這樣使用者一開 App 就拿到最新版。 */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  /* 其他同站資源：快取優先，背景默默更新 */
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req)
        .then(res => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

/* 供「強制更新」等情境使用 */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
