#!/usr/bin/env node
/* Validates js/content/level*.js against js/world.js and docs/TEXT_GUIDE.md.
   Covers howto, base rooms (incl. late rooms and what they require), traps, the
   workbench blurb, the typing drills (fingers, words, phrases, sentences), the notes
   (facts, landmarks, revealed places, and street names that must lie on the way there),
   wall signs, keys, and the home texts (plot signs, journal, radio, item tags, recap, and the
   house: the Hollis family's notes on the cabin walls and the House tab's doors and windows), and the crew's
   words (T.crew: talk, tips, reports, story quests, errands, the dog; see "The crew at home base" below), and
   June's first-run tutorial (level 1 only: T.tutorial, see checkTutorial).
   Usage: node tests/validate-text.js [level ...] [--crew=auto|strict|present]. Exit 1 on any error. */
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
  1: { words: [65, 130], sentence: 9, sign: [6, 22], tag: [10, 24], lot: [20, 48], day: [25, 55], baseline: 2600, typeWord: [3, 4], typePhrase: [2, 2], typeSentence: [3, 6] },
  2: { words: [80, 120], sentence: 10, sign: [8, 26], tag: [14, 30], lot: [30, 62], day: [35, 72], baseline: 3765, typeWord: [3, 5], typePhrase: [2, 2], typeSentence: [4, 7] },
  3: { words: [110, 160], sentence: 14, sign: [10, 32], tag: [18, 36], lot: [40, 82], day: [50, 95], baseline: 4744, typeWord: [3, 6], typePhrase: [2, 3], typeSentence: [5, 9] },
  4: { words: [150, 210], sentence: 18, sign: [12, 40], tag: [22, 44], lot: [55, 100], day: [70, 125], baseline: 5502, typeWord: [4, 7], typePhrase: [2, 3], typeSentence: [6, 10] },
  5: { words: [190, 260], sentence: 22, sign: [15, 46], tag: [26, 52], lot: [70, 120], day: [90, 150], baseline: 6299, typeWord: [4, 8], typePhrase: [2, 4], typeSentence: [7, 11] },
  6: { words: [230, 320], sentence: 26, sign: [18, 56], tag: [30, 62], lot: [85, 140], day: [110, 185], baseline: 7384, typeWord: [5, 9], typePhrase: [2, 4], typeSentence: [8, 12] },
};
const READING_FLOOR = 4;
// the lock answers each save rolls (js/locks.js) and the fixed answers they replaced
const PLACEHOLDERS = ["code", "codeSpoken", "decoyCode", "decoyCodeSpoken", "move1", "move2", "moves", "decoyMove1", "decoyMove2", "decoyMoves", "pick", "decoyPick", "button", "decoyButton"];
const OLD_ANSWERS = ["4471", "4417", "19-4-33", "33-4-19", "2218", "2281", "0912", "0921", "red key on the board", "ask the dictionary", "on the hook under the counter", "taped under the register", "in the watering can", "in the top desk drawer", "inside the big dictionary"];
/* what a mistake costs, by kind: a note that warns of it must say so in words the player knows */
const FAIL_WORDS = { trap: /\b(trap|rigged|bomb|blast|kill|kills|shock|live|die|dead)\b/i, alarm: /\b(alarm|bells?|horns?|noise)\b/i, jam: /\b(jam|jams|jammed|crowbar)\b/i };
// people from docs/STORY.md: a fact that names one must be carried by the text that names them too
const PEOPLE = ["Ruby", "Dev", "Lin", "Ada", "Jo", "Max", "Mia", "Adler", "Greer", "Vega", "Dunn", "Luis", "Theo", "Rosa", "Reyes", "Hana", "Okafor", "Priya", "Ortiz", "Carla", "June", "Tomas", "Pip", "Kate", "Dan", "Gus", "Finn", "Lucy", "Biscuit", "Hollis"];
// teen audience (CLAUDE.md): no profanity in any string of a level (checkLevel)
const PROFANITY = /\b(damn\w*|goddamn\w*|hell|crap\w*|shit\w*|fuck\w*|bitch\w*|bastard\w*|asshole\w*|piss\w*)\b/i;
const errors = [];
const warnings = [];
const err = (c, m) => errors.push(c + ": " + m);
const warn = (c, m) => warnings.push(c + ": " + m);
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean);
// a sentence ends at . ! or ? (and a closing quote), but never at Mr., Mrs., Ms., Dr. or St.: in these texts they
// always come before a name ("Mr. Ortiz", "St. Anne Annex"), so the sentence goes on
const sentences = (s) => String(s).replace(/\n+/g, " ").split(/(?<=[.!?]["”']?)(?<!\b(?:Mr|Mrs|Ms|Dr|St)\.)\s+/).map((x) => x.trim()).filter(Boolean);
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

/** Run these files, in order, in one fresh sandbox and hand back ZSR[key]. */
function load(files, key) {
  const sb = {};
  sb.globalThis = sb;
  vm.createContext(sb);
  files.forEach((f) => vm.runInContext(fs.readFileSync(f, "utf8"), sb, { filename: f }));
  return sb.ZSR && sb.ZSR[key];
}
const JS = (f) => path.join(ROOT, "js", f);
// the fact files, in page order: js/layouts.js (world.js takes its interiors from it), js/world.js and every
// js/story*.js index.html loads, so a fact file split off as the game grows (story-quests2.js) is checked too
// (tests/validate-world.js reads the same list and checks the page loads them in a working order)
const PAGE = [...fs.readFileSync(path.join(ROOT, "index.html"), "utf8").matchAll(/<script src="js\/([^"]+)"><\/script>/g)].map((m) => m[1]);
const FACT_FILES = PAGE.filter((f) => /^(layouts|world|story[\w-]*)\.js$/.test(f)).map(JS);
const WORLD = load(FACT_FILES, "WORLD");
if (!WORLD) {
  console.log("ERROR js/world.js did not define ZSR.WORLD");
  process.exit(1);
}

/** opts.vars: the placeholders this text may use (the crew's words); without it, the lock placeholders.
    opts.skip: people or place names another check reports in its own words (a crew text's speaker, a brief's place). */
function checkText(ctx, text, spec, scale, facts, range, opts) {
  if (!isStr(text, 3)) return err(ctx, "text missing");
  const wc = words(text).length;
  const r = range || spec.words;
  const lo = Math.round(r[0] * scale);
  const hi = Math.round(r[1] * scale);
  if (wc < lo || wc > hi) warn(ctx, `${wc} words, target ${lo}..${hi}`);
  const longest = sentences(text).reduce((m, s) => Math.max(m, words(s).length), 0);
  if (longest > spec.sentence + 3) warn(ctx, `longest sentence ${longest} words, max ${spec.sentence}`);
  if (/Shambler|poof/i.test(text)) err(ctx, "old-world term");
  checkPronouns(ctx, String(text), !!(opts && opts.vars)); // Pip is "they" in every text; the crew's are held closer
  // the lock answers are rolled per save: the words carry {placeholders}, never a fixed code
  const allowed = opts && opts.vars;
  (String(text).match(/\{(\w+)\}/g) || []).forEach((ph) => {
    const k = ph.slice(1, -1);
    if (!allowed) {
      if (!PLACEHOLDERS.includes(k)) err(ctx, `unknown placeholder ${ph}`);
    } else if (!allowed.includes(k)) {
      if (PLACEHOLDERS.includes(k)) err(ctx, `${ph} is a lock answer; the crew never give one`);
      else if (CREW_VARS.includes(k)) err(ctx, `${ph} is not filled in this text (it may use ${allowed.length ? allowed.map((x) => "{" + x + "}").join(" ") : "no placeholders"})`);
      else err(ctx, `unknown placeholder ${ph} (crew placeholders: ${CREW_VARS.map((x) => "{" + x + "}").join(" ")})`);
    }
  });
  OLD_ANSWERS.forEach((old) => { if (String(text).includes(old)) err(ctx, `still gives the old fixed answer "${old}" (use the {placeholder})`); });
  [...new Set((facts || []).join(" ").match(/\{\w+\}/g) || [])].forEach((ph) => { if (!String(text).includes(ph)) err(ctx, `fact placeholder ${ph} missing from text`); });
  // numbers and codes from the facts must survive verbatim
  (facts || []).forEach((f) => {
    (f.match(/\b\d[\d-]*\b/g) || []).forEach((num) => {
      if (!text.includes(num) && !numberWord(num, text)) err(ctx, `fact number "${num}" missing from text`);
    });
  });
  // so must the people and the places the facts name
  const all = (facts || []).join(" ");
  const skip = (opts && opts.skip) || [];
  PEOPLE.filter((name) => !skip.includes(name)).forEach((name) => {
    const re = new RegExp("\\b" + name + "\\b");
    if (re.test(all) && !re.test(text)) err(ctx, `fact names "${name}" but the text does not`);
  });
  WORLD.LOCATIONS.forEach((l) => {
    if (l.id !== "base" && !skip.includes(l.name) && all.includes(l.name) && !text.includes(l.name)) err(ctx, `fact names "${l.name}" but the text does not`);
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
const STREETS = load(FACT_FILES.concat(JS("streets.js")), "Streets");
const STREET_LIST = STREETS ? Object.values(STREETS.STREET_NAMES).concat(STREETS.SIDE_STREETS.map((s) => s.name)) : [];
// June's first-run tutorial: its card list and text keys come from the engine (js/tutorial.js touches no DOM)
const TUTORIAL = load(FACT_FILES.concat(JS("tutorial.js")), "Tutorial");
const TUTORIAL_WARN_WORDS = 55; // a card stays short (a warning)
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
/* The fence never mends itself: a hole stays until it is fixed (by you with E or the computer, or by the crew's
   fence fixer in the calm), and every fix costs scrap. So "patch" never goes with the fence, a hole or a gap in one
   sentence. June still "patches you up" (her heal job): that sentence names no fence. */
const HOWTO_BANNED = /\b(fence|holes?|gaps?)\b[^.!?]*\bpatch(ed|es|ing)?\b|\bpatch(ed|es|ing)?\b[^.!?]*\b(fence|holes?|gaps?)\b|fence is fixed between/i;
/* The cabin is the Hollis family's house now: no menu at the door, its doors are not locked in a wave
   (walkers break a shut one), and the Walls room is the fence only. Checked in howto, controls, typing. */
const CABIN_BANNED = [
  [/cabin door[^.]*\block|door and the van are locked|door is locked\. So is the van/i, "says the cabin door locks in a wave (it does not: walkers break a shut door, and only the van stays put)"],
  [/cabin menu/i, "names the cabin menu (building is at the office computer)"],
];
// How it works: paragraphs at every level (the crew have their own since the crew drop). SCALE: a warning bound;
// raise the top when a new feature earns a paragraph of its own
const HOWTO_PARAGRAPHS = [3, 7];
/* How it works is mostly backstory now (owner decision 2026-10-15, DESIGN.md): the keys live in the controls list,
   the yard basics in June's tutorial, and the rest in the notes, signs and plot signs. It must still carry the few
   rules a player cannot find out alone, the ones that cost a run when missed. */
const HOWTO_MUST = [
  [/save/i, "saving (the base is the only place the game saves; going down loads the last save)"],
  [/\bwaves?\b/i, "waves (the calm ends and walkers come for the fence and the cabin)"],
  [/scrap/i, "scrap (a fence hole stays until fixed, and every fix costs scrap)"],
  [/typ/i, "typing (how you build)"],
  [/\bnotes?\b/i, "the notes (read them: they say where things are and how to open the cache)"],
  [/alarm/i, "alarms (a wrong code sets one off, and walkers pour in)"],
  [/\bstash/i, "stashes (a locked room in every building)"],
  [/\bkeys?\b/i, "stash keys (hidden in a different building, found by reading)"],
  [/\bsigns?\b/i, "the road signs (they say where each lane goes)"],
  [JUNCTION_LANES, "that where roads meet your own lane may turn"],
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

/* The crossover universes (docs/UNIVERSES.md): T.universe[u] in js/content/levelN-<u>.js holds June's ledger lines
   (`journal`, a few lines under a day's page: the tag range, a little longer) and the broadcasts (`radio`, the lot
   range), one per WORLD.UNIVERSES[u] entry, in order. A broadcast names its speaker, as the base radio's do. The
   crew's words for a universe's topics and quests live in T.crew with the rest (checkCrew). */
const XJ_SCALE = 1.6; // a crossover ledger line runs this times an item tag's length
function checkUniverses(ctx, t, spec) {
  const U = WORLD.UNIVERSES || {};
  const T = t.universe || {};
  Object.keys(T).forEach((u) => { if (!U[u]) err(`${ctx} universe.${u}`, "not a universe in WORLD.UNIVERSES (js/story-<universe>.js)"); });
  Object.entries(U).forEach(([u, def]) => {
    [["journal", spec.tag, XJ_SCALE], ["radio", spec.lot, 1]].forEach(([kind, range, scale]) => {
      const facts = def[kind] || [];
      const list = T[u] && T[u][kind];
      const kctx = `${ctx} universe.${u}.${kind}`;
      if (!facts.length) return;
      if (!Array.isArray(list) || list.length !== facts.length) return err(kctx, `needs ${facts.length} entries (js/content/level${spec.n}-${u}.js), has ${Array.isArray(list) ? list.length : 0}`);
      list.forEach((e, i) => {
        if (!e || !isStr(e.title)) err(`${kctx}[${i}]`, "title missing");
        checkText(`${kctx}[${i}]`, e && e.text, spec, scale, facts[i].facts, range);
        if (/\b(blood|bloody|gore|guts|corpse|dead body)\b/i.test((e && e.text) || "")) err(`${kctx}[${i}]`, "no gore in reading text");
        if (kind === "radio" && facts[i].voice && e && e.text) {
          const v = facts[i].voice.split(" ").pop();
          if (!e.text.includes(v) && !(e.title || "").includes(v)) err(`${kctx}[${i}]`, `the speaker (${facts[i].voice}) is never named`);
        }
      });
    });
  });
}

/* ---------- The crew at home base: T.crew in js/content/levelN-crew.js (docs/CREW.md "Words") ----------
   Facts: CREW_TALK, CREW_TIPS, CREW_REPORTS, ERRANDS (js/story-crew.js), QUESTS and DOG (js/story-quests.js).
   Every text is checked like any other (checkText: its facts' numbers, people, places and placeholders), plus the
   crew's own rules: only the placeholders the engine fills for that text, the speaker named, a quest brief that
   says where (place, direction, the room sign in capitals, landmark, streets on the way from the cabin, the reward
   as the facts promise it), no place or person the player may not know yet, no stash, no lock answer, no gore or
   bite, no stray brace, Pip as "they" (in every text, not only the crew's) and the dog as "it".
   Modes, so npm test passes between the facts and the words (the first one set wins: the command line
   --crew=auto|strict|present, then CREW_STRICT=1 in the environment, then CREW_WORDS_REQUIRED):
   - auto (the default): a level whose T.crew has no words yet gets one warning counting what is missing; a level
     with any crew words is checked in full, every missing text an error, its How it works and controls too.
   - strict: every level in full, words or not (the to-do list for a level: node tests/validate-text.js 3 --crew=strict).
   - present: only the texts that are written; what is missing is listed as warnings (for drafting). */
const CREW_WORDS_REQUIRED = true; // the crew words are written at every level: a missing crew text fails npm test
const ARGS = process.argv.slice(2);
ARGS.filter((a) => !/^\d+$/.test(a) && !/^--crew=/.test(a)).forEach((a) => {
  console.log(`ERROR unknown argument ${a}. Usage: node tests/validate-text.js [level ...] [--crew=auto|strict|present]`);
  process.exit(1);
});
const CREW_MODE = (() => {
  const flag = (ARGS.find((a) => a.startsWith("--crew=")) || "").slice(7);
  if (["auto", "strict", "present"].includes(flag)) return flag;
  if (flag) {
    console.log(`ERROR --crew=${flag}: use --crew=auto, --crew=strict or --crew=present`);
    process.exit(1);
  }
  return process.env.CREW_STRICT === "1" || CREW_WORDS_REQUIRED ? "strict" : "auto";
})();
/* The placeholders the engine fills, by text: the same tables as tests/validate-crew.js (compared at the start of a
   run) and as TIP_VARS and REPORTS in tests/validate-world.js (compared there). Every placeholder in a text's facts must be in its words. {dog} (the dog's name, or "the dog" before it has
   one) is filled everywhere, but only these texts may use it: talk (topics, moods and a quest's payoff), a quest's
   brief and thanks, and the dog's own named and pet lines; titles and tags are shown as written, so never any. */
const CREW_TIP_VARS = { hungry: [], food: ["food", "days"], ready: ["room"], build: ["room", "needs"], heal: ["hp"], van: ["hp", "max", "cost"], vanFree: ["hp", "max"], fence: ["holes", "cracks"], cabin: ["broken"], crowbar: [], fine: [], wave: ["size", "sides"], keys: ["keys"], walkers: ["days"], radio: [], full: [], lanky: [], armored: [], wrecked: ["rooms", "cost"], screamer: [], wreckers: [] };
const CREW_REPORT_VARS = { fence: ["fixed", "scrap"], fenceFree: ["fixed"], cabin: ["fixed", "scrap"], cabinFree: ["fixed"], builds: ["fixed", "scrap"], buildsFree: ["fixed"], hurt: ["who", "cost"], late: ["item"] };
const CREW_ERRAND_VARS = ["count", "item", "days", "reward"];
const CREW_QUEST_VARS = { brief: ["reward"], done: ["reward"], title: [], tag: [], journal: [], after: [] };
const CREW_DOG_SUBS = ["brief", "done", "after"]; // the quest texts that may also say {dog}
// every crew placeholder (docs/CREW.md "Words")
const CREW_VARS = ["food", "days", "room", "needs", "hp", "max", "cost", "holes", "cracks", "broken", "keys", "size", "sides", "rooms", "fixed", "scrap", "who", "item", "count", "reward", "dog"];
const CREW_TITLE_WORDS = [2, 6]; // words in a talk or errand title
const QUEST_TITLE_WORDS = [1, 6]; // a quest title is the object's name ("Binoculars", "Bag of sunflower seeds")
// the crew are hurt off-screen and nobody dies (DESIGN.md): never gore or a bite (a bite means turning); words of
// death and wounds get a second look ("got hurt", never more)
const CREW_GORE = /\b(blood\w*|gore|gory|guts|corpses?|bitten|infect\w*|mangled|maul\w*)\b/i;
const CREW_GRIM = /\b(die|died|dies|dying|dead|death|kill|kills|killed|wounds|wounded|injur\w*)\b/i; // not "wound": Pip wound the wire
// a "they" crew member (Pip): never he or she words ("they" is also the plural, so only these count as wrong)
const GENDERED_WORDS = ["he", "she", "him", "his", "her", "hers", "himself", "herself"];
const HONORIFIC = /\b(Mr|Mrs|Ms|Dr|Chief|Officer|Sergeant|Sgt)\b\.?/; // a person the PEOPLE list may not hold
const escRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const nameRe = (name) => new RegExp("\\b" + escRe(name) + "\\b");
const crewOf = () => WORLD.CREW || {};
const crewName = (id) => (crewOf()[id] && crewOf()[id].name) || String(id);
const crewNames = () => Object.values(crewOf()).map((c) => c && c.name).filter(Boolean);
/** The people (PEOPLE and the crew) a text names, each once. */
const peopleIn = (txt) => [...new Set(PEOPLE.concat(crewNames()))].filter((nm) => nameRe(nm).test(String(txt || "")));
const hasCrewFacts = () => Object.keys(crewOf()).length > 0 || (WORLD.QUESTS || []).length > 0;
const factsList = (f) => (Array.isArray(f) ? f : f && Array.isArray(f.facts) ? f.facts : []);
const DIRS = /\b(north|south|east|west|northeast|northwest|southeast|southwest) of the cabin\b/gi;

/** The engine's placeholder tables here must match tests/validate-crew.js (they say what the engine fills). */
function checkCrewTables() {
  let src = "";
  try {
    src = fs.readFileSync(path.join(__dirname, "validate-crew.js"), "utf8");
  } catch (e) {
    return warn("tests/validate-crew.js", "not found: the crew placeholder tables here are not compared with it");
  }
  const canon = (v) => JSON.stringify(v, (k, x) => (Array.isArray(x) ? x.slice().sort() : x && typeof x === "object" ? Object.keys(x).sort().reduce((o, key) => ((o[key] = x[key]), o), {}) : x));
  [["TIP_VARS", CREW_TIP_VARS], ["REPORT_VARS", CREW_REPORT_VARS], ["ERRAND_VARS", CREW_ERRAND_VARS], ["QUEST_VARS", CREW_QUEST_VARS]].forEach(([name, mine]) => {
    const m = src.match(new RegExp("const " + name + " = ([^;\\n]+);"));
    let theirs = null;
    try {
      theirs = m ? vm.runInNewContext("(" + m[1] + ")") : null;
    } catch (e) {
      theirs = null;
    }
    if (!theirs) return warn("tests/validate-crew.js", `could not read ${name}: the crew placeholder rules here are not compared with it`);
    if (Array.isArray(mine)) {
      if (canon(theirs) !== canon(mine)) err("tests/validate-text.js", `CREW_${name} ${canon(mine)} differs from ${name} ${canon(theirs)} in tests/validate-crew.js (what the engine fills): make them the same`);
      return;
    }
    // a text in both tables must allow the same placeholders; one only in one table means the other is behind
    Object.keys(mine).concat(Object.keys(theirs).filter((k) => !(k in mine))).forEach((k) => {
      if (!(k in theirs)) warn("tests/validate-crew.js", `${name} has no ${k} (CREW_${name} here has ${canon(mine[k])})`);
      else if (!(k in mine)) warn("tests/validate-text.js", `CREW_${name} has no ${k} (tests/validate-crew.js has ${canon(theirs[k])})`);
      else if (canon(theirs[k]) !== canon(mine[k])) err("tests/validate-text.js", `CREW_${name}.${k} ${canon(mine[k])} differs from tests/validate-crew.js ${canon(theirs[k])} (what the engine fills): make them the same`);
    });
  });
}

/** Every crew text the facts call for, one slot each: where it sits in T.crew, its facts, its length range (a
    LEVELS key), the placeholders it may use, who must be named, and the places it may name. */
function crewSlots() {
  const W = WORLD;
  const quests = (W.QUESTS || []).filter((q) => q && q.id);
  const dogQ = quests.find((q) => q.kind === "dog");
  const known = W.LOCATIONS.filter((l) => l.known && l.id !== "base").map((l) => l.id);
  const placesIn = (txt) => W.LOCATIONS.filter((l) => l.id !== "base" && txt.includes(l.name)).map((l) => l.id);
  const noteLoc = {};
  Object.entries(W.NOTES || {}).forEach(([locId, N]) => [N.door].concat(N.notes || []).forEach((n) => n && (noteLoc[n.id] = locId)));
  const byGiver = (g) => quests.filter((q) => q.giver === g);
  // a quest's texts name its own place and the places of the giver's quests before it (each was known when offered)
  const questPlaces = (q) => byGiver(q.giver).slice(0, byGiver(q.giver).indexOf(q) + 1).map((x) => x.at);
  // the dog is home: the dog quest is done, so it is home for its thanks and payoff and for the giver's later quests
  const dogDone = (q) => !!dogQ && q.giver === dogQ.giver && byGiver(q.giver).indexOf(q) > byGiver(q.giver).indexOf(dogQ);
  // people: those its facts (and `peopleFrom`, the facts of the texts it goes with) name, the crew, and the Hollis
  // family and whoever else the cabin's wall notes name (read from day 1)
  const textOf = (srcs) => srcs.map((f) => factsList(f).join(" ")).join(" ");
  const home = crewNames().concat(peopleIn(textOf(Object.values(W.HOUSE_NOTES || {}))));
  const out = [];
  const add = (s) => out.push(Object.assign({ facts: [], vars: [], places: new Set(known.concat(placesIn(factsList(s.facts).join(" ")), s.extra || [])), people: new Set(home.concat(peopleIn(textOf([s.facts].concat(s.peopleFrom || []))))) }, s));

  Object.entries(W.CREW_TALK || {}).forEach(([who, T]) => {
    const moods = (T && T.moods) || [];
    ((T && T.topics) || []).concat(moods).forEach((tp) => {
      if (!tp || !tp.id) return;
      const w = tp.when || {};
      const extra = [];
      const gate = w.quest && quests.find((q) => q.id === w.quest);
      if (gate) extra.push(...questPlaces(gate));
      if (w.note && noteLoc[w.note]) extra.push(noteLoc[w.note]);
      const dogHome = w.dog === true || (!!gate && (gate === dogQ || dogDone(gate)));
      // the title may name what its text may (its facts' places and people), though it carries no facts itself
      extra.push(...placesIn(factsList(tp.facts).join(" ")));
      const peopleFrom = [tp.facts].concat(gate ? ["brief", "tag", "journal", "done", "after"].map((k) => gate[k]) : []);
      add({ sec: "talk", id: tp.id, sub: "title", path: ["talk", tp.id, "title"], title: true, who, extra, peopleFrom });
      add({ sec: "talk", id: tp.id, sub: "text", path: ["talk", tp.id, "text"], facts: tp.facts, range: "lot", vars: ["dog"], speaker: crewName(who), who, extra, peopleFrom, dogHome });
    });
  });
  Object.entries(W.CREW_TIPS || {}).forEach(([who, tips]) => {
    Object.entries(tips || {}).forEach(([tip, def]) => add({ sec: "tips", id: who + "." + tip, path: ["tips", who, tip], facts: def && def.facts, range: "tag", vars: CREW_TIP_VARS[tip] || [], noRule: !CREW_TIP_VARS[tip], speaker: crewName(who), who }));
  });
  Object.entries(W.CREW_REPORTS || {}).forEach(([key, def]) => add({ sec: "reports", id: key, path: ["reports", key], facts: def && def.facts, range: "tag", vars: CREW_REPORT_VARS[key] || [], noRule: !CREW_REPORT_VARS[key] }));
  quests.forEach((q) => {
    const extra = questPlaces(q).concat(placesIn(["brief", "tag", "journal", "done", "after"].map((k) => factsList(q[k]).join(" ")).join(" ")));
    const isDog = q.kind === "dog";
    // people, like places: this quest's texts and the giver's quests before it
    const subs = ["brief", "tag", "journal", "done", "after"];
    const peopleFrom = byGiver(q.giver).slice(0, byGiver(q.giver).indexOf(q) + 1).flatMap((x) => subs.map((k) => x[k]));
    const home = { done: isDog || dogDone(q), after: isDog || dogDone(q), brief: dogDone(q) };
    const ranges = { brief: "day", tag: "tag", journal: "tag", done: "lot", after: "lot" };
    ["title", "brief"].concat(isDog ? [] : ["tag"], ["journal", "done", "after"]).forEach((sub) => {
      const s = { sec: "quests", id: q.id, sub, path: ["quests", q.id, sub], who: q.giver, quest: q, extra, peopleFrom };
      if (sub === "title") return add(Object.assign(s, { title: true }));
      const vars = (CREW_QUEST_VARS[sub] || []).concat(CREW_DOG_SUBS.includes(sub) ? ["dog"] : []);
      add(Object.assign(s, { facts: q[sub], range: ranges[sub], vars, speaker: ["brief", "done", "after"].includes(sub) ? crewName(q.giver) : null, dogHome: !!home[sub] }));
    });
  });
  Object.entries(W.ERRANDS || {}).forEach(([who, list]) => {
    (list || []).filter((e) => e && e.id).forEach((e) => {
      const base = { sec: "errands", id: e.id, who, errand: e, peopleFrom: [e.facts, e.done] };
      add(Object.assign({ sub: "title", path: ["errands", e.id, "title"], title: true }, base));
      add(Object.assign({ sub: "brief", path: ["errands", e.id, "brief"], facts: e.facts, range: "tag", vars: CREW_ERRAND_VARS, speaker: crewName(who) }, base));
      add(Object.assign({ sub: "done", path: ["errands", e.id, "done"], facts: e.done, range: "tag", vars: CREW_ERRAND_VARS, speaker: crewName(who) }, base));
    });
  });
  if (W.DOG && W.DOG.facts) {
    // the dog's card comes after its quest: the dog quest's place and the giver's earlier ones are known by then
    const extra = dogQ ? questPlaces(dogQ) : [];
    const peopleFrom = Object.values(W.DOG.facts).concat(dogQ ? ["brief", "journal", "done", "after"].map((k) => dogQ[k]) : []);
    Object.entries(W.DOG.facts).forEach(([key, facts]) => {
      // the ask comes before the dog has a name; a line whose facts say {dog} comes after
      const named = factsList(facts).join(" ").includes("{dog}");
      add({ sec: "dog", id: key, path: ["dog", key], facts, range: "tag", vars: named ? ["dog"] : [], extra, peopleFrom, dogHome: true, named });
    });
  }
  return out;
}

const getPath = (o, p) => p.reduce((v, k) => (v && typeof v === "object" ? v[k] : undefined), o);

/** Pronouns: Pip is "they" at every level and the dog is "it" (docs/CREW.md; CREW[id].pronoun "they"). June
    "she" and Tomas "he" are not checked: their he and she words are natural and rarely wrong.
    - A he or she word after the name, in a sentence that names a "they" crew member and no other person: an error
      (it can only be them, or the dog). An unnamed man or woman in that sentence would be a false alarm: name them,
      or put them in a sentence of their own.
    - In the crew's own words (`follow`), a he or she word in a sentence that names nobody, right after a sentence
      whose only person is them: a warning.
    How it works, the controls and every text checkText sees (the journal, the radio, the notes) get the first rule. */
function checkPronouns(sctx, text, follow) {
  const they = Object.values(crewOf()).filter((c) => c && c.name && c.pronoun === "they");
  if (!they.length) return;
  const people = [...new Set(PEOPLE.concat(crewNames()))];
  const re = new RegExp("\\b(" + GENDERED_WORDS.join("|") + ")\\b", "i");
  let prev = null; // the one person the sentence before names, if it names exactly one
  sentences(text).forEach((sen) => {
    const named = people.filter((p) => nameRe(p).test(sen));
    const honor = HONORIFIC.test(sen);
    they.forEach((c) => {
      const say = (m, hard) => (hard ? err : warn)(sctx, `"${sen.slice(0, 70)}": ${c.name} is "they" at every level, and the dog is "it" (found "${m}")`);
      if (named.length === 1 && named[0] === c.name && !honor) {
        const m = sen.slice(sen.search(nameRe(c.name))).match(re);
        if (m) say(m[0], true);
      } else if (follow && !named.length && !honor && prev === c.name) {
        const m = sen.match(re);
        if (m) say(m[0], false);
      }
    });
    if (named.length || honor) prev = named.length === 1 && !honor ? named[0] : null;
  });
}

/** One written crew text against its slot. */
function checkCrewSlot(ctx, spec, s, v) {
  const sctx = `${ctx} crew.${s.path.join(".")}`;
  const W = WORLD;
  const placeNames = W.LOCATIONS.filter((l) => l.id !== "base");
  const stashes = W.LOCATIONS.map((l) => String(l.stashName || "").toLowerCase().replace(/^the\s+/, "")).filter(Boolean);
  // what every crew text holds to: places the player knows, no stash, no gore, the cabin as it is now
  const common = (text) => {
    placeNames.forEach((l) => { if (!s.places.has(l.id) && text.includes(l.name)) err(sctx, `names ${l.name}, which the player may not know yet (crew words name only the places their facts name and places already known)`); });
    stashes.forEach((st) => { if (text.toLowerCase().includes(st)) err(sctx, `names "${st}", a stash: the crew never tie a key to a stash or send you to one`); });
    if (CREW_GORE.test(text)) err(sctx, `"${text.match(CREW_GORE)[0]}": no gore (teen audience; the crew are hurt off-screen)`);
    else if (CREW_GRIM.test(text)) warn(sctx, `"${text.match(CREW_GRIM)[0]}": check it (nobody dies, nothing is shown, the dog is never hurt)`);
    CABIN_BANNED.forEach(([re, what]) => { if (re.test(text)) err(sctx, what); });
    // braces the game will not fill show as they are ("{ dog }", "{{dog}}", "{dog"): only {name} is a placeholder
    const stray = text.replace(/\{\w+\}/g, "").match(/[{}]/);
    if (stray) err(sctx, `a stray "${stray[0]}": the game fills only {name} placeholders, written exactly as the facts write them, and shows any other brace as it is`);
    if (/\b(undefined|NaN)\b|\[object Object\]/.test(text)) err(sctx, `"${text.match(/\b(undefined|NaN)\b|\[object Object\]/)[0]}" in the words: a generated text went wrong`);
    // people: those its facts name, the crew and the cabin's wall notes (the journal rule: nobody the player may not
    // have heard of yet; a person out in town comes up no earlier than the facts bring them up)
    peopleIn(text).filter((p) => !s.people.has(p)).forEach((p) => warn(sctx, `names ${p}, whom its facts do not name: the player may not have heard of ${p} yet when this shows (crew words name the people their facts name, the crew, and the people of the cabin's wall notes)`));
  };
  if (s.title) {
    const wc = words(v).length;
    const range = s.sec === "quests" ? QUEST_TITLE_WORDS : CREW_TITLE_WORDS;
    if (wc < range[0] || wc > range[1]) warn(sctx, `title is ${wc} word(s), keep it to ${range[0]} to ${range[1]}`);
    if (/\{\w+\}/.test(v)) err(sctx, "a title is shown as written: no placeholders");
    if (s.sec !== "talk" && /[.!?:]["”']?\s*$/.test(v)) err(sctx, `"${v}": a title is a name, not a sentence, so no end mark (it runs inside other lines: "give ${crewName(s.who)} the ...")`);
    if (s.quest && s.quest.kind !== "dog") {
      // the game says "the" + the title in running text, lowercasing its first letter unless the first word is a
      // possessive (js/crew.js inText): "the bag of sunflower seeds", "Rosa's jar of beans"
      const art = v.match(/^\s*(the|a|an)\s/i);
      if (art) err(sctx, `"${v}" starts with "${art[1]}": the game puts "the" before a quest title in running text ("give ${crewName(s.who)} the bag of sunflower seeds")`);
      const raw = v.trim().split(/\s+/)[0] || "";
      if (/^\S+[’‘`´]s$/.test(raw)) warn(sctx, `"${v}": write the possessive with a straight apostrophe (${raw.replace(/[’‘`´]/, "'")}), or the game lowercases it in running text`);
      const first = raw.replace(/[^\w'-]/g, "");
      // a name (a person, or a whole place name) or a word in capitals would lose its capital
      const name = PEOPLE.concat(crewNames()).find((p) => p === first) || (placeNames.find((l) => v.trim().startsWith(l.name + " ") || v.trim() === l.name) || {}).name || (/^[A-Z0-9-]*[A-Z][A-Z0-9-]+$/.test(first) ? first : "");
      if (name && !/^\S+'s\b/.test(v.trim())) warn(sctx, `"${v}" starts with "${name}": in running text it reads "the ${v.trim().charAt(0).toLowerCase() + v.trim().slice(1)}" (start with the object: "Seed box from ...", or with a possessive: "Rosa's ...")`);
    }
    if (/Shambler|poof/i.test(v)) err(sctx, "old-world term");
    common(v);
    return;
  }
  const briefAt = s.sub === "brief" && s.quest ? W.LOCATIONS.find((l) => l.id === s.quest.at) : null;
  checkText(sctx, v, spec, 1, factsList(s.facts), spec[s.range], { vars: s.vars, skip: [s.speaker, briefAt && briefAt.name].filter(Boolean) });
  if (s.noRule) err(sctx, `the engine has no placeholder rule for this ${s.sec === "tips" ? "tip" : "report"} (tests/validate-crew.js)`);
  // a crew tip or report keeps to its level's longest sentence exactly (the table above; elsewhere a warning past +3)
  if (s.sec === "tips" || s.sec === "reports") {
    const longest = sentences(v).reduce((m, x) => Math.max(m, words(x).length), 0);
    if (longest > spec.sentence) err(sctx, `longest sentence ${longest} words, max ${spec.sentence} at this level (a crew tip or report keeps to it)`);
  }
  const text = String(v);
  common(text);
  if (s.speaker && !nameRe(s.speaker).test(text)) err(sctx, `must name its speaker, ${s.speaker} (say who is talking: the bubble and the card show several texts in a row)`);
  if (!/[.!?]["”')]?\s*$/.test(text)) warn(sctx, "does not end with . ! or ? (write whole sentences)");
  // {dog}: "the dog" until it is named, and a mood or an early line may come before it is even home
  if (text.includes("{dog}")) {
    if (!s.dogHome && s.vars.includes("dog")) warn(sctx, `uses {dog}, but the dog may not be home when this shows (it reads "the dog" then)`);
    if (!s.named && sentences(text).some((sen) => /^["“']?\{dog\}/.test(sen))) warn(sctx, 'starts a sentence with {dog}, which reads "the dog" (no capital) until the dog has a name');
  }
  if (s.sec === "errands" && /\{count\}\s+\{item\}/.test(text)) warn(sctx, '"{count} {item}" reads "2 Box of nails": give {item} as a label, as the facts do ("2 of these: Box of nails")');
  if (s.sec === "quests" && s.sub === "brief") {
    const q = s.quest;
    const loc = W.LOCATIONS.find((l) => l.id === q.at);
    const low = text.toLowerCase();
    if (loc && !text.includes(loc.name)) err(sctx, `must name the place, ${loc.name}`);
    const near = String(q.near || "").toLowerCase().replace(/^the\s+/, "");
    if (near && !low.includes(near)) err(sctx, `must name the landmark word for word: "${near}" (${q.near})`);
    // the sign as it is painted, in capitals, like every note's "under the PHARMACY sign": "parts" in "engine parts"
    // does not send anyone to the PARTS room
    if (q.room && !text.includes(q.room)) err(sctx, `must name the ${q.room} sign as it is painted, in capitals: ${q.room}`);
    const dirs = [...new Set((factsList(q.brief).join(" ").match(DIRS) || []).map((m) => m.split(" ")[0].toLowerCase()))];
    if (dirs.length && !dirs.some((d) => new RegExp("\\b" + d + "\\b", "i").test(text))) err(sctx, `must say which way ${loc ? loc.name : q.at} is: ${dirs.join(" or ")} of the cabin`);
    (text.match(DIRS) || []).map((m) => m.split(" ")[0].toLowerCase()).filter((d) => dirs.length && !dirs.includes(d)).forEach((d) => err(sctx, `says ${d} of the cabin; ${loc ? loc.name : q.at} is ${dirs.join(" or ")}`));
    // the reward, promised as the facts promise it (tests/validate-world.js): "<n> scrap", "<n> ... <the item's noun>"
    // ("1 seed packet", "2 bags of soil", "one medical kit"), so the words agree with the card's "Reward:" line
    const rw = q.reward || {};
    const num = (n) => `(?:${n}${NUM_WORDS[n] ? "|" + NUM_WORDS[n] : ""})`;
    const promises = (n, word) => new RegExp(`\\b${num(n)} (?:[a-z-]+ ){0,3}${escRe(word)}`, "i").test(text);
    const noun = (name) => String(name || "").toLowerCase().trim().split(/\s+/).pop().replace(/s$/, "");
    if (rw.scrap && !new RegExp(`\\b${num(rw.scrap)} scrap\\b`, "i").test(text)) err(sctx, `must promise the reward: ${rw.scrap} scrap`);
    Object.entries(rw.items || {}).forEach(([it, c]) => { const w = noun((W.ITEMS[it] || {}).name); if (c && w && !promises(c, w)) err(sctx, `must promise the reward: ${c} ${W.ITEMS[it].name} ("${c} ... ${w}")`); });
    if (rw.kits && !promises(rw.kits, "kit")) err(sctx, `must promise the reward: ${rw.kits} medical kit${rw.kits === 1 ? "" : "s"}`);
    if (rw.crowbars && !promises(rw.crowbars, "crowbar")) err(sctx, `must promise the reward: ${rw.crowbars} crowbar${rw.crowbars === 1 ? "" : "s"}`);
    Object.entries(rw.traps || {}).forEach(([k, c]) => { const w = noun(((W.TRAPS || {})[k] || {}).name); if (c && w && !promises(c, w)) err(sctx, `must promise the reward: ${c} ${W.TRAPS[k].name} ("${c} ... ${w}")`); });
    if (q.kind === "dog" && !/\btreats?\b/i.test(text)) err(sctx, "must say the giver's treats bring the dog along (hold one out with E)");
    if (/\b(left|right) of\b/i.test(text)) err(sctx, 'steers by "left of" or "right of"; inside, use the landmark, a room or a sign');
    checkStreets(sctx, text, "base", [q.at]);
  }
}

/** The rules must be fair: each crew text's facts, read as words, pass every rule above that is an error (the
    lengths aside). A failure here is a fact the writers cannot carry, or a rule that asks too much. */
function checkCrewFactsFair() {
  const e0 = errors.length;
  const w0 = warnings.length;
  const spec = LEVELS[Math.max(...Object.keys(LEVELS).map(Number))];
  crewSlots().filter((s) => !s.title).forEach((s) => checkCrewSlot("facts", spec, s, factsList(s.facts).join(" ")));
  const found = errors.splice(e0);
  warnings.splice(w0);
  found.forEach((e) => err("crew facts", e.replace(/^facts crew\./, "") + " (the facts themselves break this rule for the words: fix the facts or the rule)"));
}

/** Has this level's T.crew any words at all (written under any key)? */
const crewWordsIn = (C) => (C && typeof C === "object" ? readingWords(C) : 0);

/** How this level's crew words are held: "strict" (every text required), "present" (only what is written), "off"
    (no words yet: one warning), or "none" (no crew facts). */
function crewModeFor(t) {
  if (!hasCrewFacts()) return "none";
  if (CREW_MODE !== "auto") return CREW_MODE;
  return crewWordsIn(t.crew) > 0 ? "strict" : "off";
}

/** T.crew: ids both ways, every written text against its facts, and what is missing (an error in strict mode). */
function checkCrew(ctx, n, t, spec, mode) {
  if (mode === "none") return null;
  const C = t.crew;
  const cctx = `${ctx} crew`;
  if (!C || typeof C !== "object") {
    err(cctx, `T.crew missing: js/content/level${n}-crew.js must set it (docs/TEXT_GUIDE.md "The crew's words")`);
    return null;
  }
  const slots = crewSlots();
  const written = slots.filter((s) => isStr(getPath(C, s.path)));
  const stats = { total: slots.length, written: written.length, words: crewWordsIn(C) };
  if (mode === "off") {
    const by = {};
    slots.forEach((s) => (by[s.sec] = (by[s.sec] || 0) + 1));
    warn(cctx, `no words yet (js/content/level${n}-crew.js): ${slots.length} texts to write (${Object.entries(by).map(([k, c]) => c + " " + k).join(", ")}). The list: node tests/validate-text.js ${n} --crew=strict`);
    return stats;
  }
  // ids both ways: every key in T.crew must be a text the facts call for
  const tree = {};
  slots.forEach((s) => s.path.reduce((node, k, i) => (node[k] = i === s.path.length - 1 ? true : node[k] || {}), tree));
  const dogQ = (WORLD.QUESTS || []).find((q) => q && q.kind === "dog");
  (function walk(obj, node, at) {
    Object.keys(obj).forEach((k) => {
      const here = at.concat(k);
      const where = `${ctx} crew.${here.join(".")}`;
      const v = obj[k];
      if (!(k in node)) {
        if (dogQ && here.join(".") === `quests.${dogQ.id}.tag`) return err(where, "the dog quest has no tag (the dog is not an object you pick up)");
        return err(where, `unknown ${at.length ? "key" : "section"}: not a text the crew facts call for${at.length ? "" : " (talk, tips, reports, quests, errands, dog)"}`);
      }
      if (node[k] === true) {
        if (v != null && typeof v !== "string") err(where, "must be a string");
      } else if (v == null || typeof v !== "object" || Array.isArray(v)) err(where, "must be an object of texts");
      else walk(v, node[k], here);
    });
  })(C, tree, []);
  written.forEach((s) => checkCrewSlot(ctx, spec, s, getPath(C, s.path)));
  // what is missing, one line per section: the to-do list for a level
  const missing = {};
  slots.filter((s) => !isStr(getPath(C, s.path))).forEach((s) => {
    const sec = (missing[s.sec] = missing[s.sec] || {});
    const key = s.sub && s.sec !== "tips" ? s.id : s.path.slice(1).join(".");
    (sec[key] = sec[key] || []).push(s.sub || "");
  });
  Object.entries(missing).forEach(([sec, ids]) => {
    const all = slots.filter((s) => s.sec === sec);
    const items = Object.entries(ids).map(([id, subs]) => {
      const total = all.filter((s) => (s.sub && s.sec !== "tips" ? s.id : s.path.slice(1).join(".")) === id).length;
      return subs.filter(Boolean).length && subs.length < total ? `${id} (${subs.join(", ")})` : id;
    });
    const count = Object.values(ids).reduce((m, x) => m + x.length, 0);
    (mode === "strict" ? err : warn)(`${cctx}.${sec}`, `missing ${count} of ${all.length} texts: ${items.join(", ")}`);
  });
  return stats;
}

/* How it works and the controls, once a level has its crew words (they are written with them): the crew by name,
   talking, the favors they ask and trust stars. The fence fixer and the shelter are taught in the crew's own words.
   Each test takes the howto paragraphs (or controls lines). */
const namesCrew = (p) => crewNames().concat("crew").some((nm) => nameRe(nm).test(p));
const crewPara = (re) => (P) => P.some((p) => namesCrew(p) && re.test(p));
function howtoCrewMust() {
  return [
    [(P) => crewNames().every((nm) => P.some((p) => nameRe(nm).test(p))), `the crew by name (${crewNames().join(", ")})`],
    [crewPara(/\btalk/i), "talking to the crew (walk up to one; the yard keeps running)"],
    [crewPara(/\b(favou?rs?|quests?|errands?|requests?)\b/i), "the favors the crew ask (bring what they need home from town)"],
    [crewPara(/\bstars?\b/i), "the crew's trust stars (talks and favors earn them)"],
  ];
}
const CONTROLS_CREW_MUST = [[(L) => L.some((l) => /\bE\b/.test(l) && /\btalk/i.test(l)), "that E talks to the crew (on the E line)"]];

/* June's first-run tutorial (js/tutorial.js, js/content/level1-tutorial.js): ONE level-1 text for every reader (owner
   decision 2026-10-14, DESIGN.md). Errors here, not warnings: whole sentences of at most LEVELS[1].sentence words that
   end in . or !, no questions, no digits (counts go stale as the game grows), only the placeholders the engine fills,
   no place or stash names (a card never reveals a place), no lock answers, the crew text rules (Pip is "they"), and
   every key a card pictures named in its words as a capital. Every key the engine shows must exist, and no other. */
function checkTutorial(ctx, n, t) {
  if (!TUTORIAL || !TUTORIAL.CARDS) return err(`${ctx} tutorial`, "js/tutorial.js did not define ZSR.Tutorial.CARDS");
  if (n !== TUTORIAL.TEXT_LEVEL) {
    if (t.tutorial) err(ctx, `tutorial: written once, at level ${TUTORIAL.TEXT_LEVEL}, for every reader; remove T.tutorial here`);
    return;
  }
  const T = t.tutorial;
  if (!T || typeof T !== "object") return err(ctx, `tutorial missing (js/content/level${n}-tutorial.js)`);
  if (!(WORLD.CREW || {})[TUTORIAL.SPEAKER]) err(`${ctx} tutorial`, `the speaker "${TUTORIAL.SPEAKER}" is not in CREW`);
  const items = TUTORIAL.YARD_STEPS.map((id) => String((T[id] || {}).item || ""));
  const longest = items.reduce((a, b) => (words(b).length > words(a).length ? b : a), "");
  const sample = { next: longest.charAt(0).toLowerCase() + longest.slice(1) }; // filled with its longest real value
  const places = WORLD.LOCATIONS.filter((l) => l.id !== "base").map((l) => l.name);
  const stashes = WORLD.LOCATIONS.map((l) => String(l.stashName || "").toLowerCase().replace(/^the\s+/, "")).filter(Boolean);
  const keys = TUTORIAL.textKeys();
  keys.forEach(({ key, kind, tokens, caps }) => {
    const c = `${ctx} tutorial.${key}`;
    const v = getPath(T, key.split("."));
    if (!isStr(v, 2)) return err(c, "missing");
    if (/\?/.test(v)) err(c, "asks a question (none anywhere)");
    if (/\d/.test(v)) err(c, "has a digit: name no counts or keys that come from data");
    (v.match(/\{(\w+)\}/g) || []).forEach((ph) => { if (!tokens.includes(ph.slice(1, -1))) err(c, `${ph} is not filled here${PLACEHOLDERS.includes(ph.slice(1, -1)) ? " (a lock answer: never)" : ""}`); });
    tokens.forEach((k) => { if (!v.includes("{" + k + "}")) err(c, `{${k}} missing`); });
    if (v.replace(/\{\w+\}/g, "").match(/[{}\[\]<>]/)) err(c, "a stray bracket (the game shows it as it is)");
    places.forEach((nm) => { if (v.includes(nm)) err(c, `names ${nm} (a tutorial card never names a place)`); });
    stashes.forEach((st) => { if (v.toLowerCase().includes(st)) err(c, `names "${st}", a stash`); });
    if (/Shambler|poof/i.test(v)) err(c, "old-world term");
    if (CREW_GORE.test(v)) err(c, `"${v.match(CREW_GORE)[0]}": no gore (teen audience)`);
    CABIN_BANNED.forEach(([re, what]) => { if (re.test(v)) err(c, what); });
    if (HOWTO_BANNED.test(v)) err(c, "says the fence is patched (a hole stays until it is fixed)");
    checkPronouns(c, v, true);
    caps.forEach((k) => { if (!new RegExp("\\b" + k + "\\b").test(v)) err(c, `must name the key ${k} (the card pictures it)`); });
    const filled = v.replace(/\{(\w+)\}/g, (m, k) => (sample[k] != null ? sample[k] : m));
    if (kind === "label") {
      const w = words(filled).length;
      if (w < 1 || w > 6) err(c, `a label is 1 to 6 words (${w})`);
      if (/[.!]$/.test(filled.trim())) err(c, "a label has no end mark");
      return;
    }
    sentences(filled).forEach((s) => {
      const w = words(s).length;
      if (w > LEVELS[1].sentence) err(c, `"${s}" is ${w} words; level 1 allows ${LEVELS[1].sentence}`);
      if (w < 2) err(c, `"${s}" is not a whole sentence`);
      if (!/^[A-Z]/.test(s)) err(c, `"${s}" must start with a capital`);
      if (!/[.!]$/.test(s)) err(c, `"${s}" must end with a period or an exclamation mark`);
    });
    if (words(filled).length > TUTORIAL_WARN_WORDS) warn(c, `${words(filled).length} words; keep a card to ${TUTORIAL_WARN_WORDS}`);
  });
  const known = new Set(keys.map((k) => k.key));
  (function each(o, at) {
    Object.entries(o).forEach(([k, v]) => {
      const p = at.concat(k);
      if (v && typeof v === "object") each(v, p);
      else if (!known.has(p.join("."))) err(`${ctx} tutorial.${p.join(".")}`, "not a text the game shows (Tutorial.textKeys)");
    });
  })(T, []);
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
  // teen audience: no profanity in any string of the level, the typing drills included
  (function each(o, at) {
    if (typeof o === "string") {
      const m = o.match(PROFANITY);
      if (m) err(`${ctx} ${at.join(".")}`, `"${m[0]}": no profanity (teen audience)`);
    } else if (o && typeof o === "object") Object.entries(o).forEach(([k, v]) => each(v, at.concat(k)));
  })(t, []);
  // the crew's words, and the crew in How it works and the controls: required once this level has crew words
  const crewMode = crewModeFor(t);
  const crewNeed = crewMode === "strict" ? err : crewMode === "present" ? warn : null;
  if (!Array.isArray(t.howto) || t.howto.length < HOWTO_PARAGRAPHS[0]) err(ctx, `howto needs ${HOWTO_PARAGRAPHS[0]}+ paragraphs`);
  else {
    if (t.howto.length > HOWTO_PARAGRAPHS[1]) warn(ctx, `howto has ${t.howto.length} paragraphs, keep it to ${HOWTO_PARAGRAPHS[0]} to ${HOWTO_PARAGRAPHS[1]}`);
    t.howto.forEach((p, i) => {
      if (!isStr(p, 20)) err(`${ctx} howto[${i}]`, "empty");
      const longest = longestSentence(p);
      if (longest > spec.sentence + 3) warn(`${ctx} howto[${i}]`, `longest sentence ${longest}, max ${spec.sentence}`);
    });
    const all = t.howto.join(" ");
    t.howto.forEach((p, i) => checkPronouns(`${ctx} howto[${i}]`, String(p), false));
    if (HOWTO_BANNED.test(all)) err(ctx, `howto says the fence is patched (${(all.match(HOWTO_BANNED) || [""])[0].slice(0, 60)}...): holes stay until fixed, by you or by the crew in the calm, and each fix costs ${WORLD.SETTINGS.fenceRepairScrap} scrap`);
    HOWTO_MUST.forEach(([re, what]) => { if (!re.test(all)) err(ctx, `howto must mention ${what}`); });
    CABIN_BANNED.forEach(([re, what]) => { if (re.test(all)) err(ctx, `howto ${what}`); });
    if (crewNeed) howtoCrewMust().forEach(([test, what]) => { if (!test(t.howto.map(String))) crewNeed(ctx, `howto must mention ${what}`); });
  }
  // controls: the key list under How it works, at this level too
  if (!Array.isArray(t.controls) || t.controls.length < 5) err(ctx, "controls needs 5+ lines (Road, Inside and in the yard, E, Traps, Backpack, Workbench, Map)");
  else {
    t.controls.forEach((c, i) => {
      if (!isStr(c, 10)) err(`${ctx} controls[${i}]`, "empty");
      else if (!/^[^:]{2,40}:\s*\S/.test(c)) err(`${ctx} controls[${i}]`, 'must read "Head: text"');
    });
    const allC = t.controls.join(" ");
    t.controls.forEach((c, i) => checkPronouns(`${ctx} controls[${i}]`, String(c), false));
    CONTROLS_MUST.forEach(([re, what]) => { if (!re.test(allC)) err(ctx, `controls must mention ${what}`); });
    if (crewNeed) CONTROLS_CREW_MUST.forEach(([test, what]) => { if (!test(t.controls.map(String))) crewNeed(ctx, `controls must mention ${what}`); });
    CABIN_BANNED.forEach(([re, what]) => { if (re.test(allC)) err(ctx, `controls ${what}`); });
    if (!hasNumber(WORLD.SETTINGS.fenceRepairScrap, allC)) warn(ctx, "controls: the fence repair cost is not given");
    // E fixes a wrecked build too (js/yardwreck.js): said in one sentence with its cost
    if (!allC.split(/[.!?]/).some((s) => /\bwrecked\b/i.test(s) && hasNumber(WORLD.SETTINGS.buildRepairScrap, s))) warn(ctx, `controls: fixing a wrecked build (${WORLD.SETTINGS.buildRepairScrap} scrap) is not given`);
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
      // the main note warns what each mistake costs (WORLD.LOCKS)
      const LK = (WORLD.LOCKS || {})[loc.id];
      if (note.unlocks && LK) {
        const fails = [LK.panel ? "alarm" : null, LK.search ? LK.search.fail : null, LK.door.kind !== "found" ? LK.door.fail : null].filter(Boolean);
        fails.forEach((f) => { if (!FAIL_WORDS[f].test(T.text || "")) err(`${lctx} ${note.id}`, `must warn what a mistake costs here (${f})`); });
        if (LK.door.kind === "code" && !/\{code\}/.test(T.text || "")) err(`${lctx} ${note.id}`, "must give the code as {code}");
      }
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
      const sf = ((WORLD.LOCKS || {})[target.id] || {}).stashFail;
      const SF = { jam: /\b(jam|jams|jammed|crowbar)\b/i, break: /\b(snap|snaps|break|breaks|broke)\b/i, none: /\b(turn|turns|nothing)\b/i };
      if (kn && sf && !SF[sf].test(kn.text || "")) err(`${lctx} ${N.key.after}`, `must warn what a wrong key does in ${target.stashName} (${sf})`);
      const K = L.key;
      const kctx = `${lctx} key`;
      if (!K || !isStr(K.name)) err(kctx, "name missing (2 to 6 words: what the key looks like)");
      else if (words(K.name).length > 7) warn(kctx, "name is long");
      if (!K || !isStr(K.tag)) err(kctx, "tag missing (what its tag says)");
      else checkText(kctx, K.tag, spec, 1, N.key.facts, spec.tag);
      // a key says how it looks, never what it opens: that is in the note
      [K && K.name, K && K.tag].forEach((x) => { if (x && (x.toLowerCase().includes(bare) || x.includes(target.name))) err(kctx, `names what it opens ("${target.stashName}" at ${target.name}); only the note may say that`); });
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
  checkUniverses(ctx, t, Object.assign({ n }, spec));
  checkTutorial(ctx, n, t);
  const crew = checkCrew(ctx, n, t, spec, crewMode);
  if (crew) console.log(`level ${n}: crew ${crew.written} of ${crew.total} texts written, ${crew.words} words (${crewMode === "off" ? "not checked until they are written" : crewMode})`);
  // T.crew counts here like every other in-world text (readingWords skips only the typing drills)
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

const asked = ARGS.filter((a) => /^\d+$/.test(a)).map(Number);
const only = asked.length ? asked : Object.keys(LEVELS).map(Number);
if (!STREETS) err("js/streets.js", "did not define ZSR.Streets");
if (hasCrewFacts()) {
  checkCrewTables();
  checkCrewFactsFair();
}
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
