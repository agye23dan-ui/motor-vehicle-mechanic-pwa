/* Turns lesson blocks into DOM. Text goes through rich(), so nothing is ever parsed as HTML. */
import { h, rich } from './dom.js';
import { icon } from './icons.js';
import { hasDiagram, diagram } from './diagrams/index.js';

var NOTE_LABEL = { safety: 'Safety', tip: 'Workshop tip', key: 'Remember' };
var NOTE_ICON = { safety: 'warning', tip: 'wrench', key: 'flag' };

function block(b) {
  switch (b.t) {
    case 'p': return h('p', null, rich(b.text));
    case 'h': return h('h2', null, rich(b.text));
    case 'ul': return h('ul', null, b.items.map(function (i) { return h('li', null, rich(i)); }));
    case 'ol': return h('ol', null, b.items.map(function (i) { return h('li', null, rich(i)); }));
    case 'note':
      return h('aside', { class: 'note ' + b.kind },
        h('div', { class: 'label' }, icon(NOTE_ICON[b.kind] || 'flag', 18), NOTE_LABEL[b.kind] || 'Note'),
        h('p', null, rich(b.text)));
    case 'table':
      return h('div', { class: 'table-wrap' }, h('table', null,
        b.caption ? h('caption', null, b.caption) : null,
        h('thead', null, h('tr', null, b.head.map(function (c) { return h('th', { scope: 'col' }, rich(c)); }))),
        h('tbody', null, b.rows.map(function (r) { return h('tr', null, r.map(function (c) { return h('td', null, rich(c)); })); }))));
    case 'formula':
      return h('div', { class: 'formula' }, h('div', { class: 'f' }, b.text), b.caption ? h('div', { class: 'c' }, b.caption) : null);
    case 'example':
      return h('div', { class: 'example' }, h('div', { class: 'title' }, b.title),
        h('ol', null, b.steps.map(function (s) { return h('li', null, rich(s)); })));
    case 'diagram':
      return hasDiagram(b.name) ? diagram(b.name) : null;
    default:
      return null;
  }
}

export function renderBlocks(blocks) {
  return h('div', { class: 'prose' }, blocks.map(block));
}
