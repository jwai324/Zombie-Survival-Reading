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
    /* A printed sign on the wall: a board with a red header and lines of text (read it up close). */
    sign(ctx, w, h, p) {
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
    graffiti(ctx, w, h, p) {
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

  /* ---------- Yard lots (80 x 64): an empty lot with a painted sign, then the room as it is built ---------- */
  function lot(room, level) {
    return cached("lot:" + room + ":" + level, 80, 64, (ctx, w, h) => {
      const G = h - 6; // ground line
      ctx.lineJoin = "round";
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.beginPath();
      ctx.ellipse(w / 2, G, 36, 5, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      const rect = (x, y, rw, rh, c) => {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, rw, rh);
        ctx.strokeRect(x, y, rw, rh);
      };
      const line = (pts, c, lw) => {
        ctx.strokeStyle = c || INK;
        ctx.lineWidth = lw || 2;
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
      };
      const circle = (x, y, r, c) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        ctx.stroke();
      };
      if (!level) {
        // stakes and string around bare dirt
        ctx.fillStyle = "#5a4535";
        ctx.beginPath();
        ctx.moveTo(18, G - 2);
        ctx.lineTo(70, G - 2);
        ctx.lineTo(62, G - 10);
        ctx.lineTo(26, G - 10);
        ctx.closePath();
        ctx.fill();
        [[18, G - 2], [70, G - 2], [62, G - 10], [26, G - 10]].forEach(([x, y]) => rect(x - 1.5, y - 8, 3, 8, "#c9b78a"));
        line([[18, G - 9], [26, G - 17], [62, G - 17], [70, G - 9], [18, G - 9]], "#f3eee0", 1);
      } else if (room === "garden") {
        for (let i = 0; i < level; i++) {
          const x = 24 + i * 18;
          rect(x, G - 9, 15, 7, "#8a5a2e");
          for (let j = 0; j < 3; j++) line([[x + 3 + j * 4.5, G - 9], [x + 3 + j * 4.5, G - 15 - (j % 2) * 3]], "#7a9a3c", 2.5);
        }
      } else if (room === "farm") {
        for (let i = 0; i < 6; i++) line([[24 + i * 4, G - 2], [24 + i * 4, G - 24 + (i % 2) * 3]], "#7a9a3c", 2.5);
        if (level >= 2) {
          rect(50, G - 18, 16, 16, "#b3261e");
          ctx.fillStyle = "#6b4a3a";
          ctx.beginPath();
          ctx.moveTo(47, G - 18);
          ctx.lineTo(58, G - 27);
          ctx.lineTo(69, G - 18);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          circle(44, G - 4, 3, "#f3eee0");
        }
        if (level >= 3) {
          line([[16, G - 10], [72, G - 10]], "#8a5a2e", 2);
          line([[16, G - 4], [72, G - 4]], "#8a5a2e", 2);
          rect(66, G - 14, 9, 6, "#e6dfcc");
          circle(76, G - 15, 2.5, "#e6dfcc");
        }
      } else if (room === "well") {
        rect(28, G - 14, 24, 12, "#9ea3aa");
        line([[28, G - 8], [52, G - 8]], "rgba(15,16,18,0.5)", 1);
        line([[30, G - 14], [30, G - 34]], "#8a5a2e", 3);
        line([[50, G - 14], [50, G - 34]], "#8a5a2e", 3);
        ctx.fillStyle = "#6b4a3a";
        ctx.beginPath();
        ctx.moveTo(24, G - 32);
        ctx.lineTo(40, G - 42);
        ctx.lineTo(56, G - 32);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (level >= 2) {
          line([[30, G - 24], [50, G - 24]], INK, 2);
          rect(37, G - 22, 6, 6, "#8a5a2e");
        }
        if (level >= 3) {
          rect(56, G - 18, 5, 16, "#4b5057");
          line([[58, G - 18], [64, G - 24]], "#4b5057", 3);
        }
      } else if (room === "water") {
        const tanks = level >= 3 ? 2 : 1;
        for (let i = 0; i < tanks; i++) {
          const x = 26 + i * 22;
          line([[x + 2, G - 2], [x + 2, G - 12]], "#4b5057", 2);
          line([[x + 14, G - 2], [x + 14, G - 12]], "#4b5057", 2);
          rect(x, G - 30 - (level >= 2 ? 4 : 0), 16, 18 + (level >= 2 ? 4 : 0), "#2b7a8a");
        }
        if (level >= 2) rect(60, G - 12, 10, 10, "#3aa0c0");
      } else if (room === "power") {
        line([[20, G - 2], [20, G - 34]], "#8a5a2e", 3);
        line([[64, G - 2], [64, G - 34]], "#8a5a2e", 3);
        ctx.strokeStyle = INK;
        ctx.beginPath();
        ctx.moveTo(20, G - 32);
        ctx.quadraticCurveTo(42, G - 22, 64, G - 32);
        ctx.stroke();
        ["#d9a21b", "#f3eee0", "#d9a21b", "#f3eee0"].forEach((c, i) => circle(28 + i * 9, G - 27 + Math.abs(i - 1.5) * -1.5, 2.2, c));
        if (level >= 2) rect(34, G - 14, 18, 12, "#2f3136");
        if (level >= 3) {
          rect(60, G - 42, 10, 7, "#f3eee0");
          line([[64, G - 35], [64, G - 34]], INK, 2);
        }
      } else if (room === "radio") {
        const top = G - 30 - level * 8;
        line([[34, G - 2], [40, top], [46, G - 2]], "#9ea3aa", 2.5);
        for (let y = G - 8; y > top + 4; y -= 7) line([[36 + (G - y) * 0.12, y], [44 - (G - y) * 0.12, y]], "#9ea3aa", 1.5);
        line([[40, top], [40, top - 8]], INK, 2);
        circle(40, top - 9, 2.5, "#b3261e");
        if (level >= 3) {
          ctx.fillStyle = "#e6dfcc";
          ctx.beginPath();
          ctx.ellipse(50, top + 14, 3, 6, 0.4, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      } else if (room === "lab") {
        rect(22, G - 8, 8, 6, "#8a5a2e");
        line([[24, G - 8], [24, G - 14]], "#7a9a3c", 2.5);
        line([[28, G - 8], [28, G - 12]], "#7a9a3c", 2.5);
        circle(40, G - 9, 6, "#c08f1a");
        line([[44, G - 14], [50, G - 22], [54, G - 10]], "#c08f1a", 2);
        if (level >= 2) {
          rect(56, G - 14, 18, 3, "#f3eee0");
          line([[58, G - 11], [58, G - 2]], INK, 2);
          line([[72, G - 11], [72, G - 2]], INK, 2);
        }
        if (level >= 3) {
          rect(26, G - 34, 30, 18, "#e6dfcc");
          line([[41, G - 31], [41, G - 21]], "#b3261e", 3);
          line([[36, G - 26], [46, G - 26]], "#b3261e", 3);
        }
      }
      // the hand-painted sign on a post, every lot
      line([[10, G], [10, G - 30]], "#8a5a2e", 3);
      rect(2, G - 42, 18, 13, level ? "#e6dfcc" : "#f3eee0");
      line([[5, G - 37], [17, G - 37]], "rgba(15,16,18,0.65)", 1.5);
      line([[5, G - 33], [14, G - 33]], "rgba(15,16,18,0.65)", 1.5);
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
    // anything that reaches back past the eye (a stock, a drawing arm) is pinned just in front of it
    const screen = (q) => {
      const z = Math.max(0.03, q[2]);
      return [cx + (F * q[0]) / z, cy - (F * q[1]) / z];
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
        return { scr: q.map(screen), w: q.map((p) => (2 * radius * F) / Math.max(0.03, p[2])) };
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
    return { s, F, cx, cy, off, world, screen, P, lineW, polygon, prism, onQuad, limbs, strokeLine, box, bar, vbar, slab, px };
  }

  /* ---------- The pistol (also each of the double pistols) ----------
     Origin at the top of the slide's rear. Returns the muzzle on screen. */
  function pistolModel(ctx, rg, kick) {
    const { s, F, P, world, screen, prism, limbs, polygon, onQuad, off, strokeLine, box } = rg;
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

    return { m: P(0, -0.014, back + 0.192), ahead: P(0, -0.014, back + 0.32) };
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
  function mgModel(ctx, rg, kick) {
    const { s, P, limbs, strokeLine, box, bar, vbar, slab, prism, px } = rg;
    const frontZ = (y) => 0.022 - 0.01 * ((-0.058 - y) / 0.077);
    // the shooting arm comes up from the bottom right, under everything
    limbs([[[[0.14, -0.36, -0.14], [0.034, -0.19, -0.05]], 0.036]], SLEEVE);
    // barrel and muzzle brake, gas block and front sight post
    bar(0, -0.022, 0.0065, 0.36, 0.5, STEEL, 0.9, 6);
    bar(0, -0.022, 0.0095, 0.5, 0.535, GUNMETAL, 0.6, 6);
    box(-0.007, 0.007, -0.034, 0.004, 0.355, 0.372, GUNMETAL);
    rod(rg, [[0, 0.006, 0.364], [0, 0.03, 0.364]], 0.0032, GUNMETAL);
    // handguard with vent slots, and the foregrip under it
    vbar(0, 0.29, 0.011, -0.04, -0.105, POLYMER, 0.25);
    bar(0, -0.024, 0.022, 0.19, 0.36, POLYMER, 0.25, 8);
    for (let i = 0; i < 5; i++) {
      const z0 = 0.205 + i * 0.03;
      ctx.fillStyle = "rgba(8,9,10,0.8)";
      rg.polygon([P(-0.0206, -0.019, z0), P(-0.0206, -0.019, z0 + 0.018), P(-0.0206, -0.029, z0 + 0.018), P(-0.0206, -0.029, z0)]);
      ctx.fill();
    }
    // magazine: a curved box, ribbed on the side
    slab([[0.084, -0.058], [0.128, -0.058], [0.15, -0.162], [0.106, -0.17]], -0.011, 0.011, POLYMER, 0.2);
    for (let i = 1; i < 5; i++) {
      const f = i / 5;
      strokeLine([P(-0.0113, -0.058 - 0.112 * f, 0.084 + 0.022 * f + 0.004), P(-0.0113, -0.058 - 0.104 * f, 0.128 + 0.022 * f - 0.004)], Math.max(1, 1.1 * s), "rgba(0,0,0,0.45)");
    }
    // pistol grip, raked back; lower receiver; trigger guard and trigger
    slab([[-0.012, -0.058], [0.022, -0.058], [0.012, -0.135], [-0.024, -0.128]], -0.013, 0.013, POLYMER, 0.25);
    box(-0.015, 0.015, -0.062, -0.038, -0.035, 0.16, GUNMETAL, 0.35);
    rod(rg, [[0, -0.061, 0.026], [0, -0.078, 0.034], [0, -0.079, 0.07], [0, -0.062, 0.08]], 0.004, GUNMETAL);
    strokeLine([P(0, -0.062, 0.05), P(0, -0.072, 0.052), P(0, -0.075, 0.047)], px(0.003, [0, -0.07, 0.05]), rgb(STEEL, 0.9));
    // upper receiver, flat top, with the bolt release and selector on the near side
    prism([[-0.016, -0.04], [0.016, -0.04], [0.016, -0.007], [0.011, 0], [-0.011, 0], [-0.016, -0.007]], (u, v, t) => [u, v, -0.045 + t * 0.235], GUNMETAL, 0.7);
    ctx.fillStyle = rgb(STEEL, 0.9);
    rg.polygon([P(-0.0162, -0.03, 0.03), P(-0.0162, -0.03, 0.045), P(-0.0162, -0.022, 0.045), P(-0.0162, -0.022, 0.03)]);
    ctx.fill();
    strokeLine([P(-0.0155, -0.047, 0.004), P(-0.0158, -0.044, 0.018)], Math.max(1, 2 * s), rgb(STEEL, 1.1));
    // top rail with its slots, rear sight with its ring, charging handle
    box(-0.008, 0.008, 0, 0.006, -0.035, 0.355, GUNMETAL, 0.5);
    for (let z = -0.026; z < 0.35; z += 0.0175) strokeLine([P(-0.008, 0.0062, z), P(0.008, 0.0062, z)], Math.max(1, s), "rgba(0,0,0,0.55)");
    box(-0.009, 0.009, 0.006, 0.024, 0.0, 0.016, GUNMETAL);
    const ring = P(0, 0.017, -0.0004);
    ctx.strokeStyle = "#0b0b0c";
    ctx.lineWidth = Math.max(1, 1.4 * s);
    ctx.beginPath();
    ctx.arc(ring[0], ring[1], Math.max(1.2, px(0.003, [0, 0.017, 0])), 0, TAU);
    ctx.stroke();
    box(-0.012, 0.012, -0.005, 0.002, -0.058, -0.045, GUNMETAL);
    // stock: buffer tube and a collapsible butt
    bar(0, -0.024, 0.0125, -0.105, -0.045, GUNMETAL, 0.4);
    slab([[-0.08, -0.006], [-0.105, -0.006], [-0.105, -0.072], [-0.08, -0.052]], -0.015, 0.015, POLYMER, 0.2);
    // hands: support hand on the foregrip, shooting hand on the grip
    foregripHand(rg, { x: -0.011, z: 0.29, y0: -0.046, sleeve: [-0.3, -0.34, 0.08], wrist: [-0.08, -0.15, 0.25] });
    gripHand(rg, { sleeve: [0.034, -0.19, -0.05], wrist: [0.012, -0.13, -0.022], palm: [[-0.006, -0.108, -0.018], [-0.011, -0.072, -0.006]], x: -0.016, fingers: [-0.078, -0.096, -0.114], frontZ, thumb: [[-0.018, -0.061, -0.014], [-0.019, -0.053, 0.026]] });
    return { m: P(0, -0.022, 0.537), ahead: P(0, -0.022, 0.7) };
  }

  /* ---------- The heavy machine gun ----------
     Belt-fed and olive drab: skeleton stock, slab-sided receiver with a feed cover, an ammo
     box on the near side feeding a brass belt, a ventilated barrel shroud with a carry handle,
     a folded bipod, a foregrip, barrel and flash hider. Origin at the top rear of the receiver. */
  function hmgModel(ctx, rg, kick) {
    const { s, P, limbs, strokeLine, box, bar, vbar, slab, prism, px } = rg;
    const frontZ = (y) => 0.026 - 0.01 * ((-0.064 - y) / 0.078);
    limbs([[[[0.15, -0.38, -0.14], [0.036, -0.2, -0.05]], 0.037]], SLEEVE);
    // barrel and slotted flash hider, front sight post
    bar(0, -0.028, 0.0095, 0.47, 0.56, STEEL, 0.9, 6);
    bar(0, -0.028, 0.013, 0.56, 0.6, GUNMETAL, 0.5, 6);
    for (let i = 0; i < 3; i++) strokeLine([P(-0.0125, -0.031 + i * 0.003, 0.566), P(-0.0125, -0.031 + i * 0.003, 0.592)], Math.max(1, 1.2 * s), "rgba(0,0,0,0.7)");
    box(-0.003, 0.003, -0.004, 0.03, 0.448, 0.458, GUNMETAL);
    // bipod folded under the shroud, the foregrip behind it
    [-0.012, 0.012].forEach((x) => rod(rg, [[x, -0.05, 0.46], [x, -0.058, 0.35]], 0.004, STEEL));
    vbar(0, 0.255, 0.012, -0.048, -0.118, POLYMER, 0.25);
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
    rod(rg, [[0, -0.003, 0.2], [0, 0.03, 0.215], [0, 0.036, 0.25], [0, 0.03, 0.285], [0, -0.003, 0.3]], 0.007, OLIVE_DARK);
    // skeleton grip, trigger guard, receiver, feed cover with ridges, rear sight
    slab([[-0.008, -0.064], [0.026, -0.064], [0.016, -0.142], [-0.02, -0.135]], -0.014, 0.014, POLYMER, 0.25);
    rod(rg, [[0, -0.065, 0.03], [0, -0.083, 0.038], [0, -0.084, 0.076], [0, -0.066, 0.086]], 0.0045, OLIVE_DARK);
    prism([[-0.024, -0.066], [0.024, -0.066], [0.024, -0.008], [0.018, 0], [-0.018, 0], [-0.024, -0.008]], (u, v, t) => [u, v, -0.06 + t * 0.24], OLIVE, 0.45);
    box(-0.02, 0.02, 0, 0.01, 0.0, 0.125, OLIVE, 0.5);
    for (let z = 0.015; z < 0.12; z += 0.018) strokeLine([P(-0.02, 0.0102, z), P(0.02, 0.0102, z)], Math.max(1, s), "rgba(0,0,0,0.5)");
    box(-0.008, 0.008, 0.01, 0.03, -0.045, -0.028, GUNMETAL);
    // the belt climbs out of the ammo box into the feed tray: brass rounds on dark links
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const x = -0.058 + 0.034 * t;
      const y = -0.036 + 0.026 * Math.sin(t * Math.PI * 0.5);
      limbs([[[[x, y - 0.002, 0.058], [x, y - 0.002, 0.094]], 0.0042]], [36, 36, 38]);
      limbs([[[[x, y, 0.054], [x, y, 0.096]], 0.0046]], BRASS);
    }
    // ammo box on the near side, stencilled, with its lid
    const ammo = box(-0.084, -0.03, -0.128, -0.042, 0.02, 0.13, OLIVE_DARK, 0.25);
    box(-0.086, -0.028, -0.042, -0.035, 0.016, 0.134, OLIVE, 0.3);
    if (ammo[3]) {
      const c = rg.onQuad(ammo[3], 0.5, 0.45);
      label(ctx, "7.62", c[0], c[1], Math.max(6, px(0.016, [-0.084, -0.085, 0.075])), "rgba(220,214,180,0.75)");
    }
    // skeleton stock, open in the middle
    slab([[-0.055, -0.004], [-0.12, -0.012], [-0.12, -0.09], [-0.055, -0.062]], -0.017, 0.017, OLIVE_DARK, 0.2);
    ctx.fillStyle = "rgba(8,9,10,0.75)";
    rg.polygon([P(-0.0172, -0.022, -0.07), P(-0.0172, -0.025, -0.108), P(-0.0172, -0.072, -0.108), P(-0.0172, -0.055, -0.07)]);
    ctx.fill();
    foregripHand(rg, { x: -0.012, z: 0.255, y0: -0.054, sleeve: [-0.32, -0.36, 0.06], wrist: [-0.085, -0.16, 0.22] });
    gripHand(rg, { sleeve: [0.036, -0.2, -0.05], wrist: [0.014, -0.138, -0.022], palm: [[-0.004, -0.115, -0.016], [-0.012, -0.078, -0.004]], x: -0.017, fingers: [-0.084, -0.102, -0.12], frontZ, thumb: [[-0.025, -0.064, -0.012], [-0.026, -0.056, 0.03]] });
    return { m: P(0, -0.028, 0.602), ahead: P(0, -0.028, 0.75) };
  }

  /* ---------- The bow ----------
     A recurve held in the left hand, canted, with an arrow on the string. Origin at the arrow
     shelf on the grip. draw 0..1 pulls the nock (and the hand) back toward the eye and bends
     the limbs; twang shakes the string after a shot; no arrow shows while the next is nocked. */
  function bowModel(ctx, rg, draw, loaded, twang, now) {
    const { s, P, limbs, strokeLine, slab, px } = rg;
    const zN = -0.13 - 0.17 * draw + (twang > 0 ? Math.sin(now / 9) * 0.01 * twang : 0);
    const flex = 1 + 0.9 * draw;
    const limbPts = (dir) => {
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const z = -0.045 * Math.sin(t * Math.PI * 0.85) * flex - 0.03 * t * t * draw + 0.05 * Math.pow(Math.max(0, (t - 0.75) / 0.25), 2);
        pts.push([0, dir * (0.105 + 0.25 * t), z]);
      }
      return pts;
    };
    const upper = limbPts(1);
    const lower = limbPts(-1);
    const limb = (pts) => limbs(pts.slice(0, -1).map((p, i) => [[p, pts[i + 1]], 0.0135 - 0.0085 * (i / 10)]), WOOD);
    // the bow arm, from the bottom left up to the grip
    limbs([[[[-0.13, -0.3, -0.26], [-0.03, -0.07, -0.05]], 0.028]], SLEEVE);
    limbs([[[[-0.03, -0.07, -0.05], [-0.006, -0.034, -0.008]], 0.019]], GLOVE);
    limb(lower);
    // riser: shaped wood, a leather grip wrap, the shelf the arrow rests on
    slab([[-0.016, -0.11], [0.012, -0.11], [0.02, -0.04], [0.02, 0.045], [0.012, 0.11], [-0.016, 0.11], [-0.02, 0.045], [-0.02, -0.04]], -0.011, 0.011, WOOD.map((c) => c * 0.82), 0.6);
    limb(upper);
    // the string: tip, nock, tip
    const str = [P(...upper[10]), P(0.002, 0, zN), P(...lower[10])];
    strokeLine(str, Math.max(1.5, 2.6 * s), "#0b0b0c");
    strokeLine(str, Math.max(1, 1.3 * s), "#ece4cc");
    // bow hand: a fist round the grip
    limbs([[[[-0.004, -0.058, -0.006], [-0.004, -0.01, -0.006]], 0.016]], GLOVE);
    for (let i = 0; i < 3; i++) strokeLine([P(-0.022, -0.02 - i * 0.014, -0.008), P(-0.02, -0.02 - i * 0.014, 0.008)], Math.max(1, 1.1 * s), "rgba(0,0,0,0.55)");
    // the arrow on the string: shaft, fletching, broadhead
    if (loaded) {
      const ax = 0.016;
      const ay = 0.002;
      const zTip = zN + 0.66;
      const shaft = [];
      for (let i = 0; i < 4; i++) shaft.push([[[ax, ay, zN + (i / 4) * (zTip - 0.03 - zN)], [ax, ay, zN + ((i + 1) / 4) * (zTip - 0.03 - zN)]], 0.0034]);
      limbs(shaft, [150, 118, 78]);
      [Math.PI / 2, Math.PI / 2 + (TAU / 3), Math.PI / 2 - (TAU / 3)].forEach((a, i) => {
        const c = Math.cos(a);
        const sn = Math.sin(a);
        const vane = [[0.003, 0.014], [0.013, 0.03], [0.012, 0.074], [0.003, 0.082]].map(([r, z]) => P(ax + c * r, ay + sn * r, zN + z));
        rg.polygon(vane);
        ctx.fillStyle = i === 0 ? "#b3261e" : "#e9e2cc";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = Math.max(1, s);
        ctx.stroke();
      });
      [[0, 1], [1, 0]].forEach(([bx, by]) => {
        const w = 0.009;
        rg.polygon([P(ax + bx * w, ay + by * w, zTip - 0.032), P(ax, ay, zTip + 0.014), P(ax - bx * w, ay - by * w, zTip - 0.032)]);
        ctx.fillStyle = rgb(STEEL, 1.5);
        ctx.fill();
        ctx.strokeStyle = "#0b0b0c";
        ctx.lineWidth = Math.max(1, 1.2 * s);
        ctx.stroke();
      });
    }
    // drawing hand: three fingers hooked on the string round the nock, wrist back toward the shoulder
    const hz = zN - 0.012;
    limbs([[[[0.07, -0.24, hz - 0.12], [0.03, -0.06, hz - 0.035]], 0.026]], SLEEVE);
    limbs([[[[0.03, -0.06, hz - 0.035], [0.02, -0.024, hz - 0.01]], 0.017]], GLOVE);
    [[0.011, -0.004], [-0.009, -0.004], [-0.02, -0.003]].forEach(([y, dz]) => limbs([[[[0.024, y, hz - 0.012], [0.008, y + 0.002, hz + 0.004 + dz]], 0.0054]], GLOVE));
    return { draw };
  }

  /* Where each weapon sits in front of the eye. off: metres right, up and forward of the eye;
     yaw turns the muzzle in toward the crosshair (and shows the gun's left side), pitch lifts it,
     roll cants it; sway: walk bob (x, y); kick: recoil back (z) and muzzle climb (pitch) on a shot;
     jitter: shake while firing. A long gun shows its side only when its rear sits close and to the right. */
  const POSES = {
    pistol: { off: [0.098, -0.04, 0.27], yaw: 0.6, pitch: 0, roll: 0, pivot: [0, -0.07, 0.03], sway: [0.005, 0.006], kick: [0.012, 0.08], jitter: 0 },
    dual: { off: [0.13, -0.052, 0.27], yaw: 0.62, pitch: 0, roll: 0, pivot: [0, -0.07, 0.03], sway: [0.005, 0.006], kick: [0.012, 0.08], jitter: 0 },
    mg: { off: [0.17, -0.07, 0.26], yaw: 0.42, pitch: 0.03, roll: -0.03, pivot: [0, -0.05, 0], sway: [0.006, 0.007], kick: [0.012, 0.025], jitter: 0.003 },
    hmg: { off: [0.175, -0.08, 0.27], yaw: 0.4, pitch: 0.03, roll: -0.03, pivot: [0, -0.05, 0], sway: [0.01, 0.012], kick: [0.02, 0.03], jitter: 0.006 },
    bow: { off: [-0.055, -0.07, 0.5], yaw: 0, pitch: 0, roll: 0.24, pivot: [0, 0, 0], sway: [0.004, 0.005], kick: [0, 0], jitter: 0 },
  };
  function pose(id, bob, kick, drop, mirror) {
    const p = POSES[id];
    const j = p.jitter && kick > 0 ? (Math.random() - 0.5) * p.jitter * kick : 0;
    return {
      off: [p.off[0] + Math.sin(bob) * p.sway[0] + j, p.off[1] - Math.abs(Math.cos(bob)) * p.sway[1] - drop + j, p.off[2] - kick * p.kick[0]],
      yaw: p.yaw,
      pitch: p.pitch + kick * p.kick[1],
      roll: p.roll,
      pivot: p.pivot,
      mirror,
    };
  }

  /** The weapon in hand. opts: weapon, bob, flash (shot kick timer), flashL / flashR (double
      pistols), draw and loaded (bow), raise (1 = just switched and out of sight, 0 = ready). */
  function gun(ctx, W, H, opts) {
    const id = POSES[opts.weapon] ? opts.weapon : "pistol";
    const bob = opts.bob || 0;
    const raise = Math.max(0, Math.min(1, opts.raise || 0));
    const drop = raise * raise * 0.18;
    const kickOf = (f) => Math.min(1, (f || 0) / 0.08); // 1 on the shot, 0 at rest
    ctx.save();
    if (id === "dual") {
      // left hand first; it swings opposite the right as you walk
      [["L", true, opts.flashL, bob + Math.PI], ["R", false, opts.flashR, bob]].forEach(([side, mirror, flash, b]) => {
        const kick = kickOf(flash);
        const rg = rig(ctx, W, H, pose(id, b, kick, drop, mirror));
        const mm = pistolModel(ctx, rg, kick);
        muzzleFx(ctx, rg, mm.m, mm.ahead, kick, muzzleState("dual" + side), 1);
      });
    } else if (id === "bow") {
      const draw = Math.max(0, Math.min(1, opts.draw || 0));
      const o = pose(id, bob, 0, drop, false);
      if (draw > 0.95) o.off[0] += Math.sin(performance.now() / 45) * 0.0012; // holding a full draw is hard
      bowModel(ctx, rig(ctx, W, H, o), draw, opts.loaded !== false && raise < 0.5, kickOf(opts.flash), performance.now());
    } else {
      const kick = kickOf(opts.flash);
      const rg = rig(ctx, W, H, pose(id, id === "hmg" ? bob * 0.8 : bob, kick, drop, false)); // the heavy gun has a slower stride
      const model = id === "mg" ? mgModel : id === "hmg" ? hmgModel : pistolModel;
      const mm = model(ctx, rg, kick);
      muzzleFx(ctx, rg, mm.m, mm.ahead, kick, muzzleState(id), id === "hmg" ? 1.7 : id === "mg" ? 1.25 : 1);
    }
    ctx.restore();
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

  ZSR.Draw3 = { texture, walker, item, note, key, lot, scrap, trap, gun, weaponIcon, crosshair, shade, POSES };
})(typeof globalThis !== "undefined" ? globalThis : this);
