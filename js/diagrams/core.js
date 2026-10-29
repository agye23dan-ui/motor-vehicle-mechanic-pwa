/*
 * Lesson diagrams, drawn as inline SVG so they stay sharp, work offline and follow the theme.
 * All drawing colours come from CSS classes (.dg ...), not from this file.
 */
import { svgFromString, h } from '../dom.js';

export var DIAGRAMS = {};

/* Gradients that give cast and machined parts a lit, solid look. Every drawing includes them, and the .dg classes in app.css use them. */
var SHARED = '<linearGradient id="shMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f4f6"/><stop offset="0.45" stop-color="#bcc3ca"/><stop offset="1" stop-color="#7c858e"/></linearGradient>' +
  '<linearGradient id="shDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a828a"/><stop offset="0.5" stop-color="#4a5159"/><stop offset="1" stop-color="#2a2e33"/></linearGradient>' +
  '<linearGradient id="shRed" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5584a"/><stop offset="1" stop-color="#9c231a"/></linearGradient>' +
  '<linearGradient id="shTube" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/></linearGradient>' +
  '<radialGradient id="shBall" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#fff" stop-opacity="0.6"/><stop offset="1" stop-color="#000" stop-opacity="0.25"/></radialGradient>';

export function wrap(w, hgt, title, desc, body, defs) {
  return '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 ' + w + ' ' + hgt + '" role="img" ' +
    'aria-label="' + title + '"><title>' + title + '</title><desc>' + desc + '</desc>' +
    '<defs><marker id="ar" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
    '<path d="M1 1.5 9 5 1 8.5z" class="head"/></marker>' + SHARED + (defs || '') + '</defs>' + body + '</svg>';
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
