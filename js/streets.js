/* Streets: the names of the roads, the side streets between junctions, the road text keys,
   and the drive geometry for a route (lanes, decision points, turn arcs, wrong branches).
   Pure data and math, no DOM, so tests/validate-streets.js can run it in node.
   Map units are the city map's 1000 x 700; world pixels are map units x scale.
   Angles and normals use screen axes (y down): a positive turn is a right turn. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const W = () => ZSR.WORLD;

  /* ---------- Names: one per ROADS pair, keyed "a|b" in the order ROADS lists it ---------- */
  const STREET_NAMES = {
    "base|gasngo": "Oak Street",
    "base|grocery": "Elm Street",
    "gasngo|pharmacy": "Mill Road",
    "gasngo|garden": "Green Lane",
    "grocery|hardware": "Bell Street",
    "hardware|autoshop": "Bolt Street",
    "hardware|radioshack": "Market Street",
    "radioshack|police": "Court Street",
    "radioshack|school": "Pine Street",
    "pharmacy|firehouse": "Ash Street",
    "firehouse|police": "Union Street",
    "firehouse|hospital": "Park Road",
    "garden|watertower": "River Road",
    "watertower|hospital": "Hill Road",
    "hardware|lumberyard": "Cedar Road",
    "lumberyard|mall": "Birch Road",
    "school|mall": "Fox Lane",
    "school|library": "Page Street",
    "police|library": "King Street",
    "base|radioshack": "Main Street",
    "pharmacy|watertower": "Lake Road",
  };

  /* ---------- Side streets: short stubs off a road that go nowhere ----------
     t: how far along road a->b (0..1); side: left or right of a->b. Placed so the lanes for
     every decision on that road fit in both directions (the validator checks every route);
     the shortest roads have none, the longest have two. */
  const SIDE_STREETS = [
    { road: "base|grocery", t: 0.6, side: "right", name: "Mud Lane", kind: "closed" },
    { road: "gasngo|garden", t: 0.55, side: "left", name: "Dock Street", kind: "noThrough" },
    { road: "grocery|hardware", t: 0.4, side: "left", name: "Owl Lane", kind: "deadEnd" },
    { road: "hardware|autoshop", t: 0.6, side: "right", name: "Gate Street", kind: "closed" },
    { road: "hardware|radioshack", t: 0.5, side: "left", name: "Plum Court", kind: "deadEnd" },
    { road: "radioshack|school", t: 0.5, side: "left", name: "Bird Street", kind: "deadEnd" },
    { road: "firehouse|hospital", t: 0.55, side: "right", name: "Mint Street", kind: "noThrough" },
    { road: "garden|watertower", t: 0.35, side: "right", name: "Corn Lane", kind: "deadEnd" },
    { road: "garden|watertower", t: 0.55, side: "left", name: "Frog Lane", kind: "closed" },
    { road: "watertower|hospital", t: 0.45, side: "left", name: "Sand Street", kind: "closed" },
    { road: "watertower|hospital", t: 0.65, side: "right", name: "Wolf Court", kind: "deadEnd" },
    { road: "hardware|lumberyard", t: 0.55, side: "left", name: "Kite Lane", kind: "deadEnd" },
    { road: "lumberyard|mall", t: 0.35, side: "right", name: "Duck Court", kind: "noThrough" },
    { road: "lumberyard|mall", t: 0.6, side: "left", name: "Bee Court", kind: "deadEnd" },
    { road: "school|mall", t: 0.55, side: "left", name: "Moss Lane", kind: "deadEnd" },
    { road: "school|library", t: 0.55, side: "right", name: "Deer Court", kind: "closed" },
    { road: "police|library", t: 0.6, side: "left", name: "Hay Street", kind: "deadEnd" },
    { road: "base|radioshack", t: 0.4, side: "left", name: "Lamp Lane", kind: "noThrough" },
    { road: "base|radioshack", t: 0.6, side: "right", name: "Coal Street", kind: "deadEnd" },
    { road: "pharmacy|watertower", t: 0.55, side: "right", name: "Fern Lane", kind: "deadEnd" },
  ];

  /* ---------- Road text (English defaults). Each reading level writes the same keys in
     ZSR.TEXT[n].road with the same {tokens}; text() falls back to these. ---------- */
  const ROAD_TEXT_FALLBACK = {
    to: "To {dest}", // HUD box: where this drive goes
    here: "You're here", // banner when the van parks at a place
    home: "Home", // banner when the van parks at the cabin
    fog: "Fog", // tags on the start banner
    night: "Night",
    hungry: "Hungry",
    deadEnd: "Dead end", // side street signs, under the street name
    noThrough: "No through road",
    closed: "Road closed",
    lot: "Parking lot", // driveway sign of a place you do not know yet
    hint: "Read the sign. It tells where each lane goes. Pick a lane with A and D.", // first sign of a drive
    wrongWay: "Wrong way! That road goes to {place}.",
    wrongStreet: "Wrong way! That is {street}.",
    wrongSide: "Wrong way! {street} does not go through.",
    wrongPlace: "That is {place}, not {dest}.",
    wrongLot: "That lot is not {dest}.",
    missed: "You drove past {dest}.",
    wrongTitle: "Wrong turn", // the wrong-turn panel: its caption, then its three buttons
    tryAgain: "Try again",
    townMap: "Town map",
    goBack: "Go back to {origin}", // back where the drive set out
    // written directions on the city map, one line per road (directions() below)
    routeHead: "The way there",
    routeTake: "Take {street} to {place}.", // the road's far end is a place you know
    routeTakeStreet: "Take {street}.", // ... a place you do not know yet
    routeStraight: "Stay in your left lane past side streets and other places. Where roads meet, take the lane the sign gives your road.",
    routeLeft: "{dest} is on the left. Move into the turn lane on the far left.",
    routeRight: "{dest} is on the right. Move into the right lane.",
  };

  /* ---------- Geometry (world px unless noted) ---------- */
  const GEOM = {
    lane: 110, // one lane
    half: 220, // half the road: two lanes each way
    shoulder: 26,
    sideHalf: 100, // side streets: one lane each way
    sideLen: 26, // side street length, map units
    turnR: 200, // radius of the route's corner at a junction (the road's center; it sets where lanes stop)
    smallR: 150, // ... and into the destination's lot
    turnWide: 140, // the van's own arc through a junction is at least this wide when the road leaves room
    boxR: 250, // the paved square where roads meet
    stopMin: 300, // stop line before a junction, at least
    turnBack: 170, // stop line before a side street or a driveway
    gap: 100, // clear road after a turn before the next lanes begin
    lotClear: 190, // clear road after a driveway before the next lanes begin
    destBack: 900, // the destination's driveway sits this far before its junction
    destMin: 640, // ... and never closer than this
    startAt: 320, // the van starts this far along the drive out of its place (or out of its junction, for a place with one road)
    firstSign: 1.4, // seconds after the start before the first junction's sign shows (the start banner is gone by then)
    winFirst: 3.5, // seconds of lanes before that first junction
    lotGap: 34, // grass between the road shoulder and a lot
    lotDepth: 340,
    lotHalf: 230, // half the lot's length along the road
    parkIn: 110, // the parking spot, this far into the lot
    winMax: 5.5, // seconds of lanes before a decision, at most
    winMin: 2.5, // ... and at least (the validator holds every route to this)
    lead: 1.8, // seconds the sign shows before its lanes begin
    branchRun: 1700, // a wrong road is driven this far before the fade
    minScale: 30, // px per map unit at base speed (240 px/s): long routes are not squeezed below this
    baseSpeed: 240,
  };

  /* ---------- Small helpers ---------- */
  const pos = (id) => W().LOCATIONS.find((l) => l.id === id);
  function roadKey(a, b) {
    if (STREET_NAMES[a + "|" + b] != null) return a + "|" + b;
    if (STREET_NAMES[b + "|" + a] != null) return b + "|" + a;
    return null;
  }
  function streetName(a, b) {
    const k = roadKey(a, b);
    return k ? STREET_NAMES[k] : "";
  }
  function neighbors(id) {
    const out = [];
    W().ROADS.forEach(([a, b]) => {
      if (a === id) out.push(b);
      else if (b === id) out.push(a);
    });
    return out;
  }
  const angle = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); // signed, from u to v
  const unit = (x, y) => {
    const d = Math.hypot(x, y) || 1;
    return [x / d, y / d];
  };
  function fill(str, tokens) {
    return String(str).replace(/\{(\w+)\}/g, (m, k) => (tokens && tokens[k] != null ? tokens[k] : m));
  }
  /** Road text at the current reading level with {tokens} filled; English if the level lacks it. */
  function text(key, tokens) {
    const t = ZSR.text ? ZSR.text() : null;
    const s = (t && t.road && t.road[key]) || ROAD_TEXT_FALLBACK[key] || key;
    return fill(s, tokens);
  }

  /** Shortest road route (Dijkstra). Returns { path: [ids], dist } in map units, or null. */
  function route(from, to) {
    const graph = {};
    W().ROADS.forEach(([a, b]) => {
      const pa = pos(a);
      const pb = pos(b);
      const d = Math.hypot(pa.x - pb.x, pa.y - pb.y);
      (graph[a] = graph[a] || []).push([b, d]);
      (graph[b] = graph[b] || []).push([a, d]);
    });
    const dist = {};
    const prev = {};
    const done = new Set();
    Object.keys(graph).forEach((k) => (dist[k] = Infinity));
    if (dist[from] == null || dist[to] == null) return null;
    dist[from] = 0;
    while (true) {
      let u = null;
      Object.keys(dist).forEach((k) => {
        if (!done.has(k) && (u == null || dist[k] < dist[u])) u = k;
      });
      if (u == null || dist[u] === Infinity) break;
      if (u === to) break;
      done.add(u);
      (graph[u] || []).forEach(([v, d]) => {
        if (dist[u] + d < dist[v]) {
          dist[v] = dist[u] + d;
          prev[v] = u;
        }
      });
    }
    if (dist[to] === Infinity) return null;
    const path = [to];
    while (path[0] !== from) path.unshift(prev[path[0]]);
    return { path, dist: dist[to] };
  }

  /** Side streets on road a->b, with t and side seen from a. */
  function sideStreetsOn(a, b) {
    const k = roadKey(a, b);
    if (!k) return [];
    const fwd = k === a + "|" + b;
    return SIDE_STREETS.filter((s) => s.road === k)
      .map((s) => Object.assign({}, s, { t: fwd ? s.t : 1 - s.t, side: fwd ? s.side : s.side === "left" ? "right" : "left" }))
      .sort((x, y) => x.t - y.t);
  }
  /** A side street as a map-unit segment: from its road (x0,y0) out to its end (x1,y1). */
  function sideStub(s) {
    const [a, b] = s.road.split("|");
    const pa = pos(a);
    const pb = pos(b);
    const [ux, uy] = unit(pb.x - pa.x, pb.y - pa.y);
    const sg = s.side === "right" ? 1 : -1;
    const x0 = pa.x + (pb.x - pa.x) * s.t;
    const y0 = pa.y + (pb.y - pa.y) * s.t;
    return { x0, y0, x1: x0 - uy * sg * GEOM.sideLen, y1: y0 + ux * sg * GEOM.sideLen };
  }

  /* ---------- Lanes ---------- */
  /** Left edge of our side of the road with n lanes (the road center is 0, right is +). */
  const ourLeft = (n) => GEOM.half - Math.max(2, n) * GEOM.lane;
  const laneCenter = (i, n) => ourLeft(n) + GEOM.lane * (i + 0.5);
  /** Which of n lanes a van at lateral offset d is in (0 = leftmost). */
  function laneOf(d, n) {
    const i = Math.floor((d - ourLeft(n)) / GEOM.lane);
    return Math.max(0, Math.min(n - 1, i));
  }

  /* ---------- Tracks: polylines with arc length ---------- */
  function track() {
    return { xs: [], ys: [], cum: [], len: 0 };
  }
  function push(tr, x, y) {
    const n = tr.xs.length;
    if (n) {
      const d = Math.hypot(x - tr.xs[n - 1], y - tr.ys[n - 1]);
      if (d < 1e-6) return;
      tr.len += d;
    }
    tr.xs.push(x);
    tr.ys.push(y);
    tr.cum.push(tr.len);
  }
  /** Round a corner at (px,py): in along u, out along v, radius r. Pushes the arc and returns its tangent length. */
  function fillet(tr, px, py, ux, uy, vx, vy, r) {
    const a = angle(ux, uy, vx, vy);
    const T = r * Math.tan(Math.abs(a) / 2);
    const ax = px - ux * T;
    const ay = py - uy * T;
    push(tr, ax, ay);
    if (Math.abs(a) < 1e-3) return 0;
    const sg = a > 0 ? 1 : -1;
    const cx = ax - uy * r * sg;
    const cy = ay + ux * r * sg;
    const a0 = Math.atan2(ay - cy, ax - cx);
    const steps = Math.max(2, Math.ceil((Math.abs(a) * r) / 8));
    for (let i = 1; i <= steps; i++) {
      const f = a0 + (a * i) / steps;
      push(tr, cx + Math.cos(f) * r, cy + Math.sin(f) * r);
    }
    return T;
  }
  /** Unit direction of segment i. */
  function dirOf(tr, i) {
    const seg = tr.cum[i + 1] - tr.cum[i] || 1;
    return [(tr.xs[i + 1] - tr.xs[i]) / seg, (tr.ys[i + 1] - tr.ys[i]) / seg];
  }
  /** Point and unit tangent at arc length s (clamped; past the end it runs on along the last tangent).
      Near a vertex the tangent blends into the next segment's, so a point held off to the side of a
      curve (the camera, a van in its lane) glides instead of stepping back at every vertex. */
  function at(tr, s) {
    const n = tr.xs.length;
    if (n < 2) return { x: tr.xs[0] || 0, y: tr.ys[0] || 0, ux: 0, uy: -1 };
    let lo = 0;
    let hi = n - 2;
    if (s <= 0) hi = 0;
    else if (s >= tr.len) lo = hi;
    else {
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (tr.cum[mid] <= s) lo = mid;
        else hi = mid - 1;
      }
    }
    const i = lo;
    const seg = tr.cum[i + 1] - tr.cum[i] || 1;
    const [ux, uy] = dirOf(tr, i);
    const k = s - tr.cum[i];
    let tx = ux;
    let ty = uy;
    const w = Math.min(seg / 2, 6); // blend window at each end of the segment
    const blend = (j, f) => {
      // halfway to the corner's tangent (the mean of both segments) at the vertex itself
      const [vx, vy] = dirOf(tr, j);
      tx = ux + (vx - ux) * f * 0.5;
      ty = uy + (vy - uy) * f * 0.5;
    };
    if (k < w && i > 0 && s > 0) blend(i - 1, 1 - k / w);
    else if (k > seg - w && i < n - 2 && s < tr.len) blend(i + 1, (k - (seg - w)) / w);
    const tl = Math.hypot(tx, ty) || 1;
    return { x: tr.xs[i] + ux * k, y: tr.ys[i] + uy * k, ux: tx / tl, uy: ty / tl };
  }

  /**
   * A van's own path: from (x0,y0) heading (ux,uy) to (ex,ey) heading (vx,vy). Straight, one arc as wide
   * as fits between the two lines, straight again; an S-bend (a cubic curve) when the lines do not meet
   * ahead. The van rides it at offset 0, so its turn is a true arc whatever lane it starts from.
   * The track's `r` is the arc's radius (Infinity when straight).
   */
  function lanePath(x0, y0, ux, uy, ex, ey, vx, vy) {
    const tr = track();
    tr.r = Infinity;
    push(tr, x0, y0);
    const cr = ux * vy - uy * vx;
    const side = (ex - x0) * uy - (ey - y0) * ux; // how far the end sits off the start's line
    if (Math.abs(cr) < 1e-6 && Math.abs(side) < 0.5) {
      push(tr, ex, ey);
      return tr;
    }
    const t = Math.abs(cr) < 1e-6 ? -1 : ((ex - x0) * vy - (ey - y0) * vx) / cr; // along u to where the lines meet
    const X = x0 + ux * t;
    const Y = y0 + uy * t;
    const back = (ex - X) * vx + (ey - Y) * vy; // ... and from there along v to the end
    const a = angle(ux, uy, vx, vy);
    if (t > 3 && back > 3 && Math.abs(a) > 0.02) {
      const T = Math.min(t, back) - 2; // a little straight at each end, so the path leaves and arrives on its lines
      tr.r = T / Math.tan(Math.abs(a) / 2);
      fillet(tr, X, Y, ux, uy, vx, vy, tr.r);
      push(tr, ex, ey);
      return tr;
    }
    // the lines cross behind (or barely bend): ease over with a cubic curve, then a little straight onto the end line
    const fx = ex - vx * 3;
    const fy = ey - vy * 3;
    const L = Math.hypot(fx - x0, fy - y0) / 3;
    const c1x = x0 + ux * L;
    const c1y = y0 + uy * L;
    const c2x = fx - vx * L;
    const c2y = fy - vy * L;
    const steps = Math.max(8, Math.ceil((3 * L) / 8));
    for (let i = 1; i <= steps; i++) {
      const f = i / steps;
      const m = 1 - f;
      push(tr, m * m * m * x0 + 3 * m * m * f * c1x + 3 * m * f * f * c2x + f * f * f * fx, m * m * m * y0 + 3 * m * m * f * c1y + 3 * m * f * f * c2y + f * f * f * fy);
    }
    push(tr, ex, ey);
    return tr;
  }

  /* ---------- World geometry ---------- */
  function distSeg(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / l2));
    return Math.hypot(px - x0 - dx * t, py - y0 - dy * t);
  }
  /** A lot beside the road at turn point (qx,qy), approach (ux,uy), side sg: its four corners. */
  function lotCorners(qx, qy, ux, uy, sg) {
    const G = GEOM;
    const nx = -uy * sg;
    const ny = ux * sg;
    const v0 = G.half + G.shoulder + G.lotGap;
    const v1 = v0 + G.lotDepth;
    return [[-G.lotHalf, v0], [G.lotHalf, v0], [G.lotHalf, v1], [-G.lotHalf, v1]].map(([a, v]) => [qx + ux * a + nx * v, qy + uy * a + ny * v]);
  }
  /** How far a lot keeps from every road and side street but its own road (px; bigger is better).
      The layout already keeps lots clear of their own road's side streets; `skipOwnSides` leaves those out. */
  function lotClearance(drive, own, corners, skipOwnSides) {
    let best = Infinity;
    const pts = corners.slice();
    for (let i = 0; i < 4; i++) {
      const [x0, y0] = corners[i];
      const [x1, y1] = corners[(i + 1) % 4];
      for (let k = 1; k < 4; k++) pts.push([x0 + ((x1 - x0) * k) / 4, y0 + ((y1 - y0) * k) / 4]);
    }
    drive.roads.forEach((r) => {
      if (r.key === own) return;
      pts.forEach(([x, y]) => (best = Math.min(best, distSeg(x, y, r.x0, r.y0, r.x1, r.y1) - GEOM.half - GEOM.shoulder)));
    });
    drive.sides.forEach((s) => {
      if (skipOwnSides && s.road === own) return;
      pts.forEach(([x, y]) => (best = Math.min(best, distSeg(x, y, s.x0, s.y0, s.x1, s.y1) - GEOM.sideHalf - GEOM.shoulder)));
    });
    return best;
  }
  /** Small stable hash for "left or right" choices. */
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  /** Which side of the road a place's lot is on, approached from `from` (+1 right, -1 left). The same for
      every route and van: checked once over the scales and spots the lot can take. */
  const sideCache = {};
  function lotSide(place, from) {
    const key = place + "<" + from;
    if (sideCache[key] != null) return sideCache[key];
    const own = roadKey(from, place);
    const p = pos(place);
    const f = pos(from);
    const [ux, uy] = unit(p.x - f.x, p.y - f.y);
    const worst = (sg) => {
      let m = Infinity;
      [GEOM.minScale, 40, 55].forEach((sc) => {
        const ref = worldOf(sc);
        for (let back = GEOM.destMin; back <= 2000; back += 230) m = Math.min(m, lotClearance(ref, own, lotCorners(p.x * sc - ux * back, p.y * sc - uy * back, ux, uy, sg), true));
      });
      return m;
    };
    const pref = hash(key) % 2 ? 1 : -1;
    const cp = worst(pref);
    sideCache[key] = cp >= 40 || cp >= worst(-pref) ? pref : -pref;
    return sideCache[key];
  }

  /** The way a drive leaves a place: its own drive runs in to its junction (unit vector, heading in) from the
      middle of the widest gap between its roads, so the first turn is a choice too, one lane per road out.
      null for a place with one road (the van starts on that road). */
  function startDir(id) {
    const p = pos(id);
    const angs = neighbors(id)
      .map((nb) => Math.atan2(pos(nb).y - p.y, pos(nb).x - p.x))
      .sort((a, b) => a - b);
    if (angs.length < 2) return null;
    let best = null;
    angs.forEach((a, i) => {
      const b = i + 1 < angs.length ? angs[i + 1] : angs[0] + 2 * Math.PI;
      if (!best || b - a > best.size) best = { size: b - a, mid: (a + b) / 2 };
    });
    return [-Math.cos(best.mid), -Math.sin(best.mid)];
  }
  /** Seconds a drive out of `from` spends on its own drive before the first junction (0 for a place with one road). */
  function startSeconds(from) {
    return from && startDir(from) ? GEOM.firstSign + GEOM.lead + GEOM.winFirst : 0;
  }

  /** Static world: every road and side street at this scale. */
  function worldOf(scale) {
    const roads = W().ROADS.map(([a, b]) => {
      const pa = pos(a);
      const pb = pos(b);
      return { key: a + "|" + b, a, b, name: STREET_NAMES[a + "|" + b], x0: pa.x * scale, y0: pa.y * scale, x1: pb.x * scale, y1: pb.y * scale };
    });
    const sides = SIDE_STREETS.map((s) => {
      const st = sideStub(s);
      return { road: s.road, name: s.name, kind: s.kind, side: s.side, x0: st.x0 * scale, y0: st.y0 * scale, x1: st.x1 * scale, y1: st.y1 * scale };
    });
    const nodes = W().LOCATIONS.map((l) => ({ id: l.id, x: l.x * scale, y: l.y * scale, deg: neighbors(l.id).length }));
    return { roads, sides, nodes };
  }

  /**
   * Build the drive along `path` (location ids). opts: { scale (px per map unit), speed (px/s) }.
   * Returns { scale, speed, path, roads, sides, nodes, lots, track, startS, endS, decisions }.
   * Each decision: { kind: "side" | "lot" | "junction" | "dest", node, stop (s of the stop line on the
   * main track), zoneStart, signAt, n (lanes), lanes (lane -> option index), qx, qy (turn point),
   * ux, uy (approach), options; a junction also has exitS, where its turn ends }.
   * A junction has one lane per road out. The drive begins on the first place's own drive (startDir), so its
   * first decision is that place's junction (a junction with `start: true`); a place with one road starts on it.
   * A side street, a driveway or the destination on the right turns
   * from the right lane; on the left a bay opens (out of the oncoming side) and both our lanes go on.
   * The van keeps to the left lane (laneCenter(0, 2)) unless moved, so left alone it never turns off.
   * Each option: { lane (its first lane), lanes, correct, rel (turn angle), to (place id), street, kind,
   * aim ({ x, y, vx, vy }: where a turn heads, on the center of the road it turns onto), endD (lane offset
   * there; null keeps the van's own), rejoin .. rejoinMax (main-track s where the right turn at a junction
   * may end) }. turnPath() builds the van's actual path from the lane it is in.
   */
  function buildDrive(path, opts) {
    const G = GEOM;
    const scale = opts.scale;
    const v = opts.speed || G.baseSpeed;
    const winMax = G.winMax * v;
    const lead = G.lead * v;
    const drive = Object.assign(worldOf(scale), { scale, speed: v, path: path.slice(), lots: [], decisions: [] });
    const P = path.map((id) => ({ x: pos(id).x * scale, y: pos(id).y * scale }));
    const segs = [];
    for (let i = 0; i < path.length - 1; i++) {
      const L = Math.hypot(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y);
      const [ux, uy] = unit(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y);
      segs.push({ a: path[i], b: path[i + 1], L, ux, uy });
    }
    const last = segs.length - 1;
    // corners at the places in between: the turn the route takes, and the stop line for a junction
    const corner = [];
    for (let i = 1; i < path.length - 1; i++) {
      const s0 = segs[i - 1];
      const s1 = segs[i];
      const T = G.turnR * Math.tan(Math.abs(angle(s0.ux, s0.uy, s1.ux, s1.uy)) / 2);
      const others = neighbors(path[i]).filter((nb) => nb !== path[i - 1]);
      const opts2 = others.map((nb) => {
        const [vx, vy] = unit(pos(nb).x * scale - P[i].x, pos(nb).y * scale - P[i].y);
        const rel = angle(s0.ux, s0.uy, vx, vy);
        return { to: nb, vx, vy, rel, T: G.turnR * Math.tan(Math.abs(rel) / 2) };
      });
      const junction = others.length >= 2;
      const back = junction ? Math.max(G.stopMin, ...opts2.map((o) => o.T + 20)) : Math.max(T, G.boxR);
      corner[i] = { T, junction, back, opts: opts2 };
    }
    // the drive out of the first place: its own drive in to its junction, then one lane per road out
    const sd = startDir(path[0]);
    let start = null;
    if (sd) {
      const [ax, ay] = sd;
      const outs = neighbors(path[0]).map((nb) => {
        const [vx, vy] = unit(pos(nb).x * scale - P[0].x, pos(nb).y * scale - P[0].y);
        const rel = angle(ax, ay, vx, vy);
        return { to: nb, vx, vy, rel, T: G.turnR * Math.tan(Math.abs(rel) / 2) };
      });
      const zone = G.startAt + (G.firstSign + G.lead) * v;
      const stop = zone + G.winFirst * v;
      const len = stop + Math.max(G.stopMin, ...outs.map((o) => o.T + 20));
      const T = G.turnR * Math.tan(Math.abs(angle(ax, ay, segs[0].ux, segs[0].uy)) / 2);
      start = { ux: ax, uy: ay, outs, zone, stop, T, x: P[0].x - ax * len, y: P[0].y - ay * len };
      // drawn on past the van's start, so the road runs off the bottom of the screen
      drive.roads.push({ key: "start|" + path[0], a: null, b: path[0], name: "", start: true, x0: start.x - ax * 900, y0: start.y - ay * 900, x1: P[0].x, y1: P[0].y });
    }

    /* lay out the decisions along each road: positions are offsets from the road's first place */
    const plan = [];
    segs.forEach((sg, i) => {
      const enter = i > 0 ? Math.max(corner[i].T, G.boxR) + G.gap : start ? Math.max(start.T, G.boxR) + G.gap : G.startAt;
      let free = enter;
      const list = [];
      sideStreetsOn(sg.a, sg.b).forEach((ss) => {
        const p = ss.t * sg.L;
        const stop = p - G.turnBack;
        list.push({ kind: "side", p, stop, zone: Math.max(free, stop - winMax), ss });
        free = p + G.sideHalf + G.gap;
      });
      if (i === last) {
        // the destination's driveway: well before its junction, but never short of lanes
        let p = sg.L - G.destBack;
        const want = free + G.winMin * v * 1.4 + G.turnBack;
        if (p < want) p = Math.min(sg.L - G.destMin, want);
        const stop = p - G.turnBack;
        list.push({ kind: "dest", p, stop, zone: Math.max(free, stop - winMax), place: sg.b });
      } else {
        const c = corner[i + 1];
        if (c.junction) {
          const stopJ = sg.L - c.back;
          const total = stopJ - free - G.turnBack - G.lotClear;
          const wj = Math.min(winMax, Math.max(total / 2, total - winMax));
          const wl = Math.min(winMax, total - wj);
          const p = stopJ - wj - G.lotClear;
          list.push({ kind: "lot", p, stop: p - G.turnBack, zone: p - G.turnBack - wl, place: sg.b });
          list.push({ kind: "junction", p: sg.L, stop: stopJ, zone: stopJ - wj, place: sg.b, corner: c });
        } else {
          const p = sg.L - Math.max(c.back, G.boxR) - G.lotClear;
          const stop = p - G.turnBack;
          list.push({ kind: "lot", p, stop, zone: Math.max(free, stop - winMax), place: sg.b });
        }
      }
      plan.push(list);
    });

    /* the main track: the right way, ending in the destination's parking spot */
    const tr = track();
    const segS = []; // s at offset `off` of road i is segS[i].s + (off - segS[i].off)
    if (start) {
      push(tr, start.x, start.y);
      const T = fillet(tr, P[0].x, P[0].y, start.ux, start.uy, segs[0].ux, segs[0].uy, G.turnR);
      push(tr, P[0].x + segs[0].ux * T, P[0].y + segs[0].uy * T);
      segS[0] = { s: tr.len, off: T };
    } else {
      push(tr, P[0].x, P[0].y);
      segS[0] = { s: 0, off: 0 };
    }
    segs.forEach((sg, i) => {
      if (i < last) {
        const nx = segs[i + 1];
        const T = fillet(tr, P[i + 1].x, P[i + 1].y, sg.ux, sg.uy, nx.ux, nx.uy, G.turnR);
        push(tr, P[i + 1].x + nx.ux * T, P[i + 1].y + nx.uy * T);
        segS[i + 1] = { s: tr.len, off: T };
      }
    });
    const sAt = (i, off) => segS[i].s + (off - segS[i].off);

    const parkDepth = G.half + G.shoulder + G.lotGap + G.parkIn;
    // a side street, a driveway or the destination: on the right the right lane turns and the left lane
    // goes on; on the left a bay opens out of the oncoming side and both our lanes go on. The van keeps
    // to the left lane unless the player moves it, so it never turns off by itself.
    const bay = (dec, turn, through, sgn) => {
      dec.options = sgn < 0 ? [turn, through] : [through, turn];
      dec.lanes = sgn < 0 ? [0, 1, 1] : [0, 1];
    };
    const aimOut = (x, y, vx, vy, along) => ({ x: x + vx * along, y: y + vy * along, vx, vy });
    // a real junction: one lane per road out, left to right by the angle of the turn; every turn ends in the left lane
    const roadOptions = (dec, node, id, outs, next) => {
      dec.options = outs
        .slice()
        .sort((x, y) => x.rel - y.rel)
        .map((o) => {
          const correct = o.to === next;
          const opt = { correct, kind: "road", rel: o.rel, to: o.to, street: streetName(id, o.to), aim: aimOut(node.x, node.y, o.vx, o.vy, o.T + (correct ? G.gap : G.branchRun)), endD: laneCenter(0, 2) };
          if (correct) opt.rejoin = dec.exitS + G.gap;
          return opt;
        });
      dec.lanes = dec.options.map((o, k) => k);
    };
    const finish = (dec) => {
      dec.n = dec.lanes.length;
      dec.options.forEach((o, k) => {
        o.lanes = [];
        dec.lanes.forEach((w, lane) => w === k && o.lanes.push(lane));
        o.lane = o.lanes[0];
      });
      // the sign shows a little before its lanes begin (never before the last decision's stop line)
      dec.signAt = dec.zoneStart - lead;
      drive.decisions.push(dec);
    };
    if (start) {
      const dec = { kind: "junction", node: path[0], start: true, qx: P[0].x, qy: P[0].y, ux: start.ux, uy: start.uy, road: null, stop: start.stop, zoneStart: start.zone, exitS: segS[0].s, options: [] };
      roadOptions(dec, P[0], path[0], start.outs, path[1]);
      finish(dec);
    }

    plan.forEach((list, i) => {
      const sg = segs[i];
      const A = P[i];
      list.forEach((d) => {
        const qx = A.x + sg.ux * d.p;
        const qy = A.y + sg.uy * d.p;
        const dec = { kind: d.kind, node: d.place || null, qx, qy, ux: sg.ux, uy: sg.uy, road: roadKey(sg.a, sg.b), stop: sAt(i, d.stop), zoneStart: sAt(i, d.zone), options: [] };
        if (d.kind === "side") {
          const sgn = d.ss.side === "right" ? 1 : -1;
          const stubLen = G.sideLen * scale;
          dec.side = d.ss;
          const turn = { correct: false, kind: "side", rel: (sgn * Math.PI) / 2, street: d.ss.name, sideKind: d.ss.kind, aim: aimOut(qx, qy, -sg.uy * sgn, sg.ux * sgn, stubLen - 140), endD: G.sideHalf / 2 };
          bay(dec, turn, { correct: true, kind: "through", rel: 0 }, sgn);
        } else if (d.kind === "lot" || d.kind === "dest") {
          const sgn = lotSide(d.place, sg.a);
          const lot = { node: d.place, from: sg.a, qx, qy, ux: sg.ux, uy: sg.uy, side: sgn, dest: d.kind === "dest", corners: lotCorners(qx, qy, sg.ux, sg.uy, sgn) };
          drive.lots.push(lot);
          dec.lot = lot;
          const isDest = d.kind === "dest";
          const turn = { correct: isDest, kind: "lot", rel: (sgn * Math.PI) / 2, to: d.place, aim: aimOut(qx, qy, -sg.uy * sgn, sg.ux * sgn, parkDepth), endD: 0 };
          let through;
          if (isDest) {
            through = { correct: false, kind: "miss", rel: 0, to: d.place, aim: aimOut(P[i + 1].x, P[i + 1].y, sg.ux, sg.uy, G.branchRun), endD: null };
            // the main track runs on into the lot to the parking spot (its length is the drive's; the van rides turnPath)
            const T = fillet(tr, qx, qy, sg.ux, sg.uy, -sg.uy * sgn, sg.ux * sgn, G.smallR);
            push(tr, qx - sg.uy * sgn * T, qy + sg.ux * sgn * T);
            push(tr, qx - sg.uy * sgn * parkDepth, qy + sg.ux * sgn * parkDepth);
          } else through = { correct: true, kind: "through", rel: 0 };
          bay(dec, turn, through, sgn);
        } else {
          dec.exitS = segS[i + 1].s; // where the turn ends and the next road runs straight
          roadOptions(dec, P[i + 1], path[i + 1], d.corner.opts, path[i + 2]);
        }
        finish(dec);
      });
    });
    drive.decisions.forEach((d, k) => {
      const prev = drive.decisions[k - 1];
      d.signAt = Math.max(d.signAt, prev ? prev.stop + 1 : G.startAt);
      // the right turn at a junction may run on as far as the next lanes, for a wide enough arc
      if (d.kind === "junction") d.options.forEach((o) => o.correct && (o.rejoinMax = Math.max(o.rejoin, drive.decisions[k + 1].zoneStart)));
    });
    drive.track = tr;
    drive.startS = G.startAt;
    drive.endS = tr.len;
    return drive;
  }

  /**
   * The path a van at lane offset d on a decision's stop line drives for option `opt` (not a straight-on
   * "through"): its own line, one arc from its lane to the lane it ends in. Returns { track (the van rides
   * it at offset 0), d1 (its lane offset on the road it turned onto), rejoin (main-track s where it ends,
   * the right way at a junction only), r (the arc's radius) }.
   */
  function turnPath(drive, dec, opt, d) {
    const p = at(drive.track, dec.stop);
    const x0 = p.x - dec.uy * d;
    const y0 = p.y + dec.ux * d;
    const d1 = opt.endD == null ? d : opt.endD;
    const to = (a) => lanePath(x0, y0, dec.ux, dec.uy, a.x - a.vy * d1, a.y + a.vx * d1, a.vx, a.vy);
    if (opt.rejoin == null) {
      const tr = to(opt.aim);
      return { track: tr, d1, rejoin: null, r: tr.r };
    }
    // the right way at a junction ends back on the route's next road: as soon after the corner as the arc is wide
    let best = null;
    for (let s = opt.rejoin; ; s += 20) {
      s = Math.min(s, opt.rejoinMax == null ? s : opt.rejoinMax);
      const m = at(drive.track, s);
      const tr = to({ x: m.x, y: m.y, vx: m.ux, vy: m.uy });
      if (!best || tr.r > best.r) best = { track: tr, d1, rejoin: s, r: tr.r };
      if (tr.r >= GEOM.turnWide || opt.rejoinMax == null || s >= opt.rejoinMax) break;
    }
    return best;
  }

  /** Which side of the road the destination's lot is on at the end of a route (+1 right, -1 left). */
  function destSide(path) {
    return lotSide(path[path.length - 1], path[path.length - 2]);
  }
  /** Written directions for a route at the reading level: a line per road (its far end named when the
      player knows it, which is also what the junction sign shows), then which lane to take at the end.
      known(id) and nameOf(id) come from the game. */
  function directions(path, known, nameOf) {
    const out = [];
    for (let i = 0; i < path.length - 1; i++) {
      const street = streetName(path[i], path[i + 1]);
      const to = path[i + 1];
      out.push(known(to) || i === path.length - 2 ? text("routeTake", { street, place: nameOf(to) }) : text("routeTakeStreet", { street }));
    }
    out.push(text("routeStraight"));
    out.push(text(destSide(path) > 0 ? "routeRight" : "routeLeft", { dest: nameOf(path[path.length - 1]) }));
    return out;
  }

  /** px per map unit for a route: its roads take about `seconds` at `speed` (from a little out of the first junction
      to parking before the last one), never squeezed below minScale. The drive out of a place with two roads or
      more comes on top (startSeconds). */
  function scaleFor(dist, seconds, speed) {
    const v = speed || GEOM.baseSpeed;
    return Math.max((GEOM.minScale * v) / GEOM.baseSpeed, (seconds * v + GEOM.startAt + GEOM.destBack * 0.5) / Math.max(1, dist));
  }

  ZSR.Streets = {
    STREET_NAMES,
    SIDE_STREETS,
    ROAD_TEXT_FALLBACK,
    GEOM,
    roadKey,
    streetName,
    neighbors,
    route,
    sideStreetsOn,
    sideStub,
    ourLeft,
    laneCenter,
    laneOf,
    track,
    push,
    at,
    lanePath,
    buildDrive,
    turnPath,
    lotSide,
    startDir,
    startSeconds,
    destSide,
    directions,
    scaleFor,
    worldOf,
    fill,
    text,
    hash,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
