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
    "garden|frog": "River Road", // River Road runs on through the Frog Lane corner to the Water Tower
    "frog|watertower": "River Road",
    "watertower|hospital": "Hill Road",
    "hardware|lumberyard": "Cedar Road",
    "lumberyard|mall": "Birch Road",
    "school|mall": "Fox Lane",
    "school|library": "Page Street",
    "police|library": "King Street",
    "base|radioshack": "Main Street",
    "pharmacy|watertower": "Lake Road",
    "frog|river": "Frog Lane",
  };
  /* Roads that are not paved all the way: the share of the road (from its first place) that is still
     asphalt; past it the road is dirt (drawn so on the road and the map). */
  const SURFACE = { "frog|river": { paved: 0.18 } }; // just past the corner the asphalt gives out

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
    { road: "garden|frog", t: 0.55, side: "right", name: "Corn Lane", kind: "deadEnd" },
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
    lot: "Parking lot", // sign lane for the drive of a place you do not know yet
    hint: "Read the sign. It tells where each lane goes. Pick a lane with A and D.", // first sign of a drive
    wrongWay: "Wrong way! That road goes to {place}.",
    wrongStreet: "Wrong way! That is {street}.",
    wrongSide: "Wrong way! {street} does not go through.",
    wrongPlace: "That is {place}, not {dest}.",
    wrongLot: "That lot is not {dest}.",
    wrongTitle: "Wrong turn", // the wrong-turn panel: its caption, then its three buttons
    tryAgain: "Try again",
    townMap: "Town map",
    goBack: "Go back to {origin}", // back where the drive set out
    // written directions on the city map, one line per road (directions() below)
    routeHead: "The way there",
    routeTake: "Take {street} to {place}.", // the road's far end is a place you know
    routeTakeStreet: "Take {street}.", // ... a place you do not know yet
    routeStraight: "Stay in your left lane past side streets. Where roads meet, the sign has a lane for each road and one for the drive of the place there: take the lane the sign gives your road.",
    routeDrive: "At {dest}, take the lane for its drive. It ends at the door.", // a place with its own drive off its corner
    routeEnd: "{dest} is at the end of {street}. Drive to the end.", // a place at the end of its one road
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
    startAt: 320, // the van starts this far out of its parking spot
    firstSign: 1.4, // seconds after the start before the first junction's sign shows (the start banner is gone by then)
    winFirst: 3.5, // seconds of lanes before that first junction
    lotGap: 34, // grass between the end of a drive's paving and its lot
    lotDepth: 340,
    lotHalf: 230, // half the lot's length along the road
    parkIn: 110, // the parking spot, this far into the lot
    endPad: 450, // the drive time a route's scale leaves for the start and the end (scaleFor)
    winMax: 5.5, // seconds of lanes before a decision, at most
    winMin: 2.5, // ... and at least (the validator holds every route to this)
    lead: 1.8, // seconds the sign shows before its lanes begin
    branchRun: 1700, // a wrong road is driven this far before the fade
    minScale: 30, // px per map unit at base speed (240 px/s): long routes are not squeezed below this
    baseSpeed: 240,
  };

  /* ---------- Small helpers ---------- */
  const pos = (id) => W().place(id); // a place, or a junction where roads meet with no place
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
  /** A lot at the end of a drive (its paving ends at (ex,ey), heading out (ox,oy)): the frame Draw.lot takes
      ({ qx, qy, ux, uy, side }: x along the lot's front, y away from the drive) and its four corners. */
  function endLot(ex, ey, ox, oy) {
    const G = GEOM;
    const qx = ex - ox * G.half;
    const qy = ey - oy * G.half;
    const v0 = G.half + G.shoulder + G.lotGap;
    const v1 = v0 + G.lotDepth;
    const corners = [[-G.lotHalf, v0], [G.lotHalf, v0], [G.lotHalf, v1], [-G.lotHalf, v1]].map(([a, v]) => [qx + oy * a + ox * v, qy - ox * a + oy * v]);
    return { qx, qy, ux: oy, uy: -ox, side: 1, corners };
  }
  /** Small stable hash for "left or right" choices. */
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }

  /** The way a drive leaves a place: its own drive runs in to its corner (unit vector, heading in) from the
      middle of the widest gap between its roads, so the first turn is a choice too, one lane per road out.
      null for a place with one road (its building is at the end of that road, and the van starts on it). */
  function startDir(id) {
    if (W().isJunction(id)) return null;
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
  /** The way out of a place to its building (unit, map axes): down its own drive (against startDir), or on along
      its one road. null for a bare corner. */
  function outDir(id) {
    if (W().isJunction(id) || !neighbors(id).length) return null;
    const sd = startDir(id);
    if (sd) return [-sd[0], -sd[1]];
    const p = pos(id);
    const q = pos(neighbors(id)[0]);
    return unit(p.x - q.x, p.y - q.y);
  }
  /** How long a place's own drive is (px, its corner to its parking spot) for a van at speed v: long enough
      for the sign and the lanes of the first turn out (0 for a place with one road). The same drive the van
      turns onto to park there, and passes at that corner on the way somewhere else. */
  function driveLen(id, v) {
    const sd = startDir(id);
    if (!sd) return 0;
    const p = pos(id);
    const T = neighbors(id).map((nb) => {
      const [vx, vy] = unit(pos(nb).x - p.x, pos(nb).y - p.y);
      return GEOM.turnR * Math.tan(Math.abs(angle(sd[0], sd[1], vx, vy)) / 2) + 20;
    });
    return GEOM.startAt + (GEOM.firstSign + GEOM.lead + GEOM.winFirst) * v + Math.max(GEOM.stopMin, ...T);
  }
  /** From the end of a drive's paving to the parking spot in its lot. */
  const PARK_IN = GEOM.shoulder + GEOM.lotGap + GEOM.parkIn;
  /** River Landing: Frog Lane runs out at the water's edge; the van parks this far short of it. */
  const RIVER_BACK = 190;
  /** Where a place's building is, in world px at this scale and speed: { id, x, y (its corner, or its road's
      end), ox, oy (out to the building), len (its drive; 0 with one road), ex, ey (where the paving ends),
      park ({ x, y }: the parking spot, where a drive starts and ends), lot (Draw.lot's frame, and corners) }.
      River Landing has no building: its dirt road runs out at the water's edge (the place's spot on the map), and
      the van parks just short of it. */
  function endOf(id, scale, v) {
    const o = outDir(id);
    if (!o) return null;
    const [ox, oy] = o;
    const p = pos(id);
    const x = p.x * scale;
    const y = p.y * scale;
    const len = driveLen(id, v);
    const ex = x + ox * Math.max(0, len - PARK_IN);
    const ey = y + oy * Math.max(0, len - PARK_IN);
    const river = p.type === "river";
    const park = river ? { x: x - ox * RIVER_BACK, y: y - oy * RIVER_BACK } : { x: ex + ox * PARK_IN, y: ey + oy * PARK_IN };
    const lot = Object.assign(endLot(ex, ey, ox, oy), { node: id, river });
    return { id, x, y, ox, oy, len, ex, ey, park, lot };
  }
  /** Seconds a drive out of `from` spends on its own drive before the first corner (0 for a place with one road). */
  function startSeconds(from) {
    return from && startDir(from) ? GEOM.firstSign + GEOM.lead + GEOM.winFirst : 0;
  }
  /** Seconds a drive to `to` spends on its own drive after the last corner (0 for a place with one road). */
  function endSeconds(to, v) {
    const sp = v || GEOM.baseSpeed;
    return to ? driveLen(to, sp) / sp : 0;
  }

  /** Static world at this scale for a van at speed v: every road, every place's own drive (a road with
      drive: true, a = its place, b = null), every side street, every corner, and where each building is. */
  function worldOf(scale, v) {
    const sp = v || GEOM.baseSpeed;
    const roads = W().ROADS.map(([a, b]) => {
      const pa = pos(a);
      const pb = pos(b);
      return { key: a + "|" + b, a, b, name: STREET_NAMES[a + "|" + b], x0: pa.x * scale, y0: pa.y * scale, x1: pb.x * scale, y1: pb.y * scale };
    });
    roads.forEach((r) => {
      const sf = SURFACE[r.key];
      if (sf) r.paved = sf.paved; // past this share of its length the road is dirt
      if (W().place(r.b).type === "river") r.toRiver = true; // it runs out at the water
    });
    const ends = W()
      .LOCATIONS.map((l) => endOf(l.id, scale, sp))
      .filter(Boolean);
    ends.forEach((e) => {
      if (e.len) roads.push({ key: "drive|" + e.id, a: e.id, b: null, drive: true, name: "", x0: e.x, y0: e.y, x1: e.ex, y1: e.ey });
    });
    const sides = SIDE_STREETS.map((s) => {
      const st = sideStub(s);
      return { road: s.road, name: s.name, kind: s.kind, side: s.side, x0: st.x0 * scale, y0: st.y0 * scale, x1: st.x1 * scale, y1: st.y1 * scale };
    });
    const nodes = W()
      .LOCATIONS.concat(W().JUNCTIONS || [])
      .map((l) => ({ id: l.id, x: l.x * scale, y: l.y * scale, deg: neighbors(l.id).length + (startDir(l.id) ? 1 : 0), junction: !!(W().isJunction && W().isJunction(l.id)), water: l.type === "river" }));
    return { roads, sides, nodes, ends, lots: ends.map((e) => e.lot) };
  }

  /**
   * Build the drive along `path` (location ids). opts: { scale (px per map unit), speed (px/s) }.
   * Returns { scale, speed, path, roads, sides, nodes, ends, lots, track, startS, endS, decisions }.
   * Every place's building is at the end of its own drive, off its corner (a place with one road: at the end
   * of that road). The drive starts in the first place's parking spot and ends in the last one's.
   * Each decision: { kind: "side" | "junction" | "dest", node, stop (s of the stop line on the main track),
   * zoneStart, signAt, n (lanes), lanes (lane -> option index), qx, qy (turn point), ux, uy (approach),
   * options; a junction also has exitS, where its turn ends }.
   * A junction has one lane per way out: each road, and at a place its own drive (the wrong way unless it is
   * where the drive goes). Out of the first place, its first decision is that place's corner (`start: true`).
   * "dest" is the last place's corner, where its drive is the right way; a place with one road has none (the
   * road runs on to it). A side street on the right turns from the right lane; on the left a bay opens (out of
   * the oncoming side) and both our lanes go on. The van keeps to the left lane (laneCenter(0, 2)) unless moved,
   * so left alone it never turns off.
   * Each option: { lane (its first lane), lanes, correct, rel (turn angle), to (place id), street, kind ("road",
   * "drive", "side" or "through"), aim ({ x, y, vx, vy }: where a turn heads, on the center of the road it turns
   * onto), endD (lane offset there; null keeps the van's own), rejoin .. rejoinMax (main-track s where the right
   * turn at a junction may end) }. turnPath() builds the van's actual path from the lane it is in.
   */
  function buildDrive(path, opts) {
    const G = GEOM;
    const scale = opts.scale;
    const v = opts.speed || G.baseSpeed;
    const winMax = G.winMax * v;
    const lead = G.lead * v;
    const drive = Object.assign(worldOf(scale, v), { scale, speed: v, path: path.slice(), decisions: [] });
    const endAt = {};
    drive.ends.forEach((e) => (endAt[e.id] = e));
    const first = endAt[path[0]];
    const dest = endAt[path[path.length - 1]];
    first.lot.origin = true;
    dest.lot.dest = true;
    const P = path.map((id) => ({ x: pos(id).x * scale, y: pos(id).y * scale }));
    const segs = [];
    for (let i = 0; i < path.length - 1; i++) {
      const L = Math.hypot(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y);
      const [ux, uy] = unit(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y);
      segs.push({ a: path[i], b: path[i + 1], L, ux, uy });
    }
    const last = segs.length - 1;
    // the ways out of a corner, coming in along (ux,uy): every road but the one in, and a place's own drive
    const waysOut = (i, ux, uy) => {
      const id = path[i];
      const outs = neighbors(id)
        .filter((nb) => nb !== path[i - 1])
        .map((nb) => {
          const [vx, vy] = unit(pos(nb).x * scale - P[i].x, pos(nb).y * scale - P[i].y);
          return { to: nb, kind: "road", vx, vy };
        });
      if (i > 0 && endAt[id] && endAt[id].len) outs.push({ to: id, kind: "drive", vx: endAt[id].ox, vy: endAt[id].oy });
      outs.forEach((o) => {
        o.rel = angle(ux, uy, o.vx, o.vy);
        o.T = G.turnR * Math.tan(Math.abs(o.rel) / 2);
      });
      return outs;
    };
    // the corners the route turns at: every place in between, and the last place if it has a drive
    const corner = [];
    for (let i = 1; i < path.length; i++) {
      const s0 = segs[i - 1];
      const outs = waysOut(i, s0.ux, s0.uy);
      if (!outs.length) continue; // the end of a road with one place on it
      const s1 = i < path.length - 1 ? segs[i] : { ux: dest.ox, uy: dest.oy };
      const T = G.turnR * Math.tan(Math.abs(angle(s0.ux, s0.uy, s1.ux, s1.uy)) / 2);
      corner[i] = { T, back: Math.max(G.stopMin, ...outs.map((o) => o.T + 20)), opts: outs };
    }
    // the drive out of the first place: from its parking spot up its own drive to its corner, then one lane per road out
    const sd = startDir(path[0]);
    let start = null;
    if (sd) {
      const [ax, ay] = sd;
      const zone = G.startAt + (G.firstSign + G.lead) * v;
      const stop = zone + G.winFirst * v;
      const T = G.turnR * Math.tan(Math.abs(angle(ax, ay, segs[0].ux, segs[0].uy)) / 2);
      start = { ux: ax, uy: ay, outs: waysOut(0, ax, ay), zone, stop, T };
    }

    // with one road out, the van starts on it: the parking spot is this far along it from the place (River
    // Landing's is on the road itself, short of the water; a building's is behind, in its lot)
    const parkOff = (first.park.x - P[0].x) * segs[0].ux + (first.park.y - P[0].y) * segs[0].uy;

    /* lay out the decisions along each road: positions are offsets from the road's first place */
    const plan = [];
    segs.forEach((sg, i) => {
      const enter = i > 0 ? Math.max(corner[i].T, G.boxR) + G.gap : start ? Math.max(start.T, G.boxR) + G.gap : Math.max(G.startAt, parkOff + G.startAt + G.gap);
      let free = enter;
      const list = [];
      sideStreetsOn(sg.a, sg.b).forEach((ss) => {
        const p = ss.t * sg.L;
        const stop = p - G.turnBack;
        list.push({ kind: "side", p, stop, zone: Math.max(free, stop - winMax), ss });
        free = p + G.sideHalf + G.gap;
      });
      const c = corner[i + 1];
      if (c) {
        const stopJ = sg.L - c.back;
        list.push({ kind: i === last ? "dest" : "junction", p: sg.L, stop: stopJ, zone: Math.max(free, stopJ - winMax), place: sg.b, corner: c });
      }
      plan.push(list);
    });

    /* the main track: the right way, from the first parking spot to the last */
    const tr = track();
    const segS = []; // s at offset `off` of road i is segS[i].s + (off - segS[i].off)
    push(tr, first.park.x, first.park.y);
    if (start) {
      const T = fillet(tr, P[0].x, P[0].y, start.ux, start.uy, segs[0].ux, segs[0].uy, G.turnR);
      push(tr, P[0].x + segs[0].ux * T, P[0].y + segs[0].uy * T);
      segS[0] = { s: tr.len, off: T };
    } else if (parkOff < 0) {
      push(tr, P[0].x, P[0].y); // out of the lot at the end of the road, onto it
      segS[0] = { s: tr.len, off: 0 };
    } else segS[0] = { s: 0, off: parkOff }; // already on the road
    segs.forEach((sg, i) => {
      const n = P[i + 1];
      if (i < last) {
        const nx = segs[i + 1];
        const T = fillet(tr, n.x, n.y, sg.ux, sg.uy, nx.ux, nx.uy, G.turnR);
        push(tr, n.x + nx.ux * T, n.y + nx.uy * T);
        segS[i + 1] = { s: tr.len, off: T };
      } else {
        // the last corner: down its drive into the lot (or on to the end of the road)
        if (dest.len) fillet(tr, n.x, n.y, sg.ux, sg.uy, dest.ox, dest.oy, G.turnR);
        else if ((dest.park.x - n.x) * sg.ux + (dest.park.y - n.y) * sg.uy > 0) push(tr, n.x, n.y); // on into the lot past the road's end
        push(tr, dest.park.x, dest.park.y);
      }
    });
    const sAt = (i, off) => segS[i].s + (off - segS[i].off);

    const bay = (dec, turn, through, sgn) => {
      dec.options = sgn < 0 ? [turn, through] : [through, turn];
      dec.lanes = sgn < 0 ? [0, 1, 1] : [0, 1];
    };
    const aimOut = (x, y, vx, vy, along) => ({ x: x + vx * along, y: y + vy * along, vx, vy });
    // a corner: one lane per way out, left to right by the angle of the turn; a turn onto a road ends in its
    // left lane, a turn onto a drive goes on to its parking spot
    const roadOptions = (dec, node, id, outs, want) => {
      dec.options = outs
        .slice()
        .sort((x, y) => x.rel - y.rel)
        .map((o) => {
          const correct = o.to === want;
          if (o.kind === "drive") {
            const e = endAt[o.to];
            return { correct, kind: "drive", rel: o.rel, to: o.to, street: "", aim: { x: e.park.x, y: e.park.y, vx: e.ox, vy: e.oy }, endD: 0 };
          }
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
        } else {
          if (d.kind === "junction") dec.exitS = segS[i + 1].s; // where the turn ends and the next road runs straight
          roadOptions(dec, P[i + 1], path[i + 1], d.corner.opts, d.kind === "dest" ? path[i + 1] : path[i + 2]);
        }
        finish(dec);
      });
    });
    drive.decisions.forEach((d, k) => {
      const prev = drive.decisions[k - 1];
      d.signAt = Math.max(d.signAt, prev ? prev.stop + 1 : G.startAt);
      // the right turn at a junction may run on as far as the next lanes (or near the end of the road), for a wide enough arc
      const next = drive.decisions[k + 1];
      if (d.kind === "junction") d.options.forEach((o) => o.correct && (o.rejoinMax = Math.max(o.rejoin, next ? next.zoneStart : tr.len - G.startAt)));
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

  /** The place a road out of `from` toward `to` leads to: through a bare corner it runs on along the same
      street (River Road through the Frog Lane corner goes on to the Water Tower). */
  function farPlace(from, to) {
    let a = from;
    let b = to;
    for (let guard = 0; guard < 8 && W().isJunction(b); guard++) {
      const street = streetName(a, b);
      const pb = pos(b);
      const [ux, uy] = unit(pb.x - pos(a).x, pb.y - pos(a).y);
      const outs = neighbors(b).filter((n) => n !== a);
      const same = outs.filter((n) => streetName(b, n) === street);
      // the same street on, else the straightest way on
      const pick = (same.length ? same : outs).map((n) => {
        const [vx, vy] = unit(pos(n).x - pb.x, pos(n).y - pb.y);
        return { n, bend: Math.abs(angle(ux, uy, vx, vy)) };
      }).sort((p, q) => p.bend - q.bend)[0];
      if (!pick) break;
      a = b;
      b = pick.n;
    }
    return b;
  }

  /** Written directions for a route at the reading level: a line per road (its far end named when the
      player knows it, which is also what the junction sign shows), the line on lanes, then how it ends: the
      lane for the place's drive at its corner, or the end of its road. known(id) and nameOf(id) come from the game. */
  function directions(path, known, nameOf) {
    const out = [];
    for (let i = 0; i < path.length - 1; i++) {
      const street = streetName(path[i], path[i + 1]);
      const to = path[i + 1];
      // a bare corner has no name: the line names the street alone
      const isPlace = !W().isJunction(to);
      out.push(isPlace && (known(to) || i === path.length - 2) ? text("routeTake", { street, place: nameOf(to) }) : text("routeTakeStreet", { street }));
    }
    out.push(text("routeStraight"));
    const to = path[path.length - 1];
    out.push(startDir(to) ? text("routeDrive", { dest: nameOf(to) }) : text("routeEnd", { dest: nameOf(to), street: streetName(path[path.length - 2], to) }));
    return out;
  }

  /** px per map unit for a route: its roads take about `seconds` at `speed` (corner to corner), never squeezed
      below minScale. The drives out of the first place and into the last come on top (startSeconds, endSeconds). */
  function scaleFor(dist, seconds, speed) {
    const v = speed || GEOM.baseSpeed;
    return Math.max((GEOM.minScale * v) / GEOM.baseSpeed, (seconds * v + GEOM.startAt + GEOM.endPad) / Math.max(1, dist));
  }

  ZSR.Streets = {
    STREET_NAMES,
    SIDE_STREETS,
    SURFACE,
    farPlace,
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
    startDir,
    outDir,
    driveLen,
    endOf,
    startSeconds,
    endSeconds,
    directions,
    scaleFor,
    worldOf,
    fill,
    text,
    hash,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
