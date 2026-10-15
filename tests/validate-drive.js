#!/usr/bin/env node
/* Drives the real road code (js/game.js on js/streets.js) headless, with the page stubbed out:
   - every ordered pair of places, slowest and fastest van, a driver who gets into the right lane
     a second before each stop line: arrives first time, the van and the camera never step backward, turns end;
   - a driver who never touches the keys: never turns off at a side street or a driveway
     (the left lane goes straight on), so the first wrong way is a junction or the destination;
   - a wrong lane on purpose: the fade, the wrong-turn panel (the drive holds until a choice), then
     "try again" starts the drive over with the trip's miles, walkers and scrap kept, and the next try arrives;
   - the roof gun: a shot flies straight at the pointer on screen, whichever way it points, at any van speed.
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
for (const f of ["js/layouts.js", "js/world.js", "js/upgrades.js", "js/streets.js", "js/game.js"]) {
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
console.log(`drive: ${routes} routes driven (${turns} turns), largest step back ${maxBack.toFixed(2)} px; left alone the first wrong way is ${Object.entries(failedAt).map(([k, n]) => k + " " + n).join(", ")}`);
errors.slice(0, 40).forEach((e) => console.log("ERROR " + e));
if (errors.length > 40) console.log(`... ${errors.length - 40} more errors`);
console.log(errors.length ? `FAILED: ${errors.length} errors` : "ok");
process.exit(errors.length ? 1 : 0);
