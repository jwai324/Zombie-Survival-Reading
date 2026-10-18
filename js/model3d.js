/* Model3D: still 3D things (the van now; the yard's props, signs and animals' bodies next) drawn in the game's comic
   style with plain Canvas 2D calls (flat fills lit face by face, ink on the creases and the silhouette), from any
   camera the caller describes. No WebGL and no images; text only where a builder lays some on a face.

   A model is built once per look and kept: Model3D.define(id, build) registers a builder, Model3D.mesh(id, opts, key)
   builds one (build(B, opts) with a Builder B) and keeps it under key (MESH_KEEP of them, the oldest let go first).
   A model is CONVEX PARTS made of flat FACES (each a convex polygon wound counter-clockwise as seen from outside),
   with decals laid on faces: polygons, lines, discs and text in the face's own plane. Units are the builder's own
   (the van uses the road's units); x right, y forward, z up.

   draw(ctx, mesh, view) -> how many faces it drew. view (one object, reused by the caller):
     project(x, y, z)  a model point -> view.X, view.Y (screen px) and view.D (depth, > 0 in front of the camera);
                       returns false when the point is nearer than view.near (D is still written)
     eye               the camera in model space, Float64Array(3) or [x, y, z] (which faces show; the parts' order)
     lit(nx, ny, nz)   brightness (about 0.5 .. 1.2) of a face whose outward unit normal in model space is n: the
                       caller's light, so a model is lit as the world around it is (the yard's walls, the road's
                       buildings), whichever way the model is turned
     ink               px width of an ink line here (the caller's scale)
     lod               0 full | 1 no fine decals | 2 the parts' faces and ink only
     fog, fogR, fogG, fogB    every colour mixed toward the fog colour by fog (0..1, drawn in FOG_STEPS steps)
     tint, tintR, tintG, tintB  the same toward a tint (a hurt flash), before the fog
     near              depth under which faces and lines are cut off
   Faces that face away are skipped; parts draw far to near by their centre's distance from the eye less part.bias;
   the front faces of one convex part never overlap, so they need no order; a part's ink goes on after its faces and
   their decals, each edge once: an edge is inked where the part ends, where its other face looks away (the
   silhouette) or where the two faces meet at an angle (a crease, more than CREASE_DEG); round things' facets meet
   flatter than that, so only their outline is inked.
   Contract (tests/validate-art.js): finite numbers, real colours ("rgb(r,g,b)" or "rgba(r,g,b,a)" built from fixed
   steps of light and fog, so the colour table converges), no new canvases, no read-backs; transform only for text,
   inside save/restore. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  const FOG_STEPS = 32; // fog and tint are drawn in steps of 1/32 and light in steps of 1/LIGHT_STEPS: few colours
  const LIGHT_STEPS = 64;
  const CREASE_DEG = 28; // faces meeting at more than this are inked along their shared edge
  const CREASE_COS = Math.cos((CREASE_DEG * Math.PI) / 180);
  const MAX_V = 64; // SCALE: most corners one face (or a decal) may have; a clipped face gains at most one per cut
  const MESH_KEEP = 64; // SCALE: built models kept (each look of each model is one)
  const COLOURS_MAX = 8192; // SCALE: colour strings kept before the table starts over
  const KEY_EPS = 1e-4; // corners nearer than this (in units) are one corner when faces are matched up edge to edge
  const INK = [15, 16, 18];
  const TAU = Math.PI * 2;

  /* ---------- Colours ---------- */
  const rgbOf = new Map();
  /** "#rgb", "#rrggbb" or "rgb(a)(...)" -> [r, g, b, a]. */
  function rgb(c) {
    let v = rgbOf.get(c);
    if (v) return v;
    if (typeof c === "string" && c[0] === "#") {
      const h = c.length === 4 ? c.slice(1).replace(/./g, (x) => x + x) : c.slice(1, 7);
      const n = parseInt(h, 16);
      v = [n >> 16, (n >> 8) & 255, n & 255, c.length === 9 ? parseInt(c.slice(7, 9), 16) / 255 : 1];
    } else {
      const m = /rgba?\(([^)]+)\)/.exec(String(c));
      const p = m ? m[1].split(",").map(Number) : [128, 128, 128];
      v = [p[0] | 0, p[1] | 0, p[2] | 0, p.length > 3 ? p[3] : 1];
    }
    rgbOf.set(c, v);
    return v;
  }
  const strOf = new Map();
  const chan = (v) => (v <= 0 ? 0 : v >= 255 ? 255 : Math.round(v));
  function cstr(r, g, b, a) {
    const A = Math.round((a <= 0 ? 0 : a >= 1 ? 1 : a) * 100);
    const key = ((chan(r) * 256 + chan(g)) * 256 + chan(b)) * 101 + A;
    let s = strOf.get(key);
    if (s) return s;
    if (strOf.size >= COLOURS_MAX) strOf.clear();
    s = A >= 100 ? "rgb(" + chan(r) + "," + chan(g) + "," + chan(b) + ")" : "rgba(" + chan(r) + "," + chan(g) + "," + chan(b) + "," + A / 100 + ")";
    strOf.set(key, s);
    return s;
  }
  /** Colour c ([r, g, b, a]) lit by m, with the view's tint and fog (both in steps), alpha a x c's own. */
  function shadeOf(view, c, m, a, glow) {
    let r = c[0];
    let g = c[1];
    let b = c[2];
    if (!glow) {
      m = Math.round(m * LIGHT_STEPS) / LIGHT_STEPS;
      r *= m;
      g *= m;
      b *= m;
    }
    const t = view.tint > 0 ? Math.round(Math.min(1, view.tint) * FOG_STEPS) / FOG_STEPS : 0;
    if (t > 0) {
      r += (view.tintR - r) * t;
      g += (view.tintG - g) * t;
      b += (view.tintB - b) * t;
    }
    const f = !glow && view.fog > 0 ? Math.round(Math.min(1, view.fog) * FOG_STEPS) / FOG_STEPS : 0;
    if (f > 0) {
      r += ((view.fogR || 0) - r) * f;
      g += ((view.fogG || 0) - g) * f;
      b += ((view.fogB || 0) - b) * f;
    }
    return cstr(r, g, b, c[3] * (a == null ? 1 : a));
  }

  /* ---------- Small vector helpers (arrays in, numbers out) ---------- */
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  function norm(a) {
    const l = Math.sqrt(dot(a, a)) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  }
  const ptKey = (x, y, z) => Math.round(x / KEY_EPS) + "," + Math.round(y / KEY_EPS) + "," + Math.round(z / KEY_EPS);

  /* ---------- Building a model ---------- */
  /** Collects one model's parts as its builder lays them out (model units; x right, y forward, z up). */
  class Builder {
    constructor() {
      this.parts = [];
      this.cur = null;
    }
    /** Start a new convex part. o.bias: units it is drawn as if nearer (a wheel against the body); o.ink: its ink
        width x this (0: none); o.lod: the coarsest view lod it still draws at (default 2: always). */
    part(o) {
      o = o || {};
      this.cur = { faces: [], bias: o.bias || 0, ink: o.ink == null ? 1 : o.ink, lod: o.lod == null ? 2 : o.lod, name: o.name || "" };
      this.parts.push(this.cur);
      return this.cur;
    }
    /** A flat convex face, its corners [x, y, z] counter-clockwise seen from outside. o.glow: unlit, unfogged (a lamp);
        o.alpha; o.hide: never drawn (covered by another part; it still orders the parts); o.u / o.v / o.o: its decal frame (default: u along its first edge, v square to it in its plane, from
        its first corner). Returns the face (decals go on it with poly, line, disc and text). */
    face(pts, fill, o) {
      o = o || {};
      if (!this.cur) this.part();
      if (pts.length < 3 || pts.length > MAX_V) throw new Error("Model3D: a face has " + pts.length + " corners");
      const n = norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
      // a long thin face's first three corners may be nearly in line: take the normal from the whole outline
      let nx = 0;
      let ny = 0;
      let nz = 0;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        nx += (a[1] - b[1]) * (a[2] + b[2]);
        ny += (a[2] - b[2]) * (a[0] + b[0]);
        nz += (a[0] - b[0]) * (a[1] + b[1]);
      }
      const nn = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const N = nn > 1e-9 ? [nx / nn, ny / nn, nz / nn] : n;
      const P = new Float64Array(pts.length * 3);
      let cx = 0;
      let cy = 0;
      let cz = 0;
      pts.forEach((p, i) => {
        P[i * 3] = p[0];
        P[i * 3 + 1] = p[1];
        P[i * 3 + 2] = p[2];
        cx += p[0];
        cy += p[1];
        cz += p[2];
      });
      const k = pts.length;
      const u = o.u ? norm(o.u) : norm(sub(pts[1], pts[0]));
      const v = o.v ? norm(o.v) : norm(cross(N, u));
      const f = {
        p: P,
        n: k,
        nx: N[0],
        ny: N[1],
        nz: N[2],
        cx: cx / k,
        cy: cy / k,
        cz: cz / k,
        rgb: rgb(fill),
        alpha: o.alpha == null ? 1 : o.alpha,
        glow: !!o.glow,
        hide: !!o.hide, // never drawn (a face another part covers); it still orders the parts
        o: o.o || pts[0],
        u,
        v,
        decals: [],
        nb: null, // per edge: the face of this part across it (-1: none), filled in by done()
        crease: null,
      };
      this.cur.faces.push(f);
      return f;
    }
    /** A box from (x0, y0, z0) to (x1, y1, z1). o.fills: { top, bottom, left, right, front, back } colours over fill;
        o.skip: a list of sides left out. Returns its faces by side; each one's decal frame runs left to right as seen
        from outside it with v up (the top: u = +x, v = +y; the bottom: u = +x, v = -y). front is +y, right +x. */
    box(x0, y0, z0, x1, y1, z1, fill, o) {
      o = o || {};
      const F = o.fills || {};
      const skip = o.skip || [];
      const out = {};
      const add = (side, pts, u, v, org) => {
        if (skip.includes(side)) return;
        out[side] = this.face(pts, F[side] || fill, { u, v, o: org, glow: o.glow, alpha: o.alpha });
      };
      add("front", [[x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [x0, y1, z0]].reverse(), [-1, 0, 0], [0, 0, 1], [x1, y1, z0]);
      add("back", [[x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [x1, y0, z0]].reverse(), [1, 0, 0], [0, 0, 1], [x0, y0, z0]);
      add("right", [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]].reverse(), [0, 1, 0], [0, 0, 1], [x1, y0, z0]);
      add("left", [[x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [x0, y0, z0]].reverse(), [0, -1, 0], [0, 0, 1], [x0, y1, z0]);
      add("top", [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [1, 0, 0], [0, 1, 0], [x0, y0, z1]);
      add("bottom", [[x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [x0, y0, z0]], [1, 0, 0], [0, -1, 0], [x0, y1, z0]);
      return out;
    }
    /** A straight extrusion of a convex outline: prof is [[s, t], ...] counter-clockwise in the plane square to axis
        ("x": s = y, t = z; "y": s = -x, t = z ... see AX), from a0 to a1 along it. o.fills: { cap0, cap1, sides }
        (sides: a colour per edge, or one); o.skip: ["cap0", "cap1"]; o.skipSides: indexes of sides left out (faces
        another part hides: kept to order the parts, never drawn). Returns { cap0, cap1, sides: [...] } (side i runs from
        corner i to i + 1). */
    prism(prof, axis, a0, a1, fill, o) {
      o = o || {};
      const F = o.fills || {};
      const at = AX[axis];
      const P0 = prof.map(([s, t]) => at(a0, s, t));
      const P1 = prof.map(([s, t]) => at(a1, s, t));
      const out = { sides: [] };
      if (!(o.skip || []).includes("cap1")) out.cap1 = this.face(P1, F.cap1 || fill, { glow: o.glow });
      if (!(o.skip || []).includes("cap0")) out.cap0 = this.face(P0.slice().reverse(), F.cap0 || fill, { glow: o.glow });
      const n = prof.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const c = Array.isArray(F.sides) ? F.sides[i] || fill : F.sides || fill;
        // the side's decal frame: u from corner i toward corner j (seen from outside: left to right when the
        // outline runs counter-clockwise and the axis points at the viewer's left), v along the axis. A skipped side
        // (hidden against the next part) is kept, never drawn: it still orders the parts, and its edges are inked as
        // where the part ends
        out.sides.push(this.face([P0[i], P0[j], P1[j], P1[i]], c, { glow: o.glow, o: P0[i], u: sub(P0[j], P0[i]), v: sub(P1[i], P0[i]), hide: (o.skipSides || []).includes(i) }));
      }
      return out;
    }
    /** A round part with n sides along axis from a0 to a1 about centre c (the other two coordinates), radius r0 at a0
        and r1 at a1 (a cone or a tapered post when they differ; 0 is a point). o.fills: { cap0, cap1, sides }. */
    round(axis, c, r0, r1, a0, a1, n, fill, o) {
      n = Math.max(3, n | 0);
      const prof0 = [];
      const prof1 = [];
      for (let i = 0; i < n; i++) {
        const t = (i / n) * TAU;
        prof0.push([c[0] + Math.cos(t) * r0, c[1] + Math.sin(t) * r0]);
        prof1.push([c[0] + Math.cos(t) * r1, c[1] + Math.sin(t) * r1]);
      }
      o = o || {};
      const F = o.fills || {};
      const at = AX[axis];
      const out = { sides: [] };
      const P0 = prof0.map(([s, t]) => at(a0, s, t));
      const P1 = prof1.map(([s, t]) => at(a1, s, t));
      if (r1 > 0 && !(o.skip || []).includes("cap1")) out.cap1 = this.face(P1, F.cap1 || fill, { glow: o.glow });
      if (r0 > 0 && !(o.skip || []).includes("cap0")) out.cap0 = this.face(P0.slice().reverse(), F.cap0 || fill, { glow: o.glow });
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const pts = r1 <= 0 ? [P0[i], P0[j], P1[i]] : r0 <= 0 ? [P0[i], P1[j], P1[i]] : [P0[i], P0[j], P1[j], P1[i]];
        out.sides.push(this.face(pts, F.sides || fill, { glow: o.glow }));
      }
      return out;
    }
    /* ---------- Decals on a face: points in its frame (a along f.u, b along f.v, from f.o), drawn after it ---------- */
    /** A filled polygon; o.ink: an ink outline this many ink widths wide; o.lod: the coarsest lod it shows at
        (default 1); o.alpha; o.glow. */
    poly(f, pts2, fill, o) {
      o = o || {};
      if (pts2.length < 2 || pts2.length > MAX_V) throw new Error("Model3D: a decal has " + pts2.length + " corners");
      f.decals.push({ k: 0, p: onFace(f, pts2), n: pts2.length, rgb: rgb(fill), ink: o.ink || 0, lod: o.lod == null ? 1 : o.lod, alpha: o.alpha == null ? 1 : o.alpha, glow: !!o.glow, close: true });
      return this;
    }
    /** An open line through pts2, w ink widths wide, in colour. */
    line(f, pts2, color, w, o) {
      o = o || {};
      f.decals.push({ k: 1, p: onFace(f, pts2), n: pts2.length, rgb: rgb(color), ink: w || 1, lod: o.lod == null ? 1 : o.lod, alpha: o.alpha == null ? 1 : o.alpha, glow: !!o.glow, close: !!o.close });
      return this;
    }
    /** A round spot of radius r at (a, b) (a polygon of o.n sides, default 12). */
    disc(f, a, b, r, fill, o) {
      o = o || {};
      const n = o.n || 12;
      const pts = [];
      for (let i = 0; i < n; i++) pts.push([a + Math.cos((i / n) * TAU) * r, b + Math.sin((i / n) * TAU) * r]);
      return this.poly(f, pts, fill, o);
    }
    /** Text on the face: its baseline's start (or middle / end by o.align) at (a, b), size units tall, in o.font's
        family and weight (default "700 ... Oswald, Impact, sans-serif"). */
    text(f, a, b, str, size, fill, o) {
      o = o || {};
      const p = onFace(f, [[a, b]]);
      f.decals.push({ k: 2, p, n: 1, rgb: rgb(fill), str: String(str), size, family: o.font || "700 SIZEpx Oswald, Impact, sans-serif", align: o.align || "center", base: o.base || "alphabetic", u: f.u, v: f.v, lod: o.lod == null ? 1 : o.lod, alpha: o.alpha == null ? 1 : o.alpha, glow: !!o.glow, ink: 0 });
      return this;
    }
    /** The finished model: each part's centre and reach, and which faces meet along which edges. */
    done() {
      let x0 = Infinity;
      let y0 = Infinity;
      let z0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      let z1 = -Infinity;
      let maxF = 1;
      let faces = 0;
      const parts = this.parts.filter((p) => p.faces.length);
      parts.forEach((pt) => {
        let sx = 0;
        let sy = 0;
        let sz = 0;
        let k = 0;
        const edges = new Map();
        const box = (pt.box = new Float64Array([Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity])); // its reach
        pt.faces.forEach((f, fi) => {
          f.nb = new Int32Array(f.n).fill(-1);
          f.crease = new Uint8Array(f.n);
          for (let i = 0; i < f.n; i++) {
            const x = f.p[i * 3];
            const y = f.p[i * 3 + 1];
            const z = f.p[i * 3 + 2];
            sx += x;
            sy += y;
            sz += z;
            k++;
            box[0] = Math.min(box[0], x);
            box[1] = Math.min(box[1], y);
            box[2] = Math.min(box[2], z);
            box[3] = Math.max(box[3], x);
            box[4] = Math.max(box[4], y);
            box[5] = Math.max(box[5], z);
            x0 = Math.min(x0, x);
            y0 = Math.min(y0, y);
            z0 = Math.min(z0, z);
            x1 = Math.max(x1, x);
            y1 = Math.max(y1, y);
            z1 = Math.max(z1, z);
            const j = (i + 1) % f.n;
            const a = ptKey(x, y, z);
            const b = ptKey(f.p[j * 3], f.p[j * 3 + 1], f.p[j * 3 + 2]);
            edges.set(a + "|" + b, [fi, i]);
          }
        });
        // an edge a -> b of one face meets the edge b -> a of its neighbour
        pt.faces.forEach((f, fi) => {
          for (let i = 0; i < f.n; i++) {
            const j = (i + 1) % f.n;
            const a = ptKey(f.p[i * 3], f.p[i * 3 + 1], f.p[i * 3 + 2]);
            const b = ptKey(f.p[j * 3], f.p[j * 3 + 1], f.p[j * 3 + 2]);
            const other = edges.get(b + "|" + a);
            if (!other || other[0] === fi) continue;
            const g = pt.faces[other[0]];
            f.nb[i] = other[0];
            f.crease[i] = f.nx * g.nx + f.ny * g.ny + f.nz * g.nz < CREASE_COS ? 1 : 0;
          }
        });
        pt.cx = sx / k;
        pt.cy = sy / k;
        pt.cz = sz / k;
        maxF = Math.max(maxF, pt.faces.length);
        faces += pt.faces.length;
      });
      const n = parts.length;
      // which of two parts is in front depends only on which side of a plane between them the eye is: for each pair,
      // a face plane of one with all of the other on its outer side (two convex parts that do not cut into each
      // other always have one). sepF[i * n + j]: 1 + that face's index in part i (j outside it), or -(1 + its index
      // in part j) (i outside it), or 0: none (they cut into each other: their centres' distance decides)
      const sepF = new Int32Array(n * n);
      const size = Math.max(x1 - x0, y1 - y0, z1 - z0) || 1;
      const eps = size * 1e-4;
      const outside = (f, pt) => {
        const d = f.nx * f.p[0] + f.ny * f.p[1] + f.nz * f.p[2];
        for (const g of pt.faces) for (let i = 0; i < g.n; i++) if (f.nx * g.p[i * 3] + f.ny * g.p[i * 3 + 1] + f.nz * g.p[i * 3 + 2] - d < -eps) return false;
        return true;
      };
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          let k = parts[i].faces.findIndex((f) => outside(f, parts[j]));
          if (k >= 0) sepF[i * n + j] = k + 1;
          else {
            k = parts[j].faces.findIndex((f) => outside(f, parts[i]));
            if (k >= 0) sepF[i * n + j] = -(k + 1);
          }
        }
      }
      return {
        parts,
        faces,
        bounds: [x0, y0, z0, x1, y1, z1],
        size,
        sepF,
        // per-draw scratch, owned by this model (draws are one at a time)
        front: new Uint8Array(maxF),
        order: new Int32Array(n),
        dist: new Float64Array(n),
        act: new Int32Array(n), // the parts drawn at this lod
        need: new Int32Array(n), // how many parts must still be drawn before each (-1: drawn)
        after: new Uint8Array(n * n), // after[a * n + b]: part a is drawn after part b
        sbox: new Float64Array(n * 4), // each part's reach on the screen
        seen: new Uint8Array(n), // the parts a cycle's walk has passed (breakCycle)
      };
    }
  }
  // a profile point (s, t) at a along an axis, as a model point
  const AX = {
    x: (a, s, t) => [a, s, t], // seen from +x: s runs along +y, t up
    y: (a, s, t) => [-s, a, t], // seen from +y (the front): s runs along -x (its left to right... the viewer's), t up
    z: (a, s, t) => [s, t, a], // seen from above: s along +x, t along +y
  };
  /** Points in face f's frame -> a Float64Array of model points. */
  function onFace(f, pts2) {
    const P = new Float64Array(pts2.length * 3);
    for (let i = 0; i < pts2.length; i++) {
      const a = pts2[i][0];
      const b = pts2[i][1];
      P[i * 3] = f.o[0] + f.u[0] * a + f.v[0] * b;
      P[i * 3 + 1] = f.o[1] + f.u[1] * a + f.v[1] * b;
      P[i * 3 + 2] = f.o[2] + f.u[2] * a + f.v[2] * b;
    }
    return P;
  }

  /* ---------- Registry and the built models kept ---------- */
  const builders = new Map();
  const meshes = new Map();
  /** Register a model: build(B, opts) lays its parts out with Builder B. */
  function define(id, build) {
    builders.set(id, build);
    // a builder changed (a reload in tests): its old models go
    Array.from(meshes.keys()).forEach((k) => k.startsWith(id + "|") && meshes.delete(k));
  }
  /** Model id in this look (opts), built the first time a key is seen and kept (MESH_KEEP, the oldest let go). */
  function mesh(id, opts, key) {
    const k = id + "|" + (key == null ? JSON.stringify(opts || {}) : key);
    let m = meshes.get(k);
    if (m) return m;
    const build = builders.get(id);
    if (!build) throw new Error("Model3D: no model " + id);
    const B = new Builder();
    build(B, opts || {});
    m = B.done();
    m.id = id;
    m.key = k;
    if (meshes.size >= MESH_KEEP) meshes.delete(meshes.keys().next().value);
    meshes.set(k, m);
    return m;
  }

  /* ---------- Drawing ---------- */
  const SX = new Float64Array(MAX_V * 2 + 4);
  const SY = new Float64Array(MAX_V * 2 + 4);
  const SD = new Float64Array(MAX_V * 2 + 4);
  const SIN = new Uint8Array(MAX_V * 2 + 4);
  const QX = new Float64Array(MAX_V * 2 + 4);
  const QY = new Float64Array(MAX_V * 2 + 4);
  const SEG = new Float64Array(4);
  let nearD = 0;
  // a part's box (draw: its reach on the screen): its 12 edges as pairs of corners (corner c is x1 if c & 1, y1 if
  // c & 2, z1 if c & 4), and its corners' depths
  const BOX_EDGES = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 1, 3, 4, 6, 5, 7, 0, 4, 1, 5, 2, 6, 3, 7]);
  const BOX_D = new Float64Array(8);
  // where a box's edge crosses the near plane it is cut this much deeper than the plane (a camera may put a point at
  // the near depth itself, rounding included, in the screen's middle)
  const BOX_CUT = 1.001;

  /** Project the n points of P (model space) into SX / SY / SD; returns how many are in front (SIN marks them). */
  function projectAll(view, P, n) {
    let k = 0;
    for (let i = 0; i < n; i++) {
      const ok = view.project(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
      SX[i] = view.X;
      SY[i] = view.Y;
      SD[i] = view.D;
      SIN[i] = ok && view.D > nearD ? 1 : 0;
      if (SIN[i]) k++;
    }
    return k;
  }
  /** The outline of P's n points cut off at the near depth -> QX / QY, returns its corner count (the points must be in
      SX / SY / SD / SIN already). */
  function clipPoly(view, P, n) {
    let m = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      if (SIN[i]) {
        QX[m] = SX[i];
        QY[m++] = SY[i];
      }
      if (SIN[i] !== SIN[j]) {
        const t = (nearD - SD[i]) / (SD[j] - SD[i]);
        view.project(P[i * 3] + (P[j * 3] - P[i * 3]) * t, P[i * 3 + 1] + (P[j * 3 + 1] - P[i * 3 + 1]) * t, P[i * 3 + 2] + (P[j * 3 + 2] - P[i * 3 + 2]) * t);
        QX[m] = view.X;
        QY[m++] = view.Y;
      }
    }
    return m;
  }
  /** The path of P's n points (cut at the near depth when some are behind it); false when none of it is in front.
      fill: the path is only filled (a fill closes it by itself: no closePath call). */
  function pathOf(ctx, view, P, n, close, fill) {
    const k = projectAll(view, P, n);
    if (!k) return false;
    ctx.beginPath();
    if (!close && k < n) {
      // an open line partly behind: each segment cut at the near depth (clipSeg), a new run where it comes back
      let drawn = false;
      let at = false; // the pen is at point i, in front
      for (let i = 0; i + 1 < n; i++) {
        if (!clipSeg(view, P, i, i + 1)) {
          at = false;
          continue;
        }
        if (!at) ctx.moveTo(SEG[0], SEG[1]);
        ctx.lineTo(SEG[2], SEG[3]);
        at = !!SIN[i + 1];
        drawn = true;
      }
      return drawn;
    }
    if (k === n || !close) {
      let started = false;
      for (let i = 0; i < n; i++) {
        if (!SIN[i]) {
          started = false;
          continue;
        }
        if (started) ctx.lineTo(SX[i], SY[i]);
        else ctx.moveTo(SX[i], SY[i]);
        started = true;
      }
      if (close && k === n && !fill) ctx.closePath();
      return true;
    }
    const m = clipPoly(view, P, n);
    if (m < 3) return false;
    ctx.moveTo(QX[0], QY[0]);
    for (let i = 1; i < m; i++) ctx.lineTo(QX[i], QY[i]);
    if (!fill) ctx.closePath();
    return true;
  }
  /** Segment a -> b of P cut at the near depth -> SEG; false when all of it is behind. */
  function clipSeg(view, P, a, b) {
    const ina = SIN[a];
    const inb = SIN[b];
    if (!ina && !inb) return false;
    SEG[0] = SX[a];
    SEG[1] = SY[a];
    SEG[2] = SX[b];
    SEG[3] = SY[b];
    if (ina && inb) return true;
    const t = (nearD - SD[a]) / (SD[b] - SD[a]);
    view.project(P[a * 3] + (P[b * 3] - P[a * 3]) * t, P[a * 3 + 1] + (P[b * 3 + 1] - P[a * 3 + 1]) * t, P[a * 3 + 2] + (P[b * 3 + 2] - P[a * 3 + 2]) * t);
    if (ina) {
      SEG[2] = view.X;
      SEG[3] = view.Y;
    } else {
      SEG[0] = view.X;
      SEG[1] = view.Y;
    }
    return true;
  }
  function decal(ctx, view, f, d, lit) {
    if (d.lod < (view.lod | 0)) return;
    if (d.k === 2) return text(ctx, view, f, d);
    if (!pathOf(ctx, view, d.p, d.n, d.close, d.k === 0 && !(d.ink > 0))) return;
    const c = shadeOf(view, d.rgb, d.glow ? 1 : lit, f.alpha * d.alpha, d.glow);
    if (d.k === 0) {
      ctx.fillStyle = c;
      ctx.fill();
      if (d.ink > 0) {
        ctx.lineWidth = Math.max(0.5, view.ink * d.ink);
        ctx.strokeStyle = shadeOf(view, INK_RGB, 1, f.alpha * d.alpha, false);
        ctx.stroke();
      }
    } else {
      ctx.lineWidth = Math.max(0.5, view.ink * d.ink);
      ctx.strokeStyle = c;
      ctx.stroke();
    }
  }
  const INK_RGB = [INK[0], INK[1], INK[2], 1];
  /** Text on a face through the face's map at the text's anchor (a straight map is close enough on a face this size). */
  function text(ctx, view, f, d) {
    const x = d.p[0];
    const y = d.p[1];
    const z = d.p[2];
    if (!view.project(x, y, z)) return;
    const ox = view.X;
    const oy = view.Y;
    if (!view.project(x + d.u[0], y + d.u[1], z + d.u[2])) return;
    const ax = view.X - ox;
    const ay = view.Y - oy;
    if (!view.project(x - d.v[0], y - d.v[1], z - d.v[2])) return;
    const cx = view.X - ox;
    const cy = view.Y - oy;
    // too small to read: no text (a pixel or less a unit)
    if (Math.abs(ax * cy - ay * cx) * d.size * d.size < 9) return;
    ctx.save();
    ctx.transform(ax, ay, cx, cy, ox, oy);
    ctx.font = d.family.replace("SIZE", String(Math.round(d.size * 100) / 100));
    ctx.textAlign = d.align;
    ctx.textBaseline = d.base;
    ctx.fillStyle = shadeOf(view, d.rgb, 1, f.alpha * d.alpha, d.glow);
    ctx.fillText(d.str, 0, 0);
    ctx.restore();
  }

  /** Is edge i of face f (number fi of its part) inked: where the part ends, at the silhouette or at a crease (drawn
      by the first of its two faces)? */
  function inked(f, fi, front, i) {
    const o = f.nb[i];
    return o < 0 || front[o] !== 1 || (f.crease[i] && fi < o);
  }

  /** Which of parts a and b the eye sees in front: > 0 a is nearer (drawn later), < 0 b is. */
  function nearer(m, parts, a, b, ex, ey, ez, dist) {
    const k = m.sepF[a * parts.length + b];
    if (k) {
      // a plane of one part with the other wholly on its outer side: the eye on that side sees the outer one in front
      const f = k > 0 ? parts[a].faces[k - 1] : parts[b].faces[-k - 1];
      const out = f.nx * (ex - f.p[0]) + f.ny * (ey - f.p[1]) + f.nz * (ez - f.p[2]) > 0;
      // k > 0: b is the outer one; k < 0: a is
      return (k > 0) === out ? -1 : 1;
    }
    return dist[b] - dist[a];
  }

  /** The first part still to draw (need >= 0) that part a must be drawn after (a itself when there is none). */
  function waitsOn(m, a, n, np) {
    for (let x = 0; x < n; x++) {
      const b = m.act[x];
      if (b !== a && m.need[b] >= 0 && m.after[a * np + b]) return b;
    }
    return a;
  }
  /** No part left is free to go (each waits on another still to draw), so they wait round a cycle and one of its parts
      must go before a part it waits on. From part a, follow what each waits on until a part comes round again: that
      loop is a cycle. The part of it that waits on the fewest goes, the farthest of those: it breaks the fewest answers.
      (The farthest part left goes wrong two ways: it may only wait on a cycle, as the stack behind the body does, and
      go under the body it is in front of; or be the big body itself, and go under all the gun on its roof.) */
  function breakCycle(m, a, n, np) {
    const act = m.act;
    const need = m.need;
    const dist = m.dist;
    const seen = m.seen;
    for (let x = 0; x < n; x++) seen[act[x]] = 0;
    while (!seen[a]) {
      seen[a] = 1;
      a = waitsOn(m, a, n, np);
    }
    let best = a;
    for (let c = waitsOn(m, a, n, np); c !== a; c = waitsOn(m, c, n, np)) if (need[c] < need[best] || (need[c] === need[best] && dist[c] > dist[best])) best = c;
    return best;
  }

  /** Draw a built model; returns how many faces it drew. */
  function draw(ctx, m, view) {
    const parts = m.parts;
    const eye = view.eye;
    const ex = eye[0];
    const ey = eye[1];
    const ez = eye[2];
    const lod = view.lod | 0;
    nearD = view.near > 0 ? view.near : 1e-3 * m.size;
    // far to near: each part after every part it is in front of where the two can overlap on the screen (by the plane
    // between them where there is one, else by their centres' distance less their bias), then the parts go in an order
    // that keeps all of these (the farthest of those free to go first; a cycle, none free, is broken by breakCycle).
    // One plane's answer says nothing about a third part: a sort that stops at the first part it is in front of (the
    // far side's wheels) can put it over one it is behind (the body); and two parts apart on the screen have nothing
    // to settle, but their answers could close a cycle (the stack beside the rack, both on the body)
    const order = m.order;
    const dist = m.dist;
    const act = m.act;
    const need = m.need;
    const after = m.after;
    const sb = m.sbox;
    const np = parts.length;
    let n = 0;
    for (let i = 0; i < np; i++) {
      const pt = parts[i];
      if (pt.lod < lod) continue;
      const dx = pt.cx - ex;
      const dy = pt.cy - ey;
      const dz = pt.cz - ez;
      dist[i] = Math.sqrt(dx * dx + dy * dy + dz * dz) - pt.bias;
      act[n++] = i;
      need[i] = 0;
      // its reach on the screen: its box cut at the near plane as its faces are (its corners in front of the plane and
      // where its edges cross it; none in front: an empty box, nothing to settle). Taken as all of the screen, a box the
      // camera stands beside (the plow's, beside the cab) was set against every part, and the cycles that closed put
      // the roof gun over the body there
      const b = pt.box;
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      let cut = false;
      for (let c = 0; c < 8; c++) {
        view.project(c & 1 ? b[3] : b[0], c & 2 ? b[4] : b[1], c & 4 ? b[5] : b[2]);
        BOX_D[c] = view.D;
        if (!(view.D > nearD)) {
          cut = true;
          continue;
        }
        x0 = Math.min(x0, view.X);
        y0 = Math.min(y0, view.Y);
        x1 = Math.max(x1, view.X);
        y1 = Math.max(y1, view.Y);
      }
      if (cut) {
        const at = nearD * BOX_CUT;
        for (let e = 0; e < 24; e += 2) {
          const p = BOX_EDGES[e];
          const q = BOX_EDGES[e + 1];
          const dp = BOX_D[p];
          const dq = BOX_D[q];
          if ((dp > nearD) === (dq > nearD)) continue;
          // (an end in front but nearer than the cut is already in: the crossing is at most that end)
          const t = Math.min(1, Math.max(0, (at - dp) / (dq - dp)));
          const px = p & 1 ? b[3] : b[0];
          const py = p & 2 ? b[4] : b[1];
          const pz = p & 4 ? b[5] : b[2];
          view.project(px + ((q & 1 ? b[3] : b[0]) - px) * t, py + ((q & 2 ? b[4] : b[1]) - py) * t, pz + ((q & 4 ? b[5] : b[2]) - pz) * t);
          if (!(view.D > nearD)) continue;
          x0 = Math.min(x0, view.X);
          y0 = Math.min(y0, view.Y);
          x1 = Math.max(x1, view.X);
          y1 = Math.max(y1, view.Y);
        }
      }
      sb[i * 4] = x0;
      sb[i * 4 + 1] = y0;
      sb[i * 4 + 2] = x1;
      sb[i * 4 + 3] = y1;
    }
    for (let x = 0; x < n; x++) {
      const a = act[x];
      for (let y = x + 1; y < n; y++) {
        const b = act[y];
        if (sb[a * 4] > sb[b * 4 + 2] || sb[b * 4] > sb[a * 4 + 2] || sb[a * 4 + 1] > sb[b * 4 + 3] || sb[b * 4 + 1] > sb[a * 4 + 3]) {
          after[a * np + b] = 0;
          after[b * np + a] = 0;
          continue;
        }
        const ab = nearer(m, parts, a, b, ex, ey, ez, dist) > 0 ? 1 : 0;
        after[a * np + b] = ab;
        after[b * np + a] = 1 - ab;
        need[ab ? a : b]++;
      }
    }
    for (let k = 0; k < n; k++) {
      let best = -1;
      for (let x = 0; x < n; x++) {
        const a = act[x];
        if (need[a] < 0) continue;
        if (best < 0 || (need[a] === 0 && need[best] > 0) || ((need[a] === 0) === (need[best] === 0) && dist[a] > dist[best])) best = a;
      }
      if (need[best] > 0) best = breakCycle(m, best, n, np);
      order[k] = best;
      need[best] = -1;
      for (let x = 0; x < n; x++) {
        const a = act[x];
        if (need[a] > 0 && after[a * np + best]) need[a]--;
      }
    }
    const front = m.front;
    let drawn = 0;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (let oi = 0; oi < n; oi++) {
      const pt = parts[order[oi]];
      const faces = pt.faces;
      for (let fi = 0; fi < faces.length; fi++) {
        const f = faces[fi];
        front[fi] = !f.hide && f.nx * (ex - f.cx) + f.ny * (ey - f.cy) + f.nz * (ez - f.cz) > 0 ? 1 : 0;
      }
      for (let fi = 0; fi < faces.length; fi++) {
        if (!front[fi]) continue;
        const f = faces[fi];
        if (!pathOf(ctx, view, f.p, f.n, true, true)) {
          front[fi] = 2; // in front of the camera's plane only behind the near cut: no ink either
          continue;
        }
        const lit = f.glow ? 1 : view.lit(f.nx, f.ny, f.nz);
        ctx.fillStyle = shadeOf(view, f.rgb, lit, f.alpha, f.glow);
        ctx.fill();
        drawn++;
        for (let di = 0; di < f.decals.length; di++) decal(ctx, view, f, f.decals[di], lit);
      }
      if (!(pt.ink > 0) || !(view.ink > 0)) continue;
      // the part's ink: every edge once, where the part ends, at its silhouette and at its creases; a face's inked
      // edges that follow on round it are one line (from the edge after one that is not inked)
      ctx.beginPath();
      let any = false;
      for (let fi = 0; fi < faces.length; fi++) {
        if (front[fi] !== 1) continue;
        const f = faces[fi];
        let s0 = 0;
        for (let i = f.n - 1; i >= 0; i--) {
          if (!inked(f, fi, front, i)) {
            s0 = (i + 1) % f.n;
            break;
          }
        }
        let projected = false;
        let on = false; // the last edge drawn ends where the next starts
        for (let c = 0; c < f.n; c++) {
          const i = (s0 + c) % f.n;
          if (!inked(f, fi, front, i)) {
            on = false;
            continue;
          }
          if (!projected) {
            projectAll(view, f.p, f.n);
            projected = true;
          }
          if (!clipSeg(view, f.p, i, (i + 1) % f.n)) {
            on = false;
            continue;
          }
          if (!on || !SIN[i]) ctx.moveTo(SEG[0], SEG[1]);
          ctx.lineTo(SEG[2], SEG[3]);
          on = !!SIN[(i + 1) % f.n];
          any = true;
        }
      }
      if (any) {
        ctx.lineWidth = Math.max(0.5, view.ink * pt.ink);
        ctx.strokeStyle = shadeOf(view, INK_RGB, 1, 1, false);
        ctx.stroke();
      }
    }
    return drawn;
  }

  /** A view for a camera of the caller's: fills in the defaults draw() reads (one object, reuse it). */
  function view(o) {
    return Object.assign({ X: 0, Y: 0, D: 0, eye: new Float64Array(3), ink: 1.5, lod: 0, fog: 0, fogR: 0, fogG: 0, fogB: 0, tint: 0, tintR: 255, tintG: 255, tintB: 255, near: 0, lit: () => 1, project: () => false }, o || {});
  }

  ZSR.Model3D = { FOG_STEPS, LIGHT_STEPS, CREASE_DEG, MAX_V, MESH_KEEP, Builder, define, mesh, draw, view, rgb, cstr, builders, meshes };
})(typeof window !== "undefined" ? window : globalThis);
