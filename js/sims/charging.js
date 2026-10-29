import { h } from '../dom.js';
import { slider, select, readout, paint, r, clamp } from './kit.js';

/*
 * Starting and charging simulator. It models a battery with internal resistance, the starter
 * circuit and an alternator, so you can see why a car cranks slowly or the battery runs flat.
 */

var ALT = {
  good: { name: 'Alternator healthy', cap: 1, ripple: 0.05 },
  weak: { name: 'Alternator weak (worn brushes)', cap: 0.45, ripple: 0.08 },
  diode: { name: 'Alternator with a failed diode', cap: 0.65, ripple: 0.55 },
  dead: { name: 'Alternator failed (no output)', cap: 0, ripple: 0 },
  belt: { name: 'Slipping drive belt', cap: 0.5, ripple: 0.1 }
};

function simulate(s) {
  var soc = s.soc / 100, health = s.health / 100;
  var voc = 11.9 + 0.75 * soc;
  var rb = 0.012 / Math.max(0.2, health) * (1 + Math.max(0, 20 - s.temp) * 0.025) / (0.5 + 0.5 * soc);
  var rc = 0.004 + s.earth;
  var drag = 1 + Math.max(0, 20 - s.temp) * 0.02;
  var rs = 0.05 * drag;
  var ic = voc / (rb + rc + rs);
  var vbat = voc - ic * rb;
  var vst = voc - ic * (rb + rc);
  var speed = clamp((vst - 5.5) / (10 - 5.5), 0, 1.15) * 100 / (1 + (drag - 1) * 0.5);
  var starts = speed >= 70 && vbat >= 8.0;
  var alt = ALT[s.alt];
  var imax = 90 * Math.min(1, s.rpm / 2200) * alt.cap;
  var base = 25 + s.load;                        // engine systems plus chosen loads
  var surplus = imax - base;
  var charge = surplus > 0 ? Math.min(surplus, 30 * (1.1 - soc) / Math.max(0.2, 1)) : surplus;
  var vrun = surplus > 0 ? 14.2 - alt.ripple * 0.25 : voc + surplus * rb * 1;
  if (alt.cap === 0) vrun = voc - base * rb;
  var capAh = 60 * health;
  var hours = capAh * 0.5 * soc / Math.max(1, s.load);
  return { voc: voc, rb: rb, ic: ic, vbat: vbat, vst: vst, speed: speed, starts: starts, imax: imax, base: base, charge: charge, vrun: vrun, alt: alt, hours: hours };
}

