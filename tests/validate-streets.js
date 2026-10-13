#!/usr/bin/env node
/* Validates js/streets.js against js/world.js: every road is named, side streets are
   well formed and stay clear of other roads, the road text keys are complete, and for
   EVERY ordered pair of places the drive is well formed at slow and fast vans: lanes,
   one right way per decision, the left lane always goes straight on past side streets and
   driveways, the van's own path through every turn from every lane is a smooth arc that
   leads somewhere (and back onto the route the right way), signs name something, the
   written directions name every road, geometry is finite, and the drive time is in range.
   Exit 1 on any error. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
// world.js and streets.js run in this context (a vm sandbox makes every global lookup slow, and this checks thousands of drives)
for (const f of ["js/layouts.js", "js/world.js", "js/streets.js"]) {
  const file = path.join(ROOT, f);
  if (fs.existsSync(file)) vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: f });
}
const W = globalThis.ZSR && globalThis.ZSR.WORLD;
const S = globalThis.ZSR && globalThis.ZSR.Streets;
if (!W || !S) {
  console.log("ERROR world.js or streets.js did not load");
  process.exit(1);
}
const G = S.GEOM;
const errors = [];
const warnings = [];
const err = (c, m) => errors.push(c + ": " + m);
const warn = (c, m) => warnings.push(c + ": " + m);
const pos = {};
W.LOCATIONS.forEach((l) => (pos[l.id] = l));
const finite = (...xs) => xs.every((x) => typeof x === "number" && Number.isFinite(x));
function distSeg(px, py, x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / l2));
  return Math.hypot(px - x0 - dx * t, py - y0 - dy * t);
}
function segDist(a, b) {
  // closest distance between two segments (sampled; plenty for map-sized checks)
  let m = Infinity;
  for (let i = 0; i <= 20; i++) {
    const f = i / 20;
    m = Math.min(m, distSeg(a.x0 + (a.x1 - a.x0) * f, a.y0 + (a.y1 - a.y0) * f, b.x0, b.y0, b.x1, b.y1));
    m = Math.min(m, distSeg(b.x0 + (b.x1 - b.x0) * f, b.y0 + (b.y1 - b.y0) * f, a.x0, a.y0, a.x1, a.y1));
  }
  return m;
}
const trackOk = (tr) => tr && tr.xs.length >= 2 && tr.xs.every((x, i) => finite(x, tr.ys[i], tr.cum[i])) && finite(tr.len) && tr.len > 0;
/** The tightest bend along a track (px of radius), from the turn between neighboring segments. */
function tightest(tr) {
  let m = Infinity;
  for (let i = 1; i < tr.xs.length - 1; i++) {
    const a = Math.atan2(tr.ys[i] - tr.ys[i - 1], tr.xs[i] - tr.xs[i - 1]);
    const b = Math.atan2(tr.ys[i + 1] - tr.ys[i], tr.xs[i + 1] - tr.xs[i]);
    const da = Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a)));
    if (da > 1e-6) m = Math.min(m, (tr.cum[i + 1] - tr.cum[i - 1]) / 2 / da);
  }
  return m;
}
/** A point held `d` to the right of the track never moves backward as s runs on (the smooth tangents of Streets.at). */
function glides(tr, d) {
  let px = null;
  let py = null;
  for (let s = 0; s <= Math.min(tr.len, 1200); s += 3) {
    const p = S.at(tr, s);
    const x = p.x - p.uy * d;
    const y = p.y + p.ux * d;
    if (px != null && (x - px) * p.ux + (y - py) * p.uy < -1e-6) return false;
    px = x;
    py = y;
  }
  return true;
}
const MIN_ARC = 95; // the van's own arc through any turn, at least (px)

/* ---------- street names ---------- */
const roadKeys = W.ROADS.map(([a, b]) => a + "|" + b);
roadKeys.forEach((k) => {
  if (!S.STREET_NAMES[k] || !String(S.STREET_NAMES[k]).trim()) err("STREET_NAMES", `road ${k} has no name`);
});
Object.keys(S.STREET_NAMES).forEach((k) => {
  if (!roadKeys.includes(k)) err("STREET_NAMES", `${k} is not a road in WORLD.ROADS (keys follow the ROADS order)`);
});
const names = Object.values(S.STREET_NAMES);
names.forEach((n, i) => {
  if (names.indexOf(n) !== i) err("STREET_NAMES", `"${n}" is used twice`);
});

