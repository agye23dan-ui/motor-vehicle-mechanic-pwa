# Course content specification

This file tells whoever writes a module (`data/modules/mNN.js`) exactly what to produce.
Every module is checked by `node tests/validate.js`. A module is not finished until the validator passes with no errors.

## What the course is

A study app for students on a **Motor Vehicle Mechanic** programme: people learning to diagnose, service and repair cars and light vehicles, including engines, fuel and emission systems, auto electrical and electronics, hybrid and electric vehicles, car air conditioning, transmissions, steering, suspension, brakes and body systems.

The structure follows the Red Seal Automotive Service Technician standard (Canada), blocks A to H, cross-checked against the Australian and UK light vehicle qualifications. Topics are regrouped into 21 modules in `data/course.js`. **Do not copy text from those documents.** They list tasks, not teaching text. Write original lessons from standard technical knowledge.

Readers are vocational and technical students, many studying on a phone, many with English as a second or third language, many working with older and second-hand vehicles in mixed conditions. Write for them.

## Voice and style

- Plain English. Short sentences. One idea per sentence. Define every technical term the first time it appears, in bold: `**camshaft**`.
- Speak to the reader as "you" when giving instructions ("Chock the wheels and disconnect the battery").
- Use SI and common workshop units: V, A, Ω, W, kPa, bar, psi (give both bar and psi for pressures), N·m (and lbf·ft when helpful), mm, °C, L, rpm. Use symbols: Ω µ × ÷ ° ² ³ ≈ ≤ ≥ √ and arrows → where useful.
- Vehicles differ by region: left-hand and right-hand drive, petrol called gasoline, bonnet and hood, tyre and tire. Use British-style spelling (tyre, bonnet, petrol, earth) and give the other term once in brackets when it first appears in a module (for example "bonnet (hood)", "earth (ground)"). Many learners work on used imports from Europe, Asia and North America, so say when systems differ by market.
- Do not mention brand names or model numbers as authority. Generic examples only. Do not invent part numbers, trouble codes beyond the standard generic OBD-II format (P0xxx style meaning), statistics or manufacturer specifications. When a figure varies between vehicles, say so ("typically 12.6 V at rest; check the workshop manual").
- Always say **check the manufacturer's workshop manual** when a procedure, torque, clearance, capacity or specification depends on the vehicle.
- Safety content must be correct and conservative. Vehicles on lifts and stands, hot engines and exhausts, fuel and fire, battery acid and hydrogen, stored energy in springs, airbags and seat-belt pretensioners, refrigerant, 12 V and 48 V and high-voltage hybrid and electric vehicle systems, brake fluid and dust, asbestos in old friction parts, running engines and carbon monoxide all appear in this trade. Never suggest working under a vehicle supported only by a jack, bypassing a safety device, working on high-voltage systems without the correct training and isolation, venting refrigerant to air, or testing airbag circuits with a test lamp or ohmmeter.
- Environmental rules: used oil, coolant, brake fluid, batteries, tyres and refrigerant are hazardous waste. Refrigerant must be recovered by a trained person with proper equipment (many countries require certification). Say so where relevant.
- No filler, no hype, no motivational padding. Every sentence should teach something or help the reader do something.
- Regional examples are welcome when they genuinely help (for example dust, heat, bad fuel quality and rough roads, or mobile-money payment for repairs), but the content must stay valid anywhere.

## Inline markup

Inside any text string you may use only:

- `**bold**` for a term being defined or a key warning word.
- `` `code` `` for commands, values typed into a machine, or formulas inline.

No HTML. No Markdown links, headings, or lists inside strings. Do not write the characters `<` or `>` as part of tags. The comparison symbols are fine when surrounded by spaces (`V > 5 V`).

## File shape

One file per module. It must register itself like this and use plain ES5-compatible JavaScript data only (no functions, no template literals needed, but they are allowed for multi-line strings; no imports):

```js
MVM.registerModule({
  id: 'm03',
  summary: 'One sentence, 15 to 35 words, saying what the learner will be able to do.',
  outcomes: [ 'Explain ...', 'Calculate ...' ],          // 5 or 6, each starts with a verb
  cheatsheet: [ 'Short fact to memorise ...' ],          // 6 to 10 facts, each under 140 characters
  lessons: [ /* 8 to 12 lessons */ ],
  practical: { /* one practical task sheet */ },
  quiz: [ /* 45 or more questions */ ],
  cards: [ /* 40 or more flashcards */ ]
});
```

Do not add `title`, `area` or `syllabus`. They come from `data/course.js`.

### Lessons