export function build() {
  var holder = h('div', { class: 'sim-figure' });
  var out = readout();
  var msg = h('div', { class: 'sim-warns', role: 'status' });
  var ctl = {};
  function state() { return { soc: ctl.soc.get(), health: ctl.health.get(), temp: ctl.temp.get(), earth: ctl.earth.get(), alt: ctl.alt.get(), load: ctl.load.get(), rpm: ctl.rpm.get() }; }
  function bar(x, y, w, v, max, label, val, cls) {
    return '<text x="' + x + '" y="' + (y - 6) + '" class="tb">' + label + '</text><rect x="' + x + '" y="' + y + '" width="' + w + '" height="22" rx="3" class="box"/><rect x="' + x + '" y="' + y + '" width="' + (w * clamp(v / max, 0, 1)).toFixed(1) + '" height="22" rx="3" class="' + cls + '"/><text x="' + (x + w + 10) + '" y="' + (y + 17) + '" class="tb">' + val + '</text>';
  }
  function update() {
    var s = state(), o = simulate(s);
    /* The picture is redrawn on every change, so each animation takes a delay from the clock to keep its place. */
    var phase = function (period) { return '-' + ((performance.now() / 1000) % period).toFixed(3) + 's'; };
    var polar = function (cx, cy, rad, deg) { var a = deg * Math.PI / 180; return [cx + rad * Math.sin(a), cy - rad * Math.cos(a)]; };
    var dial = function (cx, cy, R, v, lo, hi, good0, good1, label, unit) {
      var d = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R + 5) + '" fill="url(#chMetal)" stroke="#59626b"/><circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#14181c"/>';
      var ang = function (x) { return -120 + 240 * clamp((x - lo) / (hi - lo), 0, 1); };
      var arcp = function (a0, a1, rr) { var p0 = polar(cx, cy, rr, a0), p1 = polar(cx, cy, rr, a1); return 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'A' + rr + ' ' + rr + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1); };
      d += '<path d="' + arcp(-120, 120, R - 7) + '" fill="none" stroke="#3b4148" stroke-width="4"/><path d="' + arcp(ang(good0), ang(good1), R - 7) + '" fill="none" stroke="#2fae5f" stroke-width="4"/>';
      for (var i = 0; i <= 8; i++) { var a = -120 + 30 * i, p0 = polar(cx, cy, R - 2, a), p1 = polar(cx, cy, R - (i % 2 ? 8 : 12), a); d += '<path d="M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'L' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + '" stroke="#e8edf1" stroke-width="1.2"/>'; }
      var np = polar(cx, cy, R - 9, ang(v));
      d += '<path d="M' + cx + ' ' + cy + 'L' + np[0].toFixed(1) + ' ' + np[1].toFixed(1) + '" stroke="#ff9a1f" stroke-width="2.6" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#303640" stroke="#8d96a0"/>';
      d += '<text x="' + cx + '" y="' + (cy + R * 0.62) + '" text-anchor="middle" style="fill:#e8edf1;stroke:none;font:700 11px sans-serif">' + r(v, unit === 'A' ? 0 : 1) + ' ' + unit + '</text>';
      d += '<text x="' + cx + '" y="' + (cy + R + 20) + '" class="tsm" text-anchor="middle" style="font-size:10px">' + label + '</text>';
      return d;
    };
    /* A belt that wraps two pulleys, drawn from the outside tangents. */
    var belt = function (c1, r1, c2, r2, cls) {
      var dx = c2[0] - c1[0], dy = c2[1] - c1[1], dist = Math.hypot(dx, dy), th = Math.atan2(dy, dx), ph = Math.acos((r1 - r2) / dist);
      var a1 = th + ph, a2 = th - ph, pt = function (c, rr, a) { return (c[0] + rr * Math.cos(a)).toFixed(1) + ' ' + (c[1] + rr * Math.sin(a)).toFixed(1); };
      return '<path d="M' + pt(c1, r1, a1) + 'L' + pt(c2, r2, a1) + 'A' + r2 + ' ' + r2 + ' 0 ' + (2 * ph > Math.PI ? 1 : 0) + ' 0 ' + pt(c2, r2, a2) + 'L' + pt(c1, r1, a2) + 'A' + r1 + ' ' + r1 + ' 0 ' + (2 * (Math.PI - ph) > Math.PI ? 1 : 0) + ' 0 ' + pt(c1, r1, a1) + 'Z" fill="none" stroke="' + cls + '" stroke-width="5" stroke-linejoin="round"/>';
    };
    var badEarth = s.earth > 0.015, noCharge = o.alt.cap === 0, lamp = o.charge < 0 || noCharge;
    var runDur = clamp(420 / s.rpm, 0.1, 0.7).toFixed(2);
    var crankDur = o.speed > 5 ? clamp(26 / o.speed, 0.15, 3).toFixed(2) : 0;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 560 436" role="img" aria-label="Starting and charging results"><title>Starting and charging</title><desc>A battery, a starter motor on the flywheel, an alternator on its belt and three dashboard dials.</desc>';
    svg += '<defs><linearGradient id="chMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6eaee"/><stop offset="1" stop-color="#8b949d"/></linearGradient>' +
      '<linearGradient id="chBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e757d"/><stop offset="1" stop-color="#363b41"/></linearGradient></defs>';

    // ---- engine block and flywheel with the starter pinion ----
    svg += '<rect x="214" y="58" width="120" height="104" rx="8" fill="url(#chBody)" stroke="#1d2024"/><text x="274" y="116" class="tb" text-anchor="middle" style="fill:#e6eaee;stroke:none">Engine</text>';
    svg += '<circle cx="14" cy="104" r="66" fill="#2b2f35" stroke="#7a828b" stroke-width="7" stroke-dasharray="3 3"/><circle cx="14" cy="104" r="52" fill="#3a4047" stroke="#1d2024"/>';
    svg += '<text x="10" y="168" class="tsm" text-anchor="middle" style="font-size:10px">Flywheel</text>';
    // ---- starter motor ----
    svg += '<rect x="100" y="84" width="112" height="40" rx="10" fill="url(#chBody)" stroke="#1d2024"/><rect x="132" y="62" width="62" height="24" rx="6" fill="url(#chMetal)" stroke="#59626b"/>';
    svg += '<circle cx="146" cy="60" r="4" fill="#d93a2b"/><circle cx="180" cy="60" r="4" fill="#d93a2b"/>';
    svg += '<g transform="translate(78 104)"><g ' + (crankDur ? 'class="fan-spin" style="animation-duration:' + crankDur + 's;animation-delay:' + phase(+crankDur) + '"' : '') + '><circle r="13" fill="#9aa2aa" stroke="#3b4148" stroke-width="5" stroke-dasharray="3 3"/><circle r="9" fill="#c8cdd2" stroke="#59626b"/><circle r="2.5" fill="#33383e"/></g></g>';
    svg += '<text x="128" y="78" class="tsm" text-anchor="end">Starter</text>';

    // ---- battery ----
    svg += '<rect x="24" y="208" width="176" height="86" rx="7" fill="#262a2f" stroke="#101214"/><rect x="24" y="208" width="176" height="20" rx="7" fill="#3a4047"/>';
    for (var c = 0; c < 6; c++) svg += '<circle cx="' + (44 + c * 28) + '" cy="218" r="6" fill="#1b1e22" stroke="#6b737c"/>';
    svg += '<rect x="38" y="238" width="148" height="40" rx="4" fill="#e9eef0"/><text x="112" y="256" text-anchor="middle" style="fill:#14181c;stroke:none;font:800 15px sans-serif">12 V</text><text x="112" y="271" text-anchor="middle" style="fill:#14181c;stroke:none;font:600 11px sans-serif">' + r(o.voc, 2) + ' V open circuit</text>';
    svg += '<rect x="42" y="196" width="26" height="14" rx="3" fill="#d93a2b" stroke="#6b1a12"/><text x="55" y="192" text-anchor="middle" class="tsm">+</text>';
    svg += '<rect x="154" y="196" width="26" height="14" rx="3" fill="#2a2f35" stroke="#101214"/><text x="167" y="192" text-anchor="middle" class="tsm">−</text>';
    if (badEarth) svg += '<g opacity="0.9"><ellipse cx="160" cy="194" rx="9" ry="5" fill="#d9e8e0"/><ellipse cx="174" cy="196" rx="8" ry="6" fill="#7fb8a0"/></g>';
    svg += '<text x="112" y="312" class="tb" text-anchor="middle">Battery ' + r(s.soc, 0) + '% charged</text>';

    // ---- cables: thick red feed, black earth strap that turns brown and thin when its resistance is high ----
    svg += '<path d="M55 196V172H150V124" fill="none" stroke="#101214" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M55 196V172H150V124" fill="none" stroke="#d93a2b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>';
    svg += '<path d="M167 196V182H232V162" fill="none" stroke="#101214" stroke-width="' + (badEarth ? 7 : 10) + '" stroke-linecap="round" stroke-linejoin="round"/><path d="M167 196V182H232V162" fill="none" stroke="' + (badEarth ? '#a8742f' : '#3a4047') + '" stroke-width="' + (badEarth ? 3 : 6) + '" stroke-linecap="round" stroke-linejoin="round"' + (badEarth ? ' stroke-dasharray="7 3"' : '') + '/>';
    svg += '<circle cx="232" cy="162" r="6" fill="#c8cdd2" stroke="#59626b"/>';
    svg += '<text x="238" y="186" class="tsm" style="font-size:10px">Earth ' + r(s.earth, 3) + ' Ω</text>';

    // ---- belt drive and alternator ----
    var alt = [430, 98], crank = [370, 250];
    svg += belt(alt, 20, crank, 30, o.alt.cap < 0.55 && s.alt === 'belt' ? '#b0711f' : '#15171a');
    svg += '<circle cx="' + alt[0] + '" cy="' + alt[1] + '" r="48" fill="url(#chMetal)" stroke="#59626b" stroke-width="2"/>';
    for (var v = 0; v < 12; v++) svg += '<rect x="-2.5" y="-44" width="5" height="14" rx="2" fill="#2a2f35" transform="translate(' + alt[0] + ' ' + alt[1] + ') rotate(' + (v * 30) + ')"/>';
    svg += '<g transform="translate(' + alt[0] + ' ' + alt[1] + ')"><g class="fan-spin" style="animation-duration:' + runDur + 's;animation-delay:' + phase(+runDur) + '"><circle r="20" fill="#2f353b" stroke="#12151a" stroke-width="2"/><circle r="14" fill="none" stroke="#6b737c" stroke-width="2" stroke-dasharray="4 4"/><circle r="6" fill="#aab2ba"/></g></g>';
    svg += '<circle cx="' + crank[0] + '" cy="' + crank[1] + '" r="30" fill="#1d2024" stroke="#59626b" stroke-width="2"/><g transform="translate(' + crank[0] + ' ' + crank[1] + ')"><g class="fan-spin" style="animation-duration:' + runDur + 's;animation-delay:' + phase(+runDur) + '"><circle r="22" fill="none" stroke="#59626b" stroke-width="2" stroke-dasharray="6 4"/><circle r="8" fill="#8d96a0"/></g></g>';
    svg += '<text x="' + alt[0] + '" y="34" class="tsm" text-anchor="middle">Alternator ' + r(o.imax, 0) + ' A at ' + s.rpm + ' rpm</text>';
    svg += '<text x="' + crank[0] + '" y="' + (crank[1] + 50) + '" class="tsm" text-anchor="middle">Crank pulley' + (s.alt === 'belt' ? ' (belt slipping)' : '') + '</text>';
    // charge warning lamp
    svg += '<g transform="translate(486 192)"><rect width="52" height="30" rx="5" fill="' + (lamp ? '#d93a2b' : '#2a2f35') + '" stroke="#12151a"/><rect x="12" y="9" width="28" height="14" rx="2" fill="none" stroke="' + (lamp ? '#fff' : '#6c747d') + '" stroke-width="1.8"/><path d="M18 9V6M34 9V6M17 16H23M20 13V19M30 16H36" stroke="' + (lamp ? '#fff' : '#6c747d') + '" stroke-width="1.6"/></g>';

    // ---- dashboard dials ----
    svg += dial(96, 374, 36, o.vbat, 0, 15, 9.6, 12.5, 'Cranking voltage', 'V');
    svg += dial(220, 374, 36, o.vrun, 0, 16, 13.5, 14.6, 'Running voltage', 'V');
    svg += dial(344, 374, 36, o.charge, -40, 40, 0, 40, 'Charge current', 'A');
    svg += '<text x="440" y="368" class="tb" style="font-size:13px">' + (o.starts ? 'Engine starts' : 'Will not start') + '</text><text x="440" y="386" class="tsm" style="font-size:11px">Cranking ' + r(o.speed, 0) + '%</text>';
    svg += '</svg>';
    paint(holder, svg);
    out.set([
      ['Open-circuit battery voltage', r(o.voc, 2) + ' V'],
      ['Battery internal resistance', r(o.rb * 1000, 0) + ' milliohm'],
      ['Starter current', r(o.ic, 0) + ' A'],
      ['Voltage at the starter', r(o.vst, 1) + ' V'],
      ['Alternator capacity at this speed', r(o.imax, 0) + ' A against a demand of ' + r(o.base, 0) + ' A'],
      ['Time to flatten the battery if parked with the loads on', r(o.hours, 1) + ' hours']
    ]);
    var m = [];
    if (!o.starts) m.push(['The engine will not start properly. ' + (s.earth > 0.015 ? 'High resistance in the cables or earth steals voltage from the starter.' : o.vbat < 9.6 ? 'The battery cannot hold its voltage under the starter load: it is flat, old or cold.' : 'Cranking is slow because the battery is weak or the oil is cold.'), 'note safety']);
    else m.push(['The engine starts. Battery voltage stays above 9.6 V while cranking.', 'note key']);
    if (o.charge < 0) m.push(['The alternator cannot meet the demand, so the battery is being used up. Switch off loads or fix the charging system.', 'note safety']);
    if (s.alt === 'diode') m.push(['A failed diode leaves ripple on the supply. Check with a scope: a ripple of more than 0.5 V peak to peak is a fault.', 'note tip']);
    if (s.temp < 0) m.push(['A cold battery has higher internal resistance and the engine oil is thicker, so cranking is much harder.', 'note tip']);
    msg.replaceChildren.apply(msg, m.map(function (x) { return h('div', { class: x[1] }, h('p', null, x[0])); }));
  }
  ctl.soc = slider('Battery state of charge', 20, 100, 1, 90, '%', update, 0);
  ctl.health = slider('Battery condition (capacity left)', 30, 100, 1, 90, '%', update, 0);
  ctl.temp = slider('Temperature', -15, 40, 1, 20, '°C', update, 0);
  ctl.earth = slider('Extra resistance in cables or earth', 0, 0.05, 0.001, 0, 'Ω', update, 3);
  ctl.alt = select('Charging system', Object.keys(ALT).map(function (k) { return [k, ALT[k].name]; }), 'good', update);
  ctl.rpm = slider('Engine speed (running)', 800, 3000, 100, 1500, 'rpm', update, 0);
  ctl.load = slider('Electrical loads switched on', 0, 60, 1, 15, 'A', update, 0);
  update();
  return h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' }, holder, msg, out.el),
    h('div', { class: 'sim-side' }, h('h3', null, 'Controls'), ctl.soc.el, ctl.health.el, ctl.temp.el, ctl.earth.el, ctl.alt.el, ctl.rpm.el, ctl.load.el,
      h('div', { class: 'sim-try' }, h('h3', null, 'Try this'), h('ol', null,
        h('li', null, 'Set the temperature to minus 10 and the battery to 60 percent. Does it still start?'),
        h('li', null, 'Add 0.03 ohm of extra resistance with a good battery. What happens to the starter voltage?'),
        h('li', null, 'Choose the weak alternator at idle with the heater, lights and rear screen on (40 A).'),
        h('li', null, 'Why is a battery that passes a voltage check sometimes still unable to crank the engine?')))));
}

export default {
  id: 'charging', title: 'Starting and charging', icon: 'flame',
  blurb: 'Crank an engine on a battery you can weaken, chill or give a bad earth. Then run it and see whether the alternator can keep up.',
  lesson: ['m10-l8', 'The starting system'],
  build: build
};
