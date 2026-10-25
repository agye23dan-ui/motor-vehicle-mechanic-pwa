import { h, announce } from '../dom.js';
import { icon } from '../icons.js';
import * as store from '../store.js';
import * as data from '../data.js';
import { EXAM, buildExam, shuffleOptions, scoreItems, weakest, passed } from '../engine.js';
import { reviewQuestion } from '../srs.js';
import { mulberry32, newSeed, fmtClock, fmtDate, plural } from '../lib.js';
import { crumb, pageHead, setTitle, loading, failure, barRow, confirmDialog } from '../ui.js';
import { optionList, selectChoice, letterKey } from './question.js';
import { lessonLink } from './quiz.js';

var KEY = 'session:exam';

function active() {
  var s = store.get('kv', KEY);
  return s && !s.done ? s : null;
}

export function intro() {
  setTitle('Exam');
  var root = h('div', null, crumb('#/quiz', 'Quiz'), pageHead('Timed exam', 'A mock exam that covers every module. Answers are shown only when you finish.'));
  var s = active();
  if (s) {
    var left = Math.max(0, Math.round((s.endsAt - Date.now()) / 1000));
    root.appendChild(h('div', { class: 'banner' }, icon('clock'), h('p', null, left > 0 ? 'An exam is in progress with ' + fmtClock(left) + ' left.' : 'An exam ran out of time. Open it to see your result.'),
      h('a', { class: 'btn small', href: '#/exam/run' }, left > 0 ? 'Resume' : 'Open')));
  }
  root.appendChild(h('section', { class: 'sheet' }, h('h2', null, 'The rules'),
    h('ul', null,
      h('li', null, EXAM.questions + ' questions drawn evenly from all modules.'),
      h('li', null, EXAM.minutes + ' minutes. The clock keeps running if you close the app.'),
      h('li', null, 'Pass mark ' + EXAM.passMark + '%.'),
      h('li', null, 'Move freely between questions and flag any you want to revisit.'),
      h('li', null, 'Unanswered questions count as wrong.'))));
  var msg = h('p', { class: 'small muted', role: 'status' });
  var go = h('button', { class: 'btn primary grow', type: 'button' }, 'Start the exam');
  go.addEventListener('click', function () {
    var begin = s ? confirmDialog('Replace the exam in progress?', 'Starting a new exam discards the one you have not finished.', 'Start new', true) : Promise.resolve(true);
    begin.then(function (ok) {
      if (!ok) return;
      go.disabled = true; msg.textContent = 'Preparing the exam…';
      data.loadAll().then(function () {
        var idx = data.index();
        var by = {};
        idx.order.forEach(function (id) { by[id] = data.questionsFor([id]); });
        var rng = mulberry32(newSeed());
        var qs = buildExam(by, EXAM.questions, rng);
        var now = Date.now();
        store.set('kv', KEY, { started: now, endsAt: now + EXAM.minutes * 60000, idx: 0, done: false,
          items: qs.map(function (q) { return { id: q.id, order: shuffleOptions(q, rng).order, pick: null, flag: false }; }) });
        window.location.hash = '#/exam/run';
      }).catch(function (e) { msg.textContent = e.message; go.disabled = false; });
    });
  });
  root.appendChild(h('div', { class: 'btn-row' }, go), msg);

  var hist = Object.keys(store.state.exams).map(function (k) { return store.state.exams[k]; }).sort(function (a, b) { return b.ts - a.ts; });
  if (hist.length) {
    root.appendChild(h('section', { class: 'section' }, h('h2', null, 'Past attempts'), historyList(hist.slice(0, 8))));
  }
  return root;
}

export function historyList(hist) {
  return h('ul', { class: 'hist' }, hist.map(function (e) {
    return h('li', null, h('span', null, e.pct + '%  ' + (e.passed ? 'Pass' : 'Not yet'), ' (' + e.right + '/' + e.total + ')'), h('span', { class: 'when' }, fmtDate(e.ts) + ', ' + fmtClock(e.seconds)));
  }));
}

