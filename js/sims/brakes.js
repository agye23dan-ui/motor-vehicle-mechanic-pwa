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

/* The picture is redrawn on every change, so each animation takes a delay from the clock to keep its place. */
function phase(period) { return '-' + ((performance.now() / 1000) % period).toFixed(3) + 's'; }

/* Steel grey when cold, then dull red, orange and yellow-white as a disc gets very hot. */
function heatColour(t) {
  var stops = [[30, [154, 163, 171]], [250, [118, 122, 128]], [380, [190, 70, 40]], [500, [236, 100, 40]], [650, [255, 190, 90]]];
  if (t <= stops[0][0]) return 'rgb(154,163,171)';
  for (var i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      var a = stops[i - 1], b = stops[i], k = (t - a[0]) / (b[0] - a[0]);
      return 'rgb(' + [0, 1, 2].map(function (j) { return Math.round(a[1][j] + (b[1][j] - a[1][j]) * k); }).join(',') + ')';
    }
  }
  return 'rgb(255,190,90)';
}

function drawing(o, s) {
  var heat = heatColour(o.discT), press = clamp(o.pbar / 120, 0, 1);
  var line = 'rgb(' + Math.round(216 - 5 * press) + ',' + Math.round(162 - 110 * press) + ',' + Math.round(29 + 14 * press) + ')';
  var fluid = s.fluid === 'wet' ? '#8a5a2b' : '#e0b04a';
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 560 340" role="img" aria-label="Brake simulator: ' + r(o.g, 2) + ' g deceleration, stopping distance ' + (isFinite(o.dist) ? r(o.dist + o.think, 0) : 'very long') + ' metres"><title>Brake simulator</title><desc>A brake disc and caliper, the hydraulic circuit from pedal to caliper, and the stopping distance.</desc>';
  svg += '<defs>' +
    '<linearGradient id="bkMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6eaee"/><stop offset="1" stop-color="#8b949d"/></linearGradient>' +
    '<linearGradient id="bkCal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0483a"/><stop offset="1" stop-color="#9c231a"/></linearGradient>' +
    '<radialGradient id="bkGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0.7" stop-color="' + heat + '" stop-opacity="' + (o.discT > 300 ? 0.5 : 0) + '"/><stop offset="1" stop-color="' + heat + '" stop-opacity="0"/></radialGradient>' +
    '</defs>';

  // ---- hydraulic lines, drawn first ----
  var front = 'M468 196H500V30H178V56', rear = 'M500 200V300H534';
  [front, rear].forEach(function (d) {
    svg += '<path d="' + d + '" fill="none" stroke="#1d2024" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="' + line + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
  });
  if (s.fluid === 'air') [[505, 90], [505, 150], [330, 30], [260, 30]].forEach(function (b) { svg += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="3.5" fill="#fff" stroke="#59626b" stroke-width="0.8"/>'; });
  if (o.boil) [[186, 40], [196, 33], [214, 30], [176, 48]].forEach(function (b) { svg += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="3.5" fill="#fff" fill-opacity="0.9" stroke="#b07a1a" stroke-width="0.8"/>'; });

  // ---- the disc, with its caliper, spinning at road speed ----
  var cx = 118, cy = 148, spin = clamp(60 / s.speed, 0.25, 2).toFixed(2);
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="110" fill="url(#bkGlow)"/>';
  svg += '<g transform="translate(' + cx + ' ' + cy + ')"><g class="fan-spin" style="animation-duration:' + spin + 's;animation-delay:' + phase(+spin) + '">';
  svg += '<circle r="92" fill="' + heat + '" stroke="#3b4148" stroke-width="2"/><circle r="50" fill="none" stroke="#2a2f35" stroke-width="30" stroke-opacity="0.5"/>';
  for (var i = 0; i < 40; i++) svg += '<rect x="-2" y="-84" width="4" height="26" rx="2" fill="#262a2f" transform="rotate(' + (i * 9) + ')"/>';
  svg += '<circle r="93" fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="2"/><circle r="40" fill="#4a5058" stroke="#262a2f" stroke-width="2"/>';
  for (var k = 0; k < 5; k++) { var a = k * 72 * Math.PI / 180; svg += '<circle cx="' + (Math.sin(a) * 24).toFixed(1) + '" cy="' + (-Math.cos(a) * 24).toFixed(1) + '" r="5.5" fill="#cfd4da" stroke="#262a2f"/>'; }
  svg += '<circle r="10" fill="#2a2f35" stroke="#8d96a0"/></g></g>';
  // caliper bridging the disc at the top right, with two pistons
  svg += '<path d="M122 52A96 96 0 0 1 196 98L176 114A72 72 0 0 0 120 78Z" fill="url(#bkCal)" stroke="#5a1510" stroke-width="2"/>';
  [[150, 76], [176, 96]].forEach(function (p) { svg += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#d7dce1" stroke="#59626b"/>'; });
  svg += '<path d="M128 60L194 104" stroke="#12151a" stroke-width="3" opacity="0.5"/>';
  svg += '<rect x="170" y="52" width="12" height="9" rx="2" fill="#c8cdd2" stroke="#59626b"/>';                    // brake hose union
  svg += '<text x="' + cx + '" y="270" class="tb" text-anchor="middle">Front disc ' + r(o.discT, 0) + ' °C</text>';
  if (o.fade) svg += '<g transform="translate(66 22)"><rect x="-52" y="-12" width="104" height="20" rx="10" fill="#d93a2b"/><text y="3" text-anchor="middle" style="fill:#fff;stroke:none;font:700 12px sans-serif">BRAKE FADE</text></g>';

  // ---- pedal, servo and master cylinder ----
  var push = clamp(s.pedal / 500, 0, 1);
  svg += '<g transform="translate(300 300)"><path d="M0 0L' + (20 + 14 * push).toFixed(1) + ' -52" stroke="#2a2f35" stroke-width="7" stroke-linecap="round"/><rect x="' + (14 + 14 * push).toFixed(1) + '" y="-66" width="26" height="12" rx="3" fill="#15171a" transform="rotate(-18 ' + (27 + 14 * push).toFixed(1) + ' -60)"/><circle r="5" fill="#8d96a0" stroke="#2a2f35"/></g>';
  svg += '<text x="300" y="322" class="tsm" text-anchor="middle">Pedal ' + s.pedal + ' N</text>';
  svg += '<path d="M330 242L352 236" stroke="#2a2f35" stroke-width="6"/>';
  svg += '<circle cx="372" cy="214" r="42" fill="' + (s.servo ? '#bcc4cb' : '#8d939a') + '" stroke="#59626b" stroke-width="2"/><circle cx="372" cy="214" r="34" fill="none" stroke="#59626b" stroke-width="1.2" stroke-dasharray="3 3"/>' +
    '<path d="M372 180V248" stroke="#59626b" stroke-width="1"/><rect x="362" y="205" width="20" height="18" fill="#4a5058"/>';
  svg += '<text x="372" y="268" class="tsm" text-anchor="middle">Servo ' + (s.servo ? 'x4' : 'OFF') + '</text>';
  svg += '<path d="M414 214L426 214" stroke="#2a2f35" stroke-width="7"/>';
  svg += '<rect x="426" y="196" width="46" height="36" rx="5" fill="url(#bkMetal)" stroke="#59626b" stroke-width="1.5"/>' +
    '<rect x="432" y="166" width="34" height="30" rx="4" fill="#e9eef0" fill-opacity="0.85" stroke="#59626b"/>' +
    '<rect x="434" y="' + (s.fluid === 'air' ? 178 : 170) + '" width="30" height="' + (s.fluid === 'air' ? 16 : 24) + '" rx="2" fill="' + fluid + '" opacity="0.9"/>' +
    '<rect x="440" y="158" width="22" height="9" rx="2" fill="#14171a"/>';
  svg += '<text x="449" y="250" class="tsm" text-anchor="middle">Master cyl.</text>';
  svg += '<text x="490" y="120" class="tb" style="text-anchor:end">' + r(o.pbar, 0) + ' bar</text>';
  svg += '<g transform="translate(534 300)"><rect x="-14" y="-14" width="28" height="28" rx="14" fill="url(#bkMetal)" stroke="#59626b"/><circle r="5" fill="#2a2f35"/></g><text x="536" y="330" class="tsm" text-anchor="middle">Rear</text>';

  // ---- ABS lamp ----
  svg += '<g transform="translate(486 56)"><rect width="46" height="22" rx="5" fill="' + (o.abs ? '#f2a30f' : '#2a2f35') + '" stroke="#12151a"/><text x="23" y="15" text-anchor="middle" style="fill:' + (o.abs ? '#1a1300' : '#6c747d') + ';stroke:none;font:800 12px sans-serif">ABS</text></g>';

  // ---- stopping distance drawn to scale ----
  var total = isFinite(o.dist) ? o.dist + o.think : 999, scale = 210 / Math.max(120, Math.min(total, 400));
  var tw = Math.min(210, o.think * scale), bw = isFinite(o.dist) ? Math.min(210 - tw, o.dist * scale) : 210 - tw;
  svg += '<rect x="20" y="304" width="210" height="14" rx="3" fill="#3b4148"/>';
  svg += '<rect x="20" y="304" width="' + tw.toFixed(1) + '" height="14" rx="3" fill="#e0b04a"/><rect x="' + (20 + tw).toFixed(1) + '" y="304" width="' + bw.toFixed(1) + '" height="14" rx="3" fill="#d93a2b"/>';
  svg += '<path d="M20 300V322" stroke="#fff" stroke-width="2"/>';
  svg += '<text x="20" y="298" class="tsm" style="font-size:10px">Stopping distance ' + (isFinite(total) && total < 999 ? r(total, 0) + ' m' : 'very long') + '</text>';
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
