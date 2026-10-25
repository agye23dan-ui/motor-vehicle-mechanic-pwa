import { h, rich } from '../dom.js';
import { icon } from '../icons.js';
import * as store from '../store.js';
import * as data from '../data.js';
import { reviewCard, isDue, BOX_DAYS } from '../srs.js';
import { mulberry32, newSeed, shuffle, plural, stripMarkup } from '../lib.js';
import { crumb, pageHead, setTitle, loading, failure } from '../ui.js';

var SESSION_SIZE = 20;

export function hub() {
  setTitle('Flashcards');
  var idx = data.index();
  var now = Date.now();
  var due = 0, seen = 0;
  Object.keys(store.state.cards).forEach(function (k) { seen++; if (isDue(store.state.cards[k], now)) due++; });
  var root = h('div', null, pageHead('Flashcards', 'Short cards for terms, values and procedures. Cards you know come back less often.'));
  root.appendChild(h('section', { class: 'hub-card' }, h('h3', null, due ? plural(due, 'card is', 'cards are') + ' due' : 'Nothing due right now'),
    h('p', null, seen ? seen + ' of ' + idx.totals.cards + ' cards started.' : 'Start your first session to begin building your review schedule.'),
    h('div', { class: 'btn-row' }, h('a', { class: 'btn primary grow', href: '#/cards/run/due' }, icon('cards', 18), due ? 'Review due cards' : 'Study new cards'),
      h('a', { class: 'btn', href: '#/cards/browse' }, icon('search', 18), 'Glossary'))));
  root.appendChild(h('section', { class: 'section' }, h('h2', null, 'By module'),
    h('ul', { class: 'mlist' }, idx.order.map(function (id) {
      var m = idx.modules[id];
      var started = 0;
      for (var c = 1; c <= m.cards; c++) if (store.state.cards[id + '-c' + (c < 10 ? '0' + c : c)]) started++;
      return h('li', null, h('a', { class: 'mrow', href: '#/cards/run/' + id }, h('span', { class: 'pct' }, String(m.number)),
        h('div', null, h('div', { class: 't' }, m.title), h('div', { class: 'meta' }, h('span', null, started + ' of ' + m.cards + ' started'))), icon('chevron', 18)));
    }))));
  return root;
}

function nextLabel(card, grade) {
  var p = card || { box: 0 };
  var box = grade === 'again' ? 1 : grade === 'easy' ? (p.box === 0 ? 3 : Math.min(5, p.box + 2)) : (p.box === 0 ? 2 : Math.min(5, p.box + 1));
  var d = BOX_DAYS[box];
  return d === 1 ? 'in 1 day' : 'in ' + d + ' days';
}

