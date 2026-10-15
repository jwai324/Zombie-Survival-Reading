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
     with gore off; fog darkens all but the eyes; its boxes, strides and blood sprites are sane;
   - the crew's art (js/crewart.js, loaded by the page after sprites3d.js): every sprite ZSR.CREW_ART
     lists is registered and draws cleanly, at its size, with every opts set listed for it; the list
     covers every crew member in every pose and frame, the poses and quest object kinds docs/CREW.md
     names, and every crew member, post pose and quest object kind in the facts (js/story-crew.js,
     js/story-quests.js and any other js/story*.js the page loads); an id, pose or kind the art does not know yet
     draws a stand-in.
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
const WALKER_FILES = ["walker3d.js", "walker3d-looks.js"]; // SCALE: the walker module, then its looks; add walker3d-looks2.js ... here as types grow
const WALKER_OPS = [600, 350, 160]; // SCALE: most canvas calls one walker may make at lod 0 / 1 / 2 (each one is drawn every frame it changes)
const WALKER_H_MAX = 1.3; // SCALE: tallest walker box, tiles (the engine caps it at 0.98 under a ceiling)
const WALKER_COLOURS = 6000; // SCALE: most colour strings random walker draws may use (Walker3D's colour table, CC_N, holds 16384)
// docs/CREW.md's own lists: the post poses (plus "walk", between posts) and the quest object kinds. The art
// must cover them even before a fact uses one (validate-world.js holds the facts to the same kinds).
const CREW_POSES = ["stand", "sit", "work", "read", "walk"];
const QUEST_KINDS = ["bag", "photo", "box", "book", "tin", "leash", "toolbox", "radio", "jar", "letter", "seeds", "blanket", "tape", "badge", "wrench"];

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

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
    if (i && at < pageScripts.indexOf(WALKER_FILES[0])) err(`index.html loads js/${f} before js/${WALKER_FILES[0]}`);
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
  /** Draw one figure on a fresh checking canvas; returns { ops, res } or null (after reporting). */
  function drawOne(type, o, cam, what) {
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
    if (ops.length > WALKER_OPS[lod]) err(`${what}: ${ops.length} canvas calls, over the lod ${lod} ceiling of ${WALKER_OPS[lod]}`);
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
    // G: smooth walk cycles: through 200 gait steps, no boot, toe or hand jumps more than 4 x its usual step (+ 1 px)
    const LIMBS = { "left hand": 6, "right hand": 9, "left ankle": 12, "left toe": 13, "right ankle": 16, "right toe": 17 };
    types.forEach((type) => {
      [PI / 2, 0.4].forEach((yaw) => {
        [0, 1].forEach((seed) => {
          const cam = camFor(type, false, 160);
          const steps = {};
          let prev = null;
          for (let i = 0; i <= 200; i++) {
            W3.draw(quiet, type, stQ({ yaw, seed, gait: i / 200, move: 1 }), cam);
            const now = Array.from(PB.s);
            if (prev) Object.entries(LIMBS).forEach(([n, j]) => (steps[n] = steps[n] || []).push(Math.hypot(now[j * 3] - prev[j * 3], now[j * 3 + 1] - prev[j * 3 + 1])));
            prev = now;
          }
          Object.entries(steps).forEach(([n, a]) => {
            const sorted = a.slice().sort((x, y) => x - y);
            const med = sorted[sorted.length >> 1];
            const max = sorted[sorted.length - 1];
            if (max > 4 * med + 1) err(`walker ${type} yaw ${yaw.toFixed(2)} seed ${seed}: its ${n} jumps ${max.toFixed(1)} px in one step of the walk cycle (its usual step is ${med.toFixed(2)} px at 160 px tall): a snap`);
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
    // J2: a head pointing well down (Walker3D.FACE_DOWN: falling or lying on its face) shows no face from any side,
    // and goes by its real depth (lying away from you the body covers it: drawn after the torso it would sit between
    // the boots, the open mouth showing); a brute shot in the back lies face down, from behind: no face
    let faceDown = 0;
    types.forEach((type) => {
      [0, PI, PI / 2, 2.5].forEach((fallDir) => {
        [0.4, 0.7, 1].forEach((fall) => {
          for (let k = 0; k < 8; k++) {
            const yaw = (k * PI) / 4;
            const res = W3.draw(quiet, type, stQ({ yaw, fall, fallDir, pose: "idle", move: 0 }), camFor(type, true, 200, 1.6));
            if (!(PB.hf[7] < W3.FACE_DOWN)) continue;
            faceDown++;
            if (res.face || !W3.probe().headBack) err(`walker ${type} falling ${fall} dir ${fallDir.toFixed(2)} yaw ${yaw.toFixed(2)}: its head points down (${PB.hf[7].toFixed(2)}) yet ${res.face ? "draws a face" : "is not drawn by its real depth"}`);
          }
        });
      });
    });
    if (!faceDown) err("walker falls: no fall ever puts a head face down (the check above checked nothing)");
    if (types.includes("brute")) {
      const res = W3.draw(quiet, "brute", stQ({ yaw: PI, fall: 1, fallDir: 0, pose: "idle", move: 0 }), camFor("brute", true, 200, 1.6));
      if (res.face) err("walker brute shot in the back, lying face down, seen from behind: draws its face");
    }
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
  // the health bar's width uses the engine's field of view: the same number in both files
  const fovM = /const FOV = ([\d.]+)/.exec(fs.readFileSync(path.join(ROOT, "js", "interior.js"), "utf8"));
  if (!fovM) warn("could not find js/interior.js's FOV to check Walker3D.FOV against");
  else if (Math.abs(+fovM[1] - W3.FOV) > 1e-9) err(`Walker3D.FOV ${W3.FOV} is not js/interior.js's FOV ${fovM[1]} (the health bar's width comes from it)`);
  sb.document.createElement = realCreate;
}

/* ---------- The road's walkers (js/sprites.js): a top-down look for every kind, as its 3D look ----------
   Every kind in the facts has a road look, its skin, shirt and hair (each variant's) the 3D look's colours; every
   kind draws cleanly in every state (walking, hit, hurt, frenzied, screaming) with walker gore on and off, and so
   does a downed one through its whole fall; gore off paints no blood, gore on does (and a pool under a downed
   walker); a downed walker fades out; the title screen's walkers come from the facts and take turns through them. */
const ROAD_OPS = 360; // SCALE: most canvas calls one road walker (or a downed one) may make (253 today); a busy road draws ~25
let roadDraws = 0;
{
  ["world.js", "upgrades.js", "sprites.js", "game.js"].forEach((f) => {
    if (!pageScripts.includes(f)) err(`index.html does not load js/${f}`);
    load(f);
  });
  const Dr = ZSR.Draw;
  const WD = ZSR.WORLD;
  if (!Dr || !WD || typeof Dr.zombie !== "function" || typeof Dr.zombieShadow !== "function" || typeof Dr.zombieDown !== "function" || !Dr.ZOMBIE_LOOK || typeof Dr.zombieLook !== "function") err("js/sprites.js does not export Draw.zombie, zombieShadow, zombieDown, zombieLook and ZOMBIE_LOOK");
  else {
    const kinds = Object.keys(WD.WALKER_TYPES);
    const hex = (c) => (typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c) ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : null);
    // blood: a dark-to-mid red (the health bar is a rect, and a frenzy's bright red eyes are not blood)
    const rgb = (c) => {
      if (typeof c !== "string") return null;
      const h = hex(c);
      if (h) return h;
      const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(c);
      return m ? [+m[1], +m[2], +m[3]] : null;
    };
    const bloody = (c) => {
      const v = rgb(c);
      return !!v && v[0] >= 70 && v[0] <= 230 && v[1] <= 0.28 * v[0] && v[2] <= 0.28 * v[0];
    };
    const W3T = (W3 && W3.TYPES) || {};
    kinds.forEach((id) => {
      if (!Dr.ZOMBIE_LOOK[id]) return err(`walker type "${id}" has no road look (ZOMBIE_LOOK in js/sprites.js)`);
      // the same skin, shirt and hair as its 3D look, variant by variant (the seed picks both the same way)
      const looks3 = W3T[id] ? W3T[id].looks : null;
      const nv = (Dr.ZOMBIE_LOOK[id].variants || [0]).length;
      if (!looks3) return;
      if (nv !== looks3.length) err(`road look ${id}: ${nv} variant(s), its 3D look has ${looks3.length} (a seed must pick the same one)`);
      for (let v = 0; v < Math.min(nv, looks3.length); v++) {
        const L = Dr.zombieLook(id, v);
        ["skin", "shirt", "hair"].forEach((k) => {
          const a = hex(L[k]);
          const b = looks3[v][k];
          if (!a || !b || a.some((x, i) => x !== b[i])) err(`road look ${id} variant ${v}: ${k} ${L[k]} is not the 3D look's rgb(${b})`);
        });
      }
    });
    Object.keys(Dr.ZOMBIE_LOOK).forEach((id) => WD.WALKER_TYPES[id] || warn(`road look "${id}" is for a kind the facts do not have`));
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
      const saves = ops.filter((o) => o.k === "save").length;
      if (saves !== ops.filter((o) => o.k === "restore").length) err(`${what}: save and restore do not pair up (the next thing drawn would inherit its transform)`);
      if (ops.some((o) => o.k === "set shadowBlur" || o.k === "set filter")) err(`${what}: sets shadowBlur or filter (slow on a busy road)`);
      return ops;
    };
    const paints = (ops) => ops.filter((o) => o.k === "fill" || o.k === "stroke").map((o) => ({ col: o.k === "fill" ? o.fillStyle : o.strokeStyle, a: o.globalAlpha, k: o.k }));
    let maxOps = 0;
    const Y = (WD.SCREAM && WD.SCREAM.yell) || 1.2;
    const STATES = [["walking", {}], ["hit", { hit: 0.1 }], ["hurt", { hp: 0.3 }], ["frenzied", { frenzyT: 3 }], ["screaming", { yell: Y * 0.5 }], ["starting a scream", { yell: Y }], ["ending a scream", { yell: 0.05 }], ["screaming in a frenzy", { yell: Y * 0.5, frenzyT: 2, hit: 0.05, hp: 0.5 }]];
    kinds.forEach((id) => {
      const nv = Dr.ZOMBIE_LOOK[id] ? (Dr.ZOMBIE_LOOK[id].variants || [0]).length : 1;
      const R = WD.WALKER_TYPES[id].road;
      for (let seed = 0; seed < nv; seed++) {
        for (const gore of [true, false]) {
          WD.SETTINGS.walkerGore = gore;
          let red = 0;
          STATES.forEach(([state, o]) => {
            [0, 0.37, 1.9].forEach((t, ti) => {
              const z = Object.assign({ type: id, seed, x: 40, y: 50, r: R.r, hp: 1, maxHp: 1, angle: ti * 2.1 - 1, phase: 0.4, hit: 0, frenzyT: 0, yell: 0 }, o);
              const what = `road walker ${id} seed ${seed} ${state} t ${t} gore ${gore ? "on" : "off"}`;
              const ops = roadDraw(what, (ctx) => Dr.zombie(ctx, z, t));
              if (!ops) return;
              maxOps = Math.max(maxOps, ops.length);
              const p = paints(ops);
              if (!gore) {
                const b = p.find((q) => bloody(q.col));
                if (b) err(`${what}: gore is off but it paints ${b.col}`);
              } else red += p.filter((q) => bloody(q.col)).length;
              // the road draws every walker's shadow (or frenzy glow) on the ground first, then the bodies without
              // one: the two together are the walker, the shadow just where its own would be
              const body = roadDraw(what + " (no shadow)", (ctx) => Dr.zombie(ctx, z, t, true));
              const sh = roadDraw(what + " (shadow)", (ctx) => Dr.zombieShadow(ctx, z, t));
              if (!body || !sh) return;
              const fills = (o) => o.filter((q) => q.k === "fill").length;
              if (sh.map((q) => q.k).join() !== "beginPath,ellipse,fill") err(`${what}: its shadow is ${sh.map((q) => q.k).join(", ")} (one filled ellipse expected)`);
              else if (fills(body) !== fills(ops) - 1 || body.length !== ops.length - sh.length) err(`${what}: drawn without its shadow it still paints ${fills(body)} of ${fills(ops)} fills`);
              else {
                const rot = ops.find((q) => q.k === "rotate");
                const own = ops.find((q) => q.k === "ellipse");
                const e = sh[1].args;
                const a = rot ? rot.args[0] : NaN;
                const cx = z.x + own.args[0] * Math.cos(a) - own.args[1] * Math.sin(a);
                const cy = z.y + own.args[0] * Math.sin(a) + own.args[1] * Math.cos(a);
                const near = (u, v) => Math.abs(u - v) < 1e-6;
                if (!(near(e[0], cx) && near(e[1], cy) && near(e[2], own.args[2]) && near(e[3], own.args[3]) && near(e[4], a + own.args[4]))) err(`${what}: its shadow on the ground (${e.slice(0, 5).map((v) => v.toFixed(2)).join(", ")}) is not where its own is (${[cx, cy, own.args[2], own.args[3], a + own.args[4]].map((v) => v.toFixed(2)).join(", ")})`);
                if (sh[2].fillStyle !== ops[ops.indexOf(own) + 1].fillStyle) err(`${what}: its shadow is ${sh[2].fillStyle}, its own ${ops[ops.indexOf(own) + 1].fillStyle}`);
              }
            });
          });
          if (gore && !red) err(`road walker ${id} seed ${seed}: gore on, but no blood anywhere on it`);
        }
        // a hurt one's health bar stays level on the screen however the road view turns the world: it turns back
        // by the view's turn round the walker, and sits over its head (screen up), as wide as the walker
        [0.7, -1.9, Math.PI].forEach((turn) => {
          const z = { type: id, seed, x: 40, y: 50, r: R.r, hp: 0.4, maxHp: 1, angle: 0.3, phase: 0.4, hit: 0, frenzyT: 0, yell: 0 };
          const what = `road walker ${id} seed ${seed} hurt, view turned ${turn.toFixed(2)}`;
          const ops = roadDraw(what, (ctx) => Dr.zombie(ctx, z, 0.37, true, turn));
          if (!ops) return;
          const bar = ops.map((o, i) => [o, i]).filter(([o]) => o.k === "fillRect").slice(-2); // drawn last
          const i0 = bar.length ? bar[0][1] : -1;
          const rot = ops.slice(0, Math.max(0, i0)).reverse().find((o) => o.k === "rotate" || o.k === "restore");
          const tr = ops.slice(0, Math.max(0, i0)).reverse().find((o) => o.k === "translate");
          if (bar.length !== 2 || ops.slice(i0 + 1, bar[1][1]).some((o) => o.k !== "set fillStyle" && o.k !== "fillRect")) err(`${what}: no health bar drawn last (the ink, the red)`);
          else if (!rot || rot.k !== "rotate" || Math.abs(rot.args[0] + turn) > 1e-9) err(`${what}: its health bar is not turned back by the view's turn (${rot ? rot.k + " " + (rot.args || []).join() : "nothing"})`);
          else if (!tr || tr.args[0] !== z.x || tr.args[1] !== z.y) err(`${what}: its health bar does not turn round the walker`);
          else if (!(bar[0][0].args[1] < -R.r) || Math.abs(bar[0][0].args[0] + bar[0][0].args[2] / 2) > 1e-9) err(`${what}: its health bar is not centred over its head (${bar[0][0].args.join()})`);
        });
      }
      WD.SETTINGS.walkerGore = true;
      // a downed one: through its whole fall, gore on and off, falling any way
      for (let seed = 0; seed < nv; seed++) {
        for (const gore of [true, false]) {
          WD.SETTINGS.walkerGore = gore;
          [0, 0.05, 0.12, 0.2, 0.25, 0.3, 0.45, 0.6, 0.7, 0.85, 0.97, 1].forEach((age) => {
            [-Math.PI / 2, 0.8, Math.PI].forEach((rot) => {
              const max = 2;
              const f = { kind: "fallen", type: id, seed, x: 60, y: 60, size: R.r, rot, life: max * (1 - age), max };
              const what = `downed road walker ${id} seed ${seed} age ${age} rot ${rot.toFixed(2)} gore ${gore ? "on" : "off"}`;
              const ops = roadDraw(what, (ctx) => Dr.zombieDown(ctx, f));
              if (!ops) return;
              maxOps = Math.max(maxOps, ops.length);
              const p = paints(ops);
              // the road draws every downed walker's ground (its pool, its shadow) before any body: the two parts
              // together are the whole, the ground is only blood and shadow, and the body has no pool
              const gr = roadDraw(what + " (ground)", (ctx) => Dr.zombieDown(ctx, f, "ground"));
              const bd = roadDraw(what + " (body)", (ctx) => Dr.zombieDown(ctx, f, "body"));
              if (gr && bd) {
                const pg = paints(gr);
                const pb = paints(bd);
                if (pg.length + pb.length !== p.length) err(`${what}: ground ${pg.length} + body ${pb.length} paints, the whole ${p.length}`);
                const odd = pg.find((q) => q.k !== "fill" || !(bloody(q.col) || /^rgba\(0,0,0,/.test(q.col)));
                if (odd) err(`${what}: its ground part paints ${odd.k} ${odd.col} (only the pool and a shadow belong there)`);
                if (bd.some((o, i) => o.k === "fill" && bloody(o.fillStyle) && i > 0 && bd[i - 1].k === "ellipse" && Math.min(bd[i - 1].args[2], bd[i - 1].args[3]) > R.r * 0.8)) err(`${what}: its body part has the pool in it`);
              }
              if (!gore && p.some((q) => bloody(q.col))) err(`${what}: gore is off but it paints blood`);
              if (age >= 1 && p.some((q) => q.a > 0)) err(`${what}: still drawn at the end of its life`);
              if (age > 0.7 && age < 1 && p.some((q) => q.a >= 0.999)) err(`${what}: not fading (something drawn at full alpha)`);
              if (age < 0.6 && !p.length) err(`${what}: draws nothing`);
              if (gore && age >= 0.45 && age < 1) {
                // a pool under it: a blood-red ellipse wider than its body radius, drawn before the body
                let ell = null;
                let pool = false;
                for (const o of ops) {
                  if (o.k === "beginPath") ell = null;
                  else if (o.k === "ellipse") ell = o.args;
                  else if (o.k === "fill" && ell && bloody(o.fillStyle) && Math.min(ell[2], ell[3]) > R.r * 0.8) pool = true;
                }
                if (!pool) err(`${what}: no pool of blood under it with gore on`);
              }
            });
          });
        }
      }
      WD.SETTINGS.walkerGore = true;
    });
    // an unknown kind draws as a walker, standing and downed, and never throws
    roadDraw("road walker of an unknown kind", (ctx) => Dr.zombie(ctx, { type: "zz-new", seed: 3, x: 0, y: 0, r: 18, hp: 1, maxHp: 1, angle: 0, phase: 0, hit: 0 }, 1));
    roadDraw("downed road walker of an unknown kind", (ctx) => Dr.zombieDown(ctx, { type: "zz-new", seed: NaN, x: 0, y: 0, size: 18, rot: 0, life: 1, max: 2 }));
    // blood drops and splats on the road, and the other particles
    [{ blood: true, vx: 90, vy: -40 }, { blood: true, splat: true, vx: 0, vy: 0, rot: 0.4 }, { grow: true, vx: 10, vy: 0 }, { vx: 100, vy: 100 }].forEach((p, i) =>
      roadDraw(`road particle ${i}`, (ctx) => Dr.particle(ctx, Object.assign({ x: 10, y: 10, life: 0.2, maxLife: 0.4, size: 3, color: "#a3201a" }, p)))
    );
    // the title screen (Game.showcase): its two walkers come from the facts, the first two at t 0, every kind in turn
    const G = ZSR.Game;
    if (!G || typeof G.showcase !== "function") err("js/game.js does not export Game.showcase");
    else {
      const shown = new Set();
      const first = [];
      const real = Dr.zombie;
      Dr.zombie = (ctx, z, t) => {
        shown.add(z.type);
        if (t === 0) first.push(z.type);
        if (!(z.r > 0)) err(`the title screen's ${z.type} has radius ${z.r}`);
        return real(ctx, z, t);
      };
      const ups = { armor: 2, engine: 1, bumper: 2, paint: 3, damage: 2, fireRate: 0, spread: 1 };
      for (let t = 0; t <= kinds.length * 4 + 1; t += 0.5) {
        const c = element("canvas");
        c.width = 320;
        c.height = 200;
        current = `title screen at ${t} s`;
        try {
          G.showcase(c, ups, t);
        } catch (e) {
          err(`${current}: threw ${e.stack.split("\n").slice(0, 2).join(" | ")}`);
          break;
        }
      }
      Dr.zombie = real;
      kinds.forEach((id) => shown.has(id) || err(`the title screen never shows a ${id}`));
      if (first.join() !== kinds.slice(0, 2).join()) err(`the title screen's still picture shows ${first.join(", ")} (the facts' first two kinds expected: ${kinds.slice(0, 2).join(", ")})`);
    }
    console.log(`road walkers: ${kinds.length} kinds, ${roadDraws} drawn (most canvas calls ${maxOps} of ${ROAD_OPS})`);
  }
}

warnings.forEach((w) => console.log("warn  " + w));
if (errors.length) {
  errors.slice(0, 60).forEach((e) => console.log("ERROR " + e));
  if (errors.length > 60) console.log(`... and ${errors.length - 60} more`);
  console.log(`\n${errors.length} art problem(s).`);
  process.exit(1);
}
console.log(`OK: art for ${Object.keys(DECOR).length} decor keys and ${Object.keys(ART).length} landmark keys (${faces} faces, ${sprites} sprites drawn), ${guns} guns in hand, ${houseDrawn} house pictures (${Object.keys((HOUSE && HOUSE.textures) || {}).length} textures, ${Object.keys((HOUSE && HOUSE.sprites) || {}).length} sprites, ${((HOUSE && HOUSE.floors) || []).length} floors), ${crewDrawn} crew pictures, ${walkerDraws} walker figures (${W3 ? Object.keys(W3.TYPES).length : 0} types), every call checked.`);
