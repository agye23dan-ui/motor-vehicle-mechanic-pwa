/* Diagrams for m16, m17. */
import { DIAGRAMS, wrap, t, badge, box, node } from './core.js';
import { STEEL, DARK, hose } from './parts.js';

/* ---------------- Clutch assembly ---------------- */
DIAGRAMS['clutch-assembly'] = {
  caption: 'With the pedal up the diaphragm spring clamps the disc between the flywheel and the pressure plate, so power flows to the gearbox. Pressing the pedal moves the release bearing, which pulls the pressure plate away and frees the disc.',
  svg: function () {
    var b = '';
    b += '<path d="M20 120H460" class="centre"/>';
    b += '<rect x="22" y="115" width="38" height="10" rx="3" style="' + STEEL + '"/>' + t(4, 108, 'Crank', 'tsm');
    /* flywheel with a toothed ring gear, and the cover bolted to it */
    b += '<rect x="56" y="48" width="36" height="144" rx="4" style="' + STEEL + '"/><rect x="50" y="46" width="8" height="148" rx="2" style="' + DARK + '"/>';
    for (var q = 0; q < 14; q++) b += '<rect x="50" y="' + (52 + q * 10.2).toFixed(1) + '" width="6" height="5" fill="#262a2f"/>';
    /* clutch disc: steel plate with a friction lining on each face and a splined hub */
    b += '<rect x="106" y="54" width="6" height="132" rx="1" style="' + STEEL + '"/><rect x="100" y="56" width="6" height="128" rx="2" style="fill:#3b3834;stroke:#14110f"/><rect x="112" y="56" width="6" height="128" rx="2" style="fill:#3b3834;stroke:#14110f"/>';
    b += '<rect x="102" y="106" width="18" height="28" rx="3" style="' + DARK + '"/>';
    /* pressure plate and cover */
    b += '<rect x="122" y="50" width="22" height="140" rx="4" style="' + DARK + '"/>';
    b += '<path d="M92 40H220V60M92 200H220V180" style="fill:none;stroke:#1d2024;stroke-width:5;stroke-linejoin:round"/><path d="M92 40H220V60M92 200H220V180" style="fill:none;stroke:#aeb5bc;stroke-width:3;stroke-linejoin:round"/>';
    /* diaphragm spring fingers */
    b += '<path d="M144 62L214 100M144 178L214 140" style="stroke:#1d2024;stroke-width:7;stroke-linecap:round"/><path d="M144 62L214 100M144 178L214 140" style="stroke:#c0392b;stroke-width:4;stroke-linecap:round"/>';
    /* release bearing and input shaft */
    b += '<rect x="214" y="100" width="30" height="40" rx="4" style="' + STEEL + '"/><path d="M229 102V138" style="stroke:#59626b;stroke-width:1.2"/>';
    b += '<rect x="116" y="115" width="326" height="10" rx="4" style="' + STEEL + '"/>' + t(440, 108, 'Input shaft to the gearbox', 'tsm', 'end');
    b += badge(74, 30, '1') + badge(109, 30, '2') + badge(133, 30, '3') + badge(190, 30, '4') + badge(229, 82, '5');
    var L = [['1', 'Flywheel (bolted to the crankshaft)'], ['2', 'Clutch disc with friction lining'], ['3', 'Pressure plate'], ['4', 'Diaphragm spring in the cover: clamps the disc'], ['5', 'Release bearing: pressed in by the fork when the pedal is down']];
    L.forEach(function (r, i) { b += badge(24, 226 + i * 22, r[0], 9) + t(42, 230 + i * 22, r[1], 'ts'); });
    b += t(240, 354, 'Hydraulic control (some cars use a cable)', 'tb', 'middle');
    b += '<rect x="30" y="366" width="80" height="34" rx="6" style="' + DARK + '"/><rect x="54" y="360" width="32" height="8" rx="2" style="fill:#15171a"/>' + t(70, 388, 'Pedal', 'tsm', 'middle').replace('<text', '<text style="fill:#fff;stroke:none"');
    b += '<rect x="140" y="366" width="100" height="34" rx="6" style="' + STEEL + '"/><rect x="160" y="356" width="34" height="12" rx="3" style="fill:#e9eef0;stroke:#59626b"/>' + t(190, 380, 'Master', 'tsm', 'middle') + t(190, 394, 'cylinder', 'tsm', 'middle');
    b += '<rect x="270" y="366" width="100" height="34" rx="6" style="' + STEEL + '"/><rect x="360" y="374" width="26" height="18" rx="3" style="' + DARK + '"/>' + t(320, 380, 'Slave', 'tsm', 'middle') + t(320, 394, 'cylinder', 'tsm', 'middle');
    b += box(390, 366, 70, 34) + t(425, 388, 'Fork', 'tsm', 'middle');
    b += '<path d="M110 383H140M240 383H270M370 383H390" class="k" marker-end="url(#ar)"/>';
    return wrap(480, 414, 'Clutch assembly',
      'Side view of a friction clutch: flywheel, clutch disc, pressure plate, diaphragm spring and release bearing, with the hydraulic pedal linkage that operates it.', b);
  }
};

