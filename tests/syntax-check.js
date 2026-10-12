#!/usr/bin/env node
/* Parses every script the page loads so a typo cannot ship a blank game.
   Also checks that index.html references scripts that exist. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
let failed = false;

if (!scripts.length) {
  console.log("ERROR no <script src> tags found in index.html");
  process.exit(1);
}
for (const rel of scripts) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) {
    console.log(`ERROR ${rel}: referenced by index.html but missing`);
    failed = true;
    continue;
  }
  try {
    new vm.Script(fs.readFileSync(file, "utf8"), { filename: rel });
    console.log(`ok    ${rel}`);
  } catch (e) {
    console.log(`ERROR ${rel}: ${e.message}`);
    failed = true;
  }
}
const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
for (const rel of sheets.filter((s) => !/^https?:/.test(s))) {
  if (!fs.existsSync(path.join(ROOT, rel))) {
    console.log(`ERROR ${rel} missing`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
