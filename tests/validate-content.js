#!/usr/bin/env node
/* Validates js/content/grade*.js against docs/CONTENT_GUIDE.md.
   Usage: node tests/validate-content.js            (all grades)
          node tests/validate-content.js 3          (one grade)
   Exit code 1 on any error. Warnings do not fail the run. */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "js", "content");

const GRADE_SPEC = {
  1: { words: [35, 55], sentence: 7, options: 3 },
  2: { words: [60, 90], sentence: 10, options: 3 },
  3: { words: [100, 140], sentence: 14, options: 4 },
  4: { words: [140, 180], sentence: 18, options: 4 },
  5: { words: [180, 230], sentence: 22, options: 4 },
  6: { words: [230, 280], sentence: 26, options: 4 },
};
const MIN_HAVENS = 8;
const MIN_SIGNS = 8;
const EFFECTS = {
  zombies: { type: "number", min: 0.6, max: 1.6 },
  runners: { type: "number", min: 0.5, max: 2.0 },
  brutes: { type: "number", min: 0.5, max: 2.0 },
  length: { type: "number", min: 0.7, max: 1.3 },
  scrap: { type: "integer", min: -30, max: 60 },
  hp: { type: "integer", min: -25, max: 30 },
  fog: { type: "boolean" },
  night: { type: "boolean" },
  crates: { type: "integer", min: 0, max: 4 },
};
const KINDS = ["note", "letter", "log", "map", "diary", "recipe", "poster", "rules", "story", "sign", "list", "manual", "warning"];
const QTYPES = ["detail", "inference", "vocab"];

const errors = [];
const warnings = [];
const err = (ctx, msg) => errors.push(`${ctx}: ${msg}`);
const warn = (ctx, msg) => warnings.push(`${ctx}: ${msg}`);

