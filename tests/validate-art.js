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
        ops.push({ k, args, fillStyle: state.fillStyle, globalAlpha: state.globalAlpha });
        return calls[k] ? calls[k](...args) : undefined;
      };
    },
    set(o, k, v) {
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
  // a crew figure is drawn like a walker (192 x 256, wide 0.75), and a portrait is square
  const crewImg = D.hasSprite("crew") && D.sprite("crew", (CREW.sprites.crew || [{}])[0]);
  if (crewImg && (crewImg.width !== 192 || crewImg.height !== 256)) err(`crew sprite is ${crewImg.width} x ${crewImg.height}; it must be 192 x 256 like a walker`);
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

warnings.forEach((w) => console.log("warn  " + w));
if (errors.length) {
  errors.slice(0, 60).forEach((e) => console.log("ERROR " + e));
  if (errors.length > 60) console.log(`... and ${errors.length - 60} more`);
  console.log(`\n${errors.length} art problem(s).`);
  process.exit(1);
}
console.log(`OK: art for ${Object.keys(DECOR).length} decor keys and ${Object.keys(ART).length} landmark keys (${faces} faces, ${sprites} sprites drawn), ${guns} guns in hand, ${houseDrawn} house pictures (${Object.keys((HOUSE && HOUSE.textures) || {}).length} textures, ${Object.keys((HOUSE && HOUSE.sprites) || {}).length} sprites, ${((HOUSE && HOUSE.floors) || []).length} floors), ${crewDrawn} crew pictures, every call checked.`);
