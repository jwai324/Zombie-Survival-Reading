#!/usr/bin/env node
/* The angled road's scenery at scale, checked by counts, never by milliseconds (js/perspective-art.js vegLayout and
   buckets, js/perspective.js drawWorld's plant and prop loops, its scenery governor and release, js/perspective-gl.js
   keepFor and release, js/sprites.js inRiver), on the real road code with the page stubbed:
   - the plant layout on a synthetic city 1, 2 and 3 times as wide (today's copied) along the same drive: the squares
     made, the plants made, the spots tried and what each square looked at stay the same; only the index grows, with
     the roads; a drive's first view makes a bounded number of squares;
   - plants are seeded by place: a square made again is the same, and as thick across a square's edge as inside it;
   - nothing grows in the river: no plant, moss mark or prop on the water on the drives along it;
   - the props filed by square give a frame exactly the props a look at all of them gives; a far wreck, barrier or
     sign is drawn simpler;
   - the scenery governor: slow frames step it down a row at a time (fewer plants drawn), fast ones back up after the
     wait, never the walkers' governor's rows; its settings fade in rather than jump;
   - a real stop lets go of the ground squares, the plants and the walkers' canvases; a wrong turn's retry keeps them;
   - the card keeps at least what the view and the views ahead need at 1280x800, 1920x1080 and 2560x1080.
   Exit 1 on any error. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const noop = () => {};
const el = () => ({
  style: { setProperty: noop },
  classList: { add: noop, remove: noop, toggle: noop, contains: () => true },
  textContent: "",
  children: [],
  offsetWidth: 0,
  addEventListener: noop,
  getContext: () => null,
  getBoundingClientRect: () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }),
});
// a 2D context that draws nothing and counts what it was asked to do (calls by name; arcs and ellipses kept)
const counts = {};
const marks = [];
function context2d(canvas) {
  const state = { fillStyle: "#000", strokeStyle: "#000", globalAlpha: 1, lineWidth: 1, font: "10px sans-serif", imageSmoothingEnabled: true, imageSmoothingQuality: "low", globalCompositeOperation: "source-over" };
  const xf = [];
  let m = [1, 0, 0, 1, 0, 0];
  const calls = {
    save: () => xf.push(m.slice()),
    restore: () => xf.length && (m = xf.pop()),
    setTransform: (a, b, c, d, e, f) => (m = [a, b, c, d, e, f]),
    transform: (a, b, c, d, e, f) => (m = [m[0] * a + m[2] * b, m[1] * a + m[3] * b, m[0] * c + m[2] * d, m[1] * c + m[3] * d, m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]]),
    translate: (x, y) => (m = [m[0], m[1], m[2], m[3], m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]),
    rotate: (a) => {
      const c = Math.cos(a);
      const s = Math.sin(a);
      m = [m[0] * c + m[2] * s, m[1] * c + m[3] * s, m[2] * c - m[0] * s, m[3] * c - m[1] * s, m[4], m[5]];
    },
    scale: (x, y) => (m = [m[0] * x, m[1] * x, m[2] * y, m[3] * y, m[4], m[5]]),
    measureText: (t) => ({ width: String(t).length * 6 }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createPattern: () => ({}),
    getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) }),
    getTransform: () => ({ a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5] }),
    // a mark on the ground: where it is in the world (the context's transform applied to its middle)
    arc: (x, y) => marks.push([m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]),
    ellipse: (x, y) => marks.push([m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]),
  };
  return new Proxy(
    {},
    {
      get(o, k) {
        if (k === "canvas") return canvas;
        if (k in state) return state[k];
        if (k in o) return o[k];
        if (typeof k !== "string") return undefined;
        return (...args) => {
          counts[k] = (counts[k] || 0) + 1;
          return calls[k] ? calls[k](...args) : undefined;
        };
      },
      set(o, k, v) {
        if (k in state) state[k] = v;
        else o[k] = v;
        return true;
      },
    },
  );
}
const canvasEl = () => {
  const c = Object.assign(el(), { width: 300, height: 150, tagName: "CANVAS" });
  c.getContext = (kind) => (kind === "2d" ? c.ctx || (c.ctx = context2d(c)) : null);
  return c;
};
Object.assign(globalThis, {
  document: { getElementById: el, querySelector: el, documentElement: { getAttribute: () => "normal" }, addEventListener: noop, hidden: false, createElement: (t) => (String(t).toLowerCase() === "canvas" ? canvasEl() : el()) },
  addEventListener: noop,
  innerWidth: 1280,
  innerHeight: 720,
  devicePixelRatio: 1,
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: noop,
});
for (const f of ["js/layouts.js", "js/world.js", "js/upgrades.js", "js/streets.js", "js/sprites.js", "js/sprites3d.js", "js/walker3d.js", "js/walker3d-looks.js", "js/landmarks1.js", "js/landmarks2.js", "js/game.js", "js/perspective.js", "js/perspective-buildings.js", "js/perspective-art.js", "js/perspective-gl.js", "js/interior.js"]) {
  const file = path.join(ROOT, f);
  if (fs.existsSync(file)) vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: f });
}
const ZSR = globalThis.ZSR;
const W = ZSR.WORLD;
const S = ZSR.Streets;
const G = ZSR.Game;
const P = ZSR.Persp;
const GL = ZSR.PerspGL;
const Art = ZSR.PerspArt;
const Dr = ZSR.Draw;
const errors = [];
const err = (c, m) => errors.push(c + ": " + m);

const upgrades = {};
Object.keys(ZSR.Upgrades.DEFS).forEach((k) => (upgrades[k] = 0));
ZSR.State = { save: { day: 1, upgrades, scrap: 0 }, trip: null, settings: { aimAssist: false, shake: false }, effects: () => ({ headlights: true, crates: 0, vanDamage: 1 }), isKnown: () => true, cheat: () => false, meetWalker: noop };
ZSR.Audio = { play: noop, unlock: noop };
let arrived = null;
let wrongTurn = null;
const screen = canvasEl();
screen.width = 1280;
screen.height = 720;
G.init(screen, { onArrive: (to) => (arrived = to), onWrongTurn: (i) => (wrongTurn = i), onDeath: noop, onPause: noop, onPauseKey: noop });
const ctx = screen.getContext("2d");
function start(a, b, engine) {
  upgrades.engine = engine || 0;
  ZSR.State.trip = { at: a, vanHp: 1e9, vanMaxHp: 1e9, scrap: 0, walkers: 0, miles: 0 };
  const r = S.route(a, b);
  const L = W.LOCATIONS.find((l) => l.id === b);
  arrived = null;
  wrongTurn = null;
  G.startTrip({ to: b, name: L.name, danger: L.danger, path: r.path });
  G.spawnTimer = 1e9; // no walkers: this is about the scenery
}
/** One frame of the drive: a careful driver (the right lane a second before each stop line, or `pick`'s), then the
    angled view's world drawn (the 2D ground: no card in Node unless a test gives it one). */
