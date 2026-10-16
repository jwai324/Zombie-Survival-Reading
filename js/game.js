/* The road: a top-down drive through the city along the route picked on the map.
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
   The camera follows the van with its heading up; a minimap tracks it but never shows the route.
   A test: on the drives in PERSP_ROUTES the camera looks down the road from behind and above the van instead
   (js/perspective.js draws the world, works the roof gun's aim and maps screen <-> world).
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
  const SPARK_ARMOR = "#c9cdd2"; // a bullet off a helmet or a vest
  /** How long a downed walker lasts: the 3D figures' fall (js/walker3d.js), or 2 s without them. */
  const fallSecs = () => (ZSR.Walker3D && ZSR.Walker3D.FALL_SECS > 0 ? ZSR.Walker3D.FALL_SECS : 2);
  const HIT_WORDS = ["BLAM!", "KRAK!", "THUD!"];
  // a test of the angled camera (js/perspective.js): only these drives use it; every other drive stays flat
  const PERSP_ROUTES = ["base>grocery"];
  // ... and on them: the van a little faster, its shots much faster (far down the road they look slow), walkers
  // coming a little more often (they are seen from further off, so take longer to arrive)
  // ...; the van parks parkShort short of the door (seen in 3D its nose would be in the wall)
  const PERSP = { pace: 1.25, shot: 1.6, spawns: 1.4, range: 2600, keepUp: 900, parkShort: 45 };
  const SIZE = { normal: 1, large: 1.3, huge: 2 };
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const normAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const smooth = (x) => x * x * (3 - 2 * x);
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
      const dpr = Math.min(2, root.devicePixelRatio || 1);
      this.dpr = dpr;
      this.W = root.innerWidth;
      this.H = root.innerHeight;
      this.canvas.width = Math.round(this.W * dpr);
      this.canvas.height = Math.round(this.H * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // the camera: the van sits low in the middle; small screens see a little more of the road
      this.zoomBase = clamp(Math.min(this.W / 1000, this.H / 640), 0.55, 1);
      this.zoom = this.zoomBase;
      this.anchorY = this.H * 0.72;
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
      this.persp = !!ZSR.Persp && PERSP_ROUTES.includes(path.join(">"));
      this.speed = DIFF.roadScroll * this.stats.speed * (this.persp ? PERSP.pace : 1);
      const secs = opts.seconds || clamp(dist * World().SETTINGS.tripSecondsPerUnit, World().SETTINGS.tripMinSeconds, World().SETTINGS.tripMaxSeconds);
      this.drive = St.buildDrive(path, { scale: St.scaleFor(dist, secs, this.speed), speed: this.speed });
      this.origin = path[0];
      this.van = { s: 0, d: 0, x: 0, y: 0, heading: 0, vd: 0, w: 66, h: 118, aim: -Math.PI / 2, hurt: 0, cooldown: 0, flash: 0 };
      this.cam = { x: 0, y: 0, th: 0, d: 110, rel: 0 };
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
      this.spawnTimer = 2.2;
      this.shake = 0;
      this.placeVan(0);
      this.cam.th = Math.atan2(this.vanP.uy, this.vanP.ux);
      this.cam.d = (Streets().ourLeft(2) + G.half) / 2;
      this.placeCam(1);
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
      cancelAnimationFrame(this.raf);
      this.hud.root.classList.add("hidden");
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
    /** Put the van at its (s, d) on the current track, or on its own path through a turn. */
    placeVan(dt) {
      const tn = this.turn;
      const p = tn ? Streets().at(tn.track, this.turnS()) : Streets().at(this.track, this.van.s);
      this.vanP = p;
      const v = this.van;
      const d = tn ? 0 : v.d;
      v.x = p.x - p.uy * d;
      v.y = p.y + p.ux * d;
      const lean = clamp(Math.atan2(v.vd, Math.max(60, this.curSpeed || this.speed)), -0.35, 0.35);
      const want = Math.atan2(p.uy, p.ux) + lean;
      v.heading = dt ? v.heading + normAngle(want - v.heading) * Math.min(1, dt * 12) : want;
    },
    /** How far along its turn path the van is: on the route its place (s) runs on underneath and maps onto the path. */
    turnS() {
      const tn = this.turn;
      return tn.main ? (this.van.s - tn.s0) * tn.k : this.van.s;
    },
    /** The camera rides the road at the van, heading up, centered on our side of it (through a turn: off the van's path, easing over). */
    placeCam(k) {
      const c = this.cam;
      const p = this.vanP;
      c.th += normAngle(Math.atan2(p.uy, p.ux) - c.th) * k;
      let off;
      if (this.turn) {
        const tn = this.turn;
        off = c.rel = tn.cam0 + (tn.cam1 - tn.cam0) * smooth(clamp(this.turnS() / Math.min(tn.track.len, 700), 0, 1));
      } else {
        const want = (this.laneRange()[0] - 33 + Streets().GEOM.half) / 2;
        c.d += (want - c.d) * Math.min(1, k * 0.6);
        off = c.d;
        c.rel = c.d - this.van.d;
      }
      c.x = p.x - p.uy * off;
      c.y = p.y + p.ux * off;
    },
    /** World -> screen (CSS px): the ground, through the angled camera on its test drive. */
    toScreen(x, y) {
      return this.persp ? ZSR.Persp.toScreen(this, x, y) : this.flatToScreen(x, y);
    },
    /** Screen -> world: the ground under that spot. */
    toWorld(sx, sy) {
      return this.persp ? ZSR.Persp.toWorld(this, sx, sy) : this.flatToWorld(sx, sy);
    },
    /** World -> screen on the flat, top-down camera. */
    flatToScreen(x, y) {
      const c = this.cam;
      const a = -Math.PI / 2 - c.th;
      const dx = x - c.x;
      const dy = y - c.y;
      return { x: this.W / 2 + (dx * Math.cos(a) - dy * Math.sin(a)) * this.zoom, y: this.anchorY + (dx * Math.sin(a) + dy * Math.cos(a)) * this.zoom };
    },
    /** Screen -> world on the flat, top-down camera. */
    flatToWorld(sx, sy) {
      const c = this.cam;
      const a = Math.PI / 2 + c.th;
      const dx = (sx - this.W / 2) / this.zoom;
      const dy = (sy - this.anchorY) / this.zoom;
      return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
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
    /** One walker from off the screen: from ahead or a shoulder; its kind from the road's mix unless `type` is given. */
    spawnZombie(type) {
      const G = Streets().GEOM;
      const side = Math.random() < DIFF.sideSpawnChance ? (Math.random() < 0.5 ? "left" : "right") : "top";
      let sx;
      let sy;
      if (side === "top") {
        const cx = this.W / 2 - (this.turn ? this.cam.rel : this.cam.d) * this.zoom;
        sx = rand(cx - (G.half + 30) * this.zoom, cx + (G.half + 30) * this.zoom);
        sy = -40;
      } else {
        sx = side === "left" ? -40 : this.W + 40;
        sy = rand(this.H * 0.05, this.H * 0.6);
      }
      // just off the screen; the angled camera sees far down the road, so there they come from far off and fade in
      const w = this.persp ? ZSR.Persp.spawn(this) : this.flatToWorld(sx, sy);
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
        born: this.time, // the angled camera fades a new one in (js/perspective.js walker)
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
      // the drops fly on with the walker (it keeps up with the van; on the angled camera only once near it, as it
      // does); what lands stays on the road
      const v = this.van;
      const keep = this.persp && v ? clamp((PERSP.keepUp - Math.hypot(v.x - z.x, v.y - z.y)) / 400, 0, 1) : 1;
      const cx = v ? Math.cos(v.heading) * (this.curSpeed || 0) * DIFF.chase * keep : 0;
      const cy = v ? Math.sin(v.heading) * (this.curSpeed || 0) * DIFF.chase * keep : 0;
      // the angled camera sees the spray in the air, as on foot (js/interior.js bleed): from the hit's height, and one
      // drop in three splashes back out to the sides toward the shot (the camera is behind the van: the rest fly out
      // behind the body, which hides them); it falls and lands (updateParticles)
      const P = this.persp ? ZSR.Persp : null;
      for (let i = 0; i < n; i++) {
        const back = P && i % 3 === 2;
        const a = back ? a0 + Math.PI + (i % 2 ? 1 : -1) * rand(0.8, 1.3) : a0 + rand(-0.5, 0.5) * (kill ? 1.6 : 1);
        const s = rand(60, 160) * (kill ? 1.2 : 1) * (back ? 0.6 : 1);
        const p = { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, cx, cy, life: 0.4, maxLife: 0.4, size: rand(3, 4.8), color: BLOOD[i % 2], blood: true, leaves: i % 2 === 0 };
        if (P) P.dropAt(p, z, h);
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
      if (!this.last) this.last = ts;
      const dt = Math.min(0.05, (ts - this.last) / 1000);
      this.last = ts;
      // Huge text needs room beside the road for its signs: pull the camera back a little
      this.zoom = this.zoomBase * (textSize() >= 2 ? 0.85 : 1);
      if (!this.paused) this.update(dt);
      this.draw();
    },

    /* ---------- Decisions ---------- */
    /** The van crossed a stop line: the lane it is in is the way it goes. */
    commit(dec) {
      const St = Streets();
      const lane = St.laneOf(this.van.d, dec.n);
      const opt = dec.options[dec.lanes[lane]];
      this.next += 1;
      if (opt.correct) this.hintDone = true;
      if (opt.correct && opt.kind === "through") return;
      // the van drives its own path from the lane it is in: one smooth arc, whichever lane (streets.js turnPath)
      const tp = St.turnPath(this.drive, dec, opt, this.van.d);
      const cam0 = this.cam.d - this.van.d; // the camera's offset from the van, kept as the turn begins
      if (opt.correct) {
        // a junction or the destination: the van's place on the route runs on underneath (signs, progress) and maps onto the path
        const s1 = dec.kind === "dest" ? this.drive.endS : tp.rejoin;
        const cam1 = dec.kind === "dest" ? 0 : (St.ourLeft(2) + St.GEOM.half) / 2 - tp.d1;
        this.turn = { track: tp.track, main: true, s0: dec.stop, s1, k: tp.track.len / Math.max(1, s1 - dec.stop), d1: tp.d1, cam0, cam1 };
        if (dec.kind === "dest") this.arrive = { t: 0, parked: false };
        return;
      }
      // the wrong way: drive into it for a moment, then fade and start over
      this.track = tp.track;
      this.onMain = false;
      this.van.s = Math.max(0, this.van.s - dec.stop);
      this.van.d = 0;
      this.turn = { track: tp.track, main: false, cam0, cam1: 0 };
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

      // drive: the van follows its track; it brakes into a parking spot or a dead end
      const end = this.track.len - (this.persp && this.arrive ? PERSP.parkShort : 0);
      const left = end - van.s;
      const brake = this.arrive || !this.onMain ? clamp(Math.sqrt(Math.max(0, left) / 260), 0, 1) : 1;
      this.curSpeed = this.speed * brake;
      // through a turn on the route, s runs at the rate that keeps the van's own speed on its path
      van.s = Math.min(end, van.s + (this.curSpeed * dt) / (this.turn && this.turn.main ? this.turn.k : 1));
      t.miles += DIFF.milesPerSecond * stats.speed * dt * brake;
      while (this.onMain && !this.arrive && this.next < this.drive.decisions.length && van.s >= this.drive.decisions[this.next].stop) this.commit(this.drive.decisions[this.next]);
      // a place at the end of its one road: past the last decision the road runs on to it, and the van parks there
      if (this.onMain && !this.arrive && !this.turn && this.next >= this.drive.decisions.length) this.arrive = { t: 0, parked: false };
      // lanes: the player slides, or the van drives its turn
      van.vd = 0;
      if (this.turn) {
        const tn = this.turn;
        if (tn.main && !this.arrive && van.s >= tn.s1) {
          // back on the route's road, in the lane the turn ended in
          van.d = tn.d1;
          this.cam.d = tn.cam1 + tn.d1;
          this.turn = null;
        }
      } else {
        let dir = 0;
        if (this.keys.left) dir -= 1;
        if (this.keys.right) dir += 1;
        const [lo, hi] = this.laneRange();
        const d0 = van.d;
        let nd = van.d + dir * stats.laneSpeed * dt;
        // a lane that ends (a bay after its stop line) eases the van back over instead of jumping it
        const ease = Math.max(stats.laneSpeed, 320) * dt;
        if (nd < lo) nd = Math.min(lo, Math.max(nd, d0) + ease);
        if (nd > hi) nd = Math.max(hi, Math.min(nd, d0) - ease);
        van.d = nd;
        van.vd = dt > 0 ? (van.d - d0) / dt : 0;
      }
      this.placeVan(dt);
      this.placeCam(Math.min(1, dt * 5));
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
      // gun: where its mount is in the world, the world angle it points, and that angle on the screen
      let gun;
      if (this.persp) gun = ZSR.Persp.aim(this, State().settings.aimAssist, stats.bulletSpeed * PERSP.shot);
      else {
        const vs = this.toScreen(van.x, van.y);
        const rot = van.heading - this.cam.th;
        // the mount sits h * 0.1 behind the van's middle (sprites.js van)
        const ty = van.h * 0.1 * this.zoom;
        const turret = { x: vs.x - Math.sin(rot) * ty, y: vs.y + Math.cos(rot) * ty };
        if (this.pointer.seen) van.aim = Math.atan2(this.pointer.y - turret.y, this.pointer.x - turret.x);
        const aim = State().settings.aimAssist ? this.assist(van.aim, turret) : van.aim;
        const tw = this.toWorld(turret.x, turret.y);
        gun = { x: tw.x, y: tw.y, angle: aim + this.cam.th + Math.PI / 2, screen: aim };
      }
      const firing = (this.pointer.down || this.keys.fire) && !this.fade;
      if (firing && van.cooldown <= 0) {
        van.cooldown = stats.fireInterval;
        const n = stats.bullets;
        // bullets carry the van's own speed, so on screen (which rides with the van) they fly straight at the pointer;
        // the camera has already moved this frame, so a new one starts a frame's carry back
        const cx = Math.cos(van.heading) * this.curSpeed;
        const cy = Math.sin(van.heading) * this.curSpeed;
        for (let i = 0; i < n; i++) {
          const a = gun.angle + (i - (n - 1) / 2) * ZSR.Upgrades.SPREAD;
          const bs = stats.bulletSpeed * (this.persp ? PERSP.shot : 1);
          const shot = { x: gun.x + Math.cos(a) * 24 - cx * dt, y: gun.y + Math.sin(a) * 24 - cy * dt, vx: Math.cos(a) * bs, vy: Math.sin(a) * bs, cx, cy, dmg: stats.damage };
          // the angled camera's shots have a height: they leave the barrels and drop toward what the pointer is on
          if (gun.dz != null) Object.assign(shot, { z: gun.z + gun.dz * 24, dz: gun.dz });
          this.bullets.push(shot);
        }
        van.flash = 0.07;
        Audio().play("shoot");
      }
      van.flash = Math.max(0, van.flash - dt);
      van.drawAim = gun.screen;
      van.aimW = gun.angle;
      van.aimDz = gun.dz || 0;

      // walkers keep coming down the destination's drive, until the van is nearly at the door
      if (!this.arrive || this.track.len - van.s > DIFF.quietAtDoor) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnZombie();
          this.spawnTimer = (this.diff.interval * rand(0.7, 1.3)) / (this.persp ? PERSP.spawns : 1);
        }
      }
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.x += (b.vx + b.cx) * dt;
        b.y += (b.vy + b.cy) * dt;
        if (b.dz) b.z = Math.max(6, b.z + b.dz * Math.hypot(b.vx, b.vy) * dt);
        if (Math.hypot(b.x - van.x, b.y - van.y) > (this.persp ? PERSP.range : 1300)) {
          this.bullets.splice(i, 1);
          continue;
        }
        // the angled camera: the shot's whole step this frame (fast shots would skip past an edge), and only
        // below the walker's head (a shot over it flies on)
        const stepX = (b.vx + b.cx) * dt;
        const stepY = (b.vy + b.cy) * dt;
        for (let j = 0; j < this.zombies.length; j++) {
          const z = this.zombies[j];
          let dx = z.x - b.x;
          let dy = z.y - b.y;
          if (this.persp) {
            // nearest point of this frame's step (from where it was, t 0, to where it is, t 1)
            const t = clamp((dx * stepX + dy * stepY) / (stepX * stepX + stepY * stepY || 1) + 1, 0, 1);
            dx -= stepX * (t - 1);
            dy -= stepY * (t - 1);
            if (b.z != null && b.z > ZSR.Persp.walkerH(z) + 8) continue;
          }
          if (dx * dx + dy * dy < (z.r + 6) * (z.r + 6)) {
            z.hp -= b.dmg;
            z.hit = 0.12;
            z.kx += b.vx * 0.08 * z.knock;
            z.ky += b.vy * 0.08 * z.knock;
            // where it hit: on the angled camera the nearest point of the shot's step (b is at the step's end, up to a
            // walker's width past it), at the shot's height; flat, where the shot is
            const hx = this.persp ? z.x - dx : b.x;
            const hy = this.persp ? z.y - dy : b.y;
            const hz = this.persp && b.z != null ? b.z : undefined;
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
      if (this.persp) ZSR.Persp.setup(this);
      const SC = World().SCREAM;
      for (let i = this.zombies.length - 1; i >= 0; i--) {
        const z = this.zombies[i];
        const x0 = z.x; // where it stood (the angled camera's legs go by the ground it covers)
        const y0 = z.y;
        z.frenzyT = Math.max(0, z.frenzyT - dt);
        z.yell = Math.max(0, z.yell - dt);
        z.screamT = Math.max(0, z.screamT - dt);
        const dx = van.x - z.x;
        const dy = van.y - z.y;
        const dist = Math.hypot(dx, dy) || 1;
        z.angle = Math.atan2(dy, dx);
        // its own way at the van: none while it screams, faster in a frenzy (keeping up with the van is not its own);
        // on the angled camera, walkers far off just walk in; they keep up with the van once near it
        const own = z.yell > 0 ? 0 : z.speed * (z.frenzyT > 0 ? SC.mult : 1);
        const keep = this.persp ? clamp((PERSP.keepUp - dist) / 400, 0, 1) : 1;
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
        z.vx = vx; // for the angled camera's aim, which leads a walker
        z.vy = vy;
        z.kx *= 0.85;
        z.ky *= 0.85;
        z.hit = Math.max(0, z.hit - dt);
        z.cool = Math.max(0, z.cool - dt);
        // touching the van: in the van's own frame, an ellipse around its body
        let lx = (z.x - van.x) * rx + (z.y - van.y) * ry;
        let ly = (z.x - van.x) * fx + (z.y - van.y) * fy;
        let touching;
        if (this.persp) {
          // seen in 3D a walker must stay outside the van: one inside its sides is put back out at the nearest
          // side, where it presses against the van and hits it (a lanky's long arms reach it from further off)
          const ax = van.w / 2 + z.r * 0.85;
          const ay = van.h / 2 + z.r * 0.85;
          if (Math.abs(lx) < ax && Math.abs(ly) < ay) {
            if (ax - Math.abs(lx) < ay - Math.abs(ly)) lx = (lx < 0 ? -1 : 1) * ax;
            else ly = (ly < 0 ? -1 : 1) * ay;
            z.x = van.x + rx * lx + fx * ly;
            z.y = van.y + ry * lx + fy * ly;
          }
          touching = Math.abs(lx) < ax + 4 + z.reach && Math.abs(ly) < ay + 4 + z.reach;
        } else {
          // (a lanky's long arms reach it from further off)
          const nx = lx / (van.w / 2 + z.r * 0.8 + z.reach);
          const ny = ly / (van.h / 2 + z.r * 0.8 + z.reach);
          touching = nx * nx + ny * ny < 1;
        }
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
        // the angled camera's 3D figure: its heading, legs and pose, as on foot (js/perspective.js animate)
        if (this.persp) ZSR.Persp.animate(this, z, dt, x0, y0, touching);
        const zs = this.toScreen(z.x, z.y);
        z.vis = zs.x >= 0 && zs.x <= this.W && zs.y >= 0 && zs.y <= this.H;
        if (z.vis) this.meet(z);
        if (this.persp) {
          // gone once well behind the camera, or far off to a side
          const q = ZSR.Persp.local(z.x, z.y);
          if (q.Y < -500 || Math.abs(q.X) > 4500) this.zombies.splice(i, 1);
        } else if (zs.y > this.H + 120 || zs.x < -220 || zs.x > this.W + 220 || zs.y < -900) this.zombies.splice(i, 1);
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

    /** Aim assist. With a pointer: only a walker right under it (a near miss), so the shot still goes where the player points.
        Keys only (no pointer yet): the walker closest to straight ahead. */
    assist(aim, from) {
      let best = null;
      if (this.pointer.seen) {
        let bestD = Infinity;
        for (const z of this.zombies) {
          const p = this.toScreen(z.x, z.y);
          const d = Math.hypot(p.x - this.pointer.x, p.y - this.pointer.y);
          if (d < z.r * this.zoom + 28 && d < bestD) {
            bestD = d;
            best = Math.atan2(p.y - from.y, p.x - from.x);
          }
        }
        return best == null ? aim : best;
      }
      let bestDiff = 0.42;
      for (const z of this.zombies) {
        const p = this.toScreen(z.x, z.y);
        const dx = p.x - from.x;
        const dy = p.y - from.y;
        if (dx * dx + dy * dy > 650 * 650) continue;
        const a = Math.atan2(dy, dx);
        const d = Math.abs(normAngle(a - aim));
        if (d < bestDiff) {
          bestDiff = d;
          best = a;
        }
      }
      return best == null ? aim : best;
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
      // the angled camera's 3D body falls from its last step: its heading, legs, pose and the hit's flash
      if (this.persp) ZSR.Persp.fallFrom(z, f);
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
      const van = this.van;
      if (!van || !this.drive) return;
      const W = this.W;
      const H = this.H;
      const k = textSize();
      const theme = this.mods.night ? { grass: "#3f3e2c", asphalt: "#2b2c30" } : this.mods.fog ? { grass: "#67654a" } : null;
      ctx.save();
      // a shake: the angled camera shakes its whole view (ground on the card too), the flat one the canvas
      const shook = this.shake > 0.5;
      if (shook && this.persp) {
        this.shakeX = rand(-this.shake, this.shake);
        this.shakeY = rand(-this.shake, this.shake);
      } else if (shook) ctx.translate(rand(-this.shake, this.shake), rand(-this.shake, this.shake));
      // the world: through the angled camera on its test drive (js/perspective.js), else flat from straight above
      if (this.persp) {
        ZSR.Persp.drawWorld(this, ctx, theme);
        ZSR.Persp.drawNames(this, ctx, k);
      } else {
        if (ZSR.PerspGL) ZSR.PerspGL.hide(this);
        this.drawFlat(ctx, theme, k);
      }
      for (const b of this.bursts) {
        const p = this.toScreen(b.x, b.y);
        D.burst(ctx, Object.assign({}, b, { x: p.x, y: p.y }));
      }
      const vs = this.toScreen(van.x, van.y);
      if (this.mods.fog) D.fog(ctx, W, H, this.dpr, vs.x, vs.y, 300 * this.zoom);
      if (this.mods.night) D.night(ctx, W, H, this.dpr, vs.x, vs.y, van.drawAim == null ? van.aim : van.drawAim);
      ctx.restore();
      D.vignette(ctx, W, H);
      const signRects = this.drawSign(ctx, k);
      if (signRects && this.gameOverAt == null) this.drawOverSign(ctx, signRects);
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
    },
    /** The world from straight above, heading up: ground, roads, lanes, lots, scenery, walkers, the van, the names. */
    drawFlat(ctx, theme, k) {
      const D = Draw();
      const St = Streets();
      const G = St.GEOM;
      const van = this.van;
      const W = this.W;
      const H = this.H;
      const viewR = Math.hypot(W, H) / this.zoom;
      const center = this.toWorld(W / 2, H / 2);
      const view = { x: center.x, y: center.y, r: viewR * 0.6 };
      ctx.save();
      ctx.translate(W / 2, this.anchorY);
      ctx.scale(this.zoom, this.zoom);
      ctx.rotate(this.viewTurn());
      ctx.translate(-this.cam.x, -this.cam.y);
      D.ground(ctx, view, theme);
      D.cityRoads(ctx, this.drive, G, theme, view);
      // lanes before each decision near the view (painted on dirt where the road has run out of paving)
      const dirtTheme = Object.assign({}, theme || {}, { asphalt: "#7a5c3e" });
      this.drive.decisions.forEach((d, i) => {
        if (i < this.next - 1) return;
        const a = St.at(this.drive.track, d.stop);
        if (Math.hypot(a.x - view.x, a.y - view.y) > view.r + (d.stop - d.zoneStart) + 400) return;
        ctx.save();
        ctx.transform(-a.uy, a.ux, -a.ux, -a.uy, a.x, a.y);
        D.laneZone(ctx, { len: d.stop - d.zoneStart, n: d.n, ourLeft: St.ourLeft(d.n), rels: d.lanes.map((w) => d.options[w].rel), ways: d.lanes }, G, this.onDirt(d) ? dirtTheme : theme);
        ctx.restore();
      });
      this.drive.lots.forEach((l) => {
        if (Math.hypot(l.qx - view.x, l.qy - view.y) < view.r + 800) D.lot(ctx, l, G, loc(l.node));
      });
      const drawFaced = (p, fn) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.face || 0);
        fn();
        ctx.restore();
      };
      const pr = view.r + 120;
      const onScreen = (p, m) => {
        const q = this.toScreen(p.x, p.y);
        return q.x > -m && q.x < W + m && q.y > -m && q.y < H + m;
      };
      for (const p of this.props) if (Math.abs(p.x - view.x) < pr && Math.abs(p.y - view.y) < pr && onScreen(p, 90)) drawFaced(p, () => D.prop(ctx, Object.assign({}, p, { x: 0, y: 0 })));
      this.drawCrowd(ctx, D, (c) => drawFaced(c, () => D.prop(ctx, { kind: "crate", x: 0, y: 0, t: c.t })));
      ctx.restore();
      // the van, upright on screen at its place on the road
      const vs = this.toScreen(van.x, van.y);
      const rot = van.heading - this.cam.th;
      if (this.gameOverAt == null || this.gameOverAt > 0.9) {
        ctx.save();
        ctx.translate(vs.x, vs.y);
        ctx.rotate(rot);
        D.van(ctx, 0, 0, { upgrades: State().save.upgrades, aim: (van.drawAim == null ? van.aim : van.drawAim) - rot, t: this.time, hurt: van.hurt, flash: van.flash, scale: this.zoom, moving: !(this.arrive && this.arrive.parked) });
        ctx.restore();
      }
      // names on the buildings, upright
      this.drive.lots.forEach((l) => {
        const v0 = G.half + G.shoulder + G.lotGap + 168;
        const nx = -l.uy * l.side;
        const ny = l.ux * l.side;
        const p = this.toScreen(l.qx + nx * v0, l.qy + ny * v0);
        if (p.x < -200 || p.x > W + 200 || p.y < -60 || p.y > H + 60) return;
        D.nameBoard(ctx, p.x, p.y, State().isKnown(l.node) ? this.placeName(l.node).toUpperCase() : "?", Math.max(this.zoom, k * 0.8), false);
      });
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
    /** The minimap gives way (fades) while a parking lot by the road is under it, so the place it names can be seen. */
    miniAlpha() {
      const mb = this.hudRects().mini;
      let want = 1;
      if (mb && mb.width && this.onMain) {
        for (const l of this.drive.lots) {
          // the lot, its building and its name board, as a box on the screen
          let x0 = Infinity;
          let y0 = Infinity;
          let x1 = -Infinity;
          let y1 = -Infinity;
          for (const [cx, cy] of l.corners) {
            const p = this.toScreen(cx, cy);
            x0 = Math.min(x0, p.x);
            y0 = Math.min(y0, p.y);
            x1 = Math.max(x1, p.x);
            y1 = Math.max(y1, p.y);
          }
          if (x1 > mb.left && x0 < mb.right && y1 > mb.top && y0 < mb.bottom) {
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
      const left = this.W / 2 + (G.half + G.shoulder + 14 - this.cam.d) * this.zoom;
      let maxW = this.W - left - 12;
      let x0 = left;
      if (maxW < 160) {
        // a narrow screen: across the top, under the minimap
        x0 = 8;
        maxW = this.W - 16;
      }
      const mb = rects.mini && rects.mini.width ? rects.mini : null;
      const overMini = (x, w, y, h) => mb && x < mb.right + 6 && x + w > mb.left - 6 && y < mb.bottom + 6 && y + h > mb.top - 6;
      // as big as the text size asks, a size smaller while it would run off the bottom or a word past its edge
      const k0 = Math.min(k, 1.8);
      let lay;
      let x;
      let y;
      for (let sk = k0; ; sk -= 0.1) {
        lay = D.layoutSign(ctx, sign, sk, maxW);
        x = Math.min(x0, this.W - lay.w - 12);
        y = overMini(x, lay.w, top, lay.h) ? mb.bottom + 10 : top;
        if ((lay.fits && y + lay.h + 6 * lay.k <= floor(x, lay.w)) || sk <= Math.max(0.75, k0 * 0.6)) break;
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
        spots.push({ x: ux, y: y + lay.h + 8 * lay.k + 4, w: nw, to: floor(ux, nw) });
        const lw = this.W / 2 - (G.half + G.shoulder + 14 + this.cam.d) * this.zoom - 20;
        if (lw >= 160) {
          const besideMini = mb && mb.left < 10 + lw + 6 && mb.right > 4;
          if (!besideMini) spots.push({ x: 10, y: top, w: lw, to: floor(10, lw) });
          else {
            spots.push({ x: 10, y: mb.bottom + 10, w: lw, to: floor(10, lw) });
            spots.push({ x: 10, y: top, w: lw, to: mb.top - 10 });
          }
        }
        // last, a small screen: along the bottom behind the van (left of the sign when the sign reaches down there)
        const behind = this.toScreen(this.van.x, this.van.y).y + 75 * this.zoom;
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
    /** The angle the road view turns the world by: the van's way is up the screen. */
    viewTurn() {
      return -Math.PI / 2 - this.cam.th;
    },
    /** The walkers, the downed, the crates, the rounds and the particles (world space), in layers. What lies on
        the road comes first, under every body: blood splats, the pools and shadows of the downed, each walker's
        shadow (or its frenzy's glow). Then the bodies (the downed, the crates, the walkers), the rounds, and what
        flies over them. crate(c) draws one crate. */
    drawCrowd(ctx, D, crate) {
      for (const p of this.particles) if (p.splat) D.particle(ctx, p);
      for (const f of this.fallen) D.zombieDown(ctx, f, "ground");
      for (const z of this.zombies) D.zombieShadow(ctx, z, this.time);
      for (const f of this.fallen) D.zombieDown(ctx, f, "body");
      for (const c of this.crates) crate(c);
      const turn = this.viewTurn();
      for (const z of this.zombies) D.zombie(ctx, z, this.time, true, turn);
      for (const b of this.bullets) D.bullet(ctx, b);
      for (const p of this.particles) if (!p.splat) D.particle(ctx, p);
    },
    /** Walkers behind the sign are drawn again on top of it, so the sign never hides one coming at the van
        (their bodies only: a shadow or a frenzy's glow over the sign would tint its words). */
    drawOverSign(ctx, rects) {
      if (this.persp) return ZSR.Persp.drawOverSign(this, ctx, rects);
      const D = Draw();
      const hit = this.zombies.filter((z) => {
        const p = this.toScreen(z.x, z.y);
        const m = (D.zombieExtent ? D.zombieExtent(z) : z.r * 1.6) * this.zoom + z.reach * this.zoom;
        return rects.some((r) => p.x > r.x - m && p.x < r.x + r.w + m && p.y > r.y - m && p.y < r.y + r.h + m);
      });
      if (!hit.length) return;
      ctx.save();
      ctx.beginPath();
      rects.forEach((r) => ctx.rect(r.x, r.y, r.w, r.h));
      ctx.clip();
      ctx.translate(this.W / 2, this.anchorY);
      ctx.scale(this.zoom, this.zoom);
      ctx.rotate(this.viewTurn());
      ctx.translate(-this.cam.x, -this.cam.y);
      for (const z of hit) D.zombie(ctx, z, this.time, true, this.viewTurn());
      ctx.restore();
    },

    /** Where the HUD's top row and the minimap sit; measured again only when the screen or the text size changes.
        row: the bottom of the row's boxes (the signs and the minimap go under it); low: the boxes along the bottom. */
    hudRects() {
      const key = this.W + "x" + this.H + ":" + document.documentElement.getAttribute("data-size");
      if (this.rectKey !== key || !this.rects || !this.rects.mini || !this.rects.mini.width) {
        this.rectKey = key;
        const top = this.hud.top ? this.hud.top.getBoundingClientRect() : null;
        let row = 60;
        if (top) {
          // the minimap hangs on the left just under the HUD's top row, off our lanes
          row = top.top;
          for (const el of this.hud.top.children) {
            const r = el.getBoundingClientRect();
            if (r.height) row = Math.max(row, r.bottom);
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
        this.rects = { top, row, low, mini: this.hud.mini ? this.hud.mini.getBoundingClientRect() : null };
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
      // the van: an arrow at the true place, pointing the way it faces
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.van.heading - this.cam.th);
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

    showcase(canvas, upgrades, t) {
      const ctx = canvas.getContext("2d");
      const W = canvas.width;
      const H = canvas.height;
      const D = Draw();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const roadW = Math.min(W * 0.6, 220);
      D.road(ctx, W, H, (W - roadW) / 2, roadW, (t || 0) * 160, null);
      D.prop(ctx, { kind: "wreck", x: W * 0.12, y: H * 0.85, rot: 0.5, color: "#3f4a55" });
      D.prop(ctx, { kind: "tree", x: W * 0.88, y: H * 0.15, size: 26, seed: 5 });
      // two walkers, taking turns through every kind in the facts every SHOWCASE_SECS (the still preview: the first two)
      const T = World().WALKER_TYPES;
      const ids = Object.keys(T);
      const turn = Math.floor((t || 0) / SHOWCASE_SECS);
      const into = (t || 0) - turn * SHOWCASE_SECS;
      [
        { x: W * 0.16, y: H * 0.3 + Math.sin((t || 0) * 2) * 6, angle: 0.3, phase: 0 },
        { x: W * 0.86, y: H * 0.58, angle: Math.PI - 0.4, phase: 2 },
      ].forEach((spot, k) => {
        const type = ids[(turn + k) % ids.length];
        // a screamer screams for a moment of its turn
        const yell = T[type].scream && into > 1.2 && into < 1.2 + World().SCREAM.yell ? 1.2 + World().SCREAM.yell - into : 0;
        D.zombie(ctx, Object.assign({ type, seed: turn + k, r: T[type].road.r * 0.9, hp: 1, maxHp: 1, hit: 0, yell, frenzyT: 0 }, spot), t || 0);
      });
      D.van(ctx, W / 2, H * 0.55, { upgrades, aim: -Math.PI / 2 + Math.sin((t || 0) * 1.3) * 0.5, t: t || 0, scale: Math.min(1, H / 150) });
      D.vignette(ctx, W, H);
    },

    DIFF,
    ROAD_PARTICLE_CAP,
    ROAD_FALLEN_MAX,
    SPARK_ARMOR,
    fallSecs,
  };
  function distSeg(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / l2));
    return Math.hypot(px - x0 - dx * t, py - y0 - dy * t);
  }

  ZSR.Game = Game;
})(typeof globalThis !== "undefined" ? globalThis : this);
