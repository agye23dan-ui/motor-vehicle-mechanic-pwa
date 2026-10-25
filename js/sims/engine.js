import { h } from '../dom.js';
import { slider, readout, paint, r } from './kit.js';

/*
 * Four-stroke engine. A piston, rod and crank turn through 720 degrees of crank angle, with valves
 * driven by cam timing and a spark at the set advance. All timing is in degrees of crank angle.
 */

var CRANK = 40, ROD = 120, BORE = 80;          // drawing units: crank radius, rod length, bore width
var STROKES = [['Intake', 0, 180, '#4aa3df'], ['Compression', 180, 360, '#e8c53a'], ['Power', 360, 540, '#d8442b'], ['Exhaust', 540, 720, '#8a8a8a']];

function strokeAt(a) {
  for (var i = 0; i < STROKES.length; i++) if (a >= STROKES[i][1] && a < STROKES[i][2]) return STROKES[i];
  return STROKES[0];
}

/* Valve lift 0..1 from an opening angle, a closing angle, both measured in crank degrees from 0 to 720. */
function lift(a, open, close) {
  var o = ((open % 720) + 720) % 720, c = ((close % 720) + 720) % 720;
  var span = (c - o + 720) % 720;
  var pos = (a - o + 720) % 720;
  if (pos > span) return 0;
  return Math.sin(Math.PI * pos / span);
}

function pistonY(a) {          // distance of the piston pin below the crank centre
  var t = a * Math.PI / 180;
  return CRANK * Math.cos(t) + Math.sqrt(ROD * ROD - CRANK * CRANK * Math.sin(t) * Math.sin(t));
}

