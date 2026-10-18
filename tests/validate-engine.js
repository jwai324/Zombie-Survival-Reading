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
   June's first-run tutorial (js/tutorial.js): the hold, the gate, the practice walker, the cards, replay, and no
   soft-lock from any state (seeded random histories, then a good player who must get the van out).
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
const PAGE = [...html.matchAll(/<script src="js\/([^"]+)"><\/script>/g)].map((m) => m[1]);
// the fact files: js/layouts.js, js/world.js and every js/story*.js the page loads (a split fact file, story-quests2.js,
// is run too; tests/validate-world.js reads the same list), then the engine
const FACT_FILES = ["layouts.js", "world.js"].concat(PAGE.filter((f) => /^story[\w-]*\.js$/.test(f)));
const WANT = FACT_FILES.concat(["upgrades.js", "weapons.js", "state.js", "crewstate.js", "audio.js", "sprites.js", "sprites3d.js", "walker3d.js", "walker3d-looks.js", "model3d.js", "van3d.js", "decor.js", "locks.js", "landmarks1.js", "landmarks2.js", "yardart.js", "riverart.js", "crewart.js", "streets.js", "perspective.js", "interior.js", "building.js", "yard.js", "house.js", "yardwreck.js", "crew.js", "river.js", "tutorial.js"]).concat(fs.existsSync(path.join(ROOT, "js", "houseart.js")) ? ["houseart.js"] : []);
const scripts = PAGE.filter((f) => WANT.includes(f) || f.startsWith("content/"));
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
/** A walker at the player: within 1.2 tiles, or biting (a lanky bites from farther: WORLD.WALKER_TYPES.lanky.reach). */
const atPlayer = (z, p) => Math.hypot(z.x - p.x, z.y - p.y) < Math.max(1.2, (z.reach || 0) + 0.05);
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
W.LOCATIONS.filter((l) => l.id !== "base" && !l.outdoor).forEach((loc) => {
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

/* ---------- Where a building's walkers start (js/building.js planWalkers, WORLD.NOTES[id].walkers) ----------
   Days 1 and 40, SPAWN_TRIPS fresh trips into every building with a gun lying in it: the day's count; each walker on
   its own tile, walkerSpawn.minSteps or more steps in, groupGap or more from the next, never on an item, cache or
   stash spot, a note spot (any level), the key, a scrap pile, a landmark, the gun, the fishing pole or a story
   quest's spot, nor in earshot of the door (Interior.HEAR in a straight line: it would wake as you come in); and
   every rule of its notes holds (the rings and zones are worked out here from the layout, with the doors shut):
   its count in its rings or zone (share), each anchor its part, a named landmark's walkers within r tiles of it
   ("one by the robot"), exact, all, type and only (the police: exactly one brute, in its garage ring).
   Math.random is seeded here, so every run checks the same visits. */
const SPAWN_TRIPS = 6; // SCALE: fresh visits per building and day (each one an enter(): about 5 ms)
/** Why a walker the alarm just brought starts where it should not ("" when it is fine; js/building.js updateAlarm):
    it comes through the way out, or from floor it can walk to you from with the doors as they stand (walkers
    cannot open doors); only when no such floor lies farther than ALARM.farFrom from you, from floor walkable from
    the way in through the doors, never inside a locked room. */
function alarmStartWhyNot(z) {
  const k = Math.floor(z.x) + "," + Math.floor(z.y);
  if (Math.hypot(z.x - I.startPos[0], z.y - I.startPos[1]) < 1) return ""; // through the way out
  const p = I.player;
  const here = I.reachable(Math.floor(p.x), Math.floor(p.y), false);
  if (here.has(k)) return "";
  if (I.floors.some(([x, y]) => here.has(Math.floor(x) + "," + Math.floor(y)) && Math.hypot(x - p.x, y - p.y) > W.ALARM.farFrom)) return "behind a shut door, though there is floor on your side of the doors";
  return I.reachable(Math.floor(I.startPos[0]), Math.floor(I.startPos[1]), true).has(k) ? "" : "inside a locked room, where it can never get to you";
}
{
  const ctxMath = vm.runInContext("Math", sb);
  const realRandom = ctxMath.random;
  ctxMath.random = ((s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)(3131);
  const day0 = S.save.day;
  const where0 = S.save.weapons.where;
  const WS = W.SETTINGS.walkerSpawn;
  const inRects = (R, x, y) => R.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
  try {
    W.LOCATIONS.filter((l) => l.id !== "base" && !l.outdoor).forEach((loc) => {
      const ctx = `${loc.id} walkers`;
      const lay = I.layoutFor(loc);
      const g = lay.grid;
      const rules = W.NOTES[loc.id].walkers || [];
      const zones = lay.walkerZones || {};
      // the layout's floor (a solid landmark's footprint blocked), its z anchors, its busy tiles
      const foot = new Set();
      const anchors = [];
      const busy0 = new Set();
      const marks = {}; // landmark name -> its footprint [x0, y0, x1, y1]
      g.forEach((row, y) => [...row].forEach((ch, x) => {
        if (ch === "z") anchors.push([x, y]);
        if ("ickny$1234".includes(ch)) busy0.add(x + "," + y);
        const def = "1234".includes(ch) && lay.landmarks[ch];
        if (def) {
          const [fw, fh] = def.foot || [1, 1];
          marks[def.name] = [x - (fw >> 1), y - (fh >> 1), x + (fw >> 1), y + (fh >> 1)];
          if (def.solid) for (let yy = y - (fh >> 1); yy <= y + (fh >> 1); yy++) for (let xx = x - (fw >> 1); xx <= x + (fw >> 1); xx++) foot.add(xx + "," + yy);
        }
      }));
      Object.values(lay.spots || {}).forEach(([x, y]) => busy0.add(x + "," + y));
      (W.QUESTS || []).forEach((q) => q.at === loc.id && Array.isArray(q.spot) && busy0.add(q.spot.join(",")));
      const floor = (x, y) => g[y] && ".inyz$ck1234".includes(g[y][x] || "#") && !foot.has(x + "," + y);
      const ring = (ax, ay, r, bx, by) => {
        // (with bx, by: from every tile of a landmark's footprint at once)
        const d = new Map();
        const q = [];
        for (let y = ay; y <= (by == null ? ay : by); y++) for (let x = ax; x <= (bx == null ? ax : bx); x++) {
          d.set(x + "," + y, 0);
          q.push([x, y]);
        }
        for (let i = 0; i < q.length; i++) {
          const [x, y] = q[i];
          if (d.get(x + "," + y) >= r) continue;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const k = x + dx + "," + (y + dy);
            if (!d.has(k) && floor(x + dx, y + dy)) {
              d.set(k, d.get(x + "," + y) + 1);
              q.push([x + dx, y + dy]);
            }
          }
        }
        return d;
      };
      [1, 40].forEach((day) => {
        S.save.day = day;
        const n = W.SETTINGS.walkersPerLocation(loc.danger, day);
        for (let trip = 0; trip < SPAWN_TRIPS; trip++) {
          const c = `${ctx} (day ${day}, visit ${trip + 1})`;
          S.startTrip();
          S.save.weapons.where = { bow: loc.id };
          I.enter(loc);
          I.stop();
          const busy = new Set(busy0);
          [I.gunPickup, I.rodPickup].forEach((o) => o && busy.add(Math.floor(o.x) + "," + Math.floor(o.y)));
          if (!I.gunPickup) err(`${c}: no gun on the floor to keep walkers off`);
          const reach = I.reachable(Math.floor(I.startPos[0]), Math.floor(I.startPos[1]), true);
          const Z = I.walkers.map((z) => ({ x: Math.floor(z.x), y: Math.floor(z.y), type: z.type, k: Math.floor(z.x) + "," + Math.floor(z.y) }));
          if (Z.length !== n) err(`${c}: ${Z.length} walkers, want ${n}`);
          Z.forEach((z, i) => {
            if (busy.has(z.k)) err(`${c}: a walker starts on a busy tile (an item, note, pile, key, landmark, gun, pole or quest spot) at ${z.k}`);
            if ((reach.get(z.k) || 0) < WS.minSteps) err(`${c}: a walker starts ${reach.get(z.k) || "no"} steps in at ${z.k} (need ${WS.minSteps}+)`);
            const heard = Math.hypot(z.x + 0.5 - I.startPos[0], z.y + 0.5 - I.startPos[1]);
            if (heard < I.HEAR) err(`${c}: a walker starts ${heard.toFixed(1)} tiles from the door at ${z.k}, in earshot (Interior.HEAR ${I.HEAR}): it wakes as you come in (planWalkers puts one there only when its rule has no room farther off: give it room)`);
            Z.forEach((o, j) => {
              if (j <= i) return;
              const d = Math.hypot(z.x - o.x, z.y - o.y);
              if (!d) err(`${c}: two walkers start on ${z.k}`);
              else if (d < WS.groupGap) err(`${c}: walkers at ${z.k} and ${o.k} start ${d.toFixed(2)} apart (walkerSpawn.groupGap ${WS.groupGap})`);
            });
          });
          rules.forEach((r, ri) => {
            const rc = `${c} rule ${ri + 1}`;
            const R = r.zone ? zones[r.zone] : null;
            if (r.all) {
              Z.filter((z) => !inRects(R, z.x, z.y)).forEach((z) => err(`${rc}: a walker starts outside ${r.zone} at ${z.k}`));
              return;
            }
            const want = Math.max(r.n || 0, r.share ? Math.ceil(r.share * n) : 0);
            const m = r.near != null ? marks[r.near] : null;
            const rings = m ? [ring(m[0], m[1], r.r || WS.ring, m[2], m[3])] : (r.z || []).map((zi) => ring(anchors[zi][0], anchors[zi][1], r.r || WS.ring));
            if (r.near != null && !m) err(`${rc}: near "${r.near}" is not a landmark here`);
            const mine = (z) => (!R || inRects(R, z.x, z.y)) && (!rings.length || rings.some((d) => d.has(z.k)));
            const there = Z.filter(mine);
            // its tiles are closed to every other walker: exactly its count there
            if (there.length !== want) err(`${rc}: ${there.length} walkers in its ${rings.length ? "rings" : "zone"}${R ? " in " + r.zone : ""}, want ${want}`);
            // "one by the robot": by the robot, within r tiles of its footprint every way
            if (m) there.forEach((z) => {
              const d = Math.max(m[0] - z.x, z.x - m[2], 0, m[1] - z.y, z.y - m[3]);
              if (d > (r.r || WS.ring)) err(`${rc}: its walker at ${z.k} is ${d} tiles from ${r.near}, want ${r.r || WS.ring} or fewer`);
            });
            rings.forEach((d, k) => {
              const part = Math.floor(want / rings.length);
              if (Z.filter((z) => d.has(z.k) && (!R || inRects(R, z.x, z.y))).length < part) err(`${rc}: fewer than ${part} walkers by anchor z${r.z[k]}`);
            });
            if (r.exact) {
              const inside = R ? Z.filter((z) => inRects(R, z.x, z.y)).length : there.length;
              if (inside !== want) err(`${rc}: exact, but ${inside} walkers start in ${r.zone || "its rings"} (want ${want})`);
            }
            if (r.share > 0.5 && !(Z.filter((z) => inRects(R, z.x, z.y)).length * 2 > n)) err(`${rc}: not most of the ${n} walkers in ${r.zone}`);
            if (r.type && there.filter((z) => z.type === r.type).length < want) err(`${rc}: its walkers are not all ${r.type}s (${there.map((z) => z.type).join(", ")})`);
            if (r.only && Z.filter((z) => z.type === r.type).length !== want) err(`${rc}: ${Z.filter((z) => z.type === r.type).length} ${r.type}s in the building, want only its ${want}`);
          });
        }
      });
    });
    // the police: one big one, by the bike in the garage, every visit (the door note, the graffiti, "One of them is big")
    const police = W.LOCATIONS.find((l) => l.id === "police");
    if (police) {
      S.save.day = 40;
      S.startTrip();
      I.enter(police);
      I.stop();
      const brutes = I.walkers.filter((z) => z.type === "brute");
      const garage = (I.layoutFor(police).walkerZones || {}).garage;
      if (brutes.length !== 1 || !garage || !inRects(garage, Math.floor(brutes[0].x), Math.floor(brutes[0].y))) err(`police walkers: want exactly one brute, in the garage (got ${brutes.length})`);
      // and its alarm, rung for 200 s: no second brute, never past the cap (one walker less, so a tick that brings two
      // comes one short of it), every walker where it can get to you: first with every door open, then (before the cap
      // fills) with every door you can shut shut, so no walker may start behind one while there is floor on your side
      I.walkers.pop();
      const inner = I.doors.filter((d) => !d.cache && !d.stash);
      inner.forEach((d) => d.open || I.toggleDoor(d));
      I.startAlarm();
      if (I.alarm.mix.brute) err("police walkers: the alarm's mix still holds brutes");
      const seen = new Set(I.walkers);
      for (let t = 0; t < 200; t += 0.25) {
        if (t === 8) inner.forEach((d) => d.open && I.toggleDoor(d));
        I.buildingUpdate(0.25);
        if (I.walkers.length > W.ALARM.cap) err(`police walkers: the alarm passed ALARM.cap (${I.walkers.length})`);
        I.walkers.forEach((z) => {
          if (seen.has(z)) return;
          seen.add(z);
          if (z.type === "brute") err("police walkers: the alarm brought a second brute");
          const why = alarmStartWhyNot(z);
          if (why) err(`police walkers: an alarm walker starts at ${Math.floor(z.x)},${Math.floor(z.y)}, ${why}`);
        });
      }
      if (seen.size < W.ALARM.cap) err(`police walkers: the alarm brought too few walkers (${seen.size})`);
      I.alarm = null;
      I.walkers.length = 0;
    }
  } catch (e) {
    err(`building spawns: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
  }
  ctxMath.random = realRandom;
  S.save.day = day0;
  S.save.weapons.where = where0;
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
  const wreckShare = W.DEFENSE.wreckShare;
  W.DEFENSE.raidShare = 0; // here every walker comes for the player; the cabin's raiders are checked below
  W.DEFENSE.wreckShare = 0; // and none goes for the builds or the van (js/yardwreck.js: checked on their own below)
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
        if (atPlayer(z, p)) {
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
    // out in the open middle of the yard, far from the cabin: a raider that passes within 5 tiles of you turns
    // on you instead (yardWalkerGoal), and the start by the front door is on their way in
    p.x = 22.5;
    p.y = 13.5;
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
        if (atPlayer(z, p)) {
          I.hurtWalker(z, 1e6);
          killed++;
        }
      });
    }
    if (I.phase.kind === "wave") err(`cabin raid: the walkers inside never came for the player (${I.walkers.length} left)`);
  }
  // the last of a wave waiting in the cabin hold it open, out of sight; with no counts on screen the game says where
  // they are: "Walkers got into the cabin" once a wave (not once a stay), then a cue at once and every ~20 s while
  // you stay out, the wave label's tail, and the van, the bed and the computer. Two waves in one stay.
  {
    W.DEFENSE.raidShare = 0;
    S.save.fence = {};
    S.save.house.hp = {};
    I.enterYard({ firstCalm: 999 });
    I.stop();
    const p = I.player;
    p.maxHp = p.hp = 1e9;
    const said = [];
    const toastWas = I.toast;
    I.toast = function (text) {
      said.push([I.time, String(text)]);
      return toastWas.apply(this, arguments);
    };
    const told = (re) => said.filter(([, s]) => re.test(s));
    try {
      const spot = I.raidSpots.find((s) => I.inCabin(s.x, s.y) && [0, 0.35, -0.35].every((d) => !I.solidAt(s.x + d, s.y + d)));
      const van = { kind: "van", obj: I.van, x: I.van.x, y: I.van.y };
      for (const wave of [1, 2]) {
        p.x = 22.5; // out in the open yard, far from the cabin
        p.y = 13.5;
        I.walkers.length = 0;
        I.phase = { kind: "calm", t: 0.01, total: 0, spawned: 0, spawnT: 0, size: "none", next: { size: "some", sides: ["n"] } };
        I.update(0.05);
        if (I.phase.kind !== "wave") {
          err(`cabin cue: wave ${wave} did not start`);
          break;
        }
        // a walker still at the fence: the van says the fence
        const out = I.makeWalker("walker", 22.5, 20.5, 1);
        I.walkers.push(out);
        Object.assign(I.phase, { total: 2, spawned: 2, spawnT: 99 });
        said.length = 0;
        I.yardInteract(van);
        if (!told(/Clear the fence first/).length || I.cabinHoldsWave()) err(`cabin cue: with a walker out in the yard the van does not say to clear the fence (${JSON.stringify(said.map(([, s]) => s))})`);
        // that one is down; one raider is in the cabin, at its spot
        I.walkers.length = 0;
        const z = I.makeWalker("walker", spot.x, spot.y, 1);
        Object.assign(z, { awake: true, raid: true, raidSpot: spot });
        I.walkers.push(z);
        said.length = 0;
        const t0 = I.time;
        const labels = new Set();
        for (let t = 0; t < 45; t += 0.05) {
          I.update(0.05);
          labels.add(I.hud.phase.textContent);
        }
        const c = `cabin cue, wave ${wave} of a stay`;
        if (I.phase.kind !== "wave" || !I.walkers.includes(z) || z.act !== "wait") err(`${c}: setup, the raider is not waiting in the cabin (${I.phase.kind}, ${z.act})`);
        const gotIn = told(/^Walkers got into the cabin/).length;
        if (gotIn !== 1) err(`${c}: "Walkers got into the cabin" was said ${gotIn} times, want once a wave`);
        const cues = told(/^Walkers are waiting in the cabin/).map(([t]) => t - t0);
        const gaps = cues.slice(1).map((t, i) => t - cues[i]);
        if (!cues.length || cues[0] > 0.5 || cues.length < 2 || gaps.some((g) => g < 15 || g > 25)) err(`${c}: the cue came at ${cues.map((t) => t.toFixed(1)).join(", ") || "never"} s; want at once and every ~20 s while you stay out`);
        if ([...labels].some((l) => l !== "WAVE · walkers in the cabin" || /\d/.test(l))) err(`${c}: the wave label read ${JSON.stringify([...labels])}, want "WAVE · walkers in the cabin" (where, never how many)`);
        said.length = 0;
        I.yardInteract(van);
        I.houseInteract({ kind: "spot", obj: "computer" });
        I.houseInteract({ kind: "spot", obj: "bed" });
        if (told(/still in the cabin/).length !== 3) err(`${c}: the van, the computer and the bed do not say walkers are still in the cabin (${JSON.stringify(said.map(([, s]) => s))})`);
        ["computer", "bed"].forEach((obj) => !/still in the cabin/.test(I.houseHint({ kind: "spot", obj })) && err(`${c}: the ${obj}'s hint does not say walkers are still in the cabin`));
        if (!/still in the cabin/.test(I.yardHint(van))) err(`${c}: the van's hint does not say walkers are still in the cabin`);
        // you go in and clear it: the wave ends, and the label's tail goes
        I.walkers.length = 0;
        I.update(0.05);
        if (I.phase.kind !== "calm" || /cabin/.test(I.hud.phase.textContent)) err(`${c}: cleared, the wave did not end or the label still says the cabin (${I.phase.kind}, "${I.hud.phase.textContent}")`);
      }
    } finally {
      I.toast = toastWas;
    }
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
        if (atPlayer(z, p)) {
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
  W.DEFENSE.wreckShare = wreckShare;
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

/* ---------- The yard: a breach draws only the walkers near it; wreckers and the builds ----------
   Owner, 2026-10-15 (js/yard.js yardPathBlock, js/yardwreck.js). A fence hole draws only the walkers outside the
   fence within DEFENSE.breachRange tiles of it, walking along the outside: of walkers placed 3, 6, 12 and 30 steps
   from one hole, the near ones go through it and the far ones claw their own segment; mending it sends them back to
   clawing; a corner hole leads nowhere and is never used; raiders and wreckers obey the same rule; with two holes in
   range a walker takes the nearer, even when the other is on the shorter way to you. Wreckers inside the fence claw
   the builds and the van (never below the van's floor); a wrecked build gives nothing until it is fixed (E, the
   computer, Tomas: js/crew.js), it shows (cracks, the plaque's tape, debris) and a save keeps it; every wrecker comes
   for you when hurt, near, or DEFENSE.wreckSeconds after getting in; "Can't die" means nothing gives. Math.random is
   seeded here. */
let wreckSpotsTried = 0;
{
  const ctxMath = vm.runInContext("Math", sb);
  const realRandom = ctxMath.random;
  const D = W.DEFENSE;
  const shares = { raidShare: D.raidShare, wreckShare: D.wreckShare };
  const god0 = S.god;
  try {
    ctxMath.random = ((s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)(9090);
    S.trip = null;
    const N4 = N8.slice(0, 4);
    const range = D.breachRange;
    const [hax, hay] = W.HOUSE.at;
    /** A fresh yard: rooms (a level for all, or a map), the fence whole but for `holes` ([[x, y]]) and too strong for
        new ones (unless opts.weakFence), a wave phase that never spawns, and a player no walker brings down. */
    const yardWith = (rooms, holes, opts) => {
      setRooms(rooms);
      S.save.builds = {};
      S.save.fence = Object.fromEntries((holes || []).map(([x, y]) => [x + "," + y, 0]));
      I.enterYard({ firstCalm: 999 });
      I.stop();
      if (!(opts && opts.weakFence)) Object.keys(I.fence).forEach((k) => (I.fence[k] = 1e9));
      I.player.maxHp = I.player.hp = 1e9;
      I.phase = { kind: "wave", size: "some", total: 0, spawned: 0, spawnT: 0, t: 0, sides: ["n"] };
      return I.player;
    };
    const tileOf = (z) => [Math.floor(z.x), Math.floor(z.y)];
    const idx = (x, y) => y * I.gw + x;
    const isInside = (z) => !!I.yardInside[idx(...tileOf(z))];
    /** Steps along open ground outside the fence from the fence tile (hx, hy) to every tile (-1: no way). */
    const outsideDist = (hx, hy) => {
      const m = I.solidMask();
      const d = new Int32Array(I.gw * I.gh).fill(-1);
      const q = [idx(hx, hy)];
      d[q[0]] = 0;
      for (let k = 0; k < q.length; k++) {
        const x = q[k] % I.gw;
        const y = (q[k] / I.gw) | 0;
        N4.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= I.gw || ny >= I.gh) return;
          const j = idx(nx, ny);
          if (d[j] >= 0 || m[j] || I.yardInside[j] || Y.grid[ny][nx] === "F") return;
          d[j] = d[q[k]] + 1;
          q.push(j);
        });
      }
      return d;
    };
    /** A tile exactly `n` steps away (one beside the fence when there is one), or null. */
    const tileAt = (dist, n) => {
      let any = null;
      for (let i = 0; i < dist.length; i++) {
        if (dist[i] !== n) continue;
        const x = i % I.gw;
        const y = (i / I.gw) | 0;
        if (N4.some(([dx, dy]) => (Y.grid[y + dy] || "")[x + dx] === "F")) return [x, y];
        any = any || [x, y];
      }
      return any;
    };
    const put = (type, [x, y], role) => {
      const z = I.makeWalker(type || "walker", x + 0.5, y + 0.5, 1);
      z.awake = true;
      z.pathT = 0;
      if (role === "raid") z.raid = true;
      if (role === "wreck") z.wreck = true;
      I.walkers.push(z);
      return z;
    };
    const via = (z, [hx, hy]) => (z.path || []).some(([x, y]) => Math.floor(x) === hx && Math.floor(y) === hy);
    const run = (secs, each) => {
      for (let t = 0; t < secs - 1e-9; t += 0.05) {
        I.update(0.05);
        if (each && each(t + 0.05) === false) break;
      }
    };
    // the fence: a hole in the middle of the top row, and its corner
    const F = [];
    Y.grid.forEach((row, y) => [...row].forEach((ch, x) => ch === "F" && F.push([x, y])));
    const fy0 = Math.min(...F.map(([, y]) => y));
    const top = F.filter(([, y]) => y === fy0).sort((a, b) => a[0] - b[0]);
    const hole = top[top.length >> 1];
    const corner = top[0];
    const [hx, hy] = hole;
    yardWith(0, [hole]);
    if (!I.breach || !I.breach.usable.includes(idx(hx, hy))) err(`yard breach: the hole at ${hole} is not usable`);
    if (!I.yardInside || I.yardInside[idx(hx, hy + 1)] !== 1 || I.yardInside[idx(hx, hy - 1)] !== 0) err("yard breach: the inside of the fence is wrong");
    const dist = outsideDist(hx, hy);
    const at = {};
    [3, 6, 12, 30].forEach((n) => (at[n] = tileAt(dist, n)));
    if ([3, 6, 12, 30].some((n) => !at[n])) err(`yard breach: no tiles at 3, 6, 12 and 30 steps from the hole (${JSON.stringify(at)})`);
    else {
      const near = (n) => n <= range;
      // 1. attackers 3, 6, 12 and 30 steps out: the near ones go through the hole, the far ones claw their own segment
      const zs = [3, 6, 12, 30].map((n) => ({ n, z: put("walker", at[n]) }));
      run(0.5);
      zs.forEach(({ n, z }) => {
        if (near(n) && (!via(z, hole) || z.fenceTarget)) err(`yard breach: a walker ${n} steps from the hole does not make for it (path ${JSON.stringify(z.path.slice(0, 3))}, clawing ${!!z.fenceTarget})`);
        if (!near(n) && (via(z, hole) || !z.fenceTarget)) err(`yard breach: a walker ${n} steps from the hole (more than ${range}) goes for it instead of clawing its own segment`);
      });
      const inAt = new Map();
      run(25, (t) => zs.forEach(({ z }) => !inAt.has(z) && isInside(z) && inAt.set(z, t)));
      zs.forEach(({ n, z }) => {
        if (near(n) && !inAt.has(z)) err(`yard breach: a walker ${n} steps from the hole never got in through it`);
        if (!near(n) && inAt.has(z)) err(`yard breach: a walker ${n} steps from the hole got in through it`);
        if (!near(n) && (!z.fenceTarget || Math.hypot(z.fenceTarget[0] - z.x, z.fenceTarget[1] - z.y) > 1)) err(`yard breach: a walker ${n} steps from the hole is not clawing at its own segment (at ${z.x.toFixed(1)},${z.y.toFixed(1)})`);
      });
      // 2. mended while they are on their way: back to clawing where they stand, and nobody gets in
      yardWith(0, [hole]);
      const two = [3, 6].map((n) => put("walker", at[n]));
      run(0.5);
      if (I.walkerOnTile(hx, hy)) err("yard breach: setup, a walker is already in the hole");
      I.mendFence(hx, hy);
      I.fence[hx + "," + hy] = 1e9;
      if (two.some((z) => z.pathT !== 0)) err("yard breach: mending a hole did not send every walker to find its way again at once");
      run(1);
      two.forEach((z, i) => {
        if (!z.fenceTarget || via(z, hole) || isInside(z)) err(`yard breach: a walker on its way to a hole just mended (${[3, 6][i]} steps) did not go back to clawing (clawing ${!!z.fenceTarget}, inside ${isInside(z)})`);
      });
      run(10);
      if (two.some(isInside)) err("yard breach: a walker got in after the hole was mended");
      // 3. raiders and wreckers obey it too: in range they go through, out of range they claw
      yardWith(0, [hole]);
      const roles = [];
      ["raid", "wreck"].forEach((role) => [3, 12].forEach((n) => roles.push({ role, n, z: put("walker", at[n], role) })));
      run(0.5);
      const roleName = (role) => (role === "raid" ? "raider" : "wrecker");
      roles.forEach(({ role, n, z }) => {
        if (near(n) !== via(z, hole) || near(n) === !!z.fenceTarget) err(`yard breach: a ${roleName(role)} ${n} steps from the hole ${near(n) ? "does not go" : "goes"} for it`);
      });
      run(20);
      roles.forEach(({ role, n, z }) => near(n) !== isInside(z) && err(`yard breach: a ${roleName(role)} ${n} steps from the hole is ${isInside(z) ? "" : "not "}inside after 20 s`));
      // 4. two holes in range: the nearer one, even with the other on the shorter way to the player
      const holeB = top.find(([x]) => x === hx + 6);
      if (holeB) {
        const p = yardWith(0, [hole, holeB]);
        p.x = holeB[0] + 0.5; // the player straight in from the farther hole
        p.y = hy + 20.5;
        const z = put("walker", [hx + 2, hy - 1]); // 3 steps from the first hole, 5 from the second
        run(0.5);
        if (!via(z, hole) || via(z, holeB)) err(`yard breach: with two holes in range a walker did not take the nearer one (via ${via(z, hole) ? "the nearer" : via(z, holeB) ? "the farther" : "neither"})`);
        // a new hole sends only the walkers it draws to find their way again at once; one far from every hole keeps
        // its own re-path clock (everyone at once made all of them search in the same frame, at every breach), and
        // searches nothing when it does re-path: no hole in range, so no way in (it claws its own segment)
        yardWith(0, [hole]);
        const outB = [holeB[0], holeB[1] - 1];
        if (I.solidAt(outB[0] + 0.5, outB[1] + 0.5) || I.yardInside[idx(...outB)]) err(`yard breach: test tile ${outB} outside the second hole is not open ground outside`);
        const byB = put("walker", outB);
        const far = put("walker", at[30]);
        run(0.5);
        byB.pathT = far.pathT = 0.3;
        delete I.fence[holeB[0] + "," + holeB[1]];
        I.grid[holeB[1]][holeB[0]] = ".";
        I.maskDirty = true;
        I.yardBreach(holeB[0], holeB[1]);
        if (byB.pathT !== 0) err("yard breach: a new hole did not send the walker right outside it to find its way again");
        if (far.pathT !== 0.3) err(`yard breach: a new hole 24+ steps away reset the re-path clock of a walker it does not draw (${far.pathT})`);
        const searched = { bfs: 0, barrier: 0 };
        const bfsWas = I.bfs;
        const barrierWas = I.yardBarrier;
        I.bfs = function (z) {
          if (z === far) searched.bfs++;
          return bfsWas.apply(this, arguments);
        };
        I.yardBarrier = function (z) {
          if (z === far) searched.barrier++;
          return barrierWas.apply(this, arguments);
        };
        let wentB = false;
        try {
          run(1, () => {
            const [x, y] = tileOf(byB);
            if (via(byB, holeB) || isInside(byB) || (x === holeB[0] && y === holeB[1])) wentB = true;
          });
        } finally {
          I.bfs = bfsWas;
          I.yardBarrier = barrierWas;
        }
        if (searched.bfs || searched.barrier) err(`yard breach: a walker with no hole in range searched for a way in (${searched.bfs} path searches, ${searched.barrier} barrier searches in 1 s); there is none`);
        if (!far.fenceTarget || Math.hypot(far.fenceTarget[0] - far.x, far.fenceTarget[1] - far.y) > 1) err("yard breach: a walker with no hole in range is not clawing its own segment");
        if (!wentB) err("yard breach: the walker right outside a new hole does not go through it");
      } else err(`yard breach: no fence segment 6 along from ${hole} for the two-hole checks`);
      // 5. a corner hole leads nowhere: never usable, never walked into
      yardWith(0, [corner]);
      if (I.breach.usable.length || !I.breach.holes.includes(idx(...corner))) err(`yard breach: the corner hole at ${corner} counts as a way in`);
      const cz = put("walker", tileAt(outsideDist(...corner), 2));
      let inCorner = false;
      run(8, () => {
        const [x, y] = tileOf(cz);
        if (x === corner[0] && y === corner[1]) inCorner = true;
      });
      if (inCorner || isInside(cz) || !cz.fenceTarget) err(`yard breach: a walker beside the corner hole went into it (${inCorner}) or got in (${isInside(cz)}), or is not clawing`);
      I.walkers.length = 0;
    }

    /* the builds and the wreckers */
    const plotted = ROOMS.filter((k) => Y.plots[k]);
    // every build wrecked, every build cracked: the builds stay on their plots, every art name is drawn, frames render
    [["wrecked", 0], ["cracked", 0.3]].forEach(([name, share]) => {
      setRooms(3);
      S.save.builds = Object.fromEntries(plotted.map((k) => [k, Math.floor(S.buildMax(k) * share)]));
      I.enterYard({ firstCalm: 999 });
      I.stop();
      yardCheck("yard all 3, every build " + name);
      plotted.forEach((k) => {
        const plaque = I.props.find((pr) => pr.art === "yPlaque" && pr.opts.t === W.BASE_ROOMS[k].name.toUpperCase());
        if (!plaque || plaque.opts.dmg !== (share ? 1 : 2)) err(`yard: the ${k} plaque does not show the build ${name} (${plaque && plaque.opts.dmg})`);
      });
      const debris = I.props.filter((pr) => pr.art === "yDebris");
      if (share ? debris.length : debris.length < plotted.length) err(`yard: ${debris.length} debris props with every build ${name}`);
      if (debris.some((pr) => pr.solid)) err("yard: debris is solid");
      if (!share && I.yardAnims.some((a) => a.kind === "blink")) err("yard: a wrecked build's lights still blink");
      // one order for every list of them (the HUD and toasts read State.wreckedRooms, Tomas's tip buildDamage)
      if (!share && JSON.stringify(I.buildDamage().wrecked) !== JSON.stringify(S.wreckedRooms())) err(`yard: the wrecked builds are listed in two orders (${I.buildDamage().wrecked} vs ${S.wreckedRooms()})`);
    });
    S.save.builds = {};

    // a wave of nothing but wreckers, every room built, you far off in the cabin's living room and not shooting
    D.raidShare = 0;
    D.wreckShare = 1;
    const p = yardWith(3, [], { weakFence: true });
    const far = [hax + 14.5, hay + 14.5];
    const fx0 = JSON.stringify(S.effects());
    const vanMax = S.vanMaxHp();
    const floor = Math.round(vanMax * D.vanWreckFloor);
    p.x = far[0];
    p.y = far[1];
    I.phase = { kind: "wave", size: "many", total: 10, spawned: 0, spawnT: 0, t: 0, sides: ["n", "e"] };
    const inside = new Map();
    const flip = new Map();
    let clawed = 0;
    let vanLow = Infinity;
    let t = 0;
    while (t < 300 && I.phase.kind === "wave") {
      I.update(0.05);
      t += 0.05;
      vanLow = Math.min(vanLow, S.save.vanHp);
      I.walkers.forEach((z) => {
        if (z.wreckIn != null && !inside.has(z)) inside.set(z, z.wreckIn);
        if (inside.has(z) && !z.wreck && !flip.has(z)) flip.set(z, I.time - inside.get(z));
        if (z.act === "claw" && I.wreckAtSpot(z)) clawed++;
        if (atPlayer(z, p)) I.hurtWalker(z, 1e6); // close: you shoot it
      });
    }
    const wrecked = S.wreckedRooms();
    if (!clawed) err("wreckers: none ever stood clawing at a build or the van");
    if (!wrecked.length && !Object.keys(S.save.builds).length) err("wreckers: a wave of them never touched a build");
    if (I.phase.kind === "wave") err(`wreckers: the wave never ended (${I.walkers.length} left after ${t.toFixed(0)} s)`);
    if (inside.size < 10) err(`wreckers: only ${inside.size} of 10 got inside the fence`);
    const late = [...inside.keys()].filter((z) => !flip.has(z) || flip.get(z) > D.wreckSeconds + 0.1);
    if (late.length) err(`wreckers: ${late.length} did not come for the player within ${D.wreckSeconds} s of getting inside`);
    if (vanLow < floor) err(`wreckers: the van went below its floor (${vanLow} < ${floor})`);
    if (!wrecked.length) err("wreckers: a wave of ten wrecked no build");
    else {
      const fx = S.effects();
      if (JSON.stringify(fx) === fx0) err(`wreckers: wrecking the ${wrecked.join(", ")} changed no room bonus`);
      if (JSON.stringify(I.fx) !== JSON.stringify(fx)) err("wreckers: the yard's own copy of the room bonuses (I.fx) was not updated");
      wrecked.forEach((k) => S.roomLevel(k) !== 0 && err(`wreckers: roomLevel(${k}) is not 0 while wrecked`));
    }
    // the van alone (nothing built): clawed down to its floor and no further, said once, then it comes for you
    {
      const q = yardWith(0, [hole], { weakFence: true });
      q.x = far[0];
      q.y = far[1];
      const vanFloor = Math.round(S.vanMaxHp() * D.vanWreckFloor);
      S.save.vanHp = S.vanMaxHp();
      const sp = I.wreckSpots.van[0];
      const vz = put("brute", [sp.tx, sp.ty], "wreck");
      vz.dps = 1e4; // a very strong one: the floor must hold all the same
      let toldVan = 0;
      const toast = I.toast;
      I.toast = function (text, secs) {
        if (/wrecking the van/.test(text)) toldVan++;
        return toast.call(this, text, secs);
      };
      let low = Infinity;
      run(5, () => (low = Math.min(low, S.save.vanHp)));
      I.toast = toast;
      if (vz.wreck) err("wreckers: with only the van to wreck, one kept at it at its floor");
      if (low !== vanFloor) err(`wreckers: the van ended at ${low}, not its floor ${vanFloor}`);
      if (toldVan !== 1) err(`wreckers: "They are wrecking the van!" was said ${toldVan} times in one wave`);
      I.walkers.length = 0;
      S.save.vanHp = S.vanMaxHp();
    }
    // provoked: hurt (a trap too) at once; you within wreckProvoke tiles; never a wrecker again
    {
      const q = yardWith(3, []);
      q.x = far[0];
      q.y = far[1];
      const spot = I.wreckSpots[plotted[0]][0];
      const a = put("walker", [spot.tx, spot.ty], "wreck");
      const b = put("walker", [spot.tx, spot.ty], "wreck");
      run(0.2);
      if (!a.wreck || !a.wreckSpot) err("wreckers: one standing inside by a build did not pick a target");
      I.hurtWalker(a, 1, { x: a.x + 1, y: a.y });
      run(0.1);
      if (a.wreck || a.wreckSpot) err("wreckers: a hurt wrecker did not turn on the player at once");
      q.x = b.x + D.wreckProvoke - 0.5;
      q.y = b.y;
      run(0.1);
      if (b.wreck) err(`wreckers: one with the player ${D.wreckProvoke - 0.5} tiles off did not turn on the player`);
      I.walkers.length = 0;
    }
    /** Open ground inside the fence `d` tiles from z with a clear line to it, or null. */
    const screamStand = (z, d) => {
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const x = z.x + Math.cos(a) * d;
        const y = z.y + Math.sin(a) * d;
        if (x < 0 || y < 0 || x >= I.gw || y >= I.gh || !I.yardInside[idx(Math.floor(x), Math.floor(y))]) continue;
        if (!I.solidForPlayer(x, y) && I.lineClear(z.x, z.y, x, y)) return [x, y];
      }
      return null;
    };
    // a screamer wrecker yelling at you (you between wreckProvoke and the scream's spotting range, in its sight)
    // claws nothing meanwhile: its build loses strength only while it claws (the harm goes with the claw pose)
    {
      const SC = W.SCREAM;
      const q = yardWith(3, []);
      q.x = far[0];
      q.y = far[1];
      const room = plotted[0];
      const spot = I.wreckSpots[room][0];
      const z = put("screamer", [spot.tx, spot.ty], "wreck");
      run(0.5);
      const hp0 = S.buildHp(room);
      if (!(hp0 < S.buildMax(room))) err(`wreckers: setup, a screamer wrecker at the ${room} build did not claw it (${hp0})`);
      const stand = screamStand(z, (D.wreckProvoke + SC.spot) / 2);
      if (stand) {
        q.x = stand[0];
        q.y = stand[1];
        run(0.1); // it spots you and starts yelling (the claw a frame late: the core's act is last frame's)
        const hp1 = S.buildHp(room);
        let yelling = 0;
        run(SC.yell - 0.3, () => {
          if (z.yell > 0) yelling++;
        });
        if (!yelling || !z.wreck) err(`wreckers: setup, the screamer wrecker did not stand yelling at you (yell ${z.yell}, wreck ${z.wreck})`);
        else if (S.buildHp(room) < hp1) err(`wreckers: the ${room} build lost ${(hp1 - S.buildHp(room)).toFixed(2)} strength while its screamer wrecker stood yelling at you`);
      }
      I.walkers.length = 0;
    }
    // a hurt lasts: a screamer wrecker shot as its yell starts (the yell outlasts hurtT, and the core asks for no
    // goal while it yells) still turns on you once the yell ends, with you out of wreckProvoke but in its sight
    {
      const SC = W.SCREAM;
      const q = yardWith(3, []);
      q.x = far[0];
      q.y = far[1];
      const spot = I.wreckSpots[plotted[0]][0];
      const z = put("screamer", [spot.tx, spot.ty], "wreck");
      run(0.2);
      if (!z.wreck || z.wreckIn == null || z.yell > 0) err(`wreckers: a screamer wrecker inside by a build did not settle to wreck (wreck ${z.wreck}, yell ${z.yell})`);
      // you: between wreckProvoke and the scream's spotting range, a clear line, open ground inside the fence
      const d = (D.wreckProvoke + SC.spot) / 2;
      const stand = screamStand(z, d);
      if (!stand) err(`wreckers: no open ground ${d} tiles from the ${plotted[0]} build's first wreck spot in clear sight`);
      else {
        q.x = stand[0];
        q.y = stand[1];
        run(0.05);
        if (!(z.yell > 0)) err(`wreckers: a screamer wrecker with you ${d} tiles off in clear sight did not scream (yell ${z.yell})`);
        else {
          I.hurtWalker(z, 1, q); // shot as the yell starts
          run(SC.yell + 0.3);
          if (z.yell > 0) err("wreckers: the screamer's yell did not end");
          if (z.wreck || z.wreckSpot) err(`wreckers: a screamer wrecker shot during its yell (you ${d} tiles off) went back to wrecking once it ended`);
        }
      }
      I.walkers.length = 0;
    }
    // god mode's "Can't die": they claw, nothing gives
    {
      S.god = { base: null, cheats: { noDie: true }, offer: {}, onCommit: null };
      const q = yardWith(3, []);
      q.x = far[0];
      q.y = far[1];
      S.save.vanHp = vanMax;
      [I.wreckSpots[plotted[0]][0], I.wreckSpots.van[0]].forEach((sp) => put("brute", [sp.tx, sp.ty], "wreck"));
      run(5);
      if (Object.keys(S.save.builds).length || S.save.vanHp !== vanMax) err(`wreckers: with Can't die on, a build or the van took harm (${JSON.stringify(S.save.builds)}, van ${S.save.vanHp})`);
      S.god = god0;
      I.walkers.length = 0;
    }
    D.raidShare = shares.raidShare;
    D.wreckShare = shares.wreckShare;

    // a wrecked build: its bonus is gone, it shows, a save keeps it, E fixes it (not while clawed at, not without
    // the scrap), the computer fixes what the scrap pays for, and a new level puts it up whole
    {
      const room = plotted.find((k) => W.BASE_ROOMS[k].levels[0].effect.foodPerDay) || plotted[0];
      const q = yardWith(1, []);
      const fxWhole = S.effects();
      I.hitBuild(room, 1e9);
      if (!S.roomWrecked(room) || S.save.builds[room] !== 0) err(`wrecked build: ${room} is not wrecked after a hit past its strength`);
      if (JSON.stringify(S.effects()) === JSON.stringify(fxWhole)) err(`wrecked build: the ${room}'s bonus still counts`);
      S.commit();
      S.save = S.loadSave(S.activeSlot());
      if (S.save.builds[room] !== 0) err("wrecked build: a save did not keep it wrecked");
      I.enterYard({ firstCalm: 999 });
      I.stop();
      const plaque = I.props.find((pr) => pr.art === "yPlaque" && pr.opts.t === W.BASE_ROOMS[room].name.toUpperCase());
      if (!plaque || plaque.opts.dmg !== 2) err("wrecked build: the plaque does not show it wrecked after a reload");
      // its sign says so and how to fix it; the panel's key changes once it is fixed
      const lot = I.lots.find((l) => l.room === room);
      const panel = I.lotPanel(lot);
      if (!/wrecked/.test(panel.status) || panel.meta[0][0] !== "Wrecked") err(`wrecked build: the plaque's panel does not say so (${panel.status} / ${panel.meta[0]})`);
      const key0 = I.readableKey({ lot });
      const scrap0 = S.save.scrap;
      // E beside one of its solid tiles
      const me = I.player;
      me.maxHp = me.hp = 1e9;
      const [sx, sy] = I.plotSolid[room][0];
      const stand = N4.map(([dx, dy]) => [sx + dx, sy + dy]).find(([x, y]) => !I.solidForPlayer(x + 0.5, y + 0.5));
      me.x = stand[0] + 0.5;
      me.y = stand[1] + 0.5;
      me.a = Math.atan2(sy - stand[1], sx - stand[0]);
      const f = I.facing();
      if (!f || f.kind !== "wreck" || f.obj !== room) err(`wrecked build: E beside it does not offer to fix it (${f && f.kind})`);
      else if (!/fix the wrecked/.test(I.yardHint(f))) err(`wrecked build: the hint is "${I.yardHint(f)}"`);
      const cost = W.SETTINGS.buildRepairScrap;
      S.save.scrap = cost - 1;
      if (I.repairBuild(room) || !S.roomWrecked(room)) err("wrecked build: fixed without the scrap for it");
      S.save.scrap = cost + 5;
      const sp = I.wreckSpots[room][0];
      const claw = put("walker", [sp.tx, sp.ty], "wreck");
      claw.wreckTarget = room;
      claw.wreckSpot = sp;
      if (I.repairBuild(room) || !S.roomWrecked(room)) err("wrecked build: fixed while a wrecker clawed at it");
      I.walkers.length = 0;
      if (!I.repairBuild(room) || S.roomWrecked(room) || S.save.scrap !== 5) err(`wrecked build: E did not fix it for ${cost} scrap (scrap ${S.save.scrap})`);
      if (JSON.stringify(S.effects()) !== JSON.stringify(fxWhole) || JSON.stringify(I.fx) !== JSON.stringify(fxWhole)) err("wrecked build: fixed, its bonus did not come back");
      const scrapNow = S.save.scrap;
      S.save.scrap = scrap0; // the same scrap: only the build changed
      if (I.readableKey({ lot: I.lots.find((l) => l.room === room) }) === key0) err("wrecked build: the plaque's panel key did not change once it was fixed");
      S.save.scrap = scrapNow;
      // the computer's "Fix all": as many as the scrap pays for
      plotted.forEach((k) => I.hitBuild(k, 1e9));
      S.save.scrap = cost * 2;
      if (I.repairAllBuilds() !== 2 || S.wreckedRooms().length !== plotted.length - 2 || S.save.scrap !== 0) err(`wrecked build: Fix all with scrap for two fixed ${plotted.length - S.wreckedRooms().length}`);
      // a new level goes up whole
      const up = S.wreckedRooms()[0];
      const nextDef = W.BASE_ROOMS[up].levels[S.save.rooms[up]];
      Object.assign(S.save.inventory, nextDef.needs);
      S.save.scrap = nextDef.scrap;
      Object.entries(nextDef.requires || {}).forEach(([r, l]) => (S.save.rooms[r] = Math.max(S.save.rooms[r], l)));
      if (!S.upgradeRoom(up) || S.roomWrecked(up) || up in S.save.builds) err(`wrecked build: building the ${up} up a level left it wrecked`);
      S.save.builds = {};
      // a wrecked Radio tower hears no broadcast that day; fixed, the next day's comes
      S.save.rooms.radio = 1;
      S.save.builds.radio = 0;
      const heard = S.save.radioHeard;
      S.startTrip();
      S.returnHome();
      if (S.save.log[S.save.log.length - 1].radio != null || S.save.radioHeard !== heard) err("wrecked build: a wrecked Radio tower still brought a broadcast");
      delete S.save.builds.radio;
      S.startTrip();
      S.returnHome();
      if (S.save.log[S.save.log.length - 1].radio == null) err("wrecked build: the fixed Radio tower brought no broadcast");
      S.trip = null;
    }
    // the van's dents: it looks different as wreckers claw it down (js/van3d.js: its dents by its health, and a dented
    // van is another model)
    {
      yardWith(0, []);
      const V3 = ZSR.Van3D;
      const u = S.save.upgrades;
      S.save.vanHp = S.vanMaxHp();
      const whole = V3.dentNow();
      S.save.vanHp = Math.round(S.vanMaxHp() * D.vanWreckFloor);
      const clawed = V3.dentNow();
      if (whole !== 0) err(`wreckers: the whole van shows dents (tier ${whole})`);
      if (clawed === whole || V3.sig(u, { dent: clawed }) === V3.sig(u, { dent: whole }) || V3.mesh(u, { dent: clawed }) === V3.mesh(u, { dent: whole })) err("wreckers: the van shows no dents at its floor");
      S.save.vanHp = S.vanMaxHp();
    }
    // an old save: no builds field, or junk in it
    {
      const old = JSON.parse(JSON.stringify(S.save));
      delete old.builds;
      sb.localStorage.setItem("zs.save." + S.activeSlot(), JSON.stringify(old));
      const a = S.loadSave(S.activeSlot());
      if (!a.builds || Object.keys(a.builds).length) err(`old save: builds is ${JSON.stringify(a.builds)}, not {}`);
      const built = plotted.filter((k) => old.rooms[k] > 0);
      const unbuilt = plotted.find((k) => !old.rooms[k]);
      old.builds = { walls: 0, nowhere: 3 };
      if (unbuilt) old.builds[unbuilt] = 0;
      if (built[0]) old.builds[built[0]] = 1e9; // past its strength: whole
      if (built[1]) old.builds[built[1]] = 7;
      if (built[2]) old.builds[built[2]] = -4;
      sb.localStorage.setItem("zs.save." + S.activeSlot(), JSON.stringify(old));
      const b = S.loadSave(S.activeSlot());
      const want = built[1] ? { [built[1]]: 7 } : {};
      if (JSON.stringify(b.builds) !== JSON.stringify(want)) err(`old save: builds ${JSON.stringify(old.builds)} loaded as ${JSON.stringify(b.builds)}, want ${JSON.stringify(want)}`);
    }
    // from every wreck spot a walker reaches you: a wrecker turns on you there, and one caught on a build's corner
    // would keep its wave from ever ending (the straight-line shortcut clears a corner by a walker's middle, not its
    // shoulders; js/yard.js yardUnjam walks it round by the tile middles). Every room at each level, a walker of
    // each kind in turn at every spot, you at the yard's start. Only the walker's step and the yard's unjam run: the
    // rest of a frame is not what this tests, and costs about seven times as much.
    {
      const types = Object.keys(W.WALKER_TYPES);
      const top = Math.max(...ROOMS.map((k) => W.BASE_ROOMS[k].levels.length));
      const stuck = [];
      let tried = 0;
      for (let lvl = 1; lvl <= top; lvl++) {
        const q = yardWith(Object.fromEntries(ROOMS.map((k) => [k, Math.min(lvl, W.BASE_ROOMS[k].levels.length)])), []);
        const start = [q.x, q.y];
        const spots = [].concat(...Object.entries(I.wreckSpots).map(([target, list]) => list.map((sp) => [target, sp])));
        spots.forEach(([target, sp], i) => {
          I.walkers.length = 0;
          q.x = start[0];
          q.y = start[1];
          const z = put(types[i % types.length], [sp.tx, sp.ty]);
          for (let t = 0; t < 60 && !atPlayer(z, q); t += 0.05) {
            I.updateWalker(z, 0.05);
            I.yardUnjam(0.05);
          }
          tried++;
          if (!atPlayer(z, q)) stuck.push(`a ${z.type} from the ${target} spot ${sp.tx},${sp.ty} (rooms at ${lvl}) is at ${z.x.toFixed(1)},${z.y.toFixed(1)}`);
        });
      }
      I.walkers.length = 0;
      if (!tried) err("yard: no wreck spots to start a walker from");
      if (stuck.length) err(`yard: from ${stuck.length} of ${tried} wreck spots a walker never reached you in 60 s: ${stuck.slice(0, 3).join("; ")}`);
      wreckSpotsTried = tried;
    }
  } catch (e) {
    err(`yard breach and wreckers: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
  } finally {
    D.raidShare = shares.raidShare;
    D.wreckShare = shares.wreckShare;
    S.god = god0;
    ctxMath.random = realRandom;
    I.walkers.length = 0;
    S.newGame(S.activeSlot(), "Test");
    S.trip = null;
  }
}

/* ---------- Every upgrade step shows on the guns and the van ----------
   The guns and the van (js/van3d.js, the one 3D model drawn everywhere) are drawn on a tiny rasterizer that keeps,
   for every pixel, the color painted there last (fills and strokes; text is skipped), and each level is compared with
   the one below it: a step that changes almost nothing (a part drawn, then covered by the next one) fails. */
/** A w x h rasterizer; shared: a color-id table to share with other rasterizers, so their pixels compare by color. */
function raster(w, h, shared) {
  const px = new Int32Array(w * h); // 0: nothing painted; else a color id
  const ids = shared || new Map();
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
    ids,
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
  // the van's own gun on the road (the roof gun standing on the 3D van, js/perspective.js gun): every Garage gun
  // upgrade step shows, seen close from the road's camera behind the van
  const vanGunAt = (u) => {
    const c = sb.document.createElement("canvas");
    c.width = 400;
    c.height = 400;
    const g = c.getContext("2d");
    const th = -Math.PI / 2;
    const scene = { W: 400, H: 400, zoom: 1.5, vanAt: 0.7, cam: { x: 0, y: 0, th }, mods: {}, upgrades: Object.assign({ armor: 0, engine: 0, bumper: 0, paint: 0, damage: 0, fireRate: 0, spread: 0 }, u), van: { x: 0, y: 0, heading: th, w: 66, h: 118, aimW: th + 0.5, aimDz: -0.02, flash: 0 } };
    ZSR.Persp.setup(scene);
    ZSR.Persp.gun(scene, g);
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
  // the van: drawn flat-lit (every face its own color) from five sides: its front from a little above (the hood
  // showing), behind, its left and right, and the road camera's behind and above. Every armor, ram plow and engine
  // step, from nothing and from the middle, changes it over the five (and on its own from the road camera, from a side
  // and from an end: the road shows it from behind every frame, the yard all round); every look differs from every
  // other by a clear margin; each look's decal color shows from both sides and over the hood; each dent tier shows
  const V3 = ZSR.Van3D;
  const M3 = ZSR.Model3D;
  const RW = 240;
  const RH = 180;
  const SIDES = [["front", Math.PI, 0.45], ["back", 0, 0.3], ["left", -Math.PI / 2, 0.2], ["right", Math.PI / 2, 0.2], ["road camera", 0.12, 0.86]];
  const colors = new Map(); // one color-id table for every van drawn here
  const vanViews = SIDES.map(([, yaw, pitch]) => {
    const t = [0, 0, V3.H / 2];
    const dist = 330;
    const e = [Math.sin(yaw) * Math.cos(pitch) * dist, -Math.cos(yaw) * Math.cos(pitch) * dist, t[2] + Math.sin(pitch) * dist];
    const nz = (a) => {
      const l = Math.hypot(a[0], a[1], a[2]);
      return [a[0] / l, a[1] / l, a[2] / l];
    };
    const f = nz([t[0] - e[0], t[1] - e[1], t[2] - e[2]]);
    const r = nz([f[1], -f[0], 0]);
    const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    const F = RH / 2 / Math.tan(0.4);
    const view = M3.view({ ink: 1.2, lod: 0, eye: e, lit: () => 1 });
    view.project = (x, y, z) => {
      const dx = x - e[0];
      const dy = y - e[1];
      const dz = z - e[2];
      const D = dx * f[0] + dy * f[1] + dz * f[2];
      view.D = D;
      view.X = RW / 2 + ((dx * r[0] + dy * r[1] + dz * r[2]) * F) / D;
      view.Y = RH / 2 - ((dx * u[0] + dy * u[1] + dz * u[2]) * F) / D;
      return D > 0;
    };
    return view;
  });
  /** The van drawn from the five sides: their pixels. */
  const vanAt = (u, o) =>
    vanViews.map((view) => {
      const g = raster(RW, RH, colors);
      V3.draw(g, view, Object.assign({ armor: 0, bumper: 0, engine: 0, paint: 0, damage: 0, fireRate: 0, spread: 0 }, u), o || {});
      return g.px;
    });
  const sum = (a, b, which) => which.reduce((n, i) => n + differ(a[i], b[i]), 0);
  for (const k of ["armor", "bumper", "engine"]) for (const o of [0, 3]) {
    const base = { armor: o, bumper: o, engine: o };
    for (let lv = 1; lv <= 5; lv++) {
      const a = vanAt(Object.assign({}, base, { [k]: lv - 1 }));
      const b = vanAt(Object.assign({}, base, { [k]: lv }));
      const all = sum(a, b, [0, 1, 2, 3, 4]);
      if (all < 40) err(`upgrades: the van at ${k} ${lv} looks like ${k} ${lv - 1} (${all} px change over five sides; the others at ${o})`);
      [["the road camera", [4]], ["a side", [2, 3]], ["an end", [0, 1]]].forEach(([from, which]) => {
        const d = sum(a, b, which);
        if (d < 8) err(`upgrades: from ${from} the van at ${k} ${lv} looks like ${k} ${lv - 1} (${d} px change; the others at ${o})`);
      });
    }
  }
  const LOOKS = ZSR.Upgrades.PAINT_LOOKS;
  const looks = LOOKS.map((l, p) => vanAt({ paint: p }));
  const painted = (a, b) => a.reduce((n, px, i) => n + px.reduce((m, v, j) => m + (v || b[i][j] ? 1 : 0), 0), 0);
  for (let p = 0; p < LOOKS.length; p++) {
    for (let q = p + 1; q < LOOKS.length; q++) {
      const d = sum(looks[p], looks[q], [0, 1, 2, 3, 4]);
      const all = painted(looks[p], looks[q]);
      if (d < all * 0.3) err(`upgrades: the van in ${LOOKS[p].name} looks too like ${LOOKS[q].name} (${d} of ${all} px differ)`);
    }
    if (LOOKS[p].decal === "none") continue;
    // its decal's own color (flat-lit, Model3D paints a color as it is)
    const c = M3.rgb(LOOKS[p].decalA);
    const id = colors.get("rgb(" + c[0] + "," + c[1] + "," + c[2] + ")");
    [["the left", 2], ["the right", 3], ["the front, over the hood", 0]].forEach(([from, i]) => {
      const n = id ? looks[p][i].reduce((m, v) => m + (v === id ? 1 : 0), 0) : 0;
      if (n < 12) err(`upgrades: the van in ${LOOKS[p].name} shows its ${LOOKS[p].decal} decal (${LOOKS[p].decalA}) on only ${n} px from ${from}`);
    });
  }
  const dents = [0, 1, 2].map((dent) => vanAt({ paint: 3 }, { dent }));
  for (let t = 1; t <= 2; t++) {
    const d = sum(dents[t - 1], dents[t], [0, 1, 2, 3, 4]);
    if (d < 40) err(`upgrades: the van with dents ${t} looks like dents ${t - 1} (${d} px change over five sides)`);
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
    W.LOCATIONS.filter((l) => l.id !== "base" && !l.outdoor).forEach((loc) => {
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
      // the stash: locked without its key (the one hidden in another building); with keys in hand you pick
      // one to try, and only the right one opens it
      const realPrompt = I.lockPrompt;
      let asked = null;
      I.lockPrompt = (opts, then) => {
        asked = opts;
        const right = opts.options.find((o) => o.value === S.keySourceFor(loc.id));
        then(right ? { value: right.value } : { cancel: true });
      };
      S.trip.keys = S.trip.keys.filter((k) => k !== S.keySourceFor(loc.id));
      I.buildingInteract({ kind: "stash", obj: sd });
      if (sd.open) err(`${ctx}: the stash opened without its key`);
      S.trip.keys.push(S.keySourceFor(loc.id));
      I.buildingInteract({ kind: "stash", obj: sd });
      I.lockPrompt = realPrompt;
      if (!asked || !asked.options.some((o) => o.value === S.keySourceFor(loc.id))) err(`${ctx}: the stash does not offer the keys in hand`);
      else if (asked.options.some((o) => /opens|at /i.test(o.label))) err(`${ctx}: a key in the stash picker says where it goes`);
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

/* ---------- The locks (WORLD.LOCKS, js/locks.js): every cache opens only by doing what its note says ----------
   For every building: the fixtures can be reached and used, the right answer opens it, a wrong one costs what
   the note warns (a trap: down; the alarm: walkers pour in and the way out is shut; a jam: a crowbar), "god mode"
   opens it, the answers fill the notes, and a stash's wrong key jams it, snaps off, or just does not turn. */
try {
  const L0 = ZSR.Locks;
  const facingKind = (kind) => {
    const f = I.facing();
    return f && f.kind === kind;
  };
  /** Stand on reachable floor next to (x, y), facing it; true if E would reach it as `kind`. */
  const standAt = (tx, ty, kind, reach) => {
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const x = tx + dx;
      const y = ty + dy;
      if (!reach.has(x + "," + y)) continue;
      I.player.x = x + 0.5;
      I.player.y = y + 0.5;
      I.player.a = Math.atan2(ty - y, tx - x);
      if (facingKind(kind)) return true;
    }
    return false;
  };
  const answerFor = (loc, kind) => {
    const a = L0.answer(loc.id);
    const L = L0.spec(loc.id);
    if (kind === "door") return L.door.kind === "code" ? a.code.replace(/\D/g, "") : a.moves.slice();
    if (kind === "search") return a.pick;
    if (kind === "panel") return a.button;
    return null;
  };
  const wrongFor = (loc, kind) => {
    const a = L0.answer(loc.id);
    const L = L0.spec(loc.id);
    if (kind === "door") return L.door.kind === "code" ? a.decoyCode.replace(/\D/g, "") : a.decoyMoves.slice();
    if (kind === "search") return a.decoyPick;
    if (kind === "panel") return a.decoyButton;
    return null;
  };
  let deaths = 0;
  I.hooks.onDeath = () => deaths++;
  const realPrompt = I.lockPrompt;
  let reply = null; // what the next prompt answers
  let prompts = 0;
  I.lockPrompt = (opts, then) => {
    prompts++;
    then(typeof reply === "function" ? reply(opts) : reply);
  };
  // two saves roll different answers
  const seedWas = S.save.lockSeed;
  const rolls = new Set();
  [11, 22, 33, 44].forEach((seed) => {
    S.save.lockSeed = seed;
    rolls.add(JSON.stringify(W.LOCATIONS.filter((l) => W.LOCKS[l.id]).map((l) => L0.answer(l.id))));
  });
  if (rolls.size < 4) err("locks: different saves rolled the same answers");
  S.save.lockSeed = seedWas;
  W.LOCATIONS.filter((l) => l.id !== "base" && !l.outdoor).forEach((loc) => {
    const ctx = `lock ${loc.id}`;
    const L = W.LOCKS[loc.id];
    if (!L) return err(`${ctx}: no lock in WORLD.LOCKS`);
    const a = L0.answer(loc.id);
    // decoys are clearly different
    if (a.code && [...a.decoyCode.replace(/\D/g, "")].some((c, i) => c === a.code.replace(/\D/g, "")[i])) err(`${ctx}: decoy code ${a.decoyCode} shares a digit in place with ${a.code}`);
    if (a.moves && a.decoyMoves.some((m, i) => m === a.moves[i])) err(`${ctx}: decoy moves ${a.decoyMoves} share a step with ${a.moves}`);
    if (a.pick && a.pick === a.decoyPick) err(`${ctx}: decoy pick is the real one`);
    if (a.button && a.button === a.decoyButton) err(`${ctx}: decoy button is the real one`);
    // the main note and the decoy carry this save's answers, filled in
    const main = W.NOTES[loc.id].notes.find((n) => n.unlocks === loc.id);
    const mainText = ZSR.noteText(loc.id, main.id).text;
    if (/\{\w+\}/.test(mainText)) err(`${ctx}: the main note shows a raw placeholder`);
    const must = [a.code, a.pick, a.button].concat(a.moves || []).filter(Boolean);
    must.forEach((v) => { if (!mainText.includes(v)) err(`${ctx}: the main note does not say "${v}"`); });
    const decoy = W.NOTES[loc.id].notes.find((n) => n.kind === "decoy" && (n.minLevel || 1) === 1);
    if (!decoy) err(`${ctx}: no decoy note at every reading level`);
    else if (![a.decoyCode, a.decoyPick, a.decoyButton].concat(a.decoyMoves || []).filter(Boolean).some((v) => ZSR.noteText(loc.id, decoy.id).text.includes(v))) err(`${ctx}: the decoy note gives no wrong answer`);

    /** A fresh visit: a new trip, entered, with everything here in its first state. */
    const visit = () => {
      S.abandonTrip();
      S.startTrip();
      I.enter(loc);
      I.stop();
      I.running = true; // the interactions run as in play; nothing draws
      deaths = 0;
      return I.reachable(Math.floor(I.startPos[0]), Math.floor(I.startPos[1]), true);
    };
    const cache = () => I.buildingInteract({ kind: "cache", obj: I.cacheDoor });
    const search = () => I.buildingInteract({ kind: "fixture", obj: I.lockFix });
    const panel = () => I.buildingInteract({ kind: "panel", obj: I.lockPanel });
    const steps = (L.panel ? ["panel"] : []).concat(L.search ? ["search"] : []).concat(L.door.kind !== "found" ? ["door"] : []);
    const doStep = (st, value) => {
      reply = { value };
      if (st === "panel") panel();
      else if (st === "search") search();
      else cache();
    };

    // the fixtures are where E reaches them
    let reach = visit();
    if (L.search && (!I.lockFix || !standAt(I.lockFix.tx, I.lockFix.ty, "fixture", reach))) err(`${ctx}: the search fixture cannot be reached and used`);
    if (L.panel && (!I.lockPanel || !standAt(I.lockPanel.x, I.lockPanel.y, "panel", reach))) err(`${ctx}: the alarm panel cannot be reached and used`);
    if (L.panel && !(I.lockPanel.face && !I.solidAt(I.lockPanel.x + SIDES[I.lockPanel.face][0] + 0.5, I.lockPanel.y + SIDES[I.lockPanel.face][1] + 0.5))) err(`${ctx}: the alarm panel faces a wall`);

    // the right answers, in order, open it
    reach = visit();
    if (L.door.kind === "found") {
      cache();
      if (I.cacheDoor.open) err(`${ctx}: the cache opened before the search`);
    }
    steps.forEach((st) => doStep(st, answerFor(loc, st)));
    if (L.door.kind === "found") cache();
    if (!I.cacheDoor.open) err(`${ctx}: the right answers did not open ${loc.cacheName}`);
    if (I.alarm || deaths) err(`${ctx}: the right answers set off the alarm or killed`);

    // each wrong answer costs what the note says
    steps.forEach((st) => {
      visit();
      steps.slice(0, steps.indexOf(st)).forEach((s0) => doStep(s0, answerFor(loc, s0)));
      doStep(st, wrongFor(loc, st));
      const fail = st === "panel" ? "alarm" : st === "search" ? L.search.fail : L.door.fail;
      if (I.cacheDoor.open) err(`${ctx}: a wrong ${st} opened ${loc.cacheName}`);
      if (fail === "trap" && deaths !== 1) err(`${ctx}: the wrong ${st} should be a deadly trap`);
      if (fail === "alarm") {
        if (!I.alarm) err(`${ctx}: the wrong ${st} should set off the alarm`);
        const n0 = I.walkers.length;
        // every walker the alarm brings starts where it can get to you (on your side of the doors as they stand when
        // there is room there, never inside a locked room), the cap is never passed, and a kind a note keeps to one
        // walker never comes
        const before = new Set(I.walkers);
        const only = (W.NOTES[loc.id].walkers || []).filter((r) => r.only && r.type).map((r) => r.type);
        for (let i = 0; i < 40; i++) {
          I.buildingUpdate(0.25);
          if (I.walkers.length > W.ALARM.cap) err(`${ctx}: the alarm passed ALARM.cap (${I.walkers.length})`);
          I.walkers.forEach((z) => {
            if (before.has(z)) return;
            before.add(z);
            const why = alarmStartWhyNot(z);
            if (why) err(`${ctx}: an alarm walker starts at ${Math.floor(z.x)},${Math.floor(z.y)}, ${why}`);
            if (only.includes(z.type)) err(`${ctx}: the alarm brought a ${z.type}; the notes keep that kind to one walker`);
          });
        }
        if (I.walkers.length < n0 + 6) err(`${ctx}: the alarm did not bring walkers (${n0} -> ${I.walkers.length})`);
        if (!I.walkers.some((z) => Math.hypot(z.x - I.startPos[0], z.y - I.startPos[1]) < 1.5 && z.awake)) err(`${ctx}: no walkers come through the way out`);
        const exits = [];
        I.hooks.onExit = () => exits.push(1);
        I.buildingInteract({ kind: "exit", obj: I.exit });
        I.hooks.onExit = undefined;
        if (exits.length) err(`${ctx}: you could leave while the alarm rings`);
      }
      if (fail === "jam") {
        if (!S.locState(loc.id).cacheJammed) err(`${ctx}: the wrong ${st} should jam the lock`);
        // no crowbar: still shut; with one: open, and the crowbar is spent
        S.save.crowbars = 0;
        reply = { value: true };
        cache();
        if (I.cacheDoor.open) err(`${ctx}: a jammed lock opened without a crowbar`);
        S.save.crowbars = 1;
        cache();
        if (!I.cacheDoor.open || S.crowbarsLeft() !== 0) err(`${ctx}: a crowbar did not pry the jammed lock (or was not spent)`);
        S.save.crowbars = 0;
      }
    });
    // the panel skipped: the door opens, and the alarm rings
    if (L.panel) {
      visit();
      doStep("door", answerFor(loc, "door"));
      if (!I.alarm) err(`${ctx}: opening the door with the alarm on did not set it off`);
    }
    // god mode, at any step
    visit();
    reply = { god: true };
    if (L.door.kind === "found") search();
    cache();
    if (!I.cacheDoor.open || I.alarm || deaths) err(`${ctx}: god mode did not open ${loc.cacheName} cleanly`);

    // the stash: a wrong key does what the key note warns
    visit();
    const right = S.keySourceFor(loc.id);
    const wrong = Object.keys(W.KEYS).find((k) => k !== right && k !== loc.id);
    S.trip.keys = [wrong, right];
    reply = { value: wrong };
    I.buildingInteract({ kind: "stash", obj: I.stashDoor });
    if (I.stashDoor.open) err(`${ctx}: the stash opened with the wrong key`);
    const sf = L.stashFail;
    if (sf === "break" && !S.keyBroken(wrong)) err(`${ctx}: the wrong key should snap off`);
    if (sf === "jam" && !S.locState(loc.id).stashJammed) err(`${ctx}: the wrong key should jam the stash`);
    if (sf === "none" && (S.keyBroken(wrong) || S.locState(loc.id).stashJammed)) err(`${ctx}: the wrong key should do nothing`);
    const warned = Object.keys(W.KEYS).find((k) => W.KEYS[k] === loc.id);
    const keyNote = W.NOTES[warned].notes.find((n) => n.id === W.NOTES[warned].key.after);
    if (!keyNote.facts.some((f) => f.includes(loc.stashName.replace(/^the /, "")) && /jam|snap|turn/.test(f))) err(`${ctx}: the key note in ${warned} does not warn what a wrong key does here`);
    I.running = false;
    S.abandonTrip();
  });
  // a jam and a broken key outlast the trip once you get home; a crowbar used is gone
  S.startTrip();
  S.tripLoc("grocery").cacheJammed = true;
  S.trip.keys.push("gasngo");
  S.trip.brokenKeys.push("gasngo");
  S.save.crowbars = 2;
  S.useCrowbar();
  S.returnHome();
  if (!S.locState("grocery").cacheJammed || !S.keyBroken("gasngo") || S.save.crowbars !== 1) err("locks: a jam, a broken key or a spent crowbar was not saved at home");
  I.lockPrompt = realPrompt;
  I.hooks.onDeath = undefined;
  if (!prompts) err("locks: no prompt was ever asked");
} catch (e) {
  err(`locks: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
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

/* ---------- The van's paint shop (js/state.js paintShop, buyPaint, wearPaint; the Garage tab, js/base.js) ----------
   A fresh save owns Primer Gray and wears it; a save from the paint ladder (paint k, no paintOwned) owns every look up
   to k and keeps wearing k; a look needs its Garage tier and its scrap, and buying it spends the scrap, owns it and
   wears it; only an owned look can be worn, for free; the worn look comes back from a save and a load; the Garage tab
   draws every look as a swatch, tries one on in the preview, and buys and wears from it. On a slot of its own, so the
   save the tests share is left as it was. */
try {
  const LOOKS = ZSR.Upgrades.PAINT_LOOKS;
  const last = LOOKS.length - 1;
  const GL = W.BASE_ROOMS.garage.levels;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const keep = { slot: S.activeSlot(), save: S.save, settings: S.settings };
  const slot = keep.slot === 4 ? 3 : 4;
  S.newGame(slot, "Paint");
  const u = () => S.save.upgrades;
  if (u().paint !== 0 || !same(u().paintOwned, [0])) err(`paint: a fresh save wears ${u().paint} and owns ${JSON.stringify(u().paintOwned)}; want Primer Gray (0), owning [0]`);
  // old saves: the ladder becomes the looks bought; junk is dropped; a worn look past the last is the last
  const load = (up) => {
    const old = JSON.parse(JSON.stringify(S.save));
    old.upgrades = up;
    sb.localStorage.setItem("zs.save." + slot, JSON.stringify(old));
    return S.loadSave(slot).upgrades;
  };
  let got = load({ armor: 1, engine: 0, bumper: 0, paint: 3, damage: 0, fireRate: 0, spread: 0 });
  if (got.paint !== 3 || !same(got.paintOwned, [0, 1, 2, 3])) err(`paint: an old save at paint 3 loads wearing ${got.paint}, owning ${JSON.stringify(got.paintOwned)}; want 3, [0,1,2,3]`);
  got = load({ armor: 1, paint: last + 4, paintOwned: [2, 2, -1, 99, "3", 1.5, null] });
  if (got.paint !== last || !same(got.paintOwned, [0, 2, last])) err(`paint: a save wearing ${last + 4} with junk owned loads wearing ${got.paint}, owning ${JSON.stringify(got.paintOwned)}; want ${last}, [0,2,${last}]`);
  if (got.spread !== 0 || got.engine !== 0 || got.armor !== 1) err(`paint: an old save's missing upgrades did not start at 0 (${JSON.stringify(got)})`);
  got = load({ armor: 2 });
  if (got.paint !== 0 || !same(got.paintOwned, [0])) err(`paint: a save with no paint loads wearing ${got.paint}, owning ${JSON.stringify(got.paintOwned)}; want 0, [0]`);
  // the gate: with no Garage only tiers up to 2; the owner's two new looks need the top Garage level (2026-10-18)
  Object.keys(W.BASE_ROOMS).forEach((k) => (S.save.rooms[k] = 0));
  S.save.builds = {};
  S.save.scrap = 1000;
  const shop = S.paintShop();
  if (shop.length !== LOOKS.length) err(`paint: the shop has ${shop.length} looks, want ${LOOKS.length}`);
  shop.forEach((p) => {
    if (p.name !== LOOKS[p.i].name || p.cost !== LOOKS[p.i].cost) err(`paint: shop entry ${p.i} is ${p.name} at ${p.cost}, not PAINT_LOOKS' ${LOOKS[p.i].name} at ${LOOKS[p.i].cost}`);
    if (!p.owned && p.capped !== p.tier > S.effects().tierCap) err(`paint: ${p.name} (tier ${p.tier}) capped is ${p.capped} with no Garage`);
  });
  ["Night Violet", "Radioactive"].forEach((n) => {
    const i = LOOKS.findIndex((l) => l.name === n);
    const c = S.canBuyPaint(i);
    if (i < 0 || !c.capped || c.ok || c.garageNeeded !== GL.length) err(`paint: ${n} with no Garage: capped ${c.capped}, ok ${c.ok}, Garage ${c.garageNeeded} needed; want capped until Garage level ${GL.length}`);
  });
  const violet = LOOKS.findIndex((l) => l.name === "Night Violet");
  const toxic = LOOKS.findIndex((l) => l.name === "Radioactive");
  if (S.buyPaint(violet) || S.save.scrap !== 1000 || S.paintOwned().includes(violet)) err("paint: a look was bought past the Garage's tier");
  S.save.rooms.garage = GL.length;
  if (!S.canBuyPaint(violet).ok || !S.buyPaint(violet)) err("paint: Night Violet cannot be bought with the top Garage and scrap enough");
  else if (S.save.scrap !== 1000 - LOOKS[violet].cost || !S.paintOwned().includes(violet) || u().paint !== violet) err(`paint: buying Night Violet left ${S.save.scrap} scrap (want ${1000 - LOOKS[violet].cost}), owning ${JSON.stringify(u().paintOwned)}, wearing ${u().paint}`);
  if (S.canBuyPaint(violet).ok || S.buyPaint(violet)) err("paint: a look already owned can be bought again");
  // a wrecked Garage gives nothing until fixed: its looks wait, and the shop says the Garage is wrecked
  S.save.builds = { garage: 0 };
  const wr = S.canBuyPaint(toxic);
  if (wr.ok || !wr.capped || !wr.garageWrecked || wr.garageNeeded !== GL.length) err(`paint: Radioactive with the Garage wrecked: ok ${wr.ok}, capped ${wr.capped}, garageWrecked ${wr.garageWrecked}, Garage ${wr.garageNeeded} needed`);
  S.save.builds = {};
  // not enough scrap
  S.save.scrap = LOOKS[toxic].cost - 1;
  const poor = S.canBuyPaint(toxic);
  if (poor.ok || poor.short !== 1 || S.buyPaint(toxic) || S.save.scrap !== LOOKS[toxic].cost - 1) err(`paint: Radioactive with 1 scrap short: ok ${poor.ok}, short ${poor.short}, scrap now ${S.save.scrap}`);
  // wearing: only an owned look, and free
  if (S.wearPaint(toxic) || u().paint !== violet) err("paint: a look not owned was worn");
  if (S.wearPaint(last + 1) || S.wearPaint(-1) || S.wearPaint("1") || u().paint !== violet) err("paint: an index that is not a look was worn");
  const scrap = S.save.scrap;
  if (!S.wearPaint(0) || u().paint !== 0 || S.save.scrap !== scrap) err(`paint: wearing Primer Gray (owned) failed or cost scrap (wearing ${u().paint}, scrap ${S.save.scrap} from ${scrap})`);
  if (!S.wearPaint(violet) || ZSR.Upgrades.stats(u()).look.name !== "Night Violet") err("paint: wearing Night Violet again does not give the van its look");
  // the worn look and the looks owned come back from the disk
  const owned = JSON.stringify(u().paintOwned);
  got = S.loadSave(slot).upgrades;
  if (got.paint !== violet || JSON.stringify(got.paintOwned) !== owned) err(`paint: after a save and a load the van wears ${got.paint}, owning ${JSON.stringify(got.paintOwned)}; want ${violet}, ${owned}`);
  // any code that reads every upgrade alike: paint's next tier is the first look not owned; maxed once all are owned
  S.save.scrap = 1000;
  const g = S.canBuyUpgrade("paint");
  if (!g.ok || g.look !== 1 || g.cost !== LOOKS[1].cost || ZSR.Upgrades.cost("paint", g.level) !== g.cost) err(`paint: canBuyUpgrade("paint") gave ${JSON.stringify(g)}; want look 1 at ${LOOKS[1].cost}`);
  if (!S.buyUpgrade("paint") || u().paint !== 1 || !S.paintOwned().includes(1)) err("paint: buyUpgrade(\"paint\") did not buy and wear the next look");
  while (S.canBuyUpgrade("paint").ok) S.buyUpgrade("paint");
  const all = S.canBuyUpgrade("paint");
  if (!all.maxed || all.ok || S.paintOwned().length !== LOOKS.length || S.buyUpgrade("paint")) err(`paint: with every look owned canBuyUpgrade("paint") gave ${JSON.stringify(all)}, owning ${S.paintOwned().length} of ${LOOKS.length}`);
  // the Garage tab: every look a swatch, tried on in the preview, bought and worn from it
  S.save.upgrades.paint = 0;
  S.save.upgrades.paintOwned = [0, violet];
  S.save.scrap = 1000;
  S.commit();
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js", "base.js"), "utf8"), sb, { filename: "js/base.js" });
  const B = ZSR.Base;
  const made = [];
  const shows = [];
  const was = { create: sb.document.createElement, game: ZSR.Game, raf: sb.requestAnimationFrame };
  sb.document.createElement = (t) => {
    const e = was.create(t);
    e.kids = [];
    e.on = {};
    e.appendChild = (c) => (e.kids.push(c), c);
    e.addEventListener = (type, fn) => (e.on[type] = fn);
    made.push(e);
    return e;
  };
  ZSR.Game = { showcase: (canvas, up) => shows.push(up.paint) };
  sb.requestAnimationFrame = (f) => (f(), 1);
  try {
    B.hooks = {};
    B.tab = "garage";
    const swatches = () => made.filter((e) => /\bpaint-swatch\b/.test(e.className || ""));
    const text = (e) => [e.innerHTML || ""].concat((e.kids || []).map(text)).join(" ");
    B.garage();
    let sw = swatches();
    if (sw.length !== LOOKS.length) err(`paint: the Garage tab draws ${sw.length} paint swatches, want ${LOOKS.length}`);
    sw.forEach((e, i) => { if (!text(e).includes(LOOKS[i].name)) err(`paint: swatch ${i} does not name ${LOOKS[i].name}`); });
    const word = (i) => text(sw[i]);
    if (!/\bWorn\b/.test(word(0)) || !/\bWear\b/.test(word(violet)) || !word(1).includes("Buy " + LOOKS[1].cost + " scrap")) err(`paint: the swatches say ${word(0)} | ${word(violet)} | ${word(1)}; want Worn, Wear, Buy ${LOOKS[1].cost} scrap`);
    shows.length = 0;
    sw[toxic].on.mouseenter();
    sw[toxic].on.mouseleave();
    sw[3].on.focus();
    if (!same(shows, [toxic, 0, 3])) err(`paint: trying looks on drew the preview in ${JSON.stringify(shows)}; want ${JSON.stringify([toxic, 0, 3])}`);
    sw[violet].on.click(); // owned: worn at once, free
    if (u().paint !== violet || S.save.scrap !== 1000) err(`paint: clicking an owned swatch wears ${u().paint} with ${S.save.scrap} scrap; want ${violet}, 1000`);
    made.length = 0;
    B.garage();
    sw = swatches();
    sw[2].on.click(); // bought (no workbench loaded here: the menu builds straight away) and worn
    if (u().paint !== 2 || !S.paintOwned().includes(2) || S.save.scrap !== 1000 - LOOKS[2].cost) err(`paint: clicking a swatch to buy ${LOOKS[2].name} left it wearing ${u().paint}, owning ${JSON.stringify(u().paintOwned)}, ${S.save.scrap} scrap`);
    S.save.rooms.garage = 0; // the top tiers wait for the Garage again: their swatches can be tried on, not bought
    const locked = S.paintShop().find((p) => !p.owned && !p.ok);
    if (!locked) err("paint: with no Garage every look can be bought (no locked swatch to check)");
    else {
      const before = JSON.stringify(u());
      made.length = 0;
      B.garage();
      swatches()[locked.i].on.click();
      if (JSON.stringify(u()) !== before) err(`paint: clicking ${locked.name}, which cannot be bought now, changed the van's paint`);
    }
  } finally {
    sb.document.createElement = was.create;
    if (was.game) ZSR.Game = was.game;
    else delete ZSR.Game; // the engine's tests run without the road (js/tutorial.js asks for ZSR.Game)
    sb.requestAnimationFrame = was.raf;
  }
  S.deleteSlot(slot);
  S.setActiveSlot(keep.slot);
  S.save = keep.save;
  S.settings = keep.settings;
  S.trip = null;
} catch (e) {
  err(`paint: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
}

/* ---------- Each save keeps its own settings ---------- */
try {
  const a = S.activeSlot();
  S.settings.level = 2;
  S.settings.textSize = "huge";
  S.settings.tutorial = ["walk"];
  S.saveSettings();
  S.newGame(a === 2 ? 3 : 2, "Second");
  const b = S.activeSlot();
  if (S.settings.seenHowto) err("settings: a new save skips its player's how-to");
  if (S.settings.tutorial != null) err("settings: a new save inherits the last player's tutorial");
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

/* ---------- A pickup's tag stays up long enough to read, and E closes it ---------- */
try {
  const level = S.settings.level;
  S.settings.level = 1;
  const shop = W.LOCATIONS.find((l) => l.id !== "base" && ZSR.LAYOUTS[l.id]);
  S.startTrip();
  I.enter(shop);
  I.walkers = [];
  const it = I.items.find((x) => ZSR.tagText(x.item, Number(x.spot.slice(1)) % 2));
  if (!it) throw new Error(`no item with a tag in ${shop.id}`);
  const text = ZSR.tagText(it.item, Number(it.spot.slice(1)) % 2);
  Object.assign(I.player, { x: it.x, y: it.y });
  I.updatePickups();
  I.updatePanel();
  const left = I.tagPanel ? I.tagPanel.until - I.time : 0;
  if (left < ZSR.wordCount(text)) err(`pickup: a ${ZSR.wordCount(text)}-word tag stays up ${left.toFixed(1)}s at level 1; want at least a second a word`);
  if (!I.pickupShown()) err("pickup: the tag and its message do not count as shown");
  I.interact();
  if (I.tagPanel || I.toastPickup || I.pickupShown()) err("pickup: E did not close the tag and its message");
  I.toast("Not a pickup.", 3);
  if (I.pickupShown()) err("pickup: E would close a message that is not a pickup");
  I.stop();
  S.abandonTrip();
  S.settings.level = level;
} catch (e) {
  err(`pickup: ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
}

/* ---------- River Landing: the pole in Station 12's bay, its tag, the bank, fishing, the cap, home ---------- */
try {
  const R = W.RIVER;
  const river = W.LOCATIONS.find((l) => l.id === "river");
  const step = (n, dt) => {
    for (let i = 0; i < n; i++) I.update(dt || 1 / 30);
  };
  const click = () => {
    I.mouseDown = false;
    step(1);
    I.mouseDown = true;
    step(1);
    I.mouseDown = false;
    step(1);
  };
  S.newGame(1, "Fisher");
  // without a pole: the bank, but no fishing
  S.startTrip();
  I.enterRiver(river);
  if (!I.van) err("river: no van on the turnout");
  if (I.solidForPlayer(I.player.x, I.player.y)) err("river: you get out of the van inside something solid");
  if (I.riverSpots.length !== 2) err(`river: ${I.riverSpots.length} things to read (the sign and the note)`);
  const water = I.water.reduce((a, b) => a + b, 0);
  if (water < 100) err(`river: only ${water} tiles of water`);
  for (let y = 0; y < I.gh; y++) for (let x = 0; x < I.gw; x++) if (I.water[y * I.gw + x] && !I.solidForPlayer(x + 0.5, y + 0.5)) err(`river: you can walk on the water at ${x},${y}`);
  if (I.spawns.length < 4) err("river: walkers need 4+ places to come out of the trees");
  if (I.selectRod()) err("river: the pole was picked up before it was found");
  renderAround("river (no pole)");
  ["sign", "note"].forEach((k) => {
    const sp = I.riverSpots.find((x) => x.name === k);
    const panel = I.riverSpotPanel(sp);
    if (!panel.text || panel.text.length < 20) err(`river: the ${k} has no words`);
  });
  I.stop();
  S.abandonTrip();
  // the pole: behind the equipment bay's locked door at Station 12; picking it up reads its tag and reveals the river
  S.startTrip();
  const fh = W.LOCATIONS.find((l) => l.id === R.rod.at);
  I.enter(fh);
  I.walkers = [];
  const rp = I.rodPickup;
  if (!rp) err("river: no fishing pole in " + fh.id);
  else {
    const reach = I.reachable(Math.floor(I.startPos[0]), Math.floor(I.startPos[1]), true);
    if (reach.has(Math.floor(rp.x) + "," + Math.floor(rp.y))) err("river: the pole can be reached without opening the equipment bay");
    if (S.isKnown("river")) err("river: River Landing is on the map before the pole's tag is read");
    Object.assign(I.player, { x: rp.x, y: rp.y });
    I.updatePickups();
    if (!S.hasRod()) err("river: walking over the pole did not pick it up");
    if (!S.isKnown("river")) err("river: the pole's tag did not put River Landing on the map");
    if (!I.tagPanel || I.tagPanel.text !== ZSR.riverText("rod").tag) err("river: the pole's tag is not shown");
    renderAround("station with the pole held");
    if (!I.selectRod() || I.tool !== "rod") err("river: 6 did not put the pole in your hands");
    step(15);
    click();
    if (I.tool !== "rod") err("river: a click with the pole in a building put it down");
    renderAround("the pole in a building");
  }
  I.stop();
  // the bank, with the pole: cast from the end of the dock, a bite, a catch
  I.enterRiver(river);
  I.walkers = [];
  I.riverSpawnT = 1e9;
  Object.assign(I.player, { x: 5.5, y: 17.5, a: Math.PI }); // the end of the dock, facing the water (west)
  I.selectRod();
  step(15);
  click();
  const f = I.fishing;
  if (f.state !== "wait" || !f.bobber) err(`river: a click at the end of the dock did not cast (${f.state})`);
  else if (!I.isWater(f.bobber.x, f.bobber.y)) err("river: the bobber landed on land");
  renderAround("river, line out");
  I.player.a = 0; // look back at the trees: the line stays out
  I.render();
  if (!f.bobber) err("river: looking around pulled the line in");
  I.player.a = Math.PI;
  f.t = 0.01;
  step(2);
  if (f.state !== "bite") err(`river: no bite when the wait ran out (${f.state})`);
  click();
  if (S.trip.fish !== 1 || S.trip.cargo.food !== 1) err(`river: hooking a bite did not land a fish as food (fish ${S.trip.fish}, food ${S.trip.cargo.food})`);
  // a bite missed: it gets away and the line stays in
  click();
  f.t = 0.01;
  step(2);
  step(Math.ceil((R.hook + 0.2) * 30));
  if (f.state !== "wait" || !f.bobber) err(`river: a missed bite should leave the line in (${f.state})`);
  // a gun with the line out: the pole is propped on the bank, the bell rings, the fish stays on
  I.switchWeapon("pistol");
  if (I.tool || !f.propped || !f.bobber) err("river: taking a gun with the line out did not prop the pole on the bank");
  renderAround("river, pole propped");
  f.t = 0.01;
  step(2);
  step(R.hook * 30 * 3);
  if (f.state !== "bite") err(`river: a propped pole lost its fish (${f.state})`);
  if (I.selectRod()) err("river: 6 took the pole back from across the bank");
  const near = I.facing();
  if (!near || near.kind !== "rod") err("river: the propped pole cannot be picked up with E");
  else I.interact();
  if (I.tool !== "rod" || f.propped) err("river: E at the propped pole did not take it back");
  step(10); // the pole comes up (the hook window is longer than that)
  click();
  if (S.trip.fish !== 2) err(`river: the fish on the propped pole was lost when taken back (${S.trip.fish})`);
  // the cap: no more casting once the trip has its fish
  S.trip.fish = R.cap;
  click();
  if (f.state !== "idle") err("river: a cast went out with the river fished out");
  // walkers come out of the trees, onto land
  I.riverSpawnT = 0;
  step(1);
  if (!I.walkers.length) err("river: no walker came out of the trees");
  I.walkers.forEach((z) => I.solidAt(z.x, z.y) && err("river: a walker came out inside something solid"));
  I.walkers = [];
  // home: fish are food, the pole is kept, the river rests
  I.leave();
  const food0 = S.save.food;
  const cargoFood = S.trip.cargo.food;
  S.returnHome();
  if (S.save.food !== Math.max(0, food0 - W.SETTINGS.foodPerTrip) + cargoFood) err(`river: fish brought home did not become food (${food0} -> ${S.save.food}, ${cargoFood} fish)`);
  if (!S.save.rod) err("river: the pole was not kept at home");
  S.startTrip();
  if (S.fishLeft() !== 0 || S.riverRestDays() <= 0) err("river: a fished-out river has fish the next day");
  S.save.day += R.restockDays;
  if (S.fishLeft() !== R.cap) err("river: the river did not come back after resting");
  S.abandonTrip();
  // a food crate from a shelf feeds the crew too (it used to sit in storage)
  S.startTrip();
  S.trip.cargo.food = 2;
  const f0 = S.save.food;
  S.returnHome();
  if (S.save.food !== Math.max(0, f0 - W.SETTINGS.foodPerTrip) + 2 || S.save.inventory.food) err("food: crates brought home did not feed the crew");
} catch (e) {
  err(`river: ${e.stack.split("\n").slice(0, 4).join(" | ")}`);
}

/* ---------- Walker kinds on foot (WORLD.WALKER_TYPES) ----------
   Every walker carries its kind's facts; god mode's spawn puts each kind in front of you in a building, the yard and
   the river; the screamer's frenzy (awake walkers near it speed up for SCREAM.secs, sleepers sleep on, the practice
   walker never, once per cooldown); a downed walker leaves the walkers at once and falls for FALL_SECS (a wave still
   ends), with blood only under SETTINGS.walkerGore; which way a walker faces (where it goes, you while it bites, the
   fence while it claws); its gait by distance walked; the river's kinds; the alarm's kinds and cap; kinds met
   (save.met); and a return visit keeps each walker's look. Math.random is seeded here. */
let kindsChecked = 0;
try {
  const WT = W.WALKER_TYPES;
  const kinds = Object.keys(WT);
  const SC = W.SCREAM;
  const W3 = ZSR.Walker3D;
  const fallSecs = (W3 && W3.FALL_SECS) || I.FALL_SECS;
  const ctxMath = vm.runInContext("Math", sb);
  const realRandom = ctxMath.random;
  ctxMath.random = ((s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)(9090);
  const screamWas = I.screamWalker;
  let screams = 0;
  I.screamWalker = function (z) {
    screams++;
    return screamWas.call(this, z);
  };
  const turnErr = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
  try {
    S.newGame(1, "Kinds");
    // the facts in every walker; an unknown kind is a plain walker
    kinds.forEach((id) => {
      const T = WT[id];
      const z = I.makeWalker(id, 5.5, 5.5, 2);
      const c = `walker kinds: ${id}`;
      kindsChecked++;
      if (z.type !== id || z.hp !== Math.round(T.hp * 2) || z.maxHp !== z.hp) err(`${c}: health ${z.hp}/${z.maxHp}, want ${Math.round(T.hp * 2)}`);
      if (z.dmg !== T.bite || z.reach !== T.reach || z.dps !== T.fenceDps || z.scrap !== T.scrap || z.knock !== T.knock || z.scream !== !!T.scream || z.r !== T.r) err(`${c}: its stats are not WORLD.WALKER_TYPES.${id}'s`);
      if (!(z.speed >= T.speed * (1 - I.SPEED_JITTER) - 1e-9 && z.speed <= T.speed * (1 + I.SPEED_JITTER) + 1e-9)) err(`${c}: speed ${z.speed} is not ${T.speed} +- ${I.SPEED_JITTER * 100}%`);
      if (!(Math.abs(z.heading) <= Math.PI + 1e-9) || !(z.gait >= 0 && z.gait < 1) || !Number.isInteger(z.seed) || z.act !== "sleep" || z.frenzyT !== 0 || z.screamT !== 0 || z.yell !== 0 || z.biteT !== 0) err(`${c}: a new walker's look and timers are off`);
    });
    const odd = I.makeWalker("no-such-kind", 5.5, 5.5, 1);
    if (odd.type !== "walker" || odd.hp !== WT.walker.hp) err(`walker kinds: an unknown kind is not a plain walker (${odd.type}, ${odd.hp})`);
    if (I.WALKER_TYPES !== WT) err("walker kinds: Interior.WALKER_TYPES is not WORLD.WALKER_TYPES");

    // god mode's spawn: every kind in front of you, in sight, on your side of the walls, awake, met, drawn
    const spawnAll = (ctx) => {
      const p = I.player;
      const a0 = p.a;
      kinds.forEach((id) => {
        I.walkers.length = 0;
        S.save.met = {};
        let z = null;
        for (let k = 0; k < 8 && !z; k++) {
          p.a = a0 + (k * Math.PI) / 4;
          z = I.spawnWalkerAhead(id);
        }
        if (!z) return err(`${ctx}: no room for a ${id} in front of you, whichever way you face`);
        const d = Math.hypot(z.x - p.x, z.y - p.y);
        if (z.type !== id || !z.awake || !I.walkers.includes(z)) err(`${ctx}: spawnWalkerAhead("${id}") gave a ${z.type} (awake ${z.awake})`);
        if (Math.abs(I.sideOf(z.x, z.y)) >= 0.6) err(`${ctx}: the ${id} is not in front of you`);
        if (d < 1.5 || d > 4.5) err(`${ctx}: the ${id} is ${d.toFixed(2)} tiles away`);
        if (I.solidForPlayer(z.x, z.y) || I.solidAt(z.x, z.y)) err(`${ctx}: the ${id} stands in something solid`);
        if (!I.lineClear(p.x, p.y, z.x, z.y)) err(`${ctx}: the ${id} is out of sight`);
        if (S.save.met[id] !== S.save.day) err(`${ctx}: a ${id} in front of you was not met (save.met ${JSON.stringify(S.save.met)})`);
        renderAround(`${ctx}, a ${id} in front of you`);
        p.hp = p.maxHp = 1e9;
        for (let i = 0; i < 10; i++) I.update(0.05);
        renderAround(`${ctx}, a ${id} coming at you`);
        p.a = a0;
      });
      I.walkers.length = 0;
      I.player.a = a0;
    };
    const building = W.LOCATIONS.find((l) => l.id !== "base" && !l.outdoor && I.layoutFor(l));
    S.startTrip();
    I.enter(building);
    I.stop();
    spawnAll("walker kinds in " + building.id);
    S.abandonTrip();
    I.enterYard({ firstCalm: 999 });
    I.stop();
    spawnAll("walker kinds in the yard");
    const river = W.LOCATIONS.find((l) => l.id === "river");
    if (river) {
      S.startTrip();
      I.enterRiver(river);
      I.stop();
      I.walkers.length = 0;
      spawnAll("walker kinds at the river");
      // what comes out of the trees: only RIVER.walkerMix kinds, only walkers on day 1, more than one kind later on
      for (const day of [1, 30]) {
        S.save.day = day;
        const seen = new Set();
        for (let i = 0; i < 60; i++) {
          I.walkers.length = 0;
          I.riverSpawnT = 0;
          I.update(1 / 30);
          I.walkers.forEach((z) => seen.add(z.type));
        }
        [...seen].forEach((t) => !W.RIVER.walkerMix[t] && err(`river: a ${t} came out of the trees; it is not in RIVER.walkerMix`));
        if (day === 1 && [...seen].some((t) => W.RIVER.walkerMix[t] && W.RIVER.walkerMix[t][1] > 1)) err(`river: on day 1 out came ${[...seen].join(", ")}`);
        if (day > 1 && seen.size < 2) err(`river: on day ${day} only ${[...seen].join(", ")} came out of the trees`);
      }
      I.walkers.length = 0;
      S.save.day = 1;
      S.abandonTrip();
    }

    // the yard, the dirt path north of the cabin door: you at the south end facing north
    I.enterYard({ firstCalm: 999 });
    I.stop();
    const p = I.player;
    p.maxHp = p.hp = 1e9;
    Object.assign(p, { x: 27.5, y: 30.5, a: -Math.PI / 2 });
    const at = (id, x, y, awake) => {
      if (I.solidAt(x, y)) err(`walker kinds: test spot ${x},${y} in the yard is solid`);
      const z = I.makeWalker(id, x, y, 1);
      z.awake = awake;
      I.walkers.push(z);
      return z;
    };
    const run = (secs, each) => {
      for (let t = 0; t < secs - 1e-9; t += 0.05) {
        I.update(0.05);
        if (each) each(t + 0.05);
      }
    };
    const screamer = kinds.find((id) => WT[id].scream);
    if (!screamer) err("walker kinds: no kind screams (WALKER_TYPES[].scream)");
    else {
      // the scream: an awake screamer 3 tiles off in sight screams; awake walkers near it speed up, a sleeper does not
      // wake, one farther than SCREAM.radius is untouched, the practice walker never
      I.walkers.length = 0;
      const sc = at(screamer, 27.5, 27.5, true);
      const near = at("walker", 26.5, 26.5, true);
      const sleeper = at("walker", 27.5, 22.5, false);
      const far = at("walker", 27.5, 27.5 - SC.radius - 3, true);
      const practice = at("walker", 28.5, 26.5, true);
      practice.practice = true;
      screams = 0;
      run(0.05);
      if (screams !== 1) err(`scream: an awake screamer in sight 3 tiles off screamed ${screams} times`);
      if (!(sc.yell > 0) || !(sc.screamT > SC.cooldown - 0.1) || sc.act !== "scream") err(`scream: the screamer is not yelling (yell ${sc.yell}, cooldown ${sc.screamT}, ${sc.act})`);
      [sc, near].forEach((z) => !(z.frenzyT >= SC.secs - 0.05 - 1e-9) && err(`scream: an awake walker ${Math.hypot(z.x - sc.x, z.y - sc.y).toFixed(1)} tiles from it did not speed up (${z.frenzyT})`));
      if (sleeper.awake || sleeper.frenzyT) err("scream: a sleeping walker near it woke up or sped up");
      if (far.frenzyT) err("scream: a walker farther than SCREAM.radius sped up");
      if (practice.frenzyT) err("scream: the tutorial's practice walker sped up");
      run(SC.secs - 0.3);
      if (!(near.frenzyT > 0)) err(`scream: the speed-up wore off before SCREAM.secs`);
      run(0.4);
      if (near.frenzyT) err(`scream: the speed-up lasted past SCREAM.secs`);
      // again only after the cooldown
      I.walkers = [sc];
      run(SC.cooldown - SC.secs - 0.4);
      if (screams !== 1) err(`scream: it screamed again before its cooldown (${screams})`);
      run(0.6);
      if (screams !== 2) err(`scream: it did not scream again after its cooldown (${screams} screams; ${Math.hypot(sc.x - p.x, sc.y - p.y).toFixed(1)} tiles off)`);
      // frenzied: SCREAM.mult times faster for a step; the practice walker never
      I.walkers.length = 0;
      const w = at("walker", 27.5, 26.5, true);
      const step = (frenzyT, isPractice) => {
        Object.assign(w, { x: 27.5, y: 26.5, frenzyT, practice: isPractice, path: [], pathT: 0, cool: 0, yell: 0 });
        I.update(0.05);
        return Math.hypot(w.x - 27.5, w.y - 26.5);
      };
      const v0 = step(0, false);
      const v1 = step(SC.secs, false);
      const vp = step(SC.secs, true);
      if (!(v0 > 0) || Math.abs(v1 / v0 - SC.mult) > 0.02) err(`scream: a frenzied walker steps ${(v1 / v0).toFixed(3)} times as far, want ${SC.mult}`);
      if (Math.abs(vp / v0 - 1) > 0.02) err("scream: the practice walker sped up in a frenzy");
      // one killed outright by the hit that wakes it (the silent bow on a sleeper past earshot, inside SCREAM.spot)
      // never screams: dead on that frame, it does nothing more (the shot and the traps land before the walkers move)
      I.walkers.length = 0;
      const dead = at(screamer, 27.5, 30.5 - (I.HEAR + SC.spot) / 2, false);
      const by = at("walker", 26.5, 24.5, true);
      const updWas = I.yardUpdate;
      let shot = false;
      I.yardUpdate = function (dt) {
        updWas.call(this, dt);
        if (!shot) {
          shot = true;
          this.hurtWalker(dead, 1e6, this.player);
        }
      };
      screams = 0;
      try {
        run(0.05);
      } finally {
        I.yardUpdate = updWas;
      }
      if (!shot || dead.hp > 0 || I.walkers.includes(dead)) err("scream: setup, the sleeping screamer was not killed in the frame");
      if (screams || by.frenzyT) err(`scream: a screamer killed by the hit that woke it screamed anyway (${screams} screams, a walker near it sped up for ${by.frenzyT.toFixed(2)} s)`);
      I.walkers.length = 0;
      I.fallen.length = 0;
    }

    // a walker that dies falls out of the walkers at once (not solid, not a target, not counted), away from the shot
    I.walkers.length = 0;
    I.fallen.length = 0;
    I.blood.length = 0;
    const f = at("brute", 27.5, 26.5, true);
    I.phase = { kind: "wave", size: "some", total: 1, spawned: 1, spawnT: 99, t: 0, sides: ["n"] };
    S.save.met = {};
    I.hurtWalker(f, 1e6, p);
    if (S.save.met.brute !== S.save.day) err("walker kinds: shooting a brute did not meet it (save.met)");
    if (W.SETTINGS.walkerGore && !I.blood.length) err("blood: a kill sprayed no blood with SETTINGS.walkerGore on");
    I.update(0.05);
    if (I.walkers.includes(f) || !I.fallen.includes(f)) err("fallen: a dead walker is still among the walkers, or not falling");
    if (!(f.fallT > 0)) err("fallen: a downed walker's fall did not start");
    if (turnErr(f.fallDir, Math.atan2(f.y - p.y, f.x - p.x)) > 1e-6) err("fallen: a walker shot from the south did not fall away from the shot");
    if (I.walkerOnTile(Math.floor(f.x), Math.floor(f.y))) err("fallen: a downed walker still stands on its tile");
    p.a = Math.atan2(f.y - p.y, f.x - p.x);
    if (I.walkerAt(0)) err("fallen: a downed walker can still be shot");
    I.update(0.05); // (the yard checks the wave's end before the dead leave the walkers: one frame later)
    if (I.phase.kind !== "calm" || !I.fallen.includes(f)) err(`fallen: the wave did not end with its last walker down and still falling (${I.phase.kind})`);
    run(fallSecs);
    if (I.fallen.length) err(`fallen: a downed walker is still there after ${fallSecs} s`);
    run(5);
    if (I.blood.length) err(`blood: ${I.blood.length} drops still there 5 s later`);
    for (let i = 0; i < 40; i++) I.hurtWalker(at(kinds[i % kinds.length], 27.5, 26.5, true), 1e6, p);
    if (I.blood.length > I.BLOOD_MAX) err(`blood: ${I.blood.length} drops, past BLOOD_MAX ${I.BLOOD_MAX}`);
    I.update(0.05);
    if (I.walkers.length || I.fallen.length > I.FALLEN_MAX) err(`fallen: 40 kills at once left ${I.walkers.length} walkers and ${I.fallen.length} falling (FALLEN_MAX ${I.FALLEN_MAX})`);
    W.SETTINGS.walkerGore = false;
    I.blood.length = 0;
    I.hurtWalker(at("walker", 27.5, 26.5, true), 10, p);
    if (I.blood.length) err("blood: a hit sprayed blood with SETTINGS.walkerGore off");
    W.SETTINGS.walkerGore = true;
    I.walkers.length = 0;
    I.fallen.length = 0;
    I.blood.length = 0;
    I.phase = I.calmPhase(999);

    // which way it faces: where it walks; you, while it bites; and its gait goes by the distance it walked
    p.a = -Math.PI / 2;
    kinds.forEach((id) => {
      I.walkers.length = 0;
      const z = at(id, 27.5, 18.5, true);
      z.heading = -Math.PI / 2; // facing away from you
      z.pathT = 0;
      let gait = 0;
      let walked = 0;
      let x0 = z.x;
      let y0 = z.y;
      let g0 = z.gait;
      let dir = 0;
      run(1.2, () => {
        walked += Math.hypot(z.x - x0, z.y - y0);
        dir = Math.atan2(z.y - y0, z.x - x0);
        gait += (((z.gait - g0) % 1) + 1) % 1;
        x0 = z.x;
        y0 = z.y;
        g0 = z.gait;
      });
      if (walked < 1) err(`heading: a ${id} walked only ${walked.toFixed(2)} tiles in 1.2 s`);
      if (turnErr(z.heading, dir) > 0.2) err(`heading: a ${id} walking at you faces ${z.heading.toFixed(2)}, travels ${dir.toFixed(2)}`);
      if (Math.abs(gait - walked / I.walkerStride(id)) > 1e-6) err(`gait: a ${id} took ${gait.toFixed(3)} strides over ${walked.toFixed(2)} tiles (stride ${I.walkerStride(id)})`);
      // up close: it faces you while it bites, even turned away (each kind turns at its look's turnRate: a brute
      // takes longer to come round than a runner)
      Object.assign(z, { x: 27.5, y: 30.5 - z.reach * 0.7, heading: -Math.PI / 2, cool: 0, screamT: SC.cooldown }); // (a screamer would scream first)
      const look = W3 && W3.TYPES && (W3.TYPES[id] || W3.TYPES.walker);
      const turnRate = (look && look.gait && look.gait.turnRate) || I.TURN_RATE;
      run(Math.max(0.5, Math.PI / turnRate + 0.1));
      if (z.act !== "bite" || turnErr(z.heading, Math.atan2(p.y - z.y, p.x - z.x)) > 0.2) err(`heading: a biting ${id} does not face you (${z.act}, ${z.heading.toFixed(2)})`);
    });
    // clawing: it faces the fence segment it claws (outside the north fence, the yard whole)
    I.walkers.length = 0;
    const fy = Math.min(...Object.keys(I.fence).map((k) => +k.split(",")[1]));
    const claw = at("walker", 27.5, fy - 0.7, true);
    claw.heading = -Math.PI / 2;
    run(3);
    if (claw.act !== "claw" || !claw.fenceTarget) err(`heading: a walker outside the fence is not clawing it (${claw.act})`);
    else if (turnErr(claw.heading, Math.atan2(claw.fenceTarget[1] - claw.y, claw.fenceTarget[0] - claw.x)) > 0.2) err(`heading: a clawing walker does not face the fence (${claw.heading.toFixed(2)})`);
    I.walkers.length = 0;

    // the alarm: the most dangerous building, day 30, 300 s of it: never past ALARM.cap, only its mix, more than one kind
    S.save.day = 30;
    const loud = W.LOCATIONS.filter((l) => l.id !== "base" && !l.outdoor && I.layoutFor(l)).sort((a, b) => b.danger - a.danger)[0];
    S.startTrip();
    I.enter(loud);
    I.stop();
    const first = new Set(I.walkers);
    I.startAlarm();
    const mix = I.alarm.mix || {};
    const came = new Set();
    let most = 0;
    for (let t = 0; t < 300; t += 0.25) {
      I.buildingUpdate(0.25);
      most = Math.max(most, I.walkers.length);
      I.walkers.forEach((z) => !first.has(z) && came.add(z.type));
    }
    if (most > W.ALARM.cap) err(`alarm: ${most} walkers in ${loud.id}, past ALARM.cap ${W.ALARM.cap}`);
    if (I.walkers.length !== W.ALARM.cap) err(`alarm: ${I.walkers.length} walkers after 300 s in ${loud.id}; it should fill to ALARM.cap ${W.ALARM.cap}`);
    [...came].forEach((t) => !mix[t] && err(`alarm: a ${t} came in ${loud.id}; not in its alarm mix`));
    if (came.size < 2) err(`alarm: only ${[...came].join(", ")} came in ${loud.id} on day 30`);
    // a return visit: each walker's look, heading and scream come back
    I.walkers[0].screamed = true;
    const was = I.walkers.map((z) => [z.type, z.seed, z.heading]);
    const snap = I.snapshot();
    I.walkers = [];
    I.restore(snap);
    if (JSON.stringify(I.walkers.map((z) => [z.type, z.seed, z.heading])) !== JSON.stringify(was)) err("building: a return visit changed its walkers' kinds, looks or headings");
    if (!I.walkers[0].screamed || I.walkers[0].screamT !== SC.cooldown) err("building: a walker that screamed would scream again at once on a return visit");
    I.alarm = null;
    I.walkers.length = 0;
    S.abandonTrip();
    // kinds met (save.met): an old save without it loads with none met; one met on a trip is kept at home, and lost
    // with a dead trip (the save on disk is untouched until home)
    S.save.met = { walker: 1 };
    S.commit();
    const slot = [...store.keys()].find((k) => {
      try {
        return JSON.parse(store.get(k)).label === "Kinds";
      } catch (e) {
        return false;
      }
    });
    const old = JSON.parse(store.get(slot));
    delete old.met;
    store.set(slot, JSON.stringify(old));
    S.loadSave();
    if (!S.save.met || Object.keys(S.save.met).length) err(`old saves: a save from before save.met loaded with ${JSON.stringify(S.save.met)}`);
    S.startTrip();
    if (!S.meetWalker("runner") || S.meetWalker("runner") || S.meetWalker("no-such-kind")) err("met: meetWalker is not true once, the first time, for a known kind");
    S.abandonTrip();
    if (S.save.met.runner != null) err("met: a kind met on a trip that ended in death was kept");
    const day = S.save.day;
    S.startTrip();
    S.meetWalker("runner");
    S.returnHome();
    if (S.save.met.runner !== day) err(`met: a kind met on a trip was not kept at home (${JSON.stringify(S.save.met)})`);
  } finally {
    ctxMath.random = realRandom;
    I.screamWalker = screamWas;
    W.SETTINGS.walkerGore = true;
  }
} catch (e) {
  err(`walker kinds: ${e.stack.split("\n").slice(0, 4).join(" | ")}`);
}

/* ---------- What the owner took out, and what a walker cannot do (2026-10-15) ----------
   No walker counts: no WALKERS box on the HUD (the engine, the page, the style sheet), the yard's wave label is
   only WAVE or HEAVY WAVE, and the river's toast never says how many came. The scream's toast is said once per
   SCREAM_TOAST_GAP however often they scream. A lanky's long reach never bites round a wall's corner. A kind
   already met is not looked for again. Math.random is seeded here. */
let countsChecked = 0;
try {
  const ctxMath = vm.runInContext("Math", sb);
  const realRandom = ctxMath.random;
  ctxMath.random = ((s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)(5151);
  const toastWas = I.toast;
  const said = [];
  I.toast = function (text, secs, pickup) {
    said.push(String(text));
    return toastWas.call(this, text, secs, pickup);
  };
  const seesWas = I.seesWalker;
  try {
    S.newGame(1, "Counts");
    // the HUD's WALKERS box is gone from every on-foot scene
    countsChecked++;
    if ("walkers" in I.hud) err("HUD: Interior.hud.walkers is back (the WALKERS box, removed 2026-10-15)");
    if (/int-box-walkers|id="int-walkers"/.test(html)) err("HUD: index.html has the WALKERS box again");
    const css = fs.readFileSync(path.join(ROOT, "css", "style.css"), "utf8");
    if (/#int-box-walkers|#int-walkers\b/.test(css)) err("HUD: css/style.css styles the WALKERS box again");

    // the yard's wave label: WAVE or HEAVY WAVE, never a count
    S.save.day = 12;
    for (const size of ["some", "many"]) {
      I.enterYard({ firstCalm: 999 });
      I.stop();
      I.player.maxHp = I.player.hp = 1e9;
      I.phase = { kind: "wave", size, total: 8, spawned: 0, spawnT: 0, t: 0, sides: ["n", "s"] };
      const want = size === "many" ? "HEAVY WAVE" : "WAVE";
      let frames = 0;
      let bad = null;
      for (let t = 0; t < 20 && I.phase.kind === "wave"; t += 0.05) {
        I.update(0.05);
        if (I.phase.kind !== "wave") break;
        frames++;
        const label = I.hud.phase.textContent;
        // (walkers in the cabin while you are out of it: the label says where, never how many)
        const where = !I.indoorAt(I.player.x, I.player.y) && I.walkers.some((z) => I.inCabin(z.x, z.y)) ? " · walkers in the cabin" : "";
        if (!bad && (label !== want + where || /\d/.test(label))) bad = label;
      }
      countsChecked++;
      if (!frames || !I.walkers.length) err(`yard: a ${size} wave brought no walkers to check its label against`);
      if (bad != null) err(`yard: a ${size} wave's label read "${bad}", want exactly "${want}" (no count)`);
      I.walkers.length = 0;
    }
    S.save.day = 1;

    // the scream's toast: once per SCREAM_TOAST_GAP, however often they scream
    const screamer = Object.keys(W.WALKER_TYPES).find((id) => W.WALKER_TYPES[id].scream);
    if (screamer) {
      I.enterYard({ firstCalm: 999 });
      I.stop();
      const p = I.player;
      p.maxHp = p.hp = 1e9;
      Object.assign(p, { x: 27.5, y: 30.5, a: -Math.PI / 2 });
      I.walkers.length = 0;
      const sc = I.makeWalker(screamer, 27.5, 27.5, 1);
      sc.awake = true;
      I.walkers.push(sc);
      const screams = () => said.filter((t) => /^A scream!/.test(t)).length;
      said.length = 0;
      I.update(0.05);
      countsChecked++;
      if (screams() !== 1) err(`scream: a screamer in sight gave ${screams()} "A scream!" toasts, want 1`);
      // it screams again (its cooldown cut short) well inside the gap: no second toast
      sc.screamT = 0;
      sc.yell = 0;
      I.update(0.05);
      if (!(sc.yell > 0)) err("scream: a screamer with its cooldown spent did not scream again");
      if (screams() !== 1) err(`scream: two screams inside SCREAM_TOAST_GAP (${I.SCREAM_TOAST_GAP} s) gave ${screams()} toasts`);
      // past the gap, the next scream is told again
      I.time += I.SCREAM_TOAST_GAP;
      sc.screamT = 0;
      sc.yell = 0;
      I.update(0.05);
      if (screams() !== 2) err(`scream: a scream past SCREAM_TOAST_GAP gave no toast (${screams()} in all)`);
      I.walkers.length = 0;
    }

    // a kind already met is not looked for (State.save.met); one not met yet is, and is met once seen
    {
      I.enterYard({ firstCalm: 999 });
      I.stop();
      const p = I.player;
      p.maxHp = p.hp = 1e9;
      Object.assign(p, { x: 27.5, y: 30.5, a: -Math.PI / 2 });
      let looks = 0;
      I.seesWalker = function (z) {
        looks++;
        return seesWas.call(this, z);
      };
      for (const metBefore of [true, false]) {
        S.save.met = metBefore ? { walker: 1 } : {};
        I.walkers.length = 0;
        const z = I.makeWalker("walker", 27.5, 26.5, 1);
        z.awake = true;
        I.walkers.push(z);
        looks = 0;
        for (let i = 0; i < 20; i++) I.update(0.05);
        countsChecked++;
        if (metBefore && looks) err(`met: a walker of a kind already met was looked for ${looks} times in 1 s`);
        if (metBefore && !z.met) err("met: a walker of a kind already met is not marked met");
        if (!metBefore && (!looks || S.save.met.walker !== S.save.day)) err(`met: a walker in front of you was not looked for or not met (${looks} looks, ${JSON.stringify(S.save.met)})`);
      }
      I.seesWalker = seesWas;
      // seen anywhere on screen, out to its sides (the view is wider than FOV, which is its height), not past them
      const half = I.halfView();
      countsChecked++;
      if (!(I.W > I.H) || !(half > I.FOV / 2 + 0.1)) err(`met: setup, a wide screen's half view ${half.toFixed(3)} rad is not wider than FOV / 2`);
      for (const off of [0.3, 0.6, 0.8, half - 0.04, half + 0.15]) {
        for (const side of [-1, 1]) {
          const a = p.a + side * off;
          const z = I.makeWalker("walker", p.x + Math.cos(a) * 5, p.y + Math.sin(a) * 5, 1);
          if (I.solidAt(z.x, z.y) || !I.lineClear(p.x, p.y, z.x, z.y)) continue;
          const q = I.project(z.x, z.y);
          const onScreen = !!q && q.x >= 0 && q.x <= I.W;
          if (onScreen !== I.seesWalker(z)) err(`met: a walker ${off.toFixed(2)} rad to the ${side < 0 ? "left" : "right"} (screen x ${q ? q.x.toFixed(0) : "-"} of ${I.W}, a clear line) is ${onScreen ? "on screen but not seen" : "off screen but seen"}`);
        }
      }
      I.walkers.length = 0;
    }

    // a lanky's long reach never bites round a wall's corner: the line between them must be clear past a plain
    // walker's reach. A wall tile with open floor north, east and north-east of it: the lanky hugs its north face,
    // you hug its east face, about 1.15 tiles apart, the corner between you
    const lanky = Object.keys(W.WALKER_TYPES).filter((id) => W.WALKER_TYPES[id].reach > W.WALKER_TYPES.walker.reach + 0.2).sort((a, b) => W.WALKER_TYPES[b].reach - W.WALKER_TYPES[a].reach)[0];
    const building = W.LOCATIONS.find((l) => l.id !== "base" && !l.outdoor && I.layoutFor(l));
    if (lanky) {
      S.startTrip();
      I.enter(building);
      I.stop();
      I.walkers.length = 0;
      const open = (x, y) => !I.solidAt(x + 0.5, y + 0.5) && !I.solidForPlayer(x + 0.5, y + 0.5) && !I.opaqueAt(x + 0.5, y + 0.5);
      let corner = null;
      for (let y = 2; y < I.gh - 2 && !corner; y++) {
        for (let x = 1; x < I.gw - 3 && !corner; x++) {
          if (!I.solidAt(x + 0.5, y + 0.5) || !I.opaqueAt(x + 0.5, y + 0.5)) continue;
          if ([[x + 1, y], [x, y - 1], [x + 1, y - 1], [x + 2, y], [x + 2, y - 1], [x + 1, y + 1], [x + 2, y + 1]].every(([a, b]) => open(a, b))) corner = [x, y];
        }
      }
      if (!corner) err(`lanky: no wall corner with open floor round it in ${building.id} to test against`);
      else {
        const [cx, cy] = corner;
        const T = W.WALKER_TYPES[lanky];
        const p = I.player;
        const place = (px, py, zx, zy) => {
          Object.assign(p, { x: px, y: py, hp: 1000, maxHp: 1000 });
          p.a = Math.atan2(zy - py, zx - px);
          I.walkers.length = 0;
          const z = I.makeWalker(lanky, zx, zy, 1);
          Object.assign(z, { awake: true, cool: 0, met: true });
          I.walkers.push(z);
          return z;
        };
        // round the corner: in reach, but the wall between
        const lx = cx + 0.5;
        const ly = cy - T.r - 0.02;
        const px = cx + 1.3;
        const py = cy + 0.5;
        const d = Math.hypot(px - lx, py - ly);
        countsChecked++;
        if (!(d < T.reach && d > W.WALKER_TYPES.walker.reach) || I.lineClear(lx, ly, px, py)) err(`lanky: the corner test is not round a corner (${d.toFixed(2)} tiles, line clear ${I.lineClear(lx, ly, px, py)})`);
        const z = place(px, py, lx, ly);
        I.update(0.05);
        if (p.hp !== 1000 || z.act === "bite") err(`lanky: it bit you round a wall's corner from ${d.toFixed(2)} tiles (${z.act}, hp ${p.hp})`);
        // it comes round the corner and bites, soon
        let bit = false;
        for (let t = 0; t < 4 && !bit; t += 0.05) {
          I.update(0.05);
          bit = p.hp < 1000;
        }
        if (!bit) err("lanky: round a wall's corner, it never came round to bite");
        // the same reach with a clear line bites
        const qx = cx + 1.5;
        const qy = ly - 0.6;
        const d2 = Math.hypot(qx - lx, qy - ly);
        if (!(d2 < T.reach && d2 > W.WALKER_TYPES.walker.reach) || !I.lineClear(lx, ly, qx, qy)) err(`lanky: the open test spot is off (${d2.toFixed(2)} tiles)`);
        const z2 = place(qx, qy, lx, ly);
        I.update(0.05);
        if (!(p.hp < 1000) || z2.act !== "bite") err(`lanky: in the open at ${d2.toFixed(2)} tiles (its reach ${T.reach}) it did not bite (${z2.act})`);
      }
      I.walkers.length = 0;
      S.abandonTrip();
    }
  } finally {
    ctxMath.random = realRandom;
    I.toast = toastWas;
    I.seesWalker = seesWas;
  }

  // the river: what comes out of the trees is never counted, two at once included
  const river = W.LOCATIONS.find((l) => l.id === "river");
  if (river) {
    const R = W.RIVER;
    const pair = R.pairChance;
    const toastWas2 = I.toast;
    const toasts = [];
    I.toast = function (text, secs, pickup) {
      toasts.push(String(text));
      return toastWas2.call(this, text, secs, pickup);
    };
    try {
      S.startTrip();
      I.enterRiver(river);
      I.stop();
      R.pairChance = 1;
      let pairs = 0;
      const a0 = I.player.a;
      for (let k = 0; k < 8; k++) {
        I.player.a = a0 + (k * Math.PI) / 4; // some in view, some behind you
        I.walkers.length = 0;
        I.riverSpawnT = 0;
        toasts.length = 0;
        I.update(1 / 30);
        if (I.walkers.length === 2) pairs++;
        const t = toasts[toasts.length - 1] || "";
        if (!t || /\d|\btwo\b|\bboth\b|\bpair\b/i.test(t)) err(`river: two walkers out of the trees were told as "${t}" (no count)`);
      }
      countsChecked++;
      if (!pairs) err("river: with RIVER.pairChance 1, two never came out of the trees together");
    } finally {
      R.pairChance = pair;
      I.toast = toastWas2;
      I.walkers.length = 0;
      S.abandonTrip();
    }
  }
} catch (e) {
  err(`counts: ${e.stack.split("\n").slice(0, 4).join(" | ")}`);
}

/* ---------- Live walkers on screen (js/walker3d.js through the renderer) ----------
   Every kind, near and far, behind you, biting, clawing, screaming, falling and in a spray of blood, drawn in a
   building, the yard and the cabin without a throw; each walker's canvas is reused (none made while walkers come
   closer) and let go with the scene; a walker behind a wall is never drawn; nothing stands taller than the ceiling
   (indoors and in the cabin); the pose and its ease; a downed walker falls and fades; a live picture never goes
   through Draw3.dim or dimOwn; a still walker (and a body lying still) is drawn once; the redraws a frame stay under
   the cap without leaving anyone out, also the frame the governor goes back to sharper pictures; the near ones draw
   every frame at every governor level, bodies at your feet take no near place, two at the edge of the near ones do
   not swap detail as they jostle, and a hit flashes at once on anyone; turning back to a crowd (after a few frames
   away, or after its canvases were let go) is no burst of redraws; the governor starts on the defaults, steps down
   in the order the spec gives, climbs to richer rows when fast, waits longer each time before climbing back to a row
   it could not hold, and counts only frames with walkers on screen; the health bar sits over the head; the blood is
   drawn only with SETTINGS.walkerGore, and a hit's spray starts at the chest as drawn (shrunk under a ceiling). */
let liveChecked = 0;
const liveErrors0 = errors.length;
try {
  const WT = W.WALKER_TYPES;
  const kinds = Object.keys(WT);
  const W3 = ZSR.Walker3D;
  const ctxMath = vm.runInContext("Math", sb);
  const realRandom = ctxMath.random;
  ctxMath.random = ((s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)(5150);
  const drawWas = W3.draw;
  const makeWas = sb.document.createElement;
  const dimWas = D.dim;
  const dimOwnWas = I.dimOwn;
  const fillWas = I.ctx.fillRect;
  const goreWas = W.SETTINGS.walkerGore;
  const ok = (cond, msg) => {
    liveChecked++;
    if (!cond) err(`live walkers: ${msg}`);
  };
  let draws = [];
  let made = 0;
  let dimmedLive = 0;
  const pooled = () => {
    const set = new Set();
    I.livePool.forEach((t) => set.add(t.c));
    (I.liveSpare || []).forEach((t) => set.add(t.c));
    return set;
  };
  try {
    W3.draw = function (g, type, st, cam) {
      draws.push({ type, seed: st.seed, lod: st.lod, pose: st.pose, poseT: st.poseT, poseW: st.poseW, hit: st.hit, fall: st.fall, fallDir: st.fallDir, fog: st.fog, yaw: st.yaw, w: cam.w, h: cam.h, px: cam.px, dist: cam.dist, eye: cam.eye, frame: I.frameNo });
      return drawWas.call(this, g, type, st, cam);
    };
    sb.document.createElement = function (tag) {
      if (String(tag).toLowerCase() === "canvas") made++;
      return makeWas(tag);
    };
    D.dim = function (img, lvl) {
      if (pooled().has(img)) dimmedLive++;
      return dimWas.call(this, img, lvl);
    };
    I.dimOwn = function (img, lvl) {
      if (pooled().has(img)) dimmedLive++;
      return dimOwnWas.call(this, img, lvl);
    };
    const p0 = () => I.player;
    const put = (type, x, y, o) => {
      const z = I.makeWalker(type, x, y, 1);
      z.awake = true;
      Object.assign(z, o || {});
      I.walkers.push(z);
      return z;
    };
    const ahead = (d, side) => {
      const p = p0();
      return [p.x + Math.cos(p.a) * d - Math.sin(p.a) * (side || 0), p.y + Math.sin(p.a) * d + Math.cos(p.a) * (side || 0)];
    };
    const frame = () => {
      I.frameNo = I.frameNo || 0;
      I.render();
    };
    const clear = () => {
      I.walkers.length = 0;
      I.fallen.length = 0;
      I.blood.length = 0;
    };
    /** Look along the longest clear line from where you stand (so walkers ahead of you are in the open). */
    const lookLongest = () => {
      const p = p0();
      let best = 0;
      for (let k = 0; k < 32; k++) {
        const a = (k / 32) * Math.PI * 2;
        let d = 0;
        while (d < 30 && !I.solidAt(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d) && !I.solidAt(p.x + Math.cos(a) * d - Math.sin(a) * 0.6, p.y + Math.sin(a) * d + Math.cos(a) * 0.6) && !I.solidAt(p.x + Math.cos(a) * d + Math.sin(a) * 0.6, p.y + Math.sin(a) * d - Math.cos(a) * 0.6)) d += 0.25;
        if (d > best) (best = d), (p.a = a);
      }
      return best;
    };
    /** Every kind all around you and in every state; frames from four sides must not throw. */
    const crowd = (where) => {
      clear();
      const p = p0();
      let n = 0;
      [0.35, 1, 3, 8, 20].forEach((d, di) => {
        kinds.forEach((type, ki) => {
          const a = p.a + ((ki + di * kinds.length) / (kinds.length * 5)) * Math.PI * 2;
          const x = p.x + Math.cos(a) * d;
          const y = p.y + Math.sin(a) * d;
          if (I.solidAt(x, y)) return;
          const z = put(type, x, y, { heading: a * 3, gait: (ki * 0.17) % 1, move: di % 2, seed: 1000 + n++ });
          const k = (ki + di) % 5;
          if (k === 1) Object.assign(z, { act: "bite", biteT: 0.2, pose: "bite", poseW: 0.5 });
          if (k === 2) Object.assign(z, { act: "claw", clawPh: 0.4, pose: "claw", aim: [x + 1, y] });
          if (k === 3) Object.assign(z, { yell: 0.6, act: "scream", pose: "scream" });
          if (k === 4) Object.assign(z, { awake: false, act: "sleep", pose: "idle", hp: z.maxHp * 0.4, hit: 0.1 });
        });
      });
      // three downed walkers (just hit, half down, nearly gone) and a spray
      [0, 1, 1.9].forEach((t, i) => {
        const [x, y] = ahead(2 + i, (i - 1) * 0.8);
        if (I.solidAt(x, y)) return;
        const z = I.makeWalker(kinds[i % kinds.length], x, y, 1);
        z.hp = 0;
        z.fallDir = p.a + i;
        I.downWalker(z);
        z.fallT = t;
      });
      const z = put("walker", ...ahead(2.5, 0));
      for (let i = 0; i < 3; i++) I.hurtWalker(z, 5, p);
      I.updateBlood(0.1);
      renderAround(`live walkers ${where}`);
      I.update(0.05);
      renderAround(`live walkers ${where}, a frame later`);
      ok(draws.length > 0, `${where}: no walker was drawn`);
    };

    /* a building: under a ceiling */
    const building = W.LOCATIONS.find((l) => l.id !== "base" && !l.outdoor && I.layoutFor(l));
    S.startTrip();
    I.enter(building);
    I.stop();
    p0().maxHp = p0().hp = 1e9;
    lookLongest();
    draws = [];
    crowd(`in ${building.id}`);
    // nothing stands taller than the ceiling: every kind's sprite (standing and falling) and what it is drawn at
    kinds.forEach((type) => {
      const z = I.makeWalker(type, p0().x + 1, p0().y, 1);
      [false, true].forEach((falling) => {
        const s = I.walkerSprite(z, falling);
        ok(s.scale <= I.CEIL_CAP + 1e-9, `in ${building.id}: a ${type}${falling ? " (down)" : ""} stands ${s.scale} tiles under a ceiling (cap ${I.CEIL_CAP})`);
        ok(Math.abs(s.scale - Math.min(W3.box(type, falling).h, I.CEIL_CAP)) < 1e-9, `in ${building.id}: a ${type} is not drawn at its box's height, capped`);
      });
      ok(I.walkerHeight(z) <= I.CEIL_CAP + 1e-9, `in ${building.id}: walkerHeight(${type}) ${I.walkerHeight(z)} is over the ceiling`);
    });
    // a hit's spray starts at the chest as drawn: under the ceiling a tall kind is drawn shrunk, and so is its spray
    {
      const goreNow = W.SETTINGS.walkerGore;
      W.SETTINGS.walkerGore = true;
      kinds.forEach((type) => {
        const z = I.makeWalker(type, p0().x + 1, p0().y, 1);
        I.blood.length = 0;
        I.bleed(z, 10, p0(), false);
        const h = I.walkerHeight(z);
        const top = Math.max(...I.blood.map((b) => b.h));
        ok(I.blood.length > 0 && top <= h * 0.75 + 1e-9, `in ${building.id}: a ${type}'s spray starts ${top.toFixed(2)} tiles up, over its chest as drawn (${h} tall)`);
      });
      I.blood.length = 0;
      W.SETTINGS.walkerGore = goreNow;
    }
    // what Walker3D was asked for: the whole box in its region, at the walker's distance (seen from farther off when
    // it is capped), in view of its own feet
    const badCam = draws.filter((d) => !(d.w >= 2 && d.h >= 2 && d.h <= I.LIVE_MAX_PX + 1 && d.px > 0 && d.dist > 0.1 && d.eye > 0 && Number.isFinite(d.yaw) && d.fog >= 0 && d.fog <= 0.9 && [0, 1, 2].includes(d.lod) && W3.POSES.includes(d.pose)));
    ok(!badCam.length, `in ${building.id}: ${badCam.length} draws with an odd region or state (${JSON.stringify(badCam[0])})`);
    // a walker behind a wall is never drawn; one in the open is
    {
      clear();
      const p = p0();
      let spot = null;
      for (let gy = 1; gy < I.gh - 1 && !spot; gy++) {
        for (let gx = 1; gx < I.gw - 1 && !spot; gx++) {
          const px = gx + 0.5;
          const py = gy + 0.5;
          if (I.solidAt(px, py)) continue;
          for (let k = 0; k < 8 && !spot; k++) {
            const a = (k / 8) * Math.PI * 2;
            const wx = px + Math.cos(a) * 3.2;
            const wy = py + Math.sin(a) * 3.2;
            if (I.solidAt(wx, wy) || I.opaqueAt(wx, wy)) continue;
            // walled off: no line from you to any point its picture spans (its box is about 1.6 tiles wide on the
            // floor, sideways: Walker3D.box(...).w in screen tiles, times STRETCH)
            let hidden = true;
            for (let s = -1; s <= 1 && hidden; s += 0.125) {
              const sx = wx - Math.sin(a) * s * 0.9;
              const sy = wy + Math.cos(a) * s * 0.9;
              if (I.lineClear(px, py, sx, sy)) hidden = false;
            }
            if (hidden) spot = [px, py, a, wx, wy];
          }
        }
      }
      ok(!!spot, `in ${building.id}: no spot with a walker right behind a wall to test`);
      if (spot) {
        [p.x, p.y, p.a] = spot;
        const hid = put("walker", spot[3], spot[4], { seed: 777, heading: 0 });
        const [ox, oy] = [p.x + Math.cos(p.a) * 0.9, p.y + Math.sin(p.a) * 0.9];
        if (I.lineClear(p.x, p.y, ox, oy) && !I.solidAt(ox, oy)) put("walker", ox, oy, { seed: 778 });
        draws = [];
        frame();
        frame();
        ok(!draws.some((d) => d.seed === 777), `in ${building.id}: a walker behind a wall was drawn (${draws.filter((d) => d.seed === 777).length} times)`);
        ok(I.walkers.length < 2 || draws.some((d) => d.seed === 778), `in ${building.id}: a walker in front of you was not drawn`);
        ok(!I.livePool.has(hid), `in ${building.id}: a walker behind a wall got a canvas`);
      }
    }
    // a walker's canvas is reused: six kinds coming at you from 3 tiles to 1.5 (their pictures double in size) make
    // no canvas after the first frame; each one's own canvas grows instead
    lookLongest();
    clear();
    I.liveRelease(); // no spares from the walkers above: each of the six starts on a canvas its own size
    const six = kinds.map((type, i) => put(type, ...ahead(3, (i - (kinds.length - 1) / 2) * 0.25), { move: 1, seed: 2000 + i, heading: p0().a + Math.PI }));
    frame();
    const firstH = six.map((z) => (I.livePool.get(z) ? I.livePool.get(z).c.height : 0));
    made = 0;
    for (let f = 0; f < 30; f++) {
      six.forEach((z) => {
        z.x -= Math.cos(p0().a) * 0.05;
        z.y -= Math.sin(p0().a) * 0.05;
        z.gait = (z.gait + 0.07) % 1;
      });
      frame();
    }
    ok(made === 0, `in ${building.id}: ${made} canvases made while six walkers came closer (each keeps its own)`);
    ok(I.livePool.size === six.length, `in ${building.id}: ${I.livePool.size} pooled canvases for ${six.length} walkers`);
    ok(six.every((z, i) => I.livePool.get(z) && I.livePool.get(z).c.height > firstH[i]), `in ${building.id}: coming closer, the walkers' canvases did not grow (${firstH} -> ${six.map((z) => I.livePool.get(z) && I.livePool.get(z).c.height)})`);
    // the picture shown is the one drawn: the top-left iw x ih of the walker's own canvas, and nothing past it goes
    // on screen (the canvas is bigger than the picture: it grows in steps and keeps old pictures' size)
    {
      const seen = [];
      const ds = I.drawSprite;
      I.drawSprite = function (ctx, s) {
        if (s.live) seen.push(s);
        return ds.call(this, ctx, s);
      };
      const own = new Map();
      I.livePool.forEach((t) => own.set(t.c, t));
      let outside = 0;
      let blits = 0;
      I.ctx.drawImage = function (img, sx, sy, sw, sh) {
        const t = own.get(img);
        if (!t || arguments.length < 9) return;
        blits++;
        if (sx < -1e-6 || sy < -1e-6 || sx + sw > t.lw + 1e-6 || sy + sh > t.lh + 1e-6) outside++;
      };
      frame();
      delete I.ctx.drawImage;
      I.drawSprite = ds;
      const bad = seen.filter((s) => !(s.im && s.im === I.livePool.get(s.live).c && s.iw > 0 && s.ih > 0 && s.iw <= s.im.width && s.ih <= s.im.height));
      ok(seen.length && !bad.length, `in ${building.id}: ${bad.length} of ${seen.length} live sprites point at an empty or wrong picture`);
      ok(blits > 0 && !outside, `in ${building.id}: ${outside} of ${blits} draws of a live picture read past its drawn part`);
    }
    // a still walker (asleep) is drawn once, then keeps its picture
    clear();
    const still = put("walker", ...ahead(5, 0), { awake: false, act: "sleep", pose: "idle", seed: 2100 });
    draws = [];
    for (let f = 0; f < 6; f++) frame();
    ok(draws.filter((d) => d.seed === still.seed).length === 1, `in ${building.id}: a sleeping walker was drawn ${draws.filter((d) => d.seed === still.seed).length} times in 6 frames (want once)`);
    // fog: farther is darker (in its own colours)
    const len = lookLongest();
    clear();
    put("walker", ...ahead(2, 0), { seed: 2201 });
    put("walker", ...ahead(Math.min(12, len - 1), 0), { seed: 2202 });
    draws = [];
    frame();
    const fNear = draws.find((d) => d.seed === 2201);
    const fFar = draws.find((d) => d.seed === 2202);
    ok(fNear && fFar && fFar.fog > fNear.fog, `in ${building.id}: a far walker is not foggier than a near one (${fNear && fNear.fog}, ${fFar && fFar.fog})`);
    I.stop();
    ok(I.livePool.size === 0 && !(I.liveSpare || []).length, `in ${building.id}: leaving kept ${I.livePool.size} walker canvases (+${(I.liveSpare || []).length} spare)`);
    S.abandonTrip();

    /* the yard: open sky, the dirt path north of the cabin door */
    I.enterYard({ firstCalm: 999 });
    I.stop();
    const p = p0();
    p.maxHp = p.hp = 1e9;
    Object.assign(p, { x: 27.5, y: 30.5, a: -Math.PI / 2 });
    draws = [];
    crowd("in the yard");
    Object.assign(p, { x: 27.5, y: 30.5, a: -Math.PI / 2 });
    kinds.forEach((type) => {
      const z = I.makeWalker(type, 27.5, 26.5, 1);
      ok(Math.abs(I.walkerSprite(z, false).scale - W3.box(type, false).h) < 1e-9, `in the yard: a ${type} under the open sky is not its full height`);
    });
    // the health bar sits just over the head (the look's head top), as wide as the walker is to hit
    {
      clear();
      const z = put("brute", 27.5, 27.5, { seed: 2300, heading: Math.PI / 2 });
      z.hp = z.maxHp / 2;
      const bars = [];
      I.ctx.fillRect = function (x, y, w, h) {
        if (this.fillStyle === "#b3261e" && h === 5) bars.push({ x, y, w });
      };
      frame();
      I.ctx.fillRect = fillWas;
      const s = I.walkerSprite(z, false);
      const head = I.project(z.x, z.y, s.head);
      const unit = I.project(z.x, z.y, 0).y - I.project(z.x, z.y, 1).y; // px per tile tall here
      ok(bars.length === 1, `in the yard: ${bars.length} health bars for one hurt brute`);
      if (bars.length === 1 && head) {
        ok(Math.abs(bars[0].y - (head.y - 9)) < 0.5, `in the yard: the health bar is at ${bars[0].y.toFixed(1)}, not just over the head (${(head.y - 9).toFixed(1)})`);
        ok(Math.abs(bars[0].w - unit * s.barW * 0.5) < 0.5 && Math.abs(bars[0].x + unit * s.barW / 2 - head.x) < 1, `in the yard: the health bar is ${bars[0].w.toFixed(1)} px from ${bars[0].x.toFixed(1)}, not half of ${(unit * s.barW).toFixed(1)} centred over it`);
      }
    }
    // the pose: what a walker does picks it; from walking straight in, from anything else out first (POSE_BLEND)
    {
      clear();
      const z = put("walker", 27.5, 27.5, { seed: 2400 });
      const blend = W3.POSE_BLEND || 0.15;
      const want = (o) => I.walkerPose(Object.assign(I.makeWalker("walker", 0, 0, 1), { awake: true }, o));
      ok(want({ yell: 0.5, biteT: 0.2, act: "bite" }) === "scream", "a yelling walker does not scream");
      ok(want({ biteT: 0.2, act: "walk" }) === "bite" && want({ act: "bite" }) === "bite", "a biting walker does not bite");
      ok(want({ act: "claw" }) === "claw", "a clawing walker does not claw");
      ok(["sleep", "idle", "wait"].every((act) => want({ act }) === "idle"), "a still walker is not idle");
      ok(want({ act: "walk" }) === "walk" && want({ act: "something-new" }) === "walk", "a walking walker (or one doing a mode's own thing) does not walk");
      Object.assign(z, { pose: "walk", poseW: 1, act: "walk" });
      const dt = blend / 6;
      I.animWalker(z, dt, z.x, z.y, "claw");
      ok(z.pose === "claw" && z.poseW === 0, `from walking into a claw: ${z.pose} at ${z.poseW} (want claw at 0)`);
      for (let i = 0; i < 7; i++) I.animWalker(z, dt, z.x, z.y, "claw");
      ok(z.pose === "claw" && z.poseW === 1, `a claw is not all the way in after POSE_BLEND (${z.poseW})`);
      I.animWalker(z, dt, z.x, z.y, "walk");
      ok(z.pose === "claw" && z.poseW < 1 && z.poseW > 0, `out of a claw: it did not ease out first (${z.pose} at ${z.poseW})`);
      for (let i = 0; i < 7; i++) I.animWalker(z, dt, z.x, z.y, "walk");
      ok(z.pose === "walk", `out of a claw: still ${z.pose} after POSE_BLEND`);
      // a claw at anything (a mode's own target: a build, the van) faces it and swipes at its look's rate
      [[30.5, 27.5], { x: 30.5, y: 27.5 }].forEach((aim) => {
        Object.assign(z, { heading: Math.PI, aim, clawPh: 0, pose: "walk", poseW: 1 });
        for (let i = 0; i < 20; i++) I.animWalker(z, 0.05, z.x, z.y, "claw");
        const L = W3.TYPES.walker.gait;
        ok(Math.abs(Math.atan2(Math.sin(z.heading), Math.cos(z.heading))) < 0.2, `a walker clawing at ${JSON.stringify(aim)} does not face it (${z.heading.toFixed(2)})`);
        ok(Math.abs(z.clawPh - ((20 * 0.05 * L.clawRate) % 1)) < 1e-9, `a clawing walker swipes at ${z.clawPh}, not its look's clawRate ${L.clawRate}`);
        ok(z.pose === "claw", `a walker clawing at ${JSON.stringify(aim)} shows ${z.pose}`);
      });
      // drawn as it is: the pose, its ease, the bite's time
      Object.assign(z, { pose: "bite", poseW: 0.5, biteT: (W3.BITE_SECS || 0.45) / 2, act: "bite", heading: Math.PI / 2 });
      draws = [];
      frame();
      const d = draws.find((x) => x.seed === 2400);
      ok(d && d.pose === "bite" && Math.abs(d.poseW - 0.5) < 1e-9 && Math.abs(d.poseT - 0.5) < 1e-9, `a biting walker is drawn as ${JSON.stringify(d && [d.pose, d.poseW, d.poseT])}`);
      ok(d && Math.abs(d.yaw) < 1e-6, `a walker facing you is drawn turned ${d && d.yaw}`);
    }
    // a downed walker falls (by COLLAPSE_SECS), away from the shot, then fades over FADE_SECS; no health bar
    {
      clear();
      const z = put("armored", 27.5, 27.5, { seed: 2500, heading: Math.PI / 2 });
      I.hurtWalker(z, 1e6, p);
      I.update(0.05);
      ok(I.fallen.includes(z), "a dead walker is not falling");
      const fallSecs = W3.FALL_SECS;
      const fade = W3.FADE_SECS;
      [[0.05, 0], [W3.COLLAPSE_SECS / 2, 0], [fallSecs - fade - 0.01, 0], [fallSecs - fade / 2, 0.5], [fallSecs - 0.01, 0.99]].forEach(([t, dim]) => {
        z.fallT = t;
        const s = I.walkerSprite(z, true);
        ok(Math.abs(s.dim - dim) < 0.02 && s.hp == null, `a downed walker at ${t.toFixed(2)} s fades ${s.dim.toFixed(2)} (want ${dim}), bar ${s.hp}`);
        draws = [];
        frame();
        const d = draws.find((x) => x.seed === 2500);
        if (d) ok(Math.abs(d.fall - Math.min(1, t / W3.COLLAPSE_SECS)) < 1e-9 && Math.abs(Math.atan2(Math.sin(d.fallDir), Math.cos(d.fallDir)) - Math.atan2(Math.sin(z.fallDir - z.heading), Math.cos(z.fallDir - z.heading))) < 1e-9, `a downed walker at ${t.toFixed(2)} s is drawn at fall ${d.fall}, direction ${d.fallDir}`);
      });
      ok(draws.length <= 1, "a settled, fading walker is drawn again every frame");
      // one that stood idle and awake when it fell (it breathed): its picture holds still once it lies there
      clear();
      const y = put("walker", 27.5, 28.5, { seed: 2501, heading: Math.PI / 2, act: "idle", pose: "idle", poseW: 1 });
      I.hurtWalker(y, 1e6, p);
      I.update(0.05);
      Object.assign(y, { fallT: W3.COLLAPSE_SECS + 0.05, hit: 0 });
      frame();
      draws = [];
      for (let f = 0; f < 8; f++) {
        I.time += 0.1; // as the scene's clock and the fall's run on
        y.fallT += 0.1;
        frame();
      }
      ok(!draws.some((d) => d.seed === 2501), `a downed walker that fell idle was drawn ${draws.filter((d) => d.seed === 2501).length} times more as it lay still (its breathing kept going)`);
    }
    // blood: cached sprites only with SETTINGS.walkerGore (Draw3's bloodDrop / bloodSplat; fog through D.dim is fine)
    {
      const shown = (gore) => {
        clear();
        W.SETTINGS.walkerGore = gore;
        const z = put("walker", 27.5, 27.5, { seed: 2600, hp: 1000, maxHp: 1000 });
        I.hurtWalker(z, 20, p);
        if (!gore) I.blood.push({ x: 27.6, y: 27.6, h: 0.5, vx: 0, vy: 0, vh: 0, t: 0, life: 1, size: 0.05, splat: false }); // left over from before
        I.updateBlood(0.05);
        const imgs = new Set([D.sprite("bloodDrop"), D.sprite("bloodSplat")]);
        let n = 0;
        const ds = I.drawSprite;
        I.drawSprite = function (ctx, s) {
          if (imgs.has(s.img)) n++;
          return ds.call(this, ctx, s);
        };
        frame();
        I.drawSprite = ds;
        return n;
      };
      ok(shown(true) > 0, "a hit's spray is not drawn with SETTINGS.walkerGore on");
      ok(shown(false) === 0, "blood is drawn with SETTINGS.walkerGore off");
      W.SETTINGS.walkerGore = goreWas;
    }
    // the redraws a frame: under the cap after the first frame, nobody left out, the near ones every frame at every
    // governor level (thirty walkers ahead in the open, walking on the spot, three of them near)
    {
      clear();
      Object.assign(p, { x: 27.5, y: 30.5, a: -Math.PI / 2 });
      const crowdZ = [];
      for (let i = 0; i < 30; i++) crowdZ.push(put(kinds[i % kinds.length], 27.5 + ((i % 5) - 2) * 0.7, 30.5 - 4 - Math.floor(i / 5) * 1.6, { seed: 3000 + i, move: 1, heading: Math.PI / 2 }));
      // (the test view is 270 px tall: lod 0 is within about 1.5 tiles, 1.1 on the governor's last row)
      const near = [put("walker", 27.15, 29.65, { seed: 3100, move: 1 }), put("runner", 27.85, 29.65, { seed: 3101, move: 1 }), put("brute", 27.5, 29.55, { seed: 3102, move: 1 })];
      const all = crowdZ.concat(near);
      const step = () => {
        all.forEach((z) => (z.gait = (z.gait + 0.047) % 1)); // over a step of its picture's gait (1/32) every frame
        frame();
      };
      for (let lvl = 0; lvl < I.LIVE_LEVELS.length; lvl++) {
        I.setLiveLevel(lvl);
        const L = I.LIVE_LEVELS[lvl];
        if (!lvl) {
          step(); // every picture new: the first frame draws them all
          step();
        } // (a new row changes no one's size on screen: its first frame stays under its cap too)
        draws = [];
        const perFrame = [];
        const F = 24;
        for (let f = 0; f < F; f++) {
          const n0 = draws.length;
          step();
          perFrame.push(draws.length - n0);
        }
        const most = Math.max(...perFrame);
        ok(most <= L.max, `governor level ${lvl}: ${most} redraws in one frame (cap ${L.max})`);
        near.forEach((z) => {
          const n = draws.filter((d) => d.seed === z.seed).length;
          const lod0 = draws.filter((d) => d.seed === z.seed && d.lod === 0).length;
          ok(n === F && lod0 === F, `governor level ${lvl}: a near ${z.type} was drawn ${n} times (${lod0} at lod 0) in ${F} frames (want every frame)`);
        });
        const starved = crowdZ.filter((z) => draws.filter((d) => d.seed === z.seed).length < 2);
        ok(!starved.length, `governor level ${lvl}: ${starved.length} of the crowd drawn under twice in ${F} frames (one every ${Math.ceil(crowdZ.length / Math.max(1, L.max - near.length))} frames or so, want no one left out)`);
        const tooOften = crowdZ.filter((z) => {
          const fr = draws.filter((d) => d.seed === z.seed).map((d) => d.frame);
          return fr.some((v, i) => i && v - fr[i - 1] < L.far);
        });
        ok(!tooOften.length, `governor level ${lvl}: ${tooOften.length} far walkers drawn more often than every ${L.far} frames (${JSON.stringify(tooOften.slice(0, 2).map((z) => [z.seed, draws.filter((d) => d.seed === z.seed).map((d) => d.frame + ":" + d.lod + ":" + d.h)]))})`);
        ok(!draws.some((d) => d.h > Math.ceil(L.maxPx * L.scale) + 1), `governor level ${lvl}: a picture taller than ${L.maxPx} x ${L.scale}`);
      }
      // turning to face the crowd again is no burst of redraws (a look behind you in a breached wave): a few frames
      // turned away, then back. The near ones draw at once; the others show their old pictures a frame or two and
      // take their turns first (the longest-waiting first), under the cap, so each has a new one within a few frames
      [I.LIVE_START, 0].forEach((lvl) => {
        I.setLiveLevel(lvl);
        const L = I.LIVE_LEVELS[lvl];
        for (let f = 0; f < 4; f++) step();
        p.a += Math.PI;
        for (let f = 0; f < 3; f++) step();
        p.a -= Math.PI;
        draws = [];
        step();
        const first = draws.length;
        const nearNow = near.filter((z) => draws.some((d) => d.seed === z.seed && d.lod === 0)).length;
        const within = Math.ceil(crowdZ.length / (L.max - L.near)) + 1;
        for (let f = 1; f < within; f++) step();
        const missed = crowdZ.filter((z) => !draws.some((d) => d.seed === z.seed));
        ok(first <= L.max, `governor level ${lvl}: turning back to a crowd of ${all.length}, ${first} redraws in the first frame (cap ${L.max})`);
        ok(nearNow === near.length, `governor level ${lvl}: turning back to a crowd, ${nearNow} of the ${near.length} near ones drawn in the first frame`);
        ok(!missed.length, `governor level ${lvl}: turning back to a crowd, ${missed.length} of ${crowdZ.length} not drawn again within ${within} frames`);
      });
      // one taking turns whose picture grew on screen (it came much nearer) gets a new one in the next frame, ahead
      // of the others' turns, though it was drawn the frame before
      {
        I.setLiveLevel(I.LIVE_START);
        const z = crowdZ[crowdZ.length - 1]; // the farthest row, 12 tiles off
        for (let f = 0; f < 8 && !(I.livePool.get(z) && I.livePool.get(z).drawnAt === I.frameNo); f++) step();
        ok(I.livePool.get(z) && I.livePool.get(z).drawnAt === I.frameNo, "the far walker was not drawn in 8 frames");
        const y0 = z.y;
        z.y = 30.5 - 4; // 4 tiles off: three times as tall on screen
        draws = [];
        step();
        ok(draws.some((d) => d.seed === z.seed), "a walker taking turns that came much nearer kept its small picture past the next frame (want it first in the wait)");
        z.y = y0;
        step();
      }
      // looking away longer (past LIVE_IDLE frames, so their canvases are let go): every walker in view shows in the
      // first frame back, but the first pictures past the cap are the cheapest (lod 2); each gets its own detail on
      // its turn, first in the wait (twenty walkers 1.9 to 3.3 tiles off: lod 1 in the test view, three near)
      {
        clear();
        I.setLiveLevel(I.LIVE_START);
        const L = I.LIVE_LEVELS[I.LIVE_START];
        const mid = [];
        for (let i = 0; i < 20; i++) mid.push(put(kinds[i % kinds.length], 27.5 + ((i % 5) - 2) * 0.7, 30.5 - 1.9 - Math.floor(i / 5) * 0.45, { seed: 3500 + i, move: 1, heading: Math.PI / 2 }));
        const close = [put("walker", 27.15, 29.65, { seed: 3520, move: 1 }), put("runner", 27.85, 29.65, { seed: 3521, move: 1 }), put("brute", 27.5, 29.55, { seed: 3522, move: 1 })];
        const both = mid.concat(close);
        const stepM = () => {
          both.forEach((z) => (z.gait = (z.gait + 0.047) % 1));
          frame();
        };
        for (let f = 0; f < 8; f++) stepM();
        const settled = mid.filter((z) => I.livePool.get(z) && I.livePool.get(z).sLod === 1).length;
        ok(settled === mid.length, `${settled} of ${mid.length} walkers 1.9 to 3.3 tiles off drawn at lod 1 (the test wants them there)`);
        p.a += Math.PI;
        for (let f = 0; f < I.LIVE_IDLE + 2; f++) stepM();
        ok(both.every((z) => !I.livePool.has(z)), "looking away past LIVE_IDLE frames kept the walkers' canvases");
        p.a -= Math.PI;
        draws = [];
        stepM();
        const back = draws.slice();
        const shownBack = both.filter((z) => back.some((d) => d.seed === z.seed)).length;
        const fine = back.filter((d) => d.lod < 2).length;
        ok(shownBack === both.length, `looking back after the canvases went: ${shownBack} of ${both.length} walkers drawn in the first frame (want all: none may vanish)`);
        ok(fine <= L.max, `looking back after the canvases went: ${fine} pictures past lod 2 in the first frame (cap ${L.max})`);
        ok(close.every((z) => back.some((d) => d.seed === z.seed && d.lod === 0)), "looking back after the canvases went: a near walker was not drawn at once in full detail");
        const within = Math.ceil(mid.length / (L.max - L.near));
        draws = [];
        for (let f = 0; f < within; f++) stepM();
        const coarse = mid.filter((z) => !(I.livePool.get(z) && I.livePool.get(z).sLod === 1));
        ok(!coarse.length, `looking back after the canvases went: ${coarse.length} of ${mid.length} still at lod 2 after ${within} more frames`);
        clear();
        all.forEach((z) => I.walkers.push(z)); // the crowd back for the checks below
      }
      // stepping back up to full resolution (and to bigger pictures) is no burst of redraws: the sharper pictures
      // take their turns, under the cap
      // (canvases new at the low resolution, so many are too small for the sharper pictures: they grow on their turn)
      [I.LIVE_START, 0].forEach((lvl) => {
        I.setLiveLevel(I.LIVE_LEVELS.length - 1);
        I.liveRelease();
        for (let f = 0; f < 6; f++) step();
        I.setLiveLevel(lvl);
        draws = [];
        step();
        ok(draws.length <= I.LIVE_LEVELS[lvl].max, `back up to governor level ${lvl} (from a lower resolution): ${draws.length} redraws in its first frame (cap ${I.LIVE_LEVELS[lvl].max})`);
      });
      I.setLiveLevel(I.LIVE_START);
      // five in full-detail range: the liveNear nearest draw every frame in full detail, the others take turns at
      // lod 1 at most
      clear();
      const five = [1.0, 1.1, 1.2, 1.3, 1.4].map((d, i) => put(kinds[i % kinds.length], 27.5 + (i % 2 ? 0.35 : -0.35), 30.5 - d, { seed: 3200 + i, move: 1 }));
      const step5 = () => {
        five.forEach((z) => (z.gait = (z.gait + 0.047) % 1));
        frame();
      };
      step5();
      draws = [];
      for (let f = 0; f < 12; f++) step5();
      five.forEach((z, i) => {
        const mine = draws.filter((d) => d.seed === z.seed);
        if (i < I.liveNear) ok(mine.length === 12 && mine.every((d) => d.lod === 0), `the ${i + 1}th nearest walker (of ${I.liveNear} near) was drawn ${mine.length} times in 12 frames, lods ${[...new Set(mine.map((d) => d.lod))]}`);
        else ok(mine.length >= 2 && mine.length <= 6 && mine.every((d) => d.lod >= 1), `the ${i + 1}th nearest walker (past the ${I.liveNear} near ones) was drawn ${mine.length} times in 12 frames, lods ${[...new Set(mine.map((d) => d.lod))]} (want turns, lod 1 at most)`);
      });
      // a hit on one taking turns shows at once, and so does the end of its flash (not on its next turn)
      {
        const z = five[five.length - 1];
        let f = 0;
        for (draws = []; f < 6 && !draws.some((d) => d.seed === z.seed && d.frame === I.frameNo); f++) step5();
        z.hit = 0.12;
        draws = [];
        step5();
        ok(draws.some((d) => d.seed === z.seed && d.hit === 1), `a walker taking turns, just drawn and then hit, did not flash in the next frame (${JSON.stringify(draws.filter((d) => d.seed === z.seed))})`);
        z.hit = 0;
        draws = [];
        step5();
        ok(draws.some((d) => d.seed === z.seed && d.hit === 0), "a walker taking turns kept its hit flash past the hit");
      }
      // bodies at your feet take no near place: two settled ones nearer than three walkers leave all three drawn every
      // frame in full detail (and are not drawn again while they lie still)
      {
        clear();
        const three = [1.1, 1.2, 1.3].map((d, i) => put(kinds[i % kinds.length], 27.5 + (i % 2 ? 0.4 : -0.4), 30.5 - d, { seed: 3300 + i, move: 1 }));
        const bodies = [0.75, 0.85].map((d, i) => {
          const z = I.makeWalker(kinds[(i + 1) % kinds.length], 27.5 + (i ? 0.3 : -0.3), 30.5 - d, 1);
          z.seed = 3310 + i;
          I.downWalker(z);
          z.fallT = W3.COLLAPSE_SECS + 0.1;
          return z;
        });
        const step3 = () => {
          three.forEach((z) => (z.gait = (z.gait + 0.047) % 1));
          frame();
        };
        step3();
        draws = [];
        for (let f = 0; f < 12; f++) step3();
        three.forEach((z) => {
          const mine = draws.filter((d) => d.seed === z.seed);
          ok(mine.length === 12 && mine.every((d) => d.lod === 0), `with two bodies nearer, a walker ${(30.5 - z.y).toFixed(1)} tiles off was drawn ${mine.length} times in 12 frames, lods ${[...new Set(mine.map((d) => d.lod))]} (want every frame at lod 0)`);
        });
        ok(!draws.some((d) => bodies.some((b) => b.seed === d.seed)), "settled bodies lying still were drawn again");
        // one still collapsing does take a place (it moves every frame): the farthest of the three takes turns
        bodies[0].fallT = 0.1;
        step3();
        draws = [];
        for (let f = 0; f < 12; f++) {
          bodies[0].fallT += 0.05;
          step3();
        }
        const falls = draws.filter((d) => d.seed === bodies[0].seed);
        const last = draws.filter((d) => d.seed === three[2].seed);
        ok(falls.length === 12 && falls.every((d) => d.lod === 0), `a body collapsing at your feet was drawn ${falls.length} times in 12 frames (want every frame, full detail)`);
        ok(last.length < 12 && last.every((d) => d.lod >= 1), `with a body collapsing nearer, the third walker was still drawn ${last.length} times in 12 frames (want turns)`);
        // settled, it gives its place back but keeps its full detail (no pop as it lands)
        bodies[0].fallT = W3.COLLAPSE_SECS + 0.05;
        draws = [];
        for (let f = 0; f < 6; f++) step3();
        const landed = draws.filter((d) => d.seed === bodies[0].seed);
        ok(landed.length >= 1 && landed.every((d) => d.lod === 0), `a body that landed at your feet was drawn at lods ${JSON.stringify(landed.map((d) => d.lod))} (want its full detail kept)`);
        ok(draws.filter((d) => d.seed === three[2].seed && d.lod === 0).length >= 5, "a body that landed did not give its near place back");
      }
      // two at about the same depth at the edge of the near ones keep their places: no detail flicker as they jostle;
      // one clearly nearer does take the place
      {
        clear();
        const a = put("walker", 27.1, 30.5 - 1.0, { seed: 3400, move: 1 });
        const b = put("runner", 27.9, 30.5 - 1.1, { seed: 3401, move: 1 });
        const c = put("lanky", 27.0, 30.5 - 1.25, { seed: 3402, move: 1 });
        const d = put("screamer", 28.0, 30.5 - 1.26, { seed: 3403, move: 1 });
        const stepJ = (f) => {
          [a, b, c, d].forEach((z) => (z.gait = (z.gait + 0.047) % 1));
          d.y = 30.5 - (f % 2 ? 1.24 : 1.26); // nearer than c every other frame, by a hair
          frame();
        };
        stepJ(0);
        draws = [];
        for (let f = 1; f <= 12; f++) stepJ(f);
        const lodsOf = (z) => [...new Set(draws.filter((x) => x.seed === z.seed).map((x) => x.lod))];
        ok(draws.filter((x) => x.seed === c.seed).length === 12 && lodsOf(c).join() === "0", `a near walker swapped out by one a hair nearer: drawn ${draws.filter((x) => x.seed === c.seed).length} times, lods ${lodsOf(c)}`);
        ok(!lodsOf(d).includes(0), `a walker a hair nearer every other frame took the near place: lods ${lodsOf(d)}`);
        d.y = 30.5 - 1.05;
        frame();
        draws = [];
        for (let f = 0; f < 6; f++) {
          [a, b, c, d].forEach((z) => (z.gait = (z.gait + 0.047) % 1));
          frame();
        }
        ok(draws.filter((x) => x.seed === d.seed && x.lod === 0).length === 6 && !lodsOf(c).includes(0), `a walker clearly nearer did not take the near place (${lodsOf(d)} / ${lodsOf(c)})`);
      }
    }
    // the governor: it starts on the defaults (LIVE_START); slow frames step it down a row at a time, in the spec's
    // order (far ones less often, fewer redraws, a lower resolution, less detail), never below the last row; fast
    // frames step it back up, past the defaults to the richest row (the first design's settings) on a fast machine;
    // a row it could not hold takes twice as long to climb back to each time, up to GOV_BACKOFF x
    {
      const was = [I.planeRes, I.renderN, I.renderMs, I.frameMs, I.liveDrawn, I.liveShown];
      const fresh = () => {
        I.renderN = 0;
        I.renderMs = null;
        I.frameMs = null;
        I.liveLevel = null;
        I.liveUpWait = null;
      };
      // (what the frames drew: a crowd on screen, ten of them redrawn; only such frames count)
      const crowdOn = () => {
        I.liveShown = 30;
        I.liveDrawn = 10;
      };
      I.planeRes = 3; // (the floor's own step is checked above)
      fresh();
      // frames with no live walkers on screen (a calm yard, an empty room) move it neither way, and leave its runs of
      // slow and fast frames as they were; nor does a fast frame with fewer than liveNear on screen count to climb
      I.liveShown = I.liveDrawn = 0;
      for (let i = 0; i < 2000; i++) I.adaptQuality(2, 16);
      ok(I.liveLevel === I.LIVE_START, `2000 fast frames with no walkers on screen moved the governor to row ${I.liveLevel} (want ${I.LIVE_START})`);
      for (let i = 0; i < 2000; i++) I.adaptQuality(40, 60);
      ok(I.liveLevel === I.LIVE_START, `2000 slow frames with no walkers on screen moved the governor to row ${I.liveLevel} (want ${I.LIVE_START})`);
      fresh();
      I.liveShown = I.liveDrawn = I.LIVE_NEAR - 1;
      for (let i = 0; i < 4000; i++) I.adaptQuality(2, 16);
      ok(I.liveLevel === I.LIVE_START, `4000 fast frames with ${I.liveShown} walkers on screen (under ${I.LIVE_NEAR}) climbed the governor to row ${I.liveLevel}`);
      fresh();
      crowdOn();
      for (let i = 0; i < I.QUALITY_WAIT + 1 + I.GOV_WAIT - 20; i++) I.adaptQuality(40, 60);
      const slowRun = I.liveSlowN;
      I.liveShown = I.liveDrawn = 0;
      for (let i = 0; i < 50; i++) I.adaptQuality(40, 60);
      ok(I.liveSlowN === slowRun && I.liveLevel === I.LIVE_START, `frames with no walkers on screen changed the governor's run of slow frames (${slowRun} -> ${I.liveSlowN}, row ${I.liveLevel})`);
      crowdOn();
      for (let i = 0; i < 20; i++) I.adaptQuality(40, 60);
      ok(I.liveLevel === I.LIVE_START + 1, `slow frames with walkers, a calm between, did not add up to a step down (row ${I.liveLevel})`);
      fresh();
      I.adaptQuality(5, 16);
      ok(I.liveLevel === I.LIVE_START, `a fresh governor starts on row ${I.liveLevel}, not the defaults (${I.LIVE_START})`);
      crowdOn(); // (from here on, every frame drew a crowd)
      const rows = I.LIVE_LEVELS;
      const S0 = I.LIVE_START;
      const keys = ["near", "farLod", "far", "max", "maxPx", "scale", "lodPx"];
      const changed = (a, b) => keys.filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
      const flat = [];
      for (let i = S0 + 1; i < rows.length; i++) flat.push(changed(rows[i - 1], rows[i]).join("+"));
      ok(JSON.stringify(flat) === JSON.stringify(["far", "max", "max", "scale", "lodPx"]), `below the defaults the governor's rows step ${JSON.stringify(flat)}, not far, max, max, scale, lodPx`);
      const R = rows[S0];
      ok(R.near === I.LIVE_NEAR && R.farLod === I.FAR_LOD && R.far === I.FAR_EVERY && R.max === I.LIVE_RENDERS_MAX && R.maxPx === I.LIVE_MAX_PX && R.scale === 1 && R.lodPx === I.LOD_PX, "the governor's starting row is not the defaults");
      ok(S0 > 0 && rows[0].max >= 24 && rows[0].maxPx >= 400 && rows[0].farLod === 0 && rows[0].far <= I.FAR_EVERY && rows[0].near > I.LIVE_NEAR, `the governor's richest row is not the first design's settings (24 redraws, 400 px, full detail): ${JSON.stringify(rows[0])}`);
      const cheaper = (r, q) => r.near <= q.near && r.farLod >= q.farLod && r.far >= q.far && r.max <= q.max && r.maxPx <= q.maxPx && r.scale <= q.scale && r.lodPx[0] >= q.lodPx[0] && changed(r, q).length > 0;
      ok(rows.every((r, i) => !i || cheaper(r, rows[i - 1])), "a governor row is not cheaper than the one before it");
      ok(rows.every((r) => r.near >= 1 && r.max > r.near), "a governor row draws no near walkers every frame, or leaves no room past them");
      // slow: down from the defaults to the last row, a row at a time
      const levels = [I.liveLevel];
      let n = 0;
      for (; n < 4000 && I.liveLevel < rows.length - 1; n++) {
        I.adaptQuality(40, 60);
        if (levels[levels.length - 1] !== I.liveLevel) levels.push(I.liveLevel);
      }
      ok(JSON.stringify(levels) === JSON.stringify(rows.map((r, i) => i).slice(S0)), `slow frames stepped the governor through ${JSON.stringify(levels)}`);
      ok(n <= I.QUALITY_WAIT + I.GOV_WAIT * (rows.length - 1 - S0) + 2, `the governor took ${n} slow frames to reach its last row`);
      const L = rows[rows.length - 1];
      ok(I.liveNear === L.near && I.liveFarLod === L.farLod && I.liveFar === L.far && I.liveMax === L.max && I.liveMaxPx === L.maxPx && I.liveScale === L.scale && I.liveLodPx === L.lodPx, "the last row's settings are not in place");
      for (let i = 0; i < 500; i++) I.adaptQuality(40, 60);
      ok(I.liveLevel === rows.length - 1, "still slow, the governor left its last row");
      // a frame or two fast in a slow run does not step it up; staying fast does, one row at a time, to the top
      I.adaptQuality(1, 16);
      ok(I.liveLevel === rows.length - 1, "one fast frame stepped the governor up");
      const up = [I.liveLevel];
      for (let i = 0; i < 20000 && I.liveLevel > 0; i++) {
        I.adaptQuality(2, 16);
        if (up[up.length - 1] !== I.liveLevel) up.push(I.liveLevel);
      }
      ok(JSON.stringify(up) === JSON.stringify(rows.map((r, i) => i).reverse()), `fast frames stepped the governor up through ${JSON.stringify(up)}`);
      ok(I.liveNear === rows[0].near && I.liveFarLod === rows[0].farLod && I.liveMax === rows[0].max && I.liveMaxPx === rows[0].maxPx && I.liveScale === 1, "on its richest row, the governor's settings are not that row's");
      // too slow up there: it steps back down; each time it climbs back to a row it had to leave, it waits longer
      const climbs = [];
      for (let k = 0; k < 5; k++) {
        for (let i = 0; i < 1000 && I.liveLevel === 0; i++) I.adaptQuality(40, 60);
        let m = 0;
        for (; m < 20000 && I.liveLevel > 0; m++) I.adaptQuality(2, 16);
        climbs.push(m);
      }
      const smooth = 200; // fast frames before the smoothed times are fast again
      ok(climbs.every((m, k) => m >= Math.min(I.GOV_BACKOFF, 2 ** (k + 1)) * I.GOV_WAIT_UP && m <= Math.min(I.GOV_BACKOFF, 2 ** (k + 1)) * I.GOV_WAIT_UP + smooth), `climbing back to a row it had to leave took ${JSON.stringify(climbs)} fast frames (want ${I.GOV_WAIT_UP} x 2, 4, 8 ... up to ${I.GOV_BACKOFF})`);
      // in between (neither slow nor fast) it holds
      I.setLiveLevel(S0 + 2);
      for (let i = 0; i < 1000; i++) I.adaptQuality(10, 20);
      ok(I.liveLevel === S0 + 2, `frames neither slow nor fast moved the governor (${I.liveLevel})`);
      fresh();
      I.setLiveLevel(S0);
      [I.planeRes, I.renderN, I.renderMs, I.frameMs, I.liveDrawn, I.liveShown] = was;
      I.sizePlane();
    }
    I.stop();
    ok(I.livePool.size === 0, "leaving the yard kept walker canvases");

    /* the cabin: the tall kinds inside stay under its ceiling (Interior.indoorAt) */
    I.enterYard({ firstCalm: 999 });
    I.stop();
    let cabin = null;
    for (let y = 0; y < I.gh && !cabin; y++) for (let x = 0; x < I.gw && !cabin; x++) if (I.indoorAt(x + 0.5, y + 0.5) && !I.solidAt(x + 0.5, y + 0.5)) cabin = [x + 0.5, y + 0.5];
    ok(!!cabin, "no floor inside the cabin to test");
    if (cabin) {
      clear();
      Object.assign(p0(), { x: cabin[0], y: cabin[1], hp: 1e9, maxHp: 1e9 });
      kinds.forEach((type) => {
        const z = I.makeWalker(type, cabin[0], cabin[1], 1);
        ok(I.walkerSprite(z, false).scale <= I.CEIL_CAP + 1e-9 && I.walkerHeight(z) <= I.CEIL_CAP + 1e-9, `in the cabin: a ${type} stands ${I.walkerSprite(z, false).scale} tiles, over its ceiling`);
      });
      lookLongest();
      draws = [];
      crowd("in the cabin");
    }
    I.stop();
    ok(dimmedLive === 0, `a live walker's canvas went through Draw3.dim or dimOwn ${dimmedLive} times (a frozen walker and a leak)`);
    ok(I.livePool.size === 0 && !(I.liveSpare || []).length, "Interior.stop() kept walker canvases");
    I.dropSceneCaches();
  } finally {
    W3.draw = drawWas;
    sb.document.createElement = makeWas;
    D.dim = dimWas;
    I.dimOwn = dimOwnWas;
    I.ctx.fillRect = fillWas;
    W.SETTINGS.walkerGore = goreWas;
    I.liveUpWait = null;
    I.setLiveLevel(I.LIVE_START);
    ctxMath.random = realRandom;
    I.walkers.length = 0;
    I.fallen.length = 0;
    I.blood.length = 0;
  }
} catch (e) {
  err(`live walkers: ${e.stack.split("\n").slice(0, 4).join(" | ")}`);
}
// (its own OK line, here: the summary at the end of the file is shared with other sections)
if (errors.length === liveErrors0) console.log(`OK: live walkers: ${liveChecked} checks (every kind in every state drawn in a building, the yard and the cabin; canvases reused and let go; walls hide; ceilings cap; poses ease; the fallen fade; no Draw3.dim; still walkers drawn once; the redraw cap, the near ones and the governor; turning back to a crowd is no burst; the health bar; blood only with gore, its spray from the chest as drawn).`);

/* ---------- June's first-run tutorial (js/tutorial.js) ----------
   Last in the file, so nothing it leaves behind can touch the checks above. The cards go to a stand-in view that
   records them; the clock is ours (Got it arms after TUNE.armMs). A frame runs only while the scene runs and is not
   paused, as in the real loop. The yard part: the hold (no wave, no bell, no Pip, no favors, the van waits and June
   says what is next), the steps (done early counts, the dog does not), the practice walker (slow, hurts a little,
   never below half, never at the fence or the cabin, no scrap), the release into the normal first calm, progress
   kept at once per save slot, a quit and a return, the screen cards once each, the gates, replay, the scene
   boundary, the hooks in the source, and liveness: seeded random histories, then a good player who must get out. */
{
  const T = ZSR.Tutorial;
  const hooks0 = I.hooks;
  const view0 = T.view;
  const now0 = T.now;
  const ctxMath = vm.runInContext("Math", sb);
  const realRandom = ctxMath.random;
  let clock = 1e6;
  let left = 0; // times the van left the yard (hooks.onVan)
  let open = null; // the card up in the stand-in view
  let twice = 0; // a card asked of the view while another was up
  let shown = [];
  let lastTry = null;
  let lastArrow = null;
  // a small seeded generator: the engine's dice (sandbox Math.random) and the random histories play the same every run
  const mulberry32 = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  try {
    if (!T) throw new Error("js/tutorial.js did not define ZSR.Tutorial");
    ctxMath.random = mulberry32(2026);
    T.now = () => clock;
    T.view = {
      card(m) {
        if (open) twice++;
        open = m.id;
        shown.push(m.id);
        return true;
      },
      hideCard() {
        open = null;
      },
      tryPanel(m) {
        lastTry = m;
      },
      arrow(p) {
        lastArrow = p;
      },
      pulse() {},
    };
    I.hooks = Object.assign({}, hooks0, { onVan: () => left++, onDeath: undefined });
    const FIRST = W.DEFENSE.firstCalmSeconds;
    const frames = (s) => {
      for (let t = 0; t < s - 1e-9; t += 0.05) {
        if (!I.running) return; // the scene is over (a death): the real loop stops too
        if (!I.paused) I.update(0.05);
      }
    };
    const got = (what) => {
      clock += 1000;
      if (!T.press()) err(`tutorial: Got it did nothing${what ? " on the " + what + " card" : ""}`);
    };
    const crewId = Object.keys(W.CREW)[0];
    const offerStub = () => ({ kind: "quest", def: { id: "x" } });

    // 1. a new save has done nothing
    S.newGame(1, "Tutorial");
    if (S.settings.tutorial != null || T.done("walk")) err(`tutorial: a new save starts with steps done (${JSON.stringify(S.settings.tutorial)})`);

    // 2. home: the hold engages with a fresh calm (not the 30 s a road trip back gives)
    I.enterYard({ firstCalm: 30 });
    T.enter("yard");
    if (!I.yardHold) err("tutorial: the yard part did not hold the waves");
    if (I.phase.kind !== "calm" || I.phase.t !== FIRST) err(`tutorial: the hold did not start a fresh first calm (${I.phase.kind}, ${I.phase.t} s; want ${FIRST})`);

    // 3. the first card after a moment; Got it does nothing while it arms, then the game runs again
    frames(1);
    if (shown[shown.length - 1] !== "walk" || !I.paused) err(`tutorial: the walk card did not come up and pause the yard (shown ${shown.join(",")}, paused ${I.paused})`);
    clock += 100;
    if (T.press()) err("tutorial: Got it worked before the card armed");
    got("walk");
    if (I.paused || I.eatClick !== true) err(`tutorial: after Got it the yard should run and eat the next click (paused ${I.paused}, eatClick ${I.eatClick})`);
    // the click after a card: eaten only when it is the one that takes the mouse back (pointer not locked yet)
    {
      const heard = {};
      const cv = element("canvas");
      cv.addEventListener = (type, fn) => (heard[type] = fn);
      const c0 = I.canvas;
      const docAdd = sb.document.addEventListener;
      sb.document.addEventListener = (type, fn) => (heard["doc:" + type] = fn);
      I.canvas = cv;
      I.bind(); // the real handlers, on a canvas (and a document) that hand them to us (window listeners do nothing here)
      I.canvas = c0;
      sb.document.addEventListener = docAdd;
      const down = (locked) => {
        I.locked = locked;
        I.mouseDown = false;
        heard.mousedown({ button: 0, preventDefault: noop });
        const fired = I.mouseDown;
        I.mouseDown = false;
        I.locked = false;
        return fired;
      };
      if (!heard.mousedown) err("tutorial: no mousedown handler on the view");
      else {
        I.eatClick = true;
        if (down(false)) err("tutorial: the click that takes the mouse back after a card fired the gun");
        if (I.eatClick) err("tutorial: the eaten click did not clear eatClick");
        I.eatClick = true;
        if (!down(true)) err("tutorial: with the mouse already taken by Got it, the first click after a card did not fire");
        if (!down(false)) err("tutorial: a plain click no longer fires");
      }
      // Got it asks for the mouse; a P pressed at once pauses before the lock lands. That late lock goes straight back
      // (the pause menu would have no mouse), and giving it back pauses nothing
      const lockChange = heard["doc:pointerlockchange"];
      if (!lockChange) err("tutorial: no pointerlockchange handler on the document");
      else {
        let exits = 0;
        let pauses = 0;
        const h0 = I.hooks;
        I.hooks = Object.assign({}, h0, { onPause: () => pauses++ });
        sb.document.exitPointerLock = () => exits++;
        I.paused = true;
        sb.document.pointerLockElement = cv;
        lockChange();
        if (exits !== 1) err("tutorial: a pointer lock that landed while paused was kept (the pause menu would have no mouse)");
        sb.document.pointerLockElement = null;
        lockChange();
        I.paused = false;
        if (pauses || I.locked) err(`tutorial: giving back a late pointer lock paused the game (${pauses}) or left it locked (${I.locked})`);
        delete sb.document.exitPointerLock;
        I.hooks = h0;
        I.releasing = false;
      }
    }
    frames(0.05);
    if (!lastTry || !lastTry.rows || lastTry.rows.length !== T.YARD_STEPS.length + 1 || lastTry.rows[0].state !== "now") err(`tutorial: the "Now you try" checklist is wrong ${JSON.stringify(lastTry)}`);
    else if (lastTry.line !== T.words().walk.try) err(`tutorial: the try line is "${lastTry.line}"`);

    // 4. the hold holds: no countdown, no wave, shots and the bell change nothing, Pip never calls it
    const t0 = I.phase.t;
    frames(200);
    if (I.phase.kind !== "calm" || I.phase.t !== t0 || I.walkers.length) err(`tutorial: the held calm moved (${I.phase.kind}, ${I.phase.t} s, ${I.walkers.length} walkers)`);
    if (I.hud.phase.textContent !== "QUIET") err(`tutorial: the phase box shows "${I.hud.phase.textContent}" in the held calm (no countdown)`);
    I.yardNoise(20);
    if (I.phase.t !== t0) err("tutorial: shots shortened the held calm");
    I.houseInteract({ kind: "spot", obj: "bell", x: 0, y: 0 });
    if (I.phase.forced || I.phase.t !== t0) err("tutorial: the dinner bell rang during the basics");
    if (!/after the basics/.test(I.houseHint({ kind: "spot", obj: "bell" })) || !/after the basics/.test(I.yardHint({ kind: "van" }))) err("tutorial: the bell or van hint does not say it waits for the basics");
    I.phase.next = { size: "some", sides: ["n"] };
    I.phase.t = 5;
    I.crewLookout();
    if (I.phase.called) err("tutorial: Pip called a held wave");
    I.phase.t = t0;

    // 5. the van waits, and June says what is next
    I.yardInteract({ kind: "van" });
    if (left !== 0) err("tutorial: the van left before the basics were done");
    if (!/: .*Next, /.test(I.hud.toast.textContent)) err(`tutorial: E at the van says "${I.hud.toast.textContent}" (June should say what is next)`);

    // 6. steps done early count; talking to the dog does not
    T.note("bag");
    I.talk = { id: "dog", panel: { key: "tutorial-dog" } }; // a bubble as js/crew.js opens it (only what is read here)
    frames(0.05);
    I.talk = null;
    if (T.done("talk")) err("tutorial: talking to the dog counted as talking to the crew");
    I.talk = { id: crewId, panel: { key: "tutorial-crew" } };
    frames(0.05);
    I.talk = null;
    if (!T.done("bag") || !T.done("talk")) err(`tutorial: steps done early did not count (${T.list().join(",")})`);

    // 7. the crew's favors wait for the basics
    {
      const offer0 = S.offer;
      S.offer = offerStub;
      const held = I.crewAction(crewId);
      I.yardHold = false;
      const free = I.crewAction(crewId);
      I.yardHold = true;
      S.offer = offer0;
      if (held !== null) err("tutorial: a crew card was offered during the basics");
      if (!free) err("tutorial: the favor stub never showed (the check above proves nothing)");
    }

    // 8. walk and look: done by walking and turning; the cards for steps already done are skipped
    for (let i = 0; i < 80; i++) {
      I.keys.w = true;
      I.player.a += 0.05;
      if (!I.paused) I.update(0.05);
    }
    I.keys.w = false;
    if (!T.done("walk")) err("tutorial: walking and turning did not finish the walk step");
    frames(2);
    if (shown.join(",") !== "walk,shoot") err(`tutorial: the cards shown were ${shown.join(",")}; want walk,shoot (bag and talk were done early)`);

    // 9. the practice walker: one, slow, a little bite, no scrap, inside the fence on the player's side of the walls
    got("shoot");
    const practice = I.walkers.filter((w) => w.practice);
    const z = practice[0];
    const F = [];
    W.YARD.grid.forEach((row, y) => row.split("").forEach((ch, x) => ch === "F" && F.push([x, y])));
    const inFence = (w) => w.x > Math.min(...F.map((f) => f[0])) && w.x < Math.max(...F.map((f) => f[0])) + 1 && w.y > Math.min(...F.map((f) => f[1])) && w.y < Math.max(...F.map((f) => f[1])) + 1;
    if (practice.length !== 1) err(`tutorial: ${practice.length} practice walkers after the shoot card; want 1`);
    else {
      if (z.type !== T.PRACTICE.type) err(`tutorial: the practice walker is a ${z.type}, want ${T.PRACTICE.type}`);
      if (z.speed > W.WALKER_TYPES[T.PRACTICE.type].speed * (1 + I.SPEED_JITTER) * T.PRACTICE.speed + 1e-9) err(`tutorial: the practice walker is not slow (${z.speed})`);
      if (z.dps !== 0 || z.scrap !== 0 || z.dmg !== T.PRACTICE.bite) err(`tutorial: the practice walker claws (${z.dps}), pays scrap (${z.scrap}) or bites too hard (${z.dmg})`);
      if (I.solidForPlayer(z.x, z.y) || !inFence(z)) err(`tutorial: the practice walker came in at ${z.x},${z.y}, not on open ground inside the fence`);
      if (I.indoorAt(z.x, z.y) !== I.indoorAt(I.player.x, I.player.y)) err("tutorial: the practice walker came in on the other side of the cabin walls");
      if (lastTry && lastTry.line !== T.words().shoot.try) err(`tutorial: the shoot try line is "${lastTry && lastTry.line}"`);
    }

    // 10. it hurts a little, never below half health, and never touches the fence or the cabin
    if (z) {
      const fence0 = JSON.stringify(I.fence);
      const house0 = JSON.stringify(I.houseState());
      const p = I.player;
      const floor = Math.ceil(p.maxHp * T.PRACTICE.floor);
      let low = p.hp;
      for (let t = 0; t < 60; t += 0.05) {
        z.x = p.x + 0.5;
        z.y = p.y;
        if (!I.paused) I.update(0.05);
        low = Math.min(low, p.hp);
      }
      if (!(low < p.maxHp) || low < floor || !I.running) err(`tutorial: the practice walker's bites took health to ${low} (want under ${p.maxHp}, never under ${floor})`);
      if (JSON.stringify(I.fence) !== fence0 || JSON.stringify(I.houseState()) !== house0) err("tutorial: the practice walker damaged the fence or the cabin");
      p.hp = 40;
      let low2 = p.hp;
      for (let t = 0; t < 10; t += 0.05) {
        z.x = p.x + 0.5;
        z.y = p.y;
        if (!I.paused) I.update(0.05);
        low2 = Math.min(low2, p.hp);
      }
      if (low2 < 40) err(`tutorial: below half health a practice bite still hurt (${low2})`);
    }

    // 11. down: the step is done, and it paid nothing
    const scrap0 = S.save.scrap;
    if (z) I.hurtWalker(z, 999);
    frames(0.2);
    if (!T.done("shoot")) err("tutorial: putting the practice walker down did not finish the shoot step");
    if (S.save.scrap !== scrap0) err("tutorial: the practice walker paid scrap");

    // 12. the last basic lets the yard go: the normal first calm, the ready card, then the van
    T.note("computer");
    if (I.yardHold || I.phase.t !== FIRST) err(`tutorial: the last basic did not end the hold with a fresh first calm (hold ${I.yardHold}, ${I.phase.t} s)`);
    frames(2);
    if (shown[shown.length - 1] !== "ready") err(`tutorial: no ready card after the basics (shown ${shown.join(",")})`);
    got("ready");
    if (!T.done("ready")) err("tutorial: Got it on the ready card did not mark it");
    frames(1);
    if (!(I.phase.t < FIRST)) err("tutorial: the first calm does not count down after the basics");
    if (!lastTry || lastTry.line !== T.words().ready.try || lastTry.rows[lastTry.rows.length - 1].state !== "now" || lastTry.rows.slice(0, -1).some((r) => r.state !== "done")) err(`tutorial: the van line is wrong after the basics ${JSON.stringify(lastTry)}`);
    if (lastArrow && lastArrow.label !== T.words().arrow.van) err(`tutorial: the arrow points at "${lastArrow.label}", not the van`);
    I.yardInteract({ kind: "van" });
    if (left !== 1) err("tutorial: the van did not leave once the basics were done");

    // 13. kept at once, per save slot; an old slot without the field has done nothing
    const slot = S.activeSlot();
    if (!String(sb.localStorage.getItem("zs.settings." + slot)).includes('"ready"')) err("tutorial: progress was not written at once to the slot's settings");
    S.loadSave(slot);
    if (!T.done("ready")) err("tutorial: progress was lost on loading the save");
    S.newGame(2, "Other");
    if (T.done("walk")) err("tutorial: a second player's new save shares the first one's progress");
    sb.localStorage.setItem("zs.settings.2", JSON.stringify({ level: 3 }));
    S.loadSave(2);
    if (T.done("walk")) err("tutorial: a slot from before the tutorial counts steps as done");
    S.loadSave(slot);
    if (!T.done("walk")) err("tutorial: the first player's progress did not come back");
    S.deleteSlot(2);

    // 14. a quit mid-yard: the steps done stay done; the next stay starts at the first one left, with its card
    S.settings.tutorial = ["walk", "bag"];
    S.saveSettings();
    shown = [];
    I.enterYard({});
    T.enter("yard");
    frames(1);
    if (shown[shown.length - 1] !== "shoot" || !I.yardHold) err(`tutorial: a return to the yard did not start at the shoot step (shown ${shown.join(",")}, hold ${I.yardHold})`);
    got("shoot");
    I.stop();
    T.enter(null);
    if (I.yardHold || T.isOpen() || open) err("tutorial: quitting left the hold or a card behind");

    // 15. each screen's card once
    shown = [];
    T.enter("map");
    if (shown[0] !== "map") err(`tutorial: no map card (shown ${shown.join(",")})`);
    got("map");
    T.enter("map");
    T.enter("road");
    got("road");
    T.enter("road");
    if (shown.join(",") !== "map,road") err(`tutorial: the map and road cards showed ${shown.join(",")}; want each once`);
    const shop = W.LOCATIONS.find((l) => l.id !== "base" && !l.outdoor && ZSR.LAYOUTS[l.id]);
    S.startTrip();
    I.enter(shop);
    T.enter("building");
    if (shown[shown.length - 1] !== "building" || !I.paused) err("tutorial: the building card did not come up and pause the building");
    got("building");
    if (I.paused || !I.eatClick) err("tutorial: after the building card the building should run and eat the next click");
    I.leave();
    const river = W.LOCATIONS.find((l) => l.outdoor);
    if (river) {
      I.enterRiver(river);
      T.enter("river");
      if (shown[shown.length - 1] !== "river" || !I.paused) err("tutorial: the river card did not come up and pause the bank");
      got("river");
      I.leave();
    }
    S.abandonTrip();
    T.enter(null);
    S.startTrip();
    I.enter(shop);
    T.enter("building");
    if (shown.filter((x) => x === "building").length !== 1 || I.paused) err("tutorial: the building card came back on a second visit");
    I.leave();
    S.abandonTrip();
    T.enter(null);

    // 16. the gates: the action waits for Got it the first time, and runs at once after
    let n = 0;
    T.first("lock", () => n++);
    if (n !== 0 || open !== "lock") err("tutorial: the first lock did not wait for its card");
    got("lock");
    if (n !== 1) err(`tutorial: the lock opened ${n} times after Got it; want 1`);
    T.first("lock", () => n++);
    if (n !== 2 || open) err("tutorial: a later lock waited for a card");
    let d = 0;
    T.first("door", () => d++);
    got("door");
    T.first("door", () => d++);
    if (d !== 2) err(`tutorial: the door note opened ${d} times; want 2`);

    // 17. replay: everything starts over (a fresh frozen calm), but never in a wave
    S.settings.tutorial = T.list().concat(T.YARD_STEPS.filter((s) => !T.done(s)), T.done("ready") ? [] : ["ready"]);
    S.saveSettings();
    I.enterYard({});
    T.enter("yard");
    if (I.yardHold) err("tutorial: a finished yard part held the waves again");
    if (!T.replay("yard")) err("tutorial: Show tutorial again did nothing in the yard");
    if (T.done("walk") || T.done("map") || !I.yardHold || I.phase.t !== FIRST) err(`tutorial: replay did not start over (${T.list().join(",")}, hold ${I.yardHold}, ${I.phase.t} s)`);
    I.phase = { kind: "wave", size: "some", total: 1, spawned: 1, spawnT: 0, t: 0, sides: [] };
    if (T.canReplay("yard")) err("tutorial: Show tutorial again works during a wave");

    // 18. the scene boundary: the hold never outlives the yard, and only the tutorial sets it
    I.yardHold = true;
    I.stop();
    if (I.yardHold) err("tutorial: stopping the scene kept the hold");
    I.enterYard({});
    if (I.yardHold) err("tutorial: entering the yard without the tutorial held the waves");
    I.stop();
    T.enter(null);

    // 19. the hooks are in the source (main.js and the engine are not run here), and the logic stays DOM-free
    {
      const src = (f) => fs.readFileSync(path.join(ROOT, "js", f), "utf8");
      const hooked = src("main.js") + src("building.js");
      Object.keys(T.CARDS).filter((id) => !T.CARDS[id].yard).forEach((id) => {
        if (!new RegExp(`Tutorial\\.(enter|first)\\("${id}"`).test(hooked)) err(`tutorial: no Tutorial.enter("${id}") or Tutorial.first("${id}") in js/main.js or js/building.js: its card never shows`);
      });
      if (!/kind !== "crowbar"[^\n]*Tutorial\.first\("lock"/.test(src("building.js"))) err("tutorial: js/building.js must show the lock card for every lock but the crowbar prompt");
      if (!/Tutorial\.tick\(this, dt\)/.test(src("yard.js"))) err("tutorial: js/yard.js yardUpdate does not call Tutorial.tick");
      if (/\bdocument\./.test(src("tutorial.js"))) err("tutorial: js/tutorial.js touches the DOM (js/tutorial-ui.js does that)");
    }

    // 20. liveness: from any state the real game allows, no soft-lock. 25 seeded histories of 150 random actions
    // (each only when the game allows it: a card up takes nothing but Got it), every invariant checked after each;
    // then a good player, who must get through every step and out in the van.
    {
      const MAX_ERR = 12;
      const e0 = errors.length;
      const bad = (m) => errors.length - e0 < MAX_ERR && err("tutorial liveness: " + m);
      const allBasics = () => T.YARD_STEPS.every((s) => T.done(s));
      let home = null;
      let open4 = []; // open tiles inside the fence (closed doors passable), for teleports
      let hpRef = 0;
      const reenter = (firstCalm) => {
        I.enterYard(firstCalm ? { firstCalm } : {});
        T.enter("yard");
        home = { x: I.player.x, y: I.player.y };
        hpRef = I.player.hp;
        if (!open4.length) {
          const seen = new Set([Math.floor(home.x) + "," + Math.floor(home.y)]);
          const q = [[Math.floor(home.x), Math.floor(home.y)]];
          while (q.length) {
            const [x, y] = q.shift();
            if (!I.solidForPlayer(x + 0.5, y + 0.5)) open4.push([x + 0.5, y + 0.5]);
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
              const nx = x + dx;
              const ny = y + dy;
              const k = nx + "," + ny;
              if (seen.has(k) || nx < 0 || ny < 0 || nx >= I.gw || ny >= I.gh) return;
              if (I.solidForPlayer(nx + 0.5, ny + 0.5) && I.grid[ny][nx] !== "O") return;
              seen.add(k);
              q.push([nx, ny]);
            });
          }
        }
      };
      // the van leaves (the gate is open): the map, its card, and "Back to the yard"
      const leaveByVan = () => {
        I.stop();
        T.enter("map");
        if (T.isOpen()) {
          clock += 1000;
          T.press();
        }
      };
      const talkTo = (c) => {
        let best = null;
        open4.forEach(([x, y]) => {
          const dd = Math.hypot(x - c.x, y - c.y);
          if (!best || dd < best.d) best = { x, y, d: dd };
        });
        if (best) Object.assign(I.player, { x: best.x, y: best.y, a: Math.atan2(c.y - best.y, c.x - best.x) });
        I.crewOpen(c.id);
      };
      let prevHold = false;
      const inv = (what) => {
        if (twice) bad(`${what}: the view was asked for a second card while one was up`);
        twice = 0;
        if (open && T.CARDS[open] && T.CARDS[open].yard && !I.paused) bad(`${what}: the ${open} card is up but the yard runs`);
        if (!!open !== T.isOpen()) bad(`${what}: the view and the tutorial disagree on a card being up`);
        if (I.yardHold && allBasics()) bad(`${what}: the yard is held with every basic done`);
        if (I.yardHold && !prevHold) hpRef = Math.min(hpRef, I.player.hp);
        prevHold = !!I.yardHold;
        if (I.yardHold) {
          if (I.phase.kind !== "calm" || I.phase.t !== FIRST) bad(`${what}: the held calm is ${I.phase.kind} at ${I.phase.t} s`);
          if (I.walkers.length > 1 || I.walkers.some((w) => !w.practice)) bad(`${what}: ${I.walkers.length} walkers in the held yard (${I.walkers.filter((w) => !w.practice).length} not the practice one)`);
          const floor = Math.ceil(I.player.maxHp * T.PRACTICE.floor);
          if (I.player.hp < Math.min(hpRef, floor) - 1e-6) bad(`${what}: health ${I.player.hp} fell under ${Math.min(hpRef, floor)} in the held yard`);
          const offer0 = S.offer;
          S.offer = offerStub;
          const a = I.crewAction(crewId);
          S.offer = offer0;
          if (a !== null) bad(`${what}: a crew card can show while the yard is held`);
        }
        const raw = sb.localStorage.getItem("zs.settings." + S.activeSlot());
        const stored = raw ? JSON.parse(raw).tutorial : null;
        if (JSON.stringify(Array.isArray(stored) ? stored : []) !== JSON.stringify(T.list())) bad(`${what}: the slot's stored progress ${JSON.stringify(stored)} is not ${JSON.stringify(T.list())}`);
      };
      const died = () => {
        if (I.running) return false;
        T.enter(null); // the death screen; then "Reload last save" goes home
        reenter();
        return true;
      };
      let stuck = 0;
      for (let seed = 1; seed <= 25; seed++) {
        const rnd = mulberry32(seed * 7919);
        ctxMath.random = mulberry32(seed * 104729); // the engine's own dice: the same history every run
        S.newGame(1, "Tutorial");
        S.settings.tutorial = null;
        S.saveSettings();
        open4 = [];
        shown = [];
        prevHold = false;
        reenter();
        inv(`seed ${seed} start`);
        for (let k = 0; k < 150; k++) {
          const what = `seed ${seed} action ${k}`;
          const wave = I.phase && I.phase.kind === "wave";
          const r = rnd();
          if (T.isOpen()) {
            clock += Math.floor(rnd() * 900);
            T.press();
          } else if (r < 0.24) frames(0.05 + rnd() * 2.95);
          else if (r < 0.28) {
            clock += Math.floor(rnd() * 900);
            T.press(); // nothing up: nothing happens
          } else if (r < 0.35) T.note("bag");
          else if (r < 0.42) {
            if (!wave) T.note("computer"); // the computer waits in a wave
          } else if (r < 0.51) {
            const [x, y] = open4[Math.floor(rnd() * open4.length)];
            Object.assign(I.player, { x, y, a: rnd() * Math.PI * 2 });
          } else if (r < 0.56) {
            I.keys.w = true; // walk on, turning
            I.player.a += rnd() - 0.5;
            frames(0.25);
            I.keys.w = false;
          } else if (r < 0.62) {
            if (!wave && I.crew.length) talkTo(I.crew[Math.floor(rnd() * I.crew.length)]);
          } else if (r < 0.65) {
            if (I.talk && I.crewTalkEnd) I.crewTalkEnd(true);
          } else if (r < 0.75) {
            const zz = I.walkers.find((w) => w.practice);
            if (zz) I.hurtWalker(zz, 10);
          } else if (r < 0.82) {
            const p = I.player;
            const zz = I.walkers.filter((w) => Math.hypot(w.x - p.x, w.y - p.y) < 8).sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
            if (zz) I.hurtWalker(zz, 15);
          } else if (r < 0.86) {
            I.houseInteract({ kind: "spot", obj: "bell", x: 0, y: 0 }); // held: refused; else the next wave comes now
          } else if (r < 0.875) {
            if (T.canReplay("yard")) T.replay("yard");
          } else if (r < 0.9) {
            T.enter(null); // quit to the title, then Continue
            I.stop();
            reenter();
          } else if (r < 0.94) frames(0.05 + rnd() * 0.95);
          else {
            const l0 = left;
            I.yardInteract({ kind: "van" });
            if (left > l0) {
              if (I.yardHold) bad(`${what}: the van left the held yard`);
              leaveByVan();
              reenter(30); // the map's "Back to the yard"
            }
          }
          died();
          inv(what);
        }
        // the good player: Got it on every card; else the step on screen (and the fence held in a wave)
        let gone = false;
        let k = 0;
        for (; k < 4000 && !(gone && allBasics() && T.done("ready")); k++) {
          if (T.isOpen()) {
            clock += 1000;
            T.press();
          } else if (I.phase.kind === "wave") {
            I.walkers.slice().forEach((w) => I.hurtWalker(w, 1e6));
            frames(0.5);
          } else {
            const step = T.YARD_STEPS.find((s) => !T.done(s)) || "ready";
            if (step === "walk") {
              if (k % 12 === 11) Object.assign(I.player, home); // boxed in somewhere: back out into the yard
              I.keys.w = true;
              I.player.a += 0.3;
              frames(0.25);
              I.keys.w = false;
            } else if (step === "bag") T.note("bag");
            else if (step === "shoot") {
              const zz = I.walkers.find((w) => w.practice);
              if (zz) I.hurtWalker(zz, 10);
              frames(0.1);
            } else if (step === "talk") {
              if (I.crew.length) talkTo(I.crew[0]);
              frames(0.05);
              if (I.talk) I.crewTalkEnd(true);
            } else if (step === "computer") T.note("computer");
            else {
              const l0 = left;
              const held = I.yardHold;
              I.yardInteract({ kind: "van" });
              if (left > l0) {
                if (held) bad(`seed ${seed}: the van left the held yard`);
                gone = true;
                leaveByVan();
              } else frames(0.25);
            }
          }
          if (!gone) died();
          inv(`seed ${seed} good player ${k}`);
        }
        if (!(gone && allBasics() && T.done("ready"))) {
          stuck++;
          bad(`seed ${seed}: a good player could not finish the yard part in 4000 actions (done ${T.list().join(",")}, hold ${I.yardHold}, phase ${I.phase.kind}, card ${open})`);
        }
        I.stop();
        T.enter(null);
      }
      if (stuck) bad(`${stuck} of 25 histories soft-locked`);
    }
  } catch (e) {
    err(`tutorial: ${e.stack.split("\n").slice(0, 4).join(" | ")}`);
  } finally {
    ctxMath.random = realRandom;
    I.yardHold = false;
    I.hooks = hooks0;
    if (T) {
      T.view = view0;
      T.now = now0;
      T.enter(null);
    }
  }
}

if (errors.length) {
  errors.forEach((e) => console.log("ERROR " + e));
  console.log(`\n${errors.length} engine problem(s).`);
  process.exit(1);
}
console.log(`OK: engine entered ${entered} buildings and the yard: landmarks, footprints, start, decor, walkers, frames, the M map, exploring kept, guns on the floor, every gun mod and van-gun step visible, the story notes, keys, stashes and signs in every building, every yard plot's sign, the cabin (every room, note and spot, a raid, a siege, a save), the breach rule (3/6/12/30 steps, a mend, a corner hole, raiders and wreckers, two holes), wreckers (the builds, the van's floor, provoked, Can't die), wrecked builds and their repairs, a walker reaching you from all ${wreckSpotsTried} wreck spots, and River Landing (the pole, its tag, a cast, a bite, a catch, a propped pole, the cap, fish as food), and June's first-run tutorial (the hold, the gate, the practice walker, the cards, replay, 25 seeded histories with no soft-lock), and ${kindsChecked} walker kinds (stats, spawned in front of you in a building, the yard and the river, the scream, downed walkers and blood, heading, gait, the river's and the alarm's kinds, the alarm's cap, a return visit), and ${countsChecked} checks that walkers are never counted (no HUD box, the wave label, the river's toast), the scream's toast, kinds met, and no bite round a corner.`);
