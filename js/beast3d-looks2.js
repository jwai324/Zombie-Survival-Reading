/* The farm's animals for js/beast3d.js: the goats in the goat pen and the hens in the coop's wire run, matched to
   their 2D art (js/yardart.js yGoat and yChicken: the same colours and parts, the same size as js/yard.js stands them).
   Data only, appended after js/beast3d-looks.js (index.html loads it right after that file); its field docs hold for
   these, with the farm's own fields:
     poses     graze (head down in the grass, tearing and chewing), bleat (one long bleat), peck (twice a loop), flap
               (wings spread and beating); a bird's "sit" settles on its belly with its legs folded under it
     build     horns [length, base radius, lean back at the base (rad), more bend along it (rad), out to its side];
               beard [length, width]; flank [[t hips..withers, up, along radius, up radius, side (-1 its left), out],
               ...] (patches on its sides, drawn at every detail); lieFold (lies with its forelegs folded under its
               chest), lieTail [up, round to its side] (its tail lying), lieChew (its jaw chewing the cud lying);
               grazeDrop (x len), grazeHead (rad); eye (size x), eyeSide (0..1: eyes round on the sides of the head),
               nose (size x); bodyReach (tiles: how far a long body reaches round its hips and withers, for the fit);
               a bird's comb [height over its skull, length, lobes], wattle [length, width], beakTip (a pointed beak
               hooked down by this many of its up radii), fan [feathers, spread (rad), half-width at the root, flare
               (its lower feathers set out to either side, x their length: a tent)] (a tail fan: tail[0] is its length),
               shinFeather (the shin in its feathers), scales (ticks on the bare shank), toes (the front toes' length:
               feet instead of paws), peckDrop (x len), peckHead (rad); wing { x, u, f (its root from the withers),
               len, r (half its width) }
     gait      headBob (tiles: a hen's head holds still in the air, then thrusts forward with each step)
     look      horn, hoof, beard, flank, comb (also the wattle), tailCol, legShade (the far legs), ears "side" (a goat's,
               out to its sides), bib (false: no lighter chest), brows (false: none)
   Sizes: the yard stands the 2D goat at scale 0.7 on its 112 x 96 canvas (0.0073 tiles a unit): its back about 0.43
   tiles up, its head's top 0.51, its horns' tips 0.59, nose to tail about 0.66; the 2D hen at scale 0.3 on 56 x 56
   (0.0054 tiles a unit): her back 0.17, her head 0.19 (its middle), her comb's top 0.26, beak to tail 0.26. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const B3 = ZSR.Beast3D;
  if (!B3) return;

  // a goat: cream with a brown patch on its flank, dark legs and hooves, dark horns sweeping back, a grey beard, ears
  // out to its sides, a short tail that flicks up. Walks slowly; grazes, lies down with its forelegs folded, bleats.
  B3.addType("goat", {
    plan: "quad",
    skin: "fur",
    h: 0.66,
    w: 0.96,
    r: 0.26,
    poses: ["stand", "walk", "graze", "lie", "bleat"],
    build: {
      len: 0.3, hipH: 0.3, shH: 0.3,
      body: [[-0.02, 0.014, 0.072, 0.094, 0.11], [0.5, -0.004, 0.088, 0.116, 0.26], [0.98, 0.006, 0.076, 0.102, 0.1]],
      bodyReach: 0.2,
      neck: [0.15, 0.037], neckAng: 1.15, neckFwd: 0.01,
      head: [0.045, 0.05, 0.056], headUp: 0.02, headFwd: 0.035, headPitch: 0.35,
      snout: [0.075, 0.032, 0.035, -0.02, 0.03], ear: 1.15, eye: 0.8, eyeSide: 0.6, nose: 0.7,
      horns: [0.13, 0.011, 0.3, 0.8, 0.032], beard: [0.055, 0.022],
      flank: [[0.3, 0.01, 0.075, 0.06, -1, 0.086], [0.15, 0.03, 0.05, 0.042, 1, 0.084]],
      hipW: 0.045, shW: 0.045, hipDrop: 0.03, shDrop: 0.03, footW: 0.046,
      fore: [0.1, 0.1], hind: [0.11, 0.11], pastern: [0.07, 0.08],
      foreAng: 0.05, hindAng: 0.25,
      legR: [0.025, 0.014, 0.031, 0.015, 0.012], paw: [0.013, 0.012, 0.017], pawR: 0.012,
      tail: [0.06, 0.012, 0.01], tailAt: [0.06, -0.11], tailUp: 1.1, tailCurl: 0.2, wagAmp: 0.35,
      jawOpen: 0.5, tufts: 0,
      sitH: 0.12, sitNeck: 1.1, lieH: 0.12, lieNeck: 0.9, lieFold: true, lieTail: [0.7, 0.15], lieChew: 0.22,
      grazeDrop: 0.15, grazeHead: 1.3,
      shadow: [0.11, 0.3],
    },
    gait: {
      stride: 0.6, duty: 0.68, lift: 0.04, bob: 0.004, roll: 0.012, neckDrop: 0.08, headDip: 0.05, nod: 0.06, tailUp: 1.0,
      foreRoll: 0.45, hindRoll: 0.45, foreFold: -1.3, hindFold: 0.8, phase: [0.25, 0.75, 0, 0.5], turnRate: 4,
    },
    gaitRun: {
      stride: 1.1, duty: 0.38, lift: 0.06, hindLift: 1.2, bob: 0.012, rock: 0.04, rockPh: 3.4, flex: 0.03, roll: 0.01,
      neckDrop: 0.15, headDip: 0.1, nod: 0.08, tailUp: 1.2, foreRoll: 0.8, hindRoll: 0.8, foreFold: -1.6, hindFold: 1.2,
      phase: [0.5, 0.6, 0, 0.1],
    },
    look: {
      fur: "#e6dfcc", shade: "#cdc4ad", light: "#d8cdbd", flank: "#8a6a46", nose: "#4d433e", earIn: "#e2ab9c",
      eye: "#16110d", mouth: "#6e3832", horn: "#5f554c", hoof: "#262220", legCol: "#4e4741", legShade: "#3b3531",
      beard: "#c9c4b8", ears: ["side", "side"], bib: false, brows: false,
    },
  });

  // a hen: white, a red comb and wattle, a yellow beak and scaly yellow legs, her wings folded at her sides, a fan of
  // tail feathers. Bobs her head as she walks; pecks at the ground; flaps her wings; settles down to sit.
  B3.addType("chicken", {
    plan: "biped",
    skin: "fur",
    h: 0.34,
    w: 0.48,
    r: 0.1,
    poses: ["stand", "walk", "peck", "flap", "sit"],
    build: {
      len: 0.07, hipH: 0.105, shH: 0.12, hipFwd: 0.03, hindZ: 0.03,
      body: [[0, 0.005, 0.05, 0.06, 0.06], [0.85, 0, 0.052, 0.065, 0.06]],
      neck: [0.06, 0.024], neckAng: 1.15,
      head: [0.034, 0.038, 0.04], headUp: 0.012, headFwd: 0.008, headPitch: 0,
      snout: [0.03, 0.011, 0.011, -0.004, 0.03], beakTip: 0.4, eye: 0.65, eyeSide: 0.75,
      comb: [0.032, 0.05, 3], wattle: [0.022, 0.016],
      hipW: 0.022, hipDrop: 0.02, footW: 0.02,
      fore: [0.03, 0.03], hind: [0.03, 0.035], pastern: [0.03, 0.04], hindAng: 0.12,
      legR: [0.02, 0.008, 0.024, 0.011, 0.0055], paw: [0.01, 0.004, 0.012], pawR: 0.004,
      shinFeather: true, scales: 3, toes: 0.026,
      tail: [0.085, 0.016, 0.01], tailAt: [0.03, -0.05], tailUp: 0.95, tailCurl: 0, wagAmp: 0.12,
      fan: [4, 0.8, 0.012, 0.32],
      jawOpen: 0, tufts: 0,
      sitH: 0.06, sitNeck: 1.3, lieH: 0.06, lieNeck: 1.2,
      peckDrop: 0.6, peckHead: 1.1,
      wing: { x: 0.046, u: 0.024, f: 0.012, len: 0.092, r: 0.027 },
      shadow: [0.055, 0.09],
    },
    gait: {
      stride: 0.16, duty: 0.6, lift: 0.025, bob: 0.003, roll: 0.03, neckDrop: 0, headDip: 0, nod: 0.04, tailUp: 0.95,
      hindRoll: 0.5, hindFold: 0.9, headBob: 0.012, phase: [0, 0, 0, 0.5], turnRate: 6,
    },
    gaitRun: {
      stride: 0.3, duty: 0.4, lift: 0.04, bob: 0.006, roll: 0.02, nod: 0.05, headBob: 0.008, hindRoll: 0.8, hindFold: 1.2,
    },
    look: {
      fur: "#f3eee0", shade: "#d9d1bf", wing: "#e8e1cf", tailCol: "#efe9da", beak: "#d9a21b", legCol: "#d9a21b",
      legShade: "#b88a1c", comb: "#c0302a", eye: "#0f1012", bib: false, brows: false,
    },
  });
})(typeof window !== "undefined" ? window : globalThis);
