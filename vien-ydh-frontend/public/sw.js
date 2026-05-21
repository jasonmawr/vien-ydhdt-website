const CACHE_NAME = 'vienydhdt-v1';
const STATIC_PAGES = ['/', '/gioi-thieu', '/bac-si', '/dat-lich', '/lien-he', '/tin-tuc', '/faq'];
const STATIC_ASSETS = [
  '/manifest.json',
  '/images/logo.png',
  '/images/hero_medicine.png',
];

// Install: pre-cache key static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {})
    ).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - API calls: network-first, fallback to cache
// - Static pages: stale-while-revalidate
// - Assets (images, fonts): cache-first with network fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // API: network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static images & fonts: cache-first
  if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg|woff2?|ttf)$/)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached || fetch(event.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Navigation pages: stale-while-revalidate
  if (event.request.mode === 'navigate' || STATIC_PAGES.some((p) => url.pathname === p)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((res) => {
          caches.open(CACHE_NAME).then((c) => c.put(event.request, res.clone()));
          return res;
        });
        return cached || fetchPromise;
      })
    );
  }
});
