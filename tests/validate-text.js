#!/usr/bin/env node
/* Validates js/content/level*.js against js/world.js and docs/TEXT_GUIDE.md.
   Usage: node tests/validate-text.js [level]. Exit 1 on any error. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const LEVELS = {
  1: { words: [30, 50], sentence: 7 },
  2: { words: [45, 75], sentence: 10 },
  3: { words: [70, 110], sentence: 14 },
  4: { words: [100, 140], sentence: 18 },
  5: { words: [130, 180], sentence: 22 },
  6: { words: [160, 220], sentence: 26 },
};
const errors = [];
const warnings = [];
const err = (c, m) => errors.push(c + ": " + m);
const warn = (c, m) => warnings.push(c + ": " + m);
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean);
const sentences = (s) => String(s).replace(/\n+/g, " ").split(/(?<=[.!?]["”']?)\s+/).map((x) => x.trim()).filter(Boolean);
const isStr = (v, min = 1) => typeof v === "string" && v.trim().length >= min;

function load(file, key) {
  const sb = {};
  sb.globalThis = sb;
  vm.runInNewContext(fs.readFileSync(file, "utf8"), sb, { filename: file });
  return sb.ZSR && sb.ZSR[key];
}
const WORLD = load(path.join(ROOT, "js", "world.js"), "WORLD");
if (!WORLD) {
  console.log("ERROR js/world.js did not define ZSR.WORLD");
  process.exit(1);
}

function checkText(ctx, text, spec, scale, facts) {
  if (!isStr(text, 10)) return err(ctx, "text missing");
  const wc = words(text).length;
  const lo = Math.round(spec.words[0] * scale);
  const hi = Math.round(spec.words[1] * scale);
  if (wc < lo || wc > hi) warn(ctx, `${wc} words, target ${lo}..${hi}`);
  const longest = sentences(text).reduce((m, s) => Math.max(m, words(s).length), 0);
  if (longest > spec.sentence + 3) warn(ctx, `longest sentence ${longest} words, max ${spec.sentence}`);
  if (/Biscuit|Shambler|poof/i.test(text)) err(ctx, "old-world term");
  // numbers and codes from the facts must survive verbatim
  (facts || []).forEach((f) => {
    (f.match(/\b\d[\d-]*\b/g) || []).forEach((num) => {
      if (!text.includes(num) && !numberWord(num, text)) err(ctx, `fact number "${num}" missing from text`);
    });
  });
}
const NUM_WORDS = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten" };
function numberWord(num, text) {
  const w = NUM_WORDS[num];
  return w && new RegExp("\\b" + w + "\\b", "i").test(text);
}

function checkLevel(n) {
  const spec = LEVELS[n];
  const file = path.join(ROOT, "js", "content", `level${n}.js`);
  const ctx = `level${n}`;
  if (!fs.existsSync(file)) return err(ctx, "missing file");
  let TEXT;
  try {
    TEXT = load(file, "TEXT");
  } catch (e) {
    return err(ctx, "failed to execute: " + e.message);
  }
  const t = TEXT && TEXT[n];
  if (!t) return err(ctx, `did not define ZSR.TEXT[${n}]`);
  if (t.level !== n) err(ctx, `level field is ${t.level}`);
  if (!Array.isArray(t.howto) || t.howto.length < 3) err(ctx, "howto needs 3+ paragraphs");
  else t.howto.forEach((p, i) => {
    if (!isStr(p, 20)) err(`${ctx} howto[${i}]`, "empty");
    const longest = sentences(p).reduce((m, s) => Math.max(m, words(s).length), 0);
    if (longest > spec.sentence + 3) warn(`${ctx} howto[${i}]`, `longest sentence ${longest}, max ${spec.sentence}`);
  });
  if (!t.base || !isStr(t.base.intro)) err(ctx, "base.intro missing");
  Object.keys(WORLD.BASE_ROOMS).forEach((room) => {
    const r = t.base && t.base.rooms && t.base.rooms[room];
    if (!r) return err(`${ctx} base.rooms.${room}`, "missing");
    if (!isStr(r.desc)) err(`${ctx} base.rooms.${room}`, "desc missing");
    if (!Array.isArray(r.next) || r.next.length !== 3 || !r.next.every((x) => isStr(x))) err(`${ctx} base.rooms.${room}`, "next needs 3 strings");
  });
  if (!t.locations) return err(ctx, "locations missing");
  WORLD.LOCATIONS.filter((l) => l.id !== "base").forEach((loc) => {
    const L = t.locations[loc.id];
    const lctx = `${ctx} ${loc.id}`;
    if (!L) return err(lctx, "missing");
    if (!isStr(L.blurb)) err(lctx, "blurb missing");
    const N = WORLD.NOTES[loc.id];
    if (!L.door || !isStr(L.door.title)) err(lctx + " door", "title missing");
    else if (words(L.door.title).length > 7) warn(lctx + " door", "title is long");
    checkText(lctx + " door", L.door && L.door.text, spec, 0.6, N.door.facts);
    N.notes.forEach((note) => {
      const T = L.notes && L.notes[note.id];
      if (!T) return err(`${lctx} ${note.id}`, "missing");
      if (!isStr(T.title)) err(`${lctx} ${note.id}`, "title missing");
      checkText(`${lctx} ${note.id}`, T.text, spec, 1, note.facts);
      if (note.unlocks && !/open|unlock|key|code|latch|bolt|badge|combination|handle|hatch|lift|twist/i.test(T.text || "")) warn(`${lctx} ${note.id}`, "note unlocks a cache but the text never says how to open it");
      (note.reveals || []).forEach((rid) => {
        const target = WORLD.LOCATIONS.find((l) => l.id === rid);
        if (target && !(T.text || "").includes(target.name)) err(`${lctx} ${note.id}`, `must name "${target.name}" (reveals it)`);
      });
    });
    Object.keys(L.notes || {}).forEach((id) => {
      if (!N.notes.find((x) => x.id === id)) err(lctx, `unknown note id ${id}`);
    });
  });
  if (!errors.some((e) => e.startsWith(ctx))) {
    const total = WORLD.LOCATIONS.filter((l) => l.id !== "base").reduce((n2, loc) => {
      const L = t.locations[loc.id];
      return n2 + words(L.door.text).length + Object.values(L.notes).reduce((m, x) => m + words(x.text).length, 0);
    }, 0);
    console.log(`level ${n}: ${WORLD.LOCATIONS.length - 1} locations, ${total} note words`);
  }
}

const only = process.argv[2] ? [Number(process.argv[2])] : [1, 2, 3, 4, 5, 6];
only.forEach(checkLevel);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log("  warn  " + w));
}
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.log("  ERROR " + e));
  process.exit(1);
}
console.log(`\nOK: text for level(s) ${only.join(", ")} is valid.`);
