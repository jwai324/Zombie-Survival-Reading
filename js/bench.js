/* The workbench scene: a procedural comic garage drawn behind the typing game, the van beside the bench (the one 3D
   van, js/van3d.js, from its side in the player's paint and gear).
   Flat fills, heavy ink, halftone, one warm work lamp. The caller sizes the
   canvas (opts.dpr for device pixels) and calls draw again on resize. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const TAU = Math.PI * 2;
  const INK = "#0f1012";
  const Dr = () => ZSR.Draw;

  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }
  function path(ctx, pts, close) {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    if (close) ctx.closePath();
  }
  function poly(ctx, pts, fill, line) {
    path(ctx, pts, true);
    Dr().fillStroke(ctx, fill, line);
  }
  function box(ctx, x, y, w, h, fill, line, r) {
    Dr().rr(ctx, x, y, w, h, r == null ? 3 : r);
    Dr().fillStroke(ctx, fill, line);
  }
  function oval(ctx, x, y, rx, ry, fill, line) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
    if (line) Dr().fillStroke(ctx, fill, line);
    else {
      ctx.fillStyle = fill;
      ctx.fill();
    }
  }
  function line(ctx, pts, color, width) {
    path(ctx, pts, false);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  let dots = null;
  function halftone(ctx, W, H) {
    if (!dots) {
      dots = document.createElement("canvas");
      dots.width = dots.height = 6;
      const c = dots.getContext("2d");
      c.fillStyle = "rgba(0,0,0,.18)";
      c.arc(3, 3, 1.1, 0, TAU);
      c.fill();
    }
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = ctx.createPattern(dots, "repeat");
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ---------- Room: cinder-block wall, concrete floor with oil and cracks ---------- */
  function room(ctx, W, H, horizon, s) {
    ctx.fillStyle = "#636a62";
    ctx.fillRect(0, 0, W, horizon);
    for (let y = horizon, row = 0; y > 0; y -= 30 * s, row++) {
      line(ctx, [[0, y], [W, y]], "rgba(0,0,0,.2)", 2);
      for (let x = row % 2 ? 32 * s : 0; x < W; x += 64 * s) line(ctx, [[x, y], [x, y - 30 * s]], "rgba(0,0,0,.2)", 2);
    }
    const g = ctx.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0, "rgba(0,0,0,.55)");
    g.addColorStop(0.7, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, horizon);
    const fh = H - horizon;
    ctx.fillStyle = "#4d4f55";
    ctx.fillRect(0, horizon, W, fh);
    [0.42, 0.78].forEach((k) => line(ctx, [[0, horizon + fh * k], [W, horizon + fh * k]], "rgba(0,0,0,.3)", 2));
    for (let i = 1; i < 5; i++) line(ctx, [[(W * i) / 5, horizon], [(W * i) / 5 + ((W * i) / 5 - W / 2) * 0.25, H]], "rgba(0,0,0,.3)", 2);
    const r = seeded(11);
    [[0.3, 0.72, 1.2], [0.6, 0.9, 0.8], [0.87, 0.62, 0.6]].forEach(([fx, fy, k]) => {
      const cx = W * fx;
      const cy = horizon + fh * fy;
      const pts = [];
      for (let i = 0; i < 9; i++) pts.push([cx + Math.cos((i / 9) * TAU) * (40 + r() * 30) * s * k * 1.7, cy + Math.sin((i / 9) * TAU) * (40 + r() * 30) * s * k * 0.5]);
      path(ctx, pts, true);
      ctx.fillStyle = "rgba(12,13,18,.62)";
      ctx.fill();
      oval(ctx, cx - 12 * s * k, cy - 4 * s * k, 16 * s * k, 4 * s * k, "rgba(130,140,165,.28)");
    });
    const crack = [[W * 0.74, horizon + 6]];
    for (let i = 0; i < 7; i++) crack.push([crack[i][0] + (r() - 0.5) * 30 * s, crack[i][1] + (8 + r() * 14) * s]);
    line(ctx, crack, "rgba(0,0,0,.55)", 2);
    ctx.fillStyle = "#3a3c41";
    ctx.fillRect(0, horizon - 10 * s, W, 10 * s);
    line(ctx, [[0, horizon], [W, horizon]], INK, 4);
    line(ctx, [[0, horizon - 10 * s], [W, horizon - 10 * s]], INK, 3);
  }

  /* ---------- Wall fittings: pegboard, shelf of cans, the lamp ---------- */
  function pegboard(ctx, x, y, w, h, s) {
    box(ctx, x, y, w, h, "#b48f5c", 4, 4);
    ctx.fillStyle = "rgba(0,0,0,.35)";
    for (let py = y + 14 * s; py < y + h - 7 * s; py += 14 * s) {
      for (let px = x + 14 * s; px < x + w - 7 * s; px += 14 * s) {
        ctx.beginPath();
        ctx.arc(px, py, 1.4, 0, TAU);
        ctx.fill();
      }
    }
    // chalk outlines: the hammer, wrench and saw are down on the bench
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.lineJoin = "round";
    const o = (pts, open) => {
      path(ctx, pts.map((p) => [x + p[0] * w, y + p[1] * h]), !open);
      ctx.strokeStyle = "rgba(255,255,255,.65)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    };
    o([[0.06, 0.12], [0.22, 0.12], [0.22, 0.26], [0.16, 0.26], [0.16, 0.8], [0.12, 0.8], [0.12, 0.26], [0.06, 0.26]]);
    o([[0.29, 0.1], [0.33, 0.1], [0.33, 0.18], [0.37, 0.18], [0.37, 0.1], [0.41, 0.1], [0.41, 0.26], [0.37, 0.26], [0.37, 0.8], [0.33, 0.8], [0.33, 0.26], [0.29, 0.26]]);
    o([[0.5, 0.18], [0.58, 0.1], [0.64, 0.18], [0.94, 0.18], [0.94, 0.3], [0.66, 0.56], [0.58, 0.56], [0.5, 0.44]]);
    o([[0.72, 0.64], [0.86, 0.92]], true);
    o([[0.86, 0.64], [0.72, 0.92]], true);
    ctx.restore();
    box(ctx, x + w * 0.455, y + h * 0.1, 9 * s, 34 * s, "#b3261e", 2.5, 3);
    box(ctx, x + w * 0.455 + 2.5 * s, y + h * 0.1 + 34 * s, 4 * s, 40 * s, "#9ea3aa", 2, 1);
    Dr().circle(ctx, x + w * 0.6, y + h * 0.78, 16 * s, "#d9a21b", 3);
    Dr().circle(ctx, x + w * 0.6, y + h * 0.78, 5 * s, "#4b5057", 2);
  }
  function shelf(ctx, x, y, w, s) {
    [x + w * 0.1, x + w * 0.9].forEach((bx) => box(ctx, bx - 5 * s, y + 10 * s, 10 * s, 24 * s, "#3b3d44", 2.5, 1));
    box(ctx, x, y, w, 10 * s, "#7d5a36", 3, 2);
    ["#b3261e", "#7a9a3c", "#d9a21b"].forEach((label, i) => {
      const cx = x + w * (0.06 + i * 0.17);
      box(ctx, cx, y - 36 * s, 30 * s, 36 * s, "#8c8f94", 3, 2);
      ctx.fillStyle = label;
      ctx.fillRect(cx + 3, y - 24 * s, 30 * s - 6, 11 * s);
      oval(ctx, cx + 15 * s, y - 36 * s, 15 * s, 4 * s, "#6e7278", 2.5);
    });
    [["#9b2a22", 0.6], ["#5b6b3a", 0.8]].forEach(([c, k]) => {
      const cx = x + w * k;
      box(ctx, cx, y - 44 * s, 34 * s, 44 * s, c, 3, 4);
      box(ctx, cx + 8 * s, y - 51 * s, 17 * s, 8 * s, c, 2.5, 2);
      line(ctx, [[cx + 6 * s, y - 33 * s], [cx + 28 * s, y - 11 * s]], "rgba(0,0,0,.35)", 3);
      line(ctx, [[cx + 6 * s, y - 11 * s], [cx + 28 * s, y - 33 * s]], "rgba(0,0,0,.35)", 3);
    });
  }
  function lamp(ctx, x, y, W, H, s) {
    line(ctx, [[x, 0], [x, y - 30 * s]], INK, 3);
    const g = ctx.createLinearGradient(0, y, 0, H * 0.95);
    g.addColorStop(0, "rgba(255,214,120,.3)");
    g.addColorStop(1, "rgba(255,214,120,0)");
    path(ctx, [[x - 40 * s, y], [x + 40 * s, y], [x + W * 0.3, H * 0.95], [x - W * 0.3, H * 0.95]], true);
    ctx.fillStyle = g;
    ctx.fill();
    poly(ctx, [[x - 14 * s, y - 30 * s], [x + 14 * s, y - 30 * s], [x + 46 * s, y], [x - 46 * s, y]], "#3b3d44", 3.5);
    Dr().circle(ctx, x, y - s, 11 * s, "#ffe9a6", 3);
    oval(ctx, x, y, 50 * s, 7 * s, "rgba(255,230,160,.5)");
  }

  /* ---------- The bench: vise, hammer, wrench, nails, a tin of bolts, the cord ---------- */
  function bench(ctx, x, y, w, H, s) {
    const th = 18 * s;
    const bottom = H * 0.96;
    const shelfY = y + (bottom - y) * 0.62;
    [x + 10 * s, x + w - 28 * s].forEach((lx) => box(ctx, lx, y + th, 18 * s, bottom - y - th, "#5e4628", 3, 2));
    box(ctx, x + w * 0.2, shelfY - 34 * s, 52 * s, 34 * s, "#6b6d3a", 3, 2);
    box(ctx, x + 10 * s, shelfY, w - 20 * s, 12 * s, "#6f5430", 3, 2);
    box(ctx, x, y + th - 2, w, 24 * s, "#6f5430", 3.5, 2);
    box(ctx, x - 6 * s, y, w + 12 * s, th, "#8a6a3e", 4, 3);
    for (let i = 1; i < 4; i++) line(ctx, [[x, y + (th * i) / 4], [x + w, y + (th * i) / 4 + (i % 2 ? 2 : -2)]], "rgba(0,0,0,.18)", 2);
    const k = s * 1.4; // bench-top props are drawn a little larger so they read behind the panel
    const vx = x + w * 0.05;
    box(ctx, vx, y - 14 * k, 44 * k, 14 * k, "#6e7278", 3, 2);
    box(ctx, vx + 4 * k, y - 36 * k, 14 * k, 24 * k, "#5a5d66", 3, 2);
    box(ctx, vx + 26 * k, y - 36 * k, 14 * k, 24 * k, "#5a5d66", 3, 2);
    box(ctx, vx - 18 * k, y - 29 * k, 24 * k, 7 * k, "#9ea3aa", 2.5, 2);
    Dr().circle(ctx, vx - 18 * k, y - 25 * k, 6 * k, "#3b3d44", 2.5);
    ctx.save();
    ctx.translate(x + w * 0.24, y - 7 * k);
    ctx.rotate(-0.12);
    box(ctx, 0, -4 * k, 72 * k, 9 * k, "#a07a48", 3, 3);
    box(ctx, 64 * k, -13 * k, 28 * k, 22 * k, "#4b5057", 3, 3);
    ctx.restore();
    ctx.save();
    ctx.translate(x + w * 0.5, y - 6 * k);
    ctx.rotate(0.16);
    box(ctx, 0, -4 * k, 62 * k, 8 * k, "#9ea3aa", 3, 3);
    Dr().circle(ctx, 66 * k, 0, 11 * k, "#9ea3aa", 3);
    box(ctx, 70 * k, -7 * k, 12 * k, 9 * k, "#8a6a3e", 2, 1);
    ctx.restore();
    const r = seeded(21);
    for (let i = 0; i < 14; i++) {
      const nx = x + w * (0.3 + r() * 0.52);
      const ny = y - 2 * k - r() * 5 * k;
      const a = (r() - 0.5) * 0.7;
      const len = (12 + r() * 10) * k;
      const end = [nx + Math.cos(a) * len, ny + Math.sin(a) * len];
      line(ctx, [[nx, ny], end], INK, 4.5);
      line(ctx, [[nx, ny], end], "#c9ccd0", 2);
      Dr().circle(ctx, nx, ny, 2.6 * k, "#9ea3aa", 1.5);
    }
    const tx = x + w * 0.86;
    box(ctx, tx, y - 32 * k, 38 * k, 32 * k, "#7a7d82", 3, 2);
    ctx.fillStyle = "#d9a21b";
    ctx.fillRect(tx + 3, y - 22 * k, 38 * k - 6, 10 * k);
    for (let i = 0; i < 5; i++) Dr().circle(ctx, tx + (6 + i * 7) * k, y - 34 * k - (i % 2) * 3 * k, 3.5 * k, "#4b5057", 2);
    oval(ctx, tx + 19 * k, y - 32 * k, 19 * k, 4 * k, "#5a5d66", 2.5);
    const cx = x + w * 0.9;
    const cy = bottom - 6 * s;
    [26, 19, 12].forEach((rad) => {
      oval(ctx, cx, cy, rad * s, rad * 0.45 * s, "rgba(0,0,0,0)", 8);
      ctx.strokeStyle = "#d9742a";
      ctx.lineWidth = 4.5;
      ctx.stroke();
    });
    box(ctx, cx + 24 * s, cy - 4 * s, 12 * s, 8 * s, "#2b2d31", 2, 2);
  }

  /* ---------- The van, side-on: the one 3D van (js/van3d.js) in the player's paint and gear ----------
     Seen from its right side, a little ahead of it and above (SIDE: yaw toward its nose and pitch down, radians;
     dist, road units, far enough off that the perspective is mild), so its nose points right as the bench always
     showed it, with its hood, roof and gun just showing. Lit by the work lamp up and ahead of it: a side face full,
     its top brighter, its ends a little darker (sideLit). Drawn once a picture (Bench.draw), so at full detail. */
  const SIDE = { yaw: 0.2, pitch: 0.12, dist: 900 };
  function sideLit(nx, ny, nz) {
    return 0.86 + 0.14 * Math.abs(nx) + 0.04 * ny + 0.24 * Math.max(0, nz) - 0.26 * Math.max(0, -nz);
  }
  /** The van standing on the floor line y, its body from x to x + L (px; its plow and gear reach past that as on
      the road), its gun on its roof, dent (Van3D.dentTier's) dents on it. */
  function sideVan(ctx, x, y, L, u, dent) {
    const V = ZSR.Van3D;
    const M = ZSR.Model3D;
    if (!V || !M) return;
    oval(ctx, x + L * 0.5, y, L * 0.56, L * 0.047, "rgba(0,0,0,.4)");
    // the camera: the eye off the van's right side, looking at its middle
    const cy = Math.cos(SIDE.pitch);
    const e = [cy * Math.cos(SIDE.yaw), cy * Math.sin(SIDE.yaw), Math.sin(SIDE.pitch)];
    const eye = [e[0] * SIDE.dist, e[1] * SIDE.dist, V.H / 2 + e[2] * SIDE.dist];
    const fw = [-e[0], -e[1], -e[2]];
    const rl = Math.hypot(fw[1], fw[0]) || 1;
    const rt = [fw[1] / rl, -fw[0] / rl, 0]; // the screen's right: forward x up
    const up = [rt[1] * fw[2] - rt[2] * fw[1], rt[2] * fw[0] - rt[0] * fw[2], rt[0] * fw[1] - rt[1] * fw[0]];
    const T = { F: 1, ox: 0, oy: 0 };
    const view = M.view({ eye, lod: 0, near: 1, lit: sideLit });
    view.project = (px, py, pz) => {
      const qx = px - eye[0];
      const qy = py - eye[1];
      const qz = pz - eye[2];
      const d = qx * fw[0] + qy * fw[1] + qz * fw[2];
      view.D = d;
      if (!(d > view.near)) {
        view.X = T.ox;
        view.Y = T.oy;
        return false;
      }
      view.X = T.ox + (T.F * (qx * rt[0] + qy * rt[1] + qz * rt[2])) / d;
      view.Y = T.oy - (T.F * (qx * up[0] + qy * up[1] + qz * up[2])) / d;
      return true;
    };
    // fit its body's box: L px from its tail's corner to its nose's, the lowest of its near corners on the floor line
    let x0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (let c = 0; c < 8; c++) {
      view.project(c & 1 ? V.W / 2 : -V.W / 2, c & 2 ? V.L / 2 : -V.L / 2, c & 4 ? V.H : 0);
      x0 = Math.min(x0, view.X);
      x1 = Math.max(x1, view.X);
      y1 = Math.max(y1, view.Y);
    }
    T.F = L / Math.max(1e-6, x1 - x0);
    T.ox = x - x0 * T.F;
    T.oy = y - y1 * T.F;
    view.ink = Math.max(1.2, (3 * L) / 440);
    V.draw(ctx, view, u, { dent, gun: true });
  }

  ZSR.Bench = {
    draw(canvas, opts) {
      const o = opts || {};
      const ctx = canvas.getContext("2d");
      const dpr = o.dpr || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const u = Object.assign({ armor: 0, engine: 0, bumper: 0, paint: 0, damage: 0, fireRate: 0, spread: 0 }, o.upgrades || {});
      const s = Math.max(0.5, Math.min(1.25, Math.min(W / 1280, H / 720)));
      const horizon = H * 0.56;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      room(ctx, W, H, horizon, s);
      shelf(ctx, W * 0.07, H * 0.26, W * 0.3, s);
      pegboard(ctx, W * 0.45, H * 0.17, W * 0.42, horizon - H * 0.17 - 26 * s, s);
      lamp(ctx, W * 0.67, H * 0.13, W, H, s);
      bench(ctx, W * 0.36, H * 0.66, W * 0.62, H, s);
      // (as dented as the save's van is: o.dent, else Van3D.dentNow's)
      const V = ZSR.Van3D;
      sideVan(ctx, W * 0.03, H * 0.93, Math.min(W * 0.38, H * 0.62), u, o.dent != null ? o.dent | 0 : V ? V.dentNow() : 0);
      const pool = ctx.createRadialGradient(W * 0.67, H * 0.66, 0, W * 0.67, H * 0.66, W * 0.32);
      pool.addColorStop(0, "rgba(255,214,120,.22)");
      pool.addColorStop(1, "rgba(255,214,120,0)");
      ctx.fillStyle = pool;
      ctx.fillRect(0, 0, W, H);
      halftone(ctx, W, H);
      Dr().vignette(ctx, W, H);
      ctx.fillStyle = "rgba(0,0,0,.12)";
      ctx.fillRect(0, 0, W, H);
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
