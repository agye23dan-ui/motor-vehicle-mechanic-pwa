/* Fault finder entries for Semester 2: electrical, batteries, charging, lighting, networks, hybrid and electric vehicles, air conditioning. */
(window.MVM.faults = window.MVM.faults || []).push(
  {
    id: 'slow-crank', mod: 'm10', lessons: ['m10-l8', 'm10-l10'], title: 'Engine cranks slowly',
    causes: [
      'Weak or discharged battery',
      'Loose or corroded battery terminals',
      'Poor earth strap from the battery to the body or engine',
      'Worn starter motor drawing too much current',
      'Engine oil too thick in cold weather, or a mechanical drag'
    ],
    diagnose: [
      'Check the battery voltage at rest. A charged battery reads about 12.6 V.',
      'Watch the voltage while cranking. It should stay above about 9.6 V.',
      'Measure the voltage drop across the positive cable and across the earth path while cranking. Anything over about 0.3 V and 0.2 V respectively is too high.',
      'Check the battery with a load or conductance tester.',
      'Measure the starter current and compare with the specification.'
    ],
    repair: [
      'Clean and tighten terminals, replace damaged cables or earth straps.',
      'Charge or replace the battery.',
      'Replace a starter motor that draws excessive current.',
      'Check the charging system before returning the vehicle.'
    ],
    caution: 'Battery gas is explosive. Keep sparks and flames away, and wear eye protection.'
  },
  {
    id: 'starter-click', mod: 'm10', lessons: ['m10-l9', 'm10-l10'], title: 'Click but no cranking',
    causes: [
      'Discharged battery',
      'Corroded terminals or a loose connection',
      'Faulty starter solenoid or worn contacts',
      'Seized starter motor or seized engine',
      'Faulty ignition switch or starter relay'
    ],
    diagnose: [
      'Switch on the headlamps. If they dim a lot or go out, the battery or connections are the problem.',
      'Measure the battery voltage and the drop across the cables while turning the key.',
      'Check for voltage at the solenoid signal terminal when the key is turned to start.',
      'If voltage is present but the starter does not turn, the starter is faulty.',
      'Try to turn the engine by hand with the correct tool to check it is not seized.'
    ],
    repair: [
      'Charge or replace the battery, or clean the connections.',
      'Replace the starter or solenoid.',
      'Replace a faulty relay or switch.'
    ],
    caution: 'Do not bridge the starter terminals with a screwdriver. Sparks and the car may lurch forward.'
  },
  {
    id: 'battery-keeps-flat', mod: 'm10', lessons: ['m10-l11', 'm10-l3'], title: 'Battery goes flat after standing',
    causes: [
      'Parasitic drain: a module that does not shut down, a light left on, or a faulty relay',
      'Old battery with a lost capacity',
      'Charging system fault',
      'Short trips that never recharge the battery',
      'Aftermarket accessories wired to a permanent live'
    ],
    diagnose: [
      'Test the battery condition and the alternator output.',
      'Wait for the vehicle to go to sleep (often 20 to 40 minutes), then measure the current drain with an ammeter in series. Above about 50 mA is high.',
      'Remove fuses one at a time and watch the current fall to find the circuit.',
      'Check for added accessories and warning lamps staying on.'
    ],
    repair: [
      'Repair the faulty circuit, relay, or module.',
      'Remove or rewire accessories correctly.',
      'Replace a weak battery.',
      'Advise the customer on regular longer drives, or a maintenance charger for long storage.'
    ],
    caution: null
  },
  {
    id: 'not-charging', mod: 'm10', lessons: ['m10-l5', 'm10-l7'], title: 'Battery warning light on, battery not charging',
    causes: [
      'Broken or slipping drive belt',
      'Faulty alternator or regulator',
      'Loose or corroded wiring to the alternator',
      'Blown fusible link or charge fuse',
      'Faulty battery sensor or engine computer control (on smart charging)'
    ],
    diagnose: [
      'Check the belt and the alternator pulley rotates with the engine.',
      'Measure the battery voltage with the engine running. A good system gives about 13.8 to 14.5 V.',
      'Check the voltage drop on the output cable and the earth.',
      'Check the fuses and the supply to the field circuit.',
      'Read the codes and live data for smart charging systems.'
    ],
    repair: [
      'Replace the belt or tensioner.',
      'Repair the wiring or fuse.',
      'Replace or recondition the alternator.',
      'Test the battery, which may have been damaged by deep discharge.'
    ],
    caution: 'Never disconnect the battery to test the alternator with the engine running. It can destroy the electronics.'
  },
  {
    id: 'bulb-keeps-blowing', mod: 'm11', lessons: ['m11-l1', 'm11-l2'], title: 'Lamps burn out repeatedly',
    causes: [
      'Over-voltage from a faulty regulator',
      'Poor earth causing high resistance and voltage spikes',
      'Vibration, or loose bulb holders',
      'Wrong or low-quality bulbs',
      'Moisture getting into the lamp unit'
    ],
    diagnose: [
      'Measure the charging voltage. Over about 14.8 V is too high.',
      'Check the voltage at the lamp and the earth drop.',
      'Check the holder for burning or loose pins.',
      'Check the lens for water.'
    ],
    repair: [
      'Replace a faulty regulator or alternator.',
      'Repair the earth and clean the holder.',
      'Fit the correct bulbs, without touching glass of halogen bulbs.',
      'Reseal or replace a leaking lamp.'
    ],
    caution: null
  },
  {
    id: 'dim-headlamps', mod: 'm11', lessons: ['m11-l3', 'm09-l7'], title: 'Dim headlamps',
    causes: [
      'Corroded connector or poor earth',
      'Low charging voltage or a weak battery',
      'Dirty or misted lens',
      'Faulty relay or switch contact with high resistance',
      'Ageing bulbs'
    ],
    diagnose: [
      'Measure the voltage at the lamp with it on and compare with the battery voltage.',
      'Do a voltage drop test across each part: fuse, relay, switch and earth.',
      'Inspect the reflector and the lens.'
    ],
    repair: [
      'Clean or replace connectors and repair the earth.',
      'Replace a faulty relay or switch.',
      'Restore the lens or replace the lamp.'
    ],
    caution: null
  },
  {
    id: 'blown-fuse-repeat', mod: 'm09', lessons: ['m09-l3', 'm09-l9'], title: 'A fuse keeps blowing',
    causes: [
      'Short circuit to earth, from chafed insulation',
      'Faulty component drawing too much current',
      'Wrong fuse rating fitted',
      'Water in a connector',
      'Damage after an accident or repair'
    ],
    diagnose: [
      'Find the circuit from the wiring diagram and note what it supplies.',
      'With the fuse removed, measure the resistance from the supply wire to earth. It should not be near zero.',
      'Disconnect loads one at a time until the short disappears.',
      'Wiggle the wiring harness and look for chafing near brackets and body edges.'
    ],
    repair: [
      'Repair or replace the damaged wire and protect it with sleeving.',
      'Replace the faulty component.',
      'Fit only the correct fuse rating.'
    ],
    caution: 'Never fit a larger fuse or a wire in place of a fuse. It can cause a fire.'
  },
  {
    id: 'window-not-working', mod: 'm11', lessons: ['m11-l7'], title: 'Power window does not work',
    causes: [
      'Blown fuse or faulty relay',
      'Faulty switch',
      'Worn motor or regulator mechanism',
      'Broken wiring in the door jamb',
      'Module not initialised after battery work'
    ],
    diagnose: [
      'Check whether other windows work and whether the master switch works.',
      'Listen for the motor. Click without movement points to the regulator.',
      'Check for voltage at the motor when the switch is pressed.',
      'Check the wiring in the door boot for breaks.'
    ],
    repair: [
      'Replace the fuse, switch, motor or regulator as the test shows.',
      'Repair the wiring.',
      'Reinitialise the window (learn the end stops) as the manual says.'
    ],
    caution: 'Disconnect the battery and wait before working inside the door near airbag wiring.'
  },
  {
    id: 'wipers-not-working', mod: 'm11', lessons: ['m11-l7'], title: 'Wipers slow, stuck or not working',
    causes: [
      'Blown fuse or faulty relay',
      'Seized linkage or worn motor',
      'Faulty switch or intermittent wiper module',
      'Worn blades',
      'Loose arm on its spindle'
    ],
    diagnose: [
      'Check the fuse and the relay.',
      'Check the supply and earth at the motor.',
      'Disconnect the linkage and check that it moves freely by hand.',
      'Check the park switch and the speed settings.'
    ],
    repair: [
      'Lubricate or replace linkage, bushes or the motor.',
      'Replace a faulty switch or relay.',
      'Fit new blades and set the park position correctly.'
    ],
    caution: null
  },
  {
    id: 'no-communication-scan', mod: 'm12', lessons: ['m12-l8', 'm12-l6'], title: 'Scan tool cannot communicate with a module',
    causes: [
      'Blown fuse for the module or the diagnostic socket',
      'Open or shorted network wires',
      'Missing power or earth at the module',
      'Low battery voltage',
      'Faulty module or software',
      'Wrong protocol or vehicle selected on the tool'
    ],
    diagnose: [
      'Check the battery voltage and the socket power, earth, and communication pins.',
      'Check the fuse and relay for the module.',
      'Measure the resistance between the CAN high and CAN low pins with the power off. A healthy network reads about 60 ohms.',
      'Unplug modules one at a time to find one that is disturbing the network.',
      'Check that the tool software is up to date.'
    ],
    repair: [
      'Repair the wires or connectors, and replace blown fuses.',
      'Replace the faulty module and program it as required.',
      'Update the tool software.'
    ],
    caution: null
  },
  {
    id: 'many-warning-lights', mod: 'm12', lessons: ['m12-l8'], title: 'Many warning lights on at once',
    causes: [
      'Low battery voltage or a weak charging system',
      'Network fault or module losing communication',
      'Poor earth connection',
      'Water in a connector or a module',
      'Recent repair, with a connector left off'
    ],
    diagnose: [
      'Measure the battery voltage with the engine off and running.',
      'Read codes in every module. Look for communication loss codes, which point to a network problem.',
      'Check the main earths and connectors near recent work.',
      'Check the fuse boxes for water.'
    ],
    repair: [
      'Repair the charging fault or the earth connection.',
      'Repair the network wiring or replace the module that has failed.',
      'Clear codes and test drive.'
    ],
    caution: null
  },
  {
    id: 'ev-wont-charge', mod: 'm13', lessons: ['m13-l7', 'm13-l5'], title: 'Electric vehicle will not charge',
    causes: [
      'Charge cable or wall unit fault',
      'Dirty or damaged charge port',
      'Charge port locked by the vehicle',
      'Low-voltage (12 V) battery too weak',
      'Fault in the on-board charger',
      'Battery system fault or temperature outside the safe range'
    ],
    diagnose: [
      'Try a different charge point and cable. Check any indicator lamps.',
      'Look at the charge port for damage, dirt or water, without touching the high-voltage parts.',
      'Check the 12 V battery voltage, since the vehicle needs it to start the charge process.',
      'Read the codes with the correct scan tool.',
      'If high-voltage parts need checking, stop and refer to a qualified high-voltage technician.'
    ],
    repair: [
      'Replace the cable or repair the charge point.',
      'Clean the port with the method the maker gives.',
      'Replace the 12 V battery.',
      'High-voltage repairs are done only by trained and authorised staff.'
    ],
    caution: 'Never touch orange high-voltage cables or components unless you are trained, the system is isolated and tested dead, and the manual is followed.'
  },
  {
    id: 'hybrid-warning', mod: 'm13', lessons: ['m13-l10', 'm13-l4'], title: 'Hybrid system warning light or reduced power',
    causes: [
      'High-voltage battery cells out of balance or overheating',
      'Cooling fault for the battery or inverter',
      'Insulation fault between high-voltage and the body',
      '12 V battery weak',
      'Sensor, relay or contactor fault'
    ],
    diagnose: [
      'Read all codes with the correct tool and note the freeze frame data.',
      'Check the 12 V battery and the cooling fans and filters for the battery.',
      'Do not open or test high-voltage parts unless trained.',
      'Refer insulation and battery faults to a trained technician.'
    ],
    repair: [
      'Clean or replace cooling filters and repair cooling faults.',
      'Replace the 12 V battery if weak.',
      'Battery and inverter repairs follow the maker procedure by a qualified person.'
    ],
    caution: 'High-voltage systems can kill. Do not work on them without training and the correct protective equipment.'
  },
  {
    id: 'ac-not-cold', mod: 'm15', lessons: ['m15-l6', 'm15-l7'], title: 'Air conditioning blows warm air',
    causes: [
      'Low refrigerant from a leak',
      'Compressor clutch not engaging: fuse, relay, pressure switch or clutch gap',
      'Condenser fan not working or the condenser blocked',
      'Blocked expansion valve or orifice tube',
      'Blend door stuck on hot',
      'Failed compressor',
      'Cabin filter blocked, weak airflow'
    ],
    diagnose: [
      'Check that the compressor clutch engages when A/C is switched on.',
      'Check the fans, the condenser for dirt, and the cabin filter.',
      'Connect a manifold gauge set and read the low-side and high-side pressures against the temperature chart.',
      'Measure the temperature at the vents and compare with ambient.',
      'Use a leak detector (UV dye or electronic) to find a leak.',
      'Check that the blend door moves correctly.'
    ],
    repair: [
      'Repair the leak, replace the receiver drier, evacuate the system, and recharge by weight with the correct refrigerant and oil.',
      'Replace the relay, switch, clutch or compressor as found.',
      'Clean the condenser and replace the cabin filter.'
    ],
    caution: 'Refrigerant must be recovered with proper equipment by a certified person. Never vent it. Liquid refrigerant causes frostbite, so wear eye protection and gloves.'
  },
  {
    id: 'ac-cycling-fast', mod: 'm15', lessons: ['m15-l7'], title: 'A/C compressor cycles on and off rapidly',
    causes: [
      'Low refrigerant charge',
      'Moisture or freezing at the evaporator',
      'Faulty pressure switch',
      'Poor airflow over the evaporator',
      'Faulty temperature sensor or control'
    ],
    diagnose: [
      'Check the gauge pressures. A low low-side reading that swings suggests a low charge.',
      'Check the evaporator airflow and the cabin filter.',
      'Check the pressure switch operation and the signals on the scan tool.',
      'Look for ice on the evaporator pipe.'
    ],
    repair: [
      'Repair the leak and recharge correctly.',
      'Replace the drier if moisture is the cause.',
      'Replace the faulty switch or sensor.'
    ],
    caution: null
  },
  {
    id: 'ac-smell', mod: 'm15', lessons: ['m15-l9', 'm15-l10'], title: 'Bad smell from the air vents',
    causes: [
      'Mould and bacteria on the evaporator',
      'Blocked evaporator drain, holding water',
      'Dirty cabin filter',
      'Leaking heater matrix (sweet smell)',
      'Dead animal or debris in the air box'
    ],
    diagnose: [
      'Smell with A/C off and with A/C on, and with fresh air versus recirculation.',
      'Check that the evaporator drain is open and water drips under the car after use.',
      'Inspect the cabin filter and the air intake.',
      'Check for damp carpet or fogging, which suggest a heater matrix leak.'
    ],
    repair: [
      'Clean the evaporator with an approved cleaner, clear the drain, and replace the filter.',
      'Replace a leaking matrix.',
      'Advise the customer to turn off A/C a minute before arrival to dry the evaporator.'
    ],
    caution: null
  },
  {
    id: 'heater-cold', mod: 'm15', lessons: ['m15-l8', 'm15-l10'], title: 'No heat from the heater',
    causes: [
      'Low coolant level',
      'Thermostat stuck open',
      'Blocked heater matrix',
      'Blend door actuator fault or a broken door',
      'Air trapped in the system',
      'Heater control valve stuck closed'
    ],
    diagnose: [
      'Check the coolant level when cold and the engine temperature.',
      'Feel the two heater hoses when the engine is hot. Both should be hot.',
      'One hot and one cool hose means a blocked matrix. Both cool may mean no flow or air.',
      'Listen to and watch the blend door while changing temperature.'
    ],
    repair: [
      'Top up and bleed the system.',
      'Replace the thermostat or actuator.',
      'Flush or replace the heater matrix.'
    ],
    caution: 'Do not open the cooling system when hot.'
  },
  {
    id: 'ac-noise', mod: 'm14', lessons: ['m14-l4', 'm14-l5'], title: 'Noise from the A/C compressor',
    causes: [
      'Worn compressor bearings or internal parts',
      'Low oil or refrigerant',
      'Loose mounting bolts',
      'Worn clutch or clutch bearing',
      'Drive belt problems'
    ],
    diagnose: [
      'Listen with A/C on and off. A noise that changes with the clutch is from the compressor.',
      'Check the mounting bolts and belt.',
      'Check the clutch air gap and the pulley bearing.',
      'Check the pressures and the oil.'
    ],
    repair: [
      'Tighten the mount.',
      'Replace the clutch or the compressor.',
      'When a compressor fails, flush the system, replace the drier and expansion device and refill with the correct oil.'
    ],
    caution: null
  },
  {
    id: 'electrical-intermittent', mod: 'm09', lessons: ['m09-l9', 'm09-l7'], title: 'Intermittent electrical fault',
    causes: [
      'Loose, corroded or bent connector pins',
      'Chafed wiring that touches the body at times',
      'Poor earth',
      'Failing relay or switch',
      'Heat or vibration effects on a solder joint or sensor'
    ],
    diagnose: [
      'Ask when it happens: hot, cold, wet, over bumps.',
      'Check for stored codes and freeze frame data.',
      'Wiggle the harness and connectors while monitoring the signal or the voltage.',
      'Log data over a road test.',
      'Test voltage drops across the connectors and earths.'
    ],
    repair: [
      'Clean and tighten the connector; replace damaged pins.',
      'Repair the wiring with correct crimps or solder with heat shrink.',
      'Replace the faulty relay or switch.'
    ],
    caution: null
  },
  {
    id: 'horn-not-working', mod: 'm11', lessons: ['m11-l5'], title: 'Horn does not work',
    causes: [
      'Blown fuse or faulty relay',
      'Faulty horn unit or corroded connector',
      'Clock spring or steering wheel switch fault',
      'Poor earth'
    ],
    diagnose: [
      'Listen for the relay click when the horn is pressed.',
      'Check for voltage at the horn when pressed.',
      'Check the earth of the horn.',
      'If there is no signal at the switch, suspect the clock spring.'
    ],
    repair: [
      'Replace the fuse, relay or horn.',
      'Clean the earth and connector.',
      'Replace the clock spring, following the airbag precautions.'
    ],
    caution: 'The clock spring is part of the airbag system. Follow the airbag safety procedure before working there.'
  },
  {
    id: 'central-locking', mod: 'm11', lessons: ['m11-l6'], title: 'Central locking or key fob not working',
    causes: [
      'Key fob battery low',
      'Door lock actuator failure',
      'Wiring break in the door jamb',
      'Body control module fault',
      'Interference or the fob needing reprogramming'
    ],
    diagnose: [
      'Try the spare key and check the fob battery.',
      'Check whether all doors or only one fails.',
      'Listen for the actuators and check for power at the actuator.',
      'Read the codes in the body module.'
    ],
    repair: [
      'Replace the fob battery or reprogram the key.',
      'Replace the actuator or repair the wiring.',
      'Replace and program a faulty module.'
    ],
    caution: null
  },
  {
    id: 'gauge-wrong', mod: 'm12', lessons: ['m12-l6', 'm11-l8'], title: 'Instrument gauge reads wrongly',
    causes: [
      'Faulty sender or sensor',
      'Wiring fault or poor earth',
      'Faulty instrument cluster',
      'Network signal missing or wrong',
      'Real fault (for example a real overheating condition)'
    ],
    diagnose: [
      'Compare the gauge with the scan tool data for the same value.',
      'If the scan tool is right, the cluster or its supply is at fault.',
      'If the scan tool agrees with the gauge, test the sensor and its wiring.',
      'Check the cluster self-test if the vehicle has one.'
    ],
    repair: [
      'Replace the sensor or repair the wiring.',
      'Replace or repair the cluster and program it.'
    ],
    caution: null
  }
);
