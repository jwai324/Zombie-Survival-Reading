#!/usr/bin/env node
/* God mode (js/god.js, the sandbox in js/state.js): nothing reaches localStorage while it is on, a death reloads
   the sandbox, leaving brings the real save back untouched, and the menu's actions do what they say against the
   real facts (every place, gun, item, crew member and story quest). Part of npm test.
   Prints one OK line, or the errors and exit 1. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");

const errors = [];
let checks = 0;
function ok(cond, msg) {
  checks++;
  if (!cond) errors.push(msg);
  return !!cond;
}

/** The state files and js/god.js in page order, in a sandbox with a localStorage that records every write. */
function load() {
  const noop = () => {};
  const store = new Map();
  let writes = 0;
  const sb = {
    console,
    addEventListener: noop,
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => (writes++, store.set(k, String(v))),
      removeItem: (k) => (writes++, store.delete(k)),
    },
  };
  sb.globalThis = sb;
  vm.createContext(sb);
  const page = [...fs.readFileSync(path.join(ROOT, "index.html"), "utf8").matchAll(/<script src="js\/([^"]+)"><\/script>/g)].map((m) => m[1]);
  const want = (f) => f === "layouts.js" || f === "world.js" || /^story[\w-]*\.js$/.test(f) || ["upgrades.js", "weapons.js", "state.js", "crewstate.js", "xoverstate.js", "god.js"].includes(f);
  ok(page.includes("god.js") && page.indexOf("god.js") > page.indexOf("main.js"), "index.html loads js/god.js after js/main.js");
  page.filter(want).forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, "js", f), "utf8"), sb, { filename: "js/" + f }));
  return { sb, store, ZSR: sb.ZSR, writes: () => writes };
}

