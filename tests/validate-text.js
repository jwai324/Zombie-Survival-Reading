#!/usr/bin/env node
/* Validates js/content/level*.js against js/world.js and docs/TEXT_GUIDE.md.
   Covers howto, base rooms (incl. late rooms and what they require), traps, the
   workbench blurb, and the typing drills (fingers, words, phrases, sentences).
   Usage: node tests/validate-text.js [level]. Exit 1 on any error. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
// words/sentence: note length and max sentence length (docs/TEXT_GUIDE.md).
// typeWord: letters per typing word; typePhrase / typeSentence: words per phrase / sentence.
const LEVELS = {
  1: { words: [30, 50], sentence: 7, typeWord: [3, 4], typePhrase: [2, 2], typeSentence: [3, 6] },
  2: { words: [45, 75], sentence: 10, typeWord: [3, 5], typePhrase: [2, 2], typeSentence: [4, 7] },
  3: { words: [70, 110], sentence: 14, typeWord: [3, 6], typePhrase: [2, 3], typeSentence: [5, 9] },
  4: { words: [100, 140], sentence: 18, typeWord: [4, 7], typePhrase: [2, 3], typeSentence: [6, 10] },
  5: { words: [130, 180], sentence: 22, typeWord: [4, 8], typePhrase: [2, 4], typeSentence: [7, 11] },
  6: { words: [160, 220], sentence: 26, typeWord: [5, 9], typePhrase: [2, 4], typeSentence: [8, 12] },
};
const errors = [];
const warnings = [];
const err = (c, m) => errors.push(c + ": " + m);
const warn = (c, m) => warnings.push(c + ": " + m);
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean);
const sentences = (s) => String(s).replace(/\n+/g, " ").split(/(?<=[.!?]["”']?)\s+/).map((x) => x.trim()).filter(Boolean);
const isStr = (v, min = 1) => typeof v === "string" && v.trim().length >= min;
const longestSentence = (p) => sentences(p).reduce((m, s) => Math.max(m, words(s).length), 0);
// a few offending entries, quoted, for an error message
const list = (arr, max = 8) => arr.slice(0, max).map((x) => JSON.stringify(x)).join(", ") + (arr.length > max ? `, ... (${arr.length} total)` : "");
const dupes = (arr) => {
  const seen = new Set();
  const out = [];
  arr.forEach((x) => { if (seen.has(x) && !out.includes(x)) out.push(x); seen.add(x); });
  return out;
};

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
// the number as digits (whole token) or as a number word
const hasNumber = (num, text) => new RegExp("\\b" + String(num).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(text) || !!numberWord(num, text);

/* howto: the paragraphs must carry the current rules and drop the old ones */
const HOWTO_BANNED = /patched|patch the fence|fence is fixed between/i;
const HOWTO_MUST = [
  [/door/i, "the cabin door (E opens and closes it, walkers cannot)"],
  [/trap/i, "traps (crafted at the bench, placed in the yard)"],
  [/kit/i, "medical kits (the backpack carries them, one heals to full)"],
  [/typ/i, "typing (how you build, upgrade, and craft)"],
  [/scrap/i, "scrap (fence holes and van repair cost scrap)"],
  [/save/i, "saving (the base is the only place the game saves)"],
  [/\bwell\b/i, "the Well (late game: water)"],
  [/\bfarm/i, "the Farm (late game: crops and animals for food)"],
  [/\blab\b/i, "the Lab (late game: medicine made at home)"],
];
/* numbers the How it works text must carry, straight from the world file */
const HOWTO_NUMBERS = () => [
  [WORLD.SETTINGS.fenceRepairScrap, "the scrap a fence hole costs"],
  [WORLD.SETTINGS.kitsMax, "how many kits the backpack holds"],
  [WORLD.SETTINGS.saveSlots, "how many saves there are"],
  [WORLD.SETTINGS.restockDays, "the days until shelf items come back"],
];
/* the controls list: one "Head: text" line per group, keys named as capitals */
const CONTROLS_MUST = [
  [/\bE\b/, "the E key"],
  [/\bT\b/, "the T key (spike trap)"],
  [/\bR\b/, "the R key (blast trap)"],
  [/\bB\b/, "the B key (backpack)"],
  [/\bP\b/, "the P key (pause)"],
  [/typ/i, "typing at the workbench"],
  [/map/i, "the map"],
];
/* typing.fingers: home-row placement must be taught in so many words */
const FINGERS_MUST = [
  [/home row/i, "the home row"],
  [/\bF\b/, "the F key (its bump)"],
  [/\bJ\b/, "the J key (its bump)"],
  [/space/i, "the space bar (thumbs)"],
];
const PHRASE_RE = /^[a-z]+( [a-z]+){1,3}$/;
const SENTENCE_RE = /^[A-Z][A-Za-z ,]*[a-z]\.$/;

