/* Art for the crossover universes (docs/UNIVERSES.md), in the crew art's comic style (flat fills, ink edges):
   - "roboDog" { pose, f } (+ left: true only when true): Rivet, Tomas's Bolt-model robot dog (the Captain Leo
     universe), side view facing right, 160 x 128 at 2 px a unit like the crew's dog (js/crewart.js "crewDog"), so it
     stands about as tall at ZSR.CROSS_ART.scale.roboDog. Poses: stand, walk, sit, zap (eyes and antenna lit, a spark
     at the nose), off (shut down: lying flat, eyes dark). f is exactly 0 or 1 (Draw3 caches one canvas per opts set).
   - "zapSpark" {}: the blue spark a zap leaves on the walker it hit, 64 x 64.
   - ZSR.Crossover.sky(ctx, W, H, a, kind): what hangs over the yard (js/interior.js render, under open sky): "mira9"
     (Mira-9, huge and pale, with its slow white clouds) or "ring" (the old Indestructium shipyard ring, a thin silver
     arc, and Mars, a bright point). Fixed in the world: it slides across the screen as you turn (a = your heading).
   ZSR.CROSS_ART lists every opts set the game draws (tests/validate-art.js draws them all) and each kind's scale. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const D = ZSR.Draw3;
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const POSES = ["stand", "walk", "sit", "zap", "off"];
  const FRAMES = [0, 1];
  const STEEL = { body: "#a9b3bd", dark: "#6f7a86", light: "#d9e0e6", joint: "#4b545e", eye: "#5cc8ff", eyeOff: "#26303a", badge: "#e8b923" };

  /* ---------- Small drawing helpers (lengths in the sprite's units) ---------- */
  function ink(ctx, lw) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
  }
  function rrect(ctx, x, y, w, h, r, fill, lw) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (lw) {
      ink(ctx, lw);
      ctx.stroke();
    }
  }
  function circle(ctx, x, y, r, fill, lw) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (lw) {
      ink(ctx, lw);
      ctx.stroke();
    }
  }
  function line(ctx, pts, color, lw) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }
  /** A leg in two tubes, hip -> knee -> paw, with a round joint and a flat foot. */
  function leg(ctx, hip, knee, paw, far) {
    const c = far ? STEEL.dark : STEEL.body;
    line(ctx, [hip, knee, paw], INK, 6.2);
    line(ctx, [hip, knee, paw], c, 4);
    circle(ctx, knee[0], knee[1], 2.1, STEEL.joint, 1);
    rrect(ctx, paw[0] - 3.2, paw[1] - 1.4, 6.4, 2.6, 1.2, far ? STEEL.joint : STEEL.dark, 1);
  }
  /** The ground shadow under it. */
  function shadow(ctx, cx, w) {
    ctx.beginPath();
    ctx.ellipse(cx, -0.6, w, 2.6, 0, 0, TAU);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fill();
  }
  /** The head at (x, y): a boxy skull and snout, a triangle ear, an antenna, the eye (lit, bright or dark). */
  function head(ctx, x, y, tilt, eye, spark, f) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    // the antenna
    line(ctx, [[-3, -7], [-5, -15]], INK, 2.2);
    line(ctx, [[-3, -7], [-5, -15]], STEEL.dark, 1);
    circle(ctx, -5, -15.6, 1.7, eye === "off" ? STEEL.eyeOff : eye === "bright" ? "#bff0ff" : "#e35b4a", 0.9);
    // the ear, a steel triangle
    ctx.beginPath();
    ctx.moveTo(-6, -6);
    ctx.lineTo(-2.4, -14);
    ctx.lineTo(1.2, -6.4);
    ctx.closePath();
    ctx.fillStyle = STEEL.dark;
    ctx.fill();
    ink(ctx, 1.2);
    ctx.stroke();
    // skull, snout, jaw line
    rrect(ctx, -8, -7, 14, 12, 3, STEEL.body, 1.5);
    rrect(ctx, 4, -2.6, 9.6, 7, 2.2, STEEL.light, 1.4);
    line(ctx, [[5.6, 2.2], [12.4, 2.2]], INK, 0.9);
    circle(ctx, 13, -0.6, 1.3, INK, 0); // the chemistry nose
    // a rivet or two, and the eye
    circle(ctx, -5.6, 2.6, 0.7, STEEL.joint, 0);
    circle(ctx, -2.4, 3.4, 0.7, STEEL.joint, 0);
    const lit = eye === "bright" ? "#d6f6ff" : eye === "off" ? STEEL.eyeOff : STEEL.eye;
    if (eye !== "off") {
      const g = ctx.createRadialGradient(1, -2, 0.5, 1, -2, 5.2);
      g.addColorStop(0, "rgba(92,200,255,0.7)");
      g.addColorStop(1, "rgba(92,200,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(-5, -8, 12, 12);
    }
    rrect(ctx, -1.2, -4, 4.6, 3.6, 1.2, lit, 1);
    if (eye !== "off" && !f) circle(ctx, 2.2, -3.1, 0.6, "#ffffff", 0);
    if (spark) {
      // a crackle off the nose
      line(ctx, [[14, -1], [18, -4], [16.4, -0.4], [21, -2.4]], "#bff0ff", 1.6);
      line(ctx, [[14, -1], [18, -4], [16.4, -0.4], [21, -2.4]], STEEL.eye, 0.7);
    }
    ctx.restore();
  }
  /** Rivet in a pose. Units: x from 0 (tail end) to about 74 (nose), y up from the ground (negative). */
  function robo(ctx, pose, f) {
    const s = f ? 1 : -1;
    if (pose === "off") {
      // shut down: belly on the ground, legs folded under, head down on the paws, eyes dark
      shadow(ctx, 40, 30);
      line(ctx, [[18, -6], [10, -4], [5, -2]], INK, 4.6);
      line(ctx, [[18, -6], [10, -4], [5, -2]], STEEL.dark, 2.6);
      rrect(ctx, 16, -15, 40, 13, 5, STEEL.body, 1.8);
      rrect(ctx, 24, -13, 18, 5, 2, STEEL.light, 0);
      circle(ctx, 22, -5, 0.8, STEEL.joint, 0);
      circle(ctx, 50, -5, 0.8, STEEL.joint, 0);
      rrect(ctx, 50, -4, 16, 3.4, 1.4, STEEL.dark, 1.1);
      head(ctx, 64, -9, 0.32, "off", false, 1);
      return;
    }
    if (pose === "sit") {
      shadow(ctx, 38, 24);
      line(ctx, [[22, -8], [13, -6], [7, -3]], INK, 4.6);
      line(ctx, [[22, -8], [13, -6], [7, -3]], STEEL.dark, 2.6);
      leg(ctx, [52, -22], [52.6, -12], [53, -2], true);
      leg(ctx, [48, -22], [48.4, -12], [49, -2], false);
      // the body slants up to the shoulders
      ctx.beginPath();
      ctx.moveTo(20, -4);
      ctx.lineTo(24, -20);
      ctx.lineTo(50, -34);
      ctx.lineTo(57, -28);
      ctx.lineTo(54, -12);
      ctx.lineTo(36, -3);
      ctx.closePath();
      ctx.fillStyle = STEEL.body;
      ctx.fill();
      ink(ctx, 1.8);
      ctx.stroke();
      line(ctx, [[28, -14], [46, -25]], STEEL.light, 2);
      rrect(ctx, 37.6, -22, 6, 6, 1.2, STEEL.badge, 1); // the gold star badge's spot
      rrect(ctx, 24, -6, 12, 4, 1.6, STEEL.dark, 1.1); // the folded hind paw
      head(ctx, 58, -40, f ? 0.12 : -0.04, "on", false, f);
      return;
    }
    const walk = pose === "walk";
    const zap = pose === "zap";
    const by = walk && f ? -0.8 : 0;
    const st = walk ? 4 : 0;
    shadow(ctx, 40, 28);
    // far legs, the tail, the body, the near legs, the head
    leg(ctx, [55, -22 + by], [55 - s * st * 0.4, -12], [55.6 - s * st, -1.6], true);
    leg(ctx, [24, -22 + by], [22 + s * st * 0.3, -11], [24 + s * st, -1.6], true);
    const wag = walk ? s * 1.4 : pose === "stand" ? s * 2 : 0;
    line(ctx, [[19, -27 + by], [12, -32 + by], [8 + wag, -39 + by]], INK, 4.6);
    line(ctx, [[19, -27 + by], [12, -32 + by], [8 + wag, -39 + by]], STEEL.dark, 2.6);
    circle(ctx, 8 + wag, -39 + by, 1.6, STEEL.joint, 0.9);
    rrect(ctx, 17, -33 + by, 42, 14, 5, STEEL.body, 1.8);
    rrect(ctx, 23, -31 + by, 26, 4.4, 2, STEEL.light, 0); // a shine along the back
    line(ctx, [[30, -33 + by], [30, -19 + by]], "rgba(15,16,18,0.45)", 0.9); // panel seams
    line(ctx, [[45, -33 + by], [45, -19 + by]], "rgba(15,16,18,0.45)", 0.9);
    [[21, -22], [27, -22], [49, -22], [55, -22]].forEach(([x, y]) => circle(ctx, x, y + by, 0.8, STEEL.joint, 0));
    rrect(ctx, 50, -30 + by, 6, 6, 1.2, STEEL.badge, 1); // the gold star badge, its memory chip behind it
    leg(ctx, [28, -21 + by], [26 - s * st * 0.3, -11], [28 - s * st, -1.6], false);
    leg(ctx, [51.5, -22 + by], [51.5 + s * st * 0.4, -12], [52 + s * st, -1.6], false);
    // the neck up to the head
    line(ctx, [[56, -30 + by], [61, -38 + by]], INK, 6.4);
    line(ctx, [[56, -30 + by], [61, -38 + by]], STEEL.dark, 4.2);
    head(ctx, 61, -42 + by, zap ? -0.12 : walk ? 0.04 : f ? 0.08 : 0, zap ? "bright" : "on", zap, f);
  }
  if (D) {
    D.registerSprite("roboDog", 160, 128, (ctx, w, h, o) => {
      ctx.save();
      // left: true faces it left (the engine cannot mirror a sprite when it draws it)
      if (o.left) ctx.setTransform(-2, 0, 0, 2, w, h);
      else ctx.setTransform(2, 0, 0, 2, 0, h);
      robo(ctx, POSES.includes(o.pose) ? o.pose : "stand", o.f ? 1 : 0);
      ctx.restore();
    });
    D.registerSprite("zapSpark", 64, 64, (ctx, w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 30);
      g.addColorStop(0, "rgba(214,246,255,0.95)");
      g.addColorStop(0.35, "rgba(92,200,255,0.55)");
      g.addColorStop(1, "rgba(92,200,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.3;
        const pts = [[cx, cy]];
        for (let k = 1; k <= 3; k++) pts.push([cx + Math.cos(a + (k % 2 ? 0.3 : -0.3)) * k * 8.5, cy + Math.sin(a + (k % 2 ? 0.3 : -0.3)) * k * 8.5]);
        line(ctx, pts, "#d6f6ff", 2.4);
        line(ctx, pts, "#5cc8ff", 1);
      }
    });
  }
  const roboSets = [];
  POSES.forEach((pose) => FRAMES.forEach((f) => roboSets.push({ pose, f }, { pose, f, left: true })));
  ZSR.CROSS_ART = {
    sprites: { roboDog: roboSets, zapSpark: [{}] },
    poses: POSES.slice(),
    size: { roboDog: [160, 128], zapSpark: [64, 64] },
    // Rivet stands about as tall as the crew's dog (crewDog 0.36); the spark is a hand's width on a walker
    scale: { roboDog: 0.34, zapSpark: 0.32 },
  };

  /* ---------- The sky over the yard ---------- */
  const FOV = 1.22; // as js/interior.js (the yard's camera)
  const cache = {};
  /** Mira-9 at radius r px, drawn once per size: a pale disk, slow white cloud bands, a soft rim, the night side. */
  function miraDisk(r) {
    const key = "m" + r;
    if (cache[key]) return cache[key];
    const doc = root.document;
    if (!doc) return null;
    const c = doc.createElement("canvas");
    const pad = Math.ceil(r * 0.35);
    c.width = c.height = 2 * (r + pad);
    const g = c.getContext("2d");
    const cx = r + pad;
    const glow = g.createRadialGradient(cx, cx, r * 0.9, cx, cx, r + pad);
    glow.addColorStop(0, "rgba(235,242,250,0.45)");
    glow.addColorStop(1, "rgba(235,242,250,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, c.width, c.height);
    g.save();
    g.beginPath();
    g.arc(cx, cx, r, 0, TAU);
    g.clip();
    const body = g.createRadialGradient(cx - r * 0.35, cx - r * 0.35, r * 0.1, cx, cx, r);
    body.addColorStop(0, "#fbfdff");
    body.addColorStop(0.7, "#e2e9f0");
    body.addColorStop(1, "#c3ccd6");
    g.fillStyle = body;
    g.fillRect(0, 0, c.width, c.height);
    // the clouds: soft bands that curl, the way Mira-9's clouds turn on their own
    g.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const y = cx - r * 0.8 + (i * r * 1.6) / 6;
      g.beginPath();
      g.moveTo(cx - r, y);
      g.bezierCurveTo(cx - r * 0.4, y - r * 0.18 * (i % 2 ? 1 : -1), cx + r * 0.2, y + r * 0.2 * (i % 2 ? 1 : -1), cx + r, y - r * 0.05);
      g.strokeStyle = i % 2 ? "rgba(255,255,255,0.75)" : "rgba(176,190,206,0.45)";
      g.lineWidth = r * (i % 2 ? 0.1 : 0.06);
      g.stroke();
    }
    // two slow swirls
    [[0.3, -0.25, 0.2], [-0.35, 0.3, 0.14]].forEach(([dx, dy, rr]) => {
      g.beginPath();
      g.arc(cx + dx * r, cx + dy * r, rr * r, 0.3, 5.4);
      g.strokeStyle = "rgba(255,255,255,0.8)";
      g.lineWidth = r * 0.04;
      g.stroke();
    });
    // the night side
    const shade = g.createLinearGradient(cx - r, cx - r, cx + r, cx + r);
    shade.addColorStop(0.55, "rgba(70,84,110,0)");
    shade.addColorStop(1, "rgba(70,84,110,0.55)");
    g.fillStyle = shade;
    g.fillRect(0, 0, c.width, c.height);
    g.restore();
    return (cache[key] = { canvas: c, pad });
  }
  /** Screen x of a fixed sky direction `az` for a view heading `a`, or null when it is out of view. */
  function screenX(W, H, a, az) {
    const rel = Math.atan2(Math.sin(az - a), Math.cos(az - a));
    if (Math.abs(rel) > 1.35) return null;
    const half = Math.tan(FOV / 2) * (W / H);
    return W / 2 + (Math.tan(rel) / half) * (W / 2);
  }
  ZSR.Crossover = {
    // where each sits in the sky: a heading (the yard's angles: 0 east, -PI/2 north) and a height above the horizon
    // as a share of the screen's height
    MIRA: { az: -Math.PI / 4, up: 0.31, r: 0.12 },
    RING: { az: -Math.PI / 2, up: 0.27, rise: 0.09 },
    MARS: { az: Math.PI / 6, up: 0.12 },
    sky(ctx, W, H, a, kind, dim) {
      if (kind === "mira9") {
        const m = this.MIRA;
        const r = Math.max(8, Math.round(H * m.r));
        const x = screenX(W, H, a, m.az);
        if (x == null || x < -2 * r || x > W + 2 * r) return;
        const d = miraDisk(r);
        if (!d) return;
        ctx.save();
        ctx.globalAlpha = dim ? 0.55 : 0.92;
        ctx.drawImage(d.canvas, x - r - d.pad, H / 2 - H * m.up - r - d.pad);
        ctx.restore();
      } else if (kind === "ring") {
        // the ring: an arc high across the sky, highest to the north, sliding as you turn
        const R = this.RING;
        const half = Math.tan(FOV / 2) * (W / H);
        ctx.save();
        ctx.globalAlpha = dim ? 0.4 : 0.7;
        const pts = [];
        for (let i = 0; i <= 32; i++) {
          const sx = (i / 32) * W;
          const th = a + Math.atan(((sx - W / 2) / (W / 2)) * half);
          pts.push([sx, H / 2 - H * (R.up + R.rise * Math.cos(th - R.az))]);
        }
        line(ctx, pts, "rgba(220,226,232,0.9)", Math.max(1.5, H * 0.006));
        line(ctx, pts.map(([x, y]) => [x, y - Math.max(1, H * 0.003)]), "rgba(255,255,255,0.8)", Math.max(0.8, H * 0.002));
        // Mars: a bright point low in the sky
        const mx = screenX(W, H, a, this.MARS.az);
        if (mx != null) {
          const my = H / 2 - H * this.MARS.up;
          const rr = Math.max(2, H * 0.006);
          const g = ctx.createRadialGradient(mx, my, 0, mx, my, rr * 4);
          g.addColorStop(0, "rgba(255,170,130,1)");
          g.addColorStop(0.3, "rgba(230,110,70,0.8)");
          g.addColorStop(1, "rgba(230,110,70,0)");
          ctx.fillStyle = g;
          ctx.fillRect(mx - rr * 4, my - rr * 4, rr * 8, rr * 8);
        }
        ctx.restore();
      }
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
