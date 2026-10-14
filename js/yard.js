/* Yard mode for the first-person view, mixed into ZSR.Interior: the home base yard
   (cabin defense). The fence you can shoot over, holes and repairs, traps, the wave
   phases (calm / some / many, from one or more sides; the dinner bell and gunfire bring the
   next one sooner), the van (map), the ground, the ten room plots and what each room level
   builds on them, and the yard's HUD goal. The cabin itself (a house you walk into: the build
   menu is its office computer) is js/house.js.
   Yard legend (WORLD.YARD.grid): T treeline  F fence segment  V the van  P player start
   z walker spawn (outside the fence), and the cabin's own legend (WORLD.HOUSE).
   The plots are WORLD.YARD.plots; the textures and sprites named below are drawn in
   yardart.js (the van and the gun in sprites3d.js read the upgrades themselves). The crew who live
   here (wandering, the shelter in a wave, their jobs, the talk bubble, the dog) are js/crew.js: this
   file calls crewEnter, crewDress, crewUpdate, crewWave, crewFacing, crewInteract and crewHint. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const D3 = () => ZSR.Draw3;
  const W = () => ZSR.WORLD;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
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
  const OPP = { n: "s", s: "n", e: "w", w: "e" };
  const LEFT = { s: "w", n: "e", e: "s", w: "n" }; // your left hand as you face a plot's front from outside
  const SIDE_BIT = { n: 1, e: 2, s: 4, w: 8 };

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
     unless it moves the plaque (b.plaque = [U, V]). */
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
      // a plank shack with a radio in the window and a whip antenna (the plaque stands beside the shack, a
      // little back, so it never covers the window or, at the next levels, the shack's own RADIO sign)
      (b) => {
        const P = "#6b5a46";
        b.box(0, 1, 2, 2, { h: 0.95, tex: wall("plank", P), front: (iu) => wall("plank", P, iu === 0 ? "radio" : "door"), roof: { ridge: 1.3, tex: "yRoofTin", gable: "yGablePlank" } });
        b.prop(2.5, 2.5, "yWhip", null, { scale: 2.1, solid: true, cover: false });
        b.plaque = [2.65, 1.5];
      },
      // the shack gets a sign, and a tall mast on guy wires
      (b) => {
        const P = "#6b5a46";
        b.box(0, 1, 2, 2, { h: 0.95, tex: wall("plank", P), front: (iu) => wall("plank", P, iu === 0 ? "radio" : "door", { t: "RADIO", i: iu, n: 2 }), roof: { ridge: 1.3, tex: "yRoofTin", gable: "yGablePlank" } });
        b.prop(2.5, 2.5, "yMast", null, { scale: 3.3, solid: true, cover: false });
        b.plaque = [2.65, 1.5];
      },
      // a lattice tower with a dish and a blinking light, a dish on the shack
      (b) => {
        const M = "#6f7a80";
        b.floor(0, 0, b.W, b.D, "gravel");
        b.box(0, 1, 2, 2, { h: 1.0, tex: wall("metal", M), front: (iu) => wall("metal", M, iu === 0 ? "radio" : "door", { t: "RADIO", i: iu, n: 2 }), roof: { ridge: 1.3, tex: "yRoofTin", gable: "yGableMetal" } });
        b.low(2, 2, 1, 1, { h: 3.4, tex: "yLattice" });
        b.prop(2.5, 2.5, "yDish", null, { scale: 0.62, lift: 2.2 });
        b.prop(2.5, 2.5, "yWhip", null, { scale: 0.9, lift: 3.35 });
        b.anim(b.prop(2.5, 2.5, "yBeacon", null, { scale: 0.26, lift: 3.32 }), "blink");
        b.prop(1.0, 2.0, "yDish", null, { scale: 0.5, lift: 1.0 });
        b.plaque = [2.65, 1.5];
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
        b.prop(2.8, 1.8, "yVent", null, { scale: 0.6, lift: 1.25 });
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
          } else if (ch === "V" && !this.van) {
            this.van = { x, y };
          }
          if (this.grid[y][x] === ".") this.floors.push([x + 0.5, y + 0.5]);
        }
      }
      this.fenceMax = fenceHp;
      this.makePlayer(start[0], start[1], start[2]);
      this.houseLoad(); // the cabin: its doors, windows and roof (js/house.js)
      this.crewEnter(); // the crew and the dog at their spots (js/crew.js); dressYard puts them in the scene
      this.dressYard();
      this.trapsOffBuilds();
      this.traps = (S.save.yardTraps || []).map((t) => Object.assign({}, t));
      this.player.hp = this.player.maxHp; // home: rested
      this.waveIndex = S.save.wave || 0; // escalation survives a reload and the yard button; resets when a day passes
      this.phase = this.calmPhase((opts && opts.firstCalm) || W().DEFENSE.firstCalmSeconds);
      this.hud.place.textContent = "Home Base";
      this.hud.phase.classList.remove("hidden");
      this.startLoop();
      const holes = this.fenceHoles().length;
      this.toast(holes ? "Home. The fence has " + holes + " hole" + (holes > 1 ? "s" : "") + ". E at a gap fixes it for " + W().SETTINGS.fenceRepairScrap + " scrap." : "Home. Quiet for now.", holes ? 4.5 : 3);
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
      this.maskDirty = true;
      this.refreshScene(); // the van's paint and gear may have changed too
      this.yardFenceLook(walls);
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
        const sign = b.prop(Math.floor(b.W / 2) + 0.5, 0.5, "ySign", { t: name.toUpperCase() }, { scale: 1.2 * k, solid: true });
        this.lots.push({ room, x: sign.x, y: sign.y });
        return;
      }
      b.floor(0, 0, b.W, b.D, "dirt");
      BUILDS[room][Math.min(lvl, 3) - 1].call(this, b);
      // the plaque carries the name once the lot sign is gone (painted wall signs blur at a distance)
      const [pu, pv] = b.plaque || [0.5, 0.5];
      const plaque = b.prop(pu, pv, "yPlaque", { t: name.toUpperCase(), n: lvl }, { scale: 0.8 * k, solid: true, cover: false });
      this.lots.push({ room, x: plaque.x, y: plaque.y });
    },

    /** A plot's local frame (see BUILDS): u left to right as you face its front, v from the front row back. */
    plotFrame(room, plot) {
      const I = this;
      const { x, y, w, h, face } = plot;
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
      // a texture by name (the core resolves it) or { name, opts } (resolved here, cached by Draw3)
      const tex = (t) => (t && typeof t === "object" && !t.width ? D3().texture(t.name, I.palette, t.opts) : t);
      return {
        room,
        W: Wl,
        D: Dl,
        sides,
        plaque: null,
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
              ["front", "back", "left", "right"].forEach((s) => (faces[sides[s]] = tex(pick(u - u0, v - v0, s))));
              I.tileTex[k] = faces;
              if (!o.roof && o.h && o.h !== 1) I.tileH[k] = o.h;
            }
          }
          if (o.roof) I.roofs.push(Object.assign(rect(u0, v0, uw, vd), { eave: o.h || 1, ridge: o.roof.ridge, roofTex: o.roof.tex, gableTex: o.roof.gable }));
          I.maskDirty = true;
        },
        /** See-through solid tiles sharing one def (drawn as one run): { h, tex, top, cover }. */
        low(u0, v0, uw, vd, o) {
          const def = { h: o.h, tex: tex(o.tex), top: o.top, cover: !!o.cover };
          for (let v = v0; v < v0 + vd; v++) for (let u = u0; u < u0 + uw; u++) I.addLow(...tile(u, v), def);
          return def;
        },
        /** A sprite at continuous local (U, V); o: { scale, lift, solid, foot: [w, d] in local tiles, cover, wide }. */
        prop(U, V, art, opts, o) {
          const [px, py] = at(U, V);
          const foot = o && o.foot ? (side ? [o.foot[1], o.foot[0]] : o.foot) : undefined;
          const p = Object.assign({ x: px, y: py, art, opts: opts || undefined }, o || {}, { foot });
          if (!p.foot) delete p.foot;
          return I.addProp(p);
        },
        /** Animate a prop: "blink" (a warning light). */
        anim(p, kind) {
          I.yardAnims.push({ p, kind, t: Math.random() });
          return p;
        },
        /** n animals pecking and wandering inside a local box [u0, v0, u1, v1] (they stand in a pen or run). */
        flock(art, n, box, scale) {
          const [u0, v0, u1, v1] = box;
          for (let i = 0; i < n; i++) {
            const U = u0 + ((i + 0.5) / n) * (u1 - u0);
            const V = v0 + (i % 2 ? 0.65 : 0.35) * (v1 - v0);
            const p = this.prop(U, V, art, { f: 0 }, { scale });
            I.yardAnims.push({ p, kind: "wander", art, at, U, V, box, tU: U, tV: V, t: Math.random() * 2, f: 0, ft: Math.random() });
          }
        },
      };
    },

    /** Animated props: blinking lights, chickens and goats wandering about their pens. */
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
        // wander: walk toward a spot in the pen, stop, peck, pick another
        const sp = a.art === "yGoat" ? 0.35 : 0.6;
        const du = a.tU - a.U;
        const dv = a.tV - a.V;
        const d = Math.hypot(du, dv);
        if (d > 0.04) {
          a.U += (du / d) * Math.min(d, sp * dt);
          a.V += (dv / d) * Math.min(d, sp * dt);
        } else if (a.t <= 0) {
          a.tU = rand(a.box[0], a.box[2]);
          a.tV = rand(a.box[1], a.box[3]);
          a.t = rand(1, 3.5);
        }
        a.ft -= dt;
        if (a.ft <= 0) {
          a.ft = d > 0.04 ? 0.18 : rand(0.3, 0.9);
          a.f = a.f ? 0 : 1;
          a.p.img = D3().sprite(a.art, { f: a.f });
        }
        const [x, y] = a.at(a.U, a.V);
        a.p.x = x;
        a.p.y = y;
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
    /** One segment whole again at full strength (the player's repair above, and Tomas's job in js/crew.js). */
    mendFence(x, y) {
      this.fence[x + "," + y] = this.fenceMax;
      this.grid[y][x] = "F";
      this.maskDirty = true;
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
            if (Math.hypot(z.x - tr.x, z.y - tr.y) < def.radius) this.hurtWalker(z, def.damage);
          });
          tr.uses = 0;
          this.shake = State().settings.shake ? 10 : 0;
        } else {
          this.hurtWalker(stepped, def.damage);
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
        a breach can draw a whole side's walkers. Uses the walkers' path / pathT (the core re-paths when
        pathT runs out). */
    yardUnjam(dt) {
      const p = this.player;
      const stalled = [];
      for (const z of this.walkers) {
        // only walkers on their way somewhere: not clawing at the fence, not already at the player
        if (!z.awake || z.fenceTarget || !z.path || !z.path.length || Math.hypot(z.x - p.x, z.y - p.y) < 1.5) {
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
        // stuck alone (on a corner): the core's steering sorts that out; behind one at the player: that is a queue
        if (!o || Math.hypot(o.x - p.x, o.y - p.y) < 1.5) continue;
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
        if (!S.cheat("holdCalm")) ph.t -= dt; // god mode: the calm waits until it is let go
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
          const type = ph.size === "many" && ph.spawned % 5 === 4 ? "brute" : ph.spawned % 3 === 2 && day >= 2 ? "runner" : "walker";
          const z = this.makeWalker(type, x + rand(-0.3, 0.3), y + rand(-0.3, 0.3), 1 + 0.08 * (day - 1));
          z.awake = true;
          z.raid = Math.random() < D.raidShare; // it makes for the cabin, not for you (js/house.js)
          this.walkers.push(z);
          ph.spawned += 1;
        }
        if (ph.spawned >= ph.total && this.walkers.length === 0) {
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
          this.toast(fence + cabin, holes || broken ? 5.5 : 3);
          Audio().play("correct");
          if (this.hooks.onWaveCleared) this.hooks.onWaveCleared();
        }
      }
      // HUD phase line (cheap enough every frame)
      const h = this.hud.phase;
      const text = ph.kind === "calm" ? "QUIET · next in " + Math.max(0, Math.ceil(this.phase.t)) + "s" : (ph.size === "many" ? "HEAVY WAVE" : "WAVE") + " · " + (ph.total - ph.spawned + this.walkers.length) + " left";
      if (h.textContent !== text) h.textContent = text;
      h.classList.toggle("alarm", ph.kind === "wave");
    },

    /* ---------- Mode hooks (called by the core while mode is "yard") ---------- */
    yardUpdate(dt) {
      this.updateYard(dt);
      this.updateTraps(dt);
      this.yardUnjam(dt);
      this.yardAnimate(dt);
      this.crewUpdate(dt); // the crew wander, shelter, fix things, call the next wave (js/crew.js)
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
      this.crewFacing(cand); // a crew member or the dog right under the crosshair (js/crew.js); last, so it sees the spots
    },
    yardInteract(f) {
      const inWave = this.phase && this.phase.kind === "wave";
      if (f.kind === "lot") {
        this.readLot = this.readLot === f.obj ? null : f.obj; // E again puts it away
        Audio().play("click");
      } else if (f.kind === "hole" || f.kind === "crack") {
        this.repairFence(f.obj[0], f.obj[1]);
      } else if (f.kind === "spot" || f.kind === "pane") {
        this.houseInteract(f);
      } else if (f.kind === "crew" || f.kind === "dog") {
        this.crewInteract(f);
      } else if (f.kind === "van") {
        if (inWave) {
          this.toast("Not now. Clear the fence first.", 2.5);
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
      if (f.kind === "spot" || f.kind === "pane") return this.houseHint(f);
      if (f.kind === "crew" || f.kind === "dog") return this.crewHint(f);
      if (f.kind === "van") return inWave ? "The van (clear the wave first)" : "Press E to head out in the van";
      return "";
    },
    yardGoal() {
      const S = State();
      const broken = this.fenceHoles().length;
      const tr = S.save.traps || {};
      const held = Object.entries(W().TRAPS).filter(([k]) => tr[k] > 0).map(([k, d]) => tr[k] + " " + d.name.toLowerCase() + (tr[k] > 1 ? "s" : "") + " (" + d.key + ")");
      const cabin = this.houseDamage().broken;
      return "Day " + S.save.day + " · fence " + (broken ? broken + " hole" + (broken > 1 ? "s" : "") + " (E to fix)" : "whole") + (cabin ? " · cabin: " + cabin + " broken" : "") + " · walls " + S.save.rooms.walls + (held.length ? " · traps: " + held.join(", ") : "");
    },
    /** A shot in the calm carries: the next wave comes sooner (the bow is silent). */
    yardNoise(tiles) {
      const ph = this.phase;
      const D = W().DEFENSE;
      if (!ph || ph.kind !== "calm" || ph.t <= D.bellSeconds) return;
      ph.t = Math.max(D.bellSeconds, ph.t - tiles * D.noiseCut);
      if (!ph.noiseToast) {
        ph.noiseToast = true;
        this.toast("The shots carry a long way. They will come sooner.", 3);
      }
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