export function run() {
  var s = active();
  if (!s) return h('div', null, crumb('#/exam', 'Exam'), h('p', { class: 'empty' }, 'No exam in progress.'), h('a', { class: 'btn primary', href: '#/exam' }, 'Exam page'));
  setTitle('Exam in progress');
  var holder = h('div', null, loading());
  var timerId = null, onKey = null;
  holder.destroy = function () { if (timerId) window.clearInterval(timerId); if (onKey) document.removeEventListener('keydown', onKey); };
  var total = s.items.length;

  data.loadAll().then(function () {
    var timerEl = h('span', { class: 'timer' }, icon('clock', 20), h('span', null, ''));
    var body = h('div', null);
    var finished = false;

    function save() { store.set('kv', KEY, s); }
    function tick() {
      var left = Math.round((s.endsAt - Date.now()) / 1000);
      timerEl.lastChild.textContent = fmtClock(left);
      timerEl.classList.toggle('low', left <= 300);
      if (left === 300) announce('Five minutes left');
      if (left <= 0) finish(true);
    }
    function finish(timeUp) {
      if (finished) return;
      finished = true;
      window.clearInterval(timerId);
      var now = Math.min(Date.now(), s.endsAt);
      var graded = s.items.map(function (it) {
        var q = data.findQuestion(it.id);
        var ok = it.pick !== null && it.pick === it.order.indexOf(q.answer);
        if (it.pick !== null) store.set('q', it.id, reviewQuestion(store.get('q', it.id), ok, Date.now()));
        return { id: it.id, correct: ok };
      });
      var answeredCount = s.items.filter(function (i) { return i.pick !== null; }).length;
      store.bumpDay('q', answeredCount);
      var sc = scoreItems(graded);
      s.done = true; s.finishedAt = now; s.timeUp = !!timeUp;
      s.result = { ts: now, pct: sc.pct, right: sc.right, total: sc.total, byModule: sc.byModule, passed: passed(sc.pct, EXAM.passMark), seconds: Math.round((now - s.started) / 1000) };
      store.set('exams', String(now), s.result);
      save();
      window.location.hash = '#/exam/result';
    }

    function show() {
      var item = s.items[s.idx];
      var q = data.findQuestion(item.id);
      var list = optionList(item, q, { reveal: false, onPick: pick });
      function pick(pos) { item.pick = pos; selectChoice(list, pos); save(); refreshNav(); }
      var navgrid = h('div', { class: 'navgrid', role: 'group', 'aria-label': 'Question navigator' });
      function refreshNav() {
        navgrid.replaceChildren.apply(navgrid, s.items.map(function (it, i) {
          var b = h('button', { type: 'button', class: (it.pick !== null ? 'answered ' : '') + (i === s.idx ? 'current ' : '') + (it.flag ? 'flagged' : ''),
            'aria-label': 'Question ' + (i + 1) + (it.pick !== null ? ', answered' : ', not answered') + (it.flag ? ', flagged' : '') });
          b.textContent = String(i + 1);
          b.addEventListener('click', function () { s.idx = i; save(); show(); });
          return b;
        }));
        answeredEl.textContent = s.items.filter(function (i) { return i.pick !== null; }).length + ' of ' + total + ' answered';
      }
      var answeredEl = h('span', { class: 'muted small' });
      var flagBtn = h('button', { class: 'btn small', type: 'button', 'aria-pressed': item.flag ? 'true' : 'false' }, icon('flag', 16), item.flag ? 'Flagged' : 'Flag for review');
      flagBtn.addEventListener('click', function () { item.flag = !item.flag; save(); show(); });
      var prev = h('button', { class: 'btn', type: 'button', disabled: s.idx === 0 ? true : null }, icon('back', 18), 'Previous');
      var next = h('button', { class: 'btn primary', type: 'button', disabled: s.idx === total - 1 ? true : null }, 'Next', icon('chevron', 18));
      prev.addEventListener('click', function () { s.idx--; save(); show(); });
      next.addEventListener('click', function () { s.idx++; save(); show(); });
      var submit = h('button', { class: 'btn', type: 'button' }, 'Finish exam');
      submit.addEventListener('click', function () {
        var open = s.items.filter(function (i) { return i.pick === null; }).length;
        var fl = s.items.filter(function (i) { return i.flag; }).length;
        var text = (open ? plural(open, 'question is', 'questions are') + ' unanswered. ' : 'All questions are answered. ') + (fl ? fl + ' flagged. ' : '') + 'You cannot change answers after finishing.';
        confirmDialog('Finish the exam?', text, 'Finish and mark').then(function (ok) { if (ok) finish(false); });
      });
      if (onKey) document.removeEventListener('keydown', onKey);
      onKey = function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]')) return;
        var i = letterKey(e); if (i >= 0) pick(i);
        else if (e.key === 'ArrowRight' && s.idx < total - 1) { s.idx++; save(); show(); }
        else if (e.key === 'ArrowLeft' && s.idx > 0) { s.idx--; save(); show(); }
      };
      document.addEventListener('keydown', onKey);
      body.replaceChildren(
        h('div', { class: 'qhead' }, h('span', { class: 'count' }, 'Question ' + (s.idx + 1) + ' of ' + total), flagBtn),
        h('div', { class: 'qcard' }, h('p', { class: 'qtext', tabindex: '-1' }, q.q), list.el),
        h('div', { class: 'qfoot' }, prev, h('span', { class: 'spacer' }), next),
        h('section', { class: 'section' }, h('h2', null, 'Navigator'), answeredEl, navgrid, h('div', { class: 'btn-row' }, submit)));
      refreshNav();
    }
    holder.replaceChildren(h('div', { class: 'reader' },
      h('div', { class: 'qhead' }, h('strong', null, 'Exam'), timerEl), body));
    show();
    tick();
    timerId = window.setInterval(tick, 1000);
  }).catch(function (e) { holder.replaceChildren(failure(e)); });
  return holder;
}

