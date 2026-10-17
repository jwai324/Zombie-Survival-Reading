#!/usr/bin/env node
/* The road's difficulty, a quick look (the whole run is `npm run balance`: tests/balance/compare.js, about 1.5 min).
   Drives a few cells of the balance matrix (tests/balance: the real road code, a lane-keeping driver and a human-like
   aiming bot, seeded) and holds each to the flat camera's target (tests/balance/targets.json) within WIDE bands: few
   seeds are noisy, so this catches a road that got much harder or easier (spawns broken, walkers that never reach the
   van, a gun that never misses), not a few percent. Also: a trip driven twice is the same trip (the seeding), every
   trip arrives without a wrong turn, and walkers come and are met.
   Exit 1 on any error. */
"use strict";
const path = require("path");
const run = require(path.join(__dirname, "balance", "run.js"));
const cmp = require(path.join(__dirname, "balance", "compare.js"));
const core = require(path.join(__dirname, "balance", "core.js"));

// SCALE: the cells looked at, and the seeds a route (3 routes a danger in tests/balance/matrix.json)
const CELLS = [[1, 1], [3, 1], [4, 5], [2, 10], [5, 10], [3, 20]];
const SEEDS = 6;
// wide: about three standard errors of a cell driven this few times
const BANDS = { dmg: { rel: 0.5, abs: 10 }, died: { pts: 0.3 }, met: { rel: 0.3, abs: 3 }, scrap: { rel: 0.3, abs: 5 } };

// (--repo PATH: hold another checkout to the target instead of this one)
const ai = process.argv.indexOf("--repo");
const REPO = ai > 0 ? path.resolve(process.argv[ai + 1]) : run.DEFAULT_REPO;
const errors = [];
const err = (m) => errors.push(m);
(async () => {
  const t0 = Date.now();
  const T = cmp.targets();
  const jobs = [];
  for (const [danger, day] of CELLS) jobs.push(...run.jobsFor({ repo: REPO, dangers: [danger], days: [day], seeds: SEEDS, bot: T.meta.run.bot }));
  jobs.forEach((j, i) => (j.i = i));
  const rows = await run.runJobs(jobs, { repo: REPO, patches: [], set: {}, vw: T.meta.run.vw, vh: T.meta.run.vh }, 3);
  const stats = require(path.join(__dirname, "balance", "stats.js"));
  const cells = stats.group(rows, stats.cellKey);
  const verdicts = cmp.compare(T.cells, cells, BANDS);
  if (verdicts.length !== CELLS.length) err(`only ${verdicts.length} of ${CELLS.length} cells were driven`);
  for (const r of verdicts) for (const v of r.verdicts) if (!v.pass) err(`${r.key}: ${v.metric} ${v.text} is outside the smoke's wide band (${v.metric === "died" ? "+-" + v.band * 100 + " pts" : "+-" + v.band.toFixed(1)})`);
  const lost = rows.filter((r) => !r.arrived || r.wrongTurns);
  if (lost.length) err(`${lost.length} trips did not arrive or took a wrong turn (${lost.slice(0, 3).map((r) => r.route + " day " + r.day).join(", ")})`);
  if (rows.some((r) => !(r.spawned > 0) || !(r.met > 0))) err("a trip had no walkers come or none met");
  // the same trip twice: the same trip
  core.load({ repo: REPO, vw: T.meta.run.vw, vh: T.meta.run.vh });
  const j = Object.assign({}, jobs[Math.floor(jobs.length / 2)]);
  const a = core.runTrip(j);
  const b = core.runTrip(j);
  for (const k of ["secs", "spawned", "met", "hits", "dmg", "kills", "scrap", "shots"]) if (a[k] !== b[k]) err(`the same trip driven twice differs in ${k}: ${a[k]} and ${b[k]} (seeding)`);
  const ref = rows[j.i];
  for (const k of ["spawned", "hits", "dmg", "kills"]) if (ref && a[k] !== ref[k]) err(`a trip driven here and on a worker differs in ${k}: ${a[k]} and ${ref[k]}`);
  const line = verdicts.map((r) => `${r.key} ${r.verdicts.map((v) => (v.metric === "died" ? (v.result * 100).toFixed(0) + "%" : v.result.toFixed(0))).join("/")}`).join(", ");
  console.log(`balance smoke: ${rows.length} trips, ${CELLS.length} cells held to the target within wide bands (dmg/died/met/scrap: ${line}); a trip driven twice is the same (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  errors.slice(0, 30).forEach((e) => console.log("ERROR " + e));
  console.log(errors.length ? `FAILED: ${errors.length} errors` : "ok");
  process.exit(errors.length ? 1 : 0);
})().catch((e) => {
  console.error(e.stack || e);
  process.exit(1);
});
