import { DIAGRAMS, wrap, t, box, resistor, badge, wavePath } from './core.js';

/* ---------------- Ohm's law triangle ---------------- */
DIAGRAMS['ohm-triangle'] = {
  caption: 'Cover the quantity you want to find. What is left shows the sum: V on top of I and R means V = I × R.',
  svg: function () {
    var body =
      '<polygon points="120,24 75,130 165,130" class="tint-c"/>' +
      '<polygon points="75,130 120,130 120,236 30,236" class="tint-m"/>' +
      '<polygon points="120,130 165,130 210,236 120,236" class="tint-y"/>' +
      '<polygon points="120,24 30,236 210,236" class="k"/>' +
      '<path d="M75 130H165M120 130V236" class="k"/>' +
      t(120, 104, 'V', 'tbig', 'middle') + t(75, 204, 'I', 'tbig', 'middle') + t(165, 204, 'R', 'tbig', 'middle') +
      t(250, 48, 'Cover one, read the rest', 'tb') +
      t(250, 98, 'V = I × R', 'tform') + t(250, 118, 'volts = amperes × ohms', 'ts') +
      t(250, 160, 'I = V ÷ R', 'tform') + t(250, 180, 'amperes = volts ÷ ohms', 'ts') +
      t(250, 222, 'R = V ÷ I', 'tform') + t(250, 242, 'ohms = volts ÷ amperes', 'ts');
    return wrap(480, 262, 'Ohm\'s law triangle',
      'A triangle split in three: V at the top, I at the bottom left and R at the bottom right, with the three forms of Ohm\'s law beside it.', body);
  }
};

/* ---------------- Series and parallel ---------------- */
DIAGRAMS['series-parallel'] = {
  caption: 'Series: one path, so the same current flows through every resistor. Parallel: several paths, so each branch has the same voltage.',
  svg: function () {
    var s =
      t(30, 22, 'Series: one path', 'tb') +
      '<path d="M30 50H120M180 50H210M270 50H300M360 50H450V120H30V88M30 78V50" class="k"/>' +
      '<path d="M18 78H42" class="k bold"/><path d="M24 88H36" class="k bold"/>' + t(52, 82, '+', 'ts') +
      resistor(150, 50, 'R1') + resistor(240, 50, 'R2') + resistor(330, 50, 'R3') +
      t(240, 104, 'R total = R1 + R2 + R3', 'tb', 'middle') +
      t(30, 146, 'Same current in every resistor. Voltages add up.', 'ts');
    var p =
      t(30, 188, 'Parallel: more than one path', 'tb') +
      '<path d="M100 220V290M380 220V290" class="k"/>' +
      '<path d="M100 220H160M220 220H380M100 290H160M220 290H380" class="k"/>' +
      resistor(190, 220, 'R1') + resistor(190, 290, 'R2') +
      '<path d="M100 255H68M60 255H20V322H420V255H380" class="k"/>' +
      '<path d="M60 243V267" class="k bold"/><path d="M68 248V262" class="k bold"/>' + t(74, 242, '+', 'ts') +
      t(240, 260, '1 ÷ R total = 1 ÷ R1 + 1 ÷ R2', 'tb', 'middle') +
      t(30, 346, 'Same voltage across every branch. Currents add up.', 'ts');
    return wrap(480, 358, 'Series and parallel circuits',
      'Top: a battery with three resistors in one loop. Bottom: a battery with two resistors in separate branches.', s + p);
  }
};


