/* Screen flow: title (save slots) -> yard (cabin defense) -> map -> road -> building -> map -> ... -> yard.
   The base save is written only at the yard. Death reloads it. */
(function (root) {
  "use strict";
  const ZSR = root.ZSR;
  const State = ZSR.State;
  const Game = ZSR.Game;
  const Interior = ZSR.Interior;
  const Map = ZSR.Map;
  const Base = ZSR.Base;
  const Backpack = ZSR.Backpack;
  const Audio = ZSR.Audio;
  const W = ZSR.WORLD;
  const Tutorial = ZSR.Tutorial; // June's first-run tutorial (js/tutorial.js): told of every new screen

  const $ = (id) => document.getElementById(id);
  const SCREENS = ["screen-title", "screen-newsave", "screen-settings", "screen-howto", "screen-map", "screen-base", "screen-backpack", "screen-note", "screen-pause", "screen-death", "screen-confirm", "screen-wrong", "screen-crew"];
  const ORDINAL = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th", 6: "6th" };
  let settingsReturn = "screen-title";
  let titleRaf = 0;
  let active = null; // "yard" | "road" | "building" | "river" | null
  const firstPerson = () => active === "building" || active === "yard" || active === "river";
  let pendingSlot = null;

  function show(id) {
    SCREENS.forEach((s) => $(s).classList.toggle("hidden", s !== id));
    if (id === "screen-title") startTitleAnimation();
    else cancelAnimationFrame(titleRaf);
  }
  function hideScreens() {
    SCREENS.forEach((s) => $(s).classList.add("hidden"));
    cancelAnimationFrame(titleRaf);
  }
  function showCanvas(which) {
    $("game").classList.toggle("hidden", which !== "road");
    $("fp").classList.toggle("hidden", which !== "fp");
  }
  /** Yes/No dialog. opts: caption, yes/no labels, yesDisabled, onNo, onCancel (Esc; falls back to onNo). */
  let confirmCancel = null;
  function confirm(text, onYes, opts) {
    const o = opts || {};
    const close = () => {
      confirmCancel = null;
      $("screen-confirm").classList.add("hidden");
    };
    $("confirm-caption").textContent = o.caption || "Sure?";
    $("confirm-text").textContent = text;
    $("btn-confirm-yes").textContent = o.yes || "Yes";
    $("btn-confirm-no").textContent = o.no || "No";
    $("btn-confirm-yes").disabled = !!o.yesDisabled;
    $("screen-confirm").classList.remove("hidden");
    $("btn-confirm-yes").onclick = () => {
      close();
      onYes();
    };
    $("btn-confirm-no").onclick = () => {
      close();
      if (o.onNo) o.onNo();
    };
    confirmCancel = o.onCancel || o.onNo || null;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const paragraphs = (text) => String(text).split(/\n\s*\n/).filter((p) => p.trim()).map((p) => "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>").join("");
  const wordCount = (t) => String(t).trim().split(/\s+/).filter(Boolean).length;

  /* ---------- The crew card: a crew member asks a favor ("offer"), thanks you for one ("handIn"), or Pip names
     the dog ("name"). js/crew.js opens it from the talk bubble (hooks.onCrewCard); the yard waits while it is open.
     Enter is the main button, Esc is "Not now" (or closes), P does nothing here. Words read count once per text
     (State.seeCrewTalk; keys as docs/CREW.md lists). No questions about the words: they are there to be useful. */
  // the lasting perks a story quest gives, in plain words for the thank-you's reward line (docs/CREW.md "Perks");
  // a perk key missing here is still active, just not spelled out on the card
  const PERK_WORDS = {
    foodPerDay: (n) => "+" + n + " food every day",
    medsPerDay: (n) => "+" + n + " medical kit" + (n === 1 ? "" : "s") + " a day",
    footHp: (n) => "+" + n + " health for you",
    vanHp: (n) => "+" + n + " van health",
    scrapPerDay: (n) => "+" + n + " scrap every day you come home",
    crewRepairFree: (v) => (v ? "the crew's repairs cost no scrap" : ""),
    lookoutEarly: (n) => "waves called " + n + " seconds sooner",
    healAmount: (n) => "+" + n + " health when " + jobHolder("heal") + " patches you up",
    crowbarCost: (n) => "crowbars cost " + n + " scrap",
  };
  /** The crew member who has this job (CREW[id].jobs), by name; "the crew" if nobody does. */
  function jobHolder(job) {
    const id = Object.keys(W.CREW || {}).find((k) => ((W.CREW[k] && W.CREW[k].jobs) || []).some((j) => j && j.job === job));
    return id ? ZSR.crewName(id) : "the crew";
  }
  let crewCard = null; // the open card: { id, action, primary, cancel }
  const crewCardOpen = () => !$("screen-crew").classList.contains("hidden");
  function crewSeen(key, text) {
    if (State.seeCrewTalk && text) State.seeCrewTalk(key, wordCount(text));
  }
  /** A copy of a sprite canvas (the cache keeps its own), or null when the art is not loaded. */
  function spriteCopy(name, opts) {
    const D3 = ZSR.Draw3;
    const src = D3 && D3.sprite ? D3.sprite(name, opts) : null;
    if (!src || !src.width) return null;
    const c = document.createElement("canvas");
    c.width = src.width;
    c.height = src.height;
    c.getContext("2d").drawImage(src, 0, 0);
    return c;
  }
  /** The card's buttons: [{ label, cls, primary, onClick }]. The primary one answers Enter and takes the focus. */
  function crewButtons(list) {
    const row = $("crew-buttons");
    row.innerHTML = "";
    let first = null;
    crewCard.primary = null;
    list.forEach((b) => {
      const btn = document.createElement("button");
      btn.className = "btn" + (b.cls ? " " + b.cls : "");
      btn.textContent = b.label;
      btn.addEventListener("click", () => {
        Audio.play("click");
        b.onClick();
      });
      row.appendChild(btn);
      if (b.primary) {
        crewCard.primary = b.onClick;
        first = btn;
      }
    });
    return first;
  }
  function crewHint(text) {
    $("crew-hint").textContent = text || "";
    $("crew-hint").classList.toggle("hidden", !text);
  }
  function crewReward(text) {
    $("crew-reward").textContent = text || "";
    $("crew-reward").classList.toggle("hidden", !text);
  }
  function crewStarsNow(id) {
    const box = $("crew-stars");
    box.innerHTML = "";
    if (Backpack.crewStars) box.appendChild(Backpack.crewStars(id));
  }
  /** Fill the card's frame: who, their portrait, their trust stars, the caption and the title. */
  function crewFrame(id, caption, title) {
    const c = (W.CREW || {})[id] || {};
    const panel = $("crew-panel");
    if (c.color) panel.style.setProperty("--crew", c.color);
    else panel.style.removeProperty("--crew");
    $("crew-caption").textContent = caption;
    $("crew-name").textContent = ZSR.crewName(id);
    crewStarsNow(id);
    $("crew-title").textContent = title || "";
    const face = $("crew-face");
    face.innerHTML = "";
    const pic = spriteCopy("crewFace", { who: id });
    if (pic) face.appendChild(pic);
    face.classList.toggle("hidden", !pic);
    $("crew-names").classList.add("hidden");
    crewHint("");
    crewReward("");
  }
  function crewSetText(text) {
    $("crew-text").innerHTML = paragraphs(text);
  }
  /** "You get: 30 scrap and 1 medical kit. From now on: +1 food every day. Trust +5." */
  function crewRewardLine(res, id) {
    const parts = [];
    const got = State.rewardWords ? State.rewardWords(res.reward) : "";
    if (got) parts.push("You get: " + got + ".");
    const perk = (res.reward && res.reward.perk) || {};
    const lasting = Object.entries(perk).map(([k, v]) => (PERK_WORDS[k] ? PERK_WORDS[k](v) : "")).filter(Boolean);
    if (lasting.length) parts.push("From now on: " + lasting.join(", ") + ".");
    const gain = ((W.CREW_RULES || {}).gain || {})[res.kind === "errand" ? "errand" : "quest"];
    if (gain) parts.push(ZSR.crewName(id) + "'s trust +" + gain + ".");
    return parts.join(" ");
  }
  /** Show the card for one action. Returns false (and shows nothing) when there is nothing to show now.
      finish(result) closes it: offer -> { accepted, kind, id, title }; handIn -> State.handIn's
      { kind, def, reward }; name -> { name } (null when not named). */
  function crewCardShow(id, action, finish) {
    const name = ZSR.crewName(id);
    crewCard = { id, action, primary: null, cancel: null };
    let focus = null;
    if (action === "offer") {
      const o = State.offer(id);
      if (!o || !o.def) return false;
      const vars = State.requestVars(o);
      const title = ZSR.crewFill(ZSR.crewText(o.kind, o.def.id, "title"), vars);
      const text = ZSR.crewFill(ZSR.crewText(o.kind, o.def.id, "brief"), vars);
      crewFrame(id, name + " asks", title);
      crewSetText(text);
      crewSeen(o.kind + ":" + o.def.id + ":brief", text);
      crewReward(vars.reward ? "Reward: " + vars.reward + "." : "");
      const no = () => finish({ accepted: false, kind: o.kind, id: o.def.id, title });
      crewCard.cancel = no;
      focus = crewButtons([
        { label: "Not now", cls: "alt", onClick: no },
        { label: "I'll do it", cls: "big go", primary: true, onClick: () => finish({ accepted: !!State.accept(id, o), kind: o.kind, id: o.def.id, title }) },
      ]);
    } else if (action === "handIn") {
      const r = State.request(id);
      if (!r || !State.requestReady(r)) return false;
      const vars = State.requestVars(r); // before the payout: an errand's count and item go with it
      const res = State.handIn(id, r.def.id); // pays out this request, once: the card is open from here on
      if (!res) return false;
      const title = ZSR.crewFill(ZSR.crewText(res.kind, res.def.id, "title"), vars);
      const text = ZSR.crewFill(ZSR.crewText(res.kind, res.def.id, "done"), vars);
      crewFrame(id, name + " says thanks", title);
      crewSetText(text);
      crewSeen(res.kind + ":" + res.def.id + ":done", text);
      crewReward(crewRewardLine(res, id));
      const close = () => finish(res);
      crewCard.cancel = close;
      focus = crewButtons([{ label: "You're welcome", cls: "big go", primary: true, onClick: close }]);
    } else if (action === "name") {
      if (!State.dogHome || !State.dogHome() || State.dogName()) return false;
      const ask = ZSR.crewFill(ZSR.crewText("dog", null, "ask"));
      crewFrame(id, name + " asks", "Name the dog");
      crewSetText(ask);
      crewSeen("dog:ask", ask);
      const box = $("crew-names");
      box.classList.remove("hidden", "named");
      const dog = $("crew-dog");
      dog.innerHTML = "";
      const pic = spriteCopy("crewDog", { pose: "sit", f: 0 });
      if (pic) dog.appendChild(pic);
      const named = (clean) => {
        // the name is kept: say so, then one button closes
        const words = ZSR.crewFill(ZSR.crewText("dog", null, "named"), { dog: clean });
        box.classList.add("named"); // the dog stays in the picture; the name buttons go
        crewHint("");
        $("crew-title").textContent = clean;
        crewSetText(words);
        crewSeen("dog:named", words);
        const close = () => finish({ name: clean });
        crewCard.cancel = close;
        const btn = crewButtons([{ label: "Good dog", cls: "big go", primary: true, onClick: close }]);
        crewCardFit();
        if (btn) btn.focus({ preventScroll: true });
      };
      const tryName = (raw) => {
        const clean = State.nameDog(raw);
        if (!clean) {
          crewHint("Use letters for the name: 1 to " + $("crew-dogname").maxLength + " of them.");
          $("crew-dogname").focus();
          return;
        }
        Audio.play("correct");
        named(clean);
      };
      const ideas = $("crew-ideas");
      ideas.innerHTML = "";
      ((W.DOG && W.DOG.ideas) || []).forEach((idea) => {
        const b = document.createElement("button");
        b.className = "btn cc-idea";
        b.textContent = idea;
        b.addEventListener("click", () => tryName(idea));
        ideas.appendChild(b);
      });
      const input = $("crew-dogname");
      input.value = "";
      $("btn-crew-name").onclick = () => tryName(input.value);
      const no = () => finish({ name: null });
      crewCard.cancel = no;
      crewButtons([{ label: "Not now", cls: "alt", onClick: no }]);
      focus = input;
    } else return false;
    $("screen-crew").classList.remove("hidden");
    crewCardFit();
    // after this key press is done, so the E that opened the card never lands in the name box
    // (no scrolling to it: crewCardFit chose what shows first)
    if (focus) setTimeout(() => crewCardOpen() && focus.focus({ preventScroll: true }), 30);
    return true;
  }
  /** Where a card opens. At its top, unless it is taller than the window and scrolling it down far enough to show
      its buttons still keeps the start of the words in view (a short window at Normal or Large): then there, so
      the words and the buttons show together. At Huge the words come first: it opens at its top. */
  function crewCardFit() {
    const panel = $("crew-panel");
    panel.scrollTop = 0;
    const over = panel.scrollHeight - panel.clientHeight;
    if (over <= 0) return;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const above = $("crew-text").getBoundingClientRect().top - panel.getBoundingClientRect().top - rem; // the tape strips stay in view
    if (over <= above) panel.scrollTop = over;
  }
  /** The card is a modal dialog: Tab and Shift+Tab go round its own buttons (and the name box), never out to the
      HUD buttons behind it. */
  function crewCardTab(back) {
    const list = Array.from($("crew-panel").querySelectorAll("button, input")).filter((b) => !b.disabled && b.offsetParent !== null);
    if (!list.length) return;
    const i = list.indexOf(document.activeElement);
    const next = back ? list[i <= 0 ? list.length - 1 : i - 1] : list[i < 0 || i >= list.length - 1 ? 0 : i + 1];
    next.focus();
  }
  /** Close the card (no callback). */
  function crewCardHide() {
    crewCard = null;
    $("screen-crew").classList.add("hidden");
    if (document.activeElement && $("screen-crew").contains(document.activeElement)) document.activeElement.blur();
  }

  /* ---------- Settings ---------- */
  // what each Universe choice adds (docs/UNIVERSES.md): the base story stays the same in every one
  const UNIVERSE_NOTE = {
    off: "The town's own story, and nothing more.",
    leo: "The same story, on Mira-8 next to Mira-9, long after Captain Leo's first mission. Adds Mira-9 in the sky, news on the radio, lines in June's journal, new talk, and Tomas's robot dog.",
    fortitude: "The same story, on Earth, hundreds of years after the Fortitude Chronicles. Adds the old shipyard ring in the sky, bursts on the radio, lines in June's journal, new talk, and Pip's decoding.",
  };
  /** " · Captain Leo" on a save slot's summary when a universe is on. */
  function universeTail(settings) {
    const u = settings && settings.universe;
    const def = u && (ZSR.WORLD.UNIVERSES || {})[u];
    return def ? " · " + esc(def.name) : "";
  }
  function applySettings() {
    document.documentElement.setAttribute("data-size", State.settings.textSize);
    document.querySelectorAll("#grade-seg button").forEach((b) => b.classList.toggle("on", Number(b.dataset.grade) === State.settings.level));
    $("grade-now").textContent = "(now: " + ORDINAL[State.settings.level] + " grade)";
    document.querySelectorAll("#size-seg button").forEach((b) => b.classList.toggle("on", b.dataset.size === State.settings.textSize));
    $("opt-sound").checked = !!State.settings.sound;
    $("opt-aim").checked = !!State.settings.aimAssist;
    $("opt-shake").checked = !!State.settings.shake;
    $("opt-sens").value = State.settings.mouseSens || 1;
    const uni = State.universe ? State.universe() : "off";
    document.querySelectorAll("#universe-seg button").forEach((b) => {
      b.classList.toggle("on", b.dataset.universe === uni);
      // a universe the facts do not define is not offered (js/story-leo.js, js/story-fortitude.js)
      b.classList.toggle("hidden", b.dataset.universe !== "off" && !(ZSR.WORLD.UNIVERSES || {})[b.dataset.universe]);
    });
    $("universe-note").textContent = UNIVERSE_NOTE[uni] || UNIVERSE_NOTE.off;
    $("settings-for").textContent = whoseSettings();
    refreshTitle();
  }
  // first person needs a keyboard and mouse; on a touch-only device say so instead of leading into a dead end
  const touchOnly = !!(root.matchMedia && root.matchMedia("(pointer: coarse) and (hover: none)").matches);
  /** Each save keeps its own settings; these lines say which save the Settings screen changes. */
  function activeLabel() {
    const slot = State.listSlots().find((x) => x.active && x.save);
    return slot ? slot.label || "Player " + slot.id : null;
  }
  function whoseSettings() {
    const who = activeLabel();
    return who ? "Settings for " + who + ". Each save keeps its own." : "Settings for the next new save. Each save keeps its own.";
  }
  /** The title screen: one row per save slot. Display only; never reloads the save while a trip runs. */
  function refreshTitle() {
    const who = activeLabel();
    $("title-grade").textContent = touchOnly ? "This game needs a keyboard and mouse. Open it on a laptop or desktop." : (who ? who + ": r" : "R") + "eading level " + ORDINAL[State.settings.level] + " grade. Change it in Settings.";
    const list = $("slot-list");
    list.innerHTML = "";
    State.listSlots().forEach((slot) => {
      const row = document.createElement("div");
      row.className = "slot" + (slot.save ? "" : " empty");
      const info = document.createElement("div");
      if (slot.save) {
        const s = slot.save;
        const level = Object.values(s.rooms || {}).reduce((a, b) => a + b, 0);
        info.innerHTML = '<div class="who">' + esc(slot.label || "Player " + slot.id) + '</div><div class="sum">Day ' + s.day + " · base level " + level + " · " + (s.backpack || []).length + " notes · " + (s.scrap || 0) + " scrap · " + ORDINAL[slot.settings.level] + " grade" + universeTail(slot.settings) + "</div>";
      } else info.innerHTML = '<div class="who muted">Slot ' + slot.id + '</div><div class="sum">Empty</div>';
      const acts = document.createElement("div");
      acts.className = "acts";
      if (slot.save) {
        const go = document.createElement("button");
        go.className = "btn go";
        go.textContent = "Continue";
        go.addEventListener("click", () => {
          Audio.unlock();
          Audio.play("click");
          if (!State.loadSave(slot.id)) return;
          applySettings(); // this save's own reading level, text size and the rest
          goYardWithDay(); // an unread day page (closed mid-read) comes first
        });
        const del = document.createElement("button");
        del.className = "btn del";
        del.textContent = "Delete";
        del.addEventListener("click", () => confirm("Delete " + (slot.label || "this save") + "? Day " + slot.save.day + " is gone for good.", () => {
          State.deleteSlot(slot.id);
          applySettings(); // deleting the active save falls back to the shared settings
        }));
        acts.appendChild(go);
        acts.appendChild(del);
      } else {
        const make = document.createElement("button");
        make.className = "btn";
        make.textContent = "New save";
        make.addEventListener("click", () => {
          Audio.unlock();
          Audio.play("click");
          pendingSlot = slot.id;
          $("newsave-name").value = "";
          show("screen-newsave");
          setTimeout(() => $("newsave-name").focus(), 50);
        });
        acts.appendChild(make);
      }
      row.appendChild(info);
      row.appendChild(acts);
      list.appendChild(row);
    });
    if (touchOnly) list.querySelectorAll(".btn").forEach((b) => (b.disabled = true));
  }
  function startNewGame() {
    const name = $("newsave-name").value;
    State.newGame(pendingSlot, name);
    pendingSlot = null;
    applySettings();
    if (!State.settings.seenHowto) {
      State.settings.seenHowto = true;
      State.saveSettings();
      settingsReturn = "start";
      renderHowto();
      show("screen-howto");
    } else goYardWithDay();
  }
  /** Home with today's page first: the recap, June's journal, the radio. Then the yard. */
  function goYardWithDay(opts, after) {
    const log = State.save && State.save.log;
    const entry = log && log.length ? log[log.length - 1] : null;
    if (!entry || entry.read) {
      goYard(opts);
      if (after) after();
      return;
    }
    hideScreens();
    showCanvas(null);
    Backpack.showDay(entry, {
      primary: "Into the yard",
      onClose() {
        State.commit(); // keeps the "read" mark (words read) on the saved day
        goYard(opts);
        if (after) after();
      },
    });
  }
  function startTitleAnimation() {
    const c = $("title-van");
    const t0 = performance.now();
    cancelAnimationFrame(titleRaf);
    const loop = () => {
      if ($("screen-title").classList.contains("hidden")) return;
      // with no save, a van with some gear wearing Olive Drab (paint: the look worn, an index into PAINT_LOOKS)
      Game.showcase(c, State.save ? State.save.upgrades : { armor: 2, engine: 1, bumper: 2, paint: 3, damage: 2, fireRate: 0, spread: 1 }, (performance.now() - t0) / 1000);
      titleRaf = requestAnimationFrame(loop);
    };
    loop();
  }
  const CONTROLS_FALLBACK = ["Road: aim with the mouse, hold to fire. A and D, the arrow keys or the side buttons change lanes. Your left lane goes straight past side streets. Where roads meet there is one lane per road, and one for the drive of a place there, and yours may turn: match the arrow on the sign and be in that lane before the white stop line. To park, take your destination's drive.", "Inside and in the yard: W A S D move, the mouse looks, click fires, Shift runs, B opens the backpack, M opens the map of a building, P or Esc pauses.", "E does it all: reads notes, opens and closes doors (the cabin's too), uses keypads, stuck locks, drawers and alarm panels (do exactly what the note says), tries a key at a stash, leaves a building, uses the computer and the things in the cabin, rings the dinner bell, starts the van, and fixes a hole in the fence (1 scrap), a broken door or window (2 scrap) or a wrecked build (3 scrap).", "Traps in the yard: T sets a spike trap, R a blast trap, on the ground in front of you or just past the fence.", "Guns: more guns are hidden in buildings around town. Walk over one to pick it up; bring it home to keep it. 1 to 5, Q or the mouse wheel switch guns. Hold to draw the bow, let go to shoot. Mod guns with scrap in the cabin's Weapons tab.", "Fishing: the pole is 6 (or Q). Click to cast at the water, click again when the float dips. Take a gun with the line out and the pole stays propped on the bank; E at it takes it back.", "Backpack: notes you have read, and medical kits. Use a kit to heal to full.", "Workbench: building and upgrading is a short typing round. Type what is on the screen before the timer runs out; out of time just means try again.", "Map: tap a place, then Drive. At a place you can go back inside."];
  function renderHowto() {
    const t = ZSR.text();
    const body = $("howto-body");
    body.innerHTML = "";
    const paras = (t && t.howto) || ["You run the last van out of a cabin at the edge of town. Drive to the places on the map, read the notes people left, clear the walkers, bring back what the base needs.", "Inside every building a note tells you how to open the locked room and where to go next. Do exactly what it says: a wrong code sets off an alarm, a wrong drawer can be a trap, and a wrong move jams the lock (a crowbar from the workbench pries it open). Back at the cabin, build at the computer between waves and hold the fence when they come.", "The game saves only at the cabin. If you go down, you are back at your last save."];
    paras.forEach((p) => {
      const e = document.createElement("p");
      e.textContent = p;
      body.appendChild(e);
    });
    // the controls list is in-world text too: it comes at the reading level, keys shown as <kbd>
    const list = $("howto-controls");
    list.innerHTML = "";
    ((t && t.controls) || CONTROLS_FALLBACK).forEach((line) => {
      const li = document.createElement("li");
      const parts = String(line).split(":");
      const head = parts.length > 1 ? parts.shift() : null;
      if (head) {
        const b = document.createElement("strong");
        b.textContent = head + ":";
        li.appendChild(b);
      }
      const rest = parts.join(":");
      // single capital letters and known key names become key caps
      rest.split(/(\b(?:W|A|S|D|E|B|M|P|T|R|Q|Esc|Shift)\b)/).forEach((piece, i) => {
        if (i % 2) {
          const k = document.createElement("kbd");
          k.textContent = piece;
          li.appendChild(k);
        } else li.appendChild(document.createTextNode(piece));
      });
      list.appendChild(li);
    });
  }

  /* ---------- Yard (home base) ---------- */
  function goYard(opts) {
    hideScreens();
    active = "yard";
    showCanvas("fp");
    Interior.enterYard(opts);
    Tutorial.enter("yard");
  }
  /** Copy the yard's fence and traps into the save and write it. Never in the middle of a wave:
      a wave is saved only once it is cleared, so dying in it reloads the state before it began. */
  function syncYard() {
    if (Interior.mode !== "yard" || !State.save) return;
    if (Interior.phase && Interior.phase.kind === "wave") return;
    State.save.fence = Interior.fenceState();
    State.save.yardTraps = Interior.traps.filter((t) => t.uses > 0).map((t) => ({ x: t.x, y: t.y, type: t.type, uses: t.uses }));
    State.save.house.hp = Interior.houseState();
    State.commit();
  }
  const yardHooks = {
    /** The office computer in the cabin: the build menu. The yard waits while it is open. */
    onComputer() {
      Interior.pause();
      Base.open({
        onClose() {
          Interior.refreshYard();
          Interior.resume();
          Tutorial.note("computer");
        },
        onChanged(key) {
          Interior.refreshYard({ rebuildFence: key === "walls" });
          if (key === "walls" || key === "doors" || key === "windows") syncYard();
        },
        fenceHoles: () => Interior.fenceHoles().length,
        onRepairFence() {
          const n = Interior.repairAllHoles();
          syncYard();
          return n;
        },
        houseDamage: () => Interior.houseDamage(),
        onRepairHouse() {
          const n = Interior.repairHouse();
          syncYard();
          return n;
        },
        // the room builds the wreckers clawed (js/yardwreck.js): { wrecked, cracked }, and "Fix all"
        buildDamage: () => Interior.buildDamage(),
        onRepairBuilds() {
          const n = Interior.repairAllBuilds();
          syncYard();
          return n;
        },
      });
    },
    /** The radio shelf in the dining room: today's news if it is still waiting (tune in), else June's
        journal and the radio, every day so far. */
    onRadio() {
      Interior.pause();
      const news = State.roomLevel("radio") > 0 ? State.radioWaiting() : null; // a wrecked tower hears nothing
      if (news) {
        Backpack.tuneIn(news, () => {
          State.commit(); // keeps the "tuned" mark (words read) on the saved day
          Interior.resume();
        });
      } else Backpack.openDays(() => Interior.resume());
    },
    /** The typewriter in the play room: a free typing round. */
    onPractice() {
      Interior.pause();
      Base.practice(() => Interior.resume());
    },
    onVan() {
      syncYard();
      const depart = () => {
        Interior.leave();
        State.startTrip();
        openMap("base");
      };
      const max = State.vanMaxHp();
      if (State.save.vanHp >= max) return depart();
      const hp = Math.floor(State.save.vanHp);
      // the van is hurt: offer a full repair before the trip starts
      Interior.pause();
      const cost = State.repairCost();
      const scrap = State.save.scrap;
      const short = scrap < cost;
      const price = cost ? cost + " scrap" : "free";
      confirm(
        "The van has " + hp + " of " + max + " health. " + (short ? "A full fix costs " + cost + " scrap. You have " + scrap + "." : "Fix it before you go? Cost: " + price + ". You have " + scrap + " scrap."),
        () => {
          if (State.repairVan()) Audio.play("buy");
          depart();
        },
        {
          caption: "Fix the van?",
          yes: short ? "Not enough scrap" : "Fix it (" + price + ")",
          yesDisabled: short,
          no: "Go as is",
          onNo: depart,
          onCancel: () => Interior.resume(), // Esc: stay in the yard
        }
      );
    },
    /** A crew member's card from the talk bubble (js/crew.js): offer, handIn or name. The yard waits while it is
        open; on close Interior.crewCardDone(id, action, result) hears how it went, then the yard runs and is saved. */
    onCrewCard(id, action) {
      if (crewCardOpen()) return; // one card at a time
      const done = (result) => {
        try {
          if (Interior.crewCardDone) Interior.crewCardDone(id, action, result);
        } finally {
          // crewCardDone may open the next card (the dog's name after its thank-you): the yard waits for that one
          if (!crewCardOpen()) Interior.resume();
          syncYard();
        }
      };
      let finished = false;
      const finish = (result) => {
        if (finished) return;
        finished = true;
        crewCardHide();
        done(result);
        if (action === "offer" && result && result.accepted) Interior.toast("You said yes: " + result.title + ". Read it again in the backpack (B).", 4);
      };
      // a wave locks the crew in the shelter (js/crew.js never asks then): nothing is shown or paid mid-wave.
      // Nothing to show (the offer or the hand-in is gone): the yard never stops
      const wave = Interior.mode === "yard" && Interior.phase && Interior.phase.kind === "wave";
      let shown = false;
      try {
        shown = !wave && crewCardShow(id, action, finish);
      } catch (e) {
        // a missing text or picture never leaves the yard stuck behind a half-drawn card
        if (root.console) root.console.error(e);
        crewCardHide();
      }
      if (!shown) {
        crewCard = null;
        finished = true;
        done(null);
        return;
      }
      Interior.pause();
    },
    onWaveCleared() {
      syncYard();
    },
    onYardChanged() {
      syncYard();
    },
  };

  /* ---------- Map and road ---------- */
  function openMap(at) {
    hideScreens();
    showCanvas(null);
    active = null;
    $("map-btn-yard").classList.toggle("hidden", at !== "base");
    show("screen-map");
    Map.show(at);
    Tutorial.enter("map");
  }
  function drive(destId) {
    if (!State.trip) return goYard();
    const from = State.trip.at;
    const r = Map.route(from, destId);
    if (!r) return;
    const loc = W.LOCATIONS.find((l) => l.id === destId);
    const secs = Math.round(Math.min(W.SETTINGS.tripMaxSeconds, Math.max(W.SETTINGS.tripMinSeconds, r.dist * W.SETTINGS.tripSecondsPerUnit)));
    hideScreens();
    Map.hide();
    showCanvas("road");
    active = "road";
    // the road follows the route the map showed; a wrong turn asks what next (onWrongTurn)
    Game.startTrip({ to: destId, name: loc.name, seconds: secs, danger: loc.danger, path: r.path });
    Tutorial.enter("road");
  }
  /** A wrong turn on the road: try the drive again, open the town map, or go back where the van set out. */
  function onWrongTurn(info) {
    const St = ZSR.Streets;
    $("wrong-caption").textContent = St.text("wrongTitle");
    $("wrong-text").textContent = info.msg;
    const retry = $("btn-wrong-retry");
    retry.textContent = St.text("tryAgain");
    $("btn-wrong-map").textContent = St.text("townMap");
    $("btn-wrong-back").textContent = St.text("goBack", { origin: info.originName });
    retry.onclick = () => {
      Audio.play("click");
      hideScreens();
      Game.retry();
    };
    $("btn-wrong-map").onclick = () => {
      Audio.play("click");
      Game.stop();
      openMap(State.trip.at);
    };
    $("btn-wrong-back").onclick = () => {
      Audio.play("click");
      Game.stop();
      // out of the cabin's own driveway nothing is lost or gained: the trip never left (as the map's yard button)
      if (info.origin === "base") backToYard();
      else onArrive(info.origin);
    };
    show("screen-wrong");
    retry.focus();
  }
  /** Back out of a trip that has not reached any place yet: no day passes. */
  function backToYard() {
    State.trip = null;
    Map.hide();
    goYard({ firstCalm: 30 });
  }
  /** The start of the home toast, saying what came home besides the cargo (plain English, like the card's lines):
      "Home.", "Home with the dog.", "Home. You brought back the roll of knee tape for June." (story objects and the
      dog this trip brings home: js/crewstate.js crewTripHome makes them found). */
  function homeWords(t) {
    const S = State;
    const quests = (W.QUESTS || []).filter((q) => q && S.questState && S.questState(q.id) === "active");
    const dog = !!t.dog && quests.some((q) => q.kind === "dog" && (!t.dogQuest || t.dogQuest === q.id));
    const objs = quests.filter((q) => q.kind !== "dog" && (t.quest || []).includes(q.id));
    const names = objs.map((q) => {
      const title = ZSR.crewFill(ZSR.crewText("quest", q.id, "title")).trim() || (q.object && q.object.name) || "";
      // a label in running text: "the roll of knee tape"; a possessive keeps its capital ("Rosa's jar of beans"),
      // a title with its own article keeps it ("The old map" -> "the old map")
      const low = title.charAt(0).toLowerCase() + title.slice(1);
      const what = /^\S+'s\b/.test(title) ? title : /^(the|a|an) /i.test(title) ? low : "the " + low;
      return what + " for " + ZSR.crewName(q.giver);
    });
    const list = names.length < 2 ? names.join("") : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
    return "Home" + (dog ? " with the dog" : "") + "." + (list ? " You brought back " + list + "." : "");
  }
  function onArrive(destId) {
    if (!State.trip) return goYard();
    State.trip.at = destId;
    showCanvas(null);
    if (destId === "base") {
      const t = State.trip;
      const cargo = Object.values(t.cargo).reduce((a, b) => a + b, 0);
      const brought = homeWords(t); // before returnHome makes them found
      State.returnHome();
      const said = brought + (cargo ? " " + cargo + " item" + (cargo === 1 ? "" : "s") + " unloaded." : "");
      goYardWithDay({ firstCalm: W.DEFENSE.firstCalmSeconds }, () => Interior.toast(said + " Day " + State.save.day + ". Saved.", 4));
      return;
    }
    const dest = W.LOCATIONS.find((l) => l.id === destId);
    if (dest.outdoor) return enterRiver(dest); // River Landing: no door, no note, just out of the van
    // back at a place already entered this trip: straight in, as you left it
    if (State.trip.rooms && State.trip.rooms[destId]) enterBuilding(dest);
    else showDoor(destId);
  }
  /** The note at the door; parked outside until the player goes in or drives off. */
  function showDoor(destId) {
    const loc = W.LOCATIONS.find((l) => l.id === destId);
    const door = W.NOTES[destId].door;
    State.trip.atDoor = destId;
    hideScreens();
    // the first door: June's card on the door note comes first
    Tutorial.first("door", () =>
      Backpack.read(destId, door.id, {
        isDoor: true,
        found: door.found,
        primary: "Go in",
        secondary: { label: "Back to the map", action: () => openMap(destId) },
        onClose: () => enterBuilding(loc),
      })
    );
  }
  /** From the map, at a place: straight back in once the door note has been read. */
  function reenter(destId) {
    if (!State.trip) return goYard();
    const loc = W.LOCATIONS.find((l) => l.id === destId);
    if (!loc || destId === "base") return;
    if (loc.outdoor) return enterRiver(loc);
    if (State.noteRead(W.NOTES[destId].door.id)) enterBuilding(loc);
    else showDoor(destId);
  }
  function enterBuilding(loc) {
    State.trip.atDoor = null;
    hideScreens();
    showCanvas("fp");
    active = "building";
    Interior.enter(loc);
    Tutorial.enter("building");
  }
  /** River Landing: out of the van on the dirt turnout, the dock and the river ahead. */
  function enterRiver(loc) {
    State.trip.atDoor = null;
    hideScreens();
    showCanvas("fp");
    active = "river";
    Interior.enterRiver(loc);
    Tutorial.enter("river");
  }

  /* ---------- Building hooks ---------- */
  const buildingHooks = {
    onReadNote(noteObj, loc) {
      Interior.pause();
      Backpack.read(loc.id, noteObj.id, {
        found: noteObj.found,
        onClose() {
          Interior.noteWasRead(noteObj);
          Interior.resume();
        },
      });
    },
    onExit() {
      Interior.leave();
      if (!State.trip) return goYard();
      openMap(State.trip.at);
    },
  };

  /* ---------- Shared: pause, backpack, death ---------- */
  function overlayOpen() {
    return ["screen-pause", "screen-note", "screen-backpack", "screen-base", "screen-bench", "screen-confirm", "screen-wrong", "screen-lock", "screen-crew", "screen-tutorial"].some((id) => $(id) && !$(id).classList.contains("hidden"));
  }
  function pauseActive() {
    if (active === "road" && Game.running && !Game.paused) Game.pause();
    if (firstPerson() && Interior.running && !Interior.paused) Interior.pause();
  }
  function resumeActive() {
    hideScreens();
    if (active === "road") Game.resume();
    if (firstPerson()) Interior.resume();
  }
  function onPause() {
    if (overlayOpen()) return;
    pauseActive();
    $("pause-note").textContent = State.god ? "God mode: nothing is saved. Type !godmode for the god menu." : active === "yard" ? "The base is saved after every wave, build and repair." : "Nothing since your last save at the cabin is kept if you quit.";
    const can = Tutorial.canReplay(active); // never in a wave: the pause menu is no place to hide from one
    $("btn-pause-tutorial").disabled = !can;
    $("btn-pause-tutorial").title = can ? "" : "Not during a wave";
    show("screen-pause");
  }
  function onPauseKey() {
    if (crewCardOpen()) return; // the crew card takes Esc itself ("Not now"); P does nothing there
    if (!$("screen-confirm").classList.contains("hidden")) {
      $("screen-confirm").classList.add("hidden"); // Esc answers "No", or cancels when the dialog says how
      const cancel = confirmCancel;
      confirmCancel = null;
      if (cancel) cancel();
      return;
    }
    if (!$("screen-pause").classList.contains("hidden")) resumeActive();
    else onPause();
  }
  function onBackpack() {
    // never over the crew card or a tutorial card (its HUD button sits behind the card): the card is answered first
    if (crewCardOpen() || Tutorial.isOpen() || !$("screen-backpack").classList.contains("hidden")) return;
    pauseActive();
    Backpack.open(() => {
      resumeActive();
      Tutorial.note("bag"); // the tutorial's backpack step: B or the HUD button, opened and closed again
    });
  }
  function onDeath() {
    Tutorial.enter(null);
    showCanvas(null);
    const t = State.trip;
    const stats = $("death-stats");
    stats.innerHTML = "";
    const items = t ? [[t.walkers, "walkers downed"], [Object.values(t.cargo).reduce((a, b) => a + b, 0), "cargo lost"], [t.notes.length, "notes lost"], [t.scrap, "scrap lost"]] : [[State.save.day, "day"], [State.baseLevel(), "base level"]];
    items.forEach(([v, l]) => {
      const d = document.createElement("div");
      d.className = "stat";
      d.innerHTML = '<span class="v">' + v + '</span><span class="l">' + l + "</span>";
      stats.appendChild(d);
    });
    const reason = active !== "yard" && active !== "road" && Interior.deathReason;
    Interior.deathReason = null;
    $("death-text").textContent = reason ? reason + " Everything since you left the cabin is gone." : active === "yard" ? "The fence gave and the yard filled up. Your last save at the cabin is still there." : active === "road" ? "The van is wrecked on the road. Everything since you left the cabin is gone." : active === "river" ? "They got you down by the river. Everything since you left the cabin is gone." : "They got you inside. Everything since you left the cabin is gone.";
    active = null;
    show("screen-death");
  }
  function reload() {
    State.abandonTrip();
    goYard();
  }
  function quitToTitle() {
    Tutorial.enter(null);
    Game.stop();
    Interior.leave();
    showCanvas(null);
    if (State.god) {
      // the title is the real game: quitting there ends god mode, and the real save and settings come back
      State.godEnd();
      applySettings();
      if (ZSR.God) ZSR.God.sync();
    }
    State.loadSave(); // resync memory to the disk save; drops the trip and any uncommitted yard scrap
    active = null;
    show("screen-title");
    refreshTitle();
  }

  /* ---------- God mode (js/god.js): the owner's test sandbox. Nothing is saved while it is on ---------- */
  /** Close whatever is up and stop whatever runs: a card or menu, the road, a building, the yard, the map.
      False, with nothing touched, while a lock prompt is open: it closes only through its own keys (Esc). */
  function godClear() {
    if (ZSR.Locks && ZSR.Locks.isOpen()) return false;
    Tutorial.enter(null); // a tutorial card or "Now you try" is dropped; the next screen shows its own
    if (ZSR.Typing && ZSR.Typing.isOpen()) ZSR.Typing.close();
    if (!$("screen-base").classList.contains("hidden")) Base.close();
    if (!$("screen-backpack").classList.contains("hidden")) Backpack.close();
    crewCardHide();
    $("screen-confirm").classList.add("hidden");
    confirmCancel = null;
    Game.stop();
    if (firstPerson()) Interior.leave();
    Map.hide();
    hideScreens();
    showCanvas(null);
    active = null;
    return true;
  }
  /** Start god mode on a copy of the loaded save (or a fresh one) and go to the yard. */
  function godBegin(fresh) {
    if (!godClear()) return false;
    State.godStart(fresh || !State.save);
    applySettings();
    goYard({ firstCalm: W.DEFENSE.firstCalmSeconds });
    return true;
  }
  /** Go anywhere in god mode. where: { kind: "yard" } | { kind: "drive", from, to } (the road, from any place)
      | { kind: "jump", to } (out of the van at the door) | { kind: "inside", to } (straight in, no door note).
      Every trip starts fresh from the sandbox's base save. False when it could not go. */
  function godGo(where) {
    const w = where || {};
    if (!State.god || !godClear()) return false;
    const loc = W.LOCATIONS.find((l) => l.id === w.to);
    if (w.kind === "yard" || !loc || (w.to === "base" && w.kind !== "drive")) {
      State.trip = null;
      goYard({ firstCalm: W.DEFENSE.firstCalmSeconds });
      return true;
    }
    State.startTrip();
    if (w.kind === "drive") {
      const from = w.from || "base";
      State.trip.at = from;
      if (from === w.to || !Map.route(from, w.to)) {
        openMap(from);
        return false;
      }
      drive(w.to);
      return true;
    }
    State.trip.at = w.to;
    if (w.kind === "inside") {
      if (loc.outdoor) enterRiver(loc);
      else enterBuilding(loc);
    } else onArrive(w.to);
    return true;
  }
  /** Leave god mode for the title screen (the sandbox is dropped). */
  function godExit() {
    if (!godClear()) return false;
    quitToTitle();
    return true;
  }

  /* ---------- Full screen ---------- */
  // The top-left button shows only while the page is not full screen, and never where the
  // browser cannot go full screen (iPhone Safari).
  const fsCan = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || (root.matchMedia && root.matchMedia("(display-mode: fullscreen)").matches));
  }
  function syncFullscreen() {
    const show = fsCan && !isFullscreen();
    $("btn-fullscreen").classList.toggle("hidden", !show);
    document.documentElement.classList.toggle("fs-btn", show);
  }
  function enterFullscreen() {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) return;
    const p = req.call(el);
    if (p && p.catch) p.catch(() => {}); // refused (not from a click, or blocked by the page's host): the button stays
  }

  /* ---------- Wiring ---------- */
  function wire() {
    $("btn-fullscreen").addEventListener("click", (e) => {
      e.currentTarget.blur(); // so Space and Enter in the game never press it again
      Audio.play("click");
      enterFullscreen();
    });
    ["fullscreenchange", "webkitfullscreenchange"].forEach((ev) => document.addEventListener(ev, syncFullscreen));
    root.addEventListener("resize", syncFullscreen); // F11 full screen fires no fullscreenchange
    syncFullscreen();
    $("btn-newsave-start").addEventListener("click", () => {
      Audio.play("click");
      startNewGame();
    });
    $("newsave-name").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startNewGame();
      }
    });
    $("btn-newsave-back").addEventListener("click", () => {
      pendingSlot = null;
      show("screen-title");
    });
    $("btn-settings").addEventListener("click", () => {
      settingsReturn = "screen-title";
      show("screen-settings");
    });
    $("btn-howto").addEventListener("click", () => {
      settingsReturn = "screen-title";
      renderHowto();
      show("screen-howto");
    });
    $("btn-howto-back").addEventListener("click", () => {
      Audio.play("click");
      if (settingsReturn === "start") goYardWithDay();
      else show(settingsReturn);
    });
    $("btn-settings-back").addEventListener("click", () => {
      Audio.play("click");
      if (settingsReturn === "screen-pause") show("screen-pause");
      else show("screen-title");
    });
    document.querySelectorAll("#grade-seg button").forEach((b) =>
      b.addEventListener("click", () => {
        State.settings.level = Number(b.dataset.grade);
        State.saveSettings();
        applySettings();
      })
    );
    document.querySelectorAll("#universe-seg button").forEach((b) =>
      b.addEventListener("click", () => {
        State.settings.universe = b.dataset.universe;
        State.saveSettings();
        applySettings();
      })
    );
    document.querySelectorAll("#size-seg button").forEach((b) =>
      b.addEventListener("click", () => {
        State.settings.textSize = b.dataset.size;
        State.saveSettings();
        applySettings();
      })
    );
    const bindToggle = (id, key) =>
      $(id).addEventListener("change", (e) => {
        State.settings[key] = e.target.checked;
        State.saveSettings();
      });
    bindToggle("opt-sound", "sound");
    bindToggle("opt-aim", "aimAssist");
    bindToggle("opt-shake", "shake");
    $("opt-sens").addEventListener("input", (e) => {
      State.settings.mouseSens = Number(e.target.value);
      State.saveSettings();
    });

    $("btn-pause").addEventListener("click", onPause);
    $("int-btn-pause").addEventListener("click", onPause);
    $("int-btn-backpack").addEventListener("click", onBackpack);
    $("btn-resume").addEventListener("click", resumeActive);
    $("btn-pause-backpack").addEventListener("click", () => {
      $("screen-pause").classList.add("hidden");
      Backpack.open(() => show("screen-pause"));
    });
    $("btn-pause-howto").addEventListener("click", () => {
      settingsReturn = "screen-pause";
      renderHowto();
      show("screen-howto");
    });
    // June's tutorial from the start: every card and the yard part again (off in a wave, onPause)
    $("btn-pause-tutorial").addEventListener("click", () => {
      Audio.play("click");
      if (!Tutorial.canReplay(active)) return;
      resumeActive(); // the pause menu goes; the card is not in SCREENS, so nothing hides it after
      Tutorial.replay(active); // this screen's card shows now (the yard's in a moment)
    });
    $("btn-pause-settings").addEventListener("click", () => {
      settingsReturn = "screen-pause";
      show("screen-settings");
    });
    $("btn-quit").addEventListener("click", () => {
      if (State.trip) confirm("Quit to the title? Everything since your last save at the cabin is lost.", quitToTitle);
      else quitToTitle();
    });
    $("map-btn-backpack").addEventListener("click", () => Backpack.open());
    $("map-btn-yard").addEventListener("click", backToYard); // back out of a trip before leaving the driveway
    $("map-btn-home").addEventListener("click", () => confirm("Quit to the title? Everything since your last save at the cabin is lost.", quitToTitle));
    $("btn-reload").addEventListener("click", () => {
      Audio.play("click");
      reload();
    });
    $("btn-death-title").addEventListener("click", () => {
      State.abandonTrip();
      quitToTitle();
    });
    // the crew card: Enter is its main button, Esc is "Not now" (or closes). On the document, so the yard's own
    // key handler on the window never sees them; a focused button or the name box answers Enter itself
    document.addEventListener("keydown", (e) => {
      if (!crewCard || !crewCardOpen() || !$("screen-confirm").classList.contains("hidden")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (crewCard.cancel) crewCard.cancel();
      } else if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        crewCardTab(e.shiftKey);
      } else if (e.key === "Enter") {
        const t = e.target;
        if (t && (t.tagName === "BUTTON" || t.tagName === "INPUT") && $("screen-crew").contains(t)) return;
        e.preventDefault();
        e.stopPropagation();
        if (crewCard.primary) crewCard.primary();
      }
    });
    // B closes the backpack it opens (from anywhere the backpack is up). On the document and stopped there, so the
    // game's own handler on the window never sees it and opens the backpack again once the close resumes play
    document.addEventListener("keydown", (e) => {
      if (e.code !== "KeyB" || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if ($("screen-backpack").classList.contains("hidden") || !$("screen-confirm").classList.contains("hidden")) return;
      const tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      e.stopPropagation();
      Backpack.close();
    });
    // E steps away from the computer it opens, the same way, so the yard never sees it and opens the computer again.
    // Not while something sits over the menu (the workbench, the backpack, a question, a tutorial card, a lock)
    document.addEventListener("keydown", (e) => {
      if (e.code !== "KeyE" || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if ($("screen-base").classList.contains("hidden") || !$("screen-backpack").classList.contains("hidden") || !$("screen-confirm").classList.contains("hidden")) return;
      if ((ZSR.Typing && ZSR.Typing.isOpen()) || (ZSR.Locks && ZSR.Locks.isOpen()) || Tutorial.isOpen() || crewCardOpen()) return;
      const tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      e.stopPropagation();
      Audio.play("click");
      Base.close();
    });
    // the dog's name box: typing stays in the box (P, E and the rest never reach the yard); Enter names, Esc cancels
    $("crew-dogname").addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        $("btn-crew-name").click();
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (crewCard && crewCard.cancel) crewCard.cancel();
      } else if (e.key === "Tab") {
        e.preventDefault();
        crewCardTab(e.shiftKey);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    Game.init($("game"), { onArrive, onWrongTurn, onDeath, onPause, onPauseKey });
    Interior.init($("fp"), {
      onComputer: () => yardHooks.onComputer(),
      onRadio: () => yardHooks.onRadio(),
      onPractice: () => yardHooks.onPractice(),
      onVan: () => yardHooks.onVan(),
      onWaveCleared: () => yardHooks.onWaveCleared(),
      onYardChanged: () => yardHooks.onYardChanged(),
      onCrewCard: (id, action) => yardHooks.onCrewCard(id, action),
      onReadNote: (n, loc) => buildingHooks.onReadNote(n, loc),
      onExit: () => buildingHooks.onExit(),
      onDeath,
      onPause,
      onPauseKey,
      onBackpack,
    });
    if (ZSR.TutorialUI) ZSR.TutorialUI.init(); // June's card, panel and arrow; while a card is up it holds every key
    Map.init($("map-canvas"), { onDrive: drive, onEnter: reenter });
    if (ZSR.Typing && ZSR.Typing.init) ZSR.Typing.init();
    wire();
    State.loadSave();
    applySettings();
    show("screen-title");
  });

  // syncYard: js/crew.js and js/backpack.js save the base through it; confirm: the Yes/No dialog (the backpack's
  // "Give it up"); onCrewCard: the crew card, as js/crew.js opens it through the yard's hooks
  // god: js/god.js drives the screens through these (begin, go, exit)
  ZSR.Main = { syncYard, confirm, onCrewCard: (id, action) => yardHooks.onCrewCard(id, action), god: { begin: godBegin, go: godGo, exit: godExit } };
})(typeof globalThis !== "undefined" ? globalThis : this);
