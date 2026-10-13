/* Pre-rendered textures and sprites for the first-person interiors, drawn in the
   same comic style as the road: flat fills, ink outlines, halftone. Everything is
   procedural and cached as small canvases. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const cache = new Map();

  function make(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    draw(ctx, w, h);
    return c;
  }
  function cached(key, w, h, draw) {
    if (!cache.has(key)) cache.set(key, make(w, h, draw));
    return cache.get(key);
  }
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
    return "#" + ((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, "0");
  }
  function halftone(ctx, w, h, alpha) {
    ctx.fillStyle = "rgba(0,0,0," + (alpha || 0.12) + ")";
    for (let y = 3; y < h; y += 6) for (let x = 3 + ((y / 6) % 2) * 3; x < w; x += 6) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, TAU);
      ctx.fill();
    }
  }
  function border(ctx, w, h) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, w, h);
  }
  function label(ctx, text, x, y, size, color) {
    ctx.font = "700 " + size + "px Oswald, Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color || INK;
    ctx.fillText(text, x, y);
  }
  function mix(a, b, t) {
    const x = parseInt(a.slice(1), 16);
    const y = parseInt(b.slice(1), 16);
    const ch = (s) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
    return "#" + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0");
  }
  /** Seeded random, so procedural textures look the same every time. */
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }

  /* ---------- Wall styles (palette.wallStyle): the face of every plain wall tile ---------- */
  const WALL_STYLES = {
    /* Painted drywall with a faint panel line and a baseboard (the original look). */
    drywall(ctx, w, h, c) {
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 2;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, h - 10, w, 10);
      halftone(ctx, w, h, 0.08);
    },
    /* Cinder blocks in offset courses. */
    block(ctx, w, h, c) {
      const r = rng(7);
      ctx.fillStyle = shade(c, -34);
      ctx.fillRect(0, 0, w, h);
      for (let row = 0; row < 4; row++) {
        for (let x = row % 2 ? -16 : 0; x < w; x += 32) {
          ctx.fillStyle = shade(c, Math.round(r() * 16 - 8));
          ctx.fillRect(x + 1.5, row * 16 + 1.5, 29, 13);
          ctx.fillStyle = "rgba(255,255,255,0.12)";
          ctx.fillRect(x + 1.5, row * 16 + 1.5, 29, 2);
        }
      }
      halftone(ctx, w, h, 0.08);
    },
    /* Red brick, mortar in the wall color. */
    brick(ctx, w, h, c) {
      const r = rng(11);
      const b = mix(c, "#8e4a34", 0.6);
      ctx.fillStyle = mix(c, "#cfc6b2", 0.45);
      ctx.fillRect(0, 0, w, h);
      for (let row = 0; row < 8; row++) {
        for (let x = row % 2 ? -8 : 0; x < w; x += 16) {
          ctx.fillStyle = shade(b, Math.round(r() * 26 - 13));
          ctx.fillRect(x + 1, row * 8 + 1, 14, 6);
        }
      }
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, h - 8, w, 8);
      halftone(ctx, w, h, 0.09);
    },
    /* Glazed square tiles with light grout and a dark band at hip height. */
    tile(ctx, w, h, c) {
      const t = shade(c, 34);
      ctx.fillStyle = shade(c, -8);
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = y === 32 ? shade(c, -30) : t;
        ctx.fillRect(x + 1, y + 1, 14, 14);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.fillRect(x + 2, y + 2, 5, 2);
      }
      halftone(ctx, w, h, 0.05);
    },
    /* Corrugated sheet metal with a seam, rivets and a rust streak. */
    metal(ctx, w, h, c) {
      const m = mix(c, "#8f969c", 0.5);
      for (let x = 0; x < w; x += 8) {
        ctx.fillStyle = shade(m, 22);
        ctx.fillRect(x, 0, 4, h);
        ctx.fillStyle = shade(m, -18);
        ctx.fillRect(x + 4, 0, 4, h);
      }
      ctx.fillStyle = INK;
      ctx.fillRect(0, 31, w, 2);
      ctx.fillStyle = "#3a3d42";
      for (let x = 4; x < w; x += 16) {
        ctx.fillRect(x, 26, 2, 2);
        ctx.fillRect(x, 36, 2, 2);
      }
      ctx.fillStyle = "rgba(140,70,30,0.35)";
      ctx.fillRect(41, 33, 5, 26);
      ctx.fillRect(43, 4, 3, 20);
      halftone(ctx, w, h, 0.06);
    },
    /* Vertical boards with grain and dark gaps. */
    wood(ctx, w, h, c) {
      const r = rng(23);
      const b = mix(c, "#7a5636", 0.6);
      for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = shade(b, Math.round(r() * 24 - 12));
        ctx.fillRect(x, 0, 16, h);
        ctx.strokeStyle = "rgba(0,0,0,0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 5 + r() * 3, 0);
        ctx.lineTo(x + 6 + r() * 3, h);
        ctx.moveTo(x + 11, 0);
        ctx.lineTo(x + 10 + r() * 3, h);
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.fillRect(x, 0, 1.5, h);
      }
      halftone(ctx, w, h, 0.08);
    },
    /* Poured concrete: form-tie holes, a pour line and stains. */
    concrete(ctx, w, h, c) {
      const b = mix(c, "#8a8a84", 0.35);
      ctx.fillStyle = b;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.13)";
      [[18, 44, 12], [46, 20, 9]].forEach(([x, y, rr]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rr, rr * 1.6, 0, 0, TAU);
        ctx.fill();
      });
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      [[16, 16], [48, 16], [16, 48], [48, 48]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, TAU);
        ctx.fill();
      });
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 31, w, 2);
      halftone(ctx, w, h, 0.1);
    },
    /* Glass blocks: pale squares with a bright center, light mortar. */
    glassbrick(ctx, w, h, c) {
      const b = mix(c, "#9fc4cc", 0.55);
      ctx.fillStyle = mix(c, "#d8d4c8", 0.5);
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = shade(b, -14);
        ctx.fillRect(x + 1.5, y + 1.5, 13, 13);
        ctx.fillStyle = shade(b, 26);
        ctx.fillRect(x + 4.5, y + 4.5, 7, 7);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillRect(x + 3, y + 3, 3, 2);
      }
      halftone(ctx, w, h, 0.05);
    },
  };
  /** A plain wall in the given style (or the palette's), ink border included: a base for decor textures. */
  function wallBase(ctx, w, h, palette, style) {
    const p = palette || {};
    (WALL_STYLES[style || p.wallStyle] || WALL_STYLES.drywall)(ctx, w, h, p.wall || "#777777");
    border(ctx, w, h);
  }

  /* Stacked logs with chinking, the cabin's siding. */
  function logs(ctx, w, h) {
    ctx.fillStyle = "#4a3828";
    ctx.fillRect(0, 0, w, h);
    for (let y = -4; y < h; y += 13) {
      ctx.fillStyle = (y / 13) % 2 ? "#8a6a46" : "#7d5f40";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-4, y + 2, w + 8, 10, 5) : ctx.rect(-4, y + 2, w + 8, 10);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, y + 9, w, 3);
    }
    // a knot or two
    ctx.fillStyle = "#5b4530";
    ctx.beginPath();
    ctx.ellipse(44, 20, 4, 2.5, 0, 0, TAU);
    ctx.ellipse(16, 46, 3.5, 2.2, 0, 0, TAU);
    ctx.fill();
    halftone(ctx, w, h, 0.07);
  }
  function wheel(ctx, x, y) {
    ctx.fillStyle = "#1f2023";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#9ea3aa";
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, TAU);
    ctx.fill();
  }
  const DEFAULT_LOOK = { body: "#5b6b3a", roof: "#4e5c32" };
  function vanLook() {
    // the paint job, looked up without building a stats object for every screen column
    const S = ZSR.State;
    const u = S && S.save && S.save.upgrades;
    const looks = ZSR.Upgrades && ZSR.Upgrades.PAINT_LOOKS;
    if (!u || !looks) return DEFAULT_LOOK;
    return looks[Math.min(u.paint || 0, looks.length - 1)] || DEFAULT_LOOK;
  }
  function vanSideBase(ctx, w, h) {
    const look = vanLook();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = look.body;
    ctx.fillRect(0, 2, w, h - 10);
    ctx.fillStyle = look.roof;
    ctx.fillRect(0, 2, w, 5);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, h - 16, w, 8);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h - 8);
    ctx.lineTo(w, h - 8);
    ctx.stroke();
    halftone(ctx, w, h - 8, 0.07);
  }
  function vanEndBase(ctx, w, h) {
    const look = vanLook();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = look.body;
    ctx.fillRect(2, 2, w - 4, h - 8);
    ctx.fillStyle = look.roof;
    ctx.fillRect(2, 2, w - 4, 4);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, w - 4, h - 8);
    halftone(ctx, w, h - 6, 0.07);
  }

  /* ---------- Wall textures (64 x 64) ---------- */
  const TEX = {
    /* Plain wall: palette.wallStyle, or opts.style for a per-tile style. */
    wall(ctx, w, h, p, o) {
      wallBase(ctx, w, h, p, o && o.style);
    },
    /* W: a wall with a window (opaque): dark glass, a cross bar, one board nailed across. */
    window(ctx, w, h, p, o) {
      wallBase(ctx, w, h, p, o && o.style);
      ctx.fillStyle = "#24303a";
      ctx.fillRect(12, 10, 40, 30);
      ctx.fillStyle = "rgba(190,215,230,0.35)";
      ctx.beginPath();
      ctx.moveTo(14, 38);
      ctx.lineTo(30, 12);
      ctx.lineTo(38, 12);
      ctx.lineTo(22, 38);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.strokeRect(12, 10, 40, 30);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(32, 10);
      ctx.lineTo(32, 40);
      ctx.moveTo(12, 25);
      ctx.lineTo(52, 25);
      ctx.stroke();
      ctx.fillStyle = shade(p.wall || "#777777", 30);
      ctx.fillRect(9, 40, 46, 5);
      ctx.strokeRect(9, 40, 46, 5);
      ctx.fillStyle = "#8a6a46";
      ctx.save();
      ctx.translate(32, 24);
      ctx.rotate(0.22);
      ctx.fillRect(-25, -4, 50, 8);
      ctx.strokeRect(-25, -4, 50, 8);
      ctx.restore();
    },
    shelf(ctx, w, h, p) {
      ctx.fillStyle = shade(p.shelf, -25);
      ctx.fillRect(0, 0, w, h);
      const colors = ["#b3261e", "#d9a21b", "#3aa0c0", "#7a9a3c", "#e6dfcc", "#8e5cff"];
      let k = 0;
      for (let y = 8; y < h - 8; y += 18) {
        ctx.fillStyle = p.shelf;
        ctx.fillRect(2, y + 10, w - 4, 5);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        ctx.strokeRect(2, y + 10, w - 4, 5);
        for (let x = 6; x < w - 8; x += 11) {
          ctx.fillStyle = colors[k++ % colors.length];
          ctx.fillRect(x, y, 8, 10);
          ctx.strokeRect(x, y, 8, 10);
        }
      }
      border(ctx, w, h);
    },
    counter(ctx, w, h, p) {
      ctx.fillStyle = p.counter;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = shade(p.counter, 40);
      ctx.fillRect(0, 0, w, 14);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.lineTo(w, 14);
      ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(10, 24, w - 20, h - 34);
      border(ctx, w, h);
    },
    /* K (low): a table or desk seen from the side: a thick top, legs, open space under it. */
    table(ctx, w, h, p) {
      const wood = (p && p.table) || "#8a6a46";
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.fillStyle = shade(wood, -30);
      [5, w - 15].forEach((x) => {
        ctx.fillRect(x, 14, 10, h - 14);
        ctx.strokeRect(x, 14, 10, h - 16);
      });
      ctx.fillRect(15, 34, w - 30, 6);
      ctx.strokeRect(15, 34, w - 30, 6);
      ctx.fillStyle = wood;
      ctx.fillRect(1.5, 1.5, w - 3, 14);
      ctx.strokeRect(1.5, 1.5, w - 3, 14);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(4, 4, w - 8, 3);
    },
    /* R (low): a bed, gurney or bench: mattress, metal frame, legs with casters. */
    bed(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.fillStyle = "#6e7278";
      [6, w - 12].forEach((x) => {
        ctx.fillRect(x, 26, 6, h - 34);
        ctx.strokeRect(x, 26, 6, h - 34);
        ctx.beginPath();
        ctx.arc(x + 3, h - 5, 4, 0, TAU);
        ctx.fillStyle = "#2f3136";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#6e7278";
      });
      ctx.fillStyle = "#9ea3aa";
      ctx.fillRect(1.5, 22, w - 3, 8);
      ctx.strokeRect(1.5, 22, w - 3, 8);
      ctx.fillStyle = "#e6dfcc";
      ctx.fillRect(1.5, 1.5, w - 3, 21);
      ctx.strokeRect(1.5, 1.5, w - 3, 21);
      ctx.fillStyle = "#7d9cb0";
      ctx.fillRect(1.5, 13, w - 3, 9);
      ctx.strokeRect(1.5, 13, w - 3, 9);
    },
    crate(ctx, w, h) {
      ctx.fillStyle = "#8a5a2e";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, h);
      ctx.moveTo(w, 0);
      ctx.lineTo(0, h);
      ctx.stroke();
      ctx.strokeRect(8, 8, w - 16, h - 16);
      halftone(ctx, w, h, 0.1);
      border(ctx, w, h);
    },
    glass(ctx, w, h) {
      ctx.fillStyle = "#4a5f6e";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, 8);
      ctx.lineTo(30, 30);
      ctx.lineTo(24, 44);
      ctx.moveTo(30, 30);
      ctx.lineTo(50, 36);
      ctx.stroke();
      border(ctx, w, h);
    },
    locked(ctx, w, h) {
      ctx.fillStyle = "#4a2a26";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b3261e";
      ctx.fillRect(8, 8, w - 16, 18);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, w - 16, 18);
      label(ctx, "LOCKED", w / 2, 17, 11, "#f3eee0");
      // padlock
      ctx.fillStyle = "#9ea3aa";
      ctx.fillRect(24, 38, 16, 14);
      ctx.strokeRect(24, 38, 16, 14);
      ctx.beginPath();
      ctx.arc(32, 38, 6, Math.PI, 0);
      ctx.stroke();
      border(ctx, w, h);
    },
    exit(ctx, w, h) {
      ctx.fillStyle = "#2f3136";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7a9a3c";
      ctx.fillRect(8, 6, w - 16, 16);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 6, w - 16, 16);
      label(ctx, "EXIT", w / 2, 14, 11, "#f3eee0");
      ctx.strokeRect(14, 28, w - 28, h - 34);
      ctx.fillStyle = "#d9a21b";
      ctx.beginPath();
      ctx.arc(w - 20, 46, 3, 0, TAU);
      ctx.fill();
      border(ctx, w, h);
    },
    /* The cabin's front door: planks, a cross brace, a brass knob and a small sign. */
    door(ctx, w, h) {
      logs(ctx, w, h);
      ctx.fillStyle = "#4a3828";
      ctx.fillRect(12, 4, w - 24, h - 4);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.strokeRect(12, 4, w - 24, h - 4);
      ctx.lineWidth = 1.5;
      for (let x = 20; x < w - 12; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, 4);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(14, 30);
      ctx.lineTo(w - 14, h - 6);
      ctx.stroke();
      ctx.fillStyle = "#d9a21b";
      ctx.beginPath();
      ctx.arc(w - 20, 40, 3.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f3eee0";
      ctx.fillRect(18, 10, w - 36, 12);
      ctx.strokeRect(18, 10, w - 36, 12);
      label(ctx, "CABIN", w / 2, 16, 8);
      border(ctx, w, h);
    },
    /* Log walls for the cabin, with a boarded window variant. */
    house(ctx, w, h) {
      logs(ctx, w, h);
      border(ctx, w, h);
    },
    houseWindow(ctx, w, h) {
      logs(ctx, w, h);
      ctx.fillStyle = "#2b3540";
      ctx.fillRect(16, 14, 32, 26);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(16, 14, 32, 26);
      ctx.fillStyle = "rgba(255,230,160,0.35)";
      ctx.fillRect(18, 16, 13, 11);
      ctx.beginPath();
      ctx.moveTo(32, 14);
      ctx.lineTo(32, 40);
      ctx.moveTo(16, 27);
      ctx.lineTo(48, 27);
      ctx.stroke();
      ctx.fillStyle = "#8a6a46";
      ctx.save();
      ctx.translate(32, 27);
      ctx.rotate(-0.28);
      ctx.fillRect(-22, -4, 44, 8);
      ctx.strokeRect(-22, -4, 44, 8);
      ctx.restore();
      // shutters
      ctx.fillStyle = "#5b4a3a";
      ctx.fillRect(9, 12, 6, 30);
      ctx.strokeRect(9, 12, 6, 30);
      ctx.fillRect(49, 12, 6, 30);
      ctx.strokeRect(49, 12, 6, 30);
      border(ctx, w, h);
    },
    /* Vertical planks: the triangle under the roof on the cabin's end walls. */
    gable(ctx, w, h) {
      ctx.fillStyle = "#7a6248";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 2;
      for (let x = 7; x < w; x += 9) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      halftone(ctx, w, h, 0.08);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, h);
      ctx.moveTo(w, 0);
      ctx.lineTo(w, h);
      ctx.stroke();
    },
    /* Shingles for the cabin roof. */
    roof(ctx, w, h) {
      ctx.fillStyle = "#6e3b2e";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      for (let y = 0; y < h; y += 10) {
        const off = ((y / 10) % 2) * 8;
        ctx.fillStyle = (y / 10) % 2 ? "#7a4536" : "#62342a";
        ctx.fillRect(0, y, w, 10);
        ctx.beginPath();
        ctx.moveTo(0, y + 10);
        ctx.lineTo(w, y + 10);
        ctx.stroke();
        for (let x = off; x < w; x += 16) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 10);
          ctx.stroke();
        }
      }
      halftone(ctx, w, h, 0.1);
    },
    /* Interior door (closed): panels and a handle. Seen from both sides. */
    doorClosed(ctx, w, h) {
      ctx.fillStyle = "#6b4a3a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8a6a46";
      ctx.fillRect(6, 4, w - 12, h - 4);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 4, w - 12, h - 4);
      ctx.lineWidth = 2;
      ctx.fillStyle = "#7a5a3c";
      ctx.fillRect(13, 10, w - 26, 18);
      ctx.strokeRect(13, 10, w - 26, 18);
      ctx.fillRect(13, 34, w - 26, 24);
      ctx.strokeRect(13, 34, w - 26, 24);
      ctx.fillStyle = "#9ea3aa";
      ctx.beginPath();
      ctx.arc(w - 14, 34, 3.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
      halftone(ctx, w, h, 0.06);
      border(ctx, w, h);
    },
    /* The van, one tile per texture: cab half, body half, nose, tail. Drawn for a tile 0.8 high. */
    van(ctx, w, h) {
      TEX.vanBody(ctx, w, h);
    },
    vanCab(ctx, w, h) {
      vanSideBase(ctx, w, h);
      // cab window and door
      ctx.fillStyle = "#2b3540";
      ctx.fillRect(10, 8, 30, 18);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(10, 8, 30, 18);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(13, 10, 8, 12);
      ctx.beginPath();
      ctx.moveTo(8, 30);
      ctx.lineTo(8, 46);
      ctx.moveTo(42, 6);
      ctx.lineTo(42, 46);
      ctx.stroke();
      ctx.fillStyle = "#9ea3aa";
      ctx.fillRect(34, 32, 6, 3);
      ctx.strokeRect(34, 32, 6, 3);
      // mirror
      ctx.fillStyle = "#2f3136";
      ctx.fillRect(2, 14, 6, 8);
      ctx.strokeRect(2, 14, 6, 8);
      wheel(ctx, 20, h - 7);
      border(ctx, w, h);
    },
    vanBody(ctx, w, h) {
      vanSideBase(ctx, w, h);
      // sliding door with a small window and the unit number
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(6, 6, 30, 40);
      ctx.fillStyle = "#2b3540";
      ctx.fillRect(10, 9, 22, 12);
      ctx.strokeRect(10, 9, 22, 12);
      ctx.fillStyle = "#9ea3aa";
      ctx.fillRect(8, 30, 7, 3);
      ctx.strokeRect(8, 30, 7, 3);
      ctx.fillStyle = "#f3eee0";
      ctx.fillRect(40, 24, 20, 12);
      ctx.strokeRect(40, 24, 20, 12);
      label(ctx, "B-66", 50, 30, 9);
      wheel(ctx, 44, h - 7);
      border(ctx, w, h);
    },
    /* The same body seen from the other side: geometry unmirrored, lettering redrawn so it reads. */
    vanBodyR(ctx, w, h) {
      TEX.vanBody(ctx, w, h);
      ctx.fillStyle = "#f3eee0";
      ctx.fillRect(40, 24, 20, 12);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(40, 24, 20, 12);
      ctx.save();
      ctx.translate(50, 0);
      ctx.scale(-1, 1);
      label(ctx, "B-66", 0, 30, 9);
      ctx.restore();
    },
    vanFront(ctx, w, h) {
      vanEndBase(ctx, w, h);
      // windshield
      ctx.fillStyle = "#2b3540";
      ctx.fillRect(10, 6, w - 20, 16);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(10, 6, w - 20, 16);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(13, 8, 10, 11);
      // grille and lights
      ctx.fillStyle = "#2f3136";
      ctx.fillRect(20, 28, w - 40, 10);
      ctx.strokeRect(20, 28, w - 40, 10);
      ctx.fillStyle = "#ffe9a6";
      [[12, 33], [w - 12, 33]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, TAU);
        ctx.fill();
        ctx.stroke();
      });
      // bumper
      ctx.fillStyle = "#9ea3aa";
      ctx.fillRect(4, 42, w - 8, 6);
      ctx.strokeRect(4, 42, w - 8, 6);
      border(ctx, w, h);
    },
    vanBack(ctx, w, h) {
      vanEndBase(ctx, w, h);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      // two rear doors with windows
      ctx.strokeRect(8, 6, w - 16, 36);
      ctx.beginPath();
      ctx.moveTo(w / 2, 6);
      ctx.lineTo(w / 2, 42);
      ctx.stroke();
      ctx.fillStyle = "#2b3540";
      ctx.fillRect(12, 9, 18, 11);
      ctx.strokeRect(12, 9, 18, 11);
      ctx.fillRect(w - 30, 9, 18, 11);
      ctx.strokeRect(w - 30, 9, 18, 11);
      ctx.fillStyle = "#9ea3aa";
      ctx.fillRect(w / 2 - 7, 26, 5, 3);
      ctx.fillRect(w / 2 + 2, 26, 5, 3);
      // tail lights, plate, bumper
      ctx.fillStyle = "#b3261e";
      ctx.fillRect(4, 30, 6, 8);
      ctx.strokeRect(4, 30, 6, 8);
      ctx.fillRect(w - 10, 30, 6, 8);
      ctx.strokeRect(w - 10, 30, 6, 8);
      ctx.fillStyle = "#f3eee0";
      ctx.fillRect(w / 2 - 9, 33, 18, 8);
      ctx.strokeRect(w / 2 - 9, 33, 18, 8);
      ctx.fillStyle = "#9ea3aa";
      ctx.fillRect(4, 42, w - 8, 6);
      ctx.strokeRect(4, 42, w - 8, 6);
      border(ctx, w, h);
    },
    /* The treeline: canopy on top, trunks below (drawn 1.45 tiles high). */
    tree(ctx, w, h) {
      ctx.fillStyle = "#2f3a2a";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.fillStyle = "#3f5236";
      [[12, 14, 15], [34, 10, 17], [54, 16, 14], [22, 30, 13], [46, 32, 12]].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        ctx.stroke();
      });
      ctx.fillStyle = "#56693f";
      [[14, 10, 7], [36, 6, 8], [52, 12, 6]].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      });
      ctx.strokeStyle = "#1a2218";
      ctx.lineWidth = 4;
      [10, 32, 52].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x + 2, 34);
        ctx.stroke();
      });
      halftone(ctx, w, h, 0.14);
      border(ctx, w, h);
    },
    fence(ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#8a6a46";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      for (let x = 2; x < w; x += 16) {
        ctx.fillRect(x, 4, 11, h - 4);
        ctx.strokeRect(x, 4, 11, h - 4);
        ctx.beginPath();
        ctx.moveTo(x, 4);
        ctx.lineTo(x + 5.5, 0);
        ctx.lineTo(x + 11, 4);
        ctx.stroke();
      }
      ctx.fillStyle = "#6b5a46";
      ctx.fillRect(0, 18, w, 7);
      ctx.strokeRect(0, 18, w, 7);
      ctx.fillRect(0, 44, w, 7);
      ctx.strokeRect(0, 44, w, 7);
    },
    fenceCracked(ctx, w, h) {
      TEX.fence(ctx, w, h);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, 2);
      ctx.lineTo(26, 20);
      ctx.lineTo(18, 34);
      ctx.lineTo(28, 52);
      ctx.moveTo(44, 6);
      ctx.lineTo(40, 28);
      ctx.lineTo(48, 46);
      ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(34, 0, 12, 24);
    },
  };

  /** A 64 x 64 wall face. `opts` (optional, plain data) reaches the drawing function and is part of the cache key. */
  function texture(kind, palette, opts) {
    // the van textures take their colors from the current paint job
    const paint = kind.startsWith("van") ? ":" + vanLook().body : "";
    const p = palette || {};
    const key = "tex:" + kind + ":" + p.wall + p.shelf + p.counter + p.wallStyle + p.table + paint + (opts ? JSON.stringify(opts) : "");
    return cached(key, 64, 64, (ctx, w, h) => (TEX[kind] || TEX.wall)(ctx, w, h, p, opts || {}));
  }
  /** Add a wall face: fn(ctx, w, h, palette, opts) draws into 64 x 64. Replaces one of the same name. */
  function registerTexture(name, fn) {
    TEX[name] = fn;
    for (const k of cache.keys()) if (k.startsWith("tex:" + name + ":")) cache.delete(k);
  }
  function hasTexture(name) {
    return Object.prototype.hasOwnProperty.call(TEX, name);
  }

  /* ---------- Floors and ceilings: 64 x 64 per tile, cast as raw pixels ----------
     Each kind draws with palette.floor as its base, or palette.ceiling when opts.ceiling is set,
     so the same catalog dresses every building in its own colors. */
  const FLOORS = {};
  const FLOOR_IDS = [];
  function speckle(ctx, w, h, seed, n, colors, size) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), size, size);
    }
  }
  const FLOOR_KINDS = {
    /* Big square tiles with grout. */
    tile(ctx, w, h, b) {
      ctx.fillStyle = shade(b, -30);
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) {
        ctx.fillStyle = shade(b, (x + y) % 64 ? 6 : 14);
        ctx.fillRect(x + 1.5, y + 1.5, 29, 29);
        ctx.fillStyle = "rgba(255,255,255,0.14)";
        ctx.fillRect(x + 3, y + 3, 12, 2);
      }
      halftone(ctx, w, h, 0.06);
    },
    /* Black and white diner checks, tinted toward the floor color. */
    checker(ctx, w, h, b) {
      for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = (x + y) % 32 ? mix(b, "#1c1d20", 0.6) : mix(b, "#e8e2d2", 0.6);
        ctx.fillRect(x, y, 16, 16);
      }
      halftone(ctx, w, h, 0.05);
    },
    /* Sheet flooring: flecks and one seam. */
    linoleum(ctx, w, h, b) {
      ctx.fillStyle = b;
      ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, 3, 90, [shade(b, 22), shade(b, -22), shade(b, 12)], 2);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, w, 1.5);
      halftone(ctx, w, h, 0.05);
    },
    /* Office carpet: dense flecks and a small repeating diamond. */
    carpet(ctx, w, h, b) {
      ctx.fillStyle = b;
      ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, 5, 400, [shade(b, 12), shade(b, -14)], 1);
      ctx.fillStyle = shade(b, -22);
      for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, y - 4);
        ctx.lineTo(x + 4, y);
        ctx.lineTo(x, y + 4);
        ctx.lineTo(x - 4, y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = shade(b, 18);
      for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) ctx.fillRect(x, y, 2, 2);
    },
    /* Narrow hardwood boards with staggered joints. */
    wood(ctx, w, h, b) {
      const r = rng(31);
      const base = mix(b, "#8a6240", 0.65);
      for (let y = 0; y < h; y += 8) {
        ctx.fillStyle = shade(base, Math.round(r() * 22 - 11));
        ctx.fillRect(0, y, w, 8);
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0, y + 7, w, 1);
        const j = Math.floor(r() * 48) + 8;
        ctx.fillRect(j, y, 1.5, 8);
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(Math.floor(r() * w), y + 3, 14, 1);
      }
      halftone(ctx, w, h, 0.05);
    },
    /* Poured slab: stains, an expansion joint and a crack. */
    concrete(ctx, w, h, b) {
      ctx.fillStyle = mix(b, "#7d7c76", 0.3);
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.ellipse(40, 22, 14, 9, 0.4, 0, TAU);
      ctx.fill();
      speckle(ctx, w, h, 9, 50, ["rgba(0,0,0,0.18)", "rgba(255,255,255,0.12)"], 2);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, w, 1.5);
      ctx.fillRect(0, 0, 1.5, h);
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, 50);
      ctx.lineTo(20, 44);
      ctx.lineTo(24, 52);
      ctx.lineTo(34, 47);
      ctx.stroke();
    },
    /* Packed dirt with pebbles. */
    dirt(ctx, w, h, b) {
      ctx.fillStyle = mix(b, "#6e5236", 0.7);
      ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, 13, 70, ["#4f3b27", "#8a6c4a", "#5e4630"], 3);
      speckle(ctx, w, h, 17, 12, ["#a39a88"], 2);
      halftone(ctx, w, h, 0.08);
    },
    /* Steel floor grate: diamond mesh over a dark pit. */
    grate(ctx, w, h, b) {
      ctx.fillStyle = "#1a1c1e";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = mix(b, "#8f969c", 0.6);
      ctx.lineWidth = 3;
      for (let k = -64; k < 128; k += 16) {
        ctx.beginPath();
        ctx.moveTo(k, 0);
        ctx.lineTo(k + 64, 64);
        ctx.moveTo(k + 64, 0);
        ctx.lineTo(k, 64);
        ctx.stroke();
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, w, h);
    },
    /* Grass: tufts of blades in two greens. */
    grass(ctx, w, h, b) {
      const r = rng(41);
      ctx.fillStyle = mix(b, "#5f7a3a", 0.7);
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 70; i++) {
        const x = r() * w;
        const y = r() * h;
        ctx.strokeStyle = i % 3 ? "#4a6230" : "#7f9a4c";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + r() * 3 - 1.5, y - 4);
        ctx.stroke();
      }
      halftone(ctx, w, h, 0.06);
    },
    /* Gravel: packed small stones. */
    gravel(ctx, w, h, b) {
      const r = rng(43);
      ctx.fillStyle = mix(b, "#77746c", 0.6);
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle = ["#9a968c", "#4e4b46", "#b3aea2", "#6f6b62"][i % 4];
        ctx.beginPath();
        ctx.ellipse(r() * w, r() * h, 1 + r() * 1.4, 0.8 + r(), r() * 3, 0, TAU);
        ctx.fill();
      }
      halftone(ctx, w, h, 0.08);
    },
    /* Wide rough boards with nail heads (decks, walkways, barns). */
    planks(ctx, w, h, b) {
      const r = rng(47);
      const base = mix(b, "#8a6a46", 0.7);
      for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = shade(base, Math.round(r() * 26 - 13));
        ctx.fillRect(x, 0, 16, h);
        ctx.fillStyle = INK;
        ctx.fillRect(x, 0, 2, h);
        ctx.fillStyle = "#2f3136";
        ctx.fillRect(x + 7, 4, 2, 2);
        ctx.fillRect(x + 7, 58, 2, 2);
      }
      halftone(ctx, w, h, 0.07);
    },
    /* Ceiling: drop-ceiling panels in a metal grid. */
    panels(ctx, w, h, b) {
      ctx.fillStyle = shade(b, 34);
      ctx.fillRect(0, 0, w, h);
      speckle(ctx, w, h, 19, 60, ["rgba(0,0,0,0.25)"], 1);
      ctx.fillStyle = shade(b, 8);
      ctx.fillRect(0, 0, w, 3);
      ctx.fillRect(0, 0, 3, h);
      ctx.fillRect(0, 31, w, 2);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(40, 8, 10, 6);
    },
    /* Ceiling: heavy dark beams over boards. */
    beams(ctx, w, h, b) {
      ctx.fillStyle = shade(b, 18);
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      for (let y = 8; y < h; y += 8) ctx.fillRect(0, y, w, 1);
      ctx.fillStyle = "#3d2f22";
      ctx.fillRect(0, 22, w, 20);
      ctx.fillStyle = INK;
      ctx.fillRect(0, 21, w, 2);
      ctx.fillRect(0, 41, w, 2);
    },
    /* Ceiling: exposed pipes and conduit. */
    pipes(ctx, w, h, b) {
      ctx.fillStyle = shade(b, 10);
      ctx.fillRect(0, 0, w, h);
      [[12, 6, "#8f969c"], [40, 9, "#7a5a3c"], [54, 4, "#b3261e"]].forEach(([y, r, c]) => {
        ctx.fillStyle = INK;
        ctx.fillRect(0, y - r - 1, w, r * 2 + 2);
        ctx.fillStyle = c;
        ctx.fillRect(0, y - r, w, r * 2);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(0, y - r + 1, w, 2);
      });
      ctx.fillStyle = INK;
      ctx.fillRect(30, 2, 4, 50);
    },
  };
  /** Add a floor or ceiling kind: fn(ctx, w, h, palette, { ceiling }) draws into 64 x 64. */
  function registerFloor(name, fn) {
    if (!Object.prototype.hasOwnProperty.call(FLOORS, name)) FLOOR_IDS.push(name);
    FLOORS[name] = fn;
    for (const k of texels.keys()) if (k.startsWith(name + "|")) texels.delete(k);
  }
  /** Stable small number for a floor kind (what `floorKind` arrays hold); -1 when unknown. */
  function floorId(name) {
    return FLOOR_IDS.indexOf(name);
  }
  const SHADES = 16; // pre-darkened copies per kind
  const SHADE_MAX = 0.9; // darkness of the last copy
  const texels = new Map();
  /** A floor kind (by id or name) as pixels: SHADES Uint32Arrays of 64 x 64, from full light to SHADE_MAX dark. */
  function floorTexels(kind, palette, ceiling) {
    const name = typeof kind === "number" ? FLOOR_IDS[kind] : kind;
    const p = palette || {};
    const key = name + "|" + (ceiling ? "c" : "f") + p.floor + p.ceiling;
    let t = texels.get(key);
    if (t) return t;
    const fn = FLOORS[name] || FLOORS.concrete;
    const c = make(64, 64, (ctx, w, h) => fn(ctx, w, h, p, { ceiling: !!ceiling }));
    const src = new Uint32Array(c.getContext("2d").getImageData(0, 0, 64, 64).data.buffer.slice(0));
    t = [];
    for (let k = 0; k < SHADES; k++) {
      const f = 1 - (k / (SHADES - 1)) * SHADE_MAX;
      const out = new Uint32Array(4096);
      for (let i = 0; i < 4096; i++) {
        const v = src[i];
        out[i] = 0xff000000 | ((((v >> 16) & 255) * f) << 16) | ((((v >> 8) & 255) * f) << 8) | ((v & 255) * f);
      }
      t.push(out);
    }
    texels.set(key, t);
    return t;
  }
  Object.keys(FLOOR_KINDS).forEach((name) =>
    registerFloor(name, (ctx, w, h, p, o) => FLOOR_KINDS[name](ctx, w, h, (o.ceiling ? p.ceiling : p.floor) || "#55565a"))
  );

  /* ---------- Named sprites (props, landmarks): registered by other modules ---------- */
  const SPRITES = {};
  /** Add a sprite: fn(ctx, w, h, opts) draws into w x h (bottom edge = the ground). */
  function registerSprite(name, w, h, fn) {
    SPRITES[name] = { w, h, fn };
    for (const k of cache.keys()) if (k.startsWith("spr:" + name + ":")) cache.delete(k);
  }
  function hasSprite(name) {
    return Object.prototype.hasOwnProperty.call(SPRITES, name);
  }
  /** A registered sprite, cached by name and options; null when the name is unknown. */
  function sprite(name, opts) {
    const s = SPRITES[name];
    if (!s) return null;
    return cached("spr:" + name + ":" + (opts ? JSON.stringify(opts) : ""), s.w, s.h, (ctx, w, h) => s.fn(ctx, w, h, opts || {}));
  }
  /* Stand-in for a landmark whose art is not drawn yet: a crate stack with a sign naming it
     (placeholderWide: a row of crates, for a big landmark drawn across its footprint). */
  function placeholder(ctx, w, h, o) {
    const c = o.color || "#d9a21b";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 5, w / 2 - 8, 6, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = shade(c, -40);
    for (let x0 = 14; x0 + 100 <= w - 14 + 0.5; x0 += w > 128 ? (w - 128) / 2 : 1e9) {
      ctx.fillRect(x0, 70, 100, 54);
      ctx.strokeRect(x0, 70, 100, 54);
      ctx.beginPath();
      ctx.moveTo(x0, 70);
      ctx.lineTo(x0 + 100, 124);
      ctx.moveTo(x0 + 100, 70);
      ctx.lineTo(x0, 124);
      ctx.stroke();
    }
    const sw = Math.min(w - 8, 200);
    const sx = (w - sw) / 2;
    ctx.fillStyle = "#f3eee0";
    ctx.fillRect(sx, 8, sw, 56);
    ctx.strokeRect(sx, 8, sw, 56);
    ctx.fillStyle = c;
    ctx.fillRect(sx, 8, sw, 10);
    ctx.strokeRect(sx, 8, sw, 10);
    const per = w > 128 ? 20 : 12; // letters per sign line
    const words = String(o.name || "?").toUpperCase().split(/\s+/);
    const lines = [""];
    words.forEach((wd) => {
      const cur = lines[lines.length - 1];
      if (cur && (cur + " " + wd).length > per) lines.push(wd);
      else lines[lines.length - 1] = cur ? cur + " " + wd : wd;
    });
    const n = Math.min(3, lines.length);
    const size = n > 2 ? 12 : 15;
    for (let i = 0; i < n; i++) label(ctx, lines[i], w / 2, 41 + (i - (n - 1) / 2) * (size + 2), size);
  }
  registerSprite("placeholder", 128, 128, placeholder);
  registerSprite("placeholderWide", 384, 128, placeholder);

  /** A darker copy of a sprite or texture (alpha kept), level 1..8 = 10%..80% darker. Cached per image. */
  const dimmed = new WeakMap();
  function dim(img, level) {
    const k = Math.max(0, Math.min(8, level | 0));
    if (!k) return img;
    let set = dimmed.get(img);
    if (!set) dimmed.set(img, (set = []));
    if (!set[k]) {
      set[k] = make(img.width, img.height, (ctx) => {
        ctx.drawImage(img, 0, 0);
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = "rgba(0,0,0," + (k * 0.1).toFixed(2) + ")";
        ctx.fillRect(0, 0, img.width, img.height);
      });
    }
    return set[k];
  }

  /* ---------- Traps on the ground (64 x 40) ---------- */
  function trap(kind, spent) {
    return cached("trap:" + kind + ":" + (spent ? 1 : 0), 64, 40, (ctx, w, h) => {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(w / 2, h - 5, 29, 5, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      if (kind === "spike") {
        ctx.fillStyle = "#8a5a2e";
        ctx.fillRect(4, h - 16, w - 8, 10);
        ctx.strokeRect(4, h - 16, w - 8, 10);
        ctx.fillStyle = "#c9ccd2";
        for (let x = 9; x < w - 6; x += 9) {
          ctx.beginPath();
          ctx.moveTo(x, h - 16);
          ctx.lineTo(x + 3, h - 32);
          ctx.lineTo(x + 6, h - 16);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = "#b3261e";
        ctx.fillRect(18, h - 30, 28, 24);
        ctx.strokeRect(18, h - 30, 28, 24);
        ctx.fillStyle = "#f3eee0";
        ctx.fillRect(22, h - 24, 20, 8);
        ctx.strokeRect(22, h - 24, 20, 8);
        label(ctx, "TNT", 32, h - 20, 7);
        ctx.strokeStyle = "#c08f1a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(4, h - 8);
        ctx.lineTo(18, h - 12);
        ctx.moveTo(46, h - 12);
        ctx.lineTo(60, h - 8);
        ctx.stroke();
        ctx.fillStyle = "#ffe08a";
        ctx.beginPath();
        ctx.arc(32, h - 34, 3, 0, TAU);
        ctx.fill();
      }
      if (spent) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0, 0, w, h);
      }
    });
  }

  /* ---------- Walker sprites (front view, 96 x 128) ---------- */
  const LOOK = {
    walker: { skin: "#8d9a84", shirt: "#4d525a", pants: "#2f3136", hair: "#2a2d2a" },
    runner: { skin: "#9aa392", shirt: "#2f3340", pants: "#23262c", hair: "#1f2226", hood: true },
    brute: { skin: "#6f7a6a", shirt: "#3a3d42", pants: "#2a2c30", hair: "#1c1e1c" },
  };

  function walker(type, frame, hit) {
    return cached("walker:" + type + ":" + frame + ":" + (hit ? 1 : 0), 96, 128, (ctx, w, h) => {
      const L = LOOK[type] || LOOK.walker;
      const big = type === "brute" ? 1.18 : type === "runner" ? 0.92 : 1;
      const swing = frame ? 1 : -1;
      ctx.save();
      ctx.translate(w / 2, h);
      ctx.scale(big, big);
      ctx.lineJoin = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = INK;
      // legs
      ctx.fillStyle = L.pants;
      [[-12, swing * 3], [12, -swing * 3]].forEach(([x, dy]) => {
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x - 8, -46 + dy, 16, 46 - dy, 4) : ctx.rect(x - 8, -46 + dy, 16, 46 - dy);
        ctx.fill();
        ctx.stroke();
      });
      // torso
      ctx.fillStyle = L.shirt;
      ctx.beginPath();
      ctx.moveTo(-24, -92);
      ctx.lineTo(24, -92);
      ctx.lineTo(22, -44);
      ctx.lineTo(-22, -44);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // torn hem
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.moveTo(-22, -50);
      ctx.lineTo(-14, -56);
      ctx.lineTo(-6, -48);
      ctx.lineTo(4, -57);
      ctx.lineTo(14, -49);
      ctx.lineTo(22, -55);
      ctx.lineTo(22, -44);
      ctx.lineTo(-22, -44);
      ctx.closePath();
      ctx.fill();
      // arms reaching toward the viewer (foreshortened: big hands low)
      ctx.fillStyle = L.skin;
      [[-1, swing], [1, -swing]].forEach(([s, sw]) => {
        const hx = s * 20;
        const hy = -60 + sw * 4;
        ctx.beginPath();
        ctx.moveTo(s * 24, -88);
        ctx.lineTo(hx, hy);
        ctx.lineWidth = 12;
        ctx.strokeStyle = INK;
        ctx.stroke();
        ctx.lineWidth = 8;
        ctx.strokeStyle = L.skin;
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = INK;
        ctx.beginPath();
        ctx.arc(hx, hy, 11, 0, TAU);
        ctx.fill();
        ctx.stroke();
        // fingers
        for (let f = -1; f <= 1; f++) {
          ctx.beginPath();
          ctx.moveTo(hx + f * 5, hy + 8);
          ctx.lineTo(hx + f * 7, hy + 16);
          ctx.stroke();
        }
      });
      // head
      ctx.fillStyle = hit ? "#ffffff" : L.skin;
      ctx.beginPath();
      ctx.arc(0, -108, 18, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (L.hood) {
        ctx.fillStyle = L.shirt;
        ctx.beginPath();
        ctx.arc(0, -108, 21, Math.PI * 0.95, Math.PI * 2.05);
        ctx.lineTo(16, -94);
        ctx.lineTo(-16, -94);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = L.hair;
        ctx.beginPath();
        ctx.moveTo(-18, -112);
        ctx.lineTo(-12, -126);
        ctx.lineTo(-2, -118);
        ctx.lineTo(6, -128);
        ctx.lineTo(14, -116);
        ctx.lineTo(18, -110);
        ctx.closePath();
        ctx.fill();
      }
      // eyes and mouth
      ctx.fillStyle = "#1a1c1e";
      ctx.beginPath();
      ctx.ellipse(-7, -110, 5, 4, 0, 0, TAU);
      ctx.ellipse(7, -110, 5, 4, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#d8dcc8";
      ctx.beginPath();
      ctx.arc(-6, -110, 1.5, 0, TAU);
      ctx.arc(8, -110, 1.5, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-6, -98);
      ctx.lineTo(6, -98);
      ctx.stroke();
      if (hit) {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = "#fff";
        ctx.fillRect(-40, -130, 80, 130);
      }
      ctx.restore();
    });
  }

  /* ---------- Items, notes, scrap (64 x 64) ---------- */
  function item(key) {
    const it = ZSR.WORLD.ITEMS[key] || { code: "????", color: "#888" };
    return cached("item:" + key, 64, 64, (ctx, w, h) => {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(w / 2, h - 6, 26, 6, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = it.color;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.rect(10, 14, 44, 40);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(14, 30, 36, 14);
      ctx.strokeRect(14, 30, 36, 14);
      label(ctx, it.code, w / 2, 37, 11);
      // lid
      ctx.fillStyle = shade(it.color, -30);
      ctx.fillRect(10, 14, 44, 8);
      ctx.strokeRect(10, 14, 44, 8);
    });
  }
  function note() {
    return cached("note", 48, 48, (ctx, w, h) => {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-0.15);
      ctx.fillStyle = "#f3eee0";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.fillRect(-14, -18, 28, 36);
      ctx.strokeRect(-14, -18, 28, 36);
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 1.5;
      for (let y = -10; y < 14; y += 6) {
        ctx.beginPath();
        ctx.moveTo(-9, y);
        ctx.lineTo(9, y);
        ctx.stroke();
      }
      ctx.restore();
      // "!" badge so it reads as interactable
      ctx.fillStyle = "#d9a21b";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(38, 10, 8, 0, TAU);
      ctx.fill();
      ctx.stroke();
      label(ctx, "!", 38, 11, 12);
    });
  }
  function scrap() {
    return cached("scrap", 64, 48, (ctx, w, h) => {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(w / 2, h - 5, 28, 5, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      [["#6e7278", 8, 20, 22, 16], ["#9ea3aa", 26, 12, 18, 22], ["#4b5057", 40, 24, 16, 14], ["#d9a21b", 18, 8, 12, 10]].forEach(([c, x, y, rw, rh]) => {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, rw, rh);
        ctx.strokeRect(x, y, rw, rh);
      });
    });
  }

  /* ---------- Weapon and crosshair, drawn directly ---------- */
  function gun(ctx, W, H, opts) {
    const bob = opts.bob || 0;
    const flash = opts.flash || 0;
    const s = Math.min(W, H) / 420;
    ctx.save();
    ctx.translate(W * 0.68 + Math.sin(bob) * 6 * s, H + Math.abs(Math.cos(bob)) * 8 * s - flash * 10);
    ctx.scale(s, s);
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    // forearm
    ctx.fillStyle = "#c9a27a";
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(100, -90);
    ctx.lineTo(150, -70);
    ctx.lineTo(130, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // sleeve
    ctx.fillStyle = "#5f6b3c";
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(70, -50);
    ctx.lineTo(140, -20);
    ctx.lineTo(140, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // pistol body
    ctx.fillStyle = "#2f3136";
    ctx.beginPath();
    ctx.moveTo(70, -120);
    ctx.lineTo(70, -220);
    ctx.lineTo(100, -220);
    ctx.lineTo(104, -150);
    ctx.lineTo(120, -150);
    ctx.lineTo(120, -120);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // slide
    ctx.fillStyle = "#4b5057";
    ctx.fillRect(62, -236, 44, 24);
    ctx.strokeRect(62, -236, 44, 24);
    // hand on grip
    ctx.fillStyle = "#c9a27a";
    ctx.beginPath();
    ctx.arc(96, -135, 26, 0, TAU);
    ctx.fill();
    ctx.stroke();
    if (flash > 0) {
      ctx.globalAlpha = Math.min(1, flash * 10);
      ZSR.Draw.star(ctx, 84, -262, 8, 30 + flash * 100, 12, flash * 40);
      ctx.fillStyle = "#ffe9a6";
      ctx.fill();
      ctx.strokeStyle = "#d9a21b";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  function crosshair(ctx, cx, cy, hot) {
    ctx.save();
    ctx.strokeStyle = hot ? "#b3261e" : "#f3eee0";
    ctx.lineWidth = 3;
    ctx.shadowColor = INK;
    ctx.shadowBlur = 0;
    [[-14, 0, -5, 0], [5, 0, 14, 0], [0, -14, 0, -5], [0, 5, 0, 14]].forEach(([a, b, c, d]) => {
      ctx.beginPath();
      ctx.moveTo(cx + a, cy + b);
      ctx.lineTo(cx + c, cy + d);
      ctx.stroke();
    });
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  ZSR.Draw3 = {
    texture, walker, item, note, scrap, trap, gun, crosshair, shade, mix, rng, label, halftone, border,
    // registration API for other modules (decor, landmarks, yard builds)
    registerTexture, hasTexture, registerSprite, hasSprite, sprite, registerFloor, floorId, floorTexels, wallBase, dim,
    WALL_STYLES: Object.keys(WALL_STYLES), SHADES, SHADE_MAX, INK,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
