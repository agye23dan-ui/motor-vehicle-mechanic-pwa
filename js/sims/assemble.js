import { h, svgFromString } from '../dom.js';
import * as store from '../store.js';
import { icon } from '../icons.js';
import { ASSEMBLIES, TOOLS } from './assemblies.js';
import { MORE } from './assemblies2.js';
import { EVEN_MORE } from './assemblies3.js';

var ALL = ASSEMBLIES.concat(MORE, EVEN_MORE);

/*
 * Disassemble and assemble studio. Pick a job, prepare safely, take the parts off in a valid
 * order with the right tools, inspect them, then put everything back with the right torque,
 * sequence and new parts. Mistakes cost points and are explained.
 */

var KEY = 'sim:assemble';
var PEN = { order: 3, tool: 2, bolt: 2, torque: 3, renew: 5, safety: 10, inspect: 5, hint: 1 };
var PEN_TIP = {
  order: 'Take parts off in the order they block each other, and refit them in the reverse order.',
  tool: 'Read the workshop manual extract and choose the right socket or tool for each fastener.',
  bolt: 'Follow the correct bolt sequence: star or criss-cross for rings of bolts, centre outward to tighten and outside inward to loosen.',
  torque: 'Tighten to the specified torque. Too little can let parts work loose, too much can strip threads or stretch bolts.',
  renew: 'Always fit new gaskets, seals, belts and stretch bolts. Never reuse them.',
  safety: 'Do the safety preparation first and avoid unsafe shortcuts such as compressed air on brake or clutch dust.',
  inspect: 'Measure each part and compare it with the limit before you decide to reuse it.',
  hint: 'Try to work from the manual extract without asking for hints.'
};

function lessonHref(id) { var m = /^(m\d+)-l(\d+)$/.exec(id); return '#/module/' + m[1] + '/lesson/' + m[2]; }
function best() { return store.get('kv', KEY) || {}; }
function starText(n) { return n ? '★'.repeat(n) + '☆'.repeat(3 - n) : '☆☆☆'; }
function toolName(id) { for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i][0] === id) return TOOLS[i][1]; return id; }
function shuffle(a) { var b = a.slice(); for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; } return b; }

/* Bolt positions inside a 180 by 180 box. */
function boltPositions(n, layout) {
  var pts = [], i;
  if (layout === 'circle') {
    for (i = 0; i < n; i++) { var a = (-90 + 360 * i / n) * Math.PI / 180; pts.push([90 + 62 * Math.cos(a), 90 + 62 * Math.sin(a)]); }
  } else {
    var cols = layout[0], rows = layout[1];
    for (i = 0; i < n; i++) {
      var cx = i % cols, ry = Math.floor(i / cols);
      pts.push([cols === 1 ? 90 : 20 + cx * (140 / (cols - 1)), rows === 1 ? 90 : 55 + ry * (70 / Math.max(1, rows - 1))]);
    }
  }
  return pts;
}

function buildSvg(asm) {
  var parts = asm.parts.slice().reverse().map(function (p) {
    return '<g class="asm-part" data-id="' + p.id + '" tabindex="0" role="button" aria-label="' + p.name + '">' + p.svg + '</g>';
  }).join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" class="dg asm-svg" viewBox="0 0 640 480" role="group" aria-label="' + asm.title + '"><title>' + asm.title + '</title>' +
    '<rect x="14" y="390" width="612" height="84" rx="6" class="tint-y-soft"/><text x="614" y="406" class="tsm" text-anchor="end">Workbench</text>' +
    asm.statics + parts + '</svg>';
}

