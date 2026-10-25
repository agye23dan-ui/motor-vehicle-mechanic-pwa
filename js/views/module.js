import { h, rich } from '../dom.js';
import { icon } from '../icons.js';
import * as store from '../store.js';
import * as data from '../data.js';
import { moduleParts, moduleMastery } from '../srs.js';
import { cell, areaColor } from '../halftone.js';
import { fmtMinutes, lessonId } from '../lib.js';
import { renderBlocks } from '../render.js';
import { crumb, setTitle, loading, failure } from '../ui.js';
import * as study from './study.js';
import { lessonHref } from './learn.js';

function toolLink(href, ic, title, sub) {
  return h('a', { class: 'tool-link', href: href }, icon(ic, 22), h('div', null, h('div', { class: 't' }, title), h('div', { class: 's' }, sub)), icon('chevron', 18));
}

export function overview(params) {
  var id = params[0];
  var info = data.moduleInfo(id);
  if (!info) return notFound();
  setTitle(info.short);
  var wrap = h('div', null, crumb('#/learn', 'All modules'), loading());
  data.loadModule(id).then(function (m) {
    var p = moduleParts(info, store.state);
    var v = moduleMastery(info, store.state);
    var color = areaColor(info.area);
    var out = h('div', { class: 'mod-page' }, crumb('#/learn', 'All modules'),
      h('div', { class: 'mod-head' }, cell(v, color, 64),
        h('div', null, h('h1', null, info.number + '. ' + info.title), h('p', { class: 'sum' }, m.summary))),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('div', { class: 'v' }, Math.round(v * 100) + '%'), h('div', { class: 'k' }, 'Mastery')),
        h('div', { class: 'stat' }, h('div', { class: 'v' }, p.lessonsDone + '/' + info.lessons.length), h('div', { class: 'k' }, 'Lessons done')),
        h('div', { class: 'stat' }, h('div', { class: 'v' }, fmtMinutes(info.minutes)), h('div', { class: 'k' }, 'Reading time'))),
      h('section', { class: 'section' }, h('h2', null, 'Lessons'),
        h('ol', { class: 'lessons' }, info.lessons.map(function (l, i) {
          var done = !!store.get('lessons', l.id);
          return h('li', null, h('a', { class: 'lesson-row', href: lessonHref(l.id) },
            h('span', { class: 'num' }, String(i + 1)), h('span', null, l.title),
            done ? h('span', { class: 'done' }, icon('check', 16), 'Done') : h('span', { class: 'mins' }, l.minutes + ' min')));
        }))),
      h('section', { class: 'section' }, h('h2', null, 'Practise'),
        h('div', { class: 'tool-links' },
          toolLink('#/module/' + id + '/practical', 'wrench', 'Practical task sheet', m.practical ? m.practical.title : ''),
          toolLink('#/module/' + id + '/summary', 'list', 'Cheat sheet', 'The key facts on one page'),
          toolLink('#/quiz/start/' + id, 'quiz', 'Quiz this module', info.quiz + ' questions with explanations'),
          toolLink('#/cards/run/' + id, 'cards', 'Flashcards', info.cards + ' cards'))),
      h('section', { class: 'section' }, h('h2', null, 'By the end you can'),
        h('ul', { class: 'outcomes' }, m.outcomes.map(function (o) { return h('li', null, rich(o)); }))));
    wrap.replaceWith(out);
    wrap = out;
  }).catch(function (e) { wrap.replaceWith(failure(e)); });
  return wrap;
}

