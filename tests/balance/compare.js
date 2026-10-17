#!/usr/bin/env node
/* The road's difficulty against the flat-camera TARGET (targets.json), per cell (danger x day), with a pass/fail band.

   node tests/balance/compare.js                                   drive the whole matrix on this checkout and judge it
   node tests/balance/compare.js [run.js options] [--strict] [--json out.json] [--by route] [--out trips.jsonl]
   node tests/balance/compare.js --results trips.jsonl              judge trips already driven

   It drives exactly the targets' matrix (routes, days, seeds, loadouts, bot, viewport) unless told otherwise
   (--danger 3,4 --day 1,5 --seeds 16 for a quick loop). --strict: exit 1 when any compared cell fails. --by route:
   per route. --set / --patch / --replace try a tuning in memory (run.js).

   Bands (BANDS; a floor keeps a tiny target from failing on noise):
     dmg    van damage per trip (the whole trip, as if the van survived)   within +-20% (at least +-5 HP)
     died   share of trips the real van (its loadout's health) would not survive   within +-10 points
     met    walkers met: came within MEET_R (300 units) of the van, or were downed   within +-15% (at least +-1.5)
     scrap  scrap earned on the trip (kills + crates, as if it survived)   within +-15% (at least +-3)
   Shown, not judged: hits (walker blows on the van), dmg/met (the threat of one walker met), spawned. */
"use strict";
const fs = require("fs");
const path = require("path");
const parse = require("./args.js");
const stats = require("./stats.js");

const BANDS = {
  dmg: { rel: 0.2, abs: 5 },
  died: { pts: 0.1 },
  met: { rel: 0.15, abs: 1.5 },
  scrap: { rel: 0.15, abs: 3 },
};
const ORDER = ["dmg", "died", "met", "scrap"];

/** One metric: target t and result a (stats objects). */
function judge(metric, t, a, bands) {
  const b = (bands || BANDS)[metric];
  if (metric === "died") {
    const diff = a.rate - t.rate;
    const se = Math.sqrt(t.se * t.se + a.se * a.se);
    return { metric, target: t.rate, result: a.rate, diff, band: b.pts, pass: Math.abs(diff) <= b.pts + 1e-9, z: se > 0 ? diff / se : 0, text: (t.rate * 100).toFixed(0) + "% -> " + (a.rate * 100).toFixed(0) + "% (" + (diff >= 0 ? "+" : "") + (diff * 100).toFixed(0) + " pts)" };
  }
  const tol = Math.max(b.rel * Math.abs(t.mean), b.abs);
  const diff = a.mean - t.mean;
  const se = Math.sqrt(t.se * t.se + a.se * a.se);
  const rel = t.mean ? diff / t.mean : null;
  return { metric, target: t.mean, result: a.mean, diff, rel, band: tol, pass: Math.abs(diff) <= tol + 1e-9, z: se > 0 ? diff / se : 0, text: t.mean.toFixed(1) + " -> " + a.mean.toFixed(1) + " (" + (rel == null ? "n/a" : (rel >= 0 ? "+" : "") + (rel * 100).toFixed(0) + "%") + ")" };
}
/** Per cell: { key, verdicts: [...], pass }, for every key present in both. */
function compare(targetCells, resultCells, bands) {
  const out = [];
  const keys = Object.keys(resultCells).filter((k) => targetCells[k]);
  keys.sort((x, y) => resultCells[x].day - resultCells[y].day || resultCells[x].danger - resultCells[y].danger || x.localeCompare(y));
  for (const k of keys) {
    const T = targetCells[k].metrics;
    const A = resultCells[k].metrics;
    const verdicts = ORDER.map((m) => judge(m, T[m], A[m], bands));
    // the threat of one walker met: damage per walker met (the ratio of the means)
    const per = (M) => (M.met.mean > 0 ? M.dmg.mean / M.met.mean : 0);
    out.push({ key: k, danger: resultCells[k].danger, day: resultCells[k].day, n: [targetCells[k].n, resultCells[k].n], verdicts, pass: verdicts.every((v) => v.pass), info: { hits: [T.hits.mean, A.hits.mean], kills: [T.kills.mean, A.kills.mean], spawned: [T.spawned.mean, A.spawned.mean], secs: [T.secs.mean, A.secs.mean], dmgPerMet: [per(T), per(A)] } });
  }
  return out;
}
function format(rows, label) {
  const L = [];
  L.push((label || "result") + " vs the flat target (36403cd). Bands: dmg +-20% (>=5 HP), died +-10 pts, met +-15% (>=1.5), scrap +-15% (>=3). '!' = outside the band; z = diff / combined standard error.");
  const w = Math.max(13, ...rows.map((r) => r.key.length + 2));
  L.push("cell".padEnd(w) + ORDER.map((m) => m.padEnd(31)).join("") + "hits         dmg/met      spawned      verdict");
  for (const r of rows) {
    const cols = r.verdicts.map((v) => ((v.pass ? " " : "!") + v.text + " z" + v.z.toFixed(1)).padEnd(31)).join("");
    const f = (p, d) => (p[0].toFixed(d) + "->" + p[1].toFixed(d)).padEnd(13);
    L.push(r.key.padEnd(w) + cols + f(r.info.hits, 1) + f(r.info.dmgPerMet, 2) + f(r.info.spawned, 0) + (r.pass ? "PASS" : "FAIL"));
  }
  const n = rows.length;
  const per = ORDER.map((m, i) => m + " " + rows.filter((r) => r.verdicts[i].pass).length + "/" + n).join(", ");
  L.push("cells passing all four: " + rows.filter((r) => r.pass).length + "/" + n + "  (" + per + ")");
  return L.join("\n");
}
const TARGETS = path.join(__dirname, "targets.json");
const targets = (file) => JSON.parse(fs.readFileSync(file || TARGETS, "utf8"));

async function main() {
  const a = parse(process.argv.slice(2));
  const T = targets(a.targets);
  const byRoute = a.by === "route";
  let rows;
  let label;
  if (a.results) {
    rows = fs.readFileSync(a.results, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
    label = path.basename(a.results);
  } else {
    const run = require("./run.js");
    const o = run.optsFromArgs(a);
    const m = T.meta.run;
    // the targets' own matrix unless told otherwise
    if (!a.seeds) o.seeds = m.seeds;
    if (!a.bot) o.bot = m.bot;
    if (!a.vw) o.vw = m.vw;
    if (!a.vh) o.vh = m.vh;
    if (!a.danger && !a.routes) o.dangers = Object.keys(m.routes).map(Number);
    if (!a.day) o.days = m.days;
    const res = await run.runMatrix(o);
    rows = res.rows;
    label = "angled @ " + path.resolve(o.repo);
    if (a.out) fs.writeFileSync(a.out, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
    process.stderr.write("  drove " + rows.length + " trips in " + res.wall.toFixed(0) + " s\n");
  }
  const cells = stats.group(rows, byRoute ? stats.routeKey : stats.cellKey);
  const result = compare(byRoute ? T.routes : T.cells, cells);
  console.log(format(result, label));
  if (a.json) fs.writeFileSync(a.json, JSON.stringify(result, null, 1));
  if (a.strict && result.some((r) => !r.pass)) process.exit(1);
}
if (require.main === module)
  main().catch((e) => {
    console.error(e.stack || e);
    process.exit(1);
  });
module.exports = { compare, judge, format, targets, BANDS, ORDER };
