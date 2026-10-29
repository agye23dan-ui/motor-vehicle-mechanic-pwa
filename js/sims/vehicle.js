import { h, svgFromString } from '../dom.js';
import * as store from '../store.js';
import { icon } from '../icons.js';
import { TOOLS, R, C, P, T, RS, STEEL, DARK, RED, RUBBER } from './assemblies.js';
function CS(x, y, r, st) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" style="' + st + '"/>'; }
import { toolIcon, toolCaption } from './toolicons.js';

/*
 * Whole-vehicle workshop. A car frame with a bench below it. Strip the car by dragging parts off
 * the frame onto the bench, or build it by dragging parts from the bench onto the frame. Parts
 * only go on or off in a valid order, with the right tool, and tightened to the right torque.
 */

var KEY = 'sim:vehicle';
var PEN = { order: 3, tool: 2, place: 2, torque: 3, safety: 10, hint: 1 };
var PEN_TIP = {
  order: 'Parts come off in the order they block each other, and go back in the reverse order. The battery is the first thing off and the last thing on.',
  tool: 'Read the manual extract and choose the right socket for each fastener before you drag the part.',
  place: 'Drop each part on its own outline on the car, and drop removed parts on the bench.',
  torque: 'Tighten every fastener to the specified torque. Too little can let it work loose and too much can strip or stretch it.',
  safety: 'Do the safety preparation first and never work under a car held only by a jack.',
  hint: 'Try to work from the manual extract without asking for hints.'
};

