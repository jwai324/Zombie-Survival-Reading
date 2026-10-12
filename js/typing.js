/* The workbench typing game. Every build action goes through a short, timed
   typing round; nothing is spent until the round is finished (the caller
   spends in onSuccess). The first time, a lesson explains touch-typing
   finger placement. Each finished round advances the player's stage.
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
  const RUNS = ["fjf", "dkd", "sls", "a;a", "jfj", "kdk", "lsl", ";a;", "fdf", "jkj", "sas", "l;l"];

  const STAGES = [
    { name: "Home row", kind: "keys", count: 10, seconds: 60, pool: "asdfjkl;", tip: "Rest your fingers on A S D F and J K L ;. Press the key shown, then come back home." },
    { name: "Home row runs", kind: "keys", count: 12, seconds: 60, runs: true, tip: "Short runs along the home row: one finger at a time, left hand and right hand." },
    { name: "Reach up", kind: "keys", count: 10, seconds: 60, pool: "qwertyuiop", tip: "Reach up one row with the finger that owns the key, press, and come straight back home." },
    { name: "Reach down", kind: "keys", count: 10, seconds: 60, pool: "zxcvbnm,.", tip: "Reach down one row. The bottom row is the hardest. Go slow." },
    { name: "Short words", kind: "words", count: 6, seconds: 60, min: 3, max: 4, tip: "Whole words now. Read the word, then type it one letter at a time." },
    { name: "Longer words", kind: "words", count: 6, seconds: 60, min: 5, tip: "Longer words. Keep your eyes on the screen, not on your hands." },
    { name: "Phrases", kind: "phrases", count: 4, seconds: 70, tip: "Phrases: your thumb taps the space bar between words." },
    { name: "Sentences", kind: "sentences", count: 2, seconds: 80, tip: "Sentences: hold Shift with the other hand's pinky for a capital, and finish with the period key." },
    { name: "Sentences, faster", kind: "sentences", count: 3, seconds: 90, tip: "Three sentences, a little less time each stage. Steady beats fast." },
  ];
  function stageDef(n) {
    const i = Math.max(0, n | 0);
    const d = STAGES[Math.min(i, STAGES.length - 1)];
    return i < STAGES.length - 1 ? d : Object.assign({}, d, { seconds: Math.max(60, 90 - (i - 8) * 4) });
  }
  function describe(n) {
    return "Stage " + Math.max(0, n | 0) + ": " + stageDef(n).name;
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
    if (def.kind === "keys") return def.runs ? take(RUNS, Math.ceil(def.count / 3)).slice(0, Math.ceil(def.count / 3)) : take(def.pool.split(""), def.count);
    if (def.kind === "words") {
      const all = clean(P.words);
      const fit = all.filter((w) => w.length >= (def.min || 0) && w.length <= (def.max || 99));
      return take(fit.length >= def.count ? fit : all, def.count);
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
  function matches(typed, want) {
    return typed === want || (/[a-z]/.test(want) && typed.toLowerCase() === want);
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
  const S = { built: false, open: false, view: null, opts: {}, items: [], idx: 0, pos: 0, correct: 0, wrong: 0, left: 0, elapsed: 0, paused: false, succeeded: false, timer: null, last: 0, guideFrom: null };
  const D = {}; // DOM refs

  function build() {
    if (S.built || !document.body) return;
    const app = document.getElementById("app") || document.body;
    const sec = el("section", "screen hidden overlay bench");
    sec.id = "screen-bench";
    const canvas = el("canvas");
    canvas.id = "bench-canvas";
    canvas.setAttribute("aria-hidden", "true");
    sec.appendChild(canvas);
    const panel = el("div", "panel bench-panel");
    panel.appendChild(el("div", "caption", "Workbench"));
    const head = el("div", "bench-head");
    D.title = el("h2", "bench-title", "Build");
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
    D.btnStart = button("big go", "Start", () => (S.guideFrom ? resumeFromGuide() : startRound()));
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
    done.appendChild(el("h3", null, "Built!"));
    D.doneStats = el("div", "stats");
    done.appendChild(D.doneStats);
    D.next = el("p", "next", "");
    done.appendChild(D.next);
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
    S.left = S.opts._seconds > 0 ? S.opts._seconds : def.seconds;
    S.total = S.left;
    S.elapsed = 0;
    S.paused = false;
    S.guideFrom = null;
    S.last = performance.now();
    D.tip.textContent = def.tip || "";
    D.views.round.classList.toggle("mode-keys", def.kind === "keys");
    D.key.classList.toggle("hidden", def.kind !== "keys");
    D.run.classList.toggle("hidden", !def.runs);
    D.text.classList.toggle("hidden", def.kind === "keys");
    show("round");
    renderTarget();
    renderTimer();
    if (!S.timer) S.timer = setInterval(tick, 50);
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
    D.finger.innerHTML = '<span class="muted">Use: </span>' + esc(hint(ch));
    highlight(D.kbd, ch, false);
    const total = S.items.reduce((a, s) => a + s.length, 0);
    const done = S.items.slice(0, S.idx).reduce((a, s) => a + s.length, 0) + S.pos;
    const unit = S.def.kind === "keys" ? "Key" : S.def.kind === "words" ? "Word" : S.def.kind === "phrases" ? "Phrase" : "Sentence";
    const prog = S.def.kind === "keys" ? done + " / " + total : S.idx + 1 + " / " + S.items.length;
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
    S.left -= dt;
    S.elapsed += dt;
    renderTimer();
    if (S.left <= 0) {
      S.left = 0;
      D.outText.textContent = "You typed " + S.correct + " right and " + S.wrong + " wrong. Nothing was spent. Same stage, new targets.";
      show("timeout");
    }
  }
  /** Flash the visible target red; renderTarget() clears it on the next key. */
  function flash() {
    [S.def.kind === "keys" ? D.key : D.text.querySelector(".t-next")].concat(Array.from(D.kbd.querySelectorAll(".kbd-key.target"))).forEach((n) => {
      if (n) n.classList.add("flash");
    });
  }
  function onKey(e) {
    if (!S.open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      leave(S.view === "done");
      return;
    }
    if (S.view !== "round" || S.paused || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (typeof k !== "string" || k.length !== 1) return; // Shift, Tab, Enter and friends: never a mistake
    e.preventDefault(); // Space would scroll the panel; "/" opens quick find in some browsers
    e.stopPropagation();
    if (e.repeat) return;
    const item = current();
    const want = item[S.pos];
    if (!matches(k, want)) {
      S.wrong += 1;
      ZSR.Audio && ZSR.Audio.play("wrong");
      renderTarget();
      flash();
      return;
    }
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
    const result = { stage: S.opts.stage | 0, seconds: Math.round(S.elapsed * 10) / 10, accuracy: Math.round(accuracy() * 1000) / 1000, chars: S.correct };
    S.result = result;
    show("done");
    D.doneStats.innerHTML = "";
    [[result.seconds + "s", "time"], [Math.round(result.accuracy * 100) + "%", "accuracy"], [S.wrong, "mistakes"], [result.chars, "keys"]].forEach(([v, l]) => D.doneStats.appendChild(el("div", "stat", '<span class="v">' + esc(v) + '</span><span class="l">' + l + "</span>")));
    D.next.textContent = "Next: " + describe(result.stage + 1);
    if (!S.succeeded) {
      S.succeeded = true;
      if (typeof S.opts.onSuccess === "function") S.opts.onSuccess(result);
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
  function leave(succeeded) {
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
    stageDef,
    describe,
    _timeScale: 1,
    init() {
      if (S.built) return;
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build, { once: true });
      else build();
    },
    open(opts) {
      this.init();
      if (!S.built) return;
      if (S.open) this.close();
      S.opts = opts || {};
      S.def = stageDef(S.opts.stage);
      S.open = true;
      S.succeeded = false;
      S.result = null;
      S.focused = typeof document.hasFocus === "function" ? document.hasFocus() : true;
      D.title.textContent = S.opts.title || "Build";
      D.stage.textContent = describe(S.opts.stage);
      D.cost.innerHTML = S.opts.cost ? "<strong>" + esc(S.opts.cost) + "</strong> spent when you finish." : "Nothing is spent until you finish.";
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
    },
    close() {
      if (!S.built) return;
      listen(false);
      if (S.timer) clearInterval(S.timer);
      S.timer = null;
      S.open = false;
      S.view = null;
      S.paused = false;
      D.sec.classList.add("hidden");
    },
    isOpen() {
      return !!S.open;
    },
  };

  ZSR.Typing = Typing;
})(typeof globalThis !== "undefined" ? globalThis : this);
