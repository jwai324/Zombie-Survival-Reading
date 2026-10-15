/* The angled road camera: a test of a view down the road from behind and above the van, on one drive only
   (PERSP_ROUTES in js/game.js; every other drive keeps the flat, top-down camera).
   Mode-7 style: the ground (grass, roads, lanes, lots, junk lying about) is drawn top-down with the road's own
   art (js/sprites.js) into a few offscreen layers, nearer ones sharper, then copied onto the screen in thin
   strips, each scaled for how far away its row of ground is. Standing things (buildings, trees, walkers, the
   van) are drawn after, far to near, at their projected spot: a shadow on the ground, a body, and the top-down
   art lifted to its height. The road sign, the names over the buildings, the HUD and the minimap stay flat.
   The camera is pitched down cfg.pitch degrees; the van sits at cfg.vanAt of the screen's height, drawn
   cfg.scale times the road's zoom; ground past cfg.far fades into haze. The roof gun's shots fly at GUN_Z,
   so a shot goes where the pointer is on the screen. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
    return "rgb(" + f(n >> 16) + "," + f((n >> 8) & 255) + "," + f(n & 255) + ")";
  }
  const BODY = { walker: "#4a4f3a", runner: "#5a3d38", brute: "#3d4048" };
  const GUN_Z = 36; // the height shots fly at: walkers' heads are drawn at 32, the van's roof at 50
  const VAN_Z = 50;
  const FADE_IN = 0.5; // seconds a new walker takes to come out of the weeds

  const Persp = {
    cfg: { pitch: 30, fov: 60, vanAt: 0.8, scale: 1.55, far: 3600 },
    GUN_Z,
    res: 1, // ground layer resolution: eased down while frames run slow, back up when they don't
    canvases: [],

    /** The camera for this frame: where it sits, behind the road camera's spot, and how it projects. */
    setup(g) {
      const c = this.cfg;
      const th = (c.pitch * Math.PI) / 180;
      const sn = Math.sin(th);
      const cs = Math.cos(th);
      const f = g.H / 2 / Math.tan((c.fov * Math.PI) / 360);
      const v0 = (g.H / 2 - g.H * c.vanAt) / f;
      const bh = (cs + v0 * sn) / (sn - v0 * cs); // how far behind, per unit of height, puts the van at vanAt
      const h = f / (c.scale * g.zoom * (bh * cs + sn));
      const a = g.cam.th;
      this.k = { sn, cs, f, cx: g.W / 2, cy: g.H / 2, h, b: bh * h, ox: g.cam.x, oy: g.cam.y, Fx: Math.cos(a), Fy: Math.sin(a), Rx: -Math.sin(a), Ry: Math.cos(a), W: g.W, H: g.H, far: c.far };
      return this.k;
    },
    /** World (x, y, height) -> screen, with s the px per world unit there and Y how far ahead; null behind the camera. */
    project(x, y, z) {
      const k = this.k;
      const dx = x - k.ox;
      const dy = y - k.oy;
      const X = dx * k.Rx + dy * k.Ry;
      const Yb = dx * k.Fx + dy * k.Fy + k.b;
      const dz = k.h - (z || 0);
      const d = Yb * k.cs + dz * k.sn;
      if (d < 5) return null;
      return { x: k.cx + (k.f * X) / d, y: k.cy - (k.f * (Yb * k.sn - dz * k.cs)) / d, s: k.f / d, d, Y: Yb - k.b };
    },
    /** How far ahead the flat at height z seen at screen row sy is (Infinity at or above its horizon). */
    groundY(sy, z) {
      const k = this.k;
      const h = k.h - (z || 0);
      const v = (k.cy - sy) / k.f;
      const den = k.sn - v * k.cs;
      return den <= 1e-6 ? Infinity : (h * (k.cs + v * k.sn)) / den - k.b;
    },
    depthAt(Y, z) {
      const k = this.k;
      return (Y + k.b) * k.cs + (k.h - (z || 0)) * k.sn;
    },
    /** Screen -> the point under it on the flat at height z (the ground when z is left out), no farther than the haze. */
    unproject(sx, sy, z) {
      const k = this.k;
      const Y = Math.min(this.groundY(sy, z), k.far);
      const X = ((sx - k.cx) * this.depthAt(Y, z)) / k.f;
      return { x: k.ox + k.Rx * X + k.Fx * Y, y: k.oy + k.Ry * X + k.Fy * Y };
    },
    /** The road's toScreen / toWorld on this camera (the ground). */
    toScreen(g, x, y) {
      this.setup(g);
      const p = this.project(x, y, 0);
      return p ? { x: p.x, y: p.y } : { x: g.W / 2, y: g.H * 3 };
    },
    toWorld(g, sx, sy) {
      this.setup(g);
      return this.unproject(sx, sy, 0);
    },

    /** The roof gun: its mount (h * 0.1 behind the van's middle, as sprites.js draws it), the world angle to what
        is under the pointer at the height shots fly, and that angle on the screen (for the headlights at night).
        Aim assist: with a pointer, a walker right under it; keys only, the walker closest to straight ahead. */
    aim(g, assist) {
      const k = this.setup(g);
      const van = g.van;
      const fx = Math.cos(van.heading);
      const fy = Math.sin(van.heading);
      const mx = van.x - fx * van.h * 0.1;
      const my = van.y - fy * van.h * 0.1;
      let tx = mx + k.Fx * 600;
      let ty = my + k.Fy * 600;
      const p = g.pointer;
      if (p.seen) {
        const t = this.unproject(p.x, p.y, GUN_Z);
        tx = t.x;
        ty = t.y;
      }
      if (assist) {
        let best = p.seen ? Infinity : 0.42;
        const ahead = Math.atan2(ty - my, tx - mx);
        for (const z of g.zombies) {
          if (p.seen) {
            const q = this.project(z.x, z.y, 20);
            const d = q ? Math.hypot(q.x - p.x, q.y - p.y) : Infinity;
            if (q && d < z.r * q.s + 28 && d < best) {
              best = d;
              tx = z.x;
              ty = z.y;
            }
          } else if (Math.hypot(z.x - mx, z.y - my) < 650) {
            const az = Math.atan2(z.y - my, z.x - mx);
            const d = Math.abs(Math.atan2(Math.sin(az - ahead), Math.cos(az - ahead)));
            if (d < best) {
              best = d;
              tx = z.x;
              ty = z.y;
            }
          }
        }
      }
      const s0 = this.project(mx, my, GUN_Z);
      const s1 = this.project(tx, ty, GUN_Z);
      return { x: mx, y: my, angle: Math.atan2(ty - my, tx - mx), screen: s0 && s1 ? Math.atan2(s1.y - s0.y, s1.x - s0.x) : -Math.PI / 2 };
    },

    /** Ground layers from the bottom of the screen to the far edge, each reaching twice as deep as the last. */
    layers(g) {
      const k = this.k;
      const q = Math.min(1.5, g.dpr || 1) * this.res;
      const top = Math.min(k.far, this.groundY(0));
      const out = [];
      let y = this.groundY(k.H) - 40;
      while (y < top && out.length < 6) {
        const d0 = this.depthAt(y);
        const y2 = Math.min((2 * d0 - k.h * k.sn) / k.cs - k.b, top + 40);
        const pad = 30;
        const hw = ((k.W / 2 + 60) * this.depthAt(y2)) / k.f + pad;
        let kk = (k.f / d0) * q;
        if (2 * hw * kk > 4096) kk = 4096 / (2 * hw);
        if ((y2 - y + 2 * pad) * kk > 4096) kk = 4096 / (y2 - y + 2 * pad);
        out.push({ y0: y - pad, y1: y2 + pad, hw, k: kk });
        y = y2;
      }
      out.forEach((L, i) => {
        const c = this.canvases[i] || (this.canvases[i] = document.createElement("canvas"));
        const w = Math.ceil(2 * L.hw * L.k);
        const h = Math.ceil((L.y1 - L.y0) * L.k);
        if (c.width !== w || c.height !== h) {
          c.width = w;
          c.height = h;
        }
        L.canvas = c;
      });
      return out;
    },

    /** Everything lying on the ground, top-down, as the flat road draws it (game.js draw). */
    drawGround(g, ctx, view, theme) {
      const D = ZSR.Draw;
      const St = ZSR.Streets;
      const G = St.GEOM;
      D.ground(ctx, view, theme);
      D.cityRoads(ctx, g.drive, G, theme, view);
      const dirtTheme = Object.assign({}, theme || {}, { asphalt: "#7a5c3e" });
      g.drive.decisions.forEach((d, i) => {
        if (i < g.next - 1) return;
        const a = St.at(g.drive.track, d.stop);
        if (Math.hypot(a.x - view.x, a.y - view.y) > view.r + (d.stop - d.zoneStart) + 400) return;
        ctx.save();
        ctx.transform(-a.uy, a.ux, -a.ux, -a.uy, a.x, a.y);
        D.laneZone(ctx, { len: d.stop - d.zoneStart, n: d.n, ourLeft: St.ourLeft(d.n), rels: d.lanes.map((w) => d.options[w].rel), ways: d.lanes }, G, g.onDirt(d) ? dirtTheme : theme);
        ctx.restore();
      });
      g.drive.lots.forEach((l) => {
        if (Math.hypot(l.qx - view.x, l.qy - view.y) < view.r + 800) D.lot(ctx, l, G, ZSR.WORLD.place(l.node));
      });
      const near = (p, m) => Math.abs(p.x - view.x) < view.r + m && Math.abs(p.y - view.y) < view.r + m;
      const faced = (p, fn) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.face || 0);
        fn();
        ctx.restore();
      };
      for (const p of g.props) if (p.kind !== "tree" && near(p, 120)) faced(p, () => D.prop(ctx, Object.assign({}, p, { x: 0, y: 0 })));
      for (const f of g.fallen) D.prop(ctx, f);
      for (const c of g.crates) faced(c, () => D.prop(ctx, { kind: "crate", x: 0, y: 0, t: c.t }));
      for (const p of g.particles) D.particle(ctx, p);
    },

    /** The ground on the screen: sky, the warped layers strip by strip, then haze toward the far edge. */
    drawWorldGround(g, ctx, theme) {
      const k = this.k;
      const W = k.W;
      const H = k.H;
      const Ls = this.layers(g);
      Ls.forEach((L) => {
        const x = L.canvas.getContext("2d");
        x.setTransform(L.k * k.Rx, -L.k * k.Fx, L.k * k.Ry, -L.k * k.Fy, L.k * (L.hw - k.ox * k.Rx - k.oy * k.Ry), L.k * (L.y1 + k.ox * k.Fx + k.oy * k.Fy));
        const Ym = (L.y0 + L.y1) / 2;
        this.drawGround(g, x, { x: k.ox + k.Fx * Ym, y: k.oy + k.Fy * Ym, r: Math.hypot(L.hw, (L.y1 - L.y0) / 2) }, theme);
      });
      // the far edge of the ground, and the sky above it
      const night = g.mods.night;
      const haze = night ? [28, 29, 26] : g.mods.fog ? [150, 148, 122] : [201, 194, 164];
      const rgba = (a) => "rgba(" + haze.join(",") + "," + a.toFixed(3) + ")";
      const far = this.project(k.ox + k.Fx * k.far, k.oy + k.Fy * k.far, 0);
      const skyY = far ? far.y : 0;
      if (skyY > 0) {
        const sg = ctx.createLinearGradient(0, 0, 0, skyY);
        sg.addColorStop(0, night ? "#121310" : "#8f8b78");
        sg.addColorStop(1, rgba(1));
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, skyY + 2);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "low"; // each layer is at most twice as sharp as the rows it fills
      const dh = 3;
      for (let sy = Math.max(0, Math.floor(skyY)); sy < H; sy += dh) {
        const Ya = Math.min(this.groundY(sy), k.far);
        const Yb = Math.min(this.groundY(Math.min(H, sy + dh)), k.far);
        const Ym = (Ya + Yb) / 2;
        const L = Ls.find((l) => Ym >= l.y0 && Ym <= l.y1) || Ls[Ls.length - 1];
        const d = this.depthAt(Ym);
        const Xl = (-k.cx * d) / k.f;
        const Xr = ((W - k.cx) * d) / k.f;
        ctx.drawImage(L.canvas, (Xl + L.hw) * L.k, (L.y1 - Ya) * L.k, (Xr - Xl) * L.k, Math.max(0.5, (Ya - Yb) * L.k), 0, sy, W, dh + 0.6);
      }
      // haze: none near the van, thick at the far edge
      const y0 = this.project(k.ox + k.Fx * k.far * 0.45, k.oy + k.Fy * k.far * 0.45, 0);
      if (y0 && y0.y > 0) {
        const top = Math.max(0, skyY);
        const hg = ctx.createLinearGradient(0, top, 0, y0.y);
        hg.addColorStop(0, rgba(0.85 * clamp((Math.min(this.groundY(top), k.far) - k.far * 0.45) / (k.far * 0.55), 0, 1)));
        hg.addColorStop(1, rgba(0));
        ctx.fillStyle = hg;
        ctx.fillRect(0, top, W, y0.y - top);
      }
    },

    /** Draws fn's top-down art (in world coordinates) as if lying flat at height z around (x, y). */
    flat(ctx, x, y, z, fn) {
      const p0 = this.project(x, y, z);
      const e = 4;
      const px = this.project(x + e, y, z);
      const py = this.project(x, y + e, z);
      if (!p0 || !px || !py) return;
      const a = (px.x - p0.x) / e;
      const b = (px.y - p0.y) / e;
      const c = (py.x - p0.x) / e;
      const d = (py.y - p0.y) / e;
      ctx.save();
      ctx.transform(a, b, c, d, p0.x - a * x - c * y, p0.y - b * x - d * y);
      fn();
      ctx.restore();
    },
    /** A polygon of world points [x, y, height], filled and inked. */
    poly(ctx, pts, fill, lw) {
      const s = pts.map((p) => this.project(p[0], p[1], p[2]));
      if (s.some((p) => !p)) return;
      ctx.beginPath();
      s.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (lw) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = lw;
        ctx.lineJoin = "round";
        ctx.stroke();
      }
    },
    /** The walls of a box that face the camera; corners: 4 ground points in order around it. */
    boxSides(ctx, corners, z0, z1, faceFill, onFace) {
      const k = this.k;
      const camX = k.ox - k.Fx * k.b;
      const camY = k.oy - k.Fy * k.b;
      const cx = corners.reduce((s, c) => s + c[0], 0) / 4;
      const cy = corners.reduce((s, c) => s + c[1], 0) / 4;
      for (let i = 0; i < 4; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % 4];
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        // the outward normal: away from the box's middle
        let nx = b[1] - a[1];
        let ny = a[0] - b[0];
        if (nx * (mx - cx) + ny * (my - cy) < 0) {
          nx = -nx;
          ny = -ny;
        }
        if (nx * (camX - mx) + ny * (camY - my) <= 0) continue;
        this.poly(ctx, [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], faceFill(i), 3);
        if (onFace) onFace(i, a, b);
      }
    },
    /** An upright post facing the camera: half-width w0 at the foot, w1 at the top (world units). */
    column(ctx, x, y, z0, z1, w0, w1, fill, lw) {
      const a = this.project(x, y, z0);
      const b = this.project(x, y, z1);
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x - w0 * a.s, a.y);
      ctx.lineTo(a.x + w0 * a.s, a.y);
      ctx.lineTo(b.x + w1 * b.s, b.y);
      ctx.lineTo(b.x - w1 * b.s, b.y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw;
      ctx.stroke();
    },

    /** A place's building as a box on its lot (the same footprint sprites.js lot draws from above). */
    building(ctx, l) {
      const G = ZSR.Streets.GEOM;
      const look = ZSR.WORLD.place(l.node);
      if (look && look.type === "river") return;
      const roof = ZSR.Draw.ROOF[look && look.type] || "#4b5057";
      const nx = -l.uy * l.side;
      const ny = l.ux * l.side;
      const v0 = G.half + G.shoulder + G.lotGap;
      const a0 = -G.lotHalf + 22;
      const a1 = G.lotHalf - 22;
      const b0 = v0 + 168;
      const b1 = v0 + G.lotDepth - 18;
      const P = (a, v) => [l.qx + l.ux * a + nx * v, l.qy + l.uy * a + ny * v];
      const at = (a, v, z) => P(a, v).concat(z);
      const foot = [P(a0, b0), P(a1, b0), P(a1, b1), P(a0, b1)];
      const Hb = 150;
      const wall = "#9a9282";
      this.boxSides(ctx, foot, 0, Hb, (i) => (i === 0 ? wall : shade(wall, -28 - i * 6)), (i) => {
        if (i !== 0) return; // the front, facing the drive: a row of windows and the door
        for (let a = a0 + 34; a + 44 < a1 - 20; a += 72) {
          if (Math.abs(a + 22) < 70) continue;
          this.poly(ctx, [at(a, b0, 74), at(a + 44, b0, 74), at(a + 44, b0, 112), at(a, b0, 112)], "#3d4a55", 2.5);
        }
        this.poly(ctx, [at(-28, b0, 0), at(28, b0, 0), at(28, b0, 66), at(-28, b0, 66)], INK, 0);
      });
      this.poly(ctx, foot.map((c) => c.concat(Hb)), roof, 4);
      this.poly(ctx, [P(a0 + 12, b0 + 12), P(a1 - 12, b0 + 12), P(a1 - 12, b1 - 12), P(a0 + 12, b1 - 12)].map((c) => c.concat(Hb)), "rgba(0,0,0,0.08)", 0);
    },
    tree(ctx, p) {
      this.flat(ctx, p.x, p.y, 0, () => {
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(p.x + p.size * 0.5, p.y + p.size * 0.3, p.size * 1.1, p.size * 0.8, 0, 0, TAU);
        ctx.fill();
      });
      this.column(ctx, p.x, p.y, 0, 62, 4, 5, "#4a3a2c", 2);
      this.flat(ctx, p.x, p.y, 64, () => ZSR.Draw.prop(ctx, { kind: "tree", x: p.x, y: p.y, size: p.size, seed: p.seed }));
    },
    /** A walker: shadow, body, and the top-down head and shoulders at head height. New ones fade in; one right
        behind the van (between it and the camera) is see-through, so it never hides the van. */
    walker(g, ctx, z) {
      const r = z.r;
      let a = z.born == null ? 1 : clamp((g.time - z.born) / FADE_IN, 0, 1);
      const v = this.project(g.van.x, g.van.y, 0);
      const q = this.project(z.x, z.y, 0);
      if (v && q && q.Y < v.Y && Math.hypot(z.x - g.van.x, z.y - g.van.y) < 170) a *= 0.45;
      if (a <= 0) return;
      ctx.save();
      ctx.globalAlpha *= a;
      this.flat(ctx, z.x, z.y, 0, () => {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(z.x, z.y, r * 1.05, r * 0.85, 0, 0, TAU);
        ctx.fill();
      });
      this.column(ctx, z.x, z.y, 0, 30, r * 0.5, r * 0.8, z.hit > 0 ? "#ffffff" : BODY[z.type] || BODY.walker, 2.5);
      this.flat(ctx, z.x, z.y, 32, () => ZSR.Draw.zombie(ctx, z, g.time));
      ctx.restore();
    },
    /** The van as a box: its top-down art on the ground (shadow, wheels, plow), its walls, then on its roof. */
    van(g, ctx) {
      const D = ZSR.Draw;
      const van = g.van;
      const u = ZSR.State.save.upgrades;
      const looks = ZSR.Upgrades.PAINT_LOOKS;
      const look = looks[Math.min(u.paint || 0, looks.length - 1)];
      const fx = Math.cos(van.heading);
      const fy = Math.sin(van.heading);
      // the van's own frame, as sprites.js draws it: x to its right, y toward its back
      const L = (lx, ly) => [van.x - fy * lx - fx * ly, van.y + fx * lx - fy * ly];
      const aimW = van.aimW == null ? van.heading : van.aimW;
      const opts = { upgrades: u, aim: aimW - van.heading - Math.PI / 2, t: g.time, hurt: van.hurt, flash: van.flash, scale: 1, moving: !(g.arrive && g.arrive.parked) };
      const at = (z, fn) => {
        const e = 4;
        const a = L(e, 0);
        const b = L(0, e);
        const p0 = this.project(van.x, van.y, z);
        const pa = this.project(a[0], a[1], z);
        const pb = this.project(b[0], b[1], z);
        if (!p0 || !pa || !pb) return;
        ctx.save();
        ctx.transform((pa.x - p0.x) / e, (pa.y - p0.y) / e, (pb.x - p0.x) / e, (pb.y - p0.y) / e, p0.x, p0.y);
        fn();
        ctx.restore();
      };
      at(0, () => D.van(ctx, 0, 0, opts));
      const foot = [L(-33, -59), L(33, -59), L(33, 59), L(-33, 59)]; // front left, front right, back right, back left
      const side = shade(look.body, -30);
      this.boxSides(ctx, foot, 4, VAN_Z, (i) => (i === 2 ? shade(look.body, -45) : side), (i, a, b) => {
        const lerp = (t, z) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, z];
        if (i === 2) {
          // the back doors: window, tail lights, bumper
          this.poly(ctx, [lerp(0.18, 28), lerp(0.82, 28), lerp(0.82, 44), lerp(0.18, 44)], "#2b3540", 2);
          this.poly(ctx, [lerp(0.04, 16), lerp(0.16, 16), lerp(0.16, 26), lerp(0.04, 26)], "#c0392b", 2);
          this.poly(ctx, [lerp(0.84, 16), lerp(0.96, 16), lerp(0.96, 26), lerp(0.84, 26)], "#c0392b", 2);
          this.poly(ctx, [lerp(0, 4), lerp(1, 4), lerp(1, 11), lerp(0, 11)], "#2f3136", 2);
        } else if (i === 1 || i === 3) {
          // side windows up by the cab
          const t0 = i === 1 ? 0.06 : 0.62;
          this.poly(ctx, [lerp(t0, 30), lerp(t0 + 0.3, 30), lerp(t0 + 0.3, 45), lerp(t0, 45)], "#2b3540", 2);
        }
      });
      at(VAN_Z, () => {
        D.rr(ctx, -33, -59, 66, 118, 8);
        ctx.clip();
        D.van(ctx, 0, 0, opts);
      });
    },

    /** The whole world for one frame (game.js draw): ground, standing things far to near, then shots in the air. */
    drawWorld(g, ctx, theme) {
      const t0 = performance.now();
      const k = this.setup(g);
      this.drawWorldGround(g, ctx, theme);
      const items = [];
      const farD = this.depthAt(k.far);
      const on = (p, m) => p && p.d < farD && p.x > -m && p.x < k.W + m && p.y > -m && p.y < k.H + m;
      g.drive.lots.forEach((l) => {
        const p = this.project(l.qx, l.qy, 0);
        if (p && p.Y < k.far && p.Y > -900) items.push({ d: p.d + 300, draw: () => this.building(ctx, l) });
      });
      for (const p of g.props) {
        if (p.kind !== "tree") continue;
        const q = this.project(p.x, p.y, 0);
        if (on(q, 150)) items.push({ d: q.d, draw: () => this.tree(ctx, p) });
      }
      for (const z of g.zombies) {
        const q = this.project(z.x, z.y, 0);
        if (on(q, 150)) items.push({ d: q.d, draw: () => this.walker(g, ctx, z) });
      }
      if (g.gameOverAt == null || g.gameOverAt > 0.9) {
        const q = this.project(g.van.x, g.van.y, 0);
        if (q) items.push({ d: q.d, draw: () => this.van(g, ctx) });
      }
      items.sort((a, b) => b.d - a.d).forEach((it) => it.draw());
      for (const b of g.bullets) this.flat(ctx, b.x, b.y, GUN_Z, () => ZSR.Draw.bullet(ctx, b));
      this.pace(performance.now() - t0);
    },
    /** Slow frames (a computer without a graphics card) get softer ground layers; a check every 30 frames. */
    pace(ms) {
      this.ms = this.ms == null ? ms : this.ms * 0.9 + ms * 0.1;
      this.frames = (this.frames || 0) + 1;
      if (this.frames % 30) return;
      if (this.ms > 18 && this.res > 0.6) this.res = Math.max(0.6, this.res - 0.1);
      else if (this.ms < 9 && this.res < 1) this.res = Math.min(1, this.res + 0.1);
    },
    /** The names over the buildings, upright: smaller far off, never too small to read. */
    drawNames(g, ctx, k) {
      const G = ZSR.Streets.GEOM;
      g.drive.lots.forEach((l) => {
        const v0 = G.half + G.shoulder + G.lotGap + 168;
        const p = this.project(l.qx - l.uy * l.side * v0, l.qy + l.ux * l.side * v0, 178);
        if (!p || p.Y > this.k.far || p.x < -200 || p.x > g.W + 200 || p.y < -60 || p.y > g.H + 60) return;
        const name = ZSR.State.isKnown(l.node) ? g.placeName(l.node).toUpperCase() : "?";
        ZSR.Draw.nameBoard(ctx, p.x, p.y, name, Math.max(g.zoom, k * 0.8) * clamp(p.s / (g.zoom * this.cfg.scale), 0.6, 1.2), false);
      });
    },
    /** Walkers behind the road sign, drawn again on top of it (game.js drawOverSign). */
    drawOverSign(g, ctx, rects) {
      this.setup(g);
      const hit = g.zombies.filter((z) => {
        const p = this.project(z.x, z.y, 20);
        const m = p ? z.r * 1.6 * p.s : 0;
        return p && rects.some((r) => p.x > r.x - m && p.x < r.x + r.w + m && p.y > r.y - m && p.y < r.y + r.h + m);
      });
      if (!hit.length) return;
      ctx.save();
      ctx.beginPath();
      rects.forEach((r) => ctx.rect(r.x, r.y, r.w, r.h));
      ctx.clip();
      hit.forEach((z) => this.walker(g, ctx, z));
      ctx.restore();
    },
  };
  ZSR.Persp = Persp;
})(typeof window !== "undefined" ? window : globalThis);
