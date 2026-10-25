/*
 * Spaced repetition and mastery.
 *
 * A Leitner-box scheme. An item sits in box 1 to 5. Each correct answer moves it up a box
 * and pushes its next review further away. A wrong answer drops it back to box 1.
 * Box 0 means "never seen" and is not stored.
 */
import { DAY, lessonId, questionId, cardId } from './lib.js';

export const MAX_BOX = 5;
/* Days until the next review for each box. Index = box. */
export const BOX_DAYS = [0, 1, 3, 7, 14, 30];

export function reviewQuestion(prev, correct, now) {
  var p = prev || { box: 0, seen: 0, right: 0, wrong: 0 };
  var box = correct ? (p.box === 0 ? 2 : Math.min(MAX_BOX, p.box + 1)) : 1;
  return {
    box: box,
    seen: p.seen + 1,
    right: p.right + (correct ? 1 : 0),
    wrong: p.wrong + (correct ? 0 : 1),
    last: now,
    due: now + BOX_DAYS[box] * DAY,
    lastCorrect: !!correct
  };
}

/* grade is 'again', 'good' or 'easy'. */
export function reviewCard(prev, grade, now) {
  var p = prev || { box: 0, reps: 0, lapses: 0 };
  var box;
  if (grade === 'again') box = 1;
  else if (grade === 'easy') box = p.box === 0 ? 3 : Math.min(MAX_BOX, p.box + 2);
  else box = p.box === 0 ? 2 : Math.min(MAX_BOX, p.box + 1);
  return {
    box: box,
    reps: p.reps + 1,
    lapses: p.lapses + (grade === 'again' ? 1 : 0),
    last: now,
    due: now + BOX_DAYS[box] * DAY
  };
}

export function isDue(state, now) {
  return !!state && state.due <= now;
}

/* 0 to 1 */
export function itemScore(state) {
  return state ? state.box / MAX_BOX : 0;
}

export function average(list) {
  if (!list.length) return 0;
  var t = 0;
  for (var i = 0; i < list.length; i++) t += list[i];
  return t / list.length;
}

/*
 * Mastery for one module, 0 to 1.
 *   25% lessons marked done
 *   50% quiz questions answered correctly in recent attempts
 *   25% flashcards known
 * `entry` is the module's row from MVM.index. `state` holds the stored maps.
 */
export function moduleParts(entry, state) {
  var id = entry.id;
  var lessonsDone = 0;
  for (var l = 1; l <= entry.lessons.length; l++) {
    if (state.lessons[lessonId(id, l)]) lessonsDone++;
  }
  var qs = [];
  for (var q = 1; q <= entry.quiz; q++) qs.push(itemScore(state.q[questionId(id, q)]));
  var cs = [];
  for (var c = 1; c <= entry.cards; c++) cs.push(itemScore(state.cards[cardId(id, c)]));
  return {
    lessons: entry.lessons.length ? lessonsDone / entry.lessons.length : 0,
    lessonsDone: lessonsDone,
    quiz: average(qs),
    cards: average(cs)
  };
}

export function moduleMastery(entry, state) {
  var p = moduleParts(entry, state);
  return 0.25 * p.lessons + 0.5 * p.quiz + 0.25 * p.cards;
}

export function overallMastery(index, state) {
  var list = index.order.map(function (id) { return moduleMastery(index.modules[id], state); });
  return average(list);
}

/* Number of cards that are due now, across the whole course. */
export function dueCardCount(state, now) {
  var n = 0;
  var keys = Object.keys(state.cards);
  for (var i = 0; i < keys.length; i++) if (isDue(state.cards[keys[i]], now)) n++;
  return n;
}
