/* Diagrams for m18, m19, m20. */
import { DIAGRAMS, wrap, t, badge, box, node } from './core.js';
import { hose, masterCylinder, booster, STEEL, DARK, RUBBER, PAINT_RED } from './parts.js';

/* Annular sector as a polygon. Angles are in degrees, measured clockwise from the top. */
function sector(cx, cy, r1, r2, a0, a1) {
  var pts = [], a, p;
  for (a = a0; a <= a1; a += 6) { p = a * Math.PI / 180; pts.push((cx + r2 * Math.sin(p)).toFixed(1) + ',' + (cy - r2 * Math.cos(p)).toFixed(1)); }
  for (a = a1; a >= a0; a -= 6) { p = a * Math.PI / 180; pts.push((cx + r1 * Math.sin(p)).toFixed(1) + ',' + (cy - r1 * Math.cos(p)).toFixed(1)); }
  return pts.join(' ');
}

/* A zig-zag spring between two points on one level (horizontal span x0..x1), n bends. */
function zig(x0, x1, y, n, amp) {
  var d = 'M' + x0 + ' ' + y, i, step = (x1 - x0) / n;
  for (i = 1; i < n; i++) d += 'L' + (x0 + i * step).toFixed(1) + ' ' + (y + (i % 2 ? -amp : amp));
  return d + 'L' + x1 + ' ' + y;
}

/* ---------------- Wheel alignment angles ---------------- */
DIAGRAMS['alignment-angles'] = {
  caption: 'Camber is the sideways tilt, caster is the forward or backward lean of the steering axis, and toe is how far the fronts of the wheels point in or out.',
  svg: function () {
    var a =
      t(20, 20, 'A. Camber (front view)', 'tb') + t(470, 20, 'Angles exaggerated for clarity', 'ts', 'end') +
      '<path d="M30 112H190" class="k2"/>' +
      '<g transform="rotate(12 110 112)"><rect x="96" y="32" width="28" height="80" rx="6" class="metal-dark"/><rect x="102" y="44" width="16" height="56" class="metal"/></g>' +
      '<path d="M110 26V112" class="centre"/>' +
      '<path d="M110 60A52 52 0 0 1 120.8 61.1" class="k"/>' +
      t(144, 62, 'camber angle', 'ts') +
      t(36, 130, 'Car centre', 'ts') + t(190, 130, 'Outside', 'ts', 'end') +
      t(255, 52, 'Positive camber:', 'tb') + t(255, 70, 'top of the wheel leans out', 'ts') +
      t(255, 98, 'Negative camber:', 'tb') + t(255, 116, 'top of the wheel leans in', 'ts');

    var b =
      t(20, 152, 'B. Caster (side view)', 'tb') +
      '<path d="M70 252H236" class="k2"/>' +
      '<circle cx="150" cy="220" r="32" class="metal-dark"/><circle cx="150" cy="220" r="18" class="metal"/>' +
      '<path d="M128 156V252" class="centre"/>' +
      '<path d="M128 162L160.8 252" class="k bold"/>' +
      '<path d="M128 186A24 24 0 0 1 136.2 184.5" class="k"/>' +
      '<circle cx="160.8" cy="252" r="3.5" class="head"/>' +
      t(146, 172, 'Steering axis', 'ts') + t(118, 182, 'Caster angle', 'ts', 'end') +
      '<path d="M200 240H236" class="k" marker-end="url(#ar)"/>' + t(200, 230, 'Front', 'ts') +
      t(255, 186, 'Positive caster:', 'tb') +
      t(255, 204, 'axis leans back at the top.', 'ts') +
      t(255, 222, 'The wheel trails behind it,', 'ts') +
      t(255, 240, 'like a shopping trolley wheel.', 'ts');

    var c =
      t(20, 272, 'C. Toe (top view)', 'tb') +
      '<g transform="rotate(8 90 326)"><rect x="80" y="300" width="20" height="52" rx="4" class="metal-dark"/></g>' +
      '<g transform="rotate(-8 230 326)"><rect x="220" y="300" width="20" height="52" rx="4" class="metal-dark"/></g>' +
      '<path d="M104 292H216" class="dim" marker-start="url(#ar)" marker-end="url(#ar)"/>' + t(160, 284, 'A', 'tb', 'middle') +
      '<path d="M96 362H224" class="dim" marker-start="url(#ar)" marker-end="url(#ar)"/>' + t(160, 380, 'B', 'tb', 'middle') +
      '<path d="M160 346V312" class="k" marker-end="url(#ar)"/>' + t(170, 334, 'Front', 'ts') +
      t(255, 304, 'Toe-in:', 'tb') + t(255, 322, 'front closer together', 'ts') + t(255, 340, 'than the rear (A < B).', 'ts') +
      t(255, 366, 'Toe-out:', 'tb') + t(255, 384, 'front wider than the', 'ts') + t(255, 402, 'rear (A > B).', 'ts');

    var e =
      t(20, 430, 'What you see when it is wrong', 'tb') +
      t(20, 452, 'Toe wrong: fast wear on the tyre edges (feathering).', 't') +
      t(20, 472, 'Camber wrong: wear on one side of the tread.', 't') +
      t(20, 492, 'Caster: keeps the car straight, helps wheel return.', 't');
    return wrap(480, 504, 'Wheel alignment angles',
      'Three small drawings. Camber: a wheel tilted from the vertical seen from the front. Caster: the steering axis leaning back seen from the side. Toe: two front wheels seen from above with the fronts closer than the rears.',
      a + b + c + e);
  }
};

