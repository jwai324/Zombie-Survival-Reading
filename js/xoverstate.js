/* The crossover universes' save state, mixed into ZSR.State: which universe is on (Settings: Universe, per save
   slot), each universe's own progress through its journal lines and radio broadcasts, and Rivet the robot dog
   (the Captain Leo universe). Facts: js/story-leo.js, js/story-fortitude.js (WORLD.UNIVERSES, WORLD.ROBO).
   Design: docs/UNIVERSES.md. Loaded after js/crewstate.js.

   The base story never changes: with Universe off nothing here adds anything. A universe's journal lines and
   broadcasts are told in order by its own count (save.xover[u]), so one switched on late starts at its first line,
   and switching away and back loses nothing. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const W = () => ZSR.WORLD || {};
  const OFF = "off";
  const unis = () => W().UNIVERSES || {};

  const XoverState = {
    /** The universe on in this slot: a WORLD.UNIVERSES key, or "off" (Settings: Universe; old slots read off). */
    universe() {
      const u = this.settings && this.settings.universe;
      return u && unis()[u] ? u : OFF;
    },
    /** The ids Settings offers, "off" first. */
    universeIds() {
      return [OFF].concat(Object.keys(unis()));
    },
    /** The universe's facts (WORLD.UNIVERSES[u]), or null when off. */
    universeDef(u) {
      return unis()[u == null ? this.universe() : u] || null;
    },
    /** A save's fresh crossover field: one progress record per universe, and the robot dog. */
    xoverFresh() {
      const out = { robo: { hp: null, down: false } };
      // notes: how many of its notes under the cabin door are read; noteDate: the real day ("YYYY-MM-DD") one last opened
      Object.keys(unis()).forEach((u) => (out[u] = { journal: 0, radio: 0, pages: 0, radioDays: 0, notes: 0, noteDate: "" }));
      return out;
    },
    /** Fill a save's crossover field (old saves, and a universe added later). */
    xoverUpgrade(s) {
      if (!s) return s;
      const fresh = this.xoverFresh();
      if (!s.xover || typeof s.xover !== "object" || Array.isArray(s.xover)) s.xover = fresh;
      Object.keys(fresh).forEach((k) => {
        // a save that played this universe before its notes existed has seen its storyline: they wait read in the
        // backpack, and none opens by itself (docs/UNIVERSES.md "The notes under the cabin door")
        const was = s.xover[k];
        if (was && typeof was === "object" && was.notes === undefined && was.pages > 0) was.notes = ((unis()[k] || {}).notes || []).length;
        if (!s.xover[k] || typeof s.xover[k] !== "object") s.xover[k] = fresh[k];
        else Object.keys(fresh[k]).forEach((f) => {
          if (s.xover[k][f] === undefined) s.xover[k][f] = fresh[k][f];
        });
      });
      return s;
    },
    xoverSave() {
      const s = this.save;
      if (!s.xover || !s.xover.robo) this.xoverUpgrade(s);
      return s.xover;
    },

    /* ---------- June's ledger lines and the radio ---------- */
    /** The day page just written (logDay): with a universe on, every journalEvery-th page carries its next ledger
        line, and every radioEvery-th day the radio hears the news (entry.radio set) its next broadcast. Both go on
        entry.x = { u, journal, radio } (indexes into that universe's lists). The ledger stops at its last line; the
        broadcasts repeat their last third, as the base radio does (State.cycleIndex). */
    xoverLog(entry) {
      const u = this.universe();
      const def = this.universeDef(u);
      if (!def || !entry) return entry;
      const st = this.xoverSave()[u];
      const J = def.journal || [];
      const R = def.radio || [];
      const x = { u, journal: null, radio: null };
      st.pages = (st.pages || 0) + 1;
      if (st.journal < J.length && (st.pages - 1) % Math.max(1, def.journalEvery || 1) === 0) x.journal = st.journal++;
      if (entry.radio != null && R.length) {
        st.radioDays = (st.radioDays || 0) + 1;
        if ((st.radioDays - 1) % Math.max(1, def.radioEvery || 1) === 0) x.radio = this.cycleIndex(st.radio++, R.length);
      }
      if (x.journal != null || x.radio != null) entry.x = x;
      return entry;
    },

    /* ---------- The notes under the cabin door ---------- */
    /** The note due at this log on: the index of the universe's next unread note (WORLD.UNIVERSES[u].notes), when
        none opened on this real day (date: the device's local "YYYY-MM-DD", from the caller), else -1. One a day, in
        order, no catch-up. The caller holds it back while the tutorial's yard part runs (js/main.js logOn). */
    xoverNoteDue(date) {
      const u = this.universe();
      const def = this.universeDef(u);
      if (!def || !date) return -1;
      const st = this.xoverSave()[u];
      return st.notes < (def.notes || []).length && st.noteDate !== date ? st.notes : -1;
    },
    /** Note i opened on this date: the next waits for another day, and its words count once. The caller saves. */
    xoverNoteSeen(i, date, words) {
      const def = this.universeDef();
      const st = def && this.xoverSave()[this.universe()];
      if (!st || i !== st.notes || i >= (def.notes || []).length) return false;
      st.notes++;
      st.noteDate = date;
      this.save.stats.wordsRead += words || 0;
      return true;
    },
    /** The read notes of the universe on, in order (indexes), for the backpack. */
    xoverNotesRead() {
      const def = this.universeDef();
      if (!def) return [];
      return [...Array(Math.min(this.xoverSave()[this.universe()].notes || 0, (def.notes || []).length)).keys()];
    },

    /* ---------- Rivet, the robot dog (the Captain Leo universe) ---------- */
    /** Rivet is awake: the Leo universe is on and Tomas's robot quest is handed in. */
    roboHome() {
      const def = this.universeDef();
      return !!(def && def.robotQuest && this.questState && this.questState(def.robotQuest) === "done");
    },
    /** Its health: the save's, else full (WORLD.ROBO.hp). */
    roboHp() {
      const r = this.xoverSave().robo;
      const max = (W().ROBO && W().ROBO.hp) || 1;
      return r.down ? 0 : r.hp == null ? max : Math.max(0, Math.min(max, r.hp));
    },
    /** Out with you and working: home, and not shut down. */
    roboOn() {
      return this.roboHome() && !this.xoverSave().robo.down;
    },
    /** A bite: its health drops; at 0 it shuts down (until roboRepair). True when this bite shut it down. */
    roboBite(n) {
      const r = this.xoverSave().robo;
      if (r.down) return false;
      r.hp = Math.max(0, this.roboHp() - (n || 0));
      if (r.hp > 0) return false;
      r.down = true;
      r.hp = 0;
      return true;
    },
    /** At home (the yard on arrival, and when a wave is cleared): Tomas fixes it, if it is down and the base has
        the scrap (WORLD.ROBO.repairScrap), and tops it up to full if it was only bitten. Returns the scrap paid when
        he fixed it after a shutdown, -1 when it is down and the base cannot pay, else null. The caller saves. */
    roboRepair() {
      if (!this.roboHome()) return null;
      const r = this.xoverSave().robo;
      const max = (W().ROBO && W().ROBO.hp) || 1;
      if (!r.down) {
        r.hp = max;
        return null;
      }
      const cost = (W().ROBO && W().ROBO.repairScrap) || 0;
      if ((this.save.scrap || 0) < cost) return -1;
      this.save.scrap -= cost;
      r.down = false;
      r.hp = max;
      return cost;
    },
  };

  /** A crossover journal line, broadcast or note at the reading level: { title, text } (kind "journal" | "radio" | "notes"). */
  ZSR.xoverText = function xoverText(u, kind, idx) {
    const e = ZSR.textAt
      ? ZSR.textAt((t) => {
          const list = t.universe && t.universe[u] && t.universe[u][kind];
          return list && list[idx] && list[idx].text ? list[idx] : null;
        })
      : null;
    if (e) return { title: e.title || "", text: e.text };
    const def = (W().UNIVERSES || {})[u];
    const f = def && (def[kind] || [])[idx];
    return { title: "", text: f ? f.facts.join(" ") : "" };
  };

  if (ZSR.State) Object.assign(ZSR.State, XoverState);
  ZSR.XoverState = XoverState;
})(typeof globalThis !== "undefined" ? globalThis : this);
