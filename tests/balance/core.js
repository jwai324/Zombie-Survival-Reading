/* The road balance simulator's core: the REAL road code (js/game.js on js/streets.js, js/perspective.js,
   js/walker3d.js ...) run headless in this Node process with the page stubbed out, driven by a lane-keeping driver
   and a human-like aiming bot, one seeded trip at a time. Nothing in the game is changed: it is counted through its
   own functions (hurtVan, spawnZombie, killZombie).

   One process = one game: load({ repo }) once, then runTrip(job) as often as needed. The game's files run in this
   process's own global context (as tests/validate-drive.js does), so a second repo needs a new process (run.js forks
   one worker per job stream). In-memory patches ({ file, from, to, all }) let a tuner try numbers without touching the
   repo (each must match or the load fails); `set` ({ path: value }, e.g. { "ROAD_DANGER.2.spawns": 1.2 }) changes a
   number in Game's own tables after the load.

   File list: the one tests/validate-drive.js loads (the road's own headless test), parsed from that file, so files a
   later change adds to the road come along.

   Seeding: Math.random is replaced by an LCG reseeded per trip from hash(route, day, seed); the bot has its own LCG
   (seeded from the same key), so its jitter and click timing never shift the game's random stream. A trip is the
   same on any worker and in any order. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DT = 1 / 60; // one frame: the game at 60 fps
const MEET_R = 300; // world units: a walker that comes this near the van (centre to centre) has "met" it
const INVULN = 1e9; // the van's health in the sim: it never dies, the real health is checked against the damage taken

function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0 || 1;
}
function lcg(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function fileList(repo) {
  const src = fs.readFileSync(path.join(repo, "tests/validate-drive.js"), "utf8");
  const m = src.match(/for \(const f of (\[[^\]]*"js\/game\.js"[^\]]*\])\)/);
  if (!m) throw new Error("cannot find the road's file list in tests/validate-drive.js");
  return JSON.parse(m[1]);
}

function stubPage(vw, vh) {
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
  Object.assign(globalThis, {
    document: { getElementById: el, querySelector: el, documentElement: { getAttribute: () => "normal" }, addEventListener: noop, hidden: false, createElement: () => el() },
    addEventListener: noop,
    innerWidth: vw,
    innerHeight: vh,
    devicePixelRatio: 1,
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: noop,
  });
  return el;
}

/** Set one number in the loaded Game by a dotted path ("ROAD_DANGER.2.spawns"; "*" for every row:
    "ROAD_DANGER.*.chase"); fails loudly if it is not there. */
function setPath(root, dotted, value) {
  const keys = dotted.split(".");
  const walk = (o, i) => {
    if (o == null || typeof o !== "object") throw new Error("set: no " + keys.slice(0, i).join(".") + " in Game");
    const k = keys[i];
    const each = k === "*" ? Object.keys(o) : [k];
    for (const kk of each) {
      if (!(kk in o)) throw new Error("set: no " + keys.slice(0, i).concat(kk).join(".") + " in Game");
      if (i === keys.length - 1) o[kk] = value;
      else walk(o[kk], i + 1);
    }
  };
  walk(root, 0);
}

let SIM = null; // the loaded game

