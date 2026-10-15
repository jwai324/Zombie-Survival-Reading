/* The angled road camera's ground on the graphics card (WebGL), under the road's own 2D canvas.
   The ground is cut into squares fixed in the world: small ones near the van, four times bigger far off (fewer to
   draw where detail does not show). Each is drawn once with the road's own art (Persp.drawGround: grass,
   overgrowth, roads, lanes, lots), as sharp as how near it is, kept, and laid down through the same camera as
   everything else; the far ones first, the near ones over them. The card blends each square's smaller copies, so the far road does not
   shimmer, and fades the ground into haze toward the far edge. Squares are drawn a few per frame, nearest first; one
   not drawn yet shows a coarser copy, or haze, until it is. Turning costs nothing: the squares do not turn.
   Without WebGL (or if it is lost) this says no and js/perspective.js warps the ground on the 2D canvas instead. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  // the two sizes of square: T its side (world units), pad drawn past each edge so neighbours meet without a seam,
  // the stretch of road ahead it covers, and its px by how far ahead it lies (powers of two, for the smaller copies)
  const GRIDS = [
    { T: 1024, pad: 32, from: 1700, to: Infinity, lods: [{ px: 256, upTo: 2700 }, { px: 128, upTo: Infinity }] },
    { T: 256, pad: 8, from: -Infinity, to: 1900, lods: [{ px: 512, upTo: 900 }, { px: 256, upTo: Infinity }] },
  ];
  const BUDGET = 7; // ms of square drawing per frame (the first frames of a drive get more)
  const KEEP = 300; // squares kept on the card at most (a view needs under 200)

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
    scratch: {}, // a 2D canvas per size, to draw squares in
    frame: 0,

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
      if (!gl) return false;
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
      this.gl = gl;
      this.prog = pr;
      this.loc = { pos: gl.getAttribLocation(pr, "aPos"), uv: gl.getAttribLocation(pr, "aUv"), m: gl.getUniformLocation(pr, "uM"), tex: gl.getUniformLocation(pr, "uTex"), haze: gl.getUniformLocation(pr, "uHaze"), fog: gl.getUniformLocation(pr, "uFog") };
      this.buf = gl.createBuffer();
      this.aniso = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
      this.maxAniso = this.aniso ? Math.min(8, gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) : 0;
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
      return (this.ok = true);
    },
    sync() {
      if (this.canvas) this.canvas.style.display = this.on && !this.road.classList.contains("hidden") ? "block" : "none";
    },
    /** The flat camera, or no card: no ground here, and the road's canvas paints its own background again. */
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
      // a new drive (or a new kind of day) draws its squares again
      const key = theme ? (theme.asphalt ? "night" : "fog") : "day";
      if (this.drive !== g.drive || this.key !== key) {
        this.clear();
        this.drive = g.drive;
        this.key = key;
        this.started = 0;
      }
      this.frame++;
      this.started++;
      const dpr = Math.min(1.5, g.dpr || 1); // the ground is textures: more pixels than this only cost the card
      const cw = Math.round(k.W * dpr);
      const ch = Math.round(k.H * dpr);
      if (this.canvas.width !== cw || this.canvas.height !== ch) {
        this.canvas.width = cw;
        this.canvas.height = ch;
      }
      // the squares under the view, from just behind the van to the far edge: far grid first
      const top = Math.min(k.far, P.groundY(0));
      const yMin = P.groundY(k.H) - 256;
      const hwAt = (Y) => ((k.W / 2 + 80) * P.depthAt(Math.max(Y, yMin))) / k.f;
      const need = [];
      const want = [];
      for (const grid of GRIDS) {
        const T = grid.T;
        const ya = Math.max(yMin, grid.from - T);
        const yb = Math.min(top, grid.to) + T;
        if (ya > yb) continue;
        const corners = [
          [ya, -hwAt(ya)],
          [ya, hwAt(ya)],
          [yb, -hwAt(yb)],
          [yb, hwAt(yb)],
        ].map(([Y, X]) => [k.ox + k.Rx * X + k.Fx * Y, k.oy + k.Ry * X + k.Fy * Y]);
        const tx0 = Math.floor(Math.min(...corners.map((c) => c[0])) / T);
        const tx1 = Math.floor(Math.max(...corners.map((c) => c[0])) / T);
        const ty0 = Math.floor(Math.min(...corners.map((c) => c[1])) / T);
        const ty1 = Math.floor(Math.max(...corners.map((c) => c[1])) / T);
        for (let tx = tx0; tx <= tx1; tx++) {
          for (let ty = ty0; ty <= ty1; ty++) {
            const cx = (tx + 0.5) * T - k.ox;
            const cy = (ty + 0.5) * T - k.oy;
            const Y = cx * k.Fx + cy * k.Fy;
            const X = cx * k.Rx + cy * k.Ry;
            if (Y < ya - T * 0.75 || Y > yb + T * 0.25 || Math.abs(X) > hwAt(Y + T) + T) continue;
            let lod = 0;
            while (Y > grid.lods[lod].upTo) lod++;
            const tile = this.best(grid, tx, ty, lod);
            if (!tile || tile.lod !== lod) want.push({ grid, tx, ty, lod, Y });
            if (tile) {
              tile.used = this.frame;
              need.push({ grid, tx, ty, tile });
            }
          }
        }
      }
      // draw missing squares, nearest first, within the frame's budget
      want.sort((a, b) => a.Y - b.Y);
      const t0 = performance.now();
      const budget = this.started < 4 ? 60 : BUDGET;
      this.stats = { want: want.length, have: need.length, made: 0, ms: 0 };
      for (const w of want) {
        if (performance.now() - t0 > budget) break;
        this.stats.made++;
        const tile = this.make(g, P, w.grid, w.tx, w.ty, w.lod, theme);
        tile.used = this.frame;
        const i = need.findIndex((n) => n.grid === w.grid && n.tx === w.tx && n.ty === w.ty);
        if (i >= 0) need[i].tile = tile;
        else need.push({ grid: w.grid, tx: w.tx, ty: w.ty, tile });
      }
      this.stats.ms = performance.now() - t0;
      this.evict();
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
      gl.uniform2f(this.loc.fog, P.depthAt(k.far * 0.45), P.depthAt(k.far));
      gl.activeTexture(gl.TEXTURE0);
      need.forEach((n, i) => {
        gl.bindTexture(gl.TEXTURE_2D, n.tile.tex);
        gl.drawArrays(gl.TRIANGLE_STRIP, i * 4, 4);
      });
      return true;
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
      this.tiles.set(T + ":" + tx + "," + ty + "," + lod, tile);
      return tile;
    },
    /** Past the keeping limit, the squares unused longest go. */
    evict() {
      if (this.tiles.size <= KEEP) return;
      const old = [...this.tiles.entries()].sort((a, b) => a[1].used - b[1].used);
      for (let i = 0; i < old.length - KEEP; i++) {
        this.gl.deleteTexture(old[i][1].tex);
        this.tiles.delete(old[i][0]);
      }
    },
    clear() {
      for (const t of this.tiles.values()) this.gl.deleteTexture(t.tex);
      this.tiles.clear();
    },
  };
  ZSR.PerspGL = GL;
})(typeof window !== "undefined" ? window : globalThis);