/* ---------- side streets ---------- */
const KINDS = ["deadEnd", "noThrough", "closed"];
const stubs = [];
S.SIDE_STREETS.forEach((s, i) => {
  const c = `SIDE_STREETS[${i}] ${s.name}`;
  if (!roadKeys.includes(s.road)) return err(c, `road "${s.road}" is not in WORLD.ROADS`);
  if (!(s.t >= 0.15 && s.t <= 0.85)) err(c, `t ${s.t} must be 0.15..0.85`);
  if (s.side !== "left" && s.side !== "right") err(c, `side must be left or right`);
  if (!KINDS.includes(s.kind)) err(c, `kind must be one of ${KINDS.join(", ")}`);
  if (!s.name || !String(s.name).trim()) err(c, "no name");
  if (names.includes(s.name)) err(c, "has the same name as a road");
  if (S.SIDE_STREETS.findIndex((o) => o.name === s.name) !== i) err(c, "name used twice");
  const st = S.sideStub(s);
  if (!finite(st.x0, st.y0, st.x1, st.y1)) return err(c, "geometry is not finite");
  if (st.x1 < 20 || st.x1 > 980 || st.y1 < 20 || st.y1 > 680) err(c, "runs off the map");
  W.ROADS.forEach(([a, b]) => {
    if (a + "|" + b === s.road) return;
    const d = segDist(st, { x0: pos[a].x, y0: pos[a].y, x1: pos[b].x, y1: pos[b].y });
    if (d < 25) err(c, `comes within ${d.toFixed(0)} map units of ${a}|${b} (needs 25, must not cross)`);
  });
  W.LOCATIONS.forEach((l) => {
    const d = distSeg(l.x, l.y, st.x0, st.y0, st.x1, st.y1);
    if (d < 30) err(c, `comes within ${d.toFixed(0)} map units of ${l.id}`);
  });
  stubs.forEach((o) => {
    if (segDist(st, o.st) < 12) err(c, `too close to side street ${o.s.name}`);
  });
  stubs.push({ s, st });
});
roadKeys.forEach((k) => {
  const [a, b] = k.split("|");
  const len = Math.hypot(pos[a].x - pos[b].x, pos[a].y - pos[b].y);
  const n = S.SIDE_STREETS.filter((s) => s.road === k).length;
  if (n > 2) err("SIDE_STREETS", `${k} has ${n} side streets (2 at most)`);
  if (len > 180 && n === 0) warn("SIDE_STREETS", `${k} is long (${len.toFixed(0)}) and has no side street`);
});
if (S.SIDE_STREETS.length < roadKeys.length * 0.7) err("SIDE_STREETS", `only ${S.SIDE_STREETS.length} side streets for ${roadKeys.length} roads (roughly one per road)`);

/* ---------- road text keys ---------- */
const TOKENS = ["place", "street", "dest", "origin"];
const NEED = { to: ["dest"], wrongWay: ["place"], wrongStreet: ["street"], wrongSide: ["street"], wrongPlace: ["place", "dest"], wrongLot: ["dest"], missed: ["dest"], restart: ["origin"], routeTake: ["street", "place"], routeTakeStreet: ["street"], routeLeft: ["dest"], routeRight: ["dest"] };
const REQUIRED = ["to", "here", "home", "fog", "night", "hungry", "deadEnd", "noThrough", "closed", "lot", "hint", "wrongWay", "wrongStreet", "wrongSide", "wrongPlace", "wrongLot", "missed", "restart", "routeHead", "routeTake", "routeTakeStreet", "routeStraight", "routeLeft", "routeRight"];
const tokensOf = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const F = S.ROAD_TEXT_FALLBACK;
REQUIRED.forEach((k) => {
  if (!F[k] || !String(F[k]).trim()) err("ROAD_TEXT_FALLBACK", `missing "${k}"`);
});
Object.entries(F).forEach(([k, s]) => {
  tokensOf(s).forEach((t) => {
    if (!TOKENS.includes(t)) err("ROAD_TEXT_FALLBACK", `${k} uses unknown token {${t}}`);
  });
  (NEED[k] || []).forEach((t) => {
    if (!tokensOf(s).includes(t)) err("ROAD_TEXT_FALLBACK", `${k} must use {${t}}`);
  });
});
// each reading level: a road section with every key and the same tokens (written in wave 2)
for (let n = 1; n <= 6; n++) {
  const file = path.join(ROOT, "js", "content", `level${n}.js`);
  if (!fs.existsSync(file)) continue;
  const tb = {};
  tb.globalThis = tb;
  try {
    vm.runInNewContext(fs.readFileSync(file, "utf8"), tb, { filename: file });
  } catch (e) {
    err(`level${n}`, "does not load: " + e.message);
    continue;
  }
  const t = tb.ZSR && tb.ZSR.TEXT && tb.ZSR.TEXT[n];
  if (!t || !t.road) {
    warn(`level${n}`, "no road section yet (the game uses the English fallback)");
    continue;
  }
  Object.keys(F).forEach((k) => {
    if (!t.road[k] || !String(t.road[k]).trim()) return err(`level${n} road.${k}`, "missing");
    if (tokensOf(t.road[k]).join() !== tokensOf(F[k]).join()) err(`level${n} road.${k}`, `tokens ${tokensOf(t.road[k]).join(",") || "none"} must be ${tokensOf(F[k]).join(",") || "none"}`);
  });
  Object.keys(t.road).forEach((k) => {
    if (!(k in F)) warn(`level${n} road.${k}`, "not a key the game reads");
  });
}

