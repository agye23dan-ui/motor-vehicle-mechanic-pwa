import { h } from '../dom.js';
import { slider, toggle, readout, paint, r, clamp } from './kit.js';

/*
 * Wheel alignment simulator. Change toe, camber and caster and see how the wheels sit, how the
 * tyres wear and which way the car pulls. Limits shown are typical, for practice.
 */

var SPEC = { toe: [0, 2], camber: [-0.8, 0.2], caster: [3, 5] };

/* Four views of the alignment: the car from above (toe and rear thrust), from the front (camber), from the side (caster
   and trail), and a slice through a tread showing the wear the angles would cause. The angles are exaggerated so they show. */
function alignSvg(toe, cl, cr, kl, kr, thrust) {
  var tread = function (x, y, w, h) {                          // a tyre seen from above or the front, with tread blocks
    var t = '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="' + Math.min(6, w / 3) + '" fill="#1b1e22" stroke="#0a0b0d"/>';
    for (var q = -h / 2 + 5; q < h / 2 - 2; q += 7) t += '<path d="M' + (-w / 2 + 2) + ' ' + q + 'H' + (w / 2 - 2) + '" stroke="#3a4048" stroke-width="1.4"/>';
    return t;
  };
  var g = '<defs><linearGradient id="alMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6eaee"/><stop offset="1" stop-color="#8b949d"/></linearGradient>' +
    '<linearGradient id="alBody" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa3ad"/><stop offset="0.5" stop-color="#d9dee3"/><stop offset="1" stop-color="#9aa3ad"/></linearGradient></defs>';

  // ---- top view: toe ----
  var toeDeg = Math.atan2(toe / 2, 600) * 180 / Math.PI * 60, thrustDeg = thrust ? 3 : 0;
  g += '<text x="140" y="16" class="tb" text-anchor="middle">From above: toe</text>';
  g += '<rect x="86" y="30" width="108" height="196" rx="30" fill="url(#alBody)" stroke="#59626b" stroke-width="1.5"/><path d="M104 74H176V150H104Z" fill="#7f9bb0" fill-opacity="0.6" stroke="#59626b"/>';
  g += '<path d="M140 22V236" stroke="#59626b" stroke-width="1" stroke-dasharray="6 4"/>';
  g += '<path d="M62 64H218" stroke="#8d96a0" stroke-width="5"/><rect x="118" y="58" width="44" height="12" rx="4" fill="url(#alMetal)" stroke="#59626b"/>';        // front axle line and steering rack
  [[60, -1], [220, 1]].forEach(function (w) {
    g += '<g transform="translate(' + w[0] + ' 64)"><g transform="rotate(' + (-w[1] * toeDeg).toFixed(2) + ')">' + tread(0, 0, 26, 58) + '<rect x="-3" y="-29" width="6" height="58" fill="#aab2ba" fill-opacity="0.35"/></g></g>';
    g += '<path d="M' + w[0] + ' 14V116" stroke="#d6335a" stroke-width="1" stroke-dasharray="3 3" opacity="0.8"/>';
  });
  g += '<g transform="translate(140 188) rotate(' + thrustDeg + ')"><path d="M-80 0H80" stroke="#8d96a0" stroke-width="5"/>';
  [-80, 80].forEach(function (x) { g += '<g transform="translate(' + x + ' 0)">' + tread(0, 0, 26, 58) + '</g>'; });
  g += '</g>';
  if (thrust) g += '<path d="M140 188L' + (140 + 70 * Math.sin(thrustDeg * Math.PI / 90)).toFixed(1) + ' 112" stroke="#d6335a" stroke-width="3" marker-end="url(#alArrow)"/><text x="190" y="160" class="tsm" style="font-size:10px;fill:#d6335a">Thrust line off-centre</text>';
  g += '<text x="140" y="256" class="tsm" text-anchor="middle">Toe ' + r(toe, 1) + ' mm (' + (toe > 0 ? 'toe-in' : toe < 0 ? 'toe-out' : 'straight') + '), angle exaggerated</text>';

  // ---- front view: camber ----
  g += '<text x="420" y="16" class="tb" text-anchor="middle">From the front: camber</text>';
  g += '<path d="M290 214H550" stroke="#59626b" stroke-width="3"/><rect x="290" y="214" width="260" height="6" fill="#59626b" fill-opacity="0.25"/>';
  g += '<rect x="394" y="64" width="52" height="46" rx="6" fill="url(#alBody)" stroke="#59626b"/>';
  [[340, cl, -1], [500, cr, 1]].forEach(function (w) {
    var x = w[0], deg = w[1] * 5 * w[2] * -1 * -1;
    g += '<path d="M' + (w[2] < 0 ? 394 : 446) + ' 76L' + (x + w[2] * 14) + ' 88M' + (w[2] < 0 ? 394 : 446) + ' 100L' + (x + w[2] * 16) + ' 150" stroke="#6b737c" stroke-width="5" stroke-linecap="round"/>';
    g += '<g transform="translate(' + x + ' 214) rotate(' + (w[2] < 0 ? -w[1] : w[1]) * 5 * 1 + ')">';
    g += '<rect x="-22" y="-112" width="44" height="112" rx="10" fill="#1b1e22" stroke="#0a0b0d"/><rect x="-14" y="-102" width="28" height="82" rx="6" fill="url(#alMetal)" stroke="#59626b"/><circle cy="-62" r="10" fill="#4a5058" stroke="#1d2024"/>';
    g += '<rect x="-22" y="-20" width="44" height="20" rx="4" fill="#0f1114"/>';
    g += '</g>';
    g += '<path d="M' + x + ' 94V222" stroke="#d6335a" stroke-width="1" stroke-dasharray="3 3"/>';
  });
  g += '<text x="340" y="244" class="tsm" text-anchor="middle">L ' + r(cl, 1) + '°</text><text x="500" y="244" class="tsm" text-anchor="middle">R ' + r(cr, 1) + '°</text>';
  g += '<text x="420" y="260" class="tsm" text-anchor="middle" style="font-size:10px">Camber, angle times five for the drawing</text>';

  g += '<g transform="translate(0 34)">';
  // ---- side view: caster and trail ----
  var cs = (kl + kr) / 2, tanC = Math.tan(cs * Math.PI / 180), cx = 120, cy = 360, gy = 430;
  g += '<text x="140" y="290" class="tb" text-anchor="middle">From the side: caster</text>';
  g += '<path d="M20 ' + gy + 'H260" stroke="#59626b" stroke-width="3"/>';
  g += '<circle cx="' + cx + '" cy="' + cy + '" r="64" fill="#1b1e22" stroke="#0a0b0d" stroke-width="2"/><circle cx="' + cx + '" cy="' + cy + '" r="44" fill="url(#alMetal)" stroke="#59626b"/>';
  for (var sp = 0; sp < 5; sp++) g += '<path d="M' + cx + ' ' + cy + 'L' + (cx + 40 * Math.cos(sp * 1.2566 - 1.57)).toFixed(1) + ' ' + (cy + 40 * Math.sin(sp * 1.2566 - 1.57)).toFixed(1) + '" stroke="#59626b" stroke-width="5" stroke-linecap="round"/>';
  g += '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="#2a2f35" stroke="#8d96a0"/>';
  var topY = cy - 100, ax = cx + tanC * (gy - topY);
  g += '<path d="M' + (cx - 0) + ' ' + (cy - 100) + 'V' + gy + '" stroke="#8d96a0" stroke-width="1" stroke-dasharray="4 4"/>';
  g += '<path d="M' + cx + ' ' + topY + 'L' + ax.toFixed(1) + ' ' + gy + '" stroke="#d6335a" stroke-width="3"/><circle cx="' + cx + '" cy="' + topY + '" r="6" fill="#d6335a"/><circle cx="' + (cx + tanC * (cy + 64 - topY)).toFixed(1) + '" cy="' + (cy + 64) + '" r="5" fill="#d6335a"/>';
  g += '<path d="M' + cx + ' ' + (gy - 6) + 'H' + ax.toFixed(1) + '" stroke="#e0b04a" stroke-width="5" stroke-linecap="round"/>';
  g += '<text x="' + (cx + 70) + '" y="' + (gy - 10) + '" class="tsm" style="font-size:10px">Trail ' + r(tanC * (gy - topY) * 3.2, 0) + ' mm</text>';
  g += '<text x="236" y="' + (topY + 6) + '" class="tsm" text-anchor="end" style="font-size:10px">Front →</text>';
  g += '<text x="140" y="448" class="tsm" text-anchor="middle">Caster ' + r(kl, 1) + '° and ' + r(kr, 1) + '°</text>';

  // ---- tread wear ----
  var camAvg = (cl + cr) / 2, inner = clamp((-camAvg - 0.8) / 2.2, 0, 1), outer = clamp((camAvg + 0.2) / 2.2, 0, 1), feather = clamp(Math.abs(toe - 1) / 6, 0, 1);
  var ribs = [inner * 0.9 + feather * 0.35, feather * 0.25, feather * 0.1 + 0.05, feather * 0.25, outer * 0.9 + feather * 0.35];
  g += '<text x="420" y="290" class="tb" text-anchor="middle">Tread wear</text>';
  ribs.forEach(function (wv, i) {
    var x = 318 + i * 42, full = 78, hh = full * (1 - clamp(wv, 0, 0.85));
    g += '<rect x="' + x + '" y="' + (380 - 0) + '" width="36" height="14" fill="#2a2f35"/><rect x="' + x + '" y="' + (380 - hh).toFixed(1) + '" width="36" height="' + hh.toFixed(1) + '" rx="3" fill="' + (wv > 0.35 ? '#b5543f' : '#3a4048') + '" stroke="#0a0b0d"/>';
  });
  g += '<path d="M310 394H536" stroke="#59626b" stroke-width="2"/><text x="318" y="414" class="tsm" style="font-size:10px">Inner edge</text><text x="536" y="414" class="tsm" text-anchor="end" style="font-size:10px">Outer edge</text>';
  g += '<text x="420" y="438" class="tsm" text-anchor="middle" style="font-size:10px">Shorter ribs have worn more</text>';
  return g + '</g>';
}