function step(pick, draw) {
  const dec = G.upcoming();
  G.keys.left = G.keys.right = false;
  if (dec && !G.turn && (dec.stop - G.van.s) / G.speed < 1.0) {
    const q = (pick || ((d) => d.options.find((o) => o.correct)))(dec);
    const lane = q.lanes.reduce((best, l) => (Math.abs(S.laneCenter(l, dec.n) - G.van.d) < Math.abs(S.laneCenter(best, dec.n) - G.van.d) ? l : best), q.lanes[0]);
    const tg = S.laneCenter(lane, dec.n);
    if (Math.abs(G.van.d - tg) < 40) G.van.d = tg;
    else G.keys[G.van.d > tg ? "left" : "right"] = true;
  }
  G.update(1 / 60);
  if (draw && G.running) P.drawWorld(G, ctx, null);
}
const listed = (t) => P.list.filter((o) => o._t === t);

/* ---------- the plant layout does not grow with the city ---------- */
{
  const lay = (m) => err("plant layout", m);
  const rows = [];
  for (const N of [1, 2, 3]) {
    start("river", "mall");
    const D = G.drive;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const n of D.nodes) {
      x0 = Math.min(x0, n.x);
      y0 = Math.min(y0, n.y);
      x1 = Math.max(x1, n.x);
      y1 = Math.max(y1, n.y);
    }
    // a city N x N times today's: its roads, side streets, corners and lots copied, each copy shifted by the city's size
    const Wd = x1 - x0 + 2000;
    const Hd = y1 - y0 + 2000;
    const syn = Object.assign({}, D, { roads: [], sides: [], nodes: [], lots: [] });
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const mv = (s) => Object.assign({}, s, { x0: s.x0 + i * Wd, y0: s.y0 + j * Hd, x1: s.x1 + i * Wd, y1: s.y1 + j * Hd });
        D.roads.forEach((s) => syn.roads.push(mv(s)));
        D.sides.forEach((s) => syn.sides.push(mv(s)));
        D.nodes.forEach((n) => syn.nodes.push(Object.assign({}, n, { x: n.x + i * Wd, y: n.y + j * Hd })));
        D.lots.forEach((l) => syn.lots.push(Object.assign({}, l, { qx: l.qx + i * Wd, qy: l.qy + j * Hd })));
      }
    }
    const VL = Art.vegLayout(syn, 512);
    P.vegNo = 0; // (the same frames let go of the same squares)
    let first = null;
    let f = 0;
    while (G.running && !G.fade && f < 20000) {
      step(null, false);
      // the frame's world, with the big city's plants (drawWorld keeps a layout made for its drive)
      if (G.running && f % 6 === 0) {
        P.vegLayout = VL;
        VL.drive = G.drive;
        P.drawWorld(G, ctx, null);
        VL.drive = syn;
        if (!first) first = { squares: VL.stats.made, items: VL.stats.items };
      }
      f++;
    }
    rows.push({ N, roads: syn.roads.length, filed: VL.index.filed, made: VL.stats.made, items: VL.stats.items, tries: VL.stats.tries, near: VL.stats.near / VL.stats.made, looked: VL.index.looked / VL.stats.made, first, kept: VL.cells.size });
    G.stop();
    P.vegLayout = null;
  }
  const [a, b, c] = rows;
  for (const r of [b, c]) {
    if (r.made !== a.made) lay(`a city ${r.N}x as wide made ${r.made} squares of plants along the same drive (1x: ${a.made})`);
    // (the copies' roads by the first city's edges thicken the plants there a little)
    if (Math.abs(r.items - a.items) > a.items * 0.05) lay(`a city ${r.N}x as wide made ${r.items} plants along the same drive (1x: ${a.items})`);
    if (r.tries !== a.tries) lay(`a city ${r.N}x as wide tried ${r.tries} spots along the same drive (1x: ${a.tries})`);
    if (r.near > a.near + 1 || r.looked > a.looked + 2) lay(`a city ${r.N}x as wide: each square looked at ${r.near.toFixed(1)} roads and such, ${r.looked.toFixed(1)} filed (1x: ${a.near.toFixed(1)}, ${a.looked.toFixed(1)})`);
    if (r.filed > a.filed * r.N * r.N * 1.25) lay(`a city ${r.N}x as wide filed ${r.filed} entries for its roads (1x: ${a.filed}: want under ${r.N * r.N} times)`);
  }
  // SCALE: a drive's first view at 1280x720 (about 110 squares of 512 today); more means the view got deeper or wider
  if (!(a.first && a.first.squares > 20 && a.first.squares <= 200)) lay(`the first view made ${a.first && a.first.squares} squares of plants (want 20 to 200)`);
  if (Math.abs(a.tries / a.made - 18.2) > 18.2 * 0.15) lay(`squares tried ${(a.tries / a.made).toFixed(1)} spots each (a 512 square holds about 18.2 of the 120 grid's)`);
  if (!(c.kept < c.made / 3)) lay(`${c.kept} of ${c.made} squares of plants still kept at the drive's end (the view's old ones are let go)`);
  console.log(`plant layout: along river > mall, cities 1x/2x/3x as wide (${rows.map((r) => r.roads).join("/")} roads): squares made ${rows.map((r) => r.made).join("/")}, plants ${rows.map((r) => r.items).join("/")}, each square looked at ${rows.map((r) => r.near.toFixed(1)).join("/")} roads and such; index entries ${rows.map((r) => r.filed).join("/")}; first view ${a.first.squares} squares, ${a.first.items} plants`);
}

