#!/usr/bin/env node
/* Sanity checks for js/world.js, js/layouts.js and the story facts (js/story.js, js/story-home.js):
   interior layouts (legend v2, landmarks, decor, reachability), the stash and key in every building,
   note spots and wall signs, notes that name the landmarks, the key ring, and reveal chains. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const sb = {};
sb.globalThis = sb;
vm.createContext(sb);
// layouts.js defines ZSR.LAYOUTS (the interiors); world.js uses them as its TEMPLATES
["layouts.js", "world.js", "story.js", "story-home.js"].forEach((f) => vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js", f), "utf8"), sb, { filename: f }));
const W = sb.ZSR.WORLD;
const ART = sb.ZSR.LAYOUT_ART || {};
const DECOR = sb.ZSR.LAYOUT_DECOR || {};
const errors = [];
const err = (m) => errors.push(m);
const count = (grid, ch) => grid.join("").split(ch).length - 1;

// interiors: one layout per location (js/layouts.js, legend v2)
const ids = new Set(W.LOCATIONS.map((l) => l.id));
const LEGEND = "#W.DLQESXGCKR1234inckyz$";
const BORDER = "#WSXGE"; // full-height tiles (and the entrance) may sit on the outer wall
const WALLISH = "#WSXGDLQE"; // full-height tiles: a wall face behind them is never seen
const WALL_STYLES = ["block", "drywall", "brick", "tile", "metal", "wood", "concrete", "glassbrick"];
const FLOOR_KINDS = ["tile", "checker", "linoleum", "carpet", "wood", "concrete", "dirt", "grate", "grass", "gravel", "planks"];
const CEILING_KINDS = ["panels", "beams", "concrete", "pipes", "sky"];
const QUADRANT = { 1: "back left (NW)", 2: "back right (NE)", 3: "front left (SW)", 4: "front right (SE)" };
const SIDES = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
const STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const NUMBER = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14 };
Object.keys(W.TEMPLATES).forEach((name) => { if (!ids.has(name) || name === "base") err(`layout ${name}: no location has this id`); });
Object.entries(W.TEMPLATES).forEach(([name, t]) => {
  const ctx = `layout ${name}`;
  const loc = W.LOCATIONS.find((l) => l.id === name);
  const g = t.grid;
  const H = g.length;
  const w = g[0].length;
  if (!g.every((r) => r.length === w)) return err(`${ctx}: rows differ in length (${g.map((r) => r.length).join(" ")})`);
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= H ? "#" : g[y][x]);
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) if (!LEGEND.includes(g[y][x])) err(`${ctx}: unknown tile "${g[y][x]}" at ${x},${y}`);
  // palette: colors plus the engine's catalogs
  const P = t.palette || {};
  ["wall", "shelf", "counter", "floor", "ceiling"].forEach((k) => { if (!/^#[0-9a-f]{6}$/i.test(P[k] || "")) err(`${ctx}: palette.${k} must be a #rrggbb color`); });
  if (!WALL_STYLES.includes(P.wallStyle)) err(`${ctx}: palette.wallStyle "${P.wallStyle}" not in ${WALL_STYLES.join(", ")}`);
  if (!FLOOR_KINDS.includes(P.floorKind)) err(`${ctx}: palette.floorKind "${P.floorKind}" not in ${FLOOR_KINDS.join(", ")}`);
  if (!CEILING_KINDS.includes(P.ceilingKind)) err(`${ctx}: palette.ceilingKind "${P.ceilingKind}" not in ${CEILING_KINDS.join(", ")}`);
  if (!(P.light >= 0 && P.light <= 1)) err(`${ctx}: palette.light must be 0..1`);
  // solid border, one entrance on the front (bottom) wall with plain floor inside it, one locked door
  for (let x = 0; x < w; x++) if (!BORDER.includes(g[0][x]) || !BORDER.includes(g[H - 1][x])) err(`${ctx}: border open at x ${x}`);
  for (let y = 0; y < H; y++) if (!BORDER.includes(g[y][0]) || !BORDER.includes(g[y][w - 1])) err(`${ctx}: border open at y ${y}`);
  if (count(g, "E") !== 1) return err(`${ctx}: needs exactly one E`);
  const ex = g[H - 1].indexOf("E");
  if (ex < 0) return err(`${ctx}: the entrance E must be on the bottom (front) wall; the notes count left/right from it`);
  if (g[H - 2][ex] !== ".") err(`${ctx}: the tile inside the entrance must be plain floor`);
  if (count(g, "L") !== 1) err(`${ctx}: needs exactly one locked door L`);
  if (count(g, "Q") !== 1) err(`${ctx}: needs exactly one stash door Q`);
  if (count(g, "k") < 2) err(`${ctx}: needs 2+ stash item spots k`);
  if (count(g, "y") !== 1) err(`${ctx}: needs exactly one key spot y`);
  if (count(g, "n") !== 1) err(`${ctx}: needs exactly one note spot n (spot 1, the main note)`);
  // landmarks: one per corner quadrant and near its corner, with a def; big ones cover a footprint of plain floor
  const marks = t.landmarks || {};
  const blocked = new Set(); // solid landmark tiles and their footprints
  const names = [];
  const inQuadrant = (d, x, y) => x < w / 2 === (d === "1" || d === "3") && y < H / 2 === (d === "1" || d === "2");
  ["1", "2", "3", "4"].forEach((d) => {
    const def = marks[d];
    if (count(g, d) !== 1) return err(`${ctx}: landmark ${d} must appear exactly once (found ${count(g, d)})`);
    const y = g.findIndex((r) => r.includes(d));
    const x = g[y].indexOf(d);
    if (!inQuadrant(d, x, y)) err(`${ctx}: landmark ${d} at ${x},${y} must be in the ${QUADRANT[d]} quadrant`);
    // not hugging the middle lines: within 80% of the half width and half height of its own corner
    const fx = (d === "1" || d === "3" ? x : w - 1 - x) / (w / 2);
    const fy = (d === "1" || d === "2" ? y : H - 1 - y) / (H / 2);
    if (fx > 0.8 || fy > 0.8) err(`${ctx}: landmark ${d} at ${x},${y} is too far from its corner (${Math.round(fx * 100)}% across, ${Math.round(fy * 100)}% down its quadrant; keep both at 80% or less)`);
    if (!def || !def.name || !def.art) return err(`${ctx}: landmark ${d} needs a def with a name and art`);
    if (!ART[def.art]) err(`${ctx}: landmark ${d} art "${def.art}" is not in LAYOUT_ART`);
    if (names.includes(def.name.toLowerCase())) err(`${ctx}: two landmarks are called "${def.name}"`);
    names.push(def.name.toLowerCase());
    // size is the height in tiles; under a ceiling the engine draws nothing taller than 0.98
    const tallest = P.ceilingKind === "sky" ? 2.6 : 0.98;
    if (!(def.size >= 0.3 && def.size <= tallest)) err(`${ctx}: landmark ${d} size ${def.size} must be 0.3..${tallest} (its height in tiles${P.ceilingKind === "sky" ? "" : "; the ceiling caps it at 0.98"})`);
    // the art stream draws from the LAYOUT_ART line: tints, labels and footprints must be announced there
    if (def.color && !/color =/.test(ART[def.art] || "")) err(`${ctx}: landmark ${d} passes a color, but LAYOUT_ART.${def.art} does not say "(color = ...)"`);
    if (def.label && !/label/.test(ART[def.art] || "")) err(`${ctx}: landmark ${d} passes a label, but LAYOUT_ART.${def.art} does not say "(label)"`);
    if (def.solid) blocked.add(x + "," + y);
    if (def.foot) {
      const [fw, fh] = def.foot;
      if (!(fw % 2 === 1 && fh % 2 === 1)) err(`${ctx}: landmark ${d} foot must be odd sizes`);
      if (!(ART[def.art] || "").includes(`foot ${fw} x ${fh}`)) err(`${ctx}: landmark ${d} has foot ${fw} x ${fh}, but LAYOUT_ART.${def.art} does not say "foot ${fw} x ${fh}"`);
      for (let yy = y - (fh >> 1); yy <= y + (fh >> 1); yy++) {
        for (let xx = x - (fw >> 1); xx <= x + (fw >> 1); xx++) {
          if (!inQuadrant(d, xx, yy)) err(`${ctx}: landmark ${d} footprint tile ${xx},${yy} is outside the ${QUADRANT[d]} quadrant`);
          if (xx === x && yy === y) continue;
          if (at(xx, yy) !== ".") err(`${ctx}: landmark ${d} footprint tile ${xx},${yy} must be plain floor`);
          blocked.add(xx + "," + yy);
        }
      }
    }
  });
  // doors (D, and the locked L and Q): walls on one axis, a walkable tile on both sides of the other,
  // so a door never opens into a shelf, a counter, a table or a landmark
  const walkable = (x, y) => ".inz$cky1234".includes(at(x, y)) && !blocked.has(x + "," + y);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < w; x++) {
      if (!"DLQ".includes(g[y][x])) continue;
      const wall = (ax, ay, bx, by) => "#W".includes(at(ax, ay)) && "#W".includes(at(bx, by));
      const ok = (wall(x - 1, y, x + 1, y) && walkable(x, y - 1) && walkable(x, y + 1)) || (wall(x, y - 1, x, y + 1) && walkable(x - 1, y) && walkable(x + 1, y));
      if (!ok) err(`${ctx}: door ${g[y][x]} at ${x},${y} needs wall on two opposite sides and open floor on the other two (it opens into ${at(x, y - 1)} ${at(x + 1, y)} ${at(x, y + 1)} ${at(x - 1, y)}, n e s w)`);
    }
  }
  Object.keys(marks).forEach((k) => { if (!"1234".includes(k) || k.length !== 1) err(`${ctx}: landmark key "${k}" (use 1 to 4)`); });
  // reachability from the entrance (closed cache door: blocks; open: passes). Low tiles (C K R) block movement.
  const pass = (x, y) => ".inyz$DE1234".includes(at(x, y)) && !blocked.has(x + "," + y);
  // open: "Lc" with the cache door open, "Qk" with the stash door open
  const flood = (open) => {
    const dist = new Map([[ex + "," + (H - 1), 0]]);
    const q = [[ex, H - 1]];
    while (q.length) {
      const [x, y] = q.shift();
      STEPS.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        const k = nx + "," + ny;
        if (dist.has(k) || !(pass(nx, ny) || (open && open.includes(at(nx, ny))))) return;
        dist.set(k, dist.get(x + "," + y) + 1);
        q.push([nx, ny]);
      });
    }
    return dist;
  };
  const shut = flood("");
  const open = flood("Lc");
  const stashOpen = flood("Qk");
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < w; x++) {
      const c = g[y][x];
      const k = x + "," + y;
      if ("inyz$".includes(c) && !shut.has(k)) err(`${ctx}: ${c} at ${k} unreachable from the entrance`);
      if (c === "k" && STEPS.some(([dx, dy]) => shut.has(x + dx + "," + (y + dy)))) err(`${ctx}: stash spot at ${k} reachable without the stash door`);
      if (c === "k" && !stashOpen.has(k)) err(`${ctx}: stash spot at ${k} unreachable even with the stash door open`);
      if (c === "c" && STEPS.some(([dx, dy]) => shut.has(x + dx + "," + (y + dy)))) err(`${ctx}: cache spot at ${k} reachable without the locked door`);
      if (c === "c" && !open.has(k)) err(`${ctx}: cache spot at ${k} unreachable even with the door open`);
      // walkers start at least 6 steps from the player's start tile (one step in from E)
      if (c === "z" && shut.has(k) && shut.get(k) - 1 < 6) err(`${ctx}: walker spawn at ${k} is only ${shut.get(k) - 1} steps from the entrance (need 6+)`);
    }
  }
  if (count(g, "z") < 2) err(`${ctx}: needs 2+ walker spawns`);
  if (loc && count(g, "z") > W.SETTINGS.walkersPerLocation(loc.danger, 1)) err(`${ctx}: ${count(g, "z")} walker spawns but only ${W.SETTINGS.walkersPerLocation(loc.danger, 1)} walkers on day 1 (a spawn the notes mention could stay empty)`);
  if (count(g, "$") < 2 || count(g, "$") > 4) err(`${ctx}: needs 2 to 4 scrap piles (has ${count(g, "$")})`);
  // decor: wall tiles that face the room, known keys, one per tile
  const taken = new Set();
  (t.decor || []).forEach((d) => {
    const k = d.x + "," + d.y;
    if (at(d.x, d.y) !== "#") err(`${ctx}: decor ${d.tex} at ${k} is not on a wall tile`);
    const sides = Object.keys(SIDES).filter((s) => !WALLISH.includes(at(d.x + SIDES[s][0], d.y + SIDES[s][1])));
    if (!sides.length) err(`${ctx}: decor ${d.tex} at ${k} faces no open tile`);
    if (d.face && !sides.includes(d.face)) err(`${ctx}: decor ${d.tex} at ${k} faces "${d.face}", which is not open`);
    if (!DECOR[d.tex]) err(`${ctx}: decor key "${d.tex}" is not in LAYOUT_DECOR`);
    else if (d.text != null && !/uses text/.test(DECOR[d.tex])) err(`${ctx}: decor ${d.tex} at ${k} has text, but LAYOUT_DECOR.${d.tex} does not say it "uses text"`);
    // one 64 x 64 wall tile: short words only (the notes carry what the player must read)
    if (d.text != null && !(typeof d.text === "string" && d.text.length >= 1 && d.text.length <= 12)) err(`${ctx}: decor text "${d.text}" at ${k} must be 1 to 12 characters`);
    if (taken.has(k)) err(`${ctx}: two decor entries on ${k}`);
    taken.add(k);
  });
  // note spots 2 to 7 (spot 1 is the n tile): plain reachable floor, off every landmark and marker
  const used = new Set();
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) if ("inckyz$".includes(g[y][x])) used.add(x + "," + y);
  Object.entries(t.spots || {}).forEach(([n, xy]) => {
    const k = Array.isArray(xy) ? xy.join(",") : "?";
    if (!/^[2-7]$/.test(n)) err(`${ctx}: note spot "${n}" (use 2 to 7; spot 1 is the n tile)`);
    if (!Array.isArray(xy) || at(xy[0], xy[1]) !== "." || blocked.has(k)) return err(`${ctx}: note spot ${n} at ${k} must be plain floor, off any landmark`);
    if (!shut.has(k)) err(`${ctx}: note spot ${n} at ${k} unreachable from the entrance`);
    if (used.has(k)) err(`${ctx}: note spot ${n} at ${k} shares its tile`);
    used.add(k);
  });
  // wall signs read up close: on a plain wall tile with no decor, facing reachable floor
  const signAt = new Set();
  (t.signs || []).forEach(([x, y, face], i) => {
    const k = x + "," + y;
    const c = `${ctx}: sign ${i + 1} at ${k}`;
    if (at(x, y) !== "#") err(`${c} is not on a wall tile`);
    if (taken.has(k)) err(`${c} shares its tile with decor`);
    if (signAt.has(k)) err(`${c} shares its tile with another sign`);
    signAt.add(k);
    const sides = Object.keys(SIDES).filter((sd) => shut.has(x + SIDES[sd][0] + "," + (y + SIDES[sd][1])));
    if (face ? !sides.includes(face) : !sides.length) err(`${c} faces ${face || "no side"}, not floor you can reach (open: ${sides.join(" ") || "none"})`);
  });
  // per-tile floor kinds
  if (t.floors) {
    if (t.floors.length !== H || !t.floors.every((r) => r.length === w)) err(`${ctx}: floors must be the same size as the grid`);
    else t.floors.join("").split("").forEach((ch) => { if (!t.floorKey || !FLOOR_KINDS.includes(t.floorKey[ch])) err(`${ctx}: floor char "${ch}" has no floor kind`); });
  }
});

// locations
W.LOCATIONS.filter((l) => l.id !== "base").forEach((l) => {
  if (l.template !== l.id) err(`${l.id}: template must be its own id (is ${l.template})`);
  const t = W.TEMPLATES[l.template];
  if (!t) return err(`${l.id}: no layout ${l.template} in js/layouts.js`);
  if (count(t.grid, "i") < l.items.length) err(`${l.id}: layout has ${count(t.grid, "i")} item spots, needs ${l.items.length}`);
  if (count(t.grid, "c") < l.cache.length) err(`${l.id}: layout has ${count(t.grid, "c")} cache spots, needs ${l.cache.length}`);
  l.items.concat(l.cache).forEach((it) => { if (!W.ITEMS[it]) err(`${l.id}: unknown item ${it}`); });
  const N = W.NOTES[l.id];
  if (!N) return err(`${l.id}: no notes`);
  // every note names a spot that exists in its layout, and no two notes share one
  const spotsUsed = new Set();
  N.notes.forEach((n) => {
    const spot = String(n.spot || 1);
    if (!/^[1-7]$/.test(spot)) return err(`${l.id} ${n.id}: needs a spot 1 to 7`);
    if (spot !== "1" && !(t.spots || {})[spot]) err(`${l.id} ${n.id}: layout has no note spot ${spot}`);
    if (spotsUsed.has(spot)) err(`${l.id} ${n.id}: spot ${spot} is used by another note`);
    spotsUsed.add(spot);
    if (n.after && !N.notes.some((m) => m.id === n.after)) err(`${l.id} ${n.id}: after names unknown note ${n.after}`);
    if (n.minLevel != null && !(n.minLevel >= 1 && n.minLevel <= 6)) err(`${l.id} ${n.id}: minLevel must be 1 to 6`);
    if (!Array.isArray(n.facts) || !n.facts.length) err(`${l.id} ${n.id}: facts missing`);
  });
  const noteIds = N.notes.map((n) => n.id).concat([N.door.id]);
  if (new Set(noteIds).size !== noteIds.length) err(`${l.id}: two notes share an id`);
  // stash and key
  if (!Array.isArray(l.stash) || !l.stash.length || !l.stashName) err(`${l.id}: needs stash items and a stashName`);
  else {
    if (count(t.grid, "k") < l.stash.length) err(`${l.id}: layout has ${count(t.grid, "k")} stash spots, needs ${l.stash.length}`);
    l.stash.forEach((it) => { if (!W.ITEMS[it]) err(`${l.id}: unknown stash item ${it}`); });
  }
  if (!W.KEYS[l.id]) err(`${l.id}: hides no key (KEYS)`);
  if (!N.key) err(`${l.id}: no key facts (js/story.js)`);
  else {
    if (N.key.opens !== W.KEYS[l.id]) err(`${l.id}: key.opens ${N.key.opens} does not match KEYS (${W.KEYS[l.id]})`);
    const kn = N.notes.find((n) => n.id === N.key.after);
    if (!kn) err(`${l.id}: key.after names unknown note ${N.key.after}`);
    else if (!(kn.reveals || []).includes(N.key.opens)) err(`${l.id}: the key note must reveal ${N.key.opens} (where its stash is)`);
    if (!Array.isArray(N.key.facts) || !N.key.facts.length) err(`${l.id}: key facts missing`);
  }
  if ((N.signs || []).length !== (t.signs || []).length) err(`${l.id}: ${(N.signs || []).length} signs for ${(t.signs || []).length} sign places in its layout`);
  (N.signs || []).forEach((sg) => {
    if (!sg.id || !["sign", "graffiti"].includes(sg.kind) || !Array.isArray(sg.facts) || !sg.facts.length) err(`${l.id}: sign ${sg.id} needs an id, kind sign|graffiti, and facts`);
  });
  if (!N.notes.some((n) => n.unlocks === l.id)) err(`${l.id}: no note unlocks its cache`);
  N.notes.forEach((n) => (n.reveals || []).forEach((r) => { if (!ids.has(r)) err(`${l.id}: reveals unknown ${r}`); }));
  // the notes steer by the landmarks, so text and layout cannot drift apart
  const marks = Object.values(t.landmarks || {}).map((m) => m.name.toLowerCase());
  const named = (facts) => marks.filter((m) => facts.join(" ").toLowerCase().includes(m));
  if (named(N.door.facts).length < 2) err(`${l.id}: the door note must name at least two landmarks (${marks.join(", ")}); it names ${named(N.door.facts).join(", ") || "none"}`);
  // the main note and the trail notes give a way to something here; dead ends need not
  N.notes.filter((n) => n.unlocks || n.kind === "trail").forEach((n) => { if (!named(n.facts).length) err(`${l.id}: note ${n.id} must name at least one landmark (${marks.join(", ")})`); });
  // "at least N walkers" must hold on day 1
  const m = (N.door.facts.find((f) => /walker/i.test(f) && /at least \w+/i.test(f)) || "").match(/at least (\w+)/i);
  if (!m) err(`${l.id}: the door note must give the walker count as "at least N"`);
  else {
    const n = NUMBER[m[1].toLowerCase()] || Number(m[1]);
    const day1 = W.SETTINGS.walkersPerLocation(l.danger, 1);
    if (!(n <= day1)) err(`${l.id}: the door note promises at least ${m[1]} walkers, day 1 has ${day1}`);
  }
});
// the key ring: every building hides exactly one key and every stash has exactly one key
{
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
// the home base yard: treeline, fence ring, cabin, van, spawns on every side, and one plot per room
{
  const Y = W.YARD;
  const g = Y.grid;
  const gh = g.length;
  const gw = g[0].length;
  const at = (x, y) => (x < 0 || y < 0 || x >= gw || y >= gh ? "T" : g[y][x]);
  if (!g.every((r) => r.length === gw)) err("yard: rows differ in length");
  if (!(Y.version >= 1)) err("yard: needs a version (older saves are migrated when it changes)");
  g.forEach((r, y) => [...r].forEach((ch, x) => { if (!"TFVPz.HWBJD#".includes(ch)) err(`yard: unknown "${ch}" at ${x},${y}`); }));
  for (let x = 0; x < gw; x++) if (at(x, 0) !== "T" || at(x, gh - 1) !== "T") err(`yard: the treeline is open at column ${x}`);
  for (let y = 0; y < gh; y++) if (at(0, y) !== "T" || at(gw - 1, y) !== "T") err(`yard: the treeline is open at row ${y}`);
  const find = (ch) => { const out = []; g.forEach((r, y) => [...r].forEach((c, x) => c === ch && out.push([x, y]))); return out; };
  const P = find("P");
  const B = find("B");
  const V = find("V");
  if (P.length !== 1 || B.length !== 1 || find("J").length !== 1) err("yard: needs exactly one player start P, one cabin front door B and one back door J");
  if (V.length !== 2 || V[0][1] !== V[1][1] || V[1][0] !== V[0][0] + 1) err("yard: the van is two V side by side");
  // inside the fence (from the start, not crossing F or T): the cabin and the van; no spawn
  const inside = new Set();
  if (P.length) {
    const st = [P[0]];
    inside.add(P[0].join(","));
    while (st.length) {
      const [x, y] = st.pop();
      for (const [dx, dy] of STEPS) {
        const nx = x + dx;
        const ny = y + dy;
        if ("FT".includes(at(nx, ny)) || inside.has(nx + "," + ny)) continue;
        if (nx <= 0 || ny <= 0 || nx >= gw - 1 || ny >= gh - 1) { err("yard: the fence ring is open (the inside reaches the treeline)"); st.length = 0; break; }
        inside.add(nx + "," + ny);
        st.push([nx, ny]);
      }
    }
  }
  B.concat(V).forEach(([x, y]) => { if (!inside.has(x + "," + y)) err(`yard: ${at(x, y)} at ${x},${y} is outside the fence`); });
  if (B.length && at(B[0][0], B[0][1] - 1) !== "P" && at(B[0][0], B[0][1] - 1) !== ".") err("yard: the cabin door opens onto something");
  const sides = new Set();
  find("z").forEach(([x, y]) => {
    if (inside.has(x + "," + y)) err(`yard: walker spawn ${x},${y} is inside the fence`);
    const d = { n: y, s: gh - 1 - y, w: x, e: gw - 1 - x };
    sides.add(Object.keys(d).reduce((a, k) => (d[k] < d[a] ? k : a), "n"));
  });
  if (sides.size !== 4) err(`yard: walkers spawn on ${sides.size} sides, want all four`);
  Object.entries(W.DEFENSE.waveSides || {}).forEach(([k, n]) => { if (!(n >= 1 && n <= 4)) err(`defense: waveSides.${k} must be 1..4`); });
  // plots: one per room but the Walls, 3..5 tiles a side, on open ground inside the fence, two tiles clear
  // of the fence line (room to walk and to repair it), clear of the cabin, the van and the door, not touching each other
  const plots = Y.plots || {};
  Object.keys(W.BASE_ROOMS).forEach((k) => { if (k !== "walls" && !plots[k]) err(`yard: room ${k} has no plot`); });
  const taken = new Map();
  Object.entries(plots).forEach(([k, p]) => {
    const ctx = `yard plot ${k}`;
    if (!W.BASE_ROOMS[k] || k === "walls") err(`${ctx}: no such room (the Walls are the fence)`);
    if (!"nesw".includes(p.face) || p.face.length !== 1) err(`${ctx}: face must be n, e, s or w`);
    if (!(p.w >= 3 && p.w <= 5 && p.h >= 3 && p.h <= 5)) err(`${ctx}: ${p.w}x${p.h}, want 3..5 a side`);
    for (let y = p.y - 2; y < p.y + p.h + 2; y++) {
      for (let x = p.x - 2; x < p.x + p.w + 2; x++) {
        const on = x >= p.x && y >= p.y && x < p.x + p.w && y < p.y + p.h;
        const ch = at(x, y);
        if (on && (ch !== "." || !inside.has(x + "," + y))) err(`${ctx}: ${x},${y} is "${ch}"${inside.has(x + "," + y) ? "" : " outside the fence"}`);
        if (!on && ch === "F") err(`${ctx}: closer than two tiles to the fence at ${x},${y}`);
        const near = Math.max(x < p.x ? p.x - x : x - (p.x + p.w - 1), y < p.y ? p.y - y : y - (p.y + p.h - 1)) <= 1;
        if (near && !on && "HWBJD#VP".includes(ch)) err(`${ctx}: right up against the ${ch === "V" ? "van" : ch === "P" ? "player start" : "cabin"} at ${x},${y}`);
        if (on) {
          if (taken.has(x + "," + y)) err(`${ctx}: overlaps plot ${taken.get(x + "," + y)} at ${x},${y}`);
          taken.set(x + "," + y, k);
        }
      }
    }
  });
  Object.entries(plots).forEach(([k, p]) => {
    for (let y = p.y - 1; y <= p.y + p.h; y++) for (let x = p.x - 1; x <= p.x + p.w; x++) {
      const o = taken.get(x + "," + y);
      if (o && o !== k && k < o) err(`yard plots ${k} and ${o} touch at ${x},${y}: leave a path between them`);
    }
  });
  (Y.paths || []).forEach(([x0, y0, x1, y1]) => {
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) {
      if (!inside.has(x + "," + y) || taken.has(x + "," + y)) err(`yard: the path at ${x},${y} runs ${taken.has(x + "," + y) ? "over plot " + taken.get(x + "," + y) : "outside the fence"}`);
    }
  });
}
// the cabin: its plan (WORLD.HOUSE) and how it sits in the yard; its doors and windows' levels
{
  const H = W.HOUSE;
  const g = H.grid;
  const hw = g[0].length;
  const hh = g.length;
  const at = (x, y) => (x < 0 || y < 0 || x >= hw || y >= hh ? " " : g[y][x]);
  const [ax, ay] = H.at;
  if (!g.every((r) => r.length === hw)) err("cabin: rows differ in length");
  g.forEach((r, y) => [...r].forEach((ch, x) => {
    if (!"HWBJ#D., ".includes(ch)) err(`cabin: unknown "${ch}" at ${x},${y}`);
    if (ch !== " " && W.YARD.grid[ay + y][ax + x] !== (ch === "," ? "." : ch)) err(`cabin: the yard grid does not carry it at ${x},${y}`);
  }));
  // shut: from outside, only the doors (B J) and the porch lead in
  const out = new Set();
  const st = [];
  for (let x = -1; x <= hw; x++) [-1, hh].forEach((y) => { out.add(x + "," + y); st.push([x, y]); });
  for (let y = 0; y < hh; y++) [-1, hw].forEach((x) => { out.add(x + "," + y); st.push([x, y]); });
  while (st.length) {
    const [x, y] = st.pop();
    for (const [dx, dy] of STEPS) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < -1 || ny < -1 || nx > hw || ny > hh || out.has(nx + "," + ny)) continue;
      const ch = at(nx, ny);
      if (ch === ".") err(`cabin: the outside gets in at ${nx},${ny} (no wall)`);
      if (ch !== " " && ch !== ",") continue;
      out.add(nx + "," + ny);
      st.push([nx, ny]);
    }
  }
  if (!g.some((r) => r.includes("B")) || !g.some((r) => r.includes("J"))) err("cabin: needs a front door B and a back door J");
  // rooms: on floor, not overlapping
  const roomAt = new Map();
  Object.entries(H.rooms).forEach(([k, r]) => {
    const [x0, y0, x1, y1] = r.rect;
    if (!r.name) err(`cabin room ${k}: no name`);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const ch = at(x, y);
      if (k === "porch" ? ch !== "," : ch !== ".") err(`cabin room ${k}: ${x},${y} is "${ch}"`);
      if (roomAt.has(x + "," + y)) err(`cabin rooms ${roomAt.get(x + "," + y)} and ${k} overlap at ${x},${y}`);
      roomAt.set(x + "," + y, k);
    }
  });
  // floor in no room is an archway between two rooms
  g.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch !== "." || roomAt.has(x + "," + y)) return;
    const by = new Set(STEPS.map(([dx, dy]) => roomAt.get(x + dx + "," + (y + dy))).filter(Boolean));
    if (by.size < 2) err(`cabin: floor at ${x},${y} is in no room`);
  }));
  // notes: on a wall, facing into their room; one per id
  const SIDE = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
  const ids = new Set();
  H.notes.forEach((n) => {
    if (ids.has(n.id)) err(`cabin note ${n.id}: twice`);
    ids.add(n.id);
    if (!(W.HOUSE_NOTES || {})[n.id]) err(`cabin note ${n.id}: no facts in HOUSE_NOTES`);
    if (!"HW#".includes(at(n.wall[0], n.wall[1]))) err(`cabin note ${n.id}: ${n.wall} is not a wall`);
    const [dx, dy] = SIDE[n.face] || [0, 0];
    if (roomAt.get(n.wall[0] + dx + "," + (n.wall[1] + dy)) !== n.room) err(`cabin note ${n.id}: its face does not look into the ${n.room}`);
  });
  Object.keys(W.HOUSE_NOTES || {}).forEach((k) => ids.has(k) || err(`HOUSE_NOTES ${k}: not on any wall`));
  ["computer", "pantry", "radio", "typewriter", "bed", "bell"].forEach((k) => {
    const sp = H.spots[k];
    if (!sp || at(sp[0], sp[1]) === " ") err(`cabin: the ${k} is not in the cabin`);
  });
  // in the yard: inside the fence, two tiles clear of it, clear of the plots and the van
  for (let y = -2; y < hh + 2; y++) for (let x = -2; x < hw + 2; x++) {
    const yc = W.YARD.grid[ay + y] && W.YARD.grid[ay + y][ax + x];
    if (at(x, y) !== " " && (yc === undefined || "FTz".includes(yc))) err(`cabin: ${ax + x},${ay + y} is off the yard or on the fence`);
    if (yc === "F" && Math.max(Math.abs(Math.min(Math.max(x, 0), hw - 1) - x), Math.abs(Math.min(Math.max(y, 0), hh - 1) - y)) < 2) err(`cabin: closer than two tiles to the fence at ${ax + x},${ay + y}`);
  }
  // doors and windows: strength for level 0 and each level after, rising
  Object.entries(W.HOUSE_UPGRADES || {}).forEach(([k, U]) => {
    if (U.hp.length !== U.levels.length + 1 || U.hp.some((v, i) => i && v <= U.hp[i - 1])) err(`HOUSE_UPGRADES ${k}: hp needs one rising value per level, from level 0`);
    U.levels.forEach((l, i) => Object.keys(l.needs).forEach((it) => W.ITEMS[it] || err(`HOUSE_UPGRADES ${k} level ${i + 1}: no item ${it}`)));
  });
}
// home story facts: plot signs, the journal, the radio, item tags
Object.keys(W.YARD_LOTS || {}).forEach((room) => { if (!(W.YARD.plots || {})[room]) err(`YARD_LOTS ${room}: no plot in the yard`); });
if (!W.JOURNAL || !W.JOURNAL.length || W.JOURNAL.some((e) => !e.id || !(e.facts || []).length)) err("JOURNAL: every entry needs an id and facts");
if (!W.RADIO || !W.RADIO.length || W.RADIO.some((e) => !e.id || !e.voice || !(e.facts || []).length)) err("RADIO: every entry needs an id, a voice and facts");
Object.keys(W.ITEMS).forEach((k) => { if (!Array.isArray((W.ITEM_TAGS || {})[k]) || W.ITEM_TAGS[k].length !== 2) err(`ITEM_TAGS ${k}: needs 2 tags`); });
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

if (errors.length) { errors.forEach((e) => console.log("ERROR " + e)); process.exit(1); }
console.log(`OK: world has ${W.LOCATIONS.length} locations, ${Object.keys(W.TEMPLATES).length} layouts (${Object.keys(ART).length} landmark arts, ${Object.keys(DECOR).length} decor kinds), ${Object.keys(W.ITEMS).length} items, ${Object.keys(W.BASE_ROOMS).length} rooms.`);
