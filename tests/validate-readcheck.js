#!/usr/bin/env node
/* The reading check (js/readcheck.js, the logs in js/state.js): a note's time is logged when its screen is hidden,
   without the time the tab was hidden; a second read is marked; each save keeps its own log, capped, cleared with
   the save; nothing is logged in god mode; the PIN gates the page. Part of npm test.
   Prints one OK line, or the errors and exit 1. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");

const errors = [];
let checks = 0;
function ok(cond, msg) {
  checks++;
  if (!cond) errors.push(msg);
  return !!cond;
}

/** A tiny DOM: elements with a class list, observers called at once, a clock the test moves. */
function load() {
  const store = new Map();
  let clock = 1000;
  const observers = [];
  const els = {};
  const classes = (el) => ({
    contains: (c) => el._cls.has(c),
    add: (c) => (el._cls.add(c), observers.filter((o) => o.el === el).forEach((o) => o.fn())),
    remove: (c) => (el._cls.delete(c), observers.filter((o) => o.el === el).forEach((o) => o.fn())),
  });
  const el = (id) => {
    if (!els[id]) {
      els[id] = { id, _cls: new Set(["hidden"]), innerHTML: "", textContent: "", addEventListener() {}, appendChild() {}, insertAdjacentHTML() {} };
      els[id].classList = classes(els[id]);
    }
    return els[id];
  };
  const docListeners = {};
  const sb = {
    console,
    Math,
    Date,
    RegExp,
    addEventListener: () => {},
    performance: { now: () => clock },
    setTimeout: () => {},
    confirm: () => true,
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
    document: {
      hidden: false,
      getElementById: el,
      addEventListener: (t, fn) => (docListeners[t] = fn),
      createElement: () => ({ appendChild() {}, set innerHTML(v) {}, insertAdjacentHTML() {} }),
    },
    MutationObserver: function (fn) {
      this.observe = (target) => observers.push({ el: target, fn });
    },
  };
  sb.globalThis = sb;
  vm.createContext(sb);
  const page = [...fs.readFileSync(path.join(ROOT, "index.html"), "utf8").matchAll(/<script src="js\/([^"]+)"><\/script>/g)].map((m) => m[1]);
  ok(page.includes("readcheck.js") && page.indexOf("readcheck.js") < page.indexOf("main.js"), "index.html loads js/readcheck.js before js/main.js");
  const want = (f) => f === "layouts.js" || f === "world.js" || /^story[\w-]*\.js$/.test(f) || ["upgrades.js", "weapons.js", "state.js", "crewstate.js", "xoverstate.js", "readcheck.js"].includes(f);
  page.filter(want).forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, "js", f), "utf8"), sb, { filename: "js/" + f }));
  return { sb, store, el, ZSR: sb.ZSR, tick: (ms) => (clock += ms), fire: (t) => docListeners[t] && docListeners[t]() };
}

try {
  const { sb, store, el, ZSR, tick, fire } = load();
  const S = ZSR.State;
  const R = ZSR.ReadCheck;
  S.settings = S.settingsFor(null);
  S.newGame(1, "Ana");
  const screen = el("screen-note");
  const open = (id, text) => {
    screen.classList.remove("hidden");
    R.start("screen-note", { kind: "note", id, title: "T", place: "Gas-N-Go", text });
  };

  // 60 words open 30 seconds, 10 of them with the tab hidden: 20 s logged, 180 words a minute
  const sixty = Array(60).fill("word").join(" ");
  open("n1", sixty);
  tick(10000);
  sb.document.hidden = true;
  fire("visibilitychange");
  tick(10000);
  sb.document.hidden = false;
  fire("visibilitychange");
  tick(10000);
  screen.classList.add("hidden");
  let log = S.readLog(1);
  ok(log.length === 1, "hiding the note's screen logs it (got " + log.length + ")");
  ok(log[0] && log[0].ms === 20000, "time with the tab hidden is not counted (got " + (log[0] && log[0].ms) + " ms)");
  ok(log[0] && log[0].words === 60 && log[0].kind === "note" && log[0].place === "Gas-N-Go" && log[0].again === false, "the entry keeps its words, kind, place, and is a first read");
  ok(store.has("zs.readlog.1") && !JSON.parse(store.get("zs.save.1")).readLog, "the log is written apart from the save");

  // read again; a new note over an open one logs the open one first
  open("n1", sixty);
  tick(2000);
  open("n2", "a few words");
  tick(1000);
  screen.classList.add("hidden");
  log = S.readLog(1);
  ok(log.length === 3 && log[1].again === true && log[1].ms === 2000 && log[2].id === "n2" && log[2].again === false, "a second read is marked, and a note opened over another logs both");
  const groups = R.byNote(S.readLog(1));
  const n1 = groups.find((g) => g.id === "n1");
  ok(groups.length === 2 && n1 && n1.opens.length === 2 && n1.total === 22000 && groups[0].id === "n2", "byNote: one row a note, every open and the total, the last opened first");
  screen.classList.add("hidden");
  ok(S.readLog(1).length === 3, "hiding an already hidden screen logs nothing more");
  R.start("screen-note", { kind: "note", id: "blank", text: "  " });
  screen.classList.add("hidden");
  ok(S.readLog(1).length === 3, "a pop-up with no words is not timed");

  // each save its own log; capped; cleared with the save
  S.newGame(2, "Ben");
  ok(S.readLog(2).length === 0 && S.readLog(1).length === 3, "a new save starts its own log; the other save's stays");
  for (let i = 0; i < 700; i++) S.logReading({ at: i, kind: "note", id: "x" + i, words: 1, ms: 1 });
  const capped = S.readLog(2);
  ok(capped.length < 700 && capped[capped.length - 1].id === "x699", "the log keeps only the newest entries (" + capped.length + " of 700)");
  S.deleteSlot(2);
  ok(!store.has("zs.readlog.2"), "deleting a save deletes its log");
  S.loadSave(1);
  S.clearReadLog(1);
  ok(S.readLog(1).length === 0, "clearReadLog empties a save's log");

  // god mode: nothing logged
  S.godStart(false);
  open("g1", sixty);
  tick(5000);
  screen.classList.add("hidden");
  ok(!store.has("zs.readlog.1"), "nothing is logged in god mode");
  S.godEnd();

  // the PIN: set once, kept hashed, needed after a lock
  ok(!S.readCheckConfig().pinHash, "no PIN until one is set");
  R.lock();
  R.render();
  el("rc-pin").value = "1234";
  el("rc-pin2").value = "1234";
  el("rc-pin-go").onclick && el("rc-pin-go").onclick();
  const cfg = S.readCheckConfig();
  ok(cfg.pinHash && cfg.pinHash !== "1234" && !String(store.get("zs.readcheck")).includes("1234"), "the PIN is stored hashed, never as its digits");
  ok(R.unlocked, "setting the PIN opens the page");
  R.lock();
  ok(!R.unlocked, "leaving the page locks it again");
} catch (e) {
  errors.push("crashed: " + (e && e.stack ? e.stack : e));
}

if (errors.length) {
  errors.forEach((e) => console.log("ERROR " + e));
  process.exit(1);
}
console.log("OK readcheck: " + checks + " checks");
