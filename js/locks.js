/* Locks: the answers each save rolls for the cache locks (WORLD.LOCKS), the {placeholders} they
   fill in the notes, the lock prompt (a keypad, word buttons, a choice, the stash key picker, the
   crowbar), "god mode", and the art of the fixtures (drawers, cans, the key board, breaker boxes,
   books, the alarm panel).

   Every answer comes from the save's lockSeed and the place, so it is the same on every visit and
   every reading level, and different in every save. A decoy answer is always clearly different. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const W = () => ZSR.WORLD;
  const State = () => ZSR.State;
  const DIGIT_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const GOD = "god mode";
  const GOD_MS = 2500; // first letter to last, to count as "very quickly"

  /* ---------- Answers ---------- */
  function rng(seed, salt) {
    let h = (seed >>> 0) ^ 0x9e3779b9;
    for (let i = 0; i < salt.length; i++) h = Math.imul(h ^ salt.charCodeAt(i), 2654435761);
    return function () {
      h = (h + 0x6d2b79f5) | 0;
      let t = Math.imul(h ^ (h >>> 15), 1 | h);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pickIdx = (r, n) => Math.floor(r() * n);
  /** A code for a pattern ("####", "##-#-##"): every digit different from its neighbor, never one digit four times. */
  function makeCode(r, pattern) {
    let out = "";
    let prev = -1;
    for (const ch of pattern) {
      if (ch !== "#") {
        out += ch;
        continue;
      }
      let d;
      do d = pickIdx(r, 10);
      while (d === prev);
      prev = d;
      out += d;
    }
    return out;
  }
  const digitsOf = (code) => code.replace(/\D/g, "");
  /** A decoy code that shares no digit in any place with the real one and is not made of the same digits. */
  function makeDecoyCode(r, pattern, code) {
    const real = digitsOf(code);
    const sorted = real.split("").sort().join("");
    for (let tries = 0; tries < 200; tries++) {
      const d = makeCode(r, pattern);
      const dd = digitsOf(d);
      if ([...dd].some((c, i) => c === real[i])) continue;
      if (dd.split("").sort().join("") === sorted) continue;
      return d;
    }
    return pattern.replace(/#/g, (_, i) => String((Number(real[0]) + 5) % 10));
  }
  const spoken = (code) => code.split("-").map((g) => g.split("").map((c) => DIGIT_WORDS[Number(c)]).join(" ")).join(", ");

  const memo = {};
  const Locks = {
    GOD,
    GOD_MS,
    /** The lock of a place's cache (WORLD.LOCKS), or null. */
    spec(locId) {
      return (W().LOCKS || {})[locId] || null;
    },
    seed() {
      const s = State() && State().save;
      return (s && s.lockSeed) || 1;
    },
    /** This save's answers for a place: { code, decoyCode, moves: [..], decoyMoves, pick, decoyPick, button, decoyButton }. */
    answer(locId) {
      const L = this.spec(locId);
      if (!L) return {};
      const key = this.seed() + ":" + locId;
      if (memo[key]) return memo[key];
      const r = rng(this.seed(), locId);
      const a = {};
      const d = L.door || {};
      if (d.kind === "code") {
        a.code = makeCode(r, d.pattern || "####");
        a.decoyCode = makeDecoyCode(r, d.pattern || "####", a.code);
      }
      if (d.kind === "moves") {
        const i = pickIdx(r, d.variants.length);
        a.moves = d.variants[i].slice();
        // the decoy differs at every step
        const others = d.variants.filter((v) => v.every((m, j) => m !== a.moves[j]));
        a.decoyMoves = (others.length ? others[pickIdx(r, others.length)] : d.variants[(i + 1) % d.variants.length]).slice();
      }
      if (L.search) {
        const n = L.search.options.length;
        const i = pickIdx(r, n);
        a.pick = L.search.options[i];
        a.decoyPick = L.search.options[(i + 1 + pickIdx(r, n - 1)) % n];
      }
      if (L.panel) {
        const n = L.panel.options.length;
        const i = pickIdx(r, n);
        a.button = L.panel.options[i];
        a.decoyButton = L.panel.options[(i + 1 + pickIdx(r, n - 1)) % n];
      }
      memo[key] = a;
      return a;
    },
    /** The words the {placeholders} stand for at this place. */
    vars(locId) {
      const a = this.answer(locId);
      const v = {};
      if (a.code) {
        v.code = a.code;
        v.codeSpoken = spoken(a.code);
        v.decoyCode = a.decoyCode;
        v.decoyCodeSpoken = spoken(a.decoyCode);
      }
      if (a.moves) {
        v.move1 = a.moves[0];
        v.move2 = a.moves[1];
        v.moves = a.moves.join(", then ");
        v.decoyMove1 = a.decoyMoves[0];
        v.decoyMove2 = a.decoyMoves[1];
        v.decoyMoves = a.decoyMoves.join(", then ");
      }
      if (a.pick) {
        v.pick = a.pick;
        v.decoyPick = a.decoyPick;
      }
      if (a.button) {
        v.button = a.button;
        v.decoyButton = a.decoyButton;
      }
      return v;
    },
    /** Fill a place's {placeholders} in a text (unknown ones stay as they are). */
    fill(locId, text) {
      if (!text || String(text).indexOf("{") < 0) return text;
      const v = this.vars(locId);
      return String(text).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
    },
    /** For tests: forget the rolled answers (a new save seed). */
    reset() {
      Object.keys(memo).forEach((k) => delete memo[k]);
    },

    /* ---------- The lock prompt ----------
       opts: { caption, title, text, kind: "code" | "moves" | "choice" | "crowbar", pattern (code),
               words + steps (moves), options: [{ label, value, sub, disabled }] (choice), go (button label),
               onDone(result) } with result { value } | { god: true } | { cancel: true }.
       Typing "god mode" within GOD_MS, from the g to the e, opens any lock. */
    isOpen() {
      const el = document.getElementById("screen-lock");
      return !!el && !el.classList.contains("hidden");
    },
    prompt(opts) {
      const $ = (id) => document.getElementById(id);
      const screen = $("screen-lock");
      const body = $("lock-body");
      const go = $("btn-lock-go");
      const back = $("btn-lock-back");
      $("lock-caption").textContent = opts.caption || "Locked";
      $("lock-title").textContent = opts.title || "";
      $("lock-text").textContent = opts.text || "";
      body.innerHTML = "";
      body.className = "lock-body lock-" + opts.kind;
      let value = null; // what "Try it" sends
      let ready = () => false;
      const typed = []; // [{ c, t }] for god mode
      const btn = (label, cls, fn) => {
        const b = document.createElement("button");
        b.className = "btn " + (cls || "");
        b.textContent = label;
        b.addEventListener("click", (e) => {
          if (e.currentTarget.blur) e.currentTarget.blur(); // Space and Enter belong to the lock, not the last button
          fn();
        });
        return b;
      };
      const sync = () => (go.disabled = !ready());
      let onKey = null;

      if (opts.kind === "code") {
        const pattern = opts.pattern || "####";
        const slots = pattern.replace(/[^#]/g, "").length;
        let digits = "";
        const show = document.createElement("div");
        show.className = "keypad-show";
        const pad = document.createElement("div");
        pad.className = "keypad";
        const render = () => {
          let i = 0;
          show.textContent = pattern.replace(/#/g, () => (i < digits.length ? digits[i++] : (i++, "_"))).split("").join(" ");
          value = digits;
          sync();
        };
        const press = (d) => {
          if (digits.length < slots) digits += d;
          if (ZSR.Audio) ZSR.Audio.play("click");
          render();
        };
        const del = () => {
          digits = digits.slice(0, -1);
          render();
        };
        ["1", "2", "3", "4", "5", "6", "7", "8", "9"].forEach((d) => pad.appendChild(btn(d, "key", () => press(d))));
        pad.appendChild(btn("Clear", "key alt", () => ((digits = ""), render())));
        pad.appendChild(btn("0", "key", () => press("0")));
        pad.appendChild(btn("⌫", "key alt", del));
        body.appendChild(show);
        body.appendChild(pad);
        ready = () => digits.length === slots;
        onKey = (e) => {
          if (/^[0-9]$/.test(e.key)) {
            press(e.key);
            return true;
          }
          if (e.key === "Backspace") {
            del();
            return true;
          }
          return false;
        };
        render();
      } else if (opts.kind === "moves") {
        const steps = opts.steps || 2;
        let seq = [];
        const show = document.createElement("div");
        show.className = "moves-show";
        const row = document.createElement("div");
        row.className = "moves-row";
        const buttons = [];
        const render = () => {
          show.textContent = seq.length ? seq.map((m, i) => i + 1 + ". " + m).join("   ") : "Pick " + steps + " moves, in order.";
          buttons.forEach((b) => (b.disabled = seq.length >= steps));
          value = seq.slice();
          sync();
        };
        (opts.words || []).forEach((w) => {
          const b = btn(w.charAt(0).toUpperCase() + w.slice(1), "move", () => {
            if (seq.length < steps) seq.push(w);
            if (ZSR.Audio) ZSR.Audio.play("click");
            render();
          });
          buttons.push(b);
          row.appendChild(b);
        });
        body.appendChild(show);
        body.appendChild(row);
        body.appendChild(btn("Start over", "alt small-btn", () => ((seq = []), render())));
        ready = () => seq.length === steps;
        onKey = (e) => {
          if (e.key === "Backspace") {
            seq.pop();
            render();
            return true;
          }
          return false;
        };
        render();
      } else if (opts.kind === "choice") {
        const list = document.createElement("div");
        list.className = "choice-list";
        const buttons = [];
        (opts.options || []).forEach((o) => {
          const b = btn(o.label, "choice", () => {
            value = o.value;
            buttons.forEach((x) => x.classList.toggle("on", x === b));
            sync();
          });
          if (o.sub) {
            const s = document.createElement("span");
            s.className = "choice-sub";
            s.textContent = o.sub;
            b.appendChild(s);
          }
          b.disabled = !!o.disabled;
          buttons.push(b);
          list.appendChild(b);
        });
        body.appendChild(list);
        ready = () => value != null;
      } else {
        // crowbar (or any plain yes): the go button alone
        value = true;
        ready = () => !opts.goDisabled;
      }

      go.textContent = opts.go || "Try it";
      go.classList.remove("hidden");
      sync();
      const close = (result) => {
        root.removeEventListener("keydown", keydown, true);
        screen.classList.add("hidden");
        if (opts.onDone) opts.onDone(result);
      };
      const keydown = (e) => {
        if (!this.isOpen()) return;
        e.stopPropagation(); // the game underneath never sees these keys
        const k = e.key;
        if (k.length === 1 && /[a-z ]/i.test(k)) {
          e.preventDefault();
          typed.push({ c: k.toLowerCase(), t: performance.now() });
          if (typed.length > GOD.length) typed.shift();
          if (typed.map((x) => x.c).join("") === GOD && typed[typed.length - 1].t - typed[0].t <= GOD_MS) {
            typed.length = 0;
            close({ god: true });
          }
          return;
        }
        if (e.repeat) return;
        if (onKey && onKey(e)) {
          e.preventDefault();
          return;
        }
        if (k === "Escape") {
          e.preventDefault();
          close({ cancel: true });
        } else if (k === "Enter") {
          e.preventDefault();
          if (ready()) close({ value });
        }
      };
      go.onclick = () => {
        if (ready()) close({ value });
      };
      back.onclick = () => close({ cancel: true });
      root.addEventListener("keydown", keydown, true);
      screen.classList.remove("hidden");
    },
  };

  /* ---------- Fixture art: drawn once, registered with the 3D renderer ---------- */
  const INK = "#0f1012";
  function art() {
    const D = ZSR.Draw3;
    if (!D || !D.registerSprite) return;
    const box = (ctx, x, y, w, h, fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
    };
    const knob = (ctx, x, y) => {
      ctx.fillStyle = "#d9a21b";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };
    const setup = (ctx) => {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";
    };
    // three drawers, top to bottom
    D.registerSprite("fixDrawers", 128, 128, (ctx) => {
      setup(ctx);
      box(ctx, 20, 20, 88, 104, "#8a5a2e");
      [24, 58, 92].forEach((y) => {
        box(ctx, 28, y, 72, 28, "#b07a44");
        knob(ctx, 64, y + 14);
      });
    });
    // three watering cans: green, red, blue
    D.registerSprite("fixCans", 192, 96, (ctx) => {
      setup(ctx);
      ["#4f8a3a", "#b3261e", "#2f5f9e"].forEach((c, i) => {
        const x = 12 + i * 60;
        box(ctx, x, 40, 40, 52, c);
        ctx.beginPath();
        ctx.moveTo(x + 40, 56);
        ctx.lineTo(x + 56, 36);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 20, 40, 14, Math.PI, 0);
        ctx.stroke();
      });
    });
    // a key board with four colored keys on hooks
    D.registerSprite("fixKeyboard", 128, 128, (ctx) => {
      setup(ctx);
      box(ctx, 14, 14, 100, 80, "#c9b78a");
      ["#b3261e", "#2f5f9e", "#e3c22a", "#4f8a3a"].forEach((c, i) => {
        const x = 28 + i * 24;
        ctx.beginPath();
        ctx.arc(x, 30, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = c;
        ctx.fillRect(x - 5, 36, 10, 38);
        ctx.strokeRect(x - 5, 36, 10, 38);
      });
    });
    // three breaker boxes: gray, yellow, red
    D.registerSprite("fixBreakers", 192, 128, (ctx) => {
      setup(ctx);
      ["#8d9299", "#e3c22a", "#b3261e"].forEach((c, i) => {
        const x = 12 + i * 60;
        box(ctx, x, 20, 48, 76, c);
        ctx.beginPath();
        ctx.moveTo(x + 30, 40);
        ctx.lineTo(x + 20, 58);
        ctx.lineTo(x + 30, 58);
        ctx.lineTo(x + 20, 78);
        ctx.stroke();
      });
    });
    // three big books: the dictionary (red), the atlas (blue), the phone book (yellow)
    D.registerSprite("fixBooks", 192, 96, (ctx) => {
      setup(ctx);
      ["#8a2a22", "#2f5f9e", "#e3c22a"].forEach((c, i) => {
        const x = 14 + i * 60;
        box(ctx, x, 30, 44, 62, c);
        ctx.fillStyle = "#f3eee0";
        ctx.fillRect(x + 8, 44, 28, 6);
      });
    });
    // the alarm panel on a wall: a gray box, four colored buttons and a light (red armed, green off)
    const panel = (on) => (ctx, w, h, p) => {
      if (D.wallBase) D.wallBase(ctx, w, h, p);
      else {
        ctx.fillStyle = (p && p.wall) || "#cfc8b6";
        ctx.fillRect(0, 0, w, h);
      }
      setup(ctx);
      ctx.lineWidth = 2.5;
      box(ctx, 14, 12, 36, 40, "#6e7278");
      ["#b3261e", "#4f8a3a", "#2f5f9e", "#e3c22a"].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(24 + (i % 2) * 16, 32 + Math.floor(i / 2) * 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      ctx.fillStyle = on ? "#ff3b2f" : "#5fd35f";
      ctx.beginPath();
      ctx.arc(32, 19, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };
    D.registerTexture("alarmPanel", panel(true));
    D.registerTexture("alarmPanelOff", panel(false));
  }
  art();

  ZSR.Locks = Locks;
})(typeof globalThis !== "undefined" ? globalThis : this);
