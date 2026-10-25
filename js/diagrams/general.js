/* Diagrams for m01, m02, m03, m21. */
import { DIAGRAMS, wrap, t, badge, box, node } from './core.js';


/* ---------------- Lift points ---------------- */
DIAGRAMS['lift-points'] = {
  caption: 'Lift and support only at the marked points. A jack lifts the car; axle stands hold it. Chock the wheels that stay on the ground and set the handbrake.',
  svg: function () {
    var s =
      t(240, 18, 'FRONT', 'ts', 'middle') +
      '<rect x="180" y="28" width="120" height="210" rx="22" class="metal"/>' +
      '<rect x="160" y="48" width="20" height="50" rx="4" class="rubber"/><rect x="300" y="48" width="20" height="50" rx="4" class="rubber"/>' +
      '<rect x="160" y="168" width="20" height="50" rx="4" class="rubber"/><rect x="300" y="168" width="20" height="50" rx="4" class="rubber"/>' +
      '<path d="M240 28V238" class="centre"/>';
    var pts = [[184, 114, 140], [184, 152, 140], [296, 114, 340], [296, 152, 340]], i, n = [1, 2, 3, 4];
    for (i = 0; i < 4; i++) {
      var p = pts[i], x1 = p[2] < 240 ? p[2] + 11 : p[2] - 11;
      s += '<path d="M' + x1 + ' ' + p[1] + 'H' + p[0] + '" class="dim"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" class="box tint-y"/>' + badge(p[2], p[1], n[i]);
    }
    s += badge(240, 70, 'J') + badge(240, 196, 'J');
    s +=
      t(24, 272, '1 to 4', 'tb') + t(90, 272, 'Lift points on the sill seam', 't') +
      t(24, 296, 'J', 'tb') + t(90, 296, 'Centre point: jack only, if allowed', 't') +
      t(24, 320, 'Stand', 'tb') + t(90, 320, 'Under points 1 to 4 or the axle points', 't') +
      box(20, 338, 440, 52, 'tint-m-soft') +
      t(240, 360, 'Use the points in the workshop manual', 'tb', 'middle') +
      t(240, 380, 'Never work under a car held only by a jack', 'ts', 'middle');
    // side view inset
    s += t(24, 424, 'Side view: safe set-up', 'tb') +
      '<path d="M20 510H460" class="k2"/>' +
      '<rect x="100" y="446" width="240" height="40" rx="12" class="metal"/>' +
      '<circle cx="150" cy="476" r="20" class="rubber"/><circle cx="150" cy="476" r="8" class="box"/>' +
      '<circle cx="290" cy="490" r="20" class="rubber"/><circle cx="290" cy="490" r="8" class="box"/>' +
      '<polygon points="205,510 227,510 222,490 210,490" class="metal-dark"/><rect x="203" y="486" width="26" height="4" class="metal-dark"/>' +
      '<polygon points="262,510 279,510 276,503" class="metal-dark"/><polygon points="301,510 318,510 304,503" class="metal-dark"/>' +
      t(216, 532, 'Axle stand', 'ts', 'middle') + t(290, 532, 'Chocks', 'ts', 'middle') +
      t(354, 470, 'Handbrake on', 'tb') + t(240, 560, 'Chock the wheels that stay on the ground', 'ts', 'middle');
    return wrap(480, 572, 'Vehicle lift and support points',
      'A car seen from below with four numbered lift points on the sill seam and two central jack points, and a side view with an axle stand, wheel chocks and the handbrake on.', s);
  }
};

