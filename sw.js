// Tony Khan Simulator — offline support. Bump VERSION whenever you upload a new index.html.
const VERSION = 'aegm-v38';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './online.js', './firebase-sdk.js', './firebase-config.js',
  './party.js', './vendor/peerjs.min.js', './vendor/qrcode.js'];

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
  // The photo list and the Firebase settings are checked online first so changes show up right away.
  const fresh = url.pathname.endsWith('/photos/manifest.json') ? '{}' : url.pathname.endsWith('/firebase-config.js') ? '' : null;
  if (fresh !== null) {
    const type = fresh ? 'application/json' : 'text/javascript';
    e.respondWith(caches.open(VERSION).then(cache => fetch(e.request).then(res => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => cache.match(e.request, { ignoreSearch: true }).then(r => r || new Response(fresh, { headers: { 'Content-Type': type } })))));
    return;
  }
  // Pages are stored under one key (./index.html) so ?game=CODE links don't pile up copies in the cache.
  const nav = e.request.mode === 'navigate';
  const key = nav ? './index.html' : e.request;
  const cacheP = caches.open(VERSION);
  const network = cacheP.then(cache => fetch(e.request).then(res => {
    if (res.ok && res.type === 'basic') return cache.put(key, res.clone()).then(() => res, () => res);
    return res;
  }));
  // Keep the service worker alive until the background refresh has been written to the cache.
  e.waitUntil(network.catch(() => {}));
  e.respondWith(cacheP.then(async cache => {
    const cached = await cache.match(key, { ignoreSearch: true });
    return cached || network.catch(() => new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }));
  }));
});

// Turn alerts from an online league (sent by Firebase Cloud Messaging).
self.addEventListener('push', e => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (err) { p = { data: { body: e.data && e.data.text() } }; }
  const d = Object.assign({}, p.notification || {}, p.data || {});
  e.waitUntil(self.registration.showNotification(d.title || 'Tony Khan Simulator', {
    body: d.body || "It's your turn!",
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'tksim-' + (d.code || 'turn'),
    renotify: true,
    data: { url: d.url || './', code: d.code || '' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) { c.postMessage({ tksim: 'open', code: e.notification.data.code }); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
