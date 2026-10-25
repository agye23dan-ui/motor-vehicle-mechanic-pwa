/* Shared question drawing for practice quizzes and the exam. */
import { h, rich } from '../dom.js';
import { icon } from '../icons.js';

var LETTERS = ['A', 'B', 'C', 'D'];

/*
 * item   { id, order, pick }   order maps shown position -> original option index
 * q      the question
 * opts   { reveal: bool, onPick(pos) }
 * Returns { el, buttons } so callers can update states.
 */
export function optionList(item, q, opts) {
  var answerPos = item.order.indexOf(q.answer);
  var buttons = item.order.map(function (orig, pos) {
    var b = h('button', { type: 'button', class: 'opt', role: 'radio', 'aria-checked': item.pick === pos ? 'true' : 'false' },
      h('span', { class: 'l' }, LETTERS[pos]), h('span', null, rich(q.options[orig])), h('span', { class: 'tag' }));
    if (opts.reveal) paint(b, pos, item.pick, answerPos);
    b.addEventListener('click', function () { if (!b.disabled) opts.onPick(pos); });
    if (opts.reveal) b.disabled = true;
    return b;
  });
  return { el: h('div', { class: 'opts', role: 'radiogroup', 'aria-label': 'Answers' }, buttons), buttons: buttons, answerPos: answerPos };
}

function paint(b, pos, pick, answerPos) {
  var tag = b.querySelector('.tag');
  b.classList.remove('right', 'wrong', 'dim');
  if (pos === answerPos) { b.classList.add('right'); tag.textContent = pick === pos ? 'Your answer: correct' : 'Correct answer'; }
  else if (pos === pick) { b.classList.add('wrong'); tag.textContent = 'Your answer'; }
  else b.classList.add('dim');
}

/* Marks the options after an answer and disables them. */
export function reveal(list, pick) {
  list.buttons.forEach(function (b, pos) {
    b.setAttribute('aria-checked', pos === pick ? 'true' : 'false');
    paint(b, pos, pick, list.answerPos);
    b.disabled = true;
  });
}

export function feedback(correct, q) {
  return h('div', { class: 'feedback ' + (correct ? 'right' : 'wrong'), role: 'status' },
    h('div', { class: 'h' }, icon(correct ? 'check' : 'cross', 20), correct ? 'Correct' : 'Not quite'),
    h('p', null, rich(q.explain)));
}

export function selectChoice(list, pick) {
  list.buttons.forEach(function (b, pos) { b.setAttribute('aria-checked', pos === pick ? 'true' : 'false'); });
}

export function letterKey(e) {
  var k = e.key.toLowerCase();
  var i = 'abcd'.indexOf(k);
  if (i >= 0 && k.length === 1) return i;
  i = '1234'.indexOf(k);
  return i >= 0 && k.length === 1 ? i : -1;
}