/* ---------------- Micrometer reading ---------------- */
DIAGRAMS['micrometer-reading'] = {
  caption: 'Read the sleeve first (whole and half millimetres), then add the thimble line that sits on the datum line, each division being 0.01 mm.',
  svg: function () {
    var s = t(120, 34, 'Sleeve', 'tb', 'middle') + t(300, 34, 'Thimble', 'tb', 'middle') +
      '<rect x="40" y="70" width="209" height="60" class="box"/>' +
      '<path d="M40 100H249" class="k"/>', i;
    for (i = 0; i <= 7; i++) {
      var x = 60 + i * 24;
      s += '<path d="M' + x + ' 100V86" class="k"/>';
      if (i === 0 || i === 5) s += t(x, 82, i, 'ts', 'middle');
    }
    for (i = 0; i <= 7; i++) {
      var xh = 72 + i * 24;
      s += '<path d="M' + xh + ' 100V109" class="k2"/>';
    }
    s += '<path d="M240 100V109" class="k bold"/>';
    // thimble
    s += '<rect x="249" y="46" width="100" height="108" rx="6" class="box tint-c-soft"/><rect x="349" y="70" width="26" height="60" rx="6" class="box"/>';
    for (i = 28; i <= 48; i++) {
      var y = 100 + (i - 38) * 5, major = i % 5 === 0;
      s += '<path d="M249 ' + y + 'H' + (major ? 266 : 258) + '" class="k2"/>';
      if (major) s += t(274, y + 5, i, 'ts');
    }
    s += '<path d="M249 100H270" class="k bold"/><path d="M270 100H380" class="dim"/>' + t(384, 105, 'Line 38', 't-red') +
      '<path d="M200 170L240 134" class="k2" marker-end="url(#ar)"/>' + t(130, 186, 'Sleeve shows 7.5', 't');
    // worked sum
    s += t(240, 226, 'Worked reading', 'tb', 'middle') +
      box(30, 242, 120, 62, 'tint-c') + t(90, 262, 'Sleeve', 'tb', 'middle') + t(90, 292, '7.50 mm', 'tform', 'middle') +
      t(165, 282, '+', 'tform', 'middle') +
      box(180, 242, 120, 62, 'tint-y') + t(240, 262, 'Thimble', 'tb', 'middle') + t(240, 292, '0.38 mm', 'tform', 'middle') +
      t(315, 282, '=', 'tform', 'middle') +
      box(330, 242, 120, 62, 'tint-g') + t(390, 262, 'Reading', 'tb', 'middle') + t(390, 292, '7.88 mm', 'tform', 'middle') +
      t(30, 334, 'Sleeve: 7 mm mark plus the 0.5 mm mark showing = 7.50', 'ts') +
      t(30, 356, 'Thimble: line 38 on the datum line = 38 × 0.01 = 0.38', 'ts') +
      t(30, 378, 'One full turn of the thimble = 0.5 mm (50 divisions)', 'ts');
    return wrap(480, 392, 'Reading an outside micrometer',
      'An enlarged micrometer sleeve and thimble. The sleeve shows 7.5 mm and thimble line 38 meets the datum line, giving 7.88 millimetres.', s);
  }
};

/* ---------------- Tightening sequence ---------------- */
DIAGRAMS['tightening-sequence'] = {
  caption: 'Tighten in the order shown so the part pulls down evenly. Go round the pattern three times, raising the torque each time.',
  svg: function () {
    var s = t(120, 24, '4-bolt flange', 'tb', 'middle') + t(345, 24, '10-bolt cylinder head', 'tb', 'middle') +
      '<circle cx="120" cy="110" r="70" class="metal"/><circle cx="120" cy="110" r="22" class="box"/>' +
      '<circle cx="120" cy="110" r="50" class="centre"/>' +
      '<path d="M85 75L155 145M155 75L85 145" class="flow"/>';
    var fb = [[85, 75, 1], [155, 75, 3], [155, 145, 2], [85, 145, 4]], i;
    for (i = 0; i < 4; i++) s += badge(fb[i][0], fb[i][1], fb[i][2], 12);
    s += '<rect x="235" y="68" width="220" height="84" rx="14" class="metal"/>';
    var cols = [262, 303.5, 345, 386.5, 428], order = [[3, 'T', 1], [3, 'B', 2], [2, 'B', 3], [2, 'T', 4], [4, 'T', 5], [4, 'B', 6], [1, 'B', 7], [1, 'T', 8], [5, 'T', 9], [5, 'B', 10]];
    for (i = 0; i < order.length; i++) {
      s += badge(cols[order[i][0] - 1], order[i][1] === 'T' ? 92 : 128, order[i][2], 12);
    }
    s += '<path d="M345 170H270" class="k2" marker-end="url(#ar)"/><path d="M345 170H420" class="k2" marker-end="url(#ar)"/>' +
      t(120, 212, 'Cross pattern', 'tb', 'middle') + t(345, 212, 'Centre outwards', 'tb', 'middle') +
      t(120, 232, 'Opposite bolts: 1, 2, 3, 4', 'ts', 'middle') + t(345, 232, 'Spiral out, 1 to 10', 'ts', 'middle');
    var st = [['Stage 1', 'Snug', 'tint-c'], ['Stage 2', 'Half torque', 'tint-y'], ['Stage 3', 'Full torque', 'tint-g']];
    for (i = 0; i < 3; i++) {
      var x = 20 + i * 155;
      s += box(x, 262, 130, 52, st[i][2]) + t(x + 65, 284, st[i][0], 'tb', 'middle') + t(x + 65, 304, st[i][1], 't', 'middle');
      if (i < 2) s += '<path d="M' + (x + 134) + ' 288H' + (x + 151) + '" class="k" marker-end="url(#ar)"/>';
    }
    s += t(240, 342, 'Check the manual for the order and torque values', 'ts', 'middle');
    return wrap(480, 356, 'Bolt tightening sequences',
      'A four-bolt flange tightened in a cross pattern 1, 2, 3, 4 and a ten-bolt cylinder head tightened from the centre outwards, with three torque stages: snug, half torque, full torque.', s);
  }
};

