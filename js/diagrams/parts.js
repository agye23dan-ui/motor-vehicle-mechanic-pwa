/* Realistic component drawings shared by the lesson diagrams. Each returns an SVG string and uses the
   gradients that wrap() puts into every diagram (shMetal, shDark, shRed, shTube, shBall). */

function rr(x, y, w, h, rx, st) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" style="' + st + '"/>'; }
function cc(x, y, r, st) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" style="' + st + '"/>'; }

export var STEEL = 'fill:url(#shMetal);stroke:#59626b;stroke-width:1.3';
export var DARK = 'fill:url(#shDark);stroke:#1f2327;stroke-width:1.3';
export var RUBBER = 'fill:#1d2024;stroke:#0a0b0d;stroke-width:1.3';
export var PAINT_RED = 'fill:url(#shRed);stroke:#5a1510;stroke-width:1.3';

/* A heat exchanger core with fins and end tanks. tint is a fill for the coolant or refrigerant inside. */
export function finnedCoil(x, y, w, h, tint, vertical) {
  var s = '', i;
  s += rr(x, y, w, h, 4, 'fill:#59626b;stroke:#2a2f35;stroke-width:1.4');
  if (vertical) {
    for (i = x + 6; i < x + w - 3; i += 5) s += '<path d="M' + i + ' ' + (y + 3) + 'V' + (y + h - 3) + '" style="stroke:#cfd4da;stroke-width:1.5;opacity:0.85"/>';
  } else {
    for (i = x + 7; i < x + w - 4; i += 6) s += '<path d="M' + i + ' ' + (y + 3) + 'V' + (y + h - 3) + '" style="stroke:#cfd4da;stroke-width:1.5;opacity:0.85"/>';
  }
  s += rr(x, y, w, h, 4, 'fill:' + tint + ';fill-opacity:0.28;stroke:none');
  s += rr(x - 6, y + 4, 8, h - 8, 3, STEEL) + rr(x + w - 2, y + 4, 8, h - 8, 3, STEEL);
  s += rr(x, y, w, 5, 2, 'fill:url(#shTube);stroke:none');
  return s;
}

/* A fan with blades. */
export function fanIcon(cx, cy, r, blades) {
  var n = blades || 6, s = '', i;
  s += cc(cx, cy, r + 3, 'fill:#202429;stroke:#0e1114;stroke-width:1.2');
  for (i = 0; i < n; i++) {
    s += '<path d="M0 -' + (r * 0.18) + 'C' + (r * 0.3) + ' -' + (r * 0.45) + ' ' + (r * 0.62) + ' -' + (r * 0.9) + ' ' + (r * 0.34) + ' -' + r + 'C' + (r * 0.12) + ' -' + (r * 0.7) + ' -' + (r * 0.05) + ' -' + (r * 0.4) + ' -' + (r * 0.1) + ' -' + (r * 0.16) + 'Z" transform="translate(' + cx + ' ' + cy + ') rotate(' + (i * 360 / n) + ')" style="fill:#3a4048;stroke:#101214;stroke-width:0.8"/>';
  }
  s += cc(cx, cy, r * 0.22, 'fill:url(#shMetal);stroke:#3b4148');
  return s;
}

/* A belt-driven A/C compressor: cast body, clutch pulley at the front and two hose ports. */
export function compressor(x, y, w, h) {
  var s = '';
  s += rr(x, y, w, h, 8, STEEL);
  for (var i = 1; i < 5; i++) s += '<path d="M' + (x + w * i / 5) + ' ' + (y + 4) + 'V' + (y + h - 4) + '" style="stroke:#4a5158;stroke-width:1.2;opacity:0.5"/>';
  s += rr(x + w - 4, y + 6, 14, h - 12, 4, DARK);
  s += cc(x + w + 14, y + h / 2, h * 0.34, DARK) + cc(x + w + 14, y + h / 2, h * 0.22, 'fill:none;stroke:#8d96a0;stroke-width:1.4;stroke-dasharray:4 3') + cc(x + w + 14, y + h / 2, h * 0.07, 'fill:url(#shMetal);stroke:#3b4148');
  s += rr(x + 6, y - 7, 12, 9, 2, DARK) + rr(x + 24, y - 7, 12, 9, 2, DARK);
  return s;
}

/* A receiver-drier canister with a sight glass and end fittings. */
export function drier(x, y, w, h) {
  var s = '';
  s += rr(x, y, w, h, w / 2.4, STEEL);
  s += rr(x + 3, y + 5, 4, h - 10, 2, 'fill:#fff;fill-opacity:0.4;stroke:none');
  s += cc(x + w / 2, y + h * 0.34, w * 0.2, 'fill:#7fc4e8;fill-opacity:0.75;stroke:#3b4148;stroke-width:1.2');
  s += rr(x + w / 2 - 4, y - 5, 8, 7, 2, DARK) + rr(x + w / 2 - 4, y + h - 2, 8, 7, 2, DARK);
  s += rr(x + 2, y + h * 0.6, w - 4, 3, 1, 'fill:#c0392b;stroke:none');
  return s;
}

