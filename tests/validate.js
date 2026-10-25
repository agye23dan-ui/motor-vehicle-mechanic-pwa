#!/usr/bin/env node
/*
 * Checks module content against docs/COURSE-SPEC.md.
 *
 *   node tests/validate.js           check every module
 *   node tests/validate.js m03 m07   check only these
 *
 * Exits with status 1 when any error is found. Warnings never fail the run.
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.resolve(__dirname, '..');

var ALLOWED_KEYS = ['id', 'summary', 'outcomes', 'cheatsheet', 'lessons', 'practical', 'quiz', 'cards'];
var NOTE_KINDS = ['safety', 'tip', 'key'];
var BANNED = [
  /\bTODO\b/i, /\bTBD\b/i, /lorem ipsum/i, /placeholder/i, /\bxxx+\b/i, /as an ai\b/i,
  /\[citation/i, /\binsert (here|text|image)\b/i, /\bto be added\b/i, /\bfill in later\b/i
];

function load(ids) {
  var ctx = vm.createContext({ console: console });
  vm.runInContext('var MVM = {};', ctx);
  var courseSrc = fs.readFileSync(path.join(ROOT, 'data/course.js'), 'utf8');
  vm.runInContext(courseSrc, ctx, { filename: 'data/course.js' });
  var course = vm.runInContext('MVM.course', ctx);
  var all = course.modules.map(function (m) { return m.id; });
  ids = ids && ids.length ? ids : all;
  var loadErrors = [];
  ids.forEach(function (id) {
    var file = path.join(ROOT, 'data/modules', id + '.js');
    if (all.indexOf(id) === -1) { loadErrors.push(id + ': not a module id in data/course.js'); return; }
    if (!fs.existsSync(file)) { loadErrors.push(id + ': file data/modules/' + id + '.js is missing'); return; }
    try {
      vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: 'data/modules/' + id + '.js' });
    } catch (e) {
      loadErrors.push(id + ': could not run data/modules/' + id + '.js: ' + e.message);
    }
  });
  // Copy out as plain JSON so later checks see ordinary objects.
  var modules = JSON.parse(vm.runInContext('JSON.stringify(MVM.modules)', ctx));
  return { course: course, modules: modules, ids: ids, loadErrors: loadErrors };
}

function words(s) {
  var t = String(s).replace(/\*\*|`/g, ' ').trim();
  return t ? t.split(/\s+/).length : 0;
}

function isStr(x) { return typeof x === 'string' && x.length > 0; }

function textProblems(s, where, err, warn) {
  if (typeof s !== 'string') { err(where + ': expected a string'); return; }
  if (s !== s.trim()) warn(where + ': has leading or trailing spaces');
  if (/<\/?[a-z][^>]*>/i.test(s)) err(where + ': contains an HTML tag');
  if ((s.match(/\*\*/g) || []).length % 2) err(where + ': unbalanced ** markup');
  if ((s.replace(/\*\*/g, '').match(/`/g) || []).length % 2) err(where + ': unbalanced ` markup');
  if (/\p{Extended_Pictographic}/u.test(s)) err(where + ': contains an emoji');
  if (/\s{2,}/.test(s.replace(/\n/g, ' '))) warn(where + ': contains a double space');
  BANNED.forEach(function (re) { if (re.test(s)) err(where + ': contains banned or unfinished wording (' + re + ')'); });
}

function validateModule(m, course, id) {
  var errors = [];
  var warnings = [];
  function err(msg) { errors.push(id + ': ' + msg); }
  function warn(msg) { warnings.push(id + ': ' + msg); }

  if (!m) { err('module did not register (call MVM.registerModule with id "' + id + '")'); return { errors: errors, warnings: warnings, stats: null }; }

  Object.keys(m).forEach(function (k) {
    if (ALLOWED_KEYS.indexOf(k) === -1) err('unexpected key "' + k + '" (title, area and syllabus come from data/course.js)');
  });
  if (m.id !== id) err('id is "' + m.id + '", expected "' + id + '"');

  // summary
  if (!isStr(m.summary)) err('summary is missing');
  else {
    textProblems(m.summary, 'summary', err, warn);
    var sw = words(m.summary);
    if (sw < 10 || sw > 50) err('summary should be 15 to 35 words, found ' + sw);
    else if (sw < 15 || sw > 35) warn('summary is ' + sw + ' words (aim for 15 to 35)');
  }

  // outcomes
  if (!Array.isArray(m.outcomes) || m.outcomes.length < 5 || m.outcomes.length > 6) err('outcomes needs 5 or 6 items');
  else m.outcomes.forEach(function (o, i) {
    textProblems(o, 'outcomes[' + i + ']', err, warn);
    if (!/^[A-Z]/.test(o)) err('outcomes[' + i + '] should start with a capital verb');
    if (words(o) > 30) warn('outcomes[' + i + '] is long');
  });

  // cheatsheet
  if (!Array.isArray(m.cheatsheet) || m.cheatsheet.length < 6 || m.cheatsheet.length > 10) err('cheatsheet needs 6 to 10 facts');
  else m.cheatsheet.forEach(function (c, i) {
    textProblems(c, 'cheatsheet[' + i + ']', err, warn);
    if (String(c).length > 150) err('cheatsheet[' + i + '] is over 140 characters');
  });

  // lessons
  var lessonIds = [];
  var totalWords = 0;
  var hasSafety = false;
  if (!Array.isArray(m.lessons) || m.lessons.length < 5 || m.lessons.length > 12) {
    err('lessons needs 5 to 12 items');
  } else {
    m.lessons.forEach(function (l, li) {
      var lid = id + '-l' + (li + 1);
      var where = 'lesson ' + (li + 1);
      if (l.id !== lid) err(where + ': id should be "' + lid + '", found "' + l.id + '"');
      lessonIds.push(l.id);
      if (!isStr(l.title) || l.title.length > 80) err(where + ': title missing or over 80 characters');
      else textProblems(l.title, where + ' title', err, warn);
      if (!(Number.isInteger(l.minutes) && l.minutes >= 5 && l.minutes <= 30)) err(where + ': minutes must be a whole number 5 to 30');
      if (!Array.isArray(l.body) || !l.body.length) { err(where + ': body is empty'); return; }
      if (l.body[0].t !== 'p') err(where + ': first block must be a paragraph that says what the lesson covers');
      var lw = 0, heads = 0, hasKeyTip = false;
      l.body.forEach(function (b, bi) {
        var bw = where + ' block ' + (bi + 1) + ' (' + b.t + ')';
        switch (b.t) {
          case 'p':
            textProblems(b.text, bw, err, warn); lw += words(b.text);
            if (words(b.text) > 120) warn(bw + ': paragraph over 120 words, consider splitting');
            break;
          case 'h':
            textProblems(b.text, bw, err, warn); lw += words(b.text); heads++;
            if (words(b.text) > 10) warn(bw + ': subheading is long');
            break;
          case 'ul': case 'ol':
            if (!Array.isArray(b.items) || b.items.length < 2) err(bw + ': needs at least 2 items');
            else b.items.forEach(function (it, ii) { textProblems(it, bw + ' item ' + (ii + 1), err, warn); lw += words(it); });
            break;
          case 'note':
            if (NOTE_KINDS.indexOf(b.kind) === -1) err(bw + ': kind must be safety, tip or key');
            textProblems(b.text, bw, err, warn); lw += words(b.text);
            if (b.kind === 'safety') hasSafety = true;
            if (b.kind === 'key' || b.kind === 'tip') hasKeyTip = true;
            break;
          case 'table':
            if (!Array.isArray(b.head) || b.head.length < 2 || b.head.length > 5) err(bw + ': head needs 2 to 5 columns');
            else {
              b.head.forEach(function (h, hi) { textProblems(h, bw + ' head ' + (hi + 1), err, warn); lw += words(h); });
              if (!Array.isArray(b.rows) || b.rows.length < 2) err(bw + ': needs at least 2 rows');
              else b.rows.forEach(function (r, ri) {
                if (!Array.isArray(r) || r.length !== b.head.length) err(bw + ' row ' + (ri + 1) + ': has ' + (r && r.length) + ' cells, head has ' + b.head.length);
                else r.forEach(function (c, ci) { textProblems(c, bw + ' row ' + (ri + 1) + ' cell ' + (ci + 1), err, warn); lw += words(c); });
              });
            }
            if (b.caption !== undefined) { textProblems(b.caption, bw + ' caption', err, warn); lw += words(b.caption); }
            break;
          case 'formula':
            textProblems(b.text, bw, err, warn); lw += words(b.text);
            if (b.caption !== undefined) { textProblems(b.caption, bw + ' caption', err, warn); lw += words(b.caption); }
            break;
          case 'example':
            textProblems(b.title, bw + ' title', err, warn); lw += words(b.title);
            if (!Array.isArray(b.steps) || b.steps.length < 2) err(bw + ': needs at least 2 steps');
            else b.steps.forEach(function (s, si) { textProblems(s, bw + ' step ' + (si + 1), err, warn); lw += words(s); });
            break;
          case 'diagram':
            if (!Object.prototype.hasOwnProperty.call(course.diagrams, b.name)) err(bw + ': unknown diagram "' + b.name + '"');
            else if (course.diagrams[b.name].indexOf(id) === -1) err(bw + ': diagram "' + b.name + '" may only be used in ' + course.diagrams[b.name].join(', '));
            break;
          default:
            err(bw + ': unknown block type "' + b.t + '"');
        }
      });
      if (!hasKeyTip) err(where + ': needs at least one key or tip note');
      if (heads < 2 || heads > 12) warn(where + ': has ' + heads + ' subheadings (aim for 3 to 10)');
      if (lw > 1500) err(where + ': ' + lw + ' words, should be 600 to 1,200');
      else if (lw < 300) err(where + ': ' + lw + ' words, a lesson needs at least 300');
      else if (lw < 500 || lw > 1200) warn(where + ': ' + lw + ' words (aim for 600 to 1,200)');
      l._words = lw;
      totalWords += lw;
    });
    if (totalWords < 5500) err('lessons total ' + totalWords + ' words, the three-semester course needs at least 5,500');
    else if (false) warn('lessons total ' + totalWords + ' words (the three-semester course needs 5,500 or more)');
    if (!hasSafety) err('needs at least one safety note somewhere in the lessons');
  }

  // practical
  var p = m.practical;
  if (!p || typeof p !== 'object') err('practical is missing');
  else {
    ['title', 'objective', 'time'].forEach(function (k) {
      if (!isStr(p[k])) err('practical.' + k + ' is missing'); else textProblems(p[k], 'practical.' + k, err, warn);
    });
    function listCheck(key, min, max) {
      if (!Array.isArray(p[key]) || p[key].length < min || p[key].length > max) err('practical.' + key + ' needs ' + min + (max < 99 ? ' to ' + max : ' or more') + ' items');
      else p[key].forEach(function (s, i) { textProblems(s, 'practical.' + key + '[' + i + ']', err, warn); });
    }
    listCheck('tools', 3, 99);
    listCheck('safety', 4, 99);
    listCheck('steps', 8, 14);
    listCheck('checks', 4, 6);
    Object.keys(p).forEach(function (k) {
      if (['title', 'objective', 'time', 'tools', 'safety', 'steps', 'checks'].indexOf(k) === -1) err('practical has unexpected key "' + k + '"');
    });
  }

  // quiz
  var quiz = m.quiz;
  var qStats = { n: 0 };
  if (!Array.isArray(quiz) || quiz.length < 45) {
    err('quiz needs at least 45 questions, found ' + (Array.isArray(quiz) ? quiz.length : 0));
  }
  if (Array.isArray(quiz)) {
    var seenQ = {};
    var ansCount = [0, 0, 0, 0];
    var levelCount = { 1: 0, 2: 0, 3: 0 };
    var perLesson = {};
    lessonIds.forEach(function (l) { perLesson[l] = 0; });
    var longestCorrect = 0;
    quiz.forEach(function (q, i) {
      var qid = id + '-q' + (i + 1 < 10 ? '0' : '') + (i + 1);
      var where = 'quiz ' + qid;
      if (q.id !== qid) err(where + ': id should be "' + qid + '", found "' + q.id + '"');
      Object.keys(q).forEach(function (k) {
        if (['id', 'q', 'options', 'answer', 'level', 'lesson', 'explain'].indexOf(k) === -1) err(where + ': unexpected key "' + k + '"');
      });
      if (!isStr(q.q) || q.q.length < 15 || q.q.length > 420) err(where + ': question text missing or the wrong length');
      else {
        textProblems(q.q, where + ' question', err, warn);
        if (!/[?:.]$/.test(q.q)) err(where + ': question should end with ? : or .');
        if (/\b(the (lesson|text|diagram|passage|figure) (above|below)|in the (lesson|text|diagram|passage))\b/i.test(q.q)) err(where + ': refers to the lesson or diagram; questions must stand alone');
        var key = q.q.toLowerCase().replace(/\W+/g, ' ');
        if (seenQ[key]) err(where + ': duplicate of ' + seenQ[key]); else seenQ[key] = qid;
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) err(where + ': needs exactly 4 options');
      else {
        var seenO = {};
        q.options.forEach(function (o, oi) {
          var ow = where + ' option ' + (oi + 1);
          if (!isStr(o) || o.length > 140) err(ow + ': missing or over 140 characters');
          else {
            textProblems(o, ow, err, warn);
            if (/^[A-D][\.\)]\s/.test(o)) err(ow + ': do not label options with letters');
            if (/\b(all|none) of the above\b/i.test(o) || /^both [a-d] and [a-d]$/i.test(o)) err(ow + ': "all/none of the above" style options are not allowed');
            var ok = o.toLowerCase().replace(/[\s.,;:!?'"()]+/g, ' ').trim();
            if (seenO[ok]) err(ow + ': repeats another option'); seenO[ok] = true;
          }
        });
      }
      if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3)) err(where + ': answer must be 0, 1, 2 or 3');
      else {
        ansCount[q.answer]++;
        if (Array.isArray(q.options) && q.options.length === 4) {
          var lens = q.options.map(function (o) { return String(o).length; });
          var mx = Math.max.apply(null, lens);
          if (lens[q.answer] === mx && lens.filter(function (x) { return x === mx; }).length === 1) longestCorrect++;
        }
      }
      if (!(q.level === 1 || q.level === 2 || q.level === 3)) err(where + ': level must be 1, 2 or 3'); else levelCount[q.level]++;
      if (lessonIds.indexOf(q.lesson) === -1) err(where + ': lesson "' + q.lesson + '" does not exist in this module'); else perLesson[q.lesson]++;
      if (!isStr(q.explain) || q.explain.length < 40 || q.explain.length > 650) err(where + ': explanation missing or the wrong length (40 to 650 characters)');
      else {
        textProblems(q.explain, where + ' explanation', err, warn);
        if (/\b(option|answer|choice)s?\s*\(?[a-d]\)?(\b|$)/i.test(q.explain) || /\b(option|choice)\s*[1-4]\b/i.test(q.explain)) err(where + ': explanation refers to an option by letter or number; options are shuffled in the app');
      }
    });
    var n = quiz.length;
    qStats = { n: n, ans: ansCount, levels: levelCount, perLesson: perLesson };
    if (n >= 30) {
      ansCount.forEach(function (c, i) {
        var pct = c / n;
        if (pct < 0.12 || pct > 0.38) err('correct answer is position ' + 'ABCD'[i] + ' for ' + Math.round(pct * 100) + '% of questions (keep 15% to 35%)');
        else if (pct < 0.15 || pct > 0.35) warn('correct answer is position ' + 'ABCD'[i] + ' for ' + Math.round(pct * 100) + '% of questions');
      });
      if (levelCount[1] / n < 0.2 || levelCount[1] / n > 0.4) warn('level 1 questions are ' + Math.round(levelCount[1] / n * 100) + '% (aim for about 30%)');
      if (levelCount[3] / n < 0.15 || levelCount[3] / n > 0.4) warn('level 3 questions are ' + Math.round(levelCount[3] / n * 100) + '% (aim for about 25%)');
      if (longestCorrect / n > 0.55) err('the correct option is the single longest in ' + Math.round(longestCorrect / n * 100) + '% of questions; balance option lengths');
      else if (longestCorrect / n > 0.4) warn('the correct option is the single longest in ' + Math.round(longestCorrect / n * 100) + '% of questions');
    }
    lessonIds.forEach(function (l) {
      if (perLesson[l] < 2) err('lesson ' + l + ' has only ' + perLesson[l] + ' quiz questions (need at least 3)');
      else if (perLesson[l] < 3) warn('lesson ' + l + ' has only ' + perLesson[l] + ' quiz questions');
    });
  }

  // cards
  var cards = m.cards;
  if (!Array.isArray(cards) || cards.length < 24) err('cards needs at least 24, found ' + (Array.isArray(cards) ? cards.length : 0));
  if (Array.isArray(cards)) {
    var seenF = {};
    cards.forEach(function (c, i) {
      var cid = id + '-c' + (i + 1 < 10 ? '0' : '') + (i + 1);
      var where = 'card ' + cid;
      if (c.id !== cid) err(where + ': id should be "' + cid + '", found "' + c.id + '"');
      Object.keys(c).forEach(function (k) {
        if (['id', 'front', 'back', 'lesson'].indexOf(k) === -1) err(where + ': unexpected key "' + k + '"');
      });
      if (!isStr(c.front) || c.front.length > 140) err(where + ': front missing or over 140 characters');
      else {
        textProblems(c.front, where + ' front', err, warn);
        var fk = c.front.toLowerCase().replace(/\W+/g, ' ');
        if (seenF[fk]) err(where + ': same front as ' + seenF[fk]); else seenF[fk] = cid;
      }
      if (!isStr(c.back) || c.back.length > 260) err(where + ': back missing or over 260 characters');
      else textProblems(c.back, where + ' back', err, warn);
      if (lessonIds.indexOf(c.lesson) === -1) err(where + ': lesson "' + c.lesson + '" does not exist in this module');
    });
  }

  return {
    errors: errors,
    warnings: warnings,
    stats: { lessons: lessonIds.length, words: totalWords, quiz: qStats.n, cards: Array.isArray(cards) ? cards.length : 0, qa: qStats }
  };
}


/* Fault finder entries in data/faults/*.js */
function validateFaults(course) {
  var errors = [];
  var dir = path.join(ROOT, 'data/faults');
  if (!fs.existsSync(dir)) return { errors: errors, faults: [] };
  var ctx = vm.createContext({ console: console });
  vm.runInContext('var window = { MVM: {} }; var MVM = window.MVM;', ctx);
  fs.readdirSync(dir).filter(function (f) { return /\.js$/.test(f); }).forEach(function (f) {
    try { vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: 'data/faults/' + f }); }
    catch (e) { errors.push('faults/' + f + ': could not run: ' + e.message); }
  });
  var faults = JSON.parse(vm.runInContext('JSON.stringify(window.MVM.faults || [])', ctx));
  var mods = course.modules.map(function (m) { return m.id; });
  var seen = {};
  faults.forEach(function (f, i) {
    var w = 'fault ' + (f.id || '#' + i);
    if (!/^[a-z0-9-]+$/.test(f.id || '')) errors.push(w + ': id must be lower-case letters, digits and hyphens');
    if (seen[f.id]) errors.push(w + ': duplicate id');
    seen[f.id] = true;
    if (mods.indexOf(f.mod) === -1) errors.push(w + ': mod "' + f.mod + '" is not a module id');
    if (typeof f.title !== 'string' || f.title.length < 6 || f.title.length > 90) errors.push(w + ': title missing or the wrong length');
    [['causes', 3, 10], ['diagnose', 3, 10], ['repair', 2, 8]].forEach(function (k) {
      var a = f[k[0]];
      if (!Array.isArray(a) || a.length < k[1] || a.length > k[2]) { errors.push(w + ': ' + k[0] + ' needs ' + k[1] + ' to ' + k[2] + ' items'); return; }
      a.forEach(function (t) {
        if (typeof t !== 'string' || t.length < 8 || t.length > 320) errors.push(w + ': a ' + k[0] + ' item is missing or the wrong length');
        else if (/[<>]/.test(t)) errors.push(w + ': ' + k[0] + ' contains < or >');
        BANNED.forEach(function (re) { if (re.test(t)) errors.push(w + ': banned phrase in ' + k[0]); });
      });
    });
    if (!Array.isArray(f.lessons) || !f.lessons.length) errors.push(w + ': lessons must list at least one lesson id');
    else f.lessons.forEach(function (lid) { if (!/^m\d\d-l\d+$/.test(lid) || mods.indexOf(lid.slice(0, 3)) === -1) errors.push(w + ': bad lesson id ' + lid); });
    if (f.caution !== null && f.caution !== undefined && (typeof f.caution !== 'string' || f.caution.length < 10)) errors.push(w + ': caution must be a sentence or null');
  });
  return { errors: errors, faults: faults };
}

