import { h } from '../dom.js';
import { slider, select, readout, paint, r, clamp } from './kit.js';

/*
 * Cooling system simulator. Heat from the engine warms the coolant, and the radiator, thermostat
 * and fan take it away. The numbers are simplified, for practice.
 */

var C_HEAT = 150;           // kJ per degree for engine plus coolant
var K0 = 0.54;              // kW per degree of radiator, fully open, good airflow
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
    if (f !== 'fan') { if (T > 100) fanOn = true; if (T < 94) fanOn = false; } else fanOn = false;
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
    return { qin: qin, qout: qout, open: open, air: air, boilPoint: boilPoint };
  }

  function draw(s) {
    var W = 560, Hh = 330;
    var g = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="Cooling system at ' + r(T, 0) + ' degrees"><title>Cooling system</title><desc>Engine, thermostat, radiator, fan and a temperature graph.</desc>';
    var hot = colour(T), cold = colour(Math.max(40, T - 25));
    // engine
    g += '<rect x="170" y="70" width="120" height="110" rx="8" class="metal"/><text x="230" y="130" class="tb" text-anchor="middle">Engine</text><text x="230" y="150" class="ts" text-anchor="middle">' + r(T, 0) + ' °C</text>';
    // top hose (engine to radiator, through thermostat)
    g += '<path d="M170 90H120" fill="none" stroke="' + hot + '" stroke-width="9"/>';
    g += '<path d="M120 90V60H70" fill="none" stroke="' + hot + '" stroke-width="9"/>';
    // radiator
    g += '<rect x="30" y="40" width="46" height="200" rx="4" class="box"/>';
    for (var i = 0; i < 9; i++) g += '<path d="M34 ' + (52 + i * 20) + 'H72" class="k2"/>';
    g += '<text x="53" y="262" class="tsm" text-anchor="middle">Radiator</text>';
    // bottom hose
    g += '<path d="M70 220H120V160H170" fill="none" stroke="' + cold + '" stroke-width="9"/>';
    // thermostat symbol on the top hose
    g += '<rect x="108" y="76" width="24" height="28" rx="3" class="box ' + (s.open > 0.5 ? 'tint-c' : 'tint-m') + '"/><text x="176" y="62" class="tsm">' + (s.open > 0.95 ? 'Thermostat open' : s.open > 0.05 ? 'Thermostat opening' : 'Thermostat closed') + '</text>';
    // bypass
    g += '<path d="M170 135H140V190H170" fill="none" stroke="' + hot + '" stroke-width="5" stroke-dasharray="4 4" opacity="' + (1 - s.open * 0.8).toFixed(2) + '"/>';
    // fan
    g += '<g transform="translate(53 140)"><circle r="14" class="box ' + (fanOn ? 'tint-c' : '') + '"/><path d="M0 0L9 -6M0 0L-9 -6M0 0L0 10" class="k"/></g>';
    g += '<text x="53" y="280" class="tsm" text-anchor="middle">' + (fanOn ? 'Fan on' : 'Fan off') + '</text>';
    // graph
    var gx = 320, gy = 40, gw = 220, gh = 190;
    g += '<rect x="' + gx + '" y="' + gy + '" width="' + gw + '" height="' + gh + '" rx="4" class="box"/>';
    [40, 70, 90, 110, 130].forEach(function (v) {
      var y = gy + gh - (v - 20) / 120 * gh;
      g += '<path d="M' + gx + ' ' + y.toFixed(1) + 'H' + (gx + gw) + '" class="' + (v === 90 ? 'wire-sig' : 'zero') + '"/><text x="' + (gx + 4) + '" y="' + (y - 3).toFixed(1) + '" class="tsm">' + v + '</text>';
    });
    var d = '';
    hist.forEach(function (v, k) { d += (k ? 'L' : 'M') + (gx + gw * k / 160).toFixed(1) + ' ' + (gy + gh - clamp((v - 20) / 120, 0, 1) * gh).toFixed(1); });
    g += '<path d="' + d + '" fill="none" stroke="var(--magenta-ink)" stroke-width="2.4"/>';
    g += '<text x="' + (gx + gw / 2) + '" y="' + (gy + gh + 22) + '" class="tb" text-anchor="middle">Coolant temperature (last minutes)</text>';
    g += '</svg>';
    paint(holder, g);
    out.set([
      ['Coolant temperature', r(T, 0) + ' °C'],
      ['Heat from the engine', r(s.qin, 0) + ' kW'],
      ['Heat taken by the radiator', r(s.qout, 0) + ' kW'],
      ['Thermostat', s.open > 0.95 ? 'fully open' : s.open > 0.05 ? 'partly open' : 'closed'],
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
