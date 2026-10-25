/*
 * Data for the Disassemble and Assemble studio. Each assembly lists the parts in assembled
 * position (SVG), what must come off first, the steps to remove and refit each part, and what to
 * inspect. All sizes and torques are typical figures for practice: always use the manufacturer's
 * workshop manual for a real job.
 */

export function R(x, y, w, h, c, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" class="' + c + '"/>'; }
export function C(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" class="' + c + '"/>'; }
export function P(d, c, st) { return '<path d="' + d + '" class="' + (c || 'k') + '"' + (st ? ' style="' + st + '"' : '') + '/>'; }
export function T(x, y, s, cls, a) { return '<text x="' + x + '" y="' + y + '" class="' + (cls || 'tsm') + '"' + (a ? ' text-anchor="' + a + '"' : '') + '>' + s + '</text>'; }

/* Shared side view of a front wheel end: wheel, caliper and pads at the top, carrier at the bottom, disc on the hub. */
export var WHEELEND = {
  wheel: R(240, 56, 50, 288, 'box tint-c', 8) + R(230, 118, 10, 24, 'metal-dark') + R(230, 258, 10, 24, 'metal-dark') + T(265, 205, 'Wheel', 'tsm', 'middle'),
  caliper: R(306, 62, 14, 92, 'metal-dark') + R(306, 54, 152, 14, 'metal-dark') + R(400, 54, 58, 100, 'metal-dark') + R(396, 86, 12, 44, 'tint-m') + T(430, 112, 'Caliper', 'tsm', 'middle'),
  pads: R(322, 80, 8, 64, 'metal-dark') + R(330, 80, 20, 64, 'tint-y') + R(376, 80, 20, 64, 'tint-y') + R(396, 80, 8, 64, 'metal-dark') +
    R(322, 258, 8, 64, 'metal-dark') + R(330, 258, 20, 64, 'tint-y') + R(376, 258, 20, 64, 'tint-y') + R(396, 258, 8, 64, 'metal-dark'),
  carrier: R(312, 328, 168, 12, 'metal-dark') + R(312, 262, 8, 70, 'metal-dark') + R(404, 262, 8, 70, 'metal-dark') + R(466, 324, 22, 20, 'metal-dark') + T(396, 358, 'Carrier', 'tsm', 'middle'),
  disc: R(350, 70, 26, 84, 'metal') + R(350, 246, 26, 84, 'metal') + R(376, 150, 64, 100, 'metal') + P('M356 74V150M366 74V150M356 250V326M366 250V326', 'k2') + T(408, 205, 'Disc', 'tsm', 'middle'),
  discscrew: R(368, 176, 8, 16, 'metal-dark'),
  knuckle: R(480, 36, 110, 328, 'metal', 6) + T(535, 205, 'Knuckle', 'tsm', 'middle'),
  flange: R(440, 150, 40, 100, 'metal-dark')
};

/* Path of a belt wrapped round circles [x, y, r], listed clockwise on the screen, using outer tangent lines. */
export function hull(cs) {
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

export var TOOLS = [
  ['sock-10', '10 mm socket'], ['sock-12', '12 mm socket'], ['sock-13', '13 mm socket'], ['sock-17', '17 mm socket'], ['sock-19', '19 mm socket'],
  ['torx-t40', 'Torx T40 bit'], ['torx-t55', 'Torx T55 bit'], ['allen-6', '6 mm Allen key'], ['screw', 'Screwdriver or impact driver'],
  ['breaker', 'Breaker bar'], ['hook', 'Caliper hook'], ['piston', 'Brake piston tool'], ['puller', 'Bearing puller'],
  ['align', 'Clutch alignment tool'], ['lock', 'Flywheel locking tool'], ['gauge', 'Gauges and straight edge'], ['grease', 'Brake grease'],
  ['sock-32', '32 mm socket'], ['sock-22', '22 mm socket'], ['lockring', 'Lock-ring spanner'], ['pliers', 'Spring pliers'], ['flare', 'Flare-nut spanner'], ['pry', 'Pry bar'], ['mallet', 'Soft mallet']
];

/* Bolt step helpers. Layouts: 'circle' (n bolts round a ring), or [cols, rows] grid. */
export function bolts(label, tool, n, layout, order) { return { t: 'bolts', label: label, tool: tool, n: n, layout: layout, order: order }; }
export function doStep(label, tool) { return { t: 'do', label: label, tool: tool || null }; }
export function torque(label, tool, value, unit) { return { t: 'torque', label: label, tool: tool, value: value, unit: unit || 'N m' }; }

export var ASSEMBLIES = [

  /* ---------------------------------------------------------------- 1 Disc brake */
  {
    id: 'discbrake', title: 'Front disc brake: pads and disc', lesson: ['m19-l5', 'Brake service'],
    blurb: 'Take a front disc brake apart, inspect the pads and disc, then rebuild it in the right order with the right tools and torques.',
    scenarios: [
      { say: 'The pads are worn and the disc is below its minimum thickness.', inspect: { pads: { reading: '1.5 mm', pass: false }, disc: { reading: '20.9 mm', pass: false } } },
      { say: 'The pads are worn but the disc is within limits.', inspect: { pads: { reading: '2.0 mm', pass: false }, disc: { reading: '23.4 mm', pass: true } } },
      { say: 'The customer reports a pulling noise. The parts may be fine.', inspect: { pads: { reading: '7.0 mm', pass: true }, disc: { reading: '24.0 mm', pass: true } } }
    ],
    spec: [['Wheel nuts', '19 mm socket', '110 N m, star pattern'], ['Caliper guide pin bolts', 'Torx T40', '30 N m'], ['Caliper carrier bolts', '17 mm socket', '95 N m'], ['Disc retaining screw', 'Screwdriver', 'Hand tight'], ['Pad minimum thickness', '', '3 mm'], ['Disc minimum thickness', '', '22.0 mm (stamped)']],
    prep: [
      { id: 'chock', label: 'Chock the rear wheels and apply the parking brake', ok: true },
      { id: 'loosen', label: 'Loosen the wheel nuts a little while the wheel is on the ground', ok: true },
      { id: 'stands', label: 'Raise the car and support it on axle stands at the jacking points', ok: true },
      { id: 'dust', label: 'Blow the brake dust off with compressed air', ok: false, why: 'Brake dust is harmful to breathe. Use a wet method or an approved vacuum, never compressed air.' }
    ],
    parts: [
      { id: 'wheel', name: 'Wheel', c: [265, 200], needs: [], svg: WHEELEND.wheel,
        remove: [bolts('Slacken and remove the five wheel nuts in a star pattern', 'sock-19', 5, 'circle', [0, 2, 4, 1, 3]), doStep('Lift the wheel off and lay it flat', null)],
        install: [doStep('Fit the wheel on the studs', null), bolts('Run the wheel nuts on and tighten them in a star pattern', 'sock-19', 5, 'circle', [0, 2, 4, 1, 3]), torque('Final torque with the torque wrench', 'sock-19', 110)] },
      { id: 'caliper', name: 'Brake caliper', c: [380, 110], needs: ['wheel'], svg: WHEELEND.caliper,
        remove: [doStep('Remove the two guide pin bolts', 'torx-t40'), doStep('Lift the caliper off the disc and hang it on the hook. Never let it hang by the brake hose.', 'hook')],
        install: [doStep('Push the piston fully back with the piston tool', 'piston'), doStep('Clean and lightly grease the guide pins', 'grease'), doStep('Fit the caliper over the pads and start the guide pin bolts', null), torque('Tighten the guide pin bolts to the specified torque', 'torx-t40', 30)] },
      { id: 'pads', name: 'Brake pads', c: [363, 200], needs: ['caliper'], svg: WHEELEND.pads,
        remove: [doStep('Slide the pads and clips out of the carrier', null)],
        inspect: { label: 'Measure the friction material thickness', limit: '3 mm minimum', fail: 'Worn below the 3 mm minimum: replace the pads as a set on this axle.' },
        install: [doStep('Fit the new clips and shims, then slide the pads in with the friction faces toward the disc', null)] },
      { id: 'carrier', name: 'Caliper carrier', c: [396, 334], needs: ['pads'], svg: WHEELEND.carrier,
        remove: [bolts('Remove the two carrier bolts', 'sock-17', 2, [2, 1], [0, 1])],
        install: [doStep('Offer the carrier up to the knuckle and start the bolts by hand', null), bolts('Tighten the two carrier bolts', 'sock-17', 2, [2, 1], [0, 1]), torque('Final torque with the torque wrench', 'sock-17', 95)] },
      { id: 'discscrew', name: 'Disc retaining screw', c: [372, 184], needs: ['wheel'], svg: WHEELEND.discscrew,
        remove: [doStep('Remove the small disc retaining screw', 'screw')],
        install: [doStep('Fit the retaining screw and tighten it by hand', 'screw')] },
      { id: 'disc', name: 'Brake disc', c: [395, 200], needs: ['carrier', 'discscrew'], svg: WHEELEND.disc,
        remove: [doStep('Pull the disc off the hub', null)],
        inspect: { label: 'Measure the disc thickness with a micrometer', limit: '22.0 mm minimum', fail: 'Below the minimum thickness stamped on the disc: replace the discs as a pair on this axle.' },
        install: [doStep('Clean the hub face, then slide the disc on', null)] }
    ],
    statics: WHEELEND.knuckle + WHEELEND.flange,
    final: ['Pump the brake pedal until it is firm before moving the car', 'Check the fluid level in the reservoir', 'Check that the wheel turns freely with no drag', 'Re-torque the wheel nuts after a short test drive']
  },

  /* ---------------------------------------------------------------- 2 Cylinder head */
  {
    id: 'cylhead', title: 'Cylinder head and gasket', lesson: ['m04-l7', 'Cylinder head and valve service'],
    blurb: 'Remove a cylinder head without damaging it, check it for flatness, and refit it with a new gasket and the correct bolt sequence.',
    scenarios: [
      { say: 'The engine has overheated and the head gasket has blown.', inspect: { head: { reading: '0.12 mm', pass: false } } },
      { say: 'The gasket leaked slightly. The head looks fine.', inspect: { head: { reading: '0.02 mm', pass: true } } }
    ],
    spec: [['Valve cover bolts', '10 mm socket', '8 N m'], ['Camshaft bearing cap bolts', '10 mm socket', '12 N m'], ['Cylinder head bolts', 'Torx T55', '30 N m, then 60 N m, then +90 and +90 degrees'], ['Timing belt tensioner', '13 mm socket', '25 N m'], ['Head flatness limit', '', '0.05 mm over the length']],
    prep: [
      { id: 'cold', label: 'Make sure the engine is fully cold', ok: true },
      { id: 'battery', label: 'Disconnect the battery earth lead', ok: true },
      { id: 'coolant', label: 'Drain the coolant into a clean container for correct disposal', ok: true },
      { id: 'warm', label: 'Remove the head while the engine is warm so the bolts come out easily', ok: false, why: 'A warm aluminium head can warp when bolts are loosened. Always work on a cold engine.' }
    ],
    parts: [
      { id: 'valvecover', name: 'Valve cover', c: [320, 125], needs: [], svg: R(170, 100, 300, 50, 'metal') + R(176, 94, 8, 10, 'metal-dark') + R(456, 94, 8, 10, 'metal-dark') + T(320, 130, 'Valve cover', 'tsm', 'middle'),
        remove: [bolts('Loosen the valve cover bolts from the outside inward', 'sock-10', 8, [4, 2], [0, 4, 3, 7, 1, 5, 2, 6]), doStep('Lift off the cover and the gasket', null)],
        renew: true,
        install: [doStep('Clean the faces and fit the new gasket', null), bolts('Tighten the cover bolts from the centre outward', 'sock-10', 8, [4, 2], [1, 5, 2, 6, 0, 4, 3, 7]), torque('Torque the cover bolts', 'sock-10', 8)] },
      { id: 'timingbelt', name: 'Timing belt', c: [115, 247], needs: [], svg: P(hull([[130, 172, 28], [130, 322, 20]]), 'k', 'stroke:var(--yellow-ink);stroke-width:9;opacity:0.85') + T(84, 250, 'Belt', 'tsm', 'middle'),
        remove: [doStep('Turn the engine to top centre on cylinder 1 and lock the crankshaft and camshaft with the timing tools', 'lock'), doStep('Release the belt tensioner and slide the belt off', 'sock-13')],
        renew: true,
        install: [doStep('Fit the new belt, keeping it tight on the drive side, with the engine still locked at top centre', null), torque('Set the tensioner to its torque', 'sock-13', 25), doStep('Remove the locking tools, turn the engine two full turns by hand and recheck the timing marks', null)] },
      { id: 'camshaft', name: 'Camshaft and caps', c: [300, 178], needs: ['valvecover', 'timingbelt'], svg: R(150, 170, 300, 20, 'tint-c') + R(210, 156, 28, 44, 'metal-dark') + R(300, 156, 28, 44, 'metal-dark') + R(390, 156, 28, 44, 'metal-dark') + T(320, 150, 'Camshaft', 'tsm', 'middle'),
        remove: [bolts('Loosen the bearing cap bolts gradually, outside caps first, alternating', 'sock-10', 8, [4, 2], [0, 4, 3, 7, 1, 5, 2, 6]), doStep('Lift out the camshaft and keep the caps in order', null)],
        install: [doStep('Oil the journals, lay the camshaft in with the lobes of cylinder 1 correct and fit the caps in their original places', null), bolts('Tighten the cap bolts gradually from the centre outward', 'sock-10', 8, [4, 2], [1, 5, 2, 6, 0, 4, 3, 7]), torque('Torque the cap bolts', 'sock-10', 12)] },
      { id: 'headbolts', name: 'Cylinder head bolts', c: [320, 240], needs: ['camshaft'], svg: R(190, 200, 8, 78, 'metal-dark') + R(255, 200, 8, 78, 'metal-dark') + R(320, 200, 8, 78, 'metal-dark') + R(385, 200, 8, 78, 'metal-dark') + R(450, 200, 8, 78, 'metal-dark'),
        remove: [bolts('Loosen all the head bolts in the reverse of the tightening sequence', 'torx-t55', 10, [5, 2], [5, 0, 9, 4, 6, 1, 8, 3, 7, 2])],
        renew: true,
        install: [bolts('Run the new head bolts in and tighten them in the tightening sequence, from the centre outward', 'torx-t55', 10, [5, 2], [2, 7, 3, 8, 1, 6, 4, 9, 0, 5]), torque('Stage 1: all bolts in sequence', 'torx-t55', 30), torque('Stage 2: all bolts in sequence', 'torx-t55', 60), torque('Stage 3: turn each bolt a further angle', 'torx-t55', 90, 'degrees'), torque('Stage 4: turn each bolt a further angle', 'torx-t55', 90, 'degrees')] },
      { id: 'head', name: 'Cylinder head', c: [320, 241], needs: ['headbolts'], svg: R(150, 200, 340, 82, 'metal') + T(320, 270, 'Cylinder head', 'tsm', 'middle'),
        remove: [doStep('Lift the head straight up with an assistant. Do not lever against the gasket faces.', null)],
        inspect: { label: 'Check the head face for flatness with a straight edge and feeler gauges', limit: '0.05 mm maximum', fail: 'The head is warped beyond 0.05 mm: send it to a machine shop to be resurfaced, or replace it.' },
        install: [doStep('Fit the dowels, then lower the head straight down onto the gasket with an assistant', null)] },
      { id: 'headgasket', name: 'Head gasket', c: [320, 287], needs: ['head'], svg: R(150, 282, 340, 10, 'tint-y'),
        remove: [doStep('Lift off the old gasket and clean both faces with a plastic scraper, taking care not to scratch them', null)],
        renew: true,
        install: [doStep('Lay the new gasket on the block with its TOP mark upward and over the dowels', null)] }
    ],
    statics: R(150, 292, 340, 88, 'metal') + T(320, 340, 'Engine block', 'tsm', 'middle') + C(130, 172, 28, 'metal-dark') + C(130, 172, 8, 'box') + C(130, 322, 20, 'metal-dark') + C(130, 322, 6, 'box'),
    final: ['Refill the cooling system and bleed the air out', 'Reconnect the battery and check there are no oil or coolant leaks', 'Run the engine to temperature and check again', 'Re-check the oil and coolant levels after the first drive']
  },

  /* ---------------------------------------------------------------- 3 Clutch */
  {
    id: 'clutch', title: 'Clutch, flywheel and rear seal', lesson: ['m16-l10', 'Service and repair'],
    blurb: 'With the gearbox out, strip the clutch and flywheel, inspect each part, then fit them with the disc centred and the bolts tightened evenly.',
    scenarios: [
      { say: 'The clutch is slipping. The lining is worn and the flywheel is heat-spotted.', inspect: { disc: { reading: '0.3 mm above the rivets', pass: false }, flywheel: { reading: '0.18 mm runout', pass: false }, seal: { reading: 'Dry', pass: true } } },
      { say: 'The clutch is worn and oil has leaked onto it.', inspect: { disc: { reading: '0.3 mm above the rivets', pass: false }, flywheel: { reading: '0.04 mm runout', pass: true }, seal: { reading: 'Wet with oil', pass: false } } }
    ],
    spec: [['Pressure plate bolts', '10 mm socket', '25 N m, evenly in a star pattern'], ['Flywheel bolts', '17 mm socket', '95 N m'], ['Flywheel runout limit', '', '0.10 mm'], ['Lining minimum', '', '0.5 mm above the rivets']],
    prep: [
      { id: 'battery', label: 'Disconnect the battery earth lead', ok: true },
      { id: 'gearbox', label: 'Confirm the gearbox is removed and supported safely', ok: true },
      { id: 'mask', label: 'Wipe the parts with a damp cloth, not a dry brush, and do not blow dust off', ok: true },
      { id: 'air', label: 'Blow the clutch dust off with compressed air', ok: false, why: 'Old clutch dust can contain harmful fibres. Never blow it with air. Use a damp cloth or an approved vacuum.' }
    ],
    parts: [
      { id: 'cover', name: 'Pressure plate', c: [345, 200], needs: [], svg: R(310, 84, 70, 232, 'metal') + P('M316 112L366 200L316 288', 'k2') + R(300, 92, 12, 10, 'metal-dark') + R(300, 298, 12, 10, 'metal-dark') + T(345, 338, 'Pressure plate', 'tsm', 'middle'),
        remove: [bolts('Slacken the six pressure plate bolts gradually in a star pattern', 'sock-10', 6, 'circle', [0, 3, 1, 4, 2, 5]), doStep('Lift the pressure plate off the dowels', null)],
        inspect: { label: 'Check the pressure plate for cracks, burn marks and diaphragm finger wear', limit: 'Even surface, no cracks or blue marks', fail: 'The pressure plate is worn or heat-marked: replace it as part of the clutch kit.' },
        install: [doStep('Offer the pressure plate on to the dowels, with the disc centred by the alignment tool', 'align'), bolts('Run the bolts in and tighten them gradually in a star pattern', 'sock-10', 6, 'circle', [0, 3, 1, 4, 2, 5]), torque('Final torque with the torque wrench', 'sock-10', 25)] },
      { id: 'disc', name: 'Clutch disc', c: [285, 200], needs: ['cover'], svg: R(262, 100, 20, 200, 'tint-y') + R(282, 186, 28, 28, 'metal-dark') + T(272, 318, 'Disc', 'tsm', 'middle'),
        remove: [doStep('Slide out the clutch disc and note which way round it was fitted', null)],
        inspect: { label: 'Measure the lining depth above the rivets', limit: '0.5 mm minimum', fail: 'The lining is worn below the minimum: replace the disc.' },
        install: [doStep('Place the disc with the side marked "flywheel side" toward the flywheel and centre it with the alignment tool', 'align')] },
      { id: 'pilot', name: 'Pilot bearing', c: [243, 200], needs: ['disc'], svg: R(228, 190, 30, 20, 'tint-c') + C(243, 200, 4, 'box') + T(243, 180, 'Pilot', 'tsm', 'middle'),
        remove: [doStep('Pull the pilot bearing out of the crankshaft end', 'puller')],
        inspect: { label: 'Spin the pilot bearing and check for roughness', limit: 'Smooth, no noise or play', fail: 'The bearing is rough: replace it.' },
        install: [doStep('Press the bearing into the crankshaft end until it is flush', null)] },
      { id: 'flywheel', name: 'Flywheel', c: [210, 200], needs: ['pilot'], svg: R(170, 90, 80, 220, 'metal') + P('M172 98h76M172 302h76', 'k2') + R(176, 108, 6, 10, 'metal-dark') + R(176, 282, 6, 10, 'metal-dark') + T(210, 338, 'Flywheel', 'tsm', 'middle'),
        remove: [doStep('Lock the flywheel with the locking tool', 'lock'), bolts('Remove the eight flywheel bolts gradually in a criss-cross sequence', 'sock-17', 8, 'circle', [0, 4, 2, 6, 1, 5, 3, 7]), doStep('Lift off the flywheel. It is heavy: support it.', null)],
        inspect: { label: 'Check the friction face for heat spots and measure the runout', limit: '0.10 mm maximum runout', fail: 'The flywheel face is damaged or out of limit: resurface or replace it.' },
        install: [doStep('Fit the flywheel on the dowel and lock it with the locking tool', 'lock'), bolts('Run the new bolts in and tighten them in a criss-cross sequence', 'sock-17', 8, 'circle', [0, 4, 2, 6, 1, 5, 3, 7]), torque('Final torque with the torque wrench', 'sock-17', 95)] },
      { id: 'seal', name: 'Rear main seal', c: [150, 200], needs: ['flywheel'], svg: R(132, 150, 38, 100, 'tint-m') + T(150, 270, 'Seal', 'tsm', 'middle'),
        remove: [doStep('Carefully pull the rear crankshaft seal out of its housing', 'puller')],
        inspect: { label: 'Look for oil leaking from the rear crankshaft seal', limit: 'Dry', fail: 'The seal is leaking oil: replace it, since oil on the clutch will make it slip.' },
        install: [doStep('Fit the new seal squarely, dry on the sealing lip, and press it in evenly', null)] }
    ],
    statics: R(30, 70, 100, 240, 'metal') + R(130, 176, 40, 48, 'metal-dark') + T(80, 195, 'Engine rear', 'tsm', 'middle'),
    final: ['Check that the clutch disc turns freely and is centred', 'Refit the gearbox with the input shaft lightly greased on the splines only', 'Bleed or adjust the clutch release system', 'Test the clutch pedal travel and the gear change before handing the car back']
  },

  /* ---------------------------------------------------------------- 4 Alternator */
  {
    id: 'alternator', title: 'Alternator removal and refit', lesson: ['m10-l7', 'Charging faults'],
    blurb: 'Remove an alternator safely, check its brushes and pulley on the bench, and refit it with the belt correctly tensioned.',
    scenarios: [
      { say: 'The battery warning light is on. The brushes are worn.', inspect: { alternator: { reading: '3.5 mm brush length', pass: false } } },
      { say: 'The alternator whines. The freewheel pulley is stiff.', inspect: { alternator: { reading: 'Pulley sticks in one direction', pass: false } } },
      { say: 'The charging fault was a loose connection. The alternator is fine.', inspect: { alternator: { reading: '11 mm brush length, pulley free', pass: true } } }
    ],
    spec: [['Alternator B+ terminal nut', '12 mm socket', '12 N m'], ['Bracket bolts', '17 mm socket', '45 N m'], ['Brush length minimum', '', '5 mm'], ['Belt', 'Breaker bar on the tensioner', 'Correct routing per the belt diagram']],
    prep: [
      { id: 'battery', label: 'Disconnect the battery earth lead first', ok: true },
      { id: 'cold', label: 'Let the engine cool so the exhaust and manifolds are not hot', ok: true },
      { id: 'cover', label: 'Insulate the B+ terminal after it is disconnected', ok: true },
      { id: 'live', label: 'Leave the battery connected so you can test it as you work', ok: false, why: 'The B+ cable is live all the time, even with the engine off. A spanner touching the body will weld and burn. Always disconnect the battery earth first.' }
    ],
    parts: [
      { id: 'connector', name: 'Wiring connections', c: [420, 121], needs: [], svg: R(392, 110, 36, 22, 'tint-m') + P('M428 121H480', 'wire-pos') + T(418, 98, 'B+ and plug', 'tsm', 'middle'),
        remove: [doStep('Fold back the cover, undo the B+ terminal nut and note the cable position', 'sock-12'), doStep('Unclip the multi-plug', null)],
        install: [doStep('Fit the multi-plug until it clicks', null), doStep('Fit the B+ cable on the stud, then tighten the nut and replace the cover', 'sock-12'), torque('Tighten the B+ nut to its torque', 'sock-12', 12)] },
      { id: 'belt', name: 'Drive belt', c: [170, 225], needs: [], svg: P(hull([[262, 150, 28], [80, 300, 40]]), 'k', 'stroke:var(--ink);stroke-width:8;opacity:0.7') + T(150, 218, 'Belt', 'tsm', 'middle'),
        remove: [doStep('Turn the tensioner with the breaker bar to release the belt tension', 'breaker'), doStep('Slip the belt off the alternator pulley and let the tensioner back slowly', null)],
        inspect: { label: 'Check the belt for cracks, glazing and fraying', limit: 'No cracks or fraying', fail: 'The belt is cracked: replace it.' },
        install: [doStep('Route the belt as in the belt diagram, then release the tensioner slowly so it seats in every groove', 'breaker')] },
      { id: 'bracket', name: 'Bracket bolts', c: [245, 150], needs: ['belt', 'connector'], svg: R(180, 64, 130, 12, 'metal-dark') + R(300, 76, 24, 24, 'metal-dark') + R(180, 224, 130, 12, 'metal-dark') + R(300, 200, 24, 24, 'metal-dark'),
        remove: [bolts('Remove the three bracket bolts, supporting the alternator as the last one comes out', 'sock-17', 3, [3, 1], [0, 1, 2])],
        install: [bolts('Fit the three bracket bolts and run them up finger-tight', 'sock-17', 3, [3, 1], [0, 1, 2]), torque('Torque the bracket bolts', 'sock-17', 45)] },
      { id: 'alternator', name: 'Alternator', c: [330, 150], needs: ['bracket'], svg: R(290, 100, 100, 100, 'metal') + C(262, 150, 28, 'metal-dark') + C(262, 150, 8, 'box') + T(340, 156, 'Alternator', 'tsm', 'middle'),
        remove: [doStep('Lift the alternator out of the engine bay', null)],
        inspect: { label: 'Bench check: brush length and the one-way pulley', limit: '5 mm minimum brush length, pulley turns freely one way only', fail: 'The alternator fails the bench check: replace it or have it reconditioned.' },
        install: [doStep('Offer the alternator into the bracket and hold it in position', null)] }
    ],
    statics: R(30, 40, 150, 320, 'metal') + C(80, 300, 40, 'metal-dark') + C(80, 300, 10, 'box') + T(105, 200, 'Engine', 'tsm', 'middle'),
    final: ['Reconnect the battery earth lead', 'Start the engine and measure the charging voltage: it should be about 13.8 to 14.5 V', 'Check that the battery warning light goes out', 'Check the belt runs true with no noise']
  }
];