/* ---------------- MacPherson strut front suspension ---------------- */
DIAGRAMS['macpherson-strut'] = {
  caption: 'The strut is the damper and the spring in one unit. It also holds the top of the wheel, so worn mounts, joints and bushes change the alignment.',
  svg: function () {
    var g = '<g transform="translate(0 16)">';
    g +=
      '<rect x="60" y="18" width="300" height="12" rx="3" style="' + DARK + '"/>' + t(368, 28, 'Body', 'ts') +
      '<path d="M10 304H110" class="k2"/>' +
      /* tyre with tread and a rim */
      '<rect x="22" y="134" width="40" height="170" rx="12" style="' + RUBBER + '"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(function (q) { return '<path d="M26 ' + (146 + q * 10.5) + 'H58" style="stroke:#3a4048;stroke-width:1.6"/>'; }).join('') +
      '<rect x="46" y="156" width="16" height="126" rx="3" style="' + STEEL + '"/>' + t(42, 322, 'Wheel', 'ts', 'middle') +
      /* strut: damper tube with rod, and a coil spring on spring seats */
      '<rect x="102" y="46" width="8" height="42" rx="3" style="fill:#e6eaee;stroke:#59626b"/>' +
      '<rect x="96" y="88" width="20" height="74" rx="4" style="' + DARK + '"/><rect x="99" y="92" width="4" height="64" rx="2" style="fill:#fff;fill-opacity:0.3;stroke:none"/>' +
      '<rect x="80" y="60" width="52" height="6" rx="2" style="' + STEEL + '"/><rect x="80" y="136" width="52" height="6" rx="2" style="' + STEEL + '"/>';
    /* coil spring drawn as a series of coils, shaded */
    var d = '', i, y;
    for (i = 0; i <= 8; i++) { y = 66 + i * 8.6; d += (i ? 'L' : 'M') + (i % 2 ? 124 : 88) + ' ' + y.toFixed(1); }
    g += '<path d="' + d + '" fill="none" stroke="#1d2024" stroke-width="5" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#c0392b" stroke-width="3" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#fff" stroke-opacity="0.4" stroke-width="1" stroke-linejoin="round" transform="translate(0 -1)"/>';
    g +=
      '<rect x="88" y="30" width="36" height="18" rx="4" style="' + DARK + '"/><circle cx="106" cy="39" r="6" style="fill:#e6eaee;stroke:#59626b"/><circle cx="106" cy="39" r="2" style="fill:#2a2f35"/>' +
      /* knuckle, hub and brake disc */
      '<path d="M84 154H118V214H110V258H84Z" style="' + STEEL + '"/>' +
      '<rect x="70" y="140" width="10" height="130" rx="3" style="' + STEEL + '"/><rect x="66" y="196" width="18" height="18" rx="3" style="' + DARK + '"/>' +
      /* lower arm, subframe, bush */
      '<rect x="268" y="236" width="72" height="58" rx="6" style="' + DARK + '"/><path d="M280 246V284M296 246V284M312 246V284" style="stroke:#8d96a0;stroke-width:1;opacity:0.4"/>' + t(304, 312, 'Subframe', 'ts', 'middle') +
      '<path d="M104 263L288 261V277L104 277Z" style="' + STEEL + '"/><path d="M110 266H284" style="stroke:#fff;stroke-width:1.2;opacity:0.6"/>' +
      '<circle cx="290" cy="269" r="11" style="fill:#c0392b;stroke:#5a1510;stroke-width:1.2"/><circle cx="290" cy="269" r="5" style="' + STEEL + '"/>' +
      '<circle cx="101" cy="268" r="9" style="' + STEEL + '"/><circle cx="101" cy="268" r="3.5" style="' + DARK + '"/>' +
      /* tie rod and rack */
      '<path d="M118 190H330" style="stroke:#1d2024;stroke-width:8;stroke-linecap:round"/><path d="M118 190H330" style="stroke:#cfd4da;stroke-width:4;stroke-linecap:round"/>' +
      '<rect x="330" y="178" width="120" height="24" rx="6" style="' + DARK + '"/><rect x="336" y="182" width="108" height="16" rx="4" style="fill:#fff;fill-opacity:0.6;stroke:none"/>' + t(390, 195, 'Steering rack', 'ts', 'middle') +
      '<circle cx="124" cy="190" r="7" style="fill:#c0392b;stroke:#5a1510;stroke-width:1.2"/><circle cx="124" cy="190" r="3" style="' + STEEL + '"/>' +
      /* anti-roll bar */
      '<path d="M215 232H440" style="stroke:#1d2024;stroke-width:7;stroke-linecap:round"/><path d="M428 224L442 232L428 240" style="fill:none;stroke:#1d2024;stroke-width:3;stroke-linecap:round;stroke-linejoin:round"/><path d="M215 232H440" style="stroke:#8d96a0;stroke-width:3.5;stroke-linecap:round"/>' +
      '<path d="M215 232V264" style="stroke:#59626b;stroke-width:4"/><circle cx="215" cy="232" r="5" style="' + STEEL + '"/><circle cx="215" cy="266" r="5" style="' + STEEL + '"/>' +
      t(448, 254, 'to other wheel', 'ts', 'end') +
      /* badges and leaders */
      '<path d="M135 39H124M139 100H126M115 143L136 143M119 170H135M72 276L74 271M122 286L108 275M180 285V277M215 218V228M302 266L300 268M136 205L128 196" class="dim"/>' +
      badge(146, 39, 1) + badge(150, 100, 2) + badge(150, 143, 3) + badge(146, 170, 4) +
      badge(74, 287, 5) + badge(180, 296, 6) + badge(132, 296, 7) + badge(356, 268, 8) +
      badge(215, 206, 9) + badge(150, 212, 10) +
      '<path d="M345 268H300" class="dim"/>';
    g += '</g>';
    var leg = [
      [1, 'Upper mount bearing', 1], [2, 'Coil spring', 0], [3, 'Damper (strut)', 1], [4, 'Steering knuckle', 0], [5, 'Hub and brake disc', 0],
      [6, 'Lower arm (wishbone)', 0], [7, 'Ball joint', 1], [8, 'Arm bush at chassis', 1], [9, 'Anti-roll bar, drop link', 0], [10, 'Tie-rod end', 1]
    ];
    var l = '', k, col, row, x, yy;
    for (k = 0; k < leg.length; k++) {
      col = k < 5 ? 0 : 1; row = k % 5; x = 20 + col * 235; yy = 366 + row * 24;
      l += badge(x + 11, yy - 4, leg[k][0]) + t(x + 28, yy, leg[k][1], 't');
      if (leg[k][2]) l += t(x + (col ? 168 : 175), yy, 'wears', 't-red');
    }
    l += t(20, 494, 'Pink parts are the ones that wear most. Front view, left wheel.', 'ts');
    return wrap(480, 508, 'MacPherson strut front suspension',
      'Front view of a strut suspension: the strut with coil spring and upper mount, the steering knuckle with hub and brake disc, the lower control arm with ball joint and chassis bush, the anti-roll bar with drop link, and the tie rod from the steering rack.',
      t(20, 14, 'Strut front suspension', 'tb') + g + l);
  }
};

