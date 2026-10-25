/* Diagrams for m14, m15. */
import { DIAGRAMS, wrap, t, badge, box, node } from './core.js';

/* ---------------- A/C refrigeration cycle ---------------- */
DIAGRAMS['ac-cycle'] = {
  caption: 'Refrigerant is squeezed hot by the compressor, cools and turns to liquid in the condenser, drops in pressure at the expansion point, then boils in the evaporator and takes heat out of the cabin air.',
  svg: function () {
    var s = '';
    /* region divider and brackets */
    s += '<path d="M120 190H308" class="zone"/>';
    s += '<path d="M316 100H324V160H316M316 220H324V284H316" class="dim"/>';
    /* pipes: gas drawn twice so it reads darker than liquid */
    var gas1 = 'M340 168V80H290', liq1 = 'M170 80H120V112M120 158V176', mix = 'M120 204V292H170', gas2 = 'M290 292H340V212';
    s += '<path d="' + gas1 + '" class="pipe hot"/><path d="' + gas1 + '" class="pipe hot"/>';
    s += '<path d="' + liq1 + '" class="pipe hot"/>';
    s += '<path d="' + mix + '" class="pipe cold"/>';
    s += '<path d="' + gas2 + '" class="pipe cold"/><path d="' + gas2 + '" class="pipe cold"/>';
    /* flow arrows */
    s += '<path d="M340 150V128M326 80H306M152 80H134M120 224V246M138 292H160M302 292H322M340 268V240" class="k" marker-end="url(#ar)"/>';
    /* condenser */
    s += box(170, 58, 120, 44, 'tint-m-soft') + t(230, 85, 'Condenser', 'tb', 'middle');
    s += '<path d="M195 52V36M230 52V36M265 52V36" class="wire-pos" marker-end="url(#ar)"/>' + t(230, 22, 'Heat out', 't-red', 'middle');
    s += '<circle cx="230" cy="124" r="11" class="box"/><path d="M222 124H238M230 116V132" class="k2"/>' + t(246, 129, 'Fan', 'ts');
    s += t(230, 156, 'Gas turns to liquid', 'ts', 'middle') + t(230, 180, 'HIGH SIDE', 't-red', 'middle');
    /* receiver-drier */
    s += box(110, 112, 20, 46, 'tint-m-soft');
    s += t(104, 128, 'Receiver-drier', 'tb', 'end') + t(104, 146, 'Holds liquid', 'ts', 'end');
    /* expansion */
    s += box(106, 176, 28, 28) + '<path d="M110 180L130 200V180L110 200Z" class="k2"/>';
    s += t(100, 186, 'Expansion', 'tb', 'end') + t(100, 204, 'valve: pressure', 'ts', 'end') + t(100, 220, 'drops', 'ts', 'end');
    /* compressor */
    s += box(308, 168, 64, 44, 'metal') + '<circle cx="340" cy="190" r="13" class="k2"/><path d="M340 190L348 182" class="k2"/>';
    s += t(380, 186, 'Compressor', 'tb') + t(380, 204, 'Squeezes gas', 'ts');
    /* evaporator */
    s += box(170, 270, 120, 44, 'tint-c-soft') + t(230, 297, 'Evaporator', 'tb', 'middle');
    s += t(230, 214, 'LOW SIDE', 't-blue', 'middle');
    s += '<path d="M205 266V244M230 266V244M255 266V244" class="wire-sig" marker-end="url(#ar)"/>' + t(230, 236, 'Cold air out', 't-blue', 'middle');
    s += t(108, 280, 'Liquid boils,', 'ts', 'end') + t(108, 298, 'absorbs heat', 'ts', 'end');
    s += '<path d="M205 372V324M230 372V324M255 372V324" class="wire-pos" marker-end="url(#ar)"/>';
    s += t(190, 350, 'Warm cabin', 'ts', 'end') + t(190, 366, 'air in', 'ts', 'end');
    s += '<circle cx="230" cy="392" r="11" class="box"/><path d="M222 392H238M230 384V400" class="k2"/>' + t(246, 397, 'Blower fan', 'ts');
    /* key */
    var kx = [14, 250], ky = [428, 448], lab = ['High-pressure gas', 'High-pressure liquid', 'Low-pressure liquid + vapour', 'Low-pressure gas'];
    var cls = [['pipe hot', 2], ['pipe hot', 1], ['pipe cold', 1], ['pipe cold', 2]];
    for (var i = 0; i < 4; i++) {
      var x = kx[i % 2], y = ky[Math.floor(i / 2)];
      for (var j = 0; j < cls[i][1]; j++) s += '<path d="M' + x + ' ' + y + 'h26" class="' + cls[i][0] + '"/>';
      s += t(x + 34, y + 5, lab[i], 'ts');
    }
    return wrap(480, 462, 'Air conditioning refrigerant cycle',
      'A loop: compressor, condenser, receiver-drier, expansion valve, evaporator and back to the compressor, with the high-pressure side above the expansion valve and the low-pressure side below it.', s);
  }
};