/* ---------------- Manual gearbox power flow ---------------- */
DIAGRAMS['manual-gearbox-power-flow'] = {
  caption: 'In first gear the power path is input shaft, layshaft, first-gear pair, synchroniser sleeve and output shaft. In neutral the layshaft still turns, but no gear is locked to the output shaft.',
  svg: function () {
    function gearbox(y, label, path) {
      var s = t(20, y - 14, label, 'tb');
      // shafts
      s += '<path d="M30 ' + (y + 20) + 'H110" class="k bold"/>' + t(30, y + 10, 'Input', 'tsm');
      s += '<path d="M120 ' + (y + 70) + 'H400" class="k2 bold"/>' + t(405, y + 74, 'Layshaft', 'tsm');
      s += '<path d="M200 ' + (y + 20) + 'H460" class="k bold"/>' + t(462, y + 12, 'Output', 'tsm', 'end');
      // gears: input constant mesh
      s += '<rect x="108" y="' + (y + 4) + '" width="12" height="32" class="metal"/><rect x="118" y="' + (y + 54) + '" width="12" height="32" class="metal"/>';
      // first, second gear pairs
      s += '<rect x="230" y="' + (y + 6) + '" width="12" height="28" class="metal"/><rect x="230" y="' + (y + 56) + '" width="12" height="28" class="metal"/>';
      s += '<rect x="320" y="' + (y + 8) + '" width="12" height="24" class="metal"/><rect x="320" y="' + (y + 58) + '" width="12" height="24" class="metal"/>';
      // synchroniser between 1st and 2nd
      s += '<rect x="262" y="' + (y + 8) + '" width="34" height="24" rx="3" class="box tint-m-soft"/>' + t(279, y + 50, 'Sync', 'tsm', 'middle');
      if (path === 'first') {
        s += '<path d="M60 ' + (y + 20) + 'H112M124 ' + (y + 54) + 'V' + (y + 70) + 'M124 ' + (y + 70) + 'H236M236 ' + (y + 70) + 'V' + (y + 32) + 'M236 ' + (y + 20) + 'H262M296 ' + (y + 20) + 'H440" class="wire-pos" marker-end="url(#ar)"/>';
        s += t(240, y + 100, 'Power: input → layshaft → 1st pair → sleeve → output', 'ts', 'middle');
      } else {
        s += t(240, y + 100, 'Layshaft turns freely. The sleeve is in the middle and locks no gear.', 'ts', 'middle');
        s += '<path d="M60 ' + (y + 20) + 'H112" class="wire-pos" marker-end="url(#ar)"/>';
      }
      s += t(236, y - 2, '1st', 'tsm', 'middle') + t(326, y - 2, '2nd', 'tsm', 'middle');
      return s;
    }
    var b = gearbox(40, 'First gear', 'first') + gearbox(190, 'Neutral', 'neutral');
    return wrap(480, 340, 'Manual gearbox power flow',
      'Simplified gearbox with input shaft, layshaft, output shaft, two gear pairs and a synchroniser sleeve, shown in first gear and in neutral.', b);
  }
};

