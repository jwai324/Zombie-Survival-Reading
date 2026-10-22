/* The reading check (Settings > Reading check, behind the owner's PIN): how long each pop-up of reading stayed
   open before the player moved on, per save. Timed: the note reader (building and door notes, June's journal, the
   radio, a crew request or thank-you read again, a note read again from the backpack) and the crew card. Not timed:
   the read panels in the world (signs, tags, wall notes, speech), which show only while the player stands near.
   Each note is written to its save's log the moment it closes (State.logReading), apart from the base save, so a
   trip lost to a death still counts, and its words are kept once (State.keepReadText) so the owner can click a
   note on the page and read what the player saw. The clock stops while the tab is hidden. Owner decision, 2026-10-22. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;

  const DEFAULT_WPM = 400; // faster than this many words a minute is flagged "too fast" (changeable on the page)
  const PIN_LEN = 4;
  const KIND_NAMES = { note: "Note", day: "June's journal", radio: "Radio", crew: "Crew", text: "Crew, read again" };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const wordCount = (t) => String(t).trim().split(/\s+/).filter(Boolean).length;
  const now = () => (root.performance && performance.now ? performance.now() : Date.now());
  const $ = (id) => document.getElementById(id);
  /** FNV-1a: the PIN is not kept as plain digits. It keeps a curious kid out, not a determined one. */
  function hash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
    return h.toString(16);
  }
  const wpmOf = (e) => (e.ms > 0 ? (e.words * 60000) / e.ms : Infinity);
  function dur(ms) {
    const s = Math.round(ms / 1000);
    return s < 60 ? s + "s" : Math.floor(s / 60) + "m " + String(s % 60).padStart(2, "0") + "s";
  }
  function median(xs) {
    if (!xs.length) return null;
    const a = xs.slice().sort((x, y) => x - y);
    const m = a.length >> 1;
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }
  /** Paragraphs from plain text: a blank line between them, a single line break kept. */
  const paragraphs = (t) => String(t).split(/\n\s*\n/).map((p) => "<p>" + esc(p.trim()).replace(/\n/g, "<br>") + "</p>").join("");
  const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
  const ordinal = (n) => n + ({ 1: "st", 2: "nd", 3: "rd" }[n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] || "th");
  const when = (at) => new Date(at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  let open = null; // the note on screen now: { screen, kind, id, title, place, words, t0, hiddenAt, hiddenMs }
  const watched = {};
  /** Stop the clock when the screen the note is on gets hidden, whichever code path hides it. */
  function watch(screen) {
    if (watched[screen] || !root.MutationObserver) return;
    const el = $(screen);
    if (!el) return;
    watched[screen] = new MutationObserver(() => {
      if (open && open.screen === screen && el.classList.contains("hidden")) ReadCheck.stop();
    });
    watched[screen].observe(el, { attributes: true, attributeFilter: ["class"] });
  }

  const ReadCheck = {
    unlocked: false, // the PIN was entered; until the page is left

    /** A pop-up of reading just opened on the screen with id `screen`. o: { kind, id, title, place, text }. */
    start(screen, o) {
      this.stop();
      const words = wordCount(o.text || "");
      if (!words) return;
      const t = now();
      open = { screen, kind: o.kind, id: o.id, title: o.title || "", place: o.place || "", text: String(o.text), words, t0: t, hiddenAt: document.hidden ? t : null, hiddenMs: 0 };
      watch(screen);
    },
    /** The note on screen closed: log how long it was open. */
    stop() {
      if (!open) return;
      const o = open;
      open = null;
      const t = now();
      const hidden = o.hiddenMs + (o.hiddenAt != null ? t - o.hiddenAt : 0);
      const S = State();
      const again = S.readLog(S.activeSlot()).some((e) => e.id === o.id);
      if (S.logReading({ at: Date.now(), kind: o.kind, id: o.id, title: o.title, place: o.place, words: o.words, ms: Math.max(0, Math.round(t - o.t0 - hidden)), level: S.settings.level, day: S.save ? S.save.day : null, again })) S.keepReadText(o.id, o.text.trim());
    },
    /** The words of a note's HTML as plain text, a blank line between its blocks, for timing and for keeping. */
    plain(html) {
      return String(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?(p|div|h\d|li|ul|ol)\b[^>]*>/gi, "\n\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m, k) => ENTITIES[k])
        .replace(/[ \t]+/g, " ")
        .replace(/ *\n */g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    },
    /** Hidden tab: the clock stops, and starts again when the tab comes back. */
    visibility() {
      if (!open) return;
      if (document.hidden) {
        if (open.hiddenAt == null) open.hiddenAt = now();
      } else if (open.hiddenAt != null) {
        open.hiddenMs += now() - open.hiddenAt;
        open.hiddenAt = null;
      }
    },

    /* ---------- The page ---------- */
    wpm() {
      return State().readCheckConfig().wpm || DEFAULT_WPM;
    },
    /** Shows the PIN box (set one the first time) or, once unlocked, the report. */
    render() {
      const body = $("readcheck-body");
      if (!body) return;
      body.innerHTML = "";
      if (!this.unlocked) return this.renderPin(body, !State().readCheckConfig().pinHash);
      this.renderReport(body);
    },
    renderPin(body, first) {
      body.innerHTML =
        '<p class="small">' + (first ? "Set a " + PIN_LEN + "-digit PIN. You need it to open this page. Players can open Settings, so keep it to yourself." : "Enter the PIN to see the reading check.") + "</p>" +
        '<div class="field rc-pin"><label for="rc-pin">' + (first ? "New PIN" : "PIN") + '</label><input type="password" id="rc-pin" inputmode="numeric" maxlength="' + PIN_LEN + '" autocomplete="off"></div>' +
        (first ? '<div class="field rc-pin"><label for="rc-pin2">The same PIN again</label><input type="password" id="rc-pin2" inputmode="numeric" maxlength="' + PIN_LEN + '" autocomplete="off"></div>' : "") +
        '<p id="rc-pin-msg" class="small rc-msg" role="alert"></p>' +
        '<div class="btn-row"><button id="rc-pin-go" class="btn go">' + (first ? "Set PIN" : "Open") + "</button></div>" +
        (first ? "" : '<p class="small muted">Forgot it? In the browser console: <code>localStorage.removeItem("zs.readcheck")</code>, then set a new one. The logs stay.</p>');
      const pin = $("rc-pin");
      const pin2 = $("rc-pin2");
      const msg = $("rc-pin-msg");
      const go = () => {
        const v = pin.value.trim();
        if (!new RegExp("^\\d{" + PIN_LEN + "}$").test(v)) {
          msg.textContent = "The PIN is " + PIN_LEN + " digits.";
          return;
        }
        const cfg = State().readCheckConfig();
        if (first) {
          if (pin2.value.trim() !== v) {
            msg.textContent = "The two PINs are not the same.";
            return;
          }
          cfg.pinHash = hash(v);
          State().saveReadCheckConfig(cfg);
        } else if (hash(v) !== cfg.pinHash) {
          msg.textContent = "Wrong PIN.";
          pin.value = "";
          pin.focus();
          return;
        }
        this.unlocked = true;
        this.render();
      };
      [pin, pin2].filter(Boolean).forEach((input) => this.keepKeys(input, go));
      $("rc-pin-go").onclick = go;
      setTimeout(() => pin.focus(), 30);
    },
    /** Typing stays in the box (no game key sees it); Enter does `enter`. */
    keepKeys(input, enter) {
      input.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          enter();
        }
      });
    },
    renderReport(body) {
      const S = State();
      const limit = this.wpm();
      const top = document.createElement("div");
      top.innerHTML =
        '<p class="small">How long each note stayed open before the player moved on. A note read faster than the line below is flagged <span class="rc-flag fast">Too fast</span>. Totals count first reads only; a note opened again shows each time it was open, and the total.</p>' +
        '<div class="field rc-wpm"><label for="rc-wpm">Too fast above (words a minute)</label><input type="number" id="rc-wpm" min="50" max="2000" step="25" value="' + limit + '"></div>' +
        '<p class="small muted">Most teens read 200 to 300 words a minute; skimming runs past 400. Time with the tab hidden is not counted, but a note left open while the player walks away still counts as reading.</p>';
      body.appendChild(top);
      const wpm = $("rc-wpm");
      const apply = () => {
        const v = Math.round(Number(wpm.value));
        if (!(v >= 50 && v <= 2000)) return;
        const cfg = S.readCheckConfig();
        cfg.wpm = v;
        S.saveReadCheckConfig(cfg);
        this.render();
      };
      wpm.addEventListener("change", apply);
      this.keepKeys(wpm, apply);

      const slots = S.listSlots().filter((sl) => sl.save || S.readLog(sl.id).length);
      if (!slots.length) body.insertAdjacentHTML("beforeend", '<p class="muted">No saves yet.</p>');
      slots.forEach((sl) => body.appendChild(this.slotBlock(sl, limit)));

      const row = document.createElement("div");
      row.className = "btn-row";
      const change = document.createElement("button");
      change.className = "btn alt";
      change.textContent = "Change PIN";
      change.onclick = () => {
        const cfg = S.readCheckConfig();
        cfg.pinHash = null;
        S.saveReadCheckConfig(cfg);
        this.unlocked = false;
        this.render();
      };
      row.appendChild(change);
      body.appendChild(row);
    },
    /** The log grouped by note: [{ id, opens: its entries oldest first, total: ms open in all }], the note
        opened last first. */
    byNote(log) {
      const by = new Map();
      log.forEach((e, i) => {
        if (!by.has(e.id)) by.set(e.id, { id: e.id, opens: [], total: 0, last: 0 });
        const n = by.get(e.id);
        n.opens.push(e);
        n.total += e.ms;
        n.last = i; // the log is oldest first, so its order is the order things were read
      });
      return [...by.values()].sort((a, b) => b.last - a.last);
    },
    /** One save: its summary line, and every timed note in a table, newest first. */
    slotBlock(sl, limit) {
      const S = State();
      const log = S.readLog(sl.id);
      const first = log.filter((e) => !e.again);
      const fast = first.filter((e) => wpmOf(e) > limit).length;
      const med = median(first.map(wpmOf).filter(isFinite));
      const total = first.reduce((a, e) => a + e.ms, 0);
      const box = document.createElement("div");
      box.className = "rc-slot";
      const who = esc(sl.label || "Player " + sl.id) + (sl.save ? ' <span class="small muted">Day ' + sl.save.day + (sl.settings ? " · " + ordinal(sl.settings.level) + " grade reading level" : "") + "</span>" : "");
      let html = '<h3 class="rc-who">' + who + "</h3>";
      if (!first.length) html += '<p class="small muted">No notes timed yet.</p>';
      else {
        const okPct = Math.round((100 * (first.length - fast)) / first.length);
        html += '<p class="rc-sum"><strong>' + okPct + "%</strong> of " + first.length + " notes read at a believable speed · " + fast + " too fast · median speed " + (med == null ? "-" : Math.round(med) + " words a minute") + " · " + dur(total) + " reading in all" + (log.length > first.length ? " · " + this.byNote(log).filter((n) => n.opens.length > 1).length + " opened more than once" : "") + "</p>";
      }
      if (log.length) {
        const notes = this.byNote(log);
        html += '<details class="rc-details"><summary>Every note (' + notes.length + ")</summary>" + '<p class="small muted">One row a note, the last one opened on top. Click a note to read it as the player saw it. Speed and the flag are for the first read; a note opened more than once lists each time it was open and the total.</p>' + '<div class="rc-scroll"><table class="rc-table"><thead><tr><th>When</th><th>What</th><th class="num">Words</th><th class="num">Opens</th><th class="num">Open</th><th class="num">Speed</th><th></th></tr></thead><tbody>';
        notes.forEach((n) => {
          const e = n.opens[0];
          const w = wpmOf(e);
          const tooFast = w > limit;
          const last = n.opens[n.opens.length - 1];
          const what = '<span class="rc-kind">' + esc(KIND_NAMES[e.kind] || e.kind) + (e.place ? " · " + esc(e.place) : "") + '</span><br><button class="rc-open" data-note="' + esc(n.id) + '" aria-expanded="false">' + esc(e.title || "Read it") + "</button>" + (e.again ? ' <span class="muted">(first read not in the log)</span>' : "");
          const whenCell = esc(when(e.at)) + (e.day ? '<br><span class="muted">Day ' + e.day + "</span>" : "") + (n.opens.length > 1 ? '<br><span class="muted">last ' + esc(when(last.at)) + "</span>" : "");
          const openCell = dur(e.ms) + (n.opens.length > 1 ? '<br><span class="rc-more">then ' + n.opens.slice(1).map((x) => dur(x.ms)).join(", ") + "</span><br><strong>" + dur(n.total) + " in all</strong>" : "");
          html += "<tr><td>" + whenCell + "</td><td>" + what + '</td><td class="num">' + e.words + '</td><td class="num">' + n.opens.length + '</td><td class="num">' + openCell + '</td><td class="num">' + (isFinite(w) ? Math.round(w) : "-") + '</td><td><span class="rc-flag ' + (tooFast ? "fast" : "ok") + '">' + (tooFast ? "Too fast" : "OK") + '</span></td></tr><tr class="rc-text-row hidden"><td colspan="7"></td></tr>';
        });
        html += "</tbody></table></div></details>";
      }
      box.innerHTML = html;
      box.onclick = (ev) => {
        const btn = ev.target && ev.target.closest && ev.target.closest(".rc-open");
        if (btn) this.toggleText(btn, sl.id, log);
      };
      if (log.length) {
        const clear = document.createElement("button");
        clear.className = "btn del rc-clear";
        clear.textContent = "Clear this log";
        clear.onclick = () => {
          if (!root.confirm("Clear the reading check log for " + (sl.label || "Player " + sl.id) + "? The save itself stays.")) return;
          S.clearReadLog(sl.id);
          this.render();
        };
        box.appendChild(clear);
      }
      return box;
    },
    /** Show or hide, under its row, the words a note showed the player (filled on first open). */
    toggleText(btn, slotId, log) {
      const row = btn.closest("tr").nextElementSibling;
      if (!row || !row.classList.contains("rc-text-row")) return;
      const show = row.classList.contains("hidden");
      if (show && !row.dataset.filled) {
        const id = btn.getAttribute("data-note");
        const text = State().readText(slotId, id);
        const e = log.find((x) => x.id === id && !x.again) || log.find((x) => x.id === id);
        const about = e ? [e.level ? ordinal(e.level) + " grade reading level" : "", e.words + " words"].filter(Boolean).join(" · ") : "";
        row.cells[0].innerHTML = text
          ? '<div class="rc-note reading"><p class="small muted">As the player saw it' + (about ? " · " + about : "") + "</p>" + paragraphs(text) + "</div>"
          : '<p class="small muted rc-note">The words of this note were not kept: it was read before the reading check kept them, or it is one of the oldest and was trimmed to save space.</p>';
        row.dataset.filled = "1";
      }
      row.classList.toggle("hidden", !show);
      btn.setAttribute("aria-expanded", show ? "true" : "false");
    },
    /** Leaving the page locks it again. */
    lock() {
      this.unlocked = false;
      const body = $("readcheck-body");
      if (body) body.innerHTML = "";
    },
  };

  if (typeof document !== "undefined" && document.addEventListener) {
    document.addEventListener("visibilitychange", () => ReadCheck.visibility());
    // the tab closed with a note open: it was open until now
    root.addEventListener && root.addEventListener("pagehide", () => ReadCheck.stop());
  }

  ZSR.ReadCheck = ReadCheck;
})(typeof globalThis !== "undefined" ? globalThis : this);
