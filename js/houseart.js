/* Art for the walk-in house at the home base (the Hollis family's "cabin"), drawn in the comic style
   (flat fills, thick ink, halftone) and registered with ZSR.Draw3 (sprites3d.js) by name:
   - wall faces (64 x 64, opaque): siding outside ("hSiding", "hPlaque"), windows and doors from both
     sides by Walls level and damage ("hWinOut", "hWinIn", "hDoorOut", "hDoorIn"), papered walls
     ("hPaper") and walls with something readable on them ("hNote"), and the shingle roof ("hRoof");
   - low faces (64 x 64, may be transparent): the side of knee-high furniture (counters, beds, tables ...);
   - floors and the ceiling ("hWood", "hTile", carpets, "hPorch", "hCeiling"), fixed colors;
   - sprites for the furniture and things that stand in the house and on the porch.
   ZSR.HOUSE_ART lists every name with the opts the game uses (tests/validate-art.js draws them all). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const D = ZSR.Draw3;
  if (!D) return;
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const { shade, mix, rng, halftone } = D;
  const FONT = "Oswald, Impact, sans-serif";
  const HAND = "\"Comic Sans MS\", \"Chalkboard SE\", \"Marker Felt\", Oswald, sans-serif";

  /* ---------- The house's colors ---------- */
  const SIDING = "#ece2c4"; // cream lap siding
  const TRIM = "#f7f4ec"; // white trim
  const SAGE = "#7d9a7a"; // shutters
  const RED = "#a8322a"; // the front door
  const BACKDOOR = "#ece7dc";
  const BRASS = "#d9a21b";
  const STEEL = "#8f969c";
  const BASEBOARD = "#4a3322";
  const GLASS_OUT = "#8fb6c9";
  const SKY = "#a9d6ee";
  const HOLE = "#141518";
  const WOOD = "#8a5f38";
  const WALL0 = "#e3d6b8";
  /** A "#rrggbb" color from opts, or the default (shade and mix need six hex digits). */
  const hex = (c, d) => (typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c) ? c : d);

  /* ---------- Small drawing helpers (the same conventions as yardart.js) ---------- */
  function ink(ctx, lw) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw || 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
  }
  function fillInk(ctx, fill, lw) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (lw !== 0) {
      ink(ctx, lw);
      ctx.stroke();
    }
  }
  function box(ctx, x, y, w, h, fill, lw) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    fillInk(ctx, fill, lw);
  }
  /** A box with rounded corners. */
  function rbox(ctx, x, y, w, h, r, fill, lw) {
    const k = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + k, y);
    ctx.arcTo(x + w, y, x + w, y + h, k);
    ctx.arcTo(x + w, y + h, x, y + h, k);
    ctx.arcTo(x, y + h, x, y, k);
    ctx.arcTo(x, y, x + w, y, k);
    ctx.closePath();
    fillInk(ctx, fill, lw);
  }
  function poly(ctx, pts, fill, lw) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    fillInk(ctx, fill, lw);
  }
  function circle(ctx, x, y, r, fill, lw) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, r), 0, TAU);
    fillInk(ctx, fill, lw);
  }
  function oval(ctx, x, y, rx, ry, fill, lw, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot || 0, 0, TAU);
    fillInk(ctx, fill, lw);
  }
  function line(ctx, pts, color, lw) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = color || INK;
    ctx.lineWidth = lw || 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  /** A line drawn twice: ink underneath, color on top (a rope, a pole, a wire with an outline). */
  function rod(ctx, pts, color, lw) {
    line(ctx, pts, INK, lw + 3);
    line(ctx, pts, color, lw);
  }
  /** A soft shadow on the ground under a sprite. */
  function shadow(ctx, cx, y, rx) {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, Math.max(2, rx * 0.14), 0, 0, TAU);
    ctx.fill();
  }
  /** Text as big as fits in maxW x maxH, centered on (cx, cy). */
  function fitText(ctx, text, cx, cy, maxW, maxH, color, outline, font) {
    const face = font || FONT;
    let size = Math.max(4, Math.floor(maxH));
    ctx.font = "700 " + size + "px " + face;
    const w = ctx.measureText(text).width || text.length * size * 0.5;
    if (w > maxW) size = Math.max(4, Math.floor((size * maxW) / w));
    ctx.font = "700 " + size + "px " + face;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (outline) {
      ctx.lineWidth = outline;
      ctx.strokeStyle = INK;
      ctx.strokeText(text, cx, cy + 1);
    }
    ctx.fillStyle = color || INK;
    ctx.fillText(text, cx, cy + 1);
    return size;
  }
  function rivets(ctx, pts, c, r) {
    pts.forEach(([x, y]) => {
      ctx.fillStyle = c || "#2f3136";
      ctx.beginPath();
      ctx.arc(x, y, r || 1.6, 0, TAU);
      ctx.fill();
    });
  }
  /** Vertical boards (paneling, doors, the post). */
  function boards(ctx, x0, y0, w, h, c, step, seed) {
    const r = rng(seed || 7);
    for (let x = x0; x < x0 + w; x += step) {
      ctx.fillStyle = shade(c, Math.round(r() * 22 - 11));
      ctx.fillRect(x, y0, Math.min(step, x0 + w - x), h);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(x, y0, 1.5, h);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(x + step * 0.45, y0 + r() * h * 0.6, 1, h * 0.3);
    }
  }
  /** Corrugated sheet: vertical ribs, light and dark. */
  function ribs(ctx, x0, y0, w, h, c, step) {
    const s = step || 8;
    for (let x = x0; x < x0 + w; x += s) {
      ctx.fillStyle = shade(c, 24);
      ctx.fillRect(x, y0, Math.min(s / 2, x0 + w - x), h);
      if (x + s / 2 < x0 + w) {
        ctx.fillStyle = shade(c, -20);
        ctx.fillRect(x + s / 2, y0, Math.min(s / 2, x0 + w - x - s / 2), h);
      }
    }
  }
  function star(ctx, x, y, r, fill, lw) {
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      const rr = k % 2 ? r * 0.45 : r;
      ctx[k ? "lineTo" : "moveTo"](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    fillInk(ctx, fill, lw);
  }
  function heartPath(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.7, y - s * 1.2, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.7, y - s * 1.2, x + s * 1.5, y - s * 0.1, x, y + s * 0.9);
    ctx.closePath();
  }
  /** A strip of tape, turned by `ang`. */
  function tape(ctx, x, y, w, h, ang) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang || 0);
    ctx.fillStyle = "rgba(236,228,190,0.85)";
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = "rgba(15,16,18,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
  function pin(ctx, x, y, c) {
    circle(ctx, x, y, 2.2, c || "#c0302a", 1.2);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(x - 1, y - 1.2, 1, 1);
  }
  /** Scribbled lines of handwriting from x0 to about x1, `n` rows from y, `gap` apart. */
  function scribble(ctx, x0, x1, y, n, gap, color, seed, lw) {
    const r = rng(seed || 3);
    for (let i = 0; i < n; i++) {
      const end = x0 + (x1 - x0) * (0.55 + r() * 0.45);
      const pts = [];
      for (let x = x0; x <= end; x += 2.5) pts.push([x, y + i * gap + (Math.floor(x) % 5 < 2 ? -0.8 : 0.8) * (0.6 + r() * 0.5)]);
      if (pts.length > 1) line(ctx, pts, color || "#3a4a8a", lw || 1);
    }
  }
  /** A board nailed on at an angle (Walls 1). */
  function plank(ctx, x, y, len, ang, c, th) {
    const t = th || 8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    box(ctx, -len / 2, -t / 2, len, t, c || "#9a7650", 2);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(-len / 2 + 6, -1, len * 0.4, 1);
    ctx.fillRect(-len / 2 + len * 0.55, 1.5, len * 0.3, 1);
    rivets(ctx, [[-len / 2 + 4, 0], [len / 2 - 4, 0]], "#2f3136");
    ctx.restore();
  }
  /** A plank snapped short: the board from (x, y) along `ang` for `len`, ending in splinters. */
  function stub(ctx, x, y, len, ang, c, th) {
    const t = th || 8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    poly(ctx, [[0, -t / 2], [len, -t / 2], [len - 3, -t / 4], [len + 2, 0], [len - 4, t / 4], [len - 1, t / 2], [0, t / 2]], c || "#9a7650", 2);
    line(ctx, [[len - 6, -t / 4], [len - 1, -t / 2 + 1]], "#e8c9a0", 1.2);
    rivets(ctx, [[4, 0]], "#2f3136");
    ctx.restore();
  }
  /** Steel plate with bolts at the corners (Walls 3). */
  function plate(ctx, x, y, w, h, c) {
    box(ctx, x, y, w, h, c || STEEL, 2.5);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(x + 3, y + 3, w - 6, 3);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(x + w * 0.6, y + 6, w * 0.12, h - 10);
    rivets(ctx, [[x + 4, y + 4], [x + w - 4, y + 4], [x + 4, y + h - 4], [x + w - 4, y + h - 4], [x + w / 2, y + 4], [x + w / 2, y + h - 4]]);
  }
  /** A corrugated metal shutter in a frame (Walls 2). */
  function shutterMetal(ctx, x, y, w, h, c) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ribs(ctx, x, y, w, h, c || "#7d8790", 6);
    ctx.fillStyle = "rgba(150,72,30,0.3)";
    ctx.fillRect(x + w * 0.7, y + h * 0.5, 4, h * 0.5);
    ctx.restore();
    ink(ctx, 2.5);
    ctx.strokeRect(x, y, w, h);
    box(ctx, x, y, w, 4, "#5a6168", 2);
    box(ctx, x, y + h - 4, w, 4, "#5a6168", 2);
    rivets(ctx, [[x + 3, y + 2], [x + w - 3, y + 2], [x + 3, y + h - 2], [x + w - 3, y + h - 2]], "#c9cdd0", 1.2);
  }
  /** Cracks spreading from (cx, cy) out to about r, inside the clip box: white in glass, ink on wood. */
  function cracks(ctx, cx, cy, r, seed, clip, glass) {
    const g = rng(seed);
    ctx.save();
    if (clip) {
      ctx.beginPath();
      ctx.rect(clip[0], clip[1], clip[2], clip[3]);
      ctx.clip();
    }
    const runs = [];
    for (let i = 0; i < 7; i++) {
      let a = (i / 7) * TAU + g() * 0.5;
      let x = cx;
      let y = cy;
      const pts = [[x, y]];
      for (let k = 0; k < 3; k++) {
        const len = r * (0.25 + g() * 0.3);
        a += (g() - 0.5) * 0.9;
        x += Math.cos(a) * len;
        y += Math.sin(a) * len;
        pts.push([x, y]);
      }
      runs.push(pts);
    }
    if (glass) runs.forEach((pts) => line(ctx, pts, "rgba(255,255,255,0.9)", 2.2));
    runs.forEach((pts) => line(ctx, pts, INK, glass ? 1 : 1.6));
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.2, 0, TAU);
    ctx.strokeStyle = glass ? "rgba(255,255,255,0.9)" : INK;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }
  /** A dent in metal: a dark hollow, lit on its upper left. */
  function dent(ctx, x, y, r) {
    oval(ctx, x, y, r, r * 0.8, "rgba(0,0,0,0.28)", 0);
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI * 0.95, Math.PI * 1.6);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI * -0.05, Math.PI * 0.6);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  function scratches(ctx, seed, x, y, w, h) {
    const g = rng(seed);
    for (let i = 0; i < 5; i++) {
      const sx = x + g() * w;
      const sy = y + g() * h;
      line(ctx, [[sx, sy], [sx + 6 + g() * 8, sy + 2 + g() * 5]], "rgba(235,238,240,0.7)", 1);
    }
  }
  /** A dark jagged hole (broken through: walkers climb in here); returns its outline points. */
  function hole(ctx, cx, cy, rx, ry, seed) {
    const g = rng(seed);
    const pts = [];
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + (g() - 0.5) * 0.25;
      const k = i % 2 ? 0.5 + g() * 0.2 : 0.88 + g() * 0.2;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    poly(ctx, pts, HOLE, 3);
    // a hint of depth: the far side of the hole lit a little
    ctx.fillStyle = "rgba(90,100,120,0.25)";
    ctx.beginPath();
    ctx.ellipse(cx + rx * 0.15, cy + ry * 0.2, rx * 0.35, ry * 0.3, 0, 0, TAU);
    ctx.fill();
    return pts;
  }
  /** Metal torn and bent back round a hole: tongues of lighter metal at the hole's points. */
  function petals(ctx, pts, cx, cy, c) {
    pts.forEach((p, i) => {
      if (i % 2) return;
      const a = pts[(i + pts.length - 1) % pts.length];
      const b = pts[(i + 1) % pts.length];
      const tip = [cx + (p[0] - cx) * 1.35, cy + (p[1] - cy) * 1.35];
      // the tongue bent back toward you: bright where it catches the light, a dark crease at its root
      poly(ctx, [a, tip, b], i % 4 ? shade(c, 60) : shade(c, 38), 2);
      line(ctx, [a, b], "rgba(0,0,0,0.45)", 1.5);
    });
  }
  /** Glass shards still in the frame round a hole. */
  function shards(ctx, pts) {
    pts.forEach((p, i) => {
      if (i % 2) return;
      line(ctx, [[p[0], p[1]], [p[0] + (i % 3) - 1, p[1] + 2]], "rgba(255,255,255,0.85)", 1.2);
    });
  }

  /* ---------- Outside: lap siding over a stone foundation ---------- */
  function siding(ctx, w, h) {
    ctx.fillStyle = SIDING;
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < 56; y += 7) {
      ctx.fillStyle = shade(SIDING, (y / 7) % 2 ? -4 : 4);
      ctx.fillRect(0, y, w, 7);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(0, y, w, 1.5);
      ctx.fillStyle = "rgba(70,52,28,0.35)";
      ctx.fillRect(0, y + 5, w, 2);
    }
    // the shadow under the eave
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, w, 4);
    halftone(ctx, w, 56, 0.05);
    // fieldstone foundation
    ctx.fillStyle = "#5e5a53";
    ctx.fillRect(0, 56, w, 8);
    const r = rng(41);
    let x = -4;
    while (x < w) {
      const sw = 7 + Math.floor(r() * 7);
      ctx.fillStyle = shade("#9a958a", Math.round(r() * 26 - 13));
      ctx.fillRect(x + 1, 57.5, sw - 1.5, 5.5);
      x += sw;
    }
    ctx.fillStyle = INK;
    ctx.fillRect(0, 55, w, 2);
    ctx.fillRect(0, 0, w, 1.5);
  }

  /* ---------- Windows (Walls level 0 glass, 1 planks, 2 corrugated shutter, 3 steel plate; dmg 0, 1 cracked, 2 broken through) ---------- */
  function glassOut(ctx, x, y, w, h) {
    box(ctx, x, y, w, h, GLASS_OUT, 0);
    ctx.fillStyle = "#5f8396";
    ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    poly(ctx, [[x + 2, y + h * 0.55], [x + w * 0.5, y], [x + w * 0.7, y], [x + 2, y + h * 0.8]], "rgba(255,255,255,0.4)", 0);
    poly(ctx, [[x + w * 0.55, y + h], [x + w, y + h * 0.4], [x + w, y + h * 0.5], [x + w * 0.65, y + h]], "rgba(255,255,255,0.25)", 0);
    ctx.restore();
  }
  /** The view out through the glass from indoors: sky, the yard's trees, grass. */
  function glassIn(ctx, x, y, w, h) {
    box(ctx, x, y, w, h, SKY, 0);
    ctx.fillStyle = "#cde8f5";
    ctx.fillRect(x, y, w, h * 0.25);
    ctx.fillStyle = "#5f8a5a";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(x + (i + 0.3) * (w / 4), y + h * 0.7, w * 0.13, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#7fa86a";
    ctx.fillRect(x, y + h * 0.74, w, h * 0.26);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(x + 2, y + 2, w * 0.25, 2);
  }
  /** Muntins of a double-hung window: a meeting rail across the middle, a bar down each sash. */
  function muntins(ctx, x, y, w, h, c) {
    box(ctx, x, y + h / 2 - 2, w, 4, c, 1.5);
    box(ctx, x + w / 2 - 1.2, y, 2.4, h, c, 1);
    ink(ctx, 2.5);
    ctx.strokeRect(x, y, w, h);
  }
  /** Board-ups seen as they are (lvl 1): three planks across x0..x1. */
  function planksOver(ctx, cy, wide) {
    plank(ctx, 32, cy - 9, wide, -0.14, "#9a7650");
    plank(ctx, 32, cy + 1, wide + 2, 0.08, "#8a6a46");
    plank(ctx, 32, cy + 10, wide, -0.05, "#a07a4a");
  }
  function planksSplit(ctx, cy) {
    // split along the grain, a nail pulled
    line(ctx, [[14, cy - 7], [26, cy - 9], [34, cy - 10]], INK, 1.6);
    line(ctx, [[30, cy + 2], [44, cy + 3], [50, cy + 1]], INK, 1.6);
    poly(ctx, [[40, cy + 7], [52, cy + 9], [44, cy + 13]], "#e8c9a0", 1.5);
    line(ctx, [[22, cy + 9], [28, cy + 14]], INK, 1.4);
  }
  function planksTorn(ctx, cy, seed) {
    const pts = hole(ctx, 32, cy, 14, 13, seed);
    shards(ctx, pts);
    stub(ctx, 11, cy - 7, 14, -0.14, "#9a7650");
    stub(ctx, 53, cy - 12, 12, Math.PI - 0.14, "#9a7650");
    stub(ctx, 11, cy + 10, 10, 0.2, "#a07a4a");
    // one board hanging from its last nail
    plank(ctx, 47, cy + 6, 26, 1.1, "#8a6a46");
  }
  function metalTorn(ctx, cy, seed, c) {
    const pts = hole(ctx, 32, cy, 15, 16, seed);
    petals(ctx, pts, 32, cy, c);
    // the hole's dark middle over the petals' roots
    oval(ctx, 32, cy, 8, 9, HOLE, 0);
  }
  function shutters(ctx) {
    [[3, 8], [51, 8]].forEach(([x, y]) => {
      box(ctx, x, y, 10, 38, SAGE, 2.5);
      for (let k = y + 5; k < y + 35; k += 4) line(ctx, [[x + 2, k], [x + 8, k + 1.5]], shade(SAGE, -40), 1.2);
      box(ctx, x + 2, y + 18, 6, 2, shade(SAGE, -30), 0);
    });
  }
  D.registerTexture("hWinOut", (ctx, w, h, p, o) => {
    const lvl = Math.max(0, Math.min(3, o.lvl | 0));
    const dmg = Math.max(0, Math.min(2, o.dmg | 0));
    siding(ctx, w, h);
    if (lvl < 2) shutters(ctx);
    box(ctx, 14, 6, 36, 40, TRIM, 3);
    const X = 18;
    const Y = 10;
    const W = 28;
    const H = 32;
    const clip = [X, Y, W, H];
    if (lvl === 0) {
      if (dmg === 2) {
        glassOut(ctx, X, Y, W, H);
        muntins(ctx, X, Y, W, H, TRIM);
        const pts = hole(ctx, 32, 27, 13, 15, 7);
        shards(ctx, pts);
      } else {
        glassOut(ctx, X, Y, W, H);
        if (dmg === 1) cracks(ctx, 27, 21, 22, 5, clip, true);
        muntins(ctx, X, Y, W, H, TRIM);
      }
    } else {
      box(ctx, X, Y, W, H, "#2b3540", 2.5);
      if (lvl === 1) {
        if (dmg === 2) planksTorn(ctx, 26, 9);
        else {
          planksOver(ctx, 26, 44);
          if (dmg === 1) planksSplit(ctx, 26);
        }
      } else if (lvl === 2) {
        shutterMetal(ctx, 10, 4, 44, 44);
        if (dmg === 1) {
          dent(ctx, 24, 20, 5);
          dent(ctx, 38, 32, 4);
          scratches(ctx, 3, 14, 10, 34, 30);
        } else if (dmg === 2) metalTorn(ctx, 26, 11, "#7d8790");
      } else {
        plate(ctx, 8, 3, 48, 47);
        line(ctx, [[8, 27], [56, 27]], "rgba(0,0,0,0.3)", 1.5);
        if (dmg === 2) metalTorn(ctx, 28, 13, STEEL);
        else {
          box(ctx, 18, 18, 28, 6, HOLE, 2); // the firing slot
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.fillRect(19, 19, 26, 1.5);
          if (dmg === 1) {
            dent(ctx, 20, 36, 5);
            dent(ctx, 44, 12, 4);
            dent(ctx, 40, 40, 3.5);
            ctx.fillStyle = "rgba(20,20,20,0.25)";
            ctx.beginPath();
            ctx.arc(30, 40, 7, 0, TAU);
            ctx.fill();
          }
        }
      }
    }
    // sill and flower box
    box(ctx, 11, 44, 42, 5, TRIM, 2.5);
    box(ctx, 16, 49, 32, 6, "#8a5a3a", 2.5);
    if (lvl < 2) {
      [[20, "#c0302a"], [26, "#f2c12e"], [32, "#f3eee0"], [38, "#c0302a"], [44, "#f2c12e"]].forEach(([x, c], i) => {
        oval(ctx, x - 2, 49, 2.5, 1.5, "#4f7a32", 0);
        circle(ctx, x, 48 - (i % 2), 2.2, c, 1.2);
      });
    } else {
      // dead stalks
      line(ctx, [[22, 49], [21, 45]], "#6b5a3a", 1.5);
      line(ctx, [[34, 49], [36, 46]], "#6b5a3a", 1.5);
    }
  });

  D.registerTexture("hWinIn", (ctx, w, h, p, o) => {
    const c = hex(o.c, WALL0);
    const lvl = Math.max(0, Math.min(3, o.lvl | 0));
    const dmg = Math.max(0, Math.min(2, o.dmg | 0));
    paper(ctx, w, h, c, "plain");
    box(ctx, 13, 8, 38, 40, TRIM, 3);
    const X = 18;
    const Y = 12;
    const W = 28;
    const H = 31;
    const clip = [X, Y, W, H];
    glassIn(ctx, X, Y, W, H);
    // what was put up outside, seen through the glass
    if (lvl === 1 && dmg < 2) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(X, Y, W, H);
      ctx.clip();
      planksOver(ctx, 27, 40);
      if (dmg === 1) planksSplit(ctx, 27);
      ctx.restore();
    } else if (lvl === 2 && dmg < 2) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(X, Y, W, H);
      ctx.clip();
      ribs(ctx, X, Y, W, H, "#5f666e", 6);
      if (dmg === 1) {
        dent(ctx, 27, 22, 4);
        dent(ctx, 38, 34, 3.5);
      }
      ctx.restore();
    } else if (lvl === 3 && dmg < 2) {
      box(ctx, X, Y, W, H, "#4b5057", 0);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(X, Y, W, 3);
      box(ctx, 22, 24, 20, 5, SKY, 1.5); // daylight through the firing slot
      rivets(ctx, [[X + 3, Y + 3], [X + W - 3, Y + 3], [X + 3, Y + H - 3], [X + W - 3, Y + H - 3]], "#c9cdd0", 1.3);
      if (dmg === 1) {
        dent(ctx, 26, 36, 4);
        dent(ctx, 38, 16, 3);
      }
    }
    if (lvl > 0 && dmg < 2) {
      ctx.fillStyle = "rgba(170,214,238,0.18)"; // the glass in front of it
      ctx.fillRect(X, Y, W, H);
    }
    if (dmg === 2) {
      muntins(ctx, X, Y, W, H, TRIM);
      if (lvl === 0) shards(ctx, hole(ctx, 32, 27, 13, 14, 17));
      else if (lvl === 1) planksTorn(ctx, 27, 19);
      else metalTorn(ctx, 27, 21, lvl === 2 ? "#6f7880" : STEEL);
    } else {
      if (dmg === 1) cracks(ctx, 37, 22, 22, 23, clip, true);
      muntins(ctx, X, Y, W, H, TRIM);
    }
    // sill, rod, curtains with tie-backs
    box(ctx, 10, 46, 44, 4, TRIM, 2.5);
    const cur = mix(c, "#f3eee0", 0.5);
    const curD = shade(mix(c, "#a8322a", 0.25), -10);
    line(ctx, [[4, 6], [60, 6]], INK, 3.5);
    line(ctx, [[4, 6], [60, 6]], "#b8902e", 1.8);
    circle(ctx, 4, 6, 2.5, "#b8902e", 1.5);
    circle(ctx, 60, 6, 2.5, "#b8902e", 1.5);
    poly(ctx, [[4, 7], [17, 7], [15, 22], [12, 30], [16, 50], [3, 50]], curD, 2.5);
    poly(ctx, [[60, 7], [47, 7], [49, 22], [52, 30], [48, 50], [61, 50]], curD, 2.5);
    line(ctx, [[8, 9], [8, 48]], "rgba(0,0,0,0.25)", 1.5);
    line(ctx, [[56, 9], [56, 48]], "rgba(0,0,0,0.25)", 1.5);
    line(ctx, [[12, 9], [10, 28]], "rgba(255,255,255,0.3)", 1.5);
    line(ctx, [[52, 9], [54, 28]], "rgba(255,255,255,0.3)", 1.5);
    box(ctx, 5, 29, 10, 3, cur, 1.5);
    box(ctx, 49, 29, 10, 3, cur, 1.5);
  });

  /* ---------- Doors (Walls level 0 the door, 1 a bar in brackets, 2 steel sheets bolted on, 3 a steel security door; dmg 1 damaged) ---------- */
  /** The door itself in its opening x 15..49, y 7..60; `glass` is what its window shows. */
  function doorFace(ctx, back, glass, inside) {
    if (!back) {
      box(ctx, 15, 7, 34, 53, RED, 3);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(17, 9, 3, 49);
      box(ctx, 21, 12, 22, 13, glass, 2.5);
      line(ctx, [[32, 12], [32, 25]], TRIM, 2);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(23, 14, 6, 2);
      box(ctx, 19, 30, 11, 25, shade(RED, -16), 2);
      box(ctx, 33, 30, 10, 25, shade(RED, -16), 2);
      line(ctx, [[20, 31], [29, 31]], "rgba(255,255,255,0.25)", 1.2);
      line(ctx, [[34, 31], [42, 31]], "rgba(255,255,255,0.25)", 1.2);
      if (!inside) box(ctx, 17, 55, 30, 4, BRASS, 1.5); // kick plate
    } else {
      box(ctx, 15, 7, 34, 53, BACKDOOR, 3);
      box(ctx, 20, 11, 24, 20, glass, 2.5);
      box(ctx, 20, 20, 24, 2, BACKDOOR, 1);
      box(ctx, 31, 11, 2, 20, BACKDOOR, 1);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(22, 13, 4, 2);
      box(ctx, 19, 35, 11, 21, shade(BACKDOOR, -14), 2);
      box(ctx, 33, 35, 11, 21, shade(BACKDOOR, -14), 2);
    }
    circle(ctx, 45.5, 41, 2.7, BRASS, 1.5);
    circle(ctx, 45.5, 34, 1.9, inside ? "#c9cdd0" : BRASS, 1.2);
    if (inside) {
      // the chain lock
      box(ctx, 39, 23, 7, 2.5, "#c9cdd0", 1);
      line(ctx, [[39, 24], [35, 27], [33, 24]], "#9ea3aa", 1.2);
    }
  }
  function splinters(ctx) {
    // split along the grain by the lock, pale slivers standing out of the crack
    line(ctx, [[42, 8], [40, 20], [42, 30], [39, 40], [41, 50], [39, 59]], INK, 2);
    [[40, 22, -1], [41, 33, 1], [40, 44, -1]].forEach(([x, y, sx]) => poly(ctx, [[x, y], [x + 1.5, y + 8], [x - 5 * sx, y + 3]], "#e8c9a0", 1.3));
    line(ctx, [[39, 36], [30, 34]], INK, 1.3);
    // a boot print low on the door
    oval(ctx, 25, 50, 4, 6, "rgba(40,30,20,0.35)", 0);
  }
  function doorBar(ctx, dmg) {
    box(ctx, 9, 33, 9, 13, "#3a3d42", 2);
    box(ctx, 46, 33, 9, 13, "#3a3d42", 2);
    box(ctx, 5, 36, 54, 8, "#8a5f38", 2.5);
    line(ctx, [[8, 39], [30, 39]], "rgba(0,0,0,0.25)", 1);
    line(ctx, [[34, 41], [56, 41]], "rgba(0,0,0,0.25)", 1);
    box(ctx, 11, 35, 5, 10, "#5a6168", 1.5);
    box(ctx, 48, 35, 5, 10, "#5a6168", 1.5);
    rivets(ctx, [[13.5, 37.5], [13.5, 42.5], [50.5, 37.5], [50.5, 42.5]], "#c9cdd0", 1);
    if (dmg) {
      line(ctx, [[20, 37], [26, 41], [31, 38], [38, 42], [44, 39]], INK, 1.8);
      poly(ctx, [[29, 44], [33, 44], [31, 48]], "#e8c9a0", 1.2);
      splinters(ctx);
    }
  }
  function doorSheets(ctx, dmg) {
    box(ctx, 12, 5, 40, 28, STEEL, 2.5);
    box(ctx, 12, 32, 40, 29, shade(STEEL, -10), 2.5);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(15, 8, 34, 2);
    ctx.fillRect(15, 35, 34, 2);
    ctx.fillStyle = "rgba(150,72,30,0.3)";
    ctx.fillRect(40, 40, 3, 20);
    const bolts = [];
    [8, 29, 36, 57].forEach((y) => [15, 32, 49].forEach((x) => bolts.push([x, y])));
    rivets(ctx, bolts, "#2f3136", 1.8);
    if (dmg) {
      dent(ctx, 24, 20, 5);
      dent(ctx, 40, 46, 5);
      dent(ctx, 22, 52, 3.5);
      scratches(ctx, 7, 14, 10, 30, 44);
    }
  }
  function securityDoor(ctx, dmg, inside) {
    box(ctx, 11, 3, 42, 59, "#2f3136", 3);
    box(ctx, 15, 6, 34, 55, "#5c636a", 2.5);
    [14, 31, 48].forEach((y) => {
      box(ctx, 15, y, 34, 5, "#474d53", 2);
      rivets(ctx, [[18, y + 2.5], [32, y + 2.5], [46, y + 2.5]], "#c9cdd0", 1.1);
    });
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(17, 8, 3, 50);
    circle(ctx, 32, 10, 1.8, inside ? "#c9cdd0" : HOLE, 1);
    circle(ctx, 43, 25, 2.4, "#c9cdd0", 1.3);
    circle(ctx, 43, 42, 2.4, "#c9cdd0", 1.3);
    box(ctx, 37, 34, 10, 3, "#c9cdd0", 1.5);
    circle(ctx, 44, 35.5, 2.8, "#9ea3aa", 1.5);
    if (inside) {
      box(ctx, 41.5, 23, 3, 4, "#9ea3aa", 0.8);
      box(ctx, 41.5, 40, 3, 4, "#9ea3aa", 0.8);
    }
    if (dmg) {
      dent(ctx, 24, 24, 5);
      dent(ctx, 30, 54, 4);
      dent(ctx, 40, 12, 3.5);
      scratches(ctx, 11, 16, 8, 30, 50);
    }
  }
  function doorTrim(ctx) {
    box(ctx, 10, 3, 44, 61, TRIM, 3);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(13, 6, 2, 56);
  }
  D.registerTexture("hDoorOut", (ctx, w, h, p, o) => {
    const lvl = Math.max(0, Math.min(3, o.lvl | 0));
    const dmg = o.dmg ? 1 : 0;
    const back = !!o.back;
    siding(ctx, w, h);
    doorTrim(ctx);
    if (lvl < 3) doorFace(ctx, back, "#3b4a54", false);
    if (lvl === 0 && dmg) splinters(ctx);
    if (lvl === 1) doorBar(ctx, dmg);
    else if (lvl === 2) doorSheets(ctx, dmg);
    else if (lvl === 3) securityDoor(ctx, dmg, false);
    box(ctx, 7, 60, 50, 4, "#a8a296", 2);
  });
  D.registerTexture("hDoorIn", (ctx, w, h, p, o) => {
    const c = hex(o.c, WALL0);
    const lvl = Math.max(0, Math.min(3, o.lvl | 0));
    const dmg = o.dmg ? 1 : 0;
    const back = !!o.back;
    paper(ctx, w, h, c, "plain");
    doorTrim(ctx);
    if (lvl < 3) doorFace(ctx, back, lvl === 2 ? "#6f767c" : SKY, true);
    if (lvl === 0 && dmg) splinters(ctx);
    if (lvl === 1) doorBar(ctx, dmg);
    else if (lvl === 2) {
      // the sheets are outside: their bolts come through with big square washers
      const bolts = [];
      [9, 29, 37, 56].forEach((y) => [18, 32, 46].forEach((x) => bolts.push([x, y])));
      bolts.forEach(([x, y]) => {
        box(ctx, x - 2.5, y - 2.5, 5, 5, "#9ea3aa", 1.2);
        circle(ctx, x, y, 1.2, "#3a3d42", 0);
      });
      if (dmg) {
        line(ctx, [[22, 30], [28, 42], [24, 52]], INK, 1.6);
        poly(ctx, [[26, 40], [31, 42], [27, 46]], "#e8c9a0", 1.2);
      }
    } else if (lvl === 3) securityDoor(ctx, dmg, true);
    box(ctx, 7, 61, 50, 3, "#6b4e34", 1.5);
  });

  /* ---------- Interior walls: wallpaper or paint in color c, a pattern, a dark baseboard ---------- */
  const PATS = ["plain", "stripe", "dots", "panel", "tile", "wood"];
  function paper(ctx, w, h, c, pat) {
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, w, h);
    if (pat === "stripe") {
      for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = shade(c, -16);
        ctx.fillRect(x + 4, 0, 6, h);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(x + 13, 0, 1.5, h);
      }
    } else if (pat === "dots") {
      for (let y = 5, row = 0; y < 58; y += 10, row++) {
        for (let x = row % 2 ? 11 : 3; x < w; x += 16) {
          // a little four-petal sprig
          ctx.fillStyle = shade(c, -28);
          [[0, -2], [2, 0], [0, 2], [-2, 0]].forEach(([dx, dy]) => {
            ctx.beginPath();
            ctx.arc(x + dx, y + dy, 1.4, 0, TAU);
            ctx.fill();
          });
          ctx.fillStyle = "rgba(255,255,255,0.55)";
          ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
        }
      }
    } else if (pat === "panel") {
      const wc = mix(c, "#f6f3ea", 0.7);
      ctx.fillStyle = wc;
      ctx.fillRect(0, 38, w, 20);
      [[3, 29], [35, 26]].forEach(([x, pw]) => {
        ctx.fillStyle = shade(wc, -10);
        ctx.fillRect(x, 43, pw, 11);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(x, 43, pw, 1.2);
        ctx.fillRect(x, 43, 1.2, 11);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillRect(x, 53, pw, 1.2);
        ctx.fillRect(x + pw - 1.2, 43, 1.2, 11);
      });
      ctx.fillStyle = TRIM;
      ctx.fillRect(0, 35, w, 4);
      ctx.fillStyle = INK;
      ctx.fillRect(0, 39, w, 1.2);
      ctx.fillRect(0, 34.5, w, 1);
    } else if (pat === "tile") {
      ctx.fillStyle = "#c9c6bd";
      ctx.fillRect(0, 30, w, 28);
      for (let y = 31, row = 0; y < 58; y += 6, row++) {
        for (let x = row % 2 ? -8 : 0; x < w; x += 16) {
          ctx.fillStyle = row % 2 ? "#f4f2ec" : "#efede6";
          ctx.fillRect(x + 1, y, 14, 5);
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.fillRect(x + 2, y + 0.5, 6, 1);
        }
      }
      ctx.fillStyle = "#7fa0a8"; // a colored cap row
      ctx.fillRect(0, 27, w, 4);
      ctx.fillStyle = INK;
      ctx.fillRect(0, 26.5, w, 1);
      ctx.fillRect(0, 31, w, 1);
    } else if (pat === "wood") {
      boards(ctx, 0, 0, w, h, mix("#a8743f", c, 0.15), 8, 31);
      ctx.fillStyle = "rgba(60,30,10,0.35)";
      [[12, 14], [44, 40], [28, 30]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, 1.6, 2.4, 0, 0, TAU);
        ctx.fill();
      });
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.035)";
      for (let x = 7; x < w; x += 21) ctx.fillRect(x, 0, 6, h);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(31, 0, 1, h); // a seam
    }
    halftone(ctx, w, h, 0.04);
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(0, 0, w, 3);
    ctx.fillStyle = BASEBOARD;
    ctx.fillRect(0, 58, w, 6);
    ctx.fillStyle = shade(BASEBOARD, 30);
    ctx.fillRect(0, 59, w, 1.5);
    ctx.fillStyle = INK;
    ctx.fillRect(0, 57.5, w, 1.2);
  }
  D.registerTexture("hPaper", (ctx, w, h, p, o) => paper(ctx, w, h, hex(o.c, WALL0), PATS.includes(o.pat) ? o.pat : "plain"));

  /* ---------- A wall with something readable on it (hNote kind) ---------- */
  const NOTES = {
    /* Five coat hooks on a rail with name tags, Lucy's lower. */
    hooks(ctx) {
      box(ctx, 3, 9, 43, 14, WOOD, 2.5);
      box(ctx, 47, 25, 14, 14, WOOD, 2.5);
      const at = [[9, 22], [20, 22], [31, 22], [42, 22]];
      at.push([54, 38]);
      ["K", "D", "G", "F", "L"].forEach((t, i) => {
        const [x, y] = at[i];
        box(ctx, x - 4.5, y - 11, 9, 8, "#f6f1e2", 1.4);
        fitText(ctx, t, x, y - 7.3, 8, 7, i === 4 ? "#c0407a" : INK);
        line(ctx, [[x, y - 2], [x, y + 5], [x + 3, y + 7]], INK, 3.5);
        line(ctx, [[x, y - 2], [x, y + 5], [x + 3, y + 7]], BRASS, 1.6);
      });
    },
    /* A county map pinned up, a yellow sticky note on it. */
    map(ctx) {
      box(ctx, 6, 6, 52, 42, "#ece6c8", 2.5);
      ctx.fillStyle = "#cfe0b0";
      ctx.fillRect(8, 8, 20, 14);
      ctx.fillRect(34, 30, 22, 16);
      ctx.fillStyle = "#e3d2a8";
      ctx.fillRect(30, 8, 26, 10);
      line(ctx, [[6, 32], [16, 27], [27, 33], [40, 25], [58, 22]], "#5f9ac0", 3);
      line(ctx, [[12, 6], [17, 20], [30, 26], [34, 48]], "#c0302a", 1.8);
      line(ctx, [[6, 41], [30, 38], [58, 43]], "#8a6a46", 1.5);
      line(ctx, [[44, 6], [42, 18], [30, 26]], "#8a6a46", 1.5);
      ctx.fillStyle = "#4b5057";
      [[28, 24], [31, 23], [29, 27], [32, 26]].forEach(([x, y]) => ctx.fillRect(x, y, 2, 2));
      // where the cabin is, circled
      ctx.beginPath();
      ctx.ellipse(19, 36, 5, 4, 0, 0, TAU);
      ctx.strokeStyle = "#c0302a";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      line(ctx, [[17, 34], [21, 38]], "#c0302a", 1.5);
      line(ctx, [[21, 34], [17, 38]], "#c0302a", 1.5);
      pin(ctx, 9, 9, "#c0302a");
      pin(ctx, 55, 9, "#2f6fb0");
      pin(ctx, 9, 45, "#2f6fb0");
      ctx.save();
      ctx.translate(48, 40);
      ctx.rotate(0.12);
      box(ctx, -8, -8, 16, 16, "#f6dc5a", 1.8);
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(-8, -8, 16, 3);
      scribble(ctx, -6, 6, -2, 3, 3.5, "#3a3a3a", 9, 1);
      ctx.restore();
    },
    /* A chore chart: a grid with a row per kid and gold stars. */
    chart(ctx) {
      box(ctx, 7, 6, 50, 40, "#fbf8ef", 2.5);
      box(ctx, 7, 6, 50, 8, "#7aa0c8", 2);
      ["#3f5a8a", "#4f7a32", "#c0407a", "#a0703c"].forEach((c, i) => box(ctx, 9, 16 + i * 7.5, 8, 5.5, c, 1));
      ctx.fillStyle = "rgba(15,16,18,0.6)";
      for (let x = 19; x < 57; x += 9.5) ctx.fillRect(x, 14, 1, 32);
      for (let y = 14; y < 46; y += 7.5) ctx.fillRect(7, y, 50, 1);
      const r = rng(13);
      for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) if (r() < 0.62) star(ctx, 23.7 + col * 9.5, 18 + row * 7.5, 3.2, "#f2c12e", 1);
      scribble(ctx, 10, 54, 10, 1, 0, "#fbf8ef", 4, 1.5);
      tape(ctx, 10, 6, 10, 4, -0.3);
      tape(ctx, 54, 6, 10, 4, 0.3);
    },
    /* A corkboard; a paper note held by a fish-shaped magnet. */
    cork(ctx) {
      box(ctx, 5, 5, 54, 44, WOOD, 3);
      box(ctx, 9, 9, 46, 36, "#c49a64", 1.5);
      const r = rng(17);
      ctx.fillStyle = "rgba(90,55,25,0.45)";
      for (let i = 0; i < 70; i++) ctx.fillRect(9 + r() * 45, 9 + r() * 35, 1.2, 1.2);
      ctx.save();
      ctx.translate(32, 28);
      ctx.rotate(-0.06);
      box(ctx, -14, -14, 28, 30, "#fbfaf3", 2);
      scribble(ctx, -11, 11, -5, 5, 4, "#2f4f9a", 21, 1.1);
      // the fish magnet
      oval(ctx, -1, -14, 7, 3.6, "#ff8a2a", 1.8);
      poly(ctx, [[5, -14], [10, -18], [10, -10]], "#ff8a2a", 1.8);
      circle(ctx, -5, -14.5, 1, INK, 0);
      ctx.restore();
      // a ticket stub pinned in the corner
      box(ctx, 42, 34, 10, 7, "#e48a8a", 1.2);
      pin(ctx, 47, 35, "#3f5a8a");
    },
    /* Two wall shelves with labels along their edges, nearly empty (one can of beans left). */
    labels(ctx) {
      // the last can, on the top shelf over its label
      box(ctx, 41, 10, 10, 12, "#c0302a", 2);
      box(ctx, 41, 14, 10, 4, "#f3eee0", 0);
      ink(ctx, 2);
      ctx.strokeRect(41, 10, 10, 12);
      [[22, ["RICE", "BEANS"]], [44, ["PEACHES", "FLOUR"]]].forEach(([y, names]) => {
        poly(ctx, [[7, y + 11], [14, y + 11], [7, y + 18]], "#3a3d42", 1.5);
        poly(ctx, [[57, y + 11], [50, y + 11], [57, y + 18]], "#3a3d42", 1.5);
        box(ctx, 3, y, 58, 11, WOOD, 2.5);
        names.forEach((t, i) => {
          const x = i ? 46 : 18;
          box(ctx, x - 12, y + 1.5, 24, 8, "#fbf8ef", 1.5);
          fitText(ctx, t, x, y + 5.3, 21, 7, "#2f3136");
        });
      });
    },
    /* A chalk scoreboard: the last game, FINN 21 DAD 19, and the crew's tally marks under it. */
    score(ctx) {
      box(ctx, 5, 5, 54, 44, "#7a5232", 3);
      box(ctx, 9, 9, 46, 34, "#24382c", 1.5);
      const chalk = "rgba(236,236,226,0.92)";
      fitText(ctx, "FINN", 20.5, 15, 18, 8, chalk);
      fitText(ctx, "DAD", 43.5, 15, 18, 8, chalk);
      line(ctx, [[32, 11], [32, 41]], chalk, 1.2);
      line(ctx, [[11, 21], [53, 21]], chalk, 1.2);
      fitText(ctx, "21", 20.5, 26, 14, 7, chalk);
      fitText(ctx, "19", 43.5, 26, 14, 7, chalk);
      const tally = (x, y, n) => {
        for (let g = 0; g * 5 < n; g++) {
          const m = Math.min(5, n - g * 5);
          const gx = x + (g % 2) * 10;
          const gy = y + Math.floor(g / 2) * 9;
          for (let k = 0; k < Math.min(4, m); k++) line(ctx, [[gx + k * 2, gy], [gx + k * 2, gy + 6]], chalk, 1.2);
          if (m === 5) line(ctx, [[gx - 1, gy + 5], [gx + 7, gy + 1]], chalk, 1.2);
        }
      };
      tally(13, 34, 7);
      tally(36, 34, 9);
      box(ctx, 9, 43, 46, 4, "#6b4423", 1.5);
      box(ctx, 14, 42, 7, 2, "#f3f3ea", 0);
    },
    /* The bathroom mirror; a heart drawn on it. */
    mirror(ctx) {
      rbox(ctx, 10, 4, 44, 42, 4, "#e9e4d8", 3);
      box(ctx, 14, 8, 36, 34, "#b8d0d8", 1.5);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      poly(ctx, [[16, 26], [30, 8], [36, 8], [16, 34]], "rgba(255,255,255,0.4)", 0);
      poly(ctx, [[38, 42], [50, 26], [50, 31], [42, 42]], "rgba(255,255,255,0.3)", 0);
      ctx.fillStyle = "rgba(240,244,246,0.35)"; // steam
      ctx.fillRect(14, 8, 36, 20);
      heartPath(ctx, 32, 23, 8);
      ctx.strokeStyle = "#d0485a";
      ctx.lineWidth = 2.6;
      ctx.stroke();
      box(ctx, 12, 48, 40, 3, "#e9e4d8", 1.5);
      box(ctx, 38, 42, 6, 6, "#7fb0c8", 1.2);
      line(ctx, [[40, 42], [39, 37]], "#e04a4a", 1.5);
      line(ctx, [[42, 42], [43, 37]], "#3f8ad0", 1.5);
    },
    /* A framed wedding photo. */
    photo(ctx) {
      line(ctx, [[22, 8], [32, 3], [42, 8]], INK, 1.2);
      circle(ctx, 32, 3, 1.5, "#4b5057", 0.8);
      box(ctx, 14, 7, 36, 44, "#b8902e", 3);
      box(ctx, 18, 11, 28, 36, "#f3ead5", 1.5);
      box(ctx, 21, 14, 22, 30, "#cdb68e", 1.5);
      ctx.fillStyle = "#b39a70";
      ctx.fillRect(21, 34, 22, 10);
      // him: dark suit; her: white dress and veil
      poly(ctx, [[23, 44], [31, 44], [30.5, 28], [23.5, 28]], "#2f3136", 1.2);
      poly(ctx, [[26, 28], [28, 28], [27, 32]], "#f6f3ea", 0);
      circle(ctx, 27, 24.5, 3.3, "#e8c8a0", 1);
      poly(ctx, [[29.5, 45], [42, 45], [36.5, 28], [34.5, 28]], "#fbfaf5", 1.2);
      poly(ctx, [[33, 22], [40, 22], [41, 36], [32, 30]], "rgba(255,255,255,0.75)", 0);
      circle(ctx, 36, 24.5, 3.3, "#e8c8a0", 1);
      circle(ctx, 34.5, 34, 2.2, "#e48aa8", 1);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(22, 15, 7, 2);
    },
    /* Pencil height marks on a door frame, the kids' initials by them. */
    marks(ctx) {
      box(ctx, 20, 0, 24, 58, "#f3efe6", 2.5);
      box(ctx, 18, 52, 28, 12, "#ece6da", 2.5);
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(38, 2, 4, 50);
      const pencil = "#4a4a52";
      [[8, "G"], [14, "G"], [19, "F"], [27, "F"], [34, "L"], [41, "L"]].forEach(([y, t], i) => {
        line(ctx, [[22, y], [35, y]], pencil, 1.4);
        fitText(ctx, t, 30, y - 2.6, 6, 5, i < 2 ? "#3f5a8a" : i < 4 ? "#4f7a32" : "#c0407a", 0, HAND);
      });
      // and Biscuit's paw, low down
      circle(ctx, 29, 48, 2, pencil, 0);
      [[26.5, 45], [28.5, 44], [30.5, 44], [32, 45.5]].forEach(([x, y]) => circle(ctx, x, y, 0.9, pencil, 0));
    },
    /* A hand-lettered KEEP OUT sign hanging on a nail. */
    keepout(ctx) {
      line(ctx, [[14, 18], [32, 7], [50, 18]], "#5a4a3a", 1.2);
      circle(ctx, 32, 7, 1.6, "#4b5057", 0.8);
      ctx.save();
      ctx.translate(32, 31);
      ctx.rotate(-0.05);
      poly(ctx, [[-21, -14], [21, -15], [22, 14], [-2, 15], [-20, 14]], "#d9b77e", 2.5);
      fitText(ctx, "KEEP", 0, -6.5, 34, 12, "#c0302a", 0, HAND);
      fitText(ctx, "OUT!", 0, 6.5, 34, 13, "#c0302a", 0, HAND);
      line(ctx, [[-14, 13], [14, 12]], "#c0302a", 1.4);
      ctx.restore();
    },
    /* A blueprint of a treehouse. */
    plan(ctx) {
      box(ctx, 5, 6, 54, 42, "#2a5a9a", 2.5);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      for (let x = 11; x < 58; x += 6) ctx.fillRect(x, 7, 1, 40);
      for (let y = 12; y < 48; y += 6) ctx.fillRect(6, y, 52, 1);
      const wl = "rgba(240,248,255,0.95)";
      line(ctx, [[27, 46], [28, 28]], wl, 1.5);
      line(ctx, [[34, 46], [33, 28]], wl, 1.5);
      line(ctx, [[28, 34], [20, 28]], wl, 1.2);
      line(ctx, [[33, 33], [42, 27]], wl, 1.2);
      line(ctx, [[14, 28], [48, 28]], wl, 2);
      ctx.strokeStyle = wl;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(19, 17, 24, 11);
      ctx.strokeRect(27, 20, 6, 8);
      line(ctx, [[17, 17], [31, 9], [45, 17]], wl, 1.5);
      // the ladder and a dimension line
      line(ctx, [[46, 28], [49, 46]], wl, 1);
      line(ctx, [[50, 28], [53, 46]], wl, 1);
      for (let y = 32; y < 46; y += 4) line(ctx, [[46.5 + (y - 28) / 6, y], [50.5 + (y - 28) / 6, y]], wl, 1);
      line(ctx, [[10, 17], [10, 28]], wl, 1);
      line(ctx, [[8, 17], [12, 17]], wl, 1);
      line(ctx, [[8, 28], [12, 28]], wl, 1);
      box(ctx, 8, 40, 14, 6, null, 1);
      ctx.strokeStyle = wl;
      ctx.strokeRect(8, 40, 14, 6);
      tape(ctx, 8, 7, 9, 4, -0.5);
      tape(ctx, 56, 7, 9, 4, 0.5);
    },
    /* A crayon drawing of a floppy-eared dog (Biscuit, by Lucy). */
    drawing(ctx) {
      box(ctx, 8, 7, 48, 40, "#fbfaf3", 2);
      // the sun in the corner, grass along the bottom
      circle(ctx, 15, 14, 4, "#f2c12e", 0);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        line(ctx, [[15 + Math.cos(a) * 5.5, 14 + Math.sin(a) * 5.5], [15 + Math.cos(a) * 8, 14 + Math.sin(a) * 8]], "#f2a12e", 1.4);
      }
      const grass = [];
      for (let x = 10; x <= 54; x += 3) grass.push([x, x % 2 ? 41 : 44]);
      line(ctx, grass, "#4fa03a", 1.6);
      // the dog
      const fur = "#b07838";
      const dk = "#6b4423";
      [[24, 37], [29, 38], [38, 38], [43, 37]].forEach(([x, y]) => line(ctx, [[x, y - 6], [x, y + 3]], dk, 2.2));
      line(ctx, [[22, 30], [17, 24], [18, 21]], dk, 2.2);
      oval(ctx, 33, 31, 12, 7, fur, 0);
      ctx.beginPath();
      ctx.ellipse(33, 31, 12, 7, 0, 0, TAU);
      ctx.strokeStyle = dk;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      circle(ctx, 45, 23, 6.5, fur, 0);
      ctx.beginPath();
      ctx.arc(45, 23, 6.5, 0, TAU);
      ctx.stroke();
      oval(ctx, 40.5, 26, 2.4, 5.5, dk, 0, 0.3);
      oval(ctx, 50, 26, 2.4, 5.5, dk, 0, -0.3);
      circle(ctx, 43, 22, 1, INK, 0);
      circle(ctx, 47.5, 22, 1, INK, 0);
      circle(ctx, 45.5, 25.5, 1.4, INK, 0);
      line(ctx, [[43.5, 27.5], [45.5, 28.5], [47.5, 27.5]], INK, 1);
      heartPath(ctx, 26, 15, 3.5);
      ctx.fillStyle = "#e04a6a";
      ctx.fill();
      tape(ctx, 12, 8, 9, 4, -0.4);
      tape(ctx, 52, 8, 9, 4, 0.4);
    },
    /* A chalkboard with chalk writing and a doodle. */
    chalk(ctx) {
      box(ctx, 4, 6, 56, 42, "#7a5232", 3);
      box(ctx, 8, 10, 48, 32, "#2c3330", 1.5);
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(10, 12, 20, 10);
      ctx.fillRect(30, 28, 24, 10);
      scribble(ctx, 11, 38, 15, 4, 6, "rgba(236,236,226,0.9)", 33, 1.3);
      const c = "rgba(236,236,226,0.9)";
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(42, 24, 10, 8);
      line(ctx, [[41, 24], [47, 18], [53, 24]], c, 1.2);
      line(ctx, [[44, 32], [44, 28], [47, 28], [47, 32]], c, 1);
      box(ctx, 8, 42, 48, 4, "#6b4423", 1.5);
      box(ctx, 14, 41, 8, 2, "#f3f3ea", 0);
      box(ctx, 40, 40, 9, 3, "#5a5a5a", 1);
    },
    /* A paper list taped up, some of it ticked off. */
    list(ctx) {
      ctx.save();
      ctx.translate(32, 29);
      ctx.rotate(0.03);
      box(ctx, -16, -23, 32, 46, "#fbf8ef", 2);
      ctx.fillStyle = "rgba(90,130,200,0.45)";
      for (let y = -15; y < 22; y += 5) ctx.fillRect(-15, y, 30, 0.8);
      ctx.fillStyle = "rgba(200,60,60,0.6)";
      ctx.fillRect(-11, -22, 0.9, 44);
      for (let i = 0; i < 7; i++) {
        const y = -17 + i * 5;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 0.9;
        ctx.strokeRect(-9, y - 1.6, 3, 3);
        if (i % 3 !== 2) line(ctx, [[-9.5, y], [-8, y + 1.5], [-5, y - 3]], "#c0302a", 1.2);
      }
      scribble(ctx, -4, 13, -17, 7, 5, "#2f3136", 41, 1);
      ctx.restore();
      tape(ctx, 20, 6, 10, 4, -0.2);
      tape(ctx, 44, 6, 10, 4, 0.2);
    },
  };
  const NOTE_KINDS = Object.keys(NOTES);
  D.registerTexture("hNote", (ctx, w, h, p, o) => {
    paper(ctx, w, h, hex(o.c, WALL0), PATS.includes(o.pat) ? o.pat : "plain");
    (NOTES[o.kind] || NOTES.list)(ctx, w, h);
  });

  /* ---------- Plain siding, the name board, the roof ---------- */
  D.registerTexture("hSiding", (ctx, w, h) => siding(ctx, w, h));
  D.registerTexture("hPlaque", (ctx, w, h) => {
    siding(ctx, w, h);
    line(ctx, [[12, 4], [14, 14]], "#4b5057", 1.5);
    line(ctx, [[52, 4], [50, 14]], "#4b5057", 1.5);
    circle(ctx, 12, 4, 1.8, "#4b5057", 1);
    circle(ctx, 52, 4, 1.8, "#4b5057", 1);
    rbox(ctx, 3, 13, 58, 33, 5, "#9a6a3e", 3);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(6, 20, 52, 1);
    ctx.fillRect(6, 38, 52, 1);
    rbox(ctx, 7, 17, 50, 25, 3, null, 1.5);
    // carved letters: a pale cut edge under dark lettering
    fitText(ctx, "THE", 32.6, 22.6, 20, 8, "#e0c08e");
    fitText(ctx, "THE", 32, 22, 20, 8, "#3a2412");
    fitText(ctx, "CABIN", 32.7, 33.7, 44, 14, "#e0c08e");
    fitText(ctx, "CABIN", 32, 33, 44, 14, "#3a2412");
    rivets(ctx, [[10, 29], [54, 29]], "#3a2412", 1.4);
  });
  /* Charcoal shingles in four bold rows (the roof is drawn a column at a time and stretched up the slope). */
  D.registerTexture("hRoof", (ctx, w, h) => {
    ctx.fillStyle = "#353a40";
    ctx.fillRect(0, 0, w, h);
    const r = rng(59);
    for (let row = 0; row < 4; row++) {
      const y = row * 16;
      const base = row % 2 ? "#41464e" : "#3a3f46";
      const off = row % 2 ? 8 : 0;
      for (let x = -16 + off; x < w; x += 16) {
        ctx.fillStyle = shade(base, Math.round(r() * 18 - 9));
        ctx.fillRect(x, y, 16, 16);
        ctx.fillStyle = INK;
        ctx.fillRect(x, y + 3, 1.5, 12);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(x + 1.5, y + 3, 4, 11);
      }
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, y, w, 3);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(0, y + 12.5, w, 1.5);
      ctx.fillStyle = INK;
      ctx.fillRect(0, y + 14, w, 2);
    }
    halftone(ctx, w, h, 0.1);
  });

  /* ---------- Low faces: the side of knee-high furniture (may be transparent) ---------- */
  const LOW = {
    /* Kitchen base cabinets: counter edge, drawers, doors, handles, toe kick. */
    hCounter(ctx, w, h, p, o) {
      const c = hex(o.c, "#8aa08a");
      box(ctx, 0, 0, w, 7, "#d8d2c4", 2.5);
      box(ctx, 1, 7, w - 2, 49, c, 2.5);
      [[3, 28], [33, 28]].forEach(([x, dw]) => {
        box(ctx, x, 10, dw, 9, shade(c, 8), 2);
        box(ctx, x + dw / 2 - 5, 13.5, 10, 2.4, "#c9cdd0", 1.2);
        box(ctx, x, 22, dw, 31, shade(c, 8), 2);
        box(ctx, x + 4, 26, dw - 8, 23, shade(c, -10), 1.5);
        box(ctx, x ? x + 3 : x + dw - 5, 30, 2.4, 10, "#c9cdd0", 1.2);
      });
      box(ctx, 3, 56, w - 6, 8, shade(c, -70), 0);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, 56, w, 2);
    },
    /* A white stove: dials, oven window and handle, the drawer below. */
    hStove(ctx, w, h) {
      box(ctx, 0, 0, w, 6, "#2f3136", 2.5);
      box(ctx, 1, 6, w - 2, 57, "#f2f0ea", 2.5);
      box(ctx, 1, 6, w - 2, 10, "#e2dfd6", 2);
      [10, 22, 42, 54].forEach((x) => {
        circle(ctx, x, 11, 3.2, "#3a3d42", 1.4);
        line(ctx, [[x, 11], [x, 8.5]], "#f2f0ea", 1);
      });
      box(ctx, 29, 9, 6, 4, "#3a2a1a", 1);
      box(ctx, 8, 19, 48, 4, "#c9cdd0", 1.8);
      box(ctx, 6, 25, 52, 26, "#e9e6dd", 2);
      box(ctx, 14, 29, 36, 17, "#2a2c30", 2);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(16, 31, 12, 2.5);
      box(ctx, 6, 53, 52, 8, "#e2dfd6", 1.8);
      box(ctx, 26, 56, 12, 2, "#9ea3aa", 1);
    },
    /* A bed's side: the blanket hanging over the mattress and the wooden rail, legs at the ends. */
    hBedSide(ctx, w, h, p, o) {
      const c = hex(o.c, "#5d78a8");
      box(ctx, 0, 30, w, 12, "#7a5232", 2.5);
      box(ctx, 0, 40, 7, 24, "#6b4423", 2.5);
      box(ctx, w - 7, 40, 7, 24, "#6b4423", 2.5);
      box(ctx, 0, 6, w, 24, "#f1ece0", 2.5);
      const hem = [[0, 0], [w, 0], [w, 34]];
      for (let x = w; x >= 0; x -= 8) hem.push([x, 34 + ((x / 8) % 2 ? 3 : 0)]);
      poly(ctx, hem, c, 2.5);
      ctx.fillStyle = shade(c, 18);
      for (let x = 4; x < w; x += 16) ctx.fillRect(x, 0, 6, 34);
      line(ctx, [[0, 4], [w, 4]], shade(c, -30), 2);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      for (let x = 12; x < w; x += 16) ctx.fillRect(x, 6, 2, 28);
    },
    /* A sofa's front: two seat cushions between rolled arms, a skirt, little legs. */
    hSofaSide(ctx, w, h, p, o) {
      const c = hex(o.c, "#6f7f9a");
      box(ctx, 0, 18, w, 34, shade(c, -12), 2.5);
      rbox(ctx, 1, 6, 31, 22, 6, c, 2.5);
      rbox(ctx, 32, 6, 31, 22, 6, c, 2.5);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(5, 9, 22, 3);
      ctx.fillRect(36, 9, 22, 3);
      box(ctx, 0, 32, w, 18, shade(c, -6), 2.5);
      for (let x = 4; x < w; x += 8) line(ctx, [[x, 42], [x + 2, 50]], "rgba(0,0,0,0.2)", 1.2);
      box(ctx, 6, 52, 6, 10, "#4a3020", 2);
      box(ctx, w - 12, 52, 6, 10, "#4a3020", 2);
    },
    /* A table's apron and legs; open between the legs. */
    hTableSide(ctx, w, h, p, o) {
      const c = hex(o.c, "#a0703c");
      box(ctx, 0, 0, w, 7, shade(c, 12), 2.5);
      box(ctx, 3, 7, w - 6, 10, c, 2.5);
      line(ctx, [[8, 12], [w - 8, 12]], "rgba(0,0,0,0.2)", 1);
      poly(ctx, [[3, 17], [12, 17], [10, h], [5, h]], shade(c, -10), 2.5);
      poly(ctx, [[w - 12, 17], [w - 3, 17], [w - 5, h], [w - 10, h]], shade(c, -10), 2.5);
    },
    /* The ping-pong table: green edge with its white line, legs, the net sagging over the side. */
    hPingPong(ctx, w, h) {
      box(ctx, 0, 0, w, 7, "#2f6a4a", 2.5);
      ctx.fillStyle = "#f3f3ea";
      ctx.fillRect(0, 1.5, w, 2);
      box(ctx, 2, 7, w - 4, 5, "#3a3d42", 2);
      line(ctx, [[10, 12], [8, h]], INK, 6);
      line(ctx, [[10, 12], [8, h]], "#5a6168", 3);
      line(ctx, [[w - 10, 12], [w - 8, h]], INK, 6);
      line(ctx, [[w - 10, 12], [w - 8, h]], "#5a6168", 3);
      line(ctx, [[10, 40], [w - 10, 40]], "#5a6168", 2.5);
      circle(ctx, 8, h - 3, 3, "#2f3136", 1.5);
      circle(ctx, w - 8, h - 3, 3, "#2f3136", 1.5);
      // the net, come loose, hanging off the edge
      box(ctx, 22, 2, 3, 12, "#2f3136", 1.2);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(24, 6);
      ctx.quadraticCurveTo(32, 26, 44, 8);
      ctx.lineTo(44, 5);
      ctx.lineTo(24, 5);
      ctx.closePath();
      ctx.fillStyle = "rgba(240,240,236,0.35)";
      ctx.fill();
      ctx.clip();
      for (let x = 24; x < 46; x += 3) line(ctx, [[x, 4], [x, 26]], "rgba(30,30,30,0.6)", 0.8);
      for (let y = 6; y < 26; y += 3) line(ctx, [[22, y], [46, y]], "rgba(30,30,30,0.6)", 0.8);
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(24, 6);
      ctx.quadraticCurveTo(32, 26, 44, 8);
      ctx.strokeStyle = "#f3f3ea";
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    /* A clawfoot tub's side. */
    hTub(ctx, w, h) {
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(w, 6);
      ctx.lineTo(w, 30);
      ctx.quadraticCurveTo(w, 50, w - 14, 50);
      ctx.lineTo(14, 50);
      ctx.quadraticCurveTo(0, 50, 0, 30);
      ctx.closePath();
      fillInk(ctx, "#f4f2ec", 2.5);
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(4, 36, w - 8, 10);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillRect(6, 12, w - 12, 3);
      rbox(ctx, 0, 0, w, 8, 3, "#fbfaf6", 2.5);
      // clawed feet: a leg, a ball, three toes gripping it
      [14, w - 14].forEach((x) => {
        poly(ctx, [[x - 6, 48], [x + 6, 48], [x + 3, 56], [x - 3, 56]], BRASS, 2);
        oval(ctx, x, 59, 5, 3.5, shade(BRASS, -30), 1.5);
        [-4, 0, 4].forEach((dx) => oval(ctx, x + dx, h - 2.2, 2.2, 2, BRASS, 1.3));
      });
    },
    /* A chest of drawers: two small drawers over two long ones, knobs, short feet. */
    hDresser(ctx, w, h, p, o) {
      const c = hex(o.c, "#9a6a3e");
      box(ctx, 0, 0, w, 5, shade(c, 14), 2.5);
      box(ctx, 2, 5, w - 4, 53, c, 2.5);
      box(ctx, 5, 8, 26, 12, shade(c, 8), 2);
      box(ctx, 33, 8, 26, 12, shade(c, 8), 2);
      box(ctx, 5, 23, 54, 15, shade(c, 8), 2);
      box(ctx, 5, 41, 54, 15, shade(c, 8), 2);
      [[18, 14], [46, 14], [20, 30.5], [44, 30.5], [20, 48.5], [44, 48.5]].forEach(([x, y]) => circle(ctx, x, y, 2.2, BRASS, 1.2));
      box(ctx, 4, 58, 7, 6, shade(c, -25), 2);
      box(ctx, w - 11, 58, 7, 6, shade(c, -25), 2);
    },
    /* A desk's front: the top, a drawer, two legs, open knee space. */
    hDeskSide(ctx, w, h, p, o) {
      const c = hex(o.c, "#8a6a46");
      box(ctx, 0, 0, w, 6, shade(c, 14), 2.5);
      box(ctx, 2, 6, w - 4, 13, c, 2.5);
      box(ctx, 18, 8, 28, 9, shade(c, 8), 2);
      circle(ctx, 32, 12.5, 2, BRASS, 1.2);
      box(ctx, 2, 19, 10, 45, shade(c, -8), 2.5);
      box(ctx, w - 12, 19, 10, 45, shade(c, -8), 2.5);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(12, 19, w - 24, 2);
    },
    /* A low bookcase full of books. */
    hShelfLow(ctx, w, h) {
      box(ctx, 0, 0, w, h, "#6b4423", 3);
      box(ctx, 4, 4, w - 8, h - 8, "#2a1f17", 0);
      const r = rng(71);
      const cols = ["#6b3f8a", "#b3261e", "#2b7a8a", "#d9a21b", "#3f5a8a", "#7a9a3c", "#e6dfcc", "#a0522d"];
      [[4, 30], [33, 60]].forEach(([y0, y1]) => {
        let x = 5;
        while (x < w - 7) {
          const bw = 3 + Math.floor(r() * 4);
          const bh = (y1 - y0) * (0.65 + r() * 0.3);
          const col = cols[Math.floor(r() * cols.length)];
          ctx.fillStyle = col;
          ctx.fillRect(x, y1 - bh, bw, bh);
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(x + bw - 0.8, y1 - bh, 0.8, bh);
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillRect(x, y1 - bh * 0.7, bw, 1);
          x += bw + 0.5;
        }
      });
      box(ctx, 2, 30, w - 4, 4, "#7a5232", 2);
      box(ctx, 2, h - 4, w - 4, 4, "#7a5232", 2);
    },
    /* The porch railing: top and bottom rails, balusters, open between. */
    hPorchRail(ctx, w, h) {
      for (let x = 4; x < w; x += 10) box(ctx, x, 12, 4, 40, TRIM, 2);
      box(ctx, 0, 4, w, 9, TRIM, 2.5);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, 10, w, 2);
      box(ctx, 0, 52, w, 6, shade(TRIM, -14), 2.5);
    },
  };
  Object.entries(LOW).forEach(([name, fn]) => D.registerTexture(name, fn));

  /* ---------- Floors and the ceiling (fixed colors; the palette is ignored) ---------- */
  function carpet(ctx, w, h, c, seed) {
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, w, h);
    const r = rng(seed);
    for (let i = 0; i < 420; i++) {
      ctx.fillStyle = shade(c, Math.round(r() * 24 - 12));
      ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 1);
    }
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
  }
  const FLOORS = {
    /* Warm oak planks, staggered joints, a little grain. */
    hWood(ctx, w, h) {
      ctx.fillStyle = "#a9733f";
      ctx.fillRect(0, 0, w, h);
      const r = rng(83);
      for (let y = 0; y < h; y += 8) {
        let x = -Math.floor(r() * 40);
        while (x < w) {
          const len = 28 + Math.floor(r() * 30);
          ctx.fillStyle = shade("#b5804a", Math.round(r() * 26 - 13));
          ctx.fillRect(x, y, len, 8);
          ctx.fillStyle = "rgba(90,50,20,0.25)";
          ctx.fillRect(x + 4, y + 2 + Math.floor(r() * 4), len * 0.5, 1);
          ctx.fillStyle = "rgba(50,28,10,0.7)";
          ctx.fillRect(x, y, 1, 8);
          x += len;
        }
        ctx.fillStyle = "rgba(50,28,10,0.7)";
        ctx.fillRect(0, y + 7, w, 1);
        ctx.fillStyle = "rgba(255,230,190,0.15)";
        ctx.fillRect(0, y, w, 1);
      }
    },
    /* Kitchen tile: a cream and sage check. */
    hTile(ctx, w, h) {
      ctx.fillStyle = "#b9b4a6";
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = (x + y) % 32 ? "#93a98a" : "#efe6cc";
        ctx.fillRect(x + 1, y + 1, 14, 14);
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(x + 2, y + 2, 6, 1);
      }
    },
    /* Small white bathroom tiles with blue grout. */
    hBathTile(ctx, w, h) {
      ctx.fillStyle = "#6f9ab8";
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) {
        ctx.fillStyle = (x * 3 + y * 5) % 48 === 0 ? "#e2eef4" : "#f4f6f4";
        ctx.fillRect(x + 1, y + 1, 6.5, 6.5);
      }
    },
    hCarpetBlue: (ctx, w, h) => carpet(ctx, w, h, "#5a6f9a", 3),
    hCarpetRose: (ctx, w, h) => carpet(ctx, w, h, "#b47a80", 5),
    hCarpetGreen: (ctx, w, h) => carpet(ctx, w, h, "#6f8a62", 7),
    hCarpetTan: (ctx, w, h) => carpet(ctx, w, h, "#b39a76", 11),
    /* Gray-painted porch boards with gaps and nails. */
    hPorch(ctx, w, h) {
      ctx.fillStyle = "#4a4f55";
      ctx.fillRect(0, 0, w, h);
      const r = rng(97);
      for (let x = 0; x < w; x += 8) {
        ctx.fillStyle = shade("#8a9198", Math.round(r() * 14 - 7));
        ctx.fillRect(x, 0, 7, h);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(x, 0, 1, h);
        ctx.fillStyle = "#3a3d42";
        ctx.fillRect(x + 3, 6, 1, 1);
        ctx.fillRect(x + 3, 38, 1, 1);
        ctx.fillStyle = "rgba(60,60,60,0.25)"; // worn paint
        ctx.fillRect(x + 2, Math.floor(r() * 50), 2, 8);
      }
    },
    /* Warm white plaster with a faint texture. */
    hCeiling(ctx, w, h) {
      ctx.fillStyle = "#ece3d1";
      ctx.fillRect(0, 0, w, h);
      const r = rng(101);
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle = r() < 0.5 ? "#e2d8c4" : "#f4ecdc";
        ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1 + Math.floor(r() * 2), 1);
      }
    },
  };
  Object.entries(FLOORS).forEach(([name, fn]) => D.registerFloor(name, fn));

  /* ---------- Sprites (transparent; bottom edge = the ground) ---------- */
  const SPR = {};
  const sprite = (name, w, h, fn) => {
    SPR[name] = 1;
    D.registerSprite(name, w, h, fn);
  };
  /* A beige CRT glowing green, a sticky note on it, keyboard and mouse (on a desk). */
  sprite("hComputer", 128, 96, (ctx, w, h) => {
    shadow(ctx, 60, h - 3, 50);
    poly(ctx, [[50, 66], [78, 66], [84, 76], [44, 76]], "#c9bfa4", 2.5);
    rbox(ctx, 22, 2, 84, 66, 7, "#ddd4bb", 3.5);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(96, 6, 7, 58);
    rbox(ctx, 31, 9, 66, 48, 9, "#0c2414", 3);
    ctx.fillStyle = "rgba(93,255,138,0.12)";
    ctx.fillRect(35, 13, 58, 40);
    [[18, 40], [24, 30], [30, 44], [36, 22], [42, 34]].forEach(([y, len]) => {
      ctx.fillStyle = "#5dff8a";
      ctx.fillRect(38, y, len, 2.5);
    });
    ctx.fillStyle = "#b8ffc8";
    ctx.fillRect(38, 48, 5, 4);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(36, 12, 22, 2);
    box(ctx, 36, 60, 26, 3, "#a89e84", 1);
    circle(ctx, 96, 62, 2, "#5dff8a", 1);
    ctx.save();
    ctx.translate(98, 10);
    ctx.rotate(0.15);
    box(ctx, -9, -8, 18, 17, "#f6dc5a", 2);
    scribble(ctx, -6, 6, -3, 3, 4, "#2f3136", 5, 1.2);
    ctx.restore();
    poly(ctx, [[10, 79], [98, 79], [104, 94], [4, 94]], "#ddd4bb", 3);
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < 11; k++) {
        const x = 12 + row * 1.5 + k * 7.6 - row * 0.5;
        ctx.fillStyle = k === 10 && row === 1 ? "#b8ae94" : "#f1ead6";
        ctx.fillRect(x, 82 + row * 4, 6, 3);
      }
    }
    line(ctx, [[112, 84], [112, 74], [104, 70], [100, 72]], "#4b5057", 1.5);
    oval(ctx, 116, 89, 8, 5.5, "#ddd4bb", 2.5);
    line(ctx, [[116, 84], [116, 88]], INK, 1.2);
  });
  /* An old typewriter with a sheet in it (on a desk). */
  sprite("hTypewriter", 96, 64, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 42);
    box(ctx, 28, 1, 40, 25, "#fbf8ef", 2);
    scribble(ctx, 31, 64, 6, 4, 4, "#2f3136", 15, 1);
    poly(ctx, [[12, 30], [84, 30], [91, 61], [5, 61]], "#2f3a33", 3);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(14, 32, 68, 3);
    box(ctx, 38, 31, 20, 4, BRASS, 1.2);
    rbox(ctx, 8, 19, 80, 10, 5, "#1f2023", 2.5);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(12, 21, 72, 1.5);
    circle(ctx, 6, 24, 5, "#3a3d42", 2);
    circle(ctx, 90, 24, 5, "#3a3d42", 2);
    rod(ctx, [[16, 18], [6, 10], [2, 11]], "#c9cdd0", 2);
    for (let row = 0; row < 3; row++) {
      const y = 40 + row * 6;
      const n = 9 - row;
      for (let k = 0; k < n; k++) circle(ctx, 22 + row * 3.5 + k * 7, y, 2.6, "#efe9d8", 1.2);
    }
    box(ctx, 30, 57, 36, 3, "#efe9d8", 1.2);
  });
  /* The radio shelf in the dining room: a small side table with an old radio and the green ledger. It grows
     with the Radio room (o.lvl): 0 the radio is dead (a dark dial), 1 the dial glows and a wire runs out the
     window, 2 a ham set with green meters and a speaker sits on the lower shelf, 3 a desk mic, headphones and
     a red ON AIR light join them. */
  sprite("hRadioShelf", 128, 128, (ctx, w, h, o) => {
    const lvl = (o && o.lvl) | 0;
    shadow(ctx, w / 2, h - 3, 56);
    box(ctx, 14, 72, 7, 54, "#6b4423", 2.5);
    box(ctx, 107, 72, 7, 54, "#6b4423", 2.5);
    box(ctx, 18, 104, 92, 6, "#7a5232", 2);
    box(ctx, 10, 72, 108, 8, "#7a5232", 2.5);
    box(ctx, 5, 64, 118, 9, "#9a6a3e", 3);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(8, 66, 112, 2);
    // the radio
    rod(ctx, [[70, 30], [96, 2]], "#c9cdd0", 1.6);
    circle(ctx, 96, 2.5, 2, "#c9cdd0", 1);
    if (lvl >= 1) line(ctx, [[96, 3], [124, 0]], "rgba(30,30,30,0.7)", 1.2); // the wire out to the tower
    rbox(ctx, 12, 26, 66, 38, 12, "#8a5a32", 3);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(18, 29, 54, 3);
    rbox(ctx, 18, 34, 26, 25, 4, "#c9b48a", 2);
    for (let x = 22; x < 42; x += 4) line(ctx, [[x, 36], [x, 57]], "rgba(90,60,30,0.6)", 1.2);
    if (lvl >= 1) {
      ctx.fillStyle = "rgba(255,200,90,0.35)";
      ctx.beginPath();
      ctx.arc(61, 40, 16, 0, TAU);
      ctx.fill();
    }
    rbox(ctx, 49, 34, 24, 12, 3, lvl >= 1 ? "#ffd36b" : "#5a4a32", 2);
    ctx.fillStyle = lvl >= 1 ? "rgba(90,50,10,0.6)" : "rgba(20,15,10,0.5)";
    for (let x = 52; x < 72; x += 3) ctx.fillRect(x, 36, 0.8, 3);
    line(ctx, [[60, 45], [63, 35]], "#c0302a", 1.4);
    circle(ctx, 55, 54, 4, "#3a2412", 1.8);
    circle(ctx, 67, 54, 4, "#3a2412", 1.8);
    // the ledger, standing
    box(ctx, 86, 26, 24, 38, "#2f6a3c", 3);
    box(ctx, 86, 30, 24, 3, "#b8902e", 0);
    box(ctx, 86, 56, 24, 3, "#b8902e", 0);
    box(ctx, 91, 38, 14, 10, "#f3eee0", 1.5);
    line(ctx, [[93, 42], [103, 42]], INK, 1);
    line(ctx, [[93, 45], [100, 45]], INK, 1);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(88, 28, 3, 34);
    if (lvl >= 2) {
      // the ham set on the lower shelf: two green meters, knobs, and a speaker box beside it
      rbox(ctx, 22, 82, 56, 22, 3, "#3a3d42", 2.5);
      [[26, 85], [44, 85]].forEach(([x, y]) => {
        rbox(ctx, x, y, 14, 9, 2, "#9fe3a0", 1.5);
        line(ctx, [[x + 3, y + 8], [x + 10, y + 2]], INK, 1);
      });
      [64, 72].forEach((x) => circle(ctx, x, 90, 3.2, "#c9cdd0", 1.5));
      box(ctx, 26, 97, 48, 3, "#1f2023", 0);
      rbox(ctx, 82, 82, 22, 22, 3, "#5a4a3a", 2.5);
      circle(ctx, 93, 93, 7, "#2a2420", 1.8);
      circle(ctx, 93, 93, 2.5, "#6b5a46", 1);
    }
    if (lvl >= 3) {
      // a desk mic on its stand, headphones over the ledger, a red ON AIR light
      box(ctx, 98, 58, 18, 6, "#3a3d42", 2);
      rod(ctx, [[107, 58], [107, 40]], "#8f969c", 2);
      rbox(ctx, 101, 26, 12, 16, 6, "#4b5057", 2);
      for (let y = 30; y < 40; y += 3) line(ctx, [[103, y], [111, y]], "rgba(255,255,255,0.35)", 1);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(98, 26, 13, Math.PI, TAU);
      ctx.stroke();
      rbox(ctx, 82, 22, 8, 12, 3, "#c0302a", 1.8);
      ctx.fillStyle = "rgba(255,70,50,0.35)";
      ctx.beginPath();
      ctx.arc(32, 12, 15, 0, TAU);
      ctx.fill();
      rbox(ctx, 14, 4, 36, 16, 3, "#ff4a3a", 2);
      fitText(ctx, "ON AIR", 32, 12, 30, 11, "#fff3e8", 0);
    }
  });
  /* Pip's radio table (on the dining table, Radio room 2 and up): a desk lamp, the town map propped on a
     book, the list of voices on a clipboard, a jar of pencils. */
  sprite("hRadioTable", 160, 96, (ctx, w, h) => {
    // the lamp's glow first
    ctx.fillStyle = "rgba(255,225,140,0.3)";
    ctx.beginPath();
    ctx.arc(30, 40, 26, 0, TAU);
    ctx.fill();
    box(ctx, 18, h - 8, 26, 6, "#3a3d42", 2);
    rod(ctx, [[31, h - 8], [22, 40], [34, 26]], "#3a3d42", 3);
    poly(ctx, [[24, 20], [46, 22], [42, 36], [26, 34]], "#2f6a3c", 2.5);
    // the map, propped on a book
    box(ctx, 52, h - 12, 54, 10, "#8a3a2e", 2.5);
    poly(ctx, [[54, h - 12], [104, h - 12], [98, 22], [60, 22]], "#efe3c2", 2.5);
    line(ctx, [[62, 40], [96, 54]], "#c9a86a", 2);
    line(ctx, [[70, 26], [78, h - 14]], "#c9a86a", 2);
    line(ctx, [[60, 62], [100, 34]], "#7aa0b8", 2.5);
    [[70, 46, "#c0302a"], [86, 36, "#2f6aa0"], [80, 62, "#c0302a"]].forEach(([x, y, c]) => circle(ctx, x, y, 3, c, 1.2));
    // the list of voices on a clipboard
    rbox(ctx, 112, 30, 30, h - 32, 3, "#a8834e", 2.5);
    box(ctx, 116, 36, 22, h - 42, "#f6f2e6", 1.5);
    box(ctx, 121, 27, 12, 6, "#8f969c", 1.5);
    for (let y = 42; y < h - 10; y += 6) line(ctx, [[119, y], [119 + 10 + ((y * 7) % 8), y]], INK, 1);
    // a jar of pencils
    rbox(ctx, 144, h - 22, 12, 20, 3, "rgba(200,225,235,0.75)", 2);
    [[146, "#d9a21b"], [150, "#c0302a"], [154, "#2f6aa0"]].forEach(([x, c]) => rod(ctx, [[x, h - 20], [x + 1, h - 34]], c, 2.5));
  });
  /* The town on a cork board (Radio room 3): the city map pinned up, red string between pins, notes from
     the broadcasts, propped on its two legs on the dining table. */
  sprite("hRadioBoard", 128, 160, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 46);
    box(ctx, 20, 96, 8, h - 98, "#6b4423", 2);
    box(ctx, w - 28, 96, 8, h - 98, "#6b4423", 2);
    box(ctx, 6, 8, w - 12, 96, "#6b4423", 3);
    box(ctx, 12, 14, w - 24, 84, "#c9a26a", 1.5);
    ctx.fillStyle = "rgba(90,60,30,0.25)";
    for (let k = 0; k < 60; k++) ctx.fillRect(14 + ((k * 37) % (w - 28)), 16 + ((k * 23) % 80), 2, 2);
    // the map
    box(ctx, 22, 22, 62, 50, "#efe3c2", 2);
    line(ctx, [[24, 40], [82, 50]], "#c9a86a", 2.5);
    line(ctx, [[46, 24], [56, 70]], "#c9a86a", 2.5);
    line(ctx, [[24, 64], [80, 28]], "#7aa0b8", 3);
    const pins = [[34, 34], [62, 44], [50, 62], [74, 30], [100, 30], [98, 70]];
    ctx.strokeStyle = "#c0302a";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    pins.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    // notes from the broadcasts
    box(ctx, 90, 22, 22, 18, "#fff3a8", 1.5);
    box(ctx, 88, 60, 24, 20, "#f6f2e6", 1.5);
    box(ctx, 26, 78, 30, 16, "#bfe0f0", 1.5);
    [[93, 29], [93, 34], [91, 67], [91, 72], [29, 84], [29, 89]].forEach(([x, y]) => line(ctx, [[x, y], [x + 14, y]], INK, 1));
    pins.forEach(([x, y], i) => circle(ctx, x, y, 3, i % 2 ? "#2f6aa0" : "#c0302a", 1.2));
  });
  /* A white fridge with a few magnets and a drawing. */
  sprite("hFridge", 80, 160, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 4, 34);
    rbox(ctx, 6, 4, 68, 151, 7, "#f2f0ea", 4);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(62, 8, 9, 143);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(10, 10, 3, 34);
    line(ctx, [[6, 50], [74, 50]], INK, 3);
    rbox(ctx, 12, 24, 5, 20, 2, "#c9cdd0", 2);
    rbox(ctx, 12, 58, 5, 40, 2, "#c9cdd0", 2);
    // Lucy's drawing under a magnet, a photo, a list
    ctx.save();
    ctx.translate(46, 80);
    ctx.rotate(0.06);
    box(ctx, -14, -16, 28, 32, "#fbfaf3", 2);
    circle(ctx, -6, -8, 3, "#f2c12e", 0);
    oval(ctx, 2, 4, 7, 4, "#b07838", 0);
    circle(ctx, 9, 0, 3.5, "#b07838", 0);
    line(ctx, [[-12, 12], [12, 12]], "#4fa03a", 1.6);
    ctx.restore();
    circle(ctx, 46, 64, 3.2, "#c0302a", 1.5);
    box(ctx, 26, 104, 16, 20, "#f3ead5", 1.8);
    box(ctx, 28, 106, 12, 12, "#8aa0b8", 1);
    circle(ctx, 34, 104, 2.6, "#2f6fb0", 1.2);
    box(ctx, 48, 16, 14, 22, "#fbf8ef", 1.5);
    scribble(ctx, 50, 60, 21, 4, 4, "#2f3136", 7, 0.9);
    star(ctx, 55, 16, 3.5, "#f2c12e", 1.2);
    circle(ctx, 24, 140, 3, "#7a9a3c", 1.2);
    box(ctx, 10, 146, 60, 6, "#3a3d42", 2);
  });
  /* Tall pantry shelves, mostly bare: a few jars and the little labels. */
  sprite("hShelves", 128, 176, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 58);
    box(ctx, 10, 4, 108, 166, "#5e4430", 2.5);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(12, 6, 104, 6);
    const shelves = [8, 48, 88, 128, 164];
    box(ctx, 4, 2, 10, 172, "#8a6a46", 3);
    box(ctx, 114, 2, 10, 172, "#8a6a46", 3);
    const jar = (x, base, jw, jh, fill, lid) => {
      rbox(ctx, x, base - jh, jw, jh, 3, "rgba(205,228,232,0.65)", 2);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fillRect(x + 2, base - jh * 0.55, jw - 4, jh * 0.55 - 2);
      }
      box(ctx, x + 1, base - jh - 4, jw - 2, 5, lid || "#b8902e", 1.8);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillRect(x + 3, base - jh + 3, 2, jh * 0.5);
    };
    jar(24, 48, 16, 22, "#c0302a");
    jar(44, 48, 14, 18, null);
    jar(80, 88, 18, 24, "#d9a21b", "#7a9a3c");
    box(ctx, 30, 120, 14, 8, "#c9cdd0", 1.8); // a can on its side
    oval(ctx, 44, 124, 2.5, 4, "#9ea3aa", 1.5);
    jar(70, 164, 16, 22, "#6b4423");
    shelves.forEach((y) => {
      box(ctx, 4, y, 120, 6, "#9a7650", 2.5);
      if (y > 10) [24, 58, 92].forEach((x, i) => (i + y) % 3 !== 0 && box(ctx, x, y + 1, 14, 4, "#fbf8ef", 1));
    });
  });
  /* An old TV with rabbit ears on a low stand. */
  sprite("hTV", 128, 112, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 56);
    box(ctx, 12, 104, 6, 7, "#4a3020", 2);
    box(ctx, 110, 104, 6, 7, "#4a3020", 2);
    box(ctx, 8, 78, 112, 27, "#7a5232", 3);
    box(ctx, 16, 84, 46, 16, "#2a1f17", 2);
    box(ctx, 20, 88, 38, 8, "#2f3136", 1.5);
    box(ctx, 26, 91, 18, 2, INK, 0);
    circle(ctx, 52, 92, 1.2, "#ff5a3a", 0);
    box(ctx, 66, 84, 46, 16, shade("#7a5232", 10), 2);
    circle(ctx, 89, 92, 2, BRASS, 1.2);
    rod(ctx, [[64, 12], [40, 1]], "#c9cdd0", 1.4);
    rod(ctx, [[64, 12], [94, 2]], "#c9cdd0", 1.4);
    oval(ctx, 64, 12, 9, 4, "#3a3d42", 2);
    rbox(ctx, 16, 12, 96, 66, 8, "#5a4a3c", 3.5);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(20, 15, 88, 3);
    rbox(ctx, 23, 19, 64, 52, 12, "#2c3a36", 3);
    ctx.beginPath();
    ctx.ellipse(44, 34, 14, 7, -0.5, 0, TAU);
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fill();
    box(ctx, 92, 20, 15, 48, "#3f342a", 2);
    circle(ctx, 99.5, 28, 4.5, "#c9c4b8", 1.8);
    circle(ctx, 99.5, 41, 4.5, "#c9c4b8", 1.8);
    for (let y = 51; y < 66; y += 3) line(ctx, [[94, y], [105, y]], "rgba(0,0,0,0.5)", 1.2);
  });
  /* A floor lamp. */
  sprite("hLamp", 48, 144, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 16);
    ctx.fillStyle = "rgba(255,230,150,0.3)";
    ctx.beginPath();
    ctx.arc(w / 2, 26, 22, 0, TAU);
    ctx.fill();
    rod(ctx, [[w / 2, 40], [w / 2, h - 6]], "#b8902e", 2.5);
    oval(ctx, w / 2, h - 5, 14, 4, "#3a3d42", 2.5);
    oval(ctx, w / 2, 40, 13, 3, "#fff4c8", 0);
    poly(ctx, [[9, 40], [39, 40], [33, 7], [15, 7]], "#efe2bd", 3);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(18, 10, 4, 28);
    line(ctx, [[10, 34], [38, 34]], "rgba(150,110,60,0.6)", 1.5);
    rod(ctx, [[30, 41], [30, 52]], "#b8902e", 0.8);
  });
  /* A potted plant. */
  function leaf(ctx, x, y, len, ang, c) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.5, -len * 0.24, len, 0);
    ctx.quadraticCurveTo(len * 0.5, len * 0.24, 0, 0);
    ctx.closePath();
    fillInk(ctx, c, 2);
    line(ctx, [[2, 0], [len - 3, 0]], "rgba(0,0,0,0.3)", 1);
    ctx.restore();
  }
  sprite("hPlant", 64, 96, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 20);
    [[-2.0, 34, "#4f7a32"], [-1.2, 46, "#6f9a3c"], [-1.7, 52, "#5a8a3a"], [-1.45, 44, "#4f7a32"], [-0.9, 30, "#6f9a3c"], [-2.3, 28, "#5a8a3a"], [-1.05, 40, "#4f7a32"]].forEach(([a, len, c]) => leaf(ctx, 32, 60, len, a, c));
    box(ctx, 12, 57, 40, 8, "#c4744a", 2.5);
    poly(ctx, [[15, 65], [49, 65], [45, h - 3], [19, h - 3]], "#b5653a", 2.5);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(38, 66, 6, 26);
  });
  /* A worn armchair with a knitted throw over one arm. */
  sprite("hArmchair", 112, 96, (ctx, w, h) => {
    const c = "#a65a3a";
    shadow(ctx, w / 2, h - 3, 50);
    box(ctx, 18, 84, 8, 10, "#3a2412", 2);
    box(ctx, 86, 84, 8, 10, "#3a2412", 2);
    rbox(ctx, 18, 4, 76, 58, 16, c, 3.5);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(28, 10, 56, 4);
    line(ctx, [[40, 12], [40, 48]], "rgba(0,0,0,0.2)", 1.5);
    line(ctx, [[72, 12], [72, 48]], "rgba(0,0,0,0.2)", 1.5);
    box(ctx, 14, 68, 84, 17, shade(c, -18), 3);
    rbox(ctx, 24, 50, 64, 20, 7, shade(c, 8), 3);
    rbox(ctx, 3, 36, 27, 49, 10, c, 3.5);
    rbox(ctx, 82, 36, 27, 49, 10, c, 3.5);
    oval(ctx, 16.5, 41, 11, 6, shade(c, 12), 2.5);
    oval(ctx, 95.5, 41, 11, 6, shade(c, 12), 2.5);
    // the throw
    poly(ctx, [[1, 33], [31, 31], [31, 64], [1, 66]], "#efe6cf", 2.5);
    [[42, "#5a8a9a"], [50, "#b3261e"], [58, "#5a8a9a"]].forEach(([y, c]) => line(ctx, [[2, y + 1], [30, y - 1]], c, 3));
    for (let x = 3; x < 31; x += 4) line(ctx, [[x, 66 - x / 15], [x - 1, 72 - x / 15]], "#d9cfb4", 1.5);
    for (let y = 36; y < 64; y += 4) line(ctx, [[4, y], [28, y - 1]], "rgba(0,0,0,0.08)", 1);
  });
  /* A wooden dining chair. */
  sprite("hChair", 64, 96, (ctx, w, h) => {
    const c = "#9a6a3e";
    shadow(ctx, w / 2, h - 3, 26);
    box(ctx, 20, 62, 5, 30, shade(c, -30), 1.5);
    box(ctx, 39, 62, 5, 30, shade(c, -30), 1.5);
    box(ctx, 12, 6, 7, 54, c, 2.5);
    box(ctx, 45, 6, 7, 54, c, 2.5);
    [24, 30, 36].forEach((x) => box(ctx, x, 14, 4, 40, shade(c, 8), 1.8));
    rbox(ctx, 8, 2, 48, 12, 4, shade(c, 10), 2.5);
    box(ctx, 12, 30, 40, 4, c, 2);
    poly(ctx, [[5, 54], [59, 54], [57, 63], [7, 63]], shade(c, 16), 2.5);
    box(ctx, 10, 63, 7, 31, c, 2.5);
    box(ctx, 47, 63, 7, 31, c, 2.5);
    box(ctx, 17, 80, 30, 4, shade(c, -10), 2);
  });
  /* A toilet. */
  sprite("hToilet", 64, 80, (ctx, w, h) => {
    const wh = "#f4f2ec";
    shadow(ctx, w / 2, h - 3, 22);
    rbox(ctx, 12, 6, 40, 28, 3, wh, 3);
    rbox(ctx, 9, 2, 46, 7, 3, "#fbfaf6", 2.5);
    box(ctx, 15, 13, 8, 3, "#c9cdd0", 1.2);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(44, 9, 6, 24);
    box(ctx, 21, 64, 22, 14, wh, 2.5);
    ctx.beginPath();
    ctx.moveTo(9, 40);
    ctx.lineTo(55, 40);
    ctx.quadraticCurveTo(54, 64, 38, 66);
    ctx.lineTo(26, 66);
    ctx.quadraticCurveTo(10, 64, 9, 40);
    ctx.closePath();
    fillInk(ctx, wh, 3);
    oval(ctx, 32, 39, 24, 5.5, "#fbfaf6", 2.5);
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(40, 46, 8, 14);
  });
  /* The bathroom vanity: sink cabinet, faucet, a cup of toothbrushes, the mirror over it. */
  sprite("hVanity", 96, 128, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 42);
    rbox(ctx, 20, 2, 56, 42, 3, "#e9e4d8", 3);
    box(ctx, 24, 6, 48, 34, "#b8d0d8", 1.5);
    poly(ctx, [[26, 24], [40, 6], [46, 6], [26, 32]], "rgba(255,255,255,0.45)", 0);
    poly(ctx, [[54, 40], [70, 18], [70, 24], [60, 40]], "rgba(255,255,255,0.3)", 0);
    rod(ctx, [[48, 58], [48, 50], [56, 50], [57, 54]], "#c9cdd0", 2.5);
    circle(ctx, 42, 56, 2.4, "#c9cdd0", 1.2);
    circle(ctx, 54, 56, 2.4, "#c9cdd0", 1.2);
    box(ctx, 72, 46, 10, 12, "#7fb0c8", 2);
    line(ctx, [[74, 46], [72, 38]], "#e04a4a", 2);
    line(ctx, [[77, 46], [77, 37]], "#3f8ad0", 2);
    line(ctx, [[80, 46], [82, 39]], "#f2c12e", 2);
    box(ctx, 4, 58, 88, 9, "#e8e2d4", 3);
    oval(ctx, 48, 61, 18, 2.6, "#c9c4b8", 1.5);
    const cab = "#7f9aa8";
    box(ctx, 8, 67, 80, 54, cab, 3);
    box(ctx, 12, 71, 34, 46, shade(cab, 8), 2);
    box(ctx, 50, 71, 34, 46, shade(cab, 8), 2);
    box(ctx, 16, 75, 26, 38, shade(cab, -8), 1.5);
    box(ctx, 54, 75, 26, 38, shade(cab, -8), 1.5);
    circle(ctx, 42, 86, 2.4, "#c9cdd0", 1.2);
    circle(ctx, 54, 86, 2.4, "#c9cdd0", 1.2);
    box(ctx, 11, 121, 74, 6, shade(cab, -60), 2);
  });
  /* An acoustic guitar leaning, two strings broken. */
  sprite("hGuitar", 48, 128, (ctx, w, h) => {
    shadow(ctx, 22, h - 3, 18);
    ctx.save();
    ctx.translate(20, h - 3);
    ctx.rotate(0.08);
    const body = "#c8873a";
    const bouts = () => {
      ctx.beginPath();
      ctx.ellipse(0, -24, 17, 21, 0, 0, TAU);
      ctx.moveTo(13, -56);
      ctx.ellipse(0, -56, 13, 15, 0, 0, TAU);
    };
    bouts();
    ink(ctx, 6);
    ctx.stroke();
    bouts();
    ctx.fillStyle = body;
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.ellipse(-8, -30, 4, 12, 0.2, 0, TAU);
    ctx.fill();
    circle(ctx, 0, -46, 6, "#2a1a10", 2);
    ctx.beginPath();
    ctx.arc(0, -46, 8, 0, TAU);
    ctx.strokeStyle = "#5b3a22";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    box(ctx, -8, -20, 16, 4, "#3a2412", 1.5);
    box(ctx, -3.5, -110, 7, 52, "#5b3a22", 2.5);
    for (let y = -104; y < -60; y += 6) line(ctx, [[-3, y], [3, y]], "#c9cdd0", 0.8);
    poly(ctx, [[-4.5, -110], [4.5, -110], [6, -124], [-6, -124]], "#3a2412", 2.5);
    [-121, -116, -112].forEach((y) => {
      circle(ctx, -7.5, y, 1.6, "#c9cdd0", 0.8);
      circle(ctx, 7.5, y, 1.6, "#c9cdd0", 0.8);
    });
    // four strings whole, two snapped and curled
    [-2.4, -0.8, 0.8, 2.4].forEach((x) => line(ctx, [[x * 1.6, -18], [x, -110]], "#ece6d0", 0.8));
    line(ctx, [[-3.2, -18], [-4, -40], [-9, -50], [-6, -54]], "#ece6d0", 0.8);
    line(ctx, [[3.2, -110], [5, -96], [10, -90], [8, -86]], "#ece6d0", 0.8);
    ctx.restore();
  });
  /* A pile of toys: blocks, a ball, a toy truck. */
  sprite("hToys", 128, 64, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 58);
    const block = (x, y, s, c, t) => {
      box(ctx, x, y, s, s, c, 2.5);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(x + 2, y + 2, s - 4, 2);
      fitText(ctx, t, x + s / 2, y + s / 2, s - 6, s - 6, "#fbf8ef", 2);
    };
    block(4, 38, 23, "#c0302a", "A");
    block(27, 40, 21, "#2f6fb0", "B");
    block(14, 16, 22, "#d9a21b", "C");
    circle(ctx, 64, 45, 16, "#c0302a", 3);
    ctx.save();
    ctx.beginPath();
    ctx.arc(64, 45, 16, 0, TAU);
    ctx.clip();
    ctx.fillStyle = "#f2c12e";
    ctx.fillRect(48, 40, 32, 8);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(64, 45, 16, 0, TAU);
    ink(ctx, 3);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(58, 38, 4, 0, TAU);
    ctx.fill();
    // the truck
    poly(ctx, [[84, 30], [108, 30], [108, 50], [84, 50]], "#f2c12e", 2.5);
    poly(ctx, [[82, 28], [110, 24], [108, 31], [84, 32]], "#e0a81e", 2);
    box(ctx, 108, 34, 16, 16, "#c0302a", 2.5);
    box(ctx, 112, 37, 8, 6, "#a9d6ee", 1.5);
    box(ctx, 82, 48, 44, 5, "#3a3d42", 2);
    [92, 116].forEach((x) => {
      circle(ctx, x, 55, 6, "#1f2023", 2);
      circle(ctx, x, 55, 2.2, "#c9cdd0", 1);
    });
  });
  /* A teddy bear, sitting. */
  sprite("hTeddy", 64, 64, (ctx, w, h) => {
    const fur = "#a0703c";
    const pale = "#d9b07a";
    shadow(ctx, w / 2, h - 3, 24);
    oval(ctx, 20, 54, 9, 7, fur, 2.5);
    oval(ctx, 44, 54, 9, 7, fur, 2.5);
    oval(ctx, 19, 56, 4.5, 4, pale, 1.5);
    oval(ctx, 45, 56, 4.5, 4, pale, 1.5);
    oval(ctx, 32, 42, 15, 15, fur, 3);
    oval(ctx, 32, 45, 8, 9, pale, 0);
    oval(ctx, 15, 38, 6, 10, fur, 2.5, 0.4);
    oval(ctx, 49, 38, 6, 10, fur, 2.5, -0.4);
    circle(ctx, 20, 9, 6, fur, 2.5);
    circle(ctx, 44, 9, 6, fur, 2.5);
    circle(ctx, 20, 9, 3, pale, 0);
    circle(ctx, 44, 9, 3, pale, 0);
    circle(ctx, 32, 20, 13, fur, 3);
    oval(ctx, 32, 25, 6.5, 5, pale, 2);
    oval(ctx, 32, 22.5, 2.5, 1.8, INK, 0);
    line(ctx, [[32, 24], [32, 27], [29.5, 28.5]], INK, 1.2);
    line(ctx, [[32, 27], [34.5, 28.5]], INK, 1.2);
    circle(ctx, 26.5, 17, 2, INK, 0);
    circle(ctx, 37.5, 17, 2, INK, 0);
    poly(ctx, [[32, 33], [24, 29], [24, 37]], "#c0302a", 1.8);
    poly(ctx, [[32, 33], [40, 29], [40, 37]], "#c0302a", 1.8);
    circle(ctx, 32, 33, 2.2, "#c0302a", 1.5);
  });
  /* A coat rack with a long coat and a red hooded jacket. */
  sprite("hCoatRack", 64, 160, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 24);
    rod(ctx, [[32, 148], [8, h - 3]], "#6b4423", 3);
    rod(ctx, [[32, 148], [56, h - 3]], "#6b4423", 3);
    box(ctx, 29, 12, 6, 140, "#7a5232", 2.5);
    circle(ctx, 32, 9, 5, "#7a5232", 2.5);
    rod(ctx, [[30, 22], [16, 18], [14, 22]], "#b8902e", 1.6);
    rod(ctx, [[34, 22], [48, 18], [50, 22]], "#b8902e", 1.6);
    // the long coat
    poly(ctx, [[16, 22], [24, 26], [27, 112], [3, 112], [6, 30]], "#9a8a62", 3);
    line(ctx, [[16, 26], [15, 108]], "rgba(0,0,0,0.3)", 1.5);
    [44, 60, 76].forEach((y) => circle(ctx, 18, y, 1.5, "#3a2412", 0));
    poly(ctx, [[11, 24], [16, 22], [20, 34]], shade("#9a8a62", -20), 1.5);
    // the red jacket with its hood
    poly(ctx, [[50, 22], [61, 30], [62, 86], [37, 86], [38, 30]], "#b3261e", 3);
    oval(ctx, 50, 28, 9, 7, "#8a1e18", 2.5);
    line(ctx, [[50, 34], [50, 84]], "#c9cdd0", 1.5);
    box(ctx, 37, 80, 25, 6, "#2f3136", 2);
    // a scarf over the hook
    poly(ctx, [[46, 20], [52, 20], [53, 64], [48, 64]], "#d9a21b", 2);
    line(ctx, [[47, 40], [52.5, 40]], "#3f6a4a", 2);
  });
  /* Stacked cardboard boxes. */
  sprite("hBoxes", 112, 112, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 52);
    const cbox = (x, y, bw, bh, c, label) => {
      box(ctx, x, y, bw, bh, c, 3);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(x + 2, y + 2, bw - 4, 3);
      line(ctx, [[x, y + 8], [x + bw, y + 8]], "rgba(0,0,0,0.3)", 1.5);
      ctx.fillStyle = "rgba(230,205,150,0.85)";
      ctx.fillRect(x + bw / 2 - 4, y, 8, 14);
      if (label) fitText(ctx, label, x + bw / 2, y + bh / 2 + 6, bw - 16, bh * 0.3, "#2f3136", 0, HAND);
    };
    cbox(4, 58, 56, 50, "#c49a64", "TOYS");
    cbox(58, 66, 50, 42, "#b88c58", null);
    line(ctx, [[66, 86], [96, 86], [90, 82]], "#2f3136", 2);
    line(ctx, [[96, 86], [90, 90]], "#2f3136", 2);
    cbox(18, 18, 62, 41, "#d0a870", "XMAS");
    poly(ctx, [[22, 18], [8, 8], [12, 4], [26, 16]], "#c49a64", 2.5);
  });
  /* A tall wooden wardrobe. */
  sprite("hWardrobe", 112, 176, (ctx, w, h) => {
    const c = "#7a5232";
    shadow(ctx, w / 2, h - 3, 52);
    box(ctx, 12, 162, 10, 11, shade(c, -30), 2.5);
    box(ctx, 90, 162, 10, 11, shade(c, -30), 2.5);
    box(ctx, 8, 14, 96, 150, c, 3.5);
    box(ctx, 3, 4, 106, 12, shade(c, 14), 3);
    line(ctx, [[6, 10], [106, 10]], "rgba(0,0,0,0.25)", 1.5);
    [[13, 20], [57, 20]].forEach(([x, y]) => {
      box(ctx, x, y, 42, 104, shade(c, 8), 2.5);
      box(ctx, x + 6, y + 6, 30, 40, shade(c, -8), 2);
      box(ctx, x + 6, y + 54, 30, 44, shade(c, -8), 2);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(x + 7, y + 7, 2, 38);
      ctx.fillRect(x + 7, y + 55, 2, 42);
    });
    circle(ctx, 51, 74, 2.8, BRASS, 1.5);
    circle(ctx, 61, 74, 2.8, BRASS, 1.5);
    box(ctx, 13, 130, 86, 28, shade(c, 8), 2.5);
    box(ctx, 46, 141, 20, 5, BRASS, 1.5);
  });
  /* A tall bookcase full of books (and a framed picture). */
  sprite("hBookcase", 112, 176, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 52);
    box(ctx, 4, 4, 104, 168, "#6b4423", 3.5);
    box(ctx, 10, 10, 92, 156, "#2a1f17", 0);
    const r = rng(113);
    const cols = ["#6b3f8a", "#b3261e", "#2b7a8a", "#d9a21b", "#3f5a8a", "#7a9a3c", "#e6dfcc", "#a0522d", "#2f3136"];
    const shelves = [10, 42, 74, 106, 138, 166];
    for (let s = 0; s < 5; s++) {
      const y0 = shelves[s] + 4;
      const y1 = shelves[s + 1];
      let x = 11;
      const stop = s === 2 ? 66 : 101;
      while (x < stop - 4) {
        const bw = 4 + Math.floor(r() * 5);
        const bh = (y1 - y0) * (0.62 + r() * 0.34);
        ctx.fillStyle = cols[Math.floor(r() * cols.length)];
        ctx.fillRect(x, y1 - bh, bw, bh);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(x + bw - 1, y1 - bh, 1, bh);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fillRect(x + 1, y1 - bh * 0.75, bw - 2, 1.5);
        x += bw + 0.6;
      }
      if (s === 2) {
        box(ctx, 74, y1 - 22, 20, 22, "#b8902e", 2);
        box(ctx, 77, y1 - 19, 14, 16, "#8aa0b8", 1);
        circle(ctx, 84, y1 - 13, 3, "#e8c8a0", 0.8);
      }
    }
    shelves.slice(1).forEach((y) => box(ctx, 6, y, 100, 5, "#7a5232", 2));
  });
  /* The iron dinner bell on a bracket at the top of a wooden post, with its pull rope. */
  sprite("hBell", 96, 176, (ctx, w, h) => {
    shadow(ctx, 24, h - 3, 18);
    poly(ctx, [[8, h - 2], [14, h - 8], [34, h - 8], [40, h - 2]], "#6b5034", 2);
    boards(ctx, 15, 14, 14, h - 18, "#8a6a46", 7, 5);
    ink(ctx, 3);
    ctx.strokeRect(15, 14, 14, h - 18);
    box(ctx, 13, 9, 18, 6, "#6b5034", 2.5);
    box(ctx, 15, 18, 68, 8, "#8a6a46", 2.5);
    rod(ctx, [[22, 54], [56, 24]], "#8a6a46", 4);
    rivets(ctx, [[22, 22], [76, 22]], "#2f3136", 1.6);
    box(ctx, 63, 26, 10, 7, "#2f3136", 2);
    const bx = 68;
    ctx.beginPath();
    ctx.moveTo(bx - 9, 34);
    ctx.quadraticCurveTo(bx - 10, 58, bx - 19, 72);
    ctx.lineTo(bx + 19, 72);
    ctx.quadraticCurveTo(bx + 10, 58, bx + 9, 34);
    ctx.quadraticCurveTo(bx, 28, bx - 9, 34);
    ctx.closePath();
    fillInk(ctx, "#3a3d42", 3.5);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(bx - 6, 38, 3, 28);
    oval(ctx, bx, 72, 20, 4.5, "#2a2c30", 3);
    rod(ctx, [[bx, 70], [bx, 78]], "#4b5057", 1.6);
    circle(ctx, bx, 80, 3.6, "#4b5057", 2);
    // the rope
    ctx.beginPath();
    ctx.moveTo(bx, 82);
    ctx.quadraticCurveTo(bx + 8, 104, bx + 2, 128);
    ink(ctx, 5);
    ctx.stroke();
    ctx.strokeStyle = "#c9a26a";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    for (let k = -2; k <= 2; k++) line(ctx, [[bx + 2, 128], [bx + 2 + k * 1.8, 136]], "#c9a26a", 1.5);
    box(ctx, bx - 1.5, 124, 7, 4, "#8a6a46", 1.2);
  });
  /* A white porch column. */
  sprite("hPost", 32, 192, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 2, 14);
    box(ctx, 2, h - 15, 28, 13, "#e9e4d8", 2.5);
    box(ctx, 5, h - 21, 22, 6, TRIM, 2);
    box(ctx, 8, 14, 16, h - 35, TRIM, 2.5);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(18, 16, 5, h - 39);
    line(ctx, [[13, 18], [13, h - 24]], "rgba(0,0,0,0.12)", 1);
    box(ctx, 4, 7, 24, 8, TRIM, 2);
    box(ctx, 1, 1, 30, 7, "#e9e4d8", 2.5);
  });
  /* A porch bench. */
  sprite("hBench", 128, 64, (ctx, w, h) => {
    const c = "#8a6a46";
    shadow(ctx, w / 2, h - 3, 58);
    box(ctx, 11, 4, 7, 38, shade(c, -15), 2.5);
    box(ctx, 110, 4, 7, 38, shade(c, -15), 2.5);
    box(ctx, 10, 6, 108, 8, c, 2.5);
    box(ctx, 10, 17, 108, 8, shade(c, 6), 2.5);
    poly(ctx, [[6, 29], [122, 29], [124, 33], [4, 33]], shade(c, 18), 2);
    box(ctx, 4, 33, 120, 8, c, 2.5);
    box(ctx, 9, 41, 7, 21, shade(c, -15), 2.5);
    box(ctx, 112, 41, 7, 21, shade(c, -15), 2.5);
    box(ctx, 16, 50, 96, 4, shade(c, -22), 2);
    box(ctx, 0, 22, 16, 5, shade(c, 10), 2);
    box(ctx, 112, 22, 16, 5, shade(c, 10), 2);
    rivets(ctx, [[14, 10], [114, 10], [14, 21], [114, 21], [8, 37], [120, 37]], "#3a3d42", 1.3);
  });
  /* Biscuit's bowl. */
  sprite("hDogBowl", 64, 32, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 2, 28);
    poly(ctx, [[5, 10], [59, 10], [53, 30], [11, 30]], "#b3261e", 2.5);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(10, 13, 44, 2);
    oval(ctx, 32, 10, 27, 5, "#c9473a", 2.5);
    oval(ctx, 32, 10, 21, 3, "#6b4423", 0);
    const r = rng(7);
    for (let i = 0; i < 14; i++) circle(ctx, 14 + r() * 36, 9 + r() * 2.5, 1.5, i % 2 ? "#a0703c" : "#8a5a2a", 0);
    fitText(ctx, "BISCUIT", 32, 20.5, 38, 9, "#fbf8ef");
  });
  /* A laundry basket. */
  sprite("hHamper", 64, 64, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 26);
    // what's in it, poking out
    poly(ctx, [[14, 22], [20, 8], [34, 6], [40, 20]], "#5a78a8", 2.5);
    line(ctx, [[20, 10], [26, 20]], "rgba(0,0,0,0.25)", 1.5);
    poly(ctx, [[36, 22], [44, 10], [54, 14], [50, 22]], "#e48aa8", 2.5);
    poly(ctx, [[44, 20], [50, 22], [56, 40], [51, 42]], "#f3eee0", 2);
    line(ctx, [[47, 28], [52, 26]], "#c0302a", 1.5);
    line(ctx, [[49, 34], [54, 32]], "#c0302a", 1.5);
    const wick = "#c8a46a";
    poly(ctx, [[8, 22], [56, 22], [52, h - 3], [12, h - 3]], wick, 3);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(8, 22);
    ctx.lineTo(56, 22);
    ctx.lineTo(52, h - 3);
    ctx.lineTo(12, h - 3);
    ctx.closePath();
    ctx.clip();
    for (let y = 26; y < h; y += 5) {
      line(ctx, [[0, y], [w, y]], "rgba(90,60,25,0.45)", 1.2);
      for (let x = (y / 5) % 2 ? 6 : 10; x < w; x += 8) line(ctx, [[x, y], [x, y + 5]], "rgba(90,60,25,0.35)", 1);
    }
    ctx.restore();
    box(ctx, 6, 20, 52, 6, shade(wick, 12), 2.5);
    oval(ctx, 16, 31, 4.5, 2.5, "#3a2a14", 1.5);
    oval(ctx, 48, 31, 4.5, 2.5, "#3a2a14", 1.5);
    // the stray sock over the rim
    poly(ctx, [[22, 21], [28, 21], [27, 34], [31, 37], [29, 40], [23, 37]], "#f3eee0", 2);
    line(ctx, [[22, 25], [28, 25]], "#2f6fb0", 1.5);
  });

  /* ---------- What the game draws, with every opts set it uses ---------- */
  const WALLS = ["#e3d6b8", "#c9d8b8", "#c9d6e0", "#ecc8c4", "#efe0b0", "#d8cce0"];
  const LVL = [0, 1, 2, 3];
  const sets = (keys, values) =>
    keys.reduce((acc, k) => {
      const out = [];
      acc.forEach((a) => values[k].forEach((v) => out.push(Object.assign({}, a, { [k]: v }))));
      return out;
    }, [{}]);
  const lowColors = {
    hCounter: ["#8aa08a", "#f0ead8", "#6b4e34"],
    hBedSide: ["#5d78a8", "#c0407a", "#4f7a32", "#b3261e", "#d9a21b"],
    hSofaSide: ["#6f7f9a", "#7a8a5a", "#a65a3a"],
    hTableSide: ["#a0703c", "#6b4423", "#c9a27a"],
    hDresser: ["#9a6a3e", "#f0ead8", "#6b4423"],
    hDeskSide: ["#8a6a46", "#6b4423", "#c9a27a"],
  };
  const textures = {
    hSiding: [{}],
    hPlaque: [{}],
    hRoof: [{}],
    hWinOut: sets(["lvl", "dmg"], { lvl: LVL, dmg: [0, 1, 2] }),
    hWinIn: sets(["c", "lvl", "dmg"], { c: WALLS, lvl: LVL, dmg: [0, 1, 2] }),
    hDoorOut: sets(["lvl", "dmg", "back"], { lvl: LVL, dmg: [0, 1], back: [0, 1] }),
    hDoorIn: sets(["c", "lvl", "dmg", "back"], { c: WALLS, lvl: LVL, dmg: [0, 1], back: [0, 1] }),
    hPaper: sets(["c", "pat"], { c: WALLS, pat: PATS }),
    // every kind on every pattern in the first color, and on plain paper in every color
    hNote: sets(["c", "pat", "kind"], { c: [WALLS[0]], pat: PATS, kind: NOTE_KINDS }).concat(sets(["c", "pat", "kind"], { c: WALLS.slice(1), pat: ["plain"], kind: NOTE_KINDS })),
  };
  Object.keys(LOW).forEach((name) => (textures[name] = lowColors[name] ? lowColors[name].map((c) => ({ c })) : [{}]));
  ZSR.HOUSE_ART = {
    textures,
    sprites: Object.keys(SPR).reduce((o, k) => ((o[k] = [{}]), o), {}),
    floors: Object.keys(FLOORS),
    // low faces (may be see-through); every other texture is a full-height, opaque wall face
    low: Object.keys(LOW),
    // the choices behind the opts above: wall colors, hNote kinds, hPaper patterns, low-face colors
    colors: { walls: WALLS.slice(), low: lowColors },
    kinds: NOTE_KINDS.slice(),
    pats: PATS.slice(),
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
