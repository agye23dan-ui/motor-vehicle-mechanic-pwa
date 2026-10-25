import { h } from '../dom.js';
import * as store from '../store.js';
import { icon } from '../icons.js';
import { CASES } from './cases-data.js';

/* Diagnosis cases: choose tests, read the results, then name the cause. */

var KEY = 'sim:cases';

function best() { return store.get('kv', KEY) || {}; }
function stars(n) { return n === 3 ? 'Three stars' : n === 2 ? 'Two stars' : n === 1 ? 'One star' : 'Not done'; }
function starText(n) { return n ? '★'.repeat(n) + '☆'.repeat(3 - n) : '☆☆☆'; }

function lessonHref(id) {
  var m = /^(m\d+)-l(\d+)$/.exec(id);
  return '#/module/' + m[1] + '/lesson/' + m[2];
}

function pickScreen(root, startCase) {
  var scores = best();
  root.replaceChildren(
    h('p', null, 'Each case gives you a customer complaint. Choose the tests you would run, read the results, then name the cause. Fewer, well-chosen tests earn more stars.'),
    h('ul', { class: 'mlist case-list' }, CASES.map(function (c) {
      return h('li', null, h('button', { class: 'mrow case-row', type: 'button', onclick: function () { startCase(c); } },
        h('span', { class: 'pct', 'aria-hidden': 'true' }, String(CASES.indexOf(c) + 1)),
        h('div', null, h('div', { class: 't' }, c.title), h('div', { class: 'meta' }, h('span', null, c.vehicle), h('span', null, 'Level ' + c.level))),
        h('span', { class: 'case-stars', 'aria-label': stars(scores[c.id] || 0) }, starText(scores[c.id] || 0))));
    })));
}

