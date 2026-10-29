import { h } from '../dom.js';
import { slider, select, readout, paint, r, clamp } from './kit.js';

/*
 * Gearbox and driveline simulator. Pick a gear and engine speed to see road speed, wheel torque
 * and pulling force, and compare all the gears on one chart.
 */

var GEARS = {
  five: { name: '5-speed manual', ratios: [3.62, 2.05, 1.38, 1.0, 0.8], reverse: 3.4 },
  six: { name: '6-speed manual', ratios: [3.7, 2.1, 1.43, 1.1, 0.88, 0.72], reverse: 3.5 },
  four: { name: '4-speed automatic', ratios: [2.8, 1.5, 1.0, 0.7], reverse: 2.4 }
};
var REDLINE = 6000, IDLE = 800;

function torque(rpm) {                       // simple torque curve in N m
  var x = clamp((rpm - 1000) / 5000, 0, 1);
  var t = 110 + 90 * Math.sin(Math.PI * Math.min(1, x * 1.15)) - 60 * Math.max(0, x - 0.8) * 5;
  return Math.max(60, t);
}

/* The picture is redrawn on every change, so each animation takes a delay from the clock to keep its place. */
function phase(period) { return '-' + ((performance.now() / 1000) % period).toFixed(3) + 's'; }

/* A section through a manual gearbox. Each pair of gears is drawn at its true size ratio, so a low gear shows a big
   layshaft gear meshing a small output gear. The engaged pair and the torque path through it are highlighted. */
