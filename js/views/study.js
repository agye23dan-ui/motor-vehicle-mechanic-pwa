import { h } from '../dom.js';
import { icon } from '../icons.js';
import * as store from '../store.js';
import * as data from '../data.js';
import { stripMarkup } from '../lib.js';
import { crumb, pageHead, setTitle, loading, failure } from '../ui.js';

/* Search across the course, saved lessons and notes, and a weekly study plan. */

var BM = 'bm:', NOTE = 'note:';

export function isSaved(lid) { return !!store.get('kv', BM + lid); }
export function toggleSaved(lid) {
  if (isSaved(lid)) store.remove('kv', BM + lid); else store.set('kv', BM + lid, Date.now());
  return isSaved(lid);
}
export function getNote(lid) { return store.get('kv', NOTE + lid) || ''; }
export function setNote(lid, text) {
  if (text.trim()) store.set('kv', NOTE + lid, text); else store.remove('kv', NOTE + lid);
}

function hrefOf(lid) {
  var m = /^(m\d+)-l(\d+)$/.exec(lid);
  return '#/module/' + m[1] + '/lesson/' + m[2];
}

function blockText(b) {
  var out = [];
  if (b.text) out.push(b.text);
  if (b.items) out = out.concat(b.items);
  if (b.steps) out = out.concat(b.steps);
  if (b.title) out.push(b.title);
  if (b.rows) b.rows.forEach(function (r) { out.push(r.join(' ')); });
  return out.map(stripMarkup);
}

var indexCache = null;
function buildIndex() {
  if (indexCache) return Promise.resolve(indexCache);
  return Promise.all([data.loadAll(), data.loadFaults()]).then(function (res) {
    var list = [];
    data.index().order.forEach(function (id) {
      var m = window.MVM.modules[id], info = data.moduleInfo(id);
      m.lessons.forEach(function (l) {
        var parts = [];
        l.body.forEach(function (b) { parts = parts.concat(blockText(b)); });
        list.push({ kind: 'Lesson', href: hrefOf(l.id), title: l.title, where: 'Module ' + info.number + ': ' + info.short, text: parts.join(' ') });
      });
    });
    res[1].forEach(function (f) {
      var info = data.moduleInfo(f.mod);
      list.push({ kind: 'Fault', href: '#/faults/' + f.id, title: f.title, where: info ? 'Module ' + info.number + ': ' + info.short : '', text: f.causes.concat(f.diagnose, f.repair).map(stripMarkup).join(' ') });
    });
    indexCache = list;
    return list;
  });
}

function snippet(text, words) {
  var low = text.toLowerCase(), at = -1;
  for (var i = 0; i < words.length && at < 0; i++) at = low.indexOf(words[i]);
  if (at < 0) return text.slice(0, 140);
  var start = Math.max(0, at - 50);
  return (start ? '…' : '') + text.slice(start, start + 170) + '…';
}

export function search() {
  setTitle('Search');
  var holder = h('div', null, loading());
  buildIndex().then(function (all) {
    var input = h('input', { class: 'search', type: 'search', placeholder: 'Search every lesson and fault, for example voltage drop', 'aria-label': 'Search the course' });
    var count = h('p', { class: 'small muted', role: 'status' });
    var list = h('ul', { class: 'result-list' });
    function draw() {
      var q = input.value.trim().toLowerCase();
      list.replaceChildren();
      if (q.length < 2) { count.textContent = 'Type at least two letters.'; return; }
      var words = q.split(/\s+/);
      var hits = [];
      all.forEach(function (e) {
        var t = e.title.toLowerCase(), body = e.text.toLowerCase(), score = 0, ok = true;
        words.forEach(function (w) {
          var inT = t.indexOf(w) >= 0, inB = body.indexOf(w) >= 0;
          if (!inT && !inB) ok = false;
          score += (inT ? 10 : 0) + (inB ? 1 : 0);
        });
        if (ok) hits.push({ e: e, score: score });
      });
      hits.sort(function (a, b) { return b.score - a.score; });
      count.textContent = hits.length + (hits.length === 1 ? ' result' : ' results') + (hits.length > 40 ? ', showing the best 40.' : '.');
      hits.slice(0, 40).forEach(function (x) {
        list.appendChild(h('li', null, h('a', { href: x.e.href },
          h('span', { class: 'rk' }, x.e.kind), h('strong', null, x.e.title), h('span', { class: 'small muted' }, x.e.where),
          h('span', { class: 'sn' }, snippet(x.e.text, words)))));
      });
    }
    input.addEventListener('input', draw);
    draw();
    holder.replaceChildren(h('div', null, crumb('#/learn', 'Learn'), pageHead('Search', 'Find any term across all lessons and faults.'), input, count, list));
    input.focus();
  }).catch(function (e) { holder.replaceChildren(failure(e)); });
  return holder;
}