/* ---------------- Compressor magnetic clutch ---------------- */
function clutchPanel(oy, on) {
  var g = on ? 0 : 18, px = 136 + g;
  var s = '<g transform="translate(0,' + (oy + 24) + ')">';
  s += box(10, 20, 40, 115, 'metal-dark').replace('class="box metal-dark"', 'class="metal-dark"');
  s += '<rect x="50" y="125" width="190" height="10" class="metal-dark"/>';
  s += box(50, 72, 56, 42, 'tint-y') + t(78, 98, 'Coil', 'tb', 'middle');
  s += '<path d="M56 25H136V115H110V65H56Z" class="metal"/>' + t(94, 50, 'Pulley', 't', 'middle');
  s += '<rect x="56" y="18" width="80" height="7" class="rubber"/>' + t(96, 10, 'Belt', 'ts', 'middle');
  s += '<rect x="' + px + '" y="25" width="12" height="90" class="metal-dark"/>';
  s += '<path d="M' + (px + 12) + ' 108Q' + (px + 26) + ' 100 176 108" class="k2"/>';
  s += '<rect x="176" y="100" width="30" height="25" class="metal-dark"/>' + t(214, 118, 'Hub', 'ts');
  s += t(px + 6, 10, 'Plate', 'ts', 'middle');
  if (!on) {
    s += '<path d="M137 90H153" class="k2" marker-start="url(#ar)" marker-end="url(#ar)"/>';
    s += '<path d="M150 80L256 56" class="k2"/>';
    s += t(260, 54, 'Air gap, about 0.4 to 0.8 mm', 'ts') + t(260, 70, '(check the manual)', 'ts');
    s += t(260, 112, 'Plate held off by the spring.', 'ts') + t(260, 128, 'Shaft is not driven.', 'ts');
  } else {
    s += '<path d="M176 60H154" class="wire-pos" marker-end="url(#ar)"/>' + t(180, 56, 'Magnetic pull', 'ts');
    s += '<path d="M64 108V150" class="wire-pos"/>' + t(72, 150, 'Current in', 'ts');
    s += t(260, 112, 'Plate and hub lock to the', 'ts') + t(260, 128, 'pulley: shaft is driven.', 'ts');
  }
  s += t(10, 168, 'Compressor body', 'ts');
  return s + '</g>';
}
DIAGRAMS['compressor-clutch'] = {
  caption: 'The pulley always turns with the belt. Only when the coil is energised does the magnet pull the plate onto the pulley and drive the compressor shaft.',
  svg: function () {
    var s = t(10, 16, 'Coil off: pulley free-wheels', 'tb') + clutchPanel(0, false);
    s += '<path d="M10 200H470" class="dim"/>';
    s += t(10, 222, 'Coil energised: plate pulled to the pulley, shaft turns', 'tb') + clutchPanel(206, true);
    s += t(10, 424, 'Control path', 'tb');
    var names = [['A/C switch'], ['ECU and', 'pressure', 'switches'], ['Relay'], ['Clutch', 'coil']];
    for (var i = 0; i < 4; i++) {
      var x = 12 + i * 120;
      s += box(x, 434, 96, 60, i === 3 ? 'tint-y' : '');
      for (var j = 0; j < names[i].length; j++) s += t(x + 48, 464 - (names[i].length - 1) * 8 + j * 16, names[i][j], 'ts', 'middle');
      if (i < 3) s += '<path d="M' + (x + 98) + ' 464H' + (x + 118) + '" class="wire-pos" marker-end="url(#ar)"/>';
    }
    return wrap(480, 510, 'A/C compressor magnetic clutch',
      'Two cut-away views of the clutch, coil off with an air gap and coil on with the plate against the pulley, and below them the control path from the A/C switch to the coil.', s);
  }
};

