/*
 * Quiz and exam building and scoring. Pure functions: pass in data, get data back.
 */
import { shuffle, moduleOf, pct } from './lib.js';
import { isDue, MAX_BOX } from './srs.js';

export const EXAM = { questions: 40, minutes: 60, passMark: 70 };
export const PRACTICE_SIZES = [10, 20];

/* How likely a question is to be picked for practice. Unseen and missed questions first. */
export function questionWeight(state, now) {
  if (!state) return 1.0;
  if (state.box <= 1) return 2.2;
  if (isDue(state, now)) return 1.5 - (state.box - 2) * 0.1;
  return 0.1 + (MAX_BOX - state.box) * 0.04;
}

/* Weighted draw without replacement. */
export function drawWeighted(items, weightFn, n, rng) {
  var pool = items.map(function (it) { return { it: it, w: Math.max(0.0001, weightFn(it)) }; });
  var out = [];
  while (out.length < n && pool.length) {
    var total = 0;
    for (var i = 0; i < pool.length; i++) total += pool[i].w;
    var r = rng() * total;
    var k = 0;
    for (; k < pool.length - 1; k++) {
      r -= pool[k].w;
      if (r <= 0) break;
    }
    out.push(pool[k].it);
    pool.splice(k, 1);
  }
  return out;
}

export function isWeak(state) {
  return !!state && (state.box <= 2 || state.wrong > state.right);
}

/*
 * Practice set.
 *   pool   every candidate question
 *   stats  stored question state keyed by id
 *   mode   'mixed' or 'weak'
 */
export function buildPractice(opts) {
  var pool = opts.pool;
  if (opts.mode === 'weak') {
    pool = pool.filter(function (q) { return isWeak(opts.stats[q.id]); });
  }
  var picked = drawWeighted(pool, function (q) { return questionWeight(opts.stats[q.id], opts.now); }, opts.n, opts.rng);
  return shuffle(picked, opts.rng);
}

/*
 * Exam: draws evenly across modules so no topic is skipped, then shuffles the order.
 * byModule is { m01: [questions], ... }
 */
export function buildExam(byModule, n, rng) {
  var ids = Object.keys(byModule).filter(function (id) { return byModule[id].length > 0; });
  var queues = {};
  ids.forEach(function (id) { queues[id] = shuffle(byModule[id], rng); });
  var picked = [];
  while (picked.length < n) {
    var any = false;
    var order = shuffle(ids, rng);
    for (var i = 0; i < order.length && picked.length < n; i++) {
      var q = queues[order[i]].pop();
      if (q) { picked.push(q); any = true; }
    }
    if (!any) break;
  }
  return shuffle(picked, rng);
}

/* Options are shuffled for each attempt. `answerPos` is where the right answer landed. */
export function shuffleOptions(q, rng) {
  var order = shuffle([0, 1, 2, 3], rng);
  return {
    order: order,
    options: order.map(function (i) { return q.options[i]; }),
    answerPos: order.indexOf(q.answer)
  };
}

/*
 * items: [{ id, correct }]  (unanswered counts as wrong)
 * returns overall and per-module tallies.
 */
export function scoreItems(items) {
  var by = {};
  var right = 0;
  items.forEach(function (it) {
    var m = moduleOf(it.id);
    if (!by[m]) by[m] = { right: 0, total: 0 };
    by[m].total++;
    if (it.correct) { by[m].right++; right++; }
  });
  return { right: right, total: items.length, pct: pct(right, items.length), byModule: by };
}

export function passed(percent, passMark) {
  return percent >= passMark;
}

/* Modules ranked worst first, for "what to revise". Only modules with at least one question. */
export function weakest(byModule, limit) {
  return Object.keys(byModule)
    .map(function (id) { return { id: id, right: byModule[id].right, total: byModule[id].total, pct: pct(byModule[id].right, byModule[id].total) }; })
    .sort(function (a, b) { return a.pct - b.pct || b.total - a.total; })
    .slice(0, limit);
}
