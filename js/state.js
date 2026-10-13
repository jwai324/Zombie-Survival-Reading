/* State: settings, labeled save slots (one base save per player), and the in-memory trip.
   A base save is written only at the base. A trip (everything since you left) lives in
   memory and is lost on death or refresh, by design. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const W = () => ZSR.WORLD;

  const KEYS = { settings: "zs.settings", slots: "zs.slots", legacy: "zs.base", slot: (id) => "zs.save." + id };

  const DEFAULT_SETTINGS = {
    level: 3, // reading level 1..6
    textSize: "normal", // normal | large | huge
    sound: true,
    aimAssist: true,
    shake: true,
    mouseSens: 1,
    seenHowto: false,
  };

  function read(key, fallback) {
    try {
      const raw = root.localStorage && root.localStorage.getItem(key);
      return raw ? Object.assign({}, fallback, JSON.parse(raw)) : Object.assign({}, fallback);
    } catch (e) {
      return Object.assign({}, fallback);
    }
  }
  function write(key, value) {
    try {
      if (value == null) root.localStorage.removeItem(key);
      else root.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* private mode or storage full: play on without saving */
    }
  }
  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function freshSave(label) {
    const rooms = {};
    Object.keys(W().BASE_ROOMS).forEach((k) => (rooms[k] = 0));
    const traps = {};
    Object.keys(W().TRAPS).forEach((k) => (traps[k] = 0));
    return {
      version: 3,
      label: label || "Player",
      day: 1,
      scrap: W().SETTINGS.startScrap || 0,
      food: W().SETTINGS.startFood,
      inventory: {},
      rooms,
      upgrades: { armor: 0, engine: 0, bumper: 0, paint: 0, damage: 0, fireRate: 0, spread: 0 },
      weapons: ZSR.Weapons.fresh(W().LOCATIONS), // { owned, equipped, mods: {id: {damage, range, rate, aim}}, where: {id: locId}, seed }
      vanHp: 100,
      known: W().LOCATIONS.filter((l) => l.known).map((l) => l.id),
      loc: {}, // per location: { taken: {spot: dayTaken}, cacheOpened, cacheTaken: {spot: true}, visits }
      backpack: [], // [{ noteId, locId, found, day }]
      keys: {}, // stash keys found: { [locId where it was found]: { day } }; KEYS says which stash each opens
      tagsSeen: [], // item keys whose tags have been read (kept in the backpack)
      log: [], // one entry per day at home: { day, journal, radio, recap }; the words come from the reading level
      radioHeard: 0, // broadcasts heard so far (the next one plays the day after)
      kits: 0, // medical kits packed in the backpack (heal to full)
      fence: {}, // "x,y" -> health; 0 is a hole. Holes never close on their own.
      traps, // crafted traps in stock, by type
      yardTraps: [], // traps set in the yard: [{ x, y, type, uses }]
      typing: { stage: 0, rounds: 0, tutorialSeen: false }, // the workbench typing game
      labAcc: 0, // partial medical kits brewing in the Lab
      stats: { trips: 0, walkers: 0, notesRead: 0, wordsRead: 0, items: 0 },
      wave: 0, // waves survived during this stay at the base (escalation)
      best: { days: 1, baseLevel: 0 },
      savedAt: Date.now(),
    };
  }
  /** Fill in anything an older save lacks, so every field the game reads exists. */
  function upgradeSave(s) {
    ZSR.Weapons.upgradeSave(s, W().LOCATIONS); // before the fill-in below, so an old pistol keeps its gun upgrades
    const fresh = freshSave(s.label);
    Object.keys(fresh).forEach((k) => {
      if (s[k] == null) s[k] = fresh[k];
    });
    Object.keys(fresh.rooms).forEach((k) => {
      if (s.rooms[k] == null) s.rooms[k] = 0;
    });
    Object.keys(fresh.traps).forEach((k) => {
      if (s.traps[k] == null) s.traps[k] = 0;
    });
    Object.keys(fresh.typing).forEach((k) => {
      if (s.typing[k] == null) s.typing[k] = fresh.typing[k];
    });
    s.version = 3;
    return s;
  }

  const State = {
    settings: read(KEYS.settings, DEFAULT_SETTINGS),
    save: null, // committed base save (loaded or new)
    trip: null, // in-memory: { at, vanHp, footHp, cargo, loc overlay, backpack additions, revived, visited, rooms }

    saveSettings() {
      write(KEYS.settings, this.settings);
    },

    /* ---------- Save slots ---------- */
    /** The slot index: { active, list: { id: { label, createdAt } } }. Migrates the old single save into slot 1. */
    slots() {
      const idx = read(KEYS.slots, { active: null, list: {} });
      if (!idx.list) idx.list = {};
      const old = read(KEYS.legacy, {});
      if (old.version && !idx.list[1]) {
        old.label = old.label || "Player 1";
        write(KEYS.slot(1), old);
        idx.list[1] = { label: old.label, createdAt: old.savedAt || Date.now() };
        if (!idx.active) idx.active = 1;
        write(KEYS.slots, idx);
        write(KEYS.legacy, null);
      }
      return idx;
    },
    listSlots() {
      const idx = this.slots();
      const out = [];
      for (let id = 1; id <= (W().SETTINGS.saveSlots || 4); id++) {
        const meta = idx.list[id];
        const s = meta ? read(KEYS.slot(id), {}) : {};
        out.push({ id, label: meta ? meta.label : null, save: s.version ? s : null, active: idx.active === id });
      }
      return out;
    },
    activeSlot() {
      return this.slots().active;
    },
    setActiveSlot(id) {
      const idx = this.slots();
      idx.active = id;
      write(KEYS.slots, idx);
    },
    hasSave(id) {
      const sid = id || this.activeSlot();
      return !!sid && !!read(KEYS.slot(sid), { _none: true }).version;
    },
    /** The save on disk for display only; never touches this.save or this.trip. */
    peekSave(id) {
      const sid = id || this.activeSlot();
      if (!sid) return null;
      const s = read(KEYS.slot(sid), {});
      return s.version ? s : null;
    },
    loadSave(id) {
      const sid = id || this.activeSlot();
      if (!sid) return null;
      const s = read(KEYS.slot(sid), {});
      if (!s.version) return null;
      if (id) this.setActiveSlot(id);
      this.save = upgradeSave(s);
      this.trip = null;
      return this.save;
    },
    newGame(id, label) {
      const idx = this.slots();
      const sid = id || idx.active || 1;
      const name = (label || "").trim() || "Player " + sid;
      idx.list[sid] = { label: name, createdAt: Date.now() };
      idx.active = sid;
      write(KEYS.slots, idx);
      this.save = freshSave(name);
      this.trip = null;
      this.logDay(null); // Day 1 in June's journal: the night the crew finds the cabin
      this.commit();
      return this.save;
    },
    deleteSlot(id) {
      const idx = this.slots();
      const wasActive = idx.active === id;
      delete idx.list[id];
      write(KEYS.slot(id), null);
      if (wasActive) idx.active = null;
      write(KEYS.slots, idx);
      if (wasActive) {
        this.save = null;
        this.trip = null;
      }
    },
    /** Write the base save. Only called while at the base. */
    commit() {
      if (!this.save) return;
      const sid = this.activeSlot();
      if (!sid) return;
      this.save.savedAt = Date.now();
      this.save.best.days = Math.max(this.save.best.days, this.save.day);
      this.save.best.baseLevel = Math.max(this.save.best.baseLevel, this.baseLevel());
      write(KEYS.slot(sid), this.save);
    },
    wipe() {
      const sid = this.activeSlot();
      if (sid) this.deleteSlot(sid);
      this.save = null;
      this.trip = null;
    },

    baseLevel() {
      return Object.values(this.save.rooms).reduce((a, b) => a + b, 0);
    },
    maxBaseLevel() {
      return Object.keys(W().BASE_ROOMS).length * 3;
    },

    /* ---------- Derived effects of the base rooms ---------- */
    effects() {
      const fx = { vanHp: 0, footHp: 0, tierCap: 2, freeRepair: false, showDanger: false, crates: 0, headlights: false, footRegen: 0, fullHealOnEntry: false, foodPerDay: 0, medsPerDay: 0, water: 0, reveal: 0, showStock: false, footDamage: 1, revive: 0, vanDamage: 1, notesShowStock: false, mapShowsCaches: false, mapShowsStock: false };
      const ADD = { foodPerDay: true, medsPerDay: true }; // these stack across rooms; everything else takes the best level
      Object.entries(this.save.rooms).forEach(([room, lvl]) => {
        const levels = W().BASE_ROOMS[room] ? W().BASE_ROOMS[room].levels : [];
        const best = {};
        for (let i = 0; i < lvl && i < levels.length; i++) {
          Object.entries(levels[i].effect).forEach(([k, v]) => {
            if (typeof v === "number" && ADD[k]) best[k] = Math.max(best[k] || 0, v);
            else if (typeof v === "number" && k !== "footDamage" && k !== "vanDamage") fx[k] = Math.max(fx[k], v);
            else if (typeof v === "number") fx[k] = Math.min(fx[k], v);
            else fx[k] = v;
          });
        }
        Object.entries(best).forEach(([k, v]) => (fx[k] += v));
      });
      return fx;
    },
    vanMaxHp() {
      return ZSR.Upgrades.stats(this.save.upgrades).maxHp + this.effects().vanHp;
    },
    footMaxHp() {
      return W().SETTINGS.footHp + this.effects().footHp;
    },

    /* ---------- Trip (in memory only) ---------- */
    startTrip() {
      const s = this.save;
      const hungry = s.food <= 0;
      const maxHp = this.vanMaxHp() * (hungry ? W().SETTINGS.hungryVanPenalty : 1);
      this.trip = {
        at: "base",
        atDoor: null,
        hungry,
        vanMaxHp: maxHp,
        vanHp: Math.min(s.vanHp, maxHp),
        footHp: this.footMaxHp(),
        cargo: {},
        scrap: 0, // scrap earned this trip (added to the save on return)
        loc: {}, // overlay of location changes made this trip
        rooms: {}, // per building: walkers, piles and doors exactly as you left them
        notes: [], // notes read this trip (added to the backpack on return)
        weapons: [], // weapons picked up this trip (yours once you get home)
        revealed: [], // locations revealed this trip
        revived: false,
        visited: [],
        keys: [], // stash keys picked up this trip (yours once you get home)
        tags: [], // item tags read this trip
        signs: [], // wall signs read this trip (counted once for words read)
        walkers: 0,
        wordsRead: 0,
        items: 0,
      };
      return this.trip;
    },
    /** Location state as seen right now: committed save plus this trip's overlay. */
    locState(id) {
      const base = this.save.loc[id] || {};
      const over = (this.trip && this.trip.loc[id]) || {};
      return {
        taken: Object.assign({}, base.taken, over.taken),
        cacheOpened: !!(base.cacheOpened || over.cacheOpened),
        cacheTaken: Object.assign({}, base.cacheTaken, over.cacheTaken),
        stashOpened: !!(base.stashOpened || over.stashOpened),
        stashTaken: Object.assign({}, base.stashTaken, over.stashTaken),
        visits: (base.visits || 0) + (over.visits || 0),
      };
    },
    tripLoc(id) {
      if (!this.trip.loc[id]) this.trip.loc[id] = { taken: {}, cacheTaken: {}, cacheOpened: false, stashTaken: {}, stashOpened: false, visits: 0 };
      return this.trip.loc[id];
    },
    itemAvailable(id, spot) {
      const st = this.locState(id);
      const when = st.taken[spot];
      return when == null || this.save.day - when >= W().SETTINGS.restockDays;
    },
    /** source: false for a shelf or floor item, true (or "cache") for the cache, "stash" for the stash. */
    takeItem(id, spot, source) {
      const tl = this.tripLoc(id);
      if (source === "stash") tl.stashTaken[spot] = true;
      else if (source) tl.cacheTaken[spot] = true;
      else tl.taken[spot] = this.save.day;
      this.trip.items += 1;
    },

    /* ---------- Stash keys (the key ring) ---------- */
    /** Holding the key found at `fromId` (saved, or picked up this trip). */
    hasKeyFrom(fromId) {
      return !!(this.save.keys && this.save.keys[fromId]) || (!!this.trip && (this.trip.keys || []).includes(fromId));
    },
    /** Where the key to this location's stash is hidden. */
    keySourceFor(stashId) {
      return Object.keys(W().KEYS || {}).find((from) => W().KEYS[from] === stashId) || null;
    },
    canOpenStash(stashId) {
      const from = this.keySourceFor(stashId);
      return !!from && this.hasKeyFrom(from);
    },
    takeKey(fromId) {
      if (this.hasKeyFrom(fromId)) return false;
      if (this.trip) this.trip.keys.push(fromId);
      else this.save.keys[fromId] = { day: this.save.day };
      return true;
    },
    /** Keys held right now: [{ from, opens, day, trip }]. */
    keysHeld() {
      const out = Object.entries(this.save.keys || {}).map(([from, k]) => ({ from, opens: W().KEYS[from], day: k.day, trip: false }));
      ((this.trip && this.trip.keys) || []).forEach((from) => out.push({ from, opens: W().KEYS[from], day: this.save.day, trip: true }));
      return out;
    },

    /* ---------- Item tags ---------- */
    tagSeen(item) {
      return (this.save.tagsSeen || []).includes(item) || (!!this.trip && (this.trip.tags || []).includes(item));
    },
    /** Mark an item's tag read; true the first time (for the words-read count). */
    seeTag(item) {
      if (this.tagSeen(item)) return false;
      if (this.trip) this.trip.tags.push(item);
      else this.save.tagsSeen.push(item);
      return true;
    },
    /** A wall sign read up close: counted once per trip. */
    seeSign(signId, words) {
      if (!this.trip || (this.trip.signs || []).includes(signId)) return false;
      this.trip.signs.push(signId);
      this.trip.wordsRead += words || 0;
      return true;
    },
    noteRead(noteId) {
      return this.save.backpack.some((n) => n.noteId === noteId) || (!!this.trip && this.trip.notes.some((n) => n.noteId === noteId));
    },
    readNote(noteId, locId, found) {
      if (!this.trip || this.noteRead(noteId)) return false;
      this.trip.notes.push({ noteId, locId, found, day: this.save.day });
      return true;
    },
    isKnown(id) {
      return this.save.known.includes(id) || (this.trip && this.trip.revealed.includes(id));
    },
    reveal(ids) {
      const added = [];
      (ids || []).forEach((id) => {
        if (!this.isKnown(id)) {
          if (this.trip) this.trip.revealed.push(id);
          else this.save.known.push(id);
          added.push(id);
        }
      });
      return added;
    },
    /** All notes the player holds (saved plus this trip), newest last. */
    allNotes() {
      return this.save.backpack.concat(this.trip ? this.trip.notes : []);
    },

    /** Arrive home: merge the trip into the save, pass a day, and write it. */
    returnHome() {
      const s = this.save;
      const t = this.trip;
      if (t) {
        Object.entries(t.cargo).forEach(([k, n]) => (s.inventory[k] = (s.inventory[k] || 0) + n));
        s.scrap += t.scrap;
        Object.entries(t.loc).forEach(([id, over]) => {
          const base = (s.loc[id] = s.loc[id] || { taken: {}, cacheOpened: false, cacheTaken: {}, visits: 0 });
          Object.assign(base.taken, over.taken);
          Object.assign(base.cacheTaken, over.cacheTaken);
          base.cacheOpened = base.cacheOpened || over.cacheOpened;
          base.stashTaken = Object.assign(base.stashTaken || {}, over.stashTaken);
          base.stashOpened = !!(base.stashOpened || over.stashOpened);
          base.visits += over.visits || 0;
        });
        t.notes.forEach((n) => {
          if (!s.backpack.some((x) => x.noteId === n.noteId)) s.backpack.push(n);
        });
        t.revealed.forEach((id) => {
          if (!s.known.includes(id)) s.known.push(id);
        });
        (t.weapons || []).forEach((id) => {
          if (!s.weapons.owned.includes(id)) s.weapons.owned.push(id);
        });
        (t.keys || []).forEach((from) => {
          if (!s.keys[from]) s.keys[from] = { day: s.day };
        });
        (t.tags || []).forEach((item) => {
          if (!s.tagsSeen.includes(item)) s.tagsSeen.push(item);
        });
        // the crew patches the worst of it overnight, so a near-dead van is never saved as a trap;
        // a hungry trip ran on a lower ceiling, so scale its health back before saving it as damage
        const hp = t.hungry ? t.vanHp / W().SETTINGS.hungryVanPenalty : t.vanHp;
        s.vanHp = Math.min(this.vanMaxHp(), Math.max(Math.round(this.vanMaxHp() * 0.4), Math.round(hp)));
        s.stats.trips += 1;
        s.stats.walkers += t.walkers;
        s.stats.notesRead += t.notes.length;
        s.stats.wordsRead += t.wordsRead;
        s.stats.items += t.items;
        // a day passes: the crew eats, the garden and the farm grow, the lab brews
        const fx = this.effects();
        s.day += 1;
        s.wave = 0;
        s.food = Math.max(0, s.food - W().SETTINGS.foodPerTrip) + fx.foodPerDay;
        s.labAcc = (s.labAcc || 0) + fx.medsPerDay;
        while (s.labAcc >= 1 - 1e-9) {
          s.labAcc -= 1;
          s.inventory.meds = (s.inventory.meds || 0) + 1;
        }
        this.logDay({ items: Object.values(t.cargo).reduce((a, b) => a + b, 0), scrap: t.scrap, notes: t.notes.length, keys: (t.keys || []).length });
      }
      this.trip = null;
      if (this.effects().freeRepair) s.vanHp = this.vanMaxHp();
      this.commit();
    },

    /* ---------- The day log: June's journal, the radio, and a recap of the day ---------- */
    /** Entry n of a list of len: in order, then the later part repeats (the early days are a one-time story). */
    cycleIndex(n, len) {
      if (!len) return null;
      if (n < len) return n;
      const loop = Math.max(1, Math.min(len, Math.floor(len / 3)));
      return len - loop + ((n - len) % loop);
    },
    /** Write today's entry (called when a day passes, and on Day 1). `trip` is null on Day 1. */
    logDay(trip) {
      const s = this.save;
      const J = W().JOURNAL || [];
      const R = W().RADIO || [];
      const entry = { day: s.day, journal: this.cycleIndex(s.day - 1, J.length), radio: null, recap: null };
      if (s.rooms.radio > 0 && R.length) {
        entry.radio = this.cycleIndex(s.radioHeard || 0, R.length);
        s.radioHeard = (s.radioHeard || 0) + 1;
      }
      if (trip) entry.recap = Object.assign({ food: s.food, hungry: s.food <= 0, next: this.nextBuild() }, trip);
      s.log.push(entry);
      if (s.log.length > 120) s.log.splice(0, s.log.length - 120);
      return entry;
    },
    /** The room closest to buildable (fewest things missing, not locked): { room, missing: {item: n}, scrap }. */
    nextBuild() {
      let best = null;
      Object.keys(W().BASE_ROOMS).forEach((room) => {
        const c = this.canUpgradeRoom(room);
        if (c.maxed || c.locked.length) return;
        const short = Object.values(c.missing).reduce((a, b) => a + b, 0) + (c.scrapShort ? 1 : 0);
        if (!best || short < best.short) best = { room, short, missing: c.missing, scrap: c.scrapShort, ready: c.ok };
      });
      return best && { room: best.room, missing: best.missing, scrap: best.scrap, ready: best.ready };
    },

    /** Death: throw the trip away. The save on disk is untouched. */
    abandonTrip() {
      this.trip = null;
      this.loadSave();
    },

    /* ---------- Medical kits ---------- */
    kitsHeld() {
      return { packed: this.save.kits || 0, storage: this.save.inventory.meds || 0, cargo: this.trip ? this.trip.cargo.meds || 0 : 0 };
    },
    packKit() {
      if (this.trip) return false; // only at the cabin
      if ((this.save.inventory.meds || 0) < 1 || (this.save.kits || 0) >= W().SETTINGS.kitsMax) return false;
      this.save.inventory.meds -= 1;
      this.save.kits = (this.save.kits || 0) + 1;
      this.commit();
      return true;
    },
    unpackKit() {
      if (this.trip || !(this.save.kits > 0)) return false;
      this.save.kits -= 1;
      this.save.inventory.meds = (this.save.inventory.meds || 0) + 1;
      this.commit();
      return true;
    },
    /** Spend a kit from the backpack ("pack") or the van's cargo ("cargo"). The caller heals the player. */
    useKit(from) {
      if (from === "cargo") {
        if (!this.trip || !(this.trip.cargo.meds > 0)) return false;
        this.trip.cargo.meds -= 1;
        if (!this.trip.cargo.meds) delete this.trip.cargo.meds;
        return true;
      }
      if (!(this.save.kits > 0)) return false;
      this.save.kits -= 1; // at home the yard sync commits it, never in the middle of a wave
      return true;
    },

    /* ---------- Base actions ---------- */
    /** Rooms that must be built first for this level, and which of them are missing. */
    roomRequirements(def) {
      return Object.entries(def.requires || {}).map(([room, lvl]) => ({ room, level: lvl, name: W().BASE_ROOMS[room].name, ok: (this.save.rooms[room] || 0) >= lvl }));
    },
    canUpgradeRoom(room) {
      const lvl = this.save.rooms[room];
      const def = W().BASE_ROOMS[room].levels[lvl];
      if (!def) return { ok: false, maxed: true };
      const missing = {};
      Object.entries(def.needs).forEach(([k, n]) => {
        const have = this.save.inventory[k] || 0;
        if (have < n) missing[k] = n - have;
      });
      const scrapShort = Math.max(0, def.scrap - this.save.scrap);
      const requires = this.roomRequirements(def);
      const locked = requires.filter((r) => !r.ok);
      return { ok: !Object.keys(missing).length && !scrapShort && !locked.length, missing, scrapShort, def, requires, locked };
    },
    upgradeRoom(room) {
      const c = this.canUpgradeRoom(room);
      if (!c.ok) return false;
      Object.entries(c.def.needs).forEach(([k, n]) => (this.save.inventory[k] -= n));
      this.save.scrap -= c.def.scrap;
      this.save.rooms[room] += 1;
      if (room === "walls") this.save.vanHp = Math.min(this.vanMaxHp(), this.save.vanHp + 30);
      if (room === "radio") {
        const fx = this.effects();
        const unknown = W().LOCATIONS.filter((l) => !this.save.known.includes(l.id)).sort((a, b) => a.danger - b.danger);
        unknown.slice(0, fx.reveal >= 99 ? unknown.length : fx.reveal).forEach((l) => this.save.known.push(l.id));
      }
      this.commit();
      return true;
    },
    /** Van and gun upgrades, capped by the Garage room. */
    upgradeCap(key) {
      const cap = this.effects().tierCap;
      const d = ZSR.Upgrades.DEFS[key];
      return Math.min(d.max, key === "spread" ? Math.max(1, cap - 2) : cap);
    },
    canBuyUpgrade(key) {
      const d = ZSR.Upgrades.DEFS[key];
      const level = this.save.upgrades[key];
      const cost = ZSR.Upgrades.cost(key, level);
      const capFor = (tc) => Math.min(d.max, key === "spread" ? Math.max(1, tc - 2) : tc);
      const capped = level >= capFor(this.effects().tierCap);
      const garageLevels = W().BASE_ROOMS.garage.levels;
      const needIdx = garageLevels.findIndex((l) => capFor(l.effect.tierCap) > level);
      const garageNeeded = capped && cost != null ? (needIdx < 0 ? garageLevels.length : needIdx + 1) : 0;
      return { ok: cost != null && !capped && this.save.scrap >= cost, cost, capped, maxed: cost == null, garageNeeded, level };
    },
    buyUpgrade(key) {
      const c = this.canBuyUpgrade(key);
      if (!c.ok) return false;
      this.save.scrap -= c.cost;
      this.save.upgrades[key] += 1;
      if (key === "armor") this.save.vanHp = Math.min(this.vanMaxHp(), this.save.vanHp + 30);
      this.commit();
      return true;
    },
    /** Scrap to bring the van back to full health. */
    repairCost() {
      const missing = this.vanMaxHp() - this.save.vanHp;
      if (missing <= 0) return 0;
      if (this.effects().freeRepair) return 0;
      return Math.max(W().SETTINGS.repairMinScrap, Math.ceil(missing / W().SETTINGS.repairScrapPerHp));
    },
    repairVan() {
      const max = this.vanMaxHp();
      if (this.save.vanHp >= max) return false;
      const cost = this.repairCost();
      if (this.save.scrap < cost) return false;
      this.save.scrap -= cost;
      this.save.vanHp = max;
      this.commit();
      return true;
    },
    /* ---------- Traps ---------- */
    canCraftTrap(type) {
      const def = W().TRAPS[type];
      const missing = {};
      Object.entries(def.needs).forEach(([k, n]) => {
        const have = this.save.inventory[k] || 0;
        if (have < n) missing[k] = n - have;
      });
      const scrapShort = Math.max(0, def.scrap - this.save.scrap);
      const requires = this.roomRequirements(def);
      const locked = requires.filter((r) => !r.ok);
      return { ok: !Object.keys(missing).length && !scrapShort && !locked.length, missing, scrapShort, def, requires, locked };
    },
    craftTrap(type) {
      const c = this.canCraftTrap(type);
      if (!c.ok) return false;
      Object.entries(c.def.needs).forEach(([k, n]) => (this.save.inventory[k] -= n));
      this.save.scrap -= c.def.scrap;
      this.save.traps[type] = (this.save.traps[type] || 0) + 1;
      this.commit();
      return true;
    },
    /* ---------- On-foot weapons ---------- */
    /** Weapons in hand right now: owned, plus anything picked up this trip. In slot order. */
    weaponsHeld() {
      const wp = this.save.weapons;
      const extra = this.trip ? this.trip.weapons || [] : [];
      return ZSR.Weapons.ORDER.filter((id) => wp.owned.includes(id) || extra.includes(id));
    },
    hasWeapon(id) {
      return this.weaponsHeld().includes(id);
    },
    equippedWeapon() {
      const id = this.save.weapons.equipped;
      return this.hasWeapon(id) ? id : "pistol";
    },
    equipWeapon(id) {
      if (!this.hasWeapon(id)) return false;
      this.save.weapons.equipped = id; // written with the next save; a trip-only pick-up is undone by death like everything else
      return true;
    },
    weaponStats(id) {
      const wid = id || this.equippedWeapon();
      return ZSR.Weapons.stats(wid, this.save.weapons.mods[wid]);
    },
    /** The weapon still lying in this building, if any (not yet owned or picked up). */
    weaponAt(locId) {
      const wp = this.save.weapons;
      return ZSR.Weapons.ORDER.find((id) => wp.where[id] === locId && !this.hasWeapon(id)) || null;
    },
    takeWeapon(id) {
      if (this.hasWeapon(id)) return false;
      if (this.trip) this.trip.weapons.push(id);
      else this.save.weapons.owned.push(id);
      return true;
    },
    canBuyMod(id, key) {
      const level = (this.save.weapons.mods[id] || {})[key] || 0;
      const cost = ZSR.Weapons.cost(id, key, level);
      const owned = this.save.weapons.owned.includes(id);
      return { ok: owned && cost != null && this.save.scrap >= cost, cost, level, maxed: cost == null, owned };
    },
    buyMod(id, key) {
      const c = this.canBuyMod(id, key);
      if (!c.ok) return false;
      this.save.scrap -= c.cost;
      this.save.weapons.mods[id][key] = c.level + 1;
      this.commit();
      return true;
    },

    /* ---------- The workbench typing game ---------- */
    typingDone(result) {
      const t = this.save.typing;
      t.stage = Math.min(t.stage + 1, 20); // every finished round moves up; the last stages repeat
      t.rounds += 1;
      t.tutorialSeen = true;
      if (result && result.accuracy != null) t.lastAccuracy = result.accuracy;
      this.commit();
    },
  };

  /* ---------- Text at the current reading level, with a safe fallback ---------- */
  ZSR.text = function text() {
    const T = ZSR.TEXT || {};
    const want = State.settings.level;
    if (T[want]) return T[want];
    const avail = Object.keys(T).map(Number).sort((a, b) => Math.abs(a - want) - Math.abs(b - want));
    return avail.length ? T[avail[0]] : null;
  };
  /** Look something up at the current reading level; if that level lacks it (a note only the
      higher levels place), the nearest level that has it. `pick(levelText)` returns it or null. */
  ZSR.textAt = function textAt(pick) {
    const T = ZSR.TEXT || {};
    const want = State.settings.level;
    const order = Object.keys(T).map(Number).sort((a, b) => Math.abs(a - want) - Math.abs(b - want) || b - a);
    for (const lv of order) {
      let v = null;
      try {
        v = pick(T[lv]);
      } catch (e) {
        v = null;
      }
      if (v != null) return v;
    }
    return null;
  };
  /** Note text at the current level; falls back to the facts so the game never shows nothing. */
  ZSR.noteText = function noteText(locId, noteId) {
    const N = ZSR.WORLD.NOTES[locId];
    const isDoor = N && N.door.id === noteId;
    const entry = ZSR.textAt((t) => {
      const L = t.locations && t.locations[locId];
      const e = L && (isDoor ? L.door : L.notes && L.notes[noteId]);
      return e && e.text ? e : null;
    });
    if (entry) return { title: entry.title || "Note", text: entry.text };
    const facts = isDoor ? N.door.facts : (N.notes.find((n) => n.id === noteId) || {}).facts || [];
    return { title: isDoor ? "At the door" : "A note", text: facts.join(" ") };
  };
  /** A wall sign or graffiti inside a building. */
  ZSR.signText = function signText(locId, signId) {
    const e = ZSR.textAt((t) => {
      const s = t.locations && t.locations[locId] && t.locations[locId].signs && t.locations[locId].signs[signId];
      return s && s.text ? s : null;
    });
    if (e) return { title: e.title || "Sign", text: e.text };
    const sg = ((ZSR.WORLD.NOTES[locId] || {}).signs || []).find((x) => x.id === signId);
    return { title: sg && sg.kind === "graffiti" ? "Spray paint" : "Sign", text: sg ? sg.facts.join(" ") : "" };
  };
  /** The stash key hidden at `fromId`: { name, tag }. */
  ZSR.keyText = function keyText(fromId) {
    const e = ZSR.textAt((t) => {
      const k = t.locations && t.locations[fromId] && t.locations[fromId].key;
      return k && k.name ? k : null;
    });
    if (e) return { name: e.name, tag: e.tag || "" };
    const K = (ZSR.WORLD.NOTES[fromId] || {}).key;
    return { name: "A stash key", tag: K ? K.facts.join(" ") : "" };
  };
  /** One of an item's tags (variant 0 or 1). */
  ZSR.tagText = function tagText(item, variant) {
    const e = ZSR.textAt((t) => {
      const list = t.tags && t.tags[item];
      return list && list.length ? list : null;
    });
    if (e) return e[(variant || 0) % e.length];
    const f = ((ZSR.WORLD.ITEM_TAGS || {})[item] || [])[variant || 0];
    return f ? f.join(" ") : "";
  };
  /** The sign on a yard lot: level 0 is the empty lot. */
  ZSR.lotText = function lotText(room, level) {
    const e = ZSR.textAt((t) => {
      const l = t.yard && t.yard.lots && t.yard.lots[room];
      return l && l.empty ? l : null;
    });
    const name = ZSR.WORLD.BASE_ROOMS[room] ? ZSR.WORLD.BASE_ROOMS[room].name : room;
    if (e) return { title: e.title || name, text: level > 0 ? e.built[Math.min(level, 3) - 1] : e.empty };
    const f = (ZSR.WORLD.YARD_LOTS || {})[room];
    return { title: name, text: f ? (level > 0 ? f.built[Math.min(level, 3) - 1] : f.empty).join(" ") : "" };
  };
  /** A journal entry or a radio broadcast by index. */
  ZSR.dayText = function dayText(kind, idx) {
    const e = ZSR.textAt((t) => {
      const list = t[kind];
      return list && list[idx] && list[idx].text ? list[idx] : null;
    });
    if (e) return { title: e.title || "", text: e.text };
    const f = ((kind === "journal" ? ZSR.WORLD.JOURNAL : ZSR.WORLD.RADIO) || [])[idx];
    return { title: "", text: f ? f.facts.join(" ") : "" };
  };
  /** The recap of a day, from the level's templates: {items} {scrap} {notes} {food} {room} {needs} {keys}. */
  ZSR.recapText = function recapText(r) {
    if (!r) return "";
    const tpl = ZSR.textAt((t) => (t.recap && t.recap.haul ? t.recap : null)) || {
      haul: "We brought home {items} items and {scrap} scrap.",
      nothing: "We came home with nothing this time.",
      notes: "You read {notes} new notes.",
      keys: "You found {keys} stash keys.",
      food: "We have {food} food left.",
      hungry: "We are out of food. The van will be weak tomorrow.",
      next: "Next build: the {room}. It still needs {needs}.",
      ready: "We have everything to build the {room}.",
    };
    const W2 = ZSR.WORLD;
    const fill = (s, o) => String(s || "").replace(/\{(\w+)\}/g, (m, k) => (o[k] != null ? o[k] : m));
    const nb = r.next;
    const needs = nb ? Object.entries(nb.missing || {}).map(([k, n]) => n + " " + W2.ITEMS[k].name).concat(nb.scrap ? [nb.scrap + " scrap"] : []).join(", ") : "";
    const o = Object.assign({}, r, { room: nb ? W2.BASE_ROOMS[nb.room].name : "", needs });
    const out = [];
    out.push(fill(r.items || r.scrap ? tpl.haul : tpl.nothing, o));
    if (r.notes) out.push(fill(tpl.notes, o));
    if (r.keys) out.push(fill(tpl.keys, o));
    out.push(fill(r.hungry ? tpl.hungry : tpl.food, o));
    if (nb) out.push(fill(nb.ready ? tpl.ready : tpl.next, o));
    // templates are written for any number: "1 items" reads "1 item"
    return out.join(" ").replace(/\b1 ((?:stash |new )?)(item|note|key|walker)s\b/g, "1 $1$2");
  };

  ZSR.State = State;
})(typeof globalThis !== "undefined" ? globalThis : this);
