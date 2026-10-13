#!/usr/bin/env node
/* Runs the first-person engine (js/interior.js + building.js + yard.js) in node on a canvas that
   draws nothing, enters every layout and the yard, and checks what the engine makes of them:
   four landmarks with their defs, solid landmarks and their footprints blocked (and cover),
   a walkable start facing in, every decor entry applied to a face you can see, walkers on floor
   the player can reach, and frames that render without throwing.
   validate-world.js checks the layout data itself; this checks the engine reads it the same way. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");

/* ---------- A browser just big enough for the engine ---------- */
const noop = () => {};
let pixels = null; // made inside the sandbox below: pixel arrays from this realm would slow the engine down a lot
function context2d(canvas) {
  const gradient = { addColorStop: noop };
  const ctx = {
    canvas,
    globalAlpha: 1,
    lineWidth: 1,
    imageSmoothingEnabled: true,
    createImageData: pixels,
    getImageData: (x, y, w, h) => pixels(w, h),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createPattern: () => ({}),
    measureText: (t) => ({ width: String(t).length * 6 }),
  };
  // every other 2D call (fillRect, drawImage, arc, ...) does nothing
  return new Proxy(ctx, { get: (o, k) => (k in o ? o[k] : noop) });
}
function element(tag) {
  const el = {
    tagName: String(tag).toUpperCase(),
    style: {},
    dataset: {},
    textContent: "",
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    addEventListener: noop,
    removeEventListener: noop,
    appendChild: (c) => c,
    setAttribute: noop,
    getAttribute: () => null,
  };
  if (el.tagName === "CANVAS") {
    el.width = 300;
    el.height = 150;
    el.getContext = () => el.ctx || (el.ctx = context2d(el));
  }
  return el;
}
const byId = {};
const store = new Map();
const sb = {
  console,
  performance,
  innerWidth: 480, // small: the frames are rendered to catch errors, not to look at
  innerHeight: 270,
  addEventListener: noop,
  removeEventListener: noop,
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: noop,
  setTimeout: () => 0, // toasts: nothing to hide later
  clearTimeout: noop,
  localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
  document: {
    createElement: element,
    getElementById: (id) => byId[id] || (byId[id] = element("div")),
    querySelector: () => element("div"),
    querySelectorAll: () => [],
    addEventListener: noop,
    documentElement: element("html"),
    body: element("body"),
    pointerLockElement: null,
    hidden: false,
  },
};
sb.globalThis = sb;
sb.window = sb;
vm.createContext(sb);
pixels = vm.runInContext("(w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) })", sb);
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const WANT = ["layouts.js", "world.js", "upgrades.js", "state.js", "audio.js", "sprites.js", "sprites3d.js", "yardart.js", "interior.js", "building.js", "yard.js"];
const scripts = [...html.matchAll(/<script src="js\/([^"]+)"><\/script>/g)].map((m) => m[1]).filter((f) => WANT.includes(f) || f.startsWith("content/"));
for (const f of WANT) if (!scripts.includes(f)) scripts.push(f); // the page order first, then anything it lacks
scripts.forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, "js", f), "utf8"), sb, { filename: "js/" + f }));

const { ZSR } = sb;
const W = ZSR.WORLD;
const S = ZSR.State;
const D = ZSR.Draw3;
const I = ZSR.Interior;
const errors = [];
const err = (m) => errors.push(m);

// stand-in art for every decor and landmark key, so the engine applies all of them (the real art comes later)
Object.keys(ZSR.LAYOUT_DECOR || {}).forEach((k) => D.hasTexture(k) || D.registerTexture(k, noop));
Object.keys(ZSR.LAYOUT_ART || {}).forEach((k) => D.hasSprite(k) || D.registerSprite(k, 128, 128, noop));

