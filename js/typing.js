/* The workbench typing game. Every build action goes through a short, timed
   typing round; nothing is spent until the round is finished (the caller
   spends in onSuccess). The first time, a lesson explains touch-typing
   finger placement. Every round starts after a five-second countdown.
   The stages go slowly: the home row one pair of keys at a time, then its
   runs and words, a full home-row check, the top row a pair at a time, the
   bottom row, and only then words, phrases and sentences. A stage moves up
   after a few good rounds (90% accuracy or better); a sloppy round still
   builds, it just does not count. A practice round (Base) counts too.
   Text pools come from ZSR.text().typing when that exists; built-in
   fallbacks ship here so the bench works without content. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  /* ---------- Content fallbacks ---------- */
  const FALLBACK = {
    fingers: [
      "Put your hands on the keyboard with your fingers resting on the home row: left hand on A S D F, right hand on J K L and the ; key. Your thumbs rest on the space bar. Feel for the little bumps on F and J. They tell you your fingers are home without looking.",
      "Each finger owns a few keys. Your pointer fingers cover the middle of the keyboard: F G R T V B on the left, J H Y U N M on the right. Your middle fingers take E D C and I K comma. Your ring fingers take W S X and O L period. Your pinkies take the edges: Q A Z on the left, P ; / on the right, plus the Shift keys for capital letters.",
      "To type a key, the finger that owns it reaches up or down from its home key, presses once, and comes straight back home. Go slow. Keep your eyes on the screen, not on your hands. Speed comes later. Accuracy comes first.",
    ],
    words: ["van", "gas", "map", "note", "door", "road", "yard", "food", "wave", "calm", "hold", "read", "wall", "tire", "lamp", "bolt", "trap", "well", "farm", "pack", "key", "fuel", "nail", "fence", "cabin", "scrap", "walker", "radio", "garden", "lumber", "crate", "cache", "drive", "build", "paint", "armor", "engine", "bench", "hammer", "wrench"],
    phrases: ["hold the fence", "read the note", "fix the van", "one more trip", "lock the door", "find the cache", "back to base", "scrap and nails", "a calm night", "drive home fast", "the last van", "boards on the wall", "fuel in the can", "the map is torn", "a key on the hook", "walkers at the gate", "food for the crew", "lights off at dusk", "patch the hole", "pack the bag"],
    sentences: ["The van is low on gas.", "Hold the fence until dawn.", "Read every note you find.", "The cabin door is locked at night.", "Ruby fixed the engine again.", "Bring the lumber to the bench.", "A wave is coming from the north.", "Doc Lin keeps the kit by the door.", "Scrap buys armor for the van.", "The radio found a new place on the map.", "Nail the boards before dark.", "We eat when the trip is done.", "The garden gives us food each day.", "Keep the key on the hook.", "Walkers claw at the gate.", "One more trip and we rest."],
  };

  /* ---------- Fingers and keys ---------- */
  const FINGER = {};
  [["left pinky", "qaz1"], ["left ring", "wsx2"], ["left middle", "edc3"], ["left pointer", "rfvtgb45"], ["right pointer", "yhnujm67"], ["right middle", "ik,8"], ["right ring", "ol.9"], ["right pinky", "p;/0'-"], ["right thumb", " "]].forEach(([f, keys]) => keys.split("").forEach((k) => (FINGER[k] = f)));
  const SHIFTED = { "?": "/", "!": "1", ":": ";", '"': "'", "<": ",", ">": ".", "(": "9", ")": "0", _: "-" };
  const ROWS = ["qwertyuiop", "asdfghjkl;", "zxcvbnm,./"];
  const HOME = "asdfjkl;";
  const RUNS = ["fjf", "dkd", "sls", "a;a", "jfj", "kdk", "lsl", ";a;", "fdf", "jkj", "sas", "l;l", "fdsa", "jkl;", "asdf", ";lkj", "dfd", "kjk"];
  // words typed with the home row alone, then with G and H too, then with the top row as well
  const HOME_WORDS = ["as", "ask", "asks", "add", "adds", "all", "alas", "dad", "dads", "fad", "fads", "fall", "falls", "flask", "flasks", "lad", "lads", "lass", "sad", "salad", "salads", "sass", "alfalfa"];
  const GH_WORDS = ["has", "had", "hall", "halls", "half", "glad", "gas", "flash", "dash", "gash", "lash", "shall", "hash", "sash", "slash", "flag", "flags", "glass", "lag", "lags", "sag", "gall", "ash", "gals"];
  const TOP_WORDS = ["road", "yard", "read", "door", "food", "hold", "wall", "tire", "trap", "well", "key", "fuel", "radio", "walker", "fire", "safe", "rest", "path", "gate", "tool", "shed", "fight", "light", "quiet", "stop", "post", "tree", "dirt", "water", "power", "ready", "keep", "hurt", "out", "wait", "fort", "rope", "sheet", "storage", "outside"];
  const ALL_HOME = "asdfghjkl;";
  const TOP = "qwertyuiop";

  /* The stages, slowest at the start. keys: the keys this stage brings in (most of the targets); review:
     keys already learned, mixed in; need: good rounds (PASS accuracy or better) to move up; rate: keys a
     second the clock allows once a round is longer than `seconds` (a beginner's pace). */
  const STAGES = [
    { name: "F and J", kind: "keys", count: 15, seconds: 60, keys: "fj", review: "", need: 3, tip: "Find the little bumps on F and J. Left pointer finger on F, right pointer finger on J. Press the key shown, then rest." },
    { name: "D and K", kind: "keys", count: 15, seconds: 60, keys: "dk", review: "fj", need: 3, tip: "Middle fingers now: left middle on D, right middle on K. Pointers stay on F and J." },
    { name: "S and L", kind: "keys", count: 15, seconds: 60, keys: "sl", review: "fjdk", need: 3, tip: "Ring fingers: left ring on S, right ring on L. Every finger stays on its home key." },
    { name: "A and ;", kind: "keys", count: 15, seconds: 60, keys: "a;", review: "fjdksl", need: 3, tip: "Pinkies: left pinky on A, right pinky on the ; key. That is all eight home keys." },
    { name: "The home row", kind: "keys", count: 20, seconds: 60, keys: HOME, review: "", need: 4, tip: "All eight home keys, mixed up. Do not look down: the bumps on F and J tell you where you are." },
    { name: "Home row runs", kind: "keys", count: 18, seconds: 60, runs: true, need: 3, tip: "Short runs along the home row, one finger after another. Fingers stay home the whole time." },
    { name: "Home row words", kind: "words", count: 8, seconds: 60, list: "home", rate: 0.6, need: 4, tip: "Real words from the home row alone. Read the word, then type it one letter at a time." },
    { name: "G and H", kind: "keys", count: 15, seconds: 60, keys: "gh", review: HOME, need: 3, tip: "Pointer fingers slide one key in: left pointer to G, right pointer to H. Then back to F and J." },
    { name: "Home row words with G and H", kind: "words", count: 8, seconds: 60, list: "gh", rate: 0.6, need: 3, tip: "Words with G and H in them. Slide in, press, slide back home." },
    { name: "Home row check", kind: "keys", count: 25, seconds: 60, keys: ALL_HOME, review: "", need: 4, tip: "Prove the home row before the other rows: every home key, mixed up, no looking down." },
    { name: "E and I", kind: "keys", count: 15, seconds: 60, keys: "ei", review: ALL_HOME, need: 3, tip: "The top row. Middle fingers reach up: left middle to E, right middle to I. Then straight back home." },
    { name: "R and U", kind: "keys", count: 15, seconds: 60, keys: "ru", review: ALL_HOME + "ei", need: 3, tip: "Pointer fingers reach up: left pointer to R, right pointer to U. Back home after each one." },
    { name: "T and Y", kind: "keys", count: 15, seconds: 60, keys: "ty", review: ALL_HOME + "eiru", need: 3, tip: "Pointer fingers reach up and in: left pointer to T, right pointer to Y." },
    { name: "W and O", kind: "keys", count: 15, seconds: 60, keys: "wo", review: ALL_HOME + "eiruty", need: 3, tip: "Ring fingers reach up: left ring to W, right ring to O." },
    { name: "Q and P", kind: "keys", count: 15, seconds: 60, keys: "qp", review: ALL_HOME + "eirutywo", need: 3, tip: "Pinkies reach up: left pinky to Q, right pinky to P. Go slow: pinkies are the weakest fingers." },
    { name: "Top row check", kind: "keys", count: 20, seconds: 60, keys: TOP, review: ALL_HOME, need: 3, tip: "The whole top row, mixed with the home row. Reach up, press, come back home." },
    { name: "Home and top row words", kind: "words", count: 8, seconds: 60, list: "top", rate: 0.7, need: 3, tip: "Words from the two rows you know. Your eyes stay on the screen." },
    { name: "V and M", kind: "keys", count: 15, seconds: 60, keys: "vm", review: ALL_HOME, need: 3, tip: "The bottom row. Pointer fingers reach down: left pointer to V, right pointer to M." },
    { name: "C and comma", kind: "keys", count: 15, seconds: 60, keys: "c,", review: ALL_HOME + "vm", need: 3, tip: "Middle fingers reach down: left middle to C, right middle to the comma key." },
    { name: "X and period", kind: "keys", count: 15, seconds: 60, keys: "x.", review: ALL_HOME + "vmc,", need: 3, tip: "Ring fingers reach down: left ring to X, right ring to the period key." },
    { name: "B and N", kind: "keys", count: 15, seconds: 60, keys: "bn", review: ALL_HOME + "vmc,x.", need: 3, tip: "Pointer fingers reach down and in: left pointer to B, right pointer to N." },
    { name: "Z", kind: "keys", count: 15, seconds: 60, keys: "z", review: ALL_HOME + "vmc,x.bn", need: 3, tip: "Left pinky reaches down to Z. The bottom row is the hardest. Go slow." },
    { name: "All the rows", kind: "keys", count: 25, seconds: 60, keys: TOP + "zxcvbnm,.", review: ALL_HOME, need: 3, tip: "Every row, mixed up. Each finger reaches from its home key and comes straight back." },
    { name: "Short words", kind: "words", count: 8, seconds: 60, min: 3, max: 4, rate: 0.8, need: 3, tip: "Whole words now. Read the word, then type it one letter at a time." },
    { name: "Longer words", kind: "words", count: 8, seconds: 60, min: 5, rate: 0.9, need: 3, tip: "Longer words. Keep your eyes on the screen, not on your hands." },
    { name: "Phrases", kind: "phrases", count: 4, seconds: 70, rate: 0.9, need: 3, tip: "Phrases: your thumb taps the space bar between words." },
    { name: "Sentences", kind: "sentences", count: 2, seconds: 80, rate: 1.0, need: 3, tip: "Sentences: hold Shift with the other hand's pinky for a capital, and finish with the period key." },
    { name: "Sentences, faster", kind: "sentences", count: 3, seconds: 90, rate: 1.2, need: 3, tip: "Three sentences. Steady beats fast." },
  ];
  const PASS = 0.9; // accuracy for a round to count toward the next stage
  const COUNTDOWN = 5; // seconds on the screen before a round starts
  const HOME_ROW = STAGES.findIndex((d) => d.name === "The home row"); // all eight home keys
  const stageIndex = (n) => Math.max(0, Math.min(STAGES.length - 1, n | 0));
  function stageDef(n) {
    return STAGES[stageIndex(n)];
  }
  function describe(n) {
    return "Stage " + (stageIndex(n) + 1) + ": " + stageDef(n).name;
  }
  /** Where a round leaves the player: a good round (PASS accuracy or better) counts toward the stage, and
      `need` of them move it up. The last stage repeats. */
  function progress(stage, passes, accuracy) {
    const i = stageIndex(stage);
    const need = STAGES[i].need;
    const good = accuracy >= PASS;
    const p = Math.min(need, Math.max(0, passes | 0) + (good ? 1 : 0));
    if (good && p >= need && i < STAGES.length - 1) return { stage: i + 1, passes: 0, good, up: true, need: STAGES[i + 1].need };
    return { stage: i, passes: p, good, up: false, need };
  }
  /** A save from before these stages (9 of them, one round each): anyone past the first stage goes back to
      the eight-key home row stage, so the home row is proven before the other rows. */
  function migrate(oldStage) {
    return (oldStage | 0) >= 1 ? HOME_ROW : 0;
  }

  function pools() {
    let ty = {};
    try {
      const t = ZSR.text && ZSR.text();
      ty = (t && t.typing) || {};
    } catch (e) {
      ty = {};
    }
    const pick = (k, min) => (Array.isArray(ty[k]) && ty[k].length >= (min || 1) ? ty[k] : FALLBACK[k]);
    return { fingers: pick("fingers"), words: pick("words", 8), phrases: pick("phrases", 4), sentences: pick("sentences", 3) };
  }
  /** n single keys: every new key twice (once when there are too many to fit twice), the rest about two in
      three from the new keys and one in three from the keys already learned, shuffled so no key comes three
      times running. */
  function keyDrill(fresh, review, n) {
    const pick = (pool) => pool[Math.floor(Math.random() * pool.length)];
    const out = (fresh + fresh).split("").slice(0, n);
    while (out.length < n) out.push(pick(review && Math.random() < 0.35 ? review : fresh));
    const triple = (a) => a.some((k, i) => i >= 2 && k === a[i - 1] && k === a[i - 2]);
    let best = shuffle(out);
    for (let tries = 0; tries < 40 && triple(best); tries++) best = shuffle(out);
    return best;
  }
  function shuffle(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = b[i];
      b[i] = b[j];
      b[j] = t;
    }
    return b;
  }
  /** n items without repeats; the pool is reshuffled only when it runs dry. */
  function take(pool, n) {
    const out = [];
    while (out.length < n && pool.length) shuffle(pool).some((x) => out.push(x) >= n);
    return out;
  }
  function targets(def) {
    const P = pools();
    const clean = (arr) => arr.map((s) => String(s).trim()).filter(Boolean);
    if (def.kind === "keys") return def.runs ? take(RUNS, Math.ceil(def.count / 3)).slice(0, Math.ceil(def.count / 3)) : keyDrill(def.keys, def.review, def.count);
    if (def.kind === "words" && def.list) {
      if (def.list === "home") return take(HOME_WORDS, def.count);
      if (def.list === "gh") return take(GH_WORDS.concat(HOME_WORDS.slice(0, 6)), def.count); // mostly G and H words
      // home and top rows: the level's own words that fit, topped up with the built-in ones
      const ok = (w) => /^[a-z]+$/.test(w) && w.length <= 7 && w.split("").every((c) => (ALL_HOME + TOP).indexOf(c) >= 0);
      const fit = clean(P.words).filter(ok);
      return take(fit.concat(TOP_WORDS.filter((w) => fit.indexOf(w) < 0)), def.count);
    }
    if (def.kind === "words") {
      // The length rule wins over the level's pool: top up from the built-in words
      // (23 short, 17 long) when the content lacks words of that length.
      const rule = (w) => w.length >= (def.min || 0) && w.length <= (def.max || 99);
      const all = clean(P.words);
      let fit = all.filter(rule);
      if (fit.length < def.count) fit = fit.concat(FALLBACK.words.filter((w) => rule(w) && fit.indexOf(w) < 0));
      return take(fit.length ? fit : all, def.count);
    }
    return take(clean(P[def.kind]), def.count);
  }

  function fingerName(k) {
    const f = FINGER[k];
    return f ? (/pinky|thumb/.test(f) ? f : f + " finger") : "";
  }
  /** The key to press for a character, and whether Shift is needed. */
  function keyFor(ch) {
    if (/[A-Z]/.test(ch)) return { base: ch.toLowerCase(), shift: true };
    if (SHIFTED[ch]) return { base: SHIFTED[ch], shift: true };
    return { base: ch, shift: false };
  }
  function hint(ch) {
    if (ch === " ") return "right thumb (space bar)";
    const k = keyFor(ch);
    const f = fingerName(k.base) || "either hand";
    if (!k.shift) return f;
    const other = (FINGER[k.base] || "right").indexOf("left") === 0 ? "right" : "left";
    return f + " + Shift (" + other + " pinky)";
  }
  /** Exact match: a wrong-case letter (Caps Lock, a held Shift) is a mistake. */
  function matches(typed, want) {
    return typed === want;
  }

  /* ---------- DOM ---------- */
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function button(cls, label, onClick) {
    const b = el("button", "btn " + cls, label);
    b.type = "button";
    b.addEventListener("click", () => {
      ZSR.Audio && ZSR.Audio.play("click");
      onClick();
    });
    return b;
  }
  function buildKbd(container) {
    container.innerHTML = "";
    const key = (k, label, cls) => {
      const d = el("span", "kbd-key f-" + (FINGER[k] || "right pinky").split(" ")[1] + (cls ? " " + cls : ""));
      d.dataset.key = k;
      d.textContent = label == null ? k : label;
      return d;
    };
    ROWS.forEach((keys, i) => {
      const row = el("div", "kbd-row r" + (i + 1));
      if (i === 2) row.appendChild(key("ShiftLeft", "Shift", "shift f-pinky"));
      keys.split("").forEach((k) => row.appendChild(key(k, k, (k === "f" || k === "j" ? "bump" : "") + (HOME.indexOf(k) >= 0 ? " homekey" : ""))));
      if (i === 2) row.appendChild(key("ShiftRight", "Shift", "shift r f-pinky"));
      container.appendChild(row);
    });
    const r4 = el("div", "kbd-row r4");
    r4.appendChild(key(" ", "space", "space"));
    container.appendChild(r4);
  }
  function legend() {
    const L = el("div", "kbd-legend");
    const colors = { pinky: "#d7b9e3", ring: "#b6d0ea", middle: "#bfe0b2", pointer: "#f3d98c", thumb: "#efc5b2" };
    [["left pinky", "q a z"], ["left ring", "w s x"], ["left middle", "e d c"], ["left pointer", "r f v t g b"], ["right pointer", "y h n u j m"], ["right middle", "i k ,"], ["right ring", "o l ."], ["right pinky", "p ; /"], ["thumbs", "space"]].forEach(([f, keys]) => {
      L.appendChild(el("span", null, '<i style="background:' + colors[f.split(" ")[1] || "thumb"] + '"></i><b>' + esc(f) + "</b> " + esc(keys)));
    });
    return L;
  }
  function highlight(kbd, ch, homeToo) {
    kbd.querySelectorAll(".kbd-key").forEach((k) => {
      k.classList.remove("target", "flash");
      k.classList.toggle("home", !!homeToo && k.classList.contains("homekey"));
    });
    if (ch == null) return;
    const k = keyFor(ch);
    const base = kbd.querySelector('.kbd-key[data-key="' + k.base.replace(/"/g, '\\"') + '"]');
    if (base) base.classList.add("target");
    if (k.shift) {
      const side = (FINGER[k.base] || "right").indexOf("left") === 0 ? "ShiftRight" : "ShiftLeft";
      const s = kbd.querySelector('.kbd-key[data-key="' + side + '"]');
      if (s) s.classList.add("target");
    }
  }

  /* ---------- The overlay ---------- */
  const S = { built: false, open: false, pending: null, view: null, opts: {}, items: [], idx: 0, pos: 0, correct: 0, wrong: 0, left: 0, elapsed: 0, count: 0, paused: false, succeeded: false, timer: null, last: 0, guideFrom: null, capsWarn: false, flashT: null, returnFocus: null };
  const D = {}; // DOM refs

  function build() {
    if (S.built || !document.body) return;
    const app = document.getElementById("app") || document.body;
    const sec = el("section", "screen hidden overlay bench");
    sec.id = "screen-bench";
    sec.setAttribute("role", "dialog");
    sec.setAttribute("aria-modal", "true");
    sec.setAttribute("aria-labelledby", "bench-title");
    const canvas = el("canvas");
    canvas.id = "bench-canvas";
    canvas.setAttribute("aria-hidden", "true");
    sec.appendChild(canvas);
    const panel = el("div", "panel bench-panel");
    panel.tabIndex = -1; // takes focus on open so Enter/Tab never reach the screen underneath
    panel.appendChild(el("div", "caption", "Workbench"));
    const head = el("div", "bench-head");
    D.title = el("h2", "bench-title", "Build");
    D.title.id = "bench-title";
    D.stage = el("span", "bench-stage", "Stage 0");
    D.cost = el("p", "bench-cost", "");
    head.appendChild(D.title);
    head.appendChild(D.stage);
    head.appendChild(D.cost);
    panel.appendChild(head);

    // lesson
    const lesson = el("div", "bench-view bench-lesson hidden");
    lesson.id = "bench-lesson";
    lesson.appendChild(el("h3", null, "Where your fingers go"));
    D.lessonText = el("div", "reading");
    lesson.appendChild(D.lessonText);
    D.lessonKbd = el("div", "kbd");
    buildKbd(D.lessonKbd);
    highlight(D.lessonKbd, null, true);
    const side = el("div", "bench-side");
    side.appendChild(D.lessonKbd);
    side.appendChild(legend());
    lesson.appendChild(side);
    const lrow = el("div", "bench-actions");
    D.btnStart = button("big go", "Start", () => {
      if (S.guideFrom) return resumeFromGuide();
      if (typeof S.opts.onLessonDone === "function") S.opts.onLessonDone(); // the lesson counts as read once it is dismissed
      startRound();
    });
    D.btnStart.id = "bench-start";
    lrow.appendChild(D.btnStart);
    lrow.appendChild(button("alt", "Leave the bench", () => leave(false)));
    lesson.appendChild(lrow);
    panel.appendChild(lesson);

    // round
    const round = el("div", "bench-view bench-round hidden");
    round.id = "bench-round";
    D.tip = el("p", "bench-tip", "");
    round.appendChild(D.tip);
    const timer = el("div", "bench-timer");
    const bar = el("div", "bar");
    D.fill = el("div", "bar-fill");
    bar.appendChild(D.fill);
    timer.appendChild(bar);
    D.secs = el("span", "bench-secs", "60");
    D.secs.id = "bench-secs";
    timer.appendChild(D.secs);
    round.appendChild(timer);
    const prompt = el("div", "bench-prompt");
    prompt.setAttribute("aria-live", "polite");
    D.key = el("div", "bench-key", "f");
    D.key.id = "bench-key";
    D.key.addEventListener("animationend", () => D.key.classList.remove("flash"));
    D.run = el("div", "bench-run", "");
    D.text = el("div", "bench-text", "");
    D.text.id = "bench-text";
    prompt.appendChild(D.key);
    prompt.appendChild(D.run);
    prompt.appendChild(D.text);
    // the countdown before every round covers the prompt: five seconds to put the fingers home
    D.count = el("div", "bench-count hidden");
    D.count.id = "bench-count";
    D.count.appendChild(el("span", "l", "Get ready"));
    D.countN = el("span", "n", "5");
    D.count.appendChild(D.countN);
    D.count.appendChild(el("span", "l", "Fingers on the home row"));
    prompt.appendChild(D.count);
    round.appendChild(prompt);
    D.finger = el("div", "bench-finger", "");
    D.finger.id = "bench-finger";
    round.appendChild(D.finger);
    D.kbd = el("div", "kbd");
    D.kbd.id = "bench-kbd";
    buildKbd(D.kbd);
    round.appendChild(D.kbd);
    D.meta = el("div", "bench-meta", "");
    D.meta.id = "bench-meta";
    round.appendChild(D.meta);
    const rrow = el("div", "bench-actions");
    D.btnGuide = button("alt small", "Finger guide", showGuide);
    rrow.appendChild(D.btnGuide);
    rrow.appendChild(button("alt small", "Leave the bench", () => leave(false)));
    round.appendChild(rrow);
    panel.appendChild(round);

    // out of time
    const out = el("div", "bench-view bench-card hidden");
    out.id = "bench-timeout";
    out.appendChild(el("h3", null, "Out of time"));
    D.outText = el("p", null, "");
    out.appendChild(D.outText);
    const orow = el("div", "btn-row");
    const retry = button("big go", "Try again", startRound);
    retry.id = "bench-retry";
    orow.appendChild(retry);
    orow.appendChild(button("alt", "Leave the bench", () => leave(false)));
    out.appendChild(orow);
    panel.appendChild(out);

    // done
    const done = el("div", "bench-view bench-card ok hidden");
    done.id = "bench-done";
    D.doneTitle = el("h3", null, "Built!");
    done.appendChild(D.doneTitle);
    D.doneStats = el("div", "stats");
    done.appendChild(D.doneStats);
    D.next = el("p", "next", "");
    done.appendChild(D.next);
    D.nextWhy = el("p", "next-why", "");
    done.appendChild(D.nextWhy);
    const drow = el("div", "btn-row");
    const dbtn = button("big go", "Done", () => leave(true));
    dbtn.id = "bench-done-btn";
    drow.appendChild(dbtn);
    done.appendChild(drow);
    panel.appendChild(done);

    sec.appendChild(panel);
    app.appendChild(sec);
    D.sec = sec;
    D.canvas = canvas;
    D.panel = panel;
    D.views = { lesson, round, timeout: out, done };
    S.built = true;
    if (S.pending) {
      // open() was called before the DOM was ready: honor it now
      const o = S.pending;
      S.pending = null;
      Typing.open(o);
    }
  }

  function show(view) {
    S.view = view;
    Object.keys(D.views).forEach((k) => D.views[k].classList.toggle("hidden", k !== view));
    D.panel.classList.toggle("lesson-wide", view === "lesson");
    D.panel.scrollTop = 0;
  }
  function sizeCanvas() {
    if (!S.open) return;
    const dpr = Math.min(2, root.devicePixelRatio || 1);
    const w = D.sec.clientWidth || root.innerWidth;
    const h = D.sec.clientHeight || root.innerHeight;
    D.canvas.width = Math.round(w * dpr);
    D.canvas.height = Math.round(h * dpr);
    if (ZSR.Bench) ZSR.Bench.draw(D.canvas, { upgrades: S.opts.upgrades, dpr });
  }

  /* ---------- Rounds ---------- */
  function current() {
    return S.items[S.idx] || "";
  }
  function startRound() {
    const def = S.def;
    S.items = targets(def);
    if (!S.items.length) S.items = ["f"];
    S.idx = 0;
    S.pos = 0;
    S.correct = 0;
    S.wrong = 0;
    // the clock follows what was drawn: at least the stage's seconds, more for a long draw at the stage's
    // pace (a beginner's 0.6 keys a second, up to about 14 words a minute for the last sentences), so
    // long sentences at high reading levels never wall a player off
    const chars = S.items.reduce((a, s) => a + s.length, 0);
    const budget = Math.max(def.seconds, Math.ceil(chars / (def.rate || 0.6)));
    S.left = S.opts._seconds > 0 ? S.opts._seconds : budget;
    S.total = S.left;
    S.elapsed = 0;
    S.paused = false;
    S.guideFrom = null;
    S.capsWarn = false;
    S.count = S.opts._countdown != null ? S.opts._countdown : COUNTDOWN;
    S.last = performance.now();
    D.tip.textContent = def.tip || "";
    D.views.round.classList.toggle("mode-keys", def.kind === "keys");
    D.key.classList.toggle("hidden", def.kind !== "keys");
    D.run.classList.toggle("hidden", !def.runs);
    D.text.classList.toggle("hidden", def.kind === "keys");
    show("round");
    renderTarget();
    renderTimer();
    D.countN.textContent = ""; // every number of a fresh countdown ticks
    renderCount();
    if (!S.timer) S.timer = setInterval(tick, 50);
  }
  /** The countdown over the prompt; while it runs the keyboard shows the home keys, not the first target. */
  function renderCount() {
    const on = S.count > 0;
    D.count.classList.toggle("hidden", !on);
    if (!on) return;
    const n = String(Math.ceil(S.count));
    if (D.countN.textContent !== n) {
      D.countN.textContent = n;
      ZSR.Audio && ZSR.Audio.play("click");
    }
    D.finger.innerHTML = '<span class="muted">Ready: </span>fingers on A S D F and J K L ;';
    highlight(D.kbd, null, true);
  }
  function renderTarget() {
    const item = current();
    const ch = item[S.pos];
    D.key.classList.remove("flash");
    if (S.def.kind === "keys") {
      D.key.textContent = ch === " " ? "space" : ch;
      D.key.classList.toggle("space", ch === " ");
      if (S.def.runs) D.run.innerHTML = item.split("").map((c, i) => (i === S.pos ? "<b>" + esc(c) + "</b>" : esc(c))).join(" ");
    } else {
      D.text.innerHTML = '<span class="t-done">' + esc(item.slice(0, S.pos)) + '</span><span class="t-next">' + esc(ch) + '</span><span class="t-rest">' + esc(item.slice(S.pos + 1)) + "</span>";
    }
    D.finger.innerHTML = '<span class="muted">Use: </span>' + esc(hint(ch)) + (S.capsWarn ? ' <span class="caps" id="bench-caps">Caps Lock is on</span>' : "");
    highlight(D.kbd, ch, false);
    const total = S.items.reduce((a, s) => a + s.length, 0);
    const done = S.items.slice(0, S.idx).reduce((a, s) => a + s.length, 0) + S.pos;
    const unit = S.def.kind === "keys" ? "Key" : S.def.kind === "words" ? "Word" : S.def.kind === "phrases" ? "Phrase" : "Sentence";
    // 1-based "current item" in every mode: Key 1 / 10, Word 1 / 6
    const prog = S.def.kind === "keys" ? Math.min(done + 1, total) + " / " + total : S.idx + 1 + " / " + S.items.length;
    D.meta.innerHTML = unit + " <b>" + prog + "</b> · Mistakes <b id='bench-wrong'>" + S.wrong + "</b> · Accuracy <b id='bench-acc'>" + Math.round(accuracy() * 100) + "%</b>";
  }
  function renderTimer() {
    const k = Math.max(0, S.left / S.total);
    D.fill.style.width = k * 100 + "%";
    D.fill.classList.toggle("low", k < 0.25);
    D.secs.textContent = String(Math.ceil(Math.max(0, S.left)));
  }
  function accuracy() {
    const n = S.correct + S.wrong;
    return n ? S.correct / n : 1;
  }
  function tick() {
    if (!S.open || S.view !== "round") return;
    const now = performance.now();
    const dt = ((now - S.last) / 1000) * (Typing._timeScale || 1);
    S.last = now;
    if (S.paused || document.hidden || !S.focused) return;
    if (S.count > 0) {
      // the round's clock waits for the countdown
      S.count = Math.max(0, S.count - dt);
      renderCount();
      if (S.count === 0) renderTarget();
      return;
    }
    S.left -= dt;
    S.elapsed += dt;
    renderTimer();
    if (S.left <= 0) {
      S.left = 0;
      D.outText.textContent = "You typed " + S.correct + " right and " + S.wrong + " wrong. Nothing was spent. Same stage, new targets.";
      show("timeout");
    }
  }
  /** Flash the visible target red for a moment. The next key re-renders it; a
      timer clears it too, because animationend never fires under reduced motion. */
  function flash() {
    [S.def.kind === "keys" ? D.key : D.text.querySelector(".t-next")].concat(Array.from(D.kbd.querySelectorAll(".kbd-key.target"))).forEach((n) => {
      if (n) n.classList.add("flash");
    });
    clearTimeout(S.flashT);
    S.flashT = setTimeout(unflash, 300);
  }
  function unflash() {
    S.flashT = null;
    if (S.built) D.sec.querySelectorAll(".flash").forEach((n) => n.classList.remove("flash"));
  }
  /** Everything focusable inside the panel's visible view, in DOM order. */
  function focusables() {
    return Array.from(D.panel.querySelectorAll("button, [href], input, select, textarea, [tabindex]")).filter((n) => !n.disabled && n.tabIndex >= 0 && n.offsetParent !== null);
  }
  /** Keep Tab inside the overlay: the screen underneath must not get focus. */
  function trapTab(e) {
    const list = focusables();
    const i = list.indexOf(document.activeElement);
    let to = null;
    if (!list.length) to = D.panel;
    else if (i < 0) to = list[e.shiftKey ? list.length - 1 : 0];
    else if (!e.shiftKey && i === list.length - 1) to = list[0];
    else if (e.shiftKey && i === 0) to = list[list.length - 1];
    if (to) {
      e.preventDefault();
      to.focus();
    }
    e.stopPropagation();
  }
  function onKey(e) {
    if (!S.open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      leave(S.view === "done");
      return;
    }
    if (e.key === "Tab") return trapTab(e);
    if (e.key === "Enter") {
      // Enter activates a focused button inside the panel; anywhere else it must
      // not reach the screen underneath (the button that opened the bench).
      const a = document.activeElement;
      if (!(a && a !== D.panel && D.panel.contains(a))) {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }
    if (S.view !== "round" || S.paused || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (typeof k !== "string" || k.length !== 1) return; // Shift, arrows and friends: never a mistake
    e.preventDefault(); // Space would scroll the panel; "/" opens quick find in some browsers
    e.stopPropagation();
    if (e.repeat || S.count > 0) return; // keys during the countdown are never mistakes
    const item = current();
    const want = item[S.pos];
    if (!matches(k, want)) {
      S.wrong += 1;
      S.capsWarn = !!(typeof e.getModifierState === "function" && e.getModifierState("CapsLock"));
      ZSR.Audio && ZSR.Audio.play("wrong");
      renderTarget();
      flash();
      return;
    }
    S.capsWarn = false;
    S.correct += 1;
    S.pos += 1;
    ZSR.Audio && ZSR.Audio.play("click");
    if (S.pos >= item.length) {
      S.idx += 1;
      S.pos = 0;
      ZSR.Audio && ZSR.Audio.play("correct");
      if (S.idx >= S.items.length) return finish();
    }
    renderTarget();
  }
  function finish() {
    const result = { stage: stageIndex(S.opts.stage), seconds: Math.round(S.elapsed * 10) / 10, accuracy: Math.round(accuracy() * 1000) / 1000, chars: S.correct };
    const pr = progress(result.stage, S.opts.passes, result.accuracy);
    result.progress = pr;
    S.result = result;
    show("done");
    D.doneTitle.textContent = S.opts.practice ? "Good practice!" : "Built!";
    D.doneStats.innerHTML = "";
    [[result.seconds + "s", "time"], [Math.round(result.accuracy * 100) + "%", "accuracy"], [S.wrong, "mistakes"], [result.chars, "keys"]].forEach(([v, l]) => D.doneStats.appendChild(el("div", "stat", '<span class="v">' + esc(v) + '</span><span class="l">' + l + "</span>")));
    D.stage.textContent = describe(pr.stage) + " · " + pr.passes + "/" + pr.need;
    const left = pr.need - pr.passes;
    const more = left + " more good round" + (left === 1 ? "" : "s");
    if (pr.up) {
      D.next.textContent = "Stage up! Next: " + describe(pr.stage);
      D.nextWhy.textContent = "That stage is learned. The next one needs " + pr.need + " good rounds (" + Math.round(PASS * 100) + "% or better).";
    } else if (pr.good) {
      D.next.textContent = "Good round: " + pr.passes + " of " + pr.need + " for " + describe(pr.stage);
      D.nextWhy.textContent = left > 0 ? more + " (" + Math.round(PASS * 100) + "% or better) and you move up." : "This is the last stage. Keep it steady.";
    } else {
      D.next.textContent = "Under " + Math.round(PASS * 100) + "%: this round does not count";
      D.nextWhy.textContent = "Slow down and keep your fingers home. " + describe(pr.stage) + " still needs " + more + ".";
    }
    if (!S.succeeded) {
      S.succeeded = true;
      if (typeof S.opts.onSuccess === "function") S.opts.onSuccess(result);
      sizeCanvas(); // a fresh paint job shows on the van right away
    }
  }
  function showGuide() {
    S.guideFrom = "round";
    S.paused = true;
    D.btnStart.textContent = "Back to the bench";
    show("lesson");
  }
  function resumeFromGuide() {
    S.guideFrom = null;
    S.paused = false;
    S.last = performance.now();
    show("round");
  }
  /** Close and report back exactly once per open(); a second call is a no-op. */
  function leave(succeeded) {
    if (!S.open) return;
    const cb = S.opts.onClose;
    Typing.close();
    if (typeof cb === "function") cb(!!succeeded);
  }

  /* ---------- Window listeners ---------- */
  const onBlur = () => (S.focused = false);
  const onFocus = () => {
    S.focused = true;
    S.last = performance.now();
  };
  const onVis = () => {
    S.last = performance.now();
  };
  function listen(on) {
    const m = on ? "addEventListener" : "removeEventListener";
    root[m]("keydown", onKey, true);
    root[m]("blur", onBlur);
    root[m]("focus", onFocus);
    root[m]("resize", sizeCanvas);
    document[m]("visibilitychange", onVis);
  }

  const Typing = {
    STAGES,
    PASS,
    COUNTDOWN,
    stageDef,
    describe,
    progress,
    migrate,
    drill: (def) => keyDrill(def.keys, def.review, def.count), // the validator draws rounds with these
    wordList: (name) => (name === "home" ? HOME_WORDS : name === "gh" ? GH_WORDS.concat(HOME_WORDS) : TOP_WORDS),
    _timeScale: 1,
    init() {
      if (S.built) return;
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build, { once: true });
      else build();
    },
    open(opts) {
      this.init();
      if (!S.built) {
        // DOM not ready yet: build() opens this once DOMContentLoaded has fired.
        const prev = S.pending;
        S.pending = opts || {};
        if (prev && typeof prev.onClose === "function") prev.onClose(false);
        return;
      }
      if (S.open) leave(false); // the earlier open still gets its onClose(false)
      const active = document.activeElement;
      S.returnFocus = active && active !== document.body && !D.sec.contains(active) ? active : null;
      S.opts = opts || {};
      S.def = stageDef(S.opts.stage);
      S.open = true;
      S.succeeded = false;
      S.result = null;
      S.capsWarn = false;
      S.focused = typeof document.hasFocus === "function" ? document.hasFocus() : true;
      D.title.textContent = S.opts.title || "Build";
      const need = stageDef(S.opts.stage).need;
      D.stage.textContent = describe(S.opts.stage) + " · " + Math.min(need, S.opts.passes | 0) + "/" + need;
      D.stage.title = "Good rounds at this stage (" + Math.round(PASS * 100) + "% accuracy or better). " + need + " move you up.";
      D.cost.innerHTML = S.opts.practice ? "Practice: nothing is built or spent, and a good round counts toward the next stage." : S.opts.cost ? "<strong>" + esc(S.opts.cost) + "</strong> spent when you finish." : "Nothing is spent until you finish.";
      D.lessonText.innerHTML = pools().fingers.map((p) => "<p>" + esc(p) + "</p>").join("");
      D.btnStart.textContent = "Start";
      D.sec.classList.remove("hidden");
      listen(true);
      sizeCanvas();
      if (S.opts.tutorialSeen) startRound();
      else {
        S.guideFrom = null;
        show("lesson");
      }
      // Focus moves off the button that opened the bench, so Enter cannot click it again.
      if (active && typeof active.blur === "function" && active !== document.body) active.blur();
      try {
        D.panel.focus({ preventScroll: true });
      } catch (e) {
        D.panel.focus();
      }
    },
    close() {
      if (!S.built) {
        S.pending = null;
        return;
      }
      listen(false);
      if (S.timer) clearInterval(S.timer);
      S.timer = null;
      clearTimeout(S.flashT);
      S.flashT = null;
      S.open = false;
      S.view = null;
      S.paused = false;
      D.sec.classList.add("hidden");
      // Give focus back to the opener, unless the player has moved it elsewhere meanwhile.
      const rf = S.returnFocus;
      S.returnFocus = null;
      const a = document.activeElement;
      if (rf && rf.isConnected && typeof rf.focus === "function" && (!a || a === document.body || D.sec.contains(a))) {
        try {
          rf.focus({ preventScroll: true });
        } catch (e) {
          /* focus can throw on detached nodes in old engines; nothing to do */
        }
      }
    },
    isOpen() {
      return !!(S.open || S.pending);
    },
  };

  ZSR.Typing = Typing;
})(typeof globalThis !== "undefined" ? globalThis : this);
