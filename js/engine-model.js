/* Procedural model of an inline-four petrol engine for engine.html.
 *
 * Everything is built from extruded outlines, lathes, tubes and cylinders, so no model files are needed
 * and the page works offline once Three.js has been cached. Each part is merged into a few meshes (one per
 * material) so a phone can draw all 21 parts quickly.
 *
 * Units are arbitrary. The cylinder block is 1.8 wide (x), 1.3 tall (y) and 2.7 long (z, along the
 * crankshaft). The front of the engine, where the belt drive is, faces +z. The exhaust side is -x and the
 * intake side is +x.
 */
(function () {
  'use strict';
  const T = THREE;
  const PI = Math.PI;

  const BORE_Z = [-0.9, -0.3, 0.3, 0.9];
  const BORE_R = 0.27;
  const MAINS_Z = [-1.2, -0.6, 0, 0.6, 1.2];
  const HEAD_BOLTS = [];
  const COOLANT = [];
  [-1, 1].forEach(function (sx) {
    MAINS_Z.forEach(function (z) { HEAD_BOLTS.push([sx * 0.66, z]); });
    [-0.6, 0, 0.6].forEach(function (z) { COOLANT.push([sx * 0.42, z]); });
  });
  const CAM_X = [-0.42, 0.42];
  const CAM_Y = 0.52;                 // camshaft height above the middle of the head

  /* Materials: real colours for cast iron, cast aluminium, steel, rubber, nylon, brass and ceramic. */
  const PAL = {
    iron:      { color: 0x4b4f55, metalness: 0.8, roughness: 0.55 },
    ironRaw:   { color: 0x3f3c3a, metalness: 0.55, roughness: 0.78 },
    alloy:     { color: 0xb4bac2, metalness: 0.88, roughness: 0.42 },
    alloyDark: { color: 0x70767e, metalness: 0.85, roughness: 0.5 },
    steel:     { color: 0xcfd4da, metalness: 1.0, roughness: 0.28 },
    steelDark: { color: 0x30343a, metalness: 0.8, roughness: 0.45 },
    liner:     { color: 0x868b92, metalness: 0.95, roughness: 0.32 },
    black:     { color: 0x151617, metalness: 0.05, roughness: 0.85 },
    nylon:     { color: 0x1e2125, metalness: 0.1, roughness: 0.5 },
    brass:     { color: 0xb28d3a, metalness: 0.9, roughness: 0.35 },
    copper:    { color: 0xc0703a, metalness: 0.85, roughness: 0.38 },
    ceramic:   { color: 0xf1f0ea, metalness: 0.0, roughness: 0.28 },
    mls:       { color: 0xc6cacf, metalness: 0.95, roughness: 0.32 },
    paintBlue: { color: 0x1d4a9c, metalness: 0.4, roughness: 0.34 },
    white:     { color: 0xf3f4f6, metalness: 0.0, roughness: 0.5 },
    red:       { color: 0xc62d28, metalness: 0.1, roughness: 0.4 },
    voidc:     { color: 0x060607, metalness: 0.2, roughness: 0.7 },
    cover:     { color: 0x24272c, metalness: 0.3, roughness: 0.5 },
    pan:       { color: 0x2c3036, metalness: 0.7, roughness: 0.4 },
    bakelite:  { color: 0x4a2c1a, metalness: 0.0, roughness: 0.4 }
  };
  function makeMat(k) {
    const p = PAL[k];
    return new T.MeshStandardMaterial({ color: p.color, metalness: p.metalness, roughness: p.roughness, side: k === 'liner' ? T.DoubleSide : T.FrontSide });
  }
  /* A new set of materials for each part, so highlighting one part never lights another. */
  function palette() {
    const cache = {};
    return function (k) { return cache[k] || (cache[k] = makeMat(k)); };
  }

  /* ---------- shape helpers ---------- */
  function rrInto(p, w, h, r, cx, cy) {
    const x = (cx || 0) - w / 2, y = (cy || 0) - h / 2;
    p.moveTo(x + r, y);
    p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r);
    p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r);
    p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y);
    return p;
  }
  function rrShape(w, h, r) { return rrInto(new T.Shape(), w, h, r, 0, 0); }
  function circle(x, y, r) { const p = new T.Path(); p.absarc(x, y, r, 0, PI * 2, false); return p; }
  /* A hole at a position seen from above (x across, z along the engine). */
  function holeAt(shape, x, z, r) { shape.holes.push(circle(x, -z, r)); }

  /* Flat plate seen from above, thickness along y, centred on the origin. */
  function flat(shape, depth, bevel) {
    const g = new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 16 });
    g.translate(0, 0, -depth / 2);
    g.rotateX(-PI / 2);
    return g;
  }
  /* Flat plate facing sideways: shape x runs along z, shape y runs up, thickness along x. */
  function flatX(shape, depth, bevel) {
    const g = new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 16 });
    g.translate(0, 0, -depth / 2);
    g.rotateY(-PI / 2);
    return g;
  }
  /* Plate with its axis along z (a gear or a plate on the front of the engine). */
  function plateZ(shape, depth, bevel) {
    const g = new T.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1, curveSegments: 16 });
    g.translate(0, 0, -depth / 2);
    return g;
  }

  function mesh(geo, mat, x, y, z) {
    const m = new T.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  }
  function cyl(mat, rt, rb, h, seg, ax, x, y, z, open) {
    const g = new T.CylinderGeometry(rt, rb, h, seg || 24, 1, !!open);
    if (ax === 'z') g.rotateX(PI / 2); else if (ax === 'x') g.rotateZ(PI / 2);
    return mesh(g, mat, x, y, z);
  }
  function hex(mat, r, h, ax, x, y, z) { return cyl(mat, r, r, h, 6, ax, x, y, z); }
  function ring(mat, R, tube, ax, x, y, z) {
    const g = new T.TorusGeometry(R, tube, 8, 28);
    if (ax === 'y') g.rotateX(PI / 2); else if (ax === 'x') g.rotateY(PI / 2);
    return mesh(g, mat, x, y, z);
  }
  function box(mat, w, h, d, x, y, z) { return mesh(new T.BoxGeometry(w, h, d), mat, x, y, z); }
  function tube(mat, pts, r, seg) {
    const curve = new T.CatmullRomCurve3(pts.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }));
    return mesh(new T.TubeGeometry(curve, seg || 28, r, 14, false), mat, 0, 0, 0);
  }

  /* A toothed belt pulley with its axis along z. */
  function toothedGear(radius, teeth, depth, holes) {
    const s = new T.Shape();
    const ro = radius, ri = radius - 0.045, w = PI * 2 / teeth;
    for (let i = 0; i < teeth; i++) {
      const a = i * w;
      const pts = [[a + 0.06 * w, ri], [a + 0.2 * w, ro], [a + 0.62 * w, ro], [a + 0.8 * w, ri]];
      pts.forEach(function (p, j) {
        const x = Math.cos(p[0]) * p[1], y = Math.sin(p[0]) * p[1];
        if (i === 0 && j === 0) s.moveTo(x, y); else s.lineTo(x, y);
      });
    }
    s.closePath();
    s.holes.push(circle(0, 0, radius * 0.18));
    for (let k = 0; k < holes; k++) {
      const a = k / holes * PI * 2;
      s.holes.push(circle(Math.cos(a) * radius * 0.58, Math.sin(a) * radius * 0.58, radius * 0.15));
    }
    return plateZ(s, depth, 0);
  }

  /* ---------- merge a part's meshes (one per material) so a phone can draw it quickly ---------- */
  function finish(group) {
    const buckets = new Map();
    group.children.forEach(function (o) {
      if (!o.isMesh) return;
      if (!buckets.has(o.material)) buckets.set(o.material, []);
      buckets.get(o.material).push(o);
    });
    const out = new T.Group();
    buckets.forEach(function (list, material) {
      let total = 0;
      const geos = list.map(function (me) {
        me.updateMatrix();
        const g = me.geometry.index ? me.geometry.toNonIndexed() : me.geometry.clone();
        g.applyMatrix4(me.matrix);
        total += g.attributes.position.count;
        return g;
      });
      const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3);
      let off = 0;
      geos.forEach(function (g) {
        pos.set(g.attributes.position.array, off * 3);
        nor.set(g.attributes.normal.array, off * 3);
        off += g.attributes.position.count;
        g.dispose();
      });
      const merged = new T.BufferGeometry();
      merged.setAttribute('position', new T.BufferAttribute(pos, 3));
      merged.setAttribute('normal', new T.BufferAttribute(nor, 3));
      merged.computeBoundingSphere();
      const mm = new T.Mesh(merged, material);
      mm.castShadow = true; mm.receiveShadow = true;
      out.add(mm);
      list.forEach(function (me) { me.geometry.dispose(); });
    });
    return out;
  }

  /* ================= the parts ================= */

  function engineBlock(m) {
    const g = new T.Group();
    // Upper block with the four cylinder bores, the head bolt holes and the coolant passages.
    const s = rrShape(1.8, 2.7, 0.12);
    BORE_Z.forEach(function (z) { holeAt(s, 0, z, BORE_R); });
    HEAD_BOLTS.forEach(function (b) { holeAt(s, b[0], b[1], 0.05); });
    COOLANT.forEach(function (b) { holeAt(s, b[0], b[1], 0.045); });
    g.add(mesh(flat(s, 0.9, 0.025), m('iron'), 0, 0.2, 0));
    // Honed cylinder liners.
    BORE_Z.forEach(function (z) { g.add(cyl(m('liner'), BORE_R - 0.002, BORE_R - 0.002, 0.9, 32, 'y', 0, 0.2, z, true)); });

    // Crankcase skirt, a ring that is open underneath, with the main bearing bulkheads across it.
    const sk = rrShape(1.96, 2.78, 0.14);
    sk.holes.push(rrInto(new T.Path(), 1.5, 2.4, 0.1, 0, 0));
    g.add(mesh(flat(sk, 0.4, 0.02), m('iron'), 0, -0.45, 0));
    MAINS_Z.forEach(function (z) {
      const b = rrShape(1.5, 0.4, 0.02);
      b.holes.push(circle(0, 0.1, 0.16));
      g.add(mesh(plateZ(b, 0.1, 0), m('iron'), 0, -0.45, z));
      g.add(box(m('ironRaw'), 0.7, 0.07, 0.12, 0, -0.64, z));                      // bearing cap
      [-0.28, 0.28].forEach(function (x) { g.add(hex(m('steelDark'), 0.035, 0.05, 'y', x, -0.69, z)); });
    });

    // Crankshaft, with a counterweight opposite each crank pin, connecting rods and pistons.
    const CY = -0.35;
    MAINS_Z.forEach(function (z) { g.add(cyl(m('steel'), 0.13, 0.13, 0.12, 24, 'z', 0, CY, z)); });
    g.add(cyl(m('steel'), 0.07, 0.07, 2.6, 16, 'z', 0, CY, 0));
    BORE_Z.forEach(function (z, i) {
      const up = (i === 0 || i === 3);                                           // pins 1 and 4 up, 2 and 3 down
      const pinY = CY + (up ? 0.16 : -0.16);
      g.add(cyl(m('steel'), 0.08, 0.08, 0.3, 20, 'z', 0, pinY, z));
      [-0.13, 0.13].forEach(function (dz) {
        g.add(cyl(m('steelDark'), 0.2, 0.2, 0.07, 28, 'z', 0, CY, z + dz));
        const cw = new T.CylinderGeometry(0.29, 0.29, 0.07, 24, 1, false, 0, PI);
        cw.rotateX(PI / 2); cw.rotateZ(up ? -PI / 2 : PI / 2);
        g.add(mesh(cw, m('steelDark'), 0, CY, z + dz));
      });
      // connecting rod
      const topPin = pinY + 0.62;
      g.add(cyl(m('steel'), 0.115, 0.115, 0.11, 24, 'z', 0, pinY, z));
      g.add(cyl(m('steel'), 0.055, 0.055, 0.1, 16, 'z', 0, topPin, z));
      g.add(box(m('steel'), 0.07, 0.5, 0.04, 0, (pinY + topPin) / 2, z));
      g.add(box(m('steel'), 0.1, 0.03, 0.06, 0, (pinY + topPin) / 2, z));
      // piston
      const py = topPin + 0.045;
      g.add(cyl(m('alloy'), BORE_R - 0.014, BORE_R - 0.014, 0.26, 32, 'y', 0, py, z));
      [0.08, 0.04, 0.0].forEach(function (dy) { g.add(ring(m('steelDark'), BORE_R - 0.012, 0.009, 'y', 0, py + dy, z)); });
      [-1, 1].forEach(function (sx) { g.add(cyl(m('voidc'), 0.05, 0.05, 0.006, 16, 'y', sx * 0.12, py + 0.131, z)); });
    });
    // Crank front stub (the belt pulleys fit on this) and the rear flywheel flange.
    g.add(cyl(m('steel'), 0.1, 0.1, 0.5, 24, 'z', 0, CY, 1.55));
    g.add(box(m('steelDark'), 0.03, 0.03, 0.2, 0, CY + 0.1, 1.62));                // keyway
    g.add(cyl(m('ironRaw'), 0.21, 0.21, 0.06, 28, 'z', 0, CY, 1.4));               // front seal housing
    g.add(cyl(m('black'), 0.13, 0.13, 0.07, 28, 'z', 0, CY, 1.42));
    g.add(cyl(m('steel'), 0.34, 0.34, 0.1, 32, 'z', 0, CY, -1.44));
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * PI * 2;
      g.add(hex(m('steelDark'), 0.03, 0.06, 'z', Math.cos(a) * 0.24, CY + Math.sin(a) * 0.24, -1.5));
    }
    // Details on the sides of the block: stiffening ribs, freeze plugs, the oil filter boss, engine mount bosses.
    [-1, 1].forEach(function (sx) {
      [-1.2, -0.6, 0, 0.6, 1.2].forEach(function (z) { g.add(box(m('iron'), 0.05, 0.8, 0.08, sx * 0.9, 0.18, z)); });
      [-0.75, 0.75].forEach(function (z) { g.add(cyl(m('ironRaw'), 0.13, 0.13, 0.12, 20, 'x', sx * 0.94, 0.52, z)); });
    });
    [-0.6, 0, 0.6].forEach(function (z) { g.add(cyl(m('brass'), 0.095, 0.095, 0.03, 20, 'x', -0.91, 0.12, z)); });
    g.add(cyl(m('ironRaw'), 0.25, 0.25, 0.08, 28, 'x', 0.96, -0.3, 0.55));
    g.add(cyl(m('steelDark'), 0.07, 0.07, 0.14, 12, 'x', 0.98, -0.3, 0.55));
    g.add(cyl(m('steelDark'), 0.06, 0.06, 0.22, 12, 'y', 0.5, 0.2, 1.3));          // dipstick tube
    g.add(cyl(m('red'), 0.04, 0.04, 0.05, 12, 'y', 0.5, 0.34, 1.3));
    // Deck face: darker ring around each bore.
    BORE_Z.forEach(function (z) { g.add(ring(m('steelDark'), BORE_R + 0.025, 0.012, 'y', 0, 0.652, z)); });
    return finish(g);
  }

  function cylinderHead(m) {
    const g = new T.Group();
    const s = rrShape(1.8, 2.7, 0.12);
    BORE_Z.forEach(function (z) { holeAt(s, 0, z, 0.075); });                      // spark plug wells
    HEAD_BOLTS.forEach(function (b) { holeAt(s, b[0], b[1], 0.055); });
    COOLANT.forEach(function (b) { holeAt(s, b[0], b[1], 0.04); });
    g.add(mesh(flat(s, 0.85, 0.03), m('alloy'), 0, 0, 0));

    // Combustion chambers under the head, each with two inlet and two exhaust valves.
    BORE_Z.forEach(function (z) {
      g.add(cyl(m('voidc'), 0.31, 0.31, 0.02, 32, 'y', 0, -0.43, z));
      [-1, 1].forEach(function (sx) {
        [-1, 1].forEach(function (sz) {
          g.add(cyl(m('steel'), 0.075, 0.075, 0.016, 20, 'y', sx * 0.16, -0.442, z + sz * 0.1));
        });
      });
    });

    // Intake face (+x) and exhaust face (-x): four port openings and five studs each.
    [-1, 1].forEach(function (sx) {
      BORE_Z.forEach(function (z) { g.add(box(m('voidc'), 0.03, 0.26, 0.3, sx * 0.9, -0.1, z)); });
      MAINS_Z.forEach(function (z) {
        g.add(cyl(m('steel'), 0.028, 0.028, 0.18, 12, 'x', sx * 0.96, -0.1, z));
        g.add(cyl(m('alloyDark'), 0.07, 0.07, 0.03, 16, 'x', sx * 0.9, -0.1, z));
      });
    });

    // Camshafts in their bearing towers, with caps and cam lobes.
    CAM_X.forEach(function (cx, ci) {
      g.add(cyl(m('steel'), 0.062, 0.062, 3.1, 20, 'z', cx, CAM_Y, 0.035));
      MAINS_Z.forEach(function (z) {
        g.add(cyl(m('steel'), 0.08, 0.08, 0.14, 24, 'z', cx, CAM_Y, z));
        g.add(box(m('alloyDark'), 0.26, 0.1, 0.16, cx, 0.425 + 0.05, z));
        g.add(box(m('alloyDark'), 0.22, 0.06, 0.16, cx, CAM_Y + 0.07, z));
        [-1, 1].forEach(function (sx) { g.add(hex(m('steelDark'), 0.024, 0.04, 'y', cx + sx * 0.085, CAM_Y + 0.12, z)); });
      });
      BORE_Z.forEach(function (z, zi) {
        [-0.13, 0.13].forEach(function (dz, di) {
          const lg = new T.CylinderGeometry(0.085, 0.085, 0.075, 24);
          lg.rotateX(PI / 2); lg.scale(1.0, 1.55, 1.0);
          const lobe = mesh(lg, m('steel'), cx, CAM_Y, z + dz);
          lobe.rotation.z = ((zi * 83 + ci * 137 + di * 29) % 360) * PI / 180;
          g.add(lobe);
        });
      });
    });
    g.add(box(m('voidc'), 0.1, 0.02, 0.03, 0.42, CAM_Y, -1.57));                   // slot in the intake cam rear end
    g.add(ring(m('black'), 0.095, 0.02, 'z', -0.42, CAM_Y, 1.355));                // camshaft oil seals
    g.add(ring(m('black'), 0.095, 0.02, 'z', 0.42, CAM_Y, 1.355));

    // Spark plugs standing in the wells.
    BORE_Z.forEach(function (z) {
      g.add(cyl(m('steel'), 0.036, 0.036, 0.13, 16, 'y', 0, -0.36, z));
      g.add(hex(m('steel'), 0.062, 0.06, 'y', 0, -0.26, z));
      g.add(cyl(m('steelDark'), 0.05, 0.05, 0.3, 16, 'y', 0, -0.07, z));
      g.add(cyl(m('ceramic'), 0.045, 0.045, 0.5, 20, 'y', 0, 0.33, z));
      [0.2, 0.34, 0.48].forEach(function (y) { g.add(cyl(m('ceramic'), 0.056, 0.056, 0.025, 20, 'y', 0, y, z)); });
      g.add(cyl(m('steel'), 0.02, 0.02, 0.1, 10, 'y', 0, 0.62, z));
    });
    // Thermostat housing and coolant outlet on the front.
    g.add(cyl(m('alloyDark'), 0.17, 0.17, 0.22, 24, 'z', -0.45, 0.12, 1.45));
    g.add(cyl(m('alloy'), 0.12, 0.12, 0.1, 20, 'z', -0.45, 0.12, 1.6));
    g.add(cyl(m('alloyDark'), 0.075, 0.075, 0.26, 16, 'x', -0.62, 0.3, 1.45));
    return finish(g);
  }

  function headGasket(m) {
    const g = new T.Group();
    const s = rrShape(1.8, 2.7, 0.12);
    BORE_Z.forEach(function (z) { holeAt(s, 0, z, 0.3); });
    HEAD_BOLTS.forEach(function (b) { holeAt(s, b[0], b[1], 0.06); });
    COOLANT.forEach(function (b) { holeAt(s, b[0], b[1], 0.05); });
    [-0.75, 0.75].forEach(function (z) { holeAt(s, 0.2, z, 0.04); });              // oil feed and return
    g.add(mesh(flat(s, 0.03, 0.004), m('mls'), 0, 0, 0));
    BORE_Z.forEach(function (z) { g.add(ring(m('steel'), 0.315, 0.017, 'y', 0, 0.012, z)); });   // embossed fire rings
    return finish(g);
  }

  function oilPanGasket(m) {
    const g = new T.Group();
    const s = rrShape(1.96, 2.78, 0.14);
    s.holes.push(rrInto(new T.Path(), 1.5, 2.4, 0.1, 0, 0));
    for (let i = 0; i < 7; i++) {
      const z = -1.2 + i * 0.4;
      [-1, 1].forEach(function (sx) { holeAt(s, sx * 0.865, z, 0.04); });
    }
    [-0.5, 0, 0.5].forEach(function (x) { [-1, 1].forEach(function (sz) { holeAt(s, x, sz * 1.31, 0.04); }); });
    g.add(mesh(flat(s, 0.03, 0.004), m('black'), 0, 0, 0));
    return finish(g);
  }

  function oilPan(m) {
    const g = new T.Group();
    // Flange with its bolt heads underneath.
    const fl = rrShape(1.96, 2.78, 0.14);
    fl.holes.push(rrInto(new T.Path(), 1.5, 2.4, 0.1, 0, 0));
    g.add(mesh(flat(fl, 0.05, 0.006), m('pan'), 0, -0.025, 0));
    for (let i = 0; i < 7; i++) {
      const z = -1.2 + i * 0.4;
      [-1, 1].forEach(function (sx) { g.add(hex(m('steelDark'), 0.045, 0.04, 'y', sx * 0.865, -0.07, z)); });
    }
    // Pressed steel walls: a deep sump at the rear and a shallow front half.
    const deep = 0.6, shallow = 0.3, topHalf = 0.8, botHalf = 0.66;
    const sections = [{ z0: -1.38, z1: 0.1, d: deep }, { z0: 0.1, z1: 1.38, d: shallow }];
    sections.forEach(function (sec) {
      const len = sec.z1 - sec.z0, zc = (sec.z0 + sec.z1) / 2;
      const th = Math.atan2(topHalf - botHalf, sec.d);
      [-1, 1].forEach(function (sx) {
        const side = box(m('pan'), 0.03, Math.hypot(topHalf - botHalf, sec.d), len, sx * (topHalf + botHalf) / 2, -sec.d / 2, zc);
        side.rotation.z = -sx * th;
        g.add(side);
      });
      g.add(box(m('pan'), botHalf * 2, 0.03, len, 0, -sec.d, zc));                 // floor
    });
    // end walls
    g.add(box(m('pan'), topHalf * 2 - 0.1, deep, 0.03, 0, -deep / 2, -1.38));
    g.add(box(m('pan'), topHalf * 2 - 0.1, shallow, 0.03, 0, -shallow / 2, 1.38));
    g.add(box(m('pan'), botHalf * 2, deep - shallow, 0.03, 0, -(deep + shallow) / 2, 0.1)); // step between the two halves
    // Stiffening ribs under the sump and the drain boss.
    [-0.3, 0, 0.3].forEach(function (x) { g.add(box(m('pan'), 0.04, 0.03, 1.2, x, -deep - 0.025, -0.65)); });
    g.add(cyl(m('ironRaw'), 0.14, 0.14, 0.04, 28, 'y', 0, -deep - 0.03, -0.7));
    // Baffle tray inside the sump, visible from above.
    g.add(box(m('steelDark'), 1.1, 0.02, 0.7, 0, -deep + 0.2, -0.75));
    return finish(g);
  }

  function drainBolt(m) {
    const g = new T.Group();
    g.add(cyl(m('steel'), 0.17, 0.17, 0.025, 28, 'y', 0, -0.0125, 0));             // sealing flange
    g.add(hex(m('steel'), 0.13, 0.1, 'y', 0, -0.075, 0));                          // hex head
    g.add(cyl(m('steel'), 0.07, 0.07, 0.18, 20, 'y', 0, 0.09, 0));                 // shank
    for (let i = 0; i < 5; i++) g.add(ring(m('steelDark'), 0.07, 0.008, 'y', 0, 0.02 + i * 0.03, 0));
    return finish(g);
  }

  function crushWasher(m) {
    const g = new T.Group();
    const s = new T.Shape(); s.absarc(0, 0, 0.2, 0, PI * 2, false);
    s.holes.push(circle(0, 0, 0.08));
    g.add(mesh(flat(s, 0.03, 0.004), m('copper'), 0, 0, 0));
    return finish(g);
  }

  function oilFilter(m) {
    const g = new T.Group();            // axis along x, the base plate touches the block at x = 0
    g.add(cyl(m('steelDark'), 0.36, 0.36, 0.05, 32, 'x', 0.025, 0, 0));            // base plate
    g.add(ring(m('black'), 0.3, 0.025, 'x', 0.055, 0, 0));                         // rubber seal
    g.add(cyl(m('paintBlue'), 0.33, 0.33, 0.8, 40, 'x', 0.45, 0, 0));              // can
    g.add(cyl(m('white'), 0.334, 0.334, 0.26, 40, 'x', 0.42, 0, 0));               // label band
    g.add(cyl(m('red'), 0.336, 0.336, 0.04, 40, 'x', 0.42, 0, 0));
    const dome = new T.SphereGeometry(0.33, 36, 12, 0, PI * 2, 0, PI / 2);
    dome.scale(1, 0.32, 1); dome.rotateZ(-PI / 2);
    g.add(mesh(dome, m('paintBlue'), 0.85, 0, 0));
    g.add(ring(m('paintBlue'), 0.33, 0.02, 'x', 0.05, 0, 0));
    g.add(ring(m('paintBlue'), 0.33, 0.018, 'x', 0.84, 0, 0));
    g.add(hex(m('steelDark'), 0.1, 0.05, 'x', 0.96, 0, 0));
    return finish(g);
  }

  function crankPulley(m) {
    const g = new T.Group();            // axis along z, origin at the middle of the toothed gear
    g.add(mesh(toothedGear(0.25, 18, 0.12, 0), m('steel'), 0, 0, 0));
    g.add(cyl(m('steelDark'), 0.3, 0.3, 0.02, 32, 'z', 0, 0, -0.07));              // flange behind the gear
    g.add(cyl(m('steelDark'), 0.14, 0.14, 0.34, 24, 'z', 0, 0, 0.1));              // hub
    // Accessory pulley with three V grooves, made by turning a profile.
    const prof = [[0.15, 0], [0.45, 0], [0.45, 0.02], [0.41, 0.03], [0.45, 0.045], [0.41, 0.055], [0.45, 0.07], [0.41, 0.08], [0.45, 0.095], [0.45, 0.12], [0.15, 0.12], [0.15, 0]];
    const lathe = new T.LatheGeometry(prof.map(function (p) { return new T.Vector2(p[0], p[1]); }), 48);
    lathe.rotateX(PI / 2);
    const lm = mesh(lathe, m('steelDark'), 0, 0, 0.12);
    g.add(lm);
    g.add(cyl(m('steelDark'), 0.45, 0.15, 0.02, 48, 'z', 0, 0, 0.245));            // front web
    g.add(hex(m('steel'), 0.09, 0.06, 'z', 0, 0, 0.29));                           // crank bolt
    return finish(g);
  }

  function camPulleys(m) {
    const g = new T.Group();            // two toothed gears, one on each camshaft
    CAM_X.forEach(function (cx) {
      g.add(mesh(toothedGear(0.385, 35, 0.13, 4), m('steel'), cx, 0, 0));
      g.add(cyl(m('steelDark'), 0.42, 0.42, 0.02, 40, 'z', cx, 0, -0.075));
      g.add(cyl(m('steelDark'), 0.13, 0.13, 0.18, 20, 'z', cx, 0, 0.06));
      g.add(hex(m('steel'), 0.075, 0.05, 'z', cx, 0, 0.12));
    });
    return finish(g);
  }

  function waterPump(m) {
    const g = new T.Group();            // mounting plane at z = 0, pulley in front
    const body = new T.Shape();
    body.absarc(0, 0, 0.46, 0, PI * 2, false);
    const bolts = [];
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * PI * 2 + 0.2;
      bolts.push([Math.cos(a) * 0.38, Math.sin(a) * 0.38]);
      body.holes.push(circle(bolts[k][0], bolts[k][1], 0.035));
    }
    g.add(mesh(plateZ(body, 0.08, 0.01), m('alloy'), 0, 0, 0.04));
    bolts.forEach(function (b) { g.add(hex(m('steelDark'), 0.05, 0.03, 'z', b[0], b[1], 0.09)); });
    g.add(cyl(m('alloy'), 0.3, 0.26, 0.08, 32, 'z', 0, 0, 0.12));                  // volute housing
    g.add(cyl(m('alloyDark'), 0.14, 0.14, 0.12, 24, 'z', 0, 0, 0.17));             // bearing housing
    g.add(mesh(toothedGear(0.27, 22, 0.08, 4), m('steel'), 0, 0, 0.2));            // belt pulley
    g.add(cyl(m('steelDark'), 0.1, 0.1, 0.04, 20, 'z', 0, 0, 0.26));
    // Coolant inlet pipe downwards, with a hose flange, and the outlet spigot.
    g.add(cyl(m('alloy'), 0.13, 0.13, 0.32, 20, 'y', 0, -0.5, 0.06));
    g.add(cyl(m('alloy'), 0.17, 0.17, 0.03, 20, 'y', 0, -0.66, 0.06));
    g.add(cyl(m('alloyDark'), 0.07, 0.07, 0.2, 16, 'x', 0.38, 0.12, 0.08));
    // Impeller on the back, which sits inside the block.
    g.add(cyl(m('steel'), 0.27, 0.27, 0.02, 32, 'z', 0, 0, -0.02));
    for (let k = 0; k < 8; k++) {
      const a = k / 8 * PI * 2;
      const vane = box(m('steel'), 0.2, 0.02, 0.07, Math.cos(a) * 0.14, Math.sin(a) * 0.14, -0.065);
      vane.rotation.z = a + 0.5;
      g.add(vane);
    }
    g.add(cyl(m('steelDark'), 0.06, 0.06, 0.1, 16, 'z', 0, 0, -0.07));
    return finish(g);
  }

  function waterPumpGasket(m) {
    const g = new T.Group();
    const s = new T.Shape(); s.absarc(0, 0, 0.46, 0, PI * 2, false);
    s.holes.push(circle(0, 0, 0.3));
    for (let k = 0; k < 6; k++) { const a = k / 6 * PI * 2 + 0.2; s.holes.push(circle(Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0.035)); }
    g.add(mesh(plateZ(s, 0.02, 0.003), m('black'), 0, 0, 0));
    return finish(g);
  }

  function distributor(m) {
    const g = new T.Group();            // on the rear of the exhaust camshaft, the body points backwards (-z)
    g.add(cyl(m('alloy'), 0.27, 0.27, 0.05, 28, 'z', 0, 0, -0.025));               // mounting flange
    [-1, 1].forEach(function (sx) { g.add(cyl(m('alloy'), 0.07, 0.07, 0.05, 16, 'z', sx * 0.3, 0, -0.025)); });
    g.add(cyl(m('alloy'), 0.17, 0.2, 0.28, 28, 'z', 0, 0, -0.19));                 // housing
    g.add(cyl(m('bakelite'), 0.2, 0.2, 0.2, 28, 'z', 0, 0, -0.43));                // cap
    for (let k = 0; k < 4; k++) {
      const a = k / 4 * PI * 2 + PI / 4;
      g.add(cyl(m('bakelite'), 0.04, 0.045, 0.1, 12, 'z', Math.cos(a) * 0.12, Math.sin(a) * 0.12, -0.58));
    }
    g.add(cyl(m('bakelite'), 0.05, 0.05, 0.08, 12, 'z', 0, 0, -0.57));
    [-1, 1].forEach(function (sx) { g.add(box(m('steel'), 0.015, 0.1, 0.02, sx * 0.205, 0, -0.5)); });   // retaining clips
    return finish(g);
  }

  function distributorORing(m) {
    const g = new T.Group();
    g.add(ring(m('black'), 0.15, 0.025, 'z', 0, 0, 0));
    return finish(g);
  }

  function sidePlatePorts(shape) {
    BORE_Z.forEach(function (z) { shape.holes.push(rrInto(new T.Path(), 0.22, 0.3, 0.06, z, 0)); });
    MAINS_Z.forEach(function (z) { shape.holes.push(circle(z, 0.0, 0.034)); });
    return shape;
  }
  function sidePlateOutline(len, h) { return rrShape(len, h, 0.05); }

  function exhaustGasket(m) {
    const g = new T.Group();
    const s = sidePlatePorts(sidePlateOutline(2.62, 0.62));
    g.add(mesh(flatX(s, 0.02, 0.003), m('mls'), 0, 0, 0));
    return finish(g);
  }

  function exhaustManifold(m) {
    const g = new T.Group();            // flange face at x = 0, the pipes run out to -x
    const s = sidePlatePorts(sidePlateOutline(2.62, 0.62));
    const fl = flatX(s, 0.08, 0.006); fl.translate(-0.04, 0, 0);
    g.add(mesh(fl, m('ironRaw'), 0, 0, 0));
    MAINS_Z.forEach(function (z) { g.add(hex(m('steelDark'), 0.06, 0.05, 'x', -0.1, 0, z)); });
    // Four runners that join into one collector, then the down pipe.
    BORE_Z.forEach(function (z) {
      g.add(tube(m('ironRaw'), [[-0.07, 0, z], [-0.28, 0, z * 0.93], [-0.55, -0.12, z * 0.55], [-0.78, -0.3, z * 0.2], [-0.9, -0.4, z * 0.06]], 0.1, 30));
      g.add(ring(m('ironRaw'), 0.12, 0.02, 'x', -0.12, 0, z));
    });
    g.add(mesh(new T.CylinderGeometry(0.17, 0.2, 0.34, 20), m('ironRaw'), -0.93, -0.5, 0));
    g.add(cyl(m('ironRaw'), 0.15, 0.15, 0.3, 20, 'y', -0.93, -0.72, 0));
    g.add(cyl(m('ironRaw'), 0.27, 0.27, 0.07, 28, 'y', -0.93, -0.9, 0));
    for (let k = 0; k < 4; k++) { const a = k / 4 * PI * 2 + PI / 4; g.add(hex(m('steelDark'), 0.035, 0.05, 'y', -0.93 + Math.cos(a) * 0.2, -0.9, Math.sin(a) * 0.2)); }
    g.add(cyl(m('steel'), 0.04, 0.04, 0.16, 12, 'x', -1.12, -0.45, 0.08));         // oxygen sensor boss
    g.add(cyl(m('steelDark'), 0.025, 0.025, 0.18, 10, 'x', -1.26, -0.45, 0.08));
    return finish(g);
  }

  function intakeGasket(m) {
    const g = new T.Group();
    const s = sidePlatePorts(sidePlateOutline(2.62, 0.62));
    g.add(mesh(flatX(s, 0.02, 0.003), m('black'), 0, 0, 0));
    return finish(g);
  }

  function intakeManifold(m) {
    const g = new T.Group();            // flange face at x = 0, the plenum sits out to +x
    const s = sidePlatePorts(sidePlateOutline(2.62, 0.62));
    const fl = flatX(s, 0.08, 0.006); fl.translate(0.04, 0, 0);
    g.add(mesh(fl, m('nylon'), 0, 0, 0));
    MAINS_Z.forEach(function (z) { g.add(cyl(m('steelDark'), 0.07, 0.07, 0.04, 6, 'x', 0.1, 0, z)); });
    // Runners curving up to a plenum that runs along the engine.
    BORE_Z.forEach(function (z) {
      g.add(tube(m('nylon'), [[0.07, 0, z], [0.25, 0.03, z], [0.45, 0.2, z], [0.6, 0.42, z], [0.66, 0.55, z]], 0.095, 24));
    });
    g.add(cyl(m('nylon'), 0.27, 0.27, 2.3, 32, 'z', 0.68, 0.58, 0));
    [-1, 1].forEach(function (sz) { const e = new T.SphereGeometry(0.27, 24, 12); g.add(mesh(e, m('nylon'), 0.68, 0.58, sz * 1.15)); });
    [-1.0, -0.5, 0, 0.5, 1.0].forEach(function (z) { g.add(ring(m('nylon'), 0.275, 0.022, 'z', 0.68, 0.58, z)); });
    // Throttle body and intake tube at the front.
    g.add(cyl(m('alloy'), 0.2, 0.2, 0.3, 28, 'z', 0.68, 0.58, 1.45));
    g.add(cyl(m('nylon'), 0.17, 0.17, 0.36, 24, 'z', 0.68, 0.58, 1.75));
    g.add(box(m('black'), 0.14, 0.12, 0.1, 0.9, 0.58, 1.42));                      // throttle position sensor
    // Fuel rail and injectors.
    g.add(cyl(m('steel'), 0.045, 0.045, 2.05, 16, 'z', 0.32, 0.27, 0));
    BORE_Z.forEach(function (z) {
      g.add(cyl(m('brass'), 0.04, 0.035, 0.2, 14, 'y', 0.3, 0.14, z));
      g.add(box(m('black'), 0.09, 0.07, 0.1, 0.3, 0.33, z));
    });
    g.add(cyl(m('steel'), 0.03, 0.03, 0.2, 10, 'z', 0.32, 0.27, 1.12));
    return finish(g);
  }

  function coverGasket(m) {
    const g = new T.Group();
    const s = rrShape(1.7, 2.6, 0.12);
    s.holes.push(rrInto(new T.Path(), 1.42, 2.32, 0.18, 0, 0));
    [-1, 1].forEach(function (sx) { [-1.05, -0.35, 0.35, 1.05].forEach(function (z) { holeAt(s, sx * 0.78, z, 0.04); }); });
    g.add(mesh(flat(s, 0.02, 0.003), m('black'), 0, 0, 0));
    BORE_Z.forEach(function (z) {                                                    // spark plug tube seals
      const r = new T.Shape(); r.absarc(0, 0, 0.14, 0, PI * 2, false); r.holes.push(circle(0, 0, 0.1));
      g.add(mesh(flat(r, 0.025, 0.003), m('black'), 0, 0.002, z));
    });
    return finish(g);
  }

  function headCover(m) {
    const g = new T.Group();            // flange sits on the head, y = 0 at its underside
    g.add(mesh(flat(rrShape(1.7, 2.6, 0.12), 0.08, 0.01), m('cover'), 0, 0.04, 0));
    g.add(mesh(flat(rrShape(1.3, 2.3, 0.2), 0.42, 0.06), m('cover'), 0, 0.29, 0));
    // Cross ribs on top, spark plug tube bosses and the ignition coils that sit on them.
    [-1.1, -0.6, 0, 0.6, 1.1].forEach(function (z) { g.add(box(m('cover'), 0.95, 0.025, 0.05, 0, 0.565, z)); });
    BORE_Z.forEach(function (z) {
      g.add(cyl(m('cover'), 0.12, 0.13, 0.05, 28, 'y', 0, 0.58, z));
      g.add(cyl(m('black'), 0.085, 0.085, 0.1, 20, 'y', 0, 0.65, z));
      g.add(cyl(m('nylon'), 0.07, 0.07, 0.3, 20, 'y', 0, 0.85, z));
      g.add(cyl(m('steelDark'), 0.075, 0.075, 0.02, 20, 'y', 0, 0.78, z));
      g.add(box(m('nylon'), 0.1, 0.12, 0.09, 0.09, 0.9, z));
      g.add(box(m('black'), 0.05, 0.05, 0.05, 0.15, 0.9, z));
    });
    // Oil filler cap, breather nipple and the hold-down bolts on the flange.
    g.add(cyl(m('cover'), 0.16, 0.16, 0.03, 28, 'y', -0.43, 0.575, 0.95));
    g.add(cyl(m('red'), 0.12, 0.12, 0.08, 8, 'y', -0.43, 0.62, 0.95));
    g.add(cyl(m('black'), 0.05, 0.05, 0.18, 12, 'x', 0.72, 0.4, -0.9));
    [-1, 1].forEach(function (sx) {
      [-1.05, -0.35, 0.35, 1.05].forEach(function (z) {
        g.add(cyl(m('steel'), 0.085, 0.085, 0.015, 20, 'y', sx * 0.78, 0.155, z));
        g.add(hex(m('steel'), 0.055, 0.05, 'y', sx * 0.78, 0.19, z));
      });
    });
    return finish(g);
  }

  function grommets(m) {
    const g = new T.Group();            // same origin as the cover, the rings sit on its flange
    [-1, 1].forEach(function (sx) {
      [-1.05, -0.35, 0.35, 1.05].forEach(function (z) {
        const s = new T.Shape(); s.absarc(0, 0, 0.1, 0, PI * 2, false); s.holes.push(circle(0, 0, 0.045));
        g.add(mesh(flat(s, 0.06, 0.008), m('black'), sx * 0.78, 0.122, z));
        g.add(ring(m('black'), 0.075, 0.01, 'y', sx * 0.78, 0.153, z));
      });
    });
    return finish(g);
  }

  const BUILDERS = {
    engineBlock: engineBlock, cylinderHead: cylinderHead, headGasket: headGasket,
    oilPanGasket: oilPanGasket, oilPan: oilPan, oilPanDrainBolt: drainBolt, drainBoltWasher: crushWasher,
    oilFilter: oilFilter, timingBeltDrivePulley: crankPulley, camshaftPulley: camPulleys,
    waterPump: waterPump, waterPumpGasket: waterPumpGasket, distributor: distributor, distributorORing: distributorORing,
    exhaustManifoldGasket: exhaustGasket, exhaustManifold: exhaustManifold,
    intakeManifoldGasket: intakeGasket, intakeManifold: intakeManifold,
    cylinderHeadCoverGasket: coverGasket, cylinderHeadCover: headCover, rubberGrommets: grommets
  };

  /* Where each part sits when the engine is assembled (world units). */
  const ASSEMBLED = {
    oilPanDrainBolt: [0, -1.375, -0.7],
    drainBoltWasher: [0, -1.36, -0.7],
    oilPan: [0, -0.68, 0],
    oilPanGasket: [0, -0.665, 0],
    engineBlock: [0, 0, 0],
    oilFilter: [1.0, -0.3, 0.55],
    timingBeltDrivePulley: [0, -0.35, 1.5],
    waterPumpGasket: [0.5, 0.1, 1.36],
    waterPump: [0.5, 0.1, 1.375],
    headGasket: [0, 0.665, 0],
    cylinderHead: [0, 1.11, 0],
    camshaftPulley: [0, 1.63, 1.5],
    distributorORing: [-0.42, 1.63, -1.35],
    distributor: [-0.42, 1.63, -1.37],
    exhaustManifoldGasket: [-0.91, 1.01, 0],
    exhaustManifold: [-0.92, 1.01, 0],
    intakeManifoldGasket: [0.91, 1.01, 0],
    intakeManifold: [0.92, 1.01, 0],
    cylinderHeadCoverGasket: [0, 1.545, 0],
    cylinderHeadCover: [0, 1.555, 0],
    rubberGrommets: [0, 1.555, 0]
  };

  /* How each part moves out when the view is exploded. Parts on the head rise with it. */
  const EXPLODE = {
    oilPanDrainBolt: [0, -2.6, 0], drainBoltWasher: [0, -2.2, 0], oilPan: [0, -1.6, 0], oilPanGasket: [0, -1.0, 0],
    engineBlock: [0, 0, 0], oilFilter: [2.0, -0.3, 0.3], timingBeltDrivePulley: [0, -0.4, 2.4],
    waterPumpGasket: [0.9, 0, 1.5], waterPump: [1.2, 0.2, 2.5],
    headGasket: [0, 1.0, 0], cylinderHead: [0, 1.8, 0], camshaftPulley: [0, 1.8, 2.4],
    distributorORing: [0, 1.8, -1.6], distributor: [0, 1.8, -2.8],
    exhaustManifoldGasket: [-1.6, 1.8, 0], exhaustManifold: [-2.9, 1.8, 0],
    intakeManifoldGasket: [1.6, 1.8, 0], intakeManifold: [3.0, 1.8, 0],
    cylinderHeadCoverGasket: [0, 2.7, 0], rubberGrommets: [0, 3.1, 0], cylinderHeadCover: [0, 3.5, 0]
  };

  /* Colour of the dot beside each part in the parts list. */
  const DOT = {
    engineBlock: 0x4b4f55, cylinderHead: 0xb4bac2, cylinderHeadCover: 0x24272c, oilPan: 0x2c3036, oilFilter: 0x1d4a9c,
    exhaustManifold: 0x5b4b41, intakeManifold: 0x1e2125, waterPump: 0xb4bac2, distributor: 0x4a2c1a,
    headGasket: 0xc6cacf, drainBoltWasher: 0xc0703a, oilPanDrainBolt: 0xcfd4da
  };

  /* A bright studio for the metal to reflect: a soft gradient dome and a few light boxes. */
  function environment(renderer, scene) {
    const env = new T.Scene();
    const sg = new T.SphereGeometry(40, 32, 16);
    const col = [], p = sg.attributes.position;
    const top = new T.Color(0xffffff), mid = new T.Color(0xcfd8e3), low = new T.Color(0x7e8996);
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / 40;
      const c = y > 0 ? mid.clone().lerp(top, y) : mid.clone().lerp(low, -y);
      col.push(c.r, c.g, c.b);
    }
    sg.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    env.add(new T.Mesh(sg, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
    const panel = function (w, h, x, y, z, k) {
      const mat = new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide });
      mat.color.setScalar(k);
      const m = new T.Mesh(new T.PlaneGeometry(w, h), mat);
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(30, 12, 0, 30, 0, 5);            // overhead softbox
    panel(14, 18, -28, 8, 12, 3);          // key light
    panel(12, 14, 26, 6, -10, 2.2);        // rim light
    panel(26, 4, 0, 4, 32, 1.6);           // front strip
    const pm = new T.PMREMGenerator(renderer);
    const rt = pm.fromScene(env, 0.03);
    scene.environment = rt.texture;
    pm.dispose();
  }

  window.EngineModel = {
    build: function (id) { const f = BUILDERS[id]; return f ? f(palette()) : new T.Group(); },
    assembled: ASSEMBLED,
    explode: EXPLODE,
    dot: DOT,
    environment: environment
  };
})();