/* ---------------- Differential ---------------- */
DIAGRAMS['differential'] = {
  caption: 'The crown wheel turns the differential carrier. Driving straight, the spider gears do not turn on their pins. Going round a corner they spin, letting the outer wheel turn faster than the inner one. An open differential sends equal torque to both wheels.',
  svg: function () {
    function gear(cx, cy, r, teeth) {
      var d = '', i;
      for (i = 0; i < teeth; i++) {
        var a0 = i / teeth * Math.PI * 2, a1 = (i + 0.5) / teeth * Math.PI * 2;
        d += (i ? 'L' : 'M') + (cx + Math.cos(a0) * (r - 3)).toFixed(1) + ' ' + (cy + Math.sin(a0) * (r - 3)).toFixed(1) +
          'L' + (cx + Math.cos(a0 + 0.05) * (r + 3)).toFixed(1) + ' ' + (cy + Math.sin(a0 + 0.05) * (r + 3)).toFixed(1) +
          'L' + (cx + Math.cos(a1 - 0.05) * (r + 3)).toFixed(1) + ' ' + (cy + Math.sin(a1 - 0.05) * (r + 3)).toFixed(1) +
          'L' + (cx + Math.cos(a1) * (r - 3)).toFixed(1) + ' ' + (cy + Math.sin(a1) * (r - 3)).toFixed(1);
      }
      return '<path d="' + d + 'Z" class="metal"/>';
    }
    function diff(y, turning, title) {
      var s = t(20, y + 4, title, 'tb');
      var cx = 240, cy = y + 76, spin = turning ? 38 : 0;
      /* axle shafts with splined ends, drawn as shiny steel */
      s += '<rect x="40" y="' + (cy - 5) + '" width="' + (cx - 84) + '" height="10" rx="4" class="metal"/><rect x="' + (cx + 44) + '" y="' + (cy - 5) + '" width="' + (396 - cx) + '" height="10" rx="4" class="metal"/>';
      s += t(40, cy - 14, turning ? 'Inner wheel: slower' : 'Left wheel: same speed', 'tsm') + t(440, cy - 14, turning ? 'Outer wheel: faster' : 'Right wheel: same speed', 'tsm', 'end');
      /* crown wheel (ring gear) and carrier */
      s += gear(cx, cy, 52, 30);
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="44" class="metal-dark"/><circle cx="' + cx + '" cy="' + cy + '" r="38" style="fill:#c9ced3;stroke:#59626b;stroke-width:1.2"/>';
      /* side gears on the axle shafts and spider gears on the cross pin */
      s += '<path d="M' + (cx - 32) + ' ' + (cy - 11) + 'L' + (cx - 14) + ' ' + (cy - 6) + 'V' + (cy + 6) + 'L' + (cx - 32) + ' ' + (cy + 11) + 'Z" class="metal-dark"/>';
      s += '<path d="M' + (cx + 32) + ' ' + (cy - 11) + 'L' + (cx + 14) + ' ' + (cy - 6) + 'V' + (cy + 6) + 'L' + (cx + 32) + ' ' + (cy + 11) + 'Z" class="metal-dark"/>';
      s += '<rect x="' + (cx - 2.5) + '" y="' + (cy - 26) + '" width="5" height="52" rx="2" style="fill:#2a2f35"/>';
      [-1, 1].forEach(function (sg) {
        var yy = cy + sg * 17;
        s += '<g transform="translate(' + cx + ' ' + yy + ') rotate(' + (sg * spin) + ')"><path d="M-10 ' + (-9 * sg) + 'L10 ' + (-9 * sg) + 'L6 ' + (9 * sg) + 'L-6 ' + (9 * sg) + 'Z" class="metal"/>' +
          '<path d="M-7 -3H7M-6 3H6" style="stroke:#59626b;stroke-width:1"/></g>';
      });
      /* pinion shaft and pinion gear meshing with the crown wheel */
      s += '<rect x="' + (cx - 5) + '" y="' + (y + 10) + '" width="10" height="' + (cy - 52 - y - 10) + '" rx="3" class="metal"/><path d="M' + (cx - 14) + ' ' + (cy - 52) + 'L' + (cx + 14) + ' ' + (cy - 52) + 'L' + (cx + 9) + ' ' + (cy - 42) + 'L' + (cx - 9) + ' ' + (cy - 42) + 'Z" class="metal-dark"/>';
      s += t(cx + 22, y + 26, 'Pinion from the propeller shaft', 'tsm');
      s += t(cx + 58, cy + 44, 'Carrier and crown wheel', 'tsm');
      s += turning ? t(cx - 58, cy + 44, 'Spider gears turn', 'tsm', 'end') : t(cx - 58, cy + 44, 'Spider gears do not turn', 'tsm', 'end');
      return s;
    }
    var b = diff(8, false, 'Driving straight ahead') + diff(178, true, 'Going round a corner');
    return wrap(480, 346, 'Open differential',
      'Top view of an open differential. Driving straight, the spider gears do not turn. Cornering, they turn and the outer wheel runs faster than the inner wheel.', b);
  }
};