export function lesson(params) {
  var id = params[0], n = parseInt(params[2], 10);
  var info = data.moduleInfo(id);
  if (!info || !info.lessons[n - 1]) return notFound();
  var lid = lessonId(id, n);
  var holder = h('div', null, crumb('#/module/' + id, info.short), loading());
  data.loadModule(id).then(function (m) {
    var l = m.lessons[n - 1];
    setTitle(l.title);
    store.set('kv', 'last:lesson', lid);
    var done = !!store.get('lessons', lid);
    var bar = h('nav', { class: 'steps-bar', 'aria-label': 'Lessons in this module' }, info.lessons.map(function (x, i) {
      var cls = store.get('lessons', x.id) ? 'done' : '';
      return h('a', { href: lessonHref(x.id), class: cls, 'aria-current': i + 1 === n ? 'step' : null, 'aria-label': 'Lesson ' + (i + 1) + ': ' + x.title });
    }));
    var doneBtn = h('button', { class: 'btn ' + (done ? '' : 'primary'), type: 'button' }, icon('check', 18), done ? 'Completed' : 'Mark as done');
    var nextHref = n < info.lessons.length ? lessonHref(lessonId(id, n + 1)) : '#/module/' + id;
    doneBtn.addEventListener('click', function () {
      if (store.get('lessons', lid)) {
        store.remove('lessons', lid);
        doneBtn.classList.add('primary');
        doneBtn.lastChild.textContent = 'Mark as done';
        bar.children[n - 1].classList.remove('done');
      } else {
        store.set('lessons', lid, { done: Date.now() });
        store.bumpDay('lessons', 1);
        store.requestPersistence();
        window.location.hash = nextHref;
      }
    });
    var out = h('article', { class: 'reader' }, crumb('#/module/' + id, 'Module ' + info.number + ': ' + info.short),
      h('h1', null, l.title),
      h('div', { class: 'byline' }, h('span', null, 'Lesson ' + n + ' of ' + info.lessons.length), h('span', null, l.minutes + ' min read'), bookmarkBtn(lessonId(id, n))),
      bar, renderBlocks(l.body),
      noteBox(lessonId(id, n)),
      h('div', { class: 'reader-nav' },
        n > 1 ? h('a', { class: 'btn', href: lessonHref(lessonId(id, n - 1)) }, icon('back', 18), 'Previous') : null,
        doneBtn,
        h('a', { class: 'btn ' + (done ? 'primary' : ''), href: nextHref }, n < info.lessons.length ? 'Next lesson' : 'Finish module', icon('chevron', 18))),
      h('div', { class: 'btn-row' },
        h('a', { class: 'btn small', href: '#/quiz/start/' + id }, icon('quiz', 16), 'Quiz this module'),
        h('a', { class: 'btn small', href: '#/module/' + id + '/summary' }, icon('list', 16), 'Cheat sheet'),
        h('a', { class: 'btn small', href: '#/module/' + id + '/practical' }, icon('wrench', 16), 'Practical sheet')));
    holder.replaceWith(out);
    holder = out;
  }).catch(function (e) { holder.replaceWith(failure(e)); });
  return holder;
}

/* Sidebar list of every module, grouped by semester, with a filter. The open module shows its lessons. */
function signoffSection(saved, persist) {
  var so = saved.signoff || (saved.signoff = {});
  function inp(key, label, type) {
    var el = h('input', { type: type || 'text', value: so[key] || '', id: 'so-' + key });
    el.addEventListener('change', function () { so[key] = el.value; persist(); });
    return h('div', { class: 'field' }, h('label', { for: 'so-' + key }, label), el);
  }
  var res = h('select', { id: 'so-result' }, [['', 'Not assessed yet'], ['competent', 'Competent'], ['notyet', 'Not yet competent: repeat the task']].map(function (o) { return h('option', { value: o[0], selected: (so.result || '') === o[0] ? true : null }, o[1]); }));
  res.addEventListener('change', function () { so.result = res.value; persist(); });
  var notes = h('textarea', { class: 'note-area', rows: 3, id: 'so-notes', 'aria-label': 'Instructor comments' });
  notes.value = so.notes || '';
  notes.addEventListener('change', function () { so.notes = notes.value; persist(); });
  return h('section', { class: 'sheet signoff' }, h('h2', null, 'Instructor sign-off'),
    h('p', { class: 'small muted' }, 'The instructor watches you complete the task, then fills this in. Print the sheet or the logbook as your record.'),
    inp('date', 'Date completed', 'date'), inp('name', 'Instructor name'), inp('sign', 'Instructor signature (type full name)'),
    h('div', { class: 'field' }, h('label', { for: 'so-result' }, 'Result'), res),
    h('div', { class: 'field' }, h('label', { for: 'so-notes' }, 'Comments'), notes));
}