/* ---------- seeded by place: the same square again is the same; as thick across a square's edge ---------- */
{
  const seedErr = (m) => err("plant seeds", m);
  start("base", "grocery");
  const D = G.drive;
  const VL = Art.vegLayout(D, 512);
  // squares well away from every road (the land's own density, 0.5 a spot): a block of 12 x 12
  let x0 = 0;
  let y0 = 0;
  let found = false;
  for (let tx = -40; tx < 40 && !found; tx += 3) {
    for (let ty = -40; ty < 40 && !found; ty += 3) {
      const cx = tx * 512;
      const cy = ty * 512;
      const far = (x, y) => D.roads.every((s) => Math.hypot(x - (s.x0 + s.x1) / 2, y - (s.y0 + s.y1) / 2) > Math.hypot(s.x1 - s.x0, s.y1 - s.y0) / 2 + 2600) && D.nodes.every((n) => Math.hypot(n.x - x, n.y - y) > 2600) && !Dr.inRiver(x, y, 4000, D.scale);
      if (far(cx, cy) && far(cx + 12 * 512, cy) && far(cx, cy + 12 * 512) && far(cx + 12 * 512, cy + 12 * 512) && far(cx + 6 * 512, cy + 6 * 512)) {
        x0 = tx;
        y0 = ty;
        found = true;
      }
    }
  }
  if (!found) seedErr("found no land far from every road to check");
  let edge = 0;
  let inside = 0;
  let n = 0;
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
      const a = VL.get(x0 + i, y0 + j, 1);
      const json = JSON.stringify(a);
      VL.sweep(2); // let go of it: made again, it must be the same
      if (JSON.stringify(VL.get(x0 + i, y0 + j, 3)) !== json) seedErr(`square ${x0 + i}, ${y0 + j} came out different made again`);
      VL.sweep(4);
      for (const o of a) {
        const u = (((o.x % 512) + 512) % 512) / 512;
        if (u < 0.125 || u >= 0.875) edge++; // within 64 of a square's left or right edge
        else if (u >= 0.375 && u < 0.625) inside++; // the same width round its middle
        n++;
      }
    }
  }
  // (the 120 grid's spots straddle the squares' edges: a spot belongs to the square it falls in, so none is lost or
  // doubled there; by chance alone the two counts differ by about 2 x sqrt(n/4))
  if (Math.abs(edge - inside) > 3 * Math.sqrt(n / 2) + 4) seedErr(`plants near the squares' edges ${edge}, round their middles ${inside} (of ${n}): not as thick across an edge`);
  const per = n / 144;
  const want = (0.5 * 512 * 512) / (120 * 120);
  if (Math.abs(per - want) > want * 0.15) seedErr(`land far from the roads grows ${per.toFixed(1)} plants a square (want about ${want.toFixed(1)})`);
  console.log(`plant seeds: 144 squares far from the roads made twice, the same; ${per.toFixed(1)} plants a square (want ${want.toFixed(1)}), ${edge} by the squares' edges against ${inside} round their middles`);
  G.stop();
}

