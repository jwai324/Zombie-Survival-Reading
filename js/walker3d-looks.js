/* The walker types' looks for js/walker3d.js: build, gait, fall and look (palette and gear) for each id in
   ZSR.WORLD.WALKER_TYPES. Data only. A new type goes in an appended js/walker3d-looks2.js (loaded after this
   file, before js/interior.js) calling Walker3D.addType the same way; tests/validate-art.js holds every id in
   the facts to having a look here.

   def:
     h      box height, tiles (natural; the engine caps it at 0.98 under a ceiling). The lanky is only a little
            taller than a walker: indoors it reads tall by being thin, with long arms.
     w      box width, tiles at screen proportions: room for the reaching arms at any yaw
     r      hit radius, tiles: the health bar's width comes from it (WORLD.WALKER_TYPES[id].r wins when loaded)
     fall   "crumple" | "tree" | "fold" | "kneel" | "tumble"
     build  tiles: ankle, shin, thigh (heights); torso (pelvis to shoulder line); neck; hipW, shW, footW (half
            widths); upper, fore (arm bones); hand, foot (lengths); chest, waist ([across, front-to-back] half
            widths); head, jaw ([x, y, z] radii); rThigh, rShin, rUpper, rFore, rNeck, rFoot (radii); rise (the
            shoulders' slope up to the neck); muscle (bulging bare arms); finger (finger length x); pool (blood
            pool radius); shadow (ground shadow radius)
     gait   stride (tiles per cycle: Walker3D.stride), duty (share of a step a foot is planted), lift, crouch,
            lean (rad forward), bob, sway, twist, roll, tilt (rad), drag (0..1, one leg drags; dragSide -1/1),
            limp (phase offset of the second leg), shrug, jerk (0..1 twitchy tempo), arms ("reach" | "pump" |
            "hang" | "dangle" | "stiff" | "bent"), reachSide (-1 left, 1 right), armSwing, headFwd, headUp
            (share of the lean the head looks back up), headTilt, headBob, headTic, jaw (0..1 open), toeOut,
            clawRate (claw cycles a second: the engine reads it), turnRate (rad/s: the engine reads it),
            scream (can scream; else the scream pose is a bite)
     look   colours ([r,g,b] or "#rrggbb"): skin, shirt, sleeveCol, cuff, pants, shoe, sole, hair, eye, glow,
            mouth, teeth, nail, flesh, bone, blood, grime, stain, mottle, pad, helmetCol, visor, band, band2;
            gear: top ("tee" | "hoodie" | "tank" | "gown" | "coat" | "vest" | "turnout"), hem (tiles below the
            hips), sleeve ("short" | "long" | "none"), hood, helmet ("riot" | "fire"), hairStyle ("messy" |
            "long" | "none"), hairLen (long hair, tiles), hairFront, hairBack (hairline height, rad), ears,
            rip / rip2 ([angle round from the front, + its right; height 0 waist..1 chest; size]), ribs, kneeRip
            ([left, right]), fray, pads, bands, smears (n), armBlood ([left, right]), handBlood, mouthW, jag
     variants  looks the seed picks between (each overrides look)
   The road's top-down walkers (js/sprites.js) use the same skin, shirt and hair colours. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const W3 = ZSR.Walker3D;
  if (!W3) return;

  // average build; messy brown hair; torn blue-grey T-shirt with a rip over the ribs; torn jeans; work boots;
  // one arm reaching. Shuffles with a limp, one foot dragging, lurching.
  W3.addType("walker", {
    h: 0.92,
    w: 1.05,
    r: 0.32,
    fall: "crumple",
    build: {
      ankle: 0.045, shin: 0.2, thigh: 0.205, torso: 0.24, neck: 0.03,
      hipW: 0.055, shW: 0.118, footW: 0.062, upper: 0.155, fore: 0.145, hand: 0.058, foot: 0.105,
      chest: [0.118, 0.074], waist: [0.098, 0.064], head: [0.068, 0.079, 0.075], jaw: [0.05, 0.034, 0.05],
      rThigh: 0.05, rShin: 0.044, rUpper: 0.033, rFore: 0.027, rNeck: 0.027, rFoot: 0.035, rise: 0.035,
      pool: 0.34, shadow: 0.2,
    },
    gait: {
      stride: 0.75, duty: 0.62, lift: 0.035, crouch: 0.04, lean: 0.2, bob: 0.012, sway: 0.024, twist: 0.14,
      roll: 0.07, tilt: 0.05, drag: 0.75, dragSide: 1, limp: 0.04, arms: "reach", reachSide: -1, headFwd: 0.03,
      headUp: 0.7, headTilt: 0.2, jaw: 0.5, toeOut: 0.14, clawRate: 1.6, turnRate: 6,
    },
    look: {
      skin: [156, 168, 128], hair: [90, 63, 42], shirt: [104, 116, 142], pants: [78, 90, 128], shoe: [100, 74, 50],
      top: "tee", hem: 0.055, sleeve: "short", hairStyle: "messy", ears: true,
      rip: [-0.5, 0.5, 0.42], ribs: true, kneeRip: [true, true], fray: true, smears: 4, armBlood: [false, true], handBlood: true,
    },
  });

  // lean; dark indigo hoodie with the hood up, the face in its shadow; torn jeans; boots. Sprints leaning hard
  // forward, long strides, big clawing arm pumps, head down and forward.
  W3.addType("runner", {
    h: 0.9,
    w: 1.1,
    r: 0.28,
    fall: "tumble",
    build: {
      ankle: 0.045, shin: 0.205, thigh: 0.205, torso: 0.235, neck: 0.03,
      hipW: 0.05, shW: 0.105, footW: 0.045, upper: 0.152, fore: 0.142, hand: 0.054, foot: 0.1,
      chest: [0.106, 0.07], waist: [0.09, 0.06], head: [0.064, 0.076, 0.072], jaw: [0.047, 0.033, 0.048],
      rThigh: 0.045, rShin: 0.038, rUpper: 0.035, rFore: 0.031, rNeck: 0.028, rFoot: 0.033, rise: 0.04,
      pool: 0.3, shadow: 0.18,
    },
    gait: {
      stride: 1.5, duty: 0.38, lift: 0.11, crouch: 0.08, lean: 0.55, bob: 0.02, sway: 0.012, twist: 0.22,
      roll: 0.03, arms: "pump", headFwd: 0.07, headUp: 0.8, headTilt: 0.05, jaw: 0.62, toeOut: 0.05,
      clawRate: 2.4, turnRate: 9,
    },
    look: {
      skin: [158, 170, 130], hair: [36, 32, 30], shirt: [62, 54, 98], cuff: [50, 44, 82], pants: [40, 44, 70], shoe: [92, 76, 60],
      top: "hoodie", hem: 0.07, sleeve: "long", hood: true, hairStyle: "none", ears: false,
      rip: [-0.25, 0.42, 0.38], ribs: true, kneeRip: [true, false], fray: true, smears: 3, string: [196, 190, 178],
      hoodShade: [12, 10, 22],
    },
  });

  // huge: very broad shoulders, massive bare arms and hands, a small bald head low between them; torn ochre
  // sleeveless shirt ripped open over the chest; brown trousers; heavy boots. Slow heavy stomp, wide stance,
  // shoulders rolling, arms hanging low, one reaching.
  W3.addType("brute", {
    h: 1.05,
    w: 1.3,
    r: 0.4,
    fall: "tree",
    build: {
      ankle: 0.055, shin: 0.215, thigh: 0.215, torso: 0.3, neck: -0.005,
      hipW: 0.085, shW: 0.2, footW: 0.11, upper: 0.19, fore: 0.18, hand: 0.088, foot: 0.13,
      chest: [0.2, 0.135], waist: [0.165, 0.125], head: [0.068, 0.08, 0.076], jaw: [0.058, 0.04, 0.056],
      rThigh: 0.075, rShin: 0.062, rUpper: 0.064, rFore: 0.058, rNeck: 0.066, rFoot: 0.05, rise: 0.075,
      muscle: true, finger: 1.05, pool: 0.44, shadow: 0.3,
    },
    gait: {
      stride: 0.85, duty: 0.66, lift: 0.05, crouch: 0.06, lean: 0.16, bob: 0.022, sway: 0.04, twist: 0.12,
      roll: 0.08, shrug: 0.025, arms: "hang", reachSide: 1, headFwd: 0.15, headUp: 0.5, headTilt: 0.06, jaw: 0.55,
      toeOut: 0.22, clawRate: 1.1, turnRate: 4,
    },
    look: {
      skin: [150, 165, 118], hair: [40, 36, 30], shirt: [188, 142, 86], pants: [98, 76, 56], shoe: [86, 66, 48],
      top: "tank", hem: 0.07, sleeve: "none", hairStyle: "none", ears: true,
      neckline: [0.72, 0.93], rip: [-0.32, 0.5, 0.48], ribs: true, kneeRip: [true, true], fray: true, smears: 6, armBlood: [true, false], handBlood: true, jag: 0.045,
      scar: [74, 52, 50],
    },
  });

  // very tall and thin: long legs, arms past the knees, a long thin neck, stringy long dark hair, sunken face;
  // a tattered pale hospital gown over thin trousers, or a long torn coat. Long stiff strides at a slow
  // cadence, high knees, stooped, arms dangling and swinging wide, head bobbing.
  W3.addType("lanky", {
    h: 1.15,
    w: 1.4,
    r: 0.3,
    fall: "fold",
    build: {
      ankle: 0.05, shin: 0.27, thigh: 0.265, torso: 0.265, neck: 0.075,
      hipW: 0.05, shW: 0.1, footW: 0.05, upper: 0.22, fore: 0.22, hand: 0.07, foot: 0.11,
      chest: [0.094, 0.06], waist: [0.074, 0.054], head: [0.058, 0.084, 0.07], jaw: [0.042, 0.036, 0.046],
      rThigh: 0.037, rShin: 0.031, rUpper: 0.025, rFore: 0.022, rNeck: 0.02, rFoot: 0.03, rise: 0.03,
      finger: 1.35, pool: 0.36, shadow: 0.18,
    },
    gait: {
      stride: 1.2, duty: 0.6, lift: 0.11, crouch: 0.02, lean: 0.3, bob: 0.024, sway: 0.03, twist: 0.1,
      roll: 0.05, arms: "dangle", headFwd: 0.05, headUp: 0.4, headBob: 0.12, headTilt: 0.15, jaw: 0.35,
      toeOut: 0.1, clawRate: 1.3, turnRate: 5,
    },
    look: {
      skin: [166, 170, 150], hair: [42, 38, 34], pants: [92, 96, 104], shoe: [70, 62, 56],
      hairStyle: "long", hairLen: 0.2, hairFront: 0.62, hairBack: -0.55, hairJag: 1.4, spiky: false, ears: false,
      kneeRip: [false, true], fray: true, smears: 3, mottle: [110, 96, 120], hollow: [24, 26, 22],
    },
    variants: [
      { shirt: [175, 192, 186], top: "gown", hem: 0.27, sleeve: "short", rip: [0.3, 0.45, 0.4], ribs: true, jag: 0.05, stain: [120, 110, 70] },
      { shirt: [107, 94, 74], sleeveCol: [98, 86, 68], top: "coat", hem: 0.33, sleeve: "long", pants: [60, 56, 52], rip: [-0.35, 0.5, 0.4], ribs: true, jag: 0.06 },
    ],
  });

  // riot gear (black dome helmet, cracked visor, navy vest with shoulder and knee pads) or firefighter (black
  // brimmed helmet with a back flap, tan turnout coat with yellow and silver bands). Stiff mechanical march,
  // little arm swing, heavy footfalls; drops to its knees, then forward. No real names or badges.
  W3.addType("armored", {
    h: 0.95,
    w: 1.05,
    r: 0.36,
    fall: "kneel",
    build: {
      ankle: 0.05, shin: 0.205, thigh: 0.21, torso: 0.25, neck: 0.03,
      hipW: 0.065, shW: 0.13, footW: 0.07, upper: 0.155, fore: 0.145, hand: 0.058, foot: 0.11,
      chest: [0.145, 0.1], waist: [0.12, 0.09], head: [0.067, 0.078, 0.074], jaw: [0.05, 0.035, 0.05],
      rThigh: 0.056, rShin: 0.048, rUpper: 0.042, rFore: 0.037, rNeck: 0.032, rFoot: 0.042, rise: 0.04,
      pool: 0.36, shadow: 0.22,
    },
    gait: {
      stride: 0.8, duty: 0.62, lift: 0.07, crouch: 0.02, lean: 0.08, bob: 0.018, sway: 0.01, twist: 0.05,
      roll: 0.02, arms: "stiff", armSwing: 0.6, headFwd: 0.015, headUp: 0.8, headTilt: 0.04, jaw: 0.35,
      toeOut: 0.1, clawRate: 1.3, turnRate: 5,
    },
    look: {
      skin: [146, 158, 124], hair: [44, 38, 32], hairStyle: "none", ears: false, sleeve: "long", smears: 3, handBlood: true,
    },
    variants: [
      { top: "vest", hem: 0.05, shirt: [45, 58, 82], sleeveCol: [44, 48, 58], pants: [38, 40, 46], shoe: [30, 30, 34], pads: true, pad: [62, 68, 80], helmet: "riot", helmetCol: [43, 47, 54], visor: [143, 163, 181], kneeRip: [false, false] },
      { top: "turnout", hem: 0.2, shirt: [168, 145, 95], sleeveCol: [160, 138, 90], cuff: [70, 62, 48], pants: [150, 128, 84], shoe: [34, 32, 30], helmet: "fire", helmetCol: [32, 32, 35], bands: true, band: [217, 211, 106], band2: [207, 211, 214], rip: [0.35, 0.3, 0.32], kneeRip: [false, false] },
    ],
  });

  // thin; long dark tangled hair; ashen skin; torn maroon top; a very wide mouth; gaunt. Jerky, twitchy, with
  // head tics and bent arms. Screams with its head thrown back, arms spread up and out.
  W3.addType("screamer", {
    h: 0.9,
    w: 1.05,
    r: 0.29,
    fall: "crumple",
    build: {
      ankle: 0.045, shin: 0.2, thigh: 0.2, torso: 0.235, neck: 0.04,
      hipW: 0.05, shW: 0.1, footW: 0.05, upper: 0.15, fore: 0.14, hand: 0.056, foot: 0.095,
      chest: [0.1, 0.064], waist: [0.082, 0.055], head: [0.062, 0.078, 0.07], jaw: [0.048, 0.042, 0.05],
      rThigh: 0.042, rShin: 0.035, rUpper: 0.026, rFore: 0.023, rNeck: 0.022, rFoot: 0.03, rise: 0.03,
      finger: 1.15, pool: 0.32, shadow: 0.18,
    },
    gait: {
      stride: 0.8, duty: 0.6, lift: 0.05, crouch: 0.05, lean: 0.18, bob: 0.015, sway: 0.03, twist: 0.12,
      roll: 0.05, jerk: 1, headTic: 0.6, arms: "bent", headFwd: 0.035, headUp: 0.7, headTilt: 0.18, jaw: 0.85,
      toeOut: 0.1, clawRate: 2, turnRate: 8, scream: true,
    },
    look: {
      skin: [180, 184, 164], hair: [29, 26, 23], shirt: [112, 42, 56], pants: [52, 46, 52], shoe: [58, 50, 46],
      top: "tee", hem: 0.06, sleeve: "short", hairStyle: "long", hairLen: 0.26, hairFront: 0.6, hairBack: -0.5, hairJag: 1.6,
      ears: false, mouthW: 1.45, rip: [0.3, 0.55, 0.36], ribs: true, kneeRip: [true, false], fray: true, smears: 3,
      mottle: [120, 110, 130], hollow: [34, 30, 34], jag: 0.05,
    },
  });
})(typeof window !== "undefined" ? window : globalThis);
