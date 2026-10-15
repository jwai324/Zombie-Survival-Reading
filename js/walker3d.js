/* Walker3D: the walkers as live 3D jointed figures, drawn fresh into a small canvas whenever they change, in the
   game's comic style (ink outline, flat fills, a little light and shade), from any side, in any pose, falling.
   No images and no WebGL: plain Canvas 2D calls straight into the context the engine hands over.

   The looks are data. js/walker3d-looks.js adds the six types with Walker3D.addType(id, def): build (bone
   lengths and widths in tiles), gait (stride, lean, sway, arms...), fall style and look (palette and gear,
   with variants a walker's seed picks between). More types go in an appended js/walker3d-looks2.js.

   draw(ctx, type, st, cam) -> { face, parts } (one reused object; copy what you keep)
   st (one object, reused by the caller):
     yaw     0 = facing the camera; +: its front turns to the camera's left
     gait    0..1 through the walk cycle (the engine advances it by distance walked / stride(type))
     move    0..1 from standing to walking
     pose    "idle" | "walk" | "bite" | "claw" | "scream" (a type that cannot scream bites instead)
     poseT   0..1 through a bite or a scream; for idle, a slow breathing cycle (0 is fine)
     claw    0..1 through a pair of overhead swipes (pose "claw")
     hit     0 | 1: the white flash of a shot landing
     fall    0..1 the collapse (0 standing); fallDir: rad relative to its forward (pi = backwards; + toward its
             right, the yaw sense: in the model, x its right and z its forward, fallDir fd points (sin fd, 0, cos fd))
     seed    int: which arm reaches, which gear, grime, hair
     lod     0 full | 1 no sheen, ribs or fingers | 2 silhouette, head and eyes
     fog     0..0.9: every colour times (1 - fog); the eyes keep their glow
     gore    bool, default gore(): blood smears, ribs through the rips, a pool under a fallen walker
   cam: w, h (px of the region drawn from 0,0), px (px per tile), dist (tiles to the camera plane),
        eye (tiles above the feet: the camera's height)

   Contract (tests/validate-art.js checks it): everything inside [0,w] x [0,h], the feet on y = h and the figure
   centred on x = w/2 (a figure too big for the region is shrunk about its feet); no translate, scale, rotate,
   transform or drawImage; no new canvases; no Path2D, OffscreenCanvas, DOMMatrix, shadowBlur or filter; context
   state is never read back; the same inputs make the same calls (seeded random only); nothing is allocated per
   draw (preallocated joint buffers, part records and a colour-string table); colours are "rgb(r,g,b)" or
   "rgba(r,g,b,a)" with whole channels, the light, fog and hit flash already in them; within the per-lod call ceilings
   tests/validate-art.js sets (WALKER_OPS).
   The model keeps screen proportions: the engine squashes the floor sideways by STRETCH, but a walker with real
   proportions squashed the same way looks about 30% too thin, so it is not squashed (DESIGN.md). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const TAU = Math.PI * 2;
  const PI = Math.PI;

  const K_MIN = 0.6; // perspective: the far side of a figure is drawn at least this big, the near side at most K_MAX
  const K_MAX = 1.6;
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
  const LN = Math.hypot(0.45, 0.8, 0.4);
  const LX = -0.45 / LN;
  const LY = 0.8 / LN;
  const SLX = LX / Math.hypot(LX, LY); // its direction on screen (y down)
  const SLY = -LY / Math.hypot(LX, LY);

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
  let JAW = 0.4; // how far the jaw hangs open, 0..1.3
  let LYING = 0; // how far over the body has gone, 0..1
  let POOL = 0; // blood pool radius, tiles (0: none)
  let POOLX = 0;
  let POOLZ = 0;

  /* ---------- Per-draw state ---------- */
  let G = null;
  let CW = 0;
  let CH = 0;
  let W2 = 0;
  let PXS = 1;
  let DIST = 3;
  let EYE = 0.5;
  let CYAW = 1;
  let SYAW = 0;
  let TCX = 0; // toward the camera, model space: (-sin yaw, 0, cos yaw)
  let TCZ = 1;
  let FIT = 1;
  let FOGK = 1;
  let FLASH = 0;
  let LOD = 0;
  let GORE = true;
  let SEED = 1;
  let T = null; // the type
  let V = null; // its look (the variant this seed picked)
  let OUT = 1; // ink outline, px
  let FACE = false;
  let INKS = "rgb(13,14,16)";
  const RESULT = { face: false, parts: 0 };

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
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
  const CC_N = 8192;
  const ccKey = new Float64Array(CC_N).fill(-1);
  const ccStr = new Array(CC_N).fill("");
  function cstr(r, g, b, a) {
    const key = ((r * 256 + g) * 256 + b) * 128 + a;
    let i = Math.imul(key | 0, 0x9e3779b1) >>> 19;
    if (ccKey[i] === key) return ccStr[i];
    const j = (i + 1) & (CC_N - 1);
    if (ccKey[j] === key) return ccStr[j];
    if (ccKey[i] !== -1) i = j;
    const s = a >= 100 ? "rgb(" + r + "," + g + "," + b + ")" : "rgba(" + r + "," + g + "," + b + "," + a / 100 + ")";
    ccKey[i] = key;
    ccStr[i] = s;
    return s;
  }
  const ch = (v) => (v <= 0 ? 0 : v >= 255 ? 255 : Math.round(v));
  /** Colour c (rgb array) times light m, alpha a, with the hit flash and the fog baked in. */
  function col(c, m, a) {
    const f = FLASH;
    const k = FOGK;
    return cstr(ch(((1 - f) * c[0] * m + f * 255) * k), ch(((1 - f) * c[1] * m + f * 255) * k), ch(((1 - f) * c[2] * m + f * 255) * k), Math.round(clamp01(a) * 100));
  }
  /** The same without the fog: the eyes glow in the dark. */
  function glow(c, a) {
    const f = FLASH;
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
    let d = Math.hypot(dx, dy, dz);
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
    let vl = Math.hypot(vx, vy, vz);
    if (vl < 1e-6) {
      vx = uy;
      vy = -ux;
      vz = 0;
      vl = Math.hypot(vx, vy) || 1;
    }
    setJ(m, ax + la * (ca * ux + sa * (vx / vl)), ay + la * (ca * uy + sa * (vy / vl)), az + la * (ca * uz + sa * (vz / vl)));
  }

  /* ---------- The pose: st -> joints ---------- */
  let FZ = 0;
  let FY = 0;
  let FP = 0;
  /** A foot's path through one step (q 0..1): planted for the first `duty` of it, then a lifted swing. */
  function footPath(q, S, lift, duty, drag) {
    if (q < duty) {
      FZ = S * (0.5 - q / duty);
      FY = 0;
      FP = 0;
    } else {
      const t = (q - duty) / (1 - duty);
      const e = 0.5 - 0.5 * Math.cos(PI * t);
      const sn = Math.sin(PI * t);
      FZ = S * (e - 0.5) * (1 - 0.3 * drag);
      FY = lift * sn * (1 - 0.85 * drag);
      FP = (t < 0.5 ? -0.55 : 0.3) * sn * (1 - drag) - drag * 0.5 * sn;
    }
  }
  // arm targets from the shoulder, in the torso frame (r outward, u up, f forward, tiles) and the hand's set
  let AR = 0;
  let AU = 0;
  let AF = 0;
  let APALM = 0; // 0 palm forward (a claw), 1 palm in (hanging), 2 palm down
  let ACURL = 0.5;
  let ASPREAD = 0.8;
  let AWRIST = 0;
  function armSet(r, u, f, palm, curl, spread, wrist) {
    AR = r;
    AU = u;
    AF = f;
    APALM = palm;
    ACURL = curl;
    ASPREAD = spread;
    AWRIST = wrist;
  }
  function armBlend(w, r, u, f, palm, curl, spread, wrist) {
    if (w <= 0) return;
    const k = clamp01(w);
    AR += (r - AR) * k;
    AU += (u - AU) * k;
    AF += (f - AF) * k;
    if (k > 0.5) APALM = palm;
    ACURL += (curl - ACURL) * k;
    ASPREAD += (spread - ASPREAD) * k;
    AWRIST += (wrist - AWRIST) * k;
  }
  /** The arm swing of the type's gait (g.arms) for side s (-1 left, 1 right) at phase angle A, walk blend m. */
  function armGait(g, s, A, m, L, ph) {
    const opp = s < 0 ? 0 : PI; // the left arm swings with the right leg
    const sw = Math.sin(A + opp) * m * (g.armSwing == null ? 1 : g.armSwing);
    switch (g.arms) {
      case "pump": {
        // a sprint: big clawing pumps, elbows bent, hands up and out in front on the forward swing
        const a = Math.sin(A + opp);
        const f0 = 0.5 * (1 - m) + (0.2 + 0.5 * a) * m;
        armSet(0.08 * L, -(0.22 * (1 - m) + (0.38 - 0.3 * Math.max(0, a)) * m) * L, f0 * L, 0, 0.55, 0.95, 0.55);
        break;
      }
      case "hang": {
        // heavy arms hanging low and swinging; one reaches out
        if (s === g.reachSide) armSet(0.2 * L, (-0.2 + 0.05 * Math.sin(A)) * L, (0.6 + 0.05 * Math.sin(A * 2)) * L, 0, 0.3, 1.1, 0.4);
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
        // "reach": one arm reaching ahead at shoulder height, the other hanging forward; they take turns a little
        const alt = (0.5 + 0.5 * Math.sin(A)) * m;
        if (s === g.reachSide) armSet(0.3 * L, (-0.16 - 0.12 * alt + 0.04 * Math.sin(A * 2)) * L, (0.84 - 0.08 * alt) * L, 0, 0.28, 1.15, 0.55);
        else armSet(0.12 * L, (-0.68 + 0.18 * alt) * L, (0.3 + 0.15 * sw + 0.18 * alt) * L, 1, 0.62, 0.65, 0.12);
      }
    }
  }

  /** Fill J (and the frames, palms, jaw, pool) for type t in state st. */
  function solve(t, st) {
    const b = t.build;
    const g = t.gait;
    let pose = POSES.indexOf(st.pose);
    if (pose < 0) pose = P_WALK;
    if (pose === P_SCREAM && !g.scream) pose = P_BITE;
    const m = pose === P_CLAW || pose === P_SCREAM ? clamp01(st.move) * 0.25 : clamp01(st.move);
    const pT = clamp01(st.poseT || 0);
    let ph = frac(st.gait || 0);
    if (g.jerk) ph = frac(ph + g.jerk * (0.02 * Math.sin(TAU * 3 * ph + SEED * 0.37) + 0.012 * Math.sin(TAU * 7 * ph + SEED * 0.11)));
    const A = TAU * ph;
    const fall = clamp01(st.fall || 0);
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
    let fd = st.fallDir == null ? PI : st.fallDir;
    let pivot = 0.06;
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
    }
    LYING = clamp01(topple);

    // pose blends
    const lunge = pose === P_BITE ? Math.sin(PI * pT) : 0;
    const scream = pose === P_SCREAM ? smooth(pT / 0.18) * (1 - smooth((pT - 0.82) / 0.18)) : 0;
    const clawing = pose === P_CLAW ? 1 : 0;
    const idle = pose === P_IDLE ? 1 : 0;
    const breath = idle ? Math.sin(TAU * pT) : 0;

    // legs: where each foot is
    const S = g.stride * g.duty * m;
    const q1 = frac(ph + 0.5 + (g.limp || 0));
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      const drag = s === g.dragSide ? g.drag || 0 : 0;
      footPath(i ? q1 : ph, S * (drag ? 0.8 : 1), g.lift * m, g.duty, drag);
      if (clawing || scream) {
        FZ = (i ? -0.04 : 0.06) * b.thigh;
        FY = 0;
        FP = 0;
      }
      let ax = s * b.footW;
      let ay = b.ankle + FY;
      let az = FZ;
      if (kneel) {
        az = az * (1 - kneel) - b.shin * 0.92 * kneel;
        ay = ay * (1 - kneel) + 0.04 * kneel;
        FP = FP * (1 - kneel) - 1.2 * kneel;
      }
      setJ(AN[i], ax, ay, az);
      const to = s * (g.toeOut || 0.1);
      const fl = b.foot;
      const cp = Math.cos(FP);
      setJ(TO[i], ax + Math.sin(to) * fl * cp, ay - b.ankle * 0.55 + Math.sin(FP) * fl, az + Math.cos(to) * fl * cp);
    }

    // pelvis
    const bob = g.bob * m * (0.5 + 0.5 * Math.cos(2 * A));
    const dip = (g.drag || 0) * 0.03 * m * Math.max(0, Math.sin(A + (g.dragSide > 0 ? PI : 0)));
    let py = hipH * (1 - g.crouch) - bob - dip - buckle * hipH * 0.55;
    if (idle) py -= 0.006 * (1 + breath);
    if (kneel) py = py * (1 - kneel) + (b.thigh * 0.96 + 0.05) * kneel;
    const px = g.sway * Math.sin(A) * (0.35 + 0.65 * m);
    const pz = 0.07 * lunge * b.thigh * 2 - 0.03 * scream;
    setJ(PEL, px, py, pz);
    frameSet(PF, null);
    rot(PF, 2, 0, -0.6 * g.twist * Math.sin(A) * m);
    rot(PF, 1, 0, -0.5 * g.roll * Math.sin(A) * m);

    // torso
    frameSet(TF, null);
    let twist = g.twist * Math.sin(A) * m;
    if (clawing) twist += 0.18 * Math.sin(TAU * (st.claw || 0));
    rot(TF, 2, 0, twist);
    let lean = g.lean * (0.55 + 0.45 * m) + 0.35 * lunge + clawing * (0.12 + 0.06 * Math.sin(TAU * 2 * (st.claw || 0))) - 0.38 * scream;
    lean += idle * (0.07 + 0.025 * breath) - hit * 0.14 + g.lean * 0.15 * Math.cos(2 * A) * m;
    const fold = t.fall === "fold";
    lean += fold ? slump : slump * Math.cos(fd); // a fold always jackknifes forward over its knees
    rot(TF, 1, 2, lean);
    rot(TF, 1, 0, g.tilt + g.roll * Math.sin(A) * m + (fold ? 0 : slump * Math.sin(fd) * 0.6));
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
    JAW = g.jaw + 0.09 * Math.sin(2 * A + 1) * m + 0.55 * lunge + 0.5 * scream + idle * -0.1 + hit * 0.2 + limp * 0.3;
    if (JAW < 0.05) JAW = 0.05;

    // arms
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      if (idle) armSet(0.08 * L, -0.85 * L, (0.14 + 0.02 * breath) * L, 1, 0.5, 0.5, 0.05);
      else armGait(g, s, A, m, L, ph);
      if (pose === P_BITE) armBlend(0.3 + 1.4 * lunge, -0.1 * L, 0.04 * L, 0.86 * L, 0, 0.5, 1, 0.55);
      if (clawing) {
        const q = frac((st.claw || 0) + (i ? 0.5 : 0));
        const k = q < 0.4 ? smooth(q / 0.4) : 1 - smooth((q - 0.4) / 0.6);
        armSet((0.24 - 0.3 * k) * L, (0.34 - 0.62 * k) * L, (0.38 + 0.24 * k) * L, 0, 0.55, 1, 0.4 * (1 - k));
      }
      armBlend(scream, 0.7 * L, 0.26 * L, 0.16 * L, 0, 0.3, 1.25, 0.75);
      armBlend(limp, 0.16 * L, -0.95 * L, 0.02 * L, 1, 0.3, 0.4, 0);
      // a dropped shoulder's arm hangs lower
      for (let k = 0; k < 3; k++) J[HA[i] * 3 + k] = J[SH[i] * 3 + k] + TF[k] * s * AR + TF[3 + k] * AU + TF[6 + k] * AF;
      // elbows bend back, down and out; raised arms bend out
      const up = clamp01(AU / L + 0.3);
      const fw = clamp01(AF / L);
      const eo = 0.55 + 0.3 * up;
      const eb = (0.55 - 0.25 * up) * (1 - fw);
      const ed = 0.45 + 0.4 * fw;
      const ex = TF[0] * s * eo - TF[6] * eb - TF[3] * ed;
      const ey = TF[1] * s * eo - TF[7] * eb - TF[4] * ed;
      const ez = TF[2] * s * eo - TF[8] * eb - TF[5] * ed;
      ik(SH[i], EL[i], HA[i], b.upper, b.fore, ex, ey, ez);
      // the palm faces forward (a claw), in toward the leg, or down
      const o = i * 3;
      if (APALM === 0) {
        PALM[o] = TF[6] - TF[3] * 0.25;
        PALM[o + 1] = TF[7] - TF[4] * 0.25;
        PALM[o + 2] = TF[8] - TF[5] * 0.25;
      } else if (APALM === 1) {
        PALM[o] = -TF[0] * s - TF[6] * 0.3;
        PALM[o + 1] = -TF[1] * s - TF[7] * 0.3;
        PALM[o + 2] = -TF[2] * s - TF[8] * 0.3;
      } else {
        PALM[o] = -TF[3];
        PALM[o + 1] = -TF[4];
        PALM[o + 2] = -TF[5];
      }
      CURL[i] = ACURL;
      SPREAD[i] = ASPREAD;
      WRIST[i] = AWRIST;
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
    POOL = 0;
    if (fall > 0) {
      if (spin) spinAll(spin * (SEED & 1 ? 1 : -1));
      if (topple > 0) {
        const dx = Math.sin(fd);
        const dz = Math.cos(fd);
        toppleAll(dx, dz, dx * pivot, dz * pivot, topple * PI * 0.5);
      }
      // limp arms drop toward the ground as the body goes over (gravity, not the torso's down), elbows up
      const drop = limp * LYING;
      if (drop > 0.01) {
        for (let i = 0; i < 2; i++) {
          const s = i ? 1 : -1;
          const o = SH[i] * 3;
          const h = HA[i] * 3;
          const tx = J[o] + TF[0] * s * 0.35 * L + Math.sin(fd) * 0.15 * L;
          const ty = Math.max(b.hand * 0.6, J[o + 1] - 0.9 * L);
          const tz = J[o + 2] + TF[2] * s * 0.35 * L + Math.cos(fd) * 0.15 * L;
          J[h] += (tx - J[h]) * drop;
          J[h + 1] += (ty - J[h + 1]) * drop;
          J[h + 2] += (tz - J[h + 2]) * drop;
          ik(SH[i], EL[i], HA[i], b.upper, b.fore, TF[0] * s, 1, TF[2] * s);
        }
      }
      // rest on the ground: nothing below it
      let low = Infinity;
      for (let j = 0; j < NJ; j++) low = Math.min(low, J[j * 3 + 1] - JR[j] * (j === PEL || j === CHE ? 1.25 : 1));
      if (low < 0) for (let j = 0; j < NJ; j++) J[j * 3 + 1] -= low;
      if (GORE) {
        POOL = b.pool * smooth((fall - 0.15) / 0.85);
        POOLX = (J[PEL * 3] + J[CHE * 3]) / 2;
        POOLZ = (J[PEL * 3 + 2] + J[CHE * 3 + 2]) / 2;
      }
    }
  }
  /** Turn every joint, frame and palm about the vertical through the feet. */
  let RC = 1;
  let RS = 0;
  function turnY(A, o) {
    const x = A[o];
    const z = A[o + 2];
    A[o] = x * RC + z * RS;
    A[o + 2] = z * RC - x * RS;
  }
  function spinAll(a) {
    RC = Math.cos(a);
    RS = Math.sin(a);
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
  let RKX = 0;
  let RKZ = 0;
  function turnK(A, o, ox, oz) {
    const x = A[o] - ox;
    const y = A[o + 1];
    const z = A[o + 2] - oz;
    const kv = RKX * x + RKZ * z;
    A[o] = ox + x * RC - RKZ * y * RS + RKX * kv * (1 - RC);
    A[o + 1] = y * RC + (RKZ * x - RKX * z) * RS;
    A[o + 2] = oz + z * RC + RKX * y * RS + RKZ * kv * (1 - RC);
  }
  function toppleAll(dx, dz, cx, cz, a) {
    RKX = dz;
    RKZ = -dx;
    RC = Math.cos(a);
    RS = Math.sin(a);
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
  let QX = 0;
  let QY = 0;
  let QK = 1;
  /** Model point -> screen (QX, QY) and scale QK (px per tile = PXS * QK). rb: how far the part reaches below the point,
      so nothing is drawn under the floor line. */
  function proj(x, y, z, rb) {
    const X = -(x * CYAW + z * SYAW);
    const D = x * SYAW - z * CYAW;
    const den = DIST + D;
    let k = den > DIST / K_MAX ? DIST / den : K_MAX;
    if (k < K_MIN) k = K_MIN;
    QX = W2 + X * PXS * k * FIT;
    QY = CH - (EYE - (EYE - y) * k) * PXS * FIT;
    // nothing under the floor line: a part nearer than the feet sits on it
    const low = CH - rb * PXS * k * FIT;
    if (QY > low) QY = low;
    QK = k * FIT;
  }
  const projJ = (j) => proj(J[j * 3], J[j * 3 + 1], J[j * 3 + 2], JR[j]);
  const depth = (x, z) => x * SYAW - z * CYAW;
  const jDepth = (j) => depth(J[j * 3], J[j * 3 + 2]);
  const md3 = (a, b, c) => (jDepth(a) + jDepth(b) + jDepth(c)) / 3;
  /** Shrink the figure about its feet (FIT < 1) when a pose or a near camera would take it out of the region. */
  function fit() {
    FIT = 1;
    let hx = 0;
    let top = CH;
    const pad = 1 + OUT;
    for (let j = 0; j < NJ; j++) {
      projJ(j);
      const r = JR[j] * PXS * QK + pad;
      hx = Math.max(hx, Math.abs(QX - W2) + r);
      top = Math.min(top, QY - r);
    }
    let f = 1;
    if (hx > W2) f = W2 / hx;
    if (top < 0) f = Math.min(f, CH / (CH - top));
    FIT = f;
    for (let j = 0; j < NJ; j++) {
      projJ(j);
      S[j * 3] = QX;
      S[j * 3 + 1] = QY;
      S[j * 3 + 2] = QK;
    }
  }

  /* ---------- Ellipses: an ellipsoid or a flat ellipse in the model, as its outline on screen ---------- */
  let EX = 0;
  let EY = 0;
  let ERA = 1;
  let ERB = 1;
  let ERO = 0;
  /** Centre c and up to three half-axis vectors a, b, g (model tiles; pass zeros for a flat one). */
  function ellipsoid(cx, cy, cz, ax, ay, az, bx, by, bz, gx, gy, gz, rb) {
    proj(cx, cy, cz, rb);
    EX = QX;
    EY = QY;
    const K = PXS * QK;
    const a1 = -(ax * CYAW + az * SYAW) * K;
    const a2 = -ay * K;
    const b1 = -(bx * CYAW + bz * SYAW) * K;
    const b2 = -by * K;
    const g1 = -(gx * CYAW + gz * SYAW) * K;
    const g2 = -gy * K;
    const p = a1 * a1 + b1 * b1 + g1 * g1;
    const q = a1 * a2 + b1 * b2 + g1 * g2;
    const r = a2 * a2 + b2 * b2 + g2 * g2;
    const mm = (p + r) / 2;
    const d = Math.sqrt(((p - r) / 2) * ((p - r) / 2) + q * q);
    ERA = Math.sqrt(Math.max(0.01, mm + d));
    ERB = Math.sqrt(Math.max(0.01, mm - d));
    ERO = 0.5 * Math.atan2(2 * q, p - r);
    // keep it above the floor line
    const sn = Math.sin(ERO);
    const cs = Math.cos(ERO);
    const ext = Math.sqrt(ERA * ERA * sn * sn + ERB * ERB * cs * cs);
    if (EY + ext > CH) EY = CH - ext;
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
    ellA(EX, EY, ERA + grow, ERB + grow, ERO, 0, TAU);
  }
  /** Add the current ellipse as its own sub-path (no line from the last point). */
  function ellSub(grow) {
    ellIn(EX, EY, ERA + grow, ERB + grow, ERO);
    G.moveTo(ECX + (ERA + grow) * Math.cos(ERO), ECY + (ERA + grow) * Math.sin(ERO));
    G.ellipse(ECX, ECY, ERA + grow, ERB + grow, ERO, 0, TAU);
  }
  /** Fill the current ellipse and ink its edge. */
  function ellInk(fill) {
    ellPath(0);
    G.fillStyle = fill;
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = Math.min(OUT * 2, Math.max(0.8, ERB * 0.4));
    G.stroke();
  }
  /** A model direction n (unit-ish) faces the camera by this much (-1..1). */
  const facing = (nx, nz) => nx * TCX + nz * TCZ;

  /* ---------- Path calls, kept inside the region (the fit sizes the figure; these only catch the odd tatter or
     tooth of a body lying near the floor line) ---------- */
  const clx = (x) => (x < 0 ? 0 : x > CW ? CW : x);
  const cly = (y) => (y < 0 ? 0 : y > CH ? CH : y);
  function mt(x, y) {
    G.moveTo(clx(x), cly(y));
  }
  function lt(x, y) {
    G.lineTo(clx(x), cly(y));
  }
  function qt(x1, y1, x, y) {
    G.quadraticCurveTo(clx(x1), cly(y1), clx(x), cly(y));
  }
  let ECX = 0;
  let ECY = 0;
  /** Centre (x, y) of an ellipse moved just enough to keep it inside the region. */
  function ellIn(x, y, a, b, r) {
    const c = Math.cos(r);
    const s = Math.sin(r);
    const ex = Math.sqrt(a * a * c * c + b * b * s * s);
    const ey = Math.sqrt(a * a * s * s + b * b * c * c);
    ECX = ex * 2 >= CW ? W2 : x < ex ? ex : x > CW - ex ? CW - ex : x;
    ECY = ey * 2 >= CH ? CH / 2 : y < ey ? ey : y > CH - ey ? CH - ey : y;
  }
  /** A whole ellipse as its own sub-path (no line from the last point). */
  function elSub(x, y, a, b, r) {
    ellIn(x, y, a, b, r);
    G.moveTo(ECX + a * Math.cos(r), ECY + a * Math.sin(r));
    G.ellipse(ECX, ECY, a, b, r, 0, TAU);
  }
  function ellA(x, y, a, b, r, a0, a1, ccw) {
    ellIn(x, y, a, b, r);
    G.ellipse(ECX, ECY, a, b, r, a0, a1, ccw);
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
  let NX = 0;
  let NY = 0;
  function shadeSide(x0, y0, x1, y1) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    const l = Math.hypot(dx, dy) || 1;
    NX = -dy / l;
    NY = dx / l;
    if (NX * SLX + NY * SLY > 0) {
      NX = -NX;
      NY = -NY;
    }
  }

  /* ---------- Ground: the shadow and, when gore is on, the pool under a fallen walker ---------- */
  function drawGround() {
    // soft contact shadow under the feet (or the body)
    const cx = (J[AN[0] * 3] + J[AN[1] * 3]) / 2 * (1 - LYING) + ((J[PEL * 3] + J[CHE * 3]) / 2) * LYING;
    const cz = (J[AN[0] * 3 + 2] + J[AN[1] * 3 + 2]) / 2 * (1 - LYING) + ((J[PEL * 3 + 2] + J[CHE * 3 + 2]) / 2) * LYING;
    const r = T.build.shadow * (1 + LYING * 0.9);
    ellipsoid(cx, 0, cz, r, 0, 0, 0, 0, r * 0.75, 0, 0, 0, 0);
    shrinkToRegion();
    G.beginPath();
    ellA(EX, Math.min(EY, CH - ERB), ERA, ERB, ERO, 0, TAU);
    G.fillStyle = "rgba(0,0,0,0.32)";
    G.fill();
    if (POOL > 0.005) {
      ellipsoid(POOLX, 0, POOLZ, POOL * 1.15, 0, 0, 0, 0, POOL * 0.8, 0, 0, 0, 0);
      shrinkToRegion();
      G.beginPath();
      ellA(EX, Math.min(EY, CH - ERB), ERA, ERB, ERO, 0, TAU);
      G.fillStyle = col(V.blood, 0.8, 0.95);
      G.fill();
      if (LOD < 2) {
        G.beginPath();
        ellA(EX - ERA * 0.12, Math.min(EY, CH - ERB) - ERB * 0.12, ERA * 0.62, ERB * 0.45, ERO, 0, TAU);
        G.fillStyle = col(V.blood, 1.25, 0.7);
        G.fill();
      }
    }
  }
  /** Keep the last ellipse inside the region (the ground ones may be wider than a narrow region). */
  function shrinkToRegion() {
    const m = OUT + 1;
    const ext = Math.max(ERA, ERB);
    const room = Math.min(EX - m, CW - m - EX);
    if (ext > room && room > 0.5) {
      const k = room / ext;
      ERA *= k;
      ERB *= k;
    }
    if (ERB > CH / 2) ERB = CH / 2;
  }

  /* ---------- Legs ---------- */
  function drawLeg(i) {
    const b = T.build;
    const hi = HI[i];
    const kn = KN[i];
    const an = AN[i];
    const to = TO[i];
    const k = S[an * 3 + 2];
    const wl = (b.rThigh + b.rShin) * PXS * S[kn * 3 + 2];
    const wb = b.rFoot * 2 * PXS * k;
    // boot: heel to toe, and the shaft up the shin
    const ax = J[an * 3];
    const ay = J[an * 3 + 1];
    const az = J[an * 3 + 2];
    const tx = J[to * 3];
    const ty = J[to * 3 + 1];
    const tz = J[to * 3 + 2];
    proj(ax - (tx - ax) * 0.22, ay - b.ankle * 0.45, az - (tz - az) * 0.22, b.rFoot);
    const hx = QX;
    const hy = QY;
    proj(tx, ty, tz, b.rFoot);
    const ex = QX;
    const ey = QY;
    // the shin's end, where the trousers stop
    const kx = J[kn * 3];
    const ky = J[kn * 3 + 1];
    const kz = J[kn * 3 + 2];
    proj(ax + (kx - ax) * 0.22, ay + (ky - ay) * 0.22, az + (kz - az) * 0.22, 0);
    const bx = QX;
    const by = QY;
    const pants = V.legs || V.pants;
    // trouser leg: ink, then cloth (one path)
    G.beginPath();
    mt(S[hi * 3], S[hi * 3 + 1]);
    lt(S[kn * 3], S[kn * 3 + 1]);
    lt(bx, by);
    G.strokeStyle = INKS;
    G.lineWidth = wl + OUT * 2;
    G.stroke();
    G.strokeStyle = col(pants, 1, 1);
    G.lineWidth = wl;
    G.stroke();
    if (LOD === 2) {
      G.beginPath();
      mt(hx, hy);
      lt(ex, ey);
      G.strokeStyle = INKS;
      G.lineWidth = wb + OUT * 2;
      G.stroke();
      G.strokeStyle = col(V.shoe, 1, 1);
      G.lineWidth = wb;
      G.stroke();
      return;
    }
    if (LOD === 0) {
      // shade down the side away from the light
      shadeSide(S[hi * 3], S[hi * 3 + 1], bx, by);
      const o = wl * 0.27;
      G.beginPath();
      mt(S[hi * 3] + NX * o, S[hi * 3 + 1] + NY * o);
      lt(S[kn * 3] + NX * o, S[kn * 3 + 1] + NY * o);
      lt(bx + NX * o, by + NY * o);
      G.strokeStyle = col(BLACK, 1, 0.22);
      G.lineWidth = wl * 0.42;
      G.stroke();
    }
    // a rip at the knee: bare, grey-green skin through torn cloth with threads across it
    if (V.kneeRip && V.kneeRip[i]) {
      const f = facing(KF[i * 3], KF[i * 3 + 2]) / (Math.hypot(KF[i * 3], KF[i * 3 + 1], KF[i * 3 + 2]) || 1);
      if (f > 0.15) {
        const r0 = b.rShin * 0.95;
        proj(kx + KF[i * 3] * r0 * 0.6, ky - b.shin * 0.1, kz + KF[i * 3 + 2] * r0 * 0.6, 0);
        tear(QX, QY, S[kn * 3], S[kn * 3 + 1], bx, by, wl * 0.4 * (0.55 + 0.45 * f), wl * 1.05, V.skin, i * 7 + 3);
      }
    }
    // knee pad (riot gear)
    if (V.pads) {
      const f = facing(KF[i * 3], KF[i * 3 + 2]);
      const r0 = b.rShin;
      ellipsoid(kx + KF[i * 3] * r0 * 0.7, ky + 0.008, kz + KF[i * 3 + 2] * r0 * 0.7, r0 * 0.95, 0, 0, 0, r0 * 1.15, 0, 0, 0, r0 * 0.7, 0);
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
      const l = Math.hypot(dx, dy) || 1;
      dx /= l;
      dy /= l;
      G.beginPath();
      for (let n = 0; n < 3; n++) {
        const u = (n / 2 - 0.5) * wl * 0.8;
        const d = wl * (0.18 + 0.22 * rnd(500 + i * 4 + n));
        mt(bx + NX * u - dx * wl * 0.1, by + NY * u - dy * wl * 0.1);
        lt(bx + NX * (u + wl * 0.12) + dx * d, by + NY * (u + wl * 0.12) + dy * d);
        lt(bx + NX * (u + wl * 0.24) - dx * wl * 0.1, by + NY * (u + wl * 0.24) - dy * wl * 0.1);
      }
      G.fillStyle = col(pants, 0.85, 1);
      G.fill();
      G.strokeStyle = INKS;
      G.lineWidth = Math.max(0.6, OUT * 0.6);
      G.stroke();
    }
    // boot: ink, then leather (shaft and foot in one path), then the sole and a shine
    G.beginPath();
    mt(bx, by);
    lt(S[an * 3], S[an * 3 + 1]);
    mt(hx, hy);
    lt(ex, ey);
    G.strokeStyle = INKS;
    G.lineWidth = wb + OUT * 2;
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
  /** A jagged tear at (x, y) across a limb running from (x0,y0) to (x1,y1): skin through it, threads across. */
  function tear(x, y, x0, y0, x1, y1, rw, rl, skin, salt) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    G.beginPath();
    const n = 10;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU;
      const j = k & 1 ? 0.5 + 0.3 * rnd(salt + k) : 1;
      const u = Math.cos(a) * rw * j;
      const v = Math.sin(a) * rl * 0.5 * j;
      const px = x - dy * u + dx * v;
      const py = y + dx * u + dy * v;
      if (k) lt(px, py);
      else mt(px, py);
    }
    G.closePath();
    G.fillStyle = col(skin, 0.86, 1);
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = Math.max(0.7, OUT * 0.8);
    G.stroke();
    if (LOD === 0) {
      // white threads left across the hole
      G.beginPath();
      for (let t = 0; t < 2; t++) {
        const v = (t - 0.5) * rl * 0.24 + rl * 0.04;
        const u = rw * (0.75 - 0.1 * t);
        mt(x + dy * u + dx * v, y - dx * u + dy * v);
        lt(x - dy * u + dx * (v + rl * 0.05), y + dx * u + dy * (v + rl * 0.05));
      }
      G.strokeStyle = col(V.thread, 1, 0.9);
      G.lineWidth = Math.max(0.6, OUT * 0.55);
      G.stroke();
    }
  }
  /** A soft shine on the upper left of the current ellipse. */
  function shine(a) {
    G.beginPath();
    ellA(EX - ERA * 0.3 * Math.cos(ERO) + ERB * 0.3 * Math.sin(ERO), EY - ERB * 0.34, ERA * 0.34, ERB * 0.22, ERO, 0, TAU);
    G.fillStyle = col(WHITE, 1, a);
    G.fill();
  }
  /** A shadow crescent inside the current ellipse, on the side away from the light. */
  function crescent(a, depth) {
    const sa = Math.atan2(-SLY, -SLX) - ERO;
    const dx = -Math.cos(sa + ERO) * ERA * depth;
    const dy = -Math.sin(sa + ERO) * ERB * depth;
    G.beginPath();
    ellA(EX, EY, ERA, ERB, ERO, sa - 1.5, sa + 1.5, false);
    ellA(EX + dx, EY + dy, ERA * 0.94, ERB * 0.96, ERO, sa + 1.5, sa - 1.5, true);
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
    const wu = b.rUpper * 2 * PXS * k;
    const wf = b.rFore * 2 * PXS * k;
    const sleeve = V.sleeve;
    const skin = V.skin;
    const armCol = sleeve === "long" ? V.sleeveCol || V.shirt : skin;
    // the hand behind the arm when the arm points away: draw it first
    const handFar = depth(J[ha * 3], J[ha * 3 + 2]) > depth(J[el * 3], J[el * 3 + 2]);
    if (handFar) drawHand(i);
    if (LOD === 2) {
      // one stroke for the whole arm
      const ww = ((wu + wf) / 2) * (b.muscle ? 1.7 : 1);
      G.beginPath();
      mt(S[sh * 3], S[sh * 3 + 1]);
      lt(S[el * 3], S[el * 3 + 1]);
      lt(S[ha * 3], S[ha * 3 + 1]);
      G.strokeStyle = INKS;
      G.lineWidth = ww + OUT * 2;
      G.stroke();
      G.strokeStyle = col(armCol, 1, 1);
      G.lineWidth = ww;
      G.stroke();
      if (!handFar) drawHand(i);
      return;
    }
    if (b.muscle) {
      // big bare arms: a shoulder cap, a bulging upper arm and forearm (ink first, then skin), each shaded
      for (let pass = 0; pass < 2; pass++) {
        const grow = pass ? 0 : OUT;
        G.fillStyle = pass ? col(skin, 1, 1) : INKS;
        G.beginPath();
        muscle(sh, el, 0.08, b.rUpper * 1.25, b.rUpper * 1.22);
        ellSub(grow);
        muscle(sh, el, 0.52, b.upper * 0.6, b.rUpper * 1.02);
        ellSub(grow);
        muscle(el, ha, 0.36, b.fore * 0.64, b.rFore * 1.12);
        ellSub(grow);
        G.fill();
      }
      // shade each bulge on its dark side, and (lod 0) a shine on its lit side
      muscle(el, ha, 0.36, b.fore * 0.64, b.rFore * 1.12);
      crescent(0.24, 0.3);
      if (LOD === 0) {
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
        ellA(EX, EY, ERA, ERB, ERO, 0.3, 2.2, false);
        G.strokeStyle = col(INK, 1, 0.55);
        G.lineWidth = Math.max(0.7, OUT * 0.7);
        G.stroke();
      }
    } else if (LOD === 1) {
      G.beginPath();
      mt(S[sh * 3], S[sh * 3 + 1]);
      lt(S[el * 3], S[el * 3 + 1]);
      lt(S[ha * 3], S[ha * 3 + 1]);
      G.strokeStyle = INKS;
      G.lineWidth = (wu + wf) / 2 + OUT * 2;
      G.stroke();
      G.strokeStyle = col(armCol, 1, 1);
      G.lineWidth = (wu + wf) / 2;
      G.stroke();
    } else {
      G.strokeStyle = INKS;
      G.lineWidth = wu + OUT * 2;
      segJ(sh, el);
      G.lineWidth = wf + OUT * 2;
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
        mt(S[sh * 3] + NX * wu * 0.28, S[sh * 3 + 1] + NY * wu * 0.28);
        lt(S[el * 3] + NX * wf * 0.28, S[el * 3 + 1] + NY * wf * 0.28);
        lt(S[ha * 3] + NX * wf * 0.28, S[ha * 3 + 1] + NY * wf * 0.28);
        G.stroke();
      }
    }
    // sleeves: a short ragged one, or a cuff at the wrist of a long one
    if (sleeve === "short") {
      const x0 = S[sh * 3];
      const y0 = S[sh * 3 + 1];
      let ux = S[el * 3] - x0;
      let uy = S[el * 3 + 1] - y0;
      const ul = Math.hypot(ux, uy) || 1;
      const x1 = x0 + ux * 0.48;
      const y1 = y0 + uy * 0.48;
      ux /= ul;
      uy /= ul;
      const ww = wu * 1.38;
      // butt ends: the sleeve is cut off, then torn
      G.lineCap = "butt";
      G.strokeStyle = INKS;
      G.lineWidth = ww + OUT * 2;
      seg(x0, y0, x1 + ux * OUT, y1 + uy * OUT);
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
        G.lineWidth = Math.max(0.6, OUT * 0.7);
        G.stroke();
      }
    } else if (sleeve === "long") {
      const x0 = S[el * 3] + (S[ha * 3] - S[el * 3]) * 0.72;
      const y0 = S[el * 3 + 1] + (S[ha * 3 + 1] - S[el * 3 + 1]) * 0.72;
      G.strokeStyle = INKS;
      G.lineWidth = wf * 1.3 + OUT * 2;
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
        seg(mx - NX * wf * 0.62, my - NY * wf * 0.62, mx + NX * wf * 0.62, my + NY * wf * 0.62);
      }
    }
    if (V.pads) {
      // shoulder pad
      const o = sh * 3;
      const s = i ? 1 : -1;
      const r = b.rUpper;
      ellipsoid(J[o] + TF[0] * s * r * 0.4 + TF[3] * r * 0.5, J[o + 1] + TF[1] * s * r * 0.4 + TF[4] * r * 0.5, J[o + 2] + TF[2] * s * r * 0.4 + TF[5] * r * 0.5, TF[0] * r * 1.6, TF[1] * r * 1.6, TF[2] * r * 1.6, TF[3] * r * 1.1, TF[4] * r * 1.1, TF[5] * r * 1.1, TF[6] * r * 1.5, TF[7] * r * 1.5, TF[8] * r * 1.5, 0);
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
  /** A muscle (an ellipsoid along a bone from joint a to b, centred t of the way, half-length hl, radius r). */
  function muscle(a, b, t, hl, r) {
    const ax = J[a * 3];
    const ay = J[a * 3 + 1];
    const az = J[a * 3 + 2];
    let dx = J[b * 3] - ax;
    let dy = J[b * 3 + 1] - ay;
    let dz = J[b * 3 + 2] - az;
    let l = Math.hypot(dx, dy, dz);
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
    let pl = Math.hypot(px, py, pz);
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
  function drawHand(i) {
    if (LOD === 2) return; // far away the arm's round end is the hand
    const b = T.build;
    const el = EL[i];
    const ha = HA[i];
    const s = i ? 1 : -1;
    const wx = J[ha * 3];
    const wy = J[ha * 3 + 1];
    const wz = J[ha * 3 + 2];
    let dx = wx - J[el * 3];
    let dy = wy - J[el * 3 + 1];
    let dz = wz - J[el * 3 + 2];
    const dl = Math.hypot(dx, dy, dz) || 1;
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
    let nl = Math.hypot(nx, ny, nz);
    if (nl < 1e-3) {
      nx = -dy;
      ny = dx;
      nz = 0;
      nl = Math.hypot(nx, ny) || 1;
    }
    nx /= nl;
    ny /= nl;
    nz /= nl;
    // across the hand: d x n
    const sx = dy * nz - dz * ny;
    const sy = dz * nx - dx * nz;
    const sz = dx * ny - dy * nx;
    // the wrist bends the fingers back (a claw)
    const wb = WRIST[i];
    const cw = Math.cos(wb);
    const sw = Math.sin(wb);
    const fx = dx * cw - nx * sw;
    const fy = dy * cw - ny * sw;
    const fz = dz * cw - nz * sw;
    const hl = b.hand;
    const hw = b.hand * 0.82;
    const pcx = wx + fx * hl * 0.38;
    const pcy = wy + fy * hl * 0.38;
    const pcz = wz + fz * hl * 0.38;
    const k = S[ha * 3 + 2];
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
          // the thumb, on the inner side
          bx = pcx - fx * hl * 0.12 - sx * hw * 0.5 * s;
          by = pcy - fy * hl * 0.12 - sy * hw * 0.5 * s;
          bz = pcz - fz * hl * 0.12 - sz * hw * 0.5 * s;
          ux = fx * 0.55 - sx * 0.7 * s + nx * 0.35;
          uy = fy * 0.55 - sy * 0.7 * s + ny * 0.35;
          uz = fz * 0.55 - sz * 0.7 * s + nz * 0.35;
          l1 *= 0.8;
          l2 *= 0.75;
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
        HP[o] = QX;
        HP[o + 1] = QY;
        proj(m1x, m1y, m1z, 0);
        HP[o + 2] = QX;
        HP[o + 3] = QY;
        proj(m1x + e2x * l2, m1y + e2y * l2, m1z + e2z * l2, 0);
        HP[o + 4] = QX;
        HP[o + 5] = QY;
        proj(m1x + e2x * (l2 + hl * 0.2), m1y + e2y * (l2 + hl * 0.2), m1z + e2z * (l2 + hl * 0.2), 0);
        HP[o + 6] = QX;
        HP[o + 7] = QY;
      }
      ellipsoid(pcx, pcy, pcz, fx * hl * 0.44, fy * hl * 0.44, fz * hl * 0.44, sx * hw * 0.52, sy * hw * 0.52, sz * hw * 0.52, nx * hl * 0.16, ny * hl * 0.16, nz * hl * 0.16, 0);
      ellInk(col(skin, 1, 1));
      const fw = Math.max(0.9, hl * 0.23 * PXS * k);
      G.beginPath();
      for (let n = 0; n < 5; n++) {
        const o = n * 8;
        mt(HP[o], HP[o + 1]);
        lt(HP[o + 2], HP[o + 3]);
        lt(HP[o + 4], HP[o + 5]);
      }
      G.strokeStyle = INKS;
      G.lineWidth = fw + OUT * 1.1;
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
    } else if (LOD === 1) {
      // a mitten with claw tips
      const cx = pcx + fx * hl * 0.22;
      const cy = pcy + fy * hl * 0.22;
      const cz = pcz + fz * hl * 0.22;
      ellipsoid(cx, cy, cz, fx * hl * 0.62, fy * hl * 0.62, fz * hl * 0.62, sx * hw * 0.62, sy * hw * 0.62, sz * hw * 0.62, nx * hl * 0.2, ny * hl * 0.2, nz * hl * 0.2, 0);
      ellInk(col(skin, 1, 1));
      proj(cx + fx * hl * 0.62, cy + fy * hl * 0.62, cz + fz * hl * 0.62, 0);
      const tx = QX;
      const ty = QY;
      G.strokeStyle = col(V.nail, 1, 1);
      G.lineWidth = Math.max(0.8, OUT);
      G.beginPath();
      for (let n = -1; n <= 1; n++) {
        const ox = (tx - EX) * 0.2 * n;
        const oy = (ty - EY) * 0.2 * n;
        mt(tx - oy, ty + ox);
        lt(tx - oy + (tx - EX) * 0.3, ty + ox + (ty - EY) * 0.3);
      }
      G.stroke();
    } else {
      ellipsoid(pcx, pcy, pcz, fx * hl * 0.6, fy * hl * 0.6, fz * hl * 0.6, sx * hw * 0.6, sy * hw * 0.6, sz * hw * 0.6, 0, 0, 0, 0);
      ellInk(col(skin, 1, 1));
    }
  }

  /* ---------- Torso: an elliptic tube from the hem to the shoulders, with its rips, ribs and grime ---------- */
  // ring centres on screen and their half-widths across the tube's axis
  const TR = new Float64Array(16);
  function ringExtent(cx, cy, cz, a, bb, nx, ny) {
    proj(cx, cy, cz, 0);
    const K = PXS * QK;
    const r1 = -(TF[0] * CYAW + TF[2] * SYAW) * K * a;
    const r2 = -TF[1] * K * a;
    const f1 = -(TF[6] * CYAW + TF[8] * SYAW) * K * bb;
    const f2 = -TF[7] * K * bb;
    const pr = nx * r1 + ny * r2;
    const pf = nx * f1 + ny * f2;
    return Math.sqrt(pr * pr + pf * pf);
  }
  /** A point on the torso's surface: angle th around (0 = front, + toward its right), v 0 (waist) .. 1 (chest);
      sets QX/QY and returns how much its surface faces the camera (-1..1). Off pushes it out from the surface. */
  let SFX = 0;
  let SFY = 0;
  let SFZ = 0;
  function torsoPoint(th, v, off) {
    const b = T.build;
    const a = b.waist[0] + (b.chest[0] - b.waist[0]) * Math.pow(clamp01(v), 0.8) + off;
    const bb = b.waist[1] + (b.chest[1] - b.waist[1]) * v + off;
    const u = b.torso * (0.18 + 0.62 * v);
    const sn = Math.sin(th);
    const cs = Math.cos(th);
    const o = PEL * 3;
    SFX = J[o] + TF[3] * u + TF[0] * a * sn + TF[6] * bb * cs;
    SFY = J[o + 1] + TF[4] * u + TF[1] * a * sn + TF[7] * bb * cs;
    SFZ = J[o + 2] + TF[5] * u + TF[2] * a * sn + TF[8] * bb * cs;
    proj(SFX, SFY, SFZ, 0);
    const nx = TF[0] * (sn / a) + TF[6] * (cs / bb);
    const nz = TF[2] * (sn / a) + TF[8] * (cs / bb);
    const ny = TF[1] * (sn / a) + TF[7] * (cs / bb);
    return facing(nx, nz) / (Math.hypot(nx, ny, nz) || 1);
  }
  const TP = new Float64Array(64);
  let TPN = 0;
  function tpSet(i, x, y) {
    TP[i * 2] = x;
    TP[i * 2 + 1] = y < CH - OUT ? y : CH - OUT;
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
    const h0x = QX;
    const h0y = QY;
    proj(J[CHE * 3], J[CHE * 3 + 1], J[CHE * 3 + 2], 0);
    const h3x = QX;
    const h3y = QY;
    const k3 = QK;
    let ax = h3x - h0x;
    let ay = h3y - h0y;
    let al = Math.hypot(ax, ay);
    if (al < 1e-3) {
      ax = 0;
      ay = -1;
      al = 1;
    }
    ax /= al;
    ay /= al;
    const nx = -ay;
    const ny = ax;
    const flare = hem > 0.12 ? 1.25 : 1;
    const e0 = ringExtent(J[o], J[o + 1] - hem, J[o + 2], b.waist[0] * flare, b.waist[1] * flare, nx, ny);
    TR[0] = QX;
    TR[1] = QY;
    const u1 = b.torso * 0.18;
    const e1 = ringExtent(J[o] + TF[3] * u1, J[o + 1] + TF[4] * u1, J[o + 2] + TF[5] * u1, b.waist[0], b.waist[1], nx, ny);
    TR[2] = QX;
    TR[3] = QY;
    const u2 = b.torso * 0.8;
    const e2 = ringExtent(J[o] + TF[3] * u2, J[o + 1] + TF[4] * u2, J[o + 2] + TF[5] * u2, b.chest[0], b.chest[1], nx, ny);
    TR[4] = QX;
    TR[5] = QY;
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
        const r = b.rThigh * PXS * S[KN[i] * 3 + 2] * 1.25;
        eR = Math.max(eR, pos + r);
        eL = Math.max(eL, -pos + r);
      }
    }
    const rise = b.rise * PXS * k3;
    const neck = b.rNeck * PXS * k3 * 1.15;
    const shirt = V.shirt;
    // outline: left side up, over the shoulders, down the right side, then the ragged hem back
    tpSet(0, h0x - nx * eL, h0y - ny * eL);
    tpSet(1, TR[2] - nx * e1, TR[3] - ny * e1);
    tpSet(2, TR[4] - nx * e2, TR[5] - ny * e2);
    tpSet(3, h3x - nx * e3 * 1.02 + ax * rise * 0.35, h3y - ny * e3 * 1.02 + ay * rise * 0.35);
    tpSet(4, h3x - nx * e3 * 0.62 + ax * rise, h3y - ny * e3 * 0.62 + ay * rise);
    tpSet(5, h3x - nx * neck + ax * rise * 1.15, h3y - ny * neck + ay * rise * 1.15);
    tpSet(6, h3x + nx * neck + ax * rise * 1.15, h3y + ny * neck + ay * rise * 1.15);
    tpSet(7, h3x + nx * e3 * 0.62 + ax * rise, h3y + ny * e3 * 0.62 + ay * rise);
    tpSet(8, h3x + nx * e3 * 1.02 + ax * rise * 0.35, h3y + ny * e3 * 1.02 + ay * rise * 0.35);
    tpSet(9, TR[4] + nx * e2, TR[5] + ny * e2);
    tpSet(10, TR[2] + nx * e1, TR[3] + ny * e1);
    tpSet(11, h0x + nx * eR, h0y + ny * eR);
    TPN = LOD === 2 ? 0 : 7;
    const jag = (V.jag || 0.03) * PXS * k3;
    for (let k = 1; k <= TPN; k++) {
      const t = k / (TPN + 1);
      const d = k & 1 ? jag * (0.5 + rnd(80 + k)) : -jag * 0.2;
      const ex = eR + (-eL - eR) * t;
      tpSet(11 + k, h0x + nx * ex - ax * d, h0y + ny * ex - ay * d);
    }
    // ink, then cloth over its inner half (one path; the decals go on top and never cover the outline)
    torsoPath();
    G.strokeStyle = INKS;
    G.lineWidth = OUT * 3;
    G.stroke();
    G.fillStyle = col(shirt, 1, 1);
    G.fill();
    if (LOD === 2) return;
    // shade on the side away from the light
    if (LOD < 2) {
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
        const r = (0.018 + 0.02 * rnd(120 + n)) * PXS * QK;
        elSub(QX, QY, r, r * (0.5 + 0.4 * f), rnd(130 + n) * 3);
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
          if (k) lt(QX, QY);
          else mt(QX, QY);
        }
        for (let k = 4; k >= 0; k--) {
          torsoPoint(PI + 0.32 - (k & 1) * 0.08, k / 4, 0.003);
          lt(QX, QY);
        }
        G.closePath();
        G.fillStyle = col(look.skin, 0.8, 1);
        G.fill();
        G.strokeStyle = INKS;
        G.lineWidth = OUT;
        G.stroke();
      }
    }
    // hoodie: pouch pocket and drawstrings; vest: panel seams; turnout coat: reflective bands
    if (look.top === "hoodie") {
      if (torsoPoint(0, 0.2, 0) > 0.3) {
        G.beginPath();
        torsoPoint(-0.55, 0.02, 0.003);
        mt(QX, QY);
        torsoPoint(-0.4, 0.3, 0.003);
        lt(QX, QY);
        torsoPoint(0.4, 0.3, 0.003);
        lt(QX, QY);
        torsoPoint(0.55, 0.02, 0.003);
        lt(QX, QY);
        G.strokeStyle = col(BLACK, 1, 0.45);
        G.lineWidth = Math.max(0.8, OUT);
        G.stroke();
        if (LOD === 0) {
          G.beginPath();
          for (let s = -1; s <= 1; s += 2) {
            torsoPoint(s * 0.16, 1.05, 0.004);
            mt(QX, QY);
            torsoPoint(s * 0.13, 0.62 + 0.05 * s, 0.004);
            lt(QX, QY);
          }
          G.strokeStyle = col(look.string || [200, 196, 186], 0.8, 1);
          G.lineWidth = Math.max(0.8, OUT * 0.8);
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
          mt(QX, QY);
          torsoPoint(s * 0.45, 1, 0.003);
          lt(QX, QY);
          any = true;
        }
        if (torsoPoint(0, 0.45, 0) > 0.2) {
          torsoPoint(-0.7, 0.42, 0.003);
          mt(QX, QY);
          torsoPoint(0.7, 0.42, 0.003);
          lt(QX, QY);
          any = true;
        }
        if (any) {
          G.strokeStyle = col(BLACK, 1, 0.4);
          G.lineWidth = Math.max(0.8, OUT);
          G.stroke();
        }
      }
    }
    if (look.bands) {
      for (let r = 0; r < 2; r++) band(r ? 0.62 : 0.05, look);
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
          if (k) lt(QX, QY);
          else mt(QX, QY);
        }
        torsoPoint(c, 1.42, 0.003);
        lt(QX, QY);
        G.closePath();
        G.fillStyle = col(look.skin, 0.96, 1);
        G.fill();
        G.strokeStyle = INKS;
        G.lineWidth = OUT * 1.4;
        G.stroke();
      }
    }
    // the rip over the ribs
    if (look.rip) ripDecal(look.rip[0], look.rip[1], look.rip[2], look);
    if (look.rip2) ripDecal(look.rip2[0], look.rip2[1], look.rip2[2], look);
    // smears: blood when gore is on, grime when off: a blotch with a drip running down from it
    if (look.smears) {
      const r0 = 0.02 * PXS * QK;
      G.beginPath();
      let any = false;
      for (let n = 0; n < look.smears; n++) {
        const th = (rnd(150 + n) - 0.5) * 2.6;
        const v = 0.15 + 0.8 * rnd(160 + n);
        const f = torsoPoint(th, v, 0.002);
        if (f < 0.3) continue;
        const r = r0 * (0.7 + 0.8 * rnd(170 + n));
        const x0 = QX;
        const y0 = QY;
        elSub(x0, y0, r, r * (0.45 + 0.35 * f), rnd(175 + n) * 3);
        any = true;
      }
      if (any) {
        G.fillStyle = goreCol(0.85, 0.62);
        G.fill();
        G.beginPath();
        for (let n = 0; n < look.smears; n++) {
          const th = (rnd(150 + n) - 0.5) * 2.6;
          const v = 0.15 + 0.8 * rnd(160 + n);
          if (torsoPoint(th, v, 0.002) < 0.3 || (n & 1)) continue;
          const x0 = QX;
          const y0 = QY;
          torsoPoint(th + 0.04, v - 0.25 - 0.2 * rnd(180 + n), 0.002);
          mt(x0, y0);
          lt(QX, QY);
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
  function band(v, look) {
    let started = false;
    G.beginPath();
    for (let k = 0; k <= 12; k++) {
      const th = -PI + (k / 12) * TAU;
      const f = torsoPoint(th, v, 0.004);
      if (f > 0.05) {
        if (started) lt(QX, QY);
        else mt(QX, QY);
        started = true;
      } else if (started) break;
    }
    if (!started) return;
    G.strokeStyle = col(look.band, 1, 1);
    G.lineWidth = Math.max(1.2, 0.03 * PXS * QK);
    G.stroke();
    if (LOD === 0) {
      G.strokeStyle = col(look.band2, 1, 1);
      G.lineWidth = Math.max(0.7, 0.011 * PXS * QK);
      G.stroke();
    }
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
      if (k) lt(QX, QY);
      else mt(QX, QY);
    }
    G.closePath();
    G.fillStyle = GORE && look.ribs ? col(look.flesh, 1, 1) : col(look.skin, 0.72, 1);
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = Math.max(0.8, OUT * 1.2);
    G.stroke();
    if (LOD === 0 && GORE && look.ribs) {
      // the hole is deep: dark under its top edge
      torsoPoint(th0 + 0.04 * sw, v0 + 0.3 * sv, 0.003);
      G.beginPath();
      ellA(QX, QY, T.build.chest[0] * sw * 0.32 * PXS * QK, T.build.torso * 0.62 * sv * 0.12 * PXS * QK, 0.1, 0, TAU);
      G.fillStyle = col(BLACK, 1, 0.45);
      G.fill();
      // ribs: thin pale curved bars across the hole, lightly inked, ends tucked under the cloth
      G.beginPath();
      for (let r = 0; r < 4; r++) {
        const v = v0 + (0.27 - r * 0.19) * sv;
        torsoPoint(th0 - 0.3 * sw, v - 0.05 * sv, 0.004);
        mt(QX, QY);
        torsoPoint(th0 - 0.02 * sw, v + 0.03 * sv, 0.004);
        lt(QX, QY);
        torsoPoint(th0 + 0.28 * sw, v - 0.03 * sv, 0.004);
        lt(QX, QY);
      }
      const rw = Math.max(0.9, 0.0065 * PXS * QK);
      G.strokeStyle = col(INK, 1, 0.8);
      G.lineWidth = rw + OUT * 0.8;
      G.stroke();
      G.strokeStyle = col(look.bone, 1, 1);
      G.lineWidth = rw;
      G.stroke();
      // fresh blood round the edge
      G.beginPath();
      torsoPoint(th0 + 0.1 * sw, v0 - 0.45 * sv, 0.003);
      mt(QX, QY);
      torsoPoint(th0 + 0.16 * sw, v0 - 0.85 * sv, 0.003);
      lt(QX, QY);
      torsoPoint(th0 - 0.3 * sw, v0 - 0.4 * sv, 0.003);
      mt(QX, QY);
      torsoPoint(th0 - 0.34 * sw, v0 - 0.7 * sv, 0.003);
      lt(QX, QY);
      G.strokeStyle = goreCol(1, 0.75);
      G.lineWidth = Math.max(1, 0.018 * PXS * QK);
      G.stroke();
    } else if (LOD === 0) {
      // grime and shadow inside the hole
      torsoPoint(th0, v0 - 0.05 * sv, 0.003);
      G.beginPath();
      ellA(QX, QY, sw * 0.12 * PXS * QK, sv * 0.08 * PXS * QK, 0.3, 0, TAU);
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
    const cx = QX;
    const cy = QY;
    let ax = 0;
    let ay = -1;
    proj(J[CHE * 3], J[CHE * 3 + 1], J[CHE * 3 + 2], 0);
    const dl = Math.hypot(QX - cx, QY - cy);
    if (dl > 1e-3) {
      ax = (QX - cx) / dl;
      ay = (QY - cy) / dl;
    }
    const e = ringExtent(J[o], J[o + 1], J[o + 2], b.waist[0] * 0.95, b.waist[1] * 0.95, -ay, ax);
    proj(J[o] - TF[3] * b.rThigh * 1.1, J[o + 1] - TF[4] * b.rThigh * 1.1, J[o + 2] - TF[5] * b.rThigh * 1.1, 0);
    G.beginPath();
    mt(cx + ay * e, cy - ax * e);
    lt(S[HI[0] * 3] + (S[HI[0] * 3] - QX) * 0.3, S[HI[0] * 3 + 1] + (S[HI[0] * 3 + 1] - QY) * 0.3);
    lt(QX, QY);
    lt(S[HI[1] * 3] + (S[HI[1] * 3] - QX) * 0.3, S[HI[1] * 3 + 1] + (S[HI[1] * 3 + 1] - QY) * 0.3);
    lt(cx - ay * e, cy + ax * e);
    G.closePath();
    G.fillStyle = col(V.pants, 0.94, 1);
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = OUT * 2;
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
    return facing(mx, mz) / (Math.hypot(mx, my, mz) || 1);
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
    const pdx = ppx - EX;
    const pdy = ppy - EY;
    if (pdx * pdx + pdy * pdy > 0.04 * ERB * ERB) angP = ellAngle(ppx, ppy);
    else {
      // the pole is end-on: go the way away from the middle of the visible arc
      const mi = (s + Math.floor(vis / 2)) % n;
      angP = ellAngle(RXs[mi], RYs[mi]) + PI;
    }
    const dcw = mod(angA - angB);
    const ccw = !(mod(angP - angB) < dcw);
    if (!spikes) ellA(EX, EY, ERA, ERB, ERO, angB, angA, ccw);
    else {
      const span = ccw ? -(TAU - dcw) : dcw;
      const c = Math.cos(ERO);
      const sn = Math.sin(ERO);
      for (let k = 1; k < spikes; k++) {
        const a = angB + (span * k) / spikes;
        const m = k & 1 ? 1.13 + 0.06 * rnd(200 + k) : 0.97;
        const ux = ERA * m * Math.cos(a);
        const uy = ERB * m * Math.sin(a);
        lt(EX + ux * c - uy * sn, EY + ux * sn + uy * c);
      }
    }
    G.closePath();
    return 1;
  }
  const mod = (a) => ((a % TAU) + TAU) % TAU;
  function ellAngle(x, y) {
    const dx = x - EX;
    const dy = y - EY;
    const c = Math.cos(ERO);
    const s = Math.sin(ERO);
    return Math.atan2((-dx * s + dy * c) / ERB, (dx * c + dy * s) / ERA);
  }

  /** A flat decal on the head's surface at local (r, u, f) with axes along the head's right and up, sizes
      (ra, rb): projected to EX.., returns how much the face there looks at the camera. */
  function faceDecal(r, u, f, ra, rb, nr, nu, nf) {
    // the decal's across axis runs round the head (square to its normal), its other axis up the head
    const tl = Math.hypot(nf, nr) || 1;
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
    // neck and jaw (behind the skull, dropped open); seen from behind, the neck hides the jaw
    const jo = JAW;
    const jb = b.jaw;
    if (ff < 0 && LOD < 2) {
      ellF(HF, HED, 0, -ry * (0.55 + 0.2 * jo), rz * (0.3 - 0.06 * jo), jb[0], jb[1] * (1 + 0.15 * jo), jb[2]);
      ellInk(col(skin, 0.86, 1));
    }
    proj(J[o] - HF[3] * ry * 0.55 - HF[6] * rz * 0.15, J[o + 1] - HF[4] * ry * 0.55 - HF[7] * rz * 0.15, J[o + 2] - HF[5] * ry * 0.55 - HF[8] * rz * 0.15, 0);
    const nkx = QX;
    const nky = QY;
    proj(J[CHE * 3] + TF[3] * 0.01, J[CHE * 3 + 1] + TF[4] * 0.01, J[CHE * 3 + 2] + TF[5] * 0.01, 0);
    const wn = b.rNeck * 2 * PXS * k;
    G.beginPath();
    mt(QX, QY);
    lt(nkx, nky);
    G.strokeStyle = INKS;
    G.lineWidth = wn + OUT * 2;
    G.stroke();
    G.strokeStyle = col(look.hood ? look.shirt : skin, 0.82, 1);
    G.lineWidth = wn;
    G.stroke();
    if (ff >= 0 && LOD < 2) {
      ellF(HF, HED, 0, -ry * (0.55 + 0.2 * jo), rz * (0.3 - 0.06 * jo), jb[0], jb[1] * (1 + 0.15 * jo), jb[2]);
      ellInk(col(skin, 0.86, 1));
    }
    // skull
    ellF(HF, HED, 0, 0, 0, rx, ry, rz);
    const skullX = EX;
    const skullY = EY;
    const skullA = ERA;
    const skullB = ERB;
    const skullO = ERO;
    ellInk(col(skin, 1, 1));
    if (LOD < 2) {
      // shade on the side away from the light: a crescent inside the outline
      const sa = Math.atan2(-SLY, -SLX) - ERO;
      const dx = -Math.cos(sa + ERO) * ERA * 0.2;
      const dy = -Math.sin(sa + ERO) * ERB * 0.2;
      G.beginPath();
      ellA(EX, EY, ERA, ERB, ERO, sa - 1.45, sa + 1.45, false);
      ellA(EX + dx, EY + dy, ERA * 0.92, ERB * 0.95, ERO, sa + 1.45, sa - 1.45, true);
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
        const r = rx * (0.18 + 0.14 * rnd(320 + n)) * PXS * QK;
        elSub(QX, QY, r, r * 0.7, rnd(330 + n) * 3);
        any = true;
      }
      if (any) {
        G.fillStyle = col(look.mottle || [96, 84, 110], 1, 0.22);
        G.fill();
      }
    }
    // ears (short hair or none)
    if (LOD === 0 && look.ears) {
      for (let s = -1; s <= 1; s += 2) {
        const f = faceDecal(s * rx * 0.97, -ry * 0.08, -rz * 0.05, rz * 0.2, ry * 0.26, s, 0, 0.1);
        if (f < 0.12) continue;
        ellInk(col(skin, 0.8, 1));
      }
    }
    // the cap: hair, hood or helmet
    if (look.hood) hoodCap(rx, ry, rz, ff);
    else if (look.helmet) helmetCap(rx, ry, rz);
    else if (look.hairStyle !== "none") hairCap(rx, ry, rz);
    else if (LOD === 0) {
      // bald: a shine and an old stitched scar
      G.beginPath();
      ellA(skullX - skullA * 0.28, skullY - skullB * 0.48, skullA * 0.32, skullB * 0.16, skullO - 0.3, 0, TAU);
      G.fillStyle = col(WHITE, 1, 0.16);
      G.fill();
      let f = faceDecal(rx * 0.3, ry * 0.55, rz * 0.4, 0, 0, 0.3, 0.6, 0.4);
      if (f > 0.1) {
        G.beginPath();
        headPt(rx * 0.05, ry * 0.85, rz * 0.35);
        mt(QX, QY);
        headPt(rx * 0.55, ry * 0.6, rz * 0.3);
        lt(QX, QY);
        for (let n = 0; n < 3; n++) {
          headPt(rx * (0.15 + n * 0.15), ry * (0.86 - n * 0.09), rz * 0.42);
          mt(QX, QY);
          headPt(rx * (0.2 + n * 0.15), ry * (0.68 - n * 0.09), rz * 0.42);
          lt(QX, QY);
        }
        G.strokeStyle = col(look.scar || [70, 50, 50], 1, 0.75);
        G.lineWidth = Math.max(0.7, OUT * 0.6);
        G.stroke();
      }
    }
    // the face
    FACE = false;
    if (ff > -0.25) drawFace(rx, ry, rz, ff);
    if (look.helmet === "riot") visor(rx, ry, rz, ff);
    if (look.helmet === "fire") brim(rx, ry, rz);
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
      RXs[k] = QX;
      RYs[k] = QY;
    }
    ellF(HF, HED, 0, cu, cf, sa, sb, sc);
    // the crown (pole): up and back
    const pf = shellPoint(0, cu, cf, sa, sb, sc, 0, 0.85, -0.53);
    const r = capPath(n, QX, QY, pf, LOD === 2 || look.spiky === false ? 0 : LOD === 0 ? 11 : 7);
    if (!r) return;
    G.fillStyle = col(look.hair, 1, 1);
    if (r === 2) G.fill("evenodd");
    else G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = OUT * 1.6;
    G.stroke();
    // long hair: a lock hangs down each side of the face
    if (look.hairStyle === "long" && LOD < 2) {
      const lk = look.lockLen || ry * 1.7;
      for (let s = -1; s <= 1; s += 2) {
        if (facing(HF[0] * s + HF[6] * 0.25, HF[2] * s + HF[8] * 0.25) < -0.3) continue;
        G.beginPath();
        for (let k = 0; k < LOCK.length; k += 4) {
          headPt(s * rx * LOCK[k], ry * LOCK[k + 1] - lk * LOCK[k + 2], rz * LOCK[k + 3]);
          if (k) lt(QX, QY);
          else mt(QX, QY);
        }
        G.closePath();
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
        const x0 = QX;
        const y0 = QY;
        shellPoint(0, cu, cf, sa * 0.98, sb * 0.98, sc * 0.98, Math.sin(az) * 0.8, 0.45, Math.cos(az) * 0.8);
        mt(x0, y0);
        lt(QX, QY);
      }
      G.strokeStyle = col(look.hair, 1.45, 0.7);
      G.lineWidth = Math.max(0.7, OUT * 0.6);
      G.stroke();
    }
  }
  /** A hood up over the head: the cloth round the face opening, shadowing it. */
  function hoodCap(rx, ry, rz, ff) {
    const look = V;
    const sa = rx * 1.36;
    const sb = ry * 1.28;
    const sc = rz * 1.18;
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
      RXs[k] = QX;
      RYs[k] = QY;
    }
    ellF(HF, HED, 0, cu, cf, sa, sb, sc);
    const pf = shellPoint(0, cu, cf, sa, sb, sc, 0, 0.3, -0.95);
    const r = capPath(n, QX, QY, pf, 0);
    if (!r) return;
    G.fillStyle = col(look.shirt, 1.05, 1);
    if (r === 2) G.fill("evenodd");
    else G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = OUT * 2;
    G.stroke();
    if (LOD < 2) {
      // the shadow just inside the opening, and the hem of the hood
      G.strokeStyle = col(look.hoodShade || [10, 8, 18], 1, 0.6);
      G.lineWidth = ERB * 0.15;
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
      if (LOD === 0 && ff > 0.2) {
        // the top of the face sinks into shadow under the hood
        faceDecal(0, ry * 0.45, rz * 0.8, rx * 0.85, ry * 0.42, 0, 0.3, 1);
        G.beginPath();
        ellA(EX, EY, ERA, ERB, ERO, 0, TAU);
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
      RXs[k] = QX;
      RYs[k] = QY;
    }
    ellF(HF, HED, 0, cu, cf, sa, sb, sc);
    const hx = EX;
    const hy = EY;
    const ha = ERA;
    const hb = ERB;
    const ho = ERO;
    const pf = shellPoint(0, cu, cf, sa, sb, sc, 0, 0.9, -0.4);
    const r = capPath(n, QX, QY, pf, 0);
    if (!r) return;
    G.fillStyle = col(look.helmetCol, 1, 1);
    if (r === 2) G.fill("evenodd");
    else G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = OUT * 2;
    G.stroke();
    if (LOD < 2) {
      G.beginPath();
      ellA(hx - ha * 0.3, hy - hb * 0.45, ha * 0.36, hb * 0.18, ho - 0.35, 0, TAU);
      G.fillStyle = col(WHITE, 1, fire ? 0.2 : 0.26);
      G.fill();
    }
    if (fire && LOD === 0) {
      // the comb along the crown
      G.beginPath();
      let started = false;
      for (let m = 0; m <= 6; m++) {
        const a = -0.5 + (m / 6) * 2.6;
        const f = shellPoint(0, cu, cf, sa * 1.03, sb * 1.03, sc * 1.03, 0, Math.sin(Math.min(PI / 2, a + 0.6)) * (a < 0.97 ? 1 : 1), Math.cos(a + 0.6));
        if (f > -0.05) {
          if (started) lt(QX, QY);
          else mt(QX, QY);
          started = true;
        }
      }
      if (started) {
        G.strokeStyle = col(look.helmetCol, 1.6, 1);
        G.lineWidth = Math.max(1, OUT * 1.2);
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
    ellA(EX, EY, ERA, ERB, ERO, 0, TAU);
    G.fillStyle = col(look.visor, 1, 0.34);
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = OUT * 1.6;
    G.stroke();
    if (LOD === 0) {
      const cx = EX + ERA * 0.25;
      const cy = EY - ERB * 0.2;
      G.beginPath();
      mt(EX - ERA * 0.55, EY - ERB * 0.5);
      lt(EX - ERA * 0.1, EY - ERB * 0.75);
      G.strokeStyle = col(WHITE, 1, 0.35);
      G.lineWidth = Math.max(1, ERB * 0.08);
      G.stroke();
      G.beginPath();
      for (let n = 0; n < 4; n++) {
        const a = n * 1.7 + 0.4;
        mt(cx, cy);
        lt(cx + Math.cos(a) * ERA * 0.45, cy + Math.sin(a) * ERB * 0.42);
      }
      G.strokeStyle = col(WHITE, 1, 0.5);
      G.lineWidth = Math.max(0.6, OUT * 0.5);
      G.stroke();
    }
  }
  /** Firefighter's brim, longer at the back. */
  function brim(rx, ry, rz) {
    const o = HED * 3;
    const u = ry * 0.38;
    const f = -rz * 0.22;
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
    ellInk(col(V.helmetCol, 1.35, 1));
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
    const jo = JAW;
    // mouth: dark opening, teeth top and bottom
    const mu = -ry * (0.5 + 0.12 * jo);
    const mh = ry * (0.08 + 0.17 * jo);
    const mw = rx * 0.42 * wide;
    const fm = facing(HF[6] - HF[3] * 0.25, HF[8] - HF[5] * 0.25);
    if (fm > -0.1) {
      ellF(HF, HED, 0, mu, rz * 0.74, mw, mh, rz * 0.3);
      G.beginPath();
      ellA(EX, EY, ERA, ERB, ERO, 0, TAU);
      G.fillStyle = col(look.mouth, 1, 1);
      G.fill();
      if (LOD < 2) {
        G.strokeStyle = INKS;
        G.lineWidth = Math.min(OUT, Math.max(0.6, ERB * 0.3));
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
          mt(QX, QY);
          for (let t = 0; t < nt; t++) {
            const x0 = -mw * 0.88 + ((t + 0.5) / nt) * mw * 1.76;
            const gap = (t === 2 && top) || (t === nt - 2 && !top);
            headPt(x0, yb + (gap ? th * 0.15 : th * (0.75 + 0.35 * rnd(260 + t + row * 9))), rz * 0.96);
            lt(QX, QY);
            headPt(-mw * 0.88 + ((t + 1) / nt) * mw * 1.76, yb, rz * 0.95);
            lt(QX, QY);
          }
          G.closePath();
        }
        G.fillStyle = col(look.teeth, 1, 1);
        G.fill();
        if (LOD === 0) {
          G.strokeStyle = col(INK, 1, 0.8);
          G.lineWidth = Math.max(0.5, OUT * 0.45);
          G.stroke();
        }
      }
      if (LOD === 0 && GORE && fm > 0.05) {
        // a dribble from the corner of the mouth
        headPt(mw * 0.7, mu - mh * 0.3, rz * 0.9);
        G.beginPath();
        mt(QX, QY);
        headPt(mw * 0.8, mu - mh - ry * 0.32, rz * 0.82);
        lt(QX, QY);
        G.strokeStyle = goreCol(1, 0.7);
        G.lineWidth = Math.max(0.8, rx * 0.09 * PXS * QK);
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
        elSub(EX - ERA * 0.55, EY, ERA * 0.42, ERB * 0.5, ERO);
        elSub(EX + ERA * 0.55, EY, ERA * 0.42, ERB * 0.5, ERO);
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
      G.lineWidth = Math.max(0.6, OUT * 0.7);
      G.stroke();
    }
    // eyes: both worked out first, then drawn in one fill per layer (socket, glow, eye, pupil, lid) and one brow stroke
    let n = 0;
    for (let s = -1; s <= 1; s += 2) {
      const ex = s * rx * 0.4;
      const eu = ry * 0.08;
      if (faceDecal(ex, eu, rz * 0.84, rx * 0.27, ry * 0.21, s * 0.45, 0.1, 0.89) < 0.04) continue;
      const o = n * EYE_N;
      EYEP[o] = EX;
      EYEP[o + 1] = EY;
      EYEP[o + 2] = ERA;
      EYEP[o + 3] = ERB;
      EYEP[o + 4] = ERO;
      EYEP[o + 5] = s;
      EYEP[o + 6] = QK;
      // the lid's four corners and the brow's two ends
      for (let k = 0; k < 6; k++) {
        const q = k * 3;
        headPt(ex + s * rx * EYE_LID[q], eu + ry * EYE_LID[q + 1], rz * EYE_LID[q + 2]);
        EYEP[o + 7 + k * 2] = QX;
        EYEP[o + 8 + k * 2] = QY;
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
      // glow, then the eye (no fog: they glow in the dark)
      G.beginPath();
      for (let e = 0; e < n; e++) eyeSub(e, 1.05, 1.05, 0, 0);
      G.fillStyle = glow(look.glow, 0.28);
      G.fill();
      G.beginPath();
      for (let e = 0; e < n; e++) eyeSub(e, 0.52, 0.4, 0, 0.08);
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
        G.lineWidth = Math.max(0.8, ry * 0.09 * PXS * EYEP[6]);
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
    const len = look.hairLen * (1 - 0.7 * LYING);
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
      RXs[k] = QX;
      RYs[k] = QY;
      // the hair's end below it, a little out from the shoulders
      const out = 0.02 + 0.03 * Math.abs(Math.sin(az));
      const l = len * (k & 1 ? 0.82 + 0.25 * rnd(400 + k) : 1);
      proj(x + (HF[0] * Math.sin(az) + HF[6] * Math.cos(az)) * out, y - l, z + (HF[2] * Math.sin(az) + HF[8] * Math.cos(az)) * out, 0);
      RXs[n + k] = QX;
      RYs[n + k] = QY;
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
    G.strokeStyle = INKS;
    G.lineWidth = OUT * 1.6;
    G.stroke();
    if (LOD === 0) {
      G.beginPath();
      for (let k = 1; k < n - 1; k++) {
        mt(RXs[k], RYs[k]);
        lt(RXs[n + k] * 0.85 + RXs[k] * 0.15, RYs[n + k] * 0.85 + RYs[k] * 0.15);
      }
      G.strokeStyle = col(look.hair, 1.6, 0.6);
      G.lineWidth = Math.max(0.6, OUT * 0.5);
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
    CW = Math.max(1, +cam.w || 1);
    CH = Math.max(1, +cam.h || 1);
    W2 = CW / 2;
    PXS = +cam.px > 0 ? +cam.px : CH / t.h;
    DIST = +cam.dist > 0.05 ? +cam.dist : 0.05;
    EYE = cam.eye == null || !Number.isFinite(+cam.eye) ? 0.5 : Math.max(0.05, +cam.eye);
    const yaw = +st.yaw || 0;
    CYAW = Math.cos(yaw);
    SYAW = Math.sin(yaw);
    TCX = -SYAW;
    TCZ = CYAW;
    LOD = st.lod === 1 || st.lod === 2 ? st.lod : 0;
    FOGK = 1 - Math.min(0.9, Math.max(0, +st.fog || 0));
    FLASH = st.hit ? 0.5 : 0;
    GORE = st.gore == null ? gore() : !!st.gore;
    INKS = col(INK, 1, 1);
    FACE = false;
    solve(t, st);
    OUT = Math.max(0.7, Math.min(3.2, PXS * 0.0105));
    fit();
    OUT = Math.max(0.7, Math.min(3.2, PXS * FIT * 0.0105));
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
    // the head goes after the torso even from behind: a hunched walker's head shows over its shoulders
    pKey[PT_HEAD] = Math.min(jDepth(HED) - 0.12, pKey[PT_TORSO] - 0.001);
    const back = 0.15;
    pKey[PT_HAIR] = depth(J[HED * 3] - HF[6] * back, J[HED * 3 + 2] - HF[8] * back);
    let n = 0;
    for (let p = 0; p < NP; p++) {
      if (p === PT_HAIR && !V.hairLen) continue;
      if (p === PT_PELVIS && (V.hem > 0.14 || LOD === 2)) continue;
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
      gait: Object.assign({ stride: 0.8, duty: 0.6, lift: 0.05, crouch: 0.03, lean: 0.15, bob: 0.012, sway: 0.02, twist: 0.1, roll: 0.03, tilt: 0, headFwd: 0.02, headUp: 0.6, headTilt: 0.1, jaw: 0.4, arms: "reach", reachSide: -1, dragSide: 1, toeOut: 0.12, clawRate: 1.6, turnRate: 7, scream: false }, def.gait),
      looks: [],
    };
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
    T = keepT;
    V = keepV;
  }
  /** Size of the region a type is drawn in (tiles, natural; the engine caps it under a ceiling). falling: wide
      enough for the body lying on its side. bar: the health bar's width, about the walker's hit width on
      screen (2 r 1.1 / STRETCH, r from WORLD.WALKER_TYPES when the facts are loaded). Reused objects. */
  const STRETCH = 2 * Math.tan(1.22 / 2); // js/interior.js's FOV
  function box(type, falling) {
    const t = TYPES[type] || TYPES.walker;
    if (!t) return { h: 0.92, w: 1, head: 0.9, bar: 0.5 };
    const wt = ZSR.WORLD && ZSR.WORLD.WALKER_TYPES;
    const row = wt && (wt[type] || wt.walker);
    const r = row && row.r > 0 ? row.r : t.r;
    const o = falling ? t.boxFall : t.box;
    o.h = t.h;
    o.head = t.headTop;
    o.bar = (2 * r * 1.1) / STRETCH;
    return o;
  }
  /** Tiles walked per gait cycle (feet stay planted when the engine advances gait by distance / stride). */
  function stride(type) {
    const t = TYPES[type] || TYPES.walker;
    return t && t.gait.stride > 0 ? t.gait.stride : 0.9;
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

  ZSR.Walker3D = {
    FALL_SECS: 2,
    COLLAPSE_SECS: 0.9,
    FADE_SECS: 0.7,
    BITE_SECS: 0.45,
    SCREAM_SECS: 1.2,
    POSES,
    TYPES,
    addType,
    gore,
    box,
    stride,
    draw,
    SPRITES,
  };
})(typeof window !== "undefined" ? window : globalThis);