/* ---------- nothing in the river ---------- */
{
  const wetErr = (m) => err("river", m);
  const R = (x, y) => Dr.riverEdge(x, y, G.drive.scale);
  // the river's own middle is in it; far east of it, out
  start("base", "river");
  const k = G.drive.scale;
  if (!Dr.inRiver(60 * k, 520 * k, 0) || !Dr.inRiver(40 * k, 120 * k, 0)) wetErr("Draw.inRiver says the river's own middle is dry");
  if (Dr.inRiver(500 * k, 350 * k, 0)) wetErr("Draw.inRiver says the middle of town is in the river");
  G.stop();
  let plants = 0;
  let wet = 0;
  let wetProps = 0;
  let nearWater = 0;
  let wetMarks = 0;
  let marksNear = 0;
  for (const [a, b] of [["base", "river"], ["garden", "river"], ["river", "mall"], ["base", "watertower"], ["pharmacy", "watertower"]]) {
    start(a, b);
    let f = 0;
    while (G.running && !G.fade && f < 20000) {
      step(null, f % 30 === 0);
      if (G.running && f % 30 === 0) {
        for (const o of listed("plant")) {
          plants++;
          const e = R(o.x, o.y);
          if (e < 0) wet++;
          else if (e < 400) nearWater++;
        }
        for (const o of listed("prop")) if (R(o.x, o.y) < 0) wetProps++;
      }
      f++;
    }
    // the ground's overgrowth on squares over the river and its banks (as a ground square on the card draws it)
    const S0 = G.drive;
    for (let t = 0; t <= 1; t += 0.025) {
      const RC = [[[40, 120], [90, 330], [60, 520]], [[60, 520], [50, 620], [120, 690]]][t < 0.5 ? 0 : 1];
      const u = t < 0.5 ? t * 2 : (t - 0.5) * 2;
      const mx = ((1 - u) * (1 - u) * RC[0][0] + 2 * (1 - u) * u * RC[1][0] + u * u * RC[2][0]) * S0.scale;
      const my = ((1 - u) * (1 - u) * RC[0][1] + 2 * (1 - u) * u * RC[1][1] + u * u * RC[2][1]) * S0.scale;
      for (const off of [-1, 0, 1]) {
        marks.length = 0;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        Art.cover(ctx, { x: mx + off * (13 * S0.scale + 300), y: my, r: 362, half: 256, px: 2 }, S0, S.GEOM);
        for (const [x, y] of marks) {
          // (a mark's middle on the muddy bank is fine; in the water itself is not)
          const e = R(x, y);
          if (e < -45) wetMarks++;
          if (e < 200) marksNear++;
        }
      }
    }
    G.stop();
  }
  if (!(plants > 1000)) wetErr(`only ${plants} plants looked at on the river drives`);
  if (!(nearWater > 50)) wetErr(`only ${nearWater} plants within 400 of the river's bank: the drives did not pass it`);
  if (wet) wetErr(`${wet} plants stood in the river or on its bank`);
  if (wetProps) wetErr(`${wetProps} props stood in the river or on its bank`);
  if (wetMarks) wetErr(`${wetMarks} overgrowth marks on the river's water`);
  if (!(marksNear > 20)) wetErr(`only ${marksNear} overgrowth marks drawn near the river: the check saw nothing`);
  console.log(`river: ${plants} plants seen on 5 drives along it (${nearWater} within 400 of its bank), none in it, no props, no overgrowth on the water (${marksNear} marks by it)`);
}