/* Parts are listed in the order a technician would strip them. */
export var PARTS = [
  { id: 'battery', name: 'Battery', tool: 'sock-10', torque: 6, req: [], last: true, c: [770, 222],
    svg: RS(745, 206, 56, 34, 'fill:#23272c;stroke:#101214;stroke-width:1.2', 4) + RS(748, 209, 50, 9, 'fill:#3a4047', 3) + RS(752, 198, 10, 8, 'fill:#d93a2b;stroke:#6b1a12', 2) + RS(784, 198, 10, 8, 'fill:#2a2f35;stroke:#101214', 2) + RS(756, 221, 34, 15, 'fill:#e9eef0', 2) + T(773, 232, 'Battery', 'tsm', 'middle') },
  { id: 'frontwheel', name: 'Front wheel', tool: 'sock-19', torque: 110, req: ['frontbrake', 'driveshaft'], c: [720, 350],
    svg: CS(720, 350, 60, 'fill:#1d2024;stroke:#0a0b0d;stroke-width:1.5') + CS(720, 350, 55, 'fill:none;stroke:#3a4048;stroke-width:7;stroke-dasharray:6 5') + CS(720, 350, 42, 'fill:url(#shMetal);stroke:#59626b;stroke-width:1.2') + P('M720 350L720 314M720 350L754 339M720 350L741 379M720 350L699 379M720 350L686 339', 'k2', 'stroke:#59626b;stroke-width:6;stroke-linecap:round') + CS(720, 350, 9, 'fill:url(#shDark);stroke:#1f2327') + T(720, 420, 'Front wheel', 'tsm', 'middle') },
  { id: 'rearwheel', name: 'Rear wheel', tool: 'sock-19', torque: 110, req: ['rearbrake'], c: [250, 350],
    svg: CS(250, 350, 60, 'fill:#1d2024;stroke:#0a0b0d;stroke-width:1.5') + CS(250, 350, 55, 'fill:none;stroke:#3a4048;stroke-width:7;stroke-dasharray:6 5') + CS(250, 350, 42, 'fill:url(#shMetal);stroke:#59626b;stroke-width:1.2') + P('M250 350L250 314M250 350L284 339M250 350L271 379M250 350L229 379M250 350L216 339', 'k2', 'stroke:#59626b;stroke-width:6;stroke-linecap:round') + CS(250, 350, 9, 'fill:url(#shDark);stroke:#1f2327') + T(250, 420, 'Rear wheel', 'tsm', 'middle') },
  { id: 'driveshaft', name: 'Driveshaft', tool: 'sock-32', torque: 250, req: ['gearbox', 'frontbrake'], c: [640, 325],
    svg: P('M556 302L716 346', 'k', 'stroke:#15171a;stroke-width:10;stroke-linecap:round') + P('M556 302L716 346', 'k', 'stroke:#cfd4da;stroke-width:5;stroke-linecap:round') + P('M688 338L712 345', 'k', 'stroke:#1d2024;stroke-width:15;stroke-linecap:round') + RS(552, 292, 14, 20, STEEL, 3) + CS(716, 346, 10, 'fill:url(#shMetal);stroke:#59626b') },
  { id: 'frontbrake', name: 'Front brake', tool: 'sock-17', torque: 95, req: ['frontstrut'], c: [720, 350],
    svg: CS(720, 350, 36, 'fill:url(#shMetal);stroke:#59626b;stroke-width:1.4') + CS(720, 350, 26, 'fill:none;stroke:#4a5158;stroke-width:2;stroke-dasharray:3 3') + CS(720, 350, 12, 'fill:url(#shDark);stroke:#1f2327') + RS(738, 322, 18, 30, RED, 5) + CS(747, 330, 2, 'fill:#cfd4da') },
  { id: 'rearbrake', name: 'Rear drum brake', tool: 'sock-13', torque: 60, req: ['rearaxle'], c: [250, 350],
    svg: CS(250, 350, 36, 'fill:url(#shMetal);stroke:#59626b;stroke-width:1.4') + CS(250, 350, 30, 'fill:none;stroke:#4a5158;stroke-width:1.4') + CS(250, 350, 22, 'fill:none;stroke:#8d96a0;stroke-width:1') + CS(250, 350, 12, 'fill:url(#shDark);stroke:#1f2327') },
  { id: 'frontstrut', name: 'Front strut', tool: 'sock-17', torque: 70, req: [], c: [706, 288],
    svg: RS(700, 226, 12, 118, DARK, 3) + P('M690 252l20 6-20 8 20 8-20 8 20 8', 'k2', 'stroke:#c0392b;stroke-width:3.2;stroke-linejoin:round') + RS(692, 220, 28, 10, STEEL, 3) + RS(703, 330, 6, 14, STEEL, 2) },
  { id: 'rearaxle', name: 'Rear axle and spring', tool: 'sock-19', torque: 100, req: [], c: [270, 336],
    svg: RS(180, 346, 160, 8, DARK, 3) + P('M332 310l16 4-16 6 16 6-16 6 16 6', 'k2', 'stroke:#c0392b;stroke-width:3.2;stroke-linejoin:round') + RS(206, 296, 8, 50, DARK, 2) + RS(203, 292, 14, 8, STEEL, 2) },
  { id: 'alternator', name: 'Alternator', tool: 'sock-13', torque: 25, req: ['engine'], c: [690, 300],
    svg: CS(690, 300, 18, 'fill:url(#shDark);stroke:#1f2327;stroke-width:1.4') + CS(690, 300, 12, 'fill:none;stroke:#8d96a0;stroke-width:1.4;stroke-dasharray:3 3') + CS(690, 300, 6, 'fill:url(#shMetal);stroke:#59626b') + T(690, 332, 'Alternator', 'tsm', 'middle') },
  { id: 'exhaust', name: 'Exhaust system', tool: 'sock-13', torque: 40, req: ['engine'], c: [400, 390],
    svg: P('M640 322V350Q640 392 590 392H280', 'k', 'stroke:#4a5158;stroke-width:12;stroke-linecap:round') + P('M640 322V350Q640 392 590 392H280', 'k', 'stroke:#cfd4da;stroke-width:7;stroke-linecap:round') + RS(180, 378, 100, 26, STEEL, 13) + P('M196 380V402M210 380V402M224 380V402', 'k2', 'stroke:#7a828a;stroke-width:1') + T(230, 396, 'Exhaust', 'tsm', 'middle') },
  { id: 'fueltank', name: 'Fuel tank', tool: 'sock-13', torque: 30, req: [], c: [380, 355],
    svg: RS(320, 334, 130, 44, 'fill:#4a4f56;stroke:#1f2327;stroke-width:1.2', 12) + P('M350 332V380M420 332V380', 'k2', 'stroke:#cfd4da;stroke-width:3') + T(385, 361, 'Fuel tank', 'tsm', 'middle') },
  { id: 'radiator', name: 'Radiator', tool: 'sock-10', torque: 8, req: [], c: [812, 280],
    svg: RS(798, 238, 26, 86, 'fill:#59626b;stroke:#2a2f35;stroke-width:1.2', 3) + RS(795, 231, 32, 9, STEEL, 3) + RS(795, 322, 32, 9, STEEL, 3) + P('M802 248h18M802 258h18M802 268h18M802 278h18M802 288h18M802 298h18M802 308h18', 'k2', 'stroke:#cfd4da;stroke-width:1.4;opacity:0.8') },
  { id: 'gearbox', name: 'Gearbox', tool: 'sock-17', torque: 50, req: ['engine'], c: [515, 288],
    svg: RS(468, 252, 94, 72, DARK, 12) + P('M484 258V318M500 258V318M516 258V318M532 258V318M548 258V318', 'k2', 'stroke:#8d96a0;stroke-width:1;opacity:0.45') + RS(552, 258, 14, 60, STEEL, 5) + T(510, 292, 'Gearbox', 'tsm', 'middle') },
  { id: 'engine', name: 'Engine', tool: 'sock-17', torque: 80, req: [], c: [635, 270],
    svg: RS(562, 232, 150, 92, DARK, 10) + P('M580 240V318M600 240V318M620 240V318M640 240V318M660 240V318M680 240V318', 'k2', 'stroke:#8d96a0;stroke-width:1;opacity:0.35') + RS(572, 214, 130, 18, STEEL, 6) + RS(598, 200, 80, 14, DARK, 4) + CS(612, 196, 5, 'fill:#d93a2b;stroke:#6b1a12') + RS(704, 226, 14, 30, 'fill:#2a2f35;stroke:#101214', 4) + T(637, 282, 'Engine', 'tsm', 'middle') }
];
var BY = {}; PARTS.forEach(function (p) { BY[p.id] = p; });