```js
{
  id: 'm03-l1',                // module id + '-l' + number, numbered from 1 with no gaps
  title: 'Voltage, current and resistance',
  minutes: 8,                  // honest reading time, 5 to 15
  body: [ /* blocks, see below */ ]
}
```

Each lesson is **600 to 1,200 words** of reading text (words in blocks count); the validator fails a lesson under 300 words and warns under 500. A module's lessons together must be at least **5,500 words** (the course is three semesters, about 7,000 words per module).

Block types (the `t` field):

| Block | Fields | Use |
|---|---|---|
| paragraph | `{ t: 'p', text: '...' }` | Normal text. Keep to 1 to 4 sentences. |
| subheading | `{ t: 'h', text: '...' }` | Splits a lesson into sections. Use 2 to 4 per lesson. |
| bullet list | `{ t: 'ul', items: ['...', '...'] }` | Unordered points. Items are short. |
| numbered list | `{ t: 'ol', items: ['...', '...'] }` | Only for real sequences (procedures). |
| callout | `{ t: 'note', kind: 'safety' \| 'tip' \| 'key', text: '...' }` | `safety` for hazards and mandatory precautions, `tip` for workshop know-how, `key` for the one thing to remember. |
| table | `{ t: 'table', head: ['A', 'B'], rows: [['..', '..']], caption: '...' }` | Compare things or map symptom to cause. Every row has the same number of cells as `head`. Max 5 columns. |
| formula | `{ t: 'formula', text: 'V = I × R', caption: 'Ohm\'s law' }` | A formula or worked line shown large. `caption` optional. |
| worked example | `{ t: 'example', title: '...', steps: ['...', '...'] }` | A calculation or procedure worked step by step with real numbers. Check the arithmetic twice. |
| diagram | `{ t: 'diagram', name: 'ohm-triangle' }` | One of the prepared diagrams listed below. Only use a diagram in the lesson indicated for it. |

Every module must contain at least one `safety` note. Every lesson must contain at least one `key` or `tip` note. Every lesson must start with a `p` block that says what the lesson covers in the first sentence.

Prepared diagrams (already drawn; refer to them as "the diagram", never as an image). The names and the module each may appear in are in `data/course.js` under `diagrams`, and the drawings are in `js/diagrams/`. **A diagram may be used only in the module(s) listed for it.** Use each diagram assigned to your module exactly once, in the lesson indicated in the outline below, usually right after the paragraph that introduces the idea. Write the surrounding text so it makes sense with the drawing beside it, but do not depend on reading labels from it.

### Practical task sheet

A hands-on exercise the learner does in the workshop. Written so a student can follow it without an instructor reading over their shoulder, and safe to do on a training vehicle or a bench rig.

```js
practical: {
  title: 'Measure and record ...',
  objective: 'One or two sentences.',
  time: '45 minutes',
  tools: [ 'Digital multimeter', ... ],        // 3 or more
  safety: [ 'Chock the wheels ...', ... ],   // 4 or more, specific to this task
  steps: [ 'Step text', ... ],                 // 8 to 14 steps, each one action
  checks: [ 'I can state ...', ... ]           // 4 to 6 self-check statements, "I can ..."
}
```

### Quiz questions

```js
{
  id: 'm03-q01',              // module id + '-q' + two digits, numbered from 01 with no gaps
  q: 'Question text, ending with a question mark or a colon.',
  options: ['A', 'B', 'C', 'D'],   // exactly 4, each under 140 characters
  answer: 2,                  // index 0 to 3 of the correct option
  level: 2,                   // 1 recall, 2 understanding, 3 apply or diagnose
  lesson: 'm03-l3',           // the lesson that teaches this
  explain: 'Why the answer is right and why the most tempting wrong answer is wrong. 1 to 3 sentences.'
}
```

Rules for good questions:

- At least 30 per module. Level mix: about 30% level 1, 45% level 2, 25% level 3.
- At least a third must be **scenario or calculation** questions: a machine with a symptom, a measurement to interpret, a short calculation, a choice of next step.
- Four plausible options. A wrong option should be something a real student might believe, not a joke. No "all of the above" or "none of the above". No options that differ only by one word unless that word is the point.
- Only one option is correct. Be careful: if two could be defended, rewrite.
- Spread the correct answer across positions. Across a module, each of A, B, C, D should be correct for 15% to 35% of the questions.
- Do not give away the answer through length. The correct option should not systematically be the longest.
- Numbers must be right. Work every calculation out and include units. Prefer clean values.
- Cover every lesson at least three times.
- No two questions may test the same fact in the same way.
- Do not refer to "the lesson", "the text" or "the diagram" in a question. Questions must stand alone.

