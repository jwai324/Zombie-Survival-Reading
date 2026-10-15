/* June's first-run tutorial (owner decisions 2026-10-14: DESIGN.md "Owner decisions: the first-run tutorial").
   The logic only: no DOM, ever. It reaches the screen through Tutorial.view (js/tutorial-ui.js sets it in init;
   until then a silent view finishes every card at once, so a card can never freeze the game).
   - The yard part, on every stay at home until it is done: the basics (YARD_STEPS: walk and look, the backpack,
     a slow practice walker, a talk with the crew, the office computer). Each is a card (Got it, or Enter) that
     pauses the game, then a "Now you try" panel and an arrow while the game runs. A basic done early counts and
     its card is skipped. Until every basic is done Interior.yardHold holds a fresh, frozen calm (no wave), the
     dinner bell, Pip's call, the crew's cards and the van (E there: June says what is left, vanWait). Then the
     normal first calm starts and the ready card sends you to the van.
   - One card the first time each new screen comes up: the town map, the road, the door note, a building, the
     first lock (a hint only: read the note, do just what it says) and the river.
   - Progress: State.settings.tutorial, the done ids, in the save slot's own settings, written at once (death,
     quitting and a refresh keep it). Missing = nothing done, so every save, old ones too, does the yard part.
   Called from js/main.js (enter, first("door"), note, canReplay / replay, isOpen), js/yard.js (tick, vanWait)
   and js/building.js (first("lock")). Engine fields it sets: Interior.yardHold and Interior.eatClick, and the
   practice walker's practice and floorHp (js/interior.js). Words: ZSR.TEXT[1].tutorial
   (js/content/level1-tutorial.js), level 1 for every reader. Read no WORLD at load: tests/validate-text.js loads
   this file with the facts alone for its card list. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  /* ---------- Data (validators, tests and docs read it too) ---------- */
  const TEXT_LEVEL = 1; // owner decision 2026-10-14: everyone reads the level-1 words, whatever the reading level
  const SPEAKER = "june"; // June talks you through it (docs/CREW.md); face, name and color from W.CREW
  // The yard's basics, in card order. Ids are stored in saves (settings.tutorial): never rename or remove one (saves
  // keep ids, so a reorder only changes the card order). A new one stops every save at home until it is done
  // (docs/SCALING.md "The tutorial").
  const YARD_STEPS = ["walk", "bag", "shoot", "talk", "computer"];
  // Every card. keys: key caps pictured (the words must name each as a capital); mouse: "move" | "click" pictured;
  // ring: a real HUD button ringed while the card is up; arrow: what the yard's arrow points at during "Now you try";
  // yard: a yard card (it has a try line and a checklist item); extra: more lines it may show.
  // Ids are stored in saves (settings.tutorial): append, never rename or remove.
  const CARDS = {
    walk: { yard: true, keys: ["W", "A", "S", "D"], mouse: "move" },
    bag: { yard: true, keys: ["B"], ring: "int-btn-backpack" },
    shoot: { yard: true, keys: ["Space"], mouse: "click", arrow: "walker", extra: ["bow"] },
    talk: { yard: true, keys: ["E"], arrow: "crew" },
    computer: { yard: true, keys: ["E"], arrow: "computer" },
    ready: { yard: true, keys: ["E", "P"], ring: "int-btn-pause", arrow: "van" }, // the last yard card (not a basic)
    map: { mouse: "click" },
    road: { keys: ["A", "D"], mouse: "click" },
    door: {},
    building: { keys: ["E", "M"], ring: "int-btn-map" },
    lock: {},
    river: { keys: ["E"], mouse: "click" },
  };
  const ARROW_LABELS = ["van", "computer", "walker"]; // text keys arrow.<k>; a crew member's arrow shows their name
  // Assumption (DESIGN.md): feel numbers, cheap to change
  const TUNE = {
    firstGap: 0.6, // s of yard before the first card (the entry toast pops first)
    cardGap: 0.8, // s between a step done and the next card
    busyWait: 20, // s a card waits for an open speech bubble, lot sign, pantry list or pickup tag
    armMs: 500, // Got it does nothing this long after a card opens (mashed keys, a click spree)
    walkTiles: 3, // the walk step: this far on foot ...
    lookTurn: 2.4, // ... and this much turning in all (radians, mouse or arrow keys)
    stuckSecs: 15, // a practice walker that has not moved this long out of sight comes again near you
    arrowNear: 2, // tiles: closer than this the arrow hides (the game's "Press E ..." line takes over)
    guideEvery: 0.5, // s between path searches for the arrow
    guideAhead: 4, // tiles along the path the arrow looks ahead
  };
  // the kind (WORLD.WALKER_TYPES, a plain walker: owner, 2026-10-15); share of its speed; bite; floor share of max health; path steps from you
  const PRACTICE = { type: "walker", speed: 0.5, bite: 5, floor: 0.5, steps: [6, 11] };
  // SCALE: the checklist shows at most this many rows (today 6: five basics and the van); past it, a window around the current row
  const LIST_SHOWN = 6;
  // the view before js/tutorial-ui.js replaces it (and in node): a card it cannot show is finished at once
  const SILENT_VIEW = { card: () => false, hideCard() {}, tryPanel() {}, arrow() {}, pulse() {} };

  const I = () => ZSR.Interior;
  const W = () => ZSR.WORLD;
  const St = () => ZSR.State;
  const words = () => ((ZSR.TEXT || {})[TEXT_LEVEL] || {}).tutorial || {};
  const crewName = (id) => (ZSR.crewName ? ZSR.crewName(id) : ((W().CREW || {})[id] || {}).name || id);

  /* ---------- Progress: State.settings.tutorial ---------- */
  const list = () => {
    const s = St() && St().settings;
    const v = s && s.tutorial;
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  };
  const done = (id) => list().includes(id);
  function mark(id) {
    const S = St();
    if (!S || !S.settings || done(id)) return;
    S.settings.tutorial = list().concat(id); // replaced, never changed in place (read() merges shallowly)
    // written at once, so death, quitting and a refresh keep it; only a save being played writes it (never the
    // shared settings). With no slot (storage blocked) it lives in memory for the session, so nothing sticks
    if (S.activeSlot()) S.saveSettings();
  }
  function reset() {
    const S = St();
    if (!S || !S.settings) return;
    S.settings.tutorial = [];
    if (S.activeSlot()) S.saveSettings();
  }

  /* ---------- The cards: one at a time; the game waits under it ---------- */
  let cur = null; // the card that is up: { id, paused, missed, then, armAt }
  const queue = []; // a card asked for while another is up waits its turn (a safety net; no current path does it)
  function cardModel(id) {
    const c = CARDS[id];
    const t = words()[id] || {};
    const crew = ((W() && W().CREW) || {})[SPEAKER] || {};
    return { id, title: String(t.title || ""), text: String(t.text || ""), keys: c.keys || [], mouse: c.mouse || null, ring: c.ring || null, who: SPEAKER, name: crewName(SPEAKER), color: crew.color || "" };
  }
  /** Show card `id`; mode "fp" pauses first person, "road" the road (null: the caller has paused what runs).
      then() runs after Got it (or at once when the card cannot show). */
  function showCard(id, mode, then) {
    if (cur) {
      queue.push([id, mode, then]);
      return;
    }
    const Im = I();
    const G = ZSR.Game;
    let paused = null; // pause what runs, and only that; resume only what this card paused (there is no pause stack)
    if (mode === "fp" && Im && Im.running && !Im.paused) {
      Im.pause();
      paused = "fp";
    } else if (mode === "road" && G && G.running && !G.paused) {
      G.pause();
      paused = "road";
    }
    // the entry toast or the road banner runs on the wall clock and would expire under the card: show it again
    // after. In the yard only under the stay's first card: a later one would bring back old news ("Next, talk to
    // the crew" once you have)
    const again = !CARDS[id].yard || (run && run.toastBack);
    if (CARDS[id].yard && run) run.toastBack = false;
    const el = !again ? null : paused === "fp" ? Im.hud && Im.hud.toast : paused === "road" ? G.hud && G.hud.banner : null;
    const missed = el && !el.classList.contains("hidden") ? el.textContent : "";
    cur = { id, paused, missed, then, armAt: Tutorial.now() + TUNE.armMs };
    let shown = false;
    try {
      shown = Tutorial.view.card(cardModel(id)) !== false;
    } catch (e) {
      if (root.console) root.console.error(e);
    }
    if (!shown) finish(); // a card that cannot show never leaves the game frozen
  }
  /** Got it (the UI calls it from the click or the Enter keydown: a user gesture). False while it arms. */
  function press() {
    if (!cur || Tutorial.now() < cur.armAt) return false;
    if (ZSR.Audio) ZSR.Audio.play("click");
    finish();
    return true;
  }
  function finish() {
    const c = cur;
    cur = null;
    try {
      Tutorial.view.hideCard();
    } catch (e) {
      /* the card is gone either way */
    }
    if (!CARDS[c.id].yard || c.id === "ready") mark(c.id); // a basic is marked when it is done, never on Got it
    const Im = I();
    const G = ZSR.Game;
    if (c.paused === "fp" && Im.running) {
      Im.resume();
      Im.eatClick = true; // the click that takes the mouse back into the view never fires (js/interior.js mousedown)
      grab(Im); // inside the Got it click or Enter keydown: a user gesture
      if (c.missed) Im.toast(c.missed, Im.readSecs(c.missed, 3));
    }
    if (c.paused === "road" && G.running) {
      G.keys = {};
      G.pointer.down = false;
      G.resume(); // Game.resume keeps keys: a key held through the card is dropped first
      if (c.missed) G.banner(c.missed, 1800);
    }
    if (c.then) c.then();
    if (!cur && queue.length) showCard(...queue.shift());
  }
  /** Pointer lock for the view. Refused (embedded, too soon, a keydown): the next click into the view takes it. */
  function grab(Im) {
    try {
      const cv = Im.canvas;
      if (cv && cv.requestPointerLock && !Im.locked) {
        const p = cv.requestPointerLock();
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) {
      /* refused: the next click into the view takes the mouse, and is eaten */
    }
  }
  /** Every card down and the queue dropped (death, quit, a new scene). */
  function closeAll() {
    queue.length = 0;
    if (!cur) return;
    cur = null;
    try {
      Tutorial.view.hideCard();
    } catch (e) {
      /* gone either way */
    }
  }

  /* ---------- The yard part ---------- */
  const allBasicsDone = () => YARD_STEPS.every(done);
  const firstBasicLeft = () => YARD_STEPS.find((s) => !done(s)) || null;
  // the step on screen: the first basic not done, else "ready" (it stays "ready" after its Got it, so the van line
  // and the van arrow stay up until the yard is left)
  const currentStep = () => firstBasicLeft() || "ready";
  let run = null; // the yard part while it runs (see startYard)
  // Every function reads Tutorial.view and Tutorial.now at call time (never a captured copy), so tests can swap them.

  function startYard(replay) {
    const Im = I();
    removePractice(Im);
    run = null;
    if (allBasicsDone() && done("ready")) return; // nothing to do (startLoop already cleared yardHold)
    if (!allBasicsDone()) {
      if (replay && Im.talk && Im.crewTalkEnd) Im.crewTalkEnd(true); // a stale "Press E again" never opens a crew card
      Im.phase = Im.calmPhase(W().DEFENSE.firstCalmSeconds); // a fresh calm, frozen while held: nothing called, nothing short
      Im.yardHold = true;
      Im.updateHud();
    }
    const p = Im.player;
    run = { step: null, seen: false, gap: TUNE.firstGap, waitT: 0, walked: 0, turned: 0, px: p.x, py: p.y, pa: p.a, walker: null, wx: 0, wy: 0, wt: 0, crewId: null, field: null, fieldKey: "", fieldT: 0, toastBack: true };
  }
  function release(Im) {
    Im.yardHold = false;
    Im.phase = Im.calmPhase(W().DEFENSE.firstCalmSeconds); // owner decision 3: the normal first calm starts now
    Im.updateHud();
  }
  /** A basic done: marked at once; the last one lets the yard go (the hold ends, a fresh first calm). */
  function complete(id) {
    if (!run || done(id)) return;
    mark(id);
    const Im = I();
    const last = allBasicsDone() && Im.yardHold;
    if (last) release(Im);
    if (ZSR.Audio) ZSR.Audio.play(last ? "correct" : "pickup");
    run.gap = Math.max(run.gap, TUNE.cardGap);
  }
  function computerSpot(Im) {
    const s = ((W().HOUSE || {}).spots || {}).computer;
    return s ? { x: Im.hx + s[0] + 0.5, y: Im.hy + s[1] + 0.5 } : null;
  }
  /** Every unpaused yard frame (js/yard.js yardUpdate, first line): watch the basics, show the next card, keep the
      "Now you try" panel and the arrow up to date. */
  function tick(Im, dt) {
    if (!run || cur || Im.mode !== "yard") return; // (cur: a card is up; the real loop never ticks then, tests might)
    const p = Im.player;
    run.walked += Math.hypot(p.x - run.px, p.y - run.py);
    run.turned += Math.abs(Math.atan2(Math.sin(p.a - run.pa), Math.cos(p.a - run.pa)));
    run.px = p.x;
    run.py = p.y;
    run.pa = p.a;
    if (run.walked >= TUNE.walkTiles && run.turned >= TUNE.lookTurn) complete("walk");
    if (Im.talk && Im.talk.id !== "dog") complete("talk");
    if (!(Im.crew && Im.crew.length)) complete("talk"); // no crew in the data: never a dead end
    if (!computerSpot(Im)) complete("computer"); // no computer in the cabin: never a dead end
    practiceTick(Im, dt);
    run.fieldT -= dt;
    const step = currentStep();
    if (step !== run.step) {
      run.step = step;
      run.seen = false;
      run.waitT = 0;
      run.gap = Math.max(run.gap, TUNE.cardGap);
    }
    if (step === "ready" && done("ready")) run.seen = true; // seen before (this stay or an earlier one): no card, the van line stays
    const wave = !!(Im.phase && Im.phase.kind === "wave");
    if (!run.seen && !wave) {
      run.gap -= dt;
      const busy = !!(Im.talk || Im.readLot || Im.readSpot || Im.pickupShown());
      if (busy) run.waitT += dt;
      if (run.gap <= 0 && (!busy || run.waitT >= TUNE.busyWait)) {
        run.seen = true;
        Tutorial.view.tryPanel(null);
        Tutorial.view.arrow(null);
        const r = run;
        showCard(step, "fp", () => afterCard(Im, step, r));
        return;
      }
    }
    const hide = wave || !!Im.talk;
    Tutorial.view.tryPanel(hide ? null : tryModel(Im));
    Tutorial.view.arrow(hide || !run.seen ? null : arrowPos(Im, arrowTarget(Im)));
  }
  /** After a yard card's Got it: the shoot card brings in the practice walker (only for the stay that showed it). */
  function afterCard(Im, step, r) {
    if (!run || run !== r || step !== "shoot" || done("shoot")) return;
    if (Im.tool === "rod") Im.switchWeapon(Im.gun.id); // the pole cannot shoot: the gun comes back out (js/interior.js)
    run.walker = spawnPractice(Im);
    if (!run.walker) complete("shoot"); // no room for it anywhere: never a dead end
  }

  /* ---------- The practice walker: slow, hurts a little, never below half health ---------- */
  /** On the player's own walkable tiles (walls, closed doors, the fence line and broken windows block, so never
      outside the fence or behind a door you shut), 6 to 11 steps away, ahead, in sight, on your side of the walls. */
  function spawnPractice(Im) {
    removePractice(Im); // one at most, always
    const P = PRACTICE;
    const p = Im.player;
    const sx = Math.floor(p.x);
    const sy = Math.floor(p.y);
    const dist = new Map([[sx + "," + sy, 0]]);
    const q = [[sx, sy]];
    const cap = P.steps[1] + 2; // SCALE: the search stops this many steps out, so a bigger yard costs nothing more
    while (q.length) {
      const [x, y] = q.shift();
      const d = dist.get(x + "," + y);
      if (d >= cap) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        const k = nx + "," + ny;
        if (dist.has(k) || Im.solidForPlayer(nx + 0.5, ny + 0.5)) continue;
        dist.set(k, d + 1);
        q.push([nx, ny]);
      }
    }
    const indoor = Im.indoorAt(p.x, p.y);
    let best = null;
    let far = null;
    dist.forEach((d, k) => {
      const [x, y] = k.split(",").map(Number);
      const cx = x + 0.5;
      const cy = y + 0.5;
      if ((Im.crew || []).some((c) => Math.hypot(c.x - cx, c.y - cy) < 1.2)) return;
      if (d >= 2 && (!far || d > far.d)) far = { x: cx, y: cy, d }; // the fallback: the farthest tile there is
      if (d < P.steps[0] || d > P.steps[1]) return;
      const score = Math.abs(Im.sideOf(cx, cy)) + (Im.lineClear(p.x, p.y, cx, cy) ? 0 : 1.5) + (Im.indoorAt(cx, cy) === indoor ? 0 : 3);
      if (!best || score < best.score) best = { x: cx, y: cy, score }; // ahead of you, in sight, on your side of the walls
    });
    const at = best || far;
    if (!at) {
      if (root.console) root.console.warn("tutorial: no room for the practice walker");
      return null;
    }
    const z = Im.makeWalker(P.type, at.x, at.y, 1); // the base walker's health (WORLD.WALKER_TYPES.walker.hp): three pistol hits
    Object.assign(z, { practice: true, awake: true, speed: z.speed * P.speed, dmg: P.bite, dps: 0, scrap: 0, floorHp: Math.ceil(p.maxHp * P.floor) });
    Im.walkers.push(z);
    Im.updateHud();
    run.wx = z.x;
    run.wy = z.y;
    run.wt = 0;
    return z;
  }
  function practiceTick(Im, dt) {
    const z = run.walker;
    if (!z) return;
    if (z.hp <= 0 || !Im.walkers.includes(z)) {
      run.walker = null;
      complete("shoot");
      return;
    }
    const p = Im.player;
    if (Math.hypot(z.x - run.wx, z.y - run.wy) > 0.5) {
      run.wx = z.x;
      run.wy = z.y;
      run.wt = 0;
    } else run.wt += dt;
    const seen = Im.lineClear(p.x, p.y, z.x, z.y);
    if (run.wt > (seen ? 2 : 1) * TUNE.stuckSecs && Math.hypot(z.x - p.x, z.y - p.y) > 2) {
      // stuck where you cannot get at it: it comes again near you
      run.walker = spawnPractice(Im);
      if (!run.walker) complete("shoot");
    }
  }
  function removePractice(Im) {
    const list = (Im && Im.walkers) || [];
    for (let i = list.length - 1; i >= 0; i--) if (list[i].practice) list.splice(i, 1);
  }

  /* ---------- The arrow and the "Now you try" panel ---------- */
  function arrowTarget(Im) {
    const kind = CARDS[run.step] && CARDS[run.step].arrow;
    const t = words().arrow || {};
    // over its head: its kind's drawn height (Interior.walkerHeight: its look's box, capped under a roof) and a gap
    if (kind === "walker" && run.walker) return { x: run.walker.x, y: run.walker.y, lift: (Im.walkerHeight ? Im.walkerHeight(run.walker) : 0.95) + 0.3, label: t.walker };
    if (kind === "computer") {
      const s = computerSpot(Im);
      return s && { x: s.x, y: s.y, lift: 0.9, label: t.computer };
    }
    if (kind === "van" && Im.van) return { x: Im.van.x + 1, y: Im.van.y + 0.5, lift: 1.1, label: t.van };
    if (kind === "crew" && Im.crew && Im.crew.length) {
      const d = (c) => Math.hypot(c.x - Im.player.x, c.y - Im.player.y);
      const was = Im.crew.find((c) => c.id === run.crewId);
      const near = Im.crew.reduce((a, c) => (d(c) < d(a) ? c : a));
      const c = was && d(was) <= d(near) + 3 ? was : near; // keep the pick unless another is 3 tiles nearer
      run.crewId = c.id;
      return { x: c.x, y: c.y, lift: 1.1, label: crewName(c.id) };
    }
    return null;
  }
  /** A point a few tiles ahead on the walkable way (through doors you can open), so the arrow never points into a wall. */
  function waypoint(Im, t) {
    const p = Im.player;
    if (Im.lineClear(p.x, p.y, t.x, t.y)) return t;
    const key = Math.floor(t.x) + "," + Math.floor(t.y);
    if (!run.field || run.fieldKey !== key || run.fieldT <= 0) {
      // SCALE: one BFS over the yard twice a second (about 2.5k tiles today); past ~10k tiles cap it at 60 steps
      run.field = Im.reachable(Math.floor(t.x), Math.floor(t.y), true); // closed doors count as open
      run.fieldKey = key;
      run.fieldT = TUNE.guideEvery;
    }
    let x = Math.floor(p.x);
    let y = Math.floor(p.y);
    let d = run.field.get(x + "," + y);
    let best = null;
    if (d == null) return t;
    for (let i = 0; i < TUNE.guideAhead && d > 0; i++) {
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [x + dx, y + dy]).find(([nx, ny]) => run.field.get(nx + "," + ny) === d - 1);
      if (!n) break;
      [x, y] = n;
      d -= 1;
      if (Im.lineClear(p.x, p.y, x + 0.5, y + 0.5)) best = { x: x + 0.5, y: y + 0.5, lift: t.lift };
    }
    return best || t;
  }
  /** Where the arrow goes on screen: over the target (or the waypoint) when it is in view, else at the edge
      it lies toward. null: no target, or close enough that the game's own "Press E" line takes over. */
  function arrowPos(Im, t) {
    if (!t || Math.hypot(t.x - Im.player.x, t.y - Im.player.y) < TUNE.arrowNear) return null;
    const w = waypoint(Im, t);
    const q = Im.project(w.x, w.y, w.lift); // null when behind you; x may be off screen
    const M = 32; // px from the edge
    if (q && q.x >= M && q.x <= Im.W - M) return { x: Math.round(q.x), y: Math.round(Math.max(Im.H * 0.18, Math.min(Im.H * 0.7, q.y))), dir: "down", label: t.label || "" };
    const left = q ? q.x < M : Im.sideOf(w.x, w.y) < 0;
    return { x: left ? M : Im.W - M, y: Math.round(Im.H * 0.55), dir: left ? "left" : "right", label: t.label || "" };
  }
  function tryModel(Im) {
    const t = words();
    const step = run.step;
    const line = !step || !run.seen ? "" : step === "shoot" && Im.gun && Im.gun.draw ? (t.shoot || {}).bow || "" : (t[step] || {}).try || "";
    // "now" first: the van row stays the current one (not ticked) until the van leaves
    let rows = YARD_STEPS.concat("ready").map((id) => ({ label: (t[id] || {}).item || id, state: id === step ? "now" : done(id) ? "done" : "todo" }));
    if (rows.length > LIST_SHOWN) {
      const i = Math.max(0, rows.findIndex((r) => r.state === "now") - 1);
      rows = rows.slice(i, i + LIST_SHOWN);
    }
    return { now: t.nowTry || "", line, rows };
  }

  const Tutorial = {
    // data (validators, tests, docs)
    TEXT_LEVEL,
    SPEAKER,
    YARD_STEPS,
    CARDS,
    ARROW_LABELS,
    TUNE,
    PRACTICE,
    LIST_SHOWN,
    /** Every text the game shows: { key: "walk.text", kind: "label" | "prose", tokens: placeholders it fills, caps: keys it must name }. */
    textKeys() {
      const L = (key) => ({ key, kind: "label", tokens: [], caps: [] });
      const P = (key, caps, tokens) => ({ key, kind: "prose", tokens: tokens || [], caps: caps || [] });
      const out = [L("nowTry"), P("vanWait", [], ["next"])].concat(ARROW_LABELS.map((k) => L("arrow." + k)));
      Object.entries(CARDS).forEach(([id, c]) => {
        out.push(L(id + ".title"), P(id + ".text", c.keys || []));
        if (c.yard) out.push(P(id + ".try"), L(id + ".item"));
        (c.extra || []).forEach((x) => out.push(P(id + "." + x)));
      });
      return out;
    },
    words, // ZSR.TEXT[1].tutorial (always level 1)
    // progress (State.settings.tutorial)
    list,
    done,
    mark,
    reset,

    /** A new screen: "yard" | "map" | "road" | "building" | "river" | null (leaving play: death or quit). A card
        left from the screen before is dropped; the yard starts its part; any other screen shows its card once. */
    enter(screen) {
      if (run && screen && screen !== "yard" && allBasicsDone()) mark("ready"); // left the yard by van
      run = null;
      closeAll();
      Tutorial.view.tryPanel(null);
      Tutorial.view.arrow(null);
      if (!screen) return; // death or quit: every tutorial element hidden, the queue dropped
      if (screen === "yard") return startYard(false);
      if (!CARDS[screen] || CARDS[screen].yard || done(screen)) return;
      showCard(screen, screen === "road" ? "road" : screen === "building" || screen === "river" ? "fp" : null);
    },
    /** "door" | "lock": a card before the action; next() runs exactly once (at once when the card was seen). */
    first(id, next) {
      let called = false;
      const go = () => {
        if (!called) {
          called = true;
          next();
        }
      };
      if (!CARDS[id] || done(id)) return go();
      showCard(id, null, go); // the caller has done its own pausing; go() runs on Got it (or at once if the card cannot show)
    },
    tick,
    /** "bag" (the backpack closed) | "computer" (the build menu closed): events a paused game cannot poll. */
    note(id) {
      if (run && (id === "bag" || id === "computer")) complete(id);
    },
    /** The toast when E at the van comes too early: "June: The van has to wait. Next, talk to the crew." */
    vanWait() {
      const t = words();
      const item = String((t[firstBasicLeft()] || {}).item || "");
      Tutorial.view.pulse();
      const line = item ? String(t.vanWait || "").replace("{next}", item.charAt(0).toLowerCase() + item.slice(1)) : "";
      return crewName(SPEAKER) + ": " + (line || "Not yet.");
    },
    /** The pause menu's "Show tutorial again": off on a card, and in a wave (owner call: no hiding in a menu). */
    canReplay(active) {
      const Im = I();
      return ["yard", "building", "river", "road"].includes(active) && !cur && !(active === "yard" && Im && Im.phase && Im.phase.kind === "wave");
    },
    /** Everything starts over; this screen's card shows now (the yard's in a moment). */
    replay(active) {
      if (!Tutorial.canReplay(active)) return false;
      reset();
      if (active === "yard") {
        Tutorial.view.tryPanel(null);
        Tutorial.view.arrow(null);
        startYard(true);
      } else Tutorial.enter(active);
      return true;
    },
    isOpen: () => !!cur, // a card is up
    press,
    // seams
    now: () => (root.performance ? root.performance.now() : Date.now()), // tests replace it
    view: SILENT_VIEW, // js/tutorial-ui.js replaces it in init(); tests replace it with a recorder
  };
  ZSR.Tutorial = Tutorial;
})(typeof globalThis !== "undefined" ? globalThis : this);