var SPEC = PARTS.map(function (p) { return [p.name, toolName(p.tool), p.torque + ' N m']; });

var PREP = [
  { id: 'level', label: 'Park on level ground, apply the parking brake and chock the wheels', ok: true },
  { id: 'stands', label: 'Raise the car and support it on axle stands', ok: true },
  { id: 'fluids', label: 'Have containers ready for fuel, coolant and oil, and keep sparks away', ok: true },
  { id: 'jack', label: 'Work under the car supported only by the jack', ok: false, why: 'A jack can slip or fail. Never put any part of your body under a car held only by a jack. Always use axle stands.' }
];

function toolName(id) { for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i][0] === id) return TOOLS[i][1]; return id; }
function best() { return store.get('kv', KEY) || {}; }
function starText(n) { return n ? '★'.repeat(n) + '☆'.repeat(3 - n) : '☆☆☆'; }
function shuffle(a) { var b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; } return b; }

function frame() {
  var body = 'M120 330V262Q124 226 178 214L318 202Q376 150 478 148L610 150Q672 152 706 204L824 218Q876 228 884 264L888 330Z';
  return '<ellipse cx="504" cy="414" rx="410" ry="10" fill="#101214" opacity="0.18"/>' +
    '<path d="' + body + '" style="fill:url(#shPaint);fill-opacity:0.5;stroke:#4a5560;stroke-width:2.2"/>' +
    '<path d="M330 204Q384 160 478 158L604 160Q650 162 676 204Z" style="fill:url(#shGlass);fill-opacity:0.6;stroke:#4a5560;stroke-width:1.6"/>' +
    '<path d="M470 156V204M560 158V204" class="k2"/>' +
    '<path d="M178 216L200 232M706 206L720 224" class="k2" style="stroke:#fff;stroke-opacity:0.5"/>' +
    '<circle cx="250" cy="350" r="76" style="fill:#14171a;fill-opacity:0.28;stroke:#4a5560;stroke-width:1.6"/><circle cx="720" cy="350" r="76" style="fill:#14171a;fill-opacity:0.28;stroke:#4a5560;stroke-width:1.6"/>' +
    '<rect x="124" y="318" width="764" height="12" rx="3" style="fill:url(#shDark);stroke:#1f2327;stroke-width:1.2"/>' +
    '<path d="M40 412H920" class="k2"/>' +
    T(920, 302, 'FRONT', 'tb', 'end') + P('M820 290H900', 'k', 'marker-end:url(#ar)') + '';
}

