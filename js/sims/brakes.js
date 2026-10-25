import { h } from '../dom.js';
import { slider, select, toggle, readout, paint, r, clamp } from './kit.js';

/*
 * Brake simulator. It follows the calculations in the brakes lessons: pedal ratio, servo,
 * master cylinder pressure, caliper force, grip limit, stopping distance and disc heating.
 */

var PEDAL_RATIO = 4, SERVO_GAIN = 4, MC_AREA = 445;           // mm2
var FRONT_PISTON = 2290, REAR_PISTON = 1200;                  // mm2 per caliper
var MU_PAD = 0.4, R_RATIO_F = 0.12 / 0.316, R_RATIO_R = 0.11 / 0.316;
var REAR_VALVE = 0.7;                                         // share of pressure reaching the rear
var DISC_MASS = 8, C_STEEL = 460;

function simulate(s) {
  var force = s.pedal * PEDAL_RATIO * (s.servo ? SERVO_GAIN : 1);        // N on the master cylinder
  var p = force / MC_AREA;                                               // N/mm2
  if (s.fluid === 'air') p *= 0.7;
  var pbar = p * 10;
  var front = 2 * (p * FRONT_PISTON * 2 * MU_PAD * R_RATIO_F);
  var rear = 2 * (p * REAR_VALVE * REAR_PISTON * 2 * MU_PAD * R_RATIO_R);
  var ms = s.speed / 3.6;
  var energy = 0.5 * s.mass * ms * ms;
  var dT = energy * 0.7 / 2 / (DISC_MASS * C_STEEL);                     // one stop, front disc
  var discT = 30 + s.stops * dT * 0.85;                                  // a little cooling between stops
  var fade = discT > 450, boil = false;
  var boilPoint = s.fluid === 'wet' ? 155 : 230;
  var fluidT = 30 + (discT - 30) * 0.45;
  if (fluidT > boilPoint) boil = true;
  var demand = (front + rear) / s.mass / 9.81;                           // in g
  if (fade) demand *= 0.65;
  if (boil) demand *= 0.4;
  var grip = s.mu;
  var abs = demand > grip * 0.97;
  var g = Math.min(demand, grip * 0.97);
  var a = g * 9.81;
  var dist = a > 0.01 ? ms * ms / (2 * a) : Infinity;
  var think = ms * 1.0;
  return { pbar: pbar, front: front, rear: rear, demand: demand, g: g, abs: abs, dist: dist, think: think, energy: energy, dT: dT, discT: discT, fade: fade, boil: boil, fluidT: fluidT, boilPoint: boilPoint, force: force };
}

function drawing(o, s) {
  var heat = clamp((o.discT - 30) / 600, 0, 1);
  var bar = function (x, y, w, hh, v, cls) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="3" class="box"/><rect x="' + x + '" y="' + y + '" width="' + (w * clamp(v, 0, 1)).toFixed(1) + '" height="' + hh + '" rx="3" class="' + cls + '"/>'; };
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 560 250" role="img" aria-label="Brake simulator: ' + r(o.g, 2) + ' g deceleration, stopping distance ' + (isFinite(o.dist) ? r(o.dist + o.think, 0) : 'very long') + ' metres"><title>Brake simulator</title><desc>Bars show pedal force, line pressure, deceleration and front disc temperature.</desc>';
  var rows = [
    ['Pedal force', s.pedal / 500, 'tint-c', s.pedal + ' N'],
    ['Line pressure', o.pbar / 120, 'tint-y', r(o.pbar, 0) + ' bar'],
    ['Deceleration', o.g / 1, 'tint-g', r(o.g, 2) + ' g'],
    ['Front disc temperature', heat, heat > 0.65 ? 'tint-m' : 'tint-y', r(o.discT, 0) + ' °C']
  ];
  rows.forEach(function (rw, i) {
    var y = 24 + i * 52;
    svg += '<text x="20" y="' + y + '" class="tb">' + rw[0] + '</text>' + bar(20, y + 8, 380, 20, rw[1], rw[2]) + '<text x="412" y="' + (y + 24) + '" class="tb">' + rw[3] + '</text>';
  });
  svg += '<text x="20" y="238" class="tsm">Grip limit for this road: ' + r(s.mu, 2) + ' g. ABS holds the wheels just below it.</text>';
  svg += '</svg>';
  return svg;
}