/* ---------------- Hydraulic brake circuit ---------------- */
DIAGRAMS['hydraulic-brake-circuit'] = {
  caption: 'Two separate circuits each serve one front and one diagonal rear wheel, so one leak never removes all braking. Hydraulics multiply force: pressure is the same everywhere, so a bigger piston gives more force.',
  svg: function () {
    var s =
      t(240, 17, 'Front of car', 'ts', 'middle') +
      '<rect x="104" y="26" width="272" height="232" rx="26" style="fill:url(#shMetal);fill-opacity:0.18;stroke:#59626b;stroke-width:2"/><rect x="132" y="150" width="216" height="76" rx="14" style="fill:#7fa0b8;fill-opacity:0.13;stroke:none"/>' +
      /* wheels */
      [[64, 128], [394, 128], [64, 193], [394, 193]].map(function (w) {
        var g = '<rect x="' + w[0] + '" y="' + w[1] + '" width="22" height="44" rx="6" style="fill:#1d2024;stroke:#0a0b0d;stroke-width:1.3"/>';
        for (var i = 8; i < 40; i += 6) g += '<path d="M' + (w[0] + 3) + ' ' + (w[1] + i) + 'H' + (w[0] + 19) + '" style="stroke:#3a4048;stroke-width:1.4"/>';
        return g;
      }).join('') +
      '<rect x="88" y="136" width="12" height="28" rx="3" style="' + PAINT_RED + '"/><rect x="380" y="136" width="12" height="28" rx="3" style="' + PAINT_RED + '"/>' +
      '<circle cx="94" cy="215" r="10" style="' + STEEL + '"/><circle cx="386" cy="215" r="10" style="' + STEEL + '"/><circle cx="94" cy="215" r="4" style="' + DARK + '"/><circle cx="386" cy="215" r="4" style="' + DARK + '"/>' +
      t(75, 155, 'FL', 'tb', 'middle').replace('<text', '<text style="fill:#fff;stroke:none;font-size:11px"') + t(405, 155, 'FR', 'tb', 'middle').replace('<text', '<text style="fill:#fff;stroke:none;font-size:11px"') + t(75, 220, 'RL', 'tb', 'middle').replace('<text', '<text style="fill:#fff;stroke:none;font-size:11px"') + t(405, 220, 'RR', 'tb', 'middle').replace('<text', '<text style="fill:#fff;stroke:none;font-size:11px"') +
      t(75, 188, 'Caliper', 'ts', 'middle') + t(405, 188, 'Caliper', 'ts', 'middle') +
      t(75, 253, 'Drum', 'ts', 'middle') + t(405, 253, 'Drum', 'ts', 'middle') +
      /* pedal, booster, master cylinder */
      '<rect x="114" y="46" width="9" height="26" rx="3" style="' + DARK + '"/><path d="M123 59H142M178 59H196" style="stroke:#59626b;stroke-width:4;stroke-linecap:round"/>' +
      booster(160, 59, 21) +
      masterCylinder(196, 48, 76, 22) +
      /* pipes */
      hose('M210 70V108', '#d9534f', 5) + hose('M258 70V108', '#4a90d9', 5) +
      hose('M170 114H116V150H100', '#d9534f', 5) + hose('M310 127H352V215H380', '#d9534f', 5) +
      hose('M310 114H364V150H380', '#4a90d9', 5) + hose('M170 127H128V215H100', '#4a90d9', 5) +
      '<rect x="170" y="108" width="140" height="26" rx="5" style="' + STEEL + '"/><rect x="176" y="112" width="128" height="18" rx="3" style="fill:#fff;fill-opacity:0.7;stroke:none"/>' + t(240, 126, 'ABS / proportioning', 'ts', 'middle') +
      badge(118, 90, 1) + badge(160, 92, 2) + badge(234, 90, 3) + badge(196, 38, 4) +
      t(240, 170, 'Circuit 1: FL + RR', 't-red', 'middle') + t(240, 190, 'Circuit 2: FR + RL', 't-blue', 'middle') +
      t(240, 214, 'If one circuit fails,', 'ts', 'middle') + t(240, 232, 'the other still brakes.', 'ts', 'middle');
    var l =
      badge(31, 278, 1) + t(48, 283, 'Brake pedal', 't') + badge(31, 300, 2) + t(48, 305, 'Vacuum booster', 't') +
      badge(251, 278, 3) + t(268, 283, 'Tandem master cylinder', 't') + badge(251, 300, 4) + t(268, 305, 'Fluid reservoir', 't');
    var p =
      t(20, 346, 'Pressure = force ÷ area', 'tform') +
      t(115, 370, 'Master piston', 'ts', 'middle') + t(115, 386, '10 cm²', 'tb', 'middle') +
      t(330, 370, 'Caliper piston', 'ts', 'middle') + t(330, 386, '30 cm²', 'tb', 'middle') +
      '<rect x="56" y="400" width="118" height="32" rx="5" style="' + STEEL + '"/><rect x="62" y="405" width="106" height="22" rx="3" class="fl-oil"/>' +
      '<rect x="64" y="404" width="9" height="24" rx="2" style="' + DARK + '"/><path d="M40 416H64" style="stroke:#8d96a0;stroke-width:6;stroke-linecap:round"/>' +
      hose('M174 416H258', '#e0b04a', 6) +
      '<rect x="256" y="386" width="148" height="60" rx="6" style="' + STEEL + '"/><rect x="262" y="392" width="136" height="48" rx="4" class="fl-oil"/>' +
      '<rect x="388" y="391" width="10" height="50" rx="2" style="' + DARK + '"/><path d="M398 416H414" style="stroke:#8d96a0;stroke-width:8;stroke-linecap:round"/>' +
      '<path d="M16 416H60" class="k" marker-end="url(#ar)"/>' + t(16, 404, '100 N', 'tb') +
      '<path d="M402 416H462" class="k" marker-end="url(#ar)"/>' + t(410, 408, '300 N', 'tb') +
      t(20, 464, 'Pressure = 100 N ÷ 10 cm² = 10 N per cm²', 't') +
      t(20, 484, 'Caliper force = 10 N per cm² × 30 cm² = 300 N', 't') +
      t(20, 504, 'The piston is 3 times bigger, so the force is 3 times bigger.', 'ts');
    return wrap(480, 516, 'Diagonal-split hydraulic brake circuit',
      'Top view of a car with a brake pedal, vacuum booster and tandem master cylinder feeding two circuits. Circuit 1 serves the front left and rear right wheels, circuit 2 serves the front right and rear left. Below, a small piston pushes fluid onto a piston three times larger and gives three times the force.',
      s + l + p);
  }
};

