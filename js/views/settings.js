import { h } from '../dom.js';
import { icon } from '../icons.js';
import * as store from '../store.js';
import * as data from '../data.js';
import * as platform from '../platform.js';
import { pageHead, setTitle, toast, confirmDialog } from '../ui.js';

function seg(label, name, options) {
  var cur = store.setting(name, options[0][0]);
  var wrap = h('div', { class: 'field' }, h('span', { class: 'label', id: 'seg-' + name }, label));
  var box = h('div', { class: 'seg', role: 'group', 'aria-labelledby': 'seg-' + name });
  options.forEach(function (o) {
    var b = h('button', { type: 'button', 'aria-pressed': String(cur === o[0]) }, o[1]);
    b.addEventListener('click', function () {
      store.setSetting(name, o[0]);
      Array.prototype.forEach.call(box.children, function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      platform.applyTheme(); platform.applySize();
    });
    box.appendChild(b);
  });
  wrap.appendChild(box);
  return wrap;
}

export function render() {
  setTitle('Settings');
  var root = h('div', null, pageHead('Settings'));
  root.appendChild(h('section', { class: 'section' }, h('h2', null, 'Appearance'),
    seg('Theme', 'theme', [['system', 'Match device'], ['light', 'Light'], ['dark', 'Dark']]),
    seg('Text size', 'size', [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']])));

  var status = h('p', { class: 'muted small', role: 'status' });
  var install = h('div', null);
  function drawInstall() {
    install.replaceChildren();
    if (platform.isStandalone()) install.appendChild(h('p', null, 'The app is installed on this device.'));
    else if (platform.canPromptInstall()) install.appendChild(h('button', { class: 'btn primary', type: 'button', onclick: function () { platform.promptInstall(); } }, icon('install', 18), 'Install the app'));
    else if (platform.isIos()) install.appendChild(h('p', null, 'On iPhone or iPad, open this page in Safari, tap the Share button, then choose Add to Home Screen.'));
    else install.appendChild(h('p', { class: 'muted' }, 'Your browser will offer to install this app when it is ready. You can also use the browser menu and choose Install or Add to Home Screen.'));
  }
  platform.onInstallChange(drawInstall);
  drawInstall();
  var offline = h('p', { class: 'muted small' }, 'Checking offline storage…');
  platform.offlineReady().then(function (ok) { offline.textContent = ok ? 'All lessons are saved on this device and work without internet.' : 'Offline copy not saved yet. Open the app once while online and it will save itself.'; });
  root.appendChild(h('section', { class: 'section' }, h('h2', null, 'Install and offline'), install, offline));

  var fileInput = h('input', { type: 'file', accept: 'application/json,.json', class: 'sr-only', id: 'import-file', tabindex: '-1' });
  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    if (!f) return;
    f.text().then(function (txt) {
      var obj = JSON.parse(txt);
      store.checkBackup(obj);
      return confirmDialog('Replace your progress?', 'This backup will replace all progress on this device.', 'Restore', true).then(function (ok) {
        if (ok) return store.replaceAll(obj).then(function () { platform.applyTheme(); platform.applySize(); toast('Progress restored.'); });
      });
    }).catch(function (e) { toast(e instanceof SyntaxError ? 'That file is not valid JSON.' : e.message); }).then(function () { fileInput.value = ''; });
  });
  root.appendChild(h('section', { class: 'section' }, h('h2', null, 'Your progress'),
    h('p', { class: 'muted' }, store.status.persistent ? 'Saved on this device only. Export a backup before clearing browser data or changing phone.' : 'Progress cannot be saved in this browser (private mode or storage blocked). It will be lost when you close the app.'),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', type: 'button', onclick: function () {
        var blob = new Blob([JSON.stringify(store.exportData(), null, 1)], { type: 'application/json' });
        var a = h('a', { href: URL.createObjectURL(blob), download: 'motor-vehicle-mechanic-backup-' + new Date().toISOString().slice(0, 10) + '.json' });
        document.body.appendChild(a); a.click(); a.remove();
        window.setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      } }, icon('download', 18), 'Export backup'),
      h('button', { class: 'btn', type: 'button', onclick: function () { fileInput.click(); } }, icon('upload', 18), 'Import backup'),
      h('button', { class: 'btn danger', type: 'button', onclick: function () {
        confirmDialog('Reset all progress?', 'Lessons done, quiz and card history, exam results and streaks will be erased. This cannot be undone.', 'Erase progress', true).then(function (ok) {
          if (ok) store.resetProgress().then(function () { toast('Progress erased.'); });
        });
      } }, 'Reset progress')), fileInput));

  var build = window.MVM.build || { version: 'dev' };
  root.appendChild(h('section', { class: 'section' }, h('h2', null, 'App'),
    h('p', { class: 'muted small' }, 'Version ' + build.version + ' · ' + data.index().totals.quiz + ' questions · ' + data.index().totals.cards + ' cards'),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', type: 'button', onclick: function () {
        status.textContent = 'Checking…';
        platform.checkForUpdate().then(function (r) {
          if (r === 'ready') {
            status.replaceChildren('A new version is ready. ', h('button', { class: 'btn primary', type: 'button', onclick: function () {
              status.textContent = 'Updating…';
              platform.applyUpdate().then(function (ok) { if (!ok) status.textContent = 'The update is no longer waiting. Check again.'; });
            } }, 'Update now'));
            return;
          }
          status.textContent = r === 'current' ? 'You have the latest version.' : r === 'unsupported' ? 'Updates are not available in this browser or when opened as a file.' : r === 'failed' ? 'A new version exists but could not be downloaded. Connect to the internet and try again, or use Clear offline copy.' : 'Could not check. Are you offline?';
        });
      } }, 'Check for updates'),
      h('button', { class: 'btn', type: 'button', onclick: function () {
        confirmDialog('Clear the offline copy?', 'Your progress is kept. The app reloads and downloads its files again, so you need internet for this.', 'Clear and reload').then(function (ok) { if (ok) platform.clearCachesAndReload(); });
      } }, 'Clear offline copy')), status,
    h('p', null, h('a', { href: '#/about' }, 'About this app, sources and disclaimer'))));
  return root;
}