function build(kind, onExit) {
  var strip = kind === 'strip';
  var st = {
    phase: 'prep', prep: {}, installed: {}, loose: null, tool: null, drag: null, slot: {},
    pen: { order: 0, tool: 0, place: 0, torque: 0, safety: 0, hint: 0 }, start: Date.now(), msgs: [], torqueOrder: null, final: {}
  };
  PARTS.forEach(function (p) { st.installed[p.id] = strip; });

  var gparts = PARTS.slice().reverse().map(function (p) { return '<g class="veh-part" data-id="' + p.id + '" tabindex="0" role="button" aria-label="' + p.name + '" style="touch-action:none"><title>' + p.name + '</title>' + p.svg + '</g>'; }).join('');
  var svgEl = svgFromString('<svg xmlns="http://www.w3.org/2000/svg" class="dg veh-svg" viewBox="0 0 940 520" role="group" aria-label="Car frame and workbench"><title>Car frame and workbench</title><defs><linearGradient id="shMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f4f6"/><stop offset="0.45" stop-color="#bcc3ca"/><stop offset="1" stop-color="#7c858e"/></linearGradient><linearGradient id="shPaint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb4c6"/><stop offset="1" stop-color="#5f7487"/></linearGradient><linearGradient id="shGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe6f3"/><stop offset="1" stop-color="#6f9ab8"/></linearGradient><linearGradient id="shRed" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5584a"/><stop offset="1" stop-color="#9c231a"/></linearGradient><linearGradient id="shDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a828a"/><stop offset="0.5" stop-color="#4a5159"/><stop offset="1" stop-color="#2a2e33"/></linearGradient></defs>' +
    '<defs><marker id="ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1.5 9 5 1 8.5z" class="head"/></marker></defs>' +
    '<rect x="14" y="432" width="912" height="14" rx="3" style="fill:#c79a5f;stroke:#7a5a30;stroke-width:1.2"/><rect x="24" y="446" width="892" height="66" style="fill:#8f6b3d;stroke:#5c4222;stroke-width:1.2"/><path d="M34 460H906M34 476H906M34 492H906" stroke="#5c4222" stroke-opacity="0.35" stroke-width="1"/><path d="M80 438H300M420 436H640M700 438H900" stroke="#7a5a30" stroke-opacity="0.45" stroke-width="1"/><text x="916" y="428" class="tsm" text-anchor="end">Workbench: drop removed parts here</text>' +
    frame() + '<g class="veh-ghosts"></g>' + gparts + '</svg>');
  var groups = {}, ghosts = {}, box = {};
  var NS = 'http://www.w3.org/2000/svg';
  var side = h('div', { class: 'asm-side' });
  var log = h('div', { class: 'asm-log', role: 'status', 'aria-live': 'polite' });
  var banner = h('div', { class: 'asm-banner' });
  var root = h('div', { class: 'sim-layout asm-layout' }, h('div', { class: 'sim-main' }, banner, h('div', { class: 'sim-figure' }, svgEl), log), side);

  function say(t, k) { st.msgs.unshift({ text: t, kind: k || 'info' }); st.msgs = st.msgs.slice(0, 4); drawLog(); }
  function penalty(c, why) { st.pen[c] += PEN[c]; say(why + ' (minus ' + PEN[c] + ' points)', 'bad'); drawBanner(); }
  function score() { var s = 100; Object.keys(st.pen).forEach(function (k) { s -= st.pen[k]; }); return Math.max(0, s); }
  function drawLog() { log.replaceChildren.apply(log, st.msgs.map(function (m) { return h('p', { class: 'asm-msg ' + m.kind }, m.text); })); }
  function count() { return PARTS.filter(function (p) { return st.installed[p.id]; }).length; }
  function drawBanner() {
    var label = st.phase === 'prep' ? 'Safety preparation' : st.phase === 'done' ? 'Finished' : (strip ? 'Strip the car: drag parts onto the bench' : 'Build the car: drag parts onto the frame') + ' (' + count() + ' of ' + PARTS.length + ' fitted)';
    banner.replaceChildren(h('div', { class: 'asm-phase' }, h('strong', null, label), h('span', { class: 'asm-score' }, 'Score ' + score())));
  }

  /* ---- geometry ---- */
  Array.prototype.forEach.call(svgEl.querySelectorAll('.veh-part'), function (g) { groups[g.getAttribute('data-id')] = g; });
  var ghostLayer = svgEl.querySelector('.veh-ghosts');
  /* Sizes can only be measured once the drawing is in the page, so they are read the first time they are needed. */
  function bb(id) {
    if (!box[id]) {
      var b = null;
      try { b = groups[id].getBBox(); } catch (e) { b = null; }
      if (b && (b.width || b.height)) {
        box[id] = b;
        var r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', b.x - 4); r.setAttribute('y', b.y - 4); r.setAttribute('width', b.width + 8); r.setAttribute('height', b.height + 8); r.setAttribute('rx', 6);
        r.setAttribute('class', 'veh-ghost'); r.style.display = 'none';
        ghostLayer.appendChild(r); ghosts[id] = r;
      }
    }
    return box[id] || { x: 0, y: 0, width: 10, height: 10 };
  }
  function ghost(id) { bb(id); return ghosts[id] || { style: {}, classList: { add: function () {}, remove: function () {} } }; }
  function ctr(id) { var b = bb(id); return [b.x + b.width / 2, b.y + b.height / 2]; }
  function benchSlot(id) {
    var i = st.slot[id]; var b = bb(id);
    var sc = Math.min(0.42, 56 / Math.max(1, b.width), 46 / Math.max(1, b.height));
    return { x: 44 + i * 64.5, y: 478, s: sc };
  }
  function rest(id, animate) {
    var g = groups[id];
    g.style.transition = animate ? '' : 'none';
    if (st.installed[id]) { g.style.transform = ''; g.classList.remove('on-bench'); }
    else {
      var s = benchSlot(id), c = ctr(id);
      g.style.transform = 'translate(' + (s.x - c[0]) + 'px,' + (s.y - c[1]) + 'px) scale(' + s.s.toFixed(3) + ')';
      g.classList.add('on-bench');
    }
    g.classList.toggle('loose', st.loose === id);
    var tt = g.querySelector('title'); if (tt) tt.textContent = BY[id].name + (st.installed[id] ? (strip ? ': drag it onto the bench' : '') : ': drag it onto the car');
  }
  function assignSlots() {
    var n = 0;
    (strip ? [] : shuffle(PARTS.map(function (p) { return p.id; }))).forEach(function (id) { st.slot[id] = n++; });
  }
  function freeSlot() { var used = {}; PARTS.forEach(function (p) { if (!st.installed[p.id] && st.slot[p.id] !== undefined) used[st.slot[p.id]] = true; }); var i = 0; while (used[i]) i++; return i; }
  function paintAll() { PARTS.forEach(function (p) { rest(p.id, false); var gh = ghost(p.id); gh.style.display = (!st.installed[p.id] && st.phase === 'play' && available(p)) ? '' : 'none'; gh.classList.remove('on'); }); }

  /* ---- rules ---- */
  function available(p) { return p.req.every(function (r) { return st.installed[r]; }) && (!p.last || PARTS.every(function (q) { return q.id === 'battery' || st.installed[q.id]; })); }
  function dependents(id) { return PARTS.filter(function (q) { return q.req.indexOf(id) >= 0 && st.installed[q.id]; }); }
  function checkTool(p) { if (st.tool !== p.tool) { penalty('tool', 'Wrong tool for the ' + p.name.toLowerCase() + '. Check the manual extract and choose the right socket.'); return false; } return true; }
  function tryRemove(id) {
    var p = BY[id];
    if (st.phase !== 'play') { say('Finish the safety preparation first.', 'info'); return false; }
    if (st.loose) { say('Finish tightening the ' + BY[st.loose].name.toLowerCase() + ' first.', 'info'); return false; }
    if (!st.installed[id]) return false;
    if (p.id !== 'battery' && st.installed.battery) { penalty('safety', 'Disconnect the battery before you take anything else off.'); return false; }
    var dep = dependents(id);
    if (dep.length) { penalty('order', 'The ' + p.name.toLowerCase() + ' cannot come off yet: ' + dep.map(function (d) { return d.name.toLowerCase(); }).join(' and ') + ' must come off first.'); return false; }
    if (!checkTool(p)) return false;
    st.installed[id] = false; st.slot[id] = freeSlot();
    say('Removed: ' + p.name + '.', 'good'); return true;
  }
  function tryFit(id) {
    var p = BY[id];
    if (st.phase !== 'play') { say('Finish the safety preparation first.', 'info'); return false; }
    if (st.loose) { say('Finish tightening the ' + BY[st.loose].name.toLowerCase() + ' first.', 'info'); return false; }
    if (st.installed[id]) return false;
    var miss = p.req.filter(function (r) { return !st.installed[r]; });
    if (miss.length) { penalty('order', 'The ' + p.name.toLowerCase() + ' cannot go on yet. Fit the ' + miss.map(function (m) { return BY[m].name.toLowerCase(); }).join(' and the ') + ' first.'); return false; }
    if (p.last && PARTS.some(function (q) { return q.id !== 'battery' && !st.installed[q.id]; })) { penalty('order', 'The battery goes on last, after everything else is fitted and tightened.'); return false; }
    if (!checkTool(p)) return false;
    st.installed[id] = true; st.loose = id; st.torqueOrder = null;
    say('Fitted the ' + p.name.toLowerCase() + '. Now tighten it to the right torque.', 'info'); return true;
  }

  /* ---- dragging ---- */
  function toSvg(e) { var pt = svgEl.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; var m = svgEl.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
  function onDown(e) {
    var g = e.currentTarget, id = g.getAttribute('data-id');
    if (st.phase !== 'play') { say('Finish the safety preparation first, then press Start.', 'info'); return; }
    if (e.button !== undefined && e.button > 0) return;
    st.drag = { id: id, g: g, pid: e.pointerId };
    try { g.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
    g.style.transition = 'none'; g.classList.add('dragging');
    if (!st.installed[id]) { ghost(id).style.display = ''; ghost(id).classList.add('on'); }
    moveTo(e); e.preventDefault();
  }
  function moveTo(e) {
    if (!st.drag) return;
    var id = st.drag.id, p = toSvg(e), c = ctr(id);
    st.drag.g.style.transform = 'translate(' + (p.x - c[0]) + 'px,' + (p.y - c[1]) + 'px)';
    st.drag.last = p;
  }
  function onUp(e) {
    if (!st.drag) return;
    var d = st.drag; st.drag = null;
    try { d.g.releasePointerCapture(d.pid); } catch (x) { /* ignore */ }
    d.g.classList.remove('dragging'); ghost(d.id).classList.remove('on');
    var p = toSvg(e), id = d.id, c = ctr(id);
    if (st.installed[id]) {
      if (p.y > 430) tryRemove(id);
      else if (Math.abs(p.x - c[0]) + Math.abs(p.y - c[1]) > 90) say('Drop the part on the bench to take it off.', 'info');
    } else {
      var near = Math.sqrt((p.x - c[0]) * (p.x - c[0]) + (p.y - c[1]) * (p.y - c[1])) < 70;
      if (near) tryFit(id);
      else if (p.y < 430) {
        var other = PARTS.filter(function (q) { var qc = ctr(q.id); return q.id !== id && Math.sqrt((p.x - qc[0]) * (p.x - qc[0]) + (p.y - qc[1]) * (p.y - qc[1])) < 50; })[0];
        penalty('place', other ? 'That is the place for the ' + other.name.toLowerCase() + ', not the ' + BY[id].name.toLowerCase() + '.' : 'That is not where the ' + BY[id].name.toLowerCase() + ' goes. Look for its dashed outline.');
      }
    }
    paintAll();
    afterChange();
  }
  Array.prototype.forEach.call(svgEl.querySelectorAll('.veh-part'), function (g) {
    g.addEventListener('pointerdown', onDown);
    g.addEventListener('pointermove', moveTo);
    g.addEventListener('pointerup', onUp);
    g.addEventListener('pointercancel', function (e) { if (st.drag) { var d = st.drag; st.drag = null; d.g.classList.remove('dragging'); ghost(d.id).classList.remove('on'); paintAll(); } });
  });

  /* ---- side panel ---- */
  function section(title, kids) { return h('div', { class: 'asm-sec' }, h('h3', null, title), kids); }
  function specTable() { return section('Workshop manual extract', h('table', { class: 'sim-table asm-spec' }, h('tbody', null, SPEC.map(function (r) { return h('tr', null, h('th', { scope: 'row' }, r[0]), h('td', null, r[1]), h('td', null, r[2])); })))); }
  function toolTray() {
    return section('Tool tray' + (st.tool ? ': ' + toolName(st.tool) : ' (choose a tool)'), h('div', { class: 'asm-tools', role: 'radiogroup', 'aria-label': 'Tool tray' }, TOOLS.map(function (t) {
      return h('button', { type: 'button', class: 'asm-tool' + (st.tool === t[0] ? ' sel' : ''), role: 'radio', 'aria-checked': st.tool === t[0] ? 'true' : 'false', 'aria-label': t[1], title: t[1],
        onclick: function () { st.tool = st.tool === t[0] ? null : t[0]; drawSide(); } }, toolIcon(t[0]), h('span', { class: 'asm-tool-cap' }, toolCaption(t[0])));
    })));
  }
  function partList() {
    return section('Parts (or use the buttons instead of dragging)', h('ul', { class: 'asm-parts' }, PARTS.map(function (p) {
      var on = st.installed[p.id];
      var b = h('button', { type: 'button', class: 'asm-partbtn' + (on ? '' : ' bench'), onclick: function () { act(p.id); } }, h('span', null, p.name), h('span', { class: 'asm-state' }, on ? 'fitted: take off' : 'on the bench: fit'));
      b.addEventListener('mouseenter', function () { groups[p.id].classList.add('hl'); }); b.addEventListener('mouseleave', function () { groups[p.id].classList.remove('hl'); });
      return h('li', null, b);
    })));
  }
  function act(id) { var ok = st.installed[id] ? tryRemove(id) : tryFit(id); paintAll(); afterChange(); return ok; }

  function torquePanel() {
    var p = BY[st.loose], v = p.torque;
    var opts = [v, Math.round(v * 0.5) || 1, Math.round(v * 1.8), 'Hand tight'];
    var seen = {}; opts = opts.filter(function (o) { if (seen[o]) return false; seen[o] = true; return true; });
    if (!st.torqueOrder || st.torqueOrder.id !== p.id) st.torqueOrder = { id: p.id, list: shuffle(opts) };
    return section('Tighten the ' + p.name.toLowerCase(), h('div', null, h('p', { class: 'small muted' }, 'Choose the correct setting for the torque wrench.'),
      h('div', { class: 'asm-torque' }, st.torqueOrder.list.map(function (o) {
        return h('button', { type: 'button', class: 'btn small', onclick: function () {
          if (o === v) { say('Correct: ' + v + ' N m.', 'good'); st.loose = null; paintAll(); afterChange(); }
          else penalty('torque', o === 'Hand tight' ? 'Hand tight is not enough. Use the torque wrench.' : (o < v ? o + ' N m is too low and it could work loose.' : o + ' N m is too high and could strip the thread.'));
        } }, o === 'Hand tight' ? o : o + ' N m');
      }))));
  }

  function afterChange() {
    var done = strip ? count() === 0 : count() === PARTS.length && !st.loose;
    drawBanner();
    if (done && st.phase === 'play') { st.phase = 'final'; }
    drawSide();
  }

  function drawPrep() {
    var all = PREP.filter(function (x) { return x.ok; }).every(function (x) { return st.prep[x.id]; });
    side.replaceChildren(h('div', null,
      section(strip ? 'Strip the car' : 'Build the car', h('p', null, strip ? 'The car is complete. Take every part off by dragging it onto the bench, in an order that works.' : 'The frame is bare and the parts are on the bench. Drag each part onto its dashed outline on the frame.')),
      section('Safety preparation', h('div', null, PREP.map(function (x) {
        var id = 'vp-' + x.id, cb = h('input', { type: 'checkbox', id: id, checked: st.prep[x.id] ? true : null });
        cb.addEventListener('change', function () {
          if (!x.ok) { cb.checked = false; if (!st.prep[x.id + '!']) { st.prep[x.id + '!'] = true; penalty('safety', 'Unsafe: ' + x.why); } else say('Unsafe: ' + x.why, 'bad'); return; }
          st.prep[x.id] = cb.checked; drawSide();
        });
        return h('div', { class: 'case-cause' }, cb, h('label', { for: id }, x.label));
      }))),
      h('button', { type: 'button', class: 'btn primary', disabled: all ? null : true, onclick: function () { st.phase = 'play'; assignSlots(); paintAll(); say(strip ? 'Disconnect the battery first, then work down the car.' : 'Start with the big items. The battery goes on last.', 'good'); drawBanner(); drawSide(); } }, 'Start the job'),
      specTable()));
  }
  function finish() {
    st.phase = 'done'; var sc = score(), stars = sc >= 90 ? 3 : sc >= 70 ? 2 : 1;
    var b = best(), key = kind; if ((b[key] || 0) < stars) { b[key] = stars; store.set('kv', KEY, b); }
    var mins = Math.max(1, Math.round((Date.now() - st.start) / 60000)), tips = Object.keys(st.pen).filter(function (k) { return st.pen[k] > 0; });
    side.replaceChildren(h('div', null, h('div', { class: 'asm-sec' }, h('h3', null, 'Job complete'), h('p', { class: 'case-score' }, starText(stars) + '  ' + sc + ' points'), h('p', { class: 'small muted' }, 'Time: about ' + mins + (mins === 1 ? ' minute' : ' minutes')),
      tips.length ? h('div', null, h('h3', null, 'Where you lost points'), h('ul', null, tips.map(function (k) { return h('li', null, h('strong', null, k.charAt(0).toUpperCase() + k.slice(1) + ' (minus ' + st.pen[k] + '): '), PEN_TIP[k]); }))) : h('p', null, 'No mistakes. This is how a careful technician works.'),
      h('div', { class: 'btn-row' }, h('button', { type: 'button', class: 'btn primary', onclick: function () { onExit(); } }, 'Choose another job')))));
    drawBanner();
  }
  function hintBtn() {
    return h('button', { type: 'button', class: 'btn small', onclick: function () { penalty('hint', 'Hint: ' + hint()); } }, icon('flag', 16), 'Hint (minus 1)');
  }
  function hint() {
    if (st.loose) return 'Choose the correct torque for the ' + BY[st.loose].name.toLowerCase() + '.';
    if (strip) {
      if (st.installed.battery) return 'Take the battery off first, with a ' + toolName('sock-10') + '.';
      var n = PARTS.filter(function (p) { return st.installed[p.id] && !dependents(p.id).length; })[0];
      return n ? 'Take off the ' + n.name.toLowerCase() + ' next, with the ' + toolName(n.tool) + '.' : 'All parts are off.';
    }
    var m = PARTS.filter(function (p) { return !st.installed[p.id] && p.req.every(function (r) { return st.installed[r]; }) && (!p.last || PARTS.every(function (q) { return q.id === 'battery' || st.installed[q.id]; })); })[0];
    return m ? 'Fit the ' + m.name.toLowerCase() + ' next, with the ' + toolName(m.tool) + '.' : 'Check which part must go on first.';
  }
  function drawSide() {
    if (st.phase === 'prep') { drawPrep(); return; }
    if (st.phase === 'done') return;
    var kids = [];
    if (st.phase === 'final') {
      kids.push(h('div', { class: 'asm-sec' }, h('h3', null, strip ? 'The car is stripped' : 'The car is built'), h('p', null, strip ? 'Every part is on the bench. A real job would now clean, inspect and label the parts.' : 'Every part is fitted and tightened. A real job would now refill fluids, reconnect and test.'),
        h('button', { type: 'button', class: 'btn primary', onclick: finish }, 'Finish the job')));
    } else {
      if (st.loose) kids.push(torquePanel()); else kids.push(h('div', { class: 'asm-sec' }, h('p', null, strip ? 'Drag a part from the car onto the bench.' : 'Drag a part from the bench onto its dashed outline on the car.'), hintBtn()));
      kids.push(toolTray()); kids.push(partList());
    }
    kids.push(specTable());
    side.replaceChildren(h('div', null, kids));
  }

  assignSlots(); paintAll(); drawBanner(); drawLog(); drawSide();
  return root;
}

export default {
  id: 'vehicle', title: 'Whole vehicle workshop', icon: 'learn',
  blurb: 'A full car frame. Drag parts off the car onto the bench to strip it, or drag them from the bench onto the frame to build it, with the right tools and torques.',
  lesson: ['m02-l7', 'Dismantling, inspecting and reassembling good practice'],
  build: function () {
    var root = h('div', { class: 'asm' });
    function pick() {
      var s = best();
      root.replaceChildren(h('p', null, 'Choose a job on the whole car. You prepare safely, then drag the parts. Mistakes cost points and are explained.'),
        h('div', { class: 'tool-grid studio-grid' },
          [['strip', 'Strip the car', 'The car is complete. Drag every part off the frame onto the bench in a safe order, battery first.'],
           ['build', 'Build the car', 'The frame is bare. Drag every part from the bench onto its dashed outline in a safe order, battery last.']].map(function (j) {
            return h('button', { type: 'button', class: 'hub-card sim-card asm-card', onclick: function () { root.replaceChildren(build(j[0], pick)); } },
              h('h3', null, j[1]), h('p', null, j[2]), h('span', { class: 'case-stars' }, starText(s[j[0]] || 0)), h('span', { class: 'go' }, 'Start', icon('chevron', 16)));
          })));
    }
    pick();
    return root;
  }
};
