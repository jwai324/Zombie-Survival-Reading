/* Art for the crew at home base: June, Tomas and Pip, the dog, their portraits, and the objects their
   story quests ask for. Registered with ZSR.Draw3 (js/sprites3d.js), in the game's comic style
   (flat fills, ink edges, tube limbs with a soft highlight, a little halftone). Design: docs/CREW.md
   ("How they look"). Sprites (names and opts are the contract with js/crew.js and js/building.js):
   - "crew" { who, pose, f }: a full figure, front view, 192 x 256 (about 2 px a unit, feet on the
     bottom edge, the standing head's top at PERSON_TOP: a grown-up's height), so the runtime draws it
     as a prop (wide 0.75) at CREW[id].scale times 0.95 (CREW_ART.scale.crew): a share of a grown-up
     about 0.905 tiles tall. Poses: stand, walk, work, sit, read; frames f 0 and 1 (breathing, a step,
     the hammer up and down ...); pass f as exactly 0 or 1 (Draw3 caches a canvas per opts set).
     `sit` sits on the floor itself, knees up or legs crossed, so it needs no furniture under it;
     sit and work are drawn lower inside the same canvas, at the same scale.
   - "crewDog" { pose, f }: the stray, side view facing right, 160 x 128 (stand, walk, sit, bark);
     { pose, f, left: true } faces left. Pass left only when it is true (one canvas per opts set).
   - "crewFace" { who }: a head-and-shoulders portrait for the crew card, 256 x 256, opaque.
   - "qObj" { kind }: a quest object lying on a floor, 128 x 96, bright with thick ink.
   ZSR.CREW_ART lists every opts set the game uses (tests/validate-art.js draws them all) and the scale
   each kind is meant to be drawn at. A `who` or `kind` the art does not know draws a plain stand-in
   rather than nothing. Each 192 x 256 canvas is about 196 KB and cached for good: keep the set lean. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const D = ZSR.Draw3;
  if (!D) return;
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const { shade, mix, rng } = D;

  /* ---------- Drawing helpers (lengths in the sprite's units; LWK scales every ink line) ---------- */
  let LWK = 1; // portraits are drawn bigger, with relatively thinner ink
  function ink(ctx, lw) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw * LWK;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
  }
  /** Fill the current path (when `fill` is given) and ink its edge (lw 0 or missing: no edge). */
  function paint(ctx, fill, lw) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (lw) {
      ink(ctx, lw);
      ctx.stroke();
    }
  }
  function trace(ctx, pts, close) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    if (close) ctx.closePath();
  }
  function poly(ctx, pts, fill, lw) {
    trace(ctx, pts, true);
    paint(ctx, fill, lw);
  }
  function circle(ctx, x, y, r, fill, lw) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.2, r), 0, TAU);
    paint(ctx, fill, lw);
  }
  function oval(ctx, x, y, rx, ry, rot, fill, lw) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.2, rx), Math.max(0.2, ry), rot || 0, 0, TAU);
    paint(ctx, fill, lw);
  }
  function rbox(ctx, x, y, w, h, r, fill, lw) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    paint(ctx, fill, lw);
  }
  /** A plain stroke (not scaled by LWK: used for colored detail lines). */
  function line(ctx, pts, color, lw) {
    trace(ctx, pts, false);
    ctx.strokeStyle = color || INK;
    ctx.lineWidth = lw || 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  /** An ink line (scaled by LWK). */
  function inkLine(ctx, pts, lw) {
    trace(ctx, pts, false);
    ink(ctx, lw || 1);
    ctx.stroke();
  }
  /** A curve from a through control c to b. */
  function curve(ctx, a, c, b, color, lw) {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.quadraticCurveTo(c[0], c[1], b[0], b[1]);
    ctx.strokeStyle = color || INK;
    ctx.lineWidth = lw || 1;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  /** A limb or a tool's shaft: an inked tube, shaded down its right side, lit down its left. */
  function tube(ctx, pts, width, color) {
    const path = () => trace(ctx, pts, false);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    path();
    ctx.strokeStyle = INK;
    ctx.lineWidth = width + 2.6 * LWK;
    ctx.stroke();
    path();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.save();
    ctx.translate(width * 0.2, width * 0.04);
    path();
    ctx.strokeStyle = "rgba(0,0,0,0.17)";
    ctx.lineWidth = width * 0.42;
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(-width * 0.2, -width * 0.06);
    path();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = width * 0.28;
    ctx.stroke();
    ctx.restore();
  }
  /** Comic halftone dots over the current clip, in a band from x0 to x1 (the shadow side). */
  function dots(ctx, x0, y0, x1, y1, step, alpha) {
    ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
    const r = step * 0.2;
    for (let y = y0, row = 0; y < y1; y += step, row++) {
      for (let x = x0 + (row % 2) * step * 0.5; x < x1; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
    }
  }
  /** A soft shadow on the ground. */
  function groundShadow(ctx, cx, rx, ry) {
    const g = ctx.createRadialGradient(cx, -1.5, 1, cx, -1.5, rx);
    g.addColorStop(0, "rgba(0,0,0,0.45)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, -1.5, rx, ry, 0, 0, TAU);
    ctx.fill();
  }
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const angle = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);

  /* ---------- Who they are: colors and build (docs/CREW.md, "How they look") ----------
     Units: the figure stands on y = 0. hipY / shY / headY: hip joints, shoulder line, head center;
     rx, ry: the head's radii; shW: half the shoulders; waist, hem: half widths of the top; hipW: each
     leg's distance from the middle; ua, fa: upper arm and forearm (to the hand's center). top: the
     highest point of the standing figure, hair and bun included (measured from the drawing: re-measure
     it after changing a head or its hair). The sprite scales each figure by PERSON_TOP / top, so every
     crew member's standing head reaches exactly as high in the canvas: drawn at CREW[id].scale times
     the crew's prop scale, each stands CREW[id].scale of a grown-up (about 0.905 tiles). */
  const PERSON_TOP = 122; // units: a grown-up's head top in a 192 x 256 figure canvas at 2 px a unit (0.905 tiles tall at prop scale 0.95)
  const PEOPLE = {
    // in her sixties, grey hair in a bun, round glasses, a green cardigan over a work shirt, canvas
    // gardening gloves, the green ledger under her arm
    june: {
      skin: "#efc4a2", blush: "rgba(226,112,92,0.3)", lip: "#b5604f", iris: "#5b7f9a", brow: "#8f8a82",
      hair: "#cbc8c1", hairShade: "#9d9890",
      top: "#5b8a3c", shirt: "#b3c7da", pants: "#6d5a42", shoe: "#5c3b24", sole: "#2c1f16",
      sleeve: "#5b8a3c", hand: "#dcc28a", cuff: "#b48f52",
      P: { hipY: -51, shY: -86, headY: -103.5, rx: 11.3, ry: 13, shW: 16, waist: 13.5, hem: 16, hemY: 7, hipW: 7.8, legW: 10.5, armW: 6.6, neckW: 7, ua: 21, fa: 20, handR: 3.9, top: 124 },
    },
    // seventeen, tall and lanky, dark curly hair, navy coveralls with grease smudges, a red rag in
    // his back pocket, a wrench in hand
    tomas: {
      skin: "#c88c60", blush: "rgba(190,80,60,0.22)", lip: "#8f4a36", iris: "#4a2e1c", brow: "#22160f",
      hair: "#2b1d16", hairShade: "#4a3427",
      top: "#33507a", shirt: "#d9d6cf", pants: "#33507a", shoe: "#3a2a20", sole: "#151210",
      sleeve: "#33507a", hand: "#c88c60",
      P: { hipY: -56, shY: -91, headY: -107.5, rx: 10.4, ry: 12.4, shW: 15.5, waist: 11.5, hem: 12.5, hemY: 3, hipW: 6.6, legW: 9.2, armW: 6.1, neckW: 6.6, ua: 22, fa: 22, handR: 3.9, top: 128 },
    },
    // eleven, small, short hair, an orange hoodie, a walkie-talkie clipped on, a pencil behind one ear
    pip: {
      skin: "#93603e", blush: "rgba(200,90,70,0.22)", lip: "#6e3a28", iris: "#3a2416", brow: "#1d1512",
      hair: "#1f1713", hairShade: "#3d2c22",
      top: "#e8792a", shirt: "#e8792a", pants: "#3f5272", shoe: "#ece6d8", sole: "#c0362c",
      sleeve: "#e8792a", hand: "#93603e",
      P: { hipY: -50, shY: -81.5, headY: -103.5, rx: 12.8, ry: 14.6, shW: 14.2, waist: 13.4, hem: 14, hemY: 5, hipW: 6.8, legW: 9.6, armW: 6.6, neckW: 7, ua: 18.5, fa: 18, handR: 3.5, top: 120.5 },
    },
  };
  Object.keys(PEOPLE).forEach((id) => (PEOPLE[id].id = id));
  const WHO = Object.keys(PEOPLE);
  const POSES = ["stand", "walk", "work", "sit", "read"];
  const FRAMES = [0, 1];
  const LEDGER = "#2c7048"; // June's green ledger: a deeper green than her cardigan
  const PAGE = "#f4ecd6";
  const STEEL = "#c4cad1";
  const HANDLE = "#a46d3a";

  /* ---------- Things they hold ---------- */
  /** June's ledger, closed (w x h, centered on x, y, turned by rot). */
  function ledgerClosed(ctx, x, y, rot, w, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    rbox(ctx, -w / 2, -h / 2, w, h, 1.2, PAGE, 1.3); // the pages' edge shows on the right
    rbox(ctx, -w / 2, -h / 2, w - 1.8, h, 1.2, LEDGER, 1.4);
    ctx.fillStyle = shade(LEDGER, -28);
    ctx.fillRect(-w / 2 + 0.4, -h / 2 + 0.5, 2.2, h - 1); // the spine
    rbox(ctx, -w / 2 + 3.6, -h * 0.22, w - 7.4, h * 0.26, 0.6, "#efe2b8", 0.7); // the label
    line(ctx, [[-w / 2 + 4.8, -h * 0.13], [w / 2 - 5.2, -h * 0.13]], "rgba(15,16,18,0.55)", 0.6);
    ctx.restore();
  }
  /** June's ledger lying closed on the floor, seen from the side and a little above. */
  function ledgerFlat(ctx, x, y) {
    poly(ctx, [[x - 9, y], [x + 7, y], [x + 9.5, y - 4.6], [x - 6.5, y - 4.6]], LEDGER, 1.3);
    poly(ctx, [[x - 9, y], [x + 7, y], [x + 7, y + 1.8], [x - 9, y + 1.8]], PAGE, 1.1);
    line(ctx, [[x - 3, y - 2.4], [x + 4, y - 2.4]], "#efe2b8", 1.2);
  }
  /** An open book or ledger held up: two pages, cover peeking round them. */
  function bookOpen(ctx, x, y, rot, w, h, cover, o) {
    o = o || {};
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    rbox(ctx, -w / 2 - 1, -h / 2 - 0.6, w + 2, h + 1.6, 1.2, cover, 1.4);
    if (o.thick) rbox(ctx, -w / 2, h / 2 - 1.2, w, o.thick, 0.6, PAGE, 1); // the stack of pages below
    // the two pages, bowed toward the spine
    [-1, 1].forEach((s) => {
      ctx.beginPath();
      ctx.moveTo(0, -h / 2 + 1.2);
      ctx.quadraticCurveTo((s * w) / 4, -h / 2 - 0.6, (s * w) / 2, -h / 2);
      ctx.lineTo((s * w) / 2, h / 2);
      ctx.quadraticCurveTo((s * w) / 4, h / 2 - 1.2, 0, h / 2 + 0.6);
      ctx.closePath();
      paint(ctx, PAGE, 1.1);
    });
    // lines of writing (o.ruled: ruled lines too)
    for (let i = 0; i < 5; i++) {
      const yy = -h / 2 + 3 + i * ((h - 5) / 5);
      [-1, 1].forEach((s) => {
        const len = (w / 2 - 4) * (0.6 + ((i * 7 + (s > 0 ? 3 : 0)) % 5) * 0.08);
        line(ctx, [[s * 2, yy], [s * (2 + len), yy]], o.ink || "rgba(40,50,70,0.55)", 0.55);
      });
    }
    if (o.picture) o.picture(ctx, w, h);
    if (o.turn) {
      // a page caught mid-turn, arching over the spine
      ctx.beginPath();
      ctx.moveTo(0, -h / 2 + 1.2);
      ctx.quadraticCurveTo(w * 0.16, -h / 2 - h * 0.55, w * 0.3, -h / 2 - h * 0.25);
      ctx.lineTo(w * 0.3, h / 2 - h * 0.3);
      ctx.quadraticCurveTo(w * 0.16, h / 2 - h * 0.25, 0, h / 2 + 0.6);
      ctx.closePath();
      paint(ctx, "#fffaf0", 1.1);
    }
    line(ctx, [[0, -h / 2 + 1.2], [0, h / 2 + 0.6]], "rgba(15,16,18,0.5)", 0.8);
    ctx.restore();
  }
  /** A combination wrench: open jaw at the far end, ring at the near (from x, y along ang). */
  function wrench(ctx, x, y, ang, len) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    rbox(ctx, -2, -1.6, len + 2, 3.2, 1.4, STEEL, 1.3);
    line(ctx, [[1, -0.5], [len - 2, -0.5]], "rgba(255,255,255,0.65)", 0.7);
    // the open end: a C of steel
    ctx.beginPath();
    ctx.arc(len + 2.6, 0, 4.2, 0.75, TAU - 0.75);
    ctx.lineTo(len + 2.6 + Math.cos(-0.75) * 1.8, Math.sin(-0.75) * 1.8);
    ctx.arc(len + 2.6, 0, 1.8, -0.75, 0.75, true);
    ctx.closePath();
    paint(ctx, STEEL, 1.3);
    // the ring end
    circle(ctx, -3.2, 0, 3.6, STEEL, 1.3);
    circle(ctx, -3.2, 0, 1.6, "#4a4f57", 0.8);
    ctx.restore();
  }
  /** A claw hammer, held at x, y, its handle pointing along ang. */
  function hammer(ctx, x, y, ang, len) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    rbox(ctx, -3, -1.5, len + 3, 3, 1.2, HANDLE, 1.3);
    line(ctx, [[-1, -0.6], [len - 1, -0.6]], "rgba(255,240,210,0.45)", 0.6);
    // the head across the end of the handle: the face on one side, the claw on the other
    rbox(ctx, len - 2.2, -6.5, 4.6, 13, 1, "#6f7780", 1.4);
    rbox(ctx, len - 3, 4.5, 6.2, 3.4, 0.8, "#6f7780", 1.3);
    poly(ctx, [[len - 1.6, -6.4], [len + 1.6, -6.4], [len + 2.8, -10.5], [len - 0.4, -9]], "#6f7780", 1.2);
    line(ctx, [[len - 1.2, -5], [len - 1.2, 5]], "rgba(255,255,255,0.45)", 0.7);
    ctx.restore();
  }
  /** A garden trowel: wooden handle in the hand, a steel scoop beyond (along ang). */
  function trowel(ctx, x, y, ang, dirt) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    rbox(ctx, -3.5, -1.7, 8, 3.4, 1.5, "#c0553a", 1.2); // a red handle, easy to see on soil
    line(ctx, [[4.5, 0], [7.5, 0]], INK, 1.6);
    ctx.beginPath();
    ctx.moveTo(7, -2.6);
    ctx.quadraticCurveTo(13, -4.4, 17.5, 0);
    ctx.quadraticCurveTo(13, 4.4, 7, 2.6);
    ctx.closePath();
    paint(ctx, STEEL, 1.3);
    line(ctx, [[8.5, -0.8], [14.5, -0.6]], "rgba(255,255,255,0.7)", 0.7);
    if (dirt) {
      oval(ctx, 13, 0, 3.4, 2.2, 0, "#5a3d27", 0.9);
      circle(ctx, 19.5, -3.5, 0.9, "#5a3d27", 0.6);
      circle(ctx, 21, 1.5, 0.7, "#5a3d27", 0.5);
    }
    ctx.restore();
  }
  /** A seedling standing in soil at x, y (s: its size): a stem and two leaves. */
  function sprout(ctx, x, y, s) {
    line(ctx, [[x, y], [x + 0.3 * s, y - 6.6 * s]], "#3f6a2a", 1.5);
    oval(ctx, x - 2.4 * s, y - 6.4 * s, 2.9 * s, 1.4 * s, -0.45, "#7aa840", 0.8);
    oval(ctx, x + 2.8 * s, y - 7.6 * s, 2.9 * s, 1.4 * s, 0.45, "#8cbc4a", 0.8);
  }
  /** Pip's walkie-talkie: black, a yellow face, a stubby antenna and a light (led: true = lit green). */
  function walkie(ctx, x, y, rot, led, s) {
    s = s || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    rbox(ctx, 1.2, -10.5, 1.9, 5, 0.8, "#2b2d31", 1); // antenna
    rbox(ctx, -3.1, -6, 6.2, 11, 1.4, "#2b2d31", 1.3);
    rbox(ctx, -2.1, -1.2, 4.2, 4.6, 0.7, "#f2c12e", 0.8); // the yellow speaker face
    line(ctx, [[-1.2, 0.3], [1.2, 0.3]], "rgba(15,16,18,0.7)", 0.5);
    line(ctx, [[-1.2, 1.6], [1.2, 1.6]], "rgba(15,16,18,0.7)", 0.5);
    circle(ctx, -1.4, -4, 0.75, led ? "#7cf07a" : "#e04a3a", 0);
    ctx.restore();
  }
  /** A pencil from a (the eraser) to b (the point). */
  function pencil(ctx, a, b) {
    const ang = angle(a, b);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    ctx.save();
    ctx.translate(a[0], a[1]);
    ctx.rotate(ang);
    rbox(ctx, 0, -1, 2, 2, 0.5, "#e98aa0", 0.8);
    rbox(ctx, 1.8, -1, len - 4.4, 2, 0.2, "#f2c12e", 0.8);
    poly(ctx, [[len - 2.6, -1], [len, 0], [len - 2.6, 1]], "#efd2a8", 0.7);
    circle(ctx, len - 0.5, 0, 0.45, INK, 0);
    ctx.restore();
  }
  /** Pip's clipboard: brown board, a steel clip, a sheet with a list. */
  function clipboard(ctx, x, y, rot, f) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    rbox(ctx, -8, -10.5, 16, 21, 1.2, "#b0793f", 1.4);
    rbox(ctx, -6.5, -8.5, 13, 17.5, 0.4, "#fbf8f0", 0.9);
    rbox(ctx, -3.5, -12, 7, 4, 0.8, STEEL, 1.1);
    for (let i = 0; i < 5; i++) {
      const yy = -5.5 + i * 3;
      circle(ctx, -4.6, yy, 0.55, "#c0302a", 0);
      const len = i === 4 ? (f ? 6 : 3) : 7 + ((i * 5) % 3);
      line(ctx, [[-3, yy], [-3 + len, yy]], "rgba(40,50,70,0.7)", 0.6);
    }
    ctx.restore();
  }
  /** Pip's little spiral notebook, open: yellow cover, rings on top. */
  function notebook(ctx, x, y, rot, f) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    rbox(ctx, -7.5, -6.5, 15, 13.5, 1, "#f2c12e", 1.3);
    rbox(ctx, -6.3, -5.4, 12.6, 11.2, 0.4, "#fbf8f0", 0.8);
    for (let i = 0; i < 4; i++) {
      const len = 5 + ((i * 3 + f) % 4) * 1.4;
      line(ctx, [[-4.6, -2.6 + i * 2.4], [-4.6 + len, -2.6 + i * 2.4]], "rgba(40,50,70,0.65)", 0.55);
    }
    for (let i = 0; i < 6; i++) oval(ctx, -5 + i * 2, -6.5, 0.6, 1.3, 0, "#9aa1a8", 0.5);
    ctx.restore();
  }
  /** Tomas's repair manual, open: thick, a yellow cover, a diagram on one page. */
  function manual(ctx, x, y, rot) {
    bookOpen(ctx, x, y, rot, 22, 15, "#e0a81e", {
      thick: 2.8,
      picture(c, w, h) {
        // an engine part on the right page: a gear
        circle(c, w / 4 + 0.5, -1, 3.4, null, 0);
        c.strokeStyle = "rgba(40,50,70,0.75)";
        c.lineWidth = 0.6;
        c.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          c.moveTo(w / 4 + 0.5 + Math.cos(a) * 2.2, -1 + Math.sin(a) * 2.2);
          c.lineTo(w / 4 + 0.5 + Math.cos(a) * 3.6, -1 + Math.sin(a) * 3.6);
        }
        c.stroke();
        c.beginPath();
        c.arc(w / 4 + 0.5, -1, 2.2, 0, TAU);
        c.stroke();
        void h;
      },
    });
  }

  /* ---------- Body parts ---------- */
  function shoe(ctx, L, x, y, kind, sg) {
    if (kind === "none") return;
    if (kind === "side") {
      // pointing sideways (sg: the toe's direction), as when sitting cross-legged
      oval(ctx, x + sg * 1.6, y + 0.8, 6.2, 2.4, 0, L.sole, 1.3);
      oval(ctx, x + sg * 1.2, y - 0.6, 6, 3.2, 0, L.shoe, 1.4);
      oval(ctx, x - sg * 0.6, y - 1.6, 2.4, 1, 0, "rgba(255,255,255,0.25)", 0);
      return;
    }
    // toe toward you: the sole as a dark band under a rounded upper
    oval(ctx, x, y + 0.4, 6.4, 3.2, 0, L.sole, 1.3);
    oval(ctx, x, y - 1, 6, 3.6, 0, L.shoe, 1.4);
    oval(ctx, x - 1.6, y - 2.2, 2.6, 1.1, -0.2, "rgba(255,255,255,0.28)", 0);
    if (L.laces) line(ctx, [[x - 1.6, y - 3.6], [x + 1.6, y - 3.6]], L.laces, 0.7);
  }
  /** A hand at the end of a forearm pointing along dir; sg is the arm's side (thumb toward the middle). */
  function hand(ctx, L, x, y, dir, kind, sg) {
    if (kind === "none") return;
    const r = L.P.handR;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(dir - Math.PI / 2);
    const c = L.hand;
    const dark = "rgba(15,16,18,0.45)";
    if (kind === "fist" || kind === "grip") {
      // a closed hand: the fist, the curled fingers' joints, the thumb laid across
      rbox(ctx, -r * 0.92, -r * 0.5, r * 1.84, r * 1.75, r * 0.72, c, 1.3);
      [-0.42, 0.05, 0.5].forEach((k) => line(ctx, [[r * k, r * 0.75], [r * k, r * 1.15]], dark, 0.5));
      oval(ctx, -sg * r * 0.42, r * 0.08, r * 0.62, r * 0.4, -sg * 0.5, shade(c, 8), 1);
    } else {
      // relaxed: palm and fingers in one shape, the thumb on the side toward the middle
      ctx.beginPath();
      ctx.moveTo(-r * 0.82, -r * 0.45);
      ctx.lineTo(-r * 0.88, r * 0.85);
      ctx.quadraticCurveTo(-r * 0.75, r * 1.95, 0, r * 2);
      ctx.quadraticCurveTo(r * 0.75, r * 1.95, r * 0.88, r * 0.85);
      ctx.lineTo(r * 0.82, -r * 0.45);
      ctx.closePath();
      paint(ctx, c, 1.3);
      [-0.3, 0.3].forEach((k) => line(ctx, [[r * k, r * 1.3], [r * k, r * 1.85]], dark, 0.5));
      oval(ctx, -sg * r * 0.78, r * 0.6, r * 0.34, r * 0.78, -sg * 0.4, shade(c, 6), 1.1);
    }
    if (L.cuff) {
      // canvas gloves: a darker cuff at the wrist
      rbox(ctx, -r * 0.98, -r * 0.95, r * 1.96, r * 0.8, r * 0.3, L.cuff, 1.1);
    }
    ctx.restore();
  }
  function arm(ctx, L, a, sg) {
    const P = L.P;
    if (L.id === "tomas") {
      // sleeves rolled to the elbow: bare forearm, a fat cuff of navy at the elbow
      tube(ctx, [a.e, a.h], P.armW - 1, L.skin);
      tube(ctx, [a.s, a.e], P.armW, L.sleeve);
      const roll = lerp(a.e, a.s, 0.12);
      tube(ctx, [lerp(a.e, a.s, 0.02), roll], P.armW + 1.6, shade(L.sleeve, 14));
    } else {
      tube(ctx, [a.s, a.e, a.h], P.armW, L.sleeve);
      if (L.id === "pip") {
        // ribbed hoodie cuff
        const w0 = lerp(a.h, a.e, 0.32);
        tube(ctx, [w0, lerp(a.h, a.e, 0.16)], P.armW + 0.6, shade(L.sleeve, -22));
      }
    }
    hand(ctx, L, a.h[0], a.h[1], angle(a.e, a.h), a.hand || "open", sg);
  }
  function leg(ctx, L, g, sg) {
    const P = L.P;
    if (g.kneel) {
      // knee on the ground: the thigh comes down to it; shin and foot tucked behind
      tube(ctx, [g.h, g.k], P.legW, L.pants);
      oval(ctx, g.k[0], g.k[1] - 0.5, P.legW * 0.55, 3, 0, shade(L.pants, -12), 1.3);
      return;
    }
    tube(ctx, g.k2 ? [g.h, g.k, g.k2, g.f] : [g.h, g.k, g.f], P.legW, L.pants);
    // a crease at the knee
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.ellipse(g.k[0], g.k[1], P.legW * 0.32, 2.2, 0, 0, TAU);
    ctx.fill();
    if (L.id === "tomas") {
      // grease on the knee
      ctx.fillStyle = "rgba(20,22,28,0.35)";
      ctx.beginPath();
      ctx.ellipse(g.k[0] + sg * 1.2, g.k[1] + 2, 2.4, 1.6, 0.4, 0, TAU);
      ctx.fill();
    }
    shoe(ctx, L, g.f[0], g.f[1], g.foot || "front", g.toe || sg);
  }
  function neck(ctx, L, R) {
    const P = L.P;
    const top = [R.head[0], R.head[1] + P.ry * 0.55];
    tube(ctx, [[R.sh[0], R.sh[1] + 1], top], P.neckW, shade(L.skin, -14));
  }

  /** The top: a shape from the shoulder line down past the hips, then each person's clothing on it. */
  function torsoPath(ctx, L, R) {
    const P = L.P;
    const [sx, sy] = R.sh;
    const [hx, hy] = R.hip;
    const a = P.shW;
    const top = sy - 2.6;
    const wy = hy - 4;
    const hemY = hy + (R.hem != null ? R.hem : P.hemY);
    ctx.beginPath();
    ctx.moveTo(sx - a, sy + 5);
    ctx.quadraticCurveTo(sx - a - 0.4, top, sx - a + 7, top);
    ctx.lineTo(sx + a - 7, top);
    ctx.quadraticCurveTo(sx + a + 0.4, top, sx + a, sy + 5);
    ctx.quadraticCurveTo(hx + P.waist + 1, (sy + wy) / 2, hx + P.waist, wy);
    ctx.lineTo(hx + P.hem, hemY);
    ctx.lineTo(hx - P.hem, hemY);
    ctx.lineTo(hx - P.waist, wy);
    ctx.quadraticCurveTo(hx - P.waist - 1, (sy + wy) / 2, sx - a, sy + 5);
    ctx.closePath();
    return { top, wy, hemY };
  }
  function torso(ctx, L, R) {
    const P = L.P;
    const [sx, sy] = R.sh;
    const [hx, hy] = R.hip;
    if (L.id === "pip") {
      // the hood, down, bunched behind the neck
      oval(ctx, sx, sy - 3.5, 11, 5.4, 0, shade(L.top, -26), 1.4);
    }
    const t = torsoPath(ctx, L, R);
    const g = ctx.createLinearGradient(sx - P.shW, 0, sx + P.shW, 0);
    g.addColorStop(0, shade(L.top, -20));
    g.addColorStop(0.35, shade(L.top, 14));
    g.addColorStop(1, shade(L.top, -34));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    torsoPath(ctx, L, R);
    ctx.clip();
    const lean = (x, y) => [x + (sx - hx) * ((hy - y) / (hy - sy || 1)), y]; // follow the lean from hips to shoulders
    if (L.id === "june") {
      // the work shirt down the open front, with its collar, then the cardigan's button bands
      const neckL = [sx - 5.2, t.top];
      const neckR = [sx + 5.2, t.top];
      poly(ctx, [neckL, neckR, [hx + 3.2, t.hemY + 1], [hx - 3.2, t.hemY + 1]], L.shirt, 0);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(hx - 4, t.wy, 8, 1.6); // a tuck of the shirt at the waist
      [-1, 1].forEach((s) => {
        poly(ctx, [[sx + s * 0.4, t.top + 4.6], [sx + s * 5.6, t.top - 0.4], [sx + s * 5.2, t.top + 4.8]], shade(L.shirt, 12), 1);
      });
      [0.3, 0.55].forEach((k) => circle(ctx, ...lerp([sx, t.top + 6], [hx, t.hemY], k), 0.55, "#f3eee0", 0));
      [-1, 1].forEach((s) => {
        line(ctx, [[sx + s * 5.4, t.top], [hx + s * 3.6, t.hemY + 1]], shade(L.top, 26), 2.2);
        line(ctx, [[sx + s * 4.4, t.top], [hx + s * 2.6, t.hemY + 1]], INK, 0.9);
      });
      [0.32, 0.55, 0.78].forEach((k) => circle(ctx, ...lerp([sx + 6.4, t.top + 3], [hx + 4.6, t.hemY], k), 0.8, "#e9dcc0", 0.6));
      // patch pockets low on each side, the tape roll she keeps in one
      [-1, 1].forEach((s) => rbox(ctx, hx + s * 9 - 3.8, hy - 6, 7.6, 7, 1, shade(L.top, -10), 0.9));
      oval(ctx, hx - 9, hy - 6.4, 2.2, 1.2, 0, "#cfd6de", 0.7);
      // the knit's ribbing at the hem
      ctx.fillStyle = shade(L.top, -18);
      ctx.fillRect(hx - P.hem - 1, t.hemY - 2.2, P.hem * 2 + 2, 2.4);
      for (let x = hx - P.hem; x < hx + P.hem; x += 1.6) line(ctx, [[x, t.hemY - 2.2], [x, t.hemY]], "rgba(0,0,0,0.25)", 0.4);
      dotsShade(ctx, sx, P);
    } else if (L.id === "tomas") {
      // open collar on a grey T-shirt, the zip, a chest pocket with a pen, a name patch, the waist seam
      poly(ctx, [[sx - 5.4, t.top - 0.2], [sx + 5.4, t.top - 0.2], [sx, t.top + 9]], L.shirt, 0);
      [-1, 1].forEach((s) => poly(ctx, [[sx + s * 5.6, t.top - 0.6], [sx + s * 1.2, t.top + 9.6], [sx + s * 8.6, t.top + 4.6]], shade(L.top, 12), 1.1));
      inkLine(ctx, [lean(sx, t.top + 9.6), [hx, hy + 2]], 0.8);
      line(ctx, [lean(sx + 0.9, t.top + 10), [hx + 0.9, hy + 2]], "rgba(255,255,255,0.18)", 0.6);
      const pk = lean(sx - 8.5, sy + 9);
      rbox(ctx, pk[0] - 3.6, pk[1] - 2.6, 7.2, 6.6, 0.6, shade(L.top, -10), 0.9);
      rbox(ctx, pk[0] - 1.7, pk[1] - 6, 1.4, 4.6, 0.5, "#c0302a", 0.6); // a pen in the pocket
      const np = lean(sx + 8.2, sy + 9.5);
      oval(ctx, np[0], np[1], 3.8, 2.4, 0, "#f3eee0", 0.9);
      line(ctx, [[np[0] - 2.2, np[1] + 0.2], [np[0] - 0.8, np[1] - 0.6], [np[0] + 0.6, np[1] + 0.4], [np[0] + 2, np[1] - 0.4]], "#c0302a", 0.6);
      line(ctx, [[hx - P.waist - 1, hy - 4], [hx + P.waist + 1, hy - 4]], shade(L.top, -26), 1.4);
      // grease smudges
      const r = rng(23);
      for (let i = 0; i < 5; i++) {
        const p = lean(sx - 10 + r() * 20, sy + 6 + r() * (hy - sy - 6));
        ctx.fillStyle = "rgba(15,17,22," + (0.22 + r() * 0.2).toFixed(2) + ")";
        ctx.beginPath();
        ctx.ellipse(p[0], p[1], 1.4 + r() * 2, 0.9 + r() * 1.2, r() * 3, 0, TAU);
        ctx.fill();
      }
      dotsShade(ctx, sx, P);
    } else if (L.id === "pip") {
      // round neckline, drawstrings, the big front pocket, ribbed hem; the walkie-talkie clipped on
      oval(ctx, sx, t.top + 0.4, 6.2, 2.6, 0, shade(L.top, -30), 1);
      [-1, 1].forEach((s) => {
        line(ctx, [[sx + s * 2.6, t.top + 2], [sx + s * 3, t.top + 10]], "#f3eee0", 0.9);
        circle(ctx, sx + s * 3, t.top + 10.6, 0.8, "#f3eee0", 0.5);
      });
      const pk = lean(hx, hy - 9);
      poly(ctx, [[pk[0] - 8.5, pk[1] + 7], [pk[0] - 6.5, pk[1] - 2], [pk[0] + 6.5, pk[1] - 2], [pk[0] + 8.5, pk[1] + 7]], shade(L.top, -6), 1);
      ctx.fillStyle = shade(L.top, -22);
      ctx.fillRect(hx - P.hem - 1, t.hemY - 2.6, P.hem * 2 + 2, 2.8);
      for (let x = hx - P.hem; x < hx + P.hem; x += 1.6) line(ctx, [[x, t.hemY - 2.6], [x, t.hemY]], "rgba(0,0,0,0.22)", 0.4);
      dotsShade(ctx, sx, P);
    } else {
      dotsShade(ctx, sx, P);
    }
    ctx.restore();
    torsoPath(ctx, L, R);
    ink(ctx, 1.5);
    ctx.stroke();
  }
  function dotsShade(ctx, sx, P) {
    dots(ctx, sx + P.shW * 0.35, -130, sx + P.shW + 4, 10, 2.2, 0.13);
  }

  /* ---------- Heads ---------- */
  function skull(ctx, rx, ry, jaw) {
    ctx.beginPath();
    ctx.moveTo(0, -ry);
    ctx.bezierCurveTo(rx * 0.78, -ry, rx, -ry * 0.55, rx, -ry * 0.05);
    ctx.bezierCurveTo(rx, ry * 0.42, rx * jaw, ry * 0.86, 0, ry);
    ctx.bezierCurveTo(-rx * jaw, ry * 0.86, -rx, ry * 0.42, -rx, -ry * 0.05);
    ctx.bezierCurveTo(-rx, -ry * 0.55, -rx * 0.78, -ry, 0, -ry);
    ctx.closePath();
  }
  function eye(ctx, L, x, y, s, gaze, detail) {
    const rx = 2.15 * s;
    const ry = 2.35 * s;
    oval(ctx, x, y, rx, ry, 0, "#fbf8f0", 0.8);
    const dy = gaze ? ry * 0.42 : 0;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
    ctx.clip();
    circle(ctx, x, y + dy + 0.15, 1.5 * s, L.iris, 0);
    circle(ctx, x, y + dy + 0.15, 0.85 * s, INK, 0);
    circle(ctx, x - 0.55 * s, y + dy - 0.5 * s, 0.45 * s, "#ffffff", 0);
    if (gaze) {
      // eyes cast down: the lid comes halfway
      ctx.fillStyle = shade(L.skin, -10);
      ctx.fillRect(x - rx - 1, y - ry - 1, rx * 2 + 2, ry + 0.6);
    }
    ctx.restore();
    // the upper lid line, heavier
    ctx.beginPath();
    if (gaze) {
      ctx.moveTo(x - rx - 0.3, y - 0.2);
      ctx.quadraticCurveTo(x, y + 0.9, x + rx + 0.3, y - 0.2);
    } else {
      ctx.ellipse(x, y, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.92);
    }
    ink(ctx, detail ? 1 : 1.1);
    ctx.stroke();
  }
  /** The face in head space (0, 0 the head's center). o.gaze: looking down; o.mouth: smile, open, half. */
  function face(ctx, L, o) {
    const P = L.P;
    const rx = P.rx;
    const ry = P.ry;
    const kid = L.id === "pip";
    const ey = ry * (kid ? 0.16 : 0.08);
    const ex = rx * (kid ? 0.4 : 0.41);
    const es = kid ? 1.12 : 1;
    // cheeks
    [-1, 1].forEach((s) => oval(ctx, s * rx * 0.56, ey + 4.6, 2.6, 1.6, 0, L.blush, 0));
    eye(ctx, L, -ex, ey, es, o.gaze, o.detail);
    eye(ctx, L, ex, ey, es, o.gaze, o.detail);
    // brows
    const by = ey - (kid ? 4.6 : 4.2) - (o.brows || 0);
    const bw = L.id === "tomas" ? 1.5 : 1.15;
    [-1, 1].forEach((s) => curve(ctx, [s * (ex - 2.4), by + 0.6], [s * ex, by - 0.9], [s * (ex + 2.4), by + 0.2], L.brow, bw));
    // nose
    curve(ctx, [0.4, ey + 1.6], [1.6, ey + 4.8], [-0.2, ey + 5.6], shade(L.skin, -60), 0.8);
    oval(ctx, -0.2, ey + 5, 1.6, 0.8, 0, "rgba(255,255,255,0.18)", 0);
    // mouth
    const my = ry * (kid ? 0.6 : 0.56);
    if (o.mouth === "open") {
      ctx.beginPath();
      ctx.moveTo(-2.6, my - 0.4);
      ctx.quadraticCurveTo(0, my - 1, 2.6, my - 0.4);
      ctx.quadraticCurveTo(0, my + 3.4, -2.6, my - 0.4);
      ctx.closePath();
      paint(ctx, "#5a2620", 0.8);
      oval(ctx, 0, my + 1.4, 1.3, 0.7, 0, "#d86a6a", 0);
    } else if (o.mouth === "half") {
      curve(ctx, [-2.6, my + 0.4], [0.4, my + 1.2], [3, my - 0.6], L.lip, 1.05);
    } else {
      curve(ctx, [-3, my - 0.2], [0, my + 2.2], [3, my - 0.2], L.lip, 1.05);
      line(ctx, [[-3.2, my - 0.6], [-2.7, my + 0.1]], L.lip, 0.7);
      line(ctx, [[3.2, my - 0.6], [2.7, my + 0.1]], L.lip, 0.7);
    }
    if (L.id === "june") {
      // smile lines, crow's feet, then the round glasses
      curve(ctx, [-4.6, my - 3], [-5.4, my - 0.6], [-4.2, my + 1.4], "rgba(120,70,50,0.35)", 0.6);
      curve(ctx, [4.6, my - 3], [5.4, my - 0.6], [4.2, my + 1.4], "rgba(120,70,50,0.35)", 0.6);
      [-1, 1].forEach((s) => line(ctx, [[s * (ex + 3.9), ey - 0.4], [s * (ex + 5), ey - 1.2]], "rgba(120,70,50,0.4)", 0.5));
      [-1, 1].forEach((s) => {
        circle(ctx, s * ex, ey, 3.5, "rgba(210,232,250,0.22)", 1);
        curve(ctx, [s * ex - 2, ey - 1.6], [s * ex - 0.8, ey - 2.8], [s * ex + 0.8, ey - 2.6], "rgba(255,255,255,0.75)", 0.6);
        inkLine(ctx, [[s * (ex + 3.4), ey - 0.6], [s * (rx - 0.2), ey - 1.6]], 0.8);
      });
      curve(ctx, [-ex + 3.3, ey - 0.4], [0, ey - 1.6], [ex - 3.3, ey - 0.4], INK, 0.9);
    }
    if (L.id === "tomas") {
      // a swipe of grease on one cheek: two thin finger streaks (a round blot could read as a bruise)
      // up on the cheekbone, clear of the mouth (so it never reads as a scar or a crooked smile)
      line(ctx, [[rx * 0.5, ey + 3.1], [rx * 0.8, ey + 2.3]], "rgba(35,36,42,0.4)", 0.85);
      line(ctx, [[rx * 0.52, ey + 4.4], [rx * 0.78, ey + 3.7]], "rgba(35,36,42,0.32)", 0.75);
    }
  }
  function ears(ctx, L) {
    const P = L.P;
    [-1, 1].forEach((s) => {
      oval(ctx, s * (P.rx - 0.2), P.ry * 0.1, 2.4, 3.4, s * 0.15, shade(L.skin, -8), 1.2);
      curve(ctx, [s * (P.rx + 0.6), -0.8], [s * (P.rx + 1.2), 1.4], [s * (P.rx + 0.2), 3], shade(L.skin, -45), 0.6);
    });
  }
  function hairBack(ctx, L) {
    const P = L.P;
    if (L.id === "june") {
      // the bun on top, then the hair drawn back around the head
      oval(ctx, 0.6, -P.ry - 2.2, 5.6, 4.6, 0.1, L.hair, 1.4);
      curve(ctx, [-3.4, -P.ry - 2.6], [0.4, -P.ry - 5.2], [4.2, -P.ry - 2.2], L.hairShade, 0.7);
      curve(ctx, [-2.2, -P.ry - 0.8], [1.4, -P.ry - 3], [4.6, -P.ry - 0.4], L.hairShade, 0.7);
      oval(ctx, 0, -1.4, P.rx + 1.1, P.ry + 0.4, 0, L.hair, 1.4);
    } else if (L.id === "tomas") {
      curls(ctx, L, true);
    } else {
      // Pip's short hair, and anyone the art does not know yet
      oval(ctx, 0, -1.4, P.rx + 0.9, P.ry + 0.1, 0, L.hair, 1.4);
    }
  }
  /** Tomas's curls: inked circles merged into one mop (the ink first, then the fill over it). */
  function curls(ctx, L, back) {
    const P = L.P;
    const pts = [];
    if (back) {
      // the mop over the crown, ending above the ears (not a helmet down the sides)
      for (let i = 0; i <= 11; i++) {
        const a = Math.PI * (1.1 + (i / 11) * 0.8);
        const big = i % 3 === 1 ? 0.5 : 0;
        pts.push([Math.cos(a) * (P.rx + 0.3), Math.sin(a) * (P.ry + 1.2) - 2.2, 3.1 + big]);
      }
      pts.push([-P.rx + 0.2, -3.4, 2.4], [P.rx - 0.2, -3.6, 2.4]);
    } else {
      // loose curls falling over the forehead, a few higher up
      [[-0.72, -0.4, 2.5], [-0.46, -0.52, 2.9], [-0.18, -0.46, 2.7], [0.1, -0.56, 3], [0.38, -0.47, 2.7], [0.64, -0.52, 2.6], [0.8, -0.32, 2.1]].forEach(([kx, ky, r]) => pts.push([P.rx * kx, P.ry * ky, r]));
      [[-0.5, -0.86, 3.2], [-0.12, -0.94, 3.4], [0.28, -0.9, 3.2], [0.6, -0.76, 2.8]].forEach(([kx, ky, r]) => pts.push([P.rx * kx, P.ry * ky, r]));
    }
    ctx.lineWidth = 2.8 * LWK;
    ctx.strokeStyle = INK;
    pts.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.stroke();
    });
    ctx.fillStyle = L.hair;
    pts.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    });
    // a little shine on the curls
    pts.forEach(([x, y, r], i) => {
      if (i % 2) return;
      ctx.beginPath();
      ctx.arc(x - r * 0.15, y - r * 0.1, r * 0.55, Math.PI * 1.1, Math.PI * 1.7);
      ctx.strokeStyle = L.hairShade;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    });
  }
  function hairFront(ctx, L) {
    const P = L.P;
    const rx = P.rx;
    const ry = P.ry;
    if (L.id === "june") {
      // swept back from a soft hairline, grey with darker strands
      ctx.beginPath();
      ctx.moveTo(-rx - 0.9, 0.5);
      ctx.bezierCurveTo(-rx - 1.4, -ry * 0.8, -rx * 0.5, -ry - 1.6, 0, -ry - 1.4);
      ctx.bezierCurveTo(rx * 0.5, -ry - 1.6, rx + 1.4, -ry * 0.8, rx + 0.9, 0.5);
      ctx.lineTo(rx - 0.6, 0.4);
      ctx.quadraticCurveTo(rx * 0.9, -ry * 0.5, rx * 0.45, -ry * 0.56);
      ctx.quadraticCurveTo(0, -ry * 0.44, -rx * 0.45, -ry * 0.56);
      ctx.quadraticCurveTo(-rx * 0.9, -ry * 0.5, -rx + 0.6, 0.4);
      ctx.closePath();
      paint(ctx, L.hair, 1.4);
      [-0.6, -0.25, 0.15, 0.5].forEach((k) => curve(ctx, [rx * k, -ry * 0.55], [rx * k * 1.3, -ry * 0.9], [rx * k * 0.4, -ry - 1], L.hairShade, 0.6));
    } else if (L.id === "tomas") {
      curls(ctx, L, false);
    } else {
      // short, a little messy: a cap of hair with a jagged fringe (Pip, and anyone the art does not know)
      ctx.beginPath();
      ctx.moveTo(-rx - 0.6, 1);
      ctx.bezierCurveTo(-rx - 1.4, -ry * 0.9, -rx * 0.5, -ry - 1.8, 0, -ry - 1.6);
      ctx.bezierCurveTo(rx * 0.6, -ry - 1.8, rx + 1.4, -ry * 0.9, rx + 0.6, 1);
      ctx.lineTo(rx - 1.2, -1.2);
      const fr = [[rx * 0.62, -ry * 0.42], [rx * 0.42, -ry * 0.58], [rx * 0.2, -ry * 0.38], [0, -ry * 0.56], [-rx * 0.24, -ry * 0.36], [-rx * 0.46, -ry * 0.56], [-rx * 0.66, -ry * 0.4]];
      fr.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(-rx + 1.2, -1.2);
      ctx.closePath();
      paint(ctx, L.hair, 1.4);
      [-0.4, 0, 0.4].forEach((k) => curve(ctx, [rx * k, -ry * 0.62], [rx * k * 1.2, -ry * 0.86], [rx * k + 1.2, -ry - 0.8], L.hairShade, 0.7));
    }
  }
  function head(ctx, L, R, o) {
    const P = L.P;
    const [x, y, tilt] = R.head;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt || 0);
    hairBack(ctx, L);
    if (L.id === "pip" && !R.noPencil) pencil(ctx, [P.rx - 3.4, -6.6], [P.rx + 6.2, 4.2]); // behind the right ear
    ears(ctx, L);
    skull(ctx, P.rx, P.ry, L.id === "tomas" ? 0.58 : 0.62);
    const g = ctx.createRadialGradient(-P.rx * 0.35, -P.ry * 0.4, 1, 0, 0, P.ry * 1.25);
    g.addColorStop(0, shade(L.skin, 18));
    g.addColorStop(0.6, L.skin);
    g.addColorStop(1, shade(L.skin, -34));
    ctx.fillStyle = g;
    ctx.fill();
    ink(ctx, 1.5);
    ctx.stroke();
    face(ctx, L, Object.assign({ gaze: R.gaze, mouth: R.mouth }, o));
    hairFront(ctx, L);
    ctx.restore();
  }

  /* ---------- Poses: a rig of joints for each person, pose and frame ----------
     R = { hip, sh, head: [x, y, tilt], legs: [{ h, k, f, foot, kneel }], arms: [left, right] each
     { s, e, h, hand }, props: { under, back, mid, hand, front } (functions, drawn: under and back first,
     mid after the legs, hand after the head, front after the arms), legsOver, gaze, mouth, shadow }. */
  function relaxArm(P, sg, b) {
    const s = [sg * (P.shW - 2.2), P.shY + 3 - b];
    const e = [sg * (P.shW + 0.9), s[1] + P.ua - 0.4];
    return { s, e, h: [sg * (P.shW + 0.3), e[1] + P.fa - 0.6], hand: "open" };
  }
  /** Standing at ease: the weight on the left leg, the right knee a little bent. */
  function legsStand(P) {
    return [
      { h: [-P.hipW, P.hipY], k: [-P.hipW - 0.4, P.hipY * 0.5 + 0.5], f: [-P.hipW - 0.8, -3.2] },
      { h: [P.hipW, P.hipY + 0.6], k: [P.hipW - 0.2, P.hipY * 0.5 + 1.4], f: [P.hipW + 2, -3.6] },
    ];
  }
  /** Walking, front on: the forward foot comes down nearer (lower), the other pushes off (higher). */
  function legsWalk(P, f) {
    const fwd = f ? 1 : -1;
    return [-1, 1].map((sg) => {
      const front = sg === fwd;
      return front
        ? { h: [sg * P.hipW, P.hipY + 1], k: [sg * (P.hipW + 1.8), P.hipY * 0.5 + 1.5], f: [sg * (P.hipW + 0.6), -2.2] }
        : { h: [sg * P.hipW, P.hipY + 1], k: [sg * (P.hipW - 0.4), P.hipY * 0.5 - 1.5], f: [sg * (P.hipW + 0.2), -7.6] };
    });
  }
  function walkArm(P, sg, f) {
    const fwd = f ? 1 : -1; // the arm on the other side from the forward foot swings forward
    const s = [sg * (P.shW - 2.2), P.shY + 3.6];
    if (sg !== fwd) {
      // swinging forward: the hand comes in front, nearer the middle and a little higher
      const e = [s[0] + sg * 2.4, s[1] + P.ua - 2];
      return { s, e, h: [e[0] - sg * 3.8, e[1] + P.fa - 3.6], hand: "open" };
    }
    const e = [s[0] + sg * 4.6, s[1] + P.ua - 1];
    return { s, e, h: [e[0] + sg * 1.4, e[1] + P.fa - 1], hand: "open" };
  }
  function blankRig(P, b) {
    return {
      hip: [-0.5, P.hipY],
      sh: [0, P.shY - b],
      head: [0, P.headY - b, 0],
      legs: legsStand(P),
      arms: [relaxArm(P, -1, b), relaxArm(P, 1, b)],
      props: { under: [], back: [], mid: [], hand: [], front: [] },
      shadow: 21,
      gaze: false,
      mouth: "smile",
    };
  }
  /** Shift a whole rig down (sitting, kneeling) by dy, and its upper body by ux. */
  function seat(R, P, hipY, torsoK, neckK, ux) {
    const T = (P.shY - P.hipY) * torsoK;
    const N = (P.headY - P.shY) * neckK;
    R.hip = [0, hipY];
    R.sh = [ux || 0, hipY + T];
    R.head = [(ux || 0) * 1.3, hipY + T + N, 0];
    return R;
  }
  /** Floor sitting, knees up: arms resting on the knees. */
  function sitKneesUp(R, P, kx, ky, fx, b) {
    seat(R, P, -7, 0.97, 1, 0);
    R.sh[1] -= b;
    R.head[1] -= b;
    R.legs = [-1, 1].map((sg) => ({ h: [sg * P.hipW, -6], k: [sg * kx, ky], f: [sg * fx, -3] }));
    R.legsOver = true;
    R.hem = 3;
    R.shadow = 24;
    return R;
  }

  const RIGS = {
    june(pose, f) {
      const P = PEOPLE.june.P;
      const b = f ? 0.7 : 0;
      const R = blankRig(P, b);
      // the ledger tucked under her arm, its lower corner in her gloved hand
      const ledgerAtSide = (dy) => {
        const s = [P.shW - 2.2, P.shY + 3 - dy];
        const e = [s[0] + 4.6, s[1] + P.ua - 1.4];
        const h = [e[0] - 2.4, e[1] + P.fa - 2.6];
        R.arms[1] = { s, e, h, hand: "grip" };
        R.props.hand.push((ctx) => ledgerClosed(ctx, h[0] - 2.6, h[1] - 9.4, -0.16, 14, 19));
      };
      if (pose === "stand") {
        ledgerAtSide(b);
        R.head[2] = f ? 0.02 : 0;
      } else if (pose === "walk") {
        R.legs = legsWalk(P, f);
        R.hip = [0, P.hipY + 1];
        R.sh[1] = P.shY + 1;
        R.head[1] = P.headY + 1;
        R.head[2] = f ? 0.03 : -0.03;
        R.arms[0] = walkArm(P, -1, f);
        ledgerAtSide(-1);
      } else if (pose === "work") {
        // kneeling on a pad at a bed, bowed over it: the trowel in the soil (f 0), then lifting a
        // scoop (f 1); the other hand firms the soil round a seedling
        seat(R, P, -15, 0.66, 0.5, 0);
        R.head[2] = 0.04;
        R.gaze = true;
        R.legs = [-1, 1].map((sg) => ({ h: [sg * (P.hipW - 0.6), -15], k: [sg * (P.hipW + 1.4), -5.4], kneel: true }));
        R.hem = 4;
        R.shadow = 27;
        R.props.hand.push((ctx) => {
          // the bed's soil heaped in front of her knees (inside the canvas: the ground is y = 0), with
          // seedlings beside her hands, big enough to read at the game's scale
          ctx.beginPath();
          ctx.moveTo(-26, 0);
          ctx.bezierCurveTo(-20, -6.2, 20, -6.2, 26, 0);
          ctx.closePath();
          paint(ctx, "#5a3d27", 1.3);
          curve(ctx, [-19, -2.6], [0, -5.6], [19, -2.6], "#7a5636", 1.3);
          [[-21, -1.2], [-12.5, -2.6], [7, -3.2], [17, -1.6]].forEach(([x, y]) => oval(ctx, x, y, 1.3, 0.8, 0, "#3e2a1b", 0));
          sprout(ctx, -17, -2.4, 1);
          sprout(ctx, 3.4, -4.2, 1.1);
        });
        const sR = [P.shW - 2.2, R.sh[1] + 3];
        if (f) {
          const e = [sR[0] + 6.6, sR[1] + 12];
          const h = [e[0] - 2, e[1] + 11];
          R.arms[1] = { s: sR, e, h, hand: "grip" };
          R.props.front.push((ctx) => trowel(ctx, h[0], h[1], -0.6, true));
        } else {
          const e = [sR[0] + 5.6, sR[1] + 13];
          const h = [e[0] - 7.4, e[1] + 13.4];
          R.arms[1] = { s: sR, e, h, hand: "grip" };
          R.props.front.push((ctx) => trowel(ctx, h[0], h[1], 1.25, false));
        }
        const sL = [-P.shW + 2.2, R.sh[1] + 3];
        const eL = [sL[0] - 5.6, sL[1] + 13];
        R.arms[0] = { s: sL, e: eL, h: [-9.4, -6.2], hand: "open" }; // pressing the soil
      } else if (pose === "sit") {
        // on the floor, knees up, arms round her knees; the ledger on the floor beside her (a seat drawn
        // in a front view hides behind the shins and reads as standing: the floor reads as sitting)
        sitKneesUp(R, P, 7.4, -29, 8.8, b);
        R.props.under.push((ctx) => ledgerFlat(ctx, -27, -2.6));
        const y = R.sh[1] + 3;
        R.arms = [-1, 1].map((sg) => {
          const s = [sg * (P.shW - 2.2), y];
          const e = [sg * (P.shW + 2.4), y + 15];
          return { s, e, h: [sg * 3.4, -21.5 - b * 0.4], hand: "grip" };
        });
      } else if (pose === "read") {
        // the ledger open in both hands, reading; a page turning on f 1
        R.gaze = true;
        R.head[2] = 0.03;
        const y = P.shY + 3 - b;
        R.arms = [-1, 1].map((sg) => {
          const s = [sg * (P.shW - 2.2), y];
          const e = [sg * (P.shW + 1.6), y + 18];
          return { s, e, h: [sg * 11.6, y + 25], hand: "grip" };
        });
        R.props.hand.push((ctx) => bookOpen(ctx, 0, y + 21.5, 0, 26, 16, LEDGER, { turn: !!f }));
      }
      return R;
    },
    tomas(pose, f) {
      const P = PEOPLE.tomas.P;
      const b = f ? 0.7 : 0;
      const R = blankRig(P, b);
      R.mouth = "half";
      // the red rag hanging from his back pocket, peeking out past his left hip
      const rag = (dx, dy, swing) => (ctx) => {
        const x = P.hipW + 4.6 + dx;
        const y = P.hipY - 3 + dy;
        poly(ctx, [[x - 3, y], [x + 3, y - 0.8], [x + 4.4 + swing, y + 12], [x + 2.8 + swing, y + 21], [x + 0.6 + swing, y + 17], [x - 1.6 + swing, y + 20], [x - 1.4 + swing * 0.5, y + 9]], "#d2352b", 1.3);
        line(ctx, [[x, y + 1.6], [x + 1.2 + swing, y + 15]], "rgba(0,0,0,0.25)", 0.8);
        line(ctx, [[x + 2.2, y + 2], [x + 3 + swing, y + 12]], "rgba(255,255,255,0.25)", 0.7);
      };
      const wrenchHand = (a, ang) => R.props.hand.push((ctx) => wrench(ctx, a.h[0], a.h[1], ang, 18));
      if (pose === "stand") {
        R.props.mid.push(rag(0, 0, 0));
        R.arms[0].hand = "grip";
        wrenchHand(R.arms[0], 1.62);
      } else if (pose === "walk") {
        R.legs = legsWalk(P, f);
        R.hip[1] += 1;
        R.sh[1] = P.shY + 1;
        R.head[1] = P.headY + 1;
        R.head[2] = f ? -0.03 : 0.03;
        R.arms = [walkArm(P, -1, f), walkArm(P, 1, f)];
        R.arms[0].hand = "grip";
        R.props.mid.push(rag(0, 1, f ? 1.4 : -1.4));
        wrenchHand(R.arms[0], f ? 1.75 : 1.45);
      } else if (pose === "work") {
        // down on one knee nailing a fence board: the hammer up (f 0), then striking (f 1)
        seat(R, P, -25, 0.82, 0.86, 3);
        R.head[2] = 0.08;
        R.gaze = true;
        R.mouth = "smile";
        R.legs = [
          { h: [-P.hipW, -25], k: [-P.hipW - 3, -3.6], kneel: true },
          { h: [P.hipW, -25], k: [P.hipW + 6, -24], f: [P.hipW + 6.6, -3.2], over: true },
        ];
        R.hem = 3;
        R.shadow = 28;
        // a wrench put down beside him; the board lies in front of his kneeling knee (drawn over it,
        // under the raised leg), a nail started in it at x = 1.2
        const NAIL = [1.2, -6.4, -11.4]; // x, the board's top, the nail's head
        R.props.under.push((ctx) => wrench(ctx, 26, -2.6, -0.12, 13));
        R.props.mid.push((ctx) => {
          rbox(ctx, -20, NAIL[1], 34, 5, 0.8, "#b48a5a", 1.3);
          line(ctx, [[-17, -4.6], [8, -4.4]], "rgba(90,60,30,0.5)", 0.6);
        });
        R.props.mid.push(rag(-1, 1, 0));
        R.props.hand.push((ctx) => {
          line(ctx, [[NAIL[0], NAIL[1]], [NAIL[0], NAIL[2]]], "#8f969c", 1.3);
          inkLine(ctx, [[NAIL[0] - 1.2, NAIL[2] - 0.2], [NAIL[0] + 1.2, NAIL[2] - 0.2]], 0.9);
        });
        // the right hand reaches past his knee and holds the board steady
        const sR = [R.sh[0] + P.shW - 0.5, R.sh[1] + 2.4];
        const eR = [sR[0] + 3.5, sR[1] + 21];
        R.arms[1] = { s: sR, e: eR, h: [9.5, -9], hand: "open" };
        const sL = [R.sh[0] - P.shW + 0.5, R.sh[1] + 2.4];
        if (f) {
          // the strike: the hammer level, its face (the lower end of the head) on the nail's head
          const ang = 0.15;
          const len = 10.5;
          const face = [len + 0.1, 7.9]; // the face's striking edge, in the hammer's own frame (see hammer())
          const h = [NAIL[0] - (face[0] * Math.cos(ang) - face[1] * Math.sin(ang)), NAIL[2] - (face[0] * Math.sin(ang) + face[1] * Math.cos(ang))];
          R.arms[0] = { s: sL, e: [sL[0] - 8, sL[1] + 17], h, hand: "grip" };
          R.props.hand.push((ctx) => hammer(ctx, h[0], h[1], ang, len));
          R.props.front.push((ctx) => {
            // a burst of short lines out to the sides of the nail's head
            [-0.55, -0.1, 0.35, Math.PI + 0.55, Math.PI + 0.1, Math.PI - 0.35].forEach((a) => {
              const c = Math.cos(a);
              const sn = Math.sin(a);
              line(ctx, [[NAIL[0] + c * 4.4, NAIL[2] + sn * 3], [NAIL[0] + c * 7.6, NAIL[2] + sn * 5.2]], "#f2c12e", 1.3);
            });
          });
        } else {
          const eL = [sL[0] - 17, sL[1] - 9];
          const h = [eL[0] + 3, eL[1] - 18];
          R.arms[0] = { s: sL, e: eL, h, hand: "grip" };
          R.props.hand.push((ctx) => hammer(ctx, h[0], h[1], -1.95, 11));
        }
      } else if (pose === "sit") {
        // on the floor, long legs up, forearms across his knees, the wrench hanging from one hand
        sitKneesUp(R, P, 12.4, -34, 12.8, b);
        R.head[2] = -0.04;
        const y = R.sh[1] + 3;
        R.arms = [-1, 1].map((sg) => {
          const s = [sg * (P.shW - 2.2), y];
          const e = [sg * 18.6, -28.5 - b * 0.5];
          return { s, e, h: [sg * 6.4, -27.5 - b * 0.5], hand: "grip" };
        });
        R.props.front.push((ctx) => wrench(ctx, -6.4, -26.5 - b * 0.5, f ? 1.4 : 1.66, 14));
      } else if (pose === "read") {
        // the manual open in his left hand; the right hand with the wrench, then at his chin, thinking
        R.gaze = true;
        R.head[2] = -0.05;
        R.props.mid.push(rag(0, 0, 0));
        const y = P.shY + 3 - b;
        const sR = [P.shW - 2.2, y];
        const eR = [P.shW + 2.4, y + 18];
        R.arms[1] = { s: sR, e: eR, h: [4.6, y + 24.5], hand: "grip" };
        R.props.hand.push((ctx) => manual(ctx, 1.5, y + 20.5, -0.08));
        const sL = [-P.shW + 2.2, y];
        if (f) {
          const eL = [-P.shW - 3.2, y + 16.5];
          const h = [-6.6, y - 2.6];
          R.arms[0] = { s: sL, e: eL, h, hand: "grip" };
          R.gaze = false;
          R.head[2] = 0.07;
          R.props.hand.push((ctx) => wrench(ctx, h[0] - 1, h[1] + 2, 2.05, 12));
        } else {
          R.arms[0].hand = "grip";
          R.props.hand.push((ctx) => wrench(ctx, R.arms[0].h[0], R.arms[0].h[1], 1.62, 18));
        }
      }
      return R;
    },
    pip(pose, f) {
      const P = PEOPLE.pip.P;
      const b = f ? 0.7 : 0;
      const R = blankRig(P, b);
      // the walkie-talkie clipped on the hoodie (on the chest unless it is in their hands)
      const clipped = (dy) => (ctx) => walkie(ctx, R.sh[0] + 7.6, R.sh[1] + 10 + (dy || 0), 0.06, false);
      if (pose === "stand") {
        // hands in the hoodie's front pocket
        R.arms = [-1, 1].map((sg) => {
          const s = [sg * P.shW, P.shY + 2.4 - b];
          const e = [sg * (P.shW + 3.2), s[1] + P.ua - 1];
          return { s, e, h: [sg * 7.2, P.hipY - 8], hand: "none" };
        });
        R.props.front.push((ctx) => pocketFront(ctx, R));
        R.props.front.push(clipped(0));
      } else if (pose === "walk") {
        R.legs = legsWalk(P, f);
        R.hip[1] += 1;
        R.sh[1] = P.shY + 1;
        R.head[1] = P.headY + 1;
        R.head[2] = f ? 0.04 : -0.04;
        R.arms = [walkArm(P, -1, f), walkArm(P, 1, f)];
        R.props.hand.push(clipped(f ? 0.6 : -0.6));
      } else if (pose === "work") {
        // writing on the clipboard: the pencil out from behind the ear, moving down the list
        R.noPencil = true;
        R.gaze = true;
        R.head[2] = 0.06;
        R.mouth = "half";
        const y = P.shY + 2.4 - b;
        const sL = [-P.shW, y];
        const eL = [-P.shW - 2.6, y + 17];
        const hL = [-6.4, y + 22];
        R.arms[0] = { s: sL, e: eL, h: hL, hand: "grip" };
        const sR = [P.shW, y];
        const eR = [P.shW + 3, y + 16];
        const hR = f ? [5.2, y + 21] : [2.4, y + 17.6];
        R.arms[1] = { s: sR, e: eR, h: hR, hand: "grip" };
        R.props.hand.push(clipped(0)); // on the hoodie, behind the clipboard held out in front
        R.props.hand.push((ctx) => clipboard(ctx, -1.2, y + 17, -0.12, f));
        R.props.front.push((ctx) => pencil(ctx, [hR[0] + 3.4, hR[1] - 6.6], [hR[0] - 1.6, hR[1] - 0.6]));
      } else if (pose === "sit") {
        // cross-legged on the floor, the walkie-talkie in both hands, listening
        seat(R, P, -8, 0.97, 1, 0);
        R.sh[1] -= b;
        R.head[1] -= b;
        R.head[2] = 0.05;
        R.legs = [
          { h: [-P.hipW, -8], k: [-18.5, -9.5], f: [5.4, -4.6], foot: "side", toe: 1 },
          { h: [P.hipW, -8], k: [18.5, -9.5], f: [-5.4, -4.6], foot: "side", toe: -1 },
        ];
        R.legsOver = true;
        R.hem = 3;
        R.shadow = 26;
        const y = R.sh[1] + 2.4;
        const hands = [[-3.6, y + 19], [3.8, y + 20.5]];
        R.arms = [-1, 1].map((sg, i) => {
          const s = [sg * P.shW, y];
          const e = [sg * (P.shW + 2.8), y + 15.5];
          return { s, e, h: hands[i], hand: "grip" };
        });
        R.props.hand.push((ctx) => walkie(ctx, 0.2, y + 15.6, -0.05, !!f, 1.15));
      } else if (pose === "read") {
        // the notebook held up close, both hands
        R.gaze = true;
        R.head[2] = f ? -0.05 : 0.02;
        const y = P.shY + 2.4 - b;
        R.arms = [-1, 1].map((sg) => {
          const s = [sg * P.shW, y];
          const e = [sg * (P.shW + 2.4), y + 16];
          return { s, e, h: [sg * 8.4, y + 15.6], hand: "grip" };
        });
        R.props.hand.push(clipped(0)); // on the hoodie, behind the notebook
        R.props.hand.push((ctx) => notebook(ctx, 0, y + 13.6, f ? 0.04 : -0.03, f));
      }
      return R;
    },
  };
  /** Pip's pocket drawn again over the wrists, so the hands go into it. */
  function pocketFront(ctx, R) {
    const L = PEOPLE.pip;
    const [hx, hy] = R.hip;
    const pk = [hx, hy - 9];
    poly(ctx, [[pk[0] - 8.5, pk[1] + 7], [pk[0] - 6.5, pk[1] - 2], [pk[0] + 6.5, pk[1] - 2], [pk[0] + 8.5, pk[1] + 7]], shade(L.top, -6), 1);
    [-1, 1].forEach((s) => curve(ctx, [pk[0] + s * 6.5, pk[1] - 2], [pk[0] + s * 9, pk[1] + 2], [pk[0] + s * 8.5, pk[1] + 7], shade(L.top, -40), 1.2));
    line(ctx, [[pk[0] - 5.4, pk[1] + 0.4], [pk[0] + 5.4, pk[1] + 0.4]], "rgba(255,255,255,0.2)", 0.7);
  }

  /** A whole person in a pose: shadow, things on the ground, legs, body, head, arms, things in hand. */
  function figure(ctx, L, R) {
    groundShadow(ctx, 0, R.shadow, 4.6);
    R.props.under.forEach((fn) => fn(ctx));
    R.props.back.forEach((fn) => fn(ctx));
    const legs = () => R.legs.forEach((g, i) => !g.over && leg(ctx, L, g, i ? 1 : -1));
    const legsOver = () => R.legs.forEach((g, i) => g.over && leg(ctx, L, g, i ? 1 : -1));
    if (!R.legsOver) legs();
    R.props.mid.forEach((fn) => fn(ctx));
    neck(ctx, L, R);
    torso(ctx, L, R);
    legsOver();
    if (R.legsOver) legs();
    head(ctx, L, R, {});
    R.props.hand.forEach((fn) => fn(ctx));
    R.arms.forEach((a, i) => arm(ctx, L, a, i ? 1 : -1));
    R.props.front.forEach((fn) => fn(ctx));
  }

  /* A crew id the art does not know yet: a plain figure in grey work clothes (never invisible). */
  const OTHER = {
    id: "other", skin: "#d2a07a", blush: "rgba(210,100,80,0.22)", lip: "#9a5040", iris: "#4a3a2a", brow: "#3a2e26",
    hair: "#4a3a2e", hairShade: "#6a5444", top: "#7d858e", shirt: "#7d858e", pants: "#4b5058", shoe: "#3a2e26", sole: "#1d1915",
    sleeve: "#7d858e", hand: "#d2a07a", P: Object.assign({}, PEOPLE.june.P, { top: 119 }), // June's build, Pip's short hair
  };
  function rigOther(pose, f) {
    const P = OTHER.P;
    const R = blankRig(P, f ? 0.7 : 0);
    if (pose === "walk") {
      R.legs = legsWalk(P, f);
      R.arms = [walkArm(P, -1, f), walkArm(P, 1, f)];
    }
    return R;
  }

  D.registerSprite("crew", 192, 256, (ctx, w, h, o) => {
    const L = PEOPLE[o.who] || OTHER;
    const pose = POSES.includes(o.pose) ? o.pose : "stand";
    const f = o.f ? 1 : 0;
    const k = 2 * (PERSON_TOP / L.P.top); // 2 px a unit, fitted so the standing head reaches PERSON_TOP
    LWK = 1;
    ctx.save();
    ctx.translate(w / 2, h);
    ctx.scale(k, k);
    ctx.lineJoin = "round";
    figure(ctx, L, L === OTHER ? rigOther(pose, f) : RIGS[L.id](pose, f));
    ctx.restore();
  });

  /* ---------- Portraits for the crew card: head and shoulders on a panel in their color ---------- */
  D.registerSprite("crewFace", 256, 256, (ctx, w, h, o) => {
    const L = PEOPLE[o.who] || OTHER;
    const P = L.P;
    // the panel's tint: their CREW color from the facts (js/story-crew.js loads first), else the same colors kept here
    const fact = ZSR.WORLD && ZSR.WORLD.CREW && ZSR.WORLD.CREW[o.who];
    const accent = (fact && /^#[0-9a-f]{6}$/i.test(fact.color || "") && fact.color) || { june: "#5b8a3c", tomas: "#33507a", pip: "#e07a2a" }[L.id] || "#7d858e";
    // the panel: a pale wash of their color, rays from behind the head, halftone
    ctx.fillStyle = mix(accent, "#f6efdc", 0.72);
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h * 0.42);
    ctx.fillStyle = mix(accent, "#f6efdc", 0.58);
    for (let i = 0; i < 16; i += 2) {
      const a0 = (i / 16) * TAU;
      const a1 = ((i + 1) / 16) * TAU;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a0) * 260, Math.sin(a0) * 260);
      ctx.lineTo(Math.cos(a1) * 260, Math.sin(a1) * 260);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    D.halftone(ctx, w, h, 0.06);
    const R = L === OTHER ? rigOther("stand", 0) : RIGS[L.id]("stand", 0);
    const S = 4.3;
    LWK = 0.6;
    ctx.save();
    ctx.translate(w / 2, h * 0.44);
    ctx.scale(S, S);
    ctx.translate(-R.head[0], -R.head[1]);
    ctx.lineJoin = "round";
    neck(ctx, L, R);
    torso(ctx, L, R);
    // the shoulders' sleeves, going out of the frame
    R.arms.forEach((a, i) => {
      const sg = i ? 1 : -1;
      tube(ctx, [a.s, [a.s[0] + sg * 2.6, a.s[1] + 26]], P.armW + 0.6, L.sleeve);
    });
    if (L.id === "june") ledgerClosed(ctx, P.shW - 7, P.shY + 17, -0.22, 14, 19);
    if (L.id === "tomas") {
      // the wrench over his shoulder
      const hx = -P.shW + 2.6;
      const hy = P.shY + 11;
      wrench(ctx, hx, hy, -2.02, 19);
      tube(ctx, [[hx + 2, hy + 24], [hx, hy + 1]], P.armW - 1, L.skin);
      hand(ctx, L, hx, hy, -Math.PI / 2 - 0.1, "grip", 1);
    }
    if (L.id === "pip") walkie(ctx, 7.6, P.shY + 10, 0.06, true);
    head(ctx, L, R, { detail: true });
    ctx.restore();
    LWK = 1;
    // the panel's ink edge
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, w, h);
  });

  /* ---------- The dog: a scruffy medium-size stray, sandy tan, a dark brown patch over one eye,
     one ear up and one that flops, a long tail. Side view facing right, 160 x 128 at 2 px a unit
     (80 x 64 units, the ground at y = 0). ---------- */
  const DOG = { fur: "#d6ab68", shade: "#b58a4e", light: "#f0d9ac", patch: "#56351f", nose: "#1b1512", ear: "#a97b42" };
  const DOG_POSES = ["stand", "walk", "sit", "bark"];
  /** Tubes that join without seams: every ink outline first, then every fill (segs: [{ pts, w }]). */
  function tubes(ctx, segs, color) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    segs.forEach(({ pts, w }) => {
      trace(ctx, pts, false);
      ctx.strokeStyle = INK;
      ctx.lineWidth = w + 2.6 * LWK;
      ctx.stroke();
    });
    segs.forEach(({ pts, w }) => {
      trace(ctx, pts, false);
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.stroke();
    });
    segs.forEach(({ pts, w }) => {
      ctx.save();
      ctx.translate(-w * 0.2, -w * 0.05);
      trace(ctx, pts, false);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = w * 0.28;
      ctx.stroke();
      ctx.restore();
    });
  }
  /** A leg through hip, knee and paw: thick at the top, thinner at the paw, the paw toward the nose. */
  function dogLeg(ctx, pts, far) {
    const c = far ? DOG.shade : DOG.fur;
    const [top, mid, paw] = pts;
    tubes(ctx, [{ pts: [top, mid], w: 6 }, { pts: [mid, paw], w: 4.4 }], c);
    oval(ctx, paw[0] + 1.5, paw[1] - 0.3, 3.4, 1.9, 0, c, 1.3);
    line(ctx, [[paw[0] + 2.6, paw[1] - 1.4], [paw[0] + 2.8, paw[1] + 0.8]], "rgba(15,16,18,0.5)", 0.5);
  }
  function dogTail(ctx, pts) {
    tubes(ctx, [{ pts: pts.slice(0, 2), w: 4 }, { pts: pts.slice(1), w: 3 }], DOG.fur);
    // a scruffy tip
    const [x, y] = pts[pts.length - 1];
    const [px, py] = pts[pts.length - 2];
    const a = Math.atan2(y - py, x - px);
    [-0.55, 0, 0.55].forEach((d) => line(ctx, [[x, y], [x + Math.cos(a + d) * 3.4, y + Math.sin(a + d) * 3.4]], INK, 1.8));
    [-0.55, 0, 0.55].forEach((d) => line(ctx, [[x, y], [x + Math.cos(a + d) * 2.5, y + Math.sin(a + d) * 2.5]], DOG.fur, 1));
  }
  /** Fill a trunk path with the fur (lighter toward the belly) and ink it. */
  function furFill(ctx, y0, y1) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, shade(DOG.fur, 10));
    g.addColorStop(0.6, DOG.fur);
    g.addColorStop(1, DOG.light);
    ctx.fillStyle = g;
    ctx.fill();
    ink(ctx, 1.5);
    ctx.stroke();
  }
  /** Ragged fur along a line: little zig-zags (for a chest or a belly). */
  function ragged(ctx, pts, out) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      ctx.lineTo((x0 + x1) / 2 + out[0], (y0 + y1) / 2 + out[1]);
      ctx.lineTo(x1, y1);
    }
  }
  /** Head (the skull's center at x, y), tilted by tilt; mouth: 0 shut, 1 a little open, 2 barking. */
  function dogHead(ctx, x, y, tilt, mouth) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt || 0);
    // the far ear, standing up
    poly(ctx, [[-5, -5.4], [-3.4, -14.4], [2.4, -6.6]], DOG.shade, 1.4);
    poly(ctx, [[-3.8, -6.4], [-3.1, -11.6], [0.6, -6.6]], "#e3a994", 0);
    // the lower jaw, dropped open when barking
    const drop = mouth === 2 ? 0.55 : mouth === 1 ? 0.22 : 0;
    if (drop) {
      ctx.save();
      ctx.translate(3.4, 2.8);
      ctx.rotate(drop);
      poly(ctx, [[0, -1.6], [9.4, -1.2], [9.4, 0.4], [0, 1.6]], "#7a2a26", 0);
      rbox(ctx, 0, 0, 9.4, 3, 1.4, DOG.light, 1.3);
      oval(ctx, 5, -0.4, 2.8, 1, 0, "#e06a78", 0);
      ctx.restore();
    }
    // skull and muzzle
    ctx.beginPath();
    ctx.moveTo(-8, 1);
    ctx.bezierCurveTo(-8.6, -8, 2, -10, 5.6, -5);
    ctx.lineTo(12.4, -3.4);
    ctx.quadraticCurveTo(14.6, -2.6, 14.2, 0.4);
    ctx.quadraticCurveTo(13.6, 2.8, 11, 2.9);
    ctx.lineTo(4, 3.4);
    ctx.quadraticCurveTo(0.6, 8, -4, 6.6);
    ctx.quadraticCurveTo(-7.6, 5, -8, 1);
    ctx.closePath();
    const g = ctx.createRadialGradient(-1, -4, 1, 0, 0, 11);
    g.addColorStop(0, shade(DOG.fur, 16));
    g.addColorStop(1, DOG.fur);
    ctx.fillStyle = g;
    ctx.fill();
    ink(ctx, 1.5);
    ctx.stroke();
    // a lighter muzzle, the nose, the mouth line
    oval(ctx, 9.4, 0.8, 4.2, 1.9, -0.08, DOG.light, 0);
    oval(ctx, 13.2, -1.4, 1.9, 1.5, 0, DOG.nose, 0.8);
    circle(ctx, 12.7, -2, 0.5, "#ffffff", 0);
    if (!drop) curve(ctx, [5, 2.9], [8.4, 3.8], [11.4, 2.8], INK, 0.9);
    // the dark brown patch over the eye, then the eye: big and dark, with a highlight, a brow
    ctx.beginPath();
    ctx.moveTo(-1.6, -6.4);
    ctx.bezierCurveTo(2.6, -8.6, 7.2, -6, 6.4, -2.4);
    ctx.bezierCurveTo(5.8, 0.6, 1.4, 1.2, -0.4, -0.6);
    ctx.bezierCurveTo(-2.2, -2.4, -3, -5, -1.6, -6.4);
    ctx.closePath();
    paint(ctx, DOG.patch, 0);
    oval(ctx, 2.8, -3.2, 1.8, 1.9, 0, "#120d0a", 0.6);
    circle(ctx, 2.3, -3.9, 0.6, "#ffffff", 0);
    curve(ctx, [0.6, -6.4], [2.8, -7.4], [5, -6.2], "rgba(15,16,18,0.8)", 0.8);
    // scruff on the cheek
    [[-5.2, 4.4], [-3.4, 5.6], [-6.8, 2.4]].forEach(([fx, fy]) => line(ctx, [[fx, fy], [fx - 1.6, fy + 1.6]], INK, 1.1));
    // the near ear, flopped forward and down
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.quadraticCurveTo(-1.6, -9.8, 0.8, -6.8);
    ctx.quadraticCurveTo(-0.8, -2, -3.2, 3.4);
    ctx.quadraticCurveTo(-6.8, 3.2, -7.4, -1.4);
    ctx.closePath();
    paint(ctx, DOG.ear, 1.4);
    curve(ctx, [-4.8, -5.4], [-2.6, -2], [-3.6, 1.6], "rgba(15,16,18,0.35)", 0.6);
    ctx.restore();
  }
  function dog(ctx, pose, f) {
    if (pose === "sit") {
      groundShadow(ctx, 38, 24, 3);
      // haunches down, front legs straight, the tail along the ground
      dogTail(ctx, [[25, -4.4], [15, -2.6], [6, -4.8]]);
      dogLeg(ctx, [[55, -24], [55.4, -12], [56, -1.6]], true);
      dogLeg(ctx, [[51, -24], [51.4, -12], [52, -1.6]], false);
      ctx.beginPath();
      ctx.moveTo(24, -4);
      ctx.bezierCurveTo(21, -16, 30, -28, 40, -33);
      ctx.bezierCurveTo(44, -35.5, 46, -39, 48, -44);
      ctx.lineTo(57, -41);
      ragged(ctx, [[57, -41], [59, -36], [59, -31], [57.6, -26], [55.6, -22]], [1.6, 0.2]);
      ctx.bezierCurveTo(52, -18, 46, -15, 41, -9);
      ctx.lineTo(37, -2.6);
      ctx.lineTo(27, -2.2);
      ctx.closePath();
      furFill(ctx, -40, -2);
      // the near haunch: a curve for the thigh, the hind paw forward
      curve(ctx, [26, -18], [35, -24], [39, -12], INK, 1.2);
      curve(ctx, [27.5, -16], [33, -20], [36, -13], "rgba(255,255,255,0.25)", 1.2);
      oval(ctx, 40.5, -1.9, 4, 2, 0, DOG.fur, 1.3);
      curve(ctx, [47, -33], [51, -29], [50.5, -24], "rgba(15,16,18,0.6)", 0.9);
      dogHead(ctx, 55, -46.5, f ? 0.14 : -0.04, 0);
      return;
    }
    const walk = pose === "walk";
    const bark = pose === "bark";
    const s = f ? 1 : -1;
    const by = walk && f ? -0.7 : 0;
    ctx.save();
    if (bark) ctx.translate(-6, 0);
    groundShadow(ctx, 40, 28, 3.2);
    // legs: [hip, knee, paw]; a walk swings the diagonal pairs
    const st = walk ? 3.6 : 0;
    const legs = {
      farFront: [[57, -24 + by], [57 - s * st * 0.4, -12], [bark ? 61 : 57.6 - s * st, -1.6]],
      farHind: [[24.5, -24 + by], [22 + s * st * 0.3, -11], [bark ? 21 : 24 + s * st, -1.6]],
      nearHind: [[28.5, -23 + by], [26 - s * st * 0.3, -11], [bark ? 25 : 28 - s * st, -1.6]],
      nearFront: [[53.5, -24 + by], [53.5 + s * st * 0.4, -12], [bark ? 57.5 : 54 + s * st, -1.6]],
    };
    dogLeg(ctx, legs.farFront, true);
    dogLeg(ctx, legs.farHind, true);
    dogLeg(ctx, legs.nearHind, false);
    dogLeg(ctx, legs.nearFront, false);
    const wag = pose === "stand" ? s : walk ? s * 0.6 : 0;
    // (the tip's tufts stay inside the canvas's left edge, also with the bark's shift)
    dogTail(ctx, bark ? [[21, -29], [15.5, -37], [12.5, -45.5]] : [[21, -29 + by], [13.4 + wag, -34 + by], [8.6 + wag * 2.4, -42 + wag * 1.6 + by]]);
    // the trunk and neck in one shape
    const up = bark ? 1.4 : 0;
    ctx.beginPath();
    ctx.moveTo(20, -29 + by);
    ctx.bezierCurveTo(23, -35 + by, 34, -35.5 + by, 45, -34 + by);
    ctx.bezierCurveTo(49, -33.6 + by, 51, -36 + by, 53, -41 + by - up);
    ctx.lineTo(55.5, -46 + by - up);
    ctx.lineTo(63, -41 + by - up);
    ragged(ctx, [[63, -41 + by - up], [63.4, -36 + by], [62.6, -31 + by], [61, -26.5 + by], [58, -22.4 + by]], [1.6, 0.4]);
    ragged(ctx, [[58, -22.4 + by], [52, -21 + by], [46, -21.4 + by], [40, -21.6 + by], [34, -21.4 + by], [29, -21 + by]], [0, 1.6]);
    ctx.bezierCurveTo(24, -19.6 + by, 18.4, -22 + by, 20, -29 + by);
    ctx.closePath();
    furFill(ctx, -35, -21);
    // the thigh's and the shoulder's curves on the trunk; a few tufts along the back
    curve(ctx, [22.5, -31 + by], [33, -31 + by], [31.5, -21.5 + by], INK, 1.2);
    curve(ctx, [24, -29 + by], [31, -29 + by], [30, -23 + by], "rgba(255,255,255,0.25)", 1.2);
    curve(ctx, [50, -33 + by], [55, -29 + by], [54, -24 + by], "rgba(15,16,18,0.6)", 0.9);
    [[31, -34.6], [37, -35.2], [43, -34.6]].forEach(([fx, fy]) => line(ctx, [[fx, fy + by], [fx + 2, fy + 1.6 + by]], "rgba(90,60,30,0.5)", 0.7));
    if (bark) {
      dogHead(ctx, 61.5, -47.6, -0.32, f ? 1 : 2);
      // the bark: short lines from the open mouth
      [-0.7, -0.15, 0.4].forEach((a, i) => {
        if (f && i === 1) return;
        const r0 = f ? 4.6 : 3.4;
        const r1 = f ? 7.6 : 8.6;
        line(ctx, [[75 + Math.cos(a) * r0, -50 + Math.sin(a) * r0], [75 + Math.cos(a) * r1, -50 + Math.sin(a) * r1]], INK, 1.8);
      });
    } else {
      dogHead(ctx, 61.5, -47 + by, walk ? 0.04 : f ? 0.08 : 0, pose === "stand" && f ? 1 : 0);
    }
    ctx.restore();
  }
  D.registerSprite("crewDog", 160, 128, (ctx, w, h, o) => {
    LWK = 1;
    ctx.save();
    // left: true draws it facing left (the engine's sprites cannot be mirrored when drawn)
    if (o.left) ctx.setTransform(-2, 0, 0, 2, w, h);
    else ctx.setTransform(2, 0, 0, 2, 0, h);
    ctx.lineJoin = "round";
    dog(ctx, DOG_POSES.includes(o.pose) ? o.pose : "stand", o.f ? 1 : 0);
    ctx.restore();
  });

  /* ---------- Quest objects on a floor: 128 x 96 at 2 px a unit (64 x 48 units, the ground at
     y = 0), bright, with thick ink and a little glint so they read as something to pick up ---------- */
  const QLW = 1.8;
  const Q = {
    bag(ctx) {
      // a canvas zip bag with a strap
      ctx.beginPath();
      ctx.moveTo(22, -26);
      ctx.quadraticCurveTo(32, -46, 42, -26);
      ink(ctx, 4.6);
      ctx.stroke();
      ctx.strokeStyle = "#8a4a22";
      ctx.lineWidth = 2;
      ctx.stroke();
      rbox(ctx, 12, -27, 40, 25, 5, "#e2a62b", QLW);
      rbox(ctx, 12, -27, 40, 8, 4, "#c4861a", QLW);
      line(ctx, [[16, -23], [48, -23]], INK, 1);
      rbox(ctx, 44, -25, 3, 6, 1, STEEL, 1);
      rbox(ctx, 27, -16, 10, 8, 1.4, "#f3eee0", 1.2);
      line(ctx, [[29, -13], [35, -13]], "#8a4a22", 0.8);
      line(ctx, [[29, -10.6], [33, -10.6]], "#8a4a22", 0.8);
    },
    photo(ctx) {
      // a framed photo on its stand: a person under a blue sky
      line(ctx, [[40, -30], [46, -2]], INK, 3.4);
      rbox(ctx, 14, -42, 32, 39, 2, "#d9a21b", QLW);
      rbox(ctx, 18.5, -37.5, 23, 30, 0.6, "#8fc4e6", 1.2);
      ctx.fillStyle = "#6f9a3c";
      ctx.fillRect(18.5, -16, 23, 8.5);
      circle(ctx, 30, -25, 4.2, "#c88c60", 1.1);
      ctx.beginPath();
      ctx.moveTo(22.5, -7.5);
      ctx.quadraticCurveTo(30, -20, 37.5, -7.5);
      ctx.closePath();
      paint(ctx, "#33507a", 1.1);
      oval(ctx, 30, -28.5, 4.4, 1.8, 0, "#3a2a20", 0);
      line(ctx, [[20, -36], [26, -30]], "rgba(255,255,255,0.6)", 1.6);
    },
    box(ctx) {
      // a cardboard box, taped, with a red label
      poly(ctx, [[10, -26], [42, -26], [54, -34], [22, -34]], "#dcae74", QLW);
      poly(ctx, [[42, -2], [54, -10], [54, -34], [42, -26]], "#a8713e", QLW);
      poly(ctx, [[10, -2], [42, -2], [42, -26], [10, -26]], "#c8955a", QLW);
      poly(ctx, [[24, -26], [30, -26], [42, -34], [36, -34]], "#efe0a8", 1);
      ctx.fillStyle = "#efe0a8";
      ctx.fillRect(24, -26, 6, 9);
      rbox(ctx, 14, -16, 13, 9, 1, "#d2352b", 1.3);
      line(ctx, [[16.5, -12.6], [24.5, -12.6]], "#f3eee0", 1);
      line(ctx, [[16.5, -10], [22, -10]], "#f3eee0", 1);
    },
    book(ctx) {
      // a thick blue hardback lying flat, folded-down page corners poking out of its edge (the quest
      // texts: "a thick blue book with folded page corners")
      poly(ctx, [[8, -3], [44, -3], [44, -12], [8, -12]], PAGE, QLW);
      poly(ctx, [[44, -3], [54, -12], [54, -21], [44, -12]], PAGE, QLW);
      for (let i = 0; i < 4; i++) line(ctx, [[10, -5 + i * -1.8], [42, -5 + i * -1.8]], "rgba(120,100,70,0.5)", 0.5);
      [[16, -9.6], [27, -6.4], [36, -8.2]].forEach(([x, y]) => poly(ctx, [[x, y], [x + 3.4, y], [x + 1.2, y + 2.6]], "#fffaf0", 0.8));
      poly(ctx, [[8, -12], [44, -12], [54, -21], [18, -21]], "#2f6fb0", QLW);
      poly(ctx, [[22, -15], [40, -15], [44, -18.4], [26, -18.4]], "#f2c12e", 1);
    },
    tin(ctx) {
      // a round tin with a lid and a paper label
      rbox(ctx, 16, -30, 32, 27, 2, "#c0302a", QLW);
      oval(ctx, 32, -3, 16, 3.6, 0, "#c0302a", QLW);
      ctx.fillStyle = "#c0302a";
      ctx.fillRect(17, -10, 30, 7);
      rbox(ctx, 16, -24, 32, 12, 0.5, "#f3eee0", 1.2);
      circle(ctx, 32, -18, 4.2, "#f2c12e", 1.1);
      oval(ctx, 32, -31, 17, 4.6, 0, "#c4cad1", QLW);
      oval(ctx, 32, -31.6, 12, 2.6, 0, "#e3e7eb", 0.8);
      line(ctx, [[20, -27], [20, -6]], "rgba(255,255,255,0.35)", 2);
    },
    leash(ctx) {
      // a red leash in loose coils, the handle loop and a steel clip
      [[30, -8, 18, 5], [28, -12, 15, 4.4], [32, -15, 12, 3.8]].forEach(([x, y, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
        ink(ctx, 5);
        ctx.stroke();
        ctx.strokeStyle = "#d2352b";
        ctx.lineWidth = 2.6;
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.ellipse(16, -24, 6, 7, -0.5, 0, TAU);
      ink(ctx, 5);
      ctx.stroke();
      ctx.strokeStyle = "#d2352b";
      ctx.lineWidth = 2.6;
      ctx.stroke();
      rbox(ctx, 46, -12, 6, 4, 1, "#9aa1a8", 1.2);
      ctx.beginPath();
      ctx.arc(55, -10, 3.2, -Math.PI / 2, Math.PI / 2);
      ink(ctx, 3.4);
      ctx.stroke();
      ctx.strokeStyle = STEEL;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    },
    toolbox(ctx) {
      // a red steel toolbox: lid, handle, latches
      ctx.beginPath();
      ctx.moveTo(22, -28);
      ctx.lineTo(22, -36);
      ctx.lineTo(42, -36);
      ctx.lineTo(42, -28);
      ink(ctx, 4.6);
      ctx.stroke();
      ctx.strokeStyle = STEEL;
      ctx.lineWidth = 2;
      ctx.stroke();
      rbox(ctx, 8, -26, 48, 23, 1.6, "#c0302a", QLW);
      rbox(ctx, 6, -30, 52, 7, 1.6, "#d84a3a", QLW);
      [16, 48].forEach((x) => rbox(ctx, x - 2.5, -25, 5, 6, 0.8, STEEL, 1.2));
      line(ctx, [[10, -12], [54, -12]], "rgba(0,0,0,0.3)", 1);
      line(ctx, [[11, -22], [11, -6]], "rgba(255,255,255,0.3)", 1.8);
    },
    radio(ctx) {
      // a boom box: two speakers, a dial, a handle and an antenna
      line(ctx, [[44, -30], [52.5, -44]], INK, 2.6);
      line(ctx, [[44, -30], [52.5, -44]], STEEL, 1.1);
      ctx.beginPath();
      ctx.moveTo(18, -30);
      ctx.lineTo(20, -37);
      ctx.lineTo(44, -37);
      ctx.lineTo(46, -30);
      ink(ctx, 4.4);
      ctx.stroke();
      ctx.strokeStyle = "#2b2d31";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      rbox(ctx, 6, -31, 52, 28, 3, "#2b8a9a", QLW);
      [17, 47].forEach((x) => {
        circle(ctx, x, -15, 8.2, "#2b2d31", 1.4);
        circle(ctx, x, -15, 4.2, "#4a4f57", 1);
        circle(ctx, x, -15, 1.4, "#9aa1a8", 0);
      });
      rbox(ctx, 26, -27, 12, 6, 1, "#f2c12e", 1.1);
      line(ctx, [[30, -26.5], [30, -21.5]], "#d2352b", 0.9);
      [28, 32, 36].forEach((x) => rbox(ctx, x - 1.4, -15, 2.8, 5, 0.6, "#e3e7eb", 0.8));
      line(ctx, [[9, -28], [55, -28]], "rgba(255,255,255,0.3)", 1.2);
    },
    jar(ctx) {
      // a glass jar of beans: a red lid, a paper label
      rbox(ctx, 18, -34, 28, 31, 5, "#e2eff2", QLW);
      ctx.save();
      ctx.beginPath();
      ctx.rect(19, -26, 26, 22);
      ctx.clip();
      ctx.fillStyle = "#5e2c1a";
      ctx.fillRect(19, -26, 26, 22);
      const r = rng(17);
      for (let i = 0; i < 46; i++) oval(ctx, 20 + r() * 24, -5 - r() * 21, 2.4, 1.6, r() * 3, i % 4 ? "#9a4a2a" : "#e8dcc0", 0.6);
      ctx.restore();
      rbox(ctx, 22, -11.5, 20, 6.5, 0.6, "#f3eee0", 1.1);
      line(ctx, [[25, -8.2], [39, -8.2]], "#2f6fb0", 1);
      rbox(ctx, 17, -40, 30, 8, 2, "#d2352b", QLW);
      line(ctx, [[21, -30], [21, -8]], "rgba(255,255,255,0.7)", 1.8);
    },
    letter(ctx) {
      // an envelope lying on the floor: flap lines, a stamp, a red seal
      poly(ctx, [[6, -3], [46, -3], [56, -21], [16, -21]], "#fbf8f0", QLW); // white, as the quest texts say
      line(ctx, [[16, -21], [31, -10], [56, -21]], "rgba(15,16,18,0.55)", 1.1);
      line(ctx, [[6, -3], [26, -12]], "rgba(15,16,18,0.35)", 0.9);
      line(ctx, [[46, -3], [38, -11]], "rgba(15,16,18,0.35)", 0.9);
      poly(ctx, [[42, -17], [49, -17], [50.6, -20], [43.6, -20]], "#2f6fb0", 1);
      circle(ctx, 31, -10, 3.4, "#c0302a", 1.2);
      circle(ctx, 31, -10, 1.6, "#9a2018", 0);
    },
    seeds(ctx) {
      // a paper sack of seeds with a sunflower on it, a few seeds spilled
      poly(ctx, [[15, -3], [49, -3], [46, -31], [18, -31]], "#d9b878", QLW);
      rbox(ctx, 16, -36, 32, 7, 1.6, "#c49c58", QLW);
      line(ctx, [[18, -32.5], [46, -32.5]], "rgba(0,0,0,0.25)", 0.8);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU;
        oval(ctx, 32 + Math.cos(a) * 6.4, -17 + Math.sin(a) * 6.4, 3.4, 1.8, a, "#f2c12e", 0.8);
      }
      circle(ctx, 32, -17, 4.2, "#5b4030", 1.1);
      [[8, -1.6, 0.4], [11, -0.8, -0.3], [54, -1.2, 0.6], [57, -2, 0.1]].forEach(([x, y, a]) => {
        oval(ctx, x, y, 1.6, 0.9, a, "#2b2420", 0.5);
        line(ctx, [[x - 0.6, y], [x + 0.6, y]], "#f3eee0", 0.4);
      });
    },
    blanket(ctx) {
      // a folded plaid blanket
      rbox(ctx, 8, -23, 48, 20, 6, "#b3261e", QLW);
      ctx.save();
      ctx.beginPath();
      ctx.rect(9, -22, 46, 18);
      ctx.clip();
      [16, 26, 36, 46].forEach((x) => {
        ctx.fillStyle = "rgba(243,238,224,0.45)";
        ctx.fillRect(x, -24, 3, 22);
      });
      [-17, -10].forEach((y) => {
        ctx.fillStyle = "rgba(20,20,30,0.3)";
        ctx.fillRect(8, y, 48, 2.6);
      });
      ctx.restore();
      line(ctx, [[10, -14], [54, -14]], INK, 1.2);
      rbox(ctx, 8, -23, 48, 20, 6, null, QLW);
    },
    tape(ctx) {
      // a fat roll of blue tape on its side, its end curling loose
      oval(ctx, 30, -6, 19, 6, 0, "#1f5fa8", QLW);
      ctx.fillStyle = "#1f5fa8";
      ctx.fillRect(11, -14, 38, 8);
      line(ctx, [[11, -14], [11, -6]], INK, QLW);
      line(ctx, [[49, -14], [49, -6]], INK, QLW);
      oval(ctx, 30, -14, 19, 6, 0, "#3f87d8", QLW);
      oval(ctx, 30, -14, 9, 2.8, 0, "#d9b878", 1.3);
      oval(ctx, 30, -14, 6, 1.8, 0, "#6b5a42", 0);
      poly(ctx, [[47, -9], [56, -6], [57, -2], [48, -4]], "#3f87d8", 1.3);
      line(ctx, [[14, -12], [20, -16]], "rgba(255,255,255,0.4)", 1.4);
    },
    badge(ctx) {
      // a gold shield badge with a star, on a black leather fold
      poly(ctx, [[8, -3], [44, -3], [54, -15], [18, -15]], "#2b2622", QLW);
      ctx.beginPath();
      ctx.moveTo(31, -38);
      ctx.quadraticCurveTo(38, -33, 44, -35);
      ctx.quadraticCurveTo(45, -18, 31, -8);
      ctx.quadraticCurveTo(17, -18, 18, -35);
      ctx.quadraticCurveTo(24, -33, 31, -38);
      ctx.closePath();
      paint(ctx, "#e8b923", QLW);
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i / 10) * TAU;
        const r = i % 2 ? 2.8 : 6.4;
        ctx.lineTo(31 + Math.cos(a) * r, -23 + Math.sin(a) * r);
      }
      ctx.closePath();
      paint(ctx, "#fff1b0", 1);
      line(ctx, [[21, -33], [23, -24]], "rgba(255,255,255,0.6)", 1.4);
    },
    wrench(ctx) {
      // a socket wrench: steel ratchet head, red rubber grip
      rbox(ctx, 8, -13, 38, 6, 3, STEEL, QLW);
      rbox(ctx, 6, -13.6, 22, 7.2, 3.4, "#d2352b", QLW);
      [12, 17, 22].forEach((x) => line(ctx, [[x, -12.6], [x, -7.4]], "rgba(0,0,0,0.3)", 0.8));
      circle(ctx, 50, -10, 8, STEEL, QLW);
      circle(ctx, 50, -10, 4.4, "#8f969c", 1.3);
      circle(ctx, 50, -10, 1.6, "#2b2d31", 0);
      line(ctx, [[30, -11.6], [44, -11.6]], "rgba(255,255,255,0.7)", 1);
    },
  };
  const KINDS = Object.keys(Q);
  /** The glint that says "pick me up": a small yellow four-point star. */
  function glint(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * TAU;
      const rr = i % 2 ? r * 0.32 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    paint(ctx, "#ffe45c", 1);
  }
  D.registerSprite("qObj", 128, 96, (ctx, w, h, o) => {
    LWK = 1;
    ctx.save();
    ctx.translate(0, h);
    ctx.scale(2, 2);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(32, -2.4, 27, 3.2, 0, 0, TAU);
    ctx.fill();
    (Q[o.kind] || Q.box)(ctx);
    glint(ctx, 58, -40, 4.6);
    ctx.restore();
  });

  /* ---------- What the game draws: every opts set (tests/validate-art.js draws them all) ---------- */
  const crewSets = [];
  WHO.forEach((who) => POSES.forEach((pose) => FRAMES.forEach((f) => crewSets.push({ who, pose, f }))));
  const dogSets = [];
  DOG_POSES.forEach((pose) => FRAMES.forEach((f) => dogSets.push({ pose, f })));
  DOG_POSES.forEach((pose) => FRAMES.forEach((f) => dogSets.push({ pose, f, left: true })));
  ZSR.CREW_ART = {
    sprites: {
      crew: crewSets,
      crewDog: dogSets,
      crewFace: WHO.map((who) => ({ who })),
      qObj: KINDS.map((kind) => ({ kind })),
    },
    who: WHO.slice(),
    poses: POSES.slice(),
    frames: FRAMES.length,
    dogPoses: DOG_POSES.slice(),
    kinds: KINDS.slice(),
    // canvas sizes, and the prop scale (tiles tall) each is drawn at, lift 0 and wide unset (the
    // image's own aspect): crew is a grown-up's prop scale, to multiply by CREW[id].scale, since every
    // crew member's standing head reaches PERSON_TOP in the canvas (June at 0.9 stands 0.9 of a grown-up,
    // about 0.81 tiles, and stays under the cabin's 0.98 ceiling cap; the walkers' sizes are their own,
    // js/walker3d-looks.js);
    // the dog's back comes to a grown-up's knee at 0.36; a quest object lies on the floor at 0.3
    size: { crew: [192, 256], crewDog: [160, 128], crewFace: [256, 256], qObj: [128, 96] },
    scale: { crew: 0.95, crewDog: 0.36, qObj: 0.3 },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
