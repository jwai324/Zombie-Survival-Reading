#!/usr/bin/env node
/* Drives the real road code (js/game.js on js/streets.js) headless, with the page stubbed out:
   - every ordered pair of places, slowest and fastest van, a driver who gets into the right lane
     a second before each stop line: arrives first time, the van and the camera never step backward, turns end;
   - a driver who never touches the keys: never turns off at a side street or a driveway
     (the left lane goes straight on), so the first wrong way is a junction or the destination;
   - a wrong lane on purpose: the fade, the wrong-turn panel (the drive holds until a choice), then
     "try again" starts the drive over with the trip's miles, walkers and scrap kept, and the next try arrives;
   - the roof gun: a shot flies straight at the pointer on screen, whichever way it points, at any van speed;
   - the angled camera's test drive (js/perspective.js): only Home Base to Corner Grocery, screen and world
     map back onto each other, and there too a shot flies straight at the pointer; a walker clicked anywhere on
     its picture is hit, walking or not, ahead or aside; walkers stay outside the van and hit it; the van parks
     short of the grocery's wall;
   - the angled camera's whole frame drawn on a recording 2D context (no WebGL: the 2D ground): every kind of
     walker live (Walker3D), a scream and its frenzy, clawing, hurt (health bars), shot, downed, gore on and off:
     no exceptions, no NaN, and over the sign only this frame's pictures, never a shadow or a glow.
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
// register their blood sprites with it), the road, the angled camera, then the interiors (whose governor rows and
// picture signature the angled camera's walkers use)
// SCALE: a new walker looks file (js/walker3d-looks2.js) goes in this list too (docs/SCALING.md "Add a walker kind")
for (const f of ["js/layouts.js", "js/world.js", "js/upgrades.js", "js/streets.js", "js/sprites.js", "js/sprites3d.js", "js/walker3d.js", "js/walker3d-looks.js", "js/game.js", "js/perspective.js", "js/perspective-art.js", "js/perspective-gl.js", "js/interior.js"]) {
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

/* ---------- every route, a careful driver ---------- */
const ids = W.LOCATIONS.map((l) => l.id);
let routes = 0;
let maxBack = 0;
let turns = 0;
for (const engine of [0, 5]) {
  upgrades.engine = engine; // the slowest and the fastest van
  for (const a of ids) {
    for (const b of ids) {
      if (a === b) continue;
      const c = `${a} > ${b} (engine ${engine})`;
      start(a, b);
      routes++;
      let back = 0;
      let camBack = 0;
      let wasTurn = false;
      drive(right, 1.0, (p) => {
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
    place(hid, -(G.H - G.anchorY) / G.zoom - 60, 0);
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
  // drawn in layers: everything that lies on the road (splats, pools, shadows and frenzy glows) under every body,
  // the bodies (downed, crates, walkers without their own shadow), then the rounds and what flies
  {
    const calls = [];
    const D = new Proxy({}, { get: (o, k) => (...a) => calls.push({ k, a }) });
    G.zombies.length = 0;
    G.fallen.length = 0;
    G.particles.length = 0;
    const zs = [G.addZombie(kinds[0], G.van.x, G.van.y - 300), G.addZombie(kinds[kinds.length - 1], G.van.x + 40, G.van.y - 320)];
    zs[1].frenzyT = 2;
    G.killZombie(G.zombies.indexOf(G.addZombie(kinds[0], G.van.x - 40, G.van.y - 280)), 0);
    G.killZombie(G.zombies.indexOf(G.addZombie(kinds[1 % kinds.length], G.van.x - 80, G.van.y - 280)), 0);
    const splat = { x: 0, y: 0, vx: 0, vy: 0, life: 1, maxLife: 1.4, size: 4, color: "#a3201a", blood: true, splat: true };
    const drop = { x: 0, y: 0, vx: 50, vy: 0, life: 0.3, maxLife: 0.4, size: 4, color: "#a3201a", blood: true };
    const dust = { x: 0, y: 0, vx: 50, vy: 0, life: 0.3, maxLife: 0.4, size: 4, color: "#6b675c", grow: true };
    G.particles.push(drop, splat, dust, Object.assign({}, splat));
    const crates0 = G.crates;
    const bullets0 = G.bullets;
    G.crates = [{ x: 0, y: 0, t: 0 }];
    G.bullets = [{ x: 0, y: 0, vx: 1, vy: 0 }];
    G.drawCrowd({}, D, (cr) => calls.push({ k: "crate", a: [cr] }));
    G.crates = crates0;
    G.bullets = bullets0;
    const ground = (q) => (q.k === "particle" && q.a[1].splat) || (q.k === "zombieDown" && q.a[2] === "ground") || q.k === "zombieShadow";
    const fly = (q) => (q.k === "particle" && !q.a[1].splat) || q.k === "bullet";
    const lastGround = calls.map(ground).lastIndexOf(true);
    const firstBody = calls.findIndex((q) => !ground(q) && !fly(q));
    const lastBody = calls.map((q) => !ground(q) && !fly(q)).lastIndexOf(true);
    const firstFly = calls.findIndex(fly);
    const n = (k, f) => calls.filter((q) => q.k === k && (!f || f(q))).length;
    if (!(lastGround < firstBody && lastBody < firstFly)) err(c, `the road's layers are out of order: ${calls.map((q) => q.k + (q.k === "zombieDown" ? ":" + q.a[2] : q.k === "particle" && q.a[1].splat ? ":splat" : "")).join(", ")}`);
    if (n("zombieShadow") !== zs.length || n("zombie", (q) => q.a[3] === true) !== zs.length || n("zombie") !== zs.length) err(c, `${zs.length} walkers drew ${n("zombieShadow")} shadows and ${n("zombie")} bodies (${n("zombie", (q) => q.a[3] === true)} without their own shadow)`);
    if (n("zombieDown", (q) => q.a[2] === "ground") !== G.fallen.length || n("zombieDown", (q) => q.a[2] === "body") !== G.fallen.length) err(c, `${G.fallen.length} downed walkers drew ${n("zombieDown", (q) => q.a[2] === "ground")} grounds and ${n("zombieDown", (q) => q.a[2] === "body")} bodies`);
    if (n("particle") !== G.particles.length || n("crate") !== 1 || n("bullet") !== 1) err(c, `drew ${n("particle")} of ${G.particles.length} particles, ${n("crate")} crates, ${n("bullet")} rounds`);
    G.zombies.length = 0;
    G.fallen.length = 0;
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

/* ---------- the roof gun: shots fly at the pointer on screen ---------- */
let worstAim = 0;
for (const engine of [0, 5]) {
  upgrades.engine = engine;
  for (const deg of [0, 45, 90, 135, 180, 225, 270, 315]) {
    start("base", "hospital");
    for (let i = 0; i < 90; i++) G.update(1 / 60); // up to speed, clear of the start
    const vs = G.toScreen(G.van.x, G.van.y);
    const a = (deg * Math.PI) / 180;
    Object.assign(G.pointer, { x: vs.x + Math.cos(a) * 260, y: vs.y + Math.sin(a) * 260, seen: true, down: true });
    G.van.cooldown = 0;
    G.update(1 / 60);
    G.pointer.down = false;
    const b = G.bullets[G.bullets.length - 1];
    // where the shot left the mount, on screen, and the line from there to the pointer
    const from = G.toScreen(b.x, b.y);
    const ux = G.pointer.x - from.x;
    const uy = G.pointer.y - from.y;
    const len = Math.hypot(ux, uy);
    for (let i = 0; i < 12; i++) {
      G.update(1 / 60);
      if (!G.bullets.includes(b)) break;
      const p = G.toScreen(b.x, b.y);
      worstAim = Math.max(worstAim, Math.abs(((p.x - from.x) * uy - (p.y - from.y) * ux) / len));
    }
    G.stop();
  }
}
upgrades.engine = 0;
// the camera eases a little through the van's own lean; a few pixels off the line is fine, a drift (tens of px) is not
if (worstAim > 6) err("gun", `a shot drifted ${worstAim.toFixed(1)} px off the line to the pointer`);

console.log(`gun: shots stay within ${worstAim.toFixed(1)} px of the line to the pointer`);

/* ---------- the angled camera: Home Base to Corner Grocery only ---------- */
const P = ZSR.Persp;
for (const [a, b] of [["base", "gasngo"], ["grocery", "base"], ["base", "hospital"]]) {
  start(a, b);
  if (G.persp) err("persp", `${a} > ${b} drove with the angled camera`);
  G.stop();
}
start("base", "grocery");
if (!G.persp) err("persp", "base > grocery drove with the flat camera");
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
let worstPersp = 0;
for (const deg of [0, 45, 90, 135, 180, 225, 270, 315]) {
  start("base", "grocery");
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

/* ---------- turns: no hop where a turn starts or ends, the van keeps its place on the screen (both cameras); on the
   angled camera the van brakes lightly into a turn and the view follows lazily, the same at any frame rate ---------- */
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
  // 2. the van keeps its place up and down the screen through every turn, on both cameras (the camera's offset used
  // to be laid off the road, not the view: the van rose 12-17 px through a flat junction, 23 px on the angled one)
  let worstBob = 0;
  for (const [a, b] of [["base", "grocery"], ["base", "hospital"], ["hospital", "base"]]) {
    const R = rec(a, b, [1 / 60]);
    const ys = R.filter((r) => r.t > 0.5).map((r) => r.vsy);
    worstBob = Math.max(worstBob, Math.max(...ys) - Math.min(...ys));
  }
  if (worstBob > 2) err("turns", `the van moves ${worstBob.toFixed(1)} px up or down the screen through the drive's turns`);
  // 3. the angled camera's corner braking: none before a stop line (the reading and the choice keep their time) and
  // none on the flat camera; down to PERSP.brake into each turn the van takes, smoothly (the junction, the grocery's
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
  {
    const R = rec("base", "hospital", [1 / 60]);
    if (R.some((r) => !r.dest && r.spd !== G.speed)) err("turns", "the van braked into a turn on the flat camera");
  }
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
/* ---------- the angled camera's walkers keeping up with the van: their feet go with them ----------
   Beside and behind the van (out of its reach) every kind faces the way it goes, so its feet do not slide sideways
   (as on foot: js/interior.js animWalker), and runs (Walker3D st.run) at a cadence a body can run at. Walkers ahead
   are left out: facing the van while it carries them away is the owner's to decide (DESIGN.md). */
{
  const P = ZSR.Persp;
  const M = ZSR.Walker3D;
  const TILE = P.TILE;
  const kinds = Object.keys(W.WALKER_TYPES);
  const q90 = (a) => (a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length * 0.9)] : NaN);
  const out = [];
  for (const engine of [0, 5]) {
    upgrades.engine = engine;
    start("base", "grocery");
    for (let i = 0; i < 30; i++) G.update(1 / 60);
    const v = G.van;
    const fx = Math.cos(v.heading);
    const fy = Math.sin(v.heading);
    G.zombies.length = 0;
    const put = (type, ahead, side) => Object.assign(G.addZombie(type, v.x + fx * ahead - fy * side, v.y + fy * ahead + fx * side), { hp: 1e4, maxHp: 1e4, dmg: 0, born: -10 });
    kinds.forEach((k, i) => {
      put(k, -40 + 40 * (i % 3), (i % 2 ? 1 : -1) * (300 + 25 * i)); // beside, well out to a side
      put(k, -260 - 70 * i, (i % 2 ? 1 : -1) * 90); // behind
    });
    const slides = [];
    const steps = [];
    const runs = [];
    for (let f = 0; f < 140; f++) {
      const prev = new Map(G.zombies.map((z) => [z, [z.x, z.y, z.gait]]));
      G.update(1 / 60);
      if (!G.running) break;
      if (f < 45) continue; // (their motion smoothed and turned to)
      for (const z of G.zombies) {
        const p0 = prev.get(z);
        if (!p0 || z.pose !== "walk" || z.poseW < 1) continue;
        const ly = (z.x - G.van.x) * Math.cos(G.van.heading) + (z.y - G.van.y) * Math.sin(G.van.heading);
        if (ly > G.van.h / 2) continue;
        const vx = (z.x - p0[0]) * 60;
        const vy = (z.y - p0[1]) * 60;
        const sp = Math.hypot(vx, vy);
        slides.push(Math.hypot(vx - Math.cos(z.heading) * sp * z.move, vy - Math.sin(z.heading) * sp * z.move));
        if (z.type === "walker" && sp > 2 * W.WALKER_TYPES.walker.speed * TILE) {
          steps.push(((((z.gait - p0[2]) % 1) + 1) % 1) * 60 * 2); // two steps a gait cycle
          runs.push(z.run);
        }
      }
    }
    const slide = q90(slides);
    const cad = steps.length ? steps.reduce((a, b) => a + b, 0) / steps.length : NaN;
    const run = runs.length ? runs.reduce((a, b) => a + b, 0) / runs.length : NaN;
    if (!(slides.length > 200)) err("persp feet", `engine ${engine}: only ${slides.length} walker frames beside or behind the van to check`);
    if (!(slide < 30)) err("persp feet", `engine ${engine}: walkers beside and behind the van slide ${slide.toFixed(0)} units/s (90th percentile) against the way they face (want under 30)`);
    if (!(steps.length > 20)) err("persp feet", `engine ${engine}: no walker kept up with the van beside it`);
    else {
      // (a walk cycle at the walk's stride took 8.7 and 12 to 14; running strides, 5.3 and 8.3)
      const most = engine ? 9.5 : 7;
      if (!(cad >= 3 && cad <= most)) err("persp feet", `engine ${engine}: a walker keeping up beside the van takes ${cad.toFixed(1)} steps a second (a run: 3 to ${most})`);
      if (!(run > 0.5)) err("persp feet", `engine ${engine}: a walker keeping up beside the van runs only ${run.toFixed(2)} of the way (Walker3D st.run)`);
    }
    out.push(`engine ${engine}: slide ${slide.toFixed(0)} units/s (p90), a walker beside it ${cad.toFixed(1)} steps/s, run ${run.toFixed(2)}`);
    G.stop();
  }
  upgrades.engine = 0;
  if (M) console.log(`persp feet: ${out.join("; ")}`);
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
   The road's code again with every drive on the angled camera (its PERSP_ROUTES gate opened, if it still has one), a
   careful driver at the slowest and the fastest van on routes that take every turn in the city. Through every right-way turn the view spins under
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
  // every drive angled: js/game.js once more, its gate opened
  const src = fs.readFileSync(path.join(ROOT, "js/game.js"), "utf8").replace('PERSP_ROUTES.includes(path.join(">"))', "true");
  vm.runInThisContext(src, { filename: "js/game.js" });
  const GA = ZSR.Game;
  GA.init(canvas, { onArrive: (to) => (arrived = to), onWrongTurn: (info) => (wrongTurn = info), onDeath: noop, onPause: noop, onPauseKey: noop });
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
    if (!GA.persp) cErr(`${a} > ${b} did not drive on the angled camera`);
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
  console.log(`comfort: ${nTurns} right-way turns on ${check.length} routes a van, angled: view at most ${worst.w[0].toFixed(1)} / ${worst.w[5].toFixed(1)} deg/s (engine 0 / 5), ${worst.acc[0].toFixed(0)} / ${worst.acc[5].toFixed(0)} deg/s2, lag ${worst.lag[0].toFixed(1)} / ${worst.lag[5].toFixed(1)} deg; road after the bend ${VIEWS.map((v) => v.name + " " + worst.marg[v.name].toFixed(0) + " px in").join(", ")}; hop ${worst.hop.toFixed(2)}, speed at most ${(worst.dv * 100).toFixed(2)}% a frame; Home Base to Corner Grocery ${bg[0] && bg[0].toFixed(1)} / ${bg[5] && bg[5].toFixed(1)}; ${nWrong} wrong ways: ${worst.ww[0].toFixed(1)} / ${worst.ww[5].toFixed(1)} deg/s, ${worst.wacc[0].toFixed(0)} / ${worst.wacc[5].toFixed(0)} deg/s2, lag ${worst.wlag[0].toFixed(1)} / ${worst.wlag[5].toFixed(1)} deg (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}
console.log(`drive: ${routes} routes driven (${turns} turns), largest step back ${maxBack.toFixed(2)} px; left alone the first wrong way is ${Object.entries(failedAt).map(([k, n]) => k + " " + n).join(", ")}`);
errors.slice(0, 40).forEach((e) => console.log("ERROR " + e));
if (errors.length > 40) console.log(`... ${errors.length - 40} more errors`);
console.log(errors.length ? `FAILED: ${errors.length} errors` : "ok");
process.exit(errors.length ? 1 : 0);
