import { h } from '../dom.js';
import { select, toggle, readout, paint, r } from './kit.js';

/*
 * Oscilloscope trainer. Pick a signal, set volts per division and time per division, and read the
 * trace. Each signal has a healthy and a faulty version. The shapes are typical, for practice.
 */

function noise(t, seed) { return Math.sin(t * 12.9898 + seed) * 43758.5453 % 1; }

var SIGNALS = {
  hall: {
    name: 'Hall wheel or crank sensor', fine: { v: 2, t: 5 }, unit: '0 to 5 V square wave',
    healthy: function (t) { return (t % 4) < 2 ? 5 : 0; },
    faulty: function (t) { var n = Math.floor(t / 4); return ((t % 4) < 2 && Math.sin(n * 7.3) > -0.45) ? 5 : 0; },
    good: 'Clean square pulses of equal height and spacing, with sharp edges.',
    bad: 'Some pulses are missing. The computer loses the engine position. Look for a loose connector, a damaged wire, a cracked ring or too large an air gap.'
  },
  inductive: {
    name: 'Inductive crank sensor', fine: { v: 2, t: 5 }, unit: 'AC sine wave',
    healthy: function (t) { return 3.2 * Math.sin(t * 2 * Math.PI / 4); },
    faulty: function (t) { return 0.7 * Math.sin(t * 2 * Math.PI / 4) + 0.15 * noise(t, 3); },
    good: 'A strong AC wave. Its height grows with engine speed.',
    bad: 'The signal is weak. The air gap may be too wide, the sensor weak or the tone ring damaged. A weak signal at cranking speed may stop the engine starting.'
  },
  o2: {
    name: 'Oxygen sensor (zirconia)', fine: { v: 0.2, t: 500 }, unit: '0.1 to 0.9 V, switching',
    healthy: function (t) { var p = (t % 1000) / 1000; var s = Math.sin(p * 2 * Math.PI); return 0.5 + 0.4 * Math.tanh(s * 5); },
    faulty: function (t) { return 0.45 + 0.04 * Math.sin(t * 2 * Math.PI / 3200) + 0.02 * noise(t / 50, 1); },
    good: 'Switches quickly between about 0.1 V (lean) and 0.9 V (rich), a few times every ten seconds or faster.',
    bad: 'A flat, lazy signal near the middle. The sensor is slow or worn and the computer cannot control the mixture properly.'
  },
  injector: {
    name: 'Fuel injector (voltage)', fine: { v: 10, t: 5 }, unit: '12 V supply, pulled to earth',
    healthy: function (t) { var p = t % 20; if (p < 3.5) return 0.4; if (p < 3.9) return 52; return 14; },
    faulty: function (t) { var p = t % 20; if (p < 3.5) return 0.4; return 14; },
    good: 'Battery voltage, a clean drop to earth while it fires, then a voltage spike when it switches off.',
    bad: 'No spike at turn-off. The injector winding may be shorted or the driver weak. Compare with the injector resistance and the pattern of the others.'
  },
  ripple: {
    name: 'Battery voltage with the engine running', fine: { v: 0.5, t: 2 }, unit: 'about 14 V with a little ripple',
    healthy: function (t) { return 14.2 + 0.08 * Math.sin(t * 2 * Math.PI / 0.9); },
    faulty: function (t) { var ph = (t % 1.8) / 1.8; return 13.7 + (ph < 0.66 ? 0.5 * Math.sin(ph / 0.66 * Math.PI) : -0.1); },
    good: 'A nearly flat line at about 14 V with only a tiny ripple.',
    bad: 'A large, repeating ripple: one of the alternator diodes has failed. The battery will not charge properly and electronics may be upset.'
  },
  map: {
    name: 'MAP sensor on a throttle snap', fine: { v: 1, t: 100 }, unit: '0.5 to 4.5 V',
    healthy: function (t) { var p = t % 1000; if (p < 300) return 1.0; if (p < 380) return 1 + 3.2 * (p - 300) / 80; if (p < 600) return 4.2 - 2.7 * (p - 380) / 220; return 1.5 - 0.5 * Math.min(1, (p - 600) / 200); },
    faulty: function (t) { var p = t % 1000; var b = (p < 300 ? 1.0 : p < 380 ? 1 + 3.2 * (p - 300) / 80 : p < 600 ? 4.2 - 2.7 * (p - 380) / 220 : 1.1); return b + 0.5 * noise(t / 6, 5); },
    good: 'A smooth, quick rise as the throttle opens and a smooth return.',
    bad: 'The trace is noisy with spikes. The sensor, wiring or connector is unreliable, or the supply is poor.'
  }
};

var VDIV = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20];
var TDIV = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
var COLS = 10, ROWS = 8;

