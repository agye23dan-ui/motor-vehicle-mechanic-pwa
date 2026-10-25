/*
 * Local storage for progress.
 *
 * Everything lives on the device in IndexedDB. A copy is held in memory so screens can read
 * progress without waiting. If IndexedDB is blocked (some private modes), the app still works
 * for the session and tells the learner that progress will not be kept.
 */
import { dayKey } from './lib.js';

var DB_NAME = 'mvm';
var DB_VERSION = 1;
export var STORES = ['kv', 'q', 'cards', 'lessons', 'days', 'exams', 'practical'];

export var state = {};
STORES.forEach(function (s) { state[s] = {}; });

export var status = { persistent: false, error: null };

var db = null;
var listeners = [];

export function onChange(fn) {
  listeners.push(fn);
  return function () { listeners = listeners.filter(function (l) { return l !== fn; }); };
}

function emit() {
  listeners.slice().forEach(function (fn) { try { fn(); } catch (e) { /* a view that is gone must not break saving */ } });
}

function openDb() {
  return new Promise(function (resolve, reject) {
    if (!('indexedDB' in window) || !window.indexedDB) { reject(new Error('IndexedDB is not available')); return; }
    var req;
    try { req = window.indexedDB.open(DB_NAME, DB_VERSION); } catch (e) { reject(e); return; }
    req.onupgradeneeded = function () {
      var d = req.result;
      STORES.forEach(function (name) {
        if (!d.objectStoreNames.contains(name)) d.createObjectStore(name);
      });
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error || new Error('Could not open the database')); };
    req.onblocked = function () { reject(new Error('Database is blocked by another tab')); };
  });
}

function readAll(store) {
  return new Promise(function (resolve, reject) {
    var out = {};
    var tx = db.transaction(store, 'readonly');
    var req = tx.objectStore(store).openCursor();
    req.onsuccess = function () {
      var cur = req.result;
      if (cur) { out[cur.key] = cur.value; cur.continue(); } else resolve(out);
    };
    req.onerror = function () { reject(req.error); };
  });
}

export function init() {
  return openDb().then(function (d) {
    db = d;
    db.onversionchange = function () { db.close(); db = null; status.persistent = false; };
    return Promise.all(STORES.map(function (s) {
      return readAll(s).then(function (data) { state[s] = data; });
    }));
  }).then(function () {
    status.persistent = true;
  }).catch(function (err) {
    db = null;
    status.persistent = false;
    status.error = err && err.message ? err.message : String(err);
  });
}

function write(store, key, value) {
  if (!db) return Promise.resolve();
  return new Promise(function (resolve) {
    try {
      var tx = db.transaction(store, 'readwrite');
      if (value === undefined) tx.objectStore(store).delete(key);
      else tx.objectStore(store).put(value, key);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = tx.onabort = function () {
        status.error = (tx.error && tx.error.message) || 'Saving failed';
        status.persistent = false;
        emit();
        resolve();
      };
    } catch (e) {
      status.error = e.message;
      status.persistent = false;
      emit();
      resolve();
    }
  });
}

export function get(store, key) {
  return state[store][key];
}

export function set(store, key, value) {
  state[store][key] = value;
  var p = write(store, key, value);
  emit();
  return p;
}

export function remove(store, key) {
  delete state[store][key];
  var p = write(store, key, undefined);
  emit();
  return p;
}

/* Adds to today's activity count. field is 'q', 'cards' or 'lessons'. */
export function bumpDay(field, amount) {
  var key = dayKey();
  var d = state.days[key] || { q: 0, cards: 0, lessons: 0 };
  var next = { q: d.q || 0, cards: d.cards || 0, lessons: d.lessons || 0 };
  next[field] += amount === undefined ? 1 : amount;
  return set('days', key, next);
}

export function setting(name, fallback) {
  var v = state.kv['setting:' + name];
  return v === undefined ? fallback : v;
}

export function setSetting(name, value) {
  return set('kv', 'setting:' + name, value);
}

/* Asks the browser not to evict saved progress when the device is short of space. */
export function requestPersistence() {
  if (navigator.storage && navigator.storage.persist) {
    return navigator.storage.persist().catch(function () { return false; });
  }
  return Promise.resolve(false);
}

export function exportData() {
  var data = {};
  STORES.forEach(function (s) { data[s] = state[s]; });
  return {
    app: 'motor-vehicle-mechanic',
    schema: 1,
    exportedAt: new Date().toISOString(),
    data: data
  };
}

function isPlainObject(x) {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}

/* Throws an Error with a plain message when the file is not a valid backup. */
export function checkBackup(obj) {
  if (!isPlainObject(obj) || obj.app !== 'motor-vehicle-mechanic') throw new Error('This file is not a backup from this app.');
  if (obj.schema !== 1) throw new Error('This backup comes from a different version of the app.');
  if (!isPlainObject(obj.data)) throw new Error('The backup has no data in it.');
  STORES.forEach(function (s) {
    if (obj.data[s] !== undefined && !isPlainObject(obj.data[s])) throw new Error('The backup is damaged (' + s + ').');
  });
  var q = obj.data.q || {};
  Object.keys(q).forEach(function (k) {
    var v = q[k];
    if (!isPlainObject(v) || typeof v.box !== 'number' || v.box < 0 || v.box > 5) throw new Error('The backup is damaged (question ' + k + ').');
  });
  var cards = obj.data.cards || {};
  Object.keys(cards).forEach(function (k) {
    var v = cards[k];
    if (!isPlainObject(v) || typeof v.box !== 'number' || v.box < 0 || v.box > 5) throw new Error('The backup is damaged (card ' + k + ').');
  });
  return true;
}

function clearStore(name) {
  if (!db) return Promise.resolve();
  return new Promise(function (resolve) {
    try {
      var tx = db.transaction(name, 'readwrite');
      tx.objectStore(name).clear();
      tx.oncomplete = function () { resolve(); };
      tx.onerror = tx.onabort = function () { resolve(); };
    } catch (e) { resolve(); }
  });
}

export function replaceAll(obj) {
  checkBackup(obj);
  var writes = [];
  STORES.forEach(function (s) {
    state[s] = {};
    writes.push(clearStore(s).then(function () {
      var data = obj.data[s] || {};
      var keys = Object.keys(data);
      state[s] = {};
      return Promise.all(keys.map(function (k) {
        state[s][k] = data[k];
        return write(s, k, data[k]);
      }));
    }));
  });
  return Promise.all(writes).then(emit);
}

/* Keeps the learner's settings (theme, text size) but removes all study progress. */
export function resetProgress() {
  var keepSettings = {};
  Object.keys(state.kv).forEach(function (k) {
    if (k.indexOf('setting:') === 0) keepSettings[k] = state.kv[k];
  });
  var obj = { app: 'motor-vehicle-mechanic', schema: 1, data: { kv: keepSettings } };
  return replaceAll(obj);
}