export function result() {
  var s = store.get('kv', KEY);
  if (!s || !s.done) return h('div', null, crumb('#/exam', 'Exam'), h('p', { class: 'empty' }, 'No finished exam to show.'));
  setTitle('Exam result');
  var holder = h('div', null, loading());
  data.loadAll().then(function () {
    var r = s.result;
    var out = h('div', { class: 'reader' }, crumb('#/exam', 'Exam'), h('h1', null, 'Exam result'),
      h('div', { class: 'score' }, h('span', { class: 'n' }, r.pct + '%'), h('span', { class: 'of' }, r.right + ' of ' + r.total)),
      h('span', { class: 'verdict ' + (r.passed ? 'pass' : 'fail') }, icon(r.passed ? 'check' : 'cross', 18), r.passed ? 'Pass' : 'Below the ' + EXAM.passMark + '% pass mark'),
      h('p', { class: 'muted small', style: { 'margin-top': '0.6rem' } }, 'Time used: ' + fmtClock(r.seconds) + (s.timeUp ? ' (time ran out)' : '')));
    var mods = Object.keys(r.byModule).map(function (id) { var m = r.byModule[id]; return { id: id, pct: Math.round(m.right / m.total * 100), right: m.right, total: m.total }; })
      .sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    out.appendChild(h('section', { class: 'section' }, h('h2', null, 'By module'),
      h('div', { class: 'bars' }, mods.map(function (m) { return barRow(data.moduleInfo(m.id).short + ' (' + m.right + '/' + m.total + ')', m.pct, m.pct < EXAM.passMark); }))));
    var wk = weakest(r.byModule, 3).filter(function (m) { return m.pct < 100; });
    if (wk.length) out.appendChild(h('div', { class: 'btn-row' }, wk.map(function (m) { return h('a', { class: 'btn small', href: '#/module/' + m.id }, 'Revise ' + data.moduleInfo(m.id).short); })));
    var wrong = s.items.map(function (it) { var q = data.findQuestion(it.id); return { it: it, q: q, ok: it.pick !== null && it.pick === it.order.indexOf(q.answer) }; }).filter(function (g) { return !g.ok; });
    out.appendChild(h('section', { class: 'section' }, h('h2', null, wrong.length ? 'Review ' + plural(wrong.length, 'miss', 'misses') : 'No misses'),
      wrong.map(function (g) {
        return h('div', { class: 'review-item' }, h('div', { class: 'q' }, g.q.q),
          h('div', { class: 'a no' }, g.it.pick === null ? 'Not answered' : 'Your answer: ' + g.q.options[g.it.order[g.it.pick]]),
          h('div', { class: 'a ok' }, 'Correct: ' + g.q.options[g.q.answer]), h('p', { class: 'small muted' }, g.q.explain),
          h('a', { class: 'small', href: lessonLink(g.q.lesson) }, 'Read: ' + data.lessonTitle(g.q.lesson)));
      })));
    out.appendChild(h('div', { class: 'btn-row' }, h('a', { class: 'btn primary', href: '#/exam' }, 'Try again'), h('a', { class: 'btn', href: '#/progress' }, 'See progress')));
    holder.replaceChildren(out);
  }).catch(function (e) { holder.replaceChildren(failure(e)); });
  return holder;
}
