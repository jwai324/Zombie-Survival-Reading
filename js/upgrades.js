/* Upgrade definitions and the derived van and van-gun stats (the road).
   Guns carried on foot are in js/weapons.js. Tune numbers here; nothing else needs to change. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  const DEFS = {
    armor: { group: "van", name: "Armor Plating", icon: "ARM", desc: "Bolted steel. More van health.", max: 5, costs: [40, 70, 110, 160, 220] },
    engine: { group: "van", name: "Engine Tune", icon: "ENG", desc: "More speed. More miles. Faster dodges.", max: 5, costs: [45, 80, 120, 170, 230] },
    bumper: { group: "van", name: "Ram Plow", icon: "RAM", desc: "Front plow. Walkers that touch it pay for it.", max: 5, costs: [35, 60, 95, 140, 200] },
    paint: { group: "van", name: "Paint & Decals", icon: "PNT", desc: "New finish for the van. Style only.", max: 5, costs: [20, 25, 30, 35, 40] },
    damage: { group: "gun", name: "Heavier Rounds", icon: "RND", desc: "The van's gun on the road. Every hit does more.", max: 5, costs: [40, 70, 110, 160, 220] },
    fireRate: { group: "gun", name: "Rate of Fire", icon: "ROF", desc: "The van's gun on the road. Shorter time between shots.", max: 5, costs: [40, 70, 110, 160, 220] },
    spread: { group: "gun", name: "Spread Shot", icon: "SPR", desc: "The van's gun on the road. Extra rounds with every shot.", max: 3, costs: [90, 180, 300] },
  };

  const REPAIR = { name: "Field Repair", icon: "FIX", desc: "Ruby and Doc Lin patch the van.", cost: 30, heal: 40 };

  const PAINT_LOOKS = [
    { name: "Primer Gray", body: "#7a7d82", roof: "#6c6f74", decal: "none" },
    { name: "Matte Black", body: "#26282c", roof: "#303338", decal: "stripe" },
    { name: "Rust Bucket", body: "#8a4a2e", roof: "#7a3f26", decal: "patches" },
    { name: "Olive Drab", body: "#5b6b3a", roof: "#4e5c32", decal: "stencil" },
    { name: "Hazard", body: "#d4a020", roof: "#c08f1a", decal: "hazard" },
    { name: "Convoy Red", body: "#9b2a22", roof: "#861f1a", decal: "flames" },
  ];

  const Upgrades = {
    DEFS,
    REPAIR,
    PAINT_LOOKS,
    SPREAD: 0.14, // radians between the roof gun's barrels; each barrel fires along its own line

    cost(key, level) {
      const d = DEFS[key];
      return level >= d.max ? null : d.costs[level];
    },

    /** Derived stats from an upgrades object. */
    stats(u) {
      return {
        maxHp: 100 + u.armor * 30,
        speed: 1 + u.engine * 0.14, // road scroll and mile rate multiplier
        laneSpeed: 380 + u.engine * 50, // px/s the van can slide across the road
        // damage dealt to walkers that touch the van: 4, then 28, 40, 52 ... (the plow itself is the big step). On the
        // angled road a walker pressed on the van slides off its side after a touch or two (the old top-down road's
        // stayed on it until downed), so the plow must down one in fewer touches to be worth what it was there
        // (DESIGN.md "Walkers and balance": Ram Plow 1 about halves a dangerous drive's damage, Ram Plow 3 a quarter)
        // SCALE: tied to the road walkers' health (WALKER_TYPES hp x the trip's hpMult): tougher walkers or more levels
        // change how many touches it takes
        ram: 4 + u.bumper * 12 + (u.bumper ? 12 : 0),
        ramKnock: 90 + u.bumper * 40,
        damage: 10 + u.damage * 6,
        fireInterval: Math.max(0.14, 0.4 - u.fireRate * 0.052), // seconds between shots
        bullets: 1 + u.spread,
        bulletSpeed: 820,
        look: PAINT_LOOKS[Math.min(u.paint, PAINT_LOOKS.length - 1)],
      };
    },

    /** Try to buy an upgrade; mutates the run and returns true on success. */
    buy(run, key) {
      const level = run.upgrades[key];
      const c = this.cost(key, level);
      if (c == null || run.scrap < c) return false;
      run.scrap -= c;
      run.upgrades[key] = level + 1;
      if (key === "armor") run.hp = Math.min(this.stats(run.upgrades).maxHp, run.hp + 30);
      return true;
    },

    repair(run) {
      const maxHp = this.stats(run.upgrades).maxHp;
      if (run.scrap < REPAIR.cost || run.hp >= maxHp) return false;
      run.scrap -= REPAIR.cost;
      run.hp = Math.min(maxHp, run.hp + REPAIR.heal);
      return true;
    },
  };

  ZSR.Upgrades = Upgrades;
})(typeof globalThis !== "undefined" ? globalThis : this);
