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
    /* A printed sign on the wall: a board with a red header and lines of text (read it up close). */
    readSign(ctx, w, h, p) {
      TEX.wall(ctx, w, h, p);
      ctx.fillStyle = "#f3eee0";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.fillRect(10, 12, w - 20, 34);
      ctx.strokeRect(10, 12, w - 20, 34);
      ctx.fillStyle = "#b3261e";
      ctx.fillRect(10, 12, w - 20, 9);
      ctx.strokeRect(10, 12, w - 20, 9);
      ctx.strokeStyle = "rgba(15,16,18,0.7)";
      ctx.lineWidth = 2;
      [26, 32, 38].forEach((y, i) => {
        ctx.beginPath();
        ctx.moveTo(15, y);
        ctx.lineTo(w - 15 - i * 7, y);
        ctx.stroke();
      });
      // two screws
      ctx.fillStyle = "#9ea3aa";
      [[13, 43], [w - 13, 43]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, TAU);
        ctx.fill();
      });
    },
    /* Survivor graffiti: a red R mark, a slashed count and drips. */
    readGraffiti(ctx, w, h, p) {
      TEX.wall(ctx, w, h, p);
      ctx.lineCap = "round";
      ctx.strokeStyle = "#b3261e";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(12, 46);
      ctx.lineTo(12, 14);
      ctx.quadraticCurveTo(30, 12, 26, 26);
      ctx.quadraticCurveTo(22, 32, 13, 30);
      ctx.lineTo(28, 46);
      ctx.stroke();
      ctx.strokeStyle = "#f3eee0";
      ctx.lineWidth = 3;
      [36, 42, 48].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, 18);
        ctx.lineTo(x, 34);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(33, 30);
      ctx.lineTo(53, 22);
      ctx.stroke();
      ctx.strokeStyle = "rgba(179,38,30,0.8)";
      ctx.lineWidth = 2;
      [[12, 46, 54], [28, 46, 52], [20, 14, 20]].forEach(([x, y0, y1]) => {
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
      });
      ctx.strokeStyle = "rgba(243,238,224,0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, 54);
      ctx.lineTo(50, 50);
      ctx.stroke();
      ctx.lineCap = "butt";
    },
    /* The stash door: a steel locker door with vents, a hasp and a padlock with a key mark. */
    stash(ctx, w, h) {
      ctx.fillStyle = "#3f5a4a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#56705e";
      ctx.fillRect(7, 4, w - 14, h - 4);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.strokeRect(7, 4, w - 14, h - 4);
      ctx.lineWidth = 2;
      for (let y = 10; y < 24; y += 4) {
        ctx.beginPath();
        ctx.moveTo(18, y);
        ctx.lineTo(w - 18, y);
        ctx.stroke();
      }
      ctx.fillStyle = "#9ea3aa";
      ctx.fillRect(w - 24, 34, 12, 6);
      ctx.strokeRect(w - 24, 34, 12, 6);
      ctx.fillStyle = "#d9a21b";
      ctx.fillRect(w - 26, 42, 14, 12);
      ctx.strokeRect(w - 26, 42, 14, 12);
      ctx.beginPath();
      ctx.arc(w - 19, 42, 5, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(w - 19, 47, 1.8, 0, TAU);
      ctx.fill();
      ctx.fillRect(w - 20, 47, 2, 4);
      // a painted key mark: the key ring
      ctx.strokeStyle = "#f3eee0";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(19, 42, 4, 0, TAU);
      ctx.moveTo(23, 42);
      ctx.lineTo(34, 42);
      ctx.moveTo(30, 42);
      ctx.lineTo(30, 46);
      ctx.moveTo(34, 42);
      ctx.lineTo(34, 46);
      ctx.stroke();
      halftone(ctx, w, h, 0.07);
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
    /* The van, one tile per texture: cab half, body half, nose, tail. Drawn for a tile 0.8 high.
       The nose is on the left of the side textures. The upgrades show: armor (a skirt of plates, mesh on
       the windows, plates over the door windows and the cab door), the ram plow on the nose, engine gear
       (roof rack, exhaust stack, snorkel, light bar) and the paint job's colors and decal. */
    /* The parked van is a 3D model (js/van3d.js through js/modelsprite.js); this plain panel only shows if that
       path is not loaded (a test that runs the engine without it). */
    van(ctx, w, h) {
      ctx.fillStyle = "#5b6b3a";
      ctx.fillRect(0, 0, w, h);
      border(ctx, w, h);
    },
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
  function texture(kind, palette, opts, res) {
    const p = palette || {};
    // res > 1: the same face drawn sharper, for a view that shows it large (the angled road camera's van)
    const r = res > 1 ? res : 1;
    const key = "tex:" + kind + ":" + p.wall + p.shelf + p.counter + p.wallStyle + p.table + (opts ? JSON.stringify(opts) : "") + (r > 1 ? "@" + r : "");
    return cached(key, 64 * r, 64 * r, (ctx) => {
      ctx.scale(r, r);
      (TEX[kind] || TEX.wall)(ctx, 64, 64, p, opts || {});
    });
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

  /* A seeded random sequence (the muzzle flash and smoke). The walkers are live 3D figures now (js/walker3d.js). */
  function seededRng(seed) {
    let s = seed * 9301 + 49297;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
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
  /* A stash key lying on the floor: brass, with a paper tag on a loop of string. */
  function key() {
    return cached("key", 48, 32, (ctx, w, h) => {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(w / 2, h - 4, 20, 3.5, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.fillStyle = "#d9a21b";
      ctx.beginPath();
      ctx.arc(12, 17, 7, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#2b2b26";
      ctx.beginPath();
      ctx.arc(12, 17, 2.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#d9a21b";
      ctx.fillRect(18, 15, 18, 5);
      ctx.strokeRect(18, 15, 18, 5);
      ctx.fillRect(28, 20, 3, 5);
      ctx.strokeRect(28, 20, 3, 5);
      ctx.fillRect(33, 20, 3, 4);
      ctx.strokeRect(33, 20, 3, 4);
      // the tag
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, 12);
      ctx.lineTo(4, 5);
      ctx.stroke();
      ctx.fillStyle = "#f3eee0";
      ctx.save();
      ctx.translate(6, 6);
      ctx.rotate(-0.4);
      ctx.fillRect(-4, -8, 12, 8);
      ctx.strokeRect(-4, -8, 12, 8);
      ctx.restore();
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

  /* ---------- Weapons in hand and the crosshair, drawn directly ----------
     Every weapon is a small 3D model (metres; x right, y up, z forward) placed in front of
     the eye by a rig: rolled, pitched and yawed about a pivot, moved out from the eye, and
     mirrored for a left hand. Prism faces are back-face culled and lit from over the left
     shoulder; arms, gloves and round bars are tubes. The pistol's gloved hand is two leather
     shapes laid on the grip (palm and thumb, then the fingers). */
  const GUN_LIGHT = (() => {
    const v = [-0.45, 0.8, -0.4];
    const m = Math.hypot(v[0], v[1], v[2]);
    return v.map((c) => c / m);
  })();
  const STEEL = [54, 57, 62];
  const POLYMER = [40, 41, 44];
  const GLOVE = [50, 45, 40];
  const CUFF = [33, 31, 29];
  const SLEEVE = [74, 82, 50];
  const GUNMETAL = [46, 48, 53];
  const OLIVE = [84, 90, 56];
  const OLIVE_DARK = [62, 67, 42];
  const WOOD = [128, 84, 48];
  const BRASS = [190, 150, 72];

  function rgb(c, k) {
    return "rgb(" + c.map((v) => Math.max(0, Math.min(255, Math.round(v * k)))).join(",") + ")";
  }
  function sub(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  /* The rig: projection and drawing helpers for one held weapon.
     o: { off: [x, y, z] from the eye, yaw, pitch, roll, pivot, mirror } */
  function rig(ctx, W, H, o) {
    const s = Math.min(W, H) / 420;
    const F = 400 * s;
    const cx = W / 2;
    const cy = H / 2;
    const off = o.off;
    const pivot = o.pivot || [0, 0, 0];
    const cp = Math.cos(o.pitch || 0);
    const sp = Math.sin(o.pitch || 0);
    const cw = Math.cos(o.yaw || 0);
    const sw = Math.sin(o.yaw || 0);
    const cr = Math.cos(o.roll || 0);
    const sr = Math.sin(o.roll || 0);
    const mx = o.mirror ? -1 : 1;
    const world = (p) => {
      const x0 = p[0] - pivot[0];
      const y0 = p[1] - pivot[1];
      const z = p[2] - pivot[2];
      const x = x0 * cr - y0 * sr; // roll first: the cant of a bow
      const y = x0 * sr + y0 * cr;
      const y1 = y * cp + z * sp;
      const z1 = -y * sp + z * cp;
      return [mx * (x * cw - z1 * sw + pivot[0] + off[0]), y1 + pivot[1] + off[1], x * sw + z1 * cw + pivot[2] + off[2]];
    };
    // when given, `bounds` grows to hold everything drawn (the crop of the cached picture at rest)
    const bounds = o.bounds || null;
    const grow = (x, y, r) => {
      if (x - r < bounds.x0) bounds.x0 = x - r;
      if (y - r < bounds.y0) bounds.y0 = y - r;
      if (x + r > bounds.x1) bounds.x1 = x + r;
      if (y + r > bounds.y1) bounds.y1 = y + r;
    };
    // anything that reaches back past the eye (a stock, a drawing arm) is pinned just in front of it
    const screen = (q) => {
      const z = Math.max(0.03, q[2]);
      const p = [cx + (F * q[0]) / z, cy - (F * q[1]) / z];
      if (bounds) grow(p[0], p[1], 3 * s);
      return p;
    };
    const P = (x, y, z) => screen(world([x, y, z]));
    const lineW = Math.max(1, 1.1 * s);
    const polygon = (pts) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
    };
    /* An extruded section: map(u, v, t) gives model coordinates, t is 0 or 1. Draws the
       visible faces, returns them (screen quads by face index) for decals. */
    const prism = (section, map, color, gloss) => {
      const n = section.length;
      const ring = (t) => section.map(([u, v]) => world(map(u, v, t)));
      const a = ring(0);
      const b = ring(1);
      const centre = [0, 0, 0];
      a.concat(b).forEach((p) => {
        centre[0] += p[0] / (2 * n);
        centre[1] += p[1] / (2 * n);
        centre[2] += p[2] / (2 * n);
      });
      const faces = [];
      for (let i = 0; i < n; i++) faces.push({ id: i, pts: [a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]] });
      faces.push({ id: "start", pts: a.slice().reverse() });
      faces.push({ id: "end", pts: b.slice() });
      const out = {};
      faces.forEach((f) => {
        const fc = f.pts.reduce((m, p) => [m[0] + p[0] / f.pts.length, m[1] + p[1] / f.pts.length, m[2] + p[2] / f.pts.length], [0, 0, 0]);
        let nrm = cross(sub(f.pts[1], f.pts[0]), sub(f.pts[2], f.pts[0]));
        const m = Math.hypot(nrm[0], nrm[1], nrm[2]) || 1;
        nrm = nrm.map((c) => c / m);
        if (dot(nrm, sub(fc, centre)) < 0) nrm = nrm.map((c) => -c);
        if (dot(nrm, fc) >= 0) return; // facing away from the eye
        const diffuse = Math.max(0, dot(nrm, GUN_LIGHT));
        const half = (() => {
          const v = [GUN_LIGHT[0] - fc[0] * 3, GUN_LIGHT[1] - fc[1] * 3, GUN_LIGHT[2] - fc[2] * 3];
          const hm = Math.hypot(v[0], v[1], v[2]);
          return v.map((c) => c / hm);
        })();
        const spec = Math.pow(Math.max(0, dot(nrm, half)), 24) * (gloss || 0);
        const k = 0.42 + diffuse * 0.75 + spec * 1.6;
        const sp2 = f.pts.map(screen);
        polygon(sp2);
        ctx.fillStyle = rgb(color, k);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.lineWidth = lineW;
        ctx.stroke();
        out[f.id] = sp2;
      });
      return out;
    };
    // a point inside a screen quad [p0 p1 p2 p3] by (a along p0->p1, b along p0->p3)
    const onQuad = (q, a, b) => {
      const top = [q[0][0] + (q[1][0] - q[0][0]) * a, q[0][1] + (q[1][1] - q[0][1]) * a];
      const bot = [q[3][0] + (q[2][0] - q[3][0]) * a, q[3][1] + (q[2][1] - q[3][1]) * a];
      return [top[0] + (bot[0] - top[0]) * b, top[1] + (bot[1] - top[1]) * b];
    };
    /* Arms, gloves, bars: tubes between 3D joints (radius in metres) drawn as one silhouette,
       outline first, then fill, then a sheen along the top. */
    const limbs = (parts, color) => {
      const tubes = parts.map(([joints, radius]) => {
        const q = joints.map(world);
        const t = { scr: q.map(screen), w: q.map((p) => (2 * radius * F) / Math.max(0.03, p[2])) };
        if (bounds) t.scr.forEach((p, i) => grow(p[0], p[1], t.w[i] / 2 + 3 * s));
        return t;
      });
      const pass = (style, grow, shift) => {
        ctx.strokeStyle = style;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        tubes.forEach((t) => {
          for (let i = 0; i < t.scr.length - 1; i++) {
            const w = (t.w[i] + t.w[i + 1]) / 2;
            ctx.lineWidth = Math.max(1, w * grow[0] + grow[1]);
            ctx.beginPath();
            ctx.moveTo(t.scr[i][0] + shift * w, t.scr[i][1] + shift * w);
            ctx.lineTo(t.scr[i + 1][0] + shift * w, t.scr[i + 1][1] + shift * w);
            ctx.stroke();
          }
        });
      };
      pass("#0d0e10", [1, 2.6 * s], 0);
      pass(rgb(color, 1), [1, 0], 0);
      pass("rgba(255,255,255,0.1)", [0.38, 0], -0.2);
    };
    const strokeLine = (pts, width, color) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };
    const box = (x0, x1, y0, y1, z0, z1, color, gloss) => prism([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], (u, v, t) => [u, v, z0 + t * (z1 - z0)], color, gloss == null ? 0.5 : gloss);
    // a round bar along z: an n-sided section of radius r about (x, y)
    const bar = (x, y, r, z0, z1, color, gloss, n) => {
      const k = n || 8;
      const sec = [];
      for (let i = 0; i < k; i++) {
        const a = (i / k) * TAU + Math.PI / k;
        sec.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
      }
      return prism(sec, (u, v, t) => [u, v, z0 + t * (z1 - z0)], color, gloss);
    };
    // an upright bar (a foregrip): an n-sided section of radius r about (x, z), from y0 to y1
    const vbar = (x, z, r, y0, y1, color, gloss, n) => {
      const k = n || 8;
      const sec = [];
      for (let i = 0; i < k; i++) {
        const a = (i / k) * TAU + Math.PI / k;
        sec.push([x + Math.cos(a) * r, z + Math.sin(a) * r]);
      }
      return prism(sec, (u, v, t) => [u, y0 + t * (y1 - y0), v], color, gloss);
    };
    // a side profile, points as (z, y), pushed out across x0..x1
    const slab = (profile, x0, x1, color, gloss) => prism(profile, (u, v, t) => [x0 + t * (x1 - x0), v, u], color, gloss);
    // a size in metres at a model point, in pixels
    const px = (m, p) => (m * F) / Math.max(0.03, world(p)[2]);
    // something drawn straight on the screen (a laser beam) still counts toward the bounds
    const mark = (x, y, r) => bounds && grow(x, y, r);
    return { s, F, cx, cy, off, world, screen, P, lineW, polygon, prism, onQuad, limbs, strokeLine, box, bar, vbar, slab, px, mark };
  }

  /* ---------- Mods you can see ----------
     Every tier of every mod changes the weapon in your hands (t: tiers 0..3 from tiers()).
       Pistol and double pistols: damage: a compensator, longer and with more ports each tier, a gold
         barrel at 3; range: the barrel's crown past the slide and fiber-optic sights, a long slide, a
         red-dot sight; fire rate: windows in the slide's side, front serrations and cuts in its top, a
         red slide release and trigger; accuracy: a laser under the frame, a light with a steel bezel,
         the laser on.
       Machine gun: damage: a ported brake, a fluted heavy barrel and a bigger brake, a boxy brake;
         range: a longer barrel, a scope, a longer barrel still and a sunshade; fire rate: a see-through
         magazine showing its rounds, two of them clamped together, an olive drum; accuracy: a tan
         handguard, foregrip and hand stop, a laser, the laser on and a cheek riser.
       Heavy machine gun: damage: a longer flash hider, a muzzle brake, a bigger brake and red-tipped
         rounds; range: a longer barrel, a scope, both longer; fire rate: a bigger ammo box with a
         yellow band, a perforated heat shield on the shroud, a copper shield and copper cooling rings;
         accuracy: a tan foregrip, hand stop and carry-handle wrap, a laser, the laser on and a red
         recoil pad.
       Bow: damage (broadheads): three blades, a carbon shaft, a big head on a brass collar; range
         (stronger limbs): a laminate stripe, thicker dark limbs, black glass limbs with white tips;
         fire rate (draw speed): string silencers, a quiver of three, five and a brass nocking point;
         accuracy (sight pins): a sight ring with one pin, three, five and a stabilizer. */
  const NO_MODS = { d: 0, r: 0, f: 0, a: 0 };
  /** A weapon's mods as tiers 0..3: { d: damage, r: range, f: rate, a: aim }. */
  function tiers(m) {
    if (!m) return NO_MODS;
    const t = (k) => Math.max(0, Math.min(3, m[k] | 0));
    return { d: t("damage"), r: t("range"), f: t("rate"), a: t("aim") };
  }
  const RED = [176, 40, 32];
  const GOLD = [200, 162, 72];
  const TAN = [158, 134, 96];
  const COPPER = [186, 112, 60];
  /* Ports and slots: dark quads on a prism face (a screen quad), each [a0, a1, b0, b1] along its two edges. */
  function slots(ctx, q, list) {
    if (!q) return;
    ctx.fillStyle = "rgba(8,9,10,0.88)";
    list.forEach(([a0, a1, b0, b1]) => {
      const pts = [rgOnQuad(q, a0, b0), rgOnQuad(q, a1, b0), rgOnQuad(q, a1, b1), rgOnQuad(q, a0, b1)];
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
      ctx.fill();
    });
  }
  function rgOnQuad(q, a, b) {
    const top = [q[0][0] + (q[1][0] - q[0][0]) * a, q[0][1] + (q[1][1] - q[0][1]) * a];
    const bot = [q[3][0] + (q[2][0] - q[3][0]) * a, q[3][1] + (q[2][1] - q[3][1]) * a];
    return [top[0] + (bot[0] - top[0]) * b, top[1] + (bot[1] - top[1]) * b];
  }
  /* A laser's red window on a module's near side, and (on) its beam to the crosshair, fading out. */
  function laser(ctx, rg, at, on) {
    const p = rg.P(...at);
    const r = Math.max(1.2, rg.px(0.0028, at));
    if (on) {
      const ex = p[0] + (rg.cx - p[0]) * 0.92;
      const ey = p[1] + (rg.cy - p[1]) * 0.92;
      rg.mark(ex, ey, 6 * rg.s);
      const g = ctx.createLinearGradient(p[0], p[1], ex, ey);
      g.addColorStop(0, "rgba(255,70,50,0.95)");
      g.addColorStop(1, "rgba(255,70,50,0.35)");
      ctx.strokeStyle = g;
      ctx.lineCap = "round";
      ctx.lineWidth = Math.max(1.5, 2 * rg.s);
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      // the dot where it lands, just short of the crosshair
      const dot = ctx.createRadialGradient(ex, ey, 0, ex, ey, 5 * rg.s);
      dot.addColorStop(0, "rgba(255,110,90,0.95)");
      dot.addColorStop(1, "rgba(255,40,30,0)");
      ctx.fillStyle = dot;
      ctx.fillRect(ex - 5 * rg.s, ey - 5 * rg.s, 10 * rg.s, 10 * rg.s);
      const glow = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 4);
      glow.addColorStop(0, "rgba(255,90,60,0.7)");
      glow.addColorStop(1, "rgba(255,60,40,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(p[0] - r * 4, p[1] - r * 4, r * 8, r * 8);
    }
    ctx.fillStyle = "#0b0b0c";
    ctx.beginPath();
    ctx.arc(p[0], p[1], r + rg.s, 0, TAU);
    ctx.fill();
    ctx.fillStyle = on ? "#ff6a52" : "#b3261e";
    ctx.beginPath();
    ctx.arc(p[0], p[1], r, 0, TAU);
    ctx.fill();
  }
  /* A scope on top of a long gun: rings, eyepiece (its lens toward you), tube, turret, objective. */
  function scope(ctx, rg, y, z0, z1, big) {
    const { box, bar, P, px } = rg;
    const zObj = z1 + (big ? 0.085 : 0.045);
    bar(0, y, big ? 0.0145 : 0.0125, z1, zObj, GUNMETAL, 0.8, 10);
    if (big) bar(0, y, 0.0152, zObj - 0.03, zObj, POLYMER, 0.4, 10); // the sunshade
    box(-0.0075, 0.0075, y - 0.022, y - 0.006, z0 + 0.04, z0 + 0.052, GUNMETAL, 0.5);
    box(-0.0075, 0.0075, y - 0.022, y - 0.006, z1 - 0.05, z1 - 0.038, GUNMETAL, 0.5);
    bar(0, y, 0.0085, z0 + 0.02, z1, GUNMETAL, 0.8, 10);
    box(-0.0045, 0.0045, y + 0.007, y + 0.015, (z0 + z1) / 2 - 0.006, (z0 + z1) / 2 + 0.006, GUNMETAL, 0.6);
    bar(0, y, 0.0115, z0 - 0.02, z0 + 0.02, GUNMETAL, 0.7, 10);
    const e = P(0, y, z0 - 0.0205);
    const r = Math.max(1.5, px(0.0085, [0, y, z0 - 0.02]));
    const g = ctx.createRadialGradient(e[0] - r * 0.3, e[1] - r * 0.3, 0, e[0], e[1], r);
    g.addColorStop(0, "#5f8fa8");
    g.addColorStop(1, "#14222c");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(e[0], e[1], r * 0.8, r, 0, 0, TAU);
    ctx.fill();
  }

  /* ---------- The pistol (also each of the double pistols) ----------
     Origin at the top of the slide's rear. Returns the muzzle on screen. t: the mod tiers. */
  function pistolModel(ctx, rg, kick, t) {
    const { s, F, P, world, screen, prism, limbs, polygon, onQuad, off, strokeLine, box, bar } = rg;
    t = t || NO_MODS;
    const back = -kick * 0.022; // the slide (and the barrel with it) comes back on the shot
    const ext = t.r >= 2 ? 0.032 : 0; // range 2: a long slide
    const zF = back + 0.188 + ext; // the slide's front
    const zB = zF + (t.r >= 1 ? 0.016 : 0); // range 1: the barrel's crown stands out past it
    const zM = zB + [0, 0.02, 0.03, 0.04][t.d]; // damage: a compensator on the end
    // the shooting arm comes up from the bottom right: jacket sleeve, then the glove's cuff
    limbs([[[[0.1, -0.36, -0.12], [0.035, -0.205, -0.07]], 0.036]], SLEEVE);
    limbs([[[[0.04, -0.215, -0.072], [0.006, -0.125, -0.04]], 0.024]], GLOVE);
    limbs([[[[0.042, -0.22, -0.074], [0.03, -0.19, -0.064]], 0.027]], CUFF);

    // the far end first: the barrel's crown, the compensator and its ports (a gold barrel at damage 3)
    if (zB > zF) bar(0, -0.014, 0.0062, zF - 0.002, zB, t.d >= 3 ? GOLD : STEEL, 1, 8);
    if (t.d) {
      const comp = box(-0.0114, 0.0114, -0.028, -0.002, zB, zM, GUNMETAL, 0.7);
      const n = t.d + (t.d >= 2 ? 1 : 0); // one port, then three, then four
      const top = [];
      for (let i = 0; i < n; i++) top.push([0.28, 0.72, 0.12 + (i * 0.8) / n, 0.12 + ((i + 0.6) * 0.8) / n]);
      slots(ctx, comp[2], top);
      if (t.d >= 2) slots(ctx, comp[3], [[0.25, 0.55, 0.2, 0.42], [0.25, 0.55, 0.58, 0.8]]);
      if (t.d >= 3) box(-0.0119, 0.0119, -0.0286, -0.0014, zB, zB + 0.005, RED, 0.6);
    }
    // accuracy: a laser under the frame, then a light with a steel bezel; the laser's window on its near side
    if (t.a) {
      const big = t.a >= 2;
      const z1 = 0.176 + ext + (big ? 0.012 : 0);
      if (big) bar(0, -0.063, 0.0128, z1, z1 + 0.014, STEEL, 1.2, 10);
      box(big ? -0.0125 : -0.0105, big ? 0.0125 : 0.0105, big ? -0.075 : -0.067, -0.0505, big ? 0.124 : 0.134, z1, big ? [70, 72, 76] : POLYMER, 0.5);
      laser(ctx, rg, [big ? -0.0127 : -0.0107, -0.059, z1 - 0.01], t.a >= 3);
    }

    // grip, raked back 18 degrees, with stippled panels
    const rake = [0, -Math.cos(0.31), -Math.sin(0.31)];
    const gripSection = [[-0.014, 0.007], [-0.009, 0], [0.009, 0], [0.014, 0.007], [0.014, 0.047], [0.009, 0.053], [-0.009, 0.053], [-0.014, 0.047]];
    const grip = prism(gripSection, (u, v, t) => [u, -0.048 + rake[1] * 0.11 * t, v + rake[2] * 0.11 * t], POLYMER, 0.3);
    if (grip[7]) {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      for (let i = 1; i < 9; i++) for (let j = 1; j < 6; j++) {
        const p = onQuad(grip[7], j / 6, i / 9);
        ctx.fillRect(p[0], p[1], 1.4 * s, 1.4 * s);
      }
    }

    // shooting hand, seen from its left: the fingers curl round the front strap onto the
    // left panel; palm, web and thumb go on last as one piece, over the frame
    const rearZ = (y) => ((y + 0.048) / 0.95) * 0.31;
    const frontZ = (y) => 0.053 + rearZ(y);
    const GX = -0.016; // the glove sits just proud of the left grip panel
    const G = (y, z) => P(GX, y, z);
    const thick = (m) => (m * F) / (off[2] + 0.03); // a size in metres, in pixels on the glove
    const smooth = (pts) => {
      const sp3 = pts.map(([y, z]) => G(y, z));
      const n = sp3.length;
      const mid = (i) => [(sp3[i][0] + sp3[(i + 1) % n][0]) / 2, (sp3[i][1] + sp3[(i + 1) % n][1]) / 2];
      ctx.beginPath();
      ctx.moveTo(...mid(n - 1));
      sp3.forEach((p, i) => ctx.quadraticCurveTo(p[0], p[1], ...mid(i)));
      ctx.closePath();
      return sp3;
    };
    const seg = (y0, z0, y1, z1, width, color, dash) => {
      const p0 = G(y0, z0);
      const p1 = G(y1, z1);
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, width);
      ctx.lineCap = "round";
      if (dash) ctx.setLineDash([dash, dash * 0.9]);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
      if (dash) ctx.setLineDash([]);
    };
    /* A leather piece: lit from above, grain, then detail painted inside its outline. */
    const leather = (pts, detail) => {
      const sp3 = smooth(pts);
      const ys = sp3.map((p) => p[1]);
      const xs = sp3.map((p) => p[0]);
      const g = ctx.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys));
      g.addColorStop(0, rgb(GLOVE, 1.25));
      g.addColorStop(0.35, rgb(GLOVE, 0.92));
      g.addColorStop(1, rgb(GLOVE, 0.48));
      ctx.fillStyle = g;
      ctx.fill();
      ctx.save();
      ctx.clip();
      const rnd = seededRng(5);
      const x0 = Math.min(...xs);
      const y0 = Math.min(...ys);
      const bw = Math.max(...xs) - x0;
      const bh = Math.max(...ys) - y0;
      for (let i = 0; i < 90; i++) {
        ctx.fillStyle = i % 3 ? "rgba(0,0,0,0.16)" : "rgba(255,240,220,0.07)";
        ctx.fillRect(x0 + rnd() * bw, y0 + rnd() * bh, 1.3 * s, 1.3 * s);
      }
      detail();
      ctx.restore();
      smooth(pts);
      ctx.strokeStyle = "#0d0e10";
      ctx.lineWidth = Math.max(1, 1.6 * s);
      ctx.stroke();
    };
    // fingers: middle, ring, little; [centre y, half height]
    const fingers = [[-0.069, 0.0086], [-0.088, 0.0082], [-0.106, 0.0074]];
    const tipZ = (y, depth) => frontZ(y) - depth;
    const fingerOutline = [[fingers[0][0] + fingers[0][1], frontZ(-0.06) + 0.005], [-0.087, frontZ(-0.087) + 0.007], [-0.114, frontZ(-0.114) + 0.005]];
    for (let i = fingers.length - 1; i >= 0; i--) {
      const [y, h] = fingers[i];
      fingerOutline.push([y - h * 0.95, tipZ(y - h, 0.013)], [y - h * 0.45, tipZ(y, 0.024)], [y + h * 0.45, tipZ(y, 0.024)]);
      if (i > 0) fingerOutline.push([y + h, tipZ(y + h, 0.015)]);
    }
    fingerOutline.push([fingers[0][0] + fingers[0][1] * 0.95, tipZ(-0.06, 0.012)]);
    leather(fingerOutline, () => {
      fingers.forEach(([y, h], i) => {
        const fz = frontZ(y);
        // round each finger: sheen along the top, shadow along the bottom
        seg(y + h * 0.42, fz + 0.006, y + h * 0.42, fz - 0.02, thick(h * 0.55), "rgba(255,235,210,0.13)");
        seg(y - h * 0.8, fz + 0.006, y - h * 0.8, fz - 0.019, thick(h * 0.6), "rgba(0,0,0,0.38)");
        // a fold at the middle joint
        seg(y + h * 0.5, fz - 0.006, y - h * 0.3, fz - 0.0075, 1.1 * s, "rgba(0,0,0,0.4)");
        seg(y + h * 0.45, fz - 0.0074, y - h * 0.25, fz - 0.0089, 1 * s, "rgba(255,235,210,0.1)");
        // the crease to the next finger down
        if (i < fingers.length - 1) seg(y - h, fz + 0.008, y - h, tipZ(y - h, 0.014), 1.5 * s, "rgba(0,0,0,0.75)");
      });
    });

    // trigger guard and the trigger behind it (red at fire rate 3)
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const guard = [[0, -0.05, 0.06], [0, -0.068, 0.066], [0, -0.073, 0.08], [0, -0.073, 0.118], [0, -0.066, 0.128], [0, -0.05, 0.13]].map((p) => P(...p));
    const guardW = (0.006 * F) / (off[2] + 0.09);
    strokeLine(guard, guardW + 2 * s, "#0b0b0c");
    strokeLine(guard, guardW, rgb(POLYMER, 1.1));
    strokeLine([[0, -0.05, 0.082], [0, -0.06, 0.085], [0, -0.066, 0.08]].map((p) => P(...p)), guardW * (t.f >= 3 ? 1.1 : 0.8), t.f >= 3 ? rgb(RED, 1.1) : rgb(STEEL, 0.8));

    // frame (dust cover) under the slide, with the slide stop (a long red release at fire rate 3)
    const frame = prism([[-0.0115, -0.05], [0.0115, -0.05], [0.0115, -0.03], [-0.0115, -0.03]], (u, v, k) => [u, v, -0.004 + k * (0.186 + ext)], POLYMER, 0.25);
    if (frame[3]) {
      polygon([onQuad(frame[3], 0.3, 0.2), onQuad(frame[3], 0.42, 0.2), onQuad(frame[3], 0.42, 0.45), onQuad(frame[3], 0.3, 0.45)]);
      ctx.fillStyle = rgb(STEEL, 0.6);
      ctx.fill();
    }
    if (t.f >= 3) box(-0.0145, -0.0113, -0.037, -0.03, 0.036, 0.094, RED, 0.8);

    // slide (cocked back on the shot), bevelled top, cocking serrations
    const slide = prism(
      [[-0.0128, -0.031], [0.0128, -0.031], [0.0128, -0.006], [0.0085, 0], [-0.0085, 0], [-0.0128, -0.006]],
      (u, v, k) => [u, v, back + k * (0.188 + ext)],
      STEEL,
      1
    );
    const along = 0.188 / (0.188 + ext); // serrations stay at the rear of a long slide
    if (slide[5]) {
      // left face: serrations at the rear
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.lineWidth = Math.max(1, 1.2 * s);
      for (let i = 0; i < 8; i++) {
        const a = (0.03 + i * 0.022) * along;
        const p0 = onQuad(slide[5], 0.15, a);
        const p1 = onQuad(slide[5], 0.95, a);
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.stroke();
      }
    }
    // fire rate: slanted lightening windows in the side (1); front cocking serrations and cuts in the top
    // ahead of the port (2)
    if (t.f >= 1 && slide[5]) {
      ctx.fillStyle = "#141518";
      for (let i = 0; i < 3; i++) {
        const z0 = back + 0.098 + ext * 0.5 + i * 0.024;
        polygon([P(-0.0129, -0.009, z0 + 0.009), P(-0.0129, -0.009, z0 + 0.02), P(-0.0129, -0.023, z0 + 0.011), P(-0.0129, -0.023, z0)]);
        ctx.fill();
      }
    }
    if (t.f >= 2) {
      if (slide[5]) {
        for (let i = 0; i < 6; i++) {
          const z = back + 0.188 + ext - 0.03 + i * 0.0045;
          strokeLine([P(-0.0129, -0.008, z), P(-0.0129, -0.027, z)], Math.max(1, 1.2 * s), "rgba(0,0,0,0.6)");
        }
      }
      [0.096, 0.13].forEach((z) => {
        polygon([P(-0.0058, 0.0003, back + z + ext * 0.5), P(0.0058, 0.0003, back + z + ext * 0.5), P(0.0058, 0.0003, back + z + 0.024 + ext * 0.5), P(-0.0058, 0.0003, back + z + 0.024 + ext * 0.5)]);
        ctx.fillStyle = "#141518";
        ctx.fill();
      });
    }
    // ejection port on top: the barrel hood shows through (gold at damage 3)
    const port = [[0.0, 0.0002, 0.03], [0.0085, 0.0002, 0.03], [0.0085, 0.0002, 0.078], [0.0, 0.0002, 0.078]].map(([x, y, z]) => P(x, y, z + back));
    polygon(port);
    ctx.fillStyle = "#1a1b1e";
    ctx.fill();
    polygon([P(0.0012, 0.0004, 0.034 + back * 0.2), P(0.0075, 0.0004, 0.034 + back * 0.2), P(0.0075, 0.0004, 0.074), P(0.0012, 0.0004, 0.074)]);
    ctx.fillStyle = t.d >= 3 ? rgb(GOLD, 1) : rgb([92, 88, 80], 1);
    ctx.fill();
    // bright edge along the top bevel
    strokeLine([P(-0.0085, 0.0003, back + 0.002), P(-0.0085, 0.0003, back + 0.186 + ext)], Math.max(1, 1.2 * s), "rgba(220,225,235,0.35)");

    // sights: rear notch with two dots, front post with one; fiber optics from range 1 (green front,
    // red rear); at range 3 a red-dot sight takes the rear sight's place
    const dot3 = (x, y, z, r, color) => {
      const q = world([x, y, z]);
      const p = screen(q);
      ctx.fillStyle = color || "#e8e6da";
      ctx.beginPath();
      ctx.arc(p[0], p[1], Math.max(0.8, (r * F) / q[2]), 0, TAU);
      ctx.fill();
    };
    const fiber = t.r >= 1;
    if (t.r < 3) {
      box(-0.0105, -0.0024, 0, 0.0065, back + 0.012, back + 0.022, POLYMER);
      box(0.0024, 0.0105, 0, 0.0065, back + 0.012, back + 0.022, POLYMER);
      dot3(-0.0064, 0.0034, back + 0.0118, fiber ? 0.0014 : 0.0011, fiber ? "#ff5a3c" : null);
      dot3(0.0064, 0.0034, back + 0.0118, fiber ? 0.0014 : 0.0011, fiber ? "#ff5a3c" : null);
    }
    box(-0.0017, 0.0017, 0, fiber ? 0.0078 : 0.0062, zF - 0.014, zF - 0.006, POLYMER);
    if (fiber) bar(0, 0.0066, 0.0013, zF - 0.0145, zF - 0.0045, [70, 210, 80], 1.4, 6);
    dot3(0, fiber ? 0.0066 : 0.0036, zF - 0.0142, fiber ? 0.0014 : 0.0009, fiber ? "#7dff6a" : null);
    if (t.r >= 3) {
      // a red-dot sight: base plate, hood, tinted glass toward you with the dot in it
      box(-0.0105, 0.0105, 0, 0.0035, back + 0.002, back + 0.036, GUNMETAL, 0.5);
      prism([[-0.0105, 0.0035], [0.0105, 0.0035], [0.0105, 0.017], [0.0065, 0.0235], [-0.0065, 0.0235], [-0.0105, 0.017]], (u, v, k) => [u, v, back + 0.004 + k * 0.03], POLYMER, 0.5);
      polygon([[-0.0082, 0.0058], [0.0082, 0.0058], [0.0082, 0.0162], [0.0052, 0.0212], [-0.0052, 0.0212], [-0.0082, 0.0162]].map(([x, y]) => P(x, y, back + 0.0038)));
      const lens = ctx.createLinearGradient(...P(0, 0.021, back + 0.004), ...P(0, 0.006, back + 0.004));
      lens.addColorStop(0, "rgba(150,215,230,0.9)");
      lens.addColorStop(1, "rgba(60,120,140,0.9)");
      ctx.fillStyle = lens;
      ctx.fill();
      dot3(0, 0.0128, back + 0.0037, 0.0012, "#ff3a2a");
    }

    // palm, web and thumb in one piece: heel round the backstrap, the thumb's mound over
    // the top of the panel, the thumb along the frame pointing at the target
    const R = rearZ;
    leather(
      [[-0.046, R(-0.046) - 0.012], [-0.0405, -0.001], [-0.0366, 0.022], [-0.0372, 0.048], [-0.0392, 0.0605], [-0.0445, 0.063], [-0.049, 0.057], [-0.0505, 0.032], [-0.06, R(-0.06) + 0.024], [-0.085, R(-0.085) + 0.02], [-0.12, R(-0.12) + 0.018], [-0.14, R(-0.14) + 0.021], [-0.153, R(-0.153) + 0.004], [-0.148, R(-0.148) - 0.03], [-0.1, R(-0.1) - 0.03], [-0.062, R(-0.062) - 0.026]],
      () => {
        // thumb: sheen on top, shadow underneath, folds at the knuckle, a stitched seam
        seg(-0.0392, 0.002, -0.0388, 0.056, thick(0.0035), "rgba(255,235,210,0.16)");
        seg(-0.0485, 0.0, -0.0482, 0.054, thick(0.004), "rgba(0,0,0,0.4)");
        seg(-0.0385, 0.029, -0.0465, 0.031, 1.1 * s, "rgba(0,0,0,0.35)");
        seg(-0.0388, 0.0305, -0.0462, 0.0325, 1 * s, "rgba(255,235,210,0.1)");
        seg(-0.0435, 0.004, -0.0438, 0.05, 1.1 * s, "rgba(205,190,165,0.4)", 3 * s);
        // the mound at the base of the thumb catches the light
        const c = G(-0.066, R(-0.066) + 0.006);
        const rad = thick(0.03);
        const mound = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], rad);
        mound.addColorStop(0, "rgba(255,235,210,0.14)");
        mound.addColorStop(1, "rgba(255,235,210,0)");
        ctx.fillStyle = mound;
        ctx.fillRect(c[0] - rad, c[1] - rad, rad * 2, rad * 2);
      }
    );

    return { m: P(0, -0.014, zM + 0.004), ahead: P(0, -0.014, zM + 0.132) };
  }

  /* Muzzle flash: brief and hot. A white core, a short plume along the bore, a few ragged
     petals and sparks that differ shot to shot, a warm glow nearby, and smoke that outlives
     the kick (so each muzzle keeps its own clock between frames). */
  const MUZZLES = {};
  const muzzleState = (key) => MUZZLES[key] || (MUZZLES[key] = { last: 0, shots: 0, puffs: [] });
  function muzzleFx(ctx, rg, m, ahead, kick, mz, size) {
    const s = rg.s;
    const ang = Math.atan2(ahead[1] - m[1], ahead[0] - m[0]);
    const now = performance.now();
    if (kick > mz.last + 0.05) {
      mz.shots++;
      mz.puffs.push({ t0: now, seed: mz.shots });
      if (mz.puffs.length > 6) mz.puffs.shift();
    }
    mz.last = kick;
    const r = 30 * s * (size || 1);
    if (kick > 0) {
      const glow = ctx.createRadialGradient(m[0], m[1], 0, m[0], m[1], r * 4);
      glow.addColorStop(0, "rgba(255,205,130," + (0.32 * kick).toFixed(3) + ")");
      glow.addColorStop(1, "rgba(255,160,70,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(m[0] - r * 4, m[1] - r * 4, r * 8, r * 8);
    }
    const hot = Math.max(0, (kick - 0.4) / 0.6); // the flame itself lasts about half the kick
    if (hot > 0) {
      const rnd = seededRng(mz.shots * 7 + 3);
      const lobe = (a, len, wdt, inner, outer) => {
        const ex = m[0] + Math.cos(a) * len;
        const ey = m[1] + Math.sin(a) * len;
        const g = ctx.createLinearGradient(m[0], m[1], ex, ey);
        g.addColorStop(0, inner);
        g.addColorStop(1, outer);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(m[0] + Math.cos(a + 1.57) * wdt, m[1] + Math.sin(a + 1.57) * wdt);
        ctx.quadraticCurveTo(m[0] + Math.cos(a + 0.3) * len * 0.55, m[1] + Math.sin(a + 0.3) * len * 0.55, ex, ey);
        ctx.quadraticCurveTo(m[0] + Math.cos(a - 0.3) * len * 0.55, m[1] + Math.sin(a - 0.3) * len * 0.55, m[0] + Math.cos(a - 1.57) * wdt, m[1] + Math.sin(a - 1.57) * wdt);
        ctx.closePath();
        ctx.fill();
      };
      const al = (v) => (v * hot).toFixed(3);
      // ragged petals round the muzzle
      for (let i = 0; i < 5; i++) {
        const a = ang + (i / 5) * TAU + rnd() * 0.6;
        lobe(a, r * (0.45 + rnd() * 0.55), r * 0.17, "rgba(255,225,160," + al(0.9) + ")", "rgba(255,140,40,0)");
      }
      // the plume along the bore: orange outside, near white inside
      const len = r * (1.8 + rnd() * 0.8);
      lobe(ang + (rnd() - 0.5) * 0.15, len, r * 0.5, "rgba(255,200,110," + al(0.95) + ")", "rgba(255,120,30,0)");
      lobe(ang, len * 0.6, r * 0.22, "rgba(255,250,225," + al(1) + ")", "rgba(255,210,140,0)");
      // sparks thrown forward
      ctx.strokeStyle = "rgba(255,228,170," + al(0.9) + ")";
      ctx.lineWidth = Math.max(1, 1.2 * s);
      ctx.lineCap = "round";
      for (let i = 0; i < 4; i++) {
        const a = ang + (rnd() - 0.5) * 0.9;
        const d0 = r * (0.8 + rnd() * 0.8);
        const d1 = d0 + r * (0.15 + rnd() * 0.25);
        ctx.beginPath();
        ctx.moveTo(m[0] + Math.cos(a) * d0, m[1] + Math.sin(a) * d0);
        ctx.lineTo(m[0] + Math.cos(a) * d1, m[1] + Math.sin(a) * d1);
        ctx.stroke();
      }
      const core = ctx.createRadialGradient(m[0], m[1], 0, m[0], m[1], r * 0.45);
      core.addColorStop(0, "rgba(255,255,245," + al(1) + ")");
      core.addColorStop(1, "rgba(255,240,200,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(m[0], m[1], r * 0.45, 0, TAU);
      ctx.fill();
    }
    // smoke: a grey puff per shot that drifts up and forward and thins out over 0.7 s
    mz.puffs = mz.puffs.filter((puff) => now - puff.t0 < 700);
    mz.puffs.forEach((puff) => {
      const age = (now - puff.t0) / 700;
      const rnd = seededRng(puff.seed * 13 + 1);
      for (let i = 0; i < 3; i++) {
        const drift = r * (0.6 + rnd() * 0.8) * age * 2;
        const x = m[0] + Math.cos(ang) * drift + (rnd() - 0.5) * r * 0.8 * age;
        const y = m[1] + Math.sin(ang) * drift - r * 1.6 * age * (0.6 + rnd() * 0.6);
        const rad = r * (0.35 + age * (1.2 + rnd() * 0.8));
        const a = 0.26 * Math.pow(1 - age, 1.6) * Math.min(1, age * 8);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, "rgba(205,203,198," + a.toFixed(3) + ")");
        g.addColorStop(1, "rgba(205,203,198,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
    });

  }

  /* A gloved hand round a pistol grip seen from its left: sleeve and wrist, the back of the
     hand, fingers across the front strap (top to bottom), then the thumb along the frame.
     frontZ(y) is the front of the grip at height y. */
  function gripHand(rg, o) {
    const { limbs } = rg;
    limbs([[[o.sleeve, o.wrist], 0.037]], SLEEVE);
    limbs([[[o.wrist, o.palm[0]], 0.024]], GLOVE);
    limbs([[o.palm, 0.016]], GLOVE);
    o.fingers.forEach((y) => {
      const fz = o.frontZ(y);
      limbs([[[[o.x - 0.001, y - 0.002, fz - 0.026], [o.x, y + 0.0015, fz + 0.004]], 0.0082]], GLOVE);
    });
    if (o.thumb) limbs([[o.thumb, 0.0072]], GLOVE);
  }
  /* A support hand round a vertical foregrip seen from its left: sleeve and wrist from the
     lower left, the back of the hand, fingers curled round the front, thumb along the top.
     x is the near side of the grip, z its centre, y0 where it meets the gun. */
  function foregripHand(rg, o) {
    const { limbs } = rg;
    const { x, z, y0 } = o;
    limbs([[[o.sleeve, o.wrist], 0.036]], SLEEVE);
    limbs([[[o.wrist, [x - 0.006, y0 - 0.056, z - 0.014]], 0.021]], GLOVE);
    limbs([[[[x - 0.006, y0 - 0.014, z - 0.008], [x - 0.006, y0 - 0.052, z - 0.01]], 0.017]], GLOVE);
    [0.017, 0.031, 0.045].forEach((d) => limbs([[[[x - 0.005, y0 - d, z - 0.004], [x + 0.003, y0 - d - 0.002, z + 0.017]], 0.0074]], GLOVE));
    limbs([[[[x - 0.003, y0 - 0.006, z - 0.014], [x - 0.001, y0 + 0.003, z + 0.022]], 0.0068]], GLOVE);
  }
  /* Small dark vents or holes on a face at constant x. */
  function holes(ctx, rg, x, pts, r) {
    ctx.fillStyle = "rgba(8,9,10,0.85)";
    pts.forEach(([y, z]) => {
      const p = rg.P(x, y, z);
      const rad = Math.max(0.8, rg.px(r, [x, y, z]));
      ctx.beginPath();
      ctx.ellipse(p[0], p[1], rad * 0.75, rad, 0, 0, TAU);
      ctx.fill();
    });
  }
  /* A guard (or handle) as a bent rod: ink, then colour. */
  function rod(rg, pts, m, color) {
    const scr = pts.map((p) => rg.P(...p));
    const w = rg.px(m, pts[Math.floor(pts.length / 2)]);
    rg.strokeLine(scr, w + 2.2 * rg.s, "#0b0b0c");
    rg.strokeLine(scr, w, rgb(color, 1.15));
  }

  /* ---------- The machine gun ----------
     A carbine-style automatic: stock, raked grip, curved magazine, flat-top receiver with a
     rail, vented handguard with a vertical foregrip, barrel and brake. Origin at the top rear
     of the receiver. Drawn far to near: muzzle end first, stock and hands last. */
  function mgModel(ctx, rg, kick, t) {
    const { s, P, limbs, strokeLine, box, bar, vbar, slab, prism, px } = rg;
    t = t || NO_MODS;
    const frontZ = (y) => 0.022 - 0.01 * ((-0.058 - y) / 0.077);
    const zE = 0.5 + [0, 0.06, 0.06, 0.12][t.r]; // range: a longer barrel
    // the shooting arm comes up from the bottom right, under everything
    limbs([[[[0.14, -0.36, -0.14], [0.034, -0.19, -0.05]], 0.036]], SLEEVE);
    // barrel (heavier from damage 2) and its muzzle device: a brake, ported and longer each damage tier,
    // then a boxy three-port brake; gas block and front sight post
    bar(0, -0.022, t.d >= 2 ? 0.0092 : 0.0065, 0.36, zE, STEEL, 0.9, 6);
    if (t.d >= 2) [0.003, -0.003].forEach((dy) => strokeLine([P(-0.0081, -0.022 + dy, 0.375), P(-0.0081, -0.022 + dy, zE - 0.006)], Math.max(1, 1.3 * s), "rgba(225,230,240,0.55)")); // flutes
    let zM;
    if (t.d >= 3) {
      zM = zE + 0.08;
      const brake = box(-0.0165, 0.0165, -0.039, -0.005, zE, zM, GUNMETAL, 0.6);
      slots(ctx, brake[3], [[0.2, 0.8, 0.12, 0.27], [0.2, 0.8, 0.42, 0.57], [0.2, 0.8, 0.72, 0.87]]);
      slots(ctx, brake[2], [[0.3, 0.7, 0.15, 0.3], [0.3, 0.7, 0.5, 0.65]]);
    } else {
      const R = [0.0095, 0.0125, 0.0145][t.d];
      zM = zE + [0.035, 0.06, 0.075][t.d];
      bar(0, -0.022, R, zE, zM, GUNMETAL, 0.6, 6);
      if (t.d) {
        const n = t.d + 1;
        const pts = [];
        for (let i = 0; i < n; i++) pts.push([-0.022, zE + ((i + 0.6) * (zM - zE)) / (n + 0.2)]);
        holes(ctx, rg, -R * 0.88, pts, R * 0.42);
      }
    }
    box(-0.007, 0.007, -0.034, 0.004, 0.355, 0.372, GUNMETAL);
    rod(rg, [[0, 0.006, 0.364], [0, 0.03, 0.364]], 0.0032, GUNMETAL);
    // handguard with vent slots, and the foregrip under it (both tan, with a hand stop, from accuracy 1)
    vbar(0, 0.29, 0.011, -0.04, -0.105, t.a ? TAN : POLYMER, 0.25);
    bar(0, -0.024, 0.022, 0.19, 0.36, t.a ? TAN : POLYMER, 0.25, 8);
    for (let i = 0; i < 5; i++) {
      const z0 = 0.205 + i * 0.03;
      ctx.fillStyle = "rgba(8,9,10,0.8)";
      rg.polygon([P(-0.0206, -0.019, z0), P(-0.0206, -0.019, z0 + 0.018), P(-0.0206, -0.029, z0 + 0.018), P(-0.0206, -0.029, z0)]);
      ctx.fill();
    }
    if (t.a) box(-0.008, 0.008, -0.05, -0.04, 0.322, 0.336, TAN, 0.3);
    // accuracy 2: a laser on the near side of the handguard (on at 3)
    if (t.a >= 2) {
      box(-0.036, -0.02, -0.032, -0.016, 0.3, 0.348, POLYMER, 0.4);
      laser(ctx, rg, [-0.0362, -0.024, 0.338], t.a >= 3);
    }
    // magazine (fire rate: longer, two clamped side by side, a drum)
    const ribs = (x, len) => {
      for (let i = 1; i < 5; i++) {
        const f = i / 5;
        strokeLine([P(x, -0.058 - len * f, 0.084 + 0.022 * f * (len / 0.112) + 0.004), P(x, -0.058 - (len - 0.008) * f, 0.128 + 0.022 * f * (len / 0.112) - 0.004)], Math.max(1, 1.1 * s), "rgba(0,0,0,0.45)");
      }
    };
    const AMBER = [150, 104, 42];
    const rounds = (x, len) => {
      // brass rounds stacked inside a see-through magazine
      for (let i = 0; i < 7; i++) {
        const f = (i + 0.5) / 8;
        const y = -0.062 - len * 0.55 * f;
        const z = 0.09 + 0.022 * f * (len / 0.112);
        strokeLine([P(x, y, z), P(x, y - 0.004, z + 0.03)], Math.max(1.5, px(0.0055, [x, y, z])), rgb(BRASS, 1.05));
      }
    };
    if (t.f >= 3) {
      slab([[0.09, -0.058], [0.134, -0.058], [0.134, -0.08], [0.09, -0.08]], -0.011, 0.011, POLYMER, 0.2);
      const drum = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        drum.push([0.112 + Math.cos(a) * 0.066, -0.128 + Math.sin(a) * 0.066]);
      }
      slab(drum, -0.026, 0.026, OLIVE, 0.4);
      // the winding key in the middle of the near face
      const c = P(-0.0265, -0.128, 0.112);
      const r = Math.max(2, px(0.018, [-0.0265, -0.128, 0.112]));
      ctx.fillStyle = rgb(GUNMETAL, 1.1);
      ctx.strokeStyle = "#0b0b0c";
      ctx.lineWidth = Math.max(1, 1.2 * s);
      ctx.beginPath();
      ctx.ellipse(c[0], c[1], r * 0.7, r, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      strokeLine([[c[0], c[1] - r * 0.8], [c[0], c[1] + r * 0.8]], Math.max(1, r * 0.3), rgb(STEEL, 1.3));
    } else {
      const len = t.f >= 1 ? 0.17 : 0.112;
      const mag = [[0.084, -0.058], [0.128, -0.058], [0.128 + 0.022 * (len / 0.112), -0.05 - len], [0.084 + 0.022 * (len / 0.112), -0.058 - len]];
      slab(mag, -0.011, 0.011, t.f ? AMBER : POLYMER, t.f ? 0.8 : 0.2);
      if (t.f) rounds(-0.0114, len);
      else ribs(-0.0113, len);
      if (t.f >= 2) {
        // a spare clamped alongside on the near side, a little lower, and the clamp round both
        slab(mag.map(([z, y]) => [z + 0.006, y - 0.012]), -0.036, -0.014, AMBER, 0.8);
        rounds(-0.0363, len);
        box(-0.038, 0.0125, -0.1, -0.086, 0.098, 0.16, [196, 168, 70], 0.4);
      }
    }
    // pistol grip, raked back; lower receiver; trigger guard and trigger
    slab([[-0.012, -0.058], [0.022, -0.058], [0.012, -0.135], [-0.024, -0.128]], -0.013, 0.013, POLYMER, 0.25);
    box(-0.015, 0.015, -0.062, -0.038, -0.035, 0.16, GUNMETAL, 0.35);
    rod(rg, [[0, -0.061, 0.026], [0, -0.078, 0.034], [0, -0.079, 0.07], [0, -0.062, 0.08]], 0.004, GUNMETAL);
    strokeLine([P(0, -0.062, 0.05), P(0, -0.072, 0.052), P(0, -0.075, 0.047)], px(0.003, [0, -0.07, 0.05]), rgb(STEEL, 0.9));
    // upper receiver, flat top, with the bolt release and selector on the near side
    prism([[-0.016, -0.04], [0.016, -0.04], [0.016, -0.007], [0.011, 0], [-0.011, 0], [-0.016, -0.007]], (u, v, k) => [u, v, -0.045 + k * 0.235], GUNMETAL, 0.7);
    ctx.fillStyle = rgb(STEEL, 0.9);
    rg.polygon([P(-0.0162, -0.03, 0.03), P(-0.0162, -0.03, 0.045), P(-0.0162, -0.022, 0.045), P(-0.0162, -0.022, 0.03)]);
    ctx.fill();
    strokeLine([P(-0.0155, -0.047, 0.004), P(-0.0158, -0.044, 0.018)], Math.max(1, 2 * s), rgb(STEEL, 1.1));
    // top rail with its slots, rear sight with its ring (a scope from range 2), charging handle
    box(-0.008, 0.008, 0, 0.006, -0.035, 0.355, GUNMETAL, 0.5);
    for (let z = -0.026; z < 0.35; z += 0.0175) strokeLine([P(-0.008, 0.0062, z), P(0.008, 0.0062, z)], Math.max(1, s), "rgba(0,0,0,0.55)");
    if (t.r >= 2) scope(ctx, rg, 0.028, 0.03, 0.2, t.r >= 3);
    else {
      box(-0.009, 0.009, 0.006, 0.024, 0.0, 0.016, GUNMETAL);
      const ring = P(0, 0.017, -0.0004);
      ctx.strokeStyle = "#0b0b0c";
      ctx.lineWidth = Math.max(1, 1.4 * s);
      ctx.beginPath();
      ctx.arc(ring[0], ring[1], Math.max(1.2, px(0.003, [0, 0.017, 0])), 0, TAU);
      ctx.stroke();
    }
    box(-0.012, 0.012, -0.005, 0.002, -0.058, -0.045, GUNMETAL);
    // stock: buffer tube and a collapsible butt (a tan cheek riser at accuracy 3)
    bar(0, -0.024, 0.0125, -0.105, -0.045, GUNMETAL, 0.4);
    slab([[-0.08, -0.006], [-0.105, -0.006], [-0.105, -0.072], [-0.08, -0.052]], -0.015, 0.015, POLYMER, 0.2);
    if (t.a >= 3) box(-0.013, 0.013, -0.006, 0.008, -0.104, -0.07, TAN, 0.3);
    // hands: support hand on the foregrip, shooting hand on the grip
    foregripHand(rg, { x: -0.011, z: 0.29, y0: -0.046, sleeve: [-0.3, -0.34, 0.08], wrist: [-0.08, -0.15, 0.25] });
    gripHand(rg, { sleeve: [0.034, -0.19, -0.05], wrist: [0.012, -0.13, -0.022], palm: [[-0.006, -0.108, -0.018], [-0.011, -0.072, -0.006]], x: -0.016, fingers: [-0.078, -0.096, -0.114], frontZ, thumb: [[-0.018, -0.061, -0.014], [-0.019, -0.053, 0.026]] });
    return { m: P(0, -0.022, zM + 0.002), ahead: P(0, -0.022, zM + 0.165) };
  }

  /* ---------- The heavy machine gun ----------
     Belt-fed and olive drab: skeleton stock, slab-sided receiver with a feed cover, an ammo
     box on the near side feeding a brass belt, a ventilated barrel shroud with a carry handle,
     a folded bipod, a foregrip, barrel and flash hider. Origin at the top rear of the receiver. */
  function hmgModel(ctx, rg, kick, t) {
    const { s, P, limbs, strokeLine, box, bar, vbar, slab, prism, px } = rg;
    t = t || NO_MODS;
    const frontZ = (y) => 0.026 - 0.01 * ((-0.064 - y) / 0.078);
    const zE = 0.56 + [0, 0.06, 0.06, 0.12][t.r]; // range: a longer barrel
    limbs([[[[0.15, -0.38, -0.14], [0.036, -0.2, -0.05]], 0.037]], SLEEVE);
    // barrel and its muzzle device (damage: a longer slotted flash hider, then a brake, then a bigger
    // one with three slots), front sight post; fire rate 2: cooling rings on the barrel (copper at 3)
    bar(0, -0.028, 0.0095, 0.47, zE, STEEL, 0.9, 6);
    let zM;
    if (t.d >= 2) {
      zM = zE + (t.d >= 3 ? 0.068 : 0.05);
      const brake = box(-0.018, 0.018, -0.047, -0.009, zE, zM, GUNMETAL, 0.55);
      slots(ctx, brake[3], t.d >= 3 ? [[0.18, 0.82, 0.1, 0.26], [0.18, 0.82, 0.42, 0.58], [0.18, 0.82, 0.74, 0.9]] : [[0.18, 0.82, 0.15, 0.38], [0.18, 0.82, 0.6, 0.83]]);
      slots(ctx, brake[2], [[0.3, 0.7, 0.2, 0.36], [0.3, 0.7, 0.6, 0.76]]);
    } else {
      const R = t.d ? 0.0148 : 0.013;
      zM = zE + (t.d ? 0.07 : 0.04);
      bar(0, -0.028, R, zE, zM, GUNMETAL, 0.5, 6);
      for (let i = 0; i < (t.d ? 4 : 3); i++) strokeLine([P(-R * 0.96, -0.031 + i * 0.003 - (t.d ? 0.0015 : 0), zE + 0.006), P(-R * 0.96, -0.031 + i * 0.003 - (t.d ? 0.0015 : 0), zM - 0.008)], Math.max(1, 1.2 * s), "rgba(0,0,0,0.7)");
    }
    if (t.f >= 3) for (let i = 0; i < 5; i++) bar(0, -0.028, 0.018, 0.476 + i * 0.016, 0.484 + i * 0.016, COPPER, 1, 8);
    box(-0.003, 0.003, -0.004, 0.03, 0.448, 0.458, GUNMETAL);
    // bipod folded under the shroud, the foregrip behind it (tan from accuracy 1)
    [-0.012, 0.012].forEach((x) => rod(rg, [[x, -0.05, 0.46], [x, -0.058, 0.35]], 0.004, STEEL));
    vbar(0, 0.255, 0.012, -0.048, -0.118, t.a ? TAN : POLYMER, 0.25);
    // barrel shroud, ventilated, with the carry handle over it
    bar(0, -0.028, 0.026, 0.18, 0.47, OLIVE_DARK, 0.35, 8);
    const side = [];
    for (let z = 0.2; z < 0.46; z += 0.026) side.push([-0.023, z], [-0.033, z + 0.013]);
    holes(ctx, rg, -0.0243, side, 0.0034);
    ctx.fillStyle = "rgba(8,9,10,0.8)";
    for (let z = 0.213; z < 0.46; z += 0.026) {
      const p = P(0, -0.0038, z);
      const r = Math.max(0.8, px(0.0034, [0, -0.0038, z]));
      ctx.beginPath();
      ctx.ellipse(p[0], p[1], r, r * 0.55, 0, 0, TAU);
      ctx.fill();
    }
    // fire rate 2: a perforated heat shield along the top of the shroud (copper at 3)
    if (t.f >= 2) {
      const shield = box(-0.019, 0.019, -0.003, 0.003, 0.3, 0.462, t.f >= 3 ? COPPER : STEEL, 0.9);
      const dots = [];
      for (let i = 0; i < 6; i++) dots.push([0.3, 0.7, 0.08 + i * 0.15, 0.14 + i * 0.15]);
      slots(ctx, shield[2], dots);
    }
    rod(rg, [[0, -0.003, 0.2], [0, 0.03, 0.215], [0, 0.036, 0.25], [0, 0.03, 0.285], [0, -0.003, 0.3]], 0.007, OLIVE_DARK);
    if (t.a) rod(rg, [[0, 0.033, 0.226], [0, 0.036, 0.25], [0, 0.033, 0.274]], 0.009, TAN); // a tan grip wrap on the carry handle
    if (t.a) box(-0.009, 0.009, -0.058, -0.05, 0.282, 0.296, TAN, 0.3); // the hand stop
    // accuracy 2: a laser clamped to the near side of the shroud (on at 3)
    if (t.a >= 2) {
      box(-0.042, -0.025, -0.038, -0.02, 0.36, 0.41, POLYMER, 0.4);
      laser(ctx, rg, [-0.0422, -0.028, 0.4], t.a >= 3);
    }
    // skeleton grip, trigger guard, receiver, feed cover with ridges, rear sight (a scope from range 2)
    slab([[-0.008, -0.064], [0.026, -0.064], [0.016, -0.142], [-0.02, -0.135]], -0.014, 0.014, POLYMER, 0.25);
    rod(rg, [[0, -0.065, 0.03], [0, -0.083, 0.038], [0, -0.084, 0.076], [0, -0.066, 0.086]], 0.0045, OLIVE_DARK);
    prism([[-0.024, -0.066], [0.024, -0.066], [0.024, -0.008], [0.018, 0], [-0.018, 0], [-0.024, -0.008]], (u, v, k) => [u, v, -0.06 + k * 0.24], OLIVE, 0.45);
    box(-0.02, 0.02, 0, 0.01, 0.0, 0.125, OLIVE, 0.5);
    for (let z = 0.015; z < 0.12; z += 0.018) strokeLine([P(-0.02, 0.0102, z), P(0.02, 0.0102, z)], Math.max(1, s), "rgba(0,0,0,0.5)");
    if (t.r < 2) box(-0.008, 0.008, 0.01, 0.03, -0.045, -0.028, GUNMETAL);
    // the belt climbs out of the ammo box into the feed tray: brass rounds on dark links (red tips at damage 3)
    for (let i = 0; i < 6; i++) {
      const k = i / 5;
      const x = -0.058 + 0.034 * k;
      const y = -0.036 + 0.026 * Math.sin(k * Math.PI * 0.5);
      limbs([[[[x, y - 0.002, 0.058], [x, y - 0.002, 0.094]], 0.0042]], [36, 36, 38]);
      limbs([[[[x, y, 0.054], [x, y, 0.096]], 0.0046]], BRASS);
      if (t.d >= 3) limbs([[[[x, y, 0.09], [x, y, 0.1]], 0.0036]], RED);
    }
    // ammo box on the near side, stencilled, with its lid: bigger from fire rate 1, a yellow band at 3
    const big = t.f >= 1;
    const ammo = box(big ? -0.092 : -0.084, -0.03, big ? -0.152 : -0.128, -0.042, big ? 0.012 : 0.02, big ? 0.142 : 0.13, OLIVE_DARK, 0.25);
    box(big ? -0.094 : -0.086, -0.028, -0.042, -0.035, big ? 0.008 : 0.016, big ? 0.146 : 0.134, OLIVE, 0.3);
    if (ammo[3]) {
      if (t.f >= 1) {
        ctx.fillStyle = "rgba(214,176,40,0.9)";
        rg.polygon([rg.onQuad(ammo[3], 0.1, 0), rg.onQuad(ammo[3], 0.22, 0), rg.onQuad(ammo[3], 0.22, 1), rg.onQuad(ammo[3], 0.1, 1)]);
        ctx.fill();
      }
      const c = rg.onQuad(ammo[3], 0.55, 0.45);
      label(ctx, big ? "x200" : "7.62", c[0], c[1], Math.max(6, px(0.016, [-0.084, -0.085, 0.075])), big ? "rgba(236,200,60,0.95)" : "rgba(220,214,180,0.75)");
    }
    if (t.r >= 2) scope(ctx, rg, 0.034, 0.0, 0.15, t.r >= 3);
    // skeleton stock, open in the middle (a red recoil pad at accuracy 3)
    slab([[-0.055, -0.004], [-0.12, -0.012], [-0.12, -0.09], [-0.055, -0.062]], -0.017, 0.017, OLIVE_DARK, 0.2);
    ctx.fillStyle = "rgba(8,9,10,0.75)";
    rg.polygon([P(-0.0172, -0.022, -0.07), P(-0.0172, -0.025, -0.108), P(-0.0172, -0.072, -0.108), P(-0.0172, -0.055, -0.07)]);
    ctx.fill();
    if (t.a >= 3) slab([[-0.12, -0.012], [-0.134, -0.012], [-0.134, -0.09], [-0.12, -0.09]], -0.017, 0.017, RED, 0.3);
    foregripHand(rg, { x: -0.012, z: 0.255, y0: -0.054, sleeve: [-0.32, -0.36, 0.06], wrist: [-0.085, -0.16, 0.22] });
    gripHand(rg, { sleeve: [0.036, -0.2, -0.05], wrist: [0.014, -0.138, -0.022], palm: [[-0.004, -0.115, -0.016], [-0.012, -0.078, -0.004]], x: -0.017, fingers: [-0.084, -0.102, -0.12], frontZ, thumb: [[-0.025, -0.064, -0.012], [-0.026, -0.056, 0.03]] });
    return { m: P(0, -0.028, zM + 0.002), ahead: P(0, -0.028, zM + 0.15) };
  }

  /* ---------- The bow ----------
     A recurve held in the left hand, canted, with an arrow on the string. Origin at the arrow
     shelf on the grip. draw 0..1 pulls the nock (and the hand) back toward the eye and bends
     the limbs; twang shakes the string after a shot; no arrow shows while the next is nocked. */
  function bowModel(ctx, rg, draw, loaded, twang, now, t) {
    const { s, P, limbs, strokeLine, slab, px, bar } = rg;
    t = t || NO_MODS;
    const zN = -0.13 - 0.17 * draw + (twang > 0 ? Math.sin(now / 9) * 0.01 * twang : 0);
    const flex = 1 + 0.9 * draw;
    const limbPts = (dir) => {
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const k = i / 10;
        const z = -0.045 * Math.sin(k * Math.PI * 0.85) * flex - 0.03 * k * k * draw + 0.05 * Math.pow(Math.max(0, (k - 0.75) / 0.25), 2);
        pts.push([0, dir * (0.105 + 0.25 * k), z]);
      }
      return pts;
    };
    const upper = limbPts(1);
    const lower = limbPts(-1);
    // range (stronger limbs): a pale laminate stripe; thicker, darker limbs; black glass with white tips
    const thick = [1, 1, 1.25, 1.32][t.r];
    const limbColor = [WOOD, WOOD, [92, 58, 34], [40, 40, 44]][t.r];
    const limb = (pts) => {
      limbs(pts.slice(0, -1).map((p, i) => [[p, pts[i + 1]], (0.0135 - 0.0085 * (i / 10)) * thick]), limbColor);
      if (t.r === 1 || t.r === 2) limbs(pts.slice(0, -2).map((p, i) => [[[p[0] - 0.004, p[1], p[2]], [pts[i + 1][0] - 0.004, pts[i + 1][1], pts[i + 1][2]]], (0.004 - 0.002 * (i / 10)) * thick]), [214, 186, 136]);
      if (t.r >= 3) limbs([[[pts[8], pts[9], pts[10]], 0.006]], [232, 228, 214]);
    };
    // a broadhead pointing along z (damage: three wider blades, then a brass collar behind them)
    const head = (ax, ay, zTip) => {
      const w = [0.009, 0.015, 0.017, 0.021][t.d];
      const len = [0.032, 0.042, 0.046, 0.054][t.d];
      const at = (r, a, d) => P(ax + Math.cos(a) * r, ay + Math.sin(a) * r, zTip + d);
      if (t.d >= 3) limbs([[[[ax, ay, zTip - len - 0.026], [ax, ay, zTip - len + 0.002]], 0.0058]], BRASS);
      const blades = t.d ? [Math.PI / 2, Math.PI / 2 + TAU / 3, Math.PI / 2 - TAU / 3] : [0, Math.PI / 2];
      blades.forEach((a) => {
        rg.polygon(t.d ? [at(w, a, -len), at(0, a, 0.014), at(0, a, -len - 0.004)] : [at(w, a, -len), at(0, a, 0.014), at(-w, a, -len)]);
        ctx.fillStyle = rgb(STEEL, 1.5);
        ctx.fill();
        ctx.strokeStyle = "#0b0b0c";
        ctx.lineWidth = Math.max(1, 1.2 * s);
        ctx.stroke();
      });
    };
    const shaftColor = t.d >= 2 ? [38, 38, 42] : [150, 118, 78];
    // the bow arm, from the bottom left up to the grip
    limbs([[[[-0.13, -0.3, -0.26], [-0.03, -0.07, -0.05]], 0.028]], SLEEVE);
    limbs([[[[-0.03, -0.07, -0.05], [-0.006, -0.034, -0.008]], 0.019]], GLOVE);
    limb(lower);
    // accuracy 3: a stabilizer rod out the front of the riser, a weight on its end
    if (t.a >= 3) {
      bar(0, -0.07, 0.0042, 0.02, 0.2, [36, 36, 40], 0.8, 8);
      bar(0, -0.07, 0.011, 0.2, 0.226, [36, 36, 40], 0.9, 10);
    }
    // fire rate 2: a quiver on the far side of the riser with three spare arrows (five at 3), heads under its hood
    if (t.f >= 2) {
      const n = t.f >= 3 ? 5 : 3;
      for (let i = 0; i < n; i++) {
        const x = -0.034 - i * 0.0062;
        const z = 0.022 + (i % 2) * 0.006;
        limbs([[[[x, -0.24, z], [x, 0.13, z]], 0.0032]], shaftColor);
        // fletching at the bottom
        limbs([[[[x - 0.003, -0.235, z], [x - 0.003, -0.19, z]], 0.0035]], i % 2 ? [233, 226, 204] : [179, 38, 30]);
      }
      // the hood over the heads, and two brackets to the riser
      slab([[0.008, 0.12], [0.04, 0.12], [0.04, 0.17], [0.008, 0.17]], -0.067, -0.026, POLYMER, 0.3);
      slab([[0.01, -0.07], [0.03, -0.07], [0.03, -0.06], [0.01, -0.06]], -0.065, -0.012, GUNMETAL, 0.5);
      slab([[0.01, 0.06], [0.03, 0.06], [0.03, 0.07], [0.01, 0.07]], -0.065, -0.012, GUNMETAL, 0.5);
    }
    // riser: shaped wood, a leather grip wrap, the shelf the arrow rests on
    slab([[-0.016, -0.11], [0.012, -0.11], [0.02, -0.04], [0.02, 0.045], [0.012, 0.11], [-0.016, 0.11], [-0.02, 0.045], [-0.02, -0.04]], -0.011, 0.011, WOOD.map((c) => c * 0.82), 0.6);
    limb(upper);
    // accuracy (sight pins): a sight ring out on the arrow side with one pin, then three, then five
    if (t.a) {
      const cxs = 0.05;
      const cys = 0.058;
      const zs = 0.06;
      const rr = 0.019;
      rod(rg, [[0.011, 0.045, 0.012], [0.03, 0.05, 0.04], [cxs - rr, cys, zs]], 0.0035, GUNMETAL);
      const ring = [];
      for (let i = 0; i <= 16; i++) ring.push(P(cxs + Math.cos((i / 16) * TAU) * rr, cys + Math.sin((i / 16) * TAU) * rr, zs));
      strokeLine(ring, Math.max(2, px(0.006, [cxs, cys, zs])) + 2 * s, "#0b0b0c");
      strokeLine(ring, Math.max(1.5, px(0.006, [cxs, cys, zs])), rgb(GUNMETAL, 1.3));
      const pins = [[0], [0.009, 0, -0.009], [0.012, 0.006, 0, -0.006, -0.012]][Math.min(3, t.a) - 1];
      const colors = ["#7dff6a", "#ffe14a", "#ff5a3c", "#5ad2ff", "#ffffff"];
      pins.forEach((dy, i) => {
        const a = P(cxs + rr * 0.95, cys + dy, zs);
        const b = P(cxs + 0.002, cys + dy, zs);
        strokeLine([a, b], Math.max(1, 1.1 * s), "#0b0b0c");
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.arc(b[0], b[1], Math.max(1.2, px(0.0018, [cxs, cys + dy, zs])), 0, TAU);
        ctx.fill();
      });
    }
    // the string: tip, nock, tip (fire rate 1: silencers near the tips; 3: a brass nocking point)
    const str = [P(...upper[10]), P(0.002, 0, zN), P(...lower[10])];
    strokeLine(str, Math.max(1.5, 2.6 * s), "#0b0b0c");
    strokeLine(str, Math.max(1, 1.3 * s), t.r >= 3 ? "#f3e0a0" : "#ece4cc");
    if (t.f >= 1) {
      [[upper[10], 0.22], [lower[10], 0.22]].forEach(([tip, k]) => {
        const c = [str[1][0] + (P(...tip)[0] - str[1][0]) * (1 - k), str[1][1] + (P(...tip)[1] - str[1][1]) * (1 - k)];
        const r = Math.max(2.5, px(0.0095, [0, 0.2, zN]));
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * TAU;
          strokeLine([c, [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]], Math.max(1, 1.6 * s), "#7a2e1e");
        }
        ctx.fillStyle = "#b8452a";
        ctx.beginPath();
        ctx.arc(c[0], c[1], r * 0.45, 0, TAU);
        ctx.fill();
      });
    }
    if (t.f >= 3) {
      const nk = P(0.002, 0.007, zN);
      ctx.fillStyle = rgb(BRASS, 1.1);
      ctx.strokeStyle = "#0b0b0c";
      ctx.lineWidth = Math.max(1, s);
      ctx.beginPath();
      ctx.arc(nk[0], nk[1], Math.max(1.5, px(0.0035, [0.002, 0.007, zN])), 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    // bow hand: a fist round the grip
    limbs([[[[-0.004, -0.058, -0.006], [-0.004, -0.01, -0.006]], 0.016]], GLOVE);
    for (let i = 0; i < 3; i++) strokeLine([P(-0.022, -0.02 - i * 0.014, -0.008), P(-0.02, -0.02 - i * 0.014, 0.008)], Math.max(1, 1.1 * s), "rgba(0,0,0,0.55)");
    // the arrow on the string: shaft, fletching, broadhead
    if (loaded) {
      const ax = 0.016;
      const ay = 0.002;
      const zTip = zN + 0.66;
      const shaft = [];
      for (let i = 0; i < 4; i++) shaft.push([[[ax, ay, zN + (i / 4) * (zTip - 0.03 - zN)], [ax, ay, zN + ((i + 1) / 4) * (zTip - 0.03 - zN)]], t.d >= 2 ? 0.0044 : 0.0034]);
      limbs(shaft, shaftColor);
      // heavier arrows (damage 1) wear a white cresting wrap ahead of the vanes; at 3 long orange vanes
      if (t.d) limbs([[[[ax, ay, zN + (t.d >= 3 ? 0.104 : 0.088)], [ax, ay, zN + (t.d >= 3 ? 0.15 : 0.13)]], 0.0046]], [236, 232, 220]);
      const vaneAt = t.d >= 3 ? [[0.003, 0.012], [0.017, 0.03], [0.016, 0.092], [0.003, 0.1]] : [[0.003, 0.014], [0.013, 0.03], [0.012, 0.074], [0.003, 0.082]];
      [Math.PI / 2, Math.PI / 2 + (TAU / 3), Math.PI / 2 - (TAU / 3)].forEach((a, i) => {
        const c = Math.cos(a);
        const sn = Math.sin(a);
        const vane = vaneAt.map(([r, z]) => P(ax + c * r, ay + sn * r, zN + z));
        rg.polygon(vane);
        ctx.fillStyle = t.d >= 3 ? (i === 0 ? "#1d1d20" : "#e0731e") : i === 0 ? "#b3261e" : "#e9e2cc";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = Math.max(1, s);
        ctx.stroke();
      });
      head(ax, ay, zTip);
    }
    // drawing hand: three fingers hooked on the string round the nock, wrist back toward the shoulder
    const hz = zN - 0.012;
    limbs([[[[0.07, -0.24, hz - 0.12], [0.03, -0.06, hz - 0.035]], 0.026]], SLEEVE);
    limbs([[[[0.03, -0.06, hz - 0.035], [0.02, -0.024, hz - 0.01]], 0.017]], GLOVE);
    [[0.011, -0.004], [-0.009, -0.004], [-0.02, -0.003]].forEach(([y, dz]) => limbs([[[[0.024, y, hz - 0.012], [0.008, y + 0.002, hz + 0.004 + dz]], 0.0054]], GLOVE));
    return { draw };
  }

  /* Where each weapon sits in front of the eye. off: metres right, up and forward of the eye;
     roll cants it; sway: walk bob (x, y); kick: recoil back (z) and muzzle climb (pitch) on a shot;
     jitter: shake while firing. In hand every bore runs straight ahead, parallel to the view: such a
     line vanishes at the screen's centre, so the barrel points at the crosshair (where the shot goes)
     wherever the gun sits and however it bobs. show: [yaw, pitch] for the cabin's Weapons tab only,
     turned to show the gun's left side and its mods. */
  const POSES = {
    pistol: { off: [0.098, -0.04, 0.27], roll: 0, pivot: [0, -0.07, 0.03], sway: [0.005, 0.006], kick: [0.012, 0.08], jitter: 0, show: [0.6, 0] },
    dual: { off: [0.13, -0.052, 0.27], roll: 0, pivot: [0, -0.07, 0.03], sway: [0.005, 0.006], kick: [0.012, 0.08], jitter: 0, show: [0.62, 0] },
    mg: { off: [0.17, -0.07, 0.26], roll: -0.03, pivot: [0, -0.05, 0], sway: [0.006, 0.007], kick: [0.012, 0.025], jitter: 0.003, show: [0.42, 0.03] },
    hmg: { off: [0.175, -0.08, 0.27], roll: -0.03, pivot: [0, -0.05, 0], sway: [0.01, 0.012], kick: [0.02, 0.03], jitter: 0.006, show: [0.4, 0.03] },
    bow: { off: [-0.055, -0.07, 0.5], roll: 0.24, pivot: [0, 0, 0], sway: [0.004, 0.005], kick: [0, 0], jitter: 0, show: [0, 0] },
  };
  function pose(id, bob, kick, drop, mirror, show) {
    const p = POSES[id];
    const j = p.jitter && kick > 0 ? (Math.random() - 0.5) * p.jitter * kick : 0;
    return {
      off: [p.off[0] + Math.sin(bob) * p.sway[0] + j, p.off[1] - Math.abs(Math.cos(bob)) * p.sway[1] - drop + j, p.off[2] - kick * p.kick[0]],
      yaw: show ? p.show[0] : 0,
      pitch: (show ? p.show[1] : 0) + kick * p.kick[1],
      roll: p.roll,
      pivot: p.pivot,
      mirror,
    };
  }

  const MODELS = { pistol: pistolModel, dual: pistolModel, mg: mgModel, hmg: hmgModel };
  const FLASH_SIZE = { pistol: 1, dual: 1, mg: 1.25, hmg: 1.7 };
  /** The mods of the weapon in hand, from the save when the caller does not pass them. */
  function savedMods(id) {
    const S = ZSR.State;
    const wp = S && S.save && S.save.weapons;
    return (wp && wp.mods && wp.mods[id]) || null;
  }
  /** One weapon (each hand of the double pistols is a part) drawn into ctx; returns the muzzle when it has one. */
  function drawPart(ctx, W, H, id, t, o, kick, bowState) {
    const rg = rig(ctx, W, H, o);
    if (id === "bow") {
      bowModel(ctx, rg, bowState.draw, bowState.loaded, bowState.twang, bowState.now, t);
      return null;
    }
    const mm = MODELS[id](ctx, rg, kick, t);
    return { m: mm.m, ahead: mm.ahead, s: rg.s };
  }
  const restPose = (id, mirror, bounds, show) => Object.assign(pose(id, 0, 0, 0, mirror, show), { bounds });
  /** The weapon at rest (no bob, no kick) on a W x H view, each part cropped to what it covers; show: turned as the Weapons tab shows it. */
  function restParts(W, H, id, t, show) {
    const sides = id === "dual" ? [["L", true], ["R", false]] : [["", false]];
    // a margin past the screen's edges, so an arm that runs off it still fills the edge when the bob lifts it
    const pad = Math.ceil(((400 * Math.min(W, H)) / 420) * 0.06);
    return sides.map(([side, mirror]) => {
      const c = document.createElement("canvas");
      c.width = W + 2 * pad;
      c.height = H + 2 * pad;
      const g = c.getContext("2d");
      g.translate(pad, pad);
      const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      const mm = drawPart(g, W, H, id, t, restPose(id, mirror, b, show), 0, { draw: 0, loaded: true, twang: 0, now: 0 });
      const x0 = Math.max(-pad, Math.floor(b.x0));
      const y0 = Math.max(-pad, Math.floor(b.y0));
      const w = Math.max(1, Math.min(W + pad, Math.ceil(b.x1)) - x0);
      const h = Math.max(1, Math.min(H + pad, Math.ceil(b.y1)) - y0);
      const img = make(w, h, (cc) => cc.drawImage(c, x0 + pad, y0 + pad, w, h, 0, 0, w, h));
      c.width = c.height = 0; // let the full-size scratch go at once
      return { side, mirror, img, x: x0, y: y0, mm };
    });
  }
  /** Where the barrel of a weapon at rest points on a W x H view: its muzzle and a point further along the bore,
      on screen, for each hand (the art validator checks that the line through them meets the crosshair). */
  function muzzleLine(id, W, H) {
    return restParts(W, H, id, NO_MODS).map((pt) => pt.mm).filter((mm) => mm && mm.m);
  }
  /** How far the walk bob moves a part on screen from its rest position (the model sways a few mm). */
  function bobShift(id, bob, mirror, W, H) {
    const p = POSES[id];
    const F = (400 * Math.min(W, H)) / 420;
    const dx = Math.sin(bob) * p.sway[0];
    const dy = (1 - Math.abs(Math.cos(bob))) * p.sway[1];
    return [((mirror ? -1 : 1) * F * dx) / p.off[2], (-F * dy) / p.off[2]];
  }

  /** The weapon in hand. opts: weapon, mods (its { damage, range, rate, aim } tiers; read from the save
      when left out), bob, flash (shot kick timer), flashL / flashR (double pistols), draw and loaded
      (bow), raise (1 = just switched and out of sight, 0 = ready), live (always draw the model).
      At rest the weapon is drawn once per look and screen size, cropped, and placed with the bob; a
      shot's kick, the bow's draw or a switch draws the model live. Only one look is kept: a new look or a
      new window size replaces it, so resizes do not pile up canvases. */
  let restPic = { key: "", parts: null };
  function gun(ctx, W, H, opts) {
    const id = POSES[opts.weapon] ? opts.weapon : "pistol";
    const t = tiers(opts.mods || savedMods(id));
    const bob = opts.bob || 0;
    const raise = Math.max(0, Math.min(1, opts.raise || 0));
    const drop = raise * raise * 0.18;
    const kickOf = (f) => Math.min(1, (f || 0) / 0.08); // 1 on the shot, 0 at rest
    const flash = FLASH_SIZE[id] * (1 + 0.1 * t.d); // a bigger muzzle device throws a bigger flame
    const draw = id === "bow" ? Math.max(0, Math.min(1, opts.draw || 0)) : 0;
    const loaded = opts.loaded !== false;
    const kicks = id === "dual" ? [kickOf(opts.flashL), kickOf(opts.flashR)] : [kickOf(opts.flash)];
    const still = !opts.live && raise === 0 && kicks[0] === 0 && !kicks[1] && (id !== "bow" || (draw === 0 && loaded));
    ctx.save();
    if (still) {
      const key = id + ":" + t.d + t.r + t.f + t.a + ":" + W + "x" + H;
      if (restPic.key !== key) restPic = { key, parts: restParts(W, H, id, t) };
      restPic.parts.forEach((pt) => {
        const [dx, dy] = bobShift(id, pt.mirror ? bob + Math.PI : id === "hmg" ? bob * 0.8 : bob, pt.mirror, W, H);
        ctx.drawImage(pt.img, pt.x + dx, pt.y + dy);
        // the smoke of the last shots still drifts off the muzzle
        if (pt.mm) {
          const mz = muzzleState(id === "dual" ? "dual" + pt.side : id);
          if (mz.puffs.length) muzzleFx(ctx, pt.mm, [pt.mm.m[0] + dx, pt.mm.m[1] + dy], [pt.mm.ahead[0] + dx, pt.mm.ahead[1] + dy], 0, mz, flash);
        }
      });
    } else if (id === "dual") {
      // left hand first; it swings opposite the right as you walk
      [["L", true, kicks[0], bob + Math.PI], ["R", false, kicks[1], bob]].forEach(([side, mirror, kick, b]) => {
        const mm = drawPart(ctx, W, H, id, t, pose(id, b, kick, drop, mirror), kick);
        muzzleFx(ctx, mm, mm.m, mm.ahead, kick, muzzleState("dual" + side), flash);
      });
    } else if (id === "bow") {
      const o = pose(id, bob, 0, drop, false);
      if (draw > 0.95) o.off[0] += Math.sin(performance.now() / 45) * 0.0012; // holding a full draw is hard
      drawPart(ctx, W, H, id, t, o, 0, { draw, loaded: loaded && raise < 0.5, twang: kicks[0], now: performance.now() });
    } else {
      const kick = kicks[0];
      const mm = drawPart(ctx, W, H, id, t, pose(id, id === "hmg" ? bob * 0.8 : bob, kick, drop, false), kick); // the heavy gun has a slower stride
      muzzleFx(ctx, mm, mm.m, mm.ahead, kick, muzzleState(id), flash);
    }
    ctx.restore();
  }

  /** A weapon as you hold it, at rest, fitted into a w x h canvas: the cabin's Weapons tab shows its mods
      this way. One picture per weapon is kept, replaced when its mods change. */
  const views = {};
  function weaponView(id, mods, w, h) {
    const wid = POSES[id] ? id : "pistol";
    const t = tiers(mods);
    const key = "" + t.d + t.r + t.f + t.a + ":" + w + "x" + h;
    if (views[wid] && views[wid].key === key) return views[wid].img;
    const VW = 960;
    const VH = 600;
    const parts = restParts(VW, VH, wid, t, true);
    const ux = Math.min(...parts.map((p) => p.x));
    const uy = Math.min(...parts.map((p) => p.y));
    const all = make(Math.max(...parts.map((p) => p.x + p.img.width)) - ux, Math.max(...parts.map((p) => p.y + p.img.height)) - uy, (g) => parts.forEach((p) => g.drawImage(p.img, p.x - ux, p.y - uy)));
    // trim to what was really painted (an arm's tube can be counted where it runs off the view)
    let x0 = all.width;
    let y0 = all.height;
    let x1 = 0;
    let y1 = 0;
    const px = all.getContext("2d").getImageData(0, 0, all.width, all.height).data;
    for (let y = 0; y < all.height; y++) for (let x = 0; x < all.width; x++) {
      if (px[(y * all.width + x) * 4 + 3] < 16) continue;
      if (x < x0) x0 = x;
      if (x >= x1) x1 = x + 1;
      if (y < y0) y0 = y;
      if (y >= y1) y1 = y + 1;
    }
    if (x1 <= x0 || y1 <= y0) [x0, y0, x1, y1] = [0, 0, all.width, all.height];
    const k = Math.min(w / (x1 - x0), h / (y1 - y0));
    const img = make(w, h, (g) => {
      g.imageSmoothingEnabled = true;
      g.translate((w - (x1 - x0) * k) / 2, (h - (y1 - y0) * k) / 2);
      g.scale(k, k);
      g.drawImage(all, -x0, -y0);
    });
    views[wid] = { key, img };
    return img;
  }

  /* ---------- Weapon icons: side views, for pick-ups on the floor and the cabin's Weapons tab (128 x 64) ---------- */
  function inkShape(ctx, pts, fill) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.stroke();
  }
  function pistolSide(ctx) {
    // spans about 0..62 by 0..38, muzzle to the right
    inkShape(ctx, [[8, 3], [62, 3], [62, 14], [8, 14]], "#50545b");
    ctx.save();
    ctx.lineWidth = 1.5;
    for (let x = 12; x <= 22; x += 3.4) {
      ctx.beginPath();
      ctx.moveTo(x, 5);
      ctx.lineTo(x, 12);
      ctx.stroke();
    }
    ctx.restore();
    inkShape(ctx, [[10, 14], [60, 14], [60, 19], [32, 19], [28, 23], [10, 21]], "#2f3135");
    inkShape(ctx, [[9, 17], [27, 17], [23, 38], [6, 38], [4, 34]], "#26272a");
    ctx.beginPath();
    ctx.moveTo(28, 21);
    ctx.quadraticCurveTo(29, 29, 36, 29);
    ctx.quadraticCurveTo(42, 29, 42, 19);
    ctx.stroke();
    inkShape(ctx, [[10, 0.5], [14, 0.5], [14, 3], [10, 3]], "#26272a");
    inkShape(ctx, [[57, 0.5], [60, 0.5], [60, 3], [57, 3]], "#26272a");
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(10, 4.5, 50, 1.5);
  }
  const ICONS = {
    pistol(ctx) {
      ctx.translate(32, 13);
      pistolSide(ctx);
    },
    dual(ctx) {
      ctx.save();
      ctx.translate(14, 6);
      ctx.rotate(-0.06);
      pistolSide(ctx);
      ctx.restore();
      ctx.translate(48, 20);
      ctx.rotate(0.05);
      pistolSide(ctx);
    },
    mg(ctx) {
      ctx.translate(0, 6);
      inkShape(ctx, [[4, 14], [24, 17], [24, 29], [6, 36], [3, 33]], "#2a2b2e");
      inkShape(ctx, [[22, 17], [34, 17], [34, 24], [22, 24]], "#3a3d42");
      inkShape(ctx, [[52, 28], [62, 28], [67, 47], [57, 49]], "#2a2b2e");
      inkShape(ctx, [[38, 27], [47, 27], [45, 42], [36, 41]], "#26272a");
      inkShape(ctx, [[32, 12], [72, 12], [72, 29], [32, 29]], "#3c3f45");
      inkShape(ctx, [[34, 9], [98, 9], [98, 12], [34, 12]], "#2f3236");
      inkShape(ctx, [[36, 3], [43, 3], [43, 9], [36, 9]], "#2f3236");
      inkShape(ctx, [[72, 13], [99, 13], [99, 27], [72, 27]], "#2a2b2e");
      ctx.fillStyle = "#0f1012";
      for (let x = 75; x < 96; x += 5.5) ctx.fillRect(x, 17, 3.2, 6);
      inkShape(ctx, [[96, 13], [97, 2], [100, 2], [101, 13]], "#2f3236");
      inkShape(ctx, [[99, 18], [116, 18], [116, 22], [99, 22]], "#50545b");
      inkShape(ctx, [[116, 16.5], [123, 16.5], [123, 23.5], [116, 23.5]], "#3a3d42");
      ctx.beginPath();
      ctx.moveTo(47, 29);
      ctx.quadraticCurveTo(48, 36, 53, 36);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(33, 14, 38, 1.5);
    },
    hmg(ctx) {
      ctx.translate(0, 4);
      inkShape(ctx, [[2, 14], [22, 16], [22, 34], [4, 42], [1, 38]], "#3e4228");
      ctx.fillStyle = "#0f1012";
      ctx.fillRect(7, 21, 10, 11);
      inkShape(ctx, [[22, 32], [31, 32], [29, 48], [20, 47]], "#26272a");
      inkShape(ctx, [[34, 30], [58, 30], [58, 50], [34, 50]], "#3e4228");
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.strokeRect(34, 30, 24, 4);
      ctx.restore();
      label(ctx, "7.62", 46, 42, 7, "rgba(220,214,180,0.8)");
      for (let i = 0; i < 5; i++) {
        const x = 40 + i * 4.2;
        inkShape(ctx, [[x, 30 - i * 1.6], [x + 3, 30 - i * 1.6], [x + 3, 22 - i * 1.6], [x, 22 - i * 1.6]], "#c09a4a");
      }
      inkShape(ctx, [[20, 8], [62, 8], [62, 32], [20, 32]], "#545a38");
      inkShape(ctx, [[24, 5], [58, 5], [58, 8], [24, 8]], "#545a38");
      inkShape(ctx, [[62, 12], [106, 12], [106, 29], [62, 29]], "#3e4228");
      ctx.fillStyle = "#0f1012";
      for (let x = 65; x < 104; x += 5) {
        ctx.beginPath();
        ctx.arc(x + 1.5, 17, 1.6, 0, TAU);
        ctx.arc(x + 1.5, 24, 1.6, 0, TAU);
        ctx.fill();
      }
      ctx.save();
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(68, 12);
      ctx.quadraticCurveTo(78, -2, 90, 12);
      ctx.stroke();
      ctx.strokeStyle = "#545a38";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      inkShape(ctx, [[106, 18], [118, 18], [118, 23], [106, 23]], "#50545b");
      inkShape(ctx, [[118, 16], [126, 16], [126, 25], [118, 25]], "#3a3d42");
      ctx.save();
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(98, 29);
      ctx.lineTo(92, 48);
      ctx.moveTo(101, 29);
      ctx.lineTo(108, 48);
      ctx.stroke();
      ctx.restore();
    },
    bow(ctx) {
      // limbs and riser
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(42, 24);
      ctx.quadraticCurveTo(42, 8, 27, 4);
      ctx.quadraticCurveTo(30, 2, 32, 1);
      ctx.moveTo(42, 40);
      ctx.quadraticCurveTo(42, 56, 27, 60);
      ctx.quadraticCurveTo(30, 62, 32, 63);
      ctx.stroke();
      ctx.strokeStyle = "#8a5a2e";
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#ece4cc";
      ctx.beginPath();
      ctx.moveTo(27, 4);
      ctx.lineTo(27, 60);
      ctx.stroke();
      ctx.restore();
      inkShape(ctx, [[38, 20], [47, 22], [48, 42], [38, 44], [36, 32]], "#6b4424");
      inkShape(ctx, [[37, 30], [48, 30], [48, 38], [37, 38]], "#2b2620");
      // arrow
      ctx.save();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(24, 31);
      ctx.lineTo(112, 31);
      ctx.stroke();
      ctx.strokeStyle = "#5a524a";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      inkShape(ctx, [[110, 26], [124, 31], [110, 36]], "#9ea3aa");
      inkShape(ctx, [[27, 31], [33, 24], [44, 24], [40, 31]], "#b3261e");
      inkShape(ctx, [[27, 31], [33, 38], [44, 38], [40, 31]], "#e9e2cc");
    },
  };
  function weaponIcon(id) {
    return cached("weapon:" + id, 128, 64, (ctx, w, h) => {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(w / 2, h - 5, 52, 5, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.save();
      (ICONS[id] || ICONS.pistol)(ctx);
      ctx.restore();
    });
  }

  function crosshair(ctx, cx, cy, hot, gap) {
    const g = Math.max(5, gap || 5);
    ctx.save();
    ctx.strokeStyle = hot ? "#b3261e" : "#f3eee0";
    ctx.lineWidth = 3;
    ctx.shadowColor = INK;
    ctx.shadowBlur = 0;
    [[-g - 9, 0, -g, 0], [g, 0, g + 9, 0], [0, -g - 9, 0, -g], [0, g, 0, g + 9]].forEach(([a, b, c, d]) => {
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
    texture, item, note, key, scrap, trap, gun, weaponView, weaponIcon, crosshair, shade, mix, rng, label, halftone, border, POSES, muzzleLine,
    // registration API for other modules (decor, landmarks, yard builds)
    registerTexture, hasTexture, registerSprite, hasSprite, sprite, registerFloor, floorId, floorTexels, wallBase, dim,
    WALL_STYLES: Object.keys(WALL_STYLES), SHADES, SHADE_MAX, INK,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
