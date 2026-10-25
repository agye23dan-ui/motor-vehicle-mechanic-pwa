/*
 * Lesson diagrams, drawn as inline SVG so they stay sharp, work offline and follow the theme.
 * All drawing colours come from CSS classes (.dg ...), not from this file.
 */
import { svgFromString, h } from '../dom.js';

export var DIAGRAMS = {};

export function wrap(w, hgt, title, desc, body, defs) {
  return '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 ' + w + ' ' + hgt + '" role="img" ' +
    'aria-label="' + title + '"><title>' + title + '</title><desc>' + desc + '</desc>' +
    '<defs><marker id="ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
    '<path d="M1 1.5 9 5 1 8.5z" class="head"/></marker>' + (defs || '') + '</defs>' + body + '</svg>';
}

export function t(x, y, text, cls, anchor) {
  return '<text x="' + x + '" y="' + y + '" class="' + (cls || 't') + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + text + '</text>';
}

/* A numbered or lettered badge. */
export function badge(cx, cy, label, r) {
  var rad = r || 11;
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rad + '" class="badge"/>' +
    '<text x="' + cx + '" y="' + (cy + 4.6) + '" class="tbadge" text-anchor="middle">' + label + '</text>';
}

export function box(x, y, w, hgt, tint) {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hgt + '" rx="4" class="box' + (tint ? ' ' + tint : '') + '"/>';
}

export function resistor(cx, cy, label) {
  return '<rect x="' + (cx - 30) + '" y="' + (cy - 11) + '" width="60" height="22" rx="3" class="box"/>' +
    t(cx, cy + 5, label, 'tb', 'middle');
}


/* A round node dot, used in network and wiring drawings. */
export function node(x, y, r, tint) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 9) + '" class="box ' + (tint || 'tint-c') + '"/>'; }

/* A sampled path for waveforms. fn(x) returns y. */
export function wavePath(x0, w, fn) {
  var d = '';
  for (var x = 0; x <= w; x += 2) {
    d += (x === 0 ? 'M' : 'L') + (x0 + x).toFixed(1) + ' ' + fn(x).toFixed(1);
  }
  return d;
}

export function hasDiagram(name) {
  return Object.prototype.hasOwnProperty.call(DIAGRAMS, name);
}

/* Returns a <figure> with the drawing and its caption. */
export function diagram(name) {
  var d = DIAGRAMS[name];
  if (!d) return h('p', { class: 'note' }, 'Diagram not found.');
  return h('figure', { class: 'diagram' }, svgFromString(d.svg()), h('figcaption', null, d.caption));
}
