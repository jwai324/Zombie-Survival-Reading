/* Upgrade definitions and the derived van/gun stats.
   Tune numbers here; nothing else needs to change. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  const DEFS = {
    armor: { group: "van", name: "Armor Plates", icon: "\u{1F6E1}\u{FE0F}", desc: "More van health. Bolted-on plates.", max: 5, costs: [40, 70, 110, 160, 220] },
    engine: { group: "van", name: "Engine", icon: "\u{2699}\u{FE0F}", desc: "Faster van: more miles, quicker dodges.", max: 5, costs: [45, 80, 120, 170, 230] },
    bumper: { group: "van", name: "Spiked Bumper", icon: "\u{1F531}", desc: "Ram zombies for big damage.", max: 5, costs: [35, 60, 95, 140, 200] },
    paint: { group: "van", name: "Paint Job", icon: "\u{1F3A8}", desc: "New colors and decals. Pure style.", max: 5, costs: [20, 25, 30, 35, 40] },
    damage: { group: "gun", name: "Gun Damage", icon: "\u{1F4A5}", desc: "Every shot hits harder.", max: 5, costs: [40, 70, 110, 160, 220] },
    fireRate: { group: "gun", name: "Fire Rate", icon: "\u{26A1}", desc: "Shoot faster.", max: 5, costs: [40, 70, 110, 160, 220] },
    spread: { group: "gun", name: "Spread Shot", icon: "\u{1F300}", desc: "Extra bullets with every shot.", max: 3, costs: [90, 180, 300] },
  };

  const REPAIR = { name: "Repair Kit", icon: "\u{1F527}", desc: "Doc Lin patches the van.", cost: 30, heal: 40 };

  const PAINT_LOOKS = [
    { name: "Faded Blue", body: "#5b8fd9", roof: "#dbe7f5", decal: "none" },
    { name: "Fire Red", body: "#e8392f", roof: "#ffe0dc", decal: "stripe" },
    { name: "Flame Job", body: "#1e1e2a", roof: "#ffcf40", decal: "flames" },
    { name: "Book Bus", body: "#ffcf40", roof: "#fff8e7", decal: "book" },
    { name: "Lightning", body: "#3aa0ff", roof: "#e8f4ff", decal: "bolt" },
    { name: "Gold Star", body: "#f2b705", roof: "#fff3c4", decal: "stars" },
  ];

  const Upgrades = {
    DEFS,
    REPAIR,
    PAINT_LOOKS,

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
        ram: 4 + u.bumper * 9, // damage dealt to zombies that touch the van
        ramKnock: 90 + u.bumper * 40,
        damage: 10 + u.damage * 6,
        fireInterval: Math.max(0.14, 0.4 - u.fireRate * 0.052), // seconds between shots
        bullets: 1 + u.spread,
        bulletSpeed: 760,
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
