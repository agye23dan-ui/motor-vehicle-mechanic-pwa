import { h } from '../dom.js';
import { slider, select, toggle, r, clamp } from './kit.js';

/*
 * Scan-tool trainer. A running petrol engine reports live data. Add a fault, or let the
 * simulator pick a hidden one, read the data and codes, then name the fault.
 */

var FAULTS = {
  none: { name: 'No fault', fix: 'Nothing to repair. All values are in their normal range.' },
  vacuum: { name: 'Vacuum leak after the air flow sensor', fix: 'Find the leak with a smoke machine and replace the cracked hose or gasket. Clear adaptations and check the trims.', codes: ['P0171  System too lean, bank 1'], why: 'Unmetered air makes the mixture lean. The fuel trims climb at idle and fall as revs rise, and manifold pressure is higher than normal at idle.' },
  maf: { name: 'Dirty or failing air flow sensor', fix: 'Clean the sensor with the correct cleaner or replace it, then check the readings against the specification.', codes: ['P0101  Mass air flow range or performance'], why: 'The sensor reports less air than really enters, so the computer under-fuels at every speed. The trims are positive across the range and air flow is below the expected value for the engine speed.' },
  pump: { name: 'Weak fuel pump or blocked filter', fix: 'Check pressure and flow, replace the filter, then the pump if pressure is still low.', codes: ['P0171  System too lean, bank 1'], why: 'Fuel pressure is low, especially when the engine needs more fuel at higher speed and load. The trims are fine at idle but grow positive as the revs rise.' },
  ect: { name: 'Coolant temperature sensor reading too low', fix: 'Check the sensor and its wiring with a meter, then replace the sensor. Compare it with a thermometer.', codes: ['P0128  Coolant thermostat (below regulating temperature)'], why: 'The computer thinks the engine is cold, so it enriches the mixture and keeps the fans off. The coolant reading stays low while the real engine is hot.' },
  misfire: { name: 'Misfire on cylinder 3', fix: 'Swap the coil with another cylinder to see if the misfire follows. Check the plug, coil and injector.', codes: ['P0303  Cylinder 3 misfire detected'], why: 'The misfire counter for cylinder 3 rises and engine speed becomes uneven. Unburnt oxygen reaches the sensor, so the oxygen reading jumps lean and the trim is pushed positive.' },
  o2: { name: 'Slow oxygen sensor', fix: 'Test the sensor heater and signal on a scope, and replace the sensor if it is slow.', codes: ['P0133  O2 sensor circuit slow response'], why: 'The oxygen sensor reading barely switches and sits near the middle. The computer cannot control the mixture well, so the trims drift.' },
  thermo: { name: 'Thermostat stuck open', fix: 'Replace the thermostat and check that the engine reaches 85 to 95 degrees.', codes: ['P0128  Coolant thermostat (below regulating temperature)'], why: 'The coolant never reaches normal temperature. Fuel economy is poor and the heater is weak.' }
};

function model(f, rpm, load, t) {
  var p = {};
  var wob = Math.sin(t * 1.7) * 0.5 + Math.sin(t * 0.43) * 0.5;
  p.rpm = rpm + (f === 'misfire' ? 45 * Math.sin(t * 9) + 30 * wob : 8 * wob);
  p.load = clamp(load + 1.5 * wob, 0, 100);
  var mafNorm = 0.0025 * rpm * (0.35 + p.load / 100);          // grams per second, rough
  p.maf = mafNorm * (f === 'maf' ? 0.7 : f === 'vacuum' ? 0.97 : 1) + 0.05 * wob;
  p.map = 28 + p.load * 0.65 + (f === 'vacuum' && rpm < 1500 ? 14 : 0);
  p.ect = f === 'ect' ? 18 : f === 'thermo' ? 62 : 90 + 2 * Math.sin(t * 0.2);
  p.iat = 33 + 1.5 * wob;
  p.tps = clamp(p.load * 0.55 - 4, 0, 100);
  var trim = 0;
  if (f === 'vacuum') trim = rpm < 1500 ? 24 : 5;
  else if (f === 'maf') trim = 16;
  else if (f === 'pump') trim = rpm > 1800 ? 15 : 2;
  else if (f === 'ect') trim = -14;
  else if (f === 'misfire') trim = 9;
  else if (f === 'o2') trim = 7 * Math.sin(t * 0.15);
  p.ltft = trim * 0.75 + 0.8 * wob;
  p.stft = trim * 0.25 + 2.5 * Math.sin(t * 2.2);
  var sw = Math.sin(t * 2.4);
  p.o2 = f === 'o2' ? 0.45 + 0.04 * sw : f === 'misfire' ? 0.12 + 0.05 * Math.abs(sw) : 0.5 + 0.4 * Math.tanh(sw * 5);
  p.fp = f === 'pump' ? (rpm > 1800 ? 2.1 : 3.2) : 3.8 + 0.05 * wob;
  p.adv = 12 + rpm / 400 - p.load / 12;
  p.volt = 14.2 + 0.1 * wob;
  p.mis3 = f === 'misfire' ? Math.floor(t * 4.5) % 4000 : 0;
  return p;
}

