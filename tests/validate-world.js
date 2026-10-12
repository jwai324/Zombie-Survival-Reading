#!/usr/bin/env node
/* Sanity checks for js/world.js: grids, spots, reachability, and reveal chains. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const sb = {};
sb.globalThis = sb;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "js", "world.js"), "utf8"), sb);
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
  if (count(t.grid, "n") < 1) err(`template ${name}: needs a note spot n`);
  if (count(t.grid, "z") < 2) err(`template ${name}: needs 2+ walker spawns`);
  // border must be solid
  const solid = (c) => "#SCXGL".includes(c) || c === "E";
  if (![...t.grid[0]].every(solid) || ![...t.grid[t.grid.length - 1]].every(solid)) err(`template ${name}: top/bottom border not solid`);
  if (!t.grid.every((r) => solid(r[0]) && solid(r[w - 1]))) err(`template ${name}: side border not solid`);
  // flood fill from E over passable tiles (not through L): cache spots must be unreachable; others reachable
  const H = t.grid.length;
  const seen = new Set();
  const start = (() => { for (let y = 0; y < H; y++) { const x = t.grid[y].indexOf("E"); if (x >= 0) return [x, y]; } })();
  const pass = (c) => ".inz$DE".includes(c);
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
    if ("in$".includes(c) && !seen.has(x + "," + y)) err(`template ${name}: ${c} at ${x},${y} unreachable from the entrance`);
    if (c === "c" && seen.has(x + "," + y)) err(`template ${name}: cache spot at ${x},${y} reachable without the locked door`);
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
      if (pass(t.grid[ny][nx]) || t.grid[ny][nx] === "L" || t.grid[ny][nx] === "c") stack2.push([nx, ny]);
    });
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) {
    if (t.grid[y][x] === "c" && !seen2.has(x + "," + y)) err(`template ${name}: cache spot at ${x},${y} unreachable even with the door open`);
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
  if (count(t.grid, "n") < N.notes.length) err(`${l.id}: template has ${count(t.grid, "n")} note spots, needs ${N.notes.length}`);
  if (!N.notes.some((n) => n.unlocks === l.id)) err(`${l.id}: no note unlocks its cache`);
  N.notes.forEach((n) => (n.reveals || []).forEach((r) => { if (!ids.has(r)) err(`${l.id}: reveals unknown ${r}`); }));
});
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
  r.levels.forEach((lv, i) => Object.keys(lv.needs).forEach((it) => { if (!W.ITEMS[it]) err(`room ${room} L${i + 1}: unknown item ${it}`); }));
});
// every item is obtainable somewhere
const available = new Set();
W.LOCATIONS.forEach((l) => (l.items || []).concat(l.cache || []).forEach((it) => available.add(it)));
Object.values(W.BASE_ROOMS).forEach((r) => r.levels.forEach((lv) => Object.keys(lv.needs).forEach((it) => { if (!available.has(it)) err(`item ${it} is needed but found nowhere`); })));
// roads connect everything
const adj = {};
W.ROADS.forEach(([a, b]) => { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); if (!ids.has(a) || !ids.has(b)) err(`road ${a}-${b} names an unknown location`); });
const reach = new Set(["base"]);
const st = ["base"];
while (st.length) { const a = st.pop(); (adj[a] || []).forEach((b) => { if (!reach.has(b)) { reach.add(b); st.push(b); } }); }
W.LOCATIONS.forEach((l) => { if (!reach.has(l.id)) err(`${l.id}: no road reaches it`); });

if (errors.length) { errors.forEach((e) => console.log("ERROR " + e)); process.exit(1); }
console.log(`OK: world has ${W.LOCATIONS.length} locations, ${Object.keys(W.TEMPLATES).length} templates, ${Object.keys(W.ITEMS).length} items, ${Object.keys(W.BASE_ROOMS).length} rooms.`);
