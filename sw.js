/* GreenMap AI service worker.
   Pages: network first (so every GitHub push shows up at once), cached copy when offline.
   Static files and CDN libraries: cached, refreshed in the background.
   Firestore, weather, geocoding, map tiles and the Render backend are never touched. */
const CACHE = 'greenmap-v1';
const SHELL = [
  'GreenMap_App.html', 'EnergyHub.html', 'Energy_Scope.html',
  'Smart_Energy_Search.html', 'Govt_Schemes.html', 'offline.html',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png'
];
const CDN_HOSTS = ['unpkg.com', 'www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function timeout(ms) {
  return new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); });
}

function pageKey(url) { var u = new URL(url); u.search = ''; u.hash = ''; return u.href; }

async function networkFirstPage(req) {
  const cache = await caches.open(CACHE);
  const key = pageKey(req.url);
  try {
    const res = await Promise.race([fetch(req), timeout(6000)]);
    if (res && res.ok) cache.put(key, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(key);
    return hit || (await cache.match('offline.html')) || Response.error();
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  const fresh = fetch(req).then(function (res) {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(function () { return null; });
  return hit || (await fresh) || Response.error();
}

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin && (req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') > -1)) {
    e.respondWith(networkFirstPage(req));
    return;
  }
  if (sameOrigin || CDN_HOSTS.indexOf(url.hostname) > -1) {
    e.respondWith(staleWhileRevalidate(req));
  }
});
