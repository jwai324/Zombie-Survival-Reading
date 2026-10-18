/* Model sprites: still 3D models (js/model3d.js) standing in the first-person view (js/interior.js), mixed into
   ZSR.Interior the way js/yard.js is. The parked van in the yard and at River Landing now (js/yard.js and js/river.js
   add it where they read the V tiles); every yard prop, sign and animal later: a mode adds an instance to
   this.models and the renderer does the rest.

   An instance (modelAdd, after loadGrid; the list starts empty on every new grid):
     kind    a name ("van")
     x, y    where the model's origin stands, world tiles (the van: the middle of its footprint)
     rot     the way the model's +y (its nose) points, in the world's own angle convention, the player's p.a: 0 east
             (+x), PI / 2 south (+y, down the grid), -PI / 2 north, PI west; a direction is (cos rot, sin rot). Its +x
             (its right) is then (-sin rot, cos rot), its right hand as it faces that way, so it is never mirrored
     scale   tiles per model unit (the van: 1 / 62.5, the road's units a tile)
     foot    the convex footprint polygon, [[x, y], ...] in world tiles: what sorts it against walkers, props and low
             runs, and what the walls in front of it clip, column by column
     tiles   grid tiles ([[x, y], ...]) the raycaster leaves for the model to draw (the van's V tiles: still solid and
             in OPAQUE for sight, shots, walkers, wreck spots, E at the van, the map and the crew's posts; only their
             wall faces and the floor's special case are gone)
     mesh()  { mesh, sig } for this frame: the Model3D model and a string that changes whenever it looks different
             (the van: Van3D.mesh / Van3D.sig of the save's upgrades, its dents now and the roof gun)

   THE PICTURE. Each instance on screen has a pooled canvas (modelPool, like the live walkers' pool) holding a picture
   drawn by Model3D.draw from the player's eye (x, y, 0.5 tiles up) looking level at the middle of the model's visible
   angular range: its bounding box's bearings, cut to the view's width +- MODEL_MARGIN, padded by MODEL_PAD. The
   picture camera projects as the screen does, squashed sideways the same way (a tile of floor is STRETCH times
   narrower than a wall is tall), so the model sits on its tiles and matches the walls beside it (walkers are drawn
   unsquashed; models are not figures): X = axis + Fx tan(a), Y = horizon + Fy (0.5 - z) / depth, Fx = k H / STRETCH,
   Fy = k H, k <= 1 (the picture's larger side at most the governor row's px: MODEL_MAX_PX on its starting row).
   It is lit as the walls are: x-facing faces full, y-facing ones LIGHT_Y (drawFace's 0.12 darker), tops a little
   brighter, undersides darker; fogged toward black as a wall at its distance (min(fogMax, d fogK)), in steps.

   ON SCREEN (modelMap). Drawn from the eye it stands at now, the two cameras differ only by yaw, so each screen column
   maps to one picture column and one vertical scale: tan(a_s) = (x - W / 2) STRETCH / H, the world angle w =
   heading + a_s, the picture angle a_p = w - axis, X = axis + Fx tan(a_p), v = (1 / k) cos(a_p) / cos(a_s); picture
   row r goes to screen y = H / 2 + (r - horizon) v. Turning in place keeps that map exact: turning never redraws a
   model drawn whole. Once the eye has moved since the picture was drawn, the ray through a column meets the model's
   box (the stand-in for its surface) at a point, and that point seen from the old eye gives the column and the two
   depths the height: exact for whatever lies on the box's sides (a van is mostly its box), where scaling the angles
   about the model's bearing by d / d0 (and the height by d0 / d) let the van slide on the floor by up to 10 or 20 px
   between redraws (that scaling stays for an eye inside the box). A face the old picture never saw (edge-on then,
   turned toward you since) makes the map run backward: it is drawn again ("fold").
   Drawn in strips of at most MODEL_STRIP columns, the map straight across a strip (its two edges exact, v from its
   middle); a strip ends sooner where v drifts by more than MODEL_SEAM_PX over the picture or the map bends (a corner
   of the box), so neighbouring strips meet without a seam. A column a nearer wall cuts, or an opening's top trims,
   goes on its own, as drawSpriteCol does.

   DEPTH. Every strip is its own entry in drawScene's painter's list, with its own depth: where the strip's middle ray
   first meets the footprint (else the nearest any ray of the strip meets, else the nearest footprint corner). So a
   walker in front of the van's near end but behind its far end sorts right column by column, walls clip each strip
   at its own depth, and the low runs (the fence) go in between as for any sprite.

   REDRAWS. A picture is drawn again when it was never drawn; its sig changed (paint, gear, dents); the bearing from
   the model to the eye moved more than clamp(MODEL_DRIFT_PX / its half-width on screen, MODEL_ANGLE_MIN,
   MODEL_ANGLE_MAX); the distance changed more than MODEL_DIST; its columns now are not all in the picture; it grew on
   screen past MODEL_GROW of a fresh picture; a face it never saw shows (MODEL_FOLD_COLS); its fog step or detail
   changed. The governor: at most the row's `max` redraws a frame (MODEL_RENDERS_MAX on the starting row; MODEL_LEVELS,
   one row per LIVE_LEVELS row: the walkers' governor steps both, and the floor's slow-machine step takes one row
   more); a picture never drawn draws at once (past the cap at the coarsest detail, its own detail on its turn); the
   rest by size on screen and how long they have waited. A canvas not shown for MODEL_IDLE frames goes back to the
   spares; every one goes on a new grid and on leaving the scene. this.modelStats: the last frame's models shown,
   redraws, strips and ms, the redraws so far and why (tests and perf probes). A health bar over a walker hidden
   behind a model is not drawn (modelHides). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const I = ZSR.Interior;
  if (!I) return;
  const M3 = () => ZSR.Model3D;
  const State = () => ZSR.State;

  const MODEL_MARGIN = 0.16; // SCALE: radians drawn past each side of the view (about 9 degrees: small turns need no redraw)
  const MODEL_PAD = 0.12; // a picture's angular range is padded by this share of its half-width each side (a moving eye's silhouette)
  const MODEL_HALF_MAX = 1.35; // radians: the widest a picture reaches from its axis (an ultra-wide view, right up against a model)
  const MODEL_STRIP = 8; // SCALE: columns (2 px each) a strip spans at most: fewer draws, a straight map across it
  const MODEL_SEAM_PX = 0.75; // a strip ends sooner where its vertical scale would drift by more than this over the picture
  const MODEL_DRIFT_PX = 12; // SCALE: px the parallax inside a model may drift before it is drawn again (with the two below)
  const MODEL_ANGLE_MIN = (2 * Math.PI) / 180; // SCALE: the finest step round a model (a big picture right up close)
  const MODEL_ANGLE_MAX = (10 * Math.PI) / 180; // SCALE: the owner's "about 10 degrees": the coarsest step round a model
  const MODEL_DIST = 0.04; // the distance may change this share before a redraw (the picture is scaled meanwhile)
  const MODEL_FOLD_COLS = 2; // columns of a face the picture never saw (its map runs backward there) before a redraw
  const MODEL_GROW = 1.15; // a picture shown this much larger than a fresh one would be is drawn again
  const MODEL_NEAR = 0.02; // tiles: Model3D cuts faces nearer than this
  const MODEL_LOD_PX = [80, 32]; // SCALE: on-screen height (px) for detail lod 0 / lod 1; shorter: lod 2
  const MODEL_STEP = 64; // SCALE: px a model canvas grows and shrinks in steps of
  const MODEL_SPARE = 2; // SCALE: spare model canvases kept
  const MODEL_IDLE = 120; // frames a canvas is kept while its model is not drawn (behind you, behind a wall)
  const MODEL_SHRINK = 30; // redraws in a row at under half its canvas before the canvas is made smaller
  const MODEL_SHADOW = [0.34, 0.16]; // the contact shadow's alpha under the model and in its soft rim
  const SHADOW_GROW = [-0.12, 0.06]; // tiles the shadow's two layers reach past the model's box (the darker one: inside)
  const MODEL_RENDERS_MAX = 2; // SCALE: model redraws a frame on the governor's starting row (a picture never drawn draws anyway)
  const MODEL_MAX_PX = 640; // SCALE: the larger side of a model's picture on the starting row; nearer, it is scaled up
  // SCALE: the model governor's rows, one per LIVE_LEVELS row (js/interior.js: richest first, the walkers' governor
  // moves both; a row past the end takes the last): `max` redraws a frame, `px` the larger side of a picture at most
  const MODEL_LEVELS = [
    { max: 3, px: 768 },
    { max: 2, px: 704 },
    { max: MODEL_RENDERS_MAX, px: MODEL_MAX_PX }, // LIVE_START: the defaults
    { max: 2, px: 576 },
    { max: 1, px: 512 },
    { max: 1, px: 448 },
    { max: 1, px: 384 },
    { max: 1, px: 320 },
  ];
  // the walls' light (drawFace): x-facing faces full, y-facing ones 0.12 darker; tops a little brighter, undersides darker
  const LIGHT_X = 1;
  const LIGHT_Y = 0.88;
  const LIGHT_TOP = 1.08;
  const LIGHT_UNDER = 0.62;
  const LIGHT_INDOOR = 0.86; // under a roof (the cabin): drawFace's 0.14 darker
  const VAN_TILE = 62.5; // the road's units a tile (js/perspective.js TILE): the van's 118 long is 1.89 tiles
  const normAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  // modelMap's answer (no object a column): the picture column a screen column edge shows, and the vertical scale there
  let MAP_X = 0;
  let MAP_V = 1;

  // the picture camera's state, one at a time (a redraw is one model): the view Model3D gets reads it
  const CAM = { mx: 0, my: 0, Rx: 0, Ry: 0, Fx: 0, Fy: 0, s: 1, ex: 0, ey: 0, ca: 1, sa: 0, Px: 1, Py: 1, cx: 0, hr: 0, near: MODEL_NEAR, dark: 1 };
  let VIEW = null;
  function view() {
    if (VIEW) return VIEW;
    VIEW = M3().view({
      // model point -> world (x along the model's right, y along its nose, z up, times scale) -> the picture
      project(x, y, z) {
        const c = CAM;
        const wx = c.mx + (x * c.Rx + y * c.Fx) * c.s - c.ex;
        const wy = c.my + (x * c.Ry + y * c.Fy) * c.s - c.ey;
        const d = wx * c.ca + wy * c.sa;
        const lat = wy * c.ca - wx * c.sa;
        const dd = d > 1e-6 ? d : 1e-6;
        this.X = c.cx + (c.Px * lat) / dd;
        this.Y = c.hr + (c.Py * (0.5 - z * c.s)) / dd;
        this.D = d;
        return d > c.near;
      },
      // a face's outward normal in model space, turned into the world: lit as a wall facing that way is
      lit(nx, ny, nz) {
        const c = CAM;
        const wx = nx * c.Rx + ny * c.Fx;
        const wy = nx * c.Ry + ny * c.Fy;
        return (wx * wx * LIGHT_X + wy * wy * LIGHT_Y + nz * nz * (nz > 0 ? LIGHT_TOP : LIGHT_UNDER)) * c.dark;
      },
    });
    return VIEW;
  }

  /** A convex polygon's edges ([[x, y], ...]): each one's outward normal (away from the middle) and offset, so inside
      is n . p <= c on every edge (enter() reads them). */
  function edgesOf(pts) {
    let gx = 0;
    let gy = 0;
    pts.forEach(([x, y]) => {
      gx += x / pts.length;
      gy += y / pts.length;
    });
    return pts.map(([ax, ay], i) => {
      const [bx, by] = pts[(i + 1) % pts.length];
      let nx = by - ay;
      let ny = ax - bx;
      if (nx * (gx - ax) + ny * (gy - ay) > 0) {
        nx = -nx;
        ny = -ny;
      }
      return { nx, ny, c: nx * ax + ny * ay };
    });
  }

  /** The ray from (ex, ey) along (rx, ry) (per unit of depth) into a convex footprint: the depth where it first meets
      it, or -1 when it misses. f: the instance's edges (modelAdd: outward normals nx, ny and offsets c). */
  function enter(f, ex, ey, rx, ry) {
    let tE = 0;
    let tL = Infinity;
    for (let i = 0; i < f.length; i++) {
      const e = f[i];
      const den = e.nx * rx + e.ny * ry;
      const num = e.c - (e.nx * ex + e.ny * ey);
      if (den === 0) {
        if (num < 0) return -1;
      } else if (den > 0) {
        const t = num / den;
        if (t < tL) tL = t;
      } else {
        const t = num / den;
        if (t > tE) tE = t;
      }
      if (tE > tL) return -1;
    }
    return tL > 0 ? tE : -1;
  }

  /** Do the column edges a..b of X lie on the straight line from X[a] to X[b] (within MODEL_SEAM_PX)? */
  function straight(X, a, b) {
    const k = (X[b] - X[a]) / (b - a);
    for (let e = a + 1; e < b; e++) if (Math.abs(X[e] - (X[a] + k * (e - a))) > MODEL_SEAM_PX) return false;
    return true;
  }

  /** The convex polygon P (flat [x, y, ...] world points) cut to depth >= near along (ca, sa) from the eye -> OUT. */
  const CLIP_OUT = new Float64Array(64);
  function clipNear(P, n, ex, ey, ca, sa, near) {
    let m = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const ax = P[i * 2];
      const ay = P[i * 2 + 1];
      const bx = P[j * 2];
      const by = P[j * 2 + 1];
      const da = (ax - ex) * ca + (ay - ey) * sa - near;
      const db = (bx - ex) * ca + (by - ey) * sa - near;
      if (da >= 0 && m < 62) {
        CLIP_OUT[m++] = ax;
        CLIP_OUT[m++] = ay;
      }
      if (da >= 0 !== db >= 0 && m < 62) {
        const t = da / (da - db);
        CLIP_OUT[m++] = ax + (bx - ax) * t;
        CLIP_OUT[m++] = ay + (by - ay) * t;
      }
    }
    return m / 2;
  }

  Object.assign(I, {
    MODEL_MARGIN,
    MODEL_PAD,
    MODEL_STRIP,
    MODEL_SEAM_PX,
    MODEL_DRIFT_PX,
    MODEL_ANGLE_MIN,
    MODEL_ANGLE_MAX,
    MODEL_DIST,
    MODEL_GROW,
    MODEL_LOD_PX,
    MODEL_RENDERS_MAX,
    MODEL_MAX_PX,
    MODEL_LEVELS,
    MODEL_IDLE,
    VAN_TILE,

    /* ---------- The instances ---------- */
    /** A new grid (loadGrid): no models, no tiles left to them, every canvas let go. */
    modelsReset() {
      this.models = [];
      this.modelSee = null;
      this.modelStripN = 0;
      this.modelRelease();
    },
    /** Stand a model in the scene (see the header for its fields). Its footprint's edges and its tiles are worked
        out once; returns the instance. */
    modelAdd(inst) {
      if (!this.models) this.models = [];
      inst.edges = edgesOf(inst.foot || []);
      inst.Rx = -Math.sin(inst.rot);
      inst.Ry = Math.cos(inst.rot);
      inst.Fx = Math.cos(inst.rot);
      inst.Fy = Math.sin(inst.rot);
      inst.box = null; // its bounding box in the world, worked out from the mesh (modelBox) whenever its sig changes
      inst.boxSig = null;
      this.models.push(inst);
      if (inst.tiles && inst.tiles.length) {
        const gw = this.gw;
        if (!this.modelSee || this.modelSee.length !== gw * this.gh) this.modelSee = new Uint8Array(gw * this.gh);
        inst.tiles.forEach(([x, y]) => {
          if (x >= 0 && y >= 0 && x < gw && y < this.gh) this.modelSee[y * gw + x] = 1;
        });
      }
      return inst;
    },
    /** The van parked on its tiles (the yard's and River Landing's V tiles): one Van3D model, the same as on the road,
        the save's paint and gear, its dents now and the roof gun. Its nose points west when the tiles run east to west
        (today's grids: the cab is this.van, the west tile), north when they run north to south. Null without Van3D. */
    addVanModel(tiles) {
      const V = ZSR.Van3D;
      if (!V || !M3() || !tiles || !tiles.length) return null;
      const xs = tiles.map((t) => t[0]);
      const ys = tiles.map((t) => t[1]);
      const x0 = Math.min(...xs);
      const x1 = Math.max(...xs) + 1;
      const y0 = Math.min(...ys);
      const y1 = Math.max(...ys) + 1;
      const tile = (ZSR.Persp && ZSR.Persp.TILE) || VAN_TILE;
      const gear = { dent: 0, gun: true };
      const up = () => (State() && State().save && State().save.upgrades) || {};
      return this.modelAdd({
        kind: "van",
        x: (x0 + x1) / 2,
        y: (y0 + y1) / 2,
        rot: x1 - x0 >= y1 - y0 ? Math.PI : -Math.PI / 2,
        scale: 1 / tile,
        foot: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]],
        tiles: tiles.map((t) => [t[0], t[1]]),
        mesh() {
          const u = up();
          gear.dent = V.dentNow();
          return { mesh: V.mesh(u, gear), sig: V.sig(u, gear) };
        },
      });
    },
    /** The first instance of a kind, or null. */
    modelOf(kind) {
      return (this.models || []).find((m) => m.kind === kind) || null;
    },
    /** An instance's bounding box in the world from its mesh's bounds: the four corners on the ground (flat x, y),
        their edges (the stand-in surface a moved eye maps the old picture through: modelMap) and its bottom and top
        (tiles); kept until its sig changes. */
    modelBox(inst, mesh) {
      const b = mesh.bounds;
      const s = inst.scale;
      const P = new Float64Array(8);
      const pts = [[b[0], b[1]], [b[3], b[1]], [b[3], b[4]], [b[0], b[4]]].map(([x, y], i) => {
        P[i * 2] = inst.x + (x * inst.Rx + y * inst.Fx) * s;
        P[i * 2 + 1] = inst.y + (x * inst.Ry + y * inst.Fy) * s;
        return [P[i * 2], P[i * 2 + 1]];
      });
      return { P, z0: b[2] * s, z1: b[5] * s, b, edges: edgesOf(pts) };
    },

    /* ---------- Each frame (drawScene) ---------- */
    /** The governor's row for models now (follows the walkers' row; the floor's slow-machine step takes one more). */
    modelRow() {
      const lvl = (this.liveLevel == null ? this.LIVE_START : this.liveLevel) + (this.planeRes > 2 ? 1 : 0);
      return MODEL_LEVELS[clamp(lvl, 0, MODEL_LEVELS.length - 1)];
    },
    /** drawScene's hook: every model on screen gets its picture (drawn again when it is stale, under the governor)
        and goes into `list` as strips, each with its own depth. */
    modelQueue(list, sc) {
      const models = this.models;
      const M = M3();
      this.modelStripN = 0; // (this frame's strips: modelStrips numbers them, modelHides reads them)
      if (!models || !models.length || !M) return;
      const t0 = typeof performance !== "undefined" ? performance.now() : 0;
      const ST = 2 * Math.tan(this.FOV / 2);
      const hv = this.halfView();
      const row = this.modelRow();
      const frame = this.frameNo;
      const stats = this.modelStats || (this.modelStats = { shown: 0, drawn: 0, strips: 0, ms: 0, total: 0, why: {} });
      const on = this.modelOn || (this.modelOn = []);
      const wait = this.modelWait || (this.modelWait = []);
      on.length = 0;
      wait.length = 0;
      let drawn = 0;
      for (let i = 0; i < models.length; i++) {
        const inst = models[i];
        if (inst.hidden) continue;
        const look = inst.mesh();
        if (!look || !look.mesh) continue;
        if (inst.boxSig !== look.sig || !inst.box) {
          inst.box = this.modelBox(inst, look.mesh);
          inst.boxSig = look.sig;
        }
        const pl = this.modelPlan(inst, look, sc, hv, ST, row);
        if (!pl) continue;
        const t = (pl.t = this.modelTarget(inst));
        on.push(pl);
        pl.why = this.modelStale(pl, t);
        if (pl.why === "first") {
          // a picture never drawn draws at once (there is nothing to show yet): past this frame's cap at the
          // coarsest detail, its own when its turn comes
          if (drawn >= row.max) pl.lod = 2;
          this.modelDraw(pl);
          drawn++;
        } else if (pl.why) {
          if (!t.staleAt) t.staleAt = frame;
          wait.push(pl);
        }
      }
      // the stale ones, biggest on screen and longest waiting first, while this frame's redraws last; the rest keep
      // their picture (mapped for the eye now) and their place in the queue
      if (wait.length && drawn < row.max) {
        for (let i = 0; i < wait.length; i++) wait[i].prio = wait[i].hw * (1 + (frame - wait[i].t.staleAt) / 8);
        wait.sort((a, b) => b.prio - a.prio);
        for (let i = 0; i < wait.length && drawn < row.max; i++) {
          this.modelDraw(wait[i]);
          drawn++;
        }
      }
      let strips = 0;
      for (let i = 0; i < on.length; i++) {
        const pl = on[i];
        pl.t.used = frame;
        if (pl.why && pl.t.drawnAt === frame) stats.why[pl.why] = (stats.why[pl.why] || 0) + 1;
        if (pl.t.lh) strips += this.modelStrips(pl, list, ST);
      }
      this.modelSweep();
      stats.shown = on.length;
      stats.drawn = drawn;
      stats.total += drawn;
      stats.strips = strips;
      stats.ms = t0 ? performance.now() - t0 : 0;
      wait.length = 0;
    },
    /** Where one model stands in the view now: null when none of it shows (out of the view, or behind the walls in
        front of it), else its bearing, distance, the angles it spans and the angles in view (both from its bearing),
        its size on screen and the picture a redraw would make (axis, range, k, detail, fog). */
    modelPlan(inst, look, sc, hv, ST, row) {
      const p = this.player;
      const H = this.H;
      const box = inst.box;
      const ex = p.x;
      const ey = p.y;
      const dx = inst.x - ex;
      const dy = inst.y - ey;
      const d = Math.max(1e-3, Math.hypot(dx, dy));
      const b = Math.atan2(dy, dx);
      // the angles its box spans, from its bearing (all round when the eye is inside the box)
      const P = box.P;
      let lo = Infinity;
      let hi = -Infinity;
      let loC = 0;
      let hiC = 0;
      let pos = 0;
      let neg = 0;
      for (let i = 0; i < 4; i++) {
        const a = normAngle(Math.atan2(P[i * 2 + 1] - ey, P[i * 2] - ex) - b);
        if (a < lo) (lo = a), (loC = i);
        if (a > hi) (hi = a), (hiC = i);
        // the eye on the same side of every edge: inside the box
        const j = (i + 1) % 4;
        const cr = (P[j * 2] - P[i * 2]) * (ey - P[i * 2 + 1]) - (P[j * 2 + 1] - P[i * 2 + 1]) * (ex - P[i * 2]);
        if (cr > 0) pos++;
        else if (cr < 0) neg++;
      }
      const inside = !pos || !neg;
      const c = normAngle(p.a - b);
      if (inside || hi - lo > Math.PI) {
        lo = c - hv - MODEL_MARGIN;
        hi = c + hv + MODEL_MARGIN;
      }
      const nlo = Math.max(lo, c - hv);
      const nhi = Math.min(hi, c + hv);
      if (nlo >= nhi) return null;
      // on screen: its columns now (from the angles in view) and whether any of them shows past the walls
      const COL = this.COL;
      const cols = this.cols;
      const xs = (a) => this.W / 2 + (Math.tan(clamp(normAngle(b + a - p.a), -1.55, 1.55)) * H) / ST;
      const c0 = clamp(Math.floor(xs(nlo) / COL), 0, cols - 1);
      const c1 = clamp(Math.ceil(xs(nhi) / COL) - 1, 0, cols - 1);
      if (c0 > c1 || !this.modelSeen(inst, c0, c1, ST)) return null;
      const pl = inst.plan || (inst.plan = {});
      pl.inst = inst;
      pl.look = look;
      pl.ex = ex;
      pl.ey = ey;
      pl.d = d;
      pl.b = b;
      pl.lo = lo;
      pl.hi = hi;
      pl.nlo = nlo;
      pl.nhi = nhi;
      pl.c0 = c0; // its columns now
      pl.c1 = c1;
      pl.inside = inside;
      pl.loC = loC; // the box corners at its left and right edge now (modelMap: a ray past the box)
      pl.hiC = hiC;
      // its half-width on screen (px, its whole box, at the middle of the view): how far the parallax inside it moves
      pl.hw = (H / ST) * Math.tan(Math.min(1.4, (hi - lo) / 2));
      // a redraw now: the angles in view +- the margin, padded, about their middle
      let rlo = Math.max(lo, c - hv - MODEL_MARGIN);
      let rhi = Math.min(hi, c + hv + MODEL_MARGIN);
      const pad = MODEL_PAD * (rhi - rlo) * 0.5 + 0.004;
      rlo -= pad;
      rhi += pad;
      const half = Math.min(MODEL_HALF_MAX, (rhi - rlo) / 2);
      pl.axis = b + (rlo + rhi) / 2;
      pl.half = half;
      // the picture's rows: its box cut to that wedge, nearest and farthest (picture depth), top and bottom
      const ca = Math.cos(pl.axis);
      const sa = Math.sin(pl.axis);
      const W4 = this.modelWedge || (this.modelWedge = new Float64Array(16));
      let n = 4;
      for (let i = 0; i < 8; i++) W4[i] = P[i];
      n = this.modelCutWedge(W4, n, ex, ey, pl.axis - half, 1);
      n = this.modelCutWedge(W4, n, ex, ey, pl.axis + half, -1);
      let dmin = Infinity;
      let dmax = 0;
      for (let i = 0; i < n; i++) {
        const dd = (W4[i * 2] - ex) * ca + (W4[i * 2 + 1] - ey) * sa;
        if (dd < dmin) dmin = dd;
        if (dd > dmax) dmax = dd;
      }
      if (!(n >= 1)) {
        dmin = d * Math.cos(half);
        dmax = d;
      }
      dmin = Math.max(0.05, dmin);
      dmax = Math.max(dmin, dmax);
      const z0 = box.z0;
      const z1 = box.z1;
      const top1 = -(H * (z1 - 0.5)) / (z1 > 0.5 ? dmin : dmax);
      const bot1 = (H * (0.5 - z0)) / (z0 < 0.5 ? dmin : dmax);
      // never past what the screen can show (with room for the scale between redraws)
      const room = ((H / 2) * (1 + MODEL_DIST * 1.5)) / Math.cos(half);
      const top = Math.max(top1, -room);
      const bot = Math.min(bot1, room);
      const w1 = 2 * (H / ST) * Math.tan(half);
      const h1 = Math.max(1, bot - top);
      // k: render px per screen px, at most 1, the larger side at most the row's px (with modelDraw's few px of
      // padding and rounding)
      pl.k = Math.min(1, (row.px - 8) / Math.max(w1, h1));
      pl.top = top;
      pl.bot = bot;
      pl.w1 = w1;
      const hpx = (H * (z1 - z0)) / d;
      pl.lod = hpx >= MODEL_LOD_PX[0] ? 0 : hpx >= MODEL_LOD_PX[1] ? 1 : 2;
      pl.fog = Math.min(sc.fogMax, d * sc.fogK);
      pl.fogStep = Math.round(pl.fog * M3().FOG_STEPS);
      pl.indoor = this.house && this.indoorAt ? this.indoorAt(inst.x, inst.y) : false;
      pl.why = null;
      return pl;
    },
    /** Cut the flat polygon W (n points, in place) to one side of the line from the eye at angle a: keep = 1 the
        side of greater angles (to its right on screen), -1 the other. Returns the points left. */
    modelCutWedge(Wb, n, ex, ey, a, keep) {
      const nx = -Math.sin(a) * keep;
      const ny = Math.cos(a) * keep;
      const tmp = this.modelWedgeTmp || (this.modelWedgeTmp = new Float64Array(16));
      let m = 0;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const ax = Wb[i * 2];
        const ay = Wb[i * 2 + 1];
        const bx = Wb[j * 2];
        const by = Wb[j * 2 + 1];
        const da = (ax - ex) * nx + (ay - ey) * ny;
        const db = (bx - ex) * nx + (by - ey) * ny;
        if (da >= 0 && m < 7) {
          tmp[m * 2] = ax;
          tmp[m * 2 + 1] = ay;
          m++;
        }
        if (da >= 0 !== db >= 0 && m < 7) {
          const t = da / (da - db);
          tmp[m * 2] = ax + (bx - ax) * t;
          tmp[m * 2 + 1] = ay + (by - ay) * t;
          m++;
        }
      }
      for (let i = 0; i < m * 2; i++) Wb[i] = tmp[i];
      return m;
    },
    /** Does any column c0..c1 of the model show past the walls in front of it (and under an opening's top)? Each
        column at the depth its ray meets the footprint (else the nearest corner), the box's top and bottom there. */
    modelSeen(inst, c0, c1, ST) {
      const p = this.player;
      const H = this.H;
      const half = H / 2;
      const COL = this.COL;
      const dirX = Math.cos(p.a);
      const dirY = Math.sin(p.a);
      const near = this.modelNearCorner(inst);
      const z0 = inst.box.z0;
      const z1 = inst.box.z1;
      for (let col = c0; col <= c1; col++) {
        const tn = ((col * COL + COL / 2 - this.W / 2) * ST) / H;
        let ty = enter(inst.edges, p.x, p.y, dirX - dirY * tn, dirY + dirX * tn);
        if (!(ty > 0.1)) ty = near;
        const top = half - (H * (z1 - 0.5)) / ty;
        const bot = half + (H * (0.5 - z0)) / ty;
        const clip = this.clipAt(col, ty);
        const cap = ty > this.capD[col] ? this.capY[col] : -Infinity;
        if ((clip < bot ? clip : bot) > (cap > top ? cap : top)) return true;
      }
      return false;
    },
    /** The depth (along the view) of the footprint corner nearest the view's plane, at least 0.1. */
    modelNearCorner(inst) {
      const p = this.player;
      const dirX = Math.cos(p.a);
      const dirY = Math.sin(p.a);
      let best = Infinity;
      for (let i = 0; i < inst.foot.length; i++) {
        const dd = (inst.foot[i][0] - p.x) * dirX + (inst.foot[i][1] - p.y) * dirY;
        if (dd < best) best = dd;
      }
      return Math.max(0.1, best);
    },
    /** Why this model's picture must be drawn again now ("first", "sig", "turn", "dist", "range", "grow", "fold",
        "fog", "lod"), or null: its picture still holds. */
    modelStale(pl, t) {
      if (!t.lh) return "first";
      if (t.sig !== pl.look.sig) return "sig";
      // round it: finer for a big picture (its parallax shows sooner), never finer than MODEL_ANGLE_MIN
      const step = clamp(MODEL_DRIFT_PX / Math.max(1, pl.hw), MODEL_ANGLE_MIN, MODEL_ANGLE_MAX);
      if (Math.abs(normAngle(pl.b - t.b0)) > step) return "turn";
      const rel = pl.d / t.d0;
      if (Math.abs(rel - 1) > MODEL_DIST) return "dist";
      // its columns now, in the old picture (modelMap): all inside what it holds?
      const ST = 2 * Math.tan(this.FOV / 2);
      this.modelMap(pl, t, pl.c0 * this.COL, ST);
      if (MAP_X < 0) return "range";
      this.modelMap(pl, t, (pl.c1 + 1) * this.COL, ST);
      if (MAP_X > t.lw) return "range";
      // shown larger than a fresh picture would be (it was drawn small: the governor's px, far off)
      const shown = (t.lw / t.k) / rel; // its width on screen now (px)
      const fresh = Math.min(1, this.modelRow().px / Math.max(1, Math.max(shown, (t.lh / t.k) / rel)));
      if ((t.k * rel) * MODEL_GROW < fresh) return "grow";
      if (t.foldAt > t.drawnAt) return "fold";
      if (t.fogStep !== pl.fogStep) return "fog";
      if (t.lod !== pl.lod) return "lod";
      return null;
    },
    /** Draw one model's picture from the eye now (modelPlan worked out its camera); the canvas grows to fit. */
    modelDraw(pl) {
      const M = M3();
      const inst = pl.inst;
      const t = pl.t;
      const H = this.H;
      const ST = 2 * Math.tan(this.FOV / 2);
      const k = pl.k;
      const Px = (k * H) / ST;
      const Py = k * H;
      const rw = Math.max(2, Math.ceil(2 * Px * Math.tan(pl.half)) + 4);
      const hr = Math.ceil(-pl.top * k) + 2; // the horizon's row
      const rh = Math.max(2, hr + Math.ceil(pl.bot * k) + 2);
      const bw = Math.ceil(rw / MODEL_STEP) * MODEL_STEP;
      const bh = Math.ceil(rh / MODEL_STEP) * MODEL_STEP;
      const c = t.c;
      if (c.width < rw || c.height < rh) {
        c.width = Math.max(c.width, bw);
        c.height = Math.max(c.height, bh);
        t.small = 0;
      } else {
        t.small = c.height >= 2 * bh || c.width >= 2 * bw ? t.small + 1 : 0;
        if (t.small >= MODEL_SHRINK) {
          c.width = bw;
          c.height = bh;
          t.small = 0;
        } else t.g.clearRect(0, 0, Math.max(t.lw, rw), Math.max(t.lh, rh));
      }
      const cam = CAM;
      cam.mx = inst.x;
      cam.my = inst.y;
      cam.Rx = inst.Rx;
      cam.Ry = inst.Ry;
      cam.Fx = inst.Fx;
      cam.Fy = inst.Fy;
      cam.s = inst.scale;
      cam.ex = pl.ex;
      cam.ey = pl.ey;
      cam.ca = Math.cos(pl.axis);
      cam.sa = Math.sin(pl.axis);
      cam.Px = Px;
      cam.Py = Py;
      cam.cx = rw / 2;
      cam.hr = hr;
      cam.near = MODEL_NEAR;
      cam.dark = pl.indoor ? LIGHT_INDOOR : 1;
      const v = view();
      // the eye in model space (which faces show, the parts' order)
      const rx = pl.ex - inst.x;
      const ry = pl.ey - inst.y;
      v.eye[0] = (rx * inst.Rx + ry * inst.Ry) / inst.scale;
      v.eye[1] = (rx * inst.Fx + ry * inst.Fy) / inst.scale;
      v.eye[2] = 0.5 / inst.scale;
      v.near = MODEL_NEAR;
      v.lod = pl.lod;
      v.fog = pl.fog;
      v.fogR = v.fogG = v.fogB = 0;
      v.tint = 0;
      v.ink = Math.max(1.5, Math.min(4, (H / pl.d) * 0.012)) * k;
      this.modelShadow(t.g, inst, pl);
      M.draw(t.g, pl.look.mesh, v);
      t.lw = rw;
      t.lh = rh;
      t.k = k;
      t.Px = Px;
      t.Py = Py;
      t.cx = rw / 2;
      t.hr = hr;
      t.ex = pl.ex;
      t.ey = pl.ey;
      t.b0 = pl.b;
      t.d0 = pl.d;
      t.axis = pl.axis;
      t.ca = cam.ca;
      t.sa = cam.sa;
      t.half = pl.half;
      t.sig = pl.look.sig;
      t.fogStep = pl.fogStep;
      t.lod = pl.lod;
      t.drawnAt = this.frameNo;
      t.staleAt = 0;
      t.draws = (t.draws || 0) + 1;
    },
    /** The model's contact shadow on the ground, under everything it draws: its box's footprint, soft at the rim. */
    modelShadow(g, inst, pl) {
      const b = inst.box.b;
      const P = this.modelShadowPts || (this.modelShadowPts = new Float64Array(8));
      const c = CAM;
      // the soft rim first, then the darker middle over it
      [
        [SHADOW_GROW[1], MODEL_SHADOW[1]],
        [SHADOW_GROW[0], MODEL_SHADOW[0]],
      ].forEach(([grow, alpha]) => {
        const g2 = grow / inst.scale; // model units
        [[b[0] - g2, b[1] - g2], [b[3] + g2, b[1] - g2], [b[3] + g2, b[4] + g2], [b[0] - g2, b[4] + g2]].forEach(([x, y], i) => {
          P[i * 2] = inst.x + (x * inst.Rx + y * inst.Fx) * inst.scale;
          P[i * 2 + 1] = inst.y + (x * inst.Ry + y * inst.Fy) * inst.scale;
        });
        const n = clipNear(P, 4, c.ex, c.ey, c.ca, c.sa, MODEL_NEAR);
        if (n < 3) return;
        g.beginPath();
        for (let i = 0; i < n; i++) {
          const wx = CLIP_OUT[i * 2] - c.ex;
          const wy = CLIP_OUT[i * 2 + 1] - c.ey;
          const d = Math.max(MODEL_NEAR, wx * c.ca + wy * c.sa);
          const X = c.cx + (c.Px * (wy * c.ca - wx * c.sa)) / d;
          const Y = c.hr + (c.Py * 0.5) / d;
          if (i) g.lineTo(X, Y);
          else g.moveTo(X, Y);
        }
        g.closePath();
        g.fillStyle = "rgba(0,0,0," + alpha + ")";
        g.fill();
      });
    },
    /** Screen x (a column edge) -> where the model's picture holds it: MAP_X (picture px) and MAP_V (screen px per
        picture px, down the column). The ray through x meets the model's box (the stand-in for its surface) at a
        point; that point seen from the eye the picture was drawn from gives its column, and the two depths its height.
        Exact for anything on the box's sides wherever you have walked since (a van is mostly its box), and the very
        map the screen uses while you have only turned. A ray past the box goes on at the depth of the box's corner on
        that side. With the eye inside the box (a tree's crown over you, later), the angles from the model's middle are
        scaled by d / d0 about its bearing now instead, the height by d0 / d. */
    modelMap(pl, t, x, ST) {
      const p = this.player;
      const H = this.H;
      const tn = ((x - this.W / 2) * ST) / H;
      if (pl.inside) {
        const as = Math.atan(tn);
        const rel = pl.d / t.d0;
        const q = clamp(normAngle(t.b0 - t.axis) + normAngle(p.a + as - pl.b) * rel, -1.56, 1.56);
        MAP_X = t.cx + t.Px * Math.tan(q);
        MAP_V = (H * Math.cos(q)) / (t.Py * Math.cos(as) * rel);
        return;
      }
      // the ray, per unit of depth along the view
      const dirX = Math.cos(p.a);
      const dirY = Math.sin(p.a);
      const rx = dirX - dirY * tn;
      const ry = dirY + dirX * tn;
      const box = pl.inst.box;
      let d = enter(box.edges, p.x, p.y, rx, ry);
      if (!(d > 0)) {
        // past the box: as deep as its corner on that side (where the ray nearest passes it)
        const side = normAngle(p.a + Math.atan(tn) - pl.b) < (pl.lo + pl.hi) / 2 ? pl.loC : pl.hiC;
        d = ((box.P[side * 2] - p.x) * rx + (box.P[side * 2 + 1] - p.y) * ry) / (rx * rx + ry * ry);
      }
      if (!(d > MODEL_NEAR)) d = MODEL_NEAR;
      // that point, seen from where the picture was drawn
      const wx = p.x + d * rx - t.ex;
      const wy = p.y + d * ry - t.ey;
      let dp = wx * t.ca + wy * t.sa;
      if (!(dp > MODEL_NEAR)) dp = MODEL_NEAR;
      MAP_X = t.cx + (t.Px * (wy * t.ca - wx * t.sa)) / dp;
      MAP_V = (H * dp) / (t.Py * d);
    },
    /** The model's strips on screen into `list` (drawScene's painter's list): the picture's columns now, cut where
        a strip would pass MODEL_STRIP columns or its vertical scale would drift; each with the depth its rays meet the
        footprint. Returns how many. */
    modelStrips(pl, list, ST) {
      const inst = pl.inst;
      const t = pl.t;
      const p = this.player;
      const Wd = this.W;
      const H = this.H;
      const COL = this.COL;
      const cols = this.cols;
      // its columns now (its box, in view), one more each side for the rounding
      const cA = Math.max(0, pl.c0 - 1);
      const cB = Math.min(cols - 1, pl.c1 + 1);
      if (cA > cB) return 0;
      // per column edge: the picture column and the vertical scale; the picture's columns never run backward (a face
      // the old picture saw edge-on, turned toward you since, shows nothing until the next redraw)
      const n = cB - cA + 2;
      const EX = this.modelEX && this.modelEX.length >= n ? this.modelEX : (this.modelEX = new Float64Array(Math.max(n, cols + 2)));
      const EV = this.modelEV && this.modelEV.length >= n ? this.modelEV : (this.modelEV = new Float64Array(Math.max(n, cols + 2)));
      let back = 0;
      for (let e = 0; e < n; e++) {
        this.modelMap(pl, t, (cA + e) * COL, ST);
        if (e && MAP_X < EX[e - 1]) {
          if (MAP_X < EX[e - 1] - 0.5) back++;
          EX[e] = EX[e - 1];
        } else EX[e] = MAP_X;
        EV[e] = MAP_V;
      }
      // a face is in view that the picture never saw (it was edge-on or turned away): draw it again (modelStale)
      if (back >= MODEL_FOLD_COLS) t.foldAt = this.frameNo;
      const reach = Math.max(t.hr, t.lh - t.hr); // rows from the horizon to the picture's farther edge
      const dirX = Math.cos(p.a);
      const dirY = Math.sin(p.a);
      const near = this.modelNearCorner(inst);
      // (strip entries are reused frame to frame: modelQueue numbers them across all the models of a frame)
      const pool = this.modelStripPool || (this.modelStripPool = []);
      let k = 0;
      let c0 = cA;
      while (c0 <= cB) {
        // as far as MODEL_STRIP columns, or until the vertical scale drifts past MODEL_SEAM_PX over the picture, or the
        // map bends (a corner of the box, one face to the next) more than MODEL_SEAM_PX off a straight line
        let c1 = c0;
        const v0 = EV[c0 - cA];
        while (c1 < cB && c1 - c0 + 1 < MODEL_STRIP && Math.abs(EV[c1 + 1 - cA + 1] - v0) * reach <= MODEL_SEAM_PX * 2 && straight(EX, c0 - cA, c1 + 2 - cA)) c1++;
        const e0 = c0 - cA;
        const e1 = c1 + 1 - cA;
        // its vertical scale at its middle
        this.modelMap(pl, t, ((c0 + c1 + 1) * COL) / 2, ST);
        const v = MAP_V;
        // its depth: the middle ray into the footprint, else the nearest its edge rays meet, else the nearest corner
        const tm = ((((c0 + c1 + 1) * COL) / 2 - Wd / 2) * ST) / H;
        let ty = enter(inst.edges, p.x, p.y, dirX - dirY * tm, dirY + dirX * tm);
        if (!(ty > 0.1)) {
          const ta = ((c0 * COL - Wd / 2) * ST) / H;
          const tb = (((c1 + 1) * COL - Wd / 2) * ST) / H;
          const ya = enter(inst.edges, p.x, p.y, dirX - dirY * ta, dirY + dirX * ta);
          const yb = enter(inst.edges, p.x, p.y, dirX - dirY * tb, dirY + dirX * tb);
          ty = ya > 0.1 && yb > 0.1 ? Math.min(ya, yb) : ya > 0.1 ? ya : yb > 0.1 ? yb : near;
        }
        const si = this.modelStripN++;
        const s = pool[si] || (pool[si] = { model: null, pic: null, c0: 0, c1: 0, ty: 0, x0: 0, x1: 0, X0: 0, X1: 0, v: 1, top: 0, sh: 0, lift: 0, scale: 1 });
        s.model = inst;
        s.pic = t;
        s.c0 = c0;
        s.c1 = c1;
        s.ty = Math.max(0.1, ty);
        s.x0 = c0 * COL;
        s.x1 = (c1 + 1) * COL;
        s.X0 = EX[e0];
        s.X1 = EX[e1];
        s.v = v;
        s.top = H / 2 - t.hr * v;
        s.sh = t.lh * v;
        s.screenX = (s.x0 + s.x1) / 2;
        list.push(s);
        k++;
        c0 = c1 + 1;
      }
      return k;
    },
    /** Is screen y in column col, at depth d, behind a model drawn this frame (a strip nearer than d whose box rises
        over y there)? drawScene's health bars ask: a walker hidden behind the van shows no bar over it. */
    modelHides(col, d, y) {
      const pool = this.modelStripPool;
      const H = this.H;
      for (let i = 0; i < this.modelStripN; i++) {
        const s = pool[i];
        if (col < s.c0 || col > s.c1 || !(s.ty < d)) continue;
        if (H / 2 - (H * (s.model.box.z1 - 0.5)) / s.ty <= y) return true;
      }
      return false;
    },
    /** One strip of a model (drawSprite's dispatch): runs of whole columns in one draw each, a column a nearer wall
        cuts (or an opening's top trims) on its own; the source columns from the strip's straight map either way, so
        neither meets its neighbour with a seam. */
    modelStripDraw(ctx, s) {
      const t = s.pic;
      const img = t.c;
      const COL = this.COL;
      const top = s.top;
      const bottom = top + s.sh;
      const kx = (s.X1 - s.X0) / (s.x1 - s.x0); // picture px per screen px across the strip
      const lw = t.lw;
      const lh = t.lh;
      let run = -1;
      for (let col = s.c0; col <= s.c1 + 1; col++) {
        let clip = 0;
        let cap = -Infinity;
        if (col <= s.c1) {
          clip = this.clipAt(col, s.ty);
          cap = s.ty > this.capD[col] ? this.capY[col] : -Infinity;
          const u0 = s.X0 + (col * COL - s.x0) * kx;
          if (clip >= bottom && cap <= top && u0 >= 0 && u0 + COL * kx <= lw) {
            if (run < 0) run = col;
            continue;
          }
        }
        if (run >= 0) {
          const x0 = run * COL;
          const w = (col - run) * COL;
          ctx.drawImage(img, s.X0 + (x0 - s.x0) * kx, 0, w * kx, lh, x0, top, w, s.sh);
          run = -1;
        }
        if (col > s.c1 || !(clip > top && clip > cap)) continue;
        // one column, cut at the wall in front (clip) and under an opening's top (cap), inside the picture
        const x0 = col * COL;
        let u0 = s.X0 + (x0 - s.x0) * kx;
        let u1 = u0 + COL * kx;
        if (u1 <= 0 || u0 >= lw) continue;
        let dx0 = x0;
        let dx1 = x0 + COL;
        if (u0 < 0) {
          dx0 += (-u0 / (u1 - u0)) * COL;
          u0 = 0;
        }
        if (u1 > lw) {
          dx1 -= ((u1 - lw) / (u1 - u0)) * COL;
          u1 = lw;
        }
        const y0 = cap > top ? cap : top;
        const y1 = clip < bottom ? clip : bottom;
        if (y1 <= y0 || dx1 <= dx0) continue;
        const sy = (lh * (y0 - top)) / s.sh;
        const sh = (lh * (y1 - y0)) / s.sh;
        ctx.drawImage(img, u0, sy, u1 - u0, sh, dx0, y0, dx1 - dx0, y1 - y0);
      }
    },

    /* ---------- The canvases ---------- */
    /** This model's canvas: its own, else a spare one, else a new one (no picture yet: lw = lh = 0). */
    modelTarget(inst) {
      const pool = this.modelPool || (this.modelPool = new Map());
      let t = pool.get(inst);
      if (!t) {
        const spare = this.modelSpare || (this.modelSpare = []);
        t = spare.pop();
        if (!t) {
          const c = root.document.createElement("canvas");
          c.width = MODEL_STEP;
          c.height = MODEL_STEP;
          t = { c, g: c.getContext("2d"), lw: 0, lh: 0, used: 0, drawnAt: 0, small: 0, draws: 0 };
        }
        t.lw = t.lh = 0;
        t.small = 0;
        t.staleAt = 0;
        t.foldAt = 0;
        t.draws = 0;
        pool.set(inst, t);
      }
      return t;
    },
    /** A canvas not drawn for MODEL_IDLE frames (or whose model is gone) goes back to the spares. */
    modelSweep() {
      const pool = this.modelPool;
      if (!pool || !pool.size) return;
      const now = this.frameNo;
      pool.forEach((t, inst) => {
        if (t.used === now) return;
        if (now - t.used > MODEL_IDLE || !(this.models || []).includes(inst)) {
          pool.delete(inst);
          this.modelFree(t);
        }
      });
    },
    modelFree(t) {
      const spare = this.modelSpare || (this.modelSpare = []);
      t.lw = t.lh = 0;
      if (spare.length < MODEL_SPARE) spare.push(t);
      else t.c.width = t.c.height = 0;
    },
    /** Let every model canvas go (a new grid, leaving the scene). */
    modelRelease() {
      if (this.modelPool) this.modelPool.forEach((t) => (t.c.width = t.c.height = 0));
      if (this.modelSpare) this.modelSpare.forEach((t) => (t.c.width = t.c.height = 0));
      this.modelPool = new Map();
      this.modelSpare = [];
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