### Flashcards

```js
{ id: 'm03-c01', front: 'Term or question', back: 'Short, exact answer', lesson: 'm03-l2' }
```

- At least 24 per module, ids numbered from 01 with no gaps.
- Front under 140 characters. Back under 260 characters. The back is the answer only; no lecture.
- Mix definitions, "what does X do", "what is the formula", "what is the typical value", and symptom → likely cause cards.
- One fact per card. Do not duplicate quiz questions word for word.

## Module outlines

Each module needs the lessons listed here (you may split or merge slightly, but cover every point, and keep 8 to 12 lessons; the list below is the minimum core, and further lessons deepen it with worked examples, procedures and fault tables). The practical is suggested; adapt it to be safe and realistic for a training workshop. "Diagram" lines say where each assigned drawing goes.

### m01 Workshop safety, lifting and professional conduct
1. Workshop hazards and risk: moving and hot parts, exhaust gas and carbon monoxide, fuel vapour, noise, pits and ramps, slips and trips, compressed air. Hazard vs risk. Hierarchy of controls. PPE for each task.
2. Lifting vehicles safely: jack types, trolley jack never for support, axle stands, two-post and scissor lifts, lifting points, chocking wheels, weight and balance, checking a lift before use, what to do if a vehicle moves. Diagram `lift-points`.
3. Fire, fuel and fluids: fuel handling and vapour, fire triangle, extinguisher types (including electrical and fuel fires), hot work near fuel tanks, spill response, battery acid and hydrogen gas, brake fluid, coolant, oils and skin contact.
4. Electrical and stored-energy safety: disconnecting the battery, 12 V short-circuit burns, rings and watches, airbag and pretensioner caution, compressed springs, 48 V and high-voltage warning, only trained people isolate HV systems.
5. Environment and waste: used oil, coolant, filters, tyres, batteries, refrigerants, solvents, brake dust and asbestos in old friction parts, safety data sheets, spill kits, legal disposal and recycling.
6. Professional conduct and customers: honest advice, written authority for work, protecting seat covers and carpets, test-drive rules and licence, customer property, communication, handling complaints, keeping skills up to date, mentoring juniors.
Practical: workshop safety inspection and safe lift of a vehicle onto stands on level ground, with chocks and a spotter.

### m02 Tools, measuring and technical information
1. Hand tools and fastener basics: spanners, sockets and ratchets, extensions, screwdriver types, pliers, hammers and punches, pullers, thread pitch and size, metric and imperial, damaged fasteners and how to free them.
2. Power and workshop equipment: air and electric impact tools, bench grinder, drill, press, parts washer, battery charger, compressor, trolley jack and engine hoist, care and inspection of each.
3. Measuring tools: steel rule, vernier calliper, micrometer, dial gauge, feeler gauges, straight edge, torque wrench, pressure and vacuum gauges, compression and leak-down testers. Diagram `micrometer-reading`.
4. Torque and tightening: why torque matters, threads and stretch, tightening sequence and stages, torque-plus-angle, thread locker and lubricant effects, re-using bolts, common mistakes. Diagram `tightening-sequence`.
5. Technical information: workshop manuals, wiring diagrams, parts catalogues, service bulletins, VIN and vehicle identification plates, reading specifications and tolerances, digital information systems, scan tool basics.
6. Measuring and calculating: metric prefixes and conversion, tolerance, percentages, compression ratio, gear and pulley ratios, fuel consumption, torque and power relationships, rounding.
Practical: use a micrometer, calliper and feeler gauges to measure parts, read a torque spec and tighten a flange in the correct sequence.

### m03 Routine servicing and vehicle inspection
1. Service schedules and inspection: service intervals by distance and time, severe-use conditions (dust, heat, short trips), job cards, a systematic inspection order, recording findings with traffic-light ratings.
2. Under the bonnet: layout and identifying components, fluid checks and levels (engine oil, coolant, brake fluid, power-steering, washer), oil viscosity grades and specifications in plain terms, topping up vs changing. Diagram `underbonnet-layout`.
3. Oil and filter service: warm-engine drain, filter types, sump plug washers and torque, correct oil quantity, resetting service indicators, leaks check, disposal. Air, fuel and cabin filters.
4. Tyres and wheels: tyre markings, load and speed ratings, tread depth and wear patterns, pressures, rotation, wheel nuts and torque sequence, spare wheel, repair limits. Diagram `tyre-markings`.
5. Belts, hoses, lights and wipers: inspecting drive belts, hoses, coolant and oil leaks, light and wiper checks, battery and terminal check, brake and steering visual checks.
6. Road test and handover: pre- and post-test checks, what to listen and feel for, test-route safety, explaining findings to the customer, recording work done and next service date.
Practical: complete a basic service and inspection on a vehicle with a written job card.

