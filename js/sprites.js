/* Procedural comic-book drawing in a grounded, gritty style: heavy ink,
   muted fills, halftone, hard shadows. Everything is drawn in CSS pixels;
   the caller scales for device pixel ratio. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  const INK = "#0f1012";
  const LINE = 3.5;
  const TAU = Math.PI * 2;

  function rr(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }
  function fillStroke(ctx, fill, line) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = line || LINE;
    ctx.strokeStyle = INK;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  function circle(ctx, x, y, r, fill, line) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    fillStroke(ctx, fill, line);
  }
  function star(ctx, x, y, points, rOuter, rInner, rot) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const a = (i / (points * 2)) * TAU + (rot || 0);
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }
  /** Deterministic pseudo-random for static detail (cracks, rivets). */
  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /* ---------- Road and scenery ---------- */

  function road(ctx, W, H, roadX, roadW, scroll, theme) {
    const t = theme || {};
    // dead ground
    ctx.fillStyle = t.grass || "#5d5a3e";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = t.grassDark || "rgba(0,0,0,0.06)";
    const stripe = 220;
    for (let y = (scroll % stripe) - stripe; y < H; y += stripe) {
      ctx.fillRect(0, y, W, stripe * 0.45);
    }
    // gravel shoulders
    ctx.fillStyle = t.shoulder || "#78736a";
    ctx.fillRect(roadX - 26, 0, 26, H);
    ctx.fillRect(roadX + roadW, 0, 26, H);
    // asphalt with worn lane bands
    ctx.fillStyle = t.asphalt || "#35363b";
    ctx.fillRect(roadX, 0, roadW, H);
    ctx.fillStyle = "rgba(255,255,255,0.035)";
    ctx.fillRect(roadX + roadW * 0.12, 0, roadW * 0.3, H);
    ctx.fillRect(roadX + roadW * 0.58, 0, roadW * 0.3, H);
    // faded edge lines
    ctx.strokeStyle = "rgba(225,220,205,0.55)";
    ctx.lineWidth = 4;
    ctx.setLineDash([120, 18]);
    ctx.lineDashOffset = -scroll;
    ctx.beginPath();
    ctx.moveTo(roadX + 10, 0);
    ctx.lineTo(roadX + 10, H);
    ctx.moveTo(roadX + roadW - 10, 0);
    ctx.lineTo(roadX + roadW - 10, H);
    ctx.stroke();
    // faded center dashes
    ctx.strokeStyle = "rgba(214,176,60,0.65)";
    ctx.lineWidth = 5;
    ctx.setLineDash([40, 40]);
    ctx.lineDashOffset = -scroll;
    ctx.beginPath();
    ctx.moveTo(roadX + roadW / 2, 0);
    ctx.lineTo(roadX + roadW / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);
    // ink edges
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(roadX - 26, -4, roadW + 52, H + 8);
  }

  function deadTree(ctx, size, seed) {
    const r = seeded(seed);
    // tapered branches drawn as thin polygons so they read as wood, not wire
    const n = 4 + Math.floor(r() * 2);
    const base = r() * TAU;
    for (let i = 0; i < n; i++) {
      const a = base + (i / n) * TAU + (r() - 0.5) * 0.5;
      const len = size * (0.9 + r() * 0.5);
      const bw = size * 0.16;
      const ex = Math.cos(a) * len;
      const ey = Math.sin(a) * len;
      const px = Math.cos(a + Math.PI / 2) * bw;
      const py = Math.sin(a + Math.PI / 2) * bw;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(ex, ey);
      ctx.lineTo(-px, -py);
      ctx.closePath();
      fillStroke(ctx, "#3b322a", 2.5);
      // one twig off each branch
      const tx = Math.cos(a) * len * 0.55;
      const ty = Math.sin(a) * len * 0.55;
      const ta = a + (r() < 0.5 ? -0.7 : 0.7);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + Math.cos(ta) * len * 0.35, ty + Math.sin(ta) * len * 0.35);
      ctx.stroke();
      ctx.lineCap = "butt";
    }
    // trunk seen from above, with a ring
    circle(ctx, 0, 0, size * 0.28, "#5a4a3a", 3);
    circle(ctx, 0, 0, size * 0.13, "#3b322a", 2);
  }

  function prop(ctx, p) {
    const { x, y, kind } = p;
    ctx.save();
    ctx.translate(x, y);
    if (kind === "tree") {
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(p.size * 0.35, p.size * 0.4, p.size * 1.1, p.size * 0.7, 0, 0, TAU);
      ctx.fill();
      deadTree(ctx, p.size, p.seed || 1);
    } else if (kind === "barrel") {
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(4, 4, 14, 14, 0, 0, TAU);
      ctx.fill();
      circle(ctx, 0, 0, 13, p.color || "#7a4a2a");
      circle(ctx, 0, 0, 8, "#3a2a1c", 2.5);
    } else if (kind === "tire") {
      circle(ctx, 0, 0, 12, "#1f2023");
      circle(ctx, 0, 0, 5, "#4a4b50", 2.5);
    } else if (kind === "rubble") {
      const r = seeded(p.seed || 3);
      for (let i = 0; i < 4; i++) {
        const rx = (r() - 0.5) * 30;
        const ry = (r() - 0.5) * 30;
        rr(ctx, rx - 5, ry - 4, 10 + r() * 6, 8 + r() * 4, 2);
        fillStroke(ctx, "#7d7a74", 2.5);
      }
    } else if (kind === "barrier") {
      ctx.rotate(p.rot || 0);
      rr(ctx, -34, -9, 68, 18, 3);
      fillStroke(ctx, "#8d8a84");
      ctx.fillStyle = "#d9a21b";
      for (let i = -30; i < 30; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, -9);
        ctx.lineTo(i + 8, -9);
        ctx.lineTo(i, 9);
        ctx.lineTo(i - 8, 9);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.strokeRect(-34, -9, 68, 18);
    } else if (kind === "sign") {
      ctx.fillStyle = "#4a4a4f";
      ctx.fillRect(-3, 0, 6, 28);
      rr(ctx, -24, -24, 48, 26, 3);
      fillStroke(ctx, p.color || "#d9a21b");
      ctx.fillStyle = INK;
      ctx.font = "700 11px Oswald, Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.text || "KEEP OUT", 0, -11);
    } else if (kind === "wreck") {
      ctx.rotate(p.rot || 0);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      rr(ctx, -18, -36, 48, 84, 8);
      ctx.fill();
      rr(ctx, -22, -42, 44, 84, 8);
      fillStroke(ctx, p.color || "#5a4538");
      // burnt hood and broken glass
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      rr(ctx, -20, -40, 40, 22, 6);
      ctx.fill();
      rr(ctx, -16, -16, 32, 16, 3);
      fillStroke(ctx, "#2a3138", 2.5);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(2, -4);
      ctx.lineTo(10, -8);
      ctx.stroke();
      ctx.fillStyle = "#1f2023";
      [[-27, -28], [19, -28], [-27, 12], [19,12]].forEach(([wx, wy]) => ctx.fillRect(wx, wy, 8, 18));
      // open door
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(22, -4);
      ctx.lineTo(38, 6);
      ctx.lineTo(22, 16);
      ctx.stroke();
    } else if (kind === "crack") {
      const r = seeded(p.seed || 7);
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      let cx = 0;
      let cy = 0;
      ctx.moveTo(0, 0);
      for (let i = 0; i < 6; i++) {
        cx += (r() - 0.5) * 30;
        cy += 10 + r() * 14;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    } else if (kind === "crate") {
      const bob = Math.sin(p.t * 5) * 2;
      ctx.translate(0, bob);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      rr(ctx, -14, -14, 36, 36, 3);
      ctx.fill();
      rr(ctx, -18, -18, 36, 36, 3);
      fillStroke(ctx, "#6b6d3a");
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-12, -12, 24, 24);
      ctx.fillStyle = "#e6dfcc";
      ctx.font = "700 9px Oswald, Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("SUPPLY", 0, -3);
      ctx.fillText("SCRAP", 0, 6);
    } else if (kind === "fallen") {
      // a walker that has been put down: a dark prone shape that fades
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 1.2)) * 0.85;
      ctx.rotate(p.rot || 0);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.8, 0, 0, TAU);
      fillStroke(ctx, "#4a5248", 2.5);
      circle(ctx, p.size * 1.35, -p.size * 0.1, p.size * 0.6, "#6f7a6a", 2.5);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /* ---------- Van ---------- */

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
    const r = f(n >> 16);
    const g = f((n >> 8) & 255);
    const b = f(n & 255);
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  }

  function decal(ctx, kind, w, h, look) {
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = INK;
    if (kind === "stripe") {
      ctx.fillStyle = "rgba(235,230,215,0.9)";
      ctx.fillRect(-6, -h * 0.45, 12, h * 0.9);
      ctx.strokeRect(-6, -h * 0.45, 12, h * 0.9);
    } else if (kind === "hazard") {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-w * 0.42, h * 0.18, w * 0.84, h * 0.22);
      ctx.clip();
      ctx.fillStyle = INK;
      for (let i = -w; i < w; i += 18) {
        ctx.beginPath();
        ctx.moveTo(i, h * 0.18);
        ctx.lineTo(i + 9, h * 0.18);
        ctx.lineTo(i - 4, h * 0.4);
        ctx.lineTo(i - 13, h * 0.4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      ctx.strokeRect(-w * 0.42, h * 0.18, w * 0.84, h * 0.22);
    } else if (kind === "stencil") {
      ctx.fillStyle = "rgba(235,230,215,0.85)";
      ctx.font = "700 15px Oswald, Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("B-66", 0, 6);
    } else if (kind === "patches") {
      ctx.fillStyle = "rgba(60,40,30,0.55)";
      [[-14, -18, 12, 9], [10, 4, 10, 14], [-6, 20, 16, 7]].forEach(([x, y, pw, ph]) => {
        rr(ctx, x, y, pw, ph, 3);
        ctx.fill();
      });
    } else if (kind === "flames") {
      ctx.beginPath();
      ctx.moveTo(-w * 0.42, -h * 0.05);
      for (let i = 0; i < 5; i++) {
        const x = -w * 0.42 + (i / 4) * w * 0.84;
        ctx.lineTo(x + w * 0.1, -h * 0.4 + (i % 2) * 12);
        ctx.lineTo(x + w * 0.2, -h * 0.18 + (i % 2) * 6);
      }
      ctx.lineTo(w * 0.42, -h * 0.05);
      ctx.closePath();
      fillStroke(ctx, "#1f1f23", 2.5);
    } else if (kind === "chevron") {
      ctx.fillStyle = "rgba(235,230,215,0.85)";
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-16, i * 16 + 6);
        ctx.lineTo(0, i * 16 - 4);
        ctx.lineTo(16, i * 16 + 6);
        ctx.lineTo(16, i * 16 + 12);
        ctx.lineTo(0, i * 16 + 2);
        ctx.lineTo(-16, i * 16 + 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    void look;
    ctx.restore();
  }

  /**
   * Draw the Bookmobile. opts: { upgrades, aim (radians, 0 = right, -PI/2 = up), t, hurt (0..1), scale, flash }
   */
  function van(ctx, x, y, opts) {
    const u = opts.upgrades || { armor: 0, engine: 0, bumper: 0, paint: 0, damage: 0, fireRate: 0, spread: 0 };
    const look = ZSR.Upgrades.PAINT_LOOKS[Math.min(u.paint, ZSR.Upgrades.PAINT_LOOKS.length - 1)];
    const w = 66;
    const h = 118;
    const t = opts.t || 0;
    const s = opts.scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    rr(ctx, -w / 2 + 7, -h / 2 + 9, w, h, 8);
    ctx.fill();

    // wheels with tread
    [[-w / 2 - 6, -h * 0.33], [w / 2 - 7, -h * 0.33], [-w / 2 - 6, h * 0.16], [w / 2 - 7, h * 0.16]].forEach(([wx, wy]) => {
      rr(ctx, wx, wy, 13, 26, 3);
      fillStroke(ctx, "#1f2023", 3);
      ctx.strokeStyle = "#45474d";
      ctx.lineWidth = 2;
      for (let i = 4; i < 26; i += 5) {
        ctx.beginPath();
        ctx.moveTo(wx + 2, wy + i);
        ctx.lineTo(wx + 11, wy + i);
        ctx.stroke();
      }
    });

    // ram plow (front = top)
    if (u.bumper > 0) {
      const pw = w * 0.5 + u.bumper * 4;
      const ph = 8 + u.bumper * 3;
      ctx.beginPath();
      ctx.moveTo(-pw, -h / 2 + 4);
      ctx.lineTo(-pw + 8, -h / 2 - ph);
      ctx.lineTo(pw - 8, -h / 2 - ph);
      ctx.lineTo(pw, -h / 2 + 4);
      ctx.closePath();
      fillStroke(ctx, "#6e7278", 3);
      if (u.bumper >= 3) {
        for (let i = 0; i < 4; i++) {
          const sx = -pw * 0.7 + (i / 3) * pw * 1.4;
          ctx.beginPath();
          ctx.moveTo(sx - 4, -h / 2 - ph + 1);
          ctx.lineTo(sx, -h / 2 - ph - 9);
          ctx.lineTo(sx + 4, -h / 2 - ph + 1);
          ctx.closePath();
          fillStroke(ctx, "#9ea3aa", 2.5);
        }
      }
    }

    // body
    rr(ctx, -w / 2, -h / 2, w, h, 8);
    fillStroke(ctx, look.body);
    // hood (front section) slightly darker
    ctx.fillStyle = shade(look.body, -18);
    rr(ctx, -w / 2 + 2, -h / 2 + 2, w - 4, h * 0.2, 6);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2 + h * 0.2);
    ctx.lineTo(w / 2, -h / 2 + h * 0.2);
    ctx.stroke();
    // grime streaks
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    rr(ctx, -w / 2 + 3, h * 0.2, 9, h * 0.26, 3);
    ctx.fill();
    rr(ctx, w / 2 - 11, -h * 0.1, 8, h * 0.3, 3);
    ctx.fill();

    // windshield (cracked)
    ctx.beginPath();
    ctx.moveTo(-w * 0.38, -h * 0.3);
    ctx.lineTo(w * 0.38, -h * 0.3);
    ctx.lineTo(w * 0.32, -h * 0.13);
    ctx.lineTo(-w * 0.32, -h * 0.13);
    ctx.closePath();
    fillStroke(ctx, "#2b3540", 3);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w * 0.3, -h * 0.27);
    ctx.lineTo(-w * 0.12, -h * 0.27);
    ctx.moveTo(w * 0.1, -h * 0.29);
    ctx.lineTo(w * 0.2, -h * 0.2);
    ctx.lineTo(w * 0.16, -h * 0.15);
    ctx.stroke();
    if (u.armor >= 2) {
      // window mesh
      ctx.strokeStyle = "rgba(230,225,210,0.5)";
      ctx.lineWidth = 1;
      for (let i = -w * 0.3; i < w * 0.3; i += 7) {
        ctx.beginPath();
        ctx.moveTo(i, -h * 0.3);
        ctx.lineTo(i, -h * 0.13);
        ctx.stroke();
      }
    }

    // cargo roof panel with rivets
    rr(ctx, -w * 0.42, -h * 0.1, w * 0.84, h * 0.52, 5);
    fillStroke(ctx, look.roof, 3);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    for (let i = 0; i < 6; i++) {
      const ry = -h * 0.06 + (i / 5) * h * 0.44;
      ctx.beginPath();
      ctx.arc(-w * 0.38, ry, 1.6, 0, TAU);
      ctx.arc(w * 0.38, ry, 1.6, 0, TAU);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(0, h * 0.16);
    decal(ctx, look.decal, w * 0.84, h * 0.52, look);
    ctx.restore();
    // roof hatch
    rr(ctx, -10, h * 0.26, 20, 12, 2);
    fillStroke(ctx, shade(look.roof, -20), 2.5);

    // side armor plates
    for (let i = 0; i < u.armor; i++) {
      const py = -h * 0.3 + i * (h * 0.14);
      [-w / 2 - 3, w / 2 - 8].forEach((px) => {
        rr(ctx, px, py, 11, h * 0.12, 2);
        fillStroke(ctx, "#6e7278", 2.5);
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(px + 5.5, py + 4, 1.5, 0, TAU);
        ctx.arc(px + 5.5, py + h * 0.12 - 4, 1.5, 0, TAU);
        ctx.fill();
      });
    }

    // engine: roof rack gear, exhaust smoke
    if (u.engine >= 1) {
      rr(ctx, -w * 0.4, h * 0.4, 14, 8, 2);
      fillStroke(ctx, "#5f6b3c", 2.5);
      if (u.engine >= 2) {
        rr(ctx, w * 0.4 - 14, h * 0.4, 14, 8, 2);
        fillStroke(ctx, "#5f6b3c", 2.5);
      }
      if (u.engine >= 3) circle(ctx, w * 0.26, h * 0.34, 7, "#1f2023", 2.5);
      if (u.engine >= 4) {
        rr(ctx, -12, -h * 0.47, 24, 8, 2);
        fillStroke(ctx, "#2b2d31", 2.5);
      }
    }
    if (opts.moving !== false) {
      const puff = (t * 5) % 1;
      ctx.fillStyle = "rgba(90,90,95," + (0.5 - puff * 0.45) + ")";
      ctx.beginPath();
      ctx.arc(-w * 0.3, h / 2 + 6 + puff * 20, 4 + puff * 9 + u.engine * 0.8, 0, TAU);
      ctx.fill();
    }

    // lights
    circle(ctx, -w * 0.3, -h / 2 + 7, 5, "#e9d58a", 2.5);
    circle(ctx, w * 0.3, -h / 2 + 7, 5, "#e9d58a", 2.5);
    ctx.fillStyle = "#b3261e";
    ctx.fillRect(-w * 0.42, h / 2 - 8, 12, 5);
    ctx.fillRect(w * 0.42 - 12, h / 2 - 8, 12, 5);

    // turret
    const aim = opts.aim == null ? -Math.PI / 2 : opts.aim;
    const ty = h * 0.1;
    circle(ctx, 0, ty, 13, "#2f3136", 3);
    ctx.save();
    ctx.translate(0, ty);
    ctx.rotate(aim);
    const barrels = 1 + (u.spread || 0);
    const len = 24 + (u.damage || 0) * 3;
    for (let i = 0; i < barrels; i++) {
      const off = (i - (barrels - 1) / 2) * 7;
      rr(ctx, 8, off - 3, len, 6, 1.5);
      fillStroke(ctx, "#3b3d44", 2.5);
      if (u.damage >= 3) {
        rr(ctx, 8 + len - 6, off - 4.5, 7, 9, 1.5);
        fillStroke(ctx, "#5a5d66", 2);
      }
    }
    if (opts.flash > 0) {
      star(ctx, 8 + len + 6, 0, 6, 12 + opts.flash * 60, 5, t * 20);
      ctx.fillStyle = "rgba(255,236,170,0.95)";
      ctx.fill();
    }
    ctx.restore();
    circle(ctx, 0, ty, 5, "#9ea3aa", 2);

    // hurt flash
    if (opts.hurt > 0) {
      ctx.globalAlpha = Math.min(0.6, opts.hurt);
      rr(ctx, -w / 2, -h / 2, w, h, 8);
      ctx.fillStyle = "#c9412f";
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /* ---------- Walkers ---------- */

  const ZOMBIE_LOOK = {
    walker: { skin: "#8d9a84", shirt: "#4d525a", hair: "#2a2d2a", hood: false },
    runner: { skin: "#9aa392", shirt: "#2f3340", hair: "#1f2226", hood: true },
    brute: { skin: "#6f7a6a", shirt: "#3a3d42", hair: "#1c1e1c", hood: false },
  };

  function zombie(ctx, z, t) {
    const look = ZOMBIE_LOOK[z.type] || ZOMBIE_LOOK.walker;
    const r = z.r;
    const speed = z.type === "runner" ? 13 : z.type === "brute" ? 5 : 7;
    const bobL = Math.sin(t * speed + z.phase) * r * 0.22;
    const bobR = Math.sin(t * speed + z.phase + 2.6) * r * 0.22;
    const lurch = Math.sin(t * speed * 0.5 + z.phase) * 0.08;
    ctx.save();
    ctx.translate(z.x, z.y);
    ctx.rotate(z.angle + Math.PI / 2 + lurch); // sprite faces "up"; z.angle points at the van
    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(5, 7, r * 1.15, r * 0.95, 0, 0, TAU);
    ctx.fill();
    // shoulders / torso
    rr(ctx, -r * 1.15, -r * 0.25, r * 2.3, r * 1.35, r * 0.45);
    fillStroke(ctx, look.shirt);
    // torn edge on the shirt
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, r * 1.05);
    ctx.lineTo(-r * 0.6, r * 0.8);
    ctx.lineTo(-r * 0.3, r * 1.08);
    ctx.lineTo(0, r * 0.85);
    ctx.lineTo(r * 0.4, r * 1.1);
    ctx.lineTo(r * 0.9, r * 0.9);
    ctx.lineTo(r * 0.9, r * 1.1);
    ctx.lineTo(-r * 0.9, r * 1.1);
    ctx.closePath();
    ctx.fill();
    // arms reaching forward, out of phase
    [[-1, bobL], [1, bobR]].forEach(([side, bob]) => {
      const ax = side * r * 0.8;
      const reach = r * 1.55 + bob;
      rr(ctx, ax - r * 0.2, -reach, r * 0.4, reach, r * 0.18);
      fillStroke(ctx, look.skin, 3);
      // claw hand
      circle(ctx, ax, -reach, r * 0.26, look.skin, 2.5);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      for (let f = -1; f <= 1; f++) {
        ctx.beginPath();
        ctx.moveTo(ax + f * r * 0.12, -reach - r * 0.2);
        ctx.lineTo(ax + f * r * 0.2, -reach - r * 0.42);
        ctx.stroke();
      }
    });
    // head
    circle(ctx, 0, 0, r * 0.82, z.hit > 0 ? "#ffffff" : look.skin);
    if (look.hood) {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.95, Math.PI * 0.9, Math.PI * 2.1);
      ctx.lineTo(r * 0.5, r * 0.55);
      ctx.lineTo(-r * 0.5, r * 0.55);
      ctx.closePath();
      fillStroke(ctx, look.shirt, 3);
    } else {
      // matted hair
      ctx.fillStyle = look.hair;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.3);
      ctx.lineTo(-r * 0.5, -r * 0.85);
      ctx.lineTo(-r * 0.1, -r * 0.6);
      ctx.lineTo(r * 0.2, -r * 0.9);
      ctx.lineTo(r * 0.55, -r * 0.55);
      ctx.lineTo(r * 0.7, -r * 0.2);
      ctx.lineTo(r * 0.3, -r * 0.4);
      ctx.lineTo(-r * 0.2, -r * 0.3);
      ctx.closePath();
      ctx.fill();
    }
    // sunken eyes with pale points
    const ex = r * 0.3;
    const ey = r * 0.02;
    ctx.fillStyle = "#1a1c1e";
    ctx.beginPath();
    ctx.ellipse(-ex, ey, r * 0.2, r * 0.15, 0.2, 0, TAU);
    ctx.ellipse(ex, ey, r * 0.2, r * 0.15, -0.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#d8dcc8";
    ctx.beginPath();
    ctx.arc(-ex + r * 0.04, ey, r * 0.06, 0, TAU);
    ctx.arc(ex - r * 0.04, ey, r * 0.06, 0, TAU);
    ctx.fill();
    // mouth
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, r * 0.42);
    ctx.lineTo(r * 0.25, r * 0.4);
    ctx.stroke();
    // hit flash
    if (z.hit > 0) {
      ctx.globalAlpha = Math.min(0.8, z.hit * 3);
      circle(ctx, 0, 0, r * 0.9, "#fff", 2);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // health bar for anything that has taken damage
    if (z.hp < z.maxHp) {
      const bw = r * 2;
      ctx.fillStyle = INK;
      ctx.fillRect(z.x - bw / 2 - 1, z.y - r * 1.9 - 1, bw + 2, 6);
      ctx.fillStyle = "#b3261e";
      ctx.fillRect(z.x - bw / 2, z.y - r * 1.9, bw * Math.max(0, z.hp / z.maxHp), 4);
    }
  }

  /* ---------- Rounds, particles, bursts ---------- */

  function bullet(ctx, b) {
    const len = 18;
    const mag = Math.hypot(b.vx, b.vy) || 1;
    const ux = b.vx / mag;
    const uy = b.vy / mag;
    ctx.lineCap = "round";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(b.x - ux * len, b.y - uy * len);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.strokeStyle = "#ffe9a6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b.x - ux * len, b.y - uy * len);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.lineCap = "butt";
  }

  function particle(ctx, p) {
    const life = p.life / p.maxLife;
    ctx.globalAlpha = Math.max(0, life);
    circle(ctx, p.x, p.y, p.size * (p.grow ? 1 + (1 - life) * 1.5 : life), p.color, 2);
    ctx.globalAlpha = 1;
  }

  function burst(ctx, b) {
    const k = b.t / b.life; // 0..1
    const scale = k < 0.2 ? k / 0.2 : 1;
    const alpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    ctx.save();
    ctx.translate(b.x, b.y - k * 18);
    ctx.rotate(b.rot || -0.12);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    const size = b.size || 1;
    star(ctx, 0, 0, 11, 36 * size, 22 * size, k * 0.3);
    fillStroke(ctx, b.bg || "#d9a21b", 3);
    ctx.fillStyle = b.color || "#b3261e";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.font = "bold " + Math.round(22 * size) + "px Bangers, Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(b.text, 0, 1);
    ctx.fillText(b.text, 0, 1);
    ctx.restore();
  }

  /* ---------- Overlays ---------- */

  let layer = null;
  function getLayer(W, H, dpr) {
    if (!layer) layer = document.createElement("canvas");
    if (layer.width !== Math.round(W * dpr) || layer.height !== Math.round(H * dpr)) {
      layer.width = Math.round(W * dpr);
      layer.height = Math.round(H * dpr);
    }
    return layer;
  }

  function vignette(ctx, W, H) {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function fog(ctx, W, H, dpr, vx, vy, radius) {
    const l = getLayer(W, H, dpr);
    const c = l.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.globalCompositeOperation = "source-over";
    c.fillStyle = "rgba(190,194,196,0.94)";
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = "destination-out";
    const g = c.createRadialGradient(vx, vy, radius * 0.35, vx, vy, radius);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    ctx.drawImage(l, 0, 0, W, H);
  }

  function night(ctx, W, H, dpr, vx, vy, aim) {
    const l = getLayer(W, H, dpr);
    const c = l.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.globalCompositeOperation = "source-over";
    c.fillStyle = "rgba(8,10,20,0.88)";
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = "destination-out";
    const g = c.createRadialGradient(vx, vy, 30, vx, vy, 170);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    const cone = c.createLinearGradient(vx, vy - 40, vx, vy - 520);
    cone.addColorStop(0, "rgba(0,0,0,0.95)");
    cone.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = cone;
    c.beginPath();
    c.moveTo(vx - 26, vy - 40);
    c.lineTo(vx - 190, vy - 520);
    c.lineTo(vx + 190, vy - 520);
    c.lineTo(vx + 26, vy - 40);
    c.closePath();
    c.fill();
    const beam = c.createRadialGradient(vx, vy, 10, vx, vy, 360);
    beam.addColorStop(0, "rgba(0,0,0,0.9)");
    beam.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = beam;
    c.beginPath();
    c.moveTo(vx, vy);
    c.arc(vx, vy, 360, aim - 0.22, aim + 0.22);
    c.closePath();
    c.fill();
    ctx.drawImage(l, 0, 0, W, H);
  }

  ZSR.Draw = { road, prop, van, zombie, bullet, particle, burst, vignette, fog, night, rr, circle, star, fillStroke, INK };
})(typeof globalThis !== "undefined" ? globalThis : this);
