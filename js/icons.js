/* Line icons on a 24 by 24 grid. Drawn with currentColor so they follow the theme. */
import { svgFromString } from './dom.js';

var PATHS = {
  learn: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
  quiz: '<path d="m4 7 1.8 1.8L9 5.5"/><path d="m4 14 1.8 1.8L9 12.5"/><path d="M12 7.5h8"/><path d="M12 14.5h8"/><path d="M4 20h16"/>',
  cards: '<rect x="6" y="8" width="14" height="11" rx="1.5"/><path d="M4 15.5V6.5A1.5 1.5 0 0 1 5.5 5H16"/>',
  progress: '<circle cx="6" cy="16" r="1.6"/><circle cx="12" cy="13" r="2.8"/><circle cx="18" cy="9.5" r="4"/><path d="M3 21h18"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18"/>',
  flag: '<path d="M6 21V4"/><path d="M6 5h11l-2.5 4L17 13H6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  print: '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="1.5"/><path d="M7 14h10v6H7z"/>',
  download: '<path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M5 20h14"/>',
  upload: '<path d="M12 16V5"/><path d="m7.5 9.5 4.5-4.5 4.5 4.5"/><path d="M5 20h14"/>',
  warning: '<path d="M12 4 3 19h18z"/><path d="M12 10v4.5"/><path d="M12 17v.2"/>',
  flame: '<path d="M12 3c.5 3-3.5 4.5-3.5 9a3.5 3.5 0 0 0 7 0c0-1.2-.5-2-1-2.8.2 1.6-.6 2.3-1.3 2.3C13 8.5 13.3 5.6 12 3z"/>',
  shuffle: '<path d="M4 7h3l10 10h3"/><path d="M4 17h3l3-3"/><path d="M14 10l3-3h3"/><path d="m18 5 2 2-2 2"/><path d="m18 15 2 2-2 2"/>',
  book: '<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4.5" cy="6" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="18" r=".8"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
  install: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M12 8v6"/><path d="m9.5 11.8 2.5 2.7 2.5-2.7"/>',
  cube: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.3 7 12 12l8.7-5M12 22V12"/>'
};

export function icon(name, size) {
  var s = size || 22;
  var inner = PATHS[name] || '';
  var el = svgFromString(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" ' +
    'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    inner + '</svg>'
  );
  return el;
}
