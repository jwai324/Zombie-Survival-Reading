/* Van3D: the van as one 3D model (js/model3d.js), the same everywhere it is seen: parked in the yard and at River
   Landing (js/modelsprite.js), on the road, the garage preview and the title (js/perspective.js van), at the
   workbench (js/bench.js). Its look is the save's: the paint job (js/upgrades.js PAINT_LOOKS: body, roof, trim,
   bumpers, rims and a decal on every side and the hood), the armor, the ram plow and the engine gear by their
   upgrade levels, the dents by its health, and (where the caller wants it) the roof gun.

   Model units are the road's (Van3D.L long, W wide, H to the roof); origin the middle of its footprint on the ground;
   x its right, y forward (the nose at +L/2), z up.

   Van3D.sig(u, o)        a string that changes whenever the van would look different (look, gear, dents, gun)
   Van3D.mesh(u, o)       the Model3D model (built once per sig and kept)
   Van3D.draw(ctx, view, u, o)   Model3D.draw with it
   Van3D.dentTier(share)  0 .. DENTS.length: how dented it looks at this share of its health
   u: the upgrades { armor, bumper, engine, paint, damage, fireRate, spread } (missing ones 0)
   o: { dent: 0..2, gun: true to stand the roof gun on it (the road draws its own, aimed: false there) } */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const M = ZSR.Model3D;
  if (!M) return;

  const L = 118;
  const W = 66;
  const H = 50;
  // the van's health share under which it shows dents (tier 1) and heavy dents (tier 2): the yard's wreckers claw it
  // (js/yardwreck.js), and a hard trip home shows too
  const DENTS = [0.75, 0.5];

  const lookOf = (u) => {
    const looks = ZSR.Upgrades.PAINT_LOOKS;
    return looks[Math.max(0, Math.min((u && u.paint) | 0, looks.length - 1))];
  };
  const gearOf = (u, o) => ({
    armor: (u && u.armor) | 0,
    bumper: (u && u.bumper) | 0,
    engine: (u && u.engine) | 0,
    paint: (u && u.paint) | 0,
    damage: (u && u.damage) | 0,
    fireRate: (u && u.fireRate) | 0,
    spread: (u && u.spread) | 0,
    dent: (o && o.dent) | 0,
    gun: !!(o && o.gun),
  });
  function sig(u, o) {
    const g = gearOf(u, o);
    return "p" + g.paint + "a" + g.armor + "b" + g.bumper + "e" + g.engine + "d" + g.dent + (g.gun ? "g" + g.damage + g.fireRate + g.spread : "");
  }

  /* ---------- The model (a first cut: the body, glass, wheels; js/van3d.js grows the gear and decals) ---------- */
  M.define("van", (B, g) => {
    const look = lookOf(g);
    const hw = W / 2;
    const yN = L / 2;
    const yT = -L / 2;
    // the body's side outline (s along y forward, t up, counter-clockwise seen from its right, +x) in two convex
    // parts, since the cowl between the hood and the windshield bends inward: the lower body to the belt line (the
    // nose, the hood), then the cab and cargo box over it (the sloped windshield, the roof, the upright back)
    const BELT = 28;
    B.part({ name: "lower" });
    B.prism([[yT, 8], [yN - 2, 8], [yN, 12], [yN, 24], [yN - 22, BELT], [yT, BELT]], "x", -hw, hw, look.body, { skipSides: [4] });
    B.part({ name: "upper" });
    B.prism([[yT, BELT], [yN - 22, BELT], [yN - 40, H - 2], [yN - 44, H], [yT + 2, H], [yT, H - 2]], "x", -hw + 1, hw - 1, look.body, { skipSides: [0], fills: { sides: [look.body, "#8fb3c4", look.roof, look.roof, look.roof, look.body] } });
    // the wheels: each tire's outer face stands just out from the body's side, and its bottom under the body, so
    // neither cuts into the body (two convex parts with a plane between them always draw in the right order)
    for (const y of [yN - 26, yT + 26]) {
      for (const side of [-1, 1]) {
        B.part({ name: "wheel" });
        const xa = side < 0 ? -hw - 3 : hw;
        B.round("x", [y, 12], 12, 12, xa, xa + 3, 12, "#1b1c1f", { fills: side < 0 ? { cap0: look.rims } : { cap1: look.rims } });
        B.part({ name: "tire" });
        B.box(side < 0 ? -hw + 1 : hw - 9, y - 11, 0, side < 0 ? -hw + 9 : hw - 1, y + 11, 8, "#1b1c1f");
      }
    }
  });

  function mesh(u, o) {
    const g = gearOf(u, o);
    return M.mesh("van", g, sig(u, o));
  }
  function draw(ctx, view, u, o) {
    return M.draw(ctx, mesh(u, o), view);
  }
  /** How dented the van looks at this share of its health: 0 none, 1 dents, 2 heavy dents. */
  function dentTier(share) {
    return share < DENTS[1] ? 2 : share < DENTS[0] ? 1 : 0;
  }

  ZSR.Van3D = { L, W, H, DENTS, sig, mesh, draw, dentTier, lookOf };
})(typeof window !== "undefined" ? window : globalThis);
