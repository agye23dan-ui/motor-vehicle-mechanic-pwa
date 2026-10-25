/* Shared interface pieces used by several screens. */
import { h } from './dom.js';
import { icon } from './icons.js';

export function crumb(href, label) {
  return h('a', { class: 'crumb', href: href }, icon('back', 18), label);
}

export function pageHead(title, lede) {
  return h('div', { class: 'page-head' }, h('h1', null, title), lede ? h('p', null, lede) : null);
}

var toastTimer = null;
/* A short message at the bottom. `action` is { label, run } and keeps the toast until used. */
export function toast(message, action) {
  var old = document.querySelector('.toast');
  if (old) old.remove();
  window.clearTimeout(toastTimer);
  var el = h('div', { class: 'toast', role: 'status' }, h('span', null, message));
  if (action) {
    el.appendChild(h('button', { type: 'button', onclick: function () { el.remove(); action.run(); } }, action.label));
  } else {
    toastTimer = window.setTimeout(function () { el.remove(); }, 4200);
  }
  document.body.appendChild(el);
  return el;
}

/* Modal question using the native dialog element. Resolves true or false. */
export function confirmDialog(title, text, okLabel, danger) {
  return new Promise(function (resolve) {
    var dlg = h('dialog', { class: 'dlg', 'aria-labelledby': 'dlg-title' });
    var done = function (v) { dlg.close(); dlg.remove(); resolve(v); };
    dlg.appendChild(h('h2', { id: 'dlg-title' }, title));
    dlg.appendChild(h('p', null, text));
    dlg.appendChild(h('div', { class: 'btn-row' },
      h('button', { class: 'btn' + (danger ? ' danger' : ' primary'), type: 'button', onclick: function () { done(true); } }, okLabel || 'OK'),
      h('button', { class: 'btn', type: 'button', onclick: function () { done(false); } }, 'Cancel')));
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); done(false); });
    document.body.appendChild(dlg);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
}

export function setTitle(t) {
  document.title = t ? t + ' · Motor Vehicle Mechanic' : 'Motor Vehicle Mechanic';
}

export function barRow(label, value, low) {
  return h('div', { class: 'bar-row' + (low ? ' low' : '') },
    h('div', { class: 'lbl' }, label),
    h('div', { class: 'track' }, h('i', { style: { width: Math.round(value) + '%' } })),
    h('div', { class: 'v' }, Math.round(value) + '%'));
}

export function loading(text) {
  return h('p', { class: 'loading' }, text || 'Loading…');
}

export function failure(err) {
  return h('div', { class: 'banner warn' }, icon('warning'), h('p', null, err && err.message ? err.message : 'Something went wrong.'));
}
