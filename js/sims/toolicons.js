import { svgFromString } from '../dom.js';

/*
 * Line icons for the tool tray, drawn on a 40 by 40 grid in the current text colour so they
 * invert when a tool is selected. Sockets and bits show their size under the picture.
 */

var HEX = '<path d="M20 6l11 6.5v13L20 32l-11-6.5v-13z"/><circle cx="20" cy="19" r="5.5"/>';

var ICONS = {
  socket: HEX,
  torx: '<circle cx="20" cy="19" r="12"/><circle cx="20" cy="19" r="4"/><path d="M20 7v4M20 27v4M9.6 13l3.5 2M26.9 23l3.5 2M9.6 25l3.5-2M26.9 15l3.5-2"/>',
  allen: '<path d="M10 8v22h20"/><path d="M10 8h5M30 30v-5"/>',
  screw: '<rect x="6" y="14" width="14" height="10" rx="4"/><path d="M20 19h16"/><path d="M34 16l3 3-3 3"/>',
  breaker: '<path d="M4 25h32"/><rect x="4" y="21" width="6" height="8" rx="1"/><rect x="30" y="17" width="7" height="16" rx="1"/>',
  hook: '<path d="M20 4v18a7 7 0 0 1-14 0"/><path d="M16 4h8"/>',
  piston: '<rect x="8" y="12" width="24" height="18" rx="2"/><path d="M14 12V6h12v6"/><path d="M20 30v6"/><path d="M15 36h10"/>',
  puller: '<path d="M6 16h28"/><path d="M10 16v14M30 16v14"/><path d="M20 6v24"/><path d="M16 6h8"/><path d="M8 30h4M28 30h4"/>',
  align: '<rect x="9" y="8" width="22" height="9" rx="2"/><rect x="14" y="17" width="12" height="9" rx="1"/><path d="M17 26v8M23 26v8"/>',
  lock: '<path d="M6 30h28"/><path d="M12 30V12M28 30V12"/><path d="M10 12h5M25 12h5"/><path d="M20 30v-8"/>',
  gauge: '<rect x="4" y="14" width="32" height="12" rx="1"/><path d="M9 14v6M14 14v4M19 14v6M24 14v4M29 14v6"/>',
  grease: '<rect x="12" y="10" width="16" height="22" rx="2"/><path d="M16 10V6h8v4"/><path d="M15 18h10M15 23h10"/>',
  pliers: '<path d="M14 4l8 14M26 4l-8 14"/><path d="M20 18l-6 18M20 18l6 18"/><circle cx="20" cy="18" r="2"/>',
  flare: '<path d="M8 8h14a6 6 0 0 1 0 12H8"/><path d="M8 8v12"/><path d="M14 20l6 16h6"/>',
  pry: '<path d="M6 34l22-22a6 6 0 0 1 8-3l-3 5-5 1-1 5z"/>',
  mallet: '<rect x="8" y="6" width="24" height="12" rx="3"/><path d="M20 18v18"/><path d="M17 36h6"/>',
  lockring: '<circle cx="20" cy="18" r="11"/><circle cx="20" cy="18" r="5"/><path d="M13 9l2 3M27 9l-2 3M13 27l2-3M27 27l-2-3"/><path d="M20 29v8"/>'
};

var KIND = { 'sock-': 'socket', 'torx-': 'torx', 'allen-': 'allen' };
var CAPTION = { screw: 'Driver', breaker: 'Breaker', hook: 'Hook', piston: 'Piston', puller: 'Puller', align: 'Align', lock: 'Lock', gauge: 'Gauges', grease: 'Grease', pliers: 'Pliers', flare: 'Flare', pry: 'Pry bar', mallet: 'Mallet', lockring: 'Ring' };

export function toolKind(id) {
  for (var k in KIND) if (id.indexOf(k) === 0) return KIND[k];
  return id;
}

export function toolCaption(id) {
  if (id.indexOf('sock-') === 0) return id.slice(5);
  if (id.indexOf('torx-') === 0) return id.slice(5).toUpperCase();
  if (id.indexOf('allen-') === 0) return id.slice(6);
  return CAPTION[id] || id;
}

export function toolIcon(id) {
  var kind = toolKind(id), body = ICONS[kind] || ICONS.socket;
  return svgFromString('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>');
}
