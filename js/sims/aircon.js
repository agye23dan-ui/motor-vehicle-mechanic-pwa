import { h } from '../dom.js';
import { slider, select, readout, paint, r, clamp } from './kit.js';

/*
 * A/C gauge simulator. The readings follow the usual patterns seen on a manifold gauge set for a
 * system using R134a. They are teaching patterns, not exact figures: always use the maker's chart.
 */

var FAULTS = {
  none: { name: 'Healthy system', low: 1, high: 1, vent: 0, advice: 'Both gauges are in the normal bands for this temperature and the vents are cold. A healthy system also cycles the compressor only occasionally.', check: 'Nothing to repair.' },
  lowcharge: { name: 'Low refrigerant (a leak)', low: 0.5, high: 0.75, vent: 8, advice: 'Both gauges read low and the vents are only cool. The compressor may cycle quickly because the low-side switch trips.', check: 'Find the leak with UV dye or an electronic detector. Repair it, replace the drier, evacuate, and recharge by weight.' },
  overcharge: { name: 'Overcharged', low: 1.25, high: 1.4, vent: 4, advice: 'Both gauges read high. There is too much refrigerant or oil, so the condenser cannot cool it. Cooling is poor.', check: 'Recover refrigerant and recharge by weight to the label value. Never charge by pressure alone.' },
  fan: { name: 'Condenser fan failed or condenser blocked', low: 1.2, high: 1.5, vent: 9, advice: 'The high side climbs very high, especially at idle, and cooling falls. Heat cannot leave the condenser.', check: 'Check the fan, its relay and fuse, and clean the condenser fins of dirt, leaves and insects.' },
  restrict: { name: 'Blocked expansion valve or orifice', low: 0.18, high: 0.85, vent: 10, advice: 'The low side drops to near zero or into a vacuum and the high side is a little low. Frost may form after the restriction.', check: 'Recover refrigerant, replace the valve or tube and the drier, flush if contaminated, then evacuate and recharge.' },
  compressor: { name: 'Weak compressor', low: 1.5, high: 0.7, vent: 11, advice: 'The low side reads high and the high side reads low, so the pressures try to equalise. The compressor cannot build pressure.', check: 'Check the clutch gap first. If the compressor is worn, replace it, flush the system, replace the drier and refill with the correct oil.' },
  air: { name: 'Air or moisture in the system', low: 1.1, high: 1.25, vent: 6, advice: 'Both gauges read a little high and the needles may flutter. Air does not condense, so cooling suffers.', check: 'Recover the refrigerant, replace the drier, pull a deep vacuum for 30 minutes or more, hold it to prove no leak, then recharge.' }
};

function normalLow(T, rpm) { return 28 + (T - 30) * 0.6 - (rpm > 1500 ? 4 : 0); }
function normalHigh(T) { return 135 + (T - 21) * 6.5; }

function gauge(cx, cy, val, max, label, bandLo, bandHi, unit) {
  var a0 = 150, a1 = 390;                       // sweep from lower left round the top to lower right
  function pt(v, rad) { var a = (a0 + (a1 - a0) * clamp(v / max, 0, 1)) * Math.PI / 180; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; }
  function arc(v0, v1, rad, cls) {
    var p0 = pt(v0, rad), p1 = pt(v1, rad), big = (v1 - v0) / max * (a1 - a0) > 180 ? 1 : 0;
    return '<path d="M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'A' + rad + ' ' + rad + ' 0 ' + big + ' 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + '" class="' + cls + '" style="stroke-width:10"/>';
  }
  var g = '<circle cx="' + cx + '" cy="' + cy + '" r="82" class="box"/>';
  g += arc(0, max, 66, 'k2');
  g += arc(bandLo, bandHi, 66, 'wire-sig');
  for (var i = 0; i <= 10; i++) {
    var v = max * i / 10, p = pt(v, 74), q = pt(v, 82);
    g += '<path d="M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + 'L' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + '" class="k2"/>';
    if (i % 2 === 0) { var tp = pt(v, 52); g += '<text x="' + tp[0].toFixed(1) + '" y="' + (tp[1] + 4).toFixed(1) + '" class="tsm" text-anchor="middle">' + Math.round(v) + '</text>'; }
  }
  var n = pt(val, 60);
  g += '<path d="M' + cx + ' ' + cy + 'L' + n[0].toFixed(1) + ' ' + n[1].toFixed(1) + '" class="k bold" style="stroke:var(--magenta-ink)"/><circle cx="' + cx + '" cy="' + cy + '" r="6" class="metal-dark"/>';
  g += '<text x="' + cx + '" y="' + (cy + 102) + '" class="tb" text-anchor="middle">' + label + '</text>';
  g += '<text x="' + cx + '" y="' + (cy + 122) + '" class="ts" text-anchor="middle">' + r(val, 0) + ' ' + unit + '</text>';
  return g;
}

