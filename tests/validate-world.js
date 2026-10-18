#!/usr/bin/env node
/* Sanity checks for js/world.js, js/layouts.js and the story facts (js/story.js, js/story-home.js and every other
   js/story*.js the page loads):
   interior layouts (legend v2, landmarks, decor, reachability), the stash and key in every building,
   note spots and wall signs, notes that name the landmarks, the key ring, and reveal chains; and the crew
   at home base (js/story-crew.js: roster, rules, talk, tips, reports, errands) and their story quests
   (js/story-quests.js: spots, landmarks, gating, rewards, perks, the dog). Contract: docs/CREW.md. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const sb = {};
sb.globalThis = sb;
vm.createContext(sb);
// The fact files, in page order: js/layouts.js (ZSR.LAYOUTS, the interiors world.js uses as its TEMPLATES),
// js/world.js and every js/story*.js that index.html loads, so a fact file split off as the game grows
// (story-quests2.js) is checked like the rest. tests/validate-text.js, validate-art.js and validate-engine.js read the
// same list.
const PAGE = [...fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8").matchAll(/<script src="js\/([^"]+)"><\/script>/g)].map((m) => m[1]);
const FACT_FILES = PAGE.filter((f) => /^(layouts|world|story[\w-]*)\.js$/.test(f));
{
  const page = [];
  const at = (f) => FACT_FILES.indexOf(f);
  if (at("layouts.js") < 0 || at("world.js") < 0) page.push("index.html must load js/layouts.js and js/world.js");
  else if (at("layouts.js") > at("world.js")) page.push("index.html loads js/world.js before js/layouts.js (world.js takes its interiors from it)");
  FACT_FILES.filter((f) => f.startsWith("story") && at(f) < at("world.js")).forEach((f) => page.push(`index.html loads js/${f} before js/world.js (it adds to ZSR.WORLD)`));
  // a story file the page never loads is facts the game never reads (and no validator would check)
  fs.readdirSync(path.join(__dirname, "..", "js")).filter((f) => /^story[\w-]*\.js$/.test(f) && !PAGE.includes(f)).forEach((f) => page.push(`js/${f} is not loaded by index.html: add <script src="js/${f}"></script> after js/world.js, or the game never reads its facts`));
  if (page.length) {
    page.forEach((m) => console.log("ERROR " + m));
    process.exit(1);
  }
}
FACT_FILES.forEach((f) => vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js", f), "utf8"), sb, { filename: f }));
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
  const minSteps = W.SETTINGS.walkerSpawn.minSteps;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < w; x++) {
      const c = g[y][x];
      const k = x + "," + y;
      if ("inyz$".includes(c) && !shut.has(k)) err(`${ctx}: ${c} at ${k} unreachable from the entrance`);
      if (c === "k" && STEPS.some(([dx, dy]) => shut.has(x + dx + "," + (y + dy)))) err(`${ctx}: stash spot at ${k} reachable without the stash door`);
      if (c === "k" && !stashOpen.has(k)) err(`${ctx}: stash spot at ${k} unreachable even with the stash door open`);
      if (c === "c" && STEPS.some(([dx, dy]) => shut.has(x + dx + "," + (y + dy)))) err(`${ctx}: cache spot at ${k} reachable without the locked door`);
      if (c === "c" && !open.has(k)) err(`${ctx}: cache spot at ${k} unreachable even with the door open`);
      // walkers start at least walkerSpawn.minSteps from the player's start tile (one step in from E), and so do the
      // walker anchors a note's rule names (a z tile no rule names is simply unused: the walker rules below, R1-R8)
      if (c === "z" && shut.has(k) && shut.get(k) - 1 < minSteps) err(`${ctx}: walker anchor at ${k} is only ${shut.get(k) - 1} steps from the entrance (need ${minSteps}+)`);
    }
  }
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

// River Landing and any other outdoor place: no building, no notes; reached by road, found by a pole's tag
W.LOCATIONS.filter((l) => l.outdoor).forEach((l) => {
  if (W.TEMPLATES[l.id]) err(`${l.id}: an outdoor place has no building layout`);
  if ((l.items || []).length || (l.cache || []).length) err(`${l.id}: an outdoor place has no shelves or cache`);
  if (W.KEYS[l.id] || Object.values(W.KEYS).includes(l.id)) err(`${l.id}: an outdoor place is not on the key ring`);
});
{
  const R = W.RIVER;
  if (!R || !(R.cap > 0) || !(R.restockDays > 0) || !(R.bite[0] > 0 && R.bite[1] > R.bite[0]) || !(R.hook > 0)) err("RIVER: needs cap, restockDays, bite [min, max] and hook");
  const lay = R && W.TEMPLATES[R.rod.at];
  if (!lay || !Array.isArray(lay.rod)) err(`RIVER.rod: layout ${R && R.rod.at} has no rod spot`);
  else {
    // the pole lies in the locked cache room: on floor, reached only through the L door
    const g = lay.grid;
    const [rx, ry] = lay.rod;
    if (!g[ry] || ".".indexOf(g[ry][rx]) < 0) err(`RIVER.rod: spot ${rx},${ry} is not plain floor`);
    const walk = (blockL) => {
      const ex = g[g.length - 1].indexOf("E");
      const seen = new Set([ex + "," + (g.length - 1)]);
      const q = [[ex, g.length - 1]];
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of STEPS) {
          const nx = x + dx;
          const ny = y + dy;
          const ch = g[ny] && g[ny][nx];
          if (!ch || seen.has(nx + "," + ny) || "#WSXGCKRQ".includes(ch) || (blockL && ch === "L")) continue;
          seen.add(nx + "," + ny);
          q.push([nx, ny]);
        }
      }
      return seen.has(rx + "," + ry);
    };
    if (walk(true)) err("RIVER.rod: the pole must sit behind the locked cache door (the equipment bay)");
    if (!walk(false)) err("RIVER.rod: the pole cannot be reached even with the cache door open");
  }
  (R.rod.reveals || []).forEach((id) => { if (!ids.has(id)) err(`RIVER.rod reveals unknown ${id}`); });
}
/* Walker rules (NOTES[id].walkers; zones in the layout's walkerZones; js/building.js planWalkers places them): what the
   door notes, notes and graffiti say about where walkers stand stays true on every visit, every day.
   R1 ids: `says` names this building's door note, notes and signs. R2 coverage: any door fact about walkers, or a
   red-R graffiti, that puts walkers somewhere ("in the", "by the", ...) is in some rule's `says`. R3 zones: known, inside
   the grid, with floor a walker can start on; no zone left unused. R4 anchors: a real z tile, inside its zone, by
   the landmark its rule names; a rule that names a landmark rings the landmark's footprint (its walkers start
   within r steps of it, so within that many tiles every way: "one by the robot" means by the robot). R5 kinds: known; `only` needs a `type`. R6 room: a rule's tiles hold its walkers
   spaced out (one tile spare for a gun), and so do the tiles left for the others. R7 totals: the rules never want
   more walkers than the building has. R8: an exact zone overlaps no other rule's zone; a text that says "most" of
   them are there has a share above half.
   Checked for every count a building has from day 1 to RULE_DAYS. The geometry is the engine's: floor is the
   markers and plain floor (solid landmarks' footprints blocked), a rule's ring walks with every door shut, a
   walker starts walkerSpawn.minSteps or more from the start tile with the doors opened, off every busy tile. */
