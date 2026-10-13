#!/usr/bin/env node
/* Runs the first-person engine (js/interior.js + building.js + yard.js) in node on a canvas that
   draws nothing, enters every layout and the yard, and checks what the engine makes of them:
   four landmarks with their defs, solid landmarks and their footprints blocked (and cover),
   a walkable start facing in, every decor entry applied to a face you can see, walkers on floor
   the player can reach, and frames that render without throwing; the M map opens, draws and
   closes cleanly, and what you have explored is kept in the trip, joins the save at home and is
   lost with a dead trip; a gun hidden in any building lies on floor you can reach, out of the cache
   room and off the landmarks; every gun mod tier and every van-gun step shows.
   The cabin in the yard: every room walked into, every note read, every spot used, frames from every
   room and through open doors, a raid, a siege, and a broken window kept through a save.
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
const WANT = ["layouts.js", "world.js", "story.js", "story-home.js", "upgrades.js", "weapons.js", "state.js", "audio.js", "sprites.js", "sprites3d.js", "decor.js", "landmarks1.js", "landmarks2.js", "yardart.js", "interior.js", "building.js", "yard.js", "house.js"].concat(fs.existsSync(path.join(ROOT, "js", "houseart.js")) ? ["houseart.js"] : []);
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

// a slow machine's quality step makes the floor image coarser and leaves the view's canvas alone (giving a
// canvas a size clears it, so the frame just drawn would be shown blank)
{
  const cv = I.canvas;
  let w = cv.width;
  let sized = 0;
  Object.defineProperty(cv, "width", { configurable: true, get: () => w, set: (v) => { sized++; w = v; } });
  const was = [I.planeRes, I.renderN, I.renderMs, I.frameMs];
  I.planeRes = 2;
  I.renderN = 999;
  I.renderMs = 50;
  I.adaptQuality(50, 100);
  if (I.planeRes !== 3 || I.planeW !== Math.ceil(I.W / 3)) err(`engine: the quality step did not make the floor image coarser (1/${I.planeRes}, ${I.planeW} wide)`);
  if (sized) err("engine: the quality step gave the view's canvas a new size, which blanks the frame on screen");
  delete cv.width;
  cv.width = w;
  [I.planeRes, I.renderN, I.renderMs, I.frameMs] = was;
  I.sizePlane();
}

let entered = 0;
W.LOCATIONS.filter((l) => l.id !== "base").forEach((loc) => {
  const ctx = loc.id;
  const lay = I.layoutFor(loc);
  if (!lay) return err(`${ctx}: no layout`);
  S.startTrip();
  // a gun hidden here (main's rule picks the building per save; every building must have room for one)
  const hide = loc.id === "gasngo" || loc.id === "grocery" ? "dual" : "bow";
  const whereWas = S.save.weapons.where;
  S.save.weapons.where = { [hide]: loc.id };
  try {
    I.enter(loc);
  } catch (e) {
    return err(`${ctx}: enter threw ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
  }
  I.stop();
  S.save.weapons.where = whereWas;
  entered++;
  // the gun on the floor: on open floor you can walk to from the door (doors opened), never in the cache room,
  // never on a landmark's tiles, an item, a note or a scrap pile, and on the same tile every visit
  const gp = I.gunPickup;
  if (!gp || gp.id !== hide) err(`${ctx}: a gun hidden here was not placed on the floor`);
  else {
    const gx = Math.floor(gp.x);
    const gy = Math.floor(gp.y);
    const reach = I.reachable(Math.floor(I.startPos[0]), Math.floor(I.startPos[1]), true);
    const cd = I.cacheDoor;
    const behindCache = (() => {
      if (!cd) return false;
      // reachable only through the cache door: the tile drops out when that door is a wall
      const g = I.grid[cd.y][cd.x];
      I.grid[cd.y][cd.x] = "L";
      I.maskDirty = true;
      const r = I.reachable(Math.floor(I.startPos[0]), Math.floor(I.startPos[1]), true);
      I.grid[cd.y][cd.x] = g;
      I.maskDirty = true;
      return !r.has(gx + "," + gy);
    })();
    if (I.solidAt(gp.x, gp.y) || I.grid[gy][gx] !== ".") err(`${ctx}: the gun lies on a solid tile at ${gx},${gy}`);
    else if (!reach.has(gx + "," + gy)) err(`${ctx}: the gun at ${gx},${gy} cannot be reached from the door`);
    else if (behindCache) err(`${ctx}: the gun at ${gx},${gy} is in the cache room`);
    I.landmarks.forEach((lm) => {
      const f = lm.def && Array.isArray(lm.def.foot) ? lm.def.foot : [1, 1];
      if (Math.abs(gx - lm.x) <= (f[0] >> 1) && Math.abs(gy - lm.y) <= (f[1] >> 1)) err(`${ctx}: the gun at ${gx},${gy} lies on landmark ${lm.id}`);
    });
    I.items.concat(I.notes, I.piles).forEach((o) => {
      if (Math.floor(o.x) === gx && Math.floor(o.y) === gy) err(`${ctx}: the gun at ${gx},${gy} lies on an item, a note or a scrap pile`);
    });
    if ((reach.get(gx + "," + gy) || 0) < 5) err(`${ctx}: the gun at ${gx},${gy} is only ${reach.get(gx + "," + gy)} steps from the door`);
    const again = I.gunPickup;
    I.placeGun(loc, I.startPos);
    if (I.gunPickup.x !== again.x || I.gunPickup.y !== again.y) err(`${ctx}: the gun moves between visits`);
    I.gunPickup = null;
  }
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
      if ("#WSXGCKRLQE".includes(ch) && !solid(x, y)) err(`${at} is walkable in the engine`);
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

  // the M map: M opens it and pauses, it draws, M / Esc close it and play goes on; P leaves the game
  // paused for the pause menu; it never opens while something else has paused the game
  const count = (a) => a.reduce((n, v) => n + (v ? 1 : 0), 0);
  const seenNow = count(I.seen);
  if (!seenNow) err(`${ctx}: rendering marked no tile seen (the map would be empty)`);
  try {
    I.startLoop();
    if (!I.modeKey("m", false) || !I.mapOpen || !I.paused) err(`${ctx}: M did not open the map and pause`);
    I.drawOverlay(I.ctx, I.W, I.H);
    if (!I.mapImg) err(`${ctx}: the open map drew nothing`);
    if (!I.modeKey("m", true) || I.mapOpen || I.paused) err(`${ctx}: M did not close the map and resume`);
    I.modeKey("m", false);
    if (!I.modeKey("escape", true) || I.mapOpen || I.paused) err(`${ctx}: Esc did not close the map and resume`);
    I.modeKey("m", false);
    if (!I.modeKey("p", true) || I.mapOpen || !I.paused) err(`${ctx}: P on the map should close it and stay paused for the pause menu`);
    if (I.modeKey("m", true) || I.mapOpen) err(`${ctx}: M opened the map over another pause`);
    I.resume();
    I.modeKey("m", false);
    I.resume(); // resumed from elsewhere (the pause menu): the map must not stay up over play
    I.drawOverlay(I.ctx, I.W, I.H);
    if (I.mapOpen) err(`${ctx}: the map stayed open after the game resumed`);
  } catch (e) {
    err(`${ctx}: the map threw ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
  }
  // exploring is kept: leaving puts it in the trip (snapshot and overlay); coming back restores it
  const before = Uint8Array.from(I.seen);
  I.leave();
  const tl = S.trip.loc[loc.id];
  const fromTrip = tl && S.unpackSeen(tl.seen, gw, gh);
  if (!fromTrip || count(fromTrip) !== seenNow) err(`${ctx}: leaving kept ${fromTrip ? count(fromTrip) : "no"} seen tiles in the trip, want ${seenNow}`);
  if (!S.trip.rooms[loc.id] || !S.trip.rooms[loc.id].seen) err(`${ctx}: the trip snapshot has no explored map`);
  const overlay = tl && tl.seen;
  if (tl) delete tl.seen; // the snapshot alone must bring it back too
  I.enter(loc);
  I.stop();
  if (before.some((v, i) => v && !I.seen[i])) err(`${ctx}: coming back on the same trip lost explored tiles`);
  if (tl) tl.seen = overlay;
});

// exploring joins the save at home; a death on the next trip loses only that trip's exploring;
// a save without explored maps, or with one for an older layout size, still loads
try {
  const trip = Object.assign({}, S.trip.loc); // the last building's trip (each building above started its own)
  const id0 = Object.keys(trip)[0];
  if (!id0) throw new Error("no building in the trip");
  S.returnHome();
  Object.keys(trip).forEach((id) => {
    const lay = ZSR.LAYOUTS[id];
    const want = S.unpackSeen(trip[id].seen, lay.grid[0].length, lay.grid.length);
    const got = S.save.loc[id] && S.unpackSeen(S.save.loc[id].seen, lay.grid[0].length, lay.grid.length);
    if (!got || !want || got.some((v, i) => v !== want[i])) err(`${id}: the explored map did not reach the save on the way home`);
  });
  const saved = JSON.stringify(S.save.loc);
  S.startTrip();
  const loc = W.LOCATIONS.find((l) => l.id === id0);
  I.enter(loc);
  I.stop();
  const home = S.unpackSeen(S.save.loc[id0].seen, I.gw, I.gh);
  if (!home || home.some((v, i) => v !== I.seen[i])) err(`${id0}: the next trip in did not start from the saved explored map`);
  I.seen.fill(1);
  I.leave();
  S.abandonTrip(); // death: back to the save on disk
  if (JSON.stringify(S.save.loc) !== saved) err("death kept the dead trip's exploring in the save");
  // an old save: no explored maps at all, then one for a layout of another size
  Object.values(S.save.loc).forEach((l) => delete l.seen);
  S.startTrip();
  I.enter(loc);
  I.stop();
  S.save.loc[id0].seen = "3x3:/w";
  I.enter(loc);
  I.stop();
  if (I.seen.some((v) => v)) err(`${id0}: an explored map for another layout size was applied`);
} catch (e) {
  err(`explored map in the save: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
}

/* ---------- The yard: every room level builds on its plot, and nobody gets boxed in ----------
   For all rooms at 0, 1, 2 and 3 and a few mixes: the player, the cabin door, the van and every fence
   segment can be reached; there are no closed-off pockets; what a plot builds stays on the plot; every
   art name is drawn; the fence stays shoot-over and wears its Walls look. Then a build goes up at once
   (and a trap under it comes back), and two heavy waves are played out against the biggest yard. */
