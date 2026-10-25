import { h, svgFromString } from '../dom.js';

/* Small controls shared by the simulations. Each returns { el, get, set }. */

var uid = 0;
function nextId() { uid += 1; return 'sim-' + uid; }

export function slider(label, min, max, step, value, unit, onChange, digits) {
  var id = nextId();
  var out = h('output', { for: id, class: 'sim-val' });
  var input = h('input', { type: 'range', id: id, min: min, max: max, step: step, value: value });
  function show() { out.textContent = Number(input.value).toFixed(digits === undefined ? (step < 1 ? 2 : 0) : digits) + (unit ? ' ' + unit : ''); }
  input.addEventListener('input', function () { show(); onChange(); });
  show();
  return {
    el: h('div', { class: 'sim-ctl' }, h('label', { for: id }, label, out), input),
    get: function () { return parseFloat(input.value); },
    set: function (v) { input.value = v; show(); }
  };
}

export function select(label, options, value, onChange) {
  var id = nextId();
  var sel = h('select', { id: id }, options.map(function (o) { return h('option', { value: o[0], selected: o[0] === value ? true : null }, o[1]); }));
  sel.addEventListener('change', onChange);
  return {
    el: h('div', { class: 'sim-ctl' }, h('label', { for: id }, label), sel),
    get: function () { return sel.value; },
    set: function (v) { sel.value = v; }
  };
}

export function toggle(label, value, onChange) {
  var id = nextId();
  var cb = h('input', { type: 'checkbox', id: id, checked: value ? true : null });
  cb.addEventListener('change', onChange);
  return {
    el: h('div', { class: 'sim-ctl sim-check' }, cb, h('label', { for: id }, label)),
    get: function () { return cb.checked; },
    set: function (v) { cb.checked = !!v; }
  };
}

export function readout(rows) {
  var dl = h('dl', { class: 'tool-results sim-read', 'aria-live': 'polite' });
  return {
    el: dl,
    set: function (list) {
      dl.replaceChildren();
      list.forEach(function (r) {
        dl.appendChild(h('div', r[2] ? { class: r[2] } : null, h('dt', null, r[0]), h('dd', null, r[1])));
      });
    }
  };
}

/* Replaces the content of a holder with a trusted SVG string. */
export function paint(holder, markup) {
  holder.replaceChildren(svgFromString(markup));
}

export function r(n, d) { var f = Math.pow(10, d === undefined ? 1 : d); return String(Math.round(n * f) / f); }
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
