#!/usr/bin/env node
/* Sanity checks for js/world.js: grids, spots, reachability, and reveal chains. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const sb = {};
sb.globalThis = sb;
["world.js", "story.js"].forEach((f) => {
  const file = path.join(__dirname, "..", "js", f);
  if (fs.existsSync(file)) vm.runInNewContext(fs.readFileSync(file, "utf8"), sb, { filename: f });
});
const W = sb.ZSR.WORLD;
const errors = [];
const err = (m) => errors.push(m);
const count = (grid, ch) => grid.join("").split(ch).length - 1;

// templates
Object.entries(W.TEMPLATES).forEach(([name, t]) => {
  const w = t.grid[0].length;
  if (!t.grid.every((r) => r.length === w)) err(`template ${name}: rows differ in length`);
  if (count(t.grid, "E") !== 1) err(`template ${name}: needs exactly one E`);
  if (count(t.grid, "L") < 1) err(`template ${name}: needs a locked door L`);
  if (count(t.grid, "n") + count(t.grid, "1") !== 1) err(`template ${name}: needs exactly one note spot 1 (or n)`);
  if (count(t.grid, "K") !== 1) err(`template ${name}: needs exactly one stash door K`);
  if (count(t.grid, "k") < 2) err(`template ${name}: needs 2+ stash item spots k`);
  if (count(t.grid, "y") !== 1) err(`template ${name}: needs exactly one key spot y`);
  for (const d of "234567") if (count(t.grid, d) > 1) err(`template ${name}: note spot ${d} appears twice`);
  if (count(t.grid, "z") < 2) err(`template ${name}: needs 2+ walker spawns`);
  // border must be solid
  const solid = (c) => "#SCXGLKW".includes(c) || c === "E";
  if (![...t.grid[0]].every(solid) || ![...t.grid[t.grid.length - 1]].every(solid)) err(`template ${name}: top/bottom border not solid`);
  if (!t.grid.every((r) => solid(r[0]) && solid(r[w - 1]))) err(`template ${name}: side border not solid`);
  // flood fill from E over passable tiles (not through L): cache spots must be unreachable; others reachable
  const H = t.grid.length;
  const seen = new Set();
  const start = (() => { for (let y = 0; y < H; y++) { const x = t.grid[y].indexOf("E"); if (x >= 0) return [x, y]; } })();
  const pass = (c) => ".inz$DEy1234567".includes(c);
  const stack = [start];
  while (stack.length) {
    const [x, y] = stack.pop();
    const k = x + "," + y;
    if (seen.has(k)) continue;
    seen.add(k);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (ny < 0 || ny >= H || nx < 0 || nx >= w) return;
      if (pass(t.grid[ny][nx])) stack.push([nx, ny]);
    });
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) {
    const c = t.grid[y][x];
    if ("in$y1234567".includes(c) && !seen.has(x + "," + y)) err(`template ${name}: ${c} at ${x},${y} unreachable from the entrance`);
    if (c === "c" && seen.has(x + "," + y)) err(`template ${name}: cache spot at ${x},${y} reachable without the locked door`);
    if (c === "k" && seen.has(x + "," + y)) err(`template ${name}: stash spot at ${x},${y} reachable without the stash door`);
    // a sign must face open floor somewhere, or nobody can read it
    if (c === "W" && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(x + dx + "," + (y + dy)))) err(`template ${name}: sign W at ${x},${y} faces no floor the player can reach`);
  }
  // walkers must start at least 6 steps from the player's start tile (the tile above E), and no item may sit on it
  const startTile = [start[0], start[1] - 1];
  const dist = new Map([[startTile.join(","), 0]]);
  const q = [startTile];
  while (q.length) {
    const [x, y] = q.shift();
    const d = dist.get(x + "," + y);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (ny < 0 || ny >= H || nx < 0 || nx >= w) return;
      if (!pass(t.grid[ny][nx]) || dist.has(nx + "," + ny)) return;
      dist.set(nx + "," + ny, d + 1);
      q.push([nx, ny]);
    });
  }
  if (!pass(t.grid[startTile[1]][startTile[0]]) || t.grid[startTile[1]][startTile[0]] === "i") err(`template ${name}: the tile above E must be plain floor`);
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) {
    if (t.grid[y][x] === "z" && dist.has(x + "," + y) && dist.get(x + "," + y) < 6) err(`template ${name}: walker spawn at ${x},${y} is only ${dist.get(x + "," + y)} steps from the entrance (need 6+)`);
  }
  // cache spots reachable once L is open
  const seen2 = new Set();
  const stack2 = [start];
  while (stack2.length) {
    const [x, y] = stack2.pop();
    const k = x + "," + y;
    if (seen2.has(k)) continue;
    seen2.add(k);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (ny < 0 || ny >= H || nx < 0 || nx >= w) return;
      if (pass(t.grid[ny][nx]) || "LcKk".includes(t.grid[ny][nx])) stack2.push([nx, ny]);
    });
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) {
    if (t.grid[y][x] === "c" && !seen2.has(x + "," + y)) err(`template ${name}: cache spot at ${x},${y} unreachable even with the door open`);
    if (t.grid[y][x] === "k" && !seen2.has(x + "," + y)) err(`template ${name}: stash spot at ${x},${y} unreachable even with the stash door open`);
  }
});

// locations
const ids = new Set(W.LOCATIONS.map((l) => l.id));
W.LOCATIONS.filter((l) => l.id !== "base").forEach((l) => {
  const t = W.TEMPLATES[l.template];
  if (!t) return err(`${l.id}: unknown template ${l.template}`);
  if (count(t.grid, "i") < l.items.length) err(`${l.id}: template has ${count(t.grid, "i")} item spots, needs ${l.items.length}`);
  if (count(t.grid, "c") < l.cache.length) err(`${l.id}: template has ${count(t.grid, "c")} cache spots, needs ${l.cache.length}`);
  l.items.concat(l.cache).forEach((it) => { if (!W.ITEMS[it]) err(`${l.id}: unknown item ${it}`); });
  const N = W.NOTES[l.id];
  if (!N) return err(`${l.id}: no notes`);
  // every note names a spot that exists in its template, and no two notes share one
  const spots = new Set();
  N.notes.forEach((n) => {
    const spot = String(n.spot || "");
    if (!/^[1-7]$/.test(spot)) return err(`${l.id} ${n.id}: needs a spot 1 to 7`);
    if (!count(t.grid, spot) && !(spot === "1" && count(t.grid, "n"))) err(`${l.id} ${n.id}: template ${l.template} has no note spot ${spot}`);
    if (spots.has(spot)) err(`${l.id} ${n.id}: spot ${spot} is used by another note`);
    spots.add(spot);
    if (n.after && !N.notes.some((m) => m.id === n.after)) err(`${l.id} ${n.id}: after names unknown note ${n.after}`);
    if (n.minLevel != null && !(n.minLevel >= 1 && n.minLevel <= 6)) err(`${l.id} ${n.id}: minLevel must be 1 to 6`);
    if (!Array.isArray(n.facts) || !n.facts.length) err(`${l.id} ${n.id}: facts missing`);
  });
  const noteIds = N.notes.map((n) => n.id).concat([N.door.id]);
  if (new Set(noteIds).size !== noteIds.length) err(`${l.id}: two notes share an id`);
  // stash and key
  if (!Array.isArray(l.stash) || !l.stash.length || !l.stashName) err(`${l.id}: needs stash items and a stashName`);
  else {
    if (count(t.grid, "k") < l.stash.length) err(`${l.id}: template has ${count(t.grid, "k")} stash spots, needs ${l.stash.length}`);
    l.stash.forEach((it) => { if (!W.ITEMS[it]) err(`${l.id}: unknown stash item ${it}`); });
  }
  if (W.KEYS && !W.KEYS[l.id]) err(`${l.id}: hides no key (KEYS)`);
  if (N.key) {
    if (N.key.opens !== W.KEYS[l.id]) err(`${l.id}: key.opens ${N.key.opens} does not match KEYS (${W.KEYS[l.id]})`);
    if (!N.notes.some((n) => n.id === N.key.after)) err(`${l.id}: key.after names unknown note ${N.key.after}`);
    const kn = N.notes.find((n) => n.id === N.key.after);
    const target = W.LOCATIONS.find((x) => x.id === N.key.opens);
    if (kn && target && !(kn.reveals || []).includes(target.id)) err(`${l.id}: the key note must reveal ${target.id} (where its stash is)`);
    if (!Array.isArray(N.key.facts) || !N.key.facts.length) err(`${l.id}: key facts missing`);
  }
  if (N.signs) {
    if (N.signs.length !== count(t.grid, "W")) err(`${l.id}: ${N.signs.length} signs for ${count(t.grid, "W")} W spots in ${l.template}`);
    N.signs.forEach((sg) => {
      if (!sg.id || !["sign", "graffiti"].includes(sg.kind) || !Array.isArray(sg.facts) || !sg.facts.length) err(`${l.id}: sign ${sg.id} needs an id, kind sign|graffiti, and facts`);
    });
  }
  if (!N.notes.some((n) => n.unlocks === l.id)) err(`${l.id}: no note unlocks its cache`);
  N.notes.forEach((n) => (n.reveals || []).forEach((r) => { if (!ids.has(r)) err(`${l.id}: reveals unknown ${r}`); }));
});
// the key ring: every building hides exactly one key and every stash has exactly one key
if (W.KEYS) {
  const targets = Object.values(W.KEYS);
  Object.entries(W.KEYS).forEach(([from, to]) => {
    if (!ids.has(from) || !ids.has(to)) err(`KEYS ${from} -> ${to} names an unknown location`);
    if (from === to) err(`KEYS ${from} opens its own stash`);
  });
  if (new Set(targets).size !== targets.length) err("KEYS: two keys open the same stash");
}
// reveal chain reaches everything
const known = new Set(W.LOCATIONS.filter((l) => l.known).map((l) => l.id));
let grew = true;
while (grew) {
  grew = false;
  [...known].forEach((id) => (W.NOTES[id] ? W.NOTES[id].notes : []).forEach((n) => (n.reveals || []).forEach((r) => { if (!known.has(r)) { known.add(r); grew = true; } })));
}
W.LOCATIONS.forEach((l) => { if (!known.has(l.id)) err(`${l.id}: never revealed by any note (only the Radio could find it)`); });
// recipes
Object.entries(W.BASE_ROOMS).forEach(([room, r]) => {
  if (r.levels.length !== 3) err(`room ${room}: needs 3 levels`);
  r.levels.forEach((lv, i) => {
    Object.keys(lv.needs).forEach((it) => { if (!W.ITEMS[it]) err(`room ${room} L${i + 1}: unknown item ${it}`); });
    if (!(lv.scrap > 0)) err(`room ${room} L${i + 1}: scrap cost missing`);
    Object.entries(lv.requires || {}).forEach(([other, lvl]) => {
      if (!W.BASE_ROOMS[other]) err(`room ${room} L${i + 1}: requires unknown room ${other}`);
      else if (other === room) err(`room ${room} L${i + 1}: requires itself`);
      else if (!(lvl >= 1 && lvl <= 3)) err(`room ${room} L${i + 1}: requires ${other} level ${lvl} (must be 1..3)`);
    });
  });
});
// requirements never form a cycle (every room is eventually buildable)
{
  const built = {};
  Object.keys(W.BASE_ROOMS).forEach((k) => (built[k] = 0));
  let grew = true;
  while (grew) {
    grew = false;
    Object.entries(W.BASE_ROOMS).forEach(([room, r]) => {
      const lv = r.levels[built[room]];
      if (!lv) return;
      const ok = Object.entries(lv.requires || {}).every(([o, l]) => built[o] >= l);
      if (ok) { built[room] += 1; grew = true; }
    });
  }
  Object.entries(built).forEach(([room, lvl]) => { if (lvl < 3) err(`room ${room}: level ${lvl + 1} can never be built (requirement cycle)`); });
}
// traps
Object.entries(W.TRAPS || {}).forEach(([key, t]) => {
  if (!t.name || !t.key) err(`trap ${key}: needs a name and a key`);
  Object.keys(t.needs || {}).forEach((it) => { if (!W.ITEMS[it]) err(`trap ${key}: unknown item ${it}`); });
  if (!(t.damage > 0) || !(t.uses >= 1) || !(t.radius > 0)) err(`trap ${key}: damage, uses, radius must be positive`);
  Object.entries(t.requires || {}).forEach(([other, lvl]) => { if (!W.BASE_ROOMS[other] || !(lvl >= 1 && lvl <= 3)) err(`trap ${key}: bad requirement ${other} ${lvl}`); });
});
if (W.TRAPS) {
  const keys = Object.values(W.TRAPS).map((t) => t.key);
  if (new Set(keys).size !== keys.length) err("traps: two traps share a placement key");
}
// every item is obtainable somewhere
const available = new Set();
W.LOCATIONS.forEach((l) => (l.items || []).concat(l.cache || []).forEach((it) => available.add(it)));
Object.values(W.BASE_ROOMS).forEach((r) => r.levels.forEach((lv) => Object.keys(lv.needs).forEach((it) => { if (!available.has(it)) err(`item ${it} is needed but found nowhere`); })));
Object.values(W.TRAPS || {}).forEach((t) => Object.keys(t.needs || {}).forEach((it) => { if (!available.has(it)) err(`trap item ${it} is needed but found nowhere`); }));
// roads connect everything
const adj = {};
W.ROADS.forEach(([a, b]) => { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); if (!ids.has(a) || !ids.has(b)) err(`road ${a}-${b} names an unknown location`); });
const reach = new Set(["base"]);
const st = ["base"];
while (st.length) { const a = st.pop(); (adj[a] || []).forEach((b) => { if (!reach.has(b)) { reach.add(b); st.push(b); } }); }
W.LOCATIONS.forEach((l) => { if (!reach.has(l.id)) err(`${l.id}: no road reaches it`); });

// yard lots: one per outdoor room, on open ground inside the fence, never on each other
const yardLots = (W.YARD && W.YARD.lots) || {};
const lotTiles = new Set();
Object.entries(yardLots).forEach(([room, [x, y]]) => {
  if (!W.BASE_ROOMS[room]) err(`yard lot ${room}: no such room`);
  const ch = W.YARD.grid[y] && W.YARD.grid[y][x];
  if (ch !== ".") err(`yard lot ${room}: tile ${x},${y} is "${ch}", needs open ground`);
  if (lotTiles.has(x + "," + y)) err(`yard lot ${room}: shares a tile`);
  lotTiles.add(x + "," + y);
  const fence = W.YARD.grid.map((r) => r.indexOf("F")).filter((i) => i >= 0);
  if (x <= Math.min(...fence)) err(`yard lot ${room}: outside the fence`);
  if (W.YARD_LOTS && !W.YARD_LOTS[room]) err(`yard lot ${room}: no facts in story-home.js`);
});
// home story facts
if (W.JOURNAL && (!W.JOURNAL.length || W.JOURNAL.some((e) => !e.id || !(e.facts || []).length))) err("JOURNAL: every entry needs an id and facts");
if (W.RADIO && (!W.RADIO.length || W.RADIO.some((e) => !e.id || !e.voice || !(e.facts || []).length))) err("RADIO: every entry needs an id, a voice and facts");
if (W.ITEM_TAGS) Object.keys(W.ITEMS).forEach((k) => { if (!Array.isArray(W.ITEM_TAGS[k]) || W.ITEM_TAGS[k].length !== 2) err(`ITEM_TAGS ${k}: needs 2 tags`); });

if (errors.length) { errors.forEach((e) => console.log("ERROR " + e)); process.exit(1); }
console.log(`OK: world has ${W.LOCATIONS.length} locations, ${Object.keys(W.TEMPLATES).length} templates, ${Object.keys(W.ITEMS).length} items, ${Object.keys(W.BASE_ROOMS).length} rooms.`);
