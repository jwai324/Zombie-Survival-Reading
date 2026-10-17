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

    // engine: roof rack gear (clear of the tail lights), an exhaust stack, the light bar, then twin stacks
    if (u.engine >= 1) {
      rr(ctx, -w * 0.4, h * 0.4 - 8, 16, 10, 2);
      fillStroke(ctx, "#5f6b3c", 2.5);
      if (u.engine >= 2) {
        rr(ctx, w * 0.4 - 16, h * 0.4 - 8, 16, 10, 2);
        fillStroke(ctx, "#5f6b3c", 2.5);
      }
      const stack = (sx) => {
        circle(ctx, sx, h * 0.27, 7, "#1f2023", 2.5);
        circle(ctx, sx, h * 0.27, 3, "#9ea3aa", 1.5);
      };
      if (u.engine >= 3) stack(w * 0.26);
      if (u.engine >= 4) {
        rr(ctx, -12, -h * 0.47, 24, 8, 2);
        fillStroke(ctx, "#2b2d31", 2.5);
      }
      if (u.engine >= 5) {
        stack(-w * 0.26);
        ctx.fillStyle = "#ffd36b";
        [-8, -2, 4].forEach((lx) => ctx.fillRect(lx, -h * 0.47 + 2, 4, 4));
      }
    }
    if (opts.moving !== false) {
      const puff = (t * 5) % 1;
      ctx.fillStyle = "rgba(90,90,95," + (0.5 - puff * 0.45) + ")";
      ctx.beginPath();
      ctx.arc(-w * 0.3, h / 2 + 6 + puff * 20, 4 + puff * 9 + u.engine * 0.8, 0, TAU);
      ctx.fill();
      if (u.engine >= 5) {
        // the second stack puffs out of step with the first
        const p2 = (puff + 0.5) % 1;
        ctx.fillStyle = "rgba(90,90,95," + (0.5 - p2 * 0.45) + ")";
        ctx.beginPath();
        ctx.arc(w * 0.3, h / 2 + 6 + p2 * 20, 4 + p2 * 9 + u.engine * 0.8, 0, TAU);
        ctx.fill();
      }
    }

    // lights
    circle(ctx, -w * 0.3, -h / 2 + 7, 5, "#e9d58a", 2.5);
    circle(ctx, w * 0.3, -h / 2 + 7, 5, "#e9d58a", 2.5);
    ctx.fillStyle = "#b3261e";
    ctx.fillRect(-w * 0.42, h / 2 - 8, 12, 5);
    ctx.fillRect(w * 0.42 - 12, h / 2 - 8, 12, 5);

    // turret (the angled road camera draws its own, standing on the roof: opts.gun false)
    if (opts.gun !== false) {
      const aim = opts.aim == null ? -Math.PI / 2 : opts.aim;
      const ty = h * 0.1;
      circle(ctx, 0, ty, 13, "#2f3136", 3);
      ctx.save();
      ctx.translate(0, ty);
      ctx.rotate(aim);
      // every gun upgrade shows: Heavier Rounds lengthen the barrels (a brake from 3), Spread Shot adds
      // barrels, Rate of Fire adds a vented jacket (1), a drum magazine (2), cooling fins (3), a bigger drum
      // with a brass ring (4) and a copper jacket (5)
      const barrels = 1 + (u.spread || 0);
      const len = 24 + (u.damage || 0) * 3;
      const rof = u.fireRate || 0;
      if (rof >= 2) {
        const big = rof >= 4;
        const r = big ? 9.5 : 7;
        circle(ctx, -3, 14 + (big ? 2 : 0), r, big ? "#3a3d42" : "#5d636b", 2.5);
        circle(ctx, -3, 14 + (big ? 2 : 0), r * 0.4, "#2f3136", 2);
        if (big) {
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2;
            ctx.fillStyle = "#d9a21b";
            ctx.fillRect(-3 + Math.cos(a) * r * 0.72 - 1, 16 + Math.sin(a) * r * 0.72 - 1, 2.2, 2.2);
          }
        }
      }
      // the barrels fan out from the mount, each along the line its bullet flies (Upgrades.SPREAD apart)
      for (let i = 0; i < barrels; i++) {
        ctx.save();
        ctx.rotate((i - (barrels - 1) / 2) * ZSR.Upgrades.SPREAD);
        rr(ctx, 8, -3, len, 6, 1.5);
        fillStroke(ctx, "#3b3d44", 2.5);
        if (u.damage >= 3) {
          rr(ctx, 8 + len - 6, -4.5, 7, 9, 1.5);
          fillStroke(ctx, "#5a5d66", 2);
        }
        ctx.restore();
      }
      if (rof >= 1) {
        const half = ((barrels - 1) / 2) * 7 + 4.5;
        const jl = Math.min(len - 8, 14 + rof);
        if (rof >= 3) {
          ctx.fillStyle = rof >= 5 ? "#e0a066" : "#9ea3aa";
          for (let k = 0; k < 3; k++) {
            ctx.fillRect(12 + k * (jl / 3), -half - 3.5, 3, 3.5);
            ctx.fillRect(12 + k * (jl / 3), half, 3, 3.5);
          }
        }
        rr(ctx, 9, -half, jl, half * 2, 2);
        fillStroke(ctx, rof >= 5 ? "#b8733a" : "#4b5057", 2);
        ctx.fillStyle = rof >= 5 ? "#5a2a12" : "#0f1012";
        for (let x = 12; x < 9 + jl - 3; x += 4.5) ctx.fillRect(x, -1.2, 2.2, 2.4);
      }
      if (opts.flash > 0) {
        star(ctx, 8 + len + 6, 0, 6, 12 + opts.flash * 60, 5, t * 20);
        ctx.fillStyle = "rgba(255,236,170,0.95)";
        ctx.fill();
      }
      ctx.restore();
      circle(ctx, 0, ty, 5, "#9ea3aa", 2);
    }

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

  /* ---------- Walkers (the road, seen from above) ----------
     One look per WORLD.WALKER_TYPES id, drawn facing "up" (z.angle points at the van; the sprite turns to it),
     leaning in: the back of the shoulders and the head, the face tipped up at the van, boots stepping out behind.
     skin, shirt and hair (each variant's too) are the 3D look's (js/walker3d-looks.js), so a kind reads the same on
     the road and on foot: tests/validate-art.js holds the two tables to that. The seed picks a variant the way
     Walker3D does (seed % variants). A new kind is one row here; an unknown kind draws as a walker.
     Row fields: skin, shirt, hair, pants, boot (and sleeveCol, cuff, under, pads, helmetCol, visor, band, band2 for
     gear); top "tee" | "hoodie" | "tank" | "gown" | "coat" | "vest" | "turnout" and hem (where it ends behind, x r);
     sleeve "short" | "long" | "none"; hairStyle "messy" | "long" | "bald" | "none" (strands; hairWide and hairLen:
     long hair's half width at its ends and its length, x the head); hood; helmet "riot" | "fire"; shoulders (half
     width, x r); hip (half spacing, x r); stride (boot step, x r); drag (one boot drags); arms "reach" (one leads,
     reachSide) | "pump" (both straight ahead) | "hang" (low and swinging, one reaching) | "dangle" (long, elbowed,
     swinging wide) | "stiff" | "bent"; reach (hands in front, x r); armW (arm thickness x); head (radius x r),
     headFwd (x r), headLong (a long head); bob (arm swing speed); lurch (rad); sway (a slow side sway, rad); jerk (a
     twitchy, uneven tempo); mouthW (mouth width x); rip [x, along the back 0..1, size] and chestRip (the same on the
     chest, seen on a downed body); ribs (gore: ribs in the rips); fall "crumple" | "tree" | "fold" | "kneel" |
     "tumble" (as the 3D look). */
  const ZOMBIE_LOOK = {
    walker: {
      skin: "#9ca880", shirt: "#68748e", hair: "#5a3f2a", pants: "#4e5a80", boot: "#644a32",
      top: "tee", hem: 0.78, sleeve: "short", hairStyle: "messy", strands: 9,
      shoulders: 1.15, hip: 0.3, stride: 0.26, drag: 1, arms: "reach", reachSide: -1, reach: 1.6, armW: 1,
      head: 0.68, headFwd: 0.05, bob: 7, lurch: 0.08, mouthW: 1,
      rip: [0.42, 0.35, 0.42], chestRip: [0.3, 0.38, 0.5], ribs: true, fall: "crumple",
    },
    runner: {
      skin: "#9eaa82", shirt: "#3e3662", cuff: "#322c52", hair: "#24201e", pants: "#282c46", boot: "#5c4c3c",
      top: "hoodie", hem: 0.8, sleeve: "long", hood: true, hairStyle: "none",
      shoulders: 1, hip: 0.26, stride: 0.42, arms: "pump", reach: 1.8, armW: 0.9,
      head: 0.66, headFwd: 0.2, bob: 13, lurch: 0.04, mouthW: 1,
      rip: [-0.45, 0.5, 0.36], chestRip: [-0.2, 0.42, 0.42], ribs: true, fall: "tumble",
    },
    brute: {
      skin: "#96a576", shirt: "#bc8e56", hair: "#28241e", pants: "#624c38", boot: "#564230",
      top: "tank", hem: 0.8, sleeve: "none", hairStyle: "bald",
      shoulders: 1.45, hip: 0.42, stride: 0.2, arms: "hang", reachSide: -1, reach: 1.4, armW: 1.5,
      head: 0.54, headFwd: -0.02, bob: 5, lurch: 0.12, mouthW: 1.1,
      rip: [0.35, 0.45, 0.5], chestRip: [0.15, 0.4, 0.62], ribs: true, fall: "tree",
    },
    lanky: {
      skin: "#a6aa96", hair: "#2a2622", pants: "#5c6068", boot: "#463e38", hairStyle: "long",
      shoulders: 0.85, hip: 0.24, stride: 0.34, arms: "dangle", reach: 2.4, armW: 0.7,
      head: 0.56, headLong: 1.25, headFwd: 0.12, hairWide: 0.9, hairLen: 1.7, bob: 6, lurch: 0.1, sway: 0.12, mouthW: 0.9,
      ribs: true, fall: "fold",
      variants: [
        { shirt: "#afc0ba", top: "gown", hem: 1.2, sleeve: "short", rip: [0.3, 0.45, 0.36], chestRip: [0.28, 0.42, 0.44] },
        { shirt: "#6b5e4a", sleeveCol: "#625644", under: "#3a3a36", pants: "#3c3834", top: "coat", hem: 1.3, sleeve: "long", rip: [-0.3, 0.5, 0.34], chestRip: [-0.25, 0.45, 0.4] },
      ],
    },
    armored: {
      skin: "#929e7c", hair: "#2c2620", hairStyle: "none", sleeve: "long",
      shoulders: 1.3, hip: 0.32, stride: 0.2, arms: "stiff", reach: 1.5, armW: 1.2,
      head: 0.62, headFwd: 0.04, bob: 4.5, lurch: 0.05, mouthW: 1, fall: "kneel",
      variants: [
        { top: "vest", hem: 0.75, shirt: "#2d3a52", sleeveCol: "#2c303a", pants: "#26282e", boot: "#1e1e22", pads: "#3e4450", helmet: "riot", helmetCol: "#2b2f36", visor: "#8fa3b5" },
        { top: "turnout", hem: 1.05, shirt: "#a8915f", sleeveCol: "#a08a5a", cuff: "#463e30", pants: "#968054", boot: "#22201e", helmet: "fire", helmetCol: "#202023", band: "#d9d36a", band2: "#cfd3d6", rip: [0.4, 0.62, 0.3], chestRip: [0.35, 0.3, 0.36], ribs: false },
      ],
    },
    screamer: {
      skin: "#b4b8a4", shirt: "#702a38", hair: "#1d1a17", pants: "#342e34", boot: "#3a322e",
      top: "tee", hem: 0.75, sleeve: "short", hairStyle: "long",
      shoulders: 1, hip: 0.26, stride: 0.26, arms: "bent", reach: 1.25, armW: 0.82,
      head: 0.62, headFwd: 0.08, hairWide: 1.25, hairLen: 1.3, bob: 9, lurch: 0.1, jerk: true, mouthW: 1.5,
      rip: [-0.35, 0.4, 0.36], chestRip: [0.25, 0.4, 0.46], ribs: true, fall: "crumple",
    },
  };
  const BLOOD = "#76120e"; // the 3D look's blood (118, 18, 14), flesh and bone
  const BLOOD_DARK = "#4c0b08";
  const FLESH = "#541618";
  const BONE = "#e2d6b8";
  const SMEAR = "rgba(118,18,14,0.82)";
  const GRIME = "rgba(62,54,40,0.5)";
  const MOUTH = "#220c10";
  const TEETH = "#d6c896";
  const EYES = { socket: "#121314", glow: "rgba(255,214,70,0.42)", core: "#ffee96" }; // the 3D look's glowing yellow
  const EYES_FRENZY = { socket: "#160a08", glow: "rgba(255,90,60,0.55)", core: "#ffb49a" }; // a scream's frenzy
  const EYES_DEAD = { socket: "#121314", glow: null, core: "#6f6440" };
  /** Walker gore (blood, ribs, the pool) is on unless the one switch turns it off: WORLD.SETTINGS.walkerGore. */
  const walkerGore = () => !(ZSR.WORLD && ZSR.WORLD.SETTINGS && ZSR.WORLD.SETTINGS.walkerGore === false);
  /** A fixed number 0..1 from a walker's seed and a slot (smear spots, flung arms): the same every frame. */
  function hash01(seed, k) {
    const v = Math.sin((seed || 0) * 12.9898 + k * 78.233) * 43758.5453;
    return v - Math.floor(v);
  }
  // every row with its variants merged, and the shades the drawing needs, worked out once
  const LOOKS = {};
  Object.keys(ZOMBIE_LOOK).forEach((id) => {
    const row = ZOMBIE_LOOK[id];
    LOOKS[id] = (row.variants && row.variants.length ? row.variants : [{}]).map((v) => {
      const L = Object.assign({}, row, v);
      delete L.variants;
      L.id = id;
      L.sleeveCol = L.sleeveCol || L.shirt;
      L.skinD = shade(L.skin, -30);
      L.skinL = shade(L.skin, 18);
      L.skinRip = shade(L.skin, -58);
      L.shirtD = shade(L.shirt, -30);
      L.shirtL = shade(L.shirt, 20);
      L.hairD = shade(L.hair, -14);
      L.hairL = shade(L.hair, 26);
      if (L.helmetCol) L.helmetL = shade(L.helmetCol, 34);
      if (L.pads) L.padsL = shade(L.pads, 26);
      return L;
    });
  });
  /** The look a walker of `type` with `seed` wears (its variant), every colour already worked out. */
  function zombieLook(type, seed) {
    const ls = LOOKS[type] || LOOKS.walker;
    return ls[(Number(seed) >>> 0) % ls.length];
  }
  const yellSecs = () => (ZSR.WORLD && ZSR.WORLD.SCREAM && ZSR.WORLD.SCREAM.yell) || 1.2;

  /** An inked limb: shoulder (or hip) to hand (or foot), through an elbow (or knee) when xm is given. */
  function limb(ctx, x0, y0, xm, ym, x1, y1, w, col) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    if (xm != null) ctx.lineTo(xm, ym);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = INK;
    ctx.lineWidth = w + 2.6;
    ctx.stroke();
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.stroke();
  }
  /** A clawed hand at x, y, its fingers pointing along `ang`; s: the palm's radius. */
  function claw(ctx, x, y, ang, s, skin) {
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    ctx.beginPath();
    for (let f = -1.5; f <= 1.5; f += 1) {
      ctx.moveTo(x + ca * s * 0.6 - sa * f * s * 0.5, y + sa * s * 0.6 + ca * f * s * 0.5);
      ctx.lineTo(x + ca * s * (1.9 - Math.abs(f) * 0.25) - sa * f * s * 0.95, y + sa * s * (1.9 - Math.abs(f) * 0.25) + ca * f * s * 0.95);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = s * 0.5 + 2;
    ctx.stroke();
    ctx.strokeStyle = skin;
    ctx.lineWidth = s * 0.5;
    ctx.stroke();
    circle(ctx, x, y, s, skin, 2);
  }
  /** An arm from the shoulder (sx, sy) through the elbow (ex, ey) to the hand (hx, hy), in its sleeve. */
  function arm(ctx, L, r, sx, sy, ex, ey, hx, hy) {
    const w = r * 0.3 * L.armW;
    const ang = Math.atan2(hy - ey, hx - ex);
    if (L.sleeve === "long") {
      limb(ctx, sx, sy, ex, ey, hx, hy, w, L.sleeveCol);
      if (L.cuff) limb(ctx, ex + (hx - ex) * 0.72, ey + (hy - ey) * 0.72, null, 0, ex + (hx - ex) * 0.86, ey + (hy - ey) * 0.86, w * 1.05, L.cuff);
    } else {
      limb(ctx, sx, sy, ex, ey, hx, hy, w, L.skin);
      // the light side of a bare arm
      ctx.beginPath();
      ctx.moveTo(sx - w * 0.2, sy);
      ctx.lineTo(ex - w * 0.2, ey);
      ctx.lineTo(hx - w * 0.2, hy);
      ctx.strokeStyle = L.skinL;
      ctx.lineWidth = w * 0.3;
      ctx.stroke();
      if (L.sleeve === "short") limb(ctx, sx, sy, null, 0, sx + (ex - sx) * 0.42, sy + (ey - sy) * 0.42, w * 1.3, L.shirt);
    }
    claw(ctx, hx, hy, ang, r * 0.19 * Math.sqrt(L.armW), L.skin);
  }
  /** Both arms. walk: the swing (two phases); yw 0..1 blends to arms thrown up beside the head (a scream). */
  function arms(ctx, L, r, S, s1, s2, yw) {
    for (const side of [-1, 1]) {
      const sw = (side < 0 ? s1 : s2) * r * 0.22;
      const sx = side * S * 0.78;
      const sy = 0.05 * r;
      let hx;
      let hy;
      let ex = null;
      let ey = null;
      const reach = L.reach * r;
      if (L.arms === "pump") {
        hx = side * r * 0.42;
        hy = -reach + sw * 1.3;
      } else if (L.arms === "hang") {
        if (side === L.reachSide) {
          hx = side * S * 0.66;
          hy = -reach + sw;
        } else {
          hx = side * (S + 0.12 * r);
          hy = -0.3 * r + sw * 1.4;
        }
      } else if (L.arms === "dangle") {
        const out = sw * side * 0.9;
        ex = side * (S + 0.3 * r) + out;
        ey = -reach * 0.42 + sw * 0.5;
        hx = side * S * 0.8 + out * 1.6;
        hy = -reach + sw;
      } else if (L.arms === "stiff") {
        hx = side * S * 0.66;
        hy = -reach + sw * 0.35;
      } else if (L.arms === "bent") {
        ex = side * (S + 0.22 * r);
        ey = -0.4 * r + sw * 0.3;
        hx = side * S * 0.42 + sw * 0.4;
        hy = -reach + sw * 0.6;
      } else {
        // reach: one arm leads, the other a little behind it
        const lead = side === (L.reachSide || -1);
        hx = side * S * (lead ? 0.74 : 0.6);
        hy = -reach * (lead ? 1 : 0.82) + sw;
      }
      if (ex == null) {
        ex = (sx + hx) / 2 + side * r * 0.06;
        ey = (sy + hy) / 2;
      }
      if (yw > 0) {
        // thrown up beside the head: seen from above, short and out to the sides
        ex += (side * (S + 0.32 * r) - ex) * yw;
        ey += (0.05 * r - ey) * yw;
        hx += (side * 0.92 * r - hx) * yw;
        hy += (-0.3 * r - hy) * yw;
      }
      arm(ctx, L, r, sx, sy, ex, ey, hx, hy);
    }
  }
  /** Legs and boots from the hips at hipY to the feet at footY; step: -1..1 (the boots take turns). */
  function legs(ctx, L, r, hipY, footY, step, splay) {
    const hx = (L.hip || 0.3) * r;
    const st = (L.stride || 0.26) * r;
    for (const side of [-1, 1]) {
      const k = side < 0 ? step : -step;
      const drag = L.drag && side === L.drag ? 0.45 : 1;
      const fx = side * (hx * 1.12 + (splay || 0) * r);
      const fy = footY - k * st * drag;
      limb(ctx, side * hx, hipY, null, 0, fx, fy, r * 0.34, L.pants);
      ctx.beginPath();
      ctx.ellipse(fx, fy + 0.1 * r, 0.17 * r, 0.24 * r, 0, 0, TAU);
      fillStroke(ctx, L.boot, 2);
    }
  }
  /** A ragged tear: its jagged edge, skin (or flesh with gore) inside, ribs across it when the look has them. */
  function rip(ctx, L, x, y, size, gore, seed) {
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + 0.3;
      const rad = size * (i % 2 ? 0.55 : 1) * (0.75 + hash01(seed, i + 11) * 0.4);
      const px = x + Math.cos(a) * rad * 0.8;
      const py = y + Math.sin(a) * rad;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.closePath();
    fillStroke(ctx, gore ? FLESH : L.skinRip, 1.6);
    if (!gore || !L.ribs) return;
    ctx.beginPath();
    for (let i = -1; i <= 1; i++) {
      const ry = y + i * size * 0.38;
      ctx.moveTo(x - size * 0.45, ry + size * 0.08);
      ctx.quadraticCurveTo(x, ry - size * 0.12, x + size * 0.45, ry + size * 0.08);
    }
    ctx.strokeStyle = BONE;
    ctx.lineWidth = Math.max(1.2, size * 0.16);
    ctx.stroke();
  }
  /** The shirt (or gown, coat, vest...) from the shoulders at yT to its hem at yH (yT < yH), half width S at the
      shoulders. view "back" (leaning in, or face down) or "front" (lying on its back). */
  function torso(ctx, L, r, S, yT, yH, view, gore, seed) {
    const len = yH - yT;
    const tank = L.top === "tank";
    const top = tank ? S * 0.66 : S;
    const W2 = top * (L.top === "gown" || L.top === "coat" || L.top === "turnout" ? 0.86 : 0.8);
    if (tank) {
      // bare, heavy shoulders under the straps
      ctx.beginPath();
      ctx.ellipse(0, yT + len * 0.2, S, Math.max(0.3 * r, len * 0.28), 0, 0, TAU);
      fillStroke(ctx, L.skin, 2.2);
    }
    const shape = () => {
      ctx.beginPath();
      ctx.moveTo(-top * 0.5, yT);
      ctx.quadraticCurveTo(-top, yT, -top, yT + len * 0.3);
      ctx.lineTo(-W2, yH);
      for (let i = 1; i < 6; i++) ctx.lineTo(-W2 + (2 * W2 * i) / 6, yH + (i % 2 ? 0.12 : -0.03) * r);
      ctx.lineTo(W2, yH);
      ctx.lineTo(top, yT + len * 0.3);
      ctx.quadraticCurveTo(top, yT, top * 0.5, yT);
      ctx.closePath();
    };
    shape();
    fillStroke(ctx, L.shirt, 2.2);
    // the shade side (the light comes from the top left)
    ctx.beginPath();
    ctx.moveTo(top * 0.3, yT + len * 0.04);
    ctx.quadraticCurveTo(top * 0.92, yT + len * 0.04, top * 0.94, yT + len * 0.3);
    ctx.lineTo(W2 * 0.93, yH - 0.04 * r);
    ctx.lineTo(W2 * 0.28, yH - 0.04 * r);
    ctx.closePath();
    ctx.fillStyle = L.shirtD;
    ctx.fill();
    const at = (f) => yT + len * f; // a share of the way down the garment
    const half = (f) => top + (W2 - top) * Math.max(0, (f - 0.3) / 0.7); // its half width there
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = INK;
    if (L.top === "turnout") {
      // reflective bands, yellow with a silver stripe
      for (const f of [0.38, 0.74]) {
        const hw = half(f) * 0.97;
        limb(ctx, -hw, at(f), null, 0, hw, at(f), 0.17 * r, L.band);
        ctx.beginPath();
        ctx.moveTo(-hw, at(f));
        ctx.lineTo(hw, at(f));
        ctx.strokeStyle = L.band2;
        ctx.lineWidth = 0.06 * r;
        ctx.stroke();
      }
      if (view === "front") {
        ctx.beginPath();
        ctx.moveTo(0, at(0.08));
        ctx.lineTo(0, yH);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
    } else if (L.top === "vest") {
      ctx.beginPath();
      ctx.moveTo(0, at(0.1));
      ctx.lineTo(0, at(0.9));
      ctx.moveTo(-half(0.55) * 0.9, at(0.55));
      ctx.lineTo(half(0.55) * 0.9, at(0.55));
      ctx.stroke();
    } else if (L.top === "gown" && view === "back") {
      // a hospital gown, open at the back: skin down the gap, two ties across it
      ctx.beginPath();
      ctx.moveTo(-0.05 * r, at(0.12));
      ctx.lineTo(0.05 * r, at(0.12));
      ctx.lineTo(0.16 * r, yH);
      ctx.lineTo(-0.16 * r, yH);
      ctx.closePath();
      fillStroke(ctx, L.skinD, 1.4);
      ctx.beginPath();
      for (const f of [0.3, 0.6]) {
        ctx.moveTo(-0.16 * r, at(f));
        ctx.lineTo(0.16 * r, at(f));
      }
      ctx.strokeStyle = L.shirtL;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    } else if (L.top === "coat") {
      ctx.beginPath();
      if (view === "back") {
        ctx.moveTo(0, at(0.62));
        ctx.lineTo(0, yH + 0.1 * r);
        ctx.stroke();
      } else {
        // open down the front over a dark shirt
        ctx.moveTo(-top * 0.38, yT);
        ctx.lineTo(0, at(0.55));
        ctx.lineTo(top * 0.38, yT);
        ctx.closePath();
        fillStroke(ctx, L.under || "#3a3a36", 1.6);
      }
    } else if (L.top === "hoodie" && view === "front") {
      // the pocket
      rr(ctx, -top * 0.42, at(0.58), top * 0.84, len * 0.26, 3);
      ctx.fillStyle = L.shirtD;
      ctx.fill();
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
    if (L.top === "hoodie") {
      // the ribbed band at the hem
      ctx.beginPath();
      ctx.moveTo(-W2 * 0.96, yH - 0.06 * r);
      ctx.lineTo(W2 * 0.96, yH - 0.06 * r);
      ctx.strokeStyle = L.cuff || L.shirtD;
      ctx.lineWidth = 0.12 * r;
      ctx.stroke();
    }
    // a tear (on the chest, seen on a downed body), then smears: blood, or grime with gore off
    const tear = view === "front" ? L.chestRip : L.rip;
    if (tear && len > 0.35 * r) rip(ctx, L, tear[0] * r, at(tear[1]), tear[2] * r * Math.min(1, len / r), gore, seed);
    ctx.fillStyle = gore ? SMEAR : GRIME;
    ctx.beginPath();
    const n = L.top === "vest" ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const f = 0.2 + hash01(seed, i * 3) * 0.6;
      const sx = (hash01(seed, i * 3 + 1) - 0.5) * 1.3 * half(f);
      const ry = 0.09 * r + hash01(seed, i * 3 + 2) * 0.1 * r;
      const rot = hash01(seed, i + 40) * 2 - 1;
      ctx.moveTo(sx + ry * 2.2 * Math.cos(rot), at(f) + ry * 2.2 * Math.sin(rot));
      ctx.ellipse(sx, at(f), ry * 2.2, ry, rot, 0, TAU);
    }
    ctx.fill();
    if (tank) {
      // the deltoids over the straps
      for (const side of [-1, 1]) {
        circle(ctx, side * S * 0.8, yT + Math.max(0.12 * r, len * 0.2), 0.36 * r, L.skin, 2);
        ctx.beginPath();
        ctx.ellipse(side * S * 0.8 - 0.1 * r, yT + Math.max(0.12 * r, len * 0.2) - 0.1 * r, 0.14 * r, 0.1 * r, 0, 0, TAU);
        ctx.fillStyle = L.skinL;
        ctx.fill();
      }
    } else if (L.pads) {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * S * 0.84, yT + Math.max(0.1 * r, len * 0.16), 0.36 * r, 0.3 * r, 0, 0, TAU);
        fillStroke(ctx, L.pads, 2);
        ctx.beginPath();
        ctx.ellipse(side * S * 0.84 - 0.1 * r, yT + Math.max(0.1 * r, len * 0.16) - 0.08 * r, 0.14 * r, 0.09 * r, 0, 0, TAU);
        ctx.fillStyle = L.padsL;
        ctx.fill();
      }
    }
    if (view === "front" && (L.top === "tee" || L.top === "tank" || L.top === "gown")) {
      // the neckline
      ctx.beginPath();
      ctx.arc(0, yT, (L.top === "tank" ? 0.36 : 0.26) * r, 0, Math.PI);
      fillStroke(ctx, L.skinD, 1.4);
    }
  }
  /** Eyes in their sockets at (x +- dx, y); e: EYES, EYES_FRENZY or EYES_DEAD; s: size. */
  function eyes(ctx, x, y, dx, s, e) {
    ctx.fillStyle = e.socket;
    ctx.beginPath();
    ctx.ellipse(x - dx, y, s * 1.3, s, 0.2, 0, TAU);
    ctx.ellipse(x + dx, y, s * 1.3, s, -0.2, 0, TAU);
    ctx.fill();
    if (e.glow) {
      ctx.fillStyle = e.glow;
      ctx.beginPath();
      ctx.ellipse(x - dx, y, s * 1.15, s * 0.9, 0, 0, TAU);
      ctx.ellipse(x + dx, y, s * 1.15, s * 0.9, 0, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = e.core;
    ctx.beginPath();
    ctx.ellipse(x - dx, y, s * 0.55, s * 0.42, 0, 0, TAU);
    ctx.ellipse(x + dx, y, s * 0.55, s * 0.42, 0, 0, TAU);
    ctx.fill();
  }
  /** The head at (x, y), radius hr. fwd: -1 the face tips up toward -y (leaning in), +1 face up with the chin toward
      +y (lying on its back), 0 face down (only the back of the head). e: the eyes; mw: the mouth's size (1 normal). */
  function head(ctx, L, r, x, y, hr, fwd, e, mw, hit, gore, seed) {
    const hl = hr * (L.headLong || 1);
    const back = fwd === 0;
    const face = back ? 0 : fwd; // the way the face looks along y
    const crown = back ? 0 : -fwd; // the crown's side
    const capA = crown > 0 ? Math.PI / 2 : -Math.PI / 2; // the angle the crown points at
    // long hair under the head: a mass falling back over the shoulders, its ends ragged (hairWide: its half width
    // at the ends, x hr; hairLen: its length, x the head's)
    if (L.hairStyle === "long") {
      const dir = back ? 1 : crown;
      const wide = L.hairWide || 1.15;
      const len = (L.hairLen || 1.8) * hl;
      ctx.beginPath();
      ctx.moveTo(x - hr * 0.95, y);
      ctx.quadraticCurveTo(x - hr * (wide + 0.12), y + dir * len * 0.35, x - hr * wide, y + dir * len * 0.8);
      const n = 7;
      for (let i = 0; i <= n; i++) {
        const ln = (i % 2 ? 0.8 : 1) + hash01(seed, i + 60) * 0.14;
        ctx.lineTo(x - hr * wide + (2 * hr * wide * i) / n, y + dir * len * ln);
      }
      ctx.quadraticCurveTo(x + hr * (wide + 0.12), y + dir * len * 0.35, x + hr * 0.95, y);
      ctx.closePath();
      fillStroke(ctx, L.hair, 1.8);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const sx = (i / 3 - 0.5) * hr * wide * 1.3;
        ctx.moveTo(x + sx * 0.6, y + dir * hl * 0.7);
        ctx.quadraticCurveTo(x + sx * 1.1 + (hash01(seed, i + 70) - 0.5) * hr * 0.5, y + dir * len * 0.55, x + sx, y + dir * len * 0.85);
      }
      ctx.strokeStyle = L.hairL;
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    if (L.helmet === "fire") {
      // the brim, long at the back
      ctx.beginPath();
      ctx.ellipse(x, y + (back ? 0 : crown * hr * 0.25), hr * 1.32, hr * 1.5, 0, 0, TAU);
      fillStroke(ctx, L.helmetCol, 2.2);
    }
    // the skull (under a fire helmet's dome the face sits forward, out from under it)
    const fy = L.helmet === "fire" && !back ? y + face * hl * 0.35 : y;
    ctx.beginPath();
    ctx.ellipse(x, fy, hr, hl, 0, 0, TAU);
    fillStroke(ctx, hit ? "#ffffff" : L.skin, 2);
    if (!hit) {
      ctx.fillStyle = L.skinL;
      ctx.beginPath();
      ctx.ellipse(x - hr * 0.32, fy - hl * 0.12, hr * 0.32, hl * 0.26, -0.4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = L.skinD;
      ctx.beginPath();
      ctx.ellipse(x + hr * 0.42, fy + hl * 0.3, hr * 0.2, hl * 0.14, 0.5, 0, TAU);
      ctx.fill();
    }
    // the face: eyes, then the mouth toward the chin
    const ey = y + face * hl * (fwd < 0 ? 0.3 : 0.08);
    const my = y + face * hl * (fwd < 0 ? 0.66 : 0.5);
    const drawFace = (eyY, moY, sc) => {
      eyes(ctx, x, eyY, hr * 0.38 * sc, hr * 0.17 * sc, e);
      // brows over the eyes, toward the crown
      ctx.beginPath();
      ctx.moveTo(x - hr * 0.62 * sc, eyY - face * hl * 0.2);
      ctx.lineTo(x - hr * 0.1, eyY - face * hl * 0.07);
      ctx.moveTo(x + hr * 0.62 * sc, eyY - face * hl * 0.2);
      ctx.lineTo(x + hr * 0.1, eyY - face * hl * 0.07);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      const mwid = hr * 0.27 * mw * sc;
      const mh = hr * 0.15 * (0.8 + mw * 0.3) * sc;
      ctx.fillStyle = MOUTH;
      ctx.beginPath();
      ctx.ellipse(x, moY, mwid, mh, 0, 0, TAU);
      ctx.fill();
      // the top teeth, under the upper lip (on the eyes' side)
      ctx.fillStyle = TEETH;
      ctx.fillRect(x - mwid * 0.7, face > 0 ? moY - mh * 0.75 : moY + mh * 0.35, mwid * 1.4, mh * 0.4);
      if (gore) {
        ctx.fillStyle = BLOOD;
        ctx.fillRect(x + mwid * 0.2, face > 0 ? moY + mh * 0.6 : moY - mh * 1.9, mwid * 0.28, mh * 1.3);
      }
    };
    if (L.hood) {
      // the hood up: the face in its shadow
      const oy = y + (back ? 0 : face * hl * (fwd < 0 ? 0.42 : 0.12));
      ctx.beginPath();
      ctx.ellipse(x, y + crown * hl * 0.12, hr * 1.22, hl * 1.24, 0, 0, TAU);
      fillStroke(ctx, L.shirt, 2.2);
      ctx.fillStyle = L.shirtD;
      ctx.beginPath();
      ctx.ellipse(x + hr * 0.35, y + crown * hl * 0.3, hr * 0.7, hl * 0.75, 0.3, 0, TAU);
      ctx.fill();
      if (back) {
        ctx.beginPath();
        ctx.moveTo(x, y - hl * 1.0);
        ctx.lineTo(x, y + hl * 1.2);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        return;
      }
      ctx.beginPath();
      ctx.ellipse(x, oy, hr * 0.74, hl * 0.6, 0, 0, TAU);
      fillStroke(ctx, "#17141d", 1.8);
      ctx.beginPath();
      ctx.ellipse(x, oy + face * hl * 0.06, hr * 0.58, hl * 0.48, 0, 0, TAU);
      ctx.fillStyle = hit ? "#ffffff" : L.skinD;
      ctx.fill();
      drawFace(oy - face * hl * 0.05, oy + face * hl * 0.3, 0.72);
      // drawstrings
      ctx.beginPath();
      ctx.moveTo(x - hr * 0.5, oy + face * hl * 0.45);
      ctx.lineTo(x - hr * 0.42, oy + face * hl * 0.95);
      ctx.moveTo(x + hr * 0.5, oy + face * hl * 0.45);
      ctx.lineTo(x + hr * 0.46, oy + face * hl * 0.9);
      ctx.strokeStyle = "#d8d2c0";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      return;
    }
    if (L.helmet === "riot") {
      ctx.beginPath();
      ctx.ellipse(x, y, hr * 1.12, hl * 1.12, 0, 0, TAU);
      fillStroke(ctx, L.helmetCol, 2.2);
      ctx.beginPath();
      ctx.ellipse(x - hr * 0.35, y + crown * hl * 0.2 - (back ? hl * 0.2 : 0), hr * 0.38, hl * 0.22, -0.5, 0, TAU);
      ctx.fillStyle = L.helmetL;
      ctx.fill();
      if (back) return;
      // the visor across the face: dark, the eyes glowing through it, cracked
      const vy = y + face * hl * (fwd < 0 ? 0.48 : 0.12);
      ctx.beginPath();
      ctx.ellipse(x, vy, hr * 0.92, hl * 0.52, 0, 0, TAU);
      fillStroke(ctx, "#1d2229", 1.8);
      eyes(ctx, x, vy - face * hl * 0.06, hr * 0.36, hr * 0.15, e);
      ctx.beginPath();
      ctx.ellipse(x, vy, hr * 0.86, hl * 0.46, 0, 0, TAU);
      ctx.fillStyle = "rgba(143,163,181,0.32)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + hr * 0.5, vy - hl * 0.42);
      ctx.lineTo(x + hr * 0.25, vy - hl * 0.05);
      ctx.lineTo(x + hr * 0.42, vy + hl * 0.12);
      ctx.lineTo(x + hr * 0.18, vy + hl * 0.4);
      ctx.strokeStyle = L.visor;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      return;
    }
    if (L.helmet === "fire") {
      if (!back) drawFace(y + face * hl * 0.92, y + face * hl * 1.16, 0.78);
      // the dome over the brow, a comb along it
      const dy = back ? 0 : crown * hl * 0.18;
      ctx.beginPath();
      ctx.ellipse(x, y + dy, hr * 0.9, hl * 0.9, 0, 0, TAU);
      fillStroke(ctx, L.helmetCol, 2.2);
      ctx.beginPath();
      ctx.moveTo(x, y + dy - hl * 0.8);
      ctx.lineTo(x, y + dy + hl * 0.8);
      ctx.strokeStyle = L.helmetL;
      ctx.lineWidth = 0.14 * hr + 1;
      ctx.stroke();
      return;
    }
    if (L.hairStyle === "bald") {
      // a scalp with a stitched scar over the back
      ctx.beginPath();
      const sx0 = x - hr * 0.5;
      const sy0 = y + (back ? -0.2 : crown * 0.4) * hl;
      const sx1 = x + hr * 0.38;
      const sy1 = y + (back ? 0.35 : crown * 0.7) * hl;
      ctx.moveTo(sx0, sy0);
      ctx.lineTo(sx1, sy1);
      for (let i = 1; i < 4; i++) {
        const px = sx0 + ((sx1 - sx0) * i) / 4;
        const py = sy0 + ((sy1 - sy0) * i) / 4;
        ctx.moveTo(px - hr * 0.08, py + hr * 0.12);
        ctx.lineTo(px + hr * 0.08, py - hr * 0.12);
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    } else if (L.hairStyle === "messy" || L.hairStyle === "long") {
      // the hair over the crown: tufts round its back, a ragged fringe behind the brows (all of it seen from behind)
      ctx.beginPath();
      if (back) {
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * TAU;
          const rad = i % 2 ? 1.12 : 0.98;
          if (i) ctx.lineTo(x + Math.cos(a) * hr * rad, y + Math.sin(a) * hl * rad);
          else ctx.moveTo(x + Math.cos(a) * hr * rad, y + Math.sin(a) * hl * rad);
        }
      } else {
        const span = Math.PI * (fwd < 0 ? 0.5 : 0.4);
        const n = 10;
        for (let i = 0; i <= n; i++) {
          const a = capA - span + (2 * span * i) / n;
          const rad = i % 2 ? 1.14 : 1.01;
          if (i) ctx.lineTo(x + Math.cos(a) * hr * rad, y + Math.sin(a) * hl * rad);
          else ctx.moveTo(x + Math.cos(a) * hr * rad, y + Math.sin(a) * hl * rad);
        }
        // the fringe back across, its points toward the face
        const ex0 = Math.cos(capA + span) * hr;
        const ey0 = y + Math.sin(capA + span) * hl;
        for (let i = 1; i < 7; i++) ctx.lineTo(x + ex0 * (1 - (2 * i) / 7), ey0 + (i % 2 ? face * hl * 0.17 : 0));
      }
      ctx.closePath();
      fillStroke(ctx, L.hair, 1.8);
      // matted strands
      const cs = back ? 1 : crown;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const sx = (i / 3 - 0.5) * hr * 1.1 + (hash01(seed, i + 80) - 0.5) * hr * 0.2;
        ctx.moveTo(x + sx * 0.7, y + cs * hl * (back ? -0.5 : 0.18));
        ctx.quadraticCurveTo(x + sx * 1.15, y + cs * hl * 0.45, x + sx * 0.9 + hr * 0.1, y + cs * hl * 0.85);
      }
      ctx.strokeStyle = L.hairL;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    if (!back) drawFace(ey, my, 1);
  }

  /** A screamer's scream pose, 0..1, eased in and out (z.yell counts down from SCREAM.yell). */
  function yellPose(z) {
    const Y = yellSecs();
    const yl = Math.min(Y, z.yell || 0);
    return yl > 0 ? Math.max(0, Math.min(1, (Y - yl) / 0.15, yl / 0.25)) : 0;
  }
  /** Where a road walker is in its step at time t (a frenzy hurries it; a twitchy one's tempo stutters). */
  function stepPhase(L, z, t, frenzy) {
    const ph0 = z.phase || 0;
    const sp = L.bob * (frenzy ? 1.5 : 1);
    const ph = t * sp + ph0;
    return L.jerk ? ph + Math.sin(t * sp * 0.43 + ph0 * 2) * 0.9 : ph;
  }
  /** The way a road walker's body is turned: at the van, swaying with its lurch (still while it screams). */
  function bodyTurn(L, z, t, ph, yw) {
    const lurch = Math.sin(ph * 0.5) * L.lurch + (L.sway ? Math.sin(t * 1.3 + (z.phase || 0)) * L.sway : 0);
    return z.angle + Math.PI / 2 + lurch * (1 - yw);
  }
  /** The ground under a road walker turned by a, its centre at x, y: a shadow, which a frenzy reddens (amber with
      gore off, so it never reads as a pool of blood). */
  function shadowAt(ctx, L, r, frenzy, a, x, y) {
    const S = L.shoulders * r;
    const k = frenzy ? 1.15 : 1;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const ox = r * 0.22;
    const oy = r * 0.45;
    ctx.fillStyle = frenzy ? (walkerGore() ? "rgba(170,24,12,0.42)" : "rgba(214,120,30,0.4)") : "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(x + ox * c - oy * s, y + ox * s + oy * c, S * 1.05 * k, r * 1.2 * k, a, 0, TAU);
    ctx.fill();
  }
  /** Just a road walker's shadow (or its frenzy's glow): the road draws every walker's first, then the walkers
      with noShadow, so no shadow or glow lies over a body. */
  function zombieShadow(ctx, z, t) {
    const L = zombieLook(z.type, z.seed);
    const frenzy = z.frenzyT > 0;
    shadowAt(ctx, L, z.r, frenzy, bodyTurn(L, z, t, stepPhase(L, z, t, frenzy), yellPose(z)), z.x, z.y);
  }

  /* A walker on the road: its look, a stepping walk, arms clawing at the van. z: { type, seed, x, y, r, angle,
     phase, hit, hp, maxHp, yell (a screamer's scream, counting down), frenzyT (sped up by a scream) }. With gore on
     (WORLD.SETTINGS.walkerGore) its smears are blood and its rips show ribs; off, grime and bare skin. noShadow:
     the caller drew its shadow already (zombieShadow) or wants none. viewTurn: the angle the caller's view turns
     the world by (the road's camera), so a hurt walker's health bar is drawn level on the screen. */
  function zombie(ctx, z, t, noShadow, viewTurn) {
    const L = zombieLook(z.type, z.seed);
    const r = z.r;
    const gore = walkerGore();
    const frenzy = z.frenzyT > 0;
    const yw = yellPose(z);
    const ph0 = z.phase || 0;
    const ph = stepPhase(L, z, t, frenzy);
    const s1 = Math.sin(ph);
    const s2 = Math.sin(ph + 2.6);
    const S = L.shoulders * r;
    const hr = L.head * r;
    const seed = Number(z.seed) || 0;
    ctx.save();
    ctx.translate(z.x, z.y);
    ctx.rotate(bodyTurn(L, z, t, ph, yw));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (!noShadow) shadowAt(ctx, L, r, frenzy, 0, 0, 0);
    // a frenzy: speed lines trailing behind
    if (frenzy) {
      ctx.beginPath();
      for (let i = -1; i <= 1; i++) {
        const y0 = r * (1.5 + Math.abs(i) * 0.15);
        ctx.moveTo(i * S * 0.5, y0);
        ctx.lineTo(i * S * 0.5, y0 + r * (0.6 + 0.4 * Math.abs(Math.sin(t * 17 + i * 2 + ph0))));
      }
      ctx.strokeStyle = "rgba(15,16,18,0.75)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    const hemY = L.hem * r;
    legs(ctx, L, r, hemY - 0.25 * r, Math.max(hemY + 0.2 * r, 1.05 * r), yw > 0 ? 0 : s1, 0);
    if (yw < 0.5) arms(ctx, L, r, S, s1, s2, yw);
    torso(ctx, L, r, S, -0.32 * r, hemY, "back", gore, seed);
    // the head: tipped up at the van; a scream throws it back
    const hy = (-L.headFwd + yw * 0.3) * r;
    const hs = hr * (1 + yw * 0.08);
    const e = frenzy ? EYES_FRENZY : EYES;
    head(ctx, L, r, 0, hy, hs, -1, e, (L.mouthW || 1) * (1 + yw * 0.5), z.hit > 0, gore, seed);
    if (yw >= 0.5) arms(ctx, L, r, S, s1, s2, yw);
    if (yw > 0) {
      // the scream: ink arcs of sound in front
      const k0 = (t * 2.4) % 1;
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = INK;
      for (let i = 0; i < 3; i++) {
        const R = hs * 1.25 + (i + k0) * r * 0.42;
        ctx.globalAlpha = yw * Math.max(0, 1 - (i + k0) / 3);
        ctx.beginPath();
        ctx.arc(0, hy, R, -Math.PI / 2 - 0.7, -Math.PI / 2 + 0.7);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // hit flash
    if (z.hit > 0) {
      ctx.globalAlpha = Math.min(0.75, z.hit * 3);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(0, r * 0.2, S, r * 0.75, 0, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // health bar for anything that has taken damage: level over its head on the screen however the road turns
    // (viewTurn: the turn the road view draws the world with; the bar turns back by it)
    if (z.hp < z.maxHp) {
      const bw = r * 2;
      ctx.save();
      ctx.translate(z.x, z.y);
      if (viewTurn) ctx.rotate(-viewTurn);
      ctx.fillStyle = INK;
      ctx.fillRect(-bw / 2 - 1, -r * 1.9 - 1, bw + 2, 6);
      ctx.fillStyle = "#b3261e";
      ctx.fillRect(-bw / 2, -r * 1.9, bw * Math.max(0, Math.min(1, z.hp / z.maxHp)), 4);
      ctx.restore();
    }
  }

  /* A downed walker on the road: f { type, seed, x, y, size (its r), rot (the way it falls, world angle), life
     (counting down from max), max (Walker3D.FALL_SECS) }. It goes over its kind's way in the first TIP of its time
     (a brute topples stiff like a tree, a lanky folds over forward, an armored one drops to its knees then pitches
     forward, a runner tumbles, a walker or a screamer crumples back), lies still, and fades out over the last FADE.
     With gore on a pool of blood spreads under it. part: "ground" draws only what lies on the road (the pool, the
     shadow while it goes over), "body" only the rest; anything else both. The road draws every downed walker's
     ground before any body, so no pool lies over another body. */
  const DOWN = { tip: 0.25, fade: 0.35 };
  function zombieDown(ctx, f, part) {
    const L = zombieLook(f.type, f.seed);
    const r = f.size || 18;
    const max = f.max > 0 ? f.max : 2;
    const age = Math.max(0, Math.min(1, 1 - (Number(f.life) || 0) / max));
    const alpha = Math.max(0, Math.min(1, (Number(f.life) || 0) / (max * DOWN.fade)));
    if (alpha <= 0) return;
    const p = Math.min(1, age / DOWN.tip);
    const style = L.fall || "crumple";
    const gore = walkerGore();
    const seed = Number(f.seed) || 0;
    const sideK = hash01(seed, 7) < 0.5 ? -1 : 1;
    // forward fallers (fold, kneel) pitch toward the van and show their backs; the rest go over backward, face up
    const faceDown = style === "fold" || style === "kneel";
    let k; // how far over, 0..1
    let drop = 0; // a kneeler's first drop
    let spin = 0;
    let slide = 0;
    if (style === "tree") k = p * p;
    else if (style === "kneel") {
      drop = Math.min(1, p / 0.45);
      k = p < 0.45 ? 0 : Math.pow((p - 0.45) / 0.55, 1.5);
    } else if (style === "tumble") {
      k = 1 - (1 - p) * (1 - p);
      spin = sideK * 0.9 * k;
      slide = r * 0.7 * k;
    } else k = 1 - (1 - p) * (1 - p);
    const S = L.shoulders * r;
    const hr = L.head * r;
    const fold = style === "fold" ? 0.72 : 1;
    const lerp = (a, b) => a + (b - a) * k;
    // along the body (the head toward -y): from upright (everything over the spot) to lying full length
    const yHead = lerp(0, -1.7 * r * fold) - slide;
    const yT = lerp(-0.22 * r, -1.22 * r * fold) - slide;
    const yH = lerp(0.16 * r, (style === "fold" ? -0.2 : -0.22) * r) - slide;
    const yFoot = lerp(0.3 * r, (style === "fold" ? 0.1 : 0.48) * r) + drop * (1 - k) * 0.45 * r - slide * 0.5;
    const shrink = 1 - drop * (1 - k) * 0.08; // a kneeler sinks before it pitches over
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate((Number(f.rot) || 0) + (faceDown ? -Math.PI / 2 : Math.PI / 2) + spin);
    if (shrink !== 1) ctx.scale(shrink, shrink);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = alpha;
    const ground = part !== "body";
    // the pool, spreading once it is down
    if (ground && gore && age > DOWN.tip * 0.8) {
      const g = Math.min(1, (age - DOWN.tip * 0.8) / 0.3);
      const gs = g * (2 - g);
      const cy = (yT + yH) / 2 - 0.3 * r;
      ctx.fillStyle = BLOOD;
      ctx.beginPath();
      ctx.ellipse(0.1 * r, cy, S * 1.4 * gs + 1, r * 1.7 * gs + 1, 0.15, 0, TAU);
      ctx.fill();
      ctx.fillStyle = BLOOD_DARK;
      ctx.beginPath();
      ctx.ellipse(0, cy + 0.1 * r, S * 0.85 * gs + 0.5, r * 1.05 * gs + 0.5, 0.15, 0, TAU);
      ctx.fill();
    }
    // a shadow while it goes over
    if (ground && k < 1) {
      ctx.fillStyle = "rgba(0,0,0," + (0.3 * (1 - k)).toFixed(3) + ")";
      ctx.beginPath();
      ctx.ellipse(0.2 * r, (yHead + yFoot) / 2 + 0.3 * r, S * 1.05, Math.abs(yFoot - yHead) / 2 + r * 0.6, 0, 0, TAU);
      ctx.fill();
    }
    if (part === "ground") {
      ctx.restore();
      return;
    }
    // the legs: straight out, knees bent for a crumple, folded under for a fold
    const hx = (L.hip || 0.3) * r;
    for (const side of [-1, 1]) {
      const footX = side * (hx + (style === "tumble" ? 0.35 : style === "tree" ? 0.08 : 0.2) * r * k);
      let kx = null;
      let ky = 0;
      if (style === "crumple") {
        kx = side * (hx + 0.32 * r * k);
        ky = (yH + yFoot) / 2;
      } else if (style === "fold") {
        kx = side * (hx + 0.55 * r * k);
        ky = yFoot + 0.35 * r * k;
      }
      limb(ctx, side * hx, yH - 0.08 * r, kx, ky, footX, yFoot, r * 0.34, L.pants);
      ctx.beginPath();
      ctx.ellipse(footX, yFoot + 0.12 * r, 0.17 * r, 0.22 * r, 0, 0, TAU);
      fillStroke(ctx, L.boot, 2);
    }
    // the arms: from reaching, flung out (a toppling brute keeps them in)
    const reachL = L.reach * r * 0.72;
    for (const side of [-1, 1]) {
      const sx = side * S * 0.8;
      const sy = yT + 0.18 * r;
      const out = style === "tree" ? 0.25 + 0.35 * hash01(seed, side + 3) : 0.55 + 1.1 * hash01(seed, side + 3);
      const a = side * out * k * (faceDown ? 0.6 : 1); // from reaching at the van round to the sides
      const hx1 = sx + Math.sin(a) * reachL * (0.6 + 0.4 * k);
      const hy1 = faceDown ? sy - Math.cos(a) * reachL * 0.85 : sy + Math.cos(a) * reachL * (1 - 1.6 * k) * 0.8;
      const fa = Math.atan2(hy1 - sy, hx1 - sx);
      const ex = (sx + hx1) / 2 + Math.cos(fa + side * 1.2) * r * (L.arms === "dangle" || L.arms === "bent" ? 0.35 : 0.12);
      const ey = (sy + hy1) / 2 + Math.sin(fa + side * 1.2) * r * (L.arms === "dangle" || L.arms === "bent" ? 0.35 : 0.12);
      arm(ctx, L, r, sx, sy, ex, ey, hx1, hy1);
    }
    torso(ctx, L, r, S, yT, yH, faceDown ? "back" : "front", gore, seed);
    head(ctx, L, r, 0, yHead, hr, faceDown ? 0 : 1, EYES_DEAD, (L.mouthW || 1) * 0.9, false, gore, seed);
    // a toppled brute lands with a puff of dust
    if (style === "tree" && age > DOWN.tip && age < DOWN.tip + 0.12) {
      const q = (age - DOWN.tip) / 0.12;
      ctx.globalAlpha = alpha * (1 - q) * 0.8;
      ctx.fillStyle = "#6b675c";
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.4;
        const px = Math.cos(a) * (S + q * r * 0.8);
        const py = (yHead + yFoot) / 2 + Math.sin(a) * (Math.abs(yFoot - yHead) / 2 + q * r * 0.8);
        ctx.moveTo(px + r * (0.22 + q * 0.2), py);
        ctx.arc(px, py, r * (0.22 + q * 0.2), 0, TAU);
      }
      ctx.fill();
    }
    ctx.restore();
  }
  /** How far a walker's art reaches from its centre (its arms), px: for the sign's redraw of walkers under it. */
  function zombieExtent(z) {
    const L = zombieLook(z.type, z.seed);
    return z.r * Math.max(L.reach + 0.5, L.shoulders + 0.4, 1.9);
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
    const life = Math.max(0, Math.min(1, p.life / p.maxLife));
    ctx.globalAlpha = life;
    if (p.blood) {
      // a drop of blood flying (stretched along its way), or a splat on the road: no ink, it is wet
      const sp = Math.hypot(p.vx, p.vy);
      const s = p.size * (p.splat ? 1 : 0.5 + life * 0.5);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, s * (p.splat ? 1.5 : 1 + Math.min(2, sp / 90)), s * (p.splat ? 0.9 : 0.8), p.splat ? p.rot || 0 : Math.atan2(p.vy, p.vx), 0, TAU);
      ctx.fill();
    } else circle(ctx, p.x, p.y, p.size * (p.grow ? 1 + (1 - life) * 1.5 : life), p.color, 2);
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

  /* ---------- The city road, drawn in world space (js/game.js sets the camera) ---------- */

  const ROOF = { base: "#5b6b3a", gas: "#b3261e", store: "#3f5a8a", shop: "#4b5057", station: "#8a3a30", school: "#8a6a2e", hospital: "#9aa39a", utility: "#5f6b6e", industrial: "#6e6a60", mall: "#6b3f8a", library: "#3f7a6a", river: "#3f7aa0" };
  const DIRT = "#7a5c3e"; // a road past its paving
  /** Dead ground around the view: a flat fill plus patches and tufts pinned to the world, so the land slides by. */
  function ground(ctx, view, theme) {
    const t = theme || {};
    const R = view.r * 1.25;
    ctx.fillStyle = t.grass || "#5d5a3e";
    ctx.fillRect(view.x - R, view.y - R, R * 2, R * 2);
    const cell = 360;
    const x0 = Math.floor((view.x - R) / cell);
    const x1 = Math.floor((view.x + R) / cell);
    const y0 = Math.floor((view.y - R) / cell);
    const y1 = Math.floor((view.y + R) / cell);
    ctx.strokeStyle = "rgba(20,22,16,0.3)";
    ctx.lineWidth = 2;
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const r = seeded(((cx * 73856093) ^ (cy * 19349663)) >>> 0);
        for (let i = 0; i < 2; i++) {
          const rad = 22 + r() * 46;
          ctx.fillStyle = i ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.075)";
          ctx.beginPath();
          ctx.ellipse(cx * cell + r() * cell, cy * cell + r() * cell, rad, rad * (0.45 + r() * 0.4), r() * 3, 0, TAU);
          ctx.fill();
        }
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const x = cx * cell + r() * cell;
          const y = cy * cell + r() * cell;
          ctx.moveTo(x - 3, y - 6);
          ctx.lineTo(x, y);
          ctx.lineTo(x + 3, y - 6);
        }
        ctx.stroke();
      }
    }
  }

  function distSeg(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / l2));
    return Math.hypot(px - x0 - dx * t, py - y0 - dy * t);
  }
  function line(ctx, x0, y0, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  /**
   * Every road, side street and junction near the view, in passes so crossings merge:
   * ink, gravel shoulder, asphalt, then paint. world: { roads, sides, nodes } from ZSR.Streets;
   * G: Streets.GEOM; view: { x, y, r } in world px.
   */
  /** The river on the west of town, in world space: the same curve the city map draws (map units x scale). */
  function riverBand(ctx, world, view) {
    const k = world.scale || 1;
    if (view.x - view.r > 140 * k) return; // all of it lies west of x = 140 map units (SCALE: tied to js/map.js's river)
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(40 * k, 120 * k);
      ctx.quadraticCurveTo(90 * k, 330 * k, 60 * k, 520 * k);
      ctx.quadraticCurveTo(50 * k, 620 * k, 120 * k, 690 * k);
    };
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    path();
    ctx.strokeStyle = "#6b5a46"; // the muddy bank
    ctx.lineWidth = 26 * k + 90;
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 26 * k + 8;
    ctx.stroke();
    ctx.strokeStyle = "#4f7f99";
    ctx.lineWidth = 26 * k;
    ctx.stroke();
    // current lines, pinned to the water
    ctx.strokeStyle = "rgba(220,235,240,0.35)";
    ctx.lineWidth = 6;
    ctx.setLineDash([60, 140]);
    [-0.22, 0.05, 0.28].forEach((f) => {
      ctx.save();
      ctx.translate(f * 26 * k, 0);
      path();
      ctx.stroke();
      ctx.restore();
    });
    ctx.setLineDash([]);
  }

  function cityRoads(ctx, world, G, theme, view) {
    const t = theme || {};
    riverBand(ctx, world, view);
    const near = (s, pad) => distSeg(view.x, view.y, s.x0, s.y0, s.x1, s.y1) < view.r + pad;
    const roads = world.roads.filter((r) => near(r, G.half + 80));
    const sides = world.sides.filter((s) => near(s, G.sideHalf + 200));
    const nodes = world.nodes.filter((n) => n.deg > 0 && !n.water && Math.hypot(n.x - view.x, n.y - view.y) < view.r + G.boxR + 80);
    const ends = sides.filter((s) => s.kind === "deadEnd");
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    const pass = (color, grow, nodeR, endR) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2 * G.half + grow;
      roads.forEach((r) => line(ctx, r.x0, r.y0, r.x1, r.y1));
      ctx.lineWidth = 2 * G.sideHalf + grow;
      sides.forEach((s) => line(ctx, s.x0, s.y0, s.x1, s.y1));
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, nodeR, 0, TAU);
        ctx.fill();
      });
      ends.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x1, s.y1, endR, 0, TAU);
        ctx.fill();
      });
    };
    pass(INK, 2 * G.shoulder + 8, G.boxR + 14, G.sideHalf + G.shoulder + 44);
    pass(t.shoulder || "#78736a", 2 * G.shoulder, G.boxR + 10, G.sideHalf + G.shoulder + 40);
    pass(t.asphalt || "#35363b", 0, G.boxR - 16, G.sideHalf + 40);
    // a road that runs out of paving: packed dirt from there on, ruts and stones, to its end at the river
    roads.forEach((r) => {
      if (r.paved == null) return;
      const mx = r.x0 + (r.x1 - r.x0) * r.paved;
      const my = r.y0 + (r.y1 - r.y0) * r.paved;
      const len = Math.hypot(r.x1 - r.x0, r.y1 - r.y0);
      const ux = (r.x1 - r.x0) / len;
      const uy = (r.y1 - r.y0) / len;
      ctx.lineCap = "butt"; // a straight seam where the asphalt stops
      ctx.strokeStyle = t.dirt || DIRT;
      ctx.lineWidth = 2 * G.half + 2 * G.shoulder - 10;
      line(ctx, mx, my, r.x1, r.y1); // a square end at the water's edge
      // where the asphalt breaks up: ragged chunks
      const rr0 = seeded(Math.round(mx * 7 + my) >>> 0);
      ctx.fillStyle = t.asphalt || "#35363b";
      for (let i = 0; i < 14; i++) {
        // broken slabs, smaller the farther onto the dirt
        const along = rr0() * 90;
        const off = (rr0() - 0.5) * 2 * (G.half - 20);
        const sz = (1 - along / 110) * (14 + rr0() * 14);
        const cx = mx + ux * along - uy * off;
        const cy = my + uy * along + ux * off;
        const a0 = rr0() * TAU;
        ctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = a0 + (k * TAU) / 5;
          const rad = sz * (0.6 + rr0() * 0.5);
          ctx[k ? "lineTo" : "moveTo"](cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.lineCap = "butt";
      // wheel ruts down both sides, and stones
      ctx.strokeStyle = "rgba(60,44,28,0.55)";
      ctx.lineWidth = 16;
      ctx.setLineDash([90, 26]);
      [-G.lane * 1.35, -G.lane * 0.65, G.lane * 0.65, G.lane * 1.35].forEach((o) => line(ctx, mx + ux * 90 - uy * o, my + uy * 90 + ux * o, r.x1 - ux * 120 - uy * o, r.y1 - uy * 120 + ux * o));
      ctx.setLineDash([]);
      const rs = seeded(Math.round(len) + 31);
      ctx.fillStyle = "#a39a88";
      for (let a = 100; a < len * (1 - r.paved); a += 30) {
        const off = (rs() - 0.5) * 2 * (G.half + G.shoulder);
        ctx.fillRect(mx + ux * a - uy * off, my + uy * a + ux * off, 6, 5);
      }
    });
    // worn lane bands, then paint
    roads.forEach((r) => {
      const len = Math.hypot(r.x1 - r.x0, r.y1 - r.y0);
      const ux = (r.x1 - r.x0) / len;
      const uy = (r.y1 - r.y0) / len;
      const nx = -uy;
      const ny = ux;
      const a = G.boxR - 10;
      // no paint on dirt
      const b = (r.paved != null ? len * r.paved : len - G.boxR + 10);
      if (b <= a) return;
      const ln = (off) => line(ctx, r.x0 + ux * a + nx * off, r.y0 + uy * a + ny * off, r.x0 + ux * b + nx * off, r.y0 + uy * b + ny * off);
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth = 60;
      [-G.lane * 1.45, -G.lane * 0.55, G.lane * 0.55, G.lane * 1.45].forEach(ln);
      ctx.strokeStyle = "rgba(225,220,205,0.55)";
      ctx.lineWidth = 4;
      ctx.setLineDash([120, 18]);
      ln(G.half - 12);
      ln(-G.half + 12);
      ctx.strokeStyle = "rgba(225,220,205,0.6)";
      ctx.lineWidth = 5;
      ctx.setLineDash([40, 50]);
      ln(G.lane);
      ln(-G.lane);
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(214,176,60,0.75)";
      ctx.lineWidth = 4;
      ln(5);
      ln(-5);
    });
    sides.forEach((s) => {
      const len = Math.hypot(s.x1 - s.x0, s.y1 - s.y0);
      const ux = (s.x1 - s.x0) / len;
      const uy = (s.y1 - s.y0) / len;
      ctx.strokeStyle = "rgba(214,176,60,0.65)";
      ctx.lineWidth = 4;
      ctx.setLineDash([30, 30]);
      line(ctx, s.x0 + ux * (G.half + 30), s.y0 + uy * (G.half + 30), s.x1 - ux * 60, s.y1 - uy * 60);
      ctx.setLineDash([]);
    });
    // (the angled camera stands the ends up itself, js/perspective-buildings.js: its ground leaves them out)
    if (!(view && view.standing)) sides.forEach((s) => sideEnd(ctx, s, G));
  }

  /** What blocks the end of a side street: a dead end's rail, a closed road's barricade, a gate. */
  function sideEnd(ctx, s, G) {
    const len = Math.hypot(s.x1 - s.x0, s.y1 - s.y0);
    const ux = (s.x1 - s.x0) / len;
    const uy = (s.y1 - s.y0) / len;
    ctx.save();
    ctx.translate(s.x1, s.y1);
    ctx.rotate(Math.atan2(uy, ux) + Math.PI / 2); // local -y points out the street's end
    const w = G.sideHalf * 2;
    if (s.kind === "deadEnd") {
      ctx.translate(0, -G.sideHalf - 20);
      rr(ctx, -w * 0.6, -12, w * 1.2, 24, 4);
      fillStroke(ctx, "#e6dfcc", 3.5);
      ctx.fillStyle = INK;
      for (let x = -w * 0.6 + 8; x < w * 0.6 - 12; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, -12);
        ctx.lineTo(x + 14, -12);
        ctx.lineTo(x + 4, 12);
        ctx.lineTo(x - 10, 12);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.5;
      ctx.strokeRect(-w * 0.6, -12, w * 1.2, 24);
    } else if (s.kind === "closed") {
      ctx.translate(0, 40);
      for (const row of [-18, 18]) {
        rr(ctx, -w * 0.48, row - 10, w * 0.96, 20, 3);
        fillStroke(ctx, "#f3eee0", 3);
        ctx.save();
        ctx.beginPath();
        ctx.rect(-w * 0.48, row - 10, w * 0.96, 20);
        ctx.clip();
        ctx.fillStyle = "#d4621e";
        for (let x = -w * 0.5; x < w * 0.5; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, row - 10);
          ctx.lineTo(x + 16, row - 10);
          ctx.lineTo(x + 6, row + 10);
          ctx.lineTo(x - 10, row + 10);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      [-w * 0.6, w * 0.6].forEach((cx) => {
        ctx.beginPath();
        ctx.moveTo(cx, -16);
        ctx.lineTo(cx + 13, 14);
        ctx.lineTo(cx - 13, 14);
        ctx.closePath();
        fillStroke(ctx, "#d4621e", 3);
      });
    } else {
      // no through road: a heavy gate rail
      ctx.translate(0, -10);
      rr(ctx, -w * 0.55, -9, w * 1.1, 18, 4);
      fillStroke(ctx, "#8d8a84", 3.5);
      [-w * 0.55, w * 0.55].forEach((cx) => circle(ctx, cx, 0, 12, "#4b5057", 3));
    }
    ctx.restore();
  }

  /** Painted lane arrow in a lane-local frame (forward is -y): straight, or bending by `rel` radians. */
  function laneArrow(ctx, x, y, rel, len) {
    const L = len || 90;
    const pts = [[x, y]];
    let hx;
    let hy;
    let ha;
    if (Math.abs(rel) < 0.3) {
      hx = x + Math.sin(rel) * L;
      hy = y - Math.cos(rel) * L;
      ha = rel;
    } else {
      const a = Math.max(-2.3, Math.min(2.3, rel));
      pts.push([x, y - L * 0.5]);
      hx = x + Math.sin(a) * L * 0.5;
      hy = y - L * 0.5 - Math.cos(a) * L * 0.5;
      ha = a;
    }
    pts.push([hx, hy]);
    const shaft = () => {
      ctx.beginPath();
      pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.stroke();
    };
    const head = () => {
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(ha);
      ctx.beginPath();
      ctx.moveTo(0, -L * 0.3);
      ctx.lineTo(L * 0.22, 0);
      ctx.lineTo(-L * 0.22, 0);
      ctx.closePath();
      ctx.restore();
    };
    ctx.lineJoin = "round";
    ctx.lineCap = "butt";
    ctx.strokeStyle = INK;
    ctx.lineWidth = L * 0.2 + 6;
    shaft();
    head();
    ctx.fillStyle = "#ece6d4";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.fill();
    ctx.strokeStyle = "#ece6d4";
    ctx.lineWidth = L * 0.2;
    shaft();
  }

  /**
   * The lanes before a decision, in a frame where (0,0) is the stop line at the road's center,
   * +x is right and +y is back toward the van. zone: { len (px of lanes), n, ourLeft, rels: [turn per lane],
   * ways: [which way each lane goes] } (lanes that go the same way are split by a dashed line, others by a solid one).
   */
  function laneZone(ctx, z, G, theme) {
    const t = theme || {};
    const taper = 180;
    ctx.fillStyle = t.asphalt || "#35363b";
    ctx.fillRect(-G.half + 16, -2, 2 * G.half - 32, z.len + taper + 4);
    ctx.fillStyle = "rgba(255,255,255,0.035)";
    [-1.45, -0.55, 0.55, 1.45].forEach((f) => ctx.fillRect(G.lane * f - 30, -2, 60, z.len + taper + 4));
    ctx.lineCap = "butt";
    // the oncoming side: two lanes, or one where ours took a turn bay
    ctx.strokeStyle = "rgba(225,220,205,0.6)";
    ctx.lineWidth = 5;
    ctx.setLineDash([40, 50]);
    if (z.ourLeft >= 0) line(ctx, -G.lane, 0, -G.lane, z.len + taper);
    else line(ctx, -G.lane, z.len + 40, -G.lane, z.len + taper);
    ctx.setLineDash([]);
    // center line, shifted over where the road gives us a third lane
    ctx.strokeStyle = "rgba(214,176,60,0.85)";
    ctx.lineWidth = 4;
    [-5, 5].forEach((o) => {
      ctx.beginPath();
      ctx.moveTo(z.ourLeft + o, 0);
      ctx.lineTo(z.ourLeft + o, z.len);
      ctx.lineTo(o, z.len + taper);
      ctx.stroke();
    });
    // lane dividers (solid between ways, dashed within one), the stop line, and the arrows
    ctx.strokeStyle = "#ece6d4";
    for (let k = 1; k < z.n; k++) {
      const same = z.ways && z.ways[k] === z.ways[k - 1];
      ctx.lineWidth = same ? 5 : 7;
      ctx.setLineDash(same ? [40, 50] : []);
      line(ctx, z.ourLeft + k * G.lane, 0, z.ourLeft + k * G.lane, z.len);
    }
    ctx.lineWidth = 7;
    ctx.setLineDash([24, 26]);
    line(ctx, G.lane, z.len, G.lane, z.len + taper);
    ctx.setLineDash([]);
    ctx.lineWidth = 14;
    line(ctx, z.ourLeft + 2, 6, G.half - 14, 6);
    const rows = [];
    for (let y = 130; y < z.len - 60 || !rows.length; y += 340) rows.push(y);
    z.rels.forEach((rel, k) => {
      const x = z.ourLeft + G.lane * (k + 0.5);
      rows.forEach((y) => laneArrow(ctx, x, y, rel, 86));
    });
  }

  /** A place's building at the end of its own drive (or its road), facing down it: its lot and the building
      beyond. lot: { qx, qy, ux, uy, side } (streets.js endLot: x along the lot's front, y away from the drive's
      end, which is at y = G.half); look: { type }. River Landing has no building: a dock out over the water.
      opts (the angled camera's ground: js/perspective-buildings.js lotGround): standing leaves out what stands there
      (the building from above, the gas canopy, the door, River Landing's logs, dock and sign post); surface is the
      lot's own ground colour, stripes false leaves out the parking lines, extra a little more of its ground ("oil"
      stains, the "canopyPad" under the gas canopy). */
  function lot(ctx, L, G, look, opts) {
    const o = opts || {};
    const nx = -L.uy * L.side;
    const ny = L.ux * L.side;
    const v0 = G.half + G.shoulder + G.lotGap;
    const v1 = v0 + G.lotDepth;
    ctx.save();
    ctx.transform(L.ux, L.uy, nx, ny, L.qx, L.qy);
    if (look && look.type === "river") {
      if (!o.standing) riverDock(ctx, G);
      ctx.restore();
      return;
    }
    // apron from the end of the drive into the lot
    ctx.fillStyle = "#3b3c41";
    ctx.fillRect(-84, G.half - 14, 168, v0 - G.half + 30);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    line(ctx, -84, G.half + 4, -84, v0);
    line(ctx, 84, G.half + 4, 84, v0);
    // the lot
    rr(ctx, -G.lotHalf, v0, G.lotHalf * 2, G.lotDepth, 10);
    fillStroke(ctx, o.surface || "#68665f", 4);
    ctx.strokeStyle = "rgba(236,230,212,0.7)";
    ctx.lineWidth = 4;
    if (o.stripes !== false) {
      for (let x = -G.lotHalf + 30; x <= G.lotHalf - 30; x += 52) {
        if (Math.abs(x) < 80) continue;
        line(ctx, x, v0 + 24, x, v0 + 120);
      }
    }
    if (o.extra === "oil") {
      ctx.fillStyle = "rgba(20,20,24,0.35)";
      [[-120, v0 + 150, 34, 18], [40, v0 + 130, 26, 14], [150, v0 + 160, 40, 20], [-30, v0 + 60, 22, 12]].forEach(([x, y, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0.3, 0, TAU);
        ctx.fill();
      });
    } else if (o.extra === "canopyPad") {
      // the pale concrete under the gas canopy (to the right as the van drives in: lot x -G.lotHalf + 2 ..)
      rr(ctx, -G.lotHalf + 2, v0 + 8, 156, 146, 6);
      fillStroke(ctx, "#8d8a84", 3);
    }
    if (o.standing) {
      // the building, its canopy and its door stand (js/perspective-buildings.js)
      ctx.restore();
      return;
    }
    // the building, seen from above
    const bx = -G.lotHalf + 22;
    const by = v0 + 168;
    const bw = G.lotHalf * 2 - 44;
    const bh = v1 - by - 18;
    const roof = ROOF[look && look.type] || "#4b5057";
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(bx + 10, by + 10, bw, bh);
    rr(ctx, bx, by, bw, bh, 4);
    fillStroke(ctx, roof, 4);
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 3;
    ctx.strokeRect(bx + 12, by + 12, bw - 24, bh - 24);
    rr(ctx, bx + bw * 0.62, by + bh * 0.3, 46, 34, 3);
    fillStroke(ctx, "#8d8a84", 3);
    rr(ctx, bx + bw * 0.2, by + bh * 0.4, 30, 30, 3);
    fillStroke(ctx, "#4b5057", 3);
    if (look && look.type === "gas") {
      // pump canopy out front
      rr(ctx, -G.lotHalf + 50, v0 + 20, 150, 100, 4);
      fillStroke(ctx, "#e6dfcc", 3.5);
      ctx.fillStyle = "#b3261e";
      ctx.fillRect(-G.lotHalf + 50, v0 + 20, 150, 16);
    }
    // the door, facing the drive
    ctx.fillStyle = INK;
    ctx.fillRect(-26, by - 4, 52, 10);
    ctx.restore();
  }

  /** River Landing, where Frog Lane's dirt road runs out at the water's edge (y = G.half): log stops across the
      road in front of the parked van, the sign post, and the dock out over the water. */
  function riverDock(ctx, G) {
    const y0 = G.half - 110;
    // log stops
    for (let x = -150; x < 150; x += 80) {
      rr(ctx, x, y0, 66, 20, 9);
      fillStroke(ctx, "#6b4a2e", 3);
    }
    // the dock: planks out from the bank, on posts
    const d0 = y0 + 50;
    const d1 = d0 + 520;
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(-52, d0 + 10, 112, d1 - d0);
    rr(ctx, -60, d0, 120, d1 - d0, 4);
    fillStroke(ctx, "#a8825a", 4);
    ctx.strokeStyle = "rgba(60,40,20,0.5)";
    ctx.lineWidth = 3;
    for (let y = d0 + 26; y < d1; y += 26) line(ctx, -58, y, 58, y);
    [d0 + 40, (d0 + d1) / 2, d1 - 20].forEach((y) => {
      circle(ctx, -60, y, 10, "#5a4538", 3);
      circle(ctx, 60, y, 10, "#5a4538", 3);
    });
    // the sign post by the end of the road
    circle(ctx, 190, y0 - 60, 12, "#5a4538", 3);
    rr(ctx, 160, y0 - 100, 64, 26, 3);
    fillStroke(ctx, "#e6dfcc", 3);
  }

  /* ---------- Signs and cards: screen space, readable at any text size ---------- */

  /** Arrow glyph for a sign: straight up, or bending by `rel` radians. Centered at (x, y), size s. */
  function signArrow(ctx, x, y, rel, s, color) {
    const a = Math.max(-2.4, Math.min(2.4, rel));
    ctx.save();
    ctx.translate(x, y + s * 0.38);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = s * 0.17;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    let hx;
    let hy;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    if (Math.abs(a) < 0.3) {
      hx = Math.sin(a) * s * 0.62;
      hy = -Math.cos(a) * s * 0.62;
      ctx.lineTo(hx, hy);
    } else {
      ctx.lineTo(0, -s * 0.36);
      hx = Math.sin(a) * s * 0.42;
      hy = -s * 0.36 - Math.cos(a) * s * 0.42;
      ctx.lineTo(hx, hy);
    }
    ctx.stroke();
    ctx.translate(hx, hy);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.3);
    ctx.lineTo(s * 0.24, 0);
    ctx.lineTo(-s * 0.24, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  const SIGN_LOOK = {
    guide: { bg: "#1f6b3f", fg: "#f3eee0", rule: "#f3eee0" },
    street: { bg: "#1f6b3f", fg: "#f3eee0", rule: "#f3eee0" },
    place: { bg: "#f3eee0", fg: "#0f1012", rule: "#0f1012" },
  };
  const BADGE = { deadEnd: ["#f0c247", INK], noThrough: ["#f3eee0", INK], closed: ["#d4621e", "#f3eee0"] };
  function wrapText(ctx, text, maxW) {
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = "";
    words.forEach((w) => {
      const tryLine = cur ? cur + " " + w : w;
      if (cur && ctx.measureText(tryLine).width > maxW) {
        lines.push(cur);
        cur = w;
      } else cur = tryLine;
    });
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  }
  /** Lay out a sign: { style, rows: [{ rel, text, badge, badgeKind }] } at size k, no wider than maxW
      (fits: false when a word is too long for that and would run past its edge). */
  function layoutSign(ctx, sign, k, maxW) {
    const pad = 12 * k;
    const fs = Math.round(25 * k);
    const bs = Math.round(17 * k);
    const arrow = 40 * k;
    const lineH = fs * 1.12;
    const textMax = Math.max(60 * k, maxW - arrow - pad * 3);
    ctx.font = "700 " + fs + "px Oswald, Impact, sans-serif";
    let w = 0;
    let h = pad;
    const rows = sign.rows.map((r) => {
      ctx.font = "700 " + fs + "px Oswald, Impact, sans-serif";
      const lines = wrapText(ctx, String(r.text).toUpperCase(), textMax);
      let tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
      let rh = Math.max(arrow, lines.length * lineH);
      let badge = null;
      if (r.badge) {
        ctx.font = "700 " + bs + "px Oswald, Impact, sans-serif";
        const bl = wrapText(ctx, String(r.badge).toUpperCase(), textMax - 12 * k);
        const bw = Math.max(...bl.map((l) => ctx.measureText(l).width)) + 14 * k;
        badge = { lines: bl, w: bw, h: bl.length * bs * 1.15 + 8 * k };
        tw = Math.max(tw, bw);
        rh = Math.max(arrow, lines.length * lineH + 6 * k + badge.h);
      }
      const row = { r, lines, y: h, h: rh, badge };
      w = Math.max(w, arrow + pad * 3 + tw);
      h += rh + pad;
      return row;
    });
    return { w: Math.min(maxW, w), h, rows, k, fs, bs, lineH, pad, arrow, fits: w <= maxW + 0.5 };
  }
  /** Draw a laid-out sign with its top-left at (x, y). alpha fades it. */
  function roadSign(ctx, x, y, sign, lay, alpha) {
    const look = SIGN_LOOK[sign.style] || SIGN_LOOK.guide;
    const k = lay.k;
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = INK;
    ctx.fillRect(x + 6 * k, y + 6 * k, lay.w, lay.h);
    rr(ctx, x, y, lay.w, lay.h, 8 * k);
    fillStroke(ctx, look.bg, 4);
    rr(ctx, x + 5 * k, y + 5 * k, lay.w - 10 * k, lay.h - 10 * k, 5 * k);
    ctx.strokeStyle = look.rule;
    ctx.lineWidth = 2 * k;
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    lay.rows.forEach((row, i) => {
      const ry = y + row.y;
      if (i > 0) {
        ctx.strokeStyle = look.rule;
        ctx.globalAlpha = (alpha == null ? 1 : alpha) * 0.5;
        ctx.lineWidth = 2 * k;
        line(ctx, x + lay.pad, ry - lay.pad / 2, x + lay.w - lay.pad, ry - lay.pad / 2);
        ctx.globalAlpha = alpha == null ? 1 : alpha;
      }
      signArrow(ctx, x + lay.pad + lay.arrow / 2, ry + lay.arrow / 2 - 2 * k, row.r.rel, lay.arrow, look.fg);
      ctx.fillStyle = look.fg;
      ctx.font = "700 " + lay.fs + "px Oswald, Impact, sans-serif";
      const tx = x + lay.pad * 2 + lay.arrow;
      const textH = row.lines.length * lay.lineH + (row.badge ? 6 * k + row.badge.h : 0);
      let ty = ry + Math.max(0, (row.h - textH) / 2) + lay.lineH / 2;
      row.lines.forEach((l) => {
        ctx.fillText(l, tx, ty);
        ty += lay.lineH;
      });
      if (row.badge) {
        const [bg, fg] = BADGE[row.r.badgeKind] || BADGE.deadEnd;
        const by = ty - lay.lineH / 2 + 6 * k;
        rr(ctx, tx, by, row.badge.w, row.badge.h, 3 * k);
        fillStroke(ctx, bg, 2.5);
        ctx.fillStyle = fg;
        ctx.font = "700 " + lay.bs + "px Oswald, Impact, sans-serif";
        row.badge.lines.forEach((l, j) => ctx.fillText(l, tx + 7 * k, by + 4 * k + lay.bs * 1.15 * (j + 0.5)));
      }
    });
    ctx.restore();
  }
  /** A paper strip under a sign with a line of help, at most w wide; draws at (x, y) and returns its height (measure only when draw is false). */
  function signNote(ctx, x, y, w, text, k, alpha, draw) {
    const fs = Math.round(17 * k);
    const pad = 8 * k;
    ctx.save();
    ctx.font = "700 " + fs + "px Oswald, Impact, sans-serif";
    const lines = wrapText(ctx, String(text), w - pad * 2); // sentence case: easier to read than the signs' capitals
    const h = lines.length * fs * 1.2 + pad * 2;
    if (draw !== false) {
      ctx.globalAlpha = alpha == null ? 1 : alpha;
      const bw = Math.min(w, Math.max(...lines.map((l) => ctx.measureText(l).width)) + pad * 2);
      rr(ctx, x, y, bw, h, 4 * k);
      fillStroke(ctx, "#f0c247", 3);
      ctx.fillStyle = INK;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      lines.forEach((l, i) => ctx.fillText(l, x + pad, y + pad + fs * 1.2 * (i + 0.5)));
    }
    ctx.restore();
    return h;
  }
  /** A small board with a place's name, centered on (x, y). */
  function nameBoard(ctx, x, y, text, k, hot) {
    const fs = Math.round(15 * k);
    ctx.save();
    ctx.font = "700 " + fs + "px Oswald, Impact, sans-serif";
    const w = ctx.measureText(text).width + 16 * k;
    const h = fs + 10 * k;
    rr(ctx, x - w / 2, y - h / 2, w, h, 3 * k);
    fillStroke(ctx, hot ? "#f0c247" : "#f3eee0", 3);
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y + 1);
    ctx.restore();
  }
  /** Full-screen card over a fade: a message and a smaller line under it, centered below `top`. a: 0..1 */
  function card(ctx, W, H, msg, sub, a, k, top) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, a) * 0.94;
    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = Math.max(0, Math.min(1, a * 1.6 - 0.3));
    if (msg) {
      const fs = Math.round(36 * k);
      const ss = Math.round(24 * k);
      const maxW = Math.min(W - 40, 760 * Math.max(1, k * 0.8));
      ctx.font = "700 " + fs + "px Oswald, Impact, sans-serif";
      const lines = wrapText(ctx, msg, maxW - 48 * k);
      ctx.font = "600 " + ss + "px Inter, Segoe UI, sans-serif";
      const sl = sub ? wrapText(ctx, sub, maxW - 48 * k) : [];
      const w = Math.min(maxW, Math.max(...lines.map((l) => (ctx.font = "700 " + fs + "px Oswald, Impact, sans-serif", ctx.measureText(l).width)), ...sl.map((l) => (ctx.font = "600 " + ss + "px Inter, Segoe UI, sans-serif", ctx.measureText(l).width))) + 48 * k);
      const h = lines.length * fs * 1.15 + (sl.length ? 16 * k + sl.length * ss * 1.3 : 0) + 40 * k;
      const x = (W - w) / 2;
      const y = Math.max((H - h) / 2, Math.min(H - h - 8, (top || 0) + (H - (top || 0) - h) / 2));
      ctx.fillStyle = INK;
      ctx.fillRect(x + 8 * k, y + 8 * k, w, h);
      ctx.save();
      ctx.translate(W / 2, y + h / 2);
      ctx.rotate(-0.012);
      ctx.translate(-W / 2, -y - h / 2);
      rr(ctx, x, y, w, h, 4);
      fillStroke(ctx, "#f0c247", 5);
      ctx.fillStyle = INK;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 " + fs + "px Oswald, Impact, sans-serif";
      let ty = y + 20 * k + fs * 0.58;
      lines.forEach((l) => {
        ctx.fillText(l, W / 2, ty);
        ty += fs * 1.15;
      });
      if (sl.length) {
        ty += 16 * k - fs * 0.58 + ss * 0.65;
        ctx.font = "600 " + ss + "px Inter, Segoe UI, sans-serif";
        sl.forEach((l) => {
          ctx.fillText(l, W / 2, ty);
          ty += ss * 1.3;
        });
      }
      ctx.restore();
    }
    ctx.restore();
  }

  ZSR.Draw = { road, prop, van, zombie, zombieShadow, zombieDown, zombieLook, zombieExtent, ZOMBIE_LOOK, ZOMBIE_DOWN: DOWN, walkerGore, bullet, particle, burst, vignette, fog, night, rr, circle, star, fillStroke, INK, ROOF, ground, cityRoads, laneZone, laneArrow, lot, signArrow, layoutSign, roadSign, signNote, nameBoard, card, wrapText };
})(typeof globalThis !== "undefined" ? globalThis : this);