export function logbook() {
  setTitle('Practical logbook');
  var idx = data.index();
  var rows = idx.order.map(function (id) {
    var m = idx.modules[id], sv = store.get('practical', id) || {}, so = sv.signoff || {};
    var steps = Object.keys(sv.steps || {}).length;
    var status = so.result === 'competent' ? 'Competent' : so.result === 'notyet' ? 'Repeat' : steps ? 'In progress' : 'Not started';
    return h('tr', { class: so.result === 'competent' ? 'signed' : '' },
      h('td', null, h('a', { href: '#/module/' + id + '/practical' }, 'M' + m.number + ' ' + m.short)),
      h('td', null, status), h('td', null, so.date || ''), h('td', null, so.name || ''), h('td', null, so.sign || ''));
  });
  var done = idx.order.filter(function (id) { var sv = store.get('practical', id); return sv && sv.signoff && sv.signoff.result === 'competent'; }).length;
  return h('div', { class: 'reader sheet-page' }, crumb('#/learn', 'Learn'), h('h1', null, 'Practical logbook'),
    h('div', { class: 'byline' }, h('span', null, done + ' of ' + idx.order.length + ' practical tasks signed off as competent')),
    h('div', { class: 'table-wrap', style: { 'margin-top': '1rem' } }, h('table', null,
      h('thead', null, h('tr', null, ['Practical task', 'Status', 'Date', 'Instructor', 'Signature'].map(function (c) { return h('th', { scope: 'col' }, c); }))),
      h('tbody', null, rows))),
    h('div', { class: 'btn-row no-print' }, h('button', { class: 'btn', type: 'button', onclick: function () { window.print(); } }, icon('print', 18), 'Print the logbook')));
}

