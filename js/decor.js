/* Wall decor for the first-person interiors: one 64 x 64 wall face for every key in
   ZSR.LAYOUT_DECOR (signs, posters, boards, lockers, pipes ...). Each face starts as the
   building's own wall (Draw3.wallBase), so a sign on a brick wall sits on brick, then the
   decor goes on top in the comic style: flat fills, ink outlines, a little halftone.
   Sign texts (12 characters at most) are fitted as big as their plate allows, on one line
   or two. Every face is fully opaque (the engine never draws behind a full wall).

   building.js applies them from each layout's `decor` list with Decor.optsFor(entry): the
   entry's `text`, plus a variant `v` for the kinds in VARIANTS, so a row of lockers or
   bookcases does not repeat tile for tile. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const D3 = ZSR.Draw3;
  if (!D3 || !D3.registerTexture) return;
  const INK = "#0f1012";
  const TAU = Math.PI * 2;
  const HEAD = "Oswald, Impact, 'Arial Narrow', sans-serif";
  const COMIC = "Bangers, Impact, sans-serif";
  const C = { cream: "#f3eee0", paper: "#e6dfcc", amber: "#d9a21b", gold: "#f0c247", red: "#b3261e", olive: "#7a9a3c", steel: "#4b5057", blue: "#2f5f9e", teal: "#2f8fa8", purple: "#6b4fa0", wood: "#6b4a3a", tan: "#8a6a46", chrome: "#9ea3aa" };
  const shade = D3.shade;
  const mix = D3.mix;
  const rng = D3.rng;

  /** Kinds drawn in a few variants (picked per tile by Decor.optsFor), with how many. */
  const VARIANTS = { lockers: 3, bookWall: 3, crack: 3, poster: 3, pegboard: 3, coolerDoors: 2, toolWall: 3, vent: 2, pipes: 2, clock: 2, calendar: 2, tally: 2, boarded: 2, trellis: 2, seedRack: 2, panel: 2, tvScreen: 2, graffiti: 2, noticeBoard: 2, trophyCase: 2 };
  const SKIP = { x: 1, y: 1, tex: 1, face: 1 };

  /* ---------- Small drawing helpers (all in the 64 x 64 face) ---------- */
  function strHash(s) {
    let h = 2166136261;
    const str = String(s == null ? "" : s);
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  const pick = (list, n) => list[(n >>> 0) % list.length];
  function stroke(ctx, lw, color) {
    ctx.strokeStyle = color || INK;
    ctx.lineWidth = lw || 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }
  function box(ctx, x, y, w, h, fill, lw) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw || 2.5;
    ctx.lineJoin = "miter";
    ctx.strokeRect(x, y, w, h);
  }
  /** The comic drop shadow: a hard offset block under a plate. */
  function drop(ctx, x, y, w, h, off) {
    ctx.fillStyle = "rgba(15,16,18,0.42)";
    ctx.fillRect(x + (off || 3), y + (off || 3), w, h);
  }
  function disc(ctx, x, y, r, fill, lw) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = fill;
    ctx.fill();
    if (lw) stroke(ctx, lw);
  }
  function poly(ctx, pts, fill, lw) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (lw) stroke(ctx, lw);
  }
  function seg(ctx, x0, y0, x1, y1, color, lw) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    stroke(ctx, lw, color);
  }
  function screw(ctx, x, y) {
    disc(ctx, x, y, 1.7, "#c3c7cb", 1);
  }
  function tape(ctx, x, y, a) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a || 0);
    ctx.fillStyle = "rgba(226,214,170,0.9)";
    ctx.fillRect(-5, -2.5, 10, 5);
    ctx.restore();
  }
  /** Ink color that reads on a background: dark on light, cream on dark. */
  function onColor(bg) {
    const n = parseInt(bg.slice(1), 16);
    const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    return lum > 150 ? INK : C.cream;
  }

  /** Print text as big as it fits a maxW x maxH box centered on (cx, cy): on one line, or two
      split at the space that balances them best. Capitals are centered on their real ink, not
      on the em box. o: { font, weight, color, stroke, strokeW, max }. Returns { size, w, h }. */
  function fit(ctx, text, cx, cy, maxW, maxH, o) {
    o = o || {};
    const str = String(text == null ? "" : text).trim();
    if (!str) return { size: 0, w: 0, h: 0 };
    const weight = o.weight || "700";
    const fam = o.font || HEAD;
    const sw = o.stroke ? o.strokeW || 3 : 0;
    const bw = Math.max(4, maxW - sw);
    const bh = Math.max(4, maxH - sw);
    const sets = [[str]];
    for (let i = 1; i < str.length - 1; i++) if (str[i] === " ") sets.push([str.slice(0, i).trim(), str.slice(i + 1).trim()]);
    const GAP = 0.24;
    ctx.font = weight + " 20px " + fam;
    let best = null;
    sets.forEach((lines) => {
      let wide = 0;
      let tall = 0;
      lines.forEach((l) => {
        const m = ctx.measureText(l);
        wide = Math.max(wide, m.width);
        const asc = m.actualBoundingBoxAscent;
        tall = Math.max(tall, asc > 0 ? asc + Math.max(0, m.actualBoundingBoxDescent || 0) : 15);
      });
      const n = lines.length;
      const size = Math.min(o.max || 34, (bw * 20) / Math.max(1, wide), bh / ((n * tall) / 20 + (n - 1) * GAP));
      // two lines have to win clearly: one line reads better
      if (!best || size > best.size * 1.06) best = { lines, size, tall: tall / 20, wide: wide / 20 };
    });
    const size = Math.max(4, Math.floor(best.size * 4) / 4);
    ctx.font = weight + " " + size + "px " + fam;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const lineH = best.tall * size;
    const n = best.lines.length;
    const total = n * lineH + (n - 1) * GAP * size;
    best.lines.forEach((l, i) => {
      const m = ctx.measureText(l);
      const asc = m.actualBoundingBoxAscent > 0 ? m.actualBoundingBoxAscent : lineH;
      const desc = m.actualBoundingBoxDescent > 0 ? m.actualBoundingBoxDescent : 0;
      const mid = cy - total / 2 + i * (lineH + GAP * size) + lineH / 2;
      const base = mid + (asc - desc) / 2;
      if (o.stroke) {
        ctx.strokeStyle = o.stroke;
        ctx.lineWidth = sw;
        ctx.lineJoin = "round";
        ctx.strokeText(l, cx, base);
      }
      ctx.fillStyle = o.color || INK;
      ctx.fillText(l, cx, base);
    });
    return { size, w: best.wide * size, h: total };
  }

  /* ---------- Poster pictures: a small flat picture in a 20 x 20 box, centered ---------- */
  const ICONS = {
    star(ctx) {
      const pts = [];
      for (let i = 0; i < 10; i++) pts.push([Math.cos(-Math.PI / 2 + (i * Math.PI) / 5) * (i % 2 ? 4.2 : 10), Math.sin(-Math.PI / 2 + (i * Math.PI) / 5) * (i % 2 ? 4.2 : 10)]);
      return pts;
    },
    burst(ctx) {
      const pts = [];
      for (let i = 0; i < 24; i++) pts.push([Math.cos((i * Math.PI) / 12) * (i % 2 ? 7 : 10.5), Math.sin((i * Math.PI) / 12) * (i % 2 ? 7 : 10.5)]);
      return pts;
    },
    heart(ctx) {
      ctx.moveTo(0, 9);
      ctx.bezierCurveTo(-12, 0, -9, -11, 0, -4);
      ctx.bezierCurveTo(9, -11, 12, 0, 0, 9);
    },
    sun(ctx, lw) {
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        seg(ctx, Math.cos(a) * 6.5, Math.sin(a) * 6.5, Math.cos(a) * 10, Math.sin(a) * 10, INK, lw * 1.4);
      }
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, TAU);
    },
    drop(ctx) {
      ctx.moveTo(0, -10);
      ctx.quadraticCurveTo(8, -1, 7, 4);
      ctx.arc(0, 4, 7, 0, Math.PI);
      ctx.quadraticCurveTo(-8, -1, 0, -10);
    },
    bolt() {
      return [[3, -10], [-6, 1], [-0.5, 1], [-3, 10], [7, -2.5], [1.5, -2.5], [4, -10]];
    },
    leaf(ctx, lw) {
      ctx.ellipse(0, 0, 5.5, 10, 0.5, 0, TAU);
      return () => seg(ctx, -4.5, 8, 4.5, -8, INK, lw);
    },
    book(ctx, lw) {
      poly(ctx, [[-10, -6], [0, -4], [0, 8], [-10, 6]], C.cream, lw);
      poly(ctx, [[10, -6], [0, -4], [0, 8], [10, 6]], C.cream, lw);
      ctx.beginPath();
      ctx.rect(-10, 6, 20, 2.5);
      return () => {
        seg(ctx, -8, -2, -2, -1, INK, lw * 0.6);
        seg(ctx, 2, -1, 8, -2, INK, lw * 0.6);
        seg(ctx, -8, 2, -2, 3, INK, lw * 0.6);
        seg(ctx, 2, 3, 8, 2, INK, lw * 0.6);
      };
    },
    face(ctx, lw) {
      ctx.arc(0, 10, 9, Math.PI, 0);
      ctx.closePath();
      return (fill) => disc(ctx, 0, -3.5, 5.2, fill, lw);
    },
    flame(ctx) {
      ctx.moveTo(0, -10);
      ctx.bezierCurveTo(9, -2, 9, 7, 0, 10);
      ctx.bezierCurveTo(-9, 7, -8, -1, -3, -4);
      ctx.quadraticCurveTo(-1, -7, 0, -10);
      return () => {
        ctx.beginPath();
        ctx.moveTo(0, -1);
        ctx.bezierCurveTo(4, 3, 4, 8, 0, 9);
        ctx.bezierCurveTo(-4, 8, -4, 3, 0, -1);
        ctx.fillStyle = C.gold;
        ctx.fill();
      };
    },
    note(ctx, lw) {
      ctx.ellipse(-3, 6, 4.5, 3.4, -0.4, 0, TAU);
      return () => {
        ctx.beginPath();
        ctx.moveTo(1.2, 5.5);
        ctx.lineTo(1.2, -10);
        ctx.quadraticCurveTo(7, -7, 7, -1);
        stroke(ctx, lw * 1.3);
      };
    },
    cup(ctx, lw) {
      ctx.rect(-8, -3, 12, 12);
      return (fill) => {
        ctx.beginPath();
        ctx.arc(5, 3, 3.5, -Math.PI / 2, Math.PI / 2);
        stroke(ctx, lw * 1.2);
        [-5, -1].forEach((x) => {
          ctx.beginPath();
          ctx.moveTo(x, -6);
          ctx.quadraticCurveTo(x + 2.5, -8, x, -10);
          stroke(ctx, lw * 0.8);
        });
      };
    },
    wheel(ctx, lw) {
      ctx.arc(0, 0, 9.5, 0, TAU);
      return () => {
        disc(ctx, 0, 0, 4.5, "#9ea3aa", lw);
        for (let i = 0; i < 5; i++) disc(ctx, Math.cos((i * TAU) / 5) * 2.4, Math.sin((i * TAU) / 5) * 2.4, 0.7, INK, 0);
      };
    },
    tooth(ctx) {
      ctx.moveTo(-8, -6);
      ctx.bezierCurveTo(-8, -11, -2, -10, 0, -8);
      ctx.bezierCurveTo(2, -10, 8, -11, 8, -6);
      ctx.bezierCurveTo(8, 0, 6, 2, 5, 9);
      ctx.quadraticCurveTo(3, 10, 2, 4);
      ctx.quadraticCurveTo(0, 1, -2, 4);
      ctx.quadraticCurveTo(-3, 10, -5, 9);
      ctx.bezierCurveTo(-6, 2, -8, 0, -8, -6);
    },
    paw(ctx, lw) {
      ctx.ellipse(0, 4, 6.5, 5.5, 0, 0, TAU);
      return (fill) => [[-7, -3], [-2.5, -8], [2.5, -8], [7, -3]].forEach(([x, y]) => disc(ctx, x, y, 2.6, fill, lw));
    },
    bee(ctx, lw) {
      ctx.ellipse(0, 2, 8, 5.5, 0, 0, TAU);
      return () => {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 2, 8, 5.5, 0, 0, TAU);
        ctx.clip();
        ctx.fillStyle = INK;
        ctx.fillRect(-3.5, -4, 2.5, 12);
        ctx.fillRect(1.5, -4, 2.5, 12);
        ctx.restore();
        ctx.beginPath();
        ctx.ellipse(-3, -5, 3, 4.5, -0.5, 0, TAU);
        ctx.ellipse(3, -5, 3, 4.5, 0.5, 0, TAU);
        ctx.fillStyle = "#eaf4f8";
        ctx.fill();
        stroke(ctx, lw);
      };
    },
    phone(ctx, lw) {
      ctx.rect(-5.5, -10, 11, 20);
      return () => {
        ctx.fillStyle = "#9fc4cc";
        ctx.fillRect(-3.5, -7, 7, 12);
        disc(ctx, 0, 7.5, 1.2, C.cream, 0);
      };
    },
    camera(ctx, lw) {
      ctx.rect(-10, -5, 20, 13);
      return () => {
        poly(ctx, [[-4, -5], [-2, -8.5], [3, -8.5], [5, -5]], "#2b2d31", lw);
        disc(ctx, 0, 1.5, 4.5, "#2b3540", lw);
        disc(ctx, -1.2, 0.3, 1.2, "#9fc4cc", 0);
      };
    },
    cross() {
      return [[-3, -10], [3, -10], [3, -3], [10, -3], [10, 3], [3, 3], [3, 10], [-3, 10], [-3, 3], [-10, 3], [-10, -3], [-3, -3]];
    },
    shield(ctx, lw) {
      ctx.moveTo(0, -10);
      ctx.lineTo(9, -6);
      ctx.quadraticCurveTo(9, 6, 0, 10);
      ctx.quadraticCurveTo(-9, 6, -9, -6);
      ctx.closePath();
      return () => poly(ctx, ICONS.star().map(([x, y]) => [x * 0.45, y * 0.45]), C.cream, lw * 0.7);
    },
  };
  const ICON_COLOR = { star: C.gold, burst: C.red, heart: C.red, sun: C.gold, drop: "#5aa0d8", bolt: C.gold, leaf: C.olive, book: C.blue, face: "#6e7278", flame: "#e0592a", note: C.purple, cup: C.cream, wheel: "#2b2d31", tooth: "#fbfaf4", paw: C.tan, bee: C.gold, phone: "#2b2d31", camera: "#6e7278", cross: C.red, shield: C.blue };
  const ICON_WORDS = [
    [/SALE|2 FOR 1|LOTTO|DEAL/, "burst"], [/COFFEE|CAFE|MENU/, "cup"], [/TIRE|OIL|PARTS|CAR\b/, "wheel"], [/FIRE|HOT/, "flame"],
    [/DOG/, "paw"], [/BEE|HONEY/, "bee"], [/PLANT|GROWN|MULCH|GARDEN|SEED/, "leaf"], [/PHOTO/, "camera"],
    [/PHONE|CALL|911/, "phone"], [/READ|STORY|BOOK|QUIET|COMPUTER/, "book"], [/BAND|CONCERT|MUSIC|HEADPHONE/, "note"],
    [/SMILE|WIDE|TOOTH/, "tooth"], [/FLU|WELL|WASH|VISIT|AID/, "cross"], [/SAFE|REPORT|PROTECT|DRILL|GATE/, "shield"],
    [/MISSING|KIND|CLUB|LOOK/, "face"], [/LIGHT|CABLE|POWER/, "bolt"], [/ICE|COLD|WATER/, "drop"], [/LOVE|HEART/, "heart"],
  ];
  function iconFor(text, h) {
    const t = String(text || "").toUpperCase();
    const hit = ICON_WORDS.find(([re]) => re.test(t));
    return hit ? hit[1] : pick(["star", "sun", "heart", "bolt"], h);
  }
  /** Draw a poster picture centered on (x, y), r about its radius. */
  function icon(ctx, kind, x, y, r) {
    const draw = ICONS[kind] || ICONS.star;
    const fill = ICON_COLOR[kind] || C.gold;
    const lw = 18 / r; // about 1.8 px of ink once scaled
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(r / 10, r / 10);
    ctx.beginPath();
    const res = draw(ctx, lw);
    if (Array.isArray(res)) poly(ctx, res, fill, lw);
    else {
      ctx.fillStyle = fill;
      ctx.fill();
      stroke(ctx, lw);
      if (typeof res === "function") res(fill);
    }
    ctx.restore();
  }

  /* ---------- Tools and things that hang on walls ---------- */
  function wrench(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    poly(ctx, [[-2, 8], [2, 8], [2.5, 38], [-2.5, 38]], "#b8bcc0", 2);
    disc(ctx, 0, 6, 5, "#b8bcc0", 2);
    ctx.fillStyle = "#a8794a";
    ctx.fillRect(-1.8, 0.5, 3.6, 5);
    disc(ctx, 0, 40, 3.6, "#b8bcc0", 2);
    disc(ctx, 0, 40, 1.4, "#5a3f24", 0);
    ctx.restore();
  }
  function hammer(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    box(ctx, -2, 6, 4, 34, "#c99a5a", 2);
    poly(ctx, [[-8, 0], [7, 0], [8, 3], [7, 7], [-8, 7], [-10, 3.5]], "#7d8288", 2);
    ctx.restore();
  }
  function saw(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    poly(ctx, [[-4, 12], [4, 12], [6, 44], [-6, 44]], "#c3c7cb", 2);
    for (let yy = 16; yy < 44; yy += 4) seg(ctx, 6, yy, 8, yy + 2, INK, 1);
    poly(ctx, [[-6, 0], [6, 0], [7, 13], [-7, 13]], C.red, 2);
    ctx.fillStyle = "#5a3f24";
    ctx.fillRect(-3, 3, 6, 5);
    ctx.restore();
  }
  function screwdriver(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    box(ctx, -1, 16, 2, 22, "#c3c7cb", 1.5);
    poly(ctx, [[-3.5, 0], [3.5, 0], [4, 16], [-4, 16]], C.amber, 2);
    ctx.restore();
  }
  function rake(ctx, x) {
    box(ctx, x - 1.8, 14, 3.6, 48, "#b08850", 2);
    box(ctx, x - 9, 13, 18, 4, "#7d8288", 2);
    for (let i = 0; i < 6; i++) seg(ctx, x - 7.5 + i * 3, 17, x - 7.5 + i * 3, 22, INK, 1.6);
  }
  function shovel(ctx, x) {
    ctx.beginPath();
    ctx.arc(x, 16, 4, 0, TAU);
    stroke(ctx, 2.4);
    box(ctx, x - 1.8, 19, 3.6, 25, "#b08850", 2);
    poly(ctx, [[x - 7, 44], [x + 7, 44], [x + 7, 54], [x, 62], [x - 7, 54]], "#9ea3aa", 2.2);
  }
  function axe(ctx, x) {
    box(ctx, x - 1.8, 14, 3.6, 46, "#b08850", 2);
    poly(ctx, [[x + 1, 15], [x + 10, 12], [x + 12, 18], [x + 10, 24], [x + 1, 21]], C.red, 2);
    poly(ctx, [[x + 10, 12], [x + 12, 18], [x + 10, 24], [x + 9, 18]], "#d8dce0", 1.4);
    poly(ctx, [[x - 1, 16], [x - 6, 17], [x - 6, 20], [x - 1, 20]], C.red, 2);
  }
  function plank(ctx, cx, cy, len, wid, a, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    ctx.fillStyle = "rgba(15,16,18,0.4)";
    ctx.fillRect(-len / 2 + 2, -wid / 2 + 3, len, wid);
    ctx.fillStyle = color || "#a07850";
    ctx.fillRect(-len / 2, -wid / 2, len, wid);
    ctx.strokeStyle = "rgba(60,35,15,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-len / 2, -wid / 6);
    ctx.lineTo(len / 2, -wid / 6 + 1);
    ctx.moveTo(-len / 2, wid / 5);
    ctx.lineTo(len / 2, wid / 5 - 1);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.strokeRect(-len / 2, -wid / 2, len, wid);
    [-1, 1].forEach((s) => disc(ctx, s * (len / 2 - 8), 0, 1.6, "#3a3d42", 0));
    ctx.restore();
  }
  function cup(ctx, x, base, s) {
    ctx.save();
    ctx.translate(x, base);
    ctx.scale(s, s);
    poly(ctx, [[-4, 0], [4, 0], [3, -2.5], [-3, -2.5]], "#8a6a46", 1.2);
    box(ctx, -1, -6, 2, 3.5, C.amber, 1);
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.lineTo(6, -14);
    ctx.quadraticCurveTo(6, -6, 0, -6);
    ctx.quadraticCurveTo(-6, -6, -6, -14);
    ctx.closePath();
    ctx.fillStyle = C.amber;
    ctx.fill();
    stroke(ctx, 1.2);
    ctx.beginPath();
    ctx.arc(-6, -11, 2.5, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.arc(6, -11, 2.5, -Math.PI / 2, Math.PI / 2);
    stroke(ctx, 1);
    ctx.fillStyle = "rgba(255,240,180,0.8)";
    ctx.fillRect(-4, -13, 1.6, 5);
    ctx.restore();
  }

  /* ---------- The decor faces. Each draws over the wall in a 64 x 64 box: (ctx, palette, opts) ---------- */
  const DECOR = {
    /* Small sign by a door: cream plate, colored top band, dark letters. */
    roomSign(ctx, p, o) {
      const band = pick([C.blue, C.olive, C.red, C.steel, C.amber, C.teal], strHash(o.text));
      drop(ctx, 5, 9, 54, 36);
      box(ctx, 5, 9, 54, 36, C.cream, 3);
      ctx.fillStyle = band;
      ctx.fillRect(6.5, 10.5, 51, 6);
      seg(ctx, 6.5, 17, 57.5, 17, INK, 1.5);
      screw(ctx, 10, 13.5);
      screw(ctx, 54, 13.5);
      fit(ctx, o.text, 32, 31, 48, 23, { color: INK });
    },
    /* Big painted department sign: a bold banner hung on two wires, letters in cream with ink. */
    bigSign(ctx, p, o) {
      const bg = pick([C.red, C.blue, C.olive, C.amber, C.teal, C.purple], strHash(o.text));
      seg(ctx, 14, 0, 14, 8, INK, 2);
      seg(ctx, 50, 0, 50, 8, INK, 2);
      drop(ctx, 1.5, 7, 61, 42);
      box(ctx, 1.5, 7, 61, 42, bg, 3);
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(3, 8.5, 58, 4);
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.fillRect(3, 43, 58, 4.5);
      const dark = onColor(bg) === INK;
      fit(ctx, o.text, 32, 28, 57, 36, { font: COMIC, weight: "400", color: dark ? INK : C.cream, stroke: dark ? null : INK, strokeW: 3 });
    },
    /* Aisle marker: blue board on wires, a number in a white disc over the word, or one big word. */
    aisleSign(ctx, p, o) {
      const t = String(o.text || "");
      const m = /^(\d+)\s+(.+)$/.exec(t);
      seg(ctx, 16, 0, 16, 8, INK, 2);
      seg(ctx, 48, 0, 48, 8, INK, 2);
      drop(ctx, 3, 8, 58, 46);
      box(ctx, 3, 8, 58, 46, C.blue, 3);
      ctx.strokeStyle = C.cream;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(6.5, 11.5, 51, 39);
      if (m) {
        disc(ctx, 32, 22.5, 9.5, C.cream, 2.5);
        fit(ctx, m[1], 32, 22.5, 13, 12, { color: C.blue });
        fit(ctx, m[2], 32, 41, 48, 14, { color: C.cream });
      } else fit(ctx, t, 32, 31, 48, 32, { color: C.cream });
    },
    /* Red EXIT box over a door frame, glowing on the wall. */
    exitSign(ctx, p, o) {
      const g = ctx.createRadialGradient(32, 19, 6, 32, 19, 34);
      g.addColorStop(0, "rgba(255,96,72,0.5)");
      g.addColorStop(1, "rgba(255,96,72,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 56);
      ctx.fillStyle = "#3a3d42";
      ctx.fillRect(28, 2, 8, 6);
      drop(ctx, 7, 7, 50, 26);
      box(ctx, 7, 7, 50, 26, C.red, 3);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(8.5, 8.5, 47, 3);
      fit(ctx, o.text || "EXIT", 32, 20.5, 42, 17, { color: "#fff1e4" });
    },
    /* Faded paper poster: a headline band and a simple picture, taped up a little crooked. */
    poster(ctx, p, o) {
      const t = String(o.text || "");
      const h = strHash(t);
      const v = o.v || 0;
      const paper = pick(["#efe6cf", "#e8d6a8", "#dde6e2", "#f0d9cf"], h + v);
      const band = pick([C.red, C.blue, C.olive, C.purple, C.amber, C.teal], h >>> 3);
      ctx.save();
      ctx.translate(32, 32);
      ctx.rotate((v - 1) * 0.06 + (((h >>> 5) % 3) - 1) * 0.025);
      drop(ctx, -23, -27, 46, 55);
      box(ctx, -23, -27, 46, 55, paper, 2.5);
      ctx.fillStyle = mix(band, paper, 0.18);
      ctx.fillRect(-21.5, -25.5, 43, 23);
      fit(ctx, t, 0, -14, 40, 20, { color: onColor(band) === INK ? INK : C.cream });
      icon(ctx, iconFor(t, h + v), 0, 13, 10.5);
      // torn corner and tape
      poly(ctx, [[23, 21], [23, 28], [16, 28]], mix(p.wall || "#777777", "#000000", 0.25), 0);
      tape(ctx, -20, -27, -0.4);
      tape(ctx, 20, -27, 0.4);
      ctx.fillStyle = "rgba(255,250,235,0.1)";
      ctx.fillRect(-23, -27, 46, 55);
      ctx.restore();
    },
    /* Spray paint: drippy letters, red, black or blue, with a pale edge so they read on any wall. */
    graffiti(ctx, p, o) {
      const h = strHash(o.text) + (o.v || 0) * 3;
      const col = pick(["#c42d24", "#17181c", "#c42d24", "#2550a8"], h);
      const r = rng(h);
      ctx.save();
      ctx.translate(32, 29);
      ctx.rotate(-0.1 + ((h >>> 4) % 5) * 0.04);
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < 26; i++) ctx.fillRect(r() * 60 - 30, r() * 40 - 20, 1.3, 1.3);
      ctx.globalAlpha = 1;
      const f = fit(ctx, o.text, 0, 0, 60, 44, { font: COMIC, weight: "400", color: col, stroke: "rgba(243,238,224,0.85)", strokeW: 3 });
      const y0 = f.h / 2 - 2;
      for (let i = 0; i < 6; i++) {
        const x = (r() - 0.5) * f.w * 0.9;
        const len = 4 + r() * 13;
        ctx.fillStyle = col;
        ctx.fillRect(x - 0.9, y0, 1.8, len);
        disc(ctx, x, y0 + len, 1.6, col, 0);
      }
      ctx.restore();
    },
    /* Chalk tally marks in fives and a little calendar with days scratched out. */
    tally(ctx, p, o) {
      const v = o.v || 0;
      const r = rng(31 + v * 17);
      const chalk = (fn) => {
        ctx.save();
        ctx.translate(1, 1);
        fn("rgba(15,16,18,0.45)");
        ctx.restore();
        fn("rgba(240,238,226,0.95)");
      };
      const groups = 3 - v;
      for (let g = 0; g < groups; g++) {
        const x0 = 8 + g * 18;
        const n = g === groups - 1 ? 3 + v : 4;
        chalk((c) => {
          for (let i = 0; i < n; i++) seg(ctx, x0 + i * 3.6 + r() * 0.8, 7 + r() * 2, x0 + i * 3.6 + r() * 0.8, 24 + r() * 2, c, 2.4);
          if (n === 4) seg(ctx, x0 - 2.5, 22, x0 + 13.5, 9, c, 2.4);
        });
      }
      chalk((c) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(8, 33, 48, 24);
        for (let i = 1; i < 6; i++) seg(ctx, 8 + i * 8, 33, 8 + i * 8, 57, c, 1.3);
        for (let j = 1; j < 3; j++) seg(ctx, 8, 33 + j * 8, 56, 33 + j * 8, c, 1.3);
        const done = 9 + v * 3;
        for (let k = 0; k < done && k < 18; k++) {
          const cx = 8 + (k % 6) * 8;
          const cy = 33 + Math.floor(k / 6) * 8;
          seg(ctx, cx + 1.5, cy + 1.5, cx + 6.5, cy + 6.5, c, 1.6);
          seg(ctx, cx + 6.5, cy + 1.5, cx + 1.5, cy + 6.5, c, 1.6);
        }
      });
    },
    /* Cork board in a wood frame: pinned papers, a sticky note, a photo, a map scrap; a header card if given text. */
    noticeBoard(ctx, p, o) {
      const v = o.v || 0;
      const r = rng(41 + v * 13);
      drop(ctx, 3, 5, 58, 52);
      box(ctx, 3, 5, 58, 52, C.wood, 3);
      ctx.fillStyle = "#c49a5c";
      ctx.fillRect(7, 9, 50, 44);
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = r() < 0.5 ? "#a87e45" : "#d8b07a";
        ctx.fillRect(7 + r() * 49, 9 + r() * 43, 1.4, 1.4);
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(7, 9, 50, 44);
      const top = o.text ? 25 : 13;
      const paper = (x, y, w, h, fill, a, pin) => {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(a);
        ctx.fillStyle = "rgba(15,16,18,0.35)";
        ctx.fillRect(-w / 2 + 1.5, -h / 2 + 1.5, w, h);
        box(ctx, -w / 2, -h / 2, w, h, fill, 1.5);
        ctx.fillStyle = "rgba(60,60,60,0.55)";
        for (let yy = -h / 2 + 5; yy < h / 2 - 2; yy += 3.5) ctx.fillRect(-w / 2 + 3, yy, w - 6 - ((yy * 7) % 5), 1.1);
        disc(ctx, 0, -h / 2 + 2, 1.9, pin, 1);
        ctx.restore();
      };
      paper(10 + v * 2, top, 17, 21 - (o.text ? 4 : 0), "#f3eee0", -0.08, C.red);
      paper(31, top - 1, 15, 14, C.gold, 0.07 - v * 0.1, C.blue);
      // a photo
      ctx.save();
      ctx.translate(48, top + 13 - (o.text ? 3 : 0));
      ctx.rotate(0.12);
      box(ctx, -6, -7, 12, 14, "#fbfaf4", 1.4);
      ctx.fillStyle = "#7fb0d8";
      ctx.fillRect(-4.5, -5.5, 9, 6);
      ctx.fillStyle = C.olive;
      ctx.fillRect(-4.5, 0.5, 9, 3);
      ctx.restore();
      if (!o.text) {
        // a scrap of map
        ctx.save();
        ctx.translate(20, 43);
        ctx.rotate(-0.05);
        box(ctx, -10, -6, 20, 12, "#dfe8d0", 1.4);
        seg(ctx, -9, 2, 9, -3, "#5aa0d8", 2);
        seg(ctx, -2, -6, 1, 6, "#ffffff", 1.6);
        disc(ctx, 4, -1, 1.6, C.red, 0.8);
        ctx.restore();
      }
      if (o.text) {
        drop(ctx, 9, 8, 46, 15, 2);
        box(ctx, 9, 8, 46, 15, C.cream, 2);
        fit(ctx, o.text, 32, 15.5, 42, 11, { color: INK });
      }
    },
    /* Round wall clock, cracked glass, hands stopped. */
    clock(ctx, p, o) {
      const v = o.v || 0;
      disc(ctx, 35, 31, 21, "rgba(15,16,18,0.4)", 0);
      disc(ctx, 32, 28, 21, C.cream, 4);
      ctx.beginPath();
      ctx.arc(32, 28, 17.5, 0, TAU);
      stroke(ctx, 1, "#6e7278");
      for (let i = 0; i < 12; i++) {
        const a = (i * TAU) / 12;
        const r0 = i % 3 ? 14.5 : 12.5;
        seg(ctx, 32 + Math.cos(a) * r0, 28 + Math.sin(a) * r0, 32 + Math.cos(a) * 17, 28 + Math.sin(a) * 17, INK, i % 3 ? 1.4 : 2.4);
      }
      const hour = ((v ? 4 : 10) + (v ? 47 : 10) / 60) / 12;
      const min = (v ? 47 : 10) / 60;
      const hand = (f, len, lw) => seg(ctx, 32, 28, 32 + Math.sin(f * TAU) * len, 28 - Math.cos(f * TAU) * len, INK, lw);
      hand(hour, 9, 3.6);
      hand(min, 14, 2.4);
      disc(ctx, 32, 28, 2.2, C.red, 0);
      // the crack, ink with a glint beside it
      const c0 = v ? [24, 20] : [40, 19];
      [[9, -6], [5, 9], [-8, -2], [3, -10]].forEach(([dx, dy]) => {
        seg(ctx, c0[0], c0[1], c0[0] + dx, c0[1] + dy, INK, 1.3);
        seg(ctx, c0[0] + 0.8, c0[1] + 0.8, c0[0] + dx * 0.7 + 0.8, c0[1] + dy * 0.7 + 0.8, "rgba(255,255,255,0.8)", 0.7);
      });
      ctx.beginPath();
      ctx.arc(32, 28, 15, Math.PI * 1.1, Math.PI * 1.45);
      stroke(ctx, 2, "rgba(255,255,255,0.7)");
    },
    /* Fire extinguisher in a glass-front wall box, FIRE on a red plate. */
    fireExt(ctx, p, o) {
      drop(ctx, 13, 3, 38, 58);
      box(ctx, 13, 3, 38, 58, "#ece7dc", 3);
      ctx.fillStyle = "#2b3540";
      ctx.fillRect(17, 20, 30, 37);
      box(ctx, 17, 6, 30, 12, C.red, 2);
      fit(ctx, "FIRE", 32, 12, 26, 9, { color: C.cream });
      // the extinguisher
      ctx.beginPath();
      ctx.moveTo(25, 31);
      ctx.quadraticCurveTo(25, 26, 32, 26);
      ctx.quadraticCurveTo(39, 26, 39, 31);
      ctx.lineTo(39, 55);
      ctx.lineTo(25, 55);
      ctx.closePath();
      ctx.fillStyle = "#d4322a";
      ctx.fill();
      stroke(ctx, 2.2);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(27, 30, 2.5, 22);
      box(ctx, 26, 38, 12, 8, C.cream, 1.2);
      box(ctx, 29, 22, 6, 4, "#2b2d31", 1.5);
      seg(ctx, 33, 22, 41, 21, INK, 2.2);
      ctx.beginPath();
      ctx.moveTo(29, 24);
      ctx.quadraticCurveTo(20, 26, 21, 40);
      stroke(ctx, 2.6, "#1f2023");
      // the glass front
      poly(ctx, [[17, 30], [27, 20], [33, 20], [17, 36]], "rgba(255,255,255,0.16)", 0);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(17, 20, 30, 37);
    },
    /* Metal air vent: dark slats, four screws, a dust streak below. */
    vent(ctx, p, o) {
      const g = ctx.createLinearGradient(0, 44, 0, 64);
      g.addColorStop(0, "rgba(40,30,20,0.4)");
      g.addColorStop(1, "rgba(40,30,20,0)");
      ctx.fillStyle = g;
      ctx.fillRect(18, 44, 28, 20);
      drop(ctx, 10, 13, 44, 31, 2.5);
      box(ctx, 10, 13, 44, 31, "#a3a8ad", 3);
      ctx.fillStyle = "#26282c";
      if (o.v) for (let x = 15; x < 50; x += 6.5) ctx.fillRect(x, 17, 3.5, 23);
      else {
        for (let y = 17; y < 41; y += 6) {
          ctx.fillStyle = "#26282c";
          ctx.fillRect(14, y, 36, 3.6);
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.fillRect(14, y + 3.6, 36, 1);
        }
      }
      [[13, 16], [51, 16], [13, 41], [51, 41]].forEach(([x, y]) => screw(ctx, x, y));
    },
    /* Pipes along the wall, a red valve wheel and a gauge. */
    pipes(ctx, p, o) {
      ctx.save();
      if (o.v) {
        ctx.translate(64, 0);
        ctx.scale(-1, 1);
      }
      const pipe = (y, r, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(0, y - r, 64, r * 2);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(0, y - r + 1.5, 64, 1.6);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(0, y + r - 2.5, 64, 2.5);
        seg(ctx, 0, y - r, 64, y - r, INK, 2);
        seg(ctx, 0, y + r, 64, y + r, INK, 2);
      };
      pipe(11, 5, "#8f969c");
      pipe(25, 4, "#b8743c");
      [10, 34].forEach((x) => box(ctx, x, 4, 4, 14, "#3a3d42", 1.5));
      // a pipe down to the floor with the valve
      ctx.fillStyle = "#b8743c";
      ctx.fillRect(44, 25, 8, 39);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(45.5, 29, 1.6, 35);
      seg(ctx, 44, 29, 44, 64, INK, 2);
      seg(ctx, 52, 29, 52, 64, INK, 2);
      ctx.beginPath();
      ctx.arc(48, 41, 8, 0, TAU);
      stroke(ctx, 5, INK);
      stroke(ctx, 3, "#d4322a");
      for (let i = 0; i < 4; i++) seg(ctx, 48, 41, 48 + Math.cos((i * TAU) / 4 + 0.4) * 7, 41 + Math.sin((i * TAU) / 4 + 0.4) * 7, INK, 1.6);
      disc(ctx, 48, 41, 2.2, "#d4322a", 1.2);
      // the gauge on a short stem
      box(ctx, 17, 29, 3, 7, "#8f969c", 1.2);
      disc(ctx, 18.5, 43, 8, C.cream, 2.4);
      ctx.beginPath();
      ctx.arc(18.5, 43, 5.5, Math.PI * 0.15, Math.PI * 0.45);
      stroke(ctx, 2, C.red);
      seg(ctx, 18.5, 43, 22.5, 39, INK, 1.6);
      disc(ctx, 18.5, 43, 1.3, INK, 0);
      ctx.restore();
    },
    /* Cracked plaster where a patch has fallen, and a brown water stain running down. */
    crack(ctx, p, o) {
      const v = o.v || 0;
      const r = rng(97 + v * 31);
      const sx = 16 + r() * 30;
      ctx.fillStyle = "rgba(110,72,30,0.25)";
      ctx.beginPath();
      ctx.moveTo(sx - 9, 0);
      ctx.bezierCurveTo(sx - 12, 22, sx - 4, 34, sx - 6, 52);
      ctx.quadraticCurveTo(sx, 60, sx + 5, 50);
      ctx.bezierCurveTo(sx + 4, 32, sx + 12, 20, sx + 9, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(90,55,20,0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // the bare patch
      const cx = 20 + r() * 24;
      const cy = 22 + r() * 18;
      const pts = [];
      for (let i = 0; i < 9; i++) {
        const a = (i * TAU) / 9;
        const rr = 7 + r() * 7;
        pts.push([cx + Math.cos(a) * rr * 1.2, cy + Math.sin(a) * rr * 0.8]);
      }
      poly(ctx, pts, mix(p.wall || "#777777", "#e6dfcc", 0.55), 1.6);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let i = 0; i < 6; i++) ctx.fillRect(cx - 8 + r() * 16, cy - 5 + r() * 10, 2, 1.2);
      // the cracks branch out from the patch
      const branch = (x, y, a, len, w, depth) => {
        let px = x;
        let py = y;
        for (let s = 0; s < 4; s++) {
          const nx = px + Math.cos(a) * (len / 4);
          const ny = py + Math.sin(a) * (len / 4);
          seg(ctx, px, py, nx, ny, INK, w);
          px = nx;
          py = ny;
          a += (r() - 0.5) * 0.9;
          if (depth > 0 && r() < 0.35) branch(px, py, a + (r() < 0.5 ? 0.8 : -0.8), len * 0.5, w * 0.7, depth - 1);
        }
      };
      for (let i = 0; i < 3; i++) branch(pts[i * 3][0], pts[i * 3][1], (i * TAU) / 3 + r(), 18 + r() * 10, 2, 1);
    },
    /* Planks nailed across the wall in an X (and one more across, in the second variant). */
    boarded(ctx, p, o) {
      plank(ctx, 32, 32, 80, 12, 0.72, "#a07850");
      plank(ctx, 32, 32, 80, 12, -0.72, "#8f6a44");
      if (o.v) plank(ctx, 32, 50, 72, 11, 0.04, "#b08a5c");
    },
    /* Three tall metal lockers; in two of the variants one door hangs open. */
    lockers(ctx, p, o) {
      const col = pick(["#3e6e9e", "#6d8a46", "#b5562c", "#7d8288", "#8a3a3a"], strHash(p.wall));
      const open = o.v === 1 ? 1 : o.v === 2 ? 0 : -1;
      for (let i = 0; i < 3; i++) {
        const x = 1.5 + i * 20.5;
        if (i === open) {
          box(ctx, x, 3, 20, 61, "#1b1d21", 2.5);
          seg(ctx, x + 2, 20, x + 18, 20, "#4b5057", 2);
          ctx.beginPath();
          ctx.arc(x + 10, 26, 2.5, Math.PI, 0);
          stroke(ctx, 1.4, "#9ea3aa");
          continue;
        }
        box(ctx, x, 3, 20, 61, col, 2.5);
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.fillRect(x + 2.5, 5, 3, 57);
        ctx.fillStyle = "#1f2023";
        for (let k = 0; k < 3; k++) ctx.fillRect(x + 6, 8 + k * 3.6, 10, 1.6);
        box(ctx, x + 6, 21, 8, 5, C.cream, 1);
        box(ctx, x + 14, 33, 3, 10, "#2f3136", 1);
        ctx.fillStyle = "#1f2023";
        for (let k = 0; k < 2; k++) ctx.fillRect(x + 6, 54 + k * 3.6, 10, 1.6);
      }
      if (open >= 0) {
        // the open door, swung toward you, over the next locker
        const hx = 1.5 + open * 20.5 + 20;
        poly(ctx, [[hx, 3], [hx + 9, 0], [hx + 9, 64], [hx, 64]], shade(col, -22), 2.5);
        ctx.fillStyle = "#1f2023";
        for (let k = 0; k < 3; k++) ctx.fillRect(hx + 2.5, 8 + k * 3.6, 4.5, 1.6);
      }
    },
    /* Green chalkboard in a wood frame, chalk writing, a chalk tray. */
    chalkboard(ctx, p, o) {
      drop(ctx, 2, 6, 60, 46);
      box(ctx, 2, 6, 60, 46, C.tan, 3);
      ctx.fillStyle = "#2f4a3a";
      ctx.fillRect(6, 10, 52, 38);
      ctx.fillStyle = "rgba(220,235,220,0.1)";
      ctx.beginPath();
      ctx.ellipse(20, 40, 14, 5, -0.2, 0, TAU);
      ctx.ellipse(46, 16, 10, 4, 0.3, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(6, 10, 52, 38);
      const f = fit(ctx, o.text, 32, 26, 48, 24, { color: "#eef2e8" });
      ctx.beginPath();
      ctx.moveTo(32 - f.w / 2, 26 + f.h / 2 + 4);
      ctx.quadraticCurveTo(32, 26 + f.h / 2 + 7, 32 + f.w / 2, 26 + f.h / 2 + 3);
      stroke(ctx, 1.4, "rgba(238,242,232,0.85)");
      box(ctx, 4, 52, 56, 4, C.wood, 1.5);
      box(ctx, 40, 50, 8, 2.5, "#f6f6f0", 0.8);
    },
    /* White marker board: blue writing, a red doodle, a tray with markers. */
    whiteboard(ctx, p, o) {
      drop(ctx, 2, 6, 60, 44);
      box(ctx, 2, 6, 60, 44, "#b8bcc0", 3);
      ctx.fillStyle = "#f6f7f4";
      ctx.fillRect(5, 9, 54, 38);
      ctx.fillStyle = "rgba(120,140,160,0.12)";
      ctx.fillRect(40, 9, 10, 38);
      fit(ctx, o.text, 32, 22, 50, 22, { color: "#2a4fa0" });
      // a doodle: an arrow and a box with ticks
      ctx.beginPath();
      ctx.moveTo(10, 41);
      ctx.quadraticCurveTo(18, 35, 26, 40);
      stroke(ctx, 1.6, "#c42d24");
      seg(ctx, 26, 40, 22, 37, "#c42d24", 1.6);
      seg(ctx, 26, 40, 22, 42, "#c42d24", 1.6);
      ctx.strokeStyle = "#c42d24";
      ctx.lineWidth = 1.4;
      ctx.strokeRect(33, 36, 6, 6);
      seg(ctx, 34, 39, 36, 41, "#2a7a3a", 1.6);
      seg(ctx, 36, 41, 40, 35, "#2a7a3a", 1.6);
      seg(ctx, 43, 39, 54, 39, "#2a4fa0", 1.6);
      box(ctx, 4, 50, 56, 3, "#9ea3aa", 1.2);
      box(ctx, 14, 47.5, 9, 2.5, C.red, 0.8);
      box(ctx, 26, 47.5, 9, 2.5, C.blue, 0.8);
    },
    /* Pegboard with hanging tools: wrench, hammer, saw, screwdriver. */
    pegboard(ctx, p, o) {
      box(ctx, 2, 4, 60, 57, "#a8794a", 3);
      ctx.fillStyle = "#5a3f24";
      for (let y = 9; y < 58; y += 6) for (let x = 7; x < 59; x += 6) ctx.fillRect(x, y, 1.7, 1.7);
      const tools = [wrench, hammer, saw, screwdriver];
      const v = o.v || 0;
      [12, 31, 50].forEach((x, i) => {
        seg(ctx, x - 2, 8, x + 2, 8, "#2b2d31", 2.4);
        tools[(i + v) % 4](ctx, x, 10 + ((i + v) % 2) * 3);
      });
    },
    /* Glass cooler door: dark inside, shelves of bottles and cans, a chrome handle, a lit strip. */
    coolerDoors(ctx, p, o) {
      const r = rng(61 + (o.v || 0) * 17);
      box(ctx, 1.5, 1.5, 61, 62.5, "#9ea3aa", 3);
      ctx.fillStyle = "#18232b";
      ctx.fillRect(5, 5, 54, 57);
      ctx.fillStyle = "#cfe8f0";
      ctx.fillRect(5, 5, 54, 3);
      const colors = ["#c42d24", "#2f5f9e", "#7a9a3c", "#d9a21b", "#e6dfcc", "#e0592a", "#3aa0c0"];
      [22, 38, 54].forEach((sy) => {
        let x = 7;
        while (x < 53) {
          const w = 4 + Math.floor(r() * 4);
          const hh = 8 + Math.floor(r() * 6);
          if (x + w > 57) break;
          const col = mix(colors[Math.floor(r() * colors.length)], "#18232b", 0.3);
          ctx.fillStyle = col;
          ctx.fillRect(x, sy - hh, w, hh);
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.fillRect(x + 1, sy - hh + 2, 1, hh - 3);
          if (w < 6) {
            ctx.fillStyle = col;
            ctx.fillRect(x + w / 2 - 1, sy - hh - 3, 2, 3);
          }
          x += w + 1.5;
        }
        ctx.fillStyle = "#7d8288";
        ctx.fillRect(5, sy, 54, 2);
      });
      poly(ctx, [[10, 62], [30, 5], [40, 5], [20, 62]], "rgba(255,255,255,0.1)", 0);
      box(ctx, 51, 22, 4, 22, "#d0d4d8", 1.5);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, 54, 57);
    },
    /* Flat TV on the wall: black bezel, a cracked screen of gray static. */
    tvScreen(ctx, p, o) {
      const v = o.v || 0;
      const r = rng(71 + v * 5);
      ctx.fillStyle = "#2f3136";
      ctx.fillRect(27, 44, 10, 8);
      drop(ctx, 3, 11, 58, 36);
      box(ctx, 3, 11, 58, 36, "#1b1d21", 3);
      for (let y = 15; y < 43; y += 2) {
        for (let x = 7; x < 57; x += 2) {
          const g = 80 + Math.floor(r() * 130);
          ctx.fillStyle = "rgb(" + g + "," + g + "," + g + ")";
          ctx.fillRect(x, y, 2, 2);
        }
      }
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(7, 18 + v * 14, 50, 2);
      const c0 = v ? [19, 22] : [44, 34];
      [[-10, -6], [8, -7], [6, 6], [-7, 8], [12, 1]].forEach(([dx, dy]) => {
        seg(ctx, c0[0], c0[1], c0[0] + dx, c0[1] + dy, INK, 1.6);
        seg(ctx, c0[0] + 0.8, c0[1], c0[0] + dx * 0.8 + 0.8, c0[1] + dy * 0.8, "rgba(255,255,255,0.75)", 0.7);
      });
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(7, 15, 50, 28);
      disc(ctx, 55, 45, 1.2, "#e04a3a", 0);
    },
    /* Black menu board: a title, prices, a coffee cup. */
    menuBoard(ctx, p, o) {
      drop(ctx, 3, 4, 58, 54);
      box(ctx, 3, 4, 58, 54, C.wood, 3);
      ctx.fillStyle = "#1f2023";
      ctx.fillRect(6.5, 7.5, 51, 47);
      fit(ctx, o.text, 32, 17, 48, 15, { color: C.gold });
      seg(ctx, 10, 27, 54, 27, "rgba(243,238,224,0.5)", 1);
      ["$3", "$2", "$5"].forEach((price, i) => {
        const y = 33 + i * 7.5;
        ctx.fillStyle = "rgba(243,238,224,0.85)";
        ctx.fillRect(10, y - 1.2, 18 - i * 3, 2.6);
        for (let x = 31 - i * 3; x < 38; x += 2.5) ctx.fillRect(x, y, 1, 1);
        fit(ctx, price, 42, y, 8, 6, { color: C.cream });
      });
      // the cup
      box(ctx, 47, 39, 8, 9, C.cream, 1.4);
      ctx.beginPath();
      ctx.arc(55.5, 43.5, 2.4, -Math.PI / 2, Math.PI / 2);
      stroke(ctx, 1.3, C.cream);
      [49, 53].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, 37);
        ctx.quadraticCurveTo(x + 2, 34.5, x, 32);
        stroke(ctx, 1, "rgba(243,238,224,0.8)");
      });
    },
    /* Street map pinned up: roads, a river, a park, red pins joined by red string; a title if given. */
    wallMap(ctx, p, o) {
      drop(ctx, 4, 5, 56, 54);
      box(ctx, 4, 5, 56, 54, "#ebe3c6", 2.5);
      const top = o.text ? 19 : 7;
      ctx.save();
      ctx.beginPath();
      ctx.rect(5.5, top, 53, 57.5 - top);
      ctx.clip();
      ctx.fillStyle = "#b9cf8f";
      ctx.fillRect(34, top + 5, 14, 10);
      ctx.beginPath();
      ctx.moveTo(4, top + 22);
      ctx.bezierCurveTo(20, top + 16, 34, top + 34, 60, top + 26);
      stroke(ctx, 5, "#6aa6c8");
      const road = (x0, y0, x1, y1) => {
        seg(ctx, x0, y0, x1, y1, "#8f8a7a", 4.5);
        seg(ctx, x0, y0, x1, y1, "#ffffff", 2.6);
      };
      road(18, top, 20, 60);
      road(42, top, 40, 60);
      road(4, top + 10, 60, top + 12);
      road(4, top + 34, 60, top + 32);
      ctx.restore();
      const pins = [[14, top + 8], [45, top + 21], [27, top + 31]];
      ctx.beginPath();
      pins.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      stroke(ctx, 1.2, "#c42d24");
      pins.forEach(([x, y]) => disc(ctx, x, y, 2.6, "#d4322a", 1.2));
      if (o.text) {
        ctx.fillStyle = INK;
        ctx.fillRect(5.5, 6.5, 53, 12);
        fit(ctx, o.text, 32, 12.5, 49, 10, { color: C.cream });
      }
      tape(ctx, 7, 6, -0.6);
      tape(ctx, 57, 6, 0.6);
    },
    /* Eye chart: a big E, then rows of smaller letters. */
    eyeChart(ctx, p, o) {
      drop(ctx, 14, 3, 36, 58, 2.5);
      box(ctx, 14, 3, 36, 58, "#f8f6f0", 2.5);
      [["E", 13, 13], ["F P", 8.5, 25], ["T O Z", 6.5, 34], ["L P E D", 5, 41.5], ["P E C F D", 4, 48]].forEach(([t, h, y]) => fit(ctx, t, 32, y, 30, h, { color: INK }));
      ctx.fillStyle = C.red;
      ctx.fillRect(18, 52.5, 28, 1.3);
      fit(ctx, "E D F C Z P", 32, 56.5, 26, 3, { color: INK });
    },
    /* White first-aid cabinet with a red cross. */
    firstAid(ctx, p, o) {
      drop(ctx, 12, 8, 40, 46);
      box(ctx, 12, 8, 40, 46, "#f3f3ee", 3);
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(13.5, 45, 37, 7.5);
      poly(ctx, [[27, 15], [37, 15], [37, 24], [46, 24], [46, 34], [37, 34], [37, 43], [27, 43], [27, 34], [18, 34], [18, 24], [27, 24]], "#d4322a", 2);
      box(ctx, 29, 47, 6, 3, "#9ea3aa", 1);
    },
    /* Yellow hazard sign: a black-and-yellow striped band and big black words. */
    warning(ctx, p, o) {
      drop(ctx, 3, 5, 58, 52);
      box(ctx, 3, 5, 58, 52, C.gold, 3);
      ctx.save();
      ctx.beginPath();
      ctx.rect(4.5, 6.5, 55, 11);
      ctx.clip();
      for (let x = -10; x < 64; x += 10) poly(ctx, [[x, 17.5], [x + 5, 6.5], [x + 10, 6.5], [x + 5, 17.5]], INK, 0);
      ctx.restore();
      seg(ctx, 4.5, 18, 59.5, 18, INK, 2);
      fit(ctx, o.text, 32, 37.5, 52, 33, { color: INK });
    },
    /* Gray control panel: gauges, switches, lights, a label strip. */
    panel(ctx, p, o) {
      const v = o.v || 0;
      drop(ctx, 4, 5, 56, 54);
      box(ctx, 4, 5, 56, 54, "#7d8288", 3);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(6, 7, 52, 3);
      [[18, 21, v ? 0.3 : -0.5], [42, 21, v ? -0.9 : 0.6]].forEach(([x, y, a]) => {
        disc(ctx, x, y, 8.5, C.cream, 2.2);
        ctx.beginPath();
        ctx.arc(x, y, 6, -0.2, 0.7);
        stroke(ctx, 2, C.red);
        seg(ctx, x, y, x + Math.sin(a) * 6.5, y - Math.cos(a) * 6.5, INK, 1.6);
        disc(ctx, x, y, 1.3, INK, 0);
      });
      [12, 23, 34].forEach((x, i) => {
        box(ctx, x, 33, 8, 12, "#2b2d31", 1.4);
        const up = (i + v) % 2 === 0;
        box(ctx, x + 2.5, up ? 34.5 : 39.5, 3, 5, "#d0d4d8", 1);
      });
      disc(ctx, 50, 36, 3, "#5ad06a", 1.2);
      disc(ctx, 50, 45, 3, v ? "#e04a3a" : "#5a3a3a", 1.2);
      box(ctx, 12, 49, 30, 6, C.cream, 1.2);
      ctx.fillStyle = "#6e7278";
      ctx.fillRect(14, 51.5, 20, 1.2);
      [[7, 8], [57, 8], [7, 56], [57, 56]].forEach(([x, y]) => screw(ctx, x, y));
    },
    /* Gray breaker box: a lever and a lightning-bolt sticker. */
    breaker(ctx, p, o) {
      drop(ctx, 14, 5, 36, 54);
      box(ctx, 14, 5, 36, 54, "#8c9196", 3);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(16, 7, 32, 3);
      ctx.strokeStyle = "#3a3d42";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(18, 12, 26, 43);
      box(ctx, 46, 26, 6, 16, "#3a3d42", 2);
      disc(ctx, 49, 25, 3.2, C.red, 1.4);
      poly(ctx, [[31, 15], [42, 34], [20, 34]], C.gold, 2);
      poly(ctx, [[32, 19], [27, 27], [31, 27], [29, 32], [35, 24], [31, 24], [33, 19]], INK, 0);
      ctx.fillStyle = "#3a3d42";
      for (let y = 42; y < 52; y += 3) ctx.fillRect(22, y, 18, 1.5);
    },
    /* A folded red fire hose on a wall rack with a brass nozzle. */
    hoseRack(ctx, p, o) {
      disc(ctx, 32, 7, 5, C.red, 2);
      seg(ctx, 27, 7, 37, 7, INK, 1.4);
      box(ctx, 10, 12, 44, 5, "#9ea3aa", 2);
      for (let i = 0; i < 5; i++) {
        const y = 18 + i * 7.5;
        const off = i % 2 ? 3 : 0;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(8 + off, y, 48 - off, 8, 4);
        else ctx.rect(8 + off, y, 48 - off, 8);
        ctx.fillStyle = i % 2 ? "#c42d24" : "#d4322a";
        ctx.fill();
        stroke(ctx, 2);
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(12 + off, y + 1.5, 40 - off, 1.4);
      }
      ctx.beginPath();
      ctx.moveTo(52, 56);
      ctx.quadraticCurveTo(58, 58, 54, 62);
      stroke(ctx, 4, INK);
      stroke(ctx, 2.4, "#c42d24");
      poly(ctx, [[46, 55], [52, 53], [53, 58], [47, 60]], "#c9a227", 1.6);
    },
    /* Closed shop front: the name band on top, a roll-down grille below. */
    storefront(ctx, p, o) {
      const bg = pick([C.red, C.blue, C.olive, C.purple, C.teal, C.amber], strHash(o.text));
      box(ctx, 1.5, 28, 61, 36, "#a9aeb3", 2.5);
      for (let y = 31; y < 63; y += 4) {
        ctx.fillStyle = "#6e747a";
        ctx.fillRect(3, y, 58, 1.5);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(3, y + 1.5, 58, 1);
      }
      box(ctx, 27, 56, 10, 5, "#3a3d42", 1.4);
      drop(ctx, 1.5, 2, 61, 25, 2);
      box(ctx, 1.5, 2, 61, 25, bg, 3);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(3, 3.5, 58, 3);
      const dark = onColor(bg) === INK;
      fit(ctx, o.text, 32, 15, 57, 20, { font: COMIC, weight: "400", color: dark ? INK : C.cream, stroke: dark ? null : INK, strokeW: 2.6 });
    },
    /* Wooden lattice with dry vines, a few leaves and flowers. */
    trellis(ctx, p, o) {
      const r = rng(83 + (o.v || 0) * 9);
      ctx.save();
      ctx.beginPath();
      ctx.rect(4, 4, 56, 56);
      ctx.clip();
      ctx.fillStyle = "rgba(15,16,18,0.18)";
      ctx.fillRect(4, 4, 56, 56);
      [1, -1].forEach((s) => {
        for (let d = -60; d < 70; d += 12) {
          seg(ctx, d, s > 0 ? 0 : 64, d + 64, s > 0 ? 64 : 0, INK, 6);
          seg(ctx, d, s > 0 ? 0 : 64, d + 64, s > 0 ? 64 : 0, "#b58c58", 3.4);
        }
      });
      ctx.restore();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, 56, 56);
      for (let k = 0; k < 3; k++) {
        let x = 10 + k * 20 + r() * 6;
        let y = 62;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let s = 0; s < 5; s++) {
          const nx = x + (r() - 0.5) * 16;
          const ny = y - 9 - r() * 4;
          ctx.quadraticCurveTo(x + (r() - 0.5) * 14, (y + ny) / 2, nx, ny);
          x = nx;
          y = ny;
        }
        stroke(ctx, 1.8, "#6b5a2a");
      }
      for (let i = 0; i < 16; i++) {
        const x = 8 + r() * 48;
        const y = 10 + r() * 48;
        ctx.beginPath();
        ctx.ellipse(x, y, 3.2, 1.8, r() * 3, 0, TAU);
        ctx.fillStyle = r() < 0.55 ? C.olive : "#a8843a";
        ctx.fill();
        stroke(ctx, 0.9);
      }
      for (let i = 0; i < 4; i++) {
        const x = 10 + r() * 44;
        const y = 10 + r() * 40;
        disc(ctx, x, y, 2.6, i % 2 ? "#e07aa0" : C.gold, 1);
        disc(ctx, x, y, 0.9, "#e0592a", 0);
      }
    },
    /* Rack of seed packets in bright colors, a picture on each. */
    seedRack(ctx, p, o) {
      const r = rng(53 + (o.v || 0) * 3);
      const colors = ["#c42d24", "#e0592a", C.olive, C.gold, C.purple, C.teal, "#e07aa0"];
      const veg = ["#d4322a", "#e0792a", "#5a9a3c", "#8e5cff", C.gold];
      ctx.strokeStyle = "#5b6066";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(5, 4, 54, 58);
      [22, 41, 60].forEach((sy) => {
        [8, 25, 42].forEach((x) => {
          const y = sy - 17;
          box(ctx, x, y, 14, 16, colors[Math.floor(r() * colors.length)], 1.5);
          box(ctx, x + 2.5, y + 2.5, 9, 8, C.cream, 1);
          disc(ctx, x + 7, y + 6.5, 2.5, veg[Math.floor(r() * veg.length)], 0.9);
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillRect(x + 3, y + 12, 8, 1.2);
        });
        box(ctx, 5, sy, 54, 2, "#9ea3aa", 1);
      });
    },
    /* Floor-to-ceiling bookcase built into the wall, full of colored spines. */
    bookWall(ctx, p, o) {
      const r = rng(19 + (o.v || 0) * 101);
      ctx.fillStyle = "#3a281c";
      ctx.fillRect(0, 0, 64, 64);
      const colors = ["#b3261e", "#2f5f9e", "#7a9a3c", "#d9a21b", "#e6dfcc", "#6b3f6e", "#2f8fa8", "#8a5a2e", "#2b3540", "#c4572a"];
      [20, 41, 62].forEach((sy) => {
        let x = 3.5;
        while (x < 60) {
          const w = 3 + Math.floor(r() * 4);
          if (x + w > 60.5) break;
          if (r() < 0.07) {
            x += 3;
            continue;
          }
          const hh = 12 + Math.floor(r() * 6);
          const col = colors[Math.floor(r() * colors.length)];
          ctx.fillStyle = col;
          ctx.fillRect(x, sy - hh, w, hh);
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.fillRect(x, sy - hh + 3, w, 1.2);
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(x, sy - 4, w, 1.2);
          ctx.strokeStyle = INK;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, sy - hh, w, hh);
          x += w;
        }
        box(ctx, 0, sy, 64, 2.5, "#6b4a3a", 1.4);
      });
      box(ctx, 0, 0, 3, 64, "#6b4a3a", 1.4);
      box(ctx, 61, 0, 3, 64, "#6b4a3a", 1.4);
    },
    /* Bright painted mural: sky, sun and hills, the word painted big across it. */
    mural(ctx, p, o) {
      const h = strHash(o.text);
      const sky = pick(["#5aa0d8", "#f08a4b", "#8e6ad8", "#3ab0c0"], h);
      ctx.fillStyle = sky;
      ctx.fillRect(2, 4, 60, 56);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(2, 4, 60, 14);
      for (let i = 0; i < 8; i++) {
        const a = (i * TAU) / 8;
        seg(ctx, 48 + Math.cos(a) * 9, 15 + Math.sin(a) * 9, 48 + Math.cos(a) * 13, 15 + Math.sin(a) * 13, C.gold, 2.2);
      }
      disc(ctx, 48, 15, 7, C.gold, 2);
      ctx.beginPath();
      ctx.moveTo(2, 60);
      ctx.quadraticCurveTo(18, 30, 40, 60);
      ctx.fillStyle = "#5b8a2c";
      ctx.fill();
      stroke(ctx, 2);
      ctx.beginPath();
      ctx.moveTo(22, 60);
      ctx.quadraticCurveTo(46, 36, 62, 52);
      ctx.lineTo(62, 60);
      ctx.fillStyle = C.olive;
      ctx.fill();
      stroke(ctx, 2);
      D3.halftone(ctx, 64, 64, 0.08);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 4, 60, 56);
      fit(ctx, o.text, 32, 33, 56, 34, { font: COMIC, weight: "400", color: C.cream, stroke: INK, strokeW: 3.5 });
    },
    /* Glass trophy case: gold cups on two shelves and a pennant. */
    trophyCase(ctx, p, o) {
      const v = o.v || 0;
      box(ctx, 4, 3, 56, 59, C.wood, 3);
      ctx.fillStyle = "#30424c";
      ctx.fillRect(8, 7, 48, 51);
      [32, 57].forEach((y) => box(ctx, 8, y, 48, 2.5, C.tan, 1));
      cup(ctx, v ? 44 : 18, 32, 1.3);
      cup(ctx, 31, 32, 0.9);
      cup(ctx, v ? 18 : 44, 32, 1.05);
      // the pennant, a plaque and one more cup on the lower shelf
      seg(ctx, 12, 39, 12, 56, "#8a6a46", 1.6);
      poly(ctx, [[12, 39], [30, 43], [12, 47]], C.red, 1.5);
      seg(ctx, 14, 41, 14, 45, C.cream, 1.4);
      box(ctx, 33, 47, 10, 9, C.tan, 1.2);
      box(ctx, 35, 49.5, 6, 4, C.gold, 0.8);
      cup(ctx, 50, 57, 0.85);
      poly(ctx, [[8, 50], [30, 7], [38, 7], [16, 50]], "rgba(255,255,255,0.12)", 0);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8;
      ctx.strokeRect(8, 7, 48, 51);
    },
    /* Board of black-and-white wanted posters. */
    wantedBoard(ctx, p, o) {
      box(ctx, 3, 5, 58, 54, "#5a4a3a", 3);
      [[8, 9], [34, 9], [8, 33], [34, 33]].forEach(([x, y], i) => {
        ctx.save();
        ctx.translate(x + 11, y + 11);
        ctx.rotate([-0.04, 0.05, 0.03, -0.06][i]);
        box(ctx, -11, -11, 22, 22, "#ece8de", 1.5);
        ctx.fillStyle = INK;
        ctx.fillRect(-9.5, -9.5, 19, 5);
        fit(ctx, "WANTED", 0, -7, 17, 4, { color: C.cream });
        ctx.beginPath();
        ctx.arc(0, 10.5, 7, Math.PI, 0);
        ctx.fillStyle = "#55595f";
        ctx.fill();
        disc(ctx, 0, 0.5, 4.2, "#6e7278", 1);
        disc(ctx, 0, -9, 1.3, C.red, 0.8);
        ctx.restore();
      });
    },
    /* A big roll-up garage door, ribbed metal, closed; a painted plate if given text. */
    garageDoor(ctx, p, o) {
      ctx.fillStyle = "#a9aeb3";
      ctx.fillRect(0, 6, 64, 58);
      for (let y = 6; y < 64; y += 7) {
        ctx.fillStyle = "#c6cace";
        ctx.fillRect(0, y + 1, 64, 2);
        ctx.fillStyle = "#7d8288";
        ctx.fillRect(0, y + 5, 64, 1.4);
        ctx.fillStyle = INK;
        ctx.fillRect(0, y + 6.4, 64, 0.8);
      }
      ctx.fillStyle = "rgba(120,70,30,0.22)";
      ctx.fillRect(0, 54, 64, 10);
      seg(ctx, 0, 6, 64, 6, INK, 3);
      box(ctx, 26, 55, 12, 4, "#3a3d42", 1.4);
      if (o.text) {
        drop(ctx, 6, 17, 52, 20, 2);
        box(ctx, 6, 17, 52, 20, C.amber, 2.5);
        fit(ctx, o.text, 32, 27, 48, 16, { color: INK });
      }
    },
    /* Paper wall calendar: a picture, the month, days crossed off in red. */
    calendar(ctx, p, o) {
      const v = o.v || 0;
      drop(ctx, 12, 4, 40, 56);
      box(ctx, 12, 4, 40, 56, C.cream, 2.5);
      ctx.fillStyle = v ? "#f0b070" : "#7fb0d8";
      ctx.fillRect(14.5, 8, 35, 18);
      ctx.beginPath();
      ctx.moveTo(14.5, 26);
      ctx.quadraticCurveTo(26, 12, 38, 26);
      ctx.fillStyle = C.olive;
      ctx.fill();
      disc(ctx, 42, 13, 3.5, C.gold, 1);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(14.5, 8, 35, 18);
      [20, 32, 44].forEach((x) => disc(ctx, x, 5, 1.8, "#2b2d31", 0));
      ctx.fillStyle = C.red;
      ctx.fillRect(14.5, 28, 35, 5);
      const cw = 35 / 7;
      ctx.strokeStyle = "rgba(60,60,60,0.5)";
      ctx.lineWidth = 0.8;
      for (let i = 0; i <= 7; i++) seg(ctx, 14.5 + i * cw, 34, 14.5 + i * cw, 58, "rgba(60,60,60,0.5)", 0.8);
      for (let j = 0; j <= 4; j++) seg(ctx, 14.5, 34 + j * 6, 49.5, 34 + j * 6, "rgba(60,60,60,0.5)", 0.8);
      const done = 10 + v * 7;
      for (let k = 0; k < done; k++) {
        const x = 14.5 + (k % 7) * cw;
        const y = 34 + Math.floor(k / 7) * 6;
        seg(ctx, x + 1, y + 1, x + cw - 1, y + 5, "#c42d24", 1.4);
        seg(ctx, x + cw - 1, y + 1, x + 1, y + 5, "#c42d24", 1.4);
      }
    },
    /* Wall rack of long tools: a rake, a shovel, an axe. */
    toolWall(ctx, p, o) {
      box(ctx, 0, 6, 64, 6, C.tan, 2);
      const tools = [rake, shovel, axe];
      const v = o.v || 0;
      [13, 32, 51].forEach((x, i) => {
        disc(ctx, x, 9, 1.3, "#2b2d31", 0);
        tools[(i + v) % 3](ctx, x);
      });
    },
    /* A huge round saw blade hung as a sign, a red band with words across it if given. */
    sawBlade(ctx, p, o) {
      seg(ctx, 32, 0, 32, 5, INK, 2);
      const cx = 32;
      const cy = 31;
      const pts = [];
      for (let i = 0; i < 20; i++) {
        const a = (i * TAU) / 20;
        pts.push([cx + Math.cos(a) * 23, cy + Math.sin(a) * 23]);
        pts.push([cx + Math.cos(a + 0.1) * 28, cy + Math.sin(a + 0.1) * 28]);
      }
      ctx.fillStyle = "rgba(15,16,18,0.4)";
      ctx.beginPath();
      ctx.arc(cx + 3, cy + 3, 26, 0, TAU);
      ctx.fill();
      poly(ctx, pts, "#c3c7cb", 2.2);
      disc(ctx, cx, cy, 19, "#aeb3b8", 1.4);
      ctx.fillStyle = "rgba(150,80,30,0.4)";
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy + 9, 4, 2.5, 0.4, 0, TAU);
      ctx.ellipse(cx + 12, cy - 11, 3, 2, -0.3, 0, TAU);
      ctx.fill();
      disc(ctx, cx, cy, 4.5, "#2b2d31", 1.6);
      if (o.text) {
        drop(ctx, 2, 23, 60, 16, 2);
        box(ctx, 2, 23, 60, 16, C.red, 2.5);
        fit(ctx, o.text, 32, 31, 56, 12, { color: C.cream });
      }
    },
  };

  /** Draw one decor face: an opaque fill, the building's wall, the decor, the tile's ink border. */
  function face(kind) {
    return (ctx, w, h, palette, opts) => {
      const p = palette || {};
      const o = opts || {};
      ctx.fillStyle = p.wall || "#777777";
      ctx.fillRect(0, 0, w, h);
      D3.wallBase(ctx, w, h, p, o.style);
      ctx.save();
      if (w !== 64 || h !== 64) ctx.scale(w / 64, h / 64);
      DECOR[kind](ctx, p, o);
      ctx.restore();
      D3.border(ctx, w, h);
    };
  }
  function registerAll() {
    Object.keys(DECOR).forEach((k) => D3.registerTexture(k, face(k)));
  }
  registerAll();
  // faces drawn before the web fonts arrived used a fallback: draw them again once the fonts are in
  if (root.document && root.document.fonts && root.document.fonts.ready) root.document.fonts.ready.then(registerAll, () => {});

  ZSR.Decor = {
    KINDS: Object.keys(DECOR),
    VARIANTS,
    /** The texture opts for one layout decor entry: everything but x, y, tex and face (that is, its
        text), plus a variant for the kinds that have them, picked from the tile so it never changes. */
    optsFor(d) {
      const o = {};
      Object.keys(d).forEach((k) => {
        if (!SKIP[k] && d[k] != null) o[k] = d[k];
      });
      const n = VARIANTS[d.tex];
      if (n > 1) o.v = (((d.x * 73856093) ^ (d.y * 19349663)) >>> 0) % n;
      return Object.keys(o).length ? o : undefined;
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
