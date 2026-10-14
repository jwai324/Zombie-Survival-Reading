#!/usr/bin/env node
/* Sanity checks for js/weapons.js against js/world.js: stats, slots, mods, prices,
   where each gun can be hidden, and the old-save upgrade. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const sb = {};
sb.globalThis = sb;
["world.js", "weapons.js"].forEach((f) => vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "js", f), "utf8"), sb, { filename: f }));
const W = sb.ZSR.WORLD;
const WP = sb.ZSR.Weapons;
const errors = [];
const err = (m) => errors.push(m);

// every weapon: a name, its own number key, sane stats
const slots = new Set();
Object.entries(WP.WEAPONS).forEach(([id, w]) => {
  if (!w.name || !w.desc) err(`${id}: needs a name and a description`);
  // SCALE: key 6 is the fishing pole (js/interior.js), so slots stop at 5 until the pole moves
  if (!(w.slot >= 1 && w.slot <= 5) || slots.has(w.slot)) err(`${id}: slot ${w.slot} must be 1..5 and unique (it is the number key)`);
  slots.add(w.slot);
  if (!(w.damage > 0 && w.interval > 0 && w.range > 0)) err(`${id}: damage, interval and range must be positive`);
  if (!(w.spread >= 0 && w.noise >= 0 && w.pierce >= 1 && w.move > 0 && w.move <= 1 && w.cost > 0)) err(`${id}: spread/noise >= 0, pierce >= 1, 0 < move <= 1, cost > 0`);
  if (id === "pistol" && w.danger) err("pistol: carried from the start, it is never hidden");
  if (id !== "pistol") {
    if (!Array.isArray(w.danger) || w.danger.length !== 2 || w.danger[0] > w.danger[1]) err(`${id}: needs a danger range [lo, hi]`);
    else if (!W.LOCATIONS.some((l) => l.template && l.danger >= w.danger[0] && l.danger <= w.danger[1])) err(`${id}: no building has a danger level in ${w.danger}`);
  }
});
if (WP.ORDER[0] !== "pistol") err("the pistol must be slot 1");

// mods: every tier makes its stat better, prices rise and stop at the top tier
Object.keys(WP.WEAPONS).forEach((id) => {
  Object.keys(WP.MODS).forEach((key) => {
    const better = { damage: (a, b) => b.damage > a.damage, range: (a, b) => b.range > a.range, rate: (a, b) => b.interval < a.interval && (!a.draw || b.draw < a.draw), aim: (a, b) => b.spread < a.spread || a.spread === 0 };
    let prev = WP.stats(id, {});
    let lastCost = 0;
    for (let lv = 0; lv < WP.MOD_MAX; lv++) {
      const c = WP.cost(id, key, lv);
      if (!(c > lastCost)) err(`${id} ${key}: tier ${lv + 1} costs ${c}, must be more than ${lastCost}`);
      lastCost = c;
      const next = WP.stats(id, { [key]: lv + 1 });
      if (!better[key](prev, next)) err(`${id} ${key}: tier ${lv + 1} does not improve the gun`);
      prev = next;
    }
    if (WP.cost(id, key, WP.MOD_MAX) !== null) err(`${id} ${key}: no price past the top tier`);
    if (!WP.mod(id, key).name) err(`${id} ${key}: mod needs a name`);
  });
});

// hiding places: always valid, in range, and in different buildings when that can be done
const hidden = WP.ORDER.filter((id) => WP.WEAPONS[id].danger);
for (let i = 0; i < 300; i++) {
  const where = WP.roll(W.LOCATIONS);
  hidden.forEach((id) => {
    const l = W.LOCATIONS.find((x) => x.id === where[id]);
    const d = WP.WEAPONS[id].danger;
    if (!l || !l.template) return err(`roll ${i}: ${id} placed at ${where[id]}`);
    if (l.danger < d[0] || l.danger > d[1]) err(`roll ${i}: ${id} at ${l.id} (danger ${l.danger}) is outside ${d}`);
  });
  if (new Set(Object.values(where)).size !== hidden.length) err(`roll ${i}: two guns share a building: ${JSON.stringify(where)}`);
  if (errors.length > 20) break;
}

// an old save: the pistol keeps what its gun upgrades bought; a partial save is filled in
const old = { upgrades: { damage: 4, fireRate: 2 } };
WP.upgradeSave(old, W.LOCATIONS);
if (old.weapons.mods.pistol.damage !== 3 || old.weapons.mods.pistol.rate !== 2) err("old save: pistol mods should come from its gun upgrades (capped at 3)");
if (JSON.stringify(old.weapons.owned) !== '["pistol"]' || old.weapons.equipped !== "pistol") err("old save: starts with the pistol in hand");
const partial = { upgrades: {}, weapons: { owned: ["mg", "nope"], equipped: "nope", mods: { mg: { damage: 2 } }, where: { bow: "nowhere" } } };
WP.upgradeSave(partial, W.LOCATIONS);
const pw = partial.weapons;
if (!pw.owned.includes("pistol") || pw.owned.includes("nope") || pw.equipped !== "pistol") err("partial save: unknown guns dropped, pistol restored and in hand");
if (pw.mods.mg.damage !== 2 || pw.mods.mg.range !== 0 || !pw.mods.hmg) err("partial save: mods kept and filled in");
if (!W.LOCATIONS.some((l) => l.id === pw.where.bow) || pw.where.mg) err("partial save: a lost hiding place is re-rolled; an owned gun needs none");

if (errors.length) { errors.forEach((e) => console.log("ERROR " + e)); process.exit(1); }
console.log(`OK: ${WP.ORDER.length} weapons (${hidden.length} hidden in the city), ${Object.keys(WP.MODS).length} mods x ${WP.MOD_MAX} tiers.`);
