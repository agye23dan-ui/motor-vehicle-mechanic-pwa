/* Run with: node --test tests/ */
'use strict';
const test = require('node:test');
const assert = require('node:assert');

async function mods() {
  return {
    lib: await import('../js/lib.js'),
    srs: await import('../js/srs.js'),
    eng: await import('../js/engine.js'),
    store: await import('../js/store.js')
  };
}

test('review moves boxes up on right and resets on wrong', async () => {
  const { srs } = await mods();
  const DAY = 86400000;
  let s = srs.reviewQuestion(null, true, 0);
  assert.strictEqual(s.box, 2);
  assert.strictEqual(s.due, 3 * DAY);
  s = srs.reviewQuestion(s, true, 0);
  assert.strictEqual(s.box, 3);
  s = srs.reviewQuestion(s, false, 0);
  assert.strictEqual(s.box, 1);
  assert.strictEqual(s.wrong, 1);
  for (let i = 0; i < 10; i++) s = srs.reviewQuestion(s, true, 0);
  assert.strictEqual(s.box, 5);
});

test('card grades', async () => {
  const { srs } = await mods();
  assert.strictEqual(srs.reviewCard(null, 'easy', 0).box, 3);
  assert.strictEqual(srs.reviewCard(null, 'good', 0).box, 2);
  assert.strictEqual(srs.reviewCard({ box: 4, reps: 3, lapses: 0 }, 'again', 0).box, 1);
  assert.strictEqual(srs.reviewCard({ box: 4, reps: 3, lapses: 0 }, 'easy', 0).box, 5);
});

test('streak counts back from today or yesterday', async () => {
  const { lib } = await mods();
  const days = { '2026-10-18': { q: 3 }, '2026-10-19': { cards: 1 } };
  assert.strictEqual(lib.streak(days, '2026-10-19'), 2);
  assert.strictEqual(lib.streak(days, '2026-10-20'), 2);
  assert.strictEqual(lib.streak(days, '2026-10-21'), 0);
  assert.strictEqual(lib.longestStreak(days), 2);
});

test('tokenize handles bold and code', async () => {
  const { lib } = await mods();
  const t = lib.tokenize('a **b** `c` d');
  assert.deepStrictEqual(t.map(x => x.t), ['text', 'b', 'text', 'code', 'text']);
});

test('exam draws evenly and never repeats a question', async () => {
  const { lib, eng } = await mods();
  const by = {};
  for (let m = 1; m <= 5; m++) by['m0' + m] = Array.from({ length: 10 }, (_, i) => ({ id: 'm0' + m + '-q' + (i + 10) }));
  const picked = eng.buildExam(by, 20, lib.mulberry32(5));
  assert.strictEqual(picked.length, 20);
  assert.strictEqual(new Set(picked.map(q => q.id)).size, 20);
  const counts = {};
  picked.forEach(q => { counts[q.id.slice(0, 3)] = (counts[q.id.slice(0, 3)] || 0) + 1; });
  Object.values(counts).forEach(c => assert.strictEqual(c, 4));
});

test('shuffled options keep track of the right answer', async () => {
  const { lib, eng } = await mods();
  const q = { options: ['a', 'b', 'c', 'd'], answer: 2 };
  for (let s = 1; s < 50; s++) {
    const r = eng.shuffleOptions(q, lib.mulberry32(s));
    assert.strictEqual(r.options[r.answerPos], 'c');
  }
});

test('score and pass mark', async () => {
  const { eng } = await mods();
  const sc = eng.scoreItems([{ id: 'm01-q01', correct: true }, { id: 'm01-q02', correct: false }, { id: 'm02-q01', correct: true }, { id: 'm02-q02', correct: true }]);
  assert.strictEqual(sc.pct, 75);
  assert.ok(eng.passed(70, 70));
  assert.ok(!eng.passed(69, 70));
});

test('backup validation rejects bad files', async () => {
  const { store } = await mods();
  assert.throws(() => store.checkBackup({}));
  assert.throws(() => store.checkBackup({ app: 'motor-vehicle-mechanic', schema: 2, data: {} }));
  assert.throws(() => store.checkBackup({ app: 'motor-vehicle-mechanic', schema: 1, data: { q: { x: { box: 9 } } } }));
  assert.ok(store.checkBackup({ app: 'motor-vehicle-mechanic', schema: 1, data: { q: { x: { box: 3 } } } }));
});
