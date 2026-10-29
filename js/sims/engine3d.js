import { h } from '../dom.js';
import { icon } from '../icons.js';

/*
 * 3D Engine Exploded View and Assembly Visualizer.
 * Provides an interactive Three.js 3D model of an inline-four engine with 21 components,
 * procedural geometry, realistic materials, soft contact shadows on a white studio stage,
 * exploded view interpolation slider, step navigation, and full component directory.
 */

var PARTS = [
  { order: 1, name: 'Oil Pan Drain Bolt', spec: 'Steel M14×1.5', role: 'Lowest drain plug removed to drain engine oil during regular servicing.' },
  { order: 2, name: 'Drain Bolt Crush Washer', spec: 'Soft Copper / Aluminium', role: 'Deformable sealing washer preventing sump oil leaks; replace on every service.' },
  { order: 3, name: 'Oil Pan / Sump', spec: 'Pressed Steel / Cast Alloy', role: 'Oil reservoir at engine base collecting circulating lubricant for the pickup tube.' },
  { order: 4, name: 'Oil Pan Gasket', spec: 'High-Temp Silicone / RTV', role: 'Flexible perimeter joint seal preventing oil escaping between pan and block.' },
  { order: 5, name: 'Engine Block', spec: 'Cast Iron / Aluminium Alloy', role: 'Rigid backbone containing 4 inline cylinder bores, coolant jackets and main bearings.' },
  { order: 6, name: 'Oil Filter', spec: 'Spin-on Steel Housing', role: 'Cleans pressurized oil of metallic shavings and carbon particles before bearings.' },
  { order: 7, name: 'Timing Belt Drive Pulley', spec: 'Machined Sintered Steel', role: 'Crankshaft gear driving the timing belt to turn camshafts at half engine speed.' },
  { order: 8, name: 'Water Pump Gasket', spec: 'Moulded Elastomer', role: 'High-pressure watertight seal preventing coolant escaping from the block gallery.' },
  { order: 9, name: 'Water Pump Assembly', spec: 'Die-cast Aluminium Impeller', role: 'Centrifugal pump circulating pressurized coolant through block and cylinder head.' },
  { order: 10, name: 'Cylinder Head Gasket', spec: 'Multi-Layer Steel (MLS)', role: 'Critical high-pressure seal for combustion chambers, high-pressure oil and coolant.' },
  { order: 11, name: 'Cylinder Head', spec: 'Cast Aluminium Alloy', role: 'Contains intake/exhaust valves, ports, spark plugs, and overhead camshaft journals.' },
  { order: 12, name: 'Camshaft Pulley', spec: 'Hardened Machined Steel', role: 'Driven by timing belt with double the teeth of crank gear for 1:2 rotational speed.' },
  { order: 13, name: 'Distributor O-Ring', spec: 'Viton Fluoropolymer', role: 'Oil-resistant radial seal keeping head oil inside the distributor mounting bore.' },
  { order: 14, name: 'Distributor Assembly', spec: 'Alloy Housing & Bakelite Cap', role: 'Distributes high-voltage ignition spark pulses to each cylinder in firing order.' },
  { order: 15, name: 'Exhaust Manifold Gasket', spec: 'Multi-layer Embossed Stainless', role: 'Thermal expansion gasket sealing glowing exhaust ports against poisonous gas leaks.' },
  { order: 16, name: 'Exhaust Manifold', spec: 'Ductile Cast Iron / Tubular', role: 'Gathers hot burnt combustion gases from 4 exhaust ports into single downpipe.' },
  { order: 17, name: 'Intake Manifold Gasket', spec: 'Composite Sheet / Moulded Rubber', role: 'Air-tight plenum seal preventing vacuum leaks and unmetered false air entry.' },
  { order: 18, name: 'Intake Manifold', spec: 'Cast Aluminium / Thermoplastic', role: 'Evenly distributes air or fuel-air mixture from throttle body to intake runners.' },
  { order: 19, name: 'Cylinder Head Cover Gasket', spec: 'Moulded Nitrile Rubber', role: 'Top perimeter seal containing camshaft lubricating oil under the rocker cover.' },
  { order: 20, name: 'Valve Cover Grommets', spec: 'Synthetic Rubber Dampers', role: 'Vibration dampers under hold-down bolts that maintain even cover clamp pressure.' },
  { order: 21, name: 'Cylinder Head Cover (Rocker Cover)', spec: 'Pressed Alloy / Composite', role: 'Protective top cover enclosing valvetrain, camshafts, and oil filler cap.' }
];

