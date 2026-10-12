/* The backpack: every note the player has read, kept with where it was found,
   and the note reader used at doors and inside buildings. Notes are shown at
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
