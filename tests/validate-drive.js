#!/usr/bin/env node
/* Drives the real road code (js/game.js on js/streets.js) headless, with the page stubbed out:
   - every ordered pair of places, slowest and fastest van, a driver who gets into the right lane
     a second before each stop line: arrives first time, the van and the camera never step backward, turns end;
   - a driver who never touches the keys: never turns off at a side street or a driveway
     (the left lane goes straight on), so the first wrong way is a junction or the destination;
   - a wrong lane on purpose: the fade, the wrong-turn panel (the drive holds until a choice), then
     "try again" starts the drive over with the trip's miles, walkers and scrap kept, and the next try arrives;
   - every drive on the angled camera (js/perspective.js; the old flat camera and its top-down walkers are gone):
     screen and world map back onto each other; the roof gun's shot flies straight at the pointer on screen (at its
     own height), whichever way it points, at either engine; a walker clicked anywhere on its picture is hit, walking
     or not, ahead or aside, and with Spread Shot every barrel's shot hits it; walkers stay outside the van and hit
     it; the van parks short of the grocery's wall;
   - the angled camera's whole frame drawn on a recording 2D context (no WebGL: the 2D ground): every kind of
     walker live (Walker3D), a scream and its frenzy, clawing, hurt (health bars), shot, downed, gore on and off:
     no exceptions, no NaN, and over the sign only this frame's pictures, never a shadow or a glow; night's dark
     drawn again only when what it shows moves, its beam down the van's own heading; fog's view short and its haze
     thick near; the sign and the lane hint off the road's edges on the screen; the minimap's arrow up and its fade
     only for a place in view; the title screen and the garage's preview a still angled scene, drawn on change (every
     paint job); the van the one 3D van (js/van3d.js) through the road's own camera, lit by the buildings' light,
     flashed when hit, dented by the trip's health, in every look, the roof gun standing on its roof; the workbench's
     van the same model from its side, in the old picture's spot;
   - every turn in the city comfortable (the view's spin, its jolt and its lag, the road after the bend on the screen
     at 1280 x 800 and 960 x 1040), no hops, braking smooth and never before a stop line, Home Base to Corner Grocery as
     built, a sample of wrong ways; the corner shapes' camera is the camera.
   - each place's own building on the angled camera (js/perspective-buildings.js), driven to and parked at on every
     destination: every place has a row (and every row a place), every side street kind its standing end; drawn from
     the approach and parked cameras with no exceptions or NaN, all of it in front of the camera once parked, nothing
     standing where the van parks and nothing drawn over the parked van; walkers stood all round a building drawn in
     front of or behind each of its parts as the parts' walls say; the angled ground leaves out the flat pieces that
     stand (side streets' ends, the gas canopy, River Landing's dock) and keys its squares on it; name boards fade
     with their building and keep out of the HUD's top row; the Water Tower stands past the haze as a silhouette and
     its antenna light shows over the night's dark.
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
// the page, stubbed; the game's files run in this context (a vm sandbox would make every global lookup slow)
Object.assign(globalThis, {
  document: { getElementById: el, querySelector: el, documentElement: { getAttribute: () => "normal" }, addEventListener: noop, hidden: false },
  addEventListener: noop,
  innerWidth: 1280,
  innerHeight: 720,
  devicePixelRatio: 1,
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: noop,
});
// in the page's order: the art (the angled camera's draw test below draws through it), the walkers (after Draw3: they
// register their blood sprites with it), the 3D van (js/model3d.js, js/van3d.js: the road draws it), the road, the
// angled camera, then the interiors (whose governor rows and picture signature the angled camera's walkers use)
// SCALE: a new walker looks file (js/walker3d-looks2.js) goes in this list too (docs/SCALING.md "Add a walker kind"),
// and so does a new landmarks file (js/landmarks3.js: the places' buildings stand some of their pictures outside); the
// crew's looks (js/walker3d-crew.js) load with the walkers, as on the page, and the animals (js/beast3d.js: the dogs,
// live figures in the interiors' pool) after them; the yard's 3D props (js/yardmodels*.js) after the van, as on the page
for (const f of ["js/layouts.js", "js/world.js", "js/upgrades.js", "js/streets.js", "js/sprites.js", "js/sprites3d.js", "js/walker3d.js", "js/walker3d-looks.js", "js/walker3d-crew.js", "js/beast3d.js", "js/beast3d-looks.js", "js/beast3d-looks2.js", "js/model3d.js", "js/van3d.js", "js/yardmodels.js", "js/yardmodels1.js", "js/yardmodels2.js", "js/landmarks1.js", "js/landmarks2.js", "js/game.js", "js/perspective.js", "js/perspective-buildings.js", "js/perspective-art.js", "js/perspective-gl.js", "js/interior.js", "js/modelsprite.js"]) {
  const file = path.join(ROOT, f);
  if (fs.existsSync(file)) vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: f });
}
const ZSR = globalThis.ZSR;
const W = ZSR.WORLD;
const S = ZSR.Streets;
const G = ZSR.Game;
const errors = [];
const err = (c, m) => errors.push(c + ": " + m);

// the parts of the game the road reads
const upgrades = {};
Object.keys(ZSR.Upgrades.DEFS).forEach((k) => (upgrades[k] = 0));
ZSR.State = {
  save: { day: 1, upgrades, scrap: 0 },
  trip: null,
  settings: { aimAssist: false, shake: false },
  effects: () => ({ headlights: true, crates: 0, vanDamage: 1 }),
  isKnown: () => true,
  cheat: () => false, // god mode is off
};
const sounds = []; // what the road asked the speakers for
const met = []; // the kinds the road counted as met (State.meetWalker)
ZSR.State.meetWalker = (type) => met.push(type);
ZSR.Audio = { play: (n) => sounds.push(n), unlock: noop };
let arrived = null;
let wrongTurn = null; // what the road asked the page on a wrong turn
const canvas = Object.assign(el(), { getContext: () => ({ setTransform: noop }) });
G.init(canvas, { onArrive: (to) => (arrived = to), onWrongTurn: (info) => (wrongTurn = info), onDeath: noop, onPause: noop, onPauseKey: noop });

const name = (id) => W.LOCATIONS.find((l) => l.id === id).name;
function start(a, b) {
  ZSR.State.trip = { at: a, vanHp: 1e9, vanMaxHp: 1e9, scrap: 0, walkers: 0, miles: 0 };
  const r = S.route(a, b);
  const L = W.LOCATIONS.find((l) => l.id === b);
  arrived = null;
  wrongTurn = null;
  G.startTrip({ to: b, name: L.name, danger: L.danger, path: r.path });
  G.spawnTimer = 1e9; // no walkers: this is about the road
}
/** Steer toward the lane for `pick(dec)` (an option) when the stop line is under `lead` seconds away; null leaves the keys alone.
    onFrame(before) runs after each frame; returning true stops the drive. */
function drive(pick, lead, onFrame, dt) {
  const step = dt || 1 / 60;
  let t = 0;
  while (G.running && t < 260) {
    const dec = G.upcoming();
    G.keys.left = G.keys.right = false;
    if (dec && !G.turn && pick && (dec.stop - G.van.s) / G.speed < lead) {
      const o = pick(dec);
      if (o) {
        const lane = o.lanes.reduce((best, l) => (Math.abs(S.laneCenter(l, dec.n) - G.van.d) < Math.abs(S.laneCenter(best, dec.n) - G.van.d) ? l : best), o.lanes[0]);
        const tg = S.laneCenter(lane, dec.n);
        G.keys.left = G.van.d > tg + 8;
        G.keys.right = G.van.d < tg - 8;
      }
    }
    const before = { x: G.van.x, y: G.van.y, cx: G.cam.x, cy: G.cam.y };
    G.update(step);
    t += step;
    if (onFrame && onFrame(before)) break;
  }
  return t;
}
const right = (dec) => dec.options.find((o) => o.correct);

/* ---------- every route, a careful driver ----------
   At the slowest van the sign is also drawn every frame (Draw.roadSign recorded, on a 1280 x 800 window with the
   page's HUD): while it shows fully (alpha 0.9 or more) it never moves more than SIGN_JUMP px from one frame to the
   next, through every bend (the lagging camera swings the road's edge across the screen) and as it slides away. */
const ids = W.LOCATIONS.map((l) => l.id);
let routes = 0;
let maxBack = 0;
let turns = 0;
const SIGN_JUMP = 120;
const signLog = { shown: 0, frames: 0, most: 0, jumps: 0 };
{
  const roadSign0 = ZSR.Draw.roadSign;
  const hud0 = G.hudRects;
  const W0 = globalThis.innerWidth;
  const H0 = globalThis.innerHeight;
  let drawn = null;
  const sctx = new Proxy(
    { font: "10px sans-serif" },
    {
      get(o, k) {
        if (k === "measureText") return (t) => ({ width: String(t).length * 0.55 * (parseFloat((/(\d+(\.\d+)?)px/.exec(o.font) || [])[1]) || 10) });
        if (k in o) return o[k];
        if (k === "createLinearGradient" || k === "createRadialGradient") return () => ({ addColorStop: noop });
        return noop;
      },
      set(o, k, v) {
        o[k] = v;
        return true;
      },
    }
  );
  for (const engine of [0, 5]) {
    upgrades.engine = engine; // the slowest and the fastest van
    const signs = engine === 0;
    if (signs) {
      globalThis.innerWidth = 1280;
      globalThis.innerHeight = 800;
      G.resize();
      G.hudRects = () => ({ top: null, row: 54, boxes: [], low: [{ left: 432, right: 848, top: 746 }], mini: { left: 9, top: 63, right: 250, bottom: 234, width: 241, height: 171 } });
      ZSR.Draw.roadSign = (ctx, x, y, sign, lay, alpha) => (drawn = { x, y, alpha });
    }
    for (const a of ids) {
      for (const b of ids) {
        if (a === b) continue;
        const c = `${a} > ${b} (engine ${engine})`;
        start(a, b);
        routes++;
        let back = 0;
        let camBack = 0;
        let wasTurn = false;
        let last = null;
        drive(right, 1.0, (p) => {
          if (signs && G.running) {
            drawn = null;
            G.drawSign(sctx, 1);
            const up = G.upcoming();
            const which = drawn && (up && G.van.s >= up.signAt ? G.next : G.next - 1);
            if (drawn) {
              signLog.frames++;
              if (!last || last.which !== which) signLog.shown++;
              else if (drawn.alpha >= 0.9 && last.alpha >= 0.9) {
                const d = Math.hypot(drawn.x - last.x, drawn.y - last.y);
                signLog.most = Math.max(signLog.most, d);
                if (d > SIGN_JUMP && signLog.jumps++ < 5) err(c, `the sign of decision ${which} moved ${d.toFixed(0)} px in a frame (${last.x.toFixed(0)}, ${last.y.toFixed(0)} to ${drawn.x.toFixed(0)}, ${drawn.y.toFixed(0)}) at ${G.time.toFixed(2)} s${G.turn ? ", in a turn" : ""}`);
              }
            }
            last = drawn && Object.assign({ which }, drawn);
          }
          if (!G.running || G.fade || (G.arrive && G.arrive.parked)) return;
          // forward is the van's heading; a step back is a judder or a spin
          const fx = Math.cos(G.van.heading);
          const fy = Math.sin(G.van.heading);
          back = Math.max(back, -((G.van.x - p.x) * fx + (G.van.y - p.y) * fy));
          camBack = Math.max(camBack, -((G.cam.x - p.cx) * fx + (G.cam.y - p.cy) * fy));
          if (G.turn && !wasTurn) turns++;
          wasTurn = !!G.turn;
        });
        maxBack = Math.max(maxBack, back, camBack);
        if (arrived !== b) err(c, `did not arrive (arrived ${arrived}, attempt ${G.attempt})`);
        else if (G.attempt !== 0) err(c, `needed ${G.attempt + 1} tries in the right lanes`);
        if (back > 0.5) err(c, `the van stepped back ${back.toFixed(2)} px in a frame`);
        if (camBack > 0.5) err(c, `the camera stepped back ${camBack.toFixed(2)} px in a frame`);
      }
    }
    if (signs) {
      ZSR.Draw.roadSign = roadSign0;
      G.hudRects = hud0;
      globalThis.innerWidth = W0;
      globalThis.innerHeight = H0;
      G.resize();
    }
  }
  if (signLog.shown < ids.length * (ids.length - 1)) err("every route", `only ${signLog.shown} signs drawn on ${ids.length * (ids.length - 1)} routes`);
}
upgrades.engine = 0;

/* ---------- a driver who never touches the keys ---------- */
const failedAt = {};
for (const a of ids) {
  for (const b of ids) {
    if (a === b) continue;
    start(a, b);
    let first = null;
    const orig = G.commit;
    G.commit = function (dec) {
      const before = this.attempt;
      const o = dec.options[dec.lanes[S.laneOf(this.van.d, dec.n)]];
      if (!o.correct && first == null) first = dec.kind;
      orig.call(this, dec);
      return before;
    };
    drive(null, 0, () => first != null, 1 / 20);
    G.commit = orig;
    G.stop();
    failedAt[first || "none"] = (failedAt[first || "none"] || 0) + 1;
    if (first === "side") err(`${a} > ${b}`, `left alone, the van turned off at a ${first}`);
  }
}

/* ---------- a wrong lane on purpose: fade, the panel, "try again", tallies kept, then arrive ----------
   (the last two take the drive of a place passed on the way, and a road out of the destination's corner) */
[["base", "watertower"], ["base", "hardware"], ["hospital", "autoshop"], ["school", "base"], ["base", "autoshop", "drive"], ["river", "base", "dest"]].forEach(([a, b, how]) => {
  const c = `${a} > ${b} (wrong ${how || "lane"})`;
  start(a, b);
  const t = ZSR.State.trip;
  t.walkers = 3;
  t.scrap = 7;
  const target = G.drive.decisions.find((d) => (how === "dest" ? d.kind === "dest" : how === "drive" ? d.options.some((o) => o.kind === "drive" && !o.correct) : d.kind === "junction" || d.kind === "dest"));
  if (!target) return err(c, "no decision to get wrong");
  let failed = false;
  let restarted = false;
  let milesAtFail = 0;
  let held = 0;
  let heldS = 0;
  drive((dec) => {
    if (G.attempt === 0 && dec === target) return dec.options.find((o) => !o.correct && (how !== "drive" || o.kind === "drive"));
    return right(dec);
  }, 1.0, () => {
    if (G.fail && !failed) {
      failed = true;
      milesAtFail = t.miles;
    }
    // the panel is up: the road holds still until the player picks; then "try again"
    if (wrongTurn && G.attempt === 0) {
      if (held === 0) {
        heldS = G.van.s;
        if (wrongTurn.origin !== a || !wrongTurn.msg) err(c, `the panel was asked ${JSON.stringify(wrongTurn)}`);
      } else if (G.van.s !== heldS) err(c, "the van moved while the wrong-turn panel was up");
      if (++held === 90) G.retry();
    }
    if (G.attempt === 1 && !restarted) {
      restarted = true;
      if (Math.abs(G.van.s - G.drive.startS) > G.speed / 20 || !G.onMain || G.next !== 0) err(c, "the drive did not start over from the start");
      if (t.walkers !== 3 || t.scrap !== 7 || t.miles < milesAtFail) err(c, "the trip's walkers, scrap or miles were not kept");
    }
  });
  if (!failed) err(c, "the wrong lane did not go wrong");
  if (!wrongTurn) err(c, "the wrong turn never asked the page what next");
  if (!restarted) err(c, "the drive did not start over");
  if (arrived !== b || G.attempt !== 1) err(c, `after starting over: arrived ${arrived}, attempt ${G.attempt}`);
});

