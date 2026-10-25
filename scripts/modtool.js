#!/usr/bin/env node
/*
 * Authoring helper for data/modules/mNN.js.
 *
 *   node scripts/modtool.js format m05          rewrite the module file in the readable layout
 *   node scripts/modtool.js apply m05 draft.js  merge a draft (new sections, lessons, questions, cards)
 *
 * A draft is a CommonJS file that exports { patch, lessons, quiz, cards, ... } and may use the helpers
 * exported here as D. Applying a draft renumbers lessons and quiz questions, remaps every lesson
 * reference and sets reading times from the word count.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var ROOT = path.resolve(__dirname, '..');

function file(id) { return path.join(ROOT, 'data/modules', id + '.js'); }

function load(id) {
  var out = null;
  var ctx = vm.createContext({ MVM: { registerModule: function (m) { out = m; } } });
  vm.runInContext(fs.readFileSync(file(id), 'utf8'), ctx);
  return JSON.parse(JSON.stringify(out));
}

function save(m) {
  var j = JSON.stringify;
  var s = 'MVM.registerModule({\n';
  s += '  "id": ' + j(m.id) + ',\n  "summary": ' + j(m.summary) + ',\n  "outcomes": ' + j(m.outcomes) + ',\n  "cheatsheet": ' + j(m.cheatsheet) + ',\n';
  s += '  "lessons": [\n' + m.lessons.map(function (l) {
    return '    {"id": ' + j(l.id) + ', "title": ' + j(l.title) + ', "minutes": ' + l.minutes + ', "body": [\n' +
      l.body.map(function (b) { return '      ' + j(b); }).join(',\n') + '\n    ]}';
  }).join(',\n') + '\n  ],\n';
  s += '  "practical": ' + j(m.practical) + ',\n';
  s += '  "quiz": [\n' + m.quiz.map(function (q) { return '    ' + j(q); }).join(',\n') + '\n  ],\n';
  s += '  "cards": [\n' + m.cards.map(function (c) { return '    ' + j(c); }).join(',\n') + '\n  ]\n});\n';
  fs.writeFileSync(file(m.id), s);
}

function words(s) { var t = String(s).replace(/\*\*|`/g, ' ').trim(); return t ? t.split(/\s+/).length : 0; }
function bodyWords(body) {
  var n = 0;
  body.forEach(function (b) {
    if (b.text) n += words(b.text);
    if (b.title) n += words(b.title);
    if (b.caption) n += words(b.caption);
    (b.items || b.steps || b.head || []).forEach(function (x) { n += words(x); });
    (b.rows || []).forEach(function (r) { r.forEach(function (x) { n += words(x); }); });
  });
  return n;
}

/* ---- draft helpers ---- */
var D = {
  p: function (text) { return { t: 'p', text: text }; },
  h: function (text) { return { t: 'h', text: text }; },
  ul: function (items) { return { t: 'ul', items: items }; },
  ol: function (items) { return { t: 'ol', items: items }; },
  safety: function (text) { return { t: 'note', kind: 'safety', text: text }; },
  tip: function (text) { return { t: 'note', kind: 'tip', text: text }; },
  key: function (text) { return { t: 'note', kind: 'key', text: text }; },
  table: function (head, rows, caption) { var b = { t: 'table', head: head, rows: rows }; if (caption) b.caption = caption; return b; },
  formula: function (text, caption) { var b = { t: 'formula', text: text }; if (caption) b.caption = caption; return b; },
  example: function (title, steps) { return { t: 'example', title: title, steps: steps }; },
  diagram: function (name) { return { t: 'diagram', name: name }; },
  /* question: lesson ref, level 1 to 3, text, correct option, three wrong options, explanation */
  q: function (lesson, level, q, right, wrong, explain) { return { lesson: lesson, level: level, q: q, right: right, wrong: wrong, explain: explain }; },
  card: function (lesson, front, back) { return { lesson: lesson, front: front, back: back }; }
};