### m04 Engine construction and the four-stroke cycle
1. How an engine converts energy: combustion, pressure on the piston, crankshaft rotation, petrol vs diesel in outline, engine layouts (inline, V, flat), cylinder numbering, firing order, displacement and compression ratio calculations.
2. The four-stroke cycle: intake, compression, power, exhaust, valve events and overlap, why four strokes, two-stroke contrast briefly. Diagram `four-stroke-cycle`.
3. Engine block assembly: block, cylinder liners, head, head gasket, pistons, rings, gudgeon pin, connecting rod, crankshaft, bearings, flywheel, sump, materials. Diagram `engine-cross-section`.
4. Valvetrain: camshaft, lifters and hydraulic tappets, valves and springs, rocker arms, overhead cam and pushrod layouts, valve clearance, variable valve timing in outline.
5. Timing drives: timing belt vs chain, tensioners and idlers, timing marks, interference engines and the risk of a broken belt, replacement intervals, water pump on the belt. Diagram `timing-belt-drive`.
6. Engine removal, dismantling and inspection basics: noting and labelling, cleaning, measuring wear, gasket and sealant use, cylinder head checks for flatness and cracks, reassembly cleanliness.
Practical: identify engine parts on a cut-away or stripped engine and measure cylinder bore wear and crank journal sizes against specification.

### m05 Lubrication, cooling and mechanical engine diagnosis
1. Lubrication system: oil pump types, pressure relief valve, filter bypass, oil galleries, bearings and oil film, oil functions (lubricate, cool, clean, seal), oil pressure warning and what low pressure means. Diagram `oil-circuit`.
2. Oil, wear and contamination: viscosity, additives, oil degradation, fuel or coolant in oil, sludge, wear metals in plain terms, PCV system overview, oil consumption.
3. Cooling system: coolant, radiator, water pump, hoses, expansion tank and pressure cap, fan types, heater circuit, why antifreeze mixture matters, boiling point and pressure. Diagram `cooling-circuit`.
4. Thermostat and temperature control: wax thermostat operation, opening temperatures, stuck open and stuck closed symptoms, temperature sensors and gauge, fan control. Diagram `thermostat-operation`.
5. Cooling and lubrication faults: overheating causes, bleeding air, pressure testing, combustion gas in coolant, head gasket failure signs, low oil pressure diagnosis, leaks.
6. Mechanical diagnosis: compression test and reading results, wet test, leak-down test, vacuum gauge readings, engine noises (knock, tap, rattle), smoke colours, a systematic approach.
Practical: perform and record a compression test and a cooling-system pressure test, and interpret the results.

### m06 Petrol fuel, ignition and air intake
1. Air and fuel needs: stoichiometric ratio, rich and lean, air filter, throttle, intake manifold, mass airflow and manifold pressure sensing in outline. Diagram `air-fuel-ratio`.
2. Petrol fuel system: tank, pump, filter, pressure regulator, rail and injectors, return and returnless systems, port injection and direct injection, fuel pressure and why it matters, fuel safety. Diagram `petrol-fuel-system`.
3. Injectors and fuel control: injector operation and pulse width, spray pattern, cleaning vs replacing, fuel trim as a concept, fuel quality problems (contaminated or poor fuel), vapour lock.
4. Ignition system: spark plugs and heat range, ignition coil operation, coil-on-plug and distributor systems, spark timing, plug reading, misfire basics. Diagram `ignition-coil-circuit`.
5. Intake and exhaust: manifold, throttle body and idle control, vacuum leaks, exhaust manifold, silencer, flexible joint, turbo and supercharger in brief, exhaust leaks and carbon monoxide risk.
6. Petrol engine faults: no-start checks (spark, fuel, air, compression), hard starting, rough idle, misfires, loss of power, high consumption; a structured diagnostic path.
Practical: test fuel pressure and spark, and diagnose a simulated no-start.

### m07 Diesel engines and fuel systems
1. Diesel combustion: compression ignition, compression ratios, why diesels are efficient, differences from petrol engines, cetane in plain terms, white, black and blue smoke.
2. Diesel fuel supply: tank, lift pump, filters with water separators, priming, fuel contamination and water, microbial growth, biodiesel basics, fuel heating in cold weather.
3. Injection systems: rotary and in-line pump types in outline, unit injectors, high-pressure common rail, rail pressure, injectors, multiple injection events. Diagram `common-rail-diesel`.
4. Glow plugs and cold starting: glow plug types and control, testing plugs, starting aids, hard starting causes.
5. Turbocharging and intercooling: exhaust-driven turbo, boost pressure, wastegate and variable geometry in outline, oil supply and cooling, intercooler, leaks and loss of boost, turbo care. Diagram `turbocharger`.
6. Diesel diagnosis: hard start, smoke, loss of power, knock, fuel contamination, injector return flow concept, safety around high-pressure fuel (never check leaks with a hand), fuel injection injuries.
Practical: prime and bleed a diesel fuel system and perform a glow-plug resistance check on a training engine.

