/* The angled road camera: a test of a view down the road from behind and above the van, on one drive only
   (PERSP_ROUTES in js/game.js; every other drive keeps the flat, top-down camera).
   The ground (grass and its overgrowth, roads, lanes, lots, junk lying flat) is the road's own top-down art. With
   WebGL it is laid down by the graphics card in squares drawn once (js/perspective-gl.js); without, it is drawn
   into a few layers each frame and warped onto the 2D canvas strip by strip (Mode-7 style). Everything standing
   (trees, bushes and tall grass, wrecked cars, barriers, barrels, signs, crates, buildings, walkers, the van) is
   drawn on the 2D canvas over it, far to near, at its projected spot (js/perspective-art.js has their pictures).
   The road sign, the names over the buildings, the HUD and the minimap stay flat.
   The camera is pitched down cfg.pitch degrees; the van sits at cfg.vanAt of the screen's height, drawn
   cfg.scale times the road's zoom; ground past cfg.far fades into haze.
   Walkers are the interiors' standing sprites (sprites3d.js Draw3.walker); they come in from far down the road and
   out of the overgrowth at the sides (spawn), small at first. The van is a box in the yard van's own faces
   (Draw3.texture), the top-down art on its roof and a roof gun standing on it. A shot leaves the barrels and drops
   to chest height (AIM_Z) where the pointer is, so on the screen it flies at the pointer. */
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
  const VAN_Z = 50; // the van's roof
  const GUN_Z = VAN_Z + 9; // the roof gun's barrels
  const AIM_Z = 26; // what a shot drops to where the pointer is: a walker's chest
  const FADE_IN = 0.5; // seconds a new walker takes to come out of the weeds
  const TEX_RES = 3; // the van's faces, drawn sharper than the yard's
  const NEAR_PX = 6; // px a world unit: nearer the camera than this, nothing is drawn (the van is about 2)

  const Persp = {
    cfg: { pitch: 30, fov: 60, vanAt: 0.8, scale: 1.55, far: 3600 },
    GUN_Z,
    AIM_Z,
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
      // a shake (the van hit) moves the whole view, ground and all
      this.k = { sn, cs, f, cx: g.W / 2 + (g.shakeX || 0), cy: g.H / 2 + (g.shakeY || 0), h, b: bh * h, ox: g.cam.x, oy: g.cam.y, Fx: Math.cos(a), Fy: Math.sin(a), Rx: -Math.sin(a), Ry: Math.cos(a), W: g.W, H: g.H, far: c.far };
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

    /** The roof gun: its mount (h * 0.1 behind the van's middle, as sprites.js draws it), the world angle to shoot
        at, the barrels' height and how much a shot drops per unit it flies, and the aim's angle on the screen (for
        the headlights at night). With a pointer: the walker whose picture is under it, led (a shot carries the van's
        speed and the walker walks on, so it is aimed at where the two meet); else what is under the pointer at
        chest height (the shot then flies straight at the pointer on the screen). Aim assist: with a pointer, a
        walker a little off it counts too; keys only, the walker closest to straight ahead. shot: the shots' speed. */
    aim(g, assist, shot) {
      const k = this.setup(g);
      const van = g.van;
      const fx = Math.cos(van.heading);
      const fy = Math.sin(van.heading);
      const mx = van.x - fx * van.h * 0.1;
      const my = van.y - fy * van.h * 0.1;
      let tx = mx + k.Fx * 600;
      let ty = my + k.Fy * 600;
      let tz = AIM_Z;
      let target = null;
      const p = g.pointer;
      // with a pointer: the walker whose standing picture is under it, at the spot on it under the pointer;
      // else what is under the pointer at chest height (with aim assist, a walker a little off it counts too)
      const hit = p.seen ? this.pick(g, p.x, p.y, 0) || (assist ? this.pick(g, p.x, p.y, 28) : null) : null;
      if (hit) {
        tx = hit.x;
        ty = hit.y;
        tz = hit.z;
        target = hit.walker;
      } else if (p.seen) {
        const t = this.unproject(p.x, p.y, AIM_Z);
        tx = t.x;
        ty = t.y;
      }
      if (assist && !p.seen) {
        let best = 0.42;
        const ahead = Math.atan2(ty - my, tx - mx);
        for (const z of g.zombies) {
          if (Math.hypot(z.x - mx, z.y - my) < 650) {
            const az = Math.atan2(z.y - my, z.x - mx);
            const d = Math.abs(Math.atan2(Math.sin(az - ahead), Math.cos(az - ahead)));
            if (d < best) {
              best = d;
              tx = z.x;
              ty = z.y;
              tz = this.walkerH(z) * 0.55;
              target = z;
            }
          }
        }
      }
      let dist = Math.hypot(tx - mx, ty - my);
      if (target && shot > 0) {
        // where a shot meets the walker: it flies at `shot` plus the van's speed, the walker at its own
        const wx = fx * (g.curSpeed || 0) - (target.vx || 0);
        const wy = fy * (g.curSpeed || 0) - (target.vy || 0);
        const Dx = tx - mx;
        const Dy = ty - my;
        const a = shot * shot - wx * wx - wy * wy;
        const b = Dx * wx + Dy * wy;
        const t = a > 1 ? (-b + Math.sqrt(b * b + a * (Dx * Dx + Dy * Dy))) / a : 0;
        if (t > 0) {
          tx = mx + Dx - wx * t;
          ty = my + Dy - wy * t;
          dist = shot * t;
        }
      }
      const s0 = this.project(mx, my, GUN_Z);
      const s1 = this.project(tx, ty, tz);
      const dz = (tz - GUN_Z) / Math.max(60, dist);
      return { x: mx, y: my, angle: Math.atan2(ty - my, tx - mx), z: GUN_Z, dz, screen: s0 && s1 ? Math.atan2(s1.y - s0.y, s1.x - s0.x) : -Math.PI / 2 };
    },
    /** A point's place from the camera's spot: X to the right, Y ahead (after setup). */
    local(x, y) {
      const k = this.k;
      const dx = x - k.ox;
      const dy = y - k.oy;
      return { X: dx * k.Rx + dy * k.Ry, Y: dx * k.Fx + dy * k.Fy };
    },
    /** Where a new walker comes from: far down the road (in the haze, across the road and its verges), or out of
        the overgrowth at the edges of the view further in; small at first, they walk in. */
    spawn(g) {
      const k = this.setup(g);
      const G = ZSR.Streets.GEOM;
      let X;
      let Y;
      if (Math.random() < 0.55) {
        Y = k.far * (0.5 + Math.random() * 0.3);
        X = (Math.random() * 2 - 1) * (G.half + 700);
      } else {
        Y = 700 + Math.random() * 1500;
        const hw = ((k.W / 2) * this.depthAt(Y)) / k.f;
        X = (Math.random() < 0.5 ? -1 : 1) * Math.min(hw * 0.92, G.half + 600 + Math.random() * 800);
      }
      return { x: k.ox + k.Rx * X + k.Fx * Y, y: k.oy + k.Ry * X + k.Fy * Y };
    },
    /** The haze's color: dusty by day, darker in fog, near black at night. */
    haze(g) {
      return g.mods.night ? [28, 29, 26] : g.mods.fog ? [150, 148, 122] : [201, 194, 164];
    },
    /** The walker whose standing picture (its body: the middle of the sprite, from feet to head, leaning as it is
        drawn) is under screen point (sx, sy), within `margin` px; the nearest if several. Returns the point on it
        under the pointer: { x, y, z }, its body's middle at that height, a little to the side if pointed there. */
    pick(g, sx, sy, margin) {
      const k = this.k;
      let best = null;
      for (const z of g.zombies) {
        const foot = this.project(z.x, z.y, 0);
        const H = this.walkerH(z);
        const head = this.project(z.x, z.y, H);
        if (!foot || !head || foot.s > NEAR_PX) continue;
        const hpx = foot.y - head.y;
        if (hpx < 2) continue;
        const t = (foot.y - sy) / hpx;
        if (t < -margin / hpx || t > 1 + margin / hpx) continue;
        const cx = foot.x + (head.x - foot.x) * 0.5 * clamp(t, 0, 1);
        const half = H * 0.75 * foot.s * 0.3;
        if (Math.abs(sx - cx) > half + margin) continue;
        if (best && best.foot.s >= foot.s) continue;
        const u = clamp((sx - cx) / foot.s, -z.r * 0.7, z.r * 0.7);
        best = { foot, walker: z, x: z.x + k.Rx * u, y: z.y + k.Ry * u, z: clamp(t, 0.15, 0.9) * H };
      }
      return best;
    },
    /** How tall a walker stands, in world units: about the van's roof (50), brutes well over it. A little over
        life size, so a walker down the road still reads as a target. */
    walkerH(z) {
      return z.r * 3.2;
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

    /** Everything that lies on the ground and stays put, top-down: grass, the roads, the overgrowth over both, every
        lane zone (over the weeds, so the arrows read), the lots, tyres and rubble. The same for the card's squares
        and for the 2D layers. view: { x, y, r }, with half (a square's half side) and px (px per unit) for a square. */
    drawGround(g, ctx, view, theme) {
      const D = ZSR.Draw;
      const St = ZSR.Streets;
      const G = St.GEOM;
      D.ground(ctx, view, theme);
      D.cityRoads(ctx, g.drive, G, theme, view);
      if (ZSR.PerspArt && !view.bare) ZSR.PerspArt.cover(ctx, view, g.drive, G);
      const dirtTheme = Object.assign({}, theme || {}, { asphalt: "#7a5c3e" });
      g.drive.decisions.forEach((d) => {
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
      for (const p of g.props) {
        if ((p.kind !== "tire" && p.kind !== "rubble") || Math.abs(p.x - view.x) > view.r + 60 || Math.abs(p.y - view.y) > view.r + 60) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.face || 0);
        D.prop(ctx, Object.assign({}, p, { x: 0, y: 0 }));
        ctx.restore();
      }
    },
    /** The sky over the far edge of the ground, fading into the haze there. */
    sky(ctx, haze, night) {
      const k = this.k;
      const far = this.project(k.ox + k.Fx * k.far, k.oy + k.Fy * k.far, 0);
      const skyY = far ? far.y : 0;
      if (skyY <= 0) return skyY;
      const sg = ctx.createLinearGradient(0, 0, 0, skyY);
      sg.addColorStop(0, night ? "#121310" : "#8f8b78");
      sg.addColorStop(1, "rgb(" + haze.join(",") + ")");
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, k.W, skyY + 2);
      return skyY;
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
        // drawn again every frame, so without the overgrowth's fine marks
        this.drawGround(g, x, { x: k.ox + k.Fx * Ym, y: k.oy + k.Fy * Ym, r: Math.hypot(L.hw, (L.y1 - L.y0) / 2), bare: true }, theme);
      });
      // the far edge of the ground, and the sky above it
      const haze = this.haze(g);
      const rgba = (a) => "rgba(" + haze.join(",") + "," + a.toFixed(3) + ")";
      const skyY = this.sky(ctx, haze, g.mods.night);
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

    /** Draws fn's top-down art (in world coordinates) as if lying flat at height z around (x, y). Nothing right
        under the camera (NEAR_PX px a unit or more): it is out of the picture, and would be drawn huge. */
    flat(ctx, x, y, z, fn) {
      const p0 = this.project(x, y, z);
      if (!p0 || p0.s > NEAR_PX) return;
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
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (lw) {
        ctx.strokeStyle = INK;
        ctx.lineWidth = lw;
        ctx.lineJoin = "round";
        ctx.stroke();
      }
    },
    /** Does the wall from ground point a to b of a box around (cx, cy) face the camera? */
    faces(a, b, cx, cy) {
      const k = this.k;
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      // the outward normal: away from the box's middle
      let nx = b[1] - a[1];
      let ny = a[0] - b[0];
      if (nx * (mx - cx) + ny * (my - cy) < 0) {
        nx = -nx;
        ny = -ny;
      }
      return nx * (k.ox - k.Fx * k.b - mx) + ny * (k.oy - k.Fy * k.b - my) > 0;
    },
    /** The walls of a box that face the camera; corners: 4 ground points in order around it. */
    boxSides(ctx, corners, z0, z1, faceFill, onFace) {
      const cx = corners.reduce((s, c) => s + c[0], 0) / 4;
      const cy = corners.reduce((s, c) => s + c[1], 0) / 4;
      for (let i = 0; i < 4; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % 4];
        if (!this.faces(a, b, cx, cy)) continue;
        this.poly(ctx, [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], faceFill(i), 3);
        if (onFace) onFace(i, a, b);
      }
    },
    /** A wall from ground point `left` to `right` (as seen from outside), z0 to z1, papered with textures laid
        left to right ({ img, flip, crop: [from, to] as shares of its width }), each in a few strips so the
        perspective holds. Each strip but the last reaches a little into the next, so no seam shows. */
    texWall(ctx, left, right, z0, z1, pieces) {
      const S = 4;
      const n = pieces.length;
      const at = (t) => [left[0] + (right[0] - left[0]) * t, left[1] + (right[1] - left[1]) * t];
      pieces.forEach((pc, i) => {
        const W = pc.img.width;
        const [u0, u1] = pc.crop || [0, 1];
        const sw = (W * (u1 - u0)) / S;
        for (let j = 0; j < S; j++) {
          const A = at((i + j / S) / n);
          const B = at((i + (j + 1) / S) / n);
          const tl = this.project(A[0], A[1], z1);
          const tr = this.project(B[0], B[1], z1);
          const bl = this.project(A[0], A[1], z0);
          if (!tl || !tr || !bl) return;
          ctx.save();
          ctx.transform(tr.x - tl.x, tr.y - tl.y, bl.x - tl.x, bl.y - tl.y, tl.x, tl.y);
          if (pc.flip) {
            ctx.translate(1, 0);
            ctx.scale(-1, 1);
          }
          const over = i < n - 1 || j < S - 1 ? 1.04 : 1;
          ctx.drawImage(pc.img, pc.flip ? W * u1 - (j + 1) * sw : W * u0 + j * sw, 0, sw, pc.img.height, 0, 0, over, 1);
          ctx.restore();
        }
      });
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
    /** A picture standing on its feet at (x, y), H world units tall. It leans with the camera's upright lines,
        though only by `lean` of them: a flat picture taking all of it looks to be falling over. */
    billboard(ctx, img, x, y, H, aspect, flip, lean) {
      const foot = this.project(x, y, 0);
      const head = this.project(x, y, H);
      if (!foot || !head || foot.s > NEAR_PX) return false;
      const hpx = foot.y - head.y;
      if (hpx < 2) return false;
      const wpx = H * aspect * foot.s;
      ctx.save();
      ctx.transform(flip ? -1 : 1, 0, (-(head.x - foot.x) / hpx) * lean, 1, foot.x, foot.y);
      ctx.drawImage(img, -wpx / 2, -hpx, wpx, hpx);
      ctx.restore();
      return true;
    },
    /** A shadow lying under something: an ellipse rx by ry, turned by `a`. */
    shadow(ctx, x, y, rx, ry, a, alpha) {
      this.flat(ctx, x, y, 0, () => {
        ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, a || 0, 0, TAU);
        ctx.fill();
      });
    },
    /** A tree, bush or clump of tall grass from js/perspective-art.js. */
    plant(ctx, o) {
      const s = ZSR.PerspArt.sprite(o.kind, o.v);
      if (o.kind === "tree" || o.kind === "dead") this.shadow(ctx, o.x + o.h * 0.12, o.y + o.h * 0.08, o.h * 0.32, o.h * 0.2, 0.3, 0.22);
      this.billboard(ctx, s.img, o.x, o.y, o.h, s.aspect, o.flip, 0.5);
    },
    /** One of the road's props, standing: a tree, a barrel, a barrier, a sign or a wrecked car. */
    prop(ctx, p) {
      if (p.kind === "tree") {
        if (!p.plant) p.plant = { kind: p.seed % 5 === 0 ? "dead" : "tree", x: p.x, y: p.y, h: 110 + p.size * 3.2, v: p.seed % 4, flip: p.seed % 2 === 1 };
        this.plant(ctx, p.plant);
      } else if (p.kind === "barrel") {
        const s = ZSR.PerspArt.sprite("barrel", ["#7a4a2a", "#5f6b3c", "#4d4f55"].indexOf(p.color) + 3);
        this.shadow(ctx, p.x + 6, p.y + 4, 16, 12, 0, 0.25);
        this.billboard(ctx, s.img, p.x, p.y, 36, s.aspect, false, 0.3);
      } else if (p.kind === "barrier") this.barrier(ctx, p);
      else if (p.kind === "sign") this.sign(ctx, p);
      else if (p.kind === "wreck") this.car(ctx, p);
    },
    /** A wall between ground points a and b of a box around (cx, cy), if it faces the camera: papered with
        `pieces` (left to right as seen from outside) or filled. */
    wall(ctx, a, b, cx, cy, z0, z1, pieces, fill) {
      if (!this.faces(a, b, cx, cy)) return false;
      if (!pieces) {
        this.poly(ctx, [a.concat(z0), b.concat(z0), b.concat(z1), a.concat(z1)], fill, 2.5);
        return true;
      }
      // seen from outside, the viewer's right is the outward normal turned back a quarter
      const nx = b[1] - a[1];
      const ny = a[0] - b[0];
      const out = nx * ((a[0] + b[0]) / 2 - cx) + ny * ((a[1] + b[1]) / 2 - cy) > 0 ? 1 : -1;
      const rx = ny * out;
      const ry = -nx * out;
      const aRight = a[0] * rx + a[1] * ry > b[0] * rx + b[1] * ry;
      this.texWall(ctx, aRight ? b : a, aRight ? a : b, z0, z1, pieces);
      this.poly(ctx, [a.concat(z0), b.concat(z0), b.concat(z1), a.concat(z1)], null, 2.5);
      return true;
    },
    /** A concrete barrier: the striped faces down its long sides. */
    barrier(ctx, p) {
      const A = (p.face || 0) + (p.rot || 0);
      const ux = Math.cos(A);
      const uy = Math.sin(A);
      const P = (l, w) => [p.x + ux * l - uy * w, p.y + uy * l + ux * w];
      const c = [P(-36, -10), P(36, -10), P(36, 10), P(-36, 10)];
      this.shadow(ctx, p.x + 8, p.y + 6, 40, 14, A, 0.25);
      const tex = [{ img: ZSR.PerspArt.barrier() }];
      for (let i = 0; i < 4; i++) this.wall(ctx, c[i], c[(i + 1) % 4], p.x, p.y, 0, 30, i % 2 ? null : tex, "#7d7a74");
      this.poly(ctx, c.map((q) => q.concat(30)), "#a3a09a", 2.5);
    },
    /** A road sign on its post, its words facing the way the route runs past it. */
    sign(ctx, p) {
      const A = p.face || 0;
      const vx = Math.cos(A);
      const vy = Math.sin(A);
      const left = [p.x - vx * 40, p.y - vy * 40];
      const right = [p.x + vx * 40, p.y + vy * 40];
      const k = this.k;
      // the front faces back along the way the route runs (where the van comes from)
      const nx = -vy;
      const ny = vx;
      const front = nx * (k.ox - k.Fx * k.b - p.x) + ny * (k.oy - k.Fy * k.b - p.y) > 0;
      this.shadow(ctx, p.x + 10, p.y + 8, 30, 8, A, 0.22);
      if (front) this.column(ctx, p.x, p.y, 0, 86, 3, 3, "#4a4a4f", 2);
      if (front) this.texWall(ctx, left, right, 46, 88, [{ img: ZSR.PerspArt.signBoard(p.text || "KEEP OUT", p.color || "#d9a21b") }]);
      else this.texWall(ctx, right, left, 46, 88, [{ img: ZSR.PerspArt.signBack() }]);
      this.poly(ctx, [left.concat(46), right.concat(46), right.concat(88), left.concat(88)], null, 2.5);
      if (!front) this.column(ctx, p.x, p.y, 0, 86, 3, 3, "#4a4a4f", 2);
    },
    /** A wrecked car: wheels, the body, the cabin with its windows (some smashed), rust. */
    car(ctx, p) {
      const A = (p.face || 0) + (p.rot || 0) + Math.PI / 2;
      const ux = Math.cos(A);
      const uy = Math.sin(A);
      const P = (l, w) => [p.x + ux * l - uy * w, p.y + uy * l + ux * w];
      const col = p.color || "#5a4538";
      const seed = Math.abs(Math.floor(p.x * 7 + p.y * 13)) % 97;
      this.shadow(ctx, p.x + 10, p.y + 8, 60, 34, A, 0.3);
      // wheels (one gone, on some)
      for (const [l, w] of [[-34, -27], [34, -27], [-34, 27], [34, 27]]) {
        if ((seed + l + w) % 7 === 0) continue;
        const c = [P(l - 10, w - 4), P(l + 10, w - 4), P(l + 10, w + 4), P(l - 10, w + 4)];
        const m = P(l, w);
        for (let i = 0; i < 4; i++) this.wall(ctx, c[i], c[(i + 1) % 4], m[0], m[1], 0, 18, null, "#1f2023");
      }
      const body = [P(-54, -27), P(54, -27), P(54, 27), P(-54, 27)];
      for (let i = 0; i < 4; i++) {
        const a = body[i];
        const b = body[(i + 1) % 4];
        if (!this.wall(ctx, a, b, p.x, p.y, 9, 28, null, i % 2 ? shade(col, -40) : shade(col, -22))) continue;
        // rust and a dent along the sides
        if (i % 2 === 0) {
          const t = 0.2 + (seed % 5) * 0.12;
          const q = (s, z) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, z];
          this.poly(ctx, [q(t, 11), q(t + 0.16, 12), q(t + 0.12, 22), q(t - 0.02, 20)], "rgba(122,62,28,0.6)", 0);
        }
      }
      this.poly(ctx, body.map((q) => q.concat(28)), col, 2.5);
      const cab = [P(-28, -23), P(22, -23), P(22, 23), P(-28, 23)];
      const cm = P(-3, 0);
      for (let i = 0; i < 4; i++) {
        const a = cab[i];
        const b = cab[(i + 1) % 4];
        if (!this.wall(ctx, a, b, cm[0], cm[1], 28, 47, null, shade(col, -14))) continue;
        const q = (s, z) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, z];
        const broken = (seed + i) % 3 === 0;
        this.poly(ctx, [q(0.12, 31), q(0.88, 31), q(0.82, 44), q(0.18, 44)], broken ? "#56636e" : "#2b3540", 2);
        if (broken) this.poly(ctx, [q(0.3, 32), q(0.5, 40), q(0.45, 36), q(0.7, 43)], null, 1.5);
      }
      this.poly(ctx, cab.map((q) => q.concat(47)), shade(col, 12), 2.5);
    },
    /** A supply crate on the road: a planked box, its top-down lid on top. */
    crate(ctx, c) {
      const A = c.face || 0;
      const ux = Math.cos(A);
      const uy = Math.sin(A);
      const P = (l, w) => [c.x + ux * l - uy * w, c.y + uy * l + ux * w];
      const q = [P(-17, -17), P(17, -17), P(17, 17), P(-17, 17)];
      this.shadow(ctx, c.x + 6, c.y + 5, 22, 18, A, 0.28);
      for (let i = 0; i < 4; i++) {
        const a = q[i];
        const b = q[(i + 1) % 4];
        if (!this.wall(ctx, a, b, c.x, c.y, 0, 28, null, i % 2 ? "#6e5230" : "#8a6a3e")) continue;
        const m = (s, z) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, z];
        this.poly(ctx, [m(0, 14), m(1, 14)], null, 2);
        this.poly(ctx, [m(0.08, 2), m(0.92, 26)], null, 2);
      }
      this.flat(ctx, c.x, c.y, 28, () => {
        ctx.translate(c.x, c.y);
        ctx.rotate(A);
        ZSR.Draw.prop(ctx, { kind: "crate", x: 0, y: 0, t: c.t });
      });
    },
    /** A walker: the interiors' standing sprite on its feet, two walk frames at their pace and a lurch. New ones
        fade in; one right behind the van's back doors (between it and the camera) is see-through, so it never hides
        the van. One beside the van is drawn solid, in front of the van or behind it as it stands. */
    walker(g, ctx, z) {
      let a = z.born == null ? 1 : clamp((g.time - z.born) / FADE_IN, 0, 1);
      const van = g.van;
      const fx = Math.cos(van.heading);
      const fy = Math.sin(van.heading);
      const ly = (z.x - van.x) * fx + (z.y - van.y) * fy;
      const lx = (z.x - van.x) * -fy + (z.y - van.y) * fx;
      if (ly < -van.h / 2 + 6 && ly > -van.h / 2 - 140 && Math.abs(lx) < van.w / 2 + z.r) a *= 0.45;
      const foot = this.project(z.x, z.y, 0);
      if (a <= 0 || !foot) return;
      const frame = Math.floor((g.time + z.phase) / ((0.35 * 55) / Math.max(20, z.speed))) % 2;
      ctx.save();
      ctx.globalAlpha *= a;
      this.shadow(ctx, z.x, z.y, z.r * 0.95, z.r * 0.7, 0, 0.18);
      const H = this.walkerH(z);
      this.billboard(ctx, ZSR.Draw3.walker(z.type, frame, z.hit > 0), z.x, z.y, H, 0.75, Math.sin(z.phase * 3) > 0, 0.5 + Math.sin(g.time * 2.4 + z.phase) * 0.15);
      ctx.restore();
    },
    /** The van as one closed box: walls in the yard van's own faces (cab and body down each side, the doors at the
        back, the nose at the front), the road's top-down art laid on the roof, every edge where its neighbour's is,
        and the roof gun standing on top. */
    van(g, ctx) {
      const D = ZSR.Draw;
      const T = (kind) => ZSR.Draw3.texture(kind, null, null, TEX_RES);
      const van = g.van;
      const fx = Math.cos(van.heading);
      const fy = Math.sin(van.heading);
      // the van's own frame, as sprites.js draws it: x to its right, y toward its back
      const L = (lx, ly) => [van.x - fy * lx - fx * ly, van.y + fx * lx - fy * ly];
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
      at(0, () => {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        D.rr(ctx, -30, -54, 72, 126, 10);
        ctx.fill();
      });
      const FL = L(-33, -59);
      const FR = L(33, -59);
      const BR = L(33, 59);
      const BL = L(-33, 59);
      // each wall as seen from outside, left to right: the nose is on the left of the yard van's side faces
      // the end faces leave a sliver clear down each side: crop it, so the corners close
      const END = [2 / 64, 62 / 64];
      const walls = [
        [BL, BR, [{ img: T("vanBack"), crop: END }]],
        [FL, BL, [{ img: T("vanCab") }, { img: T("vanBody") }]],
        [BR, FR, [{ img: T("vanBodyR"), flip: true }, { img: T("vanCab"), flip: true }]],
        [FR, FL, [{ img: T("vanFront"), crop: END }]],
      ];
      ctx.imageSmoothingQuality = "medium";
      for (const [left, right, pieces] of walls) if (this.faces(left, right, van.x, van.y)) this.texWall(ctx, left, right, 0, VAN_Z, pieces);
      this.roof(g, ctx, L);
      this.poly(ctx, [FL, FR, BR, BL].map((c) => c.concat(VAN_Z)), null, 3);
      this.gun(g, ctx);
    },
    /** The van's roof: the road's top-down van (paint, decal, windows, rack, the hurt flash) drawn into the van's
        own footprint, then laid on the walls' top edges in strips front to back, so its corners are theirs. */
    roof(g, ctx, L) {
      const D = ZSR.Draw;
      const van = g.van;
      const u = ZSR.State.save.upgrades;
      const looks = ZSR.Upgrades.PAINT_LOOKS;
      const R = TEX_RES;
      const c = this.roofCanvas || (this.roofCanvas = document.createElement("canvas"));
      if (c.width !== 66 * R) {
        c.width = 66 * R;
        c.height = 118 * R;
      }
      const x = c.getContext("2d");
      x.setTransform(R, 0, 0, R, 33 * R, 59 * R);
      x.fillStyle = looks[Math.min(u.paint || 0, looks.length - 1)].body;
      x.fillRect(-33, -59, 66, 118);
      const aimW = van.aimW == null ? van.heading : van.aimW;
      D.van(x, 0, 0, { upgrades: u, aim: aimW - van.heading - Math.PI / 2, t: g.time, hurt: van.hurt, flash: van.flash, scale: 1, moving: !(g.arrive && g.arrive.parked), gun: false });
      const N = 6;
      const step = 118 / N;
      for (let j = 0; j < N; j++) {
        const y0 = -59 + j * step;
        const a = L(-33, y0);
        const b = L(33, y0);
        const d = L(-33, y0 + step);
        const tl = this.project(a[0], a[1], VAN_Z);
        const tr = this.project(b[0], b[1], VAN_Z);
        const bl = this.project(d[0], d[1], VAN_Z);
        if (!tl || !tr || !bl) return;
        ctx.save();
        ctx.transform(tr.x - tl.x, tr.y - tl.y, bl.x - tl.x, bl.y - tl.y, tl.x, tl.y);
        ctx.drawImage(c, 0, j * step * R, 66 * R, step * R, 0, 0, 1, j < N - 1 ? 1.04 : 1);
        ctx.restore();
      }
    },
    /** The roof gun standing on the van: a ring and a post, then the barrels (one more per Spread Shot, longer with
        Heavier Rounds) along the aim and tipped down toward it, a flash at their tips as it fires. */
    gun(g, ctx) {
      const D = ZSR.Draw;
      const van = g.van;
      const u = ZSR.State.save.upgrades;
      const mx = van.x - Math.cos(van.heading) * van.h * 0.1;
      const my = van.y - Math.sin(van.heading) * van.h * 0.1;
      this.flat(ctx, mx, my, VAN_Z, () => D.circle(ctx, mx, my, 13, "#2f3136", 3));
      this.column(ctx, mx, my, VAN_Z, GUN_Z, 5, 5, "#3a3d42", 2);
      const p0 = this.project(mx, my, GUN_Z);
      if (!p0) return;
      const aim = van.aimW == null ? van.heading : van.aimW;
      const dz = van.aimDz || 0;
      const n = 1 + (u.spread || 0);
      const len = 26 + (u.damage || 0) * 3;
      const w = 5.5 * p0.s;
      const breech = () => D.circle(ctx, p0.x, p0.y, 7.5 * p0.s, "#2f3136", 2.5);
      // aimed back toward the camera, the barrels are in front of the breech
      const back = Math.cos(aim) * this.k.Fx + Math.sin(aim) * this.k.Fy < 0;
      if (back) breech();
      ctx.lineCap = "round";
      const tips = [];
      for (let i = 0; i < n; i++) {
        const a = aim + (i - (n - 1) / 2) * ZSR.Upgrades.SPREAD;
        const p1 = this.project(mx + Math.cos(a) * len, my + Math.sin(a) * len, GUN_Z + dz * len);
        if (!p1) continue;
        [[w + 3.5, INK], [w, "#4b5057"], [w * 0.3, "rgba(255,255,255,0.28)"]].forEach(([lw, c]) => {
          ctx.strokeStyle = c;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        });
        tips.push(p1);
      }
      if (!back) breech();
      if (van.flash > 0) for (const t of tips) D.circle(ctx, t.x, t.y, 8 * t.s, "#ffd25a", 2);
    },

    /** The whole world for one frame (game.js draw): the ground (on the card when there is one), what lies on it
        and changes, everything standing far to near, then shots in the air. */
    drawWorld(g, ctx, theme) {
      const k = this.setup(g);
      const haze = this.haze(g);
      const GL = ZSR.PerspGL;
      if (GL && GL.draw(g, this, theme, haze)) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
        this.sky(ctx, haze, g.mods.night);
      } else {
        if (GL) GL.hide(g);
        const t0 = performance.now();
        this.drawWorldGround(g, ctx, theme);
        this.pace(performance.now() - t0);
      }
      for (const f of g.fallen) this.flat(ctx, f.x, f.y, 1, () => ZSR.Draw.prop(ctx, f));
      for (const p of g.particles) this.flat(ctx, p.x, p.y, 4, () => ZSR.Draw.particle(ctx, p));
      // the overgrowth along this drive's roads, made once per drive
      if (this.vegFor !== g.drive) {
        this.veg = ZSR.PerspArt ? ZSR.PerspArt.scatter(g) : [];
        this.vegFor = g.drive;
      }
      const list = this.list || (this.list = []);
      list.length = 0;
      const yMin = this.groundY(k.H) - 260;
      const add = (o, t, x, y, back, size) => {
        const dx = x - k.ox;
        const dy = y - k.oy;
        const Y = dx * k.Fx + dy * k.Fy;
        if (Y < yMin - (size || 0) || Y > k.far + 150 + (size || 0)) return;
        const X = dx * k.Rx + dy * k.Ry;
        if (Math.abs(X) > ((k.W / 2 + 300) * this.depthAt(Math.max(Y, yMin))) / k.f + (size || 0)) return;
        o._t = t;
        o._Y = Y + (back || 0);
        list.push(o);
      };
      for (const o of this.veg) add(o, "plant", o.x, o.y);
      for (const p of g.props) if (p.kind !== "tire" && p.kind !== "rubble") add(p, "prop", p.x, p.y);
      for (const c of g.crates) add(c, "crate", c.x, c.y);
      // a building by its own middle (its lot's front can be behind the camera while the building is in view)
      const G = ZSR.Streets.GEOM;
      const mid = G.half + G.shoulder + G.lotGap + 168 + (G.lotDepth - 186) / 2;
      for (const l of g.drive.lots) add(l, "lot", l.qx - l.uy * l.side * mid, l.qy + l.ux * l.side * mid, 0, 260);
      for (const z of g.zombies) add(z, "walker", z.x, z.y);
      if (g.gameOverAt == null || g.gameOverAt > 0.9) add(g.van, "van", g.van.x, g.van.y);
      list.sort((a, b) => b._Y - a._Y);
      ctx.imageSmoothingQuality = "medium";
      const fog0 = k.far * 0.55;
      for (const o of list) {
        // far things go into the haze with the ground
        const fade = o._Y > fog0 ? 1 - clamp((o._Y - fog0) / (k.far - fog0), 0, 1) : 1;
        if (fade <= 0.02) continue;
        ctx.globalAlpha = fade;
        if (o._t === "plant") this.plant(ctx, o);
        else if (o._t === "prop") this.prop(ctx, o);
        else if (o._t === "crate") this.crate(ctx, o);
        else if (o._t === "lot") this.building(ctx, o);
        else if (o._t === "walker") this.walker(g, ctx, o);
        else this.van(g, ctx);
      }
      ctx.globalAlpha = 1;
      for (const b of g.bullets) this.flat(ctx, b.x, b.y, b.z == null ? AIM_Z : b.z, () => ZSR.Draw.bullet(ctx, b));
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
        const p = this.project(z.x, z.y, this.walkerH(z) / 2);
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