/* ---------- road walkers: every kind from the facts (WORLD.WALKER_TYPES), the scream, knockback, reach, blood,
   downed bodies, god mode's spawn ahead of the van ---------- */
{
  const realRandom = Math.random;
  let seedR = 20261015;
  Math.random = () => ((seedR = (seedR * 1664525 + 1013904223) >>> 0) / 4294967296);
  const TYPES = W.WALKER_TYPES;
  const kinds = Object.keys(TYPES);
  const SC = W.SCREAM;
  const PX = G.DIFF.pxPerTile;
  const FALL = G.fallSecs();
  const c = "road walkers";
  const fwd = () => [Math.cos(G.van.heading), Math.sin(G.van.heading)];
  /** Put z at `ahead` px in front of the van and `side` px to its right (world), facing it, still. */
  const place = (z, ahead, side) => {
    const [fx, fy] = fwd();
    z.x = G.van.x + fx * ahead - fy * side;
    z.y = G.van.y + fy * ahead + fx * side;
    z.kx = z.ky = 0;
  };
  const finiteAll = (o) => Object.values(o).every((v) => typeof v !== "number" || Number.isFinite(v));
  // the counts and weights come from the facts: nothing left of the old three-kind tables
  if ("ZOMBIE_TYPES" in G) err(c, "js/game.js still has ZOMBIE_TYPES (the road reads WORLD.WALKER_TYPES[...].road)");
  ["runnerBase", "runnerStep", "bruteBase", "bruteStep"].forEach((k) => k in G.DIFF && err(c, `DIFF.${k} is back (road weights are WALKER_TYPES[...].road.w)`));
  if (!(PX > 0)) err(c, `DIFF.pxPerTile is ${PX}`);
  // every kind comes on the road, at every place's danger, on day 1 and day 20
  for (const day of [1, 20]) {
    ZSR.State.save.day = day;
    for (const L of W.LOCATIONS) {
      if (L.id === "base") continue;
      start("base", L.id);
      const w = G.diff.weights || {};
      const bad = kinds.filter((id) => !(Number.isFinite(w[id]) && w[id] > 0));
      if (bad.length) err(c, `day ${day}, ${L.id} (danger ${L.danger}): no road weight for ${bad.join(", ")}`);
      if (Object.keys(w).some((id) => !TYPES[id])) err(c, `day ${day}, ${L.id}: a road weight for an unknown kind (${Object.keys(w).join(", ")})`);
    }
  }
  ZSR.State.save.day = 1;
  // over many spawns from the mix, every kind turns up (danger 5 on day 20 has the most of the rare ones)
  ZSR.State.save.day = 20;
  start("base", "hospital");
  const seenKinds = new Set();
  for (let i = 0; i < 4000; i++) seenKinds.add(G.pickType());
  kinds.forEach((id) => seenKinds.has(id) || err(c, `4000 road picks on day 20 never gave a ${id}`));
  ZSR.State.save.day = 1;

  // god mode's road contract: spawnWalkerAhead(type) puts that kind on the screen ahead of the van and returns it
  start("base", "hospital");
  for (let i = 0; i < 60; i++) G.update(1 / 60);
  met.length = 0;
  kinds.forEach((id) => {
    const z = G.spawnWalkerAhead(id);
    if (!z) return err(c, `spawnWalkerAhead(${id}) found no room on an empty road`);
    if (z.type !== id || G.zombies[G.zombies.length - 1] !== z) err(c, `spawnWalkerAhead(${id}) gave a ${z.type} (or did not add it)`);
    ["r", "speed", "hp", "maxHp", "dmg", "knock"].forEach((k) => (Number.isFinite(z[k]) && z[k] > 0) || err(c, `${id}: ${k} is ${z[k]}`));
    if (z.hp !== Math.round(TYPES[id].hp * G.diff.hpMult)) err(c, `${id}: road health ${z.hp}, not its on-foot health ${TYPES[id].hp} x ${G.diff.hpMult}`);
    if (z.r !== TYPES[id].road.r || z.dmg !== TYPES[id].road.dmg || z.scrap !== TYPES[id].road.scrap || z.reach !== (TYPES[id].road.reach || 0)) err(c, `${id}: its road stats are not WALKER_TYPES.${id}.road`);
    if (z.scream !== !!TYPES[id].scream || z.knock !== TYPES[id].knock) err(c, `${id}: scream / knock not from the facts`);
    const s = G.toScreen(z.x, z.y);
    if (s.x < 0 || s.x > G.W || s.y < 0 || s.y > G.H) err(c, `spawnWalkerAhead(${id}) put it off the screen (${s.x.toFixed(0)}, ${s.y.toFixed(0)})`);
    const [fx, fy] = fwd();
    if ((z.x - G.van.x) * fx + (z.y - G.van.y) * fy < 150) err(c, `spawnWalkerAhead(${id}) did not put it ahead of the van`);
  });
  for (let i = 0; i < G.zombies.length; i++) for (let j = i + 1; j < G.zombies.length; j++) {
    const a = G.zombies[i];
    const b = G.zombies[j];
    if (Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r) err(c, `spawnWalkerAhead put a ${b.type} on top of a ${a.type}`);
  }
  const odd = G.spawnWalkerAhead("zz-unknown");
  if (!odd || odd.type !== kinds[0]) err(c, `spawnWalkerAhead of an unknown kind gave ${odd && odd.type} (a plain ${kinds[0]} expected)`);
  // and they walk, scream, get shot at and go down for two seconds with no NaN anywhere
  G.pointer.seen = true;
  for (let i = 0; i < 120; i++) {
    const z = G.zombies[0];
    if (z) {
      const p = G.toScreen(z.x, z.y);
      Object.assign(G.pointer, { x: p.x, y: p.y, down: true });
    }
    G.update(1 / 60);
    const bad = G.zombies.find((q) => !finiteAll(q)) || G.particles.find((q) => !finiteAll(q)) || G.fallen.find((q) => !finiteAll(q));
    if (bad) {
      err(c, `frame ${i}: not a number in ${JSON.stringify(bad)}`);
      break;
    }
  }
  G.pointer.down = false;
  G.pointer.seen = false;
  kinds.forEach((id) => met.includes(id) || err(c, `a ${id} on the screen was never counted as met (State.meetWalker)`));
  if (met.length > kinds.length + 1) err(c, `${met.length} meetings for ${kinds.length + 1} walkers: a walker is met once (${met.join(", ")})`);
  // god mode's menu on the real road (js/god.js): every kind, by name; Clear walkers clears the road
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, "js/god.js"), "utf8"), { filename: "js/god.js" });
  G.zombies.length = 0;
  kinds.forEach((id) => {
    const said = ZSR.God.scene.spawnWalker(id);
    const a = (/^[aeiou]/i.test(TYPES[id].name) ? "An " : "A ") + TYPES[id].name.toLowerCase();
    if (said !== a + " on the road ahead." || G.zombies[G.zombies.length - 1].type !== id) err(c, `god mode's Spawn walker (${id}) on the road said "${said}"`);
  });
  const cleared = ZSR.God.scene.clearWalkers();
  if (cleared !== kinds.length + " walkers gone." || G.zombies.length || G.fallen.length) err(c, `god mode's Clear walkers on the road said "${cleared}" and left ${G.zombies.length} walkers, ${G.fallen.length} downed`);
  // no room: a wrong turn's dark screen, or a wrecked van
  G.fade = { phase: "choose", t: 0 };
  if (G.spawnWalkerAhead("walker")) err(c, "spawnWalkerAhead placed a walker while the wrong-turn panel was up");
  G.fade = null;

  // the scream: a screamer that sees the van close screams once; every walker within SCREAM.radius tiles speeds up
  start("base", "hospital");
  for (let i = 0; i < 60; i++) G.update(1 / 60);
  G.zombies.length = 0;
  sounds.length = 0;
  const scr = G.spawnWalkerAhead("screamer");
  const kinds2 = kinds.filter((id) => !TYPES[id].scream);
  const near = G.spawnWalkerAhead(kinds2[0]);
  const far = G.spawnWalkerAhead(kinds2[0]);
  if (!scr || !near || !far) err(c, "no room for the scream test");
  else {
    scr.hp = scr.maxHp = 1e6;
    const ahead = SC.spot * PX * 0.6; // seen, and well inside its spot range
    place(scr, ahead, 0);
    place(near, ahead, SC.radius * PX - 80); // inside its radius
    place(far, ahead, -(SC.radius * PX + 60)); // outside it (both still on the screen's edge or near it)
    G.update(1 / 60);
    if (scr.yell !== SC.yell || scr.screamT !== SC.cooldown) err(c, `a screamer ${ahead.toFixed(0)} px ahead, on the screen, did not scream (yell ${scr.yell}, screamT ${scr.screamT})`);
    if (scr.frenzyT !== SC.secs || near.frenzyT !== SC.secs) err(c, `the scream did not speed up the screamer (${scr.frenzyT}) and a walker within ${SC.radius} tiles (${near.frenzyT}): want ${SC.secs}`);
    if (far.frenzyT !== 0) err(c, `a walker past ${SC.radius} tiles sped up too (${far.frenzyT})`);
    if (sounds.filter((n) => n === "scream").length !== 1) err(c, `one scream played ${sounds.filter((n) => n === "scream").length} scream sounds`);
    if (!G.bursts.some((b) => /SKREE/.test(b.text))) err(c, "the scream put up no SKREE! burst");
    // no second scream before the cooldown, one after it (kept on the screen and close; the van stopped, so the
    // drive does not run on to a wrong turn meanwhile)
    const speed0 = G.speed;
    G.speed = 0;
    let n = 1;
    let woreOff = null;
    for (let t = 0; t < SC.cooldown + 0.5; t += 1 / 30) {
      place(scr, ahead, 0);
      scr.cool = 1;
      const was = scr.yell;
      G.update(1 / 30);
      if (woreOff == null && t >= SC.secs + 0.1) woreOff = scr.frenzyT;
      if (scr.yell > was) {
        n++;
        if (t < SC.cooldown - 0.05) err(c, `the screamer screamed again ${t.toFixed(2)} s after its first scream (cooldown ${SC.cooldown})`);
      }
    }
    G.speed = speed0;
    if (n !== 2) err(c, `${n} screams in ${SC.cooldown + 0.5} s (one, then one more once the cooldown is over)`);
    if (woreOff !== 0) err(c, `the frenzy did not wear off after ${SC.secs} s (${woreOff})`);
  }
  // a screamer close but off the screen (behind the van) does not scream
  G.zombies.length = 0;
  const hid = G.spawnWalkerAhead("screamer");
  if (hid) {
    ZSR.Persp.setup(G);
    place(hid, ZSR.Persp.groundY(G.H) - 80, 0); // (groundY: ahead of the camera's spot, level with the van)
    G.update(1 / 60);
    if (hid.yell > 0) err(c, "a screamer off the screen screamed");
  }
  // a frenzy speeds a walker's own way at the van by SCREAM.mult (the van stopped: no keeping up, no scroll)
  {
    G.zombies.length = 0;
    const a = G.spawnWalkerAhead(kinds[0]);
    const b = G.spawnWalkerAhead(kinds[0]);
    if (a && b) {
      const speed0 = G.speed;
      G.speed = 0;
      a.speed = b.speed = 50;
      place(a, 300, -200);
      place(b, 300, 200);
      b.frenzyT = 3;
      const d0a = Math.hypot(a.x - G.van.x, a.y - G.van.y);
      const d0b = Math.hypot(b.x - G.van.x, b.y - G.van.y);
      G.update(0.05);
      const ga = d0a - Math.hypot(a.x - G.van.x, a.y - G.van.y);
      const gb = d0b - Math.hypot(b.x - G.van.x, b.y - G.van.y);
      if (Math.abs(gb / ga - SC.mult) > 0.02) err(c, `a frenzied walker came ${gb.toFixed(2)} px against ${ga.toFixed(2)} (want x${SC.mult})`);
      G.speed = speed0;
    }
  }

  // knockback by kind: one bullet throws an armored walker back less than a plain one, and the bumper too
  const knockOf = (id, how) => {
    G.zombies.length = 0;
    const z = G.spawnWalkerAhead(id);
    z.hp = z.maxHp = 1e6;
    if (how === "shot") {
      place(z, 250, 0);
      // a shot at 45 degrees on the map, so both of the push's parts count (whichever way the van is heading)
      const [fx, fy] = [Math.SQRT1_2, Math.SQRT1_2];
      const v = 1000;
      G.bullets.length = 0;
      G.bullets.push({ x: z.x - fx * v * (1 / 60), y: z.y - fy * v * (1 / 60), vx: fx * v, vy: fy * v, cx: 0, cy: 0, dmg: 1 });
    } else {
      place(z, G.van.h / 2 + z.r * 0.4, 0);
      z.cool = 0;
    }
    G.update(1 / 60);
    return Math.hypot(z.kx, z.ky);
  };
  start("base", "hospital");
  for (let i = 0; i < 60; i++) G.update(1 / 60);
  const byKnock = kinds.slice().sort((a, b) => TYPES[a].knock - TYPES[b].knock);
  const lo = byKnock[0];
  const hi = byKnock[byKnock.length - 1];
  for (const how of ["shot", "ram"]) {
    const kl = knockOf(lo, how);
    const kh = knockOf(hi, how);
    if (!(kl > 0 && kh > 0 && kl < kh)) err(c, `${how}: a ${lo} (knock ${TYPES[lo].knock}) was thrown ${kl.toFixed(1)}, a ${hi} (knock ${TYPES[hi].knock}) ${kh.toFixed(1)}`);
    else if (Math.abs(kl / kh - TYPES[lo].knock / TYPES[hi].knock) > 0.05) err(c, `${how}: knockback ${kl.toFixed(1)} : ${kh.toFixed(1)} is not knock ${TYPES[lo].knock} : ${TYPES[hi].knock}`);
  }

  // reach: a kind with road reach hits the van from further out than one without, at the same distance
  const reacher = kinds.find((id) => TYPES[id].road.reach > 0);
  if (reacher) {
    G.zombies.length = 0;
    const plain = G.spawnWalkerAhead(kinds[0]);
    const long = G.spawnWalkerAhead(reacher);
    const side = G.van.w / 2 + Math.max(plain.r, long.r) * 0.8 + Math.min(TYPES[reacher].road.reach, 8) - 2 + 4;
    [plain, long].forEach((z, i) => {
      z.hp = z.maxHp = 1e6;
      z.cool = 0;
      place(z, 0, i ? side : -side);
    });
    const hp0 = ZSR.State.trip.vanHp;
    G.update(1 / 60);
    if (!(long.cool > 0)) err(c, `a ${reacher} ${side.toFixed(0)} px beside the van did not reach it (road reach ${TYPES[reacher].road.reach})`);
    if (plain.cool > 0) err(c, `a ${kinds[0]} ${side.toFixed(0)} px beside the van reached it`);
    if (!(ZSR.State.trip.vanHp < hp0)) err(c, `the ${reacher}'s reach did no damage`);
  }

  // blood: a hit sprays some with walker gore on, none with it off; never past ROAD_PARTICLE_CAP
  const hitOnce = (id) => {
    G.zombies.length = 0;
    G.particles.length = 0;
    const z = G.spawnWalkerAhead(id);
    z.hp = z.maxHp = 1e6;
    place(z, 250, 0);
    const [fx, fy] = fwd();
    G.bullets.length = 0;
    G.bullets.push({ x: z.x - fx * 1000 / 60, y: z.y - fy * 1000 / 60, vx: fx * 1000, vy: fy * 1000, cx: 0, cy: 0, dmg: 1 });
    G.update(1 / 60);
    return G.particles.filter((p) => p.blood).length;
  };
  if (!(hitOnce(kinds[0]) > 0)) err(c, "a hit with walker gore on sprayed no blood");
  W.SETTINGS.walkerGore = false;
  if (hitOnce(kinds[0]) !== 0) err(c, "a hit with walker gore off sprayed blood");
  W.SETTINGS.walkerGore = true;
  // the van's bumper is a hit too: it flashes, and sprays with gore on (none off), killing or not
  const ramOnce = (kill) => {
    G.zombies.length = 0;
    G.particles.length = 0;
    const z = G.spawnWalkerAhead(kinds[0]);
    z.hp = z.maxHp = kill ? 1 : 1e6;
    place(z, G.van.h / 2 + z.r * 0.4, 0);
    z.cool = 0;
    G.update(1 / 60);
    return { blood: G.particles.filter((p) => p.blood).length, hit: z.hit, rammed: kill ? !G.zombies.includes(z) : z.cool > 0 };
  };
  for (const kill of [false, true]) {
    const how = kill ? "a ram that kills" : "a ram";
    const on = ramOnce(kill);
    if (!on.rammed) err(c, `${how}: setup, the van did not ram the walker`);
    else if (!(on.blood > 0)) err(c, `${how} with walker gore on sprayed no blood`);
    if (!kill && !(on.hit > 0)) err(c, `${how} did not flash the walker`);
    W.SETTINGS.walkerGore = false;
    const off = ramOnce(kill);
    W.SETTINGS.walkerGore = true;
    if (off.blood) err(c, `${how} with walker gore off sprayed blood`);
  }
  {
    G.zombies.length = 0;
    G.particles.length = 0;
    const z = G.spawnWalkerAhead(kinds[0]);
    z.hp = z.maxHp = 1e9;
    let worst = 0;
    for (let i = 0; i < 400; i++) {
      G.blood(z, z.x, z.y, 100, 0, i % 3 === 0);
      G.sparks(z.x, z.y);
      G.dust(z.x, z.y, z.r);
      worst = Math.max(worst, G.particles.length);
      if (i % 20 === 0) G.update(1 / 60);
    }
    if (worst > G.ROAD_PARTICLE_CAP + 12) err(c, `${worst} particles on the road (cap ${G.ROAD_PARTICLE_CAP})`);
  }
  // every hit bleeds with gore on (a short spray on every hit), whatever the kind; a kind with armor (its road
  // row's share) also throws grey sparks off its gear on about that share of its hits that do not kill it, gore on
  // or off; a kind without armor never does, and a killing shot never glances
  {
    const N = 400;
    for (const gore of [true, false]) {
      W.SETTINGS.walkerGore = gore;
      kinds.forEach((id) => {
        G.zombies.length = 0;
        const z = G.addZombie(id, G.van.x, G.van.y - 300);
        const share = TYPES[id].road.armor || 0;
        let dry = 0;
        let glances = 0;
        let killGlances = 0;
        for (let i = 0; i < N; i++) {
          G.particles.length = 0;
          G.blood(z, z.x, z.y, 100, 0, false);
          if (!G.particles.some((p) => p.blood)) dry++;
          if (G.particles.some((p) => p.color === G.SPARK_ARMOR)) glances++;
          G.particles.length = 0;
          G.blood(z, z.x, z.y, 100, 0, true);
          if (G.particles.some((p) => p.color === G.SPARK_ARMOR)) killGlances++;
        }
        if (gore && dry) err(c, `${id}: ${dry} of ${N} hits with walker gore on sprayed no blood`);
        if (!gore && dry !== N) err(c, `${id}: ${N - dry} of ${N} hits with walker gore off sprayed blood`);
        if (!share && glances) err(c, `${id} has no armor (road.armor), but ${glances} of ${N} hits threw grey sparks off its gear`);
        if (share && Math.abs(glances / N - share) > 0.1) err(c, `${id}: ${glances} of ${N} hits glanced off its gear (gore ${gore ? "on" : "off"}; road.armor ${share})`);
        if (killGlances) err(c, `${id}: ${killGlances} killing shots glanced off its gear`);
      });
    }
    W.SETTINGS.walkerGore = true;
    G.zombies.length = 0;
    G.particles.length = 0;
  }
  // a kill: off the road's list, a downed body of its kind for FALL secs, the trip's tally up one
  {
    G.zombies.length = 0;
    G.fallen.length = 0;
    const t = ZSR.State.trip;
    const w0 = t.walkers;
    const s0 = t.scrap;
    const id = kinds[kinds.length - 1];
    const z = G.spawnWalkerAhead(id);
    z.hp = 1;
    place(z, 250, 0);
    const [fx, fy] = fwd();
    G.bullets.length = 0;
    G.bullets.push({ x: z.x - fx * 1000 / 60, y: z.y - fy * 1000 / 60, vx: fx * 1000, vy: fy * 1000, cx: 0, cy: 0, dmg: 5 });
    G.update(1 / 60);
    const f = G.fallen[G.fallen.length - 1];
    if (G.zombies.includes(z)) err(c, "a killed walker is still on the road's list");
    if (!f || f.type !== id || f.seed !== z.seed || Math.abs(f.max - FALL) > 1e-9 || Math.abs(f.life - (FALL - 1 / 60)) > 1e-6) err(c, `a kill left ${JSON.stringify(f)} (want a ${id}, its seed, life ${FALL} counting down)`);
    else {
      // it falls away from the van (the shot's way)
      const d = Math.atan2(Math.sin(f.rot - Math.atan2(fy, fx)), Math.cos(f.rot - Math.atan2(fy, fx)));
      if (Math.abs(d) > 0.5) err(c, `a walker shot from the van falls ${d.toFixed(2)} rad off the shot's way`);
    }
    if (t.walkers !== w0 + 1 || t.scrap !== s0 + TYPES[id].road.scrap) err(c, `a kill made the trip's walkers ${w0} -> ${t.walkers}, scrap ${s0} -> ${t.scrap} (want +1, +${TYPES[id].road.scrap})`);
    for (let i = 0; i < Math.ceil(FALL * 60) + 2; i++) G.update(1 / 60);
    if (G.fallen.length) err(c, `a downed walker is still there ${FALL} s later`);
    // never more than ROAD_FALLEN_MAX bodies at once
    for (let i = 0; i < G.ROAD_FALLEN_MAX + 10; i++) {
      const q = G.spawnWalkerAhead(kinds[i % kinds.length]) || G.addZombie(kinds[i % kinds.length], G.van.x, G.van.y - 400);
      G.killZombie(G.zombies.indexOf(q));
    }
    if (G.fallen.length > G.ROAD_FALLEN_MAX) err(c, `${G.fallen.length} downed walkers kept (cap ${G.ROAD_FALLEN_MAX})`);
  }
  G.stop();
  Math.random = realRandom;
  console.log(`road walkers: ${kinds.length} kinds, scream at ${SC.spot * PX} px, frenzy within ${SC.radius * PX} px, downed for ${FALL} s`);
}

/* ---------- the angled camera, every drive: screen and world, the roof gun ---------- */
const P = ZSR.Persp;
// the flat, top-down camera and its walkers are gone (owner, 2026-10-17): no switch, no fallback left to drift
["persp", "flatToScreen", "flatToWorld", "drawFlat", "assist", "drawCrowd", "viewTurn", "anchorY"].forEach((k) => k in G && err("persp", `js/game.js still has the flat camera's ${k}`));
["zombie", "zombieShadow", "zombieDown", "ZOMBIE_LOOK", "road", "fog", "night"].forEach((k) => k in ZSR.Draw && err("persp", `js/sprites.js still has the top-down road's Draw.${k}`));
start("base", "grocery");
for (let i = 0; i < 90; i++) G.update(1 / 60);
let worstTrip = 0;
// points on the ground short of the haze (past it, the ground stops at the haze line)
for (const [sx, sy] of [[60, 700], [640, 560], [1200, 400], [300, 200], [640, 120]]) {
  const w = G.toWorld(sx, sy);
  const p = G.toScreen(w.x, w.y);
  worstTrip = Math.max(worstTrip, Math.hypot(p.x - sx, p.y - sy));
}
if (worstTrip > 0.5) err("persp", `a screen point came back ${worstTrip.toFixed(2)} px off through the world`);
G.stop();
// the roof gun: a shot flies straight at the pointer on the screen, seen at its own height, whichever way it points
// (round the gun, 220 px out), at the slowest and the fastest van
let worstPersp = 0;
for (const [engine, deg] of [0, 5].flatMap((e) => [0, 45, 90, 135, 180, 225, 270, 315].map((d) => [e, d]))) {
  upgrades.engine = engine;
  start("base", "hospital");
  for (let i = 0; i < 90; i++) G.update(1 / 60);
  // the pointer around the gun as the screen shows it, on the roof
  P.setup(G);
  const m = P.project(G.van.x - Math.cos(G.van.heading) * G.van.h * 0.1, G.van.y - Math.sin(G.van.heading) * G.van.h * 0.1, P.GUN_Z);
  if (!m) err("persp gun", "the gun is behind the camera");
  const a = (deg * Math.PI) / 180;
  Object.assign(G.pointer, { x: m.x + Math.cos(a) * 220, y: m.y + Math.sin(a) * 220, seen: true, down: true });
  G.van.cooldown = 0;
  G.update(1 / 60);
  G.pointer.down = false;
  const b = G.bullets[G.bullets.length - 1];
  // a shot drops from the barrels toward chest height under the pointer: seen at its own height, it flies
  // straight at the pointer until it levels off near the ground
  if (b.z == null || !(b.dz < 0)) err("persp gun", "a shot on the angled camera has no height or does not drop");
  const at = () => (P.setup(G), P.project(b.x, b.y, b.z));
  const from = at();
  const ux = G.pointer.x - from.x;
  const uy = G.pointer.y - from.y;
  const len = Math.hypot(ux, uy);
  for (let i = 0; i < 12; i++) {
    G.update(1 / 60);
    if (!G.bullets.includes(b) || b.z <= 6) break;
    const p = at();
    if (p) worstPersp = Math.max(worstPersp, Math.abs(((p.x - from.x) * uy - (p.y - from.y) * ux) / len));
  }
  G.stop();
}
upgrades.engine = 0;
if (worstPersp > 6) err("persp gun", `a shot drifted ${worstPersp.toFixed(1)} px off the line to the pointer`);
console.log(`persp: screen and world agree within ${worstTrip.toFixed(3)} px; shots stay within ${worstPersp.toFixed(1)} px of the line to the pointer`);

/* ---------- the angled camera: shots hit the walker clicked, walkers stay outside the van, parking ---------- */
// a walker standing ahead or off to a side: clicking its head, chest or feet on the screen hits it
let missed = 0;
let shots = 0;
for (const [ahead, side] of [[420, 0], [520, 160], [380, -260], [700, 420], [260, 300]]) {
  for (const at of [0.85, 0.5, 0.12]) {
    start("base", "grocery");
    for (let i = 0; i < 90; i++) G.update(1 / 60);
    P.setup(G);
    const k = P.k;
    // a real road walker (game.js addZombie: its kind's road row, knock, reach, scream state), made tough and harmless
    G.zombies.length = 0;
    const z = Object.assign(G.addZombie("walker", k.ox + k.Fx * ahead + k.Rx * side, k.oy + k.Fy * ahead + k.Ry * side), { hp: 1000, maxHp: 1000, speed: 55, dmg: 0, scrap: 0, phase: 0, cool: 9 });
    G.update(1 / 60); // walking (and, near the van, keeping up with it)
    P.setup(G);
    const foot = P.project(z.x, z.y, 0);
    const head = P.project(z.x, z.y, P.walkerH(z));
    // the picture leans half the camera's upright lines (Persp.billboard)
    Object.assign(G.pointer, { x: foot.x + (head.x - foot.x) * 0.5 * at, y: foot.y + (head.y - foot.y) * at, seen: true, down: true });
    G.van.cooldown = 0;
    G.update(1 / 60);
    G.pointer.down = false;
    for (let i = 0; i < 60 && G.bullets.length; i++) G.update(1 / 60);
    shots++;
    if (z.hp >= 1000) {
      missed++;
      err("persp aim", `a shot at a walker ${ahead} ahead, ${side} aside, clicked ${Math.round(at * 100)}% up it, missed`);
    }
    G.stop();
  }
}
// a walker that gets inside the van's sides is put back out, and hits the van
let inside = 0;
start("base", "grocery");
for (let i = 0; i < 90; i++) G.update(1 / 60);
G.van.cooldown = 1e9;
for (const [lx, ly] of [[0, 0], [20, -40], [-25, 50], [30, 0], [0, -55]]) {
  const v = G.van;
  const fx = Math.cos(v.heading);
  const fy = Math.sin(v.heading);
  G.zombies.length = 0;
  const z = Object.assign(G.addZombie("walker", v.x - fy * lx + fx * ly, v.y + fx * lx + fy * ly), { hp: 1000, maxHp: 1000, speed: 55, dmg: 5, scrap: 0, phase: 0, cool: 0 });
  const hp0 = ZSR.State.trip.vanHp;
  G.update(1 / 60);
  const qx = (z.x - v.x) * -fy + (z.y - v.y) * fx;
  const qy = (z.x - v.x) * fx + (z.y - v.y) * fy;
  if (Math.abs(qx) < v.w / 2 + z.r * 0.85 - 1 && Math.abs(qy) < v.h / 2 + z.r * 0.85 - 1) {
    inside++;
    err("persp van", `a walker at ${lx}, ${ly} in the van stayed inside it`);
  }
  if (ZSR.State.trip.vanHp >= hp0) err("persp van", `a walker pressed against the van at ${lx}, ${ly} did not hit it`);
}
G.stop();
// the van parks short of the grocery's front wall (its nose would be in it, seen in 3D)
let gap = null;
start("base", "grocery");
drive(right, 1.0, () => {
  if (G.arrive && G.arrive.parked && gap == null) {
    const l = G.drive.lots.find((q) => q.node === "grocery");
    const nose = [G.van.x + Math.cos(G.van.heading) * G.van.h / 2, G.van.y + Math.sin(G.van.heading) * G.van.h / 2];
    const v = (nose[0] - l.qx) * -l.uy * l.side + (nose[1] - l.qy) * l.ux * l.side;
    gap = S.GEOM.half + S.GEOM.shoulder + S.GEOM.lotGap + 168 - v;
  }
  return false;
});
if (gap == null || gap < 30) err("persp park", `the van parked ${gap == null ? "never" : gap.toFixed(1) + " units"} from the grocery's front wall`);
console.log(`persp: ${shots - missed} of ${shots} clicked walkers hit; ${inside} walkers left inside the van; parked ${gap == null ? "-" : gap.toFixed(0)} units short of the wall`);