export function build() {
  var wrap = h('div', { class: 'sim-3d-wrap' });

  var fsBtn = h('button', {
    type: 'button',
    class: 'btn small',
    title: 'Toggle Fullscreen view',
    onclick: function () {
      if (!document.fullscreenElement) {
        if (wrap.requestFullscreen) wrap.requestFullscreen();
        else if (wrap.webkitRequestFullscreen) wrap.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    }
  }, icon('chevron', 14), 'Fullscreen');

  function onFsChange() {
    fsBtn.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
  }
  document.addEventListener('fullscreenchange', onFsChange);

  var openTabBtn = h('a', {
    class: 'btn small',
    href: 'engine.html',
    target: '_blank',
    rel: 'noopener',
    title: 'Open in a dedicated full browser window'
  }, icon('install', 14), 'Open full window');

  var actions = h('div', { class: 'sim-3d-actions' },
    h('div', { class: 'sim-3d-badge' },
      h('span', { class: 'dot' }),
      'Interactive 3D Engine Model (Three.js WebGL / Studio Stage)'
    ),
    h('div', { class: 'sim-3d-btns' }, openTabBtn, fsBtn)
  );

  var iframe = h('iframe', {
    class: 'sim-3d-iframe',
    src: 'engine.html',
    title: '3D Engine Exploded View and Assembly Visualizer',
    allow: 'fullscreen'
  });

  wrap.appendChild(actions);
  wrap.appendChild(iframe);

  // Table of 21 parts
  var rows = PARTS.map(function (p) {
    return h('tr', null,
      h('td', { style: { 'font-weight': '700', 'font-family': 'monospace', 'white-space': 'nowrap' } }, '#' + String(p.order).padStart(2, '0')),
      h('td', { style: { 'font-weight': '700', 'white-space': 'nowrap' } }, p.name),
      h('td', { style: { 'font-size': '0.9rem', 'color': 'var(--ink-2)', 'white-space': 'nowrap' } }, p.spec),
      h('td', { style: { 'font-size': '0.9rem' } }, p.role)
    );
  });

  var table = h('div', { style: { 'overflow-x': 'auto', 'margin-top': '0.8rem' } },
    h('table', { class: 'sim-table' },
      h('thead', null,
        h('tr', null,
          h('th', null, 'Order'),
          h('th', null, 'Component'),
          h('th', null, 'Material specification'),
          h('th', null, 'Role and workshop function')
        )
      ),
      h('tbody', null, rows)
    )
  );

  var root = h('div', { class: 'sim-layout' },
    h('div', { class: 'sim-main' },
      wrap,
      h('div', { class: 'sim-note', style: { 'margin-top': '1.2rem' } },
        h('h3', null, 'How to use this 3D simulator'),
        h('ul', { style: { 'margin': '0.4rem 0 1rem', 'padding-left': '1.2rem', 'display': 'grid', 'gap': '0.35rem', 'font-size': '0.95rem' } },
          h('li', null, h('strong', null, 'Orbit / Rotate: '), 'Click and drag with the left mouse button (or swipe with one finger).'),
          h('li', null, h('strong', null, 'Pan camera: '), 'Right-click and drag or scroll with two fingers to reposition the view.'),
          h('li', null, h('strong', null, 'Zoom: '), 'Scroll your mouse wheel or pinch on a touchscreen.'),
          h('li', null, h('strong', null, 'Inspect component: '), 'Click any part or floating tag to focus the camera and see detailed material specs.'),
          h('li', null, h('strong', null, 'Explode slider: '), 'Drag the slider at the bottom from 0% (compact assembled) to 100% (fully separated exploded view).'),
          h('li', null, h('strong', null, 'Auto animate: '), 'Click the play button to watch continuous assembly and disassembly cycles in real time.'),
          h('li', null, h('strong', null, 'Camera presets: '), 'Use the Iso, Front, Top, and Side buttons to view the engine from standard drafting angles.'),
          h('li', null, h('strong', null, 'Stage theme: '), 'Toggle between the crisp White Studio Stage and the Dark Stage anytime.')
        )
      ),
      h('div', { class: 'sim-note', style: { 'margin-top': '1.2rem' } },
        h('h3', null, 'Component Directory & Assembly Specifications'),
        h('p', { class: 'small' }, 'All 21 components are ordered according to their physical assembly stack, beginning at the oil drain plug at the bottom and finishing at the rocker cover at the top:'),
        table
      )
    ),
    h('div', { class: 'sim-side' },
      h('h3', null, 'Assembly rules'),
      h('div', { class: 'sim-note', style: { 'font-size': '0.93rem', 'line-height': '1.5' } },
        h('p', null, h('strong', null, '1. Clean surfaces: '), 'Every joint face must be degreased and scraped clean with a plastic or brass scraper. Never gouge soft aluminium.'),
        h('p', null, h('strong', null, '2. MLS head gaskets: '), 'Multi-layer steel gaskets must be installed clean and completely dry. Do not apply sealant unless specified by the manual.'),
        h('p', null, h('strong', null, '3. Replace stretch bolts: '), 'Torque-to-yield cylinder head bolts permanently stretch during tightening and cannot be reused.'),
        h('p', null, h('strong', null, '4. Tighten in stages: '), 'Always follow the spiral sequence from the centre outwards in multiple torque stages to avoid warping the cylinder head.')
      ),
      h('div', { class: 'sim-try' },
        h('h3', null, 'Try this in 3D'),
        h('ol', null,
          h('li', null, 'Set the explode slider to 70% and examine the layer order between the cylinder block and the cylinder head.'),
          h('li', null, 'Switch to the Top view preset to inspect the 4 inline cylinder bores and the dual camshaft channels.'),
          h('li', null, 'Click on the Oil Pan Drain Bolt and note the crush washer. Why must this washer be replaced at every oil change?'),
          h('li', null, 'Click "Auto Animate" and observe how the intake and exhaust manifolds attach to opposite sides of the head.')
        )
      )
    )
  );

  root.destroy = function () {
    document.removeEventListener('fullscreenchange', onFsChange);
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch (e) { /* ignore */ }
    }
  };

  return root;
}

export default {
  id: 'engine-3d',
  title: '3D Engine exploded view',
  icon: 'cube',
  blurb: 'Interactive 3D inline-four engine assembly visualizer. Orbit, pan, zoom, explode 21 core components, inspect technical specifications, and study assembly order on a clean studio stage.',
  lesson: ['m04-l4', 'Engine block and its parts'],
  build: build
};