export function build() {
  var holder = h('div', { class: 'sim-figure' });
  var out = readout();
  var msg = h('div', { class: 'sim-warns', role: 'status' });
  var ctl = {};
  function band(v, lo, hi) { return v >= lo && v <= hi ? 'in' : (v >= lo - (hi - lo) * 0.75 && v <= hi + (hi - lo) * 0.75 ? 'near' : 'out'); }
  function update() {
    var toe = ctl.toe.get(), cl = ctl.cl.get(), cr = ctl.cr.get(), kl = ctl.kl.get(), kr = ctl.kr.get();
    var s = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 560 496" role="img" aria-label="Wheel alignment: toe from above, camber from the front, caster from the side and the tread wear that results"><title>Wheel alignment</title><desc>Four views: the car from above showing toe, from the front showing camber, from the side showing caster and trail, and a tread wear slice.</desc><defs><marker id="alArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L9 5L1 9Z" fill="#d6335a"/></marker></defs>' + alignSvg(toe, cl, cr, kl, kr, ctl.thrust.get()) + '</svg>';
    paint(holder, s);
    // effects
    var wear = 1 + 0.35 * Math.abs(toe - 1) + 0.5 * (Math.abs(cl + 0.3) + Math.abs(cr + 0.3));
    var pullCamber = (cl - cr) * 1.0;                  // car pulls toward the more positive camber
    var pullCaster = (kr - kl) * 0.5;                  // car pulls toward the side with less caster
    var pull = pullCamber + pullCaster;
    var dir = Math.abs(pull) < 0.3 ? 'no noticeable pull' : (pull > 0 ? 'pulls to the left' : 'pulls to the right');
    var pat;
    if (toe > 3) pat = 'feathered wear on the tread ribs (toe-in) and worn outer edges';
    else if (toe < -2) pat = 'feathered wear (toe-out) and worn inner edges';
    else if (Math.max(cl, cr) > 1) pat = 'outer edge wear from positive camber';
    else if (Math.min(cl, cr) < -1.5) pat = 'inner edge wear from too much negative camber';
    else pat = 'even wear';
    out.set([
      ['Relative tyre wear rate', r(wear, 1) + 'x normal'],
      ['Wear pattern', pat],
      ['Steering pull', dir],
      ['Toe', r(toe, 1) + ' mm  (limit ' + SPEC.toe[0] + ' to ' + SPEC.toe[1] + ')', band(toe, SPEC.toe[0], SPEC.toe[1]) === 'in' ? 'good' : 'odd'],
      ['Left camber', r(cl, 1) + '°  (limit ' + SPEC.camber[0] + ' to ' + SPEC.camber[1] + ')', band(cl, SPEC.camber[0], SPEC.camber[1]) === 'in' ? 'good' : 'odd'],
      ['Right camber', r(cr, 1) + '°', band(cr, SPEC.camber[0], SPEC.camber[1]) === 'in' ? 'good' : 'odd'],
      ['Caster left and right', r(kl, 1) + '° and ' + r(kr, 1) + '°  (limit ' + SPEC.caster[0] + ' to ' + SPEC.caster[1] + ')', band(kl, SPEC.caster[0], SPEC.caster[1]) === 'in' && band(kr, SPEC.caster[0], SPEC.caster[1]) === 'in' ? 'good' : 'odd'],
      ['Steering return and stability', Math.min(kl, kr) < 2.5 ? 'weak: the wheel will not self-centre well' : Math.max(kl, kr) > 6 ? 'heavy steering' : 'good']
    ]);
    var m = [];
    if (Math.abs(cl - cr) > 0.7) m.push(['Camber differs side to side by more than 0.7°. The car pulls toward the side with the more positive camber.', 'note tip']);
    if (Math.abs(kl - kr) > 0.8) m.push(['Caster differs side to side. The car pulls toward the side with less caster.', 'note tip']);
    if (toe < -1 || toe > 3) m.push(['Toe is far out of limit. This wears tyres quickly and makes the steering twitchy or sluggish.', 'note safety']);
    if (ctl.thrust.get()) m.push(['The rear axle is pointing off-centre (thrust angle). The car will crab and the steering wheel will sit off-centre even if the front is perfect. Always check all four wheels.', 'note safety']);
    if (!m.length) m.push(['The settings are within sensible limits.', 'note key']);
    msg.replaceChildren.apply(msg, m.map(function (x) { return h('div', { class: x[1] }, h('p', null, x[0])); }));
  }
  ctl.toe = slider('Front toe (total)', -8, 8, 0.5, 1, 'mm', update, 1);
  ctl.cl = slider('Camber, left', -3, 3, 0.1, -0.4, 'deg', update, 1);
  ctl.cr = slider('Camber, right', -3, 3, 0.1, -0.4, 'deg', update, 1);
  ctl.kl = slider('Caster, left', 0, 8, 0.1, 4, 'deg', update, 1);
  ctl.kr = slider('Caster, right', 0, 8, 0.1, 4, 'deg', update, 1);
  ctl.thrust = toggle('Rear axle off-centre (thrust angle)', false, update);
  update();
  return h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' }, holder, msg, out.el),
    h('div', { class: 'sim-side' }, h('h3', null, 'Controls'), ctl.toe.el, ctl.cl.el, ctl.cr.el, ctl.kl.el, ctl.kr.el, ctl.thrust.el,
      h('div', { class: 'sim-try' }, h('h3', null, 'Try this'), h('ol', null,
        h('li', null, 'Set 5 mm of toe-in and read the wear pattern. Then set toe-out.'),
        h('li', null, 'Make the left camber more positive than the right. Which way does the car pull?'),
        h('li', null, 'Lower the caster on one side only. What happens to the pull?'),
        h('li', null, 'Switch on the thrust angle fault. Why is a four-wheel alignment better than a front-only one?')))));
}

export default {
  id: 'alignment', title: 'Wheel alignment simulator', icon: 'list',
  blurb: 'Adjust toe, camber and caster and see the wheels move, how the tyres wear and which way the car pulls.',
  lesson: ['m18-l7', 'Wheel alignment angles'],
  build: build
};
