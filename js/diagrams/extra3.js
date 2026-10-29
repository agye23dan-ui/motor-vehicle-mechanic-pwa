/* Diagrams that show wear, failure and test signals: brakes, tyres, plugs, belts, scope traces, fuses, fluids and suspension checks. */
import { DIAGRAMS, wrap, t, badge, wavePath } from './core.js';

function R(x, y, w, h, c, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" class="' + c + '"/>'; }
function P(d, c) { return '<path d="' + d + '" class="' + (c || 'k') + '"/>'; }
function C(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" class="' + c + '"/>'; }

/* Splits text into lines of at most max characters. */
function wrapText(str, max) {
  var out = [], line = '';
  str.split(' ').forEach(function (w) {
    if ((line + ' ' + w).trim().length > max) { out.push(line); line = w; } else line = (line + ' ' + w).trim();
  });
  if (line) out.push(line);
  return out;
}
/* A tinted note box whose text wraps to the box width. Returns { svg, height }. */
function callout(x, y, w, paras) {
  var lines = [];
  paras.forEach(function (p) { lines = lines.concat(wrapText(p, Math.floor((w - 28) / 6.4))); });
  var hgt = 20 + lines.length * 19;
  var svg = R(x, y, w, hgt, 'box tint-y-soft', 6);
  lines.forEach(function (l, i) { svg += t(x + 14, y + 24 + i * 19, l, 'tsm'); });
  return { svg: svg, height: hgt };
}
/* Centred label lines under an item. */
function labelLines(cx, y, text, max, cls) {
  var s = '';
  wrapText(text, max).forEach(function (l, i) { s += t(cx, y + i * 16, l, cls || 'ts', 'middle'); });
  return s;
}

/* ---------------- Brake wear ---------------- */
DIAGRAMS['brake-wear'] = {
  caption: 'Side view of a disc brake. Measure the pad friction material and the disc thickness. A lip at the disc edge, deep grooves or a pad worn to its backing plate mean the parts must be replaced.',
  svg: function () {
    var s = '';
    [[0, 'New'], [1, 'Worn out']].forEach(function (c) {
      var worn = c[0] === 1, mid = 130 + c[0] * 240, disc = worn ? 26 : 44, pad = worn ? 3 : 22;
      s += t(mid, 28, c[1], 'tb', 'middle');
      s += R(mid - disc / 2, 56, disc, 150, worn ? 'metal-dark' : 'metal', 0);
      if (worn) s += P('M' + (mid - 15) + ' 56V68H' + (mid - 13), 'k') + P('M' + (mid + 15) + ' 56V68H' + (mid + 13), 'k');
      s += R(mid - disc / 2 - pad - 10, 76, 10, 110, 'metal-dark', 0) + R(mid - disc / 2 - pad, 76, pad, 110, worn ? 'tint-m' : 'tint-y', 0);
      s += R(mid + disc / 2, 76, pad, 110, worn ? 'tint-m' : 'tint-y', 0) + R(mid + disc / 2 + pad, 76, 10, 110, 'metal-dark', 0);
      s += badge(mid - disc / 2 - pad / 2 - 5, 226, '1') + badge(mid - disc / 2 - pad - 5, 250, '2');
      s += labelLines(mid, 284, worn ? 'Disc 14 mm, below the 22 mm minimum. Pad 2 mm.' : 'Disc 22 mm, pads 11 mm each.', 28, 'ts');
    });
    s += t(60, 340, '1  Friction material (replace at about 3 mm)', 'tsm') + t(60, 358, '2  Metal backing plate (never let it touch the disc)', 'tsm');
    var c = callout(20, 376, 460, ['Also check: a lip at the disc rim, deep scoring, heat spots, cracks and uneven pad wear. A pad worn to the backing plate scores the disc and can fail the brake.']);
    return wrap(500, 376 + c.height + 16, 'Brake pad and disc wear', 'Two side views of a disc brake: new pads on a thick disc, and worn pads on a thin disc below its minimum thickness.', s + c.svg);
  }
};

/* ---------------- Tyre wear patterns ---------------- */
DIAGRAMS['tyre-wear-patterns'] = {
  caption: 'The pattern of wear shows the cause. Read it across the tread and around the tyre before you replace anything.',
  svg: function () {
    var items = [
      ['Centre wear', 'Over-inflated', [0.2, 1, 0.2]],
      ['Both edges worn', 'Under-inflated', [1, 0.2, 1]],
      ['One edge worn', 'Camber out of limit', [1, 0.6, 0.15]],
      ['Feathered ribs', 'Toe out of limit', [0.6, 0.6, 0.6]],
      ['Cupped patches', 'Worn dampers or bent parts', [0.7, 0.3, 0.7]]
    ];
    var s = t(20, 24, 'Tread seen from the front', 'tb');
    items.forEach(function (it, i) {
      var x = 20 + i * 96, tread = it[2];
      s += R(x, 40, 80, 130, 'box', 6);
      for (var b = 0; b < 3; b++) {
        var depth = tread[b];
        s += R(x + 6 + b * 24, 48, 22, 114, 'metal', 2);
        s += R(x + 6 + b * 24, 48, 22, 114 * depth, depth > 0.65 ? 'tint-m' : 'tint-y', 2);
      }
      if (i === 3) for (var k = 0; k < 7; k++) s += P('M' + (x + 8) + ' ' + (60 + k * 15) + 'l18 8', 'k2') + P('M' + (x + 32) + ' ' + (60 + k * 15) + 'l18 8', 'k2') + P('M' + (x + 56) + ' ' + (60 + k * 15) + 'l18 8', 'k2');
      if (i === 4) for (var q = 0; q < 4; q++) s += '<ellipse cx="' + (x + 40) + '" cy="' + (66 + q * 30) + '" rx="30" ry="8" class="tint-m"/>';
      s += labelLines(x + 40, 192, it[0], 14, 'tsm') + labelLines(x + 40, 224, it[1], 14, 'ts');
    });
    var c = callout(20, 268, 460, ['Check the tread depth with a gauge. The legal minimum is 1.6 mm in many places, so replace before this. Look for bulges, cuts, cords and nails. Set pressure to the vehicle label and rotate as advised.']);
    return wrap(500, 268 + c.height + 16, 'Tyre wear patterns', 'Five tyre treads seen from the front showing centre wear, edge wear, one-sided wear, feathering and cupping, with the usual cause of each.', s + c.svg);
  }
};

/* ---------------- Spark plug conditions ---------------- */
DIAGRAMS['spark-plug-conditions'] = {
  caption: 'The tip of a spark plug records how the cylinder has been running. Read it before you fit a new plug, and cure the cause of any fault.',
  svg: function () {
    var items = [
      ['Normal', 'Light tan or grey. Healthy engine.', 'tint-y-soft', 0],
      ['Carbon fouled', 'Dry black soot. Rich mixture or weak spark.', 'tint-k-soft', 1],
      ['Oil fouled', 'Wet black oil. Worn rings or valve seals.', 'tint-c', 2],
      ['Overheated', 'White, blistered tip. Lean mixture.', 'tint-m-soft', 3],
      ['Worn', 'Rounded electrode, wide gap. Past its life.', 'tint-y-soft', 4]
    ];
    var s = t(20, 24, 'Plug tip and electrode', 'tb');
    items.forEach(function (it, i) {
      var x = 20 + i * 96, cx = x + 40;
      var cond = it[3];
      var ins = ['#efe3c0', '#2a2c2e', '#17181a', '#f6f1ee', '#cfc3a0'][cond];       /* colour of the insulator nose */
      s += '<rect x="' + (cx - 12) + '" y="36" width="24" height="46" rx="4" style="fill:#f1f0ea;stroke:#9aa2aa;stroke-width:1.2"/><path d="M' + (cx - 8) + ' 42V76" style="stroke:#fff;stroke-width:3;opacity:0.7"/>' +
        '<path d="M' + (cx - 17) + ' 82H' + (cx + 17) + 'L' + (cx + 14) + ' 92H' + (cx - 14) + 'Z" style="fill:url(#shMetal);stroke:#59626b;stroke-width:1.2"/>' +
        '<rect x="' + (cx - 12) + '" y="92" width="24" height="26" style="fill:url(#shMetal);stroke:#59626b;stroke-width:1.2"/>';
      for (var th = 0; th < 5; th++) s += '<path d="M' + (cx - 12) + ' ' + (96 + th * 5) + 'H' + (cx + 12) + '" style="stroke:#4a5158;stroke-width:1.3"/>';
      s += '<rect x="' + (cx - 7) + '" y="118" width="14" height="22" rx="3" style="fill:' + ins + ';stroke:#59626b;stroke-width:1"/>';
      s += '<rect x="' + (cx - 2) + '" y="136" width="4" height="9" rx="1" style="fill:' + (cond === 4 ? '#8d96a0' : '#cfd4da') + ';stroke:#3b4148;stroke-width:0.8"/>';
      /* ground electrode: an L-shaped strap, worn plugs have it rounded and a wider gap */
      s += '<path d="M' + (cx + 10) + ' 118V' + (cond === 4 ? 154 : 148) + 'H' + (cx + (cond === 4 ? 1 : 0)) + '" style="fill:none;stroke:#1d2024;stroke-width:5;stroke-linecap:round;stroke-linejoin:round"/><path d="M' + (cx + 10) + ' 118V' + (cond === 4 ? 154 : 148) + 'H' + (cx + (cond === 4 ? 1 : 0)) + '" style="fill:none;stroke:#aeb5bc;stroke-width:3;stroke-linecap:round;stroke-linejoin:round"/>';
      if (cond === 1) s += '<path d="M' + (cx - 8) + ' 124Q' + cx + ' 134 ' + (cx + 8) + ' 124L' + (cx + 9) + ' 143L' + (cx - 9) + ' 143Z" style="fill:#0d0e0f;fill-opacity:0.85"/>';
      if (cond === 2) s += '<path d="M' + (cx - 10) + ' 120H' + (cx + 10) + 'V142H' + (cx - 10) + 'Z" style="fill:#0b0c0d;fill-opacity:0.8"/><path d="M' + (cx - 8) + ' 134Q' + cx + ' 142 ' + (cx + 8) + ' 134" style="fill:none;stroke:#59626b;stroke-width:1.4;opacity:0.7"/>';
      if (cond === 3) s += '<circle cx="' + (cx - 3) + '" cy="126" r="3" style="fill:#b8a898"/><circle cx="' + (cx + 3) + '" cy="132" r="2.5" style="fill:#c9bfb4"/><circle cx="' + (cx - 2) + '" cy="138" r="2" style="fill:#d6cdc4"/>';
      s += labelLines(cx, 176, it[0], 13, 'tsm') + labelLines(cx, 208, it[1], 14, 'ts');
    });
    return wrap(500, 310, 'Spark plug conditions', 'Five spark plug tips showing normal, carbon fouled, oil fouled, overheated and worn conditions with the likely cause.', s);
  }
};

/* ---------------- Belt wear ---------------- */
DIAGRAMS['belt-wear'] = {
  caption: 'A drive belt that shows any of these signs should be replaced. Find out why it wore: a seized pulley, a leak or a weak tensioner will damage the next belt too.',
  svg: function () {
    var items = [['Good', 'Even ribs, flexible'], ['Cracked', 'Cracks across the ribs'], ['Glazed', 'Shiny, hard sides'], ['Frayed', 'Fibres at the edge'], ['Missing chunks', 'Ribs torn out']];
    var s = t(20, 24, 'Belt underside (the ribbed face)', 'tb');
    items.forEach(function (it, i) {
      var x = 20 + i * 96;
      s += '<rect x="' + x + '" y="40" width="80" height="90" rx="5" style="fill:#14161a;stroke:#050607;stroke-width:1.4"/>';
      for (var k = 0; k < 6; k++) {
        var rx = x + 8 + k * 11;
        s += '<rect x="' + rx + '" y="46" width="7" height="78" rx="3" style="fill:' + (i === 2 ? '#4a4338' : '#2b2f35') + ';stroke:#0a0b0d;stroke-width:0.8"/><rect x="' + (rx + 1.5) + '" y="48" width="1.8" height="74" rx="1" style="fill:#fff;fill-opacity:' + (i === 2 ? '0.55' : '0.16') + '"/>';
      }
      if (i === 1) for (var c = 0; c < 5; c++) s += '<path d="M' + (x + 8) + ' ' + (62 + c * 14) + 'l64 ' + (c % 2 ? -3 : 4) + '" style="stroke:#c9bfb4;stroke-width:1.6;opacity:0.85"/>';
      if (i === 2) s += '<rect x="' + (x + 6) + '" y="44" width="68" height="82" rx="4" style="fill:#fff;fill-opacity:0.18"/>';
      if (i === 3) s += '<path d="M' + (x + 3) + ' 48l-7 -6M' + (x + 3) + ' 60l-9 -2M' + (x + 3) + ' 74l-8 3M' + (x + 3) + ' 90l-9 -1M' + (x + 3) + ' 106l-7 5" style="stroke:#8a8f95;stroke-width:1.6;stroke-linecap:round"/>';
      if (i === 4) s += '<rect x="' + (x + 30) + '" y="68" width="24" height="34" rx="2" style="fill:#e9eef0;fill-opacity:0.95;stroke:#59626b"/><path d="M' + (x + 30) + ' 68l8 6M' + (x + 54) + ' 68l-6 8" style="stroke:#7a828a;stroke-width:1.2"/>';
      s += labelLines(x + 40, 152, it[0], 13, 'tsm') + labelLines(x + 40, 184, it[1], 14, 'ts');
    });
    var c = callout(20, 236, 460, ['Also check: noise (a squeal means slip), tension and alignment, and the tensioner and pulleys. Never run an engine with a cracked belt: a snapped belt loses charging, cooling and steering at once.']);
    return wrap(500, 236 + c.height + 16, 'Drive belt wear', 'Five sections of a ribbed drive belt: good, cracked, glazed, frayed and missing chunks.', s + c.svg);
  }
};

/* ---------------- Scope signals ---------------- */
DIAGRAMS['scope-signals'] = {
  caption: 'Four signals as they look on an oscilloscope. Compare a live trace with the pattern: missing pulses, rounded edges, noise or a flat line show a fault that a meter would hide.',
  svg: function () {
    var s = '', panels = [
      ['Hall crank sensor', 'Square wave, one gap per turn', 'c', function (x) { return (Math.floor(x / 26) % 2 ? 40 : 110) + (x > 170 && x < 230 ? 0 : 0); }, true],
      ['Inductive sensor', 'Sine wave, rises with speed', 'm', function (x) { return 75 - 34 * Math.sin(x / 11) * (0.4 + x / 330); }],
      ['Oxygen sensor', 'Switches around 0.45 V', 'g', function (x) { return 75 - 38 * Math.tanh(Math.sin(x / 24) * 4); }],
      ['Injector', 'Drops to earth, then a spike', 'y', function (x) { var p = x % 80; return p < 40 ? 100 : (p < 44 ? 30 : 36); }]
    ];
    panels.forEach(function (p, i) {
      var x0 = 20 + (i % 2) * 240, y0 = 30 + Math.floor(i / 2) * 190;
      s += R(x0, y0, 220, 130, 'box', 6) + P('M' + x0 + ' ' + (y0 + 65) + 'H' + (x0 + 220), 'zero');
      var fn = p[3];
      s += '<path d="' + wavePath(x0 + 10, 200, function (x) { return y0 + (fn(x) - 75) * 0.7 + 65; }) + '" class="wave ' + p[2] + '"/>';
      s += t(x0 + 110, y0 + 150, p[0], 'tb', 'middle') + t(x0 + 110, y0 + 168, p[1], 'ts', 'middle');
    });
    return wrap(500, 400, 'Oscilloscope signals', 'Four oscilloscope traces: a Hall sensor square wave, an inductive sensor sine wave, an oxygen sensor switching signal and an injector pulse.', s);
  }
};

/* ---------------- Fuse colours ---------------- */
DIAGRAMS['fuse-colours'] = {
  caption: 'Blade fuses are colour coded by rating. Always replace a blown fuse with one of the same rating. A bigger fuse lets a faulty wire overheat.',
  svg: function () {
    var f = [['5 A', '#c9a15a'], ['7.5 A', '#8a5a2b'], ['10 A', '#c0392b'], ['15 A', '#3b82c4'], ['20 A', '#e8c53a'], ['25 A', '#e6e6e6'], ['30 A', '#3f9b55'], ['40 A', '#d8742b']];
    var s = t(20, 26, 'Standard blade fuses', 'tb');
    f.forEach(function (it, i) {
      var x = 30 + (i % 4) * 116, y = 46 + Math.floor(i / 4) * 110;
      s += '<rect x="' + x + '" y="' + y + '" width="64" height="62" rx="5" style="fill:' + it[1] + ';stroke:var(--ink);stroke-width:1.7"/>';
      s += R(x + 14, y + 8, 36, 20, 'box', 3) + P('M' + (x + 22) + ' ' + (y + 28) + 'v14h20v-14', 'k');
      s += R(x + 12, y + 62, 10, 18, 'metal-dark', 0) + R(x + 42, y + 62, 10, 18, 'metal-dark', 0);
      s += t(x + 32, y + 102, it[0], 'tb', 'middle');
    });
    var c = callout(20, 276, 460, ['Colours are the usual standard. Read the number on the fuse and never rely on colour alone.']);
    return wrap(500, 276 + c.height + 16, 'Fuse colours and ratings', 'Eight blade fuses in their standard colours with their current ratings from 5 to 40 amperes.', s + c.svg);
  }
};

/* ---------------- Fluid condition ---------------- */
DIAGRAMS['fluid-condition'] = {
  caption: 'The colour and feel of a fluid give an early warning. Always find the cause of a change, not just top up or change the fluid.',
  svg: function () {
    var rows = [
      ['Engine oil', '#c98a2a', 'Golden to amber', 'Normal'],
      ['Engine oil', '#2b2b2b', 'Black and thick', 'Overdue change, or soot'],
      ['Engine oil', '#d9d2b8', 'Milky, like coffee with milk', 'Coolant in oil: head gasket'],
      ['Engine oil', '#e8cf6a', 'Thin and smells of fuel', 'Fuel dilution'],
      ['Coolant', '#4ba37a', 'Clean, bright colour', 'Normal'],
      ['Coolant', '#8b4a2a', 'Brown rusty sludge', 'Corrosion, neglect'],
      ['Gearbox fluid', '#a8322d', 'Red and clear', 'Normal'],
      ['Gearbox fluid', '#3a2418', 'Dark with a burnt smell', 'Overheating, worn clutches'],
      ['Brake fluid', '#e8d98a', 'Clear to pale yellow', 'Normal'],
      ['Brake fluid', '#4a3a28', 'Dark, with water', 'Replace now']
    ];
    var s = '';
    rows.forEach(function (r, i) {
      var col = i % 2, y = 20 + Math.floor(i / 2) * 58, x = 20 + col * 245;
      s += '<rect x="' + x + '" y="' + y + '" width="36" height="42" rx="4" style="fill:' + r[1] + ';stroke:var(--ink);stroke-width:1.7"/>';
      s += t(x + 46, y + 14, r[0], 'tb') + t(x + 46, y + 30, r[2], 'ts') + t(x + 46, y + 44, r[3], 'tsm');
    });
    return wrap(500, 320, 'Fluid condition guide', 'Ten colour swatches of engine oil, coolant, gearbox fluid and brake fluid, each with what it shows.', s);
  }
};

/* ---------------- Suspension and steering checks ---------------- */
DIAGRAMS['suspension-checkpoints'] = {
  caption: 'Where to look and feel on a front axle. With the wheel raised, check each joint for play, each rubber for splits and each damper for oil.',
  svg: function () {
    var s = t(250, 24, 'Front axle seen from the front (left side shown)', 'tb', 'middle');
    s += R(40, 100, 50, 140, 'box tint-c', 8) + t(65, 92, 'Wheel', 'ts', 'middle');
    s += R(102, 64, 12, 130, 'metal', 3) + P('M100 100h16M100 112h16M100 124h16M100 136h16M100 148h16', 'k2') + R(98, 52, 20, 14, 'metal-dark', 2);
    s += P('M90 150H102', 'k bold');
    s += R(170, 180, 170, 38, 'metal', 6) + t(255, 204, 'Steering rack', 'ts', 'middle') + P('M170 199H90', 'k bold');
    s += P('M90 236L200 232', 'k bold') + C(200, 232, 6, 'box tint-m');
    s += P('M150 233V252', 'k bold') + P('M150 252H330', 'k bold');
    s += badge(60, 290, '1') + P('M64 280L88 238', 'k2');
    s += badge(214, 270, '2') + P('M210 262L203 238', 'k2');
    s += badge(135, 168, '3') + P('M138 176L130 197', 'k2');
    s += badge(78, 44, '4') + P('M84 50L98 58', 'k2');
    s += badge(186, 160, '5') + P('M186 170L186 182', 'k2');
    s += badge(128, 280, '6') + P('M133 272L148 255', 'k2');
    var key = ['Ball joint: lift and rock the wheel for play', 'Control arm bush: look for splits and movement', 'Tie-rod end: check for play and a torn boot', 'Damper and top mount: look for oil and wear', 'Rack gaiter and inner joint: check for tears and play', 'Anti-roll bar link: listen for clunks over bumps'];
    key.forEach(function (k, i) { s += badge(30, 328 + i * 26, String(i + 1), 9) + t(48, 332 + i * 26, k, 'tsm'); });
    return wrap(500, 490, 'Suspension and steering check points', 'Front view of one side of a front axle with six numbered check points: ball joint, control arm bush, tie-rod end, damper, rack and anti-roll bar link.', s);
  }
};

