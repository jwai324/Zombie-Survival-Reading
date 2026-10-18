/* Yard models, part 1 (js/yardmodels.js has the contract): the lot signs and plaques, their stakes, and the Garage,
   Power and Water rooms' props. Each one ports its sprite in js/yardart.js (the same parts, colours and comic look) to a
   model you can walk round, in PROP UNITS (1 = the sprite's height at scale 1; x right, y front, z up, foot on z 0).

   Handedness. A model's +x is its own right hand, so as you face its front +x is on YOUR left: what the sprite draws on
   its right (the red can's olive neighbour, the stake's flag, the hoist's manifold, the tanks' ladders) is at -x.
   Signs and plaques face the plot's front (faces: "front"); the rest turn with the plot, their front toward its front.

   Sizes. The first-person view squashes models sideways as it does the walls (a tile of floor is STRETCH = 1.4 times
   narrower on screen than a wall is tall); the sprites were unsquashed billboards. So where the tile has room a round
   model is WIDE times its sprite's width (about as wide on screen as the sprite was, from every side), and every plan
   stays inside the tile (or the foot) its prop blocks at the scale the yard gives it (noted at each model). A sign or
   plaque cannot widen: its board spans its one tile, and its text is fitted to the board (Oswald's measured widths), so
   a bigger text setting (the yard's SIGN_SCALE) grows the board and its words together.

   Text goes on a letter at a time with a short frame step (see text and label): Model3D maps a text through the face at
   its anchor, which in prop units bends a long word seen near and slantwise.

   Damage (opts.dmg, js/yardwreck.js), as the sprites' crackOverlay: every colour is grimed (16% toward dark brown when
   cracked, 40% wrecked: it shows at every detail level), with crack lines (detail 1), a claw gouge (detail 0) and, wrecked,
   splintered holes on faces seen from every side. A wrecked plaque wears the red and white WRECKED tape round its board;
   a wrecked floodlight's lamps go dark.

   Lean (YARD_OPS): round parts have the fewest sides whose edges stay uninked (13 to 16 upright; a sloped cone or tarp
   fewer: Model3D inks only creases sharper than CREASE_DEG), hoops, rungs, bolts, labels and letters are decals, small
   fittings are detail 1 or 0 parts. The tire stack and the cable spool, too many round faces for the far details, keep
   a plain core inside them (drawn first by its bias, so the detailed parts always cover it) that stands alone from
   detail 1. The two water tanks, the yard's biggest builds, say what they need in their own ops. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const YM = ZSR.YardModels;
  if (!YM) return;

  const TAU = Math.PI * 2;
  const INK = "#0f1012";
  const WIDE = 1.35; // a round model's width over its sprite's (the view's squash is 1.4: this keeps it near the sprite)
  const CREAM = "#f1e8d0";
  const POST = "#6b5034";
  const STEEL_DK = "#2f3136";
  const GUN = "#4b5057";
  const GREY = "#9ea3aa";
  const RED = "#b3261e";
  const GOLD = "#d9a21b";

  /* ---------- Colours ---------- */
  const rgbOf = (c) => {
    const n = parseInt(c.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  };
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const hex = (r, g, b) => "#" + ((1 << 24) | (ch(r) << 16) | (ch(g) << 8) | ch(b)).toString(16).slice(1);
  /** A "#rrggbb" colour lighter (amt > 0) or darker, as Draw3.shade. */
  function shade(c, amt) {
    const [r, g, b] = rgbOf(c);
    return hex(r + amt, g + amt, b + amt);
  }
  function mix(a, b, t) {
    const x = rgbOf(a);
    const y = rgbOf(b);
    return hex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
  }
  // crackOverlay's grime: rgba(24,18,12) at 0.16 over a cracked build, 0.4 over a wrecked one
  const GRIME = "#18120c";
  /** The colour filter for a build's damage: fills go through it (decals of fixed paint, the tape, lamps do not). */
  const grimeOf = (dmg) => (dmg >= 2 ? (c) => mix(c, GRIME, 0.4) : dmg ? (c) => mix(c, GRIME, 0.16) : (c) => c);
  /** Seeded random (Draw3.rng), so a model's cracks are the same every build. */
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }

  /* ---------- Text ---------- */
  // Oswald 700's advance widths (em) for what a sign can say (measured in Chromium); anything else counts as 0.6
  const EM = { A: 0.55, B: 0.59, C: 0.56, D: 0.59, E: 0.45, F: 0.43, G: 0.58, H: 0.61, I: 0.3, J: 0.35, K: 0.57, L: 0.44, M: 0.7, N: 0.56, O: 0.59, P: 0.57, Q: 0.59, R: 0.6, S: 0.51, T: 0.44, U: 0.59, V: 0.53, W: 0.7, X: 0.51, Y: 0.49, Z: 0.43, " ": 0.26, "-": 0.32, "'": 0.17, "&": 0.57, ".": 0.24, "!": 0.26 };
  const CAP = 0.81; // Oswald's capital height (em): a line of capitals is centred by its baseline, cap / 2 under the middle
  const FIT = 1.08; // room for Impact, the page's fallback (a little wider)
  const emOf = (c) => (EM[c] != null ? EM[c] : /[0-9]/.test(c) ? 0.53 : 0.6);
  const emWidth = (s) => {
    let w = 0;
    for (const c of String(s)) w += emOf(c);
    return w;
  };
  /** The text size (units) that fits str in maxW x maxH (fitText's rule: as tall as fits, narrower when long). */
  const fitSize = (str, maxW, maxH) => Math.max(0.01, Math.min(maxH, maxW / Math.max(0.3, emWidth(str) * FIT)));
  // Model3D draws a text through the map from its anchor to the points one unit along the face's u and v: in the van's
  // road units a unit is a speck, in prop units it is the whole sign, and that long step bends a letter seen near and
  // slantwise. So each text's step is cut to TEXT_STEP units and its size scaled up to match (the same letters, mapped
  // by the face's slope right at the anchor)
  const TEXT_STEP = 1 / 64;
  function text(B, f, a, b, str, size, fill, o) {
    B.text(f, a, b, str, size, fill, o);
    const d = f.decals[f.decals.length - 1];
    d.u = d.u.map((x) => x * TEXT_STEP);
    d.v = d.v.map((x) => x * TEXT_STEP);
    d.size = size / TEXT_STEP;
  }
  /** A line of capitals centred on (a, b) of face f, at most maxW wide and maxH tall (a cap's height), a letter at a
      time: a whole word is mapped at one anchor, so one as wide as a sign's board, seen close and slantwise, would run
      past the board's far edge; each letter on its own anchor stays in its place. */
  function label(B, f, a, b, str, maxW, maxH, fill, o) {
    const s = String(str);
    const size = fitSize(s, maxW, maxH / CAP);
    const base = b - (size * CAP) / 2;
    const to = Object.assign({ align: "center", base: "alphabetic" }, o);
    let x = a - (emWidth(s) * size) / 2;
    for (const c of s) {
      const w = emOf(c) * size;
      if (c !== " ") text(B, f, x + w / 2, base, c, size, fill, to);
      x += w;
    }
    return size;
  }

  /* ---------- Shapes (every one a single convex part's faces; start the part first) ---------- */
  // a point (s, t) in the plane square to an axis, a along it, as a model point (Model3D's AX: right-handed)
  const AX = {
    x: (a, s, t) => [a, s, t],
    y: (a, s, t) => [-s, a, t],
    z: (a, s, t) => [s, t, a],
  };
  /** A solid of revolution about an axis ("x", "y", "z") through c ([s, t] in the plane square to it): rings [[r, a], ...]
      in order along the axis (r 0: a point; the outline must bulge outward, so the part is convex), n sides, side 0
      centred on angle ph (from +s toward +t). fill: a colour, or fn(band, side). o: { cap0, cap1: fills (null: left
      out), hide0, hide1: a cap another part covers, alpha, glow, turn: radians the whole turned about the upright z axis
      through the origin (counter-clockwise from above) }. Returns { bands: [[face, ...], ...], cap0, cap1 }: each side
      face's decal frame runs along its first ring, left to right seen from outside, v toward the next ring. */
  function lathe(B, axis, c, rings, n, fill, o) {
    o = o || {};
    const at = AX[axis];
    const tc = Math.cos(o.turn || 0);
    const ts = Math.sin(o.turn || 0);
    const ring = rings.map(([r, a]) => {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const t = (o.ph || 0) + ((i - 0.5) / n) * TAU;
        const p = at(a, c[0] + Math.cos(t) * r, c[1] + Math.sin(t) * r);
        pts.push([p[0] * tc - p[1] * ts, p[0] * ts + p[1] * tc, p[2]]);
      }
      return pts;
    });
    const fo = { alpha: o.alpha, glow: o.glow };
    const out = { bands: [] };
    const last = rings.length - 1;
    // the caps first: their rims are inked by them, one line each, when they show
    if (rings[last][0] > 0 && o.cap1 !== null) out.cap1 = B.face(ring[last], o.cap1 || (typeof fill === "function" ? fill(-1, 0) : fill), Object.assign({ hide: !!o.hide1 }, fo));
    if (rings[0][0] > 0 && o.cap0 !== null) out.cap0 = B.face(ring[0].slice().reverse(), o.cap0 || (typeof fill === "function" ? fill(-1, 0) : fill), Object.assign({ hide: !!o.hide0 }, fo));
    for (let k = 0; k < last; k++) {
      const band = [];
      const P = ring[k];
      const Q = ring[k + 1];
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const col = typeof fill === "function" ? fill(k, i) : fill;
        const pts = rings[k + 1][0] <= 0 ? [P[i], P[j], Q[i]] : rings[k][0] <= 0 ? [P[i], Q[j], Q[i]] : [P[i], P[j], Q[j], Q[i]];
        band.push(B.face(pts, col, fo));
      }
      out.bands.push(band);
    }
    return out;
  }
  /** A flat plate: its outer face's corners pts (counter-clockwise seen from outside) and thick, the step [dx, dy, dz]
      from the outer face to the inner one. o: { u, v, o: the outer face's decal frame; inner: its fill; hideInner }.
      Returns { out, inn, sides }. */
  function plate(B, pts, thick, fill, o) {
    o = o || {};
    const inner = pts.map((p) => [p[0] + thick[0], p[1] + thick[1], p[2] + thick[2]]);
    const res = { out: B.face(pts, fill, { u: o.u, v: o.v, o: o.o }), sides: [] };
    res.inn = B.face(inner.slice().reverse(), o.inner || fill, { hide: !!o.hideInner });
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      res.sides.push(B.face([pts[i], inner[i], inner[j], pts[j]], o.sides || fill));
    }
    return res;
  }
  /** A convex outline [[s, t], ...] (either winding) extruded along axis from a0 to a1 (Builder.prism, wound for it). */
  function slab(B, prof, axis, a0, a1, fill, o) {
    let area = 0;
    for (let i = 0; i < prof.length; i++) {
      const p = prof[i];
      const q = prof[(i + 1) % prof.length];
      area += p[0] * q[1] - q[0] * p[1];
    }
    return B.prism(area < 0 ? prof.slice().reverse() : prof, axis, a0, a1, fill, o);
  }
  /** The outline of a bar w wide from (s0, t0) to (s1, t1) in a plane (for slab). */
  function bar(s0, t0, s1, t1, w) {
    const l = Math.hypot(s1 - s0, t1 - t0) || 1;
    const ns = (-(t1 - t0) / l) * (w / 2);
    const nt = ((s1 - s0) / l) * (w / 2);
    return [[s0 - ns, t0 - nt], [s1 - ns, t1 - nt], [s1 + ns, t1 + nt], [s0 + ns, t0 + nt]];
  }
  /** Points (a, b) of a convex polygon cut to lo <= a <= hi. */
  function clipA(pts, lo, hi) {
    const cut = (P, keep, edge) => {
      const out = [];
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        const q = P[(i + 1) % P.length];
        const ip = keep(p[0]);
        if (ip) out.push(p);
        if (ip !== keep(q[0])) {
          const t = (edge - p[0]) / (q[0] - p[0]);
          out.push([edge, p[1] + (q[1] - p[1]) * t]);
        }
      }
      return out;
    };
    return cut(cut(pts, (a) => a >= lo, lo), (a) => a <= hi, hi);
  }
  /** A star's 10 corners round (a, b): points out R, in r, the first one up (the plaque's level stars). */
  function star(a, b, R, r) {
    const pts = [];
    for (let k = 0; k < 10; k++) {
      const t = Math.PI / 2 + (k * Math.PI) / 5;
      const rr = k % 2 ? r : R;
      pts.push([a + Math.cos(t) * rr, b + Math.sin(t) * rr]);
    }
    return pts;
  }

  /* ---------- Surfaces to paint on: a flat face, or a lathe band unrolled ---------- */
  /** A flat face as a surface: poly(pts, fill, o) and line(pts, colour, w, o) in its own frame. */
  const flat = (B, f) => ({ poly: (pts, fill, o) => B.poly(f, pts, fill, o), line: (pts, c, w, o) => B.line(f, pts, c, w, o) });
  /** A band of a round part's side faces (all fw wide: an upright cylinder's) as one surface: a runs round it from side
      0's left edge (any a: it wraps), b up from the band's foot. A shape is cut at each fold and each piece laid on its
      side face (a decal past its face's edges would hang off the curve, and a later face would paint over it). */
  function unrolled(B, band, fw) {
    const n = band.length;
    const side = (k) => band[((k % n) + n) % n];
    return {
      poly(pts, fill, o) {
        let lo = Infinity;
        let hi = -Infinity;
        pts.forEach(([a]) => {
          lo = Math.min(lo, a);
          hi = Math.max(hi, a);
        });
        for (let k = Math.floor(lo / fw); k * fw < hi; k++) {
          const piece = clipA(pts, k * fw, (k + 1) * fw);
          if (piece.length >= 3) B.poly(side(k), piece.map(([a, b]) => [a - k * fw, b]), fill, o);
        }
      },
      line(pts, c, w, o) {
        // each run of the line over one side face is one stroke on it
        let k = Math.floor(pts[0][0] / fw);
        let run = [pts[0]];
        const flush = () => {
          if (run.length >= 2) B.line(side(k), run.map(([a, b]) => [a - k * fw, b]), c, w, o);
        };
        for (let i = 1; i < pts.length; i++) {
          const [a0, b0] = pts[i - 1];
          const [a1, b1] = pts[i];
          const k1 = Math.floor(a1 / fw);
          // cross every fold between the two points
          while (k !== k1) {
            const up = k1 > k;
            const edge = (up ? k + 1 : k) * fw;
            const p = [edge, b0 + ((b1 - b0) * (edge - a0)) / (a1 - a0)];
            run.push(p);
            flush();
            k += up ? 1 : -1;
            run = [p];
          }
          run.push(pts[i]);
        }
        flush();
      },
    };
  }

  /* ---------- A build's damage (the sprites' crackOverlay, in 3D) ----------
     spots: [[surface, a0, b0, a1, b1], ...]: a box on each surface (flat or unrolled), listed so that they face every way.
     dmg 1: a crack on each spot, a claw gouge on the first; dmg 2: two cracks on each, gouges and splintered holes on the
     first two. Cracks and holes are detail 1, gouges detail 0. k: a crack's ink widths. */
  function wear(B, spots, dmg, seed, k) {
    if (!dmg) return;
    const r = rng(seed);
    const w = k || 1;
    spots.forEach(([s, a0, b0, a1, b1], si) => {
      const W = a1 - a0;
      const H = b1 - b0;
      const cracks = dmg >= 2 ? 2 : 1;
      for (let c = 0; c < cracks; c++) {
        let a = a0 + W * (0.15 + r() * 0.7);
        let b = b1 - H * r() * 0.3;
        const pts = [[a, b]];
        for (let j = 0; j < 4; j++) {
          a = Math.max(a0 + W * 0.04, Math.min(a1 - W * 0.04, a + (r() - 0.5) * W * 0.3));
          b = Math.max(b0 + H * 0.03, b - H * (0.11 + r() * 0.12));
          pts.push([a, b]);
        }
        s.line(pts, INK, 1.1 * w);
      }
      if (si < (dmg >= 2 ? 2 : 1)) {
        // a claw gouge: three slashes, a pale edge on each
        const g = Math.min(W, H);
        const ga = a0 + W * (0.15 + r() * 0.45);
        const gb = b0 + H * (0.45 + r() * 0.3);
        const len = g * 0.26;
        for (let j = 0; j < 3; j++) {
          const x = ga + j * g * 0.08;
          s.line([[x, gb], [x + len * 0.45, gb - len]], INK, 1.15 * w, { lod: 0 });
          s.line([[x + g * 0.018, gb], [x + g * 0.018 + len * 0.45, gb - len]], "rgba(255,255,255,0.4)", 0.45 * w, { lod: 0 });
        }
        if (dmg >= 2) {
          // a splintered hole (its ink is its own near-black: no outline, so a hole cut at a fold shows no seam)
          const cx = a0 + W * (0.25 + r() * 0.5);
          const cy = b0 + H * (0.25 + r() * 0.45);
          const q = g * (0.1 + r() * 0.05);
          s.poly([[cx - q, cy + q * 0.4], [cx - q * 0.2, cy + q], [cx + q * 0.7, cy + q * 0.6], [cx + q, cy - q * 0.3], [cx + q * 0.1, cy - q], [cx - q * 0.8, cy - q * 0.6]], "#1c1814");
        }
      }
    });
  }
  /** Wear spots on flat faces: [[face, a0, b0, a1, b1], ...] -> spots. */
  const flatSpots = (B, list) => list.map(([f, a0, b0, a1, b1]) => [flat(B, f), a0, b0, a1, b1]);
  /** k wear spots evenly round a band (of n sides fw wide, fh long), each `span` sides wide, the first round side at0
      (default 0: the front of an upright one). */
  function bandSpots(B, band, fw, fh, k, span, at0) {
    const s = unrolled(B, band, fw);
    const n = band.length;
    return Array.from({ length: k }, (_, i) => {
      const c = (at0 || 0) + Math.round((i * n) / k);
      return [s, (c + 0.5 - span / 2) * fw, fh * 0.03, (c + 0.5 + span / 2) * fw, fh * 0.97];
    });
  }
  /** k of a round part's side faces evenly round it (side 0 first: the one facing ph). */
  const around = (band, k) => Array.from({ length: k }, (_, i) => band[Math.round((i * band.length) / k) % band.length]);
  /** Where model point (x, y, z) on face f lies in its decal frame: [a, b]. */
  function onFrame(f, x, y, z) {
    const dx = x - f.o[0];
    const dy = y - f.o[1];
    const dz = z - f.o[2];
    return [dx * f.u[0] + dy * f.u[1] + dz * f.u[2], dx * f.v[0] + dy * f.v[1] + dz * f.v[2]];
  }
  /** The middle of face f in its decal frame. */
  const middle = (f) => onFrame(f, f.cx, f.cy, f.cz);
  /** The width and height of a lathe side face (a quad: bottom edge, then up its left edge). */
  function sideSize(f) {
    const p = f.p;
    const w = Math.hypot(p[3] - p[0], p[4] - p[1], p[5] - p[2]);
    const h = Math.hypot(p[9] - p[0], p[10] - p[1], p[11] - p[2]);
    return [w, h];
  }

  // the names on the lot signs and plaques: each plot's room name in capitals (js/yard.js buildPlot)
  function roomNames() {
    const W = ZSR.WORLD;
    const names = [];
    if (W && W.YARD && W.YARD.plots && W.BASE_ROOMS) Object.keys(W.YARD.plots).forEach((r) => names.push(String((W.BASE_ROOMS[r] && W.BASE_ROOMS[r].name) || r).toUpperCase()));
    return names.length ? names : ["GARAGE"];
  }
  const LEVELS = 3; // SCALE: the plaque's stars (yardart's yPlaque draws 3; a room's levels: WORLD.BASE_ROOMS)

  /* ---------- The lot sign: a board on two posts with the room's name, big, on both faces ----------
     Placed at scale 1.2 (times SIGN_SCALE) on the middle of the lot's front row, solid on that tile: its plan stays inside
     +-0.42 units, so the board is the tile's width (the sprite's was two tiles of floor wide on screen) and a little less
     tall than the sprite's, to keep it a board; its top is the sprite's. Faces the plot's front (+y): the name reads
     from the yard and from the lot behind it. */
  const SIGN = { w: 0.8, z0: 0.56, z1: 0.955, t: 0.05, post: 0.07, postX: 0.27, strip: 0.062 };
  function signFace(B, f, o) {
    const W = SIGN.w;
    const H = SIGN.z1 - SIGN.z0;
    const S = SIGN.strip;
    B.poly(f, [[0, H - S], [W, H - S], [W, H], [0, H]], "#c9a27a", { lod: 2 });
    B.line(f, [[0, H - S], [W, H - S]], INK, 0.75);
    [0.055, W - 0.055].forEach((a) => B.disc(f, a, H - S / 2, 0.013, STEEL_DK, { n: 6, lod: 0 }));
    label(B, f, W / 2, (H - S) / 2, String(o.t || ""), W - 0.08, (H - S) * 0.66, INK);
  }
  YM.add("ySign", {
    faces: "front",
    key: (o) => String(o.t || ""),
    opts: roomNames().map((t) => ({ t })),
    build(B, o) {
      const g = grimeOf(o.dmg);
      const ht = SIGN.t / 2;
      [-1, 1].forEach((s) => {
        B.part({ name: "post" });
        B.box(s * SIGN.postX - SIGN.post / 2, -ht, 0, s * SIGN.postX + SIGN.post / 2, ht, SIGN.z0, g(POST), { skip: ["bottom", "top"] });
      });
      B.part({ name: "board", ink: 1.4 });
      // (its underside shows: the yard's eye is below it)
      const b = B.box(-SIGN.w / 2, -ht, SIGN.z0, SIGN.w / 2, ht, SIGN.z1, g(CREAM));
      signFace(B, b.front, o);
      signFace(B, b.back, o);
      const H = SIGN.z1 - SIGN.z0;
      wear(B, flatSpots(B, [[b.front, 0, 0, SIGN.w, H - SIGN.strip], [b.back, 0, 0, SIGN.w, H - SIGN.strip]]), o.dmg | 0, 31, 1);
    },
  });

  /* ---------- A built room's plaque: its name, big, and a star for each level built, on both faces of a board on one
     post ----------
     Placed at scale 0.8 (times SIGN_SCALE) on the plot's front-left tile (or where the build puts it), solid: its plan
     stays inside +-0.62 units. Cracked (dmg 1); wrecked (dmg 2): cracked, grimed, and the red and white WRECKED tape round
     the board, so it reads from across the yard on either side. Faces the plot's front. */
  const PLAQUE = { w: 1.16, z0: 0.46, z1: 0.96, t: 0.06, post: 0.1 };
  const TAPE = { len: 1.21, h: 0.172, tilt: 0.16, t: 0.007, at: 0.464 }; // its band: across the board, rising to its right
  function plaqueFace(B, f, o) {
    const W = PLAQUE.w;
    const H = PLAQUE.z1 - PLAQUE.z0;
    label(B, f, W / 2, H * 0.655, String(o.t || ""), W - 0.14, 0.24, INK);
    const n = Math.max(0, Math.min(LEVELS, o.n | 0));
    for (let i = 0; i < LEVELS; i++) B.poly(f, star(W / 2 + (i - (LEVELS - 1) / 2) * 0.19, H * 0.2, 0.068, 0.031), i < n ? GOLD : "#cfc6b0", { ink: 0.6 });
  }
  /** One side of the WRECKED tape (side 1 its front, -1 its back): a thin plate on the board's face, red with cream
      stripes as the sprite's tape (its stripes are red on cream: the same, and a red band when far), WRECKED across it. */
  function tape(B, side) {
    const c = Math.cos(TAPE.tilt);
    const s = Math.sin(TAPE.tilt);
    // the band's long way, to the right as seen from this side, and its short way, up
    const u = side > 0 ? [-c, 0, s] : [c, 0, -s];
    const v = [s, 0, c];
    const y = side * (PLAQUE.t / 2 + TAPE.t);
    const zc = PLAQUE.z0 + (PLAQUE.z1 - PLAQUE.z0) * TAPE.at;
    const L = TAPE.len;
    const Hb = TAPE.h;
    const org = [-(L / 2) * u[0] - (Hb / 2) * v[0], y, zc - (L / 2) * u[2] - (Hb / 2) * v[2]];
    const P = (a, b) => [org[0] + a * u[0] + b * v[0], y, org[2] + a * u[2] + b * v[2]];
    B.part({ name: "tape", ink: 0.7, lod: 2 });
    const f = plate(B, [P(0, 0), P(L, 0), P(L, Hb), P(0, Hb)], [0, -side * TAPE.t, 0], "#c0302a", { u, v, o: org, inner: CREAM, hideInner: true, sides: CREAM }).out;
    // the sprite's stripes, 22 px apart on a 30 px band, leaning right as they rise (detail 0: a red band from further)
    const k = Hb / 30;
    for (let x = -14; x * k < L + 22 * k; x += 22) {
      const pts = clipA([[(x - 4) * k, 0], [(x + 7) * k, 0], [(x + 22) * k, Hb], [(x + 11) * k, Hb]], 0, L);
      if (pts.length >= 3) B.poly(f, pts, CREAM, { lod: 0 });
    }
    const bw = 104 * k;
    const bh = 22 * k;
    B.poly(f, [[L / 2 - bw / 2, Hb / 2 - bh / 2], [L / 2 + bw / 2, Hb / 2 - bh / 2], [L / 2 + bw / 2, Hb / 2 + bh / 2], [L / 2 - bw / 2, Hb / 2 + bh / 2]], CREAM, { ink: 0.55 });
    label(B, f, L / 2, Hb / 2, "WRECKED", bw - 8 * k, 16 * k, "#b3261e");
  }
  YM.add("yPlaque", {
    faces: "front",
    key: (o) => String(o.t || "") + "|" + Math.max(0, Math.min(LEVELS, o.n | 0)),
    // every plaque the yard puts up: each plot's name at each level
    opts: [].concat(...roomNames().map((t) => Array.from({ length: LEVELS }, (_, i) => ({ t, n: i + 1 })))),
    build(B, o) {
      const g = grimeOf(o.dmg);
      const ht = PLAQUE.t / 2;
      B.part({ name: "post" });
      B.box(-PLAQUE.post / 2, -ht, 0, PLAQUE.post / 2, ht, PLAQUE.z0, g(POST), { skip: ["bottom", "top"] });
      B.part({ name: "board", ink: 1.25 });
      const b = B.box(-PLAQUE.w / 2, -ht, PLAQUE.z0, PLAQUE.w / 2, ht, PLAQUE.z1, g(CREAM));
      plaqueFace(B, b.front, o);
      plaqueFace(B, b.back, o);
      const H = PLAQUE.z1 - PLAQUE.z0;
      wear(B, flatSpots(B, [[b.front, 0, 0, PLAQUE.w, H], [b.back, 0, 0, PLAQUE.w, H]]), o.dmg | 0, 47, 1);
      if ((o.dmg | 0) >= 2) {
        tape(B, 1);
        tape(B, -1);
      }
    },
  });

  /* ---------- A lot's corner stake with its orange flag ----------
     Scale 0.3, not solid, 0.14 tiles in from the lot's corner: thin. The flag sticks out to the right as you face it
     from the yard (its -x), as the sprite's does. */
  YM.add("yStake", {
    key: () => "",
    opts: [{}],
    build(B, o) {
      const g = grimeOf(o.dmg);
      const r = 0.06;
      B.part({ name: "stake" });
      B.box(-r, -r, 0, r, r, 0.86, g("#9a7650"), { skip: ["bottom"] });
      B.part({ name: "flag", ink: 0.7 });
      // to the right as you face it, as the sprite's (its -x; s runs along -x on the "y" axis)
      slab(B, [[r, 0.835], [r + 0.2, 0.775], [r, 0.705]], "y", -0.01, 0.01, g("#ff7a1a"));
    },
  });

  /* ---------- A stack of three tires ----------
     Scale 0.62 to 0.66, solid on its tile: inside +-0.75 units. Each tire bulges (a crease round its tread, a pinch
     where two meet). Three bulged tires are too many faces for the far details, so a
     plain core stands inside them (drawn first: as if farther, by its bias, so the tires always cover it): from detail
     1 the core alone is the stack, a little slimmer, its tread lines and the top's hole painted on. */
  // a tire's radius, height, its rim's radius over its tread's, and sides (its bands slope enough that 12 sides meet
  // uninked); the stack's top stays a little under the yard's eye at its scale, so its hole shows
  const TIRE = { r: (40 / 112) * WIDE * 0.95, h: 0.235, pinch: 0.8, n: 12 };
  YM.add("yTires", {
    key: () => "",
    opts: [{}],
    build(B, o) {
      const g = grimeOf(o.dmg);
      const { r: R, h, pinch, n } = TIRE;
      const rubber = g("#1f2023");
      const hole = (f, lod) => {
        const [a, b] = middle(f);
        B.disc(f, a, b, R * 0.46, "#3a3d42", { ink: 0.6, lod, n: 10 });
        if (!lod) B.disc(f, a, b, R * 0.3, "#141518", { lod: 0, n: 8 });
      };
      // a wrecker's claw marks: pale slashes (ink cracks would not show on black rubber), on facets round it
      const claws = (band) => {
        const dmg = o.dmg | 0;
        if (!dmg) return;
        const [w, hh] = sideSize(band[0]);
        around(band, dmg >= 2 ? 4 : 2).forEach((f) => {
          for (let j = 0; j < 3; j++) {
            const a = w * (0.15 + j * 0.25);
            B.line(f, [[a, hh * 0.85], [a + w * 0.18, hh * 0.2]], "rgba(255,255,255,0.4)", 0.6, { lod: 0 });
          }
        });
      };
      // the core: inside every tire's pinch (the same sides, a hair in), its top just under the top tire's, the lines
      // between the tires painted on; no ink (its 12 sides would be inked, and an outline on near-black rubber shows
      // nothing). Cracks are the tires' own (detail 0): from detail 1 the grime shows the damage
      B.part({ name: "core", bias: -10, ink: 0 });
      const core = lathe(B, "z", [0, 0], [[R * pinch * 0.994, 0], [R * pinch * 0.994, 3 * h - 0.01]], n, rubber, { ph: Math.PI / 2, cap0: null });
      const [cw] = sideSize(core.bands[0][0]);
      core.bands[0].forEach((f) => [h, 2 * h].forEach((z) => B.line(f, [[0, z], [cw, z]], INK, 1.2)));
      hole(core.cap1, 1);
      // the tires (detail 0)
      for (let i = 0; i < 3; i++) {
        B.part({ name: "tire" + i, lod: 0 });
        const z0 = i * h;
        const t = lathe(B, "z", [0, 0], [[R * pinch, z0], [R, z0 + h * 0.45], [R * pinch, z0 + h]], n, rubber, { ph: Math.PI / 2, cap0: i ? undefined : null, hide0: true, hide1: i < 2 });
        if (i === 2) hole(t.cap1, 0);
        if (i === 1) claws(t.bands[1]);
      }
    },
  });

  /* ---------- Two jerry cans side by side, red and olive ----------
     Scale 0.34, not solid (stood near a tile's middle): inside +-1.1 units. Their broad sides face front and back, an X
     pressed in each; a handle and a spout cap on top. */
  YM.add("yJerry", {
    key: () => "",
    opts: [{}],
    build(B, o) {
      const g = grimeOf(o.dmg);
      const w = 0.5 * 1.2;
      const d = 0.3;
      const H = 0.72;
      // the red one on the left as you face them (the model's +x: its own right hand), as the sprite has it
      [[1, RED], [-1, "#5f6b3c"]].forEach(([s, c], i) => {
        const x0 = s < 0 ? -w - 0.02 : 0.02;
        const x1 = x0 + w;
        B.part({ name: "can" + i });
        const can = B.box(x0, -d / 2, 0, x1, d / 2, H, g(c), { skip: ["bottom"] });
        [can.front, can.back].forEach((f) => {
          B.line(f, [[w * 0.12, H * 0.82], [w * 0.88, H * 0.12]], "rgba(0,0,0,0.3)", 1.3);
          B.line(f, [[w * 0.12, H * 0.12], [w * 0.88, H * 0.82]], "rgba(0,0,0,0.3)", 1.3, { lod: 0 });
        });
        wear(B, flatSpots(B, [[can.front, 0, 0, w, H], [can.back, 0, 0, w, H]]), o.dmg | 0, 71 + i * 9, 0.8);
        // the handle (three bars as one) on its left as you face it, the spout's cap on its right
        B.part({ name: "handle" + i, lod: 1, ink: 0.8 });
        B.box(x1 - w * 0.62, -d * 0.18, H, x1 - w * 0.17, d * 0.18, H + 0.13, g(c), { skip: ["bottom"] });
        B.part({ name: "cap" + i, lod: 1, ink: 0.8 });
        B.box(x1 - w * 0.88, -d * 0.2, H, x1 - w * 0.7, d * 0.2, H + 0.09, g(STEEL_DK), { skip: ["bottom"] });
      });
    },
  });

  /* ---------- An oil drum (opts.c its paint: every colour the yard uses) ----------
     Scale 0.58, solid: inside +-0.86 units. Two rolled hoops, a lighter lid with its bung, a hazard label front and
     back. */
  // the colours js/yard.js BUILDS paints its drums (garage, power): the sets the tests draw; any "#rrggbb" works
  const DRUM_COLOURS = ["#b3261e", "#d9a21b", "#3a4a6a"];
  YM.add("yDrum", {
    key: (o) => String(o.c || RED),
    opts: DRUM_COLOURS.map((c) => ({ c })),
    build(B, o) {
      const g = grimeOf(o.dmg);
      const c = /^#[0-9a-f]{6}$/i.test(o.c || "") ? o.c : RED;
      const r = (28 / 96) * WIDE;
      const H = 82 / 96;
      const n = 14;
      B.part({ name: "drum" });
      const d = lathe(B, "z", [0, 0], [[r, 0], [r, H]], n, g(c), { ph: Math.PI / 2, cap0: null, cap1: g(shade(c, 20)) });
      const side = d.bands[0];
      const [fw] = sideSize(side[0]);
      side.forEach((f) => [0.354, 0.625].forEach((z) => B.line(f, [[0, z], [fw, z]], INK, 1)));
      // the lid: its rim pressed in, the bung
      const [la, lb] = middle(d.cap1);
      B.disc(d.cap1, la, lb, r * 0.84, "rgba(0,0,0,0.18)", { lod: 0, n: 14 });
      const [ba, bb] = onFrame(d.cap1, -r * 0.45, r * 0.1, H); // to the right as you face it, toward the back
      B.disc(d.cap1, ba, bb, r * 0.13, STEEL_DK, { ink: 0.5, n: 8 });
      // the hazard label front and back, as wide as the sprite's (wrapped round three sides, cut at each fold; its ink
      // along its edges only), the sign on its middle
      const LW = Math.min(2 * r * 0.43, fw * 2.6);
      const z0 = 0.42;
      const z1 = 0.56;
      [0, n / 2].forEach((mid) => {
        for (let k = -1; k <= 1; k++) {
          const f = side[(mid + k + n) % n];
          const lo = Math.max(-LW / 2, k * fw - fw / 2);
          const hi = Math.min(LW / 2, k * fw + fw / 2);
          if (hi <= lo) continue;
          const a0 = lo - (k * fw - fw / 2);
          const a1 = hi - (k * fw - fw / 2);
          B.poly(f, [[a0, z0], [a1, z0], [a1, z1], [a0, z1]], CREAM);
          const edge = k < 0 ? [[a1, z0], [a0, z0], [a0, z1], [a1, z1]] : k > 0 ? [[a0, z0], [a1, z0], [a1, z1], [a0, z1]] : null;
          if (edge) B.line(f, edge, INK, 0.5, { lod: 0 });
          else {
            B.line(f, [[a0, z0], [a1, z0]], INK, 0.5, { lod: 0 });
            B.line(f, [[a0, z1], [a1, z1]], INK, 0.5, { lod: 0 });
            B.poly(f, [[fw / 2, 0.545], [fw / 2 + 0.035, 0.44], [fw / 2 - 0.035, 0.44]], GOLD, { ink: 0.35, lod: 0 });
          }
        }
      });
      const [w, h] = sideSize(side[0]);
      wear(B, bandSpots(B, side, w, h, 4, 3), o.dmg | 0, 83, 0.8);
    },
  });

  /* ---------- A blue rain barrel under a tarp funnel ----------
     Scale 0.7 (0.62 on the pipes), solid: inside +-0.71 units. The funnel's mouth is dark (seen from above); a tap low
     on its front. */
  YM.add("yRainBarrel", {
    key: () => "",
    opts: [{}],
    build(B, o) {
      const g = grimeOf(o.dmg);
      const r = (34 / 136) * WIDE;
      const H = 84 / 136;
      const n = 13; // the fewest sides whose edges stay uninked
      B.part({ name: "barrel" });
      const bar0 = lathe(B, "z", [0, 0], [[r, 0], [r, H]], n, g("#2f6fb0"), { ph: Math.PI / 2, cap0: null, cap1: g("#295f96") });
      const side = bar0.bands[0];
      const [fw, fh] = sideSize(side[0]);
      side.forEach((f) => [0.235, 0.441].forEach((z) => B.line(f, [[0, z], [fw, z]], INK, 1)));
      // the tarp funnel: a square of tarp tied at its corners, sagging down to the barrel's lid (from the front, the
      // sprite's trapezoid), the water dark in its mouth
      B.part({ name: "funnel" });
      const top = 118 / 136;
      const fr = ((46 / 136) * WIDE) / Math.SQRT2 / 0.84; // its square's half-width: about the sprite's mouth
      const fun = lathe(B, "z", [0, 0], [[(12 / 136) * WIDE * Math.SQRT2, H], [fr * Math.SQRT2, top]], 4, g("#d9c9a0"), { ph: Math.PI / 2, cap0: null, cap1: "#3a4a5a" });
      const [ma, mb] = middle(fun.cap1);
      B.poly(fun.cap1, [[ma - fr * 0.8, mb - fr * 0.8], [ma + fr * 0.8, mb - fr * 0.8], [ma + fr * 0.8, mb + fr * 0.8], [ma - fr * 0.8, mb + fr * 0.8]], "#2c3a48", { lod: 0 });
      // the tap
      B.part({ name: "tap", lod: 1, ink: 0.7 });
      const ty = r * Math.cos(Math.PI / n);
      B.box(-0.05, ty, 0.165, 0.05, ty + 0.06, 0.215, g(GREY), { skip: ["back"] });
      wear(B, bandSpots(B, side, fw, fh, 4, 3), o.dmg | 0, 97, 0.8);
    },
  });

  /* ---------- A wide water tank on a braced stand, with a ladder up its front-right ----------
     Scale 2.0 on a 3 x 3 foot: inside +-0.7 units. Four legs with X braces on each side (detail 1), a deck, the tank and
     its cone roof; the ladder's rails run from the ground to the roof, its rungs painted on the tank above the deck and
     small bars below it (detail 0). */
  YM.add("yTankStand", {
    key: () => "",
    opts: [{}],
    // its own ceilings: the yard's biggest build after the tall tank (two tiles tall, alone on a 3 x 3 plot where it
    // stands in for three rain barrels), and only at detail 2 from 40 tiles off
    ops: [900, 700, 280],
    build(B, o) {
      const g = grimeOf(o.dmg);
      const L = 0.34; // the legs' middles, each way from the middle
      const lw = 0.026; // half a leg
      const deck = [0.52, 0.56];
      const D = L + lw + 0.02; // half the deck
      const R = (72 / 208) * WIDE * 0.98;
      const tank = [deck[1], 0.856];
      const n = 16;
      for (const [x, y] of [[-L, -L], [L, -L], [L, L], [-L, L]]) {
        B.part({ name: "leg" });
        B.box(x - lw, y - lw, 0, x + lw, y + lw, deck[0], g(POST), { skip: ["bottom", "top"] });
      }
      // the X braces: two bars a side, one just outside the other (so they never cut each other), detail 1
      const BT = 0.012;
      [["y", 1], ["y", -1], ["x", 1], ["x", -1]].forEach(([axis, out]) => {
        [[L, -L], [-L, L]].forEach(([s0, s1], k) => {
          B.part({ name: "brace", lod: 1, ink: 0.7 });
          const d0 = L + lw + k * BT;
          slab(B, bar(s0, 0.47, s1, 0.08, 0.026), axis, out > 0 ? d0 : -d0 - BT, out > 0 ? d0 + BT : -d0, g("#8a6a46"));
        });
      });
      B.part({ name: "deck" });
      B.box(-D, -D, deck[0], D, D, deck[1], g("#7d5f40"));
      B.part({ name: "tank", ink: 1.2 });
      const t = lathe(B, "z", [0, 0], [[R, tank[0]], [R, tank[1]]], n, g("#5f8aa0"), { ph: Math.PI / 2, cap0: g("#4f7a90"), hide1: true });
      const side = t.bands[0];
      const [fw, fh] = sideSize(side[0]);
      // two hoops (the sprite's at 50 and 72 px)
      side.forEach((f) => [72, 50].forEach((y) => B.line(f, [[0, (208 - y) / 208 - tank[0]], [fw, (208 - y) / 208 - tank[0]]], INK, 0.9, { lod: 0 })));
      // the roof: a low cone, 8 sides (they meet flatter than a crease), its eave round the tank's rim
      B.part({ name: "roof" });
      lathe(B, "z", [0, 0], [[(R * 1.02) / Math.cos(Math.PI / 8), tank[1]], [0, 0.952]], 8, g("#4f7a90"), { ph: Math.PI / 2 });
      // the ladder, on the facet to the front's right as you face it (the model's -x side: side 1)
      const lf = side[1];
      const nx = Math.cos(Math.PI / 2 + TAU / n);
      const ny = Math.sin(Math.PI / 2 + TAU / n);
      const dist = R * Math.cos(Math.PI / n) + 0.004;
      // a point off that facet: o0 along it, d out from it
      const off = (o0, d) => [nx * (dist + d) + ny * o0, ny * (dist + d) - nx * o0];
      [-0.04, 0.04].forEach((c) => {
        B.part({ name: "rail", lod: 1, ink: 0.7 });
        slab(B, [off(c - 0.011, 0), off(c + 0.011, 0), off(c + 0.011, 0.024), off(c - 0.011, 0.024)], "z", 0, tank[1], g("#3a3d42"));
      });
      const [ra] = onFrame(lf, ...off(0, 0), tank[0]);
      for (let z = 0.6; z < tank[1] - 0.02; z += 0.06) B.line(lf, [[ra - 0.029, z - tank[0]], [ra + 0.029, z - tank[0]]], "#3a3d42", 1.4, { lod: 0 });
      for (let z = 0.08; z < deck[0] - 0.03; z += 0.11) {
        B.part({ name: "rung", lod: 0, ink: 0 });
        slab(B, [off(-0.029, 0.006), off(0.029, 0.006), off(0.029, 0.016), off(-0.029, 0.016)], "z", z, z + 0.014, "#3a3d42");
      }
      wear(B, bandSpots(B, side, fw, fh, 4, 3), o.dmg | 0, 113, 1);
    },
  });

  /* ---------- The tall water tank: a cone roof, a ladder and WATER painted on it ----------
     Scale 2.8 on a 3 x 3 foot (stood 0.2 tiles toward the back of it): inside +-0.46 units. It stands on two skids. WATER
     is stencilled a letter a facet across its front and its back, cream with an ink shadow; the ladder runs up its right
     side, its rungs painted on the facet behind the rails. */
  YM.add("yTankTall", {
    key: () => "",
    opts: [{}],
    // its own ceilings: the yard's tallest build (2.7 tiles, alone on a 3 x 3 plot), only at detail 2 from 60 tiles off
    ops: [700, 420, 230],
    build(B, o) {
      const g = grimeOf(o.dmg);
      const R = (58 / 256) * WIDE;
      const n = 16;
      const z0 = 44 / 256;
      // the tank's top a little under the sprite's, so its roof is as steep as the sprite's (27 degrees) and shows over
      // the rim from across the yard, under the same peak
      const z1 = 205 / 256;
      const top = 0.955;
      for (const s of [-1, 1]) {
        B.part({ name: "skid" });
        B.box(s * 0.19 - 0.025, -R * 0.7, 0, s * 0.19 + 0.025, R * 0.7, z0, g(GUN), { skip: ["bottom"] });
      }
      B.part({ name: "tank", ink: 1.2 });
      const t = lathe(B, "z", [0, 0], [[R, z0], [R, z1]], n, g("#5f8aa0"), { ph: Math.PI / 2, cap0: g("#4f7a90"), hide1: true });
      const side = t.bands[0];
      const [fw, fh] = sideSize(side[0]);
      side.forEach((f) => [70, 104, 138, 172].forEach((y) => B.line(f, [[0, (256 - y) / 256 - z0], [fw, (256 - y) / 256 - z0]], INK, 0.9, { lod: 0 })));
      // WATER, a letter a facet; the facets to the right of one's middle (seen from outside) come after it
      const word = "WATER";
      const size = Math.min(0.105, (fw * 0.86) / 0.7);
      const zb = 0.453 - z0 - (size * CAP) / 2;
      [0, n / 2].forEach((c0) => {
        for (let i = 0; i < word.length; i++) {
          const f = side[(c0 - (word.length >> 1) + i + n) % n];
          text(B, f, fw / 2 + size * 0.06, zb - size * 0.06, word[i], size, INK, { lod: 0, align: "center", base: "alphabetic" });
          text(B, f, fw / 2, zb, word[i], size, CREAM, { align: "center", base: "alphabetic" });
        }
      });
      // the roof: 8 sides (as steep as it is, they meet flatter than a crease), its eave round the tank's rim
      B.part({ name: "roof" });
      lathe(B, "z", [0, 0], [[(62 / 256) * WIDE / Math.cos(Math.PI / 8), z1], [0.05, top]], 8, g("#4f7a90"), { ph: Math.PI / 2 });
      B.part({ name: "vent", lod: 1, ink: 0.8 });
      B.box(-0.02, -0.02, top, 0.02, 0.02, 0.992, g(GREY), { skip: ["bottom"] });
      // the ladder on its right side as you face it (the model's -x facet)
      const lf = side[n / 4];
      const dist = R * Math.cos(Math.PI / n);
      [-0.03, 0.03].forEach((c) => {
        B.part({ name: "rail", lod: 1, ink: 0.7 });
        B.box(-dist - 0.016, c - 0.008, 0, -dist, c + 0.008, z1, g("#3a3d42"), { skip: ["bottom"] });
      });
      const [ra] = onFrame(lf, -dist, 0, z0);
      for (let z = z0 + 0.03; z < z1 - 0.02; z += 0.047) B.line(lf, [[ra - 0.022, z - z0], [ra + 0.022, z - z0]], "#3a3d42", 1.3, { lod: 0 });
      // cracks on its front (over the letters, as the sprite's), sides and back
      wear(B, bandSpots(B, side, fw, fh, 4, 3), o.dmg | 0, 127, 1.2);
    },
  });

  /* ---------- A floodlight mast: a base, a pole, a crossbar with four lamps and their glow ----------
     Scale 2.9, solid on one tile: inside +-0.17 units. The lamps face front (+y); a wrecked build's are dark. */
  YM.add("yFlood", {
    key: () => "",
    opts: [{}],
    build(B, o) {
      const dmg = o.dmg | 0;
      const g = grimeOf(dmg);
      const k = 1 / 352; // the sprite's px
      B.part({ name: "base", lod: 1 });
      const base = B.box(-0.05, -0.05, 0, 0.05, 0.05, 22 * k, g(GUN), { skip: ["bottom"] });
      B.part({ name: "pole" });
      const cb = [(352 - 42) * k, (352 - 34) * k];
      const pole = B.box(-0.016, -0.016, 22 * k, 0.016, 0.016, cb[0], g("#8f969c"), { skip: ["bottom", "top"] });
      // the crossbar and the lamps on it as one part: the bar, the housings' top stepping up to the middle pair, four
      // lenses on the front, a seam between each two housings and along the bar's top
      B.part({ name: "lamps" });
      const zt = cb[1];
      const L = 0.165;
      const D = 0.022;
      const front = slab(B, [[-L, cb[0]], [L, cb[0]], [L, zt + 18 * k], [0.07, zt + 22 * k], [-0.07, zt + 22 * k], [-L, zt + 18 * k]], "y", -D, D, g(STEEL_DK)).cap1;
      const lens = dmg >= 2 ? "#4a4636" : "#fff1b8";
      const [ba] = onFrame(front, L, D, zt);
      const [bb, bt] = onFrame(front, -L, D, zt);
      B.line(front, [[ba, bt], [bb, bt]], INK, 0.8);
      [-0.122, -0.04, 0.04, 0.122].forEach((x, i) => {
        const tall = i === 1 || i === 2 ? 17 : 14;
        const [a0, b0] = onFrame(front, x + 0.03, D, zt + 4 * k);
        const [a1, b1] = onFrame(front, x - 0.03, D, zt + tall * k);
        B.poly(front, [[a0, b0], [a1, b0], [a1, b1], [a0, b1]], lens, { glow: dmg < 2 });
        if (i) {
          const [sa, sb] = onFrame(front, x - 0.041, D, zt);
          B.line(front, [[sa, sb], [sa, sb + (tall + 3) * k]], INK, 0.8, { lod: 0 });
        }
      });
      if (dmg < 2) {
        // the glow round the lamps (the sprite's halo): a pale unlit sheet just behind them, seen from the front only (the
        // light comes out of the lenses)
        B.part({ name: "glow", lod: 1, ink: 0 });
        const gz = zt + 12 * k;
        const P = [];
        for (let i = 0; i < 12; i++) {
          const t = (i / 12) * TAU;
          P.push([-Math.cos(t) * 0.17, -0.03, gz + Math.sin(t) * 0.075]);
        }
        B.face(P, "#fff0aa", { glow: true, alpha: 0.35 });
      }
      wear(B, flatSpots(B, [[pole.front, 0, 0.2, 0.032, 0.7], [pole.back, 0, 0.2, 0.032, 0.7], [base.front, 0, 0, 0.1, 22 * k], [base.back, 0, 0, 0.1, 22 * k]]), dmg, 131, 0.8);
    },
  });

  /* ---------- An engine hoist: an A-frame, a boom, an engine on its chain ----------
     Scale 1.35, solid: inside +-0.37 units. The A-frame stands at the back on two ground rails; the boom reaches forward
     and the engine hangs in front of it, so from the front it is the sprite's picture (the engine between the yellow
     legs). */
  YM.add("yHoist", {
    key: () => "",
    opts: [{}],
    build(B, o) {
      const g = grimeOf(o.dmg);
      const Y = g("#d9a21b");
      const ay = -0.2; // the A-frame's plane
      const t = 0.022; // half its legs' thickness, front to back
      const rail = 0.032;
      const beam = [0.875, 0.935];
      for (const s of [-1, 1]) {
        B.part({ name: "rail", lod: 0 });
        B.box(s * 0.33 - 0.022, ay - 0.05, 0, s * 0.33 + 0.022, 0.3, rail, Y, { skip: ["bottom"] });
      }
      // the legs: slanted bars from the rails up to the beam (s runs along -x on the "y" axis)
      for (const s of [-1, 1]) {
        B.part({ name: "leg", ink: 1.2 });
        slab(B, [[-s * 0.352, rail], [-s * 0.308, rail], [-s * 0.012, beam[0]], [-s * 0.056, beam[0]]], "y", ay - t, ay + t, Y);
      }
      B.part({ name: "beam", lod: 1 });
      B.box(-0.19, ay - 0.032, beam[0], 0.19, ay + 0.032, beam[1], Y);
      // the boom forward from the beam, the chain down from its tip
      B.part({ name: "boom", lod: 1 });
      B.box(-0.026, ay + 0.032, beam[0] + 0.004, 0.026, 0.21, beam[1] - 0.004, Y, { skip: ["back"] });
      B.part({ name: "chain", lod: 1, ink: 0.5 });
      B.box(-0.008, 0.142, 0.627, 0.008, 0.158, beam[0] + 0.004, GUN, { skip: ["top", "bottom"] });
      // the engine (a little wider than the sprite's: the view squashes it): its block, the valve cover with four bolts,
      // a manifold on its right as you face it
      const EW = 0.205;
      B.part({ name: "engine", ink: 1.1 });
      const eng = B.box(-EW, 0.06, 0.34, EW, 0.24, 0.568, g(GUN));
      B.part({ name: "cover", lod: 1 });
      const cover = B.box(-EW * 0.74, 0.085, 0.568, EW * 0.74, 0.215, 0.627, g("#3a3d42"));
      for (let i = 0; i < 4; i++) B.disc(cover.front, EW * 0.74 * 2 * (0.14 + i * 0.24), 0.03, 0.014, GREY, { n: 6, lod: 0, ink: 0.4 });
      B.part({ name: "manifold", lod: 0, ink: 0.8 });
      B.box(-EW - 0.032, 0.11, 0.39, -EW, 0.19, 0.49, g(STEEL_DK), { skip: ["right"] });
      wear(B, flatSpots(B, [[eng.front, 0, 0, 2 * EW, 0.228], [eng.back, 0, 0, 2 * EW, 0.228]]), o.dmg | 0, 139, 0.9);
    },
  });

  /* ---------- The generator's exhaust stack: a pipe, its rain cap, a puff of smoke ----------
     Scale 0.55, lifted 0.72 onto the generator's box, not solid. */
  YM.add("yExhaust", {
    key: () => "",
    opts: [{}],
    build(B, o) {
      const g = grimeOf(o.dmg);
      const r = (6 / 80) * WIDE;
      const top = 62 / 80;
      B.part({ name: "pipe" });
      const p = lathe(B, "z", [0, 0], [[r, 0], [r, top]], 13, g(GUN), { ph: Math.PI / 2, cap0: null, hide1: true });
      // the rain cap: a low cone (flat enough that 8 sides meet uninked)
      B.part({ name: "cap" });
      lathe(B, "z", [0, 0], [[(12 / 80) * WIDE, top], [0, 0.89]], 8, g(STEEL_DK), { ph: Math.PI / 2 });
      B.part({ name: "puff", lod: 1, ink: 0 });
      lathe(B, "z", [0, 0], [[0, 0.905], [0.07, 0.945], [0.06, 0.982], [0, 1.0]], 8, "#5a5a5f", { ph: Math.PI / 2, alpha: 0.45 });
      const [w, h] = sideSize(p.bands[0][0]);
      wear(B, bandSpots(B, p.bands[0], w, h, 2, 3), o.dmg | 0, 151, 0.6);
    },
  });

  /* ---------- A cable spool lying on its side: two wooden flanges, a drum of black cable ----------
     Scale 0.45 to 0.48, solid: inside +-1.04 units. It lies on its side, a flat of each flange on the ground, its axis
     turned 30 degrees from left-right so that from the front its right flange shows its face and hub, as the sprite's
     does. */
  YM.add("ySpool", {
    key: () => "",
    opts: [{}],
    build(B, o) {
      const g = grimeOf(o.dmg);
      const n = 13; // the fewest sides whose edges stay uninked
      const R = 34 / 80;
      const zc = R * Math.cos(Math.PI / n);
      const half = (26 / 80) * 1.2;
      const ft = 0.05;
      const r = 30 / 80;
      const lo = { ph: -Math.PI / 2, turn: -Math.PI / 6 }; // side 0 faces down (it stands on it); its -x end toward the front
      const wood = ["#a07a4a", "#9a7650"].map(g); // its -x end (the right as you face it), its +x end
      // the core (as the tire stack's): the drum's size end to end, inside the flanges and the drum, drawn first; from
      // detail 1 it is the spool, its ends the flanges' wood (bands at detail 1, the end caps always)
      B.part({ name: "core", bias: -10 });
      const rc = r * 0.995;
      const core = lathe(B, "x", [0, zc], [[rc, -half - ft * 0.9], [rc, half + ft * 0.9]], n, g("#1f2023"), Object.assign({ cap0: wood[0], cap1: wood[1] }, lo));
      const [cw, ch2] = sideSize(core.bands[0][0]);
      const end = (ft * 1.6) / ch2;
      core.bands[0].forEach((f) => {
        B.poly(f, [[0, 0], [cw, 0], [cw, ch2 * end], [0, ch2 * end]], wood[0]);
        B.poly(f, [[0, ch2 * (1 - end)], [cw, ch2 * (1 - end)], [cw, ch2], [0, ch2]], wood[1]);
      });
      // the spool itself (detail 0)
      const spots = [];
      [-1, 1].forEach((s, i) => {
        B.part({ name: "flange", lod: 0 });
        const a0 = s < 0 ? -half - ft : half;
        // (its inner face shows round the drum: the flange stands proud of the cable)
        const f = lathe(B, "x", [0, zc], [[R, a0], [R, a0 + ft]], n, wood[i], lo);
        const outer = s < 0 ? f.cap0 : f.cap1;
        const [a, b] = middle(outer);
        B.disc(outer, a, b, 0.06, "#5b4030", { ink: 0.6, n: 10 });
        spots.push([flat(B, outer), a - R * 0.6, b - R * 0.6, a + R * 0.6, b + R * 0.6]);
      });
      B.part({ name: "drum", lod: 0 });
      const d = lathe(B, "x", [0, zc], [[r, -half], [r, half]], n, g("#1f2023"), Object.assign({ cap0: null, cap1: null }, lo));
      const [w, h] = sideSize(d.bands[0][0]);
      // the cable's turns, as the sprite's lines (every other side: the facets' own light does the rest)
      d.bands[0].forEach((f, i) => i % 2 || B.line(f, [[w * 0.5, h * 0.03], [w * 0.5, h * 0.97]], "#3a3d42", 1, { lod: 0 }));
      // cracks on the flanges' faces and the cable's front and back (its sides 3 and 10 face them)
      wear(B, spots.concat(bandSpots(B, d.bands[0], w, h, 2, 3, 3)), o.dmg | 0, 163, 0.9);
    },
  });
})(typeof window !== "undefined" ? window : globalThis);