/* ---------------- Tyre markings ---------------- */
DIAGRAMS['tyre-markings'] = {
  caption: 'The size code 205/55 R16 tells you the width, the sidewall height, the build, the rim size, and the load and speed ratings.',
  svg: function () {
    var s = box(20, 16, 440, 50, 'tint-k-soft') +
      t(70, 50, '205', 'tform', 'middle') + t(118, 50, '/', 'tform', 'middle') + t(160, 50, '55', 'tform', 'middle') +
      t(235, 50, 'R', 'tform', 'middle') + t(290, 50, '16', 'tform', 'middle') + t(360, 50, '91', 'tform', 'middle') + t(420, 50, 'V', 'tform', 'middle');
    var xs = [70, 160, 235, 290, 360, 420], lines = ['Section width: 205 mm', 'Aspect ratio: height is 55% of width', 'R = radial construction', 'Rim diameter: 16 inches', 'Load index: 91', 'Speed rating: V (up to 240 km/h)'], i;
    for (i = 0; i < 6; i++) {
      s += '<path d="M' + xs[i] + ' 66V82" class="dim"/>' + badge(xs[i], 94, i + 1, 11) +
        badge(30, 138 + i * 24, i + 1, 10) + t(50, 143 + i * 24, lines[i], 't');
    }
    // cross-section
    s += t(240, 292, 'Section width 205 mm', 'tb', 'middle') +
      '<path d="M190 302H290" class="dim" marker-end="url(#ar)" marker-start="url(#ar)"/>' +
      '<rect x="190" y="310" width="100" height="55" rx="14" class="rubber"/><rect x="206" y="324" width="68" height="41" class="box"/>' +
      '<rect x="213" y="365" width="54" height="11" class="metal-dark"/>' +
      '<path d="M174 310V365" class="dim" marker-end="url(#ar)" marker-start="url(#ar)"/>' +
      t(166, 332, 'Sidewall', 'ts', 'end') + t(166, 350, '55% of width', 'ts', 'end') +
      '<path d="M270 372H304" class="k2"/>' + t(310, 377, 'Rim, 16 in', 'ts') +
      t(240, 414, 'DOT date code: four digits = week and year', 'tb', 'middle') +
      t(240, 434, 'Example: 3523 = week 35 of 2023', 'ts', 'middle');
    return wrap(480, 448, 'Tyre size markings',
      'The marking 205/55 R16 91 V with six numbered parts explained below, and a tyre cross-section showing section width and sidewall height.', s);
  }
};

