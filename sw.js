// Tony Khan Simulator — offline support. Bump VERSION whenever you upload a new index.html.
const VERSION = 'aegm-v13';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Serve from the cache instantly (works offline), and refresh the cache in the background when online.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // The photo list is checked online first so newly added photos show up right away.
  if (url.pathname.endsWith('/photos/manifest.json')) {
    e.respondWith(caches.open(VERSION).then(cache => fetch(e.request).then(res => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => cache.match(e.request, { ignoreSearch: true }).then(r => r || new Response('{}', { headers: { 'Content-Type': 'application/json' } })))));
    return;
  }
  e.respondWith(caches.open(VERSION).then(async cache => {
    const cached = await cache.match(e.request, { ignoreSearch: true }) ||
                   (e.request.mode === 'navigate' ? await cache.match('./index.html') : undefined);
    const network = fetch(e.request).then(res => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => cached);
    return cached || network;
  }));
});
