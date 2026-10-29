/* Diagrams for m06, m07, m08. */
import { DIAGRAMS, wrap, t, badge, box, node, wavePath } from './core.js';

/* Small local helpers (colour still comes only from CSS classes). */
function pipe(d, kind, w) { return '<path d="' + d + '" class="pipe ' + kind + '" style="stroke-width:' + (w || 7) + '"/>'; }
function arr(d, cls) { return '<path d="' + d + '" class="' + (cls || 'k2') + '" marker-end="url(#ar)"/>'; }
function rect(x, y, w, h, cls, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx === undefined ? 3 : rx) + '" class="' + cls + '"/>'; }
function earth(x, y) {
  return '<path d="M' + x + ' ' + y + 'V' + (y + 8) + 'M' + (x - 11) + ' ' + (y + 8) + 'H' + (x + 11) + 'M' + (x - 7) + ' ' + (y + 14) + 'H' + (x + 7) + 'M' + (x - 3) + ' ' + (y + 20) + 'H' + (x + 3) + '" class="k"/>';
}
function dot(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="3.4" class="head"/>'; }
function warn(x, y) {
  return '<polygon points="' + x + ',' + (y - 15) + ' ' + (x + 17) + ',' + (y + 14) + ' ' + (x - 17) + ',' + (y + 14) + '" class="bad k" style="stroke:var(--ink);stroke-width:1.7"/>' +
    '<text x="' + x + '" y="' + (y + 9) + '" class="tb" text-anchor="middle">!</text>';
}

/* ---------------- Petrol fuel system ---------------- */
DIAGRAMS['petrol-fuel-system'] = {
  caption: 'The pump pushes fuel through the filter to the rail. The ECU opens each injector for a measured time. The regulator keeps the rail pressure steady.',
  svg: function () {
    var s = '';
    /* tank */
    s += rect(10, 215, 180, 100, 'metal', 6) + rect(12, 240, 176, 73, 'fl-oil', 4);
    s += t(72, 234, 'Fuel tank', 'tb');
    s += rect(30, 262, 50, 24, 'metal-dark', 3) + t(55, 279, 'Pump', 'tsm', 'middle');
    s += rect(30, 296, 50, 10, 'box', 2) + t(90, 306, 'Strainer', 'ts');
    /* feed pipe */
    s += pipe('M55 262V132H268', 'fuel');
    s += rect(160, 118, 60, 28, 'box tint-y-soft', 4) + t(190, 137, 'Filter', 'tsm', 'middle');
    s += arr('M96 132H140') + arr('M224 132H258');
    s += t(110, 118, 'Fuel line', 'ts', 'middle');
    /* rail, injectors, regulator */
    s += rect(268, 120, 128, 24, 'metal', 3) + rect(268, 120, 128, 24, 'fl-oil', 3) + t(332, 137, 'Fuel rail', 'tsm', 'middle');
    var cx = [286, 316, 346, 376];
    cx.forEach(function (x) {
      s += rect(x - 7, 144, 14, 32, 'metal-dark', 2) + '<path d="M' + (x - 6) + ' 176L' + x + ' 192L' + (x + 6) + ' 176Z" class="fl-oil"/>';
    });
    s += t(331, 212, 'Injectors spray into the ports', 'ts', 'middle');
    s += rect(396, 112, 44, 40, 'box tint-c-soft', 8) + t(418, 137, 'Reg', 'tsm', 'middle');
    s += pipe('M418 112V98', 'gas', 4) + t(470, 88, 'Vacuum hose', 'ts', 'end');
    s += t(418, 170, 'Pressure', 'ts', 'middle') + t(418, 185, 'regulator', 'ts', 'middle');
    /* return line */
    s += arr('M440 132H466V250H170V222', 'flow');
    s += t(318, 244, 'Return line (not on returnless systems)', 'ts', 'middle');
    /* ECU */
    s += rect(20, 22, 100, 32, 'box tint-c', 4) + t(70, 43, 'ECU', 'tb', 'middle');
    s += '<path d="M120 38H376" class="wire-sig"/>';
    cx.forEach(function (x) { s += '<path d="M' + x + ' 38V118" class="wire-sig"/>' + dot(x, 118); });
    s += t(130, 30, 'Signal to injectors', 't-blue');
    /* pressure note */
    s += rect(205, 262, 265, 62, 'box tint-y-soft', 4);
    s += t(217, 282, 'Typical port-injection pressure:', 'tsm');
    s += t(217, 299, 'about 3 to 4 bar (43 to 58 psi).', 'tb');
    s += t(217, 315, 'Check the manual.', 'ts');
    s += t(20, 344, 'Returnless systems: the regulator is in the tank.', 'ts');
    return wrap(480, 356, 'Petrol fuel system',
      'A fuel tank with an in-tank pump and strainer feeds fuel through a filter to a fuel rail with four injectors and a pressure regulator. A dashed return line goes back to the tank. The ECU sends a signal to each injector.', s);
  }
};

/* ---------------- Ignition coil circuit ---------------- */
function turns(x, y0, n, d, rx, dir) {
  var p = 'M' + x + ' ' + y0;
  for (var i = 0; i < n; i++) p += 'a' + rx + ' ' + (d / 2) + ' 0 0 ' + (dir > 0 ? 1 : 0) + ' 0 ' + d;
  return '<path d="' + p + '" class="k"/>';
}
DIAGRAMS['ignition-coil-circuit'] = {
  caption: 'The igniter switches the primary current on and off. Each time it switches off, the magnetic field collapses fast and the secondary winding makes a very high voltage for the spark.',
  svg: function () {
    var s = '';
    /* battery and switch */
    s += '<path d="M30 50V90M30 116V132" class="wire-pos"/>' + earth(30, 132).replace('class="k"', 'class="wire-gnd"');
    s += '<path d="M18 90H42M24 98H36M18 108H42M24 116H36" class="k bold"/>';
    s += t(40, 72, '+12 V', 't-red') + t(48, 114, 'Battery', 'ts');
    s += '<path d="M30 50H85" class="wire-pos"/><circle cx="85" cy="50" r="3.5" class="box"/><circle cx="125" cy="50" r="3.5" class="box"/>';
    s += '<path d="M85 50L118 36" class="k"/><path d="M128 50H204V100" class="wire-pos"/>';
    s += t(105, 24, 'Ignition switch', 'ts', 'middle');
    /* coil */
    s += rect(204, 96, 20, 128, 'metal', 2);
    s += turns(204, 100, 4, 30, 14, -1) + turns(224, 100, 10, 12, 9, 1);
    s += '<path d="M204 220V270" class="wire-pos"/>';
    s += '<path d="M224 100V70H430V100" class="k"/><path d="M224 220H285V340" class="k"/>' + dot(285, 340);
    s += t(186, 138, 'Primary winding', 'tb', 'end') + t(186, 156, '12 V, few turns', 'ts', 'end');
    s += t(246, 138, 'Secondary winding', 'tb') + t(246, 156, '20 000 to 40 000 V,', 'ts') + t(246, 172, 'many turns', 'ts');
    s += t(214, 248, 'Iron core', 'ts') + '<path d="M214 226V236" class="dim"/>';
    /* igniter */
    s += rect(150, 270, 92, 44, 'box tint-m-soft', 4) + t(196, 288, 'Igniter', 'tb', 'middle') + t(196, 306, '(switch)', 'ts', 'middle');
    s += '<path d="M204 314V340H462V190H448" class="k"/>';
    /* ECU */
    s += rect(10, 270, 116, 44, 'box tint-c', 4) + t(68, 289, 'ECU', 'tb', 'middle') + t(68, 306, '(or crank sensor)', 'ts', 'middle');
    s += arr('M126 292H148', 'wire-sig') + t(10, 262, 'Switching signal', 't-blue');
    /* plug */
    s += rect(420, 100, 20, 70, 'metal', 3) + rect(412, 170, 36, 40, 'metal-dark', 3);
    s += rect(428, 210, 4, 26, 'metal-dark', 1);
    s += '<path d="M444 210V256H424" class="k bold"/>';
    s += '<path d="M430 238l-5 5 10 5-5 6" class="wire-pos"/>';
    s += t(430, 58, 'Spark plug', 'ts', 'middle') + t(430, 282, 'Spark gap', 'ts', 'middle') + t(430, 298, 'about 1 mm', 'ts', 'middle');
    s += earth(330, 340);
    /* note */
    s += rect(10, 380, 460, 62, 'box tint-y-soft', 4);
    s += t(24, 402, 'Igniter on: current builds a magnetic field.', 'tsm');
    s += t(24, 420, 'Igniter off: the field collapses and induces', 'tsm');
    s += t(24, 436, 'a high voltage. The spark jumps the gap.', 'tsm');
    return wrap(480, 452, 'Ignition coil circuit',
      'Battery positive goes through the ignition switch to the primary winding. An igniter, switched by the ECU or crank sensor signal, connects the primary to earth. The secondary winding feeds the spark plug.', s);
  }
};

/* ---------------- Air-fuel ratio ---------------- */
DIAGRAMS['air-fuel-ratio'] = {
  caption: 'Petrol engines run best near 14.7 parts air to 1 part fuel (lambda 1.0). The oxygen sensor voltage swings up and down as the ECU keeps the mixture close to this point.',
  svg: function () {
    var X = function (r) { return 30 + (r - 10) * 46.67; };
    var s = '';
    s += t(30, 20, 'Rich: more fuel', 'tb') + t(450, 20, 'Lean: more air', 'tb', 'end');
    s += '<rect x="30" y="58" width="420" height="28" class="box"/>';
    s += '<rect x="30" y="58" width="' + (X(11) - 30) + '" height="28" class="bad"/>';
    s += '<rect x="' + X(12.5) + '" y="58" width="' + (X(13) - X(12.5)) + '" height="28" class="tint-y"/>';
    s += '<rect x="' + X(15) + '" y="58" width="' + (X(16) - X(15)) + '" height="28" class="tint-c"/>';
    s += '<rect x="' + X(17) + '" y="58" width="' + (450 - X(17)) + '" height="28" class="bad"/>';
    s += '<rect x="30" y="58" width="420" height="28" class="k"/>';
    s += '<path d="M' + X(14.7) + ' 50V94" class="k bold"/>';
    s += '<rect x="' + (X(14.7) - 3) + '" y="58" width="6" height="28" class="good"/>';
    s += t(X(14.7), 42, '14.7 : 1 (lambda 1.0)', 'tb', 'middle');
    for (var r = 10; r <= 19; r++) s += '<path d="M' + X(r) + ' 86V92" class="k2"/>' + t(X(r), 108, r, 'ts', 'middle');
    var rows = [
      ['bad', 'Below 11:1', 'Too rich: black smoke, wasted fuel'],
      ['tint-y', '12.5 to 13:1', 'Power (rich)'],
      ['good', '14.7:1', 'Lambda 1.0: best for the catalytic converter'],
      ['tint-c', '15 to 16:1', 'Economy (lean)'],
      ['bad', 'Above 17:1', 'Too lean: misfire, hot, damaging']
    ];
    rows.forEach(function (rw, i) {
      var y = 136 + i * 24;
      s += '<rect x="30" y="' + (y - 12) + '" width="16" height="16" class="' + rw[0] + '"/><rect x="30" y="' + (y - 12) + '" width="16" height="16" class="k2"/>';
      s += t(56, y, rw[1], 'tb') + t(168, y, rw[2], 't');
    });
    /* lambda sensor */
    s += t(30, 280, 'Oxygen (lambda) sensor voltage', 'tb');
    s += '<path d="M60 296V396H400" class="k2"/>';
    s += '<path d="M60 308H400M60 346H400M60 384H400" class="zero"/>';
    s += t(52, 313, '0.9 V', 'ts', 'end') + t(52, 351, '0.45 V', 'ts', 'end') + t(52, 389, '0.1 V', 'ts', 'end');
    s += '<path d="' + wavePath(60, 340, function (x) {
      var v = Math.sin(x / 340 * 6 * Math.PI);
      return 346 - 38 * (v < 0 ? -1 : 1) * Math.pow(Math.abs(v), 0.35);
    }) + '" class="wave g"/>';
    s += t(408, 313, 'Rich', 'tb') + t(408, 351, 'Lambda 1', 'ts') + t(408, 389, 'Lean', 'tb');
    s += t(230, 414, 'Time', 'ts', 'middle');
    s += t(30, 440, 'The ECU keeps the mixture swinging around lambda 1.', 'ts');
    return wrap(480, 452, 'Air-fuel ratio and lambda sensor',
      'A bar from rich on the left to lean on the right with 14.7 to 1 marked, and a waveform below showing the oxygen sensor voltage switching between about 0.1 and 0.9 volts.', s);
  }
};

/* ---------------- Common rail diesel ---------------- */
DIAGRAMS['common-rail-diesel'] = {
  caption: 'A lift pump feeds the filter and high-pressure pump. The pump fills the rail with very high pressure fuel. The ECU opens each injector electronically. Extra fuel returns to the tank.',
  svg: function () {
    var s = '';
    var cx = [150, 195, 240, 285];
    /* low pressure row */
    s += rect(10, 270, 70, 60, 'metal', 5) + rect(12, 292, 66, 36, 'fl-oil', 3) + t(45, 286, 'Tank', 'tb', 'middle');
    s += pipe('M80 300H104M136 300H175M255 300H290', 'fuel', 4);
    s += arr('M84 300H96') + arr('M144 300H168') + arr('M259 300H284');
    s += '<circle cx="120" cy="300" r="16" class="box tint-y-soft"/>' + t(120, 305, 'P', 'tb', 'middle');
    s += t(120, 336, 'Lift pump', 'ts', 'middle');
    s += rect(175, 280, 80, 40, 'box tint-y-soft', 4) + t(215, 304, 'Filter', 'tsm', 'middle');
    s += t(215, 338, 'Filter and', 'ts', 'middle') + t(215, 354, 'water separator', 'ts', 'middle');
    s += rect(290, 275, 70, 50, 'metal-dark', 4) + t(325, 304, 'Pump', 'tsm', 'middle');
    s += t(335, 338, 'High-pressure', 'ts', 'middle') + t(335, 354, 'pump', 'ts', 'middle');
    s += t(150, 270, 'Low pressure side', 't-amber');
    /* high pressure pipe and rail */
    s += pipe('M325 275V154', 'hot', 10);
    s += arr('M325 262V232');
    s += rect(125, 130, 225, 24, 'metal', 3) + rect(125, 130, 225, 24, 'fl-hot', 3) + t(237, 147, 'Common rail', 'tsm', 'middle');
    cx.forEach(function (x) {
      s += rect(x - 7, 154, 14, 40, 'metal-dark', 2) + '<path d="M' + (x - 4) + ' 194L' + x + ' 204L' + (x + 4) + ' 194Z" class="fl-hot"/>';
    });
    s += t(217, 224, 'Electronic injectors', 'ts', 'middle');
    s += t(336, 190, 'High pressure:', 't-red') + t(336, 206, 'up to 1 600 bar', 't-red') + t(336, 222, 'or more (modern', 'ts') + t(336, 238, 'systems: higher)', 'ts');
    /* sensor and valve */
    s += rect(330, 108, 22, 22, 'box tint-c', 3) + t(358, 123, 'Pressure sensor', 'ts');
    s += rect(99, 130, 26, 24, 'box tint-c-soft', 3) + t(10, 176, 'Pressure', 'ts') + t(10, 192, 'control valve', 'ts');
    /* return */
    s += arr('M112 154V250H45V268', 'flow');
    s += t(122, 244, 'Return line', 'ts');
    /* ECU */
    s += rect(190, 12, 100, 28, 'box tint-c', 4) + t(240, 31, 'ECU', 'tb', 'middle');
    s += '<path d="M240 40V70M150 70H285" class="wire-sig"/>';
    cx.forEach(function (x) { s += arr('M' + x + ' 70V128', 'wire-sig'); });
    s += arr('M190 26H112V128', 'wire-sig');
    s += arr('M341 108V52H275V42', 'wire-sig');
    s += arr('M290 26H468V300H362', 'wire-sig');
    /* warning */
    s += rect(10, 376, 460, 54, 'box tint-m-soft', 4) + warn(40, 403);
    s += t(66, 399, 'High pressure: never feel for leaks', 'tb') + t(66, 418, 'with your hand. Fuel can pierce the skin.', 'ts');
    return wrap(480, 442, 'Common rail diesel system',
      'Fuel goes from the tank through a lift pump and a filter with a water separator to the high-pressure pump, which fills the common rail. Four injectors spray from the rail. A return line goes back to the tank. The ECU controls the injectors, the pump and the rail pressure valve.', s);
  }
};

/* Outlined filled shape: a tint fill plus a plain outline. */
function shape(x, y, w, h, fill, rx) { return rect(x, y, w, h, fill, rx) + rect(x, y, w, h, 'k', rx); }

/* ---------------- Turbocharger ---------------- */
DIAGRAMS['turbocharger'] = {
  caption: 'Hot exhaust gas spins the turbine. The shaft spins the compressor, which pushes extra air into the engine. The intercooler cools that air so more of it fits in the cylinders.',
  svg: function () {
    var s = '';
    /* oil */
    s += pipe('M240 100V142', 'oil', 7) + arr('M240 108V136') + t(252, 112, 'Oil in', 'ts');
    s += pipe('M240 198V238', 'oil', 7) + arr('M240 206V232') + t(252, 228, 'Oil return', 'ts');
    /* compressor housing (cold side), bearing housing and turbine housing (hot side), drawn as cast volutes */
    s += pipe('M10 170H60', 'cold', 14) + arr('M14 170H56') + t(10, 196, 'Fresh', 'ts') + t(10, 212, 'air in', 'ts');
    s += '<path d="M60 128Q60 105 92 105H146V235H92Q60 235 60 212Z" style="fill:#aebcc8;stroke:#4a5560;stroke-width:1.6"/><path d="M146 105Q166 120 166 170Q166 220 146 235" style="fill:none;stroke:#4a5560;stroke-width:1.6"/><path d="M70 122Q96 112 140 112" style="fill:none;stroke:#fff;stroke-width:3;opacity:0.55;stroke-linecap:round"/>';
    s += '<rect x="150" y="142" width="180" height="56" rx="6" class="metal"/><path d="M150 152H330M150 188H330" style="stroke:#59626b;stroke-width:1;opacity:0.6"/>' + t(240, 190, 'Centre bearing housing', 'tsm', 'middle');
    s += '<path d="M410 128Q410 105 378 105H330V235H378Q410 235 410 212Z" style="fill:#d9a9a0;stroke:#6b3a33;stroke-width:1.6"/><path d="M330 105Q312 120 312 170Q312 220 330 235" style="fill:none;stroke:#6b3a33;stroke-width:1.6"/><path d="M400 122Q380 112 338 112" style="fill:none;stroke:#fff;stroke-width:3;opacity:0.45;stroke-linecap:round"/>';
    /* compressor wheel and turbine wheel, with blades */
    var bl = '';
    for (var k = 0; k < 7; k++) {
      var yy = 126 + k * 8.5;
      bl += '<path d="M112 ' + yy + 'L146 ' + (yy + 8) + '" style="stroke:#59626b;stroke-width:1.2"/>';
    }
    s += '<polygon points="108,128 146,152 146,188 108,212" class="metal"/>' + bl + '<circle cx="108" cy="170" r="5" class="metal-dark"/>';
    var bt = '';
    for (var q = 0; q < 7; q++) {
      var y2 = 126 + q * 8.5;
      bt += '<path d="M368 ' + y2 + 'L332 ' + (y2 + 8) + '" style="stroke:#3a2a27;stroke-width:1.2"/>';
    }
    s += '<polygon points="368,128 332,152 332,188 368,212" class="metal-dark"/>' + bt + '<circle cx="368" cy="170" r="5" class="metal"/>';
    s += '<rect x="146" y="166" width="186" height="8" rx="3" style="fill:#e6eaee;stroke:#3b4148;stroke-width:1.2"/>' + t(240, 162, 'Shaft', 'tsm', 'middle');
    /* exhaust gas */
    s += pipe('M380 30V105', 'hot', 14) + arr('M380 40V98') + t(366, 48, 'Exhaust in', 'ts', 'end');
    s += pipe('M410 170H474', 'hot', 14) + arr('M414 170H470');
    s += t(442, 192, 'Exhaust', 'ts', 'middle') + t(442, 208, 'out', 'ts', 'middle');
    /* wastegate */
    s += pipe('M380 66H458V164', 'hot', 6);
    s += '<rect x="444" y="102" width="28" height="24" rx="5" class="metal"/><circle cx="458" cy="114" r="5" class="metal-dark"/><path d="M458 126V150" style="stroke:#59626b;stroke-width:3"/>' + t(470, 54, 'Wastegate', 'ts', 'end');
    /* compressed air */
    s += pipe('M80 235V300H140', 'hot', 7) + t(10, 324, 'Hot compressed air', 'ts');
    s += '<rect x="140" y="284" width="90" height="32" rx="4" style="fill:#59626b;stroke:#2a2f35;stroke-width:1.4"/>'; for (var fi = 0; fi < 11; fi++) s += '<path d="M' + (148 + fi * 7.4) + ' 288V312" style="stroke:#cfd4da;stroke-width:1.4;opacity:0.85"/>'; s += '<rect x="128" y="290" width="12" height="20" rx="2" class="metal"/><rect x="230" y="290" width="12" height="20" rx="2" class="metal"/>' + t(185, 277, 'Intercooler', 'tsm', 'middle');
    s += pipe('M230 300H330', 'cold', 7) + arr('M236 300H326') + t(240, 340, 'Cooled air to engine intake', 'ts', 'middle');
    /* side labels */
    s += t(115, 262, 'Intake side', 't-blue', 'middle') + t(115, 279, '(compressor)', 'ts', 'middle');
    s += t(370, 262, 'Exhaust side', 't-red', 'middle') + t(370, 279, '(turbine)', 'ts', 'middle');
    s += t(240, 378, 'Boost pressure: typically 0.5 to 2 bar above atmospheric', 't', 'middle');
    return wrap(480, 394, 'Turbocharger cut-away',
      'Exhaust gas enters the turbine housing on the right and spins the turbine wheel. A shaft turns the compressor wheel on the left, which draws in fresh air and pushes it through an intercooler to the engine. A wastegate lets some exhaust bypass the turbine. Engine oil flows through the centre bearing housing.', s);
  }
};

/* ---------------- Engine management loop ---------------- */
DIAGRAMS['engine-management-loop'] = {
  caption: 'Sensors tell the ECU what the engine is doing. The ECU decides, then drives the actuators. The oxygen sensor closes the loop by checking the result.',
  svg: function () {
    var ins = ['Coolant temp', 'Intake air temp', 'Airflow or MAP', 'Throttle position', 'Crank and cam', 'Knock sensor', 'Oxygen sensor'];
    var outs = ['Ignition coils', 'Idle / throttle motor', 'EGR valve', 'Purge valve', 'Cam timing valve', 'Injectors'];
    var s = t(79, 22, 'Inputs (sensors)', 'tb', 'middle') + t(401, 22, 'Outputs (actuators)', 'tb', 'middle');
    ins.forEach(function (n, i) {
      var y = 36 + i * 40;
      s += rect(8, y, 142, 30, i === 6 ? 'box tint-m-soft' : 'box', 4) + t(79, y + 20, n, 'tsm', 'middle');
      s += arr('M150 ' + (y + 15) + 'H190', 'wire-sig');
    });
    outs.forEach(function (n, i) {
      var y = 44 + i * 48;
      s += rect(330, y, 142, 30, i === 5 ? 'box tint-m-soft' : 'box', 4) + t(401, y + 20, n, 'tsm', 'middle');
      s += arr('M290 ' + (y + 15) + 'H330', 'wire-sig');
    });
    s += rect(190, 36, 100, 270, 'box tint-c', 6) + t(240, 166, 'ECU', 'tbig', 'middle') + t(240, 190, 'computer', 'ts', 'middle');
    /* feedback loop */
    s += arr('M401 314V350H79V310', 'wire-pos bold');
    s += t(240, 342, 'Injectors, engine, exhaust, sensor', 'ts', 'middle');
    s += t(240, 378, 'Closed loop: the oxygen sensor tells', 'tb', 'middle') + t(240, 398, 'the ECU how to correct the fuel.', 'tb', 'middle');
    return wrap(480, 412, 'Engine management loop',
      'A block diagram. Seven sensors feed the ECU in the centre. The ECU drives six actuators on the right. A red feedback path runs from the injectors through the engine to the oxygen sensor and back into the ECU.', s);
  }
};

/* ---------------- Catalytic converter ---------------- */
DIAGRAMS['catalytic-converter'] = {
  caption: 'Hot exhaust passes through a ceramic honeycomb coated with precious metals. Three harmful gases are turned into three much safer ones.',
  svg: function () {
    var s = '';
    s += t(14, 58, 'In: CO, HC, NOx', 'tb') + t(466, 58, 'Out: CO2, H2O, N2', 'tb', 'end');
    s += pipe('M10 110H92', 'hot', 14) + arr('M14 110H88');
    s += pipe('M388 110H470', 'gas', 14) + arr('M392 110H466');
    s += '<polygon points="88,104 124,70 356,70 392,104 392,116 356,150 124,150 88,116" class="metal"/>';
    s += rect(136, 80, 208, 60, 'box tint-y', 3);
    var g = '';
    for (var x = 146; x < 344; x += 10) g += 'M' + x + ' 80V140';
    for (var y = 90; y < 140; y += 10) g += 'M136 ' + y + 'H344';
    s += '<path d="' + g + '" class="dim"/>';
    s += '<path d="M240 150V162" class="dim"/>' + t(240, 178, 'Ceramic honeycomb with', 'ts', 'middle') + t(240, 194, 'precious-metal coating', 'ts', 'middle');
    /* sensors */
    s += '<path d="M60 117V134M430 117V134" class="k"/>' + rect(50, 134, 20, 16, 'box tint-c', 3) + rect(420, 134, 20, 16, 'box tint-c', 3);
    s += t(60, 170, 'Upstream', 'ts', 'middle') + t(60, 186, 'oxygen sensor', 'ts', 'middle');
    s += t(430, 170, 'Downstream', 'ts', 'middle') + t(430, 186, 'oxygen sensor', 'ts', 'middle');
    /* reaction table */
    s += rect(10, 212, 460, 118, 'box', 4) + '<path d="M10 242H470" class="dim"/>';
    s += t(22, 233, 'Reaction inside', 'tb') + t(236, 233, 'What it does', 'tb');
    s += t(22, 266, '2CO + O2 → 2CO2', 'tsm') + t(236, 266, 'Burns carbon monoxide', 'ts');
    s += t(22, 292, 'HC + O2 → CO2 + H2O', 'tsm') + t(236, 292, 'Burns unburnt fuel', 'ts');
    s += t(22, 318, '2NOx → N2 + x O2', 'tsm') + t(236, 318, 'Splits nitrogen oxides', 'ts');
    s += rect(10, 342, 460, 32, 'good', 4) + t(240, 363, 'Works best above about 400 °C', 'tb', 'middle');
    s += rect(10, 386, 460, 58, 'bad', 4) + warn(38, 415);
    s += t(64, 410, 'Misfires send unburnt fuel into the', 'tb') + t(64, 430, 'converter and can overheat it.', 'tb');
    return wrap(480, 456, 'Three-way catalytic converter cut-away',
      'Exhaust containing carbon monoxide, hydrocarbons and nitrogen oxides enters a converter, passes through a ceramic honeycomb with a precious-metal coating, and leaves as carbon dioxide, water and nitrogen. Oxygen sensors sit before and after the converter. A table lists the three reactions.', s);
  }
};

/* ---------------- Emission controls ---------------- */
function vtext(x, y, label) { return '<text x="' + x + '" y="' + y + '" class="ts" text-anchor="middle" transform="rotate(-90 ' + x + ' ' + y + ')">' + label + '</text>'; }
DIAGRAMS['emission-controls'] = {
  caption: 'Four loops clean up an engine: PCV and EGR send gases back into the intake, the EVAP system traps fuel vapour, and the catalytic converter and DPF treat the exhaust.',
  svg: function () {
    var s = '';
    /* engine and manifolds */
    s += shape(180, 150, 120, 100, 'metal', 4) + t(240, 206, 'Engine', 'tb', 'middle');
    s += shape(140, 160, 40, 80, 'fl-cold', 3) + vtext(164, 200, 'Intake');
    s += shape(300, 160, 40, 80, 'fl-hot', 3) + vtext(324, 200, 'Exhaust');
    /* air in */
    s += arr('M10 205H140', 'k2') + t(14, 195, 'Air in', 'ts');
    /* PCV */
    s += arr('M190 150V110H170V158', 'wire-sig') + t(198, 124, 'PCV: crankcase', 'ts') + t(198, 140, 'vapours to intake', 'ts');
    /* EGR */
    s += arr('M320 160V70H150V158', 'wire-pos');
    s += rect(308, 98, 24, 22, 'box tint-c-soft', 3) + t(340, 114, 'EGR valve', 'ts');
    s += t(158, 32, 'EGR: exhaust gas back to the intake', 'tb') + t(158, 52, 'Cools combustion, so less NOx', 'ts');
    /* evaporative system */
    s += shape(10, 392, 120, 60, 'metal', 6) + rect(12, 416, 116, 34, 'fl-oil', 4) + t(70, 410, 'Fuel tank', 'tb', 'middle');
    s += arr('M60 392V354', 'k2') + t(68, 376, 'Fuel vapour', 'ts');
    s += rect(20, 310, 80, 44, 'box tint-k-soft', 4) + t(60, 329, 'Charcoal', 'tsm', 'middle') + t(60, 345, 'canister', 'tsm', 'middle');
    s += arr('M60 310V270H160V242', 'k2') + rect(84, 259, 24, 22, 'box tint-c-soft', 3) + t(96, 252, 'Purge valve', 'ts', 'middle');
    s += t(112, 336, 'Evaporative', 'ts') + t(112, 352, 'system (EVAP)', 'ts');
    /* exhaust treatment */
    s += pipe('M320 240V300H345', 'hot', 7) + pipe('M395 300H410', 'hot', 7) + pipe('M465 300H474', 'gas', 7);
    s += arr('M320 244V292', 'k2');
    s += rect(345, 286, 50, 28, 'box tint-y', 4) + t(370, 305, 'Cat', 'tsm', 'middle');
    s += rect(410, 286, 55, 28, 'box tint-k-soft', 4) + t(437, 305, 'DPF', 'tsm', 'middle');
    s += t(370, 334, 'Catalytic', 'ts', 'middle') + t(370, 350, 'converter', 'ts', 'middle');
    s += t(437, 334, 'Diesel soot', 'ts', 'middle') + t(437, 350, 'filter', 'ts', 'middle');
    return wrap(480, 468, 'Emission control systems',
      'A single engine with its intake on the left and exhaust on the right. A PCV loop returns crankcase vapour to the intake. An EGR loop returns exhaust gas to the intake. The fuel tank vents to a charcoal canister which purges into the intake. The exhaust passes through a catalytic converter and, on diesels, a particulate filter.', s);
  }
};