/* ---------------- Underbonnet layout ---------------- */
DIAGRAMS['underbonnet-layout'] = {
  caption: 'A typical engine bay seen from above. Layout varies from car to car, so find each part on your own vehicle first.',
  svg: function () {
    var s = t(240, 16, 'FRONT', 'ts', 'middle') +
      '<rect x="90" y="22" width="300" height="240" rx="16" class="k2"/>' +
      '<path d="M90 262H390" class="k bold"/>' + t(240, 282, 'Bulkhead (windscreen side)', 'ts', 'middle') +
      box(104, 30, 272, 26, 'tint-c-soft') + badge(240, 43, 8) +
      box(108, 68, 38, 38, 'tint-c') + badge(127, 87, 2) +
      box(108, 150, 38, 50, 'tint-c-soft') + badge(127, 175, 5) +
      '<rect x="160" y="70" width="138" height="136" rx="6" class="metal"/>' + badge(200, 104, 1) +
      '<rect x="330" y="66" width="42" height="38" rx="4" class="zone"/>' + badge(351, 85, 7) +
      box(318, 116, 58, 64, 'tint-k-soft') + badge(347, 148, 6) +
      box(108, 214, 64, 38, 'tint-m-soft') + badge(140, 233, 4) +
      box(262, 220, 56, 32, 'tint-y-soft') + badge(290, 236, 9) +
      '<rect x="346" y="232" width="22" height="30" class="metal"/><rect x="338" y="206" width="38" height="28" rx="3" class="box tint-y-soft"/>' + badge(357, 220, 3);
    var L = ['Engine oil filler cap and dipstick', 'Coolant expansion tank', 'Brake fluid reservoir (on master cylinder)', 'Battery', 'Windscreen washer reservoir', 'Air filter box', 'Power steering reservoir (if fitted)', 'Radiator (at the front)', 'Fuse box'], i;
    for (i = 0; i < 9; i++) s += badge(30, 318 + i * 24, i + 1, 10) + t(50, 323 + i * 24, L[i], 't');
    return wrap(480, 536, 'Generic engine bay layout',
      'A top-down outline of an engine bay with nine numbered parts: oil filler, coolant tank, brake fluid reservoir, battery, washer reservoir, air filter box, power steering reservoir, radiator and fuse box.', s);
  }
};

/* ---------------- Diagnostic flow ---------------- */
DIAGRAMS['diagnostic-flow'] = {
  caption: 'Work through the steps in order. Do not jump to replacing parts: test first, and always confirm the repair.',
  svg: function () {
    var T = ['Verify the complaint', 'Gather information', 'Check the obvious', 'Test and isolate', 'Repair', 'Confirm the repair'],
      E = [['Repeat the fault.', 'Ask the driver.'], ['Codes, history,', 'service records'], ['Fluids, fuses,', 'connections, battery'], ['Measure and test.', 'Narrow it down.'], ['Fix the cause,', 'not the symptom.'], ['Re-test and road', 'test. Check codes.']],
      C = ['tint-c-soft', 'tint-c', 'tint-y-soft', 'tint-y', 'tint-m-soft', 'tint-g'], s = '', i;
    for (i = 0; i < 6; i++) {
      var y = 20 + i * 70;
      s += box(104, y, 220, 44, C[i]) + badge(126, y + 22, i + 1) + t(146, y + 28, T[i], 'tb') +
        t(336, y + 19, E[i][0], 'ts') + t(336, y + 37, E[i][1], 'ts');
      if (i < 5) s += '<path d="M214 ' + (y + 44) + 'V' + (y + 70) + '" class="k" marker-end="url(#ar)"/>';
    }
    var y6 = 20 + 5 * 70 + 22, y4 = 20 + 3 * 70 + 22, mid = (y6 + y4) / 2;
    s += '<path d="M104 ' + y6 + 'H88V' + y4 + 'H102" class="k" marker-end="url(#ar)"/>' +
      '<text x="46" y="' + mid + '" class="tb" text-anchor="middle" transform="rotate(-90 46 ' + mid + ')">Not fixed?</text>' +
      '<text x="66" y="' + mid + '" class="tb" text-anchor="middle" transform="rotate(-90 66 ' + mid + ')">Test again</text>';
    return wrap(480, 426, 'Diagnostic process',
      'Six boxes in order: verify the complaint, gather information, check the obvious, test and isolate, repair, confirm the repair, with an arrow from the last step back to step four labelled not fixed, test again.', s);
  }
};

/* ---------------- Hierarchy of controls ---------------- */
DIAGRAMS['hierarchy-of-controls'] = {
  caption: 'Start at the top. Removing a hazard is always better than relying on protective equipment, which is the last line of defence.',
  svg: function () {
    var L = [['Eliminate', 'Remove the hazard completely', 'tint-g', 440], ['Substitute', 'Use a safer product or method', 'tint-c', 400], ['Engineering controls', 'Guards, extraction, lifts, stands', 'tint-c-soft', 360], ['Administrative controls', 'Procedures, training, signs', 'tint-y-soft', 320], ['PPE', 'Gloves, eye and ear protection', 'tint-m-soft', 280]], s = t(240, 16, 'Most effective', 'ts', 'middle'), i;
    for (i = 0; i < 5; i++) {
      var w = L[i][3], x = 240 - w / 2, y = 26 + i * 62;
      s += box(x, y, w, 50, L[i][2]) + badge(x + 22, y + 25, i + 1) + t(x + 44, y + 22, L[i][0], 'tb') + t(x + 44, y + 40, L[i][1], 'ts');
    }
    s += t(240, 350, 'Least effective', 'ts', 'middle');
    return wrap(480, 362, 'Hierarchy of controls',
      'Five boxes from widest at the top to narrowest at the bottom: eliminate, substitute, engineering controls, administrative controls and personal protective equipment.', s);
  }
};

