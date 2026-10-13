#!/usr/bin/env node
/* Words of in-world reading (everything but the typing drills), per content file and per level.
   Usage: node tests/count-words.js [level] */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DIR = path.join(__dirname, "..", "js", "content");
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
function reading(o) {
  if (typeof o === "string") return words(o);
  if (Array.isArray(o)) return o.reduce((n, x) => n + reading(x), 0);
  if (o && typeof o === "object") return Object.entries(o).reduce((n, [k, v]) => n + (k === "typing" || k === "level" ? 0 : reading(v)), 0);
  return 0;
}
function run(files, n) {
  const sb = {};
  sb.globalThis = sb;
  files.forEach((f) => vm.runInNewContext(fs.readFileSync(f, "utf8"), sb, { filename: f }));
  return reading((sb.ZSR && sb.ZSR.TEXT && sb.ZSR.TEXT[n]) || {});
}
const only = process.argv[2] ? [Number(process.argv[2])] : [1, 2, 3, 4, 5, 6];
only.forEach((n) => {
  const main = path.join(DIR, `level${n}.js`);
  const parts = fs.readdirSync(DIR).filter((f) => f.startsWith(`level${n}-`) && f.endsWith(".js")).sort().map((f) => path.join(DIR, f));
  const line = [`level ${n}: ${run([main].concat(parts), n)} words`];
  // each part alone (a part file creates the level object if the main file is absent)
  parts.forEach((f) => line.push(`${path.basename(f)} ${run([f], n)}`));
  console.log(line.join(" · "));
});
