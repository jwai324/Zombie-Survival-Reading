#!/usr/bin/env node
/* The road balance run: drive routes with the real game code and report per trip and per cell (danger x day).

   node tests/balance/run.js (--matrix | --danger 3[,4] | --routes "base>school,base>police")
               [--repo PATH] [--day 10[,20]] [--seeds 16] [--seed0 1]
               [--loadout auto|stock|"armor=2,engine=1,walls=2,..."] [--override "engine=5,..."]
               [--bot "minPx=30,lag=0.2,jitter=6,cps=6,fire=click|hold" | idle] [--assist on|off]
               [--set "ROAD_DANGER.2.spawns=1.2,..."] [--patch patches.json] [--replace "js/game.js|from|to"]...
               [--night on|off] [--fog on|off] [--vw 1280 --vh 720] [--jobs 3] [--out trips.jsonl] [--summary cells.json]

   --repo     the game to load (default: this checkout). Never edited.
   --matrix   every cell of matrix.json (its dangers, days, routes and seeds); --danger / --day filter it.
   --danger   matrix.json's routes for those dangers. --routes: any routes instead.
   --loadout  auto (default): the plausible van for that day from loadouts.json; stock: nothing bought; or explicit
              levels (upgrade keys of js/upgrades.js DEFS, room keys of WORLD.BASE_ROOMS, perkVanHp). --override on top.
   --set      numbers in Game's own tables after the load, by dotted path (core.js setPath): try a tuning without
              editing anything. --patch / --replace: in-memory edits of the source ({file, from, to, all}).
   Prints one line per cell and writes the trips (JSONL) and the cell summaries (JSON) if asked.
   As a module: runMatrix(opts) -> Promise<{ rows, cells, routes }>. */
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const { fork } = require("child_process");
const parse = require("./args.js");
const stats = require("./stats.js");

const HERE = __dirname;
const DEFAULT_REPO = path.join(HERE, "..", "..");

const kv = (s) => {
  const o = {};
  if (!s || s === true) return o;
  for (const part of String(s).split(",")) {
    if (!part.trim()) continue;
    const [k, v] = part.split("=");
    o[k.trim()] = v == null ? true : isNaN(+v) ? v.trim() : +v;
  }
  return o;
};
const list = (s, f) => (s == null || s === true ? null : String([].concat(s).join(",")).split(",").filter(Boolean).map(f || ((x) => x)));

/** The van for a day: { upgrades, rooms, perkVanHp, name }; upgrade keys are js/upgrades.js DEFS's (keys: the loaded
    game's), anything else a room. */
function resolveLoadout(spec, day, override, upgradeKeys, file) {
  let up = {};
  let rooms = {};
  let perk = 0;
  let name;
  const isUp = (k) => upgradeKeys.includes(k);
  if (spec == null || spec === "auto") {
    const L = JSON.parse(fs.readFileSync(file || path.join(HERE, "loadouts.json"), "utf8"));
    const days = Object.keys(L.days).map(Number).sort((a, b) => a - b);
    const d = days.filter((x) => x <= day).pop() || days[0];
    up = Object.assign({}, L.days[d].upgrades);
    rooms = Object.assign({}, L.days[d].rooms);
    name = "auto:day" + d;
  } else if (spec === "stock") name = "stock";
  else {
    for (const [k, v] of Object.entries(kv(spec))) {
      if (k === "perkVanHp") perk = v;
      else if (isUp(k)) up[k] = v;
      else rooms[k] = v;
    }
    name = "set:" + spec;
  }
  const ov = kv(override);
  for (const [k, v] of Object.entries(ov)) {
    if (k === "perkVanHp") perk = v;
    else if (isUp(k)) up[k] = v;
    else rooms[k] = v;
  }
  if (Object.keys(ov).length) name += "+" + override;
  const short = upgradeKeys.filter((k) => k !== "paint").map((k) => k[0] + (up[k] || 0)).join("") + (Object.keys(rooms).length ? " " + Object.entries(rooms).map(([k, v]) => k + v).join(",") : "");
  return { upgrades: up, rooms, perkVanHp: perk, name: name + " " + short };
}

function readPatches(a) {
  const ps = [];
  for (const f of [].concat(a.patch || [])) if (f !== true) ps.push(...JSON.parse(fs.readFileSync(f, "utf8")));
  for (const r of [].concat(a.replace || [])) {
    if (r === true) continue;
    const [file, from, to] = String(r).split("|");
    if (to == null) throw new Error('--replace wants "file|from|to"');
    ps.push({ file, from, to });
  }
  return ps;
}