export function build() {
  var holder = h('div', { class: 'sim-figure' });
  var out = readout();
  var tip = h('div', { class: 'note tip', role: 'status' });
  var ctl = {};
  function update() {
    var sig = SIGNALS[ctl.sig.get()], fn = ctl.fault.get() ? sig.faulty : sig.healthy;
    var vdiv = parseFloat(ctl.v.get()), tdiv = parseFloat(ctl.t.get()), offset = parseFloat(ctl.off.get());
    var W = 560, H = 360, x0 = 30, y0 = 20, gw = 500, gh = 320;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Oscilloscope trace of ' + sig.name + '"><title>Oscilloscope</title><desc>A trace on a ten by eight division grid.</desc>';
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + gw + '" height="' + gh + '" rx="6" style="fill:#10181c"/>';
    for (var i = 0; i <= COLS; i++) s += '<path d="M' + (x0 + gw * i / COLS) + ' ' + y0 + 'V' + (y0 + gh) + '" stroke="#3d5058" stroke-width="' + (i % 5 === 0 ? 1.4 : 0.6) + '"/>';
    for (var j = 0; j <= ROWS; j++) s += '<path d="M' + x0 + ' ' + (y0 + gh * j / ROWS) + 'H' + (x0 + gw) + '" stroke="#3d5058" stroke-width="' + (j === ROWS / 2 ? 1.4 : 0.6) + '"/>';
    var totalT = tdiv * COLS, d = '', maxV = -1e9, minV = 1e9, edges = 0, vals = [], clip = false;
    var N = 500;
    for (var k = 0; k <= N; k++) {
      var tt = totalT * k / N, v = fn(tt);
      if (v > maxV) maxV = v; if (v < minV) minV = v;
      var yv = (v / vdiv) + offset;                // in divisions above the centre line
      if (Math.abs(yv) > ROWS / 2) clip = true;
      var yy = Math.max(-ROWS / 2, Math.min(ROWS / 2, yv));
      var px = x0 + gw * k / N, py = y0 + gh / 2 - yy * gh / ROWS;
      d += (k ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1);
      vals.push(v);
    }
    var mid = (maxV + minV) / 2, band = (maxV - minV) * 0.08, side = 0;
    vals.forEach(function (v) { var now = v > mid + band ? 1 : v < mid - band ? -1 : 0; if (now !== 0) { if (side !== 0 && now !== side) edges++; side = now; } });
    s += '<path d="' + d + '" fill="none" stroke="#5bf08b" stroke-width="2" stroke-linejoin="round"/>';
    s += '<text x="' + (x0 + 8) + '" y="' + (y0 + 16) + '" fill="#9fd2b0" font-size="12">' + vdiv + ' V/div   ' + (tdiv >= 1 ? tdiv + ' ms/div' : (tdiv * 1000) + ' us/div') + '</text>';
    s += '</svg>';
    paint(holder, s);
    var span = maxV - minV, screenV = ROWS * vdiv, fill = span / screenV;
    var cycles = Math.max(1, Math.round(edges / 2));
    out.set([
      ['Signal', sig.name],
      ['Normal shape', sig.unit],
      ['Largest value in view', r(maxV, 2) + ' V'],
      ['Smallest value in view', r(minV, 2) + ' V'],
      ['Screen height used', r(Math.min(fill, 9) * 100, 0) + '%'],
      ['Changes in view', String(edges)]
    ]);
    var advice = [];
    if (clip) advice.push('The trace runs off the screen. Raise the volts per division or move the trace.');
    else if (fill < 0.25) advice.push('The trace is tiny. Lower the volts per division so it fills at least half of the screen.');
    else if (fill >= 0.4 && fill <= 0.95) advice.push('Good vertical setting: the signal fills most of the screen.');
    if (edges === 0) advice.push('No changes are visible. Try a longer time per division, or the signal may be flat (check the fault).');
    else if (edges > 60) advice.push('Too many cycles are squeezed together. Shorten the time per division to see the shape.');
    else if (edges < 4 && sig.fine.t < 1000) advice.push('You can see only a little of the pattern. Lengthen the time per division.');
    else if (edges >= 6 && edges <= 40) advice.push('Good horizontal setting: several cycles are readable.');
    advice.push(ctl.fault.get() ? sig.bad : sig.good);
    tip.replaceChildren(h('div', { class: 'label' }, 'Reading the trace'), h('ul', null, advice.map(function (a) { return h('li', null, a); })));
  }
  function opt(list, fmt) { return list.map(function (v) { return [String(v), fmt(v)]; }); }
  ctl.sig = select('Signal', Object.keys(SIGNALS).map(function (k) { return [k, SIGNALS[k].name]; }), 'hall', function () {
    var sg = SIGNALS[ctl.sig.get()]; ctl.v.set(String(sg.fine.v)); ctl.t.set(String(sg.fine.t)); update();
  });
  ctl.v = select('Volts per division', opt(VDIV, function (v) { return v + ' V/div'; }), '2', update);
  ctl.t = select('Time per division', opt(TDIV, function (v) { return v >= 1 ? v + ' ms/div' : (v * 1000) + ' us/div'; }), '5', update);
  ctl.off = select('Trace position', [['0', 'Centre'], ['-2', 'Low (for positive signals)'], ['2', 'High'], ['-3', 'Very low']], '0', update);
  ctl.fault = toggle('Show the faulty version', false, update);
  update();
  return h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' }, holder, tip, out.el),
    h('div', { class: 'sim-side' }, h('h3', null, 'Controls'), ctl.sig.el, ctl.v.el, ctl.t.el, ctl.off.el, ctl.fault.el,
      h('div', { class: 'sim-try' }, h('h3', null, 'Try this'), h('ol', null,
        h('li', null, 'Choose the injector. Set 10 V per division and a position that shows the spike. Then switch on the fault and compare.'),
        h('li', null, 'For the oxygen sensor, find a time per division that shows several switches. What happens at 1 ms per division?'),
        h('li', null, 'Look at the battery ripple at 0.5 V per division, then raise it to 5 V per division. Why can a meter hide the fault?'),
        h('li', null, 'Choose a setting that makes the trace clip. How do you tell?')))));
}

export default {
  id: 'scope', title: 'Oscilloscope trainer', icon: 'progress',
  blurb: 'Learn to set volts and time per division and read sensor traces. Compare healthy and faulty signals for six common sensors.',
  lesson: ['m09-l8', 'Using an oscilloscope for electrical diagnosis'],
  build: build
};
