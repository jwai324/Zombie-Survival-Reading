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
  const want = (f) => f === "layouts.js" || f === "world.js" || /^story[\w-]*\.js$/.test(f) || ["upgrades.js", "weapons.js", "state.js", "crewstate.js", "god.js"].includes(f);
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
  A.setCheat("noDie", true);
  ok(S.cheat("noDie"), "setCheat");

  ok(writes() === before, `nothing written to localStorage in god mode (${writes() - before} writes)`);
  ok(JSON.stringify([...store.entries()].sort()) === disk, "the disk is exactly as before god mode");

  // leaving: the real save and settings back from disk
  S.godEnd();
  ok(!S.god && S.save.day === 5 && S.save.scrap === 40 && S.settings.level !== 6, "godEnd: the real save and settings come back");
  ok(!S.cheat("noDie"), "cheats end with god mode");
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
