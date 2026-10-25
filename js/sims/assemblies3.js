/* Four more jobs for the Disassemble and assemble studio. Same data format as assemblies.js. */
import { R, C, P, T, bolts, doStep, torque } from './assemblies.js';

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
      { id: 'pads', name: 'Brake pads', c: [165, 190], needs: [], svg: R(150, 120, 32, 140, 'tint-y') + R(144, 120, 8, 140, 'metal-dark'), remove: [doStep('Slide the pads and clips out of the caliper', null)], renew: true, install: [doStep('Fit the new pads and clips', null)] },
      { id: 'slidepins', name: 'Slide pins and boots', c: [330, 330], needs: ['pads'], svg: R(180, 70, 220, 12, 'metal-dark') + R(180, 318, 220, 12, 'metal-dark') + R(176, 66, 8, 20, 'rubber') + R(176, 314, 8, 20, 'rubber'),
        remove: [doStep('Pull the slide pins out of the caliper bracket', 'torx-t40')],
        inspect: { label: 'Check the pins for rust and that they slide freely', limit: 'Smooth, no corrosion', fail: 'The pins are corroded or seized: replace them and the boots.' },
        install: [doStep('Clean and lightly grease the pins and fit new boots', 'grease'), doStep('Slide the pins in and fit the bolts', 'torx-t40'), torque('Torque the slide pin bolts', 'torx-t40', 30)] },
      { id: 'bleedscrew', name: 'Bleed screw', c: [447, 99], needs: [], svg: R(440, 86, 14, 26, 'metal-dark') + T(447, 78, 'Bleed screw', 'tsm', 'middle'),
        remove: [doStep('Unscrew the bleed screw and clean the port', 'sock-10')],
        install: [doStep('Fit the bleed screw', 'sock-10'), torque('Torque the bleed screw', 'sock-10', 8)] },
      { id: 'piston', name: 'Piston', c: [325, 200], needs: ['bleedscrew', 'pads'], svg: R(250, 160, 150, 80, 'metal') + T(325, 205, 'Piston', 'tsm', 'middle'),
        remove: [doStep('Eject the piston with the grease-gun ejector. Keep fingers clear, and catch it on a cloth.', 'piston')],
        inspect: { label: 'Check the piston sealing surface for pitting and rust', limit: 'Smooth and clean', fail: 'The piston is pitted: replace it. A damaged surface will leak.' },
        install: [doStep('Coat the piston and seal with clean brake fluid or caliper grease and press the piston in squarely', 'piston')] },
      { id: 'boot', name: 'Dust boot', c: [244, 200], needs: ['piston'], svg: R(236, 138, 16, 124, 'rubber'),
        remove: [doStep('Pick the dust boot out of its groove without scratching the bore', 'pry')],
        renew: true, install: [doStep('Fit the new boot into the groove and onto the piston', null)] },
      { id: 'seal', name: 'Piston seal', c: [234, 200], needs: ['boot'], svg: R(228, 150, 6, 100, 'tint-m'),
        remove: [doStep('Remove the old square-section seal from its groove with a plastic pick', 'pry')],
        renew: true, install: [doStep('Fit the new seal, with fresh fluid on it, into the groove', null)] }
    ],
    statics: R(180, 90, 300, 220, 'metal') + R(230, 140, 200, 120, 'box'),
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
      { id: 'wheel', name: 'Wheel', c: [80, 200], needs: [], svg: R(46, 60, 64, 280, 'box tint-c', 8) + T(78, 205, 'Wheel', 'tsm', 'middle'),
        remove: [bolts('Remove the wheel nuts in a star pattern', 'sock-19', 5, 'circle', [0, 2, 4, 1, 3]), doStep('Lift the wheel off', null)],
        install: [doStep('Fit the wheel', null), bolts('Tighten the wheel nuts in a star pattern', 'sock-19', 5, 'circle', [0, 2, 4, 1, 3]), torque('Final torque with the torque wrench', 'sock-19', 110)] },
      { id: 'studnut', name: 'Stud nut', c: [215, 180], needs: ['wheel'], svg: R(204, 166, 22, 26, 'metal-dark') + P('M215 160V148', 'k bold'),
        remove: [doStep('Remove the split pin and undo the stud nut', 'sock-17')],
        renew: true,
        install: [doStep('Fit the stud nut', 'sock-17'), torque('Torque the stud nut', 'sock-17', 50), doStep('Fit a new split pin', 'pliers')] },
      { id: 'jamnut', name: 'Jam nut', c: [310, 206], needs: ['wheel'], svg: R(302, 190, 16, 32, 'metal-dark'),
        remove: [doStep('Mark the thread and loosen the jam nut a few turns', 'sock-22')],
        install: [doStep('Run the jam nut up against the tie-rod end', null), doStep('Tighten the jam nut against the end', 'sock-22'), torque('Torque the jam nut', 'sock-22', 60)] },
      { id: 'tierodend', name: 'Tie-rod end', c: [260, 205], needs: ['studnut', 'jamnut'], svg: R(196, 194, 40, 26, 'tint-c') + R(236, 200, 160, 12, 'metal-dark') + C(216, 200, 6, 'box'),
        remove: [doStep('Separate the stud from the steering arm with the taper puller', 'puller'), doStep('Unscrew the end from the rod, counting the turns so the toe stays close', null)],
        renew: true,
        inspect: { label: 'Hold the end and check for play and a torn boot', limit: 'No play, boot intact', fail: 'The end has play: replace it, and set the toe again afterwards.' },
        install: [doStep('Screw the new end on by the same number of turns', null), doStep('Seat the tapered stud in the steering arm', null)] },
      { id: 'gaiter', name: 'Rack gaiter', c: [410, 200], needs: ['tierodend'], svg: R(380, 172, 60, 56, 'rubber') + T(410, 244, 'Gaiter', 'tsm', 'middle'),
        remove: [doStep('Cut the clips with the pliers and slide the gaiter off', 'pliers')],
        renew: true,
        inspect: { label: 'Look at the gaiter for tears, cracks and grease or grit inside', limit: 'Intact and clean', fail: 'The gaiter is torn: replace it and the clips, and check the inner joint.' },
        install: [doStep('Slide on the new gaiter and fit new clips', 'pliers')] }
    ],
    statics: R(440, 176, 170, 48, 'metal') + R(130, 120, 70, 200, 'metal') + T(525, 205, 'Steering rack', 'tsm', 'middle'),
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
      { id: 'seat', name: 'Rear seat cushion', c: [320, 80], needs: [], svg: R(150, 60, 340, 42, 'box tint-c') + T(320, 86, 'Rear seat', 'tsm', 'middle'),
        remove: [doStep('Lift the seat cushion out of its clips', null)], install: [doStep('Press the seat cushion back into its clips', null)] },
      { id: 'cover', name: 'Access cover', c: [320, 130], needs: ['seat'], svg: R(230, 120, 180, 16, 'tint-c') + R(236, 114, 8, 10, 'metal-dark') + R(396, 114, 8, 10, 'metal-dark'),
        remove: [bolts('Remove the cover screws', 'torx-t40', 4, [2, 2], [0, 3, 1, 2])],
        install: [bolts('Fit the cover and the screws', 'torx-t40', 4, [2, 2], [0, 3, 1, 2]), torque('Torque the screws', 'torx-t40', 3)] },
      { id: 'plug', name: 'Plug and fuel lines', c: [380, 160], needs: ['cover'], svg: R(356, 144, 48, 20, 'tint-m') + P('M404 154H470', 'pipe fuel') + T(380, 138, 'Plug and lines', 'tsm', 'middle'),
        remove: [doStep('Unplug the electrical connector', null), doStep('Release the fuel line quick-connects with the release tool or spring pliers, ready with a cloth', 'pliers')],
        install: [doStep('Push the fuel lines on until they click', null), doStep('Fit the electrical plug until it clicks', null)] },
      { id: 'lockring', name: 'Lock ring', c: [320, 206], needs: ['plug'], svg: R(250, 200, 140, 12, 'metal-dark'),
        remove: [doStep('Turn the lock ring counter-clockwise with the lock-ring spanner. Never hit it with a hammer and punch.', 'lockring')],
        install: [doStep('Turn the lock ring clockwise until it is fully seated', 'lockring')] },
      { id: 'module', name: 'Pump module', c: [320, 270], needs: ['lockring'], svg: R(280, 150, 80, 190, 'metal') + R(300, 330, 40, 12, 'tint-y') + T(320, 250, 'Pump', 'tsm', 'middle'),
        remove: [doStep('Lift the module out slowly, tilting it to clear the float arm and letting fuel drain back', null)],
        inspect: { label: 'Check the strainer, the float arm and the pump motor on the bench', limit: 'Strainer clean, motor runs smoothly', fail: 'The pump or strainer fails the check: replace the pump module.' },
        install: [doStep('Lower the module into the tank, lining up the float arm and the alignment mark', null)] },
      { id: 'seal', name: 'Tank seal', c: [320, 214], needs: ['module'], svg: R(250, 212, 140, 6, 'tint-y'),
        remove: [doStep('Remove the old rubber seal from the tank flange', null)],
        renew: true, install: [doStep('Fit the new seal, dry and flat, on the clean flange', null)] },
      { id: 'filter', name: 'Fuel filter', c: [100, 275], needs: [], svg: R(70, 260, 60, 30, 'metal') + P('M130 275H250', 'pipe fuel') + T(100, 308, 'Filter', 'tsm', 'middle'),
        remove: [bolts('Loosen the two filter clamps, catching the fuel with a cloth', 'sock-10', 2, [2, 1], [0, 1]), doStep('Pull the filter out of the pipes, noting the flow arrow', null)],
        renew: true,
        inspect: { label: 'Cut the filter open or flow-test it to see whether it is blocked', limit: 'Free flowing and clean inside', fail: 'The filter is restricted: replace it.' },
        install: [doStep('Fit the new filter with the flow arrow pointing toward the engine', null), bolts('Tighten the two filter clamps', 'sock-10', 2, [2, 1], [0, 1]), torque('Torque the clamps', 'sock-10', 4)] }
    ],
    statics: R(120, 220, 400, 130, 'box tint-y-soft') + T(470, 340, 'Fuel tank', 'tsm', 'middle'),
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
    spec: [['Cover bolts', '10 mm socket', '8 N m'], ['Crank pulley bolt', '19 mm socket', '180 N m, locked with the tool'], ['Tensioner bolt', '13 mm socket', '25 N m'], ['Idler bolt', '13 mm socket', '25 N m'], ['Timing marks', '', 'Cylinder 1 at top centre, cam and crank locked']],
    prep: [
      { id: 'battery', label: 'Disconnect the battery earth lead', ok: true },
      { id: 'cold', label: 'Make sure the engine is cold', ok: true },
      { id: 'mark', label: 'Check that the right timing tools and the engine data are to hand, and do not turn the engine backwards unless the manual allows it', ok: true },
      { id: 'skip', label: 'Skip locking the timing and just count the belt teeth', ok: false, why: 'Without locking at top centre, the camshaft and crankshaft can move apart. On an interference engine this bends valves and wrecks the engine.' }
    ],
    parts: [
      { id: 'accbelt', name: 'Accessory drive belt', c: [200, 280], needs: [], svg: P('M262 190L150 295A45 45 0 0 0 150 380L262 242', 'k', 'stroke:var(--ink);stroke-width:8;opacity:0.7'),
        remove: [doStep('Release the tensioner with the breaker bar and slip the belt off', 'breaker')],
        install: [doStep('Route the new belt as in the diagram', 'breaker')] },
      { id: 'cover', name: 'Timing cover', c: [380, 200], needs: ['accbelt'], svg: R(250, 90, 260, 250, 'tint-c') + T(380, 340, 'Timing cover', 'tsm', 'middle'),
        remove: [bolts('Remove the six cover bolts', 'sock-10', 6, [3, 2], [0, 5, 1, 4, 2, 3]), doStep('Lift the cover off', null)],
        install: [doStep('Fit the cover', null), bolts('Fit the six cover bolts', 'sock-10', 6, [3, 2], [0, 5, 1, 4, 2, 3]), torque('Torque the cover bolts', 'sock-10', 8)] },
      { id: 'tensioner', name: 'Tensioner', c: [440, 240], needs: ['cover'], svg: C(440, 240, 24, 'box tint-m') + T(440, 245, 'Tension', 'tsm', 'middle'),
        remove: [doStep('Lock the crankshaft and camshaft at top centre with the timing tools', 'lock'), doStep('Slacken the tensioner bolt', 'sock-13')],
        renew: true,
        inspect: { label: 'Spin the tensioner bearing and check the spring', limit: 'Smooth, firm spring', fail: 'The tensioner bearing or spring is weak: replace it with the kit.' },
        install: [doStep('Fit the new tensioner loosely', null), torque('Set the tensioner bolt to its torque', 'sock-13', 25)] },
      { id: 'timingbelt', name: 'Timing belt', c: [380, 220], needs: ['tensioner'], svg: P('M300 270L330 130', 'k', 'stroke:var(--yellow-ink);stroke-width:12;opacity:0.8') + P('M330 130A40 40 0 0 1 430 120L470 250', 'k', 'stroke:var(--yellow-ink);stroke-width:12;opacity:0.8') + P('M470 250L336 300', 'k', 'stroke:var(--yellow-ink);stroke-width:12;opacity:0.8'),
        remove: [doStep('Slide the belt off the sprockets and the idler', null)],
        renew: true,
        inspect: { label: 'Examine the old belt for cracks, fraying and oil', limit: 'No cracks or contamination', fail: 'The belt is damaged: it must be replaced, and the cause of any oil found.' },
        install: [doStep('Fit the new belt with the engine still locked, keeping the drive side tight', null), doStep('Remove the locking tools, turn the engine two full turns by hand and recheck the timing marks', 'lock')] },
      { id: 'idler', name: 'Idler roller', c: [380, 232], needs: ['timingbelt'], svg: C(380, 232, 18, 'box tint-c'),
        remove: [doStep('Remove the idler roller bolt', 'sock-13')],
        renew: true,
        inspect: { label: 'Spin the idler roller and listen for roughness', limit: 'Smooth and quiet', fail: 'The idler is rough: replace it with the kit.' },
        install: [doStep('Fit the new idler', 'sock-13'), torque('Torque the idler bolt', 'sock-13', 25)] }
    ],
    statics: R(120, 60, 130, 300, 'metal') + C(300, 300, 32, 'metal-dark') + C(430, 130, 34, 'metal-dark') + T(185, 215, 'Engine', 'tsm', 'middle'),
    final: ['Rotate the engine by hand two full turns and recheck the timing marks', 'Refit the accessory belt and reconnect the battery', 'Start the engine and listen for noise from the front', 'Reset the service reminder and note the belt change on the job card']
  }
];
