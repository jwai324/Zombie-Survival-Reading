/* Yard models, part 2 (js/yardmodels.js has the contract): the Garden, Radio, Medbay, Archive, Well, Farm and Lab
   rooms' props, a wrecked build's debris, and the cabin porch's posts, bell and bench, each the 3D port of its sprite
   in js/yardart.js or js/houseart.js (the same colours and parts, a real thing you walk round).

   Units are prop units (1 = the sprite's height at scale 1); x right, y front, z up, the foot on z 0. Every one turns
   with its plot (faces "plot"), its front (+y) the plot's front: the sunflowers' faces, the dish's bowl, the pump's
   spout, the well roof's front slope and windlass, BOOKS (on the crate's back too), the flag's cross (on both sides).
   A model's own right (+x) is your left as you face it, so where a sprite has something on the right (the flag's fly,
   the still's coil, the bell's arm, the debris' tin sheet) the model has it at -x: seen from the front it looks as
   the sprite did. The porch's three (not builds: no plot) stand where js/house.js puts them: the bench's front faces
   out of the porch (north, rot -PI / 2), its seat's top at SEAT_Z units (def.seat; 0.17 tiles at its scale 0.34),
   where the crew sit; the bell faces out too (its post on your left, the bell to your right); a post is square and
   the same from every side.

   Round things are ROUND times wider across than their height would make them, so they read round in the squashed
   first-person view; the rest is sized against its sprite and kept inside the tile it blocks. Each fits its ceilings
   (YARD_OPS): what is a few px wide where a lod starts is left out of it (part lod), fine marks are decals at lod 0.

   A build's damage (opts.dmg, js/yardwreck.js): every colour takes the grime the sprites lay over (tone), and the
   big faces cracks (lod 1), claw gouges (lod 0) and, wrecked, splintered holes (wear); some things break besides (a
   snapped sunflower, slack and snapped guy wires, a dish knocked askew, a torn flag on a leaning pole, a bent whip,
   a dark beacon and lamp, a snapped pump handle). The debris is the damage: it takes only opts.v. The porch is not a
   build (its dmg is never set). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const YM = ZSR.YardModels;
  if (!YM) return;

  const TAU = Math.PI * 2;
  const INK = "#0f1012";
  const GRIME = "#18120c";
  // the first-person view squashes a model sideways as it does the walls (a tile of floor is 1.4 times narrower on
  // screen than a wall is tall): a round thing's horizontal radius is this many times what its height gives, so it
  // reads round there (part of the way: the sheds and the fence beside it are squashed too)
  const ROUND = 1.25;
  const SEAT_Z = 0.5; // the porch bench's seat top, units (x its scale 0.34: 0.17 tiles), where the crew sit

  /* ---------- Colours ---------- */
  const rgbOf = (c) => {
    const n = parseInt(c.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  };
  const hexOf = (r, g, b) => "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  const clamp8 = (v) => Math.max(0, Math.min(255, Math.round(v)));
  function mix(a, b, t) {
    const x = rgbOf(a);
    const y = rgbOf(b);
    return hexOf(clamp8(x[0] + (y[0] - x[0]) * t), clamp8(x[1] + (y[1] - x[1]) * t), clamp8(x[2] + (y[2] - x[2]) * t));
  }
  function shade(c, amt) {
    const x = rgbOf(c);
    return hexOf(clamp8(x[0] + amt), clamp8(x[1] + amt), clamp8(x[2] + amt));
  }
  /** A build's damage in its colours: the grime the sprites lay over a cracked (0.16) or wrecked (0.4) build. */
  const tone = (dmg) => {
    const t = dmg >= 2 ? 0.3 : dmg ? 0.12 : 0;
    return (c) => (t ? mix(c, GRIME, t) : c);
  };
  /** Seeded random (the sprites' own: js/sprites3d.js rng), so a model is built the same every time. */
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }

  /* ---------- Vectors ---------- */
  const Z = [0, 0, 1];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  const norm = (a) => mul(a, 1 / (len(a) || 1));
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  /** A polygon's normal by its whole outline (Newell). */
  function normalOf(P) {
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
  /** Turn about a pivot: yaw (about z, x toward y) after pitch (about x, y toward z), roll (about y, z toward x). */
  function turner(pivot, yaw, pitch, roll) {
    const cy = Math.cos(yaw || 0);
    const sy = Math.sin(yaw || 0);
    const cp = Math.cos(pitch || 0);
    const sp = Math.sin(pitch || 0);
    const cr = Math.cos(roll || 0);
    const sr = Math.sin(roll || 0);
    return (p) => {
      let x = p[0] - pivot[0];
      let y = p[1] - pivot[1];
      let z = p[2] - pivot[2];
      // roll about y
      let t = x * cr + z * sr;
      z = -x * sr + z * cr;
      x = t;
      // pitch about x
      t = y * cp - z * sp;
      z = y * sp + z * cp;
      y = t;
      // yaw about z
      t = x * cy - y * sy;
      y = x * sy + y * cy;
      x = t;
      return [x + pivot[0], y + pivot[1], z + pivot[2]];
    };
  }
  /** Points round a horizontal circle (n of them, from angle a0), the x and y radii r * sx and r * sy. */
  function ringPts(c, r, n, sx, sy, a0) {
    const P = [];
    for (let i = 0; i < n; i++) {
      const a = (a0 || 0) + (i / n) * TAU;
      P.push([c[0] + Math.cos(a) * r * (sx || 1), c[1] + Math.sin(a) * r * (sy || sx || 1), c[2]]);
    }
    return P;
  }

  /* ---------- The kit one model is built with: convex parts, decals by model points, damage ----------
     Shapes start their own part (po: Builder.part's options; false: go on in the current part). k.T, when set, turns
     every point laid out after it (a knocked dish, a leaning pole). */
  function kit(B) {
    const k = { B, T: null };
    const tp = (p) => (k.T ? k.T(p) : p);
    const tv = (v) => (k.T ? sub(k.T(v), k.T([0, 0, 0])) : v);
    const part = (po) => {
      if (po !== false) B.part(po || {});
    };
    /** A model point on face f in its decal frame. */
    const at2 = (f, p) => {
      const d = sub(p, f.o);
      return [dot(d, f.u), dot(d, f.v)];
    };
    k.at2 = at2;
    /** A flat convex face (corners counter-clockwise from outside). o: glow, alpha, hide, and u / v (its frame). */
    k.face = (pts, fill, o) => {
      o = o || {};
      const fo = { glow: !!o.glow, alpha: o.alpha, hide: !!o.hide };
      if (o.u) {
        fo.u = tv(o.u);
        fo.v = tv(o.v);
        fo.o = tp(o.o || pts[0]);
      }
      return B.face(pts.map(tp), fill, fo);
    };
    const hidden = (o, name) => !!(o && o.hide && o.hide.includes(name));
    /** A straight extrusion of a flat convex outline (any winding) by e. o.fills { cap0, cap1, sides: [per edge] },
        o.hide [cap0, cap1, side indexes] (kept to order the parts, never drawn), o.skip [cap0, cap1]. Returns
        { cap0, cap1, sides } (side i: the given outline's edge i to i + 1). */
    k.extrude = (base, e, fill, o, po) => {
      o = o || {};
      part(po);
      const F = o.fills || {};
      const n = base.length;
      const rev = dot(normalOf(base.map(tp)), tv(e)) < 0;
      const P0 = rev ? base.slice().reverse() : base.slice();
      const P1 = P0.map((p) => add(p, e));
      const fo = (hide) => ({ glow: o.glow, alpha: o.alpha, hide });
      const out = { sides: [] };
      const skip = o.skip || [];
      if (!skip.includes("cap1")) out.cap1 = k.face(P1, F.cap1 || fill, fo(hidden(o, "cap1")));
      if (!skip.includes("cap0")) out.cap0 = k.face(P0.slice().reverse(), F.cap0 || fill, fo(hidden(o, "cap0")));
      for (let m = 0; m < n; m++) {
        const i = rev ? (2 * n - 2 - m) % n : m; // the given outline's edge this side is
        const j = (m + 1) % n;
        const sf = Array.isArray(F.sides) ? F.sides[i] || fill : F.sides || fill;
        out.sides[i] = k.face([P0[m], P0[j], P1[j], P1[m]], sf, fo(hidden(o, i)));
      }
      return out;
    };
    /** A box; its faces by side (front +y, right +x): text reads left to right on each side with v up. */
    k.box = (x0, y0, z0, x1, y1, z1, fill, o, po) => {
      o = o || {};
      const F = o.fills || {};
      const hide = (o.hide || []).map((s) => ({ back: 0, right: 1, front: 2, left: 3, top: "cap1", bottom: "cap0" })[s]);
      const r = k.extrude(
        [
          [x0, y0, z0],
          [x1, y0, z0],
          [x1, y1, z0],
          [x0, y1, z0],
        ],
        [0, 0, z1 - z0],
        fill,
        { glow: o.glow, alpha: o.alpha, hide, fills: { cap1: F.top, cap0: F.bottom, sides: [F.back, F.right, F.front, F.left] } },
        po
      );
      return { top: r.cap1, bottom: r.cap0, back: r.sides[0], right: r.sides[1], front: r.sides[2], left: r.sides[3] };
    };
    /** A round part about the axis d (a unit vector) from c: rings [[t, r], ...] along it, r a concave run (0: a
        point), n sides from o.a0 (default: a side square to the frame's second axis, which is +y for an upright
        part), its offsets' x and y times o.sx (ROUND: round on the squashed screen). o.fills { top, bottom, band:
        [per band] or fn(band, side) }, o.hide / o.skip [top, bottom], o.glow, o.alpha, o.e1 (the frame's first axis).
        Returns { top, bottom, bands: [[face per side] per band] }. */
    k.spin = (c, d, rings, n, fill, o, po) => {
      o = o || {};
      part(po);
      const F = o.fills || {};
      const sx = o.sx || 1;
      let e1 = o.e1 || (Math.abs(d[2]) > 0.9 ? [1, 0, 0] : norm(cross(d, Z)));
      e1 = norm(sub(e1, mul(d, dot(e1, d))));
      const e2 = cross(d, e1);
      const a0 = o.a0 != null ? o.a0 : Math.PI / 2 - Math.PI / n;
      const R = rings.map(([t, r]) => {
        const q = add(c, mul(d, t));
        const P = [];
        for (let i = 0; i < n; i++) {
          const a = a0 + (i / n) * TAU;
          const off = add(mul(e1, Math.cos(a) * r), mul(e2, Math.sin(a) * r));
          P.push([q[0] + off[0] * sx, q[1] + off[1] * sx, q[2] + off[2]]);
        }
        return P;
      });
      const fo = (hide) => ({ glow: o.glow, alpha: o.alpha, hide });
      const out = { bands: [] };
      for (let b = 0; b + 1 < rings.length; b++) {
        const lo = R[b];
        const hi = R[b + 1];
        const rl = rings[b][1];
        const rh = rings[b + 1][1];
        const band = [];
        if (rl > 0 || rh > 0) {
          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const pts = rl <= 0 ? [lo[i], hi[j], hi[i]] : rh <= 0 ? [lo[i], lo[j], hi[i]] : [lo[i], lo[j], hi[j], hi[i]];
            const f = Array.isArray(F.band) ? F.band[b] || fill : typeof F.band === "function" ? F.band(b, i) : fill;
            band.push(k.face(pts, f, fo(false)));
          }
        }
        out.bands.push(band);
      }
      const skip = o.skip || [];
      const last = rings.length - 1;
      if (rings[last][1] > 0 && !skip.includes("top")) out.top = k.face(R[last], F.top || fill, fo(hidden(o, "top")));
      if (rings[0][1] > 0 && !skip.includes("bottom")) out.bottom = k.face(R[0].slice().reverse(), F.bottom || fill, fo(hidden(o, "bottom")));
      return out;
    };
    /** A straight rod of n sides from p0 to p1 (radius r): k.spin along it. */
    k.rod = (p0, p1, r, n, fill, o, po) => {
      const d = sub(p1, p0);
      return k.spin(p0, norm(d), [[0, r], [len(d), r]], n, fill, o, po);
    };
    /** A flat card seen from both sides: its outline (counter-clockwise from its front) and the back's fill.
        Returns [front, back]. */
    k.card = (pts, fill, back, o, po) => {
      part(po);
      o = o || {};
      return [k.face(pts, fill, o), k.face(pts.slice().reverse(), back || fill, o)];
    };
    /** A glow round a light: a see-through, unlit ball (drawn before what it holds: its bias). */
    k.halo = (c, r, color, alpha, n, po, coarse) =>
      k.spin(sub(c, [0, 0, r]), Z, coarse ? [[0, 0], [r, r], [r * 2, 0]] : [[0, 0], [r * 0.5, r * 0.87], [r, r], [r * 1.5, r * 0.87], [r * 2, 0]], n, color, { glow: true, alpha, sx: ROUND }, Object.assign({ ink: 0, bias: -1, lod: 1, name: "halo" }, po));
    /* ---------- Decals by model points (they lie on the face) ---------- */
    k.poly = (f, pts, fill, o) => B.poly(f, pts.map((p) => at2(f, tp(p))), fill, o);
    k.line = (f, pts, color, w, o) => B.line(f, pts.map((p) => at2(f, tp(p))), color, w, o);
    k.text = (f, p, str, size, fill, o) => {
      const [a, b] = at2(f, tp(p));
      B.text(f, a, b, str, size, fill, Object.assign({ align: "center", base: "middle" }, o));
    };
    /** Face f's corners (model points). */
    k.corners = (f) => {
      const P = [];
      for (let i = 0; i < f.n; i++) P.push([f.p[i * 3], f.p[i * 3 + 1], f.p[i * 3 + 2]]);
      return P;
    };
    /** Face f's corners drawn in toward its middle by t (a smaller copy on it); model points, already turned. */
    k.inset = (f, t) => {
      const P = k.corners(f);
      return P.map((p) => lerp(p, [f.cx, f.cy, f.cz], t));
    };
    /** Decals in face f's own frame: B.poly / B.line with points [a, b] (for faces k.T already turned). */
    k.poly2 = (f, pts, fill, o) => B.poly(f, pts, fill, o);
    k.line2 = (f, pts, color, w, o) => B.line(f, pts, color, w, o);
    /** Face f's reach in its own frame: [a0, b0, a1, b1]. */
    k.reach = (f) => {
      let a0 = Infinity;
      let b0 = Infinity;
      let a1 = -Infinity;
      let b1 = -Infinity;
      k.corners(f).forEach((p) => {
        const [a, b] = at2(f, p);
        a0 = Math.min(a0, a);
        b0 = Math.min(b0, b);
        a1 = Math.max(a1, a);
        b1 = Math.max(b1, b);
      });
      return [a0, b0, a1, b1];
    };
    /** A build's damage on face f, as the sprites' crackOverlay draws it: cracks (lod 1), a claw gouge (lod 0) and,
        wrecked, a splintered hole (lod 1), inside the face's reach less a margin. o.k: line widths; o.gouge false;
        o.hole false. */
    k.wear = (f, dmg, rnd, o) => {
      if (!dmg || !f) return;
      o = o || {};
      const [a0, b0, a1, b1] = k.reach(f);
      const w = a1 - a0;
      const h = b1 - b0;
      if (!(w > 0 && h > 0)) return;
      const m = Math.min(w, h) * 0.12;
      const ca = (a) => Math.max(a0 + m, Math.min(a1 - m, a));
      const cb = (b) => Math.max(b0 + m, Math.min(b1 - m, b));
      const lw = o.k || 1;
      for (let i = 0; i < (dmg >= 2 ? 2 : 1); i++) {
        let a = a0 + w * (0.2 + rnd() * 0.6);
        let b = b1 - m - rnd() * h * 0.12;
        const pts = [[ca(a), cb(b)]];
        for (let j = 0; j < 3; j++) {
          a += (rnd() - 0.5) * w * 0.35;
          b -= h * (0.15 + rnd() * 0.12);
          pts.push([ca(a), cb(b)]);
        }
        B.line(f, pts, INK, 1.1 * lw, { lod: 1 });
      }
      if (o.gouge !== false) {
        const s = Math.min(w * 0.5, h) * 0.45;
        const ga = a0 + m + rnd() * Math.max(0, w - 2 * m - s);
        const gb = b0 + m + s + rnd() * Math.max(0, h - 2 * m - s);
        for (let j = 0; j < 3; j++) {
          const x = ga + j * s * 0.26;
          B.line(f, [[x, gb], [x + s * 0.42, gb - s]], INK, 1.15 * lw, { lod: 0 });
        }
      }
      if (dmg >= 2 && o.hole !== false) {
        const q = Math.min(w, h) * (0.16 + rnd() * 0.06);
        const ha = a0 + w * (0.32 + rnd() * 0.36);
        const hb = b0 + h * (0.32 + rnd() * 0.36);
        const hole = [[-1, -0.4], [-0.2, -1], [0.7, -0.6], [1, 0.3], [0.1, 1], [-0.8, 0.6]].map(([x, y]) => [ha + x * q, hb + y * q]);
        B.poly(f, hole, "#1c1814", { lod: 1, ink: 0.9 });
      }
    };
    return k;
  }
  /** Hide faces another part covers (kept: they still order the parts). */
  const hideF = (...fs) => fs.forEach((f) => f && (f.hide = true));

  /* =====================================================================================================
     Garden: three sunflowers (yPlants, scale 1.05, solid). The heads face the plot's front a little apart, tipped
     up to the sun; each stem stands behind its head, so the head's plane keeps the two in order from every side.
     Leaves are lod 0. Cracked: wilted and clawed; wrecked: the tallest lies snapped on the ground.
     ===================================================================================================== */
  YM.add("yPlants", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(61);
      const PETAL = c("#f2c12e");
      const HEADS = [
        // x, y, z (the head's middle), its turn from the front, its petals' reach
        [-0.2, -0.02, 0.79, 0.34, 0.14],
        [0.16, -0.1, 0.89, -0.3, 0.145],
        [-0.01, 0.1, 0.65, 0.06, 0.13],
      ];
      const TIP = 0.2; // tipped up toward the sun
      const STEM = c("#4a6230");
      HEADS.forEach(([x, y, z, yaw, R], i) => {
        const snapped = dmg >= 2 && i === 1;
        let h = [x, y, z];
        let f = [Math.sin(yaw) * Math.cos(TIP), Math.cos(yaw) * Math.cos(TIP), Math.sin(TIP)];
        if (snapped) {
          // a stump, the rest of the stem along the ground and the head at its end, fallen on its edge
          k.rod([x, y - 0.03, 0], [x, y - 0.03, 0.18], 0.02, 4, STEM, { a0: Math.PI / 4, skip: ["bottom"] }, { lod: 1 });
          f = norm([-0.3, 0.55, 0.78]);
          h = [x + 0.08, y + 0.22, R * Math.sqrt(1 - f[2] * f[2]) + 0.01]; // its petals clear of the ground
          // the stem lies behind it (behind the head's plane, so the two keep their order), clear of the stump
          k.rod([x + 0.045, y - 0.01, 0.02], [h[0] + 0.05, h[1] - 0.09, 0.02], 0.02, 4, STEM, { a0: Math.PI / 4, skip: ["bottom", "top"] }, { lod: 1 });
        }
        const back = mul(f, -1);
        const r = Math.abs(f[2]) > 0.9 ? [1, 0, 0] : norm(cross(back, Z)); // its right and up, as you face it
        const up = cross(r, back);
        const at = (rad, a) => add(h, add(mul(r, Math.cos(a) * rad * ROUND), mul(up, Math.sin(a) * rad)));
        const circle = (rad, n, a0) => {
          const P = [];
          for (let j = 0; j < n; j++) P.push(at(rad, (a0 || 0) + (j / n) * TAU));
          return P;
        };
        if (!snapped) {
          // the stem, from the ground to just behind the head (leaning back and a little aside, never in front)
          const top = add(add(h, mul(f, -0.04)), mul(up, -R * 0.25));
          const lean = (i - 1) * 0.025;
          const base = [top[0] - f[0] * 0.03 + r[0] * lean, top[1] - f[1] * 0.03 + r[1] * lean, 0];
          k.rod(base, top, 0.021, 4, STEM, { a0: Math.PI / 4, skip: ["bottom", "top"] });
          // two leaves off the stem, either side, drooping (fine detail)
          [
            [0.3, 1],
            [0.5, -1],
          ].forEach(([t, side]) => {
            const s = lerp(base, top, t);
            const out = mul(r, side);
            const b = add(s, mul(out, 0.032));
            const tip = add(add(b, mul(out, 0.17)), [0, 0, -0.04]);
            const w = mul(norm(add(mul([f[0], f[1], 0], 0.55), [0, 0, 0.85])), 0.045);
            const L = sub(tip, b);
            const leaf = [b, add(add(b, mul(L, 0.3)), w), add(add(b, mul(L, 0.72)), mul(w, 0.75)), tip, add(add(b, mul(L, 0.72)), mul(w, -0.75)), add(add(b, mul(L, 0.3)), mul(w, -1))];
            const sides = k.card(leaf, c("#6f9a3c"), c("#5f8a34"), null, { lod: 0 });
            sides.forEach((lf) => k.line(lf, [add(b, mul(L, 0.08)), add(b, mul(L, 0.85))], STEM, 0.8, { lod: 0 }));
            if (dmg && t < 0.4) sides.forEach((lf) => k.line(lf, [add(add(b, mul(L, 0.45)), mul(w, 0.6)), add(add(b, mul(L, 0.62)), mul(w, -0.5))], INK, 1, { lod: 0 }));
          });
        }
        // the head: a yellow card (its petals and seeds are decals round it: a yellow spot from far off)
        const [front, rear] = k.card(circle(R * 0.6, 10, Math.PI / 2), PETAL, c("#5f8a34"), null, { ink: 0 });
        const star = [];
        for (let j = 0; j < 16; j++) star.push(at(j % 2 ? R * 0.68 : R, Math.PI / 2 + (j / 16) * TAU));
        k.poly(front, star, PETAL, { ink: 1 });
        k.poly(front, circle(R * 0.44, 10), c("#5b4030"), { ink: 1 });
        k.poly(front, circle(R * 0.22, 8), c("#3d2a1c"), { lod: 0 });
        k.poly(rear, star, c("#e0b028"), { ink: 1 });
        k.poly(rear, circle(R * 0.58, 10), c("#5f8a34"), { ink: 1 });
        if (dmg && i === 0) {
          // claws through the petals
          for (let j = 0; j < 3; j++) {
            const a = at(R * 0.85, 2.3 - j * 0.3);
            const b = at(R * 0.85, -0.9 - j * 0.3);
            k.line(front, [a, b], INK, 1.2, { lod: 1 });
          }
        }
      });
    },
  });

  /* =====================================================================================================
     Radio: the whip antenna on a tower's top (yWhip, scale 1.0-1.3, lifted to the tower's top): its base box, the
     mast with two sets of crossed radials (lod 0) and a red ball. Wrecked: bent over.
     ===================================================================================================== */
  YM.add("yWhip", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const STEEL = c("#4b5057");
      const MAST = c("#c9cdd0");
      // the base box (seen from below on its tower), the mast on it
      k.box(-0.036, -0.036, 0, 0.036, 0.036, 0.075, STEEL);
      const r = 0.012;
      const half = r * ROUND * Math.SQRT1_2; // the square mast's half width
      const bend = dmg >= 2 ? 0.6 : 0.965;
      k.rod([0, 0, 0.075], [0, 0, bend], r, 4, MAST, { sx: ROUND, a0: Math.PI / 4, hide: ["bottom", "top"] }, { ink: 0.8 });
      let tip = [0, 0, 0.965];
      if (dmg >= 2) {
        // bent over at the lower radials
        tip = [0.24, 0.05, 0.86];
        k.rod([0, 0, bend], tip, r, 4, MAST, { hide: ["bottom", "top"] }, { ink: 0.8 });
      }
      // crossed radials (the lower pair only once it is bent)
      const levels = dmg >= 2 ? [[0.5, 0.03]] : [[0.81, 0.04], [0.625, 0.03]];
      levels.forEach(([z, L]) => {
        [
          [1, 0, z],
          [-1, 0, z],
          [0, 1, z - 0.012],
          [0, -1, z - 0.012],
        ].forEach(([dx, dy, zz]) => k.rod([dx * half, dy * half, zz], [dx * (half + L * ROUND), dy * (half + L * ROUND), zz], 0.004, 3, c("#3a3d42"), { hide: ["bottom"] }, { lod: 0 }));
      });
      // the red ball on the tip
      k.spin(tip, Z, [[0, 0], [0.013, 0.014], [0.026, 0]], 4, c("#c0302a"), { sx: ROUND });
    },
  });

  /* =====================================================================================================
     Radio: a tower's guy wires (yGuys, scale 3.6 and 5.2 over the tower's tile, never solid): three anchors on the
     ground at 120 degrees (one behind the tower, two to the front, all inside a 3 x 3 plot at both scales), two
     wires to each (from the tower's top and its middle, at its corners). Cracked: a top wire hangs slack; wrecked:
     the back top wire is snapped (a piece dangles, the rest lies by its anchor) and a middle one is gone.
     ===================================================================================================== */
  YM.add("yGuys", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const WIRE = "#2f3136";
      const RA = 0.3; // the anchors' reach from the tower's middle (1.1 tiles at 3.6, 1.56 at 5.2)
      const RT = 0.092; // where the wires meet the tower (its corners at 5.2; just inside the lattice at 3.6)
      const TOP = 0.985;
      const MID = 0.5;
      const AH = 0.012; // an anchor block's height
      // a wire: a thin flat strip (one face shows, its ink a line), broad side out from the tower
      const wire = (p0, p1) => {
        const d = sub(p1, p0);
        const w = mul(norm(cross(d, Z)), 0.0016);
        k.card([sub(p0, w), sub(p1, w), add(p1, w), add(p0, w)], c(WIRE), c(WIRE), null, { ink: 0.55 });
      };
      [
        [0, -1],
        [-0.866, 0.5],
        [0.866, 0.5],
      ].forEach(([dx, dy], i) => {
        const a = [dx * RA, dy * RA, AH + 0.002];
        k.box(a[0] - 0.017, a[1] - 0.017, 0, a[0] + 0.017, a[1] + 0.017, AH, c("#6f7a80"), { hide: ["bottom"] }, { lod: 1 });
        const top = [dx * RT, dy * RT, TOP];
        const mid = [dx * RT, dy * RT, MID];
        if (dmg >= 2 && i === 0) {
          // snapped: a piece dangling from the top, the rest lying from the anchor toward the tower
          wire(top, [dx * (RT + 0.02), dy * (RT + 0.02), TOP - 0.14]);
          wire([a[0], a[1], AH + 0.002], [dx * (RA - 0.16), dy * (RA - 0.16), 0.0015]);
        } else if (dmg >= 1 && i === 2) {
          // slack: it sags in the middle
          const m = lerp(top, a, 0.55);
          const sag = [m[0] + dx * 0.02, m[1] + dy * 0.02, m[2] - 0.07];
          wire(top, sag);
          wire(sag, a);
        } else wire(top, a);
        if (!(dmg >= 2 && i === 1)) wire(mid, a);
      });
    },
  });

  /* =====================================================================================================
     Radio: a dish antenna (yDish, scale 0.55-0.7, lifted onto the tower: its back to the tower's face): the bowl
     faces the front, its feed held out on three struts, on an arm off a pole clamped to the tower. Wrecked: knocked
     up and aside on its broken bracket.
     ===================================================================================================== */
  YM.add("yDish", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(17);
      const STEEL = c("#4b5057");
      const MID = 0.57; // the bowl's middle
      const PY = -0.135; // the pole's line, at the tower's face just behind the dish
      k.rod([0, PY, 0], [0, PY, 0.63], 0.02, 4, STEEL, { sx: ROUND, a0: Math.PI / 4 });
      // the bracket to the bowl's back (broken off when wrecked)
      const py1 = PY + 0.02 * ROUND * Math.SQRT1_2;
      k.box(-0.03, py1, MID - 0.035, 0.03, dmg >= 2 ? py1 + 0.012 : -0.07, MID + 0.035, STEEL, null, { lod: 1 });
      if (dmg >= 2) k.T = turner([0, -0.03, MID], 0.3, 0.42, 0.1);
      const bowl = k.spin([0, -0.07, MID], [0, 1, 0], [[0, 0.16], [0.11, 0.37]], 8, c("#e6e2d8"), { sx: ROUND, a0: 0, fills: { band: [c("#d0cbbf")] } });
      const face = bowl.top;
      const C = [0, 0.04, MID];
      const rim = (a, r) => [C[0] + Math.cos(a) * r * ROUND, C[1], C[2] + Math.sin(a) * r];
      const disc = (r, n, a0) => {
        const P = [];
        for (let i = 0; i < n; i++) P.push(rim((a0 || 0) + (i / n) * TAU, r));
        return P;
      };
      k.poly(face, disc(0.25, 12), c("#c9c4b8"), { ink: 0.6 });
      k.poly(face, disc(0.1, 8), c("#b8b2a4"), { lod: 0 });
      k.wear(face, dmg, rnd, { gouge: false });
      k.wear(bowl.bottom, dmg, rnd, { gouge: false, hole: false });
      // the feed and its struts (thin flat strips: one face shows)
      const FY = 0.24;
      k.box(-0.034 * ROUND, FY, MID - 0.034, 0.034 * ROUND, FY + 0.08, MID + 0.034, STEEL, null, { lod: 1 });
      [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6].forEach((a) => {
        const p0 = rim(a, 0.34);
        p0[1] += 0.004;
        const p1 = [Math.cos(a) * 0.022 * ROUND, FY, MID + Math.sin(a) * 0.022];
        const w = [Math.sin(a) * 0.008, 0, -Math.cos(a) * 0.008]; // across it, in the bowl's plane
        k.card([sub(p0, w), sub(p1, w), add(p1, w), add(p0, w)], STEEL, STEEL, null, { lod: 1 });
      });
      k.T = null;
    },
  });

  /* =====================================================================================================
     Radio: the blinking red beacon (yBeacon, scale 0.24-0.3, lifted; blink: opts.on lit or dark, dark when
     wrecked). The lamp stands off its clamp on a short arm (to its right, +x), clear of a whip's base where both
     stand at the mast's top. Lit: a glowing lens in a soft red glow (the glow at every lod: on its tower it is always
     small); dark: a dull red lens.
     ===================================================================================================== */
  YM.add("yBeacon", {
    opts: [{}],
    blink: true,
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(5);
      const lit = o.on !== false && dmg < 2;
      // it is seen from below, high on its tower and small (lod 2 there): a red ball of glass on a small collar,
      // thin ink between its facets, its glow round it
      const X = 0.44; // the lamp's middle
      const R = 0.1; // the collar's radius (x ROUND across)
      const CZ = 0.06;
      k.box(0.07, -0.06, 0, 0.17, 0.06, 0.1, c("#3a3d42"), null, { lod: 1 });
      const hx = X - R * ROUND * Math.cos(Math.PI / 6);
      k.box(0.17, -0.025, 0.012, hx, 0.025, 0.05, c("#4b5057"), null, { lod: 1 });
      k.spin([X, 0, 0], Z, [[0, R], [CZ, R]], 6, c("#2f3136"), { sx: ROUND, a0: -Math.PI / 6 }, { lod: 1 });
      const lens = k.spin([X, 0, CZ], Z, [[0, 0.1], [0.08, 0.2], [0.23, 0.18], [0.33, 0]], 6, lit ? "#ff3a2a" : c("#7a1e16"), { sx: ROUND, glow: lit }, { ink: 0.5 });
      // a glint, and cracks in the glass
      k.poly(lens.bands[1][1], k.inset(lens.bands[1][1], 0.5), lit ? "#ffd0c8" : c("#b04838"), { lod: 1, glow: lit });
      if (dmg) [lens.bands[1][0], lens.bands[1][3]].forEach((f) => k.wear(f, dmg, rnd, { gouge: false, hole: false }));
      if (lit) k.halo([X, 0, 0.36], 0.33, "#ff503c", 0.3, 5, { lod: 2 }, true);
    },
  });

  /* =====================================================================================================
     Medbay: a red-cross flag on a pole (yFlag, scale 1.7, solid). Seen from the front the pole stands left of the
     middle and the flag flies to the right in two panels, folded as it waves, the cross on both sides. Cracked: torn;
     wrecked: the fly end torn off, a hole, the pole leaning.
     ===================================================================================================== */
  YM.add("yFlag", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      // seen from the front the pole is on your left and the flag flies to your right, as the sprite has them (the
      // model's own right, +x, is your left as you face it)
      const PX = 0.12;
      if (dmg >= 2) k.T = turner([PX, 0, 0], 0, 0.06, -0.1);
      const pr = 0.014;
      k.rod([PX, 0, 0], [PX, 0, 0.962], pr, 6, c("#c9cdd0"), { sx: ROUND, hide: ["top", "bottom"] }, { ink: 0.8 });
      k.spin([PX, 0, 0.962], Z, [[0, 0], [0.017, 0.019], [0.034, 0]], 4, c("#d9a21b"), { sx: ROUND });
      const hx = PX - pr * ROUND - 0.004;
      const yawA = 0.18;
      const dA = [-Math.cos(yawA), Math.sin(yawA), 0];
      const LA = 0.25;
      const top0 = [hx, 0, 0.955];
      const bot0 = [hx, 0, 0.752];
      const top1 = add(add(top0, mul(dA, LA)), [0, 0, -0.01]);
      const bot1 = add(add(bot0, mul(dA, LA)), [0, 0, 0.006]);
      const cloth = c("#f3eee0");
      const panel = k.card([bot0, bot1, top1, top0], cloth, cloth);
      // the red cross, on both sides (the same either way round)
      const mid = add(add(bot0, mul(dA, 0.13)), [0, 0, 0.1]);
      const P = (a, b) => add(add(mid, mul(dA, a)), [0, 0, b]);
      const RED = c("#c0302a");
      panel.forEach((f) => {
        k.poly(f, [P(-0.029, -0.072), P(0.029, -0.072), P(0.029, 0.072), P(-0.029, 0.072)], RED);
        k.poly(f, [P(-0.088, -0.026), P(0.088, -0.026), P(0.088, 0.026), P(-0.088, 0.026)], RED);
        if (dmg) k.line(f, [P(0.1, 0.08), P(0.085, 0.03), P(0.105, -0.01), P(0.09, -0.05)], INK, 1, { lod: 1 });
        if (dmg >= 2) k.poly(f, [P(-0.05, -0.06), P(-0.02, -0.075), P(0.0, -0.05), P(-0.03, -0.035)], "#1c1814", { lod: 1, ink: 0.8 });
      });
      if (dmg < 2) {
        // the fly end, folded back
        const dB = [-Math.cos(yawA - 0.62), Math.sin(yawA - 0.62), 0];
        const LB = 0.095;
        const top2 = add(add(top1, mul(dB, LB)), [0, 0, -0.008]);
        const bot2 = add(add(bot1, mul(dB, LB)), [0, 0, 0.012]);
        const notch = add(lerp(top2, bot2, 0.5), mul(dB, -0.02));
        k.card([bot1, bot2, notch, top2, top1], cloth, cloth);
      } else {
        // torn: a ragged strip left at the fly edge
        const top2 = add(add(top1, mul(dA, 0.03)), [0, 0, -0.01]);
        const tear = add(add(lerp(top1, bot1, 0.5), mul(dA, 0.012)), [0, 0, 0]);
        k.card([lerp(top1, bot1, 0.62), tear, top2, top1], cloth, cloth, null, { lod: 1 });
      }
      k.T = null;
    },
  });

  /* =====================================================================================================
     Archive: a crate of books (yBooks, scale 0.48 solid, and 0.4): BOOKS stenciled on its front and back, a row of
     books standing in it (their spines as stripes), a tall one at the right end and a short one at the left.
     ===================================================================================================== */
  const BOOK_COLS = ["#6b3f8a", "#b3261e", "#2b7a8a", "#d9a21b", "#3f5a8a", "#7a9a3c"];
  YM.add("yBooks", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(41);
      const W = 0.58;
      const D = 0.34;
      const H = 0.62;
      const crate = k.box(-W, -D, 0, W, D, H, c("#a07a4a"), { fills: { top: c("#3a2a1a"), left: c("#94703f"), right: c("#94703f") }, hide: ["bottom"] });
      const SLAT = "rgba(0,0,0,0.35)";
      [
        [crate.front, [-W, D], [W, D]],
        [crate.back, [W, -D], [-W, -D]],
        [crate.left, [-W, -D], [-W, D]],
        [crate.right, [W, D], [W, -D]],
      ].forEach(([f, a, b]) => {
        k.line(f, [[a[0], a[1], 0.43], [b[0], b[1], 0.43]], SLAT, 1.2);
        // the corner posts, darker (fine detail)
        const e = 0.07;
        const ax = [a[0] + Math.sign(b[0] - a[0]) * e, a[1] + Math.sign(b[1] - a[1]) * e];
        const bx = [b[0] + Math.sign(a[0] - b[0]) * e, b[1] + Math.sign(a[1] - b[1]) * e];
        k.poly(f, [[a[0], a[1], 0], [ax[0], ax[1], 0], [ax[0], ax[1], H], [a[0], a[1], H]], c("#7d5f3a"), { lod: 0 });
        k.poly(f, [[bx[0], bx[1], 0], [b[0], b[1], 0], [b[0], b[1], H], [bx[0], bx[1], H]], c("#7d5f3a"), { lod: 0 });
        k.wear(f, dmg, rnd);
      });
      const TEXT = c("#3a2a1a");
      k.text(crate.front, [0, D, 0.22], "BOOKS", 0.2, TEXT);
      k.text(crate.back, [0, -D, 0.22], "BOOKS", 0.2, TEXT);
      // the books
      const X0 = -0.44;
      const X1 = 0.32;
      const BT = 0.85;
      const row = k.box(X0, -0.2, H, X1, 0.2, BT, c(BOOK_COLS[0]), { fills: { right: c(BOOK_COLS[5]) }, hide: ["bottom"] });
      const n = 6;
      for (let i = 1; i < n; i++) {
        const a = X0 + ((X1 - X0) * i) / n;
        const b = X0 + ((X1 - X0) * (i + 1)) / n;
        const col = c(BOOK_COLS[i]);
        k.poly(row.top, [[a, -0.2, BT], [b, -0.2, BT], [b, 0.2, BT], [a, 0.2, BT]], col);
        k.poly(row.front, [[a, 0.2, H], [b, 0.2, H], [b, 0.2, BT], [a, 0.2, BT]], col);
        k.poly(row.back, [[a, -0.2, H], [b, -0.2, H], [b, -0.2, BT], [a, -0.2, BT]], col);
      }
      // the gaps between them (fine detail)
      for (let i = 1; i < n; i++) {
        const a = X0 + ((X1 - X0) * i) / n;
        k.line(row.top, [[a, -0.2, BT], [a, 0.2, BT]], INK, 0.7, { lod: 0 });
      }
      k.box(X1, -0.19, H, X1 + 0.12, 0.19, 0.93, c(BOOK_COLS[1]), { hide: ["bottom"] }, { lod: 1 });
      k.box(-0.56, -0.18, H, X0, 0.18, 0.79, c(BOOK_COLS[2]), { hide: ["bottom"] }, { lod: 1 });
    },
  });

  /* =====================================================================================================
     Archive and Lab: a lamp post (yLamp, scale 1.6, solid): a plinth, the pole, a square lantern narrowing upward
     under a pyramid cap, lit in a warm glow. Cracked: cracked glass; wrecked: dark and holed.
     ===================================================================================================== */
  YM.add("yLamp", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(29);
      const lit = dmg < 2;
      const IRON = c("#2f3136");
      const plinth = k.box(-0.06, -0.06, 0, 0.06, 0.06, 0.06, IRON, { hide: ["bottom"] });
      k.wear(plinth.front, dmg, rnd, { gouge: false, hole: false });
      k.rod([0, 0, 0.06], [0, 0, 0.85], 0.02, 4, IRON, { sx: ROUND, a0: Math.PI / 4, hide: ["bottom", "top"] });
      const S2 = Math.SQRT2;
      // the lantern's glass (lit from below too) and its cap
      const glass = k.spin([0, 0, 0.85], Z, [[0, 0.062 * S2], [0.08, 0.047 * S2]], 4, lit ? "#fff1b8" : c("#4a4a3a"), { sx: ROUND, a0: Math.PI / 4, glow: lit, hide: ["top"] });
      glass.bands[0].forEach((f) => {
        const P = k.corners(f);
        k.line(f, [lerp(P[0], P[1], 0.5), lerp(P[3], P[2], 0.5)], INK, 0.8, { lod: 0 });
        if (dmg) k.wear(f, dmg, rnd, { gouge: false });
      });
      k.spin([0, 0, 0.93], Z, [[0, 0.07 * S2], [0.055, 0]], 4, IRON, { sx: ROUND, a0: Math.PI / 4 });
      if (lit) k.halo([0, 0, 0.89], 0.135, "#ffe68c", 0.28, 8);
    },
  });

  /* =====================================================================================================
     Well: the stone ring (yWellRing, scale 0.62, solid), and the ring under the roof (yWellRoof): a ring of stone
     facets (mortar lines at lod 0), its rim, the shaft's shadowed wall and the dark water on top.
     ===================================================================================================== */
  function wellRing(k, R, H, n, rows, c, dmg, rnd, wearEvery, waterLod) {
    const STONE = "#9a9890";
    const tones = [0, -12, 8, -6, 12, -3, 5, -9];
    const ring = k.spin([0, 0, 0], Z, [[0, R], [H, R]], n, c(STONE), { fills: { top: c("#a3a199"), band: (b, i) => c(shade(STONE, tones[i % tones.length])) }, hide: ["bottom"] });
    const top = ring.top;
    k.poly(top, ringPts([0, 0, H], R * 0.8, n, 1, 1, Math.PI / 2 - Math.PI / n), c("#5e5c56"), { ink: 0.8 });
    k.poly(top, ringPts([0, 0, H], R * 0.66, 12), "#1d2a33", { ink: 0.8, lod: waterLod == null ? 2 : waterLod });
    k.line(top, [[-R * 0.3, R * 0.25, H], [-R * 0.05, R * 0.33, H]], "rgba(190,215,230,0.55)", 1, { lod: 0 });
    // mortar: one line per facet, along each course and up the joints (the facet edges are inked already)
    ring.bands[0].forEach((f, i) => {
      const [p0, p1, p2, p3] = k.corners(f);
      const L = (t) => lerp(p0, p3, t);
      const Rt = (t) => lerp(p1, p2, t);
      const M = (t, s) => lerp(L(t), Rt(t), s);
      const s = i % 2 ? 0.35 : 0.65;
      const path = rows === 3 ? [L(1 / 3), M(1 / 3, s), M(0, s), M(1 / 3, s), Rt(1 / 3), Rt(2 / 3), M(2 / 3, 1 - s), M(1, 1 - s), M(2 / 3, 1 - s), L(2 / 3)] : [M(0, s), M(0.5, s), L(0.5), Rt(0.5), M(0.5, 1 - s), M(1, 1 - s)];
      k.line(f, path, "rgba(15,16,18,0.55)", 0.8, { lod: 0 });
      if (dmg && i % (wearEvery || 3) === 0) k.wear(f, dmg, rnd, { k: 0.9 });
    });
    if (dmg >= 2) k.poly(top, [[R * 0.62, -R * 0.2, H], [R * 0.95, -R * 0.32, H], [R * 0.97, 0.02, H], [R * 0.7, R * 0.08, H]], "#1c1814", { lod: 1, ink: 0.8 });
    return ring;
  }
  YM.add("yWellRing", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(83);
      // as wide as its tile lets it be: a low, wide ring, as the sprite has it
      const R = 0.79;
      const H = 0.6;
      wellRing(k, R, H, 10, 3, c, dmg, rnd);
      // the bucket left on the rim (on your right as you face it)
      const bk = k.spin([-0.6, 0.2, H], Z, [[0, 0.08], [0.16, 0.1]], 6, c("#8a6a46"), { sx: ROUND, fills: { top: c("#2a1f17") }, hide: ["bottom"] }, { lod: 1 });
      bk.bands[0].forEach((f) => {
        const [p0, p1, p2, p3] = k.corners(f);
        k.line(f, [lerp(p0, p3, 0.55), lerp(p1, p2, 0.55)], INK, 0.8, { lod: 0 });
      });
    },
  });

  /* =====================================================================================================
     Well: the well with its roof (yWellRoof, scale 1.55, solid): the ring, two posts on its rim, a gabled roof of
     red-brown shingles on them (its ridge runs left to right, board gable ends), the windlass between the posts with
     the rope wound on it and the bucket hanging over the water, the crank on the post on your right as you face it.
     The 2D one was round only because a sprite always faces you.
     ===================================================================================================== */
  YM.add("yWellRoof", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(85);
      const R = 0.29;
      const H = 0.33;
      wellRing(k, R, H, 8, 2, c, dmg, rnd, 8, 1);
      const WOOD = c("#6b5034");
      const PX = 0.22;
      const PW = 0.022;
      const PD = 0.026;
      // the roof: one gabled block (its ridge left to right) on the posts, shingle slopes, board gable ends, dark
      // underneath, a thin eave along the front and back
      const RX = 0.31;
      const RY = 0.31;
      const RB = 0.72; // its underside
      const EV = 0.03; // the eaves' depth
      const RT = 0.97; // the ridge
      [-1, 1].forEach((s) => k.box(s * PX - PW, -PD, H, s * PX + PW, PD, RB, WOOD, { hide: ["bottom", "top"] }, { lod: 1 }));
      const SH = c("#7a4536");
      const ED = c("#62342a");
      const roof = k.extrude(
        [
          [-RX, -RY, RB],
          [-RX, RY, RB],
          [-RX, RY, RB + EV],
          [-RX, 0, RT],
          [-RX, -RY, RB + EV],
        ],
        [2 * RX, 0, 0],
        SH,
        { fills: { cap0: c("#7a5c3c"), cap1: c("#7a5c3c"), sides: [c("#3a2420"), ED, SH, SH, ED] } }
      );
      // shingle courses across each slope, boards up the gable ends
      [
        [roof.sides[2], 1],
        [roof.sides[3], -1],
      ].forEach(([f, s]) => {
        [0.3, 0.55, 0.8].forEach((t) => {
          const y = s * RY * t;
          const z = RT - (RT - RB - EV) * t;
          k.line(f, [[-RX, y, z], [RX, y, z]], "rgba(15,16,18,0.55)", 1, { lod: 1 });
        });
        if (s > 0) k.wear(f, dmg, rnd);
      });
      [roof.cap0, roof.cap1].forEach((f) => {
        const x = f === roof.cap0 ? -RX : RX;
        [-0.12, 0.12].forEach((y) => k.line(f, [[x, y, RB], [x, y, RT - Math.abs(y) * ((RT - RB - EV) / RY)]], "rgba(15,16,18,0.45)", 0.8, { lod: 0 }));
      });
      // the windlass (fine detail: a few px wide from where lod 1 starts): its axle between the posts, the rope
      // wound on its middle, the crank
      const AZ = 0.596;
      const ax = k.rod([-(PX - PW), 0, AZ], [PX - PW, 0, AZ], 0.02, 6, c("#8a6a46"), { hide: ["bottom", "top"] }, { lod: 0 });
      ax.bands[0].forEach((f) => {
        const [p0, p1, p2, p3] = k.corners(f);
        const t0 = (PX - PW - 0.04) / (2 * (PX - PW));
        k.poly(f, [lerp(p0, p3, t0), lerp(p1, p2, t0), lerp(p1, p2, 1 - t0), lerp(p0, p3, 1 - t0)], c("#c9a27a"), { ink: 0.6 });
      });
      // the crank on the post on your right as you face it (the model's left)
      k.box(-(PX + PW + 0.018), -0.014, 0.49, -(PX + PW), 0.014, AZ + 0.014, WOOD, null, { lod: 0 });
      // the rope and the bucket over the water
      k.rod([0, 0, AZ - 0.02], [0, 0, 0.44], 0.006, 3, c("#c9a27a"), null, { lod: 0 });
      k.spin([0, 0, 0.36], Z, [[0, 0.036], [0.08, 0.046]], 6, c("#8a6a46"), { sx: ROUND, fills: { top: c("#2a1f17") } }, { lod: 0 });
    },
  });

  /* =====================================================================================================
     Well: a wooden bucket (yBucket, scale 0.26): staves, an iron band, the wire handle (lod 1).
     ===================================================================================================== */
  YM.add("yBucket", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(13);
      const TOP = 0.72;
      const RB = 0.3;
      const RT = 0.4;
      const body = k.spin([0, 0, 0], Z, [[0, RB], [TOP, RT]], 8, c("#8a6a46"), { sx: ROUND, fills: { top: c("#2a1f17"), band: (b, i) => c(i % 2 ? "#8a6a46" : "#7d5f3e") }, hide: ["bottom"] });
      body.bands[0].forEach((f, i) => {
        const [p0, p1, p2, p3] = k.corners(f);
        k.line(f, [lerp(p0, p3, 0.6), lerp(p1, p2, 0.6)], INK, 1);
        k.line(f, [lerp(p0, p3, 0.12), lerp(p1, p2, 0.12)], INK, 0.8, { lod: 0 });
        if (i % 4 === 1) k.wear(f, dmg, rnd, { gouge: false });
      });
      k.poly(body.top, ringPts([0, 0, TOP], RT * 0.78, 8, ROUND, ROUND, Math.PI / 2 - Math.PI / 8), c("#1d2a33"), { lod: 0 });
      // the wire handle, up from the rim either side to the wooden grip
      const RIM = RT * ROUND * 0.95;
      k.rod([-RIM, 0, TOP], [-0.06, 0, 0.98], 0.014, 3, c("#3a3d42"), { skip: ["bottom"] }, { lod: 1 });
      k.rod([0.06, 0, 0.98], [RIM, 0, TOP], 0.014, 3, c("#3a3d42"), { skip: ["top"] }, { lod: 1 });
      k.rod([-0.06, 0, 0.98], [0.06, 0, 0.98], 0.02, 4, c("#8a6a46"), null, { lod: 1 });
    },
  });

  /* =====================================================================================================
     Well: a hand pump (yPump, scale 0.95, solid): a stone base, the green body and head, the spout to the front
     (its water dripping), the handle back and up. Wrecked: the handle snapped and hanging, no water.
     ===================================================================================================== */
  YM.add("yPump", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(31);
      const base = k.box(-0.2, -0.2, 0, 0.2, 0.2, 0.12, c("#9a9890"), { hide: ["bottom"] });
      ["front", "back", "left", "right"].forEach((s) => {
        const f = base[s];
        const P = k.corners(f);
        k.line(f, [lerp(P[0], P[3], 0.5), lerp(P[1], P[2], 0.5)], "rgba(15,16,18,0.5)", 0.8, { lod: 0 });
        if (s === "front" || s === "back") k.wear(f, dmg, rnd, { gouge: false, k: 0.8 });
      });
      const R = 0.088;
      const body = k.spin([0, 0, 0.12], Z, [[0, R], [0.56, R]], 8, c("#3f6a4a"), { sx: ROUND, hide: ["bottom", "top"] });
      body.bands[0].forEach((f, i) => {
        const [p0, p1, p2, p3] = k.corners(f);
        // a shine down the front-left of the pipe (fine detail)
        if (i === 1) k.poly(f, [lerp(p0, p1, 0.3), lerp(p0, p1, 0.6), lerp(p3, p2, 0.6), lerp(p3, p2, 0.3)], "rgba(255,255,255,0.2)", { lod: 0 });
        if (dmg && i % 4 === 0) k.wear(f, dmg, rnd, { gouge: i === 0, hole: i === 0 });
      });
      const head = k.box(-0.125, -0.125, 0.68, 0.125, 0.125, 0.79, c("#355c3f"), { hide: ["bottom"] });
      k.wear(head.front, dmg, rnd, { hole: false });
      // the spout (to the front) and its mouth
      const ap = R * ROUND * Math.cos(Math.PI / 8); // the body's front face
      const sp = k.extrude(
        [
          [-0.036, ap, 0.556],
          [-0.036, 0.3, 0.528],
          [-0.036, 0.3, 0.588],
          [-0.036, ap, 0.632],
        ],
        [0.072, 0, 0],
        c("#355c3f"),
        { hide: [3] },
        { lod: 1 }
      );
      k.poly(sp.sides[1], k.inset(sp.sides[1], 0.35), INK, { lod: 1 });
      if (dmg < 2) k.rod([0, 0.285, 0.522], [0, 0.285, 0.43], 0.009, 3, "#6fb0d0", { skip: ["top"] }, { lod: 0, ink: 0.5 });
      // the handle (snapped and hanging when wrecked) and its grip
      const h0 = dmg >= 2 ? [0, -0.147, 0.775] : [0, -0.06, 0.802];
      const h1 = dmg >= 2 ? [0, -0.24, 0.66] : [0, -0.24, 0.98];
      k.rod(h0, h1, 0.017, 4, c("#4b5057"), { a0: Math.PI / 4 }, { lod: 1 });
      const g = add(h1, mul(norm(sub(h1, h0)), 0.026));
      k.spin(sub(g, [0, 0, 0.024]), Z, [[0, 0], [0.024, 0.024], [0.048, 0]], 4, c("#4b5057"), { sx: ROUND }, { lod: 0 });
    },
  });

  /* =====================================================================================================
     Farm: a scarecrow (yScarecrow, scale 1.3, solid): a post, a straw fringe under a red plaid shirt, the crossbar
     of its arms behind the shirt with straw at the ends, a burlap head with stitched eyes and mouth on its front,
     a straw hat with a red band.
     ===================================================================================================== */
  YM.add("yScarecrow", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(47);
      const POLE = c("#7d5f40");
      const STRAW = c("#d9c04a");
      const PLAID = c("#b3261e");
      const DARK = c("#2f3136");
      k.box(-0.018, -0.018, 0, 0.018, 0.018, 0.25, POLE, { hide: ["bottom", "top"] });
      // the straw fringe and the shirt
      const fringe = k.spin([0, 0, 0.25], Z, [[0, 0.13], [0.05, 0.1]], 8, STRAW, { sx: ROUND, hide: ["top"] }, { lod: 0 });
      fringe.bands[0].forEach((f) => {
        const [p0, p1, p2, p3] = k.corners(f);
        k.line(f, [lerp(p0, p1, 0.25), lerp(p3, p2, 0.3), lerp(p0, p1, 0.5), lerp(p3, p2, 0.65), lerp(p0, p1, 0.8)], c("#a88a2a"), 0.8, { lod: 0 });
      });
      const SY = 0.07;
      const shirt = k.extrude(
        [
          [-0.125, -SY, 0.3],
          [0.125, -SY, 0.3],
          [0.15, -SY, 0.66],
          [-0.15, -SY, 0.66],
        ],
        [0, 2 * SY, 0],
        PLAID,
        { hide: [] }
      );
      [shirt.cap1, shirt.cap0].forEach((f, side) => {
        const y = side ? -SY : SY;
        k.line(f, [[-0.13, y, 0.42], [0.13, y, 0.42]], DARK, 1.1);
        k.line(f, [[-0.14, y, 0.545], [0.14, y, 0.545]], DARK, 1.1);
        k.line(f, [[0, y, 0.3], [0, y, 0.66]], DARK, 0.9);
        k.line(f, [[-0.075, y, 0.3], [-0.09, y, 0.66]], "rgba(15,16,18,0.35)", 0.7, { lod: 0 });
        k.line(f, [[0.075, y, 0.3], [0.09, y, 0.66]], "rgba(15,16,18,0.35)", 0.7, { lod: 0 });
        k.wear(f, dmg, rnd);
      });
      // the crossbar behind the shirt, straw at its ends
      const AZ0 = 0.6;
      const AZ1 = 0.645;
      k.box(-0.27, -SY - 0.04, AZ0, 0.27, -SY, AZ1, POLE, null, { lod: 1 });
      [-1, 1].forEach((s) => {
        const tuft = k.spin([s * 0.27, -SY - 0.02, (AZ0 + AZ1) / 2], [s, 0, 0], [[0, 0.03], [0.065, 0.05]], 5, STRAW, { hide: ["bottom"] }, { lod: 0 });
        tuft.bands[0].forEach((f) => {
          const [p0, p1, p2, p3] = k.corners(f);
          k.line(f, [lerp(p0, p3, 0.2), lerp(p1, p2, 0.6)], c("#a88a2a"), 0.8, { lod: 0 });
        });
      });
      // the head: a burlap sack, its face on the front facet
      const head = k.spin([0, 0, 0.66], Z, [[0, 0.092], [0.19, 0.074]], 6, c("#c9a26a"), { sx: ROUND, hide: ["bottom", "top"] });
      const front = head.bands[0][0];
      const pt = (x, z) => {
        // the point on the front facet at x across and z up
        const f = front;
        const y = f.cy - (f.nx * (x - f.cx) + f.nz * (z - f.cz)) / f.ny;
        return [x, y, z];
      };
      const eye = (x) => [pt(x - 0.012, 0.785), pt(x + 0.012, 0.785), pt(x + 0.012, 0.8), pt(x - 0.012, 0.8)];
      k.poly(front, eye(-0.028), INK);
      k.poly(front, eye(0.028), INK);
      k.line(front, [pt(-0.035, 0.75), pt(-0.012, 0.744), pt(0.012, 0.744), pt(0.035, 0.75)], INK, 1);
      // the twine round its neck (fine detail)
      head.bands[0].forEach((f) => {
        const [p0, p1, p2, p3] = k.corners(f);
        k.line(f, [lerp(p0, p3, 0.12), lerp(p1, p2, 0.12)], c("#8a6a46"), 1.2, { lod: 0 });
      });
      // the hat: a brim (a card) and its crown with a red band
      const HB = 0.85;
      k.card(ringPts([0, 0, HB], 0.165, 10, ROUND, ROUND, Math.PI / 10), STRAW, c("#b89a38"));
      const crown = k.spin([0, 0, HB], Z, [[0, 0.088], [0.1, 0.07]], 6, STRAW, { sx: ROUND, hide: ["bottom"] }, { lod: 1 });
      crown.bands[0].forEach((f) => {
        const [p0, p1, p2, p3] = k.corners(f);
        k.poly(f, [lerp(p0, p3, 0.12), lerp(p1, p2, 0.12), lerp(p1, p2, 0.36), lerp(p0, p3, 0.36)], c("#b3261e"), { lod: 0 });
      });
    },
  });

  /* =====================================================================================================
     Farm: a hay bale (yHay, scale 0.5, solid and not): a long bale with soft edges, two twine bands, cut ends.
     ===================================================================================================== */
  YM.add("yHay", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(91);
      const L = 0.8;
      const Y = 0.36;
      const Hh = 0.7;
      const e = 0.07;
      const prof = [[-Y + e, 0], [Y - e, 0], [Y, e], [Y, Hh - e], [Y - e, Hh], [-Y + e, Hh], [-Y, Hh - e], [-Y, e]];
      const HAY = c("#d9c04a");
      const bale = k.extrude(
        prof.map(([y, z]) => [-L, y, z]),
        [2 * L, 0, 0],
        HAY,
        { fills: { cap0: c("#e2cd68"), cap1: c("#e2cd68"), sides: [c("#b89f38"), c("#cdb442"), HAY, c("#e0c95a"), c("#e8d266"), c("#e0c95a"), HAY, c("#cdb442")] }, hide: [0] }
      );
      const TWINE = c("#7d5f40");
      const STRAW = c("#a88a2a");
      bale.sides.forEach((f, i) => {
        if (i === 0) return;
        // a side's corners: two at x -L, then two at +L (k.extrude's order); t runs along the bale, s across the side
        const [c0, c1, c2, c3] = k.corners(f);
        const along = (t, s) => lerp(lerp(c0, c3, t), lerp(c1, c2, t), s);
        [0.32, 0.68].forEach((t) => k.line(f, [along(t, 0), along(t, 1)], TWINE, 1.4));
        if (i === 2 || i === 4 || i === 6) {
          const pts = [];
          for (let j = 0; j < 10; j++) pts.push(along(0.05 + j * 0.095 + (rnd() - 0.5) * 0.06, 0.12 + rnd() * 0.76));
          k.line(f, pts, STRAW, 0.8, { lod: 0 });
        }
        if (i === 2 || i === 6) k.wear(f, dmg, rnd);
      });
      [bale.cap0, bale.cap1].forEach((f) => {
        const x = f === bale.cap0 ? -L : L;
        const pts = [];
        for (let j = 0; j < 7; j++) pts.push([x, -Y * 0.7 + j * 0.2 * Y + rnd() * 0.04, 0.15 + (j % 2 ? 0.35 : 0.05) + rnd() * 0.12]);
        k.line(f, pts, STRAW, 0.8, { lod: 0 });
      });
    },
  });

  /* =====================================================================================================
     Lab: a copper still (yStill, scale 0.9, solid): the firebox (flames through its grate front and back), the pot
     on it, its helmet, the lyne arm across to the coil (on your right as you face it), the coil on its stand over the
     jar catching the drips.
     ===================================================================================================== */
  YM.add("yStill", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(71);
      const COPPER = c("#c87a3a");
      // seen from the front the pot is on your left and the coil on your right, as the sprite has them
      const fire = k.box(-0.07, -0.16, 0, 0.33, 0.16, 0.2, c("#4b5057"), { hide: ["bottom"] });
      [fire.front, fire.back].forEach((f, s) => {
        const y = s ? -0.16 : 0.16;
        k.poly(f, [[0.24, y, 0.03], [0.02, y, 0.03], [0.02, y, 0.15], [0.24, y, 0.15]], "#1f2023", { ink: 0.8 });
        if (dmg < 2) k.poly(f, [[0.22, y, 0.035], [0.04, y, 0.035], [0.06, y, 0.1], [0.09, y, 0.06], [0.13, y, 0.13], [0.16, y, 0.065], [0.2, y, 0.11]], "#ff9a3a", { glow: true });
        if (!s) k.wear(f, dmg, rnd, { hole: false });
      });
      const PX = 0.13;
      // the pot: round, its belly widest a third of the way up
      const pot = k.spin([PX, 0, 0.2], Z, [[0, 0.16], [0.19, 0.235], [0.4, 0.13]], 8, COPPER, { sx: ROUND, fills: { band: [c("#b86c30"), COPPER] }, hide: ["bottom"] });
      // a shine down its front-left (the side toward the light)
      k.poly(pot.bands[1][1], k.inset(pot.bands[1][1], 0.45), "rgba(255,255,255,0.3)", { lod: 0 });
      k.wear(pot.bands[1][2], dmg, rnd, { gouge: false });
      // the helmet and the lyne arm off its side, across to the top of the coil
      const HR0 = 0.095;
      const HR1 = 0.05;
      // (the helmet and the arm are fine detail: from lod 1 the pot and the coil carry it)
      k.spin([PX, 0, 0.6], Z, [[0, HR0], [0.16, HR1]], 6, c("#b0682e"), { sx: ROUND, a0: -Math.PI / 6, hide: ["bottom"] }, { lod: 0 });
      const rAt = (z) => HR0 + ((HR1 - HR0) * (z - 0.6)) / 0.16;
      const AX0 = PX - rAt(0.7) * ROUND * Math.cos(Math.PI / 6) - 0.002;
      const CX = -0.27;
      const CT = 0.7; // the coil's top, where the arm comes down on it
      k.box(CX - 0.018, -0.018, CT, AX0, 0.018, CT + 0.035, COPPER, null, { lod: 0 });
      // the coil (its turns as lines) on a stand, the jar under it
      const coil = k.spin([CX, 0, 0.3], Z, [[0, 0.075], [CT - 0.3, 0.075]], 6, COPPER, { sx: ROUND, a0: 0 }, { lod: 1 });
      coil.bands[0].forEach((f) => {
        const [p0, p1, p2, p3] = k.corners(f);
        [0.16, 0.36, 0.56, 0.76, 0.94].forEach((t) => k.line(f, [lerp(p0, p3, t - 0.07), lerp(p1, p2, t)], INK, 0.9, { lod: 0 }));
      });
      [-1, 1].forEach((s) => k.box(CX - 0.012, s * 0.065 - 0.01, 0, CX + 0.012, s * 0.065 + 0.01, 0.3, c("#6b5034"), { hide: ["bottom", "top"] }, { lod: 0 }));
      // the jar: glass, the drips' glowing blue in its bottom half (fine detail; from lod 1 the glass is tinted)
      const jar = k.spin([CX, 0, 0], Z, [[0, 0.05], [0.22, 0.045]], 6, "#b4e6ec", { alpha: 0.85, fills: { top: c("#8aa0a8") }, hide: ["bottom"] }, { lod: 1 });
      jar.bands[0].forEach((f) => {
        const [p0, p1, p2, p3] = k.corners(f);
        k.poly(f, [lerp(p0, p3, 0.08), lerp(p1, p2, 0.08), lerp(p1, p2, 0.5), lerp(p0, p3, 0.5)], "#7fe3e0", { lod: 0 });
      });
    },
  });

  /* =====================================================================================================
     Lab: a roof vent (yVent, scale 0.6, lifted onto the lab's roof): a pipe and a turbine head with its vanes, a
     wisp of steam over it (lod 0).
     ===================================================================================================== */
  YM.add("yVent", {
    opts: [{}],
    build(B, o) {
      const k = kit(B);
      const dmg = o.dmg | 0;
      const c = tone(dmg);
      const rnd = rng(19);
      const pipe = k.spin([0, 0, 0], Z, [[0, 0.1], [0.5, 0.1]], 6, c("#8f969c"), { sx: ROUND, hide: ["bottom", "top"] });
      pipe.bands[0].forEach((f, i) => {
        const [p0, p1, p2, p3] = k.corners(f);
        k.line(f, [lerp(p0, p3, 0.45), lerp(p1, p2, 0.45)], "rgba(15,16,18,0.45)", 0.8, { lod: 0 });
        if (i % 2 === 0) k.wear(f, dmg, rnd, { gouge: i === 0, hole: i === 0 });
      });
      const head = k.spin([0, 0, 0.5], Z, [[0, 0.13], [0.1, 0.25], [0.28, 0.25], [0.42, 0]], 6, c("#aeb3b8"), { sx: ROUND, fills: { band: [c("#9ea3aa"), c("#aeb3b8"), c("#c3c7cc")] }, hide: ["bottom"] });
      // the vanes: lines up its sides, leaning a little the way it turns
      head.bands[1].forEach((f) => {
        const [p0, p1, p2, p3] = k.corners(f);
        [0.25, 0.65].forEach((t) => k.line(f, [lerp(p0, p1, t), lerp(p3, p2, t + 0.2)], INK, 0.8));
      });
      if (dmg) [head.bands[1][0], head.bands[1][3]].forEach((f) => k.wear(f, dmg, rnd, { gouge: false }));
      if (dmg < 2) k.spin([0, 0, 0.92], Z, [[0, 0], [0.04, 0.06], [0.1, 0.05], [0.14, 0]], 6, "#c8f0f0", { sx: ROUND, alpha: 0.35, glow: true }, { lod: 0, ink: 0, bias: -1 });
    },
  });

  /* =====================================================================================================
     A wrecked build's debris (yDebris, scale 0.5, never solid; opts.v 0..2 varies the pile as the sprite's does):
     a board flat on the ground with one or two more across it (one end down, the other up on it), splintered at
     their ends; rubble along the front and the back, pushed clear of the boards; a sheet of tin bent over at the
     back (v 1 and 2). The sprite's own random sequence picks the stones and the boards' lengths and shades. It is
     the damage itself: it takes no dmg.
     ===================================================================================================== */
  YM.add("yDebris", {
    opts: [{ v: 0 }, { v: 1 }, { v: 2 }],
    key: (o) => "v" + ((((o && o.v) | 0) % 3) + 3) % 3,
    build(B, o) {
      const k = kit(B);
      const v = (((o.v | 0) % 3) + 3) % 3;
      const r = rng(91 + v * 7); // the sprite's sequence: the stones along the pile, the boards' lengths and shades
      const r2 = rng(311 + v * 13); // where things lie across it (the sprite has no depth)
      const PX = 72; // the sprite's px a unit
      const stones = [];
      for (let i = 0; i < 7; i++) stones.push([(14 + r() * 100 - 64) / PX, (5 + r() * 7) / PX, shade("#8a8378", Math.round(r() * 30 - 15))]);
      // the boards: [middle x, y, turn, length, rise of its far end (0: flat), shade]. The first lies flat; the others
      // cross it near its ends, low end on the ground, resting on it a little past their middles (high enough over
      // all of the crossing)
      const W = 0.1;
      const T = 0.04;
      const jit = () => (r() - 0.5) * 0.12;
      const b0 = [0.02 + jit(), 0.08, 0.15 + jit(), 0.86 + r() * 0.08, 0, shade("#9a7650", Math.round(r() * 24 - 12))];
      const boards = [b0];
      const across = (u, yaw, L, col) => {
        const X = [b0[0] + Math.cos(b0[2]) * u, b0[1] + Math.sin(b0[2]) * u];
        const ac = 0.14 * L; // where along it it crosses
        const th = Math.abs(Math.sin(yaw - b0[2]));
        const reach = W / 2 / th + (W / 2) * Math.sqrt(1 - th * th) / th; // half the crossing, along it
        const rise = (T + 0.01) / ((ac - reach) / L + 0.5);
        boards.push([X[0] - Math.cos(yaw) * ac, X[1] - Math.sin(yaw) * ac, yaw, L, rise, col]);
      };
      across(0.27, b0[2] + 1.05 + jit(), 0.56 + r() * 0.06, shade("#9a7650", Math.round(r() * 24 - 12)));
      if (v !== 1) across(-0.25, b0[2] - 1.0 + jit(), 0.5 + r() * 0.05, shade("#8a6a46", Math.round(r() * 24 - 12)));
      boards.forEach(([cx, cy, yaw, L, rise, col], i) => {
        const ax = [Math.cos(yaw), Math.sin(yaw), 0];
        const ay = [-Math.sin(yaw), Math.cos(yaw), 0];
        // its low end on the ground, its far end (+a) up on the flat board
        const P = (a, b, h) => add(add([cx, cy, h + (a / L + 0.5) * rise], mul(ax, a)), mul(ay, b));
        // one lying across another is drawn over it (no plane parts them: it is on top, and the eye is above)
        const board = k.extrude([P(-L / 2, -W / 2, 0), P(L / 2, -W / 2, 0), P(L / 2, W / 2, 0), P(-L / 2, W / 2, 0)], [0, 0, T], col, { hide: ["cap0"] }, { lod: i < 2 ? 2 : 1, bias: rise ? 0.3 : 0 });
        const top = board.cap1;
        k.poly(top, [P(L / 2 - 0.09, -W / 2, T), P(L / 2, -W / 2, T), P(L / 2 - 0.05, -W * 0.1, T), P(L / 2, W * 0.25, T), P(L / 2 - 0.07, W / 2, T)], "#2a1f17", { lod: 1 });
        k.line(top, [P(-L / 2 + 0.05, 0, T), P(L / 2 - 0.12, 0.004, T)], "rgba(15,16,18,0.3)", 0.7, { lod: 0 });
      });
      // a stone is pushed out (to the front or the back) until it is clear of every board, the sheet and the stones
      // laid already
      const SHEET = v !== 0 ? [-0.64, -0.47, -0.08, -0.17] : null; // on your right as you face it, as the sprite has it
      const laid = [];
      const clear = (x, y, rad) =>
        boards.every(([cx, cy, yaw, L]) => {
          const dx = x - cx;
          const dy = y - cy;
          const a = dx * Math.cos(yaw) + dy * Math.sin(yaw);
          const b = -dx * Math.sin(yaw) + dy * Math.cos(yaw);
          return Math.abs(a) > L / 2 + rad + 0.01 || Math.abs(b) > W / 2 + rad + 0.01;
        }) &&
        !(SHEET && x + rad > SHEET[0] && x - rad < SHEET[2] && y + rad > SHEET[1] && y - rad < SHEET[3]) &&
        laid.every(([sx, sy, sr]) => Math.hypot(x - sx, y - sy) > (rad + sr) * ROUND + 0.01);
      stones.forEach(([x, s, col], i) => {
        const out = i % 2 === 0 ? 1 : -1;
        const rad = s * 0.95;
        let y = out * (0.22 + r2() * 0.08);
        while (Math.abs(y) < 0.5 && !clear(x, y, rad)) y += out * 0.03;
        const h = s * (0.8 + r2() * 0.4);
        const turn = r2() * TAU;
        if (!clear(x, y, rad)) return; // no room for it near the pile
        laid.push([x, y, rad]);
        // a chunk: a lumpy frustum, turned at random (fine detail but the first two)
        k.spin([x, y, 0], Z, [[0, rad], [h, rad * 0.45]], s > 0.12 ? 5 : 4, col, { a0: turn, hide: ["bottom"] }, { lod: i < 1 ? 1 : 0 });
      });
      if (SHEET) {
        // a sheet of tin bent over at the back: two slabs from the ground up to a fold, each thick outward
        const TIN = "#8f969c";
        const x0 = -0.62;
        const x1 = -0.1;
        const yA = -0.45;
        const yF = -0.32;
        const zF = 0.32;
        const yB = -0.19;
        const t = 0.016;
        const n = norm([0, yF - yA, zF]);
        const a = k.extrude([[x0, yA, 0], [x1, yA, 0], [x1, yF, zF], [x0, yF, zF]], [0, -n[2] * t, n[1] * t], shade(TIN, -12), null, { lod: 1 });
        const b = k.extrude([[x0, yF, zF], [x1, yF, zF], [x1, yB, 0], [x0, yB, 0]], [0, n[2] * t, n[1] * t], TIN, null, { lod: 2 });
        // corrugations down each slope, on its outer face
        [
          [a.cap1, yA, yF],
          [b.cap1, yB, yF],
        ].forEach(([f, yg, yf]) => {
          const gz = [0, 0, 0];
          [0.2, 0.4, 0.6, 0.8].forEach((u) => {
            const x = x0 + (x1 - x0) * u;
            const g = [x, yg, 0];
            const fo = [x, yf, zF];
            const e = f === a.cap1 ? [0, -n[2] * t, n[1] * t] : [0, n[2] * t, n[1] * t];
            k.line(f, [add(add(g, e), gz), add(fo, e)], "rgba(15,16,18,0.35)", 0.8, { lod: 0 });
          });
        });
      }
    },
  });

  /* =====================================================================================================
     The porch: a square white post (hPost, scale 0.98): base block, plinth, shaft, capital and cap.
     ===================================================================================================== */
  const TRIM = "#f7f4ec";
  const BLOCK = "#e9e4d8";
  YM.add("hPost", {
    opts: [{}],
    build(B) {
      const k = kit(B);
      const sq = (h, z0, z1, fill, hide, lod) => k.box(-h, -h, z0, h, h, z1, fill, { hide }, { lod });
      sq(0.076, 0, 0.078, BLOCK, ["bottom"], 2);
      sq(0.06, 0.078, 0.11, TRIM, ["bottom"], 1);
      const shaft = sq(0.05, 0.11, 0.922, TRIM, ["bottom", "top"], 2);
      ["front", "back", "left", "right"].forEach((s) => {
        const P = k.corners(shaft[s]);
        k.line(shaft[s], [lerp(lerp(P[0], P[1], 0.3), lerp(P[3], P[2], 0.3), 0.04), lerp(lerp(P[0], P[1], 0.3), lerp(P[3], P[2], 0.3), 0.96)], "rgba(15,16,18,0.12)", 0.8, { lod: 0 });
      });
      sq(0.065, 0.922, 0.958, TRIM, ["bottom"], 1);
      sq(0.08, 0.958, 0.995, BLOCK, [], 2);
    },
  });

  /* =====================================================================================================
     The porch: the iron dinner bell (hBell, scale 0.95, solid) on its own post: a footing, the post, its cap, the
     arm out to your right as you face it with its brace, the yoke, the bell (its flared lip and dark mouth), the
     clapper and the pull rope with its tassel.
     ===================================================================================================== */
  YM.add("hBell", {
    opts: [{}],
    build(B) {
      const k = kit(B);
      const WOOD = "#8a6a46";
      const DARKW = "#6b5034";
      const IRON = "#3a3d42";
      // seen from the front its post is on your left and the bell hangs to your right, as the sprite has them
      const P0 = 0.11; // the post's inner face (the arm's side) and its outer face
      const P1 = 0.19;
      k.extrude([[0.226, 0.06, 0], [0.074, 0.06, 0], [0.096, 0.06, 0.034], [0.204, 0.06, 0.034]], [0, -0.12, 0], DARKW, { hide: ["cap0"] }, { lod: 0 });
      const post = k.box(P0, -0.04, 0.034, P1, 0.04, 0.915, WOOD, { hide: ["bottom"] });
      [post.front, post.back].forEach((f) => {
        const y = f === post.front ? 0.04 : -0.04;
        k.line(f, [[(P0 + P1) / 2, y, 0.05], [(P0 + P1) / 2, y, 0.9]], "rgba(15,16,18,0.5)", 0.8, { lod: 0 });
      });
      k.box(P0 - 0.01, -0.05, 0.915, P1 + 0.01, 0.05, 0.95, DARKW, { hide: ["bottom"] }, { lod: 0 });
      const XB = -0.1; // the bell's middle
      k.box(XB - 0.15, -0.025, 0.852, P0, 0.025, 0.898, WOOD, null, { lod: 2 });
      k.extrude([[P0, -0.015, 0.69], [-0.045, -0.015, 0.852], [0.005, -0.015, 0.852], [P0, -0.015, 0.74]], [0, 0.03, 0], WOOD, null, { lod: 0 });
      k.box(XB - 0.03, -0.022, 0.81, XB + 0.03, 0.022, 0.852, "#2f3136", null, { lod: 0 });
      const body = k.spin([XB, 0, 0.64], Z, [[0, 0.07], [0.17, 0.042]], 8, IRON, { sx: ROUND, hide: ["bottom"] }, { lod: 1 });
      k.poly(body.bands[0][1], k.inset(body.bands[0][1], 0.45), "#6a6f76", { lod: 0 });
      k.spin([XB, 0, 0.585], Z, [[0, 0.108], [0.055, 0.07]], 8, IRON, { sx: ROUND, fills: { bottom: "#2a2c30" }, hide: ["top"] });
      // the clapper and the rope
      k.rod([XB, 0, 0.585], [XB, 0, 0.56], 0.006, 4, "#4b5057", null, { lod: 0 });
      k.spin([XB, 0, 0.532], Z, [[0, 0], [0.014, 0.014], [0.028, 0]], 4, "#4b5057", { sx: ROUND }, { lod: 1 });
      k.rod([XB, 0, 0.532], [XB - 0.012, 0, 0.302], 0.012, 4, "#c9a26a", { skip: ["top"] }, { lod: 1, ink: 0.7 });
      k.box(XB - 0.012 - 0.02, -0.02, 0.278, XB - 0.012 + 0.02, 0.02, 0.3, WOOD, null, { lod: 0 });
      k.spin([XB - 0.012, 0, 0.225], Z, [[0, 0.03], [0.053, 0.012]], 5, "#c9a26a", { hide: ["top"] }, { lod: 0 });
    },
  });

  /* =====================================================================================================
     The porch: the bench June sits on (hBench, scale 0.34, solid): its front (+y) faces out of the porch; a seat
     of boards with its top at SEAT_Z, two back boards between the back posts, armrests on the front legs, a
     stretcher between the front legs.
     ===================================================================================================== */
  YM.add("hBench", {
    opts: [{}],
    seat: SEAT_Z,
    build(B) {
      const k = kit(B);
      const c = "#8a6a46";
      const DARK = shade(c, -15);
      const XI = 0.94; // the seat's ends, the legs outside them
      const XO = 1.0;
      // far off (lod 2) it is its seat and its top back board; the posts, legs and lower board from lod 1, the
      // armrests, the stretcher and the slats' gaps from lod 0
      const seat = k.box(-XI, -0.3, SEAT_Z - 0.08, XI, 0.22, SEAT_Z, shade(c, 6), { fills: { top: shade(c, 18) }, hide: ["bottom"] });
      [-0.13, 0.04].forEach((y) => k.line(seat.top, [[-XI, y, SEAT_Z], [XI, y, SEAT_Z]], "rgba(15,16,18,0.55)", 0.9, { lod: 0 }));
      [-1, 1].forEach((s) => {
        k.box(s > 0 ? XI : -XO, -0.36, 0, s > 0 ? XO : -XI, -0.3, 0.94, DARK, { hide: ["bottom"] }, { lod: 1 });
        k.box(s > 0 ? XI : -XO, 0.12, 0, s > 0 ? XO : -XI, 0.18, 0.58, DARK, { hide: ["bottom", "top"] }, { lod: 1 });
        k.box(s > 0 ? XI : -1.06, -0.3, 0.58, s > 0 ? 1.06 : -XI, 0.24, 0.66, shade(c, 10), { hide: ["bottom"] }, { lod: 0 });
      });
      const back1 = k.box(-XO, -0.3, 0.66, XO, -0.24, 0.76, shade(c, 6), null, { lod: 1 });
      const back2 = k.box(-XO, -0.3, 0.79, XO, -0.24, 0.9, c);
      [
        [back1.front, 0.71],
        [back2.front, 0.845],
      ].forEach(([f, z]) => {
        [-0.97, 0.97].forEach((x) => k.poly(f, ringPts([x, -0.24, z], 0.018, 6).map((p) => [p[0], -0.24, z + (p[1] + 0.24)]), "#3a3d42", { lod: 0 }));
      });
      k.box(-XI, 0.13, 0.16, XI, 0.17, 0.22, shade(c, -22), null, { lod: 0 });
    },
  });
})(typeof window !== "undefined" ? window : globalThis);