export function about() {
  setTitle('About');
  var c = data.course();
  return h('div', { class: 'about' }, pageHead('About'),
    h('p', null, 'Motor Vehicle Mechanic is a free study guide for people training to diagnose, service and repair cars and light vehicles. It covers engines, fuel and emission systems, auto electrical and electronics, hybrid and electric vehicles, car air conditioning, transmissions, steering, suspension, brakes and the workshop practice around them.'),
    h('section', { class: 'section' }, h('h2', null, 'Syllabus'),
      h('p', null, 'The module structure follows published international programmes rather than any one country, so it fits training in many places. The Red Seal standard gives the structure. Australian and UK qualifications were used as a cross-check. Topics were regrouped into ' + data.index().order.length + ' study modules:'),
      h('ul', { class: 'src-list' }, c.sources.map(function (s) { return h('li', null, h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title)); })),
      h('p', null, 'All lesson text, questions and flashcards are original writing for this app. Each module lists the syllabus units it covers on its page in the Learn tab.')),
    h('section', { class: 'section' }, h('h2', null, 'Please note'),
      h('ul', { class: 'src-list' },
        h('li', null, 'This is a study aid. It does not replace your training provider, the manufacturer\'s workshop manual, or your local workshop, electrical and road-safety rules. Where they differ, follow them.'),
        h('li', null, 'Always follow the safety steps for the vehicle in front of you. Never work under a vehicle held only by a jack, never open an A/C system or touch high-voltage hybrid and electric vehicle parts unless you are trained, certified and equipped to.'),
        h('li', null, 'Passing the mock exam here does not certify you. Exams and certificates come from your awarding body.'))),
    h('section', { class: 'section' }, h('h2', null, 'Privacy'),
      h('p', null, 'Everything you do stays on this device. There are no accounts, no tracking and no data sent anywhere. Export a backup from Settings if you want to move your progress.')),
    h('p', null, h('a', { href: '#/settings' }, 'Back to settings')),
    h('p', { class: 'muted small' }, 'Made by Creative Tech GH, Accra.'));
}
