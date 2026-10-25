import { h } from '../dom.js';
import { icon } from '../icons.js';
import * as store from '../store.js';
import * as data from '../data.js';
import { moduleMastery, overallMastery } from '../srs.js';
import { cell, areaColor } from '../halftone.js';
import { fmtMinutes } from '../lib.js';
import { setTitle } from '../ui.js';

/* The lesson to offer next: the one after the last opened, else the first not done. */
export function nextLesson() {
  var idx = data.index();
  var all = [];
  idx.order.forEach(function (id) { idx.modules[id].lessons.forEach(function (l) { all.push(l.id); }); });
  var last = store.get('kv', 'last:lesson');
  var start = last ? all.indexOf(last) : -1;
  for (var i = start + 1; i < all.length; i++) if (!store.get('lessons', all[i])) return all[i];
  for (var j = 0; j < all.length; j++) if (!store.get('lessons', all[j])) return all[j];
  return null;
}

export function lessonHref(lid) {
  var m = /^(m\d+)-l(\d+)$/.exec(lid);
  return '#/module/' + m[1] + '/lesson/' + m[2];
}

export function render() {
  setTitle('');
  var idx = data.index();
  var course = data.course();
  var overall = overallMastery(idx, store.state);
  var root = h('div', null);

  root.appendChild(h('div', { class: 'hero' },
    h('h1', null, course.title),
    h('p', { class: 'lede' }, idx.order.length + ' modules, ' + idx.totals.lessons + ' lessons, ' + idx.totals.quiz + ' quiz questions and ' + idx.totals.cards + ' flashcards. Works offline.')));

  var nl = nextLesson();
  var started = Object.keys(store.state.lessons).length > 0;
  if (nl) {
    var mi = data.moduleInfo(nl.slice(0, 3));
    root.appendChild(h('a', { class: 'continue', href: lessonHref(nl) },
      h('span', { class: 'where' }, started ? 'Continue where you left off' : 'Start here'),
      h('span', { class: 'what' }, data.lessonTitle(nl)),
      h('span', { class: 'where' }, 'Module ' + mi.number + ': ' + mi.short),
      h('span', { class: 'go' }, started ? 'Resume' : 'Begin', icon('chevron', 18))));
  } else {
    root.appendChild(h('div', { class: 'banner' }, icon('check'), h('p', null, 'You have finished every lesson. Keep your knowledge fresh with quizzes and flashcards.')));
  }

  root.appendChild(h('div', { class: 'btn-row' },
    h('a', { class: 'btn', href: '#/search' }, icon('search', 18), 'Search the course'),
    h('a', { class: 'btn', href: '#/plan' }, icon('clock', 18), 'Study plan'),
    h('a', { class: 'btn', href: '#/saved' }, icon('flag', 18), 'Saved and notes'),
    h('a', { class: 'btn', href: '#/logbook' }, icon('list', 18), 'Practical logbook')));

  var chart = h('div', { class: 'chart-wrap' },
    h('div', { class: 'chart-head' }, h('h2', null, 'Your test chart'), h('span', { class: 'big' }, Math.round(overall * 100) + '%')),
    h('div', { class: 'chart' }, idx.order.map(function (id) {
      var m = idx.modules[id];
      var v = moduleMastery(m, store.state);
      return h('a', { href: '#/module/' + id, 'aria-label': 'Module ' + m.number + ', ' + m.short + ', ' + Math.round(v * 100) + ' percent' },
        cell(v, areaColor(m.area), 44), h('span', { class: 'n' }, String(m.number)));
    })),
    h('div', { class: 'legend' }, course.areas.map(function (a) {
      return h('span', null, h('i', { style: { width: '0.8rem', height: '0.8rem', background: areaColor(a.id), display: 'inline-block', 'border-radius': '2px' } }), a.label);
    })),
    h('p', { class: 'small muted', style: { 'margin-top': '0.6rem' } }, 'Bigger dots mean more mastery. Empty paper means not studied yet.'));

  var list = h('div', null);
  function areaLabel(id) { var f = course.areas.filter(function (x) { return x.id === id; })[0]; return f ? f.label : ''; }
  (course.semesters || [{ id: 'all', label: 'All modules', blurb: '', modules: idx.order }]).forEach(function (sem) {
    var mods = sem.modules.filter(function (id) { return idx.modules[id]; });
    var mins = mods.reduce(function (n, id) { return n + idx.modules[id].minutes; }, 0);
    list.appendChild(h('section', { class: 'area semester' },
      h('h2', null, sem.label),
      h('p', null, sem.blurb),
      h('p', { class: 'small muted' }, mods.length + ' modules, ' + fmtMinutes(mins) + ' of reading'),
      h('ul', { class: 'mlist' }, mods.map(function (id) {
        var m = idx.modules[id];
        var v = Math.round(moduleMastery(m, store.state) * 100);
        return h('li', { style: { '--area': areaColor(m.area) } }, h('a', { class: 'mrow', href: '#/module/' + id },
          cell(v / 100, areaColor(m.area), 40),
          h('div', null, h('div', { class: 't' }, m.number + '. ' + m.title),
            h('div', { class: 'meta' }, h('span', null, areaLabel(m.area)), h('span', null, m.lessons.length + ' lessons'), h('span', null, fmtMinutes(m.minutes)), h('span', null, m.quiz + ' questions'))),
          h('div', { class: 'pct' }, String(v), h('small', null, '%'))));
      }))));
  });

  root.appendChild(h('div', { class: 'learn-cols' }, h('div', null, list), h('aside', { class: 'learn-side' }, chart)));
  return root;
}
