#!/usr/bin/env node
/* Draws all of the interior art in node, on a canvas that checks every call instead of drawing:
   - every decor key in ZSR.LAYOUT_DECOR has a wall texture (js/decor.js), and every art key in
     ZSR.LAYOUT_ART a landmark sprite (js/landmarks1.js, js/landmarks2.js, loaded when present);
   - each one draws without throwing, once for every set of opts the layouts give it (decor text and
     variants on that building's palette, every wall style; landmark color and label), with finite
     numbers, no negative radius, color stops inside 0..1, real colors and fonts;
   - a decor face starts by painting its whole tile opaque (the engine never draws behind a wall),
     and the page loads the art files;
   - every gun in hand draws cleanly at every mod tier, at rest and in motion, with its icon and view;
   - the walk-in house's art (js/houseart.js, loaded by the page after sprites3d.js): every texture,
     sprite and floor listed in ZSR.HOUSE_ART draws cleanly with every opts set listed for it, at its
     size; its wall faces, floors and ceiling start by painting the whole tile opaque;
   - the walkers (js/walker3d.js and its looks, loaded after sprites3d.js and before interior.js): every type in the
     facts has a look; every type draws cleanly in every pose, from every side, at every level of detail, falling and
     hit, in tiny to large regions, near and far, with no transforms, images, gradients, read-backs or new canvases,
     inside its region with its feet on the bottom, within its canvas-call ceiling, the same way twice; no strong red
     with gore off; fog darkens all but the eyes; its boxes, strides and blood sprites are sane; seen from above as
     the angled road camera sees them (cam.floor, cam.shadow: eyes 5 to 9 tiles, 2 to 70 tiles off) the same
     promises hold, every pose at full size, the ankles where that camera puts them, no shadow of its own; and the
     two options left off draw exactly as without them; the walkers' calls hash to the fixture recorded before people
     joined the rig (a walker must draw exactly as it did);
   - the crew in 3D (js/walker3d-crew.js, people on the walkers' rig: Walker3D.addHuman): every crew id in the facts
     has a look, its scale the facts' and its colours js/crewart.js's; an unknown crew id draws the stand-in; every
     pose, job, seat, side, level of detail and run draws cleanly on the checking context (no transforms, images or
     new canvases, inside its region, its lowest point on the floor line, within CREW_OPS, the same calls twice), at
     the same size in every pose; no glow and no blood colour; fog darkens everything; poses blend in and their loops
     close without a jump; bad fields draw as their defaults; box() and stride() are sane;
   - the animals (js/beast3d.js and its looks, loaded right after the walkers' looks): the stray dog and Rivet in every
     pose they have, from every side, at every detail, trotting and galloping, cleanly inside their regions with their
     feet on the floor line, within their call ceilings, the same way twice; fog darkens all but a robot's lights and a
     shut-down robot has none; poses ease in without a jump, the gait and the pose loops are smooth; the size never
     follows the pose; a two-legged winged stand-in draws through the same rig;
   - the crew's art (js/crewart.js, loaded by the page after sprites3d.js): every sprite ZSR.CREW_ART
     lists is registered and draws cleanly, at its size, with every opts set listed for it; the list
     covers every crew member in every pose and frame, the poses and quest object kinds docs/CREW.md
     names, and every crew member, post pose and quest object kind in the facts (js/story-crew.js,
     js/story-quests.js and any other js/story*.js the page loads); an id, pose or kind the art does not know yet
     draws a stand-in;
   - the van model (js/model3d.js and js/van3d.js, after upgrades.js): every paint look with its gear at several
     levels, the dents, the roof gun and every level of detail draws cleanly from all round, near and far, within its
     canvas-call ceilings, the same way twice, its text never mirrored; each look's decal is on both sides and the hood,
     and on the roof and the back doors at lod 1 (what the road's camera sees), with its gear on and off; its parts in
     the order the yard's eye sees them from beside it, no hidden face showing, every decal inside its face.
   validate-world.js checks the layout data, validate-engine.js what the engine makes of it. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");
const ART_FILES = ["decor.js", "landmarks1.js", "landmarks2.js"]; // SCALE: add landmarks3.js ... here as places grow
const HOUSE_FILE = "houseart.js";
const CREW_FILE = "crewart.js";
const CREW_SPRITES = ["crew", "crewDog", "crewFace", "qObj"]; // the names js/crew.js, js/building.js and the crew card draw
// SCALE: the walker module, its looks, then the crew's looks; add walker3d-looks2.js / walker3d-crew2.js ... here as they grow
const WALKER_FILES = ["walker3d.js", "walker3d-looks.js", "walker3d-crew.js"];
const WALKER_OPS = [600, 350, 160]; // SCALE: most canvas calls one walker may make at lod 0 / 1 / 2 (each one is drawn every frame it changes)
// SCALE: most canvas calls one crew member may make at lod 0 / 1 / 2, with the props of the busiest pose (June kneeling
// at her bed with the tray and the ledger put down, Tomas hammering); a busier look or prop must fit under these
const CREW_OPS = [700, 400, 200];
// The walkers' calls before people joined the rig (2026-10-18): walkerCallsHash below over every type, pose, side and
// level of detail, falls, runs and the road's camera. A walker's art changed on purpose: run
// `node tests/validate-art.js --record-walkers` and paste the numbers it prints here.
const WALKER_FIXTURE = { draws: 1788, calls: 451176, sha1: "f0097c7dc0b929b352a8f7ed3019651250aa7f92" };
const WALKER_H_MAX = 1.3; // SCALE: tallest walker box, tiles (the engine caps it at 0.98 under a ceiling)
const WALKER_COLOURS = 6000; // SCALE: most colour strings random walker draws may use (Walker3D's colour table, CC_N, holds 32768)
const CREW_COLOURS = 6000; // SCALE: the same for random draws of the crew's looks (they share that table with the walkers)
// docs/CREW.md's own lists: the post poses (plus "walk", between posts) and the quest object kinds. The art
// must cover them even before a fact uses one (validate-world.js holds the facts to the same kinds).
const CREW_POSES = ["stand", "sit", "work", "read", "walk"];
const QUEST_KINDS = ["bag", "photo", "box", "book", "tin", "leash", "toolbox", "radio", "jar", "letter", "seeds", "blanket", "tape", "badge", "wrench"];

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

/** Every walker type, pose, side and level of detail (two looks each), falls, runs, the road's camera and a fogged far
    one, drawn on a context that hashes each call and each style set (numbers to 1/1000): { draws, calls, sha1 }.
    WALKER_FIXTURE holds what the walkers drew before people joined the rig. Uses only Walker3D.draw and TYPES (not
    box(), which reads the facts), and passes gore, so it is the same in any sandbox. */
function walkerCallsHash(W3) {
  const PI = Math.PI;
  const hash = require("crypto").createHash("sha1");
  let draws = 0;
  let calls = 0;
  const r = (v) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v);
  const fns = {};
  const ctx = new Proxy(
    {},
    {
      get(o, k) {
        return (
          fns[k] ||
          (fns[k] = (...a) => {
            calls++;
            hash.update(k + "(" + a.map(r).join(",") + ")");
          })
        );
      },
      set(o, k, v) {
        hash.update(k + "=" + r(v) + ";");
        return true;
      },
    }
  );
  const one = (type, st, cam) => {
    hash.update("|" + type + "|");
    W3.draw(ctx, type, Object.assign({ yaw: 0, gait: 0.3, move: 1, pose: "walk", poseT: 0.5, claw: 0.3, hit: 0, fall: 0, fallDir: PI, seed: 0, lod: 0, fog: 0, gore: true }, st), cam);
    draws++;
  };
  const camOf = (t, falling, h, extra) => {
    const T = W3.TYPES[t];
    const w = falling ? Math.max(T.w, 2 * T.h + 0.2) : T.w;
    return Object.assign({ w: Math.ceil((w * h) / T.h), h, px: h / T.h, dist: 2.2, eye: 0.5 }, extra);
  };
  Object.keys(W3.TYPES).forEach((type) => {
    for (let seed = 0; seed < 2; seed++) {
      W3.POSES.forEach((pose, pi) => {
        for (let k = 0; k < 8; k++) {
          for (let lod = 0; lod < 3; lod++) {
            one(type, { pose, seed, lod, yaw: (k * PI) / 4 - PI + 0.1, move: pose === "walk" ? 1 : 0.3, poseT: (k + pi) / 9, claw: k / 8, poseW: k === 3 ? 0.4 : 1, gait: k / 8 }, camOf(type, false, 160));
          }
        }
      });
    }
    [0.35, 0.8, 1].forEach((fall) => {
      [0, PI / 2, PI].forEach((fallDir) => {
        [0, 2.4].forEach((yaw, yi) => {
          [true, false].forEach((gore) => one(type, { fall, fallDir, yaw, gore, lod: yi, seed: 3 }, camOf(type, true, 140)));
        });
      });
    });
    [0.5, 1].forEach((run) => {
      for (let g = 0; g < 5; g++) {
        [1, -2].forEach((yaw, yi) => one(type, { run, gait: 0.1 + g * 0.2, yaw, lod: yi * 2, gore: g % 2 === 0 }, camOf(type, false, 90, { floor: 30, shadow: false, eye: 7, dist: 12, h: 120 })));
      }
    });
    one(type, { hit: 1, fog: 0.45, yaw: 0.5, pose: "bite", poseT: 0.4 }, camOf(type, false, 200, { dist: 0.85 }));
    one(type, { fog: 0.8, yaw: -0.5, pose: "idle", poseT: 0.2, lod: 1 }, { w: 60, h: 80, dist: 25, eye: 0.5 });
  });
  return { draws, calls, sha1: hash.digest("hex") };
}

/* ---------- A 2D context that records and checks every call ---------- */
let current = "(loading)"; // what is being drawn, for the messages
let noRead = false; // while a walker draws: reading context state back is an error
const finite = (v) => typeof v === "number" && Number.isFinite(v);
// how many leading arguments must be finite numbers (fillText / strokeText: the 2 after the text)
const NUMS = { fillRect: 4, strokeRect: 4, clearRect: 4, rect: 4, moveTo: 2, lineTo: 2, arc: 5, ellipse: 7, quadraticCurveTo: 4, bezierCurveTo: 6, arcTo: 5, translate: 2, scale: 2, rotate: 1, roundRect: 4, setTransform: 6, transform: 6, createLinearGradient: 4, createRadialGradient: 6, putImageData: 3 };
const COLOR = /^(#[0-9a-f]{3}|#[0-9a-f]{6}|#[0-9a-f]{8}|rgba?\(\s*[-\d.]+\s*,\s*[-\d.]+\s*,\s*[-\d.]+\s*(,\s*[-\d.]+\s*)?\)|transparent|black|white)$/i;
function checkColor(v, what) {
  if (typeof v === "string") {
    if (!COLOR.test(v.trim())) err(`${current}: ${what} "${v}" is not a color`);
  } else if (!v || !v.isGradient) err(`${current}: ${what} is ${typeof v}, not a color or gradient`);
}
function gradient() {
  return {
    isGradient: true,
    addColorStop(o, c) {
      if (!finite(o) || o < 0 || o > 1) err(`${current}: color stop at ${o} (must be 0..1)`);
      checkColor(c, "color stop");
    },
  };
}
function context2d(canvas) {
  const state = { fillStyle: "#000000", strokeStyle: "#000000", globalAlpha: 1, lineWidth: 1, font: "10px sans-serif" };
  const stack = [];
  const ops = (canvas.ops = []);
  const calls = {
    save: () => stack.push(Object.assign({}, state)),
    restore: () => stack.length && Object.assign(state, stack.pop()),
    measureText(t) {
      const m = /([\d.]+)px/.exec(state.font);
      const size = m ? +m[1] : 10;
      return { width: String(t).length * size * 0.52 };
    },
    getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) }),
    createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) }),
    createLinearGradient: gradient,
    createRadialGradient: gradient,
    createPattern: () => ({ isGradient: true }),
  };
  const target = {};
  return new Proxy(target, {
    get(o, k) {
      if (noRead && (k === "canvas" || k in state || k in o)) err(`${current}: reads ${String(k)} back from the context`);
      if (k === "canvas") return canvas;
      if (k in state) return state[k];
      if (k in o) return o[k];
      if (typeof k !== "string") return undefined;
      return (...args) => {
        const n = NUMS[k];
        if (n) for (let i = 0; i < n && i < args.length; i++) if (!finite(args[i])) err(`${current}: ${k}() argument ${i + 1} is ${args[i]}`);
        if (k === "arc" && args[2] < 0) err(`${current}: arc() with radius ${args[2]}`);
        if (k === "ellipse" && (args[2] < 0 || args[3] < 0)) err(`${current}: ellipse() with radius ${args[2]}, ${args[3]}`);
        if (k === "arcTo" && args[4] < 0) err(`${current}: arcTo() with radius ${args[4]}`);
        if (k === "roundRect" && typeof args[4] === "number" && args[4] < 0) err(`${current}: roundRect() with radius ${args[4]}`);
        if (k === "fillText" || k === "strokeText") {
          if (typeof args[0] !== "string" && typeof args[0] !== "number") err(`${current}: ${k}() of ${typeof args[0]}`);
          if (!finite(args[1]) || !finite(args[2])) err(`${current}: ${k}() at ${args[1]}, ${args[2]}`);
          if (args[3] != null && !(args[3] > 0)) err(`${current}: ${k}() with max width ${args[3]}`);
        }
        if (k === "drawImage") {
          const img = args[0];
          if (!img || !(img.width > 0) || !(img.height > 0)) err(`${current}: drawImage() of something with no size`);
          for (let i = 1; i < args.length; i++) if (!finite(args[i])) err(`${current}: drawImage() argument ${i + 1} is ${args[i]}`);
        }
        ops.push({ k, args, fillStyle: state.fillStyle, strokeStyle: state.strokeStyle, lineWidth: state.lineWidth, globalAlpha: state.globalAlpha });
        return calls[k] ? calls[k](...args) : undefined;
      };
    },
    set(o, k, v) {
      if (k === "shadowBlur" || k === "filter") ops.push({ k: "set " + k, args: [v] });
      if (k === "fillStyle" || k === "strokeStyle") checkColor(v, k);
      else if (k === "globalAlpha" && !(finite(v) && v >= 0 && v <= 1)) err(`${current}: globalAlpha ${v}`);
      else if (k === "lineWidth" && !(finite(v) && v > 0)) err(`${current}: lineWidth ${v}`);
      else if (k === "font" && !(typeof v === "string" && /\d(\.\d+)?px/.test(v))) err(`${current}: font "${v}"`);
      if (k in state || ["fillStyle", "strokeStyle", "globalAlpha", "lineWidth", "font"].includes(k)) state[k] = v;
      else o[k] = v;
      return true;
    },
  });
}
let lastCanvas = null; // the canvas made most recently (a floor's canvas is not handed back, only its pixels)
function element(tag) {
  const el = { tagName: String(tag).toUpperCase(), style: {}, classList: { add() {}, remove() {}, contains: () => false }, addEventListener() {}, setAttribute() {}, getAttribute: () => null };
  if (el.tagName === "CANVAS") {
    el.width = 300;
    el.height = 150;
    el.getContext = () => el.ctx || (el.ctx = context2d(el));
    lastCanvas = el;
  }
  return el;
}
const sb = {
  console,
  performance,
  document: { createElement: element, getElementById: () => element("div"), documentElement: element("html"), addEventListener() {}, fonts: { ready: { then() {} } } },
  addEventListener() {},
};
sb.globalThis = sb;
sb.window = sb;
vm.createContext(sb);

