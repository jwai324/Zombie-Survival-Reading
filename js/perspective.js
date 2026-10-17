/* The road camera: a view down the road from behind and above the van, every drive (js/game.js; the old flat,
   top-down road camera is gone, owner 2026-10-17).
   The ground (grass and its overgrowth, roads, lanes, lots, junk lying flat) is the road's own top-down art. With
   WebGL it is laid down by the graphics card in squares drawn once (js/perspective-gl.js); without, it is drawn
   into a few layers each frame and warped onto the 2D canvas strip by strip (Mode-7 style). Everything standing
   (trees, bushes and tall grass, wrecked cars, barriers, barrels, signs, crates, buildings, walkers, the van) is
   drawn on the 2D canvas over it, far to near, at its projected spot (js/perspective-art.js has their pictures;
   js/perspective-buildings.js each place's own building, River Landing's dock and the side streets' ends, which
   the ground then leaves out). The road sign, the name boards, the HUD and the minimap stay flat.
   The camera is pitched down cfg.pitch degrees; the van sits at cfg.vanAt of the screen's height, drawn
   cfg.scale times the road's zoom; ground past cfg.far fades into haze. In fog the haze is thick and near (FOG: the
   view sees FOG.far, everything standing fading into it from FOG.near); at night it is near black, and everything is
   dark but what the van lights (night: its headlights' beam down its own heading, NIGHT_BEAM, and the gun's lamp).
   The title screen and the garage's preview are a still scene through this camera (showcase).
   Walkers are the interiors' live 3D figures (js/walker3d.js Walker3D.draw), seen from the camera's own height, each
   in its own pooled canvas redrawn when it looks different under the interiors' governor rows; they move and pose as
   on foot (animate: a heading turning at its look's rate, legs by the ground covered, scream, claw, the hit flash,
   each kind's own fall), with the road's shadow or frenzy glow on the ground, health bars and blood in the air.
   They come in from far down the road and
   out of the overgrowth at the sides (spawn), small at first. The van is a box in the yard van's own faces
   (Draw3.texture), the top-down art on its roof and a roof gun standing on it. A shot leaves the barrels and drops
   to chest height (AIM_Z) where the pointer is, so on the screen it flies at the pointer. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
    return "rgb(" + f(n >> 16) + "," + f((n >> 8) & 255) + "," + f(n & 255) + ")";
  }
  const VAN_Z = 50; // the van's roof
  const GUN_Z = VAN_Z + 9; // the roof gun's barrels
  const AIM_Z = 26; // what a shot drops to where the pointer is: a walker's chest
  // aimed at a walker, Spread Shot's outer barrels cross it this share of its radius off its middle (aim)
  const SPREAD_HIT = 0.6;
  // where walkers come from when the road gives no row (js/game.js ROAD_DANGER has the drive's): see spawn
  const SPAWN = { far: 0.55, farY: [0.5, 0.8], farX: 700, sideY: [700, 2200], sideX: [600, 1400] };
  // SCALE: seconds a new walker takes to come out of the weeds (walkers spawn at the edge of the view, cfg.far)
  const FADE_IN = 0.5;
  const TEX_RES = 3; // the van's faces, drawn sharper than the yard's
  // SCALE: px a world unit: nearer the camera than this, nothing is drawn (the van is about 2); a lower camera or a
  // bigger cfg.scale brings things nearer to it
  const NEAR_PX = 6;
  // SCALE: the overgrowth is made and filed in squares this big (js/perspective-art.js vegLayout), so a frame looks
  // only at those under the view and a square is made the first time the view reaches it (a longer drive or a bigger
  // city has more squares, not more plants a frame); one the view has left for VEG_IDLE frames is let go (made again,
  // the same, if the view comes back)
  const VEG_CELL = 512;
  const VEG_IDLE = 240;
  // SCALE: the road's props (game.js buildScenery: along every road in the city) are filed in squares this big, so a
  // frame, and a ground square being drawn, looks only at those under it, not at all of the city's
  const PROP_CELL = 512;
  // A far prop is drawn simpler (a wreck its body and cabin, no wheels, rust or windows; a barrier or a sign flat
  // faces, no pictures): from LOD_AT of the way into the haze band (far * 0.55 on), its detail fading out over LOD_BAND
  // units, so nothing pops; the scenery governor's `lod` brings it in to where the haze starts
  const LOD_AT = 0.35;
  const LOD_BAND = 300;
  /* The scenery governor: on a machine that cannot keep up, the angled drive's scenery thins (never the flat camera,
     owner 2026-10-16). It reads the whole frame's real interval (game.js frame: g.rafMs, requestAnimationFrame's own
     time between frames, so the canvas's raster and the compositor count, not just this code's time), smoothed, against
     SCENERY_BUDGET_MS: a row down after SCENERY_SLOW_SECS over it, a row up after SCENERY_UP_SECS under SCENERY_FAST of
     it (the wait to climb back to a row it had to leave doubling each time, up to SCENERY_BACKOFF x). Its own rows, its
     own clock: separate from the walkers' governor (liveGovern: the walkers' renders against LIVE_BUDGET_MS) and from
     pace (the 2D ground's layers). It never moves the walkers' rows, and after either governor changes a row its
     clocks start over (SCENERY_HOLD_SECS), so a walker row's change is never read as the scenery's cost: walkers come
     first, scenery yields. Each row's numbers are eased to over a second or two, so plants fade out and back, nothing
     pops. Its row, and the smoothed interval, are in frameStats (scenery, gapMs).
     SCALE: one budget, in ms of frame interval: 25 is 40 fps (a 60 Hz screen that misses frames shows 33 ms). A bigger
     city keeps the same budget: its squares and props are filed, so the cost a frame stays what the view holds */
  const SCENERY_BUDGET_MS = 25;
  const SCENERY_FAST = 0.75;
  const SCENERY_SLOW_SECS = 2;
  const SCENERY_UP_SECS = 8;
  const SCENERY_BACKOFF = 8;
  const SCENERY_WARM_SECS = 1.5; // a drive's first seconds say nothing (its ground squares and pictures being made)
  const SCENERY_HOLD_SECS = 2;
  const SCENERY_GAP_MAX = 250; // ms: a longer gap (a tab in the background, a pause in the debugger) is not a frame
  // SCALE: the governor's rows, richest first; each a whole setting: smooth (the pictures' imageSmoothingQuality:
  // 'low' skips the mipmaps, much cheaper on a canvas drawn by the CPU), minPx (plants shorter than this on the
  // screen fade out, CSS px), thin (this share of the far grass and bushes, past THIN_FROM of the view, fades out, by
  // each plant's own stable hash), lod (far props simple from the haze band's start), shadows (plant shadows)
  const SCENERY_LEVELS = [
    { smooth: "medium", minPx: 0, thin: 0, lod: 0, shadows: 1 },
    { smooth: "low", minPx: 12, thin: 0, lod: 0, shadows: 1 },
    { smooth: "low", minPx: 16, thin: 0, lod: 1, shadows: 0 },
    { smooth: "low", minPx: 16, thin: 0.5, lod: 1, shadows: 0 },
    { smooth: "low", minPx: 22, thin: 0.75, lod: 1, shadows: 0 },
  ];
  const SCENERY_EASE = { minPx: 8, thin: 0.3, lod: 0.6, shadows: 0.8 }; // how fast each eases to its row's, a second
  const THIN_FROM = 0.4; // thinning starts this share of cfg.far ahead, all of it by THIN_FROM + 0.15
  const THIN_EDGE = 0.08; // a thinned plant fades over this much of its hash
  // The walkers are the interiors' live 3D figures (js/walker3d.js), drawn the way js/interior.js draws them: each into
  // its own pooled canvas when it looks different, under the interiors' governor rows (ZSR.Interior.LIVE_LEVELS).
  // SCALE: road units a Walker3D tile. On-foot proportions against the van: on foot a walker stands 0.92 tiles to the
  // yard van's 0.8, so with the road van's roof at VAN_Z a tile is 62.5 units (a walker 57.5 tall, its head 52)
  const TILE = 62.5;
  const LEAN = 0.5; // a walker leans half the camera's upright lines (as the plants do): all of it looks like falling over
  // SCALE: ms a frame the walkers' renders may take (smoothed) before their governor steps a row down (the pictures'
  // own cost; the ground's softening, pace, watches the ground's)
  const LIVE_BUDGET_MS = 4;
  const BLOOD_FALL = 5; // tiles/s/s: a drop of blood falls as it does on foot (js/interior.js updateBlood)
  const BLOOD_HIGH = [0.55, 0.75]; // the share of its height a spray starts at when the hit has none: the chest, as on foot
  const CLAW_HOLD = 0.6; // a walker that just hit the van (its 1 s cooldown above this) still claws at it
  // a walker covering ground faster than its kind walks on foot (WORLD.WALKER_TYPES speed, tiles/s) runs (Walker3D
  // st.run): from RUN_FROM times that speed, all the way at RUN_FROM + RUN_SPAN times (beside the van it covers about
  // 2.6 times a plain walker's, 4.5 at Engine Tune 5)
  const RUN_FROM = 1;
  const RUN_SPAN = 2;
  const SHADOW = "rgba(0,0,0,0.32)"; // a walker's shadow on the road (Walker3D's own contact shadow's)
  const FRENZY_GORE = "rgba(170,24,12,0.42)"; // ... and sped up by a scream, its glow (main's road: js/sprites.js shadowAt)
  const FRENZY_CLEAN = "rgba(214,120,30,0.4)"; // (amber with gore off)
  // at night a walker darkens toward black from NIGHT_FROM of the way to the haze (fog up to NIGHT_FOG, its eyes
  // keep their glow), and only the last NIGHT_EDGE fades out
  const NIGHT_FROM = 0.1;
  const NIGHT_FOG = 0.85;
  const NIGHT_EDGE = 0.12;
  // Fog (game.js mods.fog): the haze comes in close and thick. The view sees FOG.far ahead (the ground and everything
  // standing gone into it there: walkers further out are hidden, buildings fade into it by colour), clear to FOG.near
  // ahead of the camera's spot and thickening between. Where walkers come from does not change (spawn reads cfg.far):
  // in fog they are only seen later. The old flat road's fog was a clear circle about 300 units round the van.
  const FOG = { near: 60, far: 760 };
  // Night (game.js mods.night): the dark over everything (NIGHT_DARK), but for what the van lights, laid on the ground
  // and seen through the camera, so it turns with the van: a glow round it (glow, units), its headlights' beam down its
  // own heading (from beamFrom ahead of its middle, half beamHalf wide there, opening beamOpen a unit; bright to beamFull
  // of its reach, gone at reach) and the roof gun's lamp along its aim (lamp units, lampHalf rad each side). The owner
  // asked for a beam "in between" the old flat road's (about 520 ahead) and the angled drive's first one (to the haze,
  // 3600): reach is about halfway.
  const NIGHT_BEAM = { reach: 2050, beamFrom: 40, beamHalf: 26, beamOpen: 0.34, beamFull: 0.3, glow: 170, glow0: 30, lamp: 360, lampHalf: 0.22 };
  // (the old overlay filled its layer at 0.88 every frame without clearing it, so outside the lights it built up to
  // black within a few frames: the night as it has always looked is this, fully dark there)
  const NIGHT_DARK = "rgb(8,10,20)";
  // the title screen's still scene (showcase): the camera's zoom for a 200 px tall picture, where the van sits up it,
  // and where its walkers stand ([X right of the road's middle, Y ahead of the van])
  const SHOW = { zoom: 0.5, vanAt: 0.76, walkers: [[-125, 215], [245, 285]] };
  // without js/interior.js (a test that leaves it out): no governor, every walker every frame at full detail
  const NO_GOVERNOR = { LIVE_LEVELS: [{ near: Infinity, farLod: 0, far: 1, max: Infinity, maxPx: Infinity, scale: 1, lodPx: [0, 0] }], LIVE_START: 0, LIVE_STEP: 1, LIVE_SPARE: 0, LIVE_IDLE: 0, LIVE_SHRINK: Infinity, NEAR_STICK: 1 };
  const normA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  /** How long ago a downed walker (game.js fallen: life counts down from max) went down, in seconds. */
  const fallAge = (f) => {
    const M = ZSR.Walker3D;
    const max = f.max > 0 ? f.max : (M && M.FALL_SECS) || 2;
    return Math.max(0, max - (+f.life || 0));
  };

  const Persp = {
    // SCALE: far is how far ahead the view sees (world units): the ground squares (js/perspective-gl.js GRIDS, keepFor),
    // the plants (made a square at a time wherever the view reaches: out to far, no other limit), props and walkers
    // drawn a frame, where walkers come from and PERSP.range / keepUp in js/game.js all grow with it
    cfg: { pitch: 30, fov: 60, vanAt: 0.8, scale: 1.55, far: 3600 },
    GUN_Z,
    AIM_Z,
    TILE,
    BLOOD_FALL,
    SCENERY_ROWS: SCENERY_LEVELS.length, // (the god-mode FPS meter shows the row of how many)
    FOG,
    NIGHT_BEAM,
    // the walkers' last frame (tests and perf probes): figures drawn, Walker3D renders, ms the walkers took, governor row
    walkerStats: { drawn: 0, renders: 0, ms: 0, level: 0 },
    res: 1, // ground layer resolution: eased down while frames run slow, back up when they don't
    canvases: [],
    // this frame's cost, for a test page to show: the whole road draw (ms, set by game.js draw), the ground in it (on
    // the card or warped), the world standing on it, the walkers' share of that (their renders and pictures, as
    // walkerStats.ms) and the ground squares drawn (on the card); the plants and props drawn, the squares of plants
    // kept and made this frame; the scenery governor's row and the frame interval it reads (smoothed, ms; 0 before
    // the first)
    frameStats: { ms: 0, groundMs: 0, worldMs: 0, walkersMs: 0, squaresMade: 0, plants: 0, props: 0, vegSquares: 0, vegMade: 0, scenery: 0, gapMs: 0 },

    // SCALE: the narrowest the view may be across, as the width-to-height share that sees that far at cfg.fov (1.6:
    // a 1280 x 800 window sees 43 degrees to each side): a narrower window (half a screen, 960 x 1040) sees as far to
    // the sides with a taller view, so the road after a sharp corner stays on it, up to maxFov (degrees, top to bottom:
    // a phone held upright); wider windows are as cfg.fov gives
    minAspect: 1.25,
    maxFov: 90,
    /** Half the camera's height of view on a W x H screen, as its tangent: cfg.fov's, or more on a narrow screen. */
    viewTan(W, H) {
      const t = Math.tan((this.cfg.fov * Math.PI) / 360);
      return Math.max(t, Math.min(Math.tan((this.maxFov * Math.PI) / 360), (t * this.minAspect * H) / Math.max(1, W)));
    },

    /** The camera for this frame: where it sits, behind the road camera's spot, and how it projects; how far it sees
        (far: cfg.far, or FOG.far in fog) and where the haze starts on the ground (fogG) and on what stands (fog0).
        g.vanAt, when set, puts the van elsewhere up the screen (the title screen's still scene). */
    setup(g) {
      const c = this.cfg;
      const th = (c.pitch * Math.PI) / 180;
      const sn = Math.sin(th);
      const cs = Math.cos(th);
      const f = g.H / 2 / this.viewTan(g.W, g.H);
      const v0 = (g.H / 2 - g.H * (g.vanAt || c.vanAt)) / f;
      const bh = (cs + v0 * sn) / (sn - v0 * cs); // how far behind, per unit of height, puts the van at vanAt
      const h = f / (c.scale * g.zoom * (bh * cs + sn));
      const a = g.cam.th;
      const fog = !!(g.mods && g.mods.fog);
      const far = fog ? Math.min(c.far, FOG.far) : c.far;
      // a shake (the van hit) moves the whole view, ground and all
      this.k = { sn, cs, f, cx: g.W / 2 + (g.shakeX || 0), cy: g.H / 2 + (g.shakeY || 0), h, b: bh * h, ox: g.cam.x, oy: g.cam.y, Fx: Math.cos(a), Fy: Math.sin(a), Rx: -Math.sin(a), Ry: Math.cos(a), W: g.W, H: g.H, far, fog, fog0: fog ? FOG.near : far * 0.55, fogG: fog ? FOG.near : far * 0.45 };
      return this.k;
    },
    /** World (x, y, height) -> screen, with s the px per world unit there and Y how far ahead; null behind the camera. */
    project(x, y, z) {
      const k = this.k;
      const dx = x - k.ox;
      const dy = y - k.oy;
      const X = dx * k.Rx + dy * k.Ry;
      const Yb = dx * k.Fx + dy * k.Fy + k.b;
      const dz = k.h - (z || 0);
      const d = Yb * k.cs + dz * k.sn;
      if (d < 5) return null;
      return { x: k.cx + (k.f * X) / d, y: k.cy - (k.f * (Yb * k.sn - dz * k.cs)) / d, s: k.f / d, d, Y: Yb - k.b };
    },
    /** How far ahead the flat at height z seen at screen row sy is (Infinity at or above its horizon). */
    groundY(sy, z) {
      const k = this.k;
      const h = k.h - (z || 0);
      const v = (k.cy - sy) / k.f;
      const den = k.sn - v * k.cs;
      return den <= 1e-6 ? Infinity : (h * (k.cs + v * k.sn)) / den - k.b;
    },
    depthAt(Y, z) {
      const k = this.k;
      return (Y + k.b) * k.cs + (k.h - (z || 0)) * k.sn;
    },
    /** Screen -> the point under it on the flat at height z (the ground when z is left out), no farther than the haze. */
    unproject(sx, sy, z) {
      const k = this.k;
      const Y = Math.min(this.groundY(sy, z), k.far);
      const X = ((sx - k.cx) * this.depthAt(Y, z)) / k.f;
      return { x: k.ox + k.Rx * X + k.Fx * Y, y: k.oy + k.Ry * X + k.Fy * Y };
    },
    /** The road's toScreen / toWorld on this camera (the ground). */
    toScreen(g, x, y) {
      this.setup(g);
      const p = this.project(x, y, 0);
      return p ? { x: p.x, y: p.y } : { x: g.W / 2, y: g.H * 3 };
    },
    toWorld(g, sx, sy) {
      this.setup(g);
      return this.unproject(sx, sy, 0);
    },

    /** The roof gun: its mount (h * 0.1 behind the van's middle, as sprites.js draws it), the world angle to shoot
        at, the barrels' height and how much a shot drops per unit it flies, the aim's angle on the screen, and the
        angle between its barrels (spread). With a pointer: the walker whose picture is under it, led (a shot carries
        the van's speed and the walker walks on, so it is aimed at where the two meet); else what is under the pointer
        at chest height (the shot then flies straight at the pointer on the screen). Aim assist: with a pointer, a
        walker a little off it counts too; keys only, the walker closest to straight ahead. shot: the shots' speed;
        n: how many barrels (Spread Shot). Their fan is centred on the aim; aimed at a walker, it closes in (never
        wider than Upgrades.SPREAD) so every barrel's line crosses that walker where the shots meet it: far down the
        road a fixed fan would pass either side of it (two barrels both missing). */
    aim(g, assist, shot, n) {
      const k = this.setup(g);
      const van = g.van;
      const fx = Math.cos(van.heading);
      const fy = Math.sin(van.heading);
      const mx = van.x - fx * van.h * 0.1;
      const my = van.y - fy * van.h * 0.1;
      let tx = mx + k.Fx * 600;
      let ty = my + k.Fy * 600;
      let tz = AIM_Z;
      let target = null;
      const p = g.pointer;
      // with a pointer: the walker whose standing picture is under it, at the spot on it under the pointer;
      // else what is under the pointer at chest height (with aim assist, a walker a little off it counts too)
      const hit = p.seen ? this.pick(g, p.x, p.y, 0) || (assist ? this.pick(g, p.x, p.y, 28) : null) : null;
      if (hit) {
        tx = hit.x;
        ty = hit.y;
        tz = hit.z;
        target = hit.walker;
      } else if (p.seen) {
        const t = this.unproject(p.x, p.y, AIM_Z);
        tx = t.x;
        ty = t.y;
      }
      if (assist && !p.seen) {
        let best = 0.42;
        const ahead = Math.atan2(ty - my, tx - mx);
        for (const z of g.zombies) {
          if (Math.hypot(z.x - mx, z.y - my) < 650) {
            const az = Math.atan2(z.y - my, z.x - mx);
            const d = Math.abs(Math.atan2(Math.sin(az - ahead), Math.cos(az - ahead)));
            if (d < best) {
              best = d;
              tx = z.x;
              ty = z.y;
              tz = this.walkerH(z) * 0.55;
              target = z;
            }
          }
        }
      }
      let dist = Math.hypot(tx - mx, ty - my);
      if (target && shot > 0) {
        // where a shot meets the walker: it flies at `shot` plus the van's speed, the walker at its own
        const wx = fx * (g.curSpeed || 0) - (target.vx || 0);
        const wy = fy * (g.curSpeed || 0) - (target.vy || 0);
        const Dx = tx - mx;
        const Dy = ty - my;
        const a = shot * shot - wx * wx - wy * wy;
        const b = Dx * wx + Dy * wy;
        const t = a > 1 ? (-b + Math.sqrt(b * b + a * (Dx * Dx + Dy * Dy))) / a : 0;
        if (t > 0) {
          tx = mx + Dx - wx * t;
          ty = my + Dy - wy * t;
          dist = shot * t;
        }
      }
      const s0 = this.project(mx, my, GUN_Z);
      const s1 = this.project(tx, ty, tz);
      const dz = (tz - GUN_Z) / Math.max(60, dist);
      const S = (ZSR.Upgrades && ZSR.Upgrades.SPREAD) || 0;
      const half = ((n || 1) - 1) / 2;
      const spread = target && half > 0 ? Math.min(S, Math.atan2(SPREAD_HIT * (target.r || 18), Math.max(1, dist)) / half) : S;
      return { x: mx, y: my, angle: Math.atan2(ty - my, tx - mx), z: GUN_Z, dz, spread, screen: s0 && s1 ? Math.atan2(s1.y - s0.y, s1.x - s0.x) : -Math.PI / 2 };
    },
    /** A point's place from the camera's spot: X to the right, Y ahead (after setup). */
    local(x, y) {
      const k = this.k;
      const dx = x - k.ox;
      const dy = y - k.oy;
      return { X: dx * k.Rx + dy * k.Ry, Y: dx * k.Fx + dy * k.Fy };
    },
    /** Where a new walker comes from (o: the trip's js/game.js ROAD_DANGER row): far down the road (in the haze,
        across the road and its verges), or out of the overgrowth at the edges of the view further in; small at
        first, they walk in. */
    spawn(g, o) {
      const k = this.setup(g);
      const G = ZSR.Streets.GEOM;
      const r = o || SPAWN;
      let X;
      let Y;
      // (from as far in fog as on a clear day: in fog they are only seen later)
      if (Math.random() < r.far) {
        Y = this.cfg.far * (r.farY[0] + Math.random() * (r.farY[1] - r.farY[0]));
        X = (Math.random() * 2 - 1) * (G.half + r.farX);
      } else {
        Y = r.sideY[0] + Math.random() * (r.sideY[1] - r.sideY[0]);
        const hw = ((k.W / 2) * this.depthAt(Y)) / k.f;
        X = (Math.random() < 0.5 ? -1 : 1) * Math.min(hw * 0.92, G.half + r.sideX[0] + Math.random() * (r.sideX[1] - r.sideX[0]));
      }
      return { x: k.ox + k.Rx * X + k.Fx * Y, y: k.oy + k.Ry * X + k.Fy * Y };
    },
    /** The haze's color: dusty by day, darker in fog, near black at night. */
    haze(g) {
      return g.mods.night ? [28, 29, 26] : g.mods.fog ? [150, 148, 122] : [201, 194, 164];
    },
    /** The walker whose standing figure (its body, from the feet to the top of its head, leaning as it is drawn,
        as wide as its hit circle, r) is under screen point (sx, sy), within `margin` px; the nearest if several.
        Returns the point on it under the pointer: { x, y, z }, its body's middle at that height, a little to the side
        if pointed there. */
    pick(g, sx, sy, margin) {
      const k = this.k;
      let best = null;
      for (const z of g.zombies) {
        const foot = this.project(z.x, z.y, 0);
        const H = this.walkerH(z);
        const head = this.project(z.x, z.y, H);
        if (!foot || !head || foot.s > NEAR_PX) continue;
        const hpx = foot.y - head.y;
        if (hpx < 2) continue;
        const t = (foot.y - sy) / hpx;
        if (t < -margin / hpx || t > 1 + margin / hpx) continue;
        const cx = foot.x + (head.x - foot.x) * LEAN * clamp(t, 0, 1);
        const half = z.r * foot.s;
        if (Math.abs(sx - cx) > half + margin) continue;
        if (best && best.foot.s >= foot.s) continue;
        const u = clamp((sx - cx) / foot.s, -z.r * 0.7, z.r * 0.7);
        best = { foot, walker: z, x: z.x + k.Rx * u, y: z.y + k.Ry * u, z: clamp(t, 0.15, 0.9) * H };
      }
      return best;
    },
    /** How tall a walker stands, in world units: the top of its head as Walker3D draws it (its look's head top, not
        its box), at TILE units a tile. A plain walker's head is about the van's roof; a lanky's well over it. Shots
        over it fly on (game.js), and aim, picking and the health bar go by it. */
    walkerH(z) {
      const M = ZSR.Walker3D;
      return M ? M.box(z.type, false).head * TILE : z.r * 2.9;
    },

    /** Ground layers from the bottom of the screen to the far edge, each reaching twice as deep as the last. */
    layers(g) {
      const k = this.k;
      const q = Math.min(1.5, g.dpr || 1) * this.res;
      const top = Math.min(k.far, this.groundY(0));
      const out = [];
      let y = this.groundY(k.H) - 40;
      while (y < top && out.length < 6) {
        const d0 = this.depthAt(y);
        const y2 = Math.min((2 * d0 - k.h * k.sn) / k.cs - k.b, top + 40);
        const pad = 30;
        const hw = ((k.W / 2 + 60) * this.depthAt(y2)) / k.f + pad;
        let kk = (k.f / d0) * q;
        if (2 * hw * kk > 4096) kk = 4096 / (2 * hw);
        if ((y2 - y + 2 * pad) * kk > 4096) kk = 4096 / (y2 - y + 2 * pad);
        out.push({ y0: y - pad, y1: y2 + pad, hw, k: kk });
        y = y2;
      }
      out.forEach((L, i) => {
        const c = this.canvases[i] || (this.canvases[i] = document.createElement("canvas"));
        const w = Math.ceil(2 * L.hw * L.k);
        const h = Math.ceil((L.y1 - L.y0) * L.k);
        if (c.width !== w || c.height !== h) {
          c.width = w;
          c.height = h;
        }
        L.canvas = c;
      });
      return out;
    },

    /** Everything that lies on the ground and stays put, top-down: grass, the roads, the overgrowth over both, every
        lane zone (over the weeds, so the arrows read), the lots, tyres and rubble. The same for the card's squares
        and for the 2D layers. view: { x, y, r }, with half (a square's half side) and px (px per unit) for a square. */
    drawGround(g, ctx, view, theme) {
      const D = ZSR.Draw;
      const St = ZSR.Streets;
      const G = St.GEOM;
      // what js/perspective-buildings.js stands up (the side streets' ends, the gas canopy, River Landing's dock, the
      // buildings from above) is left off the ground (groundKey keeps the card's squares in step)
      const B = ZSR.PerspBuild;
      D.ground(ctx, view, theme);
      D.cityRoads(ctx, g.drive, G, theme, B ? Object.assign({ standing: true }, view) : view);
      if (ZSR.PerspArt && !view.bare) ZSR.PerspArt.cover(ctx, view, g.drive, G);
      const dirtTheme = Object.assign({}, theme || {}, { asphalt: "#7a5c3e" });
      g.drive.decisions.forEach((d) => {
        const a = St.at(g.drive.track, d.stop);
        if (Math.hypot(a.x - view.x, a.y - view.y) > view.r + (d.stop - d.zoneStart) + 400) return;
        ctx.save();
        ctx.transform(-a.uy, a.ux, -a.ux, -a.uy, a.x, a.y);
        D.laneZone(ctx, { len: d.stop - d.zoneStart, n: d.n, ourLeft: St.ourLeft(d.n), rels: d.lanes.map((w) => d.options[w].rel), ways: d.lanes }, G, g.onDirt(d) ? dirtTheme : theme);
        ctx.restore();
      });
      g.drive.lots.forEach((l) => {
        if (Math.hypot(l.qx - view.x, l.qy - view.y) < view.r + 800) D.lot(ctx, l, G, ZSR.WORLD.place(l.node), B ? B.lotGround(l) : undefined);
      });
      // the junk lying flat: only the props filed in the squares under this view
      const pad = view.r + 60;
      this.propIndex(g).find(view.x - pad, view.y - pad, view.x + pad, view.y + pad, (p) => {
        if ((p.kind !== "tire" && p.kind !== "rubble") || Math.abs(p.x - view.x) > pad || Math.abs(p.y - view.y) > pad) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.face || 0);
        D.prop(ctx, Object.assign({}, p, { x: 0, y: 0 }));
        ctx.restore();
      });
    },
    /** The drive's props filed by square (PROP_CELL; js/perspective-art.js buckets), once for each set of props
        (game.js buildScenery makes a drive's); one in the river or on its bank is left out (it would stand in it). */
    propIndex(g) {
      if (this.propsFor !== g.props || !this.propIdx) {
        const Art = ZSR.PerspArt;
        const Dr = ZSR.Draw;
        const list = g.props || [];
        const scale = g.drive && g.drive.scale;
        const dry = (p) => !(Dr && Dr.inRiver) || !Dr.inRiver(p.x, p.y, 0, scale);
        if (Art && Art.buckets) {
          const B = Art.buckets(PROP_CELL);
          for (const p of list) if (dry(p)) B.add(p, p.x, p.y, p.x, p.y);
          this.propIdx = B;
        } else {
          // (without the art file, a test that leaves it out: one bucket holding them all)
          const dryList = list.filter(dry);
          this.propIdx = { B: Infinity, find: (x0, y0, x1, y1, fn) => dryList.forEach((p) => fn(p)), each: (bx, by, fn) => dryList.forEach((p) => fn(p)) };
        }
        this.propsFor = g.props;
      }
      return this.propIdx;
    },
    /** What the ground leaves out, as part of the card's squares' key (js/perspective-gl.js): a square drawn with other
        flat pieces is never kept. */
    groundKey() {
      return ZSR.PerspBuild ? ZSR.PerspBuild.GROUND_KEY : "flat";
    },
    /** How far into the haze something Y ahead has gone (1: clear, 0: gone), as drawWorld fades everything standing:
        from k.fog0 to k.far (in fog both near). */
    fadeAt(Y) {
      const k = this.k;
      return Y > k.fog0 ? 1 - clamp((Y - k.fog0) / (k.far - k.fog0), 0, 1) : 1;
    },
    /** The sky over the far edge of the ground, fading into the haze there (in fog, all of it the fog). */
    sky(ctx, haze, night) {
      const k = this.k;
      const far = this.project(k.ox + k.Fx * k.far, k.oy + k.Fy * k.far, 0);
      const skyY = far ? far.y : 0;
      if (skyY <= 0) return skyY;
      const sg = ctx.createLinearGradient(0, 0, 0, skyY);
      sg.addColorStop(0, night ? "#121310" : k.fog ? "rgb(" + haze.map((c) => Math.min(255, c + 14)).join(",") + ")" : "#8f8b78");
      sg.addColorStop(1, "rgb(" + haze.join(",") + ")");
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, k.W, skyY + 2);
      return skyY;
    },

    /** The ground on the screen: sky, the warped layers strip by strip, then haze toward the far edge. */
    drawWorldGround(g, ctx, theme) {
      const k = this.k;
      const W = k.W;
      const H = k.H;
      const Ls = this.layers(g);
      Ls.forEach((L) => {
        const x = L.canvas.getContext("2d");
        x.setTransform(L.k * k.Rx, -L.k * k.Fx, L.k * k.Ry, -L.k * k.Fy, L.k * (L.hw - k.ox * k.Rx - k.oy * k.Ry), L.k * (L.y1 + k.ox * k.Fx + k.oy * k.Fy));
        const Ym = (L.y0 + L.y1) / 2;
        // drawn again every frame, so without the overgrowth's fine marks
        this.drawGround(g, x, { x: k.ox + k.Fx * Ym, y: k.oy + k.Fy * Ym, r: Math.hypot(L.hw, (L.y1 - L.y0) / 2), bare: true }, theme);
      });
      // the far edge of the ground, and the sky above it
      const haze = this.haze(g);
      const rgba = (a) => "rgba(" + haze.join(",") + "," + a.toFixed(3) + ")";
      const skyY = this.sky(ctx, haze, g.mods.night);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "low"; // each layer is at most twice as sharp as the rows it fills
      const dh = 3;
      for (let sy = Math.max(0, Math.floor(skyY)); sy < H; sy += dh) {
        const Ya = Math.min(this.groundY(sy), k.far);
        const Yb = Math.min(this.groundY(Math.min(H, sy + dh)), k.far);
        const Ym = (Ya + Yb) / 2;
        const L = Ls.find((l) => Ym >= l.y0 && Ym <= l.y1) || Ls[Ls.length - 1];
        const d = this.depthAt(Ym);
        const Xl = (-k.cx * d) / k.f;
        const Xr = ((W - k.cx) * d) / k.f;
        ctx.drawImage(L.canvas, (Xl + L.hw) * L.k, (L.y1 - Ya) * L.k, (Xr - Xl) * L.k, Math.max(0.5, (Ya - Yb) * L.k), 0, sy, W, dh + 0.6);
      }
      // haze: none near the van, thick at the far edge (from k.fogG: near, in fog)
      const y0 = this.project(k.ox + k.Fx * k.fogG, k.oy + k.Fy * k.fogG, 0);
      if (y0 && y0.y > 0) {
        const top = Math.max(0, skyY);
        const hg = ctx.createLinearGradient(0, top, 0, y0.y);
        hg.addColorStop(0, rgba((k.fog ? 1 : 0.85) * clamp((Math.min(this.groundY(top), k.far) - k.fogG) / (k.far - k.fogG), 0, 1)));
        hg.addColorStop(1, rgba(0));
        ctx.fillStyle = hg;
        ctx.fillRect(0, top, W, y0.y - top);
      }
    },

    /** Draws fn's top-down art (in world coordinates) as if lying flat at height z around (x, y). Nothing right
        under the camera (NEAR_PX px a unit or more): it is out of the picture, and would be drawn huge. */
    flat(ctx, x, y, z, fn) {
      const p0 = this.project(x, y, z);
      if (!p0 || p0.s > NEAR_PX) return;
      const e = 4;
      const px = this.project(x + e, y, z);
      const py = this.project(x, y + e, z);
      if (!p0 || !px || !py) return;
      const a = (px.x - p0.x) / e;
      const b = (px.y - p0.y) / e;
      const c = (py.x - p0.x) / e;
      const d = (py.y - p0.y) / e;
      ctx.save();
      ctx.transform(a, b, c, d, p0.x - a * x - c * y, p0.y - b * x - d * y);
      fn();
      ctx.restore();
    },
    /** A polygon of world points [x, y, height], filled and inked. */
    poly(ctx, pts, fill, lw) {
      const s = pts.map((p) => this.project(p[0], p[1], p[2]));
      if (s.some((p) => !p)) return;
      ctx.beginPath();
      s.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (lw) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = lw;
        ctx.lineJoin = "round";
        ctx.stroke();
      }
    },
    /** Does the wall from ground point a to b of a box around (cx, cy) face the camera? */
    faces(a, b, cx, cy) {
      const k = this.k;
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      // the outward normal: away from the box's middle
      let nx = b[1] - a[1];
      let ny = a[0] - b[0];
      if (nx * (mx - cx) + ny * (my - cy) < 0) {
        nx = -nx;
        ny = -ny;
      }
      return nx * (k.ox - k.Fx * k.b - mx) + ny * (k.oy - k.Fy * k.b - my) > 0;
    },
    /** The walls of a box that face the camera; corners: 4 ground points in order around it. */
    boxSides(ctx, corners, z0, z1, faceFill, onFace) {
      const cx = corners.reduce((s, c) => s + c[0], 0) / 4;
      const cy = corners.reduce((s, c) => s + c[1], 0) / 4;
      for (let i = 0; i < 4; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % 4];
        if (!this.faces(a, b, cx, cy)) continue;
        this.poly(ctx, [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], faceFill(i), 3);
        if (onFace) onFace(i, a, b);
      }
    },
    /** A wall from ground point `left` to `right` (as seen from outside), z0 to z1, papered with textures laid
        left to right ({ img, flip, crop: [from, to] as shares of its width }), each in a few strips so the
        perspective holds. Each strip but the last reaches a little into the next, so no seam shows. A strip is drawn
        in the picture's own pixels through its map (a destination as big as its source, as js/perspective-buildings.js
        texQuad does): drawn into a unit square instead, the browser takes it for a picture shrunk to a dot and blurs or
        clips it on a small wall (the van far off, a road sign's words). */
    texWall(ctx, left, right, z0, z1, pieces) {
      const S = 4;
      const n = pieces.length;
      const at = (t) => [left[0] + (right[0] - left[0]) * t, left[1] + (right[1] - left[1]) * t];
      pieces.forEach((pc, i) => {
        const W = pc.img.width;
        const Ht = pc.img.height;
        const [u0, u1] = pc.crop || [0, 1];
        const sw = (W * (u1 - u0)) / S;
        for (let j = 0; j < S; j++) {
          const A = at((i + j / S) / n);
          const B = at((i + (j + 1) / S) / n);
          const tl = this.project(A[0], A[1], z1);
          const tr = this.project(B[0], B[1], z1);
          const bl = this.project(A[0], A[1], z0);
          if (!tl || !tr || !bl) return;
          ctx.save();
          ctx.transform((tr.x - tl.x) / sw, (tr.y - tl.y) / sw, (bl.x - tl.x) / Ht, (bl.y - tl.y) / Ht, tl.x, tl.y);
          if (pc.flip) {
            ctx.translate(sw, 0);
            ctx.scale(-1, 1);
          }
          const over = i < n - 1 || j < S - 1 ? 1.04 : 1;
          ctx.drawImage(pc.img, pc.flip ? W * u1 - (j + 1) * sw : W * u0 + j * sw, 0, sw, Ht, 0, 0, sw * over, Ht);
          ctx.restore();
        }
      });
    },
    /** An upright post facing the camera: half-width w0 at the foot, w1 at the top (world units). */
    column(ctx, x, y, z0, z1, w0, w1, fill, lw) {
      const a = this.project(x, y, z0);
      const b = this.project(x, y, z1);
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x - w0 * a.s, a.y);
      ctx.lineTo(a.x + w0 * a.s, a.y);
      ctx.lineTo(b.x + w1 * b.s, b.y);
      ctx.lineTo(b.x - w1 * b.s, b.y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw;
      ctx.stroke();
    },

    /** A place's building as a box on its lot (the same footprint sprites.js lot draws from above). */
    building(ctx, l) {
      const G = ZSR.Streets.GEOM;
      const look = ZSR.WORLD.place(l.node);
      if (look && look.type === "river") return;
      const roof = ZSR.Draw.ROOF[look && look.type] || "#4b5057";
      const nx = -l.uy * l.side;
      const ny = l.ux * l.side;
      const v0 = G.half + G.shoulder + G.lotGap;
      const a0 = -G.lotHalf + 22;
      const a1 = G.lotHalf - 22;
      const b0 = v0 + 168;
      const b1 = v0 + G.lotDepth - 18;
      const P = (a, v) => [l.qx + l.ux * a + nx * v, l.qy + l.uy * a + ny * v];
      const at = (a, v, z) => P(a, v).concat(z);
      const foot = [P(a0, b0), P(a1, b0), P(a1, b1), P(a0, b1)];
      const Hb = 150;
      const wall = "#9a9282";
      this.boxSides(ctx, foot, 0, Hb, (i) => (i === 0 ? wall : shade(wall, -28 - i * 6)), (i) => {
        if (i !== 0) return; // the front, facing the drive: a row of windows and the door
        for (let a = a0 + 34; a + 44 < a1 - 20; a += 72) {
          if (Math.abs(a + 22) < 70) continue;
          this.poly(ctx, [at(a, b0, 74), at(a + 44, b0, 74), at(a + 44, b0, 112), at(a, b0, 112)], "#3d4a55", 2.5);
        }
        this.poly(ctx, [at(-28, b0, 0), at(28, b0, 0), at(28, b0, 66), at(-28, b0, 66)], INK, 0);
      });
      this.poly(ctx, foot.map((c) => c.concat(Hb)), roof, 4);
      this.poly(ctx, [P(a0 + 12, b0 + 12), P(a1 - 12, b0 + 12), P(a1 - 12, b1 - 12), P(a0 + 12, b1 - 12)].map((c) => c.concat(Hb)), "rgba(0,0,0,0.08)", 0);
    },
    /** A picture standing on its feet at (x, y), H world units tall. It leans with the camera's upright lines,
        though only by `lean` of them: a flat picture taking all of it looks to be falling over. */
    billboard(ctx, img, x, y, H, aspect, flip, lean) {
      const foot = this.project(x, y, 0);
      const head = this.project(x, y, H);
      if (!foot || !head || foot.s > NEAR_PX) return false;
      const hpx = foot.y - head.y;
      if (hpx < 2) return false;
      const wpx = H * aspect * foot.s;
      ctx.save();
      ctx.transform(flip ? -1 : 1, 0, (-(head.x - foot.x) / hpx) * lean, 1, foot.x, foot.y);
      ctx.drawImage(img, -wpx / 2, -hpx, wpx, hpx);
      ctx.restore();
      return true;
    },
    /** A shadow lying under something: an ellipse rx by ry, turned by `a`. */
    shadow(ctx, x, y, rx, ry, a, alpha) {
      this.flat(ctx, x, y, 0, () => {
        ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, a || 0, 0, TAU);
        ctx.fill();
      });
    },
    /** A tree, bush or clump of tall grass from js/perspective-art.js, at this frame's alpha (the haze's), under the
        scenery governor's eased setting (this.scen.cur): a plant shorter on the screen than its minPx fades out, a far
        grass or bush whose own hash (o.q) is under its thin share fades out, its shadow fades with `shadows`. True if
        it was drawn. A tree prop (no q) is never thinned. */
    plant(ctx, o, alpha) {
      const a0 = alpha == null ? ctx.globalAlpha : alpha;
      const cur = this.scen ? this.scen.cur : null;
      let a = a0;
      if (cur && cur.thin > 0.001 && o.q != null && (o.kind === "grass" || o.kind === "bush")) {
        // by how far ahead it is: none at THIN_FROM of the view, all of `thin` 0.15 of it further, so no line shows
        const k = this.k;
        const Y = o._Y != null ? o._Y : (o.x - k.ox) * k.Fx + (o.y - k.oy) * k.Fy;
        const t = cur.thin * clamp((Y / k.far - THIN_FROM) / 0.15, 0, 1);
        if (t > 0) a *= clamp((o.q - t) / THIN_EDGE, 0, 1);
      }
      if (a <= 0.02) return false;
      const foot = this.project(o.x, o.y, 0);
      const head = this.project(o.x, o.y, o.h);
      if (!foot || !head || foot.s > NEAR_PX) return false;
      const hpx = foot.y - head.y;
      if (hpx < 2) return false;
      if (cur && cur.minPx > 0.5) a *= clamp((hpx - cur.minPx * 0.7) / (cur.minPx * 0.3), 0, 1);
      if (a <= 0.02) return false;
      const s = ZSR.PerspArt.sprite(o.kind, o.v);
      const sh = cur ? cur.shadows : 1;
      if ((o.kind === "tree" || o.kind === "dead") && sh > 0.02) {
        ctx.globalAlpha = a * sh;
        this.shadow(ctx, o.x + o.h * 0.12, o.y + o.h * 0.08, o.h * 0.32, o.h * 0.2, 0.3, 0.22);
      }
      ctx.globalAlpha = a;
      const wpx = o.h * s.aspect * foot.s;
      ctx.save();
      ctx.transform(o.flip ? -1 : 1, 0, (-(head.x - foot.x) / hpx) * 0.5, 1, foot.x, foot.y);
      ctx.drawImage(s.img, -wpx / 2, -hpx, wpx, hpx);
      ctx.restore();
      return true;
    },
    /** One of the road's props, standing: a tree, a barrel, a barrier, a sign or a wrecked car. d: how much of its
        detail shows (1 all, 0 the far, simple one: LOD_AT; in between both, the detail fading). True if drawn. */
    prop(ctx, p, d) {
      if (p.kind === "tree") {
        if (!p.plant) p.plant = { kind: p.seed % 5 === 0 ? "dead" : "tree", x: p.x, y: p.y, h: 110 + p.size * 3.2, v: p.seed % 4, flip: p.seed % 2 === 1 };
        return this.plant(ctx, p.plant);
      }
      const D = d == null ? 1 : d;
      if (p.kind === "barrel") {
        const s = ZSR.PerspArt.sprite("barrel", ["#7a4a2a", "#5f6b3c", "#4d4f55"].indexOf(p.color) + 3);
        this.shadow(ctx, p.x + 6, p.y + 4, 16, 12, 0, 0.25);
        return this.billboard(ctx, s.img, p.x, p.y, 36, s.aspect, false, 0.3);
      }
      if (p.kind === "barrier") this.barrier(ctx, p, D);
      else if (p.kind === "sign") this.sign(ctx, p, D);
      else if (p.kind === "wreck") this.car(ctx, p, D);
      else return false;
      return true;
    },
    /** Draws part of a prop's detail at `d` of the alpha now (none under 0.02), then puts the alpha back. */
    detail(ctx, d, fn) {
      if (d <= 0.02) return;
      if (d >= 0.98) return fn();
      const a = ctx.globalAlpha;
      ctx.globalAlpha = a * d;
      fn();
      ctx.globalAlpha = a;
    },
    /** A wall between ground points a and b of a box around (cx, cy), if it faces the camera: papered with
        `pieces` (left to right as seen from outside) or filled. */
    wall(ctx, a, b, cx, cy, z0, z1, pieces, fill) {
      if (!this.faces(a, b, cx, cy)) return false;
      if (!pieces) {
        this.poly(ctx, [a.concat(z0), b.concat(z0), b.concat(z1), a.concat(z1)], fill, 2.5);
        return true;
      }
      // seen from outside, the viewer's right is the outward normal turned back a quarter
      const nx = b[1] - a[1];
      const ny = a[0] - b[0];
      const out = nx * ((a[0] + b[0]) / 2 - cx) + ny * ((a[1] + b[1]) / 2 - cy) > 0 ? 1 : -1;
      const rx = ny * out;
      const ry = -nx * out;
      const aRight = a[0] * rx + a[1] * ry > b[0] * rx + b[1] * ry;
      this.texWall(ctx, aRight ? b : a, aRight ? a : b, z0, z1, pieces);
      this.poly(ctx, [a.concat(z0), b.concat(z0), b.concat(z1), a.concat(z1)], null, 2.5);
      return true;
    },
    /** A concrete barrier: the striped faces down its long sides (far off, d under 1: flat faces, the stripes' picture
        and its shadow fading out). */
    barrier(ctx, p, d) {
      const D = d == null ? 1 : d;
      const A = (p.face || 0) + (p.rot || 0);
      const ux = Math.cos(A);
      const uy = Math.sin(A);
      const P = (l, w) => [p.x + ux * l - uy * w, p.y + uy * l + ux * w];
      const c = [P(-36, -10), P(36, -10), P(36, 10), P(-36, 10)];
      this.detail(ctx, D, () => this.shadow(ctx, p.x + 8, p.y + 6, 40, 14, A, 0.25));
      const tex = [{ img: ZSR.PerspArt.barrier() }];
      for (let i = 0; i < 4; i++) {
        const a = c[i];
        const b = c[(i + 1) % 4];
        if (i % 2) this.wall(ctx, a, b, p.x, p.y, 0, 30, null, "#7d7a74");
        else if (D >= 0.98) this.wall(ctx, a, b, p.x, p.y, 0, 30, tex);
        else if (this.wall(ctx, a, b, p.x, p.y, 0, 30, null, "#a29167")) this.detail(ctx, D, () => this.wall(ctx, a, b, p.x, p.y, 0, 30, tex));
      }
      this.poly(ctx, c.map((q) => q.concat(30)), "#a3a09a", 2.5);
    },
    /** A road sign on its post, its words facing the way the route runs past it (far off, d under 1: its board a flat
        face of its colour, the words and its shadow fading out). */
    sign(ctx, p, d) {
      const D = d == null ? 1 : d;
      const A = p.face || 0;
      const vx = Math.cos(A);
      const vy = Math.sin(A);
      const left = [p.x - vx * 40, p.y - vy * 40];
      const right = [p.x + vx * 40, p.y + vy * 40];
      const k = this.k;
      // the front faces back along the way the route runs (where the van comes from)
      const nx = -vy;
      const ny = vx;
      const front = nx * (k.ox - k.Fx * k.b - p.x) + ny * (k.oy - k.Fy * k.b - p.y) > 0;
      this.detail(ctx, D, () => this.shadow(ctx, p.x + 10, p.y + 8, 30, 8, A, 0.22));
      if (front) this.column(ctx, p.x, p.y, 0, 86, 3, 3, "#4a4a4f", 2);
      const board = [left.concat(46), right.concat(46), right.concat(88), left.concat(88)];
      const face = () => (front ? this.texWall(ctx, left, right, 46, 88, [{ img: ZSR.PerspArt.signBoard(p.text || "KEEP OUT", p.color || "#d9a21b") }]) : this.texWall(ctx, right, left, 46, 88, [{ img: ZSR.PerspArt.signBack() }]));
      if (D < 0.98) this.poly(ctx, board, front ? p.color || "#d9a21b" : "#7d7a74", 0);
      this.detail(ctx, D, face);
      this.poly(ctx, board, null, 2.5);
      if (!front) this.column(ctx, p.x, p.y, 0, 86, 3, 3, "#4a4a4f", 2);
    },
    /** A wrecked car: wheels, the body, the cabin with its windows (some smashed), rust. Far off (d under 1) only the
        body and the cabin, plain: the wheels, rust, windows and its shadow fade out. */
    car(ctx, p, d) {
      const D = d == null ? 1 : d;
      const A = (p.face || 0) + (p.rot || 0) + Math.PI / 2;
      const ux = Math.cos(A);
      const uy = Math.sin(A);
      const P = (l, w) => [p.x + ux * l - uy * w, p.y + uy * l + ux * w];
      const col = p.color || "#5a4538";
      const seed = Math.abs(Math.floor(p.x * 7 + p.y * 13)) % 97;
      this.detail(ctx, D, () => {
        this.shadow(ctx, p.x + 10, p.y + 8, 60, 34, A, 0.3);
        // wheels (one gone, on some)
        for (const [l, w] of [[-34, -27], [34, -27], [-34, 27], [34, 27]]) {
          if ((seed + l + w) % 7 === 0) continue;
          const c = [P(l - 10, w - 4), P(l + 10, w - 4), P(l + 10, w + 4), P(l - 10, w + 4)];
          const m = P(l, w);
          for (let i = 0; i < 4; i++) this.wall(ctx, c[i], c[(i + 1) % 4], m[0], m[1], 0, 18, null, "#1f2023");
        }
      });
      const body = [P(-54, -27), P(54, -27), P(54, 27), P(-54, 27)];
      for (let i = 0; i < 4; i++) {
        const a = body[i];
        const b = body[(i + 1) % 4];
        if (!this.wall(ctx, a, b, p.x, p.y, 9, 28, null, i % 2 ? shade(col, -40) : shade(col, -22))) continue;
        // rust and a dent along the sides
        if (i % 2 === 0) {
          const t = 0.2 + (seed % 5) * 0.12;
          const q = (s, z) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, z];
          this.detail(ctx, D, () => this.poly(ctx, [q(t, 11), q(t + 0.16, 12), q(t + 0.12, 22), q(t - 0.02, 20)], "rgba(122,62,28,0.6)", 0));
        }
      }
      this.poly(ctx, body.map((q) => q.concat(28)), col, 2.5);
      const cab = [P(-28, -23), P(22, -23), P(22, 23), P(-28, 23)];
      const cm = P(-3, 0);
      for (let i = 0; i < 4; i++) {
        const a = cab[i];
        const b = cab[(i + 1) % 4];
        if (!this.wall(ctx, a, b, cm[0], cm[1], 28, 47, null, shade(col, -14))) continue;
        const q = (s, z) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, z];
        const broken = (seed + i) % 3 === 0;
        this.detail(ctx, D, () => {
          this.poly(ctx, [q(0.12, 31), q(0.88, 31), q(0.82, 44), q(0.18, 44)], broken ? "#56636e" : "#2b3540", 2);
          if (broken) this.poly(ctx, [q(0.3, 32), q(0.5, 40), q(0.45, 36), q(0.7, 43)], null, 1.5);
        });
      }
      this.poly(ctx, cab.map((q) => q.concat(47)), shade(col, 12), 2.5);
    },
    /** A supply crate on the road: a planked box, its top-down lid on top. */
    crate(ctx, c) {
      const A = c.face || 0;
      const ux = Math.cos(A);
      const uy = Math.sin(A);
      const P = (l, w) => [c.x + ux * l - uy * w, c.y + uy * l + ux * w];
      const q = [P(-17, -17), P(17, -17), P(17, 17), P(-17, 17)];
      this.shadow(ctx, c.x + 6, c.y + 5, 22, 18, A, 0.28);
      for (let i = 0; i < 4; i++) {
        const a = q[i];
        const b = q[(i + 1) % 4];
        if (!this.wall(ctx, a, b, c.x, c.y, 0, 28, null, i % 2 ? "#6e5230" : "#8a6a3e")) continue;
        const m = (s, z) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, z];
        this.poly(ctx, [m(0, 14), m(1, 14)], null, 2);
        this.poly(ctx, [m(0.08, 2), m(0.92, 26)], null, 2);
      }
      this.flat(ctx, c.x, c.y, 28, () => {
        ctx.translate(c.x, c.y);
        ctx.rotate(A);
        ZSR.Draw.prop(ctx, { kind: "crate", x: 0, y: 0, t: c.t });
      });
    },
    /* ---------- Walkers: Walker3D's live figures, as the interiors draw theirs (js/interior.js) ---------- */
    /** How a walker on the angled drive looks this frame (game.js update, once it has moved from x0, y0; touching:
        it presses on the van), as on foot (js/interior.js animWalker): its heading turns at its look's turn rate (no
        snap as the van goes by or a shot throws it back) toward where it is going (its ground motion, smoothed, the
        keep-up carry included; along a wall or the bank while it goes round one, game.js blockWalker), or toward
        the van while it claws or screams at it, or while something throws it back from the van (the keep-up never
        carries a walker away from the van: game.js carry); its legs go by the ground it covered, running
        (Walker3D st.run) as that outpaces its kind's walk (near the van it sprints, owner 2026-10-16); the walk
        blend; a claw's swipes at its look's rate while it presses on the van or has just hit it; the scream while it
        yells; each pose eased in and out over Walker3D's POSE_BLEND. Only looks: nothing here moves it. */
    animate(g, z, dt, x0, y0, touching) {
      const M = ZSR.Walker3D;
      if (!M || !(dt > 0)) return;
      const look = M.TYPES[z.type] || M.TYPES.walker;
      const gt = (look && look.gait) || {};
      if (z.heading == null) {
        z.heading = z.angle || 0;
        z.gait = ((z.phase || 0) / TAU) % 1;
        z.move = 1;
        z.clawPh = 0;
        z.pose = "walk";
        z.poseW = 1;
        z.svx = z.svy = 0;
        z.run = 0;
      }
      const mx = z.x - x0;
      const my = z.y - y0;
      const d = Math.hypot(mx, my);
      const ease = Math.min(1, dt * 6);
      // its ground motion, smoothed (a shove from a neighbour or a shot does not swing it round)
      z.svx += (mx / dt - z.svx) * ease;
      z.svy += (my / dt - z.svy) * ease;
      const sp = Math.hypot(z.svx, z.svy);
      const claw = touching || z.cool > CLAW_HOLD;
      const a = z.angle || 0;
      let want = a;
      if (!claw && !(z.yell > 0) && sp > 0.15 * TILE && (z.wall || z.svx * Math.cos(a) + z.svy * Math.sin(a) >= 0)) want = Math.atan2(z.svy, z.svx);
      const I = ZSR.Interior;
      const m = (gt.turnRate > 0 ? gt.turnRate : I ? I.TURN_RATE : 7) * dt;
      z.heading = normA(z.heading + clamp(normA(want - z.heading), -m, m));
      z.move += ((d / dt > 0.2 * z.speed ? 1 : 0) - z.move) * ease;
      if (claw) z.clawPh = (z.clawPh + dt * (gt.clawRate > 0 ? gt.clawRate : 1.6)) % 1;
      // the pose: from walking straight into the new one; from any other, out of it first (poseW 0 is the walk)
      const pose = z.yell > 0 ? "scream" : claw ? "claw" : "walk";
      const step = dt / (M.POSE_BLEND || 0.15);
      if (pose === z.pose) z.poseW = Math.min(1, z.poseW + step);
      else if (z.pose === "walk" || !(z.poseW > step)) {
        z.pose = pose;
        z.poseW = pose === "walk" ? 1 : 0;
      } else z.poseW -= step;
      // running: by how far its ground speed outpaces its kind's walk; a claw or a scream (feet set) eases it out
      const W = ZSR.WORLD && ZSR.WORLD.WALKER_TYPES;
      const row = W && (W[z.type] || W.walker);
      const foot = (row && row.speed > 0 ? row.speed : 1.25) * TILE;
      z.run = clamp((sp / foot - RUN_FROM) / RUN_SPAN, 0, 1) * (z.pose === "walk" ? 1 : 1 - z.poseW);
      // the legs by the ground it covered, over the stride it has at that pace (the feet stay planted)
      z.gait = (z.gait + d / TILE / M.stride(z.type, z.run)) % 1;
    },
    /** A walker going down (game.js killZombie): its body f goes on from how it looked (heading, legs, pose, the hit's
        flash), so it falls from its last step, the way on foot a walker's own record falls. */
    fallFrom(z, f) {
      f.heading = z.heading == null ? z.angle || 0 : z.heading;
      f.gait = z.gait || 0;
      f.move = z.move == null ? 1 : z.move;
      f.pose = z.pose || "walk";
      f.poseW = z.poseW == null ? 1 : z.poseW;
      f.clawPh = z.clawPh || 0;
      f.yell = z.yell || 0;
      f.hit = z.hit || 0;
      f.run = z.run || 0;
    },
    /** Where a drop of a hit's spray starts and how it flies up (game.js blood): at the hit's height h (a shot's),
        kept on the body, else at the chest as on foot (js/interior.js bleed); up at 0.5 to 1.5 tiles a second, then
        falling BLOOD_FALL, until it lands (game.js updateParticles). */
    dropAt(p, z, h) {
      const M = ZSR.Walker3D;
      const H = this.walkerH(z);
      const box = M ? M.box(z.type, false).h * TILE : H;
      p.z = h > 0 ? clamp(h, H * 0.25, H * 0.9) : box * (BLOOD_HIGH[0] + Math.random() * (BLOOD_HIGH[1] - BLOOD_HIGH[0]));
      p.vz = (0.5 + Math.random()) * TILE;
      p.life = p.maxLife = 1.5;
    },

    /** The governor's tuning: js/interior.js's own rows and waits (ZSR.Interior), or, without it (a test that leaves it
        out), one row that draws every walker every frame at full detail. */
    liveTune() {
      const I = ZSR.Interior;
      return I && I.LIVE_LEVELS && I.LIVE_LEVELS.length ? I : NO_GOVERNOR;
    },
    /** The governor's row in use (one of the interiors' LIVE_LEVELS). */
    liveRow() {
      const T = this.liveTune();
      if (this.liveTuned !== T) {
        this.liveTuned = T;
        this.liveLevel = T.LIVE_START;
        this.liveSlowN = this.liveFastN = this.liveN = 0;
        this.liveUpWait = [];
        this.liveSmooth = null;
      }
      return T.LIVE_LEVELS[clamp(this.liveLevel | 0, 0, T.LIVE_LEVELS.length - 1)];
    },
    /** This frame's walker pictures (drawWorld, before anything stands): where each walker and downed walker is on the
        screen and how big, which of them show, and the ones drawn again, as the interiors do theirs (js/interior.js
        liveRenderAll): nearest first, a picture never drawn, a hit's flash starting or ending and the near ones (the
        row's `near` nearest, standing or still going over) when they look different draw at once; past the frame's
        redraws (the row's `max`) a picture never drawn is drawn at the cheapest detail; then the rest take turns
        (`far` frames apart), an out-of-date one first, the longest waiting next. */
    walkerFrame(g) {
      const M = ZSR.Walker3D;
      const S = this.walkerStats;
      S.drawn = S.renders = S.ms = 0;
      if (!M) return;
      const t0 = performance.now();
      const T = this.liveTune();
      const row = this.liveRow();
      const no = (this.liveNo = (this.liveNo || 0) + 1);
      const q = this.liveQ || (this.liveQ = []);
      q.length = 0;
      for (const z of g.zombies) {
        const r = this.liveGeo(g, z, false, row, no);
        if (r) q.push(r);
      }
      for (const f of g.fallen) {
        const r = this.liveGeo(g, f, true, row, no);
        if (r) q.push(r);
      }
      q.sort((a, b) => a.d - b.d);
      // the near ones: one near last frame counts NEAR_STICK nearer, so two at about the same depth do not swap
      const settled = M.COLLAPSE_SECS || 0.9;
      const near = this.liveNearQ || (this.liveNearQ = []);
      near.length = 0;
      for (const r of q) {
        r.near = false;
        if (r.falling && fallAge(r.o) >= settled) continue;
        r.nearKey = r.nearAt === no - 1 ? r.d * T.NEAR_STICK : r.d;
        near.push(r);
      }
      if (near.length > row.near) near.sort((a, b) => a.nearKey - b.nearKey);
      for (let i = 0; i < near.length && i < row.near; i++) {
        near[i].near = true;
        near[i].nearAt = no;
      }
      near.length = 0;
      const wait = this.liveWait || (this.liveWait = []);
      wait.length = 0;
      let drawn = 0;
      for (const r of q) {
        const want = this.liveCheck(g, r, row, no);
        if (want === 1) {
          if (!r.near && !r.lh && drawn >= row.max) r.lod = 2;
          this.liveRender(g, r, T, no);
          drawn++;
        } else if (want === 2) wait.push(r);
      }
      if (wait.length && drawn < row.max) {
        wait.sort((a, b) => b.first - a.first || b.age - a.age || a.d - b.d);
        for (let i = 0; i < wait.length && drawn < row.max; i++, drawn++) this.liveRender(g, wait[i], T, no);
      }
      wait.length = 0;
      for (const r of q) r.used = no;
      S.renders = drawn;
      S.shown = q.length;
      S.ms = performance.now() - t0; // the pictures going up are added as they are drawn (walker, downed)
      this.liveSweep(g, T, no);
    },
    /** One walker's (or downed walker's) place on the screen this frame, in its pool record, or null when it does not
        show: its feet, the top of its box, how wide a tile is there, and the picture it wants. Walker3D's level camera
        is put where this one looks from: as high over the walker (eye) as the road camera is over the ground for its
        distance (dist: this camera's depth along the bearing, so the figure's own perspective is the camera's), so it
        is seen from above; the region leaves room for how far its parts can show over and under its feet from there.
        rec: a record of the caller's own to draw into instead of the pool's (the title screen's still figures). */
    liveGeo(g, o, falling, row, no, rec) {
      const M = ZSR.Walker3D;
      const k = this.k;
      const foot = this.project(o.x, o.y, 0);
      if (!foot || foot.s > NEAR_PX || foot.Y > k.far + 150) return null;
      const box = M.box(o.type, falling);
      const T3 = M.TYPES && (M.TYPES[o.type] || M.TYPES.walker);
      const bh = box.h;
      // (standing, as wide as it may need running: Walker3D's wRun)
      const bw = !falling && T3 && T3.wRun > box.w ? T3.wRun : box.w;
      const headT = box.head;
      const top = this.project(o.x, o.y, bh * TILE);
      if (!top) return null;
      const hpx = foot.y - top.y; // its box's height on the screen
      if (hpx < 1) return null;
      const upx = foot.s * TILE; // px a tile across, at its feet
      const half = (bw / 2) * upx + Math.abs(top.x - foot.x) * LEAN + 4;
      if (foot.x + half < 0 || foot.x - half > k.W || foot.y - 2.6 * hpx > k.H || foot.y + hpx < 0) return null;
      // how the road camera sees it, as Walker3D's level camera
      const gx = o.x - (k.ox - k.Fx * k.b);
      const gy = o.y - (k.oy - k.Fy * k.b);
      const Hd = Math.max(k.h * 0.2, Math.hypot(gx, gy));
      const ahead = Math.max(0.2, (gx * k.Fx + gy * k.Fy) / Hd);
      const dist = foot.d / (k.cs * ahead) / TILE;
      const eye = (dist * k.h) / Hd;
      // the picture: render px a tile (its size on the screen at the device's pixels, under the row's resolution and
      // tallest picture), its detail by its height on the screen in device px (the interiors' LOD_PX rule)
      const dpr = Math.min(2, g.dpr || 1);
      const rpx = Math.max(1, Math.min(upx * dpr * row.scale, row.maxPx / bh));
      const devH = hpx * dpr;
      const lod = devH >= row.lodPx[0] ? 0 : devH >= row.lodPx[1] ? 1 : 2;
      // room for the figure seen from above: a part `reach` tiles nearer shows lower than its feet, one farther higher
      // than it stands (standing: as far and as high as any of its poses reaches, running too, its look's envelope;
      // going over: its falling box), with the margin Walker3D keeps inside its region on every side and a spare px
      const E3 = T3 && (T3.envRun || T3.env);
      const env = !falling && E3 && E3.n > 0 ? E3 : null;
      const reach = env ? env.rh : bw / 2;
      let above = 0;
      if (env) {
        // how high its envelope's points show from up here (as Walker3D's own fit reads them: the far side highest)
        for (let i = 0; i < env.n; i++) {
          const y = env.top[i] - eye;
          above = Math.max(above, eye + y * (y < 0 ? dist / (dist + env.rho[i]) : dist / Math.max(0.3, dist - env.rho[i])));
        }
      } else above = Math.max(bh, eye - (eye - bh) * (dist / (dist + reach)));
      const below = eye * (dist / Math.max(0.3, dist - reach) - 1) + 0.04;
      const pad = 2 + clamp(rpx * 0.0105, 0.7, 3.2);
      const rw = Math.ceil(bw * rpx + 2 * pad);
      let fl = Math.ceil(below * rpx + pad);
      const up = Math.ceil(above * rpx + pad);
      fl = Math.min(fl, Math.floor(up * 1.5)); // (Walker3D keeps the floor under 0.6 of the region)
      const r = rec || this.liveTarget(o, rw, up + fl);
      r.o = o;
      r.falling = falling;
      r.frame = no;
      r.alpha = 0; // (set as it goes up: drawOverSign puts up only what this frame put up)
      r.foot = foot;
      r.top = top;
      r.hpx = hpx;
      r.upx = upx;
      r.d = foot.d;
      r.bh = bh;
      r.head = headT;
      r.rpx = rpx;
      r.rw = rw;
      r.rh = up + fl;
      r.fl = fl;
      r.eye = eye;
      r.dist = dist;
      r.lodSize = lod;
      // the look down and the figure's own perspective, in the steps the signature compares
      r.view = Math.round(Math.atan2(eye, dist) * 64);
      r.depth = Math.round(Math.log(dist) * 16);
      // fog: at night Walker3D darkens it toward black with distance (its eyes keep their glow); by day the haze is
      // light, so it fades with the ground instead (walker)
      r.fog = g.mods && g.mods.night ? NIGHT_FOG * clamp((foot.Y - k.far * NIGHT_FROM) / (k.far * (1 - NIGHT_FROM)), 0, 1) : 0;
      return r;
    },
    /** What one picture needs this frame (js/interior.js liveCheck): 0 keep it, 1 draw it now, 2 draw it if this
        frame's redraws last. Out of date: not on the screen last frame, drawn with less detail than it now gets, or
        grown on the screen by over 15%. The road's near ones draw every frame they look different at any detail (in
        the interiors that is the lod-0 ones; on the road nothing is big enough for lod 0, and the ones beside the van
        are the biggest on the screen). */
    liveCheck(g, r, row, no) {
      const M = ZSR.Walker3D;
      let most = r.near ? 0 : row.farLod;
      if (r.falling && r.lh && r.sLod < most) most = r.sLod; // a body keeps the detail it went down with
      const lod = (r.lod = Math.max(r.lodSize, most));
      r.age = no - (r.drawnAt || 0);
      const old = (r.first = r.used < no - 1 || r.sLod > lod || (r.rh > r.lh * 1.15 && r.hpx > r.shAt * 1.15) || (r.rw > r.lw * 1.15 && r.upx > r.swAt * 1.15));
      if (!r.lh || (old && r.near)) return 1;
      const I = ZSR.Interior;
      if (!I || !I.sameSig) return 1;
      const st = this.liveState(g, r, lod);
      const sized = Math.abs(r.rh - r.lh) <= Math.max(2, r.rh * 0.02) && Math.abs(r.rw - r.lw) <= Math.max(2, r.rw * 0.02);
      if (sized && r.sView === r.view && r.sDepth === r.depth && r.sRun === Math.round(st.run * 16) && I.sameSig(r, st, M.FOG_STEPS || 32)) return 0;
      if (r.sHit !== st.hit) return 1; // a hit's flash shows at once, and goes at once
      if (r.near) return 1;
      return old || r.age >= row.far ? 2 : 0;
    },
    /** What Walker3D draws for one picture now (one reused state): which way it faces this camera, its legs, pose and
        their timers, the hit's flash, how far over it has gone and which way (from its heading at death: fold and
        kneel go forward on their own, the rest away from the shot), its look, the detail and the fog. */
    liveState(g, r, lod) {
      const M = ZSR.Walker3D;
      const st = this.liveSt || (this.liveSt = { yaw: 0, gait: 0, move: 1, pose: "walk", poseT: 0, poseW: 1, claw: 0, hit: 0, fall: 0, fallDir: Math.PI, seed: 0, lod: 0, fog: 0, gore: true, run: 0 });
      const k = this.k;
      const o = r.o;
      const heading = o.heading != null ? o.heading : r.falling ? (o.rot || 0) + Math.PI : o.angle || 0;
      st.yaw = normA(heading - Math.atan2(k.oy - k.Fy * k.b - o.y, k.ox - k.Fx * k.b - o.x));
      st.gait = o.gait || 0;
      st.move = o.move == null ? 1 : o.move;
      st.pose = o.pose || "walk";
      st.poseW = o.poseW == null ? 1 : o.poseW;
      st.claw = o.clawPh || 0;
      const SC = ZSR.WORLD && ZSR.WORLD.SCREAM;
      st.poseT = st.pose === "scream" && SC ? clamp(1 - (o.yell || 0) / SC.yell, 0, 1) : st.pose === "claw" ? st.claw : 0;
      st.hit = o.hit > 0 ? 1 : 0;
      st.fall = r.falling ? clamp(fallAge(o) / (M.COLLAPSE_SECS || 0.9), 0, 1) : 0;
      st.fallDir = r.falling ? normA((o.rot || 0) - heading) : Math.PI;
      st.seed = o.seed | 0;
      st.lod = lod;
      st.fog = r.fog;
      st.gore = M.gore();
      st.run = o.run > 0 ? o.run : 0;
      return st;
    },
    /** Draw one picture into its canvas (liveGeo sized it, liveCheck set its detail): Walker3D's figure from above,
        with room under its feet (cam.floor) and no contact shadow of its own (the road lays one on its ground,
        walkerGround); a downed walker's pool (gore on) is the figure's own. The canvas grows in LIVE_STEP steps. */
    liveRender(g, r, T, no) {
      const M = ZSR.Walker3D;
      const st = this.liveState(g, r, r.lod);
      const step = T.LIVE_STEP;
      const c = r.c;
      const bw = Math.ceil(r.rw / step) * step;
      const bh = Math.ceil(r.rh / step) * step;
      if (c.width < r.rw || c.height < r.rh) {
        c.width = Math.max(c.width, bw);
        c.height = Math.max(c.height, bh);
        r.small = 0;
      } else {
        // drawn this small for a while (LIVE_SHRINK renders at under half its canvas): a smaller canvas, as indoors
        r.small = c.height >= 2 * bh || c.width >= 2 * bw ? (r.small || 0) + 1 : 0;
        if (r.small >= T.LIVE_SHRINK) {
          c.width = bw;
          c.height = bh;
          r.small = 0;
        } else r.g.clearRect(0, 0, Math.max(r.lw, r.rw), Math.max(r.lh, r.rh));
      }
      const cam = this.liveCam || (this.liveCam = { w: 0, h: 0, px: 0, dist: 1, eye: 0.5, floor: 0, shadow: false });
      cam.w = r.rw;
      cam.h = r.rh;
      cam.px = r.rpx;
      cam.dist = r.dist;
      cam.eye = r.eye;
      cam.floor = r.fl;
      M.draw(r.g, r.o.type, st, cam);
      r.lw = r.rw;
      r.lh = r.rh;
      r.lfl = r.fl;
      r.lrpx = r.rpx;
      r.shAt = r.hpx;
      r.swAt = r.upx;
      r.drawnAt = no;
      r.sView = r.view;
      r.sDepth = r.depth;
      r.sRun = Math.round(st.run * 16);
      const I = ZSR.Interior;
      if (I && I.saveSig) I.saveSig(r, st, M.FOG_STEPS || 32);
      else r.sLod = st.lod;
      r.sHit = st.hit;
    },
    /** A walker's pool record: its canvas (its own, else a spare one, else a new one, rw x rh in LIVE_STEP steps) and
        its picture's signature. A spare far bigger than this walker needs is made smaller first (a whole canvas goes
        up to the screen each time it changes, so a small far walker in a big canvas would cost as much as a near one). */
    liveTarget(o, rw, rh) {
      const pool = this.livePool || (this.livePool = new Map());
      let r = pool.get(o);
      if (!r) {
        const T = this.liveTune();
        const step = T.LIVE_STEP;
        const w = Math.ceil(rw / step) * step;
        const h = Math.ceil(rh / step) * step;
        const spare = this.liveSpare || (this.liveSpare = []);
        r = spare.pop();
        if (!r) {
          const c = document.createElement("canvas");
          c.width = w;
          c.height = h;
          r = { c, g: c.getContext("2d") };
        } else if (r.c.width * r.c.height > 2 * w * h) {
          r.c.width = w;
          r.c.height = h;
        }
        Object.assign(r, { lw: 0, lh: 0, lfl: 0, lrpx: 1, shAt: 0, swAt: 0, used: 0, drawnAt: 0, nearAt: -1, frame: 0, sLod: -1, sHit: -1, sView: null, sDepth: null, alpha: 0, small: 0 });
        pool.set(o, r);
      }
      return r;
    },
    /** End of the walkers' pass: a canvas whose walker is gone (neither walking nor going down) goes back to the
        spares (LIVE_SPARE kept, the rest let go), and so does one not drawn for LIVE_IDLE frames. */
    liveSweep(g, T, no) {
      const pool = this.livePool;
      if (!pool || !pool.size) return;
      pool.forEach((r, o) => {
        if (r.used === no) return;
        if (no - r.used > T.LIVE_IDLE || (!g.zombies.includes(o) && !g.fallen.includes(o))) {
          pool.delete(o);
          r.o = null;
          const spare = this.liveSpare || (this.liveSpare = []);
          if (spare.length < T.LIVE_SPARE) spare.push(r);
          else r.c.width = r.c.height = 0;
        }
      });
    },
    /** The walkers' own governor (js/interior.js governLive, on the walkers' time, not the ground's: pace softens the
        ground by its own): a row down after GOV_WAIT slow frames in a row (the smoothed ms of the walkers' renders
        and pictures over LIVE_BUDGET_MS), a row up after enough fast ones (under GOV_FAST of it, with the row's
        `near` or more on screen), the wait to climb back doubling for a row it had to leave (up to GOV_BACKOFF x).
        Only frames that drew walkers count; the first QUALITY_WAIT say nothing. */
    liveGovern() {
      const T = this.liveTune();
      const S = this.walkerStats;
      S.level = this.liveLevel | 0;
      // a frame that drew no picture anew (the road paused under a card or a menu: the same pictures put back up)
      // says nothing about what the walkers cost, as indoors (Interior.governLive)
      if (T === NO_GOVERNOR || !S.drawn || !S.renders) return;
      this.liveSmooth = this.liveSmooth == null ? S.ms : this.liveSmooth * 0.97 + S.ms * 0.03;
      this.liveN = (this.liveN || 0) + 1;
      if (this.liveN <= T.QUALITY_WAIT) return;
      const slow = this.liveSmooth > LIVE_BUDGET_MS;
      const fast = this.liveSmooth < LIVE_BUDGET_MS * (T.GOV_FAST || 0.75);
      const row = T.LIVE_LEVELS[this.liveLevel];
      this.liveSlowN = slow ? (this.liveSlowN || 0) + 1 : 0;
      if (!fast) this.liveFastN = 0;
      else if ((S.shown || 0) >= row.near) this.liveFastN = (this.liveFastN || 0) + 1;
      const upWait = this.liveUpWait;
      const at = this.liveLevel;
      let to = at;
      if (this.liveSlowN >= T.GOV_WAIT && at < T.LIVE_LEVELS.length - 1) {
        upWait[at] = Math.min(T.GOV_WAIT_UP * T.GOV_BACKOFF, (upWait[at] || T.GOV_WAIT_UP) * 2); // this row was too much
        to = at + 1;
      } else if (at > 0 && this.liveFastN >= (upWait[at - 1] || T.GOV_WAIT_UP)) to = at - 1;
      if (to !== at) {
        this.liveLevel = to;
        this.liveSlowN = this.liveFastN = 0;
      }
      S.level = this.liveLevel;
    },
    /** What lies under the walkers on the ground, under every body (drawWorld, before anything stands; main's road
        draws these first too): blood splats, each walker's shadow or, sped up by a scream, its frenzy's glow in the
        road's own colours (red, amber with gore off), and a downed walker's shadow while it goes over. One shadow:
        the figures draw none of their own (cam.shadow false). Faded into the haze with the ground, and in with a
        new walker. */
    walkerGround(g, ctx) {
      const M = ZSR.Walker3D;
      const haze = (Y) => this.fadeAt(Y);
      const D3 = ZSR.Draw3;
      const splat = D3 && D3.hasSprite && D3.hasSprite("bloodSplat") ? D3.sprite("bloodSplat") : null;
      for (const p of g.particles) {
        if (!p.splat) continue;
        const a = haze(this.local(p.x, p.y).Y) * clamp(p.life / p.maxLife, 0, 1);
        if (a <= 0.02) continue;
        ctx.globalAlpha = a;
        if (splat) {
          // Walker3D's splat, laid flat: its picture is drawn seen from a little above (3:1), so it is stood back up
          const s = p.size * 2.2;
          this.flat(ctx, p.x, p.y, 0, () => {
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot || 0);
            ctx.drawImage(splat, -s, -s * 0.8, 2 * s, 1.6 * s);
          });
        } else this.flat(ctx, p.x, p.y, 0, () => ZSR.Draw.particle(ctx, p));
      }
      const no = this.liveNo;
      const pool = this.livePool;
      if (!M || !pool) {
        ctx.globalAlpha = 1;
        return;
      }
      const gore = M.gore();
      for (const z of g.zombies) {
        const r = pool.get(z);
        if (!r || r.frame !== no) continue;
        const a = haze(r.foot.Y) * this.bornFade(g, z);
        if (a <= 0.02) continue;
        const fr = z.frenzyT > 0;
        const look = M.TYPES[z.type] || M.TYPES.walker;
        const sr = fr ? z.r * 1.15 : ((look && look.build.shadow) || 0.2) * TILE;
        ctx.globalAlpha = a;
        const across = (z.heading == null ? z.angle || 0 : z.heading) + Math.PI / 2;
        this.flat(ctx, z.x, z.y, 0, () => {
          ctx.fillStyle = fr ? (gore ? FRENZY_GORE : FRENZY_CLEAN) : SHADOW;
          ctx.beginPath();
          ctx.ellipse(z.x, z.y, sr, sr * 0.75, across, 0, TAU);
          ctx.fill();
        });
      }
      for (const f of g.fallen) {
        const r = pool.get(f);
        if (!r || r.frame !== no) continue;
        const a = haze(r.foot.Y) * clamp(f.life / (M.FADE_SECS || 0.7), 0, 1);
        if (a <= 0.02) continue;
        // as Walker3D lays its own: from under the feet to under the body as it goes over, longer as it lies, along
        // the way it went (forward for a fold or a kneel, else the way it was thrown)
        const go = clamp(fallAge(f) / (M.COLLAPSE_SECS || 0.9), 0, 1);
        const look = M.TYPES[f.type] || M.TYPES.walker;
        const sr = ((look && look.build.shadow) || 0.2) * TILE;
        const fwd = look && (look.fall === "fold" || look.fall === "kneel");
        const dir = fwd ? (f.heading == null ? (f.rot || 0) + Math.PI : f.heading) : f.rot || 0;
        const off = r.bh * TILE * (fwd ? 0.35 : 0.55) * go;
        const x = f.x + Math.cos(dir) * off;
        const y = f.y + Math.sin(dir) * off;
        ctx.globalAlpha = a;
        this.flat(ctx, x, y, 0, () => {
          ctx.fillStyle = SHADOW;
          ctx.beginPath();
          ctx.ellipse(x, y, sr * (1 + 1.4 * go), sr * 0.75 * (1 + 0.3 * go), dir, 0, TAU);
          ctx.fill();
        });
      }
      ctx.globalAlpha = 1;
    },
    /** A new walker fades in (FADE_IN): it comes out of the weeds or the haze. */
    bornFade(g, z) {
      return z.born == null ? 1 : clamp((g.time - z.born) / FADE_IN, 0, 1);
    },
    /** How see-through a walker's picture is this frame: faded into the haze with the ground by day (fade, from
        drawWorld), at night into the dark by its fog instead (only the far edge fades); fading in when new; and half
        see-through right behind the van's back doors (between it and the camera), so it never hides the van. */
    walkerAlpha(g, z, fade, Y) {
      const k = this.k;
      let a = g.mods && g.mods.night ? clamp((k.far - Y) / (k.far * NIGHT_EDGE), 0, 1) : fade;
      a *= this.bornFade(g, z);
      const van = g.van;
      const fx = Math.cos(van.heading);
      const fy = Math.sin(van.heading);
      const ly = (z.x - van.x) * fx + (z.y - van.y) * fy;
      const lx = (z.x - van.x) * -fy + (z.y - van.y) * fx;
      if (ly < -van.h / 2 + 6 && ly > -van.h / 2 - 140 && Math.abs(lx) < van.w / 2 + z.r) a *= 0.45;
      return a;
    },
    /** A walker standing (from the sorted list, far to near): its picture at its feet, then its health bar. */
    walker(g, ctx, z, fade) {
      const r = this.livePool && this.livePool.get(z);
      if (!r || r.frame !== this.liveNo || !r.lh) return;
      const a = this.walkerAlpha(g, z, fade == null ? 1 : fade, r.foot.Y);
      r.alpha = a;
      if (a <= 0.02) return;
      const t0 = performance.now();
      this.blitFigure(ctx, r, a);
      this.healthBar(ctx, r, z, a);
      this.walkerStats.ms += performance.now() - t0;
      this.walkerStats.drawn++;
    },
    /** A downed walker (game.js fallen): its figure going over its kind's way, lying (its pool under it with gore on),
        then fading over Walker3D's FADE_SECS, once (the fade is the picture's alone). */
    downed(g, ctx, f, fade) {
      const M = ZSR.Walker3D;
      const r = this.livePool && this.livePool.get(f);
      if (!M || !r || r.frame !== this.liveNo || !r.lh) return;
      const k = this.k;
      const edge = g.mods && g.mods.night ? clamp((k.far - r.foot.Y) / (k.far * NIGHT_EDGE), 0, 1) : fade == null ? 1 : fade;
      const a = edge * clamp(f.life / (M.FADE_SECS || 0.7), 0, 1);
      r.alpha = a;
      if (a <= 0.02) return;
      const t0 = performance.now();
      this.blitFigure(ctx, r, a);
      this.walkerStats.ms += performance.now() - t0;
      this.walkerStats.drawn++;
    },
    /** A picture up on the screen at its feet: as wide as a tile is there and as tall as the camera shows its box (the
        pitched camera shows an upright about 0.74 of its width beside the van, 1.1 far off), leaning LEAN of the
        camera's upright lines; the room under its feet (seen from above) goes below them. An older picture (one
        taking turns) is placed and scaled the same way at the walker's spot now. */
    blitFigure(ctx, r, a) {
      const sx = r.upx / r.lrpx;
      const sy = r.hpx / r.bh / r.lrpx;
      const lean = (-(r.top.x - r.foot.x) / r.hpx) * LEAN;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.transform(sx, 0, lean * sy, sy, r.foot.x, r.foot.y);
      ctx.drawImage(r.c, 0, 0, r.lw, r.lh, -r.lw / 2, r.lfl - r.lh, r.lw, r.lh);
      ctx.restore();
    },
    /** A hurt walker's health bar, level, just over the top of its head (its look's head top, as in the interiors),
        as wide as its hit circle (as on main's road). */
    healthBar(ctx, r, z, a) {
      if (!(z.hp < z.maxHp) || !(z.maxHp > 0)) return;
      const t = r.head / r.bh;
      const x = r.foot.x + (r.top.x - r.foot.x) * LEAN * t;
      const bh = clamp(4 * r.foot.s, 2, 5);
      const y = r.foot.y - r.hpx * t - 3 - bh;
      const bw = Math.max(8, 2 * z.r * r.foot.s);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = INK;
      ctx.fillRect(x - bw / 2 - 1, y - 1, bw + 2, bh + 2);
      ctx.fillStyle = "#b3261e";
      ctx.fillRect(x - bw / 2, y, bw * clamp(z.hp / z.maxHp, 0, 1), bh);
      ctx.restore();
    },
    /** Something flying (from the sorted list, at its own depth): a drop of blood in the air, Walker3D's drop standing
        at its height (as on foot); a spark or a chip at its height; kill dust on the road. */
    flying(g, ctx, p) {
      const D3 = ZSR.Draw3;
      if (p.blood && p.z != null && D3 && D3.hasSprite && D3.hasSprite("bloodDrop")) {
        const at = this.project(p.x, p.y, p.z);
        if (!at || at.s > NEAR_PX) return;
        const h = Math.max(1.5, p.size * 2.2 * at.s);
        ctx.drawImage(D3.sprite("bloodDrop"), at.x - h / 3, at.y - h / 2, (2 * h) / 3, h);
        return;
      }
      this.flat(ctx, p.x, p.y, p.z != null ? p.z : 4, () => ZSR.Draw.particle(ctx, p));
    },
    /** The van as one closed box: walls in the yard van's own faces (cab and body down each side, the doors at the
        back, the nose at the front), the road's top-down art laid on the roof, every edge where its neighbour's is,
        and the roof gun standing on top. */
    van(g, ctx) {
      const D = ZSR.Draw;
      const T = (kind) => ZSR.Draw3.texture(kind, null, null, TEX_RES);
      const van = g.van;
      const fx = Math.cos(van.heading);
      const fy = Math.sin(van.heading);
      // the van's own frame, as sprites.js draws it: x to its right, y toward its back
      const L = (lx, ly) => [van.x - fy * lx - fx * ly, van.y + fx * lx - fy * ly];
      const at = (z, fn) => {
        const e = 4;
        const a = L(e, 0);
        const b = L(0, e);
        const p0 = this.project(van.x, van.y, z);
        const pa = this.project(a[0], a[1], z);
        const pb = this.project(b[0], b[1], z);
        if (!p0 || !pa || !pb) return;
        ctx.save();
        ctx.transform((pa.x - p0.x) / e, (pa.y - p0.y) / e, (pb.x - p0.x) / e, (pb.y - p0.y) / e, p0.x, p0.y);
        fn();
        ctx.restore();
      };
      at(0, () => {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        D.rr(ctx, -30, -54, 72, 126, 10);
        ctx.fill();
      });
      const FL = L(-33, -59);
      const FR = L(33, -59);
      const BR = L(33, 59);
      const BL = L(-33, 59);
      // each wall as seen from outside, left to right: the nose is on the left of the yard van's side faces
      // the end faces leave a sliver clear down each side: crop it, so the corners close
      const END = [2 / 64, 62 / 64];
      const walls = [
        [BL, BR, [{ img: T("vanBack"), crop: END }]],
        [FL, BL, [{ img: T("vanCab") }, { img: T("vanBody") }]],
        [BR, FR, [{ img: T("vanBodyR"), flip: true }, { img: T("vanCab"), flip: true }]],
        [FR, FL, [{ img: T("vanFront"), crop: END }]],
      ];
      ctx.imageSmoothingQuality = "medium";
      for (const [left, right, pieces] of walls) if (this.faces(left, right, van.x, van.y)) this.texWall(ctx, left, right, 0, VAN_Z, pieces);
      this.roof(g, ctx, L);
      this.poly(ctx, [FL, FR, BR, BL].map((c) => c.concat(VAN_Z)), null, 3);
      this.gun(g, ctx);
    },
    /** The van's roof: the road's top-down van (paint, decal, windows, rack, the hurt flash) drawn into the van's
        own footprint, then laid on the walls' top edges in strips front to back, so its corners are theirs. */
    roof(g, ctx, L) {
      const D = ZSR.Draw;
      const van = g.van;
      const u = g.upgrades || ZSR.State.save.upgrades;
      const looks = ZSR.Upgrades.PAINT_LOOKS;
      const R = TEX_RES;
      const c = this.roofCanvas || (this.roofCanvas = document.createElement("canvas"));
      if (c.width !== 66 * R) {
        c.width = 66 * R;
        c.height = 118 * R;
      }
      const x = c.getContext("2d");
      x.setTransform(R, 0, 0, R, 33 * R, 59 * R);
      x.fillStyle = looks[Math.min(u.paint || 0, looks.length - 1)].body;
      x.fillRect(-33, -59, 66, 118);
      const aimW = van.aimW == null ? van.heading : van.aimW;
      D.van(x, 0, 0, { upgrades: u, aim: aimW - van.heading - Math.PI / 2, t: g.time, hurt: van.hurt, flash: van.flash, scale: 1, moving: !(g.arrive && g.arrive.parked), gun: false });
      const N = 6;
      const step = 118 / N;
      for (let j = 0; j < N; j++) {
        const y0 = -59 + j * step;
        const a = L(-33, y0);
        const b = L(33, y0);
        const d = L(-33, y0 + step);
        const tl = this.project(a[0], a[1], VAN_Z);
        const tr = this.project(b[0], b[1], VAN_Z);
        const bl = this.project(d[0], d[1], VAN_Z);
        if (!tl || !tr || !bl) return;
        ctx.save();
        // (in the picture's own pixels, as texWall)
        const sw = 66 * R;
        const sh = step * R;
        ctx.transform((tr.x - tl.x) / sw, (tr.y - tl.y) / sw, (bl.x - tl.x) / sh, (bl.y - tl.y) / sh, tl.x, tl.y);
        ctx.drawImage(c, 0, j * sh, sw, sh, 0, 0, sw, j < N - 1 ? sh * 1.04 : sh);
        ctx.restore();
      }
    },
    /** The roof gun standing on the van: a ring and a post, then the barrels along the aim and tipped down toward it,
        a flash at their tips as it fires. Every gun upgrade shows (as on the old top-down van): Spread Shot adds
        barrels, Heavier Rounds lengthen them (a muzzle brake from 3), Rate of Fire puts a jacket round them (1; copper at
        5), a drum beside the breech (2; bigger, with a brass ring, at 4) and cooling fins on the jacket (3). */
    gun(g, ctx) {
      const D = ZSR.Draw;
      const van = g.van;
      const u = g.upgrades || ZSR.State.save.upgrades;
      const mx = van.x - Math.cos(van.heading) * van.h * 0.1;
      const my = van.y - Math.sin(van.heading) * van.h * 0.1;
      this.flat(ctx, mx, my, VAN_Z, () => D.circle(ctx, mx, my, 13, "#2f3136", 3));
      this.column(ctx, mx, my, VAN_Z, GUN_Z, 5, 5, "#3a3d42", 2);
      const p0 = this.project(mx, my, GUN_Z);
      if (!p0) return;
      const aim = van.aimW == null ? van.heading : van.aimW;
      const dz = van.aimDz || 0;
      const n = 1 + (u.spread || 0);
      const len = 26 + (u.damage || 0) * 3;
      const rof = u.fireRate || 0;
      const w = 5.5 * p0.s;
      // a point along the aim (l ahead of the breech, x to its right), on the screen
      const ax = Math.cos(aim);
      const ay = Math.sin(aim);
      const along = (l, x) => this.project(mx + ax * l - ay * x, my + ay * l + ax * x, GUN_Z + dz * l);
      const stroke = (a, b, lw, c) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      };
      const breech = () => D.circle(ctx, p0.x, p0.y, 7.5 * p0.s, "#2f3136", 2.5);
      // aimed back toward the camera, the barrels are in front of the breech
      const back = ax * this.k.Fx + ay * this.k.Fy < 0;
      const drum = () => {
        if (rof < 2) return;
        const big = rof >= 4;
        const c = along(-3, 14);
        if (!c) return;
        const r = (big ? 9.5 : 7) * c.s;
        D.circle(ctx, c.x, c.y, r, big ? "#3a3d42" : "#5d636b", 2.5);
        D.circle(ctx, c.x, c.y, r * 0.4, "#2f3136", 2);
        if (big) for (let q = 0; q < 8; q++) D.circle(ctx, c.x + Math.cos((q * TAU) / 8) * r * 0.72, c.y + Math.sin((q * TAU) / 8) * r * 0.72, Math.max(0.8, 1.1 * c.s), "#d9a21b", 0.5);
      };
      if (back) {
        drum();
        breech();
      }
      ctx.lineCap = "round";
      const tips = [];
      const step = van.aimSpread == null ? ZSR.Upgrades.SPREAD : van.aimSpread;
      for (let i = 0; i < n; i++) {
        const a = aim + (i - (n - 1) / 2) * step;
        const p1 = this.project(mx + Math.cos(a) * len, my + Math.sin(a) * len, GUN_Z + dz * len);
        if (!p1) continue;
        [[w + 3.5, INK], [w, "#4b5057"], [w * 0.3, "rgba(255,255,255,0.28)"]].forEach(([lw, c]) => stroke(p0, p1, lw, c));
        if ((u.damage || 0) >= 3) {
          // a muzzle brake at the tip
          const q = this.project(mx + Math.cos(a) * (len - 6), my + Math.sin(a) * (len - 6), GUN_Z + dz * (len - 6));
          if (q) [[w * 1.6 + 3, INK], [w * 1.6, "#5a5d66"]].forEach(([lw, c]) => stroke(q, p1, lw, c));
        }
        tips.push(p1);
      }
      if (rof >= 1) {
        // the jacket round the barrels' roots (short of their tips), as wide as they fan out along it
        const jl = Math.min(len - 15, 9 + rof * 1.2);
        const half = ((n - 1) / 2) * step * (7 + jl) + 4;
        const a = along(7, 0);
        const b = along(7 + jl, 0);
        if (a && b) {
          const jw = 2 * half * p0.s;
          ctx.lineCap = "butt"; // (square ends: the barrels' tips show past it)
          stroke(a, b, jw + 3, INK);
          stroke(a, b, jw, rof >= 5 ? "#b8733a" : "#4b5057");
          if (rof >= 3) {
            for (let q = 0; q < 3; q++) {
              const l = 9 + (q * jl) / 3;
              const f0 = along(l, -half - 3.5);
              const f1 = along(l, half + 3.5);
              if (f0 && f1) stroke(f0, f1, Math.max(1, 2 * p0.s), rof >= 5 ? "#e0a066" : "#9ea3aa");
            }
          }
          ctx.lineCap = "round";
        }
      }
      if (!back) {
        drum();
        breech();
      }
      if (van.flash > 0) for (const t of tips) D.circle(ctx, t.x, t.y, 8 * t.s, "#ffd25a", 2);
    },

    /** The whole world for one frame (game.js draw): the ground (on the card when there is one), what lies on it
        and changes, everything standing far to near, then shots in the air. */
    drawWorld(g, ctx, theme) {
      const t0 = performance.now();
      const k = this.setup(g);
      this.frameNo = (this.frameNo || 0) + 1;
      const B = ZSR.PerspBuild;
      const haze = this.haze(g);
      const GL = ZSR.PerspGL;
      if (GL && GL.draw(g, this, theme, haze)) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
        this.sky(ctx, haze, g.mods.night);
      } else {
        if (GL) GL.hide(g);
        this.drawWorldGround(g, ctx, theme);
        this.pace(performance.now() - t0);
      }
      const t1 = performance.now();
      // the walkers' pictures for this frame (each drawn again only when it looks different), then what lies on the
      // road under every body: splats, shadows and frenzy glows
      this.walkerFrame(g);
      this.walkerGround(g, ctx);
      // the overgrowth over this drive's land: a square made the first time the view reaches it, let go once left
      const Art = ZSR.PerspArt;
      if (Art && Art.vegLayout && (!this.vegLayout || this.vegLayout.drive !== g.drive)) this.vegLayout = Art.vegLayout(g.drive, VEG_CELL);
      const VL = Art && Art.vegLayout ? this.vegLayout : null;
      const vegNo = (this.vegNo = (this.vegNo || 0) + 1);
      const made0 = VL ? VL.stats.made : 0;
      const sc = this.sceneryRow(g);
      const list = this.list || (this.list = []);
      list.length = 0;
      const yMin = this.groundY(k.H) - 260;
      const fog0 = k.fog0;
      const gone = fog0 + 0.98 * (k.far - fog0); // past this all is haze
      // margin: px past the screen's sides a thing's foot may stand and still be drawn (size: its own reach, world units)
      const add = (o, t, x, y, back, size, margin) => {
        const dx = x - k.ox;
        const dy = y - k.oy;
        const Y = dx * k.Fx + dy * k.Fy;
        if (Y < yMin - (size || 0) || Y > k.far + 150 + (size || 0) || Y + (back || 0) >= gone) return;
        const X = dx * k.Rx + dy * k.Ry;
        if (Math.abs(X) > ((k.W / 2 + (margin == null ? 300 : margin)) * this.depthAt(Math.max(Y, yMin))) / k.f + (size || 0)) return;
        o._t = t;
        o._Y = Y + (back || 0);
        list.push(o);
      };
      // plants, then props: only the squares under the view (a square's whole reach, its half-diagonal, against the
      // view's trapezoid: the screen's width at each depth, plus a plant's own height for its width and its lean),
      // each made the first time the view reaches it; then each thing on its own (add)
      // (margin: px past the screen's sides, as add's; reach: world units a thing may stand off its square's middle
      // past the square's half-diagonal and still show)
      const under = (C, reach, margin, fn) => {
        const ya = yMin - reach;
        const hw = ((k.W / 2 + margin) * this.depthAt(gone)) / k.f + reach;
        let x0 = Infinity;
        let x1 = -Infinity;
        let y0 = Infinity;
        let y1 = -Infinity;
        for (const [Y, X] of [[ya, -hw], [ya, hw], [gone, -hw], [gone, hw]]) {
          const x = k.ox + k.Rx * X + k.Fx * Y;
          const y = k.oy + k.Ry * X + k.Fy * Y;
          x0 = Math.min(x0, x);
          x1 = Math.max(x1, x);
          y0 = Math.min(y0, y);
          y1 = Math.max(y1, y);
        }
        const r = C * 0.7072 + reach;
        for (let cx = Math.floor(x0 / C); cx <= Math.floor(x1 / C); cx++) {
          for (let cy = Math.floor(y0 / C); cy <= Math.floor(y1 / C); cy++) {
            const dx = (cx + 0.5) * C - k.ox;
            const dy = (cy + 0.5) * C - k.oy;
            const Y = dx * k.Fx + dy * k.Fy;
            if (Y < yMin - r || Y > gone + r) continue;
            const X = dx * k.Rx + dy * k.Ry;
            if (Math.abs(X) > ((k.W / 2 + margin) * this.depthAt(Math.max(yMin, Y + r))) / k.f + r) continue;
            fn(cx, cy);
          }
        }
      };
      if (VL) {
        // (a plant stands at most 240 tall, and a verge's second clump of grass lies up to 36 outside its square)
        under(VEG_CELL, 300, 40, (cx, cy) => {
          for (const o of VL.get(cx, cy, vegNo)) add(o, "plant", o.x, o.y, 0, o.h, 40);
        });
        // squares the view has left for a while are let go
        if (vegNo % 60 === 0) VL.sweep(vegNo - VEG_IDLE);
      }
      const PI = this.propIndex(g);
      const addProp = (p) => {
        if (p.kind !== "tire" && p.kind !== "rubble") add(p, "prop", p.x, p.y);
      };
      if (isFinite(PI.B)) under(PI.B, 0, 300, (cx, cy) => PI.each(cx, cy, addProp));
      else PI.each(0, 0, addProp);
      for (const c of g.crates) add(c, "crate", c.x, c.y);
      // a building by its own middle (its lot's front can be behind the camera while the building is in view); each
      // place's own (js/perspective-buildings.js) by its parts' middle, with the side streets' ends standing
      if (B) B.collect(g, this, add);
      else {
        const G = ZSR.Streets.GEOM;
        const mid = G.half + G.shoulder + G.lotGap + 168 + (G.lotDepth - 186) / 2;
        for (const l of g.drive.lots) add(l, "lot", l.qx - l.uy * l.side * mid, l.qy + l.ux * l.side * mid, 0, 260);
      }
      for (const z of g.zombies) add(z, "walker", z.x, z.y);
      if (ZSR.Walker3D) {
        // a body is sorted by its feet, the van by its middle: one the van has driven onto (its feet or the far end of
        // it lying there inside the van's box) goes under the van, just before it, as the old flat road laid its fallen
        // under everything standing
        const v = g.van;
        const vx = Math.cos(v.heading);
        const vy = Math.sin(v.heading);
        const vanY = (v.x - k.ox) * k.Fx + (v.y - k.oy) * k.Fy;
        const under = (x, y) => {
          const dx = x - v.x;
          const dy = y - v.y;
          return Math.abs(dx * vx + dy * vy) < v.h / 2 + 10 && Math.abs(dy * vx - dx * vy) < v.w / 2 + 10;
        };
        const M = ZSR.Walker3D;
        for (const f of g.fallen) {
          const Y = (f.x - k.ox) * k.Fx + (f.y - k.oy) * k.Fy;
          let back = 0;
          if (Y < vanY + 1) {
            // where it lies to (as walkerGround lays its shadow: forward for a fold or a kneel, else the way it was
            // thrown)
            const look = M.TYPES[f.type] || M.TYPES.walker;
            const fwd = look && (look.fall === "fold" || look.fall === "kneel");
            const dir = fwd ? (f.heading == null ? (f.rot || 0) + Math.PI : f.heading) : f.rot || 0;
            const len = M.box(f.type, true).h * TILE * clamp(fallAge(f) / (M.COLLAPSE_SECS || 0.9), 0, 1);
            if (under(f.x, f.y) || under(f.x + Math.cos(dir) * len, f.y + Math.sin(dir) * len)) back = vanY + 1 - Y;
          }
          add(f, "downed", f.x, f.y, back);
        }
      }
      // what flies (blood, sparks, kill dust) at its own depth: a body in front of it covers it, it covers one behind
      for (const p of g.particles) if (!p.splat) add(p, "flying", p.x, p.y);
      if (g.gameOverAt == null || g.gameOverAt > 0.9) add(g.van, "van", g.van.x, g.van.y);
      // what stands by a building goes before it, after it, or between its parts (drawn there: _skip)
      for (const o of list) o._skip = null;
      if (B) B.order(g, this, list);
      list.sort((a, b) => b._Y - a._Y);
      // the pictures' sampling by the scenery governor's row ('medium': mipmapped; 'low', on a slow machine: not)
      ctx.imageSmoothingQuality = sc.smooth;
      // a far prop's detail fades out over LOD_BAND from LOD_AT into the haze band (the governor's lod brings it in;
      // drawItem reads it, also for what a building draws among its parts)
      this.lodFrom = fog0 + (1 - this.scen.cur.lod) * LOD_AT * (k.far - fog0);
      this.plantsDrawn = 0;
      this.propsDrawn = 0;
      // a landmark past the haze, as a silhouette on its far edge, behind everything standing
      if (B) B.skyline(g, this, ctx);
      for (const o of list) {
        if (o._skip) continue;
        // far things go into the haze with the ground
        const fade = o._Y > fog0 ? 1 - clamp((o._Y - fog0) / (k.far - fog0), 0, 1) : 1;
        if (fade <= 0.02) continue;
        this.drawItem(g, ctx, o, fade);
      }
      ctx.globalAlpha = 1;
      this.liveGovern();
      for (const b of g.bullets) this.flat(ctx, b.x, b.y, b.z == null ? AIM_Z : b.z, () => ZSR.Draw.bullet(ctx, b));
      const fs = this.frameStats;
      fs.groundMs = t1 - t0;
      fs.worldMs = performance.now() - t1;
      fs.walkersMs = this.walkerStats.ms;
      fs.squaresMade = GL && GL.on && GL.stats ? GL.stats.made + GL.stats.ahead : 0;
      fs.plants = this.plantsDrawn;
      fs.props = this.propsDrawn;
      fs.vegSquares = VL ? VL.cells.size : 0;
      fs.vegMade = VL ? VL.stats.made - made0 : 0;
      this.drawnFor = g.drive;
    },
    /** Is this drive's view ready for the van to pull out (game.js prepStep)? Drawn at least once, and on the card
        every square under the view drawn at its sharpness and those the views just ahead need (js/perspective-gl.js
        stats); without the card the 2D ground has nothing to make ahead. The plants under the view are made as it is
        drawn. */
    ready(g) {
      if (this.drawnFor !== g.drive) return false;
      const GL = ZSR.PerspGL;
      if (!GL || !GL.on || !GL.ok) return true;
      const st = GL.stats;
      return !!st && st.drive === g.drive && st.want === st.made && !st.holes && st.aheadLeft === 0;
    },
    /** A drive has really stopped (game.js stop: parked at the door, dead, off to the map or the title; never a wrong
        turn's retry, which keeps the drive): let go of what only a drive needs, so a parked game holds none of it: the
        ground squares on the card (js/perspective-gl.js release), the plants' squares, the props' index, the walkers'
        canvases, the 2D ground's layers and the night's. The next drive makes them again. */
    release() {
      const GL = ZSR.PerspGL;
      if (GL && GL.release) GL.release();
      this.vegLayout = null;
      this.propIdx = null;
      this.propsFor = null;
      this.drawnFor = null;
      for (const a of [this.list, this.liveQ, this.liveNearQ, this.liveWait]) if (a) a.length = 0;
      const free = (r) => {
        if (r && r.c) r.c.width = r.c.height = 0;
        if (r) r.o = null;
      };
      if (this.livePool) {
        this.livePool.forEach(free);
        this.livePool.clear();
      }
      if (this.liveSpare) {
        this.liveSpare.forEach(free);
        this.liveSpare.length = 0;
      }
      for (const c of this.canvases) c.width = c.height = 0;
      if (this.nightLayer) this.nightLayer.width = this.nightLayer.height = 0;
      this.nightKey = null;
    },
    /** The scenery governor (SCENERY_LEVELS, see SCENERY_BUDGET_MS), once a frame the page drew (game.js frame sets
        g.rafMs, the time since the last frame, and g.rafN, its count): eases this.scen.cur toward its row and, on a
        frame that says something about the drive's cost, smooths the interval and steps the row. Not a drive's cost:
        a gap over SCENERY_GAP_MAX, a pause or the wrong-turn fade, the van waiting at its door while its first view is
        made (g.prep), its first SCENERY_WARM_SECS. A page drawn without frames (a test) goes straight to its row.
        Returns this frame's row. */
    sceneryRow(g) {
      const S = this.scen || (this.scen = { level: 0, cur: Object.assign({}, SCENERY_LEVELS[0]), smooth: 0, slowT: 0, fastT: 0, holdT: 0, upWait: [], rafN: null, drive: null, warm: 0, liveAt: null });
      const L = SCENERY_LEVELS;
      S.level = clamp(S.level | 0, 0, L.length - 1);
      const fresh = g.rafN != null && g.rafN !== S.rafN;
      S.rafN = g.rafN;
      const gap = fresh ? +g.rafMs || 0 : 0;
      if (S.drive !== g.drive) {
        S.drive = g.drive;
        S.warm = 0;
        S.slowT = S.fastT = 0;
      }
      this.sceneryEase(g.rafN == null ? Infinity : gap / 1000);
      const fs = this.frameStats;
      fs.scenery = S.level;
      fs.gapMs = S.smooth;
      if (!(gap > 0) || gap > SCENERY_GAP_MAX || g.paused || g.fade || g.prep) return L[S.level];
      const secs = gap / 1000;
      S.warm += secs;
      if (S.warm < SCENERY_WARM_SECS) return L[S.level];
      // the walkers' governor changed its row: start over (that change is not the scenery's cost)
      const wl = this.liveLevel | 0;
      if (S.liveAt !== wl) {
        if (S.liveAt != null) S.holdT = Math.max(S.holdT, SCENERY_HOLD_SECS);
        S.liveAt = wl;
        S.slowT = S.fastT = 0;
      }
      // the interval, smoothed over about half a second
      S.smooth = S.smooth > 0 ? S.smooth + (gap - S.smooth) * (1 - Math.exp(-gap / 500)) : gap;
      fs.gapMs = S.smooth;
      if (S.holdT > 0) {
        S.holdT -= secs;
        return L[S.level];
      }
      S.slowT = S.smooth > SCENERY_BUDGET_MS ? S.slowT + secs : 0;
      S.fastT = S.smooth < SCENERY_BUDGET_MS * SCENERY_FAST ? S.fastT + secs : 0;
      const at = S.level;
      let to = at;
      if (S.slowT >= SCENERY_SLOW_SECS && at < L.length - 1) {
        S.upWait[at] = Math.min(SCENERY_UP_SECS * SCENERY_BACKOFF, (S.upWait[at] || SCENERY_UP_SECS) * 2); // this row was too much
        to = at + 1;
      } else if (at > 0 && S.fastT >= (S.upWait[at - 1] || SCENERY_UP_SECS)) to = at - 1;
      if (to !== at) {
        S.level = to;
        S.slowT = S.fastT = 0;
        S.holdT = SCENERY_HOLD_SECS;
      }
      fs.scenery = S.level;
      return L[S.level];
    },
    /** The governor's eased setting a step of `secs` toward its row (Infinity: all the way). */
    sceneryEase(secs) {
      const S = this.scen;
      const row = SCENERY_LEVELS[S.level];
      for (const key of ["minPx", "thin", "lod", "shadows"]) {
        const step = SCENERY_EASE[key] * secs;
        const v = S.cur[key];
        S.cur[key] = Math.abs(row[key] - v) <= step ? row[key] : v + Math.sign(row[key] - v) * step;
      }
      S.cur.smooth = row.smooth;
    },
    /** One thing from drawWorld's far-to-near list (or from among a building's parts), faded into the haze by fade. */
    drawItem(g, ctx, o, fade) {
      ctx.globalAlpha = fade;
      if (o._t === "plant") this.plantsDrawn += this.plant(ctx, o, fade) ? 1 : 0;
      else if (o._t === "prop") this.propsDrawn += this.prop(ctx, o, 1 - clamp((o._Y - this.lodFrom) / LOD_BAND, 0, 1)) ? 1 : 0;
      else if (o._t === "crate") this.crate(ctx, o);
      else if (o._t === "lot") {
        if (!ZSR.PerspBuild || !ZSR.PerspBuild.draw(g, ctx, this, o, fade)) this.building(ctx, o);
      } else if (o._t === "end") ZSR.PerspBuild.drawEnd(g, ctx, this, o, fade);
      else if (o._t === "walker") this.walker(g, ctx, o, fade);
      else if (o._t === "downed") this.downed(g, ctx, o, fade);
      else if (o._t === "flying") this.flying(g, ctx, o);
      else this.van(g, ctx);
    },
    /** Slow frames (a computer without a graphics card) get softer ground layers; a check every 30 frames. */
    pace(ms) {
      this.ms = this.ms == null ? ms : this.ms * 0.9 + ms * 0.1;
      this.frames = (this.frames || 0) + 1;
      if (this.frames % 30) return;
      if (this.ms > 18 && this.res > 0.6) this.res = Math.max(0.6, this.res - 0.1);
      else if (this.ms < 9 && this.res < 1) this.res = Math.min(1, this.res + 0.1);
    },
    /** The names over the buildings, upright: smaller far off, never too small to read (each place's own building
        carries its name on its sign: js/perspective-buildings.js names). */
    drawNames(g, ctx, k) {
      if (ZSR.PerspBuild) return ZSR.PerspBuild.names(g, this, ctx, k);
      const G = ZSR.Streets.GEOM;
      g.drive.lots.forEach((l) => {
        const v0 = G.half + G.shoulder + G.lotGap + 168;
        const p = this.project(l.qx - l.uy * l.side * v0, l.qy + l.ux * l.side * v0, 178);
        if (!p || p.Y > this.k.far || p.x < -200 || p.x > g.W + 200 || p.y < -60 || p.y > g.H + 60) return;
        const name = ZSR.State.isKnown(l.node) ? g.placeName(l.node).toUpperCase() : "?";
        ZSR.Draw.nameBoard(ctx, p.x, p.y, name, Math.max(g.zoom, k * 0.8) * clamp(p.s / (g.zoom * this.cfg.scale), 0.6, 1.2), false);
      });
    },
    /** The night over the frame (game.js draw, after the world): NIGHT_DARK everywhere but what the van lights, each
        laid on the ground and seen through this camera, so the beam turns with the van, not with the screen: a glow
        round the van, its headlights' beam down its own heading (NIGHT_BEAM: bright to beamFull of its reach, then
        fading out) and the roof gun's lamp along its aim. The dark is a layer the size of the screen, drawn again only
        when what it shows moves: its key is the shapes' corners on the screen to the pixel (the aim to about a degree),
        so on a straight with the aim held it goes up as it was (on a canvas drawn by the CPU, drawing it took about 7 ms
        a frame). nightStats counts the layers drawn and reused. */
    night(g, ctx) {
      const k = this.setup(g);
      const N = NIGHT_BEAM;
      const van = g.van;
      const dpr = g.dpr || 1;
      const fx = Math.cos(van.heading);
      const fy = Math.sin(van.heading);
      const gp = (x, y) => this.project(x, y, 0);
      // the beam: a strip of ground from beamFrom ahead of the van's middle out to its reach, opening as it goes
      const d0 = N.beamFrom;
      const d1 = N.reach;
      const w1 = N.beamHalf + N.beamOpen * (d1 - d0);
      const at = (d, w) => gp(van.x + fx * d - fy * w, van.y + fy * d + fx * w);
      const beam = [at(d0, -N.beamHalf), at(d1, -w1), at(d1, w1), at(d0, N.beamHalf)];
      const axis = [at(d0, 0), at(d1, 0)];
      // the glow round the van (where its edge is, along its own axes), and the gun's lamp: a fan along the aim
      const vs = gp(van.x, van.y);
      const glow = [gp(van.x + fx * N.glow, van.y + fy * N.glow), gp(van.x - fy * N.glow, van.y + fx * N.glow)];
      const mx = van.x - fx * van.h * 0.1;
      const my = van.y - fy * van.h * 0.1;
      const aim = Math.round((van.aimW == null ? van.heading : van.aimW) * 57.3) / 57.3;
      const lamp = [gp(mx, my)];
      for (let i = 0; i <= 6; i++) {
        const a = aim - N.lampHalf + (i / 6) * 2 * N.lampHalf;
        lamp.push(gp(mx + Math.cos(a) * N.lamp, my + Math.sin(a) * N.lamp));
      }
      const lampTip = gp(mx + Math.cos(aim) * N.lamp, my + Math.sin(aim) * N.lamp);
      this.nightBeam = axis.every(Boolean) ? axis : null; // (its line on the screen, for tests)
      const all = beam.concat(axis, [vs], glow, lamp, [lampTip]);
      const ok = (pts) => pts.every((p) => p);
      let key = k.W + "x" + k.H + "@" + dpr;
      for (const p of all) key += p ? "|" + Math.round(p.x) + "," + Math.round(p.y) : "|-";
      const S = this.nightStats || (this.nightStats = { drawn: 0, reused: 0 });
      let L = this.nightLayer;
      const w = Math.round(k.W * dpr);
      const h = Math.round(k.H * dpr);
      if (!L || L.width !== w || L.height !== h) {
        L = this.nightLayer = this.nightLayer || document.createElement("canvas");
        L.width = w;
        L.height = h;
        this.nightKey = null;
      }
      if (key !== this.nightKey) {
        this.nightKey = key;
        S.drawn++;
        const c = L.getContext("2d");
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.globalCompositeOperation = "source-over";
        c.clearRect(0, 0, k.W, k.H);
        c.fillStyle = NIGHT_DARK;
        c.fillRect(0, 0, k.W, k.H);
        c.globalCompositeOperation = "destination-out";
        const fan = (pts) => {
          c.beginPath();
          pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
          c.closePath();
          c.fill();
        };
        if (vs && ok(glow)) {
          // a soft disc on the ground round the van: its glow0 to glow, as the ground's own scale squeezes it
          const ax = [glow[0].x - vs.x, glow[0].y - vs.y];
          const ay = [glow[1].x - vs.x, glow[1].y - vs.y];
          c.save();
          c.transform(ay[0] / N.glow, ay[1] / N.glow, ax[0] / N.glow, ax[1] / N.glow, vs.x, vs.y);
          const rg = c.createRadialGradient(0, 0, N.glow0, 0, 0, N.glow);
          rg.addColorStop(0, "rgba(0,0,0,1)");
          rg.addColorStop(1, "rgba(0,0,0,0)");
          c.fillStyle = rg;
          c.fillRect(-N.glow, -N.glow, 2 * N.glow, 2 * N.glow);
          c.restore();
        }
        if (ok(beam) && ok(axis)) {
          // bright to beamFull of the way, then fading out: stops placed where those distances are on the screen
          const [a, b] = axis;
          const ux = b.x - a.x;
          const uy = b.y - a.y;
          const L2 = ux * ux + uy * uy || 1;
          const lg = c.createLinearGradient(a.x, a.y, b.x, b.y);
          for (const f of [0, N.beamFull, 0.5, 0.7, 0.85, 1]) {
            const p = at(d0 + f * (d1 - d0), 0);
            if (!p) continue;
            const t = clamp(((p.x - a.x) * ux + (p.y - a.y) * uy) / L2, 0, 1);
            const u = clamp((f - N.beamFull) / (1 - N.beamFull), 0, 1);
            lg.addColorStop(t, "rgba(0,0,0," + (0.95 * (1 - u * u * (3 - 2 * u))).toFixed(3) + ")");
          }
          c.fillStyle = lg;
          fan(beam);
        }
        if (ok(lamp) && lampTip) {
          const lg = c.createLinearGradient(lamp[0].x, lamp[0].y, lampTip.x, lampTip.y);
          lg.addColorStop(0, "rgba(0,0,0,0.9)");
          lg.addColorStop(1, "rgba(0,0,0,0)");
          c.fillStyle = lg;
          fan(lamp);
        }
        c.globalCompositeOperation = "source-over";
      } else S.reused++;
      ctx.drawImage(L, 0, 0, k.W, k.H);
    },
    /** The title screen's and the garage's still scene (game.js showcase) on `canvas`: the van on a straight road
        through this camera, in the paint and upgrades given (o.upgrades), its gun on the nearer walker, o.kinds
        coming at it (Walker3D figures, as on the road: a screamer screams), a wreck, a barrier and the roadside going
        into the haze. Drawn only when what it shows changes (the canvas's size, the upgrades, the kinds, o.seed): the
        title's loop asks every frame and nearly always finds its picture already there. True if it drew. */
    showcase(canvas, o) {
      const key = canvas.width + "x" + canvas.height + "|" + JSON.stringify(o.upgrades || {}) + "|" + (o.kinds || []).join(",") + "|" + (o.seed || 0);
      if (canvas._showKey === key) return false;
      canvas._showKey = key;
      const ctx = canvas.getContext("2d");
      const W = canvas.width;
      const H = canvas.height;
      const G = ZSR.Streets.GEOM;
      // (the scenery governor's thinning is the drive's: the still scene has every plant)
      const scen = this.scen;
      this.scen = null;
      const D = ZSR.Draw;
      const Art = ZSR.PerspArt;
      const M = ZSR.Walker3D;
      // the scene: the van at the origin heading up the screen (north), the camera right behind it
      const th = -Math.PI / 2;
      const van = { x: 0, y: 0, heading: th, w: 66, h: 118, hurt: 0, flash: 0 };
      const sc = { W, H, zoom: SHOW.zoom * Math.min(1, H / 200), vanAt: SHOW.vanAt, cam: { x: 0, y: 0, th }, mods: {}, van, time: 0, upgrades: o.upgrades || {}, dpr: 1, zombies: [], fallen: [] };
      const k = this.setup(sc);
      const at = (X, Y) => [X, -Y]; // X to the right, Y ahead
      const roadX = -ZSR.Streets.laneCenter(0, 2); // the road's middle (the van in our left lane)
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#5d5a3e";
      ctx.fillRect(0, 0, W, H);
      const haze = this.haze(sc);
      const skyY = this.sky(ctx, haze, false);
      // the road: shoulders, asphalt, the middle's two yellow lines and each side's lane dashes, ink at its edges
      const y0 = this.groundY(H) - 40;
      const y1 = k.far;
      const band = (xa, xb, fill, ya, yb) => this.poly(ctx, [at(xa, ya == null ? y0 : ya), at(xb, ya == null ? y0 : ya), at(xb, yb == null ? y1 : yb), at(xa, yb == null ? y1 : yb)].map((p) => p.concat(0)), fill, 0);
      band(roadX - G.half - G.shoulder - 4, roadX + G.half + G.shoulder + 4, INK);
      band(roadX - G.half - G.shoulder, roadX + G.half + G.shoulder, "#78736a");
      band(roadX - G.half, roadX + G.half, "#35363b");
      band(roadX - 9, roadX - 3, "#d6b03c");
      band(roadX + 3, roadX + 9, "#d6b03c");
      for (let y = y0 - (y0 % 160); y < y1; y += 160) for (const x of [roadX - G.lane, roadX + G.lane]) band(x - 3, x + 3, "rgba(230,226,214,0.8)", y, y + 70);
      // the haze over the far road, as the drive's (drawWorldGround)
      const hz = this.project(k.ox + k.Fx * k.fogG, k.oy + k.Fy * k.fogG, 0);
      if (hz && hz.y > 0) {
        const top = Math.max(0, skyY);
        const hg = ctx.createLinearGradient(0, top, 0, hz.y);
        hg.addColorStop(0, "rgba(" + haze.join(",") + ",0.85)");
        hg.addColorStop(1, "rgba(" + haze.join(",") + ",0)");
        ctx.fillStyle = hg;
        ctx.fillRect(0, top, W, hz.y - top);
      }
      // what stands, far to near: the roadside's plants, a wreck and a barrier, the walkers, the van
      const items = [];
      const side = G.half + G.shoulder;
      if (Art && Art.sprite) {
        const r = (i) => ((Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1 + 1) % 1;
        for (let i = 0; i < 26; i++) {
          const left = i % 2 === 0;
          const Y = 200 + i * 130 + r(i) * 90;
          const X = roadX + (left ? -1 : 1) * (side + 50 + r(i + 40) * 520);
          const kind = i % 5 === 0 ? "tree" : i % 5 === 3 ? "dead" : i % 2 ? "bush" : "grass";
          const h = kind === "tree" ? 170 + r(i + 7) * 70 : kind === "dead" ? 150 + r(i + 9) * 50 : kind === "bush" ? 50 + r(i + 3) * 20 : 30 + r(i + 5) * 12;
          const [x, y] = at(X, Y);
          items.push({ Y, draw: () => this.plant(ctx, { kind, x, y, h, v: i % 4, flip: i % 3 === 0 }, this.fadeAt(Y)) });
        }
      }
      const [wx, wy] = at(roadX - G.lane * 1.1, 980);
      items.push({ Y: 980, draw: () => this.car(ctx, { x: wx, y: wy, face: 0, rot: 0.5, color: "#3f4a55" }, 1) });
      const [bx, by] = at(roadX + G.half + 40, 1500);
      if (Art) items.push({ Y: 1500, draw: () => this.barrier(ctx, { x: bx, y: by, face: Math.PI / 2, rot: 0.3 }, 1) });
      const T = this.liveTune();
      const row = T.LIVE_LEVELS[0];
      const recs = (canvas._showRecs = canvas._showRecs || []);
      const kinds = o.kinds || [];
      const spots = SHOW.walkers.map(([X, Y]) => [roadX + X, Y]);
      const shown = [];
      kinds.slice(0, spots.length).forEach((type, i) => {
        if (!M || !M.TYPES) return;
        const WT = ZSR.WORLD.WALKER_TYPES[type] || {};
        const [x, y] = at(spots[i][0], spots[i][1]);
        const scream = !!WT.scream;
        const z = { type, seed: (o.seed || 0) + i, x, y, r: (WT.road && WT.road.r) || 18, heading: Math.atan2(van.y - y, van.x - x) + (i ? 0.25 : -0.2), gait: 0.15 + i * 0.4, move: 1, pose: scream ? "scream" : "walk", poseW: 1, clawPh: 0, yell: scream ? 0.6 : 0, hit: 0, run: 0, angle: 0 };
        shown.push(z);
        const rec = recs[i] || (recs[i] = (() => {
          const c = document.createElement("canvas");
          return { c, g: c.getContext("2d"), lw: 0, lh: 0 };
        })());
        items.push({
          Y: spots[i][1],
          draw: () => {
            const g2 = this.liveGeo(sc, z, false, row, 1, rec);
            if (!g2) return;
            g2.lod = g2.lodSize;
            this.shadow(ctx, z.x, z.y, z.r * 0.9, z.r * 0.7, 0, 0.32);
            this.liveRender(sc, g2, T, 1);
            this.blitFigure(ctx, g2, 1);
          },
        });
      });
      // the gun on the nearer walker's chest
      const aimAt = shown[0];
      const mx = van.x - Math.cos(th) * van.h * 0.1;
      const my = van.y - Math.sin(th) * van.h * 0.1;
      van.aimW = aimAt ? Math.atan2(aimAt.y - my, aimAt.x - mx) : th - 0.3;
      van.aimDz = -0.05;
      items.push({ Y: 0, draw: () => this.van(sc, ctx) });
      items.sort((a, b) => b.Y - a.Y);
      for (const it of items) {
        ctx.globalAlpha = 1;
        it.draw();
      }
      ctx.globalAlpha = 1;
      D.vignette(ctx, W, H);
      ctx.restore();
      this.scen = scen;
      return true;
    },
    /** Walkers behind the road sign, drawn again on top of it (game.js drawOverSign): this frame's pictures where
        they were put up (nothing is drawn anew), their bodies and health bars only (a shadow or a frenzy's glow over
        the sign would tint its words), far to near. */
    drawOverSign(g, ctx, rects) {
      const pool = this.livePool;
      if (!pool) return;
      const hit = [];
      for (const z of g.zombies) {
        const r = pool.get(z);
        if (!r || r.frame !== this.liveNo || !r.lh || !(r.alpha > 0.02)) continue;
        const lx = (r.top.x - r.foot.x) * LEAN;
        const half = (r.lw / 2) * (r.upx / r.lrpx);
        const x0 = r.foot.x + Math.min(0, lx) - half;
        const x1 = r.foot.x + Math.max(0, lx) + half;
        const y0 = r.foot.y - ((r.lh - r.lfl) * r.hpx) / r.bh / r.lrpx;
        const y1 = r.foot.y + (r.lfl * r.hpx) / r.bh / r.lrpx;
        if (rects.some((q) => x1 > q.x && x0 < q.x + q.w && y1 > q.y && y0 < q.y + q.h)) hit.push(r);
      }
      if (!hit.length) return;
      hit.sort((a, b) => b.d - a.d);
      ctx.save();
      ctx.beginPath();
      rects.forEach((q) => ctx.rect(q.x, q.y, q.w, q.h));
      ctx.clip();
      for (const r of hit) {
        this.blitFigure(ctx, r, r.alpha);
        this.healthBar(ctx, r, r.o, r.alpha);
      }
      ctx.restore();
    },
  };
  ZSR.Persp = Persp;
})(typeof window !== "undefined" ? window : globalThis);
