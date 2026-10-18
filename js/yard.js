/* Yard mode for the first-person view, mixed into ZSR.Interior: the home base yard
   (cabin defense). The fence you can shoot over, holes and repairs, traps, the wave
   phases (calm / some / many, from one or more sides; the dinner bell and gunfire bring the
   next one sooner), the van (map), the ground, the ten room plots and what each room level
   builds on them, and the yard's HUD goal. The cabin itself (a house you walk into: the build
   menu is its office computer) is js/house.js.
   Yard legend (WORLD.YARD.grid): T treeline  F fence segment  V the van  P player start
   z walker spawn (outside the fence), and the cabin's own legend (WORLD.HOUSE).
   The plots are WORLD.YARD.plots; the textures and sprites named below are drawn in
   yardart.js (the gun in sprites3d.js reads the upgrades itself; the van is the road's 3D van, Van3D, stood on its
   tiles by js/modelsprite.js, and redraws itself when its paint, gear or dents change). Every prop, sign and plaque
   whose art has a 3D model (js/yardmodels.js) is drawn as it, turned with its plot (modelProps, after dressYard put
   them up); a blinking beacon is its model on and off (the prop's dim). The crew who live
   here (wandering, the shelter in a wave, their jobs, the talk bubble, the dog) are js/crew.js: this
   file calls crewEnter, crewDress, crewUpdate, crewWave, crewFacing, crewInteract and crewHint.
   June's first-run tutorial (js/tutorial.js) watches the yard from yardUpdate; while it sets this.yardHold the
   calm stands still (no wave, no "next in"), shots never bring the wave sooner and the van waits.
   A breach draws only the walkers outside the fence near it (DEFENSE.breachRange: the core's PathBlock hook,
   yardPathBlock below); everyone else claws their own segment. A wave's walkers each roll a role once: raiders
   (the cabin, js/house.js), wreckers (the van and the room builds, js/yardwreck.js, which also holds the builds'
   strength, their wrecked look and their repairs), and the rest come for you. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const D3 = () => ZSR.Draw3;
  const W = () => ZSR.WORLD;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /** One entry of [[item, weight, ...], ...], picked by weight. */
  const pickWeighted = (list) => {
    let r = Math.random() * list.reduce((s, e) => s + e[1], 0);
    for (const e of list) if ((r -= e[1]) < 0) return e;
    return list[list.length - 1];
  };
  /** The list in a random order (in place). */
  const shuffle = (list) => {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };
  // where a wave comes from, as the toast says it (the yard's north is the back fence, far from the cabin door)
  const SIDE_NAMES = { n: "the back fence", s: "the fence behind the cabin", w: "the fence by the garage", e: "the fence by the farm" };
  // name signs and plaques grow with the text size setting like all text the player must read (building.js
  // does the same), so Large and Huge can still read them from the cabin door
  const SIGN_SCALE = { normal: 1, large: 1.3, huge: 2 };
  // SCALE: the lot sign stands solid across this many tiles of its lot's front row (odd; a narrower lot: one), its
  // board as wide as the 3D sign's own (js/yardmodels1.js ySign board.wide) and never past its foot less
  // LOT_SIGN_MARGIN tiles (so at Huge its posts still stand on it): the names read as big as the old sprite's
  const LOT_SIGN_FOOT = 3;
  const LOT_SIGN_MARGIN = 0.15;
  const OPP = { n: "s", s: "n", e: "w", w: "e" };
  // the way a plot's front faces (the world's angles: 0 east, PI / 2 south): its props' 3D models face it (js/yardmodels.js)
  const FRONT = { e: 0, s: Math.PI / 2, w: Math.PI, n: -Math.PI / 2 };
  const LEFT = { s: "w", n: "e", e: "s", w: "n" }; // your left hand as you face a plot's front from outside
  const SIDE_BIT = { n: 1, e: 2, s: 4, w: 8 };
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const CABIN_CUE_SECS = 20; // seconds between "Walkers are waiting in the cabin" while they hold a wave open
  const CABIN_LABEL = " · walkers in the cabin"; // the wave label's tail while walkers stand in the cabin, out of sight
  // the farm's animals (b.flock): their speed in tiles a second, how long they rest at a spot, and in 3D (a live
  // Beast3D figure: js/beast3d-looks2.js) their type and what they do at rest: [pose, weight, seconds] (with seconds,
  // a bleat or a flap, it plays that long and then they stand). Without Beast3D's farm looks they stay the 2D sprites.
  // SCALE: a new farm animal is a row here and a Beast3D look (with its sprite art for the fallback)
  const ANIMALS = {
    yGoat: { type: "goat", speed: 0.35, rest: [2.5, 7], idle: [["graze", 6], ["stand", 3], ["bleat", 1, 1.5]] },
    yChicken: { type: "chicken", speed: 0.45, rest: [1.5, 5], idle: [["peck", 6], ["stand", 3], ["sit", 1.5], ["flap", 0.6, 1.4]] },
  };
  const ANIMAL_TURN = 0.6; // radians: a spot farther round than this, a 3D animal turns to it before it sets off
  // frames: a 3D animal's picture is redrawn at most this often (15 a second at 60; its place on screen moves every
  // frame). Five of them near you redrew 4 pictures a frame, half again the yard's render time on a software canvas
  const ANIMAL_EVERY = 4;
  const ANIMAL_LOOK = 2.5; // tiles: you this close, a 3D animal standing at rest looks at you

  /** A wall face from yardart's "yWall": material, base color, feature (window, door ...), sign slice, part of a wide feature. */
  const wall = (m, c, f, s, p) => {
    const opts = { m };
    if (c) opts.c = c;
    if (f) opts.f = f;
    if (s) opts.s = s;
    if (p) opts.p = p;
    return { name: "yWall", opts };
  };
  /** Which part of a feature that spans `n` tiles tile `i` is (wide doors, signs): l, m or r. */
  const part = (i, n) => (n < 2 ? null : i === 0 ? "l" : i === n - 1 ? "r" : "m");

  /* ---------- What each room level builds on its plot ----------
     Each builder gets a plot frame `b` in local tiles: u runs left to right as you face the plot's
     front, v from the front row (0) to the back (b.D - 1). b.box (opaque, with an optional gabled
     roof), b.low (see-through and solid, shoot-over), b.prop (sprites; solid ones block their tile)
     and b.floor. Every level leaves room to walk around it, and its front-left tile for the name plaque
     unless it moves the plaque (b.plaque = [U, V]). A prop whose art has a 3D model (js/yardmodels.js) is drawn
     as it, facing the plot's front (its `turn`, radians, turns it from there: toward the plot's left at PI / 2). */
  const BUILDS = {
    garage: [
      // a lean-to tool shed, a workbench and a stack of tires
      (b) => {
        const P = "#8a6a46";
        b.floor(0, 1, b.W, b.D - 1, "concrete");
        b.box(0, 2, 2, 2, { h: 0.95, tex: wall("plank", P), front: wall("plank", P, "tools"), roof: { ridge: 1.35, tex: "yRoofTin", gable: "yGablePlank" } });
        b.low(2, 3, 2, 1, { h: 0.42, tex: "yBench", top: "#9a7650" });
        b.prop(4.5, 3.5, "yTires", null, { scale: 0.62, solid: true });
        b.prop(3.4, 2.5, "yJerry", null, { scale: 0.34 });
      },
      // a shed with a roll-up door, tires and an oil drum
      (b) => {
        const P = "#7a4a36";
        b.floor(0, 0, b.W, b.D, "concrete");
        b.box(0, 1, 4, 3, {
          h: 1.1,
          tex: wall("plank", P),
          face: (iu, iv, side) => (side !== "front" ? null : iu === 1 || iu === 2 ? wall("plank", P, "roll", null, part(iu - 1, 2)) : wall("plank", P, "win")),
          roof: { ridge: 1.65, tex: "yRoofTin", gable: "yGablePlank" },
        });
        b.prop(4.5, 3.5, "yTires", null, { scale: 0.66, solid: true });
        b.prop(4.5, 2.5, "yDrum", { c: "#3a4a6a" }, { scale: 0.58, solid: true });
        b.prop(4.4, 1.6, "yJerry", null, { scale: 0.34 });
      },
      // a metal workshop with a sign, a car lift out front and an engine hoist
      (b) => {
        const M = "#6f7a80";
        b.floor(0, 0, b.W, b.D, "concrete");
        b.box(0, 2, 5, 2, {
          h: 1.3,
          tex: wall("metal", M),
          face: (iu, iv, side) => (side !== "front" ? null : iu === 0 || iu === 4 ? wall("metal", M, "win") : wall("metal", M, "roll", { t: "GARAGE", i: iu - 1, n: 3 }, part(iu - 1, 3))),
          roof: { ridge: 1.85, tex: "yRoofTin", gable: "yGableMetal" },
        });
        b.low(2, 1, 1, 1, { h: 0.9, tex: "yLift" });
        b.prop(0.5, 1.5, "yHoist", null, { scale: 1.35, solid: true, cover: false });
        b.prop(4.5, 1.5, "yTires", null, { scale: 0.66, solid: true });
        b.prop(3.4, 1.4, "yJerry", null, { scale: 0.34 });
      },
    ],
    power: [
      // fuel drums and a string of lights
      (b) => {
        b.low(0, 2, b.W, 1, { h: 1.3, tex: "yLights" });
        b.prop(1.6, 1.4, "yDrum", { c: "#b3261e" }, { scale: 0.58, solid: true });
        b.prop(2.3, 1.7, "yDrum", { c: "#d9a21b" }, { scale: 0.58 });
        b.prop(3.4, 1.3, "yJerry", null, { scale: 0.34 });
      },
      // a generator box with its exhaust, cables on spools, the drums
      (b) => {
        b.floor(0, 0, b.W, b.D, "gravel");
        b.low(0, 2, b.W, 1, { h: 1.3, tex: "yLights" });
        b.box(1, 1, 2, 1, { h: 0.72, tex: wall("gen"), front: wall("gen", null, "panel") });
        b.prop(2.75, 1.5, "yExhaust", null, { scale: 0.55, lift: 0.72 });
        b.prop(3.5, 1.5, "ySpool", null, { scale: 0.48, solid: true });
        b.prop(0.5, 1.5, "yDrum", { c: "#b3261e" }, { scale: 0.58, solid: true });
      },
      // solar panels and a floodlight mast beside the generator
      (b) => {
        b.floor(0, 0, b.W, b.D, "gravel");
        b.low(0, 2, b.W, 1, { h: 0.62, tex: "ySolar" });
        b.box(1, 1, 2, 1, { h: 0.72, tex: wall("gen"), front: wall("gen", null, "panel") });
        b.prop(2.75, 1.5, "yExhaust", null, { scale: 0.55, lift: 0.72 });
        b.prop(0.5, 1.5, "yDrum", { c: "#b3261e" }, { scale: 0.58, solid: true });
        b.prop(3.5, 0.5, "yFlood", null, { scale: 2.9, solid: true, cover: false });
      },
    ],
    water: [
      // rain barrels under funnels
      (b) => {
        b.prop(0.5, 1.5, "yRainBarrel", null, { scale: 0.7, solid: true });
        b.prop(1.5, 1.7, "yRainBarrel", null, { scale: 0.7, solid: true });
        b.prop(2.5, 1.5, "yRainBarrel", null, { scale: 0.7, solid: true });
      },
      // a tank up on a stand
      (b) => {
        b.floor(0, 0, b.W, b.D, "gravel");
        b.prop(1.5, 1.6, "yTankStand", null, { scale: 2.0, solid: true, foot: [3, 3] });
      },
      // a tall tank with a ladder, pipes along the front, a spare barrel
      (b) => {
        b.floor(0, 0, b.W, b.D, "gravel");
        b.low(0, 0, b.W, 1, { h: 0.26, tex: "yPipe", top: "#8f969c" });
        b.prop(1.5, 1.7, "yTankTall", null, { scale: 2.8, solid: true, foot: [3, 3] });
        b.prop(2.55, 0.5, "yRainBarrel", null, { scale: 0.62, lift: 0.26 });
        b.plaque = [0.5, 0.42];
      },
    ],
    garden: [
      // two raised beds, freshly planted
      (b) => {
        b.floor(0, 0, b.W, b.D, "dirt");
        b.low(0, 1, 2, 1, { h: 0.3, tex: { name: "yBed", opts: { lush: 0 } }, top: "#4a3a26" });
        b.low(2, 1, 2, 1, { h: 0.3, tex: { name: "yBed", opts: { lush: 0 } }, top: "#4a3a26" });
      },
      // four beds, everything coming up, sunflowers at the end of the path
      (b) => {
        b.floor(0, 0, b.W, b.D, "dirt");
        [1, 3].forEach((v) => [0, 2].forEach((u) => b.low(u, v, 2, 1, { h: 0.42, tex: { name: "yBed", opts: { lush: 1 } }, top: "#4f7a32" })));
        b.prop(0.5, 2.5, "yPlants", null, { scale: 1.05, solid: true, cover: false });
      },
      // a hoop greenhouse behind two beds of tomatoes, sunflowers by the door
      (b) => {
        b.floor(0, 0, b.W, b.D, "dirt");
        const door = (iu) => iu === 1 || iu === 2;
        b.box(0, 2, 4, 2, { h: 0.7, tex: wall("plastic"), front: (iu) => wall("plastic", null, door(iu) ? "flap" : null, null, door(iu) ? part(iu - 1, 2) : null), roof: { ridge: 1.45, tex: "yRoofPlastic", gable: "yGablePlastic" } });
        b.low(0, 1, 2, 1, { h: 0.42, tex: { name: "yBed", opts: { lush: 2 } }, top: "#4f7a32" });
        b.low(2, 1, 2, 1, { h: 0.42, tex: { name: "yBed", opts: { lush: 2 } }, top: "#4f7a32" });
        b.prop(3.5, 0.5, "yPlants", null, { scale: 1.05, solid: true, cover: false });
      },
    ],
    radio: [
      // a timber tower lashed with rope, a whip antenna on top, a car battery and a spool of wire at its feet
      (b) => {
        b.low(1, 1, 1, 1, { h: 2.2, tex: { name: "yTimber", opts: { n: 3 } } });
        b.prop(1.5, 1.5, "yWhip", null, { scale: 1.1, lift: 2.2 });
        b.prop(2.5, 2.4, "ySpool", null, { scale: 0.45, solid: true });
        b.prop(0.6, 2.4, "yJerry", null, { scale: 0.34 });
      },
      // a steel lattice tower on guy wires: a dish halfway up, the whip and a blinking red light on top
      (b) => {
        b.floor(0, 0, b.W, b.D, "gravel");
        b.low(1, 1, 1, 1, { h: 3.6, tex: { name: "yLattice", opts: { n: 5 } } });
        b.prop(1.5, 1.5, "yGuys", null, { scale: 3.6 });
        b.prop(1.5, 0.95, "yDish", null, { scale: 0.6, lift: 2.0 });
        b.prop(1.5, 1.5, "yWhip", null, { scale: 1.0, lift: 3.6 });
        b.anim(b.prop(1.5, 1.5, "yBeacon", null, { scale: 0.26, lift: 3.55 }), "blink");
        b.prop(2.5, 2.4, "ySpool", null, { scale: 0.45, solid: true });
      },
      // a red and white broadcast tower: two dishes, blinking lights at the middle and the top, a tall whip,
      // the guy wires, and an equipment hut with solar panels at its feet
      (b) => {
        const M = "#6f7a80";
        b.floor(0, 0, b.W, b.D, "gravel");
        b.low(1, 1, 1, 1, { h: 5.2, tex: { name: "yTower", opts: { n: 7 } } });
        b.prop(1.5, 1.5, "yGuys", null, { scale: 5.2 });
        b.prop(1.5, 0.95, "yDish", null, { scale: 0.7, lift: 2.1 });
        b.prop(0.95, 1.5, "yDish", null, { scale: 0.55, lift: 3.5, turn: Math.PI / 2 }); // (on the tower's left face, facing out)
        b.prop(1.5, 1.5, "yWhip", null, { scale: 1.3, lift: 5.2 });
        b.anim(b.prop(1.5, 1.5, "yBeacon", null, { scale: 0.3, lift: 5.15 }), "blink");
        b.anim(b.prop(1.5, 0.92, "yBeacon", null, { scale: 0.24, lift: 2.9 }), "blink");
        b.box(2, 2, 1, 1, { h: 0.9, tex: wall("metal", M), front: wall("metal", M, "door", { t: "RADIO", i: 0, n: 1 }), roof: { ridge: 1.2, tex: "yRoofTin", gable: "yGableMetal" } });
        b.low(0, 2, 1, 1, { h: 0.62, tex: "ySolar" });
      },
    ],
    medbay: [
      // a canvas tent with a red cross, a flag on a pole
      (b) => {
        b.box(0, 1, 3, 2, { h: 0.42, tex: wall("canvas"), front: (iu) => wall("canvas", null, iu === 1 ? "flap" : null), roof: { ridge: 1.25, tex: "yRoofCanvas", gable: "yGableCanvas" } });
        b.prop(3.5, 2.5, "yFlag", null, { scale: 1.7, solid: true, cover: false });
      },
      // a white hut with a red-cross door
      (b) => {
        const C = "#e6dfcc";
        b.floor(0, 0, b.W, b.D, "planks");
        b.box(0, 1, 3, 3, { h: 1.0, tex: wall("siding", C, "win"), face: (iu, iv, side) => (side === "front" ? wall("siding", C, iu === 1 ? "doorCross" : "win") : side === "back" ? wall("siding", C) : null), roof: { ridge: 1.6, tex: "yRoofTinWhite", gable: "yGableWhite" } });
        b.prop(3.5, 2.5, "yFlag", null, { scale: 1.7, solid: true, cover: false });
      },
      // a clinic with a lit sign over the door
      (b) => {
        const C = "#e6dfcc";
        b.floor(0, 0, b.W, b.D, "planks");
        b.box(0, 1, 4, 3, {
          h: 1.25,
          tex: wall("siding", C, "win"),
          face: (iu, iv, side) => (side === "front" ? (iu === 0 || iu === 3 ? wall("siding", C, "winLit") : wall("siding", C, "doorCross", { t: "CLINIC", i: iu - 1, n: 2, lit: 1 }, part(iu - 1, 2))) : side === "back" ? wall("siding", C) : null),
          roof: { ridge: 1.85, tex: "yRoofTinRed", gable: "yGableWhite" },
        });
        b.prop(0.5, 0.5, "yFlag", null, { scale: 1.7, solid: true, cover: false });
        b.plaque = [3.45, 0.5];
      },
    ],
    archive: [
      // crates of books under a blue tarp
      (b) => {
        b.box(1, 1, 3, 2, { h: 0.55, tex: wall("crates"), roof: { ridge: 0.95, tex: "yRoofTarp", gable: "yGableTarp" } });
        b.prop(4.5, 1.5, "yBooks", null, { scale: 0.48, solid: true });
        b.prop(4.4, 0.55, "yBooks", null, { scale: 0.4 });
      },
      // a shed with open shelves of books along its front
      (b) => {
        const P = "#6b4a3a";
        b.floor(0, 0, b.W, b.D, "planks");
        b.box(0, 1, 4, 2, { h: 1.05, tex: wall("plank", P), front: wall("plank", P, "shelf"), roof: { ridge: 1.5, tex: "yRoofTin", gable: "yGablePlank" } });
        b.prop(4.5, 1.5, "yBooks", null, { scale: 0.48, solid: true });
      },
      // a brick library hut with a sign and lit windows
      (b) => {
        const B = "#8a4a3a";
        b.floor(0, 0, b.W, b.D, "planks");
        b.box(0, 1, 5, 2, {
          h: 1.25,
          tex: wall("brick", B, "win"),
          face: (iu, iv, side) => (side === "front" ? (iu === 0 || iu === 4 ? wall("brick", B, "winLit") : wall("brick", B, iu === 2 ? "door" : "winLit", { t: "ARCHIVE", i: iu - 1, n: 3 }, part(iu - 1, 3))) : side === "back" ? wall("brick", B) : null),
          roof: { ridge: 1.9, tex: "yRoofShingle", gable: "yGablePlank" },
        });
        b.prop(4.5, 0.5, "yLamp", null, { scale: 1.6, solid: true, cover: false });
      },
    ],
    well: [
      // a ring of stones around the shaft, a bucket on a rope
      (b) => {
        b.floor(0, 0, b.W, b.D, "gravel");
        b.prop(1.5, 1.5, "yWellRing", null, { scale: 0.62, solid: true });
      },
      // a little roof over the well and a crank for the bucket
      (b) => {
        b.floor(0, 0, b.W, b.D, "gravel");
        b.prop(1.5, 1.5, "yWellRoof", null, { scale: 1.55, solid: true });
        b.prop(2.4, 0.6, "yBucket", null, { scale: 0.26 });
      },
      // a hand pump beside the well, pipes to a trough
      (b) => {
        b.floor(0, 0, b.W, b.D, "gravel");
        b.prop(1.5, 1.5, "yWellRoof", null, { scale: 1.55, solid: true });
        b.low(0, 2, 2, 1, { h: 0.2, tex: "yPipe", top: "#8f969c" });
        b.prop(2.5, 2.5, "yPump", null, { scale: 0.95, solid: true, cover: false });
        b.low(2, 1, 1, 1, { h: 0.34, tex: "yTrough", top: "#3a7aa0" });
      },
    ],
    farm: [
      // crop rows and a scarecrow
      (b) => {
        b.floor(0, 0, b.W, b.D, "dirt");
        b.low(0, 1, b.W, 1, { h: 0.3, tex: "yCrops", top: "#6f8a3a" });
        b.low(0, 3, b.W, 1, { h: 0.3, tex: "yCrops", top: "#6f8a3a" });
        b.prop(2.5, 2.5, "yScarecrow", null, { scale: 1.3, solid: true, cover: false });
        b.prop(2.5, 4.5, "yHay", null, { scale: 0.5, solid: true });
      },
      // a chicken coop with a wire run (and chickens)
      (b) => {
        b.floor(0, 0, b.W, b.D, "dirt");
        b.low(0, 1, b.W, 1, { h: 0.3, tex: "yCrops", top: "#6f8a3a" });
        b.low(0, 3, 2, 1, { h: 0.3, tex: "yCrops", top: "#6f8a3a" });
        b.prop(1.5, 2.5, "yScarecrow", null, { scale: 1.3, solid: true, cover: false });
        b.box(3, 3, 2, 2, { h: 0.8, tex: wall("coop"), front: (iu) => wall("coop", null, iu === 0 ? "hatch" : "win"), roof: { ridge: 1.25, tex: "yRoofTinRed", gable: "yGableRed" } });
        b.low(3, 2, 2, 1, { h: 0.42, tex: "yWire" });
        b.flock("yChicken", 3, [3.2, 2.2, 4.8, 2.8], 0.3);
      },
      // a goat pen with goats and hay, beside the coop; the scarecrow stands in the front crop row
      (b) => {
        b.floor(0, 0, b.W, b.D, "dirt");
        b.low(0, 1, b.W, 1, { h: 0.3, tex: "yCrops", top: "#6f8a3a" });
        b.prop(2.5, 1.5, "yScarecrow", null, { scale: 1.3, solid: true, cover: false });
        b.box(3, 3, 2, 2, { h: 0.8, tex: wall("coop"), front: (iu) => wall("coop", null, iu === 0 ? "hatch" : "win"), roof: { ridge: 1.25, tex: "yRoofTinRed", gable: "yGableRed" } });
        b.low(3, 2, 2, 1, { h: 0.42, tex: "yWire" });
        b.flock("yChicken", 3, [3.2, 2.2, 4.8, 2.8], 0.3);
        b.low(0, 2, 3, 3, { h: 0.52, tex: "yPen" });
        b.prop(0.6, 4.4, "yHay", null, { scale: 0.5 });
        b.flock("yGoat", 2, [0.6, 2.4, 2.4, 4.4], 0.7);
      },
    ],
    lab: [
      // a bed of herbs and a copper still
      (b) => {
        b.floor(0, 0, b.W, b.D, "dirt");
        b.low(0, 1, 2, 1, { h: 0.3, tex: "yHerbs", top: "#5a7a4a" });
        b.prop(2.6, 1.6, "yStill", null, { scale: 0.9, solid: true });
      },
      // a clean white shed with a bench at the window, the still beside it
      (b) => {
        const C = "#d8d8cc";
        b.floor(0, 0, b.W, b.D, "planks");
        b.box(0, 1, 3, 2, { h: 1.0, tex: wall("siding", C), front: (iu) => wall("siding", C, iu === 1 ? "door" : "bench"), roof: { ridge: 1.45, tex: "yRoofTinWhite", gable: "yGableWhite" } });
        b.prop(3.5, 1.6, "yStill", null, { scale: 0.9, solid: true });
        b.low(3, 2, 1, 1, { h: 0.3, tex: "yHerbs", top: "#5a7a4a" });
      },
      // a powered lab: glowing windows, a sign, a vent on the roof, a power pole
      (b) => {
        const M = "#5f6f7a";
        b.floor(0, 0, b.W, b.D, "concrete");
        b.box(0, 1, 4, 2, {
          h: 1.2,
          tex: wall("metal", M, "winLab"),
          face: (iu, iv, side) => (side === "front" ? (iu === 1 ? wall("metal", M, "door", { t: "LAB", i: 0, n: 1, lit: 1 }) : wall("metal", M, "winLab")) : side === "back" ? wall("metal", M) : null),
          roof: { ridge: 1.45, tex: "yRoofMetal", gable: "yGableMetal" },
        });
        // on the roof's ridge (1.45 there; its pipe's foot 1.43 at its sides): what stands on a roof shows above the
        // roof's outline, and the ridge is where a vent shows whole from the yard and from behind
        b.prop(2.8, 2.0, "yVent", null, { scale: 0.6, lift: 1.43 });
        b.prop(3.5, 0.5, "yLamp", null, { scale: 1.6, solid: true, cover: false });
      },
    ],
  };

  Object.assign(ZSR.Interior, {
    enterYard(opts) {
      const S = State();
      const Y = W().YARD;
      this.mode = "yard";
      this.loc = { id: "base", name: "Home Base", cacheName: "" };
      this.loadGrid(Y.grid, Y.palette);
      this.vanTiles = [];
      const fenceHp = W().DEFENSE.fenceHp[S.save.rooms.walls] || W().DEFENSE.fenceHp[0];
      const savedFence = S.save.fence || {}; // holes and cracks never close on their own
      let start = [2.5, 2.5, -Math.PI / 2];
      for (let y = 0; y < this.gh; y++) {
        for (let x = 0; x < this.gw; x++) {
          const ch = this.grid[y][x];
          if (ch === "P") {
            start = [x + 0.5, y + 0.5, -Math.PI / 2];
            this.grid[y][x] = ".";
          } else if (ch === "z") {
            // which side of the yard it is on: the nearest edge of the grid
            const d = { n: y, s: this.gh - 1 - y, w: x, e: this.gw - 1 - x };
            const side = Object.keys(d).reduce((a, k) => (d[k] < d[a] ? k : a), "n");
            this.spawns.push([x + 0.5, y + 0.5, side]);
            this.grid[y][x] = ".";
          } else if (ch === "F") {
            const key = x + "," + y;
            const hp = savedFence[key] != null ? Math.min(fenceHp, savedFence[key]) : fenceHp;
            if (hp > 0) this.fence[key] = hp;
            else this.grid[y][x] = "."; // a hole
          } else if (ch === "V") {
            if (!this.van) this.van = { x, y };
            this.vanTiles.push([x, y]); // every tile of it (wreckers claw at any side)
          }
          if (this.grid[y][x] === ".") this.floors.push([x + 0.5, y + 0.5]);
        }
      }
      this.fenceMax = fenceHp;
      // the van on its tiles: one Van3D model, the road's van (js/modelsprite.js); the tiles stay solid and opaque
      if (this.addVanModel) this.addVanModel(this.vanTiles);
      this.yardInside = this.yardInsideMask(Math.floor(start[0]), Math.floor(start[1]));
      this.makePlayer(start[0], start[1], start[2]);
      this.houseLoad(); // the cabin: its doors, windows and roof (js/house.js)
      this.crewEnter(); // the crew and the dog at their spots (js/crew.js); dressYard puts them in the scene
      if (this.roboEnter) this.roboEnter(); // Rivet, the robot dog, in the Captain Leo universe (js/robodog.js)
      this.wreckEnter(); // the wreckers' wave state (js/yardwreck.js)
      this.dressYard();
      this.breachChanged(); // which walkers each hole the save kept would draw
      this.trapsOffBuilds();
      this.traps = (S.save.yardTraps || []).map((t) => Object.assign({}, t));
      this.player.hp = this.player.maxHp; // home: rested
      this.waveIndex = S.save.wave || 0; // escalation survives a reload and the yard button; resets when a day passes
      this.phase = this.calmPhase((opts && opts.firstCalm) || W().DEFENSE.firstCalmSeconds);
      this.hud.place.textContent = "Home Base";
      this.hud.phase.classList.remove("hidden");
      this.startLoop();
      const holes = this.fenceHoles().length;
      const wrecked = this.wreckedWords(); // "Garden and Well" (js/yardwreck.js), or ""
      const robo = this.roboHomeWords ? this.roboHomeWords() : ""; // Tomas fixes a shut-down Rivet (js/robodog.js)
      if (robo && this.hooks.onYardChanged) this.hooks.onYardChanged();
      const tail = (wrecked ? " Wrecked: " + wrecked + "." : "") + robo;
      this.toast((holes ? "Home. The fence has " + holes + " hole" + (holes > 1 ? "s" : "") + ". E at a gap fixes it for " + W().SETTINGS.fenceRepairScrap + " scrap." : "Home. Quiet for now.") + tail, holes || wrecked || robo ? 4.5 : 3);
    },

    /* ---------- What the base rooms put in the yard ---------- */
    /** Rebuild the yard's scene from the save: ground, the cabin (js/house.js), the fence's look, and every
        plot (a staked lot with its name sign until the room is built, then that level's structure).
        Runs on entry and after every build; the grid, fence, walkers and traps are left alone. */
    dressYard() {
      const S = State();
      const Y = W().YARD;
      const walls = S.save.rooms.walls || 0;
      this.yardSize = root.document && root.document.documentElement ? root.document.documentElement.getAttribute("data-size") : null;
      // start over: nothing below survives a rebuild
      Object.values(Y.plots).forEach((pl) => {
        for (let y = pl.y; y < pl.y + pl.h; y++) for (let x = pl.x; x < pl.x + pl.w; x++) this.grid[y][x] = ".";
      });
      this.tileTex = {};
      this.tileH = {};
      this.lowTiles = {};
      this.roofs = [];
      this.props = [];
      this.blockers.clear();
      this.covers.clear();
      this.floorKind.fill(this.floorDefault);
      this.yardAnims = [];
      this.lots = []; // each plot's sign or plaque, read up close with E (the core's read panel)
      this.readLot = null;
      this.signs = []; // the notes on the cabin's walls (dressHouse)
      this.yardGround();
      this.dressHouse();
      Object.entries(Y.plots).forEach(([room, plot]) => this.buildPlot(room, plot, (S.save.rooms[room] || 0) | 0));
      this.crewDress(); // the crew and the dog are props too: back in the scene (js/crew.js)
      if (this.roboDress) this.roboDress();
      // every prop and sign with a 3D model stands as it, the porch's too; one put up the same keeps its picture
      if (this.modelProps) this.modelProps();
      this.maskDirty = true;
      this.refreshScene(); // the textures and lookups this rebuild changed (the van redraws itself: js/modelsprite.js)
      this.yardFenceLook(walls);
      this.wreckSpotsBuild(); // where wreckers stand to claw each build and the van (js/yardwreck.js)
    },

    /** Grass everywhere, the worn dirt paths of WORLD.YARD.paths, gravel where the van parks. */
    yardGround() {
      const v = this.van;
      (W().YARD.paths || []).forEach(([x0, y0, x1, y1]) => {
        for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.setFloor(x, y, "dirt");
      });
      if (v) for (let y = v.y - 1; y <= v.y + 1; y++) for (let x = v.x - 1; x <= v.x + 2; x++) this.setFloor(x, y, "gravel");
    },

    /** The fence's look by Walls level: the core draws this.fenceTex for every segment (whole, or cracked
        below half strength); at level 0 it is left unset and the core draws its plain pickets. */
    yardFenceLook(walls) {
      this.fenceTex = walls > 0 ? { whole: D3().texture("yFence", this.palette, { lvl: walls }), cracked: D3().texture("yFence", this.palette, { lvl: walls, cracked: 1 }) } : null;
    },

    /** One plot at one level: the staked lot and its sign at 0, else the level's structure and a name plaque. */
    buildPlot(room, plot, lvl) {
      const b = this.plotFrame(room, plot);
      const name = (W().BASE_ROOMS[room] && W().BASE_ROOMS[room].name) || room;
      const k = SIGN_SCALE[this.yardSize] || 1;
      if (!lvl || !BUILDS[room]) {
        // a staked lot: string between corner stakes, and a big sign with the room's name facing the yard
        for (let v = 0; v < b.D; v++) {
          for (let u = 0; u < b.W; u++) {
            let m = 0;
            if (v === 0) m |= SIDE_BIT[b.sides.front];
            if (v === b.D - 1) m |= SIDE_BIT[b.sides.back];
            if (u === 0) m |= SIDE_BIT[b.sides.left];
            if (u === b.W - 1) m |= SIDE_BIT[b.sides.right];
            b.floor(u, v, 1, 1, "yLot" + m);
          }
        }
        // stakes at the front corners only: the back ones are hardly seen, and every sprite costs a little each frame
        [[0.14, 0.14], [b.W - 0.14, 0.14]].forEach(([U, V]) => b.prop(U, V, "yStake", null, { scale: 0.3 }));
        // the sign: in 3D a wide board on two posts across the middle of the front row (LOT_SIGN_FOOT tiles, solid), as
        // the sprite's was wide on screen; the sprite alone (no model) blocks its one tile as it always did
        const scale = 1.2 * k;
        const board = this.lotSignBoard(scale, b.W);
        const sign = b.prop(Math.floor(b.W / 2) + 0.5, 0.5, "ySign", Object.assign({ t: name.toUpperCase() }, board ? { w: board.w } : null), { scale, solid: true, foot: board ? [board.foot, 1] : undefined });
        this.lots.push({ room, x: sign.x, y: sign.y });
        return;
      }
      b.floor(0, 0, b.W, b.D, "dirt");
      // wreckers' damage (js/yardwreck.js): 1 cracked (under half strength), 2 wrecked. Every face and sprite of it
      // shows it (yardart.js draws the cracks over what is there), the beacons go dark, debris lies around
      b.dmg = this.buildDmg(room);
      BUILDS[room][Math.min(lvl, 3) - 1].call(this, b);
      // the plaque carries the name once the lot sign is gone (painted wall signs blur at a distance)
      const [pu, pv] = b.plaque || [0.5, 0.5];
      const plaque = b.prop(pu, pv, "yPlaque", { t: name.toUpperCase(), n: lvl }, { scale: 0.8 * k, solid: true, cover: false });
      this.lots.push({ room, x: plaque.x, y: plaque.y });
      if (b.dmg === 2) this.wreckDebris(room, plot, plaque);
    },

    /** The lot sign's 3D board at this scale on a lot W tiles wide: { foot: the tiles it stands across (LOT_SIGN_FOOT, or
        one on a narrower lot), w: its board's width in units (the model's own, never past its foot less LOT_SIGN_MARGIN:
        at Huge its posts still stand on it) }, or null without the sign's model (the sprite stands on its one tile). */
    lotSignBoard(scale, W) {
      const YM = ZSR.YardModels;
      const d = YM && YM.def("ySign");
      const wide = d && d.board && d.board.wide;
      if (!wide) return null;
      const foot = W >= LOT_SIGN_FOOT ? LOT_SIGN_FOOT : 1;
      return { foot, w: Math.floor(Math.min(wide, (foot - LOT_SIGN_MARGIN) / scale) * 100) / 100 };
    },
    /** The way a plot's front faces, as a world angle (0 east, PI / 2 south): its props' 3D models face it. */
    plotFront(plot) {
      return FRONT[plot.face] != null ? FRONT[plot.face] : FRONT.s;
    },
    /** A plot's local frame (see BUILDS): u left to right as you face its front, v from the front row back. */
    plotFrame(room, plot) {
      const I = this;
      const { x, y, w, h, face } = plot;
      const front = this.plotFront(plot);
      const side = face === "e" || face === "w";
      const Wl = side ? h : w;
      const Dl = side ? w : h;
      // continuous local (U from the left edge, V from the front edge) to world
      const at = face === "s" ? (U, V) => [x + U, y + h - V] : face === "n" ? (U, V) => [x + w - U, y + V] : face === "e" ? (U, V) => [x + w - V, y + h - U] : (U, V) => [x + V, y + U];
      const sides = { front: face, back: OPP[face], left: LEFT[face], right: OPP[LEFT[face]] };
      const tile = (u, v) => at(u + 0.5, v + 0.5).map(Math.floor);
      const rect = (u0, v0, uw, vd) => {
        const [ax, ay] = at(u0, v0);
        const [bx, by] = at(u0 + uw, v0 + vd);
        return { x0: Math.round(Math.min(ax, bx)), y0: Math.round(Math.min(ay, by)), x1: Math.round(Math.max(ax, bx)), y1: Math.round(Math.max(ay, by)) };
      };
      // a texture by name (the core resolves it) or { name, opts } (resolved here, cached by Draw3); a damaged build
      // (this.dmg, set by buildPlot) passes { dmg } to its art, which draws the cracks over its own pixels
      const tex = function (t) {
        const dmg = this.dmg | 0;
        if (dmg && t && !t.width) t = typeof t === "object" ? { name: t.name, opts: Object.assign({}, t.opts, { dmg }) } : { name: t, opts: { dmg } };
        return t && typeof t === "object" && !t.width ? D3().texture(t.name, I.palette, t.opts) : t;
      };
      return {
        room,
        W: Wl,
        D: Dl,
        sides,
        plaque: null,
        dmg: 0,
        floor(u0, v0, uw, vd, kind) {
          for (let v = v0; v < v0 + vd; v++) for (let u = u0; u < u0 + uw; u++) I.setFloor(...tile(u, v), kind);
        },
        /** Opaque block: tex for every face, or front/back/left/right (a face or fn(iu, iv) giving one), or
            face(iu, iv, side) for any; h is its height (the eave when it has a roof: { ridge, tex, gable }). */
        box(u0, v0, uw, vd, o) {
          const pick = (iu, iv, s) => {
            const f = o.face ? o.face(iu, iv, s) : null;
            const per = o[s];
            return f || (typeof per === "function" ? per(iu, iv) : per) || o.tex;
          };
          for (let v = v0; v < v0 + vd; v++) {
            for (let u = u0; u < u0 + uw; u++) {
              const [tx, ty] = tile(u, v);
              const k = tx + "," + ty;
              I.grid[ty][tx] = "#";
              const faces = {};
              ["front", "back", "left", "right"].forEach((s) => (faces[sides[s]] = tex.call(this, pick(u - u0, v - v0, s))));
              I.tileTex[k] = faces;
              if (!o.roof && o.h && o.h !== 1) I.tileH[k] = o.h;
            }
          }
          if (o.roof) I.roofs.push(Object.assign(rect(u0, v0, uw, vd), { eave: o.h || 1, ridge: o.roof.ridge, roofTex: o.roof.tex, gableTex: o.roof.gable }));
          I.maskDirty = true;
        },
        /** See-through solid tiles sharing one def (drawn as one run): { h, tex, top, cover }. */
        low(u0, v0, uw, vd, o) {
          const def = { h: o.h, tex: tex.call(this, o.tex), top: o.top, cover: !!o.cover };
          for (let v = v0; v < v0 + vd; v++) for (let u = u0; u < u0 + uw; u++) I.addLow(...tile(u, v), def);
          return def;
        },
        /** A sprite at continuous local (U, V); o: { scale, lift, solid, foot: [w, d] in local tiles, cover, wide, turn }.
            Its turn (`rot`) is the plot's front's, and o.turn more: a 3D model of its art faces that way. */
        prop(U, V, art, opts, o) {
          const [px, py] = at(U, V);
          const foot = o && o.foot ? (side ? [o.foot[1], o.foot[0]] : o.foot) : undefined;
          const sopts = this.dmg && !(o && o.whole) ? Object.assign({}, opts, { dmg: this.dmg }) : opts;
          const p = Object.assign({ x: px, y: py, art, opts: sopts || undefined }, o || {}, { foot, rot: front + ((o && o.turn) || 0) });
          if (!p.foot) delete p.foot;
          return I.addProp(p);
        },
        /** Animate a prop: "blink" (a warning light). A wrecked build's lights stay dark. */
        anim(p, kind) {
          if (this.dmg === 2) {
            p.dim = 0.85;
            return p;
          }
          I.yardAnims.push({ p, kind, t: Math.random() });
          return p;
        },
        /** n animals pecking and wandering inside a local box [u0, v0, u1, v1] (they stand in a pen or run). In 3D each
            is a live figure (prop.fig) on its sprite's prop, which stays the fallback. */
        flock(art, n, box, scale) {
          const [u0, v0, u1, v1] = box;
          const A = ANIMALS[art];
          for (let i = 0; i < n; i++) {
            const U = u0 + ((i + 0.5) / n) * (u1 - u0);
            const V = v0 + (i % 2 ? 0.65 : 0.35) * (v1 - v0);
            const p = this.prop(U, V, art, { f: 0 }, { scale, whole: true }); // the animals are never cracked
            const fig = A && I.liveFigure ? I.liveFigure("beast", A.type, 17 + I.yardAnims.length * 29, Math.random() * Math.PI * 2) : null;
            if (fig) {
              fig.every = ANIMAL_EVERY;
              p.fig = fig;
            }
            I.yardAnims.push({ p, kind: "wander", art, at, U, V, box, tU: U, tV: V, t: Math.random() * 2, f: 0, ft: Math.random(), rest: true, idle: "stand", oneT: 0 });
          }
        },
      };
    },

    /** Animated props: blinking lights, chickens and goats wandering about their pens (in 3D live figures, ANIMALS:
        resting at a spot in a pose of theirs, getting up and turning to the next spot before they walk to it). */
    yardAnimate(dt) {
      const list = this.yardAnims;
      if (!list || !list.length) return;
      for (const a of list) {
        a.t -= dt;
        if (a.kind === "blink") {
          if (a.t <= 0) {
            a.t = 0.6;
            a.p.dim = a.p.dim ? 0 : 0.85;
          }
          continue;
        }
        // wander: rest a while at a spot (pecking, grazing), then walk to another in the pen
        const A = ANIMALS[a.art] || { speed: 0.6, rest: [1, 3.5], idle: [["stand", 1]] };
        const fig = a.p.fig;
        const du = a.tU - a.U;
        const dv = a.tV - a.V;
        const d = Math.hypot(du, dv);
        const x0 = a.p.x;
        const y0 = a.p.y;
        if (d > 0.04) {
          // in 3D it gets up and turns to the spot before it sets off, so it never slides or walks sideways
          let go = true;
          if (fig) {
            const [tx, ty] = a.at(a.tU, a.tV);
            fig.want = Math.atan2(ty - y0, tx - x0);
            fig.wantPose = "walk";
            const off = Math.abs(Math.atan2(Math.sin(fig.want - fig.heading), Math.cos(fig.want - fig.heading)));
            go = off < ANIMAL_TURN && !this.figPosed(fig);
          }
          if (go) {
            a.U += (du / d) * Math.min(d, A.speed * dt);
            a.V += (dv / d) * Math.min(d, A.speed * dt);
          }
        } else if (!a.rest) {
          // there: rest a while, doing one of its things
          const [pose, , secs] = pickWeighted(A.idle);
          a.rest = true;
          a.t = rand(A.rest[0], A.rest[1]);
          a.idle = pose;
          a.oneT = secs || 0;
        } else if (a.t <= 0) {
          a.rest = false;
          a.tU = rand(a.box[0], a.box[2]);
          a.tV = rand(a.box[1], a.box[3]);
        }
        const [x, y] = a.at(a.U, a.V);
        a.p.x = x;
        a.p.y = y;
        if (fig) {
          if (a.rest) {
            // a one-shot (a bleat, a flap) plays once, then it stands; standing, it looks at you when you are near
            if (a.oneT > 0 && (a.oneT -= dt) <= 0) a.idle = "stand";
            const p = this.player;
            const near = a.idle === "stand" && p && Math.hypot(p.x - x, p.y - y) < ANIMAL_LOOK;
            fig.want = null;
            fig.wantPose = a.idle;
            fig.lookX = near ? p.x : null;
            fig.lookY = near ? p.y : null;
          } else {
            fig.lookX = fig.lookY = null;
          }
          fig.wantRun = 0;
          this.figStep(fig, dt, x0, y0, x, y);
          continue;
        }
        a.ft -= dt;
        if (a.ft <= 0) {
          a.ft = d > 0.04 ? 0.18 : rand(0.3, 0.9);
          a.f = a.f ? 0 : 1;
          a.p.img = D3().sprite(a.art, { f: a.f });
        }
      }
    },

    /** A trap the player set where a structure now stands goes back into stock. */
    trapsOffBuilds() {
      const S = State();
      const m = this.solidMask();
      let back = 0;
      S.save.yardTraps = (S.save.yardTraps || []).filter((t) => {
        const gx = Math.floor(t.x);
        const gy = Math.floor(t.y);
        if (gx >= 0 && gy >= 0 && gx < this.gw && gy < this.gh && !m[gy * this.gw + gx]) return true;
        S.save.traps[t.type] = (S.save.traps[t.type] || 0) + 1;
        back++;
        return false;
      });
      if (back) this.toast(back === 1 ? "A trap was in the way of the build. It is back in stock." : back + " traps were in the way of the build. They are back in stock.", 3.5);
      return back;
    },
    /** Never stand inside something solid: after a build, step to the nearest open tile. */
    unstick(ent) {
      if (!ent || !this.solidForPlayer(ent.x, ent.y)) return;
      const sx = Math.floor(ent.x);
      const sy = Math.floor(ent.y);
      let best = null;
      for (let r = 1; r < 8 && !best; r++) {
        for (let y = sy - r; y <= sy + r && !best; y++) for (let x = sx - r; x <= sx + r; x++) {
          if (Math.max(Math.abs(x - sx), Math.abs(y - sy)) !== r || this.solidForPlayer(x + 0.5, y + 0.5)) continue;
          best = [x + 0.5, y + 0.5];
          break;
        }
      }
      if (best) {
        ent.x = best[0];
        ent.y = best[1];
      }
    },

    /* ---------- The fence ---------- */
    /** Fence state to save: every segment's health; 0 is a hole. */
    fenceState() {
      const Y = W().YARD.grid;
      const out = {};
      for (let y = 0; y < this.gh; y++) for (let x = 0; x < this.gw; x++) if (Y[y][x] === "F") out[x + "," + y] = this.fence[x + "," + y] || 0;
      return out;
    },
    fenceHoles() {
      const Y = W().YARD.grid;
      const out = [];
      for (let y = 0; y < this.gh; y++) for (let x = 0; x < this.gw; x++) if (Y[y][x] === "F" && this.fence[x + "," + y] == null) out.push([x, y]);
      return out;
    },
    /** Is this tile on the fence line (whole, cracked or a hole)? The player never walks through it. */
    isFenceLine(gx, gy) {
      const Y = W().YARD.grid;
      return !!Y[gy] && Y[gy][gx] === "F";
    },
    /** Rebuild one hole or brace one cracked segment. Costs scrap; returns true when done. */
    repairFence(x, y) {
      const S = State();
      const key = x + "," + y;
      const cost = W().SETTINGS.fenceRepairScrap;
      if (S.save.scrap < cost) {
        this.toast("Not enough scrap. " + cost + " scrap fixes a fence segment.", 3);
        Audio().play("wrong");
        return false;
      }
      if (this.walkerOnTile(x, y)) {
        this.toast("Something is in the gap. Clear it first.", 2.5);
        Audio().play("wrong");
        return false;
      }
      S.save.scrap -= cost;
      this.mendFence(x, y);
      Audio().play("buy");
      this.updateHud();
      if (this.hooks.onYardChanged) this.hooks.onYardChanged();
      return true;
    },
    /** One segment whole again at full strength (the player's repair above, and Tomas's job in js/crew.js). The
        walkers that hole drew go back to clawing where they stand. */
    mendFence(x, y) {
      this.fence[x + "," + y] = this.fenceMax;
      this.grid[y][x] = "F";
      this.maskDirty = true;
      this.breachChanged();
    },

    /* ---------- Breaches: a hole draws only the walkers near it ----------
       Owner, 2026-10-15: every walker outside the fence, whatever its role, goes for a hole only when one is within
       DEFENSE.breachRange tiles of it, walking along the outside; everyone else keeps clawing their own segment.
       It is worked out again on every re-path (the core's PathBlock hook), so a walker that comes into range goes
       for the nearest hole, and a mended hole sends its walkers back to clawing where they stand. */
    /** The tiles the fence encloses (1), from a flood fill over WORLD.YARD.grid from (sx, sy) that stops at the fence
        line (holes too) and the trees: nothing hardcoded, so a bigger yard or another fence shape just works. */
    yardInsideMask(sx, sy) {
      const Y = W().YARD.grid;
      const gw = this.gw;
      const gh = this.gh;
      const inside = new Uint8Array(gw * gh);
      const q = [sy * gw + sx];
      inside[q[0]] = 1;
      for (let i = 0; i < q.length; i++) {
        const x = q[i] % gw;
        const y = (q[i] / gw) | 0;
        for (const [dx, dy] of N4) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
          const k = ny * gw + nx;
          if (inside[k] || Y[ny][nx] === "F" || Y[ny][nx] === "T") continue;
          inside[k] = 1;
          q.push(k);
        }
      }
      return inside;
    },
    /** Is this tile outside the fence (not inside it, not on the fence line)? */
    yardOutside(gx, gy) {
      if (gx < 0 || gy < 0 || gx >= this.gw || gy >= this.gh || !this.yardInside) return false;
      return !this.yardInside[gy * this.gw + gx] && !this.isFenceLine(gx, gy);
    },
    /** The holes changed (a breach, a mend, a new fence, coming home): which hole, if any, each outside tile is in
        range of. A hole is usable when it joins open ground outside to open ground inside (a corner hole leads
        nowhere: walkers move four ways). One search from every usable hole at once, along the open ground
        outside the fence, out to breachRange: each tile keeps the nearest hole and its walking distance.
        SCALE: that search covers at most breachRange tiles round each hole (a 3-wide strip today: ~50 tiles a
        hole); the arrays are one entry per yard tile, made once per yard size. Only the walkers the change touches
        re-path at once (see the end); the rest keep their own re-path clocks, so a wave's searches stay spread over
        its frames (resetting everyone made all of them search in the same frame, at every breach and mend, and
        kept their clocks in step afterwards). */
    breachChanged() {
      if (!this.yardInside || !this.grid) return;
      const gw = this.gw;
      const gh = this.gh;
      const n = gw * gh;
      const range = W().DEFENSE.breachRange || 0;
      const m = this.solidMask();
      const inside = this.yardInside;
      const fresh = !(this.breach && this.breach.near.length === n);
      const b = fresh ? (this.breach = { near: new Int32Array(n), prev: new Int32Array(n), dist: new Int16Array(n), holes: [], usable: [], block: new Map() }) : this.breach;
      // the hole each outside tile drew before this change: the two arrays swap, so nothing is made per change
      const was = b.near;
      b.near = b.prev;
      b.prev = was;
      const holesWas = b.holes;
      b.near.fill(-1);
      b.dist.fill(-1);
      b.holes = [];
      b.usable = [];
      b.block = new Map();
      const open = (x, y) => x >= 0 && y >= 0 && x < gw && y < gh && !m[y * gw + x] && !this.isFenceLine(x, y);
      this.fenceHoles().forEach(([x, y]) => {
        const i = y * gw + x;
        b.holes.push(i);
        let out = false;
        let inn = false;
        for (const [dx, dy] of N4) {
          if (!open(x + dx, y + dy)) continue;
          if (inside[(y + dy) * gw + x + dx]) inn = true;
          else out = true;
        }
        if (out && inn) b.usable.push(i);
      });
      const q = b.usable.slice();
      q.forEach((i) => {
        b.near[i] = i;
        b.dist[i] = 0;
      });
      for (let k = 0; k < q.length; k++) {
        const i = q[k];
        const d = b.dist[i];
        if (d >= range) continue;
        const x = i % gw;
        const y = (i / gw) | 0;
        for (const [dx, dy] of N4) {
          const nx = x + dx;
          const ny = y + dy;
          if (!open(nx, ny)) continue;
          const j = ny * gw + nx;
          if (inside[j] || b.dist[j] >= 0) continue;
          b.dist[j] = d + 1;
          b.near[j] = b.near[i];
          q.push(j);
        }
      }
      // who finds the way again now: a walker on the fence line (in a hole, or where one was); one outside whose
      // nearest hole in range changed (a new one draws it, or its own was mended); one whose path steps on a hole
      // that opened or closed. Everyone else's search would come out the same (the core re-paths them on their own
      // clock anyway). The first time, everyone.
      const changed = new Set(holesWas);
      b.holes.forEach((i) => (changed.has(i) ? changed.delete(i) : changed.add(i)));
      (this.walkers || []).forEach((z) => {
        const gx = Math.floor(z.x);
        const gy = Math.floor(z.y);
        const i = gy * gw + gx;
        if (fresh || this.isFenceLine(gx, gy) || (this.yardOutside(gx, gy) && was[i] !== b.near[i])) z.pathT = 0;
        else if (changed.size && z.path && z.path.some(([px, py]) => changed.has(Math.floor(py) * gw + Math.floor(px)))) z.pathT = 0;
      });
    },
    /** The core's PathBlock hook: for a walker outside the fence, every hole but the nearest one in range (all of
        them when none is), as tile indices its path search treats as solid. Null inside the fence, in a hole (it is
        going through), or with no holes at all. True (no way at all: the core searches nothing) for a walker outside
        with no hole in range that is going somewhere inside: every way in is a hole and all of them are shut to it,
        so a search would walk the whole outside to fail (it claws its own segment, as it would after the search). */
    yardPathBlock(z, goal) {
      const b = this.breach;
      if (!b) return null;
      const gx = Math.floor(z.x);
      const gy = Math.floor(z.y);
      if (!this.yardOutside(gx, gy)) return null;
      const h = b.holes.length ? b.near[gy * this.gw + gx] : -1;
      if (h < 0 && goal && !z.practice) {
        const tx = Math.floor(goal.x);
        const ty = Math.floor(goal.y);
        if (tx >= 0 && ty >= 0 && tx < this.gw && ty < this.gh && this.yardInside[ty * this.gw + tx]) return true;
      }
      if (!b.holes.length) return null;
      let list = b.block.get(h);
      if (!list) b.block.set(h, (list = b.holes.filter((k) => k !== h)));
      return list;
    },
    /** The core's Breach hook: a segment just gave way. */
    yardBreach() {
      this.breachChanged();
    },
    /** Fix every hole the player can afford (the cabin menu button). Returns how many were fixed. */
    repairAllHoles() {
      let n = 0;
      for (const [x, y] of this.fenceHoles()) {
        if (!this.repairFence(x, y)) break;
        n++;
      }
      if (n) this.toast("Fence fixed: " + n + " hole" + (n > 1 ? "s" : "") + ".", 3);
      return n;
    },

    /* ---------- Traps ---------- */
    /** Put a trap on the tile in front of you (or just past the fence). */
    placeTrap(type) {
      const S = State();
      const def = W().TRAPS[type];
      if (!def) return;
      const have = (S.save.traps && S.save.traps[type]) || 0;
      if (!have) {
        this.toast("No " + def.name.toLowerCase() + "s. Craft them at the workbench in the cabin.", 3);
        Audio().play("wrong");
        return false;
      }
      const p = this.player;
      let spot = null;
      for (const d of [1.0, 2.0]) {
        const gx = Math.floor(p.x + Math.cos(p.a) * d);
        const gy = Math.floor(p.y + Math.sin(p.a) * d);
        if (gx < 0 || gy < 0 || gx >= this.gw || gy >= this.gh) break;
        const ch = this.grid[gy][gx];
        if (ch === "F" || W().YARD.grid[gy][gx] === "F") continue; // over the fence line (a hole is still the fence line)
        if (ch !== "." || this.solidAt(gx + 0.5, gy + 0.5)) break;
        if (gx === Math.floor(p.x) && gy === Math.floor(p.y)) continue;
        if (this.traps.some((t) => t.x === gx + 0.5 && t.y === gy + 0.5)) {
          this.toast("There is already a trap there.", 2.5);
          Audio().play("wrong");
          return false;
        }
        spot = [gx, gy];
        break;
      }
      if (!spot) {
        this.toast("No room for a trap there. Face open ground or the fence.", 2.5);
        Audio().play("wrong");
        return false;
      }
      S.save.traps[type] -= 1;
      this.traps.push({ x: spot[0] + 0.5, y: spot[1] + 0.5, type, uses: def.uses });
      this.toast(def.name + " set. " + S.save.traps[type] + " left.", 2.5);
      Audio().play("pickup");
      this.updateHud();
      if (this.hooks.onYardChanged) this.hooks.onYardChanged();
      return true;
    },
    updateTraps(dt) {
      const TR = W().TRAPS;
      let changed = false;
      this.traps.forEach((tr) => {
        if (tr.uses <= 0) return;
        tr.flash = Math.max(0, (tr.flash || 0) - dt);
        const def = TR[tr.type];
        // a spike trap bites each walker once: "lasts 3 walkers", not 3 seconds of one walker standing on it
        const stepped = this.walkers.find((z) => z.hp > 0 && !(tr.hit && tr.hit.has(z)) && Math.hypot(z.x - tr.x, z.y - tr.y) < 0.55);
        if (!stepped) return;
        if (def.radius > 0.6) {
          this.walkers.forEach((z) => {
            if (Math.hypot(z.x - tr.x, z.y - tr.y) < def.radius) this.hurtWalker(z, def.damage, tr);
          });
          tr.uses = 0;
          this.shake = State().settings.shake ? 10 : 0;
        } else {
          this.hurtWalker(stepped, def.damage, tr);
          (tr.hit = tr.hit || new Set()).add(stepped);
          tr.uses -= 1;
        }
        tr.flash = 0.4;
        Audio().play("crunch");
        changed = true;
      });
      if (changed) {
        this.traps = this.traps.filter((t) => t.uses > 0);
        State().save.yardTraps = this.traps.map((t) => ({ x: t.x, y: t.y, type: t.type, uses: t.uses }));
        this.updateHud();
      }
    },

    /** Call after the build menu changed the base. Every plot, the cabin and the fence's look are rebuilt
        from the room levels; building the Walls up rebuilds the whole fence; nothing else touches it
        (holes stay until they are paid for). */
    refreshYard(opts) {
      if (this.mode !== "yard") return;
      const S = State();
      const hp = W().DEFENSE.fenceHp[S.save.rooms.walls] || W().DEFENSE.fenceHp[0];
      const grew = hp !== this.fenceMax;
      this.fenceMax = hp;
      if (grew || (opts && opts.rebuildFence)) this.patchFence();
      this.gun = S.weaponStats(); // mods bought or a gun picked in the cabin
      this.fx = S.effects();
      this.houseStrength(); // stronger doors or windows: mended and refit at once
      this.dressYard(); // what was just built goes up at once (and the van's paint and gear change)
      this.trapsOffBuilds();
      this.unstick(this.player);
      this.walkers.forEach((z) => this.unstick(z));
      // no free heal for stepping inside: health carries over, and a bigger maximum adds the difference
      const oldMax = this.player.maxHp;
      this.player.maxHp = S.footMaxHp();
      this.player.hp = clamp(this.player.hp + (this.player.maxHp - oldMax), 1, this.player.maxHp);
      this.traps = (S.save.yardTraps || []).map((t) => Object.assign({}, t));
      this.updateHud();
    },
    /** Every fence segment back at full strength, whole again. */
    patchFence() {
      const Y = W().YARD.grid;
      for (let y = 0; y < this.gh; y++) for (let x = 0; x < this.gw; x++) {
        if (Y[y][x] === "F") {
          this.fence[x + "," + y] = this.fenceMax;
          this.grid[y][x] = "F";
        }
      }
      this.maskDirty = true;
      this.breachChanged();
    },

    /* ---------- Waves ---------- */
    /** A calm of `t` seconds. What comes after it is rolled now (`next`: { size, sides }), so Pip, the
        lookout (js/crew.js), can call it before it comes; the dinner bell re-rolls a "none" (js/house.js). */
    calmPhase(t) {
      return { kind: "calm", t, total: 0, spawned: 0, spawnT: 0, size: "none", next: this.rollWave(false) };
    },
    /** The next wave: { size: "none" | "some" | "many", sides }. Forced (after the dinner bell): some or many. */
    rollWave(forced) {
      const D = W().DEFENSE;
      const mix = D.waveMix;
      const r = Math.random();
      const size = forced ? (r < mix.some / (mix.some + mix.many) ? "some" : "many") : r < mix.none ? "none" : r < mix.none + mix.some ? "some" : "many";
      // a wave comes out of the trees on some sides (a heavy one on every side)
      return { size, sides: size === "none" ? [] : this.pickSides((D.waveSides && D.waveSides[size]) || 4) };
    },
    /** Where a wave comes from, as the toasts say it: "the back fence and the fence by the farm". */
    waveWhere(sides) {
      return (sides || []).map((s) => SIDE_NAMES[s]).join(" and ");
    },
    /** `n` different sides of the yard, at random. */
    pickSides(n) {
      const all = shuffle(["n", "e", "s", "w"].filter((s) => this.spawns.some((p) => p[2] === s)));
      return all.slice(0, clamp(n, 1, all.length));
    },
    /** Walkers queue at a gap. Two that keep pushing against each other without getting anywhere (both making
        for the same one-tile hole, say) sort it out: the one farther from its next step backs off for a moment
        and the other goes through. The core steers each walker on its own; this is the yard's crowd, where
        a breach can draw a whole side's walkers. One stuck with nobody beside it is caught on a corner (a
        build's prop, the fence): the core's straight-line shortcut clears the corner by the walker's middle,
        not by its shoulders, so it walks the tile middles round it for a moment instead. Uses the walkers'
        path / pathT (the core re-paths when pathT runs out). */
    yardUnjam(dt) {
      const p = this.player;
      const stalled = [];
      for (const z of this.walkers) {
        // only walkers on their way somewhere (walking last frame): not clawing at the fence or a build, not
        // waiting where they were sent, not already at the player
        if (!z.awake || z.act !== "walk" || z.fenceTarget || this.wreckAtSpot(z) || !z.path || !z.path.length || Math.hypot(z.x - p.x, z.y - p.y) < 1.5) {
          z.yardJam = null;
          continue;
        }
        const j = z.yardJam || (z.yardJam = { x: z.x, y: z.y, t: 0 });
        if (Math.hypot(z.x - j.x, z.y - j.y) > 0.3) Object.assign(j, { x: z.x, y: z.y, t: 0 });
        else if ((j.t += dt) > 1.2) stalled.push(z);
      }
      const gap = (w) => Math.hypot(w.path[0][0] - w.x, w.path[0][1] - w.y);
      for (const z of stalled) {
        if (z.yardJam.t <= 1.2) continue; // already sorted out with another this frame
        const o = this.walkers.find((w) => w !== z && Math.hypot(w.x - z.x, w.y - z.y) < z.r + w.r + 0.35);
        if (!o) {
          // stuck alone, on a corner: round it by the tile middles to where it was going (the end of its path;
          // the goal is not asked for again, so a raider's spot is not re-rolled), held like a back-off
          const [gx, gy] = z.path[z.path.length - 1];
          const route = this.bfs(z, { x: gx, y: gy }, this.yardPathBlock(z));
          if (route.length) {
            z.path = route;
            z.pathT = 1.1;
          }
          z.yardJam.t = 0;
          continue;
        }
        // behind one at the player: that is a queue
        if (Math.hypot(o.x - p.x, o.y - p.y) < 1.5) continue;
        // both stuck: the one farther from its next step gives way; else the stuck one does
        const both = o.yardJam && o.yardJam.t > 1.2;
        const back = both && gap(z) <= gap(o) ? o : z;
        const d = gap(back) || 1;
        const [tx, ty] = back.path[0];
        back.path = [[back.x - ((tx - back.x) / d) * 1.2, back.y - ((ty - back.y) / d) * 1.2]];
        back.pathT = 1.1;
        z.yardJam.t = 0;
        if (o.yardJam) o.yardJam.t = 0;
      }
    },
    updateYard(dt) {
      const ph = this.phase;
      const S = State();
      const D = W().DEFENSE;
      if (ph.kind === "calm") {
        // the first-run basics hold the calm (js/tutorial.js); so does god mode's "hold the calm"
        if (!this.yardHold && !S.cheat("holdCalm")) ph.t -= dt;
        if (ph.t <= 0) {
          // what comes next: rolled when the calm began (calmPhase), so it is what Pip called; after the dinner
          // bell there is always a wave
          let next = ph.next || this.rollWave(ph.forced);
          if (ph.forced && next.size === "none") next = this.rollWave(true);
          const size = next.size;
          if (size === "none") {
            this.phase = this.calmPhase(rand(D.calmSeconds[0], D.calmSeconds[1]));
            this.toast("Still quiet. Nothing at the fence.", 3);
          } else {
            this.waveIndex += 1;
            S.save.wave = this.waveIndex;
            const total = size === "some" ? D.someCount(S.save.day, this.waveIndex) : D.manyCount(S.save.day, this.waveIndex);
            // it comes out of the trees on the sides rolled with it, and the toast says where
            const sides = next.sides && next.sides.length ? next.sides : this.pickSides((D.waveSides && D.waveSides[size]) || 4);
            const every = sides.length >= 4;
            const where = this.waveWhere(sides);
            this.phase = { kind: "wave", size, total, spawned: 0, spawnT: 0, t: 0, sides };
            this.raidToast = false; // "Walkers got into the cabin" is said once a wave (js/house.js)
            // the crew hurry to the shelter; the dog's bark joins the toast, so the toast still says where
            const bark = this.crewWave(true);
            const tail = bark ? " " + bark : "";
            if (size === "many") this.toast((every ? "A lot of them, from every side. Hold the fence!" : "A lot of them: " + where + ". Hold the fence!") + tail, bark ? 4.5 : 3.5);
            else this.toast((every ? "Walkers on every side." : "Walkers at " + where + ".") + tail, bark ? 4.5 : 3.5);
            Audio().play("haven");
          }
          this.updateHud();
        }
      } else {
        ph.t += dt;
        ph.spawnT -= dt;
        if (ph.spawned < ph.total && ph.spawnT <= 0) {
          ph.spawnT = D.spawnInterval * (ph.size === "many" ? 0.7 : 1);
          // take turns between the wave's sides; a side deals out its spots in a random order, so its walkers
          // spread along it and claw at different fence segments
          const side = ph.sides ? ph.sides[ph.spawned % ph.sides.length] : null;
          const decks = (ph.decks = ph.decks || {});
          const key = side || "all";
          if (!decks[key] || !decks[key].length) decks[key] = shuffle(this.spawns.filter((p) => !side || p[2] === side));
          const [x, y] = decks[key].pop();
          const day = S.save.day;
          // the kinds by the day and the wave (WORLD.walkerWeights "yard": a heavy wave brings brutes from day 1)
          const type = W().pickWalkerType(W().walkerWeights("yard", { day, size: ph.size }));
          const z = this.makeWalker(type, x + rand(-0.3, 0.3), y + rand(-0.3, 0.3), W().walkerHpMult("yard", day));
          z.awake = true;
          // its role, one roll (so a seeded game plays the same waves): a raider makes for the cabin, not for you
          // (js/house.js); a wrecker, once inside the fence, for the van and the builds (js/yardwreck.js)
          const roll = Math.random();
          z.raid = roll < D.raidShare;
          z.wreck = !z.raid && roll < D.raidShare + (D.wreckShare || 0);
          this.walkers.push(z);
          ph.spawned += 1;
        }
        if (ph.spawned >= ph.total && this.walkers.length === 0) {
          const vanHit = !!ph.vanHit; // wreckers clawed at the van in this wave (js/yardwreck.js)
          this.phase = this.calmPhase(rand(D.calmSeconds[0], D.calmSeconds[1]));
          this.crewWave(false); // the crew come out of the shelter
          // every hole costs scrap. With the fence job unlocked (CREW[id].jobs, by trust stars) Tomas sees to the
          // holes in the calm and the scrap still comes out of the base (js/crew.js); with the cabin job, to broken
          // doors and windows too. E at a gap or a door still fixes it at once.
          const holes = this.fenceHoles().length;
          const broken = this.houseDamage().broken;
          // (only while the base can pay: with no scrap nobody fixes anything)
          const fixer = this.crewCanPay("fence") && this.crewFixer("fence");
          const cabinFixer = this.crewCanPay("cabin") && this.crewFixer("cabin");
          const fenceScrap = W().SETTINGS.fenceRepairScrap + " scrap";
          const fence = !holes
            ? "Wave cleared. The fence held."
            : "Wave cleared. " + holes + " hole" + (holes > 1 ? "s" : "") + " in the fence: " + (fixer ? fixer + " will fix " + (holes > 1 ? "them (" + fenceScrap + " each" : "it (" + fenceScrap) + ", from the base), or E at a gap fixes one now." : "E at a gap fixes it for " + fenceScrap + ".");
          const cabin = !broken ? "" : " The cabin has " + broken + " broken door" + (broken > 1 ? "s or windows" : " or window") + (cabinFixer ? ": " + cabinFixer + " will see to " + (broken > 1 ? "them" : "it") + ", or E there fixes it now." : ": E there fixes it, or use the computer.");
          const builds = this.wreckClearedWords(vanHit); // wrecked builds and a beaten van (js/yardwreck.js), or ""
          const robo = this.roboHomeWords ? this.roboHomeWords() : ""; // Tomas fixes a shut-down Rivet (js/robodog.js)
          this.toast(fence + builds + cabin + robo, holes || broken || builds || robo ? 5.5 : 3);
          Audio().play("correct");
          if (this.hooks.onWaveCleared) this.hooks.onWaveCleared();
        } else if (this.cabinHoldsWave() && !this.indoorAt(this.player.x, this.player.y)) {
          // the last of the wave wait in the cabin, out of sight (raiders: js/house.js), and the wave lasts until
          // they are cleared out: say so now and every CABIN_CUE_SECS while you stay out (no count: the owner took
          // the counts out, so without this nothing would say why the wave goes on)
          if ((ph.cabinCueT = (ph.cabinCueT || 0) - dt) <= 0) {
            // "Walkers got into the cabin" just now (js/house.js) says it already: the next cue counts from that
            const since = this.time - (this.raidToastAt == null ? -Infinity : this.raidToastAt);
            ph.cabinCueT = CABIN_CUE_SECS - (since < CABIN_CUE_SECS ? since : 0);
            if (since >= CABIN_CUE_SECS) this.toast("Walkers are waiting in the cabin. Clear it out.", 3.5);
          }
        } else ph.cabinCueT = 0;
      }
      // HUD phase line (cheap enough every frame)
      const h = this.hud.phase;
      // no count: you see them, you do not count them (owner, 2026-10-15); but walkers in the cabin are out of sight
      // while you are out of it, so the label says where they are (CABIN_LABEL)
      const cabin = ph.kind === "wave" && !this.indoorAt(this.player.x, this.player.y) && this.cabinWalkers() ? CABIN_LABEL : "";
      const text = ph.kind === "calm" ? (this.yardHold ? "QUIET" : "QUIET · next in " + Math.max(0, Math.ceil(this.phase.t)) + "s") : (ph.size === "many" ? "HEAVY WAVE" : "WAVE") + cabin;
      if (h.textContent !== text) h.textContent = text;
      h.classList.toggle("alarm", ph.kind === "wave");
    },

    /* ---------- Mode hooks (called by the core while mode is "yard") ---------- */
    yardUpdate(dt) {
      if (ZSR.Tutorial) ZSR.Tutorial.tick(this, dt); // June's first-run tutorial: watches the basics, shows its cards
      this.updateYard(dt);
      this.updateTraps(dt);
      this.yardWreck(dt); // wreckers at a build or the van claw it (js/yardwreck.js)
      this.yardUnjam(dt);
      this.yardAnimate(dt);
      this.crewUpdate(dt); // the crew wander, shelter, fix things, call the next wave (js/crew.js)
      if (this.roboUpdate) this.roboUpdate(dt); // Rivet follows you, zaps walkers (js/robodog.js)
      // the signs follow the text size
      const de = root.document && root.document.documentElement;
      if (de && de.getAttribute("data-size") !== this.yardSize) this.dressYard();
    },
    yardKey(k) {
      if (k !== "t" && k !== "r") return false;
      this.placeTrap(k === "t" ? "spike" : "blast");
      return true;
    },
    yardFacing(cand) {
      const p = this.player;
      this.houseFacing(cand); // what E does in and around the cabin (js/house.js)
      if (this.van) cand.push({ kind: "van", obj: this.van, x: this.van.x + 1, y: this.van.y + 0.5 });
      // the lot signs and plaques in plain sight: E reads one
      this.lots.forEach((lot) => {
        if (Math.hypot(lot.x - p.x, lot.y - p.y) < 2.5 && this.lineClear(p.x, p.y, lot.x, lot.y)) cand.push({ kind: "lot", obj: lot, x: lot.x, y: lot.y });
      });
      // fence segments near the player: holes to rebuild, cracks to brace
      const Y = W().YARD.grid;
      for (let gy = Math.floor(p.y) - 2; gy <= Math.floor(p.y) + 2; gy++) for (let gx = Math.floor(p.x) - 2; gx <= Math.floor(p.x) + 2; gx++) {
        if (!Y[gy] || Y[gy][gx] !== "F") continue;
        const hp = this.fence[gx + "," + gy];
        if (hp == null) cand.push({ kind: "hole", obj: [gx, gy], x: gx + 0.5, y: gy + 0.5 });
        else if (hp < this.fenceMax * 0.5) cand.push({ kind: "crack", obj: [gx, gy], x: gx + 0.5, y: gy + 0.5 });
      }
      this.wreckFacing(cand); // a wrecked or cracked build close by: fix it (js/yardwreck.js)
      this.crewFacing(cand); // a crew member or the dog right under the crosshair (js/crew.js); last, so it sees the spots
    },
    yardInteract(f) {
      const inWave = this.phase && this.phase.kind === "wave";
      if (f.kind === "lot") {
        this.readLot = this.readLot === f.obj ? null : f.obj; // E again puts it away
        Audio().play("click");
      } else if (f.kind === "hole" || f.kind === "crack") {
        this.repairFence(f.obj[0], f.obj[1]);
      } else if (f.kind === "wreck") {
        this.repairBuild(f.obj);
      } else if (f.kind === "spot" || f.kind === "pane") {
        this.houseInteract(f);
      } else if (f.kind === "crew" || f.kind === "dog") {
        this.crewInteract(f);
      } else if (f.kind === "van") {
        if (inWave) {
          this.toast(this.cabinHoldsWave() ? "Not now. Walkers are still in the cabin." : "Not now. Clear the fence first.", 2.5);
          Audio().play("wrong");
        } else if (this.yardHold) {
          // the first-run basics come first: June says what is left (js/tutorial.js)
          this.toast(ZSR.Tutorial ? ZSR.Tutorial.vanWait() : "Not yet. Finish the basics first.", 3.5);
          Audio().play("wrong");
        } else if (this.hooks.onVan) this.hooks.onVan();
      }
    },
    yardHint(f) {
      const inWave = this.phase && this.phase.kind === "wave";
      const fix = W().SETTINGS.fenceRepairScrap + " scrap";
      if (f.kind === "lot") return this.readLot === f.obj ? "Press E to put the sign away" : (State().save.rooms[f.obj.room] ? "Press E to read the plaque" : "Press E to read the sign");
      if (f.kind === "hole") return "Press E to rebuild the fence (" + fix + ")";
      if (f.kind === "crack") return "Press E to brace the fence (" + fix + ")";
      if (f.kind === "wreck") return this.wreckHint(f.obj);
      if (f.kind === "spot" || f.kind === "pane") return this.houseHint(f);
      if (f.kind === "crew" || f.kind === "dog") return this.crewHint(f);
      if (f.kind === "van") return inWave ? (this.cabinHoldsWave() ? "The van (walkers are still in the cabin)" : "The van (clear the wave first)") : this.yardHold ? "The van (after the basics)" : "Press E to head out in the van";
      return "";
    },
    yardGoal() {
      const S = State();
      const broken = this.fenceHoles().length;
      const tr = S.save.traps || {};
      const held = Object.entries(W().TRAPS).filter(([k]) => tr[k] > 0).map(([k, d]) => tr[k] + " " + d.name.toLowerCase() + (tr[k] > 1 ? "s" : "") + " (" + d.key + ")");
      const cabin = this.houseDamage().broken;
      const wrecked = this.wreckedWords();
      return "Day " + S.save.day + " · fence " + (broken ? broken + " hole" + (broken > 1 ? "s" : "") + " (E to fix)" : "whole") + (cabin ? " · cabin: " + cabin + " broken" : "") + (wrecked ? " · wrecked: " + wrecked : "") + " · walls " + S.save.rooms.walls + (held.length ? " · traps: " + held.join(", ") : "");
    },
    /** A shot in the calm carries: the next wave comes sooner (the bow is silent). */
    yardNoise(tiles) {
      const ph = this.phase;
      const D = W().DEFENSE;
      if (this.yardHold || !ph || ph.kind !== "calm" || ph.t <= D.bellSeconds) return; // the first-run basics hold the calm
      ph.t = Math.max(D.bellSeconds, ph.t - tiles * D.noiseCut);
      if (!ph.noiseToast) {
        ph.noiseToast = true;
        this.toast("The shots carry a long way. They will come sooner.", 3);
      }
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