S.trip = null; // home: no trip running
const Y = W.YARD;
const ROOMS = Object.keys(S.save.rooms);
const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const inPlot = (x, y) => Object.values(Y.plots).some((p) => x >= p.x && y >= p.y && x < p.x + p.w && y < p.y + p.h);
function setRooms(lv) {
  ROOMS.forEach((k) => (S.save.rooms[k] = typeof lv === "number" ? lv : lv[k] || 0));
  S.save.fence = {};
  S.save.yardTraps = [];
}
function yardCheck(ctx) {
  const gw = I.gw;
  const gh = I.gh;
  const m = I.solidMask();
  const p = I.player;
  const sx = Math.floor(p.x);
  const sy = Math.floor(p.y);
  if (I.solidForPlayer(p.x, p.y)) err(`${ctx}: the player starts inside something at ${sx},${sy}`);
  const reach = I.reachable(sx, sy, true); // through doors: the cabin's are shut when you come home
  const near = (x, y) => N8.some(([dx, dy]) => reach.has(x + dx + "," + (y + dy)));
  const front = I.doors.find((d) => d.house && !d.back);
  if (!front || !near(front.x, front.y)) err(`${ctx}: nobody can get to the cabin's front door`);
  if (!I.van || !(near(I.van.x, I.van.y) || near(I.van.x + 1, I.van.y))) err(`${ctx}: nobody can get to the van`);
  // inside the fence (ignoring what is built), every open tile is reachable and every segment can be repaired
  const inside = new Set([sx + "," + sy]);
  const q = [[sx, sy]];
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of N8.slice(0, 4)) {
      const nx = x + dx;
      const ny = y + dy;
      const k = nx + "," + ny;
      if (nx < 0 || ny < 0 || nx >= gw || ny >= gh || inside.has(k) || "FT".includes(Y.grid[ny][nx])) continue;
      inside.add(k);
      q.push([nx, ny]);
    }
  }
  let pockets = 0;
  inside.forEach((k) => {
    const [x, y] = k.split(",").map(Number);
    if (Y.grid[y][x] === "z") err(`${ctx}: a walker spawn at ${k} is inside the fence`);
    if (!m[y * gw + x] && !reach.has(k) && pockets++ < 3) err(`${ctx}: ${k} is open ground nobody can get to (a pocket)`);
  });
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) if (Y.grid[y][x] === "F" && !near(x, y)) err(`${ctx}: the fence at ${x},${y} cannot be reached to repair it`);
  // what the plots build stays on the plots (the cabin's own tiles aside)
  const cabin = (k) => I.indoorAt(+k.split(",")[0] + 0.5, +k.split(",")[1] + 0.5);
  const off = (what, k) => !cabin(k) && !inPlot(+k.split(",")[0], +k.split(",")[1]) && err(`${ctx}: ${what} at ${k} is outside every plot`);
  Object.keys(I.tileTex).forEach((k) => off("a wall face", k));
  Object.keys(I.lowTiles).forEach((k) => off("a low tile", k));
  I.blockers.forEach((k) => off("a solid prop", k));
  I.roofs.forEach((r) => !(inPlot(r.x0, r.y0) && inPlot(r.x1 - 1, r.y1 - 1)) && err(`${ctx}: a roof at ${r.x0},${r.y0} is outside every plot`));
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) if (I.grid[y][x] === "#" && !inPlot(x, y) && !I.indoorAt(x + 0.5, y + 0.5)) err(`${ctx}: a wall at ${x},${y} is outside every plot`);
  // every name is drawn: sprites, wall faces, roofs and gables
  I.props.forEach((pr) => pr.art && !D.hasSprite(pr.art) && err(`${ctx}: prop art "${pr.art}" is not registered`));
  I.roofs.forEach((r) => [r.roofTex, r.gableTex].forEach((t) => t && !D.hasTexture(t) && err(`${ctx}: roof texture "${t}" is not registered`)));
  // each plot shows its room: a sign with the name before it is built, a plaque after
  ROOMS.filter((k) => Y.plots[k]).forEach((k) => {
    const lvl = S.save.rooms[k];
    const want = W.BASE_ROOMS[k].name.toUpperCase();
    const sign = I.props.find((pr) => (pr.art === "ySign" || pr.art === "yPlaque") && pr.opts && pr.opts.t === want);
    if (!sign) err(`${ctx}: plot ${k} has no sign or plaque reading "${want}"`);
    else if ((sign.art === "ySign") !== !lvl) err(`${ctx}: plot ${k} at level ${lvl} shows a ${sign.art === "ySign" ? "lot sign" : "plaque"}`);
  });
  const f = Object.keys(I.fence)[0];
  if (!f) err(`${ctx}: no fence segments`);
  else if (I.coverMask[gw * +f.split(",")[1] + +f.split(",")[0]]) err(`${ctx}: the fence stops shots`);
  renderAround(ctx);
}
try {
  if (!Y.plots || !Y.version) err("yard: WORLD.YARD needs plots and a version");
  const rnd = ((s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)(7);
  const configs = [0, 1, 2, 3].map((l) => ["all " + l, l]);
  for (let i = 0; i < 6; i++) configs.push(["mix " + (i + 1), Object.fromEntries(ROOMS.map((k) => [k, Math.floor(rnd() * 4)]))]);
  configs.forEach(([name, lv]) => {
    setRooms(lv);
    I.enterYard({ firstCalm: 999 });
    I.stop();
    yardCheck("yard " + name);
    // the fence wears the Walls level's look (the core draws what the yard put in I.fenceTex)
    const wl = S.save.rooms.walls;
    if (wl > 0 && (I.fenceLook(false) !== D.texture("yFence", I.palette, { lvl: wl }) || I.fenceLook(true) !== D.texture("yFence", I.palette, { lvl: wl, cracked: 1 }))) err(`yard ${name}: the fence does not show Walls level ${wl}`);
  });

  // a build goes up the moment it is made; a trap set where it stands goes back into stock
  setRooms(0);
  I.enterYard({ firstCalm: 999 });
  const g = Y.plots.garage;
  S.save.traps.spike = 0;
  S.save.yardTraps = [{ x: g.x + 1.5, y: g.y + 2.5, type: "spike", uses: 3 }];
  S.save.rooms.garage = 3;
  I.refreshYard();
  I.stop();
  if (I.grid[g.y + 2][g.x + 1] !== "#") err("yard: the garage workshop did not go up at once after the build");
  if (S.save.traps.spike !== 1 || S.save.yardTraps.length) err("yard: a trap under a new build was not put back in stock");
  if (!I.props.some((pr) => pr.art === "yPlaque" && pr.opts.n === 3 && pr.opts.t === "GARAGE")) err("yard: the garage plaque did not change after the build");

  // heavy waves against the biggest yard: they come out of the trees on their sides, claw through the
  // fence, find their way around the builds to the player (who shoots whatever gets close), and none gets
  // stuck (walkers crowding a one-tile breach sort themselves out: yard.js yardUnjam). Math.random is
  // seeded here, so every run plays the same waves.
  setRooms(3);
  S.save.rooms.walls = 0; // the weakest fence, so the waves get in quickly
  S.save.day = 4;
  const ctxMath = vm.runInContext("Math", sb);
  const realRandom = ctxMath.random;
  ctxMath.random = ((s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)(4242);
  const raidShare = W.DEFENSE.raidShare;
  W.DEFENSE.raidShare = 0; // here every walker comes for the player; the cabin's raiders are checked below
  for (const sides of [["n", "e"], ["s", "w"], ["n", "e", "s", "w"]]) {
    S.save.fence = {};
    I.enterYard({ firstCalm: 999 });
    I.stop();
    const p = I.player;
    p.maxHp = p.hp = 1e9;
    I.phase = { kind: "wave", size: "many", total: 16, spawned: 0, spawnT: 0, t: 0, sides };
    const ctx = "yard wave from " + sides.join("+");
    const seenSides = new Set();
    const anchor = new Map();
    let t = 0;
    let bit = 0;
    let killed = 0;
    let stuck = 0;
    while (t < 300 && (I.phase.kind === "wave")) {
      I.update(0.05);
      t += 0.05;
      I.walkers.forEach((z) => {
        if (!anchor.has(z)) {
          anchor.set(z, { x: z.x, y: z.y, t });
          const d = { n: z.y, s: I.gh - z.y, w: z.x, e: I.gw - z.x };
          seenSides.add(Object.keys(d).reduce((a, k) => (d[k] < d[a] ? k : a), "n"));
        }
        if (I.solidAt(z.x, z.y)) err(`${ctx}: a walker is inside something solid at ${z.x.toFixed(1)},${z.y.toFixed(1)}`);
        const a = anchor.get(z);
        const moved = Math.hypot(z.x - a.x, z.y - a.y) > 0.4;
        const atFence = z.fenceTarget && Math.hypot(z.fenceTarget[0] - z.x, z.fenceTarget[1] - z.y) < 1.0 && I.fence[Math.floor(z.fenceTarget[0]) + "," + Math.floor(z.fenceTarget[1])] != null;
        if (moved || atFence) Object.assign(a, { x: z.x, y: z.y, t });
        else if (t - a.t > 8 && stuck++ < 3) err(`${ctx}: a walker is stuck at ${z.x.toFixed(1)},${z.y.toFixed(1)} (no progress for 8 s)`);
        if (Math.hypot(z.x - p.x, z.y - p.y) < 1.2) {
          bit++;
          I.hurtWalker(z, 1e6); // the player shoots whatever gets this close
          killed++;
        }
      });
    }
    const holes = I.fenceHoles().length;
    if (!holes) err(`${ctx}: the walkers never broke through the fence`);
    if (!bit) err(`${ctx}: no walker found its way to the player`);
    if (I.phase.kind === "wave") err(`${ctx}: the wave never ended (${I.walkers.length} walkers left after ${t.toFixed(0)} s)`);
    if (seenSides.size !== sides.length || sides.some((s) => !seenSides.has(s))) err(`${ctx}: walkers came from ${[...seenSides].join("+")}`);
    if (killed < 16) err(`${ctx}: only ${killed} of 16 walkers reached the player`);
  }

  /* ---------- The cabin ----------
     Every room can be walked into from the front door; every note on its walls can be read from its
     room; what E does inside can be reached; frames render from every room and from the yard with the
     doors open. Then a raid (walkers that make for the cabin break in and wait inside; going in brings
     them out) and a siege (you inside, doors shut: they smash their way in and find you). */
  const HZ = W.HOUSE;
  const [hax, hay] = HZ.at;
  setRooms(3);
  I.enterYard({ firstCalm: 999 });
  I.stop();
  {
    const front = I.doors.find((d) => d.house && !d.back);
    const reach = I.reachable(front.x, front.y - 1, true);
    Object.entries(HZ.rooms).forEach(([k, r]) => {
      let open = 0;
      for (let y = r.rect[1]; y <= r.rect[3]; y++) for (let x = r.rect[0]; x <= r.rect[2]; x++) if (reach.has(hax + x + "," + (hay + y))) open++;
      if (!open) err(`cabin: nobody can get into the ${r.name}`);
    });
    HZ.notes.forEach((n) => {
      const [dx, dy] = SIDES[n.face];
      const wx = hax + n.wall[0];
      const wy = hay + n.wall[1];
      if (!OPAQUE.includes(I.grid[wy][wx])) err(`cabin note ${n.id}: ${wx},${wy} is not a wall`);
      const sg = I.signs.find((x) => x.note === n.id);
      if (!sg) return err(`cabin note ${n.id}: not on a wall`);
      // stand somewhere in reach in front of it, facing it: it shows on the read panel
      let read = false;
      for (let r = 1; r <= 2 && !read; r++) {
        for (let o = -1; o <= 1 && !read; o++) {
          const tx = wx + dx * r + (dx ? 0 : o);
          const ty = wy + dy * r + (dy ? 0 : o);
          if (!reach.has(tx + "," + ty)) continue;
          I.player.x = tx + 0.5;
          I.player.y = ty + 0.5;
          I.player.a = Math.atan2(wy + 0.5 - I.player.y, wx + 0.5 - I.player.x);
          const near = I.nearReadable();
          read = !!(near && near.sign && near.sign.note === n.id);
        }
      }
      if (!read) err(`cabin note ${n.id}: cannot be read from its room`);
      if (!ZSR.houseNoteText(n.id).text) err(`cabin note ${n.id}: no words`);
    });
    Object.entries(HZ.spots).forEach(([name, [sx, sy]]) => {
      const x = hax + sx + 0.5;
      const y = hay + sy + 0.5;
      let found = false;
      reach.forEach((v, k) => {
        if (found) return;
        const [tx, ty] = k.split(",").map(Number);
        if (Math.hypot(tx + 0.5 - x, ty + 0.5 - y) > 1.5) return;
        I.player.x = tx + 0.5;
        I.player.y = ty + 0.5;
        I.player.a = Math.atan2(y - I.player.y, x - I.player.x);
        const f = I.facing();
        found = !!(f && f.kind === "spot" && f.obj === name);
      });
      if (!found) err(`cabin: nobody can use the ${name}`);
    });
    // frames from every room, and from the yard and the porch with both doors open
    Object.entries(HZ.rooms).forEach(([k, r]) => {
      I.player.x = hax + (r.rect[0] + r.rect[2] + 1) / 2;
      I.player.y = hay + (r.rect[1] + r.rect[3] + 1) / 2;
      renderAround("cabin " + k);
    });
    I.doors.filter((d) => d.house).forEach((d) => I.toggleDoor(d));
    [[front.x + 0.5, front.y - 4.5], [front.x + 0.5, front.y - 1.5], [front.x + 0.5, front.y + 1.5], [hax - 3, hay + 10], [hax + 12, hay + 29]].forEach(([x, y], i) => {
      I.player.x = x;
      I.player.y = y;
      renderAround("cabin, doors open, view " + i);
    });
    if (!I.house || I.house.ridge <= 1) err("cabin: no roof");
    if (!I.indoorAt(hax + 3.5, hay + 3.5) || I.indoorAt(hax - 1.5, hay + 3.5)) err("cabin: the engine has the wrong tiles under its roof");
  }
  // a raid: every walker makes for the cabin while you stay out in the yard; they get in and wait
  {
    W.DEFENSE.raidShare = 1;
    S.save.rooms.walls = 0;
    S.save.fence = {};
    S.save.house.hp = {};
    I.enterYard({ firstCalm: 999 });
    I.stop();
    const p = I.player;
    p.maxHp = p.hp = 1e9;
    I.phase = { kind: "wave", size: "some", total: 6, spawned: 0, spawnT: 0, t: 0, sides: ["s"] };
    let t = 0;
    while (t < 240 && !(I.phase.spawned >= 6 && I.walkers.every((z) => z.inHouse))) {
      I.update(0.05);
      t += 0.05;
    }
    const broken = I.houseDamage().broken;
    if (!broken) err("cabin raid: the walkers never broke a door or a window");
    if (!I.walkers.length || !I.walkers.every((z) => z.inHouse && I.indoorAt(z.x, z.y))) err(`cabin raid: the walkers did not all get into the cabin (${I.walkers.filter((z) => z.inHouse).length} of ${I.walkers.length} after ${t.toFixed(0)} s)`);
    // go in: they come out of the rooms for you
    const front = I.doors.find((d) => d.house && !d.back);
    if (!front.broken && !front.open) I.toggleDoor(front);
    p.x = hax + 14.5;
    p.y = hay + 14.5;
    t = 0;
    let killed = 0;
    while (t < 120 && I.phase.kind === "wave") {
      I.update(0.05);
      t += 0.05;
      I.walkers.forEach((z) => {
        if (Math.hypot(z.x - p.x, z.y - p.y) < 1.2) {
          I.hurtWalker(z, 1e6);
          killed++;
        }
      });
    }
    if (I.phase.kind === "wave") err(`cabin raid: the walkers inside never came for the player (${I.walkers.length} left)`);
  }
  // a siege: you in the living room, both doors shut; they come through the fence and smash their way in
  {
    W.DEFENSE.raidShare = 0;
    S.save.fence = {};
    S.save.house.hp = {};
    I.enterYard({ firstCalm: 999 });
    I.stop();
    const p = I.player;
    p.maxHp = p.hp = 1e9;
    p.x = hax + 14.5;
    p.y = hay + 14.5;
    I.phase = { kind: "wave", size: "many", total: 10, spawned: 0, spawnT: 0, t: 0, sides: ["n", "e"] };
    let t = 0;
    let killed = 0;
    while (t < 300 && I.phase.kind === "wave") {
      I.update(0.05);
      t += 0.05;
      I.walkers.forEach((z) => {
        if (I.solidAt(z.x, z.y)) err(`cabin siege: a walker is inside something solid at ${z.x.toFixed(1)},${z.y.toFixed(1)}`);
        if (Math.hypot(z.x - p.x, z.y - p.y) < 1.2) {
          I.hurtWalker(z, 1e6);
          killed++;
        }
      });
    }
    if (!I.houseDamage().broken) err("cabin siege: the walkers never broke into the cabin");
    if (I.phase.kind === "wave") err(`cabin siege: the wave never ended (${I.walkers.length} walkers left after 300 s)`);
    if (killed < 10) err(`cabin siege: only ${killed} of 10 walkers found the player inside`);
    if (I.solidForPlayer(...(() => { const b = Object.values(I.barriers).find((x) => x.kind === "window" && x.hp <= 0); return b ? [hax + b.hx + 0.5, hay + b.hy + 0.5] : [0, 0]; })()) !== true) err("cabin siege: the player can climb through a broken window");
  }
  // shut in a bedroom: a walker in the cabin forces the inner door open (it is not broken) and finds you
  {
    S.save.house.hp = {};
    I.enterYard({ firstCalm: 999 });
    I.stop();
    const p = I.player;
    p.maxHp = p.hp = 1e9;
    p.x = hax + 21.5;
    p.y = hay + 7.5;
    const door = I.doors.find((d) => d.x === hax + 19 && d.y === hay + 9);
    if (!door) err("cabin: no door into Gus's room");
    else {
      I.toggleDoor(door);
      I.phase = { kind: "wave", size: "some", total: 0, spawned: 0, spawnT: 0, t: 0, sides: ["n"] };
      const z = I.makeWalker("walker", hax + 14.5, hay + 14.5, 1);
      z.awake = true;
      I.walkers.push(z);
      let t = 0;
      let got = false;
      while (t < 60 && !got) {
        I.update(0.05);
        t += 0.05;
        got = Math.hypot(z.x - p.x, z.y - p.y) < 1.2;
      }
      if (!got) err(`cabin: a walker never got through a shut inner door (at ${z.x.toFixed(1)},${z.y.toFixed(1)})`);
      if (door.broken || !door.open) err("cabin: a forced inner door should be open and not broken");
      I.walkers.length = 0;
    }
  }
  // a broken window stays broken through a save (home is where the game saves), and a stronger level mends them all
  {
    S.save.house.hp = {};
    I.enterYard({ firstCalm: 999 });
    I.stop();
    const key = Object.keys(I.barriers).find((k) => I.barriers[k].kind === "window");
    I.yardHitBarrier(key, 1e9);
    S.save.house.hp = I.houseState();
    S.commit();
    S.save = S.loadSave(S.activeSlot());
    I.enterYard({ firstCalm: 999 });
    I.stop();
    const [kx, ky] = key.split(",").map(Number);
    if (I.grid[ky][kx] !== "U" || I.barriers[key].hp !== 0) err("cabin: a broken window came back whole after a save");
    S.save.house.windows = 1;
    I.refreshYard();
    if (I.grid[ky][kx] !== "W" || I.barriers[key].hp !== W.HOUSE_UPGRADES.windows.hp[1]) err("cabin: a stronger window level did not mend the windows");
    S.save.house.windows = 0;
  }
  W.DEFENSE.raidShare = raidShare;
  S.save.house.hp = {};
  ctxMath.random = realRandom;

  // a save from before the yard grew: its fence keys and trap spots mean nothing on the new grid, so the
  // fence comes back whole and the set traps go back into stock; new games and current saves are left alone
  const old = JSON.parse(JSON.stringify(S.save));
  delete old.yardV;
  Object.assign(old, { fence: { "11,3": 0, "12,3": 80 }, traps: { spike: 1, blast: 0 }, yardTraps: [{ x: 9.5, y: 9.5, type: "spike", uses: 2 }, { x: 10.5, y: 9.5, type: "blast", uses: 1 }] });
  sb.localStorage.setItem("zs.save." + S.activeSlot(), JSON.stringify(old));
  const ld = S.loadSave(S.activeSlot());
  if (Object.keys(ld.fence).length || ld.yardTraps.length || ld.traps.spike !== 2 || ld.traps.blast !== 1 || ld.yardV !== Y.version) err(`yard: an older save was not moved onto the new yard (fence ${JSON.stringify(ld.fence)}, traps ${JSON.stringify(ld.traps)}, set ${ld.yardTraps.length}, yardV ${ld.yardV})`);
  S.save.fence = { "11,4": 0 };
  S.save.yardTraps = [{ x: 9.5, y: 9.5, type: "spike", uses: 2 }];
  S.commit();
  const kept = S.loadSave(S.activeSlot());
  if (kept.fence["11,4"] !== 0 || kept.yardTraps.length !== 1) err("yard: a current save lost its fence or its set traps on loading");
  S.newGame(S.activeSlot(), "Test");
  if (S.save.yardV !== Y.version) err("yard: a new game does not record the yard version");
} catch (e) {
  err(`yard: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
}

/* ---------- Every upgrade step shows on the guns and the van ----------
   The gun and the van faces are drawn on a tiny rasterizer that keeps, for every pixel, the color painted
   there last (fills and strokes; text is skipped), and each level is compared with the one below it: a
   step that changes almost nothing (a part drawn, then covered by the next one) fails. The van's faces
   must also be painted up to their top row, gear or not: the core shades and inks a face from the tile's
   top, so an empty band there shows as a hollow box over the roof. */
function raster(w, h) {
  const px = new Int32Array(w * h); // 0: nothing painted; else a color id
  const ids = new Map();
  const id = (c) => {
    const k = typeof c === "string" ? c : "gradient";
    if (!ids.has(k)) ids.set(k, ids.size + 1);
    return ids.get(k);
  };
  let m = [1, 0, 0, 1, 0, 0]; // the 2D transform a b c d e f: x' = a x + c y + e, y' = b x + d y + f
  const stack = [];
  let subs = [];
  let cur = null;
  const at = (x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  const each = (pts, pad, fn) => {
    const xs = pts.map((q) => q[0]);
    const ys = pts.map((q) => q[1]);
    const x0 = Math.max(0, Math.floor(Math.min(...xs) - pad));
    const x1 = Math.min(w - 1, Math.ceil(Math.max(...xs) + pad));
    const y0 = Math.max(0, Math.floor(Math.min(...ys) - pad));
    const y1 = Math.min(h - 1, Math.ceil(Math.max(...ys) + pad));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (fn(x + 0.5, y + 0.5)) px[y * w + x] = fn.c;
  };
  const curve = (cx, cy, rx, ry, a0, a1, ccw) => {
    let span = a1 - a0;
    if (!ccw && span < 0) span += Math.PI * 2;
    if (ccw && span > 0) span -= Math.PI * 2;
    if (Math.abs(a1 - a0) >= Math.PI * 2) span = ccw ? -Math.PI * 2 : Math.PI * 2;
    if (!cur) subs.push((cur = []));
    for (let i = 0; i <= 24; i++) {
      const a = a0 + (span * i) / 24;
      cur.push(at(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry));
    }
  };
  const c = {
    fillStyle: "#000", strokeStyle: "#000", lineWidth: 1, globalAlpha: 1, font: "", textAlign: "", textBaseline: "", lineJoin: "", lineCap: "",
    px,
    save() {
      stack.push([m.slice(), this.fillStyle, this.strokeStyle, this.lineWidth]);
    },
    restore() {
      const s = stack.pop();
      if (s) [m, this.fillStyle, this.strokeStyle, this.lineWidth] = s;
    },
    translate(x, y) {
      m[4] += m[0] * x + m[2] * y;
      m[5] += m[1] * x + m[3] * y;
    },
    scale(x, y) {
      m[0] *= x;
      m[1] *= x;
      m[2] *= y;
      m[3] *= y;
    },
    rotate(t) {
      const [a, b, c, d] = m;
      const co = Math.cos(t);
      const si = Math.sin(t);
      m[0] = a * co + c * si;
      m[1] = b * co + d * si;
      m[2] = c * co - a * si;
      m[3] = d * co - b * si;
    },
    beginPath() {
      subs = [];
      cur = null;
    },
    moveTo(x, y) {
      subs.push((cur = [at(x, y)]));
    },
    lineTo(x, y) {
      if (cur) cur.push(at(x, y));
      else this.moveTo(x, y);
    },
    closePath() {
      if (cur) cur.closed = true;
      cur = null;
    },
    rect(x, y, rw, rh) {
      subs.push(Object.assign([at(x, y), at(x + rw, y), at(x + rw, y + rh), at(x, y + rh)], { closed: true }));
      cur = null;
    },
    arcTo(x1, y1) {
      this.lineTo(x1, y1); // a rounded corner as a plain one
    },
    arc(x, y, r, a0, a1, ccw) {
      curve(x, y, r, r, a0, a1, ccw);
    },
    ellipse(x, y, rx, ry, rot, a0, a1, ccw) {
      curve(x, y, rx, ry, a0, a1, ccw);
    },
    fill() {
      const all = subs.filter((s) => s.length > 2);
      if (!all.length) return;
      // nonzero winding, every subpath closed
      const inside = (x, y) => {
        let wn = 0;
        for (const s of all) for (let i = 0; i < s.length; i++) {
          const [ax, ay] = s[i];
          const [bx, by] = s[(i + 1) % s.length];
          const cross = (bx - ax) * (y - ay) - (x - ax) * (by - ay);
          if (ay <= y && by > y && cross > 0) wn++;
          else if (ay > y && by <= y && cross < 0) wn--;
        }
        return wn !== 0;
      };
      inside.c = id(this.fillStyle);
      each([].concat(...all), 0, inside);
    },
    stroke() {
      const hw = (this.lineWidth * Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]))) / 2;
      const col = id(this.strokeStyle);
      subs.forEach((s) => {
        const n = s.closed ? s.length : s.length - 1;
        for (let i = 0; i < n; i++) {
          const [ax, ay] = s[i];
          const [bx, by] = s[(i + 1) % s.length];
          const len2 = (bx - ax) ** 2 + (by - ay) ** 2 || 1e-9;
          const near = (x, y) => {
            const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / len2));
            return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)) <= hw;
          };
          near.c = col;
          each([s[i], s[(i + 1) % s.length]], hw, near);
        }
      });
    },
    fillRect(x, y, rw, rh) {
      this.beginPath();
      this.rect(x, y, rw, rh);
      this.fill();
    },
    strokeRect(x, y, rw, rh) {
      this.beginPath();
      this.rect(x, y, rw, rh);
      this.stroke();
    },
    clearRect(x, y, rw, rh) {
      const clear = () => true;
      clear.c = 0;
      each([at(x, y), at(x + rw, y + rh)], -0.5, clear);
    },
    measureText: (t) => ({ width: String(t).length * 6 }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
  };
  return new Proxy(c, { get: (o, k) => (k in o ? o[k] : noop) }); // text, clip, drawImage ...: nothing
}
try {
  // the art caches every drawing: each one here gets a canvas of its own, drawn on a rasterizer
  const realCreate = sb.document.createElement;
  let drawn = null;
  sb.document.createElement = (tag) => {
    const el = realCreate(tag);
    if (String(tag).toLowerCase() === "canvas") el.getContext = () => el.ctx || (el.ctx = drawn = raster(el.width, el.height));
    return el;
  };
  const differ = (a, b) => a.reduce((n, v, i) => n + (v !== b[i] ? 1 : 0), 0);
  // every gun in hand, drawn live at 420 x 420: each tier of each mod must change it, from no mods and
  // from every other mod at the top (a part hidden behind the next tier's would not count)
  const WP = ZSR.Weapons;
  const gunAt = (id, mods) => {
    const c = sb.document.createElement("canvas");
    c.width = 420;
    c.height = 420;
    const g = c.getContext("2d");
    D.gun(g, 420, 420, { weapon: id, mods, live: true });
    return g.px;
  };
  WP.ORDER.forEach((id) => {
    for (const k of Object.keys(WP.MODS)) for (const o of [0, WP.MOD_MAX]) {
      const base = {};
      Object.keys(WP.MODS).forEach((m) => (base[m] = o));
      for (let lv = 1; lv <= WP.MOD_MAX; lv++) {
        const n = differ(gunAt(id, Object.assign({}, base, { [k]: lv - 1 })), gunAt(id, Object.assign({}, base, { [k]: lv })));
        if (n < 40) err(`mods: the ${WP.WEAPONS[id].name.toLowerCase()} at ${k} ${lv} looks like ${k} ${lv - 1} (${n} px change; the other mods at ${o})`);
      }
    }
    // the picture kept at rest (cropped, placed with the bob) is made and drawn without trouble
    D.gun(element("canvas").getContext("2d"), 480, 270, { weapon: id, mods: { damage: 3, range: 3, rate: 3, aim: 3 }, bob: 1 });
    D.gun(element("canvas").getContext("2d"), 480, 270, { weapon: id, mods: { damage: 3, range: 3, rate: 3, aim: 3 }, bob: 1, flash: 0.08, flashL: 0.08, draw: 0.6, raise: 0.5 });
  });
  // the van's own gun on the road: every Garage gun upgrade step shows on the turret
  const vanGunAt = (u) => {
    const c = sb.document.createElement("canvas");
    c.width = 160;
    c.height = 200;
    const g = c.getContext("2d");
    ZSR.Draw.van(g, 80, 100, { upgrades: Object.assign({ armor: 0, engine: 0, bumper: 0, paint: 0, damage: 0, fireRate: 0, spread: 0 }, u), aim: 0, t: 0 });
    return g.px;
  };
  for (const k of ["damage", "fireRate", "spread"]) for (const o of [0, 2]) {
    const max = ZSR.Upgrades.DEFS[k].max;
    const base = { damage: o, fireRate: o, spread: Math.min(o, 3) };
    for (let lv = 1; lv <= max; lv++) {
      const n = differ(vanGunAt(Object.assign({}, base, { [k]: lv - 1 })), vanGunAt(Object.assign({}, base, { [k]: lv })));
      if (n < 8) err(`upgrades: the van's gun at ${k} ${lv} looks like ${k} ${lv - 1} (${n} px change; the others at ${o})`);
    }
  }
  // the van: its five faces, one upgrade at a time from nothing and from the middle
  const FACES = ["vanCab", "vanBody", "vanBodyR", "vanFront", "vanBack"];
  let n = 0;
  const vanAt = (gear) => {
    Object.assign(S.save.upgrades, gear);
    return FACES.map((f) => {
      drawn = null;
      D.texture(f, { wallStyle: "upgradeCheck" + n++ });
      return drawn.px;
    });
  };
  for (const k of ["armor", "bumper", "engine", "paint"]) for (const o of [0, 3]) {
    const base = { armor: o, bumper: o, engine: o, paint: o };
    for (let lv = 1; lv <= 5; lv++) {
      const a = vanAt(Object.assign({}, base, { [k]: lv - 1 }));
      const b = vanAt(Object.assign({}, base, { [k]: lv }));
      const d = a.reduce((sum, f, i) => sum + differ(f, b[i]), 0);
      if (d < 40) err(`upgrades: the van at ${k} ${lv} looks like ${k} ${lv - 1} (${d} px change over its faces; the others at ${o})`);
    }
  }
  for (const lv of [0, 5]) {
    vanAt({ armor: lv, bumper: lv, engine: lv, paint: lv }).forEach((f, i) => {
      for (let y = 0; y < 10; y++) for (let x = 0; x < 64; x++) {
        if (f[y * 64 + x]) continue;
        err(`upgrades: ${FACES[i]} (all at ${lv}) is empty at ${x},${y}: its top band must be painted solid`);
        y = 10;
        break;
      }
    });
  }
  sb.document.createElement = realCreate;
  Object.assign(S.save.upgrades, { armor: 0, bumper: 0, engine: 0, paint: 0 });
} catch (e) {
  err(`upgrades: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
}

/* ---------- The story in every building (js/story.js): note spots by reading level, the trail, the key,
   the stash and the wall signs ---------- */
try {
  const levelWas = S.settings.level;
  [1, 2, 4, 6].forEach((level) => {
    S.settings.level = level;
    W.LOCATIONS.filter((l) => l.id !== "base").forEach((loc) => {
      const ctx = `story ${loc.id} (reading level ${level})`;
      const N = W.NOTES[loc.id];
      S.startTrip();
      I.enter(loc);
      I.stop();
      const want = N.notes.filter((n) => (n.minLevel || 1) <= level).map((n) => n.id).sort().join(", ");
      const got = I.notes.map((n) => n.id).sort().join(", ");
      if (want !== got) err(`${ctx}: notes placed ${got}, want ${want}`);
      const start = [Math.floor(I.startPos[0]), Math.floor(I.startPos[1])];
      const reach = I.reachable(start[0], start[1], true);
      const tile = (o) => Math.floor(o.x) + "," + Math.floor(o.y);
      I.notes.forEach((n) => { if (!reach.has(tile(n))) err(`${ctx}: note ${n.id} at ${tile(n)} cannot be reached`); });
      const sd = I.stashDoor;
      const kp = I.keyPickup;
      if (!sd || I.grid[sd.y][sd.x] !== "Q" || !I.solidAt(sd.x + 0.5, sd.y + 0.5)) return err(`${ctx}: no locked stash door`);
      if (!kp || !reach.has(tile(kp))) return err(`${ctx}: no stash key the player can reach`);
      if (I.signs.length !== (N.signs || []).length) err(`${ctx}: ${I.signs.length} wall signs, want ${(N.signs || []).length}`);
      // the trail: the second note and the key show only once the note before them is read
      const t1 = N.notes.find((n) => n.kind === "trail" && !n.after);
      const t2 = N.notes.find((n) => n.after === t1.id);
      const o2 = I.notes.find((n) => n.id === t2.id);
      if (I.noteVisible(o2) || I.keyVisible()) err(`${ctx}: the second trail note or the key shows before the first note is read`);
      S.readNote(t1.id, loc.id, t1.found);
      if (!I.noteVisible(o2) || I.keyVisible()) err(`${ctx}: reading ${t1.id} should show ${t2.id} and not yet the key`);
      S.readNote(t2.id, loc.id, t2.found);
      if (!I.keyVisible()) err(`${ctx}: reading ${t2.id} should show the key`);
      renderAround(ctx);
      I.player.x = kp.x;
      I.player.y = kp.y;
      I.updatePickups();
      if (!S.hasKeyFrom(loc.id) || I.keyVisible()) err(`${ctx}: walking onto the key did not pick it up`);
      // the stash: locked without its key (the one hidden in another building), open with it
      I.buildingInteract({ kind: "stash", obj: sd });
      if (sd.open) err(`${ctx}: the stash opened without its key`);
      S.trip.keys.push(S.keySourceFor(loc.id));
      I.buildingInteract({ kind: "stash", obj: sd });
      if (!sd.open || I.grid[sd.y][sd.x] !== "D") err(`${ctx}: the stash did not open with its key`);
      const open = I.reachable(start[0], start[1], true);
      const stash = I.items.filter((it) => it.source === "stash");
      if (stash.length !== loc.stash.length) err(`${ctx}: ${stash.length} stash items, want ${loc.stash.length}`);
      stash.forEach((it) => { if (!open.has(tile(it))) err(`${ctx}: stash item at ${tile(it)} cannot be reached with the stash open`); });
      // every sign can be read standing in front of it, and the panel shows its words
      I.signs.forEach((sg) => {
        const face = sg.face || Object.keys(SIDES).find((k) => !I.solidAt(sg.x + SIDES[k][0] + 0.5, sg.y + SIDES[k][1] + 0.5));
        const [dx, dy] = SIDES[face];
        I.player.x = sg.x + dx + 0.5;
        I.player.y = sg.y + dy + 0.5;
        I.player.a = Math.atan2(-dy, -dx);
        const t = I.nearReadable();
        if (!t || !t.sign || t.sign.id !== sg.id) return err(`${ctx}: sign ${sg.id} cannot be read from in front of it`);
        I.panelKey = null;
        I.updatePanel();
        const text = ZSR.signText(loc.id, sg.id).text;
        if (!text || !String(I.hud.read.innerHTML || "").includes(text.split(/\s+/).slice(0, 3).join(" ").replace(/&/g, "&amp;").replace(/"/g, "&quot;"))) err(`${ctx}: the panel does not show sign ${sg.id}`);
      });
      I.panelKey = null;
      S.abandonTrip();
    });
  });
  S.settings.level = levelWas;
} catch (e) {
  err(`story: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
}

/* ---------- The yard: every plot's sign (or plaque) can be read up close ---------- */
try {
  [0, 2].forEach((lv) => {
    Object.keys(W.BASE_ROOMS).forEach((k) => (S.save.rooms[k] = k === "walls" ? 0 : lv));
    I.enterYard({ firstCalm: 999 });
    I.stop();
    const plots = W.YARD.plots;
    if (I.lots.length !== Object.keys(plots).length) err(`yard (rooms at ${lv}): ${I.lots.length} readable plot signs, want ${Object.keys(plots).length}`);
    I.lots.forEach((lot) => {
      const [dx, dy] = SIDES[plots[lot.room].face];
      I.player.x = lot.x + dx * 1.2;
      I.player.y = lot.y + dy * 1.2;
      I.player.a = Math.atan2(-dy, -dx);
      // a lot's sign stays shut until E opens it, then reads; E again (or walking off) shuts it
      I.readLot = null;
      const shut = I.nearReadable();
      if (shut && shut.lot) err(`yard (rooms at ${lv}): the ${lot.room} plot's sign opens by itself; it should wait for E`);
      const f = I.facing();
      if (!f || f.kind !== "lot" || f.obj !== lot) return err(`yard (rooms at ${lv}): E in front of the ${lot.room} plot's sign does not reach it`);
      I.yardInteract(f);
      const t = I.nearReadable();
      if (!t || !t.lot || t.lot.room !== lot.room) return err(`yard (rooms at ${lv}): the ${lot.room} plot's sign cannot be read from in front of it`);
      I.panelKey = null;
      I.updatePanel();
      if (!String(I.hud.read.innerHTML || "").includes(W.BASE_ROOMS[lot.room].name)) err(`yard (rooms at ${lv}): the panel does not name the ${lot.room} plot`);
      I.yardInteract(f);
      if (I.nearReadable()) err(`yard (rooms at ${lv}): E again does not put the ${lot.room} plot's sign away`);
    });
  });
  Object.keys(W.BASE_ROOMS).forEach((k) => (S.save.rooms[k] = 0));
} catch (e) {
  err(`yard signs: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
}

/* ---------- You heal at home only ----------
   In the yard health comes back 1 every 15 seconds, faster with the Water room; never in a building. */
try {
  const regen = (water, enterIt, secs = 1) => {
    Object.keys(W.BASE_ROOMS).forEach((k) => (S.save.rooms[k] = 0));
    S.save.rooms.water = water;
    S.startTrip();
    enterIt();
    I.walkers = [];
    I.player.hp = 40;
    for (let i = 0; i < Math.round(secs / 0.05); i++) I.update(0.05);
    const hp = I.player.hp;
    I.stop();
    S.abandonTrip();
    return hp;
  };
  const shop = W.LOCATIONS.find((l) => l.id !== "base" && ZSR.LAYOUTS[l.id]);
  if (regen(2, () => I.enter(shop)) !== 40) err(`regen: health came back inside ${shop.id}; clean water heals at home only`);
  if (!(regen(2, () => I.enterYard({ firstCalm: 999 })) > 40)) err("regen: the Water room does not heal you in the yard");
  const slow = regen(0, () => I.enterYard({ firstCalm: 999 }), 15) - 40;
  if (Math.abs(slow - 1) > 0.01) err(`regen: without the Water room the yard healed ${slow.toFixed(2)} in 15 seconds; want 1`);
  if (regen(0, () => I.enter(shop), 15) !== 40) err(`regen: health came back inside ${shop.id} without the Water room`);
  Object.keys(W.BASE_ROOMS).forEach((k) => (S.save.rooms[k] = 0));
} catch (e) {
  err(`regen: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
}

/* ---------- Each save keeps its own settings ---------- */
try {
  const a = S.activeSlot();
  S.settings.level = 2;
  S.settings.textSize = "huge";
  S.saveSettings();
  S.newGame(a === 2 ? 3 : 2, "Second");
  const b = S.activeSlot();
  if (S.settings.seenHowto) err("settings: a new save skips its player's how-to");
  S.settings.level = 6;
  S.settings.textSize = "normal";
  S.saveSettings();
  S.loadSave(a);
  if (S.settings.level !== 2 || S.settings.textSize !== "huge") err(`settings: loading the first save brought back level ${S.settings.level}, size ${S.settings.textSize}; want 2, huge`);
  S.loadSave(b);
  if (S.settings.level !== 6 || S.settings.textSize !== "normal") err(`settings: loading the second save brought back level ${S.settings.level}, size ${S.settings.textSize}; want 6, normal`);
  const row = S.listSlots().find((x) => x.id === a);
  if (!row.settings || row.settings.level !== 2) err("settings: the slot list does not show each save's own reading level");
  S.deleteSlot(b);
  if (sb.localStorage.getItem("zs.settings." + b) != null) err("settings: deleting a save left its settings behind");
  // a save from before settings were per save reads the shared ones
  sb.localStorage.setItem("zs.settings", JSON.stringify({ level: 4 }));
  sb.localStorage.removeItem("zs.settings." + a);
  S.loadSave(a);
  if (S.settings.level !== 4) err(`settings: an older save did not start from the shared settings (level ${S.settings.level})`);
} catch (e) {
  err(`settings: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
}

if (errors.length) {
  errors.forEach((e) => console.log("ERROR " + e));
  console.log(`\n${errors.length} engine problem(s).`);
  process.exit(1);
}
console.log(`OK: engine entered ${entered} buildings and the yard: landmarks, footprints, start, decor, walkers, frames, the M map, exploring kept, guns on the floor, every gun mod and van-gun step visible, the story notes, keys, stashes and signs in every building, every yard plot's sign, and the cabin (every room, note and spot, a raid, a siege, a save).`);
