/* Diagrams for m04 (valvetrain), m17 (planetary gear set) and m18 (steering rack). */
import { DIAGRAMS, wrap, t, badge, box } from './core.js';
import { STEEL, DARK } from './parts.js';

function P(d, c, extra) { return '<path d="' + d + '" class="' + (c || 'k') + '"' + (extra || '') + '/>'; }
function R(x, y, w, h, c, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" class="' + c + '"/>'; }

/* ---------------- Valvetrain ---------------- */
DIAGRAMS['valvetrain'] = {
  caption: 'The cam lobe pushes the valve open through the tappet and the spring closes it again. The small gap between the cam and the tappet is the valve clearance, drawn larger than real so you can see it.',
  svg: function () {
    var b = t(20, 22, 'Overhead camshaft valve (closed)', 'tb'), i;
    /* camshaft with the lobe pointing away from the tappet, so the base circle sits above it */
    b += '<circle cx="130" cy="60" r="24" style="fill:url(#shDark);stroke:#1f2327;stroke-width:1.3"/><path d="M112 52Q130 14 148 52Z" style="fill:url(#shDark);stroke:#1f2327;stroke-width:1.3"/><path d="M118 50Q130 26 142 50" style="fill:none;stroke:#fff;stroke-width:2;opacity:0.35"/>' +
      '<circle cx="130" cy="60" r="5" style="fill:#cfd4da;stroke:#3b4148"/>' +
      P('M92 66A38 38 0 0 1 104 36', 'k2', ' marker-end="url(#ar)"');
    /* clearance gap and tappet */
    b += R(118, 84, 24, 8, 'box tint-m', 0) + '<rect x="100" y="92" width="60" height="34" rx="5" style="fill:url(#shMetal);stroke:#59626b;stroke-width:1.3"/><path d="M104 108H156" style="stroke:#4a5158;stroke-width:1.2"/><rect x="116" y="95" width="28" height="4" rx="2" style="fill:#fff;fill-opacity:0.6"/>';
    /* stem, spring seat, spring */
    var sp = 'M112 142L148 152L112 162L148 172L112 182L148 192L112 202L148 208';
    b += '<rect x="126" y="126" width="8" height="124" rx="3" style="fill:#e6eaee;stroke:#59626b"/><rect x="104" y="134" width="52" height="7" rx="2" style="' + DARK + '"/>' +
      '<path d="' + sp + '" fill="none" stroke="#1d2024" stroke-width="5" stroke-linejoin="round"/><path d="' + sp + '" fill="none" stroke="#c0392b" stroke-width="3" stroke-linejoin="round"/>';
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
    var ringTeeth = '<path d="M202.0 150.0L208.0 152.5L207.9 152.9L201.8 155.0L201.3 160.1L206.9 163.3L206.9 163.7L200.5 165.0L199.4 169.9L204.5 173.9L204.4 174.3L197.9 174.8L196.1 179.5L200.7 184.0L200.5 184.5L194.1 184.1L191.7 188.5L195.6 193.6L195.4 194.0L189.0 192.8L186.1 196.9L189.3 202.5L189.0 202.8L182.9 200.8L179.4 204.4L181.9 210.4L181.6 210.7L175.8 207.9L171.9 211.1L173.5 217.3L173.2 217.6L167.8 214.0L163.5 216.7L164.3 223.1L163.9 223.3L159.1 219.1L154.5 221.1L154.4 227.6L154.0 227.8L149.8 222.9L144.9 224.4L144.1 230.8L143.6 230.9L140.0 225.5L135.1 226.3L133.4 232.6L132.9 232.6L130.0 226.8L125.0 227.0L122.5 233.0L122.1 232.9L120.0 226.8L114.9 226.3L111.7 231.9L111.3 231.9L110.0 225.5L105.1 224.4L101.1 229.5L100.7 229.4L100.2 222.9L95.5 221.1L91.0 225.7L90.5 225.5L90.9 219.1L86.5 216.7L81.4 220.6L81.0 220.4L82.2 214.0L78.1 211.1L72.5 214.3L72.2 214.0L74.2 207.9L70.6 204.4L64.6 206.9L64.3 206.6L67.1 200.8L63.9 196.9L57.7 198.5L57.4 198.2L61.0 192.8L58.3 188.5L51.9 189.3L51.7 188.9L55.9 184.1L53.9 179.5L47.4 179.4L47.2 179.0L52.1 174.8L50.6 169.9L44.2 169.1L44.1 168.6L49.5 165.0L48.7 160.1L42.4 158.4L42.4 157.9L48.2 155.0L48.0 150.0L42.0 147.5L42.1 147.1L48.2 145.0L48.7 139.9L43.1 136.7L43.1 136.3L49.5 135.0L50.6 130.1L45.5 126.1L45.6 125.7L52.1 125.2L53.9 120.5L49.3 116.0L49.5 115.5L55.9 115.9L58.3 111.5L54.4 106.4L54.6 106.0L61.0 107.2L63.9 103.1L60.7 97.5L61.0 97.2L67.1 99.2L70.6 95.6L68.1 89.6L68.4 89.3L74.2 92.1L78.1 88.9L76.5 82.7L76.8 82.4L82.2 86.0L86.5 83.3L85.7 76.9L86.1 76.7L90.9 80.9L95.5 78.9L95.6 72.4L96.0 72.2L100.2 77.1L105.1 75.6L105.9 69.2L106.4 69.1L110.0 74.5L114.9 73.7L116.6 67.4L117.1 67.4L120.0 73.2L125.0 73.0L127.5 67.0L127.9 67.1L130.0 73.2L135.1 73.7L138.3 68.1L138.7 68.1L140.0 74.5L144.9 75.6L148.9 70.5L149.3 70.6L149.8 77.1L154.5 78.9L159.0 74.3L159.5 74.5L159.1 80.9L163.5 83.3L168.6 79.4L169.0 79.6L167.8 86.0L171.9 88.9L177.5 85.7L177.8 86.0L175.8 92.1L179.4 95.6L185.4 93.1L185.7 93.4L182.9 99.2L186.1 103.1L192.3 101.5L192.6 101.8L189.0 107.2L191.7 111.5L198.1 110.7L198.3 111.1L194.1 115.9L196.1 120.5L202.6 120.6L202.8 121.0L197.9 125.2L199.4 130.1L205.8 130.9L205.9 131.4L200.5 135.0L201.3 139.9L207.6 141.6L207.6 142.1L201.8 145.0Z" fill="none" style="stroke:#3b4148;stroke-width:1.2"/>';
    s += '<path d="M' + (cx + 104) + ' ' + cy + 'A104 104 0 1 1 ' + (cx - 104) + ' ' + cy + 'A104 104 0 1 1 ' + (cx + 104) + ' ' + cy + 'ZM' + (cx + 83) + ' ' + cy + 'A83 83 0 1 0 ' + (cx - 83) + ' ' + cy + 'A83 83 0 1 0 ' + (cx + 83) + ' ' + cy + 'Z" fill-rule="evenodd" style="' + STEEL + '"/>' + ringTeeth;
    for (i = 0; i < 3; i++) {
      a = i * 120 * Math.PI / 180; px = cx + 54 * Math.sin(a); py = cy - 54 * Math.cos(a);
      var pg = ''; for (var q = 0; q < 16; q++) { var a0 = q / 16 * 6.2832, a1 = (q + 0.5) / 16 * 6.2832; pg += (q ? 'L' : 'M') + (px + Math.cos(a0) * 23).toFixed(1) + ' ' + (py + Math.sin(a0) * 23).toFixed(1) + 'L' + (px + Math.cos(a0 + 0.03) * 29).toFixed(1) + ' ' + (py + Math.sin(a0 + 0.03) * 29).toFixed(1) + 'L' + (px + Math.cos(a1 - 0.03) * 29).toFixed(1) + ' ' + (py + Math.sin(a1 - 0.03) * 29).toFixed(1) + 'L' + (px + Math.cos(a1) * 23).toFixed(1) + ' ' + (py + Math.sin(a1) * 23).toFixed(1); }
      s += '<path d="M' + cx + ' ' + cy + 'L' + px.toFixed(1) + ' ' + py.toFixed(1) + '" style="stroke:#1d2024;stroke-width:9;stroke-linecap:round"/><path d="M' + cx + ' ' + cy + 'L' + px.toFixed(1) + ' ' + py.toFixed(1) + '" style="stroke:#d9b34a;stroke-width:5;stroke-linecap:round"/>' +
        '<path d="' + pg + 'Z" style="fill:#e7c25a;stroke:#6b5518;stroke-width:1.2"/><circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="15" style="fill:none;stroke:#6b5518;stroke-width:1"/><circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="5" style="' + DARK + '"/>';
    }
    s += '<path d="M150.0 150.0L156.0 150.9L155.4 156.0L149.4 155.6L147.5 160.8L152.5 164.3L149.8 168.6L144.5 165.6L140.6 169.5L143.6 174.8L139.3 177.5L135.8 172.5L130.6 174.4L131.0 180.4L125.9 181.0L125.0 175.0L119.4 174.4L117.2 180.0L112.4 178.3L114.2 172.5L109.4 169.5L105.0 173.6L101.4 170.0L105.5 165.6L102.5 160.8L96.7 162.6L95.0 157.8L100.6 155.6L100.0 150.0L94.0 149.1L94.6 144.0L100.6 144.4L102.5 139.2L97.5 135.7L100.2 131.4L105.5 134.4L109.4 130.5L106.4 125.2L110.7 122.5L114.2 127.5L119.4 125.6L119.0 119.6L124.1 119.0L125.0 125.0L130.6 125.6L132.8 120.0L137.6 121.7L135.8 127.5L140.6 130.5L145.0 126.4L148.6 130.0L144.5 134.4L147.5 139.2L153.3 137.4L155.0 142.2L149.4 144.4Z" style="fill:url(#shDark);stroke:#1f2327;stroke-width:1.2"/><circle cx="' + cx + '" cy="' + cy + '" r="14" style="fill:none;stroke:#8d96a0;stroke-width:1"/><circle cx="' + cx + '" cy="' + cy + '" r="5" style="' + STEEL + '"/>' +
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
