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
    else if (out.lampV > 14) out.note = 'Each lamp is getting ' + r(out.lampV, 1) + ' V but these are 12 V lamps. They would be overbright and burn out quickly. Use 24 V lamps, or put lamps in series.';
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

var flowDur = 0;
var CORE = { 'wire-pos': '#d93a2b', 'wire-gnd': '#3c424a', 'k2': '#9aa2aa' };
/* An insulated wire: a dark sleeve with the coloured core inside. While current flows, white dashes run along it. */
function seg(pts, cls) {
  var d = 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join('L');
  var out = '<path d="' + d + '" fill="none" stroke="#15171a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="' + (CORE[cls] || '#9aa2aa') + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
  if (flowDur && cls !== 'k2') out += '<path d="' + d + '" fill="none" stroke="#fff" stroke-opacity="0.75" stroke-width="2" stroke-linecap="round" class="cflow" style="animation-duration:' + flowDur + 's;animation-delay:-' + ((performance.now() / 1000) % flowDur).toFixed(3) + 's"/>';
  return out;
}
// Orthogonal wire from a to b. mode: hvh (default), vh (vertical first), hv (horizontal first), wrap (leave to the right, come back).
function route(a, b, mode) {
  if (mode === 'vh') return [a, [a[0], b[1]], b];
  if (mode === 'hv') return [a, [b[0], a[1]], b];
  if (mode === 'wrap') { var xr = Math.max(a[0], b[0]) + 22; return [a, [xr, a[1]], [xr, b[1]], b]; }
  var mx = (a[0] + b[0]) / 2; return [a, [mx, a[1]], [mx, b[1]], b];
}

