/* Yard models: the yard's props, signs and plaques (and the porch's) as still 3D models on js/model3d.js, stood in
   the first-person view by js/modelsprite.js in place of the billboard sprites js/yardart.js and js/houseart.js draw
   (those stay: the fallback when no model is registered, and the art the 2D pictures compare to). The models are
   split into appended files by group (js/yardmodels1.js, js/yardmodels2.js ...), each calling YardModels.add.

   YardModels.add(art, def): a model for the sprite named art.
     build(B, opts)  lays it out with a Model3D Builder in PROP UNITS: 1 unit is the height the sprite stands at scale 1,
                     so the yard places it with its prop's own scale (tiles per unit) and lift (tiles up), exactly where
                     the sprite stood. x is its right, y its front (the way it faces: a sign's face, a pump's spout), z up
                     from the ground at its foot. The first-person view squashes the world sideways (STRETCH: a tile of
                     floor is narrower on screen than a wall is tall) and draws models squashed the same way, so give a
                     model its real plan size in tiles at its usual scale: it must stand on the tile (or the foot) its
                     prop blocks.
     key(opts)       the cache key for these opts (default: the opts as JSON)
     opts            the opts sets the tests draw it with (every look it has: colours, text, levels; dmg is added)
     core            optional [x0, y0, x1, y1], units: its solid body, which js/modelsprite.js maps the picture through
                     between redraws (default: its bounding box)
     ops             optional [lod0, lod1, lod2]: its canvas-call ceilings (default YARD_OPS)
     faces           "front": the yard turns it to face the plot's front (signs, plaques); "plot" (default): turned with
                     the plot like its build
   opts may always carry dmg (0 whole, 1 cracked, 2 wrecked: js/yardwreck.js), which a model shows as the sprite did
   (cracks, a wrecked plaque's tape, a dark beacon), and on (an animated part's state: a beacon's blink).

   YardModels.has(art), YardModels.mesh(art, opts) -> the Model3D model, YardModels.def(art), YardModels.ARTS. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const M = ZSR.Model3D;
  if (!M) return;

  // SCALE: the most canvas calls one yard model may make at lod 0 / 1 / 2 (each is drawn again whenever you move round
  // it by a step; a full yard holds about 40 of them). A model may set its own (def.ops)
  const YARD_OPS = [500, 260, 120];
  const DEFS = {};
  const ARTS = [];

  function add(art, def) {
    if (!def || typeof def.build !== "function") throw new Error("YardModels.add: " + art + " has no build");
    if (!DEFS[art]) ARTS.push(art);
    DEFS[art] = Object.assign({ key: (o) => JSON.stringify(o || {}), opts: [{}], faces: "plot", ops: YARD_OPS }, def);
    M.define("y:" + art, (B, o) => DEFS[art].build(B, o || {}));
  }
  const has = (art) => !!DEFS[art];
  const def = (art) => DEFS[art] || null;
  /** The model for art in these opts (built once per key and kept by Model3D). */
  function mesh(art, opts) {
    const d = DEFS[art];
    if (!d) return null;
    const o = opts || {};
    return M.mesh("y:" + art, o, art + "|" + d.key(o) + "|d" + (o.dmg | 0) + (o.on == null ? "" : "|o" + (o.on ? 1 : 0)));
  }

  ZSR.YardModels = { YARD_OPS, add, has, def, mesh, ARTS, DEFS };
})(typeof window !== "undefined" ? window : globalThis);