/** Load the repo's road code into this process. opts: { repo, patches: [{file, from, to, all}], set: {path: value}, vw, vh }. */
function load(opts) {
  if (SIM) throw new Error("core.load: one game per process");
  const repo = path.resolve(opts.repo);
  if (!fs.existsSync(path.join(repo, "js", "game.js"))) throw new Error("not a game repo (no js/game.js): " + repo);
  const vw = opts.vw || 1280;
  const vh = opts.vh || 720;
  const el = stubPage(vw, vh);
  const patches = (opts.patches || []).map((p) => Object.assign({ applied: false }, p));
  const files = fileList(repo);
  for (const f of files) {
    const file = path.join(repo, f);
    if (!fs.existsSync(file)) continue;
    let src = fs.readFileSync(file, "utf8");
    for (const p of patches) {
      if (p.file !== f) continue;
      if (!src.includes(p.from)) throw new Error("patch did not match in " + f + ": " + p.from);
      src = p.all ? src.split(p.from).join(p.to) : src.replace(p.from, p.to);
      p.applied = true;
    }
    vm.runInThisContext(src, { filename: file });
  }
  const left = patches.filter((p) => !p.applied);
  if (left.length) throw new Error("patch for a file that was not loaded: " + left.map((p) => p.file).join(", "));
  const ZSR = globalThis.ZSR;
  const G = ZSR.Game;
  for (const [k, v] of Object.entries(opts.set || {})) setPath(G, k, v);
  const upgrades = {};
  Object.keys(ZSR.Upgrades.DEFS).forEach((k) => (upgrades[k] = 0));
  const hooks = { arrived: null, wrong: 0 };
  const S = {
    save: { day: 1, upgrades, scrap: 0 },
    trip: null,
    settings: { aimAssist: true, shake: false },
    fx: { headlights: false, crates: 0, vanDamage: 1, vanHp: 0 },
    effects() {
      return this.fx;
    },
    isKnown: () => true,
    cheat: () => false,
    meetWalker: () => (SIM.counters.gameMet += 1),
  };
  ZSR.State = S;
  ZSR.Audio = { play: (n) => (SIM.counters.snd[n] = (SIM.counters.snd[n] || 0) + 1), unlock: () => {} };
  const canvas = Object.assign(el(), { getContext: () => ({ setTransform: () => {} }) });
  G.init(canvas, {
    onArrive: (to) => (hooks.arrived = to),
    // the driver never takes a wrong lane; if it ever does, try again at once (the game's own retry), and count it
    onWrongTurn: () => {
      hooks.wrong += 1;
      G.retry();
    },
    onDeath: () => {},
    onPause: () => {},
    onPauseKey: () => {},
  });
  SIM = { repo, ZSR, G, S, hooks, files, vw, vh, counters: null, patches: opts.patches || [], set: opts.set || {} };
  wrap();
  return SIM;
}

/** Count what the trip does, through the game's own functions (no game logic changed). */
function wrap() {
  const { G, S } = SIM;
  // the road functions the sim counts through (and the bot and the driver read): fail loudly if one was renamed
  const need = ["hurtVan", "addZombie", "killZombie", "startTrip", "update", "upcoming", "toScreen"].filter((f) => typeof G[f] !== "function");
  if (!SIM.ZSR.Persp || typeof SIM.ZSR.Persp.project !== "function" || typeof SIM.ZSR.Persp.walkerH !== "function") need.push("Persp.project/walkerH");
  if (need.length) throw new Error("the road code lacks what the sim uses: " + need.join(", "));
  const hurt0 = G.hurtVan;
  G.hurtVan = function (dmg, x, y) {
    const c = SIM.counters;
    const before = S.trip.vanHp;
    hurt0.call(this, dmg, x, y);
    const lost = before - S.trip.vanHp;
    c.hits += 1;
    c.dmg += lost;
    // where the blow came from: ahead of the van's nose, beside it, or behind it
    const v = G.van;
    const ly = (x - v.x) * Math.cos(v.heading) + (y - v.y) * Math.sin(v.heading);
    if (ly > v.h / 2) c.hitsFront += 1;
    else if (ly < -v.h / 2) c.hitsBack += 1;
    else c.hitsSide += 1;
    // the walker that hit (game.js passes its x, y)
    const z = G.zombies.find((o) => o.x === x && o.y === y);
    if (z) c.touched.add(z);
    if (!c.died && c.dmg >= c.hp) {
      c.died = true;
      c.deathT = c.t;
      c.killsAtDeath = S.trip.walkers;
      c.scrapAtDeath = S.trip.scrap;
    }
  };
  // every walker the road brings (spawnZombie and the rest of a group come through addZombie)
  const add0 = G.addZombie;
  G.addZombie = function (type, x, y) {
    const z = add0.call(this, type, x, y);
    if (z && SIM.counters) SIM.counters.spawned += 1;
    return z;
  };
  const kill0 = G.killZombie;
  G.killZombie = function (i, dir) {
    const z = this.zombies[i];
    if (z) SIM.counters.killed.add(z);
    return kill0.call(this, i, dir);
  };
}

