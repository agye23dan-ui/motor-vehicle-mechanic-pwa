/* Fault finder entries for Semester 1: servicing, engine mechanics, lubrication, cooling, fuel and engine management. */
(window.MVM.faults = window.MVM.faults || []).push(
  {
    id: 'oil-pressure-light', mod: 'm05', lessons: ['m05-l1', 'm05-l7'], title: 'Oil pressure warning light comes on',
    causes: [
      'Oil level very low from a leak or oil burning',
      'Faulty oil pressure switch or sender, or damaged wiring to it',
      'Blocked oil filter or filter bypass valve stuck open',
      'Worn oil pump, or a pressure relief valve stuck open',
      'Worn crankshaft or camshaft bearings giving low pressure when hot',
      'Wrong grade of oil, or oil thinned by fuel'
    ],
    diagnose: [
      'Stop the engine at once and check the oil level with the car level. Do not run the engine with a lit light.',
      'Look under the engine for leaks and check the oil for a fuel smell or a milky colour.',
      'Fit a mechanical oil pressure gauge in place of the switch and compare the readings at idle and at 3,000 rpm, hot, with the manual.',
      'If the gauge reads normal, the switch or wiring is faulty: check the switch and its earth.',
      'If the gauge reads low, check the oil grade, then the filter, then the pump and relief valve.',
      'Low pressure only when hot and at idle points to worn bearings.'
    ],
    repair: [
      'Top up with the correct oil and repair any leak found.',
      'Replace a faulty switch and clean the wiring connector.',
      'Replace the filter, pump or relief valve as the test shows.',
      'If the bearings are worn, the engine needs overhaul or replacement. Explain this to the customer in writing.'
    ],
    caution: 'Never let a customer drive on with the oil light lit. A few minutes without pressure can destroy an engine.'
  },
  {
    id: 'engine-overheating', mod: 'm05', lessons: ['m05-l4', 'm05-l7'], title: 'Engine overheating',
    causes: [
      'Low coolant from a leak',
      'Thermostat stuck closed',
      'Radiator fan not running: fuse, relay, fan motor or temperature switch',
      'Blocked radiator, inside with scale or outside with dirt',
      'Weak or leaking radiator cap that cannot hold pressure',
      'Water pump with a slipping belt or a broken impeller',
      'Head gasket leaking combustion gas into the coolant',
      'Air trapped in the cooling system after a repair'
    ],
    diagnose: [
      'Let the engine cool fully. Check the coolant level and look for leaks, wet hoses and stains.',
      'Run the engine and watch the temperature. Note when the fan starts and whether the upper hose gets hot only after the thermostat opens.',
      'Feel both radiator hoses: a cold lower hose with a hot upper one suggests a blocked radiator or a stuck thermostat.',
      'Pressure-test the system and the cap for leaks.',
      'Test for combustion gas in the coolant with a chemical tester.',
      'Check the belt and the water pump for play and noise.'
    ],
    repair: [
      'Repair leaks, replace the thermostat, cap or hoses as found, and refill with the correct coolant mixture.',
      'Bleed air from the system using the manual method.',
      'Replace the fan relay, motor or sensor if the fan does not run when it should.',
      'If gas is in the coolant, the head, gasket and face flatness need to be checked and the head gasket replaced.'
    ],
    caution: 'Never open the radiator cap on a hot engine. Hot coolant under pressure causes severe burns.'
  },
  {
    id: 'coolant-loss-no-leak', mod: 'm05', lessons: ['m05-l7', 'm05-l8'], title: 'Coolant level keeps dropping with no visible leak',
    causes: [
      'Head gasket leak into a cylinder or the oil',
      'Heater matrix leak inside the cabin, with damp carpet or a sweet smell',
      'Leaking radiator cap letting coolant escape as steam',
      'Cracked cylinder head or block',
      'Small leak at a hose or the water pump that only shows under pressure'
    ],
    diagnose: [
      'Check the oil dipstick and filler cap for a milky colour.',
      'Look for white smoke at the exhaust and a sweet smell.',
      'Pressure-test the system and watch the gauge fall; look for drips when the system is under pressure.',
      'Check the carpet in the footwell and misting of the windscreen.',
      'Test the exhaust or the coolant for combustion gas.'
    ],
    repair: [
      'Repair the leak found: hose, pump, matrix or cap.',
      'For a head gasket fault, remove the head, check it for flatness and cracks, and fit a new gasket and bolts.',
      'Flush the system if oil has mixed with coolant, then refill and bleed.'
    ],
    caution: null
  },
  {
    id: 'blue-smoke', mod: 'm04', lessons: ['m04-l5', 'm05-l9'], title: 'Blue smoke from the exhaust',
    causes: [
      'Worn piston rings or cylinder bores',
      'Worn valve stem seals, with smoke on start-up after standing',
      'Blocked crankcase breather (PCV) forcing oil into the engine',
      'Turbocharger oil seal leak',
      'Overfilled engine oil'
    ],
    diagnose: [
      'Check the oil level and the oil consumption history.',
      'Note when the smoke appears: on start-up points to valve seals, under acceleration to rings.',
      'Do a compression test and a leak-down test.',
      'Check the breather system and the turbocharger shaft for oil and play.'
    ],
    repair: [
      'Clear a blocked breather and correct the oil level.',
      'Replace valve stem seals or a turbocharger as found.',
      'Worn rings or bores need an engine overhaul or replacement.'
    ],
    caution: null
  },
  {
    id: 'low-compression', mod: 'm04', lessons: ['m04-l5', 'm04-l10'], title: 'Low compression on one or more cylinders',
    causes: [
      'Burnt or sticking valve',
      'Worn rings or bore',
      'Leaking head gasket between cylinders',
      'Incorrect valve timing from a jumped belt or chain',
      'Cracked piston or broken ring'
    ],
    diagnose: [
      'Warm the engine, disable fuel and ignition, and do a dry compression test on every cylinder.',
      'Add a spoonful of oil to a low cylinder and test again: pressure that rises points to rings, and pressure that does not points to valves or the gasket.',
      'Do a leak-down test and listen at the exhaust, intake and oil filler to find where the air escapes.',
      'Check the valve timing marks.'
    ],
    repair: [
      'Correct the valve timing if it is out.',
      'Remove the head to repair valves, seats or the gasket.',
      'Rings and pistons need an engine overhaul.'
    ],
    caution: null
  },
  {
    id: 'engine-misfire', mod: 'm06', lessons: ['m06-l7', 'm06-l10'], title: 'Engine misfire (rough running, juddering, flashing engine light)',
    causes: [
      'Worn or fouled spark plugs',
      'Faulty ignition coil or lead',
      'Faulty or dirty fuel injector',
      'Vacuum or intake leak causing a lean mixture',
      'Low compression on a cylinder',
      'Faulty crank or cam sensor giving wrong timing',
      'Contaminated or poor fuel'
    ],
    diagnose: [
      'Read the codes: a code such as P0302 points to cylinder 2.',
      'Swap the coil from the misfiring cylinder to another and see if the misfire moves.',
      'Check the spark plug condition and gap.',
      'Check the fuel trims for a lean or rich mixture and look for air leaks with smoke.',
      'Check the injector with a stethoscope and measure its resistance.',
      'Run a compression test if the fault stays with the cylinder after swapping parts.'
    ],
    repair: [
      'Replace the plugs or coil that the swap test proved faulty.',
      'Clean or replace the injector.',
      'Repair the air leak.',
      'Clear codes and road test.'
    ],
    caution: 'A flashing engine light means misfire that can destroy the catalytic converter. Advise the customer to reduce speed and have it repaired soon.'
  },
  {
    id: 'hard-starting-cranks', mod: 'm06', lessons: ['m06-l10', 'm06-l3'], title: 'Engine cranks but will not start',
    causes: [
      'No fuel: empty tank, failed fuel pump, relay or fuse, blocked filter',
      'No spark: coil, ignition module, or crank sensor failure',
      'Immobiliser or security fault',
      'Flooded engine or very weak battery giving slow cranking',
      'Timing belt or chain failure',
      'Crankshaft position sensor failure (no signal)'
    ],
    diagnose: [
      'Check the fuel level and listen for the fuel pump to prime when the ignition is switched on.',
      'Check for spark with a spark tester. Do not hold a lead by hand.',
      'Read the codes and look for an immobiliser lamp flashing.',
      'Check the fuel pressure against the specification.',
      'Check live data: does the engine speed signal appear while cranking?',
      'Check the timing belt condition if the engine turns very freely.'
    ],
    repair: [
      'Replace the fuel pump, relay, filter or the faulty sensor.',
      'Replace ignition parts that failed the test.',
      'Reprogram or reset the immobiliser as the manual says.',
      'Replace a broken timing belt and check for valve damage.'
    ],
    caution: 'Fuel is highly flammable. Work in a ventilated area, avoid sparks, and relieve fuel pressure before opening a line.'
  },
  {
    id: 'rough-idle', mod: 'm06', lessons: ['m06-l9', 'm06-l10'], title: 'Rough or unstable idle',
    causes: [
      'Vacuum leak or cracked intake hose',
      'Dirty throttle body or idle air passages',
      'Faulty idle control or throttle position sensor',
      'Worn plugs or weak coils',
      'Dirty injectors',
      'Blocked EGR valve stuck open',
      'Faulty mass air flow sensor'
    ],
    diagnose: [
      'Read codes and check the fuel trims at idle.',
      'Look for air leaks with a smoke machine.',
      'Check the throttle body for carbon and check the throttle position signal.',
      'Check the EGR valve for sticking.',
      'Compare the air flow reading with the specification.'
    ],
    repair: [
      'Repair the leak and clean the throttle body with the correct cleaner.',
      'Replace the faulty sensor or valve.',
      'Clear adaptations and perform an idle relearn as the manual says.'
    ],
    caution: null
  },
  {
    id: 'poor-fuel-economy', mod: 'm08', lessons: ['m08-l10', 'm08-l11'], title: 'High fuel consumption',
    causes: [
      'Low tyre pressure or dragging brakes',
      'Dirty air filter or restricted intake',
      'Faulty coolant temperature sensor (engine thinks it is cold)',
      'Faulty oxygen sensor',
      'Leaking injector or high fuel pressure',
      'Thermostat stuck open, so the engine never warms up',
      'Driving habits and short trips'
    ],
    diagnose: [
      'Ask about driving, loads and when the problem began. Check tyre pressures.',
      'Read the codes and the live data: coolant temperature, fuel trims and oxygen sensor switching.',
      'Check that the engine reaches normal temperature.',
      'Test the brakes for drag by feeling the wheels after a drive.',
      'Check the fuel pressure and the injectors for leaks.'
    ],
    repair: [
      'Correct the tyre pressures and replace the filter.',
      'Replace the faulty sensor or thermostat.',
      'Repair a fuel pressure fault.',
      'Explain to the customer the effect of driving style.'
    ],
    caution: null
  },
  {
    id: 'check-engine-light', mod: 'm08', lessons: ['m08-l9', 'm08-l10'], title: 'Engine management warning light is on',
    causes: [
      'Loose or faulty fuel cap (evaporative leak)',
      'Oxygen sensor ageing or heater circuit failure',
      'Misfire from plugs or coils',
      'Catalyst efficiency below threshold',
      'Mass air flow, throttle or temperature sensor fault',
      'EGR or evaporative purge valve fault'
    ],
    diagnose: [
      'Read all stored codes and the freeze frame data.',
      'Check the simple items first: fuel cap, connectors, air leaks.',
      'Look at live data for the sensors named by the code and compare with the specification.',
      'Test the circuit of the sensor: reference voltage, signal, and earth.',
      'Do not replace a part on the code alone: a code is a clue, not a verdict.'
    ],
    repair: [
      'Repair the wiring or fit the faulty part.',
      'Clear the codes and drive a full drive cycle to confirm the repair.',
      'Check that no code returns.'
    ],
    caution: null
  },
  {
    id: 'lean-code', mod: 'm08', lessons: ['m08-l5', 'm08-l10'], title: 'System too lean code (P0171 / P0174)',
    causes: [
      'Intake or vacuum leak after the air flow sensor',
      'Dirty or faulty mass air flow sensor',
      'Weak fuel pump or blocked filter',
      'Clogged injectors',
      'Leaking exhaust before the oxygen sensor',
      'Leaking PCV hose'
    ],
    diagnose: [
      'Check the fuel trims at idle and at 2,500 rpm. A trim that falls at higher rpm points to an intake leak.',
      'Use a smoke machine on the intake.',
      'Check the air flow reading against the specification.',
      'Check the fuel pressure under load.',
      'Check the exhaust for leaks near the sensor.'
    ],
    repair: [
      'Repair the leak.',
      'Clean or replace the air flow sensor.',
      'Replace the pump or filter if pressure is low.',
      'Clear adaptations and confirm trims return to within about 10 percent.'
    ],
    caution: null
  },
  {
    id: 'oil-leak', mod: 'm05', lessons: ['m05-l7', 'm05-l8'], title: 'Engine oil leak',
    causes: [
      'Valve cover gasket',
      'Oil pan gasket or drain plug washer',
      'Front or rear crankshaft seal',
      'Oil filter housing or filter not tight',
      'Oil cooler lines',
      'Blocked breather pushing oil past seals'
    ],
    diagnose: [
      'Clean the engine and the underside, add leak-tracing dye if allowed, run the engine and look from above and below.',
      'Remember oil runs backwards and downwards: the source is above the highest wet point.',
      'Check the breather and the crankcase pressure.',
      'Check the drain plug and the filter for tightness and seals.'
    ],
    repair: [
      'Replace the faulty gasket or seal with the correct part and tighten bolts in sequence to the torque.',
      'Replace the drain plug washer.',
      'Clear the breather.',
      'Clean up spilled oil and recheck after a test drive.'
    ],
    caution: 'Clean up oil spills at once and dispose of used oil and rags correctly.'
  },
  {
    id: 'timing-belt-noise', mod: 'm04', lessons: ['m04-l8'], title: 'Rattle or whine from the timing drive',
    causes: [
      'Worn timing chain or stretched chain with a failing tensioner',
      'Worn timing belt tensioner or idler bearing',
      'Low oil pressure to a hydraulic chain tensioner',
      'Water pump bearing failure on a belt-driven pump'
    ],
    diagnose: [
      'Listen for a rattle on a cold start that fades: this suggests a chain tensioner with low oil.',
      'Check the codes for cam and crank correlation.',
      'Remove the cover and check the belt for cracks, wear and tension, or measure chain stretch with the tool.',
      'Check the bearings for play and rough rotation.'
    ],
    repair: [
      'Replace the belt or chain, the tensioner, the idlers and, on belt-driven engines, the water pump together.',
      'Set the timing with the correct marks and locking tools.',
      'Turn the engine by hand twice to check for any contact before starting.'
    ],
    caution: 'On an interference engine a broken or jumped belt can bend valves. Replace belts at the maker interval.'
  },
  {
    id: 'diesel-hard-start', mod: 'm07', lessons: ['m07-l6', 'm07-l8'], title: 'Diesel engine hard to start',
    causes: [
      'Glow plugs or the glow plug relay faulty (cold starts)',
      'Air in the fuel system or a blocked fuel filter',
      'Water in the fuel',
      'Low rail pressure or a weak high-pressure pump',
      'Worn injectors',
      'Low compression, or a weak battery and slow cranking'
    ],
    diagnose: [
      'Check the battery and the cranking speed.',
      'Test the glow plug circuit and the plugs for resistance.',
      'Check the fuel filter and drain the water separator.',
      'Read the live rail pressure while cranking and compare with the specification.',
      'Check the injector correction and leak-off values.',
      'Do a compression test if the other items are normal.'
    ],
    repair: [
      'Replace the faulty glow plugs or relay.',
      'Replace the filter, bleed the system, and drain water.',
      'Repair the pump, rail pressure sensor or injectors as the test shows.'
    ],
    caution: 'Diesel injection works at very high pressure. Never loosen a high-pressure line with the engine running or cranking.'
  },
  {
    id: 'diesel-black-smoke', mod: 'm07', lessons: ['m07-l8', 'm07-l9'], title: 'Black smoke from a diesel',
    causes: [
      'Blocked air filter or intake restriction',
      'Faulty air flow sensor',
      'Leaking boost hose or a faulty turbocharger',
      'Worn or leaking injectors',
      'Blocked EGR or a stuck EGR valve',
      'Excessive fuel delivery after tuning'
    ],
    diagnose: [
      'Check the air filter and the intake for restrictions.',
      'Check the boost pressure against the specification during a road test.',
      'Check the air flow reading and EGR operation.',
      'Check injector balance values.'
    ],
    repair: [
      'Replace the filter and repair any boost leak.',
      'Clean or replace the EGR valve.',
      'Replace faulty injectors or the air flow sensor.'
    ],
    caution: null
  },
  {
    id: 'turbo-low-power', mod: 'm07', lessons: ['m07-l7', 'm07-l8'], title: 'Loss of power with a turbocharger',
    causes: [
      'Boost leak from a split hose, loose clamp or intercooler',
      'Stuck variable-geometry vanes or wastegate',
      'Worn turbo bearings or damaged blades',
      'Blocked air filter or exhaust restriction (blocked particulate filter or catalyst)',
      'Faulty boost control valve'
    ],
    diagnose: [
      'Check for an engine limp mode and read the codes.',
      'Pressure-test the intake after the turbo for leaks.',
      'Compare actual and requested boost on the scan tool.',
      'Check the turbo shaft for play and the pipes for oil.',
      'Measure exhaust back pressure.'
    ],
    repair: [
      'Repair the leaks and replace the clamps.',
      'Free or replace the actuator or the turbo.',
      'Find out why the turbo failed, such as oil starvation, before fitting a new one.'
    ],
    caution: null
  },
  {
    id: 'dpf-warning', mod: 'm08', lessons: ['m08-l7'], title: 'Diesel particulate filter warning or limp mode',
    causes: [
      'Short trips that never allow regeneration',
      'Faulty differential pressure sensor',
      'Injector or EGR fault creating too much soot',
      'Wrong engine oil (not low-ash type)',
      'Filter blocked with ash'
    ],
    diagnose: [
      'Read the codes and the soot loading and differential pressure values.',
      'Check the engine for faults that raise soot output.',
      'Check the pressure sensor pipes.',
      'Ask about the drive pattern.'
    ],
    repair: [
      'Carry out a forced regeneration with the scan tool, or advise a sustained drive at road speed.',
      'Repair the faults that created the soot.',
      'Replace or professionally clean a blocked filter.'
    ],
    caution: 'Never remove or disable a particulate filter. It is illegal and harms health.'
  },
  {
    id: 'service-oil-light', mod: 'm03', lessons: ['m03-l1', 'm03-l4'], title: 'Service reminder and routine inspection findings',
    causes: [
      'Service interval reached by time or distance',
      'Oil life monitor reached its limit',
      'Fluid, filter or brake wear found at inspection'
    ],
    diagnose: [
      'Check the service history and the manufacturer schedule.',
      'Do a full inspection: fluids, belts, hoses, tyres, brakes, lights and leaks.',
      'Record every finding and mark safety items.'
    ],
    repair: [
      'Carry out the scheduled service items with the correct oil grade and filters.',
      'Reset the service indicator using the correct procedure.',
      'Give the customer a written list of work done and advice for next time.'
    ],
    caution: null
  },
  {
    id: 'wheel-nut-loose', mod: 'm03', lessons: ['m03-l6'], title: 'Wheel vibration or noise after a tyre change',
    causes: [
      'Wheel nuts not torqued correctly or not re-torqued',
      'Rust or dirt on the hub face',
      'Wheel out of balance after the tyre was fitted',
      'Wrong nuts for the wheel seat'
    ],
    diagnose: [
      'Check the torque of all nuts with a wrench.',
      'Remove the wheel and check the mating faces and the studs.',
      'Rebalance the wheel.',
      'Check that the nut type matches the seat.'
    ],
    repair: [
      'Clean the faces, replace damaged studs or nuts, and torque in a star pattern.',
      'Re-torque after 50 to 100 km and tell the customer.'
    ],
    caution: 'A loose wheel can come off. Always torque to specification with a torque wrench.'
  },
  {
    id: 'belt-squeal', mod: 'm03', lessons: ['m03-l7'], title: 'Squealing from the drive belt',
    causes: [
      'Belt loose or worn and glazed',
      'Tensioner weak or seized',
      'Pulley misaligned or an accessory seizing (alternator, water pump, power steering, A/C)',
      'Oil or coolant contamination on the belt'
    ],
    diagnose: [
      'Inspect the belt for cracks, glazing and contamination.',
      'Spin each pulley by hand with the belt off and feel for roughness.',
      'Check the tensioner movement and the alignment of the pulleys.',
      'Check for a leak that contaminates the belt.'
    ],
    repair: [
      'Replace the belt and, where needed, the tensioner or idler.',
      'Repair the leak that contaminated the belt.',
      'Replace any accessory that is seizing.'
    ],
    caution: 'Keep hands and clothing away from belts and pulleys when the engine is running.'
  },
  {
    id: 'exhaust-leak', mod: 'm08', lessons: ['m08-l7'], title: 'Exhaust noise or leak',
    causes: [
      'Corroded pipe or silencer',
      'Failed gasket at the manifold or flange',
      'Broken hanger or mounting',
      'Cracked manifold'
    ],
    diagnose: [
      'Listen on a cold start, when leaks are loudest and ticking from a manifold is clear.',
      'Raise the car safely and inspect for holes, soot marks and loose parts.',
      'Check the hangers for movement.',
      'Use a smoke machine or a rag over the tailpipe to find small leaks (engine off and cool).'
    ],
    repair: [
      'Replace damaged sections with the correct parts, new gaskets and hangers.',
      'Tighten nuts to the torque, using new self-locking nuts where specified.'
    ],
    caution: 'Exhaust gas contains carbon monoxide. Never run an engine in a closed space without extraction.'
  },
  {
    id: 'fuel-smell', mod: 'm06', lessons: ['m06-l3', 'm06-l10'], title: 'Smell of fuel',
    causes: [
      'Leaking fuel line, fitting or injector seal',
      'Loose or damaged fuel cap, or an evaporative system fault',
      'Leaking fuel tank or filler pipe',
      'Rich mixture from a sensor fault',
      'Fuel spill after refuelling'
    ],
    diagnose: [
      'Switch off the engine and look for wet spots, stains and drips with the vehicle on a lift and no ignition sources near.',
      'Check the fuel cap and the evaporative system codes.',
      'Check the injector rail and seals with the ignition switched on to pressurise the system.',
      'Check the exhaust for a very rich smell with the engine running.'
    ],
    repair: [
      'Replace damaged lines, clips or seals with the correct parts.',
      'Replace a faulty cap or purge valve.',
      'Check for leaks again under pressure, and clean up any spilled fuel.'
    ],
    caution: 'Petrol vapour is explosive. No sparks, flames or phones near the leak, and keep a suitable extinguisher at hand.'
  },
  {
    id: 'knocking-engine', mod: 'm04', lessons: ['m04-l10', 'm05-l9'], title: 'Engine knocking or tapping',
    causes: [
      'Low oil level or low oil pressure',
      'Worn big-end or main bearings (deep knock, worse under load)',
      'Valve clearance too large or a collapsed hydraulic lifter (light ticking)',
      'Piston slap on a cold engine',
      'Detonation from poor fuel, advanced timing or carbon deposits',
      'Loose flywheel or flexplate bolts'
    ],
    diagnose: [
      'Check the oil level and pressure first.',
      'Use a stethoscope to find where the sound is loudest.',
      'Note when it happens: cold only, hot, under load, or at one rpm.',
      'Check codes for knock sensor faults, and the fuel quality.',
      'Short out each cylinder in turn (where permitted) to see if the knock changes.'
    ],
    repair: [
      'Correct the oil and replace the lifters or adjust the valve clearance.',
      'Use the correct fuel and clear carbon deposits.',
      'Bearing knock means the engine needs to be stripped and repaired or replaced.'
    ],
    caution: 'A deep knock can mean the engine is about to fail. Advise the customer not to drive it.'
  },
  {
    id: 'engine-stalls', mod: 'm08', lessons: ['m08-l11', 'm06-l9'], title: 'Engine stalls when stopping or at idle',
    causes: [
      'Dirty throttle body or idle control fault',
      'Vacuum leak',
      'Faulty crank or cam sensor (signal loss)',
      'Fuel delivery problem (weak pump or filter)',
      'Faulty mass air flow sensor',
      'EGR valve stuck open'
    ],
    diagnose: [
      'Read codes and fuel trims.',
      'Check the throttle body for deposits.',
      'Test for vacuum leaks with smoke.',
      'Check the fuel pressure at idle and after a hot soak.',
      'Log engine speed signals during the stall.'
    ],
    repair: [
      'Clean the throttle body and perform the idle relearn.',
      'Repair leaks.',
      'Replace the faulty sensor, valve or pump.'
    ],
    caution: null
  }
);
