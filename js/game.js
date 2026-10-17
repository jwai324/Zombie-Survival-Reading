/* The road: a drive through the city along the route picked on the map, seen from behind and above the van.
   The van drives itself; A and D (or the arrows, or the touch buttons) change lanes. Every building sits at
   the end of its own drive off its corner: the van sets out from its parking spot, up that drive, so the
   first decision is that place's corner, and it ends by turning onto the destination's drive at its corner
   and parking at the door (a place with one road is at the end of it: the van drives on to the end).
   Before every decision point (a corner, a side street) the road splits into lanes with arrows and a sign
   says where each lane goes (at a place, its drive is a lane too); the lane the van is in at the stop line
   is the way it takes, and the van then drives its own arc through the turn.
   Left alone the van keeps to the left lane, which always goes straight on past side streets.
   A wrong way: a fade, then the page (hooks.onWrongTurn) offers
   try again (retry(): the drive starts over where it set out; van damage, scrap, walkers and
   miles stay), the town map, or back to where the van set out.
   The camera looks down the road from behind and above the van (js/perspective.js draws the world, works the roof
   gun's aim and maps screen <-> world), every drive; a minimap tracks the van but never shows the route. The van
   brakes into each turn it takes (more into a sharp one) and the camera follows lazily, facing a point ahead on the
   van's own path. The drive (the van, its turns and the camera) runs in short fixed steps (DRIVE_STEP), so it moves
   the same at any frame rate.
   Route geometry lives in js/streets.js. Walkers come from ahead and from both shoulders; the
   player aims and shoots. The trip's van health, scrap and walker count live in ZSR.State.trip.
   Every kind of walker comes, by the trip's danger and day (WORLD.walkerWeights "road"); a screamer that sees
   the van screams and every walker near it speeds up (WORLD.SCREAM, tiles x DIFF.pxPerTile). A downed walker
   goes over and fades (this.fallen); with WORLD.SETTINGS.walkerGore on, hits spray blood.
   All tuning lives in DIFF and WORLD.WALKER_TYPES[...].road (and .knock, .scream). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const Draw = () => ZSR.Draw;
  const State = () => ZSR.State;
  const Upgrades = () => ZSR.Upgrades;
  const Audio = () => ZSR.Audio;
  const Streets = () => ZSR.Streets;
  const World = () => ZSR.WORLD;

  const DIFF = {
    baseInterval: 2.2, // seconds between walkers on the road at danger 0, day 1
    intervalStep: 0.07,
    minInterval: 0.6,
    hpStep: 0.1,
    speedStep: 0.025,
    maxSpeedMult: 1.7,
    pxPerTile: 56, // road px for one tile on foot: a walker's road radius over its own, 18 px / 0.32 tiles (the scream's reach)
    roadScroll: 240, // van speed in px/s before engine upgrades
    milesPerSecond: 0.11,
    sideSpawnChance: 0.45,
    crateScrap: 15,
    fogChanceAfterDay: 5,
    chase: 0.65, // walkers keep up with this share of the van's speed (as the old scrolling road did)
    wrongDrive: 1.25, // seconds driven down a wrong road before the fade
    fadeOut: 0.6,
    fadeIn: 0.6,
    parkWait: 1.6, // seconds parked before the place opens
    quietAtDoor: 900, // px from the parking spot where walkers stop coming
  };
  // SCALE: the most particles (dust, sparks, blood) the road keeps; past it a hit's blood is skipped
  const ROAD_PARTICLE_CAP = 400;
  // SCALE: the most downed walkers the road keeps fading at once; past it the oldest goes
  const ROAD_FALLEN_MAX = 24;
  const BLOOD = ["#a3201a", "#7d1610"]; // a little brighter than the 3D figures' (118, 18, 14): it must show on the asphalt
  const SHOWCASE_SECS = 4; // the title screen's walkers change kind this often
  const MINI_HAZE = 0.25; // a place gone further into the haze than this is not in view for the minimap's fade
  const SIGN_GAP = 14; // px between the road's edge on the screen and the sign or the lane hint beside it
  // the road's edges are found on the screen this often along it (road units: Game.roadEdges)
  const EDGE_STEP = 120;
  const SPARK_ARMOR = "#c9cdd2"; // a bullet off a helmet or a vest
  /** How long a downed walker lasts: the 3D figures' fall (js/walker3d.js), or 2 s without them. */
  const fallSecs = () => (ZSR.Walker3D && ZSR.Walker3D.FALL_SECS > 0 ? ZSR.Walker3D.FALL_SECS : 2);
  const HIT_WORDS = ["BLAM!", "KRAK!", "THUD!"];
  // the angled camera (js/perspective.js), every drive: the van a little faster than the old top-down road's, its
  // shots much faster (far down the road they look slow), walkers coming a little more often (they are seen from
  // further off, so take longer to arrive); the van parks parkShort short of the door (seen in 3D its nose would be
  // in the wall)
  // SCALE: range (how far a shot flies) and keepUp (how near a walker must be to keep up with the van) are tied to
  // how far the angled view sees (Persp.cfg.far); spawns sets how many walkers a drive brings
  const PERSP = { pace: 1.25, shot: 1.6, spawns: 1.4, range: 2600, keepUp: 900, parkShort: 45 };
  // ... and its corners. The van brakes into each turn it takes: from the stop line (never before: braking must not
  // tell which way is right) it eases down by the time its path bends, holds that round the bend, then eases back up.
  // How far: brake x its speed into a gentle turn, less for a sharper one (js/streets.js brakeFor: by the turn's angle,
  // down to 0.4 at 135 deg, and further where a road was too short for the corner's comfortable shape). The ease takes
  // brakeIn at least (at the slowest van; longer for a faster one or a deeper brake, so no frame changes the speed more
  // than the light brake's do) and starts no sooner than it must (St.brakeSpan); back up over brakeOut (longer for a
  // deeper brake). The corners themselves are shaped for this camera (js/streets.js cornerSpin mirrors these numbers).
  // The camera follows lazily: it faces a point look ahead along the van's own path, never past a stop line the van
  // has not crossed (from one it looks further ahead again lookRamp times as fast as the van drives), and turns toward
  // it on a critically damped spring of camW per second; the spring's clock runs with the van's speed to the camPace
  // power (0: by time, 1: by distance), so a faster van turns the view a little faster and the bend never runs out of
  // the view. The van's nose eases into and out of a bend over nose units either side of it.
  // SCALE: brake, brakeIn, look, lookRamp, camW and camPace are mirrored in js/streets.js CAM (validate-drive checks
  // them), which shapes every corner for them: change both together. Nose is road units tuned for today's turns.
  Object.assign(PERSP, { brake: 0.75, brakeIn: 150, brakeOut: 300, look: 300, lookRamp: 2, camW: 2.2, camPace: 0.5, nose: 50 });
  // the road's canvas is drawn at no more device px a CSS px than this, as the angled view's ground on the card
  // (js/perspective-gl.js): only 175% and 200% screen scaling go past it, where a canvas drawn by the CPU costs about
  // 2.3 times dpr 1's (1.5 about 1.7 times) for words and pictures barely sharper
  const ROAD_DPR_MAX = 1.5;
  // a drive's first view (ground squares on the card, plants) is made before the van pulls out (Game.prepStep), for
  // at most this many seconds; a slow computer then drives off with the rest still coming in
  const PREP_SECS = 1;
  // the drive (the van along its track, its turns, lane slides and the camera) runs in steps no longer than this,
  // whatever the frame rate: a slow or uneven frame moves it just as several quick ones would
  // SCALE: a frame runs ceil(dt / DRIVE_STEP) drive steps (4 at 60 fps), so the drive's own cost grows with them
  const DRIVE_STEP = 1 / 240;
  // px/s/s: a lane slide still going when the van crosses a stop line into a turn slows to a stop at this (harder
  // only near the road's edge), as the van takes its path: under a unit's change in its step a frame at 60 fps
  const SLIDE_STOP = 3000;
  // how fast the van's heading and the camera's slide across the road ease, per second: at 60 fps the same share a
  // frame as before they were frame-rate independent (the van 0.2 of the way, the slide 0.05)
  const EASE = { van: -60 * Math.log(0.8), camSlide: -60 * Math.log(0.95) };
  const SIZE = { normal: 1, large: 1.3, huge: 2 };
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const normAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const smooth = (x) => x * x * (3 - 2 * x);
  const smoother = (x) => x * x * x * (x * (6 * x - 15) + 10); // smooth to its second derivative: no jolt at either end
  const textSize = () => SIZE[document.documentElement.getAttribute("data-size")] || 1;
  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  const loc = (id) => World().place(id); // a place, or a bare corner where roads meet

  const Game = {
    canvas: null,
    ctx: null,
    running: false,
    paused: false,
    hooks: {},

    init(canvas, hooks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.hooks = hooks || {};
      this.keys = {};
      this.pointer = { x: 0, y: 0, down: false, seen: false };
      const $ = (id) => document.getElementById(id);
      this.hud = { root: $("hud"), top: document.querySelector("#hud .hud-top"), hpFill: $("hp-fill"), hpText: $("hp-text"), scrap: $("scrap-text"), miles: $("miles-text"), kills: $("kills-text"), road: $("road-text"), segFill: $("segment-fill"), banner: $("banner"), mini: $("minimap") };
      this.mini = this.hud.mini ? this.hud.mini.getContext("2d") : null;
      this.bindInput();
      root.addEventListener("resize", () => this.resize());
      this.resize();
      document.addEventListener("visibilitychange", () => {
        if (document.hidden && this.running && !this.paused && this.hooks.onPause) this.hooks.onPause();
      });
    },

    resize() {
      const dpr = Math.min(ROAD_DPR_MAX, root.devicePixelRatio || 1);
      this.dpr = dpr;
      this.W = root.innerWidth;
      this.H = root.innerHeight;
      this.canvas.width = Math.round(this.W * dpr);
      this.canvas.height = Math.round(this.H * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // the camera's zoom (js/perspective.js setup: how far behind and above the van it sits): small screens see a
      // little more of the road
      this.zoomBase = clamp(Math.min(this.W / 1000, this.H / 640), 0.55, 1);
      this.zoom = this.zoomBase;
    },

    bindInput() {
      const c = this.canvas;
      const setAim = (e) => {
        const r = c.getBoundingClientRect();
        this.pointer.x = e.clientX - r.left;
        this.pointer.y = e.clientY - r.top;
        this.pointer.seen = true;
      };
      c.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        Audio().unlock();
        setAim(e);
        this.pointer.down = true;
        try {
          c.setPointerCapture(e.pointerId);
        } catch (err) {
          /* ignore */
        }
        e.preventDefault();
      });
      c.addEventListener("pointermove", (e) => setAim(e));
      const up = () => (this.pointer.down = false);
      c.addEventListener("pointerup", up);
      c.addEventListener("pointercancel", up);
      c.addEventListener("contextmenu", (e) => e.preventDefault());
      const CODE = { KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", KeyP: "p", Space: " ", Enter: "enter", ArrowUp: "arrowup", ArrowDown: "arrowdown", ArrowLeft: "arrowleft", ArrowRight: "arrowright", Escape: "escape" };
      const keyOf = (e) => CODE[e.code] || e.key.toLowerCase();
      root.addEventListener("blur", () => {
        this.keys = {};
        this.pointer.down = false;
        if (this.running && !this.paused && this.hooks.onPause) this.hooks.onPause();
      });
      root.addEventListener("keydown", (e) => {
        if (!this.running) return;
        if (e.repeat || (this.fade && this.fade.phase === "choose")) return; // the wrong-turn panel has the keys
        const k = keyOf(e);
        if (k === "arrowleft" || k === "a") this.keys.left = true;
        if (k === "arrowright" || k === "d") this.keys.right = true;
        if (k === " " || k === "arrowup" || k === "w") {
          this.keys.fire = true;
          e.preventDefault();
        }
        if ((k === "p" || k === "escape") && this.hooks.onPauseKey) this.hooks.onPauseKey();
      });
      root.addEventListener("keyup", (e) => {
        const k = keyOf(e);
        if (k === "arrowleft" || k === "a") this.keys.left = false;
        if (k === "arrowright" || k === "d") this.keys.right = false;
        if (k === " " || k === "arrowup" || k === "w") this.keys.fire = false;
      });
      const bindTouch = (id, key) => {
        const el = document.getElementById(id);
        if (!el) return;
        const on = (e) => {
          this.keys[key] = true;
          e.preventDefault();
        };
        const off = () => (this.keys[key] = false);
        el.addEventListener("pointerdown", on);
        el.addEventListener("pointerup", off);
        el.addEventListener("pointercancel", off);
        el.addEventListener("pointerleave", off);
      };
      bindTouch("touch-left", "left");
      bindTouch("touch-right", "right");
    },

    /** Drive from the trip's place to `opts.to` along `opts.path` (from Map.route); about `opts.seconds`; danger and day set the walkers. */
    startTrip(opts) {
      const S = State();
      const t = S.trip;
      const fx = S.effects();
      const St = Streets();
      const n = opts.danger * 1.3 + (S.save.day - 1) * 0.5;
      this.stats = Upgrades().stats(S.save.upgrades);
      this.opts = opts;
      const day = S.save.day;
      this.mods = { fog: !fx.headlights && day >= DIFF.fogChanceAfterDay && Math.random() < 0.25, night: !fx.headlights && day >= 4 && day % 3 === 0, crates: fx.crates };
      const interval = Math.max(DIFF.minInterval, DIFF.baseInterval - DIFF.intervalStep * n) * (this.mods.night ? 0.85 : 1);
      // every kind's road weight: road.w[0] + road.w[1] * n (WORLD.WALKER_TYPES)
      this.diff = { interval, hpMult: 1 + DIFF.hpStep * n, speedMult: Math.min(DIFF.maxSpeedMult, 1 + DIFF.speedStep * n), weights: World().walkerWeights("road", { n }) };
      // the route: the path the map planned, or the shortest one from where the van is
      const r = opts.path && opts.path.length > 1 ? { path: opts.path } : St.route((t && t.at) || "base", opts.to);
      const path = r.path;
      let dist = 0;
      for (let i = 0; i < path.length - 1; i++) dist += Math.hypot(loc(path[i]).x - loc(path[i + 1]).x, loc(path[i]).y - loc(path[i + 1]).y);
      this.speed = DIFF.roadScroll * this.stats.speed * PERSP.pace;
      const secs = opts.seconds || clamp(dist * World().SETTINGS.tripSecondsPerUnit, World().SETTINGS.tripMinSeconds, World().SETTINGS.tripMaxSeconds);
      this.drive = St.buildDrive(path, { scale: St.scaleFor(dist, secs, this.speed), speed: this.speed });
      this.origin = path[0];
      this.van = { s: 0, d: 0, x: 0, y: 0, heading: 0, vd: 0, w: 66, h: 118, aim: -Math.PI / 2, hurt: 0, cooldown: 0, flash: 0 };
      this.cam = { x: 0, y: 0, th: 0, d: 110, rel: 0, w: 0 };
      this.time = 0;
      this.attempt = 0;
      this.gameOverAt = null;
      this.pointer.down = false;
      this.keys = {};
      this.fade = null;
      t.miles = t.miles || 0;
      this.buildScenery();
      this.resetDrive();
      this.hud.root.classList.remove("hidden");
      this.hudFade(this.hud.top, 1);
      this.miniA = null;
      this.hud.road.textContent = St.text("to", { dest: opts.name }).toUpperCase();
      const tags = [this.mods.fog && "fog", this.mods.night && "night", t.hungry && "hungry"].filter(Boolean).map((k) => St.text(k).toUpperCase());
      this.banner([opts.name.toUpperCase()].concat(tags).join("  "), 1800);
      this.running = true;
      this.paused = false;
      this.last = 0;
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame((ts) => this.frame(ts));
    },

    /** Back to the start of the route: the van, the decisions and the walkers reset; the trip's tallies stay. */
    resetDrive() {
      const G = Streets().GEOM;
      this.track = this.drive.track;
      this.onMain = true;
      this.van.s = this.drive.startS;
      this.van.d = Streets().laneCenter(0, 2); // the left lane: it goes straight on past every side street
      this.van.vd = 0;
      this.van.hurt = 0;
      this.next = 0;
      this.turn = null;
      this.fail = null;
      this.arrive = null;
      this.hintDone = false;
      this.zombies = [];
      this.bullets = [];
      this.particles = [];
      this.bursts = [];
      this.fallen = [];
      this.odo = 0; // how far the van has driven this try, along its own path
      this.stopOdo = -1e9; // ... at the last stop line it crossed
      this.corner = null; // the angled camera's braking for a turn: { x0, xa, xb, xc } along odo, from the share f0
      this.lastTurn = null;
      this.spawnTimer = 2.2;
      this.shake = 0;
      this.placeVan(0, true);
      this.cam.th = Math.atan2(this.vanP.uy, this.vanP.ux);
      this.cam.d = (Streets().ourLeft(2) + G.half) / 2;
      this.placeCam(0, true);
    },

    /** Trees, wrecks and junk along every road near the route, and the supply crates on it.
     *  SCALE: walks every road in the city (D.roads), so its cost grows with the whole city, not the route;
     *  cull to the route's area if drives start slowly on a bigger map. The minimap likewise draws every road. */
    buildScenery() {
      const D = this.drive;
      const G = Streets().GEOM;
      const r = seeded(Streets().hash(D.path.join(">")) + 7);
      // a quick box test first: most of the city is far from any one spot
      const box = (s, m) => [Math.min(s.x0, s.x1) - m, Math.min(s.y0, s.y1) - m, Math.max(s.x0, s.x1) + m, Math.max(s.y0, s.y1) + m];
      const roads = D.roads.map((rd) => [box(rd, G.half + G.shoulder + 60), rd]);
      const sides = D.sides.map((s) => [box(s, G.sideHalf + G.shoulder + 120), s]);
      const inBox = (b, x, y) => x > b[0] && y > b[1] && x < b[2] && y < b[3];
      const near = (x, y, pad) => {
        for (const [b, rd] of roads) if (inBox(b, x, y) && distSeg(x, y, rd.x0, rd.y0, rd.x1, rd.y1) < G.half + G.shoulder + pad) return true;
        for (const [b, s] of sides) if (inBox(b, x, y) && distSeg(x, y, s.x0, s.y0, s.x1, s.y1) < G.sideHalf + G.shoulder + pad + (s.kind === "deadEnd" ? 60 : 0)) return true;
        for (const n of D.nodes) if (Math.hypot(n.x - x, n.y - y) < G.boxR + pad) return true;
        for (const l of D.lots) if (Math.hypot(l.qx - x, l.qy - y) < G.half + G.lotDepth + G.lotHalf + pad) return true;
        return false;
      };
      const onRoute = new Set();
      for (let i = 0; i < D.path.length - 1; i++) onRoute.add(Streets().roadKey(D.path[i], D.path[i + 1]));
      const zones = D.decisions.map((d) => [d.zoneStart - 200, d.stop + 200]);
      const zoneLines = D.decisions.map((d) => {
        const a = Streets().at(D.track, d.zoneStart - 200);
        const b = Streets().at(D.track, d.stop + 200);
        return [a.x, a.y, b.x, b.y];
      });
      // props face the way the route runs past them (the nearest road of the route), so their words read upright
      const legs = [];
      for (let i = 0; i < D.path.length - 1; i++) {
        const a = D.nodes.find((n) => n.id === D.path[i]);
        const b = D.nodes.find((n) => n.id === D.path[i + 1]);
        legs.push([a.x, a.y, b.x, b.y, Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2]);
      }
      const faceAt = (x, y) => {
        let best = legs[0];
        let bd = Infinity;
        legs.forEach((l) => {
          const dd = distSeg(x, y, l[0], l[1], l[2], l[3]);
          if (dd < bd) {
            bd = dd;
            best = l;
          }
        });
        return best[4];
      };
      this.props = [];
      D.roads.forEach((rd) => {
        // the roads the route uses get the full roadside; the rest get a sparser one
        const len = Math.hypot(rd.x1 - rd.x0, rd.y1 - rd.y0);
        const ux = (rd.x1 - rd.x0) / len;
        const uy = (rd.y1 - rd.y0) / len;
        const face = Math.atan2(uy, ux) + Math.PI / 2;
        const step = onRoute.has(rd.key) ? 85 : 170;
        for (let a = G.boxR; a < len - G.boxR; a += step * (0.6 + r() * 0.8)) {
          for (const sg of [-1, 1]) {
            if (r() < 0.45) continue;
            const off = sg * (G.half + G.shoulder + 40 + r() * 420);
            const x = rd.x0 + ux * a - uy * off;
            const y = rd.y0 + uy * a + ux * off;
            if (near(x, y, 25)) continue;
            this.props.push(this.makeProp(r, x, y, faceAt(x, y)));
          }
          // wrecks left on the oncoming side, never where lanes split or turns are made
          if (onRoute.has(rd.key) && r() < 0.12) {
            const x = rd.x0 + ux * a;
            const y = rd.y0 + uy * a;
            if (D.nodes.some((n) => Math.hypot(n.x - x, n.y - y) < G.boxR + 500)) continue;
            if (D.lots.some((l) => Math.hypot(l.qx - x, l.qy - y) < 700)) continue;
            if (D.sides.some((s) => Math.hypot(s.x0 - x, s.y0 - y) < 500)) continue;
            if (zoneLines.some((z) => distSeg(x, y, z[0], z[1], z[2], z[3]) < 300)) continue;
            // which side is oncoming depends on the way the route runs this road
            const i = D.path.indexOf(rd.a);
            const fwd = i >= 0 && D.path[i + 1] === rd.b;
            const sgn = fwd ? -1 : 1;
            const off = sgn * (G.lane * 0.5 + r() * G.lane * 0.9);
            this.props.push({ kind: r() < 0.7 ? "wreck" : "barrier", x: x - uy * off, y: y + ux * off, face, rot: (fwd ? Math.PI : 0) + r() - 0.5, color: ["#5a4538", "#3f4a55", "#6b6b6b", "#7a3a30"][Math.floor(r() * 4)] });
          }
        }
      });
      // supply crates sit in our lanes on the route, between the decision points
      this.crates = [];
      const n = this.mods.crates || 0;
      const lo = D.startS + 4 * this.speed;
      const hi = D.endS - 8 * this.speed;
      for (let i = 0, tries = 0; i < n && tries < 80 && hi > lo; tries++) {
        const s = lo + r() * (hi - lo);
        if (zones.some(([a, b]) => s > a && s < b)) continue;
        const p = Streets().at(D.track, s);
        const dd = Streets().laneCenter(r() < 0.5 ? 0 : 1, 2);
        this.crates.push({ x: p.x - p.uy * dd, y: p.y + p.ux * dd, t: r() * 3, face: Math.atan2(p.uy, p.ux) + Math.PI / 2 });
        i++;
      }
    },
    makeProp(r, x, y, face) {
      const roll = r();
      const seed = Math.floor(r() * 1e6);
      let p;
      if (roll < 0.36) p = { kind: "tree", size: 22 + r() * 14, seed };
      else if (roll < 0.47) p = { kind: "barrel", color: ["#7a4a2a", "#5f6b3c", "#4d4f55"][Math.floor(r() * 3)] };
      else if (roll < 0.56) p = { kind: "tire" };
      else if (roll < 0.68) p = { kind: "rubble", seed };
      else if (roll < 0.76) p = { kind: "barrier", rot: r() * 0.6 - 0.3 };
      else if (roll < 0.84) p = { kind: "sign", text: ["KEEP OUT", "NO ENTRY", "DETOUR", "QUIET", "SLOW"][Math.floor(r() * 5)], color: ["#d9a21b", "#b3261e", "#e6dfcc"][Math.floor(r() * 3)] };
      else p = { kind: "wreck", rot: r() * 1.2 - 0.6, color: ["#5a4538", "#3f4a55", "#6b6b6b", "#7a3a30"][Math.floor(r() * 4)] };
      p.x = x;
      p.y = y;
      p.face = face;
      return p;
    },

    pause() {
      if (!this.running) return;
      this.paused = true;
      this.pointer.down = false;
      this.keys = {};
    },
    resume() {
      if (!this.running) return;
      this.paused = false;
      this.last = 0;
    },
    stop() {
      this.running = false;
      this.paused = false;
      this.prep = this.prepping = false;
      cancelAnimationFrame(this.raf);
      this.hud.root.classList.add("hidden");
      // a drive really ended (at the door, dead, off to the map or the title; a wrong turn's retry is not a stop): the
      // angled view lets go of its ground squares, plants and walker canvases until the next drive
      if (ZSR.Persp && ZSR.Persp.release) ZSR.Persp.release();
    },

    banner(text, ms) {
      const b = this.hud.banner;
      b.textContent = text;
      b.classList.remove("hidden");
      b.style.animation = "none";
      void b.offsetWidth;
      b.style.animation = "";
      clearTimeout(this.bannerT);
      this.bannerT = setTimeout(() => b.classList.add("hidden"), ms || 1500);
    },

    /* ---------- Where things are ---------- */
    /** Put the van at its (s, d) on the current track, or on its own path through a turn; its heading eases toward
        the road's (and the lean of a lane slide) over dt, or is put there (snap). */
    placeVan(dt, snap) {
      const tn = this.turn;
      const p = tn ? Streets().at(tn.track, this.turnS()) : Streets().at(this.track, this.van.s);
      this.vanP = p;
      const v = this.van;
      // through a turn the van rides its own path, off it only while a lane slide still going at the stop line runs out
      const d = tn ? (tn.slide ? tn.slide.e : 0) : v.d;
      v.x = p.x - p.uy * d;
      v.y = p.y + p.ux * d;
      // where the camera keeps to and looks from: the van, or through a turn its path (the slide's run-out is the van's own)
      const b = this.vanBase || (this.vanBase = { x: 0, y: 0 });
      b.x = tn ? p.x : v.x;
      b.y = tn ? p.y : v.y;
      const lean = clamp(Math.atan2(v.vd, Math.max(60, this.curSpeed || this.speed)), -0.35, 0.35);
      // the camera turns slowly enough to show the van's own turn: its nose eases into and out of a bend (its path's
      // heading averaged PERSP.nose behind and ahead) instead of starting to swing all at once
      const want = this.pathHeading(PERSP.nose) + lean;
      v.heading = snap ? want : v.heading + normAngle(want - v.heading) * (1 - Math.exp(-dt * EASE.van));
    },
    /** The heading of the van's own path around it: its tangent averaged over W0 behind and ahead (more weight near
        the van), across the turn it is in or has just left. Ahead it never reaches past the next stop line, and from
        one it reaches out again only as the van drives on, so the heading never jumps where a turn begins. */
    pathHeading(W0) {
      const St = Streets();
      const tn = this.turn;
      const last = this.lastTurn;
      const dec = tn ? null : this.upcoming();
      const ahead = Math.max(0, Math.min(W0, this.odo - this.stopOdo, dec ? dec.stop - this.van.s : W0));
      const N = 4;
      let sx = 0;
      let sy = 0;
      for (let i = -N; i <= N; i++) {
        const u = ((i < 0 ? W0 : ahead) * i) / N;
        let a;
        if (tn) {
          const x = this.turnS() + u;
          a = tn.main && x > tn.track.len ? St.at(this.track, tn.s1 + x - tn.track.len) : St.at(tn.track, x);
        } else {
          const s = this.van.s + u;
          if (last && s < last.s1 && this.van.s - last.s1 < W0) a = St.at(last.track, last.track.len + s - last.s1);
          else a = St.at(this.track, s);
        }
        const w = N + 1 - Math.abs(i);
        sx += a.ux * w;
        sy += a.uy * w;
      }
      return Math.atan2(sy, sx);
    },
    /** How far along its turn path the van is: on the route its place (s) runs on underneath and maps onto the path. */
    turnS() {
      const tn = this.turn;
      return tn.main ? (this.van.s - tn.s0) * tn.k : this.van.s;
    },
    /** The camera rides the road at the van, centered on our side of it (through a turn: off the van's path, easing
        over), facing lazily down the van's own path (lazyHeading). Its heading and its slide ease over dt, or are put
        where they belong (snap). */
    placeCam(dt, snap) {
      const c = this.cam;
      const v = this.van;
      this.lazyHeading(dt, snap);
      if (this.turn) {
        const tn = this.turn;
        const x = clamp(this.turnS() / Math.min(tn.track.len, 700), 0, 1);
        c.rel = tn.cam0 + (tn.cam1 - tn.cam0) * smoother(x);
      } else {
        const want = (this.laneRange()[0] - 33 + Streets().GEOM.half) / 2;
        c.d = snap ? want : c.d + (want - c.d) * (1 - Math.exp(-dt * EASE.camSlide));
        c.rel = c.d - v.d;
      }
      // off the van along the camera's own right, not the road's: while the view turns (it lags the road through a
      // turn) the van keeps its place on the screen instead of bobbing up and down it
      const b = this.vanBase || v;
      c.x = b.x - Math.sin(c.th) * c.rel;
      c.y = b.y + Math.cos(c.th) * c.rel;
    },
    /** The way the angled camera wants to face: toward a point PERSP.look along the van's own path ahead (its turn,
        then the road it rejoins), so the view turns into a bend as the van comes to it. Never past the next stop line
        before the van crosses it (the view gives no way away); from a stop line it looks further ahead again as the
        van drives on, so the way it faces never jumps. */
    lookHeading() {
      const L = Math.min(PERSP.look, (this.odo - this.stopOdo) * PERSP.lookRamp + 4);
      const a = L >= 4 ? this.ahead(L) : null;
      const b = this.vanBase || this.van;
      return a && a.L >= 4 ? Math.atan2(a.y - b.y, a.x - b.x) : Math.atan2(this.vanP.uy, this.vanP.ux);
    },
    /** The point L along the van's own path ahead of it, in its lane (its turn, then the road it rejoins), the
        path's heading there (th) and how far ahead it is (L): never past the next stop line the van has not crossed. */
    ahead(L) {
      const St = Streets();
      const v = this.van;
      const tn = this.turn;
      let a;
      let d;
      if (tn) {
        const s = this.turnS() + L;
        if (tn.main && s > tn.track.len) {
          a = St.at(this.track, tn.s1 + (s - tn.track.len));
          d = tn.d1;
        } else {
          a = St.at(tn.track, s);
          d = 0;
        }
      } else {
        const dec = this.upcoming();
        if (dec) L = Math.max(0, Math.min(L, dec.stop - v.s));
        a = St.at(this.track, v.s + L);
        d = v.d;
      }
      return { x: a.x - a.uy * d, y: a.y + a.ux * d, th: Math.atan2(a.uy, a.ux), L };
    },
    /** The angled camera's heading: a critically damped spring toward lookHeading(), stepped exactly over dt (the
        drive's steps are short enough that the target barely moves in one). Its clock runs with the van's speed to
        the PERSP.camPace power. */
    lazyHeading(dt, snap) {
      const c = this.cam;
      const tg = this.lookHeading();
      if (snap) {
        c.th = tg;
        c.w = 0;
        return;
      }
      const s = this.spring(c.th, c.w || 0, tg, dt * this.camPace());
      c.th = s.th;
      c.w = s.w;
    },
    /** How fast the angled camera's spring clock runs: with the van's speed (against the slowest van's) to the
        PERSP.camPace power. */
    camPace() {
      return Math.pow(Math.max(0.25, (this.curSpeed || this.speed) / (DIFF.roadScroll * PERSP.pace)), PERSP.camPace);
    },
    /** One exact step of a critically damped spring (PERSP.camW per second) of heading th turning at w, toward tg
        held still, over h. */
    spring(th, w, tg, h) {
      const k = PERSP.camW;
      const e0 = normAngle(th - tg);
      const q = w + k * e0;
      const ex = Math.exp(-k * h);
      return { th: tg + (e0 + q * h) * ex, w: (w - k * q * h) * ex };
    },
    /** Where the angled view will be at each of `times` (seconds from now, rising), so its ground can be drawn ahead:
        its spot and heading, its spring stepped on along the van's own path at the van's speed now. Stops short at a
        stop line the van has not crossed (which way it goes is not known yet). */
    viewsAhead(times) {
      const c = this.cam;
      const v = this.curSpeed || this.speed;
      const pace = this.camPace();
      let th = c.th;
      let w = c.w || 0;
      let t = 0;
      const out = [];
      for (const T of times) {
        while (t < T - 1e-9) {
          const h = Math.min(1 / 30, T - t);
          t += h;
          const L = v * t;
          const p = this.ahead(L);
          if (p.L < L - 1) return out;
          const q = this.ahead(L + Math.min(PERSP.look, (this.odo + L - this.stopOdo) * PERSP.lookRamp + 4));
          const s = this.spring(th, w, q.L - p.L >= 4 ? Math.atan2(q.y - p.y, q.x - p.x) : p.th, h * pace);
          th = s.th;
          w = s.w;
        }
        const p = this.ahead(v * T);
        out.push({ x: p.x - Math.sin(th) * c.rel, y: p.y + Math.cos(th) * c.rel, th });
      }
      return out;
    },
    /** World -> screen (CSS px): the ground, through the angled camera (js/perspective.js; off the bottom of the
        screen behind it). */
    toScreen(x, y) {
      return ZSR.Persp.toScreen(this, x, y);
    },
    /** Screen -> world: the ground under that spot (no farther than the haze). */
    toWorld(sx, sy) {
      return ZSR.Persp.toWorld(this, sx, sy);
    },
    /** The decision whose lanes or sign are coming up (main track only). */
    upcoming() {
      return this.onMain && !this.arrive ? this.drive.decisions[this.next] || null : null;
    },
    /** Where the van may slide: our two lanes, or every lane of the split ahead. */
    laneRange() {
      const G = Streets().GEOM;
      const d = this.upcoming();
      const n = d && this.van.s >= d.zoneStart - 120 ? d.n : 2;
      return [Streets().ourLeft(n) + 33, G.half - 33];
    },

    /* ---------- Walkers ---------- */
    /** A kind for the next walker, from the trip's road weights (every WORLD.WALKER_TYPES kind comes on the road). */
    pickType() {
      return World().pickWalkerType(this.diff.weights);
    },
    /** One walker from far down the road or out of the weeds at a side (js/perspective.js spawn: the camera sees far,
        so they come from far off and fade in); its kind from the road's mix unless `type` is given. */
    spawnZombie(type) {
      const w = ZSR.Persp.spawn(this);
      return this.addZombie(type || this.pickType(), w.x, w.y);
    },
    /** A walker of `type` (a WORLD.WALKER_TYPES id; an unknown one is the first kind, a plain walker) at world x, y.
        Its road stats are the kind's `road` row; health is its on-foot health, tougher with the trip's danger and day. */
    addZombie(type, x, y) {
      const TYPES = World().WALKER_TYPES;
      const id = TYPES[type] ? type : Object.keys(TYPES)[0];
      const T = TYPES[id];
      const R = T.road;
      const hp = Math.round(T.hp * this.diff.hpMult);
      const z = {
        type: id,
        x,
        y,
        r: R.r,
        hp,
        maxHp: hp,
        speed: R.speed * this.diff.speedMult * rand(0.85, 1.15),
        dmg: R.dmg,
        scrap: R.scrap,
        reach: R.reach || 0, // px past its radius that it hits the van from (the lanky's long arms)
        knock: T.knock == null ? 1 : T.knock, // how far a shot or the bumper throws it back
        armor: R.armor || 0, // the share of its hits that glance off its gear (grey sparks, less blood)
        scream: !!T.scream,
        screamT: 0, // till it can scream again
        yell: 0, // screaming now (arms up, standing): counts down from SCREAM.yell
        frenzyT: 0, // sped up by a scream
        seed: (Math.random() * 1e6) | 0, // its look's variant and smears
        seen: false, // on the screen yet (State.meetWalker)
        angle: this.cam.th + Math.PI,
        phase: Math.random() * 6.28,
        hit: 0,
        cool: 0,
        kx: 0,
        ky: 0,
        born: this.time, // it fades in (js/perspective.js walker)
      };
      this.zombies.push(z);
      return z;
    },
    /** God mode and tests: one walker of `type` on the road ahead of the van, on the screen and clear of the others
        (the same contract as Interior.spawnWalkerAhead). Returns it, or null when there is no room (the van wrecked,
        the screen dark after a wrong turn, every spot ahead taken). A plain attacker, like any road walker. */
    spawnWalkerAhead(type) {
      if (!this.running || !this.van || !this.diff || this.gameOverAt != null || (this.fade && this.fade.phase !== "in")) return null;
      const v = this.van;
      const fx = Math.cos(v.heading);
      const fy = Math.sin(v.heading);
      const T = World().WALKER_TYPES[type] || World().WALKER_TYPES[Object.keys(World().WALKER_TYPES)[0]];
      const r = T.road.r;
      for (const d of [300, 240, 360, 190, 420]) {
        for (const off of [0, 70, -70, 140, -140]) {
          const x = v.x + fx * d - fy * off;
          const y = v.y + fy * d + fx * off;
          const s = this.toScreen(x, y);
          const m = (r + 10) * this.zoom;
          if (s.x < m || s.x > this.W - m || s.y < m || s.y > this.H - m) continue;
          if (this.zombies.some((o) => Math.hypot(o.x - x, o.y - y) < o.r + r + 6)) continue;
          const z = this.addZombie(type, x, y);
          z.angle = Math.atan2(v.y - y, v.x - x);
          return z;
        }
      }
      return null;
    },
    /** A screamer saw the van: it stands and screams, and every walker within SCREAM.radius tiles of it (itself
        too) moves SCREAM.mult times faster for SCREAM.secs. Again only after SCREAM.cooldown. */
    scream(z) {
      const SC = World().SCREAM;
      const R = SC.radius * DIFF.pxPerTile;
      z.screamT = SC.cooldown;
      z.yell = SC.yell;
      for (const o of this.zombies) if (Math.hypot(o.x - z.x, o.y - z.y) <= R) o.frenzyT = Math.max(o.frenzyT || 0, SC.secs);
      this.burst("SKREE!", z.x, z.y, "#e6dfcc", "#702a38", 1);
      Audio().play("scream");
      if (State().settings.shake) this.shake = Math.max(this.shake, 5);
    },
    /** A hit on a walker at x, y going (vx, vy) (a bullet's flight, or the van's push when it rams one): with
        walker gore on, a short spray of blood out the far side, every hit (owner, 2026-10-15). A walker with armor
        (its road row's share) has that share of its non-fatal hits also glance off a helmet or a vest: grey sparks
        (gore on or off) and a smaller spray. Skipped past ROAD_PARTICLE_CAP. */
    blood(z, x, y, vx, vy, kill, h) {
      const glance = !kill && z.armor > 0 && Math.random() < z.armor;
      if (glance) this.sparks(x, y, SPARK_ARMOR, h);
      if (World().SETTINGS.walkerGore === false || this.particles.length > ROAD_PARTICLE_CAP) return;
      const a0 = Math.atan2(vy, vx);
      const n = kill ? 9 : glance ? 3 : 5;
      // the drops fly on with the walker (it keeps up with the van once near it, as it does); what lands stays on the
      // road
      const v = this.van;
      const keep = v ? clamp((PERSP.keepUp - Math.hypot(v.x - z.x, v.y - z.y)) / 400, 0, 1) : 1;
      const cx = v ? Math.cos(v.heading) * (this.curSpeed || 0) * DIFF.chase * keep : 0;
      const cy = v ? Math.sin(v.heading) * (this.curSpeed || 0) * DIFF.chase * keep : 0;
      // the spray is seen in the air, as on foot (js/interior.js bleed): from the hit's height, and one drop in three
      // splashes back out to the sides toward the shot (the camera is behind the van: the rest fly out behind the body,
      // which hides them); it falls and lands (updateParticles)
      const P = ZSR.Persp;
      for (let i = 0; i < n; i++) {
        const back = i % 3 === 2;
        const a = back ? a0 + Math.PI + (i % 2 ? 1 : -1) * rand(0.8, 1.3) : a0 + rand(-0.5, 0.5) * (kill ? 1.6 : 1);
        const s = rand(60, 160) * (kill ? 1.2 : 1) * (back ? 0.6 : 1);
        const p = { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, cx, cy, life: 0.4, maxLife: 0.4, size: rand(3, 4.8), color: BLOOD[i % 2], blood: true, leaves: i % 2 === 0 };
        P.dropAt(p, z, h);
        this.particles.push(p);
      }
    },

    burst(text, x, y, color, bg, size) {
      this.bursts.push({ text, x, y, t: 0, life: 0.8, color, bg, size: size || 1, rot: rand(-0.25, 0.25) });
      if (this.bursts.length > 12) this.bursts.shift();
    },
    dust(x, y, r) {
      if (this.particles.length > ROAD_PARTICLE_CAP) return;
      for (let i = 0; i < 5; i++) {
        const a = Math.random() * 6.28;
        const s = rand(50, 110);
        this.particles.push({ x: x + Math.cos(a) * r * 0.8, y: y + Math.sin(a) * r * 0.8, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.4, maxLife: 0.4, size: r * rand(0.14, 0.24), color: i % 2 === 0 ? "#6b675c" : "#4a473f", grow: true });
      }
    },
    /** Sparks flying out from x, y; h: their height, on the angled camera (a shot's, where it hit). */
    sparks(x, y, color, h) {
      if (this.particles.length > ROAD_PARTICLE_CAP) return;
      for (let i = 0; i < 4; i++) {
        const a = Math.random() * 6.28;
        const s = rand(80, 200);
        const p = { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.25, maxLife: 0.25, size: 3.5, color: color || "#ffe9a6" };
        if (h > 0) p.z = h;
        this.particles.push(p);
      }
    },

    frame(ts) {
      if (!this.running) return;
      this.raf = requestAnimationFrame((t) => this.frame(t));
      // the time since the last frame as the page shows them (the angled view's scenery governor reads it: the whole
      // frame's cost, the canvas's raster and the compositor's included), and which frame this is
      this.rafMs = this.last ? ts - this.last : 0;
      this.rafN = (this.rafN || 0) + 1;
      if (!this.last) this.last = ts;
      const dt = Math.min(0.05, (ts - this.last) / 1000);
      this.last = ts;
      // Huge text needs room beside the road for its signs: pull the camera back a little
      this.zoom = this.zoomBase * (textSize() >= 2 ? 0.85 : 1);
      // a drive's first view is made while the van waits at its door (a retry's behind the dark), so it never pulls
      // out on a stall: it goes once the ground under the view and just ahead of it is drawn (Persp.ready), or after
      // PREP_SECS whatever is left
      this.prep = this.prepStep();
      if (this.prep) this.updateHud();
      else if (!this.paused) this.update(dt);
      this.draw();
    },
    /** Whether the van still waits at its door this frame (frame): from a drive's start, and a retry's, until its
        first view is ready or PREP_SECS of the page's time have gone. */
    prepStep() {
      if (!ZSR.Persp || !ZSR.Persp.ready) return false;
      if (this.prepFor !== this.drive || this.prepTry !== this.attempt) {
        this.prepFor = this.drive;
        this.prepTry = this.attempt;
        this.prepT = 0;
        this.prepping = true;
      }
      if (!this.prepping) return false;
      this.prepT += Math.min(0.25, (this.rafMs || 0) / 1000);
      if (this.prepT >= PREP_SECS || ZSR.Persp.ready(this)) this.prepping = false;
      return this.prepping;
    },

    /* ---------- Decisions ---------- */
    /** The van crossed a stop line: the lane it is in is the way it goes. */
    commit(dec) {
      const St = Streets();
      this.stopOdo = this.odo - (this.van.s - dec.stop);
      const lane = St.laneOf(this.van.d, dec.n);
      const opt = dec.options[dec.lanes[lane]];
      this.next += 1;
      if (opt.correct) this.hintDone = true;
      if (opt.correct && opt.kind === "through") return;
      // the van drives its own path from the lane it is in: one smooth arc, whichever lane (streets.js turnPath). Still
      // sliding across the lanes, it plans its path from where the slide runs out (at SLIDE_STOP, or harder near the
      // road's edge) and runs out onto it, so it never stops sideways at once
      let dPlan = this.van.d;
      let slide = null;
      const vd = this.van.vd || 0;
      if (Math.abs(vd) > 1) {
        const room = vd > 0 ? St.GEOM.half - St.GEOM.vanHalf - this.van.d : this.van.d - (St.ourLeft(dec.n) + St.GEOM.vanHalf);
        const A = Math.max(SLIDE_STOP, (vd * vd) / (2 * Math.max(1, room)));
        dPlan = this.van.d + (Math.sign(vd) * vd * vd) / (2 * A);
        slide = { e: this.van.d - dPlan, v: vd, A };
      }
      const tp = St.turnPath(this.drive, dec, opt, dPlan);
      const cam0 = this.cam.d - dPlan; // the camera's offset from the van's path, kept as the turn begins
      if (opt.correct) {
        // a junction or the destination: the van's place on the route runs on underneath (signs, progress) and maps onto the path
        const s1 = dec.kind === "dest" ? this.drive.endS : tp.rejoin;
        const cam1 = dec.kind === "dest" ? 0 : (St.ourLeft(2) + St.GEOM.half) / 2 - tp.d1;
        this.turn = { track: tp.track, main: true, s0: dec.stop, s1, k: tp.track.len / Math.max(1, s1 - dec.stop), d1: tp.d1, cam0, cam1, slide };
        // the part of this step past the stop line was driven at the road's rate: on the turn's path it is the same distance
        this.van.s = dec.stop + (this.van.s - dec.stop) / this.turn.k;
        if (dec.kind === "dest") this.arrive = { t: 0, parked: false };
        this.planBrake(tp.track);
        return;
      }
      // the wrong way: drive into it for a moment, then fade and start over
      this.track = tp.track;
      this.onMain = false;
      this.van.s = Math.max(0, this.van.s - dec.stop);
      this.van.d = 0;
      this.turn = { track: tp.track, main: false, cam0, cam1: 0, slide };
      this.planBrake(tp.track);
      this.fail = { t: 0, msg: this.failText(opt, dec) };
      Audio().play("wrong");
    },
    placeName(id) {
      const l = loc(id);
      return l ? l.name : id;
    },
    /** Where a road out of a junction leads: past a bare corner it runs on to the next place. */
    roadEnd(dec, opt) {
      return Streets().farPlace(dec.node, opt.to);
    },
    failText(opt, dec) {
      const St = Streets();
      const S = State();
      const dest = this.opts.name;
      if (opt.kind === "road") {
        const to = dec ? this.roadEnd(dec, opt) : opt.to;
        return S.isKnown(to) && !World().isJunction(to) ? St.text("wrongWay", { place: this.placeName(to), dest }) : St.text("wrongStreet", { street: opt.street, dest });
      }
      if (opt.kind === "side") return St.text("wrongSide", { street: opt.street, dest });
      // a place's own drive
      return S.isKnown(opt.to) ? St.text("wrongPlace", { place: this.placeName(opt.to), dest }) : St.text("wrongLot", { dest });
    },
    /** What the sign for a decision says: one row per lane, left to right (only the turn for a side street).
        At a place's corner its own drive is a row too, named for the place (a parking lot if not known yet). */
    signFor(dec) {
      const St = Streets();
      const S = State();
      if (dec.kind === "side") {
        const turn = dec.options.find((o) => o.kind === "side");
        return { style: "street", rows: [{ rel: turn.rel, text: turn.street, badge: St.text(turn.sideKind), badgeKind: turn.sideKind }] };
      }
      return {
        style: "guide",
        rows: dec.options.map((o) => {
          if (o.kind === "drive") return { rel: o.rel, text: S.isKnown(o.to) ? this.placeName(o.to) : St.text("lot") };
          const to = this.roadEnd(dec, o);
          return { rel: o.rel, text: S.isKnown(to) && !World().isJunction(to) ? this.placeName(to) : o.street };
        }),
      };
    },
    startFade(msg) {
      this.fade = { phase: "out", t: 0, msg };
    },
    /** The wrong-turn card's "Try again": back to the start of the route, the screen fades back in. */
    retry() {
      const f = this.fade;
      if (!f || f.phase !== "choose") return;
      this.attempt += 1;
      this.keys = {};
      this.pointer.down = false;
      this.resetDrive();
      f.phase = "in";
      f.t = 0;
    },

    /** The corner braking for the turn path just committed to (from its stop line, this.stopOdo): the
        share it brakes to (by the turn's sharpness and shape: St.brakeFor), where it starts to ease down and where it
        has (by where the path starts to bend, brakeIn at least, by the van's speed: St.brakeSpan), where the bend
        ends, and where it is back up to speed. */
    planBrake(track) {
      const St = Streets();
      const a0 = St.at(track, 0);
      const a1 = St.at(track, track.len);
      const h0 = Math.atan2(a0.uy, a0.ux);
      const h1 = Math.atan2(a1.uy, a1.ux);
      // the bend: the first and last places the path's heading is off its start's and its end's (a 4-unit walk;
      // SCALE: once per turn, so a turn path's length is walked once when it is committed to)
      let a = 0;
      let b = track.len;
      for (let q = 0; q <= track.len; q += 4) {
        const t = St.at(track, q);
        if (Math.abs(normAngle(Math.atan2(t.uy, t.ux) - h0)) > 0.003) break;
        a = q;
      }
      for (let q = track.len; q >= a; q -= 4) {
        const t = St.at(track, q);
        if (Math.abs(normAngle(Math.atan2(t.uy, t.ux) - h1)) > 0.003) break;
        b = q;
      }
      // how hard: PERSP.brake into a gentle turn, more into a sharp one (by its angle: one that doubles back is taken
      // slowly), and more again where its road was too short for the shape it wanted (js/streets.js brakeFor)
      const B = St.brakeFor(normAngle(h1 - h0), track.r, a, this.speed);
      // (brakeIn is for the slowest van: a faster one eases over more road, in the same time, never more sharply; a
      // deeper brake eases over more road too, so no frame changes the speed more than the light brake's do; on a long
      // straight before the bend the van keeps its speed a while: St.brakeSpan)
      const [xs, xa] = St.brakeSpan(a, B, this.speed);
      const xb = Math.max(b, xa);
      // from the speed it has now (still easing back up from a turn just before, the share it is at)
      const f0 = this.brakeAt();
      this.corner = { x0: this.stopOdo, xs, xa, xb, xc: xb + St.brakeOutFor(B, PERSP.brakeOut, this.speed), f0, B };
    },
    /** The share of its speed the van drives at for its corner now (1 with none). */
    brakeAt() {
      const c = this.corner;
      if (!c) return 1;
      const x = this.odo - c.x0;
      const B = c.B;
      if (x >= c.xc) {
        this.corner = null;
        return 1;
      }
      if (x < c.xs) return c.f0;
      if (x < c.xa) return c.f0 - (c.f0 - B) * smoother(clamp((x - c.xs) / (c.xa - c.xs), 0, 1));
      if (x < c.xb) return B;
      return B + (1 - B) * smoother((x - c.xb) / (c.xc - c.xb));
    },
    /** Where the van stops on its track: the end (at a place, a parking spot short of the door). */
    driveEnd() {
      return this.track.len - (this.arrive ? PERSP.parkShort : 0);
    },
    /** One step of the drive: the van follows its track (it brakes into a parking spot or a dead end), commits to the
        way its lane goes at each stop line, slides between lanes or drives its turn; then the van and the camera are placed. */
    driveStep(dt) {
      const t = State().trip;
      const van = this.van;
      const end = this.driveEnd();
      const left = end - van.s;
      // and into a turn
      const brake = (this.arrive || !this.onMain ? clamp(Math.sqrt(Math.max(0, left) / 260), 0, 1) : 1) * this.brakeAt();
      this.curSpeed = this.speed * brake;
      // through a turn on the route, s runs at the rate that keeps the van's own speed on its path
      const s0 = van.s;
      van.s = Math.min(end, van.s + (this.curSpeed * dt) / (this.turn && this.turn.main ? this.turn.k : 1));
      this.odo += (van.s - s0) * (this.turn && this.turn.main ? this.turn.k : 1);
      t.miles += DIFF.milesPerSecond * this.stats.speed * dt * brake;
      while (this.onMain && !this.arrive && this.next < this.drive.decisions.length && van.s >= this.drive.decisions[this.next].stop) this.commit(this.drive.decisions[this.next]);
      // a place at the end of its one road: past the last decision the road runs on to it, and the van parks there
      if (this.onMain && !this.arrive && !this.turn && this.next >= this.drive.decisions.length) this.arrive = { t: 0, parked: false };
      // lanes: the player slides, or the van drives its turn
      van.vd = 0;
      if (this.turn) {
        const tn = this.turn;
        const sl = tn.slide;
        if (sl) {
          // a slide still going at the stop line runs out at a steady rate, onto the path
          const v1 = sl.v - Math.sign(sl.v) * Math.min(Math.abs(sl.v), sl.A * dt);
          sl.e += ((sl.v + v1) / 2) * dt;
          sl.v = v1;
          van.vd = v1;
          if (!v1) tn.slide = null;
        }
        if (tn.main && !this.arrive && van.s >= tn.s1) {
          // back on the route's road, in the lane the turn ended in (the part of this step past the turn's end at the road's own rate)
          van.s = tn.s1 + (van.s - tn.s1) * tn.k;
          van.d = tn.d1;
          this.cam.d = tn.cam1 + tn.d1;
          this.lastTurn = tn;
          this.turn = null;
        }
      } else {
        let dir = 0;
        if (this.keys.left) dir -= 1;
        if (this.keys.right) dir += 1;
        const [lo, hi] = this.laneRange();
        const d0 = van.d;
        let nd = van.d + dir * this.stats.laneSpeed * dt;
        // a lane that ends (a bay after its stop line) eases the van back over instead of jumping it
        const ease = Math.max(this.stats.laneSpeed, 320) * dt;
        if (nd < lo) nd = Math.min(lo, Math.max(nd, d0) + ease);
        if (nd > hi) nd = Math.max(hi, Math.min(nd, d0) - ease);
        van.d = nd;
        van.vd = dt > 0 ? (van.d - d0) / dt : 0;
      }
      this.placeVan(dt);
      this.placeCam(dt);
    },

    update(dt) {
      const t = State().trip;
      const stats = this.stats;
      const van = this.van;
      const St = Streets();
      this.time += dt;
      if (this.gameOverAt != null) {
        this.gameOverAt -= dt;
        this.shake *= 0.9;
        this.updateParticles(dt);
        if (this.gameOverAt <= 0) {
          this.stop();
          if (this.hooks.onDeath) this.hooks.onDeath();
        }
        return;
      }
      // a wrong turn: dark, then the page asks what next (try again, the town map, or back where the van set out)
      if (this.fade) {
        const f = this.fade;
        f.t += dt;
        if (f.phase === "out" && f.t >= DIFF.fadeOut) {
          f.phase = "choose";
          f.t = 0;
          if (this.hooks.onWrongTurn) this.hooks.onWrongTurn({ msg: f.msg, origin: this.origin, originName: this.placeName(this.origin) });
          else this.retry();
        } else if (f.phase === "in" && f.t >= DIFF.fadeIn) this.fade = null;
        if (this.fade && this.fade.phase !== "in") {
          this.updateHud();
          return;
        }
      }

      // drive, in steps of at most DRIVE_STEP (the same path and camera however the frames fall)
      const steps = Math.max(1, Math.ceil(dt / DRIVE_STEP - 1e-9));
      for (let i = 0; i < steps; i++) this.driveStep(dt / steps);
      const end = this.driveEnd();
      if (this.fail) {
        this.fail.t += dt;
        if (this.fail.t >= DIFF.wrongDrive && !this.fade) this.startFade(this.fail.msg);
      }
      if (this.arrive) {
        if (van.s >= end - 3) {
          if (!this.arrive.parked) {
            this.arrive.parked = true;
            this.banner(St.text(this.opts.to === "base" ? "home" : "here").toUpperCase(), 2500);
          }
          this.arrive.t += dt;
          if (this.arrive.t >= DIFF.parkWait) {
            this.stop();
            if (this.hooks.onArrive) this.hooks.onArrive(this.opts.to);
            return;
          }
        }
      }

      // the gun
      van.hurt = Math.max(0, van.hurt - dt * 2);
      van.cooldown -= dt;
      // gun: where its mount is in the world, the world angle it points (at a walker clicked, led), its height and how
      // a shot drops, that angle on the screen, and the barrels' spread (js/perspective.js aim)
      const gun = ZSR.Persp.aim(this, State().settings.aimAssist, stats.bulletSpeed * PERSP.shot, stats.bullets);
      const firing = (this.pointer.down || this.keys.fire) && !this.fade;
      if (firing && van.cooldown <= 0) {
        van.cooldown = stats.fireInterval;
        const n = stats.bullets;
        // bullets carry the van's own speed, so on screen (which rides with the van) they fly straight at the pointer;
        // the camera has already moved this frame, so a new one starts a frame's carry back
        const cx = Math.cos(van.heading) * this.curSpeed;
        const cy = Math.sin(van.heading) * this.curSpeed;
        const bs = stats.bulletSpeed * PERSP.shot;
        for (let i = 0; i < n; i++) {
          // each barrel along its own line, the fan centred on the aim (closed in on a walker clicked: gun.spread)
          const a = gun.angle + (i - (n - 1) / 2) * gun.spread;
          const shot = { x: gun.x + Math.cos(a) * 24 - cx * dt, y: gun.y + Math.sin(a) * 24 - cy * dt, vx: Math.cos(a) * bs, vy: Math.sin(a) * bs, cx, cy, dmg: stats.damage };
          // shots have a height: they leave the barrels and drop toward what the pointer is on
          Object.assign(shot, { z: gun.z + gun.dz * 24, dz: gun.dz });
          this.bullets.push(shot);
        }
        van.flash = 0.07;
        Audio().play("shoot");
      }
      van.flash = Math.max(0, van.flash - dt);
      van.drawAim = gun.screen;
      van.aimW = gun.angle;
      van.aimDz = gun.dz || 0;
      van.aimSpread = gun.spread;

      // walkers keep coming down the destination's drive, until the van is nearly at the door
      if (!this.arrive || this.track.len - van.s > DIFF.quietAtDoor) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnZombie();
          this.spawnTimer = (this.diff.interval * rand(0.7, 1.3)) / PERSP.spawns;
        }
      }
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.x += (b.vx + b.cx) * dt;
        b.y += (b.vy + b.cy) * dt;
        if (b.dz) b.z = Math.max(6, b.z + b.dz * Math.hypot(b.vx, b.vy) * dt);
        if (Math.hypot(b.x - van.x, b.y - van.y) > PERSP.range) {
          this.bullets.splice(i, 1);
          continue;
        }
        // the shot's whole step this frame (fast shots would skip past an edge), and only below the walker's head (a
        // shot over it flies on)
        const stepX = (b.vx + b.cx) * dt;
        const stepY = (b.vy + b.cy) * dt;
        for (let j = 0; j < this.zombies.length; j++) {
          const z = this.zombies[j];
          let dx = z.x - b.x;
          let dy = z.y - b.y;
          // nearest point of this frame's step (from where it was, t 0, to where it is, t 1)
          const t = clamp((dx * stepX + dy * stepY) / (stepX * stepX + stepY * stepY || 1) + 1, 0, 1);
          dx -= stepX * (t - 1);
          dy -= stepY * (t - 1);
          if (b.z != null && b.z > ZSR.Persp.walkerH(z) + 8) continue;
          if (dx * dx + dy * dy < (z.r + 6) * (z.r + 6)) {
            z.hp -= b.dmg;
            z.hit = 0.12;
            z.kx += b.vx * 0.08 * z.knock;
            z.ky += b.vy * 0.08 * z.knock;
            // where it hit: the nearest point of the shot's step (b is at the step's end, up to a walker's width past
            // it), at the shot's height
            const hx = z.x - dx;
            const hy = z.y - dy;
            const hz = b.z != null ? b.z : undefined;
            this.sparks(hx, hy, undefined, hz);
            this.blood(z, hx, hy, b.vx, b.vy, z.hp <= 0, hz);
            this.meet(z);
            Audio().play("hit");
            if (z.hp <= 0) this.killZombie(j, Math.atan2(b.vy, b.vx));
            else if (Math.random() < 0.25) this.burst(HIT_WORDS[Math.floor(Math.random() * HIT_WORDS.length)], z.x, z.y, "#e8392f", "#ffcf40", 0.8);
            this.bullets.splice(i, 1);
            break;
          }
        }
      }
      // walkers home in on the van and keep up with it, as on the old scrolling road
      const fx = Math.cos(van.heading);
      const fy = Math.sin(van.heading);
      const rx = -fy;
      const ry = fx;
      const chase = this.curSpeed * DIFF.chase;
      ZSR.Persp.setup(this);
      const SC = World().SCREAM;
      for (let i = this.zombies.length - 1; i >= 0; i--) {
        const z = this.zombies[i];
        const x0 = z.x; // where it stood (its legs go by the ground it covers)
        const y0 = z.y;
        z.frenzyT = Math.max(0, z.frenzyT - dt);
        z.yell = Math.max(0, z.yell - dt);
        z.screamT = Math.max(0, z.screamT - dt);
        const dx = van.x - z.x;
        const dy = van.y - z.y;
        const dist = Math.hypot(dx, dy) || 1;
        z.angle = Math.atan2(dy, dx);
        // its own way at the van: none while it screams, faster in a frenzy (keeping up with the van is not its own);
        // walkers far off just walk in; they keep up with the van once near it
        const own = z.yell > 0 ? 0 : z.speed * (z.frenzyT > 0 ? SC.mult : 1);
        const keep = clamp((PERSP.keepUp - dist) / 400, 0, 1);
        let vx = (dx / dist) * own + fx * chase * keep + z.kx;
        let vy = (dy / dist) * own + fy * chase * keep + z.ky;
        for (let j = 0; j < this.zombies.length; j++) {
          if (i === j) continue;
          const o = this.zombies[j];
          const ox = z.x - o.x;
          const oy = z.y - o.y;
          const d2 = ox * ox + oy * oy;
          const min = z.r + o.r;
          if (d2 < min * min && d2 > 0.01) {
            const d = Math.sqrt(d2);
            vx += (ox / d) * 40;
            vy += (oy / d) * 40;
          }
        }
        z.x += vx * dt;
        z.y += vy * dt;
        z.vx = vx; // for the aim, which leads a walker
        z.vy = vy;
        z.kx *= 0.85;
        z.ky *= 0.85;
        z.hit = Math.max(0, z.hit - dt);
        z.cool = Math.max(0, z.cool - dt);
        // touching the van, in the van's own frame: seen in 3D a walker must stay outside the van, so one inside its
        // sides is put back out at the nearest side, where it presses against the van and hits it (a lanky's long
        // arms reach it from further off)
        let lx = (z.x - van.x) * rx + (z.y - van.y) * ry;
        let ly = (z.x - van.x) * fx + (z.y - van.y) * fy;
        const ax = van.w / 2 + z.r * 0.85;
        const ay = van.h / 2 + z.r * 0.85;
        if (Math.abs(lx) < ax && Math.abs(ly) < ay) {
          if (ax - Math.abs(lx) < ay - Math.abs(ly)) lx = (lx < 0 ? -1 : 1) * ax;
          else ly = (ly < 0 ? -1 : 1) * ay;
          z.x = van.x + rx * lx + fx * ly;
          z.y = van.y + ry * lx + fy * ly;
        }
        const touching = Math.abs(lx) < ax + 4 + z.reach && Math.abs(ly) < ay + 4 + z.reach;
        if (touching && z.cool <= 0 && !this.fade) {
          z.cool = 1.0;
          z.hp -= stats.ram;
          const push = stats.ramKnock * z.knock;
          const side = lx / Math.max(1, Math.abs(lx));
          z.kx = rx * side * push + fx * push * 0.8;
          z.ky = ry * side * push + fy * push * 0.8;
          // a hit like a bullet's: the flash, and the spray the way the van pushes it
          z.hit = 0.12;
          this.blood(z, z.x, z.y, z.kx, z.ky, z.hp <= 0);
          this.meet(z);
          if (z.hp <= 0) {
            this.killZombie(i, Math.atan2(z.ky, z.kx));
            this.burst("THUD!", van.x + fx * 60, van.y + fy * 60, "#e6dfcc", "#4b5057", 1.1);
            continue;
          }
          this.hurtVan(z.dmg, z.x, z.y);
          if (this.gameOverAt != null) return;
        }
        // its 3D figure: its heading, legs and pose, as on foot (js/perspective.js animate)
        ZSR.Persp.animate(this, z, dt, x0, y0, touching);
        const zs = this.toScreen(z.x, z.y);
        z.vis = zs.x >= 0 && zs.x <= this.W && zs.y >= 0 && zs.y <= this.H;
        if (z.vis) this.meet(z);
        // gone once well behind the camera, or far off to a side
        const q = ZSR.Persp.local(z.x, z.y);
        if (q.Y < -500 || Math.abs(q.X) > 4500) this.zombies.splice(i, 1);
      }
      // a screamer that sees the van close (on the screen, within SCREAM.spot tiles) screams, once a cooldown
      const spot = SC.spot * DIFF.pxPerTile;
      for (const z of this.zombies) if (z.scream && z.screamT <= 0 && z.vis && Math.hypot(van.x - z.x, van.y - z.y) < spot) this.scream(z);
      for (let i = this.crates.length - 1; i >= 0; i--) {
        const c = this.crates[i];
        c.t += dt;
        const lx = (c.x - van.x) * rx + (c.y - van.y) * ry;
        const ly = (c.x - van.x) * fx + (c.y - van.y) * fy;
        if (Math.abs(lx) < van.w / 2 + 14 && Math.abs(ly) < van.h / 2 + 14) {
          t.scrap += DIFF.crateScrap;
          this.burst("+" + DIFF.crateScrap + " SCRAP", c.x, c.y, "#0f1012", "#d9a21b", 0.9);
          this.sparks(c.x, c.y, "#e6dfcc");
          Audio().play("pickup");
          this.crates.splice(i, 1);
        }
      }
      for (let i = this.fallen.length - 1; i >= 0; i--) {
        const f = this.fallen[i];
        f.life -= dt;
        if (f.hit > 0) f.hit = Math.max(0, f.hit - dt); // (the angled camera's body flashes on from the killing hit)
        if (f.life <= 0) this.fallen.splice(i, 1);
      }
      this.updateParticles(dt);
      this.shake *= Math.pow(0.02, dt);
      this.updateHud();
    },

    /** The walker at i goes down: off the road's list (no longer hit or counted), over the way `dir` (world angle;
        away from the van when left out) as a fading body, its kill and scrap on the trip. */
    killZombie(i, dir) {
      const z = this.zombies[i];
      const t = State().trip;
      this.zombies.splice(i, 1);
      this.dust(z.x, z.y, z.r);
      const max = fallSecs();
      const rot = (dir == null ? z.angle + Math.PI : dir) + rand(-0.3, 0.3);
      const f = { kind: "fallen", type: z.type, seed: z.seed, x: z.x, y: z.y, size: z.r, rot, life: max, max };
      // its 3D body falls from its last step: its heading, legs, pose and the hit's flash
      ZSR.Persp.fallFrom(z, f);
      this.fallen.push(f);
      if (this.fallen.length > ROAD_FALLEN_MAX) this.fallen.shift();
      t.walkers += 1;
      t.scrap += z.scrap;
      Audio().play("poof");
    },
    /** A kind seen on the road counts as met (save.met, for the crew's tips), once per walker. */
    meet(z) {
      if (z.seen) return;
      z.seen = true;
      const S = State();
      if (S && typeof S.meetWalker === "function") S.meetWalker(z.type);
    },
    hurtVan(dmg, x, y) {
      const S = State();
      const t = S.trip;
      const v = this.van;
      if (!S.cheat("noDie")) t.vanHp -= Math.round(dmg * S.effects().vanDamage); // god mode: dents, no damage
      v.hurt = 1;
      if (S.settings.shake) this.shake = 10;
      this.burst("SLAM!", v.x + Math.cos(v.heading) * 70, v.y + Math.sin(v.heading) * 70, "#e6dfcc", "#b3261e", 1.1);
      this.sparks(x, y, "#9ea3aa");
      Audio().play("crunch");
      if (t.vanHp <= 0) {
        t.vanHp = 0;
        this.gameOverAt = 1.4;
        this.shake = 18;
        this.fade = null;
        for (let k = 0; k < 24; k++) {
          const a = Math.random() * 6.28;
          const s = rand(60, 260);
          this.particles.push({ x: v.x, y: v.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1.2, maxLife: 1.2, size: rand(6, 16), color: k % 2 ? "#4a473f" : "#d9a21b", grow: true });
        }
        this.burst("WRECKED!", v.x + Math.cos(v.heading) * 40, v.y + Math.sin(v.heading) * 40, "#b3261e", "#d9a21b", 1.8);
        Audio().play("gameover");
      }
    },
    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += (p.vx + (p.cx || 0)) * dt;
        p.y += (p.vy + (p.cy || 0)) * dt;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= dt;
        if (p.vz != null) {
          // a drop in the air (the angled camera): it falls and lands where it comes down (as on foot)
          p.vz -= ZSR.Persp.BLOOD_FALL * ZSR.Persp.TILE * dt;
          p.z += p.vz * dt;
          if (p.z <= 0) p.life = 0;
        }
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          // a drop of blood that lands leaves a splat on the road for a moment
          if (p.leaves && this.particles.length < ROAD_PARTICLE_CAP) this.particles.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 1.4, maxLife: 1.4, size: p.size * 1.5, color: p.color, blood: true, splat: true, rot: Math.atan2(p.vy, p.vx) });
        }
      }
      for (let i = this.bursts.length - 1; i >= 0; i--) {
        this.bursts[i].t += dt;
        if (this.bursts[i].t >= this.bursts[i].life) this.bursts.splice(i, 1);
      }
    },
    updateHud() {
      const S = State();
      const t = S.trip;
      const h = this.hud;
      const pct = clamp((t.vanHp / t.vanMaxHp) * 100, 0, 100);
      h.hpFill.style.width = pct + "%";
      h.hpFill.style.background = pct > 50 ? "#7a9a3c" : pct > 25 ? "#d9a21b" : "#b3261e";
      h.hpText.textContent = Math.max(0, Math.round(t.vanHp));
      h.scrap.textContent = S.save.scrap + t.scrap;
      h.miles.textContent = t.miles.toFixed(1);
      h.kills.textContent = t.walkers;
      const D = this.drive;
      const s = this.onMain ? this.van.s : D.decisions[Math.max(0, this.next - 1)].stop;
      h.segFill.style.width = clamp(((s - D.startS) / (D.endS - D.startS)) * 100, 0, 100) + "%";
    },

    /* ---------- Drawing ---------- */
    draw() {
      const ctx = this.ctx;
      const D = Draw();
      const P = ZSR.Persp;
      const van = this.van;
      if (!van || !this.drive) return;
      const t0 = performance.now();
      const W = this.W;
      const H = this.H;
      const k = textSize();
      const theme = this.mods.night ? { grass: "#3f3e2c", asphalt: "#2b2c30" } : this.mods.fog ? { grass: "#67654a" } : null;
      ctx.save();
      // a shake moves the whole view, the ground on the card too
      if (this.shake > 0.5) {
        this.shakeX = rand(-this.shake, this.shake);
        this.shakeY = rand(-this.shake, this.shake);
      }
      // the world through the angled camera (js/perspective.js: fog is its haze, thick and near), the names over it
      P.drawWorld(this, ctx, theme);
      P.drawNames(this, ctx, k);
      for (const b of this.bursts) {
        const p = this.toScreen(b.x, b.y);
        D.burst(ctx, Object.assign({}, b, { x: p.x, y: p.y }));
      }
      if (this.mods.night) {
        // the dark, but for the van's headlights and the gun's lamp; then a light that shines through it (the Water
        // Tower's antenna light, js/perspective-buildings.js)
        P.night(this, ctx);
        if (ZSR.PerspBuild && ZSR.PerspBuild.drawLights) ZSR.PerspBuild.drawLights(ctx);
      }
      ctx.restore();
      D.vignette(ctx, W, H);
      const signRects = this.drawSign(ctx, k);
      // walkers behind the sign drawn again on top of it, so it never hides one coming at the van
      if (signRects && this.gameOverAt == null) P.drawOverSign(this, ctx, signRects);
      let dim = 0;
      if (this.fade) {
        const f = this.fade;
        dim = clamp(f.phase === "out" ? f.t / DIFF.fadeOut : f.phase === "choose" ? 1 : 1 - f.t / DIFF.fadeIn, 0, 1);
        D.card(ctx, W, H, null, null, dim, k, 0); // the dark only: the page's wrong-turn panel says what went wrong
      }
      // the card has the screen to itself: the HUD's top row and the minimap fade out with the road (P and Esc still pause)
      this.hudFade(this.hud.top, 1 - dim);
      this.hudFade(this.hud.mini, (1 - dim) * this.miniAlpha());
      this.drawMinimap(k);
      this.shakeX = this.shakeY = 0;
      P.frameStats.ms = performance.now() - t0;
    },
    /** Is this decision's lane zone on the dirt part of a road (Frog Lane past its paving)? */
    onDirt(dec) {
      if (dec.onDirt != null) return dec.onDirt;
      const sf = dec.road && Streets().SURFACE[dec.road];
      const rd = sf && this.drive.roads.find((r) => r.key === dec.road);
      if (!rd) return (dec.onDirt = false);
      const p = Streets().at(this.drive.track, (dec.zoneStart + dec.stop) / 2);
      const dx = rd.x1 - rd.x0;
      const dy = rd.y1 - rd.y0;
      const f = ((p.x - rd.x0) * dx + (p.y - rd.y0) * dy) / (dx * dx + dy * dy || 1);
      return (dec.onDirt = f > sf.paved);
    },
    /** Opacity for a HUD element, set only when it changes; hidden (and so not clickable) once faded out. */
    hudFade(el, a) {
      if (!el) return;
      const op = String(Math.round(a * 100) / 100);
      if (el.style.opacity !== op) {
        el.style.opacity = op;
        el.style.visibility = a < 0.02 ? "hidden" : "";
      }
    },
    /** The minimap gives way (fades) while a place by the road that is really in view is under it, so the place it
        names can be seen: its lot and building in front of the camera, short of the haze (MINI_HAZE), their box on the
        screen over the map's. */
    miniAlpha() {
      const mb = this.hudRects().mini;
      let want = 1;
      if (mb && mb.width && this.onMain) {
        const P = ZSR.Persp;
        const B = ZSR.PerspBuild;
        const k = P.setup(this);
        for (const l of this.drive.lots) {
          const rec = B && B.rec ? B.rec(l) : null;
          // its middle (its building's, if it has one) in view and short of the haze
          const mx = rec ? rec.cx : l.qx;
          const my = rec ? rec.cy : l.qy;
          const Y = (mx - k.ox) * k.Fx + (my - k.oy) * k.Fy;
          if (Y < 0 || P.fadeAt(Y) < MINI_HAZE) continue;
          // the lot on the ground, and its building's box (as tall as it stands), each as its outline on the screen
          // (corners behind the camera left out): one over the map fades it
          const lot = [];
          for (const [x, y] of l.corners) lot.push(P.project(x, y, 0));
          const box = [];
          if (rec) {
            const b = rec.bounds;
            const f = rec.f;
            for (const X of [b[0], b[1]]) for (const V of [b[2], b[3]]) for (const z of [0, b[5]]) box.push(P.project(f.ox + f.Rx * X + f.Nx * V, f.oy + f.Ry * X + f.Ny * V, z));
          }
          if (hullHitsBox(lot, mb) || hullHitsBox(box, mb)) {
            want = 0.15;
            break;
          }
        }
      }
      // eased, so it does not flicker at the edge of a lot
      const now = this.time;
      const dt = clamp(now - (this.miniT == null ? now : this.miniT), 0, 0.1);
      this.miniT = now;
      this.miniA = this.miniA == null ? want : this.miniA + (want - this.miniA) * Math.min(1, dt * 6);
      return this.miniA;
    },

    /** The sign for the next decision: it comes down the road on the right and holds there until the stop line.
        Returns the screen boxes it covers (with its help note), or null. */
    drawSign(ctx, k) {
      const D = Draw();
      const St = Streets();
      const G = St.GEOM;
      const up = this.upcoming();
      let dec = null;
      let after = 0;
      if (up && this.van.s >= up.signAt) dec = up;
      else if (this.next > 0) {
        // just past a stop line, the last sign slides away (on a wrong road, s counts from that stop line)
        const prev = this.drive.decisions[this.next - 1];
        const past = this.onMain ? this.van.s - prev.stop : this.van.s;
        if (past >= 0 && past < 260) {
          dec = prev;
          after = past;
        }
      }
      if (!dec) return null;
      const sign = this.signFor(dec);
      // on the right of the road under the HUD (the minimap sits on the left, off the road)
      const rects = this.hudRects();
      const top = rects.row + 10;
      // how far down something from x to x + w may reach: the screen's edge, or the trip bar or touch buttons under it
      const floor = (x, w) => rects.low.reduce((f, b) => (x < b.right && x + w > b.left ? Math.min(f, b.top - 8) : f), this.H - 8);
      // the road's edges on the screen: the sign hangs right of where its right edge is beside it
      const E = this.roadEdges();
      const mb = rects.mini && rects.mini.width ? rects.mini : null;
      const overMini = (x, w, y, h) => mb && x < mb.right + 6 && x + w > mb.left - 6 && y < mb.bottom + 6 && y + h > mb.top - 6;
      // as big as the text size asks, a size smaller while it would run off the bottom or a word past its edge
      const k0 = Math.min(k, 1.8);
      let lay;
      let x;
      let y;
      let maxW;
      let band = 150 * k0; // the rows the sign covers, from the top (the road widens down the screen): as laid out
      for (let pass = 0; pass < 3; pass++) {
        const re = E.side(1, top, top + band);
        const left = (re == null ? this.W / 2 : re) + SIGN_GAP;
        maxW = this.W - left - 12;
        let x0 = left;
        if (maxW < 160) {
          // a narrow screen: across the top, under the minimap
          x0 = 8;
          maxW = this.W - 16;
        }
        for (let sk = k0; ; sk -= 0.1) {
          lay = D.layoutSign(ctx, sign, sk, maxW);
          x = Math.min(x0, this.W - lay.w - 12);
          y = overMini(x, lay.w, top, lay.h) ? mb.bottom + 10 : top;
          if ((lay.fits && y + lay.h + 6 * lay.k <= floor(x, lay.w)) || sk <= Math.max(0.75, k0 * 0.6)) break;
        }
        const need = y + lay.h + 6 * lay.k - top;
        if (need <= band + 1) break;
        band = need;
      }
      y = Math.max(8, Math.min(y, this.H - 8 - lay.h - 6 * lay.k)); // never off the screen, even on one that has no room
      // slide in from above as it comes into view, slide down and fade once passed
      const lead = (dec.zoneStart - dec.signAt) || 1;
      const into = clamp((this.van.s - dec.signAt) / Math.min(lead, 0.5 * this.speed), 0, 1);
      const yy = after ? y + after * this.zoom * 0.9 : y - (1 - smooth(into)) * (lay.h + y + 20);
      const alpha = after ? 1 - after / 260 : 1;
      D.roadSign(ctx, x, yy, sign, lay, alpha);
      const boxes = [{ x, y: yy, w: lay.w + 6 * lay.k, h: lay.h + 6 * lay.k }];
      // until the van has taken a way right, the sign carries a line on how lanes work: under it, or on the
      // grass left of the road (above or below the minimap), a size smaller where it would not fit
      if (!this.hintDone && !this.fade) {
        const text = St.text("hint");
        const nk0 = Math.min(k, 1.5);
        const nkMin = Math.max(0.8, nk0 * 0.7);
        const spots = [];
        const nw = Math.max(lay.w, Math.min(maxW, 300 * lay.k));
        const ux = Math.min(x, this.W - nw - 12);
        // (under the sign, down to where the road's right edge comes out past its left end)
        spots.push({ x: ux, y: y + lay.h + 8 * lay.k + 4, w: nw, to: Math.min(floor(ux, nw), E.row(1, ux - SIGN_GAP) - 4) });
        // on the grass left of the road: out to where its left edge is (oncoming lanes and all) beside the note
        const le = E.side(-1, top, top + 150 * nk0);
        const lw = (le == null ? this.W / 2 : le) - SIGN_GAP - 10;
        if (lw >= 160) {
          const besideMini = mb && mb.left < 10 + lw + 6 && mb.right > 4;
          const to = (y0) => Math.min(y0, E.row(-1, 10 + lw + SIGN_GAP) - 4);
          if (!besideMini) spots.push({ x: 10, y: top, w: lw, to: to(floor(10, lw)) });
          else {
            spots.push({ x: 10, y: mb.bottom + 10, w: lw, to: to(floor(10, lw)) });
            spots.push({ x: 10, y: top, w: lw, to: to(mb.top - 10) });
          }
        }
        // last, a small screen: along the bottom behind the van (left of the sign when the sign reaches down there)
        const vf = [Math.cos(this.van.heading), Math.sin(this.van.heading)];
        const rear = ZSR.Persp.project(this.van.x - (vf[0] * this.van.h) / 2, this.van.y - (vf[1] * this.van.h) / 2, 0);
        const behind = (rear ? rear.y : this.toScreen(this.van.x, this.van.y).y) + 12;
        const bw = y + lay.h + 6 * lay.k > behind ? x - 20 : Math.min(this.W - 20, 760);
        spots.push({ x: 10, y: behind, w: bw, to: floor(10, bw), up: true });
        let fit = null;
        for (let nk = nk0; !fit && nk >= nkMin - 1e-6; nk -= 0.1) {
          for (const sp of spots) {
            if (sp.w < 160) continue;
            const h = D.signNote(ctx, 0, 0, sp.w, text, nk, 1, false);
            if (sp.y + h <= sp.to) {
              fit = { sp, nk, y: sp.up ? sp.to - h : sp.y };
              break;
            }
          }
        }
        if (fit) {
          const sp = fit.sp;
          const ny = sp === spots[0] ? yy + lay.h + 8 * lay.k + 4 : fit.y; // under the sign it rides along with it
          boxes.push({ x: sp.x, y: ny, w: sp.w + 4, h: D.signNote(ctx, sp.x, ny, sp.w, text, fit.nk, alpha) + 4 });
        }
      }
      return boxes;
    },
    /** The road's outer edges on the screen (the sign and the lane hint keep off it), as the camera sees them: the
        van's road (the route's track, or the wrong road it took) from just behind the van out to the haze, shoulders
        and oncoming lanes included, each edge a line of screen points every EDGE_STEP. Past a stop line the van has
        not crossed it runs on straight (where the sign stands must not tell which way is right). side(+1 right | -1 left, ya,
        yb): how far out that edge comes across rows ya..yb (null when it is not on them); row(side, x): the highest row
        from which, down the screen, that edge is past x (out to the right of it for +1, to the left for -1; the
        screen's height when never). */
    roadEdges() {
      const St = Streets();
      const G = St.GEOM;
      const P = ZSR.Persp;
      const k = P.setup(this);
      const off = G.half + G.shoulder;
      const L = { 1: [], "-1": [] };
      const s1 = this.van.s + k.far;
      const dec = this.upcoming();
      const stop = dec ? dec.stop : this.track.len;
      const a0 = St.at(this.track, Math.min(stop, this.track.len));
      for (let s = Math.max(0, this.van.s - 200); s <= s1 + EDGE_STEP - 1e-6; s += EDGE_STEP) {
        const q = Math.min(s, s1);
        let a = a0;
        if (q < stop) a = St.at(this.track, q);
        else if (!dec) break;
        else a = { x: a0.x + a0.ux * (q - stop), y: a0.y + a0.uy * (q - stop), ux: a0.ux, uy: a0.uy };
        for (const sd of [1, -1]) {
          const p = P.project(a.x - a.uy * off * sd, a.y + a.ux * off * sd, 0);
          if (p) L[sd].push(p);
        }
      }
      const H = this.H;
      return {
        side(sd, ya, yb) {
          let best = null;
          const pts = L[sd];
          const take = (x) => (best = best == null ? x : sd > 0 ? Math.max(best, x) : Math.min(best, x));
          for (let i = 0; i + 1 < pts.length; i++) {
            const a = pts[i];
            const b = pts[i + 1];
            const lo = Math.max(ya, Math.min(a.y, b.y));
            const hi = Math.min(yb, Math.max(a.y, b.y));
            if (lo > hi) continue;
            const xAt = (y) => (b.y === a.y ? a.x : a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y));
            take(xAt(lo));
            take(xAt(hi));
          }
          return best;
        },
        row(sd, x) {
          let y = H;
          const pts = L[sd];
          const past = (p) => (sd > 0 ? p.x >= x : p.x <= x);
          for (let i = 0; i < pts.length; i++) {
            const a = pts[i];
            if (past(a)) y = Math.min(y, a.y);
            const b = pts[i + 1];
            if (b && past(a) !== past(b)) y = Math.min(y, a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x || 1e-9));
          }
          return y;
        },
      };
    },
    /** Where the HUD's top row and the minimap sit; measured again only when the screen or the text size changes.
        row: the bottom of the row's boxes (the signs and the minimap go under it); low: the boxes along the bottom. */
    hudRects() {
      const key = this.W + "x" + this.H + ":" + document.documentElement.getAttribute("data-size");
      if (this.rectKey !== key || !this.rects || !this.rects.mini || !this.rects.mini.width) {
        this.rectKey = key;
        const top = this.hud.top ? this.hud.top.getBoundingClientRect() : null;
        let row = 60;
        const boxes = []; // the top row's own boxes (the angled camera keeps its name boards out of them)
        if (top) {
          // the minimap hangs on the left just under the HUD's top row, off our lanes
          row = top.top;
          for (const el of this.hud.top.children) {
            const r = el.getBoundingClientRect();
            if (r.height) {
              row = Math.max(row, r.bottom);
              boxes.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
            }
          }
          this.hud.root.style.setProperty("--mini-top", Math.round(row + 10) + "px");
        }
        // ... and what sits along the bottom (the trip bar, the touch buttons), when they show
        const low = [];
        const lows = this.hud.root.querySelectorAll ? this.hud.root.querySelectorAll(".hud-bottom > *, #touch-controls > *") : [];
        for (const el of lows) {
          const r = el.getBoundingClientRect();
          if (r.height) low.push({ left: r.left, right: r.right, top: r.top });
        }
        this.rects = { top, row, low, boxes, mini: this.hud.mini ? this.hud.mini.getBoundingClientRect() : null };
      }
      return this.rects;
    },
    /** Minimap: heading-up, known roads and side streets, known places, the destination flagged, the van's true place. Never the route. */
    drawMinimap(k) {
      const c = this.hud.mini;
      const ctx = this.mini;
      if (!c || !ctx) return;
      const r = this.hudRects().mini;
      if (!r || !r.width) return;
      const dpr = this.dpr || 1;
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      const S = State();
      const St = Streets();
      const D = Draw();
      const Wd = World();
      const scale = this.drive.scale;
      const mx = this.van.x / scale;
      const my = this.van.y / scale;
      const th = this.van.heading;
      const zoom = w / 300; // px per map unit: about 300 map units across
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#e6dfcc";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h * 0.64;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);
      ctx.rotate(-Math.PI / 2 - th);
      ctx.translate(-mx, -my);
      const pos = {};
      Wd.LOCATIONS.concat(Wd.JUNCTIONS || []).forEach((l) => (pos[l.id] = l));
      // a road is known when both its ends are; the road the van is on and every road out of the next
      // junction are always shown and named (the junction's sign may name them), whichever is the route
      const here = this.onMain ? this.roadHere() : null;
      const nextJ = this.onMain ? this.drive.decisions.slice(this.next).find((d) => d.kind === "junction") : null;
      const jn = nextJ ? nextJ.node : null;
      const known = (a, b) => (S.isKnown(a) && S.isKnown(b)) || here === St.roadKey(a, b) || a === jn || b === jn;
      ctx.lineCap = "round";
      Wd.ROADS.forEach(([a, b]) => {
        const kn = known(a, b);
        ctx.strokeStyle = kn ? "#4b5057" : "rgba(75,80,87,0.22)";
        ctx.lineWidth = (kn ? 9 : 6) / zoom;
        ctx.beginPath();
        ctx.moveTo(pos[a].x, pos[a].y);
        ctx.lineTo(pos[b].x, pos[b].y);
        ctx.stroke();
      });
      // each place's own drive, a smaller road out of its corner to its building, as on the city map: a known
      // place's (and the one the van is on, and the next junction's, which its sign has a lane for), the rest faded
      this.drive.roads.forEach((rd) => {
        if (!rd.drive) return;
        const kn = S.isKnown(rd.a) || rd.a === this.origin || rd.a === this.opts.to || rd.a === jn;
        ctx.strokeStyle = kn ? "#4b5057" : "rgba(75,80,87,0.18)";
        ctx.lineWidth = (kn ? 6 : 4) / zoom;
        ctx.beginPath();
        ctx.moveTo(rd.x0 / scale, rd.y0 / scale);
        ctx.lineTo(rd.x1 / scale, rd.y1 / scale);
        ctx.stroke();
      });
      St.SIDE_STREETS.forEach((s) => {
        const [a, b] = s.road.split("|");
        const st = St.sideStub(s);
        const kn = known(a, b);
        ctx.strokeStyle = kn ? "#6b6f76" : "rgba(75,80,87,0.18)";
        ctx.lineWidth = (kn ? 5 : 4) / zoom;
        ctx.beginPath();
        ctx.moveTo(st.x0, st.y0);
        ctx.lineTo(st.x1, st.y1);
        ctx.stroke();
        if (kn) {
          // the end bar: these go nowhere
          const ux = (st.x1 - st.x0) / St.GEOM.sideLen;
          const uy = (st.y1 - st.y0) / St.GEOM.sideLen;
          ctx.strokeStyle = s.kind === "closed" ? "#d4621e" : "#0f1012";
          ctx.lineWidth = 3 / zoom;
          ctx.beginPath();
          ctx.moveTo(st.x1 - uy * 5, st.y1 + ux * 5);
          ctx.lineTo(st.x1 + uy * 5, st.y1 - ux * 5);
          ctx.stroke();
        }
      });
      ctx.restore();
      // labels and icons are drawn upright: transform points, not the text
      const a = -Math.PI / 2 - th;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const P = (x, y) => ({ x: cx + ((x - mx) * ca - (y - my) * sa) * zoom, y: cy + ((x - mx) * sa + (y - my) * ca) * zoom });
      const inside = (p, m) => p.x > m && p.x < w - m && p.y > m && p.y < h - m;
      const fs = Math.round(10 * k);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // street names along known roads, at the point nearest the van, kept upright and apart
      ctx.font = "700 " + fs + "px Oswald, Impact, sans-serif";
      const placed = []; // points along each label drawn so far
      const isOut = (ra, rb) => here !== St.roadKey(ra, rb) && (ra === jn || rb === jn);
      const order = Wd.ROADS.filter(([ra, rb]) => known(ra, rb)).sort((p, q) => (isOut(q[0], q[1]) ? 1 : 0) - (isOut(p[0], p[1]) ? 1 : 0));
      order.forEach(([ra, rb]) => {
        const A = pos[ra];
        const B = pos[rb];
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const l2 = dx * dx + dy * dy;
        const len = Math.sqrt(l2);
        // a road out of the next junction is named just past the junction (the sign may name it); others nearest the van
        const name = St.STREET_NAMES[ra + "|" + rb];
        const half = ctx.measureText(name).width / 2 + 3;
        const m0 = half / zoom + 8; // clear of the junction itself
        const tts = isOut(ra, rb) ? [0, 25, 55, 85].map((m) => clamp((ra === jn ? m0 + m : len - m0 - m) / len, 0.08, 0.92)) : [clamp(((mx - A.x) * dx + (my - A.y) * dy) / l2, 0.2, 0.8)];
        const p2 = P(B.x, B.y);
        const p1 = P(A.x, A.y);
        let ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        if (ang > Math.PI / 2) ang -= Math.PI;
        if (ang < -Math.PI / 2) ang += Math.PI;
        let p = null;
        let pts = null;
        for (const tt of tts) {
          const c = P(A.x + dx * tt, A.y + dy * tt);
          if (!inside(c, fs * 2)) continue;
          const lx = c.x + Math.sin(ang) * fs * 0.9; // where (0, -0.9 fs) lands once rotated by ang
          const ly = c.y - Math.cos(ang) * fs * 0.9;
          const mine = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map((f) => [lx + Math.cos(ang) * half * f, ly + Math.sin(ang) * half * f]);
          if (placed.some(([qx, qy]) => mine.some(([x, y]) => Math.hypot(qx - x, qy - y) < fs * 1.2))) continue;
          p = c;
          pts = mine;
          break;
        }
        if (!p) return;
        placed.push(...pts);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#e6dfcc";
        ctx.strokeText(name, 0, -fs * 0.9);
        ctx.fillStyle = "#0f1012";
        ctx.fillText(name, 0, -fs * 0.9);
        ctx.restore();
      });
      // known places: the city map's buildings, upright, at the end of each one's drive; the destination's flag
      // over its building (pinned to the edge when it is out of view)
      const endAt = {};
      this.drive.ends.forEach((e) => (endAt[e.id] = e));
      const ik = 0.38 * k; // icon scale: about 20 px across at normal text size
      Wd.LOCATIONS.forEach((l) => {
        if (!S.isKnown(l.id)) return;
        const e = endAt[l.id];
        const p = e ? P(e.park.x / scale, e.park.y / scale) : P(l.x, l.y);
        const isDest = l.id === this.opts.to;
        if (inside(p, -30 * ik) && ZSR.Map) {
          ctx.save();
          ctx.translate(p.x, p.y);
          if (l.type === "river") ctx.rotate(a); // the dock points out along its road, which turns with the map
          ZSR.Map.drawIcon(ctx, Object.assign({}, l, { x: 0, y: 0 }), false, false, {}, ik, true);
          ctx.restore();
        }
        if (!isDest) return;
        const q = { x: clamp(p.x, 14 * k, w - 14 * k), y: clamp(p.y, 16 * k, h - 10 * k) };
        const off = q.x !== p.x || q.y !== p.y;
        if (!off) {
          ctx.beginPath();
          ctx.arc(q.x, q.y - 12 * ik, 9 * k, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(179,38,30,0.25)";
          ctx.fill();
        }
        this.flag(ctx, q.x, off ? q.y : q.y - 12 * ik, k, off ? Math.atan2(p.y - q.y, p.x - q.x) : null);
      });
      // the van: an arrow at the true place, pointing the way it faces (up: the map turns with the van, not with the
      // camera, which lags it through a turn)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.moveTo(0, -9 * k);
      ctx.lineTo(7 * k, 7 * k);
      ctx.lineTo(0, 3.5 * k);
      ctx.lineTo(-7 * k, 7 * k);
      ctx.closePath();
      D.fillStroke(ctx, "#d9a21b", 2);
      ctx.restore();
      // north, on the rim
      const m = 11 * k;
      const vx = Math.sin(a);
      const vy = -Math.cos(a);
      const reach = Math.min(vx > 1e-3 ? (w - m - cx) / vx : vx < -1e-3 ? (m - cx) / vx : Infinity, vy > 1e-3 ? (h - m - cy) / vy : vy < -1e-3 ? (m - cy) / vy : Infinity);
      const nx = cx + vx * reach;
      const ny = cy + vy * reach;
      ctx.beginPath();
      ctx.arc(nx, ny, 8 * k, 0, Math.PI * 2);
      D.fillStroke(ctx, "#f3eee0", 2);
      ctx.fillStyle = "#0f1012";
      ctx.font = "700 " + Math.round(10 * k) + "px Oswald, Impact, sans-serif";
      ctx.fillText("N", nx, ny + 0.5);
    },
    /** The map road under the van right now (main track only), as a ROADS key. */
    roadHere() {
      const D = this.drive;
      let best = null;
      let bd = Infinity;
      for (let i = 0; i < D.path.length - 1; i++) {
        const a = D.nodes.find((n) => n.id === D.path[i]);
        const b = D.nodes.find((n) => n.id === D.path[i + 1]);
        const d = distSeg(this.van.x, this.van.y, a.x, a.y, b.x, b.y);
        if (d < bd) {
          bd = d;
          best = Streets().roadKey(a.id, b.id);
        }
      }
      return best;
    },
    flag(ctx, x, y, k, pointTo) {
      const D = Draw();
      ctx.save();
      ctx.translate(x, y);
      if (pointTo != null) {
        // an edge arrow toward the destination
        ctx.save();
        ctx.rotate(pointTo);
        ctx.beginPath();
        ctx.moveTo(12 * k, 0);
        ctx.lineTo(3 * k, -6 * k);
        ctx.lineTo(3 * k, 6 * k);
        ctx.closePath();
        D.fillStroke(ctx, "#b3261e", 1.5);
        ctx.restore();
      }
      ctx.strokeStyle = "#0f1012";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 6 * k);
      ctx.lineTo(0, -12 * k);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -12 * k);
      ctx.lineTo(11 * k, -8 * k);
      ctx.lineTo(0, -4 * k);
      ctx.closePath();
      D.fillStroke(ctx, "#b3261e", 1.5);
      ctx.restore();
    },

    /** The title screen's picture (js/main.js, its loop asks every frame) and the garage's preview of the van
        (js/base.js, once): the van in these upgrades on the angled road, two walkers coming, taking turns through
        every kind in the facts every SHOWCASE_SECS (the still preview, t 0: the first two). A still scene through the
        road's camera (js/perspective.js showcase), drawn again only when what it shows changes. */
    showcase(canvas, upgrades, t) {
      const ids = Object.keys(World().WALKER_TYPES);
      const turn = Math.floor((t || 0) / SHOWCASE_SECS);
      const kinds = [ids[turn % ids.length], ids[(turn + 1) % ids.length]];
      return ZSR.Persp.showcase(canvas, { upgrades, kinds, seed: turn });
    },

    DIFF,
    PERSP,
    DRIVE_STEP,
    ROAD_PARTICLE_CAP,
    ROAD_FALLEN_MAX,
    SPARK_ARMOR,
    fallSecs,
  };
  /** Does the outline round these screen points (their convex hull; null points left out) overlap box { left, top,
      right, bottom }? Separating axes: the box's two and each hull edge's normal. */
  function hullHitsBox(pts, b) {
    const P = pts.filter(Boolean).sort((p, q) => p.x - q.x || p.y - q.y);
    if (!P.length) return false;
    const cross = (o, a, c) => (a.x - o.x) * (c.y - o.y) - (a.y - o.y) * (c.x - o.x);
    const lo = [];
    const hi = [];
    for (const p of P) {
      while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
      lo.push(p);
    }
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop();
      hi.push(p);
    }
    const hull = lo.slice(0, -1).concat(hi.slice(0, -1));
    const H = hull.length ? hull : P;
    const corners = [[b.left, b.top], [b.right, b.top], [b.right, b.bottom], [b.left, b.bottom]];
    const apart = (nx, ny) => {
      let a0 = Infinity;
      let a1 = -Infinity;
      for (const p of H) {
        const d = p.x * nx + p.y * ny;
        a0 = Math.min(a0, d);
        a1 = Math.max(a1, d);
      }
      let b0 = Infinity;
      let b1 = -Infinity;
      for (const [x, y] of corners) {
        const d = x * nx + y * ny;
        b0 = Math.min(b0, d);
        b1 = Math.max(b1, d);
      }
      return a1 < b0 || b1 < a0;
    };
    if (apart(1, 0) || apart(0, 1)) return false;
    for (let i = 0; i < H.length && H.length > 1; i++) {
      const a = H[i];
      const c = H[(i + 1) % H.length];
      if (apart(c.y - a.y, a.x - c.x)) return false;
    }
    return true;
  }
  function distSeg(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / l2));
    return Math.hypot(px - x0 - dx * t, py - y0 - dy * t);
  }

  ZSR.Game = Game;
})(typeof globalThis !== "undefined" ? globalThis : this);