const RULE_DAYS = 120; // SCALE: the last day whose walker count is checked (walkersPerLocation stops growing on day 36)
const RULE_FIELDS = ["says", "z", "r", "zone", "n", "share", "exact", "type", "only", "all", "near"];
const RULE_POS = /\b(in|by|at|along|near|to) the\b/i; // a fact that puts walkers somewhere
const RULE_BY = 2; // "one by the robot": an exact rule with `near` keeps every other walker this many steps or more from it
const RULE_WALKERS = /\b(walkers?|big ones?|crowds?|stands?|gathers?|wanders?|waits?|sleeps?|lurks?)\b/i; // a door fact about walkers
function checkWalkerRules(l, t, N) {
  const ctx = `${l.id} walkers`;
  const WS = W.SETTINGS.walkerSpawn;
  const WT = W.WALKER_TYPES || {};
  const rules = N.walkers || [];
  if (!Array.isArray(rules)) return err(`${ctx}: NOTES.${l.id}.walkers must be a list of rules`);
  const zones = t.walkerZones || {};
  const g = t.grid;
  const H = g.length;
  const w = g[0].length;
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= H ? "#" : g[y][x]);
  const key = (x, y) => x + "," + y;
  const inRects = (R, x, y) => R.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
  // the engine's floor and the landmarks' footprints
  const foot = new Set();
  const marks = {};
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < w; x++) {
      const def = "1234".includes(g[y][x]) && (t.landmarks || {})[g[y][x]];
      if (!def) continue;
      const [fw, fh] = def.foot || [1, 1];
      marks[def.name] = [x - (fw >> 1), y - (fh >> 1), x + (fw >> 1), y + (fh >> 1)];
      if (def.solid) for (let yy = y - (fh >> 1); yy <= y + (fh >> 1); yy++) for (let xx = x - (fw >> 1); xx <= x + (fw >> 1); xx++) foot.add(key(xx, yy));
    }
  }
  const floor = (x, y) => ".inyz$ck1234".includes(at(x, y)) && !foot.has(key(x, y));
  /** Steps from (sx, sy) over floor (and through the doors you can open when `doors`), up to `max`. */
  const walk = (sx, sy, doors, max, ex, ey) => {
    // (with ex, ey: from every tile of the rect (sx, sy)-(ex, ey) at once, a landmark's footprint)
    const d = new Map();
    const q = [];
    for (let y = sy; y <= (ey == null ? sy : ey); y++) for (let x = sx; x <= (ex == null ? sx : ex); x++) {
      d.set(key(x, y), 0);
      q.push([x, y]);
    }
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i];
      const dd = d.get(key(x, y));
      if (dd >= max) continue;
      STEPS.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (d.has(key(nx, ny)) || !(floor(nx, ny) || (doors && at(nx, ny) === "D"))) return;
        d.set(key(nx, ny), dd + 1);
        q.push([nx, ny]);
      });
    }
    return d;
  };
  const ex = g[H - 1].indexOf("E");
  const reach = walk(ex, H - 2, true, Infinity); // from the start tile, one step in
  // busy: every marker spot (taken or not), every note spot, the story quests' spots, the fishing pole
  const busy = new Set();
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) if ("ickny$1234".includes(g[y][x])) busy.add(key(x, y));
  Object.values(t.spots || {}).forEach(([x, y]) => busy.add(key(x, y)));
  (W.QUESTS || []).forEach((q) => q && q.at === l.id && Array.isArray(q.spot) && busy.add(key(q.spot[0], q.spot[1])));
  if (W.RIVER && W.RIVER.rod.at === l.id && Array.isArray(t.rod)) busy.add(key(t.rod[0], t.rod[1]));
  const pool = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) if (floor(x, y) && (reach.get(key(x, y)) || 0) >= WS.minSteps && !busy.has(key(x, y))) pool.push([x, y]);
  const inPool = new Set(pool.map(([x, y]) => key(x, y)));
  const anchors = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) if (g[y][x] === "z") anchors.push([x, y]);
  /** How many walkers a greedy pass fits on `tiles` at least `gap` apart (a lower bound on the room there). */
  const fits = (tiles, gap) => {
    const got = [];
    tiles.forEach(([x, y]) => got.every(([a, b]) => (a - x) * (a - x) + (b - y) * (b - y) >= gap * gap) && got.push([x, y]));
    return got.length;
  };
  // every count this building has (day 1 to RULE_DAYS)
  const counts = [...new Set(Array.from({ length: RULE_DAYS }, (_, i) => W.SETTINGS.walkersPerLocation(l.danger, i + 1)))];
  const want = (r, n) => (r.all ? 0 : Math.max(r.n || 0, r.share ? Math.ceil(r.share * n) : 0));

  // R3 zones: rects of whole numbers inside the grid; each with floor a walker can start on; each named by a rule
  Object.entries(zones).forEach(([name, R]) => {
    if (!Array.isArray(R) || !R.length || R.some((r) => !Array.isArray(r) || r.length !== 4 || r.some((v) => !Number.isInteger(v)))) return err(`${ctx}: walkerZones.${name} must be a list of [x0, y0, x1, y1] rects`);
    R.forEach(([x0, y0, x1, y1]) => { if (!(x0 >= 0 && y0 >= 0 && x1 < w && y1 < H && x0 <= x1 && y0 <= y1)) err(`${ctx}: walkerZones.${name} rect ${[x0, y0, x1, y1]} is not inside the ${w} x ${H} grid`); });
    if (!pool.some(([x, y]) => inRects(R, x, y))) err(`${ctx}: walkerZones.${name} has no floor a walker can start on (${WS.minSteps}+ steps in, off the busy tiles)`);
    if (!rules.some((r) => r.zone === name)) err(`${ctx}: walkerZones.${name} is named by no rule`);
  });
  const said = new Set();
  const closed = new Set(); // tiles no other walker starts on
  let allZone = null;
  const areas = rules.map((r, i) => {
    const c = `${ctx} rule ${i + 1}`;
    Object.keys(r).forEach((f) => { if (!RULE_FIELDS.includes(f)) err(`${c}: unknown field "${f}" (${RULE_FIELDS.join(", ")})`); });
    // R1 ids
    if (!Array.isArray(r.says) || !r.says.length) err(`${c}: says must name the notes it keeps true`);
    (r.says || []).forEach((id) => {
      said.add(id);
      if (id !== N.door.id && !N.notes.some((n) => n.id === id) && !(N.signs || []).some((s) => s.id === id)) err(`${c}: says ${id}, which is not this building's door note, a note or a sign`);
    });
    // R3, R5: the shape of a rule
    const Z = r.zone != null ? zones[r.zone] : null;
    if (r.zone != null && !Array.isArray(Z)) err(`${c}: zone "${r.zone}" is not in the layout's walkerZones`);
    if (r.all) {
      if (!Z) err(`${c}: an all rule needs a zone`);
      if (["z", "r", "n", "share", "exact", "type", "only", "near"].some((f) => r[f] != null)) err(`${c}: an all rule only names its zone (every walker starts in it)`);
      if (allZone) err(`${c}: a second all rule`);
      allZone = Z || [];
      return [];
    }
    if (r.z == null && !Z) err(`${c}: needs anchors (z) or a zone`);
    if (!(Number.isInteger(r.n) && r.n >= 1)) err(`${c}: n must be a whole number, 1 or more`);
    if (r.share != null && !(r.share > 0 && r.share <= 1)) err(`${c}: share must be above 0, at most 1`);
    if (r.r != null && !(Number.isInteger(r.r) && r.r >= 1)) err(`${c}: r must be a whole number of steps, 1 or more`);
    if (r.type != null && !WT[r.type]) err(`${c}: type "${r.type}" is not a walker kind`);
    if (r.only && !r.type) err(`${c}: only needs a type`);
    if (r.only && r.type === Object.keys(WT)[0]) err(`${c}: only cannot hold back ${r.type}, the kind every mix falls back to`);
    // R4 anchors: real z tiles, inside the zone, by the landmark the rule names
    const own = (tiles) => tiles.filter(([x, y]) => (!Z || inRects(Z, x, y)) && inPool.has(key(x, y)));
    let rings = [];
    if (r.z != null) {
      if (!Array.isArray(r.z) || !r.z.length || r.z.some((zi) => !Number.isInteger(zi) || zi < 0 || zi >= anchors.length)) {
        err(`${c}: z ${JSON.stringify(r.z)} must list z tiles by index, 0 to ${anchors.length - 1} (reading order)`);
        return [];
      }
      rings = r.z.map((zi) => {
        const [ax, ay] = anchors[zi];
        if (Z && !inRects(Z, ax, ay)) err(`${c}: anchor z${zi} at ${ax},${ay} is outside zone ${r.zone} (did a z tile move?)`);
        if (r.near != null) {
          const m = marks[r.near];
          if (!m) err(`${c}: near "${r.near}" is not a landmark of this layout`);
          else {
            const d = Math.max(m[0] - ax, ax - m[2], 0, m[1] - ay, ay - m[3]);
            if (d > WS.near) err(`${c}: anchor z${zi} at ${ax},${ay} is ${d} tiles from ${r.near} (walkerSpawn.near is ${WS.near}; did a z tile move?)`);
          }
        }
        return own([...walk(ax, ay, false, r.r || WS.ring).keys()].map((k) => k.split(",").map(Number)));
      });
      // a rule that names a landmark: one ring round the landmark's footprint (js/building.js planWalkers), every
      // tile of it within r tiles of the footprint every way
      const m = r.near != null && marks[r.near];
      if (m) {
        const ringTiles = own([...walk(m[0], m[1], false, r.r || WS.ring, m[2], m[3]).keys()].map((k) => k.split(",").map(Number)));
        ringTiles.forEach(([x, y]) => {
          const d = Math.max(m[0] - x, x - m[2], 0, m[1] - y, y - m[3]);
          if (d > (r.r || WS.ring)) err(`${c}: ${x},${y} in its ring is ${d} tiles from ${r.near}`);
        });
        if (!ringTiles.length) err(`${c}: no floor a walker can start on within ${r.r || WS.ring} steps of ${r.near}${Z ? " in " + r.zone : ""}`);
        rings = [ringTiles];
      }
    } else if (r.near != null) err(`${c}: near needs anchors (z)`);
    const area = rings.length ? [].concat(...rings) : own(pool);
    const shut = r.exact && Z ? own(pool) : area;
    shut.concat(area).forEach(([x, y]) => closed.add(key(x, y)));
    // R8 "one by the robot": an exact rule closes the floor round its landmark too (within RULE_BY steps, doors shut)
    if (r.exact && r.near != null && marks[r.near]) {
      const [x0, y0, x1, y1] = marks[r.near];
      const mine = new Set(shut.map(([x, y]) => key(x, y)));
      const by = new Set();
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) walk(x, y, false, RULE_BY).forEach((_, k) => by.add(k));
      const open = [...by].filter((k) => inPool.has(k) && !mine.has(k));
      if (open.length) err(`${c}: exact, but other walkers can start ${RULE_BY} or fewer steps from ${r.near} (${open.slice(0, 4).join(" ")}): give the rule a zone that covers them`);
    }
    // R6 room: every count it may need, with a tile to spare for a gun (each anchor its share)
    const most = Math.max(...counts.map((n) => want(r, n)));
    if (rings.length) rings.forEach((ring, k) => {
      const need = Math.ceil(most / rings.length) + 1;
      if (fits(ring, WS.groupGap) < need) err(`${c}: ${r.near != null && marks[r.near] ? r.near : "anchor z" + r.z[k]} has room for ${fits(ring, WS.groupGap)} walkers ${WS.groupGap} apart within ${r.r || WS.ring} steps${Z ? " in " + r.zone : ""}, needs ${need}`);
    });
    else if (fits(area, WS.groupGap) < most + 1) err(`${c}: zone ${r.zone} has room for ${fits(area, WS.groupGap)} walkers ${WS.groupGap} apart, needs ${most + 1}`);
    return Z ? own(pool) : area;
  });
  // R2 coverage: each door fact about walkers, and each red-R graffiti, that puts walkers somewhere is kept by a rule
  const doorFacts = N.door.facts.filter((f) => RULE_WALKERS.test(f));
  doorFacts.forEach((f) => { if (RULE_POS.test(f) && !said.has(N.door.id)) err(`${ctx}: the door note says where walkers are ("${f}"), but no rule says ${N.door.id}`); });
  (N.signs || []).forEach((s) => {
    if (s.kind === "graffiti" && /red R/.test(s.facts[0]) && s.facts.slice(1).some((f) => RULE_POS.test(f)) && !said.has(s.id)) err(`${ctx}: graffiti ${s.id} says where walkers are, but no rule says it`);
  });
  // R6 room for the rest, R7 totals, R8 "most"
  const rest = pool.filter(([x, y]) => !closed.has(key(x, y)) && (!allZone || inRects(allZone, x, y)));
  counts.forEach((n) => {
    const ruled = rules.reduce((a, r) => a + want(r, n), 0);
    if (ruled > n) err(`${ctx}: the rules want ${ruled} walkers on a day with only ${n}`);
    if (fits(rest, WS.groupGap) < n - ruled + 1) err(`${ctx}: the other ${n - ruled} walkers have room for ${fits(rest, WS.groupGap)} ${WS.groupGap} apart${allZone ? " in the all zone" : ""}, need ${n - ruled + 1}`);
    rules.forEach((r, i) => { if (r.share > 0.5 && !(want(r, n) * 2 > n)) err(`${ctx} rule ${i + 1}: share ${r.share} is not "most" of ${n} walkers`); });
  });
  // R8 "most": a text the rule keeps that says most of the walkers are there needs a share above half
  rules.forEach((r, i) => {
    const facts = (r.says || []).flatMap((id) => (id === N.door.id ? doorFacts : (N.notes.concat(N.signs || []).find((x) => x.id === id) || { facts: [] }).facts));
    const most = facts.find((f) => /\bmost (of|near|by|at|in)\b/i.test(f));
    if (most && !(r.share > 0.5)) err(`${ctx} rule ${i + 1}: keeps "${most}", so its share must be above 0.5 (most of them)`);
  });
  // R8 overlap: an exact zone holds no other rule's tiles; with an all rule, every rule's tiles are in its zone
  rules.forEach((r, i) => {
    if (allZone && areas[i].some(([x, y]) => !inRects(allZone, x, y))) err(`${ctx} rule ${i + 1}: starts walkers outside the all rule's zone`);
    if (!r.exact) return;
    const mine = new Set(areas[i].map(([x, y]) => key(x, y)));
    rules.forEach((o, j) => { if (j !== i && areas[j].some(([x, y]) => mine.has(key(x, y)))) err(`${ctx} rule ${i + 1}: its exact zone overlaps rule ${j + 1}'s`); });
  });
}