/** The base rooms' road effects at these levels (as State.effects: the best level's number, vanDamage the lowest),
    derived from WORLD.BASE_ROOMS, plus a flat vanHp perk (the crew's). */
function effectsFor(rooms, perkVanHp) {
  const W = SIM.ZSR.WORLD;
  const fx = { headlights: false, crates: 0, vanDamage: 1, vanHp: 0 };
  for (const [room, lvl] of Object.entries(rooms || {})) {
    const levels = W.BASE_ROOMS[room] ? W.BASE_ROOMS[room].levels : [];
    for (let i = 0; i < lvl && i < levels.length; i++) {
      for (const [k, v] of Object.entries(levels[i].effect)) {
        if (k === "headlights") fx.headlights = fx.headlights || !!v;
        else if (k === "crates" || k === "vanHp") fx[k] = Math.max(fx[k], v);
        else if (k === "vanDamage") fx.vanDamage = Math.min(fx.vanDamage, v);
      }
    }
  }
  fx.vanHp += perkVanHp || 0;
  return fx;
}

/* ---------- The driver: the right lane a second before each stop line, crates on the way ---------- */
function steer() {
  const { G, ZSR } = SIM;
  const St = ZSR.Streets;
  G.keys.left = G.keys.right = false;
  if (G.turn) return;
  const dec = G.upcoming();
  if (dec && (dec.stop - G.van.s) / G.speed < 1.0) {
    const o = dec.options.find((q) => q.correct);
    if (!o) return;
    const lane = o.lanes.reduce((best, l) => (Math.abs(St.laneCenter(l, dec.n) - G.van.d) < Math.abs(St.laneCenter(best, dec.n) - G.van.d) ? l : best), o.lanes[0]);
    const tg = St.laneCenter(lane, dec.n);
    if (Math.abs(G.van.d - tg) < 40) G.van.d = tg;
    else G.keys[G.van.d > tg ? "left" : "right"] = true;
    return;
  }
  // between decisions: slide over for a supply crate coming up in the other lane (they sit in our lanes)
  if (dec && G.van.s > dec.zoneStart - 150) return;
  const v = G.van;
  const fx = Math.cos(v.heading);
  const fy = Math.sin(v.heading);
  let best = null;
  for (const c of G.crates || []) {
    const ly = (c.x - v.x) * fx + (c.y - v.y) * fy;
    const lx = (c.x - v.x) * -fy + (c.y - v.y) * fx;
    if (ly > 0 && ly < G.speed * 1.6 && Math.abs(lx) < 200 && (!best || ly < best.ly)) best = { lx, ly };
  }
  if (best && Math.abs(best.lx) > 12) G.keys[best.lx < 0 ? "left" : "right"] = true;
}

/* ---------- The human-like aiming bot ----------
   Sees a walker only once it is on the screen, its figure (feet to head as projected) is at least minPx tall there
   (about 800 units ahead for a plain walker at 1280x720) and it has faded in half way (minFade: Persp.bornFade). Picks
   the nearest such walker (by ground distance to the van) and sticks with it while it stays seen, unless another
   comes within `sticky` x its distance. Its pointer is where that walker's body middle WAS `lag` s ago on the screen
   (a hand that tracks with a reaction delay), plus a Gaussian `jitter` px (per axis) re-rolled every `jitterEvery` s.
   It clicks `cps` times a second (each press `press` s, the period +-20%) while it has a target (`fire: "hold"`
   holds the button instead). Aim assist is the game's setting (default on). At night (nightReach) it sees only
   walkers within that many units of the van. */
