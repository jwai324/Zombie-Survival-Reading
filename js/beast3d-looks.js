/* The animals' looks for js/beast3d.js: the stray dog (docs/CREW.md) and Rivet, Tomas's rebuilt Bolt-model robot dog
   (docs/UNIVERSES.md), matched to their 2D art (js/crewart.js crewDog, js/crossart.js roboDog: the same colours and
   parts, the same size). Data only. Stage 3's goats and chickens go in an appended js/beast3d-looks2.js (loaded after
   this file, before js/interior.js) calling Beast3D.addType the same way.

   def:
     plan    "quad" (four legs) | "biped" (two legs and two wings)
     skin    "fur" | "metal"
     h       box height, tiles: room for its head and ears in every pose (Beast3D.box(id).h)
     w       box width, tiles at screen proportions: room for any pose at any yaw
     r       hit radius, tiles: a bar's width (Beast3D.box(id).bar) comes from it
     poses   the poses it has (Beast3D.POSES); any other draws "stand"
     build   tiles (radians for angles):
             len (hips to withers), hipH, shH (the spine's height over the hind and the fore legs);
             body [[t along hips..withers, up, across, up, along radii], ...] (fur: the blob's ellipsoids, the chest
             last; metal: for its reach) or box [across, up, along half sizes, up offset] (metal);
             neck [length, radius], neckAng (its angle above level, standing), neckFwd;
             head [across, up, along radii], headUp, headFwd (the skull from the neck's top), headPitch (nose down);
             snout [length, across, up radii, up offset, where it starts forward]; ear (size x); cheek (fur cheeks);
             antenna [length, radius, ball radius];
             hipW, shW, hipDrop, shDrop, hipFwd, shFwd (the legs' tops from the spine); footW (paws apart),
             foreZ, hindZ (paws forward of the spine's ends);
             fore [upper, forearm], hind [thigh, shin], pastern [fore, hind] (bone lengths);
             foreAng, hindAng (the pastern's lean back from upright, standing); legR [fore top, fore low, hind top,
             hind low, pastern] (radii); paw [across, up, along radii], pawR (its height: the paw's middle);
             tail [length, radius, its height lying on the floor], tailAt [up, along from the hips], tailUp (its
             angle above straight back, standing), tailCurl, wagAmp (rad);
             jawOpen (rad the jaw drops, all the way); tufts (scruff points along the belly);
             sitH, sitNeck (sitting: the hips' height, the neck's angle); lieH, lieNeck (lying);
             shadow [across, along radii]; wing { x, u, f, len, r } (a biped's)
     gait    stride (tiles per cycle: Beast3D.stride), duty (share of a step a paw is planted), lift, hindLift (x),
             crouch, bob, rock (the back rocking, tiles), rockPh, flex (the back gathering and stretching), roll,
             neckDrop, headDip, nod, tailUp, foreRoll, hindRoll (the pastern through a step), foreFold, hindFold (in
             the swing), phase [fore left, fore right, hind left, hind right] (each paw's step), turnRate (rad/s)
     gaitRun the same fields for a full gallop (st.run 1); in between they blend
     look    colours ([r,g,b] or "#rrggbb"): fur, shade (far legs), light (muzzle, bib), patchCol, nose, ear, earIn,
             eye, mouth, tongue (fur); body, dark, light, joint, eye (lit), eyeOff, bright (zapping), tip (the
             antenna's ball), badge, badgeStar, nose (metal); wing, beak (the snout drawn as a beak in this colour),
             legCol (the legs and feet in this colour) for a bird; parts: ears [left, right] ("up" | "flop" | "tri" |
             null), patch (-1 over its left eye, 1 its right), pant (pants standing), scruff (cheek tufts).
             Stage 3's goat and chicken parts (horns, a beard, hooves, a comb, a tail fan) are new look fields drawn by
             new code in js/beast3d.js; COLOR_KEYS already lists horn, hoof and comb
     variants  looks the seed picks between (each overrides look)
   Sizes: the 2D dog is drawn 0.36 tiles tall for its 64-unit canvas (js/crewart.js CREW_ART.scale.crewDog), so a unit
   is 0.0056 tiles: its back stands about 0.2 tiles, its head about 0.25, its ear's tip about 0.33; nose to tail about
   0.4. Rivet (js/crossart.js CROSS_ART.scale.roboDog 0.34): back 0.175, antenna's tip about 0.3. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const B3 = ZSR.Beast3D;
  if (!B3) return;

  // the stray: scruffy, medium-size, sandy tan with a lighter muzzle and chest, a dark brown patch over its right
  // eye, its left ear up and its right one flopped, a long scruffy tail. Trots after its leader; gallops to catch up.
  B3.addType("dog", {
    plan: "quad",
    skin: "fur",
    h: 0.4,
    w: 0.62,
    r: 0.2,
    poses: ["stand", "walk", "sit", "lie", "bark"],
    build: {
      len: 0.165, hipH: 0.15, shH: 0.155,
      body: [[-0.02, 0.004, 0.041, 0.043, 0.052], [0.5, -0.002, 0.043, 0.04, 0.085], [0.93, -0.008, 0.046, 0.052, 0.055]],
      neck: [0.085, 0.03], neckAng: 1.0,
      head: [0.041, 0.042, 0.044], headUp: 0.024, headFwd: 0.012, headPitch: 0.12,
      snout: [0.044, 0.022, 0.02, -0.014, 0.023], ear: 1, cheek: 0.92,
      hipW: 0.026, shW: 0.028, hipDrop: 0.012, shDrop: 0.018, footW: 0.03,
      fore: [0.054, 0.064], hind: [0.058, 0.06], pastern: [0.026, 0.04],
      foreAng: 0.1, hindAng: 0.22,
      legR: [0.022, 0.0125, 0.03, 0.0135, 0.0105], paw: [0.014, 0.0095, 0.019], pawR: 0.0095,
      tail: [0.105, 0.0085, 0.008], tailAt: [0.022, -0.048], tailUp: 0.55, tailCurl: 0.18, wagAmp: 0.6,
      jawOpen: 0.62, tufts: 4,
      sitH: 0.046, sitNeck: 1.2, lieH: 0.052, lieNeck: 0.75,
      shadow: [0.07, 0.16],
    },
    gait: {
      stride: 0.5, duty: 0.55, lift: 0.03, bob: 0.004, roll: 0.02, neckDrop: 0.12, headDip: 0.06, nod: 0.05, tailUp: 0.4,
      foreRoll: 0.5, hindRoll: 0.5, foreFold: -1.4, hindFold: 0.8, phase: [0.5, 0, 0, 0.5], turnRate: 8,
    },
    gaitRun: {
      stride: 0.95, duty: 0.36, lift: 0.05, hindLift: 1.2, bob: 0.01, rock: 0.03, rockPh: 3.4, flex: 0.022, roll: 0.01,
      neckDrop: 0.3, headDip: 0.12, nod: 0.08, tailUp: 0.15, foreRoll: 0.9, hindRoll: 0.9, foreFold: -1.7, hindFold: 1.2,
      phase: [0.5, 0.6, 0, 0.1],
    },
    look: {
      fur: "#d6ab68", shade: "#b58a4e", light: "#f0d9ac", patchCol: "#56351f", nose: "#1b1512", ear: "#a97b42",
      earIn: "#e3a994", eye: "#120d0a", mouth: "#7a2a26", tongue: "#e06a78",
      ears: ["up", "flop"], patch: 1, pant: true, scruff: true,
    },
  });

  // Rivet: a Bolt-model robot dog Tomas rebuilt: brushed steel panels and box head, dark joints, a triangle ear each
  // side, an antenna with a red ball, a blue visor that glows, a chemistry-tester nose, a metal tail that wags, the
  // gold star badge on its right flank. Zaps from its nose; shut down, it slumps and its lights go dark.
  B3.addType("robodog", {
    plan: "quad",
    skin: "metal",
    h: 0.36,
    w: 0.6,
    r: 0.2,
    poses: ["stand", "walk", "sit", "zap", "off"],
    build: {
      len: 0.15, hipH: 0.135, shH: 0.138,
      box: [0.036, 0.036, 0.112, 0.003],
      body: [[0, 0.003, 0.036, 0.036, 0.04], [1, 0.003, 0.036, 0.036, 0.04]],
      neck: [0.07, 0.012], neckAng: 0.95,
      head: [0.033, 0.03, 0.035], headUp: 0.02, headFwd: 0.012, headPitch: 0.08,
      snout: [0.05, 0.022, 0.018, -0.008, 0.02], ear: 1,
      antenna: [0.045, 0.0035, 0.009],
      hipW: 0.026, shW: 0.026, hipDrop: 0.02, shDrop: 0.02, footW: 0.028,
      fore: [0.05, 0.052], hind: [0.05, 0.052], pastern: [0.014, 0.014],
      foreAng: 0.05, hindAng: 0.12,
      legR: [0.012, 0.011, 0.012, 0.011, 0.01], paw: [0.013, 0.0075, 0.018], pawR: 0.0075,
      tail: [0.085, 0.0075, 0.008], tailAt: [0.024, -0.03], tailUp: 0.7, tailCurl: 0.12, wagAmp: 0.45,
      jawOpen: 0, tufts: 0,
      sitH: 0.04, sitNeck: 1.15, lieH: 0.037, lieNeck: 0.7,
      shadow: [0.065, 0.15],
    },
    gait: {
      stride: 0.45, duty: 0.58, lift: 0.025, bob: 0.003, roll: 0.012, neckDrop: 0.08, headDip: 0.04, nod: 0.025, tailUp: 0.55,
      foreRoll: 0.35, hindRoll: 0.35, foreFold: -1, hindFold: 0.6, phase: [0.5, 0, 0, 0.5], turnRate: 8,
    },
    gaitRun: {
      stride: 0.85, duty: 0.4, lift: 0.045, hindLift: 1.1, bob: 0.008, rock: 0.022, rockPh: 3.4, flex: 0.012, roll: 0.008,
      neckDrop: 0.22, headDip: 0.1, nod: 0.05, tailUp: 0.3, foreRoll: 0.7, hindRoll: 0.7, foreFold: -1.3, hindFold: 0.9,
      phase: [0.5, 0.6, 0, 0.1],
    },
    look: {
      body: "#a9b3bd", dark: "#6f7a86", light: "#d9e0e6", joint: "#4b545e", eye: "#5cc8ff", eyeOff: "#26303a",
      bright: "#bff0ff", tip: "#e35b4a", badge: "#e8b923", badgeStar: "#9a6a12", nose: "#0f1012",
      ears: ["tri", "tri"],
    },
  });
})(typeof window !== "undefined" ? window : globalThis);
