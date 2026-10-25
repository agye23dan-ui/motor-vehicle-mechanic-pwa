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

var TOP = 50, BOT = 220, MAXN = 6;

// Default positions of the parts. Every wire is drawn from these positions, so a moved part keeps its wires joined.
function defaults(layout) {
  var P = { batt: { x: 30, y: 90 }, fuse: { x: 130, y: TOP }, sw: { x: 220, y: TOP }, earth: { x: 180, y: BOT } };
  for (var i = 0; i < MAXN; i++) P['l' + i] = layout === 'series' ? { x: 322 + i * 64, y: TOP } : { x: 340 + i * 70, y: 122 };
  return P;
}

function seg(pts, cls) { return '<path d="M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join('L') + '" class="' + cls + '"/>'; }
// Orthogonal wire from a to b. mode: hvh (default), vh (vertical first), hv (horizontal first), wrap (leave to the right, come back).
function route(a, b, mode) {
  if (mode === 'vh') return [a, [a[0], b[1]], b];
  if (mode === 'hv') return [a, [b[0], a[1]], b];
  if (mode === 'wrap') { var xr = Math.max(a[0], b[0]) + 22; return [a, [xr, a[1]], [xr, b[1]], b]; }
  var mx = (a[0] + b[0]) / 2; return [a, [mx, a[1]], [mx, b[1]], b];
}

function drawing(s, o, P) {
  var bright = clamp(o.lampW / s.watts, 0, 1.15);
  var live = o.i > 0;
  var wire = live ? 'wire-pos' : 'k2', gnd = live ? 'wire-gnd' : 'k2';
  var series = s.layout === 'series';
  var lamps = []; for (var q = 0; q < s.n; q++) lamps.push(P['l' + q]);
  var maxX = 560;
  lamps.forEach(function (l) { if (l.x + 70 > maxX) maxX = l.x + 70; });
  var W = '';
  var bpos = [P.batt.x + 20, P.batt.y], bneg = [P.batt.x + 20, P.batt.y + 80];
  var fin = [P.fuse.x - 20, P.fuse.y], fout = [P.fuse.x + 20, P.fuse.y];
  var sin = [P.sw.x - 30, P.sw.y], sout = [P.sw.x + 30, P.sw.y];
  var ein = [P.earth.x + 40, P.earth.y], eout = [P.earth.x - 40, P.earth.y];
  var openAt;
  W += seg(route(bpos, fin, 'vh'), wire);
  W += seg(route(fout, sin), wire);
  if (series) {
    var prev = sout;
    lamps.forEach(function (l) { W += seg(route(prev, [l.x - 14, l.y]), wire); prev = [l.x + 14, l.y]; });
    openAt = lamps.length ? [(sout[0] + lamps[0].x - 14) / 2, (sout[1] + lamps[0].y) / 2] : sout;
    W += seg(route(prev, ein, 'wrap'), gnd);
  } else {
    var jx = sout[0] + 24, xs = lamps.map(function (l) { return l.x; });
    var lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs);
    W += seg(route(sout, [jx, TOP], 'hv'), wire);
    W += seg([[Math.min(jx, lo), TOP], [Math.max(jx, hi), TOP]], wire);
    W += seg([[lo, BOT], [hi, BOT]], gnd);
    lamps.forEach(function (l) { W += seg([[l.x, TOP], [l.x, l.y - 14]], wire) + seg([[l.x, l.y + 14], [l.x, BOT]], gnd); });
    W += seg(route([lo, BOT], ein), gnd);
    openAt = [(jx + lo) / 2, TOP];
  }
  W += seg(route(eout, bneg, 'hv'), gnd);
  var X = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 ' + maxX + ' 270" role="img" aria-label="Lamp circuit with fuse, switch and ' + s.n + ' lamp' + (s.n > 1 ? 's' : '') + ' in ' + s.layout + '. Drag any part to move it."><title>Circuit lab</title><desc>A battery feeds a fuse, a switch and lamps, and returns through the earth path.</desc>';
  X += '<defs><marker id="ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1.5 9 5 1 8.5z" class="head"/></marker></defs>';
  X += W;
  function part(id, inner) { return '<g data-part="' + id + '" style="cursor:grab" transform="translate(' + P[id].x + ' ' + P[id].y + ')">' + inner + '</g>'; }
  X += part('batt', '<rect x="0" y="0" width="40" height="80" rx="4" class="metal"/><text x="20" y="-6" class="tb" text-anchor="middle">+</text><text x="20" y="98" class="tb" text-anchor="middle">−</text><text x="50" y="45" class="tb">' + r(s.v, 1) + ' V</text>');
  X += part('fuse', '<rect x="-20" y="-12" width="40" height="24" rx="3" class="box' + (o.blown ? ' tint-m' : '') + '"/>' +
    (o.blown ? '<path d="M-12 0l8-6 4 12 8-8" class="k"/>' : '<path d="M-16 0H16" class="k"/>') +
    '<text x="0" y="-22" class="ts" text-anchor="middle">' + (o.blown ? 'Blown' : s.fuse + ' A fuse') + '</text>');
  X += part('sw', '<rect x="-34" y="-24" width="68" height="40" fill="transparent"/><circle cx="-30" cy="0" r="4" class="k"/><circle cx="30" cy="0" r="4" class="k"/>' +
    (s.on ? '<path d="M-30 0L30 0" class="k bold"/>' : '<path d="M-30 0L22 -22" class="k bold"/>') +
    '<text x="0" y="-30" class="ts" text-anchor="middle">Switch ' + (s.on ? 'on' : 'off') + '</text>');
  lamps.forEach(function (l, i) {
    X += part('l' + i, '<circle r="' + (14 + bright * 5) + '" class="tint-y" style="fill-opacity:' + (0.15 + 0.6 * clamp(bright, 0, 1)).toFixed(2) + '"/><circle r="14" class="box"/><path d="M-9 -9L9 9M9 -9L-9 9" class="k"/>');
  });
  X += part('earth', '<rect x="-40" y="-12" width="80" height="24" rx="3" class="box' + (s.earth > 0.3 ? ' tint-m' : '') + '"/><text x="0" y="5" class="tsm" text-anchor="middle">Earth ' + r(s.earth, 2) + ' Ω</text>');
  var cap = lamps.length ? lamps[Math.floor((lamps.length - 1) / 2)] : { x: 400, y: 50 };
  X += '<text x="' + cap.x + '" y="' + (series ? cap.y + 42 : BOT + 40) + '" class="ts" text-anchor="middle">' + s.n + ' lamp' + (s.n > 1 ? 's' : '') + ' in ' + s.layout + '</text>';
  X += '<text x="' + (maxX - 8) + '" y="264" class="tsm" text-anchor="end">Drag any part to move it</text>';
  if (s.fault === 'open') X += '<path d="M' + (openAt[0] - 9) + ' ' + (openAt[1] - 12) + 'l18 24M' + (openAt[0] + 9) + ' ' + (openAt[1] - 12) + 'l-18 24" class="k bold" style="stroke:var(--magenta-ink)"/><text x="' + openAt[0] + '" y="' + (openAt[1] + 32) + '" class="tsm" text-anchor="middle">Break</text>';
  if (s.fault === 'short') X += '<path d="M' + openAt[0] + ' ' + openAt[1] + 'L' + (openAt[0] - 8) + ' 80L' + (openAt[0] + 8) + ' 100L' + (openAt[0] - 8) + ' 130L' + (openAt[0] + 8) + ' 150L' + openAt[0] + ' 220" class="k" style="stroke:var(--magenta-ink)"/><text x="' + (openAt[0] + 18) + '" y="150" class="tsm">Short to body</text>';
  if (s.fault === 'posR') X += '<rect x="' + (bpos[0] - 7) + '" y="' + (bpos[1] - 30) + '" width="14" height="16" rx="2" class="tint-m"/><text x="' + (bpos[0] + 14) + '" y="' + (bpos[1] - 18) + '" class="tsm">Corroded</text>';
  X += '</svg>';
  return X;
}

