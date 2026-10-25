import { h } from '../dom.js';
import { crumb, pageHead, setTitle } from '../ui.js';

/* Workshop calculators. Each one works out its answer as you type, using the same formulas as the lessons. */

function num(v) { var n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; }
function r(n, d) { var f = Math.pow(10, d === undefined ? 1 : d); return String(Math.round(n * f) / f); }

var TOOLS = [
  {
    id: 'stopping', title: 'Stopping distance', lesson: ['m19-l2', 'Braking physics'],
    blurb: 'Thinking distance plus braking distance from speed and road grip.',
    fields: [
      { id: 'v', label: 'Speed', unit: 'km/h', value: 100 },
      { id: 't', label: 'Reaction time', unit: 's', value: 1 },
      { id: 'mu', label: 'Road surface', options: [['0.8', 'Dry asphalt (0.8)'], ['0.5', 'Wet asphalt (0.5)'], ['0.35', 'Wet, worn tyres (0.35)'], ['0.1', 'Ice (0.1)']], value: '0.8' }
    ],
    calc: function (x) {
      if (x.v === null || x.t === null || x.mu === null || x.mu <= 0) return null;
      var ms = x.v / 3.6, think = ms * x.t, brake = ms * ms / (2 * x.mu * 9.81);
      return [['Thinking distance', r(think) + ' m'], ['Braking distance', r(brake) + ' m'], ['Total stopping distance', r(think + brake) + ' m']];
    },
    note: 'Braking distance = v squared divided by (2 x grip x 9.81). Doubling the speed makes it four times as long.'
  },
  {
    id: 'ohm', title: 'Ohm’s law and power', lesson: ['m09-l1', 'Electricity in vehicles'],
    blurb: 'Enter any two values and leave the others empty.',
    fields: [
      { id: 'V', label: 'Voltage', unit: 'V', value: '' },
      { id: 'I', label: 'Current', unit: 'A', value: '' },
      { id: 'R', label: 'Resistance', unit: 'ohm', value: '' },
      { id: 'P', label: 'Power', unit: 'W', value: '' }
    ],
    calc: function (x) {
      var V = x.V, I = x.I, R = x.R, P = x.P;
      var given = [V, I, R, P].filter(function (v) { return v !== null; }).length;
      if (given < 2) return null;
      if (V !== null && I !== null) { R = V / I; P = V * I; }
      else if (V !== null && R !== null) { I = V / R; P = V * V / R; }
      else if (V !== null && P !== null) { I = P / V; R = V * V / P; }
      else if (I !== null && R !== null) { V = I * R; P = I * I * R; }
      else if (I !== null && P !== null) { V = P / I; R = P / (I * I); }
      else if (R !== null && P !== null) { V = Math.sqrt(P * R); I = Math.sqrt(P / R); }
      if (![V, I, R, P].every(isFinite)) return null;
      return [['Voltage', r(V, 2) + ' V'], ['Current', r(I, 2) + ' A'], ['Resistance', r(R, 2) + ' ohm'], ['Power', r(P, 1) + ' W']];
    },
    note: 'V = I x R and P = V x I. A 110 W pair of lamps on 12 V draws about 9.2 A, so use a 15 A fuse and 1.5 square mm wire.'
  },
  {
    id: 'vdrop', title: 'Voltage drop check', lesson: ['m09-l7', 'Voltage-drop testing'],
    blurb: 'Compare a measured voltage drop with the usual limit.',
    fields: [
      { id: 'c', label: 'Circuit part', options: [['pos', 'Positive cable, cranking (0.3 V)'], ['earth', 'Earth cable, cranking (0.2 V)'], ['circ', 'Whole power circuit (0.3 V)'], ['conn', 'Single connector or switch (0.1 V)'], ['sig', 'Sensor signal or reference (0.1 V)']], value: 'pos' },
      { id: 'm', label: 'Measured drop', unit: 'V', value: '' },
      { id: 'i', label: 'Current (optional)', unit: 'A', value: '' }
    ],
    calc: function (x) {
      if (x.m === null) return null;
      var lim = { pos: 0.3, earth: 0.2, circ: 0.3, conn: 0.1, sig: 0.1 }[x.c], out = [['Limit', r(lim, 1) + ' V'], ['Result', x.m <= lim ? 'Pass: within the limit' : 'Fail: too much loss']];
      if (x.i !== null && x.i > 0) out.push(['Resistance of this part', r(x.m / x.i, 3) + ' ohm']);
      return out;
    },
    note: 'Always compare with the figure in the workshop manual if it gives one. Measure with the circuit working.'
  },
  {
    id: 'gear', title: 'Gear ratio and road speed', lesson: ['m16-l2', 'Gear ratios, speed and torque'],
    blurb: 'Road speed from engine speed, gear ratios and tyre size.',
    fields: [
      { id: 'rpm', label: 'Engine speed', unit: 'rpm', value: 3000 },
      { id: 'g', label: 'Gearbox ratio', unit: ':1', value: 1 },
      { id: 'f', label: 'Final drive ratio', unit: ':1', value: 3.9 },
      { id: 'c', label: 'Tyre rolling circumference', unit: 'm', value: 1.95 }
    ],
    calc: function (x) {
      if ([x.rpm, x.g, x.f, x.c].some(function (v) { return v === null || v <= 0; })) return null;
      var wheel = x.rpm / (x.g * x.f), kmh = wheel * x.c * 60 / 1000;
      return [['Overall ratio', r(x.g * x.f, 2) + ' : 1'], ['Wheel speed', r(wheel, 0) + ' rpm'], ['Road speed', r(kmh, 1) + ' km/h']];
    },
    note: 'Overall ratio = gearbox ratio x final drive ratio. Torque at the wheels is engine torque times the overall ratio.'
  },
  {
    id: 'compression', title: 'Compression ratio', lesson: ['m04-l3', 'Torque, power, efficiency and compression ratio'],
    blurb: 'From the swept volume of one cylinder and the clearance volume.',
    fields: [
      { id: 'bore', label: 'Bore', unit: 'mm', value: 86 },
      { id: 'stroke', label: 'Stroke', unit: 'mm', value: 86 },
      { id: 'cc', label: 'Combustion chamber volume', unit: 'cm3', value: 45 }
    ],
    calc: function (x) {
      if ([x.bore, x.stroke, x.cc].some(function (v) { return v === null || v <= 0; })) return null;
      var swept = Math.PI / 4 * x.bore * x.bore * x.stroke / 1000;
      return [['Swept volume per cylinder', r(swept, 1) + ' cm3'], ['Compression ratio', r((swept + x.cc) / x.cc, 1) + ' : 1']];
    },
    note: 'Compression ratio = (swept volume + clearance volume) divided by clearance volume.'
  },
  {
    id: 'trim', title: 'Fuel trim reader', lesson: ['m08-l10', 'Diagnosing with live data'],
    blurb: 'Add the short-term and long-term fuel trims from the scan tool.',
    fields: [
      { id: 's', label: 'Short-term trim', unit: '%', value: 2 },
      { id: 'l', label: 'Long-term trim', unit: '%', value: 20 }
    ],
    calc: function (x) {
      if (x.s === null || x.l === null) return null;
      var t = x.s + x.l, msg;
      if (Math.abs(t) <= 10) msg = 'Normal: the mixture is being held close to correct.';
      else if (t > 10) msg = 'Lean: the computer is adding fuel. Look for air leaks, a weak fuel supply or a dirty air flow sensor.';
      else msg = 'Rich: the computer is removing fuel. Look for leaking injectors, high fuel pressure or a faulty sensor.';
      return [['Total trim', r(t, 1) + ' %'], ['Meaning', msg]];
    },
    note: 'A total beyond about plus or minus 10 percent needs investigating. Check at idle and at 2,500 rpm: a leak shows more at idle.'
  },
  {
    id: 'drain', title: 'Battery drain', lesson: ['m10-l11', 'Electrical loads and battery drain'],
    blurb: 'How long a battery lasts with a parasitic drain.',
    fields: [
      { id: 'ah', label: 'Battery capacity', unit: 'Ah', value: 60 },
      { id: 'ma', label: 'Drain', unit: 'mA', value: 150 },
      { id: 'u', label: 'Usable fraction', unit: '%', value: 50 }
    ],
    calc: function (x) {
      if ([x.ah, x.ma, x.u].some(function (v) { return v === null || v <= 0; })) return null;
      var hours = x.ah * 1000 * (x.u / 100) / x.ma;
      return [['Time to go flat enough to fail to start', r(hours / 24, 1) + ' days (' + r(hours, 0) + ' hours)'], ['Is the drain normal?', x.ma <= 50 ? 'Yes: under about 50 mA once asleep' : 'No: find the circuit that is not sleeping']];
    },
    note: 'Measure with an ammeter in series after the vehicle has gone to sleep, then pull fuses one at a time.'
  },
  {
    id: 'estimate', title: 'Job estimate', lesson: ['m21-l8', 'Costing and running the workshop'],
    blurb: 'Labour, parts and tax for a customer estimate.',
    fields: [
      { id: 'h', label: 'Book time', unit: 'hours', value: 1.5 },
      { id: 'rate', label: 'Hourly rate', unit: '', value: 100 },
      { id: 'parts', label: 'Parts', unit: '', value: 220 },
      { id: 'cons', label: 'Consumables', unit: '', value: 20 },
      { id: 'tax', label: 'Tax', unit: '%', value: 0 }
    ],
    calc: function (x) {
      if ([x.h, x.rate, x.parts, x.cons, x.tax].some(function (v) { return v === null || v < 0; })) return null;
      var labour = x.h * x.rate, sub = labour + x.parts + x.cons, tax = sub * x.tax / 100;
      return [['Labour', r(labour, 2)], ['Subtotal', r(sub, 2)], ['Tax', r(tax, 2)], ['Total to quote', r(sub + tax, 2)]];
    },
    note: 'Estimate = labour hours x hourly rate + parts + consumables + tax. Get approval before starting.'
  },
  {
    id: 'convert', title: 'Unit converter', lesson: ['m02-l9', 'Measuring and calculating'],
    blurb: 'Torque, pressure, temperature and length.',
    fields: [
      { id: 'kind', label: 'Convert', options: [['nm', 'Newton-metres to pound-feet'], ['lbft', 'Pound-feet to newton-metres'], ['bar', 'Bar to psi'], ['psi', 'psi to bar'], ['c', 'Celsius to Fahrenheit'], ['f', 'Fahrenheit to Celsius'], ['mm', 'Millimetres to inches'], ['in', 'Inches to millimetres']], value: 'nm' },
      { id: 'v', label: 'Value', unit: '', value: 100 }
    ],
    calc: function (x) {
      if (x.v === null) return null;
      var out = {
        nm: [x.v * 0.737562, 'lb ft'], lbft: [x.v / 0.737562, 'N m'], bar: [x.v * 14.5038, 'psi'], psi: [x.v / 14.5038, 'bar'],
        c: [x.v * 9 / 5 + 32, 'deg F'], f: [(x.v - 32) * 5 / 9, 'deg C'], mm: [x.v / 25.4, 'in'], 'in': [x.v * 25.4, 'mm']
      }[x.kind];
      return out ? [['Result', r(out[0], 2) + ' ' + out[1]]] : null;
    },
    note: 'Use the unit the manual gives. Torque wrenches may be marked in either unit.'
  }
];