/* ---------- lanes ---------- */
for (let n = 2; n <= 4; n++) {
  for (let i = 0; i < n; i++) if (S.laneOf(S.laneCenter(i, n), n) !== i) err("lanes", `lane ${i} of ${n} does not map back to itself`);
  if (S.ourLeft(n) < -G.half - 1e-6) err("lanes", `${n} lanes do not fit on the road`);
}

/* ---------- every route, slow van and fast van ---------- */
const ids = W.LOCATIONS.map((l) => l.id);
const deg = (id) => S.neighbors(id).length;
const SPEEDS = [1, 1.7]; // Upgrades: engine 0 .. 5
let drives = 0;
let minWin = Infinity;
let maxTime = 0;
let minTime = Infinity;
let minLot = Infinity;
let minArc = Infinity;
for (const a of ids) {
  for (const b of ids) {
    if (a === b) continue;
    const c = `${a} > ${b}`;
    const r = S.route(a, b);
    if (!r) {
      err(c, "no route");
      continue;
    }
    // the written directions on the city map name every road of the route and the side to turn in at
    [() => true, () => false].forEach((known) => {
      const lines = S.directions(r.path, known, (id) => pos[id].name);
      if (lines.length !== r.path.length + 1 || lines.some((l) => !l || /\{\w+\}/.test(l))) err(c, "directions are incomplete");
      for (let i = 0; i < r.path.length - 1; i++) if (!lines[i].includes(S.streetName(r.path[i], r.path[i + 1]))) err(c, `directions line ${i + 1} does not name its street`);
      if (!lines[lines.length - 1].includes(pos[b].name)) err(c, "the last line of the directions must name the place");
    });
    for (const sp of SPEEDS) {
      const v = G.baseSpeed * sp;
      const secs = Math.min(W.SETTINGS.tripMaxSeconds, Math.max(W.SETTINGS.tripMinSeconds, r.dist * W.SETTINGS.tripSecondsPerUnit));
      const scale = S.scaleFor(r.dist, secs, v);
      let d;
      try {
        d = S.buildDrive(r.path, { scale, speed: v });
      } catch (e) {
        err(c, "buildDrive threw: " + e.message);
        continue;
      }
      drives++;
      const cs = `${c} (speed x${sp})`;
      if (!trackOk(d.track)) err(cs, "main track is empty or not finite");
      const time = (d.endS - d.startS) / v;
      maxTime = Math.max(maxTime, time);
      minTime = Math.min(minTime, time);
      if (!(time >= 15 && time <= 125)) err(cs, `drive takes ${time.toFixed(0)} s (15..125)`);
      // the decisions expected along this route
      const want = { side: 0, lot: 0, junction: 0, dest: 1 };
      for (let i = 0; i < r.path.length - 1; i++) want.side += S.sideStreetsOn(r.path[i], r.path[i + 1]).length;
      for (let i = 1; i < r.path.length - 1; i++) {
        want.lot++;
        if (deg(r.path[i]) >= 3) want.junction++;
      }
      const got = { side: 0, lot: 0, junction: 0, dest: 0 };
      d.decisions.forEach((x) => (got[x.kind] = (got[x.kind] || 0) + 1));
      Object.keys(want).forEach((k) => {
        if (got[k] !== want[k]) err(cs, `${got[k]} ${k} decisions, expected ${want[k]}`);
      });
      const lastDec = d.decisions[d.decisions.length - 1];
      if (!lastDec || lastDec.kind !== "dest" || lastDec.node !== b) err(cs, "the last decision must be the destination's driveway");
      let prevStop = d.startS;
      d.decisions.forEach((x, k) => {
        const cd = `${cs} decision ${k} (${x.kind}${x.node ? " " + x.node : ""})`;
        if (!finite(x.stop, x.zoneStart, x.signAt, x.qx, x.qy, x.ux, x.uy)) return err(cd, "geometry is not finite");
        const w = x.stop - x.zoneStart;
        minWin = Math.min(minWin, w / v);
        if (w < G.winMin * v - 1e-6) err(cd, `lanes show only ${(w / v).toFixed(2)} s before the stop line (needs ${G.winMin})`);
        if (w > G.winMax * v + 1e-6) err(cd, `lanes show ${(w / v).toFixed(2)} s (at most ${G.winMax})`);
        if (x.zoneStart < prevStop - 1e-6) err(cd, "lanes begin before the last decision's stop line");
        if (x.signAt > x.zoneStart + 1e-6 || x.signAt < prevStop - 1e-6) err(cd, "the sign must show after the last stop line and before the lanes");
        if (x.stop > d.endS) err(cd, "stop line past the end of the drive");
        prevStop = x.stop;
        if (!Array.isArray(x.lanes) || x.n !== x.lanes.length || x.n < 2 || x.n > 4) err(cd, `${x.lanes && x.lanes.length} lanes, n ${x.n}`);
        // every lane goes one of the ways, every way has a lane, and the ways run left to right
        (x.lanes || []).forEach((w, i) => {
          if (!x.options[w]) err(cd, `lane ${i} goes to no way`);
          if (i > 0 && w < x.lanes[i - 1]) err(cd, "the ways must run left to right across the lanes");
        });
        x.options.forEach((o, k) => {
          if (!o.lanes || !o.lanes.length || o.lane !== o.lanes[0] || o.lanes.some((l) => x.lanes[l] !== k)) err(cd, `way ${k} has no lanes or they do not match`);
        });
        if (S.ourLeft(x.n) < -G.half) err(cd, "more lanes than the road holds");
        const right = x.options.filter((o) => o.correct);
        if (right.length !== 1) err(cd, `${right.length} right ways (exactly 1)`);
        // left alone the van keeps to the left lane: past a side street or a driveway that lane must go straight on
        if (x.kind === "side" || x.kind === "lot") {
          const w = x.options[x.lanes[S.laneOf(S.laneCenter(0, 2), x.n)]];
          if (!w || w.kind !== "through") err(cd, "the left lane must go straight on");
        }
        const p = S.at(d.track, x.stop);
        const lo = S.ourLeft(x.n) + 33;
        const hi = G.half - 33;
        x.options.forEach((o) => {
          if (!finite(o.rel)) err(cd, "turn angle not finite");
          // a sign row for each lane, whatever the player knows
          const label = (known) => (o.kind === "road" ? (known ? pos[o.to] && pos[o.to].name : o.street) : o.kind === "side" ? o.street : o.kind === "lot" ? (known ? pos[o.to] && pos[o.to].name : S.ROAD_TEXT_FALLBACK.lot) : "go on");
          if (!label(true) || !label(false)) err(cd, `lane ${o.lane} has nothing to put on the sign`);
          if (o.kind === "through") return;
          // the van's own path from anywhere in each of this way's lanes
          (o.lanes || []).forEach((lane) => {
            const c = S.laneCenter(lane, x.n);
            [Math.max(lo, c - 54), c, Math.min(hi, c + 54)].forEach((dv) => {
              const cl = `${cd} lane ${lane} at ${dv.toFixed(0)}`;
              let tp;
              try {
                tp = S.turnPath(d, x, o, dv);
              } catch (e) {
                return err(cl, "turnPath threw: " + e.message);
              }
              const tr = tp.track;
              if (!trackOk(tr)) return err(cl, "the turn has no path");
              const d0 = Math.hypot(tr.xs[0] - (p.x - x.uy * dv), tr.ys[0] - (p.y + x.ux * dv));
              if (d0 > 1) err(cl, `the turn starts ${d0.toFixed(1)} px from the van`);
              const r = tightest(tr);
              if (r < MIN_ARC) err(cl, `the turn bends at a ${r.toFixed(0)} px radius (needs ${MIN_ARC})`);
              minArc = Math.min(minArc, r);
              // the camera rides beside the path: from where it sits in the lanes to its place after the turn
              const cam0 = (S.ourLeft(x.n) + G.half) / 2 - dv;
              const cam1 = o.correct && x.kind === "junction" ? (S.ourLeft(2) + G.half) / 2 - tp.d1 : 0;
              if (!glides(tr, cam0) || !glides(tr, cam1)) err(cl, "the camera would step backward through the turn");
              const end = S.at(tr, tr.len);
              if (Math.hypot(end.ux - o.aim.vx, end.uy - o.aim.vy) > 0.02) err(cl, "the turn does not end heading down its road");
              if (!o.correct) {
                // a wrong lot ends parked; a wrong road or side street is driven a while before the fade
                const need = o.kind === "lot" ? 300 : 500;
                if (tr.len < need) err(cl, `the wrong way is only ${tr.len.toFixed(0)} px (needs ${need})`);
              } else if (x.kind === "junction") {
                // the right way rejoins the route in a lane of the next road, before its next lanes
                const m = S.at(d.track, tp.rejoin);
                const gap = Math.hypot(m.x - m.uy * tp.d1 - tr.xs[tr.xs.length - 1], m.y + m.ux * tp.d1 - tr.ys[tr.ys.length - 1]);
                if (gap > 1) err(cl, `the turn ends ${gap.toFixed(1)} px off the route`);
                if (tp.rejoin < x.exitS || tp.rejoin > o.rejoinMax + 1e-6) err(cl, "the turn rejoins the route outside its stretch");
              } else if (x.kind === "dest") {
                const e = S.at(d.track, d.endS);
                const gap = Math.hypot(e.x - tr.xs[tr.xs.length - 1], e.y - tr.ys[tr.ys.length - 1]);
                if (gap > 1) err(cl, `the turn ends ${gap.toFixed(1)} px from the parking spot`);
              }
            });
          });
        });
        if (x.kind === "junction") {
          const outs = S.neighbors(x.node).filter((nb) => nb !== r.path[r.path.indexOf(x.node) - 1]);
          const tos = x.options.map((o) => o.to).sort();
          if (tos.join() !== outs.sort().join()) err(cd, `lanes go to ${tos.join(",")}, roads out are ${outs.join(",")}`);
          for (let i = 1; i < x.options.length; i++) if (x.options[i].rel < x.options[i - 1].rel) err(cd, "lanes are not sorted left to right");
          const ok = x.options.find((o) => o.correct);
          if (ok && ok.to !== r.path[r.path.indexOf(x.node) + 1]) err(cd, "the right lane does not follow the route");
        }
        if (x.kind === "dest" && !x.options.some((o) => o.correct && o.kind === "lot")) err(cd, "the destination's right lane must turn into its lot");
        if ((x.kind === "lot" || x.kind === "side") && !x.options.some((o) => o.correct && o.kind === "through")) err(cd, "going straight on must be the right lane");
      });
      // lots stay clear of the other roads and side streets
      d.lots.forEach((lot) => {
        const own = S.roadKey(lot.from, lot.node);
        let m = Infinity;
        lot.corners.forEach(([x, y]) => {
          if (!finite(x, y)) err(cs, `lot of ${lot.node} not finite`);
          d.roads.forEach((rd) => {
            if (rd.key !== own) m = Math.min(m, distSeg(x, y, rd.x0, rd.y0, rd.x1, rd.y1) - G.half - G.shoulder);
          });
          d.sides.forEach((sd) => (m = Math.min(m, distSeg(x, y, sd.x0, sd.y0, sd.x1, sd.y1) - G.sideHalf - G.shoulder)));
        });
        minLot = Math.min(minLot, m);
        if (m < 0) err(cs, `the lot of ${lot.node} (from ${lot.from}) overlaps another road by ${(-m).toFixed(0)} px`);
      });
      // the right way ends parked inside the destination's lot
      const end = S.at(d.track, d.endS);
      const lot = d.lots.find((l) => l.dest);
      if (!lot) err(cs, "no destination lot");
      else {
        const [[x0, y0], [x1, y1], , [x3, y3]] = lot.corners;
        const ax = x1 - x0;
        const ay = y1 - y0;
        const bx = x3 - x0;
        const by = y3 - y0;
        const u = ((end.x - x0) * ax + (end.y - y0) * ay) / (ax * ax + ay * ay);
        const w = ((end.x - x0) * bx + (end.y - y0) * by) / (bx * bx + by * by);
        if (!(u > 0 && u < 1 && w > 0 && w < 1)) err(cs, "the drive does not end inside the destination's lot");
      }
    }
  }
}

console.log(`streets: ${roadKeys.length} roads named, ${S.SIDE_STREETS.length} side streets, ${drives} drives checked`);
console.log(`         shortest lane window ${minWin.toFixed(2)} s, drive time ${minTime.toFixed(0)}..${maxTime.toFixed(0)} s, closest lot ${minLot.toFixed(0)} px from another road, tightest turn ${minArc.toFixed(0)} px`);
warnings.forEach((w) => console.log("warn  " + w));
errors.slice(0, 60).forEach((e) => console.log("ERROR " + e));
if (errors.length > 60) console.log(`... ${errors.length - 60} more errors`);
console.log(errors.length ? `FAILED: ${errors.length} errors` : "ok");
process.exit(errors.length ? 1 : 0);