export function build() {
  var holder = h('div', { class: 'sim-figure' });
  var out = readout();
  var meter = h('div', { class: 'sim-meter' });
  var note = h('p', { class: 'sim-note', role: 'status' });
  var ctl = {};
  var P = defaults('parallel'), key = 'parallel';
  function state() {
    return { v: ctl.v.get(), watts: parseInt(ctl.w.get(), 10), n: parseInt(ctl.n.get(), 10), layout: ctl.layout.get(), earth: ctl.earth.get(), fuse: parseInt(ctl.fuse.get(), 10), on: ctl.on.get(), fault: ctl.fault.get() };
  }
  function update() {
    var s = state(), o = solve(s);
    if (key !== s.layout) { P = defaults(s.layout); key = s.layout; }
    paint(holder, drawing(s, o, P));
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
  ctl.n = select('Number of lamps', [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6']], '2', update);
  ctl.layout = select('Layout', [['series', 'In series'], ['parallel', 'In parallel']], 'parallel', update);
  ctl.earth = slider('Earth path resistance', 0.02, 2, 0.01, 0.02, 'Ω', update, 2);
  ctl.fuse = select('Fuse', [['5', '5 A'], ['10', '10 A'], ['15', '15 A'], ['20', '20 A']], '15', update);
  ctl.on = toggle('Switch on', true, update);
  ctl.fault = select('Add a fault', [['none', 'No fault'], ['open', 'Break in the positive wire'], ['short', 'Short to the body'], ['posR', 'Corroded connector (high resistance)']], 'none', update);
  update();
  var drag = null;
  function svgPoint(ev) {
    var svg = holder.querySelector('svg'), pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  holder.style.touchAction = 'none';
  holder.addEventListener('pointerdown', function (ev) {
    var g = ev.target.closest && ev.target.closest('[data-part]');
    if (!g) return;
    var p = svgPoint(ev), id = g.getAttribute('data-part');
    drag = { id: id, dx: p.x - P[id].x, dy: p.y - P[id].y };
    holder.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });
  holder.addEventListener('pointermove', function (ev) {
    if (!drag) return;
    var p = svgPoint(ev);
    P[drag.id] = { x: clamp(Math.round((p.x - drag.dx) / 5) * 5, 10, 900), y: clamp(Math.round((p.y - drag.dy) / 5) * 5, 20, 230) };
    update();
  });
  function endDrag() { drag = null; }
  holder.addEventListener('pointerup', endDrag);
  holder.addEventListener('pointercancel', endDrag);
  var reset = h('button', { type: 'button', class: 'btn' }, 'Reset layout');
  reset.addEventListener('click', function () { P = defaults(ctl.layout.get()); update(); });
  return h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' }, holder, note, out.el, meter),
    h('div', { class: 'sim-side' }, h('h3', null, 'Controls'),
      ctl.v.el, ctl.w.el, ctl.n.el, ctl.layout.el, ctl.earth.el, ctl.fuse.el, ctl.on.el, ctl.fault.el, reset,
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
