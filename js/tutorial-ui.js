/* June's first-run tutorial, the part you see. js/tutorial.js decides what shows and when; this file only draws it
   (markup in index.html "THE TUTORIAL", styles in css/tutorial.css):
   - the card (#screen-tutorial): June's face, name and words, the keys and the mouse it pictures (from the card's
     data, never parsed from the words), a ring on a real HUD button, and Got it (or Enter);
   - the "Now you try" panel (#tut-try) under the HUD's top row, with the yard checklist;
   - the arrow (#tut-arrow) that points the way in the yard;
   - one key listener, added once at start-up, that holds every key while a card is up.
   ZSR.TutorialUI.init() (js/main.js, DOMContentLoaded) makes this object ZSR.Tutorial.view:
   card(model) -> true | false, hideCard(), tryPanel(model | null), arrow(pos | null), pulse().
   Nothing here may freeze the game: card() returns false when it has nothing to draw on, and js/tutorial.js then
   finishes the card at once. No DOM is touched before init(). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const T = () => ZSR.Tutorial;
  const $ = (id) => document.getElementById(id);

  const RING_PAD = 6; // px around a ringed button: covers its tilt (style.css .hud-box, ±0.6deg) and its shadow
  const MIN_ROOM = 0.4; // the card needs this share of the window's height beside a ringed button, or the ring goes
  const TRY_GAP = 6; // px between the HUD's top row and the "Now you try" panel
  const FACE_PX = 64; // the try panel's copy of June's face (a 2 rem box); the card's copy keeps the art's size
  const WASD = ["W", "A", "S", "D"];

  let built = false;
  let ringId = null; // the HUD button the open card rings
  let armTimer = 0;
  let pulseTimer = 0;
  let lastTry = ""; // the try panel's model as drawn (JSON): a frame with the same model writes nothing
  let lastArrow = ""; // the arrow's rounded place, direction and label as drawn
  const faces = {}; // portrait copies by "who:px" (the sprite cache keeps its own canvas; a canvas has one parent)

  /** Show or hide an element, touching the DOM only on a change (tryPanel and arrow run every frame). */
  function showEl(el, on) {
    if (el && el.classList.contains("hidden") === !!on) el.classList.toggle("hidden", !on);
  }
  function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text == null ? "" : String(text);
  }
  /** The card's words box inside #tut-text: it scrolls, so the paper's tape strips (style.css .paper) stay whole. */
  function wordsBox() {
    const paper = $("tut-text");
    if (!paper) return null;
    let box = paper.querySelector(".tut-words");
    if (!box) {
      paper.textContent = "";
      box = document.createElement("div");
      box.className = "tut-words";
      paper.appendChild(box);
    }
    return box;
  }

  /** A copy of a crew member's portrait, px square (0: the art's own size), made once; null while there is no art. */
  function face(who, px) {
    const key = who + ":" + px;
    if (faces[key]) return faces[key];
    const D3 = ZSR.Draw3;
    const src = D3 && D3.sprite ? D3.sprite("crewFace", { who }) : null;
    if (!src || !src.width) return null;
    const c = document.createElement("canvas");
    c.width = px || src.width;
    c.height = px || src.height;
    c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
    return (faces[key] = c);
  }
  /** Put the portrait in its box; no art (or a failed copy) hides the box and leaves the words. */
  function fillFace(box, who, px) {
    if (!box) return;
    let pic = null;
    try {
      pic = who ? face(who, px) : null;
    } catch (e) {
      pic = null;
    }
    if (!pic) box.innerHTML = "";
    else if (box.firstChild !== pic) {
      box.innerHTML = "";
      box.appendChild(pic);
    }
    showEl(box, !!pic);
  }

  /* ---------- The card's pictures ---------- */
  /** The mouse drawing: "move" (look around) has an arrow on each side, "click" fills the left button. */
  function mouseSvg(mode) {
    const m = mode === "click" ? "click" : "move";
    return (
      '<svg class="tut-mouse" data-mode="' + m + '" viewBox="0 0 80 80" aria-hidden="true">' +
      (m === "move" ? '<path class="tut-move" d="M3 44 15 35v18zM77 44 65 35v18z"/>' : '<path class="tut-rays" d="M16 14 9 8M13 23H5M24 6 21 0"/>') +
      '<rect class="body" x="22" y="8" width="36" height="66" rx="18"/>' +
      '<path class="tut-left" d="M22 38V26A18 18 0 0 1 40 8v30z"/>' +
      '<path class="tut-seam" d="M40 8v30M22 38h36"/>' +
      "</svg>"
    );
  }
  /** Key caps from the card's keys (W A S D together as on the keyboard, every other key on its own) and the mouse. */
  function drawPics(box, keys, mouse) {
    box.innerHTML = "";
    const list = (keys || []).map(String);
    const wasd = WASD.every((k) => list.includes(k));
    const group = (caps, cls) => {
      const g = document.createElement("div");
      g.className = "tut-keys" + (cls ? " " + cls : "");
      caps.forEach((k) => {
        const kbd = document.createElement("kbd");
        kbd.textContent = k;
        if (k === "Space") kbd.className = "wide";
        g.appendChild(kbd);
      });
      box.appendChild(g);
    };
    if (wasd) group(WASD, "wasd");
    list.filter((k) => !(wasd && WASD.includes(k))).forEach((k) => group([k]));
    if (mouse) box.insertAdjacentHTML("beforeend", mouseSvg(mouse));
    showEl(box, box.childNodes.length > 0);
  }

  /* ---------- The ring on a HUD button ---------- */
  /** The hole and the ring on the open card's button, padded; the panel moves to the side with more room and keeps
      clear of the button and the ring's pointer. A button that is not shown (Huge drops some boxes, the Map button
      outside a building), or one that leaves the card too little room beside it (a short window at Huge), gets no
      ring: the plain backdrop, the card still shows. */
  function placeRing() {
    const sec = $("screen-tutorial");
    const hole = $("tut-hole");
    const ring = $("tut-ring");
    if (!sec || !hole || !ring) return;
    // measure the card's own room first, as it sits with no ring
    sec.classList.remove("has-ring");
    sec.removeAttribute("data-at");
    sec.style.removeProperty("--tut-clear");
    const t = UI.open && ringId ? $(ringId) : null;
    const r = t && t.offsetParent !== null ? t.getBoundingClientRect() : null;
    let ok = !!r && r.width >= 2 && r.height >= 2;
    showEl(ring, ok);
    if (ok) {
      const s = sec.getBoundingClientRect();
      const cs = root.getComputedStyle(sec);
      const top = s.top + parseFloat(cs.paddingTop);
      const bottom = s.bottom - parseFloat(cs.paddingBottom);
      ring.dataset.side = "below";
      let tip = 40; // the pointer's reach past the ring, read from its own style (css/tutorial.css)
      try {
        const a = root.getComputedStyle(ring, "::after");
        const reach = parseFloat(a.top) + parseFloat(a.borderBottomWidth) - ring.offsetHeight;
        if (reach > 0) tip = reach;
      } catch (e) {
        /* the fallback reach */
      }
      const edge = 2 * RING_PAD + tip; // the ring's pad, the pointer, then as much again as the pad
      const below = bottom - (r.bottom + edge);
      const above = r.top - edge - top;
      const high = below >= above;
      ok = Math.max(below, above) >= MIN_ROOM * (bottom - top);
      if (ok) {
        const at = {
          left: r.left - s.left + sec.scrollLeft - RING_PAD + "px",
          top: r.top - s.top + sec.scrollTop - RING_PAD + "px",
          width: r.width + 2 * RING_PAD + "px",
          height: r.height + 2 * RING_PAD + "px",
        };
        Object.assign(hole.style, at);
        Object.assign(ring.style, at);
        ring.dataset.side = high ? "below" : "above";
        sec.dataset.at = high ? "top" : "bottom";
        sec.style.setProperty("--tut-clear", Math.ceil(high ? r.bottom - s.top + edge : s.bottom - r.top + edge) + "px");
        sec.classList.add("has-ring");
      }
    }
    showEl(hole, ok);
    showEl(ring, ok);
  }

  /* ---------- The view (js/tutorial.js calls these) ---------- */
  /** Show a card: { id, title, text, keys, mouse, ring, who, name, color }. False when there is nothing to draw on. */
  function card(m) {
    const sec = $("screen-tutorial");
    const panel = $("tut-panel");
    const go = $("btn-tut-go");
    const text = wordsBox();
    if (!m || !sec || !panel || !go || !text) return false;
    setText("tut-caption", m.name + " says");
    setText("tut-name", m.name);
    setText("tut-title", m.title);
    text.textContent = m.text || "";
    if (m.color) panel.style.setProperty("--crew", m.color);
    else panel.style.removeProperty("--crew");
    fillFace($("tut-face"), m.who, 0);
    const pics = $("tut-pics");
    if (pics) drawPics(pics, m.keys, m.mouse);
    ringId = m.ring || null;
    sec.classList.remove("hidden");
    UI.open = true;
    // Got it looks asleep while it would do nothing (js/tutorial.js times it; this is only how it looks)
    clearTimeout(armTimer);
    go.classList.add("arming");
    armTimer = setTimeout(() => go.classList.remove("arming"), ((T() && T().TUNE) || {}).armMs || 500);
    text.scrollTop = 0;
    panel.scrollTop = 0;
    // the panel takes the focus, never the button: Space can never press Got it, and Enter is ours (onKey)
    panel.focus({ preventScroll: true });
    placeRing();
    // again once the HUD has settled: the building's Map button is shown in the same moment as its card
    if (root.requestAnimationFrame) root.requestAnimationFrame(placeRing);
    return true;
  }
  function hideCard() {
    UI.open = false;
    ringId = null;
    clearTimeout(armTimer);
    const go = $("btn-tut-go");
    if (go) go.classList.remove("arming");
    const sec = $("screen-tutorial");
    if (!sec) return;
    sec.classList.add("hidden");
    sec.classList.remove("has-ring");
    sec.removeAttribute("data-at");
    sec.style.removeProperty("--tut-clear");
    showEl($("tut-hole"), false);
    showEl($("tut-ring"), false);
    const a = document.activeElement;
    if (a && sec.contains(a) && a.blur) a.blur();
  }
  /** "Now you try": { now, line, rows: [{ label, state: "done" | "now" | "todo" }] }, or null to hide it. */
  function tryPanel(m) {
    const box = $("tut-try");
    if (!box) return;
    if (!m) {
      showEl(box, false);
      lastTry = "";
      return;
    }
    const json = JSON.stringify(m);
    if (json !== lastTry) {
      lastTry = json;
      setText("tut-try-now", m.now);
      const line = $("tut-try-line");
      if (line) {
        line.textContent = m.line || "";
        showEl(line, !!m.line);
      }
      const list = $("tut-try-list");
      if (list) {
        list.innerHTML = "";
        (m.rows || []).forEach((r) => {
          const li = document.createElement("li");
          li.className = r.state === "done" || r.state === "now" ? r.state : "todo";
          if (r.state === "now") li.setAttribute("aria-current", "step");
          li.textContent = r.label;
          list.appendChild(li);
        });
      }
      // the speaker's face and color, as on her card
      const who = (T() && T().SPEAKER) || "june";
      fillFace($("tut-try-face"), who, FACE_PX);
      const c = ((ZSR.WORLD && ZSR.WORLD.CREW) || {})[who];
      if (c && c.color) box.style.setProperty("--crew", c.color);
    }
    if (box.classList.contains("hidden")) {
      showEl(box, true);
      measureTop();
    }
  }
  /** The arrow: { x, y (px in the view), dir: "down" | "left" | "right", label }, or null to hide it. */
  function arrow(p) {
    const el = $("tut-arrow");
    if (!el) return;
    if (!p) {
      showEl(el, false);
      lastArrow = "";
      return;
    }
    const x = Math.round(p.x) || 0;
    const y = Math.round(p.y) || 0;
    const dir = p.dir === "left" || p.dir === "right" ? p.dir : "down";
    const label = p.label ? String(p.label) : "";
    const key = x + "," + y + "," + dir + "," + label;
    if (key !== lastArrow) {
      lastArrow = key;
      el.style.transform = "translate(" + x + "px, " + y + "px)";
      if (el.dataset.dir !== dir) el.dataset.dir = dir;
      const lab = $("tut-arrow-label");
      if (lab) {
        if (lab.textContent !== label) lab.textContent = label;
        showEl(lab, !!label);
      }
    }
    showEl(el, true);
  }
  /** E at the van too soon: the try panel flashes for a second. */
  function pulse() {
    const box = $("tut-try");
    if (!box) return;
    box.classList.remove("pulse");
    void box.offsetWidth; // a pulse during a pulse starts it over
    box.classList.add("pulse");
    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(() => box.classList.remove("pulse"), 1000);
  }

  /** The try panel's top: just under the HUD's top row, which wraps with the window width, the text size and the
      full-screen button's room (style.css). A hidden HUD measures nothing and keeps the last value. */
  function measureTop() {
    const box = $("tut-try");
    const row = document.querySelector("#int-hud .hud-top");
    if (!box || !row) return;
    const b = row.getBoundingClientRect().bottom;
    if (b > 0) box.style.setProperty("--tut-top", Math.round(b + TRY_GAP) + "px");
  }

  /* ---------- Keys while a card is up ---------- */
  // On the window, capturing, added once at start-up: it runs before the road's and first person's window
  // listeners, the document listeners (crew card, the backpack's B, the map's keys) and the capture listeners the
  // lock prompt and the workbench add later, and stops them all. Enter is Got it (held Enter repeats are ignored,
  // and js/tutorial.js refuses for a moment after a card opens); Esc, P, Space, B, E and the rest do nothing.
  // Browser keys (Ctrl, Alt, Cmd combos, F1 to F12) are stopped but not prevented, so reload and full screen work.
  const SCROLL = { ArrowDown: 1, ArrowUp: -1, PageDown: 4, PageUp: -4 }; // the words scroll at Huge or in a short window
  function onKey(e) {
    if (!UI.open) return; // no card: every key behaves as today
    e.stopImmediatePropagation();
    if (e.key === "Enter" || e.code === "NumpadEnter") {
      e.preventDefault();
      if (!e.repeat && T()) T().press();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || /^F\d+$/.test(e.key)) return;
    e.preventDefault();
    const panel = $("tut-panel");
    if (e.key === "Tab" && panel) panel.focus({ preventScroll: true }); // the focus stays in the card
    if (SCROLL[e.key]) {
      const text = wordsBox();
      const el = text && text.scrollHeight > text.clientHeight ? text : panel;
      if (el) el.scrollTop += SCROLL[e.key] * 40;
    }
  }
  // a focused button acts on the keyup of Space (and some browsers of Enter): never while a card is up
  function onKeyUp(e) {
    if (UI.open && (e.key === " " || e.key === "Enter")) e.preventDefault();
  }

  function init() {
    if (built) return;
    built = true;
    const go = $("btn-tut-go");
    if (go) go.addEventListener("click", () => T() && T().press());
    root.addEventListener("keydown", onKey, true);
    root.addEventListener("keyup", onKeyUp, true);
    // the full-screen button and F11 fire resize too
    root.addEventListener("resize", () => {
      if (UI.open) placeRing();
      measureTop();
    });
    const row = document.querySelector("#int-hud .hud-top");
    try {
      if (row && root.ResizeObserver) new root.ResizeObserver(() => measureTop()).observe(row);
    } catch (e) {
      /* no ResizeObserver: the resize event and each show of the panel still measure */
    }
    measureTop();
    if (T()) T().view = UI;
  }

  const UI = { open: false, init, card, hideCard, tryPanel, arrow, pulse };
  ZSR.TutorialUI = UI;
})(typeof globalThis !== "undefined" ? globalThis : this);