function field(f, onInput) {
  var id = 'tool-' + Math.random().toString(36).slice(2, 8);
  var control;
  if (f.options) {
    control = h('select', { id: id }, f.options.map(function (o) { return h('option', { value: o[0], selected: o[0] === f.value ? true : null }, o[1]); }));
    control.addEventListener('change', onInput);
  } else {
    control = h('input', { id: id, type: 'text', inputmode: 'decimal', value: String(f.value), autocomplete: 'off' });
    control.addEventListener('input', onInput);
  }
  return { id: f.id, control: control, el: h('div', { class: 'field tool-field' }, h('label', { for: id }, f.label + (f.unit ? ' (' + f.unit + ')' : '')), control), options: !!f.options };
}

function card(t) {
  var results = h('dl', { class: 'tool-results', 'aria-live': 'polite' });
  var fields = [];
  function recalc() {
    var x = {};
    fields.forEach(function (f) { x[f.id] = f.options ? f.control.value : num(f.control.value); });
    t.fields.forEach(function (f) { if (f.options && /^[0-9.]+$/.test(x[f.id])) x[f.id] = parseFloat(x[f.id]); });
    var res = t.calc(x);
    results.replaceChildren();
    if (!res) { results.appendChild(h('p', { class: 'small muted' }, 'Enter the values to see the answer.')); return; }
    res.forEach(function (row) { results.appendChild(h('div', null, h('dt', null, row[0]), h('dd', null, row[1]))); });
  }
  fields = t.fields.map(function (f) { return field(f, recalc); });
  recalc();
  var m = /^(m\d+)-l(\d+)$/.exec(t.lesson[0]);
  return h('section', { class: 'hub-card tool-card', id: 'tool-' + t.id },
    h('h3', null, t.title), h('p', null, t.blurb),
    fields.map(function (f) { return f.el; }), results,
    h('p', { class: 'small muted' }, t.note),
    h('a', { class: 'small', href: '#/module/' + m[1] + '/lesson/' + m[2] }, 'Learn more: ' + t.lesson[1]));
}

export function render() {
  setTitle('Workshop tools');
  return h('div', { class: 'tools-page' }, crumb('#/studio', 'Studio'),
    pageHead('Workshop tools', 'Calculators that use the formulas from the lessons. They are for learning and quick checks. For real work, use the figures in the manufacturer’s workshop manual.'),
    h('div', { class: 'tool-grid' }, TOOLS.map(card)));
}
