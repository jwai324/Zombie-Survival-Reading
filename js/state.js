/* State: settings, labeled save slots (one base save per player), and the in-memory trip.
   A base save is written only at the base. A trip (everything since you left) lives in
   memory and is lost on death or refresh, by design. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const W = () => ZSR.WORLD;

  // settings: the shared fallback (no save chosen yet, or a slot from before settings were per save);
  // slotSettings: each save slot's own reading level, text size, sound and the rest
  // readLog: each save slot's reading check log (js/readcheck.js), written apart from the save the moment a note
  // closes, so a trip lost to a death still counts; readCheck: the owner's PIN (hashed) and speed limit, all saves
  const KEYS = { settings: "zs.settings", slotSettings: (id) => "zs.settings." + id, slots: "zs.slots", legacy: "zs.base", slot: (id) => "zs.save." + id, readLog: (id) => "zs.readlog." + id, readCheck: "zs.readcheck" };
  // SCALE: the newest READ_LOG_MAX timed notes are kept per save (about 150 bytes each in localStorage)
  const READ_LOG_MAX = 600;

  const DEFAULT_SETTINGS = {
    level: 3, // reading level 1..6
    textSize: "normal", // normal | large | huge
    sound: true,
    aimAssist: true,
    shake: true,
    mouseSens: 1,
    seenHowto: false,
    tutorial: null, // the first-run tutorial's done ids (js/tutorial.js); null = none. A primitive: read() merges shallowly
    universe: "off", // the crossover storyline on top of the base story: "off" or a WORLD.UNIVERSES key (js/xoverstate.js)
  };

  function read(key, fallback) {
    try {
      const raw = root.localStorage && root.localStorage.getItem(key);
      return raw ? Object.assign({}, fallback, JSON.parse(raw)) : Object.assign({}, fallback);
    } catch (e) {
      return Object.assign({}, fallback);
    }
  }
  function has(key) {
    try {
      return !!(root.localStorage && root.localStorage.getItem(key));
    } catch (e) {
      return false;
    }
  }
  function write(key, value) {
    if (State.god) return; // god mode (js/god.js): nothing reaches the disk, not even settings
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
  /* The explored map of a building: one bit per tile, kept as "<w>x<h>:" + base64 (about 230
     characters for the biggest building). Plain base64 by hand: no atob/btoa needed. */
  const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function toB64(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 3) {
      const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0);
      s += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + (i + 1 < bytes.length ? B64[(n >> 6) & 63] : "") + (i + 2 < bytes.length ? B64[n & 63] : "");
    }
    return s;
  }
  function fromB64(s, len) {
    const out = new Uint8Array(len);
    let acc = 0;
    let bits = 0;
    let o = 0;
    for (let i = 0; i < s.length && o < len; i++) {
      const v = B64.indexOf(s[i]);
      if (v < 0) continue;
      acc = ((acc << 6) | v) & 0xffffff;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out[o++] = (acc >> bits) & 255;
      }
    }
    return out;
  }
  /** "<w>x<h>:..." -> { dims, bytes } or null. */
  function seenBytes(str) {
    if (typeof str !== "string") return null;
    const c = str.indexOf(":");
    const m = /^(\d+)x(\d+)$/.exec(str.slice(0, c));
    if (c < 0 || !m) return null;
    return { dims: str.slice(0, c), bytes: fromB64(str.slice(c + 1), Math.ceil((m[1] * m[2]) / 8)) };
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
      // paint: the look the van wears (js/upgrades.js PAINT_LOOKS index); paintOwned: the looks bought (paintLists)
      upgrades: { armor: 0, engine: 0, bumper: 0, paint: 0, paintOwned: [0], damage: 0, fireRate: 0, spread: 0 },
      weapons: ZSR.Weapons.fresh(W().LOCATIONS), // { owned, equipped, mods: {id: {damage, range, rate, aim}}, where: {id: locId}, seed }
      vanHp: 100,
      known: W().LOCATIONS.filter((l) => l.known).map((l) => l.id),
      loc: {}, // per location: { taken: {spot: dayTaken}, cacheOpened, cacheTaken: {spot: true}, visits }
      backpack: [], // [{ noteId, locId, found, day }]
      keys: {}, // stash keys found: { [locId where it was found]: { day, broken } }; KEYS says which stash each opens
      lockSeed: Math.floor(Math.random() * 2147483646) + 1, // this save's codes, moves and hiding places (js/locks.js)
      crowbars: 0, // crowbars built at the workbench: each pries open one jammed lock
      tagsSeen: [], // item keys whose tags have been read (kept in the backpack)
      log: [], // one entry per day at home: { day, journal, radio, recap }; the words come from the reading level
      radioHeard: 0, // broadcasts heard so far (the next one plays the day after)
      kits: 0, // medical kits packed in the backpack (heal to full)
      fence: {}, // "x,y" -> health; 0 is a hole. Holes never close on their own.
      traps, // crafted traps in stock, by type
      yardTraps: [], // traps set in the yard: [{ x, y, type, uses }]
      yardV: (W().YARD && W().YARD.version) || 1, // the yard grid the fence keys and trap spots belong to
      house: { doors: 0, windows: 0, hp: {} }, // the cabin: door and window levels, and each one's strength ("x,y" in the yard; 0 is broken)
      // a yard plot's build (WORLD.YARD.plots, keyed by room id: never rename a room): room -> health left; missing =
      // whole, 0 = wrecked (no room bonus until fixed; js/yardwreck.js). The Walls have no plot, so never a key here
      builds: {},
      houseRead: [], // notes on the cabin's walls already read (their words counted once)
      typing: { stage: 0, passes: 0, rounds: 0, tutorialSeen: false, v: 2 }, // the workbench typing game: stage, good rounds at it
      rod: false, // Chief Dunn's fishing pole, once it is home (found in Station 12's equipment bay)
      riverRest: null, // the day River Landing was fished out (WORLD.RIVER.cap fish on one trip); it rests restockDays
      labAcc: 0, // partial medical kits brewing in the Lab
      crew: State.crewFresh ? State.crewFresh() : null, // June, Tomas and Pip: trust, talk, requests, the dog (js/crewstate.js)
      xover: State.xoverFresh ? State.xoverFresh() : null, // each crossover universe's progress, and the robot dog (js/xoverstate.js)
      stats: { trips: 0, walkers: 0, notesRead: 0, wordsRead: 0, items: 0 },
      met: {}, // walker kinds met: { [WALKER_TYPES id]: the day one was first seen or hurt } (the crew's told-once tips)
      wave: 0, // waves survived during this stay at the base (escalation)
      best: { days: 1, baseLevel: 0 },
      savedAt: Date.now(),
    };
  }
  const BUILD_CRACKED = 0.5; // a yard build under this share of its strength is cracked: it still works, it shows cracks
  /** A room's build strength at its built level in save `s` (DEFENSE.buildHp; the last entry past its end), 0 for a
      room with no yard plot (the Walls) or not built yet. */
  function buildMaxOf(s, room) {
    const Y = W().YARD;
    const lvl = (s && s.rooms && s.rooms[room]) || 0;
    if (!(lvl > 0) || !Y || !Y.plots || !Y.plots[room]) return 0;
    const hp = W().DEFENSE.buildHp || [];
    return hp[Math.min(lvl, hp.length - 1)] || 0;
  }
  /** The paint shop's two fields of an upgrades object `u`, made sound (js/upgrades.js PAINT_LOOKS; u is not changed):
      { worn, owned }. worn: u.paint as a whole look index, past the last look the last one. owned: u.paintOwned's look
      indexes (anything that is not a look dropped), with Primer Gray (0) and the worn look, once each, in order.
      `ladder`: a save from before the paint shop (no paintOwned) climbed the paint ladder, so at paint k it bought every
      look up to k: it owns 0 .. k. */
  function paintLists(u, ladder) {
    const n = ZSR.Upgrades.PAINT_LOOKS.length;
    const p = Math.floor(Number(u && u.paint));
    const worn = p > 0 ? Math.min(p, n - 1) : 0;
    const list = u && Array.isArray(u.paintOwned) ? u.paintOwned : [];
    const have = new Set([0, worn]);
    if (ladder && !(u && Array.isArray(u.paintOwned))) for (let i = 1; i < worn; i++) have.add(i);
    list.forEach((i) => Number.isInteger(i) && i >= 0 && i < n && have.add(i));
    return { worn, owned: [...have].sort((a, b) => a - b) };
  }
  /** Fill in anything an older save lacks, so every field the game reads exists.
   *  SCALE: this only fills missing fields. As the city grows, old saves never learn of new places: `known` is
   *  not replayed from notes already read or from a Radio room already built. Add that here, behind a version
   *  bump, when new places ship (docs/SCALING.md, "Old saves must keep working"). */
  function upgradeSave(s) {
    ZSR.Weapons.upgradeSave(s, W().LOCATIONS); // before the fill-in below, so an old pistol keeps its gun upgrades
    const fresh = freshSave(s.label);
    // a save from an older yard grid: its fence keys and trap spots point at the wrong tiles, so the
    // fence comes back whole and every set trap goes back into stock (checked before the fill-in below)
    if ((s.yardV || 1) !== fresh.yardV) {
      s.fence = {};
      s.traps = s.traps || {};
      (s.yardTraps || []).forEach((t) => {
        if (t && t.type) s.traps[t.type] = (s.traps[t.type] || 0) + 1;
      });
      s.yardTraps = [];
      if (s.house) s.house.hp = {};
      s.yardV = fresh.yardV;
    }
    // a save from the old, fast typing stages (one round each): the stage maps onto the slower ones
    if (s.typing && s.typing.v !== fresh.typing.v) {
      s.typing.stage = ZSR.Typing && ZSR.Typing.migrate ? ZSR.Typing.migrate(s.typing.stage) : 0;
      s.typing.passes = 0;
      s.typing.v = fresh.typing.v;
    }
    // food crates used to land in storage, where the crew never ate them: they feed the crew now
    if (s.inventory && s.inventory.food > 0) {
      s.food = (s.food || 0) + s.inventory.food;
      delete s.inventory.food;
    }
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
    Object.keys(fresh.house).forEach((k) => {
      if (s.house[k] == null) s.house[k] = fresh.house[k];
    });
    // the van's upgrades: every key a fresh save has (an upgrade added later starts at 0), then the paint shop's two
    // fields (an old save's paint ladder becomes the looks it bought, and it keeps wearing its top one)
    if (!s.upgrades || typeof s.upgrades !== "object" || Array.isArray(s.upgrades)) s.upgrades = {};
    const paint = paintLists(s.upgrades, true);
    Object.keys(fresh.upgrades).forEach((k) => {
      if (s.upgrades[k] == null) s.upgrades[k] = fresh.upgrades[k];
    });
    s.upgrades.paint = paint.worn;
    s.upgrades.paintOwned = paint.owned;
    if (State.crewUpgrade) State.crewUpgrade(s); // the crew's fields, one per crew member (a member added later too)
    if (State.xoverUpgrade) State.xoverUpgrade(s); // the crossover universes' progress (a universe added later too)
    // the builds' health: only built rooms with a plot, a finite number from 0 up to that level's strength
    if (!s.builds || typeof s.builds !== "object" || Array.isArray(s.builds)) s.builds = {};
    Object.keys(s.builds).forEach((room) => {
      const max = buildMaxOf(s, room);
      const v = s.builds[room];
      if (!max || typeof v !== "number" || !isFinite(v) || v < 0) delete s.builds[room];
      else if (v >= max) delete s.builds[room]; // whole: no key
    });
    // where a note was found comes from the facts: a note that has moved since it was read says where it is now
    (Array.isArray(s.backpack) ? s.backpack : []).forEach((n) => {
      const N = n && W().NOTES[n.locId];
      const note = N && (N.door.id === n.noteId ? N.door : (N.notes || []).find((x) => x.id === n.noteId));
      if (note && note.found) n.found = note.found;
    });
    s.version = 3;
    return s;
  }

  const State = {
    settings: null, // the active slot's settings (set below, and again whenever the active slot changes)
    save: null, // committed base save (loaded or new)
    trip: null, // in-memory: { at, vanHp, footHp, cargo, loc overlay, backpack additions, revived, visited, rooms }
    // god mode, the owner's test sandbox (js/god.js): null, or { base, cheats, offer, onCommit }. While it is on,
    // write() does nothing, commit() keeps `base` (a copy of the save) in memory in place of the disk, and
    // loadSave() with no slot (a death, a reload) goes back to `base`. godEnd() reloads the real save from disk.
    god: null,

    /** Start god mode on a copy of the current save, or on a fresh one (fresh, or no save is loaded). */
    godStart(fresh) {
      const s = !fresh && this.save ? clone(this.save) : null;
      this.god = { base: null, cheats: {}, offer: {}, onCommit: null };
      this.trip = null;
      this.save = s || freshSave("God mode");
      if (!s) this.logDay(null); // Day 1 in June's journal, as newGame writes it
      this.god.base = clone(this.save);
      return this.save;
    },
    /** Leave god mode: the sandbox is dropped and the real save and settings come back from disk. */
    godEnd() {
      if (!this.god) return;
      this.god = null;
      this.save = null;
      this.trip = null;
      this.settings = this.settingsFor(this.activeSlot());
      this.loadSave();
    },
    /** Is this god mode cheat on? (false outside god mode) */
    cheat(name) {
      return !!(this.god && this.god.cheats[name]);
    },

    /** A slot's own settings. A slot from before settings were per save starts from the shared ones. */
    settingsFor(id) {
      return id && has(KEYS.slotSettings(id)) ? read(KEYS.slotSettings(id), DEFAULT_SETTINGS) : read(KEYS.settings, DEFAULT_SETTINGS);
    },
    /** Writes to the active slot's settings, or the shared ones when no save is chosen. */
    saveSettings() {
      const sid = this.activeSlot();
      write(sid ? KEYS.slotSettings(sid) : KEYS.settings, this.settings);
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
        out.push({ id, label: meta ? meta.label : null, save: s.version ? s : null, active: idx.active === id, settings: meta ? this.settingsFor(id) : null });
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
      this.settings = this.settingsFor(id);
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
      if (this.god && !id) {
        this.save = clone(this.god.base);
        this.trip = null;
        return this.save;
      }
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
      write(KEYS.readLog(sid), null); // a new player starts a new reading check log
      // a new save starts from the settings on screen, and shows its new player the how-to and the tutorial
      this.settings = Object.assign({}, this.settings, { seenHowto: false, tutorial: null });
      this.saveSettings();
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
      write(KEYS.slotSettings(id), null);
      write(KEYS.readLog(id), null);
      if (wasActive) idx.active = null;
      write(KEYS.slots, idx);
      if (wasActive) {
        this.save = null;
        this.trip = null;
        this.settings = this.settingsFor(null);
      }
    },
    /** Write the base save. Only called while at the base. */
    commit() {
      if (!this.save) return;
      const sid = this.activeSlot();
      if (!sid && !this.god) return;
      this.save.savedAt = Date.now();
      this.save.best.days = Math.max(this.save.best.days, this.save.day);
      this.save.best.baseLevel = Math.max(this.save.best.baseLevel, this.baseLevel());
      if (this.god) {
        if (this.god.onCommit) this.god.onCommit(this.save); // the "unlimited" top-up
        this.god.base = clone(this.save);
        return;
      }
      write(KEYS.slot(sid), this.save);
    },
    /* ---------- The reading check (js/readcheck.js) ---------- */
    /** A save slot's timed notes, oldest first: { at, kind, id, title, place, words, ms, level, day, again }. */
    readLog(id) {
      return id ? read(KEYS.readLog(id), { list: [] }).list || [] : [];
    },
    /** One timed note for the active save, written now. Nothing is kept in god mode or with no save chosen. */
    logReading(entry) {
      const sid = this.activeSlot();
      if (!sid || this.god) return false;
      const list = this.readLog(sid);
      list.push(entry);
      write(KEYS.readLog(sid), { list: list.slice(-READ_LOG_MAX) });
      return true;
    },
    clearReadLog(id) {
      write(KEYS.readLog(id), null);
    },
    /** { pinHash: null until the owner sets a PIN, wpm: the "too fast" line, or null for the default }. */
    readCheckConfig() {
      return read(KEYS.readCheck, { pinHash: null, wpm: null });
    },
    saveReadCheckConfig(c) {
      write(KEYS.readCheck, c);
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
      // SCALE: assumes 3 levels per room (also Math.min(level, 3) in the room effects, js/base.js and the tests)
      return Object.keys(W().BASE_ROOMS).length * 3;
    },

    /* ---------- The yard's builds: their strength, and wrecked ones (js/yardwreck.js) ----------
       A room with a yard plot puts up a build (js/yard.js). Wreckers in a wave claw it down; a wrecked build (save
       builds[room] 0) gives no room bonus until it is fixed. Construction, requirements, story gates and the art
       keep the built level (save.rooms); every bonus goes through effects(), which skips a wrecked room, and the
       few direct readers of a bonus use roomLevel(). */
    /** The build's full strength at its built level (DEFENSE.buildHp), 0 with no plot (the Walls) or not built. */
    buildMax(room) {
      return buildMaxOf(this.save, room);
    },
    /** Its strength now: save.builds[room], or whole when it has no entry; 0 when there is no build. */
    buildHp(room) {
      const max = this.buildMax(room);
      if (!max) return 0;
      const v = (this.save.builds || {})[room];
      return v == null ? max : Math.max(0, Math.min(max, v));
    },
    /** Built, with a plot, and clawed down to 0: it gives nothing until fixed. */
    roomWrecked(room) {
      const v = (this.save.builds || {})[room];
      return v != null && v <= 0 && this.buildMax(room) > 0;
    },
    /** The level that gives a bonus: 0 while wrecked, else the built level. */
    roomLevel(room) {
      return this.roomWrecked(room) ? 0 : this.save.rooms[room] || 0;
    },
    /** The wrecked rooms, in WORLD.BASE_ROOMS order. */
    wreckedRooms() {
      return Object.keys(W().BASE_ROOMS).filter((room) => this.roomWrecked(room));
    },
    /** 0 whole (or not built, or no plot), 1 cracked (under BUILD_CRACKED of its strength), 2 wrecked. */
    buildDmg(room) {
      const max = this.buildMax(room);
      if (!max) return 0;
      const hp = this.buildHp(room);
      return hp <= 0 ? 2 : hp < max * BUILD_CRACKED ? 1 : 0;
    },
    /** { wrecked: [rooms], cracked: [rooms] } (the computer's row, the crew's tips, the toasts), in WORLD.BASE_ROOMS
        order like wreckedRooms, so every list of them reads the same. */
    buildDamage() {
      const out = { wrecked: [], cracked: [] };
      Object.keys(W().BASE_ROOMS).forEach((room) => {
        const d = this.buildDmg(room);
        if (d === 2) out.wrecked.push(room);
        else if (d === 1) out.cracked.push(room);
      });
      return out;
    },
    /** The office computer's "Fix all" for damage `dmg` ({ wrecked, cracked }; the save's when left out): every
        wrecked, then every cracked build (rooms, a room in both lists once), at SETTINGS.buildRepairScrap each (each),
        and the scrap for them all (cost). The one rule for the computer's button, what it fixes
        (js/yardwreck.js repairAllBuilds) and Tomas's wrecked tip ({cost}, js/crewstate.js). */
    buildFixAll(dmg) {
      const d = dmg || this.buildDamage();
      const rooms = d.wrecked.concat(d.cracked.filter((room) => !d.wrecked.includes(room)));
      const each = W().SETTINGS.buildRepairScrap || 0;
      return { rooms, each, cost: rooms.length * each };
    },

    /* ---------- Derived effects of the base rooms ---------- */
    /** What the built rooms give (a wrecked build gives nothing until it is fixed), plus the crew's perks. */
    effects() {
      const fx = { vanHp: 0, footHp: 0, tierCap: 2, freeRepair: false, showDanger: false, crates: 0, headlights: false, footRegen: 0, fullHealOnEntry: false, foodPerDay: 0, medsPerDay: 0, water: 0, reveal: 0, showStock: false, footDamage: 1, revive: 0, vanDamage: 1, notesShowStock: false, mapShowsCaches: false, mapShowsStock: false };
      const ADD = { foodPerDay: true, medsPerDay: true, footRegen: true }; // these stack across rooms (the Well heals on top of the Water room); everything else takes the best level
      Object.entries(this.save.rooms).forEach(([room, lvl]) => {
        if (this.roomWrecked(room)) return;
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
      // the crew's perks from story quests handed in add on top (js/crewstate.js)
      if (this.crewFx && this.save.crew) {
        const c = this.crewFx();
        ["foodPerDay", "medsPerDay", "footHp", "vanHp"].forEach((k) => (fx[k] += c[k] || 0));
      }
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
        rod: false, // the fishing pole, picked up this trip (yours once you get home)
        fish: 0, // fish caught at River Landing this trip (each one is a food in the cargo)
        brokenKeys: [], // stash keys snapped off in a wrong lock this trip (gone once you get home)
        crowbarsUsed: 0, // crowbars spent on jammed locks this trip
        tags: [], // item tags read this trip
        signs: [], // wall signs read this trip (counted once for words read)
        quest: [], // story quest objects picked up this trip (found once you get home; js/crewstate.js)
        dog: false, // the dog follows you this trip (Pip's quest; home with you, lost if you die)
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
        cacheJammed: !!(base.cacheJammed || over.cacheJammed), // a lock gone wrong: a crowbar opens it
        stashJammed: !!(base.stashJammed || over.stashJammed),
        alarmOff: !!(base.alarmOff || over.alarmOff), // the alarm panel turned off the right way
        cacheKey: !!(base.cacheKey || over.cacheKey), // what the search found (the key or badge to the cache door)
        visits: (base.visits || 0) + (over.visits || 0),
        seen: this.mergeSeen(base.seen, over.seen), // the explored map (packSeen), saved plus this trip
      };
    },
    /* ---------- Explored map of a building (the M map) ---------- */
    /** Pack a Uint8Array of gw * gh tiles (non-zero = seen) into the compact string kept in the save. */
    packSeen(tiles, gw, gh) {
      const n = gw * gh;
      const bytes = new Uint8Array(Math.ceil(n / 8));
      for (let i = 0; i < n; i++) if (tiles[i]) bytes[i >> 3] |= 1 << (i & 7);
      return gw + "x" + gh + ":" + toB64(bytes);
    },
    /** The tiles of a packed map as a Uint8Array of 0 / 1, or null when there is none or it was
        packed for a layout of another size (a changed building starts unexplored). */
    unpackSeen(str, gw, gh) {
      const s = seenBytes(str);
      if (!s || s.dims !== gw + "x" + gh) return null;
      const out = new Uint8Array(gw * gh);
      for (let i = 0; i < out.length; i++) out[i] = (s.bytes[i >> 3] >> (i & 7)) & 1;
      return out;
    },
    /** Both explored maps together (the later one alone if their sizes differ). */
    mergeSeen(a, b) {
      const sa = seenBytes(a);
      const sb = seenBytes(b);
      if (!sb) return sa ? a : undefined;
      if (!sa || sa.dims !== sb.dims) return b;
      for (let i = 0; i < sb.bytes.length; i++) sb.bytes[i] |= sa.bytes[i];
      return sb.dims + ":" + toB64(sb.bytes);
    },
    tripLoc(id) {
      if (!this.trip.loc[id]) this.trip.loc[id] = { taken: {}, cacheTaken: {}, cacheOpened: false, stashTaken: {}, stashOpened: false, cacheJammed: false, stashJammed: false, alarmOff: false, cacheKey: false, visits: 0 };
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
      return !!from && this.hasKeyFrom(from) && !this.keyBroken(from);
    },
    /** The key found at `fromId` snapped off in a wrong lock (saved, or this trip). */
    keyBroken(fromId) {
      return !!(this.save.keys && this.save.keys[fromId] && this.save.keys[fromId].broken) || (!!this.trip && (this.trip.brokenKeys || []).includes(fromId));
    },
    breakKey(fromId) {
      if (this.trip) {
        if (!this.trip.brokenKeys.includes(fromId)) this.trip.brokenKeys.push(fromId);
      } else if (this.save.keys[fromId]) this.save.keys[fromId].broken = true;
    },
    takeKey(fromId) {
      if (this.hasKeyFrom(fromId)) return false;
      if (this.trip) this.trip.keys.push(fromId);
      else this.save.keys[fromId] = { day: this.save.day };
      return true;
    },
    /** Keys held right now: [{ from, opens, day, trip, broken }]. */
    keysHeld() {
      const out = Object.entries(this.save.keys || {}).map(([from, k]) => ({ from, opens: W().KEYS[from], day: k.day, trip: false, broken: this.keyBroken(from) }));
      ((this.trip && this.trip.keys) || []).forEach((from) => out.push({ from, opens: W().KEYS[from], day: this.save.day, trip: true, broken: this.keyBroken(from) }));
      return out;
    },

    /* ---------- Crowbars (WORLD.TOOLS): built at home, spent on jammed locks ---------- */
    crowbarsLeft() {
      return Math.max(0, (this.save.crowbars || 0) - ((this.trip && this.trip.crowbarsUsed) || 0));
    },
    useCrowbar() {
      if (this.crowbarsLeft() < 1) return false;
      if (this.trip) this.trip.crowbarsUsed += 1;
      else this.save.crowbars -= 1;
      return true;
    },
    canCraftTool(type) {
      const def = W().TOOLS[type];
      const missing = {};
      Object.entries(def.needs).forEach(([k, n]) => {
        const have = this.save.inventory[k] || 0;
        if (have < n) missing[k] = n - have;
      });
      // scrap: what it costs now (a crew perk can make a crowbar cheaper)
      const perk = type === "crowbar" && this.crewFx ? this.crewFx().crowbarCost : null;
      const scrap = perk != null ? Math.min(def.scrap, perk) : def.scrap;
      const scrapShort = Math.max(0, scrap - this.save.scrap);
      return { ok: !Object.keys(missing).length && !scrapShort, missing, scrapShort, scrap, def, requires: [], locked: [] };
    },
    craftTool(type) {
      const c = this.canCraftTool(type);
      if (!c.ok) return false;
      Object.entries(c.def.needs).forEach(([k, n]) => (this.save.inventory[k] -= n));
      this.save.scrap -= c.scrap;
      if (type === "crowbar") this.save.crowbars = (this.save.crowbars || 0) + 1;
      this.commit();
      return true;
    },

    /* ---------- Walker kinds met ---------- */
    /** A walker kind seen (or hurt) for the first time: save.met[type] = today. True the first time. Out on a trip
        it rides on the save in memory, kept by returnHome's commit and dropped with a dead trip (abandonTrip). */
    meetWalker(type) {
      const s = this.save;
      if (!s || !W().WALKER_TYPES[type]) return false;
      const met = (s.met = s.met || {});
      if (met[type] != null) return false;
      met[type] = s.day;
      return true;
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
      // a bare corner (a junction) is known once two of the places its roads lead to are
      if (W().isJunction && W().isJunction(id)) return ZSR.Streets ? ZSR.Streets.neighbors(id).filter((n) => this.isKnown(n)).length >= 2 : false;
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
        // food (crates and fish) goes to the crew's food; everything else into storage
        Object.entries(t.cargo).forEach(([k, n]) => {
          if (k === "food") s.food = (s.food || 0) + n;
          else s.inventory[k] = (s.inventory[k] || 0) + n;
        });
        if (t.rod) s.rod = true;
        if ((t.fish || 0) >= W().RIVER.cap) s.riverRest = s.day; // fished out: the river rests
        s.scrap += t.scrap;
        Object.entries(t.loc).forEach(([id, over]) => {
          const base = (s.loc[id] = s.loc[id] || { taken: {}, cacheOpened: false, cacheTaken: {}, visits: 0 });
          Object.assign(base.taken, over.taken);
          Object.assign(base.cacheTaken, over.cacheTaken);
          base.cacheOpened = base.cacheOpened || over.cacheOpened;
          base.stashTaken = Object.assign(base.stashTaken || {}, over.stashTaken);
          base.stashOpened = !!(base.stashOpened || over.stashOpened);
          ["cacheJammed", "stashJammed", "alarmOff", "cacheKey"].forEach((k) => (base[k] = !!(base[k] || over[k])));
          base.visits += over.visits || 0;
          if (over.seen) base.seen = this.mergeSeen(base.seen, over.seen);
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
        (t.brokenKeys || []).forEach((from) => {
          if (s.keys[from]) s.keys[from].broken = true;
        });
        s.crowbars = Math.max(0, (s.crowbars || 0) - (t.crowbarsUsed || 0));
        (t.tags || []).forEach((item) => {
          if (!s.tagsSeen.includes(item)) s.tagsSeen.push(item);
        });
        // the crew: story objects and the dog brought home are found; an open errand counts its item's cargo
        const crewHome = this.crewTripHome ? this.crewTripHome(t) : [];
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
        if (this.crewDayPassed) this.crewDayPassed(); // late errands, the dog's food, the scrapPerDay perk
        // quests: story objects (and the dog) brought home, so a day with only one of those is not "nothing"
        const haul = { items: Object.values(t.cargo).reduce((a, b) => a + b, 0), scrap: t.scrap, notes: t.notes.length, keys: (t.keys || []).length };
        if (crewHome.length) haul.quests = crewHome.length;
        const entry = this.logDay(haul);
        // June's ledger line for each story quest handed in since the last day page (js/crewstate.js)
        const ledger = this.crewLedgerDrain ? this.crewLedgerDrain() : [];
        if (ledger.length) entry.quests = ledger;
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
      const loop = this.cycleLoop(len);
      return len - loop + ((n - len) % loop);
    },
    /** How many entries at the end of a list of len repeat (the last third). */
    cycleLoop(len) {
      return Math.max(1, Math.min(len, Math.floor(len / 3)));
    },
    /** June's page for day index n (cycleIndex). Once the dog is home (js/crewstate.js), a repeating page that
        wishes for a dog (JOURNAL dogWish: true) would read wrong, so the repeat goes round only the pages of the
        window that do not, in order, so no page is written two days running (if every page there wishes for a
        dog, the day's own page stays). Pages before the window are the one-time story: tests/validate-world.js
        keeps the dog away until the last page that mentions a dog is written, so none of them needs skipping;
        should one in the window's first pass still wish for a dog, the next page that does not takes its day. */
    journalIndex(n, J) {
      const i = this.cycleIndex(n, J.length);
      if (i == null || !(this.dogHome && this.dogHome())) return i;
      const loop = this.cycleLoop(J.length);
      const start = J.length - loop;
      if (i < start) return i;
      const keep = [];
      for (let k = 0; k < loop; k++) {
        const j = start + ((i - start + k) % loop); // from the day's own page on, round the window
        if (!(J[j] && J[j].dogWish)) keep.push(j);
      }
      if (!keep.length) return i;
      if (n < J.length) return keep[0]; // the first pass: the day's own page, or the next one that wishes for none
      keep.sort((a, b) => a - b);
      return keep[(n - J.length) % keep.length];
    },
    /** Write today's entry (called when a day passes, and on Day 1). `trip` is null on Day 1. */
    logDay(trip) {
      const s = this.save;
      const J = W().JOURNAL || [];
      const R = W().RADIO || [];
      const entry = { day: s.day, journal: this.journalIndex(s.day - 1, J), radio: null, recap: null };
      // a wrecked Radio tower hears nothing that day (roomLevel); the broadcasts keep their order (radioHeard)
      if (this.roomLevel("radio") > 0 && R.length) {
        entry.radio = this.cycleIndex(s.radioHeard || 0, R.length);
        entry.tuned = false; // heard when the player tunes in at the radio in the dining room (older saves: no field, heard)
        s.radioHeard = (s.radioHeard || 0) + 1;
      }
      if (trip) entry.recap = Object.assign({ food: s.food, hungry: s.food <= 0, next: this.nextBuild() }, trip);
      if (this.xoverLog) this.xoverLog(entry); // with a universe on, its next ledger line and broadcast (js/xoverstate.js)
      s.log.push(entry);
      if (s.log.length > 120) s.log.splice(0, s.log.length - 120);
      return entry;
    },
    /** Today's broadcast, still waiting at the radio: the newest day's, not yet tuned in to (an older day's
        missed broadcast just shows with its day). The entry, or null. */
    radioWaiting() {
      const log = (this.save && this.save.log) || [];
      const e = log[log.length - 1];
      return e && e.radio != null && e.tuned === false ? e : null;
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
      return true; // the caller saves (js/backpack.js: the yard's sync, which never saves mid-wave)
    },
    unpackKit() {
      if (this.trip || !(this.save.kits > 0)) return false;
      this.save.kits -= 1;
      this.save.inventory.meds = (this.save.inventory.meds || 0) + 1;
      return true; // the caller saves, as packKit
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
      if (this.save.builds) delete this.save.builds[room]; // the new level goes up whole (a wrecked one is rebuilt)
      if (room === "walls") this.save.vanHp = Math.min(this.vanMaxHp(), this.save.vanHp + 30);
      if (room === "radio") {
        // SCALE: reveal 99 means every unknown building at once; with many more places, make the steps smaller
        const fx = this.effects();
        // buildings only: River Landing is found by reading the fishing pole's tag
        const unknown = W().LOCATIONS.filter((l) => !l.outdoor && !this.save.known.includes(l.id)).sort((a, b) => a.danger - b.danger);
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
    /** One upgrade's next tier: { ok, cost, capped, maxed, garageNeeded, level, garageWrecked }. Paint is a shop, not a
        ladder (paintShop below): for any caller that reads every upgrade alike, its next tier is the first look not
        owned yet, in PAINT_LOOKS order (`look`: its index; `level`: the one before it, so Upgrades.cost("paint",
        level) is its price), and it is maxed once every look is owned. */
    canBuyUpgrade(key) {
      if (key === "paint") {
        const shop = this.paintShop();
        const next = shop.find((p) => !p.owned);
        if (!next) return { ok: false, cost: null, capped: false, maxed: true, garageNeeded: 0, level: shop.length - 1, garageWrecked: this.roomWrecked("garage") };
        return { ok: next.ok, cost: next.cost, capped: next.capped, maxed: false, garageNeeded: next.garageNeeded, level: next.i - 1, garageWrecked: next.garageWrecked, look: next.i };
      }
      const d = ZSR.Upgrades.DEFS[key];
      const level = this.save.upgrades[key];
      const cost = ZSR.Upgrades.cost(key, level);
      const capFor = (tc) => Math.min(d.max, key === "spread" ? Math.max(1, tc - 2) : tc);
      const capped = level >= capFor(this.effects().tierCap);
      const garageLevels = W().BASE_ROOMS.garage.levels;
      const needIdx = garageLevels.findIndex((l) => capFor(l.effect.tierCap) > level);
      const garageNeeded = capped && cost != null ? (needIdx < 0 ? garageLevels.length : needIdx + 1) : 0;
      // garageWrecked: the Garage is built far enough but wrecked (it gives nothing until fixed), so the menu says so
      const garageWrecked = this.roomWrecked("garage");
      return { ok: cost != null && !capped && this.save.scrap >= cost, cost, capped, maxed: cost == null, garageNeeded, level, garageWrecked };
    },
    buyUpgrade(key) {
      const c = this.canBuyUpgrade(key);
      if (!c.ok) return false;
      if (key === "paint") return this.buyPaint(c.look); // the next look not owned, bought and worn
      this.save.scrap -= c.cost;
      this.save.upgrades[key] += 1;
      if (key === "armor") this.save.vanHp = Math.min(this.vanMaxHp(), this.save.vanHp + 30);
      this.commit();
      return true;
    },

    /* ---------- The van's paint shop (js/upgrades.js PAINT_LOOKS; the Garage tab, js/base.js) ----------
       Each look past Primer Gray is bought once, for its scrap and a typing round, when the Garage allows its tier
       (as canBuyUpgrade: tierCap is 2 with no Garage, 3 to 5 by its level, and a wrecked Garage gives nothing); then
       any look owned is worn at will, for free. save.upgrades.paint is the look worn, so every reader of
       Upgrades.stats(u).look and Van3D keeps working; save.upgrades.paintOwned the looks bought (paintLists). */
    /** The looks bought, in order (always Primer Gray and the look worn). */
    paintOwned() {
      return paintLists(this.save.upgrades).owned;
    },
    /** Every look, in PAINT_LOOKS order: { i, name, look (the PAINT_LOOKS row), owned, worn, cost, tier, ok (can be
        bought now), capped (the Garage is too low for its tier), garageNeeded (the Garage level that allows it, when
        capped), garageWrecked (the Garage is wrecked, as canBuyUpgrade says it: a capped look with the Garage built to
        garageNeeded waits only for the fix), short (scrap still missing, 0 when there is enough) }. Owned looks are
        never capped or short. */
    paintShop() {
      const looks = ZSR.Upgrades.PAINT_LOOKS;
      const { worn, owned } = paintLists(this.save.upgrades);
      const cap = this.effects().tierCap;
      const garageLevels = W().BASE_ROOMS.garage.levels;
      const garageWrecked = this.roomWrecked("garage");
      return looks.map((look, i) => {
        const have = owned.includes(i);
        const tier = look.tier || 0;
        const cost = look.cost || 0;
        const capped = !have && tier > cap;
        const needIdx = garageLevels.findIndex((l) => (l.effect.tierCap || 0) >= tier);
        const garageNeeded = capped ? (needIdx < 0 ? garageLevels.length : needIdx + 1) : 0;
        const short = have ? 0 : Math.max(0, cost - this.save.scrap);
        return { i, name: look.name, look, owned: have, worn: i === worn, cost, tier, ok: !have && !capped && !short, capped, garageNeeded, garageWrecked, short };
      });
    },
    /** Look i in the shop (paintShop's entry), or a look that cannot be bought for an index that is not a look. */
    canBuyPaint(i) {
      const p = Number.isInteger(i) ? this.paintShop()[i] : null;
      return p || { i, ok: false, owned: false, worn: false, cost: null, capped: false, garageNeeded: 0, garageWrecked: false, short: 0 };
    },
    /** Buy look i: its scrap is spent, it is owned, and the van wears it. */
    buyPaint(i) {
      const c = this.canBuyPaint(i);
      if (!c.ok) return false;
      const u = this.save.upgrades;
      this.save.scrap -= c.cost;
      u.paintOwned = paintLists({ paint: i, paintOwned: this.paintOwned().concat([i]) }).owned;
      u.paint = i;
      this.commit();
      return true;
    },
    /** Wear look i, one already owned (free). */
    wearPaint(i) {
      if (!Number.isInteger(i) || !this.paintOwned().includes(i)) return false;
      const u = this.save.upgrades;
      u.paintOwned = this.paintOwned();
      u.paint = i;
      this.commit();
      return true;
    },
    /** Scrap to fix the van at the cabin up to `to` health (default: back to full); 1 for every repairScrapPerHp, at
        least repairMinScrap, free with the Garage's freeRepair. */
    repairCost(to) {
      const max = this.vanMaxHp();
      const missing = Math.min(max, to == null ? max : to) - this.save.vanHp;
      if (missing <= 0) return 0;
      if (this.effects().freeRepair) return 0;
      return Math.max(W().SETTINGS.repairMinScrap, Math.ceil(missing / W().SETTINGS.repairScrapPerHp));
    },
    /** Fix the van at the cabin up to `to` health (default: full), paid from the saved scrap. */
    repairVan(to) {
      const max = this.vanMaxHp();
      const hp = Math.min(max, to == null ? max : to);
      if (this.save.vanHp >= hp) return false;
      const cost = this.repairCost(hp);
      if (this.save.scrap < cost) return false;
      this.save.scrap -= cost;
      this.save.vanHp = hp;
      this.commit();
      return true;
    },
    /** Field repair on a trip: the most a patch brings the van up to (SETTINGS.fieldRepairCap of the trip's
        ceiling, so a hungry trip patches to its lower ceiling), or 0 when there is no trip. */
    fieldRepairTarget() {
      const t = this.trip;
      return t ? Math.floor(t.vanMaxHp * W().SETTINGS.fieldRepairCap) : 0;
    },
    /** Scrap for a field repair up to `to` health (default and most: fieldRepairTarget): the home price for that
        health, times fieldRepairMult. The Garage's free repair is a home perk and does not apply. 0 when the van is
        already there. */
    fieldRepairCost(to) {
      const t = this.trip;
      const top = this.fieldRepairTarget();
      const missing = t ? Math.min(top, to == null ? top : to) - t.vanHp : 0;
      if (missing <= 0) return 0;
      const S = W().SETTINGS;
      return S.fieldRepairMult * Math.max(S.repairMinScrap, Math.ceil(missing / S.repairScrapPerHp));
    },
    /** Pay for a field repair up to `to` health (default: the cap), this trip's scrap first and then the saved
        scrap (the HUD shows them together). Not committed here: a trip is saved when it ends, and quitting mid-trip
        loses it all. */
    fieldRepairVan(to) {
      const t = this.trip;
      const top = this.fieldRepairTarget();
      const hp = Math.min(top, to == null ? top : to);
      const cost = this.fieldRepairCost(hp);
      if (!cost || t.scrap + this.save.scrap < cost) return false;
      const fromTrip = Math.min(t.scrap, cost);
      t.scrap -= fromTrip;
      this.save.scrap -= cost - fromTrip;
      t.vanHp = hp;
      return true; // saved with the rest of the trip at home, like the trip's scrap
    },
    /** What the repair slider offers, at the cabin or out on a trip (field): health from one above today's up to
        the top (full at the cabin, fieldRepairTarget on a trip), starting at the most the scrap on hand pays for
        (the top when even the least is too dear). cost(to) prices any stop on it. */
    repairRange(field) {
      const t = this.trip;
      const hp = field ? t.vanHp : this.save.vanHp;
      const max = field ? this.fieldRepairTarget() : this.vanMaxHp();
      const cost = (to) => (field ? this.fieldRepairCost(to) : this.repairCost(to));
      const scrap = this.save.scrap + (field ? t.scrap : 0);
      const min = Math.min(max, Math.floor(hp) + 1);
      let value = max;
      while (value > min && cost(value) > scrap) value--;
      if (cost(value) > scrap) value = max;
      return { hp, min, max, value, cost, scrap };
    },
    /* ---------- The cabin's doors and windows (WORLD.HOUSE_UPGRADES) ---------- */
    /** Strength of one door or window at today's level ("doors" | "windows"). */
    houseMax(key) {
      const U = W().HOUSE_UPGRADES[key];
      return U.hp[Math.min(this.save.house[key] || 0, U.hp.length - 1)];
    },
    canBuyHouse(key) {
      const U = W().HOUSE_UPGRADES[key];
      const level = this.save.house[key] || 0;
      const def = U.levels[level];
      if (!def) return { ok: false, maxed: true, level, missing: {}, scrapShort: 0 };
      const missing = {};
      Object.entries(def.needs).forEach(([k, n]) => {
        const have = this.save.inventory[k] || 0;
        if (have < n) missing[k] = n - have;
      });
      const scrapShort = Math.max(0, def.scrap - this.save.scrap);
      return { ok: !Object.keys(missing).length && !scrapShort, maxed: false, level, def, missing, scrapShort };
    },
    buyHouse(key) {
      const c = this.canBuyHouse(key);
      if (!c.ok) return false;
      Object.entries(c.def.needs).forEach(([k, n]) => (this.save.inventory[k] -= n));
      this.save.scrap -= c.def.scrap;
      this.save.house[key] = c.level + 1;
      this.commit();
      return true;
    },
    /** A note on a wall of the cabin, read for the first time: its words count. */
    seeHouseNote(id, words) {
      const list = this.save.houseRead || (this.save.houseRead = []);
      if (list.includes(id)) return false;
      list.push(id);
      this.save.stats.wordsRead += words || 0;
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
    /* ---------- The fishing pole and the river ---------- */
    /** Holding the pole: brought home, or picked up this trip. */
    hasRod() {
      return !!this.save.rod || (!!this.trip && !!this.trip.rod);
    },
    takeRod() {
      if (this.hasRod()) return false;
      if (this.trip) this.trip.rod = true;
      else this.save.rod = true;
      return true;
    },
    /** Fish still to catch at River Landing on this trip (0 while the river rests after being fished out). */
    fishLeft() {
      const R = W().RIVER;
      if (this.save.riverRest != null && this.save.day - this.save.riverRest < R.restockDays) return 0;
      return Math.max(0, R.cap - ((this.trip && this.trip.fish) || 0));
    },
    /** Days until the river has fish again (0 when it has). */
    riverRestDays() {
      const R = W().RIVER;
      if (this.save.riverRest == null) return 0;
      return Math.max(0, R.restockDays - (this.save.day - this.save.riverRest));
    },
    /** A fish on the line and landed: one food in the van. */
    catchFish() {
      if (!this.trip || this.fishLeft() <= 0) return false;
      this.trip.fish = (this.trip.fish || 0) + 1;
      this.trip.cargo.food = (this.trip.cargo.food || 0) + 1;
      this.trip.items += 1;
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
    /** A finished round (a build or practice): a good one counts toward the stage; enough of them move it up. */
    typingDone(result) {
      const t = this.save.typing;
      const T = ZSR.Typing;
      const next = T && T.progress ? T.progress(t.stage, t.passes, result && result.accuracy != null ? result.accuracy : 0) : { stage: t.stage, passes: t.passes };
      t.stage = next.stage;
      t.passes = next.passes;
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
    const fill = (t) => (ZSR.Locks ? ZSR.Locks.fill(locId, t) : t); // this save's codes, moves and hiding places
    if (entry) return { title: entry.title || "Note", text: fill(entry.text) };
    const facts = isDoor ? N.door.facts : (N.notes.find((n) => n.id === noteId) || {}).facts || [];
    return { title: isDoor ? "At the door" : "A note", text: fill(facts.join(" ")) };
  };
  /** A wall sign or graffiti inside a building. */
  ZSR.signText = function signText(locId, signId) {
    const e = ZSR.textAt((t) => {
      const s = t.locations && t.locations[locId] && t.locations[locId].signs && t.locations[locId].signs[signId];
      return s && s.text ? s : null;
    });
    const fill = (t) => (ZSR.Locks ? ZSR.Locks.fill(locId, t) : t);
    if (e) return { title: e.title || "Sign", text: fill(e.text) };
    const sg = ((ZSR.WORLD.NOTES[locId] || {}).signs || []).find((x) => x.id === signId);
    return { title: sg && sg.kind === "graffiti" ? "Spray paint" : "Sign", text: sg ? fill(sg.facts.join(" ")) : "" };
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
  /** River Landing's words: "sign" and "note" ({ title, text }), "rod" (the pole: { name, tag }), "blurb" (the city map). */
  ZSR.riverText = function riverText(key) {
    const e = ZSR.textAt((t) => {
      const r = t.river && t.river[key];
      return r && (typeof r === "string" || r.text || r.tag) ? r : null;
    });
    const f = ((ZSR.WORLD.RIVER_FACTS || {})[key] || []).join(" ");
    if (key === "blurb") return e || "";
    if (key === "rod") return e ? { name: e.name || "Fishing pole", tag: e.tag } : { name: "Fishing pole", tag: f };
    if (e) return { title: e.title || "", text: e.text };
    return { title: key === "sign" ? "River Landing" : "A note", text: f };
  };
  /** A note the Hollis family left on a wall of the cabin (WORLD.HOUSE.notes): { title, text }. */
  ZSR.houseNoteText = function houseNoteText(id) {
    const e = ZSR.textAt((t) => {
      const n = t.house && t.house.notes && t.house.notes[id];
      return n && n.text ? n : null;
    });
    if (e) return { title: e.title || "", text: e.text };
    const room = (ZSR.WORLD.HOUSE.rooms || {})[id];
    return { title: room ? room.name : "", text: ((ZSR.WORLD.HOUSE_NOTES || {})[id] || []).join(" ") };
  };
  /** A door or window upgrade as the computer's House tab says it: { desc, next: [level 1, 2, 3] }. */
  ZSR.houseUpgradeText = function houseUpgradeText(key) {
    const e = ZSR.textAt((t) => {
      const u = t.house && t.house.upgrades && t.house.upgrades[key];
      return u && u.desc ? u : null;
    });
    if (e) return e;
    const f = (ZSR.WORLD.HOUSE_UPGRADE_FACTS || {})[key] || { desc: [], next: [[], [], []] };
    return { desc: f.desc.join(" "), next: f.next.map((n) => n.join(" ")) };
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
  /** An item counted in running text: "1 box of nails", "2 boxes of nails" (WORLD.ITEMS one / many; an item
      without them falls back to its label, "2 Generator"). For rewards, what a build still needs, and the crew. */
  ZSR.itemCount = function itemCount(item, n) {
    const it = ((ZSR.WORLD && ZSR.WORLD.ITEMS) || {})[item];
    return n + " " + (it ? (n === 1 ? it.one : it.many) || it.name : String(item));
  };
  /** "a", "a and b", "a, b and c". */
  const listWords = (parts) => (parts.length < 2 ? parts.join("") : parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1]);
  /** The recap of a day, from the level's templates: {items} {scrap} {notes} {food} {room} {needs} {keys}.
      r.quests: story objects (or the dog) brought home that day; with nothing else, the "nothing" line is left out
      (June's ledger line for a story quest follows the recap on the first day page after its hand-in: entry.quests). */
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
    const needs = nb ? listWords(Object.entries(nb.missing || {}).map(([k, n]) => ZSR.itemCount(k, n)).concat(nb.scrap ? [nb.scrap + " scrap"] : [])) : "";
    const o = Object.assign({}, r, { room: nb ? W2.BASE_ROOMS[nb.room].name : "", needs });
    const out = [];
    if (r.items || r.scrap) out.push(fill(tpl.haul, o));
    else if (!r.quests) out.push(fill(tpl.nothing, o));
    if (r.notes) out.push(fill(tpl.notes, o));
    if (r.keys) out.push(fill(tpl.keys, o));
    out.push(fill(r.hungry ? tpl.hungry : tpl.food, o));
    if (nb) out.push(fill(nb.ready ? tpl.ready : tpl.next, o));
    // templates are written for any number: "1 items" reads "1 item"
    return out.join(" ").replace(/\b1 ((?:stash |new )?)(item|note|key|walker)s\b/g, "1 $1$2");
  };

  // the last save played keeps its own settings from the first screen on (no slot migration here: an
  // old single save has no settings of its own yet, so it reads the shared ones either way)
  State.settings = State.settingsFor(read(KEYS.slots, { active: null }).active);

  ZSR.State = State;
})(typeof globalThis !== "undefined" ? globalThis : this);
