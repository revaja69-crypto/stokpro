// Ubah versi cache agar browser mendownload ulang file yang baru
const CACHE_NAME = 'stokpro-v2';

// Semua file ini akan didownload saat pertama kali buka, agar bisa offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Box_icon.svg/192px-Box_icon.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Box_icon.svg/512px-Box_icon.svg.png'
];

// Install Service Worker dan simpan file ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Hapus cache lama jika ada update versi (v1 -> v2)
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

// Intercept request: Ambil dari cache dulu (Offline First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});