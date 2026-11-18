// Offline support: serve from cache instantly, refresh the cache in the background.
const CACHE = 'mygym-v5';
const FILES = [
  './', './index.html', './css/app.css', './manifest.webmanifest',
  './js/app.js', './js/diagram.js', './js/exercises.js', './js/program.js', './js/logic.js', './js/store.js', './js/charts.js', './js/bodymap.js', './js/howto.js', './js/foods.js', './js/ai.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Network first (so updates show up right away), cache if offline or slow (>3 s).
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; });
      const slow = new Promise((r) => setTimeout(r, 3000)).then(() => cache.match(req, { ignoreSearch: true }));
      try {
        const res = await Promise.race([net, slow]);
        return res || (await net);
      } catch {
        return (await cache.match(req, { ignoreSearch: true })) || Response.error();
      }
    })
  );
});
