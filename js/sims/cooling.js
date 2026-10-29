import { h } from '../dom.js';
import { slider, select, readout, paint, r, clamp } from './kit.js';

/*
 * Cooling system simulator. Heat from the engine warms the coolant, and the radiator, thermostat
 * and fan take it away. The numbers are simplified, for practice.
 */

var C_HEAT = 150;           // kJ per degree for engine plus coolant
var K0 = 0.54;              // kW per degree of radiator, fully open, good airflow
var FAN_ON = 100, FAN_OFF = 94;     // the fan switch closes above 100 °C and opens again below 94 °C
var FAULTS = {
  none: 'Healthy system',
  stuckclosed: 'Thermostat stuck closed',
  stuckopen: 'Thermostat stuck open',
  fan: 'Radiator fan failed',
  blocked: 'Radiator partly blocked (60%)',
  low: 'Low coolant level',
  cap: 'Weak radiator cap',
  belt: 'Slipping water pump belt'
};

function colour(T) { var v = clamp((T - 40) / 90, 0, 1); return 'rgb(' + Math.round(60 + 190 * v) + ',' + Math.round(150 - 90 * v) + ',' + Math.round(220 - 190 * v) + ')'; }

export function build() {
  var holder = h('div', { class: 'sim-figure' });
  var out = readout();
  var msg = h('div', { class: 'sim-warns', role: 'status' });
  var ctl = {};
  var T = 25, hist = [], time = 0, fanOn = false, timer = null, boiled = false;

  function step(dt) {
    var f = ctl.fault.get(), amb = ctl.amb.get(), load = ctl.load.get() / 100, speed = ctl.speed.get();
    var qin = 12 + 55 * load;
    var open = f === 'stuckclosed' ? 0 : f === 'stuckopen' ? 1 : clamp((T - 86) / 12, 0, 1);
    if (f !== 'fan') { if (T > FAN_ON) fanOn = true; if (T < FAN_OFF) fanOn = false; } else fanOn = false;
    var air = 0.3 + speed / 100 * 0.8 + (fanOn ? 0.9 : 0);
    var rad = f === 'blocked' ? 0.4 : 1;
    var flow = f === 'belt' ? 0.55 : 1;
    var level = f === 'low' ? 0.5 : 1;
    var k = K0 * rad * (0.1 + 0.9 * open) * air * flow * level;
    var qout = k * (T - amb);
    var boilPoint = f === 'cap' ? 102 : f === 'low' ? 108 : 124;     // pressurised system boils higher
    T += (qin - qout) / C_HEAT * dt;
    if (T > boilPoint) { boiled = true; T = boilPoint + (T - boilPoint) * 0.2; }
    time += dt;
    hist.push(T); if (hist.length > 160) hist.shift();
    return { qin: qin, qout: qout, open: open, air: air, boilPoint: boilPoint, fanFailed: f === 'fan' && T > FAN_ON };
  }

  /* The picture is redrawn every half second, so each animation takes a delay from the clock to keep its place. */
  function phase(period) { return '-' + ((performance.now() / 1000) % period).toFixed(3) + 's'; }

  /* A rubber hose with coolant inside it. Coolant dashes move along the path at a speed that follows the flow. */
  function hose(d, colour, width, flowRate) {
    var s = '<path d="' + d + '" fill="none" stroke="#1d2024" stroke-width="' + (width + 5) + '" stroke-linecap="round"/>' +
      '<path d="' + d + '" fill="none" stroke="' + colour + '" stroke-width="' + width + '" stroke-linecap="round"/>';
    if (flowRate > 0.04) {
      var dur = (1.5 / (0.2 + flowRate * 1.6)).toFixed(2);
      s += '<path d="' + d + '" fill="none" stroke="#fff" stroke-opacity="0.65" stroke-width="' + Math.max(2, width * 0.28) + '" class="cflow" style="animation-duration:' + dur + 's;animation-delay:' + phase(+dur) + '"/>';
    }
    return s;
  }

  function polar(cx, cy, rad, deg) { var a = deg * Math.PI / 180; return [cx + rad * Math.sin(a), cy - rad * Math.cos(a)]; }
  function arc(cx, cy, rad, d0, d1) {
    var p0 = polar(cx, cy, rad, d0), p1 = polar(cx, cy, rad, d1);
    return 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'A' + rad + ' ' + rad + ' 0 ' + (d1 - d0 > 180 ? 1 : 0) + ' 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1);
  }

  function draw(s) {
    var W = 560, Hh = 360, f = ctl.fault.get();
    var hotC = colour(Math.max(T, 70)), coldC = colour(Math.max(40, T - 28)), midC = colour(Math.max(40, T - 10));
    var radFlow = s.open * (f === 'belt' ? 0.55 : 1), byFlow = (1 - s.open * 0.8) * (f === 'belt' ? 0.55 : 1);
    var heat = clamp((T - 60) / 70, 0, 1);
    var g = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="Cooling system at ' + r(T, 0) + ' degrees"><title>Cooling system</title><desc>Engine, thermostat, radiator, fan, water pump and a temperature gauge.</desc>';
    g += '<defs>' +
      '<linearGradient id="cgMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6eaee"/><stop offset="0.5" stop-color="#aab2ba"/><stop offset="1" stop-color="#7d868f"/></linearGradient>' +
      '<linearGradient id="cgBlock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (heat > 0.6 ? '#7d5648' : '#5b6168') + '"/><stop offset="1" stop-color="#32363b"/></linearGradient>' +
      '<linearGradient id="cgHead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3c9cf"/><stop offset="1" stop-color="' + (heat > 0.6 ? '#b08a7c' : '#8e969e') + '"/></linearGradient>' +
      '<linearGradient id="cgCore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + hotC + '" stop-opacity="0.55"/><stop offset="1" stop-color="' + coldC + '" stop-opacity="0.55"/></linearGradient>' +
      '<pattern id="cgFins" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#59626b"/><path d="M0 0V4" stroke="#a5aeb7" stroke-width="1.4"/></pattern>' +
      '<radialGradient id="cgFace" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#2a2f35"/><stop offset="1" stop-color="#0d0f12"/></radialGradient>' +
      '</defs>';

    // ---- hoses (drawn first so the parts sit over their ends) ----
    g += hose('M198 100C150 100 128 60 88 60', hotC, 10, radFlow);                 // engine to radiator, through the thermostat
    g += hose('M88 250C120 272 168 270 198 242', coldC, 10, radFlow);               // radiator to the water pump
    g += hose('M126 28C126 40 84 40 70 44', '#9fc6dd', 5, 0.15);                    // expansion tank to the radiator cap

    // ---- radiator ----
    g += '<rect x="26" y="48" width="64" height="26" rx="5" fill="url(#cgMetal)" stroke="#59626b"/>';      // top tank
    g += '<rect x="26" y="238" width="64" height="26" rx="5" fill="url(#cgMetal)" stroke="#59626b"/>';     // bottom tank
    g += '<rect x="30" y="72" width="56" height="168" fill="url(#cgFins)" stroke="#59626b"/><rect x="30" y="72" width="56" height="168" fill="url(#cgCore)"/>';
    for (var i = 0; i < 10; i++) g += '<path d="M30 ' + (84 + i * 16) + 'H86" stroke="#2b3036" stroke-opacity="0.35" stroke-width="1"/>';
    if (f === 'blocked') {
      [[38, 100, 22, 30], [58, 150, 24, 36], [40, 196, 26, 28], [66, 112, 14, 22]].forEach(function (b) { g += '<ellipse cx="' + b[0] + '" cy="' + b[1] + '" rx="' + b[2] + '" ry="' + b[3] + '" fill="#6b4b2c" opacity="0.7"/>'; });
    }
    g += '<rect x="54" y="38" width="22" height="12" rx="3" fill="#c8cdd2" stroke="#59626b"/><rect x="58" y="34" width="14" height="6" rx="2" fill="#9aa2aa" stroke="#59626b"/>';   // pressure cap
    g += '<text x="58" y="286" class="tsm" text-anchor="middle">Radiator</text>';
    if (f === 'cap' && T > 100) g += '<g opacity="0.55"><circle cx="64" cy="26" r="7" fill="#fff"/><circle cx="74" cy="16" r="9" fill="#fff"/><circle cx="62" cy="8" r="6" fill="#fff"/></g>';

    // ---- expansion tank with its level ----
    var lvl = f === 'low' ? 0.28 : boiled ? 0.5 : 0.86;
    g += '<rect x="112" y="6" width="34" height="38" rx="5" fill="#dfe6ea" fill-opacity="0.8" stroke="#59626b"/>' +
      '<rect x="114" y="' + (42 - 34 * lvl).toFixed(1) + '" width="30" height="' + (34 * lvl).toFixed(1) + '" rx="3" fill="#7fd0c8" opacity="0.8"/>' +
      '<path d="M112 36H146M112 18H146" stroke="#59626b" stroke-width="1" stroke-dasharray="3 3"/>';
    g += '<text x="129" y="58" class="tsm" text-anchor="middle" style="font-size:10px">Coolant</text>';

    // ---- fan inside its shroud, between the radiator and the engine ----
    var fcx = 124, fcy = 162, blades = '';
    for (var b = 0; b < 7; b++) blades += '<path d="M0 -7C9 -13 20 -30 11 -43C5 -33 -3 -21 -6 -8Z" transform="rotate(' + (b * 360 / 7).toFixed(1) + ')" fill="' + (s.fanFailed ? '#7a2b25' : '#2a2f35') + '" stroke="#12151a" stroke-width="0.8"/>';
    g += '<rect x="90" y="108" width="68" height="108" rx="10" fill="#202429" stroke="#0e1114"/>';
    g += '<circle cx="' + fcx + '" cy="' + fcy + '" r="44" fill="#14171b" stroke="#3a4048" stroke-width="2"/>';
    g += '<g transform="translate(' + fcx + ' ' + fcy + ')"><g class="' + (fanOn ? 'fan-spin' : '') + '"' + (fanOn ? ' style="animation-delay:' + phase(0.3) + '"' : '') + '><circle r="44" fill="none"/>' + blades + '</g><circle r="9" fill="#555d66" stroke="#12151a"/><circle r="3" fill="#aab2ba"/></g>';
    g += '<text x="124" y="236" class="tsm" text-anchor="middle">' + (s.fanFailed ? 'Fan failed' : fanOn ? 'Fan running' : 'Fan off') + '</text>';

    // ---- engine ----
    g += '<rect x="188" y="136" width="176" height="108" rx="8" fill="url(#cgBlock)" stroke="#1d2024"/>';
    g += '<path d="M200 146H352M200 232H352" stroke="#000" stroke-opacity="0.25"/>';
    g += '<rect x="196" y="152" width="160" height="70" rx="4" fill="' + midC + '" opacity="0.28"/>';              // coolant jacket glow
    g += '<path d="M200 244H352L340 270H212Z" fill="#23272c" stroke="#101214"/>';                                   // oil pan
    g += '<rect x="192" y="102" width="168" height="36" rx="5" fill="url(#cgHead)" stroke="#59626b"/>';             // cylinder head
    g += '<rect x="198" y="84" width="156" height="20" rx="5" fill="#2a2e34" stroke="#101214"/>';                    // cover
    for (var c = 0; c < 4; c++) g += '<rect x="' + (222 + c * 38) + '" y="72" width="10" height="14" rx="2" fill="#15171a"/>';   // coil packs
    g += '<path d="M360 112H386V128H360" fill="none" stroke="#5b6168" stroke-width="9" stroke-linejoin="round"/>';   // intake runner
    g += '<text x="276" y="196" class="tb" text-anchor="middle" fill="#fff" style="fill:#fff;stroke:none">Engine</text>';
    g += '<text x="276" y="214" class="ts" text-anchor="middle" style="fill:#e6eaee;stroke:none">' + r(T, 0) + ' °C</text>';
    // thermostat housing on the head, and the bypass inside the block
    g += hose('M198 108V232', hotC, 5, byFlow);
    g += '<rect x="184" y="92" width="26" height="22" rx="5" fill="url(#cgMetal)" stroke="#59626b"/>';
    // water pump with its impeller, driven by the engine
    g += '<circle cx="206" cy="236" r="19" fill="url(#cgMetal)" stroke="#59626b" stroke-width="1.5"/>';
    var pumpDur = (0.6 / (0.2 + (f === 'belt' ? 0.55 : 1))).toFixed(2);
    g += '<g transform="translate(206 236)"><g class="fan-spin" style="animation-duration:' + pumpDur + 's;animation-delay:' + phase(+pumpDur) + '">';
    for (var v = 0; v < 8; v++) g += '<path d="M0 0L12 -3L12 3Z" transform="rotate(' + (v * 45) + ')" fill="#4a525a"/>';
    g += '</g><circle r="3.5" fill="#222"/></g>';
    g += '<text x="176" y="284" class="tsm" text-anchor="middle" style="font-size:10px">Water pump</text>';

    // ---- thermostat inset: the wax valve opens as the coolant warms ----
    var ang = s.open * 55;
    g += '<g transform="translate(250 31) scale(0.85)"><circle r="26" fill="#10141a" stroke="#59626b" stroke-width="2"/>' +
      '<path d="M-26 0H-9M9 0H26" stroke="' + hotC + '" stroke-width="7"/>' +
      '<path d="M0 -17V17" stroke="#3a4048" stroke-width="2"/>' +
      '<g transform="rotate(' + (-ang).toFixed(1) + ' -9 0)"><rect x="-9" y="-2" width="20" height="4" rx="2" fill="#d7dce1" stroke="#59626b"/></g>' +
      '<circle cx="-9" cy="0" r="3" fill="#9a8a5a"/></g>';
    g += '<text x="250" y="65" class="tsm" text-anchor="middle" style="font-size:10px">' + (s.open > 0.95 ? 'Thermostat open' : s.open > 0.05 ? 'Thermostat opening' : 'Thermostat closed') + '</text>';

    // ---- steam when the coolant has boiled ----
    if (boiled) g += '<g opacity="0.5"><circle cx="262" cy="64" r="10" fill="#fff"/><circle cx="280" cy="50" r="14" fill="#fff"/><circle cx="258" cy="36" r="11" fill="#fff"/></g>';

    // ---- dashboard temperature gauge ----
    var cx = 452, cy = 92, R = 66, hotZone = T > 108;
    g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R + 7) + '" fill="url(#cgMetal)" stroke="#59626b"/><circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="url(#cgFace)"/>';
    g += '<path d="' + arc(cx, cy, R - 10, -120, 120) + '" fill="none" stroke="#3b4148" stroke-width="5"/>';
    g += '<path d="' + arc(cx, cy, R - 10, -120 + 240 * (110 - 40) / 90, 120) + '" fill="none" stroke="#d93a2b" stroke-width="5"/>';
    for (var t = 40; t <= 130; t += 10) {
      var a = -120 + 240 * (t - 40) / 90, p0 = polar(cx, cy, R - 4, a), p1 = polar(cx, cy, R - (t % 30 === 10 ? 17 : 13), a);
      g += '<path d="M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'L' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + '" stroke="#e8edf1" stroke-width="' + (t % 30 === 10 ? 2 : 1.2) + '"/>';
    }
    var pc = polar(cx, cy, R - 22, -120), ph = polar(cx, cy, R - 22, 120);
    g += '<text x="' + (pc[0] - 2).toFixed(1) + '" y="' + (pc[1] + 18).toFixed(1) + '" text-anchor="middle" style="fill:#7fb6ff;stroke:none;font:700 12px sans-serif">C</text>';
    g += '<text x="' + (ph[0] + 2).toFixed(1) + '" y="' + (ph[1] + 18).toFixed(1) + '" text-anchor="middle" style="fill:#ff6a5a;stroke:none;font:700 12px sans-serif">H</text>';
    var na = -120 + 240 * clamp((T - 40) / 90, 0, 1), np = polar(cx, cy, R - 12, na);
    g += '<path d="M' + cx + ' ' + cy + 'L' + np[0].toFixed(1) + ' ' + np[1].toFixed(1) + '" stroke="#ff9a1f" stroke-width="3" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + cy + '" r="6" fill="#303640" stroke="#8d96a0"/>';
    g += '<text x="' + cx + '" y="' + (cy + 34) + '" text-anchor="middle" style="fill:#e8edf1;stroke:none;font:700 16px sans-serif">' + r(T, 0) + ' °C</text>';
    // warning lamp
    g += '<g transform="translate(' + (cx - 78) + ' ' + (cy + 62) + ')"><rect width="26" height="22" rx="4" fill="' + (hotZone ? '#d93a2b' : '#2a2f35') + '" stroke="#12151a"/>' +
      '<path d="M8 4V13a5 5 0 1 0 6 0V4Z" fill="none" stroke="' + (hotZone ? '#fff' : '#6c747d') + '" stroke-width="1.6"/><path d="M14 8H18M14 11H18" stroke="' + (hotZone ? '#fff' : '#6c747d') + '" stroke-width="1.4"/></g>';
    g += '<text x="' + (cx - 46) + '" y="' + (cy + 78) + '" class="tsm" style="font-size:10px">' + (hotZone ? 'Overheat warning' : 'Temperature normal') + '</text>';

    // ---- history graph ----
    var gx = 372, gy = 190, gw = 170, gh = 120;
    g += '<rect x="' + gx + '" y="' + gy + '" width="' + gw + '" height="' + gh + '" rx="4" class="box"/>';
    [40, 70, 90, 110, 130].forEach(function (v) {
      var y = gy + gh - (v - 20) / 120 * gh;
      g += '<path d="M' + gx + ' ' + y.toFixed(1) + 'H' + (gx + gw) + '" class="' + (v === 90 ? 'wire-sig' : 'zero') + '"/><text x="' + (gx + 3) + '" y="' + (y - 2).toFixed(1) + '" class="tsm" style="font-size:9px">' + v + '</text>';
    });
    var d = '';
    hist.forEach(function (v, k) { d += (k ? 'L' : 'M') + (gx + gw * k / 160).toFixed(1) + ' ' + (gy + gh - clamp((v - 20) / 120, 0, 1) * gh).toFixed(1); });
    g += '<path d="' + d + '" fill="none" stroke="var(--magenta-ink)" stroke-width="2.2"/>';
    g += '<text x="' + (gx + gw / 2) + '" y="' + (gy + gh + 16) + '" class="tb" text-anchor="middle">Coolant temperature</text>';
    g += '</svg>';
    paint(holder, g);
    out.set([
      ['Coolant temperature', r(T, 0) + ' °C'],
      ['Heat from the engine', r(s.qin, 0) + ' kW'],
      ['Heat taken by the radiator', r(s.qout, 0) + ' kW'],
      ['Thermostat', s.open > 0.95 ? 'fully open' : s.open > 0.05 ? 'partly open' : 'closed'],
      ['Radiator fan', s.fanFailed ? 'not running, although the coolant is above ' + FAN_ON + ' °C' : fanOn ? 'running (switched on above ' + FAN_ON + ' °C, off below ' + FAN_OFF + ' °C)' : ctl.fault.get() === 'fan' ? 'not running (failed), not needed yet' : 'off: the coolant is below ' + FAN_ON + ' °C, so it is not needed', s.fanFailed ? 'odd' : ''],
      ['Airflow through the radiator', r(s.air * 100, 0) + '% of normal'],
      ['Boiling point of the coolant here', r(s.boilPoint, 0) + ' °C']
    ]);
    var m = [];
    if (boiled) m.push(['The coolant has boiled. Steam and a loss of coolant would follow, and the engine could be damaged. In real life, stop and let it cool before opening anything.', 'note safety']);
    else if (T > 108) m.push(['The engine is overheating.', 'note safety']);
    else if (T < 75 && time > 200) m.push(['The engine is not warming up. A thermostat stuck open gives this, with a weak heater and poor economy.', 'note tip']);
    else if (T >= 85 && T <= 100) m.push(['The temperature is in the normal range of 85 to 100 °C.', 'note key']);
    var f = ctl.fault.get();
    if (f === 'stuckclosed' && T > 100) m.push(['With the thermostat closed, coolant cannot reach the radiator, so only the small bypass loop is working.', 'note tip']);
    if (f === 'fan' && ctl.speed.get() < 20 && T > 100) m.push(['At low speed there is no airflow without the fan. The engine overheats in traffic but is fine on the open road.', 'note tip']);
    msg.replaceChildren.apply(msg, m.map(function (x) { return h('div', { class: x[1] }, h('p', null, x[0])); }));
  }

  function loop() { draw(step(ctl.warp.get() * 0.5)); }
  function reset() { T = 25; hist = []; time = 0; fanOn = false; boiled = false; loop(); }
  ctl.fault = select('System condition', Object.keys(FAULTS).map(function (k) { return [k, FAULTS[k]]; }), 'none', reset);
  ctl.amb = slider('Outside air temperature', 0, 45, 1, 25, '°C', function () {}, 0);
  ctl.load = slider('Engine load', 5, 100, 1, 30, '%', function () {}, 0);
  ctl.speed = slider('Road speed (airflow)', 0, 120, 5, 50, 'km/h', function () {}, 0);
  ctl.warp = slider('Simulation speed', 1, 20, 1, 8, 'x', function () {}, 0);
  timer = window.setInterval(loop, 500);
  loop();
  var root = h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' }, holder, msg, out.el),
    h('div', { class: 'sim-side' }, h('h3', null, 'Controls'), ctl.fault.el, ctl.amb.el, ctl.load.el, ctl.speed.el, ctl.warp.el,
      h('div', { class: 'btn-row' }, h('button', { type: 'button', class: 'btn small', onclick: reset }, 'Cold start again')),
      h('div', { class: 'sim-try' }, h('h3', null, 'Try this'), h('ol', null,
        h('li', null, 'Watch a cold start. When does the thermostat open and the temperature level off?'),
        h('li', null, 'Choose the failed fan and set road speed to 0 with a high load. Then raise the road speed. Why does moving help?'),
        h('li', null, 'Compare a thermostat stuck closed with one stuck open. Which warms up faster?'),
        h('li', null, 'Try a hot day with a blocked radiator and a heavy load.')))));
  root.destroy = function () { if (timer) window.clearInterval(timer); timer = null; };
  return root;
}

export default {
  id: 'cooling', title: 'Cooling system simulator', icon: 'flame',
  blurb: 'Warm up an engine and watch the thermostat, radiator and fan hold the temperature. Add faults and see which ones cause overheating.',
  lesson: ['m05-l6', 'Thermostat and temperature control'],
  build: build
};
