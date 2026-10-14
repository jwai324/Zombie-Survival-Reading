/* The backpack: medical kits, every note the player has read (kept with where it was
   found), and the note reader used at doors and inside buildings. Notes are shown at
   the current reading level, so changing the level re-renders them. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const W = () => ZSR.WORLD;

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const paragraphs = (text) => String(text).split(/\n\s*\n/).map((p) => "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>").join("");
  const wordCount = (t) => String(t).trim().split(/\s+/).filter(Boolean).length;
  const STAR_PATH = "M12 2.2l2.9 6.4 7 .7-5.3 4.7 1.6 6.9L12 17.3l-6.2 3.6 1.6-6.9L2.1 9.3l7-.7z";
  /** A crew text at the reading level with its {placeholders} filled ("" when the crew files are missing). */
  const crewWords = (kind, id, sub, vars) => (ZSR.crewText ? ZSR.crewFill(ZSR.crewText(kind, id, sub), vars) : "");
  const placeName = (id) => {
    const l = W().LOCATIONS.find((x) => x.id === id);
    return l ? l.name : String(id);
  };
  const plural = (n, word) => n + " " + word + (n === 1 ? "" : "s");

  const Backpack = {
    onClose: null,

    /** List every held note. `onClose` runs when the overlay closes. */
    open(onClose) {
      this.onClose = onClose;
      const screen = document.getElementById("screen-backpack");
      if (ZSR.Tip) ZSR.Tip.init();
      this.renderKits();
      const keysBox = document.getElementById("backpack-keys");
      if (keysBox) {
        keysBox.innerHTML = "";
        keysBox.appendChild(this.keysBlock(() => this.open(onClose)));
      }
      this.renderCrew(onClose);
      this.renderDays(onClose);
      this.renderTags();
      const body = document.getElementById("backpack-body");
      body.innerHTML = "";
      const notes = State().allNotes();
      if (!notes.length) {
        body.appendChild(el("p", "muted", "Empty. Notes you read at doors and inside buildings are kept here, with where you found them."));
      } else {
        const byLoc = {};
        notes.forEach((n) => (byLoc[n.locId] = byLoc[n.locId] || []).push(n));
        Object.entries(byLoc).forEach(([locId, list]) => {
          const loc = W().LOCATIONS.find((l) => l.id === locId);
          const group = el("div", "note-group");
          group.appendChild(el("h3", null, esc(loc ? loc.name : locId)));
          list.forEach((n) => {
            const t = ZSR.noteText(locId, n.noteId);
            const card = el("button", "note-card");
            card.appendChild(el("span", "note-title", esc(t.title)));
            card.appendChild(el("span", "note-found", "Found " + esc(n.found) + " · day " + n.day));
            card.addEventListener("click", () => this.read(locId, n.noteId, { found: n.found, onClose: () => this.open(onClose) }));
            group.appendChild(card);
          });
          body.appendChild(group);
        });
      }
      screen.classList.remove("hidden");
      document.getElementById("btn-backpack-close").onclick = () => this.close();
    },

    /** Stash keys held: how each looks, where it was found, its tag, and the note that led to it (which says what it opens).
        `reopen` brings this view back after reading the clue. Shared with the cabin's stock tab. */
    keysBlock(reopen) {
      const S = State();
      const wrap = el("div", "keys-block");
      const held = S.keysHeld();
      wrap.appendChild(el("h3", null, "Stash keys" + (held.length ? " (" + held.length + ")" : "")));
      if (!held.length) {
        wrap.appendChild(el("p", "small muted", "No keys yet. Every building hides the key to another building's stash. Read the notes inside: one of them leads to the key."));
        return wrap;
      }
      wrap.appendChild(el("p", "small muted", "A key does not say what it opens. The note that led you to it does. At a stash, you pick the key to try."));
      held.forEach((k) => {
        const kt = ZSR.keyText(k.from);
        const from = W().LOCATIONS.find((l) => l.id === k.from);
        // which stash it opens is in the note that led to it, not on the key: read the clue again
        const card = el("div", "key-card");
        card.appendChild(el("div", "key-name", esc(kt.name) + (k.broken ? " (broken)" : "")));
        if (k.broken) card.appendChild(el("div", "small", "It snapped off in the wrong lock. It is gone."));
        card.appendChild(el("div", "small muted", "Found at " + esc(from.name) + (k.trip ? ", this trip: get it home to keep it" : ", day " + k.day)));
        if (kt.tag) card.appendChild(el("p", "key-tag", esc(kt.tag)));
        const K = W().NOTES[k.from].key;
        if (K && S.noteRead(K.after)) {
          const b = el("button", "btn alt small-btn", "Read the clue again");
          b.addEventListener("click", () => {
            const n = W().NOTES[k.from].notes.find((x) => x.id === K.after);
            document.getElementById("screen-backpack").classList.add("hidden");
            this.read(k.from, K.after, { found: n ? n.found : "", onClose: () => (reopen ? reopen() : null) });
          });
          card.appendChild(b);
        }
        wrap.appendChild(card);
      });
      return wrap;
    },

    /** Trust stars: one filled star for each earned, of as many as CREW_RULES.stars has. Shared with the crew card. */
    crewStars(id) {
      const S = State();
      const total = ((W().CREW_RULES || {}).stars || []).length;
      const n = S.stars ? Math.min(total, S.stars(id)) : 0;
      const wrap = el("span", "crew-stars");
      wrap.setAttribute("role", "img");
      wrap.setAttribute("aria-label", "Trust: " + n + " of " + total + " stars");
      wrap.title = "Trust: " + n + " of " + total + " stars";
      for (let i = 0; i < total; i++) wrap.insertAdjacentHTML("beforeend", '<svg class="crew-star' + (i < n ? " on" : "") + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + STAR_PATH + '"/></svg>');
      return wrap;
    },

    /** Any text in the note reader (a crew request read again, a thank-you). o: { caption, title, found, text,
        primary, onClose }. Words are counted by the caller (State.seeCrewTalk). */
    showText(o) {
      const screen = document.getElementById("screen-note");
      document.getElementById("note-caption").textContent = o.caption || "";
      document.getElementById("note-title").textContent = o.title || "";
      document.getElementById("note-found").textContent = o.found || "";
      document.getElementById("note-text").innerHTML = paragraphs(o.text || "");
      const primary = document.getElementById("btn-note-primary");
      document.getElementById("btn-note-secondary").classList.add("hidden");
      primary.textContent = o.primary || "Close";
      primary.onclick = () => {
        ZSR.Audio.play("click");
        screen.classList.add("hidden");
        if (o.onClose) o.onClose();
      };
      screen.classList.remove("hidden");
      screen.querySelector(".panel").scrollTop = 0;
    },

    /** The crew: each one's trust stars, their open requests (read again, give up), the dog's name, and the story
        quests already handed in (read the thank-you again). Data-driven: every CREW id, every request. */
    renderCrew(onClose) {
      const box = document.getElementById("backpack-crew");
      if (!box) return;
      box.innerHTML = "";
      const S = State();
      const ids = S.crewIds ? S.crewIds() : [];
      if (!ids.length || !ZSR.crewName) return;
      const reopen = () => this.open(onClose);
      const I = ZSR.Interior;
      const ctx = {
        reopen,
        atHome: !S.trip,
        inWave: !!(I && I.mode === "yard" && I.phase && I.phase.kind === "wave"),
      };
      const dogQuest = (W().QUESTS || []).find((q) => q && q.kind === "dog");
      const wrap = el("div", "bp-crew");
      const open = ids.reduce((n, id) => n + S.requests(id).length, 0);
      wrap.appendChild(el("h3", null, "The crew" + (open ? " (" + open + " request" + (open > 1 ? "s" : "") + " open)" : "")));
      ids.forEach((id) => {
        const c = W().CREW[id] || {};
        const name = ZSR.crewName(id);
        const card = el("div", "bp-crew-card");
        if (c.color) card.style.setProperty("--crew", c.color);
        const head = el("div", "bp-crew-head");
        head.appendChild(el("span", "bp-crew-name", esc(name)));
        head.appendChild(this.crewStars(id));
        card.appendChild(head);
        const reqs = S.requests(id);
        if (!reqs.length) card.appendChild(el("p", "small muted", "Nothing open with " + esc(name) + " right now. Talk to " + esc(name) + " at the cabin."));
        reqs.forEach((r) => card.appendChild(this.crewRequest(id, r, ctx)));
        // the dog, on the card of the crew member whose quest brought it home
        if (dogQuest && dogQuest.giver === id && S.dogHome && S.dogHome()) {
          const dn = S.dogName();
          card.appendChild(el("p", "small bp-crew-dog", dn ? "<strong>The dog:</strong> " + esc(dn) + "." : "<strong>The dog</strong> is home. " + esc(name) + " wants you to give it a name."));
        }
        const done = S.crewQuests(id).filter((q) => q.st && q.st.state === "done");
        if (done.length) {
          const det = el("details", "bp-crew-done");
          det.appendChild(el("summary", null, "Done for " + esc(name) + " (" + done.length + ")"));
          done.forEach(({ def, st }) => {
            const title = crewWords("quest", def.id, "title");
            const b = el("button", "note-card");
            b.appendChild(el("span", "note-title", esc(title)));
            b.appendChild(el("span", "note-found", "From " + esc(placeName(def.at)) + (st.doneDay ? " · handed over on day " + st.doneDay : "")));
            b.addEventListener("click", () => {
              const text = crewWords("quest", def.id, "done", S.requestVars({ kind: "quest", def }));
              if (S.seeCrewTalk) S.seeCrewTalk("quest:" + def.id + ":done", wordCount(text));
              document.getElementById("screen-backpack").classList.add("hidden");
              this.showText({ caption: name + " · done", title, found: "You brought it home from " + placeName(def.at) + ".", text, primary: "Back", onClose: reopen });
            });
            det.appendChild(b);
          });
          card.appendChild(det);
        }
        wrap.appendChild(card);
      });
      box.appendChild(wrap);
    },

    /** One open request in the Crew section: its title, where it is (or the errand's count and days left), and
        buttons to read it again and to give it up (at home, between waves; never a story object already home). */
    crewRequest(id, r, ctx) {
      const S = State();
      const name = ZSR.crewName(id);
      const isQuest = r.kind === "quest";
      const did = r.def.id;
      const vars = S.requestVars(r);
      const title = crewWords(r.kind, did, "title", vars);
      const row = el("div", "bp-crew-req");
      row.appendChild(el("div", "note-title", esc(title)));
      const lines = [];
      if (isQuest) {
        const dog = r.def.kind === "dog";
        const place = placeName(r.def.at);
        if (r.st.state === "found") lines.push(dog ? "The dog is home. Talk to " + name + "." : "It is home. Talk to " + name + " to hand it over.");
        else if (S.questHeld(did)) lines.push(dog ? "The dog is with you this trip. Get it home." : "You have it this trip. Get it home to keep it.");
        else lines.push(dog ? "Where: " + place + ". Hold out " + name + "'s treats (E), and the dog will follow you." : "Where: " + place + ".");
      } else {
        const st = r.st;
        const have = Math.min(st.have || 0, st.count);
        lines.push("Bring " + vars.count + " of these: " + vars.item + ". Brought home: " + have + " of " + st.count + ".");
        if (S.requestReady(r)) lines.push("Ready. Talk to " + name + " to hand them over.");
        else if (have >= st.count) lines.push("Keep " + st.count + " in storage to hand them over.");
        else lines.push(plural(vars.days, "day") + " left.");
      }
      if (vars.reward) lines.push("Reward: " + vars.reward + ".");
      row.appendChild(el("p", "small", lines.map(esc).join(" ")));
      const btns = el("div", "bp-crew-btns");
      const again = el("button", "btn alt small-btn", "Read it again");
      again.addEventListener("click", () => {
        const text = crewWords(r.kind, did, "brief", vars);
        if (S.seeCrewTalk) S.seeCrewTalk(r.kind + ":" + did + ":brief", wordCount(text));
        document.getElementById("screen-backpack").classList.add("hidden");
        this.showText({ caption: name + "'s request", title, found: r.st && r.st.day ? "You said yes on day " + r.st.day + "." : "", text, primary: "Back", onClose: ctx.reopen });
      });
      btns.appendChild(again);
      // a story object already home is handed over, never given up (State.giveUp refuses it too)
      if (!(isQuest && r.st.state === "found")) {
        const can = ctx.atHome && !ctx.inWave;
        const give = el("button", "btn small-btn bp-crew-give", "Give it up");
        give.disabled = !can;
        give.title = !ctx.atHome ? "Only at home, at the cabin." : ctx.inWave ? "Not in a wave." : name + " will trust you a little less.";
        give.addEventListener("click", () => {
          if (!can) return;
          const yes = () => {
            if (!S.giveUp(id, did)) return;
            const Main = ZSR.Main;
            const I = ZSR.Interior;
            if (Main && Main.syncYard && I && I.mode === "yard") Main.syncYard(); // saved at the base, never mid-wave
            else S.commit();
            ctx.reopen();
          };
          const ask = 'Give up "' + title + '"? ' + name + " will trust you a little less." + (isQuest ? " " + name + " can ask you again later." : "");
          if (ZSR.Main && ZSR.Main.confirm) ZSR.Main.confirm(ask, yes, { caption: "Give it up?", yes: "Give it up", no: "Keep it" });
          else if (root.confirm(ask)) yes();
        });
        btns.appendChild(give);
      }
      row.appendChild(btns);
      return row;
    },

    /** The backpack open at June's journal and the radio (the radio shelf in the cabin's living room). */
    openDays(onClose) {
      this.open(onClose);
      const det = document.querySelector("#backpack-days details");
      if (det) {
        det.open = true;
        if (det.scrollIntoView) det.scrollIntoView({ block: "start" });
      }
    },

    /** June's journal and the radio, one entry per day, newest first. */
    renderDays(onClose) {
      const box = document.getElementById("backpack-days");
      if (!box) return;
      box.innerHTML = "";
      const log = (State().save.log || []).slice().reverse();
      if (!log.length) return;
      const det = el("details", "bp-section");
      det.appendChild(el("summary", null, "June's journal and the radio (" + log.length + " day" + (log.length > 1 ? "s" : "") + ")"));
      log.forEach((entry) => {
        const j = entry.journal != null ? ZSR.dayText("journal", entry.journal) : null;
        const card = el("button", "note-card");
        const jt = j && j.title ? j.title : "";
        card.appendChild(el("span", "note-title", /^day\s*\d/i.test(jt) ? esc(jt) : "Day " + entry.day + (jt ? ": " + esc(jt) : "")));
        card.appendChild(el("span", "note-found", entry.radio != null ? "Journal and a radio broadcast" : "Journal"));
        card.addEventListener("click", () => {
          document.getElementById("screen-backpack").classList.add("hidden");
          this.showDay(entry, { primary: "Back", onClose: () => this.open(onClose) });
        });
        det.appendChild(card);
      });
      box.appendChild(det);
    },

    /** Tags of every item picked up so far: both sides of each. */
    renderTags() {
      const box = document.getElementById("backpack-tags");
      if (!box) return;
      box.innerHTML = "";
      const S = State();
      // the fishing pole's tag: the way to River Landing
      if (S.hasRod() && ZSR.riverText) {
        const rt = ZSR.riverText("rod");
        const card = el("div", "tag-card");
        card.appendChild(el("div", "note-title", esc(rt.name)));
        card.appendChild(el("p", "key-tag", esc(rt.tag)));
        box.appendChild(card);
      }
      const seen = Object.keys(W().ITEMS).filter((k) => S.tagSeen(k));
      if (!seen.length) return;
      const det = el("details", "bp-section");
      det.appendChild(el("summary", null, "Item tags (" + seen.length + " of " + Object.keys(W().ITEMS).length + ")"));
      seen.forEach((k) => {
        const card = el("div", "tag-card");
        card.appendChild(el("div", "note-title", esc(W().ITEMS[k].name)));
        [0, 1].forEach((v) => {
          const t = ZSR.tagText(k, v);
          if (t) card.appendChild(el("p", "key-tag", esc(t)));
        });
        det.appendChild(card);
      });
      box.appendChild(det);
    },

    /** One day: a recap of the trip, June's journal entry, and the radio if the Radio room is built.
        opts: { primary, onClose }. The first reading counts toward words read. */
    showDay(entry, opts) {
      const o = opts || {};
      const S = State();
      const screen = document.getElementById("screen-note");
      const j = entry.journal != null ? ZSR.dayText("journal", entry.journal) : { title: "", text: "" };
      const r = entry.radio != null ? ZSR.dayText("radio", entry.radio) : null;
      const recap = ZSR.recapText(entry.recap);
      document.getElementById("note-caption").textContent = "Day " + entry.day + " · home";
      document.getElementById("note-title").textContent = j.title || "June's journal";
      document.getElementById("note-found").textContent = "From June's green ledger" + (r ? ", and the radio" : "");
      let html = "";
      if (recap) html += '<p class="recap">' + esc(recap) + "</p>";
      html += paragraphs(j.text);
      // June's ledger line for each story quest handed in since the day before (docs/CREW.md), counted once
      (entry.quests || []).forEach((qid) => {
        const line = crewWords("quest", qid, "journal");
        if (!line.trim()) return;
        html += '<div class="ledger-quest">' + paragraphs(line) + "</div>";
        if (S.seeCrewTalk) S.seeCrewTalk("quest:" + qid + ":journal", wordCount(line));
      });
      if (r) html += '<h4 class="radio-head">On the radio' + (r.title ? ": " + esc(r.title) : "") + "</h4>" + paragraphs(r.text);
      document.getElementById("note-text").innerHTML = html;
      if (!entry.read) {
        entry.read = true;
        S.save.stats.wordsRead += wordCount(recap + " " + j.text + " " + (r ? r.text : ""));
      }
      const primary = document.getElementById("btn-note-primary");
      document.getElementById("btn-note-secondary").classList.add("hidden");
      primary.textContent = o.primary || "Close";
      primary.onclick = () => {
        ZSR.Audio.play("click");
        screen.classList.add("hidden");
        if (o.onClose) o.onClose();
      };
      screen.classList.remove("hidden");
      screen.querySelector(".panel").scrollTop = 0;
    },

    /** Medical kits: packed in the backpack, in storage at the cabin, or in the van's cargo. One kit heals to full. */
    renderKits() {
      const S = State();
      const I = ZSR.Interior;
      const box = document.getElementById("backpack-kits");
      box.innerHTML = "";
      const k = S.kitsHeld();
      const max = W().SETTINGS.kitsMax;
      const atHome = !S.trip;
      const inside = I && I.running && I.player; // in the yard or a building (paused under this overlay)
      const hurt = inside && I.player.hp < I.player.maxHp;
      const wrap = el("div", "kits");
      let pips = '<span class="kit-pips">';
      for (let i = 0; i < max; i++) pips += '<span class="' + (i < k.packed ? "on" : "") + '"></span>';
      pips += "</span>";
      wrap.appendChild(el("h3", null, "Medical kits " + pips));
      wrap.appendChild(el("p", "small", "<strong>" + k.packed + " of " + max + "</strong> packed. One kit heals you to full." + (inside ? " You: " + Math.round(I.player.hp) + " / " + I.player.maxHp + " health." : "") + (atHome ? " In storage: " + k.storage + "." : k.cargo ? " In the van's cargo: " + k.cargo + "." : "")));
      const row = el("div", "row");
      const tip = (node, html) => {
        node.setAttribute("data-tip", html);
        return node;
      };
      // packing or unpacking a kit at the cabin is saved the way the yard saves: never in the middle of a wave (a
      // death in it reloads the save from before it began, so nothing that wave did may be written mid-wave)
      const saveAtHome = () => {
        const Main = ZSR.Main;
        if (Main && Main.syncYard && I && I.mode === "yard") Main.syncYard();
        else S.commit();
      };
      const heal = (from) => {
        if (!hurt) return;
        if (S.useKit(from)) {
          I.heal();
          ZSR.Audio.play("correct");
          I.toast("Patched up. Full health.", 2.5);
          if (atHome && ZSR.Main) ZSR.Main.syncYard(); // saved at the base, never mid-wave
          this.renderKits();
        }
      };
      const use = el("button", "btn" + (hurt && k.packed ? " go" : ""), "Use a kit");
      use.disabled = !hurt || !k.packed;
      const why = !inside ? "Kits are used in the yard or inside a building." : !hurt ? "You are at full health." : !k.packed ? "No kits packed." : "Heals you to full, right now.";
      use.title = why;
      tip(use, "<strong>Use a kit</strong><span class='t-line'>" + why + "</span>");
      use.addEventListener("click", () => heal("pack"));
      row.appendChild(use);
      if (!atHome && k.cargo) {
        const useCargo = el("button", "btn" + (hurt ? " go" : ""), "Use one from the cargo (" + k.cargo + ")");
        useCargo.disabled = !hurt;
        tip(useCargo, "<strong>Kit from the van</strong><span class='t-line'>A medical kit you picked up this trip. Using it here means one less to bring home.</span>");
        useCargo.addEventListener("click", () => heal("cargo"));
        row.appendChild(useCargo);
      }
      if (atHome) {
        const pack = el("button", "btn", "Pack a kit from storage");
        pack.disabled = !(k.storage > 0 && k.packed < max);
        tip(pack, "<strong>Pack a kit</strong><span class='t-line'>Moves one Medical kit from storage into the backpack (up to " + max + "). Rooms that need kits cannot use packed ones.</span>");
        pack.addEventListener("click", () => {
          if (S.packKit()) {
            saveAtHome();
            ZSR.Audio.play("pickup");
            this.renderKits();
          }
        });
        row.appendChild(pack);
        const unpack = el("button", "btn alt", "Put one back");
        unpack.disabled = !(k.packed > 0);
        tip(unpack, "<strong>Put one back</strong><span class='t-line'>Returns a packed kit to storage for building the Medbay or the Lab.</span>");
        unpack.addEventListener("click", () => {
          if (S.unpackKit()) {
            saveAtHome();
            ZSR.Audio.play("click");
            this.renderKits();
          }
        });
        row.appendChild(unpack);
      }
      wrap.appendChild(row);
      if (atHome && !k.storage && !k.packed) wrap.appendChild(el("p", "small muted", "No medical kits yet. Pharmacies and the hospital have them; the Lab makes them."));
      box.appendChild(wrap);
    },
    close() {
      document.getElementById("screen-backpack").classList.add("hidden");
      const cb = this.onClose;
      this.onClose = null;
      if (cb) cb();
    },

    /**
     * Show one note. opts: { found, isDoor, primary: "Go in" | "Close", onClose,
     * secondary: { label, action } }. Reading it counts toward the backpack.
     */
    read(locId, noteId, opts) {
      const o = opts || {};
      const S = State();
      const t = ZSR.noteText(locId, noteId);
      const loc = W().LOCATIONS.find((l) => l.id === locId);
      const screen = document.getElementById("screen-note");
      document.getElementById("note-caption").textContent = (loc ? loc.name : "") + (o.isDoor ? " · at the door" : "");
      document.getElementById("note-title").textContent = t.title;
      document.getElementById("note-found").textContent = o.found ? "Found " + o.found : "";
      document.getElementById("note-text").innerHTML = paragraphs(t.text);
      const primary = document.getElementById("btn-note-primary");
      const secondary = document.getElementById("btn-note-secondary");
      primary.textContent = o.primary || "Close";
      secondary.classList.toggle("hidden", !o.secondary);
      if (o.secondary) secondary.textContent = o.secondary.label;
      const wasNew = S.trip ? S.readNote(noteId, locId, o.found || "") : false;
      if (wasNew && S.trip) S.trip.wordsRead += wordCount(t.text);
      const done = (which) => {
        screen.classList.add("hidden");
        if (which === "secondary" && o.secondary) o.secondary.action();
        else if (o.onClose) o.onClose(wasNew);
      };
      primary.onclick = () => {
        ZSR.Audio.play("click");
        done("primary");
      };
      secondary.onclick = () => {
        ZSR.Audio.play("click");
        done("secondary");
      };
      screen.classList.remove("hidden");
      screen.querySelector(".panel").scrollTop = 0;
      return wasNew;
    },
  };

  ZSR.Backpack = Backpack;
})(typeof globalThis !== "undefined" ? globalThis : this);
