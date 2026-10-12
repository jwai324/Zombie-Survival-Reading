/* Procedural comic-book drawing: thick outlines, flat fills, burst words.
   Everything is drawn in CSS pixels; the caller scales for device pixel ratio. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  const INK = "#141414";
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

  /* ---------- Road and scenery ---------- */

  function road(ctx, W, H, roadX, roadW, scroll, theme) {
    const t = theme || {};
    // grass
    ctx.fillStyle = t.grass || "#8fcf6a";
    ctx.fillRect(0, 0, W, H);
    // darker grass stripes that scroll (gives a sense of motion off-road)
    ctx.fillStyle = t.grassDark || "rgba(0,0,0,0.07)";
    const stripe = 140;
    for (let y = (scroll % stripe) - stripe; y < H; y += stripe) {
      ctx.fillRect(0, y, W, stripe * 0.45);
    }
    // shoulders (dirt)
    ctx.fillStyle = t.shoulder || "#c9a56b";
    ctx.fillRect(roadX - 22, 0, 22, H);
    ctx.fillRect(roadX + roadW, 0, 22, H);
    // asphalt
    ctx.fillStyle = t.asphalt || "#4a4a52";
    ctx.fillRect(roadX, 0, roadW, H);
    // edge lines
    ctx.strokeStyle = "#f4f1e6";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(roadX + 10, 0);
    ctx.lineTo(roadX + 10, H);
    ctx.moveTo(roadX + roadW - 10, 0);
    ctx.lineTo(roadX + roadW - 10, H);
    ctx.stroke();
    // center dashes
    ctx.strokeStyle = "#ffcf40";
    ctx.lineWidth = 6;
    ctx.setLineDash([44, 36]);
    ctx.lineDashOffset = -scroll;
    ctx.beginPath();
    ctx.moveTo(roadX + roadW / 2, 0);
    ctx.lineTo(roadX + roadW / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);
    // road outline
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(roadX - 22, -4, roadW + 44, H + 8);
  }

  function prop(ctx, p) {
    const { x, y, kind } = p;
    ctx.save();
    ctx.translate(x, y);
    if (kind === "tree") {
      circle(ctx, 0, 0, p.size, "#3f9a46");
      circle(ctx, -p.size * 0.35, -p.size * 0.3, p.size * 0.45, "#5bbf5f", 2.5);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.arc(p.size * 0.3, p.size * 0.3, p.size * 0.55, 0, TAU);
      ctx.fill();
    } else if (kind === "bush") {
      circle(ctx, 0, 0, p.size, "#5aa64f");
      circle(ctx, p.size * 0.7, p.size * 0.2, p.size * 0.6, "#5aa64f");
      circle(ctx, -p.size * 0.6, p.size * 0.25, p.size * 0.55, "#5aa64f");
    } else if (kind === "rock") {
      rr(ctx, -p.size, -p.size * 0.7, p.size * 2, p.size * 1.4, p.size * 0.5);
      fillStroke(ctx, "#9c9ca8");
    } else if (kind === "sign") {
      ctx.fillStyle = "#6b4a2b";
      ctx.fillRect(-3, 0, 6, 26);
      rr(ctx, -18, -22, 36, 26, 4);
      fillStroke(ctx, p.color || "#ffcf40");
      ctx.fillStyle = INK;
      ctx.font = "bold 16px Bangers, Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.text || "!", 0, -9);
    } else if (kind === "wreck") {
      ctx.rotate(p.rot || 0);
      rr(ctx, -22, -40, 44, 80, 10);
      fillStroke(ctx, p.color || "#b5553c");
      rr(ctx, -16, -26, 32, 18, 4);
      fillStroke(ctx, "#8fb7c9", 2.5);
      ctx.fillStyle = INK;
      ctx.fillRect(-26, -24, 8, 16);
      ctx.fillRect(18, -24, 8, 16);
      ctx.fillRect(-26, 10, 8, 16);
      ctx.fillRect(18, 10, 8, 16);
    } else if (kind === "crate") {
      const bob = Math.sin(p.t * 5) * 2;
      ctx.translate(0, bob);
      rr(ctx, -18, -18, 36, 36, 4);
      fillStroke(ctx, "#c98a3e");
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-18, -18);
      ctx.lineTo(18, 18);
      ctx.moveTo(18, -18);
      ctx.lineTo(-18, 18);
      ctx.stroke();
      star(ctx, 14, -14, 8, 13, 7, p.t * 2);
      fillStroke(ctx, "#ffcf40", 2.5);
      ctx.fillStyle = INK;
      ctx.font = "bold 14px Bangers, Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 14, -13);
    }
    ctx.restore();
  }

  /* ---------- Van ---------- */

  function decal(ctx, kind, w, h) {
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = INK;
    if (kind === "stripe") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(-7, -h * 0.42, 14, h * 0.84);
      ctx.strokeRect(-7, -h * 0.42, 14, h * 0.84);
    } else if (kind === "flames") {
      ctx.beginPath();
      ctx.moveTo(-w * 0.4, -h * 0.1);
      for (let i = 0; i < 5; i++) {
        const x = -w * 0.4 + (i / 4) * w * 0.8;
        ctx.lineTo(x + w * 0.1, -h * 0.42 + (i % 2) * 12);
        ctx.lineTo(x + w * 0.2, -h * 0.2 + (i % 2) * 6);
      }
      ctx.lineTo(w * 0.4, -h * 0.1);
      ctx.closePath();
      fillStroke(ctx, "#ff7a1a", 2.5);
      ctx.beginPath();
      ctx.moveTo(-w * 0.25, -h * 0.12);
      ctx.lineTo(-w * 0.1, -h * 0.3);
      ctx.lineTo(0, -h * 0.14);
      ctx.lineTo(w * 0.1, -h * 0.32);
      ctx.lineTo(w * 0.25, -h * 0.12);
      ctx.closePath();
      ctx.fillStyle = "#ffcf40";
      ctx.fill();
    } else if (kind === "book") {
      rr(ctx, -16, -12, 32, 24, 3);
      fillStroke(ctx, "#fff", 2.5);
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(0, 12);
      ctx.stroke();
      ctx.strokeStyle = "#3aa0ff";
      ctx.lineWidth = 2;
      for (let i = -6; i <= 6; i += 4) {
        ctx.beginPath();
        ctx.moveTo(-12, i);
        ctx.lineTo(-4, i);
        ctx.moveTo(4, i);
        ctx.lineTo(12, i);
        ctx.stroke();
      }
    } else if (kind === "bolt") {
      ctx.beginPath();
      ctx.moveTo(4, -h * 0.38);
      ctx.lineTo(-10, 2);
      ctx.lineTo(0, 2);
      ctx.lineTo(-4, h * 0.38);
      ctx.lineTo(10, -2);
      ctx.lineTo(0, -2);
      ctx.closePath();
      fillStroke(ctx, "#ffcf40", 2.5);
    } else if (kind === "stars") {
      [[-14, -20], [12, -8], [-8, 14], [14, 20]].forEach(([x, y]) => {
        star(ctx, x, y, 5, 8, 3.5, -Math.PI / 2);
        fillStroke(ctx, "#fff", 2);
      });
    }
    ctx.restore();
  }

  /**
   * Draw the Bookmobile. opts: { upgrades, aim (radians, 0 = right, -PI/2 = up), t, hurt (0..1), scale }
   */
  function van(ctx, x, y, opts) {
    const u = opts.upgrades || { armor: 0, engine: 0, bumper: 0, paint: 0, damage: 0, fireRate: 0, spread: 0 };
    const look = ZSR.Upgrades.PAINT_LOOKS[Math.min(u.paint, ZSR.Upgrades.PAINT_LOOKS.length - 1)];
    const w = 64;
    const h = 112;
    const t = opts.t || 0;
    const s = opts.scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    rr(ctx, -w / 2 + 6, -h / 2 + 8, w, h, 12);
    ctx.fill();

    // wheels
    ctx.fillStyle = "#222";
    [[-w / 2 - 5, -h * 0.32], [w / 2 - 7, -h * 0.32], [-w / 2 - 5, h * 0.18], [w / 2 - 7, h * 0.18]].forEach(([wx, wy]) => {
      rr(ctx, wx, wy, 12, 24, 4);
      fillStroke(ctx, "#2b2b2b", 3);
    });

    // bumper spikes (front = top)
    if (u.bumper > 0) {
      const n = Math.min(5, u.bumper + 1);
      for (let i = 0; i < n; i++) {
        const sx = -w * 0.38 + (i / (n - 1)) * w * 0.76;
        ctx.beginPath();
        ctx.moveTo(sx - 6, -h / 2 + 2);
        ctx.lineTo(sx, -h / 2 - 10 - u.bumper * 2);
        ctx.lineTo(sx + 6, -h / 2 + 2);
        ctx.closePath();
        fillStroke(ctx, "#c8c8d0", 3);
      }
    }

    // body
    rr(ctx, -w / 2, -h / 2, w, h, 12);
    fillStroke(ctx, look.body);

    // armor plates on the sides
    for (let i = 0; i < u.armor; i++) {
      const py = -h * 0.36 + i * (h * 0.15);
      [-w / 2 - 2, w / 2 - 8].forEach((px) => {
        rr(ctx, px, py, 10, h * 0.12, 2);
        fillStroke(ctx, "#9c9ca8", 2.5);
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(px + 5, py + 4, 1.5, 0, TAU);
        ctx.arc(px + 5, py + h * 0.12 - 4, 1.5, 0, TAU);
        ctx.fill();
      });
    }

    // windshield (front)
    ctx.beginPath();
    ctx.moveTo(-w * 0.36, -h * 0.36);
    ctx.lineTo(w * 0.36, -h * 0.36);
    ctx.lineTo(w * 0.3, -h * 0.2);
    ctx.lineTo(-w * 0.3, -h * 0.2);
    ctx.closePath();
    fillStroke(ctx, "#bfefff", 3);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-w * 0.26, -h * 0.32);
    ctx.lineTo(-w * 0.1, -h * 0.32);
    ctx.stroke();

    // roof
    rr(ctx, -w * 0.4, -h * 0.16, w * 0.8, h * 0.56, 8);
    fillStroke(ctx, look.roof, 3);
    ctx.save();
    ctx.translate(0, h * 0.12);
    decal(ctx, look.decal, w * 0.8, h * 0.56);
    ctx.restore();

    // engine: hood scoop and exhaust puffs
    if (u.engine >= 2) {
      rr(ctx, -10, -h * 0.47, 20, 8, 3);
      fillStroke(ctx, "#2b2b2b", 2.5);
    }
    if (u.engine >= 1 && opts.moving !== false) {
      const puff = (t * 6) % 1;
      ctx.fillStyle = "rgba(255,255,255," + (0.6 - puff * 0.5) + ")";
      ctx.beginPath();
      ctx.arc(-w * 0.3, h / 2 + 6 + puff * 18, 5 + puff * 8 + u.engine, 0, TAU);
      ctx.fill();
    }

    // headlights
    circle(ctx, -w * 0.3, -h / 2 + 7, 5, "#fff6b0", 2.5);
    circle(ctx, w * 0.3, -h / 2 + 7, 5, "#fff6b0", 2.5);
    // tail lights
    ctx.fillStyle = "#e8392f";
    ctx.fillRect(-w * 0.4, h / 2 - 8, 12, 5);
    ctx.fillRect(w * 0.4 - 12, h / 2 - 8, 12, 5);

    // turret and barrels
    const aim = opts.aim == null ? -Math.PI / 2 : opts.aim;
    ctx.save();
    ctx.translate(0, h * 0.1);
    ctx.rotate(aim);
    const barrels = 1 + (u.spread || 0);
    const len = 22 + (u.damage || 0) * 3;
    for (let i = 0; i < barrels; i++) {
      const off = (i - (barrels - 1) / 2) * 7;
      rr(ctx, 6, off - 3, len, 6, 2);
      fillStroke(ctx, "#3b3b44", 2.5);
    }
    ctx.restore();
    circle(ctx, 0, h * 0.1, 11, "#5a5a66", 3);
    circle(ctx, 0, h * 0.1, 4, "#ffcf40", 2);

    // hurt flash
    if (opts.hurt > 0) {
      ctx.globalAlpha = Math.min(0.7, opts.hurt);
      rr(ctx, -w / 2, -h / 2, w, h, 12);
      ctx.fillStyle = "#ff5a4f";
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /* ---------- Zombies ---------- */

  const ZOMBIE_LOOK = {
    walker: { skin: "#7ed957", shirt: "#4b7bd1", hair: "#2d6a2d" },
    runner: { skin: "#9be36b", shirt: "#e8392f", hair: "#1f4d1f" },
    brute: { skin: "#5fb84a", shirt: "#8e5cff", hair: "#1a3d1a" },
  };

  function zombie(ctx, z, t) {
    const look = ZOMBIE_LOOK[z.type] || ZOMBIE_LOOK.walker;
    const r = z.r;
    const bob = Math.sin(t * (z.type === "runner" ? 14 : 7) + z.phase) * r * 0.18;
    ctx.save();
    ctx.translate(z.x, z.y);
    ctx.rotate(z.angle + Math.PI / 2); // sprite faces "up"; z.angle points at the van
    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(4, 6, r * 1.1, r * 0.9, 0, 0, TAU);
    ctx.fill();
    // shoulders / body
    rr(ctx, -r * 1.1, -r * 0.3, r * 2.2, r * 1.3, r * 0.5);
    fillStroke(ctx, look.shirt);
    // arms reaching forward
    [-1, 1].forEach((side) => {
      const ax = side * r * 0.75;
      const reach = r * 1.5 + bob * side;
      rr(ctx, ax - r * 0.22, -reach, r * 0.44, reach, r * 0.2);
      fillStroke(ctx, look.skin, 3);
      circle(ctx, ax, -reach, r * 0.3, look.skin, 2.5);
    });
    // head
    circle(ctx, 0, 0, r * 0.85, z.hit > 0 ? "#ffffff" : look.skin);
    // hair tuft
    ctx.fillStyle = look.hair;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.6);
    ctx.lineTo(-r * 0.1, -r * 1.1);
    ctx.lineTo(r * 0.15, -r * 0.65);
    ctx.lineTo(r * 0.45, -r * 1.0);
    ctx.lineTo(r * 0.4, -r * 0.5);
    ctx.closePath();
    ctx.fill();
    // googly eyes (cross-eyed, goofy)
    const ex = r * 0.32;
    const ey = -r * 0.1;
    circle(ctx, -ex, ey, r * 0.22, "#fff", 2);
    circle(ctx, ex, ey, r * 0.26, "#fff", 2);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(-ex + r * 0.08, ey, r * 0.09, 0, TAU);
    ctx.arc(ex - r * 0.06, ey + r * 0.05, r * 0.1, 0, TAU);
    ctx.fill();
    // mouth
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (z.type === "brute") {
      ctx.moveTo(-r * 0.3, r * 0.4);
      ctx.lineTo(r * 0.3, r * 0.4);
      ctx.moveTo(-r * 0.15, r * 0.3);
      ctx.lineTo(-r * 0.15, r * 0.5);
      ctx.moveTo(r * 0.15, r * 0.3);
      ctx.lineTo(r * 0.15, r * 0.5);
    } else {
      ctx.arc(0, r * 0.3, r * 0.25, 0.1, Math.PI - 0.1);
    }
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
      ctx.fillStyle = "#6cc644";
      ctx.fillRect(z.x - bw / 2, z.y - r * 1.9, bw * Math.max(0, z.hp / z.maxHp), 4);
    }
  }

  /* ---------- Bullets, particles, bursts ---------- */

  function bullet(ctx, b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(Math.atan2(b.vy, b.vx));
    rr(ctx, -8, -3, 16, 6, 3);
    fillStroke(ctx, "#ffcf40", 2.5);
    ctx.restore();
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
    ctx.translate(b.x, b.y - k * 20);
    ctx.rotate(b.rot || -0.12);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    const size = b.size || 1;
    star(ctx, 0, 0, 9, 34 * size, 22 * size, k * 0.4);
    fillStroke(ctx, b.bg || "#ffcf40", 3);
    ctx.fillStyle = b.color || "#e8392f";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.font = "bold " + Math.round(22 * size) + "px Bangers, Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(b.text, 0, 1);
    ctx.fillText(b.text, 0, 1);
    ctx.restore();
  }

  /* ---------- Weather overlays ---------- */

  let layer = null;
  function getLayer(W, H, dpr) {
    if (!layer) layer = document.createElement("canvas");
    if (layer.width !== Math.round(W * dpr) || layer.height !== Math.round(H * dpr)) {
      layer.width = Math.round(W * dpr);
      layer.height = Math.round(H * dpr);
    }
    return layer;
  }

  function fog(ctx, W, H, dpr, vx, vy, radius) {
    const l = getLayer(W, H, dpr);
    const c = l.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.globalCompositeOperation = "source-over";
    c.fillStyle = "rgba(225,228,232,0.93)";
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
    c.fillStyle = "rgba(10,14,40,0.86)";
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = "destination-out";
    // glow around the van
    const g = c.createRadialGradient(vx, vy, 30, vx, vy, 170);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    // headlight cone straight ahead
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
    // turret beam toward the aim direction
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

  ZSR.Draw = { road, prop, van, zombie, bullet, particle, burst, fog, night, rr, circle, star, fillStroke, INK };
})(typeof globalThis !== "undefined" ? globalThis : this);
