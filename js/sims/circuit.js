import { h } from '../dom.js';
import { slider, select, toggle, readout, paint, r, clamp } from './kit.js';

/*
 * Circuit lab: a lamp circuit with a fuse and a switch. Change the supply, the lamps, the earth
 * and add a fault, then measure it with a virtual meter. The model is plain Ohm's law.
 */

var R_BATT = 0.02, R_FUSE = 0.01, R_SWITCH = 0.01, R_POS = 0.02, R_SHORT = 0.05;

function solve(s) {
  var rl = 144 / s.watts;                       // lamp resistance, from its rating at 12 V
  var rpos = R_POS + (s.fault === 'posR' ? 0.9 : 0);
  var rload = s.layout === 'series' ? s.n * rl : rl / s.n;
  var out = { rl: rl, rload: rload, rpos: rpos, blown: false, i: 0, drops: {}, lampV: 0, lampW: 0, note: '' };
  var rest = R_BATT + R_FUSE + R_SWITCH + rpos + s.earth;
  var rtot, i;
  if (!s.on) { out.note = 'The switch is off, so no current flows.'; }
  else if (s.fault === 'open') { out.note = 'There is a break in the positive wire. No current flows, so the lamps are dark.'; }
  else if (s.fault === 'short') {
    rtot = R_BATT + R_FUSE + R_SWITCH + R_SHORT;
    i = s.v / rtot;
    out.wouldDraw = i;
    if (i > s.fuse) { out.blown = true; out.note = 'The positive wire touches the body before the lamps. The short would draw ' + r(i, 0) + ' A, so the ' + s.fuse + ' A fuse blows.'; }
  } else {
    rtot = rest + rload;
    i = s.v / rtot;
    if (i > s.fuse) { out.blown = true; out.wouldDraw = i; out.note = 'The lamps need ' + r(i, 1) + ' A, more than the ' + s.fuse + ' A fuse allows, so it blows.'; }
    else out.i = i;
  }
  if (out.i > 0) {
    out.drops = { batt: out.i * R_BATT, fuse: out.i * R_FUSE, sw: out.i * R_SWITCH, pos: out.i * rpos, load: out.i * rload, earth: out.i * s.earth };
    out.lampV = out.drops.load / (s.layout === 'series' ? s.n : 1);
    out.lampW = out.lampV * out.lampV / rl;
    if (s.fault === 'posR') out.note = 'A corroded connector in the positive wire adds resistance. Voltage is lost there and the lamps are dim.';
    else if (s.earth > 0.3) out.note = 'The earth path has high resistance, so voltage is lost there and the lamps are dim.';
    else if (s.v < 11.5) out.note = 'The supply voltage is low, so the lamps are dim.';
    else out.note = 'The circuit is healthy: almost all of the voltage is used by the lamps.';
  }
  return out;
}

function meterRows(s, o) {
  var rows = [];
  var live = o.i > 0;
  rows.push(['Battery terminals', live ? s.v - o.drops.batt : s.v, 'The battery voltage while the circuit works']);
  rows.push(['Across the fuse', live ? o.drops.fuse : (o.blown ? s.v : 0), 'Under 0.1 V when good. Full battery voltage across a blown fuse.']);
  rows.push(['Across the switch', live ? o.drops.sw : (s.on ? 0 : s.v), 'Under 0.1 V when closed. Full voltage across an open switch.']);
  rows.push(['Across the positive wire', live ? o.drops.pos : (s.fault === 'open' && s.on && !o.blown ? s.v : 0), 'Under 0.3 V when good. A break shows the full voltage.']);
  rows.push(['Across the lamps', live ? o.drops.load : 0, 'Nearly all the supply voltage']);
  rows.push(['Across the earth path', live ? o.drops.earth : 0, 'Under 0.2 V when good']);
  return rows;
}

