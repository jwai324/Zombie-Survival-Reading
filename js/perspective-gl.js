/* The angled road camera's ground on the graphics card (WebGL), under the road's own 2D canvas.
   The ground is cut into squares fixed in the world: small ones near the van, four times bigger far off (fewer to
   draw where detail does not show). Each is drawn once with the road's own art (Persp.drawGround: grass,
   overgrowth, roads, lanes, lots), as sharp as how near it is, kept, and laid down through the same camera as
   everything else; the far ones first, the near ones over them. The card blends each square's smaller copies, so the far road does not
   shimmer, and fades the ground into haze toward the far edge. Squares are drawn a few per frame, the most visible
   first (near the van, then missing ones, then those the view will need a moment later), as many as fit in the
   frame's budget by what each size has been costing; one not drawn yet shows a coarser copy, or haze, until it is.
   The squares do not turn, but a turning view needs new ones at its side (a turn wants about twice a straight's, a
   sharp one far more, and it looks back over ground passed a few seconds before): the squares the view will need a
   moment later, along the van's own path (the turn it has committed to above all), are kept on the card and drawn
   ahead, and the card keeps as many squares as the window's view needs, a few seconds' worth (keepFor).
   Without WebGL (or while it is lost) this says no and js/perspective.js warps the ground on the 2D canvas instead;
   once the browser gives the card back, its squares are drawn again as at a drive's start. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  // the two sizes of square: T its side (world units), pad drawn past each edge so neighbours meet without a seam,
  // the stretch of road ahead it covers, and its px by how far ahead it lies (powers of two, for the smaller copies)
  const GRIDS = [
    { T: 1024, pad: 32, from: 1700, to: Infinity, lods: [{ px: 256, upTo: 2700 }, { px: 128, upTo: Infinity }] },
    { T: 256, pad: 8, from: -Infinity, to: 1900, lods: [{ px: 512, upTo: 900 }, { px: 256, upTo: Infinity }] },
  ];
  // SCALE: ms of square drawing per frame (the first frames of a drive get more); a turn wants about twice a
  // straight's new squares, and a bigger cfg.far or a wider screen more
  const BUDGET = 7;
  // SCALE: squares kept on the card: KEEP_VIEWS times the most a view of this window needs (keepFor: about 192 at
  // 1280x800, 218 at 1920x1080, 278 at 2560x1080, so it keeps 365, 415 and 529), never under KEEP. The views ahead,
  // drawn early, need more on top of the view's own (on a straight about 1.5 views, through a sharp turn 2 or more),
  // and a turn looks back over ground passed a few seconds before: KEEP_VIEWS covers about the last 3 seconds of a
  // drive. Memory grows with it (mipmaps in: about 230 MB at 1280x800, 270 at 1920x1080, 350 at 2560x1080; 1.4
  // would save about a quarter at 2560 for more squares drawn again). A view that needs more still keeps its own
  // squares, those the views ahead hold, and SPARE more (evict), so a very wide screen costs memory, never squares
  // drawn again every frame
  const KEEP = 360;
  const KEEP_VIEWS = 1.9;
  const SPARE = 48;
  // the squares the view will need soon: the views AHEAD_SECS seconds on along the van's own path, as the camera's
  // spring will turn them (Game.viewsAhead); kept on the card every frame, and drawn in the frame's BUDGET after the
  // squares near the van and the missing ones under the view (the soonest view's before the rest's sharpening); a
  // square used in the last FRESH frames is never pushed off the card for one drawn ahead
  // SCALE: the card must hold a view's squares plus those drawn ahead (keepFor); more or later AHEAD_SECS views need
  // more of both
  // SCALE: ms of square drawing a frame while the van waits at its door for its first view (game.js prepStep): the
  // waiting frames stay near 30 fps while the view and the views ahead are drawn (a slow computer gets PREP_SECS)
  const PREP_BUDGET = 24;
  // ... and its holes (nothing but haze under them) up to this many ms a frame, so the first frame shows soon and the
  // rest fill in over the next few while it waits (the first frames of a drive without the wait get this as BUDGET)
  const PREP_HOLES = 60;
  // A square costs the card more than this code sees: its upload and smaller copies run on the card after the code
  // returns, so a fast processor with a slow card fits several a frame in BUDGET, each slowing the frames, and a slow
  // frame lets the van cover more ground, wanting more squares the next (owner, 2026-10-17: 9 fps driving, 28 paused,
  // the page's own draw 12 ms). So once the real frame interval (game.js g.rafMs, smoothed: slowGap) is over
  // TILE_SLOW_MS, a frame draws at most 2 * TILE_SLOW_MS / interval squares (at least 1; a hole near the van always)
  // SCALE: an interval, the same at any city size; over a 30 fps cap's 33.3 ms so a capped browser keeps its squares
  const TILE_SLOW_MS = 40;
  const AHEAD_SECS = [0.35, 0.7, 1.1];
  const FRESH = 30;
  const COST0 = { 512: 3, 256: 1.2, 128: 0.5 }; // ms a square of each size is guessed to cost before one has been timed
  const normA = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  const VS =
    "attribute vec2 aPos; attribute vec2 aUv; uniform mat4 uM; varying vec2 vUv; varying float vD;" +
    "void main() { vec4 p = uM * vec4(aPos, 0.0, 1.0); gl_Position = p; vUv = aUv; vD = p.w; }";
  const FS =
    "precision mediump float; uniform sampler2D uTex; uniform vec3 uHaze; uniform vec2 uFog; varying vec2 vUv; varying float vD;" +
    "void main() { vec3 c = texture2D(uTex, vUv).rgb; gl_FragColor = vec4(mix(c, uHaze, smoothstep(uFog.x, uFog.y, vD)), 1.0); }";

  const GL = {
    ok: null, // null: not tried; true / false
    canvas: null,
    gl: null,
    tiles: new Map(), // "x,y,lod" -> { tex, used }
    keep: KEEP, // squares kept on the card for this window (keepFor)
    scratch: {}, // a 2D canvas per size, to draw squares in
    frame: 0,
    cost: Object.assign({}, COST0), // ms each size of square has been taking (a running mean)
    gap: 0, // the real frame interval, ms, smoothed (slowGap), and the frame it was last read on
    rafN: null,

    /** The card, its program and its canvas under the road's (once). */
    init(g) {
      if (this.ok != null) return this.ok;
      this.ok = false;
      if (typeof document === "undefined" || !g.canvas || !g.canvas.parentNode) return false;
      const c = document.createElement("canvas");
      let gl = null;
      try {
        gl = c.getContext("webgl", { alpha: false, antialias: false, depth: false, preserveDrawingBuffer: false });
      } catch (e) {
        gl = null;
      }
      if (!gl || !this.setupGL(gl)) return false;
      this.gl = gl;
      c.setAttribute("aria-hidden", "true");
      Object.assign(c.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "none", pointerEvents: "none" });
      g.canvas.parentNode.insertBefore(c, g.canvas);
      this.canvas = c;
      this.road = g.canvas;
      // the road's canvas comes and goes with the screens: the ground goes with it
      if (root.MutationObserver) new root.MutationObserver(() => this.sync()).observe(g.canvas, { attributes: true, attributeFilter: ["class"] });
      c.addEventListener("webglcontextlost", (e) => {
        e.preventDefault();
        this.ok = false;
        this.hide(g);
      });
      // the card back (a driver reset, a graphics process restarted): a new program, and every square drawn again,
      // as at a drive's start (the old textures went with the lost context, so there is nothing to delete)
      c.addEventListener("webglcontextrestored", () => {
        if (!this.setupGL(this.gl)) return;
        this.tiles = new Map();
        this.cost = Object.assign({}, COST0);
        this.drive = null;
        this.ok = true;
      });
      return (this.ok = true);
    },
    /** The card's program, buffer and filtering, on a new context or one given back after a loss; false if it fails. */
    setupGL(gl) {
      const sh = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
      };
      const vs = sh(gl.VERTEX_SHADER, VS);
      const fs = sh(gl.FRAGMENT_SHADER, FS);
      if (!vs || !fs) return false;
      const pr = gl.createProgram();
      gl.attachShader(pr, vs);
      gl.attachShader(pr, fs);
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return false;
      this.prog = pr;
      this.loc = { pos: gl.getAttribLocation(pr, "aPos"), uv: gl.getAttribLocation(pr, "aUv"), m: gl.getUniformLocation(pr, "uM"), tex: gl.getUniformLocation(pr, "uTex"), haze: gl.getUniformLocation(pr, "uHaze"), fog: gl.getUniformLocation(pr, "uFog") };
      this.buf = gl.createBuffer();
      this.aniso = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
      this.maxAniso = this.aniso ? Math.min(8, gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) : 0;
      return true;
    },
    sync() {
      if (this.canvas) this.canvas.style.display = this.on && !this.road.classList.contains("hidden") ? "block" : "none";
    },
    /** No card (none at all, or lost): no ground here, and the road's canvas paints its own background again. */
    hide(g) {
      if (!this.canvas || !this.on) return;
      this.on = false;
      g.canvas.style.background = "";
      this.sync();
    },
    show(g) {
      if (this.on) return;
      this.on = true;
      g.canvas.style.background = "transparent";
      this.sync();
    },

    /** Draws the ground for this frame through the camera P.k; false when there is no card. */
    draw(g, P, theme, hazeRGB) {
      if (!this.init(g) || !this.ok) return false;
      const gl = this.gl;
      const k = P.k;
      this.show(g);
      // a new drive (or a new kind of day, or other flat pieces left off the ground: Persp.groundKey) draws its
      // squares again
      const key = (theme ? (theme.asphalt ? "night" : "fog") : "day") + "|" + (P.groundKey ? P.groundKey() : "");
      if (this.drive !== g.drive || this.key !== key) {
        this.clear();
        this.drive = g.drive;
        this.key = key;
        this.started = 0;
      }
      this.frame++;
      this.started++;
      this.keepFor(P);
      const dpr = Math.min(1.5, g.dpr || 1); // the ground is textures: more pixels than this only cost the card
      const cw = Math.round(k.W * dpr);
      const ch = Math.round(k.H * dpr);
      if (this.canvas.width !== cw || this.canvas.height !== ch) {
        this.canvas.width = cw;
        this.canvas.height = ch;
      }
      // the squares under the view, from just behind the van to the far edge: far grid first
      const need = [];
      const want = [];
      const nearGrid = GRIDS[GRIDS.length - 1];
      const bare = GRIDS[0].from - GRIDS[0].T; // nearer than this no coarser square lies under a near one
      let miss = 0;
      this.under(P, k.ox, k.oy, k.Fx, k.Fy, (grid, tx, ty, lod, Y) => {
        const tile = this.best(grid, tx, ty, lod);
        if (!tile) miss++;
        if (!tile || tile.lod !== lod) want.push({ grid, tx, ty, lod, Y, hole: !tile && grid === nearGrid && Y < bare, copy: !!tile });
        if (tile) {
          tile.used = this.frame;
          need.push({ grid, tx, ty, tile });
        }
      });
      // the squares the views a moment ahead will need: every frame those on the card are kept (a turn never pushes off
      // a square it needs again a moment later), and the missing ones join the work below
      const soon = g.viewsAhead ? this.aheadScan(g, P) : null;
      // the work, most visible first: a hole near the van (nothing but haze under it); the squares near the van
      // (NEAR_SHARP: as sharp as they should be, or missing); further out, a missing square (a coarser one or the haze
      // shows there); one the soonest view ahead needs (a sharp turn swings the view onto it); a further square at the
      // wrong sharpness; then the later views'. Nearest first in each. Each is started only if what its size has been
      // costing still fits the frame's budget (so a frame does not run over by a square), except the frame's first (on
      // a slow computer one square can cost more than the whole budget) and one hole (while the van waits at its door,
      // every hole up to PREP_HOLES ms: nothing moves while they are drawn); one ahead only while the card has room
      // for it without pushing off a square in use
      const sharpY = nearGrid.lods[0].upTo;
      const work = want.map((w) => ({ w, rank: w.hole ? 0 : w.Y < sharpY ? 1 : !w.copy ? 2 : 4, Y: w.Y }));
      if (soon) for (const c of soon.list) work.push({ c, rank: c.pr < 1e5 ? 3 : 5, Y: c.pr % 1e5 });
      work.sort((a, b) => a.rank - b.rank || a.Y - b.Y);
      const t0 = performance.now();
      // (the van waiting at its door while its first view is made, game.js prepStep: PREP_BUDGET)
      const budget = g.prep ? PREP_BUDGET : this.started < 4 ? PREP_HOLES : BUDGET;
      // ... and on slow frames, a few squares at most (TILE_SLOW_MS)
      const cap = g.prep || this.started < 4 ? Infinity : this.squareCap(g);
      // (miss: squares under the view with no copy at all; nearLeft: near the van, left at the wrong sharpness or
      // missing; aheadLeft: the views ahead's missing squares left for want of time, -1 with no views ahead)
      const st = (this.stats = { drive: g.drive, want: want.length, miss, have: need.length, made: 0, ahead: 0, aheadLeft: soon ? 0 : -1, holes: 0, nearLeft: 0, ms: 0, cap });
      let forced = false;
      let room = null;
      for (const it of work) {
        const w = it.w || it.c;
        // (one a view ahead needs that is under the view too may have been drawn just now: then it is there)
        if (it.c && this.best(w.grid, w.tx, w.ty, w.lod)) continue;
        const px = w.grid.lods[w.lod].px;
        const end = performance.now() - t0 + this.cost[px];
        if (st.made + st.ahead && (end > budget || st.made + st.ahead >= cap)) {
          if (!w.hole || (forced && !(g.prep && end <= PREP_HOLES))) {
            if (it.c) st.aheadLeft++;
            else {
              if (w.hole) st.holes++;
              if (w.Y < sharpY) st.nearLeft++;
            }
            continue;
          }
          forced = true;
        }
        if (it.c) {
          if (room == null) {
            let fresh = 0;
            for (const t of this.tiles.values()) if (t.used >= this.frame - FRESH) fresh++;
            room = Math.max(this.keep, need.length + soon.kept + SPARE) - fresh;
          }
          if (room <= 0) continue;
          room--;
          this.timed(g, P, w.grid, w.tx, w.ty, w.lod, theme);
          st.ahead++;
          continue;
        }
        st.made++;
        const tile = this.timed(g, P, w.grid, w.tx, w.ty, w.lod, theme);
        const i = need.findIndex((n) => n.grid === w.grid && n.tx === w.tx && n.ty === w.ty);
        if (i >= 0) need[i].tile = tile;
        else need.push({ grid: w.grid, tx: w.tx, ty: w.ty, tile });
      }
      st.ms = performance.now() - t0;
      this.evict(need.length + (soon ? soon.kept : 0));
      // lay them down
      gl.viewport(0, 0, cw, ch);
      gl.clearColor(hazeRGB[0] / 255, hazeRGB[1] / 255, hazeRGB[2] / 255, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!need.length) return true;
      need.sort((a, b) => b.grid.T - a.grid.T);
      const v = new Float32Array(need.length * 16);
      need.forEach((n, i) => {
        const T = n.grid.T;
        const u0 = n.grid.pad / (T + 2 * n.grid.pad);
        const u1 = 1 - u0;
        const x0 = n.tx * T - k.ox;
        const y0 = n.ty * T - k.oy;
        v.set([x0, y0, u0, u0, x0 + T, y0, u1, u0, x0, y0 + T, u0, u1, x0 + T, y0 + T, u1, u1], i * 16);
      });
      gl.useProgram(this.prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
      gl.bufferData(gl.ARRAY_BUFFER, v, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.loc.pos);
      gl.vertexAttribPointer(this.loc.pos, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(this.loc.uv);
      gl.vertexAttribPointer(this.loc.uv, 2, gl.FLOAT, false, 16, 8);
      gl.uniformMatrix4fv(this.loc.m, false, this.matrix(k));
      gl.uniform1i(this.loc.tex, 0);
      gl.uniform3f(this.loc.haze, hazeRGB[0] / 255, hazeRGB[1] / 255, hazeRGB[2] / 255);
      gl.uniform2f(this.loc.fog, P.depthAt(k.fogG), P.depthAt(k.far));
      gl.activeTexture(gl.TEXTURE0);
      need.forEach((n, i) => {
        gl.bindTexture(gl.TEXTURE_2D, n.tile.tex);
        gl.drawArrays(gl.TRIANGLE_STRIP, i * 4, 4);
      });
      return true;
    },
    /** Every square under a view from (ox, oy) facing (Fx, Fy), at this frame's camera height, pitch and lens (P.k),
        far grid first: fn(grid, tx, ty, lod, Y) with Y how far ahead of the view's spot it lies. */
    under(P, ox, oy, Fx, Fy, fn) {
      const k = P.k;
      const Rx = -Fy;
      const Ry = Fx;
      const top = Math.min(k.far, P.groundY(0));
      const yMin = P.groundY(k.H) - 256;
      const hwAt = (Y) => ((k.W / 2 + 80) * P.depthAt(Math.max(Y, yMin))) / k.f;
      for (const grid of GRIDS) {
        const T = grid.T;
        const ya = Math.max(yMin, grid.from - T);
        const yb = Math.min(top, grid.to) + T;
        if (ya > yb) continue;
        const ha = hwAt(ya);
        const hb = hwAt(yb);
        let x0 = Infinity;
        let x1 = -Infinity;
        let y0 = Infinity;
        let y1 = -Infinity;
        for (const [Y, X] of [[ya, -ha], [ya, ha], [yb, -hb], [yb, hb]]) {
          const x = ox + Rx * X + Fx * Y;
          const y = oy + Ry * X + Fy * Y;
          x0 = Math.min(x0, x);
          x1 = Math.max(x1, x);
          y0 = Math.min(y0, y);
          y1 = Math.max(y1, y);
        }
        const tx1 = Math.floor(x1 / T);
        const ty1 = Math.floor(y1 / T);
        for (let tx = Math.floor(x0 / T); tx <= tx1; tx++) {
          for (let ty = Math.floor(y0 / T); ty <= ty1; ty++) {
            const cx = (tx + 0.5) * T - ox;
            const cy = (ty + 0.5) * T - oy;
            const Y = cx * Fx + cy * Fy;
            const X = cx * Rx + cy * Ry;
            if (Y < ya - T * 0.75 || Y > yb + T * 0.25 || Math.abs(X) > hwAt(Y + T) + T) continue;
            let lod = 0;
            while (Y > grid.lods[lod].upTo) lod++;
            fn(grid, tx, ty, lod, Y);
          }
        }
      }
    },
    /** The squares the view will need a moment on (g.viewsAhead(AHEAD_SECS): along the van's own path, its turn and
        the road it rejoins, never past a stop line it has not crossed), every frame: one on the card already (any copy)
        is kept fresh (as of last frame: on a tie the squares on the screen now outlast it), so it is not pushed off
        and drawn again a moment later; { kept: those of them not under the view now, list: the missing ones, soonest
        and nearest first }. */
    aheadScan(g, P) {
      const cand = new Map();
      const frame = this.frame;
      let kept = 0;
      g.viewsAhead(AHEAD_SECS).forEach((a, n) => {
        this.under(P, a.x, a.y, Math.cos(a.th), Math.sin(a.th), (grid, tx, ty, lod, Y) => {
          const have = this.best(grid, tx, ty, lod);
          if (have) {
            if (have.used < frame && have.soon !== frame) kept++;
            have.soon = frame;
            have.used = Math.max(have.used, frame - 1);
            return;
          }
          const key = grid.T + ":" + tx + "," + ty + "," + lod;
          const pr = n * 1e5 + Y;
          const c = cand.get(key);
          if (!c || c.pr > pr) cand.set(key, { grid, tx, ty, lod, pr });
        });
      });
      return { kept, list: [...cand.values()].sort((a, b) => a.pr - b.pr) };
    },
    /** How many squares this window keeps (this.keep): KEEP_VIEWS times the most squares a view of it needs (its
        size, lens and camera height, at 8 headings and 2 spots off the grid), never under KEEP; worked out again
        when the window or the camera changes. */
    keepFor(P) {
      const k = P.k;
      const sig = k.W + "x" + k.H + ":" + k.f.toFixed(2) + ":" + k.h.toFixed(2) + ":" + k.b.toFixed(2) + ":" + k.far;
      if (this.keepSig === sig) return this.keep;
      this.keepSig = sig;
      let most = 0;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 8;
        for (const off of [0, 0.5]) {
          let n = 0;
          this.under(P, off * 256, off * 256, Math.cos(a), Math.sin(a), () => n++);
          most = Math.max(most, n);
        }
      }
      this.viewMost = most;
      return (this.keep = Math.max(KEEP, Math.ceil(KEEP_VIEWS * most)));
    },
    /** The real frame interval in ms (game.js g.rafMs), smoothed over about half a second, for TILE_SLOW_MS: once a
        frame (g.rafN); not a pause, the van waiting at its door, or a gap over 250 ms. Kept from drive to drive. */
    slowGap(g) {
      if (g.rafN == null || g.rafN === this.rafN) return this.gap || 0;
      this.rafN = g.rafN;
      const ms = +g.rafMs || 0;
      if (ms > 0 && ms <= 250 && !g.paused && !g.prep) this.gap = this.gap > 0 ? this.gap + (ms - this.gap) * (1 - Math.exp(-ms / 500)) : ms;
      return this.gap || 0;
    },
    /** The most squares this frame may draw (TILE_SLOW_MS): Infinity unless the frames are slow. */
    squareCap(g) {
      const gap = this.slowGap(g);
      return gap <= TILE_SLOW_MS ? Infinity : Math.max(1, Math.round((2 * TILE_SLOW_MS) / gap));
    },
    /** make(), timed: what each size of square costs, as a running mean, for the budget. */
    timed(g, P, grid, tx, ty, lod, theme) {
      const px = grid.lods[lod].px;
      const t = performance.now();
      const tile = this.make(g, P, grid, tx, ty, lod, theme);
      this.cost[px] = this.cost[px] * 0.8 + (performance.now() - t) * 0.2;
      tile.used = this.frame;
      return tile;
    },
    /** The camera as the card wants it: world (relative to the camera's spot) -> clip space, the same sums as
        Persp.project; clipped a little in front of the camera. */
    matrix(k) {
      const D = [k.cs * k.Fx, k.cs * k.Fy, 0, k.cs * k.b + k.h * k.sn];
      const Yc = [k.sn * k.Fx, k.sn * k.Fy, 0, k.sn * k.b - k.h * k.cs];
      const X = [k.Rx, k.Ry, 0, 0];
      const sx = (k.cx - k.W / 2) / (k.W / 2);
      const sy = (k.cy - k.H / 2) / (k.H / 2);
      const r0 = X.map((v, i) => ((2 * k.f) / k.W) * v + sx * D[i]);
      const r1 = Yc.map((v, i) => ((2 * k.f) / k.H) * v - sy * D[i]);
      const r2 = D.map((v, i) => v - (i === 3 ? 10 : 0));
      const m = new Float32Array(16);
      for (let c = 0; c < 4; c++) {
        m[c * 4] = r0[c];
        m[c * 4 + 1] = r1[c];
        m[c * 4 + 2] = r2[c];
        m[c * 4 + 3] = D[c];
      }
      return m;
    },
    /** The copy of a square kept nearest to the sharpness wanted. */
    best(grid, tx, ty, lod) {
      const key = grid.T + ":" + tx + "," + ty + ",";
      let t = this.tiles.get(key + lod);
      if (t) return t;
      for (let d = 1; d < grid.lods.length; d++) {
        t = this.tiles.get(key + (lod + d)) || this.tiles.get(key + (lod - d));
        if (t) return t;
      }
      return null;
    },
    /** Draws one square with the road's art and hands it to the card, with its smaller copies. */
    make(g, P, grid, tx, ty, lod, theme) {
      const gl = this.gl;
      const T = grid.T;
      const pad = grid.pad;
      const S = grid.lods[lod].px;
      const c = this.scratch[S] || (this.scratch[S] = document.createElement("canvas"));
      c.width = S;
      c.height = S;
      const x = c.getContext("2d");
      const kk = S / (T + 2 * pad);
      x.setTransform(kk, 0, 0, kk, -kk * (tx * T - pad), -kk * (ty * T - pad));
      P.drawGround(g, x, { x: (tx + 0.5) * T, y: (ty + 0.5) * T, r: (T / 2 + pad) * 1.42, half: T / 2 + pad, px: kk }, theme);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (this.aniso) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, this.maxAniso);
      const tile = { tex, lod, used: this.frame };
      const key = T + ":" + tx + "," + ty + "," + lod;
      const was = this.tiles.get(key); // (never twice, but a copy replaced must not stay on the card)
      if (was) gl.deleteTexture(was.tex);
      this.tiles.set(key, tile);
      return tile;
    },
    /** Past the keeping limit, the squares unused longest go: KEEP, or for a view that needs more (a very wide
        screen, a sharp turn's views ahead) the squares it and they use and SPARE more, so a square in use this frame,
        or wanted by a view just ahead, never goes. */
    evict(inView) {
      const keep = Math.max(this.keep, (inView || 0) + SPARE);
      if (this.tiles.size <= keep) return;
      const old = [...this.tiles.entries()].sort((a, b) => a[1].used - b[1].used);
      for (let i = 0; i < old.length - keep; i++) {
        this.gl.deleteTexture(old[i][1].tex);
        this.tiles.delete(old[i][0]);
      }
    },
    clear() {
      if (this.gl) for (const t of this.tiles.values()) this.gl.deleteTexture(t.tex);
      this.tiles.clear();
    },
    /** A drive has really stopped (js/perspective.js release): every square off the card, the scratch canvases and
        the card's own canvas let go (a parked game holds none of it); the next drive draws its squares again as at any
        drive's start. A lost card's textures went with it: deleting them is harmless. */
    release() {
      this.clear();
      this.drive = null;
      this.key = null;
      this.stats = null;
      for (const S of Object.keys(this.scratch)) this.scratch[S].width = this.scratch[S].height = 0;
      this.scratch = {};
      if (this.canvas) this.canvas.width = this.canvas.height = 1;
    },
  };
  GL.TILE_SLOW_MS = TILE_SLOW_MS;
  ZSR.PerspGL = GL;
})(typeof window !== "undefined" ? window : globalThis);
