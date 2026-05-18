const CACHE_NAME = 'stokpro-v3';

// KITA HANYA CACHE FILE LOKAL YANG KITA PUNYA (Agar tidak gagal install PWA)
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()) // Memaksa service worker baru langsung aktif
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Sistem: Coba ambil dari Cache dulu, jika belum ada, ambil dari internet lalu simpan ke Cache
self.addEventListener('fetch', (event) => {
  // Hanya proses jika URL berawalan http (mengabaikan ekstensi browser dll)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Ambil dari jaringan jika tidak ada di cache
        return fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Simpan yang didownload agar offline berikutnya bisa dipakai
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
  );
});