function build(asm, onExit) {
  var scenario = asm.scenarios[Math.floor(Math.random() * asm.scenarios.length)];
  var st = {
    mode: 'prep', prep: {}, removed: [], installed: {}, slot: {}, tool: null, active: null, step: 0, bolt: 0, boltDone: [], decisions: {}, inspected: {}, revealed: {},
    pen: { order: 0, tool: 0, bolt: 0, torque: 0, renew: 0, safety: 0, inspect: 0, hint: 0 }, final: {}, start: Date.now(), msgs: [], manual: false, finishedAt: null
  };
  var partById = {}; asm.parts.forEach(function (p) { partById[p.id] = p; });
  var svgEl = svgFromString(buildSvg(asm));
  var groups = {};
  var side = h('div', { class: 'asm-side' });
  var log = h('div', { class: 'asm-log', role: 'status', 'aria-live': 'polite' });
  var banner = h('div', { class: 'asm-banner' });
  var root = h('div', { class: 'sim-layout asm-layout', 'data-scenario': JSON.stringify(scenario.inspect) }, h('div', { class: 'sim-main' }, banner, h('div', { class: 'sim-figure' }, svgEl), log), side);

  function say(text, kind) { st.msgs.unshift({ text: text, kind: kind || 'info' }); st.msgs = st.msgs.slice(0, 5); drawLog(); }
  function penalty(cat, why) { st.pen[cat] += PEN[cat]; say((why || '') + ' (minus ' + PEN[cat] + ' points)', 'bad'); drawBanner(); }
  function score() { var s = 100; Object.keys(st.pen).forEach(function (k) { s -= st.pen[k]; }); return Math.max(0, s); }

  function drawLog() {
    log.replaceChildren.apply(log, st.msgs.map(function (m) { return h('p', { class: 'asm-msg ' + m.kind }, m.text); }));
  }
  function drawBanner() {
    var phase = st.mode === 'prep' ? 'Step 1 of 4: safety preparation' : st.mode === 'dis' ? 'Step 2 of 4: take it apart' : st.mode === 'asm' ? 'Step 3 of 4: put it back together' : st.mode === 'final' ? 'Step 4 of 4: final checks' : 'Finished';
    banner.replaceChildren(h('div', { class: 'asm-phase' }, h('strong', null, phase), h('span', { class: 'asm-score' }, 'Score ' + score())));
  }

  /* ---- drawing ---- */
  Array.prototype.forEach.call(svgEl.querySelectorAll('.asm-part'), function (g) {
    groups[g.getAttribute('data-id')] = g;
    g.addEventListener('click', function () { pickPart(g.getAttribute('data-id')); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickPart(g.getAttribute('data-id')); } });
  });
  var NS = 'http://www.w3.org/2000/svg';
  var labels = {};
  asm.parts.forEach(function (p) {
    var tx = document.createElementNS(NS, 'text');
    tx.setAttribute('class', 'tsm'); tx.setAttribute('text-anchor', 'middle'); tx.style.display = 'none';
    tx.textContent = p.name;
    svgEl.appendChild(tx); labels[p.id] = tx;
  });
  function box(id) {
    var g = groups[id], b;
    try { b = g.getBBox(); } catch (e) { b = { x: 0, y: 0, width: 0, height: 0 }; }
    return b;
  }
  function placeBench(id, slot) {
    var b = box(id), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    var sc = Math.min(0.5, 84 / Math.max(1, b.width), 56 / Math.max(1, b.height));
    var bx = 66 + slot * 98, by = 428;
    groups[id].style.transform = 'translate(' + (bx - cx) + 'px,' + (by - cy) + 'px) scale(' + sc.toFixed(3) + ')';
    labels[id].setAttribute('x', bx); labels[id].setAttribute('y', 466); labels[id].style.display = '';
  }
  function paintParts() {
    asm.parts.forEach(function (p) {
      var g = groups[p.id], off = st.removed.indexOf(p.id) >= 0 && !st.installed[p.id];
      if (off) placeBench(p.id, st.slot[p.id]); else { g.style.transform = ''; labels[p.id].style.display = 'none'; }
      g.classList.toggle('on-bench', off);
      g.classList.toggle('active', st.active === p.id);
    });
  }

  /* ---- rules ---- */
  function removeBlockers(p) { return p.needs.filter(function (n) { return !(st.removed.indexOf(n) >= 0 && !st.installed[n]); }); }
  function installProblems(p) {
    var below = asm.parts.filter(function (q) { return q.needs.indexOf(p.id) >= 0 && !(st.installed[q.id] || st.removed.indexOf(q.id) < 0); });
    var aboveFitted = p.needs.filter(function (n) { return st.installed[n]; });
    return { below: below, above: aboveFitted };
  }
  function isOnBench(id) { return st.removed.indexOf(id) >= 0 && !st.installed[id]; }
  function isFitted(id) { return st.removed.indexOf(id) < 0 || !!st.installed[id]; }

  function stepsFor(p) {
    if (st.mode === 'dis') return p.remove;
    var steps = p.install.slice();
    var renewIt = p.renew || st.decisions[p.id] === 'replace';
    if (renewIt) steps.unshift({ t: 'renew', label: 'Choose the part to fit: ' + p.name, always: !!p.renew });
    return steps;
  }

  function pickPart(id) {
    var p = partById[id];
    if (st.mode === 'prep') { say('Finish the safety preparation first, then press Start the job.', 'info'); return; }
    if (st.mode === 'asm-ready') { say('Press Start the assembly first.', 'info'); return; }
    if (st.mode === 'final' || st.mode === 'done') return;
    if (st.mode === 'dis') {
      if (!isFitted(id)) { say(p.name + ' is already off.', 'info'); return; }
      var bl = removeBlockers(p);
      if (bl.length) { penalty('order', p.name + ' cannot come off yet: ' + bl.map(function (b) { return partById[b].name; }).join(' and ') + ' must be taken off first.'); return; }
      if (st.pendingInspect) { say('Finish the inspection of ' + partById[st.pendingInspect].name + ' first.', 'info'); return; }
    } else {
      if (!isOnBench(id)) { say(p.name + ' is already fitted.', 'info'); return; }
      var pr = installProblems(p);
      if (pr.below.length) { penalty('order', p.name + ' cannot go on yet. ' + pr.below.map(function (b) { return b.name; }).join(' and ') + ' sits underneath it and must be fitted first.'); return; }
      if (pr.above.length) { penalty('order', p.name + ' cannot go on now: ' + pr.above.map(function (b) { return partById[b].name; }).join(' and ') + ' is already fitted over it. Refit in the reverse order of removal.'); return; }
    }
    st.active = id; st.step = 0; st.bolt = 0; st.boltDone = []; st.manual = false;
    paintParts(); drawSide();
  }

  function finishPart() {
    var p = partById[st.active];
    if (st.mode === 'dis') {
      st.removed.push(p.id); st.slot[p.id] = freeSlot(); delete st.installed[p.id];
      say('Removed: ' + p.name + '.', 'good');
      if (p.inspect && !st.inspected[p.id]) st.pendingInspect = p.id;
    } else {
      st.installed[p.id] = true;
      say('Fitted: ' + p.name + '.', 'good');
    }
    st.active = null; paintParts();
    if (st.mode === 'dis' && allOff() && !st.pendingInspect) { st.mode = 'asm-ready'; }
    if (st.mode === 'asm' && asm.parts.every(function (q) { return isFitted(q.id); })) { st.mode = 'final'; say('All parts are fitted. Complete the final checks.', 'info'); }
    drawBanner(); drawSide();
  }
  function freeSlot() { var used = {}; Object.keys(st.slot).forEach(function (k) { if (isOnBench(k)) used[st.slot[k]] = true; }); var i = 0; while (used[i]) i++; return i; }
  function allOff() { return asm.parts.every(function (p) { return st.removed.indexOf(p.id) >= 0; }); }

  function advance() {
    st.step++; st.bolt = 0; st.boltDone = []; st.manual = false;
    var steps = stepsFor(partById[st.active]);
    if (st.step >= steps.length) finishPart(); else drawSide();
  }

  function needTool(step) {
    if (!step.tool) return true;
    if (st.tool !== step.tool) { penalty('tool', 'Wrong tool. This step needs the ' + toolName(step.tool) + '.'); return false; }
    return true;
  }

  /* ---- side panel ---- */
  function section(title, kids) { return h('div', { class: 'asm-sec' }, h('h3', null, title), kids); }

  function manualTable() {
    return section('Workshop manual extract', h('table', { class: 'sim-table asm-spec' }, h('tbody', null, asm.spec.map(function (r) {
      return h('tr', null, h('th', { scope: 'row' }, r[0]), h('td', null, r[1]), h('td', null, r[2]));
    }))));
  }

  function toolTray() {
    var wrap = h('div', { class: 'asm-tools', role: 'radiogroup', 'aria-label': 'Tool tray' }, TOOLS.map(function (t) {
      return h('button', { type: 'button', class: 'asm-tool' + (st.tool === t[0] ? ' sel' : ''), role: 'radio', 'aria-checked': st.tool === t[0] ? 'true' : 'false',
        onclick: function () { st.tool = st.tool === t[0] ? null : t[0]; drawSide(); } }, t[1]);
    }));
    return section('Tool tray' + (st.tool ? ': ' + toolName(st.tool) : ' (choose a tool)'), wrap);
  }

  function partList() {
    return section('Parts', h('ul', { class: 'asm-parts' }, asm.parts.map(function (p) {
      var on = isOnBench(p.id);
      return h('li', null, h('button', { type: 'button', class: 'asm-partbtn' + (st.active === p.id ? ' sel' : '') + (on ? ' bench' : ''), onclick: function () { pickPart(p.id); } },
        h('span', null, p.name), h('span', { class: 'asm-state' }, on ? 'on the bench' : 'fitted')));
    })));
  }

  function drawPrep() {
    var all = asm.prep.filter(function (x) { return x.ok; }).every(function (x) { return st.prep[x.id]; });
    side.replaceChildren(h('div', null,
      section('Scenario', h('p', null, scenario.say)),
      section('Safety preparation', h('div', null, h('p', { class: 'small muted' }, 'Tick what a careful technician does before starting. Some tempting shortcuts are unsafe.'),
        asm.prep.map(function (x) {
          var id = 'prep-' + asm.id + '-' + x.id;
          var cb = h('input', { type: 'checkbox', id: id, checked: st.prep[x.id] ? true : null });
          cb.addEventListener('change', function () {
            if (!x.ok) { cb.checked = false; if (!st.prep[x.id + '!']) { st.prep[x.id + '!'] = true; penalty('safety', 'Unsafe: ' + x.why); } else say('Unsafe: ' + x.why, 'bad'); return; }
            st.prep[x.id] = cb.checked; drawSide();
          });
          return h('div', { class: 'case-cause' }, cb, h('label', { for: id }, x.label));
        }))),
      h('button', { type: 'button', class: 'btn primary', disabled: all ? null : true, onclick: function () { st.mode = 'dis'; say('The job is safe to start. Click a part, then choose the right tool.', 'good'); drawBanner(); drawSide(); } }, 'Start the job'),
      manualTable()));
  }

  function hintBtn() {
    return h('button', { type: 'button', class: 'btn small', onclick: function () { penalty('hint', 'Hint: ' + hint()); } }, icon('flag', 16), 'Hint (minus 1)');
  }
  function hint() {
    if (st.active) {
      var s = stepsFor(partById[st.active])[st.step];
      return s.tool ? 'For "' + s.label + '", use the ' + toolName(s.tool) + '.' : 'Do the step: ' + s.label;
    }
    if (st.mode === 'dis') {
      var n = asm.parts.filter(function (p) { return isFitted(p.id) && removeBlockers(p).length === 0; })[0];
      return n ? 'Take off the ' + partById[n.id].name + ' next.' : 'Finish the inspection first.';
    }
    var last = st.removed.slice().reverse().filter(function (id) { return isOnBench(id); }).filter(function (id) { var pr = installProblems(partById[id]); return !pr.below.length && !pr.above.length; })[0];
    return last ? 'Fit the ' + partById[last].name + ' next.' : 'Check which part sits underneath the others.';
  }

  function inspectCard(id) {
    var p = partById[id], data = (scenario.inspect[id]) || { reading: 'Within limits', pass: true };
    var box = h('div', { class: 'asm-inspect' });
    function show() {
      var kids = [h('h3', null, 'Inspect: ' + p.name), h('p', null, p.inspect.label), h('p', { class: 'small muted' }, 'Limit: ' + p.inspect.limit)];
      if (!st.revealed[id]) {
        kids.push(h('button', { type: 'button', class: 'btn primary small', onclick: function () {
          if (st.tool !== 'gauge') { penalty('tool', 'Select the gauges and straight edge from the tool tray to measure.'); return; }
          st.revealed[id] = true; show(); } }, 'Measure it'));
      } else {
        kids.push(h('p', { class: 'asm-reading' }, 'Reading: ', h('strong', null, data.reading)));
        kids.push(h('div', { class: 'btn-row' },
          h('button', { type: 'button', class: 'btn', onclick: function () { decide('reuse'); } }, 'Reuse it'),
          h('button', { type: 'button', class: 'btn', onclick: function () { decide('replace'); } }, 'Replace or recondition it')));
      }
      box.replaceChildren(h('div', null, kids));
    }
    function decide(choice) {
      var right = data.pass ? 'reuse' : 'replace';
      if (choice !== right) penalty('inspect', data.pass ? 'That part is within limits, so replacing it wastes money, but it is safe.' : p.inspect.fail);
      else say(data.pass ? p.name + ' is within limits: reuse it.' : p.inspect.fail, 'good');
      st.decisions[id] = choice; st.inspected[id] = true; st.pendingInspect = null;
      if (allOff()) st.mode = 'asm-ready';
      drawSide();
    }
    show();
    return box;
  }

  function boltPad(step) {
    var order = step.order, pts = boltPositions(step.n, step.layout);
    var wrap = h('div', { class: 'asm-boltpad' });
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" class="dg" viewBox="0 0 180 180" role="group" aria-label="Bolt pattern: click the bolts in order"><title>Bolt pattern</title><circle cx="90" cy="90" r="82" class="box" style="fill-opacity:0.4"/>';
    pts.forEach(function (pt, i) {
      var k = st.boltDone.indexOf(i), done = k >= 0, man = st.manual ? order.indexOf(i) + 1 : 0;
      svg += '<g class="asm-bolt" data-i="' + i + '" tabindex="0" role="button" aria-label="Bolt ' + (i + 1) + (done ? ', done' : '') + '"><circle cx="' + pt[0].toFixed(1) + '" cy="' + pt[1].toFixed(1) + '" r="14" class="' + (done ? 'tint-g box' : 'box') + '"/>' +
        '<text x="' + pt[0].toFixed(1) + '" y="' + (pt[1] + 4.5).toFixed(1) + '" class="tb" text-anchor="middle">' + (done ? String(k + 1) : (st.manual ? String(man) : '')) + '</text></g>';
    });
    svg += '</svg>';
    var el = svgFromString(svg);
    Array.prototype.forEach.call(el.querySelectorAll('.asm-bolt'), function (g) {
      function go() { clickBolt(step, parseInt(g.getAttribute('data-i'), 10)); }
      g.addEventListener('click', go);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    wrap.appendChild(el);
    return wrap;
  }
  function clickBolt(step, i) {
    if (st.boltDone.indexOf(i) >= 0) return;
    if (!needTool(step)) return;
    if (i === step.order[st.boltDone.length]) {
      st.boltDone.push(i);
      if (st.boltDone.length === step.n) { say('All ' + step.n + ' bolts done in the correct order.', 'good'); advance(); } else drawSide();
    } else penalty('bolt', 'Wrong order. Follow the correct sequence: ' + (step.label.toLowerCase().indexOf('tighten') >= 0 || step.label.toLowerCase().indexOf('run') >= 0 ? 'tighten from the centre outward, or in a star or criss-cross pattern.' : 'loosen in the reverse of the tightening sequence, or in a star pattern.'));
  }

  function torqueChoices(step) {
    var v = step.value, ang = step.unit === 'degrees';
    var opts = ang ? [v, v / 2, v * 2, 'Hand tight'] : [v, Math.round(v * 0.5), Math.round(v * 1.7), 'Hand tight'];
    var seen = {}; opts = opts.filter(function (o) { if (seen[o]) return false; seen[o] = true; return true; });
    var shuffled = st.torqueOrder && st.torqueOrder.key === step.label ? st.torqueOrder.list : null;
    if (!shuffled) { shuffled = shuffle(opts); st.torqueOrder = { key: step.label, list: shuffled }; }
    return h('div', { class: 'asm-torque' }, shuffled.map(function (o) {
      return h('button', { type: 'button', class: 'btn small', onclick: function () {
        if (!needTool(step)) return;
        if (o === v) { say('Correct: ' + v + ' ' + (ang ? 'degrees' : 'N m') + '.', 'good'); st.torqueOrder = null; advance(); }
        else penalty('torque', o === 'Hand tight' ? 'Hand tight is not enough. Use the torque wrench and the specified value.' : (typeof o === 'number' && o < v ? o + ' is too low for this fastener and it could work loose.' : o + ' is too high and could strip the thread or stretch the bolt.'));
      } }, o === 'Hand tight' ? o : o + (ang ? ' degrees' : ' N m'));
    }));
  }

  function runner() {
    var p = partById[st.active], steps = stepsFor(p), step = steps[st.step];
    var head = h('div', { class: 'asm-runhead' }, h('h3', null, (st.mode === 'dis' ? 'Removing: ' : 'Fitting: ') + p.name), h('p', { class: 'small muted' }, 'Step ' + (st.step + 1) + ' of ' + steps.length),
      h('ol', { class: 'asm-steps' }, steps.map(function (s, i) { return h('li', { class: i < st.step ? 'done' : i === st.step ? 'now' : '' }, s.label); })));
    var body;
    if (step.t === 'do') {
      body = h('div', null, h('p', null, step.label), step.tool ? h('p', { class: 'small' }, 'Tool needed: ', h('strong', null, 'check the manual and choose it')) : null,
        h('button', { type: 'button', class: 'btn primary', onclick: function () { if (needTool(step)) advance(); } }, 'Do this step'));
    } else if (step.t === 'bolts') {
      body = h('div', null, h('p', null, step.label), boltPad(step),
        h('button', { type: 'button', class: 'linkish', onclick: function () { if (!st.manual) { st.manual = true; penalty('hint', 'You looked up the tightening sequence in the manual.'); } drawSide(); } }, 'Look up the tightening sequence in the manual (minus 1)'));
    } else if (step.t === 'torque') {
      body = h('div', null, h('p', null, step.label), h('p', { class: 'small muted' }, 'Choose the correct setting for the torque wrench.'), torqueChoices(step));
    } else {
      body = h('div', null, h('p', null, step.label), h('div', { class: 'btn-row' },
        h('button', { type: 'button', class: 'btn primary', onclick: function () { say('New ' + p.name.toLowerCase() + ' selected.', 'good'); advance(); } }, 'Fit a new part'),
        h('button', { type: 'button', class: 'btn', onclick: function () { penalty('renew', 'Never reuse this part. It must be renewed.'); } }, 'Reuse the old one')));
    }
    return h('div', { class: 'asm-sec asm-run' }, head, body, h('div', { class: 'btn-row' }, h('button', { type: 'button', class: 'linkish', onclick: function () { st.active = null; paintParts(); drawSide(); } }, 'Stop working on this part')));
  }

  function finalChecks() {
    var all = asm.final.every(function (x, i) { return st.final[i]; });
    return h('div', null, section('Final checks', h('div', null, h('p', { class: 'small muted' }, 'Tick each check as you complete it.'),
      asm.final.map(function (x, i) {
        var id = 'fin-' + asm.id + '-' + i, cb = h('input', { type: 'checkbox', id: id, checked: st.final[i] ? true : null });
        cb.addEventListener('change', function () { st.final[i] = cb.checked; drawSide(); });
        return h('div', { class: 'case-cause' }, cb, h('label', { for: id }, x));
      }))), h('button', { type: 'button', class: 'btn primary', disabled: all ? null : true, onclick: finish }, 'Finish the job'));
  }

  function finish() {
    st.mode = 'done'; st.finishedAt = Date.now();
    var sc = score(), stars = sc >= 90 ? 3 : sc >= 70 ? 2 : 1;
    var b = best(); if ((b[asm.id] || 0) < stars) { b[asm.id] = stars; store.set('kv', KEY, b); }
    var mins = Math.max(1, Math.round((st.finishedAt - st.start) / 60000));
    var tips = Object.keys(st.pen).filter(function (k) { return st.pen[k] > 0; });
    side.replaceChildren(h('div', null, h('div', { class: 'asm-sec' },
      h('h3', null, 'Job complete'), h('p', { class: 'case-score' }, starText(stars) + '  ' + sc + ' points'), h('p', { class: 'small muted' }, 'Time: about ' + mins + (mins === 1 ? ' minute' : ' minutes')),
      tips.length ? h('div', null, h('h3', null, 'Where you lost points'), h('ul', null, tips.map(function (k) { return h('li', null, h('strong', null, k.charAt(0).toUpperCase() + k.slice(1) + ' (minus ' + st.pen[k] + '): '), PEN_TIP[k]); })))
        : h('p', null, 'No mistakes. This is how a careful technician works.'),
      h('div', { class: 'btn-row' }, h('button', { type: 'button', class: 'btn primary', onclick: function () { onExit(); } }, 'Choose another job'),
        h('a', { class: 'btn', href: lessonHref(asm.lesson[0]) }, 'Study: ' + asm.lesson[1])))));
    drawBanner();
  }

  function drawSide() {
    paintParts();
    if (st.mode === 'prep') { drawPrep(); return; }
    var kids = [];
    if (st.mode === 'asm-ready') {
      kids.push(h('div', { class: 'asm-sec' }, h('h3', null, 'Everything is off'), h('p', null, 'Parts are on the bench and the inspections are done. Now rebuild it in the reverse order. Replace what you decided to replace, and always fit new gaskets, seals, belts and stretch bolts.'),
        h('button', { type: 'button', class: 'btn primary', onclick: function () { st.mode = 'asm'; say('Assembly started. Click a part on the bench to fit it.', 'info'); drawBanner(); drawSide(); } }, 'Start the assembly')));
    } else if (st.mode === 'final') kids.push(finalChecks());
    else {
      if (st.pendingInspect) kids.push(h('div', { class: 'asm-sec' }, inspectCard(st.pendingInspect)));
      if (st.active) kids.push(runner());
      else if (!st.pendingInspect) kids.push(h('div', { class: 'asm-sec' }, h('p', null, st.mode === 'dis' ? 'Click a part in the picture (or in the list below) to start removing it.' : 'Click a part on the workbench to fit it.'), hintBtn()));
      kids.push(toolTray());
      kids.push(partList());
    }
    kids.push(manualTable());
    side.replaceChildren(h('div', null, kids));
  }

  drawBanner(); drawLog(); drawSide();
  return root;
}

export default {
  id: 'assemble', title: 'Disassemble and assemble studio', icon: 'wrench',
  blurb: 'Strip down a disc brake, drum brake, caliper, cylinder head, clutch, alternator, starter, water pump, wheel bearing, driveshaft, tie-rod end, fuel pump or timing belt on screen. Choose the tools, follow the sequence, inspect the parts and rebuild to the right torque.',
  lesson: ['m02-l7', 'Dismantling, inspecting and reassembling good practice'],
  build: function () {
    var root = h('div', { class: 'asm' });
    function pick() {
      var scores = best();
      root.replaceChildren(h('p', null, 'Choose a job. You will prepare safely, take the parts off in the right order with the right tools, inspect them against the manual limits, then rebuild. Mistakes cost points and are explained.'),
        h('div', { class: 'tool-grid studio-grid' }, ALL.map(function (a) {
          return h('button', { type: 'button', class: 'hub-card sim-card asm-card', onclick: function () { root.replaceChildren(build(a, pick)); } },
            h('h3', null, a.title), h('p', null, a.blurb), h('span', { class: 'case-stars' }, starText(scores[a.id] || 0)), h('span', { class: 'go' }, 'Start', icon('chevron', 16)));
        })));
    }
    pick();
    return root;
  }
};
