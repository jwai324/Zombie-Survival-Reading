/* On-foot weapons: what each one does, what its mods add, and where in the city each is hidden.
   The pistol is carried from day one. The others lie on the floor of a building, a different
   building in every save, and are kept once you bring them home. Mods cost scrap at the cabin.
   The van's own gun (the road) is separate: see js/upgrades.js. Tune numbers here. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  /* damage: per hit (the bow: at full draw)   interval: seconds between shots (the bow: to nock an arrow)
     draw: seconds to pull the bow back        range: tiles; nothing farther is hit
     spread: random aim error, radians         noise: tiles; walkers that close hear the shot (0 is silent)
     pierce: walkers one round passes through  move: walking speed while carried
     shake: screen kick per shot               cost: multiplier on mod prices
     danger: building danger levels the weapon can turn up in (the pistol is carried from the start) */
  const WEAPONS = {
    pistol: { name: "Pistol", slot: 1, damage: 12, interval: 0.38, range: 10, spread: 0.012, noise: 11, pierce: 1, move: 1, shake: 0, cost: 1, desc: "The sidearm you started with. Steady, cheap to improve." },
    dual: { name: "Double pistols", slot: 2, damage: 11, interval: 0.19, range: 9, spread: 0.03, noise: 12, pierce: 1, move: 1, shake: 0, cost: 1.3, danger: [1, 2], desc: "One in each hand, fired left and right in turn. Twice the rounds, a little wilder." },
    mg: { name: "Machine gun", slot: 3, damage: 9, interval: 0.09, range: 13, spread: 0.035, noise: 14, pierce: 1, move: 0.95, shake: 1.5, cost: 1.6, danger: [2, 3], desc: "Hold the trigger and it keeps going. Loud: every walker nearby hears it." },
    hmg: { name: "Heavy machine gun", slot: 4, damage: 20, interval: 0.1, range: 16, spread: 0.05, noise: 18, pierce: 2, move: 0.8, shake: 3.5, cost: 2.2, danger: [4, 5], desc: "Belt-fed and very heavy. Rounds go through two walkers, but you walk slower and the whole block hears it." },
    bow: { name: "Bow and arrow", slot: 5, damage: 60, interval: 0.5, draw: 0.8, range: 18, spread: 0.006, noise: 0, pierce: 1, move: 1, shake: 0, cost: 1.3, danger: [2, 4], desc: "Hold to draw, let go to shoot. Silent: walkers do not hear it. A full draw hits hardest." },
  };
  const ORDER = Object.keys(WEAPONS).sort((a, b) => WEAPONS[a].slot - WEAPONS[b].slot);

  /* Mods: three tiers each, bought with scrap. `per` is what one tier adds. */
  const MODS = {
    damage: { name: "Damage", icon: "DMG", per: 0.25, desc: "Heavier rounds. Every hit does more." },
    range: { name: "Range", icon: "RNG", per: 0.25, desc: "A longer barrel and better sights. Hits from farther away." },
    rate: { name: "Fire rate", icon: "ROF", per: 0.12, desc: "A smoother action. Less time between shots." },
    aim: { name: "Accuracy", icon: "AIM", per: 0.3, desc: "A steadier grip. Rounds land closer to the crosshair." },
  };
  const BOW_MODS = {
    damage: { name: "Broadheads", desc: "Sharper, heavier arrow tips. Every hit does more." },
    range: { name: "Stronger limbs", desc: "A stiffer bow. Arrows fly farther." },
    rate: { name: "Draw speed", desc: "A smoother pull. Draw and nock faster." },
    aim: { name: "Sight pins", desc: "Pins on the riser. Arrows land closer to the crosshair." },
  };
  const MOD_MAX = 3;
  const MOD_COSTS = [25, 50, 90]; // scrap for tier 1, 2, 3, before the weapon's cost multiplier

  const freshMods = () => {
    const out = {};
    ORDER.forEach((id) => {
      out[id] = {};
      Object.keys(MODS).forEach((k) => (out[id][k] = 0));
    });
    return out;
  };

  const Weapons = {
    WEAPONS,
    ORDER,
    MODS,
    MOD_MAX,

    /** Name and description of a mod for this weapon (the bow has its own words). */
    mod(id, key) {
      const base = MODS[key];
      const over = id === "bow" ? BOW_MODS[key] : null;
      return Object.assign({}, base, over || {});
    },

    /** Scrap for the next tier, or null at the top. */
    cost(id, key, level) {
      const w = WEAPONS[id];
      if (!w || level >= MOD_MAX) return null;
      return Math.round((MOD_COSTS[level] * w.cost) / 5) * 5;
    },

    /** Derived stats for a weapon with its mods. */
    stats(id, mods) {
      const w = WEAPONS[id] || WEAPONS.pistol;
      const m = mods || {};
      const lv = (k) => Math.max(0, Math.min(MOD_MAX, m[k] || 0));
      const faster = 1 - MODS.rate.per * lv("rate");
      return {
        id: WEAPONS[id] ? id : "pistol",
        name: w.name,
        slot: w.slot,
        damage: Math.round(w.damage * (1 + MODS.damage.per * lv("damage"))),
        interval: w.interval * faster,
        draw: w.draw ? w.draw * faster : 0,
        range: Math.round(w.range * (1 + MODS.range.per * lv("range")) * 10) / 10,
        spread: w.spread * Math.pow(1 - MODS.aim.per, lv("aim")),
        noise: w.noise,
        pierce: w.pierce,
        move: w.move,
        shake: w.shake,
      };
    },

    /** A new save's weapons: the pistol in hand, the rest hidden in random buildings.
     *  SCALE: rolled once per save; buildings added later never get one of these guns in an old save. */
    fresh(locations) {
      return { owned: ["pistol"], equipped: "pistol", mods: freshMods(), where: this.roll(locations), seed: Math.floor(Math.random() * 1e9) };
    },

    /** Pick a building for every weapon that is found, within its danger range; no two share one when it can be helped. */
    roll(locations, rnd) {
      const r = rnd || Math.random;
      const used = new Set();
      const out = {};
      ORDER.forEach((id) => {
        const w = WEAPONS[id];
        if (!w.danger) return;
        const pool = locations.filter((l) => l.template && l.danger >= w.danger[0] && l.danger <= w.danger[1]);
        const free = pool.filter((l) => !used.has(l.id));
        const from = free.length ? free : pool;
        if (!from.length) return;
        const pick = from[Math.floor(r() * from.length)];
        out[id] = pick.id;
        used.add(pick.id);
      });
      return out;
    },

    /** Fill in whatever an older save's weapons lack. An old save's pistol keeps what its gun upgrades bought. */
    upgradeSave(save, locations) {
      if (!save.weapons) {
        save.weapons = this.fresh(locations);
        const u = save.upgrades || {};
        save.weapons.mods.pistol.damage = Math.min(MOD_MAX, u.damage || 0);
        save.weapons.mods.pistol.rate = Math.min(MOD_MAX, u.fireRate || 0);
        return save.weapons;
      }
      const wp = save.weapons;
      if (!Array.isArray(wp.owned)) wp.owned = ["pistol"];
      if (!wp.owned.includes("pistol")) wp.owned.unshift("pistol");
      wp.owned = wp.owned.filter((id) => WEAPONS[id]);
      if (!WEAPONS[wp.equipped]) wp.equipped = "pistol";
      const fm = freshMods();
      wp.mods = wp.mods || {};
      ORDER.forEach((id) => {
        wp.mods[id] = Object.assign({}, fm[id], wp.mods[id] || {});
      });
      wp.where = wp.where || {};
      const missing = ORDER.filter((id) => WEAPONS[id].danger && !wp.owned.includes(id) && !locations.some((l) => l.id === wp.where[id]));
      if (missing.length) {
        const again = this.roll(locations);
        missing.forEach((id) => (wp.where[id] = again[id]));
      }
      if (wp.seed == null) wp.seed = Math.floor(Math.random() * 1e9);
      return wp;
    },
  };

  ZSR.Weapons = Weapons;
})(typeof globalThis !== "undefined" ? globalThis : this);
