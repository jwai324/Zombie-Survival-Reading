/* State: settings, best scores, lifetime stats, and the current run.
   Everything persists in localStorage under the "zsr." prefix. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  const KEYS = { settings: "zsr.settings", best: "zsr.best", stats: "zsr.stats", run: "zsr.run" };

  const DEFAULT_SETTINGS = {
    grade: 2,
    textSize: "normal", // normal | large | huge
    readAloud: true,
    sound: true,
    aimAssist: true,
    shake: true,
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

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((rng ? rng() : Math.random()) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const State = {
    settings: read(KEYS.settings, DEFAULT_SETTINGS),
    best: read(KEYS.best, {}), // keyed by grade: { miles, kills, correct, score, havens }
    stats: read(KEYS.stats, { runs: 0, wordsRead: 0, answered: 0, correct: 0, kills: 0, miles: 0 }),
    run: null,

    saveSettings() {
      write(KEYS.settings, this.settings);
    },
    saveStats() {
      write(KEYS.stats, this.stats);
    },
    saveBest() {
      write(KEYS.best, this.best);
    },

    /** Build a fresh run for the current grade. */
    newRun() {
      const grade = this.settings.grade;
      this.run = {
        grade,
        segment: 0, // 0-based index of the road segment about to be driven
        havens: 0, // havens visited
        scrap: 0,
        hp: 100,
        upgrades: { armor: 0, engine: 0, bumper: 0, paint: 0, damage: 0, fireRate: 0, spread: 0 },
        kills: 0,
        miles: 0,
        correct: 0,
        answered: 0,
        wordsRead: 0,
        havenQueue: [],
        signQueue: [],
        nextMods: {}, // effects chosen at the last haven, applied to the next segment
        startedAt: Date.now(),
      };
      this.stats.runs += 1;
      this.saveStats();
      this.clearRun();
      return this.run;
    },

    /** Save the run at a safe haven so a refresh or a crash does not lose it. */
    checkpoint() {
      if (this.run) write(KEYS.run, this.run);
    },
    hasCheckpoint() {
      return !!read(KEYS.run, { _none: true }).grade;
    },
    loadCheckpoint() {
      const r = read(KEYS.run, {});
      if (!r.grade) return null;
      this.run = r;
      return r;
    },
    clearRun() {
      write(KEYS.run, null);
    },

    /** Next haven passage for this grade; refills and reshuffles when empty. */
    nextHaven() {
      const run = this.run;
      const bank = ZSR.CONTENT[run.grade] || ZSR.CONTENT[this.settings.grade];
      // If the grade changed mid-run, start drawing from the new bank.
      if (run.grade !== this.settings.grade) {
        run.grade = this.settings.grade;
        run.havenQueue = [];
        run.signQueue = [];
      }
      const content = ZSR.CONTENT[run.grade] || bank;
      if (!run.havenQueue.length) run.havenQueue = shuffle(content.havens.map((h) => h.id));
      const id = run.havenQueue.shift();
      return content.havens.find((h) => h.id === id) || content.havens[0];
    },

    nextSign() {
      const run = this.run;
      const content = ZSR.CONTENT[run.grade] || ZSR.CONTENT[this.settings.grade];
      if (!run.signQueue.length) run.signQueue = shuffle(content.roadSigns.map((_, i) => i));
      return content.roadSigns[run.signQueue.shift()];
    },

    /** Record a finished run into best scores and lifetime stats. */
    finishRun() {
      const run = this.run;
      if (!run) return null;
      const score = Math.round(run.miles * 10 + run.kills * 2 + run.correct * 25);
      const entry = { miles: +run.miles.toFixed(1), kills: run.kills, correct: run.correct, havens: run.havens, score };
      const prev = this.best[run.grade];
      const isBest = !prev || score > prev.score;
      if (isBest) this.best[run.grade] = entry;
      this.saveBest();
      this.stats.kills += run.kills;
      this.stats.miles += run.miles;
      this.saveStats();
      this.clearRun();
      return { entry, isBest, prev };
    },

    shuffle,
  };

  ZSR.State = State;
})(typeof globalThis !== "undefined" ? globalThis : this);
