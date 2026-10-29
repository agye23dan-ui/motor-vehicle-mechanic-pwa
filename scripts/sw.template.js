/* Service worker. Generated into sw.js by scripts/build.js, which fills in VERSION and FILES. */
'use strict';

var VERSION = '__VERSION__';
var CACHE = 'mvm-' + VERSION;
var FILES = __FILES__;
var LIB_CACHE = 'lib-3d';
var LIB_HOSTS = ['cdn.tailwindcss.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      /* Fetch each file fresh so a half-updated server cache cannot poison the new version. */
      return Promise.all(FILES.map(function (f) {
        return fetch(new Request(f, { cache: 'reload' })).then(function (res) {
          if (!res.ok) throw new Error(f + ' returned ' + res.status);
          return cache.put(f, res);
        });
      }));
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf('mvm-') === 0 && k !== CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (event) {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'GET_VERSION' && event.source) event.source.postMessage({ type: 'VERSION', version: VERSION });
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    /* The 3D engine page loads its libraries from these hosts. Keep a copy after the first visit so it also opens offline.
       The cache has its own name so it survives app updates. */
    if (LIB_HOSTS.indexOf(url.hostname) < 0) return;
    event.respondWith(
      caches.open(LIB_CACHE).then(function (c) {
        return c.match(req).then(function (hit) {
          if (hit) return hit;
          return fetch(req).then(function (res) {
            if (res.ok || res.type === 'opaque') c.put(req, res.clone());
            return res;
          });
        });
      })
    );
    return;
  }

  /* Every page load gets the app shell, so any #/route works offline. The 3D engine page is its own page. */
  if (req.mode === 'navigate' && !/\/engine\.html$/.test(url.pathname)) {
    event.respondWith(
      caches.match('index.html').then(function (hit) {
        return hit || fetch(req);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