/* Deterministic position cycle so the correct answer is spread evenly. */
function positions(n, seed) {
  var out = [], cyc = [0, 1, 2, 3], i, k, tmp;
  while (out.length < n) {
    for (i = cyc.length - 1; i > 0; i--) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; k = seed % (i + 1); tmp = cyc[i]; cyc[i] = cyc[k]; cyc[k] = tmp; }
    out = out.concat(cyc.slice());
  }
  return out.slice(0, n);
}

function isTrailingNote(body, i) { for (var j = i; j < body.length; j++) if (body[j].t !== 'note') return false; return true; }

function headingAt(l, text, op) {
  var at = -1;
  l.body.forEach(function (b, i) { if (at < 0 && b.t === 'h' && b.text === text) at = i; });
  if (at < 0) throw new Error('patch: no heading "' + text + '" in ' + op.lesson);
  return at;
}

function apply(id, draft) {
  var m = load(id);
  var byId = {};
  m.lessons.forEach(function (l) { byId[l.id] = l; });

  (draft.patch || []).forEach(function (op) {
    var l = byId[op.lesson];
    if (!l) throw new Error('patch: no lesson ' + op.lesson);
    var blocks = op.blocks || op.end || op.start;
    if (op.before) {
      l.body.splice.apply(l.body, [headingAt(l, op.before, op), 0].concat(blocks));
    } else if (op.after) {
      /* at the end of the section that starts at this heading */
      var en = headingAt(l, op.after, op) + 1;
      while (en < l.body.length && l.body[en].t !== 'h' && !(l.body[en].t === 'note' && isTrailingNote(l.body, en))) en++;
      l.body.splice.apply(l.body, [en, 0].concat(blocks));
    } else if (op.end) {
      var k = l.body.length;
      while (k > 0 && l.body[k - 1].t === 'note') k--;
      l.body.splice.apply(l.body, [k, 0].concat(op.end));
    } else if (op.start) {
      l.body.splice.apply(l.body, [1, 0].concat(op.start));
    } else throw new Error('patch: needs before, after, end or start');
  });

  /* new lessons, keyed so questions and cards can point at them */
  var order = m.lessons.map(function (l) { return l.id; });
  (draft.lessons || []).forEach(function (nl) {
    var obj = { id: 'new:' + nl.key, title: nl.title, minutes: 10, body: nl.body };
    byId[obj.id] = obj;
    var pos = nl.after === 'start' ? 0 : (nl.after === 'end' || !nl.after) ? order.length : order.indexOf(nl.after) + 1;
    if (pos < 0 || (nl.after && nl.after !== 'start' && nl.after !== 'end' && order.indexOf(nl.after) < 0)) throw new Error('lesson ' + nl.key + ': unknown position ' + nl.after);
    order.splice(pos, 0, obj.id);
  });
  if (draft.titles) Object.keys(draft.titles).forEach(function (k) { byId[k].title = draft.titles[k]; });

  var remap = {};
  m.lessons = order.map(function (oid, i) {
    var l = byId[oid]; var nid = id + '-l' + (i + 1); remap[oid] = nid;
    l.id = nid; l.minutes = Math.max(5, Math.min(30, Math.round(bodyWords(l.body) / 170))); return l;
  });
  function ref(r) { if (remap[r]) return remap[r]; if (remap['new:' + r]) return remap['new:' + r]; throw new Error('unknown lesson reference ' + r); }
  m.quiz.forEach(function (q) { q.lesson = remap[q.lesson] || q.lesson; });
  m.cards.forEach(function (c) { c.lesson = remap[c.lesson] || c.lesson; });

  /* add new questions and cards, then renumber by lesson order */
  /* optional wording fixes for new questions, in a separate small file: { qfix: [{ match, right, wrong }] } */
  (draft.qfix || []).forEach(function (f) {
    var hit = (draft.quiz || []).filter(function (x) { return x.q.indexOf(f.match) === 0; });
    if (hit.length !== 1) throw new Error('qfix: ' + hit.length + ' questions start with "' + f.match + '"');
    if (f.q) hit[0].q = f.q;
    if (f.level) hit[0].level = f.level;
    if (f.right) hit[0].right = f.right;
    if (f.wrong) hit[0].wrong = f.wrong;
    if (f.explain) hit[0].explain = f.explain;
  });
  var nq = draft.quiz || [], pos2 = positions(nq.length, id.charCodeAt(2) * 31 + id.charCodeAt(1) + m.quiz.length);
  nq.forEach(function (q, i) {
    var opts = q.wrong.slice(); opts.splice(pos2[i], 0, q.right);
    m.quiz.push({ id: 'tmp', q: q.q, options: opts, answer: pos2[i], level: q.level, lesson: ref(q.lesson), explain: q.explain });
  });
  (draft.cards || []).forEach(function (c) { m.cards.push({ id: 'tmp', front: c.front, back: c.back, lesson: ref(c.lesson) }); });
  /* checks on the new material, so problems are fixed in the draft before anything is written */
  var longest = [], seenF = {};
  m.cards.forEach(function (c) {
    if (c.id !== 'tmp') seenF[c.front.toLowerCase().replace(/\W+/g, ' ')] = true;
  });
  (draft.cards || []).forEach(function (c) {
    var k = c.front.toLowerCase().replace(/\W+/g, ' ');
    if (seenF[k]) console.log('DUPLICATE CARD FRONT: ' + c.front);
    seenF[k] = true;
  });
  nq.forEach(function (x) {
    var L = [x.right].concat(x.wrong).map(function (o) { return o.length; }), mx = Math.max.apply(null, L);
    if (L[0] === mx && L.filter(function (v) { return v === mx; }).length === 1) longest.push(x.q.slice(0, 60) + ' [' + L.join('/') + ']');
    L.forEach(function (n, i) { if (n > 140) console.log('OPTION OVER 140: ' + x.q.slice(0, 50)); });
    if (x.explain.length < 40 || x.explain.length > 650) console.log('EXPLANATION LENGTH ' + x.explain.length + ': ' + x.q.slice(0, 50));
  });
  if (nq.length) console.log('new questions where the correct option is the single longest: ' + longest.length + ' of ' + nq.length + (longest.length / nq.length > 0.3 ? '  (TOO MANY, aim for under 30%)' : ''));
  longest.forEach(function (x) { console.log('   ' + x); });
  var li = {}; m.lessons.forEach(function (l, i) { li[l.id] = i; });
  function stable(arr) { return arr.map(function (x, i) { return [x, i]; }).sort(function (a, b) { return (li[a[0].lesson] - li[b[0].lesson]) || (a[1] - b[1]); }).map(function (x) { return x[0]; }); }
  m.quiz = stable(m.quiz); m.cards = stable(m.cards);
  m.quiz.forEach(function (q, i) { q.id = id + '-q' + (i + 1 < 10 ? '0' : '') + (i + 1); });
  m.cards.forEach(function (c, i) { c.id = id + '-c' + (i + 1 < 10 ? '0' : '') + (i + 1); });
  ['summary', 'outcomes', 'cheatsheet', 'practical'].forEach(function (k) { if (draft[k]) m[k] = draft[k]; });
  save(m);
  var w = m.lessons.reduce(function (n, l) { return n + bodyWords(l.body); }, 0);
  console.log(id + ': ' + m.lessons.length + ' lessons, ' + w + ' words, ' + m.quiz.length + ' questions, ' + m.cards.length + ' cards');
}

module.exports = { load: load, save: save, apply: apply, D: D, bodyWords: bodyWords };

if (require.main === module) {
  var cmd = process.argv[2], mid = process.argv[3];
  if (cmd === 'format') save(load(mid));
  else if (cmd === 'apply') {
    var dr = require(path.resolve(process.argv[4]));
    if (process.argv[5]) { var fx = require(path.resolve(process.argv[5])); dr.qfix = (dr.qfix || []).concat(fx.qfix || []); }
    apply(mid, dr);
  }
  else { console.log('usage: modtool.js format mNN | apply mNN draft.js'); process.exit(1); }
}
