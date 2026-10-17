/* Per-cell statistics over trip records (core.js runTrip rows): mean, sd, se, median, p10, p90 of each number, and a
   rate with its Wilson 95% interval for "died". */
"use strict";
const NUM = ["spawned", "met", "reached", "touched", "hits", "hitsFront", "hitsSide", "hitsBack", "dmg", "kills", "killFar", "scrap", "scrapKept", "crates", "secs", "shots", "bulletHits", "avgAlive", "maxAlive", "gameMet"];

function num(xs) {
  const n = xs.length;
  if (!n) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const mean = xs.reduce((a, b) => a + b, 0) / n;
  const sd = n > 1 ? Math.sqrt(xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1)) : 0;
  const q = (p) => s[Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))))];
  const r = (v) => +v.toFixed(2);
  return { mean: r(mean), sd: r(sd), se: r(sd / Math.sqrt(n)), median: r(q(0.5)), p10: r(q(0.1)), p90: r(q(0.9)), min: r(s[0]), max: r(s[n - 1]) };
}
/** A rate with its Wilson 95% interval. */
function rate(bs) {
  const n = bs.length;
  if (!n) return null;
  const k = bs.filter(Boolean).length;
  const p = k / n;
  const z = 1.96;
  const den = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / den;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / den;
  const r = (v) => +v.toFixed(3);
  return { rate: r(p), k, n, lo: r(Math.max(0, c - h)), hi: r(Math.min(1, c + h)), se: r(Math.sqrt((p * (1 - p)) / n)) };
}
function summarize(rows) {
  const out = { n: rows.length, metrics: {} };
  for (const k of NUM) out.metrics[k] = num(rows.map((r) => r[k]).filter((v) => typeof v === "number"));
  out.metrics.died = rate(rows.map((r) => r.died));
  const dt = rows.filter((r) => r.died).map((r) => r.deathT);
  out.metrics.deathT = num(dt);
  // the share of rounds fired that hit a walker (a Spread Shot pull fires several)
  const rounds = rows.reduce((a, r) => a + r.shots * (r.bullets || 1), 0);
  out.metrics.hitRate = rounds ? +(rows.reduce((a, r) => a + r.bulletHits, 0) / rounds).toFixed(3) : null;
  out.arrived = rows.every((r) => r.arrived);
  out.wrongTurns = rows.reduce((a, r) => a + (r.wrongTurns || 0), 0);
  out.wallSecs = +rows.reduce((a, r) => a + (r.wall || 0), 0).toFixed(1);
  return out;
}
/** Group rows: cells by danger and day ("d3/day10"), routes by route and day ("base>school/day10"). */
const cellKey = (r) => "d" + r.danger + "/day" + r.day;
const routeKey = (r) => r.route + "/day" + r.day;
function group(rows, keyFn) {
  const m = {};
  for (const r of rows) (m[keyFn(r)] = m[keyFn(r)] || []).push(r);
  const out = {};
  for (const [k, rs] of Object.entries(m)) {
    const s = summarize(rs);
    const r0 = rs[0];
    out[k] = Object.assign({ danger: r0.danger, day: r0.day, engine: r0.engine, hp: r0.hp, vanDamage: r0.vanDamage, loadout: r0.loadout, routes: [...new Set(rs.map((r) => r.route))] }, s);
  }
  return out;
}
module.exports = { num, rate, summarize, group, cellKey, routeKey, NUM };