function cutaway(box, gear, rpm, ratioNow) {
  var D = 80, yIn = 78, yLay = 158, n = box.ratios.length;
  var x0 = 150, slot = (524 - x0) / n;
  var cin = 1.22;                                                     // the constant-mesh pair from the input shaft
  var layRpm = rpm / cin, outRpm = rpm / ratioNow;
  var dashDur = function (v) { return (60 / Math.max(60, v) * 6).toFixed(2); };
  var shaft = function (x1, y, x2, v, colour, w) {
    var dd = dashDur(v);
    return '<path d="M' + x1 + ' ' + y + 'H' + x2 + '" stroke="' + colour + '" stroke-width="' + w + '"/>' +
      '<path d="M' + x1 + ' ' + y + 'H' + x2 + '" stroke="#fff" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="5 11" class="cflow" style="animation-duration:' + dd + 's;animation-delay:' + phase(+dd) + '"/>';
  };
  var teeth = function (x, y, h, wd, up) {
    var t = '';
    for (var k = -Math.floor(h / 12); k <= Math.floor(h / 12); k++) t += '<rect x="' + (x - wd / 2 - 3) + '" y="' + (y + k * 6 - 1.5) + '" width="3" height="3" fill="#555d66"/><rect x="' + (x + wd / 2) + '" y="' + (y + k * 6 - 1.5) + '" width="3" height="3" fill="#555d66"/>';
    return t;
  };
  var g = '<defs><linearGradient id="gbMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a9b0b7"/><stop offset="0.5" stop-color="#e3e7eb"/><stop offset="1" stop-color="#a9b0b7"/></linearGradient>' +
    '<linearGradient id="gbCase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#555d66"/><stop offset="1" stop-color="#30353b"/></linearGradient></defs>';
  g += '<path d="M24 20H536V252H24Z" fill="url(#gbCase)" stroke="#1d2024" stroke-width="2"/><path d="M34 30H526V242H34Z" fill="#1b1e22" stroke="#101214"/>';
  g += '<path d="M24 30H4V108H24" fill="#3a4047" stroke="#1d2024"/><text transform="rotate(-90 15 70)" x="15" y="73" text-anchor="middle" style="font-size:9px;fill:#e8edf1;stroke:none">Clutch</text>';
  // shafts
  g += shaft(4, yIn, 80, rpm, '#8d96a0', 9) + shaft(80, yIn, 548, outRpm, '#8d96a0', 9) + shaft(60, yLay, 524, layRpm, '#7d868f', 9);
  // constant-mesh pair on the input shaft
  var rIn = D / (1 + cin), rLayIn = D - rIn;
  g += '<rect x="72" y="' + (yIn - rIn).toFixed(1) + '" width="16" height="' + (2 * rIn).toFixed(1) + '" rx="2" fill="url(#gbMetal)" stroke="#3b4148"/>' + teeth(80, yIn, 2 * rIn, 16);
  g += '<rect x="72" y="' + (yLay - rLayIn).toFixed(1) + '" width="16" height="' + (2 * rLayIn).toFixed(1) + '" rx="2" fill="url(#gbMetal)" stroke="#3b4148"/>' + teeth(80, yLay, 2 * rLayIn, 16);
  // one pair of gears for each ratio
  box.ratios.forEach(function (rt, i) {
    var x = x0 + (i + 0.5) * slot, on = i === gear;
    var rMain = D / (1 + rt), rLay = D - rMain;
    var edge = on ? '#d6335a' : '#3b4148', fill = on ? '#f3d4dc' : 'url(#gbMetal)';
    g += '<rect x="' + (x - 9) + '" y="' + (yIn - rMain).toFixed(1) + '" width="18" height="' + (2 * rMain).toFixed(1) + '" rx="2" fill="' + fill + '" stroke="' + edge + '" stroke-width="' + (on ? 2.4 : 1) + '"/>' + teeth(x, yIn, 2 * rMain, 18);
    g += '<rect x="' + (x - 9) + '" y="' + (yLay - rLay).toFixed(1) + '" width="18" height="' + (2 * rLay).toFixed(1) + '" rx="2" fill="' + fill + '" stroke="' + edge + '" stroke-width="' + (on ? 2.4 : 1) + '"/>' + teeth(x, yLay, 2 * rLay, 18);
    g += '<text x="' + x + '" y="234" text-anchor="middle" style="font-size:12px;font-weight:800;fill:' + (on ? '#ff6f8f' : '#e8edf1') + ';stroke:none">' + (i + 1) + '</text>';
    if (on) {
      g += '<rect x="' + (x - 24) + '" y="' + (yIn - 8) + '" width="12" height="16" rx="2" fill="#c8cdd2" stroke="#59626b"/><path d="M' + (x - 18) + ' ' + (yIn - 8) + 'V22" stroke="#d6335a" stroke-width="3"/><rect x="' + (x - 26) + '" y="20" width="16" height="7" rx="2" fill="#d6335a"/>';
    }
  });
  // torque path: input shaft, constant pair, layshaft, selected gear, output shaft
  var xs = x0 + (gear + 0.5) * slot;
  g += '<path d="M4 ' + yIn + 'H80V' + yLay + 'H' + xs.toFixed(1) + 'V' + yIn + 'H548" fill="none" stroke="#d6335a" stroke-width="3" stroke-linejoin="round" stroke-dasharray="2 5" stroke-opacity="0.9"/>';
  g += '<text x="280" y="270" class="tsm" text-anchor="middle" style="font-size:10px">Input ' + r(rpm, 0) + ' rpm → layshaft ' + r(layRpm, 0) + ' → output ' + r(outRpm, 0) + ' rpm · gear ' + (gear + 1) + ' engaged · ' + r(ratioNow, 2) + ' : 1</text>';
  return g;
}