const BOT_DEFAULT = { minPx: 30, minFade: 0.5, lag: 0.2, jitter: 6, jitterEvery: 0.25, cps: 6, press: 0.07, sticky: 0.7, fire: "click", nightReach: null };
function makeBot(o, rnd) {
  const p = Object.assign({}, BOT_DEFAULT, o || {});
  const lagN = Math.max(0, Math.round(p.lag / DT));
  const hist = [];
  let target = null;
  let jx = 0;
  let jy = 0;
  let jt = 0;
  let clickT = 0;
  let nextClick = 0;
  const gauss = () => {
    let u = 0;
    while (!u) u = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
  };
  const { G, ZSR } = SIM;
  const P = ZSR.Persp;
  /** The walker's body middle on the screen, if a human would see it as a target now; else null. */
  function seen(z) {
    if (G.mods && G.mods.night && p.nightReach != null && Math.hypot(z.x - G.van.x, z.y - G.van.y) > p.nightReach) return null;
    if (typeof P.bornFade === "function" && P.bornFade(G, z) < (p.minFade == null ? 0.5 : p.minFade)) return null;
    const H = P.walkerH(z);
    const foot = P.project(z.x, z.y, 0);
    const head = P.project(z.x, z.y, H);
    if (!foot || !head || foot.y - head.y < p.minPx) return null;
    const mid = P.project(z.x, z.y, H * 0.5);
    if (!mid || mid.x < 0 || mid.x > G.W || mid.y < 0 || mid.y > G.H) return null;
    return { x: mid.x, y: mid.y };
  }
  return {
    params: p,
    step(t) {
      P.setup(G);
      const v = G.van;
      const d = (z) => Math.hypot(z.x - v.x, z.y - v.y);
      let pt = null;
      if (target && (!G.zombies.includes(target) || !(pt = seen(target)))) target = null;
      let best = null;
      let bd = Infinity;
      let bpt = null;
      for (const z of G.zombies) {
        const dz = d(z);
        if (dz >= bd || z === target) continue;
        const s = seen(z);
        if (!s) continue;
        bd = dz;
        best = z;
        bpt = s;
      }
      if (best && (!target || bd < p.sticky * d(target))) {
        target = best;
        pt = bpt;
      }
      hist.push(target ? pt : null);
      if (hist.length > lagN + 1) hist.shift();
      const q = hist.length > lagN ? hist[0] : null;
      if (t >= jt) {
        jt = t + p.jitterEvery;
        jx = gauss() * p.jitter;
        jy = gauss() * p.jitter;
      }
      if (!q) {
        G.pointer.down = false;
        return;
      }
      G.pointer.x = q.x + jx;
      G.pointer.y = q.y + jy;
      G.pointer.seen = true;
      if (p.fire === "hold") {
        G.pointer.down = true;
        return;
      }
      if (t >= nextClick) {
        clickT = t;
        nextClick = t + (1 / p.cps) * (0.8 + 0.4 * rnd());
      }
      G.pointer.down = t - clickT < p.press;
    },
  };
}

/** One trip. job: { from, to, day, upgrades: {armor, engine, ...}, rooms: {walls, power, medbay, ...}, perkVanHp,
    seed, bot: {...BOT_DEFAULT overrides} | "idle", aimAssist (default true), night / fog: true|false|null (null:
    the game's own roll), maxSecs }. Returns one flat record. */