### m08 Engine management, sensors and emission control
1. Engine control basics: ECU, inputs, processing and outputs, closed and open loop, adaptive learning, limp mode. Diagram `engine-management-loop`.
2. Sensors: coolant temperature, air temperature, mass airflow, MAP, throttle position, crank and cam position, knock, oxygen (lambda) sensors, types of signals and typical behaviour, what a failed sensor causes.
3. Actuators and control: injectors, ignition coils, idle control, throttle motor, EGR valve, purge valve, variable timing solenoids, relays and drivers, testing an actuator.
4. Emission formation and control: CO, HC, NOx, particulates, causes, three-way catalyst, lambda feedback, diesel particulate filter, SCR and AdBlue in outline, EGR, evaporative system, PCV. Diagram `catalytic-converter`. Diagram `emission-controls`.
5. Diagnostic trouble codes and OBD: warning lamp, generic OBD-II code structure (P, B, C, U), freeze-frame data, readiness monitors, live data, clearing codes responsibly, codes point to a circuit not a part.
6. Emission and management faults: failed catalyst, wrong fuel trims, vacuum leaks, misfire with converter damage risk, removing emission parts is illegal and harmful, preparing a vehicle for an emissions test.
Practical: connect a scan tool, read live data and codes, and interpret sensor values against a known-good range.

### m09 Vehicle electrical basics, circuits and meters
1. Electricity in vehicles: current, voltage, resistance, 12 V systems and the earth (ground) return through the body, positive and negative, 24 V and 48 V in outline, Ohm's law, power. Diagram `ohm-triangle`.
2. Circuit types: series, parallel, series-parallel, a voltage divider, effects of open circuits, short circuits and high resistance, wire size and voltage drop. Diagram `series-parallel`. Diagram `basic-vehicle-circuit`.
3. Components: fuses, fusible links, circuit breakers, switches, relays, resistors, diodes, capacitors, solenoids, motors, connectors and terminals, wiring colours and symbols. Diagram `relay-operation`.
4. Digital multimeter use: DC voltage, resistance and continuity, current and clamp meters, diode test, test lamps and why not to use them on electronics, back-probing, connecting safely, common errors.
5. Voltage-drop testing: why it finds high-resistance faults, how to test power and earth sides, acceptable drops, worked examples. Diagram `voltage-drop-test`.
6. Electrical fault finding: open circuit, short to earth, short to power, high resistance, intermittent faults, half-split method, using a jumper wire safely, wiring repair (crimp, solder and seal), protecting repairs from water.
Practical: build and test a simple lamp circuit with a relay on a board, then find an inserted open circuit and high-resistance fault using voltage drop.

### m10 Batteries, charging and starting systems
1. Lead-acid battery: construction, cell voltage, capacity (Ah) and cold-cranking amps, state of charge by voltage, AGM and EFB types, battery safety, hydrogen and acid. Diagram `battery-construction`.
2. Battery testing and care: visual check, open-circuit voltage, load and conductance testing in plain terms, terminal care, charging methods, jump starting properly, parasitic drain test, storage.
3. Charging system: alternator operation, stator, rotor, slip rings, rectifier diodes, regulator, charging voltage, ripple, warning lamp circuit. Diagram `alternator-charging`.
4. Charging faults: no charge, overcharge, noise, belt slip, diagnosing with voltage and current, drop test on cables, replacing an alternator correctly.
5. Starting system: starter motor, solenoid, pinion engagement, ignition switch and relay, neutral safety switch, immobiliser interaction in outline, current draw. Diagram `starter-circuit`.
6. Starting faults: slow crank, click only, no crank, spin without engaging, voltage at the starter while cranking, cable and earth strap checks, stop-start system batteries.
Practical: test battery state of charge, run a charging-system output test and a cranking voltage-drop test.