export function build() {
  var holder = h('div', { class: 'sim-figure' });
  var out = readout();
  var advice = h('div', { class: 'note tip' });
  var ctl = {};
  function update() {
    var T = ctl.t.get(), rpm = parseInt(ctl.rpm.get(), 10), f = FAULTS[ctl.fault.get()];
    var nl = normalLow(T, rpm), nh = normalHigh(T);
    var low = nl * f.low, high = nh * f.high;
    if (ctl.fault.get() === 'fan' && rpm > 1500) high *= 0.88;
    if (ctl.fault.get() === 'restrict') low = Math.max(0, low - 4);
    var vent = 6 + (T - 30) * 0.2 + f.vent;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="10 20 380 230" role="img" aria-label="Manifold gauge set: low side ' + r(low, 0) + ' psi, high side ' + r(high, 0) + ' psi"><title>A/C manifold gauges</title><desc>Two gauges showing the low-side and high-side pressures.</desc>' +
      gauge(105, 110, low, 150, 'Low side', nl * 0.85, nl * 1.15, 'psi') + gauge(295, 110, high, 500, 'High side', nh * 0.9, nh * 1.1, 'psi') + '</svg>';
    paint(holder, svg);
    out.set([
      ['Fault', f.name],
      ['Low side', r(low, 0) + ' psi (' + r(low * 0.0689, 1) + ' bar), normal about ' + r(nl, 0)],
      ['High side', r(high, 0) + ' psi (' + r(high * 0.0689, 1) + ' bar), normal about ' + r(nh, 0)],
      ['Air at the vent', r(vent, 0) + ' °C'],
      ['Compressor clutch', ctl.fault.get() === 'lowcharge' ? 'engaged, but cutting in and out quickly (the low-side switch keeps tripping)' : ctl.fault.get() === 'none' ? 'engaged, cycling off now and then to hold the evaporator temperature' : 'engaged'],
      ['Condenser fan', ctl.fault.get() === 'fan' ? 'not turning, or the airflow is blocked' : 'running (it runs whenever the A/C is on)', ctl.fault.get() === 'fan' ? 'odd' : '']
    ]);
    advice.replaceChildren(h('div', { class: 'label' }, 'What this pattern shows'), h('p', null, f.advice), h('p', null, h('strong', null, 'Next step: '), f.check));
  }
  ctl.t = slider('Outside air temperature', 20, 45, 1, 32, '°C', update);
  ctl.rpm = select('Engine speed', [['800', 'Idle (800 rpm)'], ['2000', '2,000 rpm']], '800', update);
  ctl.fault = select('System condition', Object.keys(FAULTS).map(function (k) { return [k, FAULTS[k].name]; }), 'none', update);
  update();
  return h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' }, holder, out.el, advice,
      h('p', { class: 'small muted' }, 'These are typical patterns for an R134a system, rounded to teach the idea. Real figures vary with the vehicle, so always compare with the manufacturer’s pressure chart.')),
    h('div', { class: 'sim-side' }, h('h3', null, 'Controls'), ctl.t.el, ctl.rpm.el, ctl.fault.el,
      h('div', { class: 'note safety' }, h('div', { class: 'label' }, 'Safety'), h('p', null, 'Refrigerant must be recovered with certified equipment by a trained person. Never vent it. Wear eye protection and gloves: liquid refrigerant causes frostbite.')),
      h('div', { class: 'sim-try' }, h('h3', null, 'Try this'), h('ol', null,
        h('li', null, 'Raise the outside temperature and watch both normal bands rise.'),
        h('li', null, 'Switch between the faults. Which two give a high low-side reading? How do you tell them apart?'),
        h('li', null, 'Choose the blocked expansion valve and look at the low side. Why does it fall so far?')))));
}

export default {
  id: 'aircon', title: 'A/C gauge simulator', icon: 'settings',
  blurb: 'Read a manifold gauge set. Change the weather and engine speed, add a fault, and learn the pressure patterns.',
  lesson: ['m15-l7', 'Gauge diagnosis in depth'],
  build: build
};
