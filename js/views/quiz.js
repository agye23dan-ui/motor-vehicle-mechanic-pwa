import { h } from '../dom.js';
import { icon } from '../icons.js';
import * as store from '../store.js';
import * as data from '../data.js';
import { buildPractice, shuffleOptions, scoreItems, weakest, PRACTICE_SIZES, isWeak } from '../engine.js';
import { reviewQuestion } from '../srs.js';
import { mulberry32, newSeed, plural, pct } from '../lib.js';
import { crumb, pageHead, setTitle, loading, failure, barRow } from '../ui.js';
import { optionList, reveal, feedback, letterKey } from './question.js';

var KEY = 'session:quiz';

function selectField(id, label, options, value) {
  var sel = h('select', { id: id, class: 'search' }, options.map(function (o) {
    return h('option', { value: o[0], selected: String(o[0]) === String(value) ? true : null }, o[1]);
  }));
  return { el: h('div', { class: 'field' }, h('label', { for: id }, label), sel), sel: sel };
}

export function hub(params) {
  setTitle('Quiz');
  var idx = data.index();
  var preset = params[0] === 'start' ? params[1] : 'all';
  var root = h('div', { class: 'quiz-hub' }, pageHead('Quiz', 'Practice questions with an explanation after every answer. Questions you miss come back more often.'));
  var sess = store.get('kv', KEY);
  if (sess && !sess.done && sess.items.some(function (i) { return i.pick === null; })) {
    root.appendChild(h('div', { class: 'banner' }, icon('clock'), h('p', null, 'You have a quiz in progress (' + sess.items.filter(function (i) { return i.pick !== null; }).length + ' of ' + sess.items.length + ' answered).'),
      h('a', { class: 'btn small', href: '#/quiz/run' }, 'Resume')));
  }
  var scope = selectField('f-scope', 'Topic', [['all', 'All modules']].concat(idx.order.map(function (id) { return [id, idx.modules[id].number + '. ' + idx.modules[id].title]; })), preset);
  var mode = selectField('f-mode', 'Which questions', [['mixed', 'A mix, favouring ones I need to practise'], ['weak', 'Only my weak spots']], 'mixed');
  var size = selectField('f-size', 'How many', PRACTICE_SIZES.map(function (n) { return [n, n + ' questions']; }), 10);
  var msg = h('p', { class: 'muted small', role: 'status' });
  var go = h('button', { class: 'btn primary grow', type: 'button' }, 'Start quiz');
  go.addEventListener('click', function () {
    go.disabled = true; msg.textContent = 'Preparing questions…';
    var ids = scope.sel.value === 'all' ? idx.order : [scope.sel.value];
    data.loadModules(ids).then(function () {
      var items = buildPractice({ pool: data.questionsFor(ids), stats: store.state.q, mode: mode.sel.value, n: parseInt(size.sel.value, 10), rng: mulberry32(newSeed()), now: Date.now() });
      if (!items.length) { msg.textContent = 'No weak spots yet in this topic. Answer some questions first, or choose a mix.'; go.disabled = false; return; }
      var rng = mulberry32(newSeed());
      store.set('kv', KEY, { started: Date.now(), idx: 0, done: false, scope: scope.sel.value,
        items: items.map(function (q) { return { id: q.id, order: shuffleOptions(q, rng).order, pick: null }; }) });
      window.location.hash = '#/quiz/run';
    }).catch(function (e) { msg.textContent = e.message; go.disabled = false; });
  });
  root.appendChild(h('section', { class: 'hub-card' }, h('h3', null, 'Practice quiz'), scope.el, mode.el, size.el, msg, h('div', { class: 'btn-row' }, go)));
  root.appendChild(h('section', { class: 'hub-card' }, h('h3', null, 'Timed exam'), h('p', null, '40 questions across every module, 60 minutes, pass mark 70%. No answers shown until the end.'),
    h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#/exam' }, icon('clock', 18), 'Go to the exam'))));
  return root;
}

export function run() {
  var sess = store.get('kv', KEY);
  if (!sess) return h('div', null, crumb('#/quiz', 'Quiz'), h('p', { class: 'empty' }, 'No quiz in progress.'), h('a', { class: 'btn primary', href: '#/quiz' }, 'Start a quiz'));
  setTitle('Quiz');
  var holder = h('div', null, loading());
  var ids = Object.keys(sess.items.reduce(function (a, i) { a[i.id.slice(0, 3)] = 1; return a; }, {}));
  var onKey = null;
  holder.destroy = function () { if (onKey) document.removeEventListener('keydown', onKey); };

  data.loadModules(ids).then(function () {
    function show() {
      if (onKey) { document.removeEventListener('keydown', onKey); onKey = null; }
      if (sess.idx >= sess.items.length) { sess.done = true; store.set('kv', KEY, sess); window.location.hash = '#/quiz/result'; return; }
      var item = sess.items[sess.idx];
      var q = data.findQuestion(item.id);
      var answered = item.pick !== null;
      var total = sess.items.length;
      var list = optionList(item, q, { reveal: answered, onPick: choose });
      var fb = h('div', null);
      var next = h('button', { class: 'btn primary', type: 'button' }, sess.idx + 1 >= total ? 'See results' : 'Next question', icon('chevron', 18));
      next.addEventListener('click', advance);
      var foot = h('div', { class: 'qfoot' }, h('span', { class: 'spacer' }), answered ? next : null);
      function choose(pos) {
        if (item.pick !== null) return;
        item.pick = pos;
        var correct = pos === list.answerPos;
        store.set('q', item.id, reviewQuestion(store.get('q', item.id), correct, Date.now()));
        store.bumpDay('q', 1);
        store.requestPersistence();
        store.set('kv', KEY, sess);
        reveal(list, pos);
        fb.appendChild(feedback(correct, q));
        foot.appendChild(next);
        next.focus();
      }
      function advance() { sess.idx++; store.set('kv', KEY, sess); show(); }
      onKey = function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (item.pick === null) { var i = letterKey(e); if (i >= 0) choose(i); }
        else if (e.key === 'Enter' && document.activeElement === document.body) advance();
      };
      document.addEventListener('keydown', onKey);
      var out = h('div', { class: 'reader' }, crumb('#/quiz', 'Quit quiz'),
        h('div', { class: 'qhead' }, h('span', { class: 'count' }, 'Question ' + (sess.idx + 1) + ' of ' + total), h('span', { class: 'chip' }, data.moduleInfo(item.id.slice(0, 3)).short)),
        h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': sess.idx }, h('i', { style: { width: (sess.idx / total * 100) + '%' } })),
        h('div', { class: 'qcard' }, h('p', { class: 'qtext' }, q.q), list.el, fb), foot);
      if (answered) {
        fb.appendChild(feedback(item.pick === list.answerPos, q));
      }
      holder.replaceChildren(out);
      var first = out.querySelector('.qtext'); if (first) { first.setAttribute('tabindex', '-1'); if (sess.idx > 0) first.focus({ preventScroll: false }); }
    }
    show();
  }).catch(function (e) { holder.replaceChildren(failure(e)); });
  return holder;
}

export function result() {
  var sess = store.get('kv', KEY);
  if (!sess || !sess.done) return h('div', null, crumb('#/quiz', 'Quiz'), h('p', { class: 'empty' }, 'No finished quiz to show.'));
  setTitle('Quiz results');
  var holder = h('div', null, loading());
  var ids = Object.keys(sess.items.reduce(function (a, i) { a[i.id.slice(0, 3)] = 1; return a; }, {}));
  data.loadModules(ids).then(function () {
    var graded = sess.items.map(function (it) {
      var q = data.findQuestion(it.id);
      return { id: it.id, correct: it.pick !== null && it.pick === it.order.indexOf(q.answer), item: it, q: q };
    });
    var sc = scoreItems(graded);
    var wrong = graded.filter(function (g) { return !g.correct; });
    var out = h('div', { class: 'reader' }, crumb('#/quiz', 'Quiz'), h('h1', null, 'Quiz results'),
      h('div', { class: 'score' }, h('span', { class: 'n' }, sc.pct + '%'), h('span', { class: 'of' }, sc.right + ' of ' + sc.total + ' correct')));
    var w = weakest(sc.byModule, 3).filter(function (m) { return m.pct < 100; });
    if (w.length) {
      out.appendChild(h('section', { class: 'section' }, h('h2', null, 'Revise next'),
        h('div', { class: 'bars' }, w.map(function (m) { return barRow(data.moduleInfo(m.id).title, m.pct, m.pct < 70); })),
        h('div', { class: 'btn-row' }, w.map(function (m) { return h('a', { class: 'btn small', href: '#/module/' + m.id }, 'Open ' + data.moduleInfo(m.id).short); }))));
    }
    if (wrong.length) {
      out.appendChild(h('section', { class: 'section' }, h('h2', null, 'Review ' + plural(wrong.length, 'miss', 'misses')),
        wrong.map(function (g) {
          var shown = g.item.pick !== null ? g.q.options[g.item.order[g.item.pick]] : null;
          return h('div', { class: 'review-item' }, h('div', { class: 'q' }, g.q.q),
            shown ? h('div', { class: 'a no' }, 'Your answer: ' + shown) : h('div', { class: 'a no' }, 'Not answered'),
            h('div', { class: 'a ok' }, 'Correct: ' + g.q.options[g.q.answer]), h('p', { class: 'small muted' }, g.q.explain),
            h('a', { class: 'small', href: lessonLink(g.q.lesson) }, 'Read: ' + data.lessonTitle(g.q.lesson)));
        })));
    } else out.appendChild(h('div', { class: 'banner' }, icon('check'), h('p', null, 'Perfect score. Every answer was right.')));
    out.appendChild(h('div', { class: 'btn-row' }, h('a', { class: 'btn primary', href: '#/quiz' }, 'Another quiz'), h('a', { class: 'btn', href: '#/learn' }, 'Back to lessons')));
    holder.replaceChildren(out);
  }).catch(function (e) { holder.replaceChildren(failure(e)); });
  return holder;
}

export function lessonLink(lid) {
  var m = /^(m\d+)-l(\d+)$/.exec(lid);
  return m ? '#/module/' + m[1] + '/lesson/' + m[2] : '#/learn';
}