function run(ids) {
  var loaded = load(ids);
  var errors = loaded.loadErrors.slice();
  var warnings = [];
  var summary = [];
  loaded.ids.forEach(function (id) {
    if (loaded.loadErrors.some(function (e) { return e.indexOf(id + ':') === 0; })) return;
    var r = validateModule(loaded.modules[id], loaded.course, id);
    errors = errors.concat(r.errors);
    warnings = warnings.concat(r.warnings);
    if (r.stats) summary.push({ id: id, stats: r.stats });
  });
  var fr = validateFaults(loaded.course);
  errors = errors.concat(fr.errors);
  return { errors: errors, warnings: warnings, summary: summary, course: loaded.course, modules: loaded.modules, faults: fr.faults };
}

module.exports = { run: run, validateModule: validateModule, load: load };

if (require.main === module) {
  var ids = process.argv.slice(2);
  var res = run(ids);
  res.summary.forEach(function (s) {
    var st = s.stats;
    console.log(s.id + '  lessons ' + st.lessons + '  words ' + st.words + '  quiz ' + st.quiz + '  cards ' + st.cards);
  });
  if (res.warnings.length) {
    console.log('\nWarnings (' + res.warnings.length + '):');
    res.warnings.forEach(function (w) { console.log('  - ' + w); });
  }
  if (res.errors.length) {
    console.log('\nErrors (' + res.errors.length + '):');
    res.errors.forEach(function (e) { console.log('  x ' + e); });
    process.exit(1);
  }
  console.log('\nAll checked modules passed.');
}
