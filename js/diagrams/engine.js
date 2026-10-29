/* Diagrams for m04 and m05. */
import { DIAGRAMS, wrap, t, badge, box, node } from './core.js';

function P(d, c, extra) { return '<path d="' + d + '" class="' + (c || 'k') + '"' + (extra || '') + '/>'; }
function R(x, y, w, h, c, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" class="' + c + '"/>'; }

/* ---------------- Four-stroke cycle ---------------- */
function strokePanel(x, y, n, title, cap, o) {
  var cx = x + 110, s = '';
  var pt = o.down ? y + 138 : y + 95;           /* piston top */
  var vOpenI = o.intake ? 9 : 0, vOpenE = o.exhaust ? 9 : 0;
  s += t(x + 8, y + 16, n + ' ' + title, 'tb');
  /* gas in the chamber */
  s += R(cx - 45, y + 70, 90, pt - y - 70, o.gas);
  /* head with two ports */
  s += R(cx - 58, y + 44, 116, 26, 'metal');
  s += R(cx - 38, y + 44, 16, 26, 'box');   /* intake port */
  s += R(cx + 22, y + 44, 16, 26, 'box');   /* exhaust port */
  /* cylinder walls */
  s += P('M' + (cx - 45) + ' ' + (y + 70) + 'V' + (y + 178) + 'M' + (cx + 45) + ' ' + (y + 70) + 'V' + (y + 178));
  /* valves: stem and head */
  s += P('M' + (cx - 30) + ' ' + (y + 34) + 'V' + (y + 66 + vOpenI), 'k bold') + R(cx - 40, y + 66 + vOpenI, 20, 5, 'metal-dark', 1.5);
  s += P('M' + (cx + 30) + ' ' + (y + 34) + 'V' + (y + 66 + vOpenE), 'k bold') + R(cx + 20, y + 66 + vOpenE, 20, 5, 'metal-dark', 1.5);
  /* spark plug */
  s += R(cx - 4, y + 28, 8, 42, 'metal-dark') + R(cx - 7, y + 28, 14, 7, 'box');
  if (o.spark) s += '<path d="M' + (cx - 5) + ' ' + (y + 78) + 'L' + (cx + 4) + ' ' + (y + 86) + 'L' + (cx - 4) + ' ' + (y + 92) + 'L' + (cx + 5) + ' ' + (y + 100) + '" class="wire-pos"/>';
  /* piston, rings, rod */
  s += R(cx - 44, pt, 88, 22, 'metal');
  s += P('M' + (cx - 44) + ' ' + (pt + 5) + 'H' + (cx + 44) + 'M' + (cx - 44) + ' ' + (pt + 10) + 'H' + (cx + 44), 'k2');
  s += P('M' + cx + ' ' + (pt + 22) + 'V' + (y + 186), 'k bold');
  s += '<circle cx="' + cx + '" cy="' + (y + 188) + '" r="5" class="box"/>';
  /* gas arrows */
  if (o.intake) s += P('M' + (cx - 30) + ' ' + (y + 22) + 'V' + (y + 42), 'wire-sig', ' marker-end="url(#ar)"');
  if (o.exhaust) s += P('M' + (cx + 30) + ' ' + (y + 46) + 'V' + (y + 20), 'k2', ' marker-end="url(#ar)"');
  /* piston direction */
  var ax = cx + 70;
  s += P('M' + ax + ' ' + (o.down ? y + 105 : y + 150) + 'V' + (o.down ? y + 150 : y + 105), 'k', ' marker-end="url(#ar)"');
  s += t(x + 8, y + 210, cap, 'ts');
  return s;
}
DIAGRAMS['four-stroke-cycle'] = {
  caption: 'Four strokes make one cycle: intake, compression, power, exhaust. Only the power stroke makes force. The other three are driven by the crankshaft and flywheel.',
  svg: function () {
    var b =
      strokePanel(10, 4, 1, 'Intake', 'Piston down, air comes in', { down: true, intake: true, gas: 'fl-cold' }) +
      strokePanel(250, 4, 2, 'Compression', 'Piston up, air squeezed', { gas: 'tint-c' }) +
      strokePanel(10, 224, 3, 'Power', 'Spark, piston pushed down', { down: true, spark: true, gas: 'fl-hot' }) +
      strokePanel(250, 224, 4, 'Exhaust', 'Piston up, gas pushed out', { exhaust: true, gas: 'fl-gas' }) +
      t(240, 460, 'Crankshaft turns 720° for one full cycle', 'tb', 'middle');
    return wrap(480, 472, 'Four-stroke cycle',
      'Four cut-away cylinders show intake, compression, power and exhaust, with valve positions and piston direction.', b);
  }
};

/* ---------------- Engine cross-section ---------------- */
function lead(bx, by, tx, ty, label) {
  var sx = bx < tx ? bx + 11 : bx - 11;
  return P('M' + sx + ' ' + by + 'L' + tx + ' ' + ty, 'k2') + '<circle cx="' + tx + '" cy="' + ty + '" r="2.4" class="head"/>';
}
DIAGRAMS['engine-cross-section'] = {
  caption: 'One cylinder cut open. The piston is pushed down by the burning mixture and turns the crankshaft through the connecting rod.',
  svg: function () {
    var b = '', i, L = [];
    /* block with water jackets, bore, head with ports */
    b += R(100, 112, 140, 150, 'metal');
    b += '<rect x="104" y="116" width="16" height="140" rx="4" style="fill:#7fc4e8;fill-opacity:0.55;stroke:#4a8fb3;stroke-width:1"/><rect x="220" y="116" width="16" height="140" rx="4" style="fill:#7fc4e8;fill-opacity:0.55;stroke:#4a8fb3;stroke-width:1"/>';
    b += '<rect x="125" y="112" width="90" height="150" style="fill:#e9eef1;stroke:#2a2f35;stroke-width:1.4"/><path d="M127 112V262M213 112V262" style="stroke:#9aa3ac;stroke-width:2.5;opacity:0.7"/>';
    b += R(100, 56, 140, 56, 'metal');
    b += '<path d="M100 84Q124 84 128 104" style="fill:none;stroke:#4aa3df;stroke-width:12;stroke-linecap:round;opacity:0.8"/><path d="M240 84Q216 84 212 104" style="fill:none;stroke:#b5543f;stroke-width:12;stroke-linecap:round;opacity:0.8"/>';
    b += R(125, 104, 90, 8, 'box');
    /* crankcase and sump */
    b += P('M100 262L90 300V350M240 262L250 300V350', 'k');
    b += '<path d="M90 350L105 395H235L250 350Z" style="fill:#2c3036;stroke:#101214;stroke-width:1.6"/>';
    b += '<path d="M97 372H243L235 395H105Z" class="fl-oil"/>';
    b += P('M97 372H243', 'k2');
    b += '<rect x="168" y="388" width="14" height="10" rx="2" style="fill:#c8cdd2;stroke:#59626b"/>';
    /* camshafts, valves with springs, plug */
    [130, 210].forEach(function (vx) {
      b += '<ellipse cx="' + vx + '" cy="38" rx="9" ry="12" class="metal-dark"/><circle cx="' + vx + '" cy="40" r="3" style="fill:#cfd4da"/>';
      b += '<path d="M' + vx + ' 49V112" style="stroke:#e6eaee;stroke-width:5;stroke-linecap:round"/><path d="M' + vx + ' 49V112" style="stroke:#59626b;stroke-width:1.2;fill:none"/>';
      b += '<path d="M' + (vx - 9) + ' 114L' + (vx + 9) + ' 114L' + (vx + 4) + ' 108H' + (vx - 4) + 'Z" style="fill:#aeb5bc;stroke:#3b4148;stroke-width:1.2"/>';
      b += '<path d="M' + (vx - 8) + ' 62l16 5-16 5 16 5-16 5 16 5-16 5" style="fill:none;stroke:#7a828a;stroke-width:2.4"/>';
    });
    b += '<rect x="166" y="28" width="8" height="84" rx="2" style="fill:#f1f0ea;stroke:#9aa2aa"/><rect x="160" y="22" width="20" height="9" rx="2" class="metal-dark"/><rect x="167" y="96" width="6" height="16" style="fill:#8d96a0"/>';
    /* piston, rings, pin, rod */
    b += '<rect x="126" y="190" width="88" height="36" rx="3" class="metal"/>';
    b += '<path d="M127 196H213M127 202H213M127 208H213" style="stroke:#2a2f35;stroke-width:1.8"/><path d="M140 226V218H200V226" style="fill:none;stroke:#59626b;stroke-width:1.2"/>';
    b += '<path d="M164 214L162 336L178 336L176 214Z" style="fill:#aeb5bc;stroke:#3b4148;stroke-width:1.4"/>';
    b += '<circle cx="170" cy="212" r="6" style="fill:#4a5058;stroke:#1d2024;stroke-width:1.4"/>';
    /* crankshaft and counterweight */
    b += '<circle cx="170" cy="310" r="22" class="metal"/>';
    b += '<path d="M132 310A38 38 0 0 1 208 310Z" class="metal-dark"/>';
    b += '<circle cx="170" cy="310" r="8" style="fill:#2a2f35;stroke:#8d96a0"/><circle cx="190" cy="336" r="9" style="fill:#aeb5bc;stroke:#3b4148;stroke-width:1.4"/><circle cx="190" cy="336" r="4" style="fill:#4a5058"/>';
    b += '<rect x="208" y="304" width="88" height="12" rx="3" class="metal"/>';
    /* leaders */
    b += lead(50, 38, 121, 38) + lead(50, 72, 128, 72) + lead(50, 104, 110, 104) + lead(50, 150, 108, 150) +
      lead(50, 208, 131, 215) + lead(50, 380, 115, 384) +
      lead(300, 30, 176, 30) + lead(300, 180, 214, 196) + lead(300, 210, 176, 212) + lead(300, 240, 174, 238) +
      lead(300, 272, 196, 288);
    [[50, 38, 2], [50, 72, 3], [50, 104, 4], [50, 150, 5], [50, 208, 6], [50, 380, 12],
     [300, 30, 1], [300, 180, 7], [300, 210, 8], [300, 240, 9], [300, 272, 10], [307, 310, 11]].forEach(function (a) { b += badge(a[0], a[1], a[2]).replace('class="tbadge"', 'class="tbadge"' + (a[2] > 9 ? ' style="font-size:11px"' : '')); });
    var names = ['Spark plug', 'Camshaft', 'Valves', 'Cylinder head', 'Cylinder block', 'Piston',
      'Piston rings', 'Gudgeon pin', 'Connecting rod', 'Crankshaft, counterweight', 'Flywheel end', 'Sump with oil'];
    names.forEach(function (nm, k) {
      var col = k < 6 ? 0 : 1, row = k % 6, x = 20 + col * 240, y = 432 + row * 21;
      b += badge(x + 11, y - 4, k + 1, 9.5).replace('class="tbadge"', 'class="tbadge" style="font-size:' + (k > 8 ? 10 : 11.5) + 'px"') + t(x + 28, y, nm, 'ts');
    });
    return wrap(480, 566, 'Engine cross-section',
      'A cut-away of one cylinder showing the head, valves, camshafts, piston, connecting rod, crankshaft and sump, with a numbered key.', b);
  }
};

/* ---------------- Timing belt drive ---------------- */
/* Belt path round circles. s = +1 belt wraps clockwise, -1 anticlockwise (pulley pressing from outside). */
function beltPath(cs) {
  var n = cs.length, seg = [], i, a, f = function (v) { return v.toFixed(1); };
  for (i = 0; i < n; i++) {
    var c1 = cs[i], c2 = cs[(i + 1) % n];
    var vx = c2.x - c1.x, vy = c2.y - c1.y, D = Math.sqrt(vx * vx + vy * vy);
    var th = Math.atan2(vy, vx) - Math.asin((c2.s * c2.r - c1.s * c1.r) / D);
    var nx = -Math.sin(th), ny = Math.cos(th);
    seg.push({ p1: [c1.x - c1.s * c1.r * nx, c1.y - c1.s * c1.r * ny], p2: [c2.x - c2.s * c2.r * nx, c2.y - c2.s * c2.r * ny] });
  }
  var d = 'M' + f(seg[0].p1[0]) + ' ' + f(seg[0].p1[1]);
  for (i = 0; i < n; i++) {
    var nx2 = (i + 1) % n, c = cs[nx2], A = seg[i].p2, B = seg[nx2].p1;
    var aa = Math.atan2(A[1] - c.y, A[0] - c.x), ab = Math.atan2(B[1] - c.y, B[0] - c.x);
    var sw = c.s > 0 ? ab - aa : aa - ab;
    sw = ((sw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    d += 'L' + f(A[0]) + ' ' + f(A[1]) + 'A' + c.r + ' ' + c.r + ' 0 ' + (sw > Math.PI ? 1 : 0) + ' ' + (c.s > 0 ? 1 : 0) + ' ' + f(B[0]) + ' ' + f(B[1]);
  }
  return d + 'Z';
}
DIAGRAMS['timing-belt-drive'] = {
  caption: 'The belt links the crankshaft to both camshafts so the valves open at the right moment. Fit the belt with every mark lined up, and the tensioner on the slack side.',
  svg: function () {
    var cL = { x: 140, y: 124, r: 36, s: 1 }, cR = { x: 340, y: 124, r: 36, s: 1 }, cr = { x: 240, y: 334, r: 24, s: 1 },
      pu = { x: 350, y: 296, r: 26, s: 1 }, te = { x: 382, y: 224, r: 16, s: -1 }, id = { x: 170, y: 249, r: 14, s: -1 };
    var b = '';
    b += '<path d="' + beltPath([cr, id, cL, cR, te, pu]) + '" class="k bold" style="stroke-width:6;opacity:.75"/>';
    [[cL, 'tint-c-soft'], [cR, 'tint-c-soft'], [cr, 'metal'], [pu, 'tint-c-soft'], [te, 'metal'], [id, 'metal']].forEach(function (a) {
      var c = a[0];
      b += '<circle cx="' + c.x + '" cy="' + c.y + '" r="' + c.r + '" class="box ' + a[1] + '"/><circle cx="' + c.x + '" cy="' + c.y + '" r="3" class="head"/>';
    });
    [cL, cR, cr].forEach(function (c) {
      b += '<polygon points="' + (c.x - 6) + ',' + (c.y - c.r + 16) + ' ' + (c.x + 6) + ',' + (c.y - c.r + 16) + ' ' + c.x + ',' + (c.y - c.r + 5) + '" class="head"/>';
    });
    b += t(140, 76, 'Camshaft pulley', 'ts', 'middle') + t(340, 76, 'Camshaft pulley', 'ts', 'middle');
    b += t(240, 394, 'Crankshaft pulley', 'ts', 'middle');
    b += t(404, 229, 'Tensioner', 'ts') + t(148, 253, 'Idler', 'ts', 'end') + t(388, 334, 'Water pump', 'ts');
    b += t(240, 138, 'Marks must', 'tb', 'middle') + t(240, 156, 'line up', 'tb', 'middle');
    b += P('M217.5 228A26 26 0 1 1 262.5 228', 'k2', ' marker-end="url(#ar)"') + t(240, 258, 'Turns this way', 'ts', 'middle');
    b += R(20, 410, 440, 54, 'bad', 6) + t(240, 434, 'Belt breaks: valves may hit pistons', 'tb', 'middle') + t(240, 453, '(interference engine)', 'ts', 'middle');
    return wrap(480, 478, 'Timing belt drive',
      'Front view of a timing belt running round the crankshaft pulley, two camshaft pulleys, an idler, a tensioner and the water pump, with timing marks on the pulleys.', b);
  }
};

/* ---------------- Oil circuit ---------------- */
function pipe(d, c) { return '<path d="' + d + '" class="pipe ' + (c || 'oil') + '"/>'; }
function fl(d) { return '<path d="' + d + '" class="flow" marker-end="url(#ar)"/>'; }
DIAGRAMS['oil-circuit'] = {
  caption: 'The pump pulls oil from the sump, pushes it through the filter into the main gallery, and it reaches every bearing before draining back. The sender warns if pressure drops.',
  svg: function () {
    var b = '';
    /* sump */
    b += R(20, 398, 200, 56, 'box', 4) + R(20, 398, 200, 56, 'fl-oil', 4);
    b += R(30, 410, 40, 12, 'metal') + t(80, 421, 'Pickup strainer', 'ts') + t(30, 447, 'Oil sump', 'tb');
    /* pipes */
    b += pipe('M50 410V340') + pipe('M70 320H190') + pipe('M110 320V398') + pipe('M210 290V190H420') + pipe('M400 190V100') + pipe('M330 190V230') +
      pipe('M450 70H462V430H220') + pipe('M430 290V430');
    b += fl('M50 404V344') + fl('M72 320H184') + fl('M110 376V394') + fl('M210 284V236') + fl('M240 190H300') + fl('M400 186V108') + fl('M330 186V234') +
      fl('M462 90V220') + fl('M430 300V400') + fl('M330 430H236');
    /* parts */
    b += '<circle cx="50" cy="320" r="20" class="metal"/><circle cx="50" cy="320" r="4" class="head"/>' + t(24, 290, 'Oil pump', 'ts');
    b += R(100, 356, 20, 16, 'metal-dark', 2) + t(126, 368, 'Relief valve', 'ts');
    b += R(190, 290, 40, 60, 'metal', 4) + P('M198 300H222', 'k2') + t(240, 322, 'Oil filter', 'tb') + t(240, 340, 'Bypass valve opens', 'ts') + t(240, 356, 'if filter blocks', 'ts');
    b += R(250, 40, 200, 60, 'box tint-y-soft', 4) + t(350, 66, 'Camshaft bearings', 'tb', 'middle') + t(350, 85, 'and tappets', 'tb', 'middle');
    b += R(270, 230, 180, 60, 'box tint-y-soft', 4) + t(360, 256, 'Crank main and', 'tb', 'middle') + t(360, 275, 'big-end bearings', 'tb', 'middle');
    b += t(330, 178, 'Main oil gallery', 'ts', 'middle');
    /* sender and lamp */
    b += R(244, 166, 12, 22, 'metal-dark', 2) + P('M250 166V120H74', 'wire-sig') + t(162, 112, 'Oil pressure sender', 'ts', 'middle');
    b += '<circle cx="60" cy="120" r="14" class="box bad"/>' + t(60, 126, '!', 'tb', 'middle') + t(60, 152, 'Warning lamp', 'ts', 'middle');
    b += t(310, 418, 'Oil drains back to sump', 'ts', 'middle');
    return wrap(480, 466, 'Engine oil circuit',
      'Oil flows from the sump through the pickup, pump and filter to the main gallery, then to the crankshaft bearings and the camshaft and tappets, and drains back to the sump.', b);
  }
};

/* ---------------- Cooling circuit ---------------- */
DIAGRAMS['cooling-circuit'] = {
  caption: 'Thermostat closed: coolant takes the dashed bypass back to the pump so the engine warms up fast. Thermostat open: hot coolant goes to the radiator and returns cooled.',
  svg: function () {
    var b = '';
    var dash = ' style="stroke-dasharray:9 6"';
    b += pipe('M300 270V236H300V140H400', 'hot') + pipe('M425 296V395H112V328', 'cold') +
      pipe('M150 249V200H50V215', 'hot') + pipe('M50 255V395', 'hot') +
      '<path d="M288 249H112V290" class="pipe hot"' + dash + '/>' +
      pipe('M250 70H425V120', 'cold');
    b += fl('M310 140H392') + fl('M300 232V160') + fl('M425 306V380') + fl('M380 395H130') + fl('M112 385V342') +
      fl('M140 200H62') + fl('M50 262V380') + fl('M240 249H150');
    /* components */
    b += R(130, 270, 200, 80, 'box fl-hot', 4) + t(230, 306, 'Engine water jackets', 'tb', 'middle') + t(230, 326, '(block and head)', 'ts', 'middle');
    b += '<circle cx="112" cy="310" r="18" class="metal"/><circle cx="112" cy="310" r="4" class="head"/>' + t(122, 372, 'Water pump', 'ts');
    b += R(288, 236, 24, 26, 'metal-dark', 3) + t(318, 253, 'Thermostat', 'ts');
    b += R(400, 120, 50, 180, 'box fl-cold', 4) +
      '<text x="430" y="216" class="tb" text-anchor="middle" transform="rotate(-90 430 210)">Radiator</text>';
    b += '<circle cx="360" cy="210" r="22" class="box"/>' + P('M360 192V228M342 210H378M347 197L373 223M373 197L347 223', 'k2') + t(360, 178, 'Fan', 'ts', 'middle');
    b += R(150, 40, 100, 60, 'box fl-cold', 4) + t(200, 66, 'Expansion', 'tb', 'middle') + t(200, 85, 'tank', 'tb', 'middle') +
      R(190, 31, 20, 9, 'metal-dark', 2) + t(180, 38, 'Pressure cap', 'ts', 'end');
    b += R(22, 215, 56, 40, 'box fl-hot', 4) + t(50, 232, 'Heater', 'tsm', 'middle') + t(50, 247, 'core', 'tsm', 'middle');
    b += t(294, 190, 'Top hose', 't-red', 'end') + t(294, 207, '(hot)', 't-red', 'end') + t(156, 264, 'Bypass path', 'ts');
    b += t(268, 414, 'Bottom hose (cool)', 't-blue', 'middle');
    /* key */
    b += '<path d="M20 438H44" class="pipe hot"/>' + t(52, 443, 'Hot', 'ts') + '<path d="M100 438H124" class="pipe cold"/>' + t(132, 443, 'Cooled', 'ts') +
      '<path d="M210 438H234" class="pipe hot"' + dash + '/>' + t(242, 443, 'Bypass, thermostat closed', 'ts');
    return wrap(480, 458, 'Engine cooling circuit',
      'Coolant leaves the water pump, flows through the engine, then either takes the bypass back to the pump or goes through the top hose to the radiator and returns by the bottom hose. A heater core branch and an expansion tank are also shown.', b);
  }
};

/* ---------------- Thermostat operation ---------------- */
DIAGRAMS['thermostat-operation'] = {
  caption: 'A wax pellet inside the thermostat expands as the coolant warms, pushes the valve open and lets coolant reach the radiator. When it is cold the spring closes the valve and the coolant stays in the engine.',
  svg: function () {
    function panel(x, open, title, state, sub) {
      var s = '';
      s += t(x + 85, 18, title, 'tb', 'middle') + t(x + 85, 36, state, open ? 't-red' : 't-blue', 'middle');
      s += '<rect x="' + x + '" y="66" width="170" height="150" rx="6" class="box"/>';
      // seat ring
      s += '<path d="M' + (x + 30) + ' 118H' + (x + 52) + 'M' + (x + 118) + ' 118H' + (x + 140) + '" class="k bold"/>';
      // wax pellet
      s += '<rect x="' + (x + 70) + '" y="132" width="30" height="58" rx="6" class="fl-oil"/><rect x="' + (x + 70) + '" y="132" width="30" height="58" rx="6" class="k"/>';
      s += t(x + 85, 166, 'Wax', 'tsm', 'middle');
      // valve plate and stem
      var vy = open ? 92 : 114;
      s += '<path d="M' + (x + 85) + ' ' + vy + 'V132" class="k bold"/>';
      s += '<rect x="' + (x + 50) + '" y="' + (vy - 6) + '" width="70" height="8" rx="2" class="metal-dark"/>';
      // spring
      s += '<path d="M' + (x + 22) + ' 196l14-10-14-10 14-10-14-10" class="k2"/>' + t(x + 29, 208, 'Spring', 'tsm', 'middle');
      if (open) {
        s += '<path d="M' + (x + 85) + ' 262V220" class="flow" marker-end="url(#ar)"/>' + t(x + 95, 262, 'Hot coolant in', 'tsm');
        s += '<path d="M' + (x + 85) + ' 62V44" class="flow" marker-end="url(#ar)"/>';
        s += '<path d="M' + (x + 60) + ' 142H' + (x + 20) + 'M' + (x + 150) + ' 142H' + (x + 110) + '" class="flow"/>';
      } else {
        s += '<path d="M' + (x + 85) + ' 262V220" class="flow" marker-end="url(#ar)"/>' + t(x + 95, 262, 'Coolant in', 'tsm');
      }
      s += t(x + 85, 286, sub, 'ts', 'middle');
      return s;
    }
    var b = panel(30, false, 'Cold engine', 'Valve closed', 'Coolant stays in the engine') + panel(280, true, 'Hot engine', 'Valve open', 'Coolant goes to the radiator');
    b += t(240, 312, 'Starts to open at about 82 to 95 °C. The value depends on the vehicle.', 'ts', 'middle');
    return wrap(480, 324, 'Thermostat operation',
      'Two cut-away views of a wax thermostat. Cold: the valve is closed and coolant stays in the engine. Hot: the wax has expanded, the valve is open and coolant flows to the radiator.', b);
  }
};
