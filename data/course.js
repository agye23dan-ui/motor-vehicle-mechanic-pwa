/*
 * Course outline for the Motor Vehicle Mechanic study app.
 *
 * The structure follows the Red Seal Automotive Service Technician occupational
 * standard (Canada), blocks A to H, and is cross-checked at qualification level
 * against Australia's AUR30620 Certificate III in Light Vehicle Mechanical
 * Technology and the UK City & Guilds / IMI Level 3 light vehicle diploma.
 * Their topics are regrouped here into 21 study modules. Lesson text, quiz
 * questions and flashcards are original writing for this app.
 *
 * Module content lives in data/modules/mNN.js and registers itself with
 * MVM.registerModule(). Titles, areas and syllabus links come from this file.
 */
(function (root) {
  'use strict';

  var R = 'Red Seal Automotive Service Technician (310S) task ';

  var course = {
    id: 'mvm',
    title: 'Motor Vehicle Mechanic',
    subtitle: 'Study guide for the trade, with auto electrical and car air conditioning',
    version: 1,
    passMark: 70,

    areas: [
      { id: 'foundations', label: 'Foundations', blurb: 'Safe working, tools, measuring and routine servicing.' },
      { id: 'engine', label: 'Engine and fuel systems', blurb: 'Engine construction, lubrication, cooling, petrol and diesel systems, and engine management.' },
      { id: 'electrical', label: 'Auto electrical and electronics', blurb: 'Circuits, batteries, charging, lighting, networks and hybrid and electric vehicles.' },
      { id: 'climate', label: 'Air conditioning and climate control', blurb: 'Refrigeration principles, A/C components, service and diagnosis, heating and ventilation.' },
      { id: 'driveline', label: 'Driveline', blurb: 'Clutches, manual and automatic transmissions, differentials and four-wheel drive.' },
      { id: 'chassis', label: 'Chassis and body', blurb: 'Steering, suspension, alignment, brakes, tyres, restraints and body components.' },
      { id: 'practice', label: 'Workshop practice', blurb: 'Diagnostic method, customers and running the job properly.' }
    ],

    /* The three semesters of the programme. Each module belongs to exactly one. */
    semesters: [
      { id: 's1', label: 'Semester 1', blurb: 'Safe working, tools and servicing, then the engine: construction, lubrication and cooling, petrol and diesel fuel systems and engine management.', modules: ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08'] },
      { id: 's2', label: 'Semester 2', blurb: 'Auto electrical and electronics from first principles to networks, hybrid and electric vehicles, then air conditioning and climate control.', modules: ['m09', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15'] },
      { id: 's3', label: 'Semester 3', blurb: 'Driveline, steering, suspension, brakes, tyres, restraints and body systems, finished with diagnostic method and workshop practice.', modules: ['m16', 'm17', 'm18', 'm19', 'm20', 'm21'] }
    ],

    modules: [
      {
        id: 'm01', number: 1, area: 'foundations',
        title: 'Workshop safety, lifting and professional conduct', short: 'Safety',
        syllabus: [
          R + 'A-1: Performs safety-related functions',
          R + 'A-3: Uses communication and mentoring techniques'
        ]
      },
      {
        id: 'm02', number: 2, area: 'foundations',
        title: 'Tools, measuring and technical information', short: 'Tools',
        syllabus: [
          R + 'A-2: Uses tools, equipment and documentation'
        ]
      },
      {
        id: 'm03', number: 3, area: 'foundations',
        title: 'Routine servicing and vehicle inspection', short: 'Servicing',
        syllabus: [
          R + 'A-2: Uses tools, equipment and documentation',
          R + 'F-18: Diagnoses steering and suspension, braking, control systems, tires, wheels, hubs and wheel bearings (inspection)'
        ]
      },
      {
        id: 'm04', number: 4, area: 'engine',
        title: 'Engine construction and the four-stroke cycle', short: 'Engine basics',
        syllabus: [
          R + 'B-4: Diagnoses engine systems',
          R + 'B-5: Repairs engine systems'
        ]
      },
      {
        id: 'm05', number: 5, area: 'engine',
        title: 'Lubrication, cooling and mechanical engine diagnosis', short: 'Lube and cooling',
        syllabus: [
          R + 'B-4: Diagnoses engine systems',
          R + 'B-5: Repairs engine systems'
        ]
      },
      {
        id: 'm06', number: 6, area: 'engine',
        title: 'Petrol fuel, ignition and air intake', short: 'Petrol systems',
        syllabus: [
          R + 'B-6: Diagnoses gasoline engine support systems',
          R + 'B-7: Repairs gasoline engine support systems'
        ]
      },
      {
        id: 'm07', number: 7, area: 'engine',
        title: 'Diesel engines and fuel systems', short: 'Diesel',
        syllabus: [
          R + 'B-8: Diagnoses diesel engine support systems',
          R + 'B-9: Repairs diesel engine support systems'
        ]
      },
      {
        id: 'm08', number: 8, area: 'engine',
        title: 'Engine management, sensors and emission control', short: 'Engine management',
        syllabus: [
          R + 'B-6: Diagnoses gasoline engine support systems',
          R + 'B-8: Diagnoses diesel engine support systems'
        ]
      },
      {
        id: 'm09', number: 9, area: 'electrical',
        title: 'Vehicle electrical basics, circuits and meters', short: 'Electrical basics',
        syllabus: [
          R + 'E-14: Diagnoses electrical systems and components',
          R + 'E-15: Repairs electrical systems and components'
        ]
      },
      {
        id: 'm10', number: 10, area: 'electrical',
        title: 'Batteries, charging and starting systems', short: 'Battery and charging',
        syllabus: [
          R + 'E-14: Diagnoses electrical systems and components',
          R + 'E-15: Repairs electrical systems and components'
        ]
      },
      {
        id: 'm11', number: 11, area: 'electrical',
        title: 'Lighting, wiring and body electrical systems', short: 'Lighting and wiring',
        syllabus: [
          R + 'E-14: Diagnoses electrical systems and components',
          R + 'E-15: Repairs electrical systems and components'
        ]
      },
      {
        id: 'm12', number: 12, area: 'electrical',
        title: 'Vehicle networks, modules and scan-tool diagnosis', short: 'Networks',
        syllabus: [
          R + 'C-10: Diagnoses vehicle networking systems',
          R + 'C-11: Repairs vehicle networking systems'
        ]
      },
      {
        id: 'm13', number: 13, area: 'electrical',
        title: 'Hybrid and electric vehicles', short: 'Hybrid and EV',
        syllabus: [
          R + 'H-22: Diagnoses hybrid and electric vehicle (EV) systems',
          R + 'H-23: Repairs hybrid and electric vehicle (EV) systems'
        ]
      },
      {
        id: 'm14', number: 14, area: 'climate',
        title: 'Air conditioning principles and components', short: 'A/C principles',
        syllabus: [
          R + 'E-16: Diagnoses heating, ventilation and air conditioning (HVAC) and comfort control systems'
        ]
      },
      {
        id: 'm15', number: 15, area: 'climate',
        title: 'A/C service, heating, ventilation and climate control', short: 'A/C service',
        syllabus: [
          R + 'E-16: Diagnoses heating, ventilation and air conditioning (HVAC) and comfort control systems',
          R + 'E-17: Repairs HVAC and comfort control systems'
        ]
      },
      {
        id: 'm16', number: 16, area: 'driveline',
        title: 'Clutches, manual transmissions and driveline', short: 'Manual drivetrain',
        syllabus: [
          R + 'D-12: Diagnoses driveline systems',
          R + 'D-13: Repairs driveline systems'
        ]
      },
      {
        id: 'm17', number: 17, area: 'driveline',
        title: 'Automatic transmissions, differentials and four-wheel drive', short: 'Automatic and 4WD',
        syllabus: [
          R + 'D-12: Diagnoses driveline systems',
          R + 'D-13: Repairs driveline systems'
        ]
      },
      {
        id: 'm18', number: 18, area: 'chassis',
        title: 'Steering, suspension and wheel alignment', short: 'Steering and suspension',
        syllabus: [
          R + 'F-18: Diagnoses steering and suspension, braking, control systems, tires, wheels, hubs and wheel bearings',
          R + 'F-19: Repairs steering and suspension, braking, control systems, tires, wheels, hubs and wheel bearings'
        ]
      },
      {
        id: 'm19', number: 19, area: 'chassis',
        title: 'Brakes, tyres, wheels and bearings', short: 'Brakes and tyres',
        syllabus: [
          R + 'F-18: Diagnoses steering and suspension, braking, control systems, tires, wheels, hubs and wheel bearings',
          R + 'F-19: Repairs steering and suspension, braking, control systems, tires, wheels, hubs and wheel bearings'
        ]
      },
      {
        id: 'm20', number: 20, area: 'chassis',
        title: 'Restraint systems, body components, accessories and trim', short: 'Body and restraints',
        syllabus: [
          R + 'G-20: Diagnoses restraint systems, body components, accessories and trim',
          R + 'G-21: Repairs restraint systems, body components, accessories and trim'
        ]
      },
      {
        id: 'm21', number: 21, area: 'practice',
        title: 'Diagnostic method, customer service and workshop practice', short: 'Workshop practice',
        syllabus: [
          R + 'A-3: Uses communication and mentoring techniques',
          R + 'A-2: Uses tools, equipment and documentation'
        ]
      }
    ],

    /* Diagram names that lesson blocks may reference: { t: 'diagram', name: '...' }, with the
       modules each may appear in. The drawings are in js/diagrams/. */
    diagrams: {
      'brake-wear': ['m19'],
      'tyre-wear-patterns': ['m03', 'm18', 'm19'],
      'spark-plug-conditions': ['m06'],
      'belt-wear': ['m03'],
      'scope-signals': ['m08', 'm09'],
      'fuse-colours': ['m09', 'm11'],
      'fluid-condition': ['m03', 'm05', 'm17'],
      'suspension-checkpoints': ['m18'],
      'lift-points': ['m01'],
      'micrometer-reading': ['m02'],
      'tightening-sequence': ['m02'],
      'tyre-markings': ['m03'],
      'underbonnet-layout': ['m03'],
      'four-stroke-cycle': ['m04'],
      'engine-cross-section': ['m04'],
      'timing-belt-drive': ['m04'],
      'oil-circuit': ['m05'],
      'cooling-circuit': ['m05'],
      'thermostat-operation': ['m05'],
      'petrol-fuel-system': ['m06'],
      'ignition-coil-circuit': ['m06'],
      'air-fuel-ratio': ['m06'],
      'common-rail-diesel': ['m07'],
      'turbocharger': ['m07'],
      'engine-management-loop': ['m08'],
      'catalytic-converter': ['m08'],
      'emission-controls': ['m08'],
      'ohm-triangle': ['m09'],
      'series-parallel': ['m09'],
      'basic-vehicle-circuit': ['m09'],
      'relay-operation': ['m09'],
      'voltage-drop-test': ['m09'],
      'starter-circuit': ['m10'],
      'alternator-charging': ['m10'],
      'battery-construction': ['m10'],
      'headlamp-relay-circuit': ['m11'],
      'wiring-diagram-reading': ['m11'],
      'can-bus': ['m12'],
      'signal-types': ['m12'],
      'ev-powertrain': ['m13'],
      'hybrid-architectures': ['m13'],
      'ac-cycle': ['m14'],
      'compressor-clutch': ['m14'],
      'ac-gauge-readings': ['m15'],
      'hvac-air-distribution': ['m15'],
      'clutch-assembly': ['m16'],
      'manual-gearbox-power-flow': ['m16'],
      'differential': ['m17'],
      'torque-converter': ['m17'],
      'alignment-angles': ['m18'],
      'macpherson-strut': ['m18'],
      'hydraulic-brake-circuit': ['m19'],
      'disc-and-drum-brakes': ['m19'],
      'srs-layout': ['m20'],
      'diagnostic-flow': ['m21'],
      'hierarchy-of-controls': ['m01'],
      'fire-triangle': ['m01'],
      'restraint-sequence': ['m20'],
      'valvetrain': ['m04'],
      'planetary-gearset': ['m17'],
      'steering-rack': ['m18'],
      'brake-booster': ['m19'],
      'ac-service-sequence': ['m15'],
      'ac-manifold-hookup': ['m15'],
      'expansion-systems': ['m14'],
      'clutch-operation': ['m16'],
      'driveshaft-joints': ['m16'],
      'wheel-bearing': ['m19']
    },

    sources: [
      {
        title: 'Canada: Red Seal Occupational Standard, Automotive Service Technician (310S), task matrix and blocks A to H',
        url: 'https://www.red-seal.ca/_conf/assets/custom/docms/ast_curr2016_eng.pdf'
      },
      {
        title: 'Canada: Red Seal Automotive Service Technician, trade standard and exam information',
        url: 'https://www.red-seal.ca/_conf/assets/custom/docms/auto-serv-tech/tp-eng.pdf'
      },
      {
        title: 'Australia: AUR30620 Certificate III in Light Vehicle Mechanical Technology (qualification outline, used as a cross-check)',
        url: 'https://tradeskillsaustralia.com.au/automotive-qualifications/aur30620-certificate-iii-in-light-vehicle-mechanical-technology/'
      },
      {
        title: 'United Kingdom: City & Guilds Level 3 Light Vehicle Maintenance and Repair qualification handbook (used as a cross-check)',
        url: 'https://cityandguilds.com/-/media/productdocuments/transport_maintenance/automotive/4290/centre_documents/4290-13_l3d_lv_qualification_handbook_v3-1-pdf.ashx'
      }
    ]
  };

  root.MVM = root.MVM || {};
  root.MVM.course = course;
  root.MVM.modules = root.MVM.modules || {};
  root.MVM.registerModule = function (m) {
    root.MVM.modules[m.id] = m;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = course;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