export function run(params) {
  var scope = params[0] || 'due';
  setTitle('Flashcards');
  var holder = h('div', null, loading());
  var onKey = null;
  holder.destroy = function () { if (onKey) document.removeEventListener('keydown', onKey); };
  var idx = data.index();
  var ids = scope === 'due' ? idx.order : [scope];
  if (scope !== 'due' && !data.moduleInfo(scope)) return h('p', { class: 'empty' }, 'Unknown module.');
  data.loadModules(ids).then(function () {
    var now = Date.now();
    var all = data.cardsFor(ids);
    var dueList = all.filter(function (c) { return isDue(store.get('cards', c.id), now); });
    var fresh = all.filter(function (c) { return !store.get('cards', c.id); });
    var rng = mulberry32(newSeed());
    var queue = shuffle(dueList.filter(function (c) { return store.get('cards', c.id); }), rng).slice(0, SESSION_SIZE);
    if (queue.length < SESSION_SIZE) queue = queue.concat(shuffle(fresh, rng).slice(0, SESSION_SIZE - queue.length));
    if (!queue.length) {
      holder.replaceChildren(h('div', null, crumb('#/cards', 'Flashcards'), h('div', { class: 'banner' }, icon('check'), h('p', null, 'No cards are due here. Come back later, or pick another module.')),
        h('a', { class: 'btn', href: '#/cards' }, 'Back to flashcards')));
      return;
    }
    var pos = 0, again = 0, shown = false;
    function show() {
      if (onKey) document.removeEventListener('keydown', onKey);
      if (pos >= queue.length) { done(); return; }
      var c = queue[pos];
      var face = h('button', { class: 'fcard', type: 'button', 'aria-label': 'Show the answer' },
        h('span', { class: 'qsmall' }, data.moduleInfo(c.id.slice(0, 3)).short),
        h('span', { class: 'face' }, rich(c.front)), h('span', { class: 'hint' }, 'Think of the answer, then tap to check'));
      var rate = h('div', { class: 'rate', style: { display: 'none' } });
      var card = store.get('cards', c.id);
      [['again', 'Again'], ['good', 'Good'], ['easy', 'Easy']].forEach(function (g) {
        var b = h('button', { class: 'btn ' + (g[0] === 'again' ? 'danger' : g[0] === 'easy' ? 'good' : ''), type: 'button' }, g[1], h('small', null, nextLabel(card, g[0])));
        b.addEventListener('click', function () { grade(g[0]); });
        rate.appendChild(b);
      });
      shown = false;
      function flip() {
        if (shown) return;
        shown = true;
        face.replaceChildren(h('span', { class: 'qsmall' }, rich(c.front)), h('span', { class: 'ans' }, rich(c.back)));
        face.setAttribute('aria-label', 'Answer shown');
        rate.style.display = '';
        face.disabled = true;
        rate.querySelector('button').focus();
      }
      function grade(g) {
        store.set('cards', c.id, reviewCard(store.get('cards', c.id), g, Date.now()));
        store.bumpDay('cards', 1);
        store.requestPersistence();
        if (g === 'again') { again++; queue.push(c); }
        pos++;
        show();
      }
      face.addEventListener('click', flip);
      onKey = function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (!shown && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); flip(); }
        else if (shown) { if (e.key === '1') grade('again'); else if (e.key === '2') grade('good'); else if (e.key === '3') grade('easy'); }
      };
      document.addEventListener('keydown', onKey);
      holder.replaceChildren(h('div', { class: 'reader' }, crumb('#/cards', 'Done for now'),
        h('div', { class: 'qhead' }, h('span', { class: 'count' }, 'Card ' + (pos + 1) + ' of ' + queue.length)),
        h('div', { class: 'meter' }, h('i', { style: { width: (pos / queue.length * 100) + '%' } })), face, rate,
        h('p', { class: 'small muted' }, 'Keys: space shows the answer, then 1 Again, 2 Good, 3 Easy.')));
      face.focus();
    }
    function done() {
      if (onKey) document.removeEventListener('keydown', onKey);
      holder.replaceChildren(h('div', { class: 'reader' }, crumb('#/cards', 'Flashcards'), h('h1', null, 'Session complete'),
        h('p', { style: { 'margin-top': '1rem' } }, plural(pos, 'card', 'cards') + ' reviewed' + (again ? ', ' + plural(again, 'miss', 'misses') + ' repeated' : '') + '.'),
        h('div', { class: 'btn-row' }, h('a', { class: 'btn primary', href: '#/cards/run/' + scope }, 'More cards'), h('a', { class: 'btn', href: '#/cards' }, 'Back'))));
    }
    show();
  }).catch(function (e) { holder.replaceChildren(failure(e)); });
  return holder;
}

export function browse() {
  setTitle('Glossary');
  var holder = h('div', null, crumb('#/cards', 'Flashcards'), loading());
  data.loadAll().then(function () {
    var all = data.cardsFor(data.index().order);
    var input = h('input', { class: 'search', type: 'search', placeholder: 'Search terms and answers', 'aria-label': 'Search the glossary' });
    var list = h('ul', { class: 'term-list' });
    var count = h('p', { class: 'small muted', role: 'status' });
    function draw() {
      var q = input.value.trim().toLowerCase();
      var hits = q ? all.filter(function (c) { return (c.front + ' ' + c.back).toLowerCase().indexOf(q) >= 0; }) : all;
      var shown = hits.slice(0, 80);
      list.replaceChildren.apply(list, shown.map(function (c) {
        return h('li', null, h('div', { class: 'f' }, rich(c.front)), h('div', { class: 'b' }, rich(c.back)));
      }));
      count.textContent = hits.length + ' ' + (hits.length === 1 ? 'card' : 'cards') + (hits.length > shown.length ? ', showing the first ' + shown.length + '. Type to narrow down.' : '');
    }
    input.addEventListener('input', draw);
    draw();
    holder.replaceChildren(h('div', null, crumb('#/cards', 'Flashcards'), pageHead('Glossary', 'Every card in one searchable list.'), input, count, list));
  }).catch(function (e) { holder.replaceChildren(failure(e)); });
  return holder;
}
