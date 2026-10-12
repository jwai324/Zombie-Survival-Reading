/* State: settings, best scores, lifetime stats, and the current run.
   Everything persists in localStorage under the "zsr." prefix. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  const KEYS = { settings: "zsr.settings", best: "zsr.best", stats: "zsr.stats", run: "zsr.run" };

  const DEFAULT_SETTINGS = {
    grade: 2,
    textSize: "normal", // normal | large | huge
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
        currentSign: null, // index of the road sign currently on screen
        resume: null, // exact bookmark of where the player is (see saveProgress)
        startedAt: Date.now(),
      };
      this.stats.runs += 1;
      this.saveStats();
      this.clearRun();
      return this.run;
    },

    /**
     * Persist the run with an exact bookmark of where the player is, so Continue
     * returns to the same spot. `where` is "road" | "sign" | "haven"; `extra` carries
     * the road snapshot, the sign state, or the haven step.
     */
    saveProgress(where, extra) {
      if (!this.run) return;
      this.run.resume = Object.assign({ where }, extra || {});
      write(KEYS.run, this.run);
    },
    /** Save the run as is (used after purchases and other mutations mid-screen). */
    checkpoint() {
      if (this.run) write(KEYS.run, this.run);
    },
    hasCheckpoint() {
      return !!read(KEYS.run, { _none: true }).grade;
    },
    /** Short description of the saved spot for the title screen, or "" if none. */
    resumeLabel() {
      const r = read(KEYS.run, {});
      if (!r.grade) return "";
      const res = r.resume || { where: "road" };
      if (res.where === "haven" && res.haven) {
        const bank = ZSR.CONTENT[r.grade];
        const h = bank && bank.havens.find((x) => x.id === res.haven.id);
        const STEP = { arrive: "arriving", read: "reading", question: "answering", summary: "answering", choice: "choosing a route", result: "choosing a route", garage: "in the garage" };
        return (h ? h.place : "a safe haven") + ", " + (STEP[res.haven.step] || "reading");
      }
      if (res.where === "sign") return "Road " + (r.segment + 1) + ", at a sign";
      return "Road " + (r.segment + 1);
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

    /**
     * If the reading level changed in Settings, switch the run to the new bank
     * before the next passage or sign is drawn. A haven already in progress
     * finishes at its own level (it is looked up by id in the run's bank).
     */
    syncGrade() {
      const run = this.run;
      if (run.grade !== this.settings.grade && ZSR.CONTENT[this.settings.grade]) {
        run.grade = this.settings.grade;
        run.havenQueue = [];
        run.signQueue = [];
      }
      return ZSR.CONTENT[run.grade] || ZSR.CONTENT[this.settings.grade];
    },

    /** Next haven passage for the current reading level; refills and reshuffles when empty. */
    nextHaven() {
      const run = this.run;
      const content = this.syncGrade();
      if (!run.havenQueue.length) run.havenQueue = shuffle(content.havens.map((h) => h.id));
      const id = run.havenQueue.shift();
      return content.havens.find((h) => h.id === id) || content.havens[0];
    },

    nextSign() {
      const run = this.run;
      const content = this.syncGrade();
      if (!run.signQueue.length) run.signQueue = shuffle(content.roadSigns.map((_, i) => i));
      run.currentSign = run.signQueue.shift();
      return content.roadSigns[run.currentSign];
    },
    /** The sign that was on screen when the run was saved. */
    currentSign() {
      const run = this.run;
      const content = ZSR.CONTENT[run.grade] || ZSR.CONTENT[this.settings.grade];
      return content.roadSigns[run.currentSign] || content.roadSigns[0];
    },
    /** A haven passage by id from the run's grade bank (null if the bank changed). */
    havenById(id) {
      const content = ZSR.CONTENT[this.run.grade];
      return (content && content.havens.find((h) => h.id === id)) || null;
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