// buildings
W.LOCATIONS.filter((l) => l.id !== "base" && !l.outdoor).forEach((l) => {
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
  // the lock (WORLD.LOCKS): a known kind, answers to roll, a cost the main note warns of, a panel on a wall
  const LK = (W.LOCKS || {})[l.id];
  if (!LK) err(`${l.id}: no lock in WORLD.LOCKS`);
  else {
    const FAILS = ["alarm", "trap", "jam"];
    const d = LK.door || {};
    if (!["code", "moves", "found"].includes(d.kind)) err(`${l.id}: lock door kind ${d.kind} (code, moves or found)`);
    if (d.kind === "code" && !/^[#-]+$/.test(d.pattern || "")) err(`${l.id}: a code lock needs a pattern of # and -`);
    if (d.kind === "moves" && (!Array.isArray(d.variants) || d.variants.length < 2 || d.variants.some((v) => v.some((m) => !d.words.includes(m))))) err(`${l.id}: moves need 2+ variants made of its words`);
    if (d.kind === "moves" && d.variants.some((v) => !d.variants.some((o) => o.every((m, i) => m !== v[i])))) err(`${l.id}: every moves variant needs a decoy that differs at every step`);
    if (d.kind !== "found" && !FAILS.includes(d.fail)) err(`${l.id}: lock door fail ${d.fail}`);
    if (d.kind === "found" && !LK.search) err(`${l.id}: a "found" door needs a search that finds its key`);
    if (LK.search && (!Array.isArray(LK.search.options) || LK.search.options.length < 2 || !FAILS.includes(LK.search.fail) || !LK.search.find)) err(`${l.id}: the search needs 2+ options, a fail and a find`);
    if (LK.panel) {
      const [px, py, face] = LK.panel.at || [];
      const S2 = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[face];
      if (!S2 || !t.grid[py] || !"#W".includes(t.grid[py][px])) err(`${l.id}: the alarm panel must be on a wall tile with a face`);
      else if (!t.grid[py + S2[1]] || t.grid[py + S2[1]][px + S2[0]] !== ".") err(`${l.id}: the alarm panel faces no floor`);
      if (!Array.isArray(LK.panel.options) || LK.panel.options.length < 2) err(`${l.id}: the alarm panel needs 2+ buttons`);
    }
    if (!["jam", "break", "none"].includes(LK.stashFail)) err(`${l.id}: stashFail ${LK.stashFail} (jam, break or none)`);
    const main = N.notes.find((n) => n.unlocks === l.id);
    if (main && d.kind === "code" && !main.facts.join(" ").includes("{code}")) err(`${l.id}: the main note's facts must give {code}`);
    if (main && d.kind === "moves" && !/\{moves?\d?\}/.test(main.facts.join(" "))) err(`${l.id}: the main note's facts must give the moves`);
    if (main && LK.search && !main.facts.join(" ").includes("{pick}")) err(`${l.id}: the main note's facts must give {pick}`);
    if (main && LK.panel && !main.facts.join(" ").includes("{button}")) err(`${l.id}: the main note's facts must give {button}`);
    if (!N.notes.some((n) => n.kind === "decoy" && (n.minLevel || 1) === 1 && /\{decoy\w+\}/.test(n.facts.join(" ")))) err(`${l.id}: needs a lock decoy at every reading level ({decoy...} in its facts, minLevel 1)`);
  }
  // a stash key never says what it opens: only the note that leads to it does
  if (N.key) {
    const tgt = W.LOCATIONS.find((x) => x.id === N.key.opens);
    if (tgt && N.key.facts.join(" ").toLowerCase().includes(tgt.stashName.replace(/^the /, "").toLowerCase())) err(`${l.id}: the key's facts name the stash it opens (${tgt.stashName})`);
  }
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
  // where the texts put walkers stays true on every visit (NOTES[id].walkers, js/building.js planWalkers)
  checkWalkerRules(l, t, N);
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
  // the fishing pole's tag reveals River Landing once you can get to the pole's building
  if (known.has(W.RIVER.rod.at)) W.RIVER.rod.reveals.forEach((r) => { if (!known.has(r)) { known.add(r); grew = true; } });
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
const nodeIds = new Set([...ids].concat((W.JUNCTIONS || []).map((j) => j.id)));
W.ROADS.forEach(([a, b]) => { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); if (!nodeIds.has(a) || !nodeIds.has(b)) err(`road ${a}-${b} names an unknown location or junction`); });
const reach = new Set(["base"]);
const st = ["base"];
while (st.length) { const a = st.pop(); (adj[a] || []).forEach((b) => { if (!reach.has(b)) { reach.add(b); st.push(b); } }); }
W.LOCATIONS.forEach((l) => { if (!reach.has(l.id)) err(`${l.id}: no road reaches it`); });

/* ---------- The crew at home base (js/story-crew.js) and their story quests (js/story-quests.js) ----------
   docs/CREW.md is the contract. Every count comes from the data; the lists below are the contract's own
   (engine keys, art kinds, each tip's placeholders), and the tip ids the engine gives are read from js/crewstate.js.
   Every check runs for every CREW id. While js/story-crew.js is still empty (no CREW), its checks pass and the
   quests are checked on their own. */
{
  const CREW = W.CREW || {};
  const crewIds = Object.keys(CREW);
  const crewOn = crewIds.length > 0;
  const R = W.CREW_RULES || {};
  const starsMax = Array.isArray(R.stars) ? R.stars.length : null;
  const QUESTS = Array.isArray(W.QUESTS) ? W.QUESTS : [];
  const DOG = W.DOG || {};
  const POSES = ["stand", "sit", "work", "read"];
  const JOBS = ["fence", "builds", "cabin", "heal", "lookout"];
  const PRONOUNS = ["she", "he", "they"];
  const WHEN_KEYS = ["day", "stars", "quest", "note", "room", "level", "dog"];
  // CREW_TIPS: every tip id the engine gives (js/crewstate.js), with the placeholders its facts carry. One table for
  // every crew member; the same as CREW_TIP_VARS in tests/validate-text.js and TIP_VARS in tests/validate-crew.js
  const TIP_VARS = { hungry: [], food: ["food", "days"], ready: ["room"], build: ["room", "needs"], heal: ["hp"], van: ["hp", "max", "cost"], vanFree: ["hp", "max"], fence: ["holes", "cracks"], cabin: ["broken"], crowbar: [], fine: [], wave: ["size", "sides"], keys: ["keys"], walkers: ["days"], radio: [], full: [], lanky: [], armored: [], wrecked: ["rooms", "cost"], screamer: [], wreckers: [] };
  // tips the engine gives only with a job (js/crewstate.js TIP_RULES): June's patch-up happens only as her heal tip
  // is told (js/crew.js crewOpen), and the lookout's wave call reads the wave tip (js/crew.js crewLookout)
  const TIP_JOB = { heal: "heal", wave: "lookout" };
  // docs/CREW.md's tips table: the tips each crew member it names has (a crew member added later needs only the
  // tips of the jobs they hold, and at least one tip)
  const CONTRACT_TIPS = {
    june: ["hungry", "food", "ready", "build", "heal"],
    tomas: ["van", "vanFree", "fence", "cabin", "crowbar", "fine", "lanky", "armored", "wrecked"],
    pip: ["wave", "keys", "walkers", "radio", "full", "screamer", "wreckers"],
  };
  // the tip ids js/crewstate.js gives: a rule in TIP_RULES and a place in URGENT, REGULAR or FALLBACK (read from its
  // source, as PEOPLE is read from tests/validate-text.js below); null when the source cannot be read
  const ENGINE_TIPS = (() => {
    let src = "";
    try {
      src = fs.readFileSync(path.join(__dirname, "..", "js", "crewstate.js"), "utf8");
    } catch (e) {
      return null;
    }
    const lists = {};
    ["URGENT", "REGULAR", "FALLBACK"].forEach((k) => {
      const m = src.match(new RegExp("const " + k + " = (\\[[^\\]]*\\]);"));
      try {
        lists[k] = m ? JSON.parse(m[1]) : null;
      } catch (e) {
        lists[k] = null;
      }
    });
    const block = (src.match(/const TIP_RULES = \{([\s\S]*?)\n {2}\};/) || [])[1];
    if (!block || Object.values(lists).some((l) => !Array.isArray(l))) return null;
    const rules = new Set([...block.matchAll(/^ {4}(\w+):/gm)].map((m) => m[1]));
    const listed = [].concat(...Object.values(lists));
    listed.filter((t) => !rules.has(t)).forEach((t) => err(`js/crewstate.js: tip ${t} is listed (URGENT, REGULAR or FALLBACK) but has no rule in TIP_RULES`));
    [...rules].filter((t) => !listed.includes(t)).forEach((t) => err(`js/crewstate.js: TIP_RULES.${t} is in none of URGENT, REGULAR or FALLBACK, so the engine never gives it`));
    return listed.filter((t) => rules.has(t));
  })();
  if (!ENGINE_TIPS) err("crew: could not read the tip ids from js/crewstate.js (TIP_RULES and the URGENT, REGULAR and FALLBACK lists)");
  else {
    ENGINE_TIPS.filter((t) => !TIP_VARS[t]).forEach((t) => err(`crew: js/crewstate.js gives tip ${t}, but TIP_VARS here does not say which placeholders it fills (add it here, in CREW_TIP_VARS in tests/validate-text.js and in TIP_VARS in tests/validate-crew.js)`));
    Object.keys(TIP_VARS).filter((t) => !ENGINE_TIPS.includes(t)).forEach((t) => err(`crew: TIP_VARS has tip ${t}, which js/crewstate.js does not give (a rule in TIP_RULES and a place in URGENT, REGULAR or FALLBACK)`));
  }
  // what a crew member says they did since you last talked (js/crewstate.js crewReportItems), with its placeholders
  const REPORTS = { fence: ["fixed", "scrap"], fenceFree: ["fixed"], cabin: ["fixed", "scrap"], cabinFree: ["fixed"], builds: ["fixed", "scrap"], buildsFree: ["fixed"], hurt: ["who", "cost"], late: ["item"] };
  // the repair jobs whose reports name their fixer: CREW_REPORTS[job] and CREW_REPORTS[job + "Free"]
  const FIX_JOBS = ["fence", "cabin", "builds"];
  // the words' validator holds the same two tables (CREW_TIP_VARS, CREW_REPORT_VARS): they must agree
  {
    let src = "";
    try {
      src = fs.readFileSync(path.join(__dirname, "validate-text.js"), "utf8");
    } catch (e) {
      src = "";
    }
    const canon = (v) => JSON.stringify((v || []).slice().sort());
    [["CREW_TIP_VARS", TIP_VARS, "TIP_VARS"], ["CREW_REPORT_VARS", REPORTS, "REPORTS"]].forEach(([name, mine, here]) => {
      const m = src.match(new RegExp("const " + name + " = ([^;\\n]+);"));
      let theirs = null;
      try {
        theirs = m ? vm.runInNewContext("(" + m[1] + ")") : null;
      } catch (e) {
        theirs = null;
      }
      if (!theirs) return err(`crew: could not read ${name} from tests/validate-text.js to compare it with ${here} here`);
      const keys = [...new Set(Object.keys(mine).concat(Object.keys(theirs)))];
      const off = keys.filter((k) => !(k in mine) || !(k in theirs) || canon(mine[k]) !== canon(theirs[k]));
      if (off.length) err(`crew: ${here} here and ${name} in tests/validate-text.js differ at ${off.map((k) => `${k} (here ${k in mine ? canon(mine[k]) : "none"}, there ${k in theirs ? canon(theirs[k]) : "none"})`).join(", ")}: make them the same`);
    });
  }
  const PLACEHOLDERS = ["food", "days", "room", "needs", "hp", "max", "cost", "holes", "cracks", "broken", "keys", "size", "sides", "rooms", "fixed", "scrap", "who", "item", "count", "reward", "dog"];
  const ART_KINDS = ["bag", "photo", "box", "book", "tin", "leash", "toolbox", "radio", "jar", "letter", "seeds", "blanket", "tape", "badge", "wrench"];
  const PERKS = ["foodPerDay", "medsPerDay", "footHp", "vanHp", "scrapPerDay", "crewRepairFree", "lookoutEarly", "healAmount", "crowbarCost"];
  const REWARD_KEYS = ["scrap", "items", "kits", "crowbars", "traps", "perk"];
  const ERRAND_REWARD_KEYS = ["scrap", "kits", "crowbars"];
  const QUEST_SCRAP = [20, 80];
  const ERRAND_SCRAP = [15, 40];
  const QUEST_NEAR = 3; // tiles (Chebyshev) from the spot to the `near` landmark's footprint
  const QUESTS_PER_PLACE = 2; // SCALE: quest spots per building; more quests than 2 x buildings needs a new place or a higher cap
  const DOG_QUESTS = 1; // save.crew.dog holds one dog
  const DOG_DANGER = 3; // the dog waits somewhere a first-time visitor can manage
  const DOG_IDEAS = 3; // Pip's name ideas on the card
  const DIR_SLACK = 10; // degrees: near the edge of a compass point, the next point over is fine too
  const NOT_DOG_NAMES = ["Peanut"]; // the lost dog on the Gas-N-Go flyer
  // people the words must carry (tests/validate-text.js): the dog's names must not be one of them
  const PEOPLE = (() => {
    const m = fs.readFileSync(path.join(__dirname, "validate-text.js"), "utf8").match(/const PEOPLE = (\[[^\]]*\]);/);
    try { return m ? JSON.parse(m[1]) : null; } catch (e) { return null; }
  })();
  if (!PEOPLE) err("crew: could not read PEOPLE from tests/validate-text.js");

  const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && (hi == null || v <= hi);
  const factsOf = (v) => (Array.isArray(v) ? v : v && Array.isArray(v.facts) ? v.facts : null);
  const nameIn = (name, facts) => new RegExp("\\b" + String(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test((facts || []).join(" "));
  // the crew never tie a key to its stash, so no crew text names a stash (LOCATIONS stashName, "the" aside)
  const STASHES = W.LOCATIONS.map((l) => String(l.stashName || "").toLowerCase().replace(/^the\s+/, "")).filter(Boolean);
  const checkFacts = (ctx, v, need) => {
    const f = factsOf(v);
    if (!f || !f.length || f.some((s) => typeof s !== "string" || !s.trim())) return err(`${ctx}: needs facts, a list of short true sentences`);
    const all = f.join(" ");
    (all.match(/\{\w+\}/g) || []).forEach((p) => { if (!PLACEHOLDERS.includes(p.slice(1, -1))) err(`${ctx}: unknown placeholder ${p} (allowed: ${PLACEHOLDERS.join(" ")})`); });
    (need || []).forEach((p) => { if (!all.includes(`{${p}}`)) err(`${ctx}: facts must carry {${p}}`); });
    STASHES.forEach((st) => { if (all.toLowerCase().includes(st)) err(`${ctx}: names "${st}", a stash; the crew never tie a key to a stash or send you to one`); });
  };
  // notes every reading level shows: the door note, the main and trail notes, and dead notes with minLevel 1
  const levelOneNotes = new Set();
  Object.values(W.NOTES).forEach((N) => {
    if (N.door && N.door.id) levelOneNotes.add(N.door.id);
    (N.notes || []).forEach((n) => { if ((n.minLevel || 1) === 1) levelOneNotes.add(n.id); });
  });
  const questIds = new Set(QUESTS.map((q) => q.id));
  const checkRoomLevel = (ctx, room, level) => {
    if (room == null && level == null) return;
    if (room == null) return err(`${ctx}: level ${level} without a room`);
    const r = W.BASE_ROOMS[room];
    if (!r) return err(`${ctx}: room "${room}" is not a BASE_ROOMS key`);
    if (!isInt(level, 1, r.levels.length)) err(`${ctx}: room ${room} needs a level 1 to ${r.levels.length} (has ${level})`);
  };
  const checkWhen = (ctx, w) => {
    if (w == null) return;
    if (typeof w !== "object") return err(`${ctx}: when must be an object`);
    Object.keys(w).forEach((k) => { if (!WHEN_KEYS.includes(k)) err(`${ctx}: unknown when key "${k}" (${WHEN_KEYS.join(", ")})`); });
    if ("day" in w && !isInt(w.day, 1)) err(`${ctx}: when.day must be a day, 1 or more`);
    if ("stars" in w && !isInt(w.stars, 0, starsMax)) err(`${ctx}: when.stars ${w.stars} must be 0 to ${starsMax == null ? "the CREW_RULES.stars count" : starsMax}`);
    if ("quest" in w && !questIds.has(w.quest)) err(`${ctx}: when.quest "${w.quest}" is not a quest id`);
    if ("note" in w && !levelOneNotes.has(w.note)) err(`${ctx}: when.note "${w.note}" is not a note every reading level shows (a door note, a main or trail note, or a dead note with minLevel 1)`);
    if ("room" in w || "level" in w) checkRoomLevel(ctx, w.room, w.level);
    if ("dog" in w && w.dog !== true) err(`${ctx}: when.dog can only be true`);
  };

  // the roster
  if (crewOn) {
    const hw = W.HOUSE.grid[0].length;
    const yw = W.YARD.grid[0].length;
    const names = new Set();
    crewIds.forEach((id) => {
      const c = CREW[id];
      const ctx = `CREW ${id}`;
      if (!/^[a-z][a-zA-Z0-9]*$/.test(id)) err(`${ctx}: ids are short lowercase words (saves key on them)`);
      if (typeof c.name !== "string" || !c.name.trim()) err(`${ctx}: needs a name`);
      else if (names.has(c.name)) err(`${ctx}: another crew member is also called ${c.name}`);
      names.add(c.name);
      if (!PRONOUNS.includes(c.pronoun)) err(`${ctx}: pronoun "${c.pronoun}" (${PRONOUNS.join(", ")})`);
      if (!/^#[0-9a-f]{6}$/i.test(c.color || "")) err(`${ctx}: color must be a #rrggbb color`);
      if (!(typeof c.scale === "number" && c.scale > 0 && c.scale <= 1.5)) err(`${ctx}: scale must be a share of a walker's height, above 0 and at most 1.5`);
      if (!Array.isArray(c.jobs)) err(`${ctx}: jobs must be a list (it may be empty)`);
      else {
        const seen = new Set();
        c.jobs.forEach((j, i) => {
          if (!JOBS.includes(j.job)) err(`${ctx}: job ${i + 1} "${j.job}" (${JOBS.join(", ")})`);
          if (!isInt(j.stars, 0, starsMax)) err(`${ctx}: job ${j.job} stars ${j.stars} must be 0 to ${starsMax}`);
          if (seen.has(j.job)) err(`${ctx}: job ${j.job} twice`);
          seen.add(j.job);
        });
      }
      if (!Array.isArray(c.posts) || c.posts.length < 2) return err(`${ctx}: needs 2 or more posts to wander between`);
      const postIds = new Set();
      c.posts.forEach((p, i) => {
        const pc = `${ctx} post ${p.id || i + 1}`;
        if (!p.id || postIds.has(p.id)) err(`${pc}: needs an id of its own`);
        postIds.add(p.id);
        if (!!p.at === !!p.house) err(`${pc}: give either at (a yard tile) or house (a cabin tile)`);
        else if (p.at && !(Array.isArray(p.at) && isInt(p.at[0], 0, yw - 1) && isInt(p.at[1], 0, W.YARD.grid.length - 1))) err(`${pc}: at ${JSON.stringify(p.at)} is not a yard tile`);
        else if (p.house && !(Array.isArray(p.house) && isInt(p.house[0], 0, hw - 1) && isInt(p.house[1], 0, W.HOUSE.grid.length - 1) && W.HOUSE.grid[p.house[1]][p.house[0]] !== " ")) err(`${pc}: house ${JSON.stringify(p.house)} is not a cabin tile`);
        if (!POSES.includes(p.pose)) err(`${pc}: pose "${p.pose}" (${POSES.join(", ")})`);
        if (!(typeof p.weight === "number" && p.weight > 0)) err(`${pc}: weight must be a number above 0`);
        checkRoomLevel(pc, p.room, p.level);
      });
    });
    // the rules
    const num = (k, ok, what) => { if (!ok(R[k])) err(`CREW_RULES.${k}: ${what}`); };
    const pos = (v) => typeof v === "number" && v > 0;
    num("stars", (v) => Array.isArray(v) && v.length && v.every((n, i) => isInt(n, 1) && (!i || n > v[i - 1])), "trust points for each star, rising");
    ["gain", "loss"].forEach((k) => { if (!R[k] || typeof R[k] !== "object") err(`CREW_RULES.${k}: missing`); });
    ["talk", "errand", "quest"].forEach((k) => { if (!isInt((R.gain || {})[k], 0)) err(`CREW_RULES.gain.${k}: trust points, 0 or more`); });
    ["hurt", "late", "giveUp"].forEach((k) => { if (!isInt((R.loss || {})[k], 0)) err(`CREW_RULES.loss.${k}: trust points, 0 or more`); });
    num("shelter", (v) => !!W.HOUSE.rooms[v], "a HOUSE.rooms key");
    num("raidShelterShare", (v) => typeof v === "number" && v >= 0 && v <= 1, "a share, 0 to 1");
    ["hurtSeconds", "walkSpeed", "runSpeed", "workSeconds", "lookoutSeconds", "healAmount", "dogBarkRange"].forEach((k) => num(k, pos, "a number above 0"));
    num("hurtCost", (v) => v && isInt(v.meds, 0) && isInt(v.food, 0), "{ meds, food }");
    num("dwell", (v) => Array.isArray(v) && v.length === 2 && pos(v[0]) && v[1] >= v[0], "[min, max] seconds");
    ["requestsPerCrew", "dogFoodEvery"].forEach((k) => num(k, (v) => isInt(v, 1), "a whole number, 1 or more"));
    // talk: topics and moods, ids unique across the crew
    const talkIds = new Set();
    Object.keys(W.CREW_TALK || {}).forEach((id) => { if (!CREW[id]) err(`CREW_TALK ${id}: not a crew member`); });
    crewIds.forEach((id) => {
      const T = (W.CREW_TALK || {})[id];
      if (!T) return err(`CREW_TALK ${id}: missing`);
      [["topics", T.topics], ["moods", T.moods]].forEach(([kind, list]) => {
        if (!Array.isArray(list) || !list.length) return err(`CREW_TALK ${id}: needs ${kind}`);
        list.forEach((t, i) => {
          const ctx = `CREW_TALK ${id} ${t.id || kind + " " + (i + 1)}`;
          if (!t.id || talkIds.has(t.id) || questIds.has(t.id)) err(`${ctx}: needs an id no other topic, mood or quest has`);
          talkIds.add(t.id);
          checkWhen(ctx, t.when);
          checkFacts(ctx, t.facts);
        });
      });
    });
    // tips: for every crew member, each tip is one the engine gives and carries its placeholders; the tips of their
    // jobs, and no job tip without the job
    Object.keys(W.CREW_TIPS || {}).forEach((id) => { if (!CREW[id]) err(`CREW_TIPS ${id}: not a crew member`); });
    const tipIds = ENGINE_TIPS ? ENGINE_TIPS.filter((t) => TIP_VARS[t]) : Object.keys(TIP_VARS);
    crewIds.forEach((id) => {
      const tips = (W.CREW_TIPS || {})[id];
      if (!tips || typeof tips !== "object" || !Object.keys(tips).length) return err(`CREW_TIPS ${id}: missing (every crew member needs tips: ${tipIds.join(", ")})`);
      const jobs = (Array.isArray(CREW[id].jobs) ? CREW[id].jobs : []).map((j) => j && j.job);
      Object.keys(tips).forEach((tip) => {
        const ctx = `CREW_TIPS ${id}.${tip}`;
        if (!tipIds.includes(tip)) return err(`${ctx}: not a tip the engine gives (${tipIds.join(", ")}); a new tip needs a rule in js/crewstate.js TIP_RULES, a place in its URGENT, REGULAR or FALLBACK list, and its placeholders in TIP_VARS here`);
        checkFacts(ctx, tips[tip], TIP_VARS[tip]);
        if (TIP_JOB[tip] && !jobs.includes(TIP_JOB[tip])) err(`${ctx}: the engine gives the ${tip} tip only with the ${TIP_JOB[tip]} job, and ${CREW[id].name || id} has no ${TIP_JOB[tip]} job (CREW.${id}.jobs), so it would never be told`);
      });
      const missing = Object.keys(TIP_JOB).filter((tip) => jobs.includes(TIP_JOB[tip]) && !tips[tip]);
      missing.forEach((tip) => err(`CREW_TIPS ${id}.${tip}: missing (${CREW[id].name || id} has the ${TIP_JOB[tip]} job, and the engine tells it with this tip)`));
      (CONTRACT_TIPS[id] || []).forEach((tip) => { if (!tips[tip] && !missing.includes(tip)) err(`CREW_TIPS ${id}.${tip}: missing (docs/CREW.md's tips table)`); });
    });
    // reports
    const RP = W.CREW_REPORTS || {};
    Object.keys(RP).forEach((k) => { if (!REPORTS[k]) err(`CREW_REPORTS.${k}: not a report (${Object.keys(REPORTS).join(", ")})`); });
    Object.entries(REPORTS).forEach(([k, need]) => { if (!RP[k]) err(`CREW_REPORTS.${k}: missing`); else checkFacts(`CREW_REPORTS.${k}`, RP[k], need); });
    // the fence and cabin reports are told in the fixer's voice: their facts (and the words at every level) name him
    // and say "he" (js/crewstate.js crewReportItems fills {who} only for hurt). A repair job given to anyone else
    // needs those reports rewritten for them
    crewIds.forEach((id) => {
      const c = CREW[id];
      const jobs = (Array.isArray(c.jobs) ? c.jobs : []).map((j) => j && j.job);
      if (!c.name) return;
      FIX_JOBS.filter((job) => jobs.includes(job)).forEach((job) => {
        [job, job + "Free"].forEach((k) => {
          if (!RP[k] || nameIn(c.name, factsOf(RP[k]))) return;
          err(`CREW_REPORTS.${k}: ${c.name} has the ${job} job (CREW.${id}.jobs), but these facts do not name ${c.name}. The ${job} reports are told as their fixer's own work, by name and pronoun, at all six reading levels: when the ${job} job moves, rewrite CREW_REPORTS.${job} and ${job}Free and their words (js/content/levelN-crew.js) for the new fixer, or pass who: ZSR.crewName(id) to every report in js/crewstate.js crewReportItems and word them with {who} and no pronoun`);
        });
      });
    });
    // errands: ordinary items (never food), counts, deadlines, small rewards
    const errandIds = new Set();
    Object.keys(W.ERRANDS || {}).forEach((id) => { if (!CREW[id]) err(`ERRANDS ${id}: not a crew member`); });
    crewIds.forEach((id) => {
      const list = (W.ERRANDS || {})[id];
      if (!Array.isArray(list) || !list.length) return err(`ERRANDS ${id}: needs errands (asked when no story quest is open)`);
      list.forEach((e, i) => {
        const ctx = `ERRANDS ${id} ${e.id || i + 1}`;
        if (!e.id || errandIds.has(e.id) || questIds.has(e.id)) err(`${ctx}: needs an id no other errand or quest has`);
        errandIds.add(e.id);
        if (!W.ITEMS[e.item] || e.item === "food") err(`${ctx}: item "${e.item}" must be an ITEMS id, not food`);
        // an errand is asked only once a known place's shelves stock its item (js/crewstate.js crewItemStocked)
        else if (!W.LOCATIONS.some((l) => (l.items || []).includes(e.item))) err(`${ctx}: no place's shelves stock ${e.item} (caches and stashes never refill), so it would never be asked`);
        if (!(Array.isArray(e.count) && e.count.length === 2 && isInt(e.count[0], 1) && isInt(e.count[1], e.count[0]))) err(`${ctx}: count must be [min, max], 1 or more`);
        if (!isInt(e.days, 1)) err(`${ctx}: days must be a deadline of 1 day or more`);
        const rw = e.reward || {};
        const keys = Object.keys(rw);
        if (!keys.length || keys.some((k) => !ERRAND_REWARD_KEYS.includes(k))) err(`${ctx}: reward must be scrap, kits or crowbars`);
        if ("scrap" in rw && !isInt(rw.scrap, ERRAND_SCRAP[0], ERRAND_SCRAP[1])) err(`${ctx}: reward scrap ${rw.scrap} must be ${ERRAND_SCRAP[0]} to ${ERRAND_SCRAP[1]}`);
        ["kits", "crowbars"].forEach((k) => { if (k in rw && !isInt(rw[k], 1)) err(`${ctx}: reward ${k} must be 1 or more`); });
        checkFacts(ctx, e.facts, ["count", "item", "days", "reward"]);
        checkFacts(`${ctx} done`, e.done);
      });
    });
  }

  // the story quests: one object (or the dog) on a spot a reader can find from the brief
  const base = W.LOCATIONS.find((l) => l.type === "base");
  const DIRS = ["east", "northeast", "north", "northwest", "west", "southwest", "south", "southeast"];
  const allowedDirs = (l) => {
    // north is up on the city map (y grows southward)
    const a = (Math.atan2(base.y - l.y, l.x - base.x) * 180) / Math.PI;
    const i = ((Math.round(a / 45) % 8) + 8) % 8;
    const off = a - Math.round(a / 45) * 45;
    const out = [DIRS[i]];
    if (off > 22.5 - DIR_SLACK) out.push(DIRS[(i + 1) % 8]);
    if (off < -(22.5 - DIR_SLACK)) out.push(DIRS[(i + 7) % 8]);
    return out;
  };
  const known = new Set(W.LOCATIONS.filter((l) => l.known).map((l) => l.id));
  const early = new Set(known);
  known.forEach((id) => ((W.NOTES[id] || {}).notes || []).filter((n) => n.unlocks).forEach((n) => (n.reveals || []).forEach((r) => early.add(r))));
  const geoCache = {};
  const geo = (id) => {
    if (geoCache[id]) return geoCache[id];
    const t = W.TEMPLATES[id];
    const g = t.grid;
    const H = g.length;
    const w = g[0].length;
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= H ? "#" : g[y][x]);
    const foot = {}; // landmark name -> its tiles
    const blocked = new Set();
    Object.entries(t.landmarks || {}).forEach(([d, def]) => {
      const y = g.findIndex((r) => r.includes(d));
      if (y < 0) return;
      const x = g[y].indexOf(d);
      const [fw, fh] = def.foot || [1, 1];
      foot[def.name] = [];
      for (let yy = y - (fh >> 1); yy <= y + (fh >> 1); yy++) for (let xx = x - (fw >> 1); xx <= x + (fw >> 1); xx++) { foot[def.name].push([xx, yy]); blocked.add(xx + "," + yy); }
    });
    // walk in from the entrance with the cache door L and the stash door Q shut
    const ex = g[H - 1].indexOf("E");
    const reach = new Set([ex + "," + (H - 1)]);
    const q = [[ex, H - 1]];
    while (q.length) {
      const [x, y] = q.shift();
      STEPS.forEach(([dx, dy]) => {
        const k = x + dx + "," + (y + dy);
        if (!reach.has(k) && ".inyz$DE1234".includes(at(x + dx, y + dy)) && !blocked.has(k)) { reach.add(k); q.push([x + dx, y + dy]); }
      });
    }
    const off = new Set(Object.values(t.spots || {}).map((s) => s.join(",")).concat((t.signs || []).map((s) => s[0] + "," + s[1])));
    if (Array.isArray(t.rod)) off.add(t.rod.join(","));
    const texts = (t.decor || []).filter((d) => d.text).map((d) => d.text.toUpperCase());
    return (geoCache[id] = { at, foot, reach, off, texts });
  };
  const cheb = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
  // a reward the brief promises: "<n> ... <the item's noun>" ("1 box of nails", "2 seed packets", "1 medical kit")
  const noun = (name) => String(name || "").toLowerCase().trim().split(/\s+/).pop().replace(/s$/, "");
  const promises = (text, n, word) => new RegExp(`\\b${n} (?:[a-z-]+ ){0,3}${word}`, "i").test(text);
  // the dog is the one June's ledger hears barking past the trees, and the ledger never has it home: it comes
  // no earlier than the last JOURNAL page that mentions a dog (a page on a later day may not assume it is home)
  const dogPage = (Array.isArray(W.JOURNAL) ? W.JOURNAL : []).reduce((last, e, i) => (/\bdogs?\b/i.test((factsOf(e) || []).join(" ")) ? i + 1 : last), 0);
  // ...but the ledger repeats its last pages (js/state.js cycleLoop: the last third), and once the dog is home the
  // repeat skips the pages that wish for one (dogWish: true). Every repeating page that mentions a dog says whether
  // it would read wrong with the dog at home (dogWish true or false), and at least one repeating page wishes for none
  {
    const J = Array.isArray(W.JOURNAL) ? W.JOURNAL : [];
    const loop = Math.max(1, Math.min(J.length, Math.floor(J.length / 3)));
    J.forEach((e, i) => {
      const dog = /\bdogs?\b/i.test((factsOf(e) || []).join(" "));
      if ("dogWish" in e && typeof e.dogWish !== "boolean") err(`JOURNAL ${e.id}: dogWish must be true or false`);
      if (e.dogWish && !dog) err(`JOURNAL ${e.id}: dogWish, but the page never mentions a dog`);
      if (i >= J.length - loop && dog && typeof e.dogWish !== "boolean") err(`JOURNAL ${e.id}: a repeating page that mentions a dog must say dogWish: true (it wishes for a dog, so it is skipped once the dog is home) or false`);
    });
    if (J.length && J.slice(J.length - loop).every((e) => e.dogWish)) err("JOURNAL: every repeating page wishes for a dog; once the dog is home the ledger has nothing left to repeat");
  }
  const ids2 = new Set();
  const perPlace = {};
  // a giver's quests in order, one list per track: the base quests, and each crossover universe's own track
  // (docs/UNIVERSES.md: `universe` on a quest), which runs beside the base one with its own order and gates
  const byGiver = {};
  const track = (q) => (q.universe ? q.giver + " (" + q.universe + ")" : q.giver);
  const dogQuests = QUESTS.filter((q) => q.kind === "dog");
  if (W.QUESTS != null && !Array.isArray(W.QUESTS)) err("QUESTS: must be a list");
  if (dogQuests.length > DOG_QUESTS) err(`QUESTS: ${dogQuests.length} dog quests, the save holds ${DOG_QUESTS} dog`);
  QUESTS.forEach((q, n) => {
    const ctx = `QUESTS ${q.id || n + 1}`;
    if (!q.id || ids2.has(q.id)) err(`${ctx}: needs an id of its own`);
    ids2.add(q.id);
    if (crewOn && !CREW[q.giver]) err(`${ctx}: giver "${q.giver}" is not in CREW`);
    (byGiver[track(q)] = byGiver[track(q)] || []).push(q);
    if (q.universe != null && !(W.UNIVERSES || {})[q.universe]) err(`${ctx}: universe "${q.universe}" is not in UNIVERSES`);
    if (q.kind != null && q.kind !== "dog") err(`${ctx}: kind "${q.kind}" (leave it out, or "dog")`);
    checkWhen(ctx, q.when);
    // facts
    ["brief", "journal", "done", "after"].forEach((k) => checkFacts(`${ctx} ${k}`, q[k]));
    if (q.kind === "dog") {
      if (q.object || q.tag) err(`${ctx}: the dog quest has no object and no tag`);
    } else {
      if (!q.object || typeof q.object.name !== "string" || !q.object.name.trim()) err(`${ctx}: needs object.name`);
      if (!q.object || !ART_KINDS.includes(q.object.art)) err(`${ctx}: object.art "${q.object && q.object.art}" (${ART_KINDS.join(", ")})`);
      checkFacts(`${ctx} tag`, q.tag);
    }
    // the reward
    const rw = q.reward || {};
    Object.keys(rw).forEach((k) => { if (!REWARD_KEYS.includes(k)) err(`${ctx}: reward key "${k}" (${REWARD_KEYS.join(", ")})`); });
    if ("scrap" in rw && !isInt(rw.scrap, QUEST_SCRAP[0], QUEST_SCRAP[1])) err(`${ctx}: reward scrap ${rw.scrap} must be ${QUEST_SCRAP[0]} to ${QUEST_SCRAP[1]}`);
    Object.entries(rw.items || {}).forEach(([it, c]) => { if (!W.ITEMS[it] || !isInt(c, 1)) err(`${ctx}: reward item ${it} x ${c} (an ITEMS id, 1 or more)`); });
    ["kits", "crowbars"].forEach((k) => { if (k in rw && !isInt(rw[k], 1)) err(`${ctx}: reward ${k} must be 1 or more`); });
    Object.entries(rw.traps || {}).forEach(([k, c]) => { if (!(W.TRAPS || {})[k] || !isInt(c, 1)) err(`${ctx}: reward trap ${k} x ${c} (a TRAPS key, 1 or more)`); });
    const done = (factsOf(q.done) || []).join(" ");
    Object.entries(rw.perk || {}).forEach(([k, v]) => {
      if (!PERKS.includes(k)) return err(`${ctx}: perk "${k}" is not an engine perk (${PERKS.join(", ")})`);
      if (k === "crewRepairFree") { if (v !== true) err(`${ctx}: perk crewRepairFree must be true`); else if (!/scrap|free/i.test(done)) err(`${ctx}: the done facts must say repairs cost no scrap`); return; }
      const crowbar = ((W.TOOLS || {}).crowbar || {}).scrap;
      if (k === "crowbarCost" ? !(isInt(v, 0) && (crowbar == null || v < crowbar)) : !(typeof v === "number" && v > 0)) return err(`${ctx}: perk ${k} ${v} (${k === "crowbarCost" ? "a cost below the crowbar's " + crowbar + " scrap" : "a number above 0"})`);
      if (Number.isInteger(v) && !new RegExp(`\\b${v}\\b`).test(done)) err(`${ctx}: the done facts must say what perk ${k} does, with its number ${v}`);
    });
    // where: a building with a layout, a spot a reader can walk to, by the landmark the brief names
    const loc = W.LOCATIONS.find((l) => l.id === q.at);
    if (!loc || loc.type === "base" || loc.outdoor || !W.TEMPLATES[q.at]) return err(`${ctx}: at "${q.at}" must be a building with a layout`);
    perPlace[q.at] = (perPlace[q.at] || []).concat(q.id);
    const G = geo(q.at);
    const s = q.spot;
    if (!(Array.isArray(s) && Number.isInteger(s[0]) && Number.isInteger(s[1]))) return err(`${ctx}: spot must be [x, y]`);
    const k = s.join(",");
    if (G.at(s[0], s[1]) !== ".") err(`${ctx}: spot ${k} in ${q.at} is "${G.at(s[0], s[1])}", not plain floor`);
    else if (!G.reach.has(k)) err(`${ctx}: spot ${k} in ${q.at} cannot be reached from the entrance with the cache and stash doors shut`);
    if (G.off.has(k)) err(`${ctx}: spot ${k} in ${q.at} is a note spot, a sign or the rod spot`);
    Object.entries(G.foot).forEach(([name, tiles]) => { if (tiles.some((f) => cheb(f, s) <= 1)) err(`${ctx}: spot ${k} in ${q.at} is on or touching ${name}`); });
    if (!G.foot[q.near]) err(`${ctx}: near "${q.near}" is not a landmark of ${q.at} (${Object.keys(G.foot).join(", ")})`);
    else if (Math.min(...G.foot[q.near].map((f) => cheb(f, s))) > QUEST_NEAR) err(`${ctx}: spot ${k} is more than ${QUEST_NEAR} tiles from ${q.near}`);
    if (q.room != null && !G.texts.some((t) => t.includes(String(q.room).toUpperCase()))) err(`${ctx}: room "${q.room}" is not a sign painted in ${q.at}`);
    // the brief says where, word for word: the place, its direction from the cabin, the room or sign, the landmark
    const brief = (factsOf(q.brief) || []).join(" ");
    if (!brief.includes(loc.name)) err(`${ctx}: the brief must name ${loc.name}`);
    if (q.near && !brief.toLowerCase().includes(String(q.near).toLowerCase())) err(`${ctx}: the brief must name ${q.near} word for word`);
    if (q.room != null && !brief.toUpperCase().includes(String(q.room).toUpperCase())) err(`${ctx}: the brief must name the ${q.room} sign`);
    const dirs = allowedDirs(loc);
    const said = (brief.match(/\b(north|south|east|west|northeast|northwest|southeast|southwest) of the cabin\b/gi) || []).map((m) => m.split(" ")[0].toLowerCase());
    if (!said.length) err(`${ctx}: the brief must say which way ${loc.name} is: ${dirs.map((d) => `"${d} of the cabin"`).join(" or ")}`);
    said.filter((d) => !dirs.includes(d)).forEach((d) => err(`${ctx}: ${loc.name} is ${dirs.join(" or ")} of the cabin, not ${d}`));
    if ("scrap" in rw && !new RegExp(`\\b${rw.scrap} scrap\\b`).test(brief)) err(`${ctx}: the brief must give the reward, ${rw.scrap} scrap`);
    Object.entries(rw.items || {}).forEach(([it, c]) => { const word = noun((W.ITEMS[it] || {}).name); if (word && !promises(brief, c, word)) err(`${ctx}: the brief must promise the reward, ${c} ${W.ITEMS[it].name} ("${c} ... ${word}")`); });
    if (rw.kits && !promises(brief, rw.kits, "kit")) err(`${ctx}: the brief must promise the reward, ${rw.kits} medical kit`);
    if (rw.crowbars && !promises(brief, rw.crowbars, "crowbar")) err(`${ctx}: the brief must promise the reward, ${rw.crowbars} crowbar`);
    Object.entries(rw.traps || {}).forEach(([tk, c]) => { const word = noun(((W.TRAPS || {})[tk] || {}).name); if (word && !promises(brief, c, word)) err(`${ctx}: the brief must promise the reward, ${c} ${W.TRAPS[tk].name}`); });
    // inside a building a reader may face any way: landmarks, rooms and signs, never left or right
    if (/\b(left|right) of\b/i.test(brief)) err(`${ctx}: the brief steers by "left of" or "right of"; use the landmark, a room or a sign`);
    // no place reveals: a quest's texts name only its own place, the places known at the start, and the places
    // of the giver's earlier quests (each was known when it was offered)
    const allowed = new Set([q.at].concat([...known], byGiver[track(q)].slice(0, -1).map((x) => x.at)));
    const questWords = ["brief", "tag", "journal", "done", "after"].map((key) => (factsOf(q[key]) || []).join(" ")).join(" ");
    W.LOCATIONS.forEach((l) => { if (!allowed.has(l.id) && questWords.includes(l.name)) err(`${ctx}: names ${l.name}, which the player may not know yet (a quest names only its own place and places already known)`); });
    if (crewOn && CREW[q.giver] && !brief.includes(CREW[q.giver].name)) err(`${ctx}: the brief must name who asks (${CREW[q.giver].name})`);
    if (q.kind === "dog") {
      if (!(loc.danger <= DOG_DANGER)) err(`${ctx}: the dog waits at danger ${DOG_DANGER} or less (${loc.name} is ${loc.danger})`);
      if (!/\btreats?\b/i.test(brief)) err(`${ctx}: the brief must say Pip's treats bring the dog along`);
      if (dogPage && !isInt((q.when || {}).day, dogPage)) err(`${ctx}: June's ledger has no dog at home through day ${dogPage} (its last JOURNAL page that mentions a dog), so when.day must be ${dogPage} or later`);
      if (isInt(R.dogFoodEvery, 1)) {
        const every = R.dogFoodEvery === 1 ? /every day/i : new RegExp(`every ${R.dogFoodEvery} days`, "i");
        if (/\bfood\b/i.test(done) && !every.test(done)) err(`${ctx}: the done facts say what the dog eats: ${every.source} (CREW_RULES.dogFoodEvery)`);
      }
    }
  });
  Object.entries(perPlace).forEach(([at, list]) => {
    if (list.length > QUESTS_PER_PLACE) err(`QUESTS: ${list.length} quest spots in ${at} (${list.join(", ")}), at most ${QUESTS_PER_PLACE}`);
    const spots = QUESTS.filter((q) => q.at === at && Array.isArray(q.spot)).map((q) => q.spot.join(","));
    if (new Set(spots).size !== spots.length) err(`QUESTS: two quests share a spot in ${at}`);
  });
  // gating: each giver's quests in order of stars and days; the first two at places a new player can reach
  Object.entries(byGiver).forEach(([giver, list]) => {
    let prev = 0;
    let prevDay = 0;
    list.forEach((q, i) => {
      const st = (q.when || {}).stars || 0;
      if (st < prev) err(`QUESTS ${q.id}: needs ${st} stars, fewer than ${giver}'s quest before it (${prev})`);
      // docs/CREW.md: quest 1 at 0 stars, 2 at 1, 3 at 2 ... (one more star each, while there are stars to give)
      if (starsMax != null && i < starsMax && st !== i) err(`QUESTS ${q.id}: ${giver}'s quest ${i + 1} comes at ${i} star${i === 1 ? "" : "s"} (has ${st})`);
      prev = st;
      // the days pace the story: a giver's quests never open on an earlier day than the quest before (no day: day 1)
      const day = (q.when || {}).day || 1;
      if (day < prevDay) err(`QUESTS ${q.id}: comes on day ${day}, before ${giver}'s quest before it (day ${prevDay})`);
      prevDay = Math.max(prevDay, day);
      if (i === 0 && !(st === 0 && isInt((q.when || {}).day, 2))) err(`QUESTS ${q.id}: ${giver}'s first quest comes at 0 stars, on day 2 or later`);
      if (i === 0 && !known.has(q.at)) err(`QUESTS ${q.id}: ${giver}'s first quest must be at a place known at the start (${[...known].filter((x) => x !== "base").join(", ")})`);
      if (i === 1 && !early.has(q.at)) err(`QUESTS ${q.id}: ${giver}'s second quest must be at a place the start places' main notes reveal (${[...early].filter((x) => x !== "base").join(", ")})`);
    });
  });
  // the dog's names: Pip's ideas, then the card's words
  if (dogQuests.length || (DOG.ideas || []).length) {
    const ideas = DOG.ideas;
    if (!Array.isArray(ideas) || ideas.length !== DOG_IDEAS) err(`DOG.ideas: Pip has ${DOG_IDEAS} name ideas`);
    else {
      const taken = (PEOPLE || []).concat(NOT_DOG_NAMES, crewIds.map((id) => CREW[id].name)).map((p) => String(p).toLowerCase());
      ideas.forEach((n) => {
        if (typeof n !== "string" || !/^[A-Za-z][A-Za-z' -]{0,13}$/.test(n)) err(`DOG.ideas: "${n}" must be 1 to 14 letters, spaces, ' or -`);
        else if (taken.includes(n.toLowerCase())) err(`DOG.ideas: "${n}" is a person in the story or another dog`);
      });
      if (new Set(ideas.map((n) => String(n).toLowerCase())).size !== ideas.length) err("DOG.ideas: two ideas are the same");
    }
    const F = DOG.facts || {};
    ["ask", "named", "pet"].forEach((k) => checkFacts(`DOG.facts.${k}`, F[k], k === "ask" ? [] : ["dog"]));
    const dogSaid = ["ask", "named", "pet"].map((k) => (factsOf(F[k]) || []).join(" ")).join(" ");
    W.LOCATIONS.forEach((l) => { if (!known.has(l.id) && dogSaid.includes(l.name)) err(`DOG.facts: names ${l.name}, which the player may not know`); });
  }
}

// walker kinds (WALKER_TYPES): every row whole; where each kind comes from (walkerWeights over every place, day and
// road step), the themes, the river's and the alarm's mixes; the scream; the alarm's cap; the wreckers' and builds'
// numbers. SCALE: every check reads Object.keys(WALKER_TYPES), so a new kind is checked with no change here.
{
  const WT = W.WALKER_TYPES || {};
  const kinds = Object.keys(WT);
  const fin = (v) => typeof v === "number" && Number.isFinite(v);
  const days = Array.from({ length: 60 }, (_, i) => i + 1);
  ["walker", "runner", "brute"].forEach((id) => { if (!WT[id]) err(`WALKER_TYPES: no ${id} (its id is permanent: saves, snapshots and looks key on it)`); });
  if (kinds[0] !== "walker") err(`WALKER_TYPES: the first kind must be walker (the fallback), not ${kinds[0]}`);
  kinds.forEach((id) => {
    const T = WT[id];
    const c = `WALKER_TYPES.${id}`;
    if (!/^[a-z][a-zA-Z]*$/.test(id)) err(`${c}: an id is lower camel case letters`);
    if (typeof T.name !== "string" || !T.name.trim()) err(`${c}: no name`);
    ["hp", "speed", "r", "bite", "reach"].forEach((k) => { if (!fin(T[k]) || T[k] <= 0) err(`${c}: ${k} must be a number above 0 (${T[k]})`); });
    ["fenceDps", "scrap", "knock"].forEach((k) => { if (!fin(T[k]) || T[k] < 0) err(`${c}: ${k} must be a number, 0 or more (${T[k]})`); });
    if (!(T.r < 0.5)) err(`${c}: r ${T.r} must be under 0.5 (a walker fits a one-tile doorway)`);
    if (!Number.isInteger(T.scrap)) err(`${c}: scrap must be a whole number`);
    if (T.scream != null && typeof T.scream !== "boolean") err(`${c}: scream must be true or false`);
    if (!T.mix || typeof T.mix.building !== "function" || typeof T.mix.yard !== "function") err(`${c}: mix needs building(danger, day) and yard(day, heavy)`);
    const R = T.road;
    if (!R) err(`${c}: no road block`);
    else {
      ["speed", "r"].forEach((k) => { if (!fin(R[k]) || R[k] <= 0) err(`${c}.road: ${k} must be a number above 0`); });
      ["dmg", "scrap", "reach"].forEach((k) => { if (!fin(R[k]) || R[k] < 0) err(`${c}.road: ${k} must be a number, 0 or more`); });
      if (!Array.isArray(R.w) || R.w.length !== 2 || !R.w.every((v) => fin(v) && v >= 0) || !(R.w[0] + R.w[1] > 0)) err(`${c}.road: w must be [base, perN], both 0 or more, not both 0`);
      if (R.armor != null && !(fin(R.armor) && R.armor >= 0 && R.armor <= 1)) err(`${c}.road: armor must be a share from 0 to 1 (${R.armor})`);
    }
  });
  // the weights: finite, above 0, known kinds, never empty
  const checkW = (ctx, w) => {
    const ks = Object.keys(w || {});
    if (!ks.length) return err(`${ctx}: no walker kind comes`);
    ks.forEach((k) => { if (!WT[k]) err(`${ctx}: unknown kind ${k}`); else if (!fin(w[k]) || w[k] <= 0) err(`${ctx}: ${k} weighs ${w[k]}`); });
    const pick = [0, 0.5, 0.999999].map((r) => W.pickWalkerType(w, () => r));
    pick.forEach((k) => { if (!w[k]) err(`${ctx}: pickWalkerType gave ${k}, not one of its kinds`); });
  };
  const roadSeen = new Set();
  for (let n = 0; n <= 20; n++) {
    const w = W.walkerWeights("road", { n });
    checkW(`walkerWeights road n ${n}`, w);
    kinds.forEach((k) => { if (w[k]) roadSeen.add(k); });
  }
  kinds.forEach((k) => { if (!roadSeen.has(k)) err(`walkerWeights road: a ${k} never comes on the road`); });
  const RM = W.RIVER.walkerMix || {};
  Object.entries(RM).forEach(([k, m]) => {
    if (!WT[k]) err(`RIVER.walkerMix: unknown kind ${k}`);
    if (!Array.isArray(m) || m.length !== 2 || !fin(m[0]) || m[0] <= 0 || !Number.isInteger(m[1]) || m[1] < 1) err(`RIVER.walkerMix.${k}: want [weight above 0, from day 1 or later]`);
  });
  days.forEach((day) => checkW(`walkerWeights river day ${day}`, W.walkerWeights("river", { day })));
  const places = W.LOCATIONS.filter((l) => l.id !== "base");
  const A = W.ALARM || {};
  Object.entries(A.mix || {}).forEach(([k, v]) => { if (!WT[k]) err(`ALARM.mix: unknown kind ${k}`); else if (!fin(v) || v < 0) err(`ALARM.mix.${k}: ${v}`); });
  const byDay10 = new Set();
  places.forEach((l) => days.forEach((day) => {
    const o = { danger: l.danger, day, place: l.id };
    const b = W.walkerWeights("building", o);
    checkW(`walkerWeights building ${l.id} day ${day}`, b);
    checkW(`walkerWeights alarm ${l.id} day ${day}`, W.walkerWeights("alarm", o));
    if (day <= 10 && !l.outdoor) Object.keys(b).forEach((k) => byDay10.add(k));
  }));
  kinds.forEach((k) => { if (!byDay10.has(k)) err(`walkerWeights building: no building has a ${k} by day 10`); });
  places.filter((l) => l.danger === 1 && !l.outdoor).forEach((l) => {
    const ks = Object.keys(W.walkerWeights("building", { danger: 1, day: 1, place: l.id }));
    if (ks.join() !== "walker") err(`walkerWeights building ${l.id}: a danger-1 place on day 1 has ${ks.join(", ")}, want plain walkers only`);
  });
  days.forEach((day) => ["some", "many"].forEach((size) => checkW(`walkerWeights yard day ${day} ${size}`, W.walkerWeights("yard", { day, size }))));
  if (Object.keys(W.walkerWeights("yard", { day: 1, size: "some" })).join() !== "walker") err("walkerWeights yard: a small wave on day 1 is plain walkers only");
  // the themed places: known places and kinds; there the themed kind is the likeliest after the plain walker on day 5
  Object.entries(W.WALKER_THEMES || {}).forEach(([id, theme]) => {
    const l = W.LOCATIONS.find((x) => x.id === id);
    if (!l) return err(`WALKER_THEMES: no place ${id}`);
    const w = W.walkerWeights("building", { danger: l.danger, day: 5, place: id });
    Object.entries(theme).forEach(([k, m]) => {
      if (!WT[k]) return err(`WALKER_THEMES.${id}: unknown kind ${k}`);
      if (!fin(m) || m <= 0) err(`WALKER_THEMES.${id}.${k}: ${m}`);
      Object.keys(w).filter((o) => o !== "walker" && !theme[o]).forEach((o) => {
        if (!(w[k] > w[o])) err(`WALKER_THEMES.${id}: on day 5 a ${o} (${w[o].toFixed(3)}) is at least as likely as its ${k} (${(w[k] || 0).toFixed(3)})`);
      });
    });
  });
  Object.keys(W.WALKER_HP_STEP || {}).forEach((where) => days.forEach((day) => {
    const m = W.walkerHpMult(where, day);
    if (!fin(m) || m < 1) err(`walkerHpMult ${where} day ${day}: ${m}`);
  }));
  // the scream
  const SC = W.SCREAM || {};
  if (!(fin(SC.spot) && SC.spot > 0 && fin(SC.radius) && SC.radius > SC.spot)) err("SCREAM: want 0 < spot < radius (tiles)");
  if (!(fin(SC.mult) && SC.mult > 1 && SC.mult <= 2)) err("SCREAM: mult must be above 1, at most 2");
  if (!(fin(SC.secs) && SC.secs > 0 && fin(SC.cooldown) && SC.cooldown >= SC.secs)) err("SCREAM: want 0 < secs <= cooldown");
  if (!(fin(SC.yell) && SC.yell > 0 && SC.yell < SC.cooldown)) err("SCREAM: want 0 < yell < cooldown");
  // the alarm: its timing, and a cap above any building's own walkers
  ["first", "gap", "minGap", "farFrom"].forEach((k) => { if (!fin(A[k]) || A[k] <= 0) err(`ALARM.${k} must be above 0`); });
  if (!(A.gap >= A.minGap) || !fin(A.speedup) || A.speedup < 0) err("ALARM: want gap >= minGap and speedup >= 0");
  let most = 0;
  for (let d = 1; d <= Math.max(...W.LOCATIONS.map((l) => l.danger)); d++) days.forEach((day) => { most = Math.max(most, W.SETTINGS.walkersPerLocation(d, day)); });
  if (!Number.isInteger(A.cap) || A.cap < most + 6) err(`ALARM.cap ${A.cap}: want a whole number, at least the most walkersPerLocation (${most}) + 6`);
  // the wreckers, the builds, the breach and the spawn spacing
  const D = W.DEFENSE;
  if (D.fenceDps) err("DEFENSE.fenceDps: claw damage lives in WALKER_TYPES[].fenceDps now");
  if (!(fin(D.breachRange) && D.breachRange > 0)) err("DEFENSE.breachRange must be above 0");
  if (!(fin(D.wreckShare) && D.wreckShare >= 0 && D.raidShare + D.wreckShare <= 1)) err("DEFENSE: want wreckShare >= 0 and raidShare + wreckShare <= 1");
  if (!(fin(D.wreckSeconds) && D.wreckSeconds > 0 && fin(D.wreckProvoke) && D.wreckProvoke > 0)) err("DEFENSE: wreckSeconds and wreckProvoke must be above 0");
  if (!(fin(D.wreckDps) && D.wreckDps >= 0)) err("DEFENSE.wreckDps must be 0 or more");
  if (!(fin(D.vanWreckFloor) && D.vanWreckFloor > 0 && D.vanWreckFloor < 1)) err("DEFENSE.vanWreckFloor must be between 0 and 1");
  const levels = Math.max(...Object.values(W.BASE_ROOMS).map((r) => r.levels.length));
  const bh = D.buildHp || [];
  if (bh.length < levels + 1 || bh[0] !== 0 || bh.slice(1).some((v, i) => !fin(v) || v <= bh[i])) err(`DEFENSE.buildHp: want 0 then one rising number per room level (${levels})`);
  if (!Number.isInteger(W.SETTINGS.buildRepairScrap) || W.SETTINGS.buildRepairScrap < 1) err("SETTINGS.buildRepairScrap must be a whole number, 1 or more");
  if (typeof W.SETTINGS.walkerGore !== "boolean") err("SETTINGS.walkerGore must be true or false");
  const WS = W.SETTINGS.walkerSpawn || {};
  ["minSteps", "gap", "groupGap", "ring", "near"].forEach((k) => { if (!fin(WS[k]) || WS[k] <= 0) err(`SETTINGS.walkerSpawn.${k} must be above 0`); });
  if (!(WS.gap >= WS.groupGap)) err("SETTINGS.walkerSpawn: gap must be at least groupGap");
  ["footDamageWalker", "footDamageRunner", "footDamageBrute"].forEach((k) => { if (W.SETTINGS[k] != null) err(`SETTINGS.${k}: a bite lives in WALKER_TYPES[].bite now`); });
}

// the van's paint looks (js/upgrades.js PAINT_LOOKS): a save keeps the index of the look it wears and of each look it
// bought, so looks are only appended: the looks saves already hold keep their places. Every look whole (its colours
// real #rrggbb, its decal a kind the van is drawn with), names unique, Primer Gray first and free, then each look's
// price in DEFS.paint.costs order (any price: a look appended may cost less than the one before it), and its Garage
// tier one the Garage reaches (the owner's 2026-10-18 eight: the six old looks and two new ones)
{
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js", "upgrades.js"), "utf8"), sb, { filename: "upgrades.js" });
  const UP = sb.ZSR.Upgrades;
  const LOOKS = UP.PAINT_LOOKS;
  // SCALE: a new decal kind is drawn by js/van3d.js, js/sprites.js and js/base.js paintChip (the Garage swatch), and
  // named in js/base.js DECAL_WORDS, then listed here
  const DECALS = ["none", "stripe", "patches", "stencil", "hazard", "flames", "lightning", "drips"];
  const COLOURS = ["body", "roof", "trim", "bumper", "rims", "decalA", "decalB"];
  const topTier = Math.max(...W.BASE_ROOMS.garage.levels.map((l) => l.effect.tierCap || 0));
  if (!Array.isArray(LOOKS) || LOOKS.length < 8) err(`PAINT_LOOKS: ${LOOKS ? LOOKS.length : 0} looks, want at least the owner's 8`);
  else {
    const names = new Set();
    LOOKS.forEach((l, i) => {
      const c = `PAINT_LOOKS[${i}] ${l.name}`;
      if (!l.name || typeof l.name !== "string") err(`PAINT_LOOKS[${i}]: no name`);
      else if (names.has(l.name.toLowerCase())) err(`${c}: two looks have this name`);
      names.add(String(l.name).toLowerCase());
      COLOURS.forEach((k) => { if (!/^#[0-9a-f]{6}$/i.test(l[k] || "")) err(`${c}: ${k} "${l[k]}" must be a #rrggbb colour`); });
      if (!DECALS.includes(l.decal)) err(`${c}: decal "${l.decal}" is not a kind the van is drawn with (${DECALS.join(", ")})`);
      if (i === 0) {
        if (l.cost !== 0 || l.tier !== 0) err(`${c}: the first look is the van's own primer: cost 0 and tier 0 (it is ${l.cost}, ${l.tier})`);
        return;
      }
      if (!Number.isInteger(l.cost) || l.cost < 1) err(`${c}: cost ${l.cost} must be a positive whole number`);
      if (UP.DEFS.paint.costs[i - 1] !== l.cost) err(`${c}: cost ${l.cost} is not DEFS.paint.costs[${i - 1}] (${UP.DEFS.paint.costs[i - 1]}); Upgrades.cost("paint", level) reads it there for code that reads every upgrade alike`);
      if (!Number.isInteger(l.tier) || l.tier < 1 || l.tier > topTier) err(`${c}: tier ${l.tier} must be 1 to ${topTier} (the top Garage level's tierCap)`);
    });
    // saves keep look indexes (upgrades.paint, upgrades.paintOwned; a save from the old paint ladder at paint k owns
    // looks 0 to k): these looks never move. SCALE: a new look is appended to PAINT_LOOKS and its name to this list
    const SAVED_LOOKS = ["Primer Gray", "Matte Black", "Rust Bucket", "Olive Drab", "Hazard", "Convoy Red", "Night Violet", "Radioactive"];
    SAVED_LOOKS.forEach((n, i) => {
      if (!LOOKS[i] || LOOKS[i].name !== n) err(`PAINT_LOOKS[${i}] is ${LOOKS[i] ? LOOKS[i].name : "missing"}, want ${n}: a save keeps this index, so looks are only appended (docs/SCALING.md)`);
    });
    if (UP.DEFS.paint.max !== LOOKS.length - 1 || UP.DEFS.paint.costs.length !== LOOKS.length - 1) err(`DEFS.paint: max ${UP.DEFS.paint.max} and ${UP.DEFS.paint.costs.length} costs, want one for each look past the first (${LOOKS.length - 1})`);
    ["Night Violet", "Radioactive"].forEach((n) => {
      const l = LOOKS.find((x) => x.name === n);
      if (!l) err(`PAINT_LOOKS: the owner's ${n} look is missing`);
      else if (l.tier !== topTier) err(`PAINT_LOOKS ${n}: tier ${l.tier}, want the top Garage level's (${topTier}; owner, 2026-10-18)`);
    });
  }
}

if (errors.length) { errors.forEach((e) => console.log("ERROR " + e)); process.exit(1); }
console.log(`OK: world has ${W.LOCATIONS.length} locations, ${Object.keys(W.TEMPLATES).length} layouts (${Object.keys(ART).length} landmark arts, ${Object.keys(DECOR).length} decor kinds), ${Object.keys(W.ITEMS).length} items, ${Object.keys(W.BASE_ROOMS).length} rooms, ${Object.keys(W.CREW || {}).length} crew, ${(W.QUESTS || []).length} crew quests, ${Object.keys(W.WALKER_TYPES || {}).length} walker kinds.`);
