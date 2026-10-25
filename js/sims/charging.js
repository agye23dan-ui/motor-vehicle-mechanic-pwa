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
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 560 300" role="img" aria-label="Starting and charging results"><title>Starting and charging</title><desc>Bars showing cranking voltage, cranking speed, charging voltage and charge current.</desc>';
    svg += bar(20, 30, 330, o.vbat, 13, 'Battery voltage while cranking (needs over 9.6 V)', r(o.vbat, 1) + ' V', o.vbat >= 9.6 ? 'tint-g' : 'tint-m');
    svg += '<path d="M' + (20 + 330 * 9.6 / 13) + ' 30V52" class="barrier"/>';
    svg += bar(20, 90, 330, o.speed, 120, 'Cranking speed (70% or more starts the engine)', r(o.speed, 0) + '%', o.speed >= 70 ? 'tint-g' : 'tint-m');
    svg += '<path d="M' + (20 + 330 * 70 / 120) + ' 90V112" class="barrier"/>';
    svg += bar(20, 150, 330, o.vrun, 15, 'Bus voltage with the engine running (13.8 to 14.5 V is healthy)', r(o.vrun, 1) + ' V', o.vrun >= 13.5 ? 'tint-g' : 'tint-m');
    svg += bar(20, 210, 330, Math.abs(o.charge), 40, 'Charge into the battery (negative means discharge)', r(o.charge, 0) + ' A', o.charge > 0 ? 'tint-c' : 'tint-m');
    svg += '<text x="20" y="276" class="tsm">' + (o.starts ? 'The engine would start.' : 'The engine would crank too slowly or not at all.') + '</text>';
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