try {
  const { store, ZSR, writes } = load();
  const S = ZSR.State;
  const W = ZSR.WORLD;
  const A = ZSR.God.act;
  S.settings = S.settingsFor(null);

  // a real save on disk: day 5, 40 scrap
  S.newGame(1, "Real");
  S.save.day = 5;
  S.save.scrap = 40;
  S.commit();
  const disk = JSON.stringify([...store.entries()].sort());
  const before = writes();
  ok(!S.cheat("noDie"), "cheat() is false outside god mode");

  // a copy: the sandbox changes, the disk never does
  S.godStart(false);
  ok(S.god && S.save.day === 5 && S.save.scrap === 40, "godStart(false) copies the loaded save");
  S.save.day = 50;
  S.save.scrap = 7;
  S.commit();
  S.settings.level = 6;
  S.saveSettings();
  ok(S.god.base.day === 50, "commit() in god mode keeps the sandbox in memory");
  S.startTrip();
  S.trip.scrap = 99;
  S.abandonTrip(); // a death
  ok(S.save.day === 50 && S.save.scrap === 7 && !S.trip, "a death in god mode reloads the sandbox, not the disk");

  // the menu's actions
  ok(A.revealAll() >= 0 && W.LOCATIONS.every((l) => S.isKnown(l.id)), "revealAll: every place known");
  A.allGuns();
  ok(ZSR.Weapons.ORDER.every((id) => S.hasWeapon(id) && Object.values(S.save.weapons.mods[id]).every((v) => v === ZSR.Weapons.MOD_MAX)), "allGuns: every gun, every mod maxed");
  const gun = ZSR.Weapons.ORDER.find((id) => id !== "pistol");
  if (gun) {
    ok(A.equip(gun) && S.equippedWeapon() === gun, "equip: the gun in hand");
    A.setOwned(gun, false);
    ok(!S.hasWeapon(gun) && S.equippedWeapon() === "pistol", "setOwned(false): gone, the pistol back in hand");
    ok(!A.setOwned("pistol", false) && S.hasWeapon("pistol"), "the pistol cannot be taken away");
    A.setMod(gun, "damage", 99);
    ok(S.save.weapons.mods[gun].damage === ZSR.Weapons.MOD_MAX, "setMod clamps to MOD_MAX");
  }
  A.countKeys().forEach((k) => {
    A.setCount(k, 12);
    ok(A.count(k) === (k === "kits" ? Math.min(12, W.SETTINGS.kitsMax) : 12), "setCount " + k);
  });
  A.setUnlimited(true);
  S.save.scrap = 3;
  S.commit(); // a build spent scrap and saved
  ok(S.save.scrap >= 999 && Object.keys(W.ITEMS).every((k) => (k === "food" ? S.save.food : S.save.inventory[k]) >= 999), "unlimited tops up on every save");
  A.setUnlimited(false);
  A.setDay(9);
  ok(S.save.day === 9, "setDay");
  const top = W.CREW_RULES.stars.length;
  S.crewIds().forEach((id) => {
    for (let n = 0; n <= top; n++) {
      A.setStars(id, n);
      ok(S.stars(id) === n, `setStars ${id} ${n}`);
    }
    A.setStars(id, 0);
  });
  // every story quest can be offered now, out of order and at 0 stars, accepted, and jumped to
  (W.QUESTS || []).forEach((q) => {
    S.settings.universe = q.universe || "off"; // a crossover quest's object waits only in its own universe
    A.offerQuest(q.id);
    const o = S.offer(q.giver);
    ok(o && o.kind === "quest" && o.def.id === q.id, `offerQuest ${q.id}: offered now`);
    ok(S.accept(q.giver, o) && S.questState(q.id) === "active", `offerQuest ${q.id}: can be accepted`);
    A.resetQuest(q.id);
    ok(S.questState(q.id) === null, `resetQuest ${q.id}`);
    A.activateQuest(q.id);
    ok(S.questState(q.id) === "active" && S.isKnown(q.at) && S.questsAt(q.at).some((x) => x.id === q.id), `activateQuest ${q.id}: its object waits at ${q.at}`);
    A.resetQuest(q.id);
  });
  S.settings.universe = "off";
  A.setCheat("noDie", true);
  ok(S.cheat("noDie"), "setCheat");

  // the FPS meter: off by default; on, it says the rate and the worst frame of the last second, and on the road both
  // governors' rows (no page here: its box is not made, what it would say is)
  const FM = ZSR.God.meter;
  ok(FM && !S.cheat("fps") && !FM.on, "the FPS meter is off by default");
  A.setCheat("fps", true);
  ok(S.cheat("fps") && FM.on, "the FPS meter's toggle turns it on");
  for (let i = 0; i < 60; i++) FM.sample(i === 30 ? 50 : 1000 / 60, 10000 + i * (1000 / 60));
  FM.sample(5000, 11100); // (a tab in the background: not a frame)
  let said0 = FM.lines();
  ok(said0.length === 1 && /^(5[0-9]|60) fps .* worst 50 ms$/.test(said0[0]), `the FPS meter off the road says ${JSON.stringify(said0)}`);
  for (let i = 0; i < 70; i++) FM.sample(20, 11200 + i * 20);
  said0 = FM.lines();
  ok(/^50 fps .* worst 20 ms$/.test(said0[0]), `the FPS meter forgets frames over a second old (${said0[0]})`);
  ZSR.Game = { running: true };
  ZSR.Persp = { frameStats: { scenery: 2, gapMs: 21.5, ms: 9.2 }, walkerStats: { level: 3 }, SCENERY_ROWS: 5 };
  ZSR.Interior = { LIVE_LEVELS: [0, 1, 2, 3, 4, 5, 6, 7] };
  said0 = FM.lines();
  ok(said0.length === 3 && /21\.5 ms/.test(said0[1]) && /scenery row 2 of 4/.test(said0[2]) && /walkers row 3 of 7/.test(said0[2]), `the FPS meter on the road says ${JSON.stringify(said0)}`);
  delete ZSR.Game;
  delete ZSR.Persp;
  delete ZSR.Interior;
  A.setCheat("fps", false);
  ok(!FM.on, "the FPS meter's toggle turns it off");
  A.setCheat("fps", true);

  // a walker of any kind in front of you: the kinds are the facts' (WALKER_TYPES); with no scene under the menu it says
  // where it works, an unknown kind is refused, and against a scene it says what happened (no engine is loaded here,
  // so the yard and the road are stand-ins; tests/validate-engine.js spawns every kind in the real scenes)
  const G = ZSR.God;
  const kinds = Object.keys(W.WALKER_TYPES);
  ok(typeof G.scene.spawnWalker === "function", "Scene.spawnWalker exists");
  ok(typeof G.walkerTypes === "function" && JSON.stringify(G.walkerTypes()) === JSON.stringify(kinds), "walkerTypes() is Object.keys(WALKER_TYPES), in order");
  const a = (id) => (/^[aeiou]/i.test(W.WALKER_TYPES[id].name) ? "An " : "A ") + W.WALKER_TYPES[id].name.toLowerCase();
  const said = (id) => {
    try {
      return String(G.scene.spawnWalker(id));
    } catch (e) {
      return "threw " + e.message;
    }
  };
  kinds.forEach((id) => ok(/^Only in /.test(said(id)), `spawnWalker(${id}) with no scene says where it works (${said(id)})`));
  ok(/^No walker kind /.test(said("dragon")), "spawnWalker refuses an unknown kind");
  const placed = [];
  ZSR.Interior = { running: true, player: { x: 1, y: 1, a: 0 }, walkers: [], fallen: [{}], blood: [{}], spawnWalkerAhead: (t) => (placed.push(t), { type: t }), updateHud() {} };
  kinds.forEach((id) => ok(said(id) === a(id) + " in front of you.", `spawnWalker(${id}) on foot says so (${said(id)})`));
  ok(placed.length === kinds.length * 2 && placed.every((t, i) => t === kinds[i >> 1]), "spawnWalker asks the scene for the kind picked");
  ZSR.Interior.spawnWalkerAhead = () => null;
  ok(/^No room /.test(said(kinds[0])), "spawnWalker with no room in front says to turn");
  ZSR.Interior.walkers = [{}];
  ZSR.Interior.fallen = [{}];
  ZSR.Interior.blood = [{}];
  ok(G.scene.clearWalkers() === "1 walker gone." && !ZSR.Interior.walkers.length && !ZSR.Interior.fallen.length && !ZSR.Interior.blood.length, "clearWalkers clears the walkers, the downed ones and the blood");
  delete ZSR.Interior;
  // the road's contract: Game.spawnWalkerAhead(type) puts that kind ahead of the van and returns it (as Interior's);
  // a road with only spawnZombie (a kind picked at random, whatever its parameters) is never asked
  ZSR.Game = { running: true, zombies: [], spawnWalkerAhead(type) { const z = { type }; this.zombies.push(z); return z; }, spawnZombie() { this.zombies.push({ type: "walker", random: true }); } };
  const last = kinds[kinds.length - 1];
  ok(said(last) === a(last) + " on the road ahead." && ZSR.Game.zombies.length === 1 && ZSR.Game.zombies[0].type === last && !ZSR.Game.zombies[0].random, "spawnWalker on the road puts that kind ahead of the van (Game.spawnWalkerAhead)");
  ZSR.Game.spawnWalkerAhead = () => null;
  ok(/^No room on the road/.test(said(kinds[0])), "a road with no room ahead says so");
  // Clear walkers on the road: its walkers, the downed ones and the blood go
  Object.assign(ZSR.Game, { zombies: [{}, {}], fallen: [{}], particles: [{}] });
  ok(G.scene.clearWalkers() === "2 walkers gone." && !ZSR.Game.zombies.length && !ZSR.Game.fallen.length && !ZSR.Game.particles.length, "clearWalkers on the road clears its walkers, the downed ones and the blood");
  for (const spawnZombie of [function () { this.zombies.push({ type: "walker" }); }, function (type = "walker", side) { this.zombies.push({ type, side }); }, function (side) { this.zombies.push({ type: "walker", side }); }]) {
    ZSR.Game = { running: true, zombies: [], spawnZombie };
    ok(/^The road cannot /.test(said(kinds[0])) && !ZSR.Game.zombies.length, `a road without spawnWalkerAhead is not asked to place a kind (spawnZombie(${spawnZombie.length} params))`);
  }
  delete ZSR.Game;

  ok(writes() === before, `nothing written to localStorage in god mode (${writes() - before} writes)`);
  ok(JSON.stringify([...store.entries()].sort()) === disk, "the disk is exactly as before god mode");

  // leaving: the real save and settings back from disk
  S.godEnd();
  ok(!S.god && S.save.day === 5 && S.save.scrap === 40 && S.settings.level !== 6, "godEnd: the real save and settings come back");
  ok(!S.cheat("noDie"), "cheats end with god mode");
  ZSR.God.sync();
  ok(!S.cheat("fps") && !ZSR.God.meter.on, "the FPS meter goes off with god mode");
  S.save.day = 6;
  S.commit();
  ok(writes() > before, "saving works again after god mode");

  // a fresh sandbox
  S.godStart(true);
  ok(S.save.day === 1 && S.save.label === "God mode" && S.save.log.length === 1, "godStart(true): a fresh day 1");
  S.godEnd();
  ok(S.save.day === 6, "the real save survives a fresh sandbox");
} catch (e) {
  errors.push("threw " + String(e && e.stack ? e.stack : e).split("\n").slice(0, 4).join(" | "));
}

if (errors.length) {
  errors.forEach((e) => console.log("ERROR " + e));
  console.log(`validate-god: ${errors.length} error(s) in ${checks} checks`);
  process.exit(1);
}
console.log(`validate-god: OK (${checks} checks)`);
