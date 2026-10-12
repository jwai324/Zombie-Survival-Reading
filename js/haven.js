/* Safe haven: arrive, read, answer three questions, choose a route, upgrade.
   This is where most of the reading happens. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Upgrades = () => ZSR.Upgrades;
  const Audio = () => ZSR.Audio;
  const Speech = () => ZSR.Speech;

  const REWARD = { first: 30, second: 15, perfect: 20, sign: 15 };
  const LETTERS = ["A", "B", "C", "D"];
  const KIND_LABEL = { note: "A note", letter: "A letter", log: "A radio log", map: "A map legend", diary: "A diary page", recipe: "A recipe", poster: "A poster", rules: "The rules", story: "A story", sign: "A sign", list: "A list" };

  function avatarFor(host) {
    const h = (host || "").toLowerCase();
    if (h.includes("ruby")) return "\u{1F469}\u{200D}\u{1F527}";
    if (h.includes("doc") || h.includes("lin")) return "\u{1F469}\u{200D}\u{2695}\u{FE0F}";
    if (h.includes("biscuit")) return "\u{1F415}";
    if (h.includes("joe") || h.includes("grandpa")) return "\u{1F474}";
    if (h.includes("max") || h.includes("mia") || h.includes("twin")) return "\u{1F9D2}";
    if (h.includes("farmer")) return "\u{1F9D1}\u{200D}\u{1F33E}";
    if (h.includes("ranger")) return "\u{1F9D1}\u{200D}\u{1F692}";
    if (h.includes("chef") || h.includes("baker") || h.includes("cook")) return "\u{1F9D1}\u{200D}\u{1F373}";
    if (h.includes("keeper") || h.includes("captain")) return "\u{1F9D1}\u{200D}\u{2708}\u{FE0F}";
    return "\u{1F642}";
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
  function speakButton(getText) {
    if (!State().settings.readAloud || !Speech().available) return null;
    const b = el("button", "btn small-btn speak-btn", "\u{1F50A} Read to me");
    b.addEventListener("click", () => {
      Audio().unlock();
      Speech().speak(getText());
    });
    return b;
  }
  function effectTags(effects) {
    const e = effects || {};
    const tags = [];
    if (e.zombies >= 1.15) tags.push(["More zombies", "risk"]);
    if (e.zombies && e.zombies <= 0.9) tags.push(["Fewer zombies", "safe"]);
    if (e.runners >= 1.2) tags.push(["Fast zombies", "risk"]);
    if (e.brutes >= 1.2) tags.push(["Big zombies", "risk"]);
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
    qi: 0,
    earned: 0,
    correctHere: 0,
    previewRaf: 0,

    start(onDone) {
      this.onDone = onDone;
      this.body = document.getElementById("haven-body");
      this.caption = document.getElementById("haven-caption");
      this.passage = State().nextHaven();
      this.qi = 0;
      this.earned = 0;
      this.correctHere = 0;
      State().run.havens += 1;
      this.caption.textContent = "MEANWHILE, AT THE " + this.passage.place.toUpperCase() + "...";
      this.arrive();
    },

    steps(current) {
      const names = ["READ", "QUESTIONS", "ROUTE", "GARAGE"];
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
      Speech().stop();
      cancelAnimationFrame(this.previewRaf);
      this.body.innerHTML = "";
      children.forEach((c) => c && this.body.appendChild(c));
      this.body.closest(".panel").scrollTop = 0;
    },

    /* 1. Arrive */
    arrive() {
      const p = this.passage;
      const btn = el("button", "btn big", "Let's read it");
      btn.addEventListener("click", () => {
        Audio().play("click");
        this.read();
      });
      const row = el("div", "btn-row");
      row.appendChild(btn);
      const tools = el("div", "read-tools");
      const sb = speakButton(() => p.host + " says: " + p.intro);
      if (sb) tools.appendChild(sb);
      this.render([this.steps(0), el("h2", null, "Safe haven: " + esc(p.place)), this.host(p.intro), tools, row]);
    },

    /* 2. Read the passage */
    read() {
      const p = this.passage;
      const title = el("h2", "reading-title", esc(p.title) + '<span class="kind-badge">' + esc(KIND_LABEL[p.kind] || "Something to read") + "</span>");
      const paper = el("div", "paper lined reading", paragraphs(p.text));
      const tools = el("div", "read-tools");
      const sb = speakButton(() => p.title + ". " + p.text);
      if (sb) tools.appendChild(sb);
      const btn = el("button", "btn big go", "I read it. Ask me!");
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
      this.render([this.steps(0), title, paper, tools, row]);
    },

    /* 3. Questions, one at a time, with the text available */
    question() {
      const p = this.passage;
      const q = p.questions[this.qi];
      const run = State().run;
      const wide = root.innerWidth >= 760;

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
      const next = el("button", "btn big hidden", this.qi < 2 ? "Next question" : "See how I did");
      row.appendChild(next);
      let attempts = 0;
      const buttons = [];
      q.options.forEach((text, i) => {
        const b = el("button", "option", '<span class="letter">' + LETTERS[i] + "</span><span>" + esc(text) + "</span>");
        b.addEventListener("click", () => {
          if (b.disabled) return;
          attempts += 1;
          if (i === q.answer) {
            const reward = attempts === 1 ? REWARD.first : REWARD.second;
            buttons.forEach((x) => (x.disabled = true));
            b.classList.add("correct");
            run.scrap += reward;
            run.correct += attempts === 1 ? 1 : 0;
            run.answered += 1;
            State().stats.correct += attempts === 1 ? 1 : 0;
            State().stats.answered += 1;
            State().saveStats();
            this.earned += reward;
            if (attempts === 1) this.correctHere += 1;
            feedback.className = "feedback good";
            feedback.innerHTML = (attempts === 1 ? "Yes! " : "That's it! ") + '<span class="scrap-pop">+' + reward + " scrap</span>";
            feedback.classList.remove("hidden");
            next.classList.remove("hidden");
            Audio().play("correct");
            Speech().stop();
          } else {
            b.classList.add("wrong");
            b.disabled = true;
            Audio().play("wrong");
            if (attempts === 1) {
              feedback.className = "feedback bad";
              feedback.innerHTML = "Not quite. Hint: " + esc(q.hint) + " Try once more.";
              feedback.classList.remove("hidden");
            } else {
              buttons.forEach((x) => (x.disabled = true));
              buttons[q.answer].classList.add("correct");
              run.answered += 1;
              State().stats.answered += 1;
              State().saveStats();
              feedback.className = "feedback bad";
              feedback.innerHTML = "The answer was <strong>" + esc(q.options[q.answer]) + "</strong>. Look at the text and you'll see it. On to the next one!";
              next.classList.remove("hidden");
            }
          }
        });
        buttons.push(b);
        opts.appendChild(b);
      });
      next.addEventListener("click", () => {
        Audio().play("click");
        this.qi += 1;
        if (this.qi < 3) this.question();
        else this.quizSummary();
      });
      const tools = el("div", "read-tools");
      const sb = speakButton(() => q.q + ". " + q.options.map((o, i) => LETTERS[i] + ". " + o).join(". "));
      if (sb) tools.appendChild(sb);
      this.render([this.steps(1), toggle, textBox, qEl, tools, opts, feedback, row]);
    },

    quizSummary() {
      const run = State().run;
      let bonusLine = "";
      if (this.correctHere === 3) {
        run.scrap += REWARD.perfect;
        this.earned += REWARD.perfect;
        bonusLine = '<p>All three on the first try! <span class="scrap-pop">+' + REWARD.perfect + " bonus scrap</span></p>";
      }
      const msg = this.correctHere === 3 ? "You read that perfectly." : this.correctHere >= 1 ? "Nice reading." : "Tough one. The next one will go better.";
      const box = el("div", "result-box", "<strong>" + msg + "</strong><br>You earned <strong>" + this.earned + " scrap</strong> at the " + esc(this.passage.place) + "." + bonusLine);
      const btn = el("button", "btn big go", "Pick a road");
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
      const p = this.passage;
      const c = p.choice;
      const cards = el("div", "choices");
      c.options.forEach((o) => {
        const card = el("button", "choice-card");
        card.appendChild(el("h3", null, esc(o.label)));
        card.appendChild(el("p", null, esc(o.desc)));
        card.addEventListener("click", () => {
          Audio().play("click");
          this.applyChoice(o);
        });
        cards.appendChild(card);
      });
      const tools = el("div", "read-tools");
      const sb = speakButton(() => c.prompt + ". " + c.options.map((o) => o.label + ": " + o.desc).join(". "));
      if (sb) tools.appendChild(sb);
      this.render([this.steps(2), el("p", "question", esc(c.prompt)), tools, cards]);
    },

    applyChoice(o) {
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

      const box = el("div", "result-box", esc(o.result));
      const tags = el("div", "tags");
      effectTags(e).forEach(([t, cls]) => tags.appendChild(el("span", "tag " + cls, esc(t))));
      if (!tags.children.length) tags.appendChild(el("span", "tag", "A normal road"));
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
      vanG.appendChild(el("h3", null, "The Bookmobile"));
      const gunG = el("div", "upgrade-group");
      gunG.appendChild(el("h3", null, "The Gun"));

      const rerender = () => this.garage();
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

      const go = el("button", "btn big go", "Hit the road!");
      go.addEventListener("click", () => {
        Audio().play("click");
        cancelAnimationFrame(this.previewRaf);
        Speech().stop();
        State().checkpoint();
        if (this.onDone) this.onDone();
      });
      const row = el("div", "btn-row");
      row.appendChild(go);
      const tip = el("p", "small muted", "Captain Ruby: \"Reading pays better than shooting. Come back with more scrap.\"");

      this.render([this.steps(3), el("h2", null, "Captain Ruby's garage"), head, preview, groups, tip, row]);

      const t0 = performance.now();
      const loop = () => {
        ZSR.Game.showcase(preview, run.upgrades, (performance.now() - t0) / 1000);
        this.previewRaf = requestAnimationFrame(loop);
      };
      loop();
    },

    /* ---------- Road sign pop-up (used mid-segment) ---------- */
    sign(onContinue) {
      const s = State().nextSign();
      const run = State().run;
      const textEl = document.getElementById("sign-text");
      const qEl = document.getElementById("sign-q");
      const opts = document.getElementById("sign-options");
      const fb = document.getElementById("sign-feedback");
      const cont = document.getElementById("btn-sign-continue");
      const speak = document.querySelector('#screen-sign .speak-btn');
      textEl.textContent = s.text;
      qEl.textContent = s.q;
      opts.innerHTML = "";
      fb.className = "feedback hidden";
      cont.classList.add("hidden");
      if (speak) {
        speak.style.display = State().settings.readAloud && Speech().available ? "" : "none";
        speak.onclick = () => {
          Audio().unlock();
          Speech().speak(s.text + ". " + s.q + ". " + s.options.map((o, i) => LETTERS[i] + ". " + o).join(". "));
        };
      }
      const buttons = [];
      s.options.forEach((text, i) => {
        const b = el("button", "option", '<span class="letter">' + LETTERS[i] + "</span><span>" + esc(text) + "</span>");
        b.addEventListener("click", () => {
          buttons.forEach((x) => (x.disabled = true));
          run.answered += 1;
          State().stats.answered += 1;
          if (i === s.answer) {
            b.classList.add("correct");
            run.scrap += REWARD.sign;
            run.correct += 1;
            State().stats.correct += 1;
            fb.className = "feedback good";
            fb.innerHTML = 'Right! <span class="scrap-pop">+' + REWARD.sign + " scrap</span>";
            Audio().play("correct");
          } else {
            b.classList.add("wrong");
            buttons[s.answer].classList.add("correct");
            fb.className = "feedback bad";
            fb.innerHTML = "The answer was <strong>" + esc(s.options[s.answer]) + "</strong>.";
            Audio().play("wrong");
          }
          State().saveStats();
          cont.classList.remove("hidden");
        });
        buttons.push(b);
        opts.appendChild(b);
      });
      cont.onclick = () => {
        Speech().stop();
        Audio().play("click");
        onContinue();
      };
    },

    REWARD,
  };

  ZSR.Haven = Haven;
})(typeof globalThis !== "undefined" ? globalThis : this);