function runTrip(job) {
  const { G, S, ZSR, hooks } = SIM;
  const W = ZSR.WORLD;
  const St = ZSR.Streets;
  const U = ZSR.Upgrades;
  const up = S.save.upgrades;
  Object.keys(U.DEFS).forEach((k) => (up[k] = (job.upgrades && job.upgrades[k]) || 0));
  S.save.day = job.day;
  S.settings.aimAssist = job.aimAssist !== false;
  S.fx = effectsFor(job.rooms, job.perkVanHp);
  const st = U.stats(up);
  const hp = st.maxHp + S.fx.vanHp;
  const key = job.from + ">" + job.to + "|" + job.day + "|" + job.seed;
  Math.random = lcg(hashStr(key));
  const botRnd = lcg(hashStr(key + "|bot"));
  const r = St.route(job.from, job.to);
  if (!r) throw new Error("no route " + job.from + ">" + job.to);
  const L = W.LOCATIONS.find((l) => l.id === job.to);
  // as main.js drive(): the planned seconds from the map distance, the danger from the destination
  const secs = Math.round(Math.min(W.SETTINGS.tripMaxSeconds, Math.max(W.SETTINGS.tripMinSeconds, r.dist * W.SETTINGS.tripSecondsPerUnit)));
  S.trip = { at: job.from, vanHp: INVULN, vanMaxHp: INVULN, scrap: 0, walkers: 0, miles: 0 };
  const c = (SIM.counters = { t: 0, hp, spawned: 0, gameMet: 0, hits: 0, hitsFront: 0, hitsSide: 0, hitsBack: 0, dmg: 0, died: false, deathT: null, killsAtDeath: null, scrapAtDeath: null, touched: new Set(), killed: new Set(), minD: new Map(), killFar: 0, snd: {} });
  hooks.arrived = null;
  hooks.wrong = 0;
  G.pointer.seen = false;
  G.pointer.down = false;
  G.startTrip({ to: job.to, name: L.name, seconds: secs, danger: L.danger, path: r.path });
  // forced night / fog (the road reads them as it goes: night's spawns, fog's view)
  if (job.night === true || job.night === false) G.mods.night = job.night;
  if (job.fog === true || job.fog === false) G.mods.fog = job.fog;
  const bot = job.bot === "idle" ? null : makeBot(job.bot, botRnd);
  const maxSecs = job.maxSecs || 400;
  let t = 0;
  let frames = 0;
  let aliveSum = 0;
  let maxAlive = 0;
  const v = G.van;
  while (G.running && t < maxSecs) {
    steer();
    if (bot) bot.step(t);
    G.update(DT);
    t += DT;
    c.t = t;
    frames++;
    for (const z of G.zombies) {
      const dz = Math.hypot(z.x - v.x, z.y - v.y);
      const m = c.minD.get(z);
      if (m == null || dz < m) c.minD.set(z, dz);
    }
    aliveSum += G.zombies.length;
    if (G.zombies.length > maxAlive) maxAlive = G.zombies.length;
  }
  let reached = 0;
  const met = new Set(c.killed);
  for (const [z, m] of c.minD) {
    if (m <= MEET_R) {
      reached++;
      met.add(z);
    }
  }
  for (const z of c.killed) if (!(c.minD.get(z) <= MEET_R)) c.killFar++;
  const tr = S.trip;
  return {
    route: job.from + ">" + job.to,
    danger: L.danger,
    day: job.day,
    engine: up.engine,
    loadout: job.loadoutName || null,
    seed: job.seed,
    hp,
    vanDamage: S.fx.vanDamage,
    night: !!G.mods.night,
    fog: !!G.mods.fog,
    planned: secs,
    secs: +t.toFixed(2),
    arrived: hooks.arrived === job.to,
    wrongTurns: hooks.wrong,
    spawned: c.spawned,
    met: met.size,
    reached,
    gameMet: c.gameMet,
    touched: c.touched.size,
    hits: c.hits,
    hitsFront: c.hitsFront,
    hitsSide: c.hitsSide,
    hitsBack: c.hitsBack,
    dmg: c.dmg,
    died: c.died,
    deathT: c.deathT == null ? null : +c.deathT.toFixed(2),
    kills: tr.walkers,
    killFar: c.killFar,
    scrap: tr.scrap,
    crates: c.snd.pickup || 0,
    scrapKept: c.died ? 0 : tr.scrap,
    killsAtDeath: c.killsAtDeath,
    shots: c.snd.shoot || 0, // trigger pulls (each fires `bullets` rounds: Spread Shot)
    bullets: st.bullets,
    bulletHits: c.snd.hit || 0, // rounds that hit a walker
    maxAlive,
    avgAlive: +(aliveSum / Math.max(1, frames)).toFixed(2),
  };
}
module.exports = { load, runTrip, effectsFor, setPath, BOT_DEFAULT, MEET_R, DT, fileList, hashStr, get sim() {
  return SIM;
} };