/* ---------- props filed by square: the same as looking at all of them; a far prop is simpler ---------- */
{
  const propErr = (m) => err("props", m);
  start("base", "hospital");
  let frames = 0;
  let diff = 0;
  let seen = 0;
  const all = (idx) => ({ B: Infinity, find: (x0, y0, x1, y1, fn) => G.props.forEach((p) => !Dr.inRiver(p.x, p.y, 0, G.drive.scale) && fn(p)), each: (bx, by, fn) => G.props.forEach((p) => !Dr.inRiver(p.x, p.y, 0, G.drive.scale) && fn(p)) });
  let f = 0;
  while (G.running && !G.fade && f < 20000) {
    step(null, false);
    if (G.running && f % 40 === 0) {
      P.drawWorld(G, ctx, null);
      const a = new Set(listed("prop"));
      const idx = P.propIdx;
      P.propIdx = all();
      P.drawWorld(G, ctx, null);
      const b = new Set(listed("prop"));
      P.propIdx = idx;
      for (const p of a) if (!b.has(p)) diff++;
      for (const p of b) if (!a.has(p)) diff++;
      seen += b.size;
      frames++;
    }
    f++;
  }
  if (diff) propErr(`${diff} props differ between the props filed by square and a look at all of them (over ${frames} frames)`);
  if (!(seen > 100)) propErr(`only ${seen} props seen over a drive`);
  // a far one: fewer things drawn, nothing for the picture's detail at d 0
  start("base", "grocery");
  G.update(1 / 60);
  P.setup(G);
  const k = P.k;
  const at = (Y) => ({ x: k.ox + k.Fx * Y, y: k.oy + k.Fy * Y });
  const n = (fn) => {
    for (const key of Object.keys(counts)) delete counts[key];
    fn();
    return (counts.fill || 0) + (counts.stroke || 0) + (counts.drawImage || 0);
  };
  for (const kind of ["wreck", "barrier", "sign"]) {
    const p = Object.assign({ kind, face: k.Fx, rot: 0.3, color: "#5a4538", text: "SLOW" }, at(1500));
    const full = n(() => P.prop(ctx, p, 1));
    const half = n(() => P.prop(ctx, p, 0.5));
    const far = n(() => P.prop(ctx, p, 0));
    if (!(far < full)) propErr(`a far ${kind} draws ${far} things, not fewer than near (${full})`);
    if (!(half >= far)) propErr(`a ${kind} halfway into its simpler self draws ${half} things, fewer than the simple one (${far}): it would pop`);
  }
  G.stop();
  console.log(`props: ${seen} seen over ${frames} frames, the same filed by square as all looked at; far wrecks, barriers and signs simpler`);
}