### m11 Lighting, wiring and body electrical systems
1. Vehicle lighting: headlamp types (halogen, HID, LED), bulbs and handling, dipped and main beam, aim and alignment, fog, brake and indicator lights, hazard flasher, legal requirements in outline.
2. Lighting circuits and relays: headlamp circuit with relay and fuse, daytime running lights, indicator flasher unit, brake switch, bulb failure checks, LED warning behaviour. Diagram `headlamp-relay-circuit`.
3. Reading wiring diagrams: symbols, wire colours and codes, connectors and pin numbers, power distribution, earth points, tracing a circuit on paper, using a diagram to plan tests. Diagram `wiring-diagram-reading`.
4. Body electrical: power windows, central locking, mirrors, wipers and washers, horn, seat motors, how motors and relays are controlled, typical faults.
5. Instruments and accessories: gauges, warning lamps, fuel level sender, temperature gauge, audio and aftermarket wiring, adding accessories correctly with fuses, alarm and immobiliser basics.
6. Wiring repair and harnesses: wire and fuse sizing, correct crimps, soldering and heat-shrink, connector repair, loom routing, rodent and water damage, avoiding fire risk from poor repairs.
Practical: trace a circuit from a wiring diagram, test a headlamp and horn circuit for power and earth, and repair a damaged wire properly.

### m12 Vehicle networks, modules and scan-tool diagnosis
1. Why vehicles use networks: modules, wiring reduction, multiplexing, gateways, protocols named in outline (CAN, LIN, FlexRay), network topology.
2. CAN bus: high and low lines, termination resistors, differential signal, speeds, message idea, what a typical signal looks like on a scope. Diagram `can-bus`.
3. Signal types and sensors: analogue, digital, pulse-width-modulated and frequency signals, reading them with a meter and scope, reference voltage and signal return. Diagram `signal-types`.
4. Scan-tool diagnosis: reading codes, live data, freeze frame, actuator tests, guided diagnostics, network communication faults, module programming and coding in outline, respect for security and licences.
5. Network faults: bus wiring checks, resistance between CAN lines, loss of communication codes, power and earth to modules, water in connectors, parasitic drain from modules, low battery effects on modules.
6. Driver assistance and body electronics: sensors for parking, cameras and radar in outline, calibration need after repair, key and immobiliser systems, tyre pressure monitoring, doing no harm to safety systems.
Practical: measure CAN bus resistance and voltages and read module data with a scan tool.

### m13 Hybrid and electric vehicles
1. Types of electrified vehicles: mild, full, plug-in hybrid, battery electric, fuel-cell mention, benefits and limits, how to recognise one, orange cable convention. Diagram `hybrid-architectures`.
2. Main components: high-voltage battery, inverter, electric motor and generator, DC-DC converter, on-board charger, thermal management, 12 V auxiliary battery. Diagram `ev-powertrain`.
3. High-voltage safety: voltage levels, why they are dangerous, training and certification, PPE and insulated tools, isolation procedure in outline (power-off, service disconnect, wait, verify dead), what ordinary mechanics must not do.
4. Battery and charging: cell chemistries in plain terms, state of charge and health, charging levels and connectors in outline, thermal runaway risk, handling a damaged battery, storage.
5. Regenerative braking and drive systems: regen concept, brake blending, single-speed transmissions, motor types in outline, reduced wear on brakes and why they still need service.
6. Service and diagnosis of electrified vehicles: scope of work for ordinary workshops, tyres, brakes, suspension and 12 V work, when to refer to a specialist, towing and accident response, high-voltage fault codes and warning lights.
Practical: a recognition and safety awareness exercise on a hybrid or EV, identifying components and warning labels without touching high-voltage parts, and performing the 12 V battery check.

### m14 Air conditioning principles and components
1. Heat and refrigeration: heat moves from warm to cool, latent heat of evaporation and condensation, pressure and boiling point, how a refrigerant carries heat out of the cabin. Diagram `ac-cycle`.
2. Refrigerants and oils: R134a, R1234yf and older R12 in plain terms, flammability and safety, ozone and global warming, oil type and compatibility, never mix refrigerants, labelling.
3. Compressor and clutch: reciprocating, swash-plate and variable-displacement compressors, magnetic clutch, clutch air gap, belt drive, electric compressors in hybrids and EVs. Diagram `compressor-clutch`.
4. Condenser, receiver-drier and accumulator: heat rejection, airflow, fan control, drier function and desiccant, replacement after opening the system.
5. Expansion device and evaporator: orifice tube and thermostatic expansion valve, evaporator frosting, condensate drain, cabin filter, odours and mould.
6. A/C controls and safety devices: pressure switches, thermistors and sensors, compressor cycling, high-pressure relief, automatic climate control in outline, blend doors and actuators.
Practical: identify A/C parts on a vehicle or demonstrator and trace refrigerant flow, noting high and low side, using temperature touches only where safe.