/* ---------------- Disc and drum brakes ---------------- */
DIAGRAMS['disc-and-drum-brakes'] = {
  caption: 'Both brakes press friction material against a spinning part. A disc is squeezed by two pads; a drum is pushed from inside by two shoes.',
  svg: function () {
    var cx = 365, cy = 142;
    var s = t(10, 22, 'Disc brake (section)', 'tb') + t(250, 22, 'Drum brake (front view)', 'tb');
    /* disc */
    s += '<g transform="translate(14 0)">' +
      '<rect x="40" y="50" width="112" height="8" class="metal-dark"/><rect x="46" y="58" width="14" height="8" class="metal"/>' +
      '<polygon points="46,66 150,66 150,150 140,150 140,80 90,80 90,160 46,160" class="metal"/>' +
      '<rect x="54" y="94" width="36" height="50" class="fl-oil"/><rect x="54" y="94" width="36" height="50" class="k2"/>' +
      '<rect x="70" y="100" width="20" height="38" class="metal-dark"/>' +
      '<rect x="108" y="84" width="14" height="130" class="metal-dark"/>' +
      '<rect x="90" y="88" width="8" height="58" class="metal"/><rect x="98" y="88" width="8" height="58" class="box tint-y"/>' +
      '<rect x="124" y="88" width="8" height="58" class="box tint-y"/><rect x="132" y="88" width="8" height="58" class="metal"/>' +
      '<path d="M-8 118H54" class="pipe oil"/><path d="M-6 118H30" class="k2" marker-end="url(#ar)"/>' + t(-8, 106, 'Fluid in', 'ts') +
      '<path d="M62 186H104" class="k" marker-end="url(#ar)"/><path d="M152 186H126" class="k" marker-end="url(#ar)"/>' +
      '<path d="M135 206H122M157 54H152M41 76H46M66 160V147" class="dim"/>' +
      badge(146, 206, 1) + badge(28, 76, 2) + badge(80, 119, 3, 10) + badge(96, 162, 4, 9) + badge(134, 162, 5, 9) + badge(168, 54, 6) +
      '</g>' +
      t(10, 246, 'Fluid pushes the piston.', 'ts') + t(10, 264, 'The pads squeeze the disc.', 'ts');
    /* drum */
    s += '<path d="M' + (cx + 88) + ' ' + cy + 'A88 88 0 1 1 ' + (cx - 88) + ' ' + cy + 'A88 88 0 1 1 ' + (cx + 88) + ' ' + cy + 'ZM' + (cx + 77) + ' ' + cy + 'A77 77 0 1 0 ' + (cx - 77) + ' ' + cy + 'A77 77 0 1 0 ' + (cx + 77) + ' ' + cy + 'Z" fill-rule="evenodd" class="metal-dark"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="77" class="tint-k-soft"/>' +
      '<polygon points="' + sector(cx, cy, 63, 70, 17, 163) + '" class="metal"/><polygon points="' + sector(cx, cy, 70, 76, 17, 163) + '" class="box tint-y"/>' +
      '<polygon points="' + sector(cx, cy, 63, 70, 197, 343) + '" class="metal"/><polygon points="' + sector(cx, cy, 70, 76, 197, 343) + '" class="box tint-y"/>' +
      '<path d="M' + cx + ' ' + (cy - 70) + 'V' + (cy - 106) + '" class="pipe oil"/>' + t(cx + 12, cy - 100, 'Fluid in', 'ts') +
      '<rect x="' + (cx - 18) + '" y="' + (cy - 70) + '" width="36" height="14" class="metal-dark"/>' +
      '<rect x="' + (cx - 14) + '" y="' + (cy + 55) + '" width="28" height="10" class="metal-dark"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="12" class="box"/>' +
      '<path d="' + zig(cx - 55, cx + 55, cy - 30, 10, 4) + '" class="k2"/>' +
      '<path d="' + zig(cx - 54, cx + 54, cy + 32, 10, 4) + '" class="k2"/>' +
      '<path d="M' + (cx - 8) + ' ' + (cy - 46) + 'H' + (cx - 38) + 'M' + (cx + 8) + ' ' + (cy - 46) + 'H' + (cx + 38) + '" class="k" marker-end="url(#ar)"/>' +
      '<path d="M' + (cx + 34) + ' ' + (cy + 56) + 'L' + (cx + 80) + ' ' + (cy + 100) + '" class="k bold"/>' +
      '<path d="M' + (cx - 96) + ' ' + (cy - 66) + 'L' + (cx - 64) + ' ' + (cy - 60) + 'M' + (cx - 96) + ' ' + (cy + 50) + 'L' + (cx - 70) + ' ' + (cy + 28) + 'M' + (cx + 94) + ' ' + (cy - 12) + 'L' + (cx + 74) + ' ' + (cy - 12) + 'M' + (cx - 30) + ' ' + (cy + 94) + 'L' + (cx - 8) + ' ' + (cy + 66) + 'M' + (cx - 28) + ' ' + (cy - 100) + 'L' + (cx - 14) + ' ' + (cy - 70) + '" class="dim"/>' +
      badge(cx - 108, cy - 70, 7) + badge(cx - 108, cy + 52, 8) + badge(cx + 106, cy - 12, 9) + badge(cx - 36, cy - 106, 10) +
      badge(cx, cy - 30, 11, 9) + badge(cx - 32, cy + 104, 12) + badge(cx + 100, cy + 108, 13) +
      t(250, 276, 'Fluid pushes both shoes out', 'ts') + t(250, 292, 'onto the drum.', 'ts');
    /* legend */
    var leg = [
      [1, 'Disc (rotor)', 1], [2, 'Caliper', 0], [3, 'Piston', 0], [4, 'Inner pad', 1], [5, 'Outer pad', 1],
      [6, 'Slide pin', 0], [7, 'Drum', 1], [8, 'Backing plate', 0], [9, 'Brake shoes', 1], [10, 'Wheel cylinder', 0],
      [11, 'Return springs', 0], [12, 'Adjuster', 0], [13, 'Handbrake lever', 0]
    ];
    var l = '', k, x, yy;
    for (k = 0; k < leg.length; k++) {
      x = 10 + Math.floor(k / 7) * 240; yy = 316 + (k % 7) * 22;
      l += badge(x + 11, yy - 4, leg[k][0], 10) + t(x + 28, yy, leg[k][1], 't');
      if (leg[k][2]) l += t(x + (k < 7 ? 112 : 150), yy, 'wears', 't-red');
    }
    var w =
      '<rect x="10" y="482" width="460" height="86" rx="6" class="box tint-y-soft"/>' +
      t(22, 504, 'Pads: replace at about 2 to 3 mm of lining', 'tb') +
      t(22, 522, '(check the manual). Shoes: replace at the limit in the manual.', 'ts') +
      t(22, 540, 'Disc and drum: the wear limit is stamped on them.', 'ts') +
      t(22, 558, 'Always replace pads or shoes in pairs on one axle.', 'ts');
    return wrap(480, 580, 'Disc brake and drum brake',
      'Left, a disc brake in section: a caliper with a piston pushes two pads onto the disc. Right, a drum brake from the front: a wheel cylinder pushes two shoes out onto the drum, with return springs, an adjuster and a handbrake lever.',
      s + l + w);
  }
};