function drawing(s, o) {
  var bright = clamp(o.lampW / s.watts, 0, 1.15);
  var live = o.i > 0;
  var wire = live ? 'wire-pos' : 'k2';
  var X = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 560 270" role="img" aria-label="Lamp circuit with fuse, switch and ' + s.n + ' lamp' + (s.n > 1 ? 's' : '') + ' in ' + s.layout + '"><title>Circuit lab</title><desc>A battery feeds a fuse, a switch and lamps, and returns through the earth path.</desc>';
  X += '<defs><marker id="ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1.5 9 5 1 8.5z" class="head"/></marker></defs>';
  // wires
  X += '<path d="M50 90V50H110" class="' + wire + '"/>';
  X += '<path d="M150 50H190" class="' + wire + '"/><path d="M250 50H' + (s.layout === 'series' ? 290 : 300) + '" class="' + wire + '"/>';
  // battery
  X += '<rect x="30" y="90" width="40" height="80" rx="4" class="metal"/><text x="50" y="84" class="tb" text-anchor="middle">+</text><text x="50" y="190" class="tb" text-anchor="middle">−</text>';
  X += '<text x="80" y="135" class="tb">' + r(s.v, 1) + ' V</text>';
  // fuse
  X += '<rect x="110" y="38" width="40" height="24" rx="3" class="box' + (o.blown ? ' tint-m' : '') + '"/>' +
    (o.blown ? '<path d="M118 50l8-6 4 12 8-8" class="k"/>' : '<path d="M114 50H146" class="k"/>') +
    '<text x="130" y="28" class="ts" text-anchor="middle">' + (o.blown ? 'Blown' : s.fuse + ' A fuse') + '</text>';
  // switch
  X += '<circle cx="190" cy="50" r="4" class="k"/><circle cx="250" cy="50" r="4" class="k"/>' +
    (s.on ? '<path d="M190 50L250 50" class="k bold"/>' : '<path d="M190 50L242 28" class="k bold"/>') +
    '<text x="220" y="22" class="ts" text-anchor="middle">Switch ' + (s.on ? 'on' : 'off') + '</text>';
  // lamps
  function lamp(cx, cy) {
    var g = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (14 + bright * 5) + '" class="tint-y" style="fill-opacity:' + (0.15 + 0.6 * clamp(bright, 0, 1)).toFixed(2) + '"/>';
    g += '<circle cx="' + cx + '" cy="' + cy + '" r="14" class="box"/><path d="M' + (cx - 9) + ' ' + (cy - 9) + 'L' + (cx + 9) + ' ' + (cy + 9) + 'M' + (cx + 9) + ' ' + (cy - 9) + 'L' + (cx - 9) + ' ' + (cy + 9) + '" class="k"/>';
    return g;
  }
  var loadEnd;
  if (s.layout === 'series') {
    var x = 290;
    for (var k = 0; k < s.n; k++) {
      X += '<path d="M' + x + ' 50H' + (x + 18) + '" class="' + wire + '"/>' + lamp(x + 32, 50);
      x += 64;
    }
    X += '<path d="M' + (x - 14) + ' 50H500V220" class="' + wire + '"/>';
    X += '<text x="' + (290 + 32 * s.n) + '" y="92" class="ts" text-anchor="middle">' + s.n + ' lamp' + (s.n > 1 ? 's' : '') + ' in series</text>';
    X += '<path d="M500 220H300" class="' + (live ? 'wire-gnd' : 'k2') + '"/>';
  } else {
    var xs = [320, 390, 460].slice(0, s.n);
    X += '<path d="M300 50H' + xs[xs.length - 1] + '" class="' + wire + '"/>';
    X += '<path d="M300 220H' + xs[xs.length - 1] + '" class="' + (live ? 'wire-gnd' : 'k2') + '"/>';
    xs.forEach(function (x2) {
      X += '<path d="M' + x2 + ' 50V108M' + x2 + ' 136V220" class="' + wire + '"/>' + lamp(x2, 122);
    });
    X += '<path d="M500 220H' + xs[xs.length - 1] + '" class="' + (live ? 'wire-gnd' : 'k2') + '"/>';
    X += '<text x="' + (xs[0] + (xs[xs.length - 1] - xs[0]) / 2) + '" y="262" class="ts" text-anchor="middle">' + s.n + ' lamp' + (s.n > 1 ? 's' : '') + ' in parallel</text>';
  }
  // return (earth) path along the bottom to the battery
  X += '<path d="M300 220H220M140 220H50V170" class="' + (live ? 'wire-gnd' : 'k2') + '"/>';
  X += '<rect x="140" y="208" width="80" height="24" rx="3" class="box' + (s.earth > 0.3 ? ' tint-m' : '') + '"/><text x="180" y="225" class="tsm" text-anchor="middle">Earth ' + r(s.earth, 2) + ' Ω</text>';
  // faults
  if (s.fault === 'open') X += '<path d="M268 38L286 62M286 38L268 62" class="k bold" style="stroke:var(--magenta-ink)"/><text x="277" y="82" class="tsm" text-anchor="middle">Break</text>';
  if (s.fault === 'short') X += '<path d="M276 50L268 80L284 100L268 130L284 150L276 220" class="k" style="stroke:var(--magenta-ink)"/><text x="296" y="150" class="tsm">Short to body</text>';
  if (s.fault === 'posR') X += '<rect x="86" y="42" width="14" height="16" rx="2" class="tint-m"/><text x="92" y="74" class="tsm" text-anchor="middle">Corroded</text>';
  X += '</svg>';
  return X;
}