function words(s) {
  return s.trim().split(/\s+/).filter(Boolean);
}
function sentences(s) {
  return s
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?]["”']?)\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}
function isStr(v, min = 1) {
  return typeof v === "string" && v.trim().length >= min;
}

function loadGrade(g) {
  const file = path.join(CONTENT_DIR, `grade${g}.js`);
  if (!fs.existsSync(file)) {
    err(`grade${g}`, `missing file ${path.relative(ROOT, file)}`);
    return null;
  }
  const sandbox = {};
  sandbox.globalThis = sandbox;
  try {
    vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  } catch (e) {
    err(`grade${g}`, `failed to execute: ${e.message}`);
    return null;
  }
  const content = sandbox.ZSR && sandbox.ZSR.CONTENT && sandbox.ZSR.CONTENT[g];
  if (!content) {
    err(`grade${g}`, `file did not define ZSR.CONTENT[${g}]`);
    return null;
  }
  return content;
}

function checkQuestion(ctx, q, spec, passageText) {
  if (!isStr(q.q)) err(ctx, "question text missing");
  if (!QTYPES.includes(q.type)) err(ctx, `type must be one of ${QTYPES.join("|")}, got ${q.type}`);
  if (!Array.isArray(q.options)) return err(ctx, "options must be an array");
  if (q.options.length !== spec.options) err(ctx, `expected ${spec.options} options, got ${q.options.length}`);
  q.options.forEach((o, i) => {
    if (!isStr(o)) err(ctx, `option ${i} is empty`);
    else if (words(o).length > 8) warn(ctx, `option ${i} is long (${words(o).length} words): "${o}"`);
  });
  const lower = q.options.map((o) => String(o).trim().toLowerCase());
  if (new Set(lower).size !== lower.length) err(ctx, "duplicate options");
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) err(ctx, `answer index ${q.answer} out of range`);
  if (!isStr(q.hint)) err(ctx, "hint missing");
  if (q.type === "vocab") {
    if (!isStr(q.word)) err(ctx, "vocab question needs a word");
    else if (!new RegExp(`\\b${q.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(passageText)) {
      err(ctx, `vocab word "${q.word}" does not appear in the passage`);
    }
  }
}

function checkEffects(ctx, effects) {
  if (effects == null) return;
  if (typeof effects !== "object") return err(ctx, "effects must be an object");
  for (const [k, v] of Object.entries(effects)) {
    const rule = EFFECTS[k];
    if (!rule) {
      err(ctx, `unknown effect "${k}"`);
      continue;
    }
    if (rule.type === "boolean") {
      if (typeof v !== "boolean") err(ctx, `effect ${k} must be boolean`);
    } else if (typeof v !== "number" || Number.isNaN(v)) {
      err(ctx, `effect ${k} must be a number`);
    } else {
      if (rule.type === "integer" && !Number.isInteger(v)) err(ctx, `effect ${k} must be an integer`);
      if (v < rule.min || v > rule.max) err(ctx, `effect ${k}=${v} outside ${rule.min}..${rule.max}`);
    }
  }
}

function checkHaven(g, h, i, spec, seenIds, seenPlaces) {
  const ctx = `grade${g} haven[${i}]${h && h.id ? " " + h.id : ""}`;
  if (!h || typeof h !== "object") return err(ctx, "not an object");
  if (!isStr(h.id)) err(ctx, "id missing");
  else {
    if (!h.id.startsWith(`g${g}-`)) err(ctx, `id should start with "g${g}-"`);
    if (seenIds.has(h.id)) err(ctx, `duplicate id ${h.id}`);
    seenIds.add(h.id);
  }
  if (!isStr(h.place)) err(ctx, "place missing");
  else {
    if (seenPlaces.has(h.place)) warn(ctx, `place "${h.place}" used more than once in this grade`);
    seenPlaces.add(h.place);
  }
  if (!isStr(h.host)) err(ctx, "host missing");
  if (!isStr(h.intro)) err(ctx, "intro missing");
  if (!KINDS.includes(h.kind)) err(ctx, `kind must be one of ${KINDS.join("|")}, got ${h.kind}`);
  if (!isStr(h.title)) err(ctx, "title missing");
  if (!isStr(h.text, 20)) err(ctx, "text missing or too short");
  else {
    const wc = words(h.text).length;
    if (wc < spec.words[0] || wc > spec.words[1]) {
      warn(ctx, `passage is ${wc} words, target ${spec.words[0]}..${spec.words[1]}`);
    }
    const longest = sentences(h.text).reduce((m, s) => Math.max(m, words(s).length), 0);
    if (longest > spec.sentence + 4) warn(ctx, `longest sentence is ${longest} words, target max ${spec.sentence}`);
  }
  if (!Array.isArray(h.questions) || h.questions.length !== 3) err(ctx, "need exactly 3 questions");
  else {
    h.questions.forEach((q, qi) => checkQuestion(`${ctx} q[${qi}]`, q, spec, h.text || ""));
    const types = h.questions.map((q) => q.type);
    if (types.join(",") !== QTYPES.join(",")) warn(ctx, `question types are ${types.join(",")}, guide says ${QTYPES.join(",")}`);
    const answers = h.questions.map((q) => q.answer);
    if (new Set(answers).size === 1) warn(ctx, `all three answers are option ${answers[0]}`);
  }
  if (!h.choice || typeof h.choice !== "object") err(ctx, "choice missing");
  else {
    if (!isStr(h.choice.prompt)) err(`${ctx} choice`, "prompt missing");
    if (!Array.isArray(h.choice.options) || h.choice.options.length < 2 || h.choice.options.length > 3) {
      err(`${ctx} choice`, "need 2 or 3 options");
    } else {
      h.choice.options.forEach((o, oi) => {
        const octx = `${ctx} choice[${oi}]`;
        if (!isStr(o.label)) err(octx, "label missing");
        else if (words(o.label).length > 6) warn(octx, `label is long: "${o.label}"`);
        if (!isStr(o.desc)) err(octx, "desc missing");
        if (!isStr(o.result)) err(octx, "result missing");
        checkEffects(octx, o.effects);
      });
    }
  }
}

function checkSign(g, s, i) {
  const ctx = `grade${g} roadSign[${i}]`;
  if (!s || typeof s !== "object") return err(ctx, "not an object");
  if (!isStr(s.text)) err(ctx, "text missing");
  if (!isStr(s.q)) err(ctx, "question missing");
  if (!Array.isArray(s.options) || s.options.length !== 3) err(ctx, "need exactly 3 options");
  else {
    s.options.forEach((o, oi) => {
      if (!isStr(o)) err(ctx, `option ${oi} empty`);
    });
    const lower = s.options.map((o) => String(o).trim().toLowerCase());
    if (new Set(lower).size !== lower.length) err(ctx, "duplicate options");
    if (!Number.isInteger(s.answer) || s.answer < 0 || s.answer >= s.options.length) err(ctx, `answer index ${s.answer} out of range`);
  }
}

function checkGrade(g) {
  const spec = GRADE_SPEC[g];
  const content = loadGrade(g);
  if (!content) return;
  const ctx = `grade${g}`;
  if (content.grade !== g) err(ctx, `grade field is ${content.grade}, expected ${g}`);
  if (!Array.isArray(content.havens)) err(ctx, "havens must be an array");
  else {
    if (content.havens.length < MIN_HAVENS) err(ctx, `only ${content.havens.length} havens, need at least ${MIN_HAVENS}`);
    const seenIds = new Set();
    const seenPlaces = new Set();
    content.havens.forEach((h, i) => checkHaven(g, h, i, spec, seenIds, seenPlaces));
    const kinds = new Set(content.havens.map((h) => h && h.kind));
    if (kinds.size < 4) warn(ctx, `only ${kinds.size} distinct passage kinds; aim for variety`);
  }
  if (!Array.isArray(content.roadSigns)) err(ctx, "roadSigns must be an array");
  else {
    if (content.roadSigns.length < MIN_SIGNS) err(ctx, `only ${content.roadSigns.length} road signs, need at least ${MIN_SIGNS}`);
    content.roadSigns.forEach((s, i) => checkSign(g, s, i));
  }
  if (!errors.some((e) => e.startsWith(ctx))) {
    const wc = content.havens.reduce((n, h) => n + words(h.text || "").length, 0);
    console.log(`grade ${g}: ${content.havens.length} havens, ${content.roadSigns.length} road signs, ${wc} passage words`);
  }
}

const only = process.argv[2] ? [Number(process.argv[2])] : [1, 2, 3, 4, 5, 6];
only.forEach(checkGrade);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log("  warn  " + w));
}
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.log("  ERROR " + e));
  process.exit(1);
}
console.log(`\nOK: content for grade(s) ${only.join(", ")} is valid.`);