/* ---------------- Shared symbol helpers for the drawings below ---------------- */
function P(d, c, extra) { return '<path d="' + d + '" class="' + (c || 'k') + '"' + (extra || '') + '/>'; }
function dot(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="3.4" class="head"/>'; }
/* Earth symbol hanging from the point (x, y). */
function earth(x, y) {
  return P('M' + x + ' ' + y + 'V' + (y + 7) + 'M' + (x - 12) + ' ' + (y + 7) + 'H' + (x + 12) + 'M' + (x - 8) + ' ' + (y + 12) + 'H' + (x + 8) + 'M' + (x - 4) + ' ' + (y + 17) + 'H' + (x + 4));
}
function lampSym(cx, cy, r, on) {
  var d = (r || 13) * 0.7;
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r || 13) + '" class="box' + (on ? ' tint-y' : '') + '"/>' +
    P('M' + (cx - d) + ' ' + (cy - d) + 'L' + (cx + d) + ' ' + (cy + d) + 'M' + (cx - d) + ' ' + (cy + d) + 'L' + (cx + d) + ' ' + (cy - d), 'k2');
}
/* Fuse: a small box with the wire through it. Horizontal spans cx-16..cx+16, vertical spans cy-16..cy+16. */
function fuseH(cx, cy) { return '<rect x="' + (cx - 16) + '" y="' + (cy - 7) + '" width="32" height="14" rx="2" class="box"/>' + P('M' + (cx - 16) + ' ' + cy + 'H' + (cx + 16), 'k2'); }
function fuseV(cx, cy) { return '<rect x="' + (cx - 7) + '" y="' + (cy - 16) + '" width="14" height="32" rx="2" class="box"/>' + P('M' + cx + ' ' + (cy - 16) + 'V' + (cy + 16), 'k2'); }
/* Switch with contacts 36 apart. Horizontal: terminals at cx-18 and cx+18. Vertical: cy-18 and cy+18. */
function swH(cx, cy, closed) {
  return P('M' + (cx - 18) + ' ' + cy + (closed ? 'H' + (cx + 18) : 'L' + (cx + 13) + ' ' + (cy - 15)), 'k bold') + dot(cx - 18, cy) + dot(cx + 18, cy);
}
function swV(cx, cy, closed) {
  return P('M' + cx + ' ' + (cy - 18) + (closed ? 'V' + (cy + 18) : 'L' + (cx + 15) + ' ' + (cy + 13)), 'k bold') + dot(cx, cy - 18) + dot(cx, cy + 18);
}
/* Battery plates: long (positive) at cy-5, short (negative) at cy+5. */
function battSym(cx, cy) { return P('M' + (cx - 16) + ' ' + (cy - 5) + 'H' + (cx + 16), 'k bold') + P('M' + (cx - 8) + ' ' + (cy + 5) + 'H' + (cx + 8), 'k bold'); }
function motorSym(cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" class="box"/>' + t(cx, cy + 6, 'M', 'tb', 'middle'); }
/* Diode pointing up (conventional current flows upwards). */
function diodeUp(cx, cy) {
  return '<polygon points="' + (cx - 8) + ',' + (cy + 7) + ' ' + (cx + 8) + ',' + (cy + 7) + ' ' + cx + ',' + (cy - 7) + '" class="box"/>' + P('M' + (cx - 8) + ' ' + (cy - 7) + 'H' + (cx + 8));
}

/* ---------------- Basic vehicle circuit ---------------- */
DIAGRAMS['basic-vehicle-circuit'] = {
  caption: 'A car uses one insulated wire to each part. The metal body carries the current back to the battery, so the body is the second wire.',
  svg: function () {
    var b =
      '<rect x="20" y="222" width="440" height="22" rx="3" class="metal"/>' + t(240, 238, 'Body / chassis (metal)', 'ts', 'middle') +
      /* positive path */
      P('M50 125V60H94M126 60H172M208 60H380V116M290 60V116', 'wire-pos') + P('M290 144V222M380 144V222', 'wire-gnd') +
      P('M222 60H250', 'wire-pos', ' marker-end="url(#ar)"') +
      /* return path */
      P('M50 135V222', 'wire-gnd') + P('M50 200V178', 'wire-gnd', ' marker-end="url(#ar)"') +
      battSym(50, 130) + fuseH(110, 60) + swH(190, 60, true) + lampSym(290, 130, 14) + lampSym(380, 130, 14) +
      dot(290, 60) + dot(50, 222) + dot(290, 222) + dot(380, 222) +
      earth(240, 244) +
      t(70, 124, '+', 'tb') + t(70, 146, '−', 'tb') + t(88, 136, '12 V', 'tb') +
      t(110, 38, 'Fuse', 'ts', 'middle') + t(190, 38, 'Switch', 'ts', 'middle') +
      t(310, 134, 'Lamp 1', 'ts') + t(400, 134, 'Lamp 2', 'ts') +
      '<circle cx="290" cy="94" r="7" class="zone"/>' + t(276, 98, 'Measure supply', 'ts', 'end') + t(276, 114, 'voltage here', 'ts', 'end') +
      t(66, 206, 'Battery', 'ts') +
      t(240, 284, 'Earth return through the body', 'tb', 'middle') +
      P('M30 312H62', 'wire-pos') + t(70, 317, 'Red wire: positive supply (12 V)', 'ts') +
      t(30, 338, 'Arrows show the direction of conventional current.', 'ts');
    return wrap(480, 352, 'Basic single-wire vehicle circuit',
      'A battery feeds a fuse, a switch and two lamps in parallel through red wire. The lamps return to the battery negative through the metal body, which is the earth.', b);
  }
};

/* ---------------- Relay operation ---------------- */
function relayPanel(x, on) {
  var s = '';
  var wp = on ? 'wire-pos' : 'k';
  s += P('M' + (x + 40) + ' 36H' + (x + 200), 'wire-pos') + t(x + 40, 24, '+12 V', 't-red');
  /* control side */
  s += P('M' + (x + 92) + ' 36V44M' + (x + 92) + ' 80V140', 'wire-pos') + swV(x + 92, 62, on) + dot(x + 92, 36);
  s += t(x + 108, 60, 'Switch', 'ts');
  /* load side */
  s += P('M' + (x + 170) + ' 36V46M' + (x + 170) + ' 78V140', 'wire-pos') + fuseV(x + 170, 62) + dot(x + 170, 36);
  s += t(x + 186, 66, 'Fuse', 'ts');
  /* relay body */
  s += '<rect x="' + (x + 40) + '" y="140" width="170" height="100" rx="5" class="box"/>';
  s += '<rect x="' + (x + 80) + '" y="170" width="24" height="40" rx="3" class="box' + (on ? ' tint-m' : '') + '"/>';
  s += P('M' + (x + 92) + ' 140V170M' + (x + 92) + ' 210V240', wp);
  s += t(x + 46, 194, 'Coil', 'ts');
  s += P('M' + (x + 170) + ' 140V175M' + (x + 170) + ' 205V240', wp);
  s += P('M' + (x + 170) + ' 175' + (on ? 'V205' : 'L' + (x + 157) + ' 198'), 'k bold') + dot(x + 170, 175) + dot(x + 170, 205);
  s += P('M' + (x + 104) + ' 190H' + (x + 150), 'dim', ' stroke-dasharray="4 3"');
  s += t(x + 100, 156, '86', 'ts') + t(x + 100, 232, '85', 'ts') + t(x + 178, 156, '30', 'ts') + t(x + 178, 232, '87', 'ts');
  /* below the relay */
  s += P('M' + (x + 92) + ' 240V298', 'k') + earth(x + 92, 298);
  s += P('M' + (x + 170) + ' 240V262', on ? 'wire-pos' : 'k') + lampSym(x + 170, 275, 13, on) + P('M' + (x + 170) + ' 288V298', 'k') + earth(x + 170, 298);
  s += t(x + 190, 280, 'Load', 'ts');
  /* current labels */
  if (on) {
    s += P('M' + (x + 92) + ' 106V130', 'wire-pos', ' marker-end="url(#ar)"') + t(x + 82, 118, 'small', 'ts', 'end') + t(x + 82, 133, 'current', 'ts', 'end');
    s += P('M' + (x + 170) + ' 106V130', 'wire-pos bold', ' marker-end="url(#ar)"') + t(x + 182, 118, 'large', 'ts') + t(x + 182, 133, 'current', 'ts');
  } else {
    s += t(x + 82, 118, 'no', 'ts', 'end') + t(x + 82, 133, 'current', 'ts', 'end');
    s += t(x + 182, 118, 'no', 'ts') + t(x + 182, 133, 'current', 'ts');
  }
  return s;
}
DIAGRAMS['relay-operation'] = {
  caption: 'A small current through the coil makes a magnet that closes the contacts. The contacts then carry the large load current, so the switch only handles the small one.',
  svg: function () {
    var b = relayPanel(0, false) + relayPanel(245, true) +
      P('M244 24V352', 'dim') +
      t(120, 352, 'OFF', 'tb', 'middle') + t(120, 368, 'Coil not energised,', 'ts', 'middle') + t(120, 384, 'contacts open', 'ts', 'middle') +
      t(365, 352, 'ON', 'tb', 'middle') + t(365, 368, 'Coil energised,', 'ts', 'middle') + t(365, 384, 'contacts closed', 'ts', 'middle') +
      t(240, 412, 'Terminal numbers are standard: 85/86 coil, 30 supply, 87 load', 'ts', 'middle');
    return wrap(480, 424, 'Relay operation, off and on',
      'Two relay drawings side by side. Left: coil off, contacts open, lamp off. Right: coil energised, contacts closed, lamp on, with the small control current and the large load current marked.', b);
  }
};

/* ---------------- Voltage drop test ---------------- */
function meterBox(cx, cy, reading) {
  return '<rect x="' + (cx - 38) + '" y="' + (cy - 20) + '" width="76" height="40" rx="5" class="box tint-g"/>' +
    t(cx, cy + 5, reading, 'tb', 'middle');
}
DIAGRAMS['voltage-drop-test'] = {
  caption: 'Run the circuit, then put the meter leads across the part you are testing (not to earth). A good cable shows almost no voltage across it.',
  svg: function () {
    var b =
      /* circuit */
      P('M60 165V110H380V152', 'wire-pos') + P('M380 188V230H60V175', 'wire-gnd') +
      battSym(60, 170) + lampSym(380, 170, 18, true) +
      t(76, 140, '12 V battery', 'ts') + t(404, 174, 'Load', 'ts') + t(404, 190, 'ON', 'ts') +
      t(230, 130, 'Positive cable', 'ts', 'middle') + t(230, 222, 'Earth cable', 'ts', 'middle') +
      t(232, 172, 'Circuit ON: load running', 'ts', 'middle') + t(232, 190, 'Leads across the part tested', 'ts', 'middle') +
      /* supply side meter */
      P('M205 68L80 110M255 68L360 110', 'wire-sig') + dot(80, 110) + dot(360, 110) +
      meterBox(230, 48, '0.2 V') + t(284, 52, 'V', 'tb') +
      /* earth side meter */
      P('M205 282L80 230M255 282L360 230', 'wire-sig') + dot(80, 230) + dot(360, 230) +
      meterBox(230, 302, '0.1 V') + t(284, 306, 'V', 'tb') +
      /* table */
      '<rect x="20" y="342" width="440" height="52" rx="4" class="good"/>' +
      t(30, 362, 'Good', 'tb') + t(90, 362, 'Supply side: under 0.3 V', 'ts') + t(90, 382, 'Earth side: under 0.1 V per connection', 'ts') +
      '<rect x="20" y="400" width="440" height="52" rx="4" class="bad"/>' +
      t(30, 420, 'Bad', 'tb') + t(90, 420, 'Above 0.5 V in total', 'ts') + t(90, 440, 'High-resistance fault: dirty or loose joint', 'ts') +
      t(240, 474, 'Check the manual for the exact limits.', 'ts', 'middle');
    return wrap(480, 486, 'Voltage drop test',
      'A battery and a running load. One voltmeter is across the positive cable and reads 0.2 volts. A second voltmeter is across the earth cable and reads 0.1 volts. A table gives good and bad readings.', b);
  }
};

/* ---------------- Starter circuit ---------------- */
var HV = ' style="stroke-width:5.5px"';
DIAGRAMS['starter-circuit'] = {
  caption: 'A small control current from the ignition switch operates the solenoid. The solenoid contacts then pass the heavy cranking current to the starter motor.',
  svg: function () {
    var b =
      '<rect x="20" y="300" width="440" height="20" rx="3" class="metal"/>' + t(240, 315, 'Body and engine (earth)', 'ts', 'middle') +
      battSym(50, 190) + t(70, 184, '+', 'tb') + t(70, 206, '−', 'tb') + t(62, 236, 'Battery', 'ts') +
      P('M50 185V120H250V150', 'wire-pos', HV) +
      P('M50 195V300', 'wire-gnd', HV) + t(64, 285, 'Earth strap', 'ts') + dot(50, 300) +
      t(150, 112, 'Heavy cable', 'ts', 'middle') +
      /* control path */
      P('M50 120V60H90M126 60H160', 'wire-pos', ' style="stroke-width:1.5px"') + P('M70 60', 'k') +
      P('M50 120', 'k') +
      swH(108, 60, true) + t(108, 38, 'Ignition switch', 'ts', 'middle') + t(108, 84, '(START)', 'ts', 'middle') +
      '<rect x="160" y="48" width="84" height="24" rx="3" class="box"/>' + t(202, 65, 'Safety sw', 'ts', 'middle') +
      P('M244 60H340V150', 'wire-pos', ' style="stroke-width:1.5px"') +
      t(300, 44, 'Control: a few amps', 'ts', 'middle') +
      /* solenoid */
      '<rect x="220" y="150" width="160" height="70" rx="5" class="box"/>' + t(330, 170, 'Solenoid', 'ts', 'middle') +
      '<rect x="326" y="180" width="22" height="28" rx="3" class="box tint-m"/>' +
      P('M250 150V176M250 210V220', 'wire-pos', HV) + '<path d="M250 176L264 202" class="k bold"/>' + dot(250, 176) + dot(250, 210) +
      P('M250 220V230', 'wire-pos', HV) +
      motorSym(250, 252, 22) + t(222, 230, 'Starter', 'ts', 'end') +
      P('M250 274V300', 'wire-gnd', HV) + dot(250, 300) +
      '<rect x="288" y="244" width="40" height="16" rx="2" class="metal-dark"/>' + P('M272 252H288', 'k') +
      '<rect x="336" y="228" width="110" height="64" rx="4" class="metal"/>' + t(391, 256, 'Ring gear', 'ts', 'middle') + t(391, 274, '(flywheel)', 'ts', 'middle') +
      t(308, 236, 'Pinion', 'ts', 'middle') +
      t(30, 352, 'Heavy current: 100 to 400 A while cranking (varies)', 'tb') +
      P('M30 374H62', 'wire-pos', HV) + t(70, 379, 'thick red = heavy current', 'ts') +
      P('M260 374H292', 'wire-pos', ' style="stroke-width:1.5px"') + t(300, 379, 'thin = control', 'ts') +
      t(30, 404, 'Safety sw = neutral-safety switch or starter relay.', 'ts');
    return wrap(480, 418, 'Starter circuit',
      'Battery positive goes by heavy cable to the solenoid. The ignition switch in the start position sends a small current through a safety switch to the solenoid, which closes its contacts and feeds the starter motor, whose pinion meshes with the flywheel ring gear. An earth strap links battery negative to the body and engine.', b);
  }
};

/* ---------------- Alternator charging ---------------- */
DIAGRAMS['alternator-charging'] = {
  caption: 'The spinning rotor makes three-phase AC in the stator. Six diodes turn it into DC. The regulator reads battery voltage and controls the rotor current to hold it steady.',
  svg: function () {
    var thin = ' style="stroke-width:1.5px"';
    var b = '';
    /* sense line */
    b += P('M395 170V30H75V45', 'wire-sig', thin) + t(235, 22, 'Regulator senses battery voltage', 'ts', 'middle') + dot(395, 170);
    /* regulator and rotor */
    b += '<rect x="20" y="45" width="110" height="50" rx="4" class="box tint-c-soft"/>' + t(75, 76, 'Regulator', 'tb', 'middle');
    b += '<rect x="190" y="45" width="130" height="50" rx="4" class="box tint-m-soft"/>' + t(255, 66, 'Rotor', 'tb', 'middle') + t(255, 84, '(field coil)', 'ts', 'middle');
    b += P('M130 70H190', 'wire-pos') + t(255, 114, 'Brushes and', 'ts', 'middle') + t(255, 130, 'slip rings', 'ts', 'middle');
    /* warning lamp circuit */
    b += P('M50 95V117', 'wire-sig', thin) + lampSym(50, 130, 13, true) + P('M50 143V147', 'wire-sig', thin) + swV(50, 165, true) + P('M50 183V200', 'wire-pos', thin) +
      t(70, 124, 'Warning lamp', 'ts') + t(70, 164, 'Ignition switch', 'ts') + t(70, 200, 'from battery +', 'ts') + t(26, 112, 'D+', 'ts');
    /* stator */
    b += '<rect x="20" y="225" width="100" height="80" rx="4" class="box tint-y-soft"/>' + t(70, 262, 'Stator', 'tb', 'middle') + t(70, 280, '3 windings', 'ts', 'middle');
    /* rails */
    b += P('M200 170H420', 'wire-pos') + P('M200 350H420', 'wire-gnd') + earth(305, 350);
    b += t(300, 160, 'B+ output', 't-red', 'middle');
    /* columns */
    var cols = [200, 250, 300], ys = [245, 265, 285], i;
    for (i = 0; i < 3; i++) {
      b += P('M' + cols[i] + ' 170V350', 'k2') + P('M120 ' + ys[i] + 'H' + cols[i], 'wire-pos', thin) + dot(cols[i], ys[i]);
      b += diodeUp(cols[i], 205) + diodeUp(cols[i], 315);
    }
    b += t(222, 342, '', 'ts') + t(130, 335, '6 diodes', 'tb') + t(130, 352, '(bridge)', 'ts');
    /* loads and battery */
    b += P('M350 170V247M350 273V350', 'k2') + lampSym(350, 260, 13) + dot(350, 170) + dot(350, 350) + t(350, 296, 'Loads', 'ts', 'middle');
    b += P('M420 170V255M420 265V350', 'k2') + battSym(420, 260) + dot(420, 350) + t(420, 296, 'Battery', 'ts', 'middle');
    /* waveforms */
    b += '<rect x="20" y="395" width="210" height="80" rx="4" class="box"/><rect x="250" y="395" width="210" height="80" rx="4" class="box"/>';
    b += P('M30 435H220', 'zero') + P('M260 475H450', 'zero');
    var cl = ['c', 'm', 'y'];
    for (i = 0; i < 3; i++) {
      b += P(wavePath(30, 190, function (x) { return 435 - 26 * Math.sin(x / 190 * 4 * Math.PI + i * 2.0944); }), 'wave ' + cl[i]);
    }
    b += P(wavePath(260, 190, function (x) {
      var a = x / 190 * 4 * Math.PI, v = [0, 1, 2].map(function (k) { return Math.sin(a + k * 2.0944); });
      return 468 - 56 * (Math.max.apply(null, v) - Math.min.apply(null, v)) / 1.732 + 2;
    }), 'wave g');
    b += t(125, 492, 'Three-phase AC (stator)', 'ts', 'middle') + t(355, 492, 'DC after diodes (small ripple)', 'ts', 'middle');
    b += t(240, 520, 'About 13.8 to 14.7 V charging voltage', 'tb', 'middle') + t(240, 540, 'Typical value. Check the manual.', 'ts', 'middle');
    return wrap(480, 552, 'Alternator charging system',
      'A regulator feeds the rotor through brushes. The stator makes three-phase AC, six diodes rectify it to DC at B plus, which charges the battery and feeds the loads. The regulator senses battery voltage. A warning lamp circuit runs from the ignition switch to the D plus terminal. Below are the AC and rectified waveforms.', b);
  }
};

/* ---------------- Battery construction ---------------- */
DIAGRAMS['battery-construction'] = {
  caption: 'A 12 V lead-acid battery has six cells in series, about 2.1 V each. Each cell holds lead plates in acid, kept apart by separators.',
  svg: function () {
    var b = '', i, x;
    b += '<rect x="20" y="70" width="270" height="120" rx="4" class="box"/>';
    b += '<rect x="21" y="94" width="268" height="95" class="tint-c-soft"/>';
    for (i = 0; i < 6; i++) {
      x = 20 + i * 45;
      if (i > 0) b += P('M' + x + ' 70V190', 'dim');
      b += '<rect x="' + (x + 10) + '" y="100" width="6" height="68" class="metal"/><rect x="' + (x + 20) + '" y="100" width="6" height="68" class="tint-m" style="stroke:var(--ink);stroke-width:1"/><rect x="' + (x + 30) + '" y="100" width="6" height="68" class="metal"/>';
      b += t(x + 22.5, 184, '2.1 V', 'ts', 'middle');
      if (i < 5) b += '<rect x="' + (x + 27) + '" y="82" width="36" height="8" rx="2" class="metal-dark"/>';
    }
    /* terminals and vent */
    b += '<rect x="28" y="52" width="20" height="18" rx="2" class="metal-dark"/><rect x="262" y="52" width="20" height="18" rx="2" class="metal-dark"/>';
    b += t(38, 44, '+', 't-red', 'middle') + t(272, 44, '−', 'tb', 'middle');
    b += '<rect x="145" y="60" width="20" height="10" rx="2" class="metal"/>' + t(155, 54, 'Vent', 'ts', 'middle');
    b += badge(80, 52, '5') + P('M80 63V82', 'dim');
    b += badge(100, 208, '4') + P('M100 197V188', 'dim');
    b += t(155, 232, '6 cells × 2.1 V = about 12.6 V', 'tb', 'middle');
    /* close-up */
    b += t(390, 30, 'Plate group', 'tb', 'middle') + t(390, 48, '(close-up)', 'ts', 'middle');
    b += '<rect x="332" y="58" width="116" height="116" rx="4" class="tint-c-soft" style="stroke:var(--ink);stroke-width:1.2"/>';
    var seq = 'NSPSNSPSN', w = { N: 12, S: 5, P: 12 }, cl = { N: 'metal', S: 'box tint-y-soft', P: 'tint-m' }, px = 350, pos = {};
    for (i = 0; i < seq.length; i++) {
      var c = seq[i];
      b += '<rect x="' + px + '" y="66" width="' + w[c] + '" height="100" class="' + cl[c] + '" style="stroke:var(--ink);stroke-width:1"/>';
      if (!pos[c]) pos[c] = px + w[c] / 2;
      if (c === 'P' && !pos.P2) pos.P2 = px + 6; else if (c === 'P') pos.P2 = pos.P2;
      px += w[c];
    }
    b += P('M440 191L407 166', 'dim') + badge(440, 192, '1');
    b += P('M340 191L356 166', 'dim') + badge(340, 192, '2');
    b += P('M390 191L398 166', 'dim') + badge(390, 192, '3');
    /* legend */
    var leg = ['Positive plate: lead dioxide', 'Negative plate: lead', 'Separator (insulator)', 'Electrolyte: dilute acid', 'Cell connector'];
    for (i = 0; i < 5; i++) b += badge(32, 266 + i * 26, String(i + 1), 10) + t(50, 271 + i * 26, leg[i], 'ts');
    /* table */
    b += t(240, 252, 'Rest voltage and charge', 'tb');
    var rows = [['12.6 V', 'about 100%', 'good'], ['12.4 V', 'about 75%', 'good'], ['12.2 V', 'about 50%', 'tint-y-soft'], ['12.0 V', 'about 25%', 'tint-y-soft'], ['Below 11.9 V', 'Flat', 'bad']];
    for (i = 0; i < 5; i++) {
      b += '<rect x="240" y="' + (262 + i * 24) + '" width="220" height="22" rx="3" class="' + rows[i][2] + '"/>' + t(248, 278 + i * 24, rows[i][0], 'tsm') + t(350, 278 + i * 24, rows[i][1], 'tsm');
    }
    b += t(240, 396, 'Rest = no load or charging for hours.', 'ts');
    b += '<rect x="20" y="416" width="440" height="52" rx="4" class="bad"/>' + t(36, 438, 'Hydrogen gas: no sparks or flames', 'tb') + t(36, 457, 'A charging battery gives off explosive gas.', 'ts');
    return wrap(480, 480, 'Lead-acid battery construction',
      'Cutaway of a 12 volt battery with six cells in series, each 2.1 volts, with plates, separators, electrolyte and cell connectors, a close-up of a plate group, and a table of rest voltage against state of charge.', b);
  }
};

/* ---------------- Headlamp relay circuit ---------------- */
DIAGRAMS['headlamp-relay-circuit'] = {
  caption: 'The headlamp switch only carries the small coil current. The relay contacts carry the heavy current for both lamps, and the dip switch picks the dipped or main-beam filament.',
  svg: function () {
    var thin = ' style="stroke-width:1.5px"', b = '';
    /* battery and rails */
    b += battSym(40, 130) + t(56, 124, '+', 't-red') + t(56, 148, '−', 'tb') + t(24, 188, 'Battery', 'ts') + P('M40 135V165', 'wire-gnd') + earth(40, 165);
    b += P('M40 125V50H265V74', 'wire-pos') + fuseV(265, 90) + P('M265 106V130', 'wire-pos') + dot(40, 85);
    b += t(282, 92, 'Fuse', 'ts') + t(282, 118, 'Large current', 'ts');
    /* control */
    b += P('M40 85H82M118 85H176V130', 'wire-pos', thin) + swH(100, 85, true) + t(100, 68, 'Headlamp switch', 'ts', 'middle') + t(100, 112, 'Small current', 'ts', 'middle');
    /* relay */
    b += '<rect x="140" y="130" width="150" height="90" rx="5" class="box"/>' + '<rect x="165" y="152" width="22" height="44" rx="3" class="box tint-m"/>';
    b += P('M176 130V152M176 196V250', 'wire-pos', thin) + P('M176 220V250', 'wire-gnd') + earth(176, 250);
    b += P('M265 130V155M265 195V270', 'wire-pos') + P('M265 155L253 188', 'k bold') + dot(265, 155) + dot(265, 195) + P('M190 175H235', 'dim', ' stroke-dasharray="4 3"');
    b += t(184, 146, '86', 'ts') + t(184, 214, '85', 'ts') + t(273, 146, '30', 'ts') + t(273, 214, '87', 'ts') + t(220, 242, 'Relay', 'tb', 'middle');
    /* dip/main switch */
    b += dot(265, 270) + dot(225, 310) + dot(305, 310) + P('M265 270L300 305', 'k bold');
    b += t(215, 314, 'Main', 'ts', 'end') + t(315, 314, 'Dip', 'ts') + t(325, 270, 'Dip / main', 'ts') + t(325, 286, 'beam switch', 'ts');
    /* buses */
    b += P('M225 310V335M100 335H380M100 335V379M380 335V379', 'wire-pos') + dot(225, 335);
    b += P('M305 310V350M160 350H320M160 350V379M320 350V379', 'wire-pos') + dot(305, 350);
    /* lamps */
    b += '<rect x="70" y="358" width="130" height="62" rx="4" class="box tint-y-soft"/><rect x="290" y="358" width="140" height="62" rx="4" class="box tint-y-soft"/>';
    var lx = [100, 160, 320, 380], ln = ['Main', 'Dip', 'Dip', 'Main'], i;
    for (i = 0; i < 4; i++) b += lampSym(lx[i], 390, 11, true) + t(lx[i] + 14, 374, ln[i], 'ts') + P('M' + lx[i] + ' 401V432', 'wire-gnd');
    b += P('M100 432H380', 'wire-gnd') + earth(240, 432) + t(135, 456, 'Left headlamp', 'ts', 'middle') + t(360, 456, 'Right headlamp', 'ts', 'middle');
    b += t(240, 490, 'Relay keeps heavy lamp current out of the switch', 'tb', 'middle');
    return wrap(480, 502, 'Headlamp circuit with relay',
      'The battery feeds the headlamp switch, which energises a relay coil with a small current. The relay contacts, fed through a fuse, pass heavy current to a dip and main-beam switch, which feeds the dipped or main filaments of the left and right headlamps. The lamps return to earth.', b);
  }
};

/* ---------------- Reading a wiring diagram ---------------- */
DIAGRAMS['wiring-diagram-reading'] = {
  caption: 'A wiring diagram shows how parts connect, not where they are in the vehicle. Follow the power from the fuse, through the switch and the load, to earth. Wire labels give the size and colour.',
  svg: function () {
    var b = '';
    b += t(20, 22, 'Horn circuit (simplified)', 'tb');
    // battery feed
    b += '<path d="M60 40H200" class="wire-pos"/>' + t(24, 44, '+12 V', 'tsm');
    // fuse
    b += '<rect x="200" y="30" width="44" height="20" rx="3" class="box"/><path d="M204 40h36" class="k2"/>' + t(222, 66, 'F12  15 A', 'tsm', 'middle');
    b += '<path d="M244 40H300" class="wire-pos"/>' + t(272, 26, '0.75 RD/WH', 'tsm', 'middle');
    // splice
    b += '<circle cx="300" cy="40" r="4" class="head"/>' + t(312, 60, 'Splice', 'tsm');
    // down to switch
    b += '<path d="M300 40V90" class="wire-pos"/>';
    b += '<path d="M300 90v14" class="wire-pos"/><path d="M300 104l16 20" class="k bold"/><path d="M300 134v14" class="wire-pos"/><circle cx="300" cy="104" r="3" class="head"/><circle cx="300" cy="134" r="3" class="head"/>' + t(330, 122, 'Horn switch', 'tsm');
    b += '<path d="M300 134V190" class="wire-pos"/>';
    // connector
    b += '<rect x="286" y="160" width="28" height="18" rx="3" class="box tint-y-soft"/>' + t(322, 173, 'C101 pin 3', 'tsm');
    // dashed unit box with horn
    b += '<rect x="230" y="190" width="150" height="70" rx="6" fill="none" stroke="var(--ink-3)" stroke-width="1.5" stroke-dasharray="6 4"/>' + t(388, 214, 'Dashed box =', 'tsm') + t(388, 228, 'one unit', 'tsm');
    b += '<circle cx="300" cy="224" r="16" class="box"/>' + t(300, 229, 'M', 'tb', 'middle') + t(262, 228, 'Horn', 'tsm', 'end');
    b += '<path d="M300 240V290" class="wire-gnd"/>';
    // earth
    b += '<path d="M284 290h32M290 298h20M296 306h8" class="k"/>' + t(326, 296, 'G101', 'tsm') + t(326, 310, 'Earth point', 'tsm');
    // key
    b += '<rect x="20" y="96" width="140" height="196" rx="6" class="box"/>' + t(30, 116, 'Key', 'tb');
    b += '<rect x="30" y="126" width="26" height="12" rx="2" class="box"/>' + t(66, 136, 'Fuse', 'tsm');
    b += '<path d="M30 160h8l14-12" class="k"/>' + t(66, 160, 'Switch', 'tsm');
    b += '<circle cx="43" cy="184" r="10" class="box"/>' + t(66, 188, 'Motor', 'tsm');
    b += '<circle cx="43" cy="214" r="10" class="box"/><path d="M37 220l12-12M37 208l12 12" class="k2"/>' + t(66, 218, 'Lamp', 'tsm');
    b += '<path d="M31 250h24M35 257h16M39 264h8" class="k"/>' + t(66, 258, 'Earth', 'tsm');
    // wire code note
    b += t(20, 326, '0.75 = wire size in mm². RD/WH = red wire with a white stripe.', 'ts');
    b += t(20, 346, 'Power flows from the top (supply) to the bottom (earth).', 'ts');
    return wrap(480, 358, 'Reading a wiring diagram',
      'A simplified horn circuit with a fuse, splice, switch, connector, horn motor and earth point, plus a key of five common symbols.', b);
  }
};

/* ---------------- CAN bus ---------------- */
DIAGRAMS['can-bus'] = {
  caption: 'Modules share one twisted pair of wires. CAN-H and CAN-L carry opposite voltage swings, so interference cancels out. With the system off, a meter across the two lines should read about 60 Ω.',
  svg: function () {
    var b = '';
    var mods = [['Engine', 'ECU', 30], ['Trans-', 'mission', 140], ['ABS', '', 250], ['Body', '', 360]];
    mods.forEach(function (m) {
      b += box(m[2], 20, 90, 44, 'tint-c-soft') + t(m[2] + 45, m[1] ? 40 : 46, m[0], 'tsm', 'middle');
      if (m[1]) b += t(m[2] + 45, 54, m[1], 'tsm', 'middle');
      b += '<path d="M' + (m[2] + 35) + ' 64V92M' + (m[2] + 55) + ' 64V112" class="k"/>';
    });
    b += '<path d="M22 92H470" class="wire-pos"/><path d="M22 112H470" class="wire-sig"/>' + t(472, 88, 'CAN-H', 'tsm', 'end') + t(472, 128, 'CAN-L', 'tsm', 'end');
    b += '<rect x="16" y="94" width="12" height="16" rx="2" class="box tint-y"/>' + t(22, 146, '120 Ω', 'tsm', 'middle');
    b += '<rect x="464" y="94" width="12" height="16" rx="2" class="box tint-y"/>' + t(458, 146, '120 Ω', 'tsm', 'middle');
    b += t(240, 146, 'OBD socket: pin 6 = CAN-H, pin 14 = CAN-L', 'tsm', 'middle');
    // waveform
    b += t(20, 180, 'Signal on the two lines', 'tb');
    b += '<path d="M40 200H440M40 250H440" class="zero"/>';
    var hi = 'M40 232H100V216H150V232H210V216H250V232H300V216H360V232H440';
    var lo = 'M40 232H100V248H150V232H210V248H250V232H300V248H360V232H440';
    b += '<path d="' + hi + '" class="wave m"/><path d="' + lo + '" class="wave c"/>';
    b += t(30, 220, '3.5 V', 'tsm', 'end') + t(30, 236, '2.5 V', 'tsm', 'end') + t(30, 252, '1.5 V', 'tsm', 'end');
    b += t(125, 276, 'Dominant bit', 'ts', 'middle') + t(180, 276, '', 'ts') + t(270, 276, 'Recessive: both 2.5 V', 'ts', 'middle');
    b += t(240, 192, 'Dominant bit: CAN-H goes up, CAN-L goes down', 'tsm', 'middle');
    return wrap(480, 292, 'CAN bus',
      'Four modules connected by two twisted wires, CAN-H and CAN-L, with a 120 ohm termination resistor at each end, and the voltage waveform on the two lines.', b);
  }
};

/* ---------------- Signal types ---------------- */
DIAGRAMS['signal-types'] = {
  caption: 'Sensors send information in different forms. Choose the right test: a meter for slow analogue and on/off signals, a scope or duty-cycle meter for PWM and frequency signals.',
  svg: function () {
    function panel(x, y, title, use, d) {
      var s = '<rect x="' + x + '" y="' + y + '" width="220" height="130" rx="6" class="box"/>';
      s += t(x + 10, y + 20, title, 'tb') + t(x + 10, y + 118, use, 'tsm');
      s += '<path d="M' + (x + 10) + ' ' + (y + 90) + 'H' + (x + 210) + 'M' + (x + 10) + ' ' + (y + 90) + 'V' + (y + 34) + '" class="dim"/>';
      s += '<path d="' + d + '" class="wave c"/>';
      return s;
    }
    var b = '';
    // analogue
    var a = 'M24 80';
    for (var i = 0; i <= 190; i += 5) a += 'L' + (24 + i) + ' ' + (70 - 18 * Math.sin(i / 34)).toFixed(1);
    b += panel(10, 10, 'Analogue', 'Temperature sensor', a);
    b += panel(250, 10, 'On / off (digital)', 'Switch: 0 V or 5 V', 'M264 78H300V46H340V78H380V46H420V78H450');
    b += panel(10, 150, 'PWM', 'Fan or injector control', 'M24 238V208H36V238H72V208H84V238H120V208H132V238H168V208H180V238');
    b = b.replace("M24 238V208H36V238H72V208H84V238H120V208H132V238H168V208H180V238", "M24 238V208H34V238H64V208H74V238H104V208H114V238H144V208H174V238H184V208H208V238");
    b += panel(250, 150, 'Frequency', 'Speed sensor: more pulses', 'M264 238V208H270V238H294V208H300V238H324V208H330V238H350V208H354V238H372V208H376V238H392V208H396V238H410V208H413V238H425V208H428V238H438V208H440V238');
    b += t(70, 196, '25% on', 'tsm', 'middle') + t(170, 196, '75% on', 'tsm', 'middle');
    return wrap(480, 296, 'Signal types',
      'Four small panels showing an analogue signal, an on and off digital signal, a pulse-width-modulated signal and a frequency signal.', b);
  }
};

/* ---------------- EV powertrain ---------------- */
DIAGRAMS['ev-powertrain'] = {
  caption: 'High-voltage parts are joined by orange cables. The pack typically works at 200 to 800 V. Only trained and certified technicians isolate and work on these parts.',
  svg: function () {
    var b = '';
    // car body top view
    b += '<rect x="130" y="20" width="220" height="330" rx="40" class="box"/>';
    [[110, 48], [350, 48], [110, 276], [350, 276]].forEach(function (w) { b += '<rect x="' + w[0] + '" y="' + w[1] + '" width="20" height="56" rx="6" class="rubber"/>'; });
    b += t(240, 14, 'Front', 'ts', 'middle');
    // battery pack
    b += '<rect x="170" y="150" width="140" height="100" rx="6" class="box tint-y"/>' + t(240, 196, 'HV battery pack', 'tb', 'middle') + t(240, 214, '200 to 800 V', 'tsm', 'middle');
    // motor at front axle
    b += '<rect x="196" y="60" width="88" height="40" rx="6" class="box tint-c"/>' + t(240, 84, 'Motor + gear', 'tsm', 'middle');
    b += '<path d="M130 76H196M284 76H350" class="k bold"/>';
    // inverter
    b += '<rect x="196" y="112" width="88" height="28" rx="4" class="box tint-m-soft"/>' + t(240, 131, 'Inverter', 'tsm', 'middle');
    // charger + port
    b += '<rect x="170" y="268" width="64" height="30" rx="4" class="box"/>' + t(202, 287, 'Charger', 'tsm', 'middle');
    b += '<rect x="244" y="268" width="66" height="30" rx="4" class="box"/>' + t(277, 287, 'DC-DC', 'tsm', 'middle');
    b += '<circle cx="240" cy="326" r="9" class="box tint-g"/>' + t(256, 330, 'Charge port', 'tsm');
    // cables orange
    b += '<path d="M240 250V268M240 140V150M240 100V112M202 298V318H232" class="wire-pos" stroke-width="5" style="stroke:var(--yellow);stroke-width:5"/>';
    b += '<path d="M310 283H370" class="k2"/>' + box(370, 266, 90, 36) + t(415, 288, '12 V battery', 'tsm', 'middle');
    b += '<path d="M24 366h30" class="wire-pos" style="stroke:var(--yellow);stroke-width:5"/>' + t(64, 370, 'Orange cable = high voltage', 'ts');
    return wrap(480, 384, 'Electric vehicle powertrain layout',
      'Top view of an electric car showing the high-voltage battery pack, inverter, motor, charger, DC-DC converter, charge port and the separate 12 volt battery.', b);
  }
};

/* ---------------- Hybrid architectures ---------------- */
DIAGRAMS['hybrid-architectures'] = {
  caption: 'Series: the engine only makes electricity. Parallel: engine and motor can both drive the wheels. Series-parallel: a power-split device lets the car work as either.',
  svg: function () {
    function bx(x, y, w, l, tint) { return box(x, y, w, 30, tint) + t(x + w / 2, y + 20, l, 'tsm', 'middle'); }
    function ar(d) { return '<path d="' + d + '" class="k" marker-end="url(#ar)"/>'; }
    var b = '';
    b += t(80, 18, 'Series', 'tb', 'middle') + t(240, 18, 'Parallel', 'tb', 'middle') + t(400, 18, 'Series-parallel', 'tb', 'middle');
    b += ar('M80 66V96M80 126V156M80 186V216M80 246V276');
    b += bx(30, 36, 100, 'Engine', 'tint-m-soft') + bx(30, 96, 100, 'Generator') + bx(30, 156, 100, 'Battery', 'tint-y') + bx(30, 216, 100, 'Motor', 'tint-c') + bx(30, 276, 100, 'Wheels');
    b += ar('M240 66V96M240 126V276') + ar('M212 166V126') + ar('M250 181H236');
    b += bx(190, 36, 100, 'Engine', 'tint-m-soft') + bx(190, 96, 100, 'Gearbox') + box(190, 166, 46, 30, 'tint-c') + t(213, 186, 'Motor', 'tsm', 'middle') + box(250, 166, 40, 30, 'tint-y') + t(270, 186, 'Batt.', 'tsm', 'middle') + bx(190, 276, 100, 'Wheels');
    b += ar('M400 66V96M375 126V156M425 126V156M375 186V216M425 186V216M375 246V276M425 246V276');
    b += bx(350, 36, 100, 'Engine', 'tint-m-soft') + bx(350, 96, 100, 'Power split');
    b += bx(350, 156, 46, 'Gen', '') + bx(404, 156, 46, 'Motor', 'tint-c');
    b += box(350, 216, 100, 30, 'tint-y') + t(400, 236, 'Battery', 'tsm', 'middle') + bx(350, 276, 100, 'Wheels');
    b += t(240, 326, 'Arrows show the main power paths', 'ts', 'middle');
    return wrap(480, 338, 'Hybrid architectures',
      'Three block diagrams: series hybrid, parallel hybrid and series-parallel hybrid, showing the engine, motor, generator, battery and wheels and how power flows.', b);
  }
};
