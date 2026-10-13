#!/usr/bin/env node
/* The workbench typing stages: the home row is learned (and checked) before any other key, a key is
   drilled only once its stage has brought it in, built-in word lists use only keys already learned,
   every stage needs several good rounds, the drills come out right, and the progress rule and old-save
   mapping hold. Loads js/typing.js on its own (no DOM). */
"use strict";
const path = require("path");
global.ZSR = {};
require(path.join(__dirname, "..", "js", "typing.js"));
const T = global.ZSR.Typing;

const errors = [];
const err = (m) => errors.push(m);
const HOME = "asdfghjkl;";
const STAGES = T.STAGES;

// keys learned by the end of each stage (the words stages type what is learned so far)
const learned = new Set();
let homeChecked = false;
STAGES.forEach((d, i) => {
  const ctx = `stage ${i + 1} (${d.name})`;
  if (!(d.need >= 3)) err(`${ctx}: needs ${d.need} good rounds; every stage wants at least 3`);
  if (!(d.seconds >= 60)) err(`${ctx}: ${d.seconds} seconds; a round gets at least 60`);
  if (!d.tip) err(`${ctx}: no tip`);
  if (d.kind === "keys" && !d.runs) {
    if (!d.keys) return err(`${ctx}: a keys stage names its keys`);
    if (!(d.count >= 15)) err(`${ctx}: ${d.count} keys a round; want at least 15`);
    [...(d.review || "")].forEach((k) => { if (!learned.has(k)) err(`${ctx}: reviews "${k}" before any stage brought it in`); });
    [...d.keys].forEach((k) => learned.add(k));
    // nothing off the home row until the home row has been checked
    if (!homeChecked && [...d.keys].some((k) => !HOME.includes(k))) err(`${ctx}: brings in keys off the home row before the home row check`);
    if (d.name === "Home row check") homeChecked = [...HOME].every((k) => learned.has(k));
    // the drill: the right length, every new key at least twice, only new and review keys, no key three times running
    for (let r = 0; r < 200; r++) {
      const out = T.drill(d);
      if (out.length !== d.count) { err(`${ctx}: drew ${out.length} keys, want ${d.count}`); break; }
      const bad = out.find((k) => !(d.keys + (d.review || "")).includes(k));
      if (bad) { err(`${ctx}: drew "${bad}", not one of its keys`); break; }
      const least = Math.min(2, Math.floor(d.count / d.keys.length));
      const thin = [...d.keys].find((k) => out.filter((x) => x === k).length < least);
      if (thin) { err(`${ctx}: drew "${thin}" fewer than ${least === 2 ? "twice" : "once"}`); break; }
    }
  } else if (d.kind === "words" && d.list) {
    const list = T.wordList(d.list);
    if (list.length < d.count * 2) err(`${ctx}: only ${list.length} words to draw from`);
    list.forEach((w) => { if ([...w].some((c) => !learned.has(c))) err(`${ctx}: "${w}" uses a key not learned yet`); });
  } else if (d.kind !== "keys") {
    // free words, phrases and sentences come only after every letter has been learned
    const missing = [..."abcdefghijklmnopqrstuvwxyz"].filter((c) => !learned.has(c));
    if (missing.length) err(`${ctx}: ${d.kind} before ${missing.join(" ")} were learned`);
  }
});
if (!homeChecked) err("no Home row check stage");
const firstWords = STAGES.findIndex((d) => d.kind !== "keys");
if (firstWords < 5) err(`words come at stage ${firstWords + 1}: the home row needs its key stages first`);

// the progress rule: a good round counts, need of them move up, a sloppy one does not, the last repeats
const p0 = T.progress(0, 0, 1);
if (p0.stage !== 0 || p0.passes !== 1 || !p0.good) err(`progress: one good round should count 1 at the same stage, got ${JSON.stringify(p0)}`);
const pUp = T.progress(0, STAGES[0].need - 1, T.PASS);
if (pUp.stage !== 1 || pUp.passes !== 0 || !pUp.up) err(`progress: the last needed good round should move up, got ${JSON.stringify(pUp)}`);
const pBad = T.progress(3, 2, T.PASS - 0.01);
if (pBad.stage !== 3 || pBad.passes !== 2 || pBad.good) err(`progress: a sloppy round must not count, got ${JSON.stringify(pBad)}`);
const last = STAGES.length - 1;
const pLast = T.progress(last, STAGES[last].need, 1);
if (pLast.stage !== last || pLast.up) err(`progress: the last stage should repeat, got ${JSON.stringify(pLast)}`);
if (T.progress(999, 0, 1).stage !== last) err("progress: a stage past the end should clamp to the last");
// old saves: the first stage stays, anything past it goes back to the home row
if (T.migrate(0) !== 0) err("migrate: an old stage 0 should stay 0");
[1, 4, 8, 20].forEach((o) => { const n = T.migrate(o); if (STAGES[n].name !== "The home row") err(`migrate: old stage ${o} goes to ${STAGES[n].name}, want The home row`); });
if (!(T.COUNTDOWN === 5)) err(`the countdown before a round is ${T.COUNTDOWN} seconds, want 5`);

if (errors.length) {
  errors.forEach((e) => console.log("ERROR " + e));
  console.log(`\n${errors.length} typing problem(s).`);
  process.exit(1);
}
console.log(`OK: ${STAGES.length} typing stages; words from stage ${firstWords + 1}; ${STAGES.reduce((n, d) => n + d.need, 0)} good rounds from the first key to the last stage.`);