export function build() {
  var holder = h('div', { class: 'sim-figure' });
  var out = readout();
  var tip = h('div', { class: 'note tip', role: 'status' });
  var ctl = {};
  function update() {
    var box = GEARS[ctl.box.get()], gear = parseInt(ctl.gear.get(), 10) - 1, fd = parseFloat(ctl.fd.get());
    var circ = parseFloat(ctl.tyre.get()), rpm = ctl.rpm.get(), mass = ctl.mass.get();
    var ratio = box.ratios[gear], total = ratio * fd;
    var kmh = rpm / total * circ * 60 / 1000;
    var te = torque(rpm), tw = te * total * 0.9;
    var rw = circ / (2 * Math.PI), force = tw / rw;
    var roll = mass * 9.81 * 0.015;
    var net = Math.max(0, force - roll);
    var grade = Math.atan(net / (mass * 9.81)) * 100 / 1;                       // percent (rise over run, small angle)
    grade = Math.tan(Math.asin(clamp(net / (mass * 9.81), 0, 0.9))) * 100;
    // chart: speed on x (0..220), rpm on y
    var W = 560, Hh = 320, gx = 50, gy = 20, gw = 480, gh = 250, vmax = 220, TOP = 284;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 ' + W + ' ' + (Hh + TOP) + '" role="img" aria-label="Engine speed against road speed for each gear"><title>Gearbox</title><desc>A section through the gearbox with the engaged gear highlighted, and a chart of engine speed against road speed for each gear.</desc>';
    s += cutaway(box, gear, rpm, ratio) + '<g transform="translate(0 ' + TOP + ')">';
    s += '<rect x="' + gx + '" y="' + gy + '" width="' + gw + '" height="' + gh + '" class="box"/>';
    [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000].forEach(function (v) {
      var y = gy + gh - v / 7000 * gh;
      s += '<path d="M' + gx + ' ' + y.toFixed(1) + 'H' + (gx + gw) + '" class="zero"/><text x="' + (gx - 6) + '" y="' + (y + 4).toFixed(1) + '" class="tsm" text-anchor="end">' + v + '</text>';
    });
    for (var v = 0; v <= vmax; v += 40) {
      var x = gx + v / vmax * gw;
      s += '<text x="' + x.toFixed(1) + '" y="' + (gy + gh + 16) + '" class="tsm" text-anchor="middle">' + v + '</text>';
    }
    s += '<path d="M' + gx + ' ' + (gy + gh - REDLINE / 7000 * gh) + 'H' + (gx + gw) + '" class="barrier"/><text x="' + (gx + gw - 4) + '" y="' + (gy + gh - REDLINE / 7000 * gh - 4) + '" class="tsm" text-anchor="end">Redline</text>';
    box.ratios.forEach(function (rt, i) {
      var tot = rt * fd, vtop = REDLINE / tot * circ * 60 / 1000, vlow = IDLE / tot * circ * 60 / 1000;
      var x0 = gx + vlow / vmax * gw, y0 = gy + gh - IDLE / 7000 * gh;
      var x1 = gx + Math.min(vtop, vmax) / vmax * gw, y1 = gy + gh - Math.min(REDLINE, Math.min(vtop, vmax) * tot / circ * 1000 / 60) / 7000 * gh;
      s += '<path d="M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + 'L' + x1.toFixed(1) + ' ' + y1.toFixed(1) + '" class="k" style="' + (i === gear ? 'stroke:var(--magenta-ink);stroke-width:3.4' : 'stroke-width:1.6') + '"/>';
      s += '<text x="' + (x1 + 4).toFixed(1) + '" y="' + (y1 + 4).toFixed(1) + '" class="tsm">' + (i + 1) + '</text>';
    });
    var mx = gx + clamp(kmh, 0, vmax) / vmax * gw, my = gy + gh - rpm / 7000 * gh;
    s += '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="7" class="box tint-y"/>';
    s += '<text x="' + (gx + gw / 2) + '" y="' + (Hh - 6) + '" class="tb" text-anchor="middle">Road speed (km/h)</text>';
    s += '</g></svg>';
    paint(holder, s);
    var topSpeed = REDLINE / total * circ * 60 / 1000;
    out.set([
      ['Gear ratio and overall ratio', r(ratio, 2) + ' : 1 and ' + r(total, 2) + ' : 1'],
      ['Road speed', r(kmh, 0) + ' km/h'],
      ['Engine torque at this speed', r(te, 0) + ' N m'],
      ['Torque at the driven wheels', r(tw, 0) + ' N m'],
      ['Pulling force at the road', r(force, 0) + ' N'],
      ['Steepest hill it can climb (at this point)', r(grade, 0) + '% gradient'],
      ['Top speed in this gear at the redline', r(topSpeed, 0) + ' km/h']
    ]);
    var msg = [];
    if (rpm > REDLINE * 0.97) msg.push('The engine is at the redline. Change up.');
    else if (rpm < 1500 && gear > 0 && ctl.rpm.get() >= IDLE) msg.push('The engine speed is low for this gear. It will feel sluggish and may labour. Consider changing down.');
    else if (rpm >= 2000 && rpm <= 4500) msg.push('This engine speed is in the sweet spot, where torque is strong.');
    if (gear === 0) msg.push('First gear gives the most force at the wheels but the lowest top speed. It is for pulling away and steep hills.');
    msg.push('Lower gears (bigger ratios) multiply torque more but turn the wheels slower. This is the trade-off every gearbox makes.');
    tip.replaceChildren(h('div', { class: 'label' }, 'What this shows'), h('ul', null, msg.map(function (m) { return h('li', null, m); })));
    var maxGear = box.ratios.length;
    if (gear >= maxGear) ctl.gear.set(String(maxGear));
  }
  function gearOptions() { var n = GEARS[ctl.box.get()].ratios.length, o = []; for (var i = 1; i <= n; i++) o.push([String(i), 'Gear ' + i]); return o; }
  ctl.box = select('Gearbox', Object.keys(GEARS).map(function (k) { return [k, GEARS[k].name]; }), 'five', function () {
    var sel = ctl.gear.el.querySelector('select'), n = GEARS[ctl.box.get()].ratios.length;
    sel.replaceChildren.apply(sel, gearOptions().map(function (o) { return h('option', { value: o[0] }, o[1]); }));
    sel.value = String(Math.min(parseInt(ctl.gear.get(), 10) || 1, n)); update();
  });
  ctl.gear = select('Gear', gearOptions(), '3', update);
  ctl.fd = select('Final drive ratio', [['3.2', '3.2 : 1 (long)'], ['3.9', '3.9 : 1'], ['4.4', '4.4 : 1 (short)']], '3.9', update);
  ctl.tyre = select('Tyre rolling circumference', [['1.85', '1.85 m (small wheel)'], ['1.95', '1.95 m'], ['2.10', '2.10 m (large wheel)']], '1.95', update);
  ctl.rpm = slider('Engine speed', 800, 6500, 100, 3000, 'rpm', update, 0);
  ctl.mass = slider('Vehicle mass', 900, 2400, 50, 1400, 'kg', update, 0);
  update();
  return h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' }, holder, tip, out.el),
    h('div', { class: 'sim-side' }, h('h3', null, 'Controls'), ctl.box.el, ctl.gear.el, ctl.rpm.el, ctl.fd.el, ctl.tyre.el, ctl.mass.el,
      h('div', { class: 'sim-try' }, h('h3', null, 'Try this'), h('ol', null,
        h('li', null, 'Hold 3,000 rpm and step through the gears. What happens to speed and to the force at the road?'),
        h('li', null, 'Change to a shorter final drive. What happens to the top speed of each gear?'),
        h('li', null, 'Fit a bigger wheel and note that the speedometer would then read too low.'),
        h('li', null, 'Find the gear in which the car could climb a 20 percent hill.')))));
}

export default {
  id: 'gearbox', title: 'Gearbox and driveline', icon: 'learn',
  blurb: 'Choose a gear, final drive and tyre size. See road speed, torque at the wheels and climbing ability for every gear on one chart.',
  lesson: ['m16-l2', 'Gear ratios, speed and torque calculations'],
  build: build
};