export function build() {
  var holder = h('div', { class: 'sim-figure' });
  var out = readout();
  var warn = h('div', { class: 'sim-warns', role: 'status' });
  var ctl = {};
  function state() {
    return { speed: ctl.speed.get(), mass: ctl.mass.get(), mu: parseFloat(ctl.mu.get()), pedal: ctl.pedal.get(), servo: ctl.servo.get(), fluid: ctl.fluid.get(), stops: parseInt(ctl.stops.get(), 10) };
  }
  function update() {
    var s = state(), o = simulate(s);
    paint(holder, drawing(o, s));
    var total = o.dist + o.think;
    out.set([
      ['Force on the master cylinder', r(o.force, 0) + ' N'],
      ['Braking force at the road', r(o.front + o.rear, 0) + ' N (front ' + r(100 * o.front / (o.front + o.rear), 0) + '%)'],
      ['Thinking distance (1 s)', r(o.think, 1) + ' m'],
      ['Braking distance', isFinite(o.dist) ? r(o.dist, 1) + ' m' : 'The vehicle does not stop'],
      ['Total stopping distance', isFinite(total) ? r(total, 1) + ' m' : 'very long'],
      ['Energy turned into heat', r(o.energy / 1000, 0) + ' kJ per stop']
    ]);
    var msgs = [];
    if (o.abs) msgs.push(['ABS is active: you are asking for more than the tyres can give. The pedal will pulse and the car keeps steering.', 'note key']);
    else msgs.push(['The tyres are not at their limit. A harder push would shorten the stop.', 'note tip']);
    if (!s.servo) msgs.push(['The servo is off (engine stopped or a vacuum fault). The pedal is hard and the driver must push about four times harder for the same braking.', 'note safety']);
    if (s.fluid === 'air') msgs.push(['Air in the fluid: it compresses, so line pressure is lower and the pedal is spongy.', 'note safety']);
    if (o.fade) msgs.push(['Brake fade: the discs are above about 450 °C and the pads lose friction. Braking force falls.', 'note safety']);
    if (o.boil) msgs.push(['Fluid boil: the fluid near the caliper reaches about ' + r(o.fluidT, 0) + ' °C, above its boiling point of ' + o.boilPoint + ' °C. Vapour bubbles compress and the pedal sinks.', 'note safety']);
    warn.replaceChildren.apply(warn, msgs.map(function (m) { return h('div', { class: m[1] }, h('p', null, m[0])); }));
  }
  ctl.speed = slider('Speed', 30, 140, 5, 100, 'km/h', update);
  ctl.mass = slider('Vehicle mass', 900, 2400, 50, 1400, 'kg', update);
  ctl.mu = select('Road surface', [['0.8', 'Dry asphalt'], ['0.5', 'Wet asphalt'], ['0.35', 'Wet, worn tyres'], ['0.1', 'Ice']], '0.8', update);
  ctl.pedal = slider('Pedal force', 50, 500, 10, 200, 'N', update);
  ctl.stops = slider('Hard stops in a row (hill descent)', 1, 8, 1, 1, '', update);
  ctl.servo = toggle('Brake servo working', true, update);
  ctl.fluid = select('Brake fluid', [['good', 'Fresh fluid, no air'], ['wet', 'Old fluid with water'], ['air', 'Air in the system']], 'good', update);
  update();
  return h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' }, holder, out.el, warn),
    h('div', { class: 'sim-side' }, h('h3', null, 'Controls'), ctl.speed.el, ctl.mass.el, ctl.mu.el, ctl.pedal.el, ctl.stops.el, ctl.servo.el, ctl.fluid.el,
      h('div', { class: 'sim-try' }, h('h3', null, 'Try this'), h('ol', null,
        h('li', null, 'Double the speed and watch the braking distance. By how much does it grow?'),
        h('li', null, 'Switch to a wet road and then to ice. What happens to the stopping distance?'),
        h('li', null, 'Choose old fluid and set 6 hard stops in a row. Which fails first: the pads or the fluid?'),
        h('li', null, 'Turn off the servo and see how much harder you have to push.')))));
}

export default {
  id: 'brakes', title: 'Brake simulator', icon: 'flag',
  blurb: 'Press the pedal and follow the force through the servo, hydraulics and tyres. See stopping distance, ABS, fade and fluid boil.',
  lesson: ['m19-l4', 'Brake hydraulics and force calculations'],
  build: build
};
