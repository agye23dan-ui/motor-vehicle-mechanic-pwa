/* Diagrams for m04 (valvetrain), m17 (planetary gear set) and m18 (steering rack). */
import { DIAGRAMS, wrap, t, badge, box } from './core.js';

function P(d, c, extra) { return '<path d="' + d + '" class="' + (c || 'k') + '"' + (extra || '') + '/>'; }
function R(x, y, w, h, c, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" class="' + c + '"/>'; }

/* ---------------- Valvetrain ---------------- */
DIAGRAMS['valvetrain'] = {
  caption: 'The cam lobe pushes the valve open through the tappet and the spring closes it again. The small gap between the cam and the tappet is the valve clearance, drawn larger than real so you can see it.',
  svg: function () {
    var b = t(20, 22, 'Overhead camshaft valve (closed)', 'tb'), i;
    /* camshaft with the lobe pointing away from the tappet, so the base circle sits above it */
    b += '<circle cx="130" cy="60" r="24" class="metal-dark"/><path d="M112 52Q130 14 148 52Z" class="metal-dark"/>' +
      '<circle cx="130" cy="60" r="3" class="head"/>' +
      P('M92 66A38 38 0 0 1 104 36', 'k2', ' marker-end="url(#ar)"');
    /* clearance gap and tappet */
    b += R(118, 84, 24, 8, 'box tint-m', 0) + R(100, 92, 60, 34, 'box tint-y-soft', 3);
    /* stem, spring seat, spring */
    b += R(126, 126, 8, 124, 'metal', 0) + R(108, 134, 44, 6, 'metal-dark', 0) +
      P('M112 142L148 152L112 162L148 172L112 182L148 192L112 202L148 208', 'k2');
    /* cylinder head with valve seat, guide and stem seal, then the valve head sitting on its seat */
    b += '<polygon points="40,212 220,212 220,256 166,256 156,248 104,248 94,256 40,256" class="metal"/>' +
      R(122, 206, 16, 44, 'metal-dark', 0) + R(118, 204, 24, 6, 'box tint-m', 0);
    b += '<polygon points="104,248 156,248 166,256 160,262 100,262 94,256" class="box tint-c"/>';
    b += t(130, 296, 'Combustion chamber', 'ts', 'middle');
    b += '<path d="M81 42L108 52M169 114H160M169 84H142M175 175H150M91 132H126M229 226H138M47 272L94 256M213 280L166 260" class="dim"/>' +
      badge(70, 40, 1) + badge(180, 114, 2) + badge(180, 84, 3) + badge(186, 175, 4) + badge(80, 132, 5) +
      badge(240, 226, 6) + badge(36, 282, 7) + badge(224, 282, 8);
    var L = ['Camshaft lobe', 'Tappet (cam follower)', 'Valve clearance (gap)', 'Valve spring', 'Valve stem', 'Guide and stem seal', 'Valve seat', 'Valve head (face)'];
    for (i = 0; i < 8; i++) b += badge(300, 56 + i * 28, i + 1, 10) + t(318, 61 + i * 28, L[i], 't');
    b += R(20, 318, 440, 78, 'box tint-y-soft', 6) +
      t(34, 342, 'Valve clearance is a small gap, set on a cold engine.', 'tb') +
      t(34, 364, 'Too small: the valve cannot close fully, so it burns.', 'ts') +
      t(34, 384, 'Too large: tapping noise and less valve lift.', 'ts');
    return wrap(480, 410, 'Valvetrain of an overhead camshaft engine',
      'Side section of one valve: a camshaft lobe above a tappet with a small gap, a valve stem with a spring, a guide and stem seal in the cylinder head, and the valve head seated in the cylinder head.', b);
  }
};

/* ---------------- Planetary gear set ---------------- */
DIAGRAMS['planetary-gearset'] = {
  caption: 'One planetary set gives different ratios depending on which part is held, which is driven and which is the output. Clutches and bands do the holding and driving.',
  svg: function () {
    var cx = 125, cy = 150, s = t(20, 22, 'Planetary gear set', 'tb') + t(256, 22, 'How the ratio changes', 'tb'), i, a, px, py;
    /* ring gear as an annulus, then the planets with their carrier arms, then the sun */
    s += '<path d="M' + (cx + 104) + ' ' + cy + 'A104 104 0 1 1 ' + (cx - 104) + ' ' + cy + 'A104 104 0 1 1 ' + (cx + 104) + ' ' + cy +
      'ZM' + (cx + 80) + ' ' + cy + 'A80 80 0 1 0 ' + (cx - 80) + ' ' + cy + 'A80 80 0 1 0 ' + (cx + 80) + ' ' + cy + 'Z" fill-rule="evenodd" class="metal"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="80" class="k2" fill="none" stroke-dasharray="3 3"/>';
    for (i = 0; i < 3; i++) {
      a = i * 120 * Math.PI / 180; px = cx + 54 * Math.sin(a); py = cy - 54 * Math.cos(a);
      s += '<path d="M' + cx + ' ' + cy + 'L' + px.toFixed(1) + ' ' + py.toFixed(1) + '" class="k bold"/>' +
        '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="26" class="box tint-y"/>' +
        '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="4" class="head"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="28" class="metal-dark"/><circle cx="' + cx + '" cy="' + cy + '" r="4" class="head"/>' +
      badge(cx, cy + 14, 'A') + badge(cx, cy - 68, 'B') + badge(cx + 54 * Math.sin(2.0944), cy - 54 * Math.cos(2.0944), 'C') + badge(cx, cy - 92, 'D');
    var leg = [['A', 'Sun gear'], ['B', 'Planet gears'], ['C', 'Carrier'], ['D', 'Ring gear']];
    for (i = 0; i < 4; i++) s += badge(26 + (i % 2) * 124, 290 + Math.floor(i / 2) * 24, leg[i][0], 10) + t(44 + (i % 2) * 124, 295 + Math.floor(i / 2) * 24, leg[i][1], 't');
    var C = [
      ['Ring held, sun drives', 'Carrier is the output', 'Large reduction (low gear)', 'tint-y'],
      ['Sun held, ring drives', 'Carrier is the output', 'Smaller reduction', 'tint-y-soft'],
      ['Carrier held, sun drives', 'Ring is the output', 'Reverse (opposite way)', 'tint-m-soft'],
      ['Any two parts locked together', 'The whole set turns as one', 'Direct drive 1:1', 'tint-g']
    ];
    for (i = 0; i < 4; i++) {
      var y = 36 + i * 68;
      s += box(256, y, 216, 60, C[i][3]) + t(266, y + 18, C[i][0], 'tsm') + t(266, y + 35, C[i][1], 'ts') + t(266, y + 52, C[i][2], 'tb');
    }
    return wrap(480, 336, 'Planetary gear set',
      'A sun gear in the centre, three planet gears on a carrier, and a ring gear around them, with four cards saying which part is held and driven for low gear, a smaller reduction, reverse and direct drive.', s);
  }
};

/* ---------------- Steering rack and power assistance ---------------- */
DIAGRAMS['steering-rack'] = {
  caption: 'Turning the wheel turns the pinion, which slides the rack sideways. The tie rods push and pull the wheels round. Hydraulic and electric assist are shown together here, but a car has one or the other.',
  svg: function () {
    var s = '<ellipse cx="240" cy="30" rx="40" ry="10" class="k bold" fill="none"/>' +
      '<rect x="234" y="40" width="12" height="94" class="metal"/>' +
      '<rect x="12" y="116" width="24" height="64" rx="4" class="rubber"/><rect x="444" y="116" width="24" height="64" rx="4" class="rubber"/>' +
      '<path d="M46 148H80M400 148H434M36 148H46M434 148H444" class="k bold"/>' +
      '<circle cx="46" cy="148" r="6" class="box tint-y"/><circle cx="434" cy="148" r="6" class="box tint-y"/>' +
      '<rect x="80" y="134" width="36" height="28" class="box tint-k-soft"/><rect x="364" y="134" width="36" height="28" class="box tint-k-soft"/>' +
      '<path d="M90 134V162M100 134V162M110 134V162M370 134V162M380 134V162M390 134V162" class="k2"/>' +
      '<rect x="116" y="124" width="248" height="48" class="metal"/>' +
      '<rect x="116" y="146" width="248" height="16" class="metal-dark"/>' +
      '<path d="M204 146V151M212 146V151M220 146V151M228 146V151M236 146V151M244 146V151M252 146V151M260 146V151M268 146V151M276 146V151" class="k2"/>' +
      /* hydraulic assist piston on the rack */
      '<rect x="296" y="124" width="62" height="48" class="box tint-c-soft"/><rect x="324" y="124" width="6" height="48" class="metal-dark"/>' +
      '<path d="M306 124V108M348 124V108" class="pipe oil"/>' +
      /* pinion */
      '<circle cx="240" cy="138" r="16" class="box tint-y"/><circle cx="240" cy="138" r="3" class="head"/>' +
      /* electric assist motor and torque sensor on the column */
      '<rect x="252" y="68" width="48" height="30" rx="4" class="box tint-c"/>' + t(276, 88, 'M', 'tb', 'middle') +
      '<rect x="231" y="100" width="18" height="10" class="box tint-m"/>' +
      '<path d="M170 200H300" class="k" marker-end="url(#ar)"/><path d="M300 200H170" class="k" marker-end="url(#ar)"/>' +
      t(240, 222, 'The rack moves sideways as the pinion turns', 'ts', 'middle') +
      t(362, 116, 'Fluid from pump', 'ts');
    s += '<path d="M289 30H282M210 106L228 126M150 185V164M340 185V172M309 84H300M88 117V134M70 185V150M36 111L44 142" class="dim"/>' +
      badge(300, 30, 1) + badge(200, 100, 2) + badge(150, 196, 3) + badge(340, 196, 4) + badge(320, 84, 5) + badge(88, 106, 6) + badge(70, 196, 7) + badge(30, 100, 8);
    var L = ['Steering wheel and column', 'Pinion (small gear)', 'Rack (toothed bar)', 'Hydraulic assist piston', 'Electric assist motor (EPS)', 'Boot over the inner joint', 'Tie rod', 'Tie-rod end (sets the toe)'], i;
    for (i = 0; i < 8; i++) s += badge(30 + Math.floor(i / 4) * 220, 256 + (i % 4) * 26, i + 1, 10) + t(48 + Math.floor(i / 4) * 220, 261 + (i % 4) * 26, L[i], 't');
    s += box(20, 372, 440, 44, 'tint-m-soft') + t(240, 390, 'Never weld or heat bent or cracked steering parts', 'tb', 'middle') + t(240, 408, 'Replace them', 'ts', 'middle');
    return wrap(480, 428, 'Rack and pinion steering',
      'Top view of a steering system: steering wheel and column down to a pinion that meshes with a rack in a housing, with boots, tie rods and tie-rod ends to the two front wheels, plus a hydraulic assist piston on the rack and an electric assist motor on the column.', s);
  }
};