/** The upgrade keys of the repo (js/upgrades.js DEFS), read without loading the game. */
function upgradeKeys(repo) {
  const src = fs.readFileSync(path.join(repo, "js", "upgrades.js"), "utf8");
  const m = src.match(/const DEFS = \{([\s\S]*?)\n  \};/);
  return m ? [...m[1].matchAll(/^\s+(\w+): \{/gm)].map((x) => x[1]) : ["armor", "engine", "bumper", "paint", "damage", "fireRate", "spread"];
}

/** Build the job list from options (the same keys as the CLI flags, parsed). */
function jobsFor(o) {
  const M = JSON.parse(fs.readFileSync(o.matrixFile || path.join(HERE, "matrix.json"), "utf8"));
  const days = o.days || M.days;
  const seeds = o.seeds || M.seeds;
  const seed0 = o.seed0 || 1;
  let routes; // [danger-or-null, route]
  if (o.routes) routes = o.routes.map((r) => [null, r]);
  else {
    const dangers = o.dangers || Object.keys(M.routes).map(Number);
    routes = [];
    for (const d of dangers) for (const r of M.routes[d] || []) routes.push([d, r]);
  }
  const keys = upgradeKeys(path.resolve(o.repo || DEFAULT_REPO));
  const jobs = [];
  for (const day of days) {
    const lo = resolveLoadout(o.loadout || M.loadout, day, o.override, keys, o.loadoutsFile);
    for (const [, route] of routes) {
      const [from, to] = route.split(">");
      for (let s = seed0; s < seed0 + seeds; s++) jobs.push({ i: jobs.length, from, to, day, seed: s, upgrades: lo.upgrades, rooms: lo.rooms, perkVanHp: lo.perkVanHp, loadoutName: lo.name, bot: o.bot, aimAssist: o.aimAssist, night: o.night, fog: o.fog });
    }
  }
  return jobs;
}

/** Run the jobs on `n` worker processes (one game each); n 0 runs them here, in this process. */
function runJobs(jobs, cfg, n, onProgress) {
  if (!n) {
    const core = require("./core.js");
    if (!core.sim) core.load(cfg);
    return Promise.resolve(
      jobs.map((j) => {
        const t0 = process.hrtime.bigint();
        const r = core.runTrip(j);
        r.i = j.i;
        r.wall = Number(process.hrtime.bigint() - t0) / 1e9;
        return r;
      })
    );
  }
  return new Promise((resolve, reject) => {
    const results = new Array(jobs.length);
    let next = 0;
    let done = 0;
    let live = 0;
    const CHUNK = 6;
    const workers = [];
    if (!jobs.length) return resolve(results);
    const feed = (w) => {
      if (next >= jobs.length) {
        w.send({ type: "exit" });
        return;
      }
      const chunk = jobs.slice(next, next + CHUNK);
      next += chunk.length;
      w.send({ type: "jobs", jobs: chunk });
    };
    for (let k = 0; k < Math.max(1, Math.min(n, jobs.length)); k++) {
      const w = fork(__filename, ["--worker"], { stdio: ["ignore", "inherit", "inherit", "ipc"] });
      workers.push(w);
      live++;
      w.on("message", (m) => {
        if (m.type === "ready") feed(w);
        else if (m.type === "results") {
          for (const r of m.results) results[r.i] = r;
          done += m.results.length;
          if (onProgress) onProgress(done, jobs.length);
          feed(w);
        } else if (m.type === "error") {
          workers.forEach((x) => x.kill());
          reject(new Error(m.error));
        }
      });
      w.on("exit", (code) => {
        live--;
        if (code && code !== 0) {
          workers.forEach((x) => x.kill());
          return reject(new Error("worker exited " + code));
        }
        if (!live) resolve(results);
      });
      w.send({ type: "init", cfg });
    }
  });
}

/** opts: { repo, matrixFile, dangers, days, routes, seeds, seed0, loadout, override, bot, aimAssist, night, fog, patches, set, vw, vh, jobs, quiet } */
async function runMatrix(opts) {
  const given = {};
  for (const [k, v] of Object.entries(opts || {})) if (v !== undefined) given[k] = v;
  const o = Object.assign({ repo: DEFAULT_REPO, jobs: Math.max(1, Math.min(4, os.cpus().length - 1)) }, given);
  const jobs = jobsFor(o);
  const cfg = { repo: path.resolve(o.repo), patches: o.patches || [], set: o.set || {}, vw: o.vw || 1280, vh: o.vh || 720 };
  const t0 = Date.now();
  let last = 0;
  const rows = await runJobs(jobs, cfg, o.jobs, (d, n) => {
    if (o.quiet || Date.now() - last < 5000) return;
    last = Date.now();
    process.stderr.write("  " + d + "/" + n + " trips, " + ((Date.now() - t0) / 1000).toFixed(0) + " s\n");
  });
  const cells = stats.group(rows, stats.cellKey);
  const routes = stats.group(rows, stats.routeKey);
  return { rows, cells, routes, wall: (Date.now() - t0) / 1000, cfg, workers: o.jobs };
}

function fmtCells(cells) {
  const keys = Object.keys(cells).sort((a, b) => cells[a].day - cells[b].day || cells[a].danger - cells[b].danger);
  const L = [];
  L.push("cell        n  engine  hp   spawned   met(+-sd)   hits (front/side/back)   dmg(+-sd)      died%   kills   scrap(+-sd)   secs  hit%  alive  cpu-s");
  for (const k of keys) {
    const c = cells[k];
    const m = c.metrics;
    const pm = (x, w) => (x ? (x.mean.toFixed(1) + "+-" + x.sd.toFixed(0)).padStart(w) : "-".padStart(w));
    const fsb = m.hitsFront ? (" (" + [m.hitsFront, m.hitsSide, m.hitsBack].map((x) => x.mean.toFixed(1)).join("/") + ")").padEnd(17) : "".padEnd(17);
    L.push(k.padEnd(11) + String(c.n).padStart(3) + String(c.engine).padStart(7) + String(c.hp).padStart(5) + m.spawned.mean.toFixed(1).padStart(9) + pm(m.met, 12) + m.hits.mean.toFixed(1).padStart(8) + fsb + pm(m.dmg, 14) + (m.died.rate * 100).toFixed(0).padStart(9) + m.kills.mean.toFixed(1).padStart(8) + pm(m.scrap, 13) + m.secs.mean.toFixed(0).padStart(7) + (m.hitRate == null ? "-" : (m.hitRate * 100).toFixed(0)).padStart(6) + m.avgAlive.mean.toFixed(1).padStart(7) + c.wallSecs.toFixed(0).padStart(7));
  }
  return L.join("\n");
}

function optsFromArgs(a) {
  const yes = (v) => (v == null ? null : v === true || v === "on" || v === "true" || v === "1");
  const bot = a.bot == null ? undefined : a.bot === "idle" ? "idle" : kv(a.bot);
  return {
    repo: a.repo || DEFAULT_REPO,
    matrixFile: typeof a.matrix === "string" ? a.matrix : undefined,
    dangers: list(a.danger, Number),
    days: list(a.day, Number),
    routes: list(a.routes),
    seeds: a.seeds ? +a.seeds : undefined,
    seed0: a.seed0 ? +a.seed0 : undefined,
    loadout: a.loadout,
    loadoutsFile: typeof a.loadouts === "string" ? path.resolve(a.loadouts) : undefined,
    override: a.override || (a.engine != null ? "engine=" + a.engine : undefined),
    bot,
    aimAssist: a.assist == null ? undefined : yes(a.assist),
    night: yes(a.night),
    fog: yes(a.fog),
    patches: readPatches(a),
    set: [].concat(a.set || []).filter((x) => x !== true).reduce((o, s) => Object.assign(o, kv(s)), {}),
    vw: a.vw ? +a.vw : undefined,
    vh: a.vh ? +a.vh : undefined,
    jobs: a.jobs != null ? +a.jobs : undefined,
    quiet: !!a.quiet,
  };
}

/* ---------- worker ---------- */
function worker() {
  let core = null;
  process.on("message", (m) => {
    try {
      if (m.type === "init") {
        core = require("./core.js");
        core.load(m.cfg);
        process.send({ type: "ready" });
      } else if (m.type === "jobs") {
        const results = m.jobs.map((j) => {
          const t0 = process.hrtime.bigint();
          const r = core.runTrip(j);
          r.i = j.i;
          r.wall = Number(process.hrtime.bigint() - t0) / 1e9;
          return r;
        });
        process.send({ type: "results", results });
      } else if (m.type === "exit") process.exit(0);
    } catch (e) {
      process.send({ type: "error", error: String((e && e.stack) || e) });
    }
  });
}

if (require.main === module) {
  const a = parse(process.argv.slice(2));
  if (a.worker) worker();
  else {
    if (!a.matrix && !a.danger && !a.routes) {
      console.error("say what to drive: --matrix, --danger N or --routes a>b (see the header of run.js)");
      process.exit(2);
    }
    const o = optsFromArgs(a);
    runMatrix(o)
      .then((res) => {
        if (a.out) fs.writeFileSync(a.out, res.rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
        if (a.summary) fs.writeFileSync(a.summary, JSON.stringify({ cfg: res.cfg, cells: res.cells, routes: res.routes }, null, 1));
        if (!o.quiet) {
          console.log(fmtCells(res.cells));
          console.log("  " + res.rows.length + " trips in " + res.wall.toFixed(0) + " s on " + res.workers + " workers (cpu-s: the cell's own trip time, summed)");
        }
      })
      .catch((e) => {
        console.error(e.message || e);
        process.exit(1);
      });
  }
}
module.exports = { runMatrix, runJobs, jobsFor, resolveLoadout, optsFromArgs, fmtCells, kv, DEFAULT_REPO };