/* ---------- the scenery governor ---------- */
{
  const govErr = (m) => err("scenery governor", m);
  start("river", "mall");
  for (let i = 0; i < 400; i++) step(null, false);
  P.liveRow();
  const S0 = P.scen || (P.sceneryRow(G), P.scen);
  Object.assign(S0, { level: 0, smooth: 0, slowT: 0, fastT: 0, holdT: 0, upWait: [], warm: 10, liveAt: P.liveLevel | 0, drive: G.drive });
  P.sceneryEase(Infinity);
  const live0 = P.liveLevel;
  let n = (G.rafN = 1);
  // one frame `ms` after the last: drawn (the plants counted), or only the governor's step (as drawWorld takes it)
  const frame = (ms, draw) => {
    G.rafN = ++n;
    G.rafMs = ms;
    if (draw === false) P.sceneryRow(G);
    else P.drawWorld(G, ctx, null);
    return P.frameStats;
  };
  const plants0 = frame(16.7).plants;
  // slow frames (40 ms): a row down after SCENERY_SLOW_SECS, the next after its hold; the eased setting fades in
  const levels = [];
  let faded = false;
  for (let i = 0; i < 300; i++) {
    const fs0 = frame(40, i % 10 === 0);
    levels.push(fs0.scenery);
    if (fs0.scenery === 2 && P.scen.cur.minPx > 0 && P.scen.cur.minPx < 16) faded = true;
  }
  const firstDown = levels.indexOf(1);
  if (firstDown < 0) govErr(`300 frames at 40 ms never stepped it down (rows ${[...new Set(levels)].join(",")})`);
  else if (firstDown * 0.04 < 1.5) govErr(`it stepped down after ${(firstDown * 0.04).toFixed(2)} s of slow frames (want its slow wait first)`);
  for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) govErr(`it skipped a row: ${levels[i - 1]} to ${levels[i]}`);
  const low = levels[levels.length - 1];
  if (!(low >= 2)) govErr(`12 s at 40 ms only got it down to row ${low}`);
  if (!faded) govErr("its plants' size limit jumped to the row's instead of easing in");
  for (let i = 0; i < 120; i++) frame(40, false); // (all eased in)
  const plantsLow = frame(40).plants;
  if (!(plantsLow < plants0 * 0.9)) govErr(`row ${P.scen.level} draws ${plantsLow} plants against row 0's ${plants0}`);
  if (P.liveLevel !== live0) govErr(`the scenery governor moved the walkers' row from ${live0} to ${P.liveLevel}`);
  // the walkers' governor changes its row: the scenery's clocks start over (it holds a moment)
  P.liveLevel = (live0 | 0) + 1;
  const lv0 = P.scen.level;
  frame(16.7);
  if (!(P.scen.holdT > 0)) govErr("a change of the walkers' row did not hold the scenery governor");
  P.liveLevel = live0;
  // fast frames: back up a row after its wait (doubled for a row it had to leave), never two at once
  const up = [];
  for (let i = 0; i < 60 * 60; i++) up.push(frame(16.7, false).scenery);
  const firstUp = up.findIndex((l) => l < lv0);
  if (firstUp < 0) govErr(`a minute at 16.7 ms never stepped it back up from row ${lv0}`);
  else if (firstUp / 60 < 8) govErr(`it stepped back up after ${(firstUp / 60).toFixed(1)} s of fast frames (want its wait first)`);
  for (let i = 1; i < up.length; i++) if (up[i] < up[i - 1] - 1) govErr(`it climbed two rows at once: ${up[i - 1]} to ${up[i]}`);
  // a long gap (a tab in the background) and a paused road say nothing
  const lvP = P.scen.level;
  G.paused = true;
  for (let i = 0; i < 300; i++) frame(80, false);
  G.paused = false;
  frame(2000, false);
  if (P.scen.level !== lvP) govErr(`paused frames and a long gap moved it from row ${lvP} to ${P.scen.level}`);
  console.log(`scenery governor: 40 ms frames stepped it down after ${(firstDown * 0.04).toFixed(1)} s to row ${low} (${plants0} plants drawn to ${plantsLow}), eased in; 16.7 ms frames back up after ${(firstUp / 60).toFixed(1)} s; walkers' rows untouched`);
  delete G.rafN;
  delete G.rafMs;
  Object.assign(P.scen, { level: 0, smooth: 0, slowT: 0, fastT: 0, holdT: 0, upWait: [], rafN: null });
  P.sceneryEase(Infinity);
  G.stop();
}