### m15 A/C service, heating, ventilation and climate control
1. Service safety and the law: certified technician requirement, never vent refrigerant, recovery equipment, eye and skin protection, frostbite hazard, system fire risk with flammable refrigerants, record keeping.
2. Gauges and readings: manifold gauge set colours, static pressure, normal operating pressures varying with ambient temperature, typical faults shown by high and low readings, vent temperature and humidity. Diagram `ac-gauge-readings`.
3. Recover, evacuate and recharge: recovering refrigerant, vacuum and leak check, adding oil, charging by weight, leak detection (dye, electronic, soapy water), contamination, flushing in outline.
4. A/C faults and diagnosis: no cooling, weak cooling, intermittent cooling, noise, clutch not engaging, icing, smells, a diagnostic flow from checks to pressure tests, electrical checks of switches and relays.
5. Heating and ventilation: heater core and coolant flow, blower motor and resistor, air distribution and blend doors, recirculation, fresh air, demisting, cabin filters. Diagram `hvac-air-distribution`.
6. Climate control faults: actuator and door faults, temperature sensors, blower faults, heater core leaks, steam on windscreen, calibration of actuators, comfort complaints and customer advice (heat in tropical conditions).
Practical: attach gauges to a training or demonstration system only under supervision, record pressures at different engine speeds and diagnose from the readings. Use certified recovery equipment for any opening of the system.

### m16 Clutches, manual transmissions and driveline
1. Driveline layout: front, rear and all-wheel drive, positions of engine, gearbox, propeller shaft, differential and axles, torque path, gear ratios and final drive.
2. Clutch: friction clutch parts (flywheel, disc, pressure plate, release bearing), hydraulic and cable operation, slipping and dragging symptoms, free play, dual-mass flywheel in outline, clutch replacement basics. Diagram `clutch-assembly`.
3. Manual gearbox: input shaft, layshaft, output shaft, constant-mesh gears, synchronisers, selector forks, power flow in each gear, oils, noises. Diagram `manual-gearbox-power-flow`.
4. Shafts and joints: propeller shafts, universal joints, constant-velocity joints, CV boots, wheel bearings in axles, vibration, clicking on turns, balance.
5. Gearbox and driveline faults: hard to shift, jumping out of gear, whine, oil leaks, clutch judder, diagnosing by road test and inspection, fluid checks.
6. Service and repair: gearbox and axle oil change, replacing a clutch in order, torque specs, alignment of input shaft, bleeding hydraulic clutch, safety with heavy components.
Practical: inspect and measure a clutch disc and flywheel, check CV joint boots and play, and change gearbox oil.

### m17 Automatic transmissions, differentials and four-wheel drive
1. Automatic transmission overview: torque converter, planetary gear sets, hydraulic control, electronic control, gear selection and park pawl, CVT and dual-clutch in outline.
2. Torque converter and fluid: impeller, turbine, stator, lock-up clutch, stall, fluid types and why they matter, checking level and condition. Diagram `torque-converter`.
3. Planetary gears and shifting: sun, planet carrier and ring, how holding different members gives gears, clutches and bands, shift quality, solenoids and valve body in outline.
4. Differentials and final drive: open differential action, limited-slip and locking types, crown wheel and pinion, backlash and noise, gear oil. Diagram `differential`.
5. Four-wheel and all-wheel drive: transfer case, centre differential or coupling, low range, locking hubs, driveline wind-up, tyre-size matching, towing precautions.
6. Transmission faults: slipping, delayed engagement, harsh shifts, overheating, fluid smell and colour, warning lights, codes, what a workshop can and cannot repair, service intervals.
Practical: inspect transmission fluid level and condition, read transmission data with a scan tool and check differential oil level and play.

### m18 Steering, suspension and wheel alignment
1. Suspension types: springs, dampers, anti-roll bars, MacPherson strut, double wishbone, multi-link, leaf springs, solid axle, ride and handling in plain terms. Diagram `macpherson-strut`.
2. Suspension inspection and repair: bushes, ball joints, damper leaks, spring condition, noises, bounce test, spring compressor safety, torque on final tightening at ride height.
3. Steering systems: steering wheel, column, rack and pinion, steering box, tie rods, hydraulic, electro-hydraulic and electric assistance, steering lock, safe handling of columns with airbags.
4. Wheel alignment angles: toe, camber, caster, kingpin inclination, thrust angle, effects on tyre wear and handling, measuring methods in outline, adjustment points. Diagram `alignment-angles`.
5. Wheels and balance: wheel balancing, vibration, runout, tyre pressure, wheel offset, buckled rims, tyre fitting safety.
6. Steering and suspension faults: wander, pull, shimmy, tyre wear patterns, noises, tight steering, leaks, systematic diagnosis, post-repair alignment need.
Practical: perform a steering and suspension inspection with a jack and stand, checking play at every joint, and record tyre wear and toe by simple measurement.