function drawing(s, o, P) {
  flowDur = o.i > 0 ? Math.max(0.15, 2.2 / (0.25 + o.i / 6)).toFixed(2) : 0;
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
  X += '<defs><radialGradient id="ciGlow"><stop offset="0" stop-color="#ffe9a0" stop-opacity="0.9"/><stop offset="1" stop-color="#ffd25a" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="ciMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6eaee"/><stop offset="1" stop-color="#8b949d"/></linearGradient></defs>';
  X += part('batt', '<rect x="0" y="0" width="40" height="80" rx="5" fill="#262a2f" stroke="#101214"/><rect x="0" y="0" width="40" height="14" rx="5" fill="#3a4047"/>' +
    '<rect x="8" y="22" width="24" height="48" rx="3" fill="#e9eef0"/><text transform="rotate(-90 20 46)" x="20" y="51" text-anchor="middle" style="fill:#14181c;stroke:none;font:800 14px sans-serif">12 V</text>' +
    '<rect x="12" y="-9" width="16" height="11" rx="2" fill="#d93a2b" stroke="#6b1a12"/><rect x="12" y="78" width="16" height="11" rx="2" fill="#2a2f35" stroke="#101214"/>' +
    '<text x="20" y="-14" class="tb" text-anchor="middle">+</text><text x="20" y="106" class="tb" text-anchor="middle">−</text><text x="50" y="45" class="tb">' + r(s.v, 1) + ' V</text>');
  var fuseColour = { 5: '#c8a46a', 10: '#d9453a', 15: '#6aa7d9', 20: '#e8d34a' }[s.fuse] || '#c8a46a';
  X += part('fuse', '<rect x="-20" y="-12" width="40" height="24" rx="3" fill="' + fuseColour + '" stroke="#3b4148"/><rect x="-13" y="-7" width="26" height="14" rx="2" fill="#f3f6f8" fill-opacity="0.6"/>' +
    (o.blown ? '<path d="M-12 0H-4M4 0H12" stroke="#59626b" stroke-width="2.4"/><path d="M-4 0l3-5M4 0l-3 5" stroke="#d6335a" stroke-width="1.6"/><rect x="-13" y="-7" width="26" height="14" rx="2" fill="#2a2f35" opacity="0.55"/>' : '<path d="M-12 0H12" stroke="#8d96a0" stroke-width="2.4"/>') +
    '<rect x="-17" y="12" width="8" height="6" fill="#c8cdd2"/><rect x="9" y="12" width="8" height="6" fill="#c8cdd2"/>' +
    '<text x="0" y="-22" class="ts" text-anchor="middle">' + (o.blown ? 'Blown' : s.fuse + ' A fuse') + '</text>');
  X += part('sw', '<rect x="-34" y="-24" width="68" height="40" fill="transparent"/><rect x="-30" y="-10" width="60" height="22" rx="5" fill="#2b2f35" stroke="#101214"/>' +
    '<circle cx="-30" cy="0" r="5" fill="url(#ciMetal)" stroke="#59626b"/><circle cx="30" cy="0" r="5" fill="url(#ciMetal)" stroke="#59626b"/>' +
    (s.on ? '<rect x="-27" y="-4" width="54" height="8" rx="3" fill="#c8cdd2" stroke="#59626b"/>' : '<g transform="rotate(-24 -27 0)"><rect x="-27" y="-4" width="54" height="8" rx="3" fill="#c8cdd2" stroke="#59626b"/></g>') +
    '<circle cx="0" cy="10" r="2.6" fill="' + (s.on ? '#2fae5f' : '#5a1f1a') + '"/>' +
    '<text x="0" y="-30" class="ts" text-anchor="middle">Switch ' + (s.on ? 'on' : 'off') + '</text>');
  lamps.forEach(function (l, i) {
    var b = clamp(bright, 0, 1.2);
    X += part('l' + i, '<circle r="' + (16 + b * 14).toFixed(1) + '" fill="url(#ciGlow)" opacity="' + clamp(b, 0, 1).toFixed(2) + '"/>' +
      '<circle r="14" fill="#e9f1f4" fill-opacity="' + (0.25 + 0.55 * clamp(b, 0, 1)).toFixed(2) + '" stroke="#8d96a0" stroke-width="1.5"/>' +
      '<path d="M-6 9V-1L-3 -6L0 -1L3 -6L6 -1V9" fill="none" stroke="' + (b > 0.05 ? '#ffb41f' : '#59626b') + '" stroke-width="' + (1.6 + b).toFixed(1) + '" stroke-linejoin="round"/>' +
      '<rect x="-7" y="12" width="14" height="6" rx="1" fill="url(#ciMetal)" stroke="#59626b"/>');
  });
  X += part('earth', '<rect x="-40" y="-8" width="80" height="16" rx="3" fill="' + (s.earth > 0.3 ? '#a8742f' : '#8d96a0') + '" stroke="#3b4148"/>' +
    '<circle cx="-32" cy="0" r="3.5" fill="#c8cdd2" stroke="#3b4148"/><circle cx="32" cy="0" r="3.5" fill="#c8cdd2" stroke="#3b4148"/>' +
    '<path d="M-14 14H14M-9 19H9M-4 24H4" stroke="#59626b" stroke-width="2" stroke-linecap="round"/>' +
    '<text x="0" y="-14" class="tsm" text-anchor="middle">Earth ' + r(s.earth, 2) + ' Ω</text>');
  var cap = lamps.length ? lamps[Math.floor((lamps.length - 1) / 2)] : { x: 400, y: 50 };
  X += '<text x="' + cap.x + '" y="' + (series ? cap.y + 42 : BOT + 40) + '" class="ts" text-anchor="middle">' + s.n + ' lamp' + (s.n > 1 ? 's' : '') + ' in ' + s.layout + '</text>';
  X += '<text x="' + (maxX - 8) + '" y="14" class="tsm" text-anchor="end" style="font-size:10px">Drag any part to move it</text>';
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
  ctl.v = slider('Battery voltage', 10, 24, 0.1, 12.6, 'V', update, 1);
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