/* ---------------- SRS (airbag) layout ---------------- */
DIAGRAMS['srs-layout'] = {
  caption: 'Airbags, belt pretensioners and sensors are all wired to one SRS control unit. Treat every part as live: it can fire without warning.',
  svg: function () {
    var s =
      t(120, 16, 'Front', 'ts', 'middle') +
      '<rect x="40" y="24" width="160" height="360" rx="44" class="box"/>' +
      '<rect x="30" y="70" width="14" height="44" rx="3" class="metal-dark"/><rect x="196" y="70" width="14" height="44" rx="3" class="metal-dark"/>' +
      '<rect x="30" y="290" width="14" height="44" rx="3" class="metal-dark"/><rect x="196" y="290" width="14" height="44" rx="3" class="metal-dark"/>' +
      '<rect x="56" y="130" width="128" height="170" rx="14" class="k2"/>' +
      '<rect x="64" y="200" width="36" height="32" rx="5" class="k2"/><rect x="140" y="200" width="36" height="32" rx="5" class="k2"/>' +
      '<rect x="64" y="262" width="112" height="30" rx="5" class="k2"/>' +
      /* sensors, control unit */
      '<rect x="80" y="46" width="14" height="14" class="box tint-c"/><rect x="146" y="46" width="14" height="14" class="box tint-c"/>' +
      '<rect x="46" y="208" width="10" height="14" class="box tint-c"/><rect x="184" y="208" width="10" height="14" class="box tint-c"/>' +
      '<rect x="108" y="208" width="24" height="20" class="box tint-g"/>' +
      /* airbags */
      '<circle cx="82" cy="164" r="12" class="box tint-m"/><rect x="134" y="142" width="44" height="16" rx="4" class="box tint-m"/>' +
      '<rect x="64" y="202" width="6" height="26" class="box tint-m"/><rect x="170" y="202" width="6" height="26" class="box tint-m"/>' +
      '<rect x="57" y="136" width="6" height="156" class="box tint-m"/><rect x="177" y="136" width="6" height="156" class="box tint-m"/>' +
      /* pretensioners, lamp */
      '<rect x="46" y="176" width="10" height="14" class="box tint-y"/><rect x="184" y="176" width="10" height="14" class="box tint-y"/>' +
      '<rect x="66" y="134" width="32" height="10" class="box tint-y"/>' +
      '<path d="M33 225H46M207 225H194M33 183H46M207 183H194M33 268H57M207 268H183" class="dim"/>' +
      badge(120, 53, 1) + badge(120, 247, 2) + badge(82, 190, 3) + badge(156, 172, 4) +
      badge(22, 225, 5) + badge(218, 225, 5) + badge(86, 216, 6) + badge(154, 216, 6) +
      badge(22, 268, 7) + badge(218, 268, 7) + badge(22, 183, 8) + badge(218, 183, 8) + badge(82, 116, 9);
    var items = ['Front crash sensors', 'SRS control unit', 'Driver airbag (wheel)', 'Passenger airbag (dash)', 'Side impact sensors',
      'Side airbags (seat or door)', 'Curtain airbags (roof sides)', 'Seat-belt pretensioners', 'SRS warning lamp (cluster)'];
    var l = '', i;
    for (i = 0; i < items.length; i++) l += badge(256, 34 + i * 24 - 4, i + 1, 10) + t(274, 34 + i * 24 + 1, items[i], 't');
    var wn =
      '<rect x="236" y="254" width="240" height="148" rx="6" class="box tint-m-soft"/>' +
      t(248, 276, 'WARNING', 't-red') +
      t(248, 298, 'Never probe or test SRS', 't') + t(248, 317, 'wiring with a test lamp or', 't') +
      t(248, 336, 'meter. Disconnect the', 't') + t(248, 355, 'battery and wait the time', 't') +
      t(248, 374, 'stated in the workshop', 't') + t(248, 393, 'manual before any work.', 't');
    return wrap(480, 412, 'SRS airbag component locations',
      'Top view of a left-hand-drive car marking the front crash sensors, SRS control unit, driver and passenger airbags, side impact sensors, side and curtain airbags, seat-belt pretensioners and the SRS warning lamp, with a warning not to probe SRS wiring.',
      s + l + wn);
  }
};
