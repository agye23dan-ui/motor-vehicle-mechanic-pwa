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

function polarPt(cx, cy, rad, deg) { var a = deg * Math.PI / 180; return [cx + rad * Math.sin(a), cy - rad * Math.cos(a)]; }

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
    var s = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 8 560 414" role="img" aria-label="Four-stroke engine at ' + Math.round(angle % 720) + ' degrees: ' + st[0] + ' stroke"><title>Four-stroke engine</title><desc>A piston moving in a cylinder with intake and exhaust valves, and a timing circle.</desc>';
    // ---- cutaway of one cylinder: block, water jacket, head, valves, cams, piston, rod and crank ----
    var bx0 = cx - BORE / 2, bx1 = cx + BORE / 2, camY = top - 124, seat = top - 6;
    var iX = cx - 24, eX = cx + 24;
    var t = angle * Math.PI / 180, kx = cx + CRANK * Math.sin(t), ky = crankY - CRANK * Math.cos(t);
    var rodDx = kx - cx, rodDy = ky - py, rodLen = Math.hypot(rodDx, rodDy) || 1, nx = -rodDy / rodLen, ny = rodDx / rodLen;
    var flame = burn ? 0.15 + 0.8 * Math.max(0, 1 - (angle % 720 - 360) / 150) : (angle >= tm.spark && angle < 360 ? 0.3 : 0);
    function camMid(open, close) { var o = ((open % 720) + 720) % 720, c = ((close % 720) + 720) % 720, span = (c - o + 720) % 720; return o + span / 2; }
    function cam(x, mid) {
      var rot = ((angle - mid) / 2) % 360;
      return '<g transform="translate(' + x + ' ' + camY + ') rotate(' + rot.toFixed(1) + ')"><ellipse cx="0" cy="5" rx="10" ry="14" fill="url(#enMetal)" stroke="#3b4148"/><circle r="4" fill="#2a2f35"/></g>';
    }
    s += '<defs>' +
      '<linearGradient id="enIron" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a3f45"/><stop offset="0.5" stop-color="#6c737b"/><stop offset="1" stop-color="#3a3f45"/></linearGradient>' +
      '<linearGradient id="enHead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd5db"/><stop offset="1" stop-color="#8e969e"/></linearGradient>' +
      '<linearGradient id="enMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6eaee"/><stop offset="1" stop-color="#8b949d"/></linearGradient>' +
      '<linearGradient id="enPiston" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e969e"/><stop offset="0.45" stop-color="#e3e7eb"/><stop offset="1" stop-color="#7d858d"/></linearGradient>' +
      '<radialGradient id="enFlame" cx="0.5" cy="0.35" r="0.65"><stop offset="0" stop-color="#fff6c4"/><stop offset="0.35" stop-color="#ffb12a"/><stop offset="1" stop-color="#d8442b" stop-opacity="0"/></radialGradient>' +
      '</defs>';
    // block with its water jackets and the oil pan
    s += '<rect x="' + (bx0 - 30) + '" y="' + (top - 8) + '" width="' + (BORE + 60) + '" height="' + (crankY - 52 - top + 8) + '" fill="url(#enIron)" stroke="#1d2024"/>';
    [bx0 - 22, bx1 + 8].forEach(function (x) { s += '<rect x="' + x + '" y="' + (top + 4) + '" width="14" height="' + (crankY - 70 - top) + '" rx="3" fill="#7fc4e8" fill-opacity="0.55" stroke="#4a8fb3" stroke-width="0.8"/>'; });
    s += '<path d="M' + (cx - 100) + ' ' + (crankY + 34) + 'Q' + (cx - 100) + ' ' + (crankY + 64) + ' ' + (cx - 60) + ' ' + (crankY + 64) + 'H' + (cx + 60) + 'Q' + (cx + 100) + ' ' + (crankY + 64) + ' ' + (cx + 100) + ' ' + (crankY + 34) + 'Z" fill="#2c3036" stroke="#101214"/>' +
      '<path d="M' + (cx - 94) + ' ' + (crankY + 54) + 'Q' + (cx - 47) + ' ' + (crankY + 48) + ' ' + cx + ' ' + (crankY + 54) + 'T' + (cx + 94) + ' ' + (crankY + 54) + 'V' + (crankY + 62) + 'H' + (cx - 94) + 'Z" fill="#c9a23c" fill-opacity="0.8"/>';
    s += '<rect x="' + (bx0 - 30) + '" y="' + (crankY - 60) + '" width="' + (BORE + 60) + '" height="28" fill="#2c3036" stroke="#101214"/>';
    // combustion chamber and the gas in it
    s += '<path d="M' + bx0 + ' ' + (top + 2) + 'V' + (top - 6) + 'Q' + cx + ' ' + (top - 22) + ' ' + bx1 + ' ' + (top - 6) + 'V' + (top + 2) + 'V' + pistonTop.toFixed(1) + 'H' + bx0 + 'Z" fill="' + gas + '" fill-opacity="0.5"/>';
    if (flame > 0) s += '<ellipse cx="' + cx + '" cy="' + (top + Math.max(10, (pistonTop - top) * 0.45)).toFixed(1) + '" rx="' + (BORE / 2 + 4) + '" ry="' + Math.max(16, (pistonTop - top) * 0.6).toFixed(1) + '" fill="url(#enFlame)" opacity="' + flame.toFixed(2) + '"/>';
    s += '<path d="M' + bx0 + ' ' + top + 'V' + (crankY - 60) + 'M' + bx1 + ' ' + top + 'V' + (crankY - 60) + '" stroke="#e6eaee" stroke-width="2" opacity="0.55"/>';
    // cylinder head, ports and gas flow
    s += '<rect x="' + (bx0 - 30) + '" y="' + (top - 74) + '" width="' + (BORE + 60) + '" height="66" rx="4" fill="url(#enHead)" stroke="#59626b"/>';
    s += '<path d="M' + (bx0 - 30) + ' ' + (top - 46) + 'Q' + (iX - 24) + ' ' + (top - 46) + ' ' + iX + ' ' + (top - 10) + '" fill="none" stroke="' + (li > 0.02 ? '#4aa3df' : '#6d747c') + '" stroke-width="15" stroke-linecap="round" opacity="0.85"/>';
    s += '<path d="M' + eX + ' ' + (top - 10) + 'Q' + (eX + 24) + ' ' + (top - 46) + ' ' + (bx1 + 30) + ' ' + (top - 46) + '" fill="none" stroke="' + (le > 0.02 ? '#b5543f' : '#6d747c') + '" stroke-width="15" stroke-linecap="round" opacity="0.85"/>';
    if (li > 0.02) s += '<path d="M' + (bx0 - 22) + ' ' + (top - 54) + 'l12 8l-12 8M' + (bx0 - 2) + ' ' + (top - 52) + 'l12 8l-12 8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
    if (le > 0.02) s += '<path d="M' + (bx1 + 4) + ' ' + (top - 54) + 'l12 8l-12 8M' + (bx1 + 22) + ' ' + (top - 54) + 'l12 8l-12 8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
    // valves with their springs, and the camshafts that open them
    [[iX, li, 'Intake'], [eX, le, 'Exhaust']].forEach(function (v) {
      var x = v[0], lift = v[1] * 12, head = seat + lift;
      s += '<path d="M' + x + ' ' + (top - 74) + 'V' + head.toFixed(1) + '" stroke="#cfd4da" stroke-width="5" stroke-linecap="round"/>';
      s += '<path d="M' + (x - 13) + ' ' + head.toFixed(1) + 'L' + (x + 13) + ' ' + head.toFixed(1) + 'L' + (x + 5) + ' ' + (head - 8).toFixed(1) + 'H' + (x - 5) + 'Z" fill="#8d96a0" stroke="#3b4148"/>';
      var y0 = top - 74, y1 = top - 100 + lift, n = 7, sp = 'M' + (x - 9) + ' ' + y0;
      for (var q = 1; q <= n; q++) sp += 'L' + (x + (q % 2 ? 9 : -9)) + ' ' + (y0 + (y1 - y0) * q / n).toFixed(1);
      s += '<path d="' + sp + '" fill="none" stroke="#7a828b" stroke-width="2.4"/><rect x="' + (x - 11) + '" y="' + (y1 - 6).toFixed(1) + '" width="22" height="6" rx="2" fill="#4a5058"/>';
    });
    s += cam(iX, camMid(tm.iOpen, tm.iClose)) + cam(eX, camMid(tm.eOpen, tm.eClose));
    s += '<text x="' + (iX - 26) + '" y="' + (camY - 22) + '" class="tsm" text-anchor="middle" style="font-size:10px">Intake cam</text><text x="' + (eX + 26) + '" y="' + (camY - 22) + '" class="tsm" text-anchor="middle" style="font-size:10px">Exhaust cam</text>';
    // spark plug
    s += '<rect x="' + (cx - 5) + '" y="' + (top - 112) + '" width="10" height="40" rx="2" fill="#f1f0ea" stroke="#9aa2aa"/><path d="M' + (cx - 8) + ' ' + (top - 72) + 'h16l-2 -8h-12z" fill="#aab2ba" stroke="#59626b"/><rect x="' + (cx - 3) + '" y="' + (top - 74) + '" width="6" height="68" fill="#8d96a0"/><path d="M' + cx + ' ' + (top - 8) + 'v6h7" fill="none" stroke="#cfd4da" stroke-width="2.5"/>';
    if (sparkNow) s += '<path d="M' + (cx + 7) + ' ' + (top - 2) + 'l-5 7l7 3l-6 8" fill="none" stroke="#ffe44d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    // piston, rings, wrist pin, connecting rod and crank
    s += '<rect x="' + (bx0 + 2) + '" y="' + pistonTop.toFixed(1) + '" width="' + (BORE - 4) + '" height="42" rx="3" fill="url(#enPiston)" stroke="#3b4148"/>';
    [5, 11, 17].forEach(function (d) { s += '<path d="M' + (bx0 + 2) + ' ' + (pistonTop + d).toFixed(1) + 'H' + (bx1 - 2) + '" stroke="#2a2f35" stroke-width="2"/>'; });
    s += '<path d="M' + (kx.toFixed(1)) + ' ' + ky.toFixed(1) + 'L' + (cx + nx * 11).toFixed(1) + ' ' + (py + ny * 11).toFixed(1) + 'L' + (cx - nx * 11).toFixed(1) + ' ' + (py - ny * 11).toFixed(1) + 'Z" fill="none"/>' +
      '<path d="M' + (kx + nx * 12).toFixed(1) + ' ' + (ky + ny * 12).toFixed(1) + 'L' + (cx + nx * 6).toFixed(1) + ' ' + (py + ny * 6).toFixed(1) + 'L' + (cx - nx * 6).toFixed(1) + ' ' + (py - ny * 6).toFixed(1) + 'L' + (kx - nx * 12).toFixed(1) + ' ' + (ky - ny * 12).toFixed(1) + 'Z" fill="#aeb5bc" stroke="#3b4148"/>';
    s += '<circle cx="' + cx + '" cy="' + py.toFixed(1) + '" r="8" fill="#4a5058" stroke="#1d2024"/>';
    var cwA = angle + 180;
    var cw0 = polarPt(cx, crankY, 46, cwA - 55), cw1 = polarPt(cx, crankY, 46, cwA + 55);
    s += '<circle cx="' + cx + '" cy="' + crankY + '" r="' + (CRANK + 16) + '" fill="#101214" fill-opacity="0.18"/>';
    s += '<path d="M' + cx + ' ' + crankY + 'L' + cw0[0].toFixed(1) + ' ' + cw0[1].toFixed(1) + 'A46 46 0 0 1 ' + cw1[0].toFixed(1) + ' ' + cw1[1].toFixed(1) + 'Z" fill="#4a5058" stroke="#1d2024"/>';
    s += '<path d="M' + cx + ' ' + crankY + 'L' + kx.toFixed(1) + ' ' + ky.toFixed(1) + '" stroke="#6b737c" stroke-width="12" stroke-linecap="round"/>';
    s += '<circle cx="' + kx.toFixed(1) + '" cy="' + ky.toFixed(1) + '" r="12" fill="#aeb5bc" stroke="#3b4148"/><circle cx="' + kx.toFixed(1) + '" cy="' + ky.toFixed(1) + '" r="6" fill="#4a5058"/>';
    s += '<circle cx="' + cx + '" cy="' + crankY + '" r="14" fill="url(#enMetal)" stroke="#3b4148"/><circle cx="' + cx + '" cy="' + crankY + '" r="5" fill="#2a2f35"/>';
    s += '<text x="' + cx + '" y="418" class="tb" text-anchor="middle">' + st[0] + ' stroke</text>';
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

  function manual() { running = false; play.textContent = 'Play'; angle = ctl.angle.get(); draw(); }
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
