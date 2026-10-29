/* Four more jobs for the Disassemble and assemble studio. Same data format as assemblies.js. */
import { R, C, P, T, bolts, doStep, torque , RS, STEEL, DARK, RED, RUBBER, LINING } from './assemblies.js';


/* Path of a belt wrapped round circles [x, y, r], listed clockwise on the screen, using outer tangent lines. */
function hull(cs) {
  var n = cs.length, seg = [], i;
  for (i = 0; i < n; i++) {
    var a = cs[i], b = cs[(i + 1) % n];
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy);
    var nx = dy / L, ny = -dx / L, ex = dx / L, ey = dy / L;
    var sb = (a[2] - b[2]) / L, cb = Math.sqrt(1 - sb * sb);
    var ux = nx * cb + ex * sb, uy = ny * cb + ey * sb;
    seg.push([[a[0] + a[2] * ux, a[1] + a[2] * uy], [b[0] + b[2] * ux, b[1] + b[2] * uy]]);
  }
  var d = 'M' + seg[0][0][0].toFixed(1) + ' ' + seg[0][0][1].toFixed(1);
  for (i = 0; i < n; i++) {
    var nxt = (i + 1) % n, c = cs[nxt];
    d += 'L' + seg[i][1][0].toFixed(1) + ' ' + seg[i][1][1].toFixed(1) + 'A' + c[2] + ' ' + c[2] + ' 0 0 1 ' + seg[nxt][0][0].toFixed(1) + ' ' + seg[nxt][0][1].toFixed(1);
  }
  return d + 'Z';
}

