#!/usr/bin/env node
/* Drives the real road code (js/game.js on js/streets.js) headless, with the page stubbed out:
   - every ordered pair of places, slowest and fastest van, a driver who gets into the right lane
     a second before each stop line: arrives first time, the van and the camera never step backward, turns end;
   - a driver who never touches the keys: never turns off at a side street or a driveway
     (the left lane goes straight on), so the first wrong way is a junction or the destination;
   - a wrong lane on purpose: the banner, the fade, the drive starts over from the start with the
     trip's miles, walkers and scrap kept, and the next try arrives.
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
};
ZSR.Audio = { play: noop, unlock: noop };
let arrived = null;
const canvas = Object.assign(el(), { getContext: () => ({ setTransform: noop }) });
G.init(canvas, { onArrive: (to) => (arrived = to), onDeath: noop, onPause: noop, onPauseKey: noop });

const name = (id) => W.LOCATIONS.find((l) => l.id === id).name;
function start(a, b) {
  ZSR.State.trip = { at: a, vanHp: 1e9, vanMaxHp: 1e9, scrap: 0, walkers: 0, miles: 0 };
  const r = S.route(a, b);
  const L = W.LOCATIONS.find((l) => l.id === b);
  arrived = null;
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
    if (first === "side" || first === "lot") err(`${a} > ${b}`, `left alone, the van turned off at a ${first}`);
  }
}

/* ---------- a wrong lane on purpose: fade, start over, tallies kept, then arrive ---------- */
[["base", "watertower"], ["base", "hardware"], ["hospital", "autoshop"], ["school", "base"]].forEach(([a, b]) => {
  const c = `${a} > ${b} (wrong lane)`;
  start(a, b);
  const t = ZSR.State.trip;
  t.walkers = 3;
  t.scrap = 7;
  const target = G.drive.decisions.find((d) => d.kind === "junction" || d.kind === "dest");
  let failed = false;
  let restarted = false;
  let milesAtFail = 0;
  drive((dec) => {
    if (G.attempt === 0 && dec === target) return dec.options.find((o) => !o.correct);
    return right(dec);
  }, 1.0, () => {
    if (G.fail && !failed) {
      failed = true;
      milesAtFail = t.miles;
    }
    if (G.attempt === 1 && !restarted) {
      restarted = true;
      if (Math.abs(G.van.s - G.drive.startS) > G.speed / 20 || !G.onMain || G.next !== 0) err(c, "the drive did not start over from the start");
      if (t.walkers !== 3 || t.scrap !== 7 || t.miles < milesAtFail) err(c, "the trip's walkers, scrap or miles were not kept");
    }
  });
  if (!failed) err(c, "the wrong lane did not go wrong");
  if (!restarted) err(c, "the drive did not start over");
  if (arrived !== b || G.attempt !== 1) err(c, `after starting over: arrived ${arrived}, attempt ${G.attempt}`);
});

console.log(`drive: ${routes} routes driven (${turns} turns), largest step back ${maxBack.toFixed(2)} px; left alone the first wrong way is ${Object.entries(failedAt).map(([k, n]) => k + " " + n).join(", ")}`);
errors.slice(0, 40).forEach((e) => console.log("ERROR " + e));
if (errors.length > 40) console.log(`... ${errors.length - 40} more errors`);
console.log(errors.length ? `FAILED: ${errors.length} errors` : "ok");
process.exit(errors.length ? 1 : 0);
