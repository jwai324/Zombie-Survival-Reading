/* Art for the home base yard, drawn in the comic style (flat fills, thick ink, halftone) and
   registered with ZSR.Draw3 (sprites3d.js) for yard.js to use by name:
   - "yWall" (a wall face from a material and a feature, with an optional slice of a sign),
     roofs and gables, the fence by Walls level ("yFence");
   - see-through low faces (beds, crop rows, pens, wire runs, the lattice tower, solar panels,
     string lights, pipes, the car lift);
   - "yLot0".."yLot15" ground (a staked lot: string along the edges given by the bit mask n1 e2 s4 w8);
   - sprites for props (name signs and plaques, drums, tanks, masts, the well, animals, ...).
   Wall faces are fully opaque; low faces and sprites may be transparent. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const D = ZSR.Draw3;
  if (!D) return;
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const { shade, mix, rng, halftone } = D;
  const FONT = "Oswald, Impact, sans-serif";

  /* ---------- Small drawing helpers ---------- */
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
  function poly(ctx, pts, fill, lw) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    fillInk(ctx, fill, lw);
  }
  function circle(ctx, x, y, r, fill, lw) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    fillInk(ctx, fill, lw);
  }
  function oval(ctx, x, y, rx, ry, fill, lw) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, TAU);
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
  /** A soft shadow on the ground under a sprite. */
  function shadow(ctx, cx, y, rx) {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, Math.max(2, rx * 0.14), 0, 0, TAU);
    ctx.fill();
  }
  /** Text as big as fits in maxW x maxH, centered on (cx, cy). */
  function fitText(ctx, text, cx, cy, maxW, maxH, color, outline) {
    let size = Math.floor(maxH);
    ctx.font = "700 " + size + "px " + FONT;
    const w = ctx.measureText(text).width || text.length * size * 0.5;
    if (w > maxW) size = Math.max(6, Math.floor((size * maxW) / w));
    ctx.font = "700 " + size + "px " + FONT;
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
  /** Vertical boards (walls, gables, doors). */
  function boards(ctx, x0, y0, w, h, c, step, seed) {
    const r = rng(seed || 7);
    for (let x = x0; x < x0 + w; x += step) {
      ctx.fillStyle = shade(c, Math.round(r() * 26 - 13));
      ctx.fillRect(x, y0, Math.min(step, x0 + w - x), h);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(x, y0, 1.5, h);
      ctx.fillStyle = "rgba(0,0,0,0.14)";
      ctx.fillRect(x + step * 0.45, y0 + r() * h * 0.6, 1, h * 0.3);
    }
  }
  /** Corrugated sheet: vertical ribs, light and dark. */
  function ribs(ctx, x0, y0, w, h, c, step) {
    const s = step || 8;
    for (let x = x0; x < x0 + w; x += s) {
      ctx.fillStyle = shade(c, 24);
      ctx.fillRect(x, y0, s / 2, h);
      ctx.fillStyle = shade(c, -20);
      ctx.fillRect(x + s / 2, y0, s / 2, h);
    }
  }
  function rivets(ctx, pts, c) {
    pts.forEach(([x, y]) => {
      ctx.fillStyle = c || "#2f3136";
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, TAU);
      ctx.fill();
    });
  }
  function rust(ctx, x, y, w, h) {
    ctx.fillStyle = "rgba(150,72,30,0.35)";
    ctx.fillRect(x, y, w, h);
  }

  /* ---------- Wall faces: yWall { m, c, f, s, p } ----------
     m: material (plank, metal, siding, brick, canvas, crates, coop, plastic, gen); c: its color;
     f: what is on it (win, winLit, winLab, radio, bench, door, doorCross, roll, shelf, tools,
     panel, flap, hatch); s: { t, i, n, lit } slice i of n of a sign reading t across n tiles;
     p: l / m / r, the part of a wide door (roll, flap, doorCross) this tile is. */
  const MATERIAL = {
    plank(ctx, w, h, c) {
      boards(ctx, 0, 0, w, h, c || "#8a6a46", 11, 7);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, h - 8, w, 8);
      halftone(ctx, w, h, 0.07);
    },
    metal(ctx, w, h, c) {
      ribs(ctx, 0, 0, w, h, c || "#6f7a80", 8);
      ctx.fillStyle = INK;
      ctx.fillRect(0, 31, w, 2);
      rivets(ctx, [[4, 28], [20, 28], [36, 28], [52, 28], [4, 36], [20, 36], [36, 36], [52, 36]]);
      rust(ctx, 42, 36, 4, 22);
      rust(ctx, 10, 4, 3, 16);
      halftone(ctx, w, h, 0.06);
    },
    siding(ctx, w, h, c) {
      const b = c || "#e6dfcc";
      for (let y = 0; y < h; y += 8) {
        ctx.fillStyle = y % 16 ? b : shade(b, -8);
        ctx.fillRect(0, y, w, 8);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(0, y + 6, w, 2);
      }
      ctx.fillStyle = shade(b, -30);
      ctx.fillRect(0, 0, 3, h);
      ctx.fillRect(w - 3, 0, 3, h);
      halftone(ctx, w, h, 0.05);
    },
    brick(ctx, w, h, c) {
      const b = c || "#8a4a3a";
      ctx.fillStyle = "#5a4a40";
      ctx.fillRect(0, 0, w, h);
      const r = rng(19);
      for (let y = 0, row = 0; y < h; y += 8, row++) {
        for (let x = row % 2 ? -8 : 0; x < w; x += 16) {
          ctx.fillStyle = shade(b, Math.round(r() * 24 - 12));
          ctx.fillRect(x + 1, y + 1, 14, 6);
        }
      }
      halftone(ctx, w, h, 0.08);
    },
    canvas(ctx, w, h, c) {
      const b = c || "#d8cfb0";
      ctx.fillStyle = b;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let x = 0; x < w; x += 16) ctx.fillRect(x + 12, 0, 4, h);
      ctx.fillStyle = shade(b, -40);
      ctx.fillRect(0, h - 10, w, 10);
      line(ctx, [[0, h - 10], [w, h - 10]], INK, 2);
      halftone(ctx, w, h, 0.06);
    },
    crates(ctx, w, h, c) {
      const b = c || "#a07a4a";
      ctx.fillStyle = shade(b, -50);
      ctx.fillRect(0, 0, w, h);
      [[1, 1, 30, 30], [33, 1, 30, 30], [1, 33, 30, 30], [33, 33, 30, 30]].forEach(([x, y, cw, ch], i) => {
        ctx.fillStyle = shade(b, i % 2 ? -10 : 6);
        ctx.fillRect(x, y, cw, ch);
        ink(ctx, 2.5);
        ctx.strokeRect(x, y, cw, ch);
        line(ctx, [[x + 3, y + ch / 2], [x + cw - 3, y + ch / 2]], "rgba(0,0,0,0.4)", 1.5);
        // the spines of books peeking out of the slats
        const cols = ["#6b3f8a", "#b3261e", "#2b7a8a", "#d9a21b", "#3f5a8a"];
        for (let k = 0; k < 5; k++) {
          ctx.fillStyle = cols[(k + i) % cols.length];
          ctx.fillRect(x + 4 + k * 5, y + 4, 4, 9);
        }
      });
      halftone(ctx, w, h, 0.07);
    },
    coop(ctx, w, h, c) {
      boards(ctx, 0, 0, w, h, c || "#9b3a2a", 10, 11);
      ctx.fillStyle = "#efe6cf";
      ctx.fillRect(0, 0, w, 4);
      ctx.fillRect(0, h - 5, w, 5);
      halftone(ctx, w, h, 0.07);
    },
    plastic(ctx, w, h, c) {
      const b = c || "#cfe3d8";
      ctx.fillStyle = mix(b, "#3f5236", 0.35);
      ctx.fillRect(0, 0, w, h);
      // plants seen through the sheeting
      ctx.fillStyle = "rgba(63,82,54,0.55)";
      [[10, 46, 9], [26, 40, 11], [44, 46, 10], [58, 42, 8]].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      });
      ctx.fillStyle = "rgba(240,248,244,0.45)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(6, 4, 4, 40);
      ctx.fillRect(38, 8, 3, 30);
      ctx.fillStyle = "#e9eef0";
      ctx.fillRect(0, 0, 3, h);
      ctx.fillRect(31, 0, 3, h);
      ctx.fillRect(w - 3, 0, 3, h);
      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(0, h - 6, w, 6);
    },
    gen(ctx, w, h, c) {
      const b = c || "#d9a21b";
      ctx.fillStyle = b;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = shade(b, 30);
      ctx.fillRect(0, 0, w, 6);
      // louvers
      ctx.fillStyle = "#2f3136";
      for (let y = 12; y < 40; y += 6) ctx.fillRect(8, y, w - 16, 3);
      // hazard stripes along the skid
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, h - 12, w, 12);
      ctx.clip();
      ctx.fillStyle = "#1f2023";
      ctx.fillRect(0, h - 12, w, 12);
      ctx.fillStyle = "#d9a21b";
      for (let x = -12; x < w + 12; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x + 6, h);
        ctx.lineTo(x + 12, h - 12);
        ctx.lineTo(x + 6, h - 12);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      halftone(ctx, w, h, 0.06);
    },
  };

  /** A window in a wall: frame, glass (dark, warm-lit, or lab-lit), cross bars. */
  function windowAt(ctx, x, y, ww, wh, kind) {
    box(ctx, x - 3, y - 3, ww + 6, wh + 6, "#4b3a2a", 2.5);
    const glass = kind === "winLit" ? "#ffd36b" : kind === "winLab" ? "#7fe3e0" : "#2b3540";
    box(ctx, x, y, ww, wh, glass, 2.5);
    if (kind === "winLit" || kind === "winLab") {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(x + 3, y + 3, ww * 0.35, wh * 0.4);
      if (kind === "winLab") {
        // flasks on a shelf inside
        ctx.fillStyle = "#2f6f78";
        ctx.fillRect(x, y + wh * 0.62, ww, 2);
        [[0.25, "#b3261e"], [0.55, "#7a9a3c"], [0.8, "#3f5a8a"]].forEach(([fx, col]) => {
          poly(ctx, [[x + ww * fx - 3, y + wh * 0.62], [x + ww * fx + 3, y + wh * 0.62], [x + ww * fx + 1, y + wh * 0.4], [x + ww * fx - 1, y + wh * 0.4]], col, 1.5);
        });
      }
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(x + 3, y + 3, ww * 0.3, wh * 0.35);
    }
    line(ctx, [[x + ww / 2, y], [x + ww / 2, y + wh]], INK, 2.5);
    line(ctx, [[x, y + wh / 2], [x + ww, y + wh / 2]], INK, 2.5);
  }
  const FEATURE = {
    win(ctx, w, h) {
      windowAt(ctx, 16, 14, 32, 24, "win");
    },
    winLit(ctx, w, h) {
      windowAt(ctx, 16, 14, 32, 24, "winLit");
    },
    winLab(ctx, w, h) {
      windowAt(ctx, 12, 14, 40, 28, "winLab");
    },
    /* A window with the radio set inside: dials glowing orange. */
    radio(ctx, w, h) {
      box(ctx, 11, 11, 42, 30, "#4b3a2a", 2.5);
      box(ctx, 14, 14, 36, 24, "#2b3540", 2.5);
      box(ctx, 18, 24, 28, 12, "#3a3d42", 2);
      circle(ctx, 25, 30, 3.5, "#ff9a3a", 1.5);
      circle(ctx, 35, 30, 3.5, "#ffd36b", 1.5);
      box(ctx, 40, 27, 4, 6, "#7a9a3c", 1);
      line(ctx, [[22, 24], [18, 15]], "#9ea3aa", 1.5);
    },
    /* A window with a lab bench behind it: white light, flasks, a microscope. */
    bench(ctx, w, h) {
      box(ctx, 11, 11, 42, 30, "#8a8f94", 2.5);
      box(ctx, 14, 14, 36, 24, "#e8f4f4", 2.5);
      ctx.fillStyle = "#9ea3aa";
      ctx.fillRect(14, 30, 36, 3);
      poly(ctx, [[19, 30], [25, 30], [23, 22], [21, 22]], "#7fe3e0", 1.5);
      poly(ctx, [[29, 30], [33, 30], [32, 20], [30, 20]], "#b3261e", 1.5);
      line(ctx, [[42, 30], [42, 20], [38, 18]], INK, 2.5);
      circle(ctx, 42, 30, 2.5, INK, 0);
    },
    door(ctx, w, h) {
      box(ctx, 16, 18, 32, h - 18, "#5b4030", 3);
      boards(ctx, 18, 20, 28, h - 22, "#7a5a3c", 7, 3);
      line(ctx, [[18, 30], [46, 30]], INK, 2);
      line(ctx, [[18, h - 12], [46, h - 12]], INK, 2);
      circle(ctx, 41, 42, 2.5, "#d9a21b", 1.5);
    },
    doorCross(ctx, w, h, o) {
      const x0 = o.p === "r" ? 0 : o.p === "l" ? 20 : 14;
      const x1 = o.p === "l" ? w : o.p === "r" ? 44 : 50;
      box(ctx, x0, 18, x1 - x0, h - 18, "#f3eee0", 3);
      const cx = o.p === "l" ? w : o.p === "r" ? 0 : 32;
      ctx.fillStyle = "#c0302a";
      ctx.fillRect(cx - 5, 28, 10, 22);
      ctx.fillRect(cx - 11, 34, 22, 10);
      if (!o.p) circle(ctx, 44, 44, 2.2, "#9ea3aa", 1.2);
      else line(ctx, [[o.p === "l" ? w - 1 : 1, 18], [o.p === "l" ? w - 1 : 1, h]], INK, 2.5);
    },
    /* A roll-up door: slats in a frame; p = l / m / r for a door wider than one tile. */
    roll(ctx, w, h, o) {
      const x0 = o.p === "m" || o.p === "r" ? 0 : 6;
      const x1 = o.p === "m" || o.p === "l" ? w : w - 6;
      ctx.fillStyle = "#2f3136";
      ctx.fillRect(x0, 16, x1 - x0, h - 16);
      for (let y = 18; y < h; y += 6) {
        ctx.fillStyle = y % 12 ? "#aeb3b8" : "#9ea3aa";
        ctx.fillRect(x0 + 2, y, x1 - x0 - 4, 5);
      }
      ink(ctx, 3);
      ctx.beginPath();
      ctx.moveTo(x0, h);
      ctx.lineTo(x0, 16);
      ctx.lineTo(x1, 16);
      ctx.lineTo(x1, h);
      ctx.stroke();
      if (o.p !== "m" && o.p !== "r") box(ctx, x0 + 6, h - 12, 10, 4, "#2f3136", 1.5);
    },
    /* Open shelves of books. */
    shelf(ctx, w, h) {
      box(ctx, 4, 6, w - 8, h - 10, "#2a1f17", 3);
      const r = rng(5);
      const cols = ["#6b3f8a", "#b3261e", "#2b7a8a", "#d9a21b", "#3f5a8a", "#7a9a3c", "#e6dfcc"];
      for (let y = 8; y < h - 8; y += 17) {
        let x = 7;
        while (x < w - 9) {
          const bw = 3 + Math.floor(r() * 4);
          const bh = 10 + Math.floor(r() * 4);
          ctx.fillStyle = cols[Math.floor(r() * cols.length)];
          ctx.fillRect(x, y + 14 - bh, bw, bh);
          x += bw + 1;
        }
        ctx.fillStyle = "#8a6a46";
        ctx.fillRect(4, y + 14, w - 8, 3);
      }
    },
    /* A pegboard of tools under a little awning. */
    tools(ctx, w, h) {
      box(ctx, 8, 10, 48, 34, "#c9a27a", 2.5);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      for (let y = 14; y < 42; y += 5) for (let x = 12; x < 54; x += 5) ctx.fillRect(x, y, 1.5, 1.5);
      line(ctx, [[16, 16], [16, 36]], "#4b5057", 4); // wrench
      circle(ctx, 16, 15, 3.5, null, 2);
      poly(ctx, [[26, 16], [34, 16], [34, 38], [26, 30]], "#9ea3aa", 2); // saw
      line(ctx, [[44, 16], [44, 38]], "#7a5a3c", 4); // hammer
      box(ctx, 39, 14, 10, 5, "#4b5057", 1.5);
    },
    /* Generator control panel: gauges, switches, a red stop button. */
    panel(ctx, w, h) {
      box(ctx, 10, 10, 44, 30, "#2f3136", 2.5);
      circle(ctx, 20, 20, 5, "#f3eee0", 1.5);
      circle(ctx, 34, 20, 5, "#f3eee0", 1.5);
      line(ctx, [[20, 20], [23, 17]], INK, 1.5);
      line(ctx, [[34, 20], [31, 16]], INK, 1.5);
      circle(ctx, 46, 20, 4, "#c0302a", 1.5);
      [16, 24, 32, 40].forEach((x) => box(ctx, x, 30, 4, 6, "#9ea3aa", 1));
      box(ctx, 46, 30, 5, 5, "#7a9a3c", 1);
    },
    /* A tent's door flap (or a greenhouse zip door across two tiles). */
    flap(ctx, w, h, o) {
      if (o.p === "l" || o.p === "r") {
        const edge = o.p === "l" ? w : 0;
        poly(ctx, [[edge, 10], [o.p === "l" ? w - 24 : 24, h], [edge, h]], "rgba(30,40,30,0.75)", 2.5);
        line(ctx, [[edge, 8], [edge, h]], INK, 3);
        return;
      }
      poly(ctx, [[32, 8], [14, h], [50, h]], "#2a2a24", 3);
      poly(ctx, [[32, 8], [14, h], [22, h]], shade("#d8cfb0", -20), 2);
      // a red cross over the door
      ctx.fillStyle = "#c0302a";
      ctx.fillRect(27, 14, 10, 4);
      ctx.fillRect(30, 11, 4, 10);
    },
    /* A coop's small hatch with a ramp. */
    hatch(ctx, w, h) {
      box(ctx, 20, 28, 24, 22, "#2a1f17", 2.5);
      poly(ctx, [[20, 50], [44, 50], [56, h], [8, h]], "#9a7650", 2);
      for (let x = 14; x < 52; x += 7) line(ctx, [[x, 56], [x + 3, 56]], INK, 1.5);
      windowAt(ctx, 4, 6, 12, 10, "win");
    },
  };
  /** One tile's slice of a sign that reads `t` across `n` tiles (a board on the upper part of the wall). */
  function signSlice(ctx, w, s) {
    const n = s.n || 1;
    const i = s.i || 0;
    const y0 = 3;
    const y1 = 24;
    const lit = !!s.lit;
    ctx.fillStyle = lit ? "#fff1b8" : "#f1e8d0";
    ctx.fillRect(0, y0, w, y1 - y0);
    if (lit) {
      ctx.fillStyle = "rgba(255,220,120,0.6)";
      ctx.fillRect(0, y1, w, 3);
    }
    ctx.fillStyle = INK;
    ctx.fillRect(0, y0, w, 3);
    ctx.fillRect(0, y1 - 3, w, 3);
    if (i === 0) ctx.fillRect(0, y0, 3, y1 - y0);
    if (i === n - 1) ctx.fillRect(w - 3, y0, 3, y1 - y0);
    // the whole word, offset so this tile shows its own part of it
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y0 + 3, w, y1 - y0 - 6);
    ctx.clip();
    fitText(ctx, String(s.t || ""), (n * w) / 2 - i * w, (y0 + y1) / 2, n * w - 14, 17, lit ? "#b3261e" : INK);
    ctx.restore();
  }
  D.registerTexture("yWall", (ctx, w, h, p, o) => {
    (MATERIAL[o.m] || MATERIAL.plank)(ctx, w, h, o.c);
    if (o.f && FEATURE[o.f]) FEATURE[o.f](ctx, w, h, o);
    if (o.s) signSlice(ctx, w, o.s);
    // ink at the top and bottom of every face; sides only where the wall ends (a wide door or sign runs on)
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, 2);
    ctx.fillRect(0, h - 2, w, 2);
  });

  /* ---------- Roofs and gables (named; the roof is stretched from the eave up to the ridge) ---------- */
  function tin(ctx, w, h, c) {
    ribs(ctx, 0, 0, w, h, c, 8);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 30, w, 2);
    rust(ctx, 18, 0, 5, 26);
    rust(ctx, 50, 34, 4, 30);
    ctx.fillStyle = INK;
    ctx.fillRect(0, h - 3, w, 3);
    halftone(ctx, w, h, 0.08);
  }
  const ROOFS = {
    yRoofTin: (ctx, w, h) => tin(ctx, w, h, "#8f969c"),
    yRoofTinRed: (ctx, w, h) => tin(ctx, w, h, "#9b2a22"),
    yRoofTinWhite: (ctx, w, h) => tin(ctx, w, h, "#cfd2cc"),
    yRoofMetal(ctx, w, h) {
      ctx.fillStyle = "#3a4048";
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = "#59616b";
        ctx.fillRect(x, 0, 3, h);
        ctx.fillStyle = INK;
        ctx.fillRect(x + 3, 0, 1.5, h);
      }
      halftone(ctx, w, h, 0.08);
    },
    yRoofTarp(ctx, w, h) {
      ctx.fillStyle = "#2f6fb0";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      for (let x = 6; x < w; x += 22) ctx.fillRect(x, 0, 8, h);
      line(ctx, [[20, 0], [20, h]], "#d9c9a0", 2);
      line(ctx, [[50, 0], [50, h]], "#d9c9a0", 2);
      halftone(ctx, w, h, 0.08);
    },
    yRoofCanvas(ctx, w, h) {
      ctx.fillStyle = "#e3dbc0";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let x = 0; x < w; x += 16) ctx.fillRect(x + 12, 0, 4, h);
      // a red band along the eave
      ctx.fillStyle = "#c0302a";
      ctx.fillRect(0, h - 14, w, 8);
      halftone(ctx, w, h, 0.06);
    },
    yRoofPlastic(ctx, w, h) {
      ctx.fillStyle = "#b9d3c6";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillRect(8, 0, 6, h);
      ctx.fillRect(40, 0, 4, h);
      ctx.fillStyle = "#e9eef0";
      ctx.fillRect(0, 0, 3, h);
      ctx.fillRect(31, 0, 3, h);
      halftone(ctx, w, h, 0.05);
    },
    yRoofShingle(ctx, w, h) {
      for (let y = 0; y < h; y += 8) {
        ctx.fillStyle = (y / 8) % 2 ? "#3f6a4a" : "#355c3f";
        ctx.fillRect(0, y, w, 8);
        ctx.fillStyle = INK;
        ctx.fillRect(0, y + 7, w, 1.5);
        for (let x = ((y / 8) % 2) * 6; x < w; x += 12) ctx.fillRect(x, y, 1.5, 8);
      }
      halftone(ctx, w, h, 0.1);
    },
  };
  const GABLES = {
    yGablePlank: "#7a6248",
    yGableWhite: "#e6dfcc",
    yGableRed: "#9b3a2a",
    yGableTarp: "#2f6fb0",
    yGableCanvas: "#d8cfb0",
    yGablePlastic: "#cfe3d8",
    yGableMetal: "#6f7a80",
  };
  Object.entries(ROOFS).forEach(([name, fn]) => D.registerTexture(name, fn));
  Object.entries(GABLES).forEach(([name, c]) =>
    D.registerTexture(name, (ctx, w, h) => {
      if (name === "yGableMetal") ribs(ctx, 0, 0, w, h, c, 8);
      else if (name === "yGablePlastic") {
        ctx.fillStyle = c;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#e9eef0";
        ctx.fillRect(30, 0, 4, h);
      } else boards(ctx, 0, 0, w, h, c, 9, 13);
      halftone(ctx, w, h, 0.07);
      ctx.fillStyle = INK;
      ctx.fillRect(0, 0, 2, h);
      ctx.fillRect(w - 2, 0, 2, h);
    })
  );

  /* ---------- The fence by Walls level (1 braced planks, 2 corrugated metal with spikes, 3 concrete blocks and razor wire) ---------- */
  D.registerTexture("yFence", (ctx, w, h, p, o) => {
    ctx.clearRect(0, 0, w, h);
    const lvl = o.lvl | 0;
    const r = rng(29);
    if (lvl <= 1) {
      // braced planks: posts, three wide boards with gaps, a diagonal brace
      box(ctx, 0, 0, 7, h, "#6b5a46", 2.5);
      box(ctx, w - 7, 0, 7, h, "#6b5a46", 2.5);
      [4, 24, 44].forEach((y, i) => box(ctx, 2, y, w - 4, 15, shade("#9a7650", i * 8 - 8), 2.5));
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-0.72);
      box(ctx, -44, -5, 88, 10, "#7d5f40", 2.5);
      ctx.restore();
      rivets(ctx, [[10, 11], [54, 11], [10, 31], [54, 31], [10, 51], [54, 51]]);
    } else if (lvl === 2) {
      // spikes on top, then a corrugated sheet on rails
      for (let x = 2; x < w; x += 10) poly(ctx, [[x, 16], [x + 4, 1], [x + 8, 16]], "#c9cdd0", 2);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 14, w, h - 14);
      ctx.clip();
      ribs(ctx, 0, 14, w, h - 14, "#7d8790", 8);
      rust(ctx, 12, 20, 6, 40);
      rust(ctx, 44, 30, 5, 30);
      ctx.restore();
      ink(ctx, 3);
      ctx.strokeRect(0, 14, w, h - 14);
      line(ctx, [[0, 28], [w, 28]], "#3a3d42", 3);
      line(ctx, [[0, 52], [w, 52]], "#3a3d42", 3);
      rivets(ctx, [[4, 28], [32, 28], [60, 28], [4, 52], [32, 52], [60, 52]]);
    } else {
      // razor wire coils on top of a wall of concrete blocks
      ctx.fillStyle = "#5e5c56";
      ctx.fillRect(0, 22, w, h - 22);
      for (let y = 22, row = 0; y < h; y += 10, row++) {
        for (let x = row % 2 ? -10 : 0; x < w; x += 20) {
          ctx.fillStyle = shade("#a3a199", Math.round(r() * 18 - 9));
          ctx.fillRect(x + 1, y + 1, 18, 8);
        }
      }
      ink(ctx, 3);
      ctx.strokeRect(0, 22, w, h - 22);
      ctx.strokeStyle = "#c9cdd0";
      ctx.lineWidth = 1.5;
      for (let x = -6; x < w + 6; x += 9) {
        ctx.beginPath();
        ctx.ellipse(x, 12, 7, 9, 0.3, 0, TAU);
        ctx.stroke();
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      for (let x = -6; x < w + 6; x += 9) {
        ctx.beginPath();
        ctx.ellipse(x, 12, 7, 9, 0.3, 0, TAU);
        ctx.stroke();
      }
      ctx.fillStyle = "#c9cdd0";
      for (let x = 2; x < w; x += 7) ctx.fillRect(x, 3 + ((x * 7) % 16), 3, 2);
      [6, 58].forEach((x) => box(ctx, x - 2, 2, 4, 21, "#4b5057", 1.5));
    }
    if (o.cracked) {
      // splintered and dented: cracks, a broken chunk, scorch
      ink(ctx, 2.5);
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(27, 22);
      ctx.lineTo(18, 36);
      ctx.lineTo(29, 56);
      ctx.moveTo(44, 10);
      ctx.lineTo(39, 30);
      ctx.lineTo(48, 48);
      ctx.stroke();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      poly(ctx, [[30, 30], [42, 26], [46, 40], [34, 46]], "#000", 0);
      ctx.restore();
      line(ctx, [[30, 30], [42, 26], [46, 40], [34, 46], [30, 30]], INK, 2.5);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(4, 40, 14, 20);
    }
  });

  /* ---------- See-through low faces (low tiles; transparent where you see past them) ---------- */
  const LOW = {
    /* A raised bed: plank box below, leaves above (lush 0: seedlings, 1: full, 2: tomatoes too). */
    yBed(ctx, w, h, p, o) {
      ctx.clearRect(0, 0, w, h);
      const lush = o.lush | 0;
      const r = rng(37 + lush);
      const top = lush ? 4 : 18;
      // leaves
      for (let i = 0; i < (lush ? 18 : 9); i++) {
        const x = 4 + r() * 56;
        const y = top + r() * (30 - top);
        oval(ctx, x, y, 5 + r() * 4, 4 + r() * 3, i % 2 ? "#4f7a32" : "#6f9a3c", 2);
      }
      if (lush >= 2) [[14, 16], [34, 10], [50, 18]].forEach(([x, y]) => circle(ctx, x, y, 4, "#c0302a", 1.5));
      // the box
      boards(ctx, 0, 30, w, h - 30, "#8a6a46", 16, 3);
      ctx.fillStyle = "#3d2f22";
      ctx.fillRect(0, 30, w, 5);
      ink(ctx, 3);
      ctx.strokeRect(1.5, 30, w - 3, h - 31.5);
      box(ctx, 0, 30, 6, h - 30, "#6b5034", 2);
      box(ctx, w - 6, 30, 6, h - 30, "#6b5034", 2);
    },
    /* A row of crops on a mound of soil. */
    yCrops(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      poly(ctx, [[0, h], [0, 44], [10, 38], [54, 38], [w, 44], [w, h]], "#5e4630", 2.5);
      const r = rng(53);
      for (let x = 6; x < w; x += 13) {
        const t = 8 + r() * 10;
        line(ctx, [[x, 40], [x, t + 6]], "#4a6230", 3);
        oval(ctx, x - 5, t + 12, 6, 3.5, "#6f9a3c", 2);
        oval(ctx, x + 5, t + 6, 6, 3.5, "#7faa48", 2);
        oval(ctx, x, t, 4, 6, "#d9c04a", 2);
      }
    },
    /* Herbs: purple and green tufts in a low wooden border with a seed-packet marker. */
    yHerbs(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      const r = rng(61);
      for (let i = 0; i < 12; i++) {
        const x = 5 + r() * 54;
        const y = 14 + r() * 20;
        oval(ctx, x, y, 4 + r() * 3, 6 + r() * 3, i % 3 ? "#5a8a4a" : "#8a5aa0", 2);
      }
      box(ctx, 44, 8, 10, 12, "#f1e8d0", 2);
      line(ctx, [[49, 20], [49, 34]], INK, 2);
      boards(ctx, 0, 34, w, h - 34, "#7a5a3c", 16, 9);
      ink(ctx, 3);
      ctx.strokeRect(1.5, 34, w - 3, h - 35.5);
    },
    /* Chicken wire on posts. */
    yWire(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(200,205,208,0.85)";
      ctx.lineWidth = 1;
      for (let x = -64; x < 64; x += 8) {
        line(ctx, [[x, h], [x + 64, 0]], "rgba(210,214,216,0.8)", 1);
        line(ctx, [[x + 64, h], [x, 0]], "rgba(210,214,216,0.8)", 1);
      }
      box(ctx, 0, 0, 6, h, "#8a6a46", 2);
      box(ctx, w - 6, 0, 6, h, "#8a6a46", 2);
      box(ctx, 0, 2, w, 5, "#9a7650", 2);
    },
    /* A wooden rail fence (the goat pen). */
    yPen(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      box(ctx, 0, 2, 8, h - 2, "#6b5034", 2.5);
      box(ctx, w - 8, 2, 8, h - 2, "#6b5034", 2.5);
      [8, 28, 46].forEach((y) => box(ctx, 0, y, w, 8, "#a07a4a", 2.5));
    },
    /* A water trough. */
    yTrough(ctx, w, h) {
      box(ctx, 0, 0, w, h, "#7d8790", 0);
      ribs(ctx, 0, 6, w, h - 6, "#7d8790", 8);
      box(ctx, 0, 0, w, 7, "#9ea3aa", 2.5);
      ink(ctx, 3);
      ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
    },
    /* Pipes, two stacked, with flanges. */
    yPipe(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      [[18, 14, "#8f969c"], [46, 14, "#5f8aa0"]].forEach(([y, r, c]) => {
        box(ctx, -2, y - r, w + 4, r * 2, c, 3);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fillRect(0, y - r + 3, w, 3);
        box(ctx, 26, y - r - 3, 10, r * 2 + 6, shade(c, -20), 2.5);
      });
    },
    /* A workbench: top board, legs, a vise, tools hanging off the front. */
    yBench(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      box(ctx, 4, 14, 7, h - 14, "#6b5034", 2.5);
      box(ctx, w - 11, 14, 7, h - 14, "#6b5034", 2.5);
      box(ctx, 4, 44, w - 8, 6, "#7d5f40", 2);
      box(ctx, 0, 4, w, 12, "#9a7650", 3);
      box(ctx, 44, 0, 14, 8, "#4b5057", 2);
      line(ctx, [[18, 16], [18, 34]], "#4b5057", 3);
      line(ctx, [[28, 16], [28, 30]], "#7a5a3c", 3);
      box(ctx, 24, 28, 8, 5, "#4b5057", 1.5);
    },
    /* A row of solar panels on frames, tilted to the sky. */
    ySolar(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      line(ctx, [[12, 40], [12, h]], INK, 4);
      line(ctx, [[52, 32], [52, h]], INK, 4);
      line(ctx, [[12, 40], [12, h]], "#9ea3aa", 2);
      line(ctx, [[52, 32], [52, h]], "#9ea3aa", 2);
      poly(ctx, [[-2, 30], [w + 2, 6], [w + 2, 28], [-2, 50]], "#c9cdd0", 3);
      poly(ctx, [[1, 31], [w - 1, 9], [w - 1, 26], [1, 47]], "#2b4f8a", 1.5);
      ctx.strokeStyle = "rgba(160,200,255,0.6)";
      ctx.lineWidth = 1;
      for (let x = 8; x < w; x += 8) line(ctx, [[x, 31 - x * 0.34], [x, 47 - x * 0.34]], "rgba(160,200,255,0.6)", 1);
      line(ctx, [[1, 39], [w - 1, 17.5]], "rgba(160,200,255,0.6)", 1);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      poly(ctx, [[8, 34], [20, 30], [20, 34], [8, 38]], "rgba(255,255,255,0.45)", 0);
    },
    /* Poles at the ends of each tile and a string of bulbs between them. */
    yLights(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      box(ctx, 0, 0, 4, h, "#6b5034", 2);
      box(ctx, w - 4, 0, 4, h, "#6b5034", 2);
      ctx.beginPath();
      ctx.moveTo(2, 6);
      ctx.quadraticCurveTo(32, 24, w - 2, 6);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.stroke();
      const cols = ["#ffd36b", "#ff8a6b", "#9fe3a0", "#8ac8ff", "#ffd36b"];
      [10, 21, 32, 43, 54].forEach((x, i) => {
        const t = x / w;
        const y = 6 + 18 * 2 * t * (1 - t) + 4;
        ctx.fillStyle = "rgba(255,230,150,0.35)";
        ctx.beginPath();
        ctx.arc(x, y + 2, 6, 0, TAU);
        ctx.fill();
        circle(ctx, x, y + 2, 3, cols[i], 1.5);
      });
    },
    /* The lattice tower: two legs, cross bracing and struts (stretched over a tall tile; o.n bays, so a
       taller tower keeps its bays near square). */
    yLattice(ctx, w, h, p, o) {
      ctx.clearRect(0, 0, w, h);
      const legs = [[6, 0], [w - 6, 0]];
      legs.forEach(([x]) => {
        line(ctx, [[x, 0], [x, h]], INK, 6);
        line(ctx, [[x, 0], [x, h]], "#c9cdd0", 3);
      });
      const step = h / ((o && o.n) || 4);
      for (let y = 0; y < h - 0.5; y += step) {
        line(ctx, [[6, y], [w - 6, y + step]], INK, 3);
        line(ctx, [[w - 6, y], [6, y + step]], INK, 3);
        line(ctx, [[6, y], [w - 6, y + step]], "#c9cdd0", 1.5);
        line(ctx, [[w - 6, y], [6, y + step]], "#c9cdd0", 1.5);
        line(ctx, [[6, y], [w - 6, y]], INK, 3);
      }
      // red and white bands at the top, for aircraft that no longer fly
      box(ctx, 3, 0, 6, 6, "#c0302a", 1.5);
      box(ctx, w - 9, 0, 6, 6, "#c0302a", 1.5);
    },
    /* The first radio tower: weathered timber legs, X braces nailed on, rope lashings at the joints. */
    yTimber(ctx, w, h, p, o) {
      ctx.clearRect(0, 0, w, h);
      const n = (o && o.n) || 3;
      const step = h / n;
      for (let y = 0; y < h - 0.5; y += step) {
        line(ctx, [[8, y + 2], [w - 8, y + step - 2]], INK, 5);
        line(ctx, [[w - 8, y + 2], [8, y + step - 2]], INK, 5);
        line(ctx, [[8, y + 2], [w - 8, y + step - 2]], "#a07a4a", 2.5);
        line(ctx, [[w - 8, y + 2], [8, y + step - 2]], "#a07a4a", 2.5);
      }
      [[3, 0], [w - 13, 0]].forEach(([x]) => {
        box(ctx, x, 0, 10, h, "#7a5a36", 2.5);
        ctx.fillStyle = "rgba(255,240,210,0.18)";
        ctx.fillRect(x + 2, 0, 2, h);
      });
      for (let y = 0; y < h - 0.5; y += step) {
        box(ctx, 3, y, w - 6, 5, "#8a6a42", 2);
        // rope lashings where the rungs meet the legs
        [8, w - 8].forEach((x) => box(ctx, x - 4, y + 5, 8, 3, "#d9c08a", 1.2));
      }
    },
    /* The broadcast tower: a heavy steel lattice painted in red and white bands, with a ladder up one side. */
    yTower(ctx, w, h, p, o) {
      ctx.clearRect(0, 0, w, h);
      const n = (o && o.n) || 6;
      const step = h / n;
      for (let i = 0; i < n; i++) {
        const y = i * step;
        const c = i % 2 ? "#eeeae2" : "#c8352b";
        line(ctx, [[6, y], [w - 6, y + step]], INK, 3.5);
        line(ctx, [[w - 6, y], [6, y + step]], INK, 3.5);
        line(ctx, [[6, y], [w - 6, y + step]], c, 1.8);
        line(ctx, [[w - 6, y], [6, y + step]], c, 1.8);
        box(ctx, 3, y, 6, step, c, 1.5);
        box(ctx, w - 9, y, 6, step, c, 1.5);
        box(ctx, 3, y, w - 6, 3, c, 1.5);
      }
      // the ladder up the middle
      line(ctx, [[w / 2 - 5, 0], [w / 2 - 5, h]], "rgba(20,20,20,0.75)", 1.5);
      line(ctx, [[w / 2 + 5, 0], [w / 2 + 5, h]], "rgba(20,20,20,0.75)", 1.5);
      for (let y = 2; y < h; y += 4) line(ctx, [[w / 2 - 5, y], [w / 2 + 5, y]], "rgba(20,20,20,0.6)", 1);
    },
    /* A two-post car lift: yellow posts, the arms raised, the motor box and its hose. */
    yLift(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      box(ctx, 2, 2, 10, h - 2, "#d9a21b", 3);
      box(ctx, w - 12, 2, 10, h - 2, "#d9a21b", 3);
      box(ctx, 0, 0, w, 6, "#d9a21b", 3);
      box(ctx, 8, 30, w - 16, 6, "#3a3d42", 2.5);
      line(ctx, [[14, 33], [26, 40]], INK, 3);
      line(ctx, [[w - 14, 33], [w - 26, 40]], INK, 3);
      box(ctx, 22, 38, 8, 4, "#c0302a", 1.5);
      box(ctx, w - 30, 38, 8, 4, "#c0302a", 1.5);
      box(ctx, w - 12, h - 18, 10, 14, "#3a4a6a", 2);
      line(ctx, [[w - 7, h - 18], [w - 7, 10]], "#1f2023", 2);
    },
  };
  Object.entries(LOW).forEach(([name, fn]) => D.registerTexture(name, fn));

  /* ---------- Ground: a staked lot (yLot + edge bits n1 e2 s4 w8) ---------- */
  function lotGround(ctx, w, h, mask) {
    ctx.fillStyle = "#7a5e40";
    ctx.fillRect(0, 0, w, h);
    const r = rng(71);
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = ["#5e4630", "#8a6c4a", "#6b5034"][i % 3];
      ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 3, 3);
    }
    // the string, bright so it reads at a distance, a little in from the edge
    const S = 5;
    const T = 4;
    ctx.fillStyle = "#f3eee0";
    if (mask & 1) ctx.fillRect(0, S, w, T);
    if (mask & 4) ctx.fillRect(0, h - S - T, w, T);
    if (mask & 8) ctx.fillRect(S, 0, T, h);
    if (mask & 2) ctx.fillRect(w - S - T, 0, T, h);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    if (mask & 1) ctx.fillRect(0, S + T, w, 1.5);
    if (mask & 4) ctx.fillRect(0, h - S, w, 1.5);
    if (mask & 8) ctx.fillRect(S + T, 0, 1.5, h);
    if (mask & 2) ctx.fillRect(w - S, 0, 1.5, h);
    halftone(ctx, w, h, 0.07);
  }
  for (let m = 0; m < 16; m++) D.registerFloor("yLot" + m, (ctx, w, h) => lotGround(ctx, w, h, m));

  /* ---------- Sprites (bottom edge = the ground) ---------- */
  const SPR = {};
  const sprite = (name, w, h, fn) => {
    SPR[name] = 1;
    D.registerSprite(name, w, h, fn);
  };
  /* The lot's sign: a board on two posts with the room's name, big. */
  sprite("ySign", 224, 176, (ctx, w, h, o) => {
    shadow(ctx, w / 2, h - 4, w * 0.36);
    box(ctx, 40, 60, 14, h - 62, "#6b5034", 4);
    box(ctx, w - 54, 60, 14, h - 62, "#6b5034", 4);
    box(ctx, 8, 8, w - 16, 92, "#f1e8d0", 6);
    ctx.fillStyle = "#c9a27a";
    ctx.fillRect(11, 11, w - 22, 12);
    line(ctx, [[11, 24], [w - 11, 24]], INK, 3);
    fitText(ctx, String(o.t || ""), w / 2, 62, w - 40, 62, INK);
    rivets(ctx, [[18, 16], [w - 18, 16]]);
  });
  /* A built room's plaque: its name, big, and how many levels are built. */
  sprite("yPlaque", 208, 156, (ctx, w, h, o) => {
    shadow(ctx, w / 2, h - 3, 30);
    box(ctx, w / 2 - 8, 84, 16, h - 86, "#6b5034", 3.5);
    box(ctx, 5, 5, w - 10, 84, "#f1e8d0", 5);
    fitText(ctx, String(o.t || ""), w / 2, 34, w - 24, 48, INK);
    const n = Math.max(0, Math.min(3, o.n | 0));
    for (let i = 0; i < 3; i++) {
      const x = w / 2 + (i - 1) * 28;
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5;
        const rr = k % 2 ? 4.5 : 10;
        ctx[k ? "lineTo" : "moveTo"](x + Math.cos(a) * rr, 72 + Math.sin(a) * rr);
      }
      ctx.closePath();
      fillInk(ctx, i < n ? "#d9a21b" : "#cfc6b0", 2.5);
    }
  });
  sprite("yStake", 32, 72, (ctx, w, h) => {
    poly(ctx, [[12, 10], [20, 10], [19, h - 2], [16, h + 2], [13, h - 2]], "#9a7650", 2.5);
    poly(ctx, [[20, 12], [31, 16], [20, 21]], "#ff7a1a", 2);
  });
  sprite("yDrum", 72, 96, (ctx, w, h, o) => {
    const c = o.c || "#b3261e";
    shadow(ctx, w / 2, h - 4, 30);
    box(ctx, 8, 14, w - 16, h - 20, c, 3.5);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(14, 16, 8, h - 24);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(w - 20, 16, 10, h - 24);
    line(ctx, [[8, 36], [w - 8, 36]], INK, 3);
    line(ctx, [[8, 62], [w - 8, 62]], INK, 3);
    oval(ctx, w / 2, 14, w / 2 - 8, 7, shade(c, 20), 3.5);
    circle(ctx, w / 2 + 10, 13, 3, "#2f3136", 1.5);
    box(ctx, 24, 42, 24, 14, "#f1e8d0", 2);
    poly(ctx, [[36, 44], [41, 54], [31, 54]], "#d9a21b", 1.5);
  });
  sprite("yRainBarrel", 96, 136, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 4, 36);
    box(ctx, 14, 52, w - 28, h - 58, "#2f6fb0", 3.5);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(20, 56, 8, h - 66);
    line(ctx, [[14, 76], [w - 14, 76]], INK, 3);
    line(ctx, [[14, 104], [w - 14, 104]], INK, 3);
    // a funnel of tarp on top catches the rain
    poly(ctx, [[2, 18], [w - 2, 18], [w / 2 + 12, 52], [w / 2 - 12, 52]], "#d9c9a0", 3.5);
    oval(ctx, w / 2, 18, w / 2 - 2, 8, "#3a4a5a", 3);
    box(ctx, w - 22, h - 30, 10, 6, "#9ea3aa", 2);
  });
  /* A wide water tank on a braced stand, with a ladder. */
  sprite("yTankStand", 176, 208, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 4, 70);
    const legs = [[30, 94], [w - 30, 94]];
    legs.forEach(([x]) => box(ctx, x - 5, 94, 10, h - 98, "#6b5034", 3));
    line(ctx, [[30, 110], [w - 30, h - 20]], INK, 4);
    line(ctx, [[w - 30, 110], [30, h - 20]], INK, 4);
    line(ctx, [[30, 110], [w - 30, h - 20]], "#8a6a46", 2);
    line(ctx, [[w - 30, 110], [30, h - 20]], "#8a6a46", 2);
    box(ctx, 26, 92, w - 52, 8, "#7d5f40", 3);
    // the tank
    box(ctx, 16, 30, w - 32, 62, "#5f8aa0", 4);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(26, 34, 12, 54);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(w - 46, 34, 26, 54);
    line(ctx, [[16, 50], [w - 16, 50]], INK, 2.5);
    line(ctx, [[16, 72], [w - 16, 72]], INK, 2.5);
    poly(ctx, [[16, 30], [w / 2, 10], [w - 16, 30]], "#4f7a90", 4);
    // the ladder
    line(ctx, [[w - 40, 30], [w - 40, h - 6]], INK, 3);
    line(ctx, [[w - 26, 30], [w - 26, h - 6]], INK, 3);
    for (let y = 40; y < h - 6; y += 12) line(ctx, [[w - 40, y], [w - 26, y]], INK, 2.5);
  });
  /* A tall tank with a cone top, a ladder and WATER stenciled on it. */
  sprite("yTankTall", 144, 256, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 4, 58);
    [[24], [w - 24]].forEach(([x]) => box(ctx, x - 5, h - 44, 10, 42, "#4b5057", 3));
    box(ctx, 14, 40, w - 28, h - 84, "#5f8aa0", 4);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(22, 46, 12, h - 96);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(w - 44, 46, 26, h - 96);
    for (let y = 70; y < h - 50; y += 34) line(ctx, [[14, y], [w - 14, y]], INK, 2.5);
    poly(ctx, [[10, 42], [w / 2, 8], [w - 10, 42]], "#4f7a90", 4);
    box(ctx, w / 2 - 5, 2, 10, 10, "#9ea3aa", 2);
    ctx.save();
    ctx.translate(w / 2 - 6, 140);
    fitText(ctx, "WATER", 0, 0, 80, 22, "#f1e8d0", 4);
    ctx.restore();
    line(ctx, [[w - 30, 42], [w - 30, h - 4]], INK, 3);
    line(ctx, [[w - 18, 42], [w - 18, h - 4]], INK, 3);
    for (let y = 52; y < h - 4; y += 12) line(ctx, [[w - 30, y], [w - 18, y]], INK, 2.5);
  });
  sprite("yWhip", 40, 320, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 14);
    box(ctx, 10, h - 26, 20, 22, "#4b5057", 3);
    line(ctx, [[w / 2, 6], [w / 2, h - 26]], INK, 5);
    line(ctx, [[w / 2, 6], [w / 2, h - 26]], "#c9cdd0", 2.5);
    [[60, 12], [120, 9]].forEach(([y, len]) => line(ctx, [[w / 2 - len, y], [w / 2 + len, y]], INK, 3));
    circle(ctx, w / 2, 6, 4, "#c0302a", 2);
  });
  /* Guy wires from a tower's top down to three ground anchors (stands over the tower's tile, see-through). */
  sprite("yGuys", 288, 320, (ctx, w, h) => {
    const cx = w / 2;
    [[6, h - 6], [w - 6, h - 6], [cx - 34, h - 2], [cx + 34, h - 2]].forEach(([x, y], i) => {
      const top = i < 2 ? 6 : h * 0.45;
      line(ctx, [[cx, top], [x, y]], "rgba(25,25,25,0.75)", 1.6);
    });
    [[6, h - 6], [w - 6, h - 6]].forEach(([x, y]) => box(ctx, x - 6, y - 5, 12, 8, "#6f7a80", 2));
  });
  /* A tall mast on guy wires with antennas at the top. */
  sprite("yMast", 112, 352, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 4, 44);
    const cx = w / 2;
    [[4, h - 6], [w - 4, h - 6], [20, h - 2], [w - 20, h - 2]].forEach(([x, y], i) => line(ctx, [[cx, 40 + (i % 2) * 120], [x, y]], "rgba(30,30,30,0.7)", 1.5));
    box(ctx, cx - 6, 30, 12, h - 36, "#c9cdd0", 3);
    for (let y = 40; y < h - 10; y += 22) line(ctx, [[cx - 6, y], [cx + 6, y + 11]], INK, 1.5);
    [[48, 30], [86, 22]].forEach(([y, len]) => line(ctx, [[cx - len, y], [cx + len, y]], INK, 3.5));
    line(ctx, [[cx, 2], [cx, 32]], INK, 3);
    circle(ctx, cx, 4, 4, "#c0302a", 2);
    box(ctx, cx - 16, h - 18, 32, 14, "#4b5057", 3);
  });
  sprite("yDish", 112, 112, (ctx, w, h) => {
    line(ctx, [[w / 2, h - 30], [w / 2, h - 2]], INK, 6);
    oval(ctx, w / 2, 48, 46, 40, "#e6e2d8", 4);
    oval(ctx, w / 2 + 4, 48, 30, 26, "#c9c4b8", 2);
    line(ctx, [[w / 2 - 40, 60], [w / 2 + 16, 40]], INK, 3);
    line(ctx, [[w / 2 + 40, 60], [w / 2 + 16, 40]], INK, 3);
    circle(ctx, w / 2 + 16, 40, 5, "#4b5057", 2);
  });
  sprite("yBeacon", 48, 48, (ctx, w, h) => {
    ctx.fillStyle = "rgba(255,80,60,0.35)";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 22, 0, TAU);
    ctx.fill();
    circle(ctx, w / 2, h / 2, 10, "#ff3a2a", 3);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(w / 2 - 5, h / 2 - 6, 4, 4);
  });
  /* A floodlight mast: a pole with four lamps and their glow. */
  sprite("yFlood", 112, 352, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 4, 30);
    box(ctx, w / 2 - 18, h - 22, 36, 18, "#4b5057", 3);
    box(ctx, w / 2 - 5, 40, 10, h - 62, "#8f969c", 3);
    box(ctx, 10, 34, w - 20, 8, "#3a3d42", 3);
    ctx.fillStyle = "rgba(255,240,170,0.35)";
    ctx.beginPath();
    ctx.ellipse(w / 2, 24, w / 2, 26, 0, 0, TAU);
    ctx.fill();
    [[22, 22], [46, 18], [66, 18], [90, 22]].forEach(([x, y]) => {
      box(ctx, x - 10, y - 10, 20, 18, "#2f3136", 3);
      box(ctx, x - 7, y - 6, 14, 11, "#fff1b8", 1.5);
    });
  });
  sprite("yExhaust", 40, 80, (ctx, w, h) => {
    box(ctx, 14, 16, 12, h - 16, "#4b5057", 3);
    poly(ctx, [[8, 18], [32, 18], [26, 10], [14, 10]], "#2f3136", 2.5);
    ctx.fillStyle = "rgba(90,90,95,0.45)";
    ctx.beginPath();
    ctx.arc(20, 6, 6, 0, TAU);
    ctx.fill();
  });
  sprite("ySpool", 96, 80, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 4, 40);
    oval(ctx, 22, h / 2 + 4, 16, 34, "#9a7650", 3.5);
    box(ctx, 22, 14, w - 44, h - 20, "#1f2023", 3.5);
    for (let y = 22; y < h - 10; y += 8) line(ctx, [[24, y], [w - 24, y]], "#3a3d42", 2);
    oval(ctx, w - 22, h / 2 + 4, 16, 34, "#a07a4a", 3.5);
    circle(ctx, w - 22, h / 2 + 4, 5, "#5b4030", 2);
  });
  sprite("yTires", 96, 112, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 4, 42);
    [h - 22, h - 50, h - 78].forEach((y, i) => {
      oval(ctx, w / 2 + (i === 1 ? 4 : 0), y, 40, 16, "#1f2023", 3.5);
      oval(ctx, w / 2 + (i === 1 ? 4 : 0), y - 3, 18, 6, "#3a3d42", 2);
    });
    box(ctx, 8, h - 78, w - 16, 0, null, 0);
  });
  sprite("yJerry", 80, 64, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 34);
    [[6, "#b3261e"], [42, "#5f6b3c"]].forEach(([x, c]) => {
      box(ctx, x, 14, 32, h - 18, c, 3);
      line(ctx, [[x + 4, 22], [x + 28, h - 10]], "rgba(0,0,0,0.3)", 3);
      box(ctx, x + 6, 6, 14, 8, c, 2.5);
      box(ctx, x + 22, 8, 6, 6, "#2f3136", 2);
    });
  });
  /* An A-frame engine hoist with an engine on the chain. */
  sprite("yHoist", 144, 176, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 4, 60);
    line(ctx, [[20, h - 6], [w / 2, 14]], INK, 9);
    line(ctx, [[w - 20, h - 6], [w / 2, 14]], INK, 9);
    line(ctx, [[20, h - 6], [w / 2, 14]], "#d9a21b", 5);
    line(ctx, [[w - 20, h - 6], [w / 2, 14]], "#d9a21b", 5);
    box(ctx, w / 2 - 34, 10, 68, 10, "#d9a21b", 3);
    line(ctx, [[w / 2, 20], [w / 2, 76]], "#4b5057", 3);
    // the engine
    box(ctx, w / 2 - 30, 76, 60, 40, "#4b5057", 3.5);
    box(ctx, w / 2 - 22, 66, 44, 12, "#3a3d42", 3);
    for (let x = w / 2 - 18; x < w / 2 + 20; x += 12) circle(ctx, x, 72, 3, "#9ea3aa", 1.5);
    box(ctx, w / 2 + 26, 86, 10, 18, "#2f3136", 2.5);
  });
  /* The well: a ring of stones with dark water inside, a bucket on the rim. */
  function wellRing(ctx, cx, y0, rw, rh) {
    oval(ctx, cx, y0 + rh, rw, rw * 0.32, "rgba(0,0,0,0.25)", 0);
    box(ctx, cx - rw, y0, rw * 2, rh, "#8a8a84", 4);
    const r = rng(83);
    for (let y = y0 + 4; y < y0 + rh - 2; y += 12) {
      for (let x = cx - rw + ((y / 12) % 2 ? 0 : 8); x < cx + rw - 6; x += 16) {
        ctx.fillStyle = shade("#9a9890", Math.round(r() * 30 - 15));
        ctx.fillRect(x + 2, y, 13, 10);
        ink(ctx, 1.5);
        ctx.strokeRect(x + 2, y, 13, 10);
      }
    }
    oval(ctx, cx, y0, rw, rw * 0.3, "#a3a199", 4);
    oval(ctx, cx, y0 + 2, rw * 0.72, rw * 0.2, "#1d2a33", 2.5);
  }
  sprite("yWellRing", 144, 96, (ctx, w, h) => {
    wellRing(ctx, w / 2, 26, 60, h - 32);
    box(ctx, w / 2 + 36, 12, 18, 16, "#8a6a46", 2.5);
  });
  /* The well with a round, pointed shingle roof on two posts and a windlass. A sprite always faces you,
     so everything here looks the same from every side: no gable end that would turn as you walk round. */
  sprite("yWellRoof", 160, 208, (ctx, w, h) => {
    const cx = w / 2;
    box(ctx, cx - 54, 50, 10, h - 90, "#6b5034", 3);
    box(ctx, cx + 44, 50, 10, h - 90, "#6b5034", 3);
    // the windlass across the posts, rope and bucket in the middle
    line(ctx, [[cx - 48, 84], [cx + 48, 84]], INK, 9);
    line(ctx, [[cx - 48, 84], [cx + 48, 84]], "#8a6a46", 5);
    line(ctx, [[cx - 6, 84], [cx + 6, 84]], "#c9a27a", 5);
    line(ctx, [[cx, 86], [cx, 122]], "#c9a27a", 2.5);
    poly(ctx, [[cx - 10, 120], [cx + 10, 120], [cx + 8, 138], [cx - 8, 138]], "#8a6a46", 2.5);
    wellRing(ctx, cx, h - 74, 62, 68);
    // the roof: its dark underside, then the cone with rings of shingles and a knob on top
    oval(ctx, cx, 56, 70, 9, "#3a2420", 3);
    ctx.beginPath();
    ctx.moveTo(cx, 6);
    ctx.lineTo(cx + 74, 54);
    ctx.ellipse(cx, 54, 74, 10, 0, 0, Math.PI);
    ctx.closePath();
    fillInk(ctx, "#7a4536", 4);
    ctx.save();
    ctx.clip();
    [20, 32, 44].forEach((y) => {
      const k = (y - 6) / 48; // the cone's width at this height, as a share of the eave's
      ctx.beginPath();
      ctx.ellipse(cx, y, 74 * k, 10 * k, 0, 0, Math.PI);
      ctx.strokeStyle = "rgba(15,16,18,0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(cx - 30, 0, 14, 70);
    ctx.restore();
    circle(ctx, cx, 7, 5, "#62342a", 2.5);
  });
  sprite("yBucket", 40, 40, (ctx, w, h) => {
    poly(ctx, [[6, 10], [34, 10], [30, h - 2], [10, h - 2]], "#8a6a46", 3);
    line(ctx, [[6, 10], [20, 0], [34, 10]], INK, 2);
    line(ctx, [[8, 22], [32, 22]], INK, 2);
  });
  sprite("yPump", 80, 144, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 4, 30);
    box(ctx, 14, h - 22, w - 28, 18, "#9a9890", 3);
    box(ctx, 28, 40, 22, h - 62, "#3f6a4a", 3.5);
    box(ctx, 24, 30, 30, 14, "#355c3f", 3);
    poly(ctx, [[50, 54], [72, 60], [72, 68], [50, 64]], "#355c3f", 3);
    line(ctx, [[30, 34], [6, 6]], INK, 6);
    line(ctx, [[30, 34], [6, 6]], "#4b5057", 3);
    circle(ctx, 6, 6, 4, "#4b5057", 2);
    ctx.fillStyle = "#6fb0d0";
    ctx.fillRect(68, 68, 3, 14);
  });
  sprite("yScarecrow", 112, 176, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 24);
    line(ctx, [[w / 2, 40], [w / 2, h - 2]], INK, 7);
    line(ctx, [[w / 2, 40], [w / 2, h - 2]], "#7d5f40", 4);
    line(ctx, [[10, 66], [w - 10, 66]], INK, 7);
    line(ctx, [[10, 66], [w - 10, 66]], "#7d5f40", 4);
    // plaid shirt, straw at the cuffs, burlap head, hat
    poly(ctx, [[w / 2 - 22, 60], [w / 2 + 22, 60], [w / 2 + 18, 120], [w / 2 - 18, 120]], "#b3261e", 3.5);
    line(ctx, [[w / 2 - 20, 80], [w / 2 + 20, 80]], "#2f3136", 3);
    line(ctx, [[w / 2 - 19, 100], [w / 2 + 19, 100]], "#2f3136", 3);
    line(ctx, [[w / 2, 60], [w / 2, 120]], "#2f3136", 2);
    [[8, 66], [w - 8, 66], [w / 2 - 10, 124], [w / 2 + 10, 124]].forEach(([x, y]) => {
      for (let k = -2; k <= 2; k++) line(ctx, [[x, y], [x + k * 3, y + 10]], "#d9c04a", 2);
    });
    circle(ctx, w / 2, 40, 17, "#c9a26a", 3.5);
    circle(ctx, w / 2 - 6, 38, 2.5, INK, 0);
    circle(ctx, w / 2 + 6, 38, 2.5, INK, 0);
    line(ctx, [[w / 2 - 7, 47], [w / 2 + 7, 47]], INK, 2);
    oval(ctx, w / 2, 26, 30, 6, "#d9c04a", 3);
    poly(ctx, [[w / 2 - 16, 26], [w / 2 - 12, 8], [w / 2 + 12, 8], [w / 2 + 16, 26]], "#d9c04a", 3);
    line(ctx, [[w / 2 - 14, 22], [w / 2 + 14, 22]], "#b3261e", 3);
  });
  sprite("yChicken", 56, 56, (ctx, w, h, o) => {
    const peck = (o.f | 0) === 1;
    shadow(ctx, 28, h - 3, 16);
    line(ctx, [[24, 44], [22, h - 3]], "#d9a21b", 2.5);
    line(ctx, [[32, 44], [34, h - 3]], "#d9a21b", 2.5);
    oval(ctx, 26, 34, 17, 13, "#f3eee0", 3);
    poly(ctx, [[10, 28], [4, 16], [16, 24]], "#f3eee0", 2.5);
    const hx = peck ? 42 : 40;
    const hy = peck ? 40 : 18;
    circle(ctx, hx, hy, 8, "#f3eee0", 3);
    poly(ctx, [[hx + 6, hy - 1], [hx + 13, hy + 2], [hx + 6, hy + 4]], "#d9a21b", 1.5);
    poly(ctx, [[hx - 4, hy - 8], [hx, hy - 13], [hx + 4, hy - 8]], "#c0302a", 1.5);
    circle(ctx, hx + 2, hy - 1, 1.6, INK, 0);
  });
  sprite("yGoat", 112, 96, (ctx, w, h, o) => {
    const down = (o.f | 0) === 1;
    shadow(ctx, w / 2, h - 3, 40);
    [[28, 0], [40, 0], [70, 0], [82, 0]].forEach(([x]) => line(ctx, [[x, 60], [x, h - 3]], INK, 5));
    oval(ctx, 56, 52, 34, 18, "#e6dfcc", 3.5);
    oval(ctx, 44, 56, 10, 7, "#8a6a46", 0);
    poly(ctx, [[22, 46], [14, 40], [20, 52]], "#e6dfcc", 2.5);
    const hx = down ? 94 : 92;
    const hy = down ? 66 : 32;
    line(ctx, [[82, 46], [hx - 4, hy + 4]], INK, 9);
    line(ctx, [[82, 46], [hx - 4, hy + 4]], "#e6dfcc", 6);
    oval(ctx, hx, hy, 12, 9, "#e6dfcc", 3);
    line(ctx, [[hx - 4, hy - 6], [hx - 12, hy - 18]], INK, 3);
    line(ctx, [[hx + 2, hy - 7], [hx - 2, hy - 20]], INK, 3);
    circle(ctx, hx + 3, hy - 2, 2, INK, 0);
    poly(ctx, [[hx + 2, hy + 8], [hx + 6, hy + 16], [hx + 8, hy + 8]], "#c9c4b8", 1.5);
  });
  sprite("yHay", 96, 64, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 44);
    box(ctx, 6, 14, w - 12, h - 18, "#d9c04a", 3.5);
    const r = rng(91);
    for (let i = 0; i < 26; i++) {
      const x = 10 + r() * (w - 20);
      const y = 18 + r() * (h - 26);
      line(ctx, [[x, y], [x + 6, y + 2]], "#a88a2a", 1.5);
    }
    line(ctx, [[30, 14], [30, h - 4]], "#7d5f40", 3);
    line(ctx, [[w - 30, 14], [w - 30, h - 4]], "#7d5f40", 3);
  });
  /* A copper still: pot over a little fire, dome, coil, a jar catching the drips. */
  sprite("yStill", 112, 128, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 44);
    box(ctx, 16, h - 26, 52, 22, "#4b5057", 3);
    ctx.fillStyle = "#ff9a3a";
    ctx.beginPath();
    ctx.moveTo(30, h - 26);
    ctx.lineTo(36, h - 36);
    ctx.lineTo(42, h - 26);
    ctx.lineTo(48, h - 34);
    ctx.lineTo(54, h - 26);
    ctx.fill();
    oval(ctx, 42, h - 52, 30, 26, "#c87a3a", 3.5);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(22, h - 64, 6, 18);
    poly(ctx, [[30, h - 76], [54, h - 76], [48, h - 96], [36, h - 96]], "#b0682e", 3);
    line(ctx, [[48, h - 92], [84, h - 92], [88, h - 60]], INK, 6);
    line(ctx, [[48, h - 92], [84, h - 92], [88, h - 60]], "#c87a3a", 3);
    for (let y = h - 80; y < h - 44; y += 9) oval(ctx, 88, y, 10, 3.5, null, 2.5);
    box(ctx, 80, h - 34, 18, 28, "rgba(200,230,240,0.8)", 2.5);
    ctx.fillStyle = "#7fe3e0";
    ctx.fillRect(82, h - 20, 14, 12);
  });
  sprite("yBooks", 80, 72, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 34);
    const cols = ["#6b3f8a", "#b3261e", "#2b7a8a", "#d9a21b", "#3f5a8a", "#7a9a3c"];
    for (let i = 0; i < 9; i++) box(ctx, 10 + i * 7, 8 + (i % 3) * 3, 6, 18, cols[i % cols.length], 1.5);
    box(ctx, 6, 22, w - 12, h - 26, "#a07a4a", 3.5);
    line(ctx, [[8, 36], [w - 8, 36]], "rgba(0,0,0,0.35)", 2);
    fitText(ctx, "BOOKS", w / 2, 50, w - 24, 16, "#3a2a1a");
  });
  sprite("yFlag", 80, 256, (ctx, w, h) => {
    shadow(ctx, 14, h - 3, 12);
    line(ctx, [[10, 6], [10, h - 2]], INK, 6);
    line(ctx, [[10, 6], [10, h - 2]], "#c9cdd0", 3);
    circle(ctx, 10, 6, 4, "#d9a21b", 2);
    poly(ctx, [[12, 12], [w - 4, 18], [w - 8, 44], [w - 2, 64], [12, 60]], "#f3eee0", 3);
    ctx.fillStyle = "#c0302a";
    ctx.fillRect(34, 22, 12, 34);
    ctx.fillRect(23, 33, 34, 12);
  });
  sprite("yLamp", 64, 224, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 14);
    ctx.fillStyle = "rgba(255,230,140,0.35)";
    ctx.beginPath();
    ctx.arc(w / 2, 26, 30, 0, TAU);
    ctx.fill();
    line(ctx, [[w / 2, 34], [w / 2, h - 4]], INK, 7);
    line(ctx, [[w / 2, 34], [w / 2, h - 4]], "#2f3136", 4);
    poly(ctx, [[w / 2 - 14, 34], [w / 2 + 14, 34], [w / 2 + 10, 16], [w / 2 - 10, 16]], "#fff1b8", 3);
    poly(ctx, [[w / 2 - 16, 16], [w / 2 + 16, 16], [w / 2, 4]], "#2f3136", 3);
    box(ctx, w / 2 - 10, h - 14, 20, 10, "#2f3136", 2.5);
  });
  sprite("yVent", 56, 72, (ctx, w, h) => {
    box(ctx, 20, 30, 16, h - 30, "#8f969c", 3);
    oval(ctx, w / 2, 24, 18, 16, "#aeb3b8", 3);
    for (let x = -12; x <= 12; x += 6) line(ctx, [[w / 2 + x, 10], [w / 2 + x * 0.6, 38]], INK, 1.5);
    ctx.fillStyle = "rgba(200,240,240,0.35)";
    ctx.beginPath();
    ctx.arc(w / 2, 4, 6, 0, TAU);
    ctx.fill();
  });
  /* Plants that stand on their own: a sunflower clump. */
  sprite("yPlants", 96, 176, (ctx, w, h, o) => {
    shadow(ctx, w / 2, h - 3, 30);
    [[30, 36, 0], [62, 18, 1], [48, 60, 0]].forEach(([x, y, k]) => {
      line(ctx, [[x, y], [x + (k ? 2 : -2), h - 2]], INK, 6);
      line(ctx, [[x, y], [x + (k ? 2 : -2), h - 2]], "#4a6230", 3);
      oval(ctx, x - 12, y + 40, 12, 6, "#6f9a3c", 2.5);
      oval(ctx, x + 12, y + 64, 12, 6, "#6f9a3c", 2.5);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        oval(ctx, x + Math.cos(a) * 14, y + Math.sin(a) * 14, 7, 7, "#f2c12e", 2);
      }
      circle(ctx, x, y, 10, "#5b4030", 2.5);
    });
    void o;
  });
  ZSR.YardArt = { sprites: Object.keys(SPR) };
})(typeof globalThis !== "undefined" ? globalThis : this);
