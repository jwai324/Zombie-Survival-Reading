/* Walker3D: the walkers as live 3D jointed figures, drawn fresh into a small canvas whenever they change, in the
   game's comic style (ink outline, flat fills, a little light and shade), from any side, in any pose, falling.
   No images and no WebGL: plain Canvas 2D calls straight into the context the engine hands over.

   The looks are data. js/walker3d-looks.js adds the types with Walker3D.addType(id, def): build (bone lengths and
   widths in tiles), gait (stride, lean, sway, arms...), fall style and look (palette and gear, with variants a
   walker's seed picks between). More types go in an appended js/walker3d-looks2.js.

   draw(ctx, type, st, cam) -> { face, parts } (one reused object; copy what you keep)
   st (one object, reused by the caller):
     yaw     0 = facing the camera; +: its front turns to the camera's left
     gait    0..1 through the walk cycle (the engine advances it by distance walked / stride(type))
     move    0..1 from standing to walking
     pose    "idle" | "walk" | "bite" | "claw" | "scream" (a type that cannot scream bites instead)
     poseT   0..1 through a bite or a scream; for idle, a slow breathing cycle (0 is fine)
     poseW   0..1 (optional, default 1): how far the figure has gone from its walk into the pose. The engine ramps it
             from 0 to 1 over about POSE_BLEND seconds whenever the pose changes, so the arms swing into a claw or a
             bite instead of jumping there
     claw    0..1 through a pair of overhead swipes (pose "claw")
     hit     0 | 1: the white flash of a shot landing
     fall    0..1 the collapse (0 standing); fallDir: rad relative to its forward (pi = backwards; + toward its
             right, the yaw sense: in the model, x its right and z its forward, fallDir fd points (sin fd, 0, cos fd))
     seed    int: which arm reaches, which gear, grime, hair
     lod     0 full | 1 no sheen, ribs or fingers | 2 silhouette, head and eyes
     fog     0..0.9: every colour times (1 - fog); the eyes keep their glow. Drawn in steps of 1 / FOG_STEPS, so the
             engine's "has it changed" signature should compare Math.round(fog * FOG_STEPS), not the raw fog
     gore    bool, default gore(): blood smears, ribs through the rips, a pool under a fallen walker
     run     0..1 (optional, default 0: draws exactly as without it): how far its gait goes over to a sprint
             (RUN_GAIT, the runner's: long strides, both feet off the ground between them, a hard lean), for a
             walker covering ground faster than its kind walks (the angled road, keeping up with the van). The
             engine then advances gait by distance / stride(type, run), so the feet stay planted
   A missing or non-numeric field draws as its default (never NaN coordinates).
   cam: w, h (px of the region drawn from 0,0), px (px per tile), dist (tiles to the camera plane),
        eye (tiles above the feet: the camera's height)
        Two options for a camera looking down from above (the angled road camera, js/perspective.js); left out,
        nothing changes (tests/validate-art.js compares the calls with and without them):
        floor   px of room in the region under the feet line (at most 0.6 h): the feet stand on y = h - floor, a
                part nearer the camera than the feet goes down to the floor under itself (seen from above, a foot
                stepping toward you is lower on the screen), a lying body keeps its full perspective (DIST over 3
                tiles), the size envelope reads an eye over the head from the far side (the highest on screen),
                and the region's margin (1 px + the outline) comes out of the room the caller left around the box,
                not out of the figure. The caller sizes the region: box w and h plus that margin, plus floor.
        shadow  false: no contact shadow under the feet (the caller lays its own on its ground; a pool still shows)

   Contract (tests/validate-art.js checks it): everything inside [0,w] x [0,h], the feet on y = h (h - floor) and the figure
   centred on x = w/2; no translate, scale, rotate, transform or drawImage; no new canvases; no Path2D,
   OffscreenCanvas, DOMMatrix, shadowBlur or filter; context state is never read back; the same inputs make the same
   calls (seeded random only); no objects, arrays, closures or strings are made per draw (preallocated joint
   buffers, part records, one Float64Array for every number passed between functions, and a colour-string table that
   converges because light and fog come in fixed steps; only the engine's own boxing of numbers at calls is left,
   short-lived and cheap); colours are "rgb(r,g,b)" or "rgba(r,g,b,a)" with whole channels, the light, fog and hit
   flash already in them; within the per-lod call ceilings tests/validate-art.js sets (WALKER_OPS).
   Size: a figure too big for its region (a near camera, a claw over its head) is shrunk about its feet. How much
   depends only on the type, the camera and whether it is walking or attacking (an envelope of all its poses
   worked out once in addType), never on the moment of the swing, so an attacker does not pulse in size.
   The model keeps screen proportions: the engine squashes the floor sideways by STRETCH, but a walker with real
   proportions squashed the same way looks about 30% too thin, so it is not squashed (DESIGN.md). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const TAU = Math.PI * 2;
  const PI = Math.PI;
  // lengths (Math.hypot would allocate its argument list on every call)
  const hyp2 = (x, y) => Math.sqrt(x * x + y * y);
  const hyp3 = (x, y, z) => Math.sqrt(x * x + y * y + z * z);

  // SCALE: perspective inside one figure: its far side is drawn at least K_MIN times as big as its middle, its near
  // side at most K_MAX (a hand reaching at a near camera). A lying body uses half the perspective (see PSC).
  const K_MIN = 0.6;
  const K_MAX = 1.6;
  const FOG_STEPS = 32; // fog is drawn in steps of 1/32 (and the light in steps of 1/LIGHT_STEPS): the colour table converges
  const LIGHT_STEPS = 64;
  const POSE_BLEND = 0.15; // seconds the engine should take to ramp st.poseW from 0 to 1 after a pose change
  const POSES = ["idle", "walk", "bite", "claw", "scream"];
  const P_IDLE = 0;
  const P_WALK = 1;
  const P_BITE = 2;
  const P_CLAW = 3;
  const P_SCREAM = 4;
  const INK = [13, 14, 16];
  const BLACK = [0, 0, 0];
  const WHITE = [255, 255, 255];
  // the light, in camera space (x right, y up, z away from the camera): from the upper left, toward the viewer
  const LN = hyp3(0.45, 0.8, 0.4);
  const LX = -0.45 / LN;
  const LY = 0.8 / LN;
  const SLX = LX / hyp2(LX, LY); // its direction on screen (y down)
  const SLY = -LY / hyp2(LX, LY);

  /* ---------- Joints: model tiles, origin between the feet, x the walker's right, y up, z its forward ---------- */
  const PEL = 0;
  const CHE = 1; // middle of the shoulder line
  const NEC = 2; // top of the neck
  const HED = 3; // centre of the skull
  const SH = [4, 7]; // [left, right]: shoulder, elbow, hand (the wrist)
  const EL = [5, 8];
  const HA = [6, 9];
  const HI = [10, 14]; // hip, knee, ankle, toe
  const KN = [11, 15];
  const AN = [12, 16];
  const TO = [13, 17];
  const NJ = 18;
  const J = new Float64Array(NJ * 3);
  const JR = new Float64Array(NJ); // how far a part reaches around each joint (tiles): the fit and the ground
  const S = new Float64Array(NJ * 3); // projected: x, y, scale
  const TF = new Float64Array(9); // torso frame: right, up, forward
  const PF = new Float64Array(9); // pelvis frame
  const HF = new Float64Array(9); // head frame
  const KF = new Float64Array(6); // each knee's forward (the way it bends)
  const PALM = new Float64Array(6); // which way each palm faces (a hint; made square to the forearm)
  const CURL = new Float64Array(2);
  const SPREAD = new Float64Array(2);
  const WRIST = new Float64Array(2);

  /* ---------- Per-draw state ---------- */
  let G = null;
  let LOD = 0;
  let GORE = true;
  let SEED = 1;
  let T = null; // the type
  let V = null; // its look (the variant this seed picked)
  let FACE = false;
  let INKS = "rgb(13,14,16)";
  let SHADOW = true; // cam.shadow !== false: the contact shadow
  let RUNNING = false; // st.run > 0: the fit reads the envelope with the sprint in it
  // st.run: the gait a walker's own goes over to as it runs (the runner's own, js/walker3d-looks.js), field by field
  const RUN_GAIT = { stride: 1.5, duty: 0.38, lift: 0.11, crouch: 0.08, lean: 0.55, bob: 0.02 };
  const RUN_KEYS = Object.keys(RUN_GAIT);
  // cam.floor: [the feet line's y, px of room under it]; with no room the feet line is the region's bottom (h - 0)
  const FLR = new Float64Array(2);
  const RESULT = { face: false, parts: 0 };

  /* ---------- Numbers passed between the drawing functions ----------
     Every one lives in this buffer, never in a closure variable: V8 boxes a double written to a closure variable
     (a new heap number each time), which would be thousands of objects a draw. The names are its indexes. */
  const RG = new Float64Array(58);
  const JAW = 0; // how far the jaw hangs open, 0..1.3
  const LYING = 1; // how far over the body has gone, 0..1
  const POOL = 2; // blood pool radius, tiles (0: none)
  const POOLX = 3;
  const POOLZ = 4;
  const CW = 5;
  const CH = 6;
  const W2 = 7;
  const PXS = 8;
  const DIST = 9;
  const EYE = 10;
  const CYAW = 11;
  const SYAW = 12;
  const TCX = 13; // toward the camera, model space: (-sin yaw, 0, cos yaw)
  const TCZ = 14;
  const FIT = 15;
  const FOGK = 16;
  const FLASH = 17;
  const OUT = 18; // ink outline, px
  const FZ = 19;
  const FY = 20;
  const FP = 21;
  const AR = 22;
  const AU = 23;
  const AF = 24;
  const APALM = 25; // 0 palm forward (a claw), 1 palm in (hanging), 2 palm down; in between blends (continuous)
  const ACURL = 26;
  const ASPREAD = 27;
  const AWRIST = 28;
  const RC = 29;
  const RS = 30;
  const RKX = 31;
  const RKZ = 32;
  const QX = 33;
  const QY = 34;
  const QK = 35;
  const PSC = 36; // share of the perspective used: a body lying toward the camera uses half (its near head would balloon)
  const FIT_ENV = 37;
  const EX = 38;
  const EY = 39;
  const ERA = 40;
  const ERB = 41;
  const ERO = 42;
  const ECX = 43;
  const ECY = 44;
  const NX = 45;
  const NY = 46;
  const GX = 47;
  const GY = 48;
  const TX = 49;
  const TY = 50;
  const TDX = 51;
  const TDY = 52;
  const TRW = 53;
  const TRL = 54;
  const SFX = 55;
  const SFY = 56;
  const SFZ = 57;
  RG[JAW] = 0.4;
  RG[PXS] = 1;
  RG[DIST] = 3;
  RG[EYE] = 0.5;
  RG[CYAW] = 1;
  RG[TCZ] = 1;
  RG[FIT] = 1;
  RG[FOGK] = 1;
  RG[OUT] = 1;
  RG[ACURL] = 0.5;
  RG[ASPREAD] = 0.8;
  RG[RC] = 1;
  RG[QK] = 1;
  RG[PSC] = 1;
  RG[FIT_ENV] = 1;
  RG[ERA] = 1;
  RG[ERB] = 1;

  const clamp01 = (v) => (v > 0 ? (v < 1 ? v : 1) : 0); // NaN and undefined -> 0
  const smooth = (v) => {
    const t = clamp01(v);
    return t * t * (3 - 2 * t);
  };
  const frac = (v) => v - Math.floor(v);

  /** Seeded 0..1 for this walker (seed) and slot i: the same walker always gets the same grime and tics. */
  function rnd(i) {
    let x = Math.imul(SEED ^ Math.imul(i + 1, 0x9e3779b1), 0x85ebca6b);
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }

  /* ---------- Colours: rgb arrays in, strings out, from a fixed table (a miss builds one string) ---------- */
  // SCALE: colour-string table slots (a power of two). Every type x variant x light level x fog step x hit flash is one
  // colour; more types and variants mean more of them. A miss only builds one string (garbage), so keep it a few
  // times the colours a busy scene uses (about 4,000 with the six types and every fog step).
  const CC_N = 16384;
  const CC_SHIFT = 32 - Math.log2(CC_N);
  const ccKey = new Float64Array(CC_N).fill(-1);
  const ccStr = new Array(CC_N).fill("");
  function cstr(r, g, b, a) {
    const key = ((r * 256 + g) * 256 + b) * 128 + a;
    const h = Math.imul(key | 0, 0x9e3779b1) >>> CC_SHIFT;
    // up to four slots from its hash; a miss takes the first empty one, else the last (an old colour is rebuilt later)
    let i = -1;
    for (let p = 0; p < 4; p++) {
      const j = (h + p) & (CC_N - 1);
      if (ccKey[j] === key) return ccStr[j];
      if (i < 0 && ccKey[j] === -1) i = j;
    }
    if (i < 0) i = (h + 3) & (CC_N - 1);
    const s = a >= 100 ? "rgb(" + r + "," + g + "," + b + ")" : "rgba(" + r + "," + g + "," + b + "," + a / 100 + ")";
    ccKey[i] = key;
    ccStr[i] = s;
    return s;
  }
  const ch = (v) => (v <= 0 ? 0 : v >= 255 ? 255 : Math.round(v));
  /** Colour c (rgb array) times light m, alpha a, with the hit flash and the fog baked in. */
  function col(c, m, a) {
    m = Math.round(m * LIGHT_STEPS) / LIGHT_STEPS;
    const f = RG[FLASH];
    const k = RG[FOGK];
    return cstr(ch(((1 - f) * c[0] * m + f * 255) * k), ch(((1 - f) * c[1] * m + f * 255) * k), ch(((1 - f) * c[2] * m + f * 255) * k), Math.round(clamp01(a) * 100));
  }
  /** The same without the fog: the eyes glow in the dark. */
  function glow(c, a) {
    const f = RG[FLASH];
    return cstr(ch((1 - f) * c[0] + f * 255), ch((1 - f) * c[1] + f * 255), ch((1 - f) * c[2] + f * 255), Math.round(clamp01(a) * 100));
  }
  /** Blood when gore is on, grime when it is off. */
  const goreCol = (lv, a) => (GORE ? col(V.blood, lv, a) : col(V.grime, lv, a));

  /* ---------- Frames: three unit vectors (right, up, forward) in a Float64Array(9) ---------- */
  function frameSet(F, src) {
    for (let k = 0; k < 9; k++) F[k] = src ? src[k] : k === 0 || k === 4 || k === 8 ? 1 : 0;
  }
  /** Turn basis vectors i0 and i1 in their plane: v0 -> v0 cos a + v1 sin a. yaw (face toward its right): (2, 0);
      pitch (lean forward): (1, 2); roll (top toward its right): (1, 0). */
  function rot(F, i0, i1, a) {
    if (!a) return;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const o0 = i0 * 3;
    const o1 = i1 * 3;
    for (let k = 0; k < 3; k++) {
      const v0 = F[o0 + k];
      const v1 = F[o1 + k];
      F[o0 + k] = v0 * c + v1 * s;
      F[o1 + k] = v1 * c - v0 * s;
    }
  }
  const setJ = (j, x, y, z) => {
    J[j * 3] = x;
    J[j * 3 + 1] = y;
    J[j * 3 + 2] = z;
  };
  /** Joint j = joint b + frame F's (right * r + up * u + forward * f). */
  function offJ(j, b, F, r, u, f) {
    for (let k = 0; k < 3; k++) J[j * 3 + k] = J[b * 3 + k] + F[k] * r + F[3 + k] * u + F[6 + k] * f;
  }

  /** Two-bone reach: root a and end c are set, middle m goes toward pole (px, py, pz). An end out of reach is
      pulled in. */
  function ik(a, m, c, la, lb, px, py, pz) {
    const ax = J[a * 3];
    const ay = J[a * 3 + 1];
    const az = J[a * 3 + 2];
    let dx = J[c * 3] - ax;
    let dy = J[c * 3 + 1] - ay;
    let dz = J[c * 3 + 2] - az;
    let d = hyp3(dx, dy, dz);
    if (d < 1e-6) {
      dx = 0;
      dy = -1;
      dz = 0;
      d = 1e-6;
    }
    const max = (la + lb) * 0.999;
    if (d > max) {
      dx *= max / d;
      dy *= max / d;
      dz *= max / d;
      d = max;
      setJ(c, ax + dx, ay + dy, az + dz);
    }
    const ux = dx / d;
    const uy = dy / d;
    const uz = dz / d;
    const dd = Math.max(d, Math.abs(la - lb) + 1e-4);
    const ca = Math.max(-1, Math.min(1, (la * la + dd * dd - lb * lb) / (2 * la * dd)));
    const sa = Math.sqrt(1 - ca * ca);
    const pd = px * ux + py * uy + pz * uz;
    let vx = px - pd * ux;
    let vy = py - pd * uy;
    let vz = pz - pd * uz;
    let vl = hyp3(vx, vy, vz);
    if (vl < 1e-6) {
      vx = uy;
      vy = -ux;
      vz = 0;
      vl = hyp2(vx, vy) || 1;
    }
    setJ(m, ax + la * (ca * ux + sa * (vx / vl)), ay + la * (ca * uy + sa * (vy / vl)), az + la * (ca * uz + sa * (vz / vl)));
  }

  /* ---------- The pose: st -> joints ---------- */
  /** A foot's path through one step (q 0..1): planted for the first `duty` of it, then a lifted swing from -S/2 to
      +S/2 (the caller shortens S for a dragging foot, over the whole cycle, so the swing meets the stance at both
      ends). The toe points down as the foot pushes off, up as it reaches for the ground; every part is continuous. */
  function footPath(q, S, lift, duty, drag) {
    if (q < duty) {
      RG[FZ] = S * (0.5 - q / duty);
      RG[FY] = 0;
      RG[FP] = 0;
    } else {
      const t = (q - duty) / (1 - duty);
      const e = 0.5 - 0.5 * Math.cos(PI * t);
      const sn = Math.sin(PI * t);
      // two lobes, each zero at its ends: toe down (push-off) in the first half, toe up (heel strike) in the second
      const lobe = t < 0.5 ? -0.55 * Math.sin(TAU * t) : 0.3 * Math.sin(TAU * (t - 0.5));
      RG[FZ] = S * (e - 0.5);
      RG[FY] = lift * sn * (1 - 0.85 * drag);
      RG[FP] = lobe * (1 - drag) - drag * 0.5 * sn;
    }
  }
  // arm targets from the shoulder, in the torso frame (r outward, u up, f forward, tiles) and the hand's set
  function armSet(r, u, f, palm, curl, spread, wrist) {
    RG[AR] = r;
    RG[AU] = u;
    RG[AF] = f;
    RG[APALM] = palm;
    RG[ACURL] = curl;
    RG[ASPREAD] = spread;
    RG[AWRIST] = wrist;
  }
  function armBlend(w, r, u, f, palm, curl, spread, wrist) {
    if (w <= 0) return;
    const k = clamp01(w);
    RG[AR] += (r - RG[AR]) * k;
    RG[AU] += (u - RG[AU]) * k;
    RG[AF] += (f - RG[AF]) * k;
    RG[APALM] += (palm - RG[APALM]) * k;
    RG[ACURL] += (curl - RG[ACURL]) * k;
    RG[ASPREAD] += (spread - RG[ASPREAD]) * k;
    RG[AWRIST] += (wrist - RG[AWRIST]) * k;
  }
  /** The arm swing of the type's gait (g.arms) for side s (-1 left, 1 right) at phase angle A, walk blend m. */
  function armGait(g, s, A, m, L, ph) {
    const opp = s < 0 ? 0 : PI; // the left arm swings with the right leg
    const sw = Math.sin(A + opp) * m * (g.armSwing == null ? 1 : g.armSwing);
    switch (g.arms) {
      case "pump": {
        // a sprint: big clawing pumps, elbows bent and kept in, hands up and out in front on the forward swing
        const a = Math.sin(A + opp);
        const f0 = 0.5 * (1 - m) + (0.2 + 0.5 * a) * m;
        armSet(0.06 * L, -(0.22 * (1 - m) + (0.38 - 0.3 * Math.max(0, a)) * m) * L, f0 * L, 0, 0.55, 0.95, 0.55);
        break;
      }
      case "hang": {
        // heavy arms hanging low and swinging; one reaches out at chest height, palm down, a grabbing hand
        if (s === g.reachSide) armSet(0.22 * L, (-0.34 + 0.05 * Math.sin(A)) * L, (0.62 + 0.05 * Math.sin(A * 2)) * L, 1.7, 0.5, 1.15, 0.15);
        else armSet(0.16 * L, -0.86 * L, (0.12 + 0.3 * sw) * L, 1, 0.55, 0.7, 0.1);
        break;
      }
      case "dangle": {
        // long arms dangling past the knees, swinging wide
        armSet((0.14 + 0.06 * Math.cos(A + opp) * m) * L, -0.93 * L, (0.1 + 0.4 * sw) * L, 1, 0.35, 0.8, 0);
        break;
      }
      case "stiff": {
        // a stiff march: little swing, hands half clenched
        armSet(0.1 * L, -0.8 * L, (0.2 + 0.1 * sw) * L, 1, 0.75, 0.5, 0.05);
        break;
      }
      case "bent": {
        // elbows bent, claws up by the chest, twitching
        const tw = Math.sin(TAU * 3 * ph + s * 1.7 + SEED * 0.001) * 0.05;
        armSet(0.12 * L, (-0.28 + tw) * L, (0.45 + 0.1 * sw) * L, 0, 0.65, 1, 0.7);
        break;
      }
      default: {
        // "reach": the arms take turns. The reaching arm (reachSide) is held out, a little to the side and down so it
        // reads from the front, clawed hand toward you; on the other arm's forward swing that one comes up to chest
        // height and the reaching one dips.
        const up = (0.5 + 0.5 * Math.sin(A + opp)) * m; // this arm's own forward swing (with the other leg)
        if (s === g.reachSide) {
          const dip = (0.5 + 0.5 * Math.sin(A + PI - opp)) * m; // while the other arm is up
          armSet(0.42 * L, (-0.25 - 0.16 * dip + 0.04 * Math.sin(A * 2)) * L, (0.8 - 0.14 * dip) * L, 0, 0.28, 1.15, 0.55);
        } else armSet((0.12 + 0.14 * up) * L, (-0.68 + 0.43 * up) * L, (0.3 + 0.3 * up + 0.08 * sw) * L, 1 - up, 0.62 - 0.25 * up, 0.65 + 0.4 * up, 0.12 + 0.35 * up);
      }
    }
  }

  /** Fill J (and the frames, palms, jaw, pool) for type t in state st. Every input is sanitised: a missing or
      non-numeric field acts as its default. */
  function solve(t, st) {
    const b = t.build;
    // running (st.run): its own gait gone over toward the sprint, in a copy kept with the type (nothing made per draw)
    const run = clamp01(+st.run);
    RUNNING = run > 0;
    let g = t.gait;
    if (RUNNING && t.gaitRun) {
      g = t.gaitRun;
      for (let i = 0; i < RUN_KEYS.length; i++) {
        const k = RUN_KEYS[i];
        g[k] = t.gait[k] + (RUN_GAIT[k] - t.gait[k]) * run;
      }
    }
    let pose = POSES.indexOf(st.pose);
    if (pose < 0) pose = P_WALK;
    if (pose === P_SCREAM && !g.scream) pose = P_BITE;
    // how far into the pose from the walk (the engine ramps it after a pose change)
    const fall = clamp01(+st.fall);
    // (a falling body lets go of its pose: a bite or a swipe fades out as the knees give)
    const pw = (st.poseW == null || !Number.isFinite(+st.poseW) ? 1 : clamp01(+st.poseW)) * (1 - smooth(fall / 0.35));
    // the stride closes up as the knees give, so a walker shot mid-step does not land with a foot in the air
    const mv = (Number.isFinite(+st.move) ? clamp01(+st.move) : 0) * (1 - smooth(fall / 0.45));
    const m = pose === P_CLAW || pose === P_SCREAM ? mv * (1 - 0.75 * pw) : mv;
    const pT = clamp01(+st.poseT);
    const cl = Number.isFinite(+st.claw) ? +st.claw : 0;
    let ph = frac(Number.isFinite(+st.gait) ? +st.gait : 0);
    if (g.jerk) ph = frac(ph + g.jerk * (0.02 * Math.sin(TAU * 3 * ph + SEED * 0.37) + 0.012 * Math.sin(TAU * 7 * ph + SEED * 0.11)));
    const A = TAU * ph;
    const hit = st.hit ? 1 : 0;
    const L = b.upper + b.fore;
    const hipH = b.ankle + b.shin + b.thigh;

    // the fall's first stage: knees give, the body slumps, the arms go limp (style per type)
    let buckle = 0;
    let slump = 0;
    let limp = 0;
    let topple = 0;
    let kneel = 0;
    let spin = 0;
    let fd = Number.isFinite(+st.fallDir) && st.fallDir !== null ? +st.fallDir : PI;
    let pivot = 0.06;
    let land = 0; // how far the body has come down flat (a fold stays in a heap)
    if (fall > 0) {
      switch (t.fall) {
        case "tree": // stays rigid and goes over like a felled tree
          limp = 0.35 * fall;
          topple = Math.pow(fall, 1.9);
          pivot = 0.08;
          break;
        case "fold": // knees buckle, it folds over them and goes down in a heap (forward, a little toward the shot's side)
          buckle = 0.62 * smooth(fall / 0.5);
          slump = 1.1 * smooth(fall / 0.6) * (1 - 0.6 * smooth((fall - 0.6) / 0.4));
          limp = smooth(fall / 0.5);
          topple = 0.95 * smooth((fall - 0.4) / 0.6);
          fd = 0.4 * Math.sin(fd);
          pivot = 0.12;
          break;
        case "kneel": // drops to its knees, then forward
          kneel = smooth(fall / 0.45);
          limp = 0.7 * kneel;
          topple = Math.pow(clamp01((fall - 0.4) / 0.6), 1.6);
          fd = 0.25 * Math.sin(fd);
          pivot = 0.14;
          break;
        case "tumble": // pitches over hard with a twist
          buckle = 0.3 * smooth(fall / 0.3);
          limp = smooth(fall / 0.35);
          topple = smooth(fall / 0.7) * (1 + 0.1 * Math.sin(PI * clamp01((fall - 0.55) / 0.45)));
          spin = 0.9 * smooth(fall);
          pivot = 0.1;
          break;
        default: // "crumple": sags at the knees, then tips over
          buckle = 0.55 * smooth(fall / 0.5);
          slump = 0.45 * smooth(fall / 0.5);
          limp = smooth(fall / 0.55);
          topple = Math.pow(clamp01((fall - 0.3) / 0.7), 1.4);
          pivot = 0.1;
      }
      // the legs straighten as the body goes over, so it lands lying flat, not with its knees or shins in the air
      land = smooth(clamp01(topple));
      buckle *= t.fall === "fold" ? 1 - 0.75 * land : 1 - land;
      if (t.fall !== "fold") slump *= 1 - land;
    }
    RG[LYING] = clamp01(topple);
    // kneeling legs unbend from a third of the way over: the shins swing back under the hips, so they lie flat
    const kneelLeg = kneel * (1 - smooth((topple - 0.3) / 0.7));

    // pose blends (pw: how far into the pose from the walk)
    const lunge = pose === P_BITE ? Math.sin(PI * pT) * pw : 0;
    const scream = pose === P_SCREAM ? smooth(pT / 0.18) * (1 - smooth((pT - 0.82) / 0.18)) * pw : 0;
    const clawing = pose === P_CLAW ? pw : 0;
    const idle = pose === P_IDLE ? pw : 0;
    const breath = idle ? Math.sin(TAU * pT) : 0;
    const biting = pose === P_BITE ? pw : 0;

    // legs: where each foot is
    const S = g.stride * g.duty * m;
    const q1 = frac(ph + 0.5 + (g.limp || 0));
    const plant = Math.max(clawing, scream);
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      const drag = s === g.dragSide ? g.drag || 0 : 0;
      footPath(i ? q1 : ph, S * (drag ? 0.8 : 1), g.lift * m, g.duty, drag);
      if (plant > 0) {
        // set feet for a swipe or a scream
        RG[FZ] += ((i ? -0.04 : 0.06) * b.thigh - RG[FZ]) * plant;
        RG[FY] *= 1 - plant;
        RG[FP] *= 1 - plant;
      }
      let ax = s * b.footW;
      let ay = b.ankle + RG[FY];
      let az = RG[FZ];
      if (kneelLeg) {
        az = az * (1 - kneelLeg) - b.shin * 0.92 * kneelLeg;
        ay = ay * (1 - kneelLeg) + 0.04 * kneelLeg;
        RG[FP] = RG[FP] * (1 - kneelLeg) - 1.2 * kneelLeg;
      }
      setJ(AN[i], ax, ay, az);
      const to = s * (g.toeOut || 0.1);
      const fl = b.foot;
      const cp = Math.cos(RG[FP]);
      setJ(TO[i], ax + Math.sin(to) * fl * cp, ay - b.ankle * 0.55 + Math.sin(RG[FP]) * fl, az + Math.cos(to) * fl * cp);
    }

    // pelvis
    const bob = g.bob * m * (0.5 + 0.5 * Math.cos(2 * A));
    const dip = (g.drag || 0) * 0.03 * m * Math.max(0, Math.sin(A + (g.dragSide > 0 ? PI : 0)));
    let py = hipH * (1 - g.crouch) - bob - dip - buckle * hipH * 0.55;
    if (idle) py -= 0.006 * (1 + breath) * idle;
    if (kneelLeg) py = py * (1 - kneelLeg) + (b.thigh * 0.96 + 0.05) * kneelLeg;
    // lying flat, the legs are straight (no crouch or bob left in the knees)
    const flatLeg = t.fall === "fold" ? 0 : land;
    if (flatLeg) py += (b.ankle + (b.thigh + b.shin) * 0.995 - py) * flatLeg;
    const px = g.sway * Math.sin(A) * (0.35 + 0.65 * m);
    const pz = 0.07 * lunge * b.thigh * 2 - 0.03 * scream;
    setJ(PEL, px, py, pz);
    frameSet(PF, null);
    rot(PF, 2, 0, -0.6 * g.twist * Math.sin(A) * m);
    rot(PF, 1, 0, -0.5 * g.roll * Math.sin(A) * m);

    // torso
    frameSet(TF, null);
    let twist = g.twist * Math.sin(A) * m;
    if (clawing) twist += 0.18 * Math.sin(TAU * cl) * clawing;
    rot(TF, 2, 0, twist);
    let lean = g.lean * (0.55 + 0.45 * m) + 0.35 * lunge + clawing * (0.12 + 0.06 * Math.sin(TAU * 2 * cl)) - 0.38 * scream;
    lean += idle * (0.07 + 0.025 * breath) - hit * 0.14 + g.lean * 0.15 * Math.cos(2 * A) * m;
    const fold = t.fall === "fold";
    lean += fold ? slump : slump * Math.cos(fd); // a fold always jackknifes forward over its knees
    // a body lying flat is straight from its feet to its shoulders (else its legs would point up off the floor)
    const flat = fold ? 0 : land;
    rot(TF, 1, 2, lean * (1 - flat));
    rot(TF, 1, 0, (g.tilt + g.roll * Math.sin(A) * m + (fold ? 0 : slump * Math.sin(fd) * 0.6)) * (1 - flat));
    offJ(CHE, PEL, TF, 0, b.torso, 0);
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      const shrug = (g.shrug || 0) * Math.sin(A + (i ? PI : 0)) * m;
      offJ(SH[i], CHE, TF, s * b.shW, shrug - (s === g.dropSide ? g.drop || 0 : 0), 0);
      offJ(HI[i], PEL, PF, s * b.hipW, 0, 0);
    }

    // knees: two-bone reach from hip to ankle, bending forward (and a little out)
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      const kx = PF[6] + s * 0.12;
      const kz = PF[8];
      ik(HI[i], KN[i], AN[i], b.thigh, b.shin, kx, PF[7], kz);
      KF[i * 3] = kx;
      KF[i * 3 + 1] = 0;
      KF[i * 3 + 2] = kz;
    }

    // neck and head
    offJ(NEC, CHE, TF, 0, b.neck, g.headFwd + 0.04 * lunge);
    frameSet(HF, TF);
    let hp = -lean * g.headUp + (g.headDroop || 0) + idle * (0.22 + 0.04 * breath) - 0.12 * lunge - 0.85 * scream - 0.18 * hit + clawing * -0.15;
    hp += (g.headBob || 0) * Math.sin(2 * A) * m;
    hp += limp * 0.6 * Math.cos(fd);
    let hy = 0;
    let hr = g.headTilt * (SEED & 1 ? 1 : -1) * 0.5 + g.headTilt * 0.5;
    if (g.headTic) {
      const k = Math.floor(ph * 8);
      hy += (rnd(40 + k) - 0.5) * g.headTic;
      hr += (rnd(60 + k) - 0.5) * g.headTic * 0.8;
    }
    hr += limp * 0.5 * (SEED & 2 ? 1 : -1);
    rot(HF, 2, 0, hy);
    rot(HF, 1, 2, hp);
    rot(HF, 1, 0, hr);
    offJ(HED, NEC, HF, 0, b.head[1] * 0.78, -b.head[2] * 0.1);

    // jaw
    RG[JAW] = g.jaw + 0.09 * Math.sin(2 * A + 1) * m + 0.55 * lunge + 0.5 * scream + idle * -0.1 + hit * 0.2 + limp * 0.3;
    if (RG[JAW] < 0.05) RG[JAW] = 0.05;

    // arms: the gait's swing, then each pose blended in by its weight (so a pose change never jumps)
    const pumpK = g.arms === "pump" ? (1 - idle) * (1 - clawing) * (1 - biting) * (1 - limp) : 0;
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      armGait(g, s, A, m, L, ph);
      armBlend(idle, 0.08 * L, -0.85 * L, (0.14 + 0.02 * breath) * L, 1, 0.5, 0.5, 0.05);
      if (biting) armBlend(biting * 0.3 + 1.4 * lunge, -0.1 * L, 0.04 * L, 0.86 * L, 0, 0.5, 1, 0.55);
      if (clawing) {
        const q = frac(cl + (i ? 0.5 : 0));
        const k = q < 0.4 ? smooth(q / 0.4) : 1 - smooth((q - 0.4) / 0.6);
        const cu = g.clawUp; // how high over the shoulder the swipe starts (x arm length)
        armBlend(clawing, (0.24 - 0.3 * k) * L, (cu - (cu + 0.28) * k) * L, (0.38 + 0.24 * k) * L, 0, 0.55, 1, 0.4 * (1 - k));
      }
      armBlend(scream, 0.7 * L, 0.26 * L, 0.16 * L, 0, 0.3, 1.25, 0.75);
      armBlend(limp, 0.16 * L, -0.95 * L, 0.02 * L, 1, 0.3, 0.4, 0);
      // a dropped shoulder's arm hangs lower
      for (let k = 0; k < 3; k++) J[HA[i] * 3 + k] = J[SH[i] * 3 + k] + TF[k] * s * RG[AR] + TF[3 + k] * RG[AU] + TF[6 + k] * RG[AF];
      // elbows bend back, down and out; raised arms bend out; a sprinter's pumping elbows stay in and go back
      const up = clamp01(RG[AU] / L + 0.3);
      const fw = clamp01(RG[AF] / L);
      const eo = 0.55 + 0.3 * up + (0.25 - 0.55 - 0.3 * up) * pumpK;
      const eb = (0.55 - 0.25 * up) * (1 - fw) + (0.6 - (0.55 - 0.25 * up) * (1 - fw)) * pumpK;
      const ed = 0.45 + 0.4 * fw;
      const ex = TF[0] * s * eo - TF[6] * eb - TF[3] * ed;
      const ey = TF[1] * s * eo - TF[7] * eb - TF[4] * ed;
      const ez = TF[2] * s * eo - TF[8] * eb - TF[5] * ed;
      ik(SH[i], EL[i], HA[i], b.upper, b.fore, ex, ey, ez);
      // the palm faces forward (0, a claw), in toward the leg (1) or down (2); in between blends
      const o = i * 3;
      const pa = RG[APALM] < 0 ? 0 : RG[APALM] > 2 ? 2 : RG[APALM];
      const w0 = pa < 1 ? 1 - pa : 0;
      const w2 = pa > 1 ? pa - 1 : 0;
      const w1 = 1 - w0 - w2;
      PALM[o] = w0 * (TF[6] - TF[3] * 0.25) + w1 * (-TF[0] * s - TF[6] * 0.3) - w2 * TF[3];
      PALM[o + 1] = w0 * (TF[7] - TF[4] * 0.25) + w1 * (-TF[1] * s - TF[7] * 0.3) - w2 * TF[4];
      PALM[o + 2] = w0 * (TF[8] - TF[5] * 0.25) + w1 * (-TF[2] * s - TF[8] * 0.3) - w2 * TF[5];
      CURL[i] = RG[ACURL];
      SPREAD[i] = RG[ASPREAD];
      WRIST[i] = RG[AWRIST];
    }

    // reach around each joint (for the fit and the ground)
    const rl = (b.rThigh + b.rShin) / 2;
    JR[PEL] = Math.max(b.waist[0], b.rThigh * 1.6);
    JR[CHE] = Math.max(b.chest[0], b.shW * 0.7 + b.rUpper);
    JR[NEC] = b.rNeck;
    JR[HED] = Math.max(b.head[0], b.head[1], b.head[2]) * (V && V.helmet === "fire" ? 1.8 : 1.45);
    for (let i = 0; i < 2; i++) {
      JR[SH[i]] = b.rUpper * 1.4;
      JR[EL[i]] = b.rFore * 1.2;
      JR[HA[i]] = b.hand * 1.6 * (b.finger || 1);
      JR[HI[i]] = rl;
      JR[KN[i]] = rl;
      JR[AN[i]] = b.rFoot * 1.1;
      JR[TO[i]] = b.rFoot;
    }

    // the fall's second stage: the whole body goes over about a point on the ground, toward fd
    RG[POOL] = 0;
    if (fall > 0) {
      if (spin) spinAll(spin * (SEED & 1 ? 1 : -1));
      if (topple > 0) {
        const dx = Math.sin(fd);
        const dz = Math.cos(fd);
        toppleAll(dx, dz, dx * pivot, dz * pivot, topple * PI * 0.5);
      }
      // rest on the ground: nothing below it. The torso by its real thickness the way it lies (on its back: front to
      // back; on its side: across), a hand by its palm, the rest by their reach. Limp arms are left out here: they are
      // laid on the floor next (else a body resting on its heap would lift them into the air)
      const cy = hyp2(b.chest[0] * TF[1], b.chest[1] * TF[7]);
      const wy = hyp2(b.waist[0] * TF[1], b.waist[1] * TF[7]);
      const groundR = (j) => (j === CHE ? cy * 1.1 : j === PEL ? Math.max(wy, b.rThigh) * 1.1 : j === HA[0] || j === HA[1] ? b.hand * 0.3 : JR[j]);
      const drop = limp * RG[LYING];
      const armsLaid = drop > 0.01;
      let low = Infinity;
      for (let j = 0; j < NJ; j++) {
        if (armsLaid && (j === EL[0] || j === EL[1] || j === HA[0] || j === HA[1])) continue;
        low = Math.min(low, J[j * 3 + 1] - groundR(j));
      }
      if (low < 0) for (let j = 0; j < NJ; j++) J[j * 3 + 1] -= low;
      // limp arms drop to the ground as the body goes over (gravity, not the torso's down): flung out to the side and
      // a little down along the body, the elbow bending out along the floor, so they lie flat
      if (armsLaid) {
        let lowA = 0;
        for (let i = 0; i < 2; i++) {
          const s = i ? 1 : -1;
          const o = SH[i] * 3;
          const h = HA[i] * 3;
          const tx = J[o] + TF[0] * s * 0.8 * L - TF[3] * 0.15 * L;
          const ty = Math.max(b.hand * 0.6, J[o + 1] - 0.9 * L);
          const tz = J[o + 2] + TF[2] * s * 0.8 * L - TF[5] * 0.15 * L;
          J[h] += (tx - J[h]) * drop;
          J[h + 1] += (ty - J[h + 1]) * drop;
          J[h + 2] += (tz - J[h + 2]) * drop;
          // the elbow points out along the floor (across the body when it lies on its side)
          let ox = TF[0] * s;
          let oz = TF[2] * s;
          if (ox * ox + oz * oz < 0.09) {
            ox = TF[5] * s;
            oz = -TF[3] * s;
          }
          ik(SH[i], EL[i], HA[i], b.upper, b.fore, ox, -0.15, oz);
          lowA = Math.min(lowA, J[EL[i] * 3 + 1] - JR[EL[i]], J[h + 1] - groundR(HA[i]));
        }
        // an arm still under the floor (the body lying on it) lifts the body
        if (lowA < 0) for (let j = 0; j < NJ; j++) J[j * 3 + 1] -= lowA;
      }
      if (GORE) {
        RG[POOL] = b.pool * smooth((fall - 0.15) / 0.85);
        RG[POOLX] = (J[PEL * 3] + J[CHE * 3]) / 2;
        RG[POOLZ] = (J[PEL * 3 + 2] + J[CHE * 3 + 2]) / 2;
      }
    }
  }
  /** Turn every joint, frame and palm about the vertical through the feet. */
  function turnY(A, o) {
    const x = A[o];
    const z = A[o + 2];
    A[o] = x * RG[RC] + z * RG[RS];
    A[o + 2] = z * RG[RC] - x * RG[RS];
  }
  function spinAll(a) {
    RG[RC] = Math.cos(a);
    RG[RS] = Math.sin(a);
    for (let j = 0; j < NJ; j++) turnY(J, j * 3);
    for (let k = 0; k < 3; k++) {
      turnY(TF, k * 3);
      turnY(PF, k * 3);
      turnY(HF, k * 3);
    }
    turnY(PALM, 0);
    turnY(PALM, 3);
    turnY(KF, 0);
    turnY(KF, 3);
  }
  /** Rotate everything by angle a about the horizontal axis through the ground point (cx, 0, cz) that tips
      "up" toward (dx, 0, dz). Rodrigues, axis k = up x d = (dz, 0, -dx). */
  function turnK(A, o, ox, oz) {
    const x = A[o] - ox;
    const y = A[o + 1];
    const z = A[o + 2] - oz;
    const kv = RG[RKX] * x + RG[RKZ] * z;
    A[o] = ox + x * RG[RC] - RG[RKZ] * y * RG[RS] + RG[RKX] * kv * (1 - RG[RC]);
    A[o + 1] = y * RG[RC] + (RG[RKZ] * x - RG[RKX] * z) * RG[RS];
    A[o + 2] = oz + z * RG[RC] + RG[RKX] * y * RG[RS] + RG[RKZ] * kv * (1 - RG[RC]);
  }
  function toppleAll(dx, dz, cx, cz, a) {
    RG[RKX] = dz;
    RG[RKZ] = -dx;
    RG[RC] = Math.cos(a);
    RG[RS] = Math.sin(a);
    for (let j = 0; j < NJ; j++) turnK(J, j * 3, cx, cz);
    for (let k = 0; k < 3; k++) {
      turnK(TF, k * 3, 0, 0);
      turnK(PF, k * 3, 0, 0);
      turnK(HF, k * 3, 0, 0);
    }
    turnK(PALM, 0, 0, 0);
    turnK(PALM, 3, 0, 0);
    turnK(KF, 0, 0, 0);
    turnK(KF, 3, 0, 0);
  }

  /* ---------- Projection ---------- */
  /** The perspective scale of a point at depth D (tiles, + away from the camera) in front of the figure's middle. */
  function kAt(D) {
    const den = RG[DIST] + D;
    let k = den > RG[DIST] / K_MAX ? RG[DIST] / den : K_MAX;
    if (RG[PSC] !== 1) k = 1 + (k - 1) * RG[PSC];
    return k < K_MIN ? K_MIN : k;
  }
  /** Model point -> screen (QX, QY) and scale QK (px per tile = PXS * QK). rb: how far the part reaches below the point,
      so nothing is drawn under the floor line. */
  function proj(x, y, z, rb) {
    const X = -(x * RG[CYAW] + z * RG[SYAW]);
    const k = kAt(x * RG[SYAW] - z * RG[CYAW]);
    RG[QX] = RG[W2] + X * RG[PXS] * k * RG[FIT];
    RG[QY] = FLR[0] - (RG[EYE] - (RG[EYE] - y) * k) * RG[PXS] * RG[FIT];
    // nothing under the floor line: a part nearer than the feet sits on it (with cam.floor: on the floor under itself)
    const low = (FLR[1] > 0 ? FLR[0] - RG[EYE] * (1 - k) * RG[PXS] * RG[FIT] : RG[CH]) - rb * RG[PXS] * k * RG[FIT];
    if (RG[QY] > low) RG[QY] = low;
    RG[QK] = k * RG[FIT];
  }
  const projJ = (j) => proj(J[j * 3], J[j * 3 + 1], J[j * 3 + 2], JR[j]);
  const depth = (x, z) => x * RG[SYAW] - z * RG[CYAW];
  const jDepth = (j) => depth(J[j * 3], J[j * 3 + 2]);
  const md3 = (a, b, c) => (jDepth(a) + jDepth(b) + jDepth(c)) / 3;

  /* ---------- Fit: how much a figure is shrunk about its feet to stay inside its region ----------
     Not from the pose being drawn (an attacker would pulse in size with every swipe, or zoom out each time it starts
     a bite) but from an envelope of every pose, worked out once per type in addType: the farthest any part reaches
     from the vertical through the feet (rh), and the highest points against how far out they are (a frontier of
     (rho, top) pairs). It holds at any yaw, so the size depends only on the type and the camera. The pose being
     drawn is still checked as a safety net (a falling body; an odd pose between the samples). */
  const ENV_MAX = 24; // SCALE: most frontier points kept per type (only the outermost few ever matter)
  /** How much the envelope env lets the figure be drawn (1 = full size) with half-width wlim and the region's height. */
  function envFit(env, wlim, pad) {
    const R = env.rh;
    let hx = 0;
    for (let k = 0; k <= 4; k++) {
      const sn = -k / 4; // from the side round to straight at the camera, where the perspective is biggest
      const v = R * Math.sqrt(1 - sn * sn) * kAt(R * sn);
      if (v > hx) hx = v;
    }
    let top = 0;
    for (let i = 0; i < env.n; i++) {
      const rho = env.rho[i];
      const y = env.top[i] - RG[EYE];
      // (cam.floor, an eye over this point: its far side shows highest)
      const v = RG[EYE] + y * (y < 0 && FLR[1] > 0 ? Math.min(kAt(-rho), kAt(rho)) : Math.max(kAt(-rho), kAt(rho)));
      if (v > top) top = v;
    }
    let f = 1;
    if (hx > 0) f = Math.min(f, (wlim - pad) / (hx * RG[PXS]));
    if (top > 0) f = Math.min(f, (FLR[0] - pad) / (top * RG[PXS]));
    return f > 0.05 ? f : 0.05;
  }
  function fit() {
    const pad = 1 + RG[OUT];
    // the envelope: the region's half-width, but never more than the standing box's (a falling body's wider region
    // must not make it grow as it starts to fall); with cam.floor the margin is the caller's room around the box
    // (running, the sprint's envelope and the width it needs, wRun)
    const w = RUNNING && T.wRun ? T.wRun : T.w;
    RG[FIT_ENV] = envFit(RUNNING && T.envRun ? T.envRun : T.env, Math.min(RG[W2], FLR[1] > 0 ? (w * RG[PXS]) / 2 + pad : (w * RG[PXS]) / 2), pad);
    // the pose itself, as a safety net
    RG[FIT] = 1;
    let hx = 0;
    let top = RG[CH];
    for (let j = 0; j < NJ; j++) {
      projJ(j);
      const r = JR[j] * RG[PXS] * RG[QK] + pad;
      hx = Math.max(hx, Math.abs(RG[QX] - RG[W2]) + r);
      top = Math.min(top, RG[QY] - r);
    }
    let f = RG[FIT_ENV];
    if (hx > RG[W2]) f = Math.min(f, RG[W2] / hx);
    if (top < 0) f = Math.min(f, FLR[0] / (FLR[0] - top));
    RG[FIT] = f;
    for (let j = 0; j < NJ; j++) {
      projJ(j);
      S[j * 3] = RG[QX];
      S[j * 3 + 1] = RG[QY];
      S[j * 3 + 2] = RG[QK];
    }
  }

  /* ---------- Ellipses: an ellipsoid or a flat ellipse in the model, as its outline on screen ---------- */
  /** Centre c and up to three half-axis vectors a, b, g (model tiles; pass zeros for a flat one). */
  function ellipsoid(cx, cy, cz, ax, ay, az, bx, by, bz, gx, gy, gz, rb) {
    proj(cx, cy, cz, rb);
    RG[EX] = RG[QX];
    RG[EY] = RG[QY];
    const K = RG[PXS] * RG[QK];
    const a1 = -(ax * RG[CYAW] + az * RG[SYAW]) * K;
    const a2 = -ay * K;
    const b1 = -(bx * RG[CYAW] + bz * RG[SYAW]) * K;
    const b2 = -by * K;
    const g1 = -(gx * RG[CYAW] + gz * RG[SYAW]) * K;
    const g2 = -gy * K;
    const p = a1 * a1 + b1 * b1 + g1 * g1;
    const q = a1 * a2 + b1 * b2 + g1 * g2;
    const r = a2 * a2 + b2 * b2 + g2 * g2;
    const mm = (p + r) / 2;
    const d = Math.sqrt(((p - r) / 2) * ((p - r) / 2) + q * q);
    RG[ERA] = Math.sqrt(Math.max(0.01, mm + d));
    RG[ERB] = Math.sqrt(Math.max(0.01, mm - d));
    RG[ERO] = 0.5 * Math.atan2(2 * q, p - r);
    // keep it above the floor line
    const sn = Math.sin(RG[ERO]);
    const cs = Math.cos(RG[ERO]);
    const ext = Math.sqrt(RG[ERA] * RG[ERA] * sn * sn + RG[ERB] * RG[ERB] * cs * cs);
    if (RG[EY] + ext > RG[CH]) RG[EY] = RG[CH] - ext;
  }
  /** An ellipsoid on head frame axes: centre (local r, u, f from joint j's frame F) with radii. */
  function ellF(F, j, r, u, f, ra, rb, rc) {
    const o = j * 3;
    ellipsoid(
      J[o] + F[0] * r + F[3] * u + F[6] * f,
      J[o + 1] + F[1] * r + F[4] * u + F[7] * f,
      J[o + 2] + F[2] * r + F[5] * u + F[8] * f,
      F[0] * ra,
      F[1] * ra,
      F[2] * ra,
      F[3] * rb,
      F[4] * rb,
      F[5] * rb,
      F[6] * rc,
      F[7] * rc,
      F[8] * rc,
      0
    );
  }
  function ellPath(grow) {
    G.beginPath();
    ellA(RG[EX], RG[EY], RG[ERA] + grow, RG[ERB] + grow, RG[ERO], 0, TAU);
  }
  /** Add the current ellipse as its own sub-path (no line from the last point). */
  function ellSub(grow) {
    ellIn(RG[EX], RG[EY], RG[ERA] + grow, RG[ERB] + grow, RG[ERO]);
    G.moveTo(RG[ECX] + (RG[ERA] + grow) * Math.cos(RG[ERO]), RG[ECY] + (RG[ERA] + grow) * Math.sin(RG[ERO]));
    G.ellipse(RG[ECX], RG[ECY], RG[ERA] + grow, RG[ERB] + grow, RG[ERO], 0, TAU);
  }
  /** Fill the current ellipse and ink its edge. */
  function ellInk(fill) {
    ellPath(0);
    G.fillStyle = fill;
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = Math.min(RG[OUT] * 2, Math.max(0.8, RG[ERB] * 0.4));
    G.stroke();
  }
  /** A model direction n (unit-ish) faces the camera by this much (-1..1). */
  const facing = (nx, nz) => nx * RG[TCX] + nz * RG[TCZ];

  /* ---------- Path calls, kept inside the region (the fit sizes the figure; these only catch the odd tatter or
     tooth of a body lying near the floor line) ---------- */
  const clx = (x) => (x < 0 ? 0 : x > RG[CW] ? RG[CW] : x);
  const cly = (y) => (y < 0 ? 0 : y > RG[CH] ? RG[CH] : y);
  function mt(x, y) {
    G.moveTo(clx(x), cly(y));
  }
  function lt(x, y) {
    G.lineTo(clx(x), cly(y));
  }
  function qt(x1, y1, x, y) {
    G.quadraticCurveTo(clx(x1), cly(y1), clx(x), cly(y));
  }
  /** Centre (x, y) of an ellipse moved just enough to keep it inside the region. */
  function ellIn(x, y, a, b, r) {
    const c = Math.cos(r);
    const s = Math.sin(r);
    const ex = Math.sqrt(a * a * c * c + b * b * s * s);
    const ey = Math.sqrt(a * a * s * s + b * b * c * c);
    RG[ECX] = ex * 2 >= RG[CW] ? RG[W2] : x < ex ? ex : x > RG[CW] - ex ? RG[CW] - ex : x;
    RG[ECY] = ey * 2 >= RG[CH] ? RG[CH] / 2 : y < ey ? ey : y > RG[CH] - ey ? RG[CH] - ey : y;
  }
  /** A whole ellipse as its own sub-path (no line from the last point). */
  function elSub(x, y, a, b, r) {
    ellIn(x, y, a, b, r);
    G.moveTo(RG[ECX] + a * Math.cos(r), RG[ECY] + a * Math.sin(r));
    G.ellipse(RG[ECX], RG[ECY], a, b, r, 0, TAU);
  }
  function ellA(x, y, a, b, r, a0, a1, ccw) {
    ellIn(x, y, a, b, r);
    G.ellipse(RG[ECX], RG[ECY], a, b, r, a0, a1, ccw);
  }

  /* ---------- Strokes ---------- */
  function seg(x0, y0, x1, y1) {
    G.beginPath();
    mt(x0, y0);
    lt(x1, y1);
    G.stroke();
  }
  /** Joints a -> b as a stroke. */
  function segJ(a, b) {
    seg(S[a * 3], S[a * 3 + 1], S[b * 3], S[b * 3 + 1]);
  }
  /** The side of a stroke from (x0,y0) to (x1,y1) away from the light, as a unit offset (NX, NY). */
  function shadeSide(x0, y0, x1, y1) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    const l = hyp2(dx, dy) || 1;
    RG[NX] = -dy / l;
    RG[NY] = dx / l;
    if (RG[NX] * SLX + RG[NY] * SLY > 0) {
      RG[NX] = -RG[NX];
      RG[NY] = -RG[NY];
    }
  }

  /* ---------- Ground: the shadow and, when gore is on, the pool under a fallen walker ---------- */
  /** A disc on the floor, centre (cx, cz), half-axes ra along (ux, uz) (unit) and rb square to it, seen in
      perspective (from the camera's height its depth shrinks to EYE / DIST of its width), as EX.. . The floor line
      is the bottom of the region, so a disc that would reach below it is lifted to sit on it (the light is behind
      the camera, so a shadow falls away from it anyway). */
  function projG(x, z) {
    const k = kAt(x * RG[SYAW] - z * RG[CYAW]);
    RG[GX] = RG[W2] - (x * RG[CYAW] + z * RG[SYAW]) * RG[PXS] * k * RG[FIT];
    RG[GY] = FLR[0] - RG[EYE] * (1 - k) * RG[PXS] * RG[FIT];
  }
  function groundEll(cx, cz, ux, uz, ra, rb) {
    projG(cx, cz);
    const x0 = RG[GX];
    const y0 = RG[GY];
    projG(cx + ux * ra, cz + uz * ra);
    let a1 = RG[GX];
    let a2 = RG[GY];
    projG(cx - ux * ra, cz - uz * ra);
    a1 = (a1 - RG[GX]) / 2;
    a2 = (a2 - RG[GY]) / 2;
    projG(cx - uz * rb, cz + ux * rb);
    let b1 = RG[GX];
    let b2 = RG[GY];
    projG(cx + uz * rb, cz - ux * rb);
    b1 = (b1 - RG[GX]) / 2;
    b2 = (b2 - RG[GY]) / 2;
    const p = a1 * a1 + b1 * b1;
    const q = a1 * a2 + b1 * b2;
    const r = a2 * a2 + b2 * b2;
    const mm = (p + r) / 2;
    const d = Math.sqrt(((p - r) / 2) * ((p - r) / 2) + q * q);
    RG[ERA] = Math.sqrt(Math.max(0.01, mm + d));
    RG[ERB] = Math.sqrt(Math.max(0.01, mm - d));
    RG[ERO] = 0.5 * Math.atan2(2 * q, p - r);
    RG[EX] = x0;
    const sn = Math.sin(RG[ERO]);
    const cs = Math.cos(RG[ERO]);
    const ext = Math.sqrt(RG[ERA] * RG[ERA] * sn * sn + RG[ERB] * RG[ERB] * cs * cs);
    RG[EY] = Math.min(y0, RG[CH] - ext - 1);
  }
  function drawGround() {
    if (LOD < 2 && SHADOW) {
      // soft contact shadow under the feet (or the body)
      const cx = ((J[AN[0] * 3] + J[AN[1] * 3]) / 2) * (1 - RG[LYING]) + ((J[PEL * 3] + J[CHE * 3]) / 2) * RG[LYING];
      const cz = ((J[AN[0] * 3 + 2] + J[AN[1] * 3 + 2]) / 2) * (1 - RG[LYING]) + ((J[PEL * 3 + 2] + J[CHE * 3 + 2]) / 2) * RG[LYING];
      const r = T.build.shadow * (1 + RG[LYING] * 0.9);
      groundEll(cx, cz, 1, 0, r, r * 0.75);
      shrinkToRegion();
      G.beginPath();
      ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], 0, TAU);
      G.fillStyle = "rgba(0,0,0,0.32)";
      G.fill();
    }
    if (RG[POOL] > 0.005) {
      // longer along the body
      let ux = J[CHE * 3] - J[PEL * 3];
      let uz = J[CHE * 3 + 2] - J[PEL * 3 + 2];
      const ul = hyp2(ux, uz);
      if (ul > 1e-3) {
        ux /= ul;
        uz /= ul;
      } else {
        ux = 1;
        uz = 0;
      }
      groundEll(RG[POOLX], RG[POOLZ], ux, uz, RG[POOL] * 1.15, RG[POOL] * 0.8);
      shrinkToRegion();
      G.beginPath();
      ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], 0, TAU);
      G.fillStyle = col(V.blood, 0.8, 0.95);
      G.fill();
      if (LOD < 2) {
        G.beginPath();
        ellA(RG[EX] - RG[ERA] * 0.12, RG[EY] - RG[ERB] * 0.12, RG[ERA] * 0.62, RG[ERB] * 0.45, RG[ERO], 0, TAU);
        G.fillStyle = col(V.blood, 1.25, 0.7);
        G.fill();
      }
    }
  }
  /** Keep the last ellipse inside the region (the ground ones may be wider than a narrow region). */
  function shrinkToRegion() {
    const m = RG[OUT] + 1;
    const ext = Math.max(RG[ERA], RG[ERB]);
    const room = Math.min(RG[EX] - m, RG[CW] - m - RG[EX]);
    if (ext > room && room > 0.5) {
      const k = room / ext;
      RG[ERA] *= k;
      RG[ERB] *= k;
    }
    if (RG[ERB] > RG[CH] / 2) RG[ERB] = RG[CH] / 2;
  }

  /* ---------- Legs ---------- */
  /** Both legs far away (lod 2): one ink stroke, one trouser stroke and one boot stroke for the pair. */
  const LL = new Float64Array(28);
  function legPts(i, o) {
    const b = T.build;
    const an = AN[i];
    const to = TO[i];
    const kn = KN[i];
    const ax = J[an * 3];
    const ay = J[an * 3 + 1];
    const az = J[an * 3 + 2];
    const tx = J[to * 3];
    const ty = J[to * 3 + 1];
    const tz = J[to * 3 + 2];
    proj(ax - (tx - ax) * 0.22, ay - b.ankle * 0.45, az - (tz - az) * 0.22, b.rFoot);
    LL[o] = RG[QX]; // heel
    LL[o + 1] = RG[QY];
    proj(tx, ty, tz, b.rFoot);
    LL[o + 2] = RG[QX]; // toe
    LL[o + 3] = RG[QY];
    proj(ax + (J[kn * 3] - ax) * 0.22, ay + (J[kn * 3 + 1] - ay) * 0.22, az + (J[kn * 3 + 2] - az) * 0.22, 0);
    LL[o + 4] = RG[QX]; // where the trousers stop
    LL[o + 5] = RG[QY];
    LL[o + 6] = (b.rThigh + b.rShin) * RG[PXS] * S[kn * 3 + 2];
    LL[o + 7] = b.rFoot * 2 * RG[PXS] * S[an * 3 + 2];
  }
  /** Legs far away (lod 1 and 2): one leg or both (mask bit i). Ink and trousers, the knee rips and pads (lod 1),
      then the boots' ink and leather: each one call for all of them. Lod 2 boots are just the foot. */
  function drawLegsLow(mask) {
    let wl = 0;
    let wb = 0;
    for (let i = 0; i < 2; i++) {
      if (!(mask & (1 << i))) continue;
      legPts(i, i * 8);
      wl = Math.max(wl, LL[i * 8 + 6]);
      wb = Math.max(wb, LL[i * 8 + 7]);
    }
    for (let pass = 0; pass < 4; pass++) {
      if (pass === 2 && LOD === 1) legDecalsLow(mask);
      G.beginPath();
      for (let i = 0; i < 2; i++) {
        if (!(mask & (1 << i))) continue;
        const o = i * 8;
        if (pass < 2) {
          mt(S[HI[i] * 3], S[HI[i] * 3 + 1]);
          lt(S[KN[i] * 3], S[KN[i] * 3 + 1]);
          lt(LL[o + 4], LL[o + 5]);
        } else {
          if (LOD === 1) {
            mt(LL[o + 4], LL[o + 5]);
            lt(S[AN[i] * 3], S[AN[i] * 3 + 1]);
          }
          mt(LL[o], LL[o + 1]);
          lt(LL[o + 2], LL[o + 3]);
        }
      }
      G.strokeStyle = pass === 1 ? col(V.legs || V.pants, 1, 1) : pass === 3 ? col(V.shoe, 1, 1) : INKS;
      G.lineWidth = pass === 0 ? wl + RG[OUT] * 2 : pass === 1 ? wl : pass === 2 ? wb + RG[OUT] * 2 : wb;
      G.stroke();
    }
  }
  /** The knee rips (one fill) and knee pads (one fill, one ink) of the legs in mask, far away. */
  function legDecalsLow(mask) {
    if (V.kneeRip) {
      G.beginPath();
      let any = false;
      for (let i = 0; i < 2; i++) if (mask & (1 << i) && V.kneeRip[i]) any = ripPath(i, LL[i * 8 + 6], LL[i * 8 + 4], LL[i * 8 + 5]) || any;
      if (any) {
        G.fillStyle = col(V.skin, 0.86, 1);
        G.fill();
      }
    }
    if (V.pads) {
      G.beginPath();
      let any = false;
      for (let i = 0; i < 2; i++) {
        if (!(mask & (1 << i)) || kneePad(i) <= -0.4) continue;
        ellSub(0);
        any = true;
      }
      if (any) {
        G.fillStyle = col(V.pad, 1, 1);
        G.fill();
        G.strokeStyle = INKS;
        G.lineWidth = RG[OUT] * 1.4;
        G.stroke();
      }
    }
  }
  /** Knee pad i as EX..; returns how much it faces the camera. */
  function kneePad(i) {
    const kn = KN[i] * 3;
    const r0 = T.build.rShin;
    ellipsoid(J[kn] + KF[i * 3] * r0 * 0.7, J[kn + 1] + 0.008, J[kn + 2] + KF[i * 3 + 2] * r0 * 0.7, r0 * 0.95, 0, 0, 0, r0 * 1.15, 0, 0, 0, r0 * 0.7, 0);
    return facing(KF[i * 3], KF[i * 3 + 2]);
  }
  /** Adds knee rip i (trouser width wl, the shin's end at bx, by) to the path when it faces the camera. */
  function ripPath(i, wl, bx, by) {
    const kn = KN[i];
    const f = facing(KF[i * 3], KF[i * 3 + 2]) / (hyp3(KF[i * 3], KF[i * 3 + 1], KF[i * 3 + 2]) || 1);
    if (f <= 0.15) return false;
    const b = T.build;
    const r0 = b.rShin * 0.95;
    proj(J[kn * 3] + KF[i * 3] * r0 * 0.6, J[kn * 3 + 1] - b.shin * 0.1, J[kn * 3 + 2] + KF[i * 3 + 2] * r0 * 0.6, 0);
    tearPath(RG[QX], RG[QY], S[kn * 3], S[kn * 3 + 1], bx, by, wl * 0.4 * (0.55 + 0.45 * f), wl * 1.05, i * 7 + 3);
    return true;
  }
  function drawLeg(i) {
    if (LOD > 0) return drawLegsLow(LEGPAIR ? 3 : 1 << i);
    const b = T.build;
    const hi = HI[i];
    const kn = KN[i];
    const an = AN[i];
    const to = TO[i];
    const k = S[an * 3 + 2];
    const wl = (b.rThigh + b.rShin) * RG[PXS] * S[kn * 3 + 2];
    const wb = b.rFoot * 2 * RG[PXS] * k;
    // boot: heel to toe, and the shaft up the shin
    const ax = J[an * 3];
    const ay = J[an * 3 + 1];
    const az = J[an * 3 + 2];
    const tx = J[to * 3];
    const ty = J[to * 3 + 1];
    const tz = J[to * 3 + 2];
    proj(ax - (tx - ax) * 0.22, ay - b.ankle * 0.45, az - (tz - az) * 0.22, b.rFoot);
    const hx = RG[QX];
    const hy = RG[QY];
    proj(tx, ty, tz, b.rFoot);
    const ex = RG[QX];
    const ey = RG[QY];
    // the shin's end, where the trousers stop
    const kx = J[kn * 3];
    const ky = J[kn * 3 + 1];
    const kz = J[kn * 3 + 2];
    proj(ax + (kx - ax) * 0.22, ay + (ky - ay) * 0.22, az + (kz - az) * 0.22, 0);
    const bx = RG[QX];
    const by = RG[QY];
    const pants = V.legs || V.pants;
    // trouser leg: ink, then cloth (one path)
    G.beginPath();
    mt(S[hi * 3], S[hi * 3 + 1]);
    lt(S[kn * 3], S[kn * 3 + 1]);
    lt(bx, by);
    G.strokeStyle = INKS;
    G.lineWidth = wl + RG[OUT] * 2;
    G.stroke();
    G.strokeStyle = col(pants, 1, 1);
    G.lineWidth = wl;
    G.stroke();
    if (LOD === 0) {
      // shade down the side away from the light
      shadeSide(S[hi * 3], S[hi * 3 + 1], bx, by);
      const o = wl * 0.27;
      G.beginPath();
      mt(S[hi * 3] + RG[NX] * o, S[hi * 3 + 1] + RG[NY] * o);
      lt(S[kn * 3] + RG[NX] * o, S[kn * 3 + 1] + RG[NY] * o);
      lt(bx + RG[NX] * o, by + RG[NY] * o);
      G.strokeStyle = col(BLACK, 1, 0.22);
      G.lineWidth = wl * 0.42;
      G.stroke();
    }
    // a rip at the knee: bare, grey-green skin through torn cloth
    if (V.kneeRip && V.kneeRip[i]) {
      G.beginPath();
      if (ripPath(i, wl, bx, by)) tearDraw();
    }
    // knee pad (riot gear)
    if (V.pads) {
      const f = kneePad(i);
      if (f > -0.4) {
        ellInk(col(V.pad, 1 + 0.3 * f, 1));
        if (LOD === 0) shine(0.22);
      }
    }
    // frayed trouser ends over the boot
    if (LOD === 0 && V.fray) {
      shadeSide(S[kn * 3], S[kn * 3 + 1], bx, by);
      let dx = bx - S[kn * 3];
      let dy = by - S[kn * 3 + 1];
      const l = hyp2(dx, dy) || 1;
      dx /= l;
      dy /= l;
      G.beginPath();
      for (let n = 0; n < 3; n++) {
        const u = (n / 2 - 0.5) * wl * 0.8;
        const d = wl * (0.18 + 0.22 * rnd(500 + i * 4 + n));
        mt(bx + RG[NX] * u - dx * wl * 0.1, by + RG[NY] * u - dy * wl * 0.1);
        lt(bx + RG[NX] * (u + wl * 0.12) + dx * d, by + RG[NY] * (u + wl * 0.12) + dy * d);
        lt(bx + RG[NX] * (u + wl * 0.24) - dx * wl * 0.1, by + RG[NY] * (u + wl * 0.24) - dy * wl * 0.1);
      }
      G.fillStyle = col(pants, 0.85, 1);
      G.fill();
      G.strokeStyle = INKS;
      G.lineWidth = Math.max(0.6, RG[OUT] * 0.6);
      G.stroke();
    }
    // boot: ink, then leather (shaft and foot in one path), then the sole and a shine
    G.beginPath();
    mt(bx, by);
    lt(S[an * 3], S[an * 3 + 1]);
    mt(hx, hy);
    lt(ex, ey);
    G.strokeStyle = INKS;
    G.lineWidth = wb + RG[OUT] * 2;
    G.stroke();
    G.strokeStyle = col(V.shoe, 1, 1);
    G.lineWidth = wb;
    G.stroke();
    if (LOD === 0) {
      G.strokeStyle = col(V.sole || BLACK, 1, 1);
      G.lineWidth = wb * 0.3;
      seg(hx, hy + wb * 0.36, ex, ey + wb * 0.32);
      G.strokeStyle = col(WHITE, 1, 0.16);
      G.lineWidth = wb * 0.2;
      seg(hx - wb * 0.05, hy - wb * 0.24, hx + (ex - hx) * 0.6, hy + (ey - hy) * 0.6 - wb * 0.26);
    }
  }
  /** A ragged hole torn in the cloth at (x, y) on a limb running from (x0,y0) to (x1,y1): an irregular outline
      (5 to 7 points, jittered by the seed), skin showing through, the cloth's torn top edge casting a dark band into
      it and pale frayed threads hanging over its edge. Far away (lod 1) just the hole. */
  const TEAR = new Float64Array(16);
  let TN = 0;
  let TSALT = 0;
  /** Adds the hole's outline to the path (and keeps it for tearDraw). */
  function tearPath(x, y, x0, y0, x1, y1, rw, rl, salt) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    const l = hyp2(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const n = 5 + Math.floor(rnd(salt) * 3);
    for (let k = 0; k < n; k++) {
      const a = ((k + (rnd(salt + 10 + k) - 0.5) * 0.55) / n) * TAU;
      const r = 0.62 + 0.38 * rnd(salt + 20 + k);
      const u = Math.cos(a) * rw * r; // across the limb
      const v = Math.sin(a) * rl * 0.5 * r; // along it (+ down the limb)
      TEAR[k * 2] = x - dy * u + dx * v;
      TEAR[k * 2 + 1] = y + dx * u + dy * v;
    }
    TN = n;
    RG[TX] = x;
    RG[TY] = y;
    RG[TDX] = dx;
    RG[TDY] = dy;
    RG[TRW] = rw;
    RG[TRL] = rl;
    TSALT = salt;
    mt(TEAR[0], TEAR[1]);
    for (let k = 1; k < n; k++) lt(TEAR[k * 2], TEAR[k * 2 + 1]);
    G.closePath();
  }
  /** Fills the hole tearPath just made, then (up close) its ink, the torn edge's shadow and the frayed threads. */
  function tearDraw() {
    const n = TN;
    const x = RG[TX];
    const y = RG[TY];
    const dx = RG[TDX];
    const dy = RG[TDY];
    const rw = RG[TRW];
    const rl = RG[TRL];
    const salt = TSALT;
    G.fillStyle = col(V.skin, 0.86, 1);
    G.fill();
    if (LOD > 0) return;
    G.strokeStyle = INKS;
    G.lineWidth = Math.max(0.7, RG[OUT] * 0.8);
    G.stroke();
    // the torn top edge's shadow inside the hole: the points up the limb (v < 0), pulled a little inward
    G.beginPath();
    let started = false;
    for (let k = 0; k <= n; k++) {
      const i = (k % n) * 2;
      const v = (TEAR[i] - x) * dx + (TEAR[i + 1] - y) * dy;
      if (v < rl * 0.08) {
        const px = x + (TEAR[i] - x) * 0.82 + dx * rl * 0.06;
        const py = y + (TEAR[i + 1] - y) * 0.82 + dy * rl * 0.06;
        if (started) lt(px, py);
        else mt(px, py);
        started = true;
      } else started = false;
    }
    G.strokeStyle = col(BLACK, 1, 0.45);
    G.lineWidth = Math.max(0.8, rw * 0.32);
    G.stroke();
    // frayed threads hanging over the edge, down the limb
    G.beginPath();
    for (let k = 0; k < n; k += 2) {
      const i = k * 2;
      const fl = rl * (0.12 + 0.14 * rnd(salt + 30 + k));
      mt(TEAR[i], TEAR[i + 1]);
      lt(TEAR[i] + dx * fl + (TEAR[i] - x) * 0.12, TEAR[i + 1] + dy * fl + (TEAR[i + 1] - y) * 0.12);
    }
    G.strokeStyle = col(V.thread, 1, 0.9);
    G.lineWidth = Math.max(0.6, RG[OUT] * 0.55);
    G.stroke();
  }
  /** A soft shine on the upper left of the current ellipse. */
  function shine(a) {
    G.beginPath();
    ellA(RG[EX] - RG[ERA] * 0.3 * Math.cos(RG[ERO]) + RG[ERB] * 0.3 * Math.sin(RG[ERO]), RG[EY] - RG[ERB] * 0.34, RG[ERA] * 0.34, RG[ERB] * 0.22, RG[ERO], 0, TAU);
    G.fillStyle = col(WHITE, 1, a);
    G.fill();
  }
  /** A shadow crescent inside the current ellipse, on the side away from the light. */
  function crescent(a, depth) {
    const sa = Math.atan2(-SLY, -SLX) - RG[ERO];
    const dx = -Math.cos(sa + RG[ERO]) * RG[ERA] * depth;
    const dy = -Math.sin(sa + RG[ERO]) * RG[ERB] * depth;
    G.beginPath();
    ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], sa - 1.5, sa + 1.5, false);
    ellA(RG[EX] + dx, RG[EY] + dy, RG[ERA] * 0.94, RG[ERB] * 0.96, RG[ERO], sa + 1.5, sa - 1.5, true);
    G.closePath();
    G.fillStyle = col(BLACK, 1, a);
    G.fill();
  }

  /* ---------- Arms and hands ---------- */
  function drawArm(i) {
    const b = T.build;
    const sh = SH[i];
    const el = EL[i];
    const ha = HA[i];
    const k = S[el * 3 + 2];
    const wu = b.rUpper * 2 * RG[PXS] * k;
    const wf = b.rFore * 2 * RG[PXS] * k;
    const sleeve = V.sleeve;
    const skin = V.skin;
    const armCol = sleeve === "long" ? V.sleeveCol || V.shirt : skin;
    if (LOD > 0) return drawArmsLow(ARMPAIR ? 3 : 1 << i);
    // the hand behind the arm when the arm points away: draw it first
    const handFar = depth(J[ha * 3], J[ha * 3 + 2]) > depth(J[el * 3], J[el * 3 + 2]);
    if (handFar) drawHand(i);
    if (b.muscle) {
      // big bare arms: a shoulder cap, a bulging upper arm and forearm (ink first, then skin), each shaded
      for (let pass = 0; pass < 2; pass++) {
        const grow = pass ? 0 : RG[OUT];
        G.fillStyle = pass ? col(skin, 1, 1) : INKS;
        G.beginPath();
        muscle(sh, el, 0.08, b.rUpper * 1.25, b.rUpper * 1.22);
        ellSub(grow);
        muscle(sh, el, 0.52, b.upper * 0.6, b.rUpper * 1.02);
        ellSub(grow);
        muscle(el, ha, 0.36, b.fore * 0.64, b.rFore * 1.12);
        ellSub(grow);
        muscle(el, ha, 0.86, b.fore * 0.24, b.rFore * 0.86);
        ellSub(grow);
        G.fill();
      }
      // shade each bulge on its dark side, and a shine on its lit side
      muscle(el, ha, 0.36, b.fore * 0.64, b.rFore * 1.12);
      crescent(0.24, 0.3);
      {
        shine(0.09);
        muscle(sh, el, 0.52, b.upper * 0.6, b.rUpper * 1.02);
        crescent(0.24, 0.3);
        shine(0.09);
      }
      if (LOD === 0) {
        muscle(sh, el, 0.08, b.rUpper * 1.25, b.rUpper * 1.22);
        crescent(0.2, 0.28);
        shine(0.1);
        // the line where the shoulder meets the arm
        muscle(sh, el, 0.08, b.rUpper * 1.25, b.rUpper * 1.22);
        G.beginPath();
        ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], 0.3, 2.2, false);
        G.strokeStyle = col(INK, 1, 0.55);
        G.lineWidth = Math.max(0.7, RG[OUT] * 0.7);
        G.stroke();
      }
    } else if (LOD === 1) {
      G.beginPath();
      mt(S[sh * 3], S[sh * 3 + 1]);
      lt(S[el * 3], S[el * 3 + 1]);
      lt(S[ha * 3], S[ha * 3 + 1]);
      G.strokeStyle = INKS;
      G.lineWidth = (wu + wf) / 2 + RG[OUT] * 2;
      G.stroke();
      G.strokeStyle = col(armCol, 1, 1);
      G.lineWidth = (wu + wf) / 2;
      G.stroke();
    } else {
      G.strokeStyle = INKS;
      G.lineWidth = wu + RG[OUT] * 2;
      segJ(sh, el);
      G.lineWidth = wf + RG[OUT] * 2;
      segJ(el, ha);
      G.strokeStyle = col(armCol, 1, 1);
      G.lineWidth = wu;
      segJ(sh, el);
      G.lineWidth = wf;
      segJ(el, ha);
      if (LOD === 0) {
        shadeSide(S[sh * 3], S[sh * 3 + 1], S[ha * 3], S[ha * 3 + 1]);
        G.strokeStyle = col(BLACK, 1, 0.2);
        G.lineWidth = wf * 0.45;
        G.beginPath();
        mt(S[sh * 3] + RG[NX] * wu * 0.28, S[sh * 3 + 1] + RG[NY] * wu * 0.28);
        lt(S[el * 3] + RG[NX] * wf * 0.28, S[el * 3 + 1] + RG[NY] * wf * 0.28);
        lt(S[ha * 3] + RG[NX] * wf * 0.28, S[ha * 3 + 1] + RG[NY] * wf * 0.28);
        G.stroke();
      }
    }
    // sleeves: a short ragged one, or a cuff at the wrist of a long one
    if (sleeve === "short") {
      const x0 = S[sh * 3];
      const y0 = S[sh * 3 + 1];
      let ux = S[el * 3] - x0;
      let uy = S[el * 3 + 1] - y0;
      const ul = hyp2(ux, uy) || 1;
      const x1 = x0 + ux * 0.48;
      const y1 = y0 + uy * 0.48;
      ux /= ul;
      uy /= ul;
      const ww = wu * 1.38;
      // butt ends: the sleeve is cut off, then torn
      G.lineCap = "butt";
      G.strokeStyle = INKS;
      G.lineWidth = ww + RG[OUT] * 2;
      seg(x0, y0, x1 + ux * RG[OUT], y1 + uy * RG[OUT]);
      G.strokeStyle = col(V.shirt, 0.95, 1);
      G.lineWidth = ww;
      seg(x0 - ux * ww * 0.1, y0 - uy * ww * 0.1, x1, y1);
      G.lineCap = "round";
      if (LOD === 0) {
        // ragged points hanging past the cut
        G.beginPath();
        for (let n = 0; n < 3; n++) {
          const u0 = (n / 3 - 0.5) * ww;
          const u1 = ((n + 1) / 3 - 0.5) * ww;
          const d = ww * (0.18 + 0.2 * rnd(520 + i * 3 + n));
          mt(x1 - uy * u0, y1 + ux * u0);
          lt(x1 - uy * (u0 + u1) * 0.5 + ux * d, y1 + ux * (u0 + u1) * 0.5 + uy * d);
          lt(x1 - uy * u1, y1 + ux * u1);
        }
        G.fillStyle = col(V.shirt, 0.95, 1);
        G.fill();
        G.strokeStyle = INKS;
        G.lineWidth = Math.max(0.6, RG[OUT] * 0.7);
        G.stroke();
      }
    } else if (sleeve === "long") {
      const x0 = S[el * 3] + (S[ha * 3] - S[el * 3]) * 0.72;
      const y0 = S[el * 3 + 1] + (S[ha * 3 + 1] - S[el * 3 + 1]) * 0.72;
      G.strokeStyle = INKS;
      G.lineWidth = wf * 1.3 + RG[OUT] * 2;
      seg(x0, y0, S[ha * 3], S[ha * 3 + 1]);
      G.strokeStyle = col(V.cuff || V.sleeveCol || V.shirt, 0.85, 1);
      G.lineWidth = wf * 1.3;
      seg(x0, y0, S[ha * 3], S[ha * 3 + 1]);
      if (V.bands) {
        G.strokeStyle = col(V.band, 1, 1);
        G.lineWidth = wf * 0.4;
        const mx = (x0 + S[ha * 3]) / 2;
        const my = (y0 + S[ha * 3 + 1]) / 2;
        shadeSide(x0, y0, S[ha * 3], S[ha * 3 + 1]);
        seg(mx - RG[NX] * wf * 0.62, my - RG[NY] * wf * 0.62, mx + RG[NX] * wf * 0.62, my + RG[NY] * wf * 0.62);
      }
    }
    if (V.pads) {
      // shoulder pad
      padEll(i);
      ellInk(col(V.pad, 1, 1));
      if (LOD === 0) shine(0.18);
    }
    if (V.armBlood && V.armBlood[i]) {
      // a smear down the forearm (grime when gore is off)
      G.strokeStyle = goreCol(1, 0.5);
      G.lineWidth = wf * 0.3;
      const x0 = S[el * 3] + (S[ha * 3] - S[el * 3]) * 0.2;
      const y0 = S[el * 3 + 1] + (S[ha * 3 + 1] - S[el * 3 + 1]) * 0.2;
      seg(x0, y0, x0 + (S[ha * 3] - x0) * 0.5, y0 + (S[ha * 3 + 1] - y0) * 0.5);
    }
    if (!handFar) drawHand(i);
  }
  /** Arms far away (lod 1 and 2): one arm or both (mask bit i set for arm i). Each pass (ink, colour, sleeves, pads,
      hands) is one canvas call for all of them, which is most of what a far figure costs. */
  function drawArmsLow(mask) {
    const b = T.build;
    const sleeve = V.sleeve;
    const armCol = sleeve === "long" ? V.sleeveCol || V.shirt : V.skin;
    let k = 0;
    for (let i = 0; i < 2; i++) if (mask & (1 << i)) k = Math.max(k, S[EL[i] * 3 + 2]);
    const wu = b.rUpper * 2 * RG[PXS] * k;
    const wf = b.rFore * 2 * RG[PXS] * k;
    if (b.muscle && LOD === 1) {
      // bulging bare arms: every bulge of every arm in one ink pass, then one skin pass
      for (let pass = 0; pass < 2; pass++) {
        const grow = pass ? 0 : RG[OUT];
        G.beginPath();
        for (let i = 0; i < 2; i++) {
          if (!(mask & (1 << i))) continue;
          muscle(SH[i], EL[i], 0.08, b.rUpper * 1.25, b.rUpper * 1.22);
          ellSub(grow);
          muscle(SH[i], EL[i], 0.52, b.upper * 0.6, b.rUpper * 1.02);
          ellSub(grow);
          muscle(EL[i], HA[i], 0.36, b.fore * 0.64, b.rFore * 1.12);
          ellSub(grow);
          muscle(EL[i], HA[i], 0.86, b.fore * 0.24, b.rFore * 0.86);
          ellSub(grow);
        }
        G.fillStyle = pass ? col(V.skin, 1, 1) : INKS;
        G.fill();
      }
    } else {
      // one stroke an arm (a muscled arm about as thick as its bulges up close: the same outline at the switch)
      const ww = ((wu + wf) / 2) * (b.muscle ? 1.12 : 1);
      G.beginPath();
      for (let i = 0; i < 2; i++) {
        if (!(mask & (1 << i))) continue;
        mt(S[SH[i] * 3], S[SH[i] * 3 + 1]);
        lt(S[EL[i] * 3], S[EL[i] * 3 + 1]);
        lt(S[HA[i] * 3], S[HA[i] * 3 + 1]);
      }
      G.strokeStyle = INKS;
      G.lineWidth = ww + RG[OUT] * 2;
      G.stroke();
      G.strokeStyle = col(armCol, 1, 1);
      G.lineWidth = ww;
      G.stroke();
    }
    if (LOD === 1) {
      if (sleeve === "short") {
        // a short sleeve, cut off: ink, then cloth
        const ww = wu * 1.38;
        G.lineCap = "butt";
        for (let pass = 0; pass < 2; pass++) {
          G.beginPath();
          for (let i = 0; i < 2; i++) {
            if (!(mask & (1 << i))) continue;
            const x0 = S[SH[i] * 3];
            const y0 = S[SH[i] * 3 + 1];
            let ux = S[EL[i] * 3] - x0;
            let uy = S[EL[i] * 3 + 1] - y0;
            const ul = hyp2(ux, uy) || 1;
            const x1 = x0 + ux * 0.48;
            const y1 = y0 + uy * 0.48;
            ux /= ul;
            uy /= ul;
            if (pass) {
              mt(x0 - ux * ww * 0.1, y0 - uy * ww * 0.1);
              lt(x1, y1);
            } else {
              mt(x0, y0);
              lt(x1 + ux * RG[OUT], y1 + uy * RG[OUT]);
            }
          }
          G.strokeStyle = pass ? col(V.shirt, 0.95, 1) : INKS;
          G.lineWidth = pass ? ww : ww + RG[OUT] * 2;
          G.stroke();
        }
        G.lineCap = "round";
      } else if (sleeve === "long") {
        // the cuff at the wrist
        for (let pass = 0; pass < 2; pass++) {
          G.beginPath();
          for (let i = 0; i < 2; i++) {
            if (!(mask & (1 << i))) continue;
            const el = EL[i] * 3;
            const ha = HA[i] * 3;
            mt(S[el] + (S[ha] - S[el]) * 0.72, S[el + 1] + (S[ha + 1] - S[el + 1]) * 0.72);
            lt(S[ha], S[ha + 1]);
          }
          G.strokeStyle = pass ? col(V.cuff || V.sleeveCol || V.shirt, 0.85, 1) : INKS;
          G.lineWidth = pass ? wf * 1.3 : wf * 1.3 + RG[OUT] * 2;
          G.stroke();
        }
      }
      if (V.pads) {
        G.beginPath();
        for (let i = 0; i < 2; i++) {
          if (!(mask & (1 << i))) continue;
          padEll(i);
          ellSub(0);
        }
        G.fillStyle = col(V.pad, 1, 1);
        G.fill();
        G.strokeStyle = INKS;
        G.lineWidth = RG[OUT] * 1.4;
        G.stroke();
      }
      // mittens with claw tips: one fill for all, then their outlines and claws in one ink stroke
      G.beginPath();
      for (let i = 0; i < 2; i++) {
        if (!(mask & (1 << i))) continue;
        handFrame(i);
        mitten();
        ellSub(0);
      }
      G.fillStyle = col(V.handSkin || V.skin, 1, 1);
      G.fill();
      G.beginPath();
      for (let i = 0; i < 2; i++) {
        if (!(mask & (1 << i))) continue;
        handFrame(i);
        mitten();
        ellSub(0);
        const ex = RG[EX];
        const ey = RG[EY];
        proj(HPC[0] + HFV[0] * HFV[9] * 0.62, HPC[1] + HFV[1] * HFV[9] * 0.62, HPC[2] + HFV[2] * HFV[9] * 0.62, 0);
        const tx = RG[QX];
        const ty = RG[QY];
        for (let n = -1; n <= 1; n++) {
          const ox = (tx - ex) * 0.2 * n;
          const oy = (ty - ey) * 0.2 * n;
          mt(tx - oy, ty + ox);
          lt(tx - oy + (tx - ex) * 0.3, ty + ox + (ty - ey) * 0.3);
        }
      }
      G.strokeStyle = INKS;
      G.lineWidth = Math.max(0.8, RG[OUT]);
      G.stroke();
    } else if (b.muscle) {
      // far away a brute's arm still ends in a big fist
      G.beginPath();
      for (let i = 0; i < 2; i++) {
        if (!(mask & (1 << i))) continue;
        handFrame(i);
        ellipsoid(HPC[0], HPC[1], HPC[2], HFV[0] * HFV[9] * 0.55, HFV[1] * HFV[9] * 0.55, HFV[2] * HFV[9] * 0.55, HFV[3] * HFV[10] * 0.55, HFV[4] * HFV[10] * 0.55, HFV[5] * HFV[10] * 0.55, HFV[6] * HFV[9] * 0.3, HFV[7] * HFV[9] * 0.3, HFV[8] * HFV[9] * 0.3, 0);
        ellSub(0);
      }
      G.fillStyle = col(V.skin, 1, 1);
      G.fill();
      G.strokeStyle = INKS;
      G.lineWidth = RG[OUT] * 1.4;
      G.stroke();
    }
  }
  /** The mitten of the hand handFrame last set, as EX.. */
  function mitten() {
    const hl = HFV[9];
    const hw = HFV[10];
    const cx = HPC[0] + HFV[0] * hl * 0.22;
    const cy = HPC[1] + HFV[1] * hl * 0.22;
    const cz = HPC[2] + HFV[2] * hl * 0.22;
    ellipsoid(cx, cy, cz, HFV[0] * hl * 0.62, HFV[1] * hl * 0.62, HFV[2] * hl * 0.62, HFV[3] * hw * 0.62, HFV[4] * hw * 0.62, HFV[5] * hw * 0.62, HFV[6] * hl * 0.2, HFV[7] * hl * 0.2, HFV[8] * hl * 0.2, 0);
  }
  /** Shoulder pad i as EX.. (riot gear). */
  function padEll(i) {
    const o = SH[i] * 3;
    const s = i ? 1 : -1;
    const r = T.build.rUpper;
    ellipsoid(J[o] + TF[0] * s * r * 0.4 + TF[3] * r * 0.5, J[o + 1] + TF[1] * s * r * 0.4 + TF[4] * r * 0.5, J[o + 2] + TF[2] * s * r * 0.4 + TF[5] * r * 0.5, TF[0] * r * 1.6, TF[1] * r * 1.6, TF[2] * r * 1.6, TF[3] * r * 1.1, TF[4] * r * 1.1, TF[5] * r * 1.1, TF[6] * r * 1.5, TF[7] * r * 1.5, TF[8] * r * 1.5, 0);
  }
  /** A muscle (an ellipsoid along a bone from joint a to b, centred t of the way, half-length hl, radius r). */
  function muscle(a, b, t, hl, r) {
    const ax = J[a * 3];
    const ay = J[a * 3 + 1];
    const az = J[a * 3 + 2];
    let dx = J[b * 3] - ax;
    let dy = J[b * 3 + 1] - ay;
    let dz = J[b * 3 + 2] - az;
    let l = hyp3(dx, dy, dz);
    if (l < 1e-6) {
      dx = 0;
      dy = 1;
      dz = 0;
      l = 1;
    }
    dx /= l;
    dy /= l;
    dz /= l;
    // two directions square to the bone
    let px = dy * TF[8] - dz * TF[7];
    let py = dz * TF[6] - dx * TF[8];
    let pz = dx * TF[7] - dy * TF[6];
    let pl = hyp3(px, py, pz);
    if (pl < 1e-3) {
      px = TF[0];
      py = TF[1];
      pz = TF[2];
      pl = 1;
    }
    px /= pl;
    py /= pl;
    pz /= pl;
    const qx = dy * pz - dz * py;
    const qy = dz * px - dx * pz;
    const qz = dx * py - dy * px;
    ellipsoid(ax + dx * l * t, ay + dy * l * t, az + dz * l * t, dx * hl, dy * hl, dz * hl, px * r, py * r, pz * r, qx * r, qy * r, qz * r, 0);
  }

  // hand scratch: finger points
  const HP = new Float64Array(5 * 4 * 2);
  const HPC = new Float64Array(3); // the palm's centre (model)
  const HFV = new Float64Array(11); // fingers' way (0-2), across (3-5), palm normal (6-8), length (9), width (10)
  /** The hand frame of arm i (into HPC / HFV): the wrist bend, the palm's way, its size (a near hand looms). */
  function handFrame(i) {
    const b = T.build;
    const el = EL[i];
    const ha = HA[i];
    const wx = J[ha * 3];
    const wy = J[ha * 3 + 1];
    const wz = J[ha * 3 + 2];
    let dx = wx - J[el * 3];
    let dy = wy - J[el * 3 + 1];
    let dz = wz - J[el * 3 + 2];
    const dl = hyp3(dx, dy, dz) || 1;
    dx /= dl;
    dy /= dl;
    dz /= dl;
    // the palm's normal, square to the forearm
    let nx = PALM[i * 3];
    let ny = PALM[i * 3 + 1];
    let nz = PALM[i * 3 + 2];
    const nd = nx * dx + ny * dy + nz * dz;
    nx -= nd * dx;
    ny -= nd * dy;
    nz -= nd * dz;
    let nl = hyp3(nx, ny, nz);
    if (nl < 1e-3) {
      nx = -dy;
      ny = dx;
      nz = 0;
      nl = hyp2(nx, ny) || 1;
    }
    nx /= nl;
    ny /= nl;
    nz /= nl;
    // the wrist bends the fingers back (a claw)
    const wb = WRIST[i];
    const cw = Math.cos(wb);
    const sw = Math.sin(wb);
    HFV[0] = dx * cw - nx * sw;
    HFV[1] = dy * cw - ny * sw;
    HFV[2] = dz * cw - nz * sw;
    // across the hand: d x n
    HFV[3] = dy * nz - dz * ny;
    HFV[4] = dz * nx - dx * nz;
    HFV[5] = dx * ny - dy * nx;
    HFV[6] = nx;
    HFV[7] = ny;
    HFV[8] = nz;
    // a hand near the camera looms (about k^1.5 in all: the projection gives k, this the rest)
    const kn = S[ha * 3 + 2] / RG[FIT];
    const hs = kn > 1 ? Math.min(1.3, Math.sqrt(kn)) : 1;
    HFV[9] = b.hand * hs;
    // a muscled arm ends in a hand as broad as its forearm, its palm overlapping the wrist (no thin neck there)
    HFV[10] = (b.muscle ? Math.max(b.hand * 0.82, b.rFore * 2) : b.hand * 0.82) * hs;
    const po = (b.muscle ? 0.26 : 0.38) * HFV[9];
    HPC[0] = wx + HFV[0] * po;
    HPC[1] = wy + HFV[1] * po;
    HPC[2] = wz + HFV[2] * po;
  }
  function drawHand(i) {
    if (LOD > 0) return; // far away: drawArmsLow draws mittens and fists
    const b = T.build;
    const s = i ? 1 : -1;
    handFrame(i);
    const fx = HFV[0];
    const fy = HFV[1];
    const fz = HFV[2];
    const sx = HFV[3];
    const sy = HFV[4];
    const sz = HFV[5];
    const nx = HFV[6];
    const ny = HFV[7];
    const nz = HFV[8];
    const hl = HFV[9];
    const hw = HFV[10];
    const pcx = HPC[0];
    const pcy = HPC[1];
    const pcz = HPC[2];
    const k = S[HA[i] * 3 + 2];
    const skin = V.handSkin || V.skin;
    if (LOD === 0) {
      // fingers: four long ones and a thumb, two joints each, with dark broken nails
      const curl = CURL[i];
      const spread = SPREAD[i];
      for (let n = 0; n < 5; n++) {
        let bx;
        let by;
        let bz;
        let ux;
        let uy;
        let uz;
        let l1 = hl * (n === 0 || n === 3 ? 0.44 : 0.52) * (b.finger || 1);
        let l2 = hl * 0.42 * (b.finger || 1);
        let ln = hl * 0.2; // the nail
        if (n < 4) {
          const t = n / 3 - 0.5;
          bx = pcx + fx * hl * 0.32 + sx * hw * t * 0.9;
          by = pcy + fy * hl * 0.32 + sy * hw * t * 0.9;
          bz = pcz + fz * hl * 0.32 + sz * hw * t * 0.9;
          const a = t * spread * 0.75;
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          ux = fx * ca + sx * sa;
          uy = fy * ca + sy * sa;
          uz = fz * ca + sz * sa;
        } else {
          // the thumb, on the inner side of the palm (s and the across axis keep it there for either hand), angled
          // along the fingers and curled with them; never longer than about half the hand, whatever the fingers
          bx = pcx - fx * hl * 0.12 - sx * hw * 0.48 * s;
          by = pcy - fy * hl * 0.12 - sy * hw * 0.48 * s;
          bz = pcz - fz * hl * 0.12 - sz * hw * 0.48 * s;
          ux = fx * 0.8 - sx * 0.45 * s + nx * 0.3;
          uy = fy * 0.8 - sy * 0.45 * s + ny * 0.3;
          uz = fz * 0.8 - sz * 0.45 * s + nz * 0.3;
          const ul = hyp3(ux, uy, uz) || 1;
          ux /= ul;
          uy /= ul;
          uz /= ul;
          l1 = hl * 0.3;
          l2 = hl * 0.22;
          ln = hl * 0.1;
        }
        const c1 = curl * 0.6;
        const c2 = curl * 1.45;
        const m1x = bx + (ux * Math.cos(c1) + nx * Math.sin(c1)) * l1;
        const m1y = by + (uy * Math.cos(c1) + ny * Math.sin(c1)) * l1;
        const m1z = bz + (uz * Math.cos(c1) + nz * Math.sin(c1)) * l1;
        const e2x = ux * Math.cos(c2) + nx * Math.sin(c2);
        const e2y = uy * Math.cos(c2) + ny * Math.sin(c2);
        const e2z = uz * Math.cos(c2) + nz * Math.sin(c2);
        const o = n * 8;
        proj(bx, by, bz, 0);
        HP[o] = RG[QX];
        HP[o + 1] = RG[QY];
        proj(m1x, m1y, m1z, 0);
        HP[o + 2] = RG[QX];
        HP[o + 3] = RG[QY];
        proj(m1x + e2x * l2, m1y + e2y * l2, m1z + e2z * l2, 0);
        HP[o + 4] = RG[QX];
        HP[o + 5] = RG[QY];
        proj(m1x + e2x * (l2 + ln), m1y + e2y * (l2 + ln), m1z + e2z * (l2 + ln), 0);
        HP[o + 6] = RG[QX];
        HP[o + 7] = RG[QY];
      }
      ellipsoid(pcx, pcy, pcz, fx * hl * 0.44, fy * hl * 0.44, fz * hl * 0.44, sx * hw * 0.52, sy * hw * 0.52, sz * hw * 0.52, nx * hl * 0.16, ny * hl * 0.16, nz * hl * 0.16, 0);
      ellInk(col(skin, 1, 1));
      const fw = Math.max(0.9, hl * 0.23 * RG[PXS] * k);
      G.beginPath();
      for (let n = 0; n < 5; n++) {
        const o = n * 8;
        mt(HP[o], HP[o + 1]);
        lt(HP[o + 2], HP[o + 3]);
        lt(HP[o + 4], HP[o + 5]);
      }
      G.strokeStyle = INKS;
      G.lineWidth = fw + RG[OUT] * 1.1;
      G.stroke();
      G.strokeStyle = col(skin, 0.95, 1);
      G.lineWidth = fw;
      G.stroke();
      G.beginPath();
      for (let n = 0; n < 5; n++) {
        const o = n * 8;
        mt(HP[o + 4], HP[o + 5]);
        lt(HP[o + 6], HP[o + 7]);
      }
      G.strokeStyle = col(V.nail, 1, 1);
      G.lineWidth = Math.max(0.8, fw * 0.7);
      G.stroke();
    }
  }

  /* ---------- Torso: an elliptic tube from the hem to the shoulders, with its rips, ribs and grime ---------- */
  // ring centres on screen and their half-widths across the tube's axis
  const TR = new Float64Array(16);
  function ringExtent(cx, cy, cz, a, bb, nx, ny) {
    proj(cx, cy, cz, 0);
    const K = RG[PXS] * RG[QK];
    const r1 = -(TF[0] * RG[CYAW] + TF[2] * RG[SYAW]) * K * a;
    const r2 = -TF[1] * K * a;
    const f1 = -(TF[6] * RG[CYAW] + TF[8] * RG[SYAW]) * K * bb;
    const f2 = -TF[7] * K * bb;
    const pr = nx * r1 + ny * r2;
    const pf = nx * f1 + ny * f2;
    return Math.sqrt(pr * pr + pf * pf);
  }
  /** A point on the torso's surface: angle th around (0 = front, + toward its right), v 0 (waist) .. 1 (chest);
      sets QX/QY and returns how much its surface faces the camera (-1..1). Off pushes it out from the surface. */
  function torsoPoint(th, v, off) {
    const b = T.build;
    const a = b.waist[0] + (b.chest[0] - b.waist[0]) * Math.pow(clamp01(v), 0.8) + off;
    const bb = b.waist[1] + (b.chest[1] - b.waist[1]) * v + off;
    const u = b.torso * (0.18 + 0.62 * v);
    const sn = Math.sin(th);
    const cs = Math.cos(th);
    const o = PEL * 3;
    RG[SFX] = J[o] + TF[3] * u + TF[0] * a * sn + TF[6] * bb * cs;
    RG[SFY] = J[o + 1] + TF[4] * u + TF[1] * a * sn + TF[7] * bb * cs;
    RG[SFZ] = J[o + 2] + TF[5] * u + TF[2] * a * sn + TF[8] * bb * cs;
    proj(RG[SFX], RG[SFY], RG[SFZ], 0);
    const nx = TF[0] * (sn / a) + TF[6] * (cs / bb);
    const nz = TF[2] * (sn / a) + TF[8] * (cs / bb);
    const ny = TF[1] * (sn / a) + TF[7] * (cs / bb);
    return facing(nx, nz) / (hyp3(nx, ny, nz) || 1);
  }
  const TP = new Float64Array(64);
  let TPN = 0;
  function tpSet(i, x, y) {
    TP[i * 2] = x;
    TP[i * 2 + 1] = y < RG[CH] - RG[OUT] ? y : RG[CH] - RG[OUT];
  }
  /** The torso's outline from TP: up the left side, over the shoulders and the neck, down the right, the hem. */
  function torsoPath() {
    G.beginPath();
    mt(TP[0], TP[1]);
    lt(TP[2], TP[3]);
    lt(TP[4], TP[5]);
    qt(TP[6], TP[7], TP[8], TP[9]);
    lt(TP[10], TP[11]);
    lt(TP[12], TP[13]);
    lt(TP[14], TP[15]);
    qt(TP[16], TP[17], TP[18], TP[19]);
    lt(TP[20], TP[21]);
    lt(TP[22], TP[23]);
    for (let k = 1; k <= TPN; k++) lt(TP[(11 + k) * 2], TP[(11 + k) * 2 + 1]);
    G.closePath();
  }
  function drawTorso() {
    const b = T.build;
    const o = PEL * 3;
    const hem = V.hem;
    // rings: hem (hangs straight down), waist, chest, and the shoulder line
    proj(J[o], J[o + 1] - hem, J[o + 2], 0);
    const h0x = RG[QX];
    const h0y = RG[QY];
    proj(J[CHE * 3], J[CHE * 3 + 1], J[CHE * 3 + 2], 0);
    const h3x = RG[QX];
    const h3y = RG[QY];
    const k3 = RG[QK];
    let ax = h3x - h0x;
    let ay = h3y - h0y;
    let al = hyp2(ax, ay);
    if (al < 1e-3) {
      ax = 0;
      ay = -1;
      al = 1;
    }
    ax /= al;
    ay /= al;
    const nx = -ay;
    const ny = ax;
    const flare = hem > 0.12 ? (V.flare == null ? 1.25 : V.flare) : 1;
    const e0 = ringExtent(J[o], J[o + 1] - hem, J[o + 2], b.waist[0] * flare, b.waist[1] * flare, nx, ny);
    TR[0] = RG[QX];
    TR[1] = RG[QY];
    const u1 = b.torso * 0.18;
    const e1 = ringExtent(J[o] + TF[3] * u1, J[o + 1] + TF[4] * u1, J[o + 2] + TF[5] * u1, b.waist[0], b.waist[1], nx, ny);
    TR[2] = RG[QX];
    TR[3] = RG[QY];
    const u2 = b.torso * 0.8;
    const e2 = ringExtent(J[o] + TF[3] * u2, J[o + 1] + TF[4] * u2, J[o + 2] + TF[5] * u2, b.chest[0], b.chest[1], nx, ny);
    TR[4] = RG[QX];
    TR[5] = RG[QY];
    const e3 = ringExtent(J[CHE * 3], J[CHE * 3 + 1], J[CHE * 3 + 2], b.shW + b.rUpper * 0.6, b.chest[1] * 0.9, nx, ny);
    // a long garment also covers the legs at its hem
    let eL = e0;
    let eR = e0;
    if (hem > 0.1) {
      for (let i = 0; i < 2; i++) {
        const hi = HI[i] * 3;
        const kn = KN[i] * 3;
        const f = clamp01((J[hi + 1] - (J[o + 1] - hem)) / Math.max(1e-3, J[hi + 1] - J[kn + 1]));
        const lx = S[HI[i] * 3] + (S[KN[i] * 3] - S[HI[i] * 3]) * f;
        const ly = S[HI[i] * 3 + 1] + (S[KN[i] * 3 + 1] - S[HI[i] * 3 + 1]) * f;
        const pos = (lx - h0x) * nx + (ly - h0y) * ny;
        const r = b.rThigh * RG[PXS] * S[KN[i] * 3 + 2] * 1.25;
        eR = Math.max(eR, pos + r);
        eL = Math.max(eL, -pos + r);
      }
    }
    const rise = b.rise * RG[PXS] * k3;
    const neck = b.rNeck * RG[PXS] * k3 * 1.15;
    const shirt = V.shirt;
    // outline: left side up, over the shoulders, down the right side, then the ragged hem back
    tpSet(0, h0x - nx * eL, h0y - ny * eL);
    tpSet(1, TR[2] - nx * e1, TR[3] - ny * e1);
    tpSet(2, TR[4] - nx * e2, TR[5] - ny * e2);
    tpSet(3, h3x - nx * e3 * 1.02 + ax * rise * 0.35, h3y - ny * e3 * 1.02 + ay * rise * 0.35);
    tpSet(4, h3x - nx * e3 * 0.62 + ax * rise, h3y - ny * e3 * 0.62 + ay * rise);
    // the neck notch: up the neck seen from the front; from behind, with the head behind the shoulders, a valley
    // between the traps where the neck rises into the back of the head
    const rn = HEADBACK ? 0.62 : 1.15;
    tpSet(5, h3x - nx * neck + ax * rise * rn, h3y - ny * neck + ay * rise * rn);
    tpSet(6, h3x + nx * neck + ax * rise * rn, h3y + ny * neck + ay * rise * rn);
    tpSet(7, h3x + nx * e3 * 0.62 + ax * rise, h3y + ny * e3 * 0.62 + ay * rise);
    tpSet(8, h3x + nx * e3 * 1.02 + ax * rise * 0.35, h3y + ny * e3 * 1.02 + ay * rise * 0.35);
    tpSet(9, TR[4] + nx * e2, TR[5] + ny * e2);
    tpSet(10, TR[2] + nx * e1, TR[3] + ny * e1);
    tpSet(11, h0x + nx * eR, h0y + ny * eR);
    TPN = LOD === 2 ? 0 : 7;
    const jag = (V.jag || 0.03) * RG[PXS] * k3;
    for (let k = 1; k <= TPN; k++) {
      const t = k / (TPN + 1);
      const d = k & 1 ? jag * (0.5 + rnd(80 + k)) : -jag * 0.2;
      const ex = eR + (-eL - eR) * t;
      tpSet(11 + k, h0x + nx * ex - ax * d, h0y + ny * ex - ay * d);
    }
    // ink, then cloth over its inner half (one path; the decals go on top and never cover the outline)
    torsoPath();
    G.strokeStyle = INKS;
    G.lineWidth = RG[OUT] * 3;
    G.stroke();
    G.fillStyle = col(shirt, 1, 1);
    G.fill();
    if (LOD === 2) return;
    // shade on the side away from the light (up close)
    if (LOD === 0) {
      const sd = nx * SLX + ny * SLY > 0 ? -1 : 1;
      G.beginPath();
      mt(h0x + nx * sd * (sd > 0 ? eR : eL), h0y + ny * sd * (sd > 0 ? eR : eL));
      lt(TR[2] + nx * sd * e1, TR[3] + ny * sd * e1);
      lt(TR[4] + nx * sd * e2, TR[5] + ny * sd * e2);
      lt(h3x + nx * sd * e3 * 0.8 + ax * rise * 0.8, h3y + ny * sd * e3 * 0.8 + ay * rise * 0.8);
      lt(h3x + nx * sd * e3 * 0.3 + ax * rise * 0.6, h3y + ny * sd * e3 * 0.3 + ay * rise * 0.6);
      lt(TR[4] + nx * sd * e2 * 0.38, TR[5] + ny * sd * e2 * 0.38);
      lt(TR[2] + nx * sd * e1 * 0.32, TR[3] + ny * sd * e1 * 0.32);
      lt(h0x + nx * sd * e0 * 0.3, h0y + ny * sd * e0 * 0.3);
      G.closePath();
      G.fillStyle = col(BLACK, 1, 0.24);
      G.fill();
    }
    torsoDecals();
  }
  function torsoDecals() {
    if (LOD === 2) return;
    const look = V;
    // grime and old stains
    if (LOD === 0) {
      G.beginPath();
      let any = false;
      for (let n = 0; n < 5; n++) {
        const th = (rnd(100 + n) - 0.5) * TAU;
        const v = rnd(110 + n);
        const f = torsoPoint(th, v, 0);
        if (f < 0.25) continue;
        const r = (0.018 + 0.02 * rnd(120 + n)) * RG[PXS] * RG[QK];
        elSub(RG[QX], RG[QY], r, r * (0.5 + 0.4 * f), rnd(130 + n) * 3);
        any = true;
      }
      if (any) {
        G.fillStyle = col(look.stain || [40, 34, 28], 1, 0.3);
        G.fill();
      }
    }
    // a gown open down the back
    if (look.top === "gown") {
      const f = torsoPoint(PI, 0.5, 0);
      if (f > 0.1) {
        G.beginPath();
        for (let k = 0; k <= 4; k++) {
          torsoPoint(PI - 0.32 + (k & 1) * 0.08, k / 4, 0.003);
          if (k) lt(RG[QX], RG[QY]);
          else mt(RG[QX], RG[QY]);
        }
        for (let k = 4; k >= 0; k--) {
          torsoPoint(PI + 0.32 - (k & 1) * 0.08, k / 4, 0.003);
          lt(RG[QX], RG[QY]);
        }
        G.closePath();
        G.fillStyle = col(look.skin, 0.8, 1);
        G.fill();
        G.strokeStyle = INKS;
        G.lineWidth = RG[OUT];
        G.stroke();
      }
    }
    // hoodie: pouch pocket and drawstrings; vest: panel seams; turnout coat: reflective bands
    if (look.top === "hoodie") {
      if (torsoPoint(0, 0.2, 0) > 0.3) {
        G.beginPath();
        torsoPoint(-0.55, 0.02, 0.003);
        mt(RG[QX], RG[QY]);
        torsoPoint(-0.4, 0.3, 0.003);
        lt(RG[QX], RG[QY]);
        torsoPoint(0.4, 0.3, 0.003);
        lt(RG[QX], RG[QY]);
        torsoPoint(0.55, 0.02, 0.003);
        lt(RG[QX], RG[QY]);
        G.strokeStyle = col(BLACK, 1, 0.45);
        G.lineWidth = Math.max(0.8, RG[OUT]);
        G.stroke();
        if (LOD === 0) {
          G.beginPath();
          for (let s = -1; s <= 1; s += 2) {
            torsoPoint(s * 0.16, 1.05, 0.004);
            mt(RG[QX], RG[QY]);
            torsoPoint(s * 0.13, 0.62 + 0.05 * s, 0.004);
            lt(RG[QX], RG[QY]);
          }
          G.strokeStyle = col(look.string || [200, 196, 186], 0.8, 1);
          G.lineWidth = Math.max(0.8, RG[OUT] * 0.8);
          G.stroke();
        }
      }
    } else if (look.top === "vest") {
      if (LOD === 0) {
        G.beginPath();
        let any = false;
        for (let s = -1; s <= 1; s += 2) {
          if (torsoPoint(s * 0.55, 0.5, 0) < 0.15) continue;
          torsoPoint(s * 0.55, 0.05, 0.003);
          mt(RG[QX], RG[QY]);
          torsoPoint(s * 0.45, 1, 0.003);
          lt(RG[QX], RG[QY]);
          any = true;
        }
        if (torsoPoint(0, 0.45, 0) > 0.2) {
          torsoPoint(-0.7, 0.42, 0.003);
          mt(RG[QX], RG[QY]);
          torsoPoint(0.7, 0.42, 0.003);
          lt(RG[QX], RG[QY]);
          any = true;
        }
        if (any) {
          G.strokeStyle = col(BLACK, 1, 0.4);
          G.lineWidth = Math.max(0.8, RG[OUT]);
          G.stroke();
        }
      }
    }
    if (look.bands) {
      // both bands in one path: yellow, then (up close) the silver stripe down their middle
      G.beginPath();
      if (band(0.05) + band(0.62)) {
        G.strokeStyle = col(look.band, 1, 1);
        G.lineWidth = Math.max(1.2, 0.03 * RG[PXS] * RG[QK]);
        G.stroke();
        if (LOD === 0) {
          G.strokeStyle = col(look.band2, 1, 1);
          G.lineWidth = Math.max(0.7, 0.011 * RG[PXS] * RG[QK]);
          G.stroke();
        }
      }
    }
    // a low scooped neckline (deep at the front, shallow at the back): skin up over the traps
    if (look.neckline) {
      for (let side = 0; side < 2; side++) {
        const c = side ? PI : 0;
        if (torsoPoint(c, 1, 0) < 0.15) continue;
        const v0 = look.neckline[side];
        G.beginPath();
        for (let k = 0; k < NECKLINE.length; k += 2) {
          torsoPoint(c + NECKLINE[k], k === 0 || k === NECKLINE.length - 2 ? 1.32 : k === 2 || k === NECKLINE.length - 4 ? 1.02 : v0 + (1 - v0) * NECKLINE[k + 1], 0.003);
          if (k) lt(RG[QX], RG[QY]);
          else mt(RG[QX], RG[QY]);
        }
        torsoPoint(c, 1.42, 0.003);
        lt(RG[QX], RG[QY]);
        G.closePath();
        G.fillStyle = col(look.skin, 0.96, 1);
        G.fill();
        G.strokeStyle = INKS;
        G.lineWidth = RG[OUT] * 1.4;
        G.stroke();
      }
    }
    // the rip over the ribs
    if (look.rip) ripDecal(look.rip[0], look.rip[1], look.rip[2], look);
    if (look.rip2) ripDecal(look.rip2[0], look.rip2[1], look.rip2[2], look);
    // smears: blood when gore is on, grime when off: a blotch with a drip running down from it
    if (look.smears) {
      const r0 = 0.02 * RG[PXS] * RG[QK];
      G.beginPath();
      let any = false;
      for (let n = 0; n < look.smears; n++) {
        const th = (rnd(150 + n) - 0.5) * 2.6;
        const v = 0.15 + 0.8 * rnd(160 + n);
        const f = torsoPoint(th, v, 0.002);
        if (f < 0.3) continue;
        const r = r0 * (0.7 + 0.8 * rnd(170 + n));
        const x0 = RG[QX];
        const y0 = RG[QY];
        elSub(x0, y0, r, r * (0.45 + 0.35 * f), rnd(175 + n) * 3);
        any = true;
      }
      if (any) {
        G.fillStyle = goreCol(0.85, 0.62);
        G.fill();
      }
      if (any && LOD === 0) {
        G.beginPath();
        for (let n = 0; n < look.smears; n++) {
          const th = (rnd(150 + n) - 0.5) * 2.6;
          const v = 0.15 + 0.8 * rnd(160 + n);
          if (torsoPoint(th, v, 0.002) < 0.3 || (n & 1)) continue;
          const x0 = RG[QX];
          const y0 = RG[QY];
          torsoPoint(th + 0.04, v - 0.25 - 0.2 * rnd(180 + n), 0.002);
          mt(x0, y0);
          lt(RG[QX], RG[QY]);
        }
        G.strokeStyle = goreCol(0.8, 0.6);
        G.lineWidth = Math.max(0.8, r0 * 0.45);
        G.stroke();
      }
    }
  }
  // the neckline's points: angle round, share of the way from the scoop's bottom up to the chest line
  const NECKLINE = [-0.85, 0, -0.6, 0, -0.32, 0.35, 0, 0, 0.32, 0.35, 0.6, 0, 0.85, 0];
  /** A reflective band round the coat at height v: the part facing the camera. */
  function band(v) {
    let started = false;
    for (let k = 0; k <= 12; k++) {
      const th = -PI + (k / 12) * TAU;
      const f = torsoPoint(th, v, 0.004);
      if (f > 0.05) {
        if (started) lt(RG[QX], RG[QY]);
        else mt(RG[QX], RG[QY]);
        started = true;
      } else if (started) break;
    }
    return started ? 1 : 0;
  }
  // rip outline offsets (angle, height), jagged
  const RIP = [-0.5, 0, -0.32, 0.38, -0.12, 0.3, 0.02, 0.5, 0.2, 0.36, 0.42, 0.42, 0.3, 0.05, 0.46, -0.22, 0.2, -0.36, 0.04, -0.5, -0.16, -0.32, -0.36, -0.42];
  function ripDecal(th0, v0, size, look) {
    const f0 = torsoPoint(th0, v0, 0);
    if (f0 < 0.2) return;
    const sw = size * 1.25;
    const sv = size * 1.9;
    G.beginPath();
    for (let k = 0; k < RIP.length; k += 2) {
      torsoPoint(th0 + RIP[k] * sw, v0 + RIP[k + 1] * sv, 0.002);
      if (k) lt(RG[QX], RG[QY]);
      else mt(RG[QX], RG[QY]);
    }
    G.closePath();
    G.fillStyle = GORE && look.ribs ? col(look.flesh, 1, 1) : col(look.skin, 0.72, 1);
    G.fill();
    if (LOD > 0) return;
    G.strokeStyle = INKS;
    G.lineWidth = Math.max(0.8, RG[OUT] * 1.2);
    G.stroke();
    if (LOD === 0 && GORE && look.ribs) {
      // the hole is deep: dark under its top edge
      torsoPoint(th0 + 0.04 * sw, v0 + 0.3 * sv, 0.003);
      G.beginPath();
      ellA(RG[QX], RG[QY], T.build.chest[0] * sw * 0.32 * RG[PXS] * RG[QK], T.build.torso * 0.62 * sv * 0.12 * RG[PXS] * RG[QK], 0.1, 0, TAU);
      G.fillStyle = col(BLACK, 1, 0.45);
      G.fill();
      // ribs: thin pale curved bars across the hole, lightly inked, ends tucked under the cloth
      G.beginPath();
      for (let r = 0; r < 4; r++) {
        const v = v0 + (0.27 - r * 0.19) * sv;
        torsoPoint(th0 - 0.3 * sw, v - 0.05 * sv, 0.004);
        mt(RG[QX], RG[QY]);
        torsoPoint(th0 - 0.02 * sw, v + 0.03 * sv, 0.004);
        lt(RG[QX], RG[QY]);
        torsoPoint(th0 + 0.28 * sw, v - 0.03 * sv, 0.004);
        lt(RG[QX], RG[QY]);
      }
      const rw = Math.max(0.9, 0.0065 * RG[PXS] * RG[QK]);
      G.strokeStyle = col(INK, 1, 0.8);
      G.lineWidth = rw + RG[OUT] * 0.8;
      G.stroke();
      G.strokeStyle = col(look.bone, 1, 1);
      G.lineWidth = rw;
      G.stroke();
      // fresh blood round the edge
      G.beginPath();
      torsoPoint(th0 + 0.1 * sw, v0 - 0.45 * sv, 0.003);
      mt(RG[QX], RG[QY]);
      torsoPoint(th0 + 0.16 * sw, v0 - 0.85 * sv, 0.003);
      lt(RG[QX], RG[QY]);
      torsoPoint(th0 - 0.3 * sw, v0 - 0.4 * sv, 0.003);
      mt(RG[QX], RG[QY]);
      torsoPoint(th0 - 0.34 * sw, v0 - 0.7 * sv, 0.003);
      lt(RG[QX], RG[QY]);
      G.strokeStyle = goreCol(1, 0.75);
      G.lineWidth = Math.max(1, 0.018 * RG[PXS] * RG[QK]);
      G.stroke();
    } else if (LOD === 0) {
      // grime and shadow inside the hole
      torsoPoint(th0, v0 - 0.05 * sv, 0.003);
      G.beginPath();
      ellA(RG[QX], RG[QY], sw * 0.12 * RG[PXS] * RG[QK], sv * 0.08 * RG[PXS] * RG[QK], 0.3, 0, TAU);
      G.fillStyle = col(look.grime, 0.8, 0.5);
      G.fill();
    }
  }

  /** Trousers between the legs and under the hem: hip to hip over the crotch. */
  function drawPelvis() {
    const b = T.build;
    if (V.hem > 0.14) return;
    const o = PEL * 3;
    proj(J[o] + TF[3] * 0.03, J[o + 1] + TF[4] * 0.03, J[o + 2] + TF[5] * 0.03, 0);
    const cx = RG[QX];
    const cy = RG[QY];
    let ax = 0;
    let ay = -1;
    proj(J[CHE * 3], J[CHE * 3 + 1], J[CHE * 3 + 2], 0);
    const dl = hyp2(RG[QX] - cx, RG[QY] - cy);
    if (dl > 1e-3) {
      ax = (RG[QX] - cx) / dl;
      ay = (RG[QY] - cy) / dl;
    }
    const e = ringExtent(J[o], J[o + 1], J[o + 2], b.waist[0] * 0.95, b.waist[1] * 0.95, -ay, ax);
    proj(J[o] - TF[3] * b.rThigh * 1.1, J[o + 1] - TF[4] * b.rThigh * 1.1, J[o + 2] - TF[5] * b.rThigh * 1.1, 0);
    G.beginPath();
    mt(cx + ay * e, cy - ax * e);
    lt(S[HI[0] * 3] + (S[HI[0] * 3] - RG[QX]) * 0.3, S[HI[0] * 3 + 1] + (S[HI[0] * 3 + 1] - RG[QY]) * 0.3);
    lt(RG[QX], RG[QY]);
    lt(S[HI[1] * 3] + (S[HI[1] * 3] - RG[QX]) * 0.3, S[HI[1] * 3 + 1] + (S[HI[1] * 3 + 1] - RG[QY]) * 0.3);
    lt(cx - ay * e, cy + ax * e);
    G.closePath();
    G.fillStyle = col(V.pants, 0.94, 1);
    G.fill();
    if (LOD > 0) return;
    G.strokeStyle = INKS;
    G.lineWidth = RG[OUT] * 2;
    G.stroke();
  }

  /* ---------- Head ---------- */
  // ring scratch (hairline, hood opening): screen x, y, facing
  const RN = 24;
  const RXs = new Float64Array(RN);
  const RYs = new Float64Array(RN);
  const RFs = new Float64Array(RN);
  /** A point on an ellipsoid shell (head frame HF, centre offset (cr, cu, cf), radii sa, sb, sc) at local
      direction (dx, dy, dz) on the unit sphere: projects it, returns how much it faces the camera. */
  function shellPoint(cr, cu, cf, sa, sb, sc, dx, dy, dz) {
    const o = HED * 3;
    const lx = cr + dx * sa;
    const ly = cu + dy * sb;
    const lz = cf + dz * sc;
    proj(J[o] + HF[0] * lx + HF[3] * ly + HF[6] * lz, J[o + 1] + HF[1] * lx + HF[4] * ly + HF[7] * lz, J[o + 2] + HF[2] * lx + HF[5] * ly + HF[8] * lz, 0);
    const nx = dx / sa;
    const ny = dy / sb;
    const nz = dz / sc;
    const mx = HF[0] * nx + HF[3] * ny + HF[6] * nz;
    const my = HF[1] * nx + HF[4] * ny + HF[7] * nz;
    const mz = HF[2] * nx + HF[5] * ny + HF[8] * nz;
    return facing(mx, mz) / (hyp3(mx, my, mz) || 1);
  }
  /** The region of the shell's outline (EX.. from ellF) beyond the visible part of the ring in RXs/RYs/RFs:
      hair above the hairline, a hood round the face. Builds the path; returns 0 (nothing), 1 or 2 (fill
      even-odd). (ppx, ppy) is where the cap's pole lands, pf how much it faces the camera. */
  function capPath(n, ppx, ppy, pf, spikes) {
    let vis = 0;
    for (let k = 0; k < n; k++) if (RFs[k] > 0) vis++;
    if (vis === 0) {
      if (pf <= 0) return 0;
      ellPath(0);
      return 1;
    }
    if (vis === n) {
      ellPath(0);
      mt(RXs[0], RYs[0]);
      for (let k = 1; k < n; k++) lt(RXs[k], RYs[k]);
      G.closePath();
      return 2;
    }
    let s = 0;
    while (s < n && !(RFs[s] > 0 && RFs[(s + n - 1) % n] <= 0)) s++;
    const p = (s + n - 1) % n;
    let t = RFs[p] / (RFs[p] - RFs[s]);
    const ax = RXs[p] + (RXs[s] - RXs[p]) * t;
    const ay = RYs[p] + (RYs[s] - RYs[p]) * t;
    G.beginPath();
    mt(ax, ay);
    let i = s;
    let guard = 0;
    while (RFs[i] > 0 && guard++ < n) {
      lt(RXs[i], RYs[i]);
      i = (i + 1) % n;
    }
    const e = (i + n - 1) % n;
    t = RFs[e] / (RFs[e] - RFs[i]);
    const bx = RXs[e] + (RXs[i] - RXs[e]) * t;
    const by = RYs[e] + (RYs[i] - RYs[e]) * t;
    lt(bx, by);
    // round the outline from B back to A, the way the pole is
    const angA = ellAngle(ax, ay);
    const angB = ellAngle(bx, by);
    let angP;
    const pdx = ppx - RG[EX];
    const pdy = ppy - RG[EY];
    if (pdx * pdx + pdy * pdy > 0.04 * RG[ERB] * RG[ERB]) angP = ellAngle(ppx, ppy);
    else {
      // the pole is end-on: go the way away from the middle of the visible arc
      const mi = (s + Math.floor(vis / 2)) % n;
      angP = ellAngle(RXs[mi], RYs[mi]) + PI;
    }
    const dcw = mod(angA - angB);
    const ccw = !(mod(angP - angB) < dcw);
    if (!spikes) ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], angB, angA, ccw);
    else {
      const span = ccw ? -(TAU - dcw) : dcw;
      const c = Math.cos(RG[ERO]);
      const sn = Math.sin(RG[ERO]);
      for (let k = 1; k < spikes; k++) {
        const a = angB + (span * k) / spikes;
        const m = k & 1 ? 1.13 + 0.06 * rnd(200 + k) : 0.97;
        const ux = RG[ERA] * m * Math.cos(a);
        const uy = RG[ERB] * m * Math.sin(a);
        lt(RG[EX] + ux * c - uy * sn, RG[EY] + ux * sn + uy * c);
      }
    }
    G.closePath();
    return 1;
  }
  const mod = (a) => ((a % TAU) + TAU) % TAU;
  function ellAngle(x, y) {
    const dx = x - RG[EX];
    const dy = y - RG[EY];
    const c = Math.cos(RG[ERO]);
    const s = Math.sin(RG[ERO]);
    return Math.atan2((-dx * s + dy * c) / RG[ERB], (dx * c + dy * s) / RG[ERA]);
  }

  /** A flat decal on the head's surface at local (r, u, f) with axes along the head's right and up, sizes
      (ra, rb): projected to EX.., returns how much the face there looks at the camera. */
  function faceDecal(r, u, f, ra, rb, nr, nu, nf) {
    // the decal's across axis runs round the head (square to its normal), its other axis up the head
    const tl = hyp2(nf, nr) || 1;
    const tr = (nf / tl) * ra;
    const tf = (-nr / tl) * ra;
    ellipsoid(
      J[HED * 3] + HF[0] * r + HF[3] * u + HF[6] * f,
      J[HED * 3 + 1] + HF[1] * r + HF[4] * u + HF[7] * f,
      J[HED * 3 + 2] + HF[2] * r + HF[5] * u + HF[8] * f,
      HF[0] * tr + HF[6] * tf,
      HF[1] * tr + HF[7] * tf,
      HF[2] * tr + HF[8] * tf,
      HF[3] * rb,
      HF[4] * rb,
      HF[5] * rb,
      0,
      0,
      0,
      0
    );
    const nx = HF[0] * nr + HF[3] * nu + HF[6] * nf;
    const nz = HF[2] * nr + HF[5] * nu + HF[8] * nf;
    return facing(nx, nz);
  }
  /** Project head-local (r, u, f) to QX/QY. */
  function headPt(r, u, f) {
    const o = HED * 3;
    proj(J[o] + HF[0] * r + HF[3] * u + HF[6] * f, J[o + 1] + HF[1] * r + HF[4] * u + HF[7] * f, J[o + 2] + HF[2] * r + HF[5] * u + HF[8] * f, 0);
  }

  /** The dropped jaw (inked up close). */
  function jaw(jo, jb, ry, rz, skin) {
    ellF(HF, HED, 0, -ry * (0.55 + 0.2 * jo), rz * (0.3 - 0.06 * jo), jb[0], jb[1] * (1 + 0.15 * jo), jb[2]);
    if (LOD === 0) ellInk(col(skin, 0.86, 1));
    else {
      ellPath(0);
      G.fillStyle = col(skin, 0.86, 1);
      G.fill();
    }
  }
  function drawHead() {
    const b = T.build;
    const look = V;
    const rx = b.head[0];
    const ry = b.head[1];
    const rz = b.head[2];
    const o = HED * 3;
    const ff = facing(HF[6], HF[8]); // the face toward the camera (-1..1)
    const skin = look.skin;
    const k = S[HED * 3 + 2];
    // neck and jaw (behind the skull, dropped open); seen from behind, the neck hides the jaw, and from further
    // round the jaw is hidden by the skull (no bare "chin" under the back of the hair)
    const jo = RG[JAW];
    const jb = b.jaw;
    if (ff < 0 && ff > -0.2 && LOD < 2) jaw(jo, jb, ry, rz, skin);
    proj(J[o] - HF[3] * ry * 0.55 - HF[6] * rz * 0.15, J[o + 1] - HF[4] * ry * 0.55 - HF[7] * rz * 0.15, J[o + 2] - HF[5] * ry * 0.55 - HF[8] * rz * 0.15, 0);
    const nkx = RG[QX];
    const nky = RG[QY];
    proj(J[CHE * 3] + TF[3] * 0.01, J[CHE * 3 + 1] + TF[4] * 0.01, J[CHE * 3 + 2] + TF[5] * 0.01, 0);
    const wn = b.rNeck * 2 * RG[PXS] * k;
    G.beginPath();
    mt(RG[QX], RG[QY]);
    lt(nkx, nky);
    if (LOD < 2) {
      G.strokeStyle = INKS;
      G.lineWidth = wn + RG[OUT] * 2;
      G.stroke();
    }
    G.strokeStyle = col(look.hood ? look.shirt : skin, 0.82, 1);
    G.lineWidth = wn;
    G.stroke();
    if (ff >= 0 && LOD < 2 && !FACEDOWN) jaw(jo, jb, ry, rz, skin);
    // skull (a bald one a shade darker from behind, so the back of the head never reads as another muscle)
    const bald = !look.hood && !look.helmet && look.hairStyle === "none";
    ellF(HF, HED, 0, 0, 0, rx, ry, rz);
    const skullX = RG[EX];
    const skullY = RG[EY];
    const skullA = RG[ERA];
    const skullB = RG[ERB];
    const skullO = RG[ERO];
    ellInk(col(skin, bald ? 1 - 0.12 * clamp01(0.3 - ff) : 1, 1));
    if (LOD === 0) {
      // shade on the side away from the light: a crescent inside the outline
      const sa = Math.atan2(-SLY, -SLX) - RG[ERO];
      const dx = -Math.cos(sa + RG[ERO]) * RG[ERA] * 0.2;
      const dy = -Math.sin(sa + RG[ERO]) * RG[ERB] * 0.2;
      G.beginPath();
      ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], sa - 1.45, sa + 1.45, false);
      ellA(RG[EX] + dx, RG[EY] + dy, RG[ERA] * 0.92, RG[ERB] * 0.95, RG[ERO], sa + 1.45, sa - 1.45, true);
      G.closePath();
      G.fillStyle = col(BLACK, 1, 0.22);
      G.fill();
    }
    if (LOD === 0 && !look.hood && !look.helmet) {
      // mottled, bruised skin
      G.beginPath();
      let any = false;
      for (let n = 0; n < 4; n++) {
        const az = (rnd(300 + n) - 0.5) * 3.6;
        const el = (rnd(310 + n) - 0.3) * 1.4;
        const dx = Math.sin(az) * Math.cos(el);
        const dy = Math.sin(el);
        const dz = Math.cos(az) * Math.cos(el);
        if (facing(HF[0] * dx + HF[3] * dy + HF[6] * dz, HF[2] * dx + HF[5] * dy + HF[8] * dz) < 0.35) continue;
        headPt(dx * rx * 0.92, dy * ry * 0.92, dz * rz * 0.92);
        const r = rx * (0.18 + 0.14 * rnd(320 + n)) * RG[PXS] * RG[QK];
        elSub(RG[QX], RG[QY], r, r * 0.7, rnd(330 + n) * 3);
        any = true;
      }
      if (any) {
        G.fillStyle = col(look.mottle || [96, 84, 110], 1, 0.22);
        G.fill();
      }
    }
    // the cap: hair, hood or helmet
    if (look.hood) hoodCap(rx, ry, rz, ff);
    else if (look.helmet) {
      if (look.helmet === "fire") brim(rx, ry, rz, LOD === 2 ? null : true);
      helmetCap(rx, ry, rz);
    }
    else if (look.hairStyle !== "none") hairCap(rx, ry, rz);
    else if (LOD === 0 && ff < 0.25) {
      // the bald back of the head: creases at the nape and an old stitched scar over the crown
      G.beginPath();
      for (let n = 0; n < 2; n++) {
        const u = -ry * (0.42 + n * 0.16);
        headPt(-rx * (0.5 - n * 0.1), u + ry * 0.06, -rz * 0.8);
        mt(RG[QX], RG[QY]);
        headPt(0, u - ry * 0.04, -rz * (0.92 - n * 0.06));
        lt(RG[QX], RG[QY]);
        headPt(rx * (0.5 - n * 0.1), u + ry * 0.06, -rz * 0.8);
        lt(RG[QX], RG[QY]);
      }
      headPt(-rx * 0.45, ry * 0.62, -rz * 0.62);
      mt(RG[QX], RG[QY]);
      headPt(rx * 0.05, ry * 0.8, -rz * 0.55);
      lt(RG[QX], RG[QY]);
      headPt(rx * 0.5, ry * 0.5, -rz * 0.7);
      lt(RG[QX], RG[QY]);
      for (let n = 0; n < 3; n++) {
        const t = 0.2 + n * 0.3;
        headPt(-rx * 0.45 + rx * 0.95 * t, ry * (0.62 + 0.18 * Math.sin(PI * t) + 0.09), -rz * 0.6);
        mt(RG[QX], RG[QY]);
        headPt(-rx * 0.45 + rx * 0.95 * t, ry * (0.62 + 0.18 * Math.sin(PI * t) - 0.09), -rz * 0.66);
        lt(RG[QX], RG[QY]);
      }
      G.strokeStyle = col(look.scar || INK, 0.8, 0.7);
      G.lineWidth = Math.max(0.7, RG[OUT] * 0.65);
      G.stroke();
    }
    if (bald && LOD === 0 && ff >= 0.25) {
      // bald, from the front: a shine and an old stitched scar
      G.beginPath();
      ellA(skullX - skullA * 0.28, skullY - skullB * 0.48, skullA * 0.32, skullB * 0.16, skullO - 0.3, 0, TAU);
      G.fillStyle = col(WHITE, 1, 0.16);
      G.fill();
      let f = faceDecal(rx * 0.3, ry * 0.55, rz * 0.4, 0, 0, 0.3, 0.6, 0.4);
      if (f > 0.1) {
        G.beginPath();
        headPt(rx * 0.05, ry * 0.85, rz * 0.35);
        mt(RG[QX], RG[QY]);
        headPt(rx * 0.55, ry * 0.6, rz * 0.3);
        lt(RG[QX], RG[QY]);
        for (let n = 0; n < 3; n++) {
          headPt(rx * (0.15 + n * 0.15), ry * (0.86 - n * 0.09), rz * 0.42);
          mt(RG[QX], RG[QY]);
          headPt(rx * (0.2 + n * 0.15), ry * (0.68 - n * 0.09), rz * 0.42);
          lt(RG[QX], RG[QY]);
        }
        G.strokeStyle = col(look.scar || [70, 50, 50], 1, 0.75);
        G.lineWidth = Math.max(0.7, RG[OUT] * 0.6);
        G.stroke();
      }
    }
    // ears, over the hair at the sides: from the side and from behind too (they stick out)
    if (LOD === 0 && look.ears) {
      for (let s = -1; s <= 1; s += 2) {
        const f = faceDecal(s * rx * 0.97, -ry * 0.08, -rz * 0.05, rz * 0.2, ry * 0.26, s, 0, 0.1);
        if (f < -0.3) continue;
        ellInk(col(skin, 0.8, 1));
      }
    }
    // the face
    FACE = false;
    if (ff > -0.25 && !FACEDOWN) drawFace(rx, ry, rz, ff);
    if (look.helmet === "riot" && !FACEDOWN) visor(rx, ry, rz, ff);
    if (look.helmet === "fire" && LOD < 2) brim(rx, ry, rz, false);
  }

  // a side lock of long hair, head-local: across (x rx), up (x ry) less a share of the lock's length, forward (x rz)
  const LOCK = [0.9, 0.38, 0, 0.42, 0.97, -0.3, 0.55, 0.32, 0.92, -0.25, 1, 0.16, 0.99, -0.3, 0.72, 0.02, 1.04, -0.3, 0.95, -0.14, 1.08, -0.3, 0.62, -0.3, 1.04, 0.2, 0, -0.38];
  /** Messy hair (or long hair's crown): a spiky cap above a jagged hairline. */
  function hairCap(rx, ry, rz) {
    const look = V;
    const g = look.hairGrow || 1.08;
    const sa = rx * g;
    const sb = ry * g;
    const sc = rz * g;
    const cu = ry * 0.04;
    const cf = -rz * 0.04;
    const ef = look.hairFront == null ? 0.5 : look.hairFront;
    const eb = look.hairBack == null ? -0.5 : look.hairBack;
    const n = LOD === 0 ? 16 : 12;
    for (let k = 0; k < n; k++) {
      const az = (k / n) * TAU;
      const e = eb + (ef - eb) * (0.5 + 0.5 * Math.cos(az));
      const ce = Math.cos(e);
      // facing from the smooth line; the drawn line is jagged (strands)
      RFs[k] = shellPoint(0, cu, cf, sa, sb, sc, Math.sin(az) * ce, Math.sin(e), Math.cos(az) * ce);
      const jag = LOD < 2 ? (k & 1 ? -0.2 - 0.14 * rnd(220 + k) : 0.04) * (look.hairJag || 1) : 0;
      const e2 = e + jag;
      const c2 = Math.cos(e2);
      shellPoint(0, cu, cf, sa, sb, sc, Math.sin(az) * c2, Math.sin(e2), Math.cos(az) * c2);
      RXs[k] = RG[QX];
      RYs[k] = RG[QY];
    }
    ellF(HF, HED, 0, cu, cf, sa, sb, sc);
    // the crown (pole): up and back
    const pf = shellPoint(0, cu, cf, sa, sb, sc, 0, 0.85, -0.53);
    const r = capPath(n, RG[QX], RG[QY], pf, LOD === 2 || look.spiky === false ? 0 : LOD === 0 ? 11 : 7);
    if (!r) return;
    G.fillStyle = col(look.hair, 1, 1);
    if (r === 2) G.fill("evenodd");
    else G.fill();
    if (LOD < 2) {
      G.strokeStyle = INKS;
      G.lineWidth = RG[OUT] * 1.6;
      G.stroke();
    }
    // long hair: a lock hangs down each side of the face
    if (look.hairStyle === "long" && LOD < 2) {
      const lk = look.lockLen || ry * 1.7;
      G.beginPath();
      let any = false;
      for (let s = -1; s <= 1; s += 2) {
        if (facing(HF[0] * s + HF[6] * 0.25, HF[2] * s + HF[8] * 0.25) < -0.3) continue;
        for (let k = 0; k < LOCK.length; k += 4) {
          headPt(s * rx * LOCK[k], ry * LOCK[k + 1] - lk * LOCK[k + 2], rz * LOCK[k + 3]);
          if (k) lt(RG[QX], RG[QY]);
          else mt(RG[QX], RG[QY]);
        }
        G.closePath();
        any = true;
      }
      if (any) {
        G.fill();
        G.stroke();
      }
    }
    if (LOD === 0 && look.hairStyle !== "long") {
      // a few lighter strands for texture
      G.beginPath();
      for (let m = 0; m < 4; m++) {
        const az = (rnd(240 + m) - 0.5) * 2.6;
        const d1 = shellPoint(0, cu, cf, sa * 0.98, sb * 0.98, sc * 0.98, Math.sin(az) * 0.3, 0.95, Math.cos(az) * 0.3 - 0.1);
        if (d1 < 0.2) continue;
        const x0 = RG[QX];
        const y0 = RG[QY];
        shellPoint(0, cu, cf, sa * 0.98, sb * 0.98, sc * 0.98, Math.sin(az) * 0.8, 0.45, Math.cos(az) * 0.8);
        mt(x0, y0);
        lt(RG[QX], RG[QY]);
      }
      G.strokeStyle = col(look.hair, 1.45, 0.7);
      G.lineWidth = Math.max(0.7, RG[OUT] * 0.6);
      G.stroke();
    }
  }
  /** A hood up over the head: the cloth round the face opening, shadowing it. From behind, a little smaller (it
      hugs the skull) with a seam down the middle and a dark rim where it drapes onto the shoulders. */
  function hoodCap(rx, ry, rz, ff) {
    const look = V;
    const back = clamp01(-ff * 2.5);
    const hk = 1 - 0.1 * back;
    const sa = rx * 1.36 * hk;
    const sb = ry * 1.28 * hk;
    const sc = rz * 1.18 * hk;
    const cu = ry * 0.06;
    const cf = -rz * 0.32;
    const n = 16;
    const po = 0.92; // the opening's half-width (rad round the head)
    for (let k = 0; k < n; k++) {
      const t = (k / n) * TAU;
      const az = po * Math.sin(t) * (Math.cos(t) < 0 ? 0.85 : 1);
      const e = -0.32 + 0.82 * Math.cos(t) - (Math.cos(t) < 0 ? 0.25 * -Math.cos(t) : 0);
      const ce = Math.cos(e);
      RFs[k] = shellPoint(0, cu, cf, sa, sb, sc, Math.sin(az) * ce, Math.sin(e), Math.cos(az) * ce);
      RXs[k] = RG[QX];
      RYs[k] = RG[QY];
    }
    ellF(HF, HED, 0, cu, cf, sa, sb, sc);
    const pf = shellPoint(0, cu, cf, sa, sb, sc, 0, 0.3, -0.95);
    const r = capPath(n, RG[QX], RG[QY], pf, 0);
    if (!r) return;
    G.fillStyle = col(look.shirt, 1.05, 1);
    if (r === 2) G.fill("evenodd");
    else G.fill();
    if (LOD < 2) {
      G.strokeStyle = INKS;
      G.lineWidth = RG[OUT] * 2;
      G.stroke();
    }
    if (LOD < 2) {
      // the shadow just inside the opening, and the hem of the hood
      G.strokeStyle = col(look.hoodShade || [10, 8, 18], 1, 0.6);
      G.lineWidth = RG[ERB] * 0.15;
      G.beginPath();
      let started = false;
      for (let m = 0; m <= n; m++) {
        const kk = m % n;
        if (RFs[kk] > 0) {
          if (started) lt(RXs[kk], RYs[kk]);
          else mt(RXs[kk], RYs[kk]);
          started = true;
        } else if (started) {
          G.stroke();
          started = false;
          G.beginPath();
        }
      }
      if (started) G.stroke();
      if (back > 0) {
        // the back: the rim where the hood drapes onto the shoulders, then the seam over the crown
        G.beginPath();
        let started = false;
        for (let m = 0; m <= 8; m++) {
          const az = PI - 1.25 + (m / 8) * 2.5;
          const e = -0.62;
          const f = shellPoint(0, cu, cf, sa, sb, sc, Math.sin(az) * Math.cos(e), Math.sin(e), Math.cos(az) * Math.cos(e));
          if (f > -0.05) {
            if (started) lt(RG[QX], RG[QY]);
            else mt(RG[QX], RG[QY]);
            started = true;
          }
        }
        if (started) {
          G.strokeStyle = col(look.hoodShade || [10, 8, 18], 1, 0.7 * back);
          G.lineWidth = Math.max(1, RG[ERB] * 0.2);
          G.stroke();
        }
        G.beginPath();
        started = false;
        for (let m = 0; m <= 6; m++) {
          const e = 1.25 - (m / 6) * 1.75;
          const f = shellPoint(0, cu, cf, sa * 1.005, sb * 1.005, sc * 1.005, 0, Math.sin(e), -Math.cos(e));
          if (f > 0.02) {
            if (started) lt(RG[QX], RG[QY]);
            else mt(RG[QX], RG[QY]);
            started = true;
          }
        }
        if (started) {
          G.strokeStyle = col(INK, 1, 0.55 * back);
          G.lineWidth = Math.max(0.8, RG[OUT] * 0.8);
          G.stroke();
        }
      }
      if (LOD === 0 && ff > 0.2) {
        // the top of the face sinks into shadow under the hood
        faceDecal(0, ry * 0.45, rz * 0.8, rx * 0.85, ry * 0.42, 0, 0.3, 1);
        G.beginPath();
        ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], 0, TAU);
        G.fillStyle = col(look.hoodShade || [10, 8, 18], 1, 0.35);
        G.fill();
      }
    }
  }
  /** Helmet dome (riot or fire): a hard shell over the crown with a shine. */
  function helmetCap(rx, ry, rz) {
    const look = V;
    const fire = look.helmet === "fire";
    const sa = rx * 1.2;
    const sb = ry * 1.17;
    const sc = rz * 1.2;
    const cu = ry * 0.1;
    const cf = -rz * 0.05;
    const ef = fire ? 0.42 : 0.3;
    const eb = fire ? -0.95 : -0.55;
    const n = 14;
    for (let k = 0; k < n; k++) {
      const az = (k / n) * TAU;
      const e = eb + (ef - eb) * (0.5 + 0.5 * Math.cos(az));
      const ce = Math.cos(e);
      RFs[k] = shellPoint(0, cu, cf, sa, sb, sc, Math.sin(az) * ce, Math.sin(e), Math.cos(az) * ce);
      RXs[k] = RG[QX];
      RYs[k] = RG[QY];
    }
    ellF(HF, HED, 0, cu, cf, sa, sb, sc);
    const hx = RG[EX];
    const hy = RG[EY];
    const ha = RG[ERA];
    const hb = RG[ERB];
    const ho = RG[ERO];
    const pf = shellPoint(0, cu, cf, sa, sb, sc, 0, 0.9, -0.4);
    const r = capPath(n, RG[QX], RG[QY], pf, 0);
    if (!r) return;
    G.fillStyle = col(look.helmetCol, 1, 1);
    if (r === 2) G.fill("evenodd");
    else G.fill();
    if (LOD < 2) {
      G.strokeStyle = INKS;
      G.lineWidth = RG[OUT] * 2;
      G.stroke();
    }
    if (LOD === 0) {
      G.beginPath();
      ellA(hx - ha * 0.3, hy - hb * 0.45, ha * 0.36, hb * 0.18, ho - 0.35, 0, TAU);
      G.fillStyle = col(WHITE, 1, fire ? 0.2 : 0.26);
      G.fill();
    }
    if (fire && LOD === 0) {
      // the comb along the crown: only where it faces the camera and lies on the dome (never floating over it)
      G.beginPath();
      let started = false;
      const c = Math.cos(ho);
      const sn = Math.sin(ho);
      for (let m = 0; m <= 8; m++) {
        const a = 0.1 + (m / 8) * 2.4; // from over the brow, over the crown, down the back
        const f = shellPoint(0, cu, cf, sa * 1.02, sb * 1.02, sc * 1.02, 0, Math.sin(a), Math.cos(a));
        const dx = RG[QX] - hx;
        const dy = RG[QY] - hy;
        const u = (dx * c + dy * sn) / ha;
        const v = (-dx * sn + dy * c) / hb;
        if (f > 0.05 && u * u + v * v < 0.92) {
          if (started) lt(RG[QX], RG[QY]);
          else mt(RG[QX], RG[QY]);
          started = true;
        } else if (started) break;
      }
      if (started) {
        G.strokeStyle = col(look.helmetCol, 1.6, 1);
        G.lineWidth = Math.max(1, RG[OUT] * 1.2);
        G.stroke();
      }
    }
  }
  /** Riot visor: a scratched, cracked shield over the face (drawn after it, so the dim face shows through). */
  function visor(rx, ry, rz, ff) {
    if (ff < -0.15) return;
    const look = V;
    faceDecal(0, -ry * 0.12, rz * 1.18, rx * 1.02, ry * 0.88, 0, 0, 1);
    G.beginPath();
    ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], 0, TAU);
    G.fillStyle = col(look.visor, 1, 0.34);
    G.fill();
    if (LOD === 2) return;
    G.strokeStyle = INKS;
    G.lineWidth = RG[OUT] * 1.6;
    G.stroke();
    if (LOD === 0) {
      const cx = RG[EX] + RG[ERA] * 0.25;
      const cy = RG[EY] - RG[ERB] * 0.2;
      G.beginPath();
      mt(RG[EX] - RG[ERA] * 0.55, RG[EY] - RG[ERB] * 0.5);
      lt(RG[EX] - RG[ERA] * 0.1, RG[EY] - RG[ERB] * 0.75);
      G.strokeStyle = col(WHITE, 1, 0.35);
      G.lineWidth = Math.max(1, RG[ERB] * 0.08);
      G.stroke();
      G.beginPath();
      for (let n = 0; n < 4; n++) {
        const a = n * 1.7 + 0.4;
        mt(cx, cy);
        lt(cx + Math.cos(a) * RG[ERA] * 0.45, cy + Math.sin(a) * RG[ERB] * 0.42);
      }
      G.strokeStyle = col(WHITE, 1, 0.5);
      G.lineWidth = Math.max(0.6, RG[OUT] * 0.5);
      G.stroke();
    }
  }
  /** Firefighter's brim, longer at the back, in two halves: the far one before the dome (so the dome hides what is
      behind it, no "Saturn ring" across it), the near one after. far: true / false; null: the whole brim. */
  function brim(rx, ry, rz, far) {
    const o = HED * 3;
    const u = ry * 0.38;
    const f = -rz * 0.22;
    brimEll(rx, ry, rz, o, u, f);
    const fill = col(V.helmetCol, 1.35, 1);
    if (far == null) return ellInk(fill);
    // the brim point nearest the camera: the camera's direction laid in the brim's plane
    const nx = HF[3];
    const ny = HF[4];
    const nz = HF[5];
    const dn = RG[TCX] * nx + RG[TCZ] * nz;
    const vx = RG[TCX] - dn * nx;
    const vy = -dn * ny;
    const vz = RG[TCZ] - dn * nz;
    const A = rx * 1.62;
    const B = rz * 1.75;
    const va = vx * HF[0] + vy * HF[1] + vz * HF[2];
    const vb = vx * HF[6] + vy * HF[7] + vz * HF[8];
    const vl = hyp2(A * va, B * vb);
    if (vl < 1e-4) {
      // seen square from above or below: the whole brim, after the dome
      if (!far) ellInk(fill);
      return;
    }
    const pa = (A * A * va) / vl;
    const pb = (B * B * vb) / vl;
    proj(J[o] + HF[3] * u + HF[6] * f + HF[0] * pa + HF[6] * pb, J[o + 1] + HF[4] * u + HF[7] * f + HF[1] * pa + HF[7] * pb, J[o + 2] + HF[5] * u + HF[8] * f + HF[2] * pa + HF[8] * pb, 0);
    const tn = ellAngle(RG[QX], RG[QY]);
    const a0 = far ? tn + PI / 2 : tn - PI / 2;
    G.beginPath();
    ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], a0, a0 + PI);
    G.closePath();
    G.fillStyle = fill;
    G.fill();
    if (LOD > 0) return;
    // ink the rim only (the cut across the middle is hidden under the dome / covered by the near half)
    G.beginPath();
    ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], a0, a0 + PI);
    G.strokeStyle = INKS;
    G.lineWidth = Math.min(RG[OUT] * 2, Math.max(0.8, RG[ERB] * 0.4));
    G.stroke();
  }
  function brimEll(rx, ry, rz, o, u, f) {
    ellipsoid(
      J[o] + HF[3] * u + HF[6] * f,
      J[o + 1] + HF[4] * u + HF[7] * f,
      J[o + 2] + HF[5] * u + HF[8] * f,
      HF[0] * rx * 1.62,
      HF[1] * rx * 1.62,
      HF[2] * rx * 1.62,
      HF[6] * rz * 1.75,
      HF[7] * rz * 1.75,
      HF[8] * rz * 1.75,
      HF[3] * ry * 0.1,
      HF[4] * ry * 0.1,
      HF[5] * ry * 0.1,
      0
    );
  }

  // per visible eye: socket ellipse (x, y, a, b, rot), side, scale, lid corners (4 x, y), brow ends (2 x, y)
  const EYE_N = 19;
  const EYEP = new Float64Array(EYE_N * 2);
  // lid corners then brow ends, head-local (across x side x rx, up x ry, forward x rz) from the eye's centre
  const EYE_LID = [0.3, 0.2, 0.82, -0.28, 0.02, 0.9, -0.22, -0.04, 0.9, 0.24, 0.07, 0.84, 0.36, 0.28, 0.78, -0.3, 0.12, 0.9];
  /** Eye e's socket ellipse scaled (ka, kb), nudged (dx across, dy down) in its own size, as a sub-path. */
  function eyeSub(e, ka, kb, dx, dy) {
    const o = e * EYE_N;
    elSub(EYEP[o] + EYEP[o + 2] * dx, EYEP[o + 1] + EYEP[o + 3] * dy, EYEP[o + 2] * ka, EYEP[o + 3] * kb, EYEP[o + 4]);
  }
  /** Eyes in dark sockets, a heavy brow, nose, open mouth with teeth, gaunt cheeks. Only the parts whose
      surface faces the camera: a profile shows one eye, the back none. */
  function drawFace(rx, ry, rz, ff) {
    const look = V;
    const skin = look.skin;
    const wide = look.mouthW || 1;
    const jo = RG[JAW];
    // mouth: dark opening, teeth top and bottom
    const mu = -ry * (0.5 + 0.12 * jo);
    const mh = ry * (0.08 + 0.17 * jo);
    const mw = rx * 0.42 * wide;
    const fm = facing(HF[6] - HF[3] * 0.25, HF[8] - HF[5] * 0.25);
    if (fm > -0.1) {
      ellF(HF, HED, 0, mu, rz * 0.74, mw, mh, rz * 0.3);
      G.beginPath();
      ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], 0, TAU);
      G.fillStyle = col(look.mouth, 1, 1);
      G.fill();
      if (LOD === 0) {
        G.strokeStyle = INKS;
        G.lineWidth = Math.min(RG[OUT], Math.max(0.6, RG[ERB] * 0.3));
        G.stroke();
      }
      if (LOD < 2) {
        // upper teeth hang from the top of the opening, lower ones stand on the jaw; one is missing
        const nt = LOD === 0 ? 6 : 4;
        G.beginPath();
        for (let row = 0; row < 2; row++) {
          const top = row === 0;
          const yb = top ? mu + mh * 0.92 : mu - mh * 0.92;
          const th = (top ? -1 : 1) * mh * (0.55 + 0.1 * jo);
          headPt(-mw * 0.88, yb, rz * 0.95);
          mt(RG[QX], RG[QY]);
          for (let t = 0; t < nt; t++) {
            const x0 = -mw * 0.88 + ((t + 0.5) / nt) * mw * 1.76;
            const gap = (t === 2 && top) || (t === nt - 2 && !top);
            headPt(x0, yb + (gap ? th * 0.15 : th * (0.75 + 0.35 * rnd(260 + t + row * 9))), rz * 0.96);
            lt(RG[QX], RG[QY]);
            headPt(-mw * 0.88 + ((t + 1) / nt) * mw * 1.76, yb, rz * 0.95);
            lt(RG[QX], RG[QY]);
          }
          G.closePath();
        }
        G.fillStyle = col(look.teeth, 1, 1);
        G.fill();
        if (LOD === 0) {
          G.strokeStyle = col(INK, 1, 0.8);
          G.lineWidth = Math.max(0.5, RG[OUT] * 0.45);
          G.stroke();
        }
      }
      if (LOD === 0 && GORE && fm > 0.05) {
        // a dribble from the corner of the mouth
        headPt(mw * 0.7, mu - mh * 0.3, rz * 0.9);
        G.beginPath();
        mt(RG[QX], RG[QY]);
        headPt(mw * 0.8, mu - mh - ry * 0.32, rz * 0.82);
        lt(RG[QX], RG[QY]);
        G.strokeStyle = goreCol(1, 0.7);
        G.lineWidth = Math.max(0.8, rx * 0.09 * RG[PXS] * RG[QK]);
        G.stroke();
      }
    }
    // gaunt cheeks: dark hollows under the cheekbones
    if (LOD === 0) {
      G.beginPath();
      let any = false;
      for (let s = -1; s <= 1; s += 2) {
        const f = faceDecal(s * rx * 0.62, -ry * 0.3, rz * 0.72, rx * 0.2, ry * 0.2, s * 0.6, -0.1, 0.8);
        if (f < 0.15) continue;
        ellSub(0);
        any = true;
      }
      if (any) {
        G.fillStyle = col(look.hollow || [30, 34, 26], 1, 0.38);
        G.fill();
      }
      // nose: a ridge and two dark nostrils
      const fn = faceDecal(0, -ry * 0.22, rz * 0.98, rx * 0.12, ry * 0.09, 0, 0, 1);
      if (fn > 0.2) {
        G.beginPath();
        elSub(RG[EX] - RG[ERA] * 0.55, RG[EY], RG[ERA] * 0.42, RG[ERB] * 0.5, RG[ERO]);
        elSub(RG[EX] + RG[ERA] * 0.55, RG[EY], RG[ERA] * 0.42, RG[ERB] * 0.5, RG[ERO]);
        G.fillStyle = col(INK, 1, 0.8);
        G.fill();
      }
    }
    // a short, sunken nose: a bump on the profile
    if (LOD === 0 && ff > -0.1) {
      ellF(HF, HED, 0, -ry * 0.2, rz * 0.9, rx * 0.12, ry * 0.2, rz * 0.17);
      ellPath(0);
      G.fillStyle = col(look.skin, 0.9, 1);
      G.fill();
      G.strokeStyle = col(INK, 1, 0.75);
      G.lineWidth = Math.max(0.6, RG[OUT] * 0.7);
      G.stroke();
    }
    // eyes: both worked out first, then drawn in one fill per layer (socket, glow, eye, pupil, lid) and one brow stroke
    let n = 0;
    for (let s = -1; s <= 1; s += 2) {
      const ex = s * rx * 0.4;
      const eu = ry * 0.08;
      if (faceDecal(ex, eu, rz * 0.84, rx * 0.27, ry * 0.21, s * 0.45, 0.1, 0.89) < 0.04) continue;
      const o = n * EYE_N;
      EYEP[o] = RG[EX];
      EYEP[o + 1] = RG[EY];
      EYEP[o + 2] = RG[ERA];
      EYEP[o + 3] = RG[ERB];
      EYEP[o + 4] = RG[ERO];
      EYEP[o + 5] = s;
      EYEP[o + 6] = RG[QK];
      // the lid's four corners and the brow's two ends
      for (let k = 0; k < 6; k++) {
        const q = k * 3;
        headPt(ex + s * rx * EYE_LID[q], eu + ry * EYE_LID[q + 1], rz * EYE_LID[q + 2]);
        EYEP[o + 7 + k * 2] = RG[QX];
        EYEP[o + 8 + k * 2] = RG[QY];
      }
      n++;
    }
    if (n) {
      if (LOD < 2) {
        G.beginPath();
        for (let e = 0; e < n; e++) eyeSub(e, 1, 1, 0, 0);
        G.fillStyle = col(look.socket || [22, 20, 18], 1, 0.92);
        G.fill();
      }
      // glow, then the eye (no fog: they glow in the dark); far away just the eye
      if (LOD < 2) {
        G.beginPath();
        for (let e = 0; e < n; e++) eyeSub(e, 1.05, 1.05, 0, 0);
        G.fillStyle = glow(look.glow, 0.28);
        G.fill();
      }
      G.beginPath();
      for (let e = 0; e < n; e++) {
        if (LOD < 2) eyeSub(e, 0.52, 0.4, 0, 0.08);
        else eyeSub(e, 0.72, 0.6, 0, 0.05);
      }
      G.fillStyle = glow(look.eye, 1);
      G.fill();
      if (LOD === 0) {
        // pupils, and heavy lids slanting down to the nose
        G.beginPath();
        for (let e = 0; e < n; e++) eyeSub(e, 0.13, 0.15, -0.06 * EYEP[e * EYE_N + 5], 0.1);
        G.fillStyle = col(look.pupil || [70, 48, 20], 1, 1);
        G.fill();
        G.beginPath();
        for (let e = 0; e < n; e++) {
          const o = e * EYE_N + 7;
          mt(EYEP[o], EYEP[o + 1]);
          for (let k = 1; k < 4; k++) lt(EYEP[o + k * 2], EYEP[o + k * 2 + 1]);
          G.closePath();
        }
        G.fillStyle = col(skin, 0.42, 1);
        G.fill();
      }
      if (LOD < 2) {
        G.beginPath();
        for (let e = 0; e < n; e++) {
          const o = e * EYE_N + 15;
          mt(EYEP[o], EYEP[o + 1]);
          lt(EYEP[o + 2], EYEP[o + 3]);
        }
        G.strokeStyle = col(look.brow || INK, 1, 0.85);
        G.lineWidth = Math.max(0.8, ry * 0.09 * RG[PXS] * EYEP[6]);
        G.stroke();
      }
    }
    const anyEye = n > 0;
    FACE = anyEye;
  }

  /** Long hair hanging down the back (its own part, sorted behind the head from the front). */
  function drawHairBack() {
    const look = V;
    const b = T.build;
    const rx = b.head[0];
    const ry = b.head[1];
    const rz = b.head[2];
    const g = look.hairGrow || 1.08;
    const sa = rx * g;
    const sb = ry * g;
    const sc = rz * g;
    const eb = (look.hairBack == null ? -0.5 : look.hairBack) + 0.25;
    const len = look.hairLen * (1 - 0.7 * RG[LYING]);
    const n = 7;
    const o = HED * 3;
    // top edge round the back of the head, the hair falls straight down from it
    G.beginPath();
    for (let k = 0; k < n; k++) {
      const az = PI * 0.42 + (k / (n - 1)) * PI * 1.16;
      const ce = Math.cos(eb);
      const lx = Math.sin(az) * ce * sa;
      const ly = ry * 0.04 + Math.sin(eb) * sb;
      const lz = -rz * 0.04 + Math.cos(az) * ce * sc;
      const x = J[o] + HF[0] * lx + HF[3] * ly + HF[6] * lz;
      const y = J[o + 1] + HF[1] * lx + HF[4] * ly + HF[7] * lz;
      const z = J[o + 2] + HF[2] * lx + HF[5] * ly + HF[8] * lz;
      proj(x, y, z, 0);
      RXs[k] = RG[QX];
      RYs[k] = RG[QY];
      // the hair's end below it, a little out from the shoulders
      const out = 0.02 + 0.03 * Math.abs(Math.sin(az));
      const l = len * (k & 1 ? 0.82 + 0.25 * rnd(400 + k) : 1);
      proj(x + (HF[0] * Math.sin(az) + HF[6] * Math.cos(az)) * out, y - l, z + (HF[2] * Math.sin(az) + HF[8] * Math.cos(az)) * out, 0);
      RXs[n + k] = RG[QX];
      RYs[n + k] = RG[QY];
    }
    mt(RXs[0], RYs[0]);
    for (let k = 0; k < n; k++) {
      lt(RXs[n + k], RYs[n + k]);
      if (k < n - 1) lt((RXs[n + k] + RXs[n + k + 1]) / 2 + (RXs[k] - RXs[n + k]) * 0.3, (RYs[n + k] + RYs[n + k + 1]) / 2 + (RYs[k] - RYs[n + k]) * 0.3);
    }
    lt(RXs[n - 1], RYs[n - 1]);
    for (let k = n - 2; k > 0; k--) lt(RXs[k], RYs[k]);
    G.closePath();
    G.fillStyle = col(look.hair, 1, 1);
    G.fill();
    if (LOD < 2) {
      G.strokeStyle = INKS;
      G.lineWidth = RG[OUT] * 1.6;
      G.stroke();
    }
    if (LOD === 0) {
      G.beginPath();
      for (let k = 1; k < n - 1; k++) {
        mt(RXs[k], RYs[k]);
        lt(RXs[n + k] * 0.85 + RXs[k] * 0.15, RYs[n + k] * 0.85 + RYs[k] * 0.15);
      }
      G.strokeStyle = col(look.hair, 1.6, 0.6);
      G.lineWidth = Math.max(0.6, RG[OUT] * 0.5);
      G.stroke();
    }
  }

  /* ---------- Parts, sorted far to near ---------- */
  const PT_LEG0 = 0;
  const PT_LEG1 = 1;
  const PT_PELVIS = 2;
  const PT_TORSO = 3;
  const PT_ARM0 = 4;
  const PT_ARM1 = 5;
  const PT_HEAD = 6;
  const PT_HAIR = 7;
  const NP = 8;
  const pKey = new Float64Array(NP);
  let ARMPAIR = false;
  let HEADBACK = false; // the head is behind the shoulders (drawn before the torso)
  let FACEDOWN = false; // the head points well down (a body falling or lying on its face): no face shows
  const FACE_DOWN = -0.7; // the head's forward points lower than this (up is +1): its face is toward the floor (upright poses stay above -0.6)
  // Lying flat, the head rests on the floor, so a face turned less far down is already against it: the line rises from
  // FACE_DOWN (standing) to this (flat) with how far over the body has gone (RG[LYING]). Without it a heap's head
  // tucked back under its chest (the lanky's fold, the runner's tumble: forward about -0.6, toward its own feet)
  // showed its face upside down from behind and from the side. A body on its side has its face about level (above
  // -0.3) and one on its back faces up, so both still show their faces.
  const FACE_DOWN_LYING = -0.4;
  let LEGPAIR = false;
  const pOrd = new Int32Array(NP);
  function drawPart(p) {
    switch (p) {
      case PT_LEG0:
        return drawLeg(0);
      case PT_LEG1:
        return drawLeg(1);
      case PT_PELVIS:
        return drawPelvis();
      case PT_TORSO:
        return drawTorso();
      case PT_ARM0:
        return drawArm(0);
      case PT_ARM1:
        return drawArm(1);
      case PT_HEAD:
        return drawHead();
      default:
        return drawHairBack();
    }
  }

  /* ---------- The figure ---------- */
  function gore() {
    const w = ZSR.WORLD;
    const s = w && w.SETTINGS;
    return !(s && s.walkerGore === false);
  }
  function draw(ctx, type, st, cam) {
    const t = TYPES[type] || TYPES.walker;
    RESULT.face = false;
    RESULT.parts = 0;
    if (!t || !ctx || !st || !cam) return RESULT;
    T = t;
    G = ctx;
    SEED = st.seed | 0;
    V = t.looks[(SEED >>> 0) % t.looks.length];
    RG[CW] = Math.max(1, +cam.w || 1);
    RG[CH] = Math.max(1, +cam.h || 1);
    RG[W2] = RG[CW] / 2;
    FLR[1] = +cam.floor > 0 ? Math.min(+cam.floor, RG[CH] * 0.6) : 0;
    FLR[0] = RG[CH] - FLR[1];
    SHADOW = cam.shadow !== false;
    RG[PXS] = +cam.px > 0 ? +cam.px : FLR[0] / t.h;
    RG[DIST] = +cam.dist > 0.05 ? +cam.dist : 0.05;
    RG[EYE] = cam.eye == null || !Number.isFinite(+cam.eye) ? 0.5 : Math.max(0.05, +cam.eye);
    const yaw = +st.yaw || 0;
    RG[CYAW] = Math.cos(yaw);
    RG[SYAW] = Math.sin(yaw);
    RG[TCX] = -RG[SYAW];
    RG[TCZ] = RG[CYAW];
    LOD = st.lod === 1 || st.lod === 2 ? st.lod : 0;
    // fog in steps of 1/FOG_STEPS: a walker coming out of the dark changes colour 30 times, not every frame (the
    // colour table stays small and nothing is allocated)
    RG[FOGK] = 1 - Math.round(Math.min(0.9, Math.max(0, +st.fog || 0)) * FOG_STEPS) / FOG_STEPS;
    RG[FLASH] = st.hit ? 0.5 : 0;
    GORE = st.gore == null ? gore() : !!st.gore;
    INKS = col(INK, 1, 1);
    FACE = false;
    solve(t, st);
    // (seen from above, cam.floor, the perspective is what lays a lying body along the floor: all of it)
    RG[PSC] = FLR[1] > 0 && RG[DIST] > 3 ? 1 : 1 - 0.5 * RG[LYING];
    RG[OUT] = Math.max(0.7, Math.min(3.2, RG[PXS] * 0.0105));
    fit();
    RG[OUT] = Math.max(0.7, Math.min(3.2, RG[PXS] * RG[FIT] * 0.0105));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 1;
    drawGround();
    // sort keys: depth of each part (+ farther), with small nudges so the trousers sit under the shirt
    // and an arm hanging beside the body is not hidden by it
    pKey[PT_LEG0] = md3(HI[0], KN[0], AN[0]) + 0.16;
    pKey[PT_LEG1] = md3(HI[1], KN[1], AN[1]) + 0.16;
    pKey[PT_PELVIS] = jDepth(PEL) + 0.1;
    pKey[PT_TORSO] = (jDepth(PEL) + jDepth(CHE)) / 2 + 0.01;
    pKey[PT_ARM0] = md3(SH[0], EL[0], HA[0]) - 0.01;
    pKey[PT_ARM1] = md3(SH[1], EL[1], HA[1]) - 0.01;
    // facing the camera, the head goes after the torso (its chin over the chest). Turned away with the head behind
    // the shoulders (a hunched walker from behind), it goes by its real depth: the torso and the near shoulder
    // cover its lower part and the top of the skull shows over them
    // A head pointing well down (falling or lying on its face: below FACE_DOWN, rising to FACE_DOWN_LYING as the body
    // goes flat) shows no face from anywhere, so it goes by its real depth too: lying away from you, the body covers
    // it (drawn after the torso it would sit between the boots)
    FACEDOWN = HF[7] < FACE_DOWN + (FACE_DOWN_LYING - FACE_DOWN) * RG[LYING];
    HEADBACK = FACEDOWN || (facing(HF[6], HF[8]) < 0 && jDepth(HED) > jDepth(CHE));
    if (HEADBACK) pKey[PT_HEAD] = jDepth(HED);
    else pKey[PT_HEAD] = Math.min(jDepth(HED) - 0.12, pKey[PT_TORSO] - 0.001);
    const back = 0.15;
    pKey[PT_HAIR] = depth(J[HED * 3] - HF[6] * back, J[HED * 3 + 2] - HF[8] * back);
    // far away, both arms on the same side of the torso are one part (drawn with one call per pass); at lod 2
    // so are both legs
    ARMPAIR = LOD > 0 && pKey[PT_ARM0] < pKey[PT_TORSO] === pKey[PT_ARM1] < pKey[PT_TORSO];
    if (ARMPAIR) pKey[PT_ARM0] = Math.min(pKey[PT_ARM0], pKey[PT_ARM1]);
    // (lod 1: only from the front or back, where the legs stand side by side; in profile the near one must be
    // inked over the far one)
    LEGPAIR = LOD === 2 || (LOD === 1 && Math.abs(RG[CYAW]) > 0.7);
    if (LEGPAIR) pKey[PT_LEG0] = Math.max(pKey[PT_LEG0], pKey[PT_LEG1]);
    let n = 0;
    for (let p = 0; p < NP; p++) {
      if (p === PT_HAIR && !V.hairLen) continue;
      if (p === PT_PELVIS && (V.hem > 0.14 || LOD === 2)) continue;
      if ((p === PT_ARM1 && ARMPAIR) || (p === PT_LEG1 && LEGPAIR)) continue;
      // insertion sort, farthest first
      let i = n++;
      while (i > 0 && pKey[pOrd[i - 1]] < pKey[p]) {
        pOrd[i] = pOrd[i - 1];
        i--;
      }
      pOrd[i] = p;
    }
    for (let i = 0; i < n; i++) drawPart(pOrd[i]);
    RESULT.face = FACE;
    RESULT.parts = n;
    G = null;
    return RESULT;
  }

  /* ---------- Types ---------- */
  const TYPES = {};
  const hexRgb = (v) => {
    if (Array.isArray(v)) return v.slice(0, 3);
    if (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v)) {
      const n = parseInt(v.slice(1), 16);
      return [n >> 16, (n >> 8) & 255, n & 255];
    }
    return v;
  };
  const COLOR_KEYS = ["skin", "handSkin", "shirt", "sleeveCol", "cuff", "pants", "legs", "shoe", "sole", "hair", "eye", "glow", "pupil", "socket", "brow", "mouth", "teeth", "nail", "flesh", "bone", "blood", "grime", "stain", "mottle", "hollow", "pad", "helmetCol", "visor", "band", "band2", "string", "hoodShade", "scar", "thread"];
  const LOOK_DEFAULTS = {
    skin: [156, 168, 128],
    shirt: [104, 116, 142],
    pants: [78, 90, 128],
    shoe: [92, 70, 50],
    sole: [38, 30, 25],
    hair: [80, 58, 40],
    eye: [255, 238, 150],
    glow: [255, 214, 70],
    mouth: [34, 12, 16],
    teeth: [214, 200, 150],
    nail: [40, 36, 26],
    flesh: [84, 22, 24],
    bone: [226, 214, 184],
    blood: [118, 18, 14],
    grime: [62, 54, 40],
    hem: 0.05,
    sleeve: "short",
    hairStyle: "messy",
    ears: true,
    smears: 3,
  };
  /** Add (or replace) a walker type's look. def: { h, w, r, fall, build, gait, look, variants }; see
      js/walker3d-looks.js for every field. */
  function addType(id, def) {
    const t = {
      id,
      h: def.h,
      w: def.w,
      r: def.r,
      fall: def.fall || "crumple",
      build: Object.assign({ finger: 1, pool: 0.3, shadow: 0.2, rise: 0.04 }, def.build),
      gait: Object.assign({ stride: 0.8, duty: 0.6, lift: 0.05, crouch: 0.03, lean: 0.15, bob: 0.012, sway: 0.02, twist: 0.1, roll: 0.03, tilt: 0, headFwd: 0.02, headUp: 0.6, headTilt: 0.1, jaw: 0.4, arms: "reach", reachSide: -1, dragSide: 1, toeOut: 0.12, clawRate: 1.6, clawUp: 0.34, turnRate: 7, scream: false }, def.gait),
      looks: [],
    };
    t.gaitRun = Object.assign({}, t.gait); // (refilled by solve for st.run)
    const base = Object.assign({}, LOOK_DEFAULTS, def.look);
    const variants = def.variants && def.variants.length ? def.variants : [{}];
    t.looks = variants.map((v) => {
      const L = Object.assign({}, base, v);
      COLOR_KEYS.forEach((k) => {
        if (L[k] != null) L[k] = hexRgb(L[k]);
      });
      if (!L.thread) L.thread = (L.legs || L.pants).map((c, i) => Math.round(c + ([236, 232, 222][i] - c) * 0.6));
      return L;
    });
    t.box = { h: t.h, w: t.w, head: t.h, bar: 0.5 };
    t.boxFall = { h: t.h, w: Math.max(t.w, 2 * t.h + 0.2), head: t.h, bar: 0.5 };
    TYPES[id] = t;
    // the head's top when standing still: for the health bar
    const st = { yaw: 0, gait: 0, move: 0, pose: "idle", poseT: 0, claw: 0, hit: 0, fall: 0, fallDir: PI, seed: 0, lod: 0, fog: 0, gore: true };
    const keepT = T;
    const keepV = V;
    T = t;
    V = t.looks[0];
    SEED = 0;
    solve(t, st);
    const hb = t.build.head;
    t.headTop = Math.min(t.h, J[HED * 3 + 1] + hb[1] * (V.hood || V.helmet ? 1.3 : 1.12));
    buildEnv(t, st);
    T = keepT;
    V = keepV;
  }
  /** The envelope of every pose (see fit), sampled once per type: idle, the walk cycle at half and full stride (and
      hit); bites, claws and screams standing and moving. Every look variant, and a few seeds for the types whose
      tics depend on it. env: walking; envRun: all of that running too (st.run all the way), which the fit reads for a
      running figure, with wRun for the box's width (a caller that may draw one sizes its region by these). */
  function buildEnv(t, st) {
    const g = t.gait;
    const nSeed = Math.max(t.looks.length, g.headTic || g.jerk ? 4 : 1);
    const sets = [[], []]; // the points walking, and running
    const rhs = [0, 0];
    let into = 0;
    const sample = (pose, field, n, move, hit) => {
      for (let i = 0; i <= n; i++) {
        st.pose = pose;
        st.poseT = 0;
        st.claw = 0;
        st.gait = 0.3;
        st[field] = i / n;
        st.move = move;
        st.hit = hit;
        solve(t, st);
        for (let j = 0; j < NJ; j++) {
          const rho = hyp2(J[j * 3], J[j * 3 + 2]);
          if (rho + JR[j] > rhs[into]) rhs[into] = rho + JR[j];
          sets[into].push([rho, J[j * 3 + 1] + JR[j]]);
        }
      }
    };
    // (running, all the way: the sprint reaches furthest there; every other sample, so a page loads no slower than it
    // must, the 2% spare and the fit's own check of the pose covering what falls between them)
    // SCALE: runs once per type as the page loads, so each new kind adds its samples (about 10 ms a kind)
    [0, 1].forEach((run) => {
      into = run > 0 ? 1 : 0;
      st.run = run;
      const q = run > 0 ? 2 : 1;
      for (let seed = 0; seed < nSeed; seed++) {
        SEED = seed;
        V = t.looks[seed % t.looks.length];
        st.seed = seed;
        st.poseW = 1;
        sample("idle", "poseT", 8 / q, 0, 0);
        sample("walk", "gait", 32 / q, 1, 0);
        sample("walk", "gait", 16 / q, 0.5, 0);
        sample("walk", "gait", 8 / q, 1, 1);
        ["bite", "claw", "scream"].forEach((pose) => {
          const field = pose === "claw" ? "claw" : "poseT";
          sample(pose, field, 24 / q, 0, 0);
          sample(pose, field, 12 / q, 1, 0);
        });
      }
    });
    st.run = 0;
    t.env = frontier(sets[0], rhs[0]);
    t.envRun = frontier(sets[0].concat(sets[1]), Math.max(rhs[0], rhs[1]));
    // the box's width, as wide again as the sprint reaches further out (a caller that may draw one running gives it
    // a region this wide)
    t.wRun = t.w * Math.max(1, t.envRun.rh / t.env.rh);
  }
  /** An envelope from its sampled points (rho out from the feet's vertical, top) and the farthest reach rh. */
  function frontier(pts, rh) {
    // the frontier: from the farthest out inward, keep a point only if it is higher than every point farther out
    pts.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
    let keep = [];
    let best = -Infinity;
    pts.forEach((p) => {
      if (p[1] > best + 1e-4) {
        keep.push(p);
        best = p[1];
      }
    });
    // too many: merge neighbours into one that covers both (as far out and as high as either)
    while (keep.length > ENV_MAX) {
      const next = [];
      for (let i = 0; i < keep.length; i += 2) next.push(i + 1 < keep.length ? [keep[i][0], Math.max(keep[i][1], keep[i + 1][1])] : keep[i]);
      keep = next;
    }
    // a little to spare for the poses between the samples
    const env = { rh: rh * 1.02 + 0.004, n: keep.length, rho: new Float64Array(keep.length), top: new Float64Array(keep.length) };
    keep.forEach((p, i) => {
      env.rho[i] = p[0] * 1.02 + 0.004;
      env.top[i] = p[1] + 0.004;
    });
    return env;
  }
  /** Size of the region a type is drawn in (tiles, natural; the engine caps it under a ceiling). falling: wide
      enough for the body lying on its side. bar: the health bar's width, about the walker's hit width on
      screen (2 r 1.1 / STRETCH, r from WORLD.WALKER_TYPES when the facts are loaded). Reused objects. */
  const FOV = 1.22; // js/interior.js's FOV (tests/validate-art.js holds the two equal; the engine's own wins when exported)
  function box(type, falling) {
    const t = TYPES[type] || TYPES.walker;
    if (!t) return { h: 0.92, w: 1, head: 0.9, bar: 0.5 };
    const wt = ZSR.WORLD && ZSR.WORLD.WALKER_TYPES;
    const row = wt && (wt[type] || wt.walker);
    const r = row && row.r > 0 ? row.r : t.r;
    const o = falling ? t.boxFall : t.box;
    o.h = t.h;
    o.head = t.headTop;
    const I = ZSR.Interior;
    const fov = I && +I.FOV > 0 ? +I.FOV : FOV;
    o.bar = (2 * r * 1.1) / (2 * Math.tan(fov / 2));
    return o;
  }
  /** Tiles walked per gait cycle (feet stay planted when the engine advances gait by distance / stride); run (0..1,
      optional): running, as st.run draws it. */
  function stride(type, run) {
    const t = TYPES[type] || TYPES.walker;
    const s = t && t.gait.stride > 0 ? t.gait.stride : 0.9;
    const r = clamp01(run);
    return r > 0 ? s + (RUN_GAIT.stride - s) * r : s;
  }

  /* ---------- Blood spray sprites (cached by Draw3, so fog through D.dim is fine) ---------- */
  function bloodDrop(ctx, w, h) {
    ctx.fillStyle = "rgb(110,16,12)";
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.58, w * 0.3, h * 0.36, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w / 2 - w * 0.2, h * 0.45);
    ctx.lineTo(w / 2, h * 0.06);
    ctx.lineTo(w / 2 + w * 0.2, h * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,190,180,0.35)";
    ctx.beginPath();
    ctx.ellipse(w / 2 - w * 0.1, h * 0.5, w * 0.08, h * 0.1, 0, 0, TAU);
    ctx.fill();
  }
  bloodDrop.w = 8;
  bloodDrop.h = 12;
  function bloodSplat(ctx, w, h) {
    ctx.fillStyle = "rgb(96,14,11)";
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.3, h * 0.3, 0, 0, TAU);
    ctx.fill();
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * TAU + 0.4;
      const r = 0.34 + 0.1 * (k % 3);
      ctx.beginPath();
      ctx.ellipse(w / 2 + Math.cos(a) * w * r, h / 2 + Math.sin(a) * h * r, w * 0.07, h * 0.07, 0, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(150,30,24,0.6)";
    ctx.beginPath();
    ctx.ellipse(w / 2 - w * 0.06, h / 2 - h * 0.06, w * 0.14, h * 0.12, 0, 0, TAU);
    ctx.fill();
  }
  bloodSplat.w = 48;
  bloodSplat.h = 16;
  const SPRITES = { bloodDrop, bloodSplat };
  const D3 = ZSR.Draw3;
  if (D3 && D3.registerSprite) Object.keys(SPRITES).forEach((k) => D3.registerSprite(k, SPRITES[k].w, SPRITES[k].h, SPRITES[k]));

  /** For the art tests only: the last draw's fit, the joints (model tiles) and their projections (px), the head's
      frame (hf: across, up, forward, 3 each), how far over the body has gone (lying, 0..1), whether its face counted
      as toward the floor (faceDown) and whether the head was drawn by its real depth (headBack). Reused. */
  const PROBE = { fit: 1, fitEnv: 1, j: J, s: S, hf: HF, lying: 0, faceDown: false, headBack: false };
  function probe() {
    PROBE.fit = RG[FIT];
    PROBE.fitEnv = RG[FIT_ENV];
    PROBE.lying = RG[LYING];
    PROBE.faceDown = FACEDOWN;
    PROBE.headBack = HEADBACK;
    return PROBE;
  }

  ZSR.Walker3D = {
    FALL_SECS: 2,
    COLLAPSE_SECS: 0.9,
    FADE_SECS: 0.7,
    BITE_SECS: 0.45,
    SCREAM_SECS: 1.2,
    POSE_BLEND,
    FOG_STEPS,
    FACE_DOWN,
    FACE_DOWN_LYING,
    FOV,
    POSES,
    TYPES,
    addType,
    gore,
    box,
    stride,
    draw,
    SPRITES,
    probe,
  };
})(typeof window !== "undefined" ? window : globalThis);
