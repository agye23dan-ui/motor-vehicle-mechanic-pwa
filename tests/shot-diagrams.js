/* Screenshots diagrams for visual checking.
 *   node tests/shot-diagrams.js OUTDIR name1,name2 [dark]
 * Needs a static server on port 8124 serving this folder (node scripts/serve.js 8124) and Playwright:
 * set PLAYWRIGHT_CORE to the path of playwright-core if it is not in node_modules. */
'use strict';
var pw = require(process.env.PLAYWRIGHT_CORE || '/opt/npm-tools/node_modules/playwright-core');
var out = process.argv[2], names = process.argv[3].split(','), theme = process.argv[4] || 'light';
(async function () {
  var b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  var p = await (await b.newContext({ viewport: { width: 640, height: 900 } })).newPage();
  var errs = [];
  p.on('pageerror', function (e) { errs.push(e.message); });
  p.on('console', function (m) { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:' + (process.env.PORT || 8124) + '/tests/diagrams.html?only=' + names.join(',') + '&theme=' + theme);
  await p.waitForSelector('body[data-ready]');
  for (var n of names) {
    var el = await p.$('#d-' + n + ' figure');
    if (el) { await el.screenshot({ path: out + '/' + n + '-' + theme + '.png' }); console.log('shot', n); } else console.log('no figure for', n);
  }
  if (errs.length) console.log('ERRORS:\n' + errs.join('\n'));
  await b.close();
})();
