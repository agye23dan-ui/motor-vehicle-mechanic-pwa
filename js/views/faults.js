import { h, rich } from '../dom.js';
import { icon } from '../icons.js';
import * as data from '../data.js';
import { crumb, pageHead, setTitle, loading, failure } from '../ui.js';

/* Fault finder: searchable list of common faults with causes, diagnosis and repair. */

var filter = { q: '', area: '' };

function areaId(fault) {
  var info = data.moduleInfo(fault.mod);
  return info ? info.area : '';
}

export function hub() {
  setTitle('Fault finder');
  var holder = h('div', null, loading());
  data.loadFaults().then(function (all) {
    var course = data.course();
    var input = h('input', { class: 'search', type: 'search', placeholder: 'Search a symptom, for example overheating', 'aria-label': 'Search faults', value: filter.q });
    var chips = h('div', { class: 'chip-row', role: 'group', 'aria-label': 'Filter by area' });
    var list = h('ul', { class: 'mlist fault-grid' });
    var count = h('p', { class: 'small muted', role: 'status' });

    function drawChips() {
      var opts = [['', 'All']].concat(course.areas.filter(function (a) {
        return all.some(function (f) { return areaId(f) === a.id; });
      }).map(function (a) { return [a.id, a.label]; }));
      chips.replaceChildren.apply(chips, opts.map(function (o) {
        return h('button', { type: 'button', class: 'fchip', 'aria-pressed': filter.area === o[0] ? 'true' : 'false', onclick: function () { filter.area = o[0]; drawChips(); draw(); } }, o[1]);
      }));
    }

    function draw() {
      var q = filter.q.trim().toLowerCase();
      var words = q ? q.split(/\s+/) : [];
      var hits = all.filter(function (f) {
        if (filter.area && areaId(f) !== filter.area) return false;
        if (!words.length) return true;
        var hay = (f.title + ' ' + f.causes.join(' ') + ' ' + f.diagnose.join(' ') + ' ' + f.repair.join(' ')).toLowerCase();
        return words.every(function (w) { return hay.indexOf(w) >= 0; });
      });
      list.replaceChildren.apply(list, hits.map(function (f) {
        var mi = data.moduleInfo(f.mod);
        return h('li', null, h('a', { class: 'mrow', href: '#/faults/' + f.id },
          h('span', { class: 'pct', title: mi ? 'Module ' + mi.number : '', 'aria-hidden': 'true' }, mi ? 'M' + mi.number : ''),
          h('div', null, h('div', { class: 't' }, f.title), h('div', { class: 'meta' }, h('span', null, mi ? 'Module ' + mi.number + ': ' + mi.short : ''), h('span', null, f.causes.length + ' causes'))),
          icon('chevron', 18)));
      }));
      count.textContent = hits.length + (hits.length === 1 ? ' fault' : ' faults') + (hits.length ? '' : '. Try fewer words.');
    }

    input.addEventListener('input', function () { filter.q = input.value; draw(); });
    drawChips();
    draw();
    holder.replaceChildren(h('div', null,
      pageHead('Fault finder', 'Common faults in every system: what you see, the likely causes, how to prove which one it is, and how to repair it.'),
      input, chips, count, list));
  }).catch(function (e) { holder.replaceChildren(failure(e)); });
  return holder;
}

function steps(tag, items) {
  return h(tag, { class: 'fsteps' }, items.map(function (s) { return h('li', null, rich(s)); }));
}

export function detail(params) {
  var id = params[0];
  var holder = h('div', null, loading());
  data.loadFaults().then(function (all) {
    var f = null;
    for (var i = 0; i < all.length; i++) if (all[i].id === id) f = all[i];
    if (!f) { holder.replaceChildren(crumb('#/faults', 'Fault finder'), h('p', { class: 'empty' }, 'That fault was not found.')); return; }
    setTitle(f.title);
    var mi = data.moduleInfo(f.mod);
    var kids = [
      crumb('#/faults', 'Fault finder'),
      h('div', { class: 'page-head' }, h('h1', null, f.title),
        mi ? h('p', null, 'Module ' + mi.number + ': ', h('a', { href: '#/module/' + f.mod }, mi.title)) : null),
      h('section', { class: 'section' }, h('h2', null, 'Likely causes'), h('p', { class: 'small muted' }, 'Listed from most to least common. Do not replace a part until a test shows it is faulty.'), steps('ul', f.causes)),
      h('section', { class: 'section' }, h('h2', null, 'How to diagnose'), steps('ol', f.diagnose)),
      h('section', { class: 'section' }, h('h2', null, 'Repair'), steps('ol', f.repair))
    ];
    if (f.lessons && f.lessons.length) {
      kids.push(h('section', { class: 'section' }, h('h2', null, 'Study the lessons'),
        h('ul', { class: 'fsteps' }, f.lessons.map(function (lid) {
          var m = /^(m\d+)-l(\d+)$/.exec(lid);
          return h('li', null, h('a', { href: '#/module/' + m[1] + '/lesson/' + m[2] }, data.lessonTitle(lid)), ' (Module ' + parseInt(m[1].slice(1), 10) + ')');
        }))));
    }
    if (f.caution) kids.push(h('div', { class: 'note safety' }, h('p', { class: 'label' }, icon('warning', 18), 'Safety'), h('p', null, rich(f.caution))));
    kids.push(h('p', { class: 'small muted' }, 'Always check the manufacturer’s workshop manual for the exact tests, limits and torque figures for the vehicle.'));
    if (mi) kids.push(h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: '#/module/' + f.mod }, icon('learn', 18), 'Study this module'), h('a', { class: 'btn', href: '#/faults' }, 'All faults')));
    holder.replaceChildren(h('div', { class: 'fault-page' }, kids));
  }).catch(function (e) { holder.replaceChildren(failure(e)); });
  return holder;
}
