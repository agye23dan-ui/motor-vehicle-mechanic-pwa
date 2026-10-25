/*
 * Halftone drawings. Mastery is shown the way a printing press shows tone: a grid of dots that grow
 * as the value rises. Empty paper means nothing studied yet; solid colour means mastered.
 */
import { svgFromString } from './dom.js';
import { clamp } from './lib.js';

var AREA_COLOR = {
  foundations: 'var(--yellow)',
  engine: 'var(--magenta)',
  electrical: 'var(--cyan)',
  climate: 'var(--green)',
  driveline: 'var(--key)',
  chassis: 'var(--yellow-ink)',
  practice: 'var(--ink-3)'
};

export function areaColor(area) {
  return AREA_COLOR[area] || 'var(--key)';
}

/*
 * One square cell: a 5 by 5 grid of dots on a 45 degree screen, like a printed tone.
 * `value` is 0 to 1. Even at 0 a faint dot shows so the cell is never blank.
 */
export function cell(value, color, size) {
  var v = clamp(value, 0, 1);
  var s = size || 56;
  var n = 5;
  var pitch = 100 / n;
  var maxR = pitch * 0.74;
  var r = v === 0 ? 1.4 : 1.4 + (maxR - 1.4) * Math.sqrt(v);
  var dots = '';
  for (var y = 0; y < n; y++) {
    for (var x = 0; x < n; x++) {
      /* Offset every second row to give the diagonal screen pattern. */
      var cx = x * pitch + pitch / 2 + (y % 2 ? pitch / 2 : 0) - pitch / 4;
      var cy = y * pitch + pitch / 2;
      dots += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + r.toFixed(2) + '"/>';
    }
  }
  return svgFromString(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="' + s + '" height="' + s + '" ' +
    'class="halftone" aria-hidden="true" focusable="false"><g fill="' + color + '">' + dots + '</g></svg>'
  );
}

/* A single row of dots that grow left to right, filled up to `value`. Used as a progress meter. */
export function strip(value, color, steps) {
  var n = steps || 10;
  var v = clamp(value, 0, 1);
  var w = 100;
  var pitch = w / n;
  var dots = '';
  for (var i = 0; i < n; i++) {
    var t = (i + 1) / n;
    var base = 0.9 + (pitch * 0.46 - 0.9) * Math.pow(i / (n - 1), 0.85);
    var on = v >= t - 0.5 / n;
    var partial = clamp((v - i / n) * n, 0, 1);
    var r = on ? base : (partial > 0 ? Math.max(0.6, base * (0.35 + 0.5 * partial)) : 0.6);
    dots += '<circle cx="' + (i * pitch + pitch / 2).toFixed(2) + '" cy="6" r="' + r.toFixed(2) + '" ' +
      (on || partial > 0 ? '' : 'class="off" ') + '/>';
  }
  return svgFromString(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 12" preserveAspectRatio="none" class="strip" ' +
    'aria-hidden="true" focusable="false"><g fill="' + color + '">' + dots + '</g></svg>'
  );
}

/* The app's logo: a wheel with five bolt dots in the dashboard colours. */
export function brandMark(size) {
  var s = size || 28;
  var cols = ['var(--cyan)', 'var(--magenta)', 'var(--yellow)', 'var(--key)', 'var(--green)'];
  var dots = '';
  for (var i = 0; i < 5; i++) {
    var a = -Math.PI / 2 + i * 2 * Math.PI / 5;
    dots += '<circle cx="' + (24 + 8.2 * Math.cos(a)).toFixed(1) + '" cy="' + (24 + 8.2 * Math.sin(a)).toFixed(1) + '" r="2.7" fill="' + cols[i] + '"/>';
  }
  return svgFromString(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="' + s + '" height="' + s + '" aria-hidden="true" focusable="false">' +
    '<circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="4.5"/>' +
    '<circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="1.6"/>' + dots +
    '<circle cx="24" cy="24" r="3" fill="currentColor"/></svg>'
  );
}