/* ---------------- Manifold gauge readings ---------------- */
function dial(cx, cy, max, step, needleVal, tint, label) {
  var R = 72, s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" class="box ' + tint + '"/>';
  function pt(r, val) {
    var a = (-135 + 270 * val / max) * Math.PI / 180;
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  }
  for (var v = 0; v <= max; v += step / 2) {
    var major = (v % step) === 0, p1 = pt(R - 4, v), p2 = pt(R - (major ? 13 : 8), v);
    s += '<path d="M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + 'L' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + '" class="k2"/>';
    if (major) { var pl = pt(R - 26, v); s += t(pl[0].toFixed(1), (pl[1] + 5).toFixed(1), v, 'ts', 'middle'); }
  }
  var n = pt(R - 18, needleVal);
  s += '<path d="M' + cx + ' ' + cy + 'L' + n[0].toFixed(1) + ' ' + n[1].toFixed(1) + '" class="k bold"/><circle cx="' + cx + '" cy="' + cy + '" r="5" class="head"/>';
  s += t(cx, cy + 40, 'bar', 'ts', 'middle');
  return s;
}
DIAGRAMS['ac-gauge-readings'] = {
  caption: 'Read both gauges together. The pair of pressures, not one reading alone, points to the likely fault.',
  svg: function () {
    var s = dial(120, 90, 7, 1, 2, 'tint-c-soft') + dial(360, 90, 28, 4, 14, 'tint-m-soft');
    s += t(120, 188, 'Low side (blue)', 't-blue', 'middle') + t(120, 206, 'about 2 bar / 30 psi', 'ts', 'middle');
    s += t(360, 188, 'High side (red)', 't-red', 'middle') + t(360, 206, 'about 14 bar / 200 psi', 'ts', 'middle');
    s += t(240, 238, 'Normal example: about 30 °C air, engine at 1 500 rpm.', 'ts', 'middle');
    s += t(240, 256, 'Correct values depend on temperature and the vehicle.', 'ts', 'middle');
    var rows = [
      ['Low', 'Low', 'Low refrigerant charge', 'Look for a leak'],
      ['High', 'High', 'Overcharge, or poor airflow', 'Check condenser and fan'],
      ['High', 'Low', 'Weak compressor', 'Pressures too close together'],
      ['Low', 'High', 'Restriction', 'Blocked expansion device or drier']
    ];
    var y0 = 274;
    s += box(10, y0, 460, 28, 'tint-k-soft') + t(45, y0 + 19, 'Low', 't-blue', 'middle') + t(115, y0 + 19, 'High', 't-red', 'middle') + t(170, y0 + 19, 'Likely cause', 'tb');
    for (var i = 0; i < rows.length; i++) {
      var y = y0 + 28 + i * 48, r = rows[i];
      s += box(10, y, 460, 48) + '<path d="M80 ' + y + 'V' + (y + 48) + 'M150 ' + y + 'V' + (y + 48) + '" class="k2"/>';
      s += t(45, y + 29, r[0], r[0] === 'Low' ? 't-blue' : 't-red', 'middle') + t(115, y + 29, r[1], r[1] === 'Low' ? 't-blue' : 't-red', 'middle');
      s += t(160, y + 22, r[2], 'tb') + t(160, y + 40, r[3], 'ts');
    }
    s += t(10, 512, 'Low and High mean the low-side and high-side gauge readings.', 'ts');
    s += t(10, 530, 'Refrigerant must be recovered, never vented. Use trained staff', 'ts') + t(10, 546, 'and the correct recovery machine.', 'ts');
    return wrap(480, 558, 'Manifold gauge readings',
      'Two dials, blue low side near 2 bar and red high side near 14 bar, above a table of four pressure patterns and their likely causes.', s);
  }
};