export var EVEN_MORE = [

  /* ---------------------------------------------------------------- Brake caliper overhaul */
  {
    id: 'caliperoverhaul', title: 'Brake caliper overhaul', lesson: ['m19-l5', 'Brake service'],
    blurb: 'Strip a caliper on the bench, inspect the piston and slide pins, and rebuild it with a new seal and boot.',
    scenarios: [
      { say: 'The caliper sticks. The piston is pitted and the boot is split.', inspect: { piston: { reading: 'Pitted with rust on the sealing surface', pass: false }, slidepins: { reading: 'Seized and corroded', pass: false } } },
      { say: 'The car pulls when braking. The piston is clean but the pins are dry.', inspect: { piston: { reading: 'Smooth and clean', pass: true }, slidepins: { reading: 'Dry and rusty', pass: false } } },
      { say: 'The caliper leaks slightly at the boot. The piston is good.', inspect: { piston: { reading: 'Smooth and clean', pass: true }, slidepins: { reading: 'Free and greased', pass: true } } }
    ],
    spec: [['Slide pin bolts', 'Torx T40', '30 N m'], ['Bleed screw', '10 mm socket', '8 N m'], ['Piston', 'Grease-gun piston ejector', 'Smooth, no pitting'], ['Brake fluid', '', 'Fresh DOT 4 only, never mineral oil']],
    prep: [
      { id: 'clean', label: 'Work on a clean bench with brake cleaner and a lint-free cloth', ok: true },
      { id: 'gloves', label: 'Wear gloves and eye protection, because brake fluid is harmful and strips paint', ok: true },
      { id: 'drain', label: 'Empty the caliper into a container and dispose of the old fluid correctly', ok: true },
      { id: 'air', label: 'Blow the piston out with full compressed air, keeping your fingers in the way to hold it', ok: false, why: 'A piston can fire out with great force and crush fingers. Use a grease-gun piston ejector or a low-pressure method with the piston held clear.' }
    ],
    parts: [
      { id: 'pads', name: 'Brake pads', c: [165, 190], needs: [], svg: RS(150, 120, 32, 140, LINING, 3) + RS(144, 120, 8, 140, STEEL, 2) + P('M160 128V252M170 128V252', 'k2', 'stroke:#6b645d;stroke-width:1.5'), remove: [doStep('Slide the pads and clips out of the caliper', null)], renew: true, install: [doStep('Fit the new pads and clips', null)] },
      { id: 'slidepins', name: 'Slide pins and boots', c: [330, 330], needs: ['pads'], svg: RS(180, 70, 220, 12, STEEL, 5) + RS(180, 318, 220, 12, STEEL, 5) + RS(174, 64, 12, 24, RUBBER, 4) + RS(174, 312, 12, 24, RUBBER, 4),
        remove: [doStep('Pull the slide pins out of the caliper bracket', 'torx-t40')],
        inspect: { label: 'Check the pins for rust and that they slide freely', limit: 'Smooth, no corrosion', fail: 'The pins are corroded or seized: replace them and the boots.' },
        install: [doStep('Clean and lightly grease the pins and fit new boots', 'grease'), doStep('Slide the pins in and fit the bolts', 'torx-t40'), torque('Torque the slide pin bolts', 'torx-t40', 30)] },
      { id: 'bleedscrew', name: 'Bleed screw', c: [447, 99], needs: [], svg: RS(440, 86, 14, 26, DARK, 3) + RS(444, 78, 6, 9, STEEL, 2) + C(447, 99, 2, 'box') + T(447, 74, 'Bleed screw', 'tsm', 'middle'),
        remove: [doStep('Unscrew the bleed screw and clean the port', 'sock-10')],
        install: [doStep('Fit the bleed screw', 'sock-10'), torque('Torque the bleed screw', 'sock-10', 8)] },
      { id: 'piston', name: 'Piston', c: [325, 200], needs: ['bleedscrew', 'pads'], svg: RS(250, 160, 150, 80, STEEL, 12) + P('M258 166V234M392 166V234', 'k2', 'stroke:#4a5158;stroke-width:1.5') + P('M270 200H380', 'k2', 'stroke:#f1f4f6;stroke-width:2;opacity:0.7') + T(325, 205, 'Piston', 'tsm', 'middle'),
        remove: [doStep('Eject the piston with the grease-gun ejector. Keep fingers clear, and catch it on a cloth.', 'piston')],
        inspect: { label: 'Check the piston sealing surface for pitting and rust', limit: 'Smooth and clean', fail: 'The piston is pitted: replace it. A damaged surface will leak.' },
        install: [doStep('Coat the piston and seal with clean brake fluid or caliper grease and press the piston in squarely', 'piston')] },
      { id: 'boot', name: 'Dust boot', c: [244, 200], needs: ['piston'], svg: RS(236, 138, 16, 124, RUBBER, 5) + P('M240 146V254M246 146V254', 'k2', 'stroke:#4a5158;stroke-width:1.4'),
        remove: [doStep('Pick the dust boot out of its groove without scratching the bore', 'pry')],
        renew: true, install: [doStep('Fit the new boot into the groove and onto the piston', null)] },
      { id: 'seal', name: 'Piston seal', c: [234, 200], needs: ['boot'], svg: RS(228, 150, 6, 100, 'fill:#b8532f;stroke:#5c2a14', 3),
        remove: [doStep('Remove the old square-section seal from its groove with a plastic pick', 'pry')],
        renew: true, install: [doStep('Fit the new seal, with fresh fluid on it, into the groove', null)] }
    ],
    statics: RS(180, 90, 300, 220, RED, 18) + RS(230, 140, 200, 120, 'fill:#15171a;stroke:#050607;stroke-width:1.5', 10) + P('M196 106H464M196 294H464', 'k2', 'stroke:#fff;stroke-width:1;opacity:0.25'),
    final: ['Clean the caliper and check that the piston moves smoothly by hand', 'Refit the caliper and bleed the brake system', 'Pump the brake pedal until it is firm before moving the car', 'Road test at low speed and check for pulling or drag']
  },

  /* ---------------------------------------------------------------- Tie-rod end and gaiter */
  {
    id: 'tierod', title: 'Outer tie-rod end and rack gaiter', lesson: ['m18-l11', 'Suspension and steering repair procedures'],
    blurb: 'Replace a worn outer tie-rod end and a torn rack gaiter, keep the toe close to where it was, and know why an alignment must follow.',
    scenarios: [
      { say: 'Wandering steering and a clunk. The tie-rod end has play.', inspect: { tierodend: { reading: '2.0 mm play and a torn boot', pass: false }, gaiter: { reading: 'Intact', pass: true } } },
      { say: 'Grease on the inner side of the wheel. The gaiter is torn.', inspect: { tierodend: { reading: 'No play', pass: true }, gaiter: { reading: 'Torn and full of grit', pass: false } } },
      { say: 'Both parts are worn.', inspect: { tierodend: { reading: '1.5 mm play', pass: false }, gaiter: { reading: 'Cracked', pass: false } } }
    ],
    spec: [['Wheel nuts', '19 mm socket', '110 N m, star pattern'], ['Tie-rod end stud nut', '17 mm socket', '50 N m, new split pin'], ['Jam nut', '22 mm socket', '60 N m'], ['Tie-rod end play limit', '', 'None felt by hand'], ['Gaiter clips', 'Spring pliers', 'Always new']],
    prep: [
      { id: 'chock', label: 'Chock the rear wheels and apply the parking brake', ok: true },
      { id: 'stands', label: 'Raise the front and support it on axle stands', ok: true },
      { id: 'mark', label: 'Mark the position of the jam nut and count the turns before undoing anything', ok: true },
      { id: 'hammer', label: 'Free the taper by hitting the knuckle with a large steel hammer', ok: false, why: 'Hammering the knuckle can damage the bearing and the steering arm. Use a taper separator or the correct puller.' }
    ],
    parts: [
      { id: 'wheel', name: 'Wheel', c: [80, 200], needs: [], svg: RS(46, 60, 64, 280, RUBBER, 9) + P('M54 68V332', 'k2', 'stroke:#3a4048;stroke-width:9;stroke-dasharray:7 6') + RS(68, 84, 42, 232, STEEL, 4) + T(78, 205, 'Wheel', 'tsm', 'middle'),
        remove: [bolts('Remove the wheel nuts in a star pattern', 'sock-19', 5, 'circle', [0, 2, 4, 1, 3]), doStep('Lift the wheel off', null)],
        install: [doStep('Fit the wheel', null), bolts('Tighten the wheel nuts in a star pattern', 'sock-19', 5, 'circle', [0, 2, 4, 1, 3]), torque('Final torque with the torque wrench', 'sock-19', 110)] },
      { id: 'studnut', name: 'Stud nut', c: [215, 180], needs: ['wheel'], svg: RS(204, 166, 22, 26, DARK, 4) + P('M208 172H222M208 180H222M208 188H222', 'k2', 'stroke:#cfd4da;stroke-width:1') + P('M215 160V148', 'k bold'),
        remove: [doStep('Remove the split pin and undo the stud nut', 'sock-17')],
        renew: true,
        install: [doStep('Fit the stud nut', 'sock-17'), torque('Torque the stud nut', 'sock-17', 50), doStep('Fit a new split pin', 'pliers')] },
      { id: 'jamnut', name: 'Jam nut', c: [310, 206], needs: ['wheel'], svg: RS(302, 190, 16, 32, DARK, 3) + P('M306 196H314M306 206H314M306 216H314', 'k2', 'stroke:#cfd4da;stroke-width:1'),
        remove: [doStep('Mark the thread and loosen the jam nut a few turns', 'sock-22')],
        install: [doStep('Run the jam nut up against the tie-rod end', null), doStep('Tighten the jam nut against the end', 'sock-22'), torque('Torque the jam nut', 'sock-22', 60)] },
      { id: 'tierodend', name: 'Tie-rod end', c: [260, 205], needs: ['studnut', 'jamnut'], svg: RS(196, 194, 40, 26, STEEL, 8) + C(216, 200, 6, 'metal-dark') + RS(236, 200, 160, 12, STEEL, 5) + P('M244 205H392', 'k2', 'stroke:#4a5158;stroke-width:3;stroke-dasharray:1.5 2'),
        remove: [doStep('Separate the stud from the steering arm with the taper puller', 'puller'), doStep('Unscrew the end from the rod, counting the turns so the toe stays close', null)],
        renew: true,
        inspect: { label: 'Hold the end and check for play and a torn boot', limit: 'No play, boot intact', fail: 'The end has play: replace it, and set the toe again afterwards.' },
        install: [doStep('Screw the new end on by the same number of turns', null), doStep('Seat the tapered stud in the steering arm', null)] },
      { id: 'gaiter', name: 'Rack gaiter', c: [410, 200], needs: ['tierodend'], svg: RS(380, 172, 60, 56, RUBBER, 12) + P('M394 174V226M406 176V224M418 174V226M430 176V224', 'k2', 'stroke:#4a5158;stroke-width:2') + RS(376, 184, 6, 32, STEEL, 1) + RS(438, 184, 6, 32, STEEL, 1) + T(410, 244, 'Gaiter', 'tsm', 'middle'),
        remove: [doStep('Cut the clips with the pliers and slide the gaiter off', 'pliers')],
        renew: true,
        inspect: { label: 'Look at the gaiter for tears, cracks and grease or grit inside', limit: 'Intact and clean', fail: 'The gaiter is torn: replace it and the clips, and check the inner joint.' },
        install: [doStep('Slide on the new gaiter and fit new clips', 'pliers')] }
    ],
    statics: RS(440, 176, 170, 48, DARK, 8) + P('M456 188V212M472 188V212M488 188V212M504 188V212M520 188V212', 'k2', 'stroke:#8d96a0;stroke-width:1.4;opacity:0.55') + RS(130, 120, 70, 200, DARK, 10) + C(165, 200, 12, 'metal') + T(525, 205, 'Steering rack', 'tsm', 'middle'),
    final: ['Check the steering wheel is centred and turns fully both ways', 'Have the wheel alignment set, because the toe must be checked after any tie-rod work', 'Re-torque the wheel nuts after a short test drive', 'Test drive and check there is no wander or noise']
  },

  /* ---------------------------------------------------------------- Fuel pump and filter */
  {
    id: 'fuelpump', title: 'Fuel pump module and filter', lesson: ['m06-l3', 'Fuel tank, pump and delivery components'],
    blurb: 'Release the fuel pressure safely, take out the in-tank pump, inspect it and refit it with a new seal and filter.',
    scenarios: [
      { say: 'The car cranks but will not start. The pump has failed.', inspect: { module: { reading: 'Motor open circuit, strainer blocked', pass: false }, filter: { reading: 'Restricted and rusty inside', pass: false } } },
      { say: 'Hesitation under load. The filter is blocked.', inspect: { module: { reading: 'Runs smoothly, strainer clean', pass: true }, filter: { reading: 'Restricted and rusty inside', pass: false } } },
      { say: 'Poor fuel pressure. The pump is weak.', inspect: { module: { reading: 'Weak pressure and noisy', pass: false }, filter: { reading: 'Clean', pass: true } } }
    ],
    spec: [['Cover screws', 'Torx T40', '3 N m'], ['Lock ring', 'Lock-ring spanner', 'Turn until fully seated'], ['Filter clamps', '10 mm socket', '4 N m'], ['Pump pressure', '', '3.5 bar with the key on']],
    prep: [
      { id: 'fire', label: 'Work in a ventilated area away from sparks, flames and heat, with an extinguisher near', ok: true },
      { id: 'relieve', label: 'Relieve the fuel pressure by removing the pump fuse and running the engine until it stalls', ok: true },
      { id: 'battery', label: 'Disconnect the battery earth lead', ok: true },
      { id: 'smoke', label: 'Use a naked light to look inside the tank', ok: false, why: 'Petrol vapour explodes. Never use a flame or any spark near an open tank. Use an approved torch only.' }
    ],
    parts: [
      { id: 'seat', name: 'Rear seat cushion', c: [320, 80], needs: [], svg: RS(150, 60, 340, 42, 'fill:#4a4f56;stroke:#1f2327;stroke-width:1.2', 12) + P('M180 70V94M220 70V94M260 70V94M300 70V94M340 70V94M380 70V94M420 70V94M460 70V94', 'k2', 'stroke:#2a2f35;stroke-width:1.5') + T(320, 86, 'Rear seat', 'tsm', 'middle'),
        remove: [doStep('Lift the seat cushion out of its clips', null)], install: [doStep('Press the seat cushion back into its clips', null)] },
      { id: 'cover', name: 'Access cover', c: [320, 130], needs: ['seat'], svg: RS(230, 120, 180, 16, STEEL, 3) + RS(236, 112, 8, 10, DARK, 2) + RS(396, 112, 8, 10, DARK, 2),
        remove: [bolts('Remove the cover screws', 'torx-t40', 4, [2, 2], [0, 3, 1, 2])],
        install: [bolts('Fit the cover and the screws', 'torx-t40', 4, [2, 2], [0, 3, 1, 2]), torque('Torque the screws', 'torx-t40', 3)] },
      { id: 'plug', name: 'Plug and fuel lines', c: [380, 160], needs: ['cover'], svg: RS(356, 144, 48, 20, 'fill:#15171a;stroke:#050607', 4) + RS(362, 148, 12, 12, 'fill:#c9a23c;stroke:#6b5518', 2) + P('M404 154H470', 'pipe fuel') + T(380, 138, 'Plug and lines', 'tsm', 'middle'),
        remove: [doStep('Unplug the electrical connector', null), doStep('Release the fuel line quick-connects with the release tool or spring pliers, ready with a cloth', 'pliers')],
        install: [doStep('Push the fuel lines on until they click', null), doStep('Fit the electrical plug until it clicks', null)] },
      { id: 'lockring', name: 'Lock ring', c: [320, 206], needs: ['plug'], svg: RS(250, 200, 140, 12, DARK, 5) + P('M262 203V209M282 203V209M302 203V209M322 203V209M342 203V209M362 203V209M382 203V209', 'k2', 'stroke:#cfd4da;stroke-width:1.4'),
        remove: [doStep('Turn the lock ring counter-clockwise with the lock-ring spanner. Never hit it with a hammer and punch.', 'lockring')],
        install: [doStep('Turn the lock ring clockwise until it is fully seated', 'lockring')] },
      { id: 'module', name: 'Pump module', c: [320, 270], needs: ['lockring'], svg: RS(280, 150, 80, 190, STEEL, 10) + RS(292, 250, 56, 80, DARK, 8) + P('M300 262H340M300 274H340M300 286H340', 'k2', 'stroke:#8d96a0;stroke-width:1') + RS(300, 330, 40, 12, 'fill:#e0b04a;stroke:#7a5a1c', 3) + C(350, 300, 6, 'metal-dark') + P('M348 300L372 322', 'k2', 'stroke:#cfd4da;stroke-width:2') + C(374, 324, 7, 'tint-y') + T(320, 244, 'Pump', 'tsm', 'middle'),
        remove: [doStep('Lift the module out slowly, tilting it to clear the float arm and letting fuel drain back', null)],
        inspect: { label: 'Check the strainer, the float arm and the pump motor on the bench', limit: 'Strainer clean, motor runs smoothly', fail: 'The pump or strainer fails the check: replace the pump module.' },
        install: [doStep('Lower the module into the tank, lining up the float arm and the alignment mark', null)] },
      { id: 'seal', name: 'Tank seal', c: [320, 214], needs: ['module'], svg: RS(250, 212, 140, 6, 'fill:#15171a;stroke:#050607', 3),
        remove: [doStep('Remove the old rubber seal from the tank flange', null)],
        renew: true, install: [doStep('Fit the new seal, dry and flat, on the clean flange', null)] },
      { id: 'filter', name: 'Fuel filter', c: [100, 275], needs: [], svg: RS(70, 260, 60, 30, STEEL, 9) + RS(66, 266, 8, 18, DARK, 2) + RS(126, 266, 8, 18, DARK, 2) + P('M82 262V288M92 262V288M102 262V288M112 262V288', 'k2', 'stroke:#4a5158;stroke-width:1.2') + P('M130 275H250', 'pipe fuel') + T(100, 308, 'Filter', 'tsm', 'middle'),
        remove: [bolts('Loosen the two filter clamps, catching the fuel with a cloth', 'sock-10', 2, [2, 1], [0, 1]), doStep('Pull the filter out of the pipes, noting the flow arrow', null)],
        renew: true,
        inspect: { label: 'Cut the filter open or flow-test it to see whether it is blocked', limit: 'Free flowing and clean inside', fail: 'The filter is restricted: replace it.' },
        install: [doStep('Fit the new filter with the flow arrow pointing toward the engine', null), bolts('Tighten the two filter clamps', 'sock-10', 2, [2, 1], [0, 1]), torque('Torque the clamps', 'sock-10', 4)] }
    ],
    statics: RS(120, 220, 400, 130, 'fill:#4a4f56;fill-opacity:0.9;stroke:#1f2327;stroke-width:2', 18) + RS(124, 262, 392, 84, 'fill:#e0b04a;fill-opacity:0.38', 14) + P('M130 262H510', 'k2', 'stroke:#e0b04a;stroke-width:2') + T(470, 340, 'Fuel tank', 'tsm', 'middle'),
    final: ['Reconnect the battery and switch the ignition on and off twice to prime the system', 'Check every joint and the filter for fuel leaks before starting', 'Start the engine and check the fuel pressure', 'Clean up any spilled fuel and dispose of the old fuel and filter correctly']
  },

  /* ---------------------------------------------------------------- Timing belt kit */
  {
    id: 'timingkit', title: 'Timing belt, tensioner and idler', lesson: ['m04-l8', 'Timing drives'],
    blurb: 'Lock the engine at top centre, remove the old timing belt and its tensioner, and fit a new kit without losing the timing.',
    scenarios: [
      { say: 'The belt is at its service interval. The idler is rough.', inspect: { timingbelt: { reading: 'Cracked and oil-stained edge', pass: false }, tensioner: { reading: 'Spring weak', pass: false }, idler: { reading: 'Rough and noisy', pass: false } } },
      { say: 'A noise from the front of the engine. The tensioner bearing is loose.', inspect: { timingbelt: { reading: 'Some fraying', pass: false }, tensioner: { reading: 'Bearing loose', pass: false }, idler: { reading: 'Smooth', pass: true } } }
    ],
    spec: [['Cover bolts', '10 mm socket', '8 N m'], ['Tensioner bolt', '13 mm socket', '25 N m'], ['Idler bolt', '13 mm socket', '25 N m'], ['Timing marks', '', 'Cylinder 1 at top centre, cam and crank locked']],
    prep: [
      { id: 'battery', label: 'Disconnect the battery earth lead', ok: true },
      { id: 'cold', label: 'Make sure the engine is cold', ok: true },
      { id: 'mark', label: 'Check that the right timing tools and the engine data are to hand, and do not turn the engine backwards unless the manual allows it', ok: true },
      { id: 'skip', label: 'Skip locking the timing and just count the belt teeth', ok: false, why: 'Without locking at top centre, the camshaft and crankshaft can move apart. On an interference engine this bends valves and wrecks the engine.' }
    ],
    parts: [
      { id: 'accbelt', name: 'Accessory drive belt', c: [225, 220], needs: [], svg: P(hull([[120, 150, 26], [330, 290, 44]]), 'k', 'stroke:#15171a;stroke-width:9') + P(hull([[120, 150, 26], [330, 290, 44]]), 'k2', 'stroke:#7a828a;stroke-width:9;stroke-dasharray:1.6 3.2;opacity:0.65') + T(225, 215, 'Belt', 'tsm', 'middle'),
        remove: [doStep('Release the tensioner with the breaker bar and slip the belt off', 'breaker')],
        install: [doStep('Route the new belt as in the diagram', 'breaker')] },
      { id: 'cover', name: 'Timing cover', c: [330, 200], needs: ['accbelt'], svg: RS(188, 62, 284, 276, 'fill:#6b737c;fill-opacity:0.92;stroke:#2a2f35;stroke-width:2', 16) + RS(200, 74, 260, 252, 'fill:none;stroke:#2a2f35;stroke-width:1.5', 10) + C(206, 80, 5, 'metal-dark') + C(454, 80, 5, 'metal-dark') + C(206, 320, 5, 'metal-dark') + C(454, 320, 5, 'metal-dark') + T(330, 84, 'Timing cover', 'tsm', 'middle'),
        remove: [bolts('Remove the six cover bolts', 'sock-10', 6, [3, 2], [0, 5, 1, 4, 2, 3]), doStep('Lift the cover off', null)],
        install: [doStep('Fit the cover', null), bolts('Fit the six cover bolts', 'sock-10', 6, [3, 2], [0, 5, 1, 4, 2, 3]), torque('Torque the cover bolts', 'sock-10', 8)] },
      { id: 'tensioner', name: 'Tensioner', c: [270, 204], needs: ['cover'], svg: C(270, 204, 17, 'metal') + C(270, 204, 11, 'metal-dark') + C(270, 204, 5, 'metal') + T(270, 232, 'Tensioner', 'tsm', 'middle'),
        remove: [doStep('Lock the crankshaft and camshaft at top centre with the timing tools', 'lock'), doStep('Slacken the tensioner bolt', 'sock-13')],
        renew: true,
        inspect: { label: 'Spin the tensioner bearing and check the spring', limit: 'Smooth, firm spring', fail: 'The tensioner bearing or spring is weak: replace it with the kit.' },
        install: [doStep('Fit the new tensioner loosely', null), torque('Set the tensioner bolt to its torque', 'sock-13', 25)] },
      { id: 'timingbelt', name: 'Timing belt', c: [330, 200], needs: ['tensioner'], svg: P(hull([[250, 110, 34], [410, 110, 34], [330, 290, 28]]), 'k', 'stroke:#15171a;stroke-width:10') + P(hull([[250, 110, 34], [410, 110, 34], [330, 290, 28]]), 'k2', 'stroke:#7a828a;stroke-width:10;stroke-dasharray:1.8 3.4;opacity:0.7'),
        remove: [doStep('Slide the belt off the sprockets and the idler', null)],
        renew: true,
        inspect: { label: 'Examine the old belt for cracks, fraying and oil', limit: 'No cracks or contamination', fail: 'The belt is damaged: it must be replaced, and the cause of any oil found.' },
        install: [doStep('Fit the new belt with the engine still locked, keeping the drive side tight', null), doStep('Remove the locking tools, turn the engine two full turns by hand and recheck the timing marks', 'lock')] },
      { id: 'idler', name: 'Idler roller', c: [390, 206], needs: ['timingbelt'], svg: C(390, 206, 15, 'metal') + C(390, 206, 9, 'metal-dark') + C(390, 206, 3, 'metal') + T(390, 232, 'Idler', 'tsm', 'middle'),
        remove: [doStep('Remove the idler roller bolt', 'sock-13')],
        renew: true,
        inspect: { label: 'Spin the idler roller and listen for roughness', limit: 'Smooth and quiet', fail: 'The idler is rough: replace it with the kit.' },
        install: [doStep('Fit the new idler', 'sock-13'), torque('Torque the idler bolt', 'sock-13', 25)] }
    ],
    statics: R(70, 30, 510, 340, 'metal', 8) + T(110, 58, 'Engine front', 'tsm') +
      C(250, 110, 34, 'metal-dark') + C(250, 110, 8, 'box') + T(250, 114, 'Cam', 'tsm', 'middle') + C(410, 110, 34, 'metal-dark') + C(410, 110, 8, 'box') + T(410, 114, 'Cam', 'tsm', 'middle') + C(330, 290, 28, 'metal-dark') + C(330, 290, 7, 'box') +
      P('M244 76h12M244 144h12M214 110v12M286 110v-12', 'k2') + P('M404 76h12M404 144h12', 'k2'),
    overlay: C(120, 150, 26, 'metal-dark') + C(120, 150, 7, 'box') + C(330, 290, 44, 'metal-dark') + C(330, 290, 14, 'box') + T(330, 350, 'Crank pulley', 'tsm', 'middle') + T(120, 192, 'Alternator', 'tsm', 'middle'),
    final: ['Rotate the engine by hand two full turns and recheck the timing marks', 'Refit the accessory belt and reconnect the battery', 'Start the engine and listen for noise from the front', 'Reset the service reminder and note the belt change on the job card']
  }
];
