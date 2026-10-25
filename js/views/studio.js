import { h } from '../dom.js';
import { icon } from '../icons.js';
import { crumb, pageHead, setTitle } from '../ui.js';
import circuit from '../sims/circuit.js';
import cases from '../sims/cases.js';
import aircon from '../sims/aircon.js';
import brakes from '../sims/brakes.js';
import engine from '../sims/engine.js';
import scope from '../sims/scope.js';
import scantool from '../sims/scantool.js';
import cooling from '../sims/cooling.js';
import charging from '../sims/charging.js';
import gearbox from '../sims/gearbox.js';
import alignment from '../sims/alignment.js';
import assemble from '../sims/assemble.js';
import vehicle from '../sims/vehicle.js';

/* Simulation studio: interactive models that let you change a system and watch it respond. */

var SIMS = [vehicle, assemble, cases, circuit, scantool, scope, engine, cooling, charging, brakes, gearbox, alignment, aircon];

function lessonHref(id) {
  var m = /^(m\d+)-l(\d+)$/.exec(id);
  return '#/module/' + m[1] + '/lesson/' + m[2];
}

export function hub() {
  setTitle('Simulation studio');
  return h('div', null,
    pageHead('Simulation studio', 'Learn by doing. Change a system, add a fault and watch what happens, with no risk to a real vehicle. The numbers are typical values for practice, so always use the manufacturer’s workshop manual for real work.'),
    h('div', { class: 'tool-grid studio-grid' },
      SIMS.map(function (s) {
        return h('a', { class: 'hub-card sim-card', href: '#/studio/' + s.id },
          h('div', { class: 'sim-icon' }, icon(s.icon, 28)),
          h('h3', null, s.title), h('p', null, s.blurb), h('span', { class: 'go' }, 'Open', icon('chevron', 16)));
      }),
      h('a', { class: 'hub-card sim-card', href: '#/tools' },
        h('div', { class: 'sim-icon' }, icon('calc', 28)),
        h('h3', null, 'Workshop calculators'), h('p', null, 'Nine quick calculators for stopping distance, Ohm’s law, gear ratios, fuel trims, estimates and unit conversion.'), h('span', { class: 'go' }, 'Open', icon('chevron', 16)))));
}

export function sim(params) {
  var s = null;
  SIMS.forEach(function (x) { if (x.id === params[0]) s = x; });
  if (!s) return h('div', null, crumb('#/studio', 'Studio'), h('p', { class: 'empty' }, 'That simulation was not found.'));
  setTitle(s.title);
  var page = h('div', { class: 'studio-page' }, crumb('#/studio', 'Studio'),
    h('div', { class: 'page-head' }, h('h1', null, s.title), h('p', null, s.blurb),
      s.lesson ? h('p', { class: 'small' }, 'Related lesson: ', h('a', { href: lessonHref(s.lesson[0]) }, s.lesson[1])) : null),
    s.build());
  var inner = page.lastElementChild;
  page.destroy = function () { if (inner && inner.destroy) inner.destroy(); };
  return page;
}