export function build() {
  var holder = h('div', { class: 'sim-figure' });
  var out = readout();
  var meter = h('div', { class: 'sim-meter' });
  var note = h('p', { class: 'sim-note', role: 'status' });
  var ctl = {};
  function state() {
    return { v: ctl.v.get(), watts: parseInt(ctl.w.get(), 10), n: parseInt(ctl.n.get(), 10), layout: ctl.layout.get(), earth: ctl.earth.get(), fuse: parseInt(ctl.fuse.get(), 10), on: ctl.on.get(), fault: ctl.fault.get() };
  }
  function update() {
    var s = state(), o = solve(s);
    paint(holder, drawing(s, o));
    out.set([
      ['Total current', o.i > 0 ? r(o.i, 2) + ' A' : (o.blown ? '0 A (fuse blown)' : '0 A')],
      ['Voltage across each lamp', o.i > 0 ? r(o.lampV, 2) + ' V' : '0 V'],
      ['Power in each lamp', o.i > 0 ? r(o.lampW, 1) + ' W of ' + s.watts + ' W' : '0 W'],
      ['Each lamp', o.i > 0 ? r(100 * clamp(o.lampW / s.watts, 0, 1.2), 0) + '% brightness' : 'dark']
    ]);
    note.textContent = o.note;
    var rows = meterRows(s, o);
    meter.replaceChildren(h('h3', null, 'Voltmeter readings'),
      h('p', { class: 'small muted' }, 'Voltage drop tests are made with the circuit working. A good circuit loses almost nothing in the wires, fuse, switch and earth.'),
      h('table', { class: 'sim-table' }, h('tbody', null, rows.map(function (rw) {
        return h('tr', null, h('th', { scope: 'row' }, rw[0]), h('td', null, r(rw[1], 2) + ' V'), h('td', { class: 'small muted' }, rw[2]));
      }))));
  }
  ctl.v = slider('Battery voltage', 10, 14.5, 0.1, 12.6, 'V', update, 1);
  ctl.w = select('Lamp rating', [['5', '5 W (sidelight)'], ['21', '21 W (brake lamp)'], ['55', '55 W (headlamp)']], '21', update);
  ctl.n = select('Number of lamps', [['1', '1'], ['2', '2'], ['3', '3']], '2', update);
  ctl.layout = select('Layout', [['series', 'In series'], ['parallel', 'In parallel']], 'parallel', update);
  ctl.earth = slider('Earth path resistance', 0.02, 2, 0.01, 0.02, 'Ω', update, 2);
  ctl.fuse = select('Fuse', [['5', '5 A'], ['10', '10 A'], ['15', '15 A'], ['20', '20 A']], '15', update);
  ctl.on = toggle('Switch on', true, update);
  ctl.fault = select('Add a fault', [['none', 'No fault'], ['open', 'Break in the positive wire'], ['short', 'Short to the body'], ['posR', 'Corroded connector (high resistance)']], 'none', update);
  update();
  return h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' }, holder, note, out.el, meter),
    h('div', { class: 'sim-side' }, h('h3', null, 'Controls'),
      ctl.v.el, ctl.w.el, ctl.n.el, ctl.layout.el, ctl.earth.el, ctl.fuse.el, ctl.on.el, ctl.fault.el,
      h('div', { class: 'sim-try' }, h('h3', null, 'Try this'),
        h('ol', null,
          h('li', null, 'Put the lamps in series, then in parallel. Why does a lamp shine brighter in parallel?'),
          h('li', null, 'Raise the earth resistance. Watch the lamps dim and the voltage drop across the earth path rise.'),
          h('li', null, 'Add the short to the body and see the fuse blow. Why must the fuse be near the battery?'),
          h('li', null, 'Fit three 55 W lamps on a 15 A fuse and find out what happens.')))));
}

export default {
  id: 'circuit', title: 'Circuit lab', icon: 'calc',
  blurb: 'Build a lamp circuit with a fuse and a switch. Change the supply, the lamps and the earth, add faults and take voltage-drop readings.',
  lesson: ['m09-l7', 'Voltage-drop testing'],
  build: build
};
