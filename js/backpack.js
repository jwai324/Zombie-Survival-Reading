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
