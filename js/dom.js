/* Small DOM helpers. */
import { tokenize } from './lib.js';

var SVG_NS = 'http://www.w3.org/2000/svg';

/*
 * h('div', { class: 'x', onclick: fn, 'aria-label': 'y' }, child, [children], 'text')
 * Strings become text nodes, never HTML, so content can never inject markup.
 */
export function h(tag, attrs) {
  var el = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'dataset') Object.keys(v).forEach(function (d) { el.dataset[d] = v[d]; });
      else if (k === 'style' && typeof v === 'object') Object.keys(v).forEach(function (s) { el.style.setProperty(s, v[s]); });
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    });
  }
  for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
  return el;
}

function append(parent, child) {
  if (child === null || child === undefined || child === false) return;
  if (Array.isArray(child)) { child.forEach(function (c) { append(parent, c); }); return; }
  if (typeof child === 'string' || typeof child === 'number') { parent.appendChild(document.createTextNode(String(child))); return; }
  parent.appendChild(child);
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

/* Builds nodes for text that may contain **bold** and `code`. */
export function rich(text) {
  return tokensToNodes(tokenize(text));
}

function tokensToNodes(tokens) {
  return tokens.map(function (t) {
    if (t.t === 'text') return document.createTextNode(t.v);
    if (t.t === 'b') return h('strong', null, tokensToNodes(t.c));
    return h('code', null, t.v);
  });
}

/* Parses a trusted SVG string from this app's own source (never from user input). */
export function svgFromString(markup) {
  var wrap = document.createElement('div');
  wrap.innerHTML = markup;
  return wrap.firstElementChild;
}

export function svg(tag, attrs) {
  var el = document.createElementNS(SVG_NS, tag);
  if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, String(attrs[k])); });
  for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
  return el;
}

/* Announces a message to screen readers without moving focus. */
export function announce(message) {
  var region = document.getElementById('announcer');
  if (!region) return;
  region.textContent = '';
  window.setTimeout(function () { region.textContent = message; }, 30);
}