/* ---------- a real stop lets go; a wrong turn's retry keeps the drive's ---------- */
{
  const relErr = (m) => err("release", m);
  // the card on a WebGL context that does nothing (every shader compiles)
  const stub = new Proxy({}, { get: (o, k) => (typeof k !== "string" ? undefined : /^[A-Z_0-9]+$/.test(k) ? 0 : /^get(Shader|Program)Parameter$/.test(k) ? () => true : k === "getExtension" ? () => null : () => ({})) });
  const card = { width: 0, height: 0, style: {}, setAttribute: noop, addEventListener: noop, getContext: (kind) => (kind === "webgl" ? stub : kind === "2d" ? context2d(card) : null) };
  const realDoc = globalThis.document;
  const realCanvas = G.canvas;
  let deleted = 0;
  try {
    globalThis.document = Object.assign({}, realDoc, { createElement: (t) => (String(t).toLowerCase() === "canvas" && !GL.canvas ? card : canvasEl()) });
    GL.ok = null;
    G.canvas = Object.assign(screen, { parentNode: { insertBefore: noop } });
    if (!GL.init(G)) relErr("the card would not start on a stub context");
    const del = GL.gl.deleteTexture;
    GL.gl = new Proxy(GL.gl, { get: (o, k) => (k === "deleteTexture" ? () => deleted++ : o[k]) });
    void del;
    start("base", "grocery");
    for (let i = 0; i < 240; i++) step(null, true);
    const tiles = GL.tiles.size;
    const squares = P.vegLayout ? P.vegLayout.cells.size : 0;
    if (!(tiles > 50 && squares > 20)) relErr(`a drive under way holds only ${tiles} ground squares and ${squares} squares of plants`);
    // a wrong turn, then try again: the drive is the same, so its squares stay
    G.stop();
    if (GL.tiles.size || P.vegLayout || (P.livePool && P.livePool.size) || (P.liveSpare && P.liveSpare.length) || Object.keys(GL.scratch).length) relErr(`after a stop: ${GL.tiles.size} ground squares, plants ${P.vegLayout ? "kept" : "gone"}, ${P.livePool ? P.livePool.size : 0} walker canvases, ${Object.keys(GL.scratch).length} scratch canvases left`);
    if (deleted < tiles) relErr(`a stop deleted ${deleted} textures of ${tiles}`);
    start("base", "grocery");
    let f = 0;
    while (G.running && !G.fade && f < 5000) {
      step((d) => d.options.find((o) => !o.correct && o.kind !== "drive") || d.options.find((o) => !o.correct), true);
      f++;
    }
    while (G.running && G.fade && G.fade.phase !== "choose" && f < 6000) {
      G.update(1 / 60);
      f++;
    }
    const before = GL.tiles.size;
    if (!wrongTurn) relErr("the wrong way did not come to the wrong-turn panel");
    G.retry();
    for (let i = 0; i < 30; i++) step(null, true);
    const kept = GL.tiles.size;
    if (!(before > 50) || !(kept > 50) || !P.vegLayout) relErr(`a wrong turn's retry lost the drive's squares (${before} before, ${kept} after, plants ${P.vegLayout ? "kept" : "gone"})`);
    G.stop();
    console.log(`release: a stop let go of ${tiles} ground squares (${deleted} textures deleted), ${squares} squares of plants and the walkers' canvases; a wrong turn's retry kept its ${kept}`);
  } finally {
    globalThis.document = realDoc;
    G.canvas = realCanvas;
    GL.ok = null;
    GL.gl = null;
    GL.canvas = null;
    GL.on = false;
    GL.tiles = new Map();
    GL.drive = null;
  }
}