/* ---------- turns: no hop where a turn starts or ends, the van keeps its place on the screen; the van brakes into a
   turn and the view follows lazily, the same at any frame rate ---------- */
{
  const D = 180 / Math.PI;
  const norm = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const PE = G.PERSP;
  /** A careful driver that lands on the lane's centre (so every frame pattern drives the same path): one record a
      frame. pick(dec) chooses the way (the right one if left out); a wrong way is recorded until the screen fades. */
  const rec = (a, b, pat, phase, pick) => {
    start(a, b);
    const rows = [];
    let t = 0;
    let i = 0;
    while (G.running && !G.fade && t < 260) {
      const dec = G.upcoming();
      G.keys.left = G.keys.right = false;
      if (dec && !G.turn && (dec.stop - G.van.s) / G.speed < 1.0) {
        const o = (pick || right)(dec);
        const lane = o.lanes.reduce((best, l) => (Math.abs(S.laneCenter(l, dec.n) - G.van.d) < Math.abs(S.laneCenter(best, dec.n) - G.van.d) ? l : best), o.lanes[0]);
        const tg = S.laneCenter(lane, dec.n);
        if (Math.abs(G.van.d - tg) < 40) G.van.d = tg;
        else G.keys[G.van.d > tg ? "left" : "right"] = true;
      }
      const was = G.turn;
      const x = G.van.x;
      const y = G.van.y;
      const before = G.upcoming();
      const sp0 = G.curSpeed;
      let dt = pat[i++ % pat.length];
      if (i === 1 && phase) dt *= phase;
      G.update(dt);
      t += dt;
      if (!G.running) break;
      const sc = G.toScreen(G.van.x, G.van.y);
      rows.push({ t, dt, step: Math.hypot(G.van.x - x, G.van.y - y), sp0, turn: G.turn, start: !!G.turn && G.turn !== was, end: !G.turn && !!was, main: G.turn ? G.turn.main : was && was.main, dest: !!G.arrive, park: (!!G.arrive || !G.onMain) && G.driveEnd() - G.van.s < 262, spd: G.curSpeed, vsx: sc.x, vsy: sc.y, th: G.cam.th, head: G.van.heading, tp: Math.atan2(G.vanP.uy, G.vanP.ux), pre: !!before && !G.turn && G.van.s < before.stop && before.stop - G.van.s < 1.5 * G.speed });
    }
    return rows;
  };
  // 1. the van's step on the frames around a turn's start and end is what its speed says (the part of a frame past a
  // stop line or a turn's end used to run at the wrong rate: up to 1.7 units at 60 fps, 6.9 at 50 ms). Each step is
  // set against the mean of the speeds at the frame's two ends, so the corner braking's own slowing is no hop (what
  // is left: the brake's curve inside a frame, and a chord against the arc, about 0.07 at 25 units on a 99 arc)
  let worstHop = 0;
  for (const [a, b] of [["base", "grocery"], ["base", "hospital"]]) {
    for (const engine of [0, 5]) {
      upgrades.engine = engine;
      for (const ms of [1000 / 60, 1000 / 30, 50]) {
        for (const phase of [0, 0.3, 0.7]) {
          const R = rec(a, b, [ms / 1000], phase);
          if (arrived !== b) err("turns", `${a} > ${b} (engine ${engine}, ${ms.toFixed(1)} ms frames) did not arrive`);
          R.forEach((r, i) => {
            if (!(r.start || r.end) || !r.main || i < 2 || i > R.length - 3) return;
            for (let j = i - 1; j <= i + 1; j++) {
              if (R[j].spd < 0.3 * G.speed) continue;
              worstHop = Math.max(worstHop, Math.abs(R[j].step - 0.5 * (R[j].sp0 + R[j].spd) * R[j].dt));
            }
          });
        }
      }
    }
  }
  upgrades.engine = 0;
  if (worstHop > 0.3) err("turns", `the van hops ${worstHop.toFixed(2)} units on a frame where a turn starts or ends`);
  // 2. the van keeps its place up and down the screen through every turn (the camera's offset used to be laid off the
  // road, not the view: the van rose 23 px through a junction)
  let worstBob = 0;
  for (const [a, b] of [["base", "grocery"], ["base", "hospital"], ["hospital", "base"]]) {
    const R = rec(a, b, [1 / 60]);
    const ys = R.filter((r) => r.t > 0.5).map((r) => r.vsy);
    worstBob = Math.max(worstBob, Math.max(...ys) - Math.min(...ys));
  }
  if (worstBob > 2) err("turns", `the van moves ${worstBob.toFixed(1)} px up or down the screen through the drive's turns`);
  // 3. the corner braking: none before a stop line (the reading and the choice keep their time); down to PERSP.brake
  // into each gentle turn the van takes, smoothly (the junction, the grocery's
  // bend from its stop line, and a wrong way, at either engine); back to full speed after
  let minSpd = 1;
  let minWrong = 1;
  let worstDv = 0;
  let worstPre = 1;
  for (const engine of [0, 5]) {
    upgrades.engine = engine;
    const R = rec("base", "grocery", [1 / 60]);
    // ... and a wrong way (the first decision at the slowest van, the last at the fastest)
    const k = engine ? G.drive.decisions.length - 1 : 0;
    const wrongAt = (dec) => (G.drive.decisions.indexOf(dec) === k ? dec.options.find((o) => !o.correct) : right(dec));
    const Rw = rec("base", "grocery", [1 / 60], 0, wrongAt);
    if (!Rw.some((r) => r.turn && !r.turn.main)) err("persp brake", `engine ${engine}: the wrong way at decision ${k} was never driven`);
    for (const rows of [R, Rw]) {
      rows.forEach((r, i) => {
        if (r.pre && !r.dest) worstPre = Math.min(worstPre, r.spd / G.speed);
        if (r.turn && r.turn.main && !r.dest) minSpd = Math.min(minSpd, r.spd / G.speed);
        if (r.turn && !r.turn.main) minWrong = Math.min(minWrong, r.spd / G.speed);
        // (the brake into a parking spot or a dead end, its last 262 units, is its own, and older)
        if (i && !r.park && rows[i - 1].spd > 0.5 * G.speed) worstDv = Math.max(worstDv, Math.abs(r.spd - rows[i - 1].spd) / G.speed);
      });
    }
    if (R[R.length - 1].spd > 0.2 * G.speed) err("persp brake", `the van was still at ${(R[R.length - 1].spd / G.speed).toFixed(2)} of its speed as it parked`);
  }
  upgrades.engine = 0;
  if (Math.abs(minSpd - PE.brake) > 0.02) err("persp brake", `through the junction the van slowed to ${minSpd.toFixed(3)} of its speed (want ${PE.brake})`);
  if (Math.abs(minWrong - PE.brake) > 0.02) err("persp brake", `through a wrong way the van slowed to ${minWrong.toFixed(3)} of its speed (want ${PE.brake})`);
  if (worstPre < 0.9999) err("persp brake", `the van slowed (to ${worstPre.toFixed(3)}) before a stop line`);
  // at 60 fps no frame changes the speed by more than 2% of it (a smooth ease of about 0.5 s at any engine; 1.38%)
  if (worstDv > 0.02) err("persp brake", `the van's speed jumped ${(worstDv * 100).toFixed(1)}% of it in one frame`);
  // 4. the angled camera follows lazily: through the junction its yaw stays gentle and smooth, it lags the van but
  // never so far that the new road leaves the view, and it catches up on the straight after; the same at engine 5
  const lim = { 0: { w: 45, lag: 35 }, 5: { w: 65, lag: 38 } };
  const yaw = {};
  for (const engine of [0, 5]) {
    upgrades.engine = engine;
    const R = rec("base", "grocery", [1 / 60]);
    const i0 = R.findIndex((r) => r.start && !r.dest);
    const i1 = R.findIndex((r, i) => i > i0 && r.end);
    let pkW = 0;
    let pkA = 0;
    let lag = 0;
    let wPrev = null;
    for (let i = Math.max(1, i0 - 30); i < Math.min(R.length, i1 + 240); i++) {
      const w = norm(R[i].th - R[i - 1].th) / R[i].dt;
      pkW = Math.max(pkW, Math.abs(w));
      if (wPrev != null) pkA = Math.max(pkA, Math.abs(w - wPrev) / R[i].dt);
      wPrev = w;
      lag = Math.max(lag, Math.abs(norm(R[i].head - R[i].th)));
    }
    const left = Math.abs(norm(R[Math.min(R.length - 1, i1 + 240)].tp - R[Math.min(R.length - 1, i1 + 240)].th));
    yaw[engine] = `peak ${(pkW * D).toFixed(0)} deg/s, ${(pkA * D).toFixed(0)} deg/s2, lag ${(lag * D).toFixed(0)} deg`;
    if (pkW * D > lim[engine].w) err("persp camera", `engine ${engine}: the view turned at up to ${(pkW * D).toFixed(0)} deg/s in the junction (want under ${lim[engine].w})`);
    if (pkA * D > 300) err("persp camera", `engine ${engine}: the view's turn sped up or slowed at ${(pkA * D).toFixed(0)} deg/s2 (a jolt)`);
    if (lag * D > lim[engine].lag) err("persp camera", `engine ${engine}: the view lagged the van by ${(lag * D).toFixed(0)} deg (want under ${lim[engine].lag})`);
    if (left * D > 2) err("persp camera", `engine ${engine}: 4 s after the turn the view was still ${(left * D).toFixed(1)} deg off the road`);
  }
  upgrades.engine = 0;
  // 5. ... and the same at any frame rate: uneven frames (16, 33, 16, 50 ms) put the view where steady 60 fps does
  {
    const A = rec("base", "grocery", [1 / 60]);
    const B = rec("base", "grocery", [0.016, 0.033, 0.016, 0.05]);
    let worst = 0;
    let j = 0;
    for (const r of B) {
      while (j < A.length - 2 && A[j + 1].t < r.t) j++;
      const a = A[j];
      const b = A[j + 1];
      const u = Math.max(0, Math.min(1, (r.t - a.t) / (b.t - a.t)));
      worst = Math.max(worst, Math.abs(norm(r.th - (a.th + norm(b.th - a.th) * u))));
    }
    if (worst * D > 0.2) err("persp camera", `uneven frames turned the view ${(worst * D).toFixed(2)} deg off where steady frames put it`);
    yaw.frames = `uneven frames within ${(worst * D).toFixed(3)} deg`;
  }
  console.log(`turns: van hop at a turn's start or end ${worstHop.toFixed(2)} units, van up/down the screen ${worstBob.toFixed(1)} px; angled: braked to ${minSpd.toFixed(3)} (a wrong way ${minWrong.toFixed(3)}), at most ${(worstDv * 100).toFixed(2)}% a frame, view ${yaw[0]} (engine 5: ${yaw[5]}), ${yaw.frames}`);
}

