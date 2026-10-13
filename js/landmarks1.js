/* Landmark art, first half: the four corner landmarks of the Gas-N-Go, the grocery, the
   hardware store, the pharmacy, Ortiz Auto, the electronics store and the garden center
   (art keys from ZSR.LAYOUT_ART in layouts.js), drawn in the comic style (flat fills, thick
   ink, halftone) and registered with ZSR.Draw3.registerSprite. landmarks2.js draws the rest.

   Sizing contract (building.js dressLayout): the whole canvas is drawn `size` tiles tall
   (under a ceiling at most 0.98), so every object stands on the bottom edge and reaches the
   top one, on a transparent background. A footprint landmark (`foot: [w, h]`) is drawn
   w * 0.95 tiles wide, so its art is about w:1 (504 x 168 for 3 wide); the others keep their
   own aspect, tall things tall and thin. `color` and `label` opts are used where the catalog
   line says so, with the layout's value as the default. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const D = ZSR.Draw3;
  if (!D) return;
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const FONT = "Oswald, Impact, sans-serif";
  const { shade, mix, rng } = D;
  const LW = 5; // the outline around a landmark's big shapes; details use 2.5..3.5

  /** The layout's color (opts.color) when it is a plain #rrggbb (shade and mix read only that), else the art's own. */
  function hue(o, fallback) {
    return typeof o.color === "string" && /^#[0-9a-f]{6}$/i.test(o.color) ? o.color : fallback;
  }

  /* ---------- Drawing helpers (the same conventions as yardart.js) ---------- */
  function trace(ctx, pts, close) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    if (close) ctx.closePath();
  }
  function inkStroke(ctx, lw) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }
  /** Fill the current path (when `fill` is given) and ink its edge (lw 0: no edge). */
  function paint(ctx, fill, lw) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (lw !== 0) inkStroke(ctx, lw == null ? 3 : lw);
  }
  function box(ctx, x, y, w, h, fill, lw) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
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
  function poly(ctx, pts, fill, lw) {
    trace(ctx, pts, true);
    paint(ctx, fill, lw);
  }
  function circle(ctx, x, y, r, fill, lw) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, r), 0, TAU);
    paint(ctx, fill, lw);
  }
  function oval(ctx, x, y, rx, ry, fill, lw, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot || 0, 0, TAU);
    paint(ctx, fill, lw);
  }
  function line(ctx, pts, color, lw) {
    trace(ctx, pts);
    ctx.strokeStyle = color || INK;
    ctx.lineWidth = lw || 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  /** A rail, pole or pipe: an ink line with a colored core. */
  function tube(ctx, pts, color, lw) {
    line(ctx, pts, INK, lw + 4);
    line(ctx, pts, color, lw);
  }
  /** A straight beam `t` thick from (x0, y0) to (x1, y1). */
  function bar(ctx, x0, y0, x1, y1, t, fill, lw) {
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = (-(y1 - y0) / len) * (t / 2);
    const ny = ((x1 - x0) / len) * (t / 2);
    poly(ctx, [[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]], fill, lw);
  }
  /** The soft shadow on the floor under a landmark. */
  function shadow(ctx, cx, y, rx) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, Math.max(3, rx * 0.12), 0, 0, TAU);
    ctx.fill();
  }
  /** Draw with fn() only onto what is already painted inside the rect (shading, patterns, dots). */
  function onTop(ctx, x, y, w, h, fn) {
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    fn();
    ctx.restore();
  }
  /** Comic halftone dots over what is painted inside the rect. */
  function dots(ctx, x, y, w, h, a) {
    onTop(ctx, x, y, w, h, () => {
      ctx.fillStyle = "rgba(15,16,18," + (a || 0.18) + ")";
      ctx.beginPath();
      for (let j = 0, yy = y + 2; yy < y + h; j++, yy += 5) {
        for (let xx = x + 2 + (j % 2) * 2.5; xx < x + w; xx += 5) {
          ctx.moveTo(xx + 1.1, yy);
          ctx.arc(xx, yy, 1.1, 0, TAU);
        }
      }
      ctx.fill();
    });
  }
  /** The shadow side: darker, with halftone, over what is painted inside the rect. */
  function darken(ctx, x, y, w, h, a) {
    onTop(ctx, x, y, w, h, () => {
      ctx.fillStyle = "rgba(15,16,18," + (a || 0.18) + ")";
      ctx.fillRect(x, y, w, h);
    });
    dots(ctx, x, y, w, h, 0.16);
  }
  /** A flat white shine, no edge. */
  function shine(ctx, x, y, w, h, a) {
    ctx.fillStyle = "rgba(255,255,255," + (a || 0.45) + ")";
    ctx.fillRect(x, y, w, h);
  }
  /** Clip to a closed path while fn() draws (a pattern inside one shape). */
  function inside(ctx, pts, fn) {
    ctx.save();
    trace(ctx, pts, true);
    ctx.clip();
    fn();
    ctx.restore();
  }
  /** Bold text as big as fits in maxW x maxH around (cx, cy), with an ink rim when `rim` is set. */
  function fitText(ctx, text, cx, cy, maxW, maxH, color, rim) {
    const t = String(text);
    let size = Math.max(6, Math.floor(maxH * 1.15));
    ctx.font = "700 " + size + "px " + FONT;
    const tw = ctx.measureText(t).width || t.length * size * 0.5;
    if (tw > maxW) size = Math.max(6, Math.floor((size * maxW) / tw));
    ctx.font = "700 " + size + "px " + FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const y = cy + size * 0.06;
    if (rim) {
      ctx.lineJoin = "round";
      ctx.strokeStyle = rim;
      ctx.lineWidth = Math.max(3, size * 0.2);
      ctx.strokeText(t, cx, y);
    }
    ctx.fillStyle = color || INK;
    ctx.fillText(t, cx, y);
  }
  /** Diagonal hazard stripes inside a rect (on what is painted there). */
  function hazard(ctx, x, y, w, h) {
    onTop(ctx, x, y, w, h, () => {
      for (let k = -h; k < w + h; k += 16) poly(ctx, [[x + k, y + h], [x + k + 8, y + h], [x + k + 8 + h, y], [x + k + h, y]], INK, 0);
    });
  }
  /** A ragged blob around (cx, cy), for rust, grease and frost. */
  function blob(ctx, cx, cy, rx, ry, seed, fill) {
    const r = rng(seed);
    const pts = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      const k = 0.65 + r() * 0.5;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    poly(ctx, pts, fill, 0);
  }
  /** A six-armed snowflake. */
  function snowflake(ctx, x, y, r, color) {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI;
      line(ctx, [[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], color, 3);
    }
  }

  const KEYS = [];
  const ART = {};
  const sprite = (name, w, h, fn) => {
    KEYS.push(name);
    ART[name] = { w, h, fn };
  };

  /* ================= Gas-N-Go ================= */

  /* A chest-high ice chest: frost on the lid, icicles, the label in big blue letters. */
  sprite("iceMachine", 240, 176, (ctx, w, h, o) => {
    const G = h - 4;
    shadow(ctx, w / 2, G, 114);
    box(ctx, 18, G - 20, w - 36, 18, "#2a2d33", LW);
    for (let x = 32; x < w - 30; x += 14) line(ctx, [[x, G - 15], [x, G - 7]], "#555b64", 3);
    rbox(ctx, 8, 38, w - 16, G - 58, 8, "#eef4f8", LW);
    onTop(ctx, 8, 38, w - 16, G - 58, () => {
      [[10, G - 26, 38, 22, 3], [w - 12, G - 28, 46, 26, 4], [w - 24, 48, 30, 14, 5], [20, 50, 22, 12, 6]].forEach(([x, y, rx, ry, s]) => blob(ctx, x, y, rx, ry, s, "#cfe8f6"));
    });
    rbox(ctx, 8, 38, w - 16, G - 58, 8, null, LW);
    line(ctx, [[w / 2, 50], [w / 2, G - 24]], "#a9bccb", 3);
    box(ctx, w / 2 - 26, 50, 16, 6, "#5b6470", 2.5);
    box(ctx, w / 2 + 10, 50, 16, 6, "#5b6470", 2.5);
    snowflake(ctx, 34, 70, 10, "#8cc7ea");
    snowflake(ctx, w - 34, 70, 10, "#8cc7ea");
    snowflake(ctx, 30, G - 40, 7, "#8cc7ea");
    snowflake(ctx, w - 30, G - 40, 7, "#8cc7ea");
    fitText(ctx, o.label || "ICE", w / 2, 100, w - 92, 64, "#1f6fd1", INK);
    // the lid, snow heaped on it and icicles hanging off its edge
    for (let i = 0; i < 9; i++) oval(ctx, 18 + i * 25.5, 16, 15, 9, "#ffffff", 3);
    rbox(ctx, 4, 14, w - 8, 28, 9, "#bfe0f2", LW);
    shine(ctx, 14, 20, w - 60, 5, 0.55);
    [20, 46, 70, 104, 138, 168, 196, 220].forEach((x, i) => poly(ctx, [[x - 6, 40], [x + 6, 40], [x, 40 + 10 + (i % 3) * 6]], "#e2f3fb", 2.5));
    darken(ctx, w - 46, 12, 44, G - 10, 0.12);
  });

  /* A rusty sedan up on a yellow two-post lift, its wheels hanging (foot 3 x 3, color = car body). */
  sprite("carLift", 504, 168, (ctx, w, h, o) => {
    const body = hue(o, "#3f6fb0");
    const G = h - 4;
    const Y = "#f2c230";
    shadow(ctx, w / 2, G, 240);
    oval(ctx, 388, G - 4, 46, 6, "rgba(15,16,18,0.5)", 0);
    rbox(ctx, 360, G - 14, 52, 12, 4, "#e8761a", 3.5);
    // the posts and the beam across the top
    [14, w - 44].forEach((px) => {
      box(ctx, px, 6, 30, G - 6, Y, LW);
      line(ctx, [[px + 15, 24], [px + 15, G - 40]], shade(Y, -60), 3);
      hazard(ctx, px, G - 34, 30, 34);
      box(ctx, px, G - 34, 30, 34, null, LW);
      darken(ctx, px + 18, 6, 12, G - 6, 0.14);
    });
    box(ctx, 14, 4, w - 28, 16, Y, LW);
    hazard(ctx, 14, 4, 46, 16);
    hazard(ctx, w - 60, 4, 46, 16);
    box(ctx, 14, 4, w - 28, 16, null, LW);
    // carriages and the arms under the car
    box(ctx, 40, 92, 18, 30, shade(Y, -30), LW);
    box(ctx, w - 58, 92, 18, 30, shade(Y, -30), LW);
    bar(ctx, 54, 112, 188, 106, 10, "#4a4f57", 3.5);
    bar(ctx, w - 54, 112, w - 188, 106, 10, "#4a4f57", 3.5);
    box(ctx, 176, 98, 22, 8, INK, 0);
    box(ctx, w - 198, 98, 22, 8, INK, 0);
    // the car
    const carPath = () => {
      ctx.beginPath();
      ctx.moveTo(64, 100);
      ctx.lineTo(60, 74);
      ctx.quadraticCurveTo(62, 62, 78, 60);
      ctx.lineTo(136, 58);
      ctx.lineTo(182, 26);
      ctx.quadraticCurveTo(242, 18, 302, 24);
      ctx.lineTo(352, 58);
      ctx.lineTo(426, 64);
      ctx.quadraticCurveTo(446, 68, 448, 82);
      ctx.lineTo(446, 100);
      ctx.lineTo(404, 100);
      ctx.arc(374, 100, 30, 0, Math.PI, true);
      ctx.lineTo(160, 100);
      ctx.arc(130, 100, 30, 0, Math.PI, true);
      ctx.closePath();
    };
    carPath();
    paint(ctx, body, 0);
    onTop(ctx, 50, 18, 410, 90, () => {
      ctx.fillStyle = "rgba(15,16,18,0.2)";
      ctx.fillRect(50, 82, 410, 30);
      [[118, 92, 30, 12, 11], [160, 70, 14, 9, 12], [322, 94, 26, 10, 13], [228, 96, 22, 6, 14], [90, 66, 18, 7, 15], [420, 76, 16, 10, 16]].forEach(([x, y, rx, ry, s]) => {
        blob(ctx, x, y, rx, ry, s, "#9a5428");
        blob(ctx, x + 3, y + 1, rx * 0.5, ry * 0.5, s + 40, "#6b3518");
      });
    });
    dots(ctx, 50, 82, 410, 22, 0.2);
    carPath();
    paint(ctx, null, LW);
    line(ctx, [[66, 78], [444, 80]], shade(body, 55), 3);
    line(ctx, [[84, 64], [132, 62]], "rgba(255,255,255,0.6)", 4);
    line(ctx, [[360, 63], [420, 67]], "rgba(255,255,255,0.6)", 4);
    poly(ctx, [[146, 58], [186, 30], [240, 27], [240, 58]], "#a9c4d6", 3.5);
    poly(ctx, [[248, 58], [248, 27], [298, 28], [338, 58]], "#a9c4d6", 3.5);
    line(ctx, [[172, 52], [196, 34]], "rgba(255,255,255,0.7)", 4);
    line(ctx, [[268, 52], [288, 34]], "rgba(255,255,255,0.7)", 4);
    line(ctx, [[244, 58], [244, 98]], INK, 3);
    line(ctx, [[142, 60], [150, 98]], INK, 3);
    line(ctx, [[344, 60], [340, 98]], INK, 3);
    box(ctx, 196, 66, 18, 5, "#d7dbe0", 2.5);
    box(ctx, 296, 66, 18, 5, "#d7dbe0", 2.5);
    box(ctx, 56, 66, 10, 14, "#d23a2a", 3);
    rbox(ctx, 436, 70, 12, 10, 3, "#ffe28a", 3);
    box(ctx, 54, 86, 14, 14, "#3a3d43", 3);
    box(ctx, 438, 86, 14, 14, "#3a3d43", 3);
    // the wheels, hanging below their arches
    [130, 374].forEach((cx) => {
      circle(ctx, cx, 112, 25, "#1d1f23", LW);
      circle(ctx, cx, 112, 13, "#b9c0c8", 3);
      circle(ctx, cx, 112, 4.5, "#3a3d43", 2);
      line(ctx, [[cx - 18, 100], [cx - 8, 94]], "#4a4f57", 3);
    });
  });

  /* A slushie machine on a steel stand: a red tank and a blue tank, swirl lids. */
  sprite("slushMachine", 128, 208, (ctx, w, h) => {
    const G = h - 4;
    shadow(ctx, w / 2, G, 56);
    box(ctx, 18, G - 10, 12, 10, "#3a3d43", 3);
    box(ctx, w - 30, G - 10, 12, 10, "#3a3d43", 3);
    box(ctx, 12, 126, w - 24, G - 136, "#5b6470", LW);
    rbox(ctx, 20, 136, w - 40, 30, 5, "#1f6fd1", 3.5);
    fitText(ctx, "SLUSH", w / 2, 151, w - 54, 21, "#ffffff", INK);
    for (let y = 176; y < G - 14; y += 7) line(ctx, [[24, y], [w - 24, y]], "#3f4650", 3);
    darken(ctx, w - 34, 126, 22, G - 136, 0.16);
    // the machine
    box(ctx, 8, 94, w - 16, 34, "#c9d0d7", LW);
    box(ctx, 12, 118, w - 24, 7, "#3a3d43", 2.5);
    const tank = (x, tw, c) => {
      const top = 36;
      const bot = 96;
      const cx = x + tw / 2;
      rbox(ctx, x, top, tw, bot - top, 10, "#e6f3f8", LW);
      onTop(ctx, x, top, tw, bot - top, () => {
        ctx.fillStyle = c;
        ctx.fillRect(x, top + 16, tw, bot - top);
        ctx.fillStyle = mix(c, "#ffffff", 0.45);
        ctx.fillRect(x, top + 14, tw, 6);
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 3;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.ellipse(cx, top + 30 + k * 14, tw * 0.32, 5, 0, 0.2, Math.PI - 0.2);
          ctx.stroke();
        }
      });
      dots(ctx, x + tw * 0.6, top + 16, tw * 0.4, bot - top, 0.2);
      rbox(ctx, x, top, tw, bot - top, 10, null, LW);
      shine(ctx, x + 6, top + 6, 5, bot - top - 16, 0.6);
      // the dome lid with its swirl
      ctx.beginPath();
      ctx.ellipse(cx, top + 2, tw / 2 + 2, 24, 0, Math.PI, 0);
      ctx.closePath();
      paint(ctx, "#f4f6f8", LW);
      const pts = [];
      for (let t = 0; t <= 3 * Math.PI; t += 0.25) pts.push([cx + Math.cos(t) * (2 + t * 2.1), top - 8 + Math.sin(t) * (1 + t * 0.95)]);
      line(ctx, pts, c, 3.5);
      circle(ctx, cx, top - 22, 5, c, 3);
      // its tap
      rbox(ctx, cx - 6, 98, 12, 16, 3, "#1f2124", 2.5);
      box(ctx, cx - 3, 113, 6, 5, "#7d858e", 2);
    };
    tank(12, 50, "#e8343c");
    tank(66, 50, "#2f7de0");
    darken(ctx, w - 26, 94, 18, 34, 0.14);
  });

  /* A head-high tower of black tires, the top one tipped, a big white price tag (label). */
  sprite("tireStack", 136, 200, (ctx, w, h, o) => {
    const G = h - 4;
    const TH = 32;
    shadow(ctx, w / 2, G, 62);
    const offs = [0, 4, -3, 3, -2];
    for (let i = 0; i < 5; i++) {
      const y = G - TH * (i + 1);
      const x = 10 + offs[i];
      const tw = w - 20;
      rbox(ctx, x, y, tw, TH, 13, "#26282c", LW);
      for (let xx = x + 12; xx < x + tw - 12; xx += 12) box(ctx, xx, y + 8, 6, TH - 16, "#3c4048", 0);
      line(ctx, [[x + 12, y + TH / 2], [x + tw - 12, y + TH / 2]], "#17181b", 2.5);
      line(ctx, [[x + 14, y + 5], [x + tw - 14, y + 5]], "#5a606a", 2.5);
    }
    darken(ctx, w - 44, 30, 40, G - 30, 0.18);
    // the top tire, tipped on the stack
    ctx.save();
    ctx.translate(w / 2 + 4, G - 5 * TH - 10);
    ctx.rotate(-0.17);
    ctx.beginPath();
    ctx.ellipse(0, 10, 58, 18, 0, 0, Math.PI);
    ctx.lineTo(-58, 0);
    ctx.ellipse(0, 0, 58, 18, 0, Math.PI, 0, true);
    ctx.closePath();
    paint(ctx, "#1d1f23", LW);
    oval(ctx, 0, 0, 58, 18, "#2e3136", LW);
    oval(ctx, 0, 0, 44, 13, null, 0);
    ctx.strokeStyle = "#4d525a";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    oval(ctx, 0, 1, 28, 8.5, "#0b0c0e", 3);
    ctx.restore();
    // the price tag, tied on
    ctx.save();
    ctx.translate(w / 2, G - 2.5 * TH);
    ctx.rotate(-0.07);
    line(ctx, [[-42, 0], [-30, -30]], "#f3eee0", 2.5);
    poly(ctx, [[-36, -20], [52, -20], [52, 20], [-36, 20], [-50, 0]], "#fbfbf6", 4);
    circle(ctx, -40, 0, 3.5, "#26282c", 2);
    fitText(ctx, o.label || "TIRES", 8, 1, 80, 30, "#d42a2a", INK);
    ctx.restore();
  });

  /* ================= Corner Grocery ================= */

  /* A lobster tank on a steel stand: cloudy green water, two lobsters, a crab sign on top. */
  sprite("fishTank", 208, 192, (ctx, w, h) => {
    const G = h - 4;
    const steel = "#8d969e";
    shadow(ctx, w / 2, G, 98);
    box(ctx, 14, 128, 14, G - 128, steel, LW);
    box(ctx, w - 28, 128, 14, G - 128, steel, LW);
    line(ctx, [[28, 134], [w - 28, G - 22]], "#5d656e", 5);
    line(ctx, [[w - 28, 134], [28, G - 22]], "#5d656e", 5);
    box(ctx, 24, G - 22, w - 48, 10, steel, 3.5);
    box(ctx, 8, 118, w - 16, 14, steel, LW);
    darken(ctx, w - 28, 118, 20, G - 118, 0.15);
    // the tank
    const T = 50;
    const B = 118;
    box(ctx, 10, T, w - 20, B - T, "#d4e6e2", LW);
    onTop(ctx, 10, T + 12, w - 20, B - T - 12, () => {
      ctx.fillStyle = "#5e9a6c";
      ctx.fillRect(10, T + 12, w - 20, B - T);
      [[50, 80, 30, 10], [130, 74, 36, 8], [170, 96, 22, 9], [80, 104, 40, 7]].forEach(([x, y, rx, ry]) => oval(ctx, x, y, rx, ry, "rgba(225,240,205,0.22)", 0));
      const r = rng(23);
      for (let x = 14; x < w - 12; x += 7) oval(ctx, x, B - 4 - r() * 3, 5, 4, ["#a58a62", "#7d6a52", "#c9b08a"][(x / 7) % 3 | 0], 1.5);
    });
    const lobster = (x, y, s, flip) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(flip ? -s : s, s);
      const red = "#d8452c";
      oval(ctx, -34, 0, 7, 9, red, 2.5);
      for (let k = 0; k < 3; k++) oval(ctx, -24 + k * 7, 0, 6, 7 - k * 0.5, red, 2.5);
      oval(ctx, 0, 0, 14, 8, red, 2.5);
      poly(ctx, [[12, -6], [24, 0], [12, 6]], red, 2.5);
      line(ctx, [[22, -2], [42, -22]], INK, 2);
      line(ctx, [[22, 1], [44, -12]], INK, 2);
      line(ctx, [[10, -5], [22, -14]], red, 4);
      line(ctx, [[10, 5], [22, 12]], red, 4);
      oval(ctx, 30, -16, 11, 6, red, 2.5, -0.3);
      oval(ctx, 30, 13, 11, 6, red, 2.5, 0.3);
      ctx.restore();
    };
    lobster(70, 92, 1, false);
    lobster(150, 102, 0.85, true);
    [[112, 70, 4], [116, 62, 3], [110, 84, 3.5], [40, 66, 3]].forEach(([x, y, r]) => circle(ctx, x, y, r, "rgba(240,255,250,0.7)", 1.5));
    dots(ctx, 10, T + 12, w - 20, B - T - 12, 0.14);
    line(ctx, [[12, T + 12], [w - 12, T + 12]], "#eaf7f0", 3);
    line(ctx, [[30, T + 4], [52, T + 30]], "rgba(255,255,255,0.75)", 5);
    line(ctx, [[44, T + 4], [58, T + 20]], "rgba(255,255,255,0.75)", 3);
    box(ctx, 10, T, w - 20, B - T, null, LW);
    box(ctx, 6, T - 6, w - 12, 10, "#2a2d33", 3.5);
    box(ctx, 10, T, 7, B - T, "#2a2d33", 2);
    box(ctx, w - 17, T, 7, B - T, "#2a2d33", 2);
    // the crab sign on its post
    box(ctx, w / 2 - 4, 38, 8, 8, "#2a2d33", 2.5);
    const cx = w / 2;
    const cy = 26;
    const red = "#e0452e";
    [-1, 1].forEach((sd) => {
      for (let k = 0; k < 3; k++) line(ctx, [[cx + sd * 20, cy + 6 + k * 4], [cx + sd * (36 + k * 4), cy + 12 + k * 6]], INK, 4);
      line(ctx, [[cx + sd * 24, cy - 2], [cx + sd * 42, cy - 10]], INK, 9);
      line(ctx, [[cx + sd * 24, cy - 2], [cx + sd * 42, cy - 10]], red, 5);
      oval(ctx, cx + sd * 50, cy - 14, 13, 9, red, 3.5, sd * 0.5);
      poly(ctx, [[cx + sd * 50, cy - 16], [cx + sd * 66, cy - 26], [cx + sd * 62, cy - 12]], "#f4e6c8", 0);
      line(ctx, [[cx + sd * 8, cy - 8], [cx + sd * 10, cy - 18]], INK, 3);
      circle(ctx, cx + sd * 10, cy - 20, 5, "#ffffff", 2.5);
      circle(ctx, cx + sd * 11, cy - 20, 2, INK, 0);
    });
    oval(ctx, cx, cy + 4, 28, 15, red, LW);
    line(ctx, [[cx - 10, cy + 6], [cx, cy + 11], [cx + 10, cy + 6]], INK, 2.5);
    shine(ctx, cx - 16, cy - 6, 14, 4, 0.5);
  });

  /* A small warehouse forklift, side view: the forks up with a pallet of boxes (foot 3 x 1, color = paint). */
  sprite("forklift", 504, 168, (ctx, w, h, o) => {
    const paintC = hue(o, "#e3b21b");
    const G = h - 4;
    const dark = "#2a2d33";
    shadow(ctx, 250, G, 232);
    // counterweight and body
    rbox(ctx, 22, 70, 124, 84, 16, shade(paintC, -28), LW);
    hazard(ctx, 22, 92, 20, 56);
    rbox(ctx, 22, 70, 124, 84, 16, null, LW);
    box(ctx, 110, 100, 230, 54, paintC, LW);
    rbox(ctx, 34, 64, 156, 38, 10, paintC, LW);
    shine(ctx, 44, 70, 130, 5, 0.45);
    darken(ctx, 22, 128, 320, 30, 0.14);
    // seat, wheel and the overhead cage
    rbox(ctx, 146, 28, 22, 46, 6, dark, LW);
    rbox(ctx, 144, 58, 62, 14, 6, dark, LW);
    line(ctx, [[272, 100], [252, 68]], dark, 6);
    oval(ctx, 250, 64, 18, 6, null, 5, -0.3);
    tube(ctx, [[140, 66], [140, 18]], dark, 6);
    tube(ctx, [[302, 100], [288, 18]], dark, 6);
    box(ctx, 128, 10, 172, 11, dark, 3.5);
    for (let x = 150; x < 290; x += 22) line(ctx, [[x, 12], [x + 8, 19]], "#555b64", 2.5);
    line(ctx, [[140, 46], [180, 20]], dark, 4);
    ctx.beginPath();
    ctx.ellipse(214, 10, 11, 9, 0, Math.PI, 0);
    ctx.closePath();
    paint(ctx, "#ff8a1f", 3);
    circle(ctx, 292, 44, 6, "#ffe28a", 3);
    // the mast, its chain and ram
    box(ctx, 338, 8, 14, 144, "#4a4f57", LW);
    box(ctx, 352, 14, 10, 138, "#5d646d", LW);
    for (let y = 20; y < 140; y += 9) line(ctx, [[345, y - 3], [345, y + 3]], "#9aa1a9", 2);
    tube(ctx, [[357, 150], [357, 64]], "#c9d0d7", 4);
    // carriage, backrest and forks
    box(ctx, 362, 44, 12, 58, dark, LW);
    [366, 372, 378].forEach((x) => line(ctx, [[x, 22], [x, 46]], dark, 4));
    line(ctx, [[364, 22], [380, 22]], dark, 5);
    poly(ctx, [[370, 94], [494, 94], [498, 100], [370, 102]], dark, 3.5);
    // the pallet and boxes on the forks
    box(ctx, 380, 80, 112, 8, "#b07a43", 3.5);
    [382, 428, 474].forEach((x) => box(ctx, x, 88, 16, 12, "#8a5a2e", 3));
    const crate = (x, y, cw, ch) => {
      box(ctx, x, y, cw, ch, "#c99a5e", 3.5);
      box(ctx, x + cw / 2 - 5, y, 10, ch, "#e3c48f", 0);
      box(ctx, x, y, cw, ch, null, 3.5);
      poly(ctx, [[x + 10, y + 16], [x + 15, y + 9], [x + 20, y + 16]], INK, 0);
      darken(ctx, x + cw * 0.7, y, cw * 0.3, ch, 0.12);
    };
    crate(384, 40, 52, 40);
    crate(436, 46, 52, 34);
    crate(398, 8, 62, 32);
    // wheels
    circle(ctx, 98, 138, 23, "#1d1f23", LW);
    circle(ctx, 98, 138, 10, "#9aa1a9", 3);
    circle(ctx, 298, 134, 28, "#1d1f23", LW);
    circle(ctx, 298, 134, 13, "#e0e3e6", 3);
    circle(ctx, 298, 134, 4, dark, 0);
  });

  /* A tangled heap of chrome shopping carts, one upside down on top, red handles. */
  sprite("cartPile", 224, 192, (ctx, w, h) => {
    const G = h - 4;
    shadow(ctx, w / 2, G, 104);
    const chrome = "#dbe2e8";
    const cart = (x, y, rot, s, flip) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(flip ? -s : s, s);
      const basket = [[0, 0], [112, -2], [100, 44], [14, 50]];
      trace(ctx, basket, true);
      ctx.fillStyle = "rgba(196,208,218,0.6)";
      ctx.fill();
      inside(ctx, basket, () => {
        for (let gx = 8; gx < 112; gx += 9) line(ctx, [[gx, -4], [gx - 2, 54]], "#58626c", 3);
        for (let gy = 9; gy < 52; gy += 9) line(ctx, [[0, gy], [114, gy]], "#58626c", 3);
        box(ctx, 2, 2, 22, 40, "#d62c2c", 3);
      });
      tube(ctx, [[14, 50], [18, 84]], chrome, 4.5);
      tube(ctx, [[100, 44], [100, 84]], chrome, 4.5);
      tube(ctx, [[16, 72], [100, 72]], chrome, 4.5);
      tube(ctx, basket.concat([basket[0]]), chrome, 6);
      tube(ctx, [[0, 0], [-12, -14]], chrome, 5);
      circle(ctx, -12, -14, 9, "#d62c2c", 3.5);
      [[18, 90], [100, 90]].forEach(([wx, wy]) => {
        circle(ctx, wx, wy, 8.5, "#1d1f23", 3);
        circle(ctx, wx, wy, 3, "#9aa1a9", 0);
      });
      ctx.restore();
    };
    cart(156, 86, Math.PI + 0.2, 0.8, false);
    cart(26, G - 88, 0, 0.9, false);
    cart(204, G - 88, 0, 0.9, true);
    cart(30, 54, 0.42, 0.78, false);
    cart(148, 96, -0.3, 0.72, true);
    dots(ctx, 0, 0, w, h, 0.1);
  });

  /* A giant red gumball machine: a glass globe full of colored balls, a coin slot. */
  sprite("gumball", 136, 208, (ctx, w, h) => {
    const G = h - 4;
    const red = "#d62828";
    shadow(ctx, w / 2, G, 58);
    poly(ctx, [[20, G], [116, G], [100, 172], [36, 172]], red, LW);
    rbox(ctx, 30, 108, 76, 70, 10, red, LW);
    shine(ctx, 38, 116, 6, 54, 0.4);
    darken(ctx, 86, 108, 32, G - 108, 0.16);
    rbox(ctx, 44, 116, 48, 34, 5, "#c9ced4", 3.5);
    box(ctx, 50, 121, 7, 12, INK, 0);
    circle(ctx, 74, 134, 10, "#e8ebee", 3);
    line(ctx, [[66, 134], [82, 134]], INK, 4);
    rbox(ctx, 52, 154, 32, 18, 4, "#c9ced4", 3);
    box(ctx, 57, 158, 22, 10, "#1d1f23", 0);
    // the globe and its gumballs
    const cx = w / 2;
    const cy = 66;
    const R = 48;
    circle(ctx, cx, cy, R, "#eef6f9", LW);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R - 2, 0, TAU);
    ctx.clip();
    const cols = ["#e23a2a", "#ffd23a", "#2f7de0", "#3fae49", "#ff8a1f", "#f4f4f0", "#e86fb4", "#8a4fd0"];
    let n = 0;
    for (let y = cy + R - 6, row = 0; y > cy - R * 0.55; y -= 12, row++) {
      for (let x = cx - R + (row % 2 ? 10 : 4); x < cx + R; x += 13) circle(ctx, x, y, 7, cols[(n++ * 5 + row) % cols.length], 2.5);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, R - 10, Math.PI * 1.1, Math.PI * 1.45);
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.stroke();
    circle(ctx, cx + 22, cy - 28, 4, "rgba(255,255,255,0.85)", 0);
    circle(ctx, cx, cy, R, null, LW);
    rbox(ctx, 26, 104, 84, 14, 6, red, LW);
    rbox(ctx, 44, 14, 48, 12, 4, red, LW);
    ctx.beginPath();
    ctx.ellipse(cx, 14, 16, 10, 0, Math.PI, 0);
    ctx.closePath();
    paint(ctx, red, LW);
    shine(ctx, 50, 17, 20, 3, 0.5);
  });

  /* ================= Reyes Hardware ================= */

  /* A paint shaker on a counter, cans stacked round it, rainbow paint running down the front. */
  sprite("paintMixer", 208, 192, (ctx, w, h) => {
    const G = h - 4;
    shadow(ctx, w / 2, G, 100);
    box(ctx, 6, 112, w - 12, G - 112, "#4f6d8a", LW);
    box(ctx, 10, G - 12, w - 20, 12, "#2a2d33", 3);
    // rainbow drips down the front
    const rainbow = ["#e23a2a", "#ff8a1f", "#ffd23a", "#3fae49", "#2f7de0", "#8a4fd0"];
    [[14, 52], [30, 30], [46, 60], [64, 38], [80, 54], [96, 26], [112, 46], [130, 34], [146, 58], [164, 30], [180, 48]].forEach(([x, len], i) => {
      const c = rainbow[i % rainbow.length];
      rbox(ctx, x, 112, 12, len, 6, c, 2.5);
      circle(ctx, x + 6, 112 + len, 6.5, c, 2.5);
    });
    [[40, 128, 9], [120, 140, 8], [176, 130, 7], [78, 150, 6]].forEach(([x, y, r], i) => circle(ctx, x, y, r, rainbow[(i * 2 + 1) % rainbow.length], 2.5));
    box(ctx, 2, 104, w - 4, 12, "#c9a46a", LW);
    shine(ctx, 8, 106, w - 16, 3, 0.4);
    darken(ctx, w - 40, 104, 36, G - 104, 0.12);
    // the shaker
    rbox(ctx, 58, 32, 92, 74, 6, "#e7dfc9", LW);
    box(ctx, 70, 24, 68, 10, "#bdb39a", 3.5);
    rbox(ctx, 66, 42, 54, 46, 4, "#1f2a33", 3.5);
    box(ctx, 72, 46, 42, 6, "#8d969e", 2);
    box(ctx, 72, 78, 42, 6, "#8d969e", 2);
    rbox(ctx, 78, 52, 30, 26, 3, "#d9dde1", 2.5);
    box(ctx, 78, 58, 30, 12, "#2f7de0", 2.5);
    [[64, 56, 58, 64], [64, 72, 58, 80], [122, 56, 128, 64], [122, 72, 128, 80]].forEach(([a, b, c, d]) => line(ctx, [[a, b], [c, d]], "#ffffff", 2.5));
    circle(ctx, 136, 50, 5, "#e23a2a", 2.5);
    circle(ctx, 136, 66, 5, "#3fae49", 2.5);
    box(ctx, 127, 76, 18, 10, "#9ad1a0", 2.5);
    box(ctx, 58, 92, 92, 12, "#e8761a", 3);
    fitText(ctx, "MIX", 104, 98, 40, 10, "#ffffff");
    darken(ctx, 124, 32, 26, 74, 0.1);
    // paint cans
    const can = (x, y, c) => {
      rbox(ctx, x, y, 26, 30, 3, "#d9dde1", 3);
      box(ctx, x, y + 9, 26, 13, c, 2.5);
      oval(ctx, x + 13, y + 1, 13, 4, c, 2.5);
      rbox(ctx, x + 3, y, 5, 12, 2.5, c, 2);
      darken(ctx, x + 17, y, 9, 30, 0.12);
    };
    can(6, 74, "#e23a2a");
    can(32, 74, "#2f7de0");
    can(19, 44, "#ffd23a");
    can(150, 74, "#3fae49");
    can(176, 74, "#8a4fd0");
    can(163, 44, "#ff8a1f");
  });

  /* A riding mower with a yellow seat, a SALE flag on a stick (color = body paint). */
  sprite("ridingMower", 224, 176, (ctx, w, h, o) => {
    const body = hue(o, "#3f8f3a");
    const G = h - 4;
    shadow(ctx, w / 2, G, 104);
    tube(ctx, [[30, 122], [30, 6]], "#8d969e", 3);
    poly(ctx, [[30, 6], [124, 6], [112, 26], [124, 46], [30, 46]], "#e23a2a", LW);
    fitText(ctx, "SALE", 74, 26, 72, 32, "#ffffff", INK);
    poly(ctx, [[76, 150], [178, 150], [188, 162], [70, 164]], "#3a3d43", LW);
    box(ctx, 40, 108, 62, 20, shade(body, -24), LW);
    poly(ctx, [[86, 148], [86, 112], [110, 98], [196, 100], [214, 116], [212, 148]], body, LW);
    shine(ctx, 112, 104, 80, 4, 0.4);
    line(ctx, [[96, 126], [208, 128]], "#f2c230", 4);
    box(ctx, 204, 118, 8, 24, "#2a2d33", 2.5);
    circle(ctx, 206, 110, 5, "#ffe28a", 2.5);
    darken(ctx, 86, 132, 130, 20, 0.14);
    // wheels and the fender
    circle(ctx, 62, 140, 30, "#1d1f23", LW);
    circle(ctx, 62, 140, 13, "#f2c230", 3);
    circle(ctx, 62, 140, 4, "#2a2d33", 0);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * TAU;
      line(ctx, [[62 + Math.cos(a) * 24, 140 + Math.sin(a) * 24], [62 + Math.cos(a) * 29, 140 + Math.sin(a) * 29]], "#4a4f57", 3);
    }
    circle(ctx, 180, 154, 17, "#1d1f23", LW);
    circle(ctx, 180, 154, 7, "#f2c230", 3);
    ctx.beginPath();
    ctx.arc(62, 140, 40, Math.PI * 1.02, Math.PI * 1.98);
    ctx.arc(62, 140, 32, Math.PI * 1.98, Math.PI * 1.02, true);
    ctx.closePath();
    paint(ctx, body, LW);
    // the seat and the wheel
    rbox(ctx, 40, 64, 20, 48, 7, "#f2c230", LW);
    rbox(ctx, 42, 96, 52, 14, 6, "#f2c230", LW);
    line(ctx, [[120, 100], [108, 72]], "#2a2d33", 5);
    oval(ctx, 106, 70, 17, 5, null, 5);
  });

  /* Store display: white toilets stacked three high in a pyramid, a burst sign on top (label). */
  sprite("toiletStack", 216, 216, (ctx, w, h, o) => {
    const G = h - 4;
    shadow(ctx, w / 2, G, 104);
    const toilet = (cx, by) => {
      ctx.save();
      ctx.translate(cx, by);
      const P = "#f4f6f8";
      poly(ctx, [[-15, 0], [15, 0], [10, -14], [-10, -14]], P, 3.5);
      ctx.beginPath();
      ctx.moveTo(-28, -30);
      ctx.quadraticCurveTo(-26, -10, -10, -12);
      ctx.lineTo(10, -12);
      ctx.quadraticCurveTo(26, -10, 28, -30);
      ctx.closePath();
      paint(ctx, P, 3.5);
      rbox(ctx, -30, -35, 60, 8, 3, "#e3e8ec", 3.5);
      rbox(ctx, -22, -56, 44, 22, 3, P, 3.5);
      rbox(ctx, -25, -58, 50, 7, 2, "#e3e8ec", 3);
      line(ctx, [[-17, -48], [-9, -48]], "#9aa3ab", 3);
      shine(ctx, -18, -52, 4, 14, 0.8);
      darken(ctx, 8, -60, 24, 60, 0.12);
      ctx.restore();
    };
    [40, 108, 176].forEach((x) => toilet(x, G));
    [74, 142].forEach((x) => toilet(x, G - 57));
    toilet(108, G - 114);
    // the sale burst
    const cx = w / 2;
    const cy = 24;
    line(ctx, [[cx, cy + 14], [cx, G - 170]], "#2a2d33", 4);
    const pts = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU;
      const r = i % 2 ? 0.72 : 1;
      pts.push([cx + Math.cos(a) * 64 * r, cy + Math.sin(a) * 23 * r]);
    }
    poly(ctx, pts, "#ffd23a", 4);
    fitText(ctx, o.label || "SALE", cx, cy, 82, 26, "#d42a2a", INK);
  });

  /* A tall open step ladder with a paint bucket on the top step (color = ladder paint). */
  sprite("ladder", 128, 216, (ctx, w, h, o) => {
    const c = hue(o, "#e8761a");
    const G = h - 4;
    shadow(ctx, w / 2 + 6, G, 54);
    const back = shade(c, -45);
    // the back legs, behind
    bar(ctx, 98, 46, 124, G - 12, 8, shade(back, -20), 3);
    bar(ctx, 86, 50, 112, G, 10, back, 3.5);
    line(ctx, [[64, 120], [100, 126]], "#9aa1a9", 3);
    // the front: two rails and the steps between them
    const near = [[12, G], [44, 50]];
    const far = [[56, G - 8], [76, 46]];
    const at = (rail, t) => [rail[0][0] + (rail[1][0] - rail[0][0]) * t, rail[0][1] + (rail[1][1] - rail[0][1]) * t];
    bar(ctx, far[0][0], far[0][1], far[1][0], far[1][1], 9, shade(c, -20), 3.5);
    [0.18, 0.4, 0.62, 0.84].forEach((t) => {
      const [x0, y0] = at(near, t);
      const [x1, y1] = at(far, t);
      poly(ctx, [[x0, y0 - 9], [x1, y1 - 9], [x1 + 4, y1 - 3], [x0 + 4, y0 + 4]], shade(c, 30), 3);
      poly(ctx, [[x0, y0 - 2], [x1 + 2, y1 - 3], [x1 + 2, y1 + 4], [x0, y0 + 6]], shade(c, -10), 3);
    });
    bar(ctx, near[0][0], near[0][1], near[1][0], near[1][1], 12, c, LW);
    line(ctx, [[18, G - 10], [44, 60]], "rgba(255,255,255,0.45)", 3);
    // the top cap and the bucket on it
    poly(ctx, [[34, 42], [96, 38], [100, 52], [40, 56]], "#9aa1a9", LW);
    const bx = 70;
    poly(ctx, [[bx - 18, 10], [bx + 18, 10], [bx + 14, 40], [bx - 14, 40]], "#f4f6f8", LW);
    box(ctx, bx - 17, 16, 34, 8, "#2f7de0", 0);
    poly(ctx, [[bx - 18, 10], [bx + 18, 10], [bx + 14, 40], [bx - 14, 40]], null, LW);
    oval(ctx, bx, 10, 18, 5, "#2f7de0", 3);
    rbox(ctx, bx + 8, 10, 6, 22, 3, "#2f7de0", 2.5);
    ctx.beginPath();
    ctx.arc(bx, 12, 15, Math.PI * 1.05, Math.PI * 1.95);
    inkStroke(ctx, 2.5);
    darken(ctx, bx + 4, 6, 16, 36, 0.12);
  });

  /* ================= Mile 9 Pharmacy ================= */

  /* Store display: a person-sized toothbrush on a stand, toothpaste on the bristles (color = handle). */
  sprite("toothbrush", 132, 216, (ctx, w, h, o) => {
    const c = hue(o, "#7fd1b0");
    const G = h - 4;
    const cx = 56;
    shadow(ctx, 60, G, 52);
    oval(ctx, 60, G - 6, 48, 8, "#4a4f57", LW);
    // the handle: a fat grip, a thin neck, the head on top
    const handle = () => {
      ctx.beginPath();
      ctx.moveTo(cx - 16, 196);
      ctx.quadraticCurveTo(cx - 30, 150, cx - 14, 110);
      ctx.quadraticCurveTo(cx - 6, 92, cx - 9, 76);
      ctx.lineTo(cx - 13, 24);
      ctx.quadraticCurveTo(cx - 13, 9, cx + 1, 9);
      ctx.quadraticCurveTo(cx + 15, 9, cx + 15, 24);
      ctx.lineTo(cx + 10, 76);
      ctx.quadraticCurveTo(cx + 7, 92, cx + 15, 110);
      ctx.quadraticCurveTo(cx + 31, 150, cx + 17, 196);
      ctx.closePath();
    };
    handle();
    paint(ctx, c, 0);
    const grip = mix(c, "#ffffff", 0.65);
    [128, 150, 172].forEach((y) => oval(ctx, cx + 1, y, 12, 8, grip, 2.5));
    onTop(ctx, cx + 4, 6, 40, 194, () => {
      ctx.fillStyle = "rgba(15,16,18,0.2)";
      ctx.fillRect(cx + 4, 6, 40, 194);
    });
    dots(ctx, cx + 4, 6, 40, 194, 0.14);
    handle();
    paint(ctx, null, LW);
    line(ctx, [[cx - 16, 162], [cx - 12, 118]], "rgba(255,255,255,0.6)", 5);
    line(ctx, [[cx - 6, 70], [cx - 8, 26]], "rgba(255,255,255,0.6)", 4);
    // the bristles and the toothpaste on them
    for (let i = 0; i < 5; i++) rbox(ctx, cx + 12, 13 + i * 12, 40, 10, 5, i % 2 ? "#8fd0f0" : "#f7f9fb", 2.5);
    const px = cx + 50;
    ctx.beginPath();
    ctx.moveTo(px, 10);
    for (let y = 10; y < 74; y += 8) ctx.quadraticCurveTo(y % 16 === 10 ? px + 22 : px + 14, y + 4, px + 2, y + 8);
    ctx.lineTo(px - 4, 80);
    ctx.lineTo(px - 4, 10);
    ctx.closePath();
    paint(ctx, "#ffffff", 3);
    line(ctx, [[px + 3, 15], [px + 4, 74]], "#2f7de0", 4);
    line(ctx, [[px + 10, 15], [px + 11, 72]], "#e23a2a", 3);
    // the holder cup
    rbox(ctx, cx - 24, 166, 52, 32, 6, "#c9d0d7", LW);
    shine(ctx, cx - 17, 172, 5, 20, 0.6);
    darken(ctx, cx + 12, 166, 16, 32, 0.12);
  });

  /* Three folded wheelchairs chained together: chrome frames, blue seats, a padlock. */
  sprite("wheelchairs", 240, 164, (ctx, w, h) => {
    const G = h - 4;
    shadow(ctx, w / 2, G, 112);
    const chair = (x0, s, k) => {
      const chrome = mix("#d5dce2", "#6b737c", k);
      const blue = mix("#2f63b8", "#1b2f5a", k);
      ctx.save();
      ctx.translate(x0, G);
      ctx.scale(s, s);
      tube(ctx, [[10, -9], [16, -34]], chrome, 3);
      circle(ctx, 10, -9, 9, "#1d1f23", 3);
      tube(ctx, [[18, -56], [12, -24], [0, -22]], chrome, 3);
      tube(ctx, [[0, -22], [18, -22]], chrome, 3);
      // the big wheel
      circle(ctx, 64, -40, 38, "#1d1f23", 3.5);
      circle(ctx, 64, -40, 31, "rgba(205,214,222,0.35)", 0);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI;
        line(ctx, [[64 - Math.cos(a) * 30, -40 - Math.sin(a) * 30], [64 + Math.cos(a) * 30, -40 + Math.sin(a) * 30]], "#9aa1a9", 1.5);
      }
      ctx.beginPath();
      ctx.arc(64, -40, 33, 0, TAU);
      ctx.strokeStyle = chrome;
      ctx.lineWidth = 3;
      ctx.stroke();
      circle(ctx, 64, -40, 6, chrome, 2.5);
      // frame, seat and back
      tube(ctx, [[16, -56], [80, -56]], chrome, 3.5);
      tube(ctx, [[78, -56], [84, -120]], chrome, 3.5);
      tube(ctx, [[84, -120], [100, -122]], chrome, 3);
      line(ctx, [[94, -122], [104, -123]], INK, 8);
      tube(ctx, [[28, -80], [24, -56]], chrome, 3);
      tube(ctx, [[76, -80], [78, -56]], chrome, 3);
      rbox(ctx, 18, -62, 64, 10, 3, blue, 3);
      poly(ctx, [[72, -62], [78, -116], [90, -116], [84, -62]], blue, 3);
      rbox(ctx, 24, -86, 56, 8, 4, "#2a2d33", 3);
      ctx.restore();
    };
    chair(110, 1.18, 0.32);
    chair(58, 1.18, 0.16);
    chair(6, 1.18, 0);
    // the chain through all three (links face on, then edge on), and its padlock
    const at = (t) => [18 + t * 208, G - 70 + Math.sin(t * Math.PI) * 20];
    const n = 21;
    for (let i = 0; i <= n; i++) {
      const [x, y] = at(i / n);
      const [x2, y2] = at(Math.min(1, i / n + 0.01));
      const a = Math.atan2(y2 - y, x2 - x);
      ctx.beginPath();
      if (i % 2) {
        ctx.moveTo(x - Math.cos(a) * 6, y - Math.sin(a) * 6);
        ctx.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6);
      } else ctx.ellipse(x, y, 7, 4, a, 0, TAU);
      ctx.strokeStyle = INK;
      ctx.lineWidth = i % 2 ? 6 : 5;
      ctx.stroke();
      ctx.strokeStyle = "#c9d0d7";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    const lx = at(0.5)[0];
    const ly = at(0.5)[1] + 4;
    ctx.beginPath();
    ctx.arc(lx, ly + 6, 8, Math.PI, 0);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = "#c9d0d7";
    ctx.lineWidth = 3;
    ctx.stroke();
    rbox(ctx, lx - 13, ly + 6, 26, 22, 4, "#e0a91f", 3.5);
    circle(ctx, lx, ly + 15, 3, INK, 0);
    box(ctx, lx - 1, ly + 15, 2, 7, INK, 0);
  });

  /* A photo booth: red curtain half open, a strip of sample photos, a lit sign on top (label). */
  sprite("photoBooth", 152, 216, (ctx, w, h, o) => {
    const G = h - 4;
    shadow(ctx, w / 2, G, 72);
    box(ctx, 8, 58, w - 16, G - 66, "#2d4f8f", LW);
    box(ctx, 4, G - 10, w - 8, 10, "#1f2a44", 3.5);
    box(ctx, 8, 58, w - 16, 9, "#c9d0d7", 3);
    // the booth: dark inside, a stool, the curtain pulled half across
    box(ctx, 16, 72, 82, G - 86, "#16171c", 3.5);
    rbox(ctx, 58, 152, 30, 8, 3, "#9aa1a9", 2.5);
    tube(ctx, [[73, 160], [73, G - 16]], "#9aa1a9", 3);
    tube(ctx, [[14, 74], [100, 74]], "#c9d0d7", 3);
    const curtain = [[16, 74], [64, 74], [56, 120], [50, G - 14], [16, G - 14]];
    poly(ctx, curtain, "#d42a2a", LW);
    inside(ctx, curtain, () => {
      [22, 32, 42, 52].forEach((x) => line(ctx, [[x, 74], [x - 2, G - 14]], "#8e1a1a", 3.5));
      shine(ctx, 26, 76, 4, G - 92, 0.25);
    });
    rbox(ctx, 12, 116, 46, 9, 3, "#f2c230", 3);
    // sample photos, the coin plate, the slot
    rbox(ctx, 108, 76, 28, 86, 2, "#fbfbf6", 3);
    for (let i = 0; i < 4; i++) {
      const y = 80 + i * 20;
      box(ctx, 112, y, 20, 16, "#8d969e", 2);
      circle(ctx, 122, y + 7, 4.5, "#e6e6e6", 1.5);
      line(ctx, [[119, y + 9], [122, y + 11], [125, y + 9]], INK, 1.5);
    }
    rbox(ctx, 108, 170, 28, 22, 3, "#d8b24a", 3);
    box(ctx, 120, 175, 4, 12, INK, 0);
    box(ctx, 110, G - 22, 24, 6, INK, 0);
    darken(ctx, w - 22, 58, 14, G - 66, 0.14);
    // the lit sign
    box(ctx, 26, 52, 8, 8, "#2a2d33", 2.5);
    box(ctx, w - 34, 52, 8, 8, "#2a2d33", 2.5);
    rbox(ctx, 4, 4, w - 8, 50, 7, "#ffcf3a", LW);
    rbox(ctx, 14, 12, w - 28, 34, 4, "#fff4b8", 0);
    for (let i = 0; i < 9; i++) {
      circle(ctx, 14 + i * 15.5, 9, 3, "#fffbe8", 1.5);
      circle(ctx, 14 + i * 15.5, 49, 3, "#fffbe8", 1.5);
    }
    fitText(ctx, o.label || "PHOTOS", w / 2, 29, w - 34, 30, "#d42a2a", INK);
  });

  /* Store display: a person-sized orange pill bottle, white cap, a big word on the label (label). */
  sprite("pillBottle", 128, 200, (ctx, w, h, o) => {
    const G = h - 4;
    const amber = "#f08a1c";
    shadow(ctx, w / 2, G, 56);
    rbox(ctx, 16, 52, 96, G - 52, 10, amber, LW);
    const capsule = (x, y, rot) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      rbox(ctx, -12, -5, 24, 10, 5, "#fbfbf6", 2);
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(7, -5);
      ctx.arc(7, 0, 5, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(0, 5);
      ctx.closePath();
      paint(ctx, "#e23a2a", 2);
      ctx.restore();
    };
    onTop(ctx, 16, 52, 96, G - 52, () => {
      [[36, 70, 0.4], [62, 66, -0.2], [90, 72, 0.8], [48, 82, -0.6], [78, 84, 0.1], [34, 176, -0.3], [60, 182, 0.5], [88, 178, -0.1], [102, 186, 1]].forEach(([x, y, r]) => capsule(x, y, r));
      ctx.fillStyle = "rgba(240,138,28,0.35)";
      ctx.fillRect(16, 52, 96, G - 52);
    });
    shine(ctx, 24, 58, 7, G - 66, 0.35);
    darken(ctx, 90, 52, 22, G - 52, 0.16);
    rbox(ctx, 16, 52, 96, G - 52, 10, null, LW);
    // the paper label
    box(ctx, 16, 92, 96, 74, "#fbfbf6", 4);
    box(ctx, 16, 92, 96, 13, "#2f63b8", 3);
    fitText(ctx, o.label || "RX", 64, 132, 78, 40, INK);
    line(ctx, [[28, 156], [100, 156]], "#9aa3ab", 2.5);
    darken(ctx, 96, 92, 16, 74, 0.08);
    // the cap
    rbox(ctx, 22, 44, 84, 12, 4, shade(amber, -24), 3.5);
    rbox(ctx, 10, 8, 108, 40, 6, "#f5f5f2", LW);
    for (let x = 18; x < 112; x += 7) line(ctx, [[x, 18], [x, 44]], "#c9ccd0", 2);
    line(ctx, [[12, 16], [116, 16]], INK, 2.5);
    darken(ctx, 92, 8, 26, 40, 0.12);
    rbox(ctx, 10, 8, 108, 40, 6, null, LW);
  });

  /* ================= Ortiz Auto ================= */

  /* A yellow engine crane on wheels, a chain holding a greasy engine block up in the air. */
  sprite("engineHoist", 216, 200, (ctx, w, h) => {
    const G = h - 4;
    const Y = "#f2c230";
    shadow(ctx, w / 2, G, 98);
    blob(ctx, 172, G - 3, 32, 6, 9, "rgba(15,16,18,0.6)");
    // the base and its casters
    [30, 116, 196].forEach((x) => {
      box(ctx, x - 5, G - 22, 10, 8, "#8d969e", 2.5);
      circle(ctx, x, G - 8, 8, "#1d1f23", 3);
    });
    box(ctx, 14, G - 34, w - 26, 14, Y, LW);
    hazard(ctx, w - 40, G - 34, 28, 14);
    box(ctx, 14, G - 34, w - 26, 14, null, LW);
    // the post, the ram and the boom
    box(ctx, 28, 58, 22, G - 90, Y, LW);
    darken(ctx, 40, 58, 10, G - 90, 0.14);
    bar(ctx, 56, 150, 88, 98, 14, "#c62828", LW);
    bar(ctx, 86, 102, 108, 62, 7, "#dbe2e8", 3.5);
    line(ctx, [[54, 140], [92, 118]], INK, 6);
    rbox(ctx, 86, 112, 14, 10, 3, "#2a2d33", 2.5);
    bar(ctx, 34, 66, 160, 34, 18, Y, LW);
    bar(ctx, 150, 38, 194, 26, 12, shade(Y, -26), LW);
    hazard(ctx, 172, 18, 26, 18);
    bar(ctx, 150, 38, 194, 26, 12, null, LW);
    circle(ctx, 40, 64, 6, "#8d969e", 2.5);
    // the chain and the engine
    for (let y = 36; y < 82; y += 8) {
      ctx.beginPath();
      ctx.ellipse(186, y, (y / 8) % 2 ? 2.5 : 4.5, 5, 0, 0, TAU);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4.5;
      ctx.stroke();
      ctx.strokeStyle = "#b9c0c8";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    line(ctx, [[186, 82], [156, 102]], INK, 3.5);
    line(ctx, [[186, 82], [204, 102]], INK, 3.5);
    ctx.beginPath();
    ctx.arc(186, 86, 6, -Math.PI * 0.2, Math.PI * 1.1);
    inkStroke(ctx, 4);
    const block = "#4a4d52";
    rbox(ctx, 144, 104, 66, 46, 4, block, LW);
    rbox(ctx, 148, 96, 58, 12, 4, "#c62828", 3.5);
    [154, 168, 182, 196].forEach((x) => box(ctx, x, 114, 8, 8, "#2a2d33", 2));
    poly(ctx, [[156, 150], [200, 150], [196, 162], [160, 162]], "#2a2d33", 3.5);
    circle(ctx, 148, 132, 10, "#8d969e", 3);
    circle(ctx, 148, 132, 3.5, INK, 0);
    onTop(ctx, 140, 96, 74, 70, () => {
      [[170, 140, 14, 7, 3], [196, 124, 8, 12, 4], [158, 112, 9, 5, 5]].forEach(([x, y, rx, ry, s]) => blob(ctx, x, y, rx, ry, s, "#141518"));
    });
    darken(ctx, 190, 96, 22, 70, 0.14);
    [[166, 172, 4], [182, 178, 3.5], [196, 170, 3]].forEach(([x, y, r]) => {
      poly(ctx, [[x, y - r * 2.6], [x + r, y], [x - r, y]], INK, 0);
      circle(ctx, x, y, r, INK, 0);
    });
  });

  /* A tall rolling tool chest: many drawers, one hanging open with tools inside (color = paint). */
  sprite("toolChest", 144, 200, (ctx, w, h, o) => {
    const c = hue(o, "#c0392b");
    const G = h - 4;
    const chrome = "#dbe2e8";
    shadow(ctx, w / 2, G, 66);
    [30, 112].forEach((x) => {
      box(ctx, x - 6, G - 24, 12, 10, "#8d969e", 2.5);
      circle(ctx, x, G - 8, 9, "#1d1f23", 3);
    });
    // the cabinet and the chest on top
    box(ctx, 14, 74, 116, G - 98, c, LW);
    poly(ctx, [[130, 74], [138, 68], [138, G - 28], [130, G - 24]], shade(c, -55), LW);
    box(ctx, 10, 22, 124, 52, c, LW);
    poly(ctx, [[134, 22], [140, 18], [140, 70], [134, 74]], shade(c, -55), LW);
    rbox(ctx, 10, 8, 124, 18, 6, shade(c, 25), LW);
    tube(ctx, [[48, 8], [96, 8]], chrome, 3);
    const drawer = (y, dh) => {
      box(ctx, 18, y, 108, dh, shade(c, -8), 3);
      box(ctx, 34, y + dh / 2 - 2, 76, 4.5, chrome, 2);
    };
    drawer(28, 12);
    drawer(42, 12);
    drawer(56, 13);
    drawer(80, 14);
    drawer(96, 14);
    drawer(132, 16);
    drawer(150, 22);
    // the open drawer, hanging out of its slot
    box(ctx, 18, 112, 108, 18, "#1d1f23", 3);
    poly(ctx, [[18, 114], [120, 118], [128, 130], [10, 124]], "#2a2d33", 3);
    line(ctx, [[34, 116], [56, 104]], "#b9c0c8", 5);
    circle(ctx, 58, 103, 5, null, 0);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.stroke();
    line(ctx, [[74, 118], [96, 108]], INK, 5);
    line(ctx, [[74, 118], [96, 108]], "#ffd23a", 3);
    poly(ctx, [[10, 124], [128, 130], [126, 148], [8, 142]], c, LW);
    line(ctx, [[34, 136], [104, 139]], chrome, 4);
    line(ctx, [[14, 124], [126, 130]], "rgba(255,255,255,0.35)", 3);
    darken(ctx, 96, 8, 46, G - 30, 0.12);
    tube(ctx, [[140, 82], [144, 82], [144, 126], [140, 126]], chrome, 3);
    line(ctx, [[14, 26], [128, 26]], "rgba(255,255,255,0.4)", 3);
  });

  /* A soda machine: a lit front panel with the brand word, a column of can buttons (color = body, label = brand). */
  sprite("vending", 136, 216, (ctx, w, h, o) => {
    const c = hue(o, "#c0392b");
    const G = h - 4;
    shadow(ctx, w / 2, G, 64);
    box(ctx, 14, G - 8, 14, 8, "#1d1f23", 2.5);
    box(ctx, w - 28, G - 8, 14, 8, "#1d1f23", 2.5);
    rbox(ctx, 6, 4, w - 16, G - 10, 6, c, LW);
    poly(ctx, [[w - 10, 8], [w - 4, 12], [w - 4, G - 8], [w - 10, G - 6]], shade(c, -55), 3.5);
    // the lit panel: the word, three cans
    rbox(ctx, 14, 12, 80, 140, 4, "#fff4cf", 3.5);
    rbox(ctx, 18, 16, 72, 132, 3, "#fffbea", 0);
    fitText(ctx, o.label || "SODA", 54, 38, 70, 34, c, INK);
    ctx.beginPath();
    ctx.moveTo(18, 62);
    ctx.quadraticCurveTo(40, 52, 54, 62);
    ctx.quadraticCurveTo(70, 72, 90, 60);
    ctx.lineTo(90, 66);
    ctx.quadraticCurveTo(70, 78, 54, 68);
    ctx.quadraticCurveTo(40, 58, 18, 68);
    ctx.closePath();
    paint(ctx, c, 2);
    [30, 54, 78].forEach((x) => {
      rbox(ctx, x - 10, 80, 20, 42, 4, c, 3);
      oval(ctx, x, 81, 9, 3, "#d9dde1", 2);
      line(ctx, [[x - 8, 104], [x - 2, 98], [x + 8, 102]], "#ffffff", 3);
      shine(ctx, x - 6, 86, 3, 30, 0.45);
    });
    fitText(ctx, "ICE COLD", 54, 136, 64, 13, "#1f6fd1");
    // the buttons, the coin plate, the drop slot
    rbox(ctx, 98, 12, 26, 104, 3, "#2a2d33", 3);
    ["#e23a2a", "#2f7de0", "#3fae49", "#ff8a1f", "#8a4fd0", "#ffd23a"].forEach((bc, i) => {
      rbox(ctx, 101, 16 + i * 16.5, 20, 13, 2, "#f3f3ee", 2);
      box(ctx, 104, 18 + i * 16.5, 5, 9, bc, 1.5);
    });
    rbox(ctx, 99, 122, 24, 30, 3, "#c9d0d7", 2.5);
    box(ctx, 109, 127, 4, 10, INK, 0);
    circle(ctx, 111, 144, 3, "#2a2d33", 0);
    rbox(ctx, 16, 164, 76, 30, 4, "#1d1f23", 3.5);
    rbox(ctx, 21, 168, 66, 18, 3, "#4a4f57", 2.5);
    fitText(ctx, "PUSH", 54, 177, 40, 11, "#d5dce2");
    shine(ctx, 10, 10, 3, G - 24, 0.35);
    darken(ctx, w - 22, 4, 18, G, 0.1);
  });

  /* A cluster of dented steel drums, a stencil word on each (color = paint, label = word). */
  sprite("drums", 232, 176, (ctx, w, h, o) => {
    const c = hue(o, "#2f5f9a");
    const word = o.label || "OIL";
    const G = h - 4;
    shadow(ctx, w / 2, G, 112);
    const drum = (x, y, dw, dh, col, dent, showWord) => {
      const cx = x + dw / 2;
      const bodyPath = () => {
        ctx.beginPath();
        ctx.moveTo(x, y + 8);
        ctx.lineTo(x, y + dh - 6);
        ctx.ellipse(cx, y + dh - 6, dw / 2, 6, 0, Math.PI, 0, true);
        ctx.lineTo(x + dw, y + 8);
        ctx.closePath();
      };
      bodyPath();
      paint(ctx, col, 0);
      onTop(ctx, x - 2, y, dw + 4, dh + 2, () => {
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(x + dw * 0.14, y, 7, dh);
        ctx.fillStyle = "rgba(15,16,18,0.24)";
        ctx.fillRect(x + dw * 0.7, y, dw * 0.32, dh);
        if (dent) {
          blob(ctx, x + dw * dent, y + dh * 0.72, 12, 10, 31 + x, "rgba(15,16,18,0.35)");
          line(ctx, [[x + dw * dent - 8, y + dh * 0.62], [x + dw * dent + 4, y + dh * 0.66]], "rgba(255,255,255,0.5)", 2.5);
        }
      });
      dots(ctx, x + dw * 0.7, y, dw * 0.32, dh, 0.16);
      [0.34, 0.74].forEach((f) => {
        ctx.beginPath();
        ctx.ellipse(cx, y + dh * f, dw / 2, 6, 0, 0, Math.PI);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.strokeStyle = shade(col, 35);
        ctx.lineWidth = 3;
        ctx.stroke();
      });
      if (showWord) fitText(ctx, word, cx, y + dh * 0.54, dw - 18, dh * 0.24, "#f3f1ea");
      bodyPath();
      paint(ctx, null, LW);
      oval(ctx, cx, y + 8, dw / 2, 7, shade(col, 22), 3.5);
      oval(ctx, cx, y + 8, dw / 2 - 7, 4, null, 0);
      ctx.strokeStyle = shade(col, -40);
      ctx.lineWidth = 2;
      ctx.stroke();
      oval(ctx, cx + dw * 0.22, y + 7, 5, 2.5, "#c9d0d7", 2);
    };
    const back = shade(c, -30);
    drum(40, 4, 74, 110, back, 0, false);
    drum(118, 8, 74, 106, back, 0.3, false);
    drum(4, 52, 74, G - 52, c, 0, true);
    drum(79, 54, 74, G - 54, c, 0.62, true);
    drum(154, 50, 74, G - 50, c, 0, true);
  });

  /* ================= Signal Electronics ================= */

  /* A wide pyramid of old box TVs, every screen gray static, one showing color bars (foot 3 x 1). */
  sprite("tvWall", 504, 168, (ctx, w, h) => {
    const G = h - 4;
    shadow(ctx, w / 2, G, 244);
    const casings = ["#7a5232", "#8d939a", "#cdbf9c", "#3a3d43", "#a0703f", "#6b7480"];
    let seed = 1;
    const tv = (x, y, tw, th, casing, bars) => {
      rbox(ctx, x, y, tw, th, 6, casing, 4);
      const sx = x + 6;
      const sy = y + 6;
      const sw = Math.round(tw * 0.68);
      const sh = th - 12;
      rbox(ctx, sx, sy, sw, sh, 8, "#aeb6bd", 3.5);
      const r = rng(seed++ * 97);
      onTop(ctx, sx, sy, sw, sh, () => {
        if (bars) {
          ["#f2f2f2", "#ffd23a", "#2fd5ff", "#3fae49", "#e86fb4", "#e23a2a", "#2f63b8"].forEach((bc, i) => {
            ctx.fillStyle = bc;
            ctx.fillRect(sx + (i * sw) / 7, sy, sw / 7 + 1, sh * 0.72);
          });
          ctx.fillStyle = "#1d1f23";
          ctx.fillRect(sx, sy + sh * 0.72, sw, sh);
        } else {
          const greys = ["#6f777e", "#9aa3aa", "#c6ccd1", "#e9edf0", "#4e555c"];
          for (let yy = sy; yy < sy + sh; yy += 3) {
            for (let xx = sx; xx < sx + sw; xx += 3) {
              ctx.fillStyle = greys[(r() * greys.length) | 0];
              ctx.fillRect(xx, yy, 3, 3);
            }
          }
          ctx.fillStyle = "rgba(170,205,230,0.25)";
          ctx.fillRect(sx, sy, sw, sh);
        }
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        for (let yy = sy + 1; yy < sy + sh; yy += 4) ctx.fillRect(sx, yy, sw, 1.5);
        line(ctx, [[sx + 6, sy + sh - 8], [sx + sw * 0.45, sy + 4]], "rgba(255,255,255,0.4)", 4);
      });
      rbox(ctx, sx, sy, sw, sh, 8, null, 3.5);
      const kx = x + tw * 0.86;
      circle(ctx, kx, y + th * 0.28, 5, "#2a2d33", 2.5);
      circle(ctx, kx, y + th * 0.52, 4, "#2a2d33", 2.5);
      for (let k = 0; k < 3; k++) line(ctx, [[kx - 6, y + th * 0.7 + k * 4], [kx + 6, y + th * 0.7 + k * 4]], INK, 1.5);
      darken(ctx, x + tw - 10, y, 10, th, 0.12);
    };
    for (let i = 0; i < 6; i++) tv(12 + i * 80, G - 54, 80, 54, casings[i % 6], false);
    for (let i = 0; i < 5; i++) tv(52 + i * 80, G - 106, 80, 52, casings[(i + 3) % 6], i === 3);
    for (let i = 0; i < 3; i++) tv(134 + i * 80, G - 154, 76, 48, casings[(i + 1) % 6], false);
    // rabbit ears on the top middle one
    line(ctx, [[252, 14], [232, 2]], INK, 3);
    line(ctx, [[252, 14], [276, 3]], INK, 3);
    circle(ctx, 232, 3, 3, "#c9d0d7", 2);
    circle(ctx, 276, 4, 3, "#c9d0d7", 2);
    oval(ctx, 252, 14, 8, 4, "#2a2d33", 2.5);
  });

  /* The store's robot mascot: silver box body, round red eyes, one arm waving, a word on its chest (label). */
  sprite("robotMascot", 160, 208, (ctx, w, h, o) => {
    const G = h - 4;
    const silver = "#c4ccd6";
    const dark = "#8d97a3";
    shadow(ctx, 80, G, 62);
    rbox(ctx, 40, G - 14, 36, 14, 4, dark, LW);
    rbox(ctx, 86, G - 14, 36, 14, 4, dark, LW);
    box(ctx, 48, 160, 20, G - 172, silver, LW);
    box(ctx, 94, 160, 20, G - 172, silver, LW);
    // the arms: one down, one up and waving
    tube(ctx, [[36, 98], [18, 124], [20, 150]], silver, 9);
    oval(ctx, 16, 158, 6, 9, dark, 3, 0.2);
    oval(ctx, 26, 158, 6, 9, dark, 3, -0.2);
    tube(ctx, [[126, 98], [146, 80], [140, 44]], silver, 9);
    rbox(ctx, 128, 16, 24, 28, 9, silver, LW);
    rbox(ctx, 122, 28, 10, 10, 5, silver, 3);
    [12, 18].forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(140, 30, r + 8, -0.9 - i * 0.1, -0.2);
      inkStroke(ctx, 3);
    });
    // the body and chest screen
    rbox(ctx, 34, 86, 94, 80, 6, silver, LW);
    shine(ctx, 40, 92, 82, 4, 0.55);
    rbox(ctx, 46, 98, 70, 42, 4, "#1d2b4a", 3.5);
    fitText(ctx, o.label || "SIG", 81, 119, 58, 30, "#ffd23a", INK);
    ["#e23a2a", "#ffd23a", "#3fae49", "#2f7de0"].forEach((bc, i) => circle(ctx, 54 + i * 18, 152, 5, bc, 2.5));
    [[40, 92], [122, 92], [40, 160], [122, 160]].forEach(([x, y]) => circle(ctx, x, y, 2, INK, 0));
    darken(ctx, 104, 86, 26, 80, 0.12);
    // neck, head, eyes, antenna
    box(ctx, 70, 78, 22, 10, dark, 3.5);
    rbox(ctx, 46, 26, 70, 54, 8, silver, LW);
    circle(ctx, 46, 52, 6, dark, 3);
    circle(ctx, 116, 52, 6, dark, 3);
    [66, 96].forEach((x) => {
      circle(ctx, x, 49, 12, "#ff3b30", 3.5);
      circle(ctx, x, 49, 5, "#ffd0c8", 0);
      circle(ctx, x - 4, 45, 2.5, "#ffffff", 0);
    });
    rbox(ctx, 64, 66, 34, 8, 2, "#2a2d33", 2.5);
    [72, 80, 88].forEach((x) => line(ctx, [[x, 67], [x, 73]], "#8d97a3", 1.5));
    darken(ctx, 96, 26, 20, 54, 0.1);
    tube(ctx, [[81, 26], [81, 12]], dark, 3);
    circle(ctx, 81, 9, 6, "#ff3b30", 3);
  });

  /* A tall arcade cabinet: lit marquee, glowing screen, red joystick and two buttons. */
  sprite("arcade", 128, 216, (ctx, w, h) => {
    const G = h - 4;
    const body = "#2b2340";
    shadow(ctx, w / 2, G, 58);
    poly(ctx, [[114, 44], [122, 50], [122, G - 2], [114, G - 2]], "#1a1528", LW);
    box(ctx, 14, 44, 100, G - 46, body, LW);
    line(ctx, [[18, 48], [18, G - 6]], "#ff3fa4", 4);
    line(ctx, [[110, 48], [110, G - 6]], "#2fd5ff", 4);
    // the screen
    box(ctx, 20, 50, 88, 78, "#111216", 4);
    rbox(ctx, 27, 56, 74, 66, 6, "#14244a", 3);
    onTop(ctx, 27, 56, 74, 66, () => {
      const alien = ["01011010", "11111111", "11011011", "11111111", "00100100", "01000010"];
      const drawAlien = (ax, ay, col) => {
        ctx.fillStyle = col;
        alien.forEach((row, j) => row.split("").forEach((b, i) => b === "1" && ctx.fillRect(ax + i * 1.6, ay + j * 1.6, 1.6, 1.6)));
      };
      for (let i = 0; i < 4; i++) drawAlien(33 + i * 16, 64, "#e86fb4");
      for (let i = 0; i < 4; i++) drawAlien(37 + i * 16, 78, "#ffd23a");
      ctx.fillStyle = "#3fe06a";
      ctx.fillRect(58, 108, 14, 5);
      ctx.fillRect(63, 104, 4, 4);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(64, 92, 2, 6);
      [[36, 98], [90, 70], [84, 104], [46, 112]].forEach(([x, y]) => ctx.fillRect(x, y, 2, 2));
      ctx.fillStyle = "rgba(120,180,255,0.18)";
      ctx.fillRect(27, 56, 74, 66);
    });
    line(ctx, [[34, 62], [46, 58]], "rgba(255,255,255,0.4)", 3);
    // the control panel
    poly(ctx, [[8, 132], [120, 132], [114, 154], [14, 154]], "#3a3f8a", LW);
    box(ctx, 14, 154, 100, 8, "#252a63", 3.5);
    line(ctx, [[38, 146], [36, 128]], INK, 5);
    circle(ctx, 36, 125, 8, "#e23a2a", 3);
    shine(ctx, 32, 121, 4, 3, 0.7);
    circle(ctx, 72, 142, 6.5, "#ffd23a", 3);
    circle(ctx, 92, 139, 6.5, "#2fd5ff", 3);
    // the coin door
    rbox(ctx, 40, 170, 48, 32, 3, "#4a4f57", 3.5);
    box(ctx, 48, 177, 10, 14, "#ff7a1a", 2);
    box(ctx, 70, 177, 10, 14, "#ff7a1a", 2);
    // the marquee
    rbox(ctx, 8, 6, 112, 40, 4, "#ffcf3a", LW);
    rbox(ctx, 14, 11, 100, 30, 3, "#fff1a8", 0);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      line(ctx, [[64 + Math.cos(a) * 14, 26 + Math.sin(a) * 8], [64 + Math.cos(a) * 44, 26 + Math.sin(a) * 14]], "#ffb02e", 3);
    }
    fitText(ctx, "ZAP!", 64, 26, 84, 28, "#e23a2a", INK);
  });

  /* A big gray satellite dish on a tripod, tilted up, a red light at the end of its arm. */
  sprite("satDish", 208, 208, (ctx, w, h) => {
    const G = h - 4;
    const steel = "#8d969e";
    shadow(ctx, w / 2, G, 90);
    tube(ctx, [[104, 140], [112, G - 12]], shade(steel, -30), 6);
    tube(ctx, [[104, 140], [26, G - 2]], steel, 7);
    tube(ctx, [[104, 140], [184, G - 2]], steel, 7);
    line(ctx, [[54, 174], [158, 174]], "#5d656e", 4);
    box(ctx, 18, G - 6, 18, 6, "#2a2d33", 2.5);
    box(ctx, 176, G - 6, 18, 6, "#2a2d33", 2.5);
    box(ctx, 92, 120, 24, 26, "#6b737c", LW);
    bar(ctx, 100, 124, 92, 90, 12, "#6b737c", 3.5);
    // the dish, seen into its bowl
    ctx.save();
    ctx.translate(98, 78);
    ctx.rotate(0.72);
    oval(ctx, 0, 0, 88, 54, "#e1e5e9", LW);
    oval(ctx, -2, 8, 74, 42, "#c3cad1", 0);
    oval(ctx, -4, 14, 58, 32, "#b2bac2", 0);
    ctx.strokeStyle = "rgba(15,16,18,0.25)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(Math.cos(a) * 84, Math.sin(a) * 50);
      ctx.stroke();
    }
    dots(ctx, -90, 10, 180, 50, 0.14);
    oval(ctx, 0, 0, 88, 54, null, LW);
    ctx.beginPath();
    ctx.ellipse(0, 0, 80, 47, 0, Math.PI * 1.1, Math.PI * 1.5);
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 4;
    ctx.stroke();
    // three struts from the rim to the feed horn out in front of the bowl, a red light on it
    [Math.PI / 2, (Math.PI * 7) / 6, (Math.PI * 11) / 6].forEach((a) => tube(ctx, [[Math.cos(a) * 84, Math.sin(a) * 50], [0, -28]], "#9aa1a9", 3.5));
    rbox(ctx, -10, -40, 20, 20, 5, "#4a4f57", 3.5);
    circle(ctx, 0, -44, 15, "rgba(255,59,48,0.3)", 0);
    circle(ctx, 0, -44, 7, "#ff3b30", 3);
    circle(ctx, -2, -46, 2.5, "#ffffff", 0);
    ctx.restore();
  });

  /* ================= Greenhouse Row (open roof: these go above one tile) ================= */

  /* A scarecrow on a pole: straw hat, plaid shirt, button eyes, a crow on its shoulder. */
  sprite("scarecrow", 192, 256, (ctx, w, h) => {
    const G = h - 4;
    shadow(ctx, w / 2, G, 52);
    oval(ctx, 96, G - 4, 40, 8, "#7a5a3a", 3.5);
    box(ctx, 90, 90, 12, G - 94, "#8a5a2e", LW);
    // straw sticking out
    const straw = (x, y, dir, n) => {
      for (let i = 0; i < n; i++) {
        const a = dir + (i - (n - 1) / 2) * 0.28;
        line(ctx, [[x, y], [x + Math.cos(a) * 18, y + Math.sin(a) * 18]], INK, 6);
        line(ctx, [[x, y], [x + Math.cos(a) * 18, y + Math.sin(a) * 18]], "#f2c94c", 3);
      }
    };
    straw(80, 220, Math.PI / 2, 4);
    straw(110, 220, Math.PI / 2, 4);
    straw(18, 106, Math.PI, 5);
    straw(174, 106, 0, 5);
    // the jeans
    poly(ctx, [[70, 166], [95, 166], [92, 222], [72, 224]], "#3f6aa8", LW);
    poly(ctx, [[97, 166], [122, 166], [120, 224], [100, 222]], "#3f6aa8", LW);
    box(ctx, 76, 196, 12, 12, "#e2b84a", 2.5);
    // the plaid shirt
    const torso = [[62, 92], [130, 92], [136, 176], [120, 170], [106, 178], [92, 170], [78, 178], [58, 172]];
    const sleeveL = [[66, 94], [18, 92], [16, 120], [66, 122]];
    const sleeveR = [[126, 94], [174, 92], [176, 120], [126, 122]];
    const plaid = (pts) => {
      poly(ctx, pts, "#c0392b", 0);
      inside(ctx, pts, () => {
        ctx.fillStyle = "rgba(90,15,10,0.45)";
        for (let x = 0; x < w; x += 18) ctx.fillRect(x, 80, 7, 110);
        for (let y = 86; y < 190; y += 18) ctx.fillRect(0, y, w, 7);
        ctx.fillStyle = "#f2c230";
        for (let x = 12; x < w; x += 18) ctx.fillRect(x, 80, 2, 110);
        for (let y = 98; y < 190; y += 18) ctx.fillRect(0, y, w, 2);
      });
      poly(ctx, pts, null, LW);
    };
    plaid(sleeveL);
    plaid(sleeveR);
    plaid(torso);
    box(ctx, 100, 128, 18, 18, "#3f6aa8", 2.5);
    [[103, 131], [115, 131], [103, 143], [115, 143]].forEach(([x, y]) => line(ctx, [[x - 2, y - 2], [x + 2, y + 2]], "#f3eee0", 1.5));
    darken(ctx, 116, 90, 64, 90, 0.1);
    // the sack head
    straw(96, 90, Math.PI / 2, 3);
    circle(ctx, 96, 62, 30, "#d9b77a", LW);
    dots(ctx, 66, 32, 60, 60, 0.12);
    rbox(ctx, 78, 84, 36, 9, 4, "#a07a3a", 3);
    [84, 108].forEach((x) => {
      circle(ctx, x, 58, 8.5, "#2a2d33", 3);
      [[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]].forEach(([dx, dy]) => circle(ctx, x + dx, 58 + dy, 1.4, "#d9b77a", 0));
    });
    poly(ctx, [[96, 62], [90, 72], [102, 72]], "#e8761a", 2.5);
    line(ctx, [[78, 78], [114, 78]], INK, 2.5);
    for (let x = 81; x < 114; x += 6) line(ctx, [[x, 74], [x + 2, 82]], INK, 2);
    // the straw hat
    oval(ctx, 96, 38, 56, 11, "#e2b84a", LW, -0.08);
    const crown = [[70, 38], [74, 14], [96, 6], [118, 12], [122, 36]];
    poly(ctx, crown, "#e2b84a", LW);
    inside(ctx, crown, () => box(ctx, 60, 26, 70, 9, "#c0392b", 0));
    poly(ctx, crown, null, LW);
    line(ctx, [[52, 42], [44, 46]], INK, 2.5);
    line(ctx, [[140, 36], [150, 38]], INK, 2.5);
    // the crow on its shoulder
    poly(ctx, [[40, 84], [22, 92], [26, 80]], "#1d1f23", 2.5);
    oval(ctx, 46, 80, 15, 10, "#1d1f23", 3, -0.3);
    circle(ctx, 58, 68, 8, "#1d1f23", 3);
    poly(ctx, [[64, 66], [76, 69], [64, 72]], "#f2c230", 2.5);
    circle(ctx, 60, 66, 2, "#ffffff", 0);
    line(ctx, [[44, 89], [44, 94]], INK, 2.5);
    line(ctx, [[50, 89], [52, 94]], INK, 2.5);
  });

  /* A tall coconut palm in a big terracotta pot: a ringed trunk with a gentle lean, coconuts
     under the crown and long feather fronds that arch up and droop like a fountain, each a
     midrib with a comb of thin leaflets down both sides (not broad blades: those read as some
     other plant from across the room). */
  sprite("palmTree", 272, 320, (ctx, w, h) => {
    const G = h - 4;
    const cx = w / 2;
    shadow(ctx, cx, G, 72);
    // the pot
    poly(ctx, [[cx - 44, 274], [cx + 44, 274], [cx + 34, G], [cx - 34, G]], "#c8653a", LW);
    line(ctx, [[cx - 38, 295], [cx + 38, 295]], "#9a4a26", 4);
    darken(ctx, cx + 12, 274, 34, G - 274, 0.14);
    rbox(ctx, cx - 54, 258, 108, 20, 6, "#d97a4a", LW);
    oval(ctx, cx, 262, 44, 5, "#3f2c1e", 3);
    // the trunk: stacked rings along a curve, each ring a little wider at its top (the notched
    // palm edge), the far side in shadow
    const P0 = [cx - 2, 264];
    const P1 = [cx - 36, 180];
    const P2 = [cx, 96];
    const at = (t) => [(1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0], (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1]];
    const RINGS = 12;
    const edgeL = [];
    const edgeR = [];
    for (let k = 0; k < RINGS; k++) {
      const t0 = k / RINGS;
      const t1 = (k + 1) / RINGS;
      const [x0, y0] = at(t0);
      const [x1, y1] = at(t1);
      const len = Math.hypot(x1 - x0, y1 - y0) || 1;
      const nx = -(y1 - y0) / len;
      const ny = (x1 - x0) / len;
      const r0 = 18 - 6.5 * t0 - 2;
      const r1 = 18 - 6.5 * t1 + 3;
      const a = [x0 - nx * r0, y0 - ny * r0];
      const b = [x1 - nx * r1, y1 - ny * r1];
      const c = [x1 + nx * r1, y1 + ny * r1];
      const d = [x0 + nx * r0, y0 + ny * r0];
      poly(ctx, [a, b, c, d], k % 2 ? "#9a6a3a" : "#b07d46", 0);
      poly(ctx, [[x0 + nx * r0 * 0.3, y0 + ny * r0 * 0.3], [x1 + nx * r1 * 0.3, y1 + ny * r1 * 0.3], c, d], "rgba(15,16,18,0.2)", 0);
      line(ctx, [b, c], INK, 3);
      edgeL.push(a, b);
      edgeR.push(d, c);
    }
    line(ctx, edgeL, INK, LW);
    line(ctx, edgeR, INK, LW);
    line(ctx, [0.12, 0.3, 0.5, 0.7].map((t) => at(t)).map(([x, y]) => [x - 8, y]), "rgba(255,255,255,0.3)", 3);

    const crown = [P2[0], P2[1] - 2];
    /* One frond: the midrib leaves the crown at `deg` (0 = right, -90 = straight up) and bends
       toward the ground along its length (`bend` radians by the tip); thin leaflets comb out
       of both sides, slanting toward the tip, longest a third of the way out, hanging a little. */
    const frond = (deg, len, bend, col) => {
      const a0 = (deg * Math.PI) / 180;
      const side = Math.cos(a0) < 0 ? -1 : 1;
      const N = Math.round(len / 6.5);
      const rib = [];
      let x = crown[0];
      let y = crown[1];
      for (let i = 0; i <= N; i++) {
        const s = i / N;
        const a = a0 + side * bend * Math.pow(s, 1.2);
        rib.push([x, y, a, s]);
        x += (Math.cos(a) * len) / N;
        y += (Math.sin(a) * len) / N;
      }
      ctx.beginPath();
      rib.forEach(([px, py, a, s], i) => {
        if (i < 2) return;
        const l = 30 * (s < 0.33 ? 0.45 + 1.65 * s : 1.05 - (s - 0.33) * 1.1);
        [-1, 1].forEach((sd) => {
          let dx = Math.cos(a + sd * 1.0);
          let dy = Math.sin(a + sd * 1.0) + 0.75;
          const m = Math.hypot(dx, dy) || 1;
          dx /= m;
          dy /= m;
          const hw = 2.1;
          const qx = px + dx * l;
          const qy = py + dy * l;
          const mx = (px + qx) / 2;
          const my = (py + qy) / 2 + l * 0.08;
          ctx.moveTo(px - dy * hw, py + dx * hw);
          ctx.quadraticCurveTo(mx - dy * hw * 0.7, my + dx * hw * 0.7, qx, qy);
          ctx.quadraticCurveTo(mx + dy * hw * 0.7, my - dx * hw * 0.7, px + dy * hw, py - dx * hw);
          ctx.closePath();
        });
      });
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4.5;
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.fill();
      const ribPts = rib.map(([px, py]) => [px, py]);
      line(ctx, ribPts, INK, 7);
      line(ctx, ribPts, mix(col, "#f2e27a", 0.45), 3);
    };
    // four pairs of fronds, the back ones darker: up and over, out and down, and the long low
    // ones drooping well below the crown
    const back = "#2f7d32";
    const front = "#48a843";
    frond(-98, 96, 1.5, back);
    frond(-82, 96, 1.5, back);
    frond(-145, 118, 1.8, back);
    frond(-35, 118, 1.8, back);
    frond(-125, 110, 1.9, front);
    frond(-55, 110, 1.9, front);
    frond(-172, 140, 1.85, front);
    frond(-8, 140, 1.85, front);
    // the coconuts, bunched under the crown
    [[crown[0] - 12, crown[1] + 9], [crown[0] + 12, crown[1] + 10], [crown[0] + 1, crown[1] + 21]].forEach(([x, y], i) => {
      circle(ctx, x, y, 12, i === 2 ? "#5e3d1c" : "#74502a", 3.5);
      ctx.beginPath();
      ctx.arc(x, y, 7, Math.PI * 1.05, Math.PI * 1.55);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });
  });

  /* A garden gnome as tall as a person: red pointy hat, white beard, blue coat. */
  sprite("gnome", 144, 256, (ctx, w, h) => {
    const G = h - 4;
    shadow(ctx, w / 2, G, 56);
    oval(ctx, 72, G - 8, 56, 10, "#4f8f3a", LW);
    rbox(ctx, 30, 222, 40, 22, 9, "#6b4526", LW);
    rbox(ctx, 74, 222, 40, 22, 9, "#6b4526", LW);
    // the coat, belt and sleeves
    const coat = [[46, 110], [98, 110], [124, 230], [20, 230]];
    poly(ctx, coat, "#2f63b8", LW);
    inside(ctx, coat, () => {
      box(ctx, 10, 186, 124, 13, "#5a3a22", 0);
      line(ctx, [[10, 186], [134, 186]], INK, 3);
      line(ctx, [[10, 199], [134, 199]], INK, 3);
    });
    rbox(ctx, 60, 182, 24, 20, 3, "#f2c230", 3.5);
    rbox(ctx, 66, 187, 12, 10, 2, "#5a3a22", 2);
    darken(ctx, 92, 110, 34, 122, 0.14);
    poly(ctx, [[48, 118], [24, 168], [40, 176], [58, 132]], shade("#2f63b8", -20), LW);
    poly(ctx, [[96, 118], [120, 168], [104, 176], [86, 132]], shade("#2f63b8", -20), LW);
    circle(ctx, 30, 176, 10, "#f2b8a0", 3.5);
    circle(ctx, 114, 176, 10, "#f2b8a0", 3.5);
    // face, beard, nose
    circle(ctx, 72, 100, 22, "#f2c0a6", LW);
    ctx.beginPath();
    ctx.moveTo(42, 104);
    ctx.quadraticCurveTo(34, 130, 46, 150);
    ctx.quadraticCurveTo(54, 176, 72, 196);
    ctx.quadraticCurveTo(90, 176, 98, 150);
    ctx.quadraticCurveTo(110, 130, 102, 104);
    ctx.quadraticCurveTo(92, 120, 72, 118);
    ctx.quadraticCurveTo(52, 120, 42, 104);
    ctx.closePath();
    paint(ctx, "#f4f4f0", LW);
    [[56, 138, 64, 160], [72, 140, 72, 172], [88, 138, 80, 160]].forEach(([a, b, c, d]) => line(ctx, [[a, b], [c, d]], "#b9c0c8", 3));
    oval(ctx, 60, 118, 14, 7, "#f4f4f0", 3, 0.25);
    oval(ctx, 84, 118, 14, 7, "#f4f4f0", 3, -0.25);
    circle(ctx, 72, 110, 11, "#e8857a", 3.5);
    shine(ctx, 67, 105, 4, 3, 0.7);
    circle(ctx, 62, 96, 3, INK, 0);
    circle(ctx, 82, 96, 3, INK, 0);
    oval(ctx, 54, 104, 5, 3, "rgba(230,110,110,0.5)", 0);
    oval(ctx, 90, 104, 5, 3, "rgba(230,110,110,0.5)", 0);
    // the hat, its tip bent over
    ctx.beginPath();
    ctx.moveTo(30, 92);
    ctx.quadraticCurveTo(44, 40, 82, 10);
    ctx.quadraticCurveTo(102, 2, 112, 18);
    ctx.quadraticCurveTo(96, 14, 92, 30);
    ctx.quadraticCurveTo(102, 60, 114, 92);
    ctx.closePath();
    paint(ctx, "#d62828", LW);
    darken(ctx, 84, 4, 34, 90, 0.14);
    rbox(ctx, 26, 84, 92, 14, 7, "#b81f1f", LW);
    shine(ctx, 50, 50, 5, 26, 0.35);
  });

  /* A stack of white wooden beehive boxes on a pallet, a brick on the lid, bees about. */
  sprite("beehives", 176, 224, (ctx, w, h) => {
    const G = h - 4;
    shadow(ctx, w / 2, G, 84);
    [10, 78, 146].forEach((x) => box(ctx, x, G - 18, 20, 18, "#8a5a2e", 3.5));
    box(ctx, 6, G - 26, 164, 9, "#b07a43", LW);
    const hive = (x, y, bw, bh) => {
      box(ctx, x, y, bw, bh, "#f3efe4", LW);
      for (let yy = y + 9; yy < y + bh - 4; yy += 9) line(ctx, [[x + 6, yy], [x + bw - 6, yy]], "rgba(15,16,18,0.08)", 2);
      rbox(ctx, x + bw / 2 - 18, y + bh / 2 - 5, 36, 9, 4, "#cfc6b0", 2.5);
    };
    hive(20, 138, 136, 56);
    hive(22, 98, 132, 40);
    hive(20, 62, 136, 36);
    box(ctx, 54, 184, 68, 7, INK, 0);
    poly(ctx, [[46, 194], [130, 194], [138, 200], [38, 200]], "#d9cfb8", 3);
    ctx.beginPath();
    ctx.moveTo(78, 190);
    ctx.quadraticCurveTo(80, 198, 76, 204);
    ctx.quadraticCurveTo(82, 208, 84, 200);
    ctx.quadraticCurveTo(84, 196, 88, 190);
    ctx.closePath();
    paint(ctx, "#f2a81d", 2);
    darken(ctx, 120, 44, 40, 152, 0.12);
    // the lid and the brick on it
    rbox(ctx, 12, 44, 152, 20, 3, "#d5dce2", LW);
    line(ctx, [[16, 56], [160, 56]], "#9aa1a9", 2.5);
    box(ctx, 64, 24, 48, 20, "#b5452e", LW);
    line(ctx, [[64, 34], [112, 34]], "#7a2a1a", 2);
    line(ctx, [[88, 24], [88, 34]], "#7a2a1a", 2);
    // the bees and their loops
    const bee = (x, y, s, rot) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(s, s);
      oval(ctx, -2, -8, 6, 5, "rgba(255,255,255,0.8)", 2, -0.4);
      oval(ctx, 4, -8, 6, 5, "rgba(255,255,255,0.8)", 2, 0.4);
      oval(ctx, 0, 0, 11, 7, "#f2c230", 0);
      inside(ctx, [[-12, -8], [12, -8], [12, 8], [-12, 8]], () => {
        box(ctx, -4, -8, 4, 16, INK, 0);
        box(ctx, 4, -8, 4, 16, INK, 0);
      });
      oval(ctx, 0, 0, 11, 7, null, 2.5);
      poly(ctx, [[-11, -2], [-17, 0], [-11, 2]], INK, 0);
      circle(ctx, 9, -2, 1.6, INK, 0);
      ctx.restore();
    };
    ctx.save();
    ctx.setLineDash([3, 6]);
    [[[14, 120], [4, 80], [26, 46]], [[160, 168], [174, 120], [150, 100]], [[124, 18], [148, 4], [164, 30]]].forEach(([a, c, b]) => {
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.quadraticCurveTo(c[0], c[1], b[0], b[1]);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.restore();
    bee(26, 40, 1, -0.3);
    bee(152, 96, 1, 0.4);
    bee(164, 36, 0.9, 0.2);
    bee(16, 126, 0.9, -0.5);
    bee(30, 14, 0.8, 0.3);
    bee(100, 118, 0.8, 0);
    bee(100, 174, 0.8, 3.1);
  });

  /* ---------- Registration ---------- */
  function registerAll() {
    KEYS.forEach((k) => D.registerSprite(k, ART[k].w, ART[k].h, ART[k].fn));
  }
  registerAll();
  // sprites drawn before the web fonts arrived used a fallback for their labels: draw them again once the fonts are in
  if (root.document && root.document.fonts && root.document.fonts.ready) root.document.fonts.ready.then(registerAll, () => {});

  ZSR.Landmarks1 = { KEYS };
})(typeof globalThis !== "undefined" ? globalThis : this);