### m19 Brakes, tyres, wheels and bearings
1. Hydraulic brake system: pedal, master cylinder, brake booster, lines and hoses, calipers and wheel cylinders, proportioning, fluid properties and DOT grades, hydraulic principle with area and pressure. Diagram `hydraulic-brake-circuit`.
2. Disc and drum brakes: disc, pad and caliper, drum, shoes and wheel cylinder, self-adjuster, parking brake, wear limits, noises, dust and asbestos care. Diagram `disc-and-drum-brakes`.
3. Brake service: inspection, pad and disc replacement, bedding in, cleaning slides, lubricating correct places, rear drums, brake fluid change and bleeding methods, torque, test.
4. ABS and stability control: wheel-speed sensors, hydraulic modulator, ECU, pulsating pedal, warning lights, traction and stability control in outline, scan-tool checks, bleeding ABS.
5. Brake faults and diagnosis: spongy pedal, hard pedal, pulling, judder, noise, brake drag, fluid loss, overheating, warning light, tests at road and on the bench; do not drive a car with doubtful brakes.
6. Hubs and wheel bearings: bearing types, preload, play and noise, hub-bearing units, driveshaft nuts, ABS rings, replacement and torque; tyres in brief with link to m03.
Practical: inspect and measure pads, discs and drums, bleed a brake system correctly on a training vehicle and test a brake after service.

### m20 Restraint systems, body components, accessories and trim
1. Seat belts and restraints: belt types, pretensioners, load limiters, child restraints and ISOFIX in outline, inspecting belts, replacing belts after a crash.
2. Airbag systems: sensors, ECU, inflators, airbags and curtains, SRS warning light, precautions: disconnect battery and wait, never probe SRS wiring, handling and storing deployed or live units, disposal. Diagram `srs-layout`.
3. Body panels and glass: doors, bonnet and boot hinges and latches, door seals and water leaks, glass and windscreen, minor body repair in outline, corrosion and rust protection.
4. Interior trim and accessories: dashboard and trim removal without damage, clips and fasteners, sunroof, mirrors, towbars, roof racks, fitting accessories safely, aftermarket alarm or audio wiring.
5. Collision-damaged vehicles: structural safety, crumple zones, signs of repaired accident damage, when a vehicle is unsafe, working with body shops, airbag replacement after a crash.
6. Noise, vibration and water leaks: rattle and squeak finding, wind noise, water ingress tests, sealing, drain holes, using stethoscopes, customer comfort complaints.
Practical: remove and refit a door trim panel with correct clips and test a power window, and an SRS awareness inspection that stops before touching any airbag part.

### m21 Diagnostic method, customer service and workshop practice
1. Systematic diagnosis: the six-step approach (verify the complaint, gather information, check the obvious, test and isolate, repair, confirm), symptoms vs causes, avoiding parts-swapping, using service information. Diagram `diagnostic-flow`.
2. Using information and tools: repair databases, bulletins, scan tools, scopes, data logging, known-good comparisons, notes and measurements, when to escalate.
3. Customer service: listening to the complaint, asking useful questions, explaining faults in plain words, estimates and approval, honest prices, managing expectations and delays.
4. Job cards, records and parts: writing a clear job card, recording faults, work and parts, warranties, parts sourcing (new, used, reconditioned, counterfeit risks), stock and returns.
5. Costing and running the workshop: labour time and rates, estimates and invoices, taxes in outline, payment including mobile money, simple profit idea, comebacks and how to avoid them.
6. Professional development: staying current, vehicle technology change, safety culture, mentoring juniors, certification routes, tools and equipment care, working ethically and legally.
Practical: diagnose a seeded fault on a training vehicle or rig using the six steps and write a complete job card.


## Fault finder entries

Faults live in `data/faults/s1.js`, `s2.js` and `s3.js` (one per semester). Each entry has:

    { id: 'kebab-case-id', mod: 'm05', lessons: ['m05-l4', 'm05-l7'], title: 'Engine overheating',
      causes: [ ... ], diagnose: [ ... ], repair: [ ... ], caution: 'one safety sentence, or null' }

Causes run from most to least common. Diagnosis steps are ordered tests that prove the cause. Repairs name the correct procedure. Keep the course safety rules (no untrained high-voltage, airbag or refrigerant work, never under a jack alone). `node tests/validate.js` checks every field and that each lesson id is real.
