/* Each place's own building on the angled road camera (js/perspective.js), and the side streets' ends standing up.
   A building is a handful of parts in its lot's own frame (X to the right as seen from the drive, V away from the
   drive's end into the lot, Z up; the lot's front wall line is where sprites.js lot puts it, v0 + LOT_FRONT): boxes
   with windows, doors and signs laid on their walls, gable and sloped roofs, posts and beams, round tanks and
   columns, glass houses, and the interiors' landmark pictures (js/landmarks1.js, js/landmarks2.js) standing about.
   ROWS has one row per place id: a new place gets its own building by adding a row (docs/SCALING.md, add a place);
   a place with no row gets Persp.building's plain box.
   Drawn in the road's comic ink (flat faces lit from the upper left, inked edges), the parts far to near as the
   camera sees them (a part is in front of another when the camera is on its side of a wall plane between them), and
   a walker, plant or prop near a building is drawn between the parts it stands between. Far off a building loses
   its small things, then its windows and signs, and goes into the haze by colour (not by see-through faces, so the
   parts never show through each other); a landmark (the Water Tower) goes into a silhouette instead and stays on
   the haze line out to LANDMARK_SEEN times the view's reach.
   The place's name is painted on its sign; while that is too small to read, or the place is not known yet, the
   flat name board stands in front of it, fading with the building and kept out of the HUD's top row.
   The ground under the angled camera (Persp.drawGround, and the card's squares) leaves out the flat pictures these
   replace (the gas canopy, River Landing's logs, posts and sign, the side streets' ends: sprites.js lot and
   cityRoads `standing`); GROUND_KEY is part of the card's squares' key so none is kept from before. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const FONT = "Oswald, Impact, sans-serif";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // SCALE: a landmark row (the Water Tower) shows past the haze as a silhouette on its far edge out to this many times
  // Persp.cfg.far (about 8600 units today: the tower is seen from much of the west side of town)
  const LANDMARK_SEEN = 2.4;
  // SCALE: px a building must be across before its windows, doors and signs are drawn (DETAIL_PX), and its small
  // things (pumps, railings, props, ladders: PROP_PX)
  const DETAIL_PX = 70;
  const PROP_PX = 170;
  // ... and the small things fade in over this many px more (R.fine), as the road's props do (Persp LOD_BAND): they
  // come in some 4 s before the van parks, mid-screen and clear of the haze, where a pop shows
  const FINE_PX = 50;
  // SCALE: units round a building's parts within which a walker, a plant or a prop is sorted against them part by part
  // (a bigger building or a wider walker crowd needs no change: it is measured from the parts)
  const NEAR = 420;
  // a name board goes once its building has faded under this much (it has gone into the haze)
  const NAME_FADE = 0.2;
  // SCALE: the camera sees nothing higher than itself (its view's top edge is level), about 340 units up on a small
  // window (Persp.setup: 0.447 x the window's height / zoom), 357 at 1280 x 800: the Water Tower's antenna tip stands
  // just under that, so all of the tower shows from far off, and its tank stands well over the trees (up to 240)
  const TOWER_TOP = 352;
  // the lot's front wall line, units from the lot's front edge (sprites.js lot: the building from above starts here)
  const LOT_FRONT = 168;
  // px a world unit of a painted sign's texture (it is never seen much bigger than about 1.6)
  const SIGN_RES = 2;
  // light from the upper left of the world (the road's shadows fall down and to the right)
  const LIGHT = [-0.6, -0.8];

  /* ---------- colours: shaded by how a face is lit, and mixed into the haze far off ---------- */
  const rgbOf = new Map();
  function rgb(hex) {
    let c = rgbOf.get(hex);
    if (!c) {
      if (hex[0] === "#") {
        const n = parseInt(hex.length === 4 ? hex.slice(1).replace(/./g, (x) => x + x) : hex.slice(1, 7), 16);
        c = [n >> 16, (n >> 8) & 255, n & 255, 1];
      } else {
        const m = /rgba?\(([^)]+)\)/.exec(hex);
        const p = m ? m[1].split(",").map(Number) : [0, 0, 0];
        c = [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
      }
      rgbOf.set(hex, c);
    }
    return c;
  }
  const colOf = new Map();
  /** hex shaded by amt, then mixed toward the pen's colour by its share (in 20 steps); keeps any alpha. */
  function col(R, hex, amt) {
    const m = R.mixQ;
    const key = hex + "|" + (amt | 0) + "|" + m + "|" + R.toKey;
    let s = colOf.get(key);
    if (!s) {
      const c = rgb(hex);
      const t = m / 20;
      const f = (i) => Math.round(clamp(c[i] + (amt | 0), 0, 255) * (1 - t) + R.to[i] * t);
      s = c[3] < 1 ? "rgba(" + f(0) + "," + f(1) + "," + f(2) + "," + c[3] + ")" : "rgb(" + f(0) + "," + f(1) + "," + f(2) + ")";
      if (colOf.size > 6000) colOf.clear();
      colOf.set(key, s);
    }
    return s;
  }

  /* ---------- what a building is made of (lot coordinates; decals on a wall by X along a front or back wall, V
     along a side one) ---------- */
  const win = (a0, a1, z0, z1, o) => Object.assign({ k: "win", a0, a1, z0, z1 }, o);
  const door = (a0, a1, z0, z1, fill, o) => Object.assign({ k: "door", a0, a1, z0, z1, fill }, o);
  const rect = (a0, a1, z0, z1, fill, o) => Object.assign({ k: "rect", a0, a1, z0, z1, fill }, o);
  const lines = (a0, a1, z0, z1, step, color, o) => Object.assign({ k: "lines", a0, a1, z0, z1, step, color }, o);
  const sign = (a0, a1, z0, z1, o) => Object.assign({ k: "sign", a0, a1, z0, z1 }, o);
  const img = (a0, a1, z0, z1, name, o) => Object.assign({ k: "img", a0, a1, z0, z1, name }, o);
  const roll = (a0, a1, z0, z1, fill, o) => Object.assign({ k: "roll", a0, a1, z0, z1, fill }, o);
  const shape = (pts, fill, o) => Object.assign({ k: "poly", pts, fill }, o);
  const disc = (a, z, r, fill, o) => Object.assign({ k: "disc", a, z, r, fill }, o);

  /** Collects one building's parts as a row lays them out. */
  class Builder {
    constructor() {
      this.parts = [];
    }
    add(p) {
      p.lod = p.lod || 0;
      p.after = p.after || null;
      this.parts.push(p);
      return p;
    }
    /** A box from (x0, v0, z0) to (x1, v1, z1): walls `wall`, a flat top `top` (false: none), decals per wall. */
    box(x0, x1, v0, v1, z0, z1, o) {
      o = o || {};
      return this.add({ t: "box", b: [x0, x1, v0, v1, z0, z1], wall: o.wall === undefined ? "#9a9282" : o.wall, top: o.top === undefined ? shadeHex(o.wall || "#9a9282", -40) : o.top, faces: o.faces || {}, dots: o.dots || null, deck: !!o.deck, lod: o.lod, after: o.after, solid: o.solid !== false, ink: o.ink == null ? 1 : o.ink });
    }
    /** A gable roof over walls from x0..x1, v0..v1 at height z0, its ridge at z1 along X (along: "x") or V, standing
        `over` past the walls; the two gable ends in `wall`, with decals (faces.left / right or front / back). */
    gable(x0, x1, v0, v1, z0, z1, o) {
      o = o || {};
      const over = o.over == null ? 12 : o.over;
      const alongX = o.along !== "v";
      const run = alongX ? (v1 - v0) / 2 : (x1 - x0) / 2;
      const drop = (over * (z1 - z0)) / run;
      const b = alongX ? [x0 - over, x1 + over, v0 - over, v1 + over, z0 - drop, z1] : [x0 - over, x1 + over, v0 - over, v1 + over, z0 - drop, z1];
      return this.add({ t: "gable", b, w: [x0, x1, v0, v1, z0, z1], over, drop, alongX, roof: o.roof || "#3a3f46", wall: o.wall || "#9a9282", faces: o.faces || {}, lod: o.lod, after: o.after, ink: 1 });
    }
    /** A flat quad between four lot points [X, V, Z] (bottom left, bottom right, top right, top left as seen from
        its front): an awning, a porch roof, a sloped sign; drawn from both sides, decals by share along it. */
    quad(pts, fill, o) {
      o = o || {};
      const xs = pts.map((p) => p[0]);
      const vs = pts.map((p) => p[1]);
      const zs = pts.map((p) => p[2]);
      return this.add({ t: "quad", pts, fill, decals: o.decals || null, b: [Math.min(...xs), Math.max(...xs), Math.min(...vs), Math.max(...vs), Math.min(...zs), Math.max(...zs)], lod: o.lod, after: o.after, ink: o.ink == null ? 1 : o.ink, back: o.back });
    }
    /** A round tank or column, n sided, from z0 to z1, with bands of colour [z0, z1, colour] and a flat cap. */
    cyl(cx, cv, r, z0, z1, fill, o) {
      o = o || {};
      return this.add({ t: "cyl", c: [cx, cv], r, z: [z0, z1], fill, n: o.n || 12, bands: o.bands || null, cap: o.cap === undefined ? shadeHex(fill, 14) : o.cap, b: [cx - r, cx + r, cv - r, cv + r, z0, z1], lod: o.lod, after: o.after, ink: o.ink == null ? 1 : o.ink, solid: o.solid !== false });
    }
    /** A cone or a pyramid (n sides) from radius r at z0 to its point at z1. */
    cone(cx, cv, r, z0, z1, fill, o) {
      o = o || {};
      return this.add({ t: "cone", c: [cx, cv], r, z: [z0, z1], fill, n: o.n || 12, rot: o.rot || 0, b: [cx - r, cx + r, cv - r, cv + r, z0, z1], lod: o.lod, after: o.after, ink: 1 });
    }
    /** Beams (posts, legs, braces, rails, wires): [[X, V, Z], [X, V, Z]] pairs, half as thick as w. */
    beams(segs, w, fill, o) {
      o = o || {};
      let x0 = Infinity;
      let x1 = -Infinity;
      let v0 = Infinity;
      let v1 = -Infinity;
      let z0 = Infinity;
      let z1 = -Infinity;
      for (const [a, b] of segs) {
        for (const p of [a, b]) {
          x0 = Math.min(x0, p[0] - w);
          x1 = Math.max(x1, p[0] + w);
          v0 = Math.min(v0, p[1] - w);
          v1 = Math.max(v1, p[1] + w);
          z0 = Math.min(z0, p[2]);
          z1 = Math.max(z1, p[2]);
        }
      }
      return this.add({ t: "beams", segs, w, fill, b: [x0, x1, v0, v1, z0, z1], lod: o.lod, after: o.after, ink: o.ink == null ? 1 : o.ink, cap: o.cap });
    }
    /** One of the landmark pictures (Draw3.sprite), standing at (x, v) on z, h tall, `aspect` wide per tall. */
    sprite(name, x, v, h, o) {
      o = o || {};
      const w = (h * (o.aspect || 1)) / 2;
      return this.add({ t: "sprite", name, opts: o.opts || null, at: [x, v, o.z || 0], h, aspect: o.aspect || 0, flip: !!o.flip, b: [x - w, x + w, v - w * 0.6, v + w * 0.6, o.z || 0, (o.z || 0) + h], lod: o.lod == null ? 2 : o.lod, after: o.after });
    }
    /** A log lying along X from x0 to x1, its middle at (v, z), r round; bark `fill`, its cut ends pale. */
    log(x0, x1, v, z, r, o) {
      o = o || {};
      return this.add({ t: "log", x: [x0, x1], c: [v, z], r, fill: o.fill || "#6b4a2e", end: o.end || "#c9a46e", b: [x0, x1, v - r, v + r, z - r, z + r], lod: o.lod, after: o.after, ink: 1 });
    }
    /** A glass house: glass walls x0..x1, v0..v1 up to z0, a glass gable roof to z1 (its ridge along V: the gable
        ends face the drive), a door in the front gable end; what grows inside is drawn inside it. */
    glass(x0, x1, v0, v1, z0, z1, o) {
      o = o || {};
      return this.add({ t: "glass", b: [x0, x1, v0, v1, 0, z1], z0, z1, frame: o.frame || "#e9ecdf", tint: o.tint || "rgba(196,226,214,0.42)", step: o.step || 26, door: o.door || null, beds: o.beds || [], lod: o.lod, after: o.after, ink: 1 });
    }
  }
  function shadeHex(hex, amt) {
    const c = rgb(hex);
    const f = (v) => clamp(Math.round(v + amt), 0, 255);
    return "#" + ((f(c[0]) << 16) | (f(c[1]) << 8) | f(c[2])).toString(16).padStart(6, "0");
  }

  /* ---------- the rows: each place's building ----------
     L: the lot's frame in units. F the front wall line (the van parks 42 to 47 short of it, on X = 0 unless the place
     has one road), BK the back wall line, W the building's half width as sprites.js draws it from above, LH the lot's
     half width, V0 / V1 the lot's front and back edges. Keep everything inside the lot, nothing low where the van
     parks (in front of the wall line across the van's width; at a place with one road nowhere in front of it:
     tests/validate-drive.js checks it on the real parked van), and the name on a sign low enough to be seen once
     parked (under about Z 170). */
  const SIDING = "#ece2c4"; // the cabin's own colours (js/houseart.js)
  const TRIM = "#f7f4ec";
  const SAGE = "#7d9a7a";
  const GLASS = "#33434f";
  /** A row of windows along a front or back wall, every `step` from a0 to a1, leaving out `skip` [from, to]. */
  function windows(a0, a1, z0, z1, step, w, o, skip) {
    const out = [];
    for (let a = a0; a + w <= a1 + 0.5; a += step) {
      if (skip && skip.some(([s0, s1]) => a + w > s0 && a < s1)) continue;
      out.push(win(a, a + w, z0, z1, o));
    }
    return out;
  }
  /** Rooftop clutter on a flat roof at height z over x0..x1, v0..v1 (the back two thirds): two air units and a vent
      pipe, placed by a seed; drawn after the roof they stand on. */
  function roofJunk(b, x0, x1, v0, v1, z, seed, on) {
    const r = (k) => ((Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
    const vb = v0 + (v1 - v0) * 0.4;
    for (let i = 0; i < 2; i++) {
      const w = 26 + r(i) * 16;
      const x = x0 + 20 + r(i + 4) * (x1 - x0 - 40 - w);
      const v = vb + r(i + 8) * (v1 - vb - 40);
      b.box(x, x + w, v, v + 26, z, z + 16, { wall: "#8a8f96", top: "#a3a8ae", lod: 2, after: [on], faces: { front: [lines(x, x + w, z + 3, z + 13, 4, "rgba(30,32,36,0.45)")] } });
    }
    b.cyl(x0 + 30 + r(12) * (x1 - x0 - 60), vb + 10 + r(13) * (v1 - vb - 30), 5, z, z + 22, "#6f767c", { n: 6, lod: 2, after: [on] });
  }
  /** Boards across some windows (an abandoned town), picked by a seed so it is always the same ones. */
  function boarded(list, seed) {
    list.forEach((d, i) => {
      if (((i + 1) * 2654435761 + seed) % 7 < 2) d.board = true;
    });
    return list;
  }

  const ROWS = {
    /* Home Base: the Hollis family's cabin (js/houseart.js): cream lap siding, white trim, sage shutters, the red front
       door, a slate shingle roof, a stone chimney, a porch, and June's hand-painted sign by the drive. */
    base: {
      ground: { surface: "#7a6a52", stripes: false },
      build(b, L) {
        const F = L.F;
        const LAP = "rgba(120,100,70,0.35)";
        // the front: the red door under a little porch roof, a window either side with its sage shutters, lap siding
        const front = [door(-17, 17, 2, 60, "#a8322a", { knob: true }), rect(-21, 21, 60, 64, TRIM, { lod: 2 })];
        for (const s of [-1, 1]) {
          const a0 = s < 0 ? -124 : 78;
          front.push(win(a0, a0 + 46, 24, 62, { frame: TRIM, glass: "#4d6470", bars: 1 }));
          front.push(rect(a0 - 12, a0 - 2, 22, 64, SAGE, { lod: 2 }), rect(a0 + 48, a0 + 58, 22, 64, SAGE, { lod: 2 }));
        }
        front.push(lines(-150, 150, 6, 80, 9, LAP, { lod: 2, skipA: [[-24, 24], [-138, -64], [64, 138]] }));
        const side = [win(F + 40, F + 84, 24, 62, { frame: TRIM, glass: "#4d6470", bars: 1 }), lines(F, F + 150, 6, 80, 9, LAP, { lod: 2, skipA: [[F + 36, F + 88]] })];
        const cabin = b.box(-150, 150, F, F + 150, 0, 80, { wall: SIDING, top: false, faces: { front, left: side, right: side, back: [lines(-150, 150, 6, 80, 9, LAP, { lod: 2 })] } });
        // the shingle roof, its gable end over the door, with the attic window in it
        b.gable(-150, 150, F, F + 150, 80, 150, { along: "v", roof: "#3e434a", wall: SIDING, over: 14, after: [cabin], faces: { front: [win(-18, 18, 92, 124, { frame: TRIM, glass: "#4d6470", bars: 1 })], back: [] } });
        // the porch over the door: a plank deck, two posts, a little roof
        b.box(-64, 64, F - 28, F, 0, 9, { wall: "#6e5434", top: "#9a7a52", lod: 1 });
        b.beams([[[-56, F - 24, 9], [-56, F - 24, 66]], [[56, F - 24, 9], [56, F - 24, 66]]], 3.5, TRIM, { lod: 1 });
        b.quad([[-68, F - 30, 64], [68, F - 30, 64], [68, F, 76], [-68, F, 76]], "#4a4f56", { lod: 1, decals: [rect(0, 1, 0, 0.08, TRIM, { share: true })] });
        // the stone chimney up the right side wall
        b.box(150, 176, F + 56, F + 92, 0, 172, { wall: "#8a8378", top: "#3b3a38", faces: { front: [lines(150, 176, 10, 168, 14, "rgba(40,36,30,0.45)", { lod: 2 })], right: [lines(F + 56, F + 92, 10, 168, 14, "rgba(40,36,30,0.45)", { lod: 2 })] } });
        // firewood stacked along the left wall, the rain barrel by the front corner
        b.box(-184, -152, F + 24, F + 120, 0, 34, { wall: "#7a5434", top: "#8e6440", lod: 1, faces: { left: [lines(F + 24, F + 120, 4, 32, 7, "rgba(40,24,10,0.5)")], front: [disc(-168, 17, 9, "#c9a46e")] } });
        b.cyl(-134, F - 16, 13, 0, 34, "#3f5f74", { n: 8, lod: 2 });
        // June's sign by the drive: a board on two posts, the name in careful capitals
        b.beams([[[-190, L.V0 + 44, 0], [-190, L.V0 + 44, 70]], [[-114, L.V0 + 44, 0], [-114, L.V0 + 44, 70]]], 3.5, "#6b4a2e", { lod: 1 });
        b.box(-200, -104, L.V0 + 40, L.V0 + 46, 36, 68, { wall: "#c9a877", top: "#a8875a", lod: 0, faces: { front: [sign(-198, -106, 37, 67, { name: true, bg: null, fg: "#3a2a1c", hand: true })] } });
      },
    },
    /* Gas-N-Go: the shop under its fading red band (Ruby's red R by the door), and out front the canopy on its posts
       over two pumps, an ice chest and the tall price sign seen from down the road. */
    gasngo: {
      ground: { surface: "#706d66", stripes: true, extra: "canopyPad" },
      build(b, L) {
        const F = L.F;
        const shop = b.box(-206, 66, F, F + 120, 0, 72, {
          wall: "#ddd5c2",
          top: "#55585e",
          faces: {
            front: [
              rect(-206, 66, 58, 72, "#b3261e", { lod: 0 }),
              win(-196, -40, 8, 52, { frame: "#e9e3d3", glass: GLASS, bars: 3, posters: ["#d9a21b", "#b3261e"] }),
              door(-18, 18, 2, 54, GLASS, { frame: "#e9e3d3", glassDoor: true }),
              win(26, 58, 18, 52, { frame: "#e9e3d3", glass: GLASS }),
              sign(-150, -70, 59, 71, { text: "ICE · SNACKS", bg: null, fg: "#f3eee0", lod: 2 }),
              shape([[-34, 30], [-30, 46], [-24, 46], [-22, 40], [-28, 38], [-22, 30]], "#c0261d", { lod: 2, ink: 0 }),
            ],
            left: [rect(F, F + 120, 58, 72, "#b3261e")],
            right: [rect(F, F + 120, 58, 72, "#b3261e"), door(F + 70, F + 100, 2, 52, "#5b6066")],
          },
        });
        // the shop's name on a sign along the roof's front
        b.box(-180, 20, F + 2, F + 8, 72, 100, { wall: "#f3eee0", top: "#b3261e", after: [shop], faces: { front: [sign(-178, 18, 73, 99, { name: true, bg: "#f3eee0", fg: "#b3261e", edge: "#b3261e" })] } });
        // the canopy on four posts over the pumps
        const cx0 = 76;
        const cx1 = 222;
        const cv0 = L.V0 + 14;
        const cv1 = F - 22;
        const posts = [];
        for (const x of [cx0 + 12, cx1 - 12]) for (const v of [cv0 + 18, cv1 - 14]) posts.push(b.box(x - 5, x + 5, v - 5, v + 5, 0, 94, { wall: "#e6dfcc", top: false }));
        b.box(cx0, cx1, cv0, cv1, 94, 110, { wall: "#b3261e", top: "#e6dfcc", faces: { front: [rect(cx0, cx1, 94, 97, "#f3eee0", { lod: 1 })], left: [rect(cv0, cv1, 94, 97, "#f3eee0", { lod: 1 })], right: [rect(cv0, cv1, 94, 97, "#f3eee0", { lod: 1 })] } });
        for (const v of [cv0 + 52, cv1 - 48]) {
          b.box(cx0 + 46, cx1 - 46, v - 10, v + 10, 0, 6, { wall: "#8d8a84", top: "#a39f97", lod: 1 });
          b.box(cx0 + 60, cx1 - 60, v - 7, v + 7, 6, 50, { wall: "#c0392b", top: "#e6dfcc", lod: 1, faces: { front: [rect(cx0 + 64, cx1 - 64, 26, 44, "#e6dfcc"), rect(cx0 + 68, cx1 - 68, 34, 41, "#2a3b2a", { lod: 2 })], back: [rect(cx0 + 64, cx1 - 64, 26, 44, "#e6dfcc")] } });
        }
        // the price sign up on its pole, seen from far down the road
        b.beams([[[-204, L.V0 + 40, 0], [-204, L.V0 + 40, 150]]], 4, "#5b6066");
        b.box(-230, -178, L.V0 + 35, L.V0 + 45, 146, 196, { wall: "#f3eee0", top: "#b3261e", faces: { front: [rect(-230, -178, 184, 196, "#b3261e"), sign(-227, -181, 148, 183, { text: "GAS", bg: "#f3eee0", fg: "#b3261e", lod: 1 })], back: [rect(-230, -178, 184, 196, "#b3261e")] } });
        b.sprite("iceMachine", -150, F - 14, 44, { aspect: 1.05, opts: { label: "ICE" } });
        b.sprite("vending", 46, F - 12, 60, { aspect: 0.62, opts: { color: "#c0392b", label: "SODA" } });
      },
    },
    /* Corner Grocery: a brick corner store under its own name, a green and white awning over the windows, fruit
       stands out front and a heap of carts. */
    grocery: {
      ground: { surface: "#66645d", stripes: true },
      build(b, L) {
        const F = L.F;
        const body = b.box(-206, 206, F, F + 150, 0, 96, {
          wall: "#a1553e",
          top: "#4f5157",
          faces: {
            front: [
              win(-192, -36, 8, 60, { frame: "#e9e3d3", glass: GLASS, bars: 3, posters: ["#d9a21b", "#7a9a3c", "#b3261e"] }),
              win(36, 192, 8, 60, { frame: "#e9e3d3", glass: GLASS, bars: 3, posters: ["#b3261e", "#d9a21b"] }),
              door(-22, 22, 2, 58, GLASS, { frame: "#e9e3d3", glassDoor: true }),
              lines(-206, 206, 66, 92, 6, "rgba(40,20,14,0.25)", { lod: 2 }),
            ],
            left: [lines(F, F + 150, 4, 92, 6, "rgba(40,20,14,0.25)", { lod: 2 }), win(F + 40, F + 80, 30, 62, { frame: "#e9e3d3", glass: GLASS, board: true })],
            right: [lines(F, F + 150, 4, 92, 6, "rgba(40,20,14,0.25)", { lod: 2 }), roll(F + 70, F + 130, 0, 60, "#7d8288")],
          },
        });
        roofJunk(b, -190, 190, F + 12, F + 150, 96, 3, body);
        // the parapet carrying the name
        b.box(-206, 206, F, F + 10, 96, 124, { wall: "#a1553e", top: "#c9bfa9", after: [body], faces: { front: [sign(-150, 150, 98, 122, { name: true, bg: "#f3eee0", fg: "#2f5a2a", edge: "#2f5a2a" })], back: [] } });
        // the striped awning, out over the windows
        b.quad([[-200, F - 22, 68], [200, F - 22, 68], [200, F, 84], [-200, F, 84]], "#e9e3d3", { decals: stripesAlong(14, "#3d7a3a"), lod: 0 });
        b.quad([[-200, F - 22, 61], [200, F - 22, 61], [200, F - 22, 68], [-200, F - 22, 68]], "#3d7a3a", { lod: 1, decals: scallops(14, "#e9e3d3") });
        // fruit and vegetable stands in front of the windows
        for (const a of [-150, 92]) {
          b.box(a, a + 60, F - 26, F - 10, 0, 20, { wall: "#8a6a3e", top: "#6e5230", lod: 2, faces: { front: [lines(a, a + 60, 4, 18, 7, "rgba(0,0,0,0.3)")] } });
          b.box(a + 3, a + 57, F - 24, F - 12, 20, 24, { wall: "#6e5230", top: "#5a4026", lod: 2, dots: a < 0 ? ["#c0392b", "#d9a21b", "#c0392b"] : ["#7a9a3c", "#e0a020", "#5f8a2e"] });
        }
        b.sprite("cartPile", 178, L.V0 + 70, 52, { aspect: 1.15 });
      },
    },
    /* Reyes Hardware: a big tan block store, its name in red on a sign along the roof, an orange band, the loading
       door at the side, lumber stacked out front, a ladder and a pyramid of toilets on sale. */
    hardware: {
      ground: { surface: "#68665f", stripes: true },
      build(b, L) {
        const F = L.F;
        const body = b.box(-208, 208, F, F + 154, 0, 112, {
          wall: "#c2ab82",
          top: "#55585e",
          faces: {
            front: [
              rect(-208, 208, 84, 96, "#d4621e"),
              sign(-150, 150, 85, 95, { text: "TOOLS · PAINT · LUMBER · GARDEN", bg: null, fg: "#f3eee0", lod: 2 }),
              win(-188, -50, 8, 64, { frame: "#3a3d42", glass: GLASS, bars: 3, posters: ["#d4621e", "#d9a21b"] }),
              win(50, 188, 8, 64, { frame: "#3a3d42", glass: GLASS, bars: 3, posters: ["#d4621e"] }),
              door(-28, 28, 2, 66, GLASS, { frame: "#3a3d42", glassDoor: true }),
              lines(-208, 208, 4, 82, 12, "rgba(60,48,30,0.22)", { lod: 2 }),
            ],
            left: [rect(F, F + 154, 84, 96, "#d4621e"), lines(F, F + 154, 4, 82, 12, "rgba(60,48,30,0.22)", { lod: 2 })],
            right: [rect(F, F + 154, 84, 96, "#d4621e"), roll(F + 40, F + 120, 0, 74, "#8a8f96")],
          },
        });
        b.box(-170, 170, F + 4, F + 12, 112, 148, { wall: "#f3eee0", top: "#b3261e", after: [body], faces: { front: [sign(-168, 168, 114, 146, { name: true, bg: "#f3eee0", fg: "#b3261e", edge: "#b3261e" })] } });
        roofJunk(b, -190, 190, F, F + 154, 112, 5, body);
        // lumber stacked by the front corner: bundles of boards on spacers
        for (const [z0, z1, c] of [[0, 4, "#5a4026"], [4, 16, "#c8a26a"], [16, 19, "#5a4026"], [19, 31, "#d2b07a"]]) {
          b.box(-212, -146, F - 64, F - 14, z0, z1, { wall: c, top: shadeHex(c, 14), lod: 1, faces: z1 - z0 > 6 ? { front: [lines(-212, -146, z0, z1, 3, "rgba(80,50,20,0.55)", { vertical: true })], right: [lines(F - 64, F - 14, z0, z1, 4, "rgba(80,50,20,0.45)")] } : {} });
        }
        b.sprite("toiletStack", 120, F - 16, 56, { aspect: 0.9, opts: { label: "SALE" } });
        b.sprite("ladder", -110, F - 12, 62, { aspect: 0.5, opts: { color: "#d9a21b" } });
      },
    },
    /* Mile 9 Pharmacy: a white drugstore with a green band and its name, a green cross on a pole out by the road and
       the giant toothbrush by the door. */
    pharmacy: {
      ground: { surface: "#68665f", stripes: true },
      build(b, L) {
        const F = L.F;
        const body = b.box(-192, 192, F, F + 144, 0, 92, {
          wall: "#e2e0d6",
          top: "#55585e",
          faces: {
            front: [
              rect(-192, 192, 66, 92, "#2f7a5a"),
              sign(-150, 150, 68, 90, { name: true, bg: null, fg: "#f3eee0" }),
              win(-176, -40, 8, 56, { frame: "#cfcabd", glass: GLASS, bars: 2, posters: ["#2f7a5a", "#d9a21b"] }),
              win(40, 176, 8, 56, { frame: "#cfcabd", glass: GLASS, bars: 2, posters: ["#b3261e"] }),
              door(-20, 20, 2, 56, GLASS, { frame: "#cfcabd", glassDoor: true }),
            ],
            left: [rect(F, F + 144, 66, 92, "#2f7a5a"), win(F + 30, F + 70, 24, 56, { frame: "#cfcabd", glass: GLASS, board: true })],
            right: [rect(F, F + 144, 66, 92, "#2f7a5a"), win(F + 30, F + 60, 24, 56, { frame: "#cfcabd", glass: GLASS }), door(F + 90, F + 118, 2, 52, "#6b7075")],
          },
        });
        roofJunk(b, -180, 180, F, F + 144, 92, 7, body);
        // the green cross on its pole by the road
        b.beams([[[168, L.V0 + 40, 0], [168, L.V0 + 40, 128]]], 4, "#5b6066");
        b.box(140, 196, L.V0 + 37, L.V0 + 43, 120, 176, { wall: null, top: null, solid: false, faces: { front: [cross(140, 196, 120, 176, "#2f9a5a")], back: [cross(140, 196, 120, 176, "#2f9a5a")] }, ink: 0 });
        b.sprite("toothbrush", -120, F - 14, 60, { aspect: 0.42, opts: { color: "#3aa0c0" } });
        b.sprite("pillBottle", 92, F - 14, 48, { aspect: 0.62, opts: { label: "RX" } });
      },
    },
    /* Ortiz Auto: a corrugated steel garage, one bay open on the car lift, the others shut, the office door, its name
       on a yellow sign, tyres and drums by the walls. One road in: nothing stands in front of the wall. */
    autoshop: {
      ground: { surface: "#615f59", stripes: false, extra: "oil" },
      build(b, L) {
        const F = L.F;
        const body = b.box(-208, 208, F, F + 150, 0, 98, {
          wall: "#6f7f8c",
          top: "#4b5057",
          faces: {
            front: [
              lines(-208, 208, 4, 96, 9, "rgba(20,28,36,0.35)", { vertical: true, lod: 2 }),
              rect(-196, -112, 0, 74, "#1d1f22"),
              img(-192, -116, 2, 66, "carLift", { opts: { color: "#7a3a2a" }, lod: 2 }),
              roll(-96, -12, 0, 74, "#c9ced3"),
              door(10, 40, 2, 58, "#3a4a58", { knob: true }),
              win(52, 92, 26, 58, { frame: "#e0b33a", glass: GLASS }),
              roll(108, 192, 0, 74, "#c9ced3"),
              rect(-208, 208, 76, 80, "#e0b33a"),
            ],
            left: [lines(F, F + 150, 4, 96, 9, "rgba(20,28,36,0.35)", { vertical: true, lod: 2 })],
            right: [lines(F, F + 150, 4, 96, 9, "rgba(20,28,36,0.35)", { vertical: true, lod: 2 }), win(F + 40, F + 80, 30, 62, { frame: "#e0b33a", glass: GLASS, board: true })],
          },
        });
        b.box(-150, 150, F + 2, F + 8, 98, 128, { wall: "#e0b33a", top: "#3a3d42", after: [body], faces: { front: [sign(-148, 148, 99, 127, { name: true, bg: "#e0b33a", fg: INK, edge: INK })] } });
        roofJunk(b, -190, 190, F, F + 150, 98, 11, body);
        b.sprite("tireStack", -222, F + 40, 54, { aspect: 0.62, opts: { label: "TIRES" } });
        b.sprite("drums", 222, F + 60, 46, { aspect: 1.1, opts: { color: "#3f6a8a", label: "OIL" } });
      },
    },
    /* Signal Electronics: a dark store with a wall of glass (box TVs inside), its name in yellow on blue with a
       lightning bolt, a dish up on the roof and the robot mascot by the door. */
    radioshack: {
      ground: { surface: "#5f5e5a", stripes: true },
      build(b, L) {
        const F = L.F;
        const body = b.box(-200, 200, F, F + 150, 0, 104, {
          wall: "#3f444c",
          top: "#2f3238",
          faces: {
            front: [
              rect(-200, 200, 76, 104, "#1f4a8a"),
              sign(-160, 160, 79, 101, { name: true, bg: null, fg: "#f0c247", bolt: true }),
              win(-186, -34, 6, 66, { frame: "#9ea3aa", glass: "#24384a", bars: 2 }),
              img(-180, -40, 8, 46, "tvWall", { lod: 2 }),
              win(34, 186, 6, 66, { frame: "#9ea3aa", glass: "#24384a", bars: 2, posters: ["#f0c247"] }),
              door(-24, 24, 2, 64, "#24384a", { frame: "#9ea3aa", glassDoor: true }),
            ],
            left: [rect(F, F + 150, 76, 104, "#1f4a8a")],
            right: [rect(F, F + 150, 76, 104, "#1f4a8a"), door(F + 96, F + 124, 2, 56, "#5b6066")],
          },
        });
        // a lattice mast on the roof (three legs drawing in, braced), and the dish
        {
          const legs = [0, 1, 2].map((i) => [150 + Math.cos(i * 2.09 + 0.5) * 14, F + 100 + Math.sin(i * 2.09 + 0.5) * 14]);
          const at = (i, z) => {
            const t = (z - 104) / 120;
            return [legs[i][0] + (150 - legs[i][0]) * t * 0.7, legs[i][1] + (F + 100 - legs[i][1]) * t * 0.7, z];
          };
          const segs = legs.map((_, i) => [at(i, 104), at(i, 224)]);
          for (let z = 116; z < 224; z += 18) for (let i = 0; i < 3; i++) segs.push([at(i, z), at((i + 1) % 3, z + 18)], [at(i, z), at((i + 1) % 3, z)]);
          segs.push([[150, F + 100, 224], [150, F + 100, 252]]);
          b.beams(segs, 1.2, "#b8bcc2", { after: [body], lod: 1 });
        }
        b.sprite("satDish", -120, F + 70, 64, { z: 104, aspect: 1.0, after: [body] });
        b.sprite("robotMascot", 64, F - 16, 60, { aspect: 0.6, opts: { label: "HI!" } });
      },
    },
    /* Greenhouse Row: a row of glass greenhouses with their beds inside, the garden center's sign over the gate, the
       scarecrow, a potted palm and a gnome. */
    garden: {
      ground: { surface: "#857d68", stripes: false },
      build(b, L) {
        const F = L.F;
        const beds = (x0, x1) => [
          [x0 + 10, x0 + (x1 - x0) / 2 - 8, F + 14, F + 136, 22, "#5f7f3a"],
          [x0 + (x1 - x0) / 2 + 8, x1 - 10, F + 14, F + 136, 30, "#6f8f3e"],
        ];
        b.glass(-208, -76, F + 10, F + 154, 52, 104, { beds: beds(-208, -76) });
        b.glass(-66, 66, F, F + 154, 58, 116, { beds: beds(-66, 66), door: [-16, 16] });
        b.glass(76, 208, F + 10, F + 154, 52, 104, { beds: beds(76, 208) });
        // the gate sign over the way in
        b.beams([[[-84, F - 12, 0], [-84, F - 12, 150]], [[84, F - 12, 0], [84, F - 12, 150]]], 5, "#6b4a2e");
        b.box(-96, 96, F - 15, F - 9, 118, 148, { wall: "#e9e3d3", top: "#6b4a2e", faces: { front: [sign(-94, 94, 119, 147, { name: true, bg: "#e9e3d3", fg: "#3d6a2a", edge: "#3d6a2a" })] } });
        b.sprite("scarecrow", -150, F - 26, 70, { aspect: 0.62 });
        b.sprite("palmTree", 132, F - 24, 76, { aspect: 0.7 });
        b.sprite("gnome", 182, F - 30, 40, { aspect: 0.55 });
      },
    },
    /* 4th Precinct: two storeys of pale stone, the name over a columned porch up two steps, blue lamps by the door,
       a flag on its pole and the police motorbike. */
    police: {
      ground: { surface: "#66645d", stripes: true },
      build(b, L) {
        const F = L.F;
        const rows = (z0, z1) => boarded(windows(-196, 196, z0, z1, 44, 28, { frame: "#e7e1d2", glass: "#2c3a48", bars: 1 }, [[-82, 82]]), 3);
        const body = b.box(-208, 208, F + 10, F + 154, 0, 136, {
          wall: "#b8b09e",
          top: "#4f5157",
          faces: {
            front: rows(24, 58).concat(rows(84, 118), [rect(-208, 208, 0, 8, "#8a8374"), rect(-208, 208, 128, 136, "#2f3e5c"), door(-30, 30, 2, 66, "#2c3a48", { frame: "#e7e1d2", glassDoor: true }), win(-60, -38, 84, 118, { frame: "#e7e1d2", glass: "#2c3a48", bars: 1 }), win(38, 60, 84, 118, { frame: "#e7e1d2", glass: "#2c3a48", bars: 1 })]),
            left: [rect(F + 10, F + 154, 128, 136, "#2f3e5c")].concat(windowsV(F + 30, F + 140, 24, 58, 40, 24), windowsV(F + 30, F + 140, 84, 118, 40, 24)),
            right: [rect(F + 10, F + 154, 128, 136, "#2f3e5c")].concat(windowsV(F + 30, F + 140, 24, 58, 40, 24), windowsV(F + 30, F + 140, 84, 118, 40, 24)),
          },
        });
        // the porch: two steps, four columns, the name across the beam they hold
        b.box(-84, 84, F - 28, F + 10, 0, 5, { wall: "#a39b8a", top: "#c9c2b2", lod: 1 });
        b.box(-76, 76, F - 18, F + 10, 5, 10, { wall: "#a39b8a", top: "#d2cbbb", lod: 1 });
        for (const x of [-64, -24, 24, 64]) b.cyl(x, F - 8, 6, 10, 76, "#ddd6c6", { n: 8, cap: null });
        b.box(-84, 84, F - 20, F + 10, 76, 106, { wall: "#cfc8b6", top: "#a39b8a", faces: { front: [sign(-80, 80, 78, 104, { name: true, bg: null, fg: "#2f3e5c" })] } });
        for (const s of [-1, 1]) {
          b.beams([[[s * 100, F - 10, 0], [s * 100, F - 10, 60]]], 1.8, "#2f3236", { lod: 2 });
          b.box(s * 100 - 5, s * 100 + 5, F - 15, F - 5, 60, 72, { wall: "#3a7ad0", top: "#9fc6f0", lod: 2 });
        }
        // on the roof: the vents and a radio mast
        b.box(-150, -110, F + 70, F + 110, 136, 152, { wall: "#8a8f96", top: "#9ea3aa", lod: 2, after: [body] });
        b.box(100, 130, F + 90, F + 120, 136, 148, { wall: "#8a8f96", top: "#9ea3aa", lod: 2, after: [body] });
        b.beams([[[160, F + 120, 136], [160, F + 120, 226]]], 2, "#9ea3aa", { lod: 1, after: [body] });
        flag(b, 222, F - 18, 210, "#2f5a8a");
        b.sprite("motorcycle", -160, L.V0 + 80, 48, { aspect: 1.3 });
      },
    },
    /* Lincoln Middle School: a long low brick school with a row of windows, the white entrance with its clock and the
       name over the doors, a flag and the gold lion. */
    school: {
      ground: { surface: "#66645d", stripes: true },
      build(b, L) {
        const F = L.F;
        const row = boarded(windows(-196, 196, 24, 66, 38, 28, { frame: TRIM, glass: "#2c3a48", bars: 1 }, [[-70, 70]]), 5);
        const body = b.box(-208, 208, F + 18, F + 154, 0, 86, {
          wall: "#8e4a36",
          top: "#4f5157",
          faces: {
            front: row.concat([rect(-208, 208, 78, 86, TRIM), rect(-208, 208, 0, 6, "#6b3828")]),
            left: windowsV(F + 34, F + 146, 24, 66, 36, 26).concat([rect(F + 18, F + 154, 78, 86, TRIM)]),
            right: windowsV(F + 34, F + 146, 24, 66, 36, 26).concat([rect(F + 18, F + 154, 78, 86, TRIM)]),
          },
        });
        roofJunk(b, -190, 190, F + 18, F + 154, 86, 13, body);
        const ent = b.box(-66, 66, F, F + 22, 0, 112, {
          wall: "#e7e1d2",
          top: "#4f5157",
          faces: {
            front: [door(-30, -2, 2, 60, "#2c3a48", { frame: "#8e4a36", glassDoor: true }), door(2, 30, 2, 60, "#2c3a48", { frame: "#8e4a36", glassDoor: true }), rect(-62, 62, 66, 92, "#2f3e5c"), sign(-60, 60, 68, 90, { name: true, bg: null, fg: "#f3eee0" })],
          },
        });
        b.gable(-66, 66, F, F + 22, 112, 140, { along: "v", roof: "#4f5157", wall: "#e7e1d2", over: 6, after: [ent], faces: { front: [disc(0, 122, 10, "#f3eee0")] } });
        flag(b, -222, F - 18, 200, "#2f5a8a");
        b.sprite("lionStatue", 120, F - 34, 58, { aspect: 0.9, opts: { label: "LIONS" } });
      },
    },
    /* Station 12: a red brick fire station, its name over the bays, one bay open on the fire truck, the white trim,
       a tall hose tower, and the dalmatian. */
    firehouse: {
      ground: { surface: "#66645d", stripes: false },
      build(b, L) {
        const F = L.F;
        const body = b.box(-208, 112, F, F + 150, 0, 112, {
          wall: "#a5402f",
          top: "#4f5157",
          faces: {
            front: [
              rect(-196, -96, 0, 80, "#141517"),
              img(-190, -102, 2, 72, "fireTruck", { lod: 2 }),
              rect(-196, -96, 76, 80, TRIM),
              roll(-50, 50, 0, 80, "#e7e1d2", { panes: true }),
              rect(-208, 112, 86, 110, TRIM),
              sign(-176, 80, 88, 108, { name: true, bg: null, fg: "#a5402f" }),
              door(70, 96, 2, 58, "#3a3d42", { knob: true }),
            ],
            left: windowsV(F + 30, F + 140, 30, 66, 40, 26),
            right: windowsV(F + 30, F + 140, 30, 66, 40, 26),
          },
        });
        roofJunk(b, -195, 100, F, F + 150, 112, 23, body);
        // the hose tower
        const tw = b.box(128, 196, F + 40, F + 100, 0, 236, { wall: "#a5402f", top: "#4f5157", faces: { front: [win(150, 174, 150, 196, { frame: TRIM, glass: "#2c3a48" }), win(150, 174, 70, 116, { frame: TRIM, glass: "#2c3a48" }), rect(128, 196, 226, 236, TRIM)], left: [rect(F + 40, F + 100, 226, 236, TRIM)], right: [rect(F + 40, F + 100, 226, 236, TRIM)] } });
        b.cone(162, F + 70, 46, 236, 264, "#4f5157", { n: 4, rot: Math.PI / 4, after: [tw] });
        b.sprite("dalmatian", 92, F - 22, 38, { aspect: 0.8 });
      },
    },
    /* St. Anne Annex: three storeys of pale hospital with green bands, the name across the front, the lobby's glass
       under the EMERGENCY canopy, and a red cross up on the roof. */
    hospital: {
      ground: { surface: "#68665f", stripes: true },
      build(b, L) {
        const F = L.F;
        const rows = (z0, z1) => boarded(windows(-198, 198, z0, z1, 36, 26, { frame: "#cfd6cf", glass: "#2c3a48", bars: 1 }), 11);
        const body = b.box(-208, 208, F + 22, F + 154, 0, 192, {
          wall: "#dfe3dc",
          top: "#55585e",
          faces: {
            front: rows(16, 50)
              .filter((d) => d.a1 < -84 || d.a0 > 84)
              .concat(rows(74, 108), rows(150, 184).filter((d) => d.a1 < -120 || d.a0 > 120), [rect(-208, 208, 60, 66, "#7aa58a"), rect(-208, 208, 134, 140, "#7aa58a"), sign(-116, 116, 144, 188, { name: true, bg: null, fg: "#2f5a4a" })]),
            left: windowsV(F + 36, F + 146, 16, 50, 34, 24).concat(windowsV(F + 36, F + 146, 74, 108, 34, 24), windowsV(F + 36, F + 146, 150, 184, 34, 24)),
            right: windowsV(F + 36, F + 146, 16, 50, 34, 24).concat(windowsV(F + 36, F + 146, 74, 108, 34, 24), windowsV(F + 36, F + 146, 150, 184, 34, 24)),
          },
        });
        roofJunk(b, -190, 110, F + 22, F + 154, 192, 17, body);
        const lobby = b.box(-78, 78, F, F + 22, 0, 84, { wall: "#cfd6cf", top: "#7aa58a", faces: { front: [win(-70, 70, 4, 62, { frame: "#9ea3aa", glass: "#3c5566", bars: 4 }), door(-24, 24, 2, 62, "#3c5566", { frame: "#9ea3aa", glassDoor: true })] } });
        void lobby;
        b.beams([[[-80, F - 22, 0], [-80, F - 22, 72]], [[80, F - 22, 0], [80, F - 22, 72]]], 4, "#cfd6cf", { lod: 1 });
        b.box(-90, 90, F - 28, F, 72, 90, { wall: "#e9ece6", top: "#9aa39a", faces: { front: [sign(-60, 60, 74, 88, { text: "EMERGENCY", bg: null, fg: "#b3261e", lod: 1 })] } });
        b.box(130, 186, F + 30, F + 36, 192, 248, { wall: null, top: null, solid: false, after: [body], faces: { front: [rect(130, 186, 192, 248, "#f3eee0"), cross(134, 182, 196, 244, "#c0392b")] }, ink: 0 });
        b.sprite("wheelchairs", -132, F - 16, 40, { aspect: 1.3 });
      },
    },
    /* Water Tower: the pump building under the tower, the tall legs braced in rings and crosses, the round tank with
       its catwalk, the narrow ladder, and on top Jo's antenna on three guy wires. The tallest thing for miles: seen
       past the haze. */
    watertower: {
      landmark: true,
      ground: { surface: "#7a766a", stripes: false },
      build(b, L) {
        const F = L.F;
        const pump = b.box(-88, 88, F, F + 112, 0, 82, {
          wall: "#a7a396",
          top: "#55585e",
          faces: {
            front: [door(-18, 18, 2, 58, "#5b6672", { knob: true }), win(-70, -36, 34, 60, { frame: "#cfcabd", glass: GLASS, bars: 1 }), win(36, 70, 34, 60, { frame: "#cfcabd", glass: GLASS, bars: 1, board: true }), sign(-60, 60, 64, 79, { name: true, bg: "#f3eee0", fg: "#2f4a6a", edge: "#2f4a6a" })],
            left: [win(F + 40, F + 72, 34, 60, { frame: "#cfcabd", glass: GLASS })],
            right: [door(F + 60, F + 88, 2, 56, "#5b6672")],
          },
        });
        void pump;
        // four legs, leaning in toward the tank, braced in rings and crosses above the pump building's roof (the
        // camera sees nothing higher than itself, about 340 units up on a small window: TOWER_TOP)
        const cv = F + 70;
        const foot = 152;
        const top = 98;
        const ZT = TOWER_TOP - 162;
        const leg = (sx, sv) => [[sx * foot, cv + sv * (foot - 80), 0], [sx * top, cv + sv * (top - 46), ZT]];
        const at = (sx, sv, z) => {
          const t = z / ZT;
          return [sx * (foot + (top - foot) * t), cv + sv * (foot - 80 + (top - 46 - (foot - 80)) * t), z];
        };
        const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
        corners.forEach(([sx, sv]) => b.beams([leg(sx, sv)], 6, "#8f969c"));
        for (let i = 0; i < 4; i++) {
          const [ax, av] = corners[i];
          const [bx, bv] = corners[(i + 1) % 4];
          const segs = [];
          const z1 = 96;
          const z2 = Math.round((96 + ZT) / 2);
          for (const z of [z1, z2]) segs.push([at(ax, av, z), at(bx, bv, z)]);
          segs.push([at(ax, av, z1), at(bx, bv, z2)], [at(bx, bv, z1), at(ax, av, z2)]);
          segs.push([at(ax, av, z2), at(bx, bv, ZT - 4)], [at(bx, bv, z2), at(ax, av, ZT - 4)]);
          b.beams(segs, 2.2, "#8f969c", { lod: 1 });
        }
        // the narrow ladder up beside the front left leg, from the pump building's roof to the catwalk
        const lx = -top - 14;
        const lv = F + 4;
        const rungs = [[[lx - 6, lv, 84], [lx - 6, lv, ZT]], [[lx + 6, lv, 84], [lx + 6, lv, ZT]]];
        for (let z = 96; z < ZT; z += 14) rungs.push([[lx - 6, lv, z], [lx + 6, lv, z]]);
        b.beams(rungs, 1.2, "#6f767c", { lod: 2 });
        // the round tank (its band, a pointed roof), the catwalk round it and Jo's antenna on top
        const zTop = ZT + 84;
        const zCone = zTop + 30;
        b.add({ t: "tank", c: [0, cv], r: 104, z: [ZT, zTop, zCone], walk: 120, rail: 20, mast: TOWER_TOP - zCone, b: [-124, 124, cv - 124, cv + 124, ZT, TOWER_TOP], lod: 0, ink: 1 });
      },
    },
    /* Ridge Lumber: the office under its green roof, the open shed on its poles with lumber stacked under it and the
       name along its front, logs piled by the drive, and the forklift. */
    lumberyard: {
      ground: { surface: "#7a6248", stripes: false },
      build(b, L) {
        const F = L.F;
        const office = b.box(-208, -70, F + 16, F + 140, 0, 78, {
          wall: "#8a6a46",
          top: false,
          faces: {
            front: [lines(-208, -70, 4, 76, 10, "rgba(50,30,14,0.4)", { lod: 2 }), door(-150, -122, 2, 58, "#5a4030", { knob: true }), win(-196, -164, 26, 58, { frame: "#e6dfcc", glass: GLASS }), win(-110, -80, 26, 58, { frame: "#e6dfcc", glass: GLASS, board: true })],
            left: [lines(F + 16, F + 140, 4, 76, 10, "rgba(50,30,14,0.4)", { lod: 2 })],
            right: [lines(F + 16, F + 140, 4, 76, 10, "rgba(50,30,14,0.4)", { lod: 2 })],
          },
        });
        b.gable(-208, -70, F + 16, F + 140, 78, 112, { roof: "#4f6b3a", wall: "#8a6a46", over: 10, after: [office] });
        // the open shed: poles, a roof sloping back, the name along its front, lumber under it
        const sx0 = -50;
        const sx1 = 208;
        for (const x of [sx0 + 6, 76, sx1 - 6]) for (const v of [F + 6, F + 148]) b.beams([[[x, v, 0], [x, v, v < F + 50 ? 112 : 96]]], 5, "#6b4a2e");
        b.quad([[sx0 - 6, F, 112], [sx1 + 6, F, 112], [sx1 + 6, F + 154, 96], [sx0 - 6, F + 154, 96]], "#4f6b3a", { decals: [rect(0, 1, 0, 0.04, "#3f5530")] });
        b.box(sx0 - 6, sx1 + 6, F - 3, F + 3, 112, 136, { wall: "#e6dfcc", top: "#6b4a2e", faces: { front: [sign(sx0 - 4, sx1 + 4, 113, 135, { name: true, bg: "#e6dfcc", fg: "#4a3018", edge: "#4a3018" })] } });
        const stack = (x0, x1, h, c) => b.box(x0, x1, F + 30, F + 128, 0, h, { wall: c, top: shadeHex(c, 18), faces: { front: [lines(x0, x1, 3, h - 2, 6, "rgba(70,40,14,0.55)", { lod: 2 })] } });
        stack(-30, 56, 46, "#c8a26a");
        stack(96, 190, 34, "#b8925a");
        // logs piled by the drive
        for (const [v, z] of [[L.V0 + 64, 11], [L.V0 + 86, 11], [L.V0 + 108, 11], [L.V0 + 75, 30], [L.V0 + 97, 30]]) b.log(-210, -110, v, z, 11, { fill: "#7a5434", lod: 1 });
        b.sprite("forklift", -132, F - 30, 52, { aspect: 1.45, opts: { color: "#e0a020" } });
      },
    },
    /* Northgate Mall: a long, tall mall the width of its lot in beige and purple, the glass entrance with the name over
       it, anchor fronts at both ends, and the carts. */
    mall: {
      ground: { surface: "#66645d", stripes: true },
      build(b, L) {
        const F = L.F;
        const W = L.LH;
        const body = b.box(-W, W, F, F + 160, 0, 122, {
          wall: "#cdbfa5",
          top: "#55585e",
          faces: {
            front: [
              rect(-W, W, 100, 122, "#6b3f8a"),
              rect(-W + 10, -120, 0, 92, "#3f7a7a"),
              rect(120, W - 10, 0, 92, "#8a6a2e"),
              win(-W + 24, -136, 10, 64, { frame: "#e6dfcc", glass: GLASS, bars: 2 }),
              win(136, W - 24, 10, 64, { frame: "#e6dfcc", glass: GLASS, bars: 2, board: true }),
              sign(-W + 20, -130, 70, 88, { text: "SHOES", bg: "#f3eee0", fg: "#3f7a7a", edge: "#3f7a7a", lod: 1 }),
              sign(130, W - 20, 70, 88, { text: "TOYS", bg: "#f3eee0", fg: "#8a6a2e", edge: "#8a6a2e", lod: 1 }),
            ],
            left: [rect(F, F + 160, 100, 122, "#6b3f8a"), roll(F + 50, F + 120, 0, 70, "#8a8f96")],
            right: [rect(F, F + 160, 100, 122, "#6b3f8a")],
          },
        });
        roofJunk(b, -200, 200, F, F + 160, 122, 19, body);
        const atrium = b.box(-86, 86, F - 16, F, 0, 128, { wall: "#cdbfa5", top: "#6b3f8a", after: [body], faces: { front: [win(-80, 80, 4, 98, { frame: "#e6dfcc", glass: "#2f4a5a", bars: 5 }), door(-28, 28, 2, 60, "#2f4a5a", { frame: "#e6dfcc", glassDoor: true })] } });
        b.box(-120, 120, F - 18, F - 12, 128, 160, { wall: "#6b3f8a", top: "#4a2a62", after: [atrium], faces: { front: [sign(-118, 118, 130, 158, { name: true, bg: "#6b3f8a", fg: "#f3eee0" })] } });
        b.sprite("cartPile", 168, L.V0 + 70, 52, { aspect: 1.15 });
      },
    },
    /* Public Library: pale stone, tall arched windows, a porch of columns up wide steps under a pediment with the name
       on its beam, and a copper green dome. */
    library: {
      ground: { surface: "#68665f", stripes: true },
      build(b, L) {
        const F = L.F;
        const arches = [];
        for (const a of [-180, -144, -108, 84, 120, 156]) arches.push(win(a, a + 24, 18, 70, { frame: "#ece6d4", glass: "#2c3a48", arch: true }));
        const body = b.box(-200, 200, F + 10, F + 154, 0, 104, { wall: "#d8d0bc", top: "#3f7a6a", faces: { front: arches.concat([rect(-200, 200, 92, 104, "#c2b9a2"), door(-22, 22, 2, 64, "#4a3a2a", { arch: true })]), left: windowsV(F + 30, F + 140, 18, 70, 34, 22, { arch: true }), right: windowsV(F + 30, F + 140, 18, 70, 34, 22, { arch: true }) } });
        b.box(-92, 92, F - 30, F + 10, 0, 5, { wall: "#b8b09e", top: "#d2cbbb", lod: 1 });
        b.box(-86, 86, F - 20, F + 10, 5, 10, { wall: "#b8b09e", top: "#ddd6c6", lod: 1 });
        for (const x of [-72, -26, 26, 72]) b.cyl(x, F - 6, 7, 10, 86, "#e6dfcc", { n: 8, cap: null });
        const beam = b.box(-88, 88, F - 16, F + 10, 86, 104, { wall: "#ddd6c6", top: "#c2b9a2", faces: { front: [sign(-84, 84, 88, 102, { name: true, bg: null, fg: "#3a3428" })] } });
        b.gable(-88, 88, F - 16, F + 10, 104, 132, { along: "v", roof: "#3f7a6a", wall: "#ddd6c6", over: 4, after: [beam] });
        // the dome on its drum, a little lantern on top
        const drum = b.cyl(0, F + 90, 54, 104, 134, "#d8d0bc", { n: 14, cap: null, after: [body], bands: [[124, 130, "#c2b9a2"]] });
        const dome = b.add({ t: "dome", c: [0, F + 90], r: 56, z: [134, 186], fill: "#3f7a6a", n: 14, b: [-56, 56, F + 34, F + 146, 134, 186], lod: 0, after: [drum], ink: 1 });
        b.cyl(0, F + 90, 8, 184, 198, "#d8d0bc", { n: 8, after: [dome], lod: 1 });
        b.cone(0, F + 90, 11, 198, 210, "#3f7a6a", { n: 8, after: [dome], lod: 1 });
      },
    },
    /* River Landing: where Frog Lane's dirt road runs out at the water: log stops across it, the dock standing out over
       the river on its posts, and the sign post that carries the name. */
    river: {
      river: true,
      build(b, L) {
        const H = L.half;
        const y0 = H - 110; // the log stops (sprites.js riverDock's own places)
        for (let x = -150; x < 150; x += 80) b.log(x, x + 66, y0 + 10, 10, 10);
        const d0 = y0 + 50;
        const d1 = d0 + 520;
        b.box(-60, 60, d0, d1, 4, 14, { wall: "#7e5c3a", top: "#a8825a", faces: {}, deck: true });
        for (const v of [d0 + 40, (d0 + d1) / 2, d1 - 20]) for (const x of [-70, 70]) b.cyl(x, v, 9, -6, 34, "#5a4538", { n: 8 });
        // the sign post by the end of the road, on the left as the van comes in
        b.beams([[[-232, y0 - 60, 0], [-232, y0 - 60, 92]], [[-132, y0 - 60, 0], [-132, y0 - 60, 92]]], 4, "#5a4538");
        b.box(-250, -114, y0 - 63, y0 - 57, 46, 90, { wall: "#e6dfcc", top: "#8a6a46", faces: { front: [sign(-248, -116, 47, 89, { name: true, bg: "#e6dfcc", fg: "#2f4a3a", edge: "#5a4538" })] } });
      },
    },
  };
  /** Windows along a side wall (by V). */
  function windowsV(v0, v1, z0, z1, step, w, o) {
    return windows(v0, v1, z0, z1, step, w, Object.assign({ frame: "#e7e1d2", glass: "#2c3a48", bars: 1 }, o || {}));
  }
  /** The awning's stripes, down its slope (by share across the quad). */
  function stripesAlong(n, color) {
    const out = [];
    for (let i = 0; i < n; i += 2) out.push(rect(i / n, (i + 1) / n, 0, 1, color, { share: true, ink: 0 }));
    return out;
  }
  function scallops(n, color) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(shape([[i / n, 0.02], [(i + 0.5) / n, 0.6], [(i + 1) / n, 0.02]], color, { share: true, ink: 0 }));
    return out;
  }
  /** A cross (a pharmacy's, a hospital's) filling a0..a1, z0..z1. */
  function cross(a0, a1, z0, z1, fill) {
    const w = a1 - a0;
    const h = z1 - z0;
    const t = 0.32;
    const x = (f) => a0 + w * f;
    const z = (f) => z0 + h * f;
    return shape([[x(0.5 - t / 2), z(0)], [x(0.5 + t / 2), z(0)], [x(0.5 + t / 2), z(0.5 - t / 2)], [x(1), z(0.5 - t / 2)], [x(1), z(0.5 + t / 2)], [x(0.5 + t / 2), z(0.5 + t / 2)], [x(0.5 + t / 2), z(1)], [x(0.5 - t / 2), z(1)], [x(0.5 - t / 2), z(0.5 + t / 2)], [x(0), z(0.5 + t / 2)], [x(0), z(0.5 - t / 2)], [x(0.5 - t / 2), z(0.5 - t / 2)]], fill, { lod: 0 });
  }
  /** A flag on its pole (by the drive, seen from down the road). */
  function flag(b, x, v, h, color) {
    const s = x > 0 ? -1 : 1; // (flying in over the building)
    b.beams([[[x, v, 0], [x, v, h]]], 2.4, "#b8bcc2");
    b.quad([[x, v, h - 30], [x + s * 44, v - 4, h - 33], [x + s * 44, v - 4, h - 9], [x, v, h - 4]], color, { decals: [rect(0, 1, 0.38, 0.62, "#e9e3d3", { share: true, ink: 0 })], ink: 1, lod: 1 });
  }

  /* ---------- the side streets' ends, standing (from the drive's own side streets, sprites.js sideEnd's places) ---------- */
  const ENDS = {
    /** A dead end: a guard rail of cream and black stripes on posts, past the end of the paving. */
    deadEnd(b, G) {
      const v = G.sideHalf + 20;
      const w = G.sideHalf * 1.2;
      const posts = [];
      for (let x = -w; x <= w + 0.5; x += w / 3) posts.push([[x, v + 6, 0], [x, v + 6, 40]]);
      b.beams(posts, 3.5, "#3a3d42");
      b.box(-w - 6, w + 6, v - 6, v, 22, 42, { wall: "#e6dfcc", top: "#c9c2b2", faces: { front: [stripeBoard(-w - 6, w + 6, 22, 42, INK)], back: [stripeBoard(-w - 6, w + 6, 22, 42, INK)] } });
    },
    /** A closed road: two striped barricades on their legs across the end of its paving (past where a van that
        turned in would stop), a cone at each side. */
    closed(b, G) {
      const w = G.sideHalf * 0.96;
      for (const v of [10, 46]) {
        const legs = [];
        for (const x of [-w / 2 + 14, w / 2 - 14]) legs.push([[x, v - 9, 0], [x, v, 44]], [[x, v + 9, 0], [x, v, 44]]);
        b.beams(legs, 2.5, "#e6dfcc");
        b.box(-w / 2, w / 2, v - 3, v + 3, 26, 44, { wall: "#f3eee0", top: "#d4621e", faces: { front: [stripeBoard(-w / 2, w / 2, 26, 44, "#d4621e")], back: [stripeBoard(-w / 2, w / 2, 26, 44, "#d4621e")] } });
      }
      for (const x of [-G.sideHalf * 1.2, G.sideHalf * 1.2]) {
        b.box(x - 13, x + 13, 15, 41, 0, 4, { wall: "#2f3136", top: "#3a3d42" });
        b.cone(x, 28, 11, 4, 36, "#d4621e", { n: 8 });
      }
    },
    /** No through road: a heavy grey gate rail between two posts. */
    noThrough(b, G) {
      const w = G.sideHalf * 1.1;
      for (const x of [-w / 2, w / 2]) b.cyl(x, 10, 11, 0, 50, "#4b5057", { n: 8 });
      b.box(-w / 2 + 10, w / 2 - 10, 6, 14, 30, 42, { wall: "#8d8a84", top: "#a39f97", faces: { front: [stripeBoard(w / 2 - 50, w / 2 - 10, 30, 42, "#b3261e"), stripeBoard(-w / 2 + 10, -w / 2 + 50, 30, 42, "#b3261e")], back: [stripeBoard(w / 2 - 50, w / 2 - 10, 30, 42, "#b3261e")] } });
    },
  };
  /** Slanted stripes on a board (a barricade's, a rail's). */
  function stripeBoard(a0, a1, z0, z1, color) {
    const out = [];
    const h = z1 - z0;
    for (let a = a0 + 4; a < a1 - 4; a += h * 1.6) out.push([a, a + h * 0.7].map((x) => clamp(x, a0, a1)));
    return Object.assign(shapeSet(out.map(([x0, x1]) => [[x0, z0], [x1, z0], [Math.min(a1, x1 + h * 0.5), z1], [Math.min(a1, x0 + h * 0.5), z1]]), color), {});
  }
  function shapeSet(polys, fill) {
    return { k: "polys", polys, fill, lod: 1 };
  }

  /* ---------- drawing ---------- */
  // the frame of the building being drawn this call, and how it is seen (reused)
  const R = { ctx: null, P: null, k: null, f: null, cX: 0, cV: 0, cZ: 0, lw: 2, lod: 2, fine: 1, mixQ: 0, to: [0, 0, 0], toKey: "", dy: 0, s: 1, sil: false, time: 0, rec: null, lightA: 1 };
  const tmp = [{}, {}, {}, {}, {}, {}, {}, {}];
  /** A lot point (X, V, Z) on the screen, into out ({ x, y, s, d }); false behind the camera. */
  function prj(X, V, Z, out) {
    const f = R.f;
    const k = R.k;
    const dx = f.ox + f.Rx * X + f.Nx * V - k.ox;
    const dy = f.oy + f.Ry * X + f.Ny * V - k.oy;
    const Xc = dx * k.Rx + dy * k.Ry;
    const Yb = dx * k.Fx + dy * k.Fy + k.b;
    const dz = k.h - Z;
    const d = Yb * k.cs + dz * k.sn;
    if (d < 5) return false;
    out.x = k.cx + (k.f * Xc) / d;
    out.y = k.cy - (k.f * (Yb * k.sn - dz * k.cs)) / d + R.dy;
    out.s = k.f / d;
    out.d = d;
    return true;
  }
  /** The world point of a lot point. */
  function world(f, X, V) {
    return { x: f.ox + f.Rx * X + f.Nx * V, y: f.oy + f.Ry * X + f.Ny * V };
  }
  /** A lot's (or a side street end's) frame: origin, X to the right, V into the lot. */
  function frameOfLot(l) {
    const Nx = -l.uy * l.side;
    const Ny = l.ux * l.side;
    return { ox: l.qx, oy: l.qy, Nx, Ny, Rx: -Ny, Ry: Nx };
  }
  function frameOfSide(s) {
    const len = Math.hypot(s.x1 - s.x0, s.y1 - s.y0) || 1;
    const Nx = (s.x1 - s.x0) / len;
    const Ny = (s.y1 - s.y0) / len;
    return { ox: s.x1, oy: s.y1, Nx, Ny, Rx: -Ny, Ry: Nx };
  }

  /** Square to screen quad, for laying things on a wall in perspective: corners bottom left, bottom right, top
      right, top left. Returns a map (u, v) -> [x, y] written into o. */
  function homog(q, h) {
    const [x0, y0] = [q[0].x, q[0].y];
    const [x1, y1] = [q[1].x, q[1].y];
    const [x2, y2] = [q[2].x, q[2].y];
    const [x3, y3] = [q[3].x, q[3].y];
    const dx1 = x1 - x2;
    const dx2 = x3 - x2;
    const dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2;
    const dy2 = y3 - y2;
    const dy3 = y0 - y1 + y2 - y3;
    let g = 0;
    let hh = 0;
    const den = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(den) > 1e-9 && (Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9)) {
      g = (dx3 * dy2 - dx2 * dy3) / den;
      hh = (dx1 * dy3 - dx3 * dy1) / den;
    }
    h.a = x1 - x0 + g * x1;
    h.b = x3 - x0 + hh * x3;
    h.c = x0;
    h.d = y1 - y0 + g * y1;
    h.e = y3 - y0 + hh * y3;
    h.f = y0;
    h.g = g;
    h.h = hh;
    return h;
  }
  const H = { a: 1, b: 0, c: 0, d: 0, e: 1, f: 0, g: 0, h: 0 };
  function hx(h, u, v) {
    return (h.a * u + h.b * v + h.c) / (h.g * u + h.h * v + 1);
  }
  function hy(h, u, v) {
    return (h.d * u + h.e * v + h.f) / (h.g * u + h.h * v + 1);
  }
  /** A filled polygon (screen points), inked at the building's line width times ink. */
  function fillPath(ctx, fill, ink) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (ink > 0) {
      ctx.strokeStyle = col(R, INK, 0);
      ctx.lineWidth = R.lw * ink;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }
  /** A quad of four projected points. */
  function quadPath(ctx, a, b, c, d) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
  }
  /** How a face pointing (nX, nV) in the lot is lit: a shade for its colour. */
  function lit(nX, nV) {
    const f = R.f;
    const wx = f.Rx * nX + f.Nx * nV;
    const wy = f.Ry * nX + f.Ny * nV;
    return Math.round((wx * LIGHT[0] + wy * LIGHT[1]) * 16 - 12);
  }

  /** The decals on a face, through its square-to-screen map; s(a) turns a decal's place along the wall into a share
      of the wall's width as seen from outside, t(z) its height into a share. */
  function decals(ctx, list, h, s, t, w, hgt) {
    for (const d of list) {
      const lv = d.lod == null ? 1 : d.lod;
      if (lv > R.lod) continue;
      if (lv >= 2) fine(ctx, () => decal(ctx, d, h, s, t, w, hgt));
      else decal(ctx, d, h, s, t, w, hgt);
    }
  }
  /** One decal (decals). */
  function decal(ctx, d, h, s, t, w, hgt) {
    if (d.k === "polys") {
      for (const pts of d.polys) {
        ctx.beginPath();
        pts.forEach(([a, z], i) => {
          const u = s(a);
          const v = t(z);
          if (i) ctx.lineTo(hx(h, u, v), hy(h, u, v));
          else ctx.moveTo(hx(h, u, v), hy(h, u, v));
        });
        ctx.closePath();
        fillPath(ctx, col(R, d.fill, 0), 0);
      }
      return;
    }
    if (d.k === "poly") {
      ctx.beginPath();
      d.pts.forEach(([a, z], i) => {
        const u = d.share ? a : s(a);
        const v = d.share ? z : t(z);
        if (i) ctx.lineTo(hx(h, u, v), hy(h, u, v));
        else ctx.moveTo(hx(h, u, v), hy(h, u, v));
      });
      ctx.closePath();
      fillPath(ctx, col(R, d.fill, 0), d.ink == null ? 0.7 : d.ink);
      return;
    }
    if (d.k === "disc") {
      ctx.beginPath();
      for (let i = 0; i < 14; i++) {
        const an = (i / 14) * TAU;
        const u = s(d.a + Math.cos(an) * d.r);
        const v = t(d.z + Math.sin(an) * d.r);
        if (i) ctx.lineTo(hx(h, u, v), hy(h, u, v));
        else ctx.moveTo(hx(h, u, v), hy(h, u, v));
      }
      ctx.closePath();
      fillPath(ctx, col(R, d.fill, 0), 0.7);
      if (d.fill === "#f3eee0") {
        // a clock's hands
        ctx.beginPath();
        ctx.moveTo(hx(h, s(d.a), t(d.z)), hy(h, s(d.a), t(d.z)));
        ctx.lineTo(hx(h, s(d.a), t(d.z + d.r * 0.7)), hy(h, s(d.a), t(d.z + d.r * 0.7)));
        ctx.moveTo(hx(h, s(d.a), t(d.z)), hy(h, s(d.a), t(d.z)));
        ctx.lineTo(hx(h, s(d.a + d.r * 0.5), t(d.z)), hy(h, s(d.a + d.r * 0.5), t(d.z)));
        ctx.strokeStyle = col(R, INK, 0);
        ctx.lineWidth = R.lw * 0.6;
        ctx.stroke();
      }
      return;
    }
    let u0 = d.share ? d.a0 : s(d.a0);
    let u1 = d.share ? d.a1 : s(d.a1);
    if (u0 > u1) [u0, u1] = [u1, u0];
    const v0 = d.share ? d.z0 : t(d.z0);
    const v1 = d.share ? d.z1 : t(d.z1);
    const corner = (u, v) => [hx(h, u, v), hy(h, u, v)];
    const box = (a0, a1, b0, b1) => {
      const p = [corner(a0, b0), corner(a1, b0), corner(a1, b1), corner(a0, b1)];
      ctx.beginPath();
      ctx.moveTo(p[0][0], p[0][1]);
      ctx.lineTo(p[1][0], p[1][1]);
      ctx.lineTo(p[2][0], p[2][1]);
      ctx.lineTo(p[3][0], p[3][1]);
      ctx.closePath();
    };
    if (d.k === "rect") {
      box(u0, u1, v0, v1);
      fillPath(ctx, col(R, d.fill, 0), d.ink == null ? 0.6 : d.ink);
    } else if (d.k === "lines") {
      ctx.strokeStyle = col(R, d.color, 0);
      ctx.lineWidth = Math.max(0.6, R.lw * 0.45);
      ctx.beginPath();
      if (d.vertical) {
        for (let a = d.a0 + d.step; a < d.a1; a += d.step) {
          const u = s(a);
          const p = corner(u, v0);
          const q = corner(u, v1);
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(q[0], q[1]);
        }
      } else {
        for (let z = d.z0 + d.step; z < d.z1; z += d.step) {
          const v = t(z);
          // (around the windows and doors listed in skipA)
          const spans = [[d.a0, d.a1]];
          if (d.skipA) for (const [k0, k1] of d.skipA) for (let i = spans.length - 1; i >= 0; i--) {
            const [p0, p1] = spans[i];
            if (k1 <= p0 || k0 >= p1) continue;
            spans.splice(i, 1, ...[[p0, k0], [k1, p1]].filter(([x0, x1]) => x1 > x0));
          }
          for (const [p0, p1] of spans) {
            const p = corner(s(p0), v);
            const q = corner(s(p1), v);
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(q[0], q[1]);
          }
        }
      }
      ctx.stroke();
    } else if (d.k === "win" || d.k === "door") {
      const fw = d.frame ? Math.min(3 / (w || 1), (u1 - u0) * 0.2) : 0;
      const fh = d.frame ? Math.min(3 / (hgt || 1), (v1 - v0) * 0.15) : 0;
      if (d.arch) {
        archPath(ctx, h, u0, u1, v0, v1);
        fillPath(ctx, col(R, d.frame || d.fill || d.glass, 0), 0.6);
        archPath(ctx, h, u0 + fw, u1 - fw, v0 + fh, v1 - fh);
        fillPath(ctx, col(R, d.k === "door" ? d.fill : d.glass, 0), 0);
      } else {
        box(u0, u1, v0, v1);
        fillPath(ctx, col(R, d.frame || d.fill, 0), 0.6);
        if (d.frame) {
          box(u0 + fw, u1 - fw, v0 + fh, v1 - fh);
          fillPath(ctx, col(R, d.k === "door" ? d.fill : d.glass, 0), 0);
        }
      }
      if (R.lod >= 2) fine(ctx, () => {
        const glassy = d.k === "win" || d.glassDoor;
        if (glassy) {
          // posters in the glass, a shine across it, the bars
          if (d.posters) d.posters.forEach((c, i) => {
            const n = d.posters.length;
            const pu = u0 + (u1 - u0) * ((i + 0.6) / (n + 0.6));
            const pw = Math.min((u1 - u0) * 0.14, (v1 - v0) * 0.5 * ((hgt || 1) / (w || 1)));
            box(pu - pw / 2, pu + pw / 2, v0 + (v1 - v0) * 0.38, v0 + (v1 - v0) * 0.82);
            fillPath(ctx, col(R, c, 0), 0.4);
          });
          ctx.beginPath();
          const sh = [corner(u0 + (u1 - u0) * 0.15, v0 + fh), corner(u0 + (u1 - u0) * 0.32, v0 + fh), corner(u0 + (u1 - u0) * 0.55, v1 - fh), corner(u0 + (u1 - u0) * 0.38, v1 - fh)];
          ctx.moveTo(sh[0][0], sh[0][1]);
          sh.slice(1).forEach((p) => ctx.lineTo(p[0], p[1]));
          ctx.closePath();
          ctx.fillStyle = col(R, "rgba(200,220,232,0.22)", 0);
          ctx.fill();
        }
        if (d.bars) {
          ctx.beginPath();
          for (let i = 1; i <= d.bars; i++) {
            const u = u0 + ((u1 - u0) * i) / (d.bars + 1);
            const p = corner(u, v0 + fh);
            const q = corner(u, v1 - fh);
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(q[0], q[1]);
          }
          ctx.strokeStyle = col(R, d.frame || INK, 0);
          ctx.lineWidth = Math.max(0.8, R.lw * 0.6);
          ctx.stroke();
        }
        if (d.knob) {
          const p = corner(u0 + (u1 - u0) * 0.8, v0 + (v1 - v0) * 0.45);
          ctx.beginPath();
          ctx.arc(p[0], p[1], Math.max(1, R.lw * 0.7), 0, TAU);
          ctx.fillStyle = col(R, "#d9a21b", 0);
          ctx.fill();
        }
        if (d.board) {
          // a plank nailed across
          const a = [corner(u0 - (u1 - u0) * 0.05, v0 + (v1 - v0) * 0.3), corner(u1 + (u1 - u0) * 0.05, v0 + (v1 - v0) * 0.62), corner(u1 + (u1 - u0) * 0.05, v0 + (v1 - v0) * 0.8), corner(u0 - (u1 - u0) * 0.05, v0 + (v1 - v0) * 0.48)];
          ctx.beginPath();
          ctx.moveTo(a[0][0], a[0][1]);
          a.slice(1).forEach((p) => ctx.lineTo(p[0], p[1]));
          ctx.closePath();
          fillPath(ctx, col(R, "#8a6a46", 0), 0.5);
        }
      });
    } else if (d.k === "roll") {
      box(u0, u1, v0, v1);
      fillPath(ctx, col(R, d.fill, 0), 0.6);
      ctx.beginPath();
      const n = Math.max(3, Math.round(((v1 - v0) * hgt) / 7));
      for (let i = 1; i < n; i++) {
        const v = v0 + ((v1 - v0) * i) / n;
        const p = corner(u0, v);
        const q = corner(u1, v);
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(q[0], q[1]);
      }
      ctx.strokeStyle = col(R, "rgba(30,32,36,0.45)", 0);
      ctx.lineWidth = Math.max(0.5, R.lw * 0.35);
      ctx.stroke();
      if (d.panes && R.lod >= 2) fine(ctx, () => {
        for (let i = 0; i < 4; i++) {
          box(u0 + ((u1 - u0) * (i + 0.15)) / 4, u0 + ((u1 - u0) * (i + 0.85)) / 4, v0 + (v1 - v0) * 0.6, v0 + (v1 - v0) * 0.78);
          fillPath(ctx, col(R, GLASS, 0), 0.4);
        }
      });
    } else if (d.k === "sign" || d.k === "img") {
      const tex = d.k === "sign" ? signTex(d, w * (u1 - u0), hgt * (v1 - v0)) : spriteTex(d);
      if (d.name && tex) d.textShare = tex.textShare; // (how tall its words are, for the name board)
      if (!tex) return;
      if (d.k === "sign" && d.bg) {
        box(u0, u1, v0, v1);
        fillPath(ctx, col(R, d.bg, 0), 0);
      }
      if (R.mixQ < 12) {
        ctx.save();
        ctx.globalAlpha *= 1 - R.mixQ / 12;
        texQuad(ctx, h, tex, u0, u1, v0, v1);
        ctx.restore();
      }
      if (d.k === "sign" && (d.bg || d.edge)) {
        box(u0, u1, v0, v1);
        fillPath(ctx, null, d.edge ? 0.8 : 0.6);
      }
    }
  }
  /** An arched window's outline (a square bottom, a round top). */
  function archPath(ctx, h, u0, u1, v0, v1) {
    const r = (u1 - u0) / 2;
    const mid = (u0 + u1) / 2;
    const rv = Math.min((v1 - v0) * 0.4, r * 1.2);
    ctx.beginPath();
    ctx.moveTo(hx(h, u0, v0), hy(h, u0, v0));
    ctx.lineTo(hx(h, u1, v0), hy(h, u1, v0));
    ctx.lineTo(hx(h, u1, v1 - rv), hy(h, u1, v1 - rv));
    for (let i = 1; i < 8; i++) {
      const a = (i / 8) * Math.PI;
      const u = mid + Math.cos(a) * r;
      const v = v1 - rv + Math.sin(a) * rv;
      ctx.lineTo(hx(h, u, v), hy(h, u, v));
    }
    ctx.lineTo(hx(h, u0, v1 - rv), hy(h, u0, v1 - rv));
    ctx.closePath();
  }
  /** A picture laid on a face region in strips (each strip's own affine map, so the perspective holds). Each strip
      is drawn in the picture's own pixels through its map (a destination as big as its source: drawn into a unit
      square, the browser would take it for a picture shrunk to a dot and blur it), a little past its right edge so
      no seam shows. */
  function texQuad(ctx, h, tex, u0, u1, v0, v1) {
    const wpx = Math.hypot(hx(h, u1, v1) - hx(h, u0, v1), hy(h, u1, v1) - hy(h, u0, v1));
    const n = clamp(Math.ceil(wpx / 60), 1, 10);
    const W = tex.width;
    const Ht = tex.height;
    const sw = W / n;
    for (let j = 0; j < n; j++) {
      const a = u0 + ((u1 - u0) * j) / n;
      const b = u0 + ((u1 - u0) * (j + 1)) / n;
      const tlx = hx(h, a, v1);
      const tly = hy(h, a, v1);
      const trx = hx(h, b, v1);
      const try_ = hy(h, b, v1);
      const blx = hx(h, a, v0);
      const bly = hy(h, a, v0);
      const x0 = sw * j;
      const ma = (trx - tlx) / sw;
      const mb = (try_ - tly) / sw;
      ctx.save();
      ctx.transform(ma, mb, (blx - tlx) / Ht, (bly - tly) / Ht, tlx - ma * x0, tly - mb * x0);
      const w = j < n - 1 ? Math.min(W - x0, sw * 1.03) : sw;
      ctx.drawImage(tex, x0, 0, w, Ht, x0, 0, w, Ht);
      ctx.restore();
    }
  }

  /* ---------- painted signs and landmark pictures ---------- */
  const texCache = new Map();
  /** A sign's picture: its words (the place's name, or `text`) fitted in its board, `fg` on `bg` (none: painted
      straight on the wall), a lightning bolt beside them for Signal Electronics. Cached by what is on it. */
  function signTex(d, wUnits, hUnits) {
    const text = d.name ? R.name : d.text;
    if (!text) return null;
    const w = clamp(Math.round(wUnits * SIGN_RES), 16, 1024);
    const hh = clamp(Math.round(hUnits * SIGN_RES), 8, 256);
    const key = "sign:" + text + "|" + w + "x" + hh + "|" + d.fg + d.bg + (d.bolt ? "b" : "") + (d.hand ? "h" : "");
    let c = texCache.get(key);
    if (c) return c;
    if (typeof document === "undefined" || !document.createElement) return null;
    c = document.createElement("canvas");
    c.width = w;
    c.height = hh;
    const g = c.getContext("2d");
    if (!g) return null;
    const room = d.bolt ? w * 0.86 : w * 0.92;
    let fs = Math.round(hh * 0.66);
    g.font = "700 " + fs + "px " + (d.hand ? "\"Comic Sans MS\", \"Marker Felt\", " + FONT : FONT);
    const tw = g.measureText(text).width;
    if (tw > room) fs = Math.max(6, Math.floor((fs * room) / tw));
    g.font = "700 " + fs + "px " + (d.hand ? "\"Comic Sans MS\", \"Marker Felt\", " + FONT : FONT);
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = d.fg || INK;
    const cx = d.bolt ? w * 0.54 : w / 2;
    g.fillText(text, cx, hh / 2 + fs * 0.04);
    if (d.bolt) {
      const s = hh * 0.8;
      const x = w * 0.06;
      const y = hh * 0.1;
      g.beginPath();
      g.moveTo(x + s * 0.55, y);
      g.lineTo(x + s * 0.15, y + s * 0.55);
      g.lineTo(x + s * 0.4, y + s * 0.55);
      g.lineTo(x + s * 0.25, y + s);
      g.lineTo(x + s * 0.7, y + s * 0.4);
      g.lineTo(x + s * 0.45, y + s * 0.4);
      g.closePath();
      g.fillStyle = d.fg || INK;
      g.fill();
    }
    c.textShare = fs / hh;
    if (texCache.size > 400) texCache.clear();
    texCache.set(key, c);
    return c;
  }
  function spriteTex(d) {
    const D3 = ZSR.Draw3;
    if (!D3 || !D3.hasSprite || !D3.hasSprite(d.name)) return null;
    return D3.sprite(d.name, d.opts || null);
  }

  /* ---------- the parts ---------- */
  const q8 = [0, 1, 2, 3, 4, 5, 6, 7].map(() => ({ x: 0, y: 0, s: 0, d: 0 }));
  /** Which walls of a box the camera sees: front (toward the drive), right, back, left. */
  function boxFaces(p) {
    const [x0, x1, v0, v1] = p.b;
    return [R.cV < v0, R.cX > x1, R.cV > v1, R.cX < x0];
  }
  function drawBox(ctx, p) {
    const [x0, x1, v0, v1, z0, z1] = p.b;
    // corners: 0..3 at the bottom (front left, front right, back right, back left), 4..7 the same at the top
    const pts = [[x0, v0], [x1, v0], [x1, v1], [x0, v1]];
    for (let i = 0; i < 4; i++) {
      if (!prj(pts[i][0], pts[i][1], z0, q8[i]) || !prj(pts[i][0], pts[i][1], z1, q8[i + 4])) return;
    }
    const see = boxFaces(p);
    // each wall from its outside left corner to its outside right one: front 0 -> 1, right 1 -> 2, back 2 -> 3,
    // left 3 -> 0; normals (X, V)
    const N = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const names = ["front", "right", "back", "left"];
    for (let i = 0; i < 4; i++) {
      if (!see[i]) continue;
      const a = i;
      const b = (i + 1) % 4;
      if (p.wall) {
        quadPath(ctx, q8[a], q8[b], q8[b + 4], q8[a + 4]);
        fillPath(ctx, col(R, p.wall, lit(N[i][0], N[i][1])), p.ink);
      }
      const list = p.faces[names[i]];
      if (list && list.length) {
        homog([q8[a], q8[b], q8[b + 4], q8[a + 4]], H);
        const w = i % 2 ? v1 - v0 : x1 - x0;
        const hgt = z1 - z0;
        // a decal's place along the wall as a share of it from the outside left corner
        const s = i === 0 ? (A) => (A - x0) / w : i === 1 ? (A) => (A - v0) / w : i === 2 ? (A) => (x1 - A) / w : (A) => (v1 - A) / w;
        const t = (Z) => (Z - z0) / hgt;
        decals(ctx, list, H, s, t, w, hgt);
      }
    }
    if (p.top && R.cZ > z1) {
      quadPath(ctx, q8[4], q8[5], q8[6], q8[7]);
      fillPath(ctx, col(R, p.top, 6), p.ink);
      if (p.dots && R.lod >= 2) fine(ctx, () => {
        // fruit heaped on a stand: rows of round dots
        homog([q8[4], q8[5], q8[6], q8[7]], H);
        const rad = Math.max(1, (q8[5].x - q8[4].x) * 0.045);
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 2; j++) {
            const u = (i + 0.5 + (j % 2) * 0.5) / 7.5;
            const v = (j + 0.5) / 2;
            ctx.beginPath();
            ctx.arc(hx(H, u, v), hy(H, u, v), rad, 0, TAU);
            fillPath(ctx, col(R, p.dots[(i + j) % p.dots.length], 0), 0.35);
          }
        }
      });
      if (p.deck && R.lod >= 1) {
        // planks across a deck
        ctx.beginPath();
        homog([q8[4], q8[5], q8[6], q8[7]], H);
        for (let v = v0 + 26; v < v1; v += 26) {
          const tt = (v - v0) / (v1 - v0);
          ctx.moveTo(hx(H, 0.02, tt), hy(H, 0.02, tt));
          ctx.lineTo(hx(H, 0.98, tt), hy(H, 0.98, tt));
        }
        ctx.strokeStyle = col(R, "rgba(60,40,20,0.5)", 0);
        ctx.lineWidth = Math.max(0.6, R.lw * 0.5);
        ctx.stroke();
      }
    }
  }
  function drawGable(ctx, p) {
    const [x0, x1, v0, v1, zw, zr] = p.w;
    const o = p.over;
    const dr = p.drop;
    const P4 = q8;
    if (p.alongX) {
      const vm = (v0 + v1) / 2;
      // the gable ends (on the walls' planes), then the two slopes over them
      for (const [x, side] of [[x0, -1], [x1, 1]]) {
        if (side < 0 ? R.cX >= x0 : R.cX <= x1) continue;
        if (!prj(x, v0, zw, P4[0]) || !prj(x, v1, zw, P4[1]) || !prj(x, vm, zr, P4[2])) continue;
        ctx.beginPath();
        ctx.moveTo(P4[0].x, P4[0].y);
        ctx.lineTo(P4[1].x, P4[1].y);
        ctx.lineTo(P4[2].x, P4[2].y);
        ctx.closePath();
        fillPath(ctx, col(R, p.wall, lit(side, 0)), 1);
        const list = p.faces[side < 0 ? "left" : "right"];
        if (list && R.lod >= 1) {
          // seen from outside: the left end's left is the back, the right end's the front
          if (!prj(x, side < 0 ? v1 : v0, zw, P4[4]) || !prj(x, side < 0 ? v0 : v1, zw, P4[5]) || !prj(x, side < 0 ? v0 : v1, zr, P4[6]) || !prj(x, side < 0 ? v1 : v0, zr, P4[7])) continue;
          homog([P4[4], P4[5], P4[6], P4[7]], H);
          decals(ctx, list, H, side < 0 ? (A) => (v1 - A) / (v1 - v0) : (A) => (A - v0) / (v1 - v0), (Z) => (Z - zw) / (zr - zw), v1 - v0, zr - zw);
        }
      }
      const slope = (vEave, sgn) => {
        // the slope from its eave (out past the wall, lower) up to the ridge, seen if the camera is above its plane
        const ev = vEave + sgn * o;
        const ez = zw - dr;
        const nv = sgn * (zr - ez);
        const nz = Math.abs(vm - ev);
        if (nv * (R.cV - ev) + nz * (R.cZ - ez) <= 0) return;
        if (!prj(x0 - o, ev, ez, P4[0]) || !prj(x1 + o, ev, ez, P4[1]) || !prj(x1 + o, vm, zr, P4[2]) || !prj(x0 - o, vm, zr, P4[3])) return;
        quadPath(ctx, P4[0], P4[1], P4[2], P4[3]);
        fillPath(ctx, col(R, p.roof, lit(0, sgn) + 4), 1);
        if (R.lod >= 2) fine(ctx, () => {
          // shingle rows
          ctx.beginPath();
          for (let i = 1; i < 5; i++) {
            const tt = i / 5;
            const ax = P4[0].x + (P4[3].x - P4[0].x) * tt;
            const ay = P4[0].y + (P4[3].y - P4[0].y) * tt;
            const bx = P4[1].x + (P4[2].x - P4[1].x) * tt;
            const by = P4[1].y + (P4[2].y - P4[1].y) * tt;
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
          }
          ctx.strokeStyle = col(R, "rgba(0,0,0,0.25)", 0);
          ctx.lineWidth = Math.max(0.5, R.lw * 0.4);
          ctx.stroke();
        });
      };
      // the far slope first
      if (R.cV > vm) {
        slope(v0, -1);
        slope(v1, 1);
      } else {
        slope(v1, 1);
        slope(v0, -1);
      }
    } else {
      const xm = (x0 + x1) / 2;
      for (const [v, side] of [[v0, -1], [v1, 1]]) {
        if (side < 0 ? R.cV >= v0 : R.cV <= v1) continue;
        if (!prj(x0, v, zw, P4[0]) || !prj(x1, v, zw, P4[1]) || !prj(xm, v, zr, P4[2])) continue;
        ctx.beginPath();
        ctx.moveTo(P4[0].x, P4[0].y);
        ctx.lineTo(P4[1].x, P4[1].y);
        ctx.lineTo(P4[2].x, P4[2].y);
        ctx.closePath();
        fillPath(ctx, col(R, p.wall, lit(0, side)), 1);
        const list = p.faces[side < 0 ? "front" : "back"];
        if (list && R.lod >= 1) {
          if (!prj(side < 0 ? x0 : x1, v, zw, P4[4]) || !prj(side < 0 ? x1 : x0, v, zw, P4[5]) || !prj(side < 0 ? x1 : x0, v, zr, P4[6]) || !prj(side < 0 ? x0 : x1, v, zr, P4[7])) continue;
          homog([P4[4], P4[5], P4[6], P4[7]], H);
          decals(ctx, list, H, side < 0 ? (A) => (A - x0) / (x1 - x0) : (A) => (x1 - A) / (x1 - x0), (Z) => (Z - zw) / (zr - zw), x1 - x0, zr - zw);
        }
      }
      const slope = (xEave, sgn) => {
        const ex = xEave + sgn * o;
        const ez = zw - dr;
        const nx = sgn * (zr - ez);
        const nz = Math.abs(xm - ex);
        if (nx * (R.cX - ex) + nz * (R.cZ - ez) <= 0) return;
        if (!prj(ex, v0 - o, ez, P4[0]) || !prj(ex, v1 + o, ez, P4[1]) || !prj(xm, v1 + o, zr, P4[2]) || !prj(xm, v0 - o, zr, P4[3])) return;
        quadPath(ctx, P4[0], P4[1], P4[2], P4[3]);
        fillPath(ctx, col(R, p.roof, lit(sgn, 0) + 4), 1);
      };
      if (R.cX > xm) {
        slope(x0, -1);
        slope(x1, 1);
      } else {
        slope(x1, 1);
        slope(x0, -1);
      }
    }
  }
  function drawQuad(ctx, p) {
    for (let i = 0; i < 4; i++) if (!prj(p.pts[i][0], p.pts[i][1], p.pts[i][2], q8[i])) return;
    // lit by which way it faces the camera (an awning's top or its underside)
    const a = p.pts[0];
    const b = p.pts[1];
    const c = p.pts[3];
    const ux = b[0] - a[0];
    const uv = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vv = c[1] - a[1];
    const vz = c[2] - a[2];
    const nX = uv * vz - uz * vv;
    const nV = uz * vx - ux * vz;
    const nZ = ux * vv - uv * vx;
    const toCam = nX * (R.cX - a[0]) + nV * (R.cV - a[1]) + nZ * (R.cZ - a[2]);
    const len = Math.hypot(nX, nV) || 1;
    const shadeAmt = toCam >= 0 ? (nZ !== 0 && Math.abs(nZ) > len ? 8 : lit(nX / len, nV / len)) : -34;
    quadPath(ctx, q8[0], q8[1], q8[2], q8[3]);
    fillPath(ctx, col(R, p.fill, shadeAmt), p.ink);
    if (p.decals && R.lod >= (toCam >= 0 ? 0 : 1)) {
      homog([q8[0], q8[1], q8[2], q8[3]], H);
      decals(ctx, p.decals, H, (A) => A, (Z) => Z, 1, 1);
      quadPath(ctx, q8[0], q8[1], q8[2], q8[3]);
      fillPath(ctx, null, p.ink);
    }
  }
  /** Points round a circle at height z, the facets the camera sees (a contiguous run), drawn as a wall each. */
  function ring(cx, cv, r, n, z, out, rot) {
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * TAU + (rot || 0);
      if (!prj(cx + Math.cos(a) * r, cv + Math.sin(a) * r, z, out[i] || (out[i] = {}))) return false;
    }
    return true;
  }
  const rA = [];
  const rB = [];
  function facetSeen(cx, cv, r, n, i, rot) {
    const a = ((i + 0.5) / n) * TAU + (rot || 0);
    const nx = Math.cos(a);
    const nv = Math.sin(a);
    return nx * (R.cX - cx - nx * r) + nv * (R.cV - cv - nv * r) > 0;
  }
  function drawCyl(ctx, p, r0, r1, z0, z1, fill, n, bands, cap) {
    const [cx, cv] = p.c;
    if (!ring(cx, cv, r0, n, z0, rA) || !ring(cx, cv, r1, n, z1, rB)) return;
    for (let i = 0; i < n; i++) {
      if (!facetSeen(cx, cv, (r0 + r1) / 2, n, i)) continue;
      const a = ((i + 0.5) / n) * TAU;
      const c = col(R, fill, lit(Math.cos(a), Math.sin(a)));
      quadPath(ctx, rA[i], rA[i + 1], rB[i + 1], rB[i]);
      ctx.fillStyle = c;
      ctx.fill();
      ctx.strokeStyle = c;
      ctx.lineWidth = 1;
      ctx.stroke();
      if (bands && R.lod >= 1) {
        for (const [b0, b1, bc] of bands) {
          const t0 = (b0 - z0) / (z1 - z0);
          const t1 = (b1 - z0) / (z1 - z0);
          const m = (P, Q, t) => ({ x: P.x + (Q.x - P.x) * t, y: P.y + (Q.y - P.y) * t });
          quadPath(ctx, m(rA[i], rB[i], t0), m(rA[i + 1], rB[i + 1], t0), m(rA[i + 1], rB[i + 1], t1), m(rA[i], rB[i], t1));
          const cc = col(R, bc, lit(Math.cos(a), Math.sin(a)));
          ctx.fillStyle = cc;
          ctx.fill();
          ctx.strokeStyle = cc;
          ctx.stroke();
        }
      }
    }
    // the outline: the run's two edges and its bottom and top
    const seen = [];
    for (let i = 0; i < n; i++) seen.push(facetSeen(cx, cv, (r0 + r1) / 2, n, i));
    let start = seen.findIndex((s, i) => s && !seen[(i - 1 + n) % n]);
    if (start < 0 && seen[0]) start = 0;
    if (start >= 0 && p.ink) {
      ctx.beginPath();
      let i = start;
      let cnt = 0;
      ctx.moveTo(rB[i].x, rB[i].y);
      ctx.lineTo(rA[i].x, rA[i].y);
      while (seen[i] && cnt < n) {
        ctx.lineTo(rA[i + 1].x, rA[i + 1].y);
        i = (i + 1) % n;
        cnt++;
        if (i === 0 && cnt < n) ctx.moveTo(rA[0].x, rA[0].y);
      }
      ctx.lineTo(rB[i === 0 ? n : i].x, rB[i === 0 ? n : i].y);
      ctx.strokeStyle = col(R, INK, 0);
      ctx.lineWidth = R.lw * p.ink;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    if (cap && R.cZ > z1) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) (i ? ctx.lineTo : ctx.moveTo).call(ctx, rB[i].x, rB[i].y);
      ctx.closePath();
      fillPath(ctx, col(R, cap, 8), p.ink);
    } else if (p.ink && start >= 0) {
      ctx.beginPath();
      let i = start;
      let cnt = 0;
      ctx.moveTo(rB[i].x, rB[i].y);
      while (seen[i] && cnt < n) {
        ctx.lineTo(rB[i + 1].x, rB[i + 1].y);
        i = (i + 1) % n;
        cnt++;
        if (i === 0 && cnt < n) ctx.moveTo(rB[0].x, rB[0].y);
      }
      ctx.strokeStyle = col(R, INK, 0);
      ctx.lineWidth = R.lw * p.ink;
      ctx.stroke();
    }
  }
  function drawCone(ctx, p, cx, cv, r, z0, z1, fill, n, rot) {
    if (!ring(cx, cv, r, n, z0, rA, rot)) return;
    const apex = q8[0];
    if (!prj(cx, cv, z1, apex)) return;
    const h = z1 - z0;
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.5) / n) * TAU + (rot || 0);
      const nx = Math.cos(a) * h;
      const nv = Math.sin(a) * h;
      const nz = r * Math.cos(Math.PI / n);
      const bx = cx + Math.cos(a) * r * Math.cos(Math.PI / n);
      const bv = cv + Math.sin(a) * r * Math.cos(Math.PI / n);
      if (nx * (R.cX - bx) + nv * (R.cV - bv) + nz * (R.cZ - z0) <= 0) continue;
      ctx.beginPath();
      ctx.moveTo(rA[i].x, rA[i].y);
      ctx.lineTo(rA[i + 1].x, rA[i + 1].y);
      ctx.lineTo(apex.x, apex.y);
      ctx.closePath();
      fillPath(ctx, col(R, fill, lit(Math.cos(a), Math.sin(a)) + 6), n <= 6 ? 1 : 0);
      if (n > 6) {
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    if (n > 6 && p.ink) {
      // its rim toward the camera
      ctx.beginPath();
      let on = false;
      for (let i = 0; i < n; i++) {
        const a = ((i + 0.5) / n) * TAU + (rot || 0);
        const front = Math.cos(a) * (R.cX - cx) + Math.sin(a) * (R.cV - cv) > 0;
        if (front) {
          if (!on) ctx.moveTo(rA[i].x, rA[i].y);
          ctx.lineTo(rA[i + 1].x, rA[i + 1].y);
          on = true;
        } else on = false;
      }
      ctx.strokeStyle = col(R, INK, 0);
      ctx.lineWidth = R.lw;
      ctx.stroke();
    }
  }
  /** A dome: bands of facets up to its top, lit as they turn, inked only round its outline (its two sides as the camera
      sees them and its foot toward the camera). */
  function drawDome(ctx, p) {
    const [cx, cv] = p.c;
    const [z0, z1] = p.z;
    const n = R.lod >= 1 ? p.n : 8;
    const K = R.lod >= 1 ? 6 : 3;
    const rings = [];
    for (let j = 0; j <= K; j++) {
      const t = (j / K) * (Math.PI / 2);
      const ring = [];
      const r = p.r * Math.cos(t);
      const z = z0 + (z1 - z0) * Math.sin(t);
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * TAU;
        const o = {};
        if (!prj(cx + Math.cos(a) * r, cv + Math.sin(a) * r, z, o)) return;
        ring.push(o);
      }
      rings.push(ring);
    }
    for (let j = 0; j < K; j++) {
      const tm = ((j + 0.5) / K) * (Math.PI / 2);
      for (let i = 0; i < n; i++) {
        const a = ((i + 0.5) / n) * TAU;
        // the band's outward normal there, and whether the camera is outside it
        const nx = Math.cos(a) * Math.cos(tm);
        const nv = Math.sin(a) * Math.cos(tm);
        const nz = Math.sin(tm);
        const px = cx + nx * p.r;
        const pv = cv + nv * p.r;
        const pz = z0 + nz * (z1 - z0);
        if (nx * (R.cX - px) + nv * (R.cV - pv) + nz * (R.cZ - pz) <= 0) continue;
        const A = rings[j];
        const B = rings[j + 1];
        quadPath(ctx, A[i], A[i + 1], B[i + 1], B[i]);
        const c = col(R, p.fill, lit(Math.cos(a), Math.sin(a)) * (1 - nz) + Math.round(nz * 12));
        ctx.fillStyle = c;
        ctx.fill();
        ctx.strokeStyle = c;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    // the outline: each ring's leftmost and rightmost point on the screen, up one side and down the other
    const L = [];
    const Rt = [];
    for (const ring of rings) {
      let lo = ring[0];
      let hi = ring[0];
      for (const o of ring) {
        if (o.x < lo.x) lo = o;
        if (o.x > hi.x) hi = o;
      }
      L.push(lo);
      Rt.push(hi);
    }
    ctx.beginPath();
    L.forEach((o, i) => (i ? ctx.lineTo(o.x, o.y) : ctx.moveTo(o.x, o.y)));
    for (let i = Rt.length - 1; i >= 0; i--) ctx.lineTo(Rt[i].x, Rt[i].y);
    ctx.strokeStyle = col(R, INK, 0);
    ctx.lineWidth = R.lw;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  /** A log lying along X: the sides of its eight-sided bark the camera sees, then whichever cut end faces it. */
  function drawLog(ctx, p) {
    const [x0, x1] = p.x;
    const [cv, cz] = p.c;
    const n = 8;
    const A = [];
    const B = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * TAU;
      const v = cv + Math.cos(a) * p.r;
      const z = cz + Math.sin(a) * p.r;
      if (!prj(x0, v, z, (A[i] = {})) || !prj(x1, v, z, (B[i] = {}))) return;
    }
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.5) / n) * TAU;
      const nv = Math.cos(a);
      const nz = Math.sin(a);
      if (nv * (R.cV - cv - nv * p.r) + nz * (R.cZ - cz - nz * p.r) <= 0) continue;
      quadPath(ctx, A[i], B[i], B[i + 1], A[i + 1]);
      const c = col(R, p.fill, Math.round(nz * 16 + lit(0, nv) * 0.5));
      ctx.fillStyle = c;
      ctx.fill();
      ctx.strokeStyle = nz > 0.3 ? col(R, "rgba(40,24,10,0.5)", 0) : c;
      ctx.lineWidth = Math.max(0.6, R.lw * 0.4);
      ctx.stroke();
    }
    const cap = R.cX < x0 ? A : R.cX > x1 ? B : null;
    if (cap) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) (i ? ctx.lineTo : ctx.moveTo).call(ctx, cap[i].x, cap[i].y);
      ctx.closePath();
      fillPath(ctx, col(R, p.end, 0), 0.8);
    }
  }
  /** Beams: each a quad between its ends, as thick as w at each end's distance (thin far off: a line). */
  function drawBeams(ctx, p) {
    const A = q8[0];
    const B = q8[1];
    const fill = col(R, p.fill, 0);
    const ink = col(R, INK, 0);
    for (const [a, b] of p.segs) {
      if (!prj(a[0], a[1], a[2], A) || !prj(b[0], b[1], b[2], B)) continue;
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const wa = p.w * A.s;
      const wb = p.w * B.s;
      if (wa + wb < 1.6) {
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.strokeStyle = p.ink ? ink : fill;
        ctx.lineWidth = Math.max(0.6, wa + wb);
        ctx.stroke();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(A.x + nx * wa, A.y + ny * wa);
      ctx.lineTo(B.x + nx * wb, B.y + ny * wb);
      ctx.lineTo(B.x - nx * wb, B.y - ny * wb);
      ctx.lineTo(A.x - nx * wa, A.y - ny * wa);
      ctx.closePath();
      fillPath(ctx, fill, p.ink ? Math.min(1, 0.4 + (wa + wb) / 8) * 0.8 : 0);
    }
  }
  function drawSprite(ctx, p) {
    const D3 = ZSR.Draw3;
    if (!D3 || !D3.hasSprite || !D3.hasSprite(p.name)) return;
    const pic = D3.sprite(p.name, p.opts);
    if (!pic || !(pic.width > 0)) return;
    const foot = q8[0];
    const head = q8[1];
    if (!prj(p.at[0], p.at[1], p.at[2], foot) || !prj(p.at[0], p.at[1], p.at[2] + p.h, head)) return;
    const hpx = foot.y - head.y;
    if (hpx < 2) return;
    const wpx = p.h * (p.aspect || pic.width / pic.height) * foot.s;
    ctx.save();
    if (R.mixQ) ctx.globalAlpha *= 1 - R.mixQ / 20;
    ctx.transform(p.flip ? -1 : 1, 0, (-(head.x - foot.x) / hpx) * 0.4, 1, foot.x, foot.y);
    ctx.drawImage(pic, -wpx / 2, -hpx, wpx, hpx);
    ctx.restore();
  }
  /** A glass house: the far walls and roof seen through the near ones, its beds inside, then the near glass. */
  function drawGlass(ctx, p) {
    const [x0, x1, v0, v1] = p.b;
    const zw = p.z0;
    const zr = p.z1;
    const xm = (x0 + x1) / 2;
    // its faces: walls (4) and the two roof slopes, each a list of lot points, and whether the camera is outside it
    const faces = [
      { pts: [[x0, v0, 0], [x1, v0, 0], [x1, v0, zw], [xm, v0, zr], [x0, v0, zw]], out: R.cV < v0, end: true, door: true },
      { pts: [[x1, v1, 0], [x0, v1, 0], [x0, v1, zw], [xm, v1, zr], [x1, v1, zw]], out: R.cV > v1, end: true },
      { pts: [[x0, v1, 0], [x0, v0, 0], [x0, v0, zw], [x0, v1, zw]], out: R.cX < x0 },
      { pts: [[x1, v0, 0], [x1, v1, 0], [x1, v1, zw], [x1, v0, zw]], out: R.cX > x1 },
      { pts: [[x0, v0, zw], [x0, v1, zw], [xm, v1, zr], [xm, v0, zr]], out: (zr - zw) * -(R.cX - x0) + (xm - x0) * (R.cZ - zw) > 0, roof: true },
      { pts: [[x1, v1, zw], [x1, v0, zw], [xm, v0, zr], [xm, v1, zr]], out: (zr - zw) * (R.cX - x1) + (x1 - xm) * (R.cZ - zw) > 0, roof: true },
    ];
    const tint = col(R, p.tint, 0);
    const frame = col(R, p.frame, 0);
    const pane = (f) => {
      const s = f.pts.map(() => ({}));
      for (let i = 0; i < f.pts.length; i++) if (!prj(f.pts[i][0], f.pts[i][1], f.pts[i][2], s[i])) return;
      ctx.beginPath();
      s.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
      ctx.closePath();
      ctx.fillStyle = tint;
      ctx.fill();
      if (R.lod >= 1) {
        // the frame: uprights along the face (up to the eaves, or to the slope on a gable end), a rail at half height
        ctx.beginPath();
        const a = f.pts[0];
        const b = f.pts[1];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const n = Math.max(2, Math.round(L / p.step));
        const Q = {};
        const Q2 = {};
        for (let i = 1; i < n; i++) {
          const t = i / n;
          const X = a[0] + (b[0] - a[0]) * t;
          const V = a[1] + (b[1] - a[1]) * t;
          if (f.roof) {
            const c = f.pts[3];
            const d = f.pts[2];
            const X2 = c[0] + (d[0] - c[0]) * t;
            const V2 = c[1] + (d[1] - c[1]) * t;
            if (prj(X, V, a[2], Q) && prj(X2, V2, c[2], Q2)) {
              ctx.moveTo(Q.x, Q.y);
              ctx.lineTo(Q2.x, Q2.y);
            }
          } else {
            const top = f.end ? zw + (zr - zw) * (1 - Math.abs(t - 0.5) * 2) : zw;
            if (prj(X, V, 0, Q) && prj(X, V, top, Q2)) {
              ctx.moveTo(Q.x, Q.y);
              ctx.lineTo(Q2.x, Q2.y);
            }
          }
        }
        if (!f.roof && prj(a[0], a[1], zw * 0.5, Q) && prj(b[0], b[1], zw * 0.5, Q2)) {
          ctx.moveTo(Q.x, Q.y);
          ctx.lineTo(Q2.x, Q2.y);
        }
        ctx.strokeStyle = frame;
        ctx.lineWidth = Math.max(0.7, R.lw * 0.6);
        ctx.stroke();
      }
      ctx.beginPath();
      s.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
      ctx.closePath();
      ctx.strokeStyle = col(R, INK, 0);
      ctx.lineWidth = R.lw * 0.9;
      ctx.lineJoin = "round";
      ctx.stroke();
      if (f.door && p.door && R.lod >= 1) {
        const [d0, d1] = p.door;
        const c = [[d0, v0, 0], [d1, v0, 0], [d1, v0, zw * 0.95], [d0, v0, zw * 0.95]].map((q) => {
          const o = {};
          return prj(q[0], q[1], q[2], o) ? o : null;
        });
        if (c.every(Boolean)) {
          quadPath(ctx, c[0], c[1], c[2], c[3]);
          fillPath(ctx, col(R, "rgba(233,236,223,0.55)", 0), 0.8);
        }
      }
    };
    for (const f of faces) if (!f.out) pane(f);
    // the beds inside, the far ones first
    const beds = p.beds.slice().sort((a, b) => Math.hypot((b[0] + b[1]) / 2 - R.cX, (b[2] + b[3]) / 2 - R.cV) - Math.hypot((a[0] + a[1]) / 2 - R.cX, (a[2] + a[3]) / 2 - R.cV));
    for (const [bx0, bx1, bv0, bv1, bz, bc] of beds) {
      const bp = { t: "box", b: [bx0, bx1, bv0, bv1, 0, bz], wall: "#6b4a2e", top: bc, faces: {}, ink: 0.6 };
      drawBox(ctx, bp);
      if (R.lod >= 2) fine(ctx, () => {
        // leaves over the bed
        const o = {};
        for (let i = 0; i < 6; i++) {
          const X = bx0 + ((bx1 - bx0) * (i % 2 ? 0.3 : 0.7));
          const V = bv0 + ((bv1 - bv0) * (i + 0.5)) / 6;
          if (!prj(X, V, bz + 8, o)) continue;
          ctx.beginPath();
          ctx.ellipse(o.x, o.y, 9 * o.s, 6 * o.s, 0, 0, TAU);
          fillPath(ctx, col(R, i % 3 ? "#4f8a3a" : "#6faa4a", 0), 0.5);
        }
      });
    }
    for (const f of faces) if (f.out && !f.roof) pane(f);
    for (const f of faces) if (f.out && f.roof) pane(f);
  }
  /** The Water Tower's tank: the catwalk's far half and rail, the tank with its band, its roof, the near catwalk
      and rail, then Jo's antenna on its three guy wires with the light at its tip. */
  function drawTank(ctx, p) {
    const [cx, cv] = p.c;
    const [z0, z1, zc] = p.z;
    const n = R.lod >= 1 ? 16 : 10;
    const rw = p.walk;
    const toCam = Math.atan2(R.cV - cv, R.cX - cx);
    const half = (near) => {
      // the catwalk ring's half toward (or away from) the camera: deck and rail posts
      const pts = [];
      for (let i = 0; i <= 8; i++) {
        const a = toCam + (near ? -Math.PI / 2 : Math.PI / 2) + (i / 8) * Math.PI;
        pts.push(a);
      }
      const o = {};
      const i2 = {};
      ctx.beginPath();
      let ok = true;
      pts.forEach((a, i) => {
        if (!prj(cx + Math.cos(a) * rw, cv + Math.sin(a) * rw, z0, o)) ok = false;
        else if (i) ctx.lineTo(o.x, o.y);
        else ctx.moveTo(o.x, o.y);
      });
      for (let i = pts.length - 1; i >= 0; i--) {
        const a = pts[i];
        if (!prj(cx + Math.cos(a) * p.r, cv + Math.sin(a) * p.r, z0, o)) ok = false;
        else ctx.lineTo(o.x, o.y);
      }
      ctx.closePath();
      if (ok) fillPath(ctx, col(R, "#6f767c", 0), 0.6);
      if (R.lod >= 1) {
        // the rail: posts and the top rail
        ctx.beginPath();
        pts.forEach((a, i) => {
          if (prj(cx + Math.cos(a) * rw, cv + Math.sin(a) * rw, z0, o) && prj(cx + Math.cos(a) * rw, cv + Math.sin(a) * rw, z0 + p.rail, i2)) {
            ctx.moveTo(o.x, o.y);
            ctx.lineTo(i2.x, i2.y);
          }
        });
        let first = true;
        pts.forEach((a) => {
          if (!prj(cx + Math.cos(a) * rw, cv + Math.sin(a) * rw, z0 + p.rail, o)) return;
          if (first) ctx.moveTo(o.x, o.y);
          else ctx.lineTo(o.x, o.y);
          first = false;
        });
        ctx.strokeStyle = col(R, "#3a3d42", 0);
        ctx.lineWidth = Math.max(0.8, R.lw * 0.6);
        ctx.stroke();
      }
    };
    half(false);
    drawCyl(ctx, { c: p.c, ink: 1 }, p.r, p.r, z0, z1, "#b9c3c6", n, R.lod >= 1 ? [[z0 + 52, z0 + 68, "#3f6f9a"]] : null, null);
    drawCone(ctx, { ink: 1 }, cx, cv, p.r + 6, z1, zc, "#9aa6aa", n);
    // the lip under the roof
    half(true);
    // the antenna: a mast from the roof's point, three guy wires down to the catwalk rail, a red light on top
    const top = zc + p.mast;
    const A = q8[2];
    const B = q8[3];
    if (prj(cx, cv, zc - 4, A) && prj(cx, cv, top, B)) {
      ctx.strokeStyle = col(R, "#2f3136", 0);
      ctx.lineWidth = Math.max(1, 3 * A.s);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
      if (R.lod >= 1) {
        ctx.lineWidth = Math.max(0.6, 1.2 * A.s);
        ctx.beginPath();
        const o = {};
        const mid = {};
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * TAU + 0.4;
          if (!prj(cx + Math.cos(a) * rw, cv + Math.sin(a) * rw, z0 + p.rail, o) || !prj(cx, cv, zc + p.mast * 0.7, mid)) continue;
          ctx.moveTo(mid.x, mid.y);
          ctx.lineTo(o.x, o.y);
        }
        // little cross bars near the tip
        for (const f of [0.82, 0.92]) {
          const L = {};
          const Rr = {};
          if (prj(cx - 9, cv, zc + p.mast * f, L) && prj(cx + 9, cv, zc + p.mast * f, Rr)) {
            ctx.moveTo(L.x, L.y);
            ctx.lineTo(Rr.x, Rr.y);
          }
        }
        ctx.stroke();
      }
      // the light: steady by day, blinking at night (and seen far off)
      const on = !R.night || Math.floor(R.time * 1.2) % 2 === 0;
      if (on && R.night) {
        // at night it shines through the dark: drawn after the night's overlay (game.js draw: drawLights)
        PB.lights.push({ x: B.x, y: B.y, s: B.s, a: R.lightA });
      } else if (on) {
        ctx.beginPath();
        ctx.arc(B.x, B.y, Math.max(1.6, 5 * B.s), 0, TAU);
        ctx.fillStyle = col(R, "#d0302a", 0);
        ctx.fill();
      }
    }
  }
  /** Draw a building's finest details (lod 2: small parts, panes, posters, shingles, fruit) faded in by R.fine as
      the building grows past PROP_PX on the screen, so they never pop in all at once. */
  function fine(ctx, draw) {
    if (R.fine >= 1) return draw();
    ctx.save();
    ctx.globalAlpha *= R.fine;
    draw();
    ctx.restore();
  }
  function drawPart(ctx, p) {
    if (p.lod >= 2 && R.fine < 1) return fine(ctx, () => drawPart1(ctx, p));
    return drawPart1(ctx, p);
  }
  function drawPart1(ctx, p) {
    switch (p.t) {
      case "box":
        return drawBox(ctx, p);
      case "gable":
        return drawGable(ctx, p);
      case "quad":
        return drawQuad(ctx, p);
      case "cyl":
        return drawCyl(ctx, p, p.r, p.r, p.z[0], p.z[1], p.fill, R.lod >= 1 ? p.n : Math.max(6, p.n >> 1), p.bands, p.cap);
      case "cone":
        return drawCone(ctx, p, p.c[0], p.c[1], p.r, p.z[0], p.z[1], p.fill, p.n, p.rot);
      case "beams":
        return drawBeams(ctx, p);
      case "sprite":
        return drawSprite(ctx, p);
      case "glass":
        return drawGlass(ctx, p);
      case "tank":
        return drawTank(ctx, p);
      case "log":
        return drawLog(ctx, p);
      case "dome":
        return drawDome(ctx, p);
      default:
    }
  }

  /* ---------- which part is drawn first ---------- */
  /** Along one axis: -1 if a must be drawn before b (the camera, at c, is on b's side of a plane between them), 1 if
      after, 0 if the camera is between them (either way), 2 if they overlap on this axis. */
  function axis(a0, a1, b0, b1, c) {
    if (a1 <= b0) return c >= b0 ? -1 : c <= a1 ? 1 : 0;
    if (b1 <= a0) return c >= a0 ? 1 : c <= b1 ? -1 : 0;
    return 2;
  }
  /** -1: box a first, 1: box b first, 0: either, 2: they overlap (no wall plane between them). */
  function cmp(a, b) {
    const x = axis(a[0], a[1], b[0], b[1], R.cX);
    if (x === -1 || x === 1) return x;
    const v = axis(a[2], a[3], b[2], b[3], R.cV);
    if (v === -1 || v === 1) return v;
    const z = axis(a[4], a[5], b[4], b[5], R.cZ);
    if (z === -1 || z === 1) return z;
    return x === 2 && v === 2 && z === 2 ? 2 : 0;
  }
  /** The parts in drawing order for this camera: every "a in front of b" a wall plane shows, and every part drawn
      after those it stands on (after); else the farthest first. */
  function orderParts(parts) {
    const n = parts.length;
    const out = [];
    const indeg = new Array(n).fill(0);
    const next = parts.map(() => []);
    const idx = new Map(parts.map((p, i) => [p, i]));
    for (let i = 0; i < n; i++) {
      const pi = parts[i];
      if (pi.after) for (const q of pi.after) {
        const j = idx.get(q);
        if (j != null) {
          next[j].push(i);
          indeg[i]++;
        }
      }
      for (let j = i + 1; j < n; j++) {
        // (two parts that do not overlap on the screen need no order)
        const a = pi._sb;
        const q = parts[j]._sb;
        if (a && q && (a[2] < q[0] || a[0] > q[2] || a[3] < q[1] || a[1] > q[3])) continue;
        const c = cmp(pi.b, parts[j].b);
        if (c === -1) {
          next[i].push(j);
          indeg[j]++;
        } else if (c === 1) {
          next[j].push(i);
          indeg[i]++;
        }
      }
    }
    const far = parts.map((p) => Math.hypot((p.b[0] + p.b[1]) / 2 - R.cX, (p.b[2] + p.b[3]) / 2 - R.cV));
    const done = new Array(n).fill(false);
    for (let k = 0; k < n; k++) {
      let best = -1;
      for (let i = 0; i < n; i++) if (!done[i] && indeg[i] === 0 && (best < 0 || far[i] > far[best])) best = i;
      // (a ring of "in front of"s, which boxes that overlap can make: the farthest left goes next)
      if (best < 0) for (let i = 0; i < n; i++) if (!done[i] && (best < 0 || far[i] > far[best])) best = i;
      done[best] = true;
      out.push(best);
      for (const j of next[best]) indeg[j]--;
    }
    return out;
  }

  /** A lot box's screen box [x0, y0, x1, y1] (its eight corners; everything when one is behind the camera). */
  function screenBox(b, out) {
    const o = q8[7];
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (let i = 0; i < 8; i++) {
      if (!prj(b[i & 1], b[2 + ((i >> 1) & 1)], b[4 + (i >> 2)], o)) {
        out[0] = out[1] = -1e9;
        out[2] = out[3] = 1e9;
        return out;
      }
      if (o.x < x0) x0 = o.x;
      if (o.x > x1) x1 = o.x;
      if (o.y < y0) y0 = o.y;
      if (o.y > y1) y1 = o.y;
    }
    out[0] = x0;
    out[1] = y0;
    out[2] = x1;
    out[3] = y1;
    return out;
  }

  /* ---------- records: a lot's building (or a side street's end), made once a drive ---------- */
  function lotFrameUnits() {
    const G = ZSR.Streets.GEOM;
    const V0 = G.half + G.shoulder + G.lotGap;
    return { G, half: G.half, V0, V1: V0 + G.lotDepth, F: V0 + LOT_FRONT, BK: V0 + G.lotDepth - 18, W: G.lotHalf - 22, LH: G.lotHalf };
  }
  function finish(rec) {
    const b = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
    for (const p of rec.parts) for (let i = 0; i < 6; i++) b[i] = i % 2 ? Math.max(b[i], p.b[i]) : Math.min(b[i], p.b[i]);
    rec.bounds = b;
    const c = world(rec.f, (b[0] + b[1]) / 2, (b[2] + b[3]) / 2);
    rec.cx = c.x;
    rec.cy = c.y;
    rec.reach = Math.hypot(b[1] - b[0], b[3] - b[2]) / 2;
    // the name's sign: the decal with name, its wall and place
    for (const p of rec.parts) {
      for (const face of ["front", "right", "back", "left"]) {
        const list = p.faces && p.faces[face];
        const d = list && list.find((x) => x.name);
        if (d) rec.sign = signGeom(rec, p, face, d);
      }
    }
    return rec;
  }
  /** Where a name sign is: its four lot corners as seen from outside (bottom left first) and its wall's normal. */
  function signGeom(rec, p, face, d) {
    const [x0, x1, v0, v1] = p.b;
    const a0 = Math.min(d.a0, d.a1);
    const a1 = Math.max(d.a0, d.a1);
    let pts;
    let n;
    if (face === "front") {
      pts = [[a0, v0], [a1, v0]];
      n = [0, -1];
    } else if (face === "back") {
      pts = [[a1, v1], [a0, v1]];
      n = [0, 1];
    } else if (face === "left") {
      pts = [[x0, a1], [x0, a0]];
      n = [-1, 0];
    } else {
      pts = [[x1, a0], [x1, a1]];
      n = [1, 0];
    }
    return { p, face, d, pts, n, z0: d.z0, z1: d.z1, X: (pts[0][0] + pts[1][0]) / 2, V: (pts[0][1] + pts[1][1]) / 2, w: a1 - a0 };
  }

  const PB = {
    LANDMARK_SEEN,
    DETAIL_PX,
    PROP_PX,
    NEAR,
    LOT_FRONT,
    TOWER_TOP,
    // part of the card's ground squares' key (js/perspective-gl.js): the flat pictures this file stands up are left
    // out of them; a change to what is left out, or to a lot's ground, changes this
    GROUND_KEY: "standing-1",
    // SCALE: a new place's building is a row here; a later file (js/perspective-buildings2.js, after this one in
    // index.html and tests/validate-drive.js) adds its rows with Object.assign(ZSR.PerspBuild.ROWS, { ... }), built
    // with the same pieces (kit)
    ROWS,
    ENDS,
    kit: { win, door, rect, lines, sign, img, roll, shape, disc, windows, windowsV, boarded, cross, flag, stripesAlong, scallops, shadeHex, colors: { SIDING, TRIM, SAGE, GLASS, INK } },
    // this frame's lights that shine at night (the Water Tower's antenna light), in screen px: drawLights
    lights: [],
    // this frame's cost (tests, perf probes): buildings and ends drawn, parts drawn, ms, items sorted into one
    stats: { buildings: 0, ends: 0, parts: 0, ms: 0, slotted: 0, skyline: 0 },

    /** A place's row (null: Persp.building's plain box). */
    row(id) {
      return Object.prototype.hasOwnProperty.call(ROWS, id) ? ROWS[id] : null;
    },
    /** A lot's building, made once (kept on the lot, which is made once a drive). */
    rec(l) {
      if (l._bld !== undefined) return l._bld;
      const row = this.row(l.node);
      if (!row) return (l._bld = null);
      const b = new Builder();
      row.build(b, lotFrameUnits());
      const rec = { kind: "lot", id: l.node, row, landmark: !!row.landmark, f: frameOfLot(l), parts: b.parts, sign: null };
      return (l._bld = finish(rec));
    },
    /** A side street's end, standing (null for a kind with no row). */
    endRec(s) {
      if (s._end !== undefined) return s._end;
      const fn = ENDS[s.kind];
      if (!fn) return (s._end = null);
      const b = new Builder();
      fn(b, ZSR.Streets.GEOM);
      return (s._end = finish({ kind: "end", id: s.name, f: frameOfSide(s), parts: b.parts, sign: null }));
    },
    /** What Draw.lot lays on the ground for a lot under the angled camera (the building's own surface, no flat
        building, canopy or dock: they stand). */
    lotGround(l) {
      const row = this.row(l.node);
      const gr = (row && row.ground) || {};
      return { standing: true, surface: gr.surface, stripes: gr.stripes !== false, extra: gr.extra || null };
    },
    /** The parts a walker cannot walk through, as world corners (for a push-out: every part on the ground that is
        solid, its box's four corners). */
    solids(l) {
      const rec = this.rec(l);
      if (!rec) return [];
      return rec.parts
        .filter((p) => (p.t === "box" || p.t === "cyl" || p.t === "glass") && p.b[4] <= 1 && p.b[5] >= 30 && p.solid !== false)
        .map((p) => [[p.b[0], p.b[2]], [p.b[1], p.b[2]], [p.b[1], p.b[3]], [p.b[0], p.b[3]]].map(([X, V]) => world(rec.f, X, V)));
    },

    /** drawWorld's collection: each building in view by its middle (a landmark past the haze is kept for its
        silhouette), and each side street's end. */
    collect(g, P, add) {
      const k = P.k;
      const fog0 = k.fog0;
      const gone = fog0 + 0.98 * (k.far - fog0);
      this.sky = this.sky || [];
      this.sky.length = 0;
      this.lights.length = 0;
      const st = this.stats;
      st.buildings = st.ends = st.parts = st.slotted = st.skyline = 0;
      st.ms = 0;
      for (const l of g.drive.lots) {
        const rec = this.rec(l);
        if (!rec) {
          const G = ZSR.Streets.GEOM;
          const mid = G.half + G.shoulder + G.lotGap + LOT_FRONT + (G.lotDepth - 186) / 2;
          add(l, "lot", l.qx - l.uy * l.side * mid, l.qy + l.ux * l.side * mid, 0, 260);
          continue;
        }
        const Y = (rec.cx - k.ox) * k.Fx + (rec.cy - k.oy) * k.Fy;
        if (rec.landmark && Y >= gone) {
          // (in fog nothing shows past it)
          if (!k.fog && Y < k.far * LANDMARK_SEEN) this.sky.push(l);
          continue;
        }
        add(l, "lot", rec.cx, rec.cy, 0, rec.reach + 40);
      }
      for (const s of g.drive.sides || []) {
        const rec = this.endRec(s);
        if (rec) add(s, "end", rec.cx, rec.cy, 0, rec.reach + 20);
      }
    },

    /** Set the camera into R for a record (lot coordinates of the camera's eye) and how the building is drawn. */
    look(g, P, rec, fade) {
      const k = P.k;
      R.P = P;
      R.k = k;
      R.f = rec.f;
      R.rec = rec;
      R.dy = 0;
      const ex = k.ox - k.Fx * k.b - rec.f.ox;
      const ey = k.oy - k.Fy * k.b - rec.f.oy;
      R.cX = ex * rec.f.Rx + ey * rec.f.Ry;
      R.cV = ex * rec.f.Nx + ey * rec.f.Ny;
      R.cZ = k.h;
      // how big it is on the screen: px per unit at its middle, its width in px
      const o = q8[0];
      const b = rec.bounds;
      const s = prj((b[0] + b[1]) / 2, (b[2] + b[3]) / 2, 0, o) ? o.s : 0;
      R.s = s;
      const wpx = s * Math.max(b[1] - b[0], b[3] - b[2]);
      R.lod = wpx >= PROP_PX ? 2 : wpx >= DETAIL_PX ? 1 : 0;
      R.fine = clamp((wpx - PROP_PX) / FINE_PX, 0, 1);
      R.lw = clamp(0.6 + s * 1.7, 0.7, 3.2);
      const haze = P.haze(g);
      R.night = !!(g.mods && g.mods.night);
      R.time = g.time || 0;
      const m = clamp(Math.round((1 - fade) * 20), 0, 20);
      if (rec.landmark) {
        // a landmark goes into its silhouette, never into nothing
        const sil = [0, 1, 2].map((i) => Math.round(haze[i] * 0.4 + [46, 52, 52][i] * 0.6));
        R.to = sil;
        R.mixQ = Math.min(m, 17);
      } else {
        R.to = haze;
        R.mixQ = m;
      }
      R.toKey = R.to.join(",");
      R.name = null;
    },
    /** Draw a lot's building (drawWorld's far-to-near list: o is the lot), with what stands between its parts drawn
        in its place among them (order put it there). False when the place has no row. */
    draw(g, ctx, P, l, fade) {
      const rec = this.rec(l);
      if (!rec) return false;
      const t0 = performance.now();
      this.look(g, P, rec, fade);
      R.name = this.signText(g, l);
      ctx.save();
      ctx.globalAlpha = 1;
      const order = rec.frameOrder && rec.orderAt === P.frameNo && rec.lodAt === R.lod ? rec.frameOrder : this.partOrder(rec);
      const slots = rec.slotsAt === P.frameNo && order === rec.frameOrder ? rec.slots : null;
      const drawSlot = (j) => {
        if (!slots || !slots[j]) return;
        ctx.restore();
        const t1 = performance.now();
        for (const o of slots[j]) P.drawItem(g, ctx, o, P.fadeAt(o._Y));
        // (the walkers' own time is theirs)
        this.stats.ms -= performance.now() - t1;
        ctx.save();
        ctx.globalAlpha = 1;
      };
      drawSlot(0);
      for (let i = 0; i < order.length; i++) {
        drawPart(ctx, order[i]);
        if (this.onPart) this.onPart(order[i], rec); // (a test following the drawing order)
        this.stats.parts++;
        drawSlot(i + 1);
      }
      ctx.restore();
      this.stats.buildings++;
      this.stats.ms += performance.now() - t0;
      return true;
    },
    /** A side street's end, standing. */
    drawEnd(g, ctx, P, s, fade) {
      const rec = this.endRec(s);
      if (!rec) return;
      const t0 = performance.now();
      this.look(g, P, rec, fade);
      ctx.save();
      ctx.globalAlpha = 1;
      for (const p of this.partOrder(rec)) {
        drawPart(ctx, p);
        this.stats.parts++;
      }
      ctx.restore();
      this.stats.ends++;
      this.stats.ms += performance.now() - t0;
    },
    /** The record's parts drawn at this detail (R.lod), in drawing order for the camera in R. */
    partOrder(rec) {
      const vis = rec.parts.filter((p) => p.lod <= R.lod);
      for (const p of vis) p._sb = screenBox(p.b, p._sb || [0, 0, 0, 0]);
      return orderParts(vis).map((i) => vis[i]);
    },
    /** What the building's sign says: its name once the place is known (no name before: a blank, weathered board). */
    signText(g, l) {
      const S = ZSR.State;
      if (S && S.isKnown && !S.isKnown(l.node)) return null;
      return (g.placeName ? g.placeName(l.node) : l.node).toUpperCase();
    },

    /** Before drawWorld sorts its list: each building's parts put in order for this camera, and whatever stands near
        one placed by it: behind all its parts (drawn before it), in front of all (after it), or between two of its
        parts (drawn in its place among them: a walker under the gas canopy, in front of the pump building but
        behind the tower's near legs). */
    order(g, P, list) {
      const lots = [];
      for (const o of list) if (o._t === "lot" && this.rec(o)) lots.push(o);
      if (!lots.length) return;
      const no = P.frameNo;
      for (const l of lots) {
        const rec = this.rec(l);
        this.look(g, P, rec, 1);
        rec.frameOrder = this.partOrder(rec);
        rec.orderAt = no;
        rec.slots = [];
        rec.slotsAt = no;
        rec.cam = [R.cX, R.cV, R.cZ];
        rec.lodAt = R.lod;
        // (partOrder left each part's screen box in _sb: only parts and things that overlap there need an order)
      }
      const box = [0, 0, 0, 0, 0, 0];
      const sb = [0, 0, 0, 0];
      for (const o of list) {
        if (o._t === "lot") continue;
        // (only what stands near a building is measured: most of the list is plants far from any)
        const er = o._t === "end" ? this.endRec(o) : null;
        const ox = er ? er.cx : o.x;
        const oy = er ? er.cy : o.y;
        let near = null;
        for (const l of lots) {
          const f = l._bld.f;
          const bd = l._bld.bounds;
          const X = (ox - f.ox) * f.Rx + (oy - f.oy) * f.Ry;
          const V = (ox - f.ox) * f.Nx + (oy - f.oy) * f.Ny;
          if (X > bd[0] - NEAR && X < bd[1] + NEAR && V > bd[2] - NEAR && V < bd[3] + NEAR) {
            near = l;
            break;
          }
        }
        if (!near) continue;
        const sz = this.itemSize(P, o);
        if (!sz) continue;
        const l = near;
        const rec = l._bld;
        const f = rec.f;
        if (sz.box) {
          // the van: its own box in the lot's frame
          box[0] = box[2] = Infinity;
          box[1] = box[3] = -Infinity;
          for (const [cx, cy] of sz.box) {
            const xx = (cx - f.ox) * f.Rx + (cy - f.oy) * f.Ry;
            const vv = (cx - f.ox) * f.Nx + (cy - f.oy) * f.Ny;
            box[0] = Math.min(box[0], xx);
            box[1] = Math.max(box[1], xx);
            box[2] = Math.min(box[2], vv);
            box[3] = Math.max(box[3], vv);
          }
        } else {
          const X = (sz.x - f.ox) * f.Rx + (sz.y - f.oy) * f.Ry;
          const V = (sz.x - f.ox) * f.Nx + (sz.y - f.oy) * f.Ny;
          box[0] = X - sz.r;
          box[1] = X + sz.r;
          box[2] = V - sz.r;
          box[3] = V + sz.r;
        }
        box[4] = sz.z0 || 0;
        box[5] = sz.h;
        R.cX = rec.cam[0];
        R.cV = rec.cam[1];
        R.cZ = rec.cam[2];
        R.f = f;
        R.dy = 0;
        // its picture's box on the screen (a plant's leaves spread wider than its trunk)
        const grow = (sz.rv || 0) - (sz.box ? 0 : sz.r);
        box[0] -= grow;
        box[1] += grow;
        box[2] -= grow;
        box[3] += grow;
        screenBox(box, sb);
        box[0] += grow;
        box[1] -= grow;
        box[2] += grow;
        box[3] -= grow;
        const j = this.slotOf(rec, box, sb);
        const n = rec.frameOrder.length;
        if (j < 0) continue;
        if (j === 0) {
          if (o._Y < l._Y) o._Y = l._Y + 0.001 + o._Y * 1e-9;
        } else if (j >= n) {
          if (o._Y > l._Y) o._Y = l._Y - 0.001 + o._Y * 1e-9;
        } else {
          o._skip = l;
          (rec.slots[j] || (rec.slots[j] = [])).push(o);
          this.stats.slotted++;
        }
      }
      // what is drawn among a building's parts goes far to near there too
      for (const l of lots) for (const s of l._bld.slots) if (s) s.sort((a, b) => b._Y - a._Y);
    },
    /** How many of a building's parts (in this frame's order) a box must be drawn after: after every part it overlaps
        on the screen (sb) and stands in front of, before every one it overlaps and stands behind (or inside: hidden
        in it). -1 when it overlaps none (its own place in the list is right). */
    slotOf(rec, box, sb) {
      const ord = rec.frameOrder;
      const n = ord.length;
      let lo = 0;
      let hi = n;
      let any = false;
      const need = this._need || (this._need = []);
      need.length = 0;
      for (let i = 0; i < n; i++) {
        const q = ord[i]._sb;
        if (sb && q && (q[2] < sb[0] || q[0] > sb[2] || q[3] < sb[1] || q[1] > sb[3])) continue;
        const c = cmp(ord[i].b, box);
        if (c !== -1 && c !== 1 && c !== 2) continue;
        any = true;
        if (c === -1) lo = i + 1;
        else if (i < hi) hi = i;
        // (how much the two overlap on the screen: what drawing them the wrong way round would cost)
        need.push(i, c === -1 ? 1 : -1, sb && q ? (Math.min(q[2], sb[2]) - Math.max(q[0], sb[0])) * (Math.min(q[3], sb[3]) - Math.max(q[1], sb[1])) : 1);
      }
      if (!any) return -1;
      if (lo === 0) return 0;
      if (hi === n) return n;
      if (lo <= hi) return lo;
      // after some part it must be drawn after, before one it must be drawn before, the other way round: the place
      // between them that draws the least overlap the wrong way round
      let best = lo;
      let bestCost = Infinity;
      for (let j = hi; j <= lo; j++) {
        let cost = 0;
        for (let m = 0; m < need.length; m += 3) if ((need[m + 1] === 1 && need[m] >= j) || (need[m + 1] === -1 && need[m] < j)) cost += need[m + 2];
        if (cost < bestCost) {
          bestCost = cost;
          best = j;
        }
      }
      return best;
    },
    /** Where a drawWorld list item stands and how big it is, for sorting it against a building: { x, y, r (its foot,
        for the wall planes), rv (its picture's reach, for the screen), h } (the van: its box's corners). */
    itemSize(P, o) {
      switch (o._t) {
        case "walker":
          return { x: o.x, y: o.y, r: o.r || 18, rv: (o.r || 18) * 1.5, h: P.walkerH ? P.walkerH(o) : 60 };
        case "downed":
          return { x: o.x, y: o.y, r: 30, rv: 44, h: 22 };
        case "plant":
          return { x: o.x, y: o.y, r: o.kind === "tree" || o.kind === "dead" ? 12 : 16, rv: o.h * (o.kind === "bush" ? 0.62 : o.kind === "grass" ? 0.5 : 0.42), h: o.h };
        case "prop": {
          const r = o.kind === "wreck" ? 60 : o.kind === "barrier" || o.kind === "sign" ? 38 : 16;
          return { x: o.x, y: o.y, r, rv: o.kind === "tree" ? 90 : r + 6, h: o.kind === "tree" ? 200 : o.kind === "sign" ? 88 : 48 };
        }
        case "crate":
          return { x: o.x, y: o.y, r: 17, rv: 22, h: 28 };
        case "flying":
          return { x: o.x, y: o.y, r: 2, rv: 4, h: (o.z || 4) + 2, z0: Math.max(0, (o.z || 4) - 2) };
        case "end": {
          const rec = this.endRec(o);
          return rec ? { x: rec.cx, y: rec.cy, r: rec.reach, rv: rec.reach, h: 50 } : null;
        }
        case "van": {
          const v = o;
          const fx = Math.cos(v.heading);
          const fy = Math.sin(v.heading);
          const hw = v.w / 2;
          const hl = v.h / 2;
          return { x: v.x, y: v.y, h: 60, box: [[v.x + fx * hl - fy * hw, v.y + fy * hl + fx * hw], [v.x + fx * hl + fy * hw, v.y + fy * hl - fx * hw], [v.x - fx * hl - fy * hw, v.y - fy * hl + fx * hw], [v.x - fx * hl + fy * hw, v.y - fy * hl - fx * hw]] };
        }
        default:
          return null;
      }
    },

    /** The lights that shine at night (the Water Tower's red antenna light, blinking), over the night's dark: game.js
        draws them right after its night overlay, in the same transform as drawWorld. */
    drawLights(ctx) {
      for (const L of this.lights) {
        ctx.globalAlpha = L.a;
        ctx.beginPath();
        ctx.arc(L.x, L.y, Math.max(4, 14 * L.s), 0, TAU);
        ctx.fillStyle = "rgba(255,74,58,0.25)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(L.x, L.y, Math.max(1.6, 5 * L.s), 0, TAU);
        ctx.fillStyle = "#ff4a3a";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
    /** The landmarks past the haze (collect kept them): each a silhouette standing on the haze's far edge, scaled for
        how far it really is, paling into the haze toward LANDMARK_SEEN. Drawn before anything standing. */
    skyline(g, P, ctx) {
      if (!this.sky || !this.sky.length) return;
      const k = P.k;
      const farPt = P.project(k.ox + k.Fx * k.far, k.oy + k.Fy * k.far, 0);
      if (!farPt) return;
      for (const l of this.sky) {
        const rec = this.rec(l);
        const Y = (rec.cx - k.ox) * k.Fx + (rec.cy - k.oy) * k.Fy;
        const X = (rec.cx - k.ox) * k.Rx + (rec.cy - k.oy) * k.Ry;
        const base = P.project(rec.cx, rec.cy, 0);
        if (!base) continue;
        if (Math.abs(X) > ((k.W / 2 + 200) * P.depthAt(Y)) / k.f + rec.reach) continue;
        const t0 = performance.now();
        this.look(g, P, rec, 0);
        const a = clamp((k.far * LANDMARK_SEEN - Y) / (k.far * (LANDMARK_SEEN - 1) * 0.5), 0, 1);
        const haze = P.haze(g);
        R.to = R.to.map((c, i) => Math.round(haze[i] + (c - haze[i]) * a));
        R.toKey = R.to.join(",");
        R.mixQ = 20;
        R.lod = 0;
        R.lw = Math.max(0.6, R.lw * 0.8);
        // stood on the far edge of the ground: shifted down as far as its foot is above it
        R.dy = Math.max(0, farPt.y - base.y);
        // (its light at night pales with it)
        R.lightA = a;
        ctx.save();
        ctx.globalAlpha = 1;
        for (const p of this.partOrder(rec)) drawPart(ctx, p);
        ctx.restore();
        R.dy = 0;
        R.lightA = 1;
        this.stats.skyline++;
        this.stats.ms += performance.now() - t0;
      }
    },

    /** The names: painted on each building's sign; while that is too small to read (or the place is not known yet:
        the sign is blank) the flat name board stands in front of it, as big as the road's boards, fading with the
        building, gone once it has gone into the haze, and moved down out of the HUD's top row. */
    names(g, P, ctx, kText) {
      const k = P.k;
      const fog0 = k.fog0;
      const D = ZSR.Draw;
      const hud = g.hudRects ? g.hudRects() : null;
      const boxes = (hud && hud.boxes) || [];
      const o = {};
      const top = {};
      for (const l of g.drive.lots) {
        const rec = this.rec(l);
        let X;
        let V;
        let Z;
        let zTop;
        let painted = 0;
        let f;
        if (rec && rec.sign) {
          const sg = rec.sign;
          f = rec.f;
          X = sg.X;
          V = sg.V;
          Z = (sg.z0 + sg.z1) / 2;
          zTop = sg.z1;
        } else {
          const G = ZSR.Streets.GEOM;
          f = frameOfLot(l);
          X = 0;
          V = G.half + G.shoulder + G.lotGap + LOT_FRONT;
          Z = 178;
          zTop = 178;
        }
        // as drawWorld fades its building
        const cw = world(rec ? rec.f : f, rec ? (rec.bounds[0] + rec.bounds[1]) / 2 : 0, rec ? (rec.bounds[2] + rec.bounds[3]) / 2 : V + 80);
        const Yb = (cw.x - k.ox) * k.Fx + (cw.y - k.oy) * k.Fy;
        const fade = Yb > fog0 ? 1 - clamp((Yb - fog0) / (k.far - fog0), 0, 1) : 1;
        if (fade < NAME_FADE) continue;
        R.f = f;
        R.k = k;
        R.dy = 0;
        if (!prj(X, V, Z, o) || !prj(X, V, zTop, top)) continue;
        if (o.x < -200 || o.x > k.W + 200 || o.y < -60 || o.y > k.H + 60) continue;
        const name = ZSR.State.isKnown(l.node) ? g.placeName(l.node).toUpperCase() : "?";
        const scale = Math.max(g.zoom, kText * 0.8) * clamp(o.s / (g.zoom * P.cfg.scale), 0.6, 1.2);
        const fs = Math.round(15 * scale);
        if (rec && rec.sign && name !== "?") {
          // how tall its painted words stand on the screen, if the camera sees its wall
          const sg = rec.sign;
          const ex = k.ox - k.Fx * k.b - f.ox;
          const ey = k.oy - k.Fy * k.b - f.oy;
          const cX = ex * f.Rx + ey * f.Ry;
          const cV = ex * f.Nx + ey * f.Ny;
          const seen = sg.n[0] * (cX - X) + sg.n[1] * (cV - V) > 0;
          // (painted this frame, unless the building is too small for its signs yet)
          if (seen && sg.d.textShare && rec.orderAt === P.frameNo && rec.lodAt >= (sg.d.lod == null ? 1 : sg.d.lod)) painted = 2 * (o.y - top.y) * sg.d.textShare;
        }
        // the board stands in while the painted words are small, and gives way as soon as they read as well (a
        // quick fade, so the two are hardly ever seen over each other)
        const a = fade * clamp((fs - painted) / (fs * 0.12), 0, 1);
        if (a <= 0.02) continue;
        let y = o.y;
        if (boxes.length) {
          ctx.save();
          ctx.font = "700 " + fs + "px " + FONT;
          const w = ctx.measureText(name).width + 16 * scale;
          ctx.restore();
          const h = fs + 10 * scale;
          for (const bx of boxes) {
            if (o.x + w / 2 > bx.left && o.x - w / 2 < bx.right && y + h / 2 > bx.top && y - h / 2 < bx.bottom) y = bx.bottom + h / 2 + 4;
          }
        }
        ctx.save();
        ctx.globalAlpha = a;
        D.nameBoard(ctx, o.x, y, name, scale, false);
        ctx.restore();
      }
    },
  };
  PB.parts = (l) => {
    const rec = PB.rec(l);
    return rec ? rec.parts : [];
  };
  PB._R = R;
  PB._prj = prj;
  PB._cmp = cmp;
  PB._screenBox = screenBox;
  PB._tex = texCache;
  ZSR.PerspBuild = PB;
})(typeof window !== "undefined" ? window : globalThis);