function bookmarkBtn(lid) {
  var btn = h('button', { class: 'linkish bm-btn', type: 'button' });
  function paint() { var on = study.isSaved(lid); btn.replaceChildren(icon('flag', 16), on ? 'Saved' : 'Save for later'); btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  btn.addEventListener('click', function () { study.toggleSaved(lid); paint(); });
  paint();
  return btn;
}

function noteBox(lid) {
  var area = h('textarea', { class: 'note-area', rows: 3, 'aria-label': 'My notes for this lesson', placeholder: 'Write your own notes for this lesson. They stay on this device.' });
  area.value = study.getNote(lid);
  var timer = null;
  area.addEventListener('input', function () { window.clearTimeout(timer); timer = window.setTimeout(function () { study.setNote(lid, area.value); }, 400); });
  area.addEventListener('blur', function () { window.clearTimeout(timer); study.setNote(lid, area.value); });
  return h('section', { class: 'my-notes' }, h('h2', null, 'My notes'), area);
}

export function moduleList(currentId, lessonN) {
  var idx = data.index();
  var course = data.course();
  var input = h('input', { class: 'side-filter', type: 'search', placeholder: 'Quick filter modules', 'aria-label': 'Filter modules' });
  var groups = h('div', { class: 'side-groups' });

  function dot(info) {
    var done = info.lessons.filter(function (x) { return store.get('lessons', x.id); }).length;
    var state = done === 0 ? 'none' : done === info.lessons.length ? 'full' : 'part';
    return h('span', { class: 'side-dot ' + state, title: done + ' of ' + info.lessons.length + ' lessons done', 'aria-label': done + ' of ' + info.lessons.length + ' lessons done' });
  }

  function draw() {
    var q = input.value.trim().toLowerCase();
    groups.replaceChildren.apply(groups, course.semesters.map(function (sem) {
      var rows = sem.modules.filter(function (mid) {
        var m = idx.modules[mid];
        return !q || (m.title + ' ' + m.short + ' M' + m.number).toLowerCase().indexOf(q) >= 0;
      }).map(function (mid) {
        var m = idx.modules[mid];
        var cur = mid === currentId;
        var row = h('li', null,
          h('a', { class: 'mod-row' + (cur ? ' current' : ''), href: '#/module/' + mid, 'aria-current': cur ? 'true' : null },
            h('span', { class: 'mod-badge' }, 'M' + m.number), h('span', { class: 'mod-title' }, m.title), dot(m)));
        if (cur && !q) {
          row.appendChild(h('ol', { class: 'side-lessons' }, m.lessons.map(function (x, i) {
            var cls = 'side-row' + (i + 1 === lessonN ? ' current' : '') + (store.get('lessons', x.id) ? ' done' : '');
            return h('li', null, h('a', { class: cls, href: lessonHref(x.id), 'aria-current': i + 1 === lessonN ? 'step' : null },
              h('span', { class: 'num' }, String(i + 1)), h('span', null, x.title)));
          })));
        }
        return row;
      });
      if (!rows.length) return null;
      return h('section', null, h('h3', { class: 'side-group' }, sem.label), h('ul', { class: 'mod-list' }, rows));
    }));
  }
  input.addEventListener('input', draw);
  draw();
  return h('div', { class: 'side-modules' },
    h('div', { class: 'side-head' }, h('h2', null, 'Course modules'), h('span', { class: 'side-count' }, idx.order.length + ' modules')),
    input, groups);
}

export function practical(params) {
  var id = params[0];
  var info = data.moduleInfo(id);
  if (!info) return notFound();
  var holder = h('div', null, crumb('#/module/' + id, info.short), loading());
  data.loadModule(id).then(function (m) {
    var p = m.practical;
    if (!p) { holder.replaceWith(h('div', null, crumb('#/module/' + id, info.short), h('p', { class: 'empty' }, 'This module has no practical task sheet.'))); return; }
    setTitle('Practical: ' + info.short);
    var saved = store.get('practical', id) || { steps: {}, checks: {} };
    function persist() { store.set('practical', id, saved); }
    function list(kind, items) {
      return h('div', null, items.map(function (txt, i) {
        var cid = 'p-' + kind + '-' + i;
        var cb = h('input', { type: 'checkbox', id: cid, checked: saved[kind][i] ? true : null });
        cb.addEventListener('change', function () { if (cb.checked) saved[kind][i] = 1; else delete saved[kind][i]; persist(); });
        return h('div', { class: 'check-row' }, cb, h('label', { for: cid }, rich(txt)));
      }));
    }
    var out = h('div', { class: 'reader sheet-page' }, crumb('#/module/' + id, info.short),
      h('h1', null, p.title),
      h('div', { class: 'byline' }, h('span', null, 'Practical task sheet'), h('span', null, p.time)),
      h('p', { style: { 'margin-top': '1rem' } }, rich(p.objective)),
      h('section', { class: 'sheet danger' }, h('h2', null, 'Safety first'), h('ul', null, p.safety.map(function (s) { return h('li', null, rich(s)); }))),
      h('section', { class: 'sheet' }, h('h2', null, 'Tools and materials'), h('ul', null, p.tools.map(function (s) { return h('li', null, rich(s)); }))),
      h('section', { class: 'sheet' }, h('h2', null, 'Steps'), list('steps', p.steps)),
      h('section', { class: 'sheet' }, h('h2', null, 'Check yourself'), list('checks', p.checks)),
      signoffSection(saved, persist),
      h('div', { class: 'btn-row no-print' },
        h('button', { class: 'btn', type: 'button', onclick: function () { window.print(); } }, icon('print', 18), 'Print this sheet'),
        h('a', { class: 'btn', href: '#/module/' + id }, 'Back to module')));
    holder.replaceWith(out);
    holder = out;
  }).catch(function (e) { holder.replaceWith(failure(e)); });
  return holder;
}

export function summary(params) {
  var id = params[0];
  var info = data.moduleInfo(id);
  if (!info) return notFound();
  var holder = h('div', null, crumb('#/module/' + id, info.short), loading());
  data.loadModule(id).then(function (m) {
    setTitle('Cheat sheet: ' + info.short);
    var out = h('div', { class: 'reader sheet-page' }, crumb('#/module/' + id, info.short),
      h('h1', null, 'Cheat sheet'), h('div', { class: 'byline' }, h('span', null, info.number + '. ' + info.title)),
      h('ul', { class: 'prose', style: { 'margin-top': '1.2rem' } }, m.cheatsheet.map(function (s) { return h('li', null, rich(s)); })),
      h('div', { class: 'btn-row no-print' },
        h('button', { class: 'btn', type: 'button', onclick: function () { window.print(); } }, icon('print', 18), 'Print')));
    holder.replaceWith(out);
    holder = out;
  }).catch(function (e) { holder.replaceWith(failure(e)); });
  return holder;
}

function notFound() {
  return h('div', null, crumb('#/learn', 'All modules'), h('p', { class: 'empty' }, 'That page does not exist.'));
}
