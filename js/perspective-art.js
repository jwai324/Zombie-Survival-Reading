/* Art for the angled road camera (js/perspective.js): what stands by the road seen from the side, and the
   overgrowth on the ground, in the road's comic style (heavy ink, muted fills, halftone).
   - sprite(kind, variant): leafy and dead trees, bushes, tall grass and barrels, drawn once into small canvases
     and kept; feet at the bottom middle;
   - signBoard(text, color), signBack(), barrier(): faces laid on standing signs and barriers;
   - cover(): weeds, grass and moss over the ground and up through the road's cracks, seeded by place, so ground
     squares drawn apart still meet;
   - vegLayout(): the bushes, tall grass and trees standing all over the land, so the town looks overgrown: made a
     square at a time as the view first reaches it, seeded by place;
   - buckets(): things filed by the squares they reach, to find the ones near a spot without looking at them all.
   Nothing grows in the river (js/sprites.js Draw.inRiver). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  // SCALE: the plants' candidate spots lie on a grid this fine over the whole world (world units): one try a cell,
  // seeded by the cell, so a spot always grows the same plant and squares of plants made apart meet without a seam
  const VEG_STEP = 120;
  // SCALE: the roads, side streets, corners and lots are filed in buckets this big (world units) for the plants: a
  // square of plants looks only at what is filed in its bucket, so its cost stays the same however big the city is
  const VEG_BUCKET = 2048;
  // past this far from the nearest asphalt's edge (world units) the land is at its sparsest: no road changes a plant
  const VEG_REACH = 700;
  // a plant's foot keeps this far (world px) off the river's muddy bank; the ground's overgrowth, its marks' reach
  const RIVER_CLEAR = 10;
  const COVER_CLEAR = 40;
  /** One 32-bit number mixed well from another (murmur3's last steps): seeds for spots side by side look unrelated. */
  const mix = (h) => {
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return (h ^ (h >>> 16)) >>> 0;
  };
  // a bucket's or square's key: SCALE: up to 32768 of them each way from the origin
  const keyOf = (bx, by) => (bx + 0x8000) * 0x10000 + (by + 0x8000);
  const cache = new Map();
  function canvas(key, w, h, draw) {
    let c = cache.get(key);
    if (!c) {
      c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      draw(c.getContext("2d"), w, h);
      cache.set(key, c);
    }
    return c;
  }
  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }
  const hash2 = (x, y) => (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
    return "rgb(" + f(n >> 16) + "," + f((n >> 8) & 255) + "," + f(n & 255) + ")";
  }
  function halftone(ctx, w, h, alpha, step) {
    const d = step || 6;
    ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
    for (let y = d / 2; y < h; y += d) {
      for (let x = d / 2 + ((y / d) % 2) * (d / 2); x < w; x += d) {
        ctx.beginPath();
        ctx.arc(x, y, d * 0.17, 0, TAU);
        ctx.fill();
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
  /** Blobs inked as one shape: an ink pass a little larger, then the fill, the light from the top left, the shade. */
  function blobs(ctx, list, fill, light, dark) {
    ctx.fillStyle = INK;
    for (const b of list) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 3.5, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = fill;
    for (const b of list) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = dark;
    for (const b of list) {
      ctx.beginPath();
      ctx.arc(b.x + b.r * 0.22, b.y + b.r * 0.32, b.r * 0.62, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = fill;
    for (const b of list) {
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.08, b.y - b.r * 0.1, b.r * 0.7, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = light;
    for (const b of list) {
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.34, b.r * 0.42, 0, TAU);
      ctx.fill();
    }
  }
  /** A tapered limb: ink, then wood, then a thin light edge. */
  function limb(ctx, x0, y0, x1, y1, w0, w1, wood) {
    const a = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const quad = (k) => {
      ctx.beginPath();
      ctx.moveTo(x0 + c * (w0 / 2 + k), y0 + s * (w0 / 2 + k));
      ctx.lineTo(x1 + c * (w1 / 2 + k), y1 + s * (w1 / 2 + k));
      ctx.lineTo(x1 - c * (w1 / 2 + k), y1 - s * (w1 / 2 + k));
      ctx.lineTo(x0 - c * (w0 / 2 + k), y0 - s * (w0 / 2 + k));
      ctx.closePath();
    };
    ctx.fillStyle = INK;
    quad(2.2);
    ctx.fill();
    ctx.fillStyle = wood;
    quad(0);
    ctx.fill();
  }
  const GREENS = [
    ["#3e5a2c", "#5b7d3c", "#2b4020"],
    ["#4a5f2e", "#6c8240", "#33441f"],
    ["#38563a", "#557a52", "#253d27"],
    ["#59592e", "#7b7b40", "#3d3e20"],
  ];

  /** Things filed in buckets B world units square, each by the box it reaches (add), or only where `near` says a
      bucket (its middle, its half-diagonal) is close enough; find(box, fn) calls fn once for each thing filed in any
      bucket the box touches. `filed` counts the entries made, `looked` the things handed to fn. */
  function buckets(B) {
    const m = new Map();
    const all = [];
    let seen = new Uint32Array(256);
    let stamp = 0;
    const R = B * 0.7072;
    return {
      B,
      filed: 0,
      looked: 0,
      get size() {
        return all.length;
      },
      add(o, x0, y0, x1, y1, near) {
        const id = all.length;
        all.push(o);
        if (id >= seen.length) {
          const s = new Uint32Array(seen.length * 2);
          s.set(seen);
          seen = s;
        }
        const bx1 = Math.floor(x1 / B);
        const by1 = Math.floor(y1 / B);
        for (let bx = Math.floor(x0 / B); bx <= bx1; bx++) {
          for (let by = Math.floor(y0 / B); by <= by1; by++) {
            if (near && !near((bx + 0.5) * B, (by + 0.5) * B, R)) continue;
            const key = keyOf(bx, by);
            let l = m.get(key);
            if (!l) m.set(key, (l = []));
            l.push(id);
            this.filed++;
          }
        }
      },
      /** fn for each thing filed in bucket (bx, by) itself (a thing filed in several buckets comes once from each). */
      each(bx, by, fn) {
        const l = m.get(keyOf(bx, by));
        if (!l) return;
        this.looked += l.length;
        for (const i of l) fn(all[i]);
      },
      find(x0, y0, x1, y1, fn) {
        stamp = (stamp + 1) >>> 0 || 1;
        const bx1 = Math.floor(x1 / B);
        const by1 = Math.floor(y1 / B);
        for (let bx = Math.floor(x0 / B); bx <= bx1; bx++) {
          for (let by = Math.floor(y0 / B); by <= by1; by++) {
            const l = m.get(keyOf(bx, by));
            if (!l) continue;
            for (const i of l) {
              if (seen[i] === stamp) continue;
              seen[i] = stamp;
              this.looked++;
              fn(all[i]);
            }
          }
        }
      },
    };
  }

  /** The plants standing over one drive's land (its roads, side streets, corners and lots), in squares `cell` world
      units across, each made the first time it is asked for (get) and let go once unused for a while (sweep). A
      square's plants come from the VEG_STEP grid's spots inside it, each seeded by its own spot, so the same spot always
      grows the same plant and a square made again is the same; the land is a thicket at the verges, thinner further
      back, never bare; nothing on a road, a lot, a corner's square or in the river. Counts in `stats` (squares made,
      plants made, spots tried, the roads and such each square looked at), for tests: none of it grows with the city. */
  function Layout(drive, cell) {
    const St = ZSR.Streets;
    const G = St.GEOM;
    const Dr = ZSR.Draw;
    this.drive = drive;
    this.cell = cell;
    this.cells = new Map();
    this.stats = { made: 0, items: 0, tries: 0, near: 0, dropped: 0 };
    const half = cell * 0.7072;
    // how far from a square's middle a road, a side street, a corner or a lot can change a plant in it
    const reach = { road: VEG_REACH + G.half + half + 1, side: VEG_REACH + G.sideHalf + half + 1, node: VEG_REACH + G.boxR + half + 1 };
    const lotA = G.lotHalf + 40;
    const lotV = G.half + G.shoulder + G.lotGap + G.lotDepth + 50;
    reach.lot = Math.hypot(lotA, lotV) + half + 1;
    this.reach = reach;
    const idx = (this.index = buckets(VEG_BUCKET));
    const seg = (type, s, R) => {
      const o = { type, s };
      idx.add(o, Math.min(s.x0, s.x1) - R, Math.min(s.y0, s.y1) - R, Math.max(s.x0, s.x1) + R, Math.max(s.y0, s.y1) + R, (x, y, r) => distSeg(x, y, s.x0, s.y0, s.x1, s.y1) < R + r);
    };
    for (const s of drive.roads) seg("road", s, reach.road);
    for (const s of drive.sides) seg("side", s, reach.side);
    for (const n of drive.nodes) idx.add({ type: "node", s: n }, n.x - reach.node, n.y - reach.node, n.x + reach.node, n.y + reach.node);
    for (const l of drive.lots) idx.add({ type: "lot", s: l }, l.qx - reach.lot, l.qy - reach.lot, l.qx + reach.lot, l.qy + reach.lot);
    this.wetAt = (x, y, m) => !!(Dr && Dr.inRiver && Dr.inRiver(x, y, m, drive.scale));
    this.dryFar = (x, y, r) => !(Dr && Dr.riverEdge) || Dr.riverEdge(x, y, drive.scale) > r;
    this.G = G;
    this.lotA = lotA;
    this.lotV = lotV;
  }
  Layout.prototype = {
    /** The plants of square (cx, cy), made now if not kept; `stamp` marks it in use (sweep lets go of the others). */
    get(cx, cy, stamp) {
      const key = keyOf(cx, cy);
      let c = this.cells.get(key);
      if (!c) {
        c = { plants: this.make(cx, cy), used: stamp };
        this.cells.set(key, c);
      }
      c.used = stamp;
      return c.plants;
    },
    /** Let go of every square not used since `before` (the view has left it: far behind the van, or off to a side). */
    sweep(before) {
      for (const [key, c] of this.cells) {
        if (c.used < before) {
          this.cells.delete(key);
          this.stats.dropped++;
        }
      }
    },
    make(cx, cy) {
      const G = this.G;
      const C = this.cell;
      const S = VEG_STEP;
      const x0 = cx * C;
      const y0 = cy * C;
      const x1 = x0 + C;
      const y1 = y0 + C;
      const mx = x0 + C / 2;
      const my = y0 + C / 2;
      // what is near enough to matter here (VEG_REACH): a road further off changes no plant in this square
      const roads = [];
      const sides = [];
      const nodes = [];
      const lots = [];
      const R = this.reach;
      this.index.find(mx, my, mx, my, (o) => {
        const s = o.s;
        if (o.type === "road") {
          if (distSeg(mx, my, s.x0, s.y0, s.x1, s.y1) < R.road) roads.push(s);
        } else if (o.type === "side") {
          if (distSeg(mx, my, s.x0, s.y0, s.x1, s.y1) < R.side) sides.push(s);
        } else if (o.type === "node") {
          if (Math.hypot(s.x - mx, s.y - my) < R.node) nodes.push(s);
        } else if (Math.hypot(s.qx - mx, s.qy - my) < R.lot) lots.push(s);
      });
      this.stats.near += roads.length + sides.length + nodes.length + lots.length;
      // how far in from the nearest asphalt's edge (Infinity: further than VEG_REACH), and whether on a lot
      const edge = (x, y) => {
        let e = Infinity;
        for (const s of roads) e = Math.min(e, distSeg(x, y, s.x0, s.y0, s.x1, s.y1) - G.half);
        for (const s of sides) e = Math.min(e, distSeg(x, y, s.x0, s.y0, s.x1, s.y1) - G.sideHalf);
        for (const n of nodes) e = Math.min(e, Math.hypot(n.x - x, n.y - y) - G.boxR);
        return e;
      };
      const onLot = (x, y) =>
        lots.some((l) => {
          const dx = x - l.qx;
          const dy = y - l.qy;
          const a = dx * l.ux + dy * l.uy;
          const v = (dx * -l.uy + dy * l.ux) * l.side;
          return Math.abs(a) < this.lotA && v > -20 && v < this.lotV;
        });
      // near the river every spot is checked against it (RIVER_CLEAR), else none
      const wet = !this.dryFar(mx, my, C * 0.7072 + VEG_STEP + RIVER_CLEAR);
      const out = [];
      for (let i = Math.floor(x0 / S); i * S < x1; i++) {
        for (let j = Math.floor(y0 / S); j * S < y1; j++) {
          const r = seeded(mix(hash2(i, j) + 991));
          const x = (i + r()) * S;
          const y = (j + r()) * S;
          // a spot of a grid cell that straddles the square's edge belongs to the square it falls in
          if (x < x0 || x >= x1 || y < y0 || y >= y1) continue;
          this.stats.tries++;
          const roll = r();
          const rv = r();
          const e = edge(x, y);
          if (e < G.shoulder - 4 || onLot(x, y)) continue;
          if (wet && this.wetAt(x, y, RIVER_CLEAR)) continue;
          // the verge is a thicket; further back it thins, but never to bare
          const verge = e < G.shoulder + 140;
          if (rv > (verge ? 0.95 : e < VEG_REACH ? 0.7 : 0.5)) continue;
          let kind;
          if (verge) kind = roll < 0.5 ? "grass" : roll < 0.88 ? "bush" : "tree";
          else kind = roll < 0.22 ? "grass" : roll < 0.48 ? "bush" : "tree";
          if (kind === "tree" && e < G.shoulder + 50) kind = "bush";
          if (kind === "tree" && r() < 0.22) kind = "dead";
          const h = kind === "tree" ? 150 + r() * 90 : kind === "dead" ? 130 + r() * 70 : kind === "bush" ? 40 + r() * 34 : 24 + r() * 22;
          // q: the plant's own share in 0..1, for thinning the far ones by a stable hash (js/perspective.js governor)
          out.push({ kind, x, y, h, v: Math.floor(r() * 4), flip: r() < 0.5, q: r() });
          // a second clump of grass in the verge
          if (verge && r() < 0.5) {
            const g = { kind: "grass", x: x + (r() - 0.5) * S * 0.6, y: y + (r() - 0.5) * S * 0.6, h: 22 + r() * 20, v: Math.floor(r() * 4), flip: r() < 0.5, q: r() };
            if (!wet || !this.wetAt(g.x, g.y, RIVER_CLEAR)) out.push(g);
          }
        }
      }
      this.stats.made++;
      this.stats.items += out.length;
      return out;
    },
  };

  const Art = {
    /** A standing thing's picture, by kind and variant; { img, aspect } (width over height). */
    sprite(kind, v) {
      const img = (DRAW[kind] || DRAW.bush)(v | 0);
      return img;
    },
    /** The board of a road sign: its words big enough to read down the road. */
    signBoard(text, color) {
      return canvas("sign:" + text + ":" + color, 224, 120, (ctx, w, h) => {
        ctx.fillStyle = INK;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.fillRect(6, 6, w - 12, h - 12);
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 3;
        ctx.strokeRect(14, 14, w - 28, h - 28);
        const dark = color === "#b3261e";
        ctx.fillStyle = dark ? "#f3eee0" : INK;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fs = 54;
        do ctx.font = "700 " + fs-- + "px Oswald, Impact, sans-serif";
        while (ctx.measureText(text).width > w - 40 && fs > 20);
        ctx.fillText(text, w / 2, h / 2 + 2);
        // weather: rust at the edges, a few dents
        ctx.fillStyle = "rgba(110,60,30,0.35)";
        const r = seeded(text.length * 131 + color.length);
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.ellipse(r() < 0.5 ? 10 + r() * 20 : w - 10 - r() * 20, 10 + r() * (h - 20), 4 + r() * 8, 3 + r() * 5, r() * 3, 0, TAU);
          ctx.fill();
        }
        halftone(ctx, w, h, 0.08, 7);
      });
    },
    signBack() {
      return canvas("sign:back", 112, 60, (ctx, w, h) => {
        ctx.fillStyle = INK;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#7d7a74";
        ctx.fillRect(4, 4, w - 8, h - 8);
        ctx.fillStyle = "#4b4a46";
        ctx.fillRect(w / 2 - 4, 4, 8, h - 8);
        halftone(ctx, w, h, 0.1, 6);
      });
    },
    /** A concrete barrier's long face: grey with the yellow hazard stripes. */
    barrier() {
      return canvas("barrier", 140, 60, (ctx, w, h) => {
        ctx.fillStyle = INK;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#8d8a84";
        ctx.fillRect(3, 3, w - 6, h - 6);
        ctx.save();
        ctx.beginPath();
        ctx.rect(3, 12, w - 6, h - 26);
        ctx.clip();
        ctx.fillStyle = "#d9a21b";
        for (let x = -h; x < w + h; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 12);
          ctx.lineTo(x + 15, 12);
          ctx.lineTo(x + 15 - (h - 26), h - 14);
          ctx.lineTo(x - (h - 26), h - 14);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(3, h - 12, w - 6, 9);
        halftone(ctx, w, h, 0.08, 6);
      });
    },

    /** Overgrowth on the ground: grass and weeds everywhere, creeping over the road's edges, a few cracks with
        weeds in them across the asphalt (kept sparse so lanes and arrows still read). Seeded by 64-unit cells.
        Drawn small (view.px under 1 px a unit), only the patches: the weeds would not show. */
    cover(ctx, view, drive, G) {
      const C = 64;
      const R = view.half || view.r * 1.05;
      const fine = !view.px || view.px >= 0.9;
      const mid = !view.px || view.px >= 0.4;
      const roads = drive.roads.filter((s) => distSeg(view.x, view.y, s.x0, s.y0, s.x1, s.y1) < R + G.half + 100);
      const sides = drive.sides.filter((s) => distSeg(view.x, view.y, s.x0, s.y0, s.x1, s.y1) < R + G.sideHalf + 100);
      const x0 = Math.floor((view.x - R) / C);
      const x1 = Math.floor((view.x + R) / C);
      const y0 = Math.floor((view.y - R) / C);
      const y1 = Math.floor((view.y + R) / C);
      // none on the river: near it, a cell whose marks could reach the water (COVER_CLEAR off its bank) is left bare
      const Dr = ZSR.Draw;
      const wet = !!(Dr && Dr.riverEdge) && Dr.riverEdge(view.x, view.y, drive.scale) < R * 1.42 + C + COVER_CLEAR;
      ctx.lineCap = "round";
      for (let cx = x0; cx <= x1; cx++) {
        for (let cy = y0; cy <= y1; cy++) {
          if (wet && Dr.inRiver(cx * C + C / 2, cy * C + C / 2, COVER_CLEAR, drive.scale)) continue;
          const r = seeded(hash2(cx, cy) + 17);
          const px = cx * C + r() * C;
          const py = cy * C + r() * C;
          // how far in from the asphalt's edge (negative: on it)
          let edge = Infinity;
          for (const s of roads) edge = Math.min(edge, distSeg(px, py, s.x0, s.y0, s.x1, s.y1) - G.half);
          for (const s of sides) edge = Math.min(edge, distSeg(px, py, s.x0, s.y0, s.x1, s.y1) - G.sideHalf);
          if (edge < -30) {
            if (r() < 0.22 && fine) crack(ctx, r, px, py);
            continue;
          }
          if (edge < G.shoulder + 50) {
            // the verge creeping onto the road
            patch(ctx, r, px, py, 22 + r() * 26, "rgba(66,92,44,0.42)");
            if (fine) for (let i = 0, n = 3 + Math.floor(r() * 4); i < n; i++) tuft(ctx, r, px + (r() - 0.5) * 40, py + (r() - 0.5) * 40, 6 + r() * 6);
            continue;
          }
          patch(ctx, r, px, py, 26 + r() * 40, r() < 0.5 ? "rgba(52,78,36,0.32)" : "rgba(92,104,52,0.28)");
          if (fine) for (let i = 0, n = 4 + Math.floor(r() * 5); i < n; i++) tuft(ctx, r, cx * C + r() * C, cy * C + r() * C, 7 + r() * 9);
          if (mid && r() < 0.25) clump(ctx, r, cx * C + r() * C, cy * C + r() * C);
        }
      }
    },

    /** The bushes, tall grass and trees standing all over a drive's land, made a square (`cell` world units) at a
        time as the view first reaches it (Layout above): its first view costs a few dozen squares, a drive's whole
        length a few thousand, however big the city. Seeded by place, so a spot looks the same on every drive at that
        drive's scale (a drive at another scale stretches the city under the same grid of spots). */
    vegLayout(drive, cell) {
      return new Layout(drive, cell);
    },
    buckets,
  };

  // ---------- the pictures (feet at the bottom middle) ----------
  const DRAW = {
    tree(v) {
      return sprite("tree", v, 220, 300, (ctx, w, h, r) => {
        const [fill, light, dark] = GREENS[v % 4];
        const bx = w / 2;
        const tx = bx + (r() - 0.5) * 16;
        limb(ctx, bx, h - 4, tx, h * 0.42, 22, 11, "#4a3a2c");
        limb(ctx, tx, h * 0.5, tx - 38, h * 0.36, 9, 4, "#4a3a2c");
        limb(ctx, tx, h * 0.56, tx + 40, h * 0.4, 9, 4, "#4a3a2c");
        const list = [];
        const cy = h * 0.34;
        for (let i = 0; i < 16; i++) {
          const a = r() * TAU;
          const d = Math.sqrt(r()) * 62;
          list.push({ x: bx + Math.cos(a) * d * 1.15, y: cy + Math.sin(a) * d * 0.72, r: 20 + r() * 20 });
        }
        list.sort((a, b) => a.y - b.y);
        blobs(ctx, list, fill, light, dark);
        // vines and moss hanging off it
        ctx.strokeStyle = dark;
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const x = bx - 60 + r() * 120;
          const y = cy + 20 + r() * 30;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + (r() - 0.5) * 12, y + 25, x + (r() - 0.5) * 8, y + 40 + r() * 30);
          ctx.stroke();
        }
      });
    },
    dead(v) {
      return sprite("dead", v, 200, 280, (ctx, w, h, r) => {
        const wood = ["#4a3a2c", "#55473a", "#3e3226", "#5a4a38"][v % 4];
        const branch = (x, y, a, len, wd, depth) => {
          const x1 = x + Math.cos(a) * len;
          const y1 = y + Math.sin(a) * len;
          limb(ctx, x, y, x1, y1, wd, wd * 0.6, wood);
          if (depth <= 0) return;
          const n = 2 + (r() < 0.4 ? 1 : 0);
          for (let i = 0; i < n; i++) branch(x1, y1, a + (r() - 0.5) * 1.3, len * (0.55 + r() * 0.25), wd * 0.6, depth - 1);
        };
        branch(w / 2, h - 4, -Math.PI / 2 + (r() - 0.5) * 0.2, h * 0.38, 18, 3);
      });
    },
    bush(v) {
      return sprite("bush", v, 180, 120, (ctx, w, h, r) => {
        const [fill, light, dark] = GREENS[(v + 1) % 4];
        const list = [];
        for (let i = 0; i < 10; i++) {
          const x = 30 + r() * (w - 60);
          const t = 1 - Math.abs(x - w / 2) / (w / 2);
          list.push({ x, y: h - 22 - t * (20 + r() * 26), r: 14 + t * 16 + r() * 8 });
        }
        list.sort((a, b) => a.y - b.y);
        blobs(ctx, list, fill, light, dark);
      });
    },
    grass(v) {
      return sprite("grass", v, 110, 90, (ctx, w, h, r) => {
        const cols = ["#6b7a3a", "#7d8a44", "#9a9450", "#56662f"];
        for (let i = 0; i < 22; i++) {
          const x = w / 2 + (r() - 0.5) * 60;
          const tall = 30 + r() * (h - 36);
          const lean = (r() - 0.5) * 40;
          const blade = () => {
            ctx.beginPath();
            ctx.moveTo(x, h - 2);
            ctx.quadraticCurveTo(x + lean * 0.3, h - tall * 0.6, x + lean, h - tall);
          };
          ctx.strokeStyle = INK;
          ctx.lineWidth = 4.2;
          blade();
          ctx.stroke();
          ctx.strokeStyle = cols[(i + v) % 4];
          ctx.lineWidth = 2.2;
          blade();
          ctx.stroke();
        }
      });
    },
    barrel(v) {
      return sprite("barrel", v, 72, 92, (ctx, w, h) => {
        const body = ["#7a4a2a", "#5f6b3c", "#4d4f55"][v % 3];
        ctx.fillStyle = INK;
        ctx.fillRect(6, 10, w - 12, h - 14);
        ctx.beginPath();
        ctx.ellipse(w / 2, h - 6, w / 2 - 6, 8, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = body;
        ctx.fillRect(9.5, 12, w - 19, h - 18);
        ctx.fillStyle = shade(body, -28);
        ctx.fillRect(w - 26, 12, 16, h - 18);
        ctx.fillStyle = shade(body, 22);
        ctx.fillRect(14, 12, 8, h - 18);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        for (const y of [30, h - 32]) ctx.fillRect(9.5, y, w - 19, 5);
        ctx.fillStyle = "rgba(120,62,28,0.45)";
        ctx.fillRect(30, 40, 6, 30);
        // the lid
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(w / 2, 12, w / 2 - 4, 10, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = shade(body, 30);
        ctx.beginPath();
        ctx.ellipse(w / 2, 12, w / 2 - 8, 7, 0, 0, TAU);
        ctx.fill();
        halftone(ctx, w, h, 0.07, 6);
      });
    },
  };
  function sprite(kind, v, w, h, draw) {
    const img = canvas(kind + ":" + v, w, h, (ctx) => draw(ctx, w, h, seeded(hash2(kind.length * 977 + v, v * 31 + 7))));
    return { img, aspect: w / h };
  }

  // ---------- overgrowth marks on the ground (top-down) ----------
  function patch(ctx, r, x, y, rad, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rad, rad * (0.5 + r() * 0.4), r() * 3, 0, TAU);
    ctx.fill();
  }
  function tuft(ctx, r, x, y, s) {
    ctx.strokeStyle = r() < 0.5 ? "rgba(44,62,28,0.6)" : "rgba(98,112,52,0.65)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = r() * TAU;
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s);
    }
    ctx.stroke();
  }
  function clump(ctx, r, x, y) {
    const rad = 10 + r() * 12;
    ctx.fillStyle = "rgba(15,16,18,0.55)";
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, rad + 2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = r() < 0.5 ? "#3e5a2c" : "#4f6232";
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.arc(x - rad * 0.3, y - rad * 0.3, rad * 0.5, 0, TAU);
    ctx.fill();
  }
  function crack(ctx, r, x, y) {
    let a = r() * TAU;
    let px = x;
    let py = y;
    ctx.strokeStyle = "rgba(15,16,18,0.45)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let i = 0; i < 4; i++) {
      a += (r() - 0.5) * 1.2;
      px += Math.cos(a) * (10 + r() * 14);
      py += Math.sin(a) * (10 + r() * 14);
      ctx.lineTo(px, py);
    }
    ctx.stroke();
    tuft(ctx, r, px, py, 6 + r() * 4);
    if (r() < 0.5) tuft(ctx, r, x, y, 5 + r() * 3);
  }

  ZSR.PerspArt = Art;
})(typeof window !== "undefined" ? window : globalThis);
