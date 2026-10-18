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

  /* ---------- What lies on the road ---------- */

  /** The junk the angled ground lays flat on the road (tyres, rubble) and a supply crate's lid, from above, at p.x,
      p.y (js/perspective.js: what stands, a tree, a barrel, a barrier, a sign, a wreck, is drawn standing there). */
  function prop(ctx, p) {
    const { x, y, kind } = p;
    ctx.save();
    ctx.translate(x, y);
    if (kind === "tire") {
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

  /** The paint job's decal (js/upgrades.js PAINT_LOOKS decal, in its decalA and decalB) on the roof panel, w x h
      round (0, 0), the nose up. SCALE: a new decal kind is a branch here (and in js/van3d.js). */
  function decal(ctx, kind, w, h, look) {
    const A = (look && look.decalA) || "#ebe6d7";
    const B = (look && look.decalB) || A;
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = INK;
    if (kind === "stripe") {
      ctx.fillStyle = A;
      ctx.fillRect(-6, -h * 0.45, 12, h * 0.9);
      ctx.strokeRect(-6, -h * 0.45, 12, h * 0.9);
    } else if (kind === "hazard") {
      ctx.save();
      ctx.beginPath();
      ctx.rect(-w * 0.42, h * 0.18, w * 0.84, h * 0.22);
      ctx.clip();
      ctx.fillStyle = A;
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
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = A;
      ctx.font = "700 15px Oswald, Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("B-66", 0, 6);
    } else if (kind === "patches") {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = A;
      [[-14, -18, 12, 9], [10, 4, 10, 14], [-6, 20, 16, 7]].forEach(([x, y, pw, ph]) => {
        rr(ctx, x, y, pw, ph, 3);
        ctx.fill();
      });
      // fresh rust round two of them
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = B;
      [[-12, -16, 5, 4], [12, 7, 4, 6]].forEach(([x, y, pw, ph]) => {
        rr(ctx, x, y, pw, ph, 2);
        ctx.fill();
      });
    } else if (kind === "flames") {
      // licking back from the front of the panel: the flame in decalA, its hot heart in decalB
      const flame = (k) => {
        ctx.beginPath();
        ctx.moveTo(-w * 0.42 * k, -h * 0.05 * k);
        for (let i = 0; i < 5; i++) {
          const x = -w * 0.42 * k + (i / 4) * w * 0.84 * k;
          ctx.lineTo(x + w * 0.1 * k, (-h * 0.4 + (i % 2) * 12) * k);
          ctx.lineTo(x + w * 0.2 * k, (-h * 0.18 + (i % 2) * 6) * k);
        }
        ctx.lineTo(w * 0.42 * k, -h * 0.05 * k);
        ctx.closePath();
      };
      flame(1);
      fillStroke(ctx, A, 2.5);
      ctx.save();
      ctx.translate(0, -h * 0.06);
      flame(0.62);
      ctx.fillStyle = B;
      ctx.fill();
      ctx.restore();
    } else if (kind === "lightning") {
      // two bolts down the panel, each with a shade line down its middle
      [[-w * 0.2, 1], [w * 0.22, -1]].forEach(([x0, f]) => {
        const s = f * w * 0.1;
        ctx.beginPath();
        ctx.moveTo(x0 + s * 0.6, -h * 0.44);
        ctx.lineTo(x0 - s * 0.9, -h * 0.02);
        ctx.lineTo(x0 + s * 0.1, -h * 0.02);
        ctx.lineTo(x0 - s * 0.7, h * 0.44);
        ctx.lineTo(x0 + s * 1.1, -h * 0.12);
        ctx.lineTo(x0 + s * 0.1, -h * 0.12);
        ctx.lineTo(x0 + s * 1.3, -h * 0.44);
        ctx.closePath();
        fillStroke(ctx, A, 2);
        ctx.strokeStyle = B;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x0 + s * 0.85, -h * 0.4);
        ctx.lineTo(x0 - s * 0.3, -h * 0.07);
        ctx.lineTo(x0 - s * 0.35, h * 0.3);
        ctx.stroke();
      });
    } else if (kind === "drips") {
      // toxic goo along the front of the panel, running back in drips of every length, a glint on the longest
      const top = -h * 0.46;
      const band = -h * 0.34;
      ctx.fillStyle = A;
      ctx.beginPath();
      ctx.rect(-w * 0.46, top, w * 0.92, band - top);
      ctx.fill();
      [[-0.36, 0.38, 3.2], [-0.2, 0.62, 2.6], [-0.05, 0.3, 3], [0.1, 0.78, 2.8], [0.26, 0.45, 3.4], [0.39, 0.25, 2.4]].forEach(([fx, fl, r]) => {
        const x = fx * w;
        const y = band + fl * h * 0.7;
        ctx.beginPath();
        ctx.moveTo(x - r * 0.7, band - 1);
        ctx.lineTo(x - r, y);
        ctx.arc(x, y, r, Math.PI, 0, true);
        ctx.lineTo(x + r * 0.7, band - 1);
        ctx.closePath();
        ctx.fill();
      });
      ctx.strokeStyle = B;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(w * 0.1 - 1, band + 2);
      ctx.lineTo(w * 0.1 - 1, band + 0.78 * h * 0.7 - 2);
      ctx.moveTo(-w * 0.4, top + 2);
      ctx.lineTo(w * 0.3, top + 2);
      ctx.stroke();
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
    ctx.restore();
  }

  /**
   * The Bookmobile from straight above, the map's van marker (js/map.js; everywhere else the van is the 3D model,
   * js/van3d.js): its paint job (PAINT_LOOKS: body, roof, the trim round the windshield and on the roof hatch, the
   * bumpers at each end, the rims' hubs at the wheels' outer sides, the decal on the roof), windows, gear and the
   * hurt flash. The map adds the roof gun (map.js drawRoofGun).
   * opts: { upgrades, t, hurt (0..1), scale, moving }
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

    // wheels with tread, each rim's hub showing at its outer side
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
      rr(ctx, wx < 0 ? wx - 1.5 : wx + 10.5, wy + 8, 4, 10, 1.5);
      fillStroke(ctx, look.rims, 1.5);
    });
    // the bumpers, just out from each end
    rr(ctx, -w / 2 + 5, -h / 2 - 4, w - 10, 10, 2.5);
    fillStroke(ctx, look.bumper, 2.5);
    rr(ctx, -w / 2 + 5, h / 2 - 6, w - 10, 10, 2.5);
    fillStroke(ctx, look.bumper, 2.5);

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

    // windshield (cracked), in its trim
    ctx.beginPath();
    ctx.moveTo(-w * 0.38, -h * 0.3);
    ctx.lineTo(w * 0.38, -h * 0.3);
    ctx.lineTo(w * 0.32, -h * 0.13);
    ctx.lineTo(-w * 0.32, -h * 0.13);
    ctx.closePath();
    ctx.lineJoin = "round";
    ctx.lineWidth = 9;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.strokeStyle = look.trim;
    ctx.stroke();
    fillStroke(ctx, "#2b3540", 2);
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
    // roof hatch, in the trim
    rr(ctx, -10, h * 0.26, 20, 12, 2);
    fillStroke(ctx, look.trim, 2.5);

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

  function vignette(ctx, W, H) {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
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
  /** The box (map units) the river's course lies in: a quadratic curve keeps within its three points. */
  let riverBox = null;
  function riverBounds(R) {
    if (!riverBox || riverBox.of !== R) {
      const pts = [].concat(...R.curves);
      riverBox = { of: R, x0: Math.min(...pts.map((p) => p[0])), y0: Math.min(...pts.map((p) => p[1])), x1: Math.max(...pts.map((p) => p[0])), y1: Math.max(...pts.map((p) => p[1])) };
    }
    return riverBox;
  }
  /** How far (world px) a point of the road's world is from the edge of the river's muddy bank: negative in it.
      scale: the road's px per map unit (the drive's own when left out). The course is js/streets.js RIVER. */
  function riverEdge(x, y, scale) {
    const S = ZSR.Streets;
    if (!S || !S.RIVER) return Infinity;
    const k = scale || (ZSR.Game && ZSR.Game.drive && ZSR.Game.drive.scale) || 1;
    const R = S.RIVER;
    const b = riverBounds(R);
    const reach = R.half * k + R.bank;
    // far off its box: no need for the exact distance
    const out = Math.max(b.x0 * k - x, x - b.x1 * k, b.y0 * k - y, y - b.y1 * k) - reach;
    if (out > 2000) return out;
    return S.riverDist(x / k, y / k) * k - reach;
  }
  /** Is a point of the road's world (px) in the river or on its muddy bank, or within margin px of it? */
  function inRiver(x, y, margin, scale) {
    return riverEdge(x, y, scale) < (margin || 0);
  }
  /** The river on the west of town, in world space: the course the city map draws (js/streets.js RIVER, map units x scale). */
  function riverBand(ctx, world, view) {
    const R = ZSR.Streets && ZSR.Streets.RIVER;
    if (!R) return;
    const k = world.scale || 1;
    const b = riverBounds(R);
    const reach = R.half * k + R.bank;
    if (view.x + view.r < b.x0 * k - reach || view.x - view.r > b.x1 * k + reach || view.y + view.r < b.y0 * k - reach || view.y - view.r > b.y1 * k + reach) return;
    const path = () => {
      ctx.beginPath();
      R.curves.forEach(([p0, p1, p2], i) => {
        if (!i) ctx.moveTo(p0[0] * k, p0[1] * k);
        ctx.quadraticCurveTo(p1[0] * k, p1[1] * k, p2[0] * k, p2[1] * k);
      });
    };
    const wide = 2 * R.half * k; // the water
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    path();
    ctx.strokeStyle = "#6b5a46"; // the muddy bank
    ctx.lineWidth = wide + 2 * R.bank;
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = wide + 8;
    ctx.stroke();
    ctx.strokeStyle = "#4f7f99";
    ctx.lineWidth = wide;
    ctx.stroke();
    // current lines, pinned to the water
    ctx.strokeStyle = "rgba(220,235,240,0.35)";
    ctx.lineWidth = 6;
    ctx.setLineDash([60, 140]);
    [-0.22, 0.05, 0.28].forEach((f) => {
      ctx.save();
      ctx.translate(f * wide, 0);
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

  ZSR.Draw = { prop, van, bullet, particle, burst, vignette, rr, circle, star, fillStroke, INK, ROOF, ground, cityRoads, laneZone, laneArrow, lot, signArrow, layoutSign, roadSign, signNote, nameBoard, card, wrapText };
  // the river's reach on the road (js/streets.js RIVER): what stands or grows by the road keeps out of it
  Object.assign(ZSR.Draw, { inRiver, riverEdge });
})(typeof globalThis !== "undefined" ? globalThis : this);