I.init(element("canvas"), {});
S.newGame(1, "Test");
const OPAQUE = I.OPAQUE;
const SIDES = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
/** Render a few frames from the player's spot looking four ways (the DDA, planes, faces, sprites). */
function renderAround(ctx) {
  const p = I.player;
  const a0 = p.a;
  try {
    for (let k = 0; k < 4; k++) {
      p.a = a0 + (k * Math.PI) / 2;
      I.render();
    }
  } catch (e) {
    err(`${ctx}: render threw ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
  }
  p.a = a0;
}

let entered = 0;
W.LOCATIONS.filter((l) => l.id !== "base").forEach((loc) => {
  const ctx = loc.id;
  const lay = I.layoutFor(loc);
  if (!lay) return err(`${ctx}: no layout`);
  S.startTrip();
  try {
    I.enter(loc);
  } catch (e) {
    return err(`${ctx}: enter threw ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
  }
  I.stop();
  entered++;
  const gw = I.gw;
  const gh = I.gh;
  const solid = (x, y) => I.solidAt(x + 0.5, y + 0.5);
  const floorKeys = new Set(I.floors.map(([x, y]) => Math.floor(x) + "," + Math.floor(y)));

  // the legend: walls, shelves, crates, glass, low tiles, the cache door and the exit block movement; doors are doors;
  // the markers are floor (a solid landmark's footprint aside)
  const foot = new Set();
  I.landmarks.forEach((lm) => {
    const f = lm.def && lm.def.solid ? lm.def.foot || [1, 1] : null;
    if (f) for (let y = lm.y - (f[1] >> 1); y <= lm.y + (f[1] >> 1); y++) for (let x = lm.x - (f[0] >> 1); x <= lm.x + (f[0] >> 1); x++) foot.add(x + "," + y);
  });
  lay.grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const at = `${ctx}: "${ch}" at ${x},${y}`;
      if ("#WSXGCKRLE".includes(ch) && !solid(x, y)) err(`${at} is walkable in the engine`);
      else if (ch === "D" && !I.doors.some((d) => d.x === x && d.y === y)) err(`${at} is not a door in the engine`);
      else if (".inz$1234".includes(ch) && solid(x, y) !== foot.has(x + "," + y)) err(`${at} is ${solid(x, y) ? "solid" : "walkable"} in the engine`);
      if ("CKR".includes(ch) && !I.lowDefs[I.grid[y][x]]) err(`${at} is not drawn as a see-through low tile`);
      if ("CKR".includes(ch) && OPAQUE.includes(I.grid[y][x])) err(`${at} blocks sight in the engine`);
    }
  });

  // landmarks: one per digit, with the layout's def, drawn as a prop; solid ones block their tiles and stop shots
  const ids = I.landmarks.map((lm) => lm.id).sort().join("");
  if (ids !== "1234") err(`${ctx}: landmarks found ${ids || "none"}, want 1234`);
  I.solidMask();
  I.landmarks.forEach((lm) => {
    const def = lm.def;
    if (!def || !def.name || !def.art) return err(`${ctx}: landmark ${lm.id} at ${lm.x},${lm.y} has no def with a name and art`);
    if (!lm.prop || !I.props.includes(lm.prop)) err(`${ctx}: landmark ${lm.id} (${def.name}) has no prop`);
    if (lm.prop && !(lm.prop.img && lm.prop.img.width > 0)) err(`${ctx}: landmark ${lm.id} (${def.name}) has no image`);
    const fw = def.foot ? def.foot[0] >> 1 : 0;
    const fh = def.foot ? def.foot[1] >> 1 : 0;
    for (let y = lm.y - fh; y <= lm.y + fh; y++) {
      for (let x = lm.x - fw; x <= lm.x + fw; x++) {
        const tag = x === lm.x && y === lm.y ? "anchor" : "footprint tile";
        if (def.solid && !solid(x, y)) err(`${ctx}: landmark ${lm.id} (${def.name}) ${tag} ${x},${y} is walkable`);
        if (def.solid && floorKeys.has(x + "," + y)) err(`${ctx}: landmark ${lm.id} (${def.name}) ${tag} ${x},${y} is a spawn floor`);
        if (def.solid && (def.size || 1.6) > 0.6 && !I.coverMask[y * gw + x]) err(`${ctx}: landmark ${lm.id} (${def.name}) ${tag} ${x},${y} does not stop shots`);
      }
    }
    // a big landmark under a ceiling keeps its footprint's width (the art is squeezed to the ceiling, not shrunk)
    if (def.foot && def.foot[0] > 1 && !(lm.prop.span >= def.foot[0] * 0.9)) err(`${ctx}: landmark ${lm.id} (${def.name}) is not drawn across its ${def.foot[0]}-wide footprint`);
  });

  // the start: on walkable floor next to the exit, facing into the building
  const [sx, sy, sa] = I.startPos;
  const ex = I.exit;
  if (!ex) err(`${ctx}: no exit`);
  else {
    if (solid(Math.floor(sx), Math.floor(sy))) err(`${ctx}: start ${sx},${sy} is solid`);
    if (Math.abs(Math.floor(sx) - ex.x) + Math.abs(Math.floor(sy) - ex.y) !== 1) err(`${ctx}: start ${sx},${sy} is not next to the exit ${ex.x},${ex.y}`);
    if (Math.cos(sa) * (sx - ex.x - 0.5) + Math.sin(sa) * (sy - ex.y - 0.5) <= 0) err(`${ctx}: the start faces the exit, not the building`);
  }

  // decor: every entry lands on a wall-like tile, on a face that borders open floor
  (lay.decor || []).forEach((d) => {
    const at = `${ctx}: decor ${d.tex} at ${d.x},${d.y}`;
    const t = I.tileTex[d.x + "," + d.y];
    if (!t) return err(`${at} was not applied (tile "${(I.grid[d.y] || [])[d.x]}")`);
    if (d.face) {
      if (!SIDES[d.face]) return err(`${at}: face "${d.face}" is not n, e, s or w`);
      if (!(typeof t === "object" && !t.width && t[d.face])) err(`${at}: face ${d.face} was not applied`);
      const nx = d.x + SIDES[d.face][0];
      const ny = d.y + SIDES[d.face][1];
      if (nx < 0 || ny < 0 || nx >= gw || ny >= gh || OPAQUE.includes(I.grid[ny][nx])) err(`${at}: face ${d.face} looks into a wall, nobody sees it`);
    }
  });

  // walkers: the right number, each on open floor the player can reach once the doors are open
  const want = W.SETTINGS.walkersPerLocation(loc.danger, S.save.day);
  if (I.walkers.length !== want) err(`${ctx}: ${I.walkers.length} walkers, want ${want} (day ${S.save.day})`);
  const reach = I.reachable(Math.floor(sx), Math.floor(sy), true);
  I.walkers.forEach((z) => {
    const k = Math.floor(z.x) + "," + Math.floor(z.y);
    if (solid(Math.floor(z.x), Math.floor(z.y))) err(`${ctx}: a walker starts inside something solid at ${k}`);
    else if (!reach.has(k)) err(`${ctx}: a walker at ${k} can never reach the player`);
  });
  // shots: a walker straight behind a solid landmark is cover; one straight behind a counter is not
  const shotPast = (x, y0, y1, label, hittable) => {
    I.walkers.length = 0;
    const z = I.makeWalker("walker", x + 0.5, y0 + 0.5, 1);
    I.walkers.push(z);
    Object.assign(I.player, { x: x + 0.5, y: y1 + 0.5, a: y0 < y1 ? -Math.PI / 2 : Math.PI / 2 });
    if ((I.walkerAt(0) === z) !== hittable) err(`${ctx}: a walker behind ${label} ${hittable ? "cannot" : "can"} be shot`);
  };
  const open = (x, y) => !solid(x, y) && !OPAQUE.includes(I.grid[y][x]);
  I.landmarks.forEach((lm) => {
    if (!lm.def || !lm.def.solid || (lm.def.size || 1.6) <= 0.6) return;
    const fh = lm.def.foot ? lm.def.foot[1] >> 1 : 0;
    const n = lm.y - fh - 1;
    const s = lm.y + fh + 1;
    if (open(lm.x, n) && open(lm.x, s)) shotPast(lm.x, n, s, lm.def.name, false);
  });
  const counter = lay.grid.findIndex((row, y) => y > 0 && y < gh - 1 && [...row].some((ch, x) => ch === "C" && open(x, y - 1) && open(x, y + 1)));
  if (counter > 0) {
    const x = [...lay.grid[counter]].findIndex((ch, xx) => ch === "C" && open(xx, counter - 1) && open(xx, counter + 1));
    shotPast(x, counter - 1, counter + 1, "the counter at " + x + "," + counter, true);
  }

  renderAround(ctx);
});

// the yard: enters, renders, and the fence stays see-through (and shoot-over)
S.trip = null; // home: no trip running
try {
  I.enterYard({ firstCalm: 999 });
  I.stop();
  renderAround("yard");
  const f = Object.keys(I.fence)[0];
  if (!f) err("yard: no fence segments");
  else if (I.solidMask() && I.coverMask[I.gw * +f.split(",")[1] + +f.split(",")[0]]) err("yard: the fence stops shots");
} catch (e) {
  err(`yard: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
}

if (errors.length) {
  errors.forEach((e) => console.log("ERROR " + e));
  console.log(`\n${errors.length} engine problem(s).`);
  process.exit(1);
}
console.log(`OK: engine entered ${entered} buildings and the yard: landmarks, footprints, start, decor, walkers, frames.`);