/* ---------------- Torque converter ---------------- */
DIAGRAMS['torque-converter'] = {
  caption: 'The engine turns the impeller. Fluid thrown off the impeller drives the turbine, which is connected to the transmission. The stator redirects returning fluid and multiplies torque at low speed. The lock-up clutch removes slip at cruising speed.',
  svg: function () {
    var b = '';
    b += '<path d="M30 120H450" class="centre"/>';
    // housing
    b += '<path d="M120 40C60 40 60 200 120 200H360C420 200 420 40 360 40Z" class="box tint-c-soft"/>';
    // impeller (engine side, left) ; turbine (right); stator (centre)
    b += '<path d="M130 52C100 100 100 140 130 188" class="k bold"/><path d="M142 52C112 100 112 140 142 188" class="k bold"/>' + t(128, 30, 'Impeller (pump)', 'tsm', 'middle');
    b += '<path d="M350 52C380 100 380 140 350 188" class="k bold"/><path d="M338 52C368 100 368 140 338 188" class="k bold"/>' + t(354, 30, 'Turbine', 'tsm', 'middle');
    b += '<rect x="228" y="92" width="24" height="56" rx="3" class="box tint-y"/>' + t(240, 84, 'Stator', 'tsm', 'middle');
    // fluid loop
    b += '<path d="M146 70C230 40 300 40 336 70M336 170C300 200 230 200 146 170" class="flow" marker-end="url(#ar)"/>';
    // shafts
    b += '<path d="M30 120H100" class="k bold"/>' + t(26, 108, 'Engine', 'tsm');
    b += '<path d="M380 120H450" class="k bold"/>' + t(454, 108, 'Gearbox', 'tsm', 'end');
    // lock-up clutch
    b += '<rect x="304" y="60" width="10" height="120" rx="2" class="metal-dark"/>' + t(309, 214, 'Lock-up clutch', 'tsm', 'middle');
    // regions
    b += t(20, 250, 'Stall: turbine still, torque multiplied about 2 to 2.5 times', 'ts');
    b += t(20, 270, 'Coupling: turbine near impeller speed, little multiplication', 'ts');
    b += t(20, 290, 'Lock-up: clutch locks the two halves together, no slip', 'ts');
    return wrap(480, 304, 'Torque converter',
      'Cut-away of a torque converter showing the impeller, turbine, stator, fluid path and lock-up clutch.', b);
  }
};
