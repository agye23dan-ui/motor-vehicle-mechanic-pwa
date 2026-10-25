/* Fault finder entries for Semester 3: driveline, steering, suspension, brakes, tyres, body and workshop practice. */
(window.MVM.faults = window.MVM.faults || []).push(
  {
    id: 'clutch-slipping', mod: 'm16', lessons: ['m16-l3', 'm16-l4'], title: 'Clutch slips',
    causes: [
      'Worn clutch disc',
      'Oil or grease contamination on the disc from a leaking crankshaft or gearbox seal',
      'Weak pressure plate',
      'Cable or hydraulic system out of adjustment, leaving no free play',
      'Glazed flywheel surface'
    ],
    diagnose: [
      'Look for rising engine speed without matching road speed under load, especially in a high gear.',
      'Check the pedal free play and the hydraulic fluid level.',
      'Do a road test with a moderate load on a hill.',
      'Check for an oil leak at the bell housing.'
    ],
    repair: [
      'Adjust the cable, or bleed the hydraulics, where the fault is in the control.',
      'Replace the clutch kit (disc, pressure plate and release bearing).',
      'Resurface or replace the flywheel, and repair the oil leak.'
    ],
    caution: 'Never use compressed air to blow clutch dust. It may contain harmful fibres.'
  },
  {
    id: 'clutch-wont-release', mod: 'm16', lessons: ['m16-l4', 'm16-l9'], title: 'Clutch drags or will not release',
    causes: [
      'Air in the hydraulic system or low fluid',
      'Leaking master or slave cylinder',
      'Stretched or broken cable',
      'Warped disc or damaged pressure plate',
      'Worn release bearing or fork'
    ],
    diagnose: [
      'Check the fluid level and the pedal feel. A pedal that sinks to the floor suggests a hydraulic leak.',
      'Look for leaks at the cylinders and pipes.',
      'Check the travel of the slave cylinder or cable.',
      'Listen for noise when the pedal is pressed.'
    ],
    repair: [
      'Bleed the system and repair leaks.',
      'Replace the cylinders or cable.',
      'Replace the clutch kit if the disc or plate is warped.'
    ],
    caution: null
  },
  {
    id: 'gear-crunch', mod: 'm16', lessons: ['m16-l5', 'm16-l9'], title: 'Difficult or noisy gear changes in a manual gearbox',
    causes: [
      'Clutch not fully releasing',
      'Worn synchroniser rings',
      'Low or wrong gear oil',
      'Worn shift linkage or bushes',
      'Worn selector forks'
    ],
    diagnose: [
      'Check that the clutch releases fully.',
      'Check the gear oil level and grade.',
      'Check the linkage for play.',
      'Note which gears are affected: one gear points to its synchroniser.'
    ],
    repair: [
      'Correct the clutch fault and top up with the correct oil.',
      'Replace linkage bushes and cables.',
      'Overhaul the gearbox for worn synchronisers or forks.'
    ],
    caution: null
  },
  {
    id: 'cv-click', mod: 'm16', lessons: ['m16-l7', 'm16-l8'], title: 'Clicking noise when turning',
    causes: [
      'Worn outer CV joint',
      'Torn CV boot that has lost grease and let in dirt',
      'Worn wheel bearing (if the noise is a hum)',
      'Loose wheel nuts'
    ],
    diagnose: [
      'Drive in tight circles on full lock and listen for clicking that speeds up with the wheel.',
      'Inspect the boots for tears and grease thrown around.',
      'Check the joints for play and the axle nut for tightness.'
    ],
    repair: [
      'Replace the CV joint or the complete shaft.',
      'If only the boot is split and the joint is not yet noisy, replace the boot with a kit, clean the joint and repack with the right grease.',
      'Tighten the axle nut to torque and fit a new locking device.'
    ],
    caution: 'Support the vehicle properly on axle stands and never work under it on a jack alone.'
  },
  {
    id: 'auto-slipping', mod: 'm17', lessons: ['m17-l11', 'm17-l12'], title: 'Automatic transmission slips or shifts late',
    causes: [
      'Low or burnt fluid',
      'Worn clutch packs or bands',
      'Low line pressure from a failing pump or a leaking seal',
      'Faulty solenoids or valve body wear',
      'Faulty speed or throttle sensors',
      'Torque converter clutch fault'
    ],
    diagnose: [
      'Check the fluid level and colour, using the maker method. A burnt smell shows overheating.',
      'Read the codes and the transmission data: gear ratio, slip and line pressure.',
      'Do a road test and note when the slip occurs.',
      'Do a pressure test when the manual allows.',
      'Check the cooler lines for restriction.'
    ],
    repair: [
      'Correct the fluid level and change the fluid and filter with the correct type.',
      'Repair or replace the solenoids or valve body.',
      'Overhaul or replace the transmission if the clutches are worn.'
    ],
    caution: null
  },
  {
    id: 'auto-harsh-shift', mod: 'm17', lessons: ['m17-l3', 'm17-l11'], title: 'Harsh, jerky or flaring gear changes',
    causes: [
      'Wrong, old or low fluid',
      'Stuck solenoid or sticking valve',
      'Faulty throttle or torque sensor signal',
      'Learned shift adaptations that are wrong',
      'Worn engine or transmission mounts'
    ],
    diagnose: [
      'Check the fluid and read the codes.',
      'Note which shifts are harsh, and the temperature.',
      'Check live data for the throttle signal and line pressure.',
      'Check the mounts for movement.'
    ],
    repair: [
      'Change the fluid with the correct type.',
      'Repair the solenoid, valve body or sensor.',
      'Reset adaptations and relearn the shifts as the manual says.'
    ],
    caution: null
  },
  {
    id: 'diff-whine', mod: 'm17', lessons: ['m17-l8', 'm16-l8'], title: 'Whine or howl from the differential',
    causes: [
      'Low or wrong oil',
      'Worn pinion or carrier bearings',
      'Worn or badly set gears',
      'Worn axle bearings',
      'Tyre noise that only seems to be from the axle'
    ],
    diagnose: [
      'Check the oil level and condition for metal.',
      'Note if the noise changes on acceleration, coasting or in turns.',
      'Test different road surfaces to separate tyre noise.',
      'Check the axle play and bearings.'
    ],
    repair: [
      'Top up or change the oil with the correct grade.',
      'Replace bearings and set the gears and pre-load to the specification.',
      'Replace the differential assembly where necessary.'
    ],
    caution: null
  },
  {
    id: 'vehicle-pulls', mod: 'm18', lessons: ['m18-l7', 'm18-l10'], title: 'Vehicle pulls to one side',
    causes: [
      'Uneven tyre pressures or a tyre with a conicity fault',
      'Wheel alignment out of specification (camber, caster, toe)',
      'Dragging brake or seized caliper',
      'Worn suspension parts: ball joint, bush or spring',
      'Bent steering or suspension part after a kerb strike',
      'Different tyres across an axle'
    ],
    diagnose: [
      'Check the tyre pressures and look at the wear pattern.',
      'Road test: does it pull when braking (brake) or when coasting (alignment or tyres)?',
      'Swap the front tyres side to side and see if the pull follows the tyre.',
      'Feel for hot wheels after a drive.',
      'Check suspension for play and measure the alignment.'
    ],
    repair: [
      'Correct the pressures and replace damaged tyres.',
      'Repair or replace worn or bent parts.',
      'Repair the brake drag.',
      'Realign the wheels to the specification.'
    ],
    caution: null
  },
  {
    id: 'steering-play', mod: 'm18', lessons: ['m18-l5', 'm18-l10'], title: 'Loose or wandering steering',
    causes: [
      'Worn tie rod ends or inner joints',
      'Worn rack or a loose rack mount',
      'Worn ball joints or suspension bushes',
      'Loose or worn steering column joint',
      'Incorrect toe or low caster',
      'Worn wheel bearings'
    ],
    diagnose: [
      'With the wheels on the ground, rock the steering wheel gently and watch the road wheels for delay.',
      'With the wheels raised, check each joint for play by hand.',
      'Check the rack for play and for leaks.',
      'Check the alignment readings.'
    ],
    repair: [
      'Replace worn joints and bushes in pairs where practical.',
      'Replace or repair the rack.',
      'Set the alignment to the specification and road test.'
    ],
    caution: 'Steering parts are safety critical. Never straighten bent components. Replace them.'
  },
  {
    id: 'heavy-steering', mod: 'm18', lessons: ['m18-l6', 'm18-l10'], title: 'Steering is heavy',
    causes: [
      'Low power steering fluid or leak',
      'Slipping or broken belt on a hydraulic pump',
      'Failed pump',
      'Electric power steering fault, low voltage or sensor fault',
      'Low tyre pressure',
      'Seized ball joint or rack'
    ],
    diagnose: [
      'Check the tyre pressures and the fluid level.',
      'Check the belt and listen for pump noise.',
      'For electric systems, read the codes and check the battery voltage.',
      'Check the pressure of a hydraulic system with a gauge.'
    ],
    repair: [
      'Top up and fix leaks.',
      'Replace the belt, the pump or the rack.',
      'Repair the electrical fault and calibrate the sensors after repair.'
    ],
    caution: null
  },
  {
    id: 'steering-wheel-shake', mod: 'm18', lessons: ['m18-l9', 'm18-l10'], title: 'Steering wheel shakes at speed',
    causes: [
      'Front wheel out of balance',
      'Bent rim or damaged tyre',
      'Worn tie rods, ball joints or bushes',
      'Warped brake disc (if only when braking)',
      'Loose wheel nuts'
    ],
    diagnose: [
      'Note the speed at which it shakes: often between 80 and 100 km/h for balance.',
      'Check the wheel nuts and the tyres.',
      'Balance the wheels and check the run-out.',
      'Check the suspension for play.'
    ],
    repair: [
      'Balance or replace the wheel or tyre.',
      'Replace worn joints.',
      'Resurface or replace the brake disc.'
    ],
    caution: null
  },
  {
    id: 'suspension-clunk', mod: 'm18', lessons: ['m18-l3', 'm18-l10'], title: 'Clunk or knock from the suspension over bumps',
    causes: [
      'Worn anti-roll bar links or bushes',
      'Worn strut top mount or damper',
      'Worn ball joint or control arm bush',
      'Broken coil spring',
      'Loose bolts or a loose subframe'
    ],
    diagnose: [
      'Road test on a rough surface and note which corner and the type of noise.',
      'Raise the vehicle and check each joint and bush with a pry bar.',
      'Check the damper for leaks and the spring for breaks.',
      'Check the torque of the fasteners.'
    ],
    repair: [
      'Replace the worn parts in pairs on the same axle.',
      'Tighten fasteners at normal ride height to the specification.',
      'Check the alignment after replacement.'
    ],
    caution: 'Springs store a lot of energy. Use the correct spring compressor or replace the strut as an assembly.'
  },
  {
    id: 'tyre-wear-uneven', mod: 'm19', lessons: ['m18-l8', 'm03-l6'], title: 'Uneven tyre wear',
    causes: [
      'Alignment out: toe causes feathering, camber causes edge wear',
      'Incorrect tyre pressure: centre wear when too high, edges when too low',
      'Worn dampers causing cupping',
      'Worn suspension parts',
      'No tyre rotation'
    ],
    diagnose: [
      'Look at the pattern across and around the tread.',
      'Check the pressure and compare with the label.',
      'Check the alignment.',
      'Check the dampers and the suspension joints.'
    ],
    repair: [
      'Replace the worn tyres and the worn parts that caused it.',
      'Align the wheels.',
      'Advise the customer on pressure checks and rotation intervals.'
    ],
    caution: 'Never fit a tyre with exposed cords, bulges or a tread below the legal limit.'
  },
  {
    id: 'spongy-brake-pedal', mod: 'm19', lessons: ['m19-l9', 'm19-l4'], title: 'Soft or spongy brake pedal',
    causes: [
      'Air in the hydraulic system',
      'Old brake fluid that has absorbed water and boiled',
      'Swollen or leaking flexible brake hose',
      'Master cylinder worn internally',
      'Drum brakes out of adjustment'
    ],
    diagnose: [
      'Pump the pedal. If it firms up after a couple of pumps, suspect air or adjustment.',
      'Hold firm pressure on the pedal for 30 seconds. A sinking pedal shows a leak or a bad master cylinder.',
      'Check the level, colour and moisture content of the fluid.',
      'Inspect the hoses for bulges and the system for leaks.'
    ],
    repair: [
      'Bleed the system with fresh fluid of the correct type until clear.',
      'Replace hoses, calipers or the master cylinder as found.',
      'Adjust rear drums where manual adjustment is needed.',
      'Test the pedal firmness and make a road test before the vehicle leaves.'
    ],
    caution: 'Never return a vehicle with a soft or sinking brake pedal. It is a safety defect.'
  },
  {
    id: 'brake-pulsation', mod: 'm19', lessons: ['m19-l5', 'm19-l9'], title: 'Brake pedal pulsates when braking',
    causes: [
      'Disc thickness variation or lateral run-out',
      'Pad material deposits on the disc',
      'Hub or bearing fault giving run-out',
      'Wheel nuts tightened unevenly',
      'Out-of-round drum',
      'ABS operating because of a sensor fault'
    ],
    diagnose: [
      'Check whether the pulsing is in the pedal (front) or in the seat (rear).',
      'Measure disc thickness at several points with a micrometer and the run-out with a dial gauge.',
      'Check the hub face and the wheel nut torque.',
      'Check ABS codes and sensor signals.'
    ],
    repair: [
      'Replace or machine the disc (only if it will stay above the minimum thickness) and fit new pads.',
      'Clean the hub face; torque wheel nuts evenly to the specification.',
      'Repair the ABS sensor fault.'
    ],
    caution: null
  },
  {
    id: 'brake-pull', mod: 'm19', lessons: ['m19-l9', 'm19-l10'], title: 'Vehicle pulls to one side when braking',
    causes: [
      'Seized caliper piston or slide pins',
      'Contaminated pads with oil or fluid',
      'Collapsed flexible hose blocking flow to one side',
      'Uneven tyre pressure or wear',
      'Worn suspension or alignment faults'
    ],
    diagnose: [
      'Road test and note the direction. The vehicle pulls to the side with more braking force.',
      'Feel the wheels after the drive. A very hot wheel suggests a drag from a stuck brake.',
      'Check the pads, the slides and the pistons.',
      'Do a roller brake test and compare the left and right forces.'
    ],
    repair: [
      'Free or replace the caliper, and lubricate the slides with brake grease.',
      'Replace the hoses and contaminated pads.',
      'Replace pads and discs in axle sets.'
    ],
    caution: null
  },
  {
    id: 'brake-noise', mod: 'm19', lessons: ['m19-l3', 'm19-l5'], title: 'Squealing or grinding brakes',
    causes: [
      'Worn pads with the wear indicator touching the disc',
      'Pads worn to the metal backing (grinding)',
      'Missing shims or dry slides',
      'Glazed pads or disc',
      'Stone or debris trapped',
      'Poor quality pads'
    ],
    diagnose: [
      'Take off the wheel and inspect the pad thickness, the disc surface, shims and slide pins.',
      'Check whether the noise is on light braking only (squeal) or at all times (drag).',
      'Check for uneven wear, which suggests a sticking caliper.'
    ],
    repair: [
      'Replace the pads in axle sets with the correct type and fit new shims and clips.',
      'Replace or machine the discs if grooved or below the limit.',
      'Clean and lubricate the slides and bed in the new pads.'
    ],
    caution: 'Never blow brake dust with compressed air. Use a wet method or an approved vacuum.'
  },
  {
    id: 'abs-light', mod: 'm19', lessons: ['m19-l7', 'm19-l8'], title: 'ABS or stability control light is on',
    causes: [
      'Wheel speed sensor fault or damaged wiring',
      'Damaged or dirty tone ring (encoder)',
      'Low battery voltage',
      'Worn wheel bearing giving a bad signal',
      'Steering angle or yaw sensor needing calibration',
      'Module or hydraulic unit fault'
    ],
    diagnose: [
      'Read the ABS codes and note which wheel is named.',
      'Check live wheel speeds on a drive. A wheel reading zero or jumping is the problem.',
      'Inspect the sensor, wiring and ring for damage, dirt or iron filings.',
      'Check the sensor air gap and the bearing play.',
      'Check the battery voltage and the charging system.'
    ],
    repair: [
      'Clean or replace the sensor, wiring or ring.',
      'Replace the bearing if it has play.',
      'Calibrate the steering angle sensor after alignment or steering work.',
      'Clear the codes and road test.'
    ],
    caution: 'If the ABS light and the main brake warning light are on together, treat it as a hydraulic fault and do not drive until checked.'
  },
  {
    id: 'wheel-bearing-hum', mod: 'm19', lessons: ['m19-l11', 'm19-l10'], title: 'Humming or growling that changes with speed',
    causes: [
      'Worn wheel bearing',
      'Uneven tyre wear (cupping)',
      'Loose axle nut',
      'Differential or gearbox bearing (if it changes with load)'
    ],
    diagnose: [
      'Road test and note the speed range of the noise.',
      'Drive gently left and right. A hum that gets louder when turning one way points to the bearing on the opposite side, which carries more load.',
      'Raise the wheel, spin by hand and rock it to check for roughness and play.',
      'Check the ABS sensor signal for drop-outs.'
    ],
    repair: [
      'Replace the bearing or hub unit with the correct part.',
      'Torque the axle nut to the specification and fit new locking parts.',
      'Replace worn tyres if they are the cause.'
    ],
    caution: 'A failed wheel bearing can lead to the wheel coming loose. Do not delay repair.'
  },
  {
    id: 'airbag-light', mod: 'm20', lessons: ['m20-l3', 'm20-l4'], title: 'Airbag warning light stays on',
    causes: [
      'Fault in a sensor, a buckle switch or a seat occupancy sensor',
      'Wiring or connector fault under the seat',
      'Clock spring fault',
      'Low battery voltage',
      'Previously deployed or removed parts',
      'Module fault'
    ],
    diagnose: [
      'Read the restraint system codes with the scan tool only.',
      'Check the battery voltage.',
      'Follow the maker procedure for the named code.',
      'Never probe airbag connectors with a test lamp or meter.'
    ],
    repair: [
      'Repair the connector or replace the faulty part according to the manual.',
      'Clear the codes and confirm that the light goes out.',
      'Tell the customer in writing if the system cannot be restored.'
    ],
    caution: 'Treat the airbag system as live and dangerous. Disconnect the battery, wait the time the manual gives, and do not probe its circuits.'
  },
  {
    id: 'water-leak-cabin', mod: 'm20', lessons: ['m20-l6', 'm20-l11'], title: 'Water leak into the cabin',
    causes: [
      'Blocked scuttle or sunroof drains',
      'Damaged door or boot seals',
      'Windscreen or rear glass seal leaking',
      'Missing grommets or poor seam sealer',
      'Heater matrix leak (coolant, not water)',
      'Blocked A/C evaporator drain'
    ],
    diagnose: [
      'Find the wettest area, and lift the carpet to trace the water path. Water can travel a long way.',
      'Check whether it is clear water or sweet coolant.',
      'Test with a hose from low to high with a helper inside.',
      'Check the drains with a flow of water.'
    ],
    repair: [
      'Clear the drains and replace damaged seals.',
      'Reseal the glass or the seam with the correct sealer.',
      'Dry out the carpet and insulation to stop mould.'
    ],
    caution: null
  },
  {
    id: 'rattle-cabin', mod: 'm20', lessons: ['m20-l11', 'm20-l12'], title: 'Rattle or squeak from the cabin or body',
    causes: [
      'Loose trim clips or panels',
      'Items in the boot or door pockets',
      'Door seals dry or out of place',
      'Loose seat or seat belt hardware',
      'Heat shield or underbody panel loose'
    ],
    diagnose: [
      'Road test with a helper and locate the sound with a listening tube.',
      'Press panels by hand while driving on rough road.',
      'Check the boot and the pockets.',
      'Check the underside for loose shields.'
    ],
    repair: [
      'Refit or replace clips, add felt tape, and lubricate seals with silicone.',
      'Tighten the heat shield or replace its fixings.',
      'Test on the same road to confirm the fix.'
    ],
    caution: null
  },
  {
    id: 'comeback-same-fault', mod: 'm21', lessons: ['m21-l1', 'm21-l9'], title: 'The same fault returns after repair (comeback)',
    causes: [
      'The cause was never found: only the symptom was treated',
      'A part was replaced without proof that it was faulty',
      'A poor quality or wrong part was fitted',
      'The final test drive was skipped',
      'A related fault remained, such as a leak that killed the new part',
      'Poor communication about what was done'
    ],
    diagnose: [
      'Listen to the customer and review the job card and what was done.',
      'Repeat the six steps from the start, as if it were a new job.',
      'Check the part that was replaced and the conditions that could have damaged it.',
      'Look for the root cause that makes the part fail again.'
    ],
    repair: [
      'Repair the root cause and replace what is truly faulty.',
      'Do not charge for a repair that failed because of your error.',
      'Record the cause and share the lesson with the team.',
      'Confirm with a full test before handing back.'
    ],
    caution: null
  },
  {
    id: 'jack-and-support', mod: 'm01', lessons: ['m01-l4'], title: 'Vehicle will not sit safely on a jack or stands',
    causes: [
      'Soft or sloping ground',
      'Wrong jacking point',
      'Damaged jack or stands',
      'Rust at the jacking point',
      'Vehicle not chocked'
    ],
    diagnose: [
      'Check the ground and the vehicle lifting points in the manual.',
      'Inspect the jack and stands for damage and leaks.',
      'Check the wheel chocks.'
    ],
    repair: [
      'Move to a firm, level surface.',
      'Use the correct lifting points and stands rated for the vehicle weight.',
      'Test that the vehicle is stable by pushing it gently before going under it.'
    ],
    caution: 'Never work under a vehicle supported only by a jack. Always use axle stands or a lift.'
  }
);