function playCase(root, c, back) {
  var done = {};              // test id -> true
  var order = [];
  var minutes = 0;
  var finished = false;
  var journal = h('ol', { class: 'case-journal', 'aria-live': 'polite' });
  var timer = h('p', { class: 'sim-timer' });
  var testsBox = h('div', { class: 'case-tests' });
  var diag = h('div', { class: 'case-diag' });
  var result = h('div', { class: 'case-result', role: 'status' });

  function groups() {
    var seen = [];
    c.tests.forEach(function (t) { if (seen.indexOf(t.group) < 0) seen.push(t.group); });
    return seen;
  }

  function drawTests() {
    testsBox.replaceChildren(h('div', null, h('h3', null, 'Choose a test'), groups().map(function (g) {
      return h('div', { class: 'case-group' }, h('h4', null, g),
        c.tests.filter(function (t) { return t.group === g; }).map(function (t) {
          return h('button', { type: 'button', class: 'btn small case-test' + (done[t.id] ? ' used' : ''), disabled: done[t.id] || finished ? true : null,
            onclick: function () { run(t); } }, t.label, h('span', { class: 'mins' }, t.mins + ' min'));
        }));
    })));
  }

  function drawJournal() {
    journal.replaceChildren.apply(journal, order.map(function (t) {
      return h('li', null, h('strong', null, t.label), h('p', null, t.result));
    }));
    timer.textContent = order.length + (order.length === 1 ? ' test' : ' tests') + ', ' + minutes + ' minutes of diagnostic time';
  }

  function run(t) {
    if (done[t.id] || finished) return;
    done[t.id] = true; order.push(t); minutes += t.mins;
    drawJournal(); drawTests();
    var last = journal.lastElementChild;
    if (last && last.scrollIntoView) last.scrollIntoView({ block: 'nearest' });
  }

  function drawDiag() {
    var chosen = null;
    var list = h('div', { class: 'case-causes', role: 'radiogroup', 'aria-label': 'Most likely cause' }, c.causes.map(function (cause, i) {
      var id = 'cause-' + c.id + '-' + i;
      var rb = h('input', { type: 'radio', name: 'cause-' + c.id, id: id, value: i });
      rb.addEventListener('change', function () { chosen = i; btn.disabled = false; });
      return h('div', { class: 'case-cause' }, rb, h('label', { for: id }, cause));
    }));
    var btn = h('button', { type: 'button', class: 'btn primary', disabled: true, onclick: function () { submit(chosen); } }, 'Make my diagnosis');
    diag.replaceChildren(h('h3', null, 'What is the cause?'), h('p', { class: 'small muted' }, 'Run the tests you need first. You can still diagnose with few tests, but guessing is risky.'), list, btn);
  }

  function submit(i) {
    if (finished) return;
    finished = true;
    var ok = i === c.answer;
    var keyTotal = c.tests.filter(function (t) { return t.key; }).length;
    var keyDone = c.tests.filter(function (t) { return t.key && done[t.id]; }).length;
    var wasted = order.filter(function (t) { return !t.key; }).length;
    var score = !ok ? 1 : (keyDone === keyTotal && wasted <= 3 ? 3 : (keyDone >= Math.ceil(keyTotal / 2) ? 2 : 1));
    if (ok && keyDone < Math.ceil(keyTotal / 2)) score = 1;   // lucky guess
    var s = best();
    if ((s[c.id] || 0) < score) { s[c.id] = score; store.set('kv', KEY, s); }
    drawTests(); diag.replaceChildren();
    var missed = c.tests.filter(function (t) { return t.key && !done[t.id]; });
    result.replaceChildren(h('div', null,
      h('div', { class: 'banner ' + (ok ? '' : 'warn') }, icon(ok ? 'check' : 'warning'),
        h('p', null, h('strong', null, ok ? 'Correct. ' : 'Not quite. '), ok ? 'The cause is: ' + c.causes[c.answer] + '.' : 'You chose "' + c.causes[i] + '". The cause is: ' + c.causes[c.answer] + '.')),
      h('p', { class: 'case-score' }, starText(score) + ' ' + stars(score)),
      h('h3', null, 'Why'), h('p', null, c.why),
      h('h3', null, 'Repair'), h('p', null, c.repair),
      missed.length ? h('div', null, h('h3', null, 'Tests that would have settled it'), h('ul', null, missed.map(function (t) { return h('li', null, h('strong', null, t.label + ': '), t.result); }))) : null,
      wasted ? h('p', { class: 'small muted' }, wasted + ' of your tests did not point to the cause. Ruling things out is sometimes needed, but a good technician plans the tests first.') : null,
      h('div', { class: 'btn-row' },
        h('button', { type: 'button', class: 'btn primary', onclick: function () { back(); } }, 'Choose another case'),
        h('button', { type: 'button', class: 'btn', onclick: function () { playCase(root, c, back); } }, 'Try this case again'),
        h('a', { class: 'btn', href: '#/faults/' + c.fault }, icon('wrench', 18), 'Fault finder entry')),
      h('p', { class: 'small' }, 'Study: ', c.lessons.map(function (l, k) { return [k ? ', ' : '', h('a', { href: lessonHref(l[0]) }, l[1])]; }))));
    result.scrollIntoView && result.scrollIntoView({ block: 'nearest' });
  }

  drawTests(); drawJournal(); drawDiag();
  root.replaceChildren(
    h('button', { class: 'linkish', type: 'button', onclick: function () { back(); } }, '← All cases'),
    h('div', { class: 'case-head' }, h('h2', null, c.title), h('p', { class: 'small muted' }, c.vehicle)),
    h('div', { class: 'note key' }, h('div', { class: 'label' }, icon('flag', 18), 'Customer complaint'), h('p', null, c.complaint)),
    h('div', { class: 'case-grid' },
      testsBox,
      h('div', null, h('h3', null, 'Your test log'), timer, h('p', { class: 'small muted' }, journal.children.length ? '' : 'Your results will appear here.'), journal, diag, result)));
}

export function build() {
  var root = h('div', { class: 'cases' });
  function back() { pickScreen(root, function (c) { playCase(root, c, back); }); }
  back();
  return root;
}

export default {
  id: 'cases', title: 'Diagnosis cases', icon: 'wrench',
  blurb: 'Ten customer complaints with hidden faults. Choose your tests, read the results and find the cause the way a technician does.',
  lesson: ['m21-l1', 'Systematic diagnosis'],
  build: build
};