export function saved() {
  setTitle('Saved and notes');
  var s = store.state.kv;
  var bms = Object.keys(s).filter(function (k) { return k.indexOf(BM) === 0; }).map(function (k) { return k.slice(BM.length); });
  var notes = Object.keys(s).filter(function (k) { return k.indexOf(NOTE) === 0; }).map(function (k) { return k.slice(NOTE.length); });
  function row(lid, extra) {
    return h('li', null, h('a', { class: 'mrow', href: hrefOf(lid) },
      h('span', { class: 'pct' }, 'M' + parseInt(lid.slice(1, 3), 10)),
      h('div', null, h('div', { class: 't' }, data.lessonTitle(lid)), extra ? h('div', { class: 'meta' }, h('span', null, extra)) : null), icon('chevron', 18)));
  }
  function byLesson(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
  return h('div', null, crumb('#/learn', 'Learn'), pageHead('Saved and notes', 'Lessons you bookmarked and the notes you wrote. They stay on this device, and they are included in your backup.'),
    h('section', { class: 'section' }, h('h2', null, 'Bookmarked lessons'),
      bms.length ? h('ul', { class: 'mlist' }, bms.sort(byLesson).map(function (l) { return row(l); })) : h('p', { class: 'empty' }, 'Nothing saved yet. Use the bookmark button on any lesson.')),
    h('section', { class: 'section' }, h('h2', null, 'My notes'),
      notes.length ? h('ul', { class: 'mlist' }, notes.sort(byLesson).map(function (l) { var t = getNote(l); return row(l, t.length > 90 ? t.slice(0, 90) + '…' : t); })) : h('p', { class: 'empty' }, 'No notes yet. Write notes under any lesson.')));
}

/* ---------- Study plan ---------- */
var WEEKS = 15;

function lessonsOf(sem) {
  var out = [];
  sem.modules.forEach(function (mid) { data.moduleInfo(mid).lessons.forEach(function (l) { out.push(l.id); }); });
  return out;
}

export function plan() {
  setTitle('Study plan');
  var course = data.course();
  var root = h('div', null, crumb('#/learn', 'Learn'),
    pageHead('Study plan', 'Each semester is spread over ' + WEEKS + ' weeks. Pick the date your semester starts and the plan shows what to read each week and whether you are on track.'));
  course.semesters.forEach(function (sem) {
    var ids = lessonsOf(sem), per = Math.ceil(ids.length / WEEKS);
    var key = 'plan:' + sem.id;
    var start = store.get('kv', key) || '';
    var body = h('div', null);
    var done = ids.filter(function (l) { return store.get('lessons', l); }).length;
    var date = h('input', { type: 'date', value: start, 'aria-label': sem.label + ' start date' });
    function draw() {
      var weekNow = -1;
      if (date.value) {
        var days = Math.floor((Date.now() - new Date(date.value + 'T00:00:00').getTime()) / 86400000);
        weekNow = Math.floor(days / 7);
      }
      var dueByNow = weekNow < 0 ? 0 : Math.min(ids.length, (Math.min(weekNow, WEEKS - 1) + 1) * per);
      var status = '';
      if (weekNow < 0 && date.value) status = 'This semester has not started yet.';
      else if (date.value) status = done >= dueByNow ? 'On track: you are ' + (done - dueByNow) + ' lessons ahead of the plan.' : 'Behind: ' + (dueByNow - done) + ' lessons to catch up.';
      var weeks = [];
      for (var w = 0; w < WEEKS; w++) {
        var chunk = ids.slice(w * per, (w + 1) * per);
        if (!chunk.length) break;
        weeks.push(h('li', { class: 'plan-week' + (w === weekNow ? ' now' : '') },
          h('strong', null, 'Week ' + (w + 1) + (w === weekNow ? ' (this week)' : '')),
          h('ul', null, chunk.map(function (l) {
            var d = !!store.get('lessons', l);
            return h('li', { class: d ? 'done' : '' }, h('a', { href: hrefOf(l) }, (d ? '✓ ' : '') + data.lessonTitle(l)), h('span', { class: 'small muted' }, ' M' + parseInt(l.slice(1, 3), 10)));
          }))));
      }
      body.replaceChildren(h('p', { class: 'small muted', role: 'status' }, done + ' of ' + ids.length + ' lessons done. ' + status), h('ol', { class: 'plan-weeks' }, weeks));
    }
    date.addEventListener('change', function () { if (date.value) store.set('kv', key, date.value); else store.remove('kv', key); draw(); });
    draw();
    root.appendChild(h('section', { class: 'section' }, h('h2', null, sem.label),
      h('div', { class: 'field' }, h('label', null, 'Start date'), date), body));
  });
  return root;
}
