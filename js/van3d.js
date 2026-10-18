/* Van3D: the van as one 3D model (js/model3d.js), the same everywhere it is seen: parked in the yard and at River
   Landing (js/modelsprite.js), on the road, the garage preview and the title (js/perspective.js van), at the
   workbench (js/bench.js). Its look is the save's: the paint job (js/upgrades.js PAINT_LOOKS: body, roof, trim,
   bumpers, rims and a decal on every side and the hood), the armor, the ram plow and the engine gear by their
   upgrade levels, the dents by its health, and (where the caller wants it) the roof gun.

   Model units are the road's (Van3D.L long, W wide, H to the roof); origin the middle of its footprint on the ground;
   x its right, y forward (the nose at +L/2), z up.

   Van3D.sig(u, o)        a string that changes whenever the van would look different (look, gear, dents, gun)
   Van3D.mesh(u, o)       the Model3D model (built once per sig and kept)
   Van3D.draw(ctx, view, u, o)   Model3D.draw with it
   Van3D.dentTier(share)  0 .. DENTS.length: how dented it looks at this share of its health
   Van3D.dentNow()        the same for the van now (a trip's van health on a trip, else the save's)
   u: the upgrades { armor, bumper, engine, paint, damage, fireRate, spread } (missing ones 0)
   o: { dent: 0..2, gun: true to stand the roof gun on it (the road draws its own, aimed: false there) }

   The shape: a cargo van with a short hood. The cab and cargo box (one part) stands on the wheel wells' top (WELL),
   from the tail to the cowl: its windshield rises at about 55 degrees from the cowl, its roof is flat with a bevelled
   edge, its back corners are cut. Under the hood is the nose, and under both the body runs end to end down to the sill:
   its wheel wells are dark on its sides, each wheel a round face standing on its well (the tires' feet a dark block
   under each axle), its bumpers a band across each end. Then the mirrors, the gear by level, the roof gun. Every part
   is convex and none cuts into another (Model3D orders the parts by a plane between them); where two meet, the faces
   between them are hidden. Paint, trim, glass, lights, plates and dents are decals: each design is drawn once in the
   van's own side, top or end view and laid on every face it crosses, cut to that face, so a stripe runs on from the
   nose to the tail and a design sweeps backward on both sides (text reads left to right on each).

   It is drawn every frame on the road, so it is lean: at most VAN_OPS canvas calls (tests/validate-art.js) with all
   its gear, the gun and heavy dents. lod 1 drops the fine decals and small gear (mirrors, stacks, the snorkel, the
   spare, the ladder, most of the gun), lod 2 draws only the body, the wheels and the plow. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const M = ZSR.Model3D;
  if (!M) return;

  const L = 118;
  const W = 66;
  const H = 50;
  // the van's health share under which it shows dents (tier 1) and heavy dents (tier 2): the yard's wreckers claw it
  // (js/yardwreck.js), and a hard trip home shows too
  const DENTS = [0.75, 0.5];

  /* ---------- The shape, in road units ---------- */
  const HW = W / 2;
  const YN = L / 2; // the nose
  const YT = -L / 2; // the tail
  const EDGE = 2.5; // the roof's bevelled edge: this far down the sides and in from them
  const CORNER = 2; // the cut on the body's upright corners
  const WELL = 24; // the wheel wells' top: the cab and cargo box stand on it
  const SILL = 9; // the body's lowest edge
  const COWL = [37, 30]; // (y, z) where the hood meets the windshield
  const SHIELD = [25, 47]; // (y, z) the windshield's top: it rises 17 in 12, about 55 degrees from level
  const NOSE_Z = 27.5; // the hood's front edge
  const BUMP = { z0: SILL, z1: 14.5 }; // the bumpers: a band of their own colour across each end of the body
  // the wheels: radius, sides; where the front and rear pairs stand; how far each well runs ahead and behind
  const WH = { r: 11, n: 10, front: 39, rear: -35, arch: 13 };
  const ARCH_F = [WH.front - WH.arch, WH.front + WH.arch];
  const ARCH_R = [WH.rear - WH.arch, WH.rear + WH.arch];
  // the roof gun's mount, where js/perspective.js gun stands it (0.1 of the van's length behind its middle), and its
  // barrels' height (Persp.GUN_Z: the roof and 9)
  const GUN = { y: -0.1 * L, z: H + 9 };
  // the cab door window (side view: y forward, z up): its bottom, top and back; its front runs PILLAR behind the
  // windshield's edge
  const WIN = { z0: 32, z1: 45.5, y0: 12, pillar: 3 };
  const SHIELD_Y = (z) => COWL[0] - ((z - COWL[1]) * (COWL[0] - SHIELD[0])) / (SHIELD[1] - COWL[1]); // the windshield's edge at height z
  const SLIDE = [-21, 7]; // the sliding door's back and front
  const CAB_DOOR = 9.5; // the cab door's back edge
  // the roof's flat top (top view): out to x on each side, from y0 at the back (its bevel runs on down to the back
  // doors) to y1, where the windshield's header bevel starts
  const ROOF = { x: HW - EDGE, y0: YT + EDGE, y1: SHIELD[0] + SHIELD[1] - H };
  // the roof rack's tray (top view; engineGear, from Engine 1): it stands on the roof, so a roof decal wholly under it is
  // never seen and is left out. Seen from the road's camera (behind and above) the roof's back half is the nearest and
  // biggest part of the van, so each paint job lays a big roof design there for a van with no rack, and the rest round
  // the rack and the gun's ring (at GUN.y; the road's is 13 in radius, the model's 11): along the roof's sides and
  // ahead of the ring
  const RACK = { x0: -25, y0: -55, x1: 25, y1: -27 };

  /* ---------- Fixed colours (the look's own come from PAINT_LOOKS) ---------- */
  const GLASS = "#33414c";
  const GLINT = "#6d8597";
  const TIRE = "#1b1c1f";
  const TREAD = "#24262a";
  const UNDER = "#141518"; // under the body and in the wheel wells
  const STEEL = "#868d94"; // armor plates
  const STEEL_DK = "#5d636b";
  const PLOW = "#6e7278";
  const RIVET = "#2f3136";
  const LAMP = "#ecd98e";
  const SIGNAL = "#e8a33a";
  const TAIL = "#b3261e";
  const CREAM = "#f3eee0";
  const GRILLE = "#202327";
  const MESH = "rgba(230,225,210,0.8)";
  const HOLLOW = "rgba(0,0,0,0.32)"; // a dent
  const RIM_LIGHT = "rgba(255,255,255,0.4)";
  const SCRATCH = "#bfc3c7";
  const GRIME = "rgba(60,40,20,0.3)";
  const INK = "#0f1012";
  const GUNMETAL = "#2f3136";
  const BARREL = "#4b5057";

  const lookOf = (u) => {
    const looks = ZSR.Upgrades.PAINT_LOOKS;
    return looks[Math.max(0, Math.min((u && u.paint) | 0, looks.length - 1))];
  };
  const gearOf = (u, o) => ({
    armor: (u && u.armor) | 0,
    bumper: (u && u.bumper) | 0,
    engine: (u && u.engine) | 0,
    paint: (u && u.paint) | 0,
    damage: (u && u.damage) | 0,
    fireRate: (u && u.fireRate) | 0,
    spread: (u && u.spread) | 0,
    dent: (o && o.dent) | 0,
    gun: !!(o && o.gun),
  });
  function sig(u, o) {
    const g = gearOf(u, o);
    return "p" + g.paint + "a" + g.armor + "b" + g.bumper + "e" + g.engine + "d" + g.dent + (g.gun ? "g" + g.damage + g.fireRate + g.spread : "");
  }

  /* ---------- Small helpers ---------- */
  const TAU = Math.PI * 2;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  function norm(a) {
    const l = Math.sqrt(dot(a, a)) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  }
  /** The outward unit normal of a polygon wound counter-clockwise seen from outside (from the whole outline). */
  function normal(P) {
    let x = 0;
    let y = 0;
    let z = 0;
    for (let i = 0; i < P.length; i++) {
      const a = P[i];
      const b = P[(i + 1) % P.length];
      x += (a[1] - b[1]) * (a[2] + b[2]);
      y += (a[2] - b[2]) * (a[0] + b[0]);
      z += (a[0] - b[0]) * (a[1] + b[1]);
    }
    return norm([x, y, z]);
  }
  /** "#rrggbb" mixed toward "#rrggbb" b by t. */
  function mix(a, b, t) {
    const p = M.rgb(a);
    const q = M.rgb(b);
    const c = (i) => Math.round(p[i] + (q[i] - p[i]) * t);
    return "#" + ((1 << 24) | (c(0) << 16) | (c(1) << 8) | c(2)).toString(16).slice(1);
  }
  /** A small seeded random (the dents and rust land in the same spots every time the van is built). */
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  /* ---------- Convex solids ---------- */
  /** Points in a plane (unit normal n) as a convex polygon wound counter-clockwise about n (inner and repeated points
      dropped). */
  function polyOf(pts, n) {
    const e1 = norm(cross(Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0], n));
    const e2 = cross(n, e1);
    const P = pts.map((p) => ({ p, a: dot(p, e1), b: dot(p, e2) })).sort((s, t) => s.a - t.a || s.b - t.b);
    const turn = (o, s, t) => (s.a - o.a) * (t.b - o.b) - (s.b - o.b) * (t.a - o.a);
    const lo = [];
    for (const q of P) {
      while (lo.length >= 2 && turn(lo[lo.length - 2], lo[lo.length - 1], q) <= 1e-9) lo.pop();
      lo.push(q);
    }
    const hi = [];
    for (let i = P.length - 1; i >= 0; i--) {
      const q = P[i];
      while (hi.length >= 2 && turn(hi[hi.length - 2], hi[hi.length - 1], q) <= 1e-9) hi.pop();
      hi.push(q);
    }
    return lo.slice(0, -1).concat(hi.slice(0, -1)).map((q) => q.p);
  }
  /** The box x0..x1, y0..y1, z0..z1 cut by planes: each cut { n, p, tag } keeps what its normal n points away from, and
      its cut face is tagged tag. Returns the faces as { pts, tag } (corners counter-clockwise seen from outside; the
      box's own sides tagged front (+y), back, right (+x), left, top, bottom). A corner on an edge two faces share is
      worked out the same way for both, so they meet exactly. */
  function solid(x0, y0, z0, x1, y1, z1, cuts) {
    let faces = [
      { tag: "front", pts: [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]] },
      { tag: "back", pts: [[x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y0, z0]] },
      { tag: "right", pts: [[x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [x1, y0, z0]] },
      { tag: "left", pts: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]] },
      { tag: "top", pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] },
      { tag: "bottom", pts: [[x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [x0, y0, z0]] },
    ];
    const E = 1e-7;
    for (const c of cuts || []) {
      const n = norm(c.n);
      const d = dot(n, c.p);
      const cap = [];
      const next = [];
      for (const f of faces) {
        const out = [];
        const P = f.pts;
        for (let i = 0; i < P.length; i++) {
          const a = P[i];
          const b = P[(i + 1) % P.length];
          const da = dot(n, a) - d;
          const db = dot(n, b) - d;
          if (da <= E) {
            out.push(a);
            if (da >= -E) cap.push(a);
          }
          if ((da < -E && db > E) || (da > E && db < -E)) {
            // from the lesser end (by its coordinates), so both faces on this edge get the same corner
            const swap = a[0] > b[0] || (a[0] === b[0] && (a[1] > b[1] || (a[1] === b[1] && a[2] > b[2])));
            const [p, q, dp, dq] = swap ? [b, a, db, da] : [a, b, da, db];
            const t = dp / (dp - dq);
            const x = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
            out.push(x);
            cap.push(x);
          }
        }
        if (out.length >= 3) next.push({ tag: f.tag, pts: out });
      }
      const capPts = polyOf(cap, n);
      if (capPts.length >= 3) next.push({ tag: c.tag, pts: capPts });
      faces = next;
    }
    // drop slivers a cut left (a face cut down to a line)
    return faces.filter((f) => {
      let area = 0;
      for (let i = 1; i + 1 < f.pts.length; i++) {
        const c = cross(sub(f.pts[i], f.pts[0]), sub(f.pts[i + 1], f.pts[0]));
        area += Math.sqrt(dot(c, c));
      }
      return area > 1e-6;
    });
  }
  /** The convex hull of a few points (the gear's small parts), as faces { pts, n }. */
  function hull(P) {
    let size = 0;
    for (const p of P) for (const q of P) size = Math.max(size, Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2]));
    const e = 1e-6 * (size || 1);
    const planes = [];
    const faces = [];
    for (let i = 0; i < P.length; i++) {
      for (let j = i + 1; j < P.length; j++) {
        for (let k = j + 1; k < P.length; k++) {
          const c = cross(sub(P[j], P[i]), sub(P[k], P[i]));
          if (dot(c, c) < 1e-12 * size * size) continue;
          let n = norm(c);
          let d = dot(n, P[i]);
          let pos = 0;
          let neg = 0;
          for (const q of P) {
            const s = dot(n, q) - d;
            if (s > e) pos++;
            else if (s < -e) neg++;
          }
          if (pos && neg) continue;
          if (pos) {
            n = [-n[0], -n[1], -n[2]];
            d = -d;
          }
          if (planes.some((q) => dot(q.n, n) > 1 - 1e-9 && Math.abs(q.d - d) < e)) continue;
          planes.push({ n, d });
          faces.push({ pts: polyOf(P.filter((q) => Math.abs(dot(n, q) - d) <= e), n), n });
        }
      }
    }
    return faces.filter((f) => f.pts.length >= 3);
  }
  /** A box's corner points (for hull). */
  const corners = (x0, y0, z0, x1, y1, z1) => [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  /** A round thing's corner points: n round a centre c, radius r, at a0 and a1 along axis ("x", "y" or "z"). */
  function roundPts(axis, c, r, a0, a1, n) {
    const out = [];
    for (const a of [a0, a1]) {
      for (let i = 0; i < n; i++) {
        const t = (i / n) * TAU + Math.PI / n;
        const s = c[0] + Math.cos(t) * r;
        const u = c[1] + Math.sin(t) * r;
        out.push(axis === "x" ? [a, s, u] : axis === "y" ? [s, a, u] : [s, u, a]);
      }
    }
    return out;
  }

  /* ---------- Decal designs: points in a view of the van, laid on the faces they cross ----------
     side: (y forward, z up) on the body's left and right panels; top: (x right, y forward) on the hood and roof; end:
     (x right, z up) on the front and back panels and the windshield. */
  const SPACE = { side: "side", hood: "top", roof: "top", front: "end", back: "end", shield: "end" };
  /** The point of a design (a, b) on face r's plane, in model space. */
  function onFace(r, space, a, b) {
    const n = r.n;
    if (space === "side") return [(r.d - n[1] * a - n[2] * b) / n[0], a, b];
    if (space === "top") return [a, b, (r.d - n[0] * a - n[1] * b) / n[2]];
    return [a, (r.d - n[0] * a - n[2] * b) / n[1], b];
  }
  const inFrame = (r, p) => {
    const d = sub(p, r.o);
    return [dot(d, r.u), dot(d, r.v)];
  };
  /** A polygon (any shape) cut to a convex outline (its corners in either winding). */
  function clipPoly(poly, out) {
    let area = 0;
    for (let i = 0; i < out.length; i++) area += out[i][0] * out[(i + 1) % out.length][1] - out[(i + 1) % out.length][0] * out[i][1];
    const sg = area >= 0 ? 1 : -1;
    let P = poly;
    for (let i = 0; i < out.length && P.length; i++) {
      const a = out[i];
      const b = out[(i + 1) % out.length];
      const ex = b[0] - a[0];
      const ey = b[1] - a[1];
      const side = (p) => sg * (ex * (p[1] - a[1]) - ey * (p[0] - a[0]));
      const Q = [];
      for (let k = 0; k < P.length; k++) {
        const p = P[k];
        const q = P[(k + 1) % P.length];
        const sp = side(p);
        const sq = side(q);
        if (sp >= 0) Q.push(p);
        if (sp >= 0 !== sq >= 0) {
          const t = sp / (sp - sq);
          Q.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
        }
      }
      P = Q;
    }
    // repeated corners out
    return P.filter((p, i) => {
      const q = P[(i + 1) % P.length];
      return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) > 1e-6;
    });
  }
  /** An open line cut to a convex outline: the pieces inside. */
  function clipLine(pts, out) {
    let area = 0;
    for (let i = 0; i < out.length; i++) area += out[i][0] * out[(i + 1) % out.length][1] - out[(i + 1) % out.length][0] * out[i][1];
    const sg = area >= 0 ? 1 : -1;
    const pieces = [];
    let cur = null;
    for (let i = 0; i + 1 < pts.length; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      let t0 = 0;
      let t1 = 1;
      for (let k = 0; k < out.length && t0 <= t1; k++) {
        const a = out[k];
        const b = out[(k + 1) % out.length];
        const ex = b[0] - a[0];
        const ey = b[1] - a[1];
        const sp = sg * (ex * (p[1] - a[1]) - ey * (p[0] - a[0]));
        const sq = sg * (ex * (q[1] - a[1]) - ey * (q[0] - a[0]));
        if (sp < 0 && sq < 0) t1 = -1;
        else if (sp < 0) t0 = Math.max(t0, sp / (sp - sq));
        else if (sq < 0) t1 = Math.min(t1, sp / (sp - sq));
      }
      if (t0 >= t1) {
        cur = null;
        continue;
      }
      const A = [p[0] + (q[0] - p[0]) * t0, p[1] + (q[1] - p[1]) * t0];
      const Bq = [p[0] + (q[0] - p[0]) * t1, p[1] + (q[1] - p[1]) * t1];
      if (cur && t0 === 0) cur.push(Bq);
      else pieces.push((cur = [A, Bq]));
      if (t1 < 1) cur = null;
    }
    return pieces;
  }
  const inside = (p, out) => clipPoly([p, [p[0] + 1e-3, p[1]], [p[0], p[1] + 1e-3]], out).length >= 3;

  /** The kit one van is built with: its parts, the faces decals may land on, and the decal layers. */
  function kit(B, look, g) {
    const faces = []; // { f, n, d, o, u, v, out, kind }
    const k = { B, look, g, faces };
    /** Lay faces out as one part; mat(face) -> { fill, kind, hide, glow }. o: Builder.part's (name, lod, ink, bias).
        Returns the faces' records. */
    k.part = (list, mat, o) => {
      B.part(o);
      const recs = [];
      for (const fc of list) {
        const m = mat(fc) || {};
        const n = normal(fc.pts);
        // the decal frame: v up the face (forward on a face lying nearly flat), u = v x n (left to right from outside)
        const up = Math.abs(n[2]) > 0.8 ? [0, 1, 0] : [0, 0, 1];
        const v = norm(sub(up, n.map((c) => c * dot(up, n))));
        const u = cross(v, n);
        const f = B.face(fc.pts, m.fill || look.body, { u, v, o: fc.pts[0], hide: !!m.hide, glow: !!m.glow });
        const r = { f, n, d: dot(n, fc.pts[0]), o: fc.pts[0], u, v, kind: m.kind || "", tag: fc.tag };
        r.out = fc.pts.map((p) => inFrame(r, p));
        recs.push(r);
        if (r.kind && !m.hide) faces.push(r);
      }
      return recs;
    };
    /** The faces of a kind (and of a side: +1 right, -1 left, for side faces). */
    const of = (kind, side) => faces.filter((r) => r.kind === kind && (!side || r.n[0] * side > 0));
    // what stands on a kind's faces and hides them (the rack on the roof): [kind, a0, b0, a1, b1] in its view
    const covers = [];
    /** A part stands on this much of a kind's faces (a box in its view): designs wholly under it are left out. */
    k.cover = (kind, a0, b0, a1, b1) => covers.push([kind, a0, b0, a1, b1]);
    const covered = (kind, pts) => covers.some(([c, a0, b0, a1, b1]) => c === kind && pts.every(([a, b]) => a >= a0 && a <= a1 && b >= b0 && b <= b1));
    /** A filled design (points in its kind's view) on every face of that kind it crosses. o: Builder.poly's. */
    k.poly = (kind, pts, fill, o, side) => {
      const space = SPACE[kind];
      if (covered(kind, pts)) return;
      for (const r of of(kind, side)) {
        const P = clipPoly(pts.map(([a, b]) => inFrame(r, onFace(r, space, a, b))), r.out);
        if (P.length >= 3 && P.length <= M.MAX_V) B.poly(r.f, P, fill, o);
      }
    };
    /** An open line design, w ink widths wide. */
    k.line = (kind, pts, color, w, o, side) => {
      const space = SPACE[kind];
      if (covered(kind, pts)) return;
      for (const r of of(kind, side)) for (const P of clipLine(pts.map(([a, b]) => inFrame(r, onFace(r, space, a, b))), r.out)) B.line(r.f, P, color, w, o);
    };
    /** Text with its middle at (a, b), size units tall, on the face of that kind it lands on (both sides for a side). */
    k.text = (kind, a, b, str, size, fill, o) => {
      const space = SPACE[kind];
      const half = String(str).length * size * 0.3; // (about half its width: the font's letters are narrow)
      if (covered(kind, [[a - half, b - size / 2], [a + half, b + size / 2]])) return;
      for (const r of of(kind)) {
        const p = inFrame(r, onFace(r, space, a, b));
        if (inside(p, r.out)) B.text(r.f, p[0], p[1], str, size, fill, Object.assign({ align: "center", base: "middle" }, o));
      }
    };
    /** The same on one face record (a gear part's own face): points in that face's frame. */
    k.on = (r, pts, fill, o) => {
      const P = clipPoly(pts, r.out);
      if (P.length >= 3) B.poly(r.f, P, fill, o);
    };
    return k;
  }
  /** The record of the face of recs that faces most along dir. */
  const facing = (recs, dir) => recs.reduce((best, r) => (dot(r.n, dir) > dot(best.n, dir) ? r : best), recs[0]);
  /** A face record's own frame point of a model point. */
  const frameOf = (r, p) => inFrame(r, p);
  /** A face record's reach in its own frame: [a0, b0, a1, b1]. */
  function span(r) {
    const a = r.out.map((p) => p[0]);
    const b = r.out.map((p) => p[1]);
    return [Math.min(...a), Math.min(...b), Math.max(...a), Math.max(...b)];
  }

  /** Bands across face r (each w long from each of ats along y, the van's length), as one outline in its frame
      (joined along its edge, outside it, so the joins are cut away): p is any point on the face. */
  function bands(r, ats, w, p) {
    const P = [];
    for (const y of ats) {
      const q0 = frameOf(r, [p[0], y, p[2]]);
      const q1 = frameOf(r, [p[0], y + w, p[2]]);
      if (Math.abs(q1[0] - q0[0]) >= Math.abs(q1[1] - q0[1])) {
        const a0 = Math.min(q0[0], q1[0]);
        const a1 = Math.max(q0[0], q1[0]);
        P.push([a0, -99], [a0, 99], [a1, 99], [a1, -99]);
      } else {
        const b0 = Math.min(q0[1], q1[1]);
        const b1 = Math.max(q0[1], q1[1]);
        P.push([-99, b0], [99, b0], [99, b1], [-99, b1]);
      }
    }
    return P;
  }

  /* ---------- Shapes for designs (2D points) ---------- */
  const rect = (a0, b0, a1, b1) => [[a0, b0], [a1, b0], [a1, b1], [a0, b1]];
  /** A rectangle with its corners cut by c. */
  const rrect = (a0, b0, a1, b1, c) => [[a0 + c, b0], [a1 - c, b0], [a1, b0 + c], [a1, b1 - c], [a1 - c, b1], [a0 + c, b1], [a0, b1 - c], [a0, b0 + c]];
  function ellipse(ca, cb, ra, rb, n, t0, t1) {
    const out = [];
    const a0 = t0 == null ? 0 : t0;
    const a1 = t1 == null ? TAU : t1;
    const full = t1 == null;
    const k = full ? n : n + 1;
    for (let i = 0; i < k; i++) {
      const t = a0 + ((a1 - a0) * i) / n;
      out.push([ca + Math.cos(t) * ra, cb + Math.sin(t) * rb]);
    }
    return out;
  }
  /** A five-pointed star, point up. */
  function star(ca, cb, r0, r1) {
    const out = [];
    for (let i = 0; i < 10; i++) {
      const t = Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? r1 : r0;
      out.push([ca + Math.cos(t) * r, cb + Math.sin(t) * r]);
    }
    return out;
  }
  /** A ring (an outer circle and an inner one run back the other way, joined by a seam of no width). */
  function ring(ca, cb, r0, r1, n) {
    const o = ellipse(ca, cb, r1, r1, n);
    const i = ellipse(ca, cb, r0, r0, n).reverse();
    return o.concat([o[0], i[i.length - 1]], i);
  }
  /** A polygon pushed out by e (a frame round a window): each corner along its two edges' outward normals. */
  function grow(P, e) {
    let area = 0;
    for (let i = 0; i < P.length; i++) area += P[i][0] * P[(i + 1) % P.length][1] - P[(i + 1) % P.length][0] * P[i][1];
    const s = area >= 0 ? 1 : -1;
    const n = P.length;
    return P.map((p, i) => {
      const a = P[(i + n - 1) % n];
      const b = P[(i + 1) % n];
      const e1 = norm([p[0] - a[0], p[1] - a[1], 0]);
      const e2 = norm([b[0] - p[0], b[1] - p[1], 0]);
      const n1 = [e1[1] * s, -e1[0] * s];
      const n2 = [e2[1] * s, -e2[0] * s];
      const m = [n1[0] + n2[0], n1[1] + n2[1]];
      const k = (n1[0] * m[0] + n1[1] * m[1]) || 1;
      return [p[0] + (m[0] / k) * e, p[1] + (m[1] / k) * e];
    });
  }
  /** Slanted stripes across a band a0..a1 by b0..b1 (every period, w wide, their tops leaning by lean) as outlines of
      at most 12 stripes each, the stripes joined along the band's foot (the joins have no width). */
  function stripes(a0, a1, b0, b1, period, w, lean) {
    const out = [];
    let P = [];
    for (let a = a0 - Math.abs(lean) - period; a < a1 + period; a += period) {
      P.push([a, b0], [a + lean, b1], [a + w + lean, b1], [a + w, b0]);
      if (P.length >= 48) {
        out.push(clipPoly(P, rect(a0, b0, a1, b1)));
        P = [];
      }
    }
    if (P.length) out.push(clipPoly(P, rect(a0, b0, a1, b1)));
    return out.filter((Q) => Q.length >= 3);
  }
  /** A band hanging from b0 down thick, with drips (each [at, width, length]) running down from it: one outline
      (a along the band, b up). */
  function drips(a0, a1, b0, thick, list) {
    const out = [[a1, b0], [a0, b0], [a0, b0 - thick]];
    const bot = b0 - thick;
    list
      .slice()
      .sort((p, q) => p[0] - q[0])
      .forEach(([a, w, len]) => {
        const h = w / 2;
        const end = bot - len;
        out.push([a - h, bot], [a - h * 0.55, end + h * 0.4], [a, end - h * 0.6], [a + h * 0.55, end + h * 0.4], [a + h, bot]);
      });
    out.push([a1, bot]);
    return out;
  }
  /** A ragged blob (rust, primer): n corners round (ca, cb), radii ra x rb jittered by the seeded r. */
  function blob(ca, cb, ra, rb, n, r) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * TAU;
      const k = 0.7 + r() * 0.45;
      out.push([ca + Math.cos(t) * ra * k, cb + Math.sin(t) * rb * k]);
    }
    return out;
  }
  const shift = (P, da, db) => P.map(([a, b]) => [a + da, b + db]);
  /** P mirrored across a = 0 (the other side of the van's middle: a design and its twin). */
  const mirror = (P) => P.map(([a, b]) => [-a, b]);
  /** The radiation trefoil round (ca, cb): its three blades (r out, from hub) as one outline, each blade's inner arc
      running on to the next blade. */
  function trefoil(ca, cb, r, hub) {
    const T = [];
    for (let i = 0; i < 3; i++) {
      const t0 = Math.PI / 2 + (i * TAU) / 3 - Math.PI / 6;
      for (let j = 0; j <= 2; j++) T.push([ca + Math.cos(t0 + (j * Math.PI) / 6) * r, cb + Math.sin(t0 + (j * Math.PI) / 6) * r]);
      T.push([ca + Math.cos(t0 + Math.PI / 3) * hub, cb + Math.sin(t0 + Math.PI / 3) * hub], [ca + Math.cos(t0 + Math.PI * (2 / 3)) * hub, cb + Math.sin(t0 + Math.PI * (2 / 3)) * hub]);
    }
    return T;
  }

  /* ---------- The body ---------- */
  function body(k) {
    const { look } = k;
    const panel = (kind) => ({ fill: look.body, kind });
    const roof = { fill: look.roof, kind: "roof" };
    const hidden = { fill: UNDER, hide: true };
    // the upright corners at the back cut
    const cornerCuts = (y, dy) => [
      { n: [1, dy, 0], p: [HW, y, 0], tag: "backR" },
      { n: [-1, dy, 0], p: [-HW, y, 0], tag: "backL" },
    ];
    const ends = { backR: panel("back"), backL: panel("back") };
    // the cab and cargo box: from the tail to the cowl, on the wells' top; the windshield, the roof's edges, the back
    // corners cut
    const box = solid(-HW, YT, WELL, HW, COWL[0], H, [
      { n: [0, SHIELD[1] - COWL[1], COWL[0] - SHIELD[0]], p: [0, COWL[0], COWL[1]], tag: "shield" },
      { n: [0, 1, 1], p: [0, SHIELD[0], SHIELD[1]], tag: "header" },
      { n: [1, 0, 1], p: [HW, 0, H - EDGE], tag: "edgeR" },
      { n: [-1, 0, 1], p: [-HW, 0, H - EDGE], tag: "edgeL" },
      { n: [0, -1, 1], p: [0, YT, H - EDGE], tag: "edgeB" },
    ].concat(cornerCuts(YT + CORNER, -1)));
    k.part(box, (f) => Object.assign({ right: panel("side"), left: panel("side"), back: panel("back"), top: roof, header: roof, edgeB: roof, edgeR: { fill: look.roof }, edgeL: { fill: look.roof }, shield: { fill: GLASS, kind: "shield" }, front: hidden, bottom: hidden }, ends)[f.tag], { name: "body" });
    // the nose: under the hood, from the cowl to the front over the front wheels; the hood's front edge rounds down
    const nose = solid(-HW, COWL[0], WELL, HW, YN, COWL[1] + 1, [
      { n: [0, COWL[1] - NOSE_Z, YN - COWL[0]], p: [0, COWL[0], COWL[1]], tag: "hood" },
      { n: [0, 1, 1], p: [0, YN, WELL], tag: "lip" },
    ]);
    k.part(nose, (f) => Object.assign({ right: panel("side"), left: panel("side"), hood: { fill: look.body, kind: "hood" }, lip: { fill: look.body, kind: "hood" }, back: hidden, bottom: hidden, front: hidden }, ends)[f.tag], { name: "nose" });
    // the body below the wells' top, end to end: the wells are dark on its sides (fittings), the wheels stand on them
    const low = solid(-HW, YT, SILL, HW, YN, WELL, cornerCuts(YT + CORNER, -1));
    k.part(low, (f) => Object.assign({ right: panel("side"), left: panel("side"), front: panel("front"), back: panel("back"), top: hidden, bottom: hidden }, ends)[f.tag], { name: "low" });
    // the mirrors: a flat head on an arm from the door's front corner, out beside the A-pillar and turned to look back
    // (both its sides drawn: the trim, and its glass to the back)
    const turn = (35 * Math.PI) / 180;
    for (const s of [1, -1]) {
      // (from just off the door: clear of the wheels' faces on the side, so a plane parts them)
      const out = (d, z) => [s * (HW + 0.1 + Math.cos(turn) * d), 30 + Math.sin(turn) * d, z];
      const P = [out(0, 34.2), out(5, 32), out(5, 41), out(0, 36.2)];
      const card = [{ pts: s > 0 ? P : P.slice().reverse() }, { pts: s > 0 ? P.slice().reverse() : P }];
      const recs = k.part(card, () => ({ fill: look.trim }), { name: "mirror", lod: 0, ink: 0.8 });
      const g = facing(recs, [0, -1, 0]);
      const c = frameOf(g, out(3.6, 36.5));
      k.B.poly(g.f, rect(c[0] - 1.4, c[1] - 3.6, c[0] + 1.4, c[1] + 3.6), GLINT, { lod: 0 });
    }
  }

  /* ---------- The wheels: each a round face standing on the body's side over its dark well (fittings), with its rim
     and hubcap; the tires' feet under the body a dark block across each axle ---------- */
  function wheels(k) {
    const { look } = k;
    const hub = mix(look.rims, "#000000", 0.35);
    for (const s of [1, -1]) {
      const x = s * (HW + 0.05);
      const discs = [WH.front, WH.rear].map((y) => {
        const P = [];
        for (let i = 0; i < WH.n; i++) {
          const t = (i / WH.n) * TAU + Math.PI / WH.n;
          P.push([x, y + Math.cos(t) * WH.r * s, WH.r + Math.sin(t) * WH.r]);
        }
        return { pts: P, y };
      });
      const recs = k.part(discs, () => ({ fill: TIRE }), { name: "wheels", ink: 0 });
      recs.forEach((r, i) => {
        const c = frameOf(r, [x, discs[i].y, WH.r]);
        k.B.poly(r.f, ellipse(c[0], c[1], 6.8, 6.8, 8), look.rims, { lod: 1, ink: 0.7 });
        k.B.poly(r.f, ellipse(c[0], c[1], 2.6, 2.6, 6), hub, { lod: 0, ink: 0.5 });
      });
    }
    for (const y of [WH.front, WH.rear]) k.part(solid(-HW + 0.5, y - 8, 0, HW - 0.5, y + 8, SILL), (f) => ({ fill: TIRE, hide: f.tag === "top" || f.tag === "bottom" }), { name: "feet", ink: 0, lod: 0 });
  }

  /* ---------- The trim, glass and lights every look has ---------- */
  // the cab door window (side view)
  const WIN_PTS = [[WIN.y0, WIN.z0], [SHIELD_Y(WIN.z0) - WIN.pillar, WIN.z0], [SHIELD_Y(WIN.z1) - WIN.pillar, WIN.z1], [WIN.y0, WIN.z1]];
  // the rear windows (end view)
  const BACK_WIN = [rect(-24.6, 32.5, -3.5, 44.5), rect(3.5, 32.5, 24.6, 44.5)];
  // the grille (end view)
  const GRILLE_PTS = rrect(-15.5, 15.5, 15.5, 23, 1.2);
  // a wheel well (side view): dark from the sill up into a curve over the wheel, up to the wells' top
  const wellOf = (y) => [[y - WH.arch, SILL], [y + WH.arch, SILL], [y + WH.arch, 17], [y + 9.5, 22], [y + 4.5, WELL], [y - 4.5, WELL], [y - 9.5, 22], [y - WH.arch, 17]];
  function fittings(k) {
    const { look } = k;
    const trim = look.trim;
    // the bumpers (a band across each end), the rub strip along each side, the wells
    k.poly("front", rect(-HW, BUMP.z0, HW, BUMP.z1), look.bumper, { lod: 1, ink: 0.8 });
    k.poly("back", rect(-HW + CORNER, BUMP.z0, HW - CORNER, BUMP.z1), look.bumper, { lod: 1, ink: 0.8 });
    k.poly("side", rect(YT + CORNER, 24.6, YN, 26.4), trim, { lod: 0 });
    for (const y of [WH.front, WH.rear]) k.poly("side", wellOf(y), UNDER, { lod: 1, ink: 0.8 });
    // door seams: the cab door's back and the sliding door
    k.line("side", [[CAB_DOOR, SILL + 0.5], [CAB_DOOR, 46.6]], INK, 1, { lod: 0 });
    k.line("side", [[SLIDE[1], SILL + 0.5], [SLIDE[1], 46.6], [SLIDE[0], 46.6], [SLIDE[0], SILL + 0.5]], INK, 1, { lod: 0 });
    // the cab door's handle
    k.poly("side", rect(12, 29.6, 15.6, 30.9), trim, { lod: 0, ink: 0.5 });
    // the cab door window: a frame of trim, the glass, a glint
    k.poly("side", grow(WIN_PTS, 1.2), trim, { lod: 0 });
    k.poly("side", WIN_PTS, GLASS, { lod: 1 });
    k.poly("side", [[14, 33.5], [17.5, 33.5], [23, 44], [19.5, 44]], GLINT, { lod: 0 });
    // the windshield: its pillars in trim, the wipers and a glint
    k.poly("shield", rect(-HW, 0, -HW + 3, 60), trim, { lod: 0 });
    k.poly("shield", rect(HW - 3, 0, HW, 60), trim, { lod: 0 });
    k.line("shield", [[-20, 31.6], [-4, 34.5], [4, 31.6], [20, 34.5]], INK, 1, { lod: 0 });
    k.poly("shield", [[-22, 36], [-17, 36], [-11, 45], [-16, 45]], GLINT, { lod: 0 });
    // the front: the grille in its trim surround, its slats, headlights and turn signals
    k.poly("front", grow(GRILLE_PTS, 1.4), trim, { lod: 0, ink: 0.7 });
    k.poly("front", GRILLE_PTS, GRILLE, { lod: 1 });
    k.line("front", [[-14, 17.5], [14, 17.5], [14, 19.3], [-14, 19.3], [-14, 21.1], [14, 21.1]], "#3c4148", 1.2, { lod: 0 });
    for (const s of [1, -1]) {
      k.poly("front", rrect(s * 18.5, 16.2, s * 28, 22.8, 1.5), LAMP, { lod: 1, ink: 0.8 });
      k.poly("front", rect(s * 29.6, 16.6, s * 32.6, 22.2), SIGNAL, { lod: 0, ink: 0.6 });
    }
    // the back: the two doors' seams, their windows (frame, glass, glint), handles, the tail lights and the plate
    k.line("back", [[-27, BUMP.z1 + 0.3], [-27, 46.6], [27, 46.6], [27, BUMP.z1 + 0.3]], INK, 1, { lod: 0 });
    k.line("back", [[0, BUMP.z1 + 0.3], [0, 46.6]], INK, 1, { lod: 1 });
    // (the glass is left out from Armor 3, whose plates cover it)
    for (const P of BACK_WIN) {
      k.poly("back", grow(P, 1.2), trim, { lod: 0 });
      if (k.g.armor < 3) k.poly("back", P, GLASS, { lod: 1 });
    }
    k.poly("back", rect(-5.4, 28.4, 5.4, 29.8), trim, { lod: 0, ink: 0.5 });
    for (const s of [1, -1]) k.poly("back", rect(s * 27.8, 24.6, s * 30.8, 33), TAIL, { lod: 1, ink: 0.8 });
    k.poly("back", rect(-7, 15.6, 7, 20.6), CREAM, { lod: 0, ink: 0.6 });
    k.text("back", 0, 18.1, "B-66", 3.6, INK, { lod: 0 });
    // the roof's vent hatch (none under the rack)
    k.poly("roof", rrect(-8, -45, 8, -33, 1.5), mix(look.roof, "#000000", 0.2), { lod: 0, ink: 0.7 });
  }

  /* ---------- The paint jobs' decals (PAINT_LOOKS decal: their kinds) ----------
     Each is on both sides, the hood, the roof and the back doors. The road's camera sees the van from behind and above
     (the roof and the back doors, the sides hardly at all), so every design has a roof and a back part big enough to
     read there at lod 1 (the road draws the van at lod 0 or 1): on the roof round the rack and the gun's ring as well
     as under them (RACK), on the back doors below their windows and up their outer edges, where the armor plates and
     the windows leave the paint showing. Their fine bits (inner flames, shades, rings, halos) are lod 0. A design may
     return a function: what it lays over the van's fittings (the bumpers, the glass, the lights, the plate), laid
     after them. */
  const DECALS = {
    // bare primer: panels in two other greys (a sliding door off another van, a fender, the hood, the roof and both back
    // doors patched)
    none(k, A, B) {
      k.poly("side", rect(SLIDE[0] + 0.4, SILL + 0.4, SLIDE[1] - 0.4, 46.2), B);
      k.poly("side", [[40, 24.3], [54, 24.3], [53, 28.2], [41, 29.4]], A);
      k.poly("hood", [[-21, 41], [-5, 40], [-7, 51], [-22, 53]], A);
      k.poly("roof", [[-24, -24], [12, -26], [13, 6], [-22, 8]], B);
      k.poly("back", rect(-29.2, BUMP.z1 + 0.6, -0.4, 31), B);
      k.poly("back", rect(0.4, WELL + 0.4, 29.2, 47), A);
    },
    // a racing stripe down each side over pinstripes; twin stripes over the hood, the roof (on over its back bevel) and
    // down the back doors, and a pinstripe along each edge of the roof and down each side of the back doors (they show
    // past the rack, the gun and the plates)
    stripe(k, A, B) {
      k.line("side", [[YT, 27.1], [YN, 27.1]], B, 1.6, { lod: 0 });
      k.poly("side", rect(YT, 27.9, YN, 30.9), A, { ink: 0.6 });
      k.line("side", [[YT, 31.7], [YN, 31.7]], B, 1.6, { lod: 0 });
      // (the roof's stop short of its front bevel)
      for (const s of [1, -1]) {
        k.poly("hood", rect(s * 4, -80, s * 11, 80), A, { ink: 0.5, lod: 0 });
        k.poly("roof", rect(s * 4, YT - 1, s * 11, ROOF.y1 - 0.4), A, { ink: 0.5 });
        k.poly("back", rect(s * 4, 0, s * 11, 60), A, { ink: 0.5 });
        k.line("roof", [[s * 27, YT - 1], [s * 27, ROOF.y1 - 0.4]], B, 1.6);
        k.line("back", [[s * 26.8, BUMP.z1], [s * 26.8, 60]], B, 1.6);
      }
    },
    // rust: blooms round the wheel arches and along the sill, on the doors and the hood; on the roof one each side of the
    // gun's ring, one ahead of it and a big one where a rack would stand; on the back each door's foot and up a corner
    patches(k, A, B) {
      const r = rng(31);
      const rust = (kind, ca, cb, ra, rb, halo, lod) => {
        if (halo) k.poly(kind, blob(ca, cb, ra * 1.35, rb * 1.35, 8, r), B, { lod: 0 });
        k.poly(kind, blob(ca, cb, ra, rb, 7, r), A, { ink: 0.4, lod });
      };
      // over each wheel well and along the sill; on the hood, the roof (each side of the gun's ring, ahead of it, under
      // the rack) and the back (each door's foot, up the right corner over the tail light)
      for (const y of [WH.front, WH.rear]) rust("side", y, 27.6, WH.arch - 2, 2.4, true);
      rust("side", -6, 13, 9, 3.2, false, 0);
      rust("hood", -12, 49, 5, 3.5);
      rust("roof", -23, -13, 6, 9.5);
      rust("roof", 23.5, -16, 4.5, 6.5);
      rust("roof", 21, 11, 7.5, 5.5);
      rust("roof", 6, -42, 11, 7.5, true);
      rust("back", -19, 19.6, 8, 3.8, true);
      rust("back", 17, 18.6, 5, 3);
      rust("back", 28.4, 40.5, 2.3, 5.5);
      rust("front", -24, 13, 4, 2.5, false, 0);
    },
    // army: a white star in a ring on each side, the hood and the roof (a pair either side of the vent hatch where a
    // rack would stand, one ahead of the gun), a star on each back door; the unit number stencilled on the sides, the
    // roof, each back door and the front bumper
    stencil(k, A, B) {
      k.poly("side", ring(-7, 33, 9.4, 10.8, 10), B, { lod: 0 });
      k.poly("side", star(-7, 33, 8.6, 3.4), A);
      k.text("side", -42, 36, "B-66", 7, A);
      k.poly("hood", ring(0, 46, 8.2, 9.2, 8), B, { lod: 0 });
      k.poly("hood", star(0, 46, 7.6, 3), A);
      for (const s of [1, -1]) {
        k.poly("roof", ring(s * 16.5, -41, 6.8, 8, 8), B);
        k.poly("roof", star(s * 16.5, -41, 6.6, 2.6), A);
      }
      k.poly("roof", ring(-18.2, 11, 8.4, 9.7, 8), B);
      k.poly("roof", star(-18.2, 11, 8, 3.1), A);
      k.text("roof", 18, 11, "B-66", 9, A);
      for (const s of [1, -1]) {
        k.poly("back", star(s * 15.5, 19.2, 4.6, 1.8), A);
        k.text("back", s * 14.5, 27.8, "B-66", 6, A);
      }
      // the front bumper's, over the bumper (a fitting)
      return () => k.text("front", 0, 11.8, "B-66", 4, B);
    },
    // hazard: black stripes on yellow along the sills, across the front bumper, the hood's front edge, the roof's front
    // edge and its back bevel; chevrons across the back doors under their windows (each door's stripes leaning in to
    // the middle)
    hazard(k, A, B) {
      const band = (kind, a0, a1, b0, b1, period, lod) => {
        k.poly(kind, rect(a0, b0, a1, b1), B, { ink: 0.5, lod });
        for (const P of stripes(a0, a1, b0, b1, period, period * 0.46, 3.5)) k.poly(kind, P, A, { lod });
      };
      band("side", YT, YN, 11.5, 19.5, 13);
      band("hood", -24, 24, 49.5, 54.5, 16, 0);
      // (the roof's and the back doors' a little wider apart than the sides': fewer corners where the road sees them)
      band("roof", -ROOF.x, ROOF.x, ROOF.y1 - 8, ROOF.y1 - 0.4, 17);
      // (the back bevel's own creases frame its stripes)
      for (const P of stripes(-ROOF.x - 1, ROOF.x + 1, YT - 1, ROOF.y0 - 0.05, 17, 17 * 0.46, 3.5)) k.poly("roof", P, A);
      // the chevrons, on the van's lower body under its seam with the cargo box: the left door's stripes, and the
      // right's the same mirrored
      const z0 = BUMP.z1 + 0.7;
      const z1 = WELL - 0.4;
      k.poly("back", rect(-30.8, z0, 30.8, z1), B, { ink: 0.5 });
      for (const P of stripes(-30.8, 0, z0, z1, 15, 15 * 0.46, z1 - z0)) {
        k.poly("back", P, A);
        k.poly("back", mirror(P), A);
      }
      // the front bumper's, over the bumper (a fitting)
      return () => band("front", -HW, HW, BUMP.z0 + 1, BUMP.z1 - 1, 13);
    },
    // hot-rod flames licking back from the nose along each side, back over the hood from its front edge and over the
    // roof from the windshield (the outer tongues longest, on past the gun along the roof's sides), and up the back
    // doors' outer corners from the bumper
    flames(k, A, B) {
      const outer = [[YN, 10], [YN, 29], [44, 30.6], [14, 31.2], [-12, 42], [3, 35.6], [-30, 37], [-6, 30], [-40, 29.5], [-4, 24.4], [-32, 19.5], [0, 17], [-20, 11], [12, 10.4]];
      const inner = [[YN, 13], [YN, 26.5], [36, 28.4], [8, 29.5], [-4, 35.5], [3, 31], [-20, 31], [-2, 26.4], [-22, 22], [4, 19.8], [-8, 14], [16, 12.6]];
      k.poly("side", outer, A, { ink: 0.7 });
      k.poly("side", inner, B, { lod: 0 });
      const hood = [];
      const hin = [];
      [[-26, 40], [-17, 44.5], [-9, 38.4], [0, 43.5], [9, 38.4], [17, 44.5], [26, 40]].forEach(([x, y], i) => {
        hood.push([x, y]);
        if (i < 6) hood.push([x + 4.2, y + 10.5 - (i % 2 ? 4.5 : 0)]);
        hin.push([x * 0.8, y + 4.5]);
        if (i < 6) hin.push([x * 0.8 + 3.4, y + 12 - (i % 2 ? 3.5 : 0)]);
      });
      k.poly("hood", [[-30, 60], [-30, 46]].concat(hood, [[30, 46], [30, 60]]), A, { ink: 0.7, lod: 0 });
      k.poly("hood", [[-24, 60], [-24, 50]].concat(hin, [[24, 50], [24, 60]]), B, { lod: 0 });
      // the roof: from its front edge, the tongues (the right half's valleys and tips, out from the middle one; the left
      // half mirrored) leaning out, the outer ones running on back along its edges past the gun's ring; the inner
      // flames drawn in toward the front
      const front = ROOF.y1 - 0.4;
      const right = [[4.5, 14], [10.5, -3], [14, 9], [20.5, -14], [23.5, 4], [28.2, -30], [ROOF.x + 0.1, -18]];
      const tongues = mirror(right).reverse().concat([[0, 6]], right);
      k.poly("roof", [[-ROOF.x - 0.1, front]].concat(tongues, [[ROOF.x + 0.1, front]]), A, { ink: 0.7 });
      k.poly("roof", [[-24.5, front]].concat(tongues.map(([x, y]) => [x * 0.8, y + (front - y) * 0.42]), [[24.5, front]]), B, { lod: 0 });
      // the back: up each outer corner from the bumper (the right corner's; the left's mirrored), the tallest tongue up
      // the corner past the tail light, the others under the window; the inner flames drawn in toward the foot, kept
      // on the van's lower body (under its seam with the cargo box: one face each)
      const foot = BUMP.z1 + 0.1;
      const corner = [[11.5, foot], [30.7, foot], [30.7, 38], [29.3, 46.6], [26.3, 27.5], [22.4, 31.1], [19.6, 21.6], [15.8, 25.8], [13.4, 18.4]];
      const squash = (WELL - 0.3 - foot) / (Math.max(...corner.map((p) => p[1])) - foot);
      const cin = corner.map(([x, z]) => [21 + (x - 21) * 0.8, foot + (z - foot) * squash]);
      for (const P of [corner, mirror(corner)]) k.poly("back", P, A);
      for (const P of [cin, mirror(cin)]) k.poly("back", P, B, { lod: 0 });
    },
    // silver lightning: a bolt down each side sweeping back, one back over the hood, a pair down the roof (one each side
    // of the gun) and a pair on the rear doors; each over its shade
    lightning(k, A, B) {
      // a bolt from (a, b) running len toward (da, db) (a unit step), w wide: the zigzag of a lightning bolt
      const bolt = (a, b, da, db, len, w) => {
        const l = Math.hypot(da, db);
        const ax = [da / l, db / l];
        const cx = [-ax[1], ax[0]];
        return [[0.55, 0], [0.15, 0.55], [0.45, 0.55], [0.25, 1], [0.85, 0.4], [0.55, 0.4], [0.8, 0]].map(([u, v]) => [a + ax[0] * v * len + cx[0] * (u - 0.5) * w, b + ax[1] * v * len + cx[1] * (u - 0.5) * w]);
      };
      // down each side sweeping back from behind the cab door, over its shade; one back over the hood; a pair down the
      // roof from its front edge, clear of the gun's ring (their zigzags beside it, their tails by the rack's sides);
      // one across each rear door's foot, under the seam where the van's lower body meets the cargo box (an inked
      // line across the doors) and clear of the plate
      const side = bolt(8, 45, -1.25, -0.62, 68, 26);
      k.poly("side", shift(side, 1.1, -1.1), B, { lod: 0 });
      k.poly("side", side, A, { ink: 0.6 });
      const hood = bolt(0, 57.5, 0, -1, 19, 16);
      k.poly("hood", shift(hood, 0.8, -0.8), B, { lod: 0 });
      k.poly("hood", hood, A, { ink: 0.6 });
      const roof = bolt(23, ROOF.y1 - 0.5, -0.08, -1, 74, 16);
      for (const P of [roof, mirror(roof)]) {
        k.poly("roof", shift(P, 0.8, -0.8), B, { lod: 0 });
        k.poly("roof", P, A, { ink: 0.6 });
      }
      const back = bolt(-28, 21, 1, -0.2, 20, 9.5);
      for (const P of [back, mirror(back)]) {
        k.poly("back", shift(P, 0.8, -0.8), B, { lod: 0 });
        k.poly("back", P, A, { ink: 0.6 });
      }
    },
    // radioactive: black sludge running down from the roofline over the sides and back, from the cowl down the hood,
    // pooled along the roof's edges and over its back bevel; the trefoil on each sliding door and on the roof, a splat on
    // the roof
    drips(k, A, B) {
      // the sides' sludge, a glossy streak along its band; down the hood from the cowl
      k.poly("side", drips(YT, 9, 47.6, 2.4, [[-52, 3.2, 9], [-38, 2.8, 5], [-26, 3.4, 13], [-12, 2.8, 6.5], [1, 3, 10.5]]), A, { ink: 0.4 });
      k.line("side", [[YT + 3, 46.3], [7, 46.3]], B, 1.6, { lod: 0 });
      // (on the hood the band lies along the cowl and the drips run forward, down its slope: drawn hanging, then turned
      // onto the hood, a along x, b back from the nose)
      k.poly("hood", drips(-30, 30, 0, 2.2, [[-18, 2.8, 7], [-2, 3, 10], [15, 2.6, 5]]).map(([a, b]) => [a, COWL[0] - b]), A, { ink: 0.4, lod: 0 });
      // the roof: a band along each edge with puddles running in (drawn hanging, then turned: a along y, b in from the
      // edge), one over the back bevel (on into the back doors'); the trefoil ahead of the gun, a splat where a rack
      // would stand
      const rail = (list) => drips(ROOF.y0, ROOF.y1 - 0.4, ROOF.x + 0.3, 3.4, list).map(([a, b]) => [b, a]);
      k.poly("roof", rail([[12, 3.6, 6.5], [-13, 4.4, 8]]), A, { ink: 0.4 });
      k.poly("roof", mirror(rail([[1, 4, 7.5], [-21, 3.4, 5.5]])), A, { ink: 0.4 });
      k.poly("roof", rect(-ROOF.x - 1, YT - 1, ROOF.x + 1, ROOF.y0 - 0.05), A, { ink: 0.4 });
      k.poly("roof", trefoil(-17.5, 9, 9.5, 2.9), A);
      k.poly("roof", blob(13, -45, 8.5, 6.8, 9, rng(7)), A, { ink: 0.4 });
      k.poly("side", trefoil(-7, 33, 8.4, 2.6), A, { lod: 0 });
      // down the back doors from the roof's bevel, over their windows too (laid after the fittings)
      return () => k.poly("back", drips(-30.8, 30.8, 47.6, 3.6, [[-17, 4.4, 11], [-1.5, 4.2, 18], [13, 4.6, 8.5], [28, 3.6, 12]]), A, { ink: 0.4 });
    },
  };

  /* ---------- Armor (plates by level; the window mesh from 2) ---------- */
  /** A bolted plate (a design in kind's view); rivets: bolts in its top corners (fine); dark: darker steel (on a pale
      bumper). */
  function plate(k, kind, P, rivets, lod, dark) {
    k.poly(kind, P, dark ? STEEL_DK : STEEL, { lod: lod == null ? 1 : lod, ink: 0.8 });
    if (!rivets) return;
    const a0 = Math.min(...P.map((p) => p[0]));
    const a1 = Math.max(...P.map((p) => p[0]));
    const b1 = Math.max(...P.map((p) => p[1]));
    for (const a of [a0 + 1.5, a1 - 1.5]) k.poly(kind, [[a, b1 - 2.6], [a + 0.7, b1 - 1.5], [a - 0.7, b1 - 1.5]], RIVET, { lod: 0 });
  }
  /** Bars across a window: one line zigzagging up and down (its turns along the window's top and bottom), cut to it. */
  function wireMesh(k, kind, P, step) {
    const a0 = Math.min(...P.map((p) => p[0]));
    const a1 = Math.max(...P.map((p) => p[0]));
    const b0 = Math.min(...P.map((p) => p[1]));
    const b1 = Math.max(...P.map((p) => p[1]));
    const up = [];
    let flip = false;
    for (let a = a0 + step / 2; a < a1; a += step, flip = !flip) up.push([a, flip ? b1 - 0.05 : b0 + 0.05], [a, flip ? b0 + 0.05 : b1 - 0.05]);
    for (const piece of clipLine(up, P)) k.line(kind, piece, MESH, 1, { lod: 0 });
  }
  function armor(k, a) {
    if (a >= 1) {
      // 1: steel along the sills (clear of the wells), on both bumpers
      for (const [y0, y1] of [[YT + CORNER + 0.6, ARCH_R[0] - 0.8], [ARCH_R[1] + 0.8, ARCH_F[0] - 0.8], [ARCH_F[1] + 0.8, YN - 0.6]]) plate(k, "side", rect(y0, 10.2, y1, 19.4), false, 0);
      const pale = M.rgb(k.look.bumper).slice(0, 3).reduce((a, b) => a + b, 0) > 3 * 140;
      plate(k, "front", rect(-24, BUMP.z0 + 0.8, 24, BUMP.z1 - 0.6), false, 1, pale);
      plate(k, "back", rect(-24, BUMP.z0 + 0.8, 24, BUMP.z1 - 0.6), false, 1, pale);
    }
    if (a >= 2) {
      // 2: bars over every window (the rear ones plated over from 3)
      wireMesh(k, "side", WIN_PTS, 3);
      if (a < 3) BACK_WIN.forEach((P) => wireMesh(k, "back", P, 3));
      wireMesh(k, "shield", rect(-HW + 3, a >= 5 ? 37.5 : 31.4, HW - 3, 47), 4.5);
    }
    if (a >= 3) {
      // 3: plates over the rear windows with a slit to see through, on the sliding doors, on the hood
      BACK_WIN.forEach((P) => plate(k, "back", rect(P[0][0] - 0.8, 31.8, P[1][0] + 0.8, 45.2), false));
      k.poly("back", rect(BACK_WIN[0][0][0] + 3, 37.6, BACK_WIN[1][1][0] - 3, 39), INK, { lod: 0 });
      plate(k, "side", rect(SLIDE[0] + 1.5, 25.5, SLIDE[1] - 1.5, 43.5), false);
      plate(k, "hood", rect(-17, 39.5, 17, 52), false);
    }
    if (a >= 4) {
      // 4: the cab doors, bars over the grille, the rear doors' lower halves
      plate(k, "side", [[CAB_DOOR + 1.2, 26.8], [ARCH_F[1] - 1, 26.8], [SHIELD_Y(31) - 1.4, 31.2], [CAB_DOOR + 1.2, 31.2]], false);
      k.poly("front", [[-13, 14.6], [13, 14.6], [13, 24], [11, 24], [11, 15.6], [7, 15.6], [7, 24], [5, 24], [5, 15.6], [1, 15.6], [1, 24], [-1, 24], [-1, 15.6], [-5, 15.6], [-5, 24], [-7, 24], [-7, 15.6], [-11, 15.6], [-11, 24], [-13, 24]], STEEL, { lod: 1, ink: 0.7 });
      plate(k, "back", rect(-26.4, 24.6, 26.4, 30.4), false);
    }
    if (a >= 5) {
      // 5: the upper cargo sides, guards on the back corners, plates on the roof, a shield over the windshield's foot
      plate(k, "side", rect(-56, 35.5, -24, 46.2), true);
      for (const s of [1, -1]) {
        k.poly("back", rect(s * 31.1, 15, s * 33.6, 47), STEEL, { lod: 0, ink: 0.7 });
        k.poly("roof", rect(s * 17, -52, s * 29, 14), STEEL, { lod: 0, ink: 0.8 });
      }
      plate(k, "shield", rect(-HW + 3, 31.4, HW - 3, 37.5), false);
      k.poly("shield", rect(-20, 35, 20, 36.2), INK, { lod: 0 });
    }
  }

  /* ---------- The ram plow: wider, taller and further out each level; teeth from 3, a hazard band at 5 ---------- */
  function plow(k, b) {
    const y0 = YN;
    const hp = HW + 9.5 + 1.5 * b; // its half width: 44 .. 50 (from the first level its tips out past the mirrors, seen from behind)
    const top = 12 + 2 * b; // 14 .. 22 (the headlights over it)
    const reach = 4 + 2.4 * b; // its foot this far out: 6.4 .. 16
    const bot = 3;
    const pts = [[-hp, y0, bot], [hp, y0, bot], [hp, y0, top], [-hp, y0, top], [-hp + 5, y0 + reach, bot], [hp - 5, y0 + reach, bot], [hp - 2, y0 + 2.5, top], [-hp + 2, y0 + 2.5, top]];
    const recs = k.part(hull(pts), (f) => (f.n[2] < -0.9 ? { fill: STEEL_DK, hide: true } : f.n[1] > 0.3 && f.n[2] > 0.1 ? { fill: PLOW } : { fill: STEEL_DK }), { name: "plow" });
    const face = facing(recs, [0, 0.8, 0.6]);
    // a point on its face at (x, z)
    const fr = (x, z) => frameOf(face, [x, y0 + reach + ((2.5 - reach) * (z - bot)) / (top - bot), z]);
    if (b >= 3) {
      // teeth along its foot: one more each level, bigger each level (a saw of light steel)
      const n = b + 1;
      const s = 2.5 + b;
      const saw = [fr(-hp + 5.5, bot + 0.3)];
      for (let i = 0; i < n; i++) {
        const x = -hp + 5.5 + ((i + 0.5) * (2 * hp - 11)) / n;
        saw.push(fr(x - s * 0.3, bot + s), fr(x + s * 0.3, bot + s));
      }
      saw.push(fr(hp - 5.5, bot + 0.3));
      k.on(face, saw, "#c9cdd0", { lod: 0, ink: 0.7 });
    }
    if (b >= 5) {
      k.on(face, [fr(-hp + 4, top - 4.5), fr(hp - 4, top - 4.5), fr(hp - 3, top - 1), fr(-hp + 3, top - 1)], "#d9a21b", { lod: 0, ink: 0.6 });
    }
  }

  /* ---------- The engine's gear: the roof rack and its load, exhaust stacks, the ladder, the snorkel, the spare, the
     light bar ---------- */
  function engineGear(k, e) {
    const B = k.B;
    // a box standing on something (its bottom hidden); dark gear is left without ink (it would barely show on it)
    const boxPart = (name, x0, y0, z0, x1, y1, z1, fill, o) => k.part(hull(corners(x0, y0, z0, x1, y1, z1)), (f) => ({ fill, hide: f.n[2] < -0.9 }), Object.assign({ name, ink: 0.8, lod: 1 }, o));
    // a round part along axis from a0 to a1; hide: -1 or 1, the end (toward -axis or +axis) another part covers
    const rnd = (name, axis, c, r, a0, a1, n, fill, capFill, hide, o) =>
      k.part(hull(roundPts(axis, c, r, a0, a1, n)), (f) => {
        const ax = axis === "x" ? f.n[0] : axis === "y" ? f.n[1] : f.n[2];
        if (Math.abs(ax) > 0.9) return { fill: capFill || fill, hide: ax * (hide || 0) > 0 };
        return { fill };
      }, Object.assign({ name, ink: 0, lod: 0 }, o));
    if (e >= 1) {
      // 1: the roof rack (a low tray and its slats) with a crate on it, bigger from 2; the roof under the tray is hidden
      // (the paint and the vent hatch there are left out)
      boxPart("rack", RACK.x0, RACK.y0, H, RACK.x1, RACK.y1, H + 2.2, "#3a3d42", { ink: 0 });
      k.cover("roof", RACK.x0, RACK.y0, RACK.x1, RACK.y1);
      boxPart("crate", -22, -52, H + 2.2, e >= 2 ? 20 : -6, -40, H + (e >= 2 ? 10 : 8), e >= 2 ? "#8a6a46" : "#5f6b3c");
    }
    if (e >= 2) {
      // 2: an exhaust stack up the right back corner, a ladder on the left rear door
      rnd("stack", "z", [HW + 2.2, -53.5], 2.2, 14, H + 11, 4, "#4b5057", "#1f2023", -1);
      // the ladder: one line up a rail, across, down the other, then back up the rungs
      const lad = [[-25, 15.5], [-25, 48], [-16.2, 48], [-16.2, 15.5]];
      let flip = false;
      for (let z = 18.5; z < 47; z += 4.5, flip = !flip) lad.push([flip ? -25 : -16.2, z], [flip ? -16.2 : -25, z]);
      k.line("back", lad, "#3a3d42", 2, { lod: 0 });
    }
    if (e >= 3) {
      // 3: the snorkel up the right side behind the cab door, its intake over the roof; the spare on the right rear door
      const snork = boxPart("snorkel", HW + 0.3, 7.6, 20, HW + 3.9, 11.2, H + 8, "#2f3136", { lod: 0, ink: 0 });
      const mouth = facing(snork, [0, 1, 0]);
      const [ma0, , ma1, mb1] = span(mouth);
      k.on(mouth, rect(ma0 + 0.4, mb1 - 4.5, ma1 - 0.4, mb1 - 0.8), "#111214", { lod: 0 });
      const spare = rnd("spare", "y", [15, 23], 8, YT - 4.4, YT - 0.2, 8, TREAD, TIRE, 1);
      const cap = facing(spare, [0, -1, 0]);
      const c = frameOf(cap, [15, YT - 4.4, 23]);
      B.poly(cap.f, ellipse(c[0], c[1], 4.6, 4.6, 8), k.look.rims, { lod: 0, ink: 0.6 });
    }
    if (e >= 4) {
      // 4: the light bar across the cab roof's front, its lamps (one outline, joined along the bar's foot) lit at 5
      const bar = boxPart("lightbar", -22, 14.5, H, 22, 19, H + 4.2, "#1f2023", { ink: 0 });
      const r = facing(bar, [0, 1, 0]);
      const P = [];
      for (let x = -17; x <= 13; x += 12) {
        const p0 = frameOf(r, [x, 19, H]);
        const p1 = frameOf(r, [x + 6, 19, H + 3.4]);
        P.push([p0[0], p0[1]], [p0[0], p1[1]], [p1[0], p1[1]], [p1[0], p0[1]]);
      }
      k.on(r, P, e >= 5 ? "#ffd36b" : "#cfc59c", { lod: 0, glow: e >= 5 });
    }
    if (e >= 5) {
      // 5: a second stack up the left back corner
      rnd("stack", "z", [-HW - 2.2, -53.5], 2.2, 14, H + 11, 4, "#4b5057", "#1f2023", -1);
    }
  }

  /* ---------- The roof gun: a ring, the breech on its post and the barrels aimed forward (js/perspective.js gun:
     Spread Shot adds barrels, Heavier Rounds lengthens them (a muzzle brake from 3), Rate of Fire a jacket (1, copper
     at 5), a drum beside the breech (2, bigger with a brass ring at 4) and fins on the jacket (3)) ---------- */
  function gun(k, g) {
    const B = k.B;
    const gy = GUN.y;
    const gz = GUN.z;
    const n = 1 + g.spread;
    const step = ZSR.Upgrades.SPREAD || 0.14;
    const len = 26 + g.damage * 3;
    const rof = g.fireRate;
    // the ring: a dark disc on the roof under it
    k.poly("roof", ellipse(0, gy, 11, 11, 6), GUNMETAL, { lod: 0, ink: 0.8 });
    // the breech on its post (one part: the post's foot on the roof, the breech's box over it)
    const front = gy + 6;
    // the barrels (BW half wide, SPACE apart at their roots); the jacket (and the breech) as wide as they stand there
    const BW = 1.9;
    const SPACE = 4;
    const half = Math.max(4, ((n - 1) / 2) * SPACE + Math.sin(((n - 1) / 2) * step) * 12 + BW + 0.7);
    const bw = Math.max(4.5, half);
    k.part(hull(corners(-2.5, gy - 2.5, H, 2.5, gy + 2.5, H).slice(0, 4).concat(corners(-bw, gy - 6, gz - 4, bw, front, gz + 3))), (f) => ({ fill: GUNMETAL, hide: f.n[2] < -0.99 }), { name: "breech", ink: 0, lod: 1 });
    let root = front;
    if (rof >= 1) {
      const jl = Math.min(len - 15, 9 + rof * 1.2);
      const jacket = k.part(hull(corners(-half, front, gz - 2.8, half, front + jl, gz + 2.8)), (f) => ({ fill: rof >= 5 ? "#b8733a" : BARREL, hide: f.n[1] < -0.9 || f.n[2] < -0.9 }), { name: "jacket", ink: 0, lod: 0 });
      if (rof >= 3)
        for (const r of jacket) if (r.n[2] > 0.5) k.on(r, bands(r, [0, 1, 2].map((q) => front + 2 + (q * (jl - 4)) / 2), 1.4, [r.n[0] * half, 0, gz + r.n[2] * 2.8]), rof >= 5 ? "#e0a066" : "#9ea3aa", { lod: 0 });
      root = front + jl;
    }
    // the barrels: side by side at the root, each along its own line; a muzzle brake on each from Heavier Rounds 3
    for (let i = 0; i < n; i++) {
      const off = i - (n - 1) / 2;
      const a = off * step;
      const x0 = off * SPACE + Math.sin(a) * (root - front);
      const l1 = len - (root - gy);
      const ax = [Math.sin(a), Math.cos(a), 0];
      const side = [Math.cos(a), -Math.sin(a), 0];
      const P = [];
      const s0 = BW * Math.abs(Math.tan(a)) + 0.02; // (its root's corners all ahead of the jacket's or breech's face)
      for (const s of [s0, l1]) for (const [dx, dz] of [[-BW, -BW], [BW, -BW], [BW, BW], [-BW, BW]]) P.push([x0 + ax[0] * s + side[0] * dx, root + ax[1] * s + side[1] * dx, gz + dz]);
      // (the barrel nearest the middle stays at lod 1: the gun reads as a gun further off)
      const recs = k.part(hull(P), (f) => ({ fill: BARREL, hide: dot(f.n, ax) < -0.99 || f.n[2] < -0.99 }), { name: "barrel", ink: 0, lod: i === (n - 1) >> 1 ? 1 : 0 });
      if (g.damage >= 3)
        for (const r of recs) {
          if (r.n[2] < 0.5) continue;
          // the brake: a pale band over the last 6 units
          const q0 = frameOf(r, [x0 + ax[0] * (l1 - 6), root + ax[1] * (l1 - 6), gz]);
          const q1 = frameOf(r, [x0 + ax[0] * l1, root + ax[1] * l1, gz]);
          const along = Math.abs(q1[0] - q0[0]) > Math.abs(q1[1] - q0[1]);
          const P2 = along ? rect(Math.min(q0[0], q1[0]), -40, Math.max(q0[0], q1[0]), 40) : rect(-40, Math.min(q0[1], q1[1]), 40, Math.max(q0[1], q1[1]));
          k.on(r, P2, "#8e939a", { lod: 0, ink: 0.6 });
        }
    }
    if (rof >= 2) {
      // the drum on the breech's right
      const big = rof >= 4;
      const r = big ? 6 : 4.5;
      const drum = k.part(hull(roundPts("x", [gy - 2, gz - 0.5], r, bw, bw + 4, 6)), (f) => ({ fill: big ? "#3a3d42" : STEEL_DK, hide: f.n[0] < -0.9 }), { name: "drum", ink: 0, lod: 0 });
      const cap = facing(drum, [1, 0, 0]);
      const c = frameOf(cap, [bw + 4, gy - 2, gz - 0.5]);
      if (big) B.poly(cap.f, ellipse(c[0], c[1], r * 0.62, r * 0.62, 6), "#d9a21b", { lod: 0, ink: 0.6 });
    }
  }

  /* ---------- Dents: dark hollows with a lit rim, claw scratches, grime along the bottom at tier 2 ---------- */
  function dents(k, tier) {
    const r = rng(83);
    const dent = (kind, a, b, ra, rb, side, lod) => {
      k.poly(kind, ellipse(a, b, ra, rb, 6), HOLLOW, { lod: lod == null ? 1 : lod }, side);
      k.line(kind, ellipse(a - 0.3, b + 0.3, ra, rb, 1, Math.PI * 0.55, Math.PI * 1.05), RIM_LIGHT, 1.3, { lod: 0 }, side);
    };
    // claw marks: three slashes raked down and back in bare metal (one outline: the slashes joined along their tops)
    const claw = (kind, a, b, side) => {
      const P = [];
      for (let j = 0; j < 3; j++) {
        const x = a + j * 2.6;
        P.push([x, b], [x - 3.4, b - 8], [x - 3.0, b - 8.4], [x + 0.9, b + 0.1]);
      }
      k.poly(kind, P, SCRATCH, { lod: 0, ink: 0.5 }, side);
    };
    const n = tier === 1 ? 2 : 3;
    for (const side of [1, -1]) {
      let made = 0;
      for (let tries = 0; made < n && tries < 40; tries++) {
        const y = -54 + r() * 104;
        const z = 13 + r() * 30;
        if (y > WIN.y0 - 3 && z > WIN.z0 - 3) continue; // not on the glass
        if (y > ARCH_F[0] - 3 && y < ARCH_F[1] + 3 && z < WELL + 6) continue; // not in a well
        if (y > ARCH_R[0] - 3 && y < ARCH_R[1] + 3 && z < WELL + 6) continue;
        const ra = 2.6 + r() * (tier === 1 ? 1.8 : 3.4);
        // (further off only the first two of a side show)
        dent("side", y, z, ra, ra * (0.55 + r() * 0.3), side, made < 2 ? 1 : 0);
        made++;
      }
      claw("side", -40 + r() * 8 + (tier - 1) * 30, 42 - (tier - 1) * 6, side);
    }
    dent("back", -16 + r() * 8, 22 + r() * 6, 3.2, 2.2);
    if (tier >= 2) {
      dent("back", 12 + r() * 8, 36 + r() * 4, 4.2, 2.8, undefined, 0);
      dent("front", 22, 19.5, 3, 2.2, undefined, 0);
      dent("roof", 16, -20, 4.5, 3.4, undefined, 0);
      k.poly("side", rect(YT, SILL, YN, SILL + 6), GRIME, { lod: 0 });
      k.poly("front", rect(-HW, SILL, HW, 15), GRIME, { lod: 0 });
    }
  }

  /* ---------- The model ---------- */
  M.define("van", (B, g) => {
    const look = lookOf(g);
    const k = kit(B, look, g);
    body(k);
    wheels(k);
    if (g.bumper > 0) plow(k, g.bumper);
    engineGear(k, g.engine);
    // the decals, under to over: the paint job, the van's own fittings, what the paint job lays over them (it returns
    // that: a mark on the front bumper, sludge over the back windows), the armor, the gun's ring, the dents
    const paint = DECALS[look.decal] || DECALS.none;
    const over = paint(k, look.decalA, look.decalB);
    fittings(k);
    if (over) over();
    armor(k, g.armor);
    if (g.gun) gun(k, g);
    if (g.dent > 0) dents(k, g.dent);
  });

  function mesh(u, o) {
    const g = gearOf(u, o);
    return M.mesh("van", g, sig(u, o));
  }
  function draw(ctx, view, u, o) {
    return M.draw(ctx, mesh(u, o), view);
  }
  /** How dented the van looks at this share of its health: 0 none, 1 dents, 2 heavy dents. */
  function dentTier(share) {
    return share < DENTS[1] ? 2 : share < DENTS[0] ? 1 : 0;
  }
  /** How dented the van looks now: on a trip the trip's van health, else the save's. */
  function dentNow() {
    const S = ZSR.State;
    if (!S || !S.save) return 0;
    const t = S.trip;
    const share = t ? t.vanHp / (t.vanMaxHp || 1) : S.vanMaxHp ? S.save.vanHp / (S.vanMaxHp() || 1) : 1;
    return dentTier(share);
  }

  ZSR.Van3D = { L, W, H, DENTS, GUN, sig, mesh, draw, dentTier, dentNow, lookOf };
})(typeof window !== "undefined" ? window : globalThis);
