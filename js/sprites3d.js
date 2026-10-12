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
    door(ctx, w, h) {
      ctx.fillStyle = "#3b3d44";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 6, w - 20, h - 6);
      ctx.fillStyle = "#d9a21b";
      ctx.beginPath();
      ctx.arc(w - 18, h / 2, 3, 0, TAU);
      ctx.fill();
      label(ctx, "BUILD", w / 2, 18, 10, "#f3eee0");
      border(ctx, w, h);
    },
    house(ctx, w, h) {
      ctx.fillStyle = "#6b5a46";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 2;
      for (let y = 10; y < h; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.fillStyle = "#2b3540";
      ctx.fillRect(18, 16, 28, 22);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(18, 16, 28, 22);
      ctx.beginPath();
      ctx.moveTo(32, 16);
      ctx.lineTo(32, 38);
      ctx.moveTo(18, 27);
      ctx.lineTo(46, 27);
      ctx.stroke();
      // boards over the window
      ctx.fillStyle = "#8a6a46";
      ctx.save();
      ctx.translate(32, 27);
      ctx.rotate(-0.3);
      ctx.fillRect(-20, -4, 40, 8);
      ctx.strokeRect(-20, -4, 40, 8);
      ctx.restore();
      border(ctx, w, h);
    },
    van(ctx, w, h) {
      ctx.fillStyle = "#5b6b3a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2b3540";
      ctx.fillRect(6, 10, w - 12, 20);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(6, 10, w - 12, 20);
      ctx.fillStyle = "#1f2023";
      ctx.beginPath();
      ctx.arc(16, h - 8, 7, 0, TAU);
      ctx.arc(w - 16, h - 8, 7, 0, TAU);
      ctx.fill();
      ctx.stroke();
      label(ctx, "B-66", w / 2, 44, 10, "#f3eee0");
      border(ctx, w, h);
    },
    tree(ctx, w, h) {
      ctx.fillStyle = "#2f3a2a";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#1a2218";
      ctx.lineWidth = 3;
      for (let x = 8; x < w; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x + 3, 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 2, 30);
        ctx.lineTo(x + 12, 18);
        ctx.moveTo(x + 1, 44);
        ctx.lineTo(x - 8, 34);
        ctx.stroke();
      }
      halftone(ctx, w, h, 0.18);
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
    const key = "tex:" + kind + ":" + (palette ? palette.wall + palette.shelf + palette.counter : "");
    return cached(key, 64, 64, (ctx, w, h) => TEX[kind](ctx, w, h, palette || {}));
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

  ZSR.Draw3 = { texture, walker, item, note, scrap, gun, crosshair, shade };
})(typeof globalThis !== "undefined" ? globalThis : this);