/* ---------- the angled camera draws: every kind of walker, live, with gore on and off ----------
   The whole frame (game.js draw: the 2D ground, as without WebGL, the walkers, the van, the sign, the HUD) on a 2D
   context that records and checks every call (the same checks as tests/validate-art.js's): every kind walking, a
   scream and the frenzy it starts, walkers clawing at the van, hurt ones (health bars), shots that hit and kill
   (blood in the air, downed bodies going over), with walker gore on and off. No exceptions, no NaN or infinite
   coordinates, every kind and pose drawn by Walker3D, the frenzy's glow and the health bars there, blood only with
   gore on, and nothing drawn anew over the sign. */
{
  const drawErr = (m) => err("persp draw", m);
  const finite = (v) => typeof v === "number" && Number.isFinite(v);
  const NUMS = { fillRect: 4, strokeRect: 4, clearRect: 4, rect: 4, moveTo: 2, lineTo: 2, arc: 5, ellipse: 7, quadraticCurveTo: 4, bezierCurveTo: 6, arcTo: 5, translate: 2, scale: 2, rotate: 1, roundRect: 4, setTransform: 6, transform: 6, createLinearGradient: 4, createRadialGradient: 6, fillText: 3, strokeText: 3 };
  let where = "(setup)";
  const log = []; // what every context did this frame: [canvas tag, call, args, fillStyle]
  const bad = new Set();
  function context2d(canvas, tag) {
    const state = { fillStyle: "#000000", strokeStyle: "#000000", globalAlpha: 1, lineWidth: 1, font: "10px sans-serif", lineCap: "butt", lineJoin: "miter", imageSmoothingEnabled: true, imageSmoothingQuality: "low", textAlign: "start", textBaseline: "alphabetic", globalCompositeOperation: "source-over" };
    const stack = [];
    const calls = {
      save: () => stack.push(Object.assign({}, state)),
      restore: () => stack.length && Object.assign(state, stack.pop()),
      measureText: (t) => ({ width: String(t).length * 6 }),
      createLinearGradient: () => ({ addColorStop: noop }),
      createRadialGradient: () => ({ addColorStop: noop }),
      createPattern: () => ({}),
      getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) }),
      createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) }),
      getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
      isPointInPath: () => false,
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
            const n = k === "fillText" || k === "strokeText" ? 0 : NUMS[k] || 0;
            const from = k === "fillText" || k === "strokeText" ? 1 : 0;
            for (let i = from; i < from + (n || (k === "fillText" || k === "strokeText" ? 2 : 0)) && i < args.length; i++) {
              if (!finite(args[i])) bad.add(`${where}: ${tag} ${k}() argument ${i + 1} is ${args[i]}`);
            }
            if (k === "drawImage") {
              const img = args[0];
              if (!img || !(img.width > 0) || !(img.height > 0)) bad.add(`${where}: ${tag} drawImage() of something with no size`);
              for (let i = 1; i < args.length; i++) if (!finite(args[i])) bad.add(`${where}: ${tag} drawImage() argument ${i + 1} is ${args[i]}`);
            }
            if ((k === "ellipse" && (args[2] < 0 || args[3] < 0)) || (k === "arc" && args[2] < 0)) bad.add(`${where}: ${tag} ${k}() with a negative radius`);
            log.push([tag, k, args, state.fillStyle]);
            return calls[k] ? calls[k](...args) : undefined;
          };
        },
        set(o, k, v) {
          if (k === "globalAlpha" && !(finite(v) && v >= 0 && v <= 1)) bad.add(`${where}: ${tag} globalAlpha ${v}`);
          if (k === "lineWidth" && !(finite(v) && v >= 0)) bad.add(`${where}: ${tag} lineWidth ${v}`);
          if (k in state) state[k] = v;
          else o[k] = v;
          return true;
        },
      }
    );
  }
  const canvasEl = (tag) => {
    const c = Object.assign(el(), { width: 300, height: 150, tagName: "CANVAS" });
    c.getContext = (kind) => (kind === "2d" ? c.ctx || (c.ctx = context2d(c, tag)) : null); // no WebGL: the 2D ground
    return c;
  };
  const realDoc = globalThis.document;
  globalThis.document = Object.assign({}, realDoc, { createElement: (t) => (String(t).toLowerCase() === "canvas" ? canvasEl("pooled") : el()) });
  const screen = canvasEl("screen");
  screen.width = 1280;
  screen.height = 720;
  const M = ZSR.Walker3D;
  const seen = { kinds: new Set(), poses: new Set(), falls: 0, renders: 0 };
  const d0 = M.draw;
  M.draw = (c, type, st, cam) => {
    seen.kinds.add(type);
    seen.poses.add(st.pose);
    if (st.fall > 0) seen.falls++;
    seen.renders++;
    if (!(cam.floor > 0) || cam.shadow !== false) drawErr(`Walker3D drew a road walker without its room under the feet or with its own shadow (cam ${JSON.stringify(cam)})`);
    return d0(c, type, st, cam);
  };
  const kinds = Object.keys(W.WALKER_TYPES);
  const frames = (n, label) => {
    for (let i = 0; i < n; i++) {
      G.update(1 / 60);
      where = `${label} frame ${i}`;
      log.length = 0;
      try {
        G.draw();
      } catch (e) {
        drawErr(`${label}: G.draw threw ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
        return false;
      }
    }
    return true;
  };
  const fillsOf = (style) => log.filter((c) => c[1] === "fill" || c[1] === "fillRect").filter((c) => c[3] === style).length;
  for (const gore of [true, false]) {
    W.SETTINGS.walkerGore = gore;
    const label = `gore ${gore ? "on" : "off"}`;
    start("base", "grocery");
    G.ctx = screen.getContext("2d");
    G.mods.night = !gore; // and the night's fog on the second pass
    for (let i = 0; i < 90; i++) G.update(1 / 60);
    const v = G.van;
    const fx = Math.cos(v.heading);
    const fy = Math.sin(v.heading);
    const put = (type, ahead, side) => G.addZombie(type, v.x + fx * ahead - fy * side, v.y + fy * ahead + fx * side);
    G.zombies.length = 0;
    // every kind ahead and aside, some hurt; one of each pressed on the van's sides; a screamer close enough to scream
    const crowd = kinds.map((k, i) => Object.assign(put(k, 380 + i * 90, (i % 2 ? 1 : -1) * (60 + i * 30)), { hp: 1e4, maxHp: 1e4 }));
    crowd.forEach((z, i) => i % 2 && (z.hp = 4000));
    kinds.forEach((k, i) => Object.assign(put(k, -40 + (i % 3) * 40, (i % 2 ? 1 : -1) * 40), { hp: 1e4, maxHp: 1e4, dmg: 0 }));
    const sc = Object.assign(put(kinds.find((k) => W.WALKER_TYPES[k].scream) || kinds[0], 300, 0), { hp: 1e4, maxHp: 1e4 });
    if (!frames(20, label)) continue;
    G.scream(sc);
    if (!frames(10, label)) continue;
    const glow = fillsOf(gore ? "rgba(170,24,12,0.42)" : "rgba(214,120,30,0.4)");
    if (!glow) drawErr(`${label}: no frenzy glow on the ground after a scream`);
    if (!fillsOf("#b3261e")) drawErr(`${label}: no health bar over a hurt walker`);
    // shots that hit (blood in the air with gore on) and kill (downed bodies going over, each kind its own way)
    for (const z of crowd) {
      const j = G.zombies.indexOf(z);
      if (j < 0) continue;
      G.blood(z, z.x, z.y, z.x - v.x, z.y - v.y, false, 30);
      z.hp = 0;
      G.killZombie(j, Math.atan2(z.y - v.y, z.x - v.x));
    }
    const drops = G.particles.filter((p) => p.blood && p.z > 0).length;
    if (gore && !drops) drawErr(`${label}: a hit sprays no blood into the air`);
    if (!gore && G.particles.some((p) => p.blood)) drawErr(`${label}: blood with walker gore off`);
    for (let n = 0; n < 4; n++) if (!frames(15, label)) break;
    if (!G.fallen.length) drawErr(`${label}: no downed walkers drawn`);
    // a body the van has driven onto lies under it: drawn before the van, though its feet are nearer the camera than
    // the van's middle (a walker downed just behind the middle, and one whose body lies back under the van)
    {
      const P = ZSR.Persp;
      const order = [];
      const dn0 = P.downed;
      const van0 = P.van;
      P.downed = function (g2, c2, f, a) {
        order.push(f);
        return dn0.call(this, g2, c2, f, a);
      };
      P.van = function (g2, c2) {
        order.push("van");
        return van0.call(this, g2, c2);
      };
      const ups = [];
      for (const [ahead, side] of [[-20, 0], [-v.h / 2 - 25, 8]]) {
        const z = put(kinds[0], ahead, side); // (a plain walker crumples the way it was thrown)
        G.killZombie(G.zombies.indexOf(z), v.heading); // thrown forward: it lies along the van's length, under it
        ups.push(G.fallen[G.fallen.length - 1]);
      }
      // the second one's feet are behind the van: give it its whole length, as if it went down a moment ago
      const fa = (f) => (f.max || 2) - f.life;
      ups[1].life = ups[1].max - 1.5;
      where = `${label} bodies under the van`;
      log.length = 0;
      G.draw();
      P.downed = dn0;
      P.van = van0;
      const vi = order.indexOf("van");
      ups.forEach((f, i) => {
        const at = order.indexOf(f);
        if (vi < 0 || at < 0) drawErr(`${label}: the van or a body under it was not drawn (${vi}, ${at}; fallen ${fa(f).toFixed(2)} s)`);
        else if (at > vi) drawErr(`${label}: a body under the van (${i ? "lying back under it" : "its feet behind the van's middle"}) was drawn over the van`);
      });
    }
    const S = ZSR.Persp.walkerStats;
    if (!(S.drawn > 0)) drawErr(`${label}: walkerStats says no walker was drawn (${JSON.stringify(S)})`);
    ["drawn", "renders", "ms", "level"].forEach((k) => finite(S[k]) || drawErr(`${label}: walkerStats.${k} is ${S[k]}`));
    // the frame's own cost, as a test page shows it: every part there, the walkers' share inside the world's
    const F = ZSR.Persp.frameStats;
    ["ms", "groundMs", "worldMs", "walkersMs", "squaresMade"].forEach((k) => (finite(F[k]) && F[k] >= 0) || drawErr(`${label}: frameStats.${k} is ${F[k]}`));
    if (F.walkersMs > F.worldMs + 0.5) drawErr(`${label}: frameStats puts ${F.walkersMs.toFixed(1)} ms in the walkers, more than the ${F.worldMs.toFixed(1)} ms of the world they stand in`);
    // over the sign: this frame's pictures again (no new renders), never a ground layer
    const before = seen.renders;
    log.length = 0;
    where = `${label} over the sign`;
    ZSR.Persp.drawOverSign(G, G.ctx, [{ x: 0, y: 0, w: 1280, h: 720 }]);
    if (seen.renders !== before) drawErr(`${label}: drawing walkers over the sign drew them anew`);
    if (fillsOf("rgba(0,0,0,0.32)") || fillsOf("rgba(170,24,12,0.42)") || fillsOf("rgba(214,120,30,0.4)")) drawErr(`${label}: a shadow or a frenzy's glow drawn over the sign`);
    if (!log.some((c) => c[1] === "drawImage")) drawErr(`${label}: no walker drawn over a sign covering the screen`);
    if (gore) {
      // a long pause (a card or the menu: the road is drawn every frame, nothing moves) after the walkers' governor
      // has stepped down: the frames that put the same pictures back up neither step it back up nor smooth its time
      const P = ZSR.Persp;
      P.liveRow();
      Object.assign(P, { liveLevel: 5, liveSmooth: 5.5, liveN: 1e4, liveSlowN: 0, liveFastN: 0 });
      const settle = (n) => {
        for (let i = 0; i < n; i++) {
          where = `${label} paused frame ${i}`;
          log.length = 0;
          G.draw();
        }
      };
      settle(10);
      const was = [P.liveLevel, P.liveSmooth];
      settle(600);
      if (P.liveLevel !== was[0] || P.liveSmooth !== was[1]) drawErr(`600 paused frames moved the walkers' governor from row ${was[0]} (${was[1].toFixed(2)} ms) to row ${P.liveLevel} (${P.liveSmooth.toFixed(2)} ms)`);
    }
    G.stop();
  }
  W.SETTINGS.walkerGore = true;
  M.draw = d0;
  globalThis.document = realDoc;
  kinds.forEach((k) => seen.kinds.has(k) || drawErr(`the angled camera never drew a ${k}`));
  ["walk", "claw", "scream"].forEach((p) => seen.poses.has(p) || drawErr(`the angled camera never drew a walker's "${p}" pose`));
  if (!seen.falls) drawErr("the angled camera never drew a walker going over");
  [...bad].slice(0, 12).forEach(drawErr);
  console.log(`persp draw: ${seen.renders} Walker3D renders (${[...seen.kinds].length} kinds, poses ${[...seen.poses].join("/")}, ${seen.falls} falling), gore on and off, ${bad.size} bad calls`);
}
/* ---------- what the flat camera carried, on the angled camera (2026-10-17) ----------
   Drawn on a 2D context that records and checks every call (no WebGL: the 2D ground):
   - night: the dark is drawn again only when what it shows moves (the same frame twice: once), its beam lies down the
     van's own heading on the screen (not up the screen) and reaches about halfway from the old road's 520 to the haze;
   - fog: the view sees FOG.far, its haze starts FOG.near ahead; a walker past it is not drawn, one near is; walkers
     still come from where they do on a clear day; no landmark silhouette shows past the fog;
   - the minimap's arrow points up (the map turns with the van, the camera lags it); the map fades for a place in
     view under it, not for an empty corner of the sky nor for a place gone into the haze;
   - the sign and the lane hint stay off the road (its edges between the van and the stop line, on the screen) at 1280
     x 800, 1920 x 1080 and 960 x 1040;
   - Spread Shot at a walker clicked far down the road: every barrel's shot hits it;
   - the title screen and the garage's preview: a still angled scene (the van, Walker3D figures of every kind in turn,
     the first two in the still one), drawn again only when what it shows changes (a new paint job, the two newest
     too, new dents, the other view), with no exceptions or NaN; the title from behind the van, undented; the garage's
     (js/base.js Base.garageVan) from its front-left, lower than the title's, seeing its left side, front and hood,
     the whole van with its top gear and its gun's reach in the picture, dented as the save's van is now;
   - the van on the road is the one 3D van (js/van3d.js), drawn once a frame without its own gun (the road's aimed gun
     stands on its roof: the model's roof is at VAN_Z where the gun's mount is), through the road's own camera (its
     points where Persp.project puts them, seen from the camera's spot), lit by the buildings' light (a wall toward
     the upper left of the world brighter than one away, a top brighter still), its ink and detail by its size, a hit
     as its tint, the trip's health as its dents, every paint job drawn; its light and ink are the buildings' own
     (PerspBuild.LIGHT and inkW, read as it is drawn: a change there shows on the van);
   - the workbench's van is the same model from its right side (its gun on), standing on the floor line in the old
     picture's spot (its body L px across from x), in the save's paint;
   - the map's van marker (Draw.van, top-down) draws every paint job whole: body, roof, trim, bumpers, rims, decal;
   - a wall's picture (a road sign's board, a barrier's face) is drawn in its own pixels, never into a unit square. */
{
  const fErr = (m) => err("flat out", m);
  const finite = (v) => typeof v === "number" && Number.isFinite(v);
  let where = "(setup)";
  let vanNote = "no 3D van checked"; // (what the road's van test found, for the summary)
  const bad = new Set();
  const log = []; // [tag, call, args]
  function context2d(canvas, tag) {
    const state = { fillStyle: "#000000", strokeStyle: "#000000", globalAlpha: 1, lineWidth: 1, font: "10px sans-serif", lineCap: "butt", lineJoin: "miter", imageSmoothingEnabled: true, imageSmoothingQuality: "low", textAlign: "start", textBaseline: "alphabetic", globalCompositeOperation: "source-over" };
    const stack = [];
    const calls = {
      save: () => stack.push(Object.assign({}, state)),
      restore: () => stack.length && Object.assign(state, stack.pop()),
      measureText: (t) => ({ width: String(t).length * 0.55 * (parseFloat(/(\d+(\.\d+)?)px/.exec(state.font) ? /(\d+(\.\d+)?)px/.exec(state.font)[1] : 10) || 10) }),
      createLinearGradient: () => ({ addColorStop: noop }),
      createRadialGradient: () => ({ addColorStop: noop }),
      createPattern: () => ({}),
      getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) }),
      createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) }),
      getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
      isPointInPath: () => false,
    };
    return new Proxy(
      {},
      {
        get(o, k) {
          if (k === "canvas") return canvas;
          if (k in state) return state[k];
          if (typeof k !== "string") return undefined;
          return (...args) => {
            for (const a of args) if (typeof a === "number" && !finite(a)) bad.add(`${where}: ${tag} ${k}(${args.map((x) => (typeof x === "number" ? x : typeof x)).join(", ")})`);
            if (k === "drawImage" && !(args[0] && args[0].width > 0 && args[0].height > 0)) bad.add(`${where}: ${tag} drawImage() of something with no size`);
            log.push([tag, k, args]);
            return calls[k] ? calls[k](...args) : undefined;
          };
        },
        set(o, k, v) {
          if (k === "globalAlpha" && !(finite(v) && v >= 0 && v <= 1)) bad.add(`${where}: ${tag} globalAlpha ${v}`);
          if (k === "lineWidth" && !(finite(v) && v >= 0)) bad.add(`${where}: ${tag} lineWidth ${v}`);
          if (k in state) state[k] = v;
          else o[k] = v;
          return true;
        },
      }
    );
  }
  const canvasEl = (tag) => {
    const c = Object.assign(el(), { width: 300, height: 150, tagName: "CANVAS" });
    c.getContext = (kind) => (kind === "2d" ? c.ctx || (c.ctx = context2d(c, tag)) : null);
    return c;
  };
  const realDoc = globalThis.document;
  globalThis.document = Object.assign({}, realDoc, { createElement: (t) => (String(t).toLowerCase() === "canvas" ? canvasEl("pooled") : el()) });
  const P = ZSR.Persp;
  const B = ZSR.PerspBuild;
  const screen = canvasEl("screen");
  screen.width = 1280;
  screen.height = 720;
  const hud0 = G.hudRects;
  const MINI = { left: 10, top: 65, right: 250, bottom: 235, width: 240, height: 170 };
  const hudFor = (w, h) => () => ({ top: null, row: 52, low: [{ left: w / 2 - 210, right: w / 2 + 210, top: h - 50 }], boxes: [{ left: 10, right: 660, top: 10, bottom: 52 }], mini: MINI });
  G.hudRects = hudFor(1280, 720);
  const frame = (label) => {
    where = label;
    log.length = 0;
    try {
      G.draw();
      return true;
    } catch (e) {
      fErr(`${label}: G.draw threw ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
      return false;
    }
  };
  const ahead = (d, side) => {
    const fx = Math.cos(G.van.heading);
    const fy = Math.sin(G.van.heading);
    return [G.van.x + fx * d - fy * (side || 0), G.van.y + fy * d + fx * (side || 0)];
  };

  // night: the dark drawn again only when it moves; its beam down the van's own heading; its reach "in between"
  {
    start("base", "hospital");
    G.ctx = screen.getContext("2d");
    G.mods.night = true;
    for (let i = 0; i < 120; i++) G.update(1 / 60);
    const NS = () => Object.assign({ drawn: 0, reused: 0 }, P.nightStats);
    frame("night");
    const a = NS();
    frame("night, the same again");
    const b = NS();
    if (!(b.reused === a.reused + 1 && b.drawn === a.drawn)) fErr(`night: the same frame twice drew the dark ${b.drawn - a.drawn} more times (want it reused)`);
    G.van.aimW = (G.van.aimW || G.van.heading) + 0.2;
    frame("night, the gun turned");
    if (NS().drawn !== b.drawn + 1) fErr("night: turning the gun did not draw the dark again (its lamp follows the aim)");
    // the van turned a quarter of a radian off the camera: the beam's line on the screen is the van's own
    let worst = 0;
    for (const off of [-0.45, -0.2, 0.25, 0.5]) {
      G.van.heading = G.cam.th + off;
      frame("night, the van turned " + off);
      P.setup(G);
      const v = P.project(G.van.x, G.van.y, 0);
      const n = P.project(...ahead(400), 0);
      const L = P.nightBeam;
      if (!L || !v || !n) {
        fErr(`night: no beam drawn with the van turned ${off}`);
        continue;
      }
      const d = Math.atan2(L[1].y - L[0].y, L[1].x - L[0].x) - Math.atan2(n.y - v.y, n.x - v.x);
      worst = Math.max(worst, Math.abs(Math.atan2(Math.sin(d), Math.cos(d))));
    }
    if (worst > 0.02) fErr(`night: the headlights' beam is ${((worst * 180) / Math.PI).toFixed(1)} deg off the van's own heading on the screen`);
    const N = P.NIGHT_BEAM;
    const mid = (520 + P.cfg.far) / 2;
    if (!(Math.abs(N.reach - mid) < 0.1 * (P.cfg.far - 520))) fErr(`night: the beam reaches ${N.reach}, not about halfway between the old road's 520 and the haze (${mid})`);
    G.stop();
  }

  // fog: thick and near, walkers past it hidden, where they come from unchanged, no silhouette past it
  {
    start("base", "hospital");
    G.ctx = screen.getContext("2d");
    G.mods.fog = true;
    for (let i = 0; i < 90; i++) G.update(1 / 60);
    const k = P.setup(G);
    if (!(k.fog && k.far === P.FOG.far && k.far < P.cfg.far && k.fog0 === P.FOG.near)) fErr(`fog: the view sees ${k.far} (fog ${P.FOG.far}) and its haze starts ${k.fog0} ahead`);
    if (P.fadeAt(P.FOG.near) !== 1 || P.fadeAt(P.FOG.far) !== 0 || !(P.fadeAt((P.FOG.near + P.FOG.far) / 2) < 0.6)) fErr("fog: things do not fade into it from FOG.near to FOG.far");
    let past = 0;
    for (let i = 0; i < 400; i++) {
      const w = P.spawn(G, G.diff.row);
      if (P.local(w.x, w.y).Y > P.FOG.far + 150) past++;
    }
    if (past < 100) fErr(`fog: only ${past} of 400 walkers came from past the fog (they come from where they do on a clear day)`);
    G.zombies.length = 0;
    const near = Object.assign(G.addZombie("walker", ...ahead(260)), { born: -9, hp: 1e9, maxHp: 1e9, dmg: 0 });
    const far = Object.assign(G.addZombie("walker", ...ahead(P.FOG.far + 400)), { born: -9, hp: 1e9, maxHp: 1e9, dmg: 0 });
    const shown = [];
    const w0 = P.walker;
    P.walker = function (g2, c2, z, f) {
      shown.push(z);
      return w0.call(this, g2, c2, z, f);
    };
    frame("fog, walkers near and far");
    P.walker = w0;
    if (!shown.includes(near)) fErr("fog: a walker 260 ahead was not drawn");
    if (shown.includes(far)) fErr(`fog: a walker ${P.FOG.far + 400} ahead, past the fog, was drawn`);
    G.stop();
    // the Water Tower is a silhouette past the haze on a clear day, never past the fog
    if (B) {
      start("base", "watertower");
      G.ctx = screen.getContext("2d");
      G.mods.fog = true;
      let pastFog = 0;
      drive(right, 1.0, () => {
        if (Math.floor(G.time * 60) % 30) return false;
        frame("fog, the tower");
        if (B.stats.skyline) fErr("fog: the Water Tower's silhouette showed past the fog");
        const lot = G.drive.lots.find((l) => l.node === "watertower");
        const rec = B.rec(lot);
        const k2 = P.k;
        if ((rec.cx - k2.ox) * k2.Fx + (rec.cy - k2.oy) * k2.Fy > k2.far) pastFog++;
        return G.arrive && G.arrive.parked;
      });
      if (!pastFog) fErr("fog: the drive to the Water Tower never had it past the fog to check");
      G.stop();
    }
  }

  // the minimap: its arrow up; its fade for a place in view under it only
  {
    start("base", "hospital");
    G.ctx = screen.getContext("2d");
    const mini = canvasEl("mini");
    const hm0 = G.hud.mini;
    const m0 = G.mini;
    G.hud.mini = mini;
    G.mini = mini.getContext("2d");
    // into a turn, where the camera lags the van
    drive(right, 1.0, () => !!G.turn && Math.abs(Math.atan2(Math.sin(G.van.heading - G.cam.th), Math.cos(G.van.heading - G.cam.th))) > 0.2);
    where = "minimap";
    log.length = 0;
    G.drawMinimap(1);
    const calls = log.filter((c) => c[0] === "mini");
    const at = calls.findIndex((c, i) => c[1] === "moveTo" && c[2][0] === 0 && c[2][1] === -9 && calls[i + 1] && calls[i + 1][1] === "lineTo" && calls[i + 1][2][0] === 7);
    const tr = calls.slice(0, Math.max(0, at)).map((c) => c[1]).lastIndexOf("translate");
    if (at < 0 || tr < 0) fErr("minimap: no van arrow drawn");
    else if (calls.slice(tr, at).some((c) => c[1] === "rotate")) fErr("minimap: the van's arrow is turned (the map turns with the van: it points up)");
    G.hud.mini = hm0;
    G.mini = m0;
    // the fade: what it wants, fresh
    const want = (box) => {
      G.hudRects = () => Object.assign(hudFor(1280, 720)(), { mini: Object.assign({ width: box.right - box.left, height: box.bottom - box.top }, box) });
      G.miniA = null;
      const a = G.miniAlpha();
      G.hudRects = hudFor(1280, 720);
      return a;
    };
    let nearSeen = 0;
    let farSeen = 0;
    drive(right, 1.0, () => {
      if (Math.floor(G.time * 60) % 15) return false;
      const k = P.setup(G);
      for (const l of G.drive.lots) {
        const rec = B ? B.rec(l) : null;
        const x = rec ? rec.cx : l.qx;
        const y = rec ? rec.cy : l.qy;
        const Y = (x - k.ox) * k.Fx + (y - k.oy) * k.Fy;
        const p = P.project(x, y, 0);
        if (!p || p.x < 30 || p.x > 1250 || p.y < 30 || p.y > 690) continue;
        const box = { left: p.x - 4, right: p.x + 4, top: p.y - 4, bottom: p.y + 4 };
        if (Y < k.far && P.fadeAt(Y) < 0.15) {
          farSeen++;
          if (want(box) !== 1) fErr(`minimap: it faded for ${l.node} ${Math.round(Y)} ahead, gone into the haze`);
        } else if (P.fadeAt(Y) > 0.6) {
          nearSeen++;
          if (want(box) !== 0.15) fErr(`minimap: it did not fade for ${l.node} ${Math.round(Y)} ahead, under it`);
        }
      }
      return G.arrive && G.arrive.parked;
    });
    if (!nearSeen || !farSeen) fErr(`minimap: the drive gave ${nearSeen} places in view and ${farSeen} in the haze to check`);
    // parked: the sky over the building is not the building
    if (want({ left: 2, right: 40, top: 2, bottom: 24 }) !== 1) fErr("minimap: parked, it faded for an empty corner of the sky");
    G.stop();
  }

  // the sign and the lane hint: off the road, at three window sizes
  {
    const sizes = [[1280, 800], [1920, 1080], [960, 1040]];
    const W0 = globalThis.innerWidth;
    const H0 = globalThis.innerHeight;
    let signs = 0;
    let hints = 0;
    for (const [w, h] of sizes) {
      globalThis.innerWidth = w;
      globalThis.innerHeight = h;
      G.resize();
      G.hudRects = hudFor(w, h);
      for (const [a, b] of [["base", "hospital"], ["river", "mall"]]) {
        start(a, b);
        const ctx = screen.getContext("2d");
        G.ctx = ctx;
        drive(right, 1.0, () => {
          if (Math.floor(G.time * 60) % 20 || !G.onMain || G.turn) return G.arrive && G.arrive.parked;
          const dec = G.upcoming();
          // (a sign all the way in: not still coming down from the top, nor the last one sliding away)
          if (!dec || G.van.s - dec.signAt < Math.min(dec.zoneStart - dec.signAt || 1, 0.5 * G.speed) + 1) return false;
          if (G.next > 0 && G.van.s - G.drive.decisions[G.next - 1].stop < 260) return false;
          where = `${a} > ${b} at ${w}x${h}, sign`;
          const rects = G.drawSign(ctx, 1);
          if (!rects) return false;
          // the road between the van and the stop line, its outer edges, on the screen
          P.setup(G);
          const off = S.GEOM.half + S.GEOM.shoulder;
          const rows = [];
          for (let s = G.van.s; s <= dec.stop; s += 60) {
            const q = S.at(G.track, s);
            const L = P.project(q.x + q.uy * off, q.y - q.ux * off, 0);
            const R = P.project(q.x - q.uy * off, q.y + q.ux * off, 0);
            if (L && R) rows.push([L, R]);
          }
          const covers = (r) => rows.some(([L, R]) => {
            for (let i = 0; i <= 4; i++) {
              const y = L.y + ((R.y - L.y) * i) / 4;
              const x = L.x + ((R.x - L.x) * i) / 4;
              if (y > r.y + 2 && y < r.y + r.h - 2 && x > r.x + 2 && x < r.x + r.w - 2) return true;
            }
            return false;
          });
          signs++;
          const narrow = rects[0].x <= 10;
          if (!narrow && covers(rects[0])) fErr(`${a} > ${b} at ${w}x${h}: the sign (${rects[0].x.toFixed(0)}, ${rects[0].y.toFixed(0)}, ${rects[0].w.toFixed(0)} x ${rects[0].h.toFixed(0)}) covers the road before the stop line`);
          if (rects[1]) {
            hints++;
            if (covers(rects[1])) fErr(`${a} > ${b} at ${w}x${h}: the lane hint (${rects[1].x.toFixed(0)}, ${rects[1].y.toFixed(0)}, ${rects[1].w.toFixed(0)} x ${rects[1].h.toFixed(0)}) covers the road before the stop line`);
          }
          return false;
        });
        G.stop();
      }
    }
    globalThis.innerWidth = W0;
    globalThis.innerHeight = H0;
    G.resize();
    G.hudRects = hudFor(1280, 720);
    if (signs < 30 || hints < 5) fErr(`only ${signs} signs and ${hints} lane hints checked`);
  }

  // Spread Shot at a walker clicked far down the road: every barrel's shot hits it
  {
    let volleys = 0;
    for (const spread of [1, 3]) {
      upgrades.spread = spread;
      for (const [d, side] of [[1100, 0], [800, 260], [500, -180]]) {
        start("base", "hospital");
        for (let i = 0; i < 60; i++) G.update(1 / 60);
        G.zombies.length = 0;
        G.spawnTimer = 1e9;
        const z = Object.assign(G.addZombie("walker", ...ahead(d, side)), { hp: 1e6, maxHp: 1e6, speed: 0, dmg: 0, born: -9, cool: 9 });
        G.update(1 / 60);
        P.setup(G);
        const foot = P.project(z.x, z.y, 0);
        const head = P.project(z.x, z.y, P.walkerH(z));
        Object.assign(G.pointer, { x: foot.x + (head.x - foot.x) * 0.25, y: foot.y + (head.y - foot.y) * 0.5, seen: true, down: true });
        G.van.cooldown = 0;
        const n0 = G.bullets.length;
        G.update(1 / 60);
        G.pointer.down = false;
        G.van.cooldown = 1e9;
        const fired = G.bullets.length - n0;
        for (let i = 0; i < 120 && G.bullets.length; i++) G.update(1 / 60);
        const hits = Math.round((1e6 - z.hp) / G.stats.damage);
        volleys++;
        if (fired !== spread + 1 || hits !== fired) fErr(`Spread Shot ${spread}: at a walker ${d} ahead, ${side} aside, ${hits} of ${fired} shots hit it (want all ${spread + 1})`);
        G.stop();
      }
    }
    upgrades.spread = 0;
    if (!volleys) fErr("no Spread Shot volley fired");
  }

  // the title screen and the garage's preview: a still angled scene
  {
    const M = ZSR.Walker3D;
    const kinds = Object.keys(W.WALKER_TYPES);
    const drawn = [];
    const d0 = M.draw;
    M.draw = (c, type, st, cam) => {
      drawn.push(type);
      return d0(c, type, st, cam);
    };
    let vans = 0;
    const v0 = P.van;
    P.van = function (...a) {
      vans++;
      return v0.apply(this, a);
    };
    const c = canvasEl("title");
    c.width = 320;
    c.height = 200;
    const ups = { armor: 2, engine: 1, bumper: 2, paint: 3, damage: 3, fireRate: 4, spread: 2 };
    const shown = new Set();
    let first = null;
    let draws = 0;
    for (let t = 0; t <= kinds.length * 4 + 1; t += 0.5) {
      where = `title screen at ${t} s`;
      drawn.length = 0;
      let did;
      try {
        did = G.showcase(c, ups, t);
      } catch (e) {
        fErr(`${where}: threw ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
        break;
      }
      if (did) {
        draws++;
        drawn.forEach((k) => shown.add(k));
        if (t === 0) first = drawn.slice();
      }
      if (did !== (t % 4 === 0)) fErr(`${where}: ${did ? "drew again with nothing changed" : "did not draw its walkers' new turn"}`);
    }
    kinds.forEach((k) => shown.has(k) || fErr(`the title screen never shows a ${k}`));
    if (!first || first.slice().sort().join() !== kinds.slice(0, 2).sort().join()) fErr(`the title screen's still picture shows ${first && first.join(", ")} (the facts' first two kinds expected)`);
    if (vans !== draws) fErr(`the title screen drew the van ${vans} times in ${draws} pictures`);
    // the garage (js/base.js Base.garageVan: showcase's "garage" view): another van's upgrades draw again, the same do
    // not; every new paint job (the two newest too) draws again, the 3D van in it once, its gun the road's (aimed),
    // and so do new dents and the other view
    const g = canvasEl("garage");
    g.width = 360;
    g.height = 200;
    const GV = { view: "garage" };
    where = "garage preview";
    vans = 0;
    if (!G.showcase(g, ups, 0, GV) || G.showcase(g, ups, 0, GV) || !G.showcase(g, Object.assign({}, ups, { paint: 1 }), 0, GV)) fErr("the garage's preview is not drawn once per van");
    if (vans !== 2) fErr(`the garage's preview drew the van ${vans} times in 2 pictures`);
    const V = ZSR.Van3D;
    const U = ZSR.Upgrades;
    const vd0 = V.draw;
    let painted = [];
    V.draw = function (c2, view, u, o) {
      // what it drew, the eye it was seen from (in its frame: x its right, y forward, z up), and the box on the picture
      // round every corner of the model and of its roof gun's reach (Persp gun: its barrels, a muzzle brake, the drum)
      const box = [Infinity, Infinity, -Infinity, -Infinity];
      const put = (x, y, z) => {
        if (!view.project(x, y, z)) box[0] = -Infinity;
        box[0] = Math.min(box[0], view.X);
        box[1] = Math.min(box[1], view.Y);
        box[2] = Math.max(box[2], view.X);
        box[3] = Math.max(box[3], view.Y);
      };
      for (const pt of V.mesh(u, o).parts) for (const f of pt.faces) for (let i = 0; i < f.n; i++) put(f.p[i * 3], f.p[i * 3 + 1], f.p[i * 3 + 2]);
      const reach = 26 + (u.damage | 0) * 3 + 6;
      for (let a = 0; a < 16; a++) for (const dz of [-8, 8]) put(Math.cos((a * Math.PI) / 8) * reach, V.GUN.y + Math.sin((a * Math.PI) / 8) * reach, V.GUN.z + dz);
      painted.push({ paint: u.paint, dent: o.dent, gun: o.gun, eye: Array.from(view.eye), box });
      return vd0.call(this, c2, view, u, o);
    };
    // the eye: how far round from behind toward the van's left (degrees: 0 behind, 90 its left, 180 ahead), how high
    // (degrees over its middle)
    const turnOf = (e) => (Math.atan2(-e[0], -e[1]) * 180) / Math.PI;
    const riseOf = (e) => (Math.atan2(e[2] - V.H / 2, Math.hypot(e[0], e[1])) * 180) / Math.PI;
    const inFrame = (b, c2) => b[0] >= 0 && b[1] >= 0 && b[2] <= c2.width && b[3] <= c2.height;
    const show = (p) => JSON.stringify(Object.assign({}, p, { eye: p.eye.map((q) => Math.round(q)), box: p.box.map((q) => Math.round(q)) }));
    const last = U.PAINT_LOOKS.length - 1;
    const seenFrom = (p, what) => {
      const turn = turnOf(p.eye);
      if (!(turn >= 130 && turn <= 160)) fErr(`${what}: the van seen ${turn.toFixed(0)} degrees round from behind (want its front-left, 130 to 160)`);
      if (!(p.eye[0] < -V.W / 2 && p.eye[1] > V.L / 2 && p.eye[2] > V.H)) fErr(`${what}: the van seen from ${p.eye.map((q) => q.toFixed(0))} (want its left side, front and hood in sight)`);
      if (!inFrame(p.box, g)) fErr(`${what}: the van and its gun's reach lie ${p.box.map((q) => q.toFixed(0))} on a ${g.width} x ${g.height} picture (want all of it in)`);
    };
    for (const paint of [1, last - 1, last, 0]) {
      painted = [];
      where = `garage preview, paint ${paint}`;
      const again = G.showcase(g, Object.assign({}, ups, { paint }), 0, GV);
      if (paint !== 1 && !again) fErr(`the garage's preview did not draw again for paint ${paint}`);
      if (again && !(painted.length === 1 && painted[0].paint === paint && painted[0].gun === false && painted[0].dent === 0)) fErr(`the garage's preview drew the 3D van as ${painted.map(show)} for paint ${paint} (want it once, in that paint, undented, its gun the road's)`);
      if (again && painted.length) seenFrom(painted[0], `the garage's preview in paint ${paint}`);
    }
    // the biggest van there is (every upgrade at its top) is in the picture too
    const top = {};
    Object.keys(U.DEFS).forEach((k) => (top[k] = U.DEFS[k].max));
    painted = [];
    where = "garage preview, every upgrade at its top";
    if (!G.showcase(g, top, 0, GV) || painted.length !== 1) fErr(`the garage's preview of the top van drew ${painted.map(show)}`);
    else seenFrom(painted[0], "the garage's preview of the top van");
    const garageEye = painted.length ? painted[0].eye : null;
    painted = [];
    where = "garage preview, dented";
    if (!P.showcase(g, { upgrades: ups, kinds: kinds.slice(0, 2), seed: 0, dent: 2, view: "garage" }) || !(painted.length === 1 && painted[0].dent === 2)) fErr(`the garage's still scene with dents 2 drew ${painted.map(show)}`);
    // the same canvas from the title's view (the same van, walkers and dents) draws again, from behind the van, higher
    // than the garage's
    G.showcase(g, ups, 0, GV);
    painted = [];
    where = "the title's view after the garage's";
    if (!G.showcase(g, ups, 0) || painted.length !== 1) fErr(`the title's view after the garage's on one canvas drew ${painted.map(show)}`);
    else {
      const turn = turnOf(painted[0].eye);
      if (Math.abs(turn) > 10) fErr(`the title's view sees the van ${turn.toFixed(0)} degrees round from behind (want behind it)`);
      if (garageEye && !(riseOf(garageEye) < riseOf(painted[0].eye))) fErr(`the garage's camera looks down on the van ${riseOf(garageEye).toFixed(0)} degrees, the title's ${riseOf(painted[0].eye).toFixed(0)} (want the garage's lower)`);
    }
    // the Garage tab's preview (js/base.js Base.garageVan): dented as the save's van is now (Van3D.dentNow), drawn
    // again when that changes (a repair); the title shows no dents however hurt the van is
    {
      const file = path.join(ROOT, "js/base.js");
      if (!ZSR.Base && fs.existsSync(file)) vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: "js/base.js" });
      const St = ZSR.State;
      const keep = { trip: St.trip, hp: St.save.vanHp, max: St.vanMaxHp };
      St.trip = null;
      St.vanMaxHp = () => 100;
      const tab = canvasEl("garage tab");
      tab.width = 360;
      tab.height = 200;
      const hurt = V.dentTier(0.4);
      if (!(hurt > 0)) fErr(`a van at 40% health shows no dents (Van3D.dentTier ${hurt})`);
      if (!ZSR.Base || typeof ZSR.Base.garageVan !== "function") fErr("no Base.garageVan (js/base.js): the Garage tab's preview");
      else {
        for (const [hp, want, again] of [[100, 0, true], [100, 0, false], [40, hurt, true], [40, hurt, false], [100, 0, true]]) {
          St.save.vanHp = hp;
          painted = [];
          where = `the Garage tab's preview at ${hp}% health`;
          const did = ZSR.Base.garageVan(tab, ups);
          if (did !== again) fErr(`${where}: ${did ? "drew again with nothing changed" : "did not draw again"}`);
          if (did && !(painted.length === 1 && painted[0].dent === want)) fErr(`${where}: drew the van ${painted.map(show)} (want dents ${want})`);
          if (did && painted.length) seenFrom(painted[0], where);
        }
      }
      St.save.vanHp = 40;
      painted = [];
      where = "the title with the van hurt";
      const tc = canvasEl("title, hurt");
      tc.width = 320;
      tc.height = 200;
      if (!G.showcase(tc, ups, 0) || !(painted.length === 1 && painted[0].dent === 0)) fErr(`the title with the save's van at 40% drew ${painted.map(show)} (want it once, undented)`);
      St.trip = keep.trip;
      if (keep.hp === undefined) delete St.save.vanHp;
      else St.save.vanHp = keep.hp;
      if (keep.max === undefined) delete St.vanMaxHp;
      else St.vanMaxHp = keep.max;
    }
    V.draw = vd0;
    M.draw = d0;
    P.van = v0;
  }

  // the van on the road: the one 3D van, through the road's own camera, lit as the buildings
  {
    const V = ZSR.Van3D;
    const Mo = ZSR.Model3D;
    const U = ZSR.Upgrades;
    start("base", "grocery");
    G.ctx = screen.getContext("2d");
    for (let i = 0; i < 40; i++) G.update(1 / 60);
    let got = [];
    const vd0 = V.draw;
    V.draw = function (c2, view, u, o) {
      got.push({ view, u, o, eye: Array.from(view.eye) });
      return vd0.call(this, c2, view, u, o);
    };
    const one = (label) => {
      got = [];
      frame(label);
      if (got.length !== 1) fErr(`${label}: the 3D van drawn ${got.length} times in a frame (want once)`);
      return got[0];
    };
    const r = one("the van");
    if (r) {
      const view = r.view;
      const v = G.van;
      const fx = Math.cos(v.heading);
      const fy = Math.sin(v.heading);
      if (r.o.gun !== false) fErr("the road's 3D van carries its own gun (the road's aimed gun stands on it)");
      if (r.u !== (G.upgrades || ZSR.State.save.upgrades)) fErr("the road's 3D van is not in the save's upgrades");
      // its points where the road's camera puts them (model x its right, y its heading, z up)
      const k = P.setup(G);
      let worst = 0;
      for (const [x, y, z] of [[-33, -59, 0], [33, 59, 50], [0, 0, 25], [20, -40, 10], [-25, 50, 45]]) {
        const p = P.project(v.x - fy * x + fx * y, v.y + fx * x + fy * y, z);
        if (!view.project(x, y, z) || !p) {
          fErr(`the van's view lost its point ${x}, ${y}, ${z}`);
          continue;
        }
        worst = Math.max(worst, Math.hypot(view.X - p.x, view.Y - p.y), Math.abs(view.D - p.d));
      }
      if (worst > 1e-6) fErr(`the van's view puts its points ${worst.toFixed(4)} px off where the road's camera does`);
      // seen from the camera's own spot: k.b behind its foot, k.h up
      const cx = v.x - fy * r.eye[0] + fx * r.eye[1];
      const cy = v.y + fx * r.eye[0] + fy * r.eye[1];
      if (Math.hypot(cx - (k.ox - k.Fx * k.b), cy - (k.oy - k.Fy * k.b)) > 1e-6 || Math.abs(r.eye[2] - k.h) > 1e-6) fErr(`the van is seen from ${r.eye.map((q) => q.toFixed(1))} (its frame), not the camera's spot`);
      // lit by the buildings' light: a wall toward it brighter than one away, a top brighter than both, all in range
      const PB = ZSR.PerspBuild;
      const Ld = PB.LIGHT.dir;
      const toModel = (wx, wy) => [-fy * wx + fx * wy, fx * wx + fy * wy];
      const [ax, ay] = toModel(Ld[0], Ld[1]);
      const toward = view.lit(ax, ay, 0);
      const away = view.lit(-ax, -ay, 0);
      const top = view.lit(0, 0, 1);
      if (!(toward > away && top > toward && away > 0.5 && top < 1.25)) fErr(`the van is lit ${away.toFixed(2)} away from the light, ${toward.toFixed(2)} toward it, ${top.toFixed(2)} on top (want away < toward < top, in 0.5 .. 1.25)`);
      vanNote = `3D van lit ${away.toFixed(2)} / ${toward.toFixed(2)} / ${top.toFixed(2)} (away, toward, top), ink ${view.ink.toFixed(1)} px`;
      if (!(view.ink > 0 && view.lod === 0 && view.fog === 0 && view.tint === 0)) fErr(`the van near the camera: ink ${view.ink}, lod ${view.lod}, fog ${view.fog}, tint ${view.tint} (want ink, full detail, no haze, no flash)`);
      // its light and ink are the buildings' own (PerspBuild.LIGHT, inkW), read as it is drawn: the buildings' ink at
      // its size, and a change to their light shows on it the next frame (no copy of either kept in js/perspective.js)
      const mid = P.project(v.x, v.y, P.VAN_Z / 2);
      if (typeof PB.inkW !== "function") fErr("js/perspective-buildings.js exports no inkW for the van");
      else if (!mid || Math.abs(view.ink - PB.inkW(mid.s)) > 1e-9) fErr(`the van is inked ${view.ink} px, the buildings ${mid && PB.inkW(mid.s)} px at its size`);
      const L0 = PB.LIGHT;
      PB.LIGHT = Object.assign({}, L0, { top: L0.top + 20 });
      const r2 = one("the van, the buildings' light changed");
      const top2 = r2 ? r2.view.lit(0, 0, 1) : top;
      PB.LIGHT = L0;
      if (!(top2 > top + 0.1)) fErr(`a brighter top for the buildings (LIGHT.top + 20) leaves the van's top lit ${top2.toFixed(3)} (was ${top.toFixed(3)})`);
      // the roof gun stands on the model's roof: the top under its mount is at VAN_Z
      const m = V.mesh(r.u, { dent: 0, gun: false });
      const gy = -0.1 * v.h;
      let roof = -Infinity;
      for (const pt of m.parts) {
        for (const f of pt.faces) {
          if (f.hide || !(f.nz > 0.5)) continue;
          // the mount inside the face's outline seen from above, and the face's height there
          let inside = true;
          let sgn = 0;
          for (let i = 0; i < f.n && inside; i++) {
            const j = (i + 1) % f.n;
            const c = (f.p[j * 3] - f.p[i * 3]) * (gy - f.p[i * 3 + 1]) - (f.p[j * 3 + 1] - f.p[i * 3 + 1]) * (0 - f.p[i * 3]);
            if (Math.abs(c) < 1e-9) continue;
            if (!sgn) sgn = Math.sign(c);
            else if (Math.sign(c) !== sgn) inside = false;
          }
          if (inside) roof = Math.max(roof, f.cz - (f.nx * (0 - f.cx) + f.ny * (gy - f.cy)) / f.nz);
        }
      }
      if (!(Math.abs(roof - P.VAN_Z) <= 1)) fErr(`the roof gun's mount stands at ${P.VAN_Z}, the van's roof under it at ${roof.toFixed(1)}`);
    }
    // a hit flashes it; the trip's health dents it
    G.van.hurt = 1;
    const h = one("the van hit");
    if (h && !(Math.abs(h.view.tint - 0.6) < 1e-9 && h.view.tintR > h.view.tintG)) fErr(`a hit tints the van ${h.view.tint} toward ${h.view.tintR}, ${h.view.tintG}, ${h.view.tintB} (want 0.6, red)`);
    G.van.hurt = 0;
    const trip = ZSR.State.trip;
    const hp0 = trip.vanHp;
    for (const [share, want] of [[0.6, 1], [0.3, 2], [1, 0]]) {
      trip.vanHp = trip.vanMaxHp * share;
      const d = one(`the van at ${share * 100}% health`);
      if (d && d.o.dent !== want) fErr(`the van at ${share * 100}% health is drawn with dents ${d.o.dent} (want ${want})`);
    }
    trip.vanHp = hp0;
    // every paint job, with every gear upgrade at its top (Upgrades.DEFS max) on every other one
    const u0 = Object.assign({}, upgrades);
    const sigs = new Set();
    for (let paint = 0; paint < U.PAINT_LOOKS.length; paint++) {
      const top = (k) => (paint % 2 ? U.DEFS[k].max : 0);
      Object.assign(upgrades, { paint, armor: top("armor"), bumper: top("bumper"), engine: top("engine") });
      const p = one(`the van in paint ${paint}`);
      if (p) sigs.add(V.sig(p.u, p.o));
      if (p && Mo && !(Mo.draw(G.ctx, V.mesh(p.u, p.o), p.view) > 0)) fErr(`the van in paint ${paint} drew no faces`);
    }
    if (sigs.size !== U.PAINT_LOOKS.length) fErr(`${U.PAINT_LOOKS.length} paint jobs drew ${sigs.size} different vans`);
    vanNote += `, ${sigs.size} paint jobs`;
    Object.assign(upgrades, u0);
    V.draw = vd0;
    G.stop();
  }

  // the workbench's van: the same model from its side, its gun on, in the old picture's spot
  {
    const file = path.join(ROOT, "js/bench.js");
    if (!ZSR.Bench && fs.existsSync(file)) vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: "js/bench.js" });
    const V = ZSR.Van3D;
    if (!ZSR.Bench) fErr("no js/bench.js");
    else {
      const c = canvasEl("bench");
      c.width = 1280;
      c.height = 720;
      let got = [];
      const vd0 = V.draw;
      V.draw = function (c2, view, u, o) {
        got.push({ u, o });
        // the body's box on the screen: its x span and its lowest corner
        let x0 = Infinity;
        let x1 = -Infinity;
        let y1 = -Infinity;
        for (let q = 0; q < 8; q++) {
          view.project(q & 1 ? V.W / 2 : -V.W / 2, q & 2 ? V.L / 2 : -V.L / 2, q & 4 ? V.H : 0);
          x0 = Math.min(x0, view.X);
          x1 = Math.max(x1, view.X);
          y1 = Math.max(y1, view.Y);
        }
        // its nose to the right of its tail, its roof above its floor
        view.project(0, V.L / 2, V.H / 2);
        const nose = view.X;
        view.project(0, -V.L / 2, V.H / 2);
        const tail = view.X;
        view.project(0, 0, V.H);
        const top = view.Y;
        view.project(0, 0, 0);
        got[got.length - 1].box = { x0, x1, y1, nose, tail, up: top < view.Y };
        return vd0.call(this, c2, view, u, o);
      };
      for (const paint of [0, ZSR.Upgrades.PAINT_LOOKS.length - 1]) {
        got = [];
        where = `the workbench, paint ${paint}`;
        const u = { armor: 3, engine: 4, bumper: 2, paint, damage: 2, fireRate: 3, spread: 1 };
        try {
          ZSR.Bench.draw(c, { upgrades: u, dpr: 1, dent: 1 });
        } catch (e) {
          fErr(`${where}: threw ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
          continue;
        }
        const b = got[0] && got[0].box;
        // (the old picture: Bench.draw's x = 3% of the width, L = 38% of it or 62% of the height, on the floor at 93%)
        const L = Math.min(1280 * 0.38, 720 * 0.62);
        if (got.length !== 1) fErr(`${where}: the 3D van drawn ${got.length} times`);
        else if (!(got[0].u.paint === paint && got[0].o.gun === true && got[0].o.dent === 1)) fErr(`${where}: the van drawn as ${JSON.stringify([got[0].u.paint, got[0].o])} (want the save's paint, its gun on, the dents asked for)`);
        else if (!(Math.abs(b.x0 - 1280 * 0.03) < 0.5 && Math.abs(b.x1 - b.x0 - L) < 0.5 && Math.abs(b.y1 - 720 * 0.93) < 0.5 && b.nose > b.tail && b.up)) fErr(`${where}: the van's body spans ${b.x0.toFixed(1)} .. ${b.x1.toFixed(1)} px, floor at ${b.y1.toFixed(1)}, nose at ${b.nose.toFixed(0)} (tail ${b.tail.toFixed(0)}) (want ${(1280 * 0.03).toFixed(1)} .. ${(1280 * 0.03 + L).toFixed(1)}, floor at ${720 * 0.93}, the nose to the right, upright)`);
      }
      V.draw = vd0;
    }
  }

  // the map's van marker (js/sprites.js Draw.van, top-down): every paint job whole (body, roof, trim, bumpers, rims
  // and its decal in its own colours), with no exceptions or NaN
  {
    const looks = ZSR.Upgrades.PAINT_LOOKS;
    looks.forEach((look, paint) => {
      const c = canvasEl("map van");
      const ctx = c.getContext("2d");
      const used = new Set();
      const rec = new Proxy(ctx, {
        get: (o, k) => (k === "canvas" ? c : o[k]),
        set(o, k, v) {
          if (k === "fillStyle" || k === "strokeStyle") used.add(String(v).toLowerCase());
          o[k] = v;
          return true;
        },
      });
      where = `the map's van in paint ${paint}`;
      try {
        ZSR.Draw.van(rec, 0, 0, { upgrades: { armor: 2, engine: 3, bumper: 2, paint, damage: 1, fireRate: 0, spread: 1 }, scale: 0.34, moving: false });
      } catch (e) {
        fErr(`${where}: threw ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
        return;
      }
      const want = ["body", "roof", "trim", "bumper", "rims"].concat(look.decal === "none" ? [] : ["decalA"]);
      const missing = want.filter((k) => !used.has(look[k].toLowerCase()));
      if (missing.length) fErr(`${where} (${look.name}, decal ${look.decal}): no ${missing.join(", ")} drawn`);
    });
  }

  // a wall's picture in its own pixels (texWall): the destination as big as the source, never a unit square
  {
    start("base", "grocery");
    G.ctx = screen.getContext("2d");
    for (let i = 0; i < 30; i++) G.update(1 / 60);
    frame("texWall");
    P.setup(G);
    const img = { width: 64, height: 32 };
    log.length = 0;
    P.texWall(G.ctx, ahead(400, -40), ahead(400, 40), 0, 40, [{ img }, { img, flip: true, crop: [0.1, 0.9] }]);
    const di = log.filter((q) => q[1] === "drawImage" && q[2][0] === img);
    if (di.length !== 8) fErr(`texWall drew ${di.length} strips (want 4 a picture)`);
    for (const q of di) {
      const [, , , sw, sh, , , dw, dh] = q[2];
      if (!(dw >= sw - 1e-9 && dw <= sw * 1.05 && Math.abs(dh - sh) < 1e-9)) fErr(`texWall drew a ${sw.toFixed(1)} x ${sh} strip into ${dw.toFixed(2)} x ${dh} (want its own pixels)`);
    }
    G.stop();
  }

  G.hudRects = hud0;
  globalThis.document = realDoc;
  [...bad].slice(0, 12).forEach(fErr);
  console.log(`flat out: night drawn on change and down the van's heading (beam ${P.NIGHT_BEAM.reach}), fog ${P.FOG.near}..${P.FOG.far}, minimap arrow up and its fade for places in view, signs and hints off the road at 3 sizes, Spread Shot all hits, title screen and garage still scenes, ${vanNote}, the workbench's van in its spot, the map's van whole in every paint job, texWall in its own pixels, ${bad.size} bad calls`);
}
/* ---------- each place's own building on the angled camera (js/perspective-buildings.js) ----------
   Every place has a building row and every row is a place; every side street kind stands up. Every destination is
   driven to on the angled camera (its drive put on it here, as every drive will be) and drawn on a 2D context that
   records and checks every call, 1300 units out and parked: no exceptions, no NaN. Parked, every part of the building
   is in front of the camera, nothing low stands where the van parks (anywhere across the road at a place with one
   road), and the van is drawn after every part it overlaps on the screen. Walkers stood all round each building (not
   in it) are drawn before a part whose walls show it nearer the camera and after one that shows it farther, wherever
   the two overlap on the screen. The angled ground leaves out the flat pieces that stand, the card's squares key on
   that, name boards go with their building into the haze and keep out of the HUD's top row, and the Water Tower is
   drawn past the haze as a silhouette on the way to it. */
{
  const B = ZSR.PerspBuild;
  const P = ZSR.Persp;
  const D = ZSR.Draw;
  const bErr = (m) => err("places", m);
  const finite = (v) => typeof v === "number" && Number.isFinite(v);
  let where = "(setup)";
  const bad = new Set();
  const log = []; // [call, args, fillStyle]
  function context2d(canvas, tag) {
    const state = { fillStyle: "#000000", strokeStyle: "#000000", globalAlpha: 1, lineWidth: 1, font: "10px sans-serif", lineCap: "butt", lineJoin: "miter", imageSmoothingEnabled: true, imageSmoothingQuality: "low", textAlign: "start", textBaseline: "alphabetic", globalCompositeOperation: "source-over" };
    const stack = [];
    const calls = {
      save: () => stack.push(Object.assign({}, state)),
      restore: () => stack.length && Object.assign(state, stack.pop()),
      measureText: (t) => ({ width: String(t).length * 7 }),
      createLinearGradient: () => ({ addColorStop: noop }),
      createRadialGradient: () => ({ addColorStop: noop }),
      createPattern: () => ({}),
      getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) }),
      createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) }),
      getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
      isPointInPath: () => false,
      toDataURL: () => "",
    };
    return new Proxy(
      {},
      {
        get(o, k) {
          if (k === "canvas") return canvas;
          if (k in state) return state[k];
          if (typeof k !== "string") return undefined;
          return (...args) => {
            for (const a of args) if (typeof a === "number" && !finite(a)) bad.add(`${where}: ${tag} ${k}(${args.map((x) => (typeof x === "number" ? x : typeof x)).join(", ")})`);
            if (k === "drawImage" && !(args[0] && args[0].width > 0 && args[0].height > 0)) bad.add(`${where}: ${tag} drawImage() of something with no size`);
            if (tag === "screen") log.push([k, args, state.fillStyle]);
            return calls[k] ? calls[k](...args) : undefined;
          };
        },
        set(o, k, v) {
          if (k === "globalAlpha" && !(finite(v) && v >= 0 && v <= 1)) bad.add(`${where}: ${tag} globalAlpha ${v}`);
          if (k === "lineWidth" && !(finite(v) && v >= 0)) bad.add(`${where}: ${tag} lineWidth ${v}`);
          if (k in state) state[k] = v;
          else o[k] = v;
          return true;
        },
      }
    );
  }
  const canvasEl = (tag) => {
    const c = Object.assign(el(), { width: 300, height: 150, tagName: "CANVAS" });
    c.getContext = (kind) => (kind === "2d" ? c.ctx || (c.ctx = context2d(c, tag)) : null);
    return c;
  };
  if (!B) bErr("js/perspective-buildings.js did not load");
  else {
    const realDoc = globalThis.document;
    globalThis.document = Object.assign({}, realDoc, { createElement: (t) => (String(t).toLowerCase() === "canvas" ? canvasEl("pooled") : el()) });
    const screen = canvasEl("screen");
    screen.width = 1280;
    screen.height = 720;
    const R = B._R;
    // every place a row, every row a place, every side street kind its standing end
    W.LOCATIONS.forEach((l) => B.row(l.id) || bErr(`${l.id} (${l.name}) has no building row`));
    Object.keys(B.ROWS).forEach((id) => (W.LOCATIONS.some((l) => l.id === id) ? null : bErr(`building row "${id}" is no place`)));
    S.SIDE_STREETS.forEach((s) => B.ENDS[s.kind] || bErr(`side street kind "${s.kind}" (${s.name}) has no standing end`));
    if (P.groundKey() !== B.GROUND_KEY) bErr("the angled ground's squares are not keyed on what it leaves out (Persp.groundKey)");
    // the drawing order the frame drew in: items (Persp.drawItem) and buildings' parts (PerspBuild.onPart)
    const events = [];
    const item0 = P.drawItem;
    P.drawItem = function (g2, c2, o, fade) {
      events.push(o);
      return item0.call(this, g2, c2, o, fade);
    };
    B.onPart = (p) => events.push(p);
    const frame = (label) => {
      where = label;
      log.length = 0;
      events.length = 0;
      try {
        G.draw();
        return true;
      } catch (e) {
        bErr(`${label}: G.draw threw ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
        return false;
      }
    };
    // a lot's frame: its X right as the van drives in, V into the lot
    const toLot = (rec, x, y) => {
      const f = rec.f;
      return [(x - f.ox) * f.Rx + (y - f.oy) * f.Ry, (x - f.ox) * f.Nx + (y - f.oy) * f.Ny];
    };
    const atLot = (rec, X, V) => ({ x: rec.f.ox + rec.f.Rx * X + rec.f.Nx * V, y: rec.f.oy + rec.f.Ry * X + rec.f.Ny * V });
    const G0 = S.GEOM;
    const F = G0.half + G0.shoulder + G0.lotGap + B.LOT_FRONT;
    let drawn = 0;
    let orderPairs = 0;
    let orderBad = 0;
    let vanOver = 0;
    const orderMsgs = [];
    const towerSeen = { sky: 0 };
    for (const L of W.LOCATIONS) {
      const to = L.id;
      start(to === "base" ? "grocery" : "base", to);
      G.ctx = screen.getContext("2d");
      const lot = G.drive.lots.find((l) => l.node === to);
      const rec = B.rec(lot);
      if (!rec || !rec.parts.length) {
        bErr(`${to}: no parts in its building`);
        continue;
      }
      for (const p of rec.parts) if (!p.b.every(finite)) bErr(`${to}: a ${p.t} with a box ${p.b}`);
      let shot = false;
      drive(right, 1.0, () => {
        if (to === "watertower" && G.running) {
          // the tower past the haze: a silhouette (a frame every so often, while it is out there)
          const k = P.k;
          if (k && Math.floor(G.time * 60) % 30 === 0) {
            const Y = (rec.cx - k.ox) * k.Fx + (rec.cy - k.oy) * k.Fy;
            const X = (rec.cx - k.ox) * k.Rx + (rec.cy - k.oy) * k.Ry;
            if (Y > k.far && Y < k.far * B.LANDMARK_SEEN * 0.9 && Math.abs(X) < Y * 0.4) {
              frame(`${to} far off`);
              if (B.stats.skyline) towerSeen.sky++;
              else bErr(`the Water Tower ${Math.round(Y)} ahead (the haze at ${k.far}) was not drawn past the haze`);
            }
          }
        }
        if (!shot && G.van.s > G.track.len - 1300) {
          shot = true;
          if (frame(`${to} approach`)) drawn++;
        }
        return G.arrive && G.arrive.parked;
      });
      if (!(G.arrive && G.arrive.parked)) {
        bErr(`${to}: the angled drive did not park`);
        continue;
      }
      if (!frame(`${to} parked`)) continue;
      drawn++;
      if (!events.includes(lot)) bErr(`${to}: its building was not drawn when parked`);
      if (to === "watertower") {
        // at night its antenna light shines through the dark: drawn after the night's overlay (PerspBuild.drawLights)
        const night0 = P.night;
        P.night = function (...a) {
          log.push(["(night)", a, null]);
          return night0.apply(this, a);
        };
        const t0 = G.time;
        G.mods.night = true;
        G.time = 0; // (the blink's on phase)
        frame(`${to} parked at night`);
        G.mods.night = false;
        G.time = t0;
        P.night = night0;
        const dark = log.findIndex((c) => c[0] === "(night)");
        const lit = log.findIndex((c, i) => i > dark && c[0] === "fill" && c[2] === "#ff4a3a");
        if (dark < 0 || lit < 0) bErr(`the Water Tower's antenna light is not drawn over the night's dark (lights ${B.lights.length})`);
      }
      // all of it in front of the camera
      B.look(G, P, rec, 1);
      const sb = [0, 0, 0, 0];
      for (const p of rec.parts) {
        B._screenBox(p.b, sb);
        if (sb[0] === -1e9) bErr(`${to}: a ${p.t} of its building is behind the camera once parked`);
      }
      // the van after every part it overlaps on the screen
      const vb = B.itemSize(P, Object.assign({ _t: "van" }, G.van));
      const xs = vb.box.map(([x, y]) => toLot(rec, x, y));
      const vbox = [Math.min(...xs.map((q) => q[0])), Math.max(...xs.map((q) => q[0])), Math.min(...xs.map((q) => q[1])), Math.max(...xs.map((q) => q[1])), 0, 60];
      const vsb = B._screenBox(vbox, [0, 0, 0, 0]);
      const vanAt = events.indexOf(G.van);
      // nothing low stands where the van parks: its own box, a little round it (anywhere across the road at a place
      // with one road: the van parks in either of its lanes)
      const zone = S.startDir(to) ? [vbox[0] - 8, vbox[1] + 8] : [-G0.half, G0.half];
      for (const p of rec.parts) {
        const [x0, x1, v0, v1, z0] = p.b;
        if (z0 < 70 && v0 < vbox[3] + 4 && v1 > vbox[2] && x1 > zone[0] && x0 < zone[1]) bErr(`${to}: a ${p.t} stands where the van parks (X ${x0}..${x1}, V ${Math.round(v0 - F)}..${Math.round(v1 - F)} from the wall)`);
      }
      for (const p of rec.parts) {
        if (p.lod > R.lod) continue;
        const q = B._screenBox(p.b, [0, 0, 0, 0]);
        if (q[2] < vsb[0] || q[0] > vsb[2] || q[3] < vsb[1] || q[1] > vsb[3]) continue;
        const c = B._cmp(p.b, vbox);
        const at = events.indexOf(p);
        if (c === 1 || c === 2 || (at > vanAt && vanAt >= 0)) {
          vanOver++;
          bErr(`${to}: a ${p.t} of its building (box ${p.b.map(Math.round)}) is drawn over the parked van`);
        }
      }
      // walkers all round it (never in it, nor where the van stands): each drawn on the right side of each part
      const bd = rec.bounds;
      const inside = (X, V) => rec.parts.some((p) => X > p.b[0] - 24 && X < p.b[1] + 24 && V > p.b[2] - 24 && V < p.b[3] + 24) || (X > vbox[0] - 30 && X < vbox[1] + 30 && V > vbox[2] - 30 && V < vbox[3] + 30);
      G.zombies.length = 0;
      for (let X = bd[0] - 90; X <= bd[1] + 90; X += 45) {
        for (let V = bd[2] - 90; V <= bd[3] + 90; V += 45) {
          if (inside(X, V)) continue;
          const w = atLot(rec, X, V);
          const z = G.addZombie("walker", w.x, w.y);
          if (z) z.born = -1e9;
        }
      }
      if (!frame(`${to} parked, walkers round it`)) continue;
      B.look(G, P, rec, 1);
      const order = events.filter((e) => rec.parts.includes(e)); // (its parts as drawn)
      if (!order.length) bErr(`${to}: none of its building's parts were drawn once parked`);
      for (const p of order) p._sbT = B._screenBox(p.b, [0, 0, 0, 0]);
      for (const z of G.zombies) {
        const zi = events.indexOf(z);
        if (zi < 0) continue; // (off the screen)
        const [X, V] = toLot(rec, z.x, z.y);
        const r = z.r || 18;
        const zb = [X - r, X + r, V - r, V + r, 0, P.walkerH(z)];
        const zs = B._screenBox([X - r * 1.5, X + r * 1.5, V - r * 1.5, V + r * 1.5, 0, P.walkerH(z)], [0, 0, 0, 0]);
        for (const p of order) {
          const q = p._sbT;
          if (q[2] < zs[0] || q[0] > zs[2] || q[3] < zs[1] || q[1] > zs[3]) continue;
          const c = B._cmp(p.b, zb);
          if (c !== -1 && c !== 1) continue;
          orderPairs++;
          const pi = events.indexOf(p);
          if (pi < 0) continue;
          if ((c === -1 && pi > zi) || (c === 1 && pi < zi)) {
            orderBad++;
            if (orderMsgs.length < 6) orderMsgs.push(`${to}: a walker at X ${Math.round(X)}, V ${Math.round(V - F)} from the wall drawn ${c === -1 ? "under" : "over"} a ${p.t} (box ${p.b.map(Math.round)})`);
          }
        }
      }
      G.zombies.length = 0;
      G.stop();
    }
    // (a walker that stands between two parts the other way round from how they are drawn has no right place: it goes
    // where the least of it is drawn wrong; at most one pair in a hundred)
    if (orderBad > orderPairs * 0.01) {
      orderMsgs.forEach(bErr);
      bErr(`${orderBad} of ${orderPairs} walker-and-part pairs drawn the wrong way round`);
    }
    if (!towerSeen.sky) bErr("the Water Tower was never seen past the haze on the way to it");
    // name boards: none for a building gone into the haze, and none in the HUD's top row (a box over the whole top)
    {
      start("base", "hospital");
      G.ctx = screen.getContext("2d");
      const boards = [];
      const nb0 = D.nameBoard;
      D.nameBoard = function (c2, x, y, text, k, hot) {
        boards.push({ x, y, text, alpha: c2.globalAlpha });
        return nb0.call(this, c2, x, y, text, k, hot);
      };
      const hud0 = G.hudRects;
      const ROW = 210;
      G.hudRects = () => ({ top: null, row: ROW, low: [], boxes: [{ left: -1e4, right: 1e4, top: 0, bottom: ROW }], mini: null });
      let checked = 0;
      drive(right, 1.0, () => {
        if (Math.floor(G.time * 60) % 20) return G.arrive && G.arrive.parked;
        boards.length = 0;
        frame("name boards");
        const k = P.k;
        for (const bd of boards) {
          checked++;
          if (bd.y < ROW) bErr(`a name board ("${bd.text}") drawn at y ${Math.round(bd.y)}, in the HUD's top row (to ${ROW})`);
          const l = G.drive.lots.find((q) => G.placeName(q.node).toUpperCase() === bd.text);
          const rec = l && B.rec(l);
          if (!rec) continue;
          const Y = (rec.cx - k.ox) * k.Fx + (rec.cy - k.oy) * k.Fy;
          if (P.fadeAt(Y) < 0.15) bErr(`a name board ("${bd.text}") drawn over a building gone into the haze (${Math.round(Y)} ahead)`);
          if (!(bd.alpha <= P.fadeAt(Y) + 1e-6)) bErr(`a name board ("${bd.text}") stronger than its building (${bd.alpha.toFixed(2)} over ${P.fadeAt(Y).toFixed(2)})`);
        }
        return G.arrive && G.arrive.parked;
      });
      if (!checked) bErr("no name board was drawn on the way to St. Anne Annex");
      D.nameBoard = nb0;
      G.hudRects = hud0;
      G.stop();
    }
    // the angled ground leaves out what stands; drawn without the buildings (no js/perspective-buildings.js), the
    // ground keeps its flat pieces
    {
      start("base", "grocery");
      const fills = (fn, style) => {
        log.length = 0;
        fn(screen.getContext("2d"));
        return log.filter((c) => (c[0] === "fill" || c[0] === "fillRect") && c[2] === style).length;
      };
      const closed = G.drive.sides.find((s) => s.kind === "closed");
      if (!closed) bErr("no closed side street on Home Base to Corner Grocery to test");
      else {
        const view = { x: closed.x1, y: closed.y1, r: 400 };
        if (fills((c) => P.drawGround(G, c, Object.assign({}, view)), "#d4621e")) bErr("the angled ground still paints a closed side street's barricade flat");
        if (!fills((c) => D.cityRoads(c, G.drive, G0, null, view), "#d4621e")) bErr("the ground without the buildings lost its closed side street's barricade");
      }
      for (const [id, style, what] of [["gasngo", "#b3261e", "gas canopy"], ["river", "#6b4a2e", "log stops"]]) {
        const lot = Object.assign({}, G.drive.lots[0], { node: id });
        const look = W.place(id);
        if (fills((c) => D.lot(c, lot, G0, look, B.lotGround(lot)), style)) bErr(`the angled ground still paints the ${what} flat`);
        if (!fills((c) => D.lot(c, lot, G0, look), style)) bErr(`the ground without the buildings lost the ${what}`);
      }
      G.stop();
    }
    P.drawItem = item0;
    B.onPart = null;
    globalThis.document = realDoc;
    [...bad].slice(0, 12).forEach(bErr);
    console.log(`places: ${W.LOCATIONS.length} buildings drawn (${drawn} approach and parked frames), ${orderPairs} walker-and-part pairs (${orderBad} the wrong way round), the van under none, the tower past the haze ${towerSeen.sky} times, ${bad.size} bad calls`);
  }
}
/* ---------- the angled camera's walkers keeping up with the van: their feet go with them ----------
   Beside and behind the van (out of its reach) every kind faces the way it goes, so its feet do not slide sideways
   (as on foot: js/interior.js animWalker), and runs (Walker3D st.run) at a cadence a body can run at. Ahead of the van
   there is no keep-up pull (owner, 2026-10-17): a walker there walks at the van at its own pace with its feet planted,
   and never moves away from the van while its legs walk toward it (the old "moonwalk"); over the band where it goes
   over to keeping up (KEEP.band) it may slip a little as it turns. One in the van's path walks straight into the nose
   and is shoved off it to a side within a moment, where it keeps up and claws at the van. */
{
  const P = ZSR.Persp;
  const M = ZSR.Walker3D;
  const TILE = P.TILE;
  const K = G.KEEP;
  const kinds = Object.keys(W.WALKER_TYPES);
  const q90 = (a) => (a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length * 0.9)] : NaN);
  const out = [];
  if (!K || !(K.band > 0)) err("persp feet", "Game.KEEP (the keep-up carry by where a walker is) is missing");
  for (const engine of [0, 5]) {
    upgrades.engine = engine;
    const slides = [];
    const steps = [];
    const runs = [];
    const ahead = { slides: [], back: [], band: [] };
    for (let rep = 0; rep < 2; rep++) {
      start("base", "grocery");
      for (let i = 0; i < 30; i++) G.update(1 / 60);
      const v = G.van;
      const fx = Math.cos(v.heading);
      const fy = Math.sin(v.heading);
      G.zombies.length = 0;
      const put = (type, a, side) => Object.assign(G.addZombie(type, v.x + fx * a - fy * side, v.y + fy * a + fx * side), { hp: 1e4, maxHp: 1e4, dmg: 0, born: -10 });
      kinds.forEach((k, i) => {
        put(k, -40 + 40 * (i % 3), (i % 2 ? 1 : -1) * (300 + 25 * i)); // beside, well out to a side
        put(k, -260 - 70 * i, (i % 2 ? 1 : -1) * 90); // behind
        put(k, 500 + 120 * i + 200 * rep, (i % 2 ? 1 : -1) * (60 + 70 * rep)); // ahead, near the road's middle
        put(k, 700 + 90 * i + 150 * rep, (i % 2 ? -1 : 1) * (250 + 90 * i)); // ahead, out to a side
      });
      for (let f = 0; f < 150; f++) {
        const prev = new Map(G.zombies.map((z) => [z, [z.x, z.y, z.gait]]));
        G.update(1 / 60);
        if (!G.running) break;
        if (f < 45) continue; // (their motion smoothed and turned to)
        const band = Math.max(K.bandMin, K.band * G.curSpeed);
        for (const z of G.zombies) {
          const p0 = prev.get(z);
          if (!p0 || z.pose !== "walk" || z.poseW < 1) continue;
          const ly = (z.x - G.van.x) * Math.cos(G.van.heading) + (z.y - G.van.y) * Math.sin(G.van.heading);
          const vx = (z.x - p0[0]) * 60;
          const vy = (z.y - p0[1]) * 60;
          const sp = Math.hypot(vx, vy);
          const slide = Math.hypot(vx - Math.cos(z.heading) * sp * z.move, vy - Math.sin(z.heading) * sp * z.move);
          if (ly > G.van.h / 2) {
            // ahead: planted past the band, and never backward against the way it faces anywhere
            (ly > G.van.h / 2 + band ? ahead.slides : ahead.band).push(slide);
            ahead.back.push(-(vx * Math.cos(z.heading) + vy * Math.sin(z.heading)));
            continue;
          }
          slides.push(slide);
          if (z.type === "walker" && sp > 2 * W.WALKER_TYPES.walker.speed * TILE) {
            steps.push(((((z.gait - p0[2]) % 1) + 1) % 1) * 60 * 2); // two steps a gait cycle
            runs.push(z.run);
          }
        }
      }
      G.stop();
    }
    const slide = q90(slides);
    const cad = steps.length ? steps.reduce((a, b) => a + b, 0) / steps.length : NaN;
    const run = runs.length ? runs.reduce((a, b) => a + b, 0) / runs.length : NaN;
    const front = q90(ahead.slides);
    const band = q90(ahead.band);
    const backward = ahead.back.filter((b) => b > 0.15 * TILE).length;
    if (!(slides.length > 200)) err("persp feet", `engine ${engine}: only ${slides.length} walker frames beside or behind the van to check`);
    if (!(slide < 30)) err("persp feet", `engine ${engine}: walkers beside and behind the van slide ${slide.toFixed(0)} units/s (90th percentile) against the way they face (want under 30)`);
    if (!(ahead.slides.length > 200)) err("persp feet", `engine ${engine}: only ${ahead.slides.length} walker frames ahead of the van to check`);
    if (!(front < 15)) err("persp feet", `engine ${engine}: walkers ahead of the van slide ${front.toFixed(0)} units/s (90th percentile; want under 15: no keep-up pull in front, they walk at the van)`);
    if (!(band < 60)) err("persp feet", `engine ${engine}: walkers going over to keeping up just ahead of the nose slip ${band.toFixed(0)} units/s (90th percentile; want under 60)`);
    if (backward) err("persp feet", `engine ${engine}: ${backward} frames of a walker ahead of the van moving backward against the way it faces (a moonwalk)`);
    if (!(steps.length > 20)) err("persp feet", `engine ${engine}: no walker kept up with the van beside it`);
    else {
      // (a walk cycle at the walk's stride took 8.7 and 12 to 14; running strides, 5.3 and 8.3)
      const most = engine ? 9.5 : 7;
      if (!(cad >= 3 && cad <= most)) err("persp feet", `engine ${engine}: a walker keeping up beside the van takes ${cad.toFixed(1)} steps a second (a run: 3 to ${most})`);
      if (!(run > 0.5)) err("persp feet", `engine ${engine}: a walker keeping up beside the van runs only ${run.toFixed(2)} of the way (Walker3D st.run)`);
    }
    // in the van's path: every kind walks at the van at its own pace, onto the nose, and is shoved off it to a side
    start("base", "grocery");
    for (let i = 0; i < 30; i++) G.update(1 / 60);
    const v = G.van;
    const fx = Math.cos(v.heading);
    const fy = Math.sin(v.heading);
    G.zombies.length = 0;
    const path = kinds.map((k, i) => Object.assign(G.addZombie(k, v.x + fx * (500 + 140 * i) - fy * ((i % 3) - 1) * 12, v.y + fy * (500 + 140 * i) + fx * ((i % 3) - 1) * 12), { hp: 1e4, maxHp: 1e4, born: -10, scream: false }));
    const rec = new Map(path.map((z) => [z, { pace: [], run: 0, nose: 0, side: 0 }]));
    for (let f = 0; f < 60 * 5 && G.running; f++) {
      const prev = new Map(G.zombies.map((z) => [z, [z.x, z.y]]));
      G.update(1 / 60);
      const V = G.van;
      const Fx = Math.cos(V.heading);
      const Fy = Math.sin(V.heading);
      for (const z of G.zombies) {
        const r = rec.get(z);
        if (!r) continue;
        const lx = (z.x - V.x) * -Fy + (z.y - V.y) * Fx;
        const ly = (z.x - V.x) * Fx + (z.y - V.y) * Fy;
        const ax = V.w / 2 + z.r * 0.85;
        const ay = V.h / 2 + z.r * 0.85;
        if (ly >= ay - 1 && ly <= ay + 6 && Math.abs(lx) < ax) r.nose = Math.max(r.nose, (r.run += 1 / 60));
        else r.run = 0;
        if (Math.abs(ly) < V.h / 2 && Math.abs(lx) >= ax - 1 && Math.abs(lx) < ax + 40) r.side += 1 / 60;
        const p0 = prev.get(z);
        if (p0 && ly > ay + 60) {
          const dx = V.x - z.x;
          const dy = V.y - z.y;
          const d = Math.hypot(dx, dy);
          r.pace.push(((z.x - p0[0]) * 60 * dx + (z.y - p0[1]) * 60 * dy) / d / z.speed);
        }
      }
    }
    let worstNose = 0;
    for (const [z, r] of rec) {
      const pace = r.pace.length ? r.pace.reduce((a, b) => a + b, 0) / r.pace.length : NaN;
      if (!(Math.abs(pace - 1) < 0.1)) err("persp feet", `engine ${engine}: a ${z.type} in the van's path came at it at ${pace.toFixed(2)} times its own pace (want 1: no keep-up pull in front)`);
      if (!(r.nose < 0.35)) err("persp feet", `engine ${engine}: a ${z.type} rode the van's nose for ${r.nose.toFixed(2)} s (want it shoved off to a side within 0.35 s)`);
      if (!(r.side > 0.2)) err("persp feet", `engine ${engine}: a ${z.type} shoved off the nose pressed on the van's side only ${r.side.toFixed(2)} s`);
      worstNose = Math.max(worstNose, r.nose);
    }
    G.stop();
    out.push(`engine ${engine}: slide ${slide.toFixed(0)} units/s beside and behind, ${front.toFixed(0)} ahead (${band.toFixed(0)} going over), ${backward} backward (p90), a walker beside it ${cad.toFixed(1)} steps/s, run ${run.toFixed(2)}, on the nose at most ${worstNose.toFixed(2)} s`);
  }
  upgrades.engine = 0;
  if (M) console.log(`persp feet: ${out.join("; ")}`);
}
/* ---------- buildings and the river block walkers (owner, 2026-10-17) ----------
   A walker put inside a building's solid part (js/perspective-buildings.js solids) or the river with its muddy bank
   (Draw.riverEdge) is put back out at once; one behind a building walks round it to the van instead of pressing on
   its back wall; and over drives with walkers coming (a sample of routes here, every route with --all-walkers) none
   comes from inside either or ever stands in one. */
{
  const B = ZSR.PerspBuild;
  const Dr = ZSR.Draw;
  const bErr = (m) => err("walkers blocked", m);
  const quads = () => G.drive.lots.flatMap((l) => B.solids(l));
  // how deep a point is inside a convex quad (positive inside), straight from the buildings' corners
  const depthIn = (c, x, y) => {
    const cx = (c[0].x + c[2].x) / 2;
    const cy = (c[0].y + c[2].y) / 2;
    let m = Infinity;
    for (let i = 0; i < 4; i++) {
      const a = c[i];
      const b = c[(i + 1) % 4];
      const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      let nx = -(b.y - a.y) / L;
      let ny = (b.x - a.x) / L;
      if ((cx - a.x) * nx + (cy - a.y) * ny < 0) [nx, ny] = [-nx, -ny];
      m = Math.min(m, (x - a.x) * nx + (y - a.y) * ny);
    }
    return m;
  };
  const inside = (Q, z) => Math.max(...Q.map((c) => depthIn(c, z.x, z.y))) + z.r * 0.85;
  const wet = (z) => z.r * 0.85 - Dr.riverEdge(z.x, z.y, G.drive.scale);
  if (!B || typeof B.solids !== "function" || typeof G.blockWalker !== "function") bErr("no solids (PerspBuild.solids) or no Game.blockWalker");
  else {
    // put out at once: a walker of every kind in the middle of every solid part, and all along the river
    start("base", "grocery");
    for (let i = 0; i < 5; i++) G.update(1 / 60);
    const Q = quads();
    const kinds = Object.keys(W.WALKER_TYPES);
    let put = 0;
    Q.forEach((c, i) => {
      const k = kinds[i % kinds.length];
      const z = G.addZombie(k, (c[0].x + c[2].x) / 2, (c[0].y + c[2].y) / 2);
      G.blockWalker(z); // (one call: every part it is in, in a few passes)
      put++;
      if (inside(Q, z) > 0.5) bErr(`a ${k} in the middle of a building's part was left ${inside(Q, z).toFixed(1)} inside it`);
    });
    const R = S.RIVER;
    const k = G.drive.scale;
    let wetPut = 0;
    R.curves.forEach(([p0, p1, p2]) => {
      for (let t = 0; t <= 1; t += 0.05) {
        const m = 1 - t;
        const x = (m * m * p0[0] + 2 * m * t * p1[0] + t * t * p2[0]) * k;
        const y = (m * m * p0[1] + 2 * m * t * p1[1] + t * t * p2[1]) * k;
        for (const off of [0, R.half * k * 0.7, R.half * k + R.bank * 0.6]) {
          const z = G.addZombie(kinds[wetPut % kinds.length], x + off, y);
          // (from the river's middle a walker may take a few steps to reach the bank: each step puts it out its way)
          for (let n = 0; n < 40 && wet(z) > 0.5; n++) G.blockWalker(z);
          wetPut++;
          if (wet(z) > 0.5) bErr(`a walker put in the river at ${x.toFixed(0)}, ${y.toFixed(0)} was left ${wet(z).toFixed(1)} in it`);
        }
      }
    });
    G.zombies.length = 0;
    G.stop();
    // round a building: the van parked at the grocery's door, three walkers of different kinds behind the building
    // (6 seeded tries) all come round to it, never inside it
    const lcg = (seed) => {
      let q = seed >>> 0;
      return () => ((q = (q * 1664525 + 1013904223) >>> 0) / 4294967296);
    };
    const random0 = Math.random;
    let came = 0;
    let tries = 0;
    let worst = 0;
    let slowest = 0;
    for (let seed = 1; seed <= 6; seed++) {
      Math.random = lcg(seed * 7919);
      start("base", "grocery");
      drive(right, 1.0, () => G.arrive && G.arrive.parked);
      if (!(G.running && G.arrive && G.arrive.parked)) {
        bErr("the van never parked at the grocery");
        break;
      }
      G.arrive.t = -1e9; // (stay parked)
      const lot = G.drive.lots.find((l) => l.node === "grocery");
      const Qg = B.solids(lot);
      const c = Qg[0];
      const mid = { x: (c[0].x + c[2].x) / 2, y: (c[0].y + c[2].y) / 2 };
      const v = G.van;
      const away = Math.hypot(mid.x - v.x, mid.y - v.y);
      const ux = (mid.x - v.x) / away;
      const uy = (mid.y - v.y) / away;
      const half = Math.max(...c.map((p) => Math.hypot(p.x - mid.x, p.y - mid.y)));
      const off = [-0.3, 0, 0.3][seed % 3];
      const behind = [0, 1, 2].map((i) => Object.assign(G.addZombie(kinds[(i + seed) % kinds.length], mid.x + ux * (half + 60) - uy * (off + (i - 1) * 0.3) * half, mid.y + uy * (half + 60) + ux * (off + (i - 1) * 0.3) * half), { hp: 1e4, maxHp: 1e4, dmg: 0, born: -10 }));
      const at = new Map();
      for (let f = 0; f < 60 * 30 && G.running && at.size < behind.length; f++) {
        G.update(1 / 60);
        for (const z of behind) {
          worst = Math.max(worst, inside(Qg, z));
          if (!at.has(z) && Math.hypot(z.x - G.van.x, z.y - G.van.y) < 160) at.set(z, f / 60);
        }
      }
      tries += behind.length;
      came += at.size;
      for (const tt of at.values()) slowest = Math.max(slowest, tt);
      G.stop();
    }
    Math.random = random0;
    // (2 units: one squeezed between the parked van's nose and the wall, 45 apart, is put out of the van last)
    if (worst > 2) bErr(`a walker going round the grocery was ${worst.toFixed(1)} inside it`);
    if (came < tries) bErr(`only ${came} of ${tries} walkers behind the grocery came round it to the parked van in 30 s`);
    // drives with walkers coming: none from inside a building or the river, none ever in one
    const all = process.argv.includes("--all-walkers");
    const ids = W.LOCATIONS.map((l) => l.id);
    const pairs = [];
    ids.forEach((a, i) => ids.forEach((b, j) => a !== b && (all || (i + 2 * j) % 17 === 0) && pairs.push([a, b])));
    const sp0 = G.spawnZombie;
    let spawned = 0;
    let badSpawn = 0;
    let frames = 0;
    let inB = 0;
    let inR = 0;
    let deepB = 0;
    let deepR = 0;
    let Qd = [];
    G.spawnZombie = function (type) {
      const z = sp0.call(this, type);
      if (z) {
        spawned++;
        if (inside(Qd, z) > -10 || wet(z) > -10) badSpawn++;
      }
      return z;
    };
    const day0 = ZSR.State.save.day;
    ZSR.State.save.day = 10;
    const t0 = Date.now();
    for (const [a, b] of pairs) {
      start(a, b);
      G.spawnTimer = 0;
      Qd = quads();
      drive(right, 1.0, () => {
        for (const z of G.zombies) {
          frames++;
          const d = Qd.length ? inside(Qd, z) : -1;
          const e = wet(z);
          if (d > 1) inB++;
          if (e > 1) inR++;
          deepB = Math.max(deepB, d);
          deepR = Math.max(deepR, e);
        }
      });
      G.stop();
    }
    ZSR.State.save.day = day0;
    G.spawnZombie = sp0;
    if (!(spawned > 200)) bErr(`only ${spawned} walkers came on ${pairs.length} drives`);
    if (badSpawn) bErr(`${badSpawn} of ${spawned} walkers came from inside a building or the river (or within 10 of one)`);
    if (inB) bErr(`${inB} walker frames inside a building's solid part (deepest ${deepB.toFixed(1)})`);
    if (inR) bErr(`${inR} walker frames in the river or on its bank (deepest ${deepR.toFixed(1)})`);
    console.log(`walkers blocked: ${put} put in buildings' parts and ${wetPut} in the river, all put out; ${came} of ${tries} walkers behind a building came round it (the slowest in ${slowest.toFixed(1)} s, at most ${worst.toFixed(1)} into it); ${pairs.length} drives (${all ? "every route" : "a sample: --all-walkers for every route"}), ${spawned} walkers, ${frames} walker frames: ${badSpawn} came from inside, ${inB} in a building, ${inR} in the river (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
}
/* ---------- no new walkers come while ROAD_WALKERS_MAX are on the road ---------- */
{
  const cErr = (m) => err("walker cap", m);
  const M = G.ROAD_WALKERS_MAX;
  if (!(M >= 20)) cErr(`ROAD_WALKERS_MAX is ${M}`);
  else {
    start("base", "hospital");
    for (let i = 0; i < 30; i++) G.update(1 / 60);
    const v = G.van;
    const fx = Math.cos(v.heading);
    const fy = Math.sin(v.heading);
    G.zombies.length = 0;
    // a crowd at the cap, standing still well off the road ahead (so none goes)
    for (let i = 0; i < M; i++) Object.assign(G.addZombie("walker", v.x + fx * (900 + 40 * i) - fy * 1500, v.y + fy * (900 + 40 * i) + fx * 1500), { hp: 1e6, maxHp: 1e6, speed: 0, born: -10 });
    G.spawnTimer = 0;
    let most = 0;
    for (let f = 0; f < 60 * 4 && G.running; f++) {
      G.update(1 / 60);
      most = Math.max(most, G.zombies.length);
    }
    if (most > M) cErr(`${most} walkers on the road with ${M} the cap`);
    // and with room again, they come again
    G.zombies.length = M - 10;
    G.spawnTimer = 0;
    let came = false;
    const n0 = G.zombies.length;
    for (let f = 0; f < 60 * 4 && G.running && !came; f++) {
      G.update(1 / 60);
      came = G.zombies.length > n0;
    }
    if (!came) cErr("no walker came with room under the cap");
    G.stop();
    console.log(`walker cap: at most ${most} walkers on the road with the cap at ${M}; under it they come again`);
  }
}
/* ---------- a slow machine's long frames: the road in steps (ROAD_STEP), the frame clamped at MAX_FRAME_DT ----------
   One frame of 0.1 s (10 frames a second) is exactly six of 1/60 s, and one of 1/30 two: the van, every walker (its
   place and health), the shots, kills, scrap and the van's health, with walkers coming, a gun firing and the lanes
   changing on the same 0.1 s beats. So a machine down to 1 / MAX_FRAME_DT frames a second plays at full speed (the
   old 0.05 s clamp ran it in slow motion below 20). */
{
  const sErr = (m) => err("road steps", m);
  if (!(G.ROAD_STEP > 0 && G.ROAD_STEP <= 1 / 60 + 1e-12)) sErr(`ROAD_STEP is ${G.ROAD_STEP} (want at most 1/60 s)`);
  if (!(G.MAX_FRAME_DT >= 0.1)) sErr(`MAX_FRAME_DT is ${G.MAX_FRAME_DT} (want at least 0.1 s: 10 frames a second at full speed)`);
  const lcg = (seed) => {
    let q = seed >>> 0;
    return () => ((q = (q * 1664525 + 1013904223) >>> 0) / 4294967296);
  };
  const random0 = Math.random;
  const day0 = ZSR.State.save.day;
  const up0 = Object.assign({}, upgrades);
  const trip = (frame, secs, a, b) => {
    Math.random = lcg(4242);
    ZSR.State.save.day = 5;
    Object.assign(upgrades, { engine: 2, damage: 2, fireRate: 2 });
    start(a, b);
    G.spawnTimer = 0.5;
    let came = 0;
    const add0 = G.addZombie;
    G.addZombie = function (...args) {
      came++;
      return add0.apply(this, args);
    };
    const per = Math.round(0.1 / frame);
    const N = Math.round(secs / frame);
    for (let k = 0; k < N && G.running; k++) {
      if (k % per === 0) {
        const tt = k / per / 10;
        const dec = G.upcoming();
        G.keys.left = G.keys.right = false;
        if (dec && !G.turn && (dec.stop - G.van.s) / G.speed < 1.0) {
          const o = right(dec);
          const lane = o.lanes.reduce((best, l) => (Math.abs(S.laneCenter(l, dec.n) - G.van.d) < Math.abs(S.laneCenter(best, dec.n) - G.van.d) ? l : best), o.lanes[0]);
          const tg = S.laneCenter(lane, dec.n);
          G.keys.left = G.van.d > tg + 8;
          G.keys.right = G.van.d < tg - 8;
        }
        Object.assign(G.pointer, { seen: true, x: G.W / 2 + 80 * Math.sin(tt), y: G.H * 0.45, down: true });
      }
      G.update(frame);
    }
    G.addZombie = add0;
    const st = { came, van: [G.van.x, G.van.y, G.van.s], walkers: G.zombies.map((z) => [z.type, z.x, z.y, z.hp]), shots: G.bullets.length, kills: ZSR.State.trip.walkers, scrap: ZSR.State.trip.scrap, hp: ZSR.State.trip.vanHp, time: G.time };
    G.stop();
    G.pointer.down = false;
    return st;
  };
  let checked = 0;
  let downed = 0;
  for (const [a, b] of [["base", "hospital"], ["police", "mall"]]) {
    const ref = trip(1 / 60, 20, a, b);
    for (const frame of [0.1, 1 / 30]) {
      const got = trip(frame, 20, a, b);
      checked++;
      if (JSON.stringify(got) !== JSON.stringify(ref)) {
        const gap = Math.max(...got.van.map((v, i) => Math.abs(v - ref.van[i])));
        sErr(`${a} to ${b}: 20 s in frames of ${frame.toFixed(3)} s is not 20 s in frames of 1/60 (van ${gap.toFixed(3)} apart; walkers ${got.walkers.length} against ${ref.walkers.length}, kills ${got.kills} against ${ref.kills}, health ${got.hp} against ${ref.hp})`);
      }
    }
    if (!(ref.came >= 8)) sErr(`${a} to ${b}: only ${ref.came} walkers came in 20 s to check`);
    downed += ref.kills;
  }
  if (!downed) sErr("no walker was shot down on the drives checked");
  // a browser's 60 Hz frames (16.6 to 16.8 ms apart: its clock is rounded to 0.1 ms; a 59.94 Hz screen's are 16.7 or
  // 16.8) each run ONE road step of four drive steps, as the balance run's 1/60 s frames do; 1/30 s runs two, 0.1 s six
  {
    start("base", "hospital");
    let roads = 0;
    let drives = 0;
    const rs0 = G.roadStep;
    const ds0 = G.driveStep;
    G.roadStep = function (...args) {
      roads++;
      return rs0.apply(this, args);
    };
    G.driveStep = function (...args) {
      drives++;
      return ds0.apply(this, args);
    };
    for (const [ms, want] of [[16.6, 1], [16.7, 1], [16.8, 1], [1000 / 60, 1], [1000 / 59.94, 1], [1000 / 30, 2], [100, 6]]) {
      roads = drives = 0;
      G.update(ms / 1000);
      if (roads !== want || drives !== want * 4) sErr(`a frame of ${ms.toFixed(2)} ms ran ${roads} road steps and ${drives} drive steps (want ${want} and ${want * 4})`);
    }
    G.roadStep = rs0;
    G.driveStep = ds0;
    G.stop();
  }
  Math.random = random0;
  ZSR.State.save.day = day0;
  Object.assign(upgrades, up0);
  console.log(`road steps: ${checked} drives of 20 s in frames of 0.1 s and 1/30 s the same as in 1/60 s (van, walkers, shots, kills, scrap, health); a browser's 16.6-16.8 ms frames one step each; a frame counts up to ${G.MAX_FRAME_DT} s`);
}
/* ---------- the angled camera's ground squares on the card (js/perspective-gl.js, WebGL stubbed) ----------
   A drive's squares, made on a clock that charges each size what a graphics card might (1.5, 0.8 and 0.4 ms): a square
   the view will need again soon is kept, not pushed off and made again (fewer than 10% made twice); a view that needs
   more squares than the card keeps (a very wide screen) never loses one it is using; and after the card is lost and
   given back the ground comes back on it, every square drawn anew. */
{
  const GL = ZSR.PerspGL;
  const P = ZSR.Persp;
  const glErr = (m) => err("persp ground", m);
  // a WebGL context that does nothing (every shader compiles), on a canvas that keeps its listeners
  const stub = new Proxy({}, { get: (o, k) => (typeof k !== "string" ? undefined : /^[A-Z_0-9]+$/.test(k) ? 0 : /^get(Shader|Program)Parameter$/.test(k) ? () => true : k === "getExtension" ? () => null : () => ({})) });
  const on = {};
  const card = { width: 0, height: 0, style: {}, setAttribute: noop, addEventListener: (t, fn) => (on[t] = fn), getContext: (kind) => (kind === "webgl" ? stub : null) };
  const realDoc = globalThis.document;
  const realPerf = globalThis.performance;
  const make0 = GL.make;
  let clock = 0;
  globalThis.document = Object.assign({}, realDoc, { createElement: () => card });
  globalThis.performance = { now: () => clock };
  const COST = { 512: 1.5, 256: 0.8, 128: 0.4 };
  const made = new Map(); // key -> times made
  GL.make = function (g, P2, grid, tx, ty, lod) {
    clock += COST[grid.lods[lod].px];
    const key = grid.T + ":" + tx + "," + ty + "," + lod;
    made.set(key, (made.get(key) || 0) + 1);
    const tile = { tex: {}, lod, used: this.frame };
    this.tiles.set(key, tile);
    return tile;
  };
  let lostInUse = 0;
  const tiles = () => GL.tiles;
  try {
    GL.ok = null;
    GL.tiles = new Map();
    if (!GL.init({ canvas: Object.assign(el(), { parentNode: { insertBefore: noop } }) })) glErr("the card would not start on a stub context");
    const del = (m) => {
      const d0 = m.delete.bind(m);
      m.delete = (key) => {
        const t = m.get(key);
        if (t && t.used >= GL.frame) lostInUse++;
        return d0(key);
      };
    };
    del(tiles());
    upgrades.engine = 0;
    start("base", "grocery");
    let t = 0;
    while (G.running && !G.fade && t < 200) {
      const dec = G.upcoming();
      G.keys.left = G.keys.right = false;
      if (dec && !G.turn && (dec.stop - G.van.s) / G.speed < 1.0) {
        const o = right(dec);
        const tg = S.laneCenter(o.lanes[0], dec.n);
        G.keys.left = G.van.d > tg + 8;
        G.keys.right = G.van.d < tg - 8;
      }
      G.update(1 / 60);
      t += 1 / 60;
      if (!G.running) break;
      P.setup(G);
      GL.draw(G, P, null, [150, 150, 140]);
      clock += 1000 / 60;
    }
    let total = 0;
    let twice = 0;
    for (const n of made.values()) {
      total += n;
      twice += n - 1;
    }
    if (arrived !== "grocery") glErr("the drive with the card did not arrive");
    if (!(total > 100)) glErr(`only ${total} squares made over a drive`);
    if (twice > 0.1 * total) glErr(`${twice} of the ${total} squares made over a drive were made again (want under 10%)`);
    if (lostInUse) glErr(`${lostInUse} squares in use were pushed off the card`);
    // a view that needs more squares than the card keeps (a 32:9 screen): it keeps all it uses
    const big = new Map();
    GL.tiles = big;
    for (let i = 0; i < 1200; i++) big.set("in view " + i, { tex: {}, used: GL.frame });
    for (let i = 0; i < 300; i++) big.set("old " + i, { tex: {}, used: GL.frame - 5 - i });
    GL.evict(1200);
    let kept = 0;
    for (const t2 of big.values()) if (t2.used === GL.frame) kept++;
    if (kept !== 1200) glErr(`a view of 1200 squares kept only ${kept} of them`);
    if (big.size > 1400) glErr(`a view of 1200 squares left ${big.size} on the card`);
    // the card lost, then given back: the ground goes back on it, every square drawn anew
    GL.tiles = new Map([["x", { tex: {}, used: GL.frame }]]);
    if (!on.webglcontextlost || !on.webglcontextrestored) glErr("the card does not listen for a lost or a restored context");
    else {
      on.webglcontextlost({ preventDefault: noop });
      if (GL.ok !== false || GL.draw(G, P, null, [150, 150, 140])) glErr("a lost card still drew the ground");
      on.webglcontextrestored({});
      if (GL.ok !== true) glErr("the card given back was not used again");
      if (GL.tiles.size !== 0) glErr(`the card given back kept ${GL.tiles.size} squares from before`);
      start("base", "grocery");
      G.update(1 / 60);
      P.setup(G);
      if (!GL.draw(G, P, null, [150, 150, 140]) || !(GL.tiles.size > 0)) glErr("after the card was given back the ground was not drawn on it");
      console.log(`persp ground: ${total} squares made over a drive, ${twice} of them again (${((100 * twice) / total).toFixed(1)}%); a 1200-square view kept whole; card lost and given back: ${GL.tiles.size} squares drawn anew`);
    }
    G.stop();
  } finally {
    GL.make = make0;
    GL.ok = null;
    GL.gl = null;
    GL.canvas = null;
    GL.on = false;
    GL.tiles = new Map();
    GL.drive = null;
    globalThis.document = realDoc;
    globalThis.performance = realPerf;
  }
}

/* ---------- the angled camera on every drive: every turn comfortable (js/streets.js corner shapes, js/game.js braking
   by sharpness) ----------
   Every drive is on the angled camera; a careful driver at the slowest and the fastest van on routes that take every turn in the city. Through every right-way turn the view spins under
   45 / 65 deg/s, its spin changes under 300 deg/s2, it lags the van under 35 / 38 deg, and once the bend is over the
   road 300 to 900 ahead stays on the screen at 1280 x 800 and at 960 x 1040 (half a screen); no hop where a turn
   starts or ends; no frame changes the speed by more than 2%; the van never slows in the 1.5 s before a stop line
   (the reading and the choice keep their time); Home Base to
   Corner Grocery turns as built (37.4 / 52.9 deg/s). A sample of wrong ways (the sharpest at each decision, and every
   side street) to the same limits. And the corner shapes' model of the camera (Streets.CAM) is the camera (PERSP). */
{
  const t0 = Date.now();
  const cErr = (m) => err("comfort", m);
  const D = 180 / Math.PI;
  const norm = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const PE = G.PERSP;
  const CAM = S.CAM;
  ["camW", "camPace", "look", "lookRamp", "brake", "brakeIn"].forEach((k) => {
    if (CAM[k] !== PE[k]) cErr(`Streets.CAM.${k} is ${CAM[k]}, PERSP.${k} ${PE[k]}: the corner shapes model another camera`);
  });
  if (Math.abs(CAM.paceSpeed - G.DIFF.roadScroll * PE.pace) > 1e-9) cErr(`Streets.CAM.paceSpeed ${CAM.paceSpeed} is not the slowest angled van (${G.DIFF.roadScroll * PE.pace})`);
  const most = {};
  Object.keys(upgrades).forEach((k) => (most[k] = 0));
  most.engine = ZSR.Upgrades.DEFS.engine.max;
  const top = ZSR.Upgrades.stats(most).speed * G.DIFF.roadScroll * PE.pace;
  if (Math.abs(CAM.topSpeed - top) > 1e-6) cErr(`Streets.CAM.topSpeed ${CAM.topSpeed} is not the fastest van (${top})`);
  if (S.GEOM.vanHalf * 2 !== G.van.w) cErr(`Streets.GEOM.vanHalf ${S.GEOM.vanHalf} is not half the van's width (${G.van.w}): corners keep the wrong width on the paving`);
  const GA = G;
  const lim = { 0: { w: 45, lag: 35 }, 5: { w: 65, lag: 38 } };
  const VIEWS = [[1280, 800], [960, 1040]].map(([w, h]) => ({ W: w, H: h, zoom: Math.max(0.55, Math.min(1, Math.min(w / 1000, h / 640))), name: w + "x" + h }));
  /** One drive a > b, a careful driver on the lane's centre taking pick(dec) (the right way when left out): a record
      a frame, till it parks or the screen fades after a wrong way. */
  const ride = (a, b, pick) => {
    ZSR.State.trip = { at: a, vanHp: 1e9, vanMaxHp: 1e9, scrap: 0, walkers: 0, miles: 0 };
    const r = S.route(a, b);
    arrived = null;
    GA.startTrip({ to: b, name: name(b), danger: 0, path: r.path });
    GA.spawnTimer = 1e9;
    const rows = [];
    let t = 0;
    let dist = 0;
    while (GA.running && !GA.fade && t < 300) {
      const dec = GA.upcoming();
      GA.keys.left = GA.keys.right = false;
      if (dec && !GA.turn && (dec.stop - GA.van.s) / GA.speed < 1.0) {
        const o = (pick && pick(dec)) || right(dec);
        const lane = o.lanes.reduce((best, l) => (Math.abs(S.laneCenter(l, dec.n) - GA.van.d) < Math.abs(S.laneCenter(best, dec.n) - GA.van.d) ? l : best), o.lanes[0]);
        const tg = S.laneCenter(lane, dec.n);
        if (Math.abs(GA.van.d - tg) < 40) GA.van.d = tg;
        else GA.keys[GA.van.d > tg ? "left" : "right"] = true;
      }
      const was = GA.turn;
      const x = GA.van.x;
      const y = GA.van.y;
      const sp0 = GA.curSpeed;
      const before = GA.upcoming();
      GA.update(1 / 60);
      t += 1 / 60;
      if (!GA.running) break;
      const step = Math.hypot(GA.van.x - x, GA.van.y - y);
      dist += step;
      const tn = GA.turn;
      rows.push({ th: GA.cam.th, head: GA.van.heading, tp: Math.atan2(GA.vanP.uy, GA.vanP.ux), spd: GA.curSpeed, sp0, step, dist, x: GA.van.x, y: GA.van.y, cx: GA.cam.x, cy: GA.cam.y, start: !!tn && tn !== was, end: !tn && !!was, main: tn ? tn.main : !!(was && was.main), wrong: !!tn && !tn.main, park: (!!GA.arrive || !GA.onMain) && GA.driveEnd() - GA.van.s < 262, pre: !!before && !tn && GA.onMain && !GA.arrive && GA.van.s < before.stop && before.stop - GA.van.s < 1.5 * GA.speed });
    }
    return rows;
  };
  /** The van's own path at distance d along it (from the record), or null past it. */
  const along = (rows, d, from) => {
    let i = from;
    while (i < rows.length - 1 && rows[i + 1].dist < d) i++;
    if (i >= rows.length - 1) return null;
    const A = rows[i];
    const B = rows[i + 1];
    const u = Math.max(0, Math.min(1, (d - A.dist) / (B.dist - A.dist || 1)));
    return { x: A.x + (B.x - A.x) * u, y: A.y + (B.y - A.y) * u, i };
  };
  const worst = { w: { 0: 0, 5: 0 }, acc: { 0: 0, 5: 0 }, lag: { 0: 0, 5: 0 }, marg: {}, hop: 0, dv: 0, pre: 1, ww: { 0: 0, 5: 0 }, wlag: { 0: 0, 5: 0 }, wacc: { 0: 0, 5: 0 } };
  VIEWS.forEach((v) => (worst.marg[v.name] = Infinity));
  let nTurns = 0;
  let nWrong = 0;
  /** A turn's camera from the record: rows i0 (it starts) to i1 (it ends), the next turn's start (or null). */
  const turnStats = (rows, i0, i1, next) => {
    const hEnd = rows[i1].tp;
    let iB = i1;
    while (iB > i0 && Math.abs(norm(rows[iB - 1].tp - hEnd)) * D < 0.5) iB--;
    const iEnd = Math.min(rows.length - 1, Math.max(i1, iB + 240), next != null ? next - 1 : Infinity);
    let pkW = 0;
    let pkA = 0;
    let lag = 0;
    for (let i = Math.max(2, i0 - 30); i <= iEnd; i++) {
      const w = norm(rows[i].th - rows[i - 1].th) * 60;
      const wp = norm(rows[i - 1].th - rows[i - 2].th) * 60;
      pkW = Math.max(pkW, Math.abs(w) * D);
      pkA = Math.max(pkA, Math.abs(w - wp) * 60 * D);
      lag = Math.max(lag, Math.abs(norm(rows[i].head - rows[i].th)) * D);
    }
    return { iB, iEnd, pkW, pkA, lag };
  };
  // the routes: enough to take every turn in the city (each corner, from each road in, out each way) at least once,
  // and Home Base to Corner Grocery; COMFORT_ALL=1 drives every route (about four times as long)
  // SCALE: about a quarter of the routes today; it grows with the corners, not with the routes
  const ids = W.LOCATIONS.map((l) => l.id);
  const pairs = [];
  ids.forEach((a) => ids.forEach((b) => a !== b && pairs.push([a, b])));
  let check = pairs;
  if (!process.env.COMFORT_ALL) {
    const turnsOf = ([a, b]) => {
      const p = S.route(a, b).path;
      const out = ["|" + p[0] + "|" + p[1], p[p.length - 2] + "|" + p[p.length - 1] + "|"];
      for (let i = 1; i < p.length - 1; i++) out.push(p[i - 1] + "|" + p[i] + "|" + p[i + 1]);
      return out;
    };
    const left = new Set();
    const of = pairs.map((pr) => [pr, turnsOf(pr)]);
    of.forEach(([, ts]) => ts.forEach((t) => left.add(t)));
    check = [["base", "grocery"]];
    turnsOf(["base", "grocery"]).forEach((t) => left.delete(t));
    while (left.size) {
      let best = null;
      let bn = 0;
      of.forEach(([pr, ts]) => {
        const n = ts.filter((t) => left.has(t)).length;
        if (n > bn) {
          bn = n;
          best = [pr, ts];
        }
      });
      check.push(best[0]);
      best[1].forEach((t) => left.delete(t));
    }
  }
  const bg = {};
  for (const engine of [0, 5]) {
    upgrades.engine = engine;
    let ri = 0;
    for (const [a, b] of check) {
      {
        const c = `${a} > ${b} (engine ${engine})`;
        const rows = ride(a, b);
        if (arrived !== b) cErr(`${c} did not arrive`);
        const starts = [];
        rows.forEach((r, i) => r.start && starts.push(i));
        starts.forEach((i0, q) => {
          let i1 = rows.findIndex((r, i) => i > i0 && r.end);
          if (i1 < 0) i1 = rows.length - 1;
          const st = turnStats(rows, i0, i1, starts[q + 1]);
          nTurns++;
          worst.w[engine] = Math.max(worst.w[engine], st.pkW);
          worst.acc[engine] = Math.max(worst.acc[engine], st.pkA);
          worst.lag[engine] = Math.max(worst.lag[engine], st.lag);
          if (st.pkW > lim[engine].w) cErr(`${c} turn ${q + 1}: the view spun at ${st.pkW.toFixed(1)} deg/s (want under ${lim[engine].w})`);
          if (st.pkA > 300) cErr(`${c} turn ${q + 1}: the view's spin changed at ${st.pkA.toFixed(0)} deg/s2 (a jolt)`);
          if (st.lag > lim[engine].lag) cErr(`${c} turn ${q + 1}: the view lagged the van by ${st.lag.toFixed(1)} deg (want under ${lim[engine].lag})`);
          if (a === "base" && b === "grocery" && q === 0) bg[engine] = st.pkW;
          // after the bend: the road 300 to 900 ahead (the van's own path, short of the next turn) on the screen
          const cap = starts[q + 1] != null ? rows[starts[q + 1]].dist : rows[rows.length - 1].dist;
          for (let i = st.iB + 1; i <= st.iEnd; i += 3) {
            VIEWS.forEach((v) => {
              P.setup({ W: v.W, H: v.H, zoom: v.zoom, cam: { x: rows[i].cx, y: rows[i].cy, th: rows[i].th } });
              for (let L = 300; L <= 900 && rows[i].dist + L <= cap; L += 100) {
                const p = along(rows, rows[i].dist + L, i);
                if (!p) break;
                const s = P.project(p.x, p.y, 0);
                const m = s ? Math.min(s.x, v.W - s.x) : -Infinity;
                worst.marg[v.name] = Math.min(worst.marg[v.name], m);
                if (m < 0) {
                  cErr(`${c} turn ${q + 1}: at ${v.name} the road ${L} ahead left the screen after the bend (${s ? m.toFixed(0) + " px" : "behind the camera"})`);
                  break;
                }
              }
            });
          }
        });
        rows.forEach((r, i) => {
          // no hop where a turn starts or ends: the van's step is what its speed says
          if ((r.start || r.end) && r.main && i > 1 && i < rows.length - 2) {
            for (let j = i - 1; j <= i + 1; j++) if (rows[j].spd >= 0.3 * GA.speed) worst.hop = Math.max(worst.hop, Math.abs(rows[j].step - 0.5 * (rows[j].sp0 + rows[j].spd) / 60));
          }
          if (i && !r.park && rows[i - 1].spd > 0.5 * GA.speed) worst.dv = Math.max(worst.dv, Math.abs(r.spd - rows[i - 1].spd) / GA.speed);
          if (i && r.pre && r.spd < rows[i - 1].spd - 1e-9) worst.pre = Math.min(worst.pre, r.spd / rows[i - 1].spd);
        });
        // a sample of wrong ways: on every sixth route, at each decision the sharpest wrong way (a side street's turn)
        if (ri++ % 6 === 0) {
          ZSR.State.trip = { at: a, vanHp: 1e9, vanMaxHp: 1e9, scrap: 0, walkers: 0, miles: 0 };
          GA.startTrip({ to: b, name: name(b), danger: 0, path: S.route(a, b).path });
          const decs = GA.drive.decisions.slice();
          GA.stop();
          decs.forEach((dec0, k) => {
            const pickIdx = dec0.options.map((o, j) => j).filter((j) => !dec0.options[j].correct).sort((x, y) => Math.abs(dec0.options[y].rel) - Math.abs(dec0.options[x].rel))[0];
            const wr = ride(a, b, (dec) => (GA.drive.decisions.indexOf(dec) === k ? dec.options[pickIdx] : null));
            const i0 = wr.findIndex((r) => r.start && r.wrong);
            if (i0 < 0) return cErr(`${c}: the wrong way at decision ${k} was never driven`);
            const st = turnStats(wr, i0, wr.length - 1, null);
            nWrong++;
            worst.ww[engine] = Math.max(worst.ww[engine], st.pkW);
            worst.wacc[engine] = Math.max(worst.wacc[engine], st.pkA);
            worst.wlag[engine] = Math.max(worst.wlag[engine], st.lag);
            const kind = dec0.options[pickIdx].kind;
            if (st.pkW > lim[engine].w) cErr(`${c}: the wrong ${kind} at decision ${k} spun the view at ${st.pkW.toFixed(1)} deg/s (want under ${lim[engine].w})`);
            if (st.pkA > 300) cErr(`${c}: the wrong ${kind} at decision ${k} changed the view's spin at ${st.pkA.toFixed(0)} deg/s2`);
            if (st.lag > lim[engine].lag) cErr(`${c}: the wrong ${kind} at decision ${k} lagged the view ${st.lag.toFixed(1)} deg behind the van`);
          });
        }
      }
    }
  }
  upgrades.engine = 0;
  if (worst.hop > 0.3) cErr(`the van hops ${worst.hop.toFixed(2)} units on a frame where a turn starts or ends`);
  if (worst.dv > 0.02) cErr(`the van's speed changed ${(worst.dv * 100).toFixed(2)}% of it in one frame (at most 2%)`);
  if (worst.pre < 1) cErr(`the van slowed (to ${worst.pre.toFixed(3)} of its speed) before a stop line`);
  // Home Base to Corner Grocery, the drive the owner tested: its junction exactly as built
  [[0, 37.4], [5, 52.9]].forEach(([e, want]) => {
    if (!(Math.abs(bg[e] - want) < 0.1)) cErr(`Home Base to Corner Grocery turned the view at ${bg[e] && bg[e].toFixed(1)} deg/s at engine ${e} (as built: ${want})`);
  });
  GA.stop();
  console.log(`comfort: ${nTurns} right-way turns on ${check.length} routes at each engine, angled: view at most ${worst.w[0].toFixed(1)} / ${worst.w[5].toFixed(1)} deg/s (engine 0 / 5), ${worst.acc[0].toFixed(0)} / ${worst.acc[5].toFixed(0)} deg/s2, lag ${worst.lag[0].toFixed(1)} / ${worst.lag[5].toFixed(1)} deg; road after the bend ${VIEWS.map((v) => v.name + " " + worst.marg[v.name].toFixed(0) + " px in").join(", ")}; hop ${worst.hop.toFixed(2)}, speed at most ${(worst.dv * 100).toFixed(2)}% a frame; Home Base to Corner Grocery ${bg[0] && bg[0].toFixed(1)} / ${bg[5] && bg[5].toFixed(1)}; ${nWrong} wrong ways: ${worst.ww[0].toFixed(1)} / ${worst.ww[5].toFixed(1)} deg/s, ${worst.wacc[0].toFixed(0)} / ${worst.wacc[5].toFixed(0)} deg/s2, lag ${worst.wlag[0].toFixed(1)} / ${worst.wlag[5].toFixed(1)} deg (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}
console.log(`drive: ${routes} routes driven (${turns} turns), largest step back ${maxBack.toFixed(2)} px; ${signLog.shown} signs over ${signLog.frames} frames, the most one moved in a frame ${signLog.most.toFixed(0)} px; left alone the first wrong way is ${Object.entries(failedAt).map(([k, n]) => k + " " + n).join(", ")}`);
errors.slice(0, 40).forEach((e) => console.log("ERROR " + e));
if (errors.length > 40) console.log(`... ${errors.length - 40} more errors`);
console.log(errors.length ? `FAILED: ${errors.length} errors` : "ok");
process.exit(errors.length ? 1 : 0);
