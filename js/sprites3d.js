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
    wall(ctx, w, h, p) {
      ctx.fillStyle = p.wall;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 2;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, h - 10, w, 10);
      halftone(ctx, w, h, 0.08);
      border(ctx, w, h);
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

  function texture(kind, palette) {
    // the van textures take their colors from the current paint job
    const paint = kind.startsWith("van") ? ":" + vanLook().body : "";
    const key = "tex:" + kind + ":" + (palette ? palette.wall + palette.shelf + palette.counter : "") + paint;
    return cached(key, 64, 64, (ctx, w, h) => TEX[kind](ctx, w, h, palette || {}));
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

  /* ---------- Walker sprites (front view, 96 x 128 units at 2x for detail) ----------
     Gaunt and grimy rather than gory (the audience is teens): mottled grey-green skin,
     hollow cheeks and sockets, milky eyes, a slack open jaw, ragged clothes, bony hands
     reaching for the player. Seeded noise keeps both walk frames identical except the pose. */
  const LOOK = {
    walker: { seed: 7, skin: "#9aa38c", shirt: "#5d6670", pants: "#394150", shoe: "#2a2522", hair: "#2e2a25", sleeve: "short", eye: "#e6e3c4", glow: "rgba(230,226,170,0.85)", jaw: 4 },
    runner: { seed: 19, skin: "#a7ab99", shirt: "#3a3f4d", pants: "#24272e", shoe: "#1d1d20", hair: "#1f2226", sleeve: "long", hood: true, eye: "#f0e7a0", glow: "rgba(244,226,120,0.95)", jaw: 6 },
    brute: { seed: 31, skin: "#808b74", shirt: "#7a705a", pants: "#35332c", shoe: "#26221d", hair: "#24211d", sleeve: "none", bald: true, eye: "#dcdcc0", glow: "rgba(220,220,170,0.8)", jaw: 5 },
  };
  function seededRng(seed) {
    let s = seed * 9301 + 49297;
    return () => ((s = (s * 16807) % 2147483647) / 2147483647);
  }
  /* A limb as an inked tube with a soft highlight down one side. */
  function tube(ctx, pts, width, color, ink) {
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    };
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    path();
    ctx.strokeStyle = ink || INK;
    ctx.lineWidth = width + 2.4;
    ctx.stroke();
    path();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.save();
    ctx.translate(-width * 0.18, -width * 0.1);
    path();
    ctx.strokeStyle = "rgba(255,255,255,0.13)";
    ctx.lineWidth = width * 0.35;
    ctx.stroke();
    ctx.restore();
  }
  /* Bony, long-nailed hand with splayed fingers; dir is the way the fingers point. */
  function claw(ctx, x, y, dir, size, skin) {
    const fingers = [-0.75, -0.25, 0.22, 0.68];
    ctx.lineCap = "round";
    fingers.forEach((off, i) => {
      const a = dir + off;
      const len = size * (i === 0 || i === 3 ? 1.45 : 1.8);
      const kx = x + Math.cos(a) * len * 0.55;
      const ky = y + Math.sin(a) * len * 0.55;
      const bend = a + (off < 0 ? 0.45 : -0.45);
      const tx = kx + Math.cos(bend) * len * 0.55;
      const ty = ky + Math.sin(bend) * len * 0.55;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(kx, ky);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.9;
      ctx.stroke();
      ctx.strokeStyle = skin;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // knuckle and dark nail
      ctx.fillStyle = shade(skin, 18);
      ctx.beginPath();
      ctx.arc(kx, ky, 1, 0, TAU);
      ctx.fill();
      // long, dark, broken nail
      ctx.strokeStyle = "#2b2a22";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + Math.cos(bend) * 1.6, ty + Math.sin(bend) * 1.6);
      ctx.stroke();
    });
    // thumb
    const ta = dir + (Math.cos(dir) > 0 ? -1.5 : 1.5);
    tube(ctx, [[x, y], [x + Math.cos(ta) * size * 0.9, y + Math.sin(ta) * size * 0.9]], 2.2, skin);
    // palm
    ctx.fillStyle = skin;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.5, size * 0.4, dir, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(40,45,35,0.35)";
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(dir) * 1.2, y + Math.sin(dir) * 1.2, size * 0.32, size * 0.22, dir, 0, TAU);
    ctx.fill();
  }
  /* Translucent blotches clipped to the current path: grime, bruising, mottled skin. */
  function blotches(ctx, rnd, n, x0, y0, w, h, colors, rMin, rMax) {
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.ellipse(x0 + rnd() * w, y0 + rnd() * h, rMin + rnd() * (rMax - rMin), rMin + rnd() * (rMax - rMin) * 0.7, rnd() * 3, 0, TAU);
      ctx.fill();
    }
  }

  function walker(type, frame, hit) {
    return cached("walker:" + type + ":" + frame + ":" + (hit ? 1 : 0), 192, 256, (ctx, w, h) => {
      const L = LOOK[type] || LOOK.walker;
      const rnd = seededRng(L.seed);
      const swing = frame ? 1 : -1;
      // brutes are broader, runners leaner; height stays inside the canvas
      const sx = type === "brute" ? 1.22 : type === "runner" ? 0.9 : 1;
      const sy = type === "brute" ? 1.03 : type === "runner" ? 0.98 : 1;
      ctx.save();
      ctx.translate(w / 2, h);
      ctx.scale(2 * sx, 2 * sy);
      ctx.lineJoin = "round";

      // ground shadow
      const sh = ctx.createRadialGradient(0, -2, 1, 0, -2, 26);
      sh.addColorStop(0, "rgba(0,0,0,0.5)");
      sh.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.ellipse(0, -2, 26, 5, 0, 0, TAU);
      ctx.fill();

      // legs: one dragging, one stepping
      const legs = [
        { hip: [-9, -50], knee: [-11 + swing, -27], foot: [-13 + swing * 2, -4 - (swing > 0 ? 2 : 0)], torn: false },
        { hip: [9, -50], knee: [11 - swing, -28], foot: [12 - swing * 2, -4 - (swing < 0 ? 2 : 0)], torn: true },
      ];
      legs.forEach((g) => {
        if (g.torn) {
          // shredded trouser leg: bare shin below the knee
          tube(ctx, [g.knee, g.foot], 6.5, shade(L.skin, -14));
          tube(ctx, [g.hip, g.knee, [g.knee[0] + (g.foot[0] - g.knee[0]) * 0.35, g.knee[1] + (g.foot[1] - g.knee[1]) * 0.35]], 12, L.pants);
          ctx.fillStyle = L.pants;
          ctx.strokeStyle = INK;
          ctx.lineWidth = 1.2;
          const cx = g.knee[0] + (g.foot[0] - g.knee[0]) * 0.35;
          const cy = g.knee[1] + (g.foot[1] - g.knee[1]) * 0.35;
          ctx.beginPath();
          ctx.moveTo(cx - 6.5, cy - 1);
          ctx.lineTo(cx - 5, cy + 6);
          ctx.lineTo(cx - 2, cy + 2);
          ctx.lineTo(cx + 1, cy + 8);
          ctx.lineTo(cx + 3, cy + 2);
          ctx.lineTo(cx + 6.5, cy + 5);
          ctx.lineTo(cx + 6.5, cy - 1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          tube(ctx, [g.hip, g.knee, g.foot], 12, L.pants);
          // knee wear and grime on the cloth
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.beginPath();
          ctx.ellipse(g.knee[0], g.knee[1], 4, 3, 0, 0, TAU);
          ctx.fill();
        }
        // worn shoe
        ctx.fillStyle = L.shoe;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(g.foot[0], g.foot[1] + 1, 8, 4, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath();
        ctx.ellipse(g.foot[0] - 2, g.foot[1], 4, 1.4, 0, 0, TAU);
        ctx.fill();
      });

      // the far arm reaches too, lower and a beat behind
      const farHand = [-27 - swing * 2, -70 + swing * 3];
      tube(ctx, [[-19, -86], [-29, -76], farHand], 5.5, shade(L.skin, -22));
      if (L.sleeve !== "none") tube(ctx, [[-19, -86], L.sleeve === "long" ? [-28, -73] : [-25, -80]], 9, shade(L.shirt, -15));
      claw(ctx, farHand[0], farHand[1] - 2, -Math.PI / 2 - 0.55, 6, shade(L.skin, -22));

      // hood behind the head
      const hx = 3;
      const hy = -106;
      if (L.hood) {
        ctx.fillStyle = shade(L.shirt, -12);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(hx, hy + 1, 18, 21, 0.12, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }

      // hunched torso: one shoulder dropped, ragged hem
      const torso = () => {
        ctx.beginPath();
        ctx.moveTo(-23, -84);
        ctx.quadraticCurveTo(-20, -93, -6, -94);
        ctx.lineTo(8, -96);
        ctx.quadraticCurveTo(22, -95, 24, -88);
        ctx.lineTo(19, -52);
        for (let x = 19, i = 0; x > -19; x -= 4.75, i++) ctx.lineTo(x - 2.4, -50 + (i % 2 ? -4 : 3) + rnd() * 2);
        ctx.lineTo(-19, -52);
        ctx.closePath();
      };
      torso();
      const tg = ctx.createLinearGradient(-24, 0, 24, 0);
      tg.addColorStop(0, shade(L.shirt, -30));
      tg.addColorStop(0.35, shade(L.shirt, 12));
      tg.addColorStop(1, shade(L.shirt, -38));
      ctx.fillStyle = tg;
      ctx.fill();
      ctx.save();
      torso();
      ctx.clip();
      // shadow under the chest and around the waist
      const vg = ctx.createLinearGradient(0, -96, 0, -48);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(0.55, "rgba(0,0,0,0.05)");
      vg.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = vg;
      ctx.fillRect(-30, -100, 60, 56);
      // a rip over the ribs: grey skin and the shadow of each rib
      ctx.fillStyle = shade(L.skin, -18);
      ctx.beginPath();
      ctx.moveTo(4, -80);
      ctx.lineTo(13, -84);
      ctx.lineTo(16, -74);
      ctx.lineTo(12, -63);
      ctx.lineTo(6, -67);
      ctx.lineTo(8, -72);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(25,30,22,0.55)";
      ctx.lineWidth = 0.9;
      for (let r = 0; r < 4; r++) {
        ctx.beginPath();
        ctx.moveTo(6, -79 + r * 4);
        ctx.quadraticCurveTo(10, -81 + r * 4, 15, -78 + r * 4);
        ctx.stroke();
      }
      // collar opening, grime, fold lines
      ctx.fillStyle = shade(L.skin, -30);
      ctx.beginPath();
      ctx.ellipse(1, -94, 8, 4.5, 0.1, 0, TAU);
      ctx.fill();
      blotches(ctx, rnd, 9, -22, -94, 44, 44, ["rgba(45,38,28,0.35)", "rgba(25,22,20,0.4)", "rgba(70,60,40,0.25)"], 2, 7);
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.9;
      [[-14, -84, -10, -66], [-4, -82, -7, -60], [16, -88, 12, -80]].forEach(([a, b, c, d]) => {
        ctx.beginPath();
        ctx.moveTo(a, b);
        ctx.quadraticCurveTo((a + c) / 2 + 2, (b + d) / 2, c, d);
        ctx.stroke();
      });
      if (L.hood) {
        // hoodie zip and pocket
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.moveTo(1, -92);
        ctx.lineTo(0, -52);
        ctx.stroke();
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.strokeRect(-12, -66, 24, 10);
      }
      if (L.sleeve === "none") {
        // stained undershirt straps over bare shoulders
        ctx.fillStyle = shade(L.skin, -10);
        ctx.beginPath();
        ctx.moveTo(-24, -95);
        ctx.lineTo(-12, -95);
        ctx.quadraticCurveTo(-13, -84, -24, -78);
        ctx.closePath();
        ctx.moveTo(25, -97);
        ctx.lineTo(13, -97);
        ctx.quadraticCurveTo(14, -86, 25, -80);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      torso();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // threads hanging from the hem
      ctx.strokeStyle = shade(L.shirt, -20);
      ctx.lineWidth = 0.9;
      [-14, -3, 9, 15].forEach((x, i) => {
        ctx.beginPath();
        ctx.moveTo(x, -50);
        ctx.quadraticCurveTo(x + 1, -46, x - 1 + i, -42 - (i % 2) * 2);
        ctx.stroke();
      });

      // thin neck with cords
      tube(ctx, [[1, -92], [hx - 0.5, -101]], 7, shade(L.skin, -16));
      ctx.strokeStyle = "rgba(30,35,28,0.5)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-1.5, -93);
      ctx.lineTo(0.5, -100);
      ctx.moveTo(3.5, -93);
      ctx.lineTo(4.5, -100);
      ctx.stroke();

      // head, tilted and pushed forward
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(type === "runner" ? -0.12 : 0.16);
      ctx.scale(0.9, 0.92);
      const skull = () => {
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.bezierCurveTo(10, -16.5, 13.5, -10, 13, -3);
        ctx.bezierCurveTo(12.5, 4, 10.5, 8, 7.5, 11.5);
        ctx.bezierCurveTo(5, 14, 3, 15 + L.jaw * 0.4, 0, 15 + L.jaw * 0.5);
        ctx.bezierCurveTo(-3, 15 + L.jaw * 0.4, -5, 14, -7.5, 11.5);
        ctx.bezierCurveTo(-10.5, 8, -12.5, 4, -13, -3);
        ctx.bezierCurveTo(-13.5, -10, -10, -16.5, 0, -16);
        ctx.closePath();
      };
      // ears
      ctx.fillStyle = shade(L.skin, -20);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      [-1, 1].forEach((s) => {
        if (L.hood) return;
        ctx.beginPath();
        ctx.ellipse(s * 12.8, 0, 2.6, 4.2, s * 0.2, 0, TAU);
        ctx.fill();
        ctx.stroke();
      });
      skull();
      const hg = ctx.createRadialGradient(-4, -6, 2, 0, 0, 19);
      hg.addColorStop(0, shade(L.skin, 22));
      hg.addColorStop(0.6, L.skin);
      hg.addColorStop(1, shade(L.skin, -40));
      ctx.fillStyle = hg;
      ctx.fill();
      ctx.save();
      skull();
      ctx.clip();
      // mottled, bruised skin
      blotches(ctx, rnd, 14, -13, -16, 26, 32, ["rgba(70,80,60,0.22)", "rgba(80,70,95,0.18)", "rgba(40,45,35,0.2)", "rgba(150,150,120,0.15)"], 1.5, 4.5);
      // veins at the temples
      ctx.strokeStyle = "rgba(55,50,85,0.5)";
      ctx.lineWidth = 0.6;
      [[-11, -6, -7, -12, -4, -10], [10, -4, 8, -10, 5, -13], [-9, 4, -11, 0, -12, -4]].forEach(([a, b, c, d, e, f]) => {
        ctx.beginPath();
        ctx.moveTo(a, b);
        ctx.quadraticCurveTo(c, d, e, f);
        ctx.stroke();
      });
      // brow ridge shadow
      const bg = ctx.createLinearGradient(0, -8, 0, 2);
      bg.addColorStop(0, "rgba(0,0,0,0)");
      bg.addColorStop(0.6, "rgba(0,0,0,0.35)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(-14, -8, 28, 10);
      // hollow cheeks
      [-1, 1].forEach((s) => {
        const cg = ctx.createRadialGradient(s * 7.5, 6.5, 0.5, s * 7.5, 6.5, 5.5);
        cg.addColorStop(0, "rgba(20,25,18,0.55)");
        cg.addColorStop(1, "rgba(20,25,18,0)");
        ctx.fillStyle = cg;
        ctx.fillRect(s * 7.5 - 6, 0.5, 12, 12);
        // cheekbone catch-light
        ctx.fillStyle = "rgba(255,255,235,0.14)";
        ctx.beginPath();
        ctx.ellipse(s * 7.5, 1.6, 3.2, 1.1, s * -0.3, 0, TAU);
        ctx.fill();
      });
      // deep sockets
      [[-5, -2.5, 4.8], [5.2, -2, 4.6]].forEach(([x, y, r]) => {
        const eg = ctx.createRadialGradient(x, y, 0.5, x, y, r);
        eg.addColorStop(0, "rgba(8,8,10,0.95)");
        eg.addColorStop(0.65, "rgba(15,15,18,0.75)");
        eg.addColorStop(1, "rgba(15,15,18,0)");
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.85, 0, 0, TAU);
        ctx.fill();
      });
      ctx.restore();
      skull();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // milky, faintly glowing eyes, pupils wandering apart
      ctx.save();
      ctx.shadowColor = L.glow;
      ctx.shadowBlur = 7;
      ctx.fillStyle = L.eye;
      ctx.beginPath();
      ctx.ellipse(-5, -1.9, 1.9, 1.15, 0.12, 0, TAU);
      ctx.ellipse(5.2, -1.5, 1.8, 1.1, -0.12, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "rgba(60,60,40,0.8)";
      ctx.beginPath();
      ctx.arc(-4.5, -1.8, 0.6, 0, TAU);
      ctx.arc(5.8, -1.5, 0.55, 0, TAU);
      ctx.fill();
      // heavy lids slanting down to the nose: a fixed, hungry glare
      ctx.fillStyle = shade(L.skin, -48);
      ctx.beginPath();
      ctx.moveTo(-8, -4.6);
      ctx.lineTo(-1.8, -2.2);
      ctx.lineTo(-2.6, -1.5);
      ctx.quadraticCurveTo(-5, -2.6, -7.6, -2.2);
      ctx.closePath();
      ctx.moveTo(8.2, -4.2);
      ctx.lineTo(2, -1.9);
      ctx.lineTo(2.8, -1.2);
      ctx.quadraticCurveTo(5.2, -2.3, 7.8, -1.8);
      ctx.closePath();
      ctx.fill();
      // furrowed brow
      ctx.strokeStyle = "rgba(20,24,18,0.6)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(-1.2, -5.5);
      ctx.lineTo(-0.4, -3);
      ctx.moveTo(1.4, -5.5);
      ctx.lineTo(0.8, -3);
      ctx.moveTo(-6, -8);
      ctx.quadraticCurveTo(-3, -7, -1.5, -5.8);
      ctx.moveTo(6.5, -7.6);
      ctx.quadraticCurveTo(3.5, -6.8, 2, -5.6);
      ctx.stroke();

      // narrow, shadowed nose
      ctx.strokeStyle = "rgba(20,24,18,0.55)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0.4, -1);
      ctx.quadraticCurveTo(1.6, 3, 0.8, 5.2);
      ctx.stroke();
      ctx.fillStyle = "rgba(10,10,10,0.75)";
      ctx.beginPath();
      ctx.ellipse(-1.3, 5.6, 1, 0.6, 0.3, 0, TAU);
      ctx.ellipse(1.9, 5.6, 1, 0.6, -0.3, 0, TAU);
      ctx.fill();

      // slack open jaw, cracked lips, uneven yellowed teeth
      const my = 9.5;
      const mh = L.jaw;
      ctx.fillStyle = "#4d4650";
      ctx.beginPath();
      ctx.ellipse(0, my + mh * 0.5, 5.6, mh * 0.5 + 1.6, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#0b0a0c";
      ctx.beginPath();
      ctx.moveTo(-4.6, my);
      ctx.quadraticCurveTo(0, my - 1.2, 4.6, my + 0.3);
      ctx.quadraticCurveTo(3.6, my + mh + 0.6, 0, my + mh + 0.8);
      ctx.quadraticCurveTo(-3.8, my + mh + 0.4, -4.6, my);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#cfc59a";
      ctx.strokeStyle = "rgba(30,25,15,0.8)";
      ctx.lineWidth = 0.4;
      [[-3.6, 1.3], [-2.2, 1.7], [-0.8, 1.9], [0.7, 1.6], [2.1, 1.9], [3.4, 1.2]].forEach(([x, th], i) => {
        if (i === 4) return; // a missing tooth
        ctx.fillRect(x - 0.6, my - 0.2, 1.25, th);
        ctx.strokeRect(x - 0.6, my - 0.2, 1.25, th);
      });
      [[-2.6, 1.2], [-1, 1.4], [1.6, 1.1]].forEach(([x, th]) => {
        ctx.fillRect(x - 0.6, my + mh + 0.4 - th, 1.2, th);
        ctx.strokeRect(x - 0.6, my + mh + 0.4 - th, 1.2, th);
      });

      // hair: thin and matted, or a few strands on a bald crown, or the hood's rim
      if (L.hood) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.4;
        ctx.fillStyle = L.shirt;
        ctx.beginPath();
        ctx.moveTo(-15, 8);
        ctx.bezierCurveTo(-17, -12, -10, -20, 0, -20);
        ctx.bezierCurveTo(11, -20, 17, -12, 15, 8);
        ctx.lineTo(13, 6);
        ctx.bezierCurveTo(14, -10, 9, -16.5, 0, -16.5);
        ctx.bezierCurveTo(-9, -16.5, -14, -10, -13, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -2, 17, Math.PI * 1.15, Math.PI * 1.6);
        ctx.stroke();
        // a few strands escaping the hood
        ctx.strokeStyle = L.hair;
        ctx.lineWidth = 0.9;
        [[-8, -15, -10, -6], [-4, -16, -6, -9], [7, -15, 9, -8]].forEach(([a, b, c, d]) => {
          ctx.beginPath();
          ctx.moveTo(a, b);
          ctx.quadraticCurveTo(a - 1, (b + d) / 2, c, d);
          ctx.stroke();
        });
      } else {
        ctx.strokeStyle = L.hair;
        const strands = L.bald ? 6 : 22;
        for (let i = 0; i < strands; i++) {
          const a = Math.PI * (1.08 + (i / strands) * 0.84);
          const x0 = Math.cos(a) * 13.5;
          const y0 = Math.sin(a) * 15;
          const fall = L.bald ? 3 + rnd() * 2 : 5 + rnd() * 9 * Math.abs(Math.cos(a));
          ctx.lineWidth = L.bald ? 0.6 : 0.8 + rnd() * 0.7;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 4, -15.5);
          ctx.quadraticCurveTo(x0 * 1.1, y0 * 1.05, x0 + (x0 > 0 ? 1.5 : -1.5), y0 + fall);
          ctx.stroke();
        }
        if (!L.bald) {
          ctx.fillStyle = L.hair;
          ctx.beginPath();
          ctx.moveTo(-11, -9);
          ctx.bezierCurveTo(-11, -17, 9, -19, 12, -8);
          ctx.bezierCurveTo(7, -14, 1, -12, -2, -14);
          ctx.bezierCurveTo(-5, -11, -8, -12, -11, -9);
          ctx.fill();
        }
      }
      ctx.restore();

      // near arm: reaching for the player at face height, hand big and close
      const nearHand = [22 + swing * 2, -88 - swing * 3];
      tube(ctx, [[19, -88], [30, -80], nearHand], 6.5, L.skin);
      if (L.sleeve === "short") tube(ctx, [[19, -88], [25, -84]], 10, shade(L.shirt, -6));
      if (L.sleeve === "long") tube(ctx, [[19, -88], [30, -80], [nearHand[0] + 4, nearHand[1] + 4]], 10, shade(L.shirt, -4));
      // tendons on the forearm
      ctx.strokeStyle = "rgba(30,35,25,0.4)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(29, -80);
      ctx.lineTo(nearHand[0] + 2, nearHand[1] + 3);
      ctx.stroke();
      claw(ctx, nearHand[0], nearHand[1] - 2, -Math.PI / 2 + 0.35, type === "brute" ? 8.5 : 7.5, L.skin);

      if (hit) {
        // the shot lands: flash only the figure, not the box around it
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(-60, -140, 120, 140);
        ctx.globalCompositeOperation = "source-over";
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

  /* ---------- Weapon and crosshair, drawn directly ----------
     The pistol is a small 3D model (metres; x right, y up, z forward; origin at the top
     of the slide's rear) projected in perspective and turned in toward the crosshair.
     Prism faces are back-face culled and lit from over the left shoulder. The gloved
     hand is two leather shapes laid on the grip (palm and thumb, then the fingers);
     wrist and sleeve are tubes. */
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

  // muzzle smoke outlives the 80 ms kick, so it keeps its own clock between frames
  const muzzle = { last: 0, shots: 0, puffs: [] };

  function gun(ctx, W, H, opts) {
    const bob = opts.bob || 0;
    const kick = Math.min(1, (opts.flash || 0) / 0.08); // 1 on the shot, 0 at rest
    const s = Math.min(W, H) / 420;
    const F = 400 * s;
    const cx = W / 2;
    const cy = H / 2;
    // where the gun sits relative to the eye, plus walk sway and recoil
    const off = [0.098 + Math.sin(bob) * 0.005, -0.04 - Math.abs(Math.cos(bob)) * 0.006, 0.27 - kick * 0.012];
    const pitch = kick * 0.08; // muzzle climbs on the shot
    const yaw = 0.6; // turned in toward the crosshair, so the left side shows
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const cw = Math.cos(yaw);
    const sw = Math.sin(yaw);
    const pivot = [0, -0.07, 0.03];
    const world = (p) => {
      const x = p[0] - pivot[0];
      const y = p[1] - pivot[1];
      const z = p[2] - pivot[2];
      const y1 = y * cp + z * sp;
      const z1 = -y * sp + z * cp;
      return [x * cw - z1 * sw + pivot[0] + off[0], y1 + pivot[1] + off[1], x * sw + z1 * cw + pivot[2] + off[2]];
    };
    const screen = (q) => [cx + (F * q[0]) / q[2], cy - (F * q[1]) / q[2]];
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
    /* A wrist or sleeve: tubes between 3D joints (radius in metres) drawn as one silhouette,
       outline first, then fill, then a sheen along the top. */
    const limbs = (parts, color) => {
      const tubes = parts.map(([joints, radius]) => {
        const q = joints.map(world);
        return { scr: q.map(screen), w: q.map((p) => (2 * radius * F) / p[2]) };
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

    ctx.save();

    // the shooting arm comes up from the bottom right: jacket sleeve, then the glove's cuff
    limbs([[[[0.1, -0.36, -0.12], [0.035, -0.205, -0.07]], 0.036]], SLEEVE);
    limbs([[[[0.04, -0.215, -0.072], [0.006, -0.125, -0.04]], 0.024]], GLOVE);
    limbs([[[[0.042, -0.22, -0.074], [0.03, -0.19, -0.064]], 0.027]], CUFF);

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

    // trigger guard and the trigger behind it
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const guard = [[0, -0.05, 0.06], [0, -0.068, 0.066], [0, -0.073, 0.08], [0, -0.073, 0.118], [0, -0.066, 0.128], [0, -0.05, 0.13]].map((p) => P(...p));
    const strokeLine = (pts, width, color) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };
    const guardW = (0.006 * F) / (off[2] + 0.09);
    strokeLine(guard, guardW + 2 * s, "#0b0b0c");
    strokeLine(guard, guardW, rgb(POLYMER, 1.1));
    strokeLine([[0, -0.05, 0.082], [0, -0.06, 0.085], [0, -0.066, 0.08]].map((p) => P(...p)), guardW * 0.8, rgb(STEEL, 0.8));

    // frame (dust cover) under the slide, with the slide stop
    const frame = prism([[-0.0115, -0.05], [0.0115, -0.05], [0.0115, -0.03], [-0.0115, -0.03]], (u, v, t) => [u, v, -0.004 + t * 0.186], POLYMER, 0.25);
    if (frame[3]) {
      polygon([onQuad(frame[3], 0.3, 0.2), onQuad(frame[3], 0.42, 0.2), onQuad(frame[3], 0.42, 0.45), onQuad(frame[3], 0.3, 0.45)]);
      ctx.fillStyle = rgb(STEEL, 0.6);
      ctx.fill();
    }

    // slide (cocked back on the shot), bevelled top, cocking serrations
    const back = -kick * 0.022;
    const slide = prism(
      [[-0.0128, -0.031], [0.0128, -0.031], [0.0128, -0.006], [0.0085, 0], [-0.0085, 0], [-0.0128, -0.006]],
      (u, v, t) => [u, v, back + t * 0.188],
      STEEL,
      1
    );
    if (slide[5]) {
      // left face: serrations at the rear
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.lineWidth = Math.max(1, 1.2 * s);
      for (let i = 0; i < 8; i++) {
        const a = 0.03 + i * 0.022;
        const p0 = onQuad(slide[5], 0.15, a);
        const p1 = onQuad(slide[5], 0.95, a);
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.stroke();
      }
    }
    // ejection port on top: the barrel hood shows through
    const port = [[0.0, 0.0002, 0.03], [0.0085, 0.0002, 0.03], [0.0085, 0.0002, 0.078], [0.0, 0.0002, 0.078]].map(([x, y, z]) => P(x, y, z + back));
    polygon(port);
    ctx.fillStyle = "#1a1b1e";
    ctx.fill();
    polygon([P(0.0012, 0.0004, 0.034 + back * 0.2), P(0.0075, 0.0004, 0.034 + back * 0.2), P(0.0075, 0.0004, 0.074), P(0.0012, 0.0004, 0.074)]);
    ctx.fillStyle = rgb([92, 88, 80], 1);
    ctx.fill();
    // bright edge along the top bevel
    strokeLine([P(-0.0085, 0.0003, back + 0.002), P(-0.0085, 0.0003, back + 0.186)], Math.max(1, 1.2 * s), "rgba(220,225,235,0.35)");

    // sights: rear notch with two dots, front post with one
    const box = (x0, x1, y0, y1, z0, z1, color) => prism([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], (u, v, t) => [u, v, z0 + t * (z1 - z0)], color, 0.5);
    box(-0.0105, -0.0024, 0, 0.0065, back + 0.012, back + 0.022, POLYMER);
    box(0.0024, 0.0105, 0, 0.0065, back + 0.012, back + 0.022, POLYMER);
    box(-0.0017, 0.0017, 0, 0.0062, back + 0.174, back + 0.182, POLYMER);
    const dot3 = (x, y, z, r) => {
      const q = world([x, y, z]);
      const p = screen(q);
      ctx.fillStyle = "#e8e6da";
      ctx.beginPath();
      ctx.arc(p[0], p[1], Math.max(0.8, (r * F) / q[2]), 0, TAU);
      ctx.fill();
    };
    dot3(-0.0064, 0.0034, back + 0.0118, 0.0011);
    dot3(0.0064, 0.0034, back + 0.0118, 0.0011);
    dot3(0, 0.0036, back + 0.1738, 0.0009);

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

    // muzzle flash: brief and hot. A white core, a short plume along the bore, a few
    // ragged petals and sparks that differ shot to shot, and a warm glow nearby.
    const m = P(0, -0.014, back + 0.192);
    const ahead = P(0, -0.014, back + 0.32);
    const ang = Math.atan2(ahead[1] - m[1], ahead[0] - m[0]);
    const now = performance.now();
    if (kick > muzzle.last + 0.05) {
      muzzle.shots++;
      muzzle.puffs.push({ t0: now, seed: muzzle.shots });
      if (muzzle.puffs.length > 6) muzzle.puffs.shift();
    }
    muzzle.last = kick;
    const r = 30 * s;
    if (kick > 0) {
      const glow = ctx.createRadialGradient(m[0], m[1], 0, m[0], m[1], r * 4);
      glow.addColorStop(0, "rgba(255,205,130," + (0.32 * kick).toFixed(3) + ")");
      glow.addColorStop(1, "rgba(255,160,70,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(m[0] - r * 4, m[1] - r * 4, r * 8, r * 8);
    }
    const hot = Math.max(0, (kick - 0.4) / 0.6); // the flame itself lasts about half the kick
    if (hot > 0) {
      const rnd = seededRng(muzzle.shots * 7 + 3);
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
    muzzle.puffs = muzzle.puffs.filter((puff) => now - puff.t0 < 700);
    muzzle.puffs.forEach((puff) => {
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

  ZSR.Draw3 = { texture, walker, item, note, scrap, trap, gun, crosshair, shade };
})(typeof globalThis !== "undefined" ? globalThis : this);
