/* Pure helpers with no DOM access, so they can run in Node tests as well as the browser. */

export const DAY = 86400000;

export function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

export function pct(n, d) {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}

export function plural(n, one, many) {
  return n + ' ' + (n === 1 ? one : (many || one + 's'));
}

/* Small seeded generator so a quiz can be rebuilt exactly after a page reload. */
export function mulberry32(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newSeed() {
  return (Math.random() * 4294967296) >>> 0;
}

export function shuffle(list, rng) {
  var r = rng || Math.random;
  var a = list.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(r() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

/* Local calendar day as YYYY-MM-DD. Study streaks follow the learner's own midnight. */
export function dayKey(ts) {
  var d = new Date(ts === undefined ? Date.now() : ts);
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

export function addDays(key, n) {
  var p = key.split('-').map(Number);
  var d = new Date(p[0], p[1] - 1, p[2] + n, 12, 0, 0);
  return dayKey(d.getTime());
}

/* Consecutive days with activity, ending today. A day not yet studied does not break
   the streak until the day is over, so the count ends on yesterday in that case. */
export function streak(days, todayKey) {
  function active(k) {
    var d = days[k];
    return !!d && ((d.q || 0) + (d.cards || 0) + (d.lessons || 0)) > 0;
  }
  var key = todayKey;
  if (!active(key)) key = addDays(key, -1);
  var n = 0;
  while (active(key)) { n++; key = addDays(key, -1); }
  return n;
}

export function longestStreak(days) {
  var keys = Object.keys(days).filter(function (k) {
    var d = days[k];
    return ((d.q || 0) + (d.cards || 0) + (d.lessons || 0)) > 0;
  }).sort();
  var best = 0, run = 0, prev = null;
  keys.forEach(function (k) {
    run = (prev && addDays(prev, 1) === k) ? run + 1 : 1;
    if (run > best) best = run;
    prev = k;
  });
  return best;
}

export function fmtClock(totalSeconds) {
  var s = Math.max(0, Math.round(totalSeconds));
  var h = Math.floor(s / 3600);
  var m = Math.floor((s % 3600) / 60);
  var sec = s % 60;
  return h > 0 ? h + ':' + pad2(m) + ':' + pad2(sec) : m + ':' + pad2(sec);
}

export function fmtMinutes(min) {
  if (min < 60) return min + ' min';
  var h = Math.floor(min / 60);
  var m = min % 60;
  return m ? h + ' h ' + m + ' min' : h + ' h';
}

export function fmtDate(ts) {
  var d = new Date(ts);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

/*
 * Turns lesson text into tokens. Only two markups exist: **bold** and `code`.
 * Returns [{ t: 'text', v }, { t: 'b', c: [tokens] }, { t: 'code', v }].
 */
export function tokenize(text) {
  var out = [];
  var re = /\*\*(.+?)\*\*|`([^`]+)`/g;
  var last = 0;
  var m;
  var s = String(text);
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push({ t: 'text', v: s.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ t: 'b', c: tokenize(m[1]) });
    else out.push({ t: 'code', v: m[2] });
    last = re.lastIndex;
  }
  if (last < s.length) out.push({ t: 'text', v: s.slice(last) });
  return out;
}

export function stripMarkup(text) {
  return String(text).replace(/\*\*/g, '').replace(/`/g, '');
}

/* Ids follow a fixed pattern that tests/validate.js enforces. */
export function lessonId(moduleId, n) { return moduleId + '-l' + n; }
export function questionId(moduleId, n) { return moduleId + '-q' + pad2(n); }
export function cardId(moduleId, n) { return moduleId + '-c' + pad2(n); }
export function moduleOf(id) { return id.slice(0, 3); }