/* typing drills: finger lesson, then words, phrases, and sentences the player types */
function checkTyping(ctx, ty, spec) {
  ty = ty || {};
  const fctx = `${ctx} typing.fingers`;
  if (!Array.isArray(ty.fingers)) err(fctx, "missing (3 to 4 short paragraphs on home-row finger placement)");
  else if (ty.fingers.length < 3 || ty.fingers.length > 4) err(fctx, `has ${ty.fingers.length} paragraphs, needs 3 to 4`);
  else {
    ty.fingers.forEach((p, i) => {
      if (!isStr(p, 20)) return err(`${fctx}[${i}]`, "empty");
      const longest = longestSentence(p);
      if (longest > spec.sentence + 3) warn(`${fctx}[${i}]`, `longest sentence ${longest}, max ${spec.sentence}`);
    });
    const all = ty.fingers.join(" ");
    FINGERS_MUST.forEach(([re, what]) => { if (!re.test(all)) err(fctx, `must mention ${what}`); });
  }

  const wctx = `${ctx} typing.words`;
  if (!Array.isArray(ty.words)) err(wctx, "missing (40+ lowercase words from the game's world)");
  else {
    const W = ty.words;
    if (W.length < 40) err(wctx, `${W.length} words, needs 40+`);
    const bad = W.filter((w) => !/^[a-z]+$/.test(w));
    if (bad.length) err(wctx, `must be lowercase a-z only, no spaces: ${list(bad)}`);
    const d = dupes(W);
    if (d.length) err(wctx, `duplicates: ${list(d)}`);
    const [lo, hi] = spec.typeWord;
    const off = W.filter((w) => typeof w === "string" && (w.length < lo || w.length > hi));
    if (off.length) (off.length > W.length / 10 ? err : warn)(wctx, `${off.length} of ${W.length} outside ${lo}..${hi} letters: ${list(off)}`);
  }

  const pctx = `${ctx} typing.phrases`;
  if (!Array.isArray(ty.phrases)) err(pctx, "missing (20+ lowercase phrases of 2 to 4 words)");
  else {
    const P = ty.phrases;
    if (P.length < 20) err(pctx, `${P.length} phrases, needs 20+`);
    const bad = P.filter((p) => !PHRASE_RE.test(p));
    if (bad.length) err(pctx, `must be 2 to 4 lowercase words with single spaces, no punctuation: ${list(bad)}`);
    const d = dupes(P);
    if (d.length) warn(pctx, `duplicates: ${list(d)}`);
    const [lo, hi] = spec.typePhrase;
    const off = P.filter((p) => PHRASE_RE.test(p) && (p.split(" ").length < lo || p.split(" ").length > hi));
    if (off.length) warn(pctx, `${off.length} of ${P.length} outside ${lo}..${hi} words: ${list(off)}`);
  }

  const sctx = `${ctx} typing.sentences`;
  if (!Array.isArray(ty.sentences)) err(sctx, "missing (16+ sentences: capital first letter, final period, letters, spaces, commas only)");
  else {
    const S = ty.sentences;
    if (S.length < 16) err(sctx, `${S.length} sentences, needs 16+`);
    const bad = S.filter((s) => !SENTENCE_RE.test(s));
    if (bad.length) err(sctx, `must start with a capital, end with a period, and use only letters, spaces, commas: ${list(bad)}`);
    const dbl = S.filter((s) => /  /.test(s));
    if (dbl.length) err(sctx, `double space: ${list(dbl)}`);
    const gap = S.filter((s) => / ,/.test(s));
    if (gap.length) warn(sctx, `space before a comma: ${list(gap)}`);
    const d = dupes(S);
    if (d.length) warn(sctx, `duplicates: ${list(d)}`);
    const [lo, hi] = spec.typeSentence;
    const off = S.filter((s) => SENTENCE_RE.test(s) && (words(s).length < lo || words(s).length > hi));
    if (off.length) warn(sctx, `${off.length} of ${S.length} outside ${lo}..${hi} words: ${list(off)}`);
  }
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
  else {
    if (t.howto.length > 6) warn(ctx, `howto has ${t.howto.length} paragraphs, keep it to 3 to 6`);
    t.howto.forEach((p, i) => {
      if (!isStr(p, 20)) err(`${ctx} howto[${i}]`, "empty");
      const longest = longestSentence(p);
      if (longest > spec.sentence + 3) warn(`${ctx} howto[${i}]`, `longest sentence ${longest}, max ${spec.sentence}`);
    });
    const all = t.howto.join(" ");
    if (HOWTO_BANNED.test(all)) err(ctx, "howto still says the fence is patched between waves (holes stay until repaired, 1 scrap each)");
    HOWTO_MUST.forEach(([re, what]) => { if (!re.test(all)) err(ctx, `howto must mention ${what}`); });
    HOWTO_NUMBERS().forEach(([num, what]) => { if (!hasNumber(num, all)) err(ctx, `howto must give ${what} (${num})`); });
  }
  // controls: the key list under How it works, at this level too
  if (!Array.isArray(t.controls) || t.controls.length < 5) err(ctx, "controls needs 5+ lines (Road, Inside and in the yard, E, Traps, Backpack, Workbench, Map)");
  else {
    t.controls.forEach((c, i) => {
      if (!isStr(c, 10)) err(`${ctx} controls[${i}]`, "empty");
      else if (!/^[^:]{2,40}:\s*\S/.test(c)) err(`${ctx} controls[${i}]`, 'must read "Head: text"');
    });
    const allC = t.controls.join(" ");
    CONTROLS_MUST.forEach(([re, what]) => { if (!re.test(allC)) err(ctx, `controls must mention ${what}`); });
    if (!hasNumber(WORLD.SETTINGS.fenceRepairScrap, allC)) warn(ctx, "controls: the fence repair cost is not given");
  }
  const base = t.base || {};
  if (!isStr(base.intro)) err(ctx, "base.intro missing");
  Object.entries(WORLD.BASE_ROOMS).forEach(([room, R]) => {
    const rctx = `${ctx} base.rooms.${room}`;
    const r = base.rooms && base.rooms[room];
    if (!r) return err(rctx, "missing");
    if (!isStr(r.desc)) err(rctx, "desc missing");
    if (!Array.isArray(r.next) || r.next.length !== 3 || !r.next.every((x) => isStr(x))) return err(rctx, "next needs 3 strings");
    // a level that requires other rooms must name them, so the player knows what to build first
    const late = R.levels.some((lv) => lv.requires);
    R.levels.forEach((lv, i) => {
      Object.entries(lv.requires || {}).forEach(([other, lvl]) => {
        const name = WORLD.BASE_ROOMS[other].name;
        if (!r.next[i].includes(name)) err(`${rctx} next[${i}]`, `must name "${name}" (requires ${name} ${lvl})`);
        else if (lvl > 1 && !hasNumber(lvl, r.next[i])) warn(`${rctx} next[${i}]`, `names "${name}" but not level ${lvl}`);
      });
      // the late rooms spell out their price: scrap and every item, with the right counts
      if (late) {
        if (!hasNumber(lv.scrap, r.next[i])) err(`${rctx} next[${i}]`, `must give the scrap cost ${lv.scrap}`);
        Object.entries(lv.needs).forEach(([item, n]) => {
          const iname = WORLD.ITEMS[item].name;
          if (!r.next[i].includes(iname)) err(`${rctx} next[${i}]`, `must name "${iname}" (needs ${n})`);
          else if (!hasNumber(n, r.next[i])) err(`${rctx} next[${i}]`, `must give the count for "${iname}" (${n})`);
        });
      }
    });
    // the garage text carries the repair price
    if (room === "garage" && (!hasNumber(WORLD.SETTINGS.repairScrapPerHp, r.desc) || !hasNumber(WORLD.SETTINGS.repairMinScrap, r.desc))) err(rctx, `desc must give the repair price (1 scrap per ${WORLD.SETTINGS.repairScrapPerHp} health, at least ${WORLD.SETTINGS.repairMinScrap})`);
  });
  // traps: key letter, damage, uses, and the Walls level that unlocks each
  const traps = base.traps || {};
  Object.entries(WORLD.TRAPS).forEach(([key, tr]) => {
    const tctx = `${ctx} base.traps.${key}`;
    const d = traps[key] && traps[key].desc;
    if (!isStr(d)) return err(tctx, `desc missing (${tr.name}: key ${tr.key}, ${tr.damage} damage, ${tr.uses} use(s), needs ${Object.entries(tr.requires || {}).map(([o, l]) => WORLD.BASE_ROOMS[o].name + " " + l).join(", ")})`);
    if (!new RegExp("\\b" + tr.key + "\\b").test(d)) err(tctx, `desc must give the placement key as a capital ${tr.key}`);
    if (!hasNumber(tr.damage, d)) err(tctx, `desc must give the damage number ${tr.damage}`);
    if (!hasNumber(tr.uses, d)) err(tctx, `desc must say how many walkers it lasts (${tr.uses})`);
    if (!hasNumber(tr.scrap, d)) err(tctx, `desc must give the scrap cost ${tr.scrap}`);
    Object.entries(tr.needs).forEach(([item, n]) => {
      const iname = WORLD.ITEMS[item].name;
      if (!d.includes(iname)) err(tctx, `desc must name "${iname}" (needs ${n})`);
    });
    Object.entries(tr.requires || {}).forEach(([other, lvl]) => {
      const name = WORLD.BASE_ROOMS[other].name;
      if (!d.includes(name)) err(tctx, `desc must name "${name}" (unlocked by ${name} ${lvl})`);
      else if (!hasNumber(lvl, d)) warn(tctx, `desc names "${name}" but not level ${lvl}`);
    });
  });
  if (!base.bench || !isStr(base.bench.intro)) err(ctx, "base.bench.intro missing (one or two sentences shown at the garage workbench)");
  checkTyping(ctx, t.typing, spec);
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
    const ty = t.typing;
    console.log(`level ${n}: ${WORLD.LOCATIONS.length - 1} locations, ${total} note words, typing ${ty.words.length} words / ${ty.phrases.length} phrases / ${ty.sentences.length} sentences`);
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
