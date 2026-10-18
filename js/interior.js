/* First person on a grid: the core shared by buildings and the home-base yard.
   WASD / arrows to move and turn, mouse to look (pointer lock when allowed,
   plain mouse movement otherwise), click or Space to fire (hold to draw the bow, let go to shoot),
   E to interact, 1 to 5, Q or the mouse wheel to switch guns, B for the backpack, P or Esc to pause.
   This file: canvas, input, movement, walker AI, the guns in hand (firing, range, spread, pierce,
   noise, switching), rendering, HUD plumbing.
   The fishing pole is held in place of a gun (6, Q or the wheel; `tool` is "rod" while it is): a click
   goes to the mode's RodClick (river.js fishes; elsewhere there is no water), RodAway runs before a gun
   is taken back, RodSelect may refuse the pole, RodView says how it looks (bend, the line's end).
   building.js (buildings), yard.js (the yard) and river.js (River Landing) mix their modes into ZSR.Interior;
   the core calls the active mode's hooks by name: buildingUpdate / yardUpdate, and
   likewise Facing, Interact, Hint, Goal, Key and Leave.
   Free slots for other modules: modeKey(k, paused) and drawOverlay(ctx, W, H).
   Fields a mode may set: fenceTex = { whole, cracked } (its own fence drawings, canvases or texture
   names; null draws the plain pickets), holdFrame (true while a still overlay covers the paused
   scene: the frame drawn when it was set stays on the canvas until it is cleared or the view resizes),
   and a walk-in house under open sky (setHouse): a ceiling over its tiles, a hip roof over its outline
   seen from outside, and the yard seen through its open doors.
   More mode hooks: WalkerGoal(z) (where a walker heads instead of the player; a goal with `aim` [x, y] is
   clawed at once the walker stands there), PathBlock(z, goal) (tile indices this walker's path search treats as
   solid, or null: the yard keeps far fence holes from a walker outside; or true: no way to that goal at all, so
   nothing is searched and it claws the nearest fence segment), Barrier(z) (what a walker that cannot
   reach its goal claws at instead of the fence), HitBarrier(key, damage), Breach(x, y) (a fence segment just
   gave way), Door(d) and DoorHint(d) (a door of the mode's own: true when it handled E), Noise(tiles) (a shot).
   A crew member's speech bubble at home (js/crew.js) rides on the read panel: this.talk while it is open,
   crewSpeaker(talk) (where they stand), crewTalkKey(f) (E with it open), crewTalkEnd() (it closes);
   a candidate with `aim` (right under the crosshair) counts that much nearer in facing().
   Fields other modules set: `yardHold` (js/tutorial.js: the first-run basics hold the waves, the bell, the van
   and the crew's cards), `eatClick` (the next click into the view only takes the mouse back); walker fields
   `practice` and `floorHp` (a bite never takes you below it). startLoop and stop clear the first two.
   Walkers (their kinds and stats: WORLD.WALKER_TYPES): stepWalker decides what one does each frame and animWalker
   turns that into how it looks (heading, gait, pose timers) for the walker art (js/walker3d.js draws each one live
   into a pooled canvas when it looks different: walkerSprite, liveRenderAll; adaptQuality's governor trims how often
   far ones redraw when frames run slow, and draws more when they run fast); a screamer's scream speeds up the
   awake walkers near it (WORLD.SCREAM); a killed walker leaves `walkers` at once for `fallen` (collapsing, then
   gone after FALL_SECS), and `blood` holds a hit's spray (only with SETTINGS.walkerGore).
   Live figures that are not walkers (the crew on Walker3D's people, the dog and Rivet on Beast3D) share that pool and
   its governor: a prop with a `fig` record (liveFigure) is drawn live like a walker (figSprite, figState, figDraw), its
   owner (js/crew.js, js/robodog.js, js/building.js) animates it with figStep, and its canvas goes when it leaves the
   scene (liveSweep).
   Still 3D models (the parked van; js/modelsprite.js, mixed in after this file) are `models`: castColumns leaves their
   tiles (modelSee) undrawn, drawScene puts each one on screen as strips with their own depths (modelQueue, before the
   walkers: a live walker a model hides whole is not drawn, liveVisible) and drawSprite hands a strip to
   modelStripDraw; loadGrid and dropSceneCaches let their canvases go.
   Everything reads and writes the trip through ZSR.State. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const D3 = () => ZSR.Draw3;
  const W = () => ZSR.WORLD;

  const FOV = 1.22; // ~70 degrees
  const STRETCH = 2 * Math.tan(FOV / 2); // the view is this many times taller than wide: one tile of floor spans H / (STRETCH * d) pixels
  const COL = 2; // pixels per ray
  const PLANE_RES = 2; // floor and ceiling are cast at 1/PLANE_RES of the screen, then scaled up
  const SOLID = "#WSCXGLQETHBVFOKR"; // blocks movement (O is a closed door, Q the stash door)
  const OPAQUE = "#WSXGLQETHBVOU"; // blocks sight and rays (the low tiles F C K R are see-through; U is a broken window: walkers climb through it, you cannot)
  const HEIGHT = { V: 0.8, T: 1.45 }; // wall heights in tiles; everything else is 1 (this.tileH overrides per tile)
  const MAX_LOW = 8; // see-through low runs kept per screen column (only ones that can show)
  const MAX_HITS = 10; // opaque faces kept per column (only ones that rise above the faces in front)
  const INK = "#0f1012";
  // walkers: the kinds and their stats are facts (WORLD.WALKER_TYPES); how they move and look on foot is here
  const WT = () => W().WALKER_TYPES;
  const W3 = () => ZSR.Walker3D; // the live 3D walker models (js/walker3d.js), when loaded; its people are the crew
  const B3 = () => ZSR.Beast3D; // the live 3D animals (js/beast3d.js: the dog, Rivet), when loaded
  const SPEED_JITTER = 0.1; // each walker's speed is its kind's x (1 +- this)
  const TURN_RATE = 7; // radians a second a walker turns toward where it goes, bites or claws
  const STRIDE = 0.9; // tiles walked per gait cycle when Walker3D gives none
  const CLAW_RATE = 2; // claw swipes a second at a fence, a door or a build
  const GOAL_AT = 0.5; // tiles: a walker this close to a mode's WalkerGoal is there (it waits, or claws at the goal's aim)
  const FENCE_KEYS = new Map(); // a fence key "x,y" -> [x, y], read once (nearestFence); one entry per fence tile ever seen
  const FALL_SECS = 2; // a downed walker collapses and fades this long, then is gone (Walker3D.FALL_SECS when loaded)
  const BITE_SECS = 0.45; // the bite lunge (Walker3D.BITE_SECS when loaded)
  const FALLEN_MAX = 24; // SCALE: downed walkers kept collapsing at once; past it the oldest goes at once
  const BLOOD_MAX = 200; // SCALE: blood droplets and splats in the air and on the floor at once (only with SETTINGS.walkerGore)
  const SPLAT_SECS = 3; // a droplet that lands lies there this long
  const HEAR = 6; // SCALE: tiles: a sleeping walker this close to you in a straight line wakes (through walls); a building's walkers start farther (planWalkers)
  const HEAR_SPRINT = 9; // tiles: the same while you sprint (running is loud)
  const MEET_RANGE = 12; // tiles: a walker in view and in sight this close counts as met (State.meetWalker)
  const SCREAM_TOAST_GAP = 20; // seconds: "A scream!" is said at most this often
  // live walkers: each on screen is drawn by Walker3D into its own pooled canvas, at its size on screen, whenever it
  // looks different, then goes up like any sprite (clipped by walls, sorted, fogged in its own colours)
  const CEIL_CAP = 0.98; // tiles: under a ceiling (and inside the cabin) nothing drawn stands taller; it shrinks to fit
  const LIVE_MAX_PX = 320; // SCALE: tallest live render, px; a nearer walker's picture is scaled up (cost grows with pixels)
  const LIVE_STEP = 32; // SCALE: px a live canvas grows and shrinks in steps of (coarser: fewer resizes, more memory per walker)
  const LIVE_SPARE = 8; // SCALE: spare live canvases kept for the next walkers (the rest are let go)
  const LIVE_IDLE = 60; // frames a walker's canvas is kept while it is not drawn (behind you, behind a wall)
  const LIVE_SHRINK = 30; // renders in a row at under half its canvas before the canvas is made smaller
  const LOD_PX = [160, 64]; // SCALE: on-screen height (px) for detail lod 0 / lod 1; shorter: lod 2
  // the governor's first row (LIVE_START, below), the one the perf A/B measured; a fast machine climbs to richer rows
  const LIVE_NEAR = 3; // SCALE: the nearest this many lod-0 walkers draw every frame they change; the rest take turns
  const NEAR_STICK = 0.95; // a walker near last frame counts as this much nearer when the near ones are picked (no swaps)
  const FAR_LOD = 1; // the most detail a walker taking turns is drawn with (full detail is for the near ones)
  const FAR_EVERY = 2; // SCALE: every other walker draws again only every Nth frame (1 = every frame)
  const LIVE_RENDERS_MAX = 10; // SCALE: live redraws a frame (the near ones count, and go first); the rest keep their picture
  const LIVE_SCALE_LOW = 0.7; // the governor's resolution step: live pictures at 70% (drawn up unsmoothed)
  const POSE_BLEND = 0.15; // seconds into (and out of) a pose (Walker3D.POSE_BLEND when loaded)
  // live figures that are not walkers (the crew on Walker3D's people, the dog and Rivet on Beast3D): one pool and one
  // governor with the walkers. Their owners (js/crew.js, js/robodog.js, js/building.js) animate them with figStep
  const FIG_BLEND = 0.45; // seconds a person takes to sit down, kneel or get up (poseW 0 to 1); animals: Beast3D.POSE_BLEND
  const FIG_LOOP = 3.5; // seconds one loop of a person's pose takes (breathing, a blink, the hammer's strike, the talk)
  const FIG_HEAD_RATE = 5; // radians a second a head turns toward what it looks at
  const FIG_HEAD_REACH = 0.95; // radians: something looked at farther round than this turns the body too (turnTo)
  const FIG_SETTLE = 0.2; // ... until it is this close in front
  const FIG_JUMP = 1.5; // tiles moved in one frame that are a jump (put by a door, beside you), not steps
  // a pose's loop (poseT) is drawn in this many steps at full detail: the slow ones (breathing, a blink: 32 steps never
  // miss its 0.035 of the loop) at 32, a talking mouth and a tremble at 64 (they open, shut and shake many times a
  // loop). Each detail step down halves them (a breath and a blink are a pixel or two there), to at least
  // FIG_POSE_MIN for a person, FIG_POSE_MIN_BEAST for an animal (its tail wags once a loop and must not stutter)
  const FIG_POSE_STEPS = { talk: 64, cower: 64 };
  const FIG_POSE_MIN = 8;
  const FIG_POSE_MIN_BEAST = 16;
  const FIG_FLOOR_MAX = 1.4; // room under an animal's feet for its near paws (cam.floor), at most this x its height
  // the frame-time governor (adaptQuality): slow = the smoothed render over QUALITY_RENDER_MS or frames slower than
  // QUALITY_FRAME_MS; each LIVE_LEVELS row is a whole setting, richest first. It starts on LIVE_START (the defaults
  // above), steps down one row when slow for GOV_WAIT frames and up one when fast (under GOV_FAST x both) for
  // GOV_WAIT_UP frames; a row it had to leave takes twice as long to climb back to each time (up to GOV_BACKOFF x),
  // so a machine on the edge does not see-saw. Near walkers (lod 0, the liveNear nearest) draw every frame they change
  // at every row.
  const QUALITY_RENDER_MS = 12;
  const QUALITY_FRAME_MS = 24;
  const QUALITY_WAIT = 180; // frames before the first quality step (the floor's, then the governor's)
  const GOV_WAIT = 120;
  const GOV_WAIT_UP = 300;
  const GOV_FAST = 0.75;
  const GOV_BACKOFF = 8;
  const LIVE_DEFAULT = { near: LIVE_NEAR, farLod: FAR_LOD, far: FAR_EVERY, max: LIVE_RENDERS_MAX, maxPx: LIVE_MAX_PX, scale: 1, lodPx: LOD_PX };
  // SCALE: the governor's rows; more walkers on screen may need another row below (fewer redraws, lower LOD_PX), a
  // faster target machine another above. Above the defaults, for a machine that stays fast: richer, up to the first
  // design's settings (24 redraws a frame, 400 px pictures, full detail for every walker big enough). Below: cheaper,
  // the cheapest change first
  const LIVE_LEVELS = [
    { near: 6, farLod: 0, far: FAR_EVERY, max: 24, maxPx: 400, scale: 1, lodPx: LOD_PX },
    { near: 4, farLod: FAR_LOD, far: FAR_EVERY, max: 16, maxPx: 400, scale: 1, lodPx: LOD_PX },
    LIVE_DEFAULT,
    Object.assign({}, LIVE_DEFAULT, { far: 3 }),
    Object.assign({}, LIVE_DEFAULT, { far: 3, max: 8 }),
    Object.assign({}, LIVE_DEFAULT, { far: 3, max: 6 }),
    Object.assign({}, LIVE_DEFAULT, { far: 3, max: 6, scale: LIVE_SCALE_LOW }),
    Object.assign({}, LIVE_DEFAULT, { far: 3, max: 6, scale: LIVE_SCALE_LOW, lodPx: [224, 96] }),
  ];
  const LIVE_START = LIVE_LEVELS.indexOf(LIVE_DEFAULT);
  // what Walker3D gets (one object each, refilled per draw: nothing is made per walker per frame)
  const LIVE_ST = { yaw: 0, gait: 0, move: 0, pose: "idle", poseT: 0, poseW: 1, claw: 0, hit: 0, fall: 0, fallDir: Math.PI, seed: 0, lod: 0, fog: 0, gore: true };
  const LIVE_CAM = { w: 0, h: 0, px: 0, dist: 1, eye: 0.5 };
  // has anything the picture shows changed since it was drawn? (numbers in the steps the art draws in)
  const sigGait = (g) => Math.round(g * 32) & 31;
  function sameSig(t, st, fogSteps) {
    return t.sLod === st.lod && t.sPose === st.pose && t.sYaw === Math.round(st.yaw * 64) && t.sGait === sigGait(st.gait) && t.sMove === Math.round(st.move * 16) && t.sPoseT === Math.round(st.poseT * 16) && t.sPoseW === Math.round(st.poseW * 16) && t.sClaw === Math.round(st.claw * 32) && t.sHit === st.hit && t.sFall === Math.round(st.fall * 32) && t.sFallDir === Math.round(st.fallDir * 16) && t.sFog === Math.round(st.fog * fogSteps) && t.sGore === st.gore;
  }
  function saveSig(t, st, fogSteps) {
    t.sLod = st.lod;
    t.sPose = st.pose;
    t.sYaw = Math.round(st.yaw * 64);
    t.sGait = sigGait(st.gait);
    t.sMove = Math.round(st.move * 16);
    t.sPoseT = Math.round(st.poseT * 16);
    t.sPoseW = Math.round(st.poseW * 16);
    t.sClaw = Math.round(st.claw * 32);
    t.sHit = st.hit;
    t.sFall = Math.round(st.fall * 32);
    t.sFallDir = Math.round(st.fallDir * 16);
    t.sFog = Math.round(st.fog * fogSteps);
    t.sGore = st.gore;
  }
  // what a live figure that is not a walker gets (one object, refilled per draw: Walker3D's people read seat, job and
  // run; Beast3D's animals read run, wag and hit; both headYaw), its camera, and its "has it changed" signature
  const FIG_ST = { yaw: 0, gait: 0, move: 0, run: 0, pose: "stand", poseT: 0, poseW: 1, seat: 0, job: null, headYaw: 0, wag: 0.5, hit: 0, seed: 0, lod: 0, fog: 0 };
  const FIG_CAM = { w: 0, h: 0, px: 0, dist: 1, eye: 0.5, floor: 0 };
  // (q: the steps its loop is drawn in now, figPoseQ)
  const figPoseQ = (st, beast) => Math.max(beast ? FIG_POSE_MIN_BEAST : FIG_POSE_MIN, (FIG_POSE_STEPS[st.pose] || 32) >> st.lod);
  function sameFigSig(t, st, fogSteps, q) {
    return t.sLod === st.lod && t.sPose === st.pose && t.sYaw === Math.round(st.yaw * 64) && t.sGait === sigGait(st.gait) && t.sMove === Math.round(st.move * 16) && t.sRun === Math.round(st.run * 16) && t.sPoseT === Math.round(st.poseT * q) && t.sPoseW === Math.round(st.poseW * 16) && t.sSeat === Math.round(st.seat * 64) && t.sJob === st.job && t.sHead === Math.round(st.headYaw * 32) && t.sWag === Math.round(st.wag * 16) && t.sHit === st.hit && t.sFog === Math.round(st.fog * fogSteps);
  }
  function saveFigSig(t, st, fogSteps, q) {
    t.sLod = st.lod;
    t.sPose = st.pose;
    t.sYaw = Math.round(st.yaw * 64);
    t.sGait = sigGait(st.gait);
    t.sMove = Math.round(st.move * 16);
    t.sRun = Math.round(st.run * 16);
    t.sPoseT = Math.round(st.poseT * q);
    t.sPoseW = Math.round(st.poseW * 16);
    t.sSeat = Math.round(st.seat * 64);
    t.sJob = st.job;
    t.sHead = Math.round(st.headYaw * 32);
    t.sWag = Math.round(st.wag * 16);
    t.sHit = st.hit;
    t.sFog = Math.round(st.fog * fogSteps);
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const normAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const flags = (s) => {
    const o = Object.create(null);
    for (const c of s) o[c] = 1;
    return o;
  };
  const IS_SOLID = flags(SOLID);
  const IS_OPAQUE = flags(OPAQUE);
  const TEX_OF = { S: "shelf", X: "crate", G: "glass", L: "locked", E: "exit", T: "tree", H: "house", B: "door", V: "van", O: "doorClosed", W: "window", Q: "stash", U: "window" };
  const READ_REACH = 2.3; // how close a wall sign or a yard lot's sign must be to read it
  const REACH = { note: 1.4, van: 2.0, hole: 1.8, crack: 1.8, lot: READ_REACH, rod: 2.0, crew: 2.2, dog: 2.2 }; // how close E works; everything else 1.6
  const words = (t) => String(t || "").trim().split(/\s+/).filter(Boolean).length;
  ZSR.wordCount = words;
  // reading pace by reading level, in words a minute: a little under grade-level fluency, so a slow reader still finishes
  const READ_WPM = [100, 60, 90, 110, 130, 145, 150];
  /** "x,y" -> index into a gw-wide array, or -1 off the grid. */
  const keyIndex = (k, gw, gh) => {
    const i = k.indexOf(",");
    const x = +k.slice(0, i);
    const y = +k.slice(i + 1);
    return x >= 0 && y >= 0 && x < gw && y < gh ? y * gw + x : -1;
  };
  // a flat top color in darkening steps, so per-column fills never build color strings
  const topShades = new Map();
  const topShade = (color, dark) => {
    let s = topShades.get(color);
    if (!s) topShades.set(color, (s = Array.from({ length: 11 }, (_, i) => D3().mix(color, "#000000", i * 0.08))));
    return s[Math.min(10, Math.round(dark * 10))];
  };

  const Interior = {
    canvas: null,
    ctx: null,
    running: false,
    paused: false,
    mode: null, // "building" | "yard" | "river"
    tool: null, // "rod" while the fishing pole is in your hands instead of a gun
    hooks: {},
    locked: false,
    planeRes: PLANE_RES,
    REACH, // how close E works, by candidate kind (js/crew.js reads it)
    GOAL_AT, // how close a walker stands to a mode's goal to be there (js/yardwreck.js: a wrecker on its spot claws)
    talk: null, // a crew member's speech bubble while it is open (js/crew.js): { id, panel, ... }

    init(canvas, hooks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.hooks = hooks || {};
      this.keys = {};
      this.mouseDown = false;
      const $ = (id) => document.getElementById(id);
      this.hud = { root: $("int-hud"), hpFill: $("int-hp-fill"), hpText: $("int-hp-text"), scrap: $("int-scrap"), cargo: $("int-cargo"), gun: $("int-gun"), place: $("int-place"), goal: $("int-goal"), hint: $("int-hint"), toast: $("int-toast"), phase: $("int-phase"), read: $("int-read") };
      this.bind();
      root.addEventListener("resize", () => this.resize());
      this.resize();
    },

    resize() {
      // one physical pixel per CSS pixel: the chunky comic look survives and the per-column fills stay cheap
      const dpr = 1;
      this.dpr = dpr;
      this.W = root.innerWidth;
      this.H = root.innerHeight;
      this.canvas.width = Math.round(this.W * dpr);
      this.canvas.height = Math.round(this.H * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.imageSmoothingEnabled = false;
      const cols = (this.cols = Math.ceil(this.W / COL));
      // per column: the first opaque distance, every opaque face (for clipping) and the low runs in front of them
      this.zbuf = new Float32Array(cols);
      this.hitN = new Uint8Array(cols);
      this.hitD = new Float32Array(cols * MAX_HITS);
      this.hitTop = new Float32Array(cols * MAX_HITS);
      this.lowN = new Uint8Array(cols);
      this.lowD1 = new Float32Array(cols * MAX_LOW);
      this.lowD2 = new Float32Array(cols * MAX_LOW);
      this.lowTX = new Uint8Array(cols * MAX_LOW);
      this.lowSide = new Uint8Array(cols * MAX_LOW);
      this.lowIdx = new Int32Array(cols * MAX_LOW);
      this.lowDef = new Array(cols * MAX_LOW);
      this.lowNext = new Int8Array(cols); // drawScene: the farthest low run of each column not drawn yet
      this.hitStore = Array.from({ length: cols * MAX_HITS }, () => ({}));
      // per column, seen from under a roof through an opening (a door, the porch edge): what lies farther
      // than capD shows only below capY (the ceiling hides the rest); colIn: the ray passed under a roof
      this.capY = new Float32Array(cols);
      this.capD = new Float32Array(cols);
      this.colIn = new Uint8Array(cols);
      this.edges = [];
      this.sizePlane();
      this.frameHeld = false; // a new canvas is blank: a held frame must be drawn again
    },
    /** Floor and ceiling: a small image, cast per pixel each frame, at 1/planeRes of the view (the view's
        own canvas is left alone, so a quality step does not blank the frame on screen). */
    sizePlane() {
      this.planeW = Math.max(1, Math.ceil(this.W / this.planeRes));
      this.planeH = Math.max(1, Math.ceil(this.H / this.planeRes));
      this.planeCanvas = document.createElement("canvas");
      this.planeCanvas.width = this.planeW;
      this.planeCanvas.height = this.planeH;
      this.planeCtx = this.planeCanvas.getContext("2d");
      this.planeImg = this.planeCtx.createImageData(this.planeW, this.planeH);
      this.planeBuf = new Uint32Array(this.planeImg.data.buffer);
      this.covLo = new Int16Array(this.planeW); // low-res rows hidden behind a full-height wall, per low-res column
      this.covHi = new Int16Array(this.planeW);
      this.planeIn = new Uint8Array(this.planeW); // a low-res column that looks under a house roof (its ceiling is cast)
    },

    /* ---------- Input ---------- */
    bind() {
      const c = this.canvas;
      c.addEventListener("mousedown", (e) => {
        if (!this.running || this.paused) return;
        if (e.button === 0) {
          Audio().unlock();
          const eat = this.eatClick && !this.locked; // only the click that takes the mouse back after a tutorial card (js/tutorial.js)
          this.eatClick = false;
          if (!eat) this.mouseDown = true;
          if (!this.locked && c.requestPointerLock) {
            try {
              const p = c.requestPointerLock();
              if (p && p.catch) p.catch(() => {});
            } catch (err) {
              /* refused: plain mouse movement still turns */
            }
          }
        }
        e.preventDefault();
      });
      root.addEventListener("mouseup", (e) => {
        if (e.button === 0) this.mouseDown = false;
      });
      c.addEventListener("mousemove", (e) => {
        if (!this.running || this.paused) return;
        const dx = e.movementX || 0;
        if (dx) this.player.a += dx * 0.0022 * (State().settings.mouseSens || 1);
      });
      c.addEventListener("contextmenu", (e) => e.preventDefault());
      c.addEventListener(
        "wheel",
        (e) => {
          if (!this.running || this.paused) return;
          e.preventDefault();
          // a sign or list too long for the read panel: the wheel scrolls it, and never switches guns while it is up
          const s = this.readScroller();
          if (s) {
            s.scrollTop += e.deltaY * (e.deltaMode === 1 ? 20 : e.deltaMode === 2 ? s.clientHeight : 1);
            return;
          }
          const now = performance.now();
          if (now - (this.wheelT || 0) < 150) return; // one notch, one gun
          this.wheelT = now;
          this.cycleWeapon(e.deltaY > 0 ? 1 : -1);
        },
        { passive: false }
      );
      document.addEventListener("pointerlockchange", () => {
        this.locked = document.pointerLockElement === c;
        // a lock asked for just before a pause lands after it (Got it on a tutorial card, then P at once): the
        // pause menu would have no mouse, so it goes straight back
        if (this.locked && (!this.running || this.paused) && document.exitPointerLock) {
          this.releasing = true;
          document.exitPointerLock();
          return;
        }
        if (!this.locked && this.running && !this.paused && !this.releasing && this.hooks.onPause) this.hooks.onPause();
        this.releasing = false;
      });
      // physical key positions, so WASD works on any keyboard layout
      const CODE = { KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", KeyE: "e", KeyB: "b", KeyM: "m", KeyP: "p", KeyT: "t", KeyR: "r", KeyQ: "q", Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4", Digit5: "5", Digit6: "6", Numpad1: "1", Numpad2: "2", Numpad3: "3", Numpad4: "4", Numpad5: "5", Numpad6: "6", Space: " ", ShiftLeft: "shift", ShiftRight: "shift", ArrowUp: "arrowup", ArrowDown: "arrowdown", ArrowLeft: "arrowleft", ArrowRight: "arrowright", Escape: "escape" };
      const keyOf = (e) => CODE[e.code] || e.key.toLowerCase();
      root.addEventListener("keydown", (e) => {
        if (!this.running) return;
        const k = keyOf(e);
        if (this.paused) {
          // an overlay of a mode's own (the building map) may take the key first; P and Esc still close the pause menu
          if (!e.repeat && this.modeKey && this.modeKey(k, true)) {
            e.preventDefault();
            return;
          }
          // menus and the workbench own the rest of the keyboard
          if ((k === "p" || k === "escape") && this.hooks.onPauseKey) this.hooks.onPauseKey();
          return;
        }
        if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " ", "e", "shift", "b", "m", "t", "r"].includes(k)) e.preventDefault();
        if (e.repeat) return;
        this.keys[k] = true;
        if (this.modeKey && this.modeKey(k, false)) return;
        if (this.modeCall("Key", k)) return;
        if (k === "e") this.interact();
        if ((k === "p" || k === "escape") && this.hooks.onPause) this.hooks.onPause();
        if (k === "b" && this.hooks.onBackpack) this.hooks.onBackpack();
        if (k === "q") this.cycleWeapon(1);
        // SCALE: guns take keys 1..5 and the fishing pole 6; a sixth gun needs the pole moved first (docs/SCALING.md)
        if (k >= "1" && k <= "5" && k.length === 1) {
          const id = ZSR.Weapons.ORDER.find((w) => ZSR.Weapons.WEAPONS[w].slot === Number(k));
          if (id) this.switchWeapon(id);
        }
        if (k === "6") this.selectRod();
      });
      root.addEventListener("keyup", (e) => {
        this.keys[keyOf(e)] = false;
      });
      // a click outside the page (the chat beside an embedded game) never sends keyup: drop keys and pause
      root.addEventListener("blur", () => {
        this.keys = {};
        this.mouseDown = false;
        if (this.running && !this.paused && this.hooks.onPause) this.hooks.onPause();
      });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden && this.running && !this.paused && this.hooks.onPause) this.hooks.onPause();
      });
    },

    /** The active mode's hook (buildingX in building.js, yardX in yard.js), if it has one. */
    modeCall(name, a, b) {
      const fn = this[this.mode + name];
      return fn ? fn.call(this, a, b) : undefined;
    },

    /* ---------- Shared construction ---------- */
    loadGrid(rows, palette) {
      this.grid = rows.map((r) => r.split(""));
      this.gh = this.grid.length;
      this.gw = this.grid[0].length;
      this.palette = palette;
      this.items = [];
      this.notes = [];
      this.piles = [];
      this.walkers = [];
      this.fallen = []; // downed walkers collapsing, then fading (never in walkers: not solid, not a target, not counted)
      this.blood = []; // blood droplets and splats, world space (only with SETTINGS.walkerGore)
      this.liveRelease(); // the last scene's walker canvases go (liveTarget makes or reuses them as walkers show)
      if (this.modelsReset) this.modelsReset(); // no 3D models stand here yet (js/modelsprite.js: this.models), their canvases go
      this.screamToldT = -Infinity; // when "A scream!" was last said
      this.fence = {}; // "x,y" -> hp
      this.doors = []; // interior doors: { x, y, open }
      this.traps = []; // yard traps: { x, y, type, uses }
      this.cacheDoor = null;
      this.stashDoor = null; // { x, y, open } opens with the key from another building (building.js)
      this.keyPickup = null; // this building's key on its y spot: { x, y, from, taken }
      this.signs = []; // wall signs and graffiti read up close: { x, y, face, id, kind }
      this.lots = []; // the yard plots' signs, read up close: { room, x, y } (yard.js)
      this.readLot = null; // the lot sign opened with E; it stays up until E again or you walk away
      this.readSpot = null; // a list opened with E (the cabin's pantry): { name, x, y }
      this.barriers = null; // the yard's cabin: its doors and windows (js/house.js)
      this.panelKey = null; // what the read-up-close panel shows now
      this.tagPanel = null; // an item tag shown for a few seconds after a pickup: { key, title, text, until }
      this.gunPickup = null; // a gun lying in this building: { x, y, id, taken } (building.js places it)
      this.exit = null;
      this.door = null;
      this.van = null;
      this.house = null; // setHouse: { mask, corner, eave, ridge, roofTex, ceiling }
      this.hudSig = null;
      this.spawns = [];
      this.floors = [];
      this.noise = -99;
      this.noiseR = 0; // how far the last shot carried (tiles)
      this.time = 0;
      this.shake = 0;
      this.phase = null;
      // the scene beyond the grid characters
      this.tileTex = {}; // "x,y" -> texture name, canvas, or { n, e, s, w } per face
      this.tileH = {}; // "x,y" -> height in tiles (0.1 .. 3.5)
      this.lowTiles = {}; // "x,y" -> { h, tex, top }: see-through and solid, drawn as a slab with a lit top
      this.roofs = []; // { x0, y0, x1, y1 (x1, y1 exclusive), eave, ridge, roofTex, gableTex, wallTex? }
      this.props = []; // { x, y, img | art + opts | fig (a live figure), scale, lift, wide | span, solid, foot, cover }: see addProp
      this.blockers = new Set(); // "x,y" tiles that block movement (solid props)
      this.covers = new Set(); // "x,y" tiles that also stop shots (tall solid props; low tiles with `cover`)
      this.landmarks = [];
      const n = this.gw * this.gh;
      this.seen = new Uint8Array(n); // every tile a ray has passed through or hit (the explored map)
      const pal = palette || {};
      this.light = pal.light != null ? clamp(pal.light, 0, 1) : 0.5;
      this.sky = !!pal.sky || pal.ceilingKind === "sky";
      this.ceilingKind = pal.ceilingKind && pal.ceilingKind !== "sky" ? pal.ceilingKind : "panels";
      const fid = D3().floorId(pal.floorKind || (pal.sky ? "grass" : "linoleum"));
      this.floorDefault = fid >= 0 ? fid : D3().floorId("concrete");
      this.floorKind = new Uint8Array(n).fill(this.floorDefault); // per tile, Draw3.floorId values
      this.lowDefs = {
        F: { h: 0.52, tex: "fence" },
        C: { h: 0.45, tex: "counter", top: D3().shade(pal.counter || "#4b5057", 40) },
        K: { h: 0.4, tex: "table", top: D3().shade(pal.table || "#8a6a46", 22) },
        R: { h: 0.35, tex: "bed", top: "#d8d2c0" },
      };
      this.charMaxH = 1;
      for (const row of this.grid) for (const ch of row) if (HEIGHT[ch] > this.charMaxH) this.charMaxH = HEIGHT[ch];
      this.texMemo = new Map();
      this.dimMemo = new Map(); // darker copies of this scene's own pictures (props, low tiles): see dimOwn
      this.fenceTex = null;
      this.holdFrame = false;
      this.sc = null;
      this.maskDirty = true;
      if (this.planeBuf) this.planeBuf.fill(0);
    },
    /** Drop the per-scene caches (textures, floor and ceiling pixels, the movement mask) after changing
        the palette, ceilingKind, light, a registered texture or the van's look while the scene runs. */
    refreshScene() {
      this.sc = null;
      this.texMemo.clear();
      this.dimMemo.clear();
      this.maskDirty = true;
    },
    /** Let go of what only this scene drew with (the darker copies of its props and low tiles, its texture
        and scene lookups), so memory does not pile up from building to building. Rebuilt if it draws again. */
    dropSceneCaches() {
      if (this.dimMemo) this.dimMemo.clear();
      if (this.texMemo) this.texMemo.clear();
      this.liveRelease();
      if (this.modelRelease) this.modelRelease();
      this.sc = null;
    },
    /** A walk-in house under the open sky: `inside(x, y)` says which tiles are under its roof (walls,
        floors, doors, a covered porch). Indoors gets a ceiling at wall height; from outside, its outline
        carries a hip roof that rises `pitch` per tile in from the edge, up to `rise` over the eave.
        opts: { eave, pitch, rise, roofTex, ceiling (a floor kind for the ceiling) }. */
    setHouse(inside, opts) {
      const o = opts || {};
      const gw = this.gw;
      const gh = this.gh;
      const mask = new Uint8Array(gw * gh);
      for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) mask[y * gw + x] = inside(x, y) ? 1 : 0;
      const eave = o.eave || 1;
      const pitch = o.pitch || 0.42;
      const rise = o.rise || 1;
      // roof heights on the tile corners: a corner on the outline is at the eave, one farther in is higher
      // (steps in from the outline, 4-neighbour: a rectangle's hip roof, valleys at inside corners)
      const W1 = gw + 1;
      const corner = new Float32Array(W1 * (gh + 1)).fill(eave);
      const dist = new Int16Array(W1 * (gh + 1)).fill(-1);
      const q = [];
      const tileIn = (x, y) => x >= 0 && y >= 0 && x < gw && y < gh && mask[y * gw + x] === 1;
      for (let y = 0; y <= gh; y++) {
        for (let x = 0; x <= gw; x++) {
          if (!(tileIn(x - 1, y - 1) && tileIn(x, y - 1) && tileIn(x - 1, y) && tileIn(x, y))) {
            dist[y * W1 + x] = 0;
            q.push(y * W1 + x);
          }
        }
      }
      for (let i = 0; i < q.length; i++) {
        const v = q[i];
        const vx = v % W1;
        const vy = (v / W1) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = vx + dx;
          const ny = vy + dy;
          if (nx < 0 || ny < 0 || nx > gw || ny > gh || dist[ny * W1 + nx] >= 0) continue;
          dist[ny * W1 + nx] = dist[v] + 1;
          q.push(ny * W1 + nx);
        }
      }
      for (let i = 0; i < corner.length; i++) corner[i] = eave + Math.min(rise, pitch * dist[i]);
      this.house = { mask, corner, eave, ridge: eave + rise, roofTex: o.roofTex || "roof", ceiling: o.ceiling || "panels" };
      this.sc = null;
      return this.house;
    },
    /** The house roof's height over a point (between its tile corners, bilinear). */
    roofAt(x, y) {
      const gw = this.gw;
      const gh = this.gh;
      const c = this.house.corner;
      const cx = x < 0 ? 0 : x >= gw ? gw - 1 : Math.floor(x);
      const cy = y < 0 ? 0 : y >= gh ? gh - 1 : Math.floor(y);
      const fx = clamp(x - cx, 0, 1);
      const fy = clamp(y - cy, 0, 1);
      const W1 = gw + 1;
      const i = cy * W1 + cx;
      return (c[i] * (1 - fx) + c[i + 1] * fx) * (1 - fy) + (c[i + W1] * (1 - fx) + c[i + W1 + 1] * fx) * fy;
    },
    /** Is this point under the house roof? */
    indoorAt(x, y) {
      const h = this.house;
      const gx = Math.floor(x);
      const gy = Math.floor(y);
      return !!h && gx >= 0 && gy >= 0 && gx < this.gw && gy < this.gh && h.mask[gy * this.gw + gx] === 1;
    },
    /** Paint one tile's floor (a Draw3 floor kind name). */
    setFloor(x, y, kind) {
      const id = D3().floorId(kind);
      if (id >= 0 && x >= 0 && y >= 0 && x < this.gw && y < this.gh) this.floorKind[y * this.gw + x] = id;
    },
    /** Add a prop (drawn with the sprites). A solid one blocks its tile, or its whole `foot: [w, h]`
        (odd sizes, centered on its tile); a solid one taller than eye level is also cover (stops shots)
        unless it says `cover: false`. */
    addProp(p) {
      this.props.push(p);
      if (p.solid) {
        const cx = Math.floor(p.x);
        const cy = Math.floor(p.y);
        const fw = p.foot ? p.foot[0] >> 1 : 0;
        const fh = p.foot ? p.foot[1] >> 1 : 0;
        const cover = p.cover != null ? !!p.cover : (p.lift || 0) + (p.scale || 1) > 0.6;
        for (let y = cy - fh; y <= cy + fh; y++) {
          for (let x = cx - fw; x <= cx + fw; x++) {
            this.blockers.add(x + "," + y);
            if (cover) this.covers.add(x + "," + y);
          }
        }
        this.maskDirty = true;
      }
      return p;
    },
    /** Add a see-through low tile (solid for walking; `cover: true` also stops shots). Tiles that share
        one def object draw as one run. */
    addLow(x, y, def) {
      this.lowTiles[x + "," + y] = def;
      this.maskDirty = true;
      return def;
    },
    startLoop() {
      this.hud.root.classList.remove("hidden");
      this.running = true;
      this.paused = false;
      this.last = 0;
      this.keys = {};
      this.mouseDown = false;
      this.yardHold = false; // only js/tutorial.js sets these, after the scene starts: never carried into a new one
      this.eatClick = false;
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame((ts) => this.frame(ts));
      this.updateHud();
    },
    makePlayer(x, y, a) {
      const S = State();
      const fx = S.effects();
      this.fx = fx;
      this.gun = S.weaponStats();
      const maxHp = S.footMaxHp();
      this.player = { x, y, a, hp: clamp(S.trip ? S.trip.footHp : maxHp, 1, maxHp), maxHp, cooldown: 0, bob: 0, flash: 0, flashL: 0, flashR: 0, side: "L", draw: 0, raise: 1, hurt: 0, moving: false };
      this.tool = null; // every scene starts with a gun in hand
      this.rodHeld = false;
      this.fishing = null; // a line left in the river (death there skips leave) never follows you out; river.js sets its own
    },
    /** The fishing pole in your hands in place of the gun (6). The mode may refuse it (RodSelect: false). */
    selectRod() {
      const S = State();
      if (!this.player || this.tool === "rod") return false;
      if (!S.hasRod()) {
        this.toast("No fishing pole yet. There is one somewhere at Station 12.", 3);
        Audio().play("wrong");
        return false;
      }
      if (this.modeCall("RodSelect") === false) return false;
      this.tool = "rod";
      this.rodHeld = this.mouseDown || !!this.keys[" "]; // a click already held does not cast
      const p = this.player;
      p.raise = 1;
      p.draw = 0;
      Audio().play("equip");
      this.toast("Fishing pole", 1.5);
      this.updateHud();
      return true;
    },
    /** Put a held gun in your hands (the pole goes down first: RodAway). */
    switchWeapon(id) {
      const S = State();
      if (!this.player || (id === this.gun.id && !this.tool)) return false;
      if (!S.hasWeapon(id)) {
        this.toast(ZSR.Weapons.WEAPONS[id].name + ": not found yet. It is somewhere out there.", 2.5);
        Audio().play("wrong");
        return false;
      }
      if (this.tool) {
        this.modeCall("RodAway");
        this.tool = null;
      }
      S.equipWeapon(id);
      this.gun = S.weaponStats(id);
      const p = this.player;
      p.raise = 1;
      p.draw = 0;
      p.cooldown = Math.max(p.cooldown, 0.3);
      Audio().play("equip");
      this.toast(this.gun.name, 1.5);
      this.updateHud();
      return true;
    },
    cycleWeapon(dir) {
      const S = State();
      // the guns in slot order, then the fishing pole once you have it (not while it is propped on a bank)
      const propped = !!(this.fishing && this.fishing.propped);
      const held = S.weaponsHeld().concat(S.hasRod() && !propped ? ["rod"] : []);
      if (held.length < 2) {
        this.toast("Only the pistol so far. Other guns are out there in the city.", 2.5);
        return;
      }
      const i = held.indexOf(this.tool === "rod" ? "rod" : this.gun.id);
      const next = held[(i + dir + held.length) % held.length];
      if (next === "rod") this.selectRod();
      else this.switchWeapon(next);
    },
    /** A walker of `type` (WORLD.WALKER_TYPES; an unknown kind is a plain walker), asleep. Its look and moves:
        heading (radians, where it faces), vx vy (smoothed velocity), gait 0..1 (driven by distance walked), move
        0..1 (idle to walking), act (what stepWalker did last), aim (what it bites or claws), biteT (the lunge),
        screamT (the scream's cooldown), yell (the arms-up scream pose), frenzyT (a scream's speed-up left),
        clawPh 0..1, seed (its look), pose and poseW (the pose drawn and how far into it: animWalker eases them). */
    makeWalker(type, x, y, hpMult) {
      const all = WT();
      const id = all[type] ? type : "walker";
      const t = all[id];
      const hp = Math.round(t.hp * (hpMult == null ? 1 : hpMult));
      return {
        type: id, x, y, hp, maxHp: hp, speed: t.speed * rand(1 - SPEED_JITTER, 1 + SPEED_JITTER), r: t.r,
        dmg: t.bite, reach: t.reach, dps: t.fenceDps, scrap: t.scrap, knock: t.knock, scream: !!t.scream,
        awake: false, path: [], pathT: rand(0, 0.4), cool: 0, hit: 0, hurtT: 0, fenceTarget: null,
        heading: rand(-Math.PI, Math.PI), vx: 0, vy: 0, gait: Math.random(), move: 0, act: "sleep", aim: null,
        biteT: 0, screamT: 0, yell: 0, frenzyT: 0, clawPh: 0, seed: (Math.random() * 1e9) | 0, pose: "idle", poseW: 1,
      };
    },
    /** God mode and the tests: one awake walker of `type` 2 to 4 tiles in front of you, in sight, on ground you could
        walk to in a straight line (so on your side of walls, the fence and the cabin). Null when there is no room. */
    spawnWalkerAhead(type) {
      const p = this.player;
      if (!p || !this.grid) return null;
      const S = State();
      const day = S && S.save ? S.save.day : 1;
      const where = this.mode === "yard" || this.mode === "river" ? this.mode : "building";
      const r = (WT()[type] || WT().walker).r * 0.7;
      const clearWalk = (x, y) => {
        const steps = Math.ceil(Math.hypot(x - p.x, y - p.y) * 4);
        for (let i = 1; i <= steps; i++) if (this.solidForPlayer(p.x + ((x - p.x) * i) / steps, p.y + ((y - p.y) * i) / steps)) return false;
        return true;
      };
      for (const d of [3, 2.5, 3.5, 2, 4]) {
        for (const off of [0, 0.25, -0.25, 0.5, -0.5]) {
          const x = p.x + Math.cos(p.a + off) * d;
          const y = p.y + Math.sin(p.a + off) * d;
          if (this.solidForPlayer(x, y) || !clearWalk(x, y) || !this.lineClear(p.x, p.y, x, y)) continue;
          if (this.solidAt(x - r, y - r) || this.solidAt(x + r, y - r) || this.solidAt(x - r, y + r) || this.solidAt(x + r, y + r)) continue;
          const z = this.makeWalker(type, x, y, W().walkerHpMult(where, day));
          z.awake = true;
          z.heading = normAngle(p.a + Math.PI);
          this.walkers.push(z);
          this.noticeWalker(z);
          this.updateHud();
          return z;
        }
      }
      return null;
    },

    /** Stop the loop and release every input hold (shared by leave and death). */
    stop() {
      this.running = false;
      this.paused = false;
      this.keys = {};
      this.mouseDown = false;
      this.yardHold = false;
      this.eatClick = false;
      cancelAnimationFrame(this.raf);
      this.hud.root.classList.add("hidden");
      if (this.hud.read) this.hud.read.classList.add("hidden");
      this.panelKey = null;
      this.readLot = null;
      this.readSpot = null;
      this.tagPanel = null;
      this.talk = null; // a crew member's speech bubble never outlives the scene
      this.releasing = true;
      this.holdFrame = false;
      this.dropSceneCaches();
      if (document.pointerLockElement === this.canvas && document.exitPointerLock) document.exitPointerLock();
    },
    leave() {
      this.stop();
      const S = State();
      if (S.trip && this.player) S.trip.footHp = this.player.hp;
      this.modeCall("Leave");
    },
    /** A medical kit: back to full health (the backpack calls this). */
    heal() {
      if (!this.player) return false;
      this.player.hp = this.player.maxHp;
      this.player.hurt = 0;
      this.updateHud();
      return true;
    },
    pause() {
      if (!this.running) return;
      this.paused = true;
      this.keys = {};
      this.mouseDown = false;
      if (this.player) this.player.draw = 0; // a half-drawn bow eases off; it never looses on resume
      this.releasing = true;
      if (document.pointerLockElement === this.canvas && document.exitPointerLock) document.exitPointerLock();
    },
    resume() {
      if (!this.running) return;
      this.paused = false;
      this.last = 0;
      this.updateHud();
    },

    /** Movement mask (1 = blocked) from the grid, blockers and low tiles; rebuilt after any change and once a frame.
        Alongside it, coverMask (1 = stops shots without blocking sight: tall solid props, low tiles with `cover`). */
    solidMask() {
      if (this.mask && !this.maskDirty) return this.mask;
      const gw = this.gw;
      const gh = this.gh;
      if (!this.mask || this.mask.length !== gw * gh) {
        this.mask = new Uint8Array(gw * gh);
        this.coverMask = new Uint8Array(gw * gh);
      }
      const m = this.mask;
      const cm = this.coverMask;
      for (let y = 0, i = 0; y < gh; y++) {
        const row = this.grid[y];
        for (let x = 0; x < gw; x++, i++) m[i] = IS_SOLID[row[x]] ? 1 : 0;
      }
      cm.fill(0);
      const mark = (k, arr) => {
        const i = keyIndex(k, gw, gh);
        if (i >= 0) arr[i] = 1;
      };
      this.blockers.forEach((k) => mark(k, m));
      this.covers.forEach((k) => mark(k, cm));
      for (const k in this.lowTiles) {
        mark(k, m);
        if (this.lowTiles[k].cover) mark(k, cm);
      }
      this.maskDirty = false;
      return m;
    },
    /** BFS step counts from a tile over walkable tiles (locked doors count as walls; closed
        interior doors too, unless throughDoors: the player can open those). */
    reachable(sx, sy, throughDoors) {
      const m = this.solidMask();
      const dist = new Map([[sx + "," + sy, 0]]);
      const q = [[sx, sy]];
      while (q.length) {
        const [x, y] = q.shift();
        const d = dist.get(x + "," + y);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= this.gw || ny >= this.gh) continue;
          if ((m[ny * this.gw + nx] && !(throughDoors && this.grid[ny][nx] === "O")) || dist.has(nx + "," + ny)) continue;
          dist.set(nx + "," + ny, d + 1);
          q.push([nx, ny]);
        }
      }
      return dist;
    },
    solidAt(x, y) {
      const gx = Math.floor(x);
      const gy = Math.floor(y);
      if (gx < 0 || gy < 0 || gx >= this.gw || gy >= this.gh) return true;
      return this.solidMask()[gy * this.gw + gx] === 1;
    },
    /** The player never squeezes through a breach: the fence line and a broken window stay solid for them. */
    solidForPlayer(x, y) {
      if (this.solidAt(x, y)) return true;
      const gx = Math.floor(x);
      const gy = Math.floor(y);
      if (this.grid[gy][gx] === "U") return true;
      return this.mode === "yard" && this.isFenceLine(gx, gy);
    },
    opaqueAt(x, y) {
      const gx = Math.floor(x);
      const gy = Math.floor(y);
      if (gx < 0 || gy < 0 || gx >= this.gw || gy >= this.gh) return true;
      return IS_OPAQUE[this.grid[gy][gx]] === 1;
    },
    moveCircle(ent, dx, dy, r, isPlayer) {
      const solid = isPlayer ? (x, y) => this.solidForPlayer(x, y) : (x, y) => this.solidAt(x, y);
      const tryX = ent.x + dx;
      if (!solid(tryX + Math.sign(dx) * r, ent.y - r * 0.7) && !solid(tryX + Math.sign(dx) * r, ent.y + r * 0.7)) ent.x = tryX;
      const tryY = ent.y + dy;
      if (!solid(ent.x - r * 0.7, tryY + Math.sign(dy) * r) && !solid(ent.x + r * 0.7, tryY + Math.sign(dy) * r)) ent.y = tryY;
    },
    walkerOnTile(x, y) {
      return this.walkers.some((z) => Math.floor(z.x) === x && Math.floor(z.y) === y);
    },

    /** Seconds to leave `text` on screen: long enough to read it at the reading level's pace, and never under `min`. */
    readSecs(text, min) {
      const wpm = READ_WPM[State().settings.level] || READ_WPM[0];
      return Math.max(min || 0, 2 + (words(text) * 60) / wpm);
    },
    /** A message at the top of the screen for `secs`; `pickup` marks one E closes (what you just picked up). */
    toast(text, secs, pickup) {
      this.hud.toast.textContent = text;
      this.hud.toast.classList.remove("hidden");
      this.toastPickup = !!pickup;
      clearTimeout(this.toastT);
      this.toastT = setTimeout(() => this.hud.toast.classList.add("hidden"), (secs || 2.5) * 1000);
    },

    /* ---------- Interaction ---------- */
    facing() {
      const p = this.player;
      const cand = [];
      this.modeCall("Facing", cand);
      this.doors.forEach((d) => cand.push({ kind: "idoor", obj: d, x: d.x + 0.5, y: d.y + 0.5 }));
      let best = null;
      cand.forEach((c) => {
        const dx = c.x - p.x;
        const dy = c.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d > (REACH[c.kind] || 1.6)) return;
        const diff = Math.abs(normAngle(Math.atan2(dy, dx) - p.a));
        if (diff > 0.95) return;
        // nearest wins, except a note you have already read steps aside for the door behind it, and a candidate
        // right under the crosshair (`aim`: a crew member, js/crew.js) counts that much nearer
        const score = d + (c.kind === "note" && c.obj.read ? 1.5 : 0) - (c.aim || 0);
        if (!best || score < best.score) best = Object.assign({ d, score }, c);
      });
      return best;
    },
    /** Open or close an interior door. Nothing may stand in the doorway when it closes. */
    toggleDoor(d) {
      const p = this.player;
      if (d.open) {
        if (Math.floor(p.x) === d.x && Math.floor(p.y) === d.y) {
          this.toast("Step out of the doorway first.", 2);
          Audio().play("wrong");
          return;
        }
        if (this.walkerOnTile(d.x, d.y)) {
          this.toast("Something is in the doorway.", 2);
          Audio().play("wrong");
          return;
        }
        d.open = false;
        this.grid[d.y][d.x] = "O";
      } else {
        d.open = true;
        this.grid[d.y][d.x] = "D";
      }
      this.maskDirty = true;
      // a door changes every path
      this.walkers.forEach((z) => (z.pathT = 0));
      Audio().play("click");
    },
    /** What you just picked up is on screen: its tag panel, or its message at the top. */
    pickupShown() {
      return (!!this.tagPanel && this.panelKey === this.tagPanel.key) || (!!this.toastPickup && !this.hud.toast.classList.contains("hidden"));
    },
    /** E closes what you just picked up; that press does nothing else. */
    closePickup() {
      if (!this.pickupShown()) return false;
      this.tagPanel = null;
      if (this.toastPickup) {
        clearTimeout(this.toastT);
        this.hud.toast.classList.add("hidden");
        this.toastPickup = false;
      }
      Audio().play("click");
      return true;
    },
    interact() {
      if (this.closePickup()) return;
      const f = this.facing();
      if (this.talk && this.crewTalkKey && this.crewTalkKey(f)) return; // E again at an open speech bubble (js/crew.js)
      if (!f) return;
      if (f.kind === "idoor") {
        if (!this.modeCall("Door", f.obj)) this.toggleDoor(f.obj);
      } else this.modeCall("Interact", f);
    },

    /* ---------- Update ---------- */
    frame(ts) {
      if (!this.running) return;
      this.raf = requestAnimationFrame((t) => this.frame(t));
      if (!this.last) this.last = ts;
      const gap = ts - this.last;
      const dt = Math.min(0.05, gap / 1000);
      this.last = ts;
      if (!this.paused) this.update(dt);
      if (!this.running) return; // died this frame: the scene is over (and its caches are gone)
      // a still overlay over the paused scene (the building map): draw it once, then leave the canvas be
      if (this.paused && this.holdFrame) {
        if (!this.frameHeld) this.render();
        this.frameHeld = true;
        return;
      }
      this.frameHeld = false;
      const t0 = performance.now();
      this.render();
      this.adaptQuality(performance.now() - t0, gap);
    },
    /** A slow machine trades floor detail for speed: one step coarser if drawing a frame stays slow
        (script time alone, or frames arriving slower than ~42 a second, which also counts the browser's
        own drawing of the uploaded floor and the wall strips). The live walkers have a governor of their own
        (governLive): it steps down through LIVE_LEVELS while frames stay slow, and back up once they are fast. */
    adaptQuality(ms, gap) {
      this.renderMs = this.renderMs == null ? ms : this.renderMs * 0.97 + ms * 0.03;
      if (gap > 0) this.frameMs = this.frameMs == null ? Math.min(gap, 100) : this.frameMs * 0.97 + Math.min(gap, 100) * 0.03;
      this.renderN = (this.renderN || 0) + 1;
      const slow = this.renderMs > QUALITY_RENDER_MS || this.frameMs > QUALITY_FRAME_MS;
      if (this.planeRes < 3 && this.renderN > QUALITY_WAIT && slow) {
        this.planeRes = 3;
        this.sizePlane(); // the floor image only: resizing the view's canvas would blank this frame
      }
      this.governLive(slow);
    },
    /** The live walkers' frame-time governor. It starts on LIVE_START; one LIVE_LEVELS row down after GOV_WAIT slow
        frames in a row (far walkers less often, fewer redraws a frame, a lower resolution, then less detail), one row
        up after enough fast ones (GOV_WAIT_UP, doubled for a row each time it had to step down from it, up to
        GOV_BACKOFF x). Only frames that redrew live walkers count (a calm yard or an empty room says nothing about
        them, and leaves both runs as they are); a fast one counts toward a climb only with liveNear or more of them
        on screen, so a climb means the machine kept up with a crowd. Its state is the row (liveLevel), the waits to
        climb back (liveUpWait, one a row) and the settings it puts in place (setLiveLevel). */
    governLive(slow) {
      if (this.liveLevel == null) this.setLiveLevel(LIVE_START);
      if (this.renderN <= QUALITY_WAIT || !this.liveDrawn) return;
      const fast = this.renderMs < QUALITY_RENDER_MS * GOV_FAST && !(this.frameMs >= QUALITY_FRAME_MS * GOV_FAST);
      if (!slow) this.liveSlowN = 0;
      else this.liveSlowN = (this.liveSlowN || 0) + 1;
      if (!fast) this.liveFastN = 0;
      else if ((this.liveShown || 0) >= this.liveNear) this.liveFastN = (this.liveFastN || 0) + 1;
      const upWait = this.liveUpWait || (this.liveUpWait = []);
      const at = this.liveLevel;
      if (this.liveSlowN >= GOV_WAIT && at < LIVE_LEVELS.length - 1) {
        upWait[at] = Math.min(GOV_WAIT_UP * GOV_BACKOFF, (upWait[at] || GOV_WAIT_UP) * 2); // this row was too much
        this.setLiveLevel(at + 1);
      } else if (at > 0 && this.liveFastN >= (upWait[at - 1] || GOV_WAIT_UP)) this.setLiveLevel(at - 1);
    },
    /** Put one governor row in place: liveNear (how many draw every frame), liveFarLod (the most detail for the
        rest), liveFar (they draw at most every Nth frame), liveMax (redraws a frame), liveMaxPx (the tallest
        picture), liveScale (picture resolution) and liveLodPx (the LOD heights). Instance fields, so a perf run can
        try other values. */
    setLiveLevel(i) {
      const L = LIVE_LEVELS[clamp(i | 0, 0, LIVE_LEVELS.length - 1)];
      this.liveLevel = LIVE_LEVELS.indexOf(L);
      this.liveNear = L.near;
      this.liveFarLod = L.farLod;
      this.liveFar = L.far;
      this.liveMax = L.max;
      this.liveMaxPx = L.maxPx;
      this.liveScale = L.scale;
      this.liveLodPx = L.lodPx;
      this.liveSlowN = 0;
      this.liveFastN = 0;
    },

    update(dt) {
      const p = this.player;
      const S = State();
      const k = this.keys;
      this.time += dt;
      this.maskDirty = true; // other modules may have moved blockers or low tiles since the last frame
      if (k.arrowleft) p.a -= 2.4 * dt;
      if (k.arrowright) p.a += 2.4 * dt;
      let fwd = 0;
      let side = 0;
      if (k.w || k.arrowup) fwd += 1;
      if (k.s || k.arrowdown) fwd -= 1;
      if (k.a) side -= 1;
      if (k.d) side += 1;
      const speed = 3.1 * (k.shift ? 1.35 : 1) * (this.gun.move || 1); // the heavy gun slows you down
      if (fwd || side) {
        const len = Math.hypot(fwd, side) || 1;
        const dx = (Math.cos(p.a) * fwd - Math.sin(p.a) * side) / len;
        const dy = (Math.sin(p.a) * fwd + Math.cos(p.a) * side) / len;
        this.moveCircle(p, dx * speed * dt, dy * speed * dt, 0.3, true);
        p.bob += dt * 9;
        p.moving = true;
      } else p.moving = false;
      p.cooldown -= dt;
      p.flash = Math.max(0, p.flash - dt);
      p.flashL = Math.max(0, p.flashL - dt);
      p.flashR = Math.max(0, p.flashR - dt);
      p.raise = Math.max(0, p.raise - dt * 3.5);
      p.hurt = Math.max(0, p.hurt - dt * 1.5);
      // you heal at home only: very slowly at first, faster once the Water room (or the Well) gives clean water
      if (this.mode === "yard") p.hp = Math.min(p.maxHp, p.hp + (this.fx.footRegen || W().SETTINGS.yardRegen) * dt);

      const held = this.mouseDown || k[" "];
      if (this.tool === "rod") {
        // the pole: each click is one action (cast, reel in, hook a fish); there is nothing to fish without water
        if (held && !this.rodHeld && p.raise <= 0 && this.modeCall("RodClick") === undefined) {
          this.toast("No water to fish in here. Take the pole to River Landing.", 3);
          Audio().play("wrong");
        }
        this.rodHeld = !!held;
      } else if (this.gun.draw) {
        // the bow: hold to draw, let go to shoot; a tiny pull just lets the string back down
        if (held && p.cooldown <= 0 && p.raise <= 0) p.draw = Math.min(1, p.draw + dt / this.gun.draw);
        else if (!held && p.draw > 0) {
          if (p.draw >= 0.2) this.fire(p.draw);
          p.draw = 0;
        }
      } else if (held && p.cooldown <= 0 && p.raise <= 0) this.fire(1);

      this.modeCall("Update", dt);

      // (one killed this frame, by a shot or a trap above, does nothing more: no scream, no bite, no claw)
      this.walkers.forEach((z) => z.hp > 0 && this.updateWalker(z, dt));
      // the dead leave the walkers at once and fall where they stood (this.fallen), then fade
      for (let i = this.walkers.length - 1; i >= 0; i--) if (this.walkers[i].hp <= 0) this.downWalker(this.walkers.splice(i, 1)[0]);
      this.updateFallen(dt);
      this.updateBlood(dt);

      if (p.hp <= 0) {
        if (this.fx.revive && S.trip && !S.trip.revived && this.mode === "building") {
          S.trip.revived = true;
          p.hp = Math.round(p.maxHp * 0.5);
          p.x = this.startPos[0];
          p.y = this.startPos[1];
          this.walkers.forEach((z) => {
            z.awake = false;
            z.cool = 2;
            z.frenzyT = 0;
            z.yell = 0;
          });
          this.toast("Medbay kit: back up at half health.", 3);
        } else {
          this.stop();
          if (this.hooks.onDeath) this.hooks.onDeath();
          return;
        }
      }
      this.shake *= Math.pow(0.02, dt);
      // keep the HUD honest every frame (regen, spawns, breaches, kills, repairs)
      const sig = Math.round(p.hp) + "|" + this.walkers.length + "|" + Object.keys(this.fence).length + "|" + (S.trip ? S.trip.scrap : S.save.scrap);
      if (sig !== this.hudSig) this.updateHud();

      const f = this.facing();
      // (facing nothing with a long speech bubble open, E reads on: js/crew.js crewTalkKey)
      const hint = this.pickupShown() ? "Press E to close" : !f ? (this.talk && this.talk.more ? "Press E to read on" : "") : f.kind === "idoor" ? this.modeCall("DoorHint", f.obj) || (f.obj.open ? "Press E to close the door" : "Press E to open the door") : this.modeCall("Hint", f) || "";
      if (this.hud.hint.textContent !== hint) this.hud.hint.textContent = hint;
      this.updatePanel();
    },

    /* ---------- Reading up close: wall signs inside, plot signs in the yard, item tags ---------- */
    /** The wall sign the player is looking at, close enough to read (it shows on its own), or the yard lot
        sign opened with E while it is still in reach (it shows only when asked for). */
    nearReadable() {
      const p = this.player;
      let best = null;
      // a crew member's speech bubble (js/crew.js) stays up until E again or you walk away from them
      const talk = this.talk;
      if (talk) {
        const sp = this.crewSpeaker ? this.crewSpeaker(talk) : null;
        if (sp && Math.hypot(sp.x - p.x, sp.y - p.y) <= READ_REACH + 0.4) return { talk };
        if (this.crewTalkEnd) this.crewTalkEnd();
        else this.talk = null;
      }
      // a list opened with E (the cabin's pantry) stays up until E again or you walk away
      const spot = this.readSpot;
      if (spot) {
        if (Math.hypot(spot.x - p.x, spot.y - p.y) <= READ_REACH + 0.4) return { spot };
        this.readSpot = null;
      }
      // (sx, sy): the point to see. A sign is a wall tile, so that is the point of its face nearest the player.
      const consider = (x, y, sx, sy, target) => {
        const d = Math.hypot(x - p.x, y - p.y);
        if (d > READ_REACH) return;
        const diff = Math.abs(normAngle(Math.atan2(y - p.y, x - p.x) - p.a));
        if (diff > 0.8 && d > 1.1) return;
        if (!this.lineClear(p.x, p.y, sx, sy)) return; // never through a wall, a shelf or a closed door
        if (!best || d < best.d) best = { d, target };
      };
      this.signs.forEach((sg) => {
        // a sign painted on one face is read from that side only
        if (sg.face === "n" && p.y > sg.y) return;
        if (sg.face === "s" && p.y < sg.y + 1) return;
        if (sg.face === "w" && p.x > sg.x) return;
        if (sg.face === "e" && p.x < sg.x + 1) return;
        // seen across a corner, one of the two faces at that corner must open onto something see-through
        const offX = p.x < sg.x ? -1 : p.x > sg.x + 1 ? 1 : 0;
        const offY = p.y < sg.y ? -1 : p.y > sg.y + 1 ? 1 : 0;
        if (offX && offY && this.opaqueAt(sg.x + offX + 0.5, sg.y + 0.5) && this.opaqueAt(sg.x + 0.5, sg.y + offY + 0.5)) return;
        const fx = clamp(p.x, sg.x - 0.02, sg.x + 1.02);
        const fy = clamp(p.y, sg.y - 0.02, sg.y + 1.02);
        consider(sg.x + 0.5, sg.y + 0.5, fx, fy, { sign: sg });
      });
      if (best) return best.target;
      const lot = this.readLot;
      if (lot && this.lots.includes(lot) && Math.hypot(lot.x - p.x, lot.y - p.y) <= READ_REACH + 0.4 && this.lineClear(p.x, p.y, lot.x, lot.y)) return { lot };
      this.readLot = null; // walked off (or the lot was rebuilt): it closes
      return null;
    },
    /** A cheap identity for what the panel would show, so the panel is rebuilt only when it changes. */
    readableKey(t) {
      const S = State();
      if (t.talk) return t.talk.panel.key;
      if (t.sign) return "sign:" + t.sign.id + ":" + S.settings.level;
      if (t.spot) return this.modeCall("SpotPanel", t.spot).key;
      const lvl = S.save.rooms[t.lot.room] || 0;
      const def = W().BASE_ROOMS[t.lot.room].levels[lvl];
      // a wrecked or cracked build (js/yardwreck.js) shows it, and what a fix costs against the scrap you have
      const dmg = this.buildDmg ? this.buildDmg(t.lot.room) : 0;
      const have = def || dmg ? (def ? Object.keys(def.needs).map((k) => S.save.inventory[k] || 0).join(",") : "") + "," + S.save.scrap : "";
      return "lot:" + t.lot.room + ":" + lvl + ":" + dmg + ":" + S.settings.level + ":" + have;
    },
    signPanel(sg) {
      if (sg.kind === "hnote") {
        // a note the Hollis family left on a wall of the cabin
        const h = ZSR.houseNoteText(sg.note);
        return { key: "sign:" + sg.id + ":" + State().settings.level, kind: "sign", house: true, title: h.title, status: "Left by the Hollis family", text: h.text, id: sg.id };
      }
      const t = ZSR.signText(this.loc.id, sg.id);
      return { key: "sign:" + sg.id + ":" + State().settings.level, kind: sg.kind, title: t.title, text: t.text, id: sg.id };
    },
    /** A yard plot's sign: what it is (or could be), and what the next level needs or why it is locked. */
    lotPanel(lot) {
      const S = State();
      const room = lot.room;
      const def = W().BASE_ROOMS[room];
      const lvl = S.save.rooms[room] || 0;
      const t = ZSR.lotText(room, lvl);
      const meta = [];
      const levelText = ZSR.text();
      const next = levelText && levelText.base && levelText.base.rooms && levelText.base.rooms[room] ? levelText.base.rooms[room].next[lvl] : null;
      if (lvl >= def.levels.length) meta.push(["Built", def.name + " is fully built."]);
      else {
        const c = S.canUpgradeRoom(room);
        if (next) meta.push(["Next", next]);
        const needs = Object.entries(c.def.needs).map(([k, n]) => n + " " + W().ITEMS[k].name + " (have " + (S.save.inventory[k] || 0) + ")").concat([c.def.scrap + " scrap (have " + S.save.scrap + ")"]);
        meta.push(["Needs", needs.join(", ")]);
        if (c.locked.length) meta.push(["Locked", "Build " + c.locked.map((r) => r.name + " to level " + r.level).join(" and ") + " first."]);
        else if (c.ok) meta.push(["Ready", "You have everything. Go inside the cabin to build it."]);
        else meta.push(["Not yet", "Missing: " + Object.entries(c.missing).map(([k, n]) => n + " " + W().ITEMS[k].name).concat(c.scrapShort ? [c.scrapShort + " scrap"] : []).join(", ") + "."]);
      }
      // a wrecked or cracked build (js/yardwreck.js): first what that means and how to fix it (the sign's words
      // say what the room gives; while wrecked it gives nothing)
      const dmg = lvl && this.buildMeta ? this.buildMeta(room) : null;
      if (dmg) meta.unshift(dmg.row);
      const status = (lvl ? def.name + " · level " + lvl + " of " + def.levels.length : def.name + " · empty lot") + (dmg ? " · " + dmg.status : "");
      return { key: "lot:" + room + ":" + lvl + ":" + S.settings.level + ":" + meta.map((m) => m[1]).join("|"), kind: "lot", title: t.title, status, text: t.text, meta };
    },
    /** Show an item's tag after picking it up, for as long as it takes to read. */
    showTag(item, variant, title) {
      const S = State();
      const text = ZSR.tagText(item, variant);
      if (!text) return;
      if (S.seeTag(item) && S.trip) S.trip.wordsRead += words(text);
      this.tagPanel = { key: "tag:" + item + ":" + variant + ":" + this.time, kind: "tag", title: title || W().ITEMS[item].name, status: "The tag says", text, until: this.time + this.readSecs(text, 7) };
    },
    updatePanel() {
      const near = this.nearReadable();
      const tag = !near && this.tagPanel && this.time < this.tagPanel.until ? this.tagPanel : null;
      const key = near ? this.readableKey(near) : tag ? tag.key : null;
      if (key === this.panelKey) return;
      this.panelKey = key;
      const show = near ? (near.talk ? near.talk.panel : near.sign ? this.signPanel(near.sign) : near.spot ? this.modeCall("SpotPanel", near.spot) : this.lotPanel(near.lot)) : tag;
      const el = this.hud.read;
      if (!el) return;
      if (!show) {
        el.classList.add("hidden");
        return;
      }
      if (show.house) State().seeHouseNote(show.id, words(show.text));
      else if (show.kind === "sign" || show.kind === "graffiti") State().seeSign(show.id, words(show.text));
      const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      el.className = "read-panel " + show.kind + (show.cls ? " " + show.cls : ""); // cls: extra classes (a speech bubble's speaker)
      el.innerHTML = '<div class="rp-head"><span class="rp-title">' + esc(show.title) + "</span>" + (show.status ? '<span class="rp-status">' + esc(show.status) + "</span>" : "") + "</div>" + '<div class="rp-text">' + esc(show.text).split(/\n\s*\n/).map((x) => "<p>" + x + "</p>").join("") + "</div>" + (show.meta && show.meta.length ? '<ul class="rp-meta">' + show.meta.map(([h, v]) => "<li><strong>" + esc(h) + ":</strong> " + esc(v) + "</li>").join("") + "</ul>" : "");
      el.scrollTop = 0; // a new panel starts at its top (a long speech bubble is read on with E: js/crew.js)
    },
    /** The box that scrolls when the read panel's words run past its edge: the words (a speech bubble on a wide
        screen), the whole panel, or null when it is closed or all of it shows. */
    readScroller() {
      const el = this.hud && this.hud.read;
      if (!el || !this.panelKey || (el.classList && el.classList.contains("hidden")) || typeof el.querySelector !== "function") return null;
      const words = el.querySelector(".rp-text");
      if (words && words.scrollHeight > words.clientHeight + 2) return words;
      return el.scrollHeight > el.clientHeight + 2 ? el : null;
    },

    /** One walker's frame: what it does (stepWalker), then how that looks (animWalker). */
    updateWalker(z, dt) {
      const x0 = z.x;
      const y0 = z.y;
      const act = this.stepWalker(z, dt);
      this.animWalker(z, dt, x0, y0, act);
    },
    /** What a walker does this frame: wake, scream, bite, wait, claw, walk. Returns what it did:
        "sleep" | "scream" (a screamer's yell: it stands, facing you) | "bite" (at you: lunging or about to) |
        "wait" (where the mode sent it) | "claw" (at a fence, a door or a build) | "walk" | "idle" (nowhere to go). */
    stepWalker(z, dt) {
      const p = this.player;
      const dx = p.x - z.x;
      const dy = p.y - z.y;
      const dist = Math.hypot(dx, dy);
      z.hit = Math.max(0, z.hit - dt);
      z.cool = Math.max(0, z.cool - dt);
      z.hurtT = Math.max(0, z.hurtT - dt);
      z.trapT = Math.max(0, (z.trapT || 0) - dt);
      if (z.slowT > 0) z.slowT -= dt; // a robot dog's zap slows it a while (js/robodog.js)
      // running is loud: sprinting players are noticed from farther away
      const hear = this.keys.shift && this.player.moving ? HEAR_SPRINT : HEAR;
      if (!z.awake && (dist < hear || (this.time - this.noise < 1.5 && dist < this.noiseR) || z.hurtT > 0)) z.awake = true;
      if (!z.awake) return "sleep";
      // the first one of its kind you see: the save remembers the day (looked for a few times a second, until then;
      // a kind already met is not looked for at all)
      if (!z.met && (z.seeT = (z.seeT || 0) - dt) <= 0) {
        z.seeT = 0.4;
        const S = State();
        if (S && S.save && S.save.met && S.save.met[z.type] != null) z.met = true;
        else if (this.seesWalker(z)) this.noticeWalker(z);
      }
      // a screamer that spots you screams (SCREAM): it stands and yells, and every awake walker near it speeds up
      const SC = W().SCREAM;
      if (z.scream && z.screamT <= 0 && z.yell <= 0 && dist < SC.spot && this.lineClear(z.x, z.y, p.x, p.y)) this.screamWalker(z);
      if (z.yell > 0) {
        z.aim = p;
        return "scream";
      }
      // a scream's frenzy: faster for a while (never the tutorial's practice walker)
      const speed = z.speed * (z.frenzyT > 0 && !z.practice ? SC.mult : 1) * (z.slowT > 0 ? z.slowMul || 1 : 1);
      // a bite past a plain walker's reach (a lanky's long arms) needs a clear line: never round a wall's corner
      const reach0 = WT().walker.reach;
      const reach = z.reach != null ? z.reach : reach0;
      if (dist < reach && (dist <= reach0 || this.lineClear(z.x, z.y, p.x, p.y))) {
        z.aim = p;
        if (z.cool <= 0) {
          z.cool = 1.1;
          z.biteT = (W3() && W3().BITE_SECS) || BITE_SECS;
          const bite = Math.round(z.dmg * this.fx.footDamage);
          // the tutorial's practice walker (floorHp) never takes you below it; already below, it does nothing.
          // God mode's can't die: the hit lands, no harm
          if (!State().cheat("noDie")) p.hp -= z.floorHp != null ? Math.max(0, Math.min(bite, p.hp - z.floorHp)) : bite;
          p.hurt = 1;
          this.shake = State().settings.shake ? 8 : 0;
          Audio().play("crunch");
          this.updateHud();
        }
        return "bite";
      }
      // the mode may send a walker somewhere else first (the yard: into the cabin, to wait there)
      const goal = this.modeCall("WalkerGoal", z) || p;
      if (goal !== p && Math.hypot(goal.x - z.x, goal.y - z.y) < GOAL_AT) {
        // there: it waits, or claws at what the goal aims it at (the yard's wreckers at a build or the van)
        if (!goal.aim) return "wait";
        z.aim = goal.aim;
        return "claw";
      }
      z.pathT -= dt;
      if (z.pathT <= 0) {
        z.pathT = 0.4;
        // tiles the mode keeps out of this walker's way (the yard: fence holes too far for it); then never the
        // straight-line shortcut either, which could cut through one of them. `true`: the mode knows there is no
        // way there at all (the yard: outside the fence, no hole in range, going somewhere inside), so nothing is
        // searched (a search that fails walks every tile it can reach) and it claws the nearest fence segment
        const block = this.modeCall("PathBlock", z, goal) || null;
        if (block === true) {
          z.path = [];
          z.barrier = false;
          z.fenceTarget = this.nearestFence(z);
        } else {
          z.path = !block && this.lineClearMove(z.x, z.y, goal.x, goal.y) ? [[goal.x, goal.y]] : this.bfs(z, goal, block);
          // no way there: the mode may know a way through something to break ({ path to it, target }),
          // else the nearest fence segment
          const plan = z.path.length ? null : this.modeCall("Barrier", z, goal);
          if (plan && plan.path.length) {
            z.path = plan.path;
            z.barrier = false;
            z.fenceTarget = null;
          } else {
            z.barrier = !!plan;
            z.fenceTarget = z.path.length ? null : plan ? plan.target : this.nearestFence(z);
          }
        }
      }
      if (z.fenceTarget) {
        const [fx, fy] = z.fenceTarget;
        const tx = fx - z.x;
        const ty = fy - z.y;
        const d = Math.hypot(tx, ty) || 1;
        if (d < 0.95) {
          z.aim = z.fenceTarget;
          const key = Math.floor(fx) + "," + Math.floor(fy);
          const harm = State().cheat("noDie") ? 0 : z.dps * dt; // god mode: they claw, nothing gives
          if (z.barrier) {
            if (!this.modeCall("HitBarrier", key, harm)) z.pathT = 0; // gone (or opened): find the way again
          } else if (this.fence[key] != null) {
            this.fence[key] -= harm;
            if (this.fence[key] <= 0) {
              delete this.fence[key];
              this.grid[Math.floor(fy)][Math.floor(fx)] = ".";
              this.maskDirty = true;
              z.pathT = 0;
              this.toast("Fence breached!", 2.5);
              Audio().play("crunch");
              this.modeCall("Breach", Math.floor(fx), Math.floor(fy)); // the yard works out who the new hole draws
            }
          } else z.pathT = 0;
          return "claw";
        }
        this.moveCircle(z, (tx / d) * speed * dt, (ty / d) * speed * dt, z.r);
        return "walk";
      }
      const target = z.path && z.path.length ? z.path[0] : null;
      if (!target) return "idle";
      const tx = target[0] - z.x;
      const ty = target[1] - z.y;
      const d = Math.hypot(tx, ty) || 1;
      if (d < 0.2 && z.path.length > 1) z.path.shift();
      let vx = (tx / d) * speed;
      let vy = (ty / d) * speed;
      this.walkers.forEach((o) => {
        if (o === z) return;
        const ox = z.x - o.x;
        const oy = z.y - o.y;
        const od = Math.hypot(ox, oy);
        if (od < z.r + o.r && od > 0.001) {
          vx += (ox / od) * 1.2;
          vy += (oy / od) * 1.2;
        }
      });
      this.moveCircle(z, vx * dt, vy * dt, z.r);
      return "walk";
    },
    /** How a walker's frame looks: its smoothed velocity, its heading (turning at most its look's turnRate, else
        TURN_RATE, toward where it walks, or what it bites, claws or screams at), its gait (by distance walked over its
        stride), the walk blend, the pose timers and the pose it shows (eased: out of the old pose, into the new one,
        POSE_BLEND each way). Only looks: nothing here moves it. */
    animWalker(z, dt, x0, y0, act) {
      const mx = z.x - x0;
      const my = z.y - y0;
      const d = Math.hypot(mx, my);
      const g = Math.min(1, dt * 6);
      const M = W3();
      const look = M && M.TYPES ? M.TYPES[z.type] || M.TYPES.walker : null;
      const gt = (look && look.gait) || {};
      if (dt > 0) {
        // smoothed, so a path's grid zig-zag does not swing the heading
        z.vx += (mx / dt - z.vx) * g;
        z.vy += (my / dt - z.vy) * g;
      }
      let want = null;
      const a = z.aim;
      if (a && (act === "bite" || act === "claw" || act === "scream")) {
        const ax = Array.isArray(a) ? a[0] : a.x;
        const ay = Array.isArray(a) ? a[1] : a.y;
        if (Math.hypot(ax - z.x, ay - z.y) > 1e-3) want = Math.atan2(ay - z.y, ax - z.x);
      } else if (Math.hypot(z.vx, z.vy) > 0.15) want = Math.atan2(z.vy, z.vx);
      if (want != null) {
        const m = (gt.turnRate > 0 ? gt.turnRate : TURN_RATE) * dt;
        z.heading = normAngle(z.heading + clamp(normAngle(want - z.heading), -m, m));
      }
      z.gait = (z.gait + d / this.walkerStride(z.type)) % 1;
      z.move += ((dt > 0 && d / dt > 0.2 * z.speed ? 1 : 0) - z.move) * g;
      z.biteT = Math.max(0, z.biteT - dt);
      z.screamT = Math.max(0, z.screamT - dt);
      z.yell = Math.max(0, z.yell - dt);
      z.frenzyT = Math.max(0, z.frenzyT - dt);
      if (act === "claw") z.clawPh = (z.clawPh + dt * (gt.clawRate > 0 ? gt.clawRate : CLAW_RATE)) % 1;
      z.act = act;
      // the pose: from walking straight into the new one; from any other, out of it first (poseW 0 is the walk)
      const pose = this.walkerPose(z);
      const step = dt / ((M && M.POSE_BLEND) || POSE_BLEND);
      if (z.pose == null) {
        z.pose = pose;
        z.poseW = 1;
      } else if (pose === z.pose) z.poseW = Math.min(1, (z.poseW || 0) + step);
      else if (z.pose === "walk" || !(z.poseW > step)) {
        z.pose = pose;
        z.poseW = pose === "walk" ? 1 : 0;
      } else z.poseW -= step;
    },
    /** The pose a walker shows for what it does (Walker3D.POSES): any act this file does not know (a mode's own)
        shows as walking, and the walk blend (move) stands it still when it does not move. */
    walkerPose(z) {
      if (z.yell > 0) return "scream";
      if (z.biteT > 0 || z.act === "bite") return "bite"; // between bites it holds the lunge's end: arms out, at you
      if (z.act === "claw") return "claw"; // a fence, a door, a build, the van: whatever z.aim is
      if (z.act === "sleep" || z.act === "idle" || z.act === "wait") return "idle";
      return "walk";
    },
    /** Tiles a walker of `type` walks per gait cycle (its look's stride, else STRIDE). */
    walkerStride(type) {
      const M = W3();
      const s = M && M.stride ? M.stride(type) : 0;
      return s > 0 ? s : STRIDE;
    },
    /** The screamer's scream (WORLD.SCREAM): it yells, arms up, and every awake walker near it (itself too) speeds up;
        sleepers sleep on. Again only after the cooldown. */
    screamWalker(z) {
      const SC = W().SCREAM;
      z.screamT = SC.cooldown;
      z.yell = SC.yell;
      z.screamed = true;
      this.walkers.forEach((o) => {
        if (!o.awake || o.practice || o.hp <= 0) return;
        if (Math.hypot(o.x - z.x, o.y - z.y) <= SC.radius) o.frenzyT = Math.max(o.frenzyT || 0, SC.secs);
      });
      Audio().play("scream");
      if (this.time - this.screamToldT >= SCREAM_TOAST_GAP) {
        this.screamToldT = this.time;
        this.toast("A scream! Walkers near it speed up.", 3);
      }
    },
    /** In view, in sight and near enough to count as seen. */
    seesWalker(z) {
      const p = this.player;
      if (!p || Math.hypot(z.x - p.x, z.y - p.y) > MEET_RANGE) return false;
      return Math.abs(this.sideOf(z.x, z.y)) < this.halfView() + 0.05 && this.lineClear(p.x, p.y, z.x, z.y);
    },
    /** Half the view's width as an angle (radians off the middle to the screen's edge). FOV spans the view's height;
        its width is W / H times as wide (project() and the rays), so on a wide screen this is more than FOV / 2. */
    halfView() {
      const aspect = this.W > 0 && this.H > 0 ? this.W / this.H : 1;
      return Math.atan(Math.tan(FOV / 2) * aspect);
    },
    /** The first walker of its kind seen or hurt: the save keeps the day (State.meetWalker; the crew's tips read it). */
    noticeWalker(z) {
      if (z.met) return;
      z.met = true;
      const S = State();
      if (S && S.meetWalker && S.save) S.meetWalker(z.type);
    },
    /** A walker just killed falls where it stood: out of the walkers, into this.fallen for FALL_SECS. */
    downWalker(z) {
      const fallen = this.fallen || (this.fallen = []);
      z.fallT = 0;
      if (z.fallDir == null) z.fallDir = normAngle(z.heading + Math.PI); // no shot to fall away from: backwards
      z.act = "fall";
      z.path = [];
      z.aim = null;
      fallen.push(z);
      if (fallen.length > FALLEN_MAX) fallen.shift();
    },
    updateFallen(dt) {
      const fallen = this.fallen;
      if (!fallen || !fallen.length) return;
      const secs = (W3() && W3().FALL_SECS) || FALL_SECS;
      for (let i = fallen.length - 1; i >= 0; i--) {
        const z = fallen[i];
        z.fallT += dt;
        z.hit = Math.max(0, z.hit - dt);
        if (z.fallT >= secs) fallen.splice(i, 1);
      }
    },
    /** A hit's spray (only with SETTINGS.walkerGore): droplets fly away from `from` and land as splats. One in three
        splashes back out to the sides from the front of the body instead, so the shooter sees the spray (the rest
        fly out behind the walker, where its body hides them). */
    bleed(z, dmg, from, kill) {
      if (!W().SETTINGS.walkerGore) return;
      const blood = this.blood || (this.blood = []);
      const h = this.walkerHeight(z); // as drawn: capped under a ceiling and in the cabin
      const away = from ? Math.atan2(z.y - from.y, z.x - from.x) : normAngle(z.heading + Math.PI);
      const n = Math.round((4 + Math.min(8, dmg / 5)) * (kill ? 1.5 : 1));
      for (let i = 0; i < n; i++) {
        const back = i % 3 === 2;
        const a = back ? away + Math.PI + (i % 2 ? 1 : -1) * rand(0.8, 1.3) : away + rand(-0.6, 0.6);
        const v = back ? rand(1, 2) : rand(1.5, 3);
        const off = (back ? -0.6 : 0.5) * z.r; // the front of the body, or its back
        blood.push({ x: z.x + Math.cos(away) * off, y: z.y + Math.sin(away) * off, h: h * rand(0.55, 0.75), vx: Math.cos(a) * v, vy: Math.sin(a) * v, vh: rand(0.5, 1.5), t: 0, life: 1.5, size: rand(0.03, 0.06), splat: false });
      }
      if (blood.length > BLOOD_MAX) blood.splice(0, blood.length - BLOOD_MAX);
    },
    /** Blood in the air falls (and stops at walls); landed, it lies a while, then goes. */
    updateBlood(dt) {
      const blood = this.blood;
      if (!blood || !blood.length) return;
      for (let i = blood.length - 1; i >= 0; i--) {
        const b = blood[i];
        b.t += dt;
        if (!b.splat) {
          const nx = b.x + b.vx * dt;
          const ny = b.y + b.vy * dt;
          if (this.solidAt(nx, ny)) {
            blood.splice(i, 1);
            continue;
          }
          b.x = nx;
          b.y = ny;
          b.vh -= 5 * dt;
          b.h += b.vh * dt;
          if (b.h <= 0) Object.assign(b, { h: 0, vx: 0, vy: 0, vh: 0, t: 0, life: SPLAT_SECS, splat: true, size: b.size * 2 });
        }
        if (b.t >= b.life) blood.splice(i, 1);
      }
    },
    /** The middle of the fence segment nearest this walker, or null. Every clawing walker asks on each re-path, so the
        "x,y" keys are read once each (FENCE_KEYS) and nothing is made per segment. */
    nearestFence(z) {
      let bx = 0;
      let by = 0;
      let bd = Infinity;
      for (const k in this.fence) {
        let xy = FENCE_KEYS.get(k);
        if (!xy) FENCE_KEYS.set(k, (xy = k.split(",").map(Number)));
        const d = Math.hypot(xy[0] + 0.5 - z.x, xy[1] + 0.5 - z.y);
        if (d < bd) {
          bd = d;
          bx = xy[0] + 0.5;
          by = xy[1] + 0.5;
        }
      }
      return bd < Infinity ? [bx, by] : null;
    },

    /** Sight line: low tiles (fences, counters) do not block it. */
    lineClear(x0, y0, x1, y1) {
      const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 4);
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        if (this.opaqueAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false;
      }
      return true;
    },
    /** Shot line: like sight, but cover (a tall solid prop, a landmark's footprint) stops it too. */
    shotClear(x0, y0, x1, y1) {
      const cm = this.solidMask() && this.coverMask;
      const gw = this.gw;
      const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 4);
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        if (this.opaqueAt(x, y) || cm[Math.floor(y) * gw + Math.floor(x)]) return false;
      }
      return true;
    },
    /** Walking line: fences, low tiles and solid props do block it. */
    lineClearMove(x0, y0, x1, y1) {
      const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 4);
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        if (this.solidAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false;
      }
      return true;
    },
    /** The shortest 4-way walk from a walker's tile to p's tile over open tiles: tile middles, or [] when there is
        none. `block` (optional): more tile indices (y * gw + x) to treat as solid, from the mode's PathBlock. */
    bfs(z, p, block) {
      const sx = Math.floor(z.x);
      const sy = Math.floor(z.y);
      const tx = Math.floor(p.x);
      const ty = Math.floor(p.y);
      const m = this.solidMask();
      const key = (x, y) => y * this.gw + x;
      // the blocked tiles, marked on a scratch mask for this search only (no allocation per search)
      let bm = null;
      if (block && block.length) {
        if (!this.blockMask || this.blockMask.length !== m.length) this.blockMask = new Uint8Array(m.length);
        bm = this.blockMask;
        for (let i = 0; i < block.length; i++) bm[block[i]] = 1;
      }
      const prev = new Map();
      const q = [[sx, sy]];
      prev.set(key(sx, sy), null);
      let found = false;
      while (q.length) {
        const [x, y] = q.shift();
        if (x === tx && y === ty) {
          found = true;
          break;
        }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= this.gw || ny >= this.gh) continue;
          const kk = key(nx, ny);
          if (m[kk] || (bm && bm[kk]) || prev.has(kk)) continue;
          prev.set(kk, [x, y]);
          q.push([nx, ny]);
        }
      }
      if (bm) for (let i = 0; i < block.length; i++) bm[block[i]] = 0;
      if (!found) return [];
      const path = [];
      let cur = [tx, ty];
      while (cur && !(cur[0] === sx && cur[1] === sy)) {
        path.push([cur[0] + 0.5, cur[1] + 0.5]);
        cur = prev.get(key(cur[0], cur[1]));
      }
      path.reverse();
      return path.length ? path : [[p.x, p.y]];
    },

    /** Damage a walker; a kill pays scrap to the trip (out there) or the save (at home). `from` ({ x, y }: the player,
        a trap) is where the hit came from: the spray flies away from it, and a kill falls away from it. */
    hurtWalker(z, dmg, from) {
      if (z.hp <= 0) return;
      z.hp -= dmg;
      z.hit = 0.12;
      z.hurtT = 1;
      z.awake = true;
      this.noticeWalker(z);
      this.bleed(z, dmg, from, z.hp <= 0);
      if (z.hp <= 0) {
        if (from) z.fallDir = Math.atan2(z.y - from.y, z.x - from.x);
        const S = State();
        if (S.trip) {
          S.trip.walkers += 1;
          S.trip.scrap += z.scrap;
        } else {
          S.save.scrap += z.scrap;
          S.save.stats.walkers += 1;
        }
        Audio().play("poof");
        this.updateHud();
      }
    },
    /** One shot (one arrow) from the gun in hand. power 0..1 is the bow's draw. */
    fire(power) {
      const g = this.gun;
      const p = this.player;
      p.cooldown = g.interval;
      const flash = Math.min(0.08, g.interval * 0.75);
      if (g.id === "dual") {
        p.side = p.side === "R" ? "L" : "R";
        if (p.side === "R") p.flashR = flash;
        else p.flashL = flash;
      } else p.flash = flash;
      if (g.noise > 0) {
        this.noise = this.time;
        this.noiseR = g.noise;
        this.modeCall("Noise", g.noise);
      }
      if (g.shake && State().settings.shake) this.shake = Math.max(this.shake, g.shake);
      this.shoot(power);
      Audio().play(g.id === "bow" ? "bow" : g.id === "hmg" ? "heavy" : "shoot");
    },
    shoot(power) {
      const g = this.gun;
      const p = this.player;
      // aim error: wider on the move, and a half-drawn bow is shaky
      const spread = g.spread * (p.moving ? 1.6 : 1) * (g.draw ? 2 - power : 1);
      const hits = this.walkersOnLine((Math.random() * 2 - 1) * spread, g.range).slice(0, g.pierce);
      const dmg = g.draw ? g.damage * (0.3 + 0.7 * power) : g.damage;
      hits.forEach((z, i) => this.hurtWalker(z, Math.round(dmg * (i ? 0.6 : 1)), p)); // a round that went through one walker hits the next softer
      if (hits.length) Audio().play("hit");
    },
    /** Walkers under the crosshair (plus an angle), nearest first, within range, with a clear shot
        (walls and cover stop it: a tall solid prop or a landmark's footprint; counters and the fence do not). */
    walkersOnLine(angleOff, range) {
      const p = this.player;
      const a = p.a + angleOff;
      const out = [];
      this.walkers.forEach((z) => {
        const dx = z.x - p.x;
        const dy = z.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.05 || dist > (range || Infinity)) return;
        const ang = normAngle(Math.atan2(dy, dx) - a);
        const halfWidth = Math.atan2(z.r * 1.1, dist);
        if (Math.abs(ang) > halfWidth) return;
        if (!this.shotClear(p.x, p.y, z.x, z.y)) return;
        out.push({ z, dist });
      });
      return out.sort((m, n) => m.dist - n.dist).map((o) => o.z);
    },
    walkerAt(angleOff, range) {
      return this.walkersOnLine(angleOff, range)[0] || null;
    },

    updateHud() {
      const S = State();
      const p = this.player;
      const h = this.hud;
      if (!p) return;
      this.hudSig = Math.round(p.hp) + "|" + this.walkers.length + "|" + Object.keys(this.fence).length + "|" + (S.trip ? S.trip.scrap : S.save.scrap);
      const pct = clamp((p.hp / p.maxHp) * 100, 0, 100);
      h.hpFill.style.width = pct + "%";
      h.hpFill.style.background = pct > 50 ? "#7a9a3c" : pct > 25 ? "#d9a21b" : "#b3261e";
      h.hpText.textContent = Math.max(0, Math.round(p.hp));
      h.scrap.textContent = S.save.scrap + (S.trip ? S.trip.scrap : 0);
      const cargoN = S.trip ? Object.values(S.trip.cargo).reduce((a, b) => a + b, 0) : 0;
      h.cargo.textContent = cargoN;
      if (h.gun && this.gun) h.gun.textContent = this.tool === "rod" ? "6 Fishing pole" : this.gun.slot + " " + this.gun.name;
      h.goal.textContent = this.modeCall("Goal") || "";
    },

    /* ---------- Render ----------
       1. one DDA per screen column finds the opaque faces and the low runs in front of them;
       2. floor and ceiling (or sky), cast per pixel at reduced resolution, skipping what a wall hides;
       3. per column, opaque faces back to front (a short wall lets a taller one behind it show);
       4. per column, painter's order: see-through low runs and sprites, far to near,
          each clipped to the opaque faces in front of it. */
    render() {
      const ctx = this.ctx;
      const Wd = this.W;
      const H = this.H;
      const p = this.player;
      if (!p || !this.grid) return;
      const sc = this.prepScene();
      this.frameNo = (this.frameNo || 0) + 1; // the live walkers' cadence and canvas sweep count frames
      ctx.save();
      if (this.shake > 0.5) ctx.translate(rand(-this.shake, this.shake), rand(-this.shake, this.shake));
      if (this.sky) {
        const heavy = this.phase && this.phase.kind === "wave" && this.phase.size === "many";
        const grad = ctx.createLinearGradient(0, 0, 0, H / 2);
        grad.addColorStop(0, heavy ? "#5a3a3a" : "#7f98b3");
        grad.addColorStop(1, heavy ? "#b06a3a" : "#c9d6df");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, Wd, H / 2 + 1);
        // a crossover universe's sky over the yard (Mira-9, or the shipyard ring: js/crossart.js); the walls, the
        // cabin's roof and the trees drawn next cover it where they stand
        const uni = this.mode === "yard" && ZSR.Crossover && State().universeDef ? State().universeDef() : null;
        if (uni && uni.sky) ZSR.Crossover.sky(ctx, Wd, H, p.a, uni.sky, heavy);
      }
      const dirX = Math.cos(p.a);
      const dirY = Math.sin(p.a);
      const planeScale = Math.tan(FOV / 2);
      const planeX = -dirY * planeScale;
      const planeY = dirX * planeScale;
      const aspect = Wd / H;
      this.castColumns(sc, dirX, dirY, planeX * aspect, planeY * aspect);
      this.drawPlanes(ctx, sc, dirX, dirY, planeX * aspect, planeY * aspect);
      this.drawFaces(ctx, sc);
      this.drawScene(ctx, sc, dirX, dirY, planeX, planeY, aspect);
      ctx.restore();
      if (p.hurt > 0) {
        const g = ctx.createRadialGradient(Wd / 2, H / 2, H * 0.3, Wd / 2, H / 2, H * 0.8);
        g.addColorStop(0, "rgba(179,38,30,0)");
        g.addColorStop(1, "rgba(179,38,30," + (0.65 * p.hurt).toFixed(2) + ")");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, Wd, H);
      }
      ZSR.Draw.vignette(ctx, Wd, H);
      if (this.tool === "rod" && ZSR.RiverArt) {
        this.drawRod(ctx, Wd, H);
        if (this.drawOverlay) this.drawOverlay(ctx, Wd, H);
        return;
      }
      const g = this.gun;
      const mods = State().save.weapons.mods[g.id]; // every mod tier shows on the gun in your hands
      D3().gun(ctx, Wd, H, { weapon: g.id, mods, bob: p.moving ? p.bob : 0, flash: p.flash, flashL: p.flashL, flashR: p.flashR, draw: p.draw, loaded: p.cooldown <= 0, raise: p.raise });
      // the gap opens with the gun's spread (and closes as the bow comes to full draw); red means in range
      const gap = 4 + g.spread * H * 0.5 * (p.moving ? 1.6 : 1) * (g.draw ? 2 - p.draw : 1);
      D3().crosshair(ctx, Wd / 2, H / 2, !!this.walkerAt(0, g.range), gap);
      if (this.drawOverlay) this.drawOverlay(ctx, Wd, H);
    },
    /** The pole in your hands and, while it is cast, its line out to the bobber wherever you look:
        to the bobber on screen, or off the edge of the screen on its side when it is behind you. */
    drawRod(ctx, Wd, H) {
      const p = this.player;
      const view = this.modeCall("RodView") || {};
      const tip = ZSR.RiverArt.rodInHand(ctx, Wd, H, Object.assign({ bob: p.moving ? p.bob : 0, raise: p.raise }, view));
      if (!view.line) return;
      const q = this.project(view.line.x, view.line.y, 0.06);
      const end = q ? { x: q.x, y: q.y } : { x: q === null && this.sideOf(view.line.x, view.line.y) < 0 ? -40 : Wd + 40, y: H * 0.75 };
      const sag = Math.min(H * 0.25, Math.hypot(end.x - tip.x, end.y - tip.y) * 0.18) * (view.bend ? 0.2 : 1);
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.quadraticCurveTo((tip.x + end.x) / 2, Math.max(tip.y, end.y) + sag, end.x, end.y);
      ctx.strokeStyle = "rgba(15,16,18,0.55)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = "rgba(244,244,236,0.95)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    },
    /** A point on the ground (lifted `lift` tiles) on screen: { x, y }, or null when it is behind you. */
    project(x, y, lift) {
      const p = this.player;
      const dirX = Math.cos(p.a);
      const dirY = Math.sin(p.a);
      const k = Math.tan(FOV / 2);
      const planeX = -dirY * k;
      const planeY = dirX * k;
      const invDet = 1 / (planeX * dirY - dirX * planeY);
      const sx = x - p.x;
      const sy = y - p.y;
      const tx = invDet * (dirY * sx - dirX * sy);
      const ty = invDet * (-planeY * sx + planeX * sy);
      if (ty <= 0.1) return null;
      const aspect = this.W / this.H;
      return { x: (this.W / 2) * (1 + tx / ty / aspect), y: this.H / 2 + (this.H / ty) * (0.5 - (lift || 0)) };
    },
    /** Which side of your view a point is on: negative left, positive right. */
    sideOf(x, y) {
      const p = this.player;
      return normAngle(Math.atan2(y - p.y, x - p.x) - p.a);
    },

    /** A texture by name for this scene (memoized; cleared when the scene or the van's look changes). */
    tex(name, style) {
      const key = style ? name + "|" + style : name;
      let t = this.texMemo.get(key);
      if (!t) {
        t = D3().texture(name, this.palette, style ? { style } : undefined);
        this.texMemo.set(key, t);
      }
      return t;
    },
    /** The fence segment's face: the mode's own drawings (this.fenceTex) when it set them, else the plain pickets. */
    fenceLook(cracked) {
      const own = this.fenceTex;
      const t = own ? (cracked ? own.cracked : own.whole) || own.whole : null;
      if (!t) return this.tex(cracked ? "fenceCracked" : "fence");
      return typeof t === "string" ? this.tex(t) : t;
    },
    /** A darker copy of one of this scene's own pictures (a prop, a low tile's face), level 1..8 = 10%..80%
        darker, drawn as Draw3.dim draws it. Kept in this scene's memo, not Draw3's, so leaving the scene
        lets them go: Draw3 keeps its pictures for good, and with them every darker copy it made. */
    dimOwn(img, level) {
      const k = Math.max(0, Math.min(8, level | 0));
      if (!k) return img;
      let set = this.dimMemo.get(img);
      if (!set) this.dimMemo.set(img, (set = []));
      let c = set[k];
      if (!c) {
        c = set[k] = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const g = c.getContext("2d");
        g.drawImage(img, 0, 0);
        g.globalCompositeOperation = "source-atop";
        g.fillStyle = "rgba(0,0,0," + (k * 0.1).toFixed(2) + ")";
        g.fillRect(0, 0, img.width, img.height);
      }
      return c;
    },

    /** Per-frame lookups from the scene lists (roofs, low tiles, heights, textures, floor kinds). */
    prepScene() {
      const gw = this.gw;
      const gh = this.gh;
      const n = gw * gh;
      let sc = this.sc;
      if (!sc || sc.n !== n) sc = this.sc = { n, roof: new Int16Array(n), low: new Int16Array(n), h: new Float32Array(n), tex: new Array(n), texAt: [], lows: [], ftex: [], used: [], rowE: [], rowO: [], present: new Uint8Array(256) };
      let maxH = this.charMaxH;
      sc.roof.fill(-1);
      this.roofs.forEach((r, i) => {
        r._alongX = r.x1 - r.x0 >= r.y1 - r.y0; // the ridge runs along the long side
        r._line = r._alongX ? (r.y0 + r.y1) / 2 : (r.x0 + r.x1) / 2;
        r._half = r._alongX ? (r.y1 - r.y0) / 2 : (r.x1 - r.x0) / 2;
        r._eave = r.eave != null ? r.eave : 1;
        r._ridge = r.ridge != null ? r.ridge : r._eave + 0.7;
        if (r._ridge > maxH) maxH = r._ridge;
        for (let y = Math.max(0, r.y0); y < Math.min(gh, r.y1); y++) for (let x = Math.max(0, r.x0); x < Math.min(gw, r.x1); x++) sc.roof[y * gw + x] = i;
      });
      sc.low.fill(-1);
      sc.lows.length = 0;
      for (const k in this.lowTiles) {
        const i = keyIndex(k, gw, gh);
        if (i < 0) continue;
        const ld = this.lowTiles[k];
        sc.low[i] = sc.lows.push(ld) - 1;
        if (ld.h > maxH) maxH = ld.h; // a tall see-through tile (a lattice tower) can show over anything in front
      }
      sc.h.fill(0);
      for (const k in this.tileH) {
        const i = keyIndex(k, gw, gh);
        const v = this.tileH[k];
        if (i < 0 || !(v > 0)) continue;
        sc.h[i] = v;
        if (v > maxH) maxH = v;
      }
      sc.texAt.forEach((i) => (sc.tex[i] = undefined));
      sc.texAt.length = 0;
      for (const k in this.tileTex) {
        const i = keyIndex(k, gw, gh);
        if (i < 0) continue;
        sc.tex[i] = this.tileTex[k];
        sc.texAt.push(i);
      }
      if (this.house && this.house.ridge > maxH) maxH = this.house.ridge;
      sc.maxH = maxH;
      sc.ceilH = this.sky ? Infinity : 1; // under a ceiling a full-height wall hides everything behind it
      // daylight in the yard (thin haze: the back row of plots still reads from the cabin door); inside,
      // palette.light sets how fast it gets dark (0.5 keeps the old falloff)
      const outdoors = this.mode === "yard" || this.mode === "river";
      sc.fogK = 1 / (outdoors ? 32 : 5 + 17 * this.light);
      sc.fogMax = outdoors ? 0.8 : 0.8 + Math.max(0, 0.5 - this.light) * 0.2;
      // floor kinds in use (other modules may repaint tiles at any time)
      const fk = this.floorKind;
      const present = sc.present;
      present.fill(0);
      present[this.floorDefault] = 1;
      for (let i = 0; i < n; i++) present[fk[i]] = 1;
      sc.used.length = 0;
      for (let id = 0; id < 256; id++) {
        if (!present[id]) continue;
        sc.used.push(id);
        if (!sc.ftex[id]) sc.ftex[id] = D3().floorTexels(id, this.palette, false);
      }
      if (!this.sky && !sc.ctex) sc.ctex = D3().floorTexels(this.ceilingKind, this.palette, true);
      if (this.sky && this.house && !sc.ctex) sc.ctex = D3().floorTexels(this.house.ceiling, this.palette, true);
      return sc;
    },

    /** Floor and ceiling: cast per pixel into a small image (distance-shaded, dithered between shades), scaled up unsmoothed. */
    drawPlanes(ctx, sc, dirX, dirY, pX, pY) {
      const Wd = this.W;
      const H = this.H;
      const half = H / 2;
      const R = this.planeRes;
      const p = this.player;
      const lw = this.planeW;
      const lh = this.planeH;
      const buf = this.planeBuf;
      const gw = this.gw;
      const gh = this.gh;
      const fk = this.floorKind;
      const defK = this.floorDefault;
      const L = D3().SHADES - 1;
      const toLvl = L / D3().SHADE_MAX;
      const fogK = sc.fogK;
      const fogMax = sc.fogMax;
      const used = sc.used;
      const ftex = sc.ftex;
      const rowE = sc.rowE;
      const rowO = sc.rowO;
      // under open sky with a walk-in house: the ceiling is cast only where a ray looks under its roof,
      // and only over its tiles; everywhere else above the horizon stays clear (the sky)
      const house = this.sky ? this.house : null;
      const hmask = house ? house.mask : null;
      const ctex = this.sky && !house ? null : sc.ctex;
      const planeIn = this.planeIn;
      // the ray through the center of low-res pixel column x is dir + plane * (cam0 + x * camStep)
      const camStep = (2 * R) / Wd;
      const cam0 = R / Wd - 1;
      const rx0 = dirX + pX * cam0;
      const ry0 = dirY + pY * cam0;
      const rsx = pX * camStep;
      const rsy = pY * camStep;
      // pixels hidden behind a full-height wall are not cast (wall faces are opaque)
      const covLo = this.covLo;
      const covHi = this.covHi;
      const store = this.hitStore;
      for (let x = 0; x < lw; x++) {
        const c0 = Math.floor((x * R) / COL);
        const c1 = Math.min(this.cols - 1, Math.floor(((x + 1) * R - 1) / COL));
        let top = -Infinity;
        let bot = Infinity;
        if (hmask) {
          let lin = 0;
          for (let c = c0; c <= c1; c++) lin |= this.colIn[c];
          planeIn[x] = lin;
        }
        for (let c = c0; c <= c1 && top < Infinity; c++) {
          const h = this.hitN[c] ? store[c * MAX_HITS] : null;
          if (!h || !h.full) top = Infinity;
          else {
            if (h.occ > top) top = h.occ;
            if (h.bottom < bot) bot = h.bottom;
          }
        }
        covLo[x] = top === Infinity ? 32767 : Math.ceil(top / R);
        covHi[x] = top === Infinity ? -1 : Math.floor(bot / R) - 1;
      }
      for (let y = 0; y < lh; y++) {
        const sy = y * R + R / 2 - half;
        if (sy < 0 && !ctex) continue; // open sky: those pixels stay clear
        const dist = (0.5 * H) / Math.max(0.5, Math.abs(sy));
        const lv = Math.min(fogMax, dist * fogK) * toLvl;
        const k0 = lv | 0;
        const k1 = k0 < L ? k0 + 1 : L;
        const fr = lv - k0;
        // 2 x 2 ordered dither between the two nearest shades: a light halftone feel, no banding
        const tE = y & 1 ? 0.875 : 0.125;
        const tO = y & 1 ? 0.375 : 0.625;
        let fx = p.x + dist * rx0;
        let fy = p.y + dist * ry0;
        const stx = dist * rsx;
        const sty = dist * rsy;
        let o = y * lw;
        const end = o + lw;
        if (sy >= 0) {
          for (let u = 0; u < used.length; u++) {
            const t = ftex[used[u]];
            rowE[used[u]] = t[fr > tE ? k1 : k0];
            rowO[used[u]] = t[fr > tO ? k1 : k0];
          }
          for (let x = 0; o < end; x++, o++, fx += stx, fy += sty) {
            if (y >= covLo[x] && y <= covHi[x]) continue;
            const cx = Math.floor(fx);
            const cy = Math.floor(fy);
            const id = cx >= 0 && cy >= 0 && cx < gw && cy < gh ? fk[cy * gw + cx] : defK;
            buf[o] = (x & 1 ? rowO : rowE)[id][((((fy - cy) * 64) | 0) << 6) | (((fx - cx) * 64) | 0)];
          }
        } else if (hmask) {
          const cE = ctex[fr > tE ? k1 : k0];
          const cO = ctex[fr > tO ? k1 : k0];
          for (let x = 0; o < end; x++, o++, fx += stx, fy += sty) {
            if (!planeIn[x]) {
              buf[o] = 0;
              continue;
            }
            if (y >= covLo[x] && y <= covHi[x]) continue;
            const cx = Math.floor(fx);
            const cy = Math.floor(fy);
            buf[o] = cx >= 0 && cy >= 0 && cx < gw && cy < gh && hmask[cy * gw + cx] ? (x & 1 ? cO : cE)[((((fy - cy) * 64) | 0) << 6) | (((fx - cx) * 64) | 0)] : 0;
          }
        } else {
          const cE = ctex[fr > tE ? k1 : k0];
          const cO = ctex[fr > tO ? k1 : k0];
          for (let x = 0; o < end; x++, o++, fx += stx, fy += sty) {
            if (y >= covLo[x] && y <= covHi[x]) continue;
            const cx = Math.floor(fx);
            const cy = Math.floor(fy);
            buf[o] = (x & 1 ? cO : cE)[((((fy - cy) * 64) | 0) << 6) | (((fx - cx) * 64) | 0)];
          }
        }
      }
      // under open sky only the ground rows were cast: upload and draw just those
      const y0 = ctex ? 0 : clamp(Math.ceil((half - R / 2) / R), 0, lh - 1);
      this.planeCtx.putImageData(this.planeImg, 0, 0, 0, y0, lw, lh - y0);
      ctx.drawImage(this.planeCanvas, 0, y0, lw, lh - y0, 0, y0 * R, lw * R, (lh - y0) * R);
    },

    /** One DDA per screen column: marks seen tiles, keeps the low runs in front and the opaque faces (near to far). */
    castColumns(sc, dirX, dirY, pX, pY) {
      const Wd = this.W;
      const H = this.H;
      const half = H / 2;
      const p = this.player;
      const px = p.x;
      const py = p.y;
      const grid = this.grid;
      const gw = this.gw;
      const gh = this.gh;
      const seen = this.seen;
      const roofOf = sc.roof;
      const lowOf = sc.low;
      const lows = sc.lows;
      const lowDefs = this.lowDefs;
      const store = this.hitStore;
      // tiles a 3D model stands on and draws itself (js/modelsprite.js: the van's V tiles): see-through here, still
      // solid and opaque everywhere else (sight, shots, walkers, the map)
      const see = this.modelSee;
      const { zbuf, hitN, hitD, hitTop, lowN, lowD1, lowD2, lowTX, lowSide, lowIdx, lowDef } = this;
      const maxSteps = gw + gh + 8;
      const rise = sc.maxH - 0.5; // the tallest thing anywhere, above eye level
      const sx0 = Math.floor(px);
      const sy0 = Math.floor(py);
      if (sx0 >= 0 && sy0 >= 0 && sx0 < gw && sy0 < gh) seen[sy0 * gw + sx0] = 1;
      // a walk-in house under the sky: each ray knows whether it is under the roof (see setHouse)
      const hmask = this.sky && this.house ? this.house.mask : null;
      const startIn = !!hmask && sx0 >= 0 && sy0 >= 0 && sx0 < gw && sy0 < gh && hmask[sy0 * gw + sx0] === 1;
      const capY = this.capY;
      const capD = this.capD;
      const colIn = this.colIn;
      for (let col = 0; col < this.cols; col++) {
        const cameraX = (2 * (col * COL + COL / 2)) / Wd - 1;
        const rdx = dirX + pX * cameraX;
        const rdy = dirY + pY * cameraX;
        let mapX = sx0;
        let mapY = sy0;
        const deltaX = Math.abs(1 / (rdx || 1e-9));
        const deltaY = Math.abs(1 / (rdy || 1e-9));
        const stepX = rdx < 0 ? -1 : 1;
        const stepY = rdy < 0 ? -1 : 1;
        let sideX = rdx < 0 ? (px - mapX) * deltaX : (mapX + 1 - px) * deltaX;
        let sideY = rdy < 0 ? (py - mapY) * deltaY : (mapY + 1 - py) * deltaY;
        let nh = 0;
        let nl = 0;
        let clip = Infinity; // top of the opaque faces found so far
        let lastRoof = -1;
        let lastLow = -9;
        let lastDef = null;
        let lastKept = false;
        const lb = col * MAX_LOW;
        const hb = col * MAX_HITS;
        let inside = startIn; // under the house roof right now
        let skipHouse = false; // behind a house wall seen from outside: its inside is hidden
        let cD = Infinity;
        let cY = -Infinity;
        let cin = startIn ? 1 : 0;
        for (let i = 0; i < maxSteps; i++) {
          let d;
          let side;
          if (sideX < sideY) {
            d = sideX;
            sideX += deltaX;
            mapX += stepX;
            side = 0;
          } else {
            d = sideY;
            sideY += deltaY;
            mapY += stepY;
            side = 1;
          }
          if (nh && half - (rise * H) / d >= clip) break; // nothing farther can rise above what is in front
          const out = mapX < 0 || mapY < 0 || mapX >= gw || mapY >= gh;
          if (out && nh) break;
          const idx = out ? -1 : mapY * gw + mapX;
          const ch = out ? "#" : grid[mapY][mapX];
          const hin = !!hmask && !out && hmask[idx] === 1;
          if (hmask) {
            if (skipHouse) {
              if (hin) continue;
              skipHouse = false;
            }
            if (inside && !hin) {
              // out from under the roof (a doorway, the porch edge): farther on, the ceiling hides all above
              // the opening's top
              inside = false;
              if (cD === Infinity) {
                cD = d;
                cY = half - (0.5 * H) / (d > 0.05 ? d : 0.05);
              }
            } else if (!inside && hin && IS_OPAQUE[ch] !== 1) {
              // in under the roof through an opening: the roof over it shows above, nothing in front of it
              inside = true;
              cin = 1;
              if (nh < MAX_HITS) {
                const hit = store[hb + nh];
                hit.perp = d > 0.05 ? d : 0.05;
                hit.idx = idx;
                hit.x = mapX;
                hit.y = mapY;
                hit.ch = ch;
                hit.side = side;
                hit.roof = -1;
                hit.rdx = rdx;
                hit.rdy = rdy;
                hit.open = true;
                hit.indoor = false;
                hit.hroof = this.houseRoofY(px, py, rdx, rdy, d, mapX, mapY, sideX, sideY, deltaX, deltaY, stepX, stepY);
                this.faceGeom(hit, sc);
                if (hit.occ < clip) {
                  hit.full = false;
                  hitD[hb + nh] = hit.perp;
                  hitTop[hb + nh] = 1e9; // a roof over a hole: what is behind still shows through the hole
                  nh++;
                }
              }
            }
          }
          if (!out) {
            seen[idx] = 1;
            const li = lowOf[idx];
            const ld = li >= 0 ? lows[li] : lowDefs[ch];
            if (ld) {
              if (i === lastLow + 1 && ld === lastDef) {
                if (lastKept) lowD2[lb + nl - 1] = sideX < sideY ? sideX : sideY; // one run: its top carries on
              } else {
                // a new run, kept only when its top can rise above the opaque faces in front of it
                // (drawScene clips it to them); one lower than eye level never rises above the horizon
                const h = ld.h || 0.5;
                const dd = d > 0.05 ? d : 0.05;
                lastKept = nl < MAX_LOW && half - (h > 0.5 ? h - 0.5 : 0) * (H / dd) < clip;
                if (lastKept) {
                  const o = lb + nl++;
                  lowD1[o] = dd;
                  lowD2[o] = sideX < sideY ? sideX : sideY;
                  let wx = side === 0 ? py + d * rdy : px + d * rdx;
                  wx -= Math.floor(wx);
                  const tx = (wx * 64) | 0;
                  lowTX[o] = (side === 0 && rdx < 0) || (side === 1 && rdy > 0) ? 63 - tx : tx;
                  lowSide[o] = side;
                  lowIdx[o] = idx;
                  lowDef[o] = ld;
                }
              }
              lastLow = i;
              lastDef = ld;
              continue;
            }
            if (IS_OPAQUE[ch] !== 1 || (see && see[idx] === 1)) continue;
          }
          const ri = out ? -1 : roofOf[idx];
          if (ri >= 0 && ri === lastRoof) continue; // inside a roofed block already seen
          lastRoof = ri;
          const hit = store[hb + nh];
          hit.perp = d > 0.05 ? d : 0.05;
          hit.idx = idx;
          hit.x = mapX;
          hit.y = mapY;
          hit.ch = ch;
          hit.side = side;
          hit.roof = ri;
          hit.rdx = rdx;
          hit.rdy = rdy;
          hit.open = false;
          hit.indoor = inside; // a wall seen from under the roof: the ceiling meets its top
          // a house wall seen from outside carries the roof
          hit.hroof = hin && !inside ? this.houseRoofY(px, py, rdx, rdy, d, mapX, mapY, sideX, sideY, deltaX, deltaY, stepX, stepY) : null;
          this.faceGeom(hit, sc);
          if (hit.hroof != null) skipHouse = true; // the rest of the house is behind this wall and under its roof
          const full = out || inside || hit.zTop >= sc.ceilH;
          // a face wholly behind the ones in front is never seen: it takes no slot (a full one still ends the column)
          if (hit.occ >= clip && !full) continue;
          hit.full = full;
          hitD[hb + nh] = hit.perp;
          hitTop[hb + nh] = full ? -1e9 : hit.occ;
          nh++;
          if (hit.occ < clip) clip = hit.occ;
          if (full || nh === MAX_HITS) break;
        }
        hitN[col] = nh;
        lowN[col] = nl;
        zbuf[col] = nh ? store[hb].perp : 1e9;
        capY[col] = cY;
        capD[col] = cD;
        colIn[col] = cin;
      }
    },
    /** The top of the house roof over a ray that meets the house at distance d0 (from outside): the
        highest point of the roof along the ray, on screen, sampled where it crosses tile edges and halfway
        between. The DDA state is the main cast's at that tile (mx, my and the next crossings). */
    houseRoofY(px, py, rdx, rdy, d0, mx, my, sX, sY, dX, dY, stX, stY) {
      const H = this.H;
      const half = H / 2;
      const gw = this.gw;
      const gh = this.gh;
      const mask = this.house.mask;
      let best = Infinity;
      const sample = (t) => {
        const tt = t > 0.05 ? t : 0.05;
        const y = half - ((this.roofAt(px + tt * rdx, py + tt * rdy) - 0.5) * H) / tt;
        if (y < best) best = y;
      };
      sample(d0 + 0.001);
      let prev = d0;
      for (let i = 0; i < 80; i++) {
        let t;
        if (sX < sY) {
          t = sX;
          sX += dX;
          mx += stX;
        } else {
          t = sY;
          sY += dY;
          my += stY;
        }
        sample((prev + t) / 2);
        sample(t - 0.001);
        prev = t;
        if (mx < 0 || my < 0 || mx >= gw || my >= gh || !mask[my * gw + mx]) break;
      }
      return best;
    },
    /** The opaque faces of every column, back to front, then ink where one face ends and the next begins. */
    drawFaces(ctx, sc) {
      const store = this.hitStore;
      const edges = this.edges;
      edges.length = 0;
      let prevKey = -1;
      let prevSide = -1;
      let prevCh = "";
      let prevTop = 0;
      let prevBottom = 0;
      let prevDist = 0;
      for (let col = 0; col < this.cols; col++) {
        const nh = this.hitN[col];
        const hb = col * MAX_HITS;
        const x = col * COL;
        const cd = this.capD[col];
        for (let k = nh - 1; k >= 0; k--) {
          const hit = store[hb + k];
          // seen out through an opening from under the roof: only what is below the opening's top shows
          if (hit.perp > cd) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, this.capY[col], COL, this.H);
            ctx.clip();
            this.drawFace(ctx, hit, x, sc);
            ctx.restore();
          } else this.drawFace(ctx, hit, x, sc);
        }
        if (!nh) continue;
        const h0 = store[hb];
        const key = ((h0.y + 1) * 8192 + h0.x + 1) * 2 + h0.side;
        const occ0 = h0.perp > cd ? Math.max(h0.occ, this.capY[col]) : h0.occ;
        if (col > 0 && prevKey !== key && (Math.abs(prevDist - h0.perp) > 0.25 || prevSide !== h0.side || prevCh !== h0.ch)) edges.push(x, Math.min(occ0, prevTop), Math.max(h0.bottom, prevBottom));
        prevKey = key;
        prevSide = h0.side;
        prevCh = h0.ch;
        prevTop = occ0;
        prevBottom = h0.bottom;
        prevDist = h0.perp;
      }
      ctx.fillStyle = INK;
      for (let i = 0; i < edges.length; i += 3) ctx.fillRect(edges[i] - 1, edges[i + 1], 2.5, edges[i + 2] - edges[i + 1]);
    },

    /** Screen geometry of one opaque face: wall top and bottom, and the roof slope or gable above a roofed block. */
    faceGeom(hit, sc) {
      const H = this.H;
      const half = H / 2;
      const perp = hit.perp;
      const unit = H / perp; // screen pixels per world unit at this distance
      hit.bottom = half + unit / 2;
      hit.hasRoof = false;
      hit.gableY = -1;
      if (hit.hroof != null) {
        // the house from outside: a wall up to the eave and the roof above it (hroof: its top on screen);
        // over an opening only the roof shows
        const top = half - (this.house.eave - 0.5) * unit;
        hit.zTop = this.house.eave;
        hit.top = top;
        if (hit.open) hit.bottom = top;
        hit.hasRoof = hit.hroof < top;
        hit.roofTop = hit.hroof;
        hit.roofBot = top;
        hit.occ = hit.hasRoof ? hit.hroof : top;
        return;
      }
      let zTop = (hit.idx >= 0 && sc.h[hit.idx]) || HEIGHT[hit.ch] || 1;
      const r = hit.roof >= 0 ? this.roofs[hit.roof] : null;
      if (r) {
        // a gabled roof: the long walls stop at the eave and carry the slope, the end walls carry the gable
        const p = this.player;
        const ax = r._alongX;
        const eave = r._eave;
        const ridge = r._ridge;
        const eaveSide = ax ? hit.side === 1 : hit.side === 0;
        const hx = p.x + perp * hit.rdx;
        const hy = p.y + perp * hit.rdy;
        const along = ax ? hit.rdy : hit.rdx; // travel across the block's depth (toward or away from the ridge)
        const across = ax ? hit.rdx : hit.rdy; // travel along its length
        const lo = ax ? r.x0 : r.y0;
        const hi = ax ? r.x1 : r.y1;
        const at = ax ? hx : hy; // position along the length
        const w = ax ? hy : hx; // position across the depth
        const slope = (z) => eave + (ridge - eave) * clamp(1 - Math.abs(z - r._line) / r._half, 0, 1);
        if (eaveSide) {
          zTop = eave;
          // the roof rises from the eave to the ridge (or to the end of the block if the ray leaves it first)
          const tEdge = across !== 0 ? Math.abs(((across > 0 ? hi : lo) - at) / across) * Math.abs(along) : Infinity;
          const t = Math.min(r._half, tEdge);
          const sTop = perp + t / Math.max(1e-6, Math.abs(along));
          const zRoof = eave + (ridge - eave) * (t / r._half);
          hit.roofTop = half - (zRoof - 0.5) * (H / sTop);
          hit.roofBot = half - (eave - 0.5) * unit;
          hit.hasRoof = hit.roofTop < hit.roofBot;
        } else {
          zTop = slope(w);
          hit.gableY = half - (eave - 0.5) * unit;
          // the slope behind the gable climbs toward the ridge and can show above the triangle at the corners
          const toRidge = (r._line - w) * along > 0 ? (r._line - w) / along : 0;
          const toExit = across !== 0 ? Math.abs(((across > 0 ? hi : lo) - at) / across) : Infinity;
          const s = Math.min(toRidge, toExit);
          if (s > 0) {
            const yR = half - (slope(w + s * along) - 0.5) * (H / (perp + s));
            const yG = half - (zTop - 0.5) * unit;
            if (yR < yG) {
              hit.roofTop = yR;
              hit.roofBot = yG;
              hit.hasRoof = true;
            }
          }
        }
      }
      hit.zTop = zTop;
      hit.top = half - (zTop - 0.5) * unit;
      hit.occ = hit.hasRoof ? Math.min(hit.top, hit.roofTop) : hit.top;
    },

    /** Draw one opaque face column: texture (per-tile, per-face, roof, style), roof or gable, distance shade, ink. */
    drawFace(ctx, hit, x, sc) {
      const p = this.player;
      let wallX = hit.side === 0 ? p.y + hit.perp * hit.rdy : p.x + hit.perp * hit.rdx;
      wallX -= Math.floor(wallX);
      // texture columns run left to right as seen from the face's own side, so text never mirrors
      const flip = (hit.side === 0 && hit.rdx < 0) || (hit.side === 1 && hit.rdy > 0);
      let texX = Math.floor(wallX * 64);
      if (flip) texX = 63 - texX;
      const ch = hit.ch;
      const r = hit.roof >= 0 ? this.roofs[hit.roof] : null;
      let over = hit.idx >= 0 ? sc.tex[hit.idx] : undefined;
      if (over && typeof over === "object" && !over.width) {
        // per face: the side of the tile this ray came in through
        over = over[hit.side === 0 ? (hit.rdx > 0 ? "w" : "e") : hit.rdy > 0 ? "n" : "s"];
      }
      // (the parked van is a 3D model, js/modelsprite.js: its V tiles are never a face here while it stands on them)
      let tex;
      if (over) tex = typeof over === "string" ? this.tex(over) : over;
      else if (r && r.wallTex) tex = this.tex(r.wallTex);
      else if ((ch === "#" || ch === "W") && this.wallStyleOf && hit.idx >= 0) tex = this.tex(TEX_OF[ch] || "wall", this.wallStyleOf(hit.x, hit.y));
      else tex = this.tex(TEX_OF[ch] || "wall");
      const top = hit.top;
      const bottom = hit.bottom;
      const tw = tex.width;
      const tx = tw === 64 ? texX : Math.floor((texX * tw) / 64);
      if (hit.open) {
        // the roof over an opening: no wall below it
      } else if (hit.gableY >= 0 && top < hit.gableY) {
        ctx.drawImage(this.tex(r.gableTex || "gable"), texX, 0, 1, 64, x, top, COL, hit.gableY - top);
        ctx.drawImage(tex, tx, 0, 1, tex.height, x, hit.gableY, COL, bottom - hit.gableY);
      } else ctx.drawImage(tex, tx, 0, 1, tex.height, x, top, COL, bottom - top);
      if (hit.hasRoof) {
        const roofTex = hit.hroof != null ? this.house.roofTex : r.roofTex || "roof";
        ctx.drawImage(this.tex(roofTex), texX, 0, 1, 64, x, hit.roofTop, COL, hit.roofBot - hit.roofTop);
        ctx.fillStyle = INK;
        ctx.fillRect(x, hit.roofBot - 1, COL, 2.5);
      }
      const occ = hit.occ;
      // under the roof it is a little darker than out in the yard
      const dark = Math.min(sc.fogMax, hit.perp * sc.fogK + (hit.side === 1 ? 0.12 : 0) + (hit.indoor ? 0.14 : 0));
      if (dark > 0.02) {
        ctx.globalAlpha = dark;
        ctx.fillStyle = "#000";
        ctx.fillRect(x, occ, COL, bottom - occ);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = INK;
      const ink = Math.max(1.5, Math.min(4, (this.H / hit.perp) * 0.012));
      ctx.fillRect(x, occ, COL, ink);
      ctx.fillRect(x, bottom - ink, COL, ink);
    },

    /** Lowest screen y a thing at distance d can reach in this column without going behind an opaque face. */
    clipAt(col, d) {
      const n = this.hitN[col];
      const b = col * MAX_HITS;
      let y = Infinity;
      for (let k = 0; k < n && this.hitD[b + k] < d; k++) if (this.hitTop[b + k] < y) y = this.hitTop[b + k];
      return y;
    },

    /** Sprites (items, notes, scrap, traps, walkers, props) and low runs, painter's order per column. */
    drawScene(ctx, sc, dirX, dirY, planeX, planeY, aspect) {
      const Wd = this.W;
      const H = this.H;
      const p = this.player;
      const D = D3();
      const cols = this.cols;
      const sprites = [];
      this.items.forEach((it) => !it.taken && sprites.push({ x: it.x, y: it.y, img: D.item(it.item), scale: 0.5, lift: 0.25 }));
      this.notes.forEach((n) => (!this.noteVisible || this.noteVisible(n)) && sprites.push({ x: n.x, y: n.y, img: D.note(), scale: 0.42, lift: 0.3, dim: n.read ? 0.5 : 0 }));
      if (this.keyVisible && this.keyVisible()) sprites.push({ x: this.keyPickup.x, y: this.keyPickup.y, img: D.key(), scale: 0.3, lift: 0.12 + Math.sin(this.time * 3) * 0.03, wide: 1.4 });
      this.piles.forEach((pl) => !pl.taken && sprites.push({ x: pl.x, y: pl.y, img: D.scrap(), scale: 0.5, lift: 0.25, wide: 1.33 }));
      const gp = this.gunPickup;
      if (gp && !gp.taken) sprites.push({ x: gp.x, y: gp.y, img: D.weaponIcon(gp.id), scale: 0.36, lift: 0.18 + Math.sin(this.time * 3) * 0.03, wide: 2 });
      this.traps.forEach((tr) => tr.uses > 0 && sprites.push({ x: tr.x, y: tr.y, img: D.trap(tr.type, false), scale: 0.3, lift: 0, wide: 1.6, dim: tr.flash > 0 ? 0.4 : 0 }));
      // the walkers and the downed ones, live (Walker3D draws each into its own canvas below, once it is known to show)
      const M = W3();
      if (M && M.draw && M.box) {
        this.walkers.forEach((z) => sprites.push(this.walkerSprite(z, false)));
        (this.fallen || []).forEach((z) => sprites.push(this.walkerSprite(z, true)));
        // a hit's spray: cached pictures, so they fog like any sprite (only with SETTINGS.walkerGore)
        if (M.gore() && this.blood && this.blood.length && D.hasSprite("bloodDrop")) {
          const drop = D.sprite("bloodDrop");
          const splat = D.sprite("bloodSplat");
          this.blood.forEach((b) => sprites.push(b.splat ? { x: b.x, y: b.y, img: splat, scale: b.size * 0.3, lift: 0, wide: 3, dim: clamp(1 - (b.life - b.t), 0, 1) } : { x: b.x, y: b.y, img: drop, scale: b.size, lift: b.h, wide: 2 / 3 }));
        }
      }
      const ceil = this.sky ? Infinity : CEIL_CAP;
      this.props.forEach((pr) => {
        if (pr.fig) {
          // a live figure (a crew member, the dog, Rivet: prop.fig, js/crew.js): drawn with the walkers, in the same pool
          if (pr.hidden || !this.figDrawable(pr.fig)) return;
          pr.fig.sceneAt = this.frameNo; // (liveSweep: still in the scene)
          sprites.push(this.figSprite(pr));
          return;
        }
        if (pr.model) return; // drawn as its 3D model (js/modelsprite.js modelProps: the yard's props and the porch's)
        const img = pr.img || (pr.art ? (pr.img = D.sprite(pr.art, pr.opts)) : null); // a named sprite is resolved once
        if (!img || pr.hidden) return;
        const lift = pr.lift || 0;
        // under a ceiling a big prop never pokes through it: it shrinks and keeps its shape,
        // unless it asks for a width in tiles (`span`, a landmark's footprint), which it keeps
        const scale = Math.max(0.05, Math.min(pr.scale || 1, ceil - lift));
        // a tile of floor is STRETCH times narrower on screen than a wall is tall, so `span` is measured in those
        const wide = pr.span ? pr.span / (scale * STRETCH) : pr.wide || img.width / img.height;
        sprites.push({ x: pr.x, y: pr.y, img, scale, lift, wide, dim: pr.dim || 0, own: true });
      });
      const invDet = 1 / (planeX * dirY - dirX * planeY);
      const list = [];
      const liveQ = this.liveQ || (this.liveQ = []);
      liveQ.length = 0;
      // the 3D models (the parked van) first: each on screen as strips with their own depths (js/modelsprite.js), so
      // a live walker they hide whole is known before the walkers draw (liveVisible)
      if (this.models && this.models.length) this.modelQueue(list, sc);
      sprites.forEach((s) => {
        const sx = s.x - p.x;
        const sy = s.y - p.y;
        s.tx = invDet * (dirY * sx - dirX * sy);
        s.ty = invDet * (-planeY * sx + planeX * sy);
        if (s.ty <= 0.1) return;
        if (s.envR) this.figFloor(s); // an animal seen from above: room under its feet for the paws nearer than them
        s.screenX = (Wd / 2) * (1 + s.tx / s.ty / aspect);
        s.sh = (H / s.ty) * s.scale;
        s.sw = s.sh * (s.wide || 1);
        s.top = H / 2 - s.sh / 2 + ((H / s.ty) * (0.5 - s.lift) - s.sh / 2);
        s.left = s.screenX - s.sw / 2;
        s.c0 = Math.max(0, Math.floor(s.left / COL));
        s.c1 = Math.min(cols - 1, Math.ceil((s.left + s.sw) / COL));
        if (s.c0 > s.c1) return;
        if (s.live) {
          // a live walker: drawn only if some of it shows past the walls; its fog goes into its own colours (the
          // alpha the darker copies use, without their steps). Never through D.dim or dimOwn: their memos would
          // hand back an old darker copy of the pooled canvas (a frozen walker) and keep it alive
          if (!this.liveVisible(s)) return;
          s.fog = Math.min(sc.fogMax, s.ty * sc.fogK) * 0.75;
          liveQ.push(s);
          list.push(s);
          return;
        }
        // sprites darken with distance too, a little less than walls so walkers stay readable
        // (a prop's darker copies belong to this scene; items and notes are shared by every scene)
        const lvl = Math.round(Math.min(sc.fogMax, s.ty * sc.fogK) * 7.5);
        s.im = lvl > 0 ? (s.own ? this.dimOwn(s.img, lvl) : D.dim(s.img, lvl)) : s.img;
        list.push(s);
      });
      // the live walkers that show draw again only if they look different: nearest first, the near ones and any
      // picture that must be drawn at once; then the others whose turn it is (liveFar frames since their last
      // picture), the longest-waiting first, while this frame's redraws last (liveMax); the rest keep theirs
      this.liveShown = liveQ.length; // (the governor counts only frames with live walkers on screen)
      this.liveDrawn = liveQ.length ? this.liveRenderAll(liveQ) : 0;
      // far to near; a figure that sits on a chair or a bed's edge counts as zb nearer (it goes in front of its seat)
      list.sort((a, b) => (b.zb ? b.ty - b.zb : b.ty) - (a.zb ? a.ty - a.zb : a.ty));
      // Painter's order, far to near, per column. Every draw stays inside its own 2-px column, so the order
      // only matters within a column: each sprite (far to near) first draws, in each of its columns, the
      // low runs behind it that are not drawn yet, then itself (see drawSprite); the low runs left over
      // (nearer than every sprite in their column) go last. Within any one column that is the same order
      // as walking the column through: the runs behind a sprite, the sprite, the runs behind the next one.
      const n = list.length;
      const lowN = this.lowN;
      const lowD1 = this.lowD1;
      const next = this.lowNext;
      for (let col = 0; col < cols; col++) next[col] = lowN[col] - 1;
      for (let k = 0; k < n; k++) {
        const s = list[k];
        const sd = s.zb ? s.ty - s.zb : s.ty; // (a bed's edge a figure sits on goes behind it)
        for (let col = s.c0; col <= s.c1; col++) {
          let li = next[col];
          if (li < 0) continue;
          const lb = col * MAX_LOW;
          if (!(lowD1[lb + li] > sd)) continue;
          do this.drawLowCapped(ctx, col, li--, sc);
          while (li >= 0 && lowD1[lb + li] > sd);
          next[col] = li;
        }
        this.drawSprite(ctx, s);
      }
      for (let col = 0; col < cols; col++) for (let li = next[col]; li >= 0; li--) this.drawLowCapped(ctx, col, li, sc);
      // health bars over the walkers you can see: just over the head (its look's head top, not its box), as wide as
      // the walker is to hit (it does not change as it turns)
      list.forEach((s) => {
        if (s.hp == null || s.hp >= 1) return;
        const c = clamp(Math.floor(s.screenX / COL), 0, cols - 1);
        const top = s.head != null ? H / 2 + (H / s.ty) * (0.5 - s.lift - s.head) : s.top;
        const bw = s.barW != null ? (H / s.ty) * s.barW : s.sw * 0.7;
        if (this.clipAt(c, s.ty) <= top) return;
        if (s.ty > this.capD[c] && this.capY[c] > top - 10) return; // its head is above an opening, under the ceiling
        if (this.modelStripN && this.modelHides(c, s.ty, top)) return; // its head is behind a 3D model (the van)
        ctx.fillStyle = INK;
        ctx.fillRect(s.screenX - bw / 2 - 1, top - 10, bw + 2, 7);
        ctx.fillStyle = "#b3261e";
        ctx.fillRect(s.screenX - bw / 2, top - 9, bw * s.hp, 5);
      });
      this.liveSweep();
    },

    /* ---------- Live walkers (Walker3D): one pooled canvas each, drawn again only when the walker looks different ---------- */
    /** The drawn height of a walker (tiles): its look's box, capped under a ceiling and inside the cabin. */
    walkerHeight(z) {
      const M = W3();
      const h = M && M.box ? M.box(z.type, false).h : 0.95;
      return Math.min(h, this.walkerCap(z));
    },
    /** How tall anything may stand where this walker is: CEIL_CAP under a ceiling or in the cabin, else no cap. */
    walkerCap(z) {
      return this.sky && !(this.house && this.indoorAt(z.x, z.y)) ? Infinity : CEIL_CAP;
    },
    /** A walker's sprite entry (a downed one when `falling`): its box from Walker3D.box (a tall type shrinks under a
        ceiling, as props do), the head top and bar width for the health bar, and its fade while it goes. The
        picture (img, iw x ih: the part of the pooled canvas drawn) is filled in by liveRenderAll. */
    walkerSprite(z, falling) {
      const M = W3();
      const box = M.box(z.type, falling);
      const scale = Math.min(box.h, this.walkerCap(z));
      const shrink = scale / box.h;
      let dim = 0;
      if (falling) {
        const fallSecs = M.FALL_SECS || FALL_SECS;
        const fade = M.FADE_SECS || 0.7;
        dim = clamp((z.fallT - (fallSecs - fade)) / fade, 0, 1);
      }
      return { x: z.x, y: z.y, live: z, falling, img: null, im: null, iw: 0, ih: 0, scale, lift: 0, wide: box.w / box.h, boxH: box.h, head: box.head * shrink, barW: box.bar * shrink, hp: falling ? null : z.hp / z.maxHp, dim, fog: 0, rw: 0, rh: 0, lod: 0, liveT: null, liveAge: 0, liveFirst: false };
    },
    /** Does any column of this sprite show past the opaque faces in front of it (and under an opening's top), and
        past the models drawn in front of it this frame (the parked van's real outline: modelCovers)? */
    liveVisible(s) {
      const bottom = s.top + s.sh;
      for (let col = s.c0; col <= s.c1; col++) {
        const clip = this.clipAt(col, s.ty);
        const cap = s.ty > this.capD[col] ? this.capY[col] : -Infinity;
        const y0 = cap > s.top ? cap : s.top;
        const y1 = clip < bottom ? clip : bottom;
        if (y1 > y0 && !(this.modelStripN && this.modelCovers(col, s.ty, y0, y1))) return true;
      }
      return false;
    },
    /** What Walker3D draws for this walker now (LIVE_ST, refilled): which way it faces you, its gait, pose and
        timers, a hit's flash, how far it has fallen and which way, its look, the detail and the fog. */
    walkerState(z, s, lod) {
      const M = W3();
      const p = this.player;
      const st = LIVE_ST;
      st.yaw = normAngle(z.heading - Math.atan2(p.y - z.y, p.x - z.x)); // 0: it faces you; +: it turns to your left
      st.gait = z.gait || 0;
      st.move = z.move || 0;
      const pose = z.pose || "walk";
      st.pose = pose;
      st.poseW = z.poseW == null ? 1 : z.poseW;
      st.claw = z.clawPh || 0;
      if (pose === "bite") st.poseT = clamp(1 - (z.biteT || 0) / ((M && M.BITE_SECS) || BITE_SECS), 0, 1);
      else if (pose === "scream") st.poseT = clamp(1 - (z.yell || 0) / W().SCREAM.yell, 0, 1);
      else if (pose === "claw") st.poseT = st.claw;
      // awake it sways and breathes; a downed one stops where it was when it fell (a settled body is one still picture)
      else if (pose === "idle" && z.awake) st.poseT = ((s.falling ? this.time - (z.fallT || 0) : this.time) * 0.25 + (z.seed % 997) * 0.618) % 1;
      else st.poseT = 0; // asleep it stands still (the same picture every frame)
      st.hit = z.hit > 0 ? 1 : 0;
      st.fall = s.falling ? clamp((z.fallT || 0) / ((M && M.COLLAPSE_SECS) || 0.9), 0, 1) : 0;
      st.fallDir = s.falling ? normAngle((z.fallDir == null ? z.heading + Math.PI : z.fallDir) - z.heading) : Math.PI;
      st.seed = z.seed | 0;
      st.lod = lod;
      st.fog = s.fog;
      st.gore = M && M.gore ? M.gore() : true;
      return st;
    },
    /** Redraw the live walkers that need it (q: the ones that show this frame) and point each sprite at its picture.
        First, nearest first: a picture never drawn and one just hit (or its flash over) draw at once, and so do the
        near ones (lod 0 and picked by liveNearOnes) when they look different. A first picture past this frame's
        redraws (liveMax) is drawn at lod 2, the cheapest. Then, while this frame's redraws last (the near ones count
        too): the others with an old picture (not shown last frame, less detail than they now get, or grown on
        screen), then those that look different and whose turn it is (liveFar frames or more since their last
        picture), the longest-waiting first. So turning to face a crowd is no burst: each shows its old picture until
        its turn. Returns how many drew. */
    liveRenderAll(q) {
      if (this.liveLevel == null) this.setLiveLevel(LIVE_START);
      q.sort((a, b) => a.ty - b.ty);
      this.liveNearOnes(q);
      const wait = this.liveWait || (this.liveWait = []);
      wait.length = 0;
      let drawn = 0;
      for (let i = 0; i < q.length; i++) {
        const s = q[i];
        const want = this.liveCheck(s);
        if (want === 1) {
          // a first picture past this frame's redraws (a crowd seen again after its canvases were let go): the
          // cheapest detail now (it must show something), its own on its next turn
          if (!s.near && !s.liveT.lh && drawn >= this.liveMax) s.lod = 2;
          this.liveDraw(s);
          drawn++;
        } else if (want === 2) wait.push(s);
      }
      if (wait.length && drawn < this.liveMax) {
        wait.sort((a, b) => b.liveFirst - a.liveFirst || b.liveAge - a.liveAge || a.ty - b.ty);
        for (let i = 0; i < wait.length && drawn < this.liveMax; i++) {
          this.liveDraw(wait[i]);
          drawn++;
        }
      }
      for (let i = 0; i < q.length; i++) {
        const s = q[i];
        const t = s.liveT;
        t.used = this.frameNo;
        s.img = s.im = t.c;
        s.iw = t.lw;
        s.ih = t.lh;
        s.bb = t.bbOn ? t.bb : null;
      }
      wait.length = 0;
      return drawn;
    },
    /** Pick the near ones (s.near; q is nearest first): the liveNear nearest walkers that stand, or are still
        collapsing. A settled body takes no place (it keeps its picture until it looks different, then takes turns),
        so bodies at your feet never push a walker out. One near last frame counts as NEAR_STICK nearer, so two at
        about the same depth do not swap places (and detail) frame by frame. */
    liveNearOnes(q) {
      const M = W3();
      const settled = (M && M.COLLAPSE_SECS) || 0.9;
      const pool = this.livePool;
      const last = this.frameNo - 1;
      const pick = this.liveNearQ || (this.liveNearQ = []);
      pick.length = 0;
      for (let i = 0; i < q.length; i++) {
        const s = q[i];
        s.near = false;
        if (s.falling && s.live.fallT >= settled) continue;
        const t = pool && pool.get(s.live);
        s.nearKey = t && t.nearAt === last ? s.ty * NEAR_STICK : s.ty;
        pick.push(s);
      }
      if (pick.length > this.liveNear) pick.sort((a, b) => a.nearKey - b.nearKey);
      for (let i = 0; i < pick.length && i < this.liveNear; i++) pick[i].near = true;
      pick.length = 0;
    },
    /** What one live walker needs this frame: 0 keep its picture, 1 draw now, 2 draw if this frame's redraws last.
        Works out its render size (liveScale, at most liveMaxPx tall), detail (liveLodPx by its height on screen)
        and canvas (liveTarget), kept on the sprite for liveDraw. */
    liveCheck(s) {
      const z = s.live;
      const M = W3();
      const k = Math.min(this.liveScale, this.liveMaxPx / s.sh); // render px per screen px (<= 1)
      const rw = (s.rw = Math.max(2, Math.ceil(s.sw * k)));
      const rh = (s.rh = Math.max(2, Math.ceil(s.sh * k)));
      const lodPx = this.liveLodPx;
      const t = (s.liveT = this.liveTarget(z, rw, rh));
      if (s.near) t.nearAt = this.frameNo;
      // full detail for the near ones; one taking turns gets at most liveFarLod. A downed one keeps the detail it was
      // last drawn with (no pop as it settles and gives up its near place), until it is smaller on screen
      let most = s.near ? 0 : this.liveFarLod;
      if (s.falling && t.lh && t.sLod < most) most = t.sLod;
      const lod = (s.lod = Math.max(s.sh >= lodPx[0] ? 0 : s.sh >= lodPx[1] ? 1 : 2, most));
      s.liveAge = this.frameNo - (t.drawnAt || 0);
      // an old picture: not on screen last frame (behind you, behind a wall), drawn with less detail than it now gets
      // (a first picture past the cap, one coming nearer), or grown on screen past what scaling up hides. Only growth
      // on screen counts: a picture the governor wants sharper (liveScale, liveMaxPx) waits its turn, and one too big
      // just scales down, so a walker going away waits too
      const old = (s.liveFirst = t.used < this.frameNo - 1 || t.sLod > lod || (rh > t.lh * 1.15 && s.sh > t.shAt * 1.15) || (rw > t.lw * 1.15 && s.sw > t.swAt * 1.15));
      // at once: a picture never drawn (there is nothing to show yet), or a near one's old picture
      if (!t.lh || (old && s.near)) return 1;
      const sized = Math.abs(rh - t.lh) <= Math.max(2, rh * 0.02) && Math.abs(rw - t.lw) <= Math.max(2, rw * 0.02);
      let st;
      if (s.fig) {
        // a crew member, the dog or Rivet: its own state and signature (seat, head, run, wag), the same rules after
        st = this.figState(s.fig, s, lod);
        if (sized && sameFigSig(t, st, this.figRenderer(s.fig).FOG_STEPS || 32, figPoseQ(st, s.fig.live3d === "beast"))) return 0;
        // one that redraws at most every so many frames (fig.every: the farm's animals) keeps a sound picture till then
        if (s.fig.every > 1 && !old && s.liveAge < s.fig.every) return 0;
      } else {
        st = this.walkerState(z, s, lod);
        if (sized && sameSig(t, st, M.FOG_STEPS || 32)) return 0; // nothing it shows has changed
      }
      if (t.sHit !== st.hit) return 1; // a hit's flash shows at once, and goes at once (two redraws a hit at most)
      if (lod === 0 && s.near) return 1;
      // one taking turns with an old picture shows it a frame or two longer: first in the wait, under this frame's
      // cap (so turning to face a crowd is no burst of redraws); the rest when their turn comes
      return old || s.liveAge >= this.liveFar ? 2 : 0;
    },
    /** Draw one live walker (or figure: figDraw) into its canvas (liveCheck set its size, detail and canvas). */
    liveDraw(s) {
      const z = s.live;
      const M = W3();
      const t = s.liveT;
      t.bbOn = false; // (figDraw sets it again when its renderer says where it drew)
      const st = s.fig ? this.figState(s.fig, s, s.lod) : this.walkerState(z, s, s.lod);
      const rw = s.rw;
      const rh = s.rh;
      const bw = Math.ceil(rw / LIVE_STEP) * LIVE_STEP;
      const bh = Math.ceil(rh / LIVE_STEP) * LIVE_STEP;
      const c = t.c;
      if (c.width < rw || c.height < rh) {
        // bigger than its canvas: the canvas grows (a new size clears it; it is drawn right after). Only here, so the
        // old picture shows, scaled up, until this one's turn
        c.width = Math.max(c.width, bw);
        c.height = Math.max(c.height, bh);
        t.small = 0;
      } else {
        t.small = c.height >= 2 * bh || c.width >= 2 * bw ? t.small + 1 : 0;
        if (t.small >= LIVE_SHRINK) {
          // drawn this small for a while: a smaller canvas
          c.width = bw;
          c.height = bh;
          t.small = 0;
        } else t.g.clearRect(0, 0, Math.max(t.lw, rw), Math.max(t.lh, rh));
      }
      if (s.fig) this.figDraw(s, t, st, rw, rh);
      else {
        const shrink = s.scale / s.boxH; // < 1 under a ceiling: drawn as the whole figure, seen from farther off
        const cam = LIVE_CAM;
        cam.w = rw;
        cam.h = rh;
        cam.px = rh / s.boxH;
        cam.dist = s.ty / shrink;
        cam.eye = (0.5 - s.lift) / shrink;
        M.draw(t.g, z.type, st, cam);
        saveSig(t, st, M.FOG_STEPS || 32);
      }
      t.lw = rw;
      t.lh = rh;
      t.shAt = s.sh; // its size on screen when drawn
      t.swAt = s.sw;
      t.drawnAt = this.frameNo;
    },
    /** This walker's canvas: its own, else a spare one, else a new one rw x rh (in LIVE_STEP steps). liveDraw grows
        it when a picture needs more room, and makes it smaller after LIVE_SHRINK renders at under half of it. A
        canvas new to this walker has no picture yet (lw = lh = 0). */
    liveTarget(z, rw, rh) {
      const pool = this.livePool || (this.livePool = new Map());
      let t = pool.get(z);
      if (!t) {
        const spare = this.liveSpare || (this.liveSpare = []);
        t = spare.pop();
        if (!t) {
          const c = document.createElement("canvas");
          c.width = Math.ceil(rw / LIVE_STEP) * LIVE_STEP;
          c.height = Math.ceil(rh / LIVE_STEP) * LIVE_STEP;
          t = { c, g: c.getContext("2d"), lw: 0, lh: 0, shAt: 0, swAt: 0, used: 0, drawnAt: 0, nearAt: -1, small: 0 };
        }
        t.lw = t.lh = 0;
        t.small = 0;
        t.nearAt = -1;
        pool.set(z, t);
      }
      return t;
    },
    /** End of a frame: a canvas whose walker is gone (neither walking nor falling), or whose figure has left the scene
        (its prop gone from the props or hidden: Rivet switched off, the dog given up), goes back to the spares at once,
        one not drawn for LIVE_IDLE frames too. */
    liveSweep() {
      const pool = this.livePool;
      if (!pool || !pool.size) return;
      const now = this.frameNo;
      pool.forEach((t, z) => {
        if (t.used === now) return;
        const gone = z.live3d ? z.sceneAt !== now : !this.walkers.includes(z) && !(this.fallen && this.fallen.includes(z));
        if (now - t.used > LIVE_IDLE || gone) {
          pool.delete(z);
          this.liveFree(t);
        }
      });
    },
    /** A canvas back to the spares (LIVE_SPARE at most); past that its memory goes (a zero size). */
    liveFree(t) {
      const spare = this.liveSpare || (this.liveSpare = []);
      t.lw = t.lh = 0;
      if (spare.length < LIVE_SPARE) spare.push(t);
      else t.c.width = t.c.height = 0;
    },
    /** Let every live canvas go (leaving a scene, a new grid). */
    liveRelease() {
      if (this.livePool) this.livePool.forEach((t) => (t.c.width = t.c.height = 0));
      if (this.liveSpare) this.liveSpare.forEach((t) => (t.c.width = t.c.height = 0));
      this.livePool = new Map();
      this.liveSpare = [];
    },

    /* ---------- Live figures that are not walkers: the crew (Walker3D's people), the dog and Rivet (Beast3D) ----------
       Their owners (js/crew.js, js/robodog.js, js/building.js) keep a record on the figure's prop (prop.fig, from
       liveFigure) and say each frame what they want of it: want (a heading, or null: the way it walks), wantPose,
       wantRun (0..1), wantWag (animals), lookX / lookY (what the head turns to; null: straight ahead), turnTo (past the
       head's reach the body turns to it too), seat (tiles), job, hit, zb (drawn this much nearer than it stands: on a
       chair or a bed's edge, in front of it), and every (frames: redrawn at most this often, 0 as often as it changes).
       figStep turns that into how it looks: the heading turning at its look's
       turn rate, the gait by the distance walked, move and run easing, the pose easing (out of the old one first:
       poseW), its loop (poseT), the head turning. drawScene draws it with the walkers (figSprite): one pool, one
       redraw cap, the same near ones, its canvas let go when it leaves the scene (liveSweep). */
    /** The renderer a figure is drawn by: Walker3D (people) or Beast3D (animals). */
    figRenderer(f) {
      return f.live3d === "beast" ? B3() : W3();
    },
    /** Can a figure of this kind and look be drawn live now? A person: Walker3D with the crew's looks
        (js/walker3d-crew.js; a crew id with no look of its own is the stand-in "person", Walker3D.humanId); an animal:
        Beast3D with that type. Without them its owner keeps today's flat sprite. */
    figCan(kind, id) {
      if (kind === "beast") {
        const B = B3();
        return !!(B && B.draw && B.box && B.TYPES && B.TYPES[id]);
      }
      const M = W3();
      return !!(M && M.draw && M.box && M.HUMANS && M.humanId && M.HUMANS[M.humanId(id)]);
    },
    figDrawable(f) {
      return this.figCan(f.live3d, f.id);
    },
    /** A new figure record for a prop (prop.fig), or null when its renderer is not loaded. kind "person" (id: a crew
        id, drawn as Walker3D.humanId(id)) or "beast" (a Beast3D type). Its loop starts where its seed puts it, so the
        crew do not breathe in step. */
    liveFigure(kind, id, seed, heading) {
      if (!this.figCan(kind, id)) return null;
      const look = kind === "beast" ? id : W3().humanId(id);
      const sd = seed | 0;
      return { live3d: kind, id: look, seed: sd, every: 0, heading: heading || 0, vx: 0, vy: 0, gait: 0, move: 0, run: 0, pose: "stand", poseT: (sd * 0.618034) % 1, poseW: 1, seat: 0, job: null, headYaw: 0, wag: 0.5, hit: 0, zb: 0, want: null, wantPose: "stand", wantRun: 0, wantWag: 0.5, lookX: null, lookY: null, turnTo: false, turning: false, sceneAt: -1 };
    },
    /** A figure's sprite entry (as walkerSprite): its renderer's box (a person PERSON_H x CREW[id].scale tall: the box
        already is, never scaled again), shrunk under a ceiling as walkers are, no health bar, sorted zb nearer than it
        stands. An animal also gets envR (its reach round its feet), for the room figFloor makes under it. */
    figSprite(pr) {
      const f = pr.fig;
      const R = this.figRenderer(f);
      const box = R.box(f.id);
      const scale = Math.min(box.h, this.walkerCap(pr));
      const shrink = scale / box.h;
      const s = { x: pr.x, y: pr.y, live: f, fig: f, falling: false, img: null, im: null, iw: 0, ih: 0, scale, lift: 0, wide: box.w / box.h, boxH: box.h, boxS: scale, boxW: box.w * shrink, head: box.head * shrink, barW: 0, hp: null, dim: 0, fog: 0, rw: 0, rh: 0, lod: 0, liveT: null, liveAge: 0, liveFirst: false, zb: f.zb || 0, floorT: 0, envR: 0 };
      if (f.live3d === "beast" && R.TYPES[f.id].env) {
        const T = R.TYPES[f.id];
        s.envR = Math.max(T.env.rh, T.envRun ? T.envRun.rh : 0) * shrink;
      }
      return s;
    },
    /** An animal is all below your eye, so a paw nearer than its feet is lower on the screen than its feet line: its
        picture gets room under the feet line for that (Beast3D's cam.floor: the eye's height x how much bigger the
        nearest reach is drawn, k - 1, and a margin), at most FIG_FLOOR_MAX x its height. The sprite's top stays the
        box's top (its lift goes down by the room) and its width the box's (and a margin). */
    figFloor(s) {
      const near = s.ty - s.envR;
      const k = near > 0.05 ? s.ty / near : Infinity;
      const floor = Math.min(s.boxS * FIG_FLOOR_MAX, 0.5 * (k - 1) + 0.03);
      s.floorT = floor;
      s.lift = -floor;
      s.scale = s.boxS + floor;
      s.wide = (s.boxW + 0.06) / s.scale;
    },
    /** What a figure's renderer draws now (FIG_ST, refilled): which way it faces you (as a walker's yaw), its gait,
        pose and loop, seat, job, head, wag, a bite's flash, its look, the detail and the fog. */
    figState(f, s, lod) {
      const p = this.player;
      const st = FIG_ST;
      st.yaw = normAngle(f.heading - Math.atan2(p.y - s.y, p.x - s.x));
      st.gait = f.gait;
      st.move = f.move;
      st.run = f.run;
      st.pose = f.pose;
      st.poseT = f.poseT;
      st.poseW = f.poseW;
      st.seat = f.seat;
      st.job = f.job;
      st.headYaw = f.headYaw;
      st.wag = f.wag;
      st.hit = f.hit > 0 ? 1 : 0;
      st.seed = f.seed;
      st.lod = lod;
      st.fog = s.fog;
      return st;
    },
    /** Draw a figure into its canvas: the walkers' camera (the picture holds the box, its feet on the floor at its
        distance, your eye half a tile up), and for an animal the room under its feet (cam.floor). */
    figDraw(s, t, st, rw, rh) {
      const f = s.fig;
      const R = this.figRenderer(f);
      const shrink = s.boxS / s.boxH;
      const px = rh / s.scale; // the picture's px per tile on screen
      const cam = FIG_CAM;
      cam.w = rw;
      cam.h = rh;
      cam.px = px * shrink;
      cam.dist = s.ty / shrink;
      cam.eye = 0.5 / shrink;
      cam.floor = s.floorT * px;
      const r = R.draw(t.g, f.id, st, cam);
      // the box it drew in (Beast3D reports it): only that is pasted (drawSprite); none, the whole picture
      if (r && r.x1 > r.x0 && r.y1 > r.y0) {
        const b = t.bb || (t.bb = [0, 0, 0, 0]);
        b[0] = r.x0;
        b[1] = r.y0;
        b[2] = r.x1;
        b[3] = r.y1;
        t.bbOn = true;
      }
      saveFigSig(t, st, R.FOG_STEPS || 32, figPoseQ(st, f.live3d === "beast"));
    },
    /** One frame of a figure's animation (its owner moved it from (x0, y0) to (x, y) and set what it wants: see the
        section's head). A move longer than FIG_JUMP is a jump (no steps). */
    figStep(f, dt, x0, y0, x, y) {
      const beast = f.live3d === "beast";
      const R = this.figRenderer(f);
      if (!R) return;
      const look = beast ? R.TYPES && R.TYPES[f.id] : R.HUMANS && R.HUMANS[f.id];
      const gt = (look && look.gait) || {};
      let dx = x - x0;
      let dy = y - y0;
      let d = Math.hypot(dx, dy);
      if (d > FIG_JUMP) {
        d = dx = dy = 0;
        f.vx = f.vy = 0;
      }
      const g = Math.min(1, dt * 6);
      if (dt > 0) {
        // smoothed, so a path's corners do not swing the body
        f.vx += (dx / dt - f.vx) * g;
        f.vy += (dy / dt - f.vy) * g;
      }
      // the heading: what the owner wants, else the way it walks; past the head's reach a look (turnTo) turns it too
      let want = f.want;
      if (want == null && Math.hypot(f.vx, f.vy) > 0.15) want = Math.atan2(f.vy, f.vx);
      let lookA = null;
      if (f.lookX != null && f.lookY != null && Math.hypot(f.lookX - x, f.lookY - y) > 0.05) {
        lookA = Math.atan2(f.lookY - y, f.lookX - x);
        if (f.turnTo) {
          const off = Math.abs(normAngle(lookA - f.heading));
          if (off > FIG_HEAD_REACH) f.turning = true;
          else if (off < FIG_SETTLE) f.turning = false;
          if (f.turning) want = lookA;
        }
      }
      if (!f.turnTo) f.turning = false;
      if (want != null) {
        const m = (gt.turnRate > 0 ? gt.turnRate : TURN_RATE) * dt;
        f.heading = normAngle(f.heading + clamp(normAngle(want - f.heading), -m, m));
      }
      const hmax = R.HEAD_YAW_MAX || 1.1;
      const hw = lookA == null ? 0 : clamp(normAngle(lookA - f.heading), -hmax, hmax);
      const hs = FIG_HEAD_RATE * dt;
      f.headYaw += clamp(hw - f.headYaw, -hs, hs);
      // the run, the steps (by its stride at that run: the feet stay planted), the walk easing in and out
      f.run += ((f.wantRun || 0) - f.run) * Math.min(1, dt * 4);
      if (f.run < 0.005) f.run = 0;
      if (d > 0) {
        const sl = R.stride(f.id, f.run);
        f.gait = (f.gait + d / (sl > 0 ? sl : STRIDE)) % 1;
      }
      f.move += ((dt > 0 && d / dt > 0.15 ? 1 : 0) - f.move) * g;
      if (f.move < 0.005) f.move = 0;
      // the pose: from standing or walking straight in; from any other, out of it first (to standing), then in
      const pose = f.wantPose || "stand";
      const base = (q) => q === "stand" || q === "walk";
      // an animal's one-shot (a bark, a zap: shorter than its loop) starts at its beginning, so its peak shows, and
      // breaks off at once into a walk (eased out, it would slide along without steps)
      const oneShot = (q) => beast && !!R.POSE_SECS && R.POSE_SECS[q] < (R.LOOP_SECS || 1.2);
      const step = dt / (beast ? R.POSE_BLEND || 0.2 : FIG_BLEND);
      if (pose === f.pose) f.poseW = Math.min(1, f.poseW + step);
      else if (base(f.pose) || (pose === "walk" && oneShot(f.pose)) || f.poseW <= step) {
        f.pose = pose;
        f.poseW = base(pose) ? 1 : 0;
        if (oneShot(pose)) f.poseT = 0;
      } else f.poseW -= step;
      // its loop runs on through every pose (an animal's looping poses share one length: the wag keeps its phase)
      const loop = beast ? (R.POSE_SECS && R.POSE_SECS[f.pose]) || 1.2 : FIG_LOOP;
      f.poseT = (f.poseT + dt / loop) % 1;
      if (beast) f.wag += ((f.wantWag == null ? 0.5 : f.wantWag) - f.wag) * Math.min(1, dt * 3);
      if (f.hit > 0) f.hit = Math.max(0, f.hit - dt);
    },
    /** Out of standing or walking (sitting, kneeling, reading, cowering, sitting down or getting up): its owner waits
        for it to get up before it walks off. */
    figPosed(f) {
      return !!f && f.pose !== "stand" && f.pose !== "walk" && f.poseW > 0.04;
    },
    /** The top of a figure's head now (tiles over its feet): its box's head standing, lower as it sits (by its seat
        and its build: the legs fold under the hips), kneels or cowers, eased by poseW. The crew's speech bubble points
        its tail there and the tutorial's arrow hangs over it (js/crew.js crewHeadTop). */
    figHeadTop(f) {
      const R = this.figRenderer(f);
      if (!R) return 0;
      const head = R.box(f.id).head;
      if (f.live3d === "beast" || f.pose === "stand" || f.pose === "walk") return head;
      let posed = head;
      if (f.pose === "sit") {
        const t = R.HUMANS[f.id];
        const b = t.build;
        const K = R.humanH(f.id) / t.h;
        posed = head - (b.ankle + b.shin + b.thigh) * K + (f.seat || 0) + b.rThigh * 1.15 * K;
      } else if (f.pose === "cower") posed = head * 0.55;
      else if (f.pose === "work") {
        // (the job asked for, else the look's own: on their knees at a bed or a board, or standing with a clipboard)
        const L = R.HUMANS[f.id].looks[0];
        if ((f.job || (L && L.job)) !== "clipboard") posed = head * 0.62;
      }
      return head + (posed - head) * f.poseW;
    },
    /** One sprite over its columns c0..c1: each run of whole columns (inside the picture, and no nearer
        opaque face cutting into it) goes up in a single draw; a column a wall cuts, or one the picture's
        edge passes through, is drawn on its own. Both map screen x to picture x the same straight way, so a
        run and the cut column beside it meet without a seam. */
    drawSprite(ctx, s) {
      if (s.model) return this.modelStripDraw(ctx, s); // a strip of a 3D model's picture (js/modelsprite.js)
      const img = s.im;
      // a live walker's picture is the top-left iw x ih of its pooled canvas; any other picture is the whole image
      const iw = s.iw || img.width;
      const ih = s.ih || img.height;
      const k = iw / s.sw; // picture pixels per screen pixel
      // a live figure whose renderer said where it drew (s.bb, picture px: Beast3D) is pasted from that box only: its
      // picture is as wide as every pose from every side, so most of it is clear
      const bb = s.bb;
      let sy = 0;
      let sh = ih;
      let top = s.top;
      let bottom = s.top + s.sh;
      let c0 = s.c0;
      let c1 = s.c1;
      if (bb) {
        const kv = ih / s.sh;
        sy = bb[1];
        sh = bb[3] - bb[1];
        top = s.top + bb[1] / kv;
        bottom = s.top + bb[3] / kv;
        c0 = Math.max(c0, Math.floor((s.left + bb[0] / k) / COL));
        c1 = Math.min(c1, Math.floor((s.left + bb[2] / k) / COL));
        if (c1 < c0 || !(sh > 0)) return;
      }
      if (s.dim) ctx.globalAlpha = 1 - s.dim;
      let run = -1;
      let clip = 0;
      let cap = -Infinity;
      for (let col = c0; col <= c1 + 1; col++) {
        if (col <= c1) {
          clip = this.clipAt(col, s.ty);
          cap = s.ty > this.capD[col] ? this.capY[col] : -Infinity; // seen through an opening from under the roof
          const u0 = (col * COL - s.left) * k;
          if (clip >= bottom && cap <= top && u0 >= 0 && u0 + COL * k <= iw) {
            if (run < 0) run = col;
            continue;
          }
        }
        if (run >= 0) {
          const x0 = run * COL;
          const w = (col - run) * COL;
          ctx.drawImage(img, (x0 - s.left) * k, sy, w * k, sh, x0, top, w, bottom - top);
          run = -1;
        }
        if (col <= c1 && clip > top && clip > cap) this.drawSpriteCol(ctx, s, col, k, clip, cap > top ? cap : top, bottom);
      }
      if (s.dim) ctx.globalAlpha = 1;
    },
    /** One column of a sprite, cut off at `clip` (clipAt: the first nearer opaque face that rises over it)
        and, seen out through an opening from under the roof, above `cap`; `bottom` (optional) where its drawn part
        ends (a live figure's box: drawSprite). */
    drawSpriteCol(ctx, s, col, k, clip, cap, bottom) {
      const img = s.im;
      const iw = s.iw || img.width;
      const ih = s.ih || img.height;
      const x0 = col * COL;
      const u0 = (x0 - s.left) * k;
      const u1 = u0 + COL * k;
      if (u1 <= 0 || u0 >= iw) return;
      const end = bottom != null && bottom < s.top + s.sh ? bottom : s.top + s.sh;
      const y0 = cap > s.top ? cap : s.top;
      const y1 = clip < end ? clip : end;
      if (y1 <= y0) return;
      const sy = (ih * (y0 - s.top)) / s.sh;
      const sh = (ih * (y1 - y0)) / s.sh;
      if (u0 >= 0 && u1 <= iw) ctx.drawImage(img, u0, sy, u1 - u0, sh, x0, y0, COL, y1 - y0);
      else {
        // the picture's left or right edge is in this column: what is left of it fills the column (read from inside
        // the picture: past it a live walker's canvas may hold nothing drawn)
        const a = u0 > 0 ? Math.min(u0, iw - 1) : 0;
        ctx.drawImage(img, a, sy, Math.max(1, Math.min(iw, u1) - a), sh, x0, y0, COL, y1 - y0);
      }
    },
    /** A low run, clipped like a face when it is seen out through an opening from under the roof. */
    drawLowCapped(ctx, col, li, sc) {
      if (!(this.lowD1[col * MAX_LOW + li] > this.capD[col])) return this.drawLow(ctx, col, li, sc);
      ctx.save();
      ctx.beginPath();
      ctx.rect(col * COL, this.capY[col], COL, this.H);
      ctx.clip();
      this.drawLow(ctx, col, li, sc);
      ctx.restore();
    },
    /** One low run in one column: the lit top face (when below eye level), then the front face. */
    drawLow(ctx, col, li, sc) {
      const o = col * MAX_LOW + li;
      const d1 = this.lowD1[o];
      const def = this.lowDef[o];
      const H = this.H;
      const half = H / 2;
      const x = col * COL;
      const h = def.h || 0.5;
      const clip = this.clipAt(col, d1);
      const unit = H / d1;
      const yB = half + 0.5 * unit;
      const yT = half - (h - 0.5) * unit;
      const fog = Math.min(sc.fogMax, d1 * sc.fogK);
      if (h < 0.5 && def.top) {
        const yT2 = half - (h - 0.5) * (H / this.lowD2[o]);
        const yE = yT < clip ? yT : clip;
        if (yE > yT2) {
          ctx.fillStyle = topShade(def.top, fog);
          ctx.fillRect(x, yT2, COL, yE - yT2);
          ctx.fillStyle = INK;
          ctx.fillRect(x, yT2, COL, 1.5);
        }
      }
      if (yT >= clip) return;
      let tex = def.tex;
      if (def === this.lowDefs.F) {
        // the fence shows its damage: cracked below half strength
        const idx = this.lowIdx[o];
        const hp = this.fence[(idx % this.gw) + "," + ((idx / this.gw) | 0)];
        tex = this.fenceLook(hp != null && hp < this.fenceMax * 0.5);
      } else if (typeof tex === "string" || !tex) tex = this.tex(tex || "crate");
      const lvl = Math.round((fog + (this.lowSide[o] === 1 ? 0.1 : 0)) * 10);
      if (lvl > 0) tex = this.dimOwn(tex, lvl);
      const yE = yB < clip ? yB : clip;
      const th = tex.height;
      const tx = tex.width === 64 ? this.lowTX[o] : Math.floor((this.lowTX[o] * tex.width) / 64);
      ctx.drawImage(tex, tx, 0, 1, (th * (yE - yT)) / (yB - yT), x, yT, COL, yE - yT);
      ctx.fillStyle = INK;
      ctx.fillRect(x, yT, COL, 2);
    },

    /** The walker kinds (the facts: WORLD.WALKER_TYPES). */
    get WALKER_TYPES() {
      return WT();
    },
    SPEED_JITTER,
    TURN_RATE,
    HEAR,
    HEAR_SPRINT,
    SCREAM_TOAST_GAP,
    FALL_SECS,
    FALLEN_MAX,
    BLOOD_MAX,
    FOV,
    COL,
    CEIL_CAP,
    LIVE_MAX_PX,
    LIVE_STEP,
    LIVE_SPARE,
    LIVE_IDLE,
    LIVE_SHRINK,
    LOD_PX,
    LIVE_NEAR,
    FAR_LOD,
    FAR_EVERY,
    LIVE_RENDERS_MAX,
    LIVE_LEVELS,
    LIVE_START,
    NEAR_STICK,
    FIG_BLEND,
    FIG_LOOP,
    FIG_HEAD_REACH,
    QUALITY_WAIT,
    GOV_WAIT,
    GOV_WAIT_UP,
    GOV_BACKOFF,
    GOV_FAST,
    // the live pictures' "has it changed" signature (pure: the angled road camera keeps its walkers' with them)
    sameSig,
    saveSig,
    SOLID,
    OPAQUE,
  };

  ZSR.Interior = Interior;
})(typeof globalThis !== "undefined" ? globalThis : this);