/* An expansion valve block with a sensing bulb. */
export function valveBlock(x, y, sz) {
  var s = '';
  s += rr(x, y, sz, sz, 5, STEEL);
  s += '<path d="M' + (x + 5) + ' ' + (y + 5) + 'L' + (x + sz - 5) + ' ' + (y + sz - 5) + 'M' + (x + sz - 5) + ' ' + (y + 5) + 'L' + (x + 5) + ' ' + (y + sz - 5) + '" style="stroke:#2a2f35;stroke-width:1.8"/>';
  s += rr(x + sz / 2 - 4, y - 8, 8, 9, 2, DARK) + rr(x + sz, y + sz / 2 - 3, 8, 6, 2, DARK);
  return s;
}

/* A brake caliper over a ventilated disc seen from the side. */
export function discAndCaliper(cx, cy, r) {
  var s = '', i;
  s += cc(cx, cy, r, 'fill:url(#shMetal);stroke:#3b4148;stroke-width:1.4') + cc(cx, cy, r * 0.62, 'fill:#2a2f35;fill-opacity:0.35;stroke:none');
  for (i = 0; i < 24; i++) s += '<rect x="' + (cx - 1.5) + '" y="' + (cy - r * 0.86) + '" width="3" height="' + (r * 0.3) + '" rx="1" fill="#262a2f" transform="rotate(' + (i * 15) + ' ' + cx + ' ' + cy + ')"/>';
  s += cc(cx, cy, r * 0.34, 'fill:#4a5058;stroke:#262a2f') + cc(cx, cy, r * 0.1, 'fill:#cfd4da;stroke:#262a2f');
  s += '<path d="M' + (cx - r * 0.2) + ' ' + (cy - r * 1.02) + 'A' + (r * 1.03) + ' ' + (r * 1.03) + ' 0 0 1 ' + (cx + r * 0.7) + ' ' + (cy - r * 0.72) + 'L' + (cx + r * 0.52) + ' ' + (cy - r * 0.52) + 'A' + (r * 0.72) + ' ' + (r * 0.72) + ' 0 0 0 ' + (cx - r * 0.16) + ' ' + (cy - r * 0.76) + 'Z" style="' + PAINT_RED + '"/>';
  return s;
}

/* A drum brake wheel unit seen from the side. */
export function drumUnit(cx, cy, r) {
  var s = cc(cx, cy, r, 'fill:url(#shMetal);stroke:#3b4148;stroke-width:1.4') + cc(cx, cy, r * 0.8, 'fill:none;stroke:#59626b;stroke-width:1.2');
  s += cc(cx, cy, r * 0.28, 'fill:url(#shDark);stroke:#1f2327');
  for (var i = 0; i < 5; i++) { var a = i * 72 * Math.PI / 180; s += cc(cx + Math.sin(a) * r * 0.5, cy - Math.cos(a) * r * 0.5, 2.4, 'fill:#262a2f'); }
  return s;
}

/* A tandem master cylinder with its reservoir. */
export function masterCylinder(x, y, w, h) {
  var s = '';
  s += rr(x, y, w, h, 5, STEEL) + '<path d="M' + (x + w / 2) + ' ' + y + 'V' + (y + h) + '" style="stroke:#4a5158;stroke-width:1.4"/>';
  s += rr(x + w * 0.1, y - h * 0.75, w * 0.8, h * 0.8, 4, 'fill:#e9eef0;fill-opacity:0.85;stroke:#59626b;stroke-width:1.2');
  s += rr(x + w * 0.14, y - h * 0.36, w * 0.72, h * 0.36, 3, 'fill:#e0b04a;fill-opacity:0.85;stroke:none');
  s += rr(x + w * 0.3, y - h * 0.9, w * 0.4, h * 0.18, 2, 'fill:#14171a;stroke:none');
  return s;
}

/* A vacuum brake booster. */
export function booster(cx, cy, r) {
  return cc(cx, cy, r, 'fill:url(#shMetal);stroke:#59626b;stroke-width:1.4') + cc(cx, cy, r * 0.8, 'fill:none;stroke:#59626b;stroke-width:1.1;stroke-dasharray:3 3') +
    rr(cx - r * 0.2, cy - r * 0.2, r * 0.4, r * 0.4, 3, DARK);
}

/* A spark plug, standing up with its tip at the bottom. */
export function sparkPlug(x, y) {
  return rr(x - 4, y, 8, 38, 3, 'fill:#f1f0ea;stroke:#9aa2aa;stroke-width:1') + '<path d="M' + (x - 8) + ' ' + (y + 38) + 'h16l-2 -10h-12z" style="' + STEEL + '"/>' + rr(x - 2.5, y + 38, 5, 10, 1, 'fill:#8d96a0;stroke:none') + rr(x - 6, y - 5, 12, 7, 2, DARK);
}

/* A hose or pipe: dark outline, coloured core and a gloss line. */
export function hose(d, colour, w) {
  var ww = w || 7;
  return '<path d="' + d + '" fill="none" stroke="#1d2024" stroke-width="' + (ww + 3) + '" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="' + colour + '" stroke-width="' + ww + '" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="' + Math.max(1.4, ww * 0.25) + '" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 -' + (ww * 0.18) + ')"/>';
}