/* ---------- Load the catalogs, the art API and the art ---------- */
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const pageScripts = [...html.matchAll(/<script src="js\/([^"]+)"><\/script>/g)].map((m) => m[1]);
const load = (f) => {
  current = "js/" + f;
  try {
    vm.runInContext(fs.readFileSync(path.join(ROOT, "js", f), "utf8"), sb, { filename: "js/" + f });
  } catch (e) {
    err(`js/${f} threw while loading: ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
  }
};
["layouts.js", "sprites3d.js"].forEach(load);
const present = ART_FILES.filter((f) => fs.existsSync(path.join(ROOT, "js", f)));
present.forEach(load);
present.forEach((f) => {
  const at = pageScripts.indexOf(f);
  if (at < 0) err(`js/${f} exists but index.html does not load it`);
  else if (at < pageScripts.indexOf("sprites3d.js")) err(`index.html loads js/${f} before sprites3d.js (it needs Draw3)`);
});
ART_FILES.filter((f) => !present.includes(f)).forEach((f) => warn(`js/${f} is not there yet`));
if (!fs.existsSync(path.join(ROOT, "js", HOUSE_FILE))) err(`js/${HOUSE_FILE} is missing`);
else {
  load(HOUSE_FILE);
  const at = pageScripts.indexOf(HOUSE_FILE);
  if (at < 0) err(`index.html does not load js/${HOUSE_FILE}`);
  else if (at < pageScripts.indexOf("sprites3d.js")) err(`index.html loads js/${HOUSE_FILE} before sprites3d.js (it needs Draw3)`);
}

// the walkers: after Draw3 (they register their blood sprites with it), before the engine that draws them
WALKER_FILES.forEach((f, i) => {
  if (!fs.existsSync(path.join(ROOT, "js", f))) return err(`js/${f} is missing`);
  load(f);
  const at = pageScripts.indexOf(f);
  if (at < 0) err(`index.html does not load js/${f}`);
  else {
    if (at < pageScripts.indexOf("sprites3d.js")) err(`index.html loads js/${f} before sprites3d.js`);
    if (pageScripts.includes("interior.js") && at > pageScripts.indexOf("interior.js")) err(`index.html loads js/${f} after interior.js (the engine reads Walker3D)`);
    if (i && at < pageScripts.indexOf(WALKER_FILES[i - 1])) err(`index.html loads js/${f} before js/${WALKER_FILES[i - 1]}`);
  }
});

if (!fs.existsSync(path.join(ROOT, "js", CREW_FILE))) err(`js/${CREW_FILE} is missing`);
else {
  load(CREW_FILE);
  const at = pageScripts.indexOf(CREW_FILE);
  if (at < 0) err(`index.html does not load js/${CREW_FILE}`);
  else if (at < pageScripts.indexOf("sprites3d.js")) err(`index.html loads js/${CREW_FILE} before sprites3d.js (it needs Draw3)`);
}

const { ZSR } = sb;
const D = ZSR.Draw3;
const LAYOUTS = ZSR.LAYOUTS || {};
const DECOR = ZSR.LAYOUT_DECOR || {};
const ART = ZSR.LAYOUT_ART || {};
if (!D) {
  console.log("ERROR js/sprites3d.js did not set up ZSR.Draw3");
  process.exit(1);
}

/* ---------- Every catalog key has its art ---------- */
Object.keys(DECOR).forEach((k) => D.hasTexture(k) || err(`decor "${k}" has no wall texture (Draw3.registerTexture)`));
Object.keys(ART).forEach((k) => D.hasSprite(k) || err(`landmark art "${k}" has no sprite (Draw3.registerSprite)`));
const Dec = ZSR.Decor;
if (!Dec || typeof Dec.optsFor !== "function") err("js/decor.js does not export ZSR.Decor.optsFor (building.js uses it for the texture opts)");
(Dec && Dec.KINDS ? Dec.KINDS : []).forEach((k) => DECOR[k] || warn(`decor.js draws "${k}", which no layout catalogs`));

/* ---------- Draw them: decor as the layouts use it ---------- */
const optsFor = (d) => (Dec && Dec.optsFor ? Dec.optsFor(d) : d.text ? { text: d.text } : undefined);
/** The first thing drawn covers the whole 64 x 64 tile in a solid color at full alpha. */
function startsOpaque(ops) {
  const first = ops.find((o) => o.k !== "save" && o.k !== "scale");
  return !!first && first.k === "fillRect" && first.args[0] <= 0 && first.args[1] <= 0 && first.args[0] + first.args[2] >= 64 && first.args[1] + first.args[3] >= 64 && first.globalAlpha === 1 && typeof first.fillStyle === "string" && !/^rgba\(.*,\s*(0?\.\d+|0)\s*\)$/.test(first.fillStyle) && first.fillStyle.length !== 9;
}
let faces = 0;
function face(name, palette, opts, what) {
  if (!D.hasTexture(name)) return;
  current = what;
  let c;
  try {
    c = D.texture(name, palette, opts);
  } catch (e) {
    return err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
  }
  if (!c || c.width !== 64 || c.height !== 64) return err(`${what}: not a 64 x 64 face`);
  if (!c.ops) return; // drawn earlier with the same palette and opts
  faces++;
  // opaque: the first thing drawn covers the whole tile in a solid color at full alpha
  if (!startsOpaque(c.ops)) err(`${what}: does not start by filling the whole tile with a solid color (faces must be opaque)`);
  if (c.ops.length < 12) err(`${what}: draws almost nothing (${c.ops.length} calls)`);
  delete c.ops;
}
const used = {};
Object.entries(LAYOUTS).forEach(([id, lay]) => {
  (lay.decor || []).forEach((d) => {
    used[d.tex] = (used[d.tex] || 0) + 1;
    const o = optsFor(d);
    const nv = (Dec && Dec.VARIANTS && Dec.VARIANTS[d.tex]) || 1;
    if (o && o.v != null && !(o.v >= 0 && o.v < nv && o.v === Math.floor(o.v))) err(`${id}: decor ${d.tex} at ${d.x},${d.y} gets variant ${o.v}, it has ${nv}`);
    face(d.tex, lay.palette, o, `${id}: decor ${d.tex} at ${d.x},${d.y}${o ? " " + JSON.stringify(o) : ""}`);
  });
});
// every face on every wall style, with a long two-word text and with none, in every variant
const styles = D.WALL_STYLES || ["drywall"];
Object.keys(DECOR).forEach((k) => {
  const n = (Dec && Dec.VARIANTS && Dec.VARIANTS[k]) || 1;
  styles.forEach((style) => {
    const pal = { wall: "#7a7468", shelf: "#5a4a3a", counter: "#4b5057", floor: "#55565a", ceiling: "#2a2a2e", wallStyle: style };
    for (let v = 0; v < n; v++) {
      [undefined, "CABINET ROOM", "OAK"].forEach((text) => {
        const o = {};
        if (text) o.text = text;
        if (n > 1) o.v = v;
        face(k, pal, Object.keys(o).length ? o : undefined, `decor ${k} on ${style}${text ? ' "' + text + '"' : ""}${n > 1 ? " v" + v : ""}`);
      });
    }
  });
  if (!used[k]) warn(`decor "${k}" is in the catalog but no layout uses it`);
});

/* ---------- Landmarks as the layouts use them ---------- */
let sprites = 0;
Object.entries(LAYOUTS).forEach(([id, lay]) => {
  Object.entries(lay.landmarks || {}).forEach(([n, def]) => {
    if (!def || !D.hasSprite(def.art)) return;
    // the same opts building.js passes
    const opts = {};
    if (def.color) opts.color = def.color;
    if (def.label) opts.label = def.label;
    const what = (current = `${id}: landmark ${n} (${def.name}) art ${def.art} ${JSON.stringify(opts)}`);
    let c;
    try {
      c = D.sprite(def.art, opts);
    } catch (e) {
      return err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
    }
    if (!c || !(c.width > 0) || !(c.height > 0)) return err(`${what}: no image`);
    if (c.ops) {
      sprites++;
      if (c.ops.length < 12) err(`${what}: draws almost nothing (${c.ops.length} calls)`);
      delete c.ops;
    }
    // a footprint landmark covers foot[0] * 0.95 tiles of floor at most 0.98 tall indoors, and a tile of floor
    // is 2 tan(FOV / 2) times narrower on screen than a wall is tall: art drawn at that shape keeps round wheels
    if (Array.isArray(def.foot) && def.foot[0] > 1) {
      const want = (def.foot[0] * 0.95) / Math.min(def.size || 1, 0.98) / (2 * Math.tan(1.22 / 2));
      const aspect = c.width / c.height;
      if (aspect < want * 0.8 || aspect > want * 1.25) warn(`${what}: art is ${c.width} x ${c.height}; it is drawn about ${want.toFixed(1)}:1, so it will look squashed or stretched`);
    }
  });
});

/* ---------- The walk-in house (js/houseart.js): everything ZSR.HOUSE_ART lists, with every opts set ---------- */
const HOUSE = ZSR.HOUSE_ART;
let houseDrawn = 0;
const optsSets = (list, what) => {
  if (!Array.isArray(list) || !list.length) {
    err(`HOUSE_ART ${what}: no opts sets (list [{}] for none)`);
    return [];
  }
  return list.filter((o) => (o && typeof o === "object" && !Array.isArray(o)) || (err(`HOUSE_ART ${what}: opts ${JSON.stringify(o)} is not an object`), false));
};
if (!HOUSE) err(`js/${HOUSE_FILE} does not export ZSR.HOUSE_ART { textures, sprites, floors }`);
else {
  const low = new Set(HOUSE.low || []);
  const pal = { wall: "#7a7468", shelf: "#5a4a3a", counter: "#4b5057", floor: "#55565a", ceiling: "#2a2a2e", wallStyle: "drywall" };
  Object.entries(HOUSE.textures || {}).forEach(([name, list]) => {
    if (!D.hasTexture(name)) return err(`house texture "${name}" is listed but not registered (Draw3.registerTexture)`);
    optsSets(list, `texture ${name}`).forEach((o) => {
      const what = (current = `house texture ${name} ${JSON.stringify(o)}`);
      let c;
      try {
        c = D.texture(name, pal, o);
      } catch (e) {
        return err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
      }
      if (!c || c.width !== 64 || c.height !== 64) return err(`${what}: not a 64 x 64 face`);
      if (!c.ops) return; // drawn already
      houseDrawn++;
      if (!low.has(name) && !startsOpaque(c.ops)) err(`${what}: does not start by filling the whole tile with a solid color (wall faces must be opaque)`);
      if (c.ops.length < 12) err(`${what}: draws almost nothing (${c.ops.length} calls)`);
      delete c.ops;
    });
  });
  (HOUSE.low || []).forEach((name) => (HOUSE.textures || {})[name] || err(`HOUSE_ART.low names "${name}", which is not in its textures`));
  Object.entries(HOUSE.sprites || {}).forEach(([name, list]) => {
    if (!D.hasSprite(name)) return err(`house sprite "${name}" is listed but not registered (Draw3.registerSprite)`);
    optsSets(list, `sprite ${name}`).forEach((o) => {
      const what = (current = `house sprite ${name} ${JSON.stringify(o)}`);
      let c;
      try {
        c = D.sprite(name, o);
      } catch (e) {
        return err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
      }
      if (!c || !(c.width > 0) || !(c.height > 0)) return err(`${what}: no image`);
      if (!c.ops) return;
      houseDrawn++;
      if (c.ops.length < 12) err(`${what}: draws almost nothing (${c.ops.length} calls)`);
      delete c.ops;
    });
  });
  if (!Array.isArray(HOUSE.floors) || !HOUSE.floors.length) err("HOUSE_ART.floors lists no floors");
  (HOUSE.floors || []).forEach((name) => {
    if (D.floorId(name) < 0) return err(`house floor "${name}" is listed but not registered (Draw3.registerFloor)`);
    [false, true].forEach((ceiling) => {
      const what = (current = `house ${ceiling ? "ceiling" : "floor"} ${name}`);
      lastCanvas = null;
      let t;
      try {
        t = D.floorTexels(name, pal, ceiling);
      } catch (e) {
        return err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
      }
      if (!Array.isArray(t) || t.length !== D.SHADES || !t.every((a) => a && a.length === 4096)) err(`${what}: not ${D.SHADES} shades of 64 x 64 pixels`);
      const c = lastCanvas;
      if (!c || !c.ops) return err(`${what}: drew on no canvas`);
      houseDrawn++;
      if (c.width !== 64 || c.height !== 64) err(`${what}: not 64 x 64`);
      if (!startsOpaque(c.ops)) err(`${what}: does not start by filling the whole tile with a solid color (floors are cast as raw pixels)`);
      if (c.ops.length < 12) err(`${what}: draws almost nothing (${c.ops.length} calls)`);
      delete c.ops;
    });
  });
}

/* ---------- The crew (js/crewart.js): everything ZSR.CREW_ART lists, with every opts set ---------- */
const CREW = ZSR.CREW_ART;
let crewDrawn = 0;
if (!CREW || !CREW.sprites) err(`js/${CREW_FILE} does not export ZSR.CREW_ART { sprites: { ${CREW_SPRITES.join(", ")} } }`);
else {
  CREW_SPRITES.forEach((name) => CREW.sprites[name] || err(`CREW_ART.sprites does not list "${name}" (the game draws it)`));
  Object.entries(CREW.sprites).forEach(([name, list]) => {
    if (!D.hasSprite(name)) return err(`crew sprite "${name}" is listed but not registered (Draw3.registerSprite)`);
    if (!Array.isArray(list) || !list.length) return err(`CREW_ART ${name}: no opts sets (list [{}] for none)`);
    const size = CREW.size && CREW.size[name];
    list.forEach((o) => {
      if (!o || typeof o !== "object" || Array.isArray(o)) return err(`CREW_ART ${name}: opts ${JSON.stringify(o)} is not an object`);
      const what = (current = `crew sprite ${name} ${JSON.stringify(o)}`);
      let c;
      try {
        c = D.sprite(name, o);
      } catch (e) {
        return err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
      }
      if (!c || !(c.width > 0) || !(c.height > 0)) return err(`${what}: no image`);
      if (size && (c.width !== size[0] || c.height !== size[1])) err(`${what}: ${c.width} x ${c.height}, CREW_ART.size says ${size[0]} x ${size[1]}`);
      if (!c.ops) return;
      crewDrawn++;
      if (c.ops.length < 12) err(`${what}: draws almost nothing (${c.ops.length} calls)`);
      delete c.ops;
    });
  });
  // a crew figure is drawn on its own canvas (CREW_ART.size.crew, 192 x 256: PERSON_TOP in js/crewart.js is measured in
  // it; drawn wide 0.75), and a portrait is square
  const crewImg = D.hasSprite("crew") && D.sprite("crew", (CREW.sprites.crew || [{}])[0]);
  if (crewImg && (crewImg.width !== 192 || crewImg.height !== 256)) err(`crew sprite is ${crewImg.width} x ${crewImg.height}; it must be 192 x 256 (the figure canvas PERSON_TOP is measured in)`);
  const face = D.hasSprite("crewFace") && D.sprite("crewFace", (CREW.sprites.crewFace || [{}])[0]);
  if (face && face.width !== face.height) err(`crewFace is ${face.width} x ${face.height}; the crew card wants a square`);
  // the list covers every crew member in every pose and frame, the dog in every pose and frame
  const has = (name, o) => (CREW.sprites[name] || []).some((x) => Object.keys(o).every((k) => x[k] === o[k]));
  const frames = CREW.frames || 2;
  (CREW.who || []).forEach((who) => {
    (CREW.poses || []).forEach((pose) => {
      for (let f = 0; f < frames; f++) has("crew", { who, pose, f }) || err(`CREW_ART.sprites.crew does not list ${JSON.stringify({ who, pose, f })}`);
    });
    has("crewFace", { who }) || err(`CREW_ART.sprites.crewFace does not list ${JSON.stringify({ who })}`);
  });
  (CREW.dogPoses || []).forEach((pose) => {
    for (let f = 0; f < frames; f++) has("crewDog", { pose, f }) || err(`CREW_ART.sprites.crewDog does not list ${JSON.stringify({ pose, f })}`);
  });
  (CREW.kinds || []).forEach((kind) => has("qObj", { kind }) || err(`CREW_ART.sprites.qObj does not list ${JSON.stringify({ kind })}`));
  if (!Number.isInteger(CREW.frames) || CREW.frames < 1) err(`CREW_ART.frames is ${CREW.frames}: the number of frames (f 0 .. frames - 1) every pose has`);
  CREW_POSES.forEach((pose) => (CREW.poses || []).includes(pose) || err(`CREW_ART.poses lacks "${pose}" (docs/CREW.md: posts stand, sit, work or read; walk between them)`));
  QUEST_KINDS.forEach((kind) => (CREW.kinds || []).includes(kind) || err(`CREW_ART.kinds lacks the quest object kind "${kind}" (docs/CREW.md)`));
  ["crew", "crewDog", "qObj"].forEach((name) => {
    const v = CREW.scale && CREW.scale[name];
    if (!(typeof v === "number" && v > 0 && v <= 1)) err(`CREW_ART.scale.${name} is ${v}: the prop scale the runtime draws it at (0 to 1 tiles)`);
  });
  // a crew id, pose, dog pose or kind the art does not know yet (a fact added before its art) still draws
  // a plain stand-in, never nothing and never a throw
  [["crew", { who: "zz-new", pose: "stand", f: 0 }], ["crew", { who: (CREW.who || [])[0], pose: "zz-new", f: 1 }], ["crewDog", { pose: "zz-new", f: 0 }], ["crewFace", { who: "zz-new" }], ["qObj", { kind: "zz-new" }]].forEach(([name, o]) => {
    if (!D.hasSprite(name)) return;
    current = `crew stand-in ${name} ${JSON.stringify(o)}`;
    let c;
    try {
      c = D.sprite(name, o);
    } catch (e) {
      return err(`${current}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
    }
    if (!c || !c.ops || c.ops.length < 12) err(`${current}: draws ${c && c.ops ? c.ops.length : 0} calls, not a stand-in`);
    else delete c.ops;
  });
  // every crew member, post pose and quest object kind in the facts has its art (the facts load in their
  // own sandbox; a facts file that does not load is validate-world.js's to report)
  const fsb = { console };
  fsb.globalThis = fsb;
  fsb.window = fsb;
  vm.createContext(fsb);
  let factsOk = true;
  // the fact files in page order: js/layouts.js, js/world.js and every js/story*.js the page loads (a split fact file,
  // story-quests2.js, is checked too; tests/validate-world.js reads the same list)
  pageScripts.filter((f) => /^(layouts|world|story[\w-]*)\.js$/.test(f)).forEach((f) => {
    if (!factsOk) return;
    try {
      vm.runInContext(fs.readFileSync(path.join(ROOT, "js", f), "utf8"), fsb, { filename: "js/" + f });
    } catch (e) {
      factsOk = false;
      warn(`could not load js/${f} to check the crew art against the facts: ${String(e.message).split("\n")[0]}`);
    }
  });
  const WD = (fsb.ZSR && fsb.ZSR.WORLD) || {};
  if (factsOk && WD.CREW) {
    Object.entries(WD.CREW).forEach(([id, c]) => {
      if (!(CREW.who || []).includes(id)) err(`crew member "${id}" (CREW) has no art in js/${CREW_FILE} (CREW_ART.who)`);
      ((c && c.posts) || []).forEach((p) => p && p.pose && !(CREW.poses || []).includes(p.pose) && err(`crew ${id} post ${p.id}: pose "${p.pose}" has no art (CREW_ART.poses)`));
    });
    // the portrait tints its panel with the facts' CREW[id].color (on the page the facts load first):
    // draw each one again with the facts in place (an extra opts key, so the cache does not hand back the first)
    if (D.hasSprite("crewFace")) {
      const hadWorld = Object.prototype.hasOwnProperty.call(ZSR, "WORLD");
      const world = ZSR.WORLD;
      ZSR.WORLD = WD;
      Object.keys(WD.CREW).forEach((who) => {
        current = `crewFace ${JSON.stringify({ who })} with the facts' color ${JSON.stringify(WD.CREW[who] && WD.CREW[who].color)}`;
        try {
          const c = D.sprite("crewFace", { who, withFacts: true });
          if (!c || !c.ops || c.ops.length < 12) err(`${current}: draws almost nothing`);
          else delete c.ops;
        } catch (e) {
          err(`${current}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
        }
      });
      if (hadWorld) ZSR.WORLD = world;
      else delete ZSR.WORLD;
    }
  }
  if (factsOk && Array.isArray(WD.QUESTS)) {
    WD.QUESTS.forEach((q) => {
      const art = q && q.object && q.object.art;
      if (art && !(CREW.kinds || []).includes(art)) err(`quest ${q.id}: object art "${art}" is not a quest object kind (CREW_ART.kinds: ${(CREW.kinds || []).join(", ")})`);
    });
  }
}

/* ---------- The guns in hand with their mods (live and at rest), their floor icons and tab views ---------- */
let guns = 0;
const MOD_SETS = [0, 1, 2, 3].map((n) => ({ damage: n, range: n, rate: n, aim: n })).concat([{ damage: 3 }, { range: 2, aim: 1 }, { rate: 3, aim: 3 }]);
const MOTION = [{}, { bob: 2.1 }, { flash: 0.08, flashL: 0.08, flashR: 0.03, draw: 0.7, raise: 0.4, bob: 1 }, { draw: 1, loaded: false }];
Object.keys(D.POSES || {}).forEach((id) => {
  MOD_SETS.forEach((mods) => {
    MOTION.forEach((o) => {
      const what = (current = `gun ${id} ${JSON.stringify(mods)} ${JSON.stringify(o)}`);
      const c = element("canvas");
      c.width = 1280;
      c.height = 720;
      try {
        D.gun(c.getContext("2d"), 1280, 720, Object.assign({ weapon: id, mods }, o));
        guns++;
      } catch (e) {
        err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
      }
    });
  });
  try {
    current = `weapon icon ${id}`;
    const icon = D.weaponIcon(id);
    if (!icon || !(icon.width > 0)) err(`${current}: no image`);
    current = `weapon view ${id}`;
    const view = D.weaponView(id, { damage: 3, range: 3, rate: 3, aim: 3 }, 320, 180);
    if (!view || view.width !== 320 || view.height !== 180) err(`${current}: not a 320 x 180 picture`);
  } catch (e) {
    err(`${current}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
  }
});
if (!guns) err("js/sprites3d.js: no guns to draw (Draw3.POSES)");
// the barrel in hand points at the crosshair: the line from the muzzle along the bore passes through the
// screen's centre (the shot goes there), on a wide and a tall view
Object.keys(D.POSES || {}).forEach((id) => {
  [[1280, 720], [720, 1280]].forEach(([w, h]) => {
    (D.muzzleLine ? D.muzzleLine(id, w, h) : []).forEach(({ m, ahead }) => {
      const dx = ahead[0] - m[0];
      const dy = ahead[1] - m[1];
      const len = Math.hypot(dx, dy) || 1;
      const miss = Math.abs(dx * (h / 2 - m[1]) - dy * (w / 2 - m[0])) / len; // centre's distance from the bore's line
      const toward = dx * (w / 2 - m[0]) + dy * (h / 2 - m[1]) > 0;
      if (miss > 1.5 || !toward) err(`gun ${id} on ${w} x ${h}: the barrel points ${Math.round(miss)} px off the crosshair`);
    });
  });
});

/* ---------- The walkers (js/walker3d.js + looks): live 3D figures drawn straight into a region ---------- */
const W3 = ZSR.Walker3D;
let walkerDraws = 0;
if (!W3) err("js/walker3d.js does not export ZSR.Walker3D");
else {
  const PI = Math.PI;
  // the walker ids: walker, runner, brute and every id in the facts (WORLD.WALKER_TYPES, when the facts have it)
  const wsb = { console };
  wsb.globalThis = wsb;
  wsb.window = wsb;
  vm.createContext(wsb);
  pageScripts.filter((f) => /^(layouts|world)\.js$/.test(f)).forEach((f) => {
    try {
      vm.runInContext(fs.readFileSync(path.join(ROOT, "js", f), "utf8"), wsb, { filename: "js/" + f });
    } catch (e) {
      warn(`could not load js/${f} to check the walker looks against the facts: ${String(e.message).split("\n")[0]}`);
    }
  });
  const factTypes = Object.keys((wsb.ZSR && wsb.ZSR.WORLD && wsb.ZSR.WORLD.WALKER_TYPES) || {});
  const ids = [...new Set(["walker", "runner", "brute"].concat(factTypes))];
  ids.forEach((id) => W3.TYPES[id] || err(`walker type "${id}" has no look (Walker3D.addType in js/walker3d-looks.js)`));
  const types = Object.keys(W3.TYPES);
  ["FALL_SECS", "COLLAPSE_SECS", "FADE_SECS", "BITE_SECS", "SCREAM_SECS"].forEach((k) => (finite(W3[k]) && W3[k] > 0) || err(`Walker3D.${k} is ${W3[k]}`));
  if (!(W3.COLLAPSE_SECS + W3.FADE_SECS <= W3.FALL_SECS)) err(`Walker3D: COLLAPSE_SECS + FADE_SECS (${W3.COLLAPSE_SECS + W3.FADE_SECS}) must fit in FALL_SECS (${W3.FALL_SECS})`);
  ["idle", "walk", "bite", "claw", "scream"].forEach((p) => (W3.POSES || []).includes(p) || err(`Walker3D.POSES lacks "${p}"`));
  if (typeof W3.gore() !== "boolean") err("Walker3D.gore() is not a boolean");
  // boxes and strides: finite, sane, the same object handed back each time (the engine calls them every frame)
  types.concat(["zz-new"]).forEach((t) => {
    [false, true].forEach((falling) => {
      const b = W3.box(t, falling);
      const what = `Walker3D.box("${t}", ${falling})`;
      if (!b || !["h", "w", "head", "bar"].every((k) => finite(b[k]) && b[k] > 0)) return err(`${what} is ${JSON.stringify(b)}`);
      if (b.h > WALKER_H_MAX) err(`${what}.h is ${b.h}: over ${WALKER_H_MAX} tiles`);
      if (b.head > b.h + 1e-9) err(`${what}.head ${b.head} is over its height ${b.h}`);
      if (falling && b.w < 2 * b.h) err(`${what}.w ${b.w} cannot hold the body lying on its side (2 h = ${2 * b.h})`);
      if (b !== W3.box(t, falling)) err(`${what} makes a new object each call`);
      // the health bar is about the hit width on screen (2 r 1.1 / STRETCH) and the region holds it
      const r = (W3.TYPES[t] || W3.TYPES.walker).r;
      if (W3.TYPES[t] && !(b.bar > r && b.bar < 2.4 * r)) err(`${what}.bar ${b.bar.toFixed(3)} does not match the hit radius ${r}`);
      if (b.w < b.bar) err(`${what}.w ${b.w} is narrower than its health bar ${b.bar}`);
    });
    const s = W3.stride(t);
    if (!(finite(s) && s > 0)) err(`Walker3D.stride("${t}") is ${s}`);
    const T = W3.TYPES[t];
    if (T && !(finite(T.gait.clawRate) && T.gait.clawRate > 0 && finite(T.gait.turnRate) && T.gait.turnRate > 0)) err(`walker type ${t}: gait.clawRate and gait.turnRate must be above 0 (the engine reads them)`);
  });
  // every blood sprite is registered with Draw3 and draws
  Object.keys(W3.SPRITES || {}).forEach((name) => {
    if (!D.hasSprite(name)) return err(`Walker3D.SPRITES.${name} is not registered (Draw3.registerSprite)`);
    current = `walker sprite ${name}`;
    try {
      const c = D.sprite(name, {});
      if (!c || !(c.width > 0) || !(c.height > 0)) err(`${current}: no image`);
      else if (c.ops && c.ops.length < 4) err(`${current}: draws almost nothing (${c.ops.length} calls)`);
    } catch (e) {
      err(`${current}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
    }
  });
  ["bloodDrop", "bloodSplat"].forEach((n) => (W3.SPRITES || {})[n] || err(`Walker3D.SPRITES lacks ${n} (the engine's blood spray draws it)`));

  // the draws
  const FORBID = new Set(["translate", "scale", "rotate", "setTransform", "transform", "drawImage", "resetTransform", "set shadowBlur", "set filter", "createLinearGradient", "createRadialGradient", "createPattern", "getImageData", "putImageData"]);
  const parse = (c) => {
    const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/.exec(typeof c === "string" ? c : "");
    return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null;
  };
  const base = { yaw: 0, gait: 0.3, move: 1, pose: "walk", poseT: 0.5, claw: 0.3, hit: 0, fall: 0, fallDir: PI, seed: 0, lod: 0, fog: 0, gore: true };
  let made = 0;
  const realCreate = sb.document.createElement;
  sb.document.createElement = (t) => {
    made++;
    return realCreate(t);
  };
  /** Draw one figure on a fresh checking canvas; returns { ops, res } or null (after reporting). ceil: the call
      ceilings by lod (WALKER_OPS unless given). */
  function drawOne(type, o, cam, what, ceil) {
    const c = element("canvas");
    c.width = cam.w;
    c.height = cam.h;
    const ctx = c.getContext("2d");
    const st = Object.assign({}, base, o);
    current = what;
    const before = made;
    noRead = true;
    let res;
    try {
      res = W3.draw(ctx, type, st, cam);
    } catch (e) {
      noRead = false;
      err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
      return null;
    }
    noRead = false;
    walkerDraws++;
    if (made !== before) err(`${what}: made ${made - before} canvas(es) while drawing`);
    if (!res || typeof res.face !== "boolean" || !finite(res.parts)) err(`${what}: draw() returned ${JSON.stringify(res)}, not { face, parts }`);
    const ops = c.ops;
    const lod = st.lod;
    const min = lod === 2 ? 10 : 20;
    if (ops.length < min) err(`${what}: only ${ops.length} canvas calls`);
    const ceiling = (ceil || WALKER_OPS)[lod === 1 || lod === 2 ? lod : 0];
    if (ops.length > ceiling) err(`${what}: ${ops.length} canvas calls, over the lod ${lod} ceiling of ${ceiling}`);
    const bad = ops.find((op) => FORBID.has(op.k));
    if (bad) err(`${what}: calls ${bad.k} (walkers draw straight, with no transforms, images, gradients or read-backs)`);
    // inside the region (a camera nearer than a tile may push a reaching hand past it)
    if (cam.dist >= 1) {
      let worst = null;
      const out = (x, y, r, lw, k, ry) => {
        const m = 2 + lw / 2;
        const rh = ry == null ? r : ry;
        if (x - r < -m || x + r > cam.w + m || y - rh < -m || y + rh > cam.h + m) worst = worst || `${k} at ${x.toFixed(1)}, ${y.toFixed(1)} (r ${r.toFixed(1)}, ${rh.toFixed(1)}) outside ${cam.w} x ${cam.h}`;
      };
      ops.forEach((op) => {
        const a = op.args;
        if (op.k === "moveTo" || op.k === "lineTo") out(a[0], a[1], 0, op.lineWidth, op.k);
        else if (op.k === "quadraticCurveTo") {
          out(a[0], a[1], 0, op.lineWidth, op.k);
          out(a[2], a[3], 0, op.lineWidth, op.k);
        } else if (op.k === "bezierCurveTo") for (let i = 0; i < 6; i += 2) out(a[i], a[i + 1], 0, op.lineWidth, op.k);
        else if (op.k === "arc") out(a[0], a[1], a[2], op.lineWidth, op.k);
        else if (op.k === "ellipse") {
          // the rotated ellipse's own reach across and down
          const c = Math.cos(a[4]);
          const sn = Math.sin(a[4]);
          out(a[0], a[1], Math.hypot(a[2] * c, a[3] * sn), op.lineWidth, op.k, Math.hypot(a[2] * sn, a[3] * c));
        }
        else if (op.k === "fillRect" || op.k === "strokeRect" || op.k === "rect") {
          out(a[0], a[1], 0, op.lineWidth, op.k);
          out(a[0] + a[2], a[1] + a[3], 0, op.lineWidth, op.k);
        }
      });
      if (worst) err(`${what}: draws outside its region: ${worst}`);
    }
    // gore off: nothing strong red
    if (st.gore === false) {
      const red = ops.find((op) => {
        const c = parse(op.k === "stroke" ? op.strokeStyle : op.k === "fill" ? op.fillStyle : null);
        return c && c[0] > 120 && c[1] < 60 && c[2] < 60;
      });
      if (red) err(`${what}: gore is off but it paints ${red.k === "stroke" ? red.strokeStyle : red.fillStyle}`);
    }
    return { ops, res };
  }
  const camFor = (type, falling, h, dist) => {
    const b = W3.box(type, falling);
    const px = h / b.h;
    return { w: Math.ceil(b.w * px), h, px, dist: dist || 3, eye: 0.5 };
  };
  const lowest = (ops) => {
    let y = -Infinity;
    ops.forEach((op) => {
      const a = op.args;
      if (op.k === "moveTo" || op.k === "lineTo") y = Math.max(y, a[1] + (op.lineWidth || 0) / 2);
    });
    return y;
  };
  const sig = (ops) => JSON.stringify(ops.map((op) => [op.k, op.args, op.fillStyle, op.strokeStyle, op.lineWidth, op.globalAlpha]));
  types.forEach((type) => {
    const nv = W3.TYPES[type].looks ? W3.TYPES[type].looks.length : 1;
    // A: every pose, from 8 sides, at every level of detail, each look
    for (let seed = 0; seed < Math.max(2, nv); seed++) {
      W3.POSES.forEach((pose) => {
        for (let k = 0; k < 8; k++) {
          for (let lod = 0; lod < 3; lod++) {
            const yaw = (k * PI) / 4 - PI;
            const o = { pose, yaw, lod, seed, move: pose === "walk" ? 1 : 0 };
            const cam = camFor(type, false, 300);
            const what = `walker ${type} ${pose} yaw ${yaw.toFixed(2)} lod ${lod} seed ${seed}`;
            const r = drawOne(type, o, cam, what);
            if (!r) continue;
            if ((pose === "idle" || pose === "walk") && lowest(r.ops) < 0.94 * cam.h) err(`${what}: its feet do not reach the bottom (lowest point ${lowest(r.ops).toFixed(1)} of ${cam.h})`);
            if (k === 4 && !r.res.face) err(`${what}: facing the camera, draw() says no face`);
            if (k === 0 && r.res.face) err(`${what}: facing away, draw() says it drew a face`);
            if (lod === 0 && (k & 1) === 0) {
              const again = drawOne(type, o, cam, what + " (again)");
              if (again && sig(again.ops) !== sig(r.ops)) err(`${what}: the same inputs drew different calls`);
            }
          }
        }
      });
    }
    // B: through the walk cycle, front and side, half and full stride
    for (let g = 0; g < 8; g++) {
      [0, PI / 2].forEach((yaw) => {
        [0.5, 1].forEach((move) => {
          const what = `walker ${type} walk gait ${g / 8} yaw ${yaw.toFixed(2)} move ${move}`;
          const cam = camFor(type, false, 300);
          const r = drawOne(type, { gait: g / 8, yaw, move }, cam, what);
          if (r && lowest(r.ops) < 0.94 * cam.h) err(`${what}: its feet do not reach the bottom`);
        });
      });
    }
    // C: hit, falling (four ways), gore on and off, from four sides
    [0, PI / 2, -PI / 2, PI].forEach((yaw) => {
      [true, false].forEach((gore) => {
        drawOne(type, { yaw, gore, hit: 1 }, camFor(type, false, 300), `walker ${type} hit yaw ${yaw.toFixed(2)} gore ${gore}`);
        [0.25, 0.6].forEach((fall) => drawOne(type, { yaw, gore, fall }, camFor(type, true, 300), `walker ${type} fall ${fall} yaw ${yaw.toFixed(2)} gore ${gore}`));
        [0, PI / 2, PI, -PI / 2].forEach((fallDir) => drawOne(type, { yaw, gore, fall: 1, fallDir }, camFor(type, true, 300), `walker ${type} fallen dir ${fallDir.toFixed(2)} yaw ${yaw.toFixed(2)} gore ${gore}`));
      });
    });
    // D: tiny to large regions, near and far cameras, clear and fogged; fog darkens everything but the eyes
    [[12, 16], [90, 120], [400, 520]].forEach(([w, h]) => {
      [0.4, 2, 25].forEach((dist) => {
        const b = W3.box(type, false);
        const cam = { w, h, px: h / b.h, dist, eye: 0.5 };
        const what = `walker ${type} in ${w} x ${h} at ${dist} tiles`;
        const clear = drawOne(type, { yaw: 0.6, fog: 0 }, cam, what + " fog 0");
        const fog = drawOne(type, { yaw: 0.6, fog: 0.9 }, cam, what + " fog 0.9");
        if (!clear || !fog) return;
        if (clear.ops.length !== fog.ops.length) return err(`${what}: fog changed what is drawn (${clear.ops.length} vs ${fog.ops.length} calls)`);
        let darker = 0;
        let colored = 0;
        for (let i = 0; i < clear.ops.length; i++) {
          const k = clear.ops[i].k;
          if (k !== "fill" && k !== "stroke") continue;
          const a = parse(k === "fill" ? clear.ops[i].fillStyle : clear.ops[i].strokeStyle);
          const z = parse(k === "fill" ? fog.ops[i].fillStyle : fog.ops[i].strokeStyle);
          if (!a || !z) continue;
          colored++;
          if (z[0] > a[0] + 1 || z[1] > a[1] + 1 || z[2] > a[2] + 1) return err(`${what}: fog 0.9 made ${k} ${a.join(",")} lighter (${z.join(",")})`);
          if (z[0] + z[1] + z[2] < (a[0] + a[1] + a[2]) * 0.5) darker++;
        }
        if (darker < colored * 0.7) err(`${what}: fog 0.9 darkened only ${darker} of ${colored} colours`);
      });
    });
    // E: through a bite, a pair of claw swipes and a scream
    ["bite", "claw", "scream"].forEach((pose) => {
      [0, 0.25, 0.75, 1].forEach((t) => drawOne(type, { pose, poseT: t, claw: t, move: 0, yaw: 0.4 }, camFor(type, false, 300), `walker ${type} ${pose} at ${t}`));
    });
  });
  // a type the looks do not know draws as a walker, never throws
  drawOne("zz-new", {}, camFor("walker", false, 200), "walker of an unknown type");

  // F: the ground is seen in perspective: the contact shadow and (gore on) the pool under a downed walker are discs on
  // the floor, not one-pixel lines. The first fills are the ground's: the shadow, then the pool (its colour is red).
  const groundFills = (ops) => {
    const out = [];
    let ell = null;
    for (const op of ops) {
      if (op.k === "beginPath") ell = null;
      else if (op.k === "ellipse") ell = op.args;
      else if (op.k === "fill") {
        out.push({ ell, fill: parse(op.fillStyle) });
        if (out.length >= 3) break;
      }
    }
    return out;
  };
  types.forEach((type) => {
    [0, PI / 2, PI].forEach((yaw) => {
      const what = `walker ${type} yaw ${yaw.toFixed(2)}`;
      const stand = drawOne(type, { yaw }, camFor(type, false, 300), what + " standing (ground)");
      const sh = stand && groundFills(stand.ops)[0];
      if (stand && (!sh || !sh.ell || Math.min(sh.ell[2], sh.ell[3]) < 2 || Math.max(sh.ell[2], sh.ell[3]) < 10)) err(`${what}: its ground shadow is ${sh && sh.ell ? sh.ell[2].toFixed(1) + " x " + sh.ell[3].toFixed(1) : "missing"} px at 300 px tall (a flat line, not a disc on the floor)`);
      [PI, 0].forEach((fallDir) => {
        const r = drawOne(type, { yaw, fall: 1, fallDir, gore: true }, camFor(type, true, 300), `${what} fallen dir ${fallDir.toFixed(2)} (pool)`);
        if (!r) return;
        const pool = groundFills(r.ops).find((f) => f.fill && f.fill[0] > 2 * f.fill[1] && f.fill[0] > 60);
        if (!pool || !pool.ell) err(`${what} fallen dir ${fallDir.toFixed(2)}: no blood pool under it with gore on`);
        else if (Math.min(pool.ell[2], pool.ell[3]) < 3 || Math.max(pool.ell[2], pool.ell[3]) < 20) err(`${what} fallen dir ${fallDir.toFixed(2)}: its blood pool is ${pool.ell[2].toFixed(1)} x ${pool.ell[3].toFixed(1)} px at 300 px tall (it must read as a pool, at least 20 x 3)`);
      });
    });
  });

  // the tests below read the joints and the fit back through Walker3D.probe() (for the tests only): its j and s are
  // the live joint buffers; its fit is the last draw's when probe() is called
  const noop = () => {};
  const quiet = new Proxy({}, { get: () => noop, set: () => true });
  if (typeof W3.probe !== "function") err("Walker3D.probe() is missing (the art tests read the joints and the fit through it)");
  else {
    const PB = W3.probe();
    const stQ = (o) => Object.assign({}, base, o);
    // G: smooth walk cycles: through 200 gait steps, no boot, toe or hand jumps more than 4 x its usual step (+ 1 px);
    // running too (st.run, the angled road's walkers keeping up with the van)
    const LIMBS = { "left hand": 6, "right hand": 9, "left ankle": 12, "left toe": 13, "right ankle": 16, "right toe": 17 };
    types.forEach((type) => {
      [PI / 2, 0.4].forEach((yaw) => {
        [[0, 0], [1, 0], [0, 1]].forEach(([seed, run]) => {
          const cam = camFor(type, false, 160);
          const steps = {};
          let prev = null;
          for (let i = 0; i <= 200; i++) {
            W3.draw(quiet, type, stQ({ yaw, seed, run, gait: i / 200, move: 1 }), cam);
            const now = Array.from(PB.s);
            if (prev) Object.entries(LIMBS).forEach(([n, j]) => (steps[n] = steps[n] || []).push(Math.hypot(now[j * 3] - prev[j * 3], now[j * 3 + 1] - prev[j * 3 + 1])));
            prev = now;
          }
          Object.entries(steps).forEach(([n, a]) => {
            const sorted = a.slice().sort((x, y) => x - y);
            const med = sorted[sorted.length >> 1];
            const max = sorted[sorted.length - 1];
            if (max > 4 * med + 1) err(`walker ${type} yaw ${yaw.toFixed(2)} seed ${seed}${run ? " running" : ""}: its ${n} jumps ${max.toFixed(1)} px in one step of the walk cycle (its usual step is ${med.toFixed(2)} px at 160 px tall): a snap`);
          });
        });
      });
    });
    // H: the size never follows the swing: at 0.85 tiles (biting range) the fit is the same through bites, claw swipes,
    // a scream, the walk and idle, and through a pose blending in (poseW)
    types.forEach((type) => {
      [0, 0.3, -0.3, PI / 2].forEach((yaw) => {
        let lo = Infinity;
        let hi = 0;
        const b = W3.box(type, false);
        const cam = { w: Math.ceil((b.w * 300) / b.h), h: 300, px: 300 / b.h, dist: 0.85, eye: 0.5 };
        ["bite", "claw", "scream", "walk", "idle"].forEach((pose) => {
          for (let i = 0; i <= 20; i++) {
            [1, 0.5].forEach((poseW) => {
              W3.draw(quiet, type, stQ({ yaw, pose, poseT: i / 20, claw: i / 20, gait: i / 20, move: pose === "walk" ? 1 : 0.3, poseW }), cam);
              const fit = W3.probe().fit; // probe() reads the fit of the last draw
              lo = Math.min(lo, fit);
              hi = Math.max(hi, fit);
            });
          }
        });
        if (hi / lo - 1 > 0.03) err(`walker ${type} yaw ${yaw.toFixed(2)} at 0.85 tiles: its size changes ${((hi / lo - 1) * 100).toFixed(1)}% with the pose (fit ${lo.toFixed(3)}..${hi.toFixed(3)}): it would pulse as it attacks`);
      });
    });
    // I: the same inputs draw the same even with other walkers drawn in between (no state leaks from one draw to the next)
    for (let k = 0; k < types.length; k++) {
      const a = types[k];
      const bT = types[(k + 1) % types.length];
      const sa = { yaw: 0.7, gait: 0.37, pose: "claw", claw: 0.6, seed: 3, lod: k % 3, fog: 0.2 };
      const camA = camFor(a, false, 240);
      const one = drawOne(a, sa, camA, `walker ${a} (determinism, first)`);
      drawOne(bT, { yaw: -2, gait: 0.9, pose: "bite", poseT: 0.4, seed: 8, lod: (k + 1) % 3, fog: 0.7, hit: 1, fall: 0.5, fallDir: 1 }, camFor(bT, true, 120, 1.2), `walker ${bT} (determinism, between)`);
      const two = drawOne(a, sa, camA, `walker ${a} (determinism, again)`);
      if (one && two && sig(one.ops) !== sig(two.ops)) err(`walker ${a}: drawing a ${bT} in between changed how the same ${a} draws`);
    }
    // J: a downed walker lies flat: at fall 1 no ankle above its pelvis plus a thigh's thickness (a side-lying body's
    // upper leg may stack its foot spacing on top)
    types.forEach((type) => {
      const bd = W3.TYPES[type].build;
      [0, PI, PI / 2, -PI / 2, 2.5].forEach((fallDir) => {
        ["walk", "claw", "idle"].forEach((pose) => {
          [0.1, 0.6].forEach((gait) => {
            W3.draw(quiet, type, stQ({ yaw: 0, fall: 1, fallDir, pose, gait, move: 1 }), camFor(type, true, 200));
            const J = PB.j;
            const side = Math.abs(Math.sin(fallDir)) > 0.3 ? 2 * bd.footW : 0;
            const top = J[1] + bd.rThigh + side;
            const an = Math.max(J[12 * 3 + 1], J[16 * 3 + 1]);
            if (an > top + 1e-6) err(`walker ${type} fallen dir ${fallDir.toFixed(2)} ${pose} gait ${gait}: an ankle at ${an.toFixed(3)} is above its pelvis (${J[1].toFixed(3)}): legs in the air`);
          });
        });
      });
    });
    // J2: a head whose face is toward the floor shows no face from any side, and goes by its real depth (lying away
    // from you the body covers it: drawn after the torso it would sit between the boots, the open mouth showing).
    // Toward the floor: its forward points below Walker3D.FACE_DOWN, or below FACE_DOWN_LYING once the body lies flat
    // (its head is on the floor then). probe().faceDown is that call
    let faceDown = 0;
    types.forEach((type) => {
      [0, PI, PI / 2, 2.5].forEach((fallDir) => {
        [0.4, 0.7, 1].forEach((fall) => {
          for (let k = 0; k < 8; k++) {
            const yaw = (k * PI) / 4;
            const res = W3.draw(quiet, type, stQ({ yaw, fall, fallDir, pose: "idle", move: 0 }), camFor(type, true, 200, 1.6));
            const P = W3.probe();
            const what = `walker ${type} falling ${fall} dir ${fallDir.toFixed(2)} yaw ${yaw.toFixed(2)}`;
            const down = PB.hf[7] < W3.FACE_DOWN || (P.lying >= 1 && PB.hf[7] < W3.FACE_DOWN_LYING);
            if (down && !P.faceDown) err(`${what}: its head points down (${PB.hf[7].toFixed(2)}, lying ${P.lying.toFixed(2)}) yet it does not count as face down`);
            if (!P.faceDown) continue;
            faceDown++;
            if (res.face || !P.headBack) err(`${what}: its face is toward the floor (forward ${PB.hf[7].toFixed(2)}) yet ${res.face ? "draws a face" : "is not drawn by its real depth"}`);
          }
        });
      });
    });
    if (!faceDown) err("walker falls: no fall ever puts a head face down (the check above checked nothing)");
    // J2b: shot in the back, every kind goes down on its front and its face is hidden whatever its fall style (a
    // lanky's fold and a runner's tumble end with the head tucked back under, forward about -0.6 and toward its feet):
    // seen from behind, from either side and three-quarters behind, no face, in every look and a few more seeds
    types.forEach((type) => {
      const nv = W3.TYPES[type].looks ? W3.TYPES[type].looks.length : 1;
      for (let seed = 0; seed < Math.max(8, nv); seed++) {
        [[PI, "behind"], [PI / 2, "from its left"], [-PI / 2, "from its right"], [0.75 * PI, "3/4 behind left"], [-0.75 * PI, "3/4 behind right"]].forEach(([yaw, side]) => {
          const res = W3.draw(quiet, type, stQ({ yaw, fall: 1, fallDir: 0, pose: "idle", move: 0, seed }), camFor(type, true, 200, 1.6));
          const P = W3.probe();
          if (res.face) err(`walker ${type} seed ${seed} shot in the back, lying face down, seen ${side}: draws its face (head forward ${PB.hf[7].toFixed(2)})`);
          else if (!P.faceDown) err(`walker ${type} seed ${seed} shot in the back, lying face down, seen ${side}: its head does not count as face down (forward ${PB.hf[7].toFixed(2)})`);
        });
      }
    });
    // J2c: and one shot from the front that lands on its back (its head ends facing up) still shows its face from
    // somewhere (the gate above must not hide every downed face)
    let faceUp = 0;
    types.forEach((type) => {
      for (let seed = 0; seed < 8; seed++) {
        let up = false;
        let seen = false;
        for (let k = 0; k < 8; k++) {
          const res = W3.draw(quiet, type, stQ({ yaw: (k * PI) / 4, fall: 1, fallDir: PI, pose: "idle", move: 0, seed }), camFor(type, true, 200, 1.6));
          if (PB.hf[7] > 0.3) up = true;
          if (res.face) seen = true;
        }
        if (!up) continue;
        faceUp++;
        if (!seen) err(`walker ${type} seed ${seed} shot from the front, lying on its back face up: draws no face from any side`);
      }
    });
    if (!faceUp) err("walker falls: no body shot from the front ever lands face up (the check above checked nothing)");
    // K: missing or broken inputs draw as their defaults (the checking context errs on any non-finite coordinate)
    [{ move: undefined }, { move: NaN }, { fallDir: NaN, fall: 0.6 }, { fallDir: undefined, fall: 0.6 }, { fallDir: null, fall: 1 }, { gait: NaN }, { gait: Infinity }, { poseT: NaN, pose: "bite" }, { claw: NaN, pose: "claw" }, { poseW: NaN, pose: "claw" }, { fall: NaN }, { yaw: NaN }, { fog: NaN }, { seed: -5 }, { lod: 7 }, { pose: "dance" }].forEach((o) =>
      types.forEach((type) => drawOne(type, o, camFor(type, !!o.fall, 200), `walker ${type} with ${JSON.stringify(o, (k, v) => (typeof v === "number" && !Number.isFinite(v) ? String(v) : v === undefined ? "undefined" : v))}`))
    );
    // L: poseW 0 is the walk exactly (a pose change starts where the walk is); fog comes in steps (1 / FOG_STEPS)
    types.forEach((type) => {
      const cam = camFor(type, false, 200);
      W3.draw(quiet, type, stQ({ pose: "walk", gait: 0.4, move: 0.8 }), cam);
      const walk = Array.from(PB.j);
      ["bite", "claw", "scream", "idle"].forEach((pose) => {
        W3.draw(quiet, type, stQ({ pose, gait: 0.4, move: 0.8, poseW: 0, poseT: 0.5, claw: 0.3 }), cam);
        const d = Math.max(...Array.from(PB.j).map((v, i) => Math.abs(v - walk[i])));
        if (d > 1e-9) err(`walker ${type}: ${pose} at poseW 0 is not the walk (a joint is ${d.toFixed(4)} tiles off): the pose would jump in`);
      });
      if (!(W3.FOG_STEPS > 0)) return;
      const f1 = drawOne(type, { fog: 0.3 }, cam, `walker ${type} fog 0.3`);
      const f2 = drawOne(type, { fog: 0.3 + 0.2 / W3.FOG_STEPS }, cam, `walker ${type} fog a little more`);
      if (f1 && f2 && sig(f1.ops) !== sig(f2.ops)) err(`walker ${type}: fog 0.3 and ${(0.3 + 0.2 / W3.FOG_STEPS).toFixed(4)} draw differently (fog must come in steps of 1 / FOG_STEPS, so colours repeat)`);
    });
    // M: the colour table converges: random continuous inputs (yaw, gait, fog, poses, hits, falls) use a bounded set
    // of colour strings, and the last third of the draws adds almost none
    const colours = new Set();
    let late = 0;
    const grab = new Proxy({}, { get: () => noop, set: (o, k, v) => ((k === "fillStyle" || k === "strokeStyle") && !colours.has(v) && (colours.add(v), late += addLate), true) });
    let addLate = 0;
    let seedR = 7;
    const rr = () => ((seedR = (seedR * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const poses = W3.POSES;
    for (let i = 0; i < 3000; i++) {
      if (i === 2000) addLate = 1;
      const type = types[i % types.length];
      W3.draw(grab, type, stQ({ yaw: rr() * 6.3 - 3.15, gait: rr(), fog: rr() * 0.9, pose: poses[i % poses.length], poseT: rr(), claw: rr(), hit: i % 9 === 0 ? 1 : 0, fall: i % 13 === 0 ? rr() : 0, fallDir: rr() * 6.3, lod: i % 3, seed: i % 5, gore: i % 2 === 0 }), camFor(type, false, 120));
    }
    if (colours.size > WALKER_COLOURS) err(`walkers: ${colours.size} different colour strings in 3000 random draws (over ${WALKER_COLOURS}): the colour table cannot hold them, so every draw would make new strings`);
    if (late > colours.size * 0.05) err(`walkers: the last 1000 of 3000 random draws still made ${late} new colours (of ${colours.size}): light or fog is not stepped`);
  }
  // R: seen from above, as the angled road camera sees them (js/perspective.js liveGeo): eyes 5 to 9 tiles up, 2 to
  // 70 tiles off, room under the feet (cam.floor) and no contact shadow (cam.shadow false), in the region the road
  // gives (the box, the margin and how far a part can show over and under the feet from there, running included:
  // envRun). Every kind standing, walking, running (st.run), clawing as it slows from a run, screaming, hit and
  // going over, at every detail, gore on and off: inside the region, finite,
  // within the call ceilings (drawOne); standing, its feet on the floor line, at full size (no shrink); no shadow
  // of its own, the pool still there
  const roadCam = (type, falling, eye, dist, px) => {
    const b = W3.box(type, falling);
    const env = !falling && (W3.TYPES[type].envRun || W3.TYPES[type].env);
    const bw = falling ? b.w : Math.max(b.w, W3.TYPES[type].wRun || 0);
    const reach = env ? env.rh : b.w / 2;
    let above = 0;
    if (env) {
      for (let i = 0; i < env.n; i++) {
        const y = env.top[i] - eye;
        above = Math.max(above, eye + y * (y < 0 ? dist / (dist + env.rho[i]) : dist / Math.max(0.3, dist - env.rho[i])));
      }
    } else above = Math.max(b.h, eye - (eye - b.h) * (dist / (dist + reach)));
    const below = eye * (dist / Math.max(0.3, dist - reach) - 1) + 0.04;
    const pad = 2 + Math.max(0.7, Math.min(3.2, px * 0.0105));
    const up = Math.ceil(above * px + pad);
    let fl = Math.ceil(below * px + pad);
    fl = Math.min(fl, Math.floor(up * 1.5)); // (the engine keeps the floor under 0.6 of the region)
    return { w: Math.ceil(bw * px + 2 * pad), h: up + fl, px, dist, eye, floor: fl, shadow: false };
  };
  let roadCams = 0;
  types.forEach((type) => {
    [5, 7, 9].forEach((eye) => {
      [[2, 90], [5, 70], [12, 40], [30, 18], [70, 8]].forEach(([dist, px]) => {
        [0, 1.2, -2.3, PI].forEach((yaw, yi) => {
          const lod = yi % 3;
          const gore = yi % 2 === 0;
          ["walk", "run", "claw", "run claw", "scream", "idle"].forEach((name) => {
            const run = name === "run" ? 1 : name === "run claw" ? 0.5 : 0;
            const pose = name === "run" ? "walk" : name === "run claw" ? "claw" : name;
            const cam = roadCam(type, false, eye, dist, px);
            const what = `walker ${type} from above (eye ${eye}, ${dist} tiles, ${px} px a tile) ${name} yaw ${yaw.toFixed(2)} lod ${lod}`;
            const r = drawOne(type, { pose, run, poseW: name === "run claw" ? 0.5 : 1, yaw, lod, gore, gait: 0.35, move: pose === "walk" ? 1 : 0.4, poseT: 0.5, claw: 0.4, hit: pose === "idle" ? 1 : 0 }, cam, what);
            roadCams++;
            if (!r) return;
            if (r.ops.some((op) => op.k === "fill" && op.fillStyle === "rgba(0,0,0,0.32)")) err(`${what}: drew its own contact shadow with cam.shadow false`);
            // the road's region holds every pose at full size: nothing shrinks it (no pulsing as it swings)
            if (W3.probe && W3.probe().fit < 0.999) err(`${what}: drawn at ${(W3.probe().fit * 100).toFixed(1)}% size in the road's region (it must have room for every pose)`);
          });
          // standing still in profile (its right toward the camera): each ankle where a camera eye tiles up sees it
          // over the floor line, the near one lower and the far one higher than its middle, at full size
          const cam = roadCam(type, false, eye, dist, px);
          const what = `walker ${type} from above (eye ${eye}, ${dist} tiles) standing in profile`;
          const r = drawOne(type, { pose: "idle", yaw: PI / 2, lod, move: 0 }, cam, what);
          if (r && W3.probe) {
            const P = W3.probe();
            [12, 16].forEach((j) => {
              const k = Math.max(0.6, Math.min(1.6, dist / (dist + P.j[j * 3]))); // its depth is its x, seen from its right
              const want = cam.h - cam.floor - (eye - (eye - P.j[j * 3 + 1]) * k) * px * P.fit;
              if (Math.abs(P.s[j * 3 + 1] - want) > 1) err(`${what}: an ankle is at ${P.s[j * 3 + 1].toFixed(1)}, not ${want.toFixed(1)} (floor line ${cam.h - cam.floor}, region ${cam.w} x ${cam.h})`);
            });
            if (P.fit < 0.999) err(`${what}: drawn at ${(P.fit * 100).toFixed(1)}% size in the road's region (it must have room: no shrink)`);
          }
          [0.3, 0.7, 1].forEach((fall) => {
            [0, PI / 2, PI, -2].forEach((fallDir) => {
              const camF = roadCam(type, true, eye, dist, px);
              const whatF = `walker ${type} from above (eye ${eye}, ${dist} tiles) falling ${fall} dir ${fallDir.toFixed(2)} yaw ${yaw.toFixed(2)}`;
              const rf = drawOne(type, { pose: "walk", yaw, lod, gore, fall, fallDir, move: 1, gait: 0.6 }, camF, whatF);
              roadCams++;
              if (rf && fall === 1 && gore && lod < 2 && !rf.ops.some((op) => op.k === "fill" && parse(op.fillStyle) && parse(op.fillStyle)[0] > 2 * parse(op.fillStyle)[1] && parse(op.fillStyle)[0] > 60)) err(`${whatF}: no blood pool with gore on (cam.shadow false drops only the contact shadow)`);
            });
          });
        });
      });
    });
  });
  // S: the options left off draw exactly as without them (the interiors' cameras): floor 0, shadow true and st.run 0
  // make the same calls as no option at all, across kinds, poses, falls, details and cameras
  let same = 0;
  types.forEach((type) => {
    [[0.5, 0.85, 300], [0.5, 3, 120], [0.587, 2.2, 160], [0.5, 25, 16], [6, 7, 60]].forEach(([eye, dist, h], ci) => {
      [{ pose: "walk", gait: 0.4, move: 1 }, { pose: "claw", claw: 0.3, move: 0.2 }, { pose: "scream", poseT: 0.4 }, { fall: 0.6, fallDir: 1 }, { fall: 1, fallDir: PI, gore: true }].forEach((o, i) => {
        const falling = o.fall > 0;
        const b = W3.box(type, falling);
        const cam = { w: Math.ceil((b.w * h) / b.h), h, px: h / b.h, dist, eye };
        const st = Object.assign({ yaw: 0.7 - ci, lod: (i + ci) % 3, seed: i, fog: ci * 0.2, hit: i === 1 ? 1 : 0 }, o);
        const plain = drawOne(type, st, cam, `walker ${type} (no options)`);
        [{ floor: 0 }, { shadow: true }, { floor: 0, shadow: true }].forEach((opt) => {
          const r = drawOne(type, st, Object.assign({}, cam, opt), `walker ${type} with ${JSON.stringify(opt)}`);
          if (plain && r && sig(r.ops) !== sig(plain.ops)) err(`walker ${type} ${JSON.stringify(o)} at eye ${eye}, ${dist} tiles: cam ${JSON.stringify(opt)} draws differently from no option (an option left off must change nothing)`);
          same++;
        });
        const r0 = drawOne(type, Object.assign({}, st, { run: 0 }), cam, `walker ${type} with st.run 0`);
        if (plain && r0 && sig(r0.ops) !== sig(plain.ops)) err(`walker ${type} ${JSON.stringify(o)} at eye ${eye}, ${dist} tiles: st.run 0 draws differently from no run (an option left off must change nothing)`);
        same++;
      });
    });
  });
  console.log(`walkers from above: ${roadCams} road-camera draws checked; ${same} draws with the options off match the plain ones`);
  // T: the walkers draw exactly as before people joined the rig (every person-only path is gated)
  {
    const got = walkerCallsHash(W3);
    if (process.argv.includes("--record-walkers")) console.log(`walker fixture: ${JSON.stringify(got)}`);
    else if (got.draws !== WALKER_FIXTURE.draws || got.calls !== WALKER_FIXTURE.calls || got.sha1 !== WALKER_FIXTURE.sha1) err(`walkers: ${got.draws} draws make ${got.calls} calls hashing ${got.sha1}, not the fixture's ${WALKER_FIXTURE.calls} calls ${WALKER_FIXTURE.sha1} (a walker draws differently: if on purpose, re-record with --record-walkers)`);
  }

  /* ---------- The crew in 3D (js/walker3d-crew.js: people on the walkers' rig) ---------- */
  const H3 = W3.HUMANS || {};
  const people = Object.keys(H3);
  let crewDraws = 0;
  if (typeof W3.addHuman !== "function" || !people.length) err("js/walker3d.js has no people (Walker3D.addHuman, HUMANS: the crew's looks are js/walker3d-crew.js)");
  else {
    const HPOSES = ["stand", "walk", "talk", "work", "sit", "read", "cower"];
    if (JSON.stringify(W3.HUMAN_POSES) !== JSON.stringify(HPOSES)) err(`Walker3D.HUMAN_POSES is ${JSON.stringify(W3.HUMAN_POSES)}, not ${JSON.stringify(HPOSES)} (the engine's contract)`);
    if (JSON.stringify(W3.HUMAN_JOBS) !== JSON.stringify(["garden", "hammer", "clipboard"])) err(`Walker3D.HUMAN_JOBS is ${JSON.stringify(W3.HUMAN_JOBS)}`);
    people.forEach((id) => W3.TYPES[id] && err(`person "${id}" is also a walker type (people live in HUMANS only)`));
    if (!H3.person) err('Walker3D.HUMANS has no stand-in "person" (drawn for a crew id with no look yet)');
    if (W3.humanId("zz-new") !== "person" || W3.humanId(people[0]) !== people[0]) err("Walker3D.humanId does not give the stand-in for an unknown id and the id itself for a known one");
    // the facts: every crew member has a look, at the facts' scale; the look's colours are the 2D portrait's (js/crewart.js)
    const csb = { console };
    csb.globalThis = csb;
    csb.window = csb;
    vm.createContext(csb);
    pageScripts.filter((f) => /^(layouts|world|story[\w-]*)\.js$/.test(f)).forEach((f) => {
      try {
        vm.runInContext(fs.readFileSync(path.join(ROOT, "js", f), "utf8"), csb, { filename: "js/" + f });
      } catch (e) {
        warn(`could not load js/${f} to check the crew's 3D looks against the facts: ${String(e.message).split("\n")[0]}`);
      }
    });
    const CW = (csb.ZSR && csb.ZSR.WORLD && csb.ZSR.WORLD.CREW) || {};
    if (!Object.keys(CW).length) warn("no WORLD.CREW in the facts to check the crew's 3D looks against");
    const art2d = fs.readFileSync(path.join(ROOT, "js", CREW_FILE), "utf8");
    const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
    Object.keys(CW).forEach((id) => {
      const t = H3[id];
      if (!t) return err(`crew member "${id}" (WORLD.CREW) has no 3D look (Walker3D.addHuman in js/walker3d-crew.js)`);
      if (Math.abs(t.scale - CW[id].scale) > 1e-9) err(`crew ${id}: its 3D look's scale ${t.scale} is not CREW.${id}.scale ${CW[id].scale} (the facts win on the page, the look's own in a test)`);
      // js/crewart.js's PEOPLE.<id>: skin, hair, its top (the 3D look's shirt) and trousers
      const m = new RegExp(`\\n    ${id}: \\{([\\s\\S]*?)\\n    \\}`).exec(art2d);
      if (!m) return warn(`could not find ${id} in js/${CREW_FILE}'s PEOPLE to compare its colours`);
      [["skin", "skin"], ["hair", "hair"], ["top", "shirt"], ["pants", "pants"]].forEach(([k2, k3]) => {
        const c = new RegExp(`\\b${k2}: "(#[0-9a-f]{6})"`, "i").exec(m[1]);
        const L = t.looks[0];
        if (c && L[k3] && hex(L[k3]) !== c[1].toLowerCase()) err(`crew ${id}: its 3D ${k3} ${hex(L[k3])} is not the portrait's ${k2} ${c[1]} (js/${CREW_FILE})`);
      });
    });
    // boxes and strides: in tiles, standing at PERSON_H x the scale, the same object each call; a run outstrides a walk
    people.forEach((id) => {
      const b = W3.box(id);
      const what = `Walker3D.box("${id}")`;
      if (!b || !["h", "w", "head", "bar"].every((k) => finite(b[k]) && b[k] > 0)) return err(`${what} is ${JSON.stringify(b)}`);
      const want = W3.PERSON_H * ((CW[id] && CW[id].scale) || H3[id].scale);
      if (Math.abs(b.h - want) > 1e-6 && !(ZSR.WORLD && ZSR.WORLD.CREW)) err(`${what}.h ${b.h} is not PERSON_H x its scale (${want.toFixed(4)})`);
      if (b.head > b.h + 1e-9 || b.head < 0.9 * b.h) err(`${what}.head ${b.head} is not just under its height ${b.h}`);
      if (b !== W3.box(id)) err(`${what} makes a new object each call`);
      if (b.h > 0.98) err(`${what}.h ${b.h} is over the 0.98 ceiling cap (a crew member must stand in the cabin unshrunk)`);
      const s0 = W3.stride(id);
      const s1 = W3.stride(id, 1);
      if (!(finite(s0) && s0 > 0 && finite(s1) && s1 > s0)) err(`Walker3D.stride("${id}") is ${s0}, running ${s1} (a run must stride further)`);
    });
    const hcam = (id, h, dist) => {
      const b = W3.box(id);
      const px = h / b.h;
      return { w: Math.ceil(b.w * px), h, px, dist: dist || 3, eye: 0.5 };
    };
    const hbase = { yaw: 0, gait: 0.3, move: 0, pose: "stand", poseT: 0.3, poseW: 1, seed: 0, lod: 0, fog: 0, run: 0, seat: 0, headYaw: 0, gore: true, claw: 0, hit: 0, fall: 0 };
    const drawH = (id, o, cam, what) => {
      const r = drawOne(id, Object.assign({}, hbase, o), cam, what, CREW_OPS);
      if (r) crewDraws++;
      return r;
    };
    // the colours a person must never use: the walkers' eye glow and blood, at any light and fog (people are drawn
    // through the same colour function, so only an exact walker colour or a deep blood red would give one away)
    const banned = new Set();
    Object.keys(W3.TYPES).forEach((t) => W3.TYPES[t].looks.forEach((L) => ["glow", "eye", "blood", "flesh"].forEach((k) => L[k] && banned.add(L[k].slice(0, 3).join(",")))));
    const badColour = (ops) => {
      for (const op of ops) {
        if (op.k !== "fill" && op.k !== "stroke") continue;
        const c = parse(op.k === "fill" ? op.fillStyle : op.strokeStyle);
        if (!c) continue;
        if (banned.has(c.slice(0, 3).join(","))) return `${op.k} ${c.join(",")} (a walker's glow or blood)`;
        if (c[0] > 60 && c[1] < 0.2 * c[0] && c[2] < 0.2 * c[0]) return `${op.k} ${c.join(",")} (a blood red)`;
      }
      return null;
    };
    // A: every pose (each job, a seat on the floor and a chair's), from 8 sides, at every level of detail, walking and
    // running: clean, inside, on the floor, under the ceilings, no glow or blood; every other one drawn twice the same
    people.forEach((id) => {
      HPOSES.forEach((pose) => {
        const jobs = pose === "work" ? W3.HUMAN_JOBS : [null];
        const seats = pose === "sit" ? [0, 0.3] : [0];
        const runs = pose === "walk" ? [0, 1] : [0];
        jobs.forEach((job) => {
          seats.forEach((seat) => {
            runs.forEach((run) => {
              for (let k = 0; k < 8; k++) {
                for (let lod = 0; lod < 3; lod++) {
                  const yaw = (k * PI) / 4 - PI;
                  const o = { pose, job, seat, run, lod, yaw, move: pose === "walk" ? 1 : 0, gait: k / 8, poseT: (k + 0.5) / 8, seed: k, headYaw: (k % 3) - 1 };
                  const cam = hcam(id, 240);
                  const what = `person ${id} ${pose}${job ? " " + job : ""}${pose === "sit" ? " seat " + seat : ""}${run ? " running" : ""} yaw ${yaw.toFixed(2)} lod ${lod}`;
                  const r = drawH(id, o, cam, what);
                  if (!r) continue;
                  const low = lowest(r.ops);
                  // its lowest point on the floor line (a run's both-feet-off moment a little over it; nothing under it:
                  // drawOne holds every call inside the region). Sitting, the origin is under the seat: seen from
                  // behind, the feet are farther than it and show higher (F holds them to the floor in the model)
                  if (!(pose === "sit" && Math.cos(yaw) < 0.1) && low < cam.h - (run ? 0.06 : 0.03) * cam.h) err(`${what}: its lowest point is at ${low.toFixed(1)}, over the floor line ${cam.h}`);
                  const bad = badColour(r.ops);
                  if (bad) err(`${what}: paints ${bad}`);
                  if (k === 4 && pose !== "work" && pose !== "cower" && lod < 2 && !r.res.face) err(`${what}: facing the camera, draw() says no face`);
                  if (lod === 0 && (k & 1) === 0) {
                    const again = drawH(id, o, cam, what + " (again)");
                    if (again && sig(again.ops) !== sig(r.ops)) err(`${what}: the same inputs drew different calls`);
                  }
                }
              }
            });
          });
        });
      });
    });
    // an unknown crew id draws the stand-in, a person (never a walker)
    const stand = drawH(W3.humanId("zz-new"), {}, hcam("person", 200), "person for an unknown crew id");
    const plain = drawH("person", {}, hcam("person", 200), "the stand-in person");
    if (stand && plain && sig(stand.ops) !== sig(plain.ops)) err("an unknown crew id (Walker3D.humanId) does not draw the stand-in person");
    // B: tiny to large regions, near and far; fog darkens every colour (no glow), and changes nothing else
    people.forEach((id) => {
      [[14, 18], [80, 110], [380, 500]].forEach(([w, h]) => {
        [0.6, 2, 25].forEach((dist) => {
          const b = W3.box(id);
          const cam = { w, h, px: h / b.h, dist, eye: 0.5 };
          const what = `person ${id} in ${w} x ${h} at ${dist} tiles`;
          const clear = drawH(id, { yaw: 0.6, pose: "read", fog: 0 }, cam, what + " fog 0");
          const fog = drawH(id, { yaw: 0.6, pose: "read", fog: 0.9 }, cam, what + " fog 0.9");
          if (!clear || !fog) return;
          if (clear.ops.length !== fog.ops.length) return err(`${what}: fog changed what is drawn (${clear.ops.length} vs ${fog.ops.length} calls)`);
          for (let i = 0; i < clear.ops.length; i++) {
            const k = clear.ops[i].k;
            if (k !== "fill" && k !== "stroke") continue;
            const a = parse(k === "fill" ? clear.ops[i].fillStyle : clear.ops[i].strokeStyle);
            const z = parse(k === "fill" ? fog.ops[i].fillStyle : fog.ops[i].strokeStyle);
            if (!a || !z || a[0] + a[1] + a[2] < 30) continue;
            if (z[0] + z[1] + z[2] > (a[0] + a[1] + a[2]) * 0.5) return err(`${what}: fog 0.9 left ${k} ${a.join(",")} at ${z.join(",")} (nothing on a person glows)`);
          }
        });
      });
    });
    // B2: their colours converge as the walkers' do (M): random poses, sides, fog and details use a bounded set of colour
    // strings, and the last third of the draws adds almost none (light and fog come in steps, a prop face's light too)
    {
      const colours = new Set();
      let late = 0;
      let addLate = 0;
      const grab = new Proxy({}, { get: () => noop, set: (o, k, v) => ((k === "fillStyle" || k === "strokeStyle") && !colours.has(v) && (colours.add(v), (late += addLate)), true) });
      let seedR = 11;
      const rr = () => (seedR = (seedR * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      for (let i = 0; i < 3000; i++) {
        if (i === 2000) addLate = 1;
        const id = people[i % people.length];
        W3.draw(grab, id, Object.assign({}, hbase, { yaw: rr() * 6.3 - 3.15, gait: rr(), fog: rr() * 0.9, pose: HPOSES[i % HPOSES.length], job: W3.HUMAN_JOBS[i % 3], seat: rr() * 0.3, poseT: rr(), move: 1, run: rr(), lod: i % 3, seed: i % 5, headYaw: rr() * 2 - 1 }), hcam(id, 120));
      }
      if (colours.size > CREW_COLOURS) err(`the crew: ${colours.size} different colour strings in 3000 random draws (over ${CREW_COLOURS})`);
      if (late > colours.size * 0.05) err(`the crew: the last 1000 of 3000 random draws still made ${late} new colours (of ${colours.size}): light or fog is not stepped`);
    }
    const PBH = W3.probe();
    const quietH = (id, o, cam) => W3.draw(quiet, id, Object.assign({}, hbase, o), cam);
    const jointsOf = () => Array.from(PBH.j);
    const jump = (a, b) => {
      let d = 0;
      for (let j = 0; j < a.length; j += 3) d = Math.max(d, Math.hypot(a[j] - b[j], a[j + 1] - b[j + 1], a[j + 2] - b[j + 2]));
      return d;
    };
    people.forEach((id) => {
      const cam = hcam(id, 200);
      const hgt = H3[id].h; // the joints are in the look's own units, about 1 tall
      // C: a pose blends in from standing without a jump: poseW 0 is standing exactly, and no joint moves more than
      // 6% of the height between 1/40 steps of poseW
      quietH(id, { pose: "stand", poseT: 0.3 }, cam);
      const standJ = jointsOf();
      ["talk", "work", "sit", "read", "cower"].forEach((pose) => {
        (pose === "work" ? W3.HUMAN_JOBS : [null]).forEach((job) => {
          [0, 0.3].forEach((seat) => {
            if (seat && pose !== "sit") return;
            let prev = null;
            let worst = 0;
            for (let i = 0; i <= 40; i++) {
              quietH(id, { pose, job, seat, poseW: i / 40, poseT: 0.3, yaw: 0.7 }, cam);
              const now = jointsOf();
              if (i === 0 && jump(now, standJ) > 1e-9) err(`person ${id}: ${pose}${job ? " " + job : ""} at poseW 0 is not standing (a joint is ${jump(now, standJ).toFixed(4)} off): the pose would jump in`);
              if (prev) worst = Math.max(worst, jump(now, prev));
              prev = now;
            }
            if (worst > 0.06 * hgt) err(`person ${id}: ${pose}${job ? " " + job : ""}${pose === "sit" ? " seat " + seat : ""} blending in moves a joint ${(worst / hgt * 100).toFixed(1)}% of its height in one 1/40 step of poseW: a jump`);
          });
        });
      });
      // D: each pose's loop (poseT) closes on itself and runs without a jump (sampled finely: the hammer's strike is
      // fast, about an eighth of its loop, but it does not jump), the feet staying on the floor; the walk and the
      // run's cycles too
      ["stand", "talk", "work", "sit", "read", "cower"].forEach((pose) => {
        (pose === "work" ? W3.HUMAN_JOBS : [null]).forEach((job) => {
          quietH(id, { pose, job, poseT: 0, seat: 0.3 }, cam);
          const j0 = jointsOf();
          quietH(id, { pose, job, poseT: 1, seat: 0.3 }, cam);
          if (jump(jointsOf(), j0) > 1e-6) err(`person ${id}: ${pose}${job ? " " + job : ""} at poseT 1 is not where it starts (its loop would jump)`);
          let prev = j0;
          let worst = 0;
          let toeUp = 0;
          for (let i = 1; i <= 400; i++) {
            quietH(id, { pose, job, poseT: i / 400, seat: 0.3 }, cam);
            const now = jointsOf();
            worst = Math.max(worst, jump(now, prev));
            if (pose !== "sit") toeUp = Math.max(toeUp, Math.min(now[13 * 3 + 1], now[17 * 3 + 1]));
            prev = now;
          }
          if (worst > 0.05 * hgt) err(`person ${id}: ${pose}${job ? " " + job : ""} moves a joint ${(worst / hgt * 100).toFixed(1)}% of its height in one 1/400 of its loop: a jump`);
          if (toeUp > H3[id].build.ankle + 0.002) err(`person ${id}: ${pose}${job ? " " + job : ""} lifts both feet off the floor during its loop (the lower toe ${toeUp.toFixed(3)} up)`);
        });
      });
      [0, 1].forEach((run) => {
        quietH(id, { pose: "walk", move: 1, run, gait: 0 }, cam);
        let prev = jointsOf();
        const j0 = prev;
        let worst = 0;
        for (let i = 1; i <= 100; i++) {
          quietH(id, { pose: "walk", move: 1, run, gait: i / 100 }, cam);
          const now = jointsOf();
          worst = Math.max(worst, jump(now, prev));
          prev = now;
        }
        if (jump(prev, j0) > 1e-6) err(`person ${id}: its ${run ? "run" : "walk"} cycle does not close`);
        if (worst > 0.06 * hgt) err(`person ${id}: ${run ? "running" : "walking"} moves a joint ${(worst / hgt * 100).toFixed(1)}% of its height in 1/100 of a cycle: a snap`);
      });
      // E: the same size in every pose (an envelope of them all): the fit never moves with the pose, and in a region
      // its box gives it is drawn all but full size (the ink's margin and a camera's perspective over its eye take a
      // few percent, as for a walker)
      let lo = Infinity;
      let hi = 0;
      HPOSES.forEach((pose) => {
        (pose === "work" ? W3.HUMAN_JOBS : [null]).forEach((job) => {
          [0, 0.15, 0.3, 0.6].forEach((seat) => {
            [0, 1].forEach((run) => {
              for (let i = 0; i < 6; i++) {
                quietH(id, { pose, job, seat, run, move: pose === "walk" ? 1 : 0, poseT: i / 6, gait: i / 6, yaw: i, headYaw: i - 3 }, cam);
                lo = Math.min(lo, W3.probe().fit);
                hi = Math.max(hi, W3.probe().fit);
              }
            });
          });
        });
      });
      if (lo < 0.95) err(`person ${id}: drawn at ${(lo * 100).toFixed(1)}% in a region its box gives (its box must hold every pose)`);
      if (hi / lo - 1 > 0.01) err(`person ${id}: its size changes ${((hi / lo - 1) * 100).toFixed(1)}% with the pose`);
      // F: sitting: the hips at the seat (the seat in tiles), the feet on the floor; a seat too tall for the legs is
      // brought down to the highest they reach
      const K = W3.box(id).h / H3[id].h;
      const b = H3[id].build;
      [0, 0.1, 0.2, 0.3].forEach((seat) => {
        quietH(id, { pose: "sit", seat, yaw: 1.2 }, cam);
        const hipY = PBH.j[1];
        const want = Math.min(seat / K, H3[id].seatMax) + b.rThigh * 1.15;
        if (Math.abs(hipY - want) > 1e-6) err(`person ${id} sitting on a seat ${seat} tiles high: the hips at ${(hipY * K).toFixed(3)} tiles, not ${(want * K).toFixed(3)}`);
        const toe = Math.min(PBH.j[13 * 3 + 1], PBH.j[17 * 3 + 1]);
        if (toe > b.ankle + 0.002) err(`person ${id} sitting on a seat ${seat} tiles high: the feet are off the floor (a toe at ${toe.toFixed(3)})`);
      });
      // G: the head turns from the body (headYaw), clamped: turned to the camera from a body facing away a quarter
      // turn, the face shows; past the clamp it draws as at the clamp
      const r = W3.draw(quiet, id, Object.assign({}, hbase, { pose: "talk", yaw: 1.0, headYaw: -1.0 }), cam);
      if (!r.face) err(`person ${id}: its head turned to the camera (headYaw -1 at yaw 1) shows no face`);
      const a = drawH(id, { pose: "talk", yaw: 0.5, headYaw: 3 }, cam, `person ${id} headYaw 3`);
      const c = drawH(id, { pose: "talk", yaw: 0.5, headYaw: W3.HEAD_YAW_MAX }, cam, `person ${id} headYaw at the clamp`);
      if (a && c && sig(a.ops) !== sig(c.ops)) err(`person ${id}: headYaw 3 does not draw as at the clamp (${W3.HEAD_YAW_MAX})`);
      // G2: the eyes blink once in a pose's loop, and never at its ends (a pose held at poseT 0 or 1 keeps them open);
      // the mouth opens and shuts as they talk
      const whites = (o) => {
        let w = false;
        let fill = "";
        const g = new Proxy({}, { get: (x, k) => (k === "fill" ? () => (w = w || fill === "rgb(251,248,240)") : noop), set: (x, k, v) => ((k === "fillStyle" && (fill = v)), true) });
        W3.draw(g, id, Object.assign({}, hbase, o), cam);
        return w;
      };
      for (let seed = 0; seed < 12; seed++) {
        [0, 1].forEach((poseT) => whites({ pose: "stand", poseT, seed }) || err(`person ${id} seed ${seed}: its eyes are shut at poseT ${poseT} (a pose held there would never open them)`));
        let shut = 0;
        for (let i = 0; i < 100; i++) if (!whites({ pose: "talk", poseT: i / 100, seed })) shut++;
        if (shut < 1 || shut > 8) err(`person ${id} seed ${seed}: eyes shut for ${shut} of 100 steps of a loop (a blink is a moment once a loop)`);
      }
      // H: missing or broken fields draw as their defaults; the walkers' own fields do nothing harmful
      [{ pose: "dance" }, { pose: undefined }, { seat: NaN }, { seat: -2 }, { seat: 40, pose: "sit" }, { headYaw: Infinity }, { headYaw: NaN }, { job: "juggle", pose: "work" }, { job: 3, pose: "work" }, { poseW: NaN, pose: "read" }, { poseT: NaN, pose: "talk" }, { run: NaN, pose: "walk", move: 1 }, { move: undefined, pose: "walk" }, { gait: Infinity, pose: "walk", move: 1 }, { yaw: NaN }, { fog: NaN }, { seed: -5 }, { lod: 7 }, { pose: "bite", claw: 5, hit: 1, fall: 1, fallDir: 2 }, { pose: "claw", claw: NaN, fall: 0.5 }].forEach((o) =>
        drawH(id, o, hcam(id, 200), `person ${id} with ${JSON.stringify(o, (k, v) => (typeof v === "number" && !Number.isFinite(v) ? String(v) : v === undefined ? "undefined" : v))}`)
      );
    });
    // I: drawing people leaves no state behind: a walker drawn after a person draws as it did before it
    {
      const camW = camFor("walker", false, 200);
      const before = drawOne("walker", { yaw: 0.4, pose: "claw", claw: 0.3, seed: 2 }, camW, "walker before a person");
      drawH("june", { pose: "read", lod: 0, yaw: 2 }, hcam("june", 200), "june between two walkers");
      const after = drawOne("walker", { yaw: 0.4, pose: "claw", claw: 0.3, seed: 2 }, camW, "walker after a person");
      if (before && after && sig(before.ops) !== sig(after.ops)) err("a walker drawn after a person draws differently (a person left state behind)");
    }
    console.log(`the crew in 3D: ${people.length} looks (${people.join(", ")}), ${crewDraws} figures checked`);
  }
  // the health bar's width uses the engine's field of view: the same number in both files
  const fovM = /const FOV = ([\d.]+)/.exec(fs.readFileSync(path.join(ROOT, "js", "interior.js"), "utf8"));
  if (!fovM) warn("could not find js/interior.js's FOV to check Walker3D.FOV against");
  else if (Math.abs(+fovM[1] - W3.FOV) > 1e-9) err(`Walker3D.FOV ${W3.FOV} is not js/interior.js's FOV ${fovM[1]} (the health bar's width comes from it)`);
  sb.document.createElement = realCreate;
}

/* ---------- Animals in 3D (js/beast3d.js + js/beast3d-looks.js): the stray dog and Rivet, live in their regions ----------
   Loaded as the page loads them: after the walkers' looks (after js/walker3d-crew.js when there is one) and before
   js/interior.js. Every type in every pose it has (and one it lacks, which draws "stand"), from 8 sides, at every level
   of detail, walking, galloping and wagging, on the checking context: no throw, finite numbers, real colours, no
   transforms, images, gradients, read-backs or new canvases, inside its region, its feet on the floor line, within its
   canvas-call ceiling (BEAST_OPS), the same calls twice and with another animal drawn between; fog darkens all but a
   robot's lights, in steps; a shut-down robot has no lights; poses ease in and out without a jump, the gait and the
   pose loops are smooth and wrap; the size never follows the pose; tiny to large regions, near and far, and seen from
   above (cam.floor, cam.shadow) hold the same promises, the two options left off change nothing; the colour table
   converges; a two-legged winged stand-in (stage 3's chickens) draws cleanly through the same rig. */
const BEAST_FILES = ["beast3d.js", "beast3d-looks.js"]; // SCALE: the animal module, then its looks; add beast3d-looks2.js ... here as kinds grow
// SCALE: most canvas calls one animal may make at lod 0 / 1 / 2 (a crew yard draws the dog and Rivet beside the crew
// and the walkers, each redrawn when it changes). Today's most: see the line this section prints
const BEAST_OPS = [450, 320, 170];
const BEAST_H_MAX = 0.6; // SCALE: tallest animal box, tiles (a goat stands taller than the dog)
const BEAST_COLOURS = 3000; // SCALE: most colour strings random animal draws may use (Beast3D's colour table, CC_N, holds 8192)
let beastDraws = 0;
{
  const at0 = pageScripts.indexOf("walker3d-crew.js") >= 0 ? pageScripts.indexOf("walker3d-crew.js") : pageScripts.indexOf("walker3d-looks.js");
  BEAST_FILES.forEach((f, i) => {
    if (!fs.existsSync(path.join(ROOT, "js", f))) return err(`js/${f} is missing`);
    const at = pageScripts.indexOf(f);
    if (at < 0) err(`index.html does not load js/${f}`);
    else {
      if (at < at0) err(`index.html loads js/${f} before js/${pageScripts[at0]} (the animals load right after the walkers' looks)`);
      if (pageScripts.includes("interior.js") && at > pageScripts.indexOf("interior.js")) err(`index.html loads js/${f} after interior.js (the engine reads Beast3D)`);
      if (i && at < pageScripts.indexOf(BEAST_FILES[0])) err(`index.html loads js/${f} before js/${BEAST_FILES[0]}`);
    }
    load(f);
  });
}
const B3 = ZSR.Beast3D;
if (!B3) err("js/beast3d.js does not export ZSR.Beast3D");
else {
  const PI = Math.PI;
  const POSES = ["stand", "walk", "sit", "lie", "bark", "zap", "off"];
  if (JSON.stringify(B3.POSES) !== JSON.stringify(POSES)) err(`Beast3D.POSES is ${JSON.stringify(B3.POSES)}, not ${JSON.stringify(POSES)} (the engine relies on the list)`);
  ["addType", "draw", "box", "stride", "probe"].forEach((k) => typeof B3[k] === "function" || err(`Beast3D.${k} is not a function`));
  POSES.forEach((p) => (finite(B3.POSE_SECS && B3.POSE_SECS[p]) && B3.POSE_SECS[p] > 0) || err(`Beast3D.POSE_SECS.${p} is ${B3.POSE_SECS && B3.POSE_SECS[p]}`));
  ["POSE_BLEND", "FOG_STEPS", "HEAD_YAW_MAX"].forEach((k) => (finite(B3[k]) && B3[k] > 0) || err(`Beast3D.${k} is ${B3[k]}`));
  // the kinds the game has, with the poses docs/CREW.md and docs/UNIVERSES.md give them
  const WANT = { dog: ["stand", "walk", "sit", "lie", "bark"], robodog: ["stand", "walk", "sit", "zap", "off"] };
  Object.entries(WANT).forEach(([id, poses]) => {
    const t = B3.TYPES[id];
    if (!t) return err(`Beast3D has no "${id}" (js/beast3d-looks.js)`);
    poses.forEach((p) => t.poses.includes(p) || err(`Beast3D "${id}" lacks the pose "${p}"`));
  });
  const types = Object.keys(B3.TYPES);
  // boxes and strides: finite, sane, the same object each call (the engine calls them every frame)
  types.concat(["zz-new"]).forEach((t) => {
    const b = B3.box(t);
    const what = `Beast3D.box("${t}")`;
    if (!b || !["h", "w", "head", "bar"].every((k) => finite(b[k]) && b[k] > 0)) return err(`${what} is ${JSON.stringify(b)}`);
    if (b.h > BEAST_H_MAX) err(`${what}.h is ${b.h}: over ${BEAST_H_MAX} tiles`);
    if (b.head > b.h + 1e-9) err(`${what}.head ${b.head} is over its height ${b.h}`);
    if (b.w < b.bar) err(`${what}.w ${b.w} is narrower than its bar ${b.bar}`);
    if (b !== B3.box(t)) err(`${what} makes a new object each call`);
    const s0 = B3.stride(t);
    const s1 = B3.stride(t, 1);
    if (!(finite(s0) && s0 > 0 && finite(s1) && s1 >= s0)) err(`Beast3D.stride("${t}") is ${s0}, galloping ${s1}`);
    if (B3.stride(t, NaN) !== s0) err(`Beast3D.stride("${t}", NaN) is not its walking stride`);
  });
  // the dog stands as tall as its 2D art (CREW_ART.scale.crewDog: its back about 0.2 tiles, a grown-up's knee)
  const FORBID = new Set(["translate", "scale", "rotate", "setTransform", "transform", "drawImage", "resetTransform", "set shadowBlur", "set filter", "createLinearGradient", "createRadialGradient", "createPattern", "getImageData", "putImageData"]);
  const parse = (c) => {
    const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/.exec(typeof c === "string" ? c : "");
    return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null;
  };
  const base = { yaw: 0, gait: 0.3, move: 0, run: 0, pose: "stand", poseT: 0.3, poseW: 1, wag: 0.5, headYaw: 0, seed: 0, lod: 0, fog: 0 };
  let made = 0;
  const realCreate = sb.document.createElement;
  sb.document.createElement = (t) => {
    made++;
    return realCreate(t);
  };
  const SHADOW_FILL = "rgba(0,0,0,0.3)";
  /** The lowest point the figure draws (not its ground shadow): stroke ends with their width, ellipses' bottoms. */
  const lowestDrawn = (ops) => {
    let y = -Infinity;
    let pending = [];
    ops.forEach((op) => {
      const a = op.args;
      if (op.k === "beginPath") pending = [];
      else if (op.k === "moveTo" || op.k === "lineTo") pending.push(a[1]);
      else if (op.k === "quadraticCurveTo") pending.push(a[3]);
      else if (op.k === "ellipse") pending.push(a[1] + Math.hypot(a[2] * Math.sin(a[4]), a[3] * Math.cos(a[4])));
      else if (op.k === "fill" && op.fillStyle !== SHADOW_FILL) pending.forEach((v) => (y = Math.max(y, v)));
      else if (op.k === "stroke") pending.forEach((v) => (y = Math.max(y, v + (op.lineWidth || 0) / 2)));
    });
    return y;
  };
  const sig = (ops) => JSON.stringify(ops.map((op) => [op.k, op.args, op.fillStyle, op.strokeStyle, op.lineWidth, op.globalAlpha]));
  const worst = [0, 0, 0];
  /** Draw one animal on a fresh checking canvas; returns { ops, res } or null (after reporting). */
  function drawBeast(type, o, cam, what) {
    const c = element("canvas");
    c.width = cam.w;
    c.height = cam.h;
    const ctx = c.getContext("2d");
    const st = Object.assign({}, base, o);
    current = what;
    const before = made;
    noRead = true;
    let res;
    try {
      res = B3.draw(ctx, type, st, cam);
    } catch (e) {
      noRead = false;
      err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
      return null;
    }
    noRead = false;
    beastDraws++;
    if (made !== before) err(`${what}: made ${made - before} canvas(es) while drawing`);
    if (!res || !finite(res.parts) || res.parts < 3) err(`${what}: draw() returned ${JSON.stringify(res)}, not { parts }`);
    const ops = c.ops;
    const lod = st.lod === 1 || st.lod === 2 ? st.lod : 0;
    worst[lod] = Math.max(worst[lod], ops.length);
    if (ops.length < (lod === 2 ? 12 : 30)) err(`${what}: only ${ops.length} canvas calls`);
    if (ops.length > BEAST_OPS[lod]) err(`${what}: ${ops.length} canvas calls, over the lod ${lod} ceiling of ${BEAST_OPS[lod]}`);
    const bad = ops.find((op) => FORBID.has(op.k));
    if (bad) err(`${what}: calls ${bad.k} (animals draw straight, with no transforms, images, gradients or read-backs)`);
    let worstOut = null;
    const out = (x, y, r, lw, k, ry) => {
      const m = 2 + lw / 2;
      const rh = ry == null ? r : ry;
      if (x - r < -m || x + r > cam.w + m || y - rh < -m || y + rh > cam.h + m) worstOut = worstOut || `${k} at ${x.toFixed(1)}, ${y.toFixed(1)} (r ${r.toFixed(1)}, ${rh.toFixed(1)}) outside ${cam.w} x ${cam.h}`;
    };
    ops.forEach((op) => {
      const a = op.args;
      if (op.k === "moveTo" || op.k === "lineTo") out(a[0], a[1], 0, op.lineWidth, op.k);
      else if (op.k === "quadraticCurveTo") {
        out(a[0], a[1], 0, op.lineWidth, op.k);
        out(a[2], a[3], 0, op.lineWidth, op.k);
      } else if (op.k === "ellipse") {
        const c2 = Math.cos(a[4]);
        const s2 = Math.sin(a[4]);
        out(a[0], a[1], Math.hypot(a[2] * c2, a[3] * s2), op.lineWidth, op.k, Math.hypot(a[2] * s2, a[3] * c2));
      }
    });
    if (worstOut) err(`${what}: draws outside its region: ${worstOut}`);
    return { ops, res };
  }
  const camFor = (type, h, dist) => {
    const b = B3.box(type);
    const px = h / b.h;
    return { w: Math.ceil(b.w * px), h, px, dist: dist || 3, eye: 0.5 };
  };
  // A: every pose it has and one it lacks, 8 sides, every level of detail, wagging or not; walking at a trot and a
  // gallop; its feet on the floor line; the same calls twice
  types.forEach((type) => {
    const t = B3.TYPES[type];
    const lacks = POSES.find((p) => !t.poses.includes(p));
    const poses = t.poses.concat(lacks ? [lacks] : []);
    for (let seed = 0; seed < Math.max(1, t.looks.length); seed++) {
      poses.forEach((pose) => {
        [0, 1].forEach((run) => {
          if (run && pose !== "walk") return;
          for (let k = 0; k < 8; k++) {
            for (let lod = 0; lod < 3; lod++) {
              const yaw = (k * PI) / 4 - PI;
              const o = { pose, yaw, lod, seed, run, wag: (k + lod) % 2, move: pose === "walk" ? 1 : 0, headYaw: ((k % 3) - 1) * 0.6 };
              const cam = camFor(type, 220);
              const what = `animal ${type} ${pose}${run ? " galloping" : ""}${t.poses.includes(pose) ? "" : " (it lacks it)"} yaw ${yaw.toFixed(2)} lod ${lod} seed ${seed}`;
              const r = drawBeast(type, o, cam, what);
              if (!r) continue;
              const low = lowestDrawn(r.ops);
              // (galloping, every paw may be off the ground at once)
              if (!run && (low < 0.94 * cam.h || low > cam.h + 3.5)) err(`${what}: its lowest point is at ${low.toFixed(1)} of ${cam.h} (its feet must stand on the floor line)`);
              if (lod === 0 && (k & 1) === 0) {
                const again = drawBeast(type, o, cam, what + " (again)");
                if (again && sig(again.ops) !== sig(r.ops)) err(`${what}: the same inputs drew different calls`);
              }
            }
          }
        });
      });
    }
  });
  // B: tiny to large regions, near and far cameras, clear and fogged: fog darkens everything but a robot's lights, and
  // a shut-down robot has no lights (every colour fogs)
  types.forEach((type) => {
    B3.TYPES[type].poses.forEach((pose) => {
      [[12, 9], [90, 70], [420, 330]].forEach(([w, h], wi) => {
        [0.4, 2, 25].forEach((dist) => {
          const b = B3.box(type);
          const cam = { w, h, px: h / b.h, dist, eye: 0.5 };
          const what = `animal ${type} ${pose} in ${w} x ${h} at ${dist} tiles`;
          const o = { yaw: 0.6 + wi, pose, move: pose === "walk" ? 1 : 0, poseT: 0.3, lod: wi === 2 ? 0 : wi };
          const clear = drawBeast(type, Object.assign({ fog: 0 }, o), cam, what + " fog 0");
          const fog = drawBeast(type, Object.assign({ fog: 0.9 }, o), cam, what + " fog 0.9");
          if (!clear || !fog) return;
          if (clear.ops.length !== fog.ops.length) return err(`${what}: fog changed what is drawn (${clear.ops.length} vs ${fog.ops.length} calls)`);
          let darker = 0;
          let colored = 0;
          for (let i = 0; i < clear.ops.length; i++) {
            const k = clear.ops[i].k;
            if (k !== "fill" && k !== "stroke") continue;
            const a = parse(k === "fill" ? clear.ops[i].fillStyle : clear.ops[i].strokeStyle);
            const z = parse(k === "fill" ? fog.ops[i].fillStyle : fog.ops[i].strokeStyle);
            if (!a || !z || (a[0] + a[1] + a[2] === 0 && a[3] < 1)) continue; // (the ground shadow is black already)
            colored++;
            if (z[0] > a[0] + 1 || z[1] > a[1] + 1 || z[2] > a[2] + 1) return err(`${what}: fog 0.9 made ${k} ${a.join(",")} lighter (${z.join(",")})`);
            if (z[0] + z[1] + z[2] < (a[0] + a[1] + a[2]) * 0.5) darker++;
          }
          if (darker < colored * 0.7) err(`${what}: fog 0.9 darkened only ${darker} of ${colored} colours`);
          if (pose === "off" && darker < colored) err(`${what}: shut down, ${colored - darker} of its colours still glow through the fog (its lights must be dark)`);
        });
      });
    });
  });
  const noop = () => {};
  const quiet = new Proxy({}, { get: () => noop, set: () => true });
  const PB = B3.probe();
  const stQ = (o) => Object.assign({}, base, o);
  if (!PB || !PB.j || !PB.s) err("Beast3D.probe() does not give the joints (j) and their projections (s)");
  else {
    const nj = PB.j.length / 3;
    const jointsOf = () => Array.from(PB.j);
    const maxMove = (a, b2) => {
      let m = 0;
      for (let j = 0; j < nj; j++) m = Math.max(m, Math.hypot(a[j * 3] - b2[j * 3], a[j * 3 + 1] - b2[j * 3 + 1], a[j * 3 + 2] - b2[j * 3 + 2]));
      return m;
    };
    types.forEach((type) => {
      const t = B3.TYPES[type];
      const cam = camFor(type, 200);
      // C: a pose at poseW 0 is standing exactly (a pose change starts where it stood); then through poseW 0..1 in 40
      // steps no joint jumps (at most 4% of its body length a step: the whole move in about 25 steps)
      const len = t.build.len;
      t.poses.forEach((pose) => {
        if (pose === "stand" || pose === "walk") return;
        [0, 0.8].forEach((move) => {
          B3.draw(quiet, type, stQ({ pose: "stand", move, gait: 0.4, poseT: 0.25, yaw: 0.7 }), cam);
          const stand = jointsOf();
          B3.draw(quiet, type, stQ({ pose, move, gait: 0.4, poseT: 0.25, yaw: 0.7, poseW: 0 }), cam);
          const d0 = maxMove(stand, jointsOf());
          if (d0 > 1e-9) err(`animal ${type}: ${pose} at poseW 0 is not standing (a joint is ${d0.toFixed(4)} tiles off): the pose would jump in`);
          let prev = stand;
          let most = 0;
          for (let i = 1; i <= 40; i++) {
            B3.draw(quiet, type, stQ({ pose, move, gait: 0.4, poseT: 0.25, yaw: 0.7, poseW: i / 40 }), cam);
            const now = jointsOf();
            most = Math.max(most, maxMove(prev, now));
            prev = now;
          }
          if (most > len * 0.12) err(`animal ${type}: easing into ${pose}${move ? " from a walk" : ""}, a joint jumps ${most.toFixed(4)} tiles in one of 40 steps (more than ${(len * 0.12).toFixed(4)})`);
        });
      });
      // D: smooth gait cycles (trotting and galloping) and pose loops: through 200 steps no paw, head or tail tip
      // jumps more than 4 x its usual step (+ a little); a loop's end meets its start
      const LIMBS = { "fore left paw": 9 + 3, "fore right paw": 9 + 7, "hind left paw": 9 + 11, "hind right paw": 9 + 15, head: 3, "tail tip": 7 };
      const cycles = [{ field: "gait", o: { pose: "walk", move: 1 } }, { field: "gait", o: { pose: "walk", move: 1, run: 1 } }].concat(t.poses.filter((p) => p !== "walk").map((p) => ({ field: "poseT", o: { pose: p, wag: 1 } })));
      cycles.forEach(({ field, o }) => {
        [PI / 2, 0.4].forEach((yaw) => {
          const steps = {};
          let prev = null;
          let first = null;
          for (let i = 0; i <= 200; i++) {
            B3.draw(quiet, type, stQ(Object.assign({ yaw, [field]: i / 200, gait: field === "gait" ? i / 200 : 0.3, poseT: field === "poseT" ? i / 200 : 0.3 }, o)), cam);
            const now = Array.from(PB.s);
            if (!first) first = now;
            if (prev) Object.entries(LIMBS).forEach(([n, j]) => (steps[n] = steps[n] || []).push(Math.hypot(now[j * 3] - prev[j * 3], now[j * 3 + 1] - prev[j * 3 + 1])));
            prev = now;
          }
          const what = `animal ${type} ${o.pose}${o.run ? " galloping" : ""} through its ${field === "gait" ? "gait" : "loop"} yaw ${yaw.toFixed(2)}`;
          Object.entries(steps).forEach(([n, a]) => {
            const sorted = a.slice().sort((x, y) => x - y);
            const med = sorted[sorted.length >> 1];
            const max = sorted[sorted.length - 1];
            if (max > 4 * med + 1.5) err(`${what}: its ${n} jumps ${max.toFixed(1)} px in one step (its usual step is ${med.toFixed(2)} px at 200 px tall): a snap`);
          });
          // (bark and zap are one-shots: the engine loops them, so their ends meet too)
          Object.entries(LIMBS).forEach(([n, j]) => {
            const d = Math.hypot(prev[j * 3] - first[j * 3], prev[j * 3 + 1] - first[j * 3 + 1]);
            if (d > 1.5) err(`${what}: its ${n} ends the loop ${d.toFixed(1)} px from where it began (the loop must wrap)`);
          });
        });
      });
      // E: the size never follows the pose: at 1 tile the fit is the same sitting, lying, barking, zapping, walking and
      // galloping, the head turned either way
      [0, 0.5, PI / 2, -2.4].forEach((yaw) => {
        let lo = Infinity;
        let hi = 0;
        const b = B3.box(type);
        const camN = { w: Math.ceil((b.w * 300) / b.h), h: 300, px: 300 / b.h, dist: 1, eye: 0.5 };
        t.poses.forEach((pose) => {
          for (let i = 0; i <= 12; i++) {
            [1, 0.5].forEach((poseW) => {
              B3.draw(quiet, type, stQ({ yaw, pose, poseT: i / 12, gait: i / 12, move: pose === "walk" ? 1 : 0, poseW, headYaw: ((i % 3) - 1) * 2 }), camN);
              const f = B3.probe().fit;
              lo = Math.min(lo, f);
              hi = Math.max(hi, f);
            });
          }
        });
        if (hi / lo - 1 > 0.03) err(`animal ${type} yaw ${yaw.toFixed(2)} at 1 tile: its size changes ${((hi / lo - 1) * 100).toFixed(1)}% with the pose (fit ${lo.toFixed(3)}..${hi.toFixed(3)}): it would pulse`);
      });
      // F: headYaw past its limit is the limit; fog comes in steps
      B3.draw(quiet, type, stQ({ headYaw: 10 }), cam);
      const far = jointsOf();
      B3.draw(quiet, type, stQ({ headYaw: B3.HEAD_YAW_MAX }), cam);
      if (maxMove(far, jointsOf()) > 1e-9) err(`animal ${type}: headYaw 10 turns the head past HEAD_YAW_MAX`);
      const f1 = drawBeast(type, { fog: 0.3 }, cam, `animal ${type} fog 0.3`);
      const f2 = drawBeast(type, { fog: 0.3 + 0.2 / B3.FOG_STEPS }, cam, `animal ${type} fog a little more`);
      if (f1 && f2 && sig(f1.ops) !== sig(f2.ops)) err(`animal ${type}: fog 0.3 and a little more draw differently (fog must come in steps of 1 / FOG_STEPS)`);
    });
    // G: a robot's lights: zapping they glow through the fog; shut down they are out
    const R = B3.TYPES.robodog;
    if (R) {
      const cam = camFor("robodog", 200);
      const glowing = (o) => {
        const a = drawBeast("robodog", Object.assign({ fog: 0 }, o), cam, `animal robodog ${o.pose} lights (clear)`);
        const z = drawBeast("robodog", Object.assign({ fog: 0.9 }, o), cam, `animal robodog ${o.pose} lights (fogged)`);
        if (!a || !z) return -1;
        let n = 0;
        a.ops.forEach((op, i) => {
          if (op.k !== "fill" && op.k !== "stroke") return;
          const s1 = op.k === "fill" ? op.fillStyle : op.strokeStyle;
          const s2 = op.k === "fill" ? z.ops[i].fillStyle : z.ops[i].strokeStyle;
          const c1 = parse(s1);
          if (c1 && s1 === s2 && c1[0] + c1[1] + c1[2] > 150) n++;
        });
        return n;
      };
      if (glowing({ pose: "zap", poseT: 0.5, yaw: 0.5 }) < 3) err("animal robodog zapping: its visor, antenna and spark do not glow through the fog");
      if (glowing({ pose: "stand", yaw: 0.5 }) < 1) err("animal robodog standing: its visor does not glow through the fog");
      [0, PI / 2, PI, -0.7].forEach((yaw) => {
        if (glowing({ pose: "off", yaw }) !== 0) err(`animal robodog shut down (yaw ${yaw.toFixed(2)}): it still draws a light`);
        B3.draw(quiet, "robodog", stQ({ pose: "off", yaw }), cam);
        if (B3.probe().lit) err("animal robodog shut down: probe().lit says its lights are on");
      });
    }
    // H: missing or broken inputs draw as their defaults (the checking context errs on any non-finite number)
    [{ move: undefined }, { move: NaN }, { gait: NaN }, { gait: Infinity }, { run: NaN }, { poseT: NaN, pose: "bark" }, { poseW: NaN, pose: "sit" }, { wag: NaN }, { headYaw: NaN }, { headYaw: -Infinity }, { yaw: NaN }, { fog: NaN }, { seed: -5 }, { lod: 7 }, { pose: "dance" }, { pose: undefined }, { hit: 1 }].forEach((o) =>
      types.forEach((type) => drawBeast(type, o, camFor(type, 160), `animal ${type} with ${JSON.stringify(o, (k, v) => (typeof v === "number" && !Number.isFinite(v) ? String(v) : v === undefined ? "undefined" : v))}`))
    );
    drawBeast("zz-new", {}, camFor("dog", 160), "animal of an unknown type (draws a dog)");
    // I: the same inputs draw the same with another animal drawn between (no state leaks between draws)
    types.forEach((a, k) => {
      const other = types[(k + 1) % types.length];
      const sa = { yaw: 0.7, gait: 0.37, pose: "walk", move: 1, poseT: 0.6, seed: 3, lod: k % 3, fog: 0.2, headYaw: 0.4 };
      const cam = camFor(a, 180);
      const one = drawBeast(a, sa, cam, `animal ${a} (determinism, first)`);
      drawBeast(other, { yaw: -2, pose: B3.TYPES[other].poses[2], poseT: 0.4, poseW: 0.6, seed: 8, lod: (k + 1) % 3, fog: 0.7, run: 0.5, move: 1 }, camFor(other, 120, 1.2), `animal ${other} (determinism, between)`);
      const two = drawBeast(a, sa, cam, `animal ${a} (determinism, again)`);
      if (one && two && sig(one.ops) !== sig(two.ops)) err(`animal ${a}: drawing a ${other} in between changed how the same ${a} draws`);
    });
    // J: the colour table converges: random continuous inputs use a bounded set of colour strings (a bite's flash only on
    // Rivet, now and then: the dog is never hurt)
    const colours = new Set();
    let late = 0;
    let addLate = 0;
    const grab = new Proxy({}, { get: () => noop, set: (o, k, v) => ((k === "fillStyle" || k === "strokeStyle") && !colours.has(v) && (colours.add(v), (late += addLate)), true) });
    let seedR = 11;
    const rr = () => (seedR = (seedR * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let i = 0; i < 2400; i++) {
      if (i === 1600) addLate = 1;
      const type = types[i % types.length];
      const ps = B3.TYPES[type].poses;
      B3.draw(grab, type, stQ({ yaw: rr() * 6.3 - 3.15, gait: rr(), poseT: rr(), poseW: rr(), fog: rr() * 0.9, pose: ps[i % ps.length], move: rr(), run: i % 4 ? 0 : rr(), wag: rr(), headYaw: rr() * 2 - 1, lod: i % 3, hit: type === "robodog" && i % 21 === 1 ? 1 : 0 }), camFor(type, 120));
    }
    if (colours.size > BEAST_COLOURS) err(`animals: ${colours.size} colour strings in 2400 random draws (over ${BEAST_COLOURS})`);
    if (late > colours.size * 0.05) err(`animals: the last 800 of 2400 random draws still made ${late} new colours (of ${colours.size}): light or fog is not stepped`);
  }
  // K: seen from above (the road's angled camera, should an animal ever ride along there): room under the feet
  // (cam.floor) and no shadow of its own; and the two options left off draw exactly as without them
  types.forEach((type) => {
    const t = B3.TYPES[type];
    [5, 8].forEach((eye) => {
      [[3, 80], [12, 40], [40, 12]].forEach(([dist, px]) => {
        const b = B3.box(type);
        const pad = 2 + Math.max(0.7, Math.min(3.2, px * 0.0105));
        const up = Math.ceil(b.h * px * 1.6 + pad);
        const fl = Math.min(Math.ceil(eye * (dist / Math.max(0.3, dist - t.envRun.rh) - 1) * px + pad + 2), Math.floor(up * 1.5));
        const cam = { w: Math.ceil(t.wRun * px * 1.1 + 2 * pad), h: up + fl, px, dist, eye, floor: fl, shadow: false };
        t.poses.forEach((pose, i) => {
          const what = `animal ${type} from above (eye ${eye}, ${dist} tiles) ${pose}`;
          const r = drawBeast(type, { pose, yaw: i * 1.3, lod: i % 3, move: pose === "walk" ? 1 : 0, run: i % 2 }, cam, what);
          if (r && r.ops.some((op) => op.k === "fill" && op.fillStyle === SHADOW_FILL)) err(`${what}: drew its own contact shadow with cam.shadow false`);
        });
      });
    });
    [[0.5, 1.2, 200], [0.5, 3, 120], [0.5, 25, 16]].forEach(([eye, dist, h], ci) => {
      t.poses.forEach((pose, i) => {
        const b = B3.box(type);
        const cam = { w: Math.ceil((b.w * h) / b.h), h, px: h / b.h, dist, eye };
        const st = { pose, yaw: 0.7 - ci, lod: (i + ci) % 3, poseT: 0.3, move: pose === "walk" ? 1 : 0, fog: ci * 0.2 };
        const plain = drawBeast(type, st, cam, `animal ${type} ${pose} (no options)`);
        [{ floor: 0 }, { shadow: true }].forEach((opt) => {
          const r = drawBeast(type, st, Object.assign({}, cam, opt), `animal ${type} ${pose} with ${JSON.stringify(opt)}`);
          if (plain && r && sig(r.ops) !== sig(plain.ops)) err(`animal ${type} ${pose}: cam ${JSON.stringify(opt)} draws differently from no option`);
        });
        const r0 = drawBeast(type, Object.assign({}, st, { run: 0 }), cam, `animal ${type} ${pose} with st.run 0`);
        if (plain && r0 && sig(r0.ops) !== sig(plain.ops)) err(`animal ${type} ${pose}: st.run 0 draws differently from no run`);
      });
    });
  });
  // L: the two-legged plan (stage 3's chickens): a stand-in bird, two legs under its body and two wings, draws
  // cleanly through the same rig in every pose, from every side, at every detail (registered here only, in the test)
  B3.addType("zz-bird", {
    plan: "biped",
    skin: "fur",
    h: 0.3,
    w: 0.36,
    r: 0.12,
    poses: ["stand", "walk", "sit", "lie"],
    build: {
      len: 0.07, hipH: 0.12, shH: 0.14, hipFwd: 0.035, hindZ: 0.035,
      body: [[0.1, 0, 0.045, 0.045, 0.06], [0.8, 0.005, 0.04, 0.045, 0.045]],
      neck: [0.04, 0.018], neckAng: 1.3,
      head: [0.022, 0.024, 0.024], headUp: 0.012, headFwd: 0.006, headPitch: 0,
      snout: [0.02, 0.008, 0.007, -0.004, 0.018],
      hipW: 0.018, shW: 0.02, footW: 0.018, hind: [0.045, 0.045], fore: [0.03, 0.03], pastern: [0.01, 0.03], hindAng: 0.2,
      legR: [0.01, 0.006, 0.016, 0.006, 0.005], paw: [0.012, 0.004, 0.016], pawR: 0.004,
      tail: [0.04, 0.012, 0.01], tailAt: [0.02, -0.02], tailUp: 0.9,
      sitH: 0.05, sitNeck: 1.3, lieH: 0.05, lieNeck: 1.2, shadow: [0.05, 0.06],
      wing: { x: 0.04, u: 0.005, f: -0.01, len: 0.06, r: 0.018 },
    },
    gait: { stride: 0.18, duty: 0.6, lift: 0.03, phase: [0, 0, 0, 0.5] },
    look: { fur: "#f2efe6", shade: "#cfc8b8", light: "#ffffff", eye: "#120d0a", wing: "#e8e2d4", beak: "#e0a030", legCol: "#e3b23c" },
  });
  if (!B3.TYPES["zz-bird"] || B3.TYPES["zz-bird"].plan !== "biped") err("Beast3D.addType does not keep a two-legged plan");
  else {
    POSES.forEach((pose) => {
      for (let k = 0; k < 8; k++) {
        for (let lod = 0; lod < 3; lod++) {
          const what = `animal stand-in bird (biped) ${pose} yaw ${(k * 0.785).toFixed(2)} lod ${lod}`;
          drawBeast("zz-bird", { pose, yaw: k * 0.785, lod, move: pose === "walk" ? 1 : 0, wag: 1 }, camFor("zz-bird", 160), what);
        }
      }
    });
    if (B3.probe().j.length / 3 < 29) err("Beast3D.probe(): the joints lack the wing slots");
    delete B3.TYPES["zz-bird"];
  }
  sb.document.createElement = realCreate;
  const h = types.map((t) => `${t} ${B3.box(t).h} (head ${B3.box(t).head.toFixed(3)})`).join(", ");
  console.log(`animals in 3D: ${beastDraws} draws checked; the most canvas calls at lod 0 / 1 / 2: ${worst.join(" / ")} (ceilings ${BEAST_OPS.join(" / ")}); box heights, tiles: ${h}`);
}

/* ---------- The road's flying bits (js/sprites.js) ----------
   The road's walkers are the 3D figures above, seen through the angled camera (tests/validate-drive.js draws them on
   the road, and the title screen's still scene); the old top-down walkers went with the flat camera (2026-10-17).
   What the road still draws flat from js/sprites.js: blood drops and splats, kill dust and sparks, each cleanly. */
const ROAD_OPS = 60; // SCALE: most canvas calls one of the road's particles may make (a busy road draws hundreds)
let roadDraws = 0;
{
  ["world.js", "upgrades.js", "sprites.js"].forEach((f) => {
    if (!pageScripts.includes(f)) err(`index.html does not load js/${f}`);
    load(f);
  });
  const Dr = ZSR.Draw;
  if (!Dr || typeof Dr.particle !== "function") err("js/sprites.js does not export Draw.particle");
  else {
    ["zombie", "zombieShadow", "zombieDown", "ZOMBIE_LOOK"].forEach((k) => k in Dr && err(`js/sprites.js still has the top-down road's Draw.${k} (the road's walkers are Walker3D figures)`));
    /** Draw on a fresh checking canvas; returns its calls (null after reporting a throw). */
    const roadDraw = (what, fn) => {
      const c = element("canvas");
      const ctx = c.getContext("2d");
      current = what;
      try {
        fn(ctx);
      } catch (e) {
        err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
        return null;
      }
      roadDraws++;
      const ops = c.ops;
      if (ops.length > ROAD_OPS) err(`${what}: ${ops.length} canvas calls (over ${ROAD_OPS})`);
      if (ops.filter((o) => o.k === "save").length !== ops.filter((o) => o.k === "restore").length) err(`${what}: save and restore do not pair up`);
      return ops;
    };
    // blood drops and splats on the road, and the other particles
    [{ blood: true, vx: 90, vy: -40 }, { blood: true, splat: true, vx: 0, vy: 0, rot: 0.4 }, { grow: true, vx: 10, vy: 0 }, { vx: 100, vy: 100 }].forEach((p, i) =>
      roadDraw(`road particle ${i}`, (ctx) => Dr.particle(ctx, Object.assign({ x: 10, y: 10, life: 0.2, maxLife: 0.4, size: 3, color: "#a3201a" }, p)))
    );
    console.log(`road particles: ${roadDraws} drawn`);
  }
}

/* ---------- The van model (js/model3d.js, js/van3d.js: loaded after upgrades.js, as the page does) ----------
   One 3D van everywhere it is seen. Every paint look with the gear at 0, 1, 3, its top (Upgrades.DEFS max) and mixed,
   the dents, the roof gun and each level of detail, drawn from all round (16 yaws by 3 pitches, the road camera's
   behind and above among them), near (parts cut by the camera's near plane) and far, on the checking context: no
   throw, finite numbers and real colours, no images, gradients, read-backs or new canvases, transforms only round its
   text (inside save and restore, never mirrored), within its canvas-call ceiling at every view, the same calls twice.
   Each look's decal is on both sides and the hood, and on the roof and the back doors at lod 1, bare and with all its
   gear (what the road's camera sees: validate-engine.js checks it shows there); a look, a gear level (two-digit ones
   too) or a dent tier changes its signature, and the same signature is the same built model. Seen from beside it at
   the yard's eye, its parts are drawn in the order the eye sees them (a ray cast through the model); no hidden face
   shows from the yard's eye or from above; every decal lies inside its face. validate-engine.js checks every upgrade
   step shows. */
// SCALE: most canvas calls the van may make at lod 0 / 1 / 2, with all its gear at its top (Upgrades.DEFS max), the gun
// and heavy dents, from any side: the road draws it every frame (the owner's lag problem). New gear or a busier look
// must fit under these. lod 0
// rose from 1400 to 1450 (2026-10-18) for each paint job's roof and back designs (every look must read from the road's
// camera): Convoy Red's flames make 1447 from nearly straight above, the other looks at most 1399 (the roof under the
// rack and the back glass under the Armor 3 plates are left out to make room; 6 of those are the gun's middle barrel's
// root, drawn since it shows at lod 1, where its jacket is not, and the road draws no gun). Timed through the road's camera in
// Chromium the van drew about 10 to 15% slower than before on average over the looks, about 0.6 ms with all its gear
const VAN_OPS = [1450, 700, 350];
const VAN_YAWS = 16;
const VAN_PITCHES = [0.1, 0.5, 0.86]; // radians up from level: the yard's eye, above, the road camera's
// SCALE: least area (square model units) of a look's decal on the roof, and on the back doors, at lod 1, bare and with
// all its gear (the roof under the rack left out): about an 8 x 8 patch, a dozen pixels across on the road
const VAN_DECAL_AREA = 60;
let vanDraws = 0;
const decalAreas = [];
{
  ["model3d.js", "van3d.js"].forEach((f, i) => {
    const at = pageScripts.indexOf(f);
    if (at < 0) err(`index.html does not load js/${f}`);
    else {
      if (at < pageScripts.indexOf("upgrades.js")) err(`index.html loads js/${f} before upgrades.js (the van's looks are PAINT_LOOKS)`);
      if (i && at < pageScripts.indexOf("model3d.js")) err("index.html loads js/van3d.js before js/model3d.js");
    }
    load(f);
  });
  const M3 = ZSR.Model3D;
  const V3 = ZSR.Van3D;
  const LOOKS = (ZSR.Upgrades && ZSR.Upgrades.PAINT_LOOKS) || [];
  if (!M3 || !V3) err("js/van3d.js does not export ZSR.Van3D (or js/model3d.js ZSR.Model3D)");
  else {
    // the interface the yard, the road, the garage and the bench draw it through
    ["L", "W", "H"].forEach((k) => (finite(V3[k]) && V3[k] > 0) || err(`Van3D.${k} is ${V3[k]}`));
    ["sig", "mesh", "draw", "dentTier", "dentNow", "lookOf"].forEach((k) => typeof V3[k] === "function" || err(`Van3D.${k} is not a function`));
    const D3 = V3.DENTS || [];
    if (!(D3.length === 2 && D3[0] < 1 && D3[1] > 0 && D3[1] < D3[0])) err(`Van3D.DENTS is ${JSON.stringify(D3)} (two health shares, falling)`);
    else if (V3.dentTier(1) !== 0 || V3.dentTier(D3[0] - 0.01) !== 1 || V3.dentTier(D3[1] - 0.01) !== 2 || V3.dentTier(0) !== 2) err("Van3D.dentTier does not give 0 / 1 / 2 at full health, under DENTS[0] and under DENTS[1]");
    if (V3.lookOf({ paint: LOOKS.length + 5 }) !== LOOKS[LOOKS.length - 1] || V3.lookOf({}) !== LOOKS[0] || V3.lookOf({ paint: -3 }) !== LOOKS[0]) err("Van3D.lookOf does not keep the paint inside PAINT_LOOKS");
    // (the decal kinds it has designs for: js/van3d.js DECALS)
    if (!Array.isArray(V3.DECAL_KINDS) || !V3.DECAL_KINDS.includes("none")) err(`Van3D.DECAL_KINDS is ${JSON.stringify(V3.DECAL_KINDS)} (DECALS' kinds, the bare primer's "none" among them)`);
    const KINDS = new Set(V3.DECAL_KINDS || []);
    LOOKS.forEach((l, i) => {
      if (!KINDS.has(l.decal)) err(`PAINT_LOOKS[${i}] ${l.name}: the van draws no decal "${l.decal}" (js/van3d.js DECALS)`);
      ["body", "roof", "trim", "bumper", "rims", "decalA", "decalB"].forEach((k) => (typeof l[k] === "string" && COLOR.test(l[k])) || err(`PAINT_LOOKS[${i}] ${l.name}: ${k} is ${l[k]}`));
    });
    const GEAR_KEYS = ["armor", "bumper", "engine", "damage", "fireRate", "spread"];
    const DEFS = (ZSR.Upgrades && ZSR.Upgrades.DEFS) || {};
    const NONE = { armor: 0, bumper: 0, engine: 0, damage: 0, fireRate: 0, spread: 0 };
    // every gear upgrade at its top (Upgrades.DEFS max: a level added there is drawn and checked here)
    const ALL = {};
    GEAR_KEYS.forEach((k) => (ALL[k] = DEFS[k] ? DEFS[k].max : 5));
    const GEARS = [NONE, { armor: 1, bumper: 1, engine: 1, damage: 1, fireRate: 1, spread: 1 }, { armor: 3, bumper: 3, engine: 3, damage: 3, fireRate: 3, spread: 2 }, ALL, { armor: 4, bumper: 1, engine: 3, damage: 2, fireRate: 5, spread: 1 }, { armor: 2, bumper: 5, engine: 0, damage: 5, fireRate: 0, spread: 3 }];
    // a camera round the van's middle: yaw 0 behind it, turning to its right; pitch up from level; dist from its middle
    const camera = (yaw, pitch, dist, lod, near, w, h) => {
      const t = [0, 0, V3.H / 2];
      const e = [t[0] + Math.sin(yaw) * Math.cos(pitch) * dist, t[1] - Math.cos(yaw) * Math.cos(pitch) * dist, t[2] + Math.sin(pitch) * dist];
      const nz = (a) => {
        const l = Math.hypot(a[0], a[1], a[2]);
        return [a[0] / l, a[1] / l, a[2] / l];
      };
      const f = nz([t[0] - e[0], t[1] - e[1], t[2] - e[2]]);
      const r = nz([f[1], -f[0], 0]);
      const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
      const F = h / 2 / Math.tan(0.4);
      const L = nz([-0.45, -0.3, 0.84]);
      const view = M3.view({ ink: 1.5, lod, near: near || 0, eye: e, lit: (x, y, z) => 0.62 + 0.55 * Math.max(0, x * L[0] + y * L[1] + z * L[2]) });
      view.project = (x, y, z) => {
        const dx = x - e[0];
        const dy = y - e[1];
        const dz = z - e[2];
        const D = dx * f[0] + dy * f[1] + dz * f[2];
        view.D = D;
        const s = F / Math.max(D, 1e-6);
        view.X = w / 2 + (dx * r[0] + dy * r[1] + dz * r[2]) * s;
        view.Y = h / 2 - (dx * u[0] + dy * u[1] + dz * u[2]) * s;
        return D > view.near;
      };
      return view;
    };
    const FORBID = new Set(["drawImage", "createLinearGradient", "createRadialGradient", "createPattern", "getImageData", "putImageData", "set shadowBlur", "set filter", "resetTransform", "setTransform"]);
    let made = 0;
    const realCreate = sb.document.createElement;
    sb.document.createElement = (t) => {
      made++;
      return realCreate(t);
    };
    const vsig = (ops) => JSON.stringify(ops.map((op) => [op.k, op.args, op.fillStyle, op.strokeStyle, op.lineWidth]));
    /** Draw the van once on a fresh checking canvas; returns its calls (null after reporting). */
    const vanDraw = (u, o, view, what) => {
      const c = element("canvas");
      c.width = 400;
      c.height = 300;
      const ctx = c.getContext("2d");
      current = what;
      const before = made;
      noRead = true;
      try {
        V3.draw(ctx, view, u, o);
      } catch (e) {
        noRead = false;
        err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
        return null;
      }
      noRead = false;
      vanDraws++;
      if (made !== before) err(`${what}: made ${made - before} canvas(es) while drawing`);
      const ops = c.ops;
      const lod = view.lod;
      if (ops.length > VAN_OPS[lod]) err(`${what}: ${ops.length} canvas calls, over the lod ${lod} ceiling of ${VAN_OPS[lod]}`);
      const bad = ops.find((op) => FORBID.has(op.k));
      if (bad) err(`${what}: calls ${bad.k} (the van draws straight: no images, gradients or read-backs)`);
      // transforms only round text: save, transform, fillText, restore; and the text never mirrored
      let depth = 0;
      for (let i = 0; i < ops.length; i++) {
        const k = ops[i].k;
        if (k === "save") depth++;
        else if (k === "restore") depth--;
        else if (k === "transform" || k === "translate" || k === "scale" || k === "rotate") {
          if (k !== "transform" || depth < 1 || !ops[i + 1] || ops[i + 1].k !== "fillText") err(`${what}: ${k} outside the text's save and restore`);
          else {
            const [a, b, cc, d] = ops[i].args;
            if (!(a * d - b * cc > 0)) err(`${what}: text "${ops[i + 1].args[0]}" drawn mirrored (its map's determinant is ${(a * d - b * cc).toFixed(3)})`);
          }
          i++;
        } else if (k === "fillText" && depth < 1) err(`${what}: text outside save and restore`);
        if (depth < 0) err(`${what}: restore without save`);
      }
      if (depth !== 0) err(`${what}: save and restore do not pair up`);
      return ops;
    };
    const gearName = (g) => `a${g.armor}b${g.bumper}e${g.engine} gun ${g.damage}/${g.fireRate}/${g.spread}`;
    let worst = [0, 0, 0];
    // A: the ceilings: every look, all its gear at its top, the gun, heavy dents, each level of detail, from all round
    // (and from nearly straight above), far and near; a few drawn twice the same. (At lod 1 and 2, from the higher views,
    // where they see the most: the roof's gear, a side and an end)
    LOOKS.forEach((look, p) => {
      for (let lod = 0; lod < 3; lod++) {
        for (let yi = 0; yi < VAN_YAWS; yi++) {
          (lod ? VAN_PITCHES.slice(-1) : VAN_PITCHES).concat([1.3]).forEach((pitch, pi) => {
            const yaw = (yi / VAN_YAWS) * Math.PI * 2;
            const what = `van ${look.name} all gear at the top lod ${lod} yaw ${yaw.toFixed(2)} pitch ${pitch}`;
            const u = Object.assign({ paint: p }, ALL);
            const ops = vanDraw(u, { dent: 2, gun: true }, camera(yaw, pitch, 380, lod, 0, 400, 300), what);
            if (!ops) return;
            worst[lod] = Math.max(worst[lod], ops.length);
            if ((yi + pi) % 7 === 0) {
              const again = vanDraw(u, { dent: 2, gun: true }, camera(yaw, pitch, 380, lod, 0, 400, 300), what + " (again)");
              if (again && vsig(again) !== vsig(ops)) err(`${what}: the same van and view drew different calls`);
            }
          });
          // near: the camera inside the van's reach, parts behind its near plane cut off
          if (yi % 4 === lod) vanDraw(Object.assign({ paint: p }, ALL), { dent: 2, gun: true }, camera((yi / VAN_YAWS) * Math.PI * 2 + 0.3, 0.35, 75, lod, 25, 400, 300), `van ${look.name} all gear at the top lod ${lod} near, yaw ${yi}`);
        }
      }
      // B: every gear set, dent tier, gun or none, at a level of detail by turns, from all round near and far
      GEARS.forEach((g, gi) => {
        [0, 1, 2].forEach((dent) => {
          [false, true].forEach((gun) => {
            {
              const k = gi * 18 + dent * 6 + (gun ? 3 : 0) + p;
              const lod = k % 3;
              const yaw = ((k * 5 + p * 3) % VAN_YAWS) * ((Math.PI * 2) / VAN_YAWS);
              const pitch = VAN_PITCHES[k % VAN_PITCHES.length];
              const near = k % 5 === 0;
              vanDraw(Object.assign({ paint: p }, g), { dent, gun }, camera(yaw, pitch, near ? 80 : 300, lod, near ? 25 : 0, 320, 240), `van ${look.name} ${gearName(g)} dents ${dent}${gun ? " with the gun" : ""} lod ${lod} yaw ${yaw.toFixed(2)}${near ? " near" : ""}`);
            }
          });
        });
      });
    });
    // C: a look's decal lies on both sides and the hood, in its decal colour; and on the roof and the back doors at
    // lod 1 (the road's camera, behind and above, sees those two: it draws the van at lod 0 or 1), at least
    // VAN_DECAL_AREA square units of it on each. The bare primer's patches are its own (either of its colours)
    const sideOf = (f) => (f.nx > 0.7 ? 1 : f.nx < -0.7 ? -1 : 0);
    const roofOf = (f) => f.nz > 0.6 && f.cz > V3.H - 5;
    const backOf = (f) => f.ny < -0.9;
    /** A decal's area (square model units): its outline's, as laid on its face (text: about a quarter of each letter's
        square is ink). */
    const areaOf = (d) => {
      if (d.k === 2) return d.str.length * d.size * d.size * 0.25;
      let x = 0;
      let y = 0;
      let z = 0;
      for (let i = 0; i < d.n; i++) {
        const j = (i + 1) % d.n;
        const [ax, ay, az] = [d.p[i * 3], d.p[i * 3 + 1], d.p[i * 3 + 2]];
        const [bx, by, bz] = [d.p[j * 3], d.p[j * 3 + 1], d.p[j * 3 + 2]];
        x += ay * bz - az * by;
        y += az * bx - ax * bz;
        z += ax * by - ay * bx;
      }
      return Math.hypot(x, y, z) / 2;
    };
    LOOKS.forEach((look, p) => {
      for (const gear of [NONE, ALL]) {
        const m = V3.mesh(Object.assign({ paint: p }, gear), {});
        const want = new Set((look.decal === "none" ? [look.decalA, look.decalB] : [look.decalA]).map((c) => M3.rgb(c).slice(0, 3).join(",")));
        const mine = (d) => want.has(d.rgb.slice(0, 3).join(","));
        const body = (fn) => m.parts.filter((pt) => ["body", "nose", "low"].includes(pt.name)).forEach((pt) => pt.faces.forEach(fn));
        const has = (pred) => {
          let yes = false;
          body((f) => (yes = yes || (pred(f) && f.decals.some(mine))));
          return yes;
        };
        // (the area of its outlines and text there, at lod 1)
        const area = (pred) => {
          let a = 0;
          body((f) => pred(f) && f.decals.forEach((d) => d.k !== 1 && d.lod >= 1 && mine(d) && (a += areaOf(d))));
          return a;
        };
        const what = `van ${look.name}${gear === ALL ? " with all its gear" : ""}`;
        const name = look.decal === "none" ? "primer patches" : `${look.decal} decal (decalA)`;
        if (gear === NONE) {
          if (look.decal !== "none" && !has((f) => sideOf(f) > 0)) err(`${what}: no ${name} on its right side`);
          if (look.decal !== "none" && !has((f) => sideOf(f) < 0)) err(`${what}: no ${name} on its left side`);
          if (look.decal !== "none" && !has((f) => f.nz > 0.6 && f.cy > 30 && f.cz < 35)) err(`${what}: no ${name} on its hood`);
        }
        // (with all the gear: the roof under the rack is left out, so what is round it must still be there)
        const roof = area(roofOf);
        const back = area(backOf);
        if (roof < VAN_DECAL_AREA) err(`${what}: only ${roof.toFixed(0)} sq units of its ${name} on its roof at lod 1 (want ${VAN_DECAL_AREA}: the road's camera sees the roof)`);
        if (back < VAN_DECAL_AREA) err(`${what}: only ${back.toFixed(0)} sq units of its ${name} on its back doors at lod 1 (want ${VAN_DECAL_AREA}: the road's camera sees them)`);
        decalAreas.push(`${look.name}${gear === ALL ? "+gear" : ""} ${roof.toFixed(0)}/${back.toFixed(0)}`);
      }
    });
    // D: the signature changes with the look, each gear and gun level up to its top (Upgrades.DEFS max), the dents and
    // the gun; and past the top, for a bigger game: two-digit levels never run together (damage 1 and fire rate 12 is
    // not damage 11 and fire rate 2). One signature, one built model
    const sigOf = new Map(); // each van (its upgrades and options, as JSON) -> its signature
    const addSig = (u, o) => sigOf.set(JSON.stringify([u, o]), V3.sig(u, o));
    LOOKS.forEach((l, p) => {
      for (const k of GEAR_KEYS) {
        const gun = !["armor", "bumper", "engine"].includes(k);
        for (let lv = 0; lv <= ALL[k]; lv++) addSig(Object.assign({ paint: p }, NONE, { [k]: lv }), { gun });
      }
    });
    const BIG = [0, 1, 2, 10, 11, 12];
    for (const a of BIG) for (const b of BIG) for (const c of BIG) {
      addSig(Object.assign({ paint: 0 }, NONE, { damage: a, fireRate: b, spread: c }), { gun: true });
      addSig(Object.assign({ paint: 0 }, NONE, { armor: a, bumper: b, engine: c }), { gun: false });
    }
    const vanOfSig = new Map();
    for (const [van, s] of sigOf) {
      if (vanOfSig.has(s)) {
        err(`Van3D.sig: ${vanOfSig.get(s)} and ${van} have the same signature "${s}" (one would be drawn with the other's built model)`);
        break;
      }
      vanOfSig.set(s, van);
    }
    const s0 = V3.sig(ALL, {});
    if (V3.sig(ALL, { dent: 1 }) === s0 || V3.sig(ALL, { dent: 2 }) === V3.sig(ALL, { dent: 1 }) || V3.sig(ALL, { gun: true }) === s0) err("Van3D.sig does not change with the dents or the gun");
    if (V3.sig(Object.assign({}, ALL, { damage: 1 }), { gun: true }) === V3.sig(ALL, { gun: true })) err("Van3D.sig does not change with the gun's upgrades when the gun is on");
    if (V3.mesh(ALL, { dent: 1 }) !== V3.mesh(ALL, { dent: 1 })) err("Van3D.mesh builds a new model for the same van (it must keep it)");

    // E, F and G read the built model's faces. A face's corner i; how far a point in a face's plane is inside its
    // outline (units; < 0 outside); where the ray eye + t d meets a face inside its outline grown by margin units (t,
    // else Infinity); how far a screen point is inside a screen outline (px, either winding)
    const cornerOf = (f, i) => [f.p[i * 3], f.p[i * 3 + 1], f.p[i * 3 + 2]];
    const inFace = (f, q) => {
      let m = Infinity;
      for (let i = 0; i < f.n; i++) {
        const a = cornerOf(f, i);
        const b = cornerOf(f, (i + 1) % f.n);
        const [ex, ey, ez] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const [wx, wy, wz] = [q[0] - a[0], q[1] - a[1], q[2] - a[2]];
        m = Math.min(m, ((ey * wz - ez * wy) * f.nx + (ez * wx - ex * wz) * f.ny + (ex * wy - ey * wx) * f.nz) / Math.hypot(ex, ey, ez));
      }
      return m;
    };
    const rayHit = (f, e, d, margin) => {
      const den = f.nx * d[0] + f.ny * d[1] + f.nz * d[2];
      if (Math.abs(den) < 1e-12) return Infinity;
      const t = (f.nx * (f.p[0] - e[0]) + f.ny * (f.p[1] - e[1]) + f.nz * (f.p[2] - e[2])) / den;
      if (!(t > 1e-9)) return Infinity;
      return inFace(f, [e[0] + d[0] * t, e[1] + d[1] * t, e[2] + d[2] * t]) >= -margin ? t : Infinity;
    };
    const inScreen = (S, x, y) => {
      let area = 0;
      for (let i = 0; i < S.length; i++) area += S[i][0] * S[(i + 1) % S.length][1] - S[(i + 1) % S.length][0] * S[i][1];
      if (Math.abs(area) < 1e-9) return -1;
      let m = Infinity;
      for (let i = 0; i < S.length; i++) {
        const [ax, ay] = S[i];
        const [bx, by] = S[(i + 1) % S.length];
        m = Math.min(m, (Math.sign(area) * ((bx - ax) * (y - ay) - (by - ay) * (x - ax))) / (Math.hypot(bx - ax, by - ay) || 1));
      }
      return m;
    };
    /** Points spread over a face: its middle, and each of us of the way out to every corner. */
    const pointsOn = (f, us) => {
      const out = [[f.cx, f.cy, f.cz]];
      for (const u of us) for (let i = 0; i < f.n; i++) {
        const c = cornerOf(f, i);
        out.push([f.cx + (c[0] - f.cx) * u, f.cy + (c[1] - f.cy) * u, f.cz + (c[2] - f.cz) * u]);
      }
      return out;
    };
    const facesEye = (f, e) => f.nx * (e[0] - f.cx) + f.ny * (e[1] - f.cy) + f.nz * (e[2] - f.cz) > 0;
    // the yard's camera (js/modelsprite.js): the eye 0.5 tiles up, looking level (here at the van's middle), its near
    // cut MODEL_NEAR 0.02 tiles; VAN_TILE road units a tile; a 640 x 576 picture, as the yard draws the van up close
    const TILE = 62.5;
    const yardView = (ex, ey, lod) => {
      const e = [ex, ey, 0.5 * TILE];
      const l = Math.hypot(ex, ey);
      const [fx, fy] = [-ex / l, -ey / l];
      const view = M3.view({ ink: 1.5, lod, near: 0.02 * TILE, eye: e, lit: () => 1 });
      view.project = (x, y, z) => {
        const dx = x - e[0];
        const dy = y - e[1];
        const D = dx * fx + dy * fy;
        view.D = D;
        const s = 384 / Math.max(D, 1e-6);
        view.X = 320 + (dx * fy - dy * fx) * s;
        view.Y = 288 - (z - e[2]) * s;
        return D > view.near;
      };
      return view;
    };

    // E: the parts' order from beside the van, as the yard's eye sees it under its roof, 0.3 to 1 tile off its sides
    // along its length (there the near plane cuts the nose, the plow and the parts' boxes): where a part drawn later
    // covers a point of the screen the part nearest there covers, that is the nearest part (the eye's ray through the
    // point, cast against every face, meets it first). With Ram Plow 1 the plow's box crossed the near plane and was
    // taken as all of the screen, and the roof gun went over the cab door's side, the plow over the nose
    /** After a draw of model m: what is drawn over a nearer part ([later, nearer] part names, one a point). */
    const orderFaults = (m, view) => {
      const e = view.eye;
      const act = m.parts.map((pt, i) => i).filter((i) => m.parts[i].lod >= view.lod);
      const rank = new Map(act.map((_, k) => [m.order[k], k]));
      const drawn = [];
      for (const pi of act)
        for (const f of m.parts[pi].faces) {
          if (f.hide || !facesEye(f, e)) continue;
          const S = [];
          for (let i = 0; i < f.n && view.project(...cornerOf(f, i)); i++) S.push([view.X, view.Y]);
          if (S.length === f.n) drawn.push({ pi, f, S }); // (a face the near plane cuts is left out)
        }
      const faults = [];
      for (const { f } of drawn) {
        for (const P of pointsOn(f, [0.5, 0.85])) {
          const d = [P[0] - e[0], P[1] - e[1], P[2] - e[2]];
          let best = Infinity;
          let bp = -1;
          let bf = null;
          for (const qi of act) for (const g of m.parts[qi].faces) {
            const t = rayHit(g, e, d, 0);
            if (t < best) [best, bp, bf] = [t, qi, g];
          }
          if (!bf || bf.hide) continue; // (F's)
          view.project(...P);
          const [X, Y] = [view.X, view.Y];
          if (!drawn.some((o) => o.pi === bp && inScreen(o.S, X, Y) > 1)) continue;
          let top = -1;
          for (const o of drawn) if (o.pi !== bp && rank.get(o.pi) > rank.get(bp) && (top < 0 || rank.get(o.pi) > rank.get(top)) && inScreen(o.S, X, Y) > 1) top = o.pi;
          if (top < 0) continue;
          const tt = Math.min(...m.parts[top].faces.map((g) => rayHit(g, e, d, 0)));
          if (tt > best * 1.002) faults.push([m.parts[top].name, m.parts[bp].name]);
        }
      }
      return faults;
    };
    {
      const eyes = [[57.6, 40.3], [50.6, 40]]; // (beside the cab door, 0.4 and 0.3 tiles out)
      for (const s of [1, -1]) for (const off of [0.3, 0.5, 1]) for (let y = -70; y <= 80; y += 10) eyes.push([s * (V3.W / 2 + off * TILE), y]);
      for (const [name, g] of [["Ram Plow 1", { bumper: 1 }], ["all its gear", ALL]]) {
        const u = Object.assign({ paint: 1 }, NONE, g);
        const o = { dent: 0, gun: true };
        const m = V3.mesh(u, o);
        for (const lod of [0, 1]) {
          let first = null;
          let n = 0;
          for (const [ex, ey] of eyes) {
            const view = yardView(ex, ey, lod);
            if (!vanDraw(u, o, view, `van with ${name} and the gun from the yard's eye at (${ex}, ${ey}) lod ${lod}`)) continue;
            const f = orderFaults(m, view);
            if (f.length && !first) first = `(${ex.toFixed(1)}, ${ey}): the ${f[0][0]} drawn over the nearer ${f[0][1]}`;
            n += f.length;
          }
          if (n) err(`van with ${name} and the gun, from the yard's eye beside it at lod ${lod}: ${n} points of a part drawn over a nearer one (js/model3d.js draw's order), first at ${first}`);
        }
      }
    }

    // F: a hidden face (Builder face o.hide: never drawn) never shows. From the yard's eye all round the van, 0.3 to 8
    // tiles off it, and from above all round (the road's, the garage's and the bench's cameras), where a hidden face
    // faces the eye the eye's ray to it meets another face first (a seam under HIDE_SEAM units, a sliver seen edge on, is
    // let pass), at every level of detail. The gun's undersides were hidden once, and the yard saw through the barrels
    const HIDE_SEAM = 0.4;
    {
      const eyesF = [];
      for (const off of [0.3, 0.6, 1, 2, 4, 8]) for (let a = 0; a < 24; a++) {
        const [c, s] = [Math.cos((a / 24) * Math.PI * 2), Math.sin((a / 24) * Math.PI * 2)];
        const k = Math.min(V3.W / 2 / Math.abs(c || 1e-9), V3.L / 2 / Math.abs(s || 1e-9));
        eyesF.push([c * (k + off * TILE), s * (k + off * TILE), 0.5 * TILE]);
      }
      for (const pitch of [0.15, 0.5, 0.86, 1.2]) for (let y = 0; y < 16; y++) {
        const yaw = (y / 16) * Math.PI * 2;
        eyesF.push([Math.sin(yaw) * Math.cos(pitch) * 430, -Math.cos(yaw) * Math.cos(pitch) * 430, V3.H / 2 + Math.sin(pitch) * 430]);
      }
      const early = { armor: 1, bumper: 1, engine: 2, damage: 1, fireRate: 2, spread: 1 };
      const mid = { armor: 3, bumper: 3, engine: 3, damage: 3, fireRate: 4, spread: 2 };
      for (const g of [NONE, early, mid, ALL]) {
        const m = V3.mesh(Object.assign({ paint: 1 }, g), { dent: 0, gun: true });
        for (let lod = 0; lod < 3; lod++) {
          const act = m.parts.filter((pt) => pt.lod >= lod);
          const shows = new Map(); // a hidden face that shows -> how many eyes see it
          for (const e of eyesF)
            for (const pt of act)
              pt.faces.forEach((h, hi) => {
                if (!h.hide || !facesEye(h, e)) return;
                const seen = pointsOn(h, [0.5, 0.9]).some((P) => {
                  const d = [P[0] - e[0], P[1] - e[1], P[2] - e[2]]; // (t = 1 at the hidden face)
                  for (const q of act) for (const g2 of q.faces) if (g2 !== h && rayHit(g2, e, d, HIDE_SEAM) <= 1 + 1e-3) return false;
                  return true;
                });
                const key = `${pt.name}'s face ${hi} (facing ${[h.nx, h.ny, h.nz].map((v) => v.toFixed(2)).join(", ")})`;
                if (seen) shows.set(key, (shows.get(key) || 0) + 1);
              });
          for (const [key, n] of shows) err(`van ${gearName(g)} with the gun at lod ${lod}: ${key} is hidden (never drawn) but nothing covers it from ${n} of ${eyesF.length} eyes: a hole`);
        }
      }
    }

    // G: every decal lies on its face, inside its outline (Builder decals are not cut to their face: a design laid
    // with B.poly straight onto a gear part's face must fit it, else k.on cuts it), every look with its gear off, in the
    // middle and at the top, dented and not
    {
      const over = new Map();
      LOOKS.forEach((look, p) => {
        for (const g of [NONE, GEARS[2], ALL]) for (const dent of [0, 2]) {
          const m = V3.mesh(Object.assign({ paint: p }, g), { dent, gun: true });
          for (const pt of m.parts)
            pt.faces.forEach((f, fi) => {
              for (const d of f.decals) {
                if (d.k === 2) continue; // (text: its anchor only)
                let out = 0;
                for (let i = 0; i < d.n; i++) {
                  const q = cornerOf(d, i);
                  out = Math.max(out, Math.abs(f.nx * (q[0] - f.p[0]) + f.ny * (q[1] - f.p[1]) + f.nz * (q[2] - f.p[2])), -inFace(f, q));
                }
                const key = `the ${d.rgb.slice(0, 3).join(",")} ${d.k ? "line" : "polygon"} on ${pt.name}'s face ${fi}`;
                if (out > 0.01 && !over.has(key)) over.set(key, `van ${look.name} ${gearName(g)} dents ${dent}: ${key} reaches ${out.toFixed(2)} units off its face`);
              }
            });
        }
      });
      for (const v of over.values()) err(v);
    }
    sb.document.createElement = realCreate;
    console.log(`van model: ${vanDraws} draws checked; the most canvas calls with all its gear at lod 0 / 1 / 2: ${worst.join(" / ")} (ceilings ${VAN_OPS.join(" / ")})`);
    console.log(`van decals on the roof / the back doors at lod 1, sq units: ${decalAreas.join(", ")}`);
  }
}

/* ---------- The yard's models (js/yardmodels.js and its parts: yardmodels1.js, yardmodels2.js ...) ----------
   Every prop, sign and plaque with a 3D model (YardModels.add) is a sprite the yard or the porch already places (its
   2D art stays registered), and draws cleanly in every opts set it lists, whole, cracked and wrecked (and a blinking
   part on and off), from all round at the yard's eye (level, a little above and below) near and far, at every level of
   detail, on the checking context: no throw, finite numbers, real colours, no images, gradients or read-backs, no new
   canvases, transforms only round its text (never mirrored), within its canvas-call ceiling, the same calls twice; its
   foot stands on the ground (z 0) and it stands up (some height above). js/modelsprite.js draws them in the yard
   (validate-engine.js checks the yard places them). */
let yardModelDraws = 0;
{
  const YM_FILES = pageScripts.filter((f) => /^yardmodels\d*\.js$/.test(f));
  if (!YM_FILES.includes("yardmodels.js")) err("index.html does not load js/yardmodels.js");
  YM_FILES.forEach((f) => {
    if (pageScripts.indexOf(f) < pageScripts.indexOf("model3d.js")) err(`index.html loads js/${f} before js/model3d.js`);
    if (f !== "yardmodels.js" && pageScripts.indexOf(f) < pageScripts.indexOf("yardmodels.js")) err(`index.html loads js/${f} before js/yardmodels.js`);
    load(f);
  });
  const YM = ZSR.YardModels;
  const M3 = ZSR.Model3D;
  if (!YM || !M3) err("js/yardmodels.js does not export ZSR.YardModels");
  else {
    const FORBID = new Set(["drawImage", "createLinearGradient", "createRadialGradient", "createPattern", "getImageData", "putImageData", "set shadowBlur", "set filter", "resetTransform", "setTransform"]);
    const camera = (yaw, pitch, dist, lod, mid, w, h) => {
      const t = [0, 0, mid];
      const e = [Math.sin(yaw) * Math.cos(pitch) * dist, -Math.cos(yaw) * Math.cos(pitch) * dist, mid + Math.sin(pitch) * dist];
      const nz = (a) => {
        const l = Math.hypot(a[0], a[1], a[2]);
        return [a[0] / l, a[1] / l, a[2] / l];
      };
      const f = nz([t[0] - e[0], t[1] - e[1], t[2] - e[2]]);
      const r = nz([f[1], -f[0], 0]);
      const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
      const F = h / 2 / Math.tan(0.6);
      const view = M3.view({ ink: 1.5, lod, near: dist * 0.02, eye: e, lit: (x, y, z) => x * x + 0.88 * y * y + z * z * (z > 0 ? 1.08 : 0.62) });
      view.project = (x, y, z) => {
        const dx = x - e[0];
        const dy = y - e[1];
        const dz = z - e[2];
        const D = dx * f[0] + dy * f[1] + dz * f[2];
        view.D = D;
        const s = F / Math.max(D, 1e-6);
        view.X = w / 2 + (dx * r[0] + dy * r[1] + dz * r[2]) * s;
        view.Y = h / 2 - (dx * u[0] + dy * u[1] + dz * u[2]) * s;
        return D > view.near;
      };
      return view;
    };
    let made = 0;
    const realCreate = sb.document.createElement;
    sb.document.createElement = (t) => {
      made++;
      return realCreate(t);
    };
    const sigOf = (ops) => JSON.stringify(ops.map((op) => [op.k, op.args, op.fillStyle, op.strokeStyle, op.lineWidth]));
    const draw = (mesh, view, what, ceil) => {
      const c = element("canvas");
      c.width = 320;
      c.height = 320;
      const ctx = c.getContext("2d");
      current = what;
      const before = made;
      noRead = true;
      try {
        M3.draw(ctx, mesh, view);
      } catch (e) {
        noRead = false;
        err(`${what}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
        return null;
      }
      noRead = false;
      yardModelDraws++;
      if (made !== before) err(`${what}: made ${made - before} canvas(es) while drawing`);
      const ops = c.ops;
      if (ops.length > ceil) err(`${what}: ${ops.length} canvas calls, over its ceiling of ${ceil}`);
      const bad = ops.find((op) => FORBID.has(op.k));
      if (bad) err(`${what}: calls ${bad.k} (a model draws straight: no images, gradients or read-backs)`);
      let depth = 0;
      for (let i = 0; i < ops.length; i++) {
        const k = ops[i].k;
        if (k === "save") depth++;
        else if (k === "restore") depth--;
        else if (k === "transform" || k === "translate" || k === "scale" || k === "rotate") {
          if (k !== "transform" || depth < 1 || !ops[i + 1] || ops[i + 1].k !== "fillText") err(`${what}: ${k} outside its text's save and restore`);
          else {
            const [a, b, cc, d] = ops[i].args;
            if (!(a * d - b * cc > 0)) err(`${what}: text "${ops[i + 1].args[0]}" drawn mirrored`);
          }
          i++;
        } else if (k === "fillText" && depth < 1) err(`${what}: text outside save and restore`);
        if (depth < 0) err(`${what}: restore without save`);
      }
      if (depth !== 0) err(`${what}: save and restore do not pair up`);
      return ops;
    };
    const YAWS = 8;
    const worst = {};
    YM.ARTS.forEach((art) => {
      const d = YM.def(art);
      if (!D.hasSprite(art)) err(`yard model ${art}: no sprite of that name is registered (a model stands in for a sprite the yard places)`);
      if (!Array.isArray(d.opts) || !d.opts.length) err(`yard model ${art}: lists no opts sets to test`);
      const ceil = Array.isArray(d.ops) && d.ops.length === 3 ? d.ops : YM.YARD_OPS;
      worst[art] = [0, 0, 0];
      (d.opts || [{}]).forEach((o0, oi) => {
        [0, 1, 2].forEach((dmg) => {
          [undefined, true, false].forEach((on) => {
            if (on !== undefined && !d.blink) return;
            const o = Object.assign({}, o0, { dmg }, on === undefined ? {} : { on });
            const name = `yard model ${art} ${JSON.stringify(o)}`;
            let mesh;
            try {
              mesh = YM.mesh(art, o);
            } catch (e) {
              err(`${name}: building it threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
              return;
            }
            if (YM.mesh(art, o) !== mesh) err(`${name}: a second build for the same opts (it must be kept)`);
            const b = mesh.bounds;
            if (!(b.every(Number.isFinite) && Math.abs(b[2]) < 0.02 && b[5] > 0.05)) err(`${name}: its bounds ${b.map((v) => v.toFixed(3)).join(", ")} (its foot on the ground at z 0, standing up)`);
            const mid = (b[2] + b[5]) / 2;
            const size = Math.max(b[3] - b[0], b[4] - b[1], b[5] - b[2]);
            for (let lod = 0; lod < 3; lod++) {
              for (let yi = 0; yi < YAWS; yi++) {
                if ((yi + oi + dmg) % (lod ? 2 : 1)) continue;
                [-0.15, 0.05, 0.4].forEach((pitch, pi) => {
                  const yaw = (yi / YAWS) * Math.PI * 2 + 0.2;
                  const what = `${name} lod ${lod} yaw ${yaw.toFixed(2)} pitch ${pitch}`;
                  const ops = draw(mesh, camera(yaw, pitch, size * 2.6, lod, mid, 320, 320), what, ceil[lod]);
                  if (!ops) return;
                  worst[art][lod] = Math.max(worst[art][lod], ops.length);
                  if ((yi + pi) % 5 === 0) {
                    const again = draw(mesh, camera(yaw, pitch, size * 2.6, lod, mid, 320, 320), what + " (again)", ceil[lod]);
                    if (again && sigOf(again) !== sigOf(ops)) err(`${what}: the same model and view drew different calls`);
                  }
                });
              }
              // near: the yard's eye beside it, parts behind the near plane cut off
              draw(mesh, camera(lod * 2.1 + 0.4, 0.05, size * 0.7, lod, mid, 320, 320), `${name} lod ${lod} near`, ceil[lod]);
            }
          });
        });
      });
    });
    sb.document.createElement = realCreate;
    console.log(`yard models: ${YM.ARTS.length} kinds, ${yardModelDraws} draws checked` + (YM.ARTS.length ? `; the most calls at lod 0 / 1 / 2: ${YM.ARTS.map((a) => a + " " + worst[a].join("/")).join(", ")}` : ""));
  }
}

warnings.forEach((w) => console.log("warn  " + w));
if (errors.length) {
  errors.slice(0, 60).forEach((e) => console.log("ERROR " + e));
  if (errors.length > 60) console.log(`... and ${errors.length - 60} more`);
  console.log(`\n${errors.length} art problem(s).`);
  process.exit(1);
}
console.log(`OK: art for ${Object.keys(DECOR).length} decor keys and ${Object.keys(ART).length} landmark keys (${faces} faces, ${sprites} sprites drawn), ${guns} guns in hand, ${houseDrawn} house pictures (${Object.keys((HOUSE && HOUSE.textures) || {}).length} textures, ${Object.keys((HOUSE && HOUSE.sprites) || {}).length} sprites, ${((HOUSE && HOUSE.floors) || []).length} floors), ${crewDrawn} crew pictures, ${walkerDraws} walker figures (${W3 ? Object.keys(W3.TYPES).length : 0} types), ${beastDraws} animal draws (${B3 ? Object.keys(B3.TYPES).length : 0} kinds), ${vanDraws} van draws, ${yardModelDraws} yard model draws, every call checked.`);
