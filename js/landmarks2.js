/* Landmark art, second half: the four corner landmarks of the 4th Precinct, Lincoln Middle
   School, Station 12, St. Anne Annex, the Water Tower, Ridge Lumber, Northgate Mall and the
   Public Library (art keys from ZSR.LAYOUT_ART in layouts.js), drawn in the comic style (flat
   fills, thick ink, halftone) and registered with ZSR.Draw3.registerSprite. landmarks1.js
   draws the other seven buildings.

   Every art is authored in units: 128 units tall (the bottom edge is the floor, the top edge
   the landmark's `size`), rendered at RES pixels per unit, on a transparent background.
   The first-person view is STRETCH (about 1.4) times taller than wide: at depth d a tile of
   floor is H / d pixels tall but H / (STRETCH * d) wide (STRETCH = 2 tan(FOV / 2), interior.js),
   and a sprite keeps its own pixel shape. So a one-tile landmark stands units / 128 * size *
   STRETCH tiles wide on the floor (1.37 for 128 units at 0.98); they are kept under about 1.5.
   A footprint landmark (`foot: [w, h]`) is a `span` prop (building.js dressLayout): the engine
   spreads its whole canvas over w * 0.95 tiles of floor, so footArt makes the canvas exactly the
   drawing (w * 0.95 / size / STRETCH * 128 units wide) and wheels and logs stay round on screen.
   `color` and `label` opts are used where the catalog line says so, with the layout's value as
   the default. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const D = ZSR.Draw3;
  if (!D || !D.registerSprite) return;
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const FONT = "Oswald, Impact, sans-serif";
  const { shade, mix, rng } = D;
  const RES = 1.5; // pixels per unit: 128 units = 192 px tall
  const RES_FOOT = 1.25; // footprint landmarks: wide canvases, 30% of them clear margin (memory)
  const STRETCH = 2 * Math.tan(1.22 / 2); // the view's height-to-width stretch (FOV 1.22 in interior.js)
  const LW = 3.5; // the ink around big shapes, in units; details use 1.5..2.5
  const C = {
    white: "#f4f1ea", cream: "#f3eee0", chrome: "#c9ced4", steel: "#8d949c", steelD: "#5d636b",
    black: "#24262b", tire: "#1d1f23", red: "#d0342c", redD: "#a3271f", gold: "#e8b923",
    yellow: "#f2c230", orange: "#e8761a", blue: "#2f6fd0", navy: "#2f5f9e", glass: "#9fd0ec",
    wood: "#8a5a2e", woodL: "#c98a4a", pale: "#e8cf9a", green: "#4caf50",
  };

  /** Register an art drawn in units, `w` wide and 128 tall, at `res` pixels per unit. */
  function art(name, w, fn, res) {
    const r = res || RES;
    D.registerSprite(name, Math.round(w * r), Math.round(128 * r), (ctx, pw, ph, o) => {
      ctx.save();
      ctx.scale(pw / w, ph / 128);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      fn(ctx, w, 128, o || {});
      ctx.restore();
    });
  }
  /** A footprint landmark `tiles` wide at `size` tall (its layout's foot[0] and size): the canvas,
      `w` units wide, is what the engine spreads over its tiles of floor. */
  function footArt(name, tiles, size, fn) {
    const w = (tiles * 0.95 * 128) / size / STRETCH; // the drawing: tiles * 0.95 of floor
    art(name, w, (ctx, _w, h, o) => fn(ctx, w, h, o), RES_FOOT); // the engine spreads the canvas over the span in floor tiles
  }
  /** The layout's color (opts.color) when it is a plain hex color, else the art's own. */
  function hue(o, fallback) {
    return typeof o.color === "string" && /^#[0-9a-f]{6}$/i.test(o.color) ? o.color : fallback;
  }

  /* ---------- Drawing helpers (units; the same conventions as yardart.js) ---------- */
  function ink(ctx, lw, color) {
    ctx.strokeStyle = color || INK;
    ctx.lineWidth = lw || LW;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
  }
  /** Fill the current path (when `fill` is given), then ink its edge (lw 0: no edge). */
  function paint(ctx, fill, lw) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (lw !== 0) {
      ink(ctx, lw);
      ctx.stroke();
    }
  }
  function trace(ctx, pts, close) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    if (close) ctx.closePath();
  }
  function rect(ctx, x, y, w, h, fill, lw) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    paint(ctx, fill, lw);
  }
  function roundPath(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function rrect(ctx, x, y, w, h, r, fill, lw) {
    ctx.beginPath();
    roundPath(ctx, x, y, w, h, r);
    paint(ctx, fill, lw);
  }
  function circle(ctx, x, y, r, fill, lw) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.3, r), 0, TAU);
    paint(ctx, fill, lw);
  }
  function oval(ctx, x, y, rx, ry, fill, lw, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.3, rx), Math.max(0.3, ry), rot || 0, 0, TAU);
    paint(ctx, fill, lw);
  }
  function poly(ctx, pts, fill, lw) {
    trace(ctx, pts, true);
    paint(ctx, fill, lw);
  }
  /** An open line in one color (ink when none). */
  function line(ctx, pts, color, lw) {
    trace(ctx, pts);
    ink(ctx, lw || 2, color);
    ctx.stroke();
  }
  /** A thick colored rod with an ink edge (pipes, poles, legs, straps). */
  function tube(ctx, pts, color, w) {
    line(ctx, pts, INK, w + 3);
    line(ctx, pts, color, w);
  }
  function glint(ctx, pts, lw, a) {
    line(ctx, pts, "rgba(255,255,255," + (a || 0.75) + ")", lw || 2.2);
  }
  /** The soft shadow a landmark stands in, on the bottom edge. */
  function shadow(ctx, cx, rx, h) {
    oval(ctx, cx, h - 4, rx, 4.5, "rgba(15,16,18,0.32)", 0);
  }
  /** Halftone dots on what is already drawn in the box (never on the clear background). */
  function dots(ctx, x, y, w, h, alpha, step) {
    const s = step || 4;
    const r = s * 0.24;
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(15,16,18," + (alpha || 0.22) + ")";
    ctx.beginPath();
    let row = 0;
    for (let yy = y + s / 2; yy < y + h; yy += s, row++) {
      for (let xx = x + s / 2 + (row % 2) * (s / 2); xx < x + w; xx += s) {
        ctx.moveTo(xx + r, yy);
        ctx.arc(xx, yy, r, 0, TAU);
      }
    }
    ctx.fill();
    ctx.restore();
  }
  /** Halftone shading inside a path built by `path(ctx)`, over the box x, y, w, h. */
  function shadeIn(ctx, path, alpha, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    path(ctx);
    ctx.clip();
    dots(ctx, x, y, w, h, alpha);
    ctx.restore();
  }
  /** Bold capitals fitted into maxW, centered on x, y; ringed in ink when `outline`. */
  function words(ctx, str, x, y, maxW, size, color, outline) {
    const t = String(str);
    let s = size;
    ctx.font = "700 " + s + "px " + FONT;
    const tw = ctx.measureText(t).width;
    if (tw > maxW && tw > 0) {
      s = Math.max(4, (s * maxW) / tw);
      ctx.font = "700 " + s.toFixed(1) + "px " + FONT;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (outline) {
      ink(ctx, Math.max(1.5, s * 0.22));
      ctx.strokeText(t, x, y);
    }
    ctx.fillStyle = color || INK;
    ctx.fillText(t, x, y);
  }
  /** A closed shape through `pts` with rounded corners (quadratic through the midpoints). */
  function blob(ctx, pts, fill, lw) {
    const n = pts.length;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    ctx.beginPath();
    const m0 = mid(pts[n - 1], pts[0]);
    ctx.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) {
      const m = mid(pts[i], pts[(i + 1) % n]);
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
    }
    ctx.closePath();
    paint(ctx, fill, lw);
  }
  /** An ellipse with a scalloped (bumpy) edge: brains, clouds, manes. */
  function scallopPath(ctx, cx, cy, rx, ry, n, amp) {
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * TAU;
      const x = cx + Math.cos(a) * rx;
      const y = cy + Math.sin(a) * ry;
      if (!i) {
        ctx.moveTo(x, y);
        continue;
      }
      const m = a - TAU / n / 2;
      ctx.quadraticCurveTo(cx + Math.cos(m) * rx * (1 + amp), cy + Math.sin(m) * ry * (1 + amp), x, y);
    }
    ctx.closePath();
  }
  function scallop(ctx, cx, cy, rx, ry, n, amp, fill, lw) {
    ctx.beginPath();
    scallopPath(ctx, cx, cy, rx, ry, n, amp);
    paint(ctx, fill, lw);
  }
  /** A star or spiky ring: n points between radius r1 (tips) and r0. */
  function star(ctx, cx, cy, n, r1, r0, rot, fill, lw) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = rot + (i * Math.PI) / n;
      const r = i % 2 ? r0 : r1;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    poly(ctx, pts, fill, lw);
  }
  /** An upright cylinder seen a little from above: body `depth` tall under a lid ellipse. */
  function can(ctx, cx, top, rx, ry, depth, body, lid, lw) {
    ctx.beginPath();
    ctx.moveTo(cx + rx, top);
    ctx.lineTo(cx + rx, top + depth);
    ctx.ellipse(cx, top + depth, rx, ry, 0, 0, Math.PI);
    ctx.lineTo(cx - rx, top);
    ctx.closePath();
    paint(ctx, body, lw == null ? LW : lw);
    oval(ctx, cx, top, rx, ry, lid, lw == null ? LW : lw);
  }
  /** A tire with a chrome hub, seen from the side. */
  function wheel(ctx, x, y, r, hub) {
    circle(ctx, x, y, r, C.tire);
    circle(ctx, x, y, r * 0.56, hub || C.chrome, 2.5);
    circle(ctx, x, y, r * 0.2, "#4b5057", 2);
    for (let i = 0; i < 5; i++) {
      const a = (i * TAU) / 5 - Math.PI / 2;
      circle(ctx, x + Math.cos(a) * r * 0.37, y + Math.sin(a) * r * 0.37, r * 0.06 + 0.4, INK, 0);
    }
    ctx.beginPath();
    ctx.arc(x, y, r - 3, 3.7, 4.6);
    ink(ctx, 2, "rgba(255,255,255,0.3)");
    ctx.stroke();
  }
  /** A box side seen at an angle: (u, v) in 0..1 along it and down it, to units. */
  function side(x0, x1, top0, top1, bot0, bot1) {
    return (u, v) => {
      const t = top0 + (top1 - top0) * u;
      const b = bot0 + (bot1 - bot0) * u;
      return [x0 + (x1 - x0) * u, t + (b - t) * v];
    };
  }
  function quad(ctx, S, u0, v0, u1, v1, fill, lw) {
    poly(ctx, [S(u0, v0), S(u1, v0), S(u1, v1), S(u0, v1)], fill, lw);
  }
  function quadPath(S, u0, v0, u1, v1) {
    return (c) => [S(u0, v0), S(u1, v0), S(u1, v1), S(u0, v1)].forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  }
  /** Round glow behind a light: a soft disc in the light's color. */
  function glow(ctx, x, y, r, rgb) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(" + rgb + ",0.55)");
    g.addColorStop(1, "rgba(" + rgb + ",0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  /** Short rays around a light (comic "it is lit"). */
  function rays(ctx, x, y, r0, r1, n, color, skip) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i * TAU) / n - Math.PI / 2;
      if (skip && skip(a)) continue;
      ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
      ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
    }
    ink(ctx, 2.2, color);
    ctx.stroke();
  }
  function paw(ctx, x, y, s, color) {
    oval(ctx, x, y + 2 * s, 4 * s, 3.2 * s, color || INK, 0);
    [[-4.4, -1.6], [-1.6, -4.2], [1.6, -4.2], [4.4, -1.6]].forEach(([dx, dy]) => circle(ctx, x + dx * s, y + dy * s, 1.6 * s, color || INK, 0));
  }

  /* ======================= 4th Precinct ======================= */

  /* The dog kennel: a wire crate seen from its front corner, an empty red bowl and a bone inside,
     a yellow K9 sign on top. */
  art("kennel", 150, (ctx, w, h, o) => {
    shadow(ctx, 80, 70, h);
    const x0 = 10, x1 = 114, y0 = 50, y1 = 122, dx = 26, dy = -16;
    const outline = [[x0, y1], [x0, y0], [x0 + dx, y0 + dy], [x1 + dx, y0 + dy], [x1 + dx, y1 + dy], [x1, y1]];
    poly(ctx, outline, "#2a2e35", 0); // the inside, seen through the wire
    poly(ctx, [[x0, y1], [x1, y1], [x1 + dx, y1 + dy], [x0 + dx, y1 + dy]], "#555b63", 0); // the tray
    // the empty bowl and a chewed bone
    poly(ctx, [[74, 106], [102, 106], [98, 116], [78, 116]], "#c0392b", 2.5);
    oval(ctx, 88, 106, 14, 4.5, "#e0503f", 2.5);
    oval(ctx, 88, 106, 10, 2.8, "#7a1d16", 0);
    tube(ctx, [[30, 113], [48, 108]], C.white, 3.5);
    [[29, 111], [30, 115], [48, 106], [50, 110]].forEach(([x, y]) => circle(ctx, x, y, 2.6, C.white, 1.5));
    // wire on the front, the side and the top
    const wire = "#c3c9d0";
    ctx.beginPath();
    for (let x = x0 + 8; x < x1 - 2; x += 8) {
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
      ctx.moveTo(x, y0);
      ctx.lineTo(x + dx, y0 + dy);
    }
    for (let y = y0 + 9; y < y1 - 2; y += 9) {
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.moveTo(x1, y);
      ctx.lineTo(x1 + dx, y + dy);
    }
    for (let t = 0.25; t < 1; t += 0.25) {
      ctx.moveTo(x1 + dx * t, y0 + dy * t);
      ctx.lineTo(x1 + dx * t, y1 + dy * t);
      ctx.moveTo(x0 + dx * t, y0 + dy * t);
      ctx.lineTo(x1 + dx * t, y0 + dy * t);
    }
    ink(ctx, 1.6, wire);
    ctx.stroke();
    shadeIn(ctx, (c) => trace(c, [[x1, y0], [x1 + dx, y0 + dy], [x1 + dx, y1 + dy], [x1, y1]], true), 0.3, x1, y0 + dy, dx, y1 - y0);
    // the door: a heavier frame with bars and a slide bolt
    ctx.beginPath();
    ctx.rect(18, 60, 46, 58);
    ink(ctx, 5);
    ctx.stroke();
    ink(ctx, 2.6, wire);
    ctx.stroke();
    ctx.beginPath();
    for (let x = 24; x < 64; x += 6) {
      ctx.moveTo(x, 61);
      ctx.lineTo(x, 117);
    }
    ink(ctx, 2.2, wire);
    ctx.stroke();
    rect(ctx, 60, 85, 12, 6, C.chrome, 1.8);
    // the frame
    poly(ctx, outline, null, LW);
    rect(ctx, x0, y0, x1 - x0, y1 - y0, null, LW);
    line(ctx, [[x1, y0], [x1 + dx, y0 + dy]], INK, LW);
    // the sign
    rect(ctx, 36, 34, 6, 18, C.steelD, 2);
    rect(ctx, 92, 34, 6, 18, C.steelD, 2);
    rrect(ctx, 20, 4, 94, 36, 4, C.yellow, LW);
    rrect(ctx, 24.5, 8.5, 85, 27, 2, null, 1.5);
    words(ctx, o.label || "K9", 67, 23, 46, 30, INK);
    paw(ctx, 34, 22, 0.95);
    paw(ctx, 100, 22, 0.95);
  });

  /* The police bike: black-and-white motorbike on its kickstand, side view, a blue light on a pole at the back. */
  art("motorcycle", 172, (ctx, w, h) => {
    shadow(ctx, 88, 78, h);
    tube(ctx, [[100, 100], [90, 124]], C.steelD, 3);
    tube(ctx, [[90, 102], [164, 96]], C.chrome, 6);
    wheel(ctx, 40, 103, 22);
    wheel(ctx, 136, 103, 22);
    // fenders: white bands with ink edges
    [[136, 1.08, 1.72], [40, 1.18, 1.84]].forEach(([x, a0, a1]) => {
      ctx.beginPath();
      ctx.arc(x, 103, 27, Math.PI * a0, Math.PI * a1);
      ink(ctx, 9);
      ctx.stroke();
      ink(ctx, 5.5, C.white);
      ctx.stroke();
    });
    tube(ctx, [[136, 103], [118, 72], [92, 70]], C.black, 5);
    // engine
    rrect(ctx, 78, 78, 38, 26, 4, "#3a3d44", 2.5);
    [[80, 62], [98, 64]].forEach(([x, y]) => {
      rrect(ctx, x, y, 15, 22, 3, C.chrome, 2.5);
      line(ctx, [[x + 2, y + 6], [x + 13, y + 6]], C.steelD, 1.4);
      line(ctx, [[x + 2, y + 11], [x + 13, y + 11]], C.steelD, 1.4);
      line(ctx, [[x + 2, y + 16], [x + 13, y + 16]], C.steelD, 1.4);
    });
    tube(ctx, [[40, 103], [63, 52]], C.chrome, 5);
    // tank with a gold star, seat, the rear box with POLICE on it
    poly(ctx, [[82, 54], [114, 52], [120, 66], [86, 70]], C.white, 2.5);
    poly(ctx, [[84, 63], [118, 61], [120, 66], [86, 70]], C.tire, 0);
    star(ctx, 100, 58, 5, 5.5, 2.4, -Math.PI / 2, C.gold, 1.4);
    poly(ctx, [[112, 54], [140, 56], [146, 64], [116, 66]], C.tire, 2.5);
    rrect(ctx, 124, 58, 44, 38, 4, C.white, LW);
    rect(ctx, 125.5, 59.5, 41, 8, C.tire, 0);
    words(ctx, "POLICE", 146, 79, 38, 13, INK);
    rect(ctx, 127, 88, 38, 4, C.blue, 0);
    rect(ctx, 166, 70, 5, 10, "#e0503f", 1.5);
    // the blue light on its pole
    tube(ctx, [[156, 58], [156, 30]], C.steelD, 3);
    glow(ctx, 156, 18, 24, "90,170,255");
    rays(ctx, 156, 18, 15, 22, 10, "#8fc8ff", (a) => Math.sin(a) > 0.5);
    rrect(ctx, 144, 6, 24, 24, 7, "#2f7fe0", LW);
    rect(ctx, 144, 24, 24, 5, C.steelD, 2);
    glint(ctx, [[149, 12], [154, 10]], 2.4, 0.9);
    // fairing, headlight, windshield, bars, mirror
    const fairing = [[41, 46], [75, 38], [88, 56], [84, 84], [59, 88], [43, 72]];
    poly(ctx, fairing, C.white, 0);
    poly(ctx, [[43, 72], [85, 70], [84, 84], [59, 88]], C.tire, 0);
    poly(ctx, [[42, 63], [86, 60], [86, 66], [43, 69]], C.blue, 0);
    poly(ctx, fairing, null, LW);
    circle(ctx, 53, 54, 8, "#fff2b0", 2.5);
    glint(ctx, [[49, 51], [52, 49]], 2, 0.9);
    poly(ctx, [[51, 44], [47, 12], [71, 9], [79, 40]], "rgba(200,230,250,0.62)", 2.5);
    glint(ctx, [[55, 36], [53, 18]], 2.2, 0.8);
    tube(ctx, [[69, 40], [90, 34]], C.tire, 3.5);
    tube(ctx, [[84, 35], [87, 22]], C.chrome, 1.8);
    oval(ctx, 88, 19, 4.5, 3.2, "#3a3d44", 1.6);
    dots(ctx, 0, 88, w, 40, 0.16);
  });

  /* The coffee machine: a big chrome urn with a dome and a steam pipe, on a red rolling cart,
     a stack of paper cups beside it. */
  art("coffeeMachine", 128, (ctx, w, h) => {
    shadow(ctx, 64, 58, h);
    const cart = "#c63a2c";
    rect(ctx, 14, 80, 5, 36, cart, 2.5);
    rect(ctx, 109, 80, 5, 36, cart, 2.5);
    circle(ctx, 16.5, 121, 5.5, C.tire, 2);
    circle(ctx, 111.5, 121, 5.5, C.tire, 2);
    rect(ctx, 12, 100, 104, 6, cart, 2.5);
    // coffee sacks and a sugar box on the low shelf
    rrect(ctx, 24, 84, 24, 16, 4, "#7a4a2a", 2.5);
    rrect(ctx, 52, 86, 24, 14, 4, "#8a5634", 2.5);
    line(ctx, [[30, 84], [42, 84]], INK, 2);
    rect(ctx, 82, 88, 22, 12, C.white, 2.5);
    rect(ctx, 82, 92, 22, 3, C.blue, 0);
    rect(ctx, 8, 72, 112, 8, cart, LW);
    // the cups
    poly(ctx, [[12, 32], [30, 32], [28, 72], [14, 72]], C.white, 2.5);
    ctx.beginPath();
    for (let y = 36; y < 72; y += 3.2) {
      ctx.moveTo(13, y);
      ctx.lineTo(29, y);
    }
    ink(ctx, 1, "#a9aeb4");
    ctx.stroke();
    rect(ctx, 13, 50, 16, 3, "#d0342c", 0);
    oval(ctx, 21, 32, 9, 2.6, C.white, 2);
    // the urn: body, dome, finial
    rrect(ctx, 34, 32, 70, 42, 6, C.chrome, LW);
    shadeIn(ctx, (c) => c.rect(80, 32, 24, 42), 0.25, 80, 32, 24, 42);
    ctx.beginPath();
    ctx.ellipse(69, 33, 33, 18, 0, Math.PI, TAU);
    ctx.closePath();
    paint(ctx, "#dfe3e8", LW);
    rect(ctx, 66.5, 11, 5, 5, C.gold, 1.5);
    circle(ctx, 69, 9, 4.5, C.gold, 2);
    glint(ctx, [[48, 26], [58, 19]], 2.5, 0.85);
    glint(ctx, [[40, 40], [40, 66]], 2.5, 0.7);
    // the name plate, the spout bay and a cup, the gauge
    rrect(ctx, 44, 36, 50, 15, 2, C.cream, 2.5);
    words(ctx, "COFFEE", 69, 43.8, 44, 12.5, "#6b3a1e");
    rrect(ctx, 42, 55, 36, 16, 2, "#2a2e35", 2.5);
    rect(ctx, 50, 55, 5, 6, C.chrome, 1.5);
    rect(ctx, 65, 55, 5, 6, C.chrome, 1.5);
    poly(ctx, [[46, 63], [59, 63], [57, 71], [48, 71]], C.white, 1.8);
    rect(ctx, 47, 66, 11, 2.2, "#d0342c", 0);
    circle(ctx, 89, 62, 7.5, C.white, 2.5);
    line(ctx, [[89, 62], [93, 58]], "#d0342c", 1.8);
    // the steam pipe and its puff
    tube(ctx, [[104, 44], [114, 44], [114, 26]], C.chrome, 4);
    circle(ctx, 114, 36, 3.6, "#d0342c", 1.5);
    [[114, 15, 7], [106, 10, 5], [121, 8, 5], [113, 5, 4]].forEach(([x, y, r]) => circle(ctx, x, y, r, "rgba(255,255,255,0.9)", 1.6));
  });

  /* The riot shields: a blue steel rack on legs, four clear shields standing in it and three black
     helmets on the top shelf. */
  art("riotShields", 144, (ctx, w, h) => {
    shadow(ctx, 72, 68, h);
    const frame = "#2f5fbf";
    rect(ctx, 6, 22, 8, 102, frame, 2.5);
    rect(ctx, 130, 22, 8, 102, frame, 2.5);
    rect(ctx, 2, 120, 16, 6, "#1d3a78", 2);
    rect(ctx, 126, 120, 16, 6, "#1d3a78", 2);
    rect(ctx, 8, 108, 128, 6, "#3f74d8", 2.5);
    rect(ctx, 4, 40, 136, 7, "#3f74d8", LW);
    // helmets with visors
    [34, 72, 110].forEach((cx) => {
      ctx.beginPath();
      ctx.arc(cx, 41, 17, Math.PI, TAU);
      ctx.closePath();
      paint(ctx, C.black, LW);
      rect(ctx, cx - 7, 26, 14, 2.6, C.white, 0);
      rrect(ctx, cx - 14, 30, 28, 11, 3, "#46607a", 2.2);
      glint(ctx, [[cx - 9, 38], [cx - 5, 32]], 2, 0.7);
      glint(ctx, [[cx - 12, 29], [cx - 8, 25.5]], 1.8, 0.45);
    });
    // shields: clear, with a black POLICE band and glare
    [17, 45, 73, 101].forEach((x, i) => {
      ctx.save();
      ctx.translate(x + 13, 122);
      ctx.rotate((i % 2 ? 1 : -1) * 0.025);
      ctx.translate(-(x + 13), -122);
      rrect(ctx, x, 52, 26, 70, 6, "rgba(218,236,252,0.88)", 3);
      rrect(ctx, x + 3, 55, 20, 64, 4, null, 1);
      rect(ctx, x + 2, 62, 22, 10, C.tire, 0);
      words(ctx, "POLICE", x + 13, 67.3, 19, 8, C.white);
      glint(ctx, [[x + 5, 104], [x + 16, 78]], 2.4, 0.85);
      glint(ctx, [[x + 11, 114], [x + 21, 90]], 1.8, 0.6);
      glint(ctx, [[x + 5, 59], [x + 8, 56]], 1.8, 0.7);
      ctx.restore();
    });
    shadeIn(ctx, (c) => {
      c.rect(6, 22, 8, 102);
      c.rect(130, 22, 8, 102);
    }, 0.3, 0, 22, w, 106);
  });

  /* ======================= Lincoln Middle School ======================= */

  /* The big brain: a giant pink model on a stand, the two halves a little apart (flat where they face
     each other and underneath), the striped little back brain and the stem below them, numbered flags on pins. */
  art("brainModel", 140, (ctx, w, h) => {
    shadow(ctx, 70, 34, h);
    can(ctx, 70, 113, 28, 5, 7, "#2a2d33", "#3a3d44", 2.5);
    rect(ctx, 66, 84, 8, 30, C.chrome, 2.5);
    // the stem and the little back brain, showing between and under the halves
    rect(ctx, 65, 66, 10, 22, "#e39ab5", 2.5);
    scallop(ctx, 70, 70, 17, 8, 9, 0.12, "#e07a9c", 2.5);
    line(ctx, [[57, 69], [83, 69]], "#b24a70", 1.6);
    line(ctx, [[60, 73.5], [80, 73.5]], "#b24a70", 1.6);
    // one half: bumpy, flat on the side facing the other half, flatter underneath, its outer side
    // bulging low (the temple)
    const lobe = (c, cx, cy, side) => {
      const n = 14;
      const at = (a) => {
        const co = Math.cos(a);
        const si = Math.sin(a);
        const rx = co * side < 0 ? 21 : si > 0 ? 32 : 28;
        return [cx + co * rx, cy + si * (si > 0 ? 24 : 36)];
      };
      for (let i = 0; i <= n; i++) {
        const [x, y] = at((i / n) * TAU);
        if (!i) {
          c.moveTo(x, y);
          continue;
        }
        const [mx, my] = at(((i - 0.5) / n) * TAU);
        c.quadraticCurveTo(cx + (mx - cx) * 1.1, cy + (my - cy) * 1.1, x, y);
      }
      c.closePath();
    };
    [[45, 42, -1, 7], [95, 42, 1, 19]].forEach(([cx, cy, side, seed]) => {
      ctx.beginPath();
      lobe(ctx, cx, cy, side);
      paint(ctx, "#f08cae", 0);
      ctx.save();
      ctx.beginPath();
      lobe(ctx, cx, cy, side);
      ctx.clip();
      // folds: wavy rows across, a few short ones down from the top
      const r = rng(seed);
      ctx.beginPath();
      for (let k = 0; k < 7; k++) {
        const y = cy - 30 + k * 9.5 + r() * 3;
        ctx.moveTo(cx - 34, y);
        for (let x = cx - 34; x < cx + 34; x += 9) ctx.quadraticCurveTo(x + 4.5, y + (r() - 0.5) * 16, x + 9, y + (r() - 0.5) * 5);
      }
      for (let k = 0; k < 4; k++) {
        const x = cx - 20 + k * 13 + r() * 4;
        ctx.moveTo(x, cy - 34);
        ctx.quadraticCurveTo(x + (r() - 0.5) * 14, cy - 22, x + (r() - 0.5) * 8, cy - 12);
      }
      ink(ctx, 2.3, "#c4527a");
      ctx.stroke();
      dots(ctx, cx - 34, cy + 6, 68, 34, 0.2);
      ctx.restore();
      ctx.beginPath();
      lobe(ctx, cx, cy, side);
      paint(ctx, null, LW);
      glint(ctx, [[cx - 18, cy - 24], [cx - 8, cy - 31]], 2.5, 0.8);
    });
    // flags on pins
    [[28, 22, 12, 4, "1"], [108, 16, 124, 2, "2"], [112, 56, 125, 72, "3"]].forEach(([px, py, fx, fy, t]) => {
      line(ctx, [[px, py], [fx + 2, fy + 10]], INK, 1.8);
      circle(ctx, px, py, 2.2, "#d0342c", 1.2);
      rect(ctx, fx - 9, fy, 18, 12, C.white, 2);
      words(ctx, t, fx, fy + 6.3, 12, 10, INK);
    });
  });

  /* The drum set: a big bass drum with a gold lion face, two toms, a snare, a floor tom and two cymbals,
     in the school blue. */
  art("drumSet", 172, (ctx, w, h) => {
    shadow(ctx, 86, 82, h);
    const shell = C.navy;
    const head = C.cream;
    // cymbal stands and cymbals
    [[22, 30, -0.14], [150, 25, 0.14]].forEach(([x, y, rot]) => {
      tube(ctx, [[x, 124], [x, y]], C.steel, 2);
      tube(ctx, [[x - 11, 126], [x, 108], [x + 11, 126]], C.steel, 2);
      oval(ctx, x, y, 23, 5.5, "#e0b030", 2.5, rot);
      oval(ctx, x, y - 1, 6, 2, "#c99a20", 1.5, rot);
      glint(ctx, [[x - 14, y - 2 - rot * 20], [x - 5, y - 4 - rot * 8]], 1.6, 0.8);
    });
    // floor tom on legs, snare on its stand
    tube(ctx, [[128, 100], [124, 125]], C.steel, 2);
    tube(ctx, [[158, 100], [162, 125]], C.steel, 2);
    can(ctx, 143, 76, 21, 6, 28, shell, head);
    line(ctx, [[122, 84], [164, 84]], C.gold, 2);
    tube(ctx, [[34, 98], [34, 120]], C.steel, 2);
    tube(ctx, [[22, 126], [34, 116], [46, 126]], C.steel, 2);
    can(ctx, 34, 82, 20, 6, 14, C.chrome, head);
    ctx.beginPath();
    for (let x = 18; x <= 50; x += 8) {
      ctx.moveTo(x, 84);
      ctx.lineTo(x, 96);
    }
    ink(ctx, 1.4, C.steelD);
    ctx.stroke();
    tube(ctx, [[22, 76], [50, 66]], "#e3c48a", 2.5);
    tube(ctx, [[46, 77], [26, 64]], "#e3c48a", 2.5);
    // two toms on the bass drum
    tube(ctx, [[86, 56], [86, 44]], C.chrome, 3);
    can(ctx, 66, 40, 17, 5, 17, shell, head);
    can(ctx, 106, 38, 17, 5, 17, shell, head);
    // the bass drum and its lion
    tube(ctx, [[54, 112], [44, 126]], C.chrome, 2.5);
    tube(ctx, [[118, 112], [128, 126]], C.chrome, 2.5);
    circle(ctx, 86, 86, 38, shell, LW);
    circle(ctx, 86, 86, 31, head, LW);
    for (let i = 0; i < 10; i++) {
      const a = (i * TAU) / 10;
      circle(ctx, 86 + Math.cos(a) * 34.5, 86 + Math.sin(a) * 34.5, 2.3, C.gold, 1.2);
    }
    star(ctx, 86, 86, 13, 25, 19, 0, "#d9861e", 2.5);
    circle(ctx, 86, 87, 15, C.gold, 2.5);
    circle(ctx, 76, 75, 4.5, C.gold, 2);
    circle(ctx, 96, 75, 4.5, C.gold, 2);
    circle(ctx, 80.5, 84, 2.4, INK, 0);
    circle(ctx, 91.5, 84, 2.4, INK, 0);
    oval(ctx, 86, 93, 8, 5.5, "#f8e3a0", 1.6);
    poly(ctx, [[82.5, 88.5], [89.5, 88.5], [86, 92.5]], "#6b3a1e", 1.2);
    line(ctx, [[86, 92.5], [86, 96], [83, 97.5]], INK, 1.4);
    line(ctx, [[86, 96], [89, 97.5]], INK, 1.4);
    shadeIn(ctx, (c) => c.arc(86, 86, 38, 0, TAU), 0.18, 86, 86, 40, 40);
  });

  /* The lion statue: a gold lion sitting on a blue base with the word LIONS. */
  art("lionStatue", 128, (ctx, w, h, o) => {
    shadow(ctx, 64, 62, h);
    rect(ctx, 14, 90, 100, 32, C.navy, LW);
    rect(ctx, 8, 84, 112, 9, "#3f74b8", LW);
    rect(ctx, 10, 120, 108, 6, "#24497a", 2.5);
    words(ctx, o.label || "LIONS", 64, 106.5, 88, 25, C.yellow, true);
    const gold = C.gold;
    const goldD = "#c98d16";
    // tail, haunches, chest, legs and paws
    ctx.beginPath();
    ctx.moveTo(98, 78);
    ctx.quadraticCurveTo(122, 74, 114, 52);
    ink(ctx, 7.5);
    ctx.stroke();
    ink(ctx, 4, gold);
    ctx.stroke();
    oval(ctx, 114, 50, 4.5, 6.5, goldD, 2);
    oval(ctx, 38, 72, 19, 15, gold, LW);
    oval(ctx, 90, 72, 19, 15, gold, LW);
    oval(ctx, 64, 62, 24, 26, gold, LW);
    rrect(ctx, 46, 58, 13, 28, 5, gold, 2.5);
    rrect(ctx, 69, 58, 13, 28, 5, gold, 2.5);
    oval(ctx, 52.5, 84, 9, 4.5, gold, 2.5);
    oval(ctx, 75.5, 84, 9, 4.5, gold, 2.5);
    line(ctx, [[50, 82], [50, 86]], INK, 1.3);
    line(ctx, [[55, 82], [55, 86]], INK, 1.3);
    line(ctx, [[73, 82], [73, 86]], INK, 1.3);
    line(ctx, [[78, 82], [78, 86]], INK, 1.3);
    // the mane, ears, face
    star(ctx, 64, 34, 16, 32, 23, 0, "#d9861e", LW);
    star(ctx, 64, 35, 16, 25, 19, 0.2, "#c9761a", 0);
    circle(ctx, 50, 20, 6, gold, 2.5);
    circle(ctx, 78, 20, 6, gold, 2.5);
    circle(ctx, 64, 36, 18, C.yellow, LW);
    oval(ctx, 57, 32, 4, 3.4, C.white, 1.6);
    oval(ctx, 71, 32, 4, 3.4, C.white, 1.6);
    circle(ctx, 57.6, 32.4, 2, INK, 0);
    circle(ctx, 70.4, 32.4, 2, INK, 0);
    line(ctx, [[52, 27], [60, 28]], INK, 2);
    line(ctx, [[76, 27], [68, 28]], INK, 2);
    oval(ctx, 59, 44, 7, 5.5, "#f8e3a0", 2);
    oval(ctx, 69, 44, 7, 5.5, "#f8e3a0", 2);
    poly(ctx, [[60, 38.5], [68, 38.5], [64, 43.5]], "#6b3a1e", 1.6);
    line(ctx, [[60, 51], [64, 49], [68, 51]], INK, 1.6);
    // statue shine and shade
    glint(ctx, [[26, 64], [32, 60]], 2.4, 0.7);
    glint(ctx, [[55, 23], [60, 21]], 2.2, 0.8);
    shadeIn(ctx, (c) => c.rect(72, 0, 56, 90), 0.2, 72, 0, 56, 90);
  });

  /* The basketball hoop: a rolling hoop on a heavy black base, white board, orange rim, a torn net,
     a ball on the floor. */
  art("hoop", 128, (ctx, w, h) => {
    shadow(ctx, 70, 54, h);
    // the post, dark and thick, up the right side clear of the net, and the base
    tube(ctx, [[100, 100], [100, 40]], "#3a3d44", 8);
    glint(ctx, [[98, 60], [98, 94]], 1.8, 0.45);
    tube(ctx, [[100, 82], [113, 99]], "#3a3d44", 4);
    poly(ctx, [[34, 98], [112, 98], [118, 120], [28, 120]], "#2a2d33", LW);
    rect(ctx, 30, 104, 86, 5, "#e8761a", 0);
    poly(ctx, [[34, 98], [112, 98], [118, 120], [28, 120]], null, LW);
    circle(ctx, 36, 121, 5.5, C.tire, 2);
    circle(ctx, 110, 121, 5.5, C.tire, 2);
    // board, square, pad
    rrect(ctx, 18, 4, 92, 52, 3, C.white, LW);
    rect(ctx, 46, 24, 36, 26, null, 0);
    ctx.strokeStyle = "#e8761a";
    ctx.lineWidth = 3.5;
    ctx.strokeRect(46, 25, 36, 24);
    rect(ctx, 18, 50, 92, 7, C.navy, 2.5);
    glint(ctx, [[24, 14], [34, 8]], 2.2, 0.9);
    // net (torn on the right), then the rim over it
    ctx.beginPath();
    const top = [44, 49, 54, 59, 64, 69, 74, 79, 84];
    top.forEach((x, i) => {
      const bx = 64 + (x - 64) * 0.6;
      if (i < 6) {
        ctx.moveTo(x, 64);
        ctx.lineTo(bx + 3.5, 90);
        ctx.moveTo(x, 64);
        ctx.lineTo(bx - 3.5, 90);
      } else {
        ctx.moveTo(x, 64);
        ctx.lineTo(x + 3, 80 + i * 3);
      }
    });
    ctx.moveTo(48, 77);
    ctx.lineTo(70, 77);
    ctx.moveTo(52, 89);
    ctx.lineTo(66, 89);
    ink(ctx, 3.4);
    ctx.stroke();
    ink(ctx, 1.6, C.white);
    ctx.stroke();
    rect(ctx, 58, 55, 12, 7, "#e8761a", 2);
    oval(ctx, 64, 64, 21, 5, null, 7.5);
    ctx.beginPath();
    ctx.ellipse(64, 64, 21, 5, 0, 0, TAU);
    ink(ctx, 4, "#e8761a");
    ctx.stroke();
    // the ball
    circle(ctx, 16, 114, 11, "#e8761a", 2.5);
    line(ctx, [[5, 114], [27, 114]], INK, 1.5);
    line(ctx, [[16, 103], [16, 125]], INK, 1.5);
    ctx.beginPath();
    ctx.arc(4, 114, 9, -0.9, 0.9);
    ctx.moveTo(28 - Math.cos(0.9) * 9 + 0.01, 114 - Math.sin(0.9) * 9);
    ctx.arc(28, 114, 9, Math.PI + 0.9, Math.PI - 0.9, true);
    ink(ctx, 1.5);
    ctx.stroke();
    shadeIn(ctx, (c) => c.arc(16, 114, 11, 0, TAU), 0.25, 16, 108, 12, 18);
  });

  /* ======================= Station 12 ======================= */

  /* The brass pole: floor to ceiling, shiny, with a round red pad at the bottom. */
  art("firePole", 56, (ctx, w, h) => {
    shadow(ctx, 28, 27, h);
    can(ctx, 28, 111, 25, 5, 9, "#a82c22", "#d9483a", LW);
    ctx.beginPath();
    ctx.ellipse(28, 111, 16, 3.2, 0, 0, TAU);
    ink(ctx, 1.8, C.white);
    ctx.stroke();
    // the pole, its collars and its shine
    rect(ctx, 22, 0, 12, 112, "#d9a21b", 3);
    rect(ctx, 29.5, 1.5, 3, 109, "#b07e12", 0);
    glint(ctx, [[25.2, 3], [25.2, 108]], 2, 0.8);
    glint(ctx, [[27.4, 12], [27.4, 40]], 1, 0.6);
    rect(ctx, 18, 0, 20, 6, "#c9921a", 2.5);
    rect(ctx, 20, 102, 16, 9, "#c9921a", 2.5);
    line(ctx, [[22, 40], [34, 40]], "#8a6410", 1.4);
    line(ctx, [[22, 74], [34, 74]], "#8a6410", 1.4);
    dots(ctx, 30, 0, 6, 104, 0.25);
  }, 2);

  /* The fire truck: a red engine seen from its front corner: chrome grill and round headlights in
     front, a ladder along the roof, a light bar, roll-up lockers and big wheels on the side. */
  footArt("fireTruck", 3, 0.98, (ctx, w, h) => {
    shadow(ctx, 134, 130, h);
    const red = C.red;
    const S = side(124, 264, 32, 38, 104, 101);
    // side wheels in their wells (the body covers their tops)
    [[0.2, 15], [0.8, 15]].forEach(([u, r]) => {
      const [x] = S(u, 1);
      wheel(ctx, x, 111, r);
    });
    // the side: cab door and window, two lockers, a white stripe
    poly(ctx, [S(0, 0), S(1, 0), S(1, 1), S(0.92, 1), S(0.92, 0.82), S(0.68, 0.82), S(0.68, 1), S(0.32, 1), S(0.32, 0.82), S(0.08, 0.82), S(0.08, 1), S(0, 1)], red, LW);
    quad(ctx, S, 0.03, 0.08, 0.22, 0.42, C.glass, 2.5);
    quad(ctx, S, 0.02, 0.04, 0.23, 0.8, null, 2);
    rect(ctx, S(0.17, 0.5)[0], S(0.17, 0.5)[1], 5, 3, C.chrome, 1.2);
    [[0.28, 0.6], [0.64, 0.96]].forEach(([u0, u1]) => {
      quad(ctx, S, u0, 0.1, u1, 0.7, "#d5d9de", 2.5);
      ctx.beginPath();
      for (let v = 0.16; v < 0.7; v += 0.07) {
        const [ax, ay] = S(u0, v);
        const [bx, by] = S(u1, v);
        ctx.moveTo(ax + 1, ay);
        ctx.lineTo(bx - 1, by);
      }
      ink(ctx, 1.2, "#8d949c");
      ctx.stroke();
      const [hx, hy] = S((u0 + u1) / 2, 0.66);
      rect(ctx, hx - 5, hy - 2, 10, 3.5, C.chrome, 1.2);
    });
    quad(ctx, S, 0.25, 0.74, 1, 0.8, C.white, 1.8);
    const [nx, ny] = S(0.125, 0.6);
    circle(ctx, nx, ny + 2, 9, C.gold, 2.2);
    words(ctx, "12", nx, ny + 2.5, 12, 11, INK);
    shadeIn(ctx, (c) => trace(c, [S(0, 0), S(1, 0), S(1, 1), S(0, 1)], true), 0.18, 124, 30, 142, 80);
    // the ladder along the roof, on two posts
    const L = side(98, 262, 21, 28, 29, 35);
    [0.25, 0.75].forEach((u) => {
      const [x, y] = L(u, 1);
      rect(ctx, x - 2.5, y, 5, S(u * 0.9, 0)[1] - y + 1, C.steelD, 1.5);
    });
    ctx.beginPath();
    for (let u = 0.03; u < 1; u += 0.06) {
      const [ax, ay] = L(u, 0);
      const [bx, by] = L(u, 1);
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
    }
    ink(ctx, 4.5);
    ctx.stroke();
    ink(ctx, 2, "#e6e9ec");
    ctx.stroke();
    [0, 1].forEach((v) => tube(ctx, [L(0, v), L(1, v)], "#e6e9ec", 2.6));
    // the front: cab face, windshield, light bar, band, grill, lights, bumper, tires
    rrect(ctx, 16, 104, 22, 21, 4, C.tire, 2.5);
    rrect(ctx, 96, 104, 22, 21, 4, C.tire, 2.5);
    rect(ctx, 10, 32, 114, 72, red, LW);
    rect(ctx, 18, 38, 46, 25, C.glass, 2.5);
    rect(ctx, 70, 38, 46, 25, C.glass, 2.5);
    glint(ctx, [[24, 58], [36, 42]], 2.4, 0.85);
    glint(ctx, [[76, 58], [88, 42]], 2.4, 0.85);
    glint(ctx, [[32, 60], [42, 46]], 1.4, 0.6);
    glow(ctx, 40, 24, 22, "255,90,70");
    glow(ctx, 94, 24, 22, "255,90,70");
    rect(ctx, 20, 22, 94, 10, C.white, 2.5);
    [[20, "#e03a2e"], [44, C.white], [67, "#e03a2e"], [90, C.white]].forEach(([x, c]) => rect(ctx, x + 1.5, 23.5, 21.5, 7, c, 0));
    rect(ctx, 20, 22, 94, 10, null, 2.5);
    rect(ctx, 18, 65, 98, 9, C.white, 2);
    words(ctx, "ENGINE 12", 67, 69.8, 80, 8.5, C.redD);
    rect(ctx, 42, 76, 50, 24, C.chrome, 2.5);
    ctx.beginPath();
    for (let x = 47; x < 92; x += 5) {
      ctx.moveTo(x, 78);
      ctx.lineTo(x, 98);
    }
    ink(ctx, 1.6, C.steelD);
    ctx.stroke();
    star(ctx, 67, 88, 4, 9, 4, Math.PI / 4, C.gold, 2);
    circle(ctx, 67, 88, 3.4, "#c0392b", 1.4);
    [[26, 82, 7], [26, 96, 5.5], [108, 82, 7], [108, 96, 5.5]].forEach(([x, y, r]) => {
      circle(ctx, x, y, r + 2, C.chrome, 2);
      circle(ctx, x, y, r, "#fff2b0", 1.6);
      glint(ctx, [[x - r * 0.45, y - r * 0.2], [x - r * 0.1, y - r * 0.5]], 1.6, 0.9);
    });
    rrect(ctx, 6, 99, 122, 10, 3, C.chrome, 2.5);
    line(ctx, [[10, 104], [124, 104]], C.steelD, 1.4);
    tube(ctx, [[10, 42], [3, 42]], C.steelD, 2);
    rect(ctx, 0.5, 36, 6, 16, "#3a3d44", 2);
  });

  /* The spotted dog: a white dalmatian statue sitting on a red round base, black ears and spots, red collar. */
  art("dalmatian", 112, (ctx, w, h) => {
    shadow(ctx, 56, 44, h);
    can(ctx, 56, 112, 40, 7, 8, C.redD, C.red, LW);
    const white = C.white;
    // tail, haunches, chest, front legs
    ctx.beginPath();
    ctx.moveTo(90, 104);
    ctx.quadraticCurveTo(108, 100, 104, 84);
    ink(ctx, 7);
    ctx.stroke();
    ink(ctx, 3.5, white);
    ctx.stroke();
    oval(ctx, 32, 94, 19, 17, white, LW);
    oval(ctx, 80, 94, 19, 17, white, LW);
    oval(ctx, 26, 110, 10, 4.5, white, 2.5);
    oval(ctx, 86, 110, 10, 4.5, white, 2.5);
    oval(ctx, 56, 78, 22, 30, white, LW);
    rrect(ctx, 42, 74, 11, 36, 5, white, 2.5);
    rrect(ctx, 59, 74, 11, 36, 5, white, 2.5);
    oval(ctx, 47.5, 109, 7.5, 4, white, 2.5);
    oval(ctx, 64.5, 109, 7.5, 4, white, 2.5);
    // spots on the body
    [[30, 88, 4], [24, 100, 3], [38, 98, 2.6], [84, 90, 4.2], [88, 102, 2.8], [76, 98, 2.4], [50, 66, 3], [64, 92, 2.6], [47, 84, 2.4], [62, 70, 2.2], [45, 98, 2], [66, 102, 2.2]].forEach(([x, y, r]) =>
      oval(ctx, x, y, r * 1.15, r, INK, 0)
    );
    // collar and tag
    rrect(ctx, 38, 54, 36, 8, 3, C.red, 2.5);
    circle(ctx, 56, 66, 4, C.gold, 1.8);
    // head: ears, face, muzzle, nose, eyes
    oval(ctx, 35, 32, 8, 16, INK, 2, 0.35);
    oval(ctx, 77, 32, 8, 16, INK, 2, -0.35);
    circle(ctx, 56, 32, 21, white, LW);
    oval(ctx, 56, 44, 12, 9, white, 2.5);
    oval(ctx, 56, 38.5, 5.5, 3.8, INK, 0);
    glint(ctx, [[54, 37.5], [56, 37]], 1.4, 0.8);
    line(ctx, [[56, 42], [56, 46], [51, 49]], INK, 1.6);
    line(ctx, [[56, 46], [61, 49]], INK, 1.6);
    oval(ctx, 56, 51, 3.5, 3, "#f08ca0", 1.4);
    circle(ctx, 48, 28, 3, INK, 0);
    circle(ctx, 64, 28, 3, INK, 0);
    circle(ctx, 48.8, 27, 1, C.white, 0);
    circle(ctx, 64.8, 27, 1, C.white, 0);
    oval(ctx, 68, 19, 4, 3, INK, 0);
    oval(ctx, 44, 44, 2, 1.6, INK, 0);
    oval(ctx, 66, 46, 1.8, 1.5, INK, 0);
    shadeIn(ctx, (c) => c.rect(66, 10, 46, 104), 0.16, 66, 10, 46, 104);
  });

  /* The gear racks: a dark steel rack with three firefighters' kits hung close together: a helmet on
     top, a yellow coat with silver bands, and pants pooled over black boots on the floor. */
  art("gearRack", 136, (ctx, w, h) => {
    shadow(ctx, 68, 64, h);
    const frame = "#3a3f4a";
    rect(ctx, 2, 12, 6, 114, frame, 2.5);
    rect(ctx, 128, 12, 6, 114, frame, 2.5);
    rect(ctx, 0.5, 12, 135, 7, frame, 2.5);
    const coat = "#e3b52a";
    const helmets = ["#c0392b", C.black, C.white];
    [25, 68, 111].forEach((cx, i) => {
      // pants pooled over the boots
      rrect(ctx, cx - 15, 108, 13, 18, 3, C.tire, 2.5);
      rrect(ctx, cx + 2, 108, 13, 18, 3, C.tire, 2.5);
      rect(ctx, cx - 14, 110, 11, 3, C.yellow, 0);
      rect(ctx, cx + 3, 110, 11, 3, C.yellow, 0);
      blob(ctx, [[cx - 18, 96], [cx, 92], [cx + 18, 96], [cx + 19, 108], [cx + 9, 112], [cx, 108], [cx - 9, 112], [cx - 19, 108]], "#b8901e", 2.5);
      rect(ctx, cx - 17, 101, 34, 3.5, "#e6e9ec", 0);
      // hook, coat, sleeves, bands
      tube(ctx, [[cx, 19], [cx, 28]], C.chrome, 2);
      rrect(ctx, cx - 24, 40, 8, 40, 4, coat, 2.5);
      rrect(ctx, cx + 16, 40, 8, 40, 4, coat, 2.5);
      poly(ctx, [[cx - 12, 34], [cx + 12, 34], [cx + 18, 42], [cx + 18, 90], [cx - 18, 90], [cx - 18, 42]], coat, LW);
      poly(ctx, [[cx - 8, 34], [cx + 8, 34], [cx, 45]], "#3a3d44", 2);
      line(ctx, [[cx, 45], [cx, 90]], INK, 2);
      [70, 82].forEach((y) => {
        rect(ctx, cx - 17.5, y, 35, 5, "#e6e9ec", 1.4);
        line(ctx, [[cx - 17, y + 2.5], [cx + 17, y + 2.5]], "#c8e04a", 1.2);
      });
      rect(ctx, cx - 23.5, 70, 7, 4.5, "#e6e9ec", 1.2);
      rect(ctx, cx + 16.5, 70, 7, 4.5, "#e6e9ec", 1.2);
      shadeIn(ctx, (c) => c.rect(cx + 5, 34, 19, 56), 0.2, cx + 5, 34, 19, 56);
      // the helmet: dome, wide brim, gold front shield
      oval(ctx, cx, 34, 19, 5, helmets[i], LW);
      ctx.beginPath();
      ctx.arc(cx, 33, 13, Math.PI, TAU);
      ctx.closePath();
      paint(ctx, helmets[i], LW);
      line(ctx, [[cx, 20], [cx, 31]], i === 2 ? "#a9aeb4" : "rgba(255,255,255,0.4)", 2);
      rrect(ctx, cx - 6, 22, 12, 11, 2, C.gold, 2);
      words(ctx, "12", cx, 27.8, 9, 7.5, INK);
      glint(ctx, [[cx - 9, 28], [cx - 6.5, 23.5]], 1.8, 0.7);
    });
  });

  /* ======================= St. Anne Annex ======================= */

  /* The x-ray machine: a white column with an arm over a padded table, a radiation badge, and a
     light box glowing with a chest x-ray on a stand beside it. */
  art("xray", 134, (ctx, w, h) => {
    shadow(ctx, 70, 62, h);
    // the light box on its stand, glowing
    tube(ctx, [[24, 72], [24, 122]], C.steel, 3.5);
    tube(ctx, [[12, 126], [24, 116], [36, 126]], C.steel, 3);
    glow(ctx, 24, 46, 38, "150,225,255");
    rrect(ctx, 4, 22, 40, 50, 3, "#d7dde3", LW);
    rect(ctx, 8, 26, 32, 42, "#cfefff", 2);
    rect(ctx, 11, 29, 26, 36, "#1f4f78", 0);
    // a chest x-ray: spine and ribs
    line(ctx, [[24, 31], [24, 63]], "#eaf7ff", 3);
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const y = 36 + k * 5.5;
      ctx.moveTo(23, y);
      ctx.quadraticCurveTo(14, y - 1, 14, y + 5);
      ctx.moveTo(25, y);
      ctx.quadraticCurveTo(34, y - 1, 34, y + 5);
    }
    ink(ctx, 1.8, "#eaf7ff");
    ctx.stroke();
    oval(ctx, 24, 31, 4, 2.2, "#eaf7ff", 0);
    // the table and its pad
    rect(ctx, 70, 94, 24, 26, "#d7dde3", 2.5);
    rect(ctx, 58, 120, 48, 6, C.steelD, 2.5);
    rrect(ctx, 40, 84, 88, 12, 3, C.white, LW);
    rrect(ctx, 44, 78, 80, 8, 4, "#7fc4e8", 2.5);
    // the column, the arm and the tube head
    rect(ctx, 110, 16, 16, 106, C.white, LW);
    rect(ctx, 104, 118, 28, 8, C.steelD, 2.5);
    rrect(ctx, 56, 12, 70, 14, 4, C.white, LW);
    rrect(ctx, 62, 26, 30, 26, 4, C.white, LW);
    rect(ctx, 66, 50, 22, 6, "#3a3d44", 2);
    oval(ctx, 77, 56, 8.5, 2.5, "#2a2e35", 1.8);
    line(ctx, [[70, 32], [84, 32]], "#a9aeb4", 1.6);
    // the radiation badge
    circle(ctx, 118, 60, 7.5, C.yellow, 2.2);
    circle(ctx, 118, 60, 1.5, INK, 0);
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i * TAU) / 3;
      ctx.beginPath();
      ctx.moveTo(118 + Math.cos(a - 0.5) * 2.4, 60 + Math.sin(a - 0.5) * 2.4);
      ctx.arc(118, 60, 6.2, a - 0.5, a + 0.5);
      ctx.arc(118, 60, 2.4, a + 0.5, a - 0.5, true);
      ctx.closePath();
      ctx.fillStyle = INK;
      ctx.fill();
    }
    // control buttons on the column
    rect(ctx, 112.5, 78, 11, 16, "#3a3d44", 1.8);
    circle(ctx, 118, 82.5, 2.2, "#3fbf5a", 0);
    circle(ctx, 118, 89.5, 2.2, "#e0503f", 0);
    shadeIn(ctx, (c) => {
      c.rect(119, 16, 7, 106);
      c.rect(40, 90, 88, 6);
    }, 0.2, 40, 16, 88, 106);
  });

  /* The angel statue: white stone, wings folded, hands together, a gold halo, on a stone pedestal
     with lit candles in front. */
  art("angelStatue", 120, (ctx, w, h) => {
    shadow(ctx, 60, 54, h);
    const stone = "#ece8dc";
    const stoneD = "#c9c3b4";
    // pedestal
    rect(ctx, 26, 92, 68, 28, "#d8d3c6", LW);
    rect(ctx, 20, 86, 80, 8, stone, LW);
    rect(ctx, 18, 118, 84, 8, "#bdb7a8", 2.5);
    rect(ctx, 36, 98, 48, 14, null, 1.6);
    // wings behind the body, folded
    [-1, 1].forEach((s) => {
      ctx.beginPath();
      ctx.moveTo(60 + s * 8, 40);
      ctx.quadraticCurveTo(60 + s * 30, 2, 60 + s * 26, 34);
      ctx.quadraticCurveTo(60 + s * 32, 58, 60 + s * 18, 84);
      ctx.lineTo(60 + s * 10, 70);
      ctx.closePath();
      paint(ctx, stone, LW);
      ctx.beginPath();
      [[24, 30], [26, 44], [24, 58], [20, 70]].forEach(([dx, y]) => {
        ctx.moveTo(60 + s * (dx - 9), y + 4);
        ctx.quadraticCurveTo(60 + s * (dx - 2), y + 3, 60 + s * dx, y - 2);
      });
      ink(ctx, 1.5, "#a9a396");
      ctx.stroke();
    });
    // robe with folds, hands together, head and halo
    poly(ctx, [[52, 40], [68, 40], [78, 86], [42, 86]], stone, LW);
    line(ctx, [[55, 54], [50, 84]], stoneD, 1.6);
    line(ctx, [[62, 56], [62, 84]], stoneD, 1.6);
    line(ctx, [[68, 54], [72, 84]], stoneD, 1.6);
    oval(ctx, 60, 54, 6, 8, stone, 2);
    line(ctx, [[60, 47], [60, 61]], stoneD, 1.2);
    rect(ctx, 57, 34, 6, 7, stone, 2);
    circle(ctx, 60, 28, 9.5, stone, LW);
    line(ctx, [[55, 28.5], [58, 29.5]], INK, 1.3);
    line(ctx, [[62, 29.5], [65, 28.5]], INK, 1.3);
    ctx.beginPath();
    ctx.ellipse(60, 15, 11, 3.4, 0, 0, TAU);
    ink(ctx, 5);
    ctx.stroke();
    ink(ctx, 2.6, C.gold);
    ctx.stroke();
    shadeIn(ctx, (c) => c.rect(64, 0, 56, 120), 0.18, 64, 0, 56, 120);
    // candles glowing at its feet
    [[22, 110, 14], [34, 114, 10], [86, 114, 10], [98, 110, 14], [60, 116, 8]].forEach(([x, y, ch]) => {
      glow(ctx, x, y - ch / 2 - 6, 11, "255,210,110");
      rect(ctx, x - 3.5, y - ch / 2, 7, ch / 2 + 12, C.cream, 1.8);
      ctx.beginPath();
      ctx.moveTo(x, y - ch / 2 - 10);
      ctx.quadraticCurveTo(x + 4, y - ch / 2 - 3, x, y - ch / 2 - 1);
      ctx.quadraticCurveTo(x - 4, y - ch / 2 - 3, x, y - ch / 2 - 10);
      paint(ctx, "#ffd23a", 1.4);
    });
  });

  /* The giant teddy bear: brown, sitting with its legs out, round ears, button eyes, a big red bow. */
  art("giantBear", 128, (ctx, w, h) => {
    shadow(ctx, 64, 58, h);
    const fur = "#9a6236";
    const tan = "#e0b98a";
    // arms behind the body, legs in front of it
    oval(ctx, 24, 78, 12, 22, fur, LW, 0.35);
    oval(ctx, 104, 78, 12, 22, fur, LW, -0.35);
    oval(ctx, 64, 82, 38, 34, fur, LW);
    oval(ctx, 64, 88, 22, 22, tan, 2.5);
    ctx.setLineDash([3, 3]);
    line(ctx, [[64, 70], [64, 106]], "#9a7450", 1.4);
    ctx.setLineDash([]);
    oval(ctx, 34, 110, 20, 14, fur, LW);
    oval(ctx, 94, 110, 20, 14, fur, LW);
    oval(ctx, 26, 112, 9, 10, tan, 2.5);
    oval(ctx, 102, 112, 9, 10, tan, 2.5);
    // ears, head, muzzle, eyes, nose
    circle(ctx, 38, 16, 11, fur, LW);
    circle(ctx, 90, 16, 11, fur, LW);
    circle(ctx, 38, 16, 6, tan, 2);
    circle(ctx, 90, 16, 6, tan, 2);
    circle(ctx, 64, 40, 30, fur, LW);
    oval(ctx, 64, 51, 14, 10, tan, 2.5);
    oval(ctx, 64, 46, 6, 4, INK, 0);
    glint(ctx, [[62, 45], [64, 44.5]], 1.4, 0.8);
    line(ctx, [[64, 50], [64, 54], [59, 57]], INK, 1.8);
    line(ctx, [[64, 54], [69, 57]], INK, 1.8);
    circle(ctx, 52, 35, 4.5, INK, 0);
    circle(ctx, 76, 35, 4.5, INK, 0);
    circle(ctx, 53.4, 33.6, 1.4, C.white, 0);
    circle(ctx, 77.4, 33.6, 1.4, C.white, 0);
    // the bow
    poly(ctx, [[64, 70], [42, 60], [44, 80]], C.red, 2.5);
    poly(ctx, [[64, 70], [86, 60], [84, 80]], C.red, 2.5);
    poly(ctx, [[60, 72], [52, 90], [58, 89]], C.redD, 2);
    poly(ctx, [[68, 72], [76, 90], [70, 89]], C.redD, 2);
    rrect(ctx, 58, 65, 12, 11, 3, "#e0503f", 2.5);
    glint(ctx, [[47, 64], [52, 66]], 1.8, 0.6);
    shadeIn(ctx, (c) => {
      c.rect(78, 0, 50, 128);
      c.rect(0, 100, 128, 28);
    }, 0.18, 0, 0, 128, 128);
  });

  /* The rescue van: a white ambulance seen from its back corner, both back doors open on a lit
     inside with a stretcher, a red stripe, a red cross, RESCUE on its side (the notes call it the
     rescue van) and lights on the roof. */
  footArt("ambulance", 3, 0.98, (ctx, w, h) => {
    shadow(ctx, 134, 130, h);
    const S = side(162, 60, 22, 32, 104, 100);
    wheel(ctx, S(0.18, 1)[0], 112, 15);
    wheel(ctx, 34, 112, 13);
    // the cab at the far end
    const cab = [[62, 46], [62, 102], [4, 102], [4, 74], [20, 60], [34, 48]];
    poly(ctx, cab, C.white, LW);
    poly(ctx, [[36, 52], [56, 52], [56, 70], [24, 70]], C.glass, 2.5);
    rect(ctx, 5.5, 84, 55, 6, C.red, 0);
    poly(ctx, cab, null, LW);
    rect(ctx, 1, 96, 21, 8, C.steelD, 2);
    circle(ctx, 8, 78, 4, "#fff2b0", 1.8);
    // the box side: stripe, a red cross by the cab, the word
    quad(ctx, S, 0, 0, 1, 1, C.white, LW);
    quad(ctx, S, 0, 0.62, 1, 0.74, C.red, 0);
    quad(ctx, S, 0, 0.62, 1, 0.74, null, 1.6);
    const [cx, cy] = S(0.87, 0.36);
    poly(ctx, [[cx - 4, cy - 11.5], [cx + 4, cy - 11.5], [cx + 4, cy - 4], [cx + 11.5, cy - 4], [cx + 11.5, cy + 4], [cx + 4, cy + 4], [cx + 4, cy + 11.5], [cx - 4, cy + 11.5], [cx - 4, cy + 4], [cx - 11.5, cy + 4], [cx - 11.5, cy - 4], [cx - 4, cy - 4]], C.red, 2.5);
    const [tx, ty] = S(0.51, 0.38);
    words(ctx, "RESCUE", tx, ty, 40, 15, C.red);
    shadeIn(ctx, (c) => trace(c, [S(0, 0), S(1, 0), S(1, 1), S(0, 1)], true), 0.14, 60, 20, 102, 86);
    // the back: frame, the lit inside with a stretcher and shelves
    const bx = 162;
    const bw = 76;
    rect(ctx, bx, 22, bw, 84, C.white, LW);
    rect(ctx, bx + 7, 30, bw - 14, 70, "#3a4756", 2.5);
    poly(ctx, [[bx + 17, 40], [bx + bw - 17, 40], [bx + bw - 17, 84], [bx + 17, 84]], "#526273", 1.5);
    line(ctx, [[bx + 7, 30], [bx + 17, 40]], "#2a3440", 1.5);
    line(ctx, [[bx + bw - 7, 30], [bx + bw - 17, 40]], "#2a3440", 1.5);
    line(ctx, [[bx + 7, 100], [bx + 17, 84]], "#2a3440", 1.5);
    line(ctx, [[bx + bw - 7, 100], [bx + bw - 17, 84]], "#2a3440", 1.5);
    rect(ctx, bx + 19, 46, bw - 38, 3, C.steel, 1.2);
    rect(ctx, bx + 42, 34, 12, 12, C.red, 1.6);
    rect(ctx, bx + 22, 36, 12, 10, C.yellow, 1.6);
    tube(ctx, [[bx + 13, 88], [bx + bw - 13, 88]], C.orange, 2.5);
    rrect(ctx, bx + 13, 80, bw - 26, 8, 3, C.white, 2);
    [bx + 19, bx + bw - 19].forEach((x) => {
      circle(ctx, x, 96, 3, C.tire, 1.2);
      line(ctx, [[x, 92], [x, 88]], C.steel, 1.5);
    });
    rect(ctx, bx + 2, 70, 5, 26, "#e0503f", 1.4);
    rect(ctx, bx + bw - 7, 70, 5, 26, "#e0503f", 1.4);
    rect(ctx, bx - 4, 104, bw + 8, 9, C.steelD, 2.5);
    // the two back doors swung open: one against the side, one out to the right
    [[[bx - 24, 17], [bx, 22], [bx, 106], [bx - 24, 110]], [[bx + bw, 22], [bx + bw + 26, 15], [bx + bw + 26, 113], [bx + bw, 106]]].forEach((pts, i) => {
      poly(ctx, pts, C.white, LW);
      const [a, b, c] = pts;
      const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
      const top = (t) => lerp(a, b, t);
      const bot = (t) => lerp(pts[3], c, t);
      const at = (u, v) => lerp(top(u), bot(u), v);
      poly(ctx, [at(0.18, 0.1), at(0.82, 0.1), at(0.82, 0.32), at(0.18, 0.32)], C.glass, 2);
      poly(ctx, [at(0, 0.62), at(1, 0.62), at(1, 0.74), at(0, 0.74)], C.red, 0);
      const [px, py] = at(0.5, 0.48);
      poly(ctx, [[px - 2.6, py - 7], [px + 2.6, py - 7], [px + 2.6, py - 2.6], [px + 7, py - 2.6], [px + 7, py + 2.6], [px + 2.6, py + 2.6], [px + 2.6, py + 7], [px - 2.6, py + 7], [px - 2.6, py + 2.6], [px - 7, py + 2.6], [px - 7, py - 2.6], [px - 2.6, py - 2.6]], C.red, 1.4);
      poly(ctx, pts, null, LW);
      if (i) shadeIn(ctx, (cc) => trace(cc, pts, true), 0.2, bx + bw, 15, 26, 98);
    });
    // roof lights
    [[bx + bw / 2 - 35, "#e03a2e", "255,80,60"], [bx + bw / 2 - 7, C.white, "255,255,230"], [bx + bw / 2 + 21, "#e03a2e", "255,80,60"]].forEach(([x, c, rgb]) => {
      glow(ctx, x + 7, 15, 18, rgb);
      rrect(ctx, x, 11, 14, 11, 3, c, 2.2);
    });
    rrect(ctx, 66, 25, 10, 7, 2, "#e03a2e", 1.8);
  });

  /* ======================= Water Tower ======================= */

  /* The big red wheel: a valve wheel facing you on a gray valve body, on a thick pipe out of the floor. */
  art("valveWheel", 128, (ctx, w, h) => {
    shadow(ctx, 64, 40, h);
    const pipe = "#5f7a72";
    rect(ctx, 50, 80, 28, 42, pipe, LW);
    rect(ctx, 40, 116, 48, 10, "#4f665f", LW);
    [46, 58, 70, 82].forEach((x) => circle(ctx, x, 121, 1.8, C.chrome, 1));
    rect(ctx, 44, 76, 40, 8, "#4f665f", 2.5);
    rrect(ctx, 38, 52, 52, 28, 8, "#4b5057", LW);
    [44, 84].forEach((x) => [58, 74].forEach((y) => circle(ctx, x, y, 2, C.chrome, 1)));
    shadeIn(ctx, (c) => c.rect(64, 50, 30, 76), 0.25, 64, 50, 30, 76);
    // the stem and the wheel: rim (cut out in the middle), spokes, hub, a grip knob
    rect(ctx, 60, 48, 8, 10, C.chrome, 2);
    const cx = 64, cy = 48, R = 44, r = 34;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.moveTo(cx + r, cy);
    ctx.arc(cx, cy, r, 0, TAU, true);
    ctx.fillStyle = "#d62b1e";
    ctx.fill("evenodd");
    ink(ctx, LW);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i * TAU) / 6 + Math.PI / 6;
      const ax = cx + Math.cos(a) * 8;
      const ay = cy + Math.sin(a) * 8;
      const bx = cx + Math.cos(a) * (r + 2);
      const by = cy + Math.sin(a) * (r + 2);
      line(ctx, [[ax, ay], [bx, by]], INK, 9.5);
      line(ctx, [[ax, ay], [bx, by]], "#d62b1e", 6);
    }
    for (let i = 0; i < 12; i++) {
      const a = (i * TAU) / 12;
      circle(ctx, cx + Math.cos(a) * (R - 5), cy + Math.sin(a) * (R - 5), 1.4, "#8e1a12", 0);
    }
    ctx.beginPath();
    ctx.arc(cx, cy, R - 4, 3.5, 4.6);
    ink(ctx, 2.5, "rgba(255,255,255,0.55)");
    ctx.stroke();
    circle(ctx, cx, cy, 11, "#a3271f", LW);
    star(ctx, cx, cy, 6, 6, 5.2, 0, C.chrome, 1.8);
    circle(ctx, cx + R - 2, cy + 18, 5.5, "#2a2d33", 2);
    // a yellow tag on a spoke
    line(ctx, [[cx - 18, cy + 18], [cx - 24, cy + 30]], INK, 1.2);
    poly(ctx, [[cx - 32, cy + 30], [cx - 16, cy + 30], [cx - 16, cy + 44], [cx - 32, cy + 44]], C.yellow, 2);
    ctx.beginPath();
    ctx.arc(cx - 24, cy + 37, 4, 0.3, 5.2);
    ink(ctx, 1.6);
    ctx.stroke();
    poly(ctx, [[cx - 20.5, cy + 31], [cx - 17.5, cy + 35], [cx - 22, cy + 35.5]], INK, 0);
  });

  /* The blue pump: a big blue motor lying on its side on a steel skid, a snail-shell pump with fat
     pipes into the floor and up to the ceiling, a round pressure gauge. */
  footArt("bigPump", 3, 0.98, (ctx, w, h) => {
    shadow(ctx, 134, 130, h);
    const blue = "#2f6fd0";
    const blueD = "#1f4f9e";
    const pipe = "#6b8580";
    // the skid
    rect(ctx, 14, 108, 244, 16, "#4b5057", LW);
    line(ctx, [[18, 114], [254, 114]], "#2a2d33", 1.6);
    // pipes: the inlet bends down into the floor on the left, the outlet goes up to the ceiling
    tube(ctx, [[18, 70], [52, 70]], pipe, 26);
    rect(ctx, 44, 52, 9, 36, "#5a706b", 2.5);
    tube(ctx, [[18, 70], [18, 126]], pipe, 24);
    rect(ctx, 2, 118, 32, 8, "#5a706b", 2.5);
    tube(ctx, [[92, 40], [92, 0]], pipe, 26);
    rect(ctx, 74, 30, 36, 9, "#5a706b", 2.5);
    rect(ctx, 74, 6, 36, 8, "#5a706b", 2.5);
    shadeIn(ctx, (c) => {
      c.rect(96, 0, 16, 40);
      c.rect(18, 74, 34, 12);
      c.rect(22, 70, 12, 56);
    }, 0.25, 0, 0, 112, 128);
    // the pressure gauge on a stub
    tube(ctx, [[106, 22], [118, 22]], C.chrome, 4);
    circle(ctx, 132, 22, 17, C.chrome, LW);
    circle(ctx, 132, 22, 13, C.white, 2);
    ctx.beginPath();
    ctx.arc(132, 22, 10, -0.35, 0.75);
    ink(ctx, 3.5, "#d62b1e");
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI * 0.75 + (i / 8) * Math.PI * 1.5;
      ctx.moveTo(132 + Math.cos(a) * 9, 22 + Math.sin(a) * 9);
      ctx.lineTo(132 + Math.cos(a) * 12, 22 + Math.sin(a) * 12);
    }
    ink(ctx, 1.4);
    ctx.stroke();
    line(ctx, [[132, 22], [141, 16]], INK, 2);
    circle(ctx, 132, 22, 2.2, INK, 0);
    // the pump casing (a snail shell) with a flange ring
    ctx.beginPath();
    ctx.arc(92, 74, 34, 0, TAU);
    paint(ctx, blue, LW);
    ctx.beginPath();
    ctx.arc(92, 74, 22, -1.2, 3.6);
    ink(ctx, 2, blueD);
    ctx.stroke();
    circle(ctx, 92, 74, 12, blueD, 2.5);
    for (let i = 0; i < 10; i++) {
      const a = (i * TAU) / 10;
      circle(ctx, 92 + Math.cos(a) * 29, 74 + Math.sin(a) * 29, 1.8, C.chrome, 0.8);
    }
    rect(ctx, 74, 100, 36, 8, "#3a3d44", 2);
    // the coupling guard
    rect(ctx, 128, 60, 28, 30, C.yellow, LW);
    ctx.save();
    ctx.beginPath();
    ctx.rect(128, 60, 28, 30);
    ctx.clip();
    ctx.beginPath();
    for (let x = 118; x < 160; x += 10) {
      ctx.moveTo(x, 92);
      ctx.lineTo(x + 30, 58);
    }
    ink(ctx, 4.5);
    ctx.stroke();
    ctx.restore();
    rect(ctx, 128, 60, 28, 30, null, LW);
    tube(ctx, [[128, 75], [118, 75]], C.chrome, 6);
    // the motor: body with cooling fins, end cap, terminal box, feet
    const mx = 160;
    const ml = 90;
    rect(ctx, mx + 10, 98, 14, 10, "#3a3d44", 2);
    rect(ctx, mx + ml - 26, 98, 14, 10, "#3a3d44", 2);
    rrect(ctx, mx, 42, ml, 60, 10, blue, LW);
    ctx.beginPath();
    for (let x = mx + 16; x < mx + ml - 6; x += 9) {
      ctx.moveTo(x, 46);
      ctx.lineTo(x, 98);
    }
    ink(ctx, 2.2, blueD);
    ctx.stroke();
    oval(ctx, mx + ml, 72, 11, 30, "#3f80e0", LW);
    circle(ctx, mx + ml, 72, 5, blueD, 2);
    rect(ctx, mx + 36, 28, 32, 15, "#7d848c", LW);
    rect(ctx, mx + 40, 32, 24, 7, "#d7dde3", 1.4);
    ctx.beginPath();
    ctx.arc(mx + 16, 40, 6, Math.PI, TAU);
    ink(ctx, 3);
    ctx.stroke();
    glint(ctx, [[mx + 8, 52], [mx + ml - 10, 52]], 2.6, 0.55);
    glint(ctx, [[72, 56], [84, 46]], 2.6, 0.7);
    shadeIn(ctx, (c) => {
      c.rect(mx, 80, ml, 22);
      c.arc(92, 74, 34, 0.2, 2.6);
    }, 0.22, 52, 70, 210, 34);
  });

  /* The green tanks: four tall green gas cylinders behind a rail, a chain across their fronts and a
     yellow warning tag on each. */
  art("chlorineTanks", 136, (ctx, w, h) => {
    shadow(ctx, 68, 66, h);
    const green = "#3f9a4a";
    rect(ctx, 5, 46, 6, 80, C.steelD, 2.5);
    rect(ctx, 125, 46, 6, 80, C.steelD, 2.5);
    rect(ctx, 1.5, 46, 133, 6, C.steel, 2.5);
    [28, 54.5, 81, 107.5].forEach((cx, i) => {
      const top = 14 + (i % 2) * 4;
      rect(ctx, cx - 5, top - 6, 10, 9, C.chrome, 2);
      rect(ctx, cx - 9, top - 9, 18, 4, C.steelD, 1.8);
      rrect(ctx, cx - 13, top, 26, 124 - top, 12, green, LW);
      rect(ctx, cx - 12, top + 8, 24, 6, C.white, 0);
      rrect(ctx, cx - 13, top, 26, 124 - top, 12, null, LW);
      shadeIn(ctx, (c) => c.rect(cx + 4, top, 10, 124 - top), 0.28, cx + 4, top, 10, 124 - top);
      glint(ctx, [[cx - 7, top + 18], [cx - 7, 116]], 2.6, 0.6);
    });
    // the chain: links along a sag from post to post
    const pt = (t) => {
      const x = 8 + 120 * t;
      return [x, 60 + Math.sin(t * Math.PI) * 10];
    };
    for (let k = 0; k <= 36; k++) {
      const [x, y] = pt(k / 36);
      const [x2, y2] = pt(Math.min(1, (k + 1) / 36));
      oval(ctx, x, y, k % 2 ? 2.4 : 3.2, k % 2 ? 1.4 : 2.2, k % 2 ? INK : C.steel, 1.2, Math.atan2(y2 - y, x2 - x));
    }
    // warning tags
    [28, 54.5, 81, 107.5].forEach((cx, i) => {
      const y = 80 + (i % 2) * 6;
      line(ctx, [[cx, y - 12], [cx, y - 6]], INK, 1.4);
      poly(ctx, [[cx, y - 8], [cx + 9, y + 1], [cx, y + 10], [cx - 9, y + 1]], C.yellow, 2);
      words(ctx, "!", cx, y + 1.5, 6, 11, INK);
    });
  });

  /* The rowboat: an upside-down wooden boat on two sawhorses, green bottom and varnished planks, two
     oars leaning on it. */
  footArt("rowboat", 3, 0.7, (ctx, w, h) => {
    shadow(ctx, 186, 178, h);
    const wood = "#c98a4a";
    const leg = "#a87c4e";
    // sawhorses (far legs first)
    [94, 280].forEach((cx) => {
      tube(ctx, [[cx - 21, 94], [cx - 27, 126]], "#8a6440", 4);
      tube(ctx, [[cx + 21, 94], [cx + 27, 126]], "#8a6440", 4);
    });
    // the hull: keel on top, a square stern on the left, the bow on the right
    const hull = (c) => {
      c.moveTo(24, 90);
      c.lineTo(20, 38);
      c.quadraticCurveTo(179, -6, 335, 34);
      c.quadraticCurveTo(368, 48, 359, 88);
      c.quadraticCurveTo(188, 98, 24, 90);
      c.closePath();
    };
    // a curve between the waterline (s = 0) and the gunwale (s = 1)
    const along = (c, sv, dy) => {
      const L = (a, b) => a + (b - a) * sv;
      c.moveTo(11, L(56, 90) + (dy || 0));
      c.quadraticCurveTo(179, L(18, 98) + (dy || 0), 370, L(48, 88) + (dy || 0));
    };
    ctx.beginPath();
    hull(ctx);
    paint(ctx, wood, 0);
    ctx.save();
    ctx.beginPath();
    hull(ctx);
    ctx.clip();
    // the green-painted bottom above the waterline, a white boot stripe, plank seams below
    ctx.beginPath();
    along(ctx, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = "#2f7a4a";
    ctx.fill();
    ctx.beginPath();
    along(ctx, 0, 2);
    ink(ctx, 8);
    ctx.stroke();
    ink(ctx, 4, C.white);
    ctx.stroke();
    ctx.beginPath();
    [0.3, 0.52, 0.74].forEach((sv) => along(ctx, sv));
    ink(ctx, 1.8, "#8a5a2e");
    ctx.stroke();
    ctx.beginPath();
    [0.15, 0.35].forEach((sv) => {
      const y0 = 56 - 30 * sv;
      ctx.moveTo(11, y0);
      ctx.quadraticCurveTo(179, 18 - 30 * sv, 370, 48 - 30 * sv);
    });
    ink(ctx, 1.4, "#24603a");
    ctx.stroke();
    dots(ctx, 0, 62, w, 36, 0.18);
    dots(ctx, 215, 0, w - 215, 60, 0.18);
    ctx.restore();
    ctx.beginPath();
    hull(ctx);
    paint(ctx, null, LW);
    // the gunwale rail along the bottom edge, the keel strip on top, the transom
    ctx.beginPath();
    ctx.moveTo(24, 88);
    ctx.quadraticCurveTo(188, 96, 359, 86);
    ink(ctx, 9);
    ctx.stroke();
    ink(ctx, 5, "#6b4a2a");
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(29, 34);
    ctx.quadraticCurveTo(179, -4, 331, 32);
    ink(ctx, 2.4, "#7fc48a");
    ctx.stroke();
    rect(ctx, 16, 38, 10, 54, "#6b4a2a", 2.5);
    // sawhorse tops and near legs
    [94, 280].forEach((cx) => {
      rect(ctx, cx - 33, 90, 66, 8, leg, 2.5);
      tube(ctx, [[cx - 24, 98], [cx - 34, 126]], leg, 5);
      tube(ctx, [[cx + 24, 98], [cx + 34, 126]], leg, 5);
      tube(ctx, [[cx - 29, 114], [cx + 29, 114]], leg, 3);
    });
    // two oars leaning on the hull, blades on the floor
    [[[128, 124], [170, 14]], [[230, 124], [208, 12]]].forEach(([a, b]) => {
      tube(ctx, [a, b], "#e0bd85", 4);
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      oval(ctx, a[0] + Math.cos(ang) * 14, a[1] + Math.sin(ang) * 14, 16, 6, "#e0bd85", 2.5, ang);
      line(ctx, [[b[0] - Math.cos(ang) * 10, b[1] - Math.sin(ang) * 10], b], C.tire, 5);
    });
    glint(ctx, [[79, 26], [158, 12]], 2.5, 0.45);
  });

  /* ======================= Ridge Lumber ======================= */

  /* The band saw: a tall gray C frame (the column on the left, the open throat in the middle) with
     round wheel housings above and below, a long bright blade with teeth running down through the
     table on the right, a board on the table half cut, a red stop button, sawdust around its feet. */
  art("bandSaw", 112, (ctx, w, h) => {
    shadow(ctx, 56, 52, h);
    const gray = "#8a9199";
    const grayD = "#6b727a";
    // the stand, the column (the back of the C), the lower wheel housing with its stop button
    rect(ctx, 28, 96, 54, 22, grayD, LW);
    rect(ctx, 22, 116, 66, 7, "#3a3d44", 2.5);
    rect(ctx, 14, 26, 22, 50, gray, LW);
    rrect(ctx, 10, 72, 82, 28, 13, gray, LW);
    rrect(ctx, 18, 77, 42, 17, 8, null, 1.6);
    circle(ctx, 76, 86, 5, "#e0302a", 2);
    glint(ctx, [[16, 84], [20, 78]], 2.2, 0.6);
    // the upper wheel housing, the wheel showing through its window
    rrect(ctx, 10, 2, 84, 32, 15, gray, LW);
    circle(ctx, 50, 18, 12, "#3a3d44", 2.5);
    circle(ctx, 50, 18, 8.5, null, 1.5);
    circle(ctx, 50, 18, 3, C.chrome, 1.5);
    line(ctx, [[50, 7], [50, 10.5]], C.chrome, 1.5);
    glint(ctx, [[18, 14], [24, 7]], 2.4, 0.7);
    shadeIn(ctx, (c) => {
      c.rect(26, 30, 10, 46);
      c.rect(10, 88, 82, 12);
    }, 0.25, 10, 30, 82, 70);
    // the guide post and the yellow guard behind the blade
    rect(ctx, 85, 32, 5, 14, "#3a3d44", 1.6);
    rect(ctx, 72, 38, 18, 8, C.yellow, 2.2);
    // the table with a hazard edge, the board on it
    rect(ctx, 30, 60, 80, 9, "#4b5057", LW);
    ctx.save();
    ctx.beginPath();
    ctx.rect(30, 65, 80, 4);
    ctx.clip();
    ctx.fillStyle = C.yellow;
    ctx.fillRect(30, 65, 80, 4);
    ctx.beginPath();
    for (let x = 26; x < 112; x += 7) {
      ctx.moveTo(x, 70);
      ctx.lineTo(x + 5, 64);
    }
    ink(ctx, 2.6);
    ctx.stroke();
    ctx.restore();
    rect(ctx, 30, 60, 80, 9, null, LW);
    rect(ctx, 50, 53, 54, 7, "#e3c48a", 2.5);
    line(ctx, [[82, 56.5], [102, 56.5]], "#8a6a3a", 1.6);
    // the blade: a bright steel band, teeth on its front edge, from the upper housing down into the lower one
    const top = 33;
    const bot = 74;
    ctx.beginPath();
    ctx.moveTo(77, top);
    for (let y = top; y < bot; y += 3) {
      ctx.lineTo(73.5, y + 1.2);
      ctx.lineTo(77, y + 3);
    }
    ctx.lineTo(82, bot);
    ctx.lineTo(82, top);
    ctx.closePath();
    paint(ctx, "#eef2f5", 1.4);
    line(ctx, [[79.5, top + 2], [79.5, bot - 2]], C.white, 1.4);
    line(ctx, [[81, top + 1], [81, bot - 1]], "#a9aeb4", 1);
    // sawdust flying off the cut, and heaped around the feet
    const r = rng(41);
    ctx.beginPath();
    for (let i = 0; i < 9; i++) {
      const x = 64 + r() * 9;
      const y = 46 + r() * 8;
      ctx.moveTo(x + 1, y);
      ctx.arc(x, y, 1, 0, TAU);
    }
    ctx.fillStyle = "#e8c98a";
    ctx.fill();
    blob(ctx, [[0, 128], [6, 116], [18, 110], [30, 114], [44, 118], [60, 112], [76, 116], [90, 110], [102, 114], [112, 120], [112, 128]], "#f0d79a", 2.5);
    ctx.beginPath();
    for (let i = 0; i < 40; i++) {
      const x = 4 + r() * 104;
      const y = 116 + r() * 10;
      ctx.moveTo(x + 0.9, y);
      ctx.arc(x, y, 0.9, 0, TAU);
    }
    ctx.fillStyle = "#b8955a";
    ctx.fill();
  });

  /* The log pile: a wide pyramid of fresh logs, pale cut ends with rings and dark bark, orange paint
     marks, a chain across the front. */
  footArt("logPile", 3, 0.9, (ctx, w, h) => {
    shadow(ctx, w / 2, w / 2 - 4, h);
    const r = rng(23);
    const rows = [[6, 101], [5, 62.5], [4, 24]];
    const R = 22.5;
    rows.forEach(([n, y]) => {
      const x0 = w / 2 - ((n - 1) * 2 * R) / 2;
      for (let i = 0; i < n; i++) {
        const rr = R * (0.93 + r() * 0.07);
        const x = x0 + i * 2 * R + (r() - 0.5) * 2;
        circle(ctx, x, y, rr, "#5a3a22", LW);
        circle(ctx, x, y, rr - 4.5, "#ecd29a", 2);
        ctx.beginPath();
        ctx.arc(x + 1, y + 1, rr * 0.55, 0, TAU);
        ctx.moveTo(x + 1 + rr * 0.3, y + 1);
        ctx.arc(x + 1, y + 1, rr * 0.3, 0, TAU);
        ink(ctx, 1.2, "#c9a464");
        ctx.stroke();
        circle(ctx, x + 1, y + 1, 1.6, "#a8834a", 0);
        if (r() < 0.45) {
          const a = r() * TAU;
          line(ctx, [[x + 1, y + 1], [x + Math.cos(a) * (rr - 6), y + Math.sin(a) * (rr - 6)]], "#8a6a3a", 1.2);
        }
        if (r() < 0.3) circle(ctx, x - rr * 0.3, y - rr * 0.25, 4, C.orange, 0);
        shadeIn(ctx, (c) => c.arc(x, y, rr, 0.2, 2.2), 0.22, x - rr, y - rr, rr * 2, rr * 2);
      }
    });
    // the chain over the pile, a hook at each end
    const path = [[12, 118], [w / 2, 4], [w - 12, 118]];
    const pts = [];
    for (let s = 0; s < 2; s++) {
      const [a, b] = [path[s], path[s + 1]];
      const n = 20;
      for (let k = 0; k < n; k++) pts.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
    }
    pts.push(path[2]);
    pts.forEach(([x, y], k) => {
      const nx = pts[Math.min(pts.length - 1, k + 1)];
      const ang = Math.atan2(nx[1] - y, nx[0] - x);
      if (k % 2) oval(ctx, x, y, 4.2, 1.6, INK, 0, ang);
      else oval(ctx, x, y, 4.8, 3.2, C.chrome, 1.6, ang);
    });
    [path[0], path[2]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y + 2, 5, -0.4, Math.PI + 0.6);
      ink(ctx, 4.5);
      ctx.stroke();
      ink(ctx, 2.2, C.chrome);
      ctx.stroke();
    });
  });

  /* The wooden bear: a chainsaw-carved bear standing on a stump, holding a plank sign with a word. */
  art("woodBear", 112, (ctx, w, h, o) => {
    shadow(ctx, 56, 44, h);
    const wood = "#b57a3c";
    const woodD = "#8a5a2a";
    const r = rng(77);
    const jag = (cx, cy, rx, ry, n) => {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        const k = i % 2 ? 0.92 + r() * 0.04 : 1;
        pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
      }
      return pts;
    };
    // the stump
    can(ctx, 56, 108, 32, 6, 13, "#6b4a2a", "#e3c48a", LW);
    ctx.beginPath();
    ctx.ellipse(56, 108, 20, 3.6, 0, 0, TAU);
    ctx.moveTo(66, 108);
    ctx.ellipse(56, 108, 10, 1.8, 0, 0, TAU);
    ink(ctx, 1.2, "#a8834a");
    ctx.stroke();
    // legs, body, ears, head, snout
    poly(ctx, jag(40, 96, 13, 14, 14), wood, LW);
    poly(ctx, jag(72, 96, 13, 14, 14), wood, LW);
    poly(ctx, jag(56, 70, 28, 34, 22), wood, LW);
    poly(ctx, jag(56, 80, 15, 20, 14), "#d29a5a", 2);
    poly(ctx, jag(40, 12, 7, 7, 8), wood, 2.5);
    poly(ctx, jag(72, 12, 7, 7, 8), wood, 2.5);
    poly(ctx, jag(56, 26, 19, 17, 16), wood, LW);
    poly(ctx, jag(56, 33, 9, 7, 10), "#d29a5a", 2.5);
    oval(ctx, 56, 29.5, 4.2, 3, INK, 0);
    line(ctx, [[56, 33], [56, 36], [52, 38]], INK, 1.4);
    line(ctx, [[56, 36], [60, 38]], INK, 1.4);
    circle(ctx, 48.5, 22, 2.4, INK, 0);
    circle(ctx, 63.5, 22, 2.4, INK, 0);
    // chisel cuts
    ctx.beginPath();
    for (let i = 0; i < 26; i++) {
      const x = 32 + r() * 48;
      const y = 44 + r() * 58;
      ctx.moveTo(x, y);
      ctx.lineTo(x + 3 + r() * 3, y + 2 + r() * 3);
    }
    ink(ctx, 1.3, woodD);
    ctx.stroke();
    // the sign, held by two paws
    rect(ctx, 6, 52, 100, 30, "#e8c98a", LW);
    line(ctx, [[10, 60], [32, 60]], "#c9a464", 1.2);
    line(ctx, [[78, 75], [102, 75]], "#c9a464", 1.2);
    words(ctx, o.label || "RIDGE", 56, 67.5, 86, 24, "#a33a2a");
    [[24, 54], [88, 54]].forEach(([x, y]) => {
      poly(ctx, jag(x, y, 9, 7, 10), wood, 2.5);
      line(ctx, [[x - 4, y + 3], [x - 4, y + 7]], INK, 1.4);
      line(ctx, [[x, y + 3], [x, y + 7.5]], INK, 1.4);
      line(ctx, [[x + 4, y + 3], [x + 4, y + 7]], INK, 1.4);
    });
    shadeIn(ctx, (c) => c.rect(66, 0, 46, 108), 0.18, 66, 0, 46, 108);
  });

  /* The flatbed truck: an old truck seen from its front corner, faded cab paint (opts.color) with
     rust spots, round headlights and a grill in front, a load of planks strapped down on the bed. */
  footArt("flatbed", 3, 0.98, (ctx, w, h, o) => {
    shadow(ctx, 134, 130, h);
    const cab = mix(hue(o, "#a33a2a"), "#b0a898", 0.22);
    const cabD = shade(cab, -30);
    const S = side(118, 262, 32, 40, 100, 97);
    wheel(ctx, S(0.08, 1)[0], 111, 15);
    wheel(ctx, S(0.66, 1)[0], 111, 15);
    wheel(ctx, S(0.86, 1)[0], 111, 15);
    // the bed: frame, deck, the plank stack with straps
    quad(ctx, S, 0.28, 0.62, 1, 0.84, "#4b4038", LW);
    quad(ctx, S, 0.28, 0.62, 1, 0.68, "#6b4a3a", 2);
    const P = side(S(0.3, 0)[0], S(0.98, 0)[0], 26, 38, S(0.3, 0.62)[1], S(0.98, 0.62)[1]);
    quad(ctx, P, 0, 0, 1, 1, "#e3c48a", LW);
    ctx.beginPath();
    for (let v = 0.12; v < 1; v += 0.12) {
      const [ax, ay] = P(0, v);
      const [bx, by] = P(1, v);
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
    }
    ink(ctx, 1.4, "#a8834a");
    ctx.stroke();
    [0.34, 0.66].forEach((v) => quad(ctx, P, 0, v - 0.03, 1, v + 0.03, "#7a5536", 1.4));
    [[0.15, 0.3], [0.62, 0.8]].forEach(([u0, u1]) => {
      const [x, y] = P((u0 + u1) / 2, 0.5);
      oval(ctx, x, y, 4, 2.4, "#d9a86a", 1);
    });
    [0.18, 0.5, 0.82].forEach((u) => {
      quad(ctx, P, u - 0.02, -0.02, u + 0.02, 1.02, C.yellow, 2);
      const [bx, by] = P(u, 0.8);
      rect(ctx, bx - 4.5, by - 3, 9, 6, C.chrome, 1.6);
    });
    shadeIn(ctx, quadPath(P, 0, 0.5, 1, 1), 0.18, 150, 40, 115, 60);
    // the cab side: door, window, a word, rust
    quad(ctx, S, 0, 0, 0.28, 0.84, cab, LW);
    quad(ctx, S, 0.04, 0.08, 0.24, 0.4, C.glass, 2.5);
    quad(ctx, S, 0.03, 0.05, 0.25, 0.8, null, 1.8);
    const [dx, dy] = S(0.14, 0.58);
    words(ctx, "RIDGE", dx, dy, 32, 10, C.cream);
    oval(ctx, S(0.21, 0.72)[0], S(0.21, 0.72)[1], 5, 3, "rgba(107,58,34,0.7)", 0);
    tube(ctx, [S(0.28, 0.3), [S(0.28, 0)[0], 4]], C.chrome, 4);
    shadeIn(ctx, quadPath(S, 0, 0, 0.28, 0.84), 0.2, 118, 30, 42, 70);
    // the front: cab face, windshield, grill, headlights, bumper, tires
    rrect(ctx, 16, 102, 22, 23, 4, C.tire, 2.5);
    rrect(ctx, 90, 102, 22, 23, 4, C.tire, 2.5);
    rrect(ctx, 10, 32, 108, 70, 6, cab, LW);
    rect(ctx, 18, 38, 44, 22, C.glass, 2.5);
    rect(ctx, 66, 38, 44, 22, C.glass, 2.5);
    glint(ctx, [[24, 56], [34, 42]], 2.4, 0.85);
    line(ctx, [[74, 40], [82, 50], [78, 58]], "rgba(255,255,255,0.9)", 1.4);
    rect(ctx, 34, 66, 60, 30, "#2a2d33", 2.5);
    ctx.beginPath();
    for (let y = 71; y < 94; y += 5) {
      ctx.moveTo(37, y);
      ctx.lineTo(91, y);
    }
    ink(ctx, 2, C.chrome);
    ctx.stroke();
    [[22, 80], [106, 80]].forEach(([x, y], i) => {
      circle(ctx, x, y, 10, C.chrome, 2.5);
      circle(ctx, x, y, 7, i ? "#cfd3c4" : "#fff2b0", 1.6);
      if (i) line(ctx, [[x - 4, y - 5], [x, y], [x - 2, y + 5]], INK, 1.2);
      else glint(ctx, [[x - 3, y - 2], [x - 1, y - 4]], 1.6, 0.9);
    });
    [[16, 92, 5], [100, 40, 4], [58, 98, 3]].forEach(([x, y, r]) => oval(ctx, x, y, r, r * 0.7, "rgba(107,58,34,0.65)", 0));
    rrect(ctx, 6, 98, 116, 10, 3, "#a9aeb4", 2.5);
    oval(ctx, 40, 103, 5, 2, "rgba(107,58,34,0.6)", 0);
    dots(ctx, 10, 60, 108, 40, 0.12);
    line(ctx, [[18, 34], [110, 34]], cabD, 2);
  });

  /* ======================= Northgate Mall ======================= */

  /* The rocking horse: a giant red toy horse on long curved runners, white mane and tail, yellow
     saddle on a blue blanket, side view. */
  footArt("rockingHorse", 3, 0.9, (ctx, w, h) => {
    shadow(ctx, 145, 140, h);
    const red = C.red;
    const redD = "#9e2a22";
    const runner = (dx, dy, color) => {
      ctx.beginPath();
      ctx.moveTo(13 + dx, 100 + dy);
      ctx.quadraticCurveTo(145 + dx, 136 + dy, 277 + dx, 100 + dy);
      ink(ctx, 12);
      ctx.stroke();
      ink(ctx, 7, color);
      ctx.stroke();
      circle(ctx, 13 + dx, 96 + dy, 6, color, 2.5);
      circle(ctx, 277 + dx, 96 + dy, 6, color, 2.5);
    };
    // far runner and far legs
    runner(7, -6, "#a8743a");
    tube(ctx, [[107, 70], [80, 104]], redD, 11);
    tube(ctx, [[199, 70], [231, 102]], redD, 11);
    // tail
    blob(ctx, [[80, 46], [62, 40], [44, 50], [30, 68], [24, 92], [36, 84], [40, 96], [50, 76], [58, 82], [70, 60]], C.white, LW);
    // near runner and near legs with hooves
    runner(0, 0, "#c98a4a");
    tube(ctx, [[96, 72], [59, 106]], red, 12);
    tube(ctx, [[188, 72], [215, 108]], red, 12);
    oval(ctx, 60, 105, 9, 5, C.tire, 2, -0.6);
    oval(ctx, 215, 107, 9, 5, C.tire, 2, 0.7);
    // body, neck, head
    oval(ctx, 146, 56, 76, 25, red, LW);
    poly(ctx, [[186, 44], [212, 10], [232, 6], [240, 24], [216, 60], [198, 70]], red, 0);
    blob(ctx, [[226, 8], [252, 10], [280, 26], [284, 40], [266, 46], [248, 44], [236, 34]], red, LW);
    poly(ctx, [[186, 44], [212, 10], [231, 7]], null, LW);
    line(ctx, [[240, 30], [216, 60], [198, 72]], INK, LW);
    poly(ctx, [[230, 10], [236, 0], [242, 9]], red, 2.5);
    // bridle and handle peg
    line(ctx, [[249, 9], [256, 42]], C.yellow, 3.5);
    line(ctx, [[268, 22], [270, 45]], C.yellow, 3.5);
    tube(ctx, [[236, 28], [252, 24]], C.black, 3);
    circle(ctx, 236, 28, 3.6, C.black, 1.5);
    circle(ctx, 246, 18, 5, C.white, 2);
    circle(ctx, 247.5, 18.5, 2.5, INK, 0);
    oval(ctx, 276, 33, 2.4, 1.6, INK, 0);
    line(ctx, [[266, 42], [283, 39]], INK, 1.6);
    // the mane
    blob(ctx, [[182, 42], [194, 24], [206, 12], [218, 2], [234, 2], [228, 10], [218, 16], [210, 28], [198, 38], [188, 48]], C.white, LW);
    line(ctx, [[198, 26], [207, 30]], "#c9c3b4", 1.6);
    line(ctx, [[212, 14], [218, 20]], "#c9c3b4", 1.6);
    // blanket, saddle, stirrup
    rrect(ctx, 118, 30, 58, 40, 5, C.navy, LW);
    ctx.beginPath();
    ctx.moveTo(124, 36);
    ctx.quadraticCurveTo(147, 48, 170, 30);
    ctx.lineTo(172, 54);
    ctx.quadraticCurveTo(147, 66, 122, 54);
    ctx.closePath();
    paint(ctx, C.yellow, LW);
    poly(ctx, [[165, 32], [173, 22], [177, 28], [170, 38]], C.yellow, 2.5);
    line(ctx, [[148, 60], [148, 86]], "#6b4a2a", 3);
    poly(ctx, [[140, 86], [156, 86], [154, 92], [142, 92]], C.chrome, 2);
    // dapples and shade
    [[92, 48], [106, 64], [190, 58], [176, 70], [80, 60]].forEach(([x, y]) => circle(ctx, x, y, 4.5, "#e45a4c", 0));
    shadeIn(ctx, (c) => c.ellipse(146, 56, 76, 25, 0, 0.2, Math.PI - 0.2), 0.2, 70, 56, 152, 30);
    glint(ctx, [[94, 40], [136, 32]], 2.6, 0.6);
  });

  /* The green dino: a play-area dinosaur with a long neck and a big friendly grin, yellow spots, a red
     ladder up its back and a yellow slide down its tail, side view. */
  footArt("playDino", 3, 0.98, (ctx, w, h) => {
    shadow(ctx, 138, 126, h);
    const green = C.green;
    const greenD = "#2f7a34";
    // far legs
    rrect(ctx, 98, 84, 24, 40, 8, greenD, LW);
    rrect(ctx, 162, 84, 24, 40, 8, greenD, LW);
    // the tail and the slide down it
    ctx.beginPath();
    ctx.moveTo(166, 48);
    ctx.quadraticCurveTo(216, 58, 262, 114);
    ctx.lineTo(262, 126);
    ctx.lineTo(236, 126);
    ctx.quadraticCurveTo(208, 104, 172, 106);
    ctx.closePath();
    paint(ctx, green, LW);
    ctx.beginPath();
    ctx.moveTo(172, 34);
    ctx.quadraticCurveTo(220, 42, 265, 108);
    ctx.lineTo(259, 120);
    ctx.quadraticCurveTo(216, 60, 172, 50);
    ctx.closePath();
    paint(ctx, C.yellow, LW);
    ctx.beginPath();
    ctx.moveTo(172, 34);
    ctx.quadraticCurveTo(220, 42, 265, 108);
    ink(ctx, 3.5, C.orange);
    ctx.stroke();
    // body and belly
    oval(ctx, 138, 74, 56, 40, green, LW);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(138, 74, 56, 40, 0, 0, TAU);
    ctx.clip();
    oval(ctx, 134, 114, 50, 22, "#9ad66a", 2.5);
    ctx.restore();
    // neck and head
    ctx.beginPath();
    ctx.moveTo(94, 60);
    ctx.quadraticCurveTo(76, 34, 56, 26);
    ctx.lineTo(46, 48);
    ctx.quadraticCurveTo(72, 58, 90, 96);
    ctx.closePath();
    paint(ctx, green, LW);
    oval(ctx, 40, 30, 36, 24, green, LW);
    // spikes along the back
    [[62, 9], [80, 22], [98, 34], [117, 34], [136, 33], [155, 34]].forEach(([x, y], i) => {
      const a = i < 2 ? -0.5 : 0;
      poly(ctx, [[x - 7, y + 6], [x + Math.sin(a) * 4, y - 9], [x + 7, y + 4]], C.orange, 2.5);
    });
    oval(ctx, 40, 30, 36, 24, null, LW);
    // the grin with big teeth
    ctx.beginPath();
    ctx.moveTo(8, 34);
    ctx.quadraticCurveTo(32, 54, 64, 38);
    ctx.quadraticCurveTo(36, 46, 8, 34);
    ctx.closePath();
    paint(ctx, "#7a1a1a", 2.5);
    [[16, 37], [25, 40], [34, 42], [43, 42], [52, 41]].forEach(([x, y]) => rect(ctx, x - 3.2, y - 3, 6.4, 6.5, C.white, 1.4));
    oval(ctx, 33, 48, 8, 3, "#f08ca0", 0);
    line(ctx, [[6, 33], [10, 35]], INK, 2.5);
    circle(ctx, 50, 18, 9, C.white, 2.5);
    circle(ctx, 48, 19, 4.5, INK, 0);
    circle(ctx, 46.5, 17.5, 1.5, C.white, 0);
    line(ctx, [[40, 7], [58, 8]], INK, 2.5);
    oval(ctx, 13, 24, 3, 2, INK, 0);
    // spots
    [[116, 58, 8], [142, 50, 6.5], [160, 72, 7], [128, 84, 5.5], [102, 76, 5], [80, 48, 4.5], [64, 38, 4], [186, 66, 5.5], [214, 84, 4.5]].forEach(([x, y, r]) =>
      circle(ctx, x, y, r, "#c8e65a", 1.6)
    );
    // near legs with toenails
    rrect(ctx, 80, 92, 28, 34, 8, green, LW);
    rrect(ctx, 152, 92, 28, 34, 8, green, LW);
    [84, 91.5, 99, 156, 163.5, 171].forEach((x) => oval(ctx, x + 2, 122, 3, 2.5, C.white, 1.4));
    // the ladder up its back, a rail at the top of the slide
    [182, 195].forEach((x) => tube(ctx, [[x, 126], [x - 8, 30]], C.red, 3.5));
    ctx.beginPath();
    for (let y = 40; y < 124; y += 11) {
      const t = (126 - y) / 96;
      ctx.moveTo(182 - 8 * t, y);
      ctx.lineTo(195 - 8 * t, y);
    }
    ink(ctx, 5);
    ctx.stroke();
    ink(ctx, 2.5, C.red);
    ctx.stroke();
    shadeIn(ctx, (c) => c.ellipse(138, 74, 56, 40, 0, 0.3, Math.PI - 0.3), 0.18, 82, 74, 112, 40);
    glint(ctx, [[20, 14], [34, 8]], 2.4, 0.7);
  });

  /* The plastic people: three white store mannequins with blank faces, in a red coat, a mustard
     trench and a teal parka with hats, the one on the right pointing. */
  art("mannequins", 134, (ctx, w, h) => {
    shadow(ctx, 67, 62, h);
    const skin = "#f1ede4";
    const figure = (cx, top, coat, hat, point) => {
      oval(ctx, cx, 123, 15, 3.5, "#2a2d33", 2);
      tube(ctx, [[cx, 122], [cx, 108]], C.chrome, 2);
      rrect(ctx, cx - 10, top + 62, 8, 46, 3, skin, 2.5);
      rrect(ctx, cx + 2, top + 62, 8, 46, 3, skin, 2.5);
      // sleeves (one raised when pointing), the coat, the neck and the head
      rrect(ctx, cx - 22, top + 18, 9, 40, 4, coat, 2.5);
      oval(ctx, cx - 17.5, top + 60, 4, 4.5, skin, 2);
      if (point) {
        tube(ctx, [[cx + 12, top + 20], [cx + 22, top - 6]], coat, 8);
        oval(ctx, cx + 23.5, top - 9, 4, 4.5, skin, 2);
        tube(ctx, [[cx + 24.5, top - 12], [cx + 26, top - 18]], skin, 2);
      } else {
        rrect(ctx, cx + 13, top + 18, 9, 40, 4, coat, 2.5);
        oval(ctx, cx + 17.5, top + 60, 4, 4.5, skin, 2);
      }
      poly(ctx, [[cx - 14, top + 16], [cx + 14, top + 16], [cx + 18, top + 70], [cx - 18, top + 70]], coat, LW);
      line(ctx, [[cx, top + 18], [cx, top + 70]], INK, 1.6);
      [top + 30, top + 42, top + 54].forEach((y) => circle(ctx, cx + 4, y, 1.6, INK, 0));
      poly(ctx, [[cx - 6, top + 16], [cx, top + 26], [cx + 6, top + 16]], shade(coat, -35), 1.6);
      shadeIn(ctx, (c) => c.rect(cx + 4, top + 16, 16, 56), 0.2, cx + 4, top + 16, 16, 56);
      rect(ctx, cx - 3, top + 8, 6, 9, skin, 2);
      oval(ctx, cx, top, 9, 11, skin, LW);
      glint(ctx, [[cx - 5, top - 3], [cx - 3, top - 7]], 1.8, 0.9);
      hat(cx, top);
    };
    figure(24, 30, "#c0392b", (cx, top) => {
      oval(ctx, cx, top - 8, 15, 3.6, "#2a2d33", 2.5);
      rrect(ctx, cx - 9, top - 21, 18, 14, 4, "#2a2d33", 2.5);
      rect(ctx, cx - 9, top - 12, 18, 3.5, C.red, 0);
    });
    figure(66, 24, "#d9a21b", (cx, top) => {
      oval(ctx, cx, top - 8, 19, 4.5, "#e6dfcc", 2.5);
      ctx.beginPath();
      ctx.arc(cx, top - 8, 10, Math.PI, TAU);
      ctx.closePath();
      paint(ctx, "#e6dfcc", 2.5);
      rect(ctx, cx - 10, top - 12, 20, 3.5, "#6b3a1e", 0);
    });
    rect(ctx, 48, 74, 36, 5, "#6b3a1e", 1.6);
    figure(106, 30, "#2f8fa8", (cx, top) => {
      ctx.beginPath();
      ctx.arc(cx, top - 3, 10, Math.PI, TAU);
      ctx.closePath();
      paint(ctx, C.red, 2.5);
      rect(ctx, cx - 10.5, top - 5, 21, 5, "#a3271f", 2);
      circle(ctx, cx, top - 15, 4.5, C.white, 2);
    }, true);
  });

  /* The orange tent: a camping dome tent (opts.color) pitched on a patch of bright fake grass, its door
     flap tied open, a glowing lantern on one side and a cooler on the other. */
  footArt("tent", 3, 0.9, (ctx, w, h, o) => {
    shadow(ctx, 145, 142, h);
    const cloth = hue(o, C.orange);
    const clothD = shade(cloth, -45);
    // the fake grass patch
    rrect(ctx, 4, 108, 282, 18, 6, "#4fb33a", LW);
    ctx.beginPath();
    for (let x = 10; x < 280; x += 7) {
      ctx.moveTo(x, 112);
      ctx.lineTo(x + 2, 106);
      ctx.lineTo(x + 4, 112);
    }
    ctx.fillStyle = "#6fd04f";
    ctx.fill();
    ink(ctx, 1.4, "#2f7a2a");
    ctx.stroke();
    // guy lines and stakes
    [[[80, 64], [40, 116]], [[210, 64], [250, 116]]].forEach(([a, b]) => {
      line(ctx, [a, b], C.white, 1.6);
      line(ctx, [[b[0], b[1] - 4], [b[0], b[1] + 4]], C.steelD, 3);
    });
    // the dome, its poles, the door with the flap tied back
    const dome = (c) => {
      c.moveTo(55, 118);
      c.ellipse(145, 118, 90, 100, 0, Math.PI, TAU);
      c.closePath();
    };
    ctx.beginPath();
    dome(ctx);
    paint(ctx, cloth, LW);
    ctx.save();
    ctx.beginPath();
    dome(ctx);
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(145, 118, 48, 100, 0, Math.PI, TAU);
    ctx.moveTo(235, 118);
    ctx.ellipse(145, 118, 90, 52, 0, 0, Math.PI, true);
    ink(ctx, 2.6, clothD);
    ctx.stroke();
    dots(ctx, 166, 18, 80, 100, 0.2);
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(115, 118);
    ctx.quadraticCurveTo(118, 58, 145, 52);
    ctx.quadraticCurveTo(172, 58, 175, 118);
    ctx.closePath();
    paint(ctx, "#2a2016", 2.5);
    rrect(ctx, 121, 94, 46, 16, 6, "#2f5f9e", 2.2);
    line(ctx, [[130, 98], [130, 108]], "#24497a", 1.4);
    poly(ctx, [[145, 52], [172, 58], [183, 80], [178, 118], [167, 118], [169, 90]], shade(cloth, 20), 2.5);
    line(ctx, [[172, 86], [186, 84]], C.yellow, 2.5);
    ctx.beginPath();
    dome(ctx);
    paint(ctx, null, LW);
    glint(ctx, [[82, 70], [110, 32]], 2.6, 0.5);
    // the cooler
    rrect(ctx, 8, 86, 42, 26, 3, "#2f8fd0", LW);
    rrect(ctx, 6, 80, 46, 9, 3, C.white, 2.5);
    rect(ctx, 22, 92, 14, 4, C.white, 1.4);
    // the lantern, lit
    glow(ctx, 266, 82, 30, "255,220,110");
    rect(ctx, 254, 104, 24, 8, "#2f6a3a", 2.5);
    rrect(ctx, 256, 74, 20, 30, 5, "#ffe27a", 2.5);
    line(ctx, [[261, 76], [261, 102]], "#2f6a3a", 1.6);
    line(ctx, [[271, 76], [271, 102]], "#2f6a3a", 1.6);
    rect(ctx, 253, 66, 26, 8, "#2f6a3a", 2.5);
    ctx.beginPath();
    ctx.arc(266, 66, 9, Math.PI, TAU);
    ink(ctx, 2.2);
    ctx.stroke();
  });

  /* ======================= Public Library ======================= */

  /* The giant globe: blue seas and green lands, tilted on its axis in a brass ring, on a turned wooden
     stand with three legs. */
  art("globe", 112, (ctx, w, h) => {
    shadow(ctx, 56, 44, h);
    const wood = C.wood;
    const tilt = -0.41;
    const cx = 56, cy = 46, R = 38;
    // the stand
    tube(ctx, [[56, 104], [18, 124]], wood, 5);
    tube(ctx, [[56, 104], [94, 124]], wood, 5);
    tube(ctx, [[56, 104], [56, 125]], shade(wood, -20), 5);
    rrect(ctx, 50, 86, 12, 22, 4, wood, 2.5);
    oval(ctx, 56, 96, 9, 4, shade(wood, 15), 2.2);
    // the globe: sea, lands, lines, shade, shine
    circle(ctx, cx, cy, R, "#2f7fd0", 0);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    const land = "#6abf4b";
    blob(ctx, [[-31, -22], [-15, -31], [-3, -26], [-9, -15], [-18, -9], [-13, -1], [-22, -4], [-32, -12]], land, 2);
    blob(ctx, [[-14, 2], [-3, 4], [1, 13], [-6, 25], [-11, 34], [-15, 21], [-19, 8]], land, 2);
    blob(ctx, [[8, -25], [19, -27], [23, -18], [14, -12], [22, -6], [25, 7], [18, 21], [12, 27], [8, 14], [3, 2], [6, -10], [3, -18]], land, 2);
    blob(ctx, [[24, -30], [38, -24], [40, -10], [30, -12], [24, -19]], land, 2);
    blob(ctx, [[14, -2], [20, -1], [18, 9], [13, 7]], "#d9b36a", 0);
    ctx.beginPath();
    [-24, -12, 0, 12, 24].forEach((y) => {
      const rx = Math.sqrt(R * R - y * y);
      ctx.moveTo(rx, y);
      ctx.ellipse(0, y, rx, rx * 0.12, 0, 0, TAU);
    });
    [14, 28].forEach((rx) => {
      ctx.moveTo(rx, 0);
      ctx.ellipse(0, 0, rx, R, 0, 0, TAU);
    });
    ink(ctx, 1, "rgba(255,255,255,0.35)");
    ctx.stroke();
    ctx.restore();
    shadeIn(ctx, (c) => c.arc(cx + 10, cy + 10, R, 0, TAU), 0.3, cx - R, cy - R, 2 * R, 2 * R);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(cx + 14, cy + 14, R + 2, 0, TAU);
    ctx.arc(cx, cy, R + 4, 0, TAU, true);
    ctx.fillStyle = "rgba(15,16,18,0.18)";
    ctx.fill("evenodd");
    ctx.restore();
    circle(ctx, cx, cy, R, null, LW);
    ctx.beginPath();
    ctx.arc(cx, cy, R - 7, 3.5, 4.4);
    ink(ctx, 3, "rgba(255,255,255,0.7)");
    ctx.stroke();
    // the brass ring and the axis pins
    ctx.beginPath();
    ctx.arc(cx, cy, R + 5, 0, TAU);
    ink(ctx, 7.5);
    ctx.stroke();
    ink(ctx, 4, "#d9b032");
    ctx.stroke();
    [-1, 1].forEach((s) => {
      const x = cx - Math.sin(tilt) * (R + 5) * s;
      const y = cy - Math.cos(tilt) * (R + 5) * s;
      circle(ctx, x, y, 3.6, "#d9b032", 2);
    });
  });

  /* The tall clock: a grandfather clock in dark wood, a cream dial with stopped hands, a moon arch,
     a brass pendulum and weights behind the glass. */
  art("grandClock", 64, (ctx, w, h) => {
    shadow(ctx, 32, 30, h);
    const wood = "#5a3420";
    const woodL = "#7a4a2c";
    const brass = "#e0b030";
    rect(ctx, 6, 112, 52, 14, wood, LW);
    rect(ctx, 10, 115, 44, 8, null, 1.4);
    rect(ctx, 12, 54, 40, 58, wood, LW);
    rrect(ctx, 19, 60, 26, 46, 3, "#2a1a10", 2.5);
    // weights, rod and pendulum behind the glass
    line(ctx, [[25, 61], [25, 70]], brass, 1);
    line(ctx, [[39, 61], [39, 76]], brass, 1);
    rect(ctx, 22.5, 70, 5, 14, brass, 1.4);
    rect(ctx, 36.5, 76, 5, 14, brass, 1.4);
    line(ctx, [[32, 60], [32, 92]], brass, 1.6);
    circle(ctx, 32, 95, 7.5, brass, 2);
    circle(ctx, 32, 95, 4, "#f2d37a", 0);
    glint(ctx, [[22, 64], [22, 102]], 1.6, 0.35);
    // the hood: arched top, finials, the dial
    rect(ctx, 8, 50, 48, 6, woodL, 2.5);
    ctx.beginPath();
    ctx.moveTo(8, 50);
    ctx.lineTo(8, 16);
    ctx.quadraticCurveTo(32, 2, 56, 16);
    ctx.lineTo(56, 50);
    ctx.closePath();
    paint(ctx, wood, LW);
    circle(ctx, 32, 6, 3.6, brass, 1.8);
    circle(ctx, 10, 13, 2.6, brass, 1.5);
    circle(ctx, 54, 13, 2.6, brass, 1.5);
    ctx.beginPath();
    ctx.moveTo(20, 21);
    ctx.quadraticCurveTo(32, 12, 44, 21);
    ctx.closePath();
    paint(ctx, "#2f5f9e", 1.6);
    circle(ctx, 34, 18, 2.6, C.cream, 0);
    circle(ctx, 32, 33, 15, brass, 2.5);
    circle(ctx, 32, 33, 12.5, C.cream, 1.6);
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = (i * TAU) / 12;
      const r0 = i % 3 ? 10 : 8.6;
      ctx.moveTo(32 + Math.cos(a) * r0, 33 + Math.sin(a) * r0);
      ctx.lineTo(32 + Math.cos(a) * 11.6, 33 + Math.sin(a) * 11.6);
    }
    ink(ctx, 1.2);
    ctx.stroke();
    line(ctx, [[32, 33], [26.5, 28]], INK, 2.2);
    line(ctx, [[32, 33], [36, 23.5]], INK, 1.5);
    circle(ctx, 32, 33, 1.5, INK, 0);
    line(ctx, [[23, 41], [29, 36], [27, 32]], "rgba(15,16,18,0.55)", 0.8);
    shadeIn(ctx, (c) => {
      c.rect(46, 0, 18, 128);
    }, 0.28, 46, 0, 18, 128);
  }, 2);

  /* The toy castle: a cardboard castle with two towers (a red cone roof on one), a gatehouse, flags,
     a drawbridge half down on two chains, crayon bricks and doodles, tape on the seams. */
  footArt("kidsCastle", 3, 0.98, (ctx, w, h) => {
    shadow(ctx, 133, 130, h);
    const card = "#c99a5a";
    const cardD = "#b4844a";
    const crenels = (x0, x1, y, wid, gap, fill) => {
      for (let x = x0; x + wid <= x1 + 0.5; x += wid + gap) rect(ctx, x, y, wid, 11, fill, 2.5);
    };
    // the wall with its crenels
    crenels(58, 208, 41, 12, 9, card);
    rect(ctx, 50, 50, 166, 74, card, LW);
    // the gatehouse
    crenels(100, 164, 22, 11, 6.6, cardD);
    rect(ctx, 100, 32, 64, 92, cardD, LW);
    // towers: left with a red cone roof, right with crenels and a flag
    rect(ctx, 8, 44, 46, 80, card, LW);
    poly(ctx, [[2, 46], [60, 46], [31, 8]], C.red, LW);
    line(ctx, [[31, 8], [31, 0.5]], INK, 2);
    poly(ctx, [[31, 1], [44, 4], [31, 8]], C.yellow, 1.6);
    crenels(212, 258, 30, 10, 8, card);
    rect(ctx, 212, 40, 46, 84, card, LW);
    tube(ctx, [[235, 30], [235, 2]], C.wood, 2);
    poly(ctx, [[236, 3], [256, 9], [236, 16]], "#3fae4a", 2);
    tube(ctx, [[132, 22], [132, 2]], C.wood, 2);
    poly(ctx, [[133, 3], [150, 9], [133, 15]], C.navy, 2);
    // marker windows and crayon bricks
    [[31, 70], [235, 64], [235, 92]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.moveTo(x - 7, y + 12);
      ctx.lineTo(x - 7, y);
      ctx.arc(x, y, 7, Math.PI, TAU);
      ctx.lineTo(x + 7, y + 12);
      ctx.closePath();
      paint(ctx, "#3a2a1a", 2);
    });
    const r = rng(9);
    ctx.beginPath();
    for (let i = 0; i < 24; i++) {
      const x = 12 + r() * 236;
      const y = 56 + r() * 60;
      if (x > 96 && x < 166) continue;
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10, y);
      ctx.moveTo(x + 5, y);
      ctx.lineTo(x + 5, y + 6);
    }
    ink(ctx, 1.6, "#8a4a2a");
    ctx.stroke();
    // doodles: a heart and a sun in crayon
    ctx.beginPath();
    ctx.moveTo(76, 82);
    ctx.bezierCurveTo(62, 70, 70, 60, 76, 68);
    ctx.bezierCurveTo(82, 60, 90, 70, 76, 82);
    paint(ctx, "#e0503f", 1.4);
    circle(ctx, 189, 72, 7, C.yellow, 1.4);
    rays(ctx, 189, 72, 9, 14, 8, "#d9a21b");
    // the door, the drawbridge half down on its chains
    ctx.beginPath();
    ctx.moveTo(110, 124);
    ctx.lineTo(110, 90);
    ctx.arc(132, 90, 22, Math.PI, TAU);
    ctx.lineTo(154, 124);
    ctx.closePath();
    paint(ctx, "#3a2a1a", LW);
    poly(ctx, [[106, 100], [158, 100], [164, 126], [100, 126]], "#a8743a", LW);
    ctx.beginPath();
    for (let x = 112; x < 156; x += 8) {
      ctx.moveTo(x - 1, 101);
      ctx.lineTo(x - 3, 125);
    }
    ink(ctx, 1.4, "#6b4a2a");
    ctx.stroke();
    ctx.setLineDash([3, 2]);
    line(ctx, [[108, 102], [102, 64]], INK, 2);
    line(ctx, [[156, 102], [162, 64]], INK, 2);
    ctx.setLineDash([]);
    // tape on the seams, corrugation on the top edges
    [[52, 52, 0.6], [214, 50, -0.6], [100, 36, -0.5], [164, 36, 0.5]].forEach(([x, y, a]) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      rect(ctx, -9, -3.5, 18, 7, "rgba(240,232,200,0.8)", 0);
      ctx.restore();
    });
    ctx.beginPath();
    for (let x = 10; x < 52; x += 4) {
      ctx.moveTo(x, 47);
      ctx.lineTo(x, 50);
    }
    for (let x = 214; x < 256; x += 4) {
      ctx.moveTo(x, 43);
      ctx.lineTo(x, 46);
    }
    ink(ctx, 1, "#8a6a3a");
    ctx.stroke();
    shadeIn(ctx, (c) => {
      c.rect(40, 44, 14, 80);
      c.rect(244, 40, 14, 84);
      c.rect(150, 32, 14, 66);
    }, 0.22, 0, 30, w, 98);
  });

  /* The owl statue: a bronze owl with big round yellow eyes and ear tufts, green patina, sitting on a
     stack of three stone books. */
  art("owlStatue", 104, (ctx, w, h) => {
    shadow(ctx, 52, 46, h);
    const stone = "#9a968c";
    const pages = "#d8d2c2";
    // the books
    [[12, 104, 80, 20], [20, 90, 66, 15], [14, 76, 72, 15]].forEach(([x, y, bw, bh]) => {
      rect(ctx, x, y, bw, bh, stone, LW);
      rect(ctx, x + 6, y + 3, bw - 6, bh - 6, pages, 1.6);
      ctx.beginPath();
      for (let yy = y + 5.5; yy < y + bh - 3; yy += 2.5) {
        ctx.moveTo(x + 7, yy);
        ctx.lineTo(x + bw - 1, yy);
      }
      ink(ctx, 0.8, "#a9a396");
      ctx.stroke();
      line(ctx, [[x + 3, y + 2], [x + 3, y + bh - 2]], "#6b675f", 1.4);
    });
    // the owl: body, wings, ear tufts, face discs, eyes, beak, feet
    const bronze = "#a8702e";
    const bronzeD = "#7a4f1e";
    poly(ctx, [[24, 18], [30, 2], [40, 14]], bronze, 2.5);
    poly(ctx, [[80, 18], [74, 2], [64, 14]], bronze, 2.5);
    oval(ctx, 52, 46, 31, 33, bronze, LW);
    ctx.beginPath();
    ctx.moveTo(22, 42);
    ctx.quadraticCurveTo(18, 66, 34, 78);
    ctx.lineTo(30, 52);
    ctx.closePath();
    paint(ctx, bronzeD, 2.5);
    ctx.beginPath();
    ctx.moveTo(82, 42);
    ctx.quadraticCurveTo(86, 66, 70, 78);
    ctx.lineTo(74, 52);
    ctx.closePath();
    paint(ctx, bronzeD, 2.5);
    ctx.beginPath();
    for (let row = 0; row < 3; row++) {
      for (let k = -1; k <= 1; k++) {
        const x = 52 + k * 9 + (row % 2) * 4.5 - 2;
        const y = 52 + row * 7;
        ctx.moveTo(x - 3.5, y);
        ctx.lineTo(x, y + 3.5);
        ctx.lineTo(x + 3.5, y);
      }
    }
    ink(ctx, 1.5, bronzeD);
    ctx.stroke();
    circle(ctx, 40, 32, 14, "#c08a44", 2.5);
    circle(ctx, 64, 32, 14, "#c08a44", 2.5);
    circle(ctx, 40, 32, 10, C.yellow, 2.5);
    circle(ctx, 64, 32, 10, C.yellow, 2.5);
    circle(ctx, 41, 33, 5.2, INK, 0);
    circle(ctx, 63, 33, 5.2, INK, 0);
    circle(ctx, 39, 31, 1.8, C.white, 0);
    circle(ctx, 61, 31, 1.8, C.white, 0);
    poly(ctx, [[48, 40], [56, 40], [52, 50]], "#e0a040", 2);
    [[42, 77], [62, 77]].forEach(([x, y]) => {
      [-4, 0, 4].forEach((d) => line(ctx, [[x + d, y - 2], [x + d * 1.3, y + 3]], "#e0a040", 2.5));
    });
    [[30, 58, 5], [70, 24, 4], [60, 66, 4], [26, 30, 3]].forEach(([x, y, r]) => oval(ctx, x, y, r, r * 0.8, "rgba(79,154,138,0.75)", 0));
    glint(ctx, [[34, 22], [44, 18]], 2, 0.6);
    shadeIn(ctx, (c) => c.rect(60, 0, 44, 128), 0.2, 60, 0, 44, 128);
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
