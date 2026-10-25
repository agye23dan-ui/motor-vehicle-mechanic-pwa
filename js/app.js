import { h, clear } from './dom.js';
import { icon } from './icons.js';
import { brandMark } from './halftone.js';
import * as store from './store.js';
import * as platform from './platform.js';
import { dueCardCount } from './srs.js';
import { setTitle, failure } from './ui.js';
import * as learn from './views/learn.js';
import * as mod from './views/module.js';
import * as quiz from './views/quiz.js';
import * as exam from './views/exam.js';
import * as cards from './views/cards.js';
import * as faults from './views/faults.js';
import * as tools from './views/tools.js';
import * as studio from './views/studio.js';
import * as study from './views/study.js';
import * as progress from './views/progress.js';
import * as settings from './views/settings.js';

var main = document.getElementById('main');
var current = null;

var ROUTES = [
  [/^$|^learn$/, 'learn', function () { return learn.render(); }],
  [/^module\/(m\d+)$/, 'learn', function (p) { return mod.overview(p); }],
  [/^module\/(m\d+)\/lesson\/(\d+)$/, 'learn', function (p) { return mod.lesson([p[0], null, p[1]]); }],
  [/^module\/(m\d+)\/practical$/, 'learn', function (p) { return mod.practical(p); }],
  [/^module\/(m\d+)\/summary$/, 'learn', function (p) { return mod.summary(p); }],
  [/^quiz$/, 'quiz', function () { return quiz.hub([]); }],
  [/^quiz\/start\/(m\d+)$/, 'quiz', function (p) { return quiz.hub(['start', p[0]]); }],
  [/^quiz\/run$/, 'quiz', function () { return quiz.run(); }],
  [/^quiz\/result$/, 'quiz', function () { return quiz.result(); }],
  [/^exam$/, 'quiz', function () { return exam.intro(); }],
  [/^exam\/run$/, 'quiz', function () { return exam.run(); }],
  [/^exam\/result$/, 'quiz', function () { return exam.result(); }],
  [/^cards$/, 'cards', function () { return cards.hub(); }],
  [/^cards\/run\/(due|m\d+)$/, 'cards', function (p) { return cards.run(p); }],
  [/^cards\/browse$/, 'cards', function () { return cards.browse(); }],
  [/^faults$/, 'faults', function () { return faults.hub(); }],
  [/^faults\/([a-z0-9-]+)$/, 'faults', function (p) { return faults.detail(p); }],
  [/^search$/, 'learn', function () { return study.search(); }],
  [/^saved$/, 'learn', function () { return study.saved(); }],
  [/^logbook$/, 'learn', function () { return mod.logbook(); }],
  [/^plan$/, 'learn', function () { return study.plan(); }],
  [/^studio$/, 'studio', function () { return studio.hub(); }],
  [/^studio\/([a-z-]+)$/, 'studio', function (p) { return studio.sim(p); }],
  [/^tools$/, 'studio', function () { return tools.render(); }],
  [/^progress$/, 'progress', function () { return progress.render(); }],
  [/^settings$/, 'settings', function () { return settings.render(); }],
  [/^about$/, 'settings', function () { return settings.about(); }]
];

var TABS = [['learn', 'Learn', 'learn'], ['quiz', 'Quiz', 'quiz'], ['cards', 'Cards', 'cards'], ['faults', 'Faults', 'wrench'], ['studio', 'Studio', 'calc'], ['progress', 'Progress', 'progress']];

function buildChrome() {
  var top = document.getElementById('topbar');
  clear(top);
  top.appendChild(h('a', { class: 'brand', href: '#/learn', 'aria-label': 'Motor Vehicle Mechanic, home' }, brandMark(30), h('span', { class: 'brand-name' }, 'Motor Vehicle', h('br'), 'Mechanic')));
  top.appendChild(h('a', { class: 'icon-btn', href: '#/search', 'aria-label': 'Search the course' }, icon('search', 24)));
  top.appendChild(h('a', { class: 'icon-btn', href: '#/settings', 'aria-label': 'Settings' }, icon('settings', 24)));
  var tabs = document.getElementById('tabs');
  clear(tabs);
  TABS.forEach(function (t) {
    tabs.appendChild(h('a', { class: 'tab', href: '#/' + t[0], dataset: { tab: t[0] } }, icon(t[2], 24), h('span', null, t[1]), t[0] === 'cards' ? h('span', { class: 'dot', hidden: true, id: 'due-dot' }) : null));
  });
  tabs.appendChild(h('div', { class: 'rail-modules', id: 'rail-modules' }));
}

/* The course module list lives in the side rail on the Learn pages. */
function drawRail(tab, path) {
  var rail = document.getElementById('rail-modules');
  if (!rail) return;
  var m = /^module\/(m\d+)(?:\/lesson\/(\d+))?/.exec(path);
  document.body.classList.toggle('with-modules', tab === 'learn');
  clear(rail);
  if (tab !== 'learn') return;
  rail.appendChild(mod.moduleList(m ? m[1] : null, m && m[2] ? parseInt(m[2], 10) : null));
  var cur = rail.querySelector('.mod-row.current');
  if (cur) { var box = document.getElementById('tabs'); box.scrollTop = Math.max(0, cur.offsetTop - 160); }
}

function markTab(tab) {
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (a) {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

function updateDue() {
  var dot = document.getElementById('due-dot');
  if (!dot) return;
  var n = dueCardCount(store.state, Date.now());
  dot.hidden = n === 0;
  dot.textContent = n > 99 ? '99+' : String(n);
  dot.setAttribute('aria-label', n + ' cards due');
}

function show() {
  var path = decodeURIComponent((window.location.hash || '').replace(/^#\/?/, '')).replace(/\/+$/, '');
  if (current && current.destroy) { try { current.destroy(); } catch (e) { /* ignore */ } }
  current = null;
  var match = null;
  for (var i = 0; i < ROUTES.length; i++) {
    var m = ROUTES[i][0].exec(path);
    if (m) { match = { tab: ROUTES[i][1], fn: ROUTES[i][2], params: m.slice(1) }; break; }
  }
  clear(main);
  document.querySelector('.dlg') && document.querySelectorAll('.dlg').forEach(function (d) { d.remove(); });
  if (!match) {
    markTab('learn');
    drawRail('', path);
    main.appendChild(h('div', null, h('h1', null, 'Page not found'), h('p', null, 'That address does not match anything here.'), h('a', { class: 'btn primary', href: '#/learn' }, 'Go to Learn')));
    return;
  }
  markTab(match.tab);
  drawRail(match.tab, path);
  main.classList.toggle('wide', match.tab === 'faults' || match.tab === 'studio' || match.tab === 'learn' && (!match.params.length || /^module\/[^/]+(\/lesson\/\d+)?$/.test(path)));
  var node;
  try { node = match.fn(match.params); } catch (e) { console.error(e); node = failure(e); }
  current = node;
  if (!store.status.persistent) main.appendChild(h('div', { class: 'banner warn' }, icon('warning'), h('p', null, 'Progress cannot be saved in this browser, so it will be lost when you close the app. Try a normal (not private) window.')));
  main.appendChild(node);
  updateDue();
  window.scrollTo(0, 0);
  var title = main.querySelector('h1');
  if (title) setTitle(title.textContent);
  main.focus({ preventScroll: true });
}

function start() {
  platform.applyTheme();
  platform.applySize();
  buildChrome();
  updateDue();
  store.onChange(updateDue);
  window.addEventListener('hashchange', show);
  show();
  platform.registerServiceWorker();
}

store.init().then(start, start);