/* ---------- the card keeps what the view and the views ahead need ---------- */
{
  const keepErr = (m) => err("ground squares kept", m);
  const out = [];
  for (const [w, h] of [[1280, 800], [1920, 1080], [2560, 1080]]) {
    G.W = w;
    G.H = h;
    const zoom = Math.max(0.55, Math.min(1, Math.min(w / 1000, h / 640)));
    let worst = 0;
    let view = 0;
    for (const th of [0, 0.4, 0.785, 1.2]) {
      const g = { W: w, H: h, zoom, cam: { x: 5000, y: 5000, th }, shakeX: 0, shakeY: 0 };
      const k = P.setup(g);
      const set = new Set();
      let n = 0;
      GL.under(P, k.ox, k.oy, k.Fx, k.Fy, (grid, tx, ty, lod) => {
        n++;
        set.add(grid.T + ":" + tx + "," + ty + "," + lod);
      });
      // the views ahead on a straight at a fast van's speed (Engine Tune 5 on the angled camera: about 640 a second)
      for (const s of [0.35, 0.7, 1.1]) GL.under(P, k.ox + k.Fx * 640 * s, k.oy + k.Fy * 640 * s, k.Fx, k.Fy, (grid, tx, ty, lod) => set.add(grid.T + ":" + tx + "," + ty + "," + lod));
      view = Math.max(view, n);
      worst = Math.max(worst, set.size);
    }
    GL.keepSig = null;
    const keep = GL.keepFor(P);
    if (!(keep >= worst + 40)) keepErr(`${w}x${h}: the card keeps ${keep} squares, the view and the views ahead need ${worst}`);
    out.push(`${w}x${h} keeps ${keep} (view ${view}, with the views ahead ${worst})`);
  }
  G.W = 1280;
  G.H = 720;
  GL.keepSig = null;
  console.log(`ground squares kept: ${out.join("; ")}`);
}

errors.slice(0, 40).forEach((e) => console.log("ERROR " + e));
if (errors.length > 40) console.log(`... ${errors.length - 40} more errors`);
console.log(errors.length ? `FAILED: ${errors.length} errors` : "ok");
process.exit(errors.length ? 1 : 0);
