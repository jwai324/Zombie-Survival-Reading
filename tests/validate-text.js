#!/usr/bin/env node
/* Validates js/content/level*.js against js/world.js and docs/TEXT_GUIDE.md.
   Covers howto, base rooms (incl. late rooms and what they require), traps, the
   workbench blurb, the typing drills (fingers, words, phrases, sentences), the notes
   (facts, landmarks, revealed places, and street names that must lie on the way there),
   wall signs, keys, and the home texts (plot signs, journal, radio, item tags, recap, and the
   house: the Hollis family's notes on the cabin walls and the House tab's doors and windows).
   Usage: node tests/validate-text.js [level]. Exit 1 on any error. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
// words/sentence: note length and max sentence length (docs/TEXT_GUIDE.md).
// typeWord: letters per typing word; typePhrase / typeSentence: words per phrase / sentence.
// sign / tag / lot / day: word ranges for wall signs, item and key tags, yard lot signs, journal and radio.
// baseline: in-world reading words (everything but the typing drills) before the reading expansion;
// every level must now carry at least READING_FLOOR times that.
const LEVELS = {
  1: { words: [55, 90], sentence: 7, sign: [6, 22], tag: [10, 24], lot: [20, 48], day: [25, 55], baseline: 2600, typeWord: [3, 4], typePhrase: [2, 2], typeSentence: [3, 6] },
  2: { words: [80, 120], sentence: 10, sign: [8, 26], tag: [14, 30], lot: [30, 62], day: [35, 72], baseline: 3765, typeWord: [3, 5], typePhrase: [2, 2], typeSentence: [4, 7] },
  3: { words: [110, 160], sentence: 14, sign: [10, 32], tag: [18, 36], lot: [40, 82], day: [50, 95], baseline: 4744, typeWord: [3, 6], typePhrase: [2, 3], typeSentence: [5, 9] },
  4: { words: [150, 210], sentence: 18, sign: [12, 40], tag: [22, 44], lot: [55, 100], day: [70, 125], baseline: 5502, typeWord: [4, 7], typePhrase: [2, 3], typeSentence: [6, 10] },
  5: { words: [190, 260], sentence: 22, sign: [15, 46], tag: [26, 52], lot: [70, 120], day: [90, 150], baseline: 6299, typeWord: [4, 8], typePhrase: [2, 4], typeSentence: [7, 11] },
  6: { words: [230, 320], sentence: 26, sign: [18, 56], tag: [30, 62], lot: [85, 140], day: [110, 185], baseline: 7384, typeWord: [5, 9], typePhrase: [2, 4], typeSentence: [8, 12] },
};
const READING_FLOOR = 4;
// people from docs/STORY.md: a fact that names one must be carried by the text that names them too
const PEOPLE = ["Ruby", "Dev", "Lin", "Ada", "Jo", "Max", "Mia", "Adler", "Greer", "Vega", "Dunn", "Luis", "Theo", "Rosa", "Reyes", "Hana", "Okafor", "Priya", "Ortiz", "Carla", "June", "Tomas", "Pip", "Kate", "Dan", "Gus", "Finn", "Lucy", "Biscuit", "Hollis"];
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

function load(file, key, before) {
  const sb = {};
  sb.globalThis = sb;
  vm.createContext(sb);
  (before || []).concat(file).forEach((f) => vm.runInContext(fs.readFileSync(f, "utf8"), sb, { filename: f }));
  return sb.ZSR && sb.ZSR[key];
}
// world.js takes its interiors from layouts.js, so that loads first; the story facts follow it
const JS = (f) => path.join(ROOT, "js", f);
const WORLD = load(JS("story-home.js"), "WORLD", [JS("layouts.js"), JS("world.js"), JS("story.js")]);
if (!WORLD) {
  console.log("ERROR js/world.js did not define ZSR.WORLD");
  process.exit(1);
}

function checkText(ctx, text, spec, scale, facts, range) {
  if (!isStr(text, 3)) return err(ctx, "text missing");
  const wc = words(text).length;
  const r = range || spec.words;
  const lo = Math.round(r[0] * scale);
  const hi = Math.round(r[1] * scale);
  if (wc < lo || wc > hi) warn(ctx, `${wc} words, target ${lo}..${hi}`);
  const longest = sentences(text).reduce((m, s) => Math.max(m, words(s).length), 0);
  if (longest > spec.sentence + 3) warn(ctx, `longest sentence ${longest} words, max ${spec.sentence}`);
  if (/Shambler|poof/i.test(text)) err(ctx, "old-world term");
  // numbers and codes from the facts must survive verbatim
  (facts || []).forEach((f) => {
    (f.match(/\b\d[\d-]*\b/g) || []).forEach((num) => {
      if (!text.includes(num) && !numberWord(num, text)) err(ctx, `fact number "${num}" missing from text`);
    });
  });
  // so must the people and the places the facts name
  const all = (facts || []).join(" ");
  PEOPLE.forEach((name) => {
    const re = new RegExp("\\b" + name + "\\b");
    if (re.test(all) && !re.test(text)) err(ctx, `fact names "${name}" but the text does not`);
  });
  WORLD.LOCATIONS.forEach((l) => {
    if (l.id !== "base" && all.includes(l.name) && !text.includes(l.name)) err(ctx, `fact names "${l.name}" but the text does not`);
  });
}
/* Landmarks steer the player inside a building, so the notes must name them:
   a door note at least two, the main note and the trail notes at least one (the leading "the" is optional). */
