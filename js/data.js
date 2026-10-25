/*
 * Course data access. The index (titles, counts) is loaded with the page. Each module's full
 * content is a separate script loaded on demand; the service worker keeps them all offline.
 */
var pending = {};

export function course() { return window.MVM.course; }
export function index() { return window.MVM.index; }

export function moduleInfo(id) {
  return window.MVM.index.modules[id] || null;
}

export function areaOf(id) {
  var info = moduleInfo(id);
  if (!info) return null;
  var areas = window.MVM.course.areas;
  for (var i = 0; i < areas.length; i++) if (areas[i].id === info.area) return areas[i];
  return null;
}

export function courseModule(id) {
  var list = window.MVM.course.modules;
  for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  return null;
}

export function loadModule(id) {
  var loaded = window.MVM.modules[id];
  if (loaded) return Promise.resolve(loaded);
  if (!moduleInfo(id)) return Promise.reject(new Error('Unknown module ' + id));
  if (pending[id]) return pending[id];
  pending[id] = new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = 'data/modules/' + id + '.js';
    s.async = true;
    s.onload = function () {
      if (window.MVM.modules[id]) resolve(window.MVM.modules[id]);
      else { delete pending[id]; reject(new Error('Module ' + id + ' did not register')); }
    };
    s.onerror = function () {
      delete pending[id];
      reject(new Error('Could not load module ' + id + '. Check your connection, or open the app once while online so it can save the lessons for offline use.'));
    };
    document.head.appendChild(s);
  });
  return pending[id];
}

export function loadModules(ids) {
  return Promise.all(ids.map(loadModule));
}

export function loadAll() {
  return loadModules(window.MVM.index.order);
}

/* All questions for the given module ids, each tagged with its module. Modules must be loaded. */
export function questionsFor(ids) {
  var out = [];
  ids.forEach(function (id) {
    var m = window.MVM.modules[id];
    if (m) m.quiz.forEach(function (q) { out.push(q); });
  });
  return out;
}

export function cardsFor(ids) {
  var out = [];
  ids.forEach(function (id) {
    var m = window.MVM.modules[id];
    if (m) m.cards.forEach(function (c) { out.push(c); });
  });
  return out;
}

export function findQuestion(id) {
  var m = window.MVM.modules[id.slice(0, 3)];
  if (!m) return null;
  for (var i = 0; i < m.quiz.length; i++) if (m.quiz[i].id === id) return m.quiz[i];
  return null;
}

export function findCard(id) {
  var m = window.MVM.modules[id.slice(0, 3)];
  if (!m) return null;
  for (var i = 0; i < m.cards.length; i++) if (m.cards[i].id === id) return m.cards[i];
  return null;
}

export function lessonTitle(lessonIdValue) {
  var info = moduleInfo(lessonIdValue.slice(0, 3));
  if (!info) return '';
  for (var i = 0; i < info.lessons.length; i++) if (info.lessons[i].id === lessonIdValue) return info.lessons[i].title;
  return '';
}

export function lessonNumber(lessonIdValue) {
  var m = /-l(\d+)$/.exec(lessonIdValue);
  return m ? parseInt(m[1], 10) : 0;
}

var FAULT_FILES = ['s1', 's2', 's3'];
var faultsPending = null;

/* The fault finder library. Loaded on first use, kept offline by the service worker. */
export function loadFaults() {
  if (window.MVM.faults && window.MVM.faultsLoaded) return Promise.resolve(window.MVM.faults);
  if (faultsPending) return faultsPending;
  window.MVM.faults = [];
  faultsPending = Promise.all(FAULT_FILES.map(function (f) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'data/faults/' + f + '.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Could not load the fault finder. Open the app once while online so it can save it for offline use.')); };
      document.head.appendChild(s);
    });
  })).then(function () {
    window.MVM.faultsLoaded = true;
    window.MVM.faults.sort(function (a, b) { return a.mod < b.mod ? -1 : a.mod > b.mod ? 1 : 0; });
    return window.MVM.faults;
  }, function (e) { faultsPending = null; window.MVM.faults = []; throw e; });
  return faultsPending;
}