export function build() {
  var holder = h('div', { class: 'sim-figure' });
  var out = readout();
  var ctl = {};
  var angle = 0, last = null, raf = null, running = true;

  function timing() {
    var iOpen = 720 - ctl.io.get();            // intake opens before TDC (crank 0 is TDC on intake)
    var iClose = 180 + ctl.ic.get();           // intake closes after bottom centre
    var eOpen = 540 - ctl.eo.get();            // exhaust opens before bottom centre of the power stroke
    var eClose = 720 + ctl.ec.get();           // exhaust closes after top centre
    return { iOpen: iOpen, iClose: iClose, eOpen: eOpen, eClose: eClose, spark: 360 - ctl.adv.get() };
  }

  function draw() {
    var tm = timing();
    var li = lift(angle, tm.iOpen, tm.iClose), le = lift(angle, tm.eOpen, tm.eClose);
    var st = strokeAt(angle % 720);
    var y = pistonY(angle);
    var cx = 150, crankY = 330, top = crankY - (ROD + CRANK) - 10;
    var py = crankY - y, pistonTop = py - 40;
    var burn = angle >= 360 && angle < 540;
    var sparkNow = Math.abs(angle - tm.spark) < 6 || Math.abs(angle - tm.spark - 720) < 6;
    var gas = angle < 180 ? '#4aa3df' : angle < 360 ? '#e8c53a' : angle < 540 ? '#d8442b' : '#8a8a8a';
    var s = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 30 560 392" role="img" aria-label="Four-stroke engine at ' + Math.round(angle % 720) + ' degrees: ' + st[0] + ' stroke"><title>Four-stroke engine</title><desc>A piston moving in a cylinder with intake and exhaust valves, and a timing circle.</desc>';
    // cylinder
    s += '<rect x="' + (cx - BORE / 2 - 8) + '" y="' + (top - 6) + '" width="' + (BORE + 16) + '" height="' + (pistonTop + 60 - top + 150) + '" rx="4" class="metal" style="fill-opacity:0.12"/>';
    s += '<rect x="' + (cx - BORE / 2) + '" y="' + top + '" width="' + BORE + '" height="' + Math.max(0, pistonTop - top) + '" style="fill:' + gas + ';fill-opacity:0.45"/>';
    s += '<path d="M' + (cx - BORE / 2) + ' ' + top + 'V' + (crankY - 60) + 'M' + (cx + BORE / 2) + ' ' + top + 'V' + (crankY - 60) + '" class="k"/>';
    // head and valves
    s += '<rect x="' + (cx - BORE / 2 - 8) + '" y="' + (top - 30) + '" width="' + (BORE + 16) + '" height="26" rx="3" class="metal-dark"/>';
    s += '<rect x="' + (cx - 26) + '" y="' + (top - 4 + li * 12 - 6) + '" width="20" height="6" class="tint-c"/><path d="M' + (cx - 16) + ' ' + (top - 30) + 'V' + (top - 4 + li * 12 - 6) + '" class="k bold"/>';
    s += '<rect x="' + (cx + 6) + '" y="' + (top - 4 + le * 12 - 6) + '" width="20" height="6" class="tint-m"/><path d="M' + (cx + 16) + ' ' + (top - 30) + 'V' + (top - 4 + le * 12 - 6) + '" class="k bold"/>';
    s += '<text x="' + (cx - 34) + '" y="' + (top - 36) + '" class="tsm" text-anchor="middle">Intake</text><text x="' + (cx + 38) + '" y="' + (top - 36) + '" class="tsm" text-anchor="middle">Exhaust</text>';
    // spark plug
    s += '<path d="M' + cx + ' ' + (top - 30) + 'V' + (top - 52) + '" class="k bold"/>' + (sparkNow ? '<path d="M' + (cx - 6) + ' ' + (top + 6) + 'L' + cx + ' ' + (top - 2) + 'L' + (cx + 6) + ' ' + (top + 8) + '" class="k bold" style="stroke:var(--yellow-ink)"/>' : '');
    // piston, rod, crank
    s += '<rect x="' + (cx - BORE / 2 + 2) + '" y="' + pistonTop + '" width="' + (BORE - 4) + '" height="40" rx="3" class="metal-dark"/>';
    var t = angle * Math.PI / 180, kx = cx + CRANK * Math.sin(t), ky = crankY - CRANK * Math.cos(t);
    s += '<circle cx="' + cx + '" cy="' + crankY + '" r="' + (CRANK + 14) + '" class="metal" style="fill-opacity:0.15"/>';
    s += '<path d="M' + cx + ' ' + py + 'L' + kx.toFixed(1) + ' ' + ky.toFixed(1) + '" class="k bold"/><path d="M' + cx + ' ' + crankY + 'L' + kx.toFixed(1) + ' ' + ky.toFixed(1) + '" class="k bold"/>';
    s += '<circle cx="' + cx + '" cy="' + crankY + '" r="8" class="metal-dark"/><circle cx="' + kx.toFixed(1) + '" cy="' + ky.toFixed(1) + '" r="6" class="box"/>';
    s += '<text x="' + cx + '" y="414" class="tb" text-anchor="middle">' + st[0] + ' stroke</text>';
    // timing circle
    var ox = 410, oy = 190, R1 = 120;
    function pt(a2, rad) { var q = (a2 - 90) * Math.PI / 180; return [ox + rad * Math.cos(q), oy + rad * Math.sin(q)]; }
    function arc(a0, a1, rad, color) {
      var p0 = pt(a0 / 2, rad), p1 = pt(a1 / 2, rad), span = (((a1 - a0) % 720) + 720) % 720;
      return '<path d="M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'A' + rad + ' ' + rad + ' 0 ' + (span / 2 > 180 ? 1 : 0) + ' 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + '" fill="none" stroke="' + color + '" stroke-width="10" stroke-opacity="0.75"/>';
    }
    s += '<circle cx="' + ox + '" cy="' + oy + '" r="' + R1 + '" class="box"/>';
    STROKES.forEach(function (q) { s += arc(q[1], q[2] - 0.5, R1 - 24, q[3]); });
    s += arc(tm.iOpen, tm.iClose, R1 - 40, '#2b79c4') + arc(tm.eOpen, tm.eClose, R1 - 52, '#a0281a');
    var sp = pt(tm.spark / 2, R1 - 8), sp2 = pt(tm.spark / 2, R1 - 30);
    s += '<path d="M' + sp[0].toFixed(1) + ' ' + sp[1].toFixed(1) + 'L' + sp2[0].toFixed(1) + ' ' + sp2[1].toFixed(1) + '" class="k bold" style="stroke:var(--yellow-ink)"/>';
    var np = pt((angle % 720) / 2, R1 - 4);
    s += '<path d="M' + ox + ' ' + oy + 'L' + np[0].toFixed(1) + ' ' + np[1].toFixed(1) + '" class="k bold" style="stroke:var(--magenta-ink)"/><circle cx="' + ox + '" cy="' + oy + '" r="5" class="metal-dark"/>';
    s += '<text x="' + ox + '" y="' + (oy - R1 - 10) + '" class="tsm" text-anchor="middle">Top centre: start of intake</text>';
    ['Outer ring: the four strokes', 'Blue arc: intake valve open', 'Red arc: exhaust valve open', 'Yellow tick: spark'].forEach(function (l, i) { s += '<text x="' + (ox - R1 + 6) + '" y="' + (oy + R1 + 22 + i * 16) + '" class="tsm">' + l + '</text>'; });
    s += '</svg>';
    paint(holder, s);
    out.set([
      ['Crank angle', r(angle % 720, 0) + ' degrees of 720'],
      ['Stroke', st[0]],
      ['Intake valve', li > 0.02 ? 'open (' + r(li * 100, 0) + '% lift)' : 'closed'],
      ['Exhaust valve', le > 0.02 ? 'open (' + r(le * 100, 0) + '% lift)' : 'closed'],
      ['Valve overlap', (li > 0.02 && le > 0.02) ? 'both open now' : r(ctl.io.get() + ctl.ec.get(), 0) + ' degrees around top centre'],
      ['Spark', 'at ' + ctl.adv.get() + ' degrees before top centre']
    ]);
  }

  function frame(ts) {
    if (last === null) last = ts;
    var dt = (ts - last) / 1000; last = ts;
    if (running) {
      var rpm = 60 * ctl.speed.get() / 100 * 20 / 1;      // display speed: 0 to 1200 rpm equivalent
      var deg = rpm * 6 * dt / 1;                          // degrees per second at rpm: rpm * 360 / 60
      angle = (angle + deg) % 720;
      draw();
    }
    raf = window.requestAnimationFrame(frame);
  }

  function manual() { running = false; angle = ctl.angle.get(); draw(); }
  ctl.speed = slider('Playback speed', 1, 100, 1, 12, '%', function () { running = true; }, 0);
  ctl.angle = slider('Crank angle (drag to step)', 0, 719, 1, 0, 'deg', manual, 0);
  ctl.adv = slider('Spark advance', 0, 40, 1, 12, 'deg BTDC', draw, 0);
  ctl.io = slider('Intake opens before top centre', 0, 40, 1, 10, 'deg', draw, 0);
  ctl.ic = slider('Intake closes after bottom centre', 20, 70, 1, 40, 'deg', draw, 0);
  ctl.eo = slider('Exhaust opens before bottom centre', 20, 70, 1, 45, 'deg', draw, 0);
  ctl.ec = slider('Exhaust closes after top centre', 0, 40, 1, 10, 'deg', draw, 0);
  var play = h('button', { type: 'button', class: 'btn small', onclick: function () { running = !running; play.textContent = running ? 'Pause' : 'Play'; last = null; } }, 'Pause');
  var playOnce = function () { play.textContent = running ? 'Pause' : 'Play'; };
  ctl.speed.el.addEventListener('input', function () { running = true; play.textContent = 'Pause'; last = null; });
  draw();
  raf = window.requestAnimationFrame(frame);
  var root = h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' }, holder, out.el,
      h('div', { class: 'note key' }, h('div', { class: 'label' }, 'Remember'), h('p', null, 'One full cycle takes two turns of the crankshaft, which is 720 degrees. The camshaft turns once for every two turns of the crank. Valve timing is set by the timing belt or chain, so a belt that jumps a tooth changes every one of these angles.'))),
    h('div', { class: 'sim-side' }, h('h3', null, 'Controls'), h('div', { class: 'btn-row' }, play), ctl.speed.el, ctl.angle.el, ctl.adv.el, ctl.io.el, ctl.ic.el, ctl.eo.el, ctl.ec.el,
      h('div', { class: 'sim-try' }, h('h3', null, 'Try this'), h('ol', null,
        h('li', null, 'Pause and step the crank angle. Find the angles where each valve opens and closes.'),
        h('li', null, 'Increase the overlap and watch both valves open together near top centre. Why does an engine with a lot of overlap idle roughly?'),
        h('li', null, 'Move the spark advance. Why must the spark come before top centre, not at it?'),
        h('li', null, 'Count the strokes. How many times does the spark fire per two crank turns?')))));
  root.destroy = function () { if (raf) window.cancelAnimationFrame(raf); raf = null; };
  playOnce();
  return root;
}

export default {
  id: 'engine', title: 'Four-stroke engine', icon: 'settings',
  blurb: 'Watch the piston, valves and spark through 720 degrees. Change the valve timing and spark advance and see the timing circle respond.',
  lesson: ['m04-l2', 'The four-stroke cycle'],
  build: build
};
