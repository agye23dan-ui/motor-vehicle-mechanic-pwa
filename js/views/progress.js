import { h } from '../dom.js';
import { icon } from '../icons.js';
import * as store from '../store.js';
import * as data from '../data.js';
import { moduleParts, moduleMastery, overallMastery, isDue } from '../srs.js';
import { cell, strip, areaColor } from '../halftone.js';
import { dayKey, addDays, streak, longestStreak, plural } from '../lib.js';
import { pageHead, setTitle, loading } from '../ui.js';
import { historyList } from './exam.js';
import { lessonLink } from './quiz.js';

function kpi(v, k, ic) {
  return h('div', { class: 'kpi' }, h('div', { class: 'v' }, ic ? icon(ic, 24) : null, String(v)), h('div', { class: 'k' }, k));
}

export function render() {
  setTitle('Progress');
  var idx = data.index();
  var s = store.state;
  var today = dayKey();
  var root = h('div', null, pageHead('Progress', 'Everything here is stored on this device only.'));
  var lessonsDone = Object.keys(s.lessons).length;
  var answered = Object.keys(s.q).length;
  var cur = streak(s.days, today);
  var exams = Object.keys(s.exams).map(function (k) { return s.exams[k]; }).sort(function (a, b) { return b.ts - a.ts; });
  var overall = Math.round(overallMastery(idx, s) * 100);

  root.appendChild(h('div', { class: 'kpis' },
    kpi(overall + '%', 'Overall mastery'), kpi(cur, cur === 1 ? 'Day streak' : 'Days in a row', 'flame'),
    kpi(lessonsDone + '/' + idx.totals.lessons, 'Lessons done'), kpi(answered + '/' + idx.totals.quiz, 'Questions seen')));

  var dots = h('div', { class: 'dots14', role: 'img', 'aria-label': 'Study activity over the last 14 days' });
  for (var i = 13; i >= 0; i--) {
    var k = addDays(today, -i);
    var d = s.days[k];
    var n = d ? (d.q || 0) + (d.cards || 0) + (d.lessons || 0) : 0;
    dots.appendChild(cell(Math.min(1, n / 20), 'var(--ink)', 22));
  }
  root.appendChild(h('section', { class: 'section' }, h('h2', null, 'Last 14 days'), dots,
    h('p', { class: 'small muted' }, 'Longest streak: ' + plural(longestStreak(s.days), 'day', 'days') + '. Bigger dots mean more study that day.')));

  root.appendChild(h('section', { class: 'section' }, h('h2', null, 'By module'),
    idx.order.map(function (id) {
      var m = idx.modules[id];
      var p = moduleParts(m, s);
      var v = Math.round(moduleMastery(m, s) * 100);
      return h('a', { class: 'prow', href: '#/module/' + id },
        h('span', { class: 't' }, m.number + '. ' + m.short), h('span', { class: 'pct' }, v + '%'),
        h('span', { style: { 'grid-column': '1 / -1' } }, strip(v / 100, areaColor(m.area), 20)),
        h('span', { class: 'parts' }, h('span', null, 'Lessons ' + p.lessonsDone + '/' + m.lessons.length), h('span', null, 'Quiz ' + Math.round(p.quiz * 100) + '%'), h('span', null, 'Cards ' + Math.round(p.cards * 100) + '%')));
    })));

  root.appendChild(h('section', { class: 'section' }, h('h2', null, 'Exam history'),
    exams.length ? historyList(exams.slice(0, 10)) : h('p', { class: 'empty' }, h('strong', null, 'No exams yet. '), 'Take the timed exam to see how you score.')));

  var weakHolder = h('section', { class: 'section' }, h('h2', null, 'Lessons to revisit'), loading());
  root.appendChild(weakHolder);
  var weakIds = Object.keys(s.q).filter(function (id) { var q = s.q[id]; return q.wrong > 0 && (q.box <= 2 || q.wrong > q.right); });
  var mods = {};
  weakIds.forEach(function (id) { mods[id.slice(0, 3)] = 1; });
  data.loadModules(Object.keys(mods)).then(function () {
    var by = {};
    weakIds.forEach(function (id) { var q = data.findQuestion(id); if (q) by[q.lesson] = (by[q.lesson] || 0) + 1; });
    var list = Object.keys(by).sort(function (a, b) { return by[b] - by[a]; }).slice(0, 6);
    weakHolder.replaceChildren(h('h2', null, 'Lessons to revisit'), list.length
      ? h('ul', { class: 'mlist' }, list.map(function (lid) {
        return h('li', null, h('a', { class: 'mrow', href: lessonLink(lid) }, h('span', { class: 'pct' }, String(by[lid])), h('div', null, h('div', { class: 't' }, data.lessonTitle(lid)),
          h('div', { class: 'meta' }, plural(by[lid], 'question', 'questions') + ' to practise')), icon('chevron', 18)));
      }))
      : h('p', { class: 'empty' }, h('strong', null, 'Nothing flagged. '), 'Lessons where you miss questions will show up here.'));
  }).catch(function () { weakHolder.replaceChildren(h('h2', null, 'Lessons to revisit'), h('p', { class: 'empty' }, 'Could not load the lessons.')); });
  return root;
}
