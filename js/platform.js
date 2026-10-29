/* Theme, text size, install prompt and service worker handling. */
import * as store from './store.js';
import { toast } from './ui.js';

var deferred = null;
var listeners = [];
var waiting = null;

function remember(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }

export function applyTheme() {
  var t = store.setting('theme', 'system');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  remember('mvm-theme', t);
}
export function applySize() {
  var s = store.setting('size', 'medium');
  if (s === 'small' || s === 'large') document.documentElement.dataset.size = s; else delete document.documentElement.dataset.size;
  remember('mvm-size', s);
}

export function onInstallChange(fn) { listeners.push(fn); }
function fire() { listeners.forEach(function (f) { f(); }); }

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
export function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
export function canPromptInstall() { return !!deferred; }
export function promptInstall() {
  if (!deferred) return Promise.resolve(false);
  var d = deferred;
  deferred = null;
  fire();
  d.prompt();
  return d.userChoice.then(function (c) { return c.outcome === 'accepted'; }).catch(function () { return false; });
}

window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; fire(); });
window.addEventListener('appinstalled', function () { deferred = null; fire(); toast('Installed. You can open the app from your home screen.'); });

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return Promise.resolve(null);
  return navigator.serviceWorker.register('sw.js').then(function (reg) {
    function offer(w) {
      waiting = w;
      toast('An update is ready.', { label: 'Update now', run: function () { w.postMessage('SKIP_WAITING'); } });
    }
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', function () {
      var w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', function () {
        if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
      });
    });
    var reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
    return reg;
  }).catch(function () { return null; });
}

export function checkForUpdate() {
  if (!('serviceWorker' in navigator)) return Promise.resolve('unsupported');
  return navigator.serviceWorker.getRegistration().then(function (reg) {
    if (!reg) return 'unsupported';
    return reg.update().then(function () {
      var w = reg.waiting || reg.installing;
      if (!w) return 'current';
      if (w.state === 'installed') return 'ready';
      /* A new version is still downloading. It is only usable once it reaches "installed"; if a file is missing it ends as "redundant". */
      return new Promise(function (resolve) {
        var timer = window.setTimeout(function () { resolve('failed'); }, 45000);
        w.addEventListener('statechange', function () {
          if (w.state === 'installed') { window.clearTimeout(timer); resolve('ready'); }
          else if (w.state === 'redundant') { window.clearTimeout(timer); resolve('failed'); }
        });
      });
    });
  }).catch(function () { return 'failed'; });
}

/* Switches to the downloaded version. The page reloads when the new worker takes over. */
export function applyUpdate() {
  if (!('serviceWorker' in navigator)) return Promise.resolve(false);
  return navigator.serviceWorker.getRegistration().then(function (reg) {
    if (!reg || !reg.waiting) return false;
    reg.waiting.postMessage('SKIP_WAITING');
    return true;
  });
}

export function offlineReady() {
  if (!('caches' in window)) return Promise.resolve(false);
  return caches.keys().then(function (k) { return k.some(function (n) { return n.indexOf('mvm-') === 0; }); }).catch(function () { return false; });
}

export function clearCachesAndReload() {
  var p = 'caches' in window ? caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('mvm-') === 0; }).map(function (k) { return caches.delete(k); })); }) : Promise.resolve();
  return p.then(function () {
    return 'serviceWorker' in navigator ? navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }) : null;
  }).then(function () { window.location.reload(); });
}
