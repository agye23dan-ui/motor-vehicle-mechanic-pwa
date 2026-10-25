/* Diagrams for m14 (expansion systems), m15 (A/C service), m16 (clutch operation, shafts and joints) and m19 (brake booster, wheel bearing). */
import { DIAGRAMS, wrap, t, badge, box } from './core.js';

function P(d, c, extra) { return '<path d="' + d + '" class="' + (c || 'k') + '"' + (extra || '') + '/>'; }
function R(x, y, w, h, c, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" class="' + c + '"/>'; }
function C(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" class="' + c + '"/>'; }
var ARROW = ' marker-end="url(#ar)"';

/* ---------------- Brake booster ---------------- */
DIAGRAMS['brake-booster'] = {
  caption: 'A vacuum booster has engine vacuum on one side of a diaphragm. Pressing the pedal lets air into the other side, and the pressure difference adds to your foot force on the master cylinder.',
  svg: function () {
    function state(y, pressed, title) {
      var dx = pressed ? 22 : 0, s = '';
      s += t(20, y - 36, title, 'tb');
      s += R(150, y, 200, 90, 'metal', 14);
      s += R(154, y + 4, 82 + dx, 82, pressed ? 'tint-m' : 'tint-c', 0) + R(244 + dx, y + 4, 102 - dx, 82, 'tint-c', 0);
      s += R(236 + dx, y + 4, 8, 82, 'metal-dark', 0);
      s += P('M50 ' + (y + 45) + 'H' + (236 + dx), 'k bold') + P('M' + (244 + dx) + ' ' + (y + 45) + 'H350', 'k bold');
      s += R(20, y + 30, 30, 30, 'box tint-y-soft', 3) + t(35, y + 24, 'Pedal', 'ts', 'middle');
      s += R(350, y + 28, 90, 34, 'box tint-y-soft', 3) + t(395, y + 80, 'Master cylinder', 'ts', 'middle') + P('M440 ' + (y + 45) + 'H464', 'pipe oil');
      s += t(300 + dx / 2, y + 80, 'Vacuum', 'ts', 'middle') + t(pressed ? 205 + dx / 2 : 195, y + 80, pressed ? 'Air' : 'Vacuum', 'ts', 'middle');
      s += P('M320 ' + y + 'V' + (y - 18), 'pipe cold') + t(332, y - 6, 'Engine vacuum', 'ts');
      if (pressed) s += P('M190 ' + (y - 18) + 'V' + (y + 8), 'k', ARROW) + t(200, y - 6, 'Air in', 'ts') +
        P('M262 ' + (y + 62) + 'H300', 'k', ARROW);
      return s;
    }
    var s = state(64, false, '1  Pedal up: vacuum on both sides') + state(232, true, '2  Pedal pressed: air enters');
    s += R(20, 350, 440, 68, 'box tint-y-soft', 6) +
      t(34, 372, 'Foot force plus the pressure difference', 'tb') +
      t(34, 392, 'pushes on the master cylinder. If the vacuum is lost', 'ts') +
      t(34, 410, 'the brakes still work, but the pedal is hard.', 'ts');
    return wrap(480, 432, 'Vacuum brake booster',
      'Two cut-away views of a brake booster. With the pedal up there is vacuum on both sides of the diaphragm. With the pedal pressed, air enters the pedal side, the diaphragm moves toward the master cylinder and adds force.', s);
  }
};

/* ---------------- A/C service sequence ---------------- */
DIAGRAMS['ac-service-sequence'] = {
  caption: 'Work in this order every time the refrigerant circuit is opened. Each step has its own equipment, and the charge is set by weight.',
  svg: function () {
    var S = [
      ['Recover', 'Machine pulls out', 'the refrigerant.', 'Weigh and record it', 'tint-m'],
      ['Repair', 'New O-rings, oiled.', 'New drier. Cap ends.', 'Keep moisture out', 'tint-y-soft'],
      ['Evacuate', 'Vacuum pump, 20 to', '30 min or manual.', 'Removes air, moisture', 'tint-c'],
      ['Hold test', 'Close the valves and', 'watch 10 minutes.', 'The vacuum must hold', 'tint-c-soft'],
      ['Charge', 'Add the weight on', 'the label, by scale.', 'Weight, not pressure', 'tint-g'],
      ['Check', 'Run it. Read gauges', 'and vent temp.', 'Leak check, then cap', 'tint-y']
    ], s = '', i, x, y;
    for (i = 0; i < 6; i++) {
      x = 10 + (i % 3) * 160; y = 16 + Math.floor(i / 3) * 130;
      s += box(x, y, 140, 100, S[i][4]) + badge(x + 20, y + 22, i + 1) + t(x + 38, y + 28, S[i][0], 'tb') +
        t(x + 10, y + 52, S[i][1], 'ts') + t(x + 10, y + 70, S[i][2], 'ts') + t(x + 10, y + 91, S[i][3], 'tsm');
      if (i % 3 < 2) s += P('M' + (x + 140) + ' ' + (y + 50) + 'H' + (x + 160), 'k', ARROW);
    }
    s += P('M400 116V128H80V140', 'k', ARROW);
    s += box(10, 274, 460, 64, 'tint-m-soft') + t(240, 298, 'Never vent refrigerant to the air', 'tb', 'middle') +
      t(240, 320, 'Never pull a vacuum on a system that still holds refrigerant', 'ts', 'middle');
    return wrap(480, 350, 'Air conditioning service sequence',
      'Six boxes in order: recover, repair, evacuate, hold test, charge by weight and check, with a warning never to vent refrigerant and never to pull a vacuum on a system holding refrigerant.', s);
  }
};

/* ---------------- Manifold gauge hook-up ---------------- */
DIAGRAMS['ac-manifold-hookup'] = {
  caption: 'Blue goes to the low-side port, red to the high-side port, and the yellow hose in the middle goes to the recovery machine, vacuum pump or refrigerant supply. The two ports are different sizes, so a coupler fits only the right one.',
  svg: function () {
    var s = '', needle = function (cx, cy, a) { var r = a * Math.PI / 180; return P('M' + cx + ' ' + cy + 'L' + (cx + 22 * Math.sin(r)).toFixed(1) + ' ' + (cy - 22 * Math.cos(r)).toFixed(1), 'k bold'); };
    s += C(70, 70, 36, 'box tint-c') + needle(70, 70, -50) + t(70, 98, 'LOW', 'tb', 'middle') + C(70, 70, 3, 'head');
    s += C(190, 70, 36, 'box tint-m') + needle(190, 70, 40) + t(190, 98, 'HIGH', 'tb', 'middle') + C(190, 70, 3, 'head');
    s += R(50, 112, 160, 24, 'metal-dark', 4) + C(80, 150, 9, 'box tint-c') + C(180, 150, 9, 'box tint-m');
    s += P('M210 124H270', 'pipe oil') + R(270, 96, 200, 56, 'box tint-y-soft', 6) +
      t(370, 118, 'Recovery machine,', 'ts', 'middle') + t(370, 136, 'vacuum pump or refrigerant', 'ts', 'middle') + t(262, 146, 'Yellow hose', 'tsm', 'end');
    /* the system */
    s += P('M65 250V230H415V250', 'flow') + t(240, 226, 'Liquid line', 'ts', 'middle');
    s += P('M110 272H190', 'pipe cold') + P('M290 272H370', 'pipe hot');
    s += R(20, 250, 90, 44, 'box tint-c-soft', 4) + t(65, 277, 'Evaporator', 'tsm', 'middle') +
      R(190, 250, 100, 44, 'metal', 4) + t(240, 277, 'Compressor', 'tsm', 'middle') +
      R(370, 250, 90, 44, 'box tint-m-soft', 4) + t(415, 277, 'Condenser', 'tsm', 'middle');
    /* hoses to the service ports */
    s += P('M80 159V200H150V264', 'pipe cold') + P('M180 159V190H330V264', 'pipe hot');
    s += C(150, 272, 7, 'box tint-c') + C(330, 272, 7, 'box tint-m');
    s += t(150, 314, 'Low-side port', 'ts', 'middle') + t(150, 330, '(suction)', 'ts', 'middle') + t(330, 314, 'High-side port', 'ts', 'middle') + t(330, 330, '(discharge)', 'ts', 'middle');
    s += t(240, 358, 'Valves closed while connecting. Open them only as the procedure says.', 'ts', 'middle');
    return wrap(480, 372, 'Manifold gauge set connected to an A/C system',
      'A manifold gauge set with a blue low gauge and a red high gauge. A blue hose goes to the low-side service port on the suction line, a red hose goes to the high-side service port on the discharge line, and a yellow hose goes to a recovery machine, vacuum pump or refrigerant supply.', s);
  }
};

/* ---------------- Expansion systems ---------------- */
DIAGRAMS['expansion-systems'] = {
  caption: 'A valve system has a receiver-drier on the high side and an expansion valve that adjusts. An orifice tube system has a fixed orifice and an accumulator on the low side.',
  svg: function () {
    function loop(px, py, orifice) {
      var s = '';
      s += t(px + 4, py - 6, orifice ? 'Orifice tube system' : 'Expansion valve system', 'tb');
      s += P('M' + (px + 180) + ' ' + (py + 96) + 'V' + (py + 45) + 'H' + (px + 160), 'pipe hot');
      s += P('M' + (px + 60) + ' ' + (py + 45) + 'H' + (px + 39) + 'V' + (orifice ? py + 120 : py + 80), 'pipe hot');
      if (orifice) {
        s += P('M' + (px + 39) + ' ' + (py + 154) + 'V' + (py + 215) + 'H' + (px + 60), 'pipe cold');
        s += P('M' + (px + 160) + ' ' + (py + 215) + 'H' + (px + 186) + 'V' + (py + 190), 'pipe cold') + P('M' + (px + 186) + ' ' + (py + 160) + 'V' + (py + 136), 'pipe cold');
      } else {
        s += P('M' + (px + 39) + ' ' + (py + 114) + 'V' + (py + 140), 'pipe hot') + P('M' + (px + 39) + ' ' + (py + 174) + 'V' + (py + 215) + 'H' + (px + 60), 'pipe cold');
        s += P('M' + (px + 160) + ' ' + (py + 215) + 'H' + (px + 180) + 'V' + (py + 136), 'pipe cold');
      }
      s += R(px + 60, py + 30, 100, 30, 'box tint-m-soft', 4) + t(px + 110, py + 50, 'Condenser', 'tsm', 'middle');
      s += R(px + 142, py + 96, 76, 40, 'metal', 4) + t(px + 180, py + 120, 'Compressor', 'tsm', 'middle');
      s += R(px + 60, py + 200, 100, 30, 'box tint-c-soft', 4) + t(px + 110, py + 220, 'Evaporator', 'tsm', 'middle');
      if (orifice) {
        s += R(px + 4, py + 120, 70, 34, 'box tint-y', 4) + t(px + 39, py + 135, 'Orifice', 'tsm', 'middle') + t(px + 39, py + 149, 'tube', 'tsm', 'middle');
        s += R(px + 142, py + 160, 88, 30, 'box tint-c', 4) + t(px + 186, py + 180, 'Accumulator', 'tsm', 'middle');
      } else {
        s += R(px + 4, py + 80, 70, 34, 'box tint-y-soft', 4) + t(px + 39, py + 95, 'Receiver', 'tsm', 'middle') + t(px + 39, py + 109, 'drier', 'tsm', 'middle');
        s += R(px + 4, py + 140, 70, 34, 'box tint-y', 4) + t(px + 39, py + 155, 'Expansion', 'tsm', 'middle') + t(px + 39, py + 169, 'valve', 'tsm', 'middle');
      }
      return s;
    }
    var s = loop(8, 36, false) + loop(244, 36, true);
    s += t(20, 296, 'Receiver-drier on the high side.', 'ts') + t(20, 314, 'The valve adjusts to the heat load.', 'ts') +
      t(256, 296, 'Accumulator on the low side.', 'ts') + t(256, 314, 'The orifice tube is fixed.', 'ts');
    s += P('M20 338H44', 'pipe hot') + t(52, 342, 'High pressure', 'ts') + P('M180 338H204', 'pipe cold') + t(212, 342, 'Low pressure', 'ts');
    return wrap(480, 356, 'Expansion valve and orifice tube systems',
      'Two refrigerant circuits side by side. The expansion valve system has a condenser, receiver-drier, expansion valve, evaporator and compressor. The orifice tube system has a condenser, orifice tube, evaporator, accumulator and compressor.', s);
  }
};

/* ---------------- Clutch operation ---------------- */
DIAGRAMS['clutch-operation'] = {
  caption: 'With the pedal up the diaphragm spring clamps the disc against the flywheel. With the pedal down the fork pushes the release bearing, the spring pulls the pressure plate away and the disc runs free.',
  svg: function () {
    function panel(y, released) {
      var pp = released ? 128 : 114, bx = released ? 196 : 212, s = '';
      s += P('M94 ' + (y - 6) + 'H236V' + (y + 8) + 'M94 ' + (y + 116) + 'H236V' + (y + 102), 'k2');
      s += P('M102 ' + (y + 55) + 'H252', 'k bold');
      s += R(60, y, 34, 110, 'metal', 0);
      s += R(104, y + 4, 8, 102, 'metal-dark', 0) + R(98, y + 8, 6, 94, 'box tint-y', 0) + R(112, y + 8, 6, 94, 'box tint-y', 0);
      s += R(pp, y + 6, 34, 98, 'metal-dark', 0);
      s += P('M' + (pp + 34) + ' ' + (y + 12) + 'L' + (bx + 10) + ' ' + (y + 46) + 'M' + (pp + 34) + ' ' + (y + 98) + 'L' + (bx + 10) + ' ' + (y + 64), 'k bold');
      s += R(bx, y + 46, 26, 18, 'box tint-c', 2);
      s += P('M' + (bx + 26) + ' ' + (y + 55) + 'H' + (bx + 46), 'k bold');
      if (released) s += P('M' + (bx + 54) + ' ' + (y + 34) + 'H' + (bx + 30), 'k', ARROW) + t(bx + 14, y + 26, 'Fork', 'ts');
      return s;
    }
    var s = panel(40, false) + panel(206, true);
    s += t(60, 24, 'Flywheel', 'ts') + t(130, 24, 'Pressure plate', 'ts') + t(106, 168, 'Disc', 'ts', 'middle') + t(224, 168, 'Release bearing', 'ts', 'middle');
    s += t(268, 62, 'Pedal up: engaged', 'tb') + t(268, 82, 'Spring clamps the disc', 'ts') + t(268, 100, 'between flywheel and plate.', 'ts') + t(268, 118, 'Drive goes to the gearbox.', 'ts');
    s += t(268, 228, 'Pedal down: released', 'tb') + t(268, 248, 'Fork pushes the bearing.', 'ts') + t(268, 266, 'The plate lifts away.', 'ts') + t(268, 284, 'The disc is free: no drive.', 'ts');
    s += '<path d="M14 190H466" class="dim"/>';
    return wrap(480, 340, 'Clutch engaged and released',
      'Two side sections of a clutch. Pedal up: the diaphragm spring clamps the clutch disc between the flywheel and the pressure plate. Pedal down: the fork pushes the release bearing, the pressure plate moves away and the disc is free.', s);
  }
};

/* ---------------- Driveshafts and joints ---------------- */
DIAGRAMS['driveshaft-joints'] = {
  caption: 'A front-wheel-drive driveshaft has a plunging inner joint and an angled outer joint, each in a grease-filled boot. A rear-wheel-drive propeller shaft uses universal joints and sometimes a centre bearing.',
  svg: function () {
    var s = t(20, 22, 'Front-wheel drive: driveshaft', 'tb'), i, x;
    s += R(20, 56, 60, 52, 'metal', 4) + t(50, 86, 'Gearbox', 'tsm', 'middle');
    s += R(96, 62, 54, 40, 'box tint-k-soft', 6) + P('M108 62V102M120 62V102M132 62V102', 'k2');
    s += R(150, 78, 150, 8, 'metal-dark', 0) + t(225, 70, 'Shaft', 'ts', 'middle');
    s += R(300, 58, 60, 48, 'box tint-k-soft', 6) + P('M312 58V106M324 58V106M336 58V106', 'k2') + C(372, 82, 20, 'metal');
    s += R(398, 46, 24, 76, 'rubber', 4) + R(392, 76, 8, 12, 'metal-dark', 0);
    s += P('M96 122H150', 'k', ARROW) + P('M150 122H96', 'k', ARROW);
    s += badge(123, 40, 1) + badge(330, 40, 2) + badge(225, 106, 3) + badge(372, 124, 4);
    s += t(20, 168, 'Rear-wheel drive: propeller shaft', 'tb');
    s += R(20, 184, 60, 40, 'metal', 4) + t(50, 208, 'Gearbox', 'tsm', 'middle');
    s += R(112, 200, 94, 8, 'metal-dark', 0) + R(262, 200, 100, 8, 'metal-dark', 0);
    for (i = 0; i < 3; i++) {
      x = [96, 250, 376][i];
      s += P('M' + (x - 10) + ' 194L' + (x + 10) + ' 214M' + (x - 10) + ' 214L' + (x + 10) + ' 194', 'k bold') + C(x, 204, 8, 'box tint-y');
    }
    s += R(214, 190, 20, 28, 'box tint-c', 2) + P('M224 218V230', 'k') + R(214, 230, 20, 6, 'box tint-m', 0);
    s += R(398, 184, 76, 40, 'metal', 4) + t(436, 208, 'Differential', 'tsm', 'middle');
    s += badge(96, 246, 5) + badge(224, 252, 6) + badge(310, 188, 7);
    var L = ['Inner CV joint (plunges)', 'CV boot: grease in, dirt out', 'Driveshaft', 'Outer CV joint (angle)', 'Universal joint', 'Centre bearing', 'Propeller shaft'];
    for (i = 0; i < 7; i++) s += badge(30 + Math.floor(i / 4) * 230, 282 + (i % 4) * 24, i + 1, 10) + t(48 + Math.floor(i / 4) * 230, 287 + (i % 4) * 24, L[i], 't');
    var Q = [['Clicking on turns', 'Outer CV joint'], ['Vibration on acceleration', 'Inner CV joint'], ['Clunk taking up drive', 'Universal joint'], ['Grease in the wheel arch', 'Split CV boot']];
    for (i = 0; i < 4; i++) s += box(10 + (i % 2) * 234, 392 + Math.floor(i / 2) * 44, 226, 38, 'tint-y-soft') + t(20 + (i % 2) * 234, 409 + Math.floor(i / 2) * 44, Q[i][0], 'tb') + t(20 + (i % 2) * 234, 424 + Math.floor(i / 2) * 44, Q[i][1], 'ts');
    return wrap(480, 486, 'Driveshafts and joints',
      'Top: a front-wheel-drive driveshaft from the gearbox through an inner CV joint, a shaft and an outer CV joint to the wheel, each joint inside a boot. Middle: a propeller shaft from the gearbox through universal joints and a centre bearing to the differential. Bottom: symptoms and the joint they point to.', s);
  }
};

/* ---------------- Wheel bearing and hub ---------------- */
DIAGRAMS['wheel-bearing'] = {
  caption: 'A hub bearing is a sealed double-row ball bearing between the hub and the knuckle. The hub carries the wheel, and the bearing carries the weight of the vehicle.',
  svg: function () {
    var s = '';
    s += R(112, 64, 76, 34, 'box tint-k-soft', 4) + R(112, 182, 76, 34, 'box tint-k-soft', 4);
    s += R(116, 98, 68, 8, 'metal-dark', 0) + R(116, 174, 68, 8, 'metal-dark', 0);
    s += R(116, 118, 68, 10, 'metal', 0) + R(116, 152, 68, 10, 'metal', 0);
    s += C(132, 112, 6, 'box tint-y') + C(164, 112, 6, 'box tint-y') + C(132, 168, 6, 'box tint-y') + C(164, 168, 6, 'box tint-y');
    s += R(92, 128, 130, 24, 'metal', 0) + R(92, 46, 10, 188, 'metal-dark', 0) + R(70, 56, 22, 168, 'metal', 0);
    s += R(54, 72, 16, 10, 'metal-dark', 0) + R(54, 198, 16, 10, 'metal-dark', 0);
    s += R(100, 134, 196, 12, 'metal-dark', 0) + R(296, 128, 22, 24, 'box tint-m', 2);
    s += R(208, 112, 8, 56, 'box tint-c', 0) + R(204, 80, 24, 22, 'box tint-g', 2);
    s += P('M216 102V112', 'k2');
    s += '<path d="M51 110H70M112 41V46M150 51V64M229 104L170 112M229 184L206 154M322 108L284 134M312 152L320 184M231 66L220 80" class="dim"/>' +
      badge(40, 110, 1) + badge(112, 30, 2) + badge(150, 40, 3) + badge(240, 100, 4) + badge(240, 188, 5) + badge(334, 100, 6) + badge(320, 196, 7) + badge(240, 56, 8);
    s += t(62, 250, 'Wheel side', 'ts') + t(250, 250, 'Gearbox side', 'ts');
    var L = ['Hub flange and wheel studs', 'Brake disc', 'Steering knuckle', 'Bearing balls (two rows)', 'Hub barrel with inner race', 'Driveshaft (splined)', 'Axle nut', 'ABS tone ring and sensor'];
    for (var i = 0; i < 8; i++) s += badge(30 + Math.floor(i / 4) * 230, 278 + (i % 4) * 24, i + 1, 10) + t(48 + Math.floor(i / 4) * 230, 283 + (i % 4) * 24, L[i], 't');
    s += box(20, 388, 440, 52, 'tint-y-soft') + t(240, 410, 'Torque the axle nut and hub bolts as the manual says', 'tb', 'middle') +
      t(240, 430, 'Too tight overheats the bearing. Too loose lets it move.', 'ts', 'middle');
    return wrap(480, 454, 'Wheel hub and bearing',
      'Cross-section of a driven wheel hub: the hub flange with wheel studs and brake disc, the hub barrel with a double-row ball bearing inside the steering knuckle, the driveshaft with its axle nut, and an ABS tone ring with a sensor.', s);
  }
};