/* ---------------- HVAC air distribution ---------------- */
DIAGRAMS['hvac-air-distribution'] = {
  caption: 'Cold air from the evaporator is mixed with warm air from the heater core by the blend door, then the mode doors choose where it goes.',
  svg: function () {
    var s = '';
    s += '<rect x="205" y="100" width="125" height="48" class="tint-c-soft"/><rect x="205" y="148" width="125" height="48" class="tint-m-soft"/>';
    /* casing */
    s += '<path d="M50 100H60M120 100H285M320 100H330V110M330 150V196H320M290 196H50V36H70M110 36H130V100" class="k bold"/>';
    /* fresh air and cabin air arrows */
    s += '<path d="M90 8V50" class="wire-sig" marker-end="url(#ar)"/><path d="M8 64H46" class="wire-sig" marker-end="url(#ar)"/>';
    s += '<path d="M130 62L88 42" class="k bold"/><circle cx="130" cy="62" r="4" class="head"/>';
    s += t(104, 16, 'Fresh air', 'ts');
    /* blower */
    s += '<circle cx="90" cy="150" r="30" class="box metal"/><path d="M90 150L90 124M90 150L116 158M90 150L68 168" class="k2"/>' + t(90, 190, '', 'ts');
    s += '<path d="M124 146H134" class="wire-sig" marker-end="url(#ar)"/>';
    /* filter, evaporator */
    s += '<rect x="142" y="100" width="10" height="96" class="box tint-y-soft"/>';
    s += '<rect x="176" y="100" width="30" height="96" class="box tint-c"/><path d="M184 104V192M191 104V192M198 104V192" class="k2"/>';
    /* air arrows */
    s += '<path d="M156 120H172M210 122H276" class="wire-sig" marker-end="url(#ar)"/>';
    s += '<path d="M210 176H284" class="wire-pos" marker-end="url(#ar)"/>';
    /* heater core */
    s += '<rect x="248" y="152" width="28" height="44" class="box tint-m"/><path d="M256 156V192M264 156V192" class="k2"/>';
    s += '<path d="M240 150L222 172" class="k bold"/><circle cx="240" cy="150" r="4" class="head"/>';
    /* mixed air */
    s += '<path d="M282 146H314" class="k" marker-end="url(#ar)"/>';
    /* outlets */
    s += '<path d="M300 98V58" class="k" marker-end="url(#ar)"/><path d="M332 130H372" class="k" marker-end="url(#ar)"/><path d="M304 198V232" class="k" marker-end="url(#ar)"/>';
    s += t(300, 46, 'Windscreen demist', 'ts', 'middle') + t(378, 126, 'Face vents', 'ts') + t(312, 250, 'Floor vents', 'ts');
    s += '<path d="M285 98L312 84M330 112L350 98M290 198L312 210" class="k bold"/>';
    /* pipes under casing */
    s += '<path d="M182 196V232" class="pipe cold"/><circle cx="182" cy="240" r="2.5" class="head"/>' + t(176, 258, 'Drain tube', 'ts', 'end');
    s += '<path d="M255 196V228M269 196V228" class="pipe hot"/>' + t(262, 246, 'Coolant', 'ts', 'middle');
    /* badges */
    s += badge(112, 52, 1) + badge(90, 150, 2) + badge(147, 82, 3) + badge(191, 84, 4) + badge(232, 130, 5) + badge(262, 214, 6) + badge(296, 70, 7) + badge(352, 112, 8) + badge(332, 214, 9);
    s += t(10, 290, 'Cold air from the evaporator, mixed with warm air', 't');
    s += t(10, 310, 'from the heater core by the blend door.', 't');
    var leg = ['Fresh / recirculation door', 'Blower fan', 'Cabin filter', 'Evaporator', 'Blend door', 'Heater core', 'Demist door', 'Face door', 'Floor door'];
    for (var i = 0; i < leg.length; i++) {
      var col = i < 5 ? 0 : 1, row = i < 5 ? i : i - 5, x = 16 + col * 240, y = 346 + row * 26;
      s += badge(x + 8, y - 5, i + 1, 10) + t(x + 26, y, leg[i], 'ts');
    }
    return wrap(480, 480, 'Heating and ventilation air path',
      'Side section of the dash air box: blower, filter, evaporator, heater core, blend door and three mode doors, with air flowing left to right and out to the windscreen, face and floor.', s);
  }
};