/* ---------------- Fire triangle and extinguisher choice ---------------- */
DIAGRAMS['fire-triangle'] = {
  caption: 'A fire needs fuel, oxygen and heat together. Remove any one and it goes out. Choose the extinguisher for the kind of fire: the wrong one can spread a fuel fire or shock you on an electrical one.',
  svg: function () {
    var s = '<path d="M240 46L408 192H72Z" class="box tint-m-soft" stroke-width="3"/>' +
      t(240, 150, 'FIRE', 'tb', 'middle') +
      box(190, 4, 100, 32, 'tint-m-soft') + t(240, 25, 'Heat', 'tb', 'middle') +
      box(20, 202, 150, 32, 'tint-y-soft') + t(95, 223, 'Fuel', 'tb', 'middle') +
      box(310, 202, 150, 32, 'tint-c-soft') + t(385, 223, 'Oxygen', 'tb', 'middle') +
      t(240, 112, 'Cool it', 'ts', 'middle') +
      t(95, 250, 'Shut off the supply, move fuel away', 'ts', 'middle') +
      t(385, 250, 'Smother it: powder, CO2, blanket', 'ts', 'middle');
    var R = [
      ['Ordinary', 'Tyres, rags, paper', 'Water, foam or powder', 'tint-g'],
      ['Flammable liquid', 'Petrol, diesel, oil', 'Foam, powder or CO2. Never water', 'tint-y'],
      ['Electrical', 'Wiring, battery, fuses', 'CO2 or powder. Never water or foam', 'tint-c']
    ], i;
    s += t(240, 292, 'Which extinguisher?', 'tb', 'middle');
    for (i = 0; i < 3; i++) {
      var y = 304 + i * 56;
      s += box(20, y, 160, 48, R[i][3]) + t(32, y + 20, R[i][0], 'tb') + t(32, y + 38, R[i][1], 'ts') +
        box(188, y, 272, 48, 'tint-key') + t(200, y + 29, R[i][2], 't');
    }
    s += t(240, 488, 'Fire bigger than a waste bin?', 'tb', 'middle') + t(240, 508, 'Get everyone out and call the emergency services', 'tb', 'middle');
    return wrap(480, 520, 'Fire triangle and extinguisher choice',
      'A triangle with heat, fuel and oxygen and how to remove each, above a table matching ordinary, flammable liquid and electrical fires to the right extinguisher and the ones never to use.', s);
  }
};

/* ---------------- Seat belt pretensioner sequence ---------------- */
DIAGRAMS['restraint-sequence'] = {
  caption: 'In a frontal crash the pretensioner removes belt slack first, then the load limiter lets the belt pay out so the chest is not overloaded.',
  svg: function () {
    var T = ['Crash sensor detects deceleration', 'Control unit decides to deploy', 'Pretensioner fires', 'Belt tightens, slack removed', 'Load limiter lets belt pay out'],
      E = ['Impact starts', 'Within milliseconds', 'Pulls the buckle or retractor', 'Occupant held in the seat', 'Force on the chest is limited'],
      C = ['tint-c-soft', 'tint-c', 'tint-y', 'tint-y-soft', 'tint-g'], s = '', i;
    for (i = 0; i < 5; i++) {
      var y = 14 + i * 66;
      s += box(40, y, 400, 46, C[i]) + badge(66, y + 23, i + 1) + t(90, y + 21, T[i], 'tb') + t(90, y + 38, E[i], 'ts');
      if (i < 4) s += '<path d="M240 ' + (y + 46) + 'V' + (y + 66) + '" class="k" marker-end="url(#ar)"/>';
    }
    s += t(240, 356, 'Replace belts and pretensioners after any deployment', 'tb', 'middle');
    return wrap(480, 368, 'Seat belt pretensioner sequence',
      'Five boxes in order: crash sensor detects deceleration, control unit decides to deploy, pretensioner fires, belt tightens and removes slack, load limiter lets the belt pay out.', s);
  }
};