export function build() {
  var screen = h('div', { class: 'scan-screen', role: 'status', 'aria-live': 'off' });
  var codes = h('div', { class: 'scan-codes' });
  var reveal = h('div', { class: 'case-result', role: 'status' });
  var ctl = {};
  var t0 = Date.now(), hidden = null, timer = null;
  var allKeys = Object.keys(FAULTS).filter(function (k) { return k !== 'none'; });

  function current() { return hidden !== null ? hidden : ctl.fault.get(); }

  function row(label, val, unit, flag) { return h('tr', flag ? { class: flag } : null, h('td', null, label), h('td', { class: 'v' }, val), h('td', { class: 'u' }, unit)); }

  function tick() {
    var f = current();
    var t = (Date.now() - t0) / 1000;
    var rpm = parseInt(ctl.rpm.get(), 10), load = parseFloat(ctl.load.get());
    var p = model(f, rpm, load, t);
    var tr = [
      row('Engine speed', r(p.rpm, 0), 'rpm'),
      row('Calculated load', r(p.load, 0), '%'),
      row('Mass air flow', r(p.maf, 1), 'g/s', (f === 'maf' || f === 'vacuum') && p.maf < 0.0025 * rpm * (0.35 + p.load / 100) * 0.98 ? 'odd' : ''),
      row('Manifold pressure', r(p.map, 0), 'kPa', f === 'vacuum' && rpm < 1500 ? 'odd' : ''),
      row('Coolant temperature', r(p.ect, 0), '°C', p.ect < 80 ? 'odd' : ''),
      row('Intake air temperature', r(p.iat, 0), '°C'),
      row('Throttle position', r(p.tps, 0), '%'),
      row('Short-term fuel trim', r(p.stft, 1), '%', Math.abs(p.stft) > 6 ? 'odd' : ''),
      row('Long-term fuel trim', r(p.ltft, 1), '%', Math.abs(p.ltft) > 10 ? 'odd' : ''),
      row('Oxygen sensor 1', r(p.o2, 2), 'V', f === 'o2' ? 'odd' : ''),
      row('Fuel pressure', r(p.fp, 1), 'bar', p.fp < 3 ? 'odd' : ''),
      row('Ignition advance', r(p.adv, 0), 'deg'),
      row('Battery voltage', r(p.volt, 1), 'V'),
      row('Cylinder 3 misfires', String(p.mis3), 'count', p.mis3 > 0 ? 'odd' : '')
    ];
    screen.replaceChildren(h('table', null, h('caption', null, 'Live data'), h('tbody', null, tr)));
    var fc = FAULTS[f].codes;
    codes.replaceChildren(h('div', { class: 'scan-dtc' }, h('strong', null, 'Stored trouble codes: '), fc && fc.length ? fc.join('; ') : 'none'));
  }

  function newMystery() {
    hidden = allKeys[Math.floor(Math.random() * allKeys.length)];
    reveal.replaceChildren();
    mystery.replaceChildren(
      h('p', null, 'A hidden fault has been added. Change engine speed and load, read the data and codes, then choose the fault.'),
      h('div', { class: 'sim-ctl' }, h('label', { for: 'myst-pick' }, 'What is the fault?'),
        (function () {
          var sel = h('select', { id: 'myst-pick' }, [h('option', { value: '' }, 'Choose…')].concat(allKeys.map(function (k) { return h('option', { value: k }, FAULTS[k].name); })));
          sel.addEventListener('change', function () { guess = sel.value; check.disabled = !guess; });
          return sel;
        })()),
      check);
    check.disabled = true; guess = '';
    tick();
  }
  var guess = '';
  var check = h('button', { type: 'button', class: 'btn primary', disabled: true, onclick: function () {
    var ok = guess === hidden, f = FAULTS[hidden];
    reveal.replaceChildren(h('div', null,
      h('div', { class: 'banner ' + (ok ? '' : 'warn') }, h('p', null, h('strong', null, ok ? 'Correct. ' : 'Not quite. '), 'The fault was: ' + f.name + '.')),
      h('h3', null, 'What the data showed'), h('p', null, f.why), h('h3', null, 'Repair'), h('p', null, f.fix)));
    hidden = null; ctl.fault.set('none'); tick();
  } }, 'Check my answer');
  var mystery = h('div', { class: 'scan-mystery' });

  ctl.fault = select('Add a fault', Object.keys(FAULTS).map(function (k) { return [k, FAULTS[k].name]; }), 'none', function () { hidden = null; reveal.replaceChildren(); tick(); });
  ctl.rpm = slider('Engine speed', 700, 4500, 100, 800, 'rpm', tick, 0);
  ctl.load = slider('Engine load', 10, 90, 1, 22, '%', tick, 0);
  timer = window.setInterval(tick, 500);
  tick();
  var root = h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' }, h('div', { class: 'scan-wrap' }, screen, codes),
      h('p', { class: 'small muted' }, 'Rows highlighted in amber are outside the normal range. A value that looks odd is a clue, not a verdict: use the pattern across several readings.'), reveal),
    h('div', { class: 'sim-side' }, h('h3', null, 'Controls'), ctl.rpm.el, ctl.load.el, ctl.fault.el,
      h('div', { class: 'sim-try' }, h('h3', null, 'Mystery mode'), mystery,
        h('button', { type: 'button', class: 'btn', onclick: newMystery }, 'Start a mystery fault')),
      h('div', { class: 'sim-try' }, h('h3', null, 'Try this'), h('ol', null,
        h('li', null, 'Add the vacuum leak. Compare the trims at idle and at 2,500 rpm.'),
        h('li', null, 'Add the weak fuel pump and do the opposite: raise the engine speed and watch the fuel pressure.'),
        h('li', null, 'Start a mystery and decide which two readings to check first.')))));
  root.destroy = function () { if (timer) window.clearInterval(timer); timer = null; };
  return root;
}

export default {
  id: 'scantool', title: 'Scan-tool trainer', icon: 'quiz',
  blurb: 'Read live data and trouble codes from a running engine. Add a fault or start a hidden mystery and work out what is wrong.',
  lesson: ['m08-l10', 'Diagnosing with live data'],
  build: build
};
