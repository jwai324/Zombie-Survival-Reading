/* Beast3D: the animals as live 3D jointed figures (the stray dog, Rivet the robot dog, and the farm's goats and hens),
   drawn fresh into a small region whenever they change, in the walkers' comic style (js/walker3d.js:
   ink outline, flat fills, the same light from the upper left, fog in steps, three levels of detail), from any side,
   in any pose. No images and no WebGL: plain Canvas 2D calls straight into the context the engine hands over.

   The looks are data. js/beast3d-looks.js adds the dogs with Beast3D.addType(id, def): plan, skin, build (bone
   lengths and radii in tiles), gait, the poses it has and its look (colours and parts); js/beast3d-looks2.js adds the
   farm's "goat" and "chicken" (and documents their own fields: horns, beard, comb, tail fan ...). More kinds go in an
   appended js/beast3d-looks3.js. A type has one of two body plans:
     "quad"   four legs: fore left, fore right, hind left, hind right (dog, robot dog, goat)
     "biped"  two legs under the body (the hind legs' rig), drawn before the body (they come out from under its
              feathers), and two flat feathered wings, folded along its sides or spread (chicken)
   and one of two skins: "fur" (soft blobs: ellipsoids joined under one ink line, tube legs, a tail) or "metal"
   (boxes, tube legs with joint discs, lights that glow).

   draw(ctx, type, st, cam) -> { parts } (one reused object; copy what you keep)
   st (one object, reused by the caller; a missing or non-numeric field draws as its default, never NaN):
     yaw     0 = facing the camera; +: its front turns to the camera's left (as Walker3D)
     gait    0..1 through the gait cycle (the engine advances it by distance walked / stride(type, run))
     move    0..1 from standing to walking
     run     0..1 (default 0): how far the gait goes over to a gallop (the type's gaitRun: longer strides, all four
             feet off the ground between them, the back flexing); stride(type, run) gives the matching stride
     pose    one of POSES. A pose the type does not list draws "stand". "walk" is "stand" with its legs going (move).
             The farm's: "graze" (head down, the muzzle in the grass, tearing at it and chewing), "peck" (twice a loop
             the beak stabs the ground), "flap" (up on its toes, wings spread and beating), "bleat" (head up, mouth
             open); a biped's "sit" settles it on its belly, its legs folded away under it
     poseT   0..1 through the pose's loop: the panting, breathing and the tail's wag (stand, walk, sit, lie, off, graze,
             peck, flap), one bark (bark), one zap (zap), one bleat (bleat). The engine advances it by
             dt / POSE_SECS[pose] and wraps it. The looping poses share one length, so the wag and the panting keep
             their phase through a pose change
     poseW   0..1 (default 1): how far it has gone from standing (or walking: move) into the pose. The engine ramps it
             from 0 to 1 over about POSE_BLEND seconds after a pose change (out to "stand" first, then in, as the
             walkers do), so a dog sits down and gets up instead of jumping there
     wag     0..1 (default 0.5): how hard the tail wags
     headYaw rad (default 0): the head's heading minus the body's, in the yaw's sense (+: toward its right); clamped to
             HEAD_YAW_MAX, the neck taking part of the turn
     hit     0 | 1: the white flash of a bite landing (Rivet)
     seed    int: which look variant (a type may have several) and the scruff's tics
     lod     0 full | 1 no fur tufts, sheen, shading or rivets | 2 silhouette, the head and its eye
     fog     0..0.9: every colour times (1 - fog), in steps of 1 / FOG_STEPS (compare Math.round(fog * FOG_STEPS) in a
             redraw signature); a robot's lights keep their glow (a shut-down robot has none)
   cam: the same contract as Walker3D.draw, so the engine's live pool treats both alike: w, h (px of the region drawn
        from 0,0), px (px per tile), dist (tiles to the camera plane), eye (tiles above the feet: the camera's height);
        optional floor (px of room under the feet line, at most 0.6 h: a paw nearer the camera than the feet goes down
        to the floor under itself) and shadow (false: no contact shadow; the caller lays its own)

   Contract (tests/validate-art.js "animals in 3D" checks it): everything inside [0,w] x [0,h], the feet on y = h
   (h - floor) and the figure centred on x = w/2; no translate, scale, rotate, transform or drawImage; no new canvases;
   no gradients, Path2D, shadowBlur or filter; context state is never read back; the same inputs make the same calls
   (seeded random only); nothing made per draw (preallocated joint, blob and part buffers, one Float64Array for the
   numbers passed between functions, a colour-string table that converges because light and fog come in steps);
   colours "rgb(r,g,b)" / "rgba(r,g,b,a)" with the light, fog and hit flash in them; within the per-lod call ceilings
   tests/validate-art.js sets (BEAST_OPS).
   Size: a figure too big for its region is shrunk about its feet, by an envelope of all its poses worked out once in
   addType (as Walker3D), so a dog never changes size as it sits, barks or turns its head. The model keeps screen
   proportions (no squash to the view's stretch), as the walkers do. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const TAU = Math.PI * 2;
  const PI = Math.PI;
  // lengths (Math.hypot would allocate its argument list on every call)
  const hyp2 = (x, y) => Math.sqrt(x * x + y * y);
  const hyp3 = (x, y, z) => Math.sqrt(x * x + y * y + z * z);

  // SCALE: perspective inside one figure (as Walker3D): its far side is drawn at least K_MIN times as big as its
  // middle, its near side at most K_MAX
  const K_MIN = 0.6;
  const K_MAX = 1.6;
  const FOG_STEPS = 32; // fog in steps of 1/32 (and the light in steps of 1/LIGHT_STEPS): the colour table converges
  const LIGHT_STEPS = 64;
  const POSE_BLEND = 0.2; // seconds the engine should take to ramp st.poseW from 0 to 1 after a pose change
  // (appended, never reordered: the farm's poses came after the dogs')
  const POSES = ["stand", "walk", "sit", "lie", "bark", "zap", "off", "graze", "peck", "flap", "bleat"];
  const P_STAND = 0;
  const P_WALK = 1;
  const P_SIT = 2;
  const P_LIE = 3;
  const P_BARK = 4;
  const P_ZAP = 5;
  const P_OFF = 6;
  const P_GRAZE = 7; // head down to the grass, tearing and chewing (a goat)
  const P_PECK = 8; // pecking at the ground, twice a loop (a hen)
  const P_FLAP = 9; // up on its toes, wings spread and beating (a hen)
  const P_BLEAT = 10; // head up, mouth open: one long bleat (a goat)
  // seconds one poseT loop takes: the looping poses share one length (the wag and the panting keep their phase
  // through a pose change); a bark, a zap and a bleat are one loop each (the engine loops them to bark on)
  const LOOP_SECS = 1.2;
  const POSE_SECS = { stand: LOOP_SECS, walk: LOOP_SECS, sit: LOOP_SECS, lie: LOOP_SECS, off: LOOP_SECS, bark: 0.5, zap: 0.3, graze: LOOP_SECS, peck: LOOP_SECS, flap: LOOP_SECS, bleat: 1.1 };
  // SCALE: how finely the envelope (see fit) samples a pose's loop: a quick one (wingbeats, pecks) needs more steps so
  // its extremes are in it; any other pose takes ENV_STEPS
  const ENV_STEPS = 8;
  const POSE_ENV_STEPS = { graze: 16, peck: 16, flap: 40, bleat: 16 };
  const PANTS = 4; // pants a loop (about 3.3 a second)
  const WAGS = 3; // wags a loop (2.5 a second standing; a bark's short loop wags faster: an excited dog)
  const CHEWS = 3; // chews a grazing loop
  const PECKS = 2; // pecks a loop
  const BEATS = 5; // wingbeats a flapping loop (about 4 a second)
  const HEAD_YAW_MAX = 1.15; // rad either way the head turns toward something (the neck takes NECK_SHARE of it)
  const NECK_SHARE = 0.35;
  const INK = [13, 14, 16];
  const BLACK = [0, 0, 0];
  const WHITE = [255, 255, 255];
  // the light, in camera space (x right, y up, z away from the camera): from the upper left and from the camera's
  // side, as on the walkers (whose sheen and shade sit on the same sides)
  const LN = hyp3(0.45, 0.8, 0.4);
  const LX = -0.45 / LN;
  const LY = 0.8 / LN;
  const LZ = -0.4 / LN;
  const SLX = LX / hyp2(LX, LY); // its direction on screen (y down)
  const SLY = -LY / hyp2(LX, LY);

  /* ---------- Joints: model tiles, origin on the ground under the body's middle, x its right, y up, z its forward */
  const HIP = 0; // the spine over the hind legs (the rump's middle)
  const SHO = 1; // the spine over the fore legs (the withers)
  const NEC = 2; // the top of the neck, where the head turns
  const HED = 3; // the skull's middle
  const TB = 4; // the tail: its base, two bends and the tip
  const TM = 5;
  const TN = 6;
  const TT = 7;
  const SNT = 8; // the snout's tip (the nose)
  const LEG = 9; // leg l (0 fore left, 1 fore right, 2 hind left, 3 hind right), joint k (0 top, 1 elbow or stifle,
  //                2 wrist or hock, 3 paw): LEG + l * 4 + k
  const WNG = 25; // wing w (0 left, 1 right) of a biped, joint k (0 root, 1 tip): WNG + w * 2 + k
  const EART = 29; // the tips of its ears (left, right) and of a robot's antenna: for the fit only
  const ANT = 31;
  const HRN = 32; // the tips of its horns (left, right), or a comb's crest: for the fit only (at the skull without)
  const NJ = 34;
  const LJ = (l, k) => LEG + l * 4 + k;
  const J = new Float64Array(NJ * 3);
  const JR = new Float64Array(NJ); // how far a part reaches around each joint (tiles): the fit
  const GR = new Float64Array(NJ); // how far it reaches below each joint: the ground (nothing under the floor)
  const S = new Float64Array(NJ * 3); // projected: x, y, scale
  const BF = new Float64Array(9); // body frame: right, up, forward
  const HF = new Float64Array(9); // head frame
  const NF = new Float64Array(9); // scratch frame
  const TF = new Float64Array(9); // the tail's frame at its base (a fan tail spreads in it)
  const LEGS_Q = [0, 1, 2, 3];
  const LEGS_B = [2, 3];

  /* ---------- Per-draw state ---------- */
  let G = null;
  let LOD = 0;
  let SEED = 1;
  let T = null; // the type
  let V = null; // its look (the variant this seed picked)
  let POSE = P_STAND;
  let INKS = "rgb(13,14,16)";
  let SHADOW = true;
  let RUNNING = false;
  let LIT = false; // its lights are on (metal: not shut down)
  let ZAPPING = false;
  let HEADBACK = false;
  let NLEG = 4;
  let LEGS = LEGS_Q;
  let ZAPT = 0; // st.poseT through a zap (the bolts' flicker)
  const FLR = new Float64Array(2); // cam.floor: [the feet line's y, px of room under it]
  const RESULT = { parts: 0 };

  /* ---------- Numbers passed between the drawing functions (never in closure variables: V8 would box them) ---------- */
  const RG = new Float64Array(64);
  const JAW = 0; // how far the mouth is open, 0..1
  const LYING = 1; // how far down on its belly, 0..1 (the shadow widens)
  const EAR = 2; // the floppy ear perked up, 0..1
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
  const FQ = 21; // footPath: how far through its swing (0 planted)
  const FIT_ENV = 22;
  const QX = 23;
  const QY = 24;
  const QK = 25;
  const EX = 26;
  const EY = 27;
  const ERA = 28;
  const ERB = 29;
  const ERO = 30;
  const ECX = 31;
  const ECY = 32;
  const NX = 33;
  const NY = 34;
  const GX = 35;
  const GY = 36;
  const BREATH = 37; // -1..1 the chest's breath (or a pant)
  const WAGA = 38; // the tail's swing, rad
  const BARKK = 39; // 0..1 the bark's snap (the lines from the mouth)
  const ZAPK = 40; // 0..1 the zap's crackle
  const CAMX = 41; // the camera in model space (for a box face's facing)
  const CAMY = 42;
  const CAMZ = 43;
  const PITCH = 44; // the body's pitch (rad, nose up +)
  RG[PXS] = 1;
  RG[DIST] = 3;
  RG[EYE] = 0.5;
  RG[CYAW] = 1;
  RG[TCZ] = 1;
  RG[FIT] = 1;
  RG[FOGK] = 1;
  RG[OUT] = 1;
  RG[QK] = 1;
  RG[FIT_ENV] = 1;
  RG[ERA] = 1;
  RG[ERB] = 1;

  const clamp01 = (v) => (v > 0 ? (v < 1 ? v : 1) : 0); // NaN and undefined -> 0
  const smooth = (v) => {
    const t = clamp01(v);
    return t * t * (3 - 2 * t);
  };
  const frac = (v) => v - Math.floor(v);
  const num = (v, d) => (v == null || !Number.isFinite(+v) ? d : +v);

  /** Seeded 0..1 for this animal (seed) and slot i. */
  function rnd(i) {
    let x = Math.imul(SEED ^ Math.imul(i + 1, 0x9e3779b1), 0x85ebca6b);
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }

  /* ---------- Colours: rgb arrays in, strings out, from a fixed table (a miss builds one string) ---------- */
  // SCALE: colour-string table slots (a power of two). Every type x variant x light level x fog step x flash is one
  // colour; a miss only builds one string, so keep it a few times what a busy yard uses (about 3,000 with the two dogs,
  // about 6,000 with the farm's goats and hens too)
  const CC_N = 16384;
  const CC_SHIFT = 32 - Math.log2(CC_N);
  const ccKey = new Float64Array(CC_N).fill(-1);
  const ccStr = new Array(CC_N).fill("");
  function cstr(r, g, b, a) {
    const key = ((r * 256 + g) * 256 + b) * 128 + a;
    const h = Math.imul(key | 0, 0x9e3779b1) >>> CC_SHIFT;
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
  /** The same without the fog: a robot's lights glow in the dark (never called while it is shut down). */
  function glow(c, a) {
    const f = RG[FLASH];
    return cstr(ch((1 - f) * c[0] + f * 255), ch((1 - f) * c[1] + f * 255), ch((1 - f) * c[2] + f * 255), Math.round(clamp01(a) * 100));
  }

  /* ---------- Frames: three unit vectors (right, up, forward) in a Float64Array(9) ---------- */
  function frameSet(F, src) {
    for (let k = 0; k < 9; k++) F[k] = src ? src[k] : k === 0 || k === 4 || k === 8 ? 1 : 0;
  }
  /** Turn basis vectors i0 and i1 in their plane: v0 -> v0 cos a + v1 sin a. yaw (front toward its right): (2, 0);
      pitch (nose down, the top toward forward): (1, 2); roll (top toward its right): (1, 0). */
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
  /** Two-bone reach: root a and end c are set, middle m goes toward pole (px, py, pz). An end out of reach is pulled
      in, and joint d (the paw below it, or -1) moves with it. */
  function ik(a, m, c, la, lb, px, py, pz, d) {
    const ax = J[a * 3];
    const ay = J[a * 3 + 1];
    const az = J[a * 3 + 2];
    let dx = J[c * 3] - ax;
    let dy = J[c * 3 + 1] - ay;
    let dz = J[c * 3 + 2] - az;
    let dl = hyp3(dx, dy, dz);
    if (dl < 1e-6) {
      dx = 0;
      dy = -1;
      dz = 0;
      dl = 1e-6;
    }
    const max = (la + lb) * 0.999;
    if (dl > max) {
      const ox = J[c * 3];
      const oy = J[c * 3 + 1];
      const oz = J[c * 3 + 2];
      dx *= max / dl;
      dy *= max / dl;
      dz *= max / dl;
      dl = max;
      setJ(c, ax + dx, ay + dy, az + dz);
      if (d >= 0) setJ(d, J[d * 3] + J[c * 3] - ox, J[d * 3 + 1] + J[c * 3 + 1] - oy, J[d * 3 + 2] + J[c * 3 + 2] - oz);
    }
    const ux = dx / dl;
    const uy = dy / dl;
    const uz = dz / dl;
    const dd = Math.max(dl, Math.abs(la - lb) + 1e-4);
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

  /* ---------- The pose: st -> a set of numbers (the base: standing or walking; the pose's own), blended ----------
     Each pose fills the same numbers; the two sets blend by poseW, then one pass builds the joints from them, so a
     pose change never jumps (every number moves continuously). */
  const Q_HIPY = 0;
  const Q_HIPZ = 1;
  const Q_SHOY = 2;
  const Q_SHOZ = 3;
  const Q_ROLL = 4; // the body's roll (top toward its right)
  const Q_NECK = 5; // the neck's angle above level (rad)
  const Q_HEAD = 6; // the head's pitch below level (rad, + nose down)
  const Q_TAILUP = 7; // the tail's angle above straight back (rad)
  const Q_TAILCURL = 8; // more bend at each joint of the tail (rad)
  const Q_TAILSIDE = 9; // the tail laid round to its side (rad, on the ground when lying)
  const Q_JAW = 10;
  const Q_EAR = 11;
  const Q_HEADROLL = 12; // the head's tilt (rad)
  const Q_ANT = 13; // a robot's antenna: 0 up, 1 drooped back
  const Q_WING = 14; // a bird's wings: 0 folded, 1 spread
  const Q_BOB = 15; // the head thrust forward along the neck (tiles): a hen's head-bob, her reach to peck
  const Q_WUP = 16; // spread wings' angle above level (rad): the wingbeat
  const Q_LEG = 17; // leg l: paw x, y, z (model), the pastern's angle (rad back from straight up), the knee's splay
  //                  out to the side, and how far the knee's way tips up (a lying dog's elbows rest on the floor)
  const QL = 6;
  const NQ = Q_LEG + 4 * QL;
  const PB = new Float64Array(NQ); // the base
  const PT = new Float64Array(NQ); // the pose
  const PP = new Float64Array(NQ); // blended

  /** A paw's path through one step (q 0..1): planted for the first `duty` of it, moving back from +S/2 to -S/2 under
      the body, then a lifted swing forward. Continuous at both ends. Sets FZ, FY and FQ (0 planted, 0..1 the swing). */
  function footPath(q, Sz, lift, duty) {
    if (q < duty) {
      RG[FZ] = Sz * (0.5 - q / duty);
      RG[FY] = 0;
      RG[FQ] = 0;
    } else {
      const t = (q - duty) / (1 - duty);
      RG[FZ] = Sz * (0.5 - 0.5 * Math.cos(PI * t) - 0.5);
      RG[FY] = lift * Math.sin(PI * t);
      RG[FQ] = t;
    }
  }
  /** The base: standing still or walking (move m), trotting over to a gallop (run). Panting and the wag ride on it. */
  function baseSet(t, g, m, ph, pT) {
    const b = t.build;
    const A = TAU * ph;
    const half = b.len / 2;
    // the gait's heave and the gallop's rocking: hips and shoulders bob out of step, the back flexes
    const heave = g.bob * m * (0.5 + 0.5 * Math.cos(2 * A));
    const rock = g.rock * m * Math.sin(A + (g.rockPh || 0));
    const flex = g.flex * m * Math.cos(A + (g.rockPh || 0));
    PB[Q_HIPY] = b.hipH - g.crouch * m - heave + rock * 0.5;
    PB[Q_SHOY] = b.shH - g.crouch * m * 0.6 - heave - rock * 0.5;
    PB[Q_HIPZ] = -half + flex * 0.5;
    PB[Q_SHOZ] = half - flex * 0.5;
    PB[Q_ROLL] = g.roll * m * Math.sin(A);
    PB[Q_NECK] = b.neckAng - g.neckDrop * m;
    PB[Q_HEAD] = b.headPitch + g.headDip * m + g.nod * m * Math.sin(2 * A + 0.6);
    PB[Q_TAILUP] = b.tailUp + (g.tailUp - b.tailUp) * m;
    PB[Q_TAILCURL] = b.tailCurl;
    PB[Q_TAILSIDE] = 0;
    PB[Q_JAW] = V.pant ? 0.3 + 0.1 * Math.sin(TAU * PANTS * pT) + 0.08 * m : 0;
    PB[Q_EAR] = 0;
    PB[Q_HEADROLL] = 0;
    PB[Q_ANT] = 0.12 * m;
    PB[Q_WING] = 0;
    PB[Q_WUP] = 0;
    // a hen's head-bob (gait.headBob, tiles): her head holds still in the air while her body walks under it, then
    // thrusts forward as each foot lands (twice a cycle): back slowly against the body, forward fast
    PB[Q_BOB] = 0;
    if (g.headBob) {
      const q = frac(2 * ph + 0.15);
      PB[Q_BOB] = g.headBob * m * (q < 0.7 ? 1 - (2 * q) / 0.7 : -1 + 2 * smooth((q - 0.7) / 0.3));
    }
    // the legs: each paw on its own phase; the pastern rolls forward under the step, folds up in the swing
    const Sz = g.stride * g.duty * m;
    for (let i = 0; i < NLEG; i++) {
      const l = LEGS[i];
      const fore = l < 2;
      const s = l & 1 ? 1 : -1;
      footPath(frac(ph + g.phase[l]), Sz, g.lift * (fore ? 1 : g.hindLift) * m, g.duty);
      const o = Q_LEG + l * QL;
      PB[o] = s * b.footW;
      PB[o + 1] = RG[FY] + b.pawR;
      PB[o + 2] = (fore ? half + b.foreZ : -half + b.hindZ) + RG[FZ];
      const a0 = fore ? b.foreAng : b.hindAng;
      const roll = fore ? g.foreRoll : g.hindRoll;
      const fold = fore ? g.foreFold : g.hindFold;
      // planted: the joint above the paw from behind it (reaching, touching down) to over it (pushing off);
      // swung: folding (a fore paw curls back under the wrist, a hind paw tucks under the hock), then reaching again
      const qq = frac(ph + g.phase[l]);
      let a;
      if (qq < g.duty) a = a0 + roll * m * (0.5 - qq / g.duty);
      else {
        const tq = (qq - g.duty) / (1 - g.duty);
        a = a0 + roll * m * (tq - 0.5) + fold * m * Math.sin(PI * tq);
      }
      PB[o + 3] = a;
      PB[o + 4] = fore ? 0.1 : 0.18;
      PB[o + 5] = fore ? -0.35 : 0.2;
    }
  }
  /** Sitting: the rear down on its haunches, the front legs straight, the chest up, the tail along the ground. */
  function sitSet(t, pT) {
    const b = t.build;
    const half = b.len / 2;
    const fz = half + b.foreZ;
    PT[Q_HIPY] = b.sitH;
    PT[Q_HIPZ] = -half * 0.5;
    PT[Q_SHOZ] = fz - b.len * 0.02;
    const dz = PT[Q_SHOZ] - PT[Q_HIPZ];
    PT[Q_SHOY] = PT[Q_HIPY] + Math.sqrt(Math.max(0, b.len * b.len - dz * dz));
    PT[Q_ROLL] = 0;
    PT[Q_NECK] = b.sitNeck;
    PT[Q_HEAD] = b.headPitch - 0.12 + 0.03 * Math.sin(TAU * pT);
    PT[Q_TAILUP] = -1.25;
    PT[Q_TAILCURL] = 0.12;
    PT[Q_TAILSIDE] = 0.85;
    PT[Q_JAW] = V.pant ? 0.22 + 0.08 * Math.sin(TAU * PANTS * pT) : 0;
    PT[Q_EAR] = 0.15;
    PT[Q_HEADROLL] = 0.12;
    PT[Q_ANT] = 0;
    PT[Q_WING] = 0;
    PT[Q_WUP] = 0;
    PT[Q_BOB] = 0;
    for (let i = 0; i < NLEG; i++) {
      const l = LEGS[i];
      const s = l & 1 ? 1 : -1;
      const o = Q_LEG + l * QL;
      if (l < 2) {
        PT[o] = s * b.footW;
        PT[o + 1] = b.pawR;
        PT[o + 2] = fz;
        PT[o + 3] = b.foreAng * 0.5;
        PT[o + 4] = 0.1;
        PT[o + 5] = -0.35;
      } else {
        // the hind paws forward beside the haunch, the hock flat on the ground behind
        PT[o] = s * (b.hipW + b.footW * 0.55);
        PT[o + 1] = b.pawR;
        PT[o + 2] = PT[Q_HIPZ] + b.pastern[1] * 1.15;
        PT[o + 3] = PI / 2 - 0.12;
        PT[o + 4] = 0.75;
        PT[o + 5] = 0.6;
      }
    }
  }
  /** Lying on its belly (a sphinx: front legs out ahead, hind legs folded at its sides), head up; shut down
      (off): slumped, legs folded under, head down on its paws. */
  function lieSet(t, pT, off) {
    const b = t.build;
    const half = b.len / 2;
    const breath = off ? 0 : 0.004 * Math.sin(TAU * pT);
    PT[Q_HIPY] = b.lieH + breath;
    PT[Q_SHOY] = b.lieH + (off ? 0 : b.lieH * 0.18) + breath;
    PT[Q_HIPZ] = -half;
    PT[Q_SHOZ] = half;
    PT[Q_ROLL] = off ? 0.16 : 0;
    PT[Q_NECK] = off ? 0.1 : b.lieNeck;
    PT[Q_HEAD] = off ? 0.3 : b.headPitch + 0.05;
    PT[Q_TAILUP] = off ? -0.35 : -0.4;
    PT[Q_TAILCURL] = 0.05;
    PT[Q_TAILSIDE] = off ? 0.35 : 0.7;
    PT[Q_JAW] = 0;
    if (b.lieTail && !off) {
      // (build.lieTail [up, round to its side]: a short tail that stays up; build.lieChew: chewing the cud)
      PT[Q_TAILUP] = b.lieTail[0];
      PT[Q_TAILSIDE] = b.lieTail[1];
      PT[Q_JAW] = (b.lieChew || 0) * (0.5 - 0.5 * Math.cos(TAU * CHEWS * pT));
    }
    PT[Q_EAR] = 0;
    PT[Q_HEADROLL] = off ? -0.22 : 0.08;
    PT[Q_ANT] = off ? 1 : 0;
    PT[Q_WING] = 0;
    PT[Q_WUP] = 0;
    PT[Q_BOB] = 0;
    for (let i = 0; i < NLEG; i++) {
      const l = LEGS[i];
      const s = l & 1 ? 1 : -1;
      const o = Q_LEG + l * QL;
      if (l < 2 && b.lieFold && !off) {
        // (build.lieFold: a goat kneels down to lie) folded under the chest: the knee (the wrist joint) ahead on the
        // ground, the hoof tucked back under the forearm
        PT[o] = s * b.footW * 0.95;
        PT[o + 1] = b.pawR;
        PT[o + 2] = half + b.fore[1] * 0.3 - b.pastern[0] * 0.95;
        PT[o + 3] = -(PI / 2 - 0.08);
        PT[o + 4] = 0.2;
        PT[o + 5] = -0.6;
      } else if (l < 2) {
        PT[o] = s * b.footW * (off ? 0.9 : 1.05);
        PT[o + 1] = b.pawR;
        // out ahead (the forearm flat on the floor), or folded in under the chest
        PT[o + 2] = half + (off ? b.foreZ + b.pastern[0] * 0.6 : b.fore[0] + b.fore[1] * 0.85);
        PT[o + 3] = PI / 2 - 0.05;
        PT[o + 4] = off ? 0.35 : 0.15;
        PT[o + 5] = 0.9;
      } else {
        PT[o] = s * (b.hipW + b.footW * (off ? 0.45 : 0.75));
        PT[o + 1] = b.pawR;
        PT[o + 2] = -half + b.pastern[1] * (off ? 0.7 : 1.3);
        PT[o + 3] = PI / 2 - 0.08;
        PT[o + 4] = off ? 0.5 : 0.95;
        PT[o + 5] = 0.7;
      }
    }
  }
  /** A bark (pT through one): braced on its front legs, chest dipping with each woof, head up, the mouth snapping
      open; ears perked, the tail up stiff. A zap: braced, head forward aiming, the antenna up. */
  function braceSet(t, pT, zap) {
    const b = t.build;
    const half = b.len / 2;
    // the woof: the mouth snaps open fast and closes slower; the chest bounces with it
    const snap = pT < 0.18 ? smooth(pT / 0.18) : 1 - smooth((pT - 0.18) / 0.5);
    RG[BARKK] = zap ? 0 : snap;
    RG[ZAPK] = zap ? Math.sin(PI * clamp01(pT)) : 0;
    PT[Q_HIPY] = b.hipH + (zap ? -0.006 : 0.004);
    PT[Q_SHOY] = b.shH - (zap ? 0.012 : 0.016 + 0.012 * snap);
    PT[Q_HIPZ] = -half - (zap ? 0.01 : 0.004);
    PT[Q_SHOZ] = half - (zap ? 0 : 0.006 * snap);
    PT[Q_ROLL] = 0;
    PT[Q_NECK] = zap ? b.neckAng - 0.25 : b.neckAng + 0.12 + 0.1 * snap;
    PT[Q_HEAD] = zap ? b.headPitch + 0.12 : b.headPitch - 0.3 - 0.2 * snap;
    PT[Q_TAILUP] = zap ? 0.15 : 0.95;
    PT[Q_TAILCURL] = zap ? 0 : 0.1;
    PT[Q_TAILSIDE] = 0;
    PT[Q_JAW] = zap ? 0 : 0.1 + 0.9 * snap;
    PT[Q_EAR] = zap ? 0 : 0.7;
    PT[Q_HEADROLL] = 0;
    PT[Q_ANT] = zap ? -0.25 : 0;
    PT[Q_WING] = 0;
    PT[Q_WUP] = 0;
    PT[Q_BOB] = 0;
    for (let i = 0; i < NLEG; i++) {
      const l = LEGS[i];
      const s = l & 1 ? 1 : -1;
      const o = Q_LEG + l * QL;
      if (l < 2) {
        PT[o] = s * b.footW * 1.35;
        PT[o + 1] = b.pawR;
        PT[o + 2] = half + b.foreZ + b.len * 0.16;
        PT[o + 3] = b.foreAng - 0.25;
        PT[o + 4] = 0.25;
        PT[o + 5] = -0.35;
      } else {
        PT[o] = s * b.footW * 1.15;
        PT[o + 1] = b.pawR;
        PT[o + 2] = -half + b.hindZ - b.len * 0.06;
        PT[o + 3] = b.hindAng + 0.1;
        PT[o + 4] = 0.2;
        PT[o + 5] = 0.2;
      }
    }
  }

  /* ---------- The farm's poses (the goat's and the hen's) ---------- */
  /** Leg l standing (as baseSet stands it, still), its paw moved (dx out to its side, dz forward) into PT. */
  function legStand(b, l, dx, dz) {
    const fore = l < 2;
    const s = l & 1 ? 1 : -1;
    const o = Q_LEG + l * QL;
    PT[o] = s * (b.footW + dx);
    PT[o + 1] = b.pawR;
    PT[o + 2] = (fore ? b.len / 2 + b.foreZ : -b.len / 2 + b.hindZ) + dz;
    PT[o + 3] = fore ? b.foreAng : b.hindAng;
    PT[o + 4] = fore ? 0.1 : 0.18;
    PT[o + 5] = fore ? -0.35 : 0.2;
  }
  /** The neck's angle above level (rad) that puts the snout's tip y tiles over the ground, for the spine PT holds,
      the head pitched p (nose down) and thrust bob tiles along the neck (as solve builds them, the head straight and
      upright: turning it or the neck only lifts the snout off a spine tipped nose down). Out of reach: straight down. */
  function neckFor(b, y, p, bob) {
    let fy = PT[Q_SHOY] - PT[Q_HIPY];
    let fz = PT[Q_SHOZ] - PT[Q_HIPZ];
    const fl = hyp2(fy, fz) || 1;
    fy /= fl;
    fz /= fl;
    const sn = b.snout;
    const v = (y - PT[Q_SHOY] - (b.neckFwd + bob) * fy - (b.headUp + sn[3]) * Math.cos(p) + (b.headFwd + sn[4] + sn[0]) * Math.sin(p)) / b.neck[0];
    return Math.asin(v < -1 ? -1 : v > 1 ? 1 : v);
  }
  /** The parts of the pose every farm pose sets alike (no roll, no antenna, the ears and tail as the build has them). */
  function farmBase(b) {
    PT[Q_HIPZ] = -b.len / 2;
    PT[Q_SHOZ] = b.len / 2;
    PT[Q_ROLL] = 0;
    PT[Q_TAILCURL] = b.tailCurl;
    PT[Q_TAILSIDE] = 0;
    PT[Q_EAR] = 0;
    PT[Q_HEADROLL] = 0;
    PT[Q_ANT] = 0;
    PT[Q_WING] = 0;
    PT[Q_WUP] = 0;
    PT[Q_BOB] = 0;
    PT[Q_JAW] = 0;
  }
  /** Grazing (a goat): the withers lower over front legs set a little wider and ahead, the neck down, the muzzle in the
      grass; it tears at it (the head lifts a little twice a loop) and chews; the tail flicks. */
  function grazeSet(t, pT) {
    const b = t.build;
    farmBase(b);
    const tear = 0.5 - 0.5 * Math.cos(TAU * 2 * pT); // 0 in the grass .. 1 lifted a little
    PT[Q_HIPY] = b.hipH;
    PT[Q_SHOY] = b.shH - b.len * b.grazeDrop;
    PT[Q_HEAD] = b.grazeHead - 0.1 * tear;
    PT[Q_TAILUP] = b.tailUp + 0.2;
    PT[Q_JAW] = 0.05 + 0.12 * (0.5 - 0.5 * Math.cos(TAU * CHEWS * pT));
    PT[Q_HEADROLL] = 0.05;
    for (let i = 0; i < NLEG; i++) {
      const l = LEGS[i];
      if (l < 2) legStand(b, l, b.footW * 0.25, b.len * 0.12);
      else legStand(b, l, 0, -b.len * 0.03);
    }
    PT[Q_NECK] = neckFor(b, b.snout[2] + 0.004 + tear * b.head[1] * 0.3, PT[Q_HEAD], 0);
  }
  /** Pecking (a hen): tipped forward, her neck reaching down, looking; twice a loop her beak stabs the ground, fast,
      and comes back up slower to hover over it. */
  function peckSet(t, pT) {
    const b = t.build;
    farmBase(b);
    const q = frac(PECKS * pT);
    const dip = q < 0.18 ? smooth(q / 0.18) : q < 0.6 ? 1 - smooth((q - 0.18) / 0.42) : 0; // 1 at the ground
    PT[Q_HIPY] = b.hipH + b.len * 0.08;
    PT[Q_SHOY] = b.shH - b.len * b.peckDrop;
    PT[Q_HEAD] = b.peckHead + 0.3 * dip;
    PT[Q_BOB] = b.neck[0] * 0.35 * dip;
    PT[Q_TAILUP] = b.tailUp + 0.15;
    for (let i = 0; i < NLEG; i++) legStand(b, LEGS[i], 0, 0);
    PT[Q_NECK] = neckFor(b, b.snout[2] + 0.002 + b.head[1] * 1.6 * (1 - dip), PT[Q_HEAD], PT[Q_BOB]);
  }
  /** Flapping (a hen): up on her toes, her chest lifted, wings spread and beating (BEATS a loop), her tail fanned up;
      her body lifts a little with each downstroke. */
  function flapSet(t, pT) {
    const b = t.build;
    farmBase(b);
    const beat = Math.sin(TAU * BEATS * pT); // 1 up .. -1 down
    PT[Q_HIPY] = b.hipH + b.len * 0.05 - 0.003 * beat;
    PT[Q_SHOY] = b.shH + b.len * 0.45 - 0.003 * beat;
    PT[Q_NECK] = b.neckAng + 0.1;
    PT[Q_HEAD] = b.headPitch - 0.2;
    PT[Q_TAILUP] = b.tailUp + 0.25;
    PT[Q_WING] = 1;
    PT[Q_WUP] = 0.3 + 0.75 * beat;
    PT[Q_JAW] = 0;
    for (let i = 0; i < NLEG; i++) legStand(b, LEGS[i], b.footW * 0.2, 0);
  }
  /** A hen sitting (a biped's "sit"): settled on her belly, her legs folded under her, her head drawn in, her tail up;
      she breathes. */
  function nestSet(t, pT) {
    const b = t.build;
    farmBase(b);
    const breath = 0.003 * Math.sin(TAU * pT);
    PT[Q_HIPY] = t.bellyHip + breath;
    PT[Q_SHOY] = t.bellySho + b.len * 0.12 + breath;
    PT[Q_NECK] = b.sitNeck;
    PT[Q_HEAD] = b.headPitch + 0.05;
    PT[Q_BOB] = -b.neck[0] * 0.25;
    PT[Q_TAILUP] = b.tailUp + 0.1;
    for (let i = 0; i < NLEG; i++) {
      const l = LEGS[i];
      const s = l & 1 ? 1 : -1;
      const o = Q_LEG + l * QL;
      PT[o] = s * b.footW * 0.75;
      PT[o + 1] = b.pawR;
      PT[o + 2] = -b.len / 2 + b.hindZ + b.pastern[1] * 0.4;
      PT[o + 3] = PI / 2 - 0.15;
      PT[o + 4] = 0.35;
      PT[o + 5] = 0.3;
    }
  }
  /** A bleat (pT through one): the head comes up, nose high, the mouth opens and holds open, wavering, then closes;
      the tail flicks up. The comic's lines fly from the mouth as for a bark. */
  function bleatSet(t, pT) {
    const b = t.build;
    farmBase(b);
    const k = pT < 0.15 ? smooth(pT / 0.15) : pT < 0.72 ? 1 : 1 - smooth((pT - 0.72) / 0.28);
    const waver = Math.sin(TAU * 9 * pT) * k;
    RG[BARKK] = 0.85 * k;
    PT[Q_HIPY] = b.hipH;
    PT[Q_SHOY] = b.shH + 0.004 * k;
    PT[Q_NECK] = b.neckAng + 0.3 * k;
    PT[Q_HEAD] = b.headPitch - 0.6 * k + 0.03 * waver;
    PT[Q_TAILUP] = b.tailUp + 0.35 * k;
    PT[Q_JAW] = 0.1 + 0.65 * k + 0.08 * waver;
    PT[Q_EAR] = 0.3 * k;
    for (let i = 0; i < NLEG; i++) {
      const l = LEGS[i];
      if (l < 2) legStand(b, l, b.footW * 0.15, b.len * 0.06);
      else legStand(b, l, 0, 0);
    }
  }

  /** Fill J (and the frames, the jaw, the wag) for type t in state st. Every input is sanitised. */
  function solve(t, st) {
    const b = t.build;
    const run = clamp01(+st.run);
    RUNNING = run > 0;
    let g = t.gait;
    if (RUNNING) {
      g = t.gaitMix;
      for (let i = 0; i < t.gaitKeys.length; i++) {
        const k = t.gaitKeys[i];
        g[k] = t.gait[k] + (t.gaitRun[k] - t.gait[k]) * run;
      }
      for (let l = 0; l < 4; l++) g.phase[l] = t.gait.phase[l] + (t.gaitRun.phase[l] - t.gait.phase[l]) * run;
    }
    let pose = POSES.indexOf(st.pose);
    if (pose < 0 || !t.has[pose]) pose = P_STAND;
    POSE = pose;
    const pw = st.poseW == null || !Number.isFinite(+st.poseW) ? 1 : clamp01(+st.poseW);
    const mv = Number.isFinite(+st.move) ? clamp01(+st.move) : 0;
    const over = pose !== P_STAND && pose !== P_WALK ? pw : 0; // how far into a pose of its own
    // (it stops walking as it sits, lies down, barks or zaps)
    const m = mv * (1 - over);
    const pT = clamp01(+st.poseT);
    const ph = frac(Number.isFinite(+st.gait) ? +st.gait : 0);
    LIT = t.skin === "metal";
    RG[BARKK] = 0;
    RG[ZAPK] = 0;
    baseSet(t, g, m, ph, pT);
    if (over > 0) {
      if (pose === P_SIT && t.plan === "biped") nestSet(t, pT);
      else if (pose === P_SIT) sitSet(t, pT);
      else if (pose === P_LIE) lieSet(t, pT, false);
      else if (pose === P_OFF) lieSet(t, pT, true);
      else if (pose === P_GRAZE) grazeSet(t, pT);
      else if (pose === P_PECK) peckSet(t, pT);
      else if (pose === P_FLAP) flapSet(t, pT);
      else if (pose === P_BLEAT) bleatSet(t, pT);
      else braceSet(t, pT, pose === P_ZAP);
      // the pose's own numbers in, by its weight: smoothed, so it eases in and settles
      const w = smooth(over);
      for (let i = 0; i < NQ; i++) PP[i] = PB[i] + (PT[i] - PB[i]) * w;
      RG[BARKK] *= w;
      RG[ZAPK] *= w;
      // (a shut-down robot's lights cut out halfway down as it slumps)
      if (pose === P_OFF && over > 0.5) LIT = false;
    } else for (let i = 0; i < NQ; i++) PP[i] = PB[i];
    RG[LYING] = pose === P_LIE || pose === P_OFF || (pose === P_SIT && t.plan === "biped") ? smooth(over) : 0;

    // the spine and the body's frame (forward from the hips to the withers; up as near the world's up as it goes)
    setJ(HIP, 0, PP[Q_HIPY], PP[Q_HIPZ]);
    setJ(SHO, 0, PP[Q_SHOY], PP[Q_SHOZ]);
    let fy = PP[Q_SHOY] - PP[Q_HIPY];
    let fz = PP[Q_SHOZ] - PP[Q_HIPZ];
    const fl = hyp2(fy, fz) || 1;
    fy /= fl;
    fz /= fl;
    RG[PITCH] = Math.atan2(fy, fz);
    BF[6] = 0;
    BF[7] = fy;
    BF[8] = fz;
    // up: the world's up less its share along forward
    BF[3] = 0;
    BF[4] = fz;
    BF[5] = -fy;
    BF[0] = 1;
    BF[1] = 0;
    BF[2] = 0;
    rot(BF, 1, 0, PP[Q_ROLL]);

    // the legs: top joints on the body, the paw where the pose puts it, the pastern up from the paw by its angle, and
    // the two bones between by a reach toward the knee's way (fore: the elbow back; hind: the stifle forward)
    for (let i = 0; i < NLEG; i++) {
      const l = LEGS[i];
      const fore = l < 2 && t.plan === "quad";
      const s = l & 1 ? 1 : -1;
      const top = LJ(l, 0);
      if (fore) offJ(top, SHO, BF, s * b.shW, -b.shDrop, b.shFwd);
      else offJ(top, HIP, BF, s * b.hipW, -b.hipDrop, b.hipFwd);
      const o = Q_LEG + l * QL;
      const bones = fore ? b.fore : b.hind;
      const pas = fore ? b.pastern[0] : b.pastern[1];
      const paw = LJ(l, 3);
      const low = LJ(l, 2);
      setJ(paw, PP[o], PP[o + 1], PP[o + 2]);
      const a = PP[o + 3];
      setJ(low, PP[o], PP[o + 1] + pas * Math.cos(a), PP[o + 2] - pas * Math.sin(a));
      const sp = PP[o + 4];
      if (fore) ik(top, LJ(l, 1), low, bones[0], bones[1], s * sp, PP[o + 5], -1, paw);
      else ik(top, LJ(l, 1), low, bones[0], bones[1], s * sp, PP[o + 5], 1, paw);
    }
    // a biped's wings: the root at the shoulder, the tip back along its side folded (a little down), spread out to its
    // side at the wingbeat's angle (a little back)
    if (t.plan === "biped" && b.wing) {
      const wg = b.wing;
      const sp = PP[Q_WING];
      const ce = Math.cos(PP[Q_WUP]);
      const se = Math.sin(PP[Q_WUP]);
      for (let w = 0; w < 2; w++) {
        const s = w ? 1 : -1;
        const r0 = WNG + w * 2;
        offJ(r0, SHO, BF, s * wg.x, wg.u, wg.f);
        offJ(r0 + 1, r0, BF, s * (0.004 * (1 - sp) + wg.len * ce * sp), wg.len * (se * sp - 0.1 * (1 - sp)), -wg.len * (1 - 0.8 * sp));
      }
    } else for (let k = 0; k < 4; k++) setJ(WNG + k, J[SHO * 3], J[SHO * 3 + 1], J[SHO * 3 + 2]);

    // neck and head: up from the withers at the neck's angle; the head turns toward headYaw (the neck takes a share)
    let hy = num(st.headYaw, 0);
    hy = hy > HEAD_YAW_MAX ? HEAD_YAW_MAX : hy < -HEAD_YAW_MAX ? -HEAD_YAW_MAX : hy;
    frameSet(NF, BF);
    rot(NF, 1, 0, -PP[Q_ROLL]); // (the neck stays upright: the body rolls under it)
    rot(NF, 2, 0, hy * NECK_SHARE);
    const na = PP[Q_NECK] - RG[PITCH];
    // (a hen thrusts her head forward along it: Q_BOB)
    offJ(NEC, SHO, NF, 0, Math.sin(na) * b.neck[0], b.neckFwd + Math.cos(na) * b.neck[0] + PP[Q_BOB]);
    // the head: level, turned, pitched by the pose, tilted
    frameSet(HF, null);
    rot(HF, 2, 0, hy);
    rot(HF, 1, 2, PP[Q_HEAD]);
    rot(HF, 1, 0, PP[Q_HEADROLL] * (SEED & 1 ? 1 : -1) + PP[Q_ROLL] * 0.5);
    offJ(HED, NEC, HF, 0, b.headUp, b.headFwd);
    const sn = b.snout;
    offJ(SNT, HED, HF, 0, sn[3], sn[4] + sn[0]);
    RG[JAW] = clamp01(PP[Q_JAW]);
    RG[EAR] = clamp01(PP[Q_EAR]);

    // the tail: from the rump, back and up by its angle, bending more at each joint, wagging side to side
    const wag = st.wag == null || !Number.isFinite(+st.wag) ? 0.5 : clamp01(+st.wag);
    // (the same number of wags a loop in every pose, so a pose change never jumps the tail; a zap holds it stiffer, and
    // a shut-down robot's tail goes still as it slumps)
    const still = pose === P_OFF ? smooth(over) : pose === P_ZAP ? 0.7 * smooth(over) : 0;
    RG[WAGA] = wag * b.wagAmp * Math.sin(TAU * WAGS * pT) * (1 - 0.6 * RG[LYING]) * (1 - still);
    offJ(TB, HIP, BF, 0, b.tailAt[0], b.tailAt[1]);
    if (b.tail[0] > 0) {
      frameSet(NF, null);
      rot(NF, 2, 0, PI + RG[WAGA] + PP[Q_TAILSIDE] * (SEED & 2 ? 1 : -1)); // forward is now back along the body
      rot(NF, 1, 2, -(PP[Q_TAILUP] + RG[PITCH] * 0.6)); // tip up
      frameSet(TF, NF); // (a tail fan spreads in this frame: its forward and up)
      const seg = b.tail[0] / 3;
      for (let k = 0; k < 3; k++) {
        offJ(TM + k, TB + k, NF, 0, 0, seg);
        rot(NF, 1, 2, -PP[Q_TAILCURL]);
        rot(NF, 2, 0, RG[WAGA] * 0.35);
      }
      // nothing under the floor: a tail laid down rests on it
      for (let k = 1; k < 4; k++) if (J[(TB + k) * 3 + 1] < b.tail[2]) J[(TB + k) * 3 + 1] = b.tail[2];
    } else for (let k = 1; k < 4; k++) setJ(TB + k, J[TB * 3], J[TB * 3 + 1], J[TB * 3 + 2]);

    // breathing (the chest swells a little) and the reach around each joint (for the fit and the ground)
    RG[BREATH] = pose === P_OFF ? 0 : V.pant && (pose === P_STAND || pose === P_WALK || pose === P_SIT) ? Math.sin(TAU * PANTS * pT) : Math.sin(TAU * pT);
    // the ears' tips and the antenna's (the fit's points: they stick out past the skull)
    const h = b.head;
    const ears = V.ears;
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1;
      const k = ears ? ears[i] : null;
      const E = k === "flop" ? EAR_FLOP : k === "tri" ? EAR_TRI : k === "side" ? EAR_SIDE : EAR_UP;
      const sz = b.ear || 1;
      if (!k) offJ(EART + i, HED, HF, 0, 0, 0);
      else if (k === "flop") offJ(EART + i, HED, HF, s * E[9] * h[0] * sz, (E[10] * 0.6 + RG[EAR]) * h[1] * sz, E[11] * h[2]);
      else offJ(EART + i, HED, HF, s * E[6] * h[0] * sz, E[7] * h[1] * sz, E[8] * h[2]);
    }
    if (b.antenna) {
      const dr = PP[Q_ANT] * 1.3;
      offJ(ANT, HED, HF, -h[0] * 0.5, h[1] + b.antenna[0] * Math.cos(dr), -h[2] * 0.45 - b.antenna[0] * (0.25 + Math.sin(dr)));
    } else offJ(ANT, HED, HF, 0, 0, 0);
    // the horns' tips, or a comb's crest (the fit's points: they stand up off the skull)
    for (let i = 0; i < 2; i++) {
      if (b.horns) {
        hornPt(b, i ? 1 : -1, HORN_SEGS);
        offJ(HRN + i, HED, HF, HP[0], HP[1], HP[2]);
      } else if (b.comb) offJ(HRN + i, HED, HF, 0, h[1] + b.comb[0], (i ? -0.3 : 0.3) * b.comb[1]);
      else offJ(HRN + i, HED, HF, 0, 0, 0);
    }
    const rb = t.reach;
    JR[HRN] = JR[HRN + 1] = b.horns ? b.horns[1] : b.comb ? b.comb[0] * 0.35 : 0;
    JR[HIP] = rb.hip;
    JR[SHO] = rb.sho;
    JR[NEC] = rb.neck;
    JR[HED] = rb.head;
    JR[SNT] = rb.snout;
    JR[EART] = JR[EART + 1] = rb.ear;
    JR[ANT] = b.antenna ? b.antenna[2] * 1.4 : 0;
    for (let k = 0; k < 4; k++) JR[TB + k] = rb.tail;
    for (let l = 0; l < 4; l++) {
      JR[LJ(l, 0)] = rb.legTop;
      JR[LJ(l, 1)] = rb.leg;
      JR[LJ(l, 2)] = rb.leg;
      JR[LJ(l, 3)] = b.pawR;
    }
    for (let k = 0; k < 4; k++) JR[WNG + k] = rb.wing;
    for (let j = 0; j < NJ; j++) GR[j] = JR[j];
    for (let l = 0; l < 4; l++) {
      GR[LJ(l, 1)] = l < 2 && t.plan === "quad" ? b.legR[1] : b.legR[3];
      GR[LJ(l, 2)] = b.legR[4];
    }
    GR[HIP] = t.bellyHip;
    GR[SHO] = t.bellySho;
    // (a box head reaches lower than its middle by its corners when it tips)
    GR[HED] = t.skin === "metal" ? hyp2(h[1], h[2]) : h[1];
    GR[SNT] = t.skin === "metal" ? hyp2(b.snout[1], b.snout[2]) : b.snout[2];
    GR[EART] = GR[EART + 1] = GR[ANT] = 0;
    for (let k = 0; k < 4; k++) GR[WNG + k] = 0; // (a wing is on its side: it never props it up off the ground)
    // a biped's fore leg slots stay with its body (unused)
    if (t.plan === "biped") for (let l = 0; l < 2; l++) for (let k = 0; k < 4; k++) setJ(LJ(l, k), J[SHO * 3], J[SHO * 3 + 1], J[SHO * 3 + 2]);
    // rest on the ground: nothing below it (the tail and the ears' tips aside: they lie on the floor or hang)
    let lowY = Infinity;
    for (let j = 0; j < NJ; j++) {
      if ((j >= TB && j <= TT) || j >= EART) continue;
      lowY = Math.min(lowY, J[j * 3 + 1] - GR[j]);
    }
    if (lowY < 0) for (let j = 0; j < NJ; j++) J[j * 3 + 1] -= lowY;
  }

  /* ---------- Projection ---------- */
  /** The perspective scale of a point at depth D (tiles, + away from the camera) in front of the figure's middle. */
  function kAt(D) {
    const den = RG[DIST] + D;
    const k = den > RG[DIST] / K_MAX ? RG[DIST] / den : K_MAX;
    return k < K_MIN ? K_MIN : k;
  }
  /** Model point -> screen (QX, QY) and scale QK (px per tile = PXS * QK). rb: how far the part reaches below the point,
      so nothing is drawn under the floor line. */
  function proj(x, y, z, rb) {
    const X = -(x * RG[CYAW] + z * RG[SYAW]);
    const k = kAt(x * RG[SYAW] - z * RG[CYAW]);
    RG[QX] = RG[W2] + X * RG[PXS] * k * RG[FIT];
    RG[QY] = FLR[0] - (RG[EYE] - (RG[EYE] - y) * k) * RG[PXS] * RG[FIT];
    const low = (FLR[1] > 0 ? FLR[0] - RG[EYE] * (1 - k) * RG[PXS] * RG[FIT] : RG[CH]) - rb * RG[PXS] * k * RG[FIT];
    if (RG[QY] > low) RG[QY] = low;
    RG[QK] = k * RG[FIT];
  }
  const projJ = (j) => proj(J[j * 3], J[j * 3 + 1], J[j * 3 + 2], JR[j]);
  const depth = (x, z) => x * RG[SYAW] - z * RG[CYAW];
  const jDepth = (j) => depth(J[j * 3], J[j * 3 + 2]);
  /** A model direction n faces the camera by this much (-1..1). */
  const facing = (nx, nz) => nx * RG[TCX] + nz * RG[TCZ];

  /* ---------- Fit: how much a figure is shrunk about its feet to stay inside its region ----------
     From an envelope of every pose, worked out once per type in addType (see Walker3D): the farthest any part reaches
     from the vertical through the feet (rh), and the highest points against how far out they are. The pose being
     drawn is checked too, as a safety net. A point below the eye shows highest from the far side (a dog is all
     below a grown-up's eye), one above it from the near side. */
  const ENV_MAX = 24; // SCALE: most frontier points kept per type (only the outermost few ever matter)
  function envFit(env, wlim, pad) {
    const R = env.rh;
    let hx = 0;
    for (let k = 0; k <= 4; k++) {
      const sn = -k / 4;
      const v = R * Math.sqrt(1 - sn * sn) * kAt(R * sn);
      if (v > hx) hx = v;
    }
    let top = 0;
    for (let i = 0; i < env.n; i++) {
      const rho = env.rho[i];
      const y = env.top[i] - RG[EYE];
      const v = RG[EYE] + y * (y < 0 ? Math.min(kAt(-rho), kAt(rho)) : Math.max(kAt(-rho), kAt(rho)));
      if (v > top) top = v;
    }
    let f = 1;
    if (hx > 0) f = Math.min(f, (wlim - pad) / (hx * RG[PXS]));
    if (top > 0) f = Math.min(f, (FLR[0] - pad) / (top * RG[PXS]));
    return f > 0.05 ? f : 0.05;
  }
  function fit() {
    const pad = 1 + RG[OUT];
    const w = RUNNING && T.wRun ? T.wRun : T.w;
    RG[FIT_ENV] = envFit(RUNNING ? T.envRun : T.env, Math.min(RG[W2], FLR[1] > 0 ? (w * RG[PXS]) / 2 + pad : (w * RG[PXS]) / 2), pad);
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
  /** Centre c and up to three half-axis vectors a, b, g (model tiles; pass zeros for a flat one) -> EX, EY, ERA, ERB,
      ERO. Kept above the floor line. */
  function ellipsoid(cx, cy, cz, ax, ay, az, bx, by, bz, gx, gy, gz) {
    proj(cx, cy, cz, 0);
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
    const sn = Math.sin(RG[ERO]);
    const cs = Math.cos(RG[ERO]);
    const ext = Math.sqrt(RG[ERA] * RG[ERA] * sn * sn + RG[ERB] * RG[ERB] * cs * cs);
    if (RG[EY] + ext > FLR[0] + FLR[1]) RG[EY] = FLR[0] + FLR[1] - ext;
  }
  /** An ellipsoid on frame F's axes at joint j + F (r, u, f), radii (ra across, rb up, rc forward). */
  function ellF(F, j, r, u, f, ra, rb, rc) {
    const o = j * 3;
    ellipsoid(J[o] + F[0] * r + F[3] * u + F[6] * f, J[o + 1] + F[1] * r + F[4] * u + F[7] * f, J[o + 2] + F[2] * r + F[5] * u + F[8] * f, F[0] * ra, F[1] * ra, F[2] * ra, F[3] * rb, F[4] * rb, F[5] * rb, F[6] * rc, F[7] * rc, F[8] * rc);
  }
  /** An ellipsoid along the bone from joint a to b: its middle t of the way, half-length hl, radius r (round across). */
  function ellAlong(a, b, t, hl, r) {
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
    // two directions square to the bone (one across the body)
    let px = dy * BF[8] - dz * BF[7];
    let py = dz * BF[6] - dx * BF[8];
    let pz = dx * BF[7] - dy * BF[6];
    let pl = hyp3(px, py, pz);
    if (pl < 1e-3) {
      px = BF[0];
      py = BF[1];
      pz = BF[2];
      pl = 1;
    }
    px /= pl;
    py /= pl;
    pz /= pl;
    const qx = dy * pz - dz * py;
    const qy = dz * px - dx * pz;
    const qz = dx * py - dy * px;
    ellipsoid(ax + dx * l * t, ay + dy * l * t, az + dz * l * t, dx * hl, dy * hl, dz * hl, px * r, py * r, pz * r, qx * r, qy * r, qz * r);
  }

  /* ---------- Path calls, kept inside the region ---------- */
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
  /** The current ellipse (EX..) as its own sub-path, grown by `grow` px. */
  function ellSub(grow) {
    elSub(RG[EX], RG[EY], RG[ERA] + grow, RG[ERB] + grow, RG[ERO]);
  }
  /** Fill the current ellipse and ink its edge. */
  function ellInk(fill, lw) {
    G.beginPath();
    ellSub(0);
    G.fillStyle = fill;
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = lw || Math.min(RG[OUT] * 1.6, Math.max(0.7, RG[ERB] * 0.4));
    G.stroke();
  }
  function seg(x0, y0, x1, y1) {
    G.beginPath();
    mt(x0, y0);
    lt(x1, y1);
    G.stroke();
  }
  /** The side of a stroke from (x0,y0) to (x1,y1) away from the light, as a unit offset (NX, NY). */
  function shadeSide(x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const l = hyp2(dx, dy) || 1;
    RG[NX] = -dy / l;
    RG[NY] = dx / l;
    if (RG[NX] * SLX + RG[NY] * SLY > 0) {
      RG[NX] = -RG[NX];
      RG[NY] = -RG[NY];
    }
  }
  /** A soft shine on the upper left of the current ellipse. */
  function shine(a, k) {
    const s = k || 1;
    G.beginPath();
    ellA(RG[EX] + SLX * RG[ERA] * 0.32, RG[EY] + SLY * RG[ERB] * 0.42, RG[ERA] * 0.34 * s, RG[ERB] * 0.22 * s, RG[ERO], 0, TAU);
    G.fillStyle = col(WHITE, 1, a);
    G.fill();
  }
  /** A shadow crescent inside the current ellipse, on the side away from the light. */
  function crescent(a, dep) {
    const sa = Math.atan2(-SLY, -SLX) - RG[ERO];
    const dx = -Math.cos(sa + RG[ERO]) * RG[ERA] * dep;
    const dy = -Math.sin(sa + RG[ERO]) * RG[ERB] * dep;
    G.beginPath();
    ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], sa - 1.5, sa + 1.5, false);
    ellA(RG[EX] + dx, RG[EY] + dy, RG[ERA] * 0.94, RG[ERB] * 0.96, RG[ERO], sa + 1.5, sa - 1.5, true);
    G.closePath();
    G.fillStyle = col(BLACK, 1, a);
    G.fill();
  }

  /* ---------- Ground: the contact shadow ---------- */
  function projG(x, z) {
    const k = kAt(x * RG[SYAW] - z * RG[CYAW]);
    RG[GX] = RG[W2] - (x * RG[CYAW] + z * RG[SYAW]) * RG[PXS] * k * RG[FIT];
    RG[GY] = FLR[0] - RG[EYE] * (1 - k) * RG[PXS] * RG[FIT];
  }
  /** A disc on the floor, centre (cx, cz), half-axes ra along (ux, uz) (unit) and rb square to it, seen in perspective. */
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
    if (LOD > 1 || !SHADOW) return;
    // under the body, longer along it
    const cx = (J[HIP * 3] + J[SHO * 3]) / 2;
    const cz = (J[HIP * 3 + 2] + J[SHO * 3 + 2]) / 2;
    const b = T.build;
    groundEll(cx, cz, 0, 1, b.shadow[1] * (1 + 0.15 * RG[LYING]), b.shadow[0] * (1 + 0.3 * RG[LYING]));
    const m = RG[OUT] + 1;
    const ext = Math.max(RG[ERA], RG[ERB]);
    const room = Math.min(RG[EX] - m, RG[CW] - m - RG[EX]);
    if (ext > room && room > 0.5) {
      RG[ERA] *= room / ext;
      RG[ERB] *= room / ext;
    }
    if (RG[ERB] > RG[CH] / 2) RG[ERB] = RG[CH] / 2;
    G.beginPath();
    ellA(RG[EX], RG[EY], RG[ERA], RG[ERB], RG[ERO], 0, TAU);
    G.fillStyle = "rgba(0,0,0,0.3)";
    G.fill();
  }

  /* ---------- Blobs: several ellipsoids filled as one shape under one ink line (a fur body, a head) ---------- */
  // SCALE: ellipsoids one blob may join (a body: rump, belly, chest, neck and four upper legs)
  const BLOB_MAX = 12;
  const BLP = new Float64Array(BLOB_MAX * 5); // each: x, y, a, b, rotation (px)
  let BN = 0;
  /** Keep the current ellipse (EX..) in the blob. */
  function blobPush() {
    if (BN >= BLOB_MAX) return;
    const o = BN * 5;
    BLP[o] = RG[EX];
    BLP[o + 1] = RG[EY];
    BLP[o + 2] = RG[ERA];
    BLP[o + 3] = RG[ERB];
    BLP[o + 4] = RG[ERO];
    BN++;
  }
  /** Blob item i back into EX.. (for its shading). */
  function blobGet(i) {
    const o = i * 5;
    RG[EX] = BLP[o];
    RG[EY] = BLP[o + 1];
    RG[ERA] = BLP[o + 2];
    RG[ERB] = BLP[o + 3];
    RG[ERO] = BLP[o + 4];
  }
  /** The blob: ink (every ellipse grown by the outline), then its colour over it: one clean outline round them all. */
  function blobDraw(fill) {
    for (let pass = 0; pass < 2; pass++) {
      const grow = pass ? 0 : RG[OUT];
      G.beginPath();
      for (let i = 0; i < BN; i++) {
        const o = i * 5;
        elSub(BLP[o], BLP[o + 1], BLP[o + 2] + grow, BLP[o + 3] + grow, BLP[o + 4]);
      }
      G.fillStyle = pass ? fill : INKS;
      G.fill();
    }
  }

  /* ---------- Boxes (the metal skin): a box on a frame, its faces that look at the camera, each lit, inked ---------- */
  const BXC = new Float64Array(8 * 3); // corners, model
  const BXS = new Float64Array(8 * 2); // corners, screen
  const BXF = new Float64Array(9); // the box's frame
  const BXO = new Float64Array(3); // its centre
  const BXH = new Float64Array(3); // its half sizes (across, up, along)
  // the six faces: the axis (0 across, 1 up, 2 along), its side, the four corners (counter-clockwise from outside)
  const FACES = [
    [0, 1, 1, 3, 7, 5],
    [0, -1, 0, 4, 6, 2],
    [1, 1, 2, 6, 7, 3],
    [1, -1, 0, 1, 5, 4],
    [2, 1, 4, 5, 7, 6],
    [2, -1, 0, 2, 3, 1],
  ];
  /** Set the box: centre (model), frame F, half sizes; works out its corners on screen. Corner i: bit 0 across, bit 1
      up, bit 2 along (0 the minus side). */
  function boxSet(cx, cy, cz, F, hr, hu, hf) {
    for (let k = 0; k < 9; k++) BXF[k] = F[k];
    BXO[0] = cx;
    BXO[1] = cy;
    BXO[2] = cz;
    BXH[0] = hr;
    BXH[1] = hu;
    BXH[2] = hf;
    for (let i = 0; i < 8; i++) {
      const r = i & 1 ? hr : -hr;
      const u = i & 2 ? hu : -hu;
      const f = i & 4 ? hf : -hf;
      const x = cx + F[0] * r + F[3] * u + F[6] * f;
      const y = cy + F[1] * r + F[4] * u + F[7] * f;
      const z = cz + F[2] * r + F[5] * u + F[8] * f;
      BXC[i * 3] = x;
      BXC[i * 3 + 1] = y;
      BXC[i * 3 + 2] = z;
      proj(x, y, z, 0);
      BXS[i * 2] = RG[QX];
      BXS[i * 2 + 1] = RG[QY];
    }
  }
  /** How much face f of the current box looks at the camera (> 0: it shows). */
  function boxFacing(f) {
    const ax = FACES[f][0];
    const sd = FACES[f][1];
    const nx = BXF[ax * 3] * sd;
    const ny = BXF[ax * 3 + 1] * sd;
    const nz = BXF[ax * 3 + 2] * sd;
    const h = BXH[ax];
    const vx = RG[CAMX] - (BXO[0] + nx * h);
    const vy = RG[CAMY] - (BXO[1] + ny * h);
    const vz = RG[CAMZ] - (BXO[2] + nz * h);
    return (nx * vx + ny * vy + nz * vz) / (hyp3(vx, vy, vz) || 1);
  }
  /** The light on face f of the current box: the camera-space light on its normal. */
  function boxLight(f) {
    const ax = FACES[f][0];
    const sd = FACES[f][1];
    const nx = BXF[ax * 3] * sd;
    const ny = BXF[ax * 3 + 1] * sd;
    const nz = BXF[ax * 3 + 2] * sd;
    const cx = -(nx * RG[CYAW] + nz * RG[SYAW]);
    const cz = nx * RG[SYAW] - nz * RG[CYAW];
    const d = cx * LX + ny * LY + cz * LZ;
    // (in steps of 1/16: a face turning through the light changes colour a few times, so the colour table converges)
    return Math.round((0.84 + 0.3 * (d > 0 ? d : d * 0.4)) * 16) / 16;
  }
  /** Draw the current box: each face that shows, lit, then its edges in ink (lod 2: one fill and one ink for all). */
  function boxDraw(c) {
    const flat = LOD === 2;
    if (flat) G.beginPath();
    for (let f = 0; f < 6; f++) {
      if (boxFacing(f) <= 0.001) continue;
      const q = FACES[f];
      if (!flat) G.beginPath();
      mt(BXS[q[2] * 2], BXS[q[2] * 2 + 1]);
      for (let k = 3; k < 6; k++) lt(BXS[q[k] * 2], BXS[q[k] * 2 + 1]);
      G.closePath();
      if (flat) continue;
      G.fillStyle = col(c, boxLight(f), 1);
      G.fill();
      G.strokeStyle = INKS;
      G.lineWidth = RG[OUT] * 1.5;
      G.stroke();
    }
    if (flat) {
      G.fillStyle = col(c, 0.95, 1);
      G.fill();
      G.strokeStyle = INKS;
      G.lineWidth = RG[OUT] * 1.5;
      G.stroke();
    }
  }
  /** A point on face f of the current box at face-local (a, b) in -1..1 (its two other axes, in order), lifted d tiles
      off it: to QX, QY. */
  function boxPt(f, a, b, d) {
    const ax = FACES[f][0];
    const sd = FACES[f][1];
    const a1 = ax === 0 ? 1 : 0;
    const a2 = ax === 2 ? 1 : 2;
    const h = BXH[ax] + d;
    const x = BXO[0] + BXF[ax * 3] * sd * h + BXF[a1 * 3] * a * BXH[a1] + BXF[a2 * 3] * b * BXH[a2];
    const y = BXO[1] + BXF[ax * 3 + 1] * sd * h + BXF[a1 * 3 + 1] * a * BXH[a1] + BXF[a2 * 3 + 1] * b * BXH[a2];
    const z = BXO[2] + BXF[ax * 3 + 2] * sd * h + BXF[a1 * 3 + 2] * a * BXH[a1] + BXF[a2 * 3 + 2] * b * BXH[a2];
    proj(x, y, z, 0);
  }
  /** A quad on face f from (a0, b0) to (a1, b1) (face-local), added to the path. */
  function boxQuad(f, a0, b0, a1, b1) {
    boxPt(f, a0, b0, 0.0015);
    mt(RG[QX], RG[QY]);
    boxPt(f, a1, b0, 0.0015);
    lt(RG[QX], RG[QY]);
    boxPt(f, a1, b1, 0.0015);
    lt(RG[QX], RG[QY]);
    boxPt(f, a0, b1, 0.0015);
    lt(RG[QX], RG[QY]);
    G.closePath();
  }

  /* ---------- The body ---------- */
  function drawBody() {
    const b = T.build;
    if (T.skin === "metal") return drawBodyMetal();
    // the blob: rump, belly and chest along the spine, the neck, and the upper legs (haunches and shoulders)
    BN = 0;
    const br = 1 + 0.025 * RG[BREATH];
    const hx = J[HIP * 3];
    const hy = J[HIP * 3 + 1];
    const hz = J[HIP * 3 + 2];
    const dx = J[SHO * 3] - hx;
    const dy = J[SHO * 3 + 1] - hy;
    const dz = J[SHO * 3 + 2] - hz;
    for (let i = 0; i < b.body.length; i++) {
      const e = b.body[i];
      const k = i === b.body.length - 1 ? br : 1;
      ellipsoid(hx + dx * e[0] + BF[3] * e[1], hy + dy * e[0] + BF[4] * e[1], hz + dz * e[0] + BF[5] * e[1], BF[0] * e[2] * k, BF[1] * e[2] * k, BF[2] * e[2] * k, BF[3] * e[3] * k, BF[4] * e[3] * k, BF[5] * e[3] * k, BF[6] * e[4], BF[7] * e[4], BF[8] * e[4]);
      blobPush();
    }
    const nb = BN;
    // (the neck stops at the head's base: seen from behind, the back of the skull shows over it)
    ellAlong(SHO, NEC, 0.42, b.neck[0] * 0.58, b.neck[1]);
    blobPush();
    for (let i = 0; i < NLEG; i++) {
      const l = LEGS[i];
      const fore = l < 2 && T.plan === "quad";
      const bones = fore ? b.fore : b.hind;
      ellAlong(LJ(l, 0), LJ(l, 1), fore ? 0.4 : 0.42, bones[0] * 0.62, fore ? b.legR[0] : b.legR[2]);
      blobPush();
    }
    blobDraw(col(V.fur, 1, 1));
    // patches on its flanks (look.flank, build.flank [[t hips..withers, up, along radius, up radius, side, out], ...]):
    // flat on the side that faces the camera; at every detail (a goat's patch is its mark from across the yard)
    if (V.flank && b.flank) {
      for (let i = 0; i < b.flank.length; i++) {
        const p = b.flank[i];
        const s = p[4];
        if (facing(BF[0] * s, BF[2] * s) < 0.15) continue;
        ellipsoid(hx + dx * p[0] + BF[0] * s * p[5] + BF[3] * p[1], hy + dy * p[0] + BF[1] * s * p[5] + BF[4] * p[1], hz + dz * p[0] + BF[2] * s * p[5] + BF[5] * p[1], BF[6] * p[2], BF[7] * p[2], BF[8] * p[2], BF[3] * p[3], BF[4] * p[3], BF[5] * p[3], 0, 0, 0);
        G.beginPath();
        ellSub(0);
        G.fillStyle = col(V.flank, 1, 1);
        G.fill();
      }
    }
    if (LOD === 2) return;
    // a lighter bib down the chest (seen from the front and the sides; look.bib false: none)
    if (V.light && V.bib !== false) {
      const e = b.body[b.body.length - 1];
      ellipsoid(hx + dx * e[0] + BF[6] * e[4] * 0.55 - BF[3] * e[3] * 0.2, hy + dy * e[0] + BF[7] * e[4] * 0.55 - BF[4] * e[3] * 0.2, hz + dz * e[0] + BF[8] * e[4] * 0.55 - BF[5] * e[3] * 0.2, BF[0] * e[2] * 0.6, BF[1] * e[2] * 0.6, BF[2] * e[2] * 0.6, BF[3] * e[3] * 0.62, BF[4] * e[3] * 0.62, BF[5] * e[3] * 0.62, BF[6] * e[4] * 0.45, BF[7] * e[4] * 0.45, BF[8] * e[4] * 0.45);
      const f = facing(BF[6], BF[8]);
      if (f > -0.2) {
        G.beginPath();
        ellSub(0);
        G.fillStyle = col(V.light, 1, 0.9);
        G.fill();
      }
    }
    if (LOD === 0) {
      // (one shade, on the belly's ellipsoid: a crescent on each made the body read as a row of balls)
      blobGet(Math.min(1, nb - 1));
      crescent(0.15, 0.3);
      shine(0.13);
      furTufts();
      // the near haunch's curve: a line on the coat where the thigh meets the body
      haunchLine();
    }
  }
  /** Scruff (lod 0): a few ragged tufts of different sizes hanging past the outline under the belly and the chest,
      the coat's colour with an ink edge, each tipped back a little (the fur lies that way). */
  function furTufts() {
    const b = T.build;
    const n = b.tufts || 0;
    // (only where the belly's edge is seen from the side: from the front or behind they would sit between the legs)
    if (!n || Math.abs(facing(BF[0], BF[2])) < 0.4) return;
    G.beginPath();
    for (let k = 0; k < n; k++) {
      const t = 0.3 + (0.72 * k) / Math.max(1, n - 1) + (rnd(705 + k) - 0.5) * 0.12;
      const e = t > 0.75 ? b.body[b.body.length - 1] : b.body[1];
      const down = e[3] * 0.92 - e[1];
      const x = J[HIP * 3] + (J[SHO * 3] - J[HIP * 3]) * t - BF[3] * down;
      const y = J[HIP * 3 + 1] + (J[SHO * 3 + 1] - J[HIP * 3 + 1]) * t - BF[4] * down;
      const z = J[HIP * 3 + 2] + (J[SHO * 3 + 2] - J[HIP * 3 + 2]) * t - BF[5] * down;
      proj(x, y, z, 0);
      const px = RG[QX];
      const py = RG[QY];
      // its size and lean on screen: back along the body
      const r = b.legR[0] * (0.45 + 0.35 * rnd(700 + k)) * RG[PXS] * RG[QK];
      proj(x - BF[6] * 0.02, y - BF[7] * 0.02, z - BF[8] * 0.02, 0);
      let bx = RG[QX] - px;
      let by = RG[QY] - py;
      const bl = hyp2(bx, by) || 1;
      bx = (bx / bl) * r * 0.7;
      by = (by / bl) * r * 0.7;
      mt(px - r * 0.9, py - r * 0.2);
      lt(px + bx * 0.6 - r * 0.2, py + r * 1.1 + by * 0.2);
      lt(px + r * 0.15, py + r * 0.1);
      lt(px + bx + r * 0.5, py + r * 0.8);
      lt(px + r * 0.95, py - r * 0.2);
    }
    G.fillStyle = col(V.fur, 0.95, 1);
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = Math.max(0.6, RG[OUT] * 0.6);
    G.stroke();
  }
  /** The near haunch's curve on the coat (lod 0): the front of the thigh's outline, an arc round from its top to
      the stifle, as the 2D dog has it. */
  function haunchLine() {
    if (T.plan === "biped") return; // (a bird's thigh is under its feathers)
    for (let i = 0; i < NLEG; i++) {
      const l = LEGS[i];
      if (l < 2 && T.plan === "quad") continue;
      const s = l & 1 ? 1 : -1;
      if (facing(BF[0] * s, BF[2] * s) < 0.3) continue;
      const b = T.build;
      ellAlong(LJ(l, 0), LJ(l, 1), 0.42, b.hind[0] * 0.62, b.legR[2]);
      // the way forward on screen, as an angle in the ellipse's own frame
      projJ(HIP);
      const x0 = RG[QX];
      const y0 = RG[QY];
      projJ(SHO);
      // (the point of the outline in that direction: x = a cos t, y = b sin t, so tan t = (a / b) tan of the angle)
      const fa = Math.atan2(RG[QY] - y0, RG[QX] - x0) - RG[ERO];
      const a0 = Math.atan2(RG[ERA] * Math.sin(fa), RG[ERB] * Math.cos(fa));
      G.beginPath();
      ellA(RG[EX], RG[EY], RG[ERA] * 0.92, RG[ERB] * 0.92, RG[ERO], a0 - 1.2, a0 + 0.5, false);
      G.strokeStyle = col(INK, 1, 0.5);
      G.lineWidth = Math.max(0.6, RG[OUT] * 0.75);
      G.stroke();
      return;
    }
  }
  /** A robot's body: a box along the spine, a shine down its back, panel seams, rivets and its badge. */
  function drawBodyMetal() {
    const b = T.build;
    const e = b.box;
    const cx = (J[HIP * 3] + J[SHO * 3]) / 2 + BF[3] * e[3];
    const cy = (J[HIP * 3 + 1] + J[SHO * 3 + 1]) / 2 + BF[4] * e[3];
    const cz = (J[HIP * 3 + 2] + J[SHO * 3 + 2]) / 2 + BF[5] * e[3];
    // the neck under it first: a thick dark tube from the chest up into the head
    neckTube();
    boxSet(cx, cy, cz, BF, e[0], e[1], e[2]);
    boxDraw(V.body);
    if (LOD === 2) return;
    // the top face: a shine along the back; the sides: seams, rivets, the badge
    if (boxFacing(2) > 0) {
      G.beginPath();
      boxQuad(2, -0.55, -0.7, 0.15, 0.55);
      G.fillStyle = col(V.light, 1, 0.85);
      G.fill();
    }
    for (let s = 0; s < 2; s++) {
      const f = s ? 0 : 1; // face 0: its right side; 1: its left
      if (boxFacing(f) <= 0.05) continue;
      if (LOD === 0) {
        G.beginPath();
        for (let k = 0; k < 2; k++) {
          const at = k ? 0.32 : -0.28;
          boxPt(f, -0.92, at, 0.0015);
          mt(RG[QX], RG[QY]);
          boxPt(f, 0.92, at, 0.0015);
          lt(RG[QX], RG[QY]);
        }
        G.strokeStyle = col(INK, 1, 0.45);
        G.lineWidth = Math.max(0.6, RG[OUT] * 0.6);
        G.stroke();
        // rivets along the top edge, over each leg
        G.beginPath();
        for (let k = 0; k < 4; k++) {
          boxPt(f, 0.62, k < 2 ? -0.86 + k * 0.12 : 0.74 + (k - 2) * 0.12, 0.002);
          const r = Math.max(0.6, 0.0032 * RG[PXS] * RG[QK]);
          elSub(RG[QX], RG[QY], r, r, 0);
        }
        G.fillStyle = col(V.joint, 1, 1);
        G.fill();
      }
      // the gold star badge (its memory chip behind it) on its right flank, by the shoulder
      if (f === 0) {
        G.beginPath();
        boxQuad(0, -0.05, 0.42, 0.45, 0.68);
        G.fillStyle = col(V.badge, boxLight(0) * 1.05, 1);
        G.fill();
        G.strokeStyle = INKS;
        G.lineWidth = Math.max(0.6, RG[OUT] * 0.8);
        G.stroke();
        if (LOD === 0) {
          // a five-point star stamped on it
          G.beginPath();
          for (let k = 0; k < 10; k++) {
            const a = -PI / 2 + (k * PI) / 5;
            const rr = k & 1 ? 0.42 : 1;
            boxPt(0, 0.2 + Math.sin(a) * 0.17 * rr, 0.55 + Math.cos(a) * 0.09 * rr, 0.003);
            if (k) lt(RG[QX], RG[QY]);
            else mt(RG[QX], RG[QY]);
          }
          G.closePath();
          G.fillStyle = col(V.badgeStar, 1, 1);
          G.fill();
        }
      }
    }
  }
  /** A robot's neck: a dark tube from the chest up into the head. */
  function neckTube() {
    const b = T.build;
    projJ(SHO);
    const x0 = RG[QX];
    const y0 = RG[QY];
    proj(J[NEC * 3], J[NEC * 3 + 1], J[NEC * 3 + 2], 0);
    const w = b.neck[1] * 2 * RG[PXS] * RG[QK];
    G.beginPath();
    mt(x0, y0);
    lt(RG[QX], RG[QY]);
    G.strokeStyle = INKS;
    G.lineWidth = w + RG[OUT] * 2;
    G.stroke();
    G.strokeStyle = col(V.dark, 1, 1);
    G.lineWidth = w;
    G.stroke();
  }

  /* ---------- Legs ---------- */
  /** Is leg l on the far side of the body (drawn in the darker coat)? Set as the parts are sorted. */
  const LFAR = new Uint8Array(4);
  const legFar = (l) => LFAR[l] === 1;
  function drawLeg(l) {
    // (a hen settled on her belly has her legs folded away under her)
    if (T.plan === "biped" && RG[LYING] > 0.85) return;
    if (LOD === 2) return drawLegsLow(l);
    const b = T.build;
    const fore = l < 2 && T.plan === "quad";
    const top = LJ(l, 0);
    const mid = LJ(l, 1);
    const low = LJ(l, 2);
    const paw = LJ(l, 3);
    const k = S[low * 3 + 2];
    const w1 = (fore ? b.legR[1] : b.legR[3]) * 2 * RG[PXS] * k;
    const w2 = b.legR[4] * 2 * RG[PXS] * k;
    const metal = T.skin === "metal";
    const far = legFar(l);
    // (look.legShade: the far legs' colour when the legs have their own, look.legCol)
    const c = metal ? (far ? V.dark : V.body) : far && V.legShade ? V.legShade : V.legCol || (far ? V.shade : V.fur);
    // (build.shinFeather: a hen's shin is in her feathers, only the shank below it bare)
    const cu = b.shinFeather ? (far ? V.shade : V.fur) : c;
    // ink for both bones, then the colour over them (one shape, no seam); fur starts the colour a little up the
    // upper bone so the tube's round top melts into the haunch
    const x0 = S[mid * 3];
    const y0 = S[mid * 3 + 1];
    const xs = metal ? S[top * 3] : x0 + (S[top * 3] - x0) * 0.35;
    const ys = metal ? S[top * 3 + 1] : y0 + (S[top * 3 + 1] - y0) * 0.35;
    for (let pass = 0; pass < 2; pass++) {
      const grow = pass ? 0 : RG[OUT] * 2;
      G.strokeStyle = pass ? col(cu, 1, 1) : INKS;
      G.lineWidth = w1 + grow;
      G.beginPath();
      if (metal || pass) {
        mt(xs, ys);
        lt(x0, y0);
      } else mt(x0, y0);
      lt(S[low * 3], S[low * 3 + 1]);
      G.stroke();
      if (pass && cu !== c) G.strokeStyle = col(c, 1, 1);
      G.lineWidth = w2 + grow;
      pawEnd(low, paw, w2);
      seg(S[low * 3], S[low * 3 + 1], RG[GX], RG[GY]);
    }
    if (LOD === 0 && b.scales) {
      // a bird's scaly shank: ticks across it
      const lx = S[low * 3];
      const ly = S[low * 3 + 1];
      let dx = RG[GX] - lx;
      let dy = RG[GY] - ly;
      const dl = hyp2(dx, dy) || 1;
      dx /= dl;
      dy /= dl;
      const r = w2 * 0.55;
      G.beginPath();
      for (let k = 0; k < b.scales; k++) {
        const t = ((k + 0.8) / (b.scales + 0.6)) * dl;
        mt(lx + dx * t - dy * r, ly + dy * t + dx * r);
        lt(lx + dx * (t + r * 0.5) + dy * r, ly + dy * (t + r * 0.5) - dx * r);
      }
      G.strokeStyle = col(INK, 1, 0.5);
      G.lineWidth = Math.max(0.5, RG[OUT] * 0.45);
      G.stroke();
    }
    if (LOD === 0 && !metal) {
      // shade down the side away from the light
      shadeSide(x0, y0, S[paw * 3], S[paw * 3 + 1]);
      const o = w2 * 0.3;
      G.beginPath();
      mt(x0 + RG[NX] * o, y0 + RG[NY] * o);
      lt(S[low * 3] + RG[NX] * o, S[low * 3 + 1] + RG[NY] * o);
      lt(S[paw * 3] + RG[NX] * o, S[paw * 3 + 1] + RG[NY] * o);
      G.strokeStyle = col(BLACK, 1, 0.16);
      G.lineWidth = w2 * 0.4;
      G.stroke();
    }
    if (metal) {
      // joint discs at the knee and the ankle
      for (let j = 0; j < 2; j++) {
        const jj = j ? low : mid;
        const r = (j ? b.legR[4] : b.legR[1]) * 1.12 * RG[PXS] * S[jj * 3 + 2];
        G.beginPath();
        elSub(S[jj * 3], S[jj * 3 + 1], r, r, 0);
        G.fillStyle = col(V.joint, 1, 1);
        G.fill();
        G.strokeStyle = INKS;
        G.lineWidth = Math.max(0.6, RG[OUT] * 0.8);
        G.stroke();
        if (LOD > 0) break;
      }
    }
    drawPaw(l, c);
  }
  /** Where a leg's last stroke ends (GX, GY): short of the paw's middle by as much as its round end is wider than the
      paw is tall, so the stroke's ink never shows under the paw or the floor line. */
  function pawEnd(low, paw, w) {
    const px = S[paw * 3];
    const py = S[paw * 3 + 1];
    const dx = px - S[low * 3];
    const dy = py - S[low * 3 + 1];
    const dl = hyp2(dx, dy) || 1;
    const back = Math.min(dl * 0.6, Math.max(0, w / 2 + RG[OUT] - T.build.pawR * 0.6 * RG[PXS] * S[paw * 3 + 2]));
    RG[GX] = px - (dx / dl) * back;
    RG[GY] = py - (dy / dl) * back;
  }
  /** The paw (or hoof, or robot foot): a flat ellipsoid on the ground, pointing the way the body goes, its toes. */
  function drawPaw(l, c) {
    const b = T.build;
    const paw = LJ(l, 3);
    const low = LJ(l, 2);
    // its way: forward along the body, tipped as the pastern swings
    let fx = BF[6];
    let fz = BF[8];
    const fl = hyp2(fx, fz) || 1;
    fx /= fl;
    fz /= fl;
    if (b.toes) return drawToes(paw, fx, fz, c);
    const py = J[paw * 3 + 1] - J[low * 3 + 1];
    const tip = py > -0.3 * b.pawR ? 0.6 : 0;
    const pr = b.paw;
    const o = paw * 3;
    ellipsoid(J[o] + fx * pr[2] * 0.35, J[o + 1], J[o + 2] + fz * pr[2] * 0.35, fz * pr[0], 0, -fx * pr[0], 0, pr[1], 0, fx * pr[2], -tip * pr[1], fz * pr[2]);
    const metal = T.skin === "metal";
    // (look.hoof: a hoof in its own colour, its cleft down the front at lod 0)
    ellInk(col(metal ? V.joint : V.hoof || c, 1, 1), Math.max(0.7, RG[OUT] * 1.1));
    if (LOD === 0 && V.hoof && !metal) {
      if (facing(fx, fz) > -0.2) {
        proj(J[o] + fx * pr[2] * 1.2, J[o + 1] + pr[1] * 0.7, J[o + 2] + fz * pr[2] * 1.2, 0);
        G.beginPath();
        mt(RG[QX], RG[QY]);
        proj(J[o] + fx * pr[2] * 1.3, J[o + 1] - pr[1] * 0.6, J[o + 2] + fz * pr[2] * 1.3, 0);
        lt(RG[QX], RG[QY]);
        G.strokeStyle = col(WHITE, 1, 0.35);
        G.lineWidth = Math.max(0.5, RG[OUT] * 0.5);
        G.stroke();
      }
    } else if (LOD === 0 && !metal) {
      // two toe lines on its front
      if (facing(fx, fz) > -0.3) {
        G.beginPath();
        for (let k = -1; k <= 1; k += 2) {
          proj(J[o] + fx * pr[2] * 1.1 + fz * pr[0] * 0.3 * k, J[o + 1] + pr[1] * 0.6, J[o + 2] + fz * pr[2] * 1.1 - fx * pr[0] * 0.3 * k, 0);
          mt(RG[QX], RG[QY]);
          proj(J[o] + fx * pr[2] * 1.2 + fz * pr[0] * 0.32 * k, J[o + 1] - pr[1] * 0.4, J[o + 2] + fz * pr[2] * 1.2 - fx * pr[0] * 0.32 * k, 0);
          lt(RG[QX], RG[QY]);
        }
        G.strokeStyle = col(INK, 1, 0.55);
        G.lineWidth = Math.max(0.5, RG[OUT] * 0.5);
        G.stroke();
      }
    }
  }
  /** A bird's foot (build.toes: its front toes' length): three toes spread ahead and one behind, flat under it (their
      inked edge on the ground, as high as the foot is off it), in the legs' colour. */
  function drawToes(paw, fx, fz, c) {
    const b = T.build;
    const o = paw * 3;
    const y = Math.max(0, J[o + 1] - b.pawR);
    const w = Math.max(0.6, b.legR[4] * 1.4 * RG[PXS] * S[paw * 3 + 2]);
    const up = w / 2 + RG[OUT]; // (px: the stroke's lower edge on the ground)
    for (let pass = 0; pass < 2; pass++) {
      G.beginPath();
      for (let k = 0; k < 4; k++) {
        const a = k < 3 ? (k - 1) * 0.55 : PI;
        const L = k < 3 ? b.toes * (k === 1 ? 1 : 0.85) : b.toes * 0.45;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        proj(J[o], y, J[o + 2], 0);
        mt(RG[QX], RG[QY] - up);
        proj(J[o] + (fx * ca + fz * sa) * L, y, J[o + 2] + (fz * ca - fx * sa) * L, 0);
        lt(RG[QX], RG[QY] - up);
      }
      G.strokeStyle = pass ? col(c, 1, 1) : INKS;
      G.lineWidth = pass ? w : w + RG[OUT] * 2;
      G.stroke();
    }
  }
  /** Far away (lod 2): every leg in one ink stroke and one colour stroke (called for the first leg; the rest skip). */
  function drawLegsLow(l) {
    if (l !== LEGS[0]) return;
    const b = T.build;
    const metal = T.skin === "metal";
    let w = 0;
    for (let i = 0; i < NLEG; i++) w = Math.max(w, (b.legR[3] + b.legR[4]) * RG[PXS] * S[LJ(LEGS[i], 2) * 3 + 2]);
    for (let pass = 0; pass < 2; pass++) {
      G.beginPath();
      for (let i = 0; i < NLEG; i++) {
        const ll = LEGS[i];
        const top = metal ? LJ(ll, 0) : LJ(ll, 1);
        mt(S[top * 3], S[top * 3 + 1]);
        lt(S[LJ(ll, 2) * 3], S[LJ(ll, 2) * 3 + 1]);
        pawEnd(LJ(ll, 2), LJ(ll, 3), w);
        lt(RG[GX], RG[GY]);
      }
      G.strokeStyle = pass ? col(metal ? V.body : V.legCol || V.fur, 0.95, 1) : INKS;
      G.lineWidth = pass ? w : w + RG[OUT] * 2;
      G.stroke();
    }
  }

  /* ---------- The tail ---------- */
  function drawTail() {
    const b = T.build;
    if (!(b.tail[0] > 0)) return;
    if (b.fan) return drawFan();
    const metal = T.skin === "metal";
    const r0 = b.tail[1] * 2 * RG[PXS];
    for (let pass = 0; pass < 2; pass++) {
      const grow = pass ? 0 : RG[OUT] * 2;
      G.strokeStyle = pass ? col(metal ? V.dark : V.fur, 1, 1) : INKS;
      if (LOD === 2) {
        G.lineWidth = r0 * S[TM * 3 + 2] * 0.85 + grow;
        G.beginPath();
        mt(S[TB * 3], S[TB * 3 + 1]);
        lt(S[TM * 3], S[TM * 3 + 1]);
        lt(S[TN * 3], S[TN * 3 + 1]);
        lt(S[TT * 3], S[TT * 3 + 1]);
        G.stroke();
        continue;
      }
      // thick at the base, thinner to the tip
      for (let k = 0; k < 3; k++) {
        G.lineWidth = r0 * S[(TB + k) * 3 + 2] * (1 - 0.22 * k) + grow;
        seg(S[(TB + k) * 3], S[(TB + k) * 3 + 1], S[(TB + k + 1) * 3], S[(TB + k + 1) * 3 + 1]);
      }
    }
    if (LOD === 2) return;
    const tx = S[TT * 3];
    const ty = S[TT * 3 + 1];
    if (metal) {
      // a joint ball at the tip
      const r = b.tail[1] * 1.6 * RG[PXS] * S[TT * 3 + 2];
      G.beginPath();
      elSub(tx, ty, r, r, 0);
      G.fillStyle = col(V.joint, 1, 1);
      G.fill();
      G.strokeStyle = INKS;
      G.lineWidth = Math.max(0.6, RG[OUT] * 0.8);
      G.stroke();
      return;
    }
    // a scruffy tip: three tufts fanning out past the end (ink, then the coat)
    let dx = tx - S[TN * 3];
    let dy = ty - S[TN * 3 + 1];
    const dl = hyp2(dx, dy) || 1;
    dx /= dl;
    dy /= dl;
    const L = b.tail[1] * 1.7 * RG[PXS] * S[TT * 3 + 2];
    for (let pass = 0; pass < 2; pass++) {
      G.beginPath();
      for (let k = -1; k <= 1; k++) {
        const a = k * 0.75;
        const c = Math.cos(a);
        const s = Math.sin(a);
        mt(tx, ty);
        lt(tx + (dx * c - dy * s) * L * (pass ? 0.75 : 1), ty + (dy * c + dx * s) * L * (pass ? 0.75 : 1));
      }
      G.strokeStyle = pass ? col(V.fur, 1, 1) : INKS;
      G.lineWidth = pass ? Math.max(0.5, b.tail[1] * 0.5 * RG[PXS] * S[TT * 3 + 2]) : Math.max(0.9, b.tail[1] * 0.5 * RG[PXS] * S[TT * 3 + 2] + RG[OUT] * 1.2);
      G.stroke();
    }
  }

  /** A point of a tail fan into QX, QY: feather a (rad from the tail's line toward its up) at length len from the
      root, set out x tiles to its side. */
  function fanPt(a, len, x) {
    const o = TB * 3;
    const c = Math.cos(a) * len;
    const s = Math.sin(a) * len;
    proj(J[o] + TF[6] * c + TF[3] * s + TF[0] * x, J[o + 1] + TF[7] * c + TF[4] * s + TF[1] * x, J[o + 2] + TF[8] * c + TF[5] * s + TF[2] * x, 0);
  }
  /** A tail fan (build.fan [feathers, spread (rad), half-width at its root, flare]): feathers spread from the rump in
      the tail's plane, up and back, the middle ones longest; a hen's tail is a tent of two such fans meeting along its
      top feather, the lower ones flared out to either side (flare x their length), so it has body from behind. The far
      half first, each in look.tailCol or the coat, inked; the near half's quills at lod 0. */
  function drawFan() {
    const b = T.build;
    const f = b.fan;
    const n = Math.max(2, f[0] | 0);
    const L = b.tail[0];
    const da = f[1] / (n - 1);
    const o = TB * 3;
    const far = depth(J[o] + TF[0], J[o + 2] + TF[2]) > depth(J[o] - TF[0], J[o + 2] - TF[2]) ? 1 : -1;
    // (far off, the near half alone)
    for (let half = LOD === 2 ? 1 : 0; half < 2; half++) {
      const sd = half ? -far : far;
      G.beginPath();
      fanPt(-PI / 2, f[2], 0);
      mt(RG[QX], RG[QY]);
      for (let i = 0; i < n; i++) {
        const a = -f[1] / 2 + da * i;
        const len = L * (1 - 0.2 * Math.abs((2 * i) / (n - 1) - 1));
        const x = sd * len * f[3] * (1 - i / (n - 1));
        if (i > 0) {
          // the notch between this feather and the last
          fanPt(a - da / 2, len * 0.84, sd * len * f[3] * (1 - (i - 0.5) / (n - 1)) * 0.84);
          lt(RG[QX], RG[QY]);
        }
        fanPt(a, len, x);
        lt(RG[QX], RG[QY]);
      }
      fanPt(PI / 2, f[2], 0);
      lt(RG[QX], RG[QY]);
      G.closePath();
      G.fillStyle = col(V.tailCol || V.fur, half ? 0.97 : 0.88, 1);
      G.fill();
      G.strokeStyle = INKS;
      G.lineWidth = Math.max(0.6, RG[OUT] * 1.1);
      G.stroke();
    }
    if (LOD === 0) {
      // the near half's quills: from the root most of the way out
      G.beginPath();
      for (let i = 0; i < n; i++) {
        const a = -f[1] / 2 + da * i;
        const len = L * (1 - 0.2 * Math.abs((2 * i) / (n - 1) - 1)) * 0.72;
        fanPt(a, len * 0.25, 0);
        mt(RG[QX], RG[QY]);
        fanPt(a, len, -far * len * f[3] * (1 - i / (n - 1)));
        lt(RG[QX], RG[QY]);
      }
      G.strokeStyle = col(INK, 1, 0.35);
      G.lineWidth = Math.max(0.5, RG[OUT] * 0.5);
      G.stroke();
    }
  }

  /* ---------- Wings (a biped's): flat feathered shapes from the shoulder, folded along its sides or spread ---------- */
  // the outline: along the span (0 the root .. 1 the tip) and the chord (0 the leading edge .. 1 the feathers' ends):
  // the leading edge out to the rounded tip, then the flight feathers' scallops back to the root
  const WING_U = [0, 0.12, 0.45, 0.8, 1.0, 0.97, 0.8, 0.74, 0.56, 0.5, 0.3, 0.25, 0.08];
  const WING_V = [0.3, 0.06, 0, 0.07, 0.28, 0.45, 0.6, 0.57, 0.77, 0.73, 0.86, 0.82, 0.78];
  const WING_TWIST = 0.55; // rad a spread wing's trailing edge hangs below its leading edge (it shows its top)
  /** Wing w (0 left, 1 right; build.wing { x, u, f, len, r: half its width }): lit on its top side, in shade from
      under it, inked; the coverts' edge across it and the feathers' parting at lod 0. Folded flat on its side, it is
      not drawn seen edge-on (from straight ahead or behind). */
  function drawWing(w) {
    const b = T.build;
    if (!b.wing) return;
    const wg = b.wing;
    const s = w ? 1 : -1;
    const o0 = (WNG + w * 2) * 3;
    const o1 = o0 + 3;
    // the span (root to tip) and the chord (down its side folded; spread, back and a little down: square to the span)
    let ux = J[o1] - J[o0];
    let uy = J[o1 + 1] - J[o0 + 1];
    let uz = J[o1 + 2] - J[o0 + 2];
    const ul = hyp3(ux, uy, uz) || 1e-6;
    ux /= ul;
    uy /= ul;
    uz /= ul;
    const sp = PP[Q_WING];
    const tc = Math.cos(WING_TWIST) * sp;
    const ts = 1 - sp + Math.sin(WING_TWIST) * sp;
    let cx = -BF[3] * ts - BF[6] * tc;
    let cy = -BF[4] * ts - BF[7] * tc;
    let cz = -BF[5] * ts - BF[8] * tc;
    const d = cx * ux + cy * uy + cz * uz;
    cx -= d * ux;
    cy -= d * uy;
    cz -= d * uz;
    const cl = hyp3(cx, cy, cz) || 1;
    cx /= cl;
    cy /= cl;
    cz /= cl;
    const W = wg.r * 2;
    const ox = J[o0];
    const oy = J[o0 + 1];
    const oz = J[o0 + 2];
    // its top side (outward folded, up spread) toward the camera: lit; its underside: in shade
    let nx = uy * cz - uz * cy;
    let ny = uz * cx - ux * cz;
    let nz = ux * cy - uy * cx;
    const ko = s * (1 - sp);
    if (nx * (BF[0] * ko + BF[3] * sp) + ny * (BF[1] * ko + BF[4] * sp) + nz * (BF[2] * ko + BF[5] * sp) < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    const vx = RG[CAMX] - ox;
    const vy = RG[CAMY] - oy;
    const vz = RG[CAMZ] - oz;
    const view = (nx * vx + ny * vy + nz * vz) / (hyp3(vx, vy, vz) || 1);
    // (folded: flat on its side, edge-on it is not there, and far off it is no part of the outline; spread and
    // edge-on: a crease, not a wing)
    if (sp < 0.5 ? LOD === 2 || (view < 0.2 && view > -0.2) : view < 0.1 && view > -0.1) return;
    G.beginPath();
    for (let i = 0; i < WING_U.length; i++) {
      const a = WING_U[i] * ul;
      const c = WING_V[i] * W;
      proj(ox + ux * a + cx * c, oy + uy * a + cy * c, oz + uz * a + cz * c, 0);
      if (i) lt(RG[QX], RG[QY]);
      else mt(RG[QX], RG[QY]);
    }
    G.closePath();
    G.fillStyle = col(V.wing || V.fur, view > 0 ? 0.97 : 0.8, 1);
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = Math.max(0.6, RG[OUT] * 1.05);
    G.stroke();
    if (LOD === 0) {
      // the coverts' edge, curving across it; the flight feathers parting below it
      G.beginPath();
      for (let k = 0; k < 4; k++) {
        const a = (k ? 0.12 + 0.27 * k : 0.05) * ul;
        const c = (k ? 0.5 - 0.06 * k : 0.48) * W;
        proj(ox + ux * a + cx * c, oy + uy * a + cy * c, oz + uz * a + cz * c, 0);
        if (k) lt(RG[QX], RG[QY]);
        else mt(RG[QX], RG[QY]);
      }
      for (let k = 0; k < 2; k++) {
        const a = (0.42 + 0.24 * k) * ul;
        const c0 = (0.45 - 0.05 * k) * W;
        const c1 = (0.68 - 0.06 * k) * W;
        proj(ox + ux * a + cx * c0, oy + uy * a + cy * c0, oz + uz * a + cz * c0, 0);
        mt(RG[QX], RG[QY]);
        proj(ox + ux * (a + 0.04 * ul) + cx * c1, oy + uy * (a + 0.04 * ul) + cy * c1, oz + uz * (a + 0.04 * ul) + cz * c1, 0);
        lt(RG[QX], RG[QY]);
      }
      G.strokeStyle = col(INK, 1, 0.3);
      G.lineWidth = Math.max(0.5, RG[OUT] * 0.5);
      G.stroke();
    }
  }

  /* ---------- The head ---------- */
  /** Project head-local (r, u, f) to QX/QY. */
  function headPt(r, u, f) {
    const o = HED * 3;
    proj(J[o] + HF[0] * r + HF[3] * u + HF[6] * f, J[o + 1] + HF[1] * r + HF[4] * u + HF[7] * f, J[o + 2] + HF[2] * r + HF[5] * u + HF[8] * f, 0);
  }
  /** Head-local (r, u, f) as depth (+ away). */
  function headDepth(r, u, f) {
    const o = HED * 3;
    return depth(J[o] + HF[0] * r + HF[3] * u + HF[6] * f, J[o + 2] + HF[2] * r + HF[5] * u + HF[8] * f);
  }
  /** A flat decal on the head's surface at local (r, u, f) facing (nr, nu, nf), sizes (ra across, rb up): projected to
      EX.., returns how much it looks at the camera. */
  function faceDecal(r, u, f, ra, rb, nr, nu, nf) {
    const tl = hyp2(nf, nr) || 1;
    const tr = (nf / tl) * ra;
    const tf = (-nr / tl) * ra;
    ellipsoid(J[HED * 3] + HF[0] * r + HF[3] * u + HF[6] * f, J[HED * 3 + 1] + HF[1] * r + HF[4] * u + HF[7] * f, J[HED * 3 + 2] + HF[2] * r + HF[5] * u + HF[8] * f, HF[0] * tr + HF[6] * tf, HF[1] * tr + HF[7] * tf, HF[2] * tr + HF[8] * tf, HF[3] * rb, HF[4] * rb, HF[5] * rb, 0, 0, 0);
    const nx = HF[0] * nr + HF[3] * nu + HF[6] * nf;
    const nz = HF[2] * nr + HF[5] * nu + HF[8] * nf;
    return facing(nx, nz) / (hyp3(nr, nu, nf) || 1);
  }
  // ear corners, head-local (x the head's radii, outward from its side; the other ear's x is mirrored):
  // a standing ear: base back, base front, tip.
  // a flopped one: base back, base front (on the skull's top), the fold's front, the hanging tip's curve control, the
  // flap's back, the fold's back: it folds over at the fold and hangs out past the cheek, its tip forward and down
  const EAR_UP = [0.66, 0.55, -0.62, 0.22, 0.86, 0.22, 0.52, 2.05, -0.45];
  const EAR_FLOP = [0.42, 0.82, -0.42, 0.18, 0.98, 0.18, 0.92, 0.62, 0.22, 1.32, -0.78, -0.02, 1.08, -0.12, -0.5, 0.86, 0.55, -0.48];
  const EAR_TRI = [0.7, 0.75, -0.55, 0.15, 0.95, -0.05, 0.5, 1.75, -0.45];
  // a goat's: out to its side from the back of the skull, a little back, its inside turned forward and up
  const EAR_SIDE = [0.72, 0.72, -0.5, 0.9, 0.18, -0.2, 2.1, 0.35, -0.7];
  /** Ear s (-1 left, 1 right) of kind k, inked; a standing ear's pink inside (lod 0, from the front). */
  function drawEar(s, k) {
    const b = T.build;
    const h = b.head;
    const sz = b.ear || 1;
    G.beginPath();
    if (k === "flop") {
      // perked (a bark), the hanging flap lifts toward standing
      const pk = RG[EAR] * 0.6;
      const E = EAR_FLOP;
      headPt(s * E[0] * h[0], E[1] * h[1], E[2] * h[2]);
      mt(RG[QX], RG[QY]);
      headPt(s * E[3] * h[0], E[4] * h[1], E[5] * h[2]);
      lt(RG[QX], RG[QY]);
      headPt(s * E[6] * h[0] * sz, (E[7] + pk * 0.3) * h[1] * sz, E[8] * h[2]);
      lt(RG[QX], RG[QY]);
      headPt(s * E[9] * h[0] * sz, (E[10] + pk * 1.6) * h[1] * sz, (E[11] - pk * 0.2) * h[2]);
      const cx = RG[QX];
      const cy = RG[QY];
      headPt(s * E[12] * h[0] * sz, (E[13] + pk * 1.2) * h[1] * sz, E[14] * h[2]);
      qt(cx, cy, RG[QX], RG[QY]);
      headPt(s * E[15] * h[0] * sz, (E[16] + pk * 0.3) * h[1] * sz, E[17] * h[2]);
      lt(RG[QX], RG[QY]);
      G.closePath();
      G.fillStyle = col(V.ear || V.fur, 1, 1);
      G.fill();
      G.strokeStyle = INKS;
      G.lineWidth = Math.max(0.7, RG[OUT] * 1.2);
      G.stroke();
      if (LOD === 0) {
        // the fold, where it bends over
        headPt(s * E[6] * h[0] * sz, (E[7] + pk * 0.3) * h[1] * sz, E[8] * h[2]);
        G.beginPath();
        mt(RG[QX], RG[QY]);
        headPt(s * E[15] * h[0] * sz, (E[16] + pk * 0.3) * h[1] * sz, E[17] * h[2]);
        lt(RG[QX], RG[QY]);
        G.strokeStyle = col(INK, 1, 0.5);
        G.lineWidth = Math.max(0.5, RG[OUT] * 0.6);
        G.stroke();
      }
      return;
    }
    const E = k === "tri" ? EAR_TRI : k === "side" ? EAR_SIDE : EAR_UP;
    const metal = T.skin === "metal";
    // the pink inside shows only from the front
    const inner = LOD === 0 && !metal && facing(HF[6], HF[8]) > 0.1 ? 2 : 1;
    for (let pass = 0; pass < inner; pass++) {
      const q = pass ? 0.55 : 1; // the inside: smaller, toward the front
      const oz = pass ? 0.12 : 0;
      if (pass) G.beginPath();
      const cx = (E[0] + E[3] + E[6]) / 3;
      const cy = (E[1] + E[4] + E[7]) / 3;
      const cz = (E[2] + E[5] + E[8]) / 3;
      for (let i = 0; i < 3; i++) {
        const x = cx + (E[i * 3] - cx) * q;
        const y = cy + (E[i * 3 + 1] - cy) * q;
        const z = cz + (E[i * 3 + 2] - cz) * q;
        headPt(s * x * h[0] * (i === 2 ? sz : 1), (i === 2 ? y * sz : y) * h[1], (z + oz) * h[2]);
        if (i) lt(RG[QX], RG[QY]);
        else mt(RG[QX], RG[QY]);
      }
      G.closePath();
      if (pass) {
        G.fillStyle = col(V.earIn || V.light, 1, 1);
        G.fill();
      } else {
        G.fillStyle = col(metal ? V.dark : V.shade || V.fur, 1, 1);
        G.fill();
        G.strokeStyle = INKS;
        G.lineWidth = Math.max(0.7, RG[OUT] * 1.2);
        G.stroke();
      }
    }
  }
  /** Which side's ear goes behind the skull: its middle is farther than the skull's. */
  function earBehind(s, k) {
    const h = T.build.head;
    if (k === "flop") return headDepth(s * 1.0 * h[0], 0.2 * h[1], -0.15 * h[2]) > headDepth(0, 0, 0) + h[0] * 0.15;
    const E = k === "tri" ? EAR_TRI : k === "side" ? EAR_SIDE : EAR_UP;
    const ex = s * ((E[0] + E[3] + E[6]) / 3);
    return headDepth(ex * h[0], 0.5 * h[1], (E[2] + E[8]) * 0.5 * h[2]) > headDepth(0, 0, 0) + h[0] * 0.15;
  }
  function drawHead() {
    if (T.skin === "metal") return drawHeadMetal();
    const b = T.build;
    const h = b.head;
    const sn = b.snout;
    const ears = V.ears;
    const ff = facing(HF[6], HF[8]); // the face toward the camera (-1..1)
    // ears that are behind the skull first
    if (ears) for (let i = 0; i < 2; i++) if (ears[i] && earBehind(i ? 1 : -1, ears[i])) drawEar(i ? 1 : -1, ears[i]);
    // horns behind the skull (seen from the front: they sweep back), a beard behind the head (turned away)
    const horns = b.horns && V.horn;
    if (horns) for (let i = 0; i < 2; i++) if (hornBehind(i ? 1 : -1)) drawHorn(i ? 1 : -1);
    const beard = b.beard && V.beard && LOD < 2;
    const beardFar = beard && headDepth(0, sn[3] - sn[2], sn[4] + sn[0] * 0.5) > headDepth(0, 0, 0) + h[0] * 0.3;
    if (beardFar) drawBeard();
    // the open mouth: the inside, the lower jaw dropped from its hinge, the tongue
    const jo = RG[JAW];
    if (jo > 0.04 && LOD < 2) drawJaw(jo);
    // skull and muzzle: one blob
    BN = 0;
    ellF(HF, HED, 0, 0, 0, h[0], h[1], h[2]);
    blobPush();
    // (a beak is its own shape in its own colour: behind the skull when the head is turned away, else after it)
    const beak = V.beak;
    const beakFar = beak && ff < 0;
    if (beakFar) beakDraw();
    if (!beak) {
      ellF(HF, HED, 0, sn[3], sn[4] + sn[0] * 0.5, sn[1], sn[2], sn[0] * 0.62);
      blobPush();
    }
    if (b.cheek) {
      ellF(HF, HED, 0, -h[1] * 0.35, h[2] * 0.25, h[0] * b.cheek, h[1] * 0.62, h[2] * 0.7);
      blobPush();
    }
    blobDraw(col(V.fur, 1, 1));
    if (LOD < 2) {
      // a lighter muzzle
      if (V.light && ff > -0.5 && !beak) {
        ellF(HF, HED, 0, sn[3] - sn[2] * 0.3, sn[4] + sn[0] * 0.62, sn[1] * 0.86, sn[2] * 0.72, sn[0] * 0.5);
        G.beginPath();
        ellSub(0);
        G.fillStyle = col(V.light, 1, 1);
        G.fill();
      }
      if (LOD === 0) {
        blobGet(0);
        crescent(0.16, 0.24);
        shine(0.14);
      }
    }
    // a hen's comb on top; a goat's beard under its chin
    if (b.comb && V.comb) drawComb();
    if (beard && !beardFar) drawBeard();
    if (beak && !beakFar) beakDraw();
    // the face: the patch, the eyes, the brows, the nose, the mouth line, the scruff on its cheeks
    if (ff > -0.35) drawFace(ff);
    if (ears) for (let i = 0; i < 2; i++) if (ears[i] && !earBehind(i ? 1 : -1, ears[i])) drawEar(i ? 1 : -1, ears[i]);
    if (horns) for (let i = 0; i < 2; i++) if (!hornBehind(i ? 1 : -1)) drawHorn(i ? 1 : -1);
    if (RG[BARKK] > 0.3 && LOD < 2 && ff > -0.6) barkLines();
  }
  /** A beak (look.beak: a bird's), in its own colour, inked: the snout's shape, or (build.beakTip) a pointed one, the
      hull of its base and its tip, with the line between its halves at lod 0; a hen's wattle hangs under it. */
  function beakDraw() {
    const b = T.build;
    const sn = b.snout;
    if (b.wattle && V.comb) drawWattle();
    if (!b.beakTip) {
      ellF(HF, HED, 0, sn[3], sn[4] + sn[0] * 0.5, sn[1], sn[2], sn[0] * 0.62);
      ellInk(col(V.beak, 1, 1), Math.max(0.7, RG[OUT] * 1.2));
      return;
    }
    // the base, a ring round the snout's start (top, bottom, either side), and the tip, hooked down a little
    HN = 0;
    headPt(0, sn[3] + sn[2], sn[4]);
    hbPush();
    headPt(0, sn[3] - sn[2], sn[4]);
    hbPush();
    headPt(sn[1], sn[3], sn[4]);
    hbPush();
    headPt(-sn[1], sn[3], sn[4]);
    hbPush();
    headPt(0, sn[3] - sn[2] * b.beakTip, sn[4] + sn[0]);
    hbPush();
    G.beginPath();
    hullPath();
    G.fillStyle = col(V.beak, 1, 1);
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = Math.max(0.6, RG[OUT] * 0.9);
    G.stroke();
    if (LOD === 0) {
      // where the upper half meets the lower, on the sides that show
      G.beginPath();
      let any = false;
      for (let s = -1; s <= 1; s += 2) {
        if (facing(HF[0] * s, HF[2] * s) < -0.1) continue;
        headPt(s * sn[1] * 0.75, sn[3] - sn[2] * 0.15, sn[4] + sn[0] * 0.05);
        mt(RG[QX], RG[QY]);
        headPt(s * sn[1] * 0.2, sn[3] - sn[2] * 0.3, sn[4] + sn[0] * 0.7);
        lt(RG[QX], RG[QY]);
        any = true;
      }
      if (any) {
        G.strokeStyle = col(INK, 1, 0.6);
        G.lineWidth = Math.max(0.5, RG[OUT] * 0.5);
        G.stroke();
      }
    }
  }

  /* ---------- The farm's head parts: a goat's horns and beard, a hen's comb and wattle ---------- */
  const HP = new Float64Array(3); // a horn's point, head-local
  /** Point k (0 its base .. HORN_SEGS its tip, any step between) along horn s (-1 left, 1 right) of build b,
      head-local, into HP. build.horns: [length, base radius, lean back at its base (rad from upright), more bend along
      it (rad), out to its side over its length (tiles)]: from the top of the skull, up and curving back. */
  const HORN_SEGS = 3;
  function hornPt(b, s, k) {
    const h = b.head;
    const hn = b.horns;
    HP[0] = s * h[0] * 0.42;
    HP[1] = h[1] * 0.72;
    HP[2] = h[2] * 0.08;
    for (let i = 0; i < k; i++) {
      const part = Math.min(1, k - i) / HORN_SEGS;
      const a = hn[2] + (hn[3] * (i + 0.5)) / HORN_SEGS;
      HP[0] += s * hn[4] * part;
      HP[1] += Math.cos(a) * hn[0] * part;
      HP[2] -= Math.sin(a) * hn[0] * part;
    }
  }
  /** Is horn s's middle behind the skull (drawn before it)? */
  function hornBehind(s) {
    const b = T.build;
    hornPt(b, s, HORN_SEGS / 2);
    return headDepth(HP[0], HP[1], HP[2]) > headDepth(0, 0, 0) + b.head[0] * 0.2;
  }
  /** Horn s: thick at the base, tapering to a blunt point (lod 0; farther off one width), inked, in look.horn; its
      ridges at lod 0. */
  function drawHorn(s) {
    const b = T.build;
    const w0 = b.horns[1] * 2 * RG[PXS] * S[HED * 3 + 2];
    for (let pass = 0; pass < 2; pass++) {
      const grow = pass ? 0 : RG[OUT] * 2;
      G.strokeStyle = pass ? col(V.horn, 1, 1) : INKS;
      hornPt(b, s, 0);
      headPt(HP[0], HP[1], HP[2]);
      if (LOD > 0) {
        G.lineWidth = Math.max(0.6, w0 * 0.7) + grow;
        G.beginPath();
        mt(RG[QX], RG[QY]);
        for (let k = 1; k <= HORN_SEGS; k++) {
          hornPt(b, s, k);
          headPt(HP[0], HP[1], HP[2]);
          lt(RG[QX], RG[QY]);
        }
        G.stroke();
        continue;
      }
      for (let k = 1; k <= HORN_SEGS; k++) {
        const x0 = RG[QX];
        const y0 = RG[QY];
        hornPt(b, s, k);
        headPt(HP[0], HP[1], HP[2]);
        G.lineWidth = Math.max(0.6, w0 * (1 - (0.75 * (k - 1)) / HORN_SEGS)) + grow;
        seg(x0, y0, RG[QX], RG[QY]);
      }
    }
    if (LOD === 0) {
      // ridges round its lower half: short ticks across it
      G.beginPath();
      for (let k = 0; k < 3; k++) {
        const at = 0.4 + k * 0.4;
        hornPt(b, s, at);
        headPt(HP[0], HP[1], HP[2]);
        const cx = RG[QX];
        const cy = RG[QY];
        hornPt(b, s, at + 0.1);
        headPt(HP[0], HP[1], HP[2]);
        let dx = RG[QX] - cx;
        let dy = RG[QY] - cy;
        const dl = hyp2(dx, dy) || 1;
        const r = w0 * (1 - (0.75 * at) / HORN_SEGS) * 0.42;
        dx /= dl;
        dy /= dl;
        mt(cx - dy * r, cy + dx * r);
        lt(cx + dy * r, cy - dx * r);
      }
      G.strokeStyle = col(INK, 1, 0.45);
      G.lineWidth = Math.max(0.5, RG[OUT] * 0.5);
      G.stroke();
    }
  }
  /** A head-local point fixed to the lower jaw (u up, f forward of its hinge) into HP: it drops as the mouth opens. */
  function jawPt(u, f) {
    const sn = T.build.snout;
    const a = RG[JAW] * T.build.jawOpen;
    const c = Math.cos(a);
    const s = Math.sin(a);
    HP[0] = 0;
    HP[1] = sn[3] - sn[2] * 0.55 + u * c - f * s;
    HP[2] = sn[4] + sn[0] * 0.05 + u * s + f * c;
  }
  /** A goat's beard (build.beard [length, width], look.beard): a tuft hanging from its chin, swinging down as it opens
      its mouth: the hull of its root and its tip, inked; two hairs at lod 0. */
  function drawBeard() {
    const b = T.build;
    const sn = b.snout;
    const bd = b.beard;
    const L = sn[0];
    HN = 0;
    for (let i = 0; i < 5; i++) {
      // the root along the chin (back, front, either side), then the tip below and back
      const f = i === 0 ? L * 0.3 : i === 1 ? L * 0.3 + bd[1] : i === 4 ? L * 0.5 - bd[0] * 0.3 : L * 0.3 + bd[1] * 0.5;
      const u = i === 4 ? -sn[2] * 0.45 - bd[0] : -sn[2] * 0.45;
      jawPt(u, f);
      headPt(i === 2 ? bd[1] * 0.35 : i === 3 ? -bd[1] * 0.35 : 0, HP[1], HP[2]);
      hbPush();
    }
    G.beginPath();
    hullPath();
    G.fillStyle = col(V.beard, 1, 1);
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = Math.max(0.6, RG[OUT] * 0.9);
    G.stroke();
    if (LOD === 0) {
      G.beginPath();
      for (let k = 0; k < 2; k++) {
        jawPt(-sn[2] * 0.6, L * 0.3 + bd[1] * (0.3 + 0.4 * k));
        headPt(0, HP[1], HP[2]);
        mt(RG[QX], RG[QY]);
        jawPt(-sn[2] * 0.45 - bd[0] * 0.75, L * 0.5 - bd[0] * 0.22 + bd[1] * (0.1 * k - 0.05));
        headPt(0, HP[1], HP[2]);
        lt(RG[QX], RG[QY]);
      }
      G.strokeStyle = col(INK, 1, 0.45);
      G.lineWidth = Math.max(0.5, RG[OUT] * 0.5);
      G.stroke();
    }
  }
  /** A hen's comb (build.comb [height over the skull, length, lobes], look.comb): a red crest of rounded lobes along
      the top of her head (the tallest in the middle), set out to either side by turns so it has some body from the
      front, inked. */
  function drawComb() {
    const b = T.build;
    const h = b.head;
    const cb = b.comb;
    const n = cb[2] || 3;
    const base = h[1] * 0.78;
    G.beginPath();
    headPt(0, base, cb[1] * 0.55);
    mt(RG[QX], RG[QY]);
    for (let i = 0; i < n; i++) {
      const z0 = cb[1] * (0.5 - (i + 0.5) / n);
      const z1 = cb[1] * (0.5 - (i + 1) / n);
      const top = h[1] + cb[0] * (1 - (0.35 * Math.abs(i - (n - 1) / 2)) / Math.max(1, (n - 1) / 2));
      headPt((i & 1 ? 1 : -1) * h[0] * 0.24, top * 1.08, z0);
      const cx = RG[QX];
      const cy = RG[QY];
      headPt(0, i === n - 1 ? base : h[1] + cb[0] * 0.3, z1 - (i === n - 1 ? cb[1] * 0.05 : 0));
      qt(cx, cy, RG[QX], RG[QY]);
    }
    G.closePath();
    G.fillStyle = col(V.comb, 1, 1);
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = Math.max(0.6, RG[OUT] * 0.9);
    G.stroke();
  }
  /** A hen's wattle (build.wattle [length, width], look.comb): two red lobes hanging under her beak, one far off. */
  function drawWattle() {
    const sn = T.build.snout;
    const wt = T.build.wattle;
    for (let s = -1; s <= 1; s += 2) {
      if (LOD > 0 && s > 0) break;
      const x = LOD > 0 ? 0 : s * wt[1] * 0.45;
      ellF(HF, HED, x, sn[3] - sn[2] - wt[0] * 0.45, sn[4] + sn[0] * 0.08, wt[1] * (LOD > 0 ? 0.9 : 0.5), wt[0] * 0.55, wt[1] * 0.45);
      ellInk(col(V.comb, 0.92, 1), Math.max(0.6, RG[OUT] * 0.8));
    }
  }
  /* ---------- Hulls: the convex outline of a few projected points (a beak, a beard) ---------- */
  const HB = new Float64Array(16); // up to 8 screen points
  let HN = 0;
  function hbPush() {
    if (HN >= 8) return;
    HB[HN * 2] = RG[QX];
    HB[HN * 2 + 1] = RG[QY];
    HN++;
  }
  /** The convex hull of the HN points in HB, as one closed sub-path (gift wrapping). */
  function hullPath() {
    let p0 = 0;
    for (let i = 1; i < HN; i++) if (HB[i * 2] < HB[p0 * 2] || (HB[i * 2] === HB[p0 * 2] && HB[i * 2 + 1] < HB[p0 * 2 + 1])) p0 = i;
    let p = p0;
    for (let n = 0; n < HN; n++) {
      if (n) lt(HB[p * 2], HB[p * 2 + 1]);
      else mt(HB[p * 2], HB[p * 2 + 1]);
      let q = p === 0 ? 1 : 0;
      for (let i = 0; i < HN; i++) {
        if (i === p) continue;
        const cr = (HB[q * 2] - HB[p * 2]) * (HB[i * 2 + 1] - HB[p * 2 + 1]) - (HB[q * 2 + 1] - HB[p * 2 + 1]) * (HB[i * 2] - HB[p * 2]);
        const far = hyp2(HB[i * 2] - HB[p * 2], HB[i * 2 + 1] - HB[p * 2 + 1]) > hyp2(HB[q * 2] - HB[p * 2], HB[q * 2 + 1] - HB[p * 2 + 1]);
        if (cr < 0 || (cr === 0 && far)) q = i;
      }
      p = q;
      if (p === p0) break;
    }
    G.closePath();
  }
  /** The open mouth (jo 0..1): the dark inside, the lower jaw, the tongue (panting: hanging over the lip). */
  function drawJaw(jo) {
    const b = T.build;
    const sn = b.snout;
    const ang = jo * b.jawOpen; // rad the jaw drops
    frameSet(NF, HF);
    rot(NF, 1, 2, ang); // the jaw's frame: pitched down about its hinge
    const hz = sn[4] + sn[0] * 0.05; // the hinge, along the head
    const hu = sn[3] - sn[2] * 0.55;
    const o = HED * 3;
    const hx = J[o] + HF[3] * hu + HF[6] * hz;
    const hy = J[o + 1] + HF[4] * hu + HF[7] * hz;
    const hzz = J[o + 2] + HF[5] * hu + HF[8] * hz;
    const L = sn[0] * 1.02;
    // the inside of the mouth: between the muzzle and the dropped jaw
    ellipsoid(hx + (HF[6] + NF[6]) * 0.5 * L * 0.5 - HF[3] * sn[2] * 0.15, hy + (HF[7] + NF[7]) * 0.5 * L * 0.5 - HF[4] * sn[2] * 0.15, hzz + (HF[8] + NF[8]) * 0.5 * L * 0.5 - HF[5] * sn[2] * 0.15, HF[0] * sn[1] * 0.8, HF[1] * sn[1] * 0.8, HF[2] * sn[1] * 0.8, HF[3] * sn[2] * (0.4 + jo * 0.9), HF[4] * sn[2] * (0.4 + jo * 0.9), HF[5] * sn[2] * (0.4 + jo * 0.9), HF[6] * L * 0.45, HF[7] * L * 0.45, HF[8] * L * 0.45);
    G.beginPath();
    ellSub(0);
    G.fillStyle = col(V.mouth, 1, 1);
    G.fill();
    // the lower jaw
    ellipsoid(hx + NF[6] * L * 0.5 - NF[3] * sn[2] * 0.2, hy + NF[7] * L * 0.5 - NF[4] * sn[2] * 0.2, hzz + NF[8] * L * 0.5 - NF[5] * sn[2] * 0.2, NF[0] * sn[1] * 0.78, NF[1] * sn[1] * 0.78, NF[2] * sn[1] * 0.78, NF[3] * sn[2] * 0.42, NF[4] * sn[2] * 0.42, NF[5] * sn[2] * 0.42, NF[6] * L * 0.5, NF[7] * L * 0.5, NF[8] * L * 0.5);
    ellInk(col(V.light || V.fur, 0.92, 1), Math.max(0.7, RG[OUT] * 1.1));
    // the tongue: out over the lower lip, hanging (panting), or curled in the mouth (a bark)
    if (V.tongue) {
      const out = POSE === P_BARK ? 0.25 : 1;
      const tx = hx + NF[6] * L * (0.55 + 0.4 * out) - NF[3] * sn[2] * (0.1 + 0.35 * out);
      const ty = hy + NF[7] * L * (0.55 + 0.4 * out) - NF[4] * sn[2] * (0.1 + 0.35 * out);
      const tz = hzz + NF[8] * L * (0.55 + 0.4 * out) - NF[5] * sn[2] * (0.1 + 0.35 * out);
      ellipsoid(tx, ty, tz, NF[0] * sn[1] * 0.5, NF[1] * sn[1] * 0.5, NF[2] * sn[1] * 0.5, -NF[3] * sn[2] * 0.6 * out + NF[6] * 0.002, -NF[4] * sn[2] * 0.6 * out + NF[7] * 0.002, -NF[5] * sn[2] * 0.6 * out + NF[8] * 0.002, NF[6] * L * 0.32, NF[7] * L * 0.32, NF[8] * L * 0.32);
      if (LOD === 0) ellInk(col(V.tongue, 1, 1), Math.max(0.6, RG[OUT] * 0.8));
      else {
        G.beginPath();
        ellSub(0);
        G.fillStyle = col(V.tongue, 1, 1);
        G.fill();
      }
    }
  }
  /** The patch, the eyes and brows, the nose, the mouth line and the scruff: the parts that look at the camera. */
  function drawFace(ff) {
    const b = T.build;
    const h = b.head;
    const sn = b.snout;
    // the dark patch over one eye
    if (V.patch && LOD < 2) {
      const s = V.patch;
      if (faceDecal(s * h[0] * 0.48, h[1] * 0.2, h[2] * 0.66, h[0] * 0.5, h[1] * 0.46, s * 0.55, 0.25, 0.8) > 0.02) {
        G.beginPath();
        ellSub(0);
        G.fillStyle = col(V.patchCol, 1, 1);
        G.fill();
      }
    }
    // the eyes: big and dark with a highlight; a brow over each (lod 0). build.eye sizes them; build.eyeSide (0..1)
    // sets them round toward the sides of the head (a goat's, a hen's)
    const es = b.eyeSide || 0;
    const ek = b.eye || 1;
    for (let s = -1; s <= 1; s += 2) {
      const ex = s * h[0] * (0.44 + 0.5 * es);
      const eu = h[1] * 0.18;
      const ez = h[2] * (0.8 - 0.55 * es);
      const f = faceDecal(ex, eu, ez, h[0] * 0.25 * ek, h[1] * 0.27 * ek, s * (0.5 + 0.5 * es), 0.15, 0.85 * (1 - 0.8 * es));
      if (f < 0.02) continue;
      const exx = RG[EX];
      const eyy = RG[EY];
      const ea = RG[ERA];
      const eb = RG[ERB];
      G.beginPath();
      ellSub(0);
      G.fillStyle = col(V.eye, 1, 1);
      G.fill();
      if (LOD < 2) {
        G.strokeStyle = INKS;
        G.lineWidth = Math.max(0.5, RG[OUT] * 0.6);
        G.stroke();
        // the highlight, up and to the left
        G.beginPath();
        elSub(exx + SLX * ea * 0.35, eyy + SLY * eb * 0.38, Math.max(0.5, ea * 0.3), Math.max(0.5, eb * 0.3), 0);
        G.fillStyle = col(WHITE, 1, 1);
        G.fill();
      }
      if (LOD === 0 && V.brows !== false) {
        headPt(ex - s * h[0] * 0.2, eu + h[1] * 0.36, ez - h[2] * 0.02);
        G.beginPath();
        mt(RG[QX], RG[QY]);
        headPt(ex + s * h[0] * 0.02, eu + h[1] * 0.46, ez + h[2] * 0.02);
        const cx = RG[QX];
        const cy = RG[QY];
        headPt(ex + s * h[0] * 0.24, eu + h[1] * 0.34, ez - h[2] * 0.1);
        qt(cx, cy, RG[QX], RG[QY]);
        G.strokeStyle = col(INK, 1, 0.8);
        G.lineWidth = Math.max(0.6, RG[OUT] * 0.7);
        G.stroke();
      }
    }
    if (LOD === 2 || V.beak) return;
    // the nose: a dark round nose on the muzzle's tip, with a shine
    const nf = sn[4] + sn[0] * 1.08;
    const nu = sn[3] + sn[2] * 0.45;
    const nk = b.nose || 1; // build.nose: its size
    ellF(HF, HED, 0, nu, nf, sn[1] * 0.42 * nk, sn[2] * 0.36 * nk, sn[0] * 0.18 * nk);
    ellInk(col(V.nose, 1, 1), Math.max(0.6, RG[OUT] * 0.8));
    if (LOD === 0) {
      G.beginPath();
      elSub(RG[EX] + SLX * RG[ERA] * 0.3, RG[EY] + SLY * RG[ERB] * 0.35, Math.max(0.5, RG[ERA] * 0.28), Math.max(0.5, RG[ERB] * 0.22), RG[ERO]);
      G.fillStyle = col(WHITE, 1, 0.75);
      G.fill();
    }
    // the mouth line (shut): from under the nose round each side of the muzzle
    if (RG[JAW] < 0.08 && ff > -0.2) {
      G.beginPath();
      headPt(0, nu - sn[2] * 0.4, nf - sn[0] * 0.05);
      const x0 = RG[QX];
      const y0 = RG[QY];
      for (let s = -1; s <= 1; s += 2) {
        if (facing(HF[0] * s + HF[6] * 0.5, HF[2] * s + HF[8] * 0.5) < -0.2) continue;
        mt(x0, y0);
        headPt(s * sn[1] * 0.55, sn[3] - sn[2] * 0.55, sn[4] + sn[0] * 0.75);
        const cx = RG[QX];
        const cy = RG[QY];
        headPt(s * sn[1] * 0.85, sn[3] - sn[2] * 0.45, sn[4] + sn[0] * 0.15);
        qt(cx, cy, RG[QX], RG[QY]);
      }
      G.strokeStyle = col(INK, 1, 0.85);
      G.lineWidth = Math.max(0.6, RG[OUT] * 0.75);
      G.stroke();
    }
    // scruff on the cheeks (lod 0)
    if (LOD === 0 && V.scruff) {
      G.beginPath();
      let any = false;
      for (let s = -1; s <= 1; s += 2) {
        if (facing(HF[0] * s, HF[2] * s) < -0.1) continue;
        for (let k = 0; k < 3; k++) {
          const u = -h[1] * (0.25 + 0.2 * k);
          const f = h[2] * (0.15 - 0.25 * k);
          headPt(s * h[0] * 1.02, u, f);
          mt(RG[QX], RG[QY]);
          headPt(s * h[0] * (1.2 + 0.1 * rnd(800 + k)), u - h[1] * 0.28, f - h[2] * 0.2);
          lt(RG[QX], RG[QY]);
          any = true;
        }
      }
      if (any) {
        G.strokeStyle = INKS;
        G.lineWidth = Math.max(0.6, RG[OUT] * 0.75);
        G.stroke();
      }
    }
  }
  /** A bark: three short ink lines flying from the open mouth (the comic's woof). */
  function barkLines() {
    const sn = T.build.snout;
    headPt(0, sn[3] - sn[2] * 0.3, sn[4] + sn[0] * 1.2);
    const x0 = RG[QX];
    const y0 = RG[QY];
    projJ(HED);
    let dx = x0 - RG[QX];
    let dy = y0 - RG[QY];
    const dl = hyp2(dx, dy) || 1;
    dx /= dl;
    dy /= dl;
    const L = T.build.head[1] * 2.2 * RG[PXS] * S[HED * 3 + 2] * RG[BARKK];
    G.beginPath();
    if (facing(HF[6], HF[8]) > 0.7) {
      // barking at the camera: the lines fly out to both sides of the mouth
      for (let k = 0; k < 4; k++) {
        const s = k < 2 ? -1 : 1;
        const a = (k & 1 ? 0.35 : -0.15) * s;
        const ux = s * Math.cos(a);
        const uy = Math.sin(a);
        const r0 = T.build.snout[1] * 1.3 * RG[PXS] * RG[QK];
        mt(x0 + ux * (r0 + L * 0.2), y0 + uy * (r0 + L * 0.2));
        lt(x0 + ux * (r0 + L * 0.75), y0 + uy * (r0 + L * 0.75));
      }
    } else
      for (let k = -1; k <= 1; k++) {
        const a = k * 0.5;
        const c = Math.cos(a);
        const s = Math.sin(a);
        const ux = dx * c - dy * s;
        const uy = dy * c + dx * s;
        mt(x0 + ux * L * 0.35, y0 + uy * L * 0.35);
        lt(x0 + ux * L, y0 + uy * L);
      }
    G.strokeStyle = INKS;
    G.lineWidth = Math.max(0.8, RG[OUT] * 1.1);
    G.stroke();
  }
  /** A robot's head: a box skull and a box snout, two triangle ears, the antenna, the visor and the chemistry nose. */
  function drawHeadMetal() {
    const b = T.build;
    const h = b.head;
    const sn = b.snout;
    const ears = V.ears;
    if (ears) for (let i = 0; i < 2; i++) if (ears[i] && earBehind(i ? 1 : -1, ears[i])) drawEar(i ? 1 : -1, ears[i]);
    // the antenna behind the skull when it is
    const antBack = headDepth(-h[0] * 0.3, h[1], -h[2] * 0.4) > headDepth(0, 0, 0);
    if (antBack) drawAntenna();
    // skull, then the snout (whichever is farther first)
    const o = HED * 3;
    const scx = J[o] + HF[3] * sn[3] + HF[6] * (sn[4] + sn[0] * 0.5);
    const scy = J[o + 1] + HF[4] * sn[3] + HF[7] * (sn[4] + sn[0] * 0.5);
    const scz = J[o + 2] + HF[5] * sn[3] + HF[8] * (sn[4] + sn[0] * 0.5);
    const snoutFar = depth(scx, scz) > jDepth(HED);
    if (snoutFar) snoutBox(scx, scy, scz);
    boxSet(J[o], J[o + 1], J[o + 2], HF, h[0], h[1], h[2]);
    boxDraw(V.body);
    if (LOD < 2) {
      // the visor round the front and sides: a band of light (dark when shut down)
      for (let f = 0; f < 6; f++) {
        const ax = FACES[f][0];
        if (ax === 1 || (ax === 2 && FACES[f][1] < 0) || boxFacing(f) <= 0.02) continue;
        G.beginPath();
        if (ax === 0) boxQuad(f, 0.0, 0.05, 0.6, 0.95);
        else boxQuad(f, -0.85, 0.05, 0.85, 0.6);
        G.fillStyle = LIT ? glow(ZAPPING ? V.bright : V.eye, 1) : col(V.eyeOff, 1, 1);
        G.fill();
        G.strokeStyle = INKS;
        G.lineWidth = Math.max(0.6, RG[OUT] * 0.8);
        G.stroke();
      }
      if (LIT && LOD === 0) {
        // the visor's soft glow on the air (no gradients: a pale halo)
        ellF(HF, HED, 0, h[1] * 0.3, h[2] * 0.9, h[0] * 1.25, h[1] * 0.75, h[2] * 0.3);
        G.beginPath();
        ellSub(0);
        G.fillStyle = glow(V.eye, ZAPPING ? 0.3 : 0.16);
        G.fill();
      }
      // rivets on the cheeks
      if (LOD === 0) {
        G.beginPath();
        let any = false;
        for (let f = 0; f < 2; f++) {
          if (boxFacing(f) <= 0.05) continue;
          for (let k = 0; k < 2; k++) {
            boxPt(f, -0.55, -0.62 + k * 0.32, 0.002);
            const r = Math.max(0.6, 0.0028 * RG[PXS] * RG[QK]);
            elSub(RG[QX], RG[QY], r, r, 0);
            any = true;
          }
        }
        if (any) {
          G.fillStyle = col(V.joint, 1, 1);
          G.fill();
        }
      }
    }
    if (!snoutFar) snoutBox(scx, scy, scz);
    if (ears) for (let i = 0; i < 2; i++) if (ears[i] && !earBehind(i ? 1 : -1, ears[i])) drawEar(i ? 1 : -1, ears[i]);
    if (!antBack) drawAntenna();
    if (RG[ZAPK] > 0.05 && LIT) drawZap();
  }
  /** The snout: a lighter box, its jaw line, and the chemistry nose at its tip. */
  function snoutBox(cx, cy, cz) {
    const sn = T.build.snout;
    boxSet(cx, cy, cz, HF, sn[1], sn[2], sn[0] * 0.5);
    boxDraw(V.light);
    if (LOD === 2) return;
    if (LOD === 0) {
      // the jaw line along each side
      G.beginPath();
      let any = false;
      for (let f = 0; f < 2; f++) {
        if (boxFacing(f) <= 0.05) continue;
        boxPt(f, -0.3, -0.85, 0.001);
        mt(RG[QX], RG[QY]);
        boxPt(f, -0.3, 0.85, 0.001);
        lt(RG[QX], RG[QY]);
        any = true;
      }
      if (any) {
        G.strokeStyle = col(INK, 1, 0.8);
        G.lineWidth = Math.max(0.6, RG[OUT] * 0.7);
        G.stroke();
      }
    }
    // the nose
    const L = sn[0] * 0.5;
    ellipsoid(cx + HF[6] * L + HF[3] * sn[2] * 0.4, cy + HF[7] * L + HF[4] * sn[2] * 0.4, cz + HF[8] * L + HF[5] * sn[2] * 0.4, HF[0] * sn[1] * 0.35, HF[1] * sn[1] * 0.35, HF[2] * sn[1] * 0.35, HF[3] * sn[2] * 0.35, HF[4] * sn[2] * 0.35, HF[5] * sn[2] * 0.35, HF[6] * sn[1] * 0.2, HF[7] * sn[1] * 0.2, HF[8] * sn[1] * 0.2);
    ellInk(col(V.nose, 1, 1), Math.max(0.6, RG[OUT] * 0.8));
  }
  /** The antenna: a thin rod from the back of the skull, its ball tip red (bright when it zaps; dark, drooped, when
      shut down). */
  function drawAntenna() {
    const b = T.build;
    const h = b.head;
    const a = b.antenna;
    const droop = PP[Q_ANT];
    headPt(-h[0] * 0.35, h[1], -h[2] * 0.45);
    const x0 = RG[QX];
    const y0 = RG[QY];
    const up = Math.cos(droop * 1.3);
    const back = Math.sin(droop * 1.3);
    headPt(-h[0] * 0.5, h[1] + a[0] * up, -h[2] * 0.45 - a[0] * (0.25 + back));
    const x1 = RG[QX];
    const y1 = RG[QY];
    const k = RG[QK];
    G.beginPath();
    mt(x0, y0);
    lt(x1, y1);
    G.strokeStyle = INKS;
    G.lineWidth = a[1] * 2 * RG[PXS] * k + RG[OUT] * 2;
    G.stroke();
    G.strokeStyle = col(V.dark, 1, 1);
    G.lineWidth = a[1] * 2 * RG[PXS] * k;
    G.stroke();
    const r = a[2] * RG[PXS] * k;
    if (LIT && LOD === 0) {
      G.beginPath();
      elSub(x1, y1, r * (ZAPPING ? 2.6 : 1.8), r * (ZAPPING ? 2.6 : 1.8), 0);
      G.fillStyle = glow(ZAPPING ? V.eye : V.tip, ZAPPING ? 0.35 : 0.22);
      G.fill();
    }
    G.beginPath();
    elSub(x1, y1, r, r, 0);
    G.fillStyle = LIT ? glow(ZAPPING ? V.bright : V.tip, 1) : col(V.eyeOff, 1, 1);
    G.fill();
    G.strokeStyle = INKS;
    G.lineWidth = Math.max(0.6, RG[OUT] * 0.8);
    G.stroke();
  }
  /** The zap: two jagged sparks crackling off the nose, ahead, and a flash at it (glow: they light the dark). */
  function drawZap() {
    const sn = T.build.snout;
    const k = RG[ZAPK];
    const flick = Math.floor(clamp01(+ZAPT) * 5); // the bolts' shape changes a few times through the zap
    G.beginPath();
    for (let n = 0; n < 2; n++) {
      let f = sn[4] + sn[0] * 1.05;
      let r = 0;
      let u = sn[3];
      headPt(r, u, f);
      mt(RG[QX], RG[QY]);
      const L = sn[0] * (1.1 + 0.9 * k);
      for (let i = 1; i <= 4; i++) {
        f += L / 4;
        r = (rnd(900 + n * 13 + i * 3 + flick * 31) - 0.5) * sn[1] * 2.4;
        u = sn[3] + (rnd(950 + n * 13 + i * 3 + flick * 31) - 0.5) * sn[2] * 2.4 + (n ? 0.4 : -0.4) * sn[2] * (i / 4);
        headPt(r, u, f);
        lt(RG[QX], RG[QY]);
      }
    }
    const w = Math.max(1, sn[2] * 0.5 * RG[PXS] * RG[QK]);
    G.strokeStyle = glow(V.bright, 1);
    G.lineWidth = w * 2.2;
    G.stroke();
    G.strokeStyle = glow(V.eye, 1);
    G.lineWidth = w;
    G.stroke();
    // the flash at the nose
    headPt(0, sn[3], sn[4] + sn[0] * 1.1);
    const r = sn[1] * (1.2 + 1.2 * k) * RG[PXS] * RG[QK];
    G.beginPath();
    elSub(RG[QX], RG[QY], r, r, 0);
    G.fillStyle = glow(V.bright, Math.round(k * 4) * 0.09);
    G.fill();
  }

  /* ---------- Parts, sorted far to near ---------- */
  const PT_BODY = 0;
  const PT_HEAD = 1;
  const PT_TAIL = 2;
  const PT_LEG = 3; // + leg 0..3
  const PT_WING = 7; // + wing 0..1
  const NP = 9;
  const pKey = new Float64Array(NP);
  const pOrd = new Int32Array(NP);
  function drawPart(p) {
    if (p === PT_BODY) return drawBody();
    if (p === PT_HEAD) return drawHead();
    if (p === PT_TAIL) return drawTail();
    if (p >= PT_WING) return drawWing(p - PT_WING);
    return drawLeg(p - PT_LEG);
  }

  /* ---------- The figure ---------- */
  function draw(ctx, type, st, cam) {
    const t = TYPES[type] || TYPES.dog;
    RESULT.parts = 0;
    if (!t || !ctx || !st || !cam) return RESULT;
    T = t;
    G = ctx;
    SEED = st.seed | 0;
    V = t.looks[(SEED >>> 0) % t.looks.length];
    NLEG = t.plan === "biped" ? 2 : 4;
    LEGS = t.plan === "biped" ? LEGS_B : LEGS_Q;
    RG[CW] = Math.max(1, +cam.w || 1);
    RG[CH] = Math.max(1, +cam.h || 1);
    RG[W2] = RG[CW] / 2;
    FLR[1] = +cam.floor > 0 ? Math.min(+cam.floor, RG[CH] * 0.6) : 0;
    FLR[0] = RG[CH] - FLR[1];
    SHADOW = cam.shadow !== false;
    RG[PXS] = +cam.px > 0 ? +cam.px : FLR[0] / t.h;
    RG[DIST] = +cam.dist > 0.05 ? +cam.dist : 0.05;
    RG[EYE] = cam.eye == null || !Number.isFinite(+cam.eye) ? 0.5 : Math.max(0.05, +cam.eye);
    const yaw = num(st.yaw, 0);
    RG[CYAW] = Math.cos(yaw);
    RG[SYAW] = Math.sin(yaw);
    RG[TCX] = -RG[SYAW];
    RG[TCZ] = RG[CYAW];
    RG[CAMX] = RG[TCX] * RG[DIST];
    RG[CAMY] = RG[EYE];
    RG[CAMZ] = RG[TCZ] * RG[DIST];
    LOD = st.lod === 1 || st.lod === 2 ? st.lod : 0;
    RG[FOGK] = 1 - Math.round(Math.min(0.9, Math.max(0, num(st.fog, 0))) * FOG_STEPS) / FOG_STEPS;
    RG[FLASH] = st.hit ? 0.5 : 0;
    INKS = col(INK, 1, 1);
    solve(t, st);
    ZAPPING = POSE === P_ZAP && RG[ZAPK] > 0.05 && LIT;
    ZAPT = clamp01(+st.poseT);
    RG[OUT] = Math.max(0.7, Math.min(3.2, RG[PXS] * 0.0105));
    fit();
    RG[OUT] = Math.max(0.7, Math.min(3.2, RG[PXS] * RG[FIT] * 0.0105));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 1;
    drawGround();
    // sort keys: the depth of each part (+ farther). The head goes in front of the body unless it is farther than
    // the withers (turned away: the body hides its base); the tail behind the body when level with it
    pKey[PT_BODY] = (jDepth(HIP) + jDepth(SHO)) / 2;
    HEADBACK = jDepth(HED) > jDepth(SHO) + 0.01;
    pKey[PT_HEAD] = HEADBACK ? jDepth(HED) : Math.min(jDepth(HED), pKey[PT_BODY]) - 0.001;
    pKey[PT_TAIL] = (jDepth(TM) + jDepth(TN)) / 2 + 0.03;
    for (let l = 0; l < 4; l++) {
      pKey[PT_LEG + l] = (jDepth(LJ(l, 1)) + jDepth(LJ(l, 2))) / 2;
      LFAR[l] = pKey[PT_LEG + l] > pKey[PT_BODY] ? 1 : 0;
      // (a bird's legs come out from under its feathers: before every other part, the far one first)
      if (t.plan === "biped") pKey[PT_LEG + l] += 10;
    }
    for (let w = 0; w < 2; w++) pKey[PT_WING + w] = (jDepth(WNG + w * 2) + jDepth(WNG + w * 2 + 1)) / 2 - 0.004;
    let n = 0;
    for (let p = 0; p < NP; p++) {
      if (p >= PT_WING && !(t.plan === "biped" && t.build.wing)) continue;
      if (p >= PT_LEG && p < PT_WING && t.plan === "biped" && p - PT_LEG < 2) continue;
      // (far away the legs go in one stroke: one part, behind the body)
      if (LOD === 2 && p >= PT_LEG && p < PT_WING && p - PT_LEG !== LEGS[0]) continue;
      if (LOD === 2 && p === PT_LEG + LEGS[0]) pKey[p] = pKey[PT_BODY] + 1;
      let i = n++;
      while (i > 0 && pKey[pOrd[i - 1]] < pKey[p]) {
        pOrd[i] = pOrd[i - 1];
        i--;
      }
      pOrd[i] = p;
    }
    for (let i = 0; i < n; i++) drawPart(pOrd[i]);
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
  const COLOR_KEYS = ["fur", "shade", "light", "patchCol", "nose", "ear", "earIn", "eye", "mouth", "tongue", "wing", "legCol", "body", "dark", "joint", "eyeOff", "badge", "badgeStar", "tip", "bright", "beak", "comb", "horn", "hoof", "beard", "flank", "legShade", "tailCol"];
  const BUILD_DEFAULTS = {
    grazeDrop: 0.12, // grazing: the withers' drop (x len)
    grazeHead: 1.25, // grazing: the head's pitch, nose down (rad)
    peckDrop: 0.6, // pecking: the shoulders' drop (x len)
    peckHead: 1.0, // pecking: the head's pitch, beak down (rad)
    plan: "quad",
    hipDrop: 0.015,
    shDrop: 0.015,
    hipFwd: 0,
    shFwd: 0.005,
    foreZ: 0,
    hindZ: 0,
    foreAng: 0.12,
    hindAng: 0.32,
    headPitch: 0.15,
    headUp: 0.025,
    headFwd: 0.01,
    neckFwd: 0,
    tailUp: 0.6,
    tailCurl: 0.15,
    wagAmp: 0.55,
    jawOpen: 0.6,
    tufts: 0,
  };
  const GAIT_DEFAULTS = { stride: 0.5, duty: 0.6, lift: 0.03, hindLift: 1, crouch: 0, bob: 0.004, rock: 0, rockPh: 0, flex: 0, roll: 0.02, neckDrop: 0.1, headDip: 0.05, nod: 0.04, tailUp: 0.4, foreRoll: 0.5, hindRoll: 0.55, foreFold: -1.3, hindFold: 0.7, headBob: 0, phase: [0.5, 0, 0, 0.5], turnRate: 8 };
  /** Add (or replace) an animal type. def: { plan, skin, h, w, r, poses, build, gait, gaitRun, look, variants }; see
      js/beast3d-looks.js for every field. */
  function addType(id, def) {
    const build = Object.assign({}, BUILD_DEFAULTS, def.build);
    const gait = Object.assign({}, GAIT_DEFAULTS, def.gait);
    gait.phase = (gait.phase || GAIT_DEFAULTS.phase).slice(0, 4);
    const gaitRun = Object.assign({}, gait, def.gaitRun);
    gaitRun.phase = (gaitRun.phase || gait.phase).slice(0, 4);
    const keys = Object.keys(GAIT_DEFAULTS).filter((k) => typeof GAIT_DEFAULTS[k] === "number");
    const t = {
      id,
      plan: def.plan === "biped" ? "biped" : "quad",
      skin: def.skin === "metal" ? "metal" : "fur",
      h: def.h,
      w: def.w,
      r: def.r,
      poses: (def.poses || ["stand", "walk"]).filter((p) => POSES.includes(p)),
      build,
      gait,
      gaitRun,
      gaitMix: Object.assign({}, gait, { phase: gait.phase.slice() }),
      gaitKeys: keys,
      looks: [],
    };
    if (!t.poses.includes("stand")) t.poses.unshift("stand");
    if (!t.poses.includes("walk")) t.poses.push("walk");
    t.has = POSES.map((p) => t.poses.includes(p));
    const base = Object.assign({}, def.look);
    const variants = def.variants && def.variants.length ? def.variants : [{}];
    t.looks = variants.map((v) => {
      const L = Object.assign({}, base, v);
      COLOR_KEYS.forEach((k) => {
        if (L[k] != null) L[k] = hexRgb(L[k]);
      });
      return L;
    });
    // how far a part reaches round each joint (the fit and the ground): from the build
    const b = build;
    // (build.bodyReach: a long body's own, when its biggest radius overstates how far it reaches round the hips and
    // the withers: a goat's belly runs between them)
    const bodyR = b.bodyReach > 0 ? b.bodyReach : Math.max(...b.body.map((e) => Math.max(e[2], e[3], e[4]) + Math.abs(e[1])));
    // the spine's height over its belly, at the rump and at the chest (lying or sitting on it)
    const under = (e) => e[3] - e[1];
    t.bellyHip = b.box ? b.box[1] - b.box[3] : under(b.body[0]);
    t.bellySho = b.box ? b.box[1] - b.box[3] : under(b.body[b.body.length - 1]);
    t.reach = {
      ear: Math.max(b.head[0], b.head[1]) * 0.3,
      hip: bodyR + (b.box ? Math.max(b.box[0], b.box[1]) : 0),
      sho: bodyR + (b.box ? Math.max(b.box[0], b.box[1]) : 0),
      neck: b.neck[1],
      head: Math.max(b.head[0], b.head[1], b.head[2]) * 1.15,
      snout: Math.max(b.snout[1], b.snout[2]) * 1.4,
      tail: b.tail[1] * 3,
      legTop: Math.max(b.legR[0], b.legR[2]) * 1.2,
      leg: Math.max(b.legR[1], b.legR[3]) * 1.3,
      // (a flat wing's outermost points, the ones that set the fit, are round its tip)
      wing: b.wing ? b.wing.r * 1.2 : 0,
    };
    if (b.box) {
      // a box body reaches past the spine's ends
      t.reach.hip = Math.max(t.reach.hip, b.box[2] - b.len / 2 + b.box[0], hyp2(b.box[0], b.box[1]));
      t.reach.sho = t.reach.hip;
    }
    t.box = { h: t.h, w: t.w, head: t.h, bar: 0.4 };
    TYPES[id] = t;
    // the envelope of every pose, and the head's top standing still (for a bar or a bubble over it)
    const keepT = T;
    const keepV = V;
    T = t;
    V = t.looks[0];
    SEED = 0;
    NLEG = t.plan === "biped" ? 2 : 4;
    LEGS = t.plan === "biped" ? LEGS_B : LEGS_Q;
    const st = { yaw: 0, gait: 0, move: 0, run: 0, pose: "stand", poseT: 0, poseW: 1, wag: 0, headYaw: 0, seed: 0 };
    solve(t, st);
    let top = 0;
    for (let j = 0; j < NJ; j++) top = Math.max(top, J[j * 3 + 1] + JR[j] * 0.5);
    t.headTop = Math.min(t.h, top);
    buildEnv(t, st);
    T = keepT;
    V = keepV;
  }
  /** The envelope of every pose (see fit), sampled once per type: standing (panting, the wag, the head turned either
      way), the gait cycle at half and full stride, and each of its own poses through its loop, eased in and all the
      way, every look variant. env: walking; envRun: with the gallop too (st.run all the way); wRun the box's width a
      galloping figure needs. */
  function buildEnv(t, st) {
    const sets = [[], []];
    const rhs = [0, 0];
    let into = 0;
    const sample = (pose, field, n, move, hy, wag, pw) => {
      for (let i = 0; i <= n; i++) {
        st.pose = pose;
        st.poseT = 0.13;
        st.gait = 0.3;
        st[field] = i / n;
        st.move = move;
        st.headYaw = hy;
        st.wag = wag;
        st.poseW = pw;
        solve(t, st);
        for (let j = 0; j < NJ; j++) {
          const rho = hyp2(J[j * 3], J[j * 3 + 2]);
          if (rho + JR[j] > rhs[into]) rhs[into] = rho + JR[j];
          sets[into].push([rho, J[j * 3 + 1] + JR[j]]);
        }
      }
    };
    // SCALE: runs once per type as the page loads (a few ms a kind)
    [0, 1].forEach((run) => {
      into = run;
      st.run = run;
      for (let seed = 0; seed < t.looks.length; seed++) {
        SEED = seed;
        V = t.looks[seed];
        st.seed = seed;
        [-HEAD_YAW_MAX, 0, HEAD_YAW_MAX].forEach((hy) => {
          sample("walk", "gait", run ? 12 : 16, 1, hy, 1, 1);
          if (run) return;
          sample("stand", "poseT", 8, 0, hy, 1, 1);
          sample("walk", "gait", 8, 0.5, hy, 1, 1);
          t.poses.forEach((p) => {
            if (p === "stand" || p === "walk") return;
            sample(p, "poseT", POSE_ENV_STEPS[p] || ENV_STEPS, 0, hy, 1, 1);
            sample(p, "poseW", 6, 0.5, hy, 1, 1);
          });
        });
      }
    });
    st.run = 0;
    t.env = frontier(sets[0], rhs[0]);
    t.envRun = frontier(sets[0].concat(sets[1]), Math.max(rhs[0], rhs[1]));
    t.wRun = t.w * Math.max(1, t.envRun.rh / t.env.rh);
  }
  /** An envelope from its sampled points (rho out from the feet's vertical, top) and the farthest reach rh. */
  function frontier(pts, rh) {
    pts.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
    let keep = [];
    let best = -Infinity;
    pts.forEach((p) => {
      if (p[1] > best + 1e-4) {
        keep.push(p);
        best = p[1];
      }
    });
    while (keep.length > ENV_MAX) {
      const next = [];
      for (let i = 0; i < keep.length; i += 2) next.push(i + 1 < keep.length ? [keep[i][0], Math.max(keep[i][1], keep[i + 1][1])] : keep[i]);
      keep = next;
    }
    const env = { rh: rh * 1.02 + 0.004, n: keep.length, rho: new Float64Array(keep.length), top: new Float64Array(keep.length) };
    keep.forEach((p, i) => {
      env.rho[i] = p[0] * 1.02 + 0.004;
      env.top[i] = p[1] + 0.004;
    });
    return env;
  }
  /** Size of the region a type is drawn in (tiles; the engine caps it under a ceiling): h its box's height, w its
      width (room for any pose at any yaw), head the top of its head standing still, bar a health bar's width (its hit
      width on screen, as Walker3D.box). One reused object per type. */
  const FOV = 1.22; // js/interior.js's FOV (the engine's own wins when exported)
  function box(type) {
    const t = TYPES[type] || TYPES.dog;
    if (!t) return { h: 0.4, w: 0.6, head: 0.36, bar: 0.4 };
    const o = t.box;
    o.h = t.h;
    o.w = t.w;
    o.head = t.headTop;
    const I = ZSR.Interior;
    const fov = I && +I.FOV > 0 ? +I.FOV : FOV;
    o.bar = (2 * t.r * 1.1) / (2 * Math.tan(fov / 2));
    return o;
  }
  /** Tiles covered per gait cycle (paws stay planted when the engine advances gait by distance / stride); run (0..1,
      optional): galloping, as st.run draws it. */
  function stride(type, run) {
    const t = TYPES[type] || TYPES.dog;
    const s = t && t.gait.stride > 0 ? t.gait.stride : 0.5;
    const r = clamp01(run);
    return r > 0 && t ? s + (t.gaitRun.stride - s) * r : s;
  }

  /** For the art tests only: the last draw's fit, the joints (model tiles) and their projections (px), whether its
      lights are on. Reused. */
  const PROBE = { fit: 1, fitEnv: 1, j: J, s: S, lit: false, nj: NJ };
  function probe() {
    PROBE.fit = RG[FIT];
    PROBE.fitEnv = RG[FIT_ENV];
    PROBE.lit = LIT;
    return PROBE;
  }

  ZSR.Beast3D = {
    POSES,
    POSE_SECS,
    POSE_BLEND,
    LOOP_SECS,
    FOG_STEPS,
    HEAD_YAW_MAX,
    FOV,
    TYPES,
    addType,
    box,
    stride,
    draw,
    probe,
  };
})(typeof window !== "undefined" ? window : globalThis);