const landmarkNames = (loc) => {
  const lay = WORLD.TEMPLATES[loc.template] || {};
  return Object.values(lay.landmarks || {}).map((d) => String(d.name || "").toLowerCase().replace(/^the\s+/, "")).filter(Boolean);
};
const landmarksIn = (text, names) => names.filter((n) => String(text || "").toLowerCase().includes(n));
/* Streets have names on the signs, the city map and the minimap, so a note that names one must name a
   street the player really takes from this place to a place the note reveals. */
const STREETS = load(JS("streets.js"), "Streets", [JS("layouts.js"), JS("world.js")]);
const STREET_LIST = STREETS ? Object.values(STREETS.STREET_NAMES).concat(STREETS.SIDE_STREETS.map((s) => s.name)) : [];
function checkStreets(ctx, text, from, reveals) {
  const low = String(text || "").toLowerCase();
  STREET_LIST.forEach((name) => {
    if (!new RegExp("\\b" + name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(low)) return;
    const onWay = (reveals || []).some((to) => {
      const p = STREETS.route(from, to).path;
      return p.slice(1).some((b, i) => STREETS.streetName(p[i], b) === name);
    });
    if (!onWay) err(ctx, `names "${name}", which is not on the way from here to ${(reveals || []).length ? reveals.join(" or ") : "a place this note reveals (it reveals none)"}`);
  });
}
/** Every string in a level's in-world text, the typing drills aside. */
function readingWords(o) {
  if (typeof o === "string") return words(o).length;
  if (Array.isArray(o)) return o.reduce((n, x) => n + readingWords(x), 0);
  if (o && typeof o === "object") return Object.entries(o).reduce((n, [k, v]) => n + (k === "typing" || k === "level" ? 0 : readingWords(v)), 0);
  return 0;
}
const NUM_WORDS = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten" };
function numberWord(num, text) {
  const w = NUM_WORDS[num];
  return w && new RegExp("\\b" + w + "\\b", "i").test(text);
}
// the number as digits (whole token) or as a number word
const hasNumber = (num, text) => new RegExp("\\b" + String(num).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(text) || !!numberWord(num, text);

/* howto: the paragraphs must carry the current rules and drop the old ones.
   Lanes: the left lane goes straight past side streets and lots, but where roads meet there is one
   lane per road in the order of the sign's arrows, so the player's own lane may be the one that turns. */
const JUNCTION_LANES = /\bmay (well )?(be the one that )?turns?\b/i;
const HOWTO_BANNED = /patched|patch the fence|fence is fixed between/i;
/* The cabin is the Hollis family's house now: no menu at the door, its doors are not locked in a wave
   (walkers break a shut one), and the Walls room is the fence only. Checked in howto, controls, typing. */
const CABIN_BANNED = [
  [/cabin door[^.]*\block|door and the van are locked|door is locked\. So is the van/i, "says the cabin door locks in a wave (it does not: walkers break a shut door, and only the van stays put)"],
  [/cabin menu/i, "names the cabin menu (building is at the office computer)"],
];
const HOWTO_MUST = [
  [/door/i, "the cabin's doors (E opens and shuts them; walkers break a shut one, walk through an open one)"],
  [/window/i, "the cabin's windows (walkers smash them and climb in; you cannot climb out)"],
  [/computer/i, "the office computer (E there opens the build menu)"],
  [/\bbell\b/i, "the dinner bell (it brings the next wave)"],
  [/trap/i, "traps (crafted at the bench, placed in the yard)"],
  [/kit/i, "medical kits (the backpack carries them, one heals to full)"],
  [/typ/i, "typing (how you build, upgrade, and craft)"],
  [/scrap/i, "scrap (fence holes and van repair cost scrap)"],
  [/save/i, "saving (the base is the only place the game saves)"],
  [/\bwell\b/i, "the Well (late game: water)"],
  [/\bfarm/i, "the Farm (late game: crops and animals for food)"],
  [/\blab\b/i, "the Lab (late game: medicine made at home)"],
  [/\bstash/i, "stashes (a locked room in every building)"],
  [/\bkeys?\b/i, "stash keys (hidden in another building, found by reading)"],
  [/journal/i, "June's journal (a page every day at home)"],
  [/radio/i, "the radio (broadcasts once the Radio room is built)"],
  [/\blanes?\b/i, "lanes on the road (be in the right lane before the stop line)"],
  [/\bsigns?\b/i, "the road signs (they say where each lane goes)"],
  [JUNCTION_LANES, "that where roads meet your own lane may turn (one lane per road, as the sign's arrows show)"],
];
/* numbers the How it works text must carry, straight from the world file */
const HOWTO_NUMBERS = () => [
  [WORLD.SETTINGS.fenceRepairScrap, "the scrap a fence hole costs"],
  [WORLD.SETTINGS.houseRepairScrap, "the scrap a broken door or window costs"],
  [WORLD.SETTINGS.kitsMax, "how many kits the backpack holds"],
  [WORLD.SETTINGS.saveSlots, "how many saves there are"],
  [WORLD.SETTINGS.restockDays, "the days until shelf items come back"],
];
/* the controls list: one "Head: text" line per group, keys named as capitals */
const CONTROLS_MUST = [
  [/\bE\b/, "the E key"],
  [/\bT\b/, "the T key (spike trap)"],
  [/\bR\b/, "the R key (blast trap)"],
  [/\bQ\b/, "the Q key (switch guns)"],
  [/\bbow\b/i, "the bow (hold to draw, let go to shoot)"],
  [/\bB\b/, "the B key (backpack)"],
  [/\bP\b/, "the P key (pause)"],
  [/typ/i, "typing at the workbench"],
  [/map/i, "the map"],
  [/computer/i, "the computer (E uses it)"],
  [/\bbell\b/i, "the dinner bell (E rings it)"],
  [/\bM\b/, "the M key (the map of a building)"],
  [/\blanes?\b/i, "lanes on the road"],
  [JUNCTION_LANES, "that where roads meet your own lane may turn"],
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
    CABIN_BANNED.forEach(([re, what]) => { const bad2 = S.filter((x) => re.test(x)); if (bad2.length) err(sctx, `${what}: ${list(bad2)}`); });
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

/* Home: yard lot signs, June's journal, the radio, item tags, the day recap templates, and the house
   (the Hollis family's notes on the cabin walls, and the House tab's doors and windows). */
const RECAP_MUST = { haul: ["items", "scrap"], nothing: [], notes: ["notes"], keys: ["keys"], food: ["food"], hungry: [], next: ["room", "needs"], ready: ["room"] };
function checkHome(ctx, t, spec) {
  const lots = (t.yard && t.yard.lots) || {};
  Object.keys(WORLD.YARD_LOTS || {}).forEach((room) => {
    const L = lots[room];
    const lctx = `${ctx} yard.lots.${room}`;
    const F = (WORLD.YARD_LOTS || {})[room] || { empty: [], built: [[], [], []] };
    if (!L) return err(lctx, "missing");
    if (!isStr(L.title)) err(lctx, "title missing");
    checkText(lctx + " empty", L.empty, spec, 1, F.empty, spec.lot);
    if (!Array.isArray(L.built) || L.built.length !== 3) return err(lctx, "built needs 3 texts (levels 1 to 3)");
    L.built.forEach((b, i) => checkText(`${lctx} built[${i}]`, b, spec, 1, F.built[i], spec.lot));
  });
  [["journal", WORLD.JOURNAL], ["radio", WORLD.RADIO]].forEach(([kind, facts]) => {
    const list = t[kind];
    const kctx = `${ctx} ${kind}`;
    if (!facts) return;
    if (!Array.isArray(list) || list.length !== facts.length) return err(kctx, `needs ${facts.length} entries, has ${Array.isArray(list) ? list.length : 0}`);
    list.forEach((e, i) => {
      if (!e || !isStr(e.title)) err(`${kctx}[${i}]`, "title missing");
      checkText(`${kctx}[${i}]`, e && e.text, spec, 1, facts[i].facts, spec.day);
      if (kind === "radio" && facts[i].voice && e && e.text) {
        const v = facts[i].voice.split(" ").pop();
        if (!e.text.includes(v) && !(e.title || "").includes(v)) err(`${kctx}[${i}]`, `the speaker (${facts[i].voice}) is never named`);
      }
    });
  });
  const tags = t.tags || {};
  Object.keys(WORLD.ITEMS).forEach((item) => {
    const list = tags[item];
    const ictx = `${ctx} tags.${item}`;
    const F = (WORLD.ITEM_TAGS || {})[item] || [[], []];
    if (!Array.isArray(list) || list.length !== 2) return err(ictx, "needs 2 tags");
    list.forEach((x, i) => checkText(`${ictx}[${i}]`, x, spec, 1, F[i], spec.tag));
  });
  // the house: what the Hollis family left on the walls, one note per room, read up close
  const house = t.house || {};
  const hnotes = house.notes || {};
  Object.entries(WORLD.HOUSE_NOTES || {}).forEach(([id, facts]) => {
    const hctx = `${ctx} house.notes.${id}`;
    const H = hnotes[id];
    if (!H) return err(hctx, "missing");
    if (!isStr(H.title)) err(hctx, "title missing");
    else if (words(H.title).length > 7) warn(hctx, "title is long");
    checkText(hctx, H.text, spec, 1, facts, spec.lot);
  });
  Object.keys(hnotes).forEach((id) => { if (!(WORLD.HOUSE_NOTES || {})[id]) err(`${ctx} house.notes`, `unknown note id ${id}`); });
  // the computer's House tab: doors and windows, a desc and one text per level, short like the base rooms
  const ups = house.upgrades || {};
  Object.entries(WORLD.HOUSE_UPGRADE_FACTS || {}).forEach(([key, F]) => {
    const uctx = `${ctx} house.upgrades.${key}`;
    const U = ups[key];
    const hp = ((WORLD.HOUSE_UPGRADES || {})[key] || {}).hp || [];
    if (!U) return err(uctx, "missing");
    checkText(uctx + " desc", U.desc, spec, 1, F.desc, [spec.tag[0], spec.lot[1]]);
    if (hp.length && isStr(U.desc) && !hasNumber(hp[0], U.desc)) err(uctx + " desc", `must give the starting strength ${hp[0]}`);
    if (!Array.isArray(U.next) || U.next.length !== F.next.length || !U.next.every((x) => isStr(x))) return err(uctx, `next needs ${F.next.length} strings`);
    U.next.forEach((x, i) => {
      checkText(`${uctx} next[${i}]`, x, spec, 1, F.next[i], [4, spec.tag[1]]);
      if (hp[i + 1] != null && !hasNumber(hp[i + 1], x)) err(`${uctx} next[${i}]`, `must give the new strength ${hp[i + 1]}`);
    });
  });
  Object.keys(ups).forEach((k) => { if (!(WORLD.HOUSE_UPGRADE_FACTS || {})[k]) err(`${ctx} house.upgrades`, `unknown key ${k}`); });
  const rc = t.recap || {};
  Object.entries(RECAP_MUST).forEach(([k, slots]) => {
    if (!isStr(rc[k])) return err(`${ctx} recap.${k}`, "missing");
    slots.forEach((slot) => { if (!rc[k].includes("{" + slot + "}")) err(`${ctx} recap.${k}`, `must use {${slot}}`); });
    const longest = longestSentence(rc[k]);
    if (longest > spec.sentence + 3) warn(`${ctx} recap.${k}`, `longest sentence ${longest}, max ${spec.sentence}`);
  });
}

function checkLevel(n) {
  const spec = LEVELS[n];
  const file = path.join(ROOT, "js", "content", `level${n}.js`);
  const ctx = `level${n}`;
  if (!fs.existsSync(file)) return err(ctx, "missing file");
  let TEXT;
  try {
    // the level file, then its parts (levelN-places1.js, levelN-places2.js, levelN-home.js ...)
    const dir = path.join(ROOT, "js", "content");
    const parts = fs.readdirSync(dir).filter((f) => f.startsWith(`level${n}-`) && f.endsWith(".js")).sort();
    const sb = {};
    sb.globalThis = sb;
    [file].concat(parts.map((f) => path.join(dir, f))).forEach((f) => vm.runInNewContext(fs.readFileSync(f, "utf8"), sb, { filename: f }));
    TEXT = sb.ZSR && sb.ZSR.TEXT;
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    parts.forEach((f) => { if (!html.includes(`js/content/${f}`)) err(ctx, `index.html does not load js/content/${f}`); });
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
    CABIN_BANNED.forEach(([re, what]) => { if (re.test(all)) err(ctx, `howto ${what}`); });
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
    CABIN_BANNED.forEach(([re, what]) => { if (re.test(allC)) err(ctx, `controls ${what}`); });
    if (!hasNumber(WORLD.SETTINGS.fenceRepairScrap, allC)) warn(ctx, "controls: the fence repair cost is not given");
  }
  const base = t.base || {};
  if (!isStr(base.intro)) err(ctx, "base.intro missing");
  Object.entries(WORLD.BASE_ROOMS).forEach(([room, R]) => {
    const rctx = `${ctx} base.rooms.${room}`;
    const r = base.rooms && base.rooms[room];
    if (!r) return err(rctx, "missing");
    if (!isStr(r.desc)) err(rctx, "desc missing");
    else if (room === "walls" && /\b(house|cabin)\b/i.test(r.desc)) err(rctx, "desc puts the Walls on the cabin (Walls is the fence only; the House tab does the doors and windows)");
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
  // River Landing: the fishing pole's tag (reading it reveals the place), the sign by the parking and the
  // chief's note on the dock post, each carrying its facts; the tag also gives the way there
  {
    const R = t.river;
    const F = WORLD.RIVER_FACTS || {};
    if (!R) err(ctx + " river", "missing");
    else {
      if (!isStr(R.blurb)) err(ctx + " river", "blurb missing (the city map)");
      if (!R.rod || !isStr(R.rod.name)) err(ctx + " river rod", "name missing");
      else {
        checkText(ctx + " river rod", R.rod.tag, spec, 1, F.rod, [spec.tag[0], spec.lot[1]]);
        ["Frog Lane", "River Road", "River Landing"].forEach((nm) => { if (!(R.rod.tag || "").includes(nm)) err(ctx + " river rod", `the tag must name "${nm}" (it gives the way there)`); });
      }
      ["sign", "note"].forEach((k) => {
        if (!R[k] || !isStr(R[k].title)) return err(`${ctx} river ${k}`, "title missing");
        checkText(`${ctx} river ${k}`, R[k].text, spec, 1, F[k], k === "sign" ? spec.sign : spec.day); // the note runs as long as a journal day
      });
      if (R.note && !hasNumber(WORLD.RIVER.cap, R.note.text || "")) err(ctx + " river note", `must give the fish a trip (${WORLD.RIVER.cap})`);
      if (R.note && !hasNumber(WORLD.RIVER.restockDays, R.note.text || "")) err(ctx + " river note", `must give the days the river rests (${WORLD.RIVER.restockDays})`);
    }
    if (Array.isArray(t.controls) && !/pole/i.test(t.controls.join(" "))) err(ctx, "controls must say how to fish (the pole is 6)");
  }
  if (!t.locations) return err(ctx, "locations missing");
  WORLD.LOCATIONS.filter((l) => l.id !== "base" && !l.outdoor).forEach((loc) => {
    const L = t.locations[loc.id];
    const lctx = `${ctx} ${loc.id}`;
    if (!L) return err(lctx, "missing");
    if (!isStr(L.blurb)) err(lctx, "blurb missing");
    const N = WORLD.NOTES[loc.id];
    if (!L.door || !isStr(L.door.title)) err(lctx + " door", "title missing");
    else if (words(L.door.title).length > 7) warn(lctx + " door", "title is long");
    checkText(lctx + " door", L.door && L.door.text, spec, 0.75, N.door.facts);
    checkStreets(lctx + " door", L.door && L.door.text, loc.id, []);
    const marks = landmarkNames(loc);
    const doorMarks = landmarksIn(L.door && L.door.text, marks);
    if (marks.length && doorMarks.length < 2) err(lctx + " door", `must name at least two landmarks (${marks.join(", ")}); names ${doorMarks.length ? doorMarks.join(", ") : "none"}`);
    N.notes.forEach((note) => {
      const T = L.notes && L.notes[note.id];
      if ((note.minLevel || 1) > n) {
        if (T) warn(`${lctx} ${note.id}`, `written, but only placed from reading level ${note.minLevel}`);
        return;
      }
      if (!T) return err(`${lctx} ${note.id}`, "missing");
      if (!isStr(T.title)) err(`${lctx} ${note.id}`, "title missing");
      // the main note also gives the way to the locked door
      checkText(`${lctx} ${note.id}`, T.text, spec, note.unlocks ? 1.2 : 1, note.facts);
      checkStreets(`${lctx} ${note.id}`, T.text, loc.id, note.reveals);
      if ((note.unlocks || note.kind === "trail") && marks.length && !landmarksIn(T.text, marks).length) err(`${lctx} ${note.id}`, `must name at least one landmark (${marks.join(", ")})`);
      if (note.unlocks && !/open|unlock|key|code|latch|bolt|badge|combination|handle|hatch|lift|twist/i.test(T.text || "")) warn(`${lctx} ${note.id}`, "note unlocks a cache but the text never says how to open it");
      (note.reveals || []).forEach((rid) => {
        const target = WORLD.LOCATIONS.find((l) => l.id === rid);
        if (target && !(T.text || "").includes(target.name)) err(`${lctx} ${note.id}`, `must name "${target.name}" (reveals it)`);
      });
    });
    Object.keys(L.notes || {}).forEach((id) => {
      if (!N.notes.find((x) => x.id === id)) err(lctx, `unknown note id ${id}`);
    });
    // the note that leads to the key names the stash it opens and where
    if (N.key) {
      const target = WORLD.LOCATIONS.find((l) => l.id === N.key.opens);
      const kn = L.notes && L.notes[N.key.after];
      const bare = target.stashName.replace(/^the /i, "").toLowerCase();
      if (kn && !(kn.text || "").toLowerCase().includes(bare)) err(`${lctx} ${N.key.after}`, `must name the stash it opens ("${target.stashName}" at ${target.name})`);
      const K = L.key;
      const kctx = `${lctx} key`;
      if (!K || !isStr(K.name)) err(kctx, "name missing (2 to 6 words: what the key looks like)");
      else if (words(K.name).length > 7) warn(kctx, "name is long");
      if (!K || !isStr(K.tag)) err(kctx, "tag missing (what its tag says)");
      else checkText(kctx, K.tag, spec, 1, N.key.facts, spec.tag);
    }
    // wall signs and graffiti
    (N.signs || []).forEach((sg) => {
      const S = L.signs && L.signs[sg.id];
      const sctx = `${lctx} ${sg.id}`;
      if (!S) return err(sctx, "missing");
      if (!isStr(S.title)) err(sctx, "title missing");
      checkText(sctx, S.text, spec, 1, sg.facts, spec.sign);
    });
    Object.keys(L.signs || {}).forEach((id) => {
      if (!(N.signs || []).find((x) => x.id === id)) err(lctx, `unknown sign id ${id}`);
    });
  });
  checkHome(ctx, t, spec);
  const total = readingWords(t);
  const floor = Math.round(spec.baseline * READING_FLOOR);
  if (total < floor) err(ctx, `in-world reading is ${total} words; it must be at least ${READING_FLOOR}x the old ${spec.baseline} (${floor})`);
  else console.log(`level ${n}: in-world reading ${total} words (${(total / spec.baseline).toFixed(1)}x the old ${spec.baseline})`);
  if (!errors.some((e) => e.startsWith(ctx))) {
    const buildings = WORLD.LOCATIONS.filter((l) => l.id !== "base" && !l.outdoor);
    const total = buildings.reduce((n2, loc) => {
      const L = t.locations[loc.id];
      return n2 + words(L.door.text).length + Object.values(L.notes).reduce((m, x) => m + words(x.text).length, 0);
    }, 0);
    const ty = t.typing;
    console.log(`level ${n}: ${buildings.length} buildings, ${total} note words, typing ${ty.words.length} words / ${ty.phrases.length} phrases / ${ty.sentences.length} sentences`);
  }
}

const only = process.argv[2] ? [Number(process.argv[2])] : [1, 2, 3, 4, 5, 6];
if (!STREETS) err("js/streets.js", "did not define ZSR.Streets");
// the facts in world.js and story.js are held to the same rule as the words
WORLD.LOCATIONS.filter((l) => WORLD.NOTES[l.id]).forEach((loc) => {
  const N = WORLD.NOTES[loc.id];
  checkStreets(`world ${N.door.id}`, N.door.facts.join(" "), loc.id, []);
  N.notes.forEach((note) => checkStreets(`world ${note.id}`, note.facts.join(" "), loc.id, note.reveals));
});
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
