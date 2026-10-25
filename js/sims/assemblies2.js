/* More jobs for the Disassemble and assemble studio. Same data format as assemblies.js. */
import { ASSEMBLIES, WHEELEND, hull, R, C, P, T, bolts, doStep, torque } from './assemblies.js';

var DISC = ASSEMBLIES[0];
function from(id) { var out = null; DISC.parts.forEach(function (p) { if (p.id === id) out = p; }); return out; }
function plain(p) { var q = {}; Object.keys(p).forEach(function (k) { if (k !== 'inspect') q[k] = p[k]; }); return q; }

export var MORE = [

  /* ---------------------------------------------------------------- Water pump and thermostat */
  {
    id: 'waterpump', title: 'Water pump and thermostat', lesson: ['m05-l8', 'Cooling system repair procedures'],
    blurb: 'Drain the coolant, take off the belt and pulley, and replace a water pump and thermostat with new seals and the right torque.',
    scenarios: [
      { say: 'The coolant weeps from the pump and the engine runs hot.', inspect: { pump: { reading: '1.2 mm shaft play and a wet weep hole', pass: false }, thermostat: { reading: 'Opens at 86 degrees', pass: true } } },
      { say: 'The engine takes a long time to warm up.', inspect: { pump: { reading: 'No play, dry', pass: true }, thermostat: { reading: 'Stays open when cold', pass: false } } },
      { say: 'The engine overheats on hills.', inspect: { pump: { reading: 'No play, dry', pass: true }, thermostat: { reading: 'Does not open at 100 degrees', pass: false } } }
    ],
    spec: [['Pump pulley bolts', '10 mm socket', '10 N m'], ['Pump mounting bolts', '13 mm socket', '20 N m'], ['Thermostat housing bolts', '10 mm socket', '10 N m'], ['Thermostat opening temperature', '', '85 to 90 degrees'], ['Pump shaft play limit', '', '0.1 mm']],
    prep: [
      { id: 'cold', label: 'Make sure the engine is fully cold before touching the cooling system', ok: true },
      { id: 'battery', label: 'Disconnect the battery earth lead', ok: true },
      { id: 'drain', label: 'Drain the coolant into a clean container for correct disposal', ok: true },
      { id: 'cap', label: 'Open the radiator cap on the hot engine to see the level', ok: false, why: 'Hot coolant under pressure sprays out and causes severe burns. Always wait until the engine is cold.' }
    ],
    parts: [
      { id: 'belt', name: 'Drive belt', c: [205, 275], needs: [], svg: P(hull([[290, 215, 36], [130, 330, 46]]), 'k', 'stroke:var(--ink);stroke-width:8;opacity:0.7') + T(190, 272, 'Belt', 'tsm', 'middle'),
        remove: [doStep('Release the belt tensioner with the breaker bar and slip the belt off', 'breaker')],
        inspect: { label: 'Check the belt for cracks and fraying', limit: 'No cracks or fraying', fail: 'The belt is cracked: replace it.' },
        install: [doStep('Route the belt as in the belt diagram and release the tensioner slowly', 'breaker')] },
      { id: 'thermocover', name: 'Thermostat housing', c: [490, 118], needs: [], svg: R(440, 98, 100, 40, 'metal-dark') + R(540, 108, 50, 20, 'tint-m') + T(490, 150, 'Thermostat housing', 'tsm', 'middle'),
        remove: [bolts('Remove the two housing bolts', 'sock-10', 2, [2, 1], [0, 1]), doStep('Lift off the housing and the hose', null)],
        install: [doStep('Fit the housing over the new seal and refit the hose', null), bolts('Tighten the two housing bolts evenly', 'sock-10', 2, [2, 1], [0, 1]), torque('Torque the housing bolts', 'sock-10', 10)] },
      { id: 'thermostat', name: 'Thermostat', c: [490, 118], needs: ['thermocover'], svg: C(490, 118, 13, 'box tint-y'),
        remove: [doStep('Lift out the thermostat and its rubber seal', null)],
        renew: true,
        inspect: { label: 'Bench test: heat it in water and see when it opens', limit: '85 to 90 degrees', fail: 'It does not open at the correct temperature: replace the thermostat.' },
        install: [doStep('Fit the new thermostat with its jiggle pin or air bleed at the top', null)] },
      { id: 'pulley', name: 'Pump pulley', c: [290, 215], needs: ['belt'], svg: C(290, 215, 36, 'metal-dark') + T(290, 220, 'Pulley', 'tsm', 'middle'),
        remove: [bolts('Slacken the four pulley bolts in a cross pattern', 'sock-10', 4, 'circle', [0, 2, 1, 3]), doStep('Lift the pulley off the pump flange', null)],
        install: [doStep('Fit the pulley on the pump flange', null), bolts('Run the pulley bolts in and tighten them in a cross pattern', 'sock-10', 4, 'circle', [0, 2, 1, 3]), torque('Torque the pulley bolts', 'sock-10', 10)] },
      { id: 'pump', name: 'Water pump', c: [375, 215], needs: ['pulley', 'thermostat'], svg: R(330, 170, 90, 90, 'metal') + C(375, 215, 22, 'box tint-c') + T(375, 250, 'Pump', 'tsm', 'middle'),
        remove: [bolts('Remove the three pump mounting bolts', 'sock-13', 3, [3, 1], [0, 1, 2]), doStep('Lift the pump off the block and let the last coolant drain out', null)],
        renew: true,
        inspect: { label: 'Check the pump shaft for play and the weep hole for coolant', limit: '0.1 mm play, weep hole dry', fail: 'The pump bearing or seal is worn: replace the pump.' },
        install: [doStep('Fit the pump with its new seal and start the bolts by hand', null), bolts('Tighten the three bolts evenly', 'sock-13', 3, [3, 1], [0, 1, 2]), torque('Torque the pump bolts', 'sock-13', 20)] },
      { id: 'orring', name: 'Pump seal', c: [326, 215], needs: ['pump'], svg: R(322, 170, 8, 90, 'tint-y'),
        remove: [doStep('Clean the old seal and gasket material from the block face with a plastic scraper', null)],
        renew: true,
        install: [doStep('Fit the new seal in its groove or onto the clean face', null)] }
    ],
    statics: R(300, 80, 260, 280, 'metal') + C(130, 330, 46, 'metal-dark') + T(430, 330, 'Engine block', 'tsm', 'middle'),
    final: ['Refill the system with the correct coolant mixture', 'Bleed the air out of the cooling system', 'Run the engine to temperature and check for leaks at the pump and housing', 'Re-check the coolant level when cold']
  },

  /* ---------------------------------------------------------------- Starter motor */
  {
    id: 'starter', title: 'Starter motor removal and refit', lesson: ['m10-l10', 'Starting faults'],
    blurb: 'Take a starter motor off safely, test it on the bench, and refit it with the connections and mounting bolts done correctly.',
    scenarios: [
      { say: 'The engine does not crank and the solenoid clicks.', inspect: { starter: { reading: 'Brushes worn to 5.0 mm, the solenoid contacts are burnt', pass: false } } },
      { say: 'The starter whirrs but does not engage.', inspect: { starter: { reading: 'Pinion teeth chipped, the one-way clutch slips', pass: false } } },
      { say: 'The starter works slowly. The fault was bad cables.', inspect: { starter: { reading: 'Brushes 11 mm, pinion good, solenoid good', pass: true } } }
    ],
    spec: [['Starter mounting bolts', '17 mm socket', '45 N m'], ['Battery cable nut (30)', '13 mm socket', '12 N m'], ['Signal wire nut (50)', '10 mm socket', '5 N m'], ['Underbody shield screws', 'Torx T40', 'Hand tight'], ['Brush minimum length', '', '8 mm']],
    prep: [
      { id: 'battery', label: 'Disconnect the battery earth lead before touching the starter cable', ok: true },
      { id: 'cold', label: 'Let the exhaust cool down', ok: true },
      { id: 'stands', label: 'Raise and support the car on axle stands if working from below', ok: true },
      { id: 'live', label: 'Leave the battery connected so you can test the starter as you go', ok: false, why: 'The starter battery cable is live all the time. A spanner touching metal will short it and can burn you and start a fire. Always disconnect the battery earth first.' }
    ],
    parts: [
      { id: 'shield', name: 'Underbody shield', c: [350, 280], needs: [], svg: R(250, 262, 200, 26, 'tint-c') + T(350, 280, 'Shield', 'tsm', 'middle'),
        remove: [bolts('Remove the three shield screws', 'torx-t40', 3, [3, 1], [0, 1, 2])],
        install: [bolts('Fit the shield and the three screws', 'torx-t40', 3, [3, 1], [0, 1, 2])] },
      { id: 'wires', name: 'Cable and signal wire', c: [380, 125], needs: ['shield'], svg: R(354, 112, 52, 22, 'tint-m') + P('M406 123H460', 'wire-pos') + T(380, 105, 'Wires', 'tsm', 'middle'),
        remove: [doStep('Insulate and remove the thick battery cable nut', 'sock-13'), doStep('Remove the small signal wire nut', 'sock-10')],
        install: [doStep('Fit the thick battery cable on its stud and tighten the nut', 'sock-13'), torque('Torque the battery cable nut', 'sock-13', 12), doStep('Fit the small signal wire and tighten the nut', 'sock-10')] },
      { id: 'mountbolts', name: 'Mounting bolts', c: [250, 228], needs: ['wires'], svg: R(236, 160, 24, 18, 'metal-dark') + R(236, 252, 24, 18, 'metal-dark'),
        remove: [bolts('Remove the two mounting bolts, supporting the starter as the last one comes out', 'sock-17', 2, [1, 2], [0, 1])],
        install: [bolts('Fit the two mounting bolts and run them in finger tight', 'sock-17', 2, [1, 2], [0, 1]), torque('Torque the mounting bolts', 'sock-17', 45)] },
      { id: 'starter', name: 'Starter motor', c: [345, 190], needs: ['mountbolts'], svg: R(260, 150, 180, 72, 'metal') + R(330, 100, 80, 48, 'metal-dark') + R(240, 175, 22, 22, 'tint-y') + T(350, 190, 'Starter', 'tsm', 'middle'),
        remove: [doStep('Slide the starter out of the bell housing and lower it carefully. It is heavy.', null)],
        inspect: { label: 'Bench check: brush length, pinion teeth and solenoid contacts', limit: 'Brushes 8 mm minimum, pinion teeth sound, contacts clean', fail: 'The starter fails the bench check: replace it or have it reconditioned.' },
        install: [doStep('Offer the starter into the bell housing, with the pinion aligned to the flywheel teeth', null)] }
    ],
    statics: R(40, 100, 160, 220, 'metal') + R(200, 100, 40, 220, 'metal-dark') + T(120, 215, 'Engine', 'tsm', 'middle'),
    final: ['Reconnect the battery earth lead', 'Check that the engine cranks smoothly with the key', 'Check that the starter disengages when the engine starts', 'Check the cable connections are tight and covered']
  },

  /* ---------------------------------------------------------------- Wheel bearing and hub */
  {
    id: 'wheelbearing', title: 'Front wheel bearing (hub unit)', lesson: ['m19-l11', 'Hubs and wheel bearings'],
    blurb: 'Strip the brake and hub to get at a worn bearing, replace the hub unit and tighten the axle nut correctly.',
    scenarios: [
      { say: 'A hum that changes with speed and a rough bearing when spun.', inspect: { hubunit: { reading: '0.25 mm side play and rough when spun', pass: false } } },
      { say: 'The ABS light is on with a wheel speed fault.', inspect: { hubunit: { reading: '0.30 mm play and a damaged ABS encoder ring', pass: false } } },
      { say: 'A noise that turned out to be the tyre.', inspect: { hubunit: { reading: '0.02 mm play and smooth', pass: true } } }
    ],
    spec: [['Wheel nuts', '19 mm socket', '110 N m, star pattern'], ['Caliper guide pin bolts', 'Torx T40', '30 N m'], ['Caliper carrier bolts', '17 mm socket', '95 N m'], ['Axle nut', '32 mm socket', '250 N m, new nut'], ['ABS sensor screw', '10 mm socket', '8 N m'], ['Hub unit bolts', 'Torx T55', '70 N m'], ['Hub play limit', '', '0.05 mm']],
    prep: [
      { id: 'chock', label: 'Chock the rear wheels and apply the parking brake', ok: true },
      { id: 'loosen', label: 'Slacken the axle nut and wheel nuts a little with the weight of the car on the wheels', ok: true },
      { id: 'stands', label: 'Raise the car and support it on axle stands at the jacking points', ok: true },
      { id: 'jack', label: 'Work under the car supported only by the jack', ok: false, why: 'A jack can slip or fail. Never put any part of your body under a car held only by a jack. Use axle stands.' }
    ],
    parts: [
      plain(from('wheel')), plain(from('caliper')),
      from('pads') && Object.assign(plain(from('pads')), { }),
      plain(from('carrier')),
      { id: 'hubnut', name: 'Axle nut', c: [362, 200], needs: ['wheel'], svg: R(350, 186, 24, 28, 'metal-dark') + T(362, 232, 'Axle nut', 'tsm', 'middle'),
        remove: [doStep('Remove the dust cap and the locking device, then the axle nut', 'sock-32')],
        renew: true,
        install: [doStep('Fit a new axle nut', 'sock-32'), torque('Torque the axle nut to its specification', 'sock-32', 250)] },
      { id: 'disc', name: 'Brake disc', c: [395, 200], needs: ['carrier', 'hubnut'], svg: WHEELEND.disc,
        remove: [doStep('Pull the disc off the hub', null)],
        install: [doStep('Clean the hub face, then slide the disc on', null)] },
      { id: 'abssensor', name: 'ABS sensor', c: [460, 261], needs: ['carrier'], svg: R(446, 254, 26, 14, 'tint-m') + P('M472 261H524', 'wire-sig'),
        remove: [doStep('Remove the sensor screw and pull the sensor from its bore', 'sock-10')],
        install: [doStep('Clean the bore and fit the sensor, then tighten the screw', 'sock-10'), torque('Torque the sensor screw', 'sock-10', 8)] },
      { id: 'hubunit', name: 'Hub unit and bearing', c: [461, 200], needs: ['disc', 'abssensor'], svg: R(440, 146, 42, 108, 'tint-c') + C(461, 200, 16, 'box') + T(461, 282, 'Hub unit', 'tsm', 'middle'),
        remove: [bolts('Remove the four hub unit bolts from behind the knuckle', 'torx-t55', 4, 'circle', [0, 2, 1, 3]), doStep('Free the hub unit from the knuckle with a puller and soft mallet', 'puller')],
        renew: true,
        inspect: { label: 'Check the hub for side play with a dial gauge and spin it by hand', limit: '0.05 mm play, smooth, ABS ring undamaged', fail: 'The bearing is worn or the ABS ring is damaged: replace the hub unit.' },
        install: [doStep('Clean the knuckle bore, then fit the new hub unit square into it', null), bolts('Fit the four hub unit bolts and tighten them in a cross pattern', 'torx-t55', 4, 'circle', [0, 2, 1, 3]), torque('Torque the hub unit bolts', 'torx-t55', 70)] }
    ].filter(Boolean),
    statics: WHEELEND.knuckle,
    final: ['Check that the wheel turns freely with no noise', 'Check the ABS sensor air gap and the wheel speed signal on a scan tool', 'Re-torque the wheel nuts after a short test drive', 'Pump the brake pedal until firm before moving the car']
  },

  /* ---------------------------------------------------------------- CV driveshaft */
  {
    id: 'cvshaft', title: 'Driveshaft and CV joint', lesson: ['m16-l7', 'Shafts and joints'],
    blurb: 'Take a driveshaft out of the car, replace a torn CV boot or worn joint, and refit the shaft with a new axle nut.',
    scenarios: [
      { say: 'The outer joint clicks on full lock and the boot is torn.', inspect: { outerjoint: { reading: 'Worn balls, grit in the grease', pass: false }, boot: { reading: 'Split in two places', pass: false } } },
      { say: 'The boot is split but the joint is still smooth.', inspect: { outerjoint: { reading: 'Smooth with clean grease', pass: true }, boot: { reading: 'Small split near the clip', pass: false } } },
      { say: 'The car clunks. The shaft joints were fine.', inspect: { outerjoint: { reading: 'Smooth with clean grease', pass: true }, boot: { reading: 'Good', pass: true } } }
    ],
    spec: [['Wheel nuts', '19 mm socket', '110 N m, star pattern'], ['Axle nut', '32 mm socket', '250 N m, new nut'], ['Ball joint pinch bolt', '17 mm socket', '60 N m'], ['Inner joint', 'Pry bar', 'Seat the circlip'], ['Boot clamps', 'Pliers', 'Always new clamps']],
    prep: [
      { id: 'chock', label: 'Chock the rear wheels and apply the parking brake', ok: true },
      { id: 'loosen', label: 'Slacken the axle nut and wheel nuts a little with the car on its wheels', ok: true },
      { id: 'stands', label: 'Raise and support the car on axle stands', ok: true },
      { id: 'hammer', label: 'Hit the shaft end with a steel hammer to free it', ok: false, why: 'A steel hammer damages the threads and the bearing. Use a soft mallet and the correct puller.' }
    ],
    parts: [
      { id: 'wheel', name: 'Wheel', c: [88, 200], needs: [], svg: R(40, 56, 64, 288, 'box tint-c', 8) + T(72, 205, 'Wheel', 'tsm', 'middle'),
        remove: [bolts('Remove the five wheel nuts in a star pattern', 'sock-19', 5, 'circle', [0, 2, 4, 1, 3]), doStep('Lift the wheel off', null)],
        install: [doStep('Fit the wheel on the studs', null), bolts('Tighten the wheel nuts in a star pattern', 'sock-19', 5, 'circle', [0, 2, 4, 1, 3]), torque('Final torque with the torque wrench', 'sock-19', 110)] },
      { id: 'hubnut', name: 'Axle nut', c: [112, 200], needs: ['wheel'], svg: R(104, 188, 18, 24, 'metal-dark'),
        remove: [doStep('Remove the split pin or lock and the axle nut', 'sock-32')],
        renew: true,
        install: [doStep('Fit a new axle nut', 'sock-32'), torque('Torque the axle nut', 'sock-32', 250)] },
      { id: 'balljoint', name: 'Lower ball joint', c: [140, 280], needs: ['hubnut'], svg: R(128, 244, 24, 70, 'metal-dark') + R(120, 306, 40, 12, 'metal'),
        remove: [doStep('Remove the ball joint pinch bolt', 'sock-17'), doStep('Lever the arm down off the knuckle so the shaft can come out', 'pry')],
        install: [doStep('Fit the ball joint into the knuckle', null), doStep('Fit the pinch bolt', 'sock-17'), torque('Torque the pinch bolt', 'sock-17', 60)] },
      { id: 'innerjoint', name: 'Inner joint', c: [470, 200], needs: ['balljoint'], svg: R(440, 168, 64, 64, 'metal') + T(472, 205, 'Inner joint', 'tsm', 'middle'),
        remove: [doStep('Pry the inner joint out of the gearbox with the pry bar, with a drip tray ready for oil', 'pry')],
        renew: true,
        install: [doStep('Push the inner joint into the gearbox until the circlip clicks into place', null)] },
      { id: 'shaft', name: 'Driveshaft', c: [300, 200], needs: ['innerjoint'], svg: R(150, 190, 290, 20, 'metal') + T(300, 183, 'Shaft', 'tsm', 'middle'),
        remove: [doStep('Pull the shaft out through the knuckle and take it to the bench', null)],
        install: [doStep('Slide the shaft through the knuckle and splines', null)] },
      { id: 'boot', name: 'Outer CV boot', c: [200, 200], needs: ['shaft'], svg: R(150, 170, 80, 60, 'rubber') + T(190, 205, 'Boot', 'tsm', 'middle'),
        remove: [doStep('Cut the old clamps with the spring pliers and slide the boot back', 'pliers')],
        renew: true,
        inspect: { label: 'Look at the boot for splits and check the grease for grit', limit: 'Intact and clean', fail: 'The boot is split. Dirt will have got in, so replace the boot and the clamps.' },
        install: [doStep('Pack the joint with the correct grease, fit the new boot and fit new clamps', 'pliers')] },
      { id: 'outerjoint', name: 'Outer CV joint', c: [120, 200], needs: ['boot'], svg: R(104, 170, 54, 60, 'metal') + C(130, 200, 14, 'box tint-c'),
        remove: [doStep('Tap the joint off the shaft with the soft mallet', 'mallet')],
        renew: true,
        inspect: { label: 'Check the joint for play and grit, and turn it through its angle', limit: 'Smooth, no play, no grit', fail: 'The joint is worn: replace it. It clicks on full lock when worn.' },
        install: [doStep('Tap the joint onto the shaft and fit a new circlip', 'mallet')] }
    ],
    statics: R(480, 170, 120, 60, 'metal', 4),
    final: ['Check the gearbox oil level and top up if needed', 'Check that the boot and clamps are secure and not rubbing', 'Re-torque the wheel nuts after a short test drive', 'Test on full lock in both directions for clicking']
  },

  /* ---------------------------------------------------------------- Drum brake */
  {
    id: 'drumbrake', title: 'Rear drum brake', lesson: ['m19-l6', 'Brake service in depth'],
    blurb: 'Take off the drum and shoes, check the linings, drum and wheel cylinder, and rebuild the brake with the springs fitted correctly.',
    scenarios: [
      { say: 'The rear brakes grind. The shoes are worn and the cylinder leaks.', inspect: { shoes: { reading: '1.0 mm lining', pass: false }, drum: { reading: '230.8 mm', pass: true }, wheelcyl: { reading: 'Wet with fluid', pass: false } } },
      { say: 'The handbrake is weak. The drum is worn oversize.', inspect: { shoes: { reading: '2.0 mm lining', pass: false }, drum: { reading: '231.6 mm (limit 231.0)', pass: false }, wheelcyl: { reading: 'Dry', pass: true } } },
      { say: 'A squeal on light braking. The parts are within limits.', inspect: { shoes: { reading: '4.0 mm lining', pass: true }, drum: { reading: '230.4 mm', pass: true }, wheelcyl: { reading: 'Dry', pass: true } } }
    ],
    spec: [['Wheel nuts', '19 mm socket', '110 N m, star pattern'], ['Wheel cylinder bolts', '10 mm socket', '10 N m'], ['Brake pipe union', 'Flare-nut spanner', '15 N m'], ['Shoe lining minimum', '', '1.5 mm'], ['Drum maximum diameter', '', '231.0 mm (stamped)']],
    prep: [
      { id: 'chock', label: 'Chock the front wheels and release the handbrake', ok: true },
      { id: 'stands', label: 'Raise the rear and support it on axle stands', ok: true },
      { id: 'damp', label: 'Clean the dust off with a wet cloth or an approved vacuum', ok: true },
      { id: 'air', label: 'Blow the brake dust off with compressed air', ok: false, why: 'Brake dust is harmful to breathe. Never use compressed air. Use a wet method or an approved vacuum.' }
    ],
    parts: [
      { id: 'wheel', name: 'Wheel', c: [88, 200], needs: [], svg: R(40, 56, 70, 288, 'box tint-c', 8) + T(75, 205, 'Wheel', 'tsm', 'middle'),
        remove: [bolts('Remove the wheel nuts in a star pattern', 'sock-19', 5, 'circle', [0, 2, 4, 1, 3]), doStep('Lift the wheel off', null)],
        install: [doStep('Fit the wheel on the studs', null), bolts('Tighten the wheel nuts in a star pattern', 'sock-19', 5, 'circle', [0, 2, 4, 1, 3]), torque('Final torque with the torque wrench', 'sock-19', 110)] },
      { id: 'drum', name: 'Brake drum', c: [255, 200], needs: ['wheel'], svg: C(255, 200, 142, 'box') + C(255, 200, 142, 'metal') + C(255, 200, 70, 'k2') + C(255, 200, 16, 'metal-dark') + T(255, 290, 'Brake drum', 'tsm', 'middle'),
        remove: [doStep('Back off the adjuster, then pull the drum off the hub', null)],
        inspect: { label: 'Measure the drum inner diameter with a vernier', limit: '231.0 mm maximum', fail: 'The drum is worn beyond its maximum: replace the drums as a pair.' },
        install: [doStep('Fit the drum over the shoes and shut the adjuster', null)] },
      { id: 'springs', name: 'Shoe springs', c: [260, 230], needs: ['drum'], svg: P('M170 230H350', 'k2') + P('M200 120L260 170', 'k2') + P('M320 120L260 170', 'k2') + R(250, 160, 20, 16, 'metal-dark'),
        remove: [doStep('Release the hold-down pins and unhook the return springs', 'pliers')],
        renew: true,
        install: [doStep('Fit the new springs and hold-down pins as in the diagram', 'pliers')] },
      { id: 'shoes', name: 'Brake shoes', c: [260, 200], needs: ['springs'], svg: P('M165 270A100 100 0 0 1 180 130', 'k', 'stroke:var(--yellow-ink);stroke-width:14;opacity:0.7') + P('M355 270A100 100 0 0 0 340 130', 'k', 'stroke:var(--yellow-ink);stroke-width:14;opacity:0.7'),
        remove: [doStep('Lift the shoes off the backing plate and slide off the adjuster', null)],
        inspect: { label: 'Measure the lining thickness and check for oil or glazing', limit: '1.5 mm minimum', fail: 'The linings are worn or contaminated: replace the shoes in axle sets.' },
        install: [doStep('Smear brake grease on the contact points of the backing plate and fit the shoes with the adjuster', 'grease')] },
      { id: 'wheelcyl', name: 'Wheel cylinder', c: [260, 130], needs: ['shoes'], svg: R(232, 112, 56, 28, 'metal-dark') + T(260, 105, 'Wheel cylinder', 'tsm', 'middle'),
        remove: [doStep('Undo the brake pipe union with the flare-nut spanner and plug the pipe', 'flare'), bolts('Remove the two cylinder bolts', 'sock-10', 2, [2, 1], [0, 1])],
        inspect: { label: 'Peel back the cylinder boots and look for fluid', limit: 'Dry', fail: 'The cylinder is leaking: replace it. Leaking fluid ruins the linings.' },
        install: [bolts('Fit the two cylinder bolts', 'sock-10', 2, [2, 1], [0, 1]), torque('Torque the cylinder bolts', 'sock-10', 10), doStep('Connect the pipe union with the flare-nut spanner', 'flare')] }
    ],
    statics: C(255, 200, 152, 'box') + C(255, 200, 152, 'metal-dark') + C(255, 200, 18, 'metal') + T(255, 372, 'Backing plate', 'tsm', 'middle'),
    final: ['Bleed the brake system if the pipe was opened', 'Adjust the shoes and test the handbrake', 'Pump the brake pedal until firm before moving the car', 'Re-torque the wheel nuts after a short test drive']
  }
];
