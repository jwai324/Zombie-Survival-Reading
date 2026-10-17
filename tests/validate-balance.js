#!/usr/bin/env node
/* The road's difficulty, a quick look (the whole run is `npm run balance`: tests/balance/compare.js, about 1.5 min).
   Drives a few cells of the balance matrix (tests/balance: the real road code, a lane-keeping driver and a human-like
   aiming bot, seeded) and holds each to the flat camera's target (tests/balance/targets.json) within WIDE bands: few
   seeds are noisy, so this catches a road that got much harder or easier (spawns broken, walkers that never reach the
   van, a gun that never misses), not a few percent. Also: a trip driven twice is the same trip (the seeding), every
   trip arrives without a wrong turn, walkers come and are met, and on the first days' near packs almost none appears
   in plain view on the open road (they step out of the verge: js/perspective.js spawn).
   Exit 1 on any error. */
"use strict";
const path = require("path");
const run = require(path.join(__dirname, "balance", "run.js"));
const cmp = require(path.join(__dirname, "balance", "compare.js"));
const core = require(path.join(__dirname, "balance", "core.js"));

// SCALE: the cells looked at, and the seeds a route (3 routes a danger in tests/balance/matrix.json); day 7 is one of
// the matrix's clear days (night and fog off: the Ram Plow's first days)
const CELLS = [[1, 1], [3, 1], [4, 5], [4, 7], [2, 10], [5, 10], [3, 20]];
const SEEDS = 6;
// pop-in: of the walkers that come on the first days at the dangers whose packs come near (ROAD_DANGER's early farY),
// at most POP_MAX may appear in plain view on the open road: on the screen, at least POP_PX tall, at least half clear
// of the haze, within the road's half width and POP_ROAD of the van's road there (they come out of the verge instead)
const POP_CELLS = [[2, 1], [4, 1], [5, 1], [5, 5]];
const POP_SEEDS = 2;
const POP_MAX = 0.05;
const POP_PX = 20;
const POP_ROAD = 60;
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
  // pop-in on the open road
  const { G, ZSR } = core.sim;
  const P = ZSR.Persp;
  const St = ZSR.Streets;
  const add0 = G.addZombie;
  let came = 0;
  let popped = 0;
  G.addZombie = function (type, x, y) {
    const z = add0.call(this, type, x, y);
    if (z && this.van) {
      came++;
      P.setup(this);
      const f = P.project(x, y, 0);
      const h = f && P.project(x, y, P.walkerH(z));
      if (f && h && f.x > 0 && f.x < this.W && f.y > 0 && f.y < this.H && f.y - h.y >= POP_PX && P.fadeAt(f.Y) >= 0.5) {
        const q = St.at(this.track, this.van.s + f.Y - P.local(this.van.x, this.van.y).Y);
        if (Math.abs((x - q.x) * -q.uy + (y - q.y) * q.ux) <= St.GEOM.half + POP_ROAD) popped++;
      }
    }
    return z;
  };
  for (const [danger, day] of POP_CELLS) for (const pj of run.jobsFor({ repo: REPO, dangers: [danger], days: [day], seeds: POP_SEEDS, bot: T.meta.run.bot })) core.runTrip(pj);
  G.addZombie = add0;
  if (!(came > 200)) err(`only ${came} walkers came on the pop-in trips`);
  else if (popped / came > POP_MAX) err(`${popped} of ${came} walkers (${((100 * popped) / came).toFixed(1)}%) appeared in plain view on the open road (want at most ${POP_MAX * 100}%: on the screen, ${POP_PX} px tall or more, half clear of the haze)`);
  const line = verdicts.map((r) => `${r.key} ${r.verdicts.map((v) => (v.metric === "died" ? (v.result * 100).toFixed(0) + "%" : v.result.toFixed(0))).join("/")}`).join(", ");
  console.log(`balance smoke: ${rows.length} trips, ${CELLS.length} cells held to the target within wide bands (dmg/died/met/scrap: ${line}); a trip driven twice is the same; ${popped} of ${came} walkers on the first days' near packs appeared in plain view on the open road (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  errors.slice(0, 30).forEach((e) => console.log("ERROR " + e));
  console.log(errors.length ? `FAILED: ${errors.length} errors` : "ok");
  process.exit(errors.length ? 1 : 0);
})().catch((e) => {
  console.error(e.stack || e);
  process.exit(1);
});
