/*
 * Diagnosis cases. Each has a customer complaint, a menu of tests with realistic results, and five
 * possible causes. `key: true` marks the tests that point to the answer. Figures are typical, for
 * practice. Real vehicles differ, so always use the manufacturer's workshop manual.
 */
export var CASES = [
  {
    id: 'slow-crank', fault: 'slow-crank', title: 'Slow cranking and clicking', level: 1,
    vehicle: 'Hatchback, petrol, 11 years old',
    complaint: 'The engine turns over slowly and sometimes only clicks. It is worse in the morning. The battery was replaced last month.',
    tests: [
      { id: 'look', group: 'Look first', label: 'Inspect the battery terminals and cables', mins: 5, result: 'The positive clamp is clean and tight. The earth cable end at the engine has green powdery corrosion under the insulation.', key: true },
      { id: 'vrest', group: 'Battery and charging', label: 'Battery voltage at rest', mins: 3, result: '12.5 V. The battery is about 75 percent charged.' },
      { id: 'vcrank', group: 'Battery and charging', label: 'Battery voltage while cranking', mins: 4, result: '8.6 V. This is low: it should stay above about 9.6 V.' },
      { id: 'load', group: 'Battery and charging', label: 'Battery load test', mins: 8, result: 'Passes: the new battery gives 95 percent of its rated cold-start current.' },
      { id: 'alt', group: 'Battery and charging', label: 'Charging voltage at 2,000 rpm', mins: 4, result: '14.3 V. The charging system is working.' },
      { id: 'dpos', group: 'Voltage drop', label: 'Voltage drop across the positive cable while cranking', mins: 6, result: '0.2 V. This is within the 0.3 V limit.' },
      { id: 'dneg', group: 'Voltage drop', label: 'Voltage drop across the earth cable while cranking', mins: 6, result: '1.1 V. This is far above the 0.2 V limit: the earth connection has high resistance.', key: true },
      { id: 'codes', group: 'Engine', label: 'Read the trouble codes', mins: 5, result: 'No codes are stored.' },
      { id: 'comp', group: 'Engine', label: 'Compression test', mins: 25, result: 'All four cylinders read about 12 bar. The engine is not binding.' },
      { id: 'startercur', group: 'Starter', label: 'Starter current draw', mins: 10, result: '135 A, which is normal for this engine.' }
    ],
    causes: ['A worn-out starter motor', 'A weak or faulty battery', 'High resistance in the earth cable connection', 'A seized engine', 'A faulty alternator'],
    answer: 2,
    why: 'A new battery that passes its load test, a healthy charging system, a good positive cable and normal compression leave the earth path. The 1.1 V drop across the earth cable shows corroded wire inside the insulation. The starter cannot get the current it needs, so it cranks slowly.',
    repair: 'Replace the earth cable, clean the contact faces and tighten them. Repeat the voltage drop test: it should now be under 0.2 V.',
    lessons: [['m09-l7', 'Voltage-drop testing'], ['m10-l10', 'Starting faults']]
  },
  {
    id: 'no-start-pump', fault: 'hard-starting-cranks', title: 'Cranks but will not start', level: 1,
    vehicle: 'Saloon, petrol injection, 8 years old',
    complaint: 'The engine cranks at normal speed but never fires. There is no humming from the back of the car when the key is turned on.',
    tests: [
      { id: 'fuel', group: 'Look first', label: 'Check the fuel level', mins: 1, result: 'Half a tank of fuel.' },
      { id: 'prime', group: 'Fuel', label: 'Listen for the fuel pump priming', mins: 2, result: 'Silence. The pump does not run when the key is turned on.', key: true },
      { id: 'press', group: 'Fuel', label: 'Measure fuel pressure at the rail', mins: 10, result: '0 bar with the key on. Normal is about 3.5 bar.' },
      { id: 'spark', group: 'Ignition', label: 'Check for spark', mins: 8, result: 'Strong blue spark on every cylinder.' },
      { id: 'rpm', group: 'Ignition', label: 'Look at the engine speed signal while cranking', mins: 5, result: 'The scan tool shows about 220 rpm while cranking, so the crankshaft sensor works.' },
      { id: 'fuse', group: 'Fuel circuit', label: 'Check the fuel pump fuse', mins: 4, result: 'The fuse is good.' },
      { id: 'volt', group: 'Fuel circuit', label: 'Voltage at the pump connector with the key on', mins: 12, result: '0 V. Nothing reaches the pump.' },
      { id: 'relay', group: 'Fuel circuit', label: 'Swap the pump relay with an identical relay from the same fuse box', mins: 6, result: 'The pump runs at once and the engine starts. Put the original relay on the bench and its coil is open circuit.', key: true },
      { id: 'codes', group: 'Engine', label: 'Read the trouble codes', mins: 5, result: 'P0230: fuel pump primary circuit. No other codes.' },
      { id: 'batt', group: 'Battery', label: 'Battery voltage', mins: 3, result: '12.6 V, which is fine.' }
    ],
    causes: ['A failed crankshaft sensor', 'A blocked fuel filter', 'A failed fuel pump relay', 'A weak battery', 'A failed ignition coil'],
    answer: 2,
    why: 'Spark and the engine speed signal are good, so ignition and sensors are fine. There is no fuel pressure and no voltage at the pump, though the fuse is good. Swapping in an identical relay made the pump run, and the old relay has an open coil.',
    repair: 'Fit a new relay of the correct type. Check that no other circuit fault killed the relay.',
    lessons: [['m06-l10', 'Petrol engine faults'], ['m09-l5', 'Magnetism, relays, solenoids and motors']]
  },
  {
    id: 'overheat', fault: 'engine-overheating', title: 'Engine overheats on the road', level: 2,
    vehicle: 'SUV, petrol, 9 years old',
    complaint: 'The temperature gauge climbs to hot after a few minutes of driving. The heater blows cold at first, then hot when the car is idling.',
    tests: [
      { id: 'level', group: 'Look first', label: 'Coolant level, cold', mins: 3, result: 'The reservoir is at MAX. No leaks are visible.' },
      { id: 'cap', group: 'Look first', label: 'Pressure-test the radiator cap', mins: 6, result: 'The cap holds the correct pressure of 1.1 bar.' },
      { id: 'fans', group: 'Cooling system', label: 'Check that the radiator fans run when hot', mins: 10, result: 'Both fans start at about 98 degrees and run correctly.' },
      { id: 'hoses', group: 'Cooling system', label: 'Feel the radiator hoses at the hot gauge reading', mins: 5, result: 'The upper hose is very hot and hard. The lower hose is only warm.', key: true },
      { id: 'thermo', group: 'Cooling system', label: 'Test the thermostat in a pan of heated water', mins: 20, result: 'The thermostat stays closed even at 100 degrees. It should open fully by about 95 degrees.', key: true },
      { id: 'gas', group: 'Cooling system', label: 'Test the coolant for combustion gas', mins: 8, result: 'The test fluid stays blue: no exhaust gas in the coolant.' },
      { id: 'belt', group: 'Cooling system', label: 'Check the water pump belt and shaft', mins: 6, result: 'The belt is tight. The pump shaft has no play and no noise.' },
      { id: 'rad', group: 'Cooling system', label: 'Inspect the outside of the radiator', mins: 5, result: 'The fins are clean and not blocked with dirt.' },
      { id: 'oil', group: 'Engine', label: 'Check the engine oil', mins: 3, result: 'The oil is the right level and is not milky.' }
    ],
    causes: ['A leaking head gasket', 'A failed radiator fan', 'A thermostat stuck closed', 'A failed water pump', 'A weak radiator cap'],
    answer: 2,
    why: 'The hot upper hose with the lukewarm lower hose shows coolant is not circulating through the radiator. The fans, cap, belt and pump are fine, and there is no gas in the coolant or milky oil. The thermostat failed the bench test.',
    repair: 'Replace the thermostat and its seal, refill with the right coolant mix, and bleed air from the system. Test drive and check the temperature.',
    lessons: [['m05-l6', 'Thermostat and temperature control'], ['m05-l7', 'Cooling and lubrication faults']]
  },
  {
    id: 'lean-code', fault: 'lean-code', title: 'Rough idle and a lean code', level: 2,
    vehicle: 'Hatchback, petrol injection, 7 years old',
    complaint: 'The engine light is on and the idle is rough. It runs smoother when revved.',
    tests: [
      { id: 'codes', group: 'Scan tool', label: 'Read the trouble codes', mins: 5, result: 'P0171: system too lean, bank 1.' },
      { id: 'trimidle', group: 'Scan tool', label: 'Fuel trims at idle', mins: 4, result: 'Long-term trim +24 percent. The computer is adding a great deal of fuel.', key: true },
      { id: 'trim2500', group: 'Scan tool', label: 'Fuel trims at 2,500 rpm', mins: 4, result: 'Long-term trim +5 percent. The problem almost disappears at higher revs.', key: true },
      { id: 'maf', group: 'Air', label: 'Mass air flow reading at idle', mins: 5, result: '3.2 grams per second, which is normal for this engine.' },
      { id: 'filter', group: 'Air', label: 'Inspect the air filter and intake pipe', mins: 5, result: 'The filter is clean. The pipe is fitted correctly.' },
      { id: 'smoke', group: 'Air', label: 'Smoke test the intake system', mins: 15, result: 'Smoke streams from a cracked vacuum hose behind the throttle body.', key: true },
      { id: 'press', group: 'Fuel', label: 'Fuel pressure at idle', mins: 10, result: '3.8 bar, which is within specification.' },
      { id: 'inj', group: 'Fuel', label: 'Injector balance test', mins: 20, result: 'All four injectors are within 4 percent of each other.' },
      { id: 'o2', group: 'Exhaust', label: 'Oxygen sensor signal', mins: 8, result: 'The sensor switches normally. It is correctly reporting a lean mixture.' }
    ],
    causes: ['A clogged fuel injector', 'A faulty mass air flow sensor', 'A weak fuel pump', 'An air leak in the intake system', 'A faulty oxygen sensor'],
    answer: 3,
    why: 'A big positive trim at idle that shrinks as revs rise is the classic sign of unmetered air. Air flow, fuel pressure, injectors and the oxygen sensor all read normal, and the smoke test found the leak.',
    repair: 'Replace the cracked vacuum hose, clear the codes and the learned adaptations, then check that the trims return to within about 10 percent.',
    lessons: [['m08-l10', 'Diagnosing with live data'], ['m08-l11', 'Emission and management faults']]
  },
  {
    id: 'spongy-brake', fault: 'spongy-brake-pedal', title: 'Soft brake pedal', level: 1,
    vehicle: 'Compact car, 6 years old, never had a brake fluid change',
    complaint: 'The brake pedal feels soft and goes down further than it used to. Pumping it makes it firmer.',
    tests: [
      { id: 'level', group: 'Look first', label: 'Brake fluid level', mins: 2, result: 'Between MIN and MAX. No sign of a leak at the master cylinder.' },
      { id: 'cond', group: 'Fluid', label: 'Check the fluid colour and moisture', mins: 4, result: 'The fluid is dark brown. The tester shows 4.1 percent water, well above the 3 percent replacement limit.', key: true },
      { id: 'hold', group: 'Pedal', label: 'Hold firm pressure on the pedal for 30 seconds', mins: 3, result: 'The pedal firms up with a second pump and then holds. It does not sink.', key: true },
      { id: 'leaks', group: 'Hydraulics', label: 'Inspect the pipes, hoses and calipers for leaks', mins: 15, result: 'Everything is dry. The hoses are not swollen.' },
      { id: 'pads', group: 'Friction parts', label: 'Measure pads and discs', mins: 15, result: 'Pads are 6 mm and the discs are within limits.' },
      { id: 'servo', group: 'Pedal', label: 'Test the servo with the engine off then on', mins: 5, result: 'The pedal drops slightly when the engine starts, as it should. The servo works.' },
      { id: 'bleed', group: 'Hydraulics', label: 'Open a bleed screw and watch the fluid', mins: 10, result: 'Dark fluid with bubbles of air comes out for several seconds.', key: true },
      { id: 'mc', group: 'Hydraulics', label: 'Check the master cylinder for external leaks', mins: 5, result: 'No leaks at the cylinder or the servo face.' }
    ],
    causes: ['A failed master cylinder seal', 'Air in the system and old, wet fluid', 'Worn brake pads', 'A failed brake servo', 'A leaking caliper'],
    answer: 1,
    why: 'The pedal holds under steady pressure, so there is no leak or master cylinder bypass. The servo works and the pads are fine. Wet, dark fluid and bubbles at the bleed screw explain the soft pedal.',
    repair: 'Bleed the whole system with fresh fluid of the correct grade until it runs clear and bubble-free, then test the pedal firmness and do a road test.',
    lessons: [['m19-l9', 'Brake faults and diagnosis'], ['m19-l6', 'Brake service in depth']]
  },
  {
    id: 'ac-warm', fault: 'ac-not-cold', title: 'Air conditioning is not cold', level: 2,
    vehicle: 'Hatchback, 6 years old, ambient temperature 32 degrees',
    complaint: 'The air conditioning has slowly got weaker over two summers. Now it only blows slightly cool.',
    tests: [
      { id: 'clutch', group: 'Look first', label: 'Does the compressor clutch engage?', mins: 3, result: 'It engages, but cycles on and off every few seconds.' },
      { id: 'filter', group: 'Look first', label: 'Cabin filter and airflow', mins: 5, result: 'The filter is clean and airflow at the vents is strong.' },
      { id: 'fan', group: 'Look first', label: 'Condenser fan', mins: 4, result: 'The fan runs when the A/C is switched on.' },
      { id: 'gauges', group: 'Gauges', label: 'Connect a manifold gauge set', mins: 15, result: 'Low side 14 psi and high side 135 psi at 32 degrees ambient. Both are lower than normal.', key: true },
      { id: 'vent', group: 'Gauges', label: 'Measure the vent temperature', mins: 5, result: '17 degrees at the vent. A healthy system gives around 6 to 8 degrees.' },
      { id: 'uv', group: 'Leak', label: 'UV dye leak check', mins: 20, result: 'A glowing dye trace at the condenser outlet fitting, where an old O-ring has hardened.', key: true },
      { id: 'valve', group: 'Gauges', label: 'Look for frost at the expansion valve', mins: 5, result: 'No frost. The pipe after the valve is only cool.' },
      { id: 'switch', group: 'Controls', label: 'Test the pressure switch', mins: 6, result: 'The switch changes state at the correct pressures.' },
      { id: 'blend', group: 'Controls', label: 'Blend door operation', mins: 8, result: 'The door moves fully from hot to cold.' }
    ],
    causes: ['A blocked expansion valve', 'A failed compressor', 'Low refrigerant from a leak', 'A stuck blend door', 'A failed condenser fan'],
    answer: 2,
    why: 'Low pressure on both gauges, short cycling and weak cooling mean the system has lost refrigerant. The dye trace shows where. A blocked valve would give very low suction pressure with frost, a bad compressor would raise the low side, and a failed fan would raise the high side.',
    repair: 'Recover any remaining refrigerant with proper equipment, replace the O-ring, replace the drier, evacuate the system, and recharge by weight with the correct refrigerant and oil. Only a certified person should do this.',
    lessons: [['m15-l7', 'Gauge diagnosis in depth'], ['m15-l3', 'Finding and repairing refrigerant leaks']]
  },
  {
    id: 'not-charging', fault: 'not-charging', title: 'Battery light on while driving', level: 2,
    vehicle: 'Saloon, diesel, 10 years old',
    complaint: 'The battery warning light came on while driving. Later the engine died and would not restart.',
    tests: [
      { id: 'belt', group: 'Look first', label: 'Drive belt condition and tension', mins: 4, result: 'The belt is intact and tight. It drives the alternator pulley without slipping.' },
      { id: 'vrun', group: 'Battery and charging', label: 'Battery voltage with the engine running', mins: 3, result: '12.1 V at 2,000 rpm. The battery is discharging, not charging.', key: true },
      { id: 'batt', group: 'Battery and charging', label: 'Battery test after charging it', mins: 30, result: 'The battery recovers and passes the load test. It is not the cause.' },
      { id: 'cable', group: 'Alternator', label: 'Voltage drop on the alternator output cable', mins: 6, result: '0.1 V, which is good.' },
      { id: 'earth', group: 'Alternator', label: 'Voltage drop on the alternator earth', mins: 6, result: '0.05 V. The earth is good.' },
      { id: 'fuse', group: 'Alternator', label: 'Charging fuse and fusible link', mins: 5, result: 'Continuity is good on both.' },
      { id: 'excite', group: 'Alternator', label: 'Voltage at the alternator warning light terminal with the key on', mins: 8, result: 'The terminal shows 1.5 V as it should: the field circuit is being supplied.' },
      { id: 'out', group: 'Alternator', label: 'Alternator output with a load tester', mins: 12, result: 'Close to zero current at 2,000 rpm. The alternator is not producing power.', key: true },
      { id: 'codes', group: 'Scan tool', label: 'Read the trouble codes', mins: 5, result: 'No relevant codes.' }
    ],
    causes: ['A slipping drive belt', 'A weak battery', 'A failed alternator or regulator', 'A blown fusible link', 'A corroded earth cable'],
    answer: 2,
    why: 'The belt turns the pulley, the battery recovers, and every cable, fuse and earth tests good. The excitation signal is present but the alternator produces no output, so the alternator or its regulator has failed.',
    repair: 'Replace or recondition the alternator, then check the charging voltage at 13.8 to 14.5 V and make sure the battery is fully charged.',
    lessons: [['m10-l7', 'Charging faults'], ['m10-l6', 'The alternator in depth']]
  },
  {
    id: 'intermittent-start', fault: 'electrical-intermittent', title: 'Dies and will not restart for a while', level: 3,
    vehicle: 'Saloon, petrol, 12 years old',
    complaint: 'The car runs perfectly for days, then dies or fails to start. After 15 or 20 minutes it starts again as if nothing happened.',
    tests: [
      { id: 'codes', group: 'Scan tool', label: 'Read the trouble codes', mins: 5, result: 'No current codes. A history code P0335, crankshaft sensor circuit, is stored.', key: true },
      { id: 'batt', group: 'Basics', label: 'Battery and charging system', mins: 8, result: 'Both are healthy.' },
      { id: 'immo', group: 'Basics', label: 'Immobiliser lamp behaviour', mins: 3, result: 'The lamp behaves normally when the key is turned on.' },
      { id: 'good_fuel', group: 'Cold start, working', label: 'Fuel pressure when the car starts normally', mins: 8, result: '3.7 bar, which is normal.' },
      { id: 'fail_wait', group: 'When it fails', label: 'Wait for a failure, then check fuel pressure', mins: 40, result: 'The failure happened on the third day. Fuel pressure is 3.7 bar, so fuel is fine.' },
      { id: 'fail_spark', group: 'When it fails', label: 'During the failure, check for spark', mins: 10, result: 'No spark at any cylinder.', key: true },
      { id: 'fail_rpm', group: 'When it fails', label: 'During the failure, read the engine speed signal while cranking', mins: 6, result: 'The scan tool shows 0 rpm while cranking: no signal from the crankshaft sensor.', key: true },
      { id: 'wiggle', group: 'When it fails', label: 'Wiggle the crankshaft sensor connector during the failure', mins: 6, result: 'The rpm signal returns and the engine starts at once. The connector pins are loose and have green corrosion.', key: true },
      { id: 'res', group: 'Sensor', label: 'Measure the sensor resistance when cool', mins: 8, result: '720 ohms, within specification. Heat or vibration may be what upsets it.' },
      { id: 'starter', group: 'Basics', label: 'Starter motor current', mins: 8, result: 'Normal.' }
    ],
    causes: ['A failing fuel pump', 'An immobiliser fault', 'A fault in the crankshaft sensor connection', 'A worn starter motor', 'A failing ignition coil'],
    answer: 2,
    why: 'During a failure fuel is fine but there is no spark, and there is no engine speed signal, so the computer will not fire the coils or injectors. Wiggling the connector restores the signal. An intermittent fault is often a connection, not a part.',
    repair: 'Clean and tighten the connector pins, or replace the connector. Secure the harness, then test after a heat soak and a bump test. Replace the sensor only if the signal is still unreliable.',
    lessons: [['m09-l9', 'Electrical fault finding'], ['m21-l2', 'Diagnostic case studies']]
  },
  {
    id: 'drifts-right', fault: 'brake-pull', title: 'Drifts right and a burning smell', level: 2,
    vehicle: 'Saloon, 9 years old',
    complaint: 'The car drifts to the right even without braking. There is a burning smell after a drive and the front right wheel is very hot.',
    tests: [
      { id: 'tyres', group: 'Look first', label: 'Tyre pressures and condition', mins: 5, result: 'Pressures are equal and the tyres are in good condition.' },
      { id: 'heat', group: 'Look first', label: 'Feel the wheels after a short drive (carefully)', mins: 5, result: 'The right front wheel is far hotter than the left front.', key: true },
      { id: 'spin', group: 'Brakes', label: 'Raise the wheel and spin it by hand', mins: 8, result: 'The right front wheel is hard to turn and drags with the pedal released.', key: true },
      { id: 'bleed', group: 'Brakes', label: 'Open the right front bleed screw and spin the wheel again', mins: 10, result: 'Some fluid escapes, but the wheel stays tight. The drag is not from trapped pressure.', key: true },
      { id: 'pins', group: 'Brakes', label: 'Remove the caliper and inspect the slide pins and piston', mins: 25, result: 'The slide pins are rusty and seized. The piston is stiff and the pad is worn on one side.' },
      { id: 'bearing', group: 'Wheel', label: 'Check the wheel bearing for play and noise', mins: 8, result: 'There is no play and no roughness.' },
      { id: 'align', group: 'Steering', label: 'Check the wheel alignment', mins: 25, result: 'Alignment is within limits.' },
      { id: 'abs', group: 'Scan tool', label: 'Read the ABS and brake codes', mins: 5, result: 'No codes are stored.' },
      { id: 'hose', group: 'Brakes', label: 'Check the flexible hose', mins: 6, result: 'The hose is firm and not swollen.' }
    ],
    causes: ['A wheel alignment fault', 'A collapsed brake hose', 'A worn wheel bearing', 'A seized caliper', 'A tyre pressure difference'],
    answer: 3,
    why: 'The hot right wheel that stays tight even with the bleed screw open means the friction parts are not releasing. Pressure is not trapped (which a collapsed hose would cause). The slide pins and piston were seized.',
    repair: 'Replace the caliper or recondition it with new slide pins and boots, and replace pads and discs as a pair on that axle. Bleed the system if it was opened and road test.',
    lessons: [['m19-l9', 'Brake faults and diagnosis'], ['m19-l5', 'Brake service']]
  },
  {
    id: 'abs-light', fault: 'abs-light', title: 'ABS and traction lights on', level: 2,
    vehicle: 'Hatchback, 8 years old',
    complaint: 'The ABS and traction control lights came on together. The brakes feel normal and the speedometer works.',
    tests: [
      { id: 'fluid', group: 'Look first', label: 'Brake fluid level', mins: 2, result: 'The fluid level is correct. The red brake light is off.' },
      { id: 'volt', group: 'Look first', label: 'Battery voltage', mins: 3, result: '12.6 V at rest and 14.2 V when running. Both are good.' },
      { id: 'codes', group: 'Scan tool', label: 'Read the ABS codes', mins: 5, result: 'C0035: left front wheel speed sensor circuit.', key: true },
      { id: 'live', group: 'Scan tool', label: 'Watch the wheel speeds on a slow drive', mins: 10, result: 'Front left shows 0 km/h while the other three read 20 km/h.', key: true },
      { id: 'look', group: 'Sensor', label: 'Inspect the left front sensor and wiring', mins: 12, result: 'The wire near the steering knuckle is rubbed through and the connector has corrosion.' },
      { id: 'res', group: 'Sensor', label: 'Measure the sensor resistance', mins: 6, result: 'Open circuit. A good sensor reads about 1 kilohm.', key: true },
      { id: 'ring', group: 'Sensor', label: 'Inspect the tone ring on the hub', mins: 10, result: 'The ring is clean and undamaged.' },
      { id: 'bearing', group: 'Wheel', label: 'Check the wheel bearing play', mins: 8, result: 'There is no play.' },
      { id: 'pump', group: 'Hydraulics', label: 'Run the ABS pump and valve test', mins: 8, result: 'The pump and valves work normally.' }
    ],
    causes: ['A failed ABS control module', 'Low battery voltage', 'A failed ABS hydraulic pump', 'A damaged left front wheel speed sensor circuit', 'A worn left front wheel bearing'],
    answer: 3,
    why: 'The code and the live data both point to the left front sensor circuit. The wire is rubbed through and the sensor reads open circuit. The ring, bearing, hydraulics, battery and module are all fine.',
    repair: 'Replace the sensor and repair or replace the damaged wiring with sleeving. Clear the codes, road test, and confirm the wheel speeds agree.',
    lessons: [['m19-l8', 'ABS, stability control and electronic brake systems in depth'], ['m12-l6', 'Scan-tool diagnosis']]
  }
];
