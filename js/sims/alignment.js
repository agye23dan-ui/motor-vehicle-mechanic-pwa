import { h } from '../dom.js';
import { slider, toggle, readout, paint, r, clamp } from './kit.js';

/*
 * Wheel alignment simulator. Change toe, camber and caster and see how the wheels sit, how the
 * tyres wear and which way the car pulls. Limits shown are typical, for practice.
 */

var SPEC = { toe: [0, 2], camber: [-0.8, 0.2], caster: [3, 5] };

export function build() {
  var holder = h('div', { class: 'sim-figure' });
  var out = readout();
  var msg = h('div', { class: 'sim-warns', role: 'status' });
  var ctl = {};
  function band(v, lo, hi) { return v >= lo && v <= hi ? 'in' : (v >= lo - (hi - lo) * 0.75 && v <= hi + (hi - lo) * 0.75 ? 'near' : 'out'); }
  function update() {
    var toe = ctl.toe.get(), cl = ctl.cl.get(), cr = ctl.cr.get(), kl = ctl.kl.get(), kr = ctl.kr.get();
    var W = 560, Hh = 330;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="Wheel alignment from above and from the front"><title>Wheel alignment</title><desc>A top view showing toe and a front view showing camber.</desc>';
    // top view
    s += '<text x="140" y="24" class="tb" text-anchor="middle">From above (toe)</text>';
    s += '<rect x="100" y="150" width="80" height="150" rx="6" class="metal" style="fill-opacity:0.1"/>';
    var ang = Math.atan2(toe / 2, 600) * 180 / Math.PI * 60;       // exaggerated for the drawing
    [[60, 1], [180, -1]].forEach(function (w) {
      s += '<g transform="translate(' + w[0] + ' 80) rotate(' + (w[1] * ang * -1) + ')"><rect x="-10" y="-40" width="20" height="80" rx="4" class="box tint-c"/></g>';
    });
    s += '<path d="M60 40V10M180 40V10" class="flow"/><path d="M60 120V300M180 120V300" class="dim"/>';
    s += '<text x="140" y="320" class="tsm" text-anchor="middle">Toe ' + r(toe, 1) + ' mm (' + (toe > 0 ? 'toe-in' : toe < 0 ? 'toe-out' : 'straight') + '), angle exaggerated</text>';
    // front view
    s += '<text x="400" y="24" class="tb" text-anchor="middle">From the front (camber)</text>';
    [[340, cl], [460, cr]].forEach(function (w) {
      s += '<g transform="translate(' + w[0] + ' 170) rotate(' + (w[0] < 400 ? w[1] : -w[1]) * 5 + ')"><rect x="-20" y="-80" width="40" height="160" rx="8" class="box tint-c"/></g>';
    });
    s += '<path d="M280 250H520" class="k2"/><path d="M340 70V260M460 70V260" class="dim"/>';
    s += '<text x="340" y="282" class="tsm" text-anchor="middle">L ' + r(cl, 1) + '°</text><text x="460" y="282" class="tsm" text-anchor="middle">R ' + r(cr, 1) + '°</text>';
    s += '<text x="400" y="320" class="tsm" text-anchor="middle">Camber, angle times five for the drawing</text>';
    s += '</svg>';
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
