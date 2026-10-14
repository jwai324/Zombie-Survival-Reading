/* Art for River Landing (js/river.js) and the fishing pole, in the comic style (flat fills, thick ink,
   halftone), registered with ZSR.Draw3 by name:
   - floor "water" (the river, seen from the bank; the player cannot walk on it);
   - sprites: "riverSign" (the sign by the parking, its title in o.t), "dockPost" (a post with a note),
     "bobber" (o.dip: pulled under by a bite), "rodPropped" (the pole in a forked stick, o.ring: its bell
     shaking), "rodItem" (the pole lying on a floor), "reeds", "rock";
   - RiverArt.rodInHand(ctx, W, H, o): the pole in your hands, drawn over the view like the guns. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const D = ZSR.Draw3;
  if (!D) return;
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const { rng, halftone } = D;
  const FONT = "Oswald, Impact, sans-serif";

  function fillInk(ctx, fill, lw) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (lw !== 0) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw || 3;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }
  function box(ctx, x, y, w, h, fill, lw) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    fillInk(ctx, fill, lw);
  }
  function oval(ctx, x, y, rx, ry, fill, lw) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, TAU);
    fillInk(ctx, fill, lw);
  }
  function stroke(ctx, pts, color, lw) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  function shadow(ctx, x, y, r) {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.22, 0, 0, TAU);
    ctx.fill();
  }

  /* ---------- The river: brown-green water, current lines, a glint ---------- */
  D.registerFloor("water", (ctx, w, h) => {
    const r = rng(71);
    ctx.fillStyle = "#4a7286";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(60,80,60,0.25)";
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const x = r() * w;
      const y = r() * h;
      const len = 10 + r() * 16;
      ctx.strokeStyle = i % 3 ? "rgba(200,225,232,0.45)" : "rgba(20,40,52,0.45)";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + len / 2, y - 2, x + len, y);
      ctx.stroke();
    }
    halftone(ctx, w, h, 0.05);
  });

  /* ---------- Sprites (bottom edge = the ground) ---------- */
  /* The sign by the parking: a board on two posts, its title big, ruled lines under it (read it up close). */
  D.registerSprite("riverSign", 224, 192, (ctx, w, h, o) => {
    shadow(ctx, w / 2, h - 4, w * 0.36);
    box(ctx, 40, 70, 14, h - 72, "#6b5034", 4);
    box(ctx, w - 54, 70, 14, h - 72, "#6b5034", 4);
    box(ctx, 8, 8, w - 16, 112, "#2f5f4a", 6);
    box(ctx, 16, 16, w - 32, 96, null, 3);
    ctx.fillStyle = "#f1e8d0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = 34;
    ctx.font = "700 " + size + "px " + FONT;
    const t = String(o.t || "").toUpperCase();
    while (size > 12 && ctx.measureText(t).width > w - 48) ctx.font = "700 " + (size -= 2) + "px " + FONT;
    ctx.fillText(t, w / 2, 42);
    ctx.fillStyle = "rgba(241,232,208,0.75)";
    [70, 84, 98].forEach((y, i) => ctx.fillRect(34, y, w - 68 - i * 26, 5));
    // a fish on the board
    oval(ctx, w - 50, 92, 14, 7, "#d9a21b", 2);
  });
  /* A post at the head of the dock with a note nailed to it. */
  D.registerSprite("dockPost", 64, 160, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 3, 18);
    box(ctx, w / 2 - 8, 20, 16, h - 22, "#6b5034", 3.5);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (let y = 34; y < h - 10; y += 18) ctx.fillRect(w / 2 - 6, y, 12, 2);
    // the note
    ctx.save();
    ctx.translate(w / 2, 58);
    ctx.rotate(-0.08);
    box(ctx, -22, -24, 44, 50, "#f3eee0", 3);
    ctx.fillStyle = "rgba(15,16,18,0.55)";
    for (let y = -14; y < 20; y += 8) ctx.fillRect(-15, y, 30 - (y > 10 ? 10 : 0), 3);
    oval(ctx, 0, -20, 3, 3, "#b3261e", 1.5);
    ctx.restore();
    // a coil of rope at its foot
    oval(ctx, w / 2 + 14, h - 8, 12, 5, "#c9a27a", 2.5);
  });
  /* The float on the water: red over white, a ripple ring; o.dip pulls it under with a splash. */
  D.registerSprite("bobber", 48, 48, (ctx, w, h, o) => {
    const dip = !!o.dip;
    oval(ctx, w / 2, h - 8, dip ? 20 : 14, dip ? 6 : 4, null, 2);
    ctx.strokeStyle = "rgba(230,240,245,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 8, dip ? 22 : 16, dip ? 7 : 5, 0, 0, TAU);
    ctx.stroke();
    if (dip) {
      // under: just the tip and a splash
      oval(ctx, w / 2, h - 12, 5, 4, "#c42d24", 2);
      [[-12, -18], [0, -24], [12, -18]].forEach(([dx, dy]) => stroke(ctx, [[w / 2 + dx * 0.4, h - 14], [w / 2 + dx, h - 14 + dy * 0.6]], "#e8f2f5", 3));
      return;
    }
    stroke(ctx, [[w / 2, h - 30], [w / 2, h - 40]], INK, 2.5);
    ctx.beginPath();
    ctx.arc(w / 2, h - 20, 9, Math.PI, TAU);
    ctx.closePath();
    fillInk(ctx, "#c42d24", 2.5);
    ctx.beginPath();
    ctx.arc(w / 2, h - 20, 9, 0, Math.PI);
    ctx.closePath();
    fillInk(ctx, "#f3eee0", 2.5);
  });
  /* The pole propped in a forked stick on the bank, its line out; a bell on the tip (o.ring: shaking). */
  D.registerSprite("rodPropped", 160, 160, (ctx, w, h, o) => {
    shadow(ctx, 50, h - 4, 30);
    stroke(ctx, [[40, h - 2], [46, h - 46]], "#6b5034", 7);
    stroke(ctx, [[46, h - 46], [38, h - 62]], "#6b5034", 5);
    stroke(ctx, [[46, h - 46], [56, h - 60]], "#6b5034", 5);
    // the pole: butt on the ground, resting in the fork, up and out over the water
    stroke(ctx, [[12, h - 6], [w - 18, 22]], INK, 7);
    stroke(ctx, [[12, h - 6], [w - 18, 22]], "#b88a52", 4);
    stroke(ctx, [[14, h - 9], [34, h - 34]], "#4a3a2a", 9); // the cork grip
    oval(ctx, 34, h - 24, 9, 9, "#8d8a84", 2.5); // the reel
    // the line, out toward the water
    stroke(ctx, [[w - 18, 22], [w - 2, 64]], "rgba(240,240,240,0.9)", 1.5);
    const ring = !!o.ring;
    ctx.save();
    ctx.translate(w - 18, 30);
    ctx.rotate(ring ? 0.5 : 0);
    ctx.beginPath();
    ctx.moveTo(-7, 8);
    ctx.quadraticCurveTo(0, -12, 7, 8);
    ctx.closePath();
    fillInk(ctx, "#d9a21b", 2);
    ctx.restore();
    if (ring) {
      [[-14, 14], [16, 8], [-10, 36]].forEach(([dx, dy]) => stroke(ctx, [[w - 18 + dx, 30 + dy - 4], [w - 18 + dx * 1.5, 30 + dy - 10]], INK, 2.5));
    }
  });
  /* The pole lying on a floor (Station 12's equipment bay): rod, cork grip, reel, a tag on a string. */
  D.registerSprite("rodItem", 224, 48, (ctx, w, h) => {
    shadow(ctx, w / 2, h - 4, w * 0.42);
    stroke(ctx, [[10, h - 12], [w - 8, h - 22]], INK, 7);
    stroke(ctx, [[10, h - 12], [w - 8, h - 22]], "#b88a52", 4);
    stroke(ctx, [[12, h - 12], [52, h - 15]], "#4a3a2a", 9);
    oval(ctx, 58, h - 22, 9, 9, "#8d8a84", 2.5);
    // the tag
    stroke(ctx, [[90, h - 16], [100, h - 30]], INK, 1.5);
    ctx.save();
    ctx.translate(106, h - 34);
    ctx.rotate(-0.25);
    box(ctx, -8, -12, 30, 18, "#f1e8d0", 2.5);
    ctx.fillStyle = "rgba(15,16,18,0.6)";
    ctx.fillRect(-3, -7, 20, 2.5);
    ctx.fillRect(-3, -2, 14, 2.5);
    ctx.restore();
  });
  /* A leafy tree on the bank (o.v: 0..2, three shapes): a trunk and a round canopy in two greens. */
  D.registerSprite("riverTree", 176, 240, (ctx, w, h, o) => {
    const r = rng(101 + (o.v | 0) * 17);
    shadow(ctx, w / 2, h - 5, w * 0.34);
    ctx.beginPath();
    ctx.moveTo(w / 2 - 12, h - 4);
    ctx.lineTo(w / 2 - 7, h - 110);
    ctx.lineTo(w / 2 + 7, h - 110);
    ctx.lineTo(w / 2 + 12, h - 4);
    ctx.closePath();
    fillInk(ctx, "#5a4232", 3.5);
    const blobs = [[0, -150, 58], [-40, -120, 44], [40, -124, 46], [-20, -186, 40], [26, -180, 42], [0, -96, 40]].map(([dx, dy, rr]) => [w / 2 + dx + (r() - 0.5) * 12, h + dy + (r() - 0.5) * 10, rr * (0.85 + r() * 0.25)]);
    blobs.forEach(([x, y, rr]) => oval(ctx, x, y, rr, rr * 0.92, "#3f5a32", 4));
    blobs.forEach(([x, y, rr]) => oval(ctx, x - rr * 0.18, y - rr * 0.22, rr * 0.55, rr * 0.45, "#56733f", 0));
    halftone(ctx, w, h, 0.08);
  });
  D.registerSprite("reeds", 64, 112, (ctx, w, h) => {
    const r = rng(83);
    for (let i = 0; i < 9; i++) {
      const x = 8 + r() * (w - 16);
      const top = 10 + r() * 40;
      const lean = (r() - 0.5) * 18;
      stroke(ctx, [[x, h - 2], [x + lean, top]], INK, 4.5);
      stroke(ctx, [[x, h - 2], [x + lean, top]], i % 2 ? "#6f8a3c" : "#8a9a4c", 2.5);
      if (i % 3 === 0) oval(ctx, x + lean, top + 6, 3, 9, "#5a3e26", 2);
    }
  });
  D.registerSprite("rock", 96, 48, (ctx, w, h) => {
    ctx.beginPath();
    ctx.moveTo(6, h - 3);
    ctx.quadraticCurveTo(14, 10, 46, 8);
    ctx.quadraticCurveTo(84, 10, w - 6, h - 3);
    ctx.closePath();
    fillInk(ctx, "#7d7c76", 3);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(30, 16, 22, 4);
  });

  /* ---------- The pole in your hands ----------
     o: { bob (walk bob), bend 0..1 (a fish pulling), cast 0..1 (the swing of a cast, 1 at its start),
     raise 0..1 (just picked up), fish (a fish dangling from the tip), out (the line is in the water) }.
     Returns the tip on screen, where the line starts. */
  function rodInHand(ctx, W, H, o) {
    const s = Math.min(W, H) / 700;
    const bobX = Math.sin((o.bob || 0) * 0.5) * 8 * s;
    const bobY = Math.abs(Math.cos((o.bob || 0) * 0.5)) * 8 * s + (o.raise || 0) * 160 * s;
    const sw = o.cast || 0; // swung back over the shoulder at the start of a cast
    const hx = W * 0.74 + bobX;
    const hy = H + 30 * s + bobY;
    // the tip: up and out ahead; back over the shoulder in a cast; pulled down by a bite
    const bend = o.bend || 0;
    const tx = W * 0.56 + bobX + sw * W * 0.3 + bend * W * 0.02;
    const ty = H * (0.3 + (o.out ? 0.06 : 0)) + bobY - sw * H * 0.22 + bend * H * 0.16;
    const mx = (hx + tx) / 2 + bend * 40 * s;
    const my = (hy + ty) / 2 - (20 - bend * 30) * s;
    const rod = (color, lw) => {
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo(mx, my, tx, ty);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.stroke();
    };
    rod(INK, 13 * s);
    rod("#b88a52", 7 * s);
    // line guides along the rod
    for (let k = 1; k <= 3; k++) {
      const f = 0.35 + k * 0.17;
      const u = 1 - f;
      const gx = u * u * hx + 2 * u * f * mx + f * f * tx;
      const gy = u * u * hy + 2 * u * f * my + f * f * ty;
      oval(ctx, gx, gy, 5 * s, 5 * s, null, 2.5 * s);
    }
    // the cork grip and the reel, in the hands
    const gx = hx + (tx - hx) * 0.18;
    const gy = hy + (ty - hy) * 0.18;
    stroke(ctx, [[hx, hy], [gx, gy]], INK, 30 * s);
    stroke(ctx, [[hx, hy], [gx, gy]], "#8a6a46", 24 * s);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (let k = 1; k < 5; k++) ctx.fillRect(hx + (gx - hx) * (k / 5) - 6 * s, hy + (gy - hy) * (k / 5) - 1.5 * s, 12 * s, 3 * s);
    const rx = gx - 34 * s;
    const ry = gy + 16 * s;
    oval(ctx, rx, ry, 28 * s, 28 * s, "#8d8a84", 4 * s);
    oval(ctx, rx, ry, 14 * s, 14 * s, "#5f646b", 3 * s);
    stroke(ctx, [[rx, ry], [rx - 30 * s, ry + 4 * s]], INK, 6 * s);
    oval(ctx, rx - 32 * s, ry + 4 * s, 8 * s, 6 * s, "#4a3a2a", 3 * s);
    // the hands: a glove on the grip, another on the reel handle
    oval(ctx, hx - 6 * s, hy - 40 * s, 36 * s, 30 * s, "#5a4538", 4 * s);
    oval(ctx, rx - 34 * s, ry + 12 * s, 26 * s, 22 * s, "#5a4538", 4 * s);
    if (o.fish) {
      // the catch, hanging from the tip
      stroke(ctx, [[tx, ty], [tx, ty + 70 * s]], "rgba(240,240,240,0.95)", 2 * s);
      ctx.save();
      ctx.translate(tx, ty + 104 * s);
      ctx.rotate(Math.PI / 2 + Math.sin(o.fishT || 0) * 0.25);
      oval(ctx, 0, 0, 38 * s, 15 * s, "#9aa86a", 3.5 * s);
      ctx.beginPath();
      ctx.moveTo(32 * s, 0);
      ctx.lineTo(54 * s, -14 * s);
      ctx.lineTo(54 * s, 14 * s);
      ctx.closePath();
      fillInk(ctx, "#7f8f52", 3.5 * s);
      oval(ctx, -22 * s, -4 * s, 4 * s, 4 * s, "#f3eee0", 2 * s);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(-14 * s, -9 * s, 30 * s, 3 * s);
      ctx.restore();
    }
    return { x: tx, y: ty };
  }

  ZSR.RiverArt = { rodInHand };
})(typeof globalThis !== "undefined" ? globalThis : this);
