/* State: settings, the base save (the only save), and the in-memory trip.
   The base save is written only at the base. A trip (everything since you
   left) lives in memory and is lost on death or refresh, by design. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const W = () => ZSR.WORLD;

  const KEYS = { settings: "zs.settings", save: "zs.base" };
  const RESTOCK_DAYS = 3; // shelf items come back after this many days; caches never do

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

  function freshSave() {
    const rooms = {};
    Object.keys(W().BASE_ROOMS).forEach((k) => (rooms[k] = 0));
    return {
      version: 2,
      day: 1,
      scrap: 0,
      food: W().SETTINGS.startFood,
      inventory: {},
      rooms,
      upgrades: { armor: 0, engine: 0, bumper: 0, paint: 0, damage: 0, fireRate: 0, spread: 0 },
      vanHp: 100,
      known: W().LOCATIONS.filter((l) => l.known).map((l) => l.id),
      loc: {}, // per location: { taken: {spot: dayTaken}, cacheOpened, cacheTaken: {spot: true}, visits }
      backpack: [], // [{ noteId, locId, found, day }]
      stats: { trips: 0, walkers: 0, notesRead: 0, wordsRead: 0, items: 0 },
      best: { days: 1, baseLevel: 0 },
      savedAt: Date.now(),
    };
  }

  const State = {
    settings: read(KEYS.settings, DEFAULT_SETTINGS),
    save: null, // committed base save (loaded or new)
    trip: null, // in-memory: { at, vanHp, footHp, cargo, loc overlay, backpack additions, revived, visited }

    saveSettings() {
      write(KEYS.settings, this.settings);
    },

    hasSave() {
      return !!read(KEYS.save, { _none: true }).version;
    },
    loadSave() {
      const s = read(KEYS.save, {});
      if (!s.version) return null;
      this.save = s;
      this.trip = null;
      return s;
    },
    newGame() {
      this.save = freshSave();
      this.trip = null;
      this.commit();
      return this.save;
    },
    /** Write the base save. Only called while at the base. */
    commit() {
      if (!this.save) return;
      this.save.savedAt = Date.now();
      this.save.best.days = Math.max(this.save.best.days, this.save.day);
      this.save.best.baseLevel = Math.max(this.save.best.baseLevel, this.baseLevel());
      write(KEYS.save, this.save);
    },
    wipe() {
      write(KEYS.save, null);
      this.save = null;
      this.trip = null;
    },

    baseLevel() {
      return Object.values(this.save.rooms).reduce((a, b) => a + b, 0);
    },

    /* ---------- Derived effects of the base rooms ---------- */
    effects() {
      const fx = { vanHp: 0, footHp: 0, tierCap: 2, freeRepair: false, showDanger: false, crates: 0, headlights: false, footRegen: 0, fullHealOnEntry: false, foodPerDay: 0, reveal: 0, showStock: false, footDamage: 1, revive: 0, vanDamage: 1, notesShowStock: false, mapShowsCaches: false, mapShowsStock: false };
      Object.entries(this.save.rooms).forEach(([room, lvl]) => {
        for (let i = 0; i < lvl; i++) {
          const e = W().BASE_ROOMS[room].levels[i].effect;
          Object.entries(e).forEach(([k, v]) => {
            if (typeof v === "number" && k !== "footDamage" && k !== "vanDamage") fx[k] = Math.max(fx[k], v);
            else if (typeof v === "number") fx[k] = Math.min(fx[k], v);
            else fx[k] = v;
          });
        }
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
        hungry,
        vanMaxHp: maxHp,
        vanHp: Math.min(s.vanHp, maxHp),
        footHp: this.footMaxHp(),
        cargo: {},
        scrap: 0, // scrap earned this trip (added to the save on return)
        loc: {}, // overlay of location changes made this trip
        notes: [], // notes read this trip (added to the backpack on return)
        revealed: [], // locations revealed this trip
        revived: false,
        visited: [],
        walkers: 0,
        wordsRead: 0,
        items: 0,
      };
      return this.trip;
    },
    /** Location state as seen right now: committed save plus this trip's overlay. */
    locState(id) {
      const base = this.save.loc[id] || { taken: {}, cacheOpened: false, cacheTaken: {}, visits: 0 };
      const over = (this.trip && this.trip.loc[id]) || { taken: {}, cacheTaken: {}, cacheOpened: false, visits: 0 };
      return {
        taken: Object.assign({}, base.taken, over.taken),
        cacheOpened: base.cacheOpened || over.cacheOpened,
        cacheTaken: Object.assign({}, base.cacheTaken, over.cacheTaken),
        visits: (base.visits || 0) + (over.visits || 0),
      };
    },
    tripLoc(id) {
      if (!this.trip.loc[id]) this.trip.loc[id] = { taken: {}, cacheTaken: {}, cacheOpened: false, visits: 0 };
      return this.trip.loc[id];
    },
    itemAvailable(id, spot) {
      const st = this.locState(id);
      const when = st.taken[spot];
      return when == null || this.save.day - when >= RESTOCK_DAYS;
    },
    takeItem(id, spot, fromCache) {
      const tl = this.tripLoc(id);
      if (fromCache) tl.cacheTaken[spot] = true;
      else tl.taken[spot] = this.save.day;
      this.trip.items += 1;
    },
    noteRead(noteId) {
      return this.save.backpack.some((n) => n.noteId === noteId) || this.trip.notes.some((n) => n.noteId === noteId);
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
          base.visits += over.visits || 0;
        });
        t.notes.forEach((n) => {
          if (!s.backpack.some((x) => x.noteId === n.noteId)) s.backpack.push(n);
        });
        t.revealed.forEach((id) => {
          if (!s.known.includes(id)) s.known.push(id);
        });
        s.vanHp = Math.max(1, Math.round(t.vanHp));
        s.stats.trips += 1;
        s.stats.walkers += t.walkers;
        s.stats.notesRead += t.notes.length;
        s.stats.wordsRead += t.wordsRead;
        s.stats.items += t.items;
        // a day passes: the crew eats, the garden grows
        s.day += 1;
        s.food = Math.max(0, s.food - W().SETTINGS.foodPerTrip) + this.effects().foodPerDay;
      }
      this.trip = null;
      if (this.effects().freeRepair) s.vanHp = this.vanMaxHp();
      this.commit();
    },

    /** Death: throw the trip away. The save on disk is untouched. */
    abandonTrip() {
      this.trip = null;
      this.loadSave();
    },

    /* ---------- Base actions (each commits) ---------- */
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
      return { ok: !Object.keys(missing).length && !scrapShort, missing, scrapShort, def };
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
        unknown.slice(0, fx.reveal >= 99 ? unknown.length : Math.max(0, fx.reveal - (this.save.known.length - 4))).forEach((l) => this.save.known.push(l.id));
      }
      this.commit();
      return true;
    },
    repairVan() {
      const max = this.vanMaxHp();
      if (this.save.vanHp >= max) return false;
      if (!this.effects().freeRepair) {
        if (this.save.scrap < ZSR.Upgrades.REPAIR.cost) return false;
        this.save.scrap -= ZSR.Upgrades.REPAIR.cost;
        this.save.vanHp = Math.min(max, this.save.vanHp + ZSR.Upgrades.REPAIR.heal);
      } else this.save.vanHp = max;
      this.commit();
      return true;
    },

    RESTOCK_DAYS,
  };

  /* ---------- Text at the current reading level, with a safe fallback ---------- */
  ZSR.text = function text() {
    const T = ZSR.TEXT || {};
    const want = State.settings.level;
    if (T[want]) return T[want];
    const avail = Object.keys(T).map(Number).sort((a, b) => Math.abs(a - want) - Math.abs(b - want));
    return avail.length ? T[avail[0]] : null;
  };
  /** Note text at the current level; falls back to the facts so the game never shows nothing. */
  ZSR.noteText = function noteText(locId, noteId) {
    const t = ZSR.text();
    const L = t && t.locations && t.locations[locId];
    const N = ZSR.WORLD.NOTES[locId];
    const isDoor = N && N.door.id === noteId;
    const entry = L && (isDoor ? L.door : L.notes && L.notes[noteId]);
    if (entry && entry.text) return { title: entry.title || "Note", text: entry.text };
    const facts = isDoor ? N.door.facts : (N.notes.find((n) => n.id === noteId) || {}).facts || [];
    return { title: isDoor ? "At the door" : "A note", text: facts.join(" ") };
  };

  ZSR.State = State;
})(typeof globalThis !== "undefined" ? globalThis : this);
