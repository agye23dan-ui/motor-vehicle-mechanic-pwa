/* Service worker. Generated into sw.js by scripts/build.js, which fills in VERSION and FILES. */
'use strict';

var VERSION = 'afce6ecd2038';
var CACHE = 'mvm-' + VERSION;
var FILES = [
  "css/app.css",
  "css/studio.css",
  "data/build.js",
  "data/course.js",
  "data/faults/s1.js",
  "data/faults/s2.js",
  "data/faults/s3.js",
  "data/index.js",
  "data/modules/m01.js",
  "data/modules/m02.js",
  "data/modules/m03.js",
  "data/modules/m04.js",
  "data/modules/m05.js",
  "data/modules/m06.js",
  "data/modules/m07.js",
  "data/modules/m08.js",
  "data/modules/m09.js",
  "data/modules/m10.js",
  "data/modules/m11.js",
  "data/modules/m12.js",
  "data/modules/m13.js",
  "data/modules/m14.js",
  "data/modules/m15.js",
  "data/modules/m16.js",
  "data/modules/m17.js",
  "data/modules/m18.js",
  "data/modules/m19.js",
  "data/modules/m20.js",
  "data/modules/m21.js",
  "fonts/archivo-variable.woff2",
  "fonts/atkinson-hyperlegible-latin-400-normal.woff2",
  "fonts/atkinson-hyperlegible-latin-700-normal.woff2",
  "icons/apple-touch-icon.png",
  "icons/favicon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "index.html",
  "js/app.js",
  "js/data.js",
  "js/diagrams/chassis.js",
  "js/diagrams/climate.js",
  "js/diagrams/core.js",
  "js/diagrams/driveline.js",
  "js/diagrams/electrical.js",
  "js/diagrams/engine.js",
  "js/diagrams/extra.js",
  "js/diagrams/extra2.js",
  "js/diagrams/extra3.js",
  "js/diagrams/fuel.js",
  "js/diagrams/general.js",
  "js/diagrams/index.js",
  "js/dom.js",
  "js/engine.js",
  "js/halftone.js",
  "js/icons.js",
  "js/lib.js",
  "js/platform.js",
  "js/render.js",
  "js/sims/aircon.js",
  "js/sims/alignment.js",
  "js/sims/assemble.js",
  "js/sims/assemblies.js",
  "js/sims/assemblies2.js",
  "js/sims/assemblies3.js",
  "js/sims/brakes.js",
  "js/sims/cases-data.js",
  "js/sims/cases.js",
  "js/sims/charging.js",
  "js/sims/circuit.js",
  "js/sims/cooling.js",
  "js/sims/engine.js",
  "js/sims/gearbox.js",
  "js/sims/kit.js",
  "js/sims/scantool.js",
  "js/sims/scope.js",
  "js/sims/toolicons.js",
  "js/sims/vehicle.js",
  "js/srs.js",
  "js/store.js",
  "js/ui.js",
  "js/views/cards.js",
  "js/views/exam.js",
  "js/views/faults.js",
  "js/views/learn.js",
  "js/views/module.js",
  "js/views/progress.js",
  "js/views/question.js",
  "js/views/quiz.js",
  "js/views/settings.js",
  "js/views/studio.js",
  "js/views/study.js",
  "js/views/tools.js",
  "manifest.webmanifest"
];

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
  if (url.origin !== self.location.origin) return;

  /* Every page load gets the app shell, so any #/route works offline. */
  if (req.mode === 'navigate') {
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
