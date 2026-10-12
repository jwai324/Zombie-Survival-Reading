/* Safe haven: arrive, read, answer three questions, choose a route, upgrade.
   This is where most of the reading happens. Every step saves an exact
   bookmark so Continue returns to the same screen in the same state. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Upgrades = () => ZSR.Upgrades;
  const Audio = () => ZSR.Audio;

  const REWARD = { first: 30, second: 15, perfect: 20, sign: 15 };
  const LETTERS = ["A", "B", "C", "D"];
  const KIND_LABEL = { note: "Found note", letter: "Letter", log: "Radio log", map: "Map legend", diary: "Diary page", recipe: "Recipe", poster: "Poster", rules: "Posted rules", story: "Account", sign: "Sign", list: "Supply list", manual: "Instructions", warning: "Warning" };

  /** Initials for the host avatar ("Doc Lin" -> "DL", "Max and Mia" -> "MM", "Rook" -> "RO"). */
  function avatarFor(host) {
    const words = String(host || "?").replace(/[^A-Za-z ]/g, " ").split(/\s+/).filter((w) => w && !/^(and|the|of)$/i.test(w));
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    const w = words[0] || "?";
    return (w[0] + (w[1] || "")).toUpperCase();
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function paragraphs(text) {
    return String(text)
      .split(/\n\s*\n/)
      .map((p) => "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>")
      .join("");
  }
  function wordCount(text) {
    return String(text).trim().split(/\s+/).filter(Boolean).length;
  }
  function effectTags(effects) {
    const e = effects || {};
    const tags = [];
    if (e.zombies >= 1.15) tags.push(["More walkers", "risk"]);
    if (e.zombies && e.zombies <= 0.9) tags.push(["Fewer walkers", "safe"]);
    if (e.runners >= 1.2) tags.push(["Sprinters", "risk"]);
    if (e.brutes >= 1.2) tags.push(["Bruisers", "risk"]);
    if (e.length >= 1.1) tags.push(["Longer road", "risk"]);
    if (e.length && e.length <= 0.9) tags.push(["Shorter road", "safe"]);
    if (e.scrap > 0) tags.push(["+" + e.scrap + " scrap", "bonus"]);
    if (e.scrap < 0) tags.push([e.scrap + " scrap", "risk"]);
    if (e.hp > 0) tags.push(["+" + e.hp + " health", "bonus"]);
    if (e.hp < 0) tags.push([e.hp + " health", "risk"]);
    if (e.fog) tags.push(["Fog", "risk"]);
    if (e.night) tags.push(["Night drive", "risk"]);
    if (e.crates > 0) tags.push([e.crates + " supply crate" + (e.crates > 1 ? "s" : ""), "bonus"]);
    return tags;
  }

  const Haven = {
    body: null,
    caption: null,
    onDone: null,
    passage: null,
    step: null,
    qi: 0,
    earned: 0,
    correctHere: 0,
    bonus: false,
    attempts: {}, // per question index: { wrong: [optionIndex...], done: bool, reward: n }
    chosen: null, // route option index once chosen
    previewRaf: 0,

    /**
     * Begin a haven. With `resume` (the saved haven bookmark) the same passage
     * reopens at the same step with the same answers and purchases.
     */
    start(onDone, resume) {
      this.onDone = onDone;
      this.body = document.getElementById("haven-body");
      this.caption = document.getElementById("haven-caption");
      const saved = resume && State().havenById(resume.id) ? resume : null;
      if (saved) {
        this.passage = State().havenById(saved.id);
        this.qi = saved.qi || 0;
        this.earned = saved.earned || 0;
        this.correctHere = saved.correctHere || 0;
        this.bonus = !!saved.bonus;
        this.attempts = saved.attempts || {};
        this.chosen = saved.chosen == null ? null : saved.chosen;
      } else {
        this.passage = State().nextHaven();
        this.qi = 0;
        this.earned = 0;
        this.correctHere = 0;
        this.bonus = false;
        this.attempts = {};
        this.chosen = null;
        State().run.havens += 1;
      }
      this.caption.textContent = "Safe haven · " + this.passage.place + " · Level " + State().run.grade;
      this.goto(saved ? saved.step : "arrive");
    },

    goto(step) {
      if (step === "read") return this.read();
      if (step === "question") return this.qi < 3 ? this.question() : this.quizSummary();
      if (step === "summary") return this.quizSummary();
      if (step === "choice") return this.choice();
      if (step === "result") return this.chosen == null ? this.choice() : this.showResult();
      if (step === "garage") return this.garage();
      return this.arrive();
    },

    /** Persist the exact step so Continue lands back on it. */
    save(step) {
      this.step = step;
      State().saveProgress("haven", {
        haven: { id: this.passage.id, step, qi: this.qi, earned: this.earned, correctHere: this.correctHere, bonus: this.bonus, attempts: this.attempts, chosen: this.chosen },
      });
    },

    /** Stop anything the haven keeps running (the garage preview loop). */
    leave() {
      cancelAnimationFrame(this.previewRaf);
    },

    steps(current) {
      const names = ["READ", "ANSWER", "ROUTE", "GARAGE"];
      const wrap = el("div", "steps");
      names.forEach((n, i) => {
        const s = el("span", "step" + (i < current ? " done" : i === current ? " on" : ""), n);
        wrap.appendChild(s);
      });
      return wrap;
    },

    host(text) {
      const p = this.passage;
      const h = el("div", "host");
      h.appendChild(el("div", "avatar", avatarFor(p.host)));
      const b = el("div", "bubble");
      b.appendChild(el("span", "who", esc(p.host)));
      b.appendChild(document.createTextNode(text));
      h.appendChild(b);
      return h;
    },

    render(children) {
      cancelAnimationFrame(this.previewRaf);
      this.body.innerHTML = "";
      children.forEach((c) => c && this.body.appendChild(c));
      this.body.closest(".panel").scrollTop = 0;
    },

    /* 1. Arrive */
    arrive() {
      this.save("arrive");
      const p = this.passage;
      const btn = el("button", "btn big", "Read it");
      btn.addEventListener("click", () => {
        Audio().play("click");
        this.read();
      });
      const row = el("div", "btn-row");
      row.appendChild(btn);
      this.render([this.steps(0), el("h2", null, esc(p.place)), this.host(p.intro), row]);
    },

    /* 2. Read the passage */
    read() {
      this.save("read");
      const p = this.passage;
      const title = el("h2", "reading-title", esc(p.title) + '<span class="kind-badge">' + esc(KIND_LABEL[p.kind] || "Something to read") + "</span>");
      const paper = el("div", "paper lined reading", paragraphs(p.text));
      const btn = el("button", "btn big go", "Done reading");
      btn.addEventListener("click", () => {
        Audio().play("click");
        const wc = wordCount(p.text);
        State().run.wordsRead += wc;
        State().stats.wordsRead += wc;
        State().saveStats();
        this.question();
      });
      const row = el("div", "btn-row");
      row.appendChild(btn);
      this.render([this.steps(0), title, paper, row]);
    },

    /* 3. Questions, one at a time, with the text available */
    question() {
      const p = this.passage;
      const q = p.questions[this.qi];
      const run = State().run;
      const wide = root.innerWidth >= 760;
      const a = (this.attempts[this.qi] = this.attempts[this.qi] || { wrong: [], done: false, reward: 0 });
      this.save("question");

      const toggle = el("button", "btn small-btn alt text-toggle", wide ? "Hide the text" : "Show the text");
      const textBox = el("div", "collapsed-text" + (wide ? " open" : ""));
      textBox.appendChild(el("div", "paper lined reading", "<strong>" + esc(p.title) + "</strong><br>" + paragraphs(p.text)));
      toggle.addEventListener("click", () => {
        textBox.classList.toggle("open");
        toggle.textContent = textBox.classList.contains("open") ? "Hide the text" : "Show the text";
      });

      const qEl = el("p", "question", "Question " + (this.qi + 1) + " of 3: " + esc(q.q));
      const opts = el("div", "options");
      const feedback = el("div", "feedback hidden");
      const row = el("div", "btn-row");
      const next = el("button", "btn big hidden", this.qi < 2 ? "Next question" : "Results");
      row.appendChild(next);
      const buttons = [];

      const showHint = () => {
        feedback.className = "feedback bad";
        feedback.innerHTML = "Not quite. Hint: " + esc(q.hint) + " Try once more.";
      };
      const showSolved = () => {
        buttons.forEach((x) => (x.disabled = true));
        buttons[q.answer].classList.add("correct");
        if (a.reward > 0) {
          feedback.className = "feedback good";
          feedback.innerHTML = (a.wrong.length === 0 ? "Right. " : "That's it. ") + '<span class="scrap-pop">+' + a.reward + " scrap</span>";
        } else {
          feedback.className = "feedback bad";
          feedback.innerHTML = "The answer was <strong>" + esc(q.options[q.answer]) + "</strong>. It's in the text. Next one.";
        }
        next.classList.remove("hidden");
      };

      q.options.forEach((text, i) => {
        const b = el("button", "option", '<span class="letter">' + LETTERS[i] + "</span><span>" + esc(text) + "</span>");
        if (a.wrong.includes(i)) {
          b.classList.add("wrong");
          b.disabled = true;
        }
        b.addEventListener("click", () => {
          if (b.disabled || a.done) return;
          if (i === q.answer) {
            const reward = a.wrong.length === 0 ? REWARD.first : REWARD.second;
            a.done = true;
            a.reward = reward;
            b.classList.add("correct");
            run.scrap += reward;
            run.correct += a.wrong.length === 0 ? 1 : 0;
            run.answered += 1;
            State().stats.correct += a.wrong.length === 0 ? 1 : 0;
            State().stats.answered += 1;
            State().saveStats();
            this.earned += reward;
            if (a.wrong.length === 0) this.correctHere += 1;
            showSolved();
            Audio().play("correct");
          } else {
            a.wrong.push(i);
            b.classList.add("wrong");
            b.disabled = true;
            Audio().play("wrong");
            if (a.wrong.length === 1) showHint();
            else {
              a.done = true;
              a.reward = 0;
              run.answered += 1;
              State().stats.answered += 1;
              State().saveStats();
              showSolved();
            }
          }
          this.save("question");
        });
        buttons.push(b);
        opts.appendChild(b);
      });
      // restore the look of a question that was already worked on
      if (a.done) showSolved();
      else if (a.wrong.length === 1) showHint();

      next.addEventListener("click", () => {
        Audio().play("click");
        this.qi += 1;
        if (this.qi < 3) this.question();
        else {
          if (this.correctHere === 3 && !this.bonus) {
            this.bonus = true;
            run.scrap += REWARD.perfect;
            this.earned += REWARD.perfect;
          }
          this.quizSummary();
        }
      });
      this.render([this.steps(1), toggle, textBox, qEl, opts, feedback, row]);
    },

    quizSummary() {
      this.save("summary");
      const bonusLine = this.bonus ? '<p>Three for three on the first try. <span class="scrap-pop">+' + REWARD.perfect + " bonus scrap</span></p>" : "";
      const msg = this.correctHere === 3 ? "Clean read. Every answer, first try." : this.correctHere >= 1 ? "Good reading. We can use that." : "Rough one. The next stop goes better.";
      const box = el("div", "result-box", "<strong>" + msg + "</strong><br>You earned <strong>" + this.earned + " scrap</strong> at the " + esc(this.passage.place) + "." + bonusLine);
      const btn = el("button", "btn big go", "Choose the route");
      btn.addEventListener("click", () => {
        Audio().play("click");
        this.choice();
      });
      const row = el("div", "btn-row");
      row.appendChild(btn);
      this.render([this.steps(1), el("h2", null, this.correctHere + " of 3 on the first try"), this.host(msg), box, row]);
    },

    /* 4. Route choice */
    choice() {
      this.save("choice");
      const p = this.passage;
      const c = p.choice;
      const cards = el("div", "choices");
      c.options.forEach((o, idx) => {
        const card = el("button", "choice-card");
        card.appendChild(el("h3", null, esc(o.label)));
        card.appendChild(el("p", null, esc(o.desc)));
        card.addEventListener("click", () => {
          Audio().play("click");
          this.applyChoice(o, idx);
          this.showResult();
        });
        cards.appendChild(card);
      });
      this.render([this.steps(2), el("p", "question", esc(c.prompt)), cards]);
    },

    /** Apply a route's immediate effects once and queue the rest for the next road. */
    applyChoice(o, idx) {
      const run = State().run;
      const e = o.effects || {};
      const maxHp = Upgrades().stats(run.upgrades).maxHp;
      if (e.scrap) run.scrap = Math.max(0, run.scrap + e.scrap);
      if (e.hp) run.hp = Math.max(1, Math.min(maxHp, run.hp + e.hp));
      const mods = {};
      ["zombies", "runners", "brutes", "length", "fog", "night", "crates"].forEach((k) => {
        if (e[k] != null) mods[k] = e[k];
      });
      run.nextMods = mods;
      this.chosen = idx;
    },

    showResult() {
      this.save("result");
      const o = this.passage.choice.options[this.chosen];
      const e = o.effects || {};
      const box = el("div", "result-box", esc(o.result));
      const tags = el("div", "tags");
      effectTags(e).forEach(([t, cls]) => tags.appendChild(el("span", "tag " + cls, esc(t))));
      if (!tags.children.length) tags.appendChild(el("span", "tag", "Normal road"));
      box.appendChild(el("p", "small muted", "Next road:"));
      box.appendChild(tags);
      const btn = el("button", "btn big", "Go to the garage");
      btn.addEventListener("click", () => {
        Audio().play("click");
        this.garage();
      });
      const row = el("div", "btn-row");
      row.appendChild(btn);
      this.render([this.steps(2), el("h2", null, esc(o.label)), box, row]);
    },

    /* 5. Garage */
    garage() {
      this.save("garage");
      const run = State().run;
      const U = Upgrades();
      const stats = U.stats(run.upgrades);
      const head = el("div", "garage-head");
      head.appendChild(el("div", "scrap-wallet", "SCRAP: " + run.scrap));
      head.appendChild(el("span", "small muted", "Van health " + Math.round(run.hp) + " / " + stats.maxHp));
      const preview = el("canvas");
      preview.id = "garage-van";
      preview.width = 360;
      preview.height = 200;
      const groups = el("div", "upgrade-groups");
      const vanG = el("div", "upgrade-group");
      vanG.appendChild(el("h3", null, "The van"));
      const gunG = el("div", "upgrade-group");
      gunG.appendChild(el("h3", null, "The Gun"));

      const rerender = () => this.garage(); // re-saves, so purchases persist
      Object.keys(U.DEFS).forEach((key) => {
        const d = U.DEFS[key];
        const level = run.upgrades[key];
        const cost = U.cost(key, level);
        const card = el("div", "upgrade" + (cost == null ? " maxed" : ""));
        card.appendChild(el("div", "icon", d.icon));
        const mid = el("div");
        mid.appendChild(el("div", "name", esc(d.name) + (key === "paint" ? " <span class='small muted'>(" + esc(stats.look.name) + ")</span>" : "")));
        mid.appendChild(el("div", "desc", esc(d.desc)));
        const pips = el("div", "pips");
        for (let i = 0; i < d.max; i++) pips.appendChild(el("span", "pip" + (i < level ? " on" : "")));
        mid.appendChild(pips);
        card.appendChild(mid);
        const btn = el("button", "btn", cost == null ? "MAX" : cost + " scrap");
        btn.disabled = cost == null || run.scrap < cost;
        btn.addEventListener("click", () => {
          if (U.buy(run, key)) {
            Audio().play("buy");
            rerender();
          }
        });
        card.appendChild(btn);
        (d.group === "van" ? vanG : gunG).appendChild(card);
      });
      // repair kit
      const rep = el("div", "upgrade");
      rep.appendChild(el("div", "icon", U.REPAIR.icon));
      const rmid = el("div");
      rmid.appendChild(el("div", "name", esc(U.REPAIR.name)));
      rmid.appendChild(el("div", "desc", esc(U.REPAIR.desc) + " +" + U.REPAIR.heal + " health."));
      rep.appendChild(rmid);
      const rbtn = el("button", "btn", run.hp >= stats.maxHp ? "FULL" : U.REPAIR.cost + " scrap");
      rbtn.disabled = run.hp >= stats.maxHp || run.scrap < U.REPAIR.cost;
      rbtn.addEventListener("click", () => {
        if (U.repair(run)) {
          Audio().play("buy");
          rerender();
        }
      });
      rep.appendChild(rbtn);
      vanG.appendChild(rep);
      groups.appendChild(vanG);
      groups.appendChild(gunG);

      const go = el("button", "btn big go", "Roll out");
      go.addEventListener("click", () => {
        Audio().play("click");
        cancelAnimationFrame(this.previewRaf);
        // The next road starts fresh; the road itself autosaves from there.
        State().saveProgress("road", { road: null });
        if (this.onDone) this.onDone();
      });
      const row = el("div", "btn-row");
      row.appendChild(go);
      const tip = el("p", "small muted", "Ruby: \"Reading pays better than bullets. Bring more scrap.\"");

      this.render([this.steps(3), el("h2", null, "Ruby's garage"), head, preview, groups, tip, row]);

      const t0 = performance.now();
      const loop = () => {
        ZSR.Game.showcase(preview, run.upgrades, (performance.now() - t0) / 1000);
        this.previewRaf = requestAnimationFrame(loop);
      };
      loop();
    },

    /* ---------- Road sign pop-up (used mid-segment) ---------- */
    /**
     * Show a road sign. With `resume` ({ answered, picked }) the sign that was on
     * screen when the run was saved comes back in the same state.
     */
    sign(onContinue, resume) {
      const run = State().run;
      const s = resume ? State().currentSign() : State().nextSign();
      const st = resume ? { answered: !!resume.answered, picked: resume.picked == null ? null : resume.picked } : { answered: false, picked: null };
      const save = () => State().saveProgress("sign", { road: ZSR.Game.snapshot(), sign: st });
      save();

      document.getElementById("sign-caption").textContent = "On the road · Level " + run.grade;
      const textEl = document.getElementById("sign-text");
      const qEl = document.getElementById("sign-q");
      const opts = document.getElementById("sign-options");
      const fb = document.getElementById("sign-feedback");
      const cont = document.getElementById("btn-sign-continue");
      textEl.textContent = s.text;
      qEl.textContent = s.q;
      opts.innerHTML = "";
      fb.className = "feedback hidden";
      cont.classList.add("hidden");
      const buttons = [];

      const showAnswered = () => {
        buttons.forEach((x) => (x.disabled = true));
        buttons[s.answer].classList.add("correct");
        if (st.picked === s.answer) {
          fb.className = "feedback good";
          fb.innerHTML = 'Right. <span class="scrap-pop">+' + REWARD.sign + " scrap</span>";
        } else {
          if (st.picked != null && buttons[st.picked]) buttons[st.picked].classList.add("wrong");
          fb.className = "feedback bad";
          fb.innerHTML = "The answer was <strong>" + esc(s.options[s.answer]) + "</strong>.";
        }
        cont.classList.remove("hidden");
      };

      s.options.forEach((text, i) => {
        const b = el("button", "option", '<span class="letter">' + LETTERS[i] + "</span><span>" + esc(text) + "</span>");
        b.addEventListener("click", () => {
          if (st.answered) return;
          st.answered = true;
          st.picked = i;
          run.answered += 1;
          State().stats.answered += 1;
          if (i === s.answer) {
            run.scrap += REWARD.sign;
            run.correct += 1;
            State().stats.correct += 1;
            Audio().play("correct");
          } else Audio().play("wrong");
          State().saveStats();
          showAnswered();
          save();
        });
        buttons.push(b);
        opts.appendChild(b);
      });
      if (st.answered) showAnswered();

      cont.onclick = () => {
        Audio().play("click");
        onContinue();
      };
    },

    REWARD,
  };

  ZSR.Haven = Haven;
})(typeof globalThis !== "undefined" ? globalThis : this);
