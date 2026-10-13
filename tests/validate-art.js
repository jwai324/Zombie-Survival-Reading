#!/usr/bin/env node
/* Draws all of the interior art in node, on a canvas that checks every call instead of drawing:
   - every decor key in ZSR.LAYOUT_DECOR has a wall texture (js/decor.js), and every art key in
     ZSR.LAYOUT_ART a landmark sprite (js/landmarks1.js, js/landmarks2.js, loaded when present);
   - each one draws without throwing, once for every set of opts the layouts give it (decor text and
     variants on that building's palette, every wall style; landmark color and label), with finite
     numbers, no negative radius, color stops inside 0..1, real colors and fonts;
   - a decor face starts by painting its whole tile opaque (the engine never draws behind a wall),
     and the page loads the art files;
   - every gun in hand draws cleanly at every mod tier, at rest and in motion, with its icon and view.
   validate-world.js checks the layout data, validate-engine.js what the engine makes of it. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");
const ART_FILES = ["decor.js", "landmarks1.js", "landmarks2.js"];

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
function element(tag) {
  const el = { tagName: String(tag).toUpperCase(), style: {}, classList: { add() {}, remove() {}, contains: () => false }, addEventListener() {}, setAttribute() {}, getAttribute: () => null };
  if (el.tagName === "CANVAS") {
    el.width = 300;
    el.height = 150;
    el.getContext = () => el.ctx || (el.ctx = context2d(el));
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
  const first = c.ops.find((o) => o.k !== "save" && o.k !== "scale");
  const solid = first && first.k === "fillRect" && first.args[0] <= 0 && first.args[1] <= 0 && first.args[0] + first.args[2] >= 64 && first.args[1] + first.args[3] >= 64 && first.globalAlpha === 1 && typeof first.fillStyle === "string" && !/^rgba\(.*,\s*(0?\.\d+|0)\s*\)$/.test(first.fillStyle) && first.fillStyle.length !== 9;
  if (!solid) err(`${what}: does not start by filling the whole tile with a solid color (faces must be opaque)`);
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

warnings.forEach((w) => console.log("warn  " + w));
if (errors.length) {
  errors.slice(0, 60).forEach((e) => console.log("ERROR " + e));
  if (errors.length > 60) console.log(`... and ${errors.length - 60} more`);
  console.log(`\n${errors.length} art problem(s).`);
  process.exit(1);
}
console.log(`OK: art for ${Object.keys(DECOR).length} decor keys and ${Object.keys(ART).length} landmark keys (${faces} faces, ${sprites} sprites drawn), ${guns} guns in hand, every call checked.`);
