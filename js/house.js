/* The cabin, mixed into ZSR.Interior with the yard (js/yard.js): the Hollis family's house, walked
   straight into from the yard. WORLD.HOUSE has its plan (walls, doors, windows, rooms, the notes on
   its walls and what E does inside); this file puts it in the yard grid and furnishes it.
   - Under its roof the engine draws a ceiling, and from outside a hip roof over its outline (setHouse).
   - Its two outside doors open and close with E. Walkers pound on a closed one until it breaks and walk
     through an open one. They smash windows and climb in; you cannot climb out. E at a broken door or
     window fixes it for scrap; the computer fixes them all. Doors and windows get stronger from the
     computer's House tab (WORLD.HOUSE_UPGRADES).
   - Some of every wave's walkers make for the cabin, not for you: they get in and wait inside.
   - E inside: the office computer (the build menu), the pantry shelves (food and storage, on the read
     panel), the radio shelf in the dining room (today's news, and the old days), the typewriter (typing practice), the big bed (rest: full
     health for a minute of the calm), and the dinner bell on the porch (calls the next wave now).
   - The notes the Hollis family left are read up close, like wall signs (ZSR.houseNoteText).
   - The crew shelter in the office closet in a wave (CREW_RULES.shelter, js/crew.js): some raiders go
     for it (yardWalkerGoal) and force its shut door like any inner door.
   Art: js/houseart.js. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const D3 = () => ZSR.Draw3;
  const W = () => ZSR.WORLD;
  const DIRS = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
  const DEFAULT_LOOK = { floor: "hWood", c: "#d8cfc0", pat: "plain" };

  /* ---------- How each room looks: its floor and its walls ---------- */
  const LOOK = {
    porch: { floor: "hPorch" },
    office: { floor: "hCarpetTan", c: "#c9b48a", pat: "stripe" },
    officeCloset: { floor: "hWood", c: "#c9b48a", pat: "plain" },
    foyer: { floor: "hWood", c: "#a8b89a", pat: "panel" },
    dining: { floor: "hWood", c: "#d9c39a", pat: "panel" },
    pingpong: { floor: "hWood", c: "#9a7a58", pat: "wood" },
    kitchen: { floor: "hTile", c: "#e9e4d6", pat: "tile" },
    pantry: { floor: "hWood", c: "#d8cfc0", pat: "plain" },
    hallway: { floor: "hWood", c: "#d8cfc0", pat: "plain" },
    living: { floor: "hCarpetGreen", c: "#c7b79a", pat: "plain" },
    masterBath: { floor: "hBathTile", c: "#cfe0e4", pat: "tile" },
    master: { floor: "hCarpetRose", c: "#d8c3c3", pat: "dots" },
    gusRoom: { floor: "hCarpetBlue", c: "#8fa3b8", pat: "stripe" },
    bath: { floor: "hBathTile", c: "#d6e6d8", pat: "tile" },
    finnRoom: { floor: "hCarpetTan", c: "#b9c9a0", pat: "dots" },
    linenCloset: { floor: "hWood", c: "#d8cfc0", pat: "plain" },
    lucyRoom: { floor: "hCarpetRose", c: "#e8c4d0", pat: "dots" },
    playroom: { floor: "hCarpetBlue", c: "#e6d9a8", pat: "plain" },
    coatCloset: { floor: "hWood", c: "#d8cfc0", pat: "plain" },
    toyCloset: { floor: "hWood", c: "#e6d9a8", pat: "plain" },
  };
  // what each note on a wall looks like (hNote kinds; the porch's is the carved sign, hPlaque)
  const NOTE_KIND = { foyer: "hooks", office: "map", dining: "chart", kitchen: "cork", pantry: "labels", pingpong: "score", masterBath: "mirror", master: "photo", living: "marks", gusRoom: "keepout", finnRoom: "plan", lucyRoom: "drawing", playroom: "chalk", coatCloset: "list" };

  /* ---------- Furniture, room by room, in house tiles ----------
     f.low(x0, y0, w, h, def): knee-high solid furniture you can see and shoot over (one def per piece);
     f.prop(x, y, art, o): a sprite, o = { scale (height in tiles, under 1 under the ceiling), lift, solid,
     cover, rot (a 3D model of its art faces that way: the porch's) }. Every room keeps its doorways, its note and what
     E uses within reach. */
  const wood = "#8a6a46";
  const desk = () => ({ h: 0.42, tex: { name: "hDeskSide", opts: { c: wood } }, top: "#9a7650" });
  const counter = () => ({ h: 0.48, tex: { name: "hCounter", opts: { c: "#7a8f7a" } }, top: "#d8d2c0" });
  const bed = (c, top) => ({ h: 0.32, tex: { name: "hBedSide", opts: { c } }, top });
  const dresser = (c) => ({ h: 0.45, tex: { name: "hDresser", opts: { c } }, top: D3().shade(c, 18) });
  const tub = () => ({ h: 0.4, tex: "hTub", top: "#f1efe8" });
  const FURNISH = {
    porch(f) {
      const rail = { h: 0.42, tex: "hPorchRail" }; // see-through: no slab on top
      [6, 7, 9].forEach((x) => f.low(x, 0, 1, 1, rail));
      // the posts, the bell and the bench are 3D models (js/yardmodels2.js), turned to face out of the porch (north,
      // rot); the bench's back stands against the cabin wall, June's seat on it (CREW june's porch post)
      const out = -Math.PI / 2;
      f.prop(6.12, 0.12, "hPost", { scale: 0.98, rot: out });
      f.prop(10.88, 0.12, "hPost", { scale: 0.98, rot: out });
      f.prop(10.5, 0.45, "hBell", { scale: 0.95, solid: true, cover: false, rot: out });
      f.prop(6.5, 1.86, "hBench", { scale: 0.34, solid: true, rot: out });
    },
    foyer(f) {
      f.prop(6.5, 5.45, "hCoatRack", { scale: 0.9, solid: true, cover: false });
      f.prop(10.5, 3.45, "hPlant", { scale: 0.55, solid: true });
    },
    office(f) {
      f.low(1, 1, 2, 1, desk());
      f.prop(2.0, 1.4, "hComputer", { scale: 0.36, lift: 0.42 });
      f.prop(2.0, 2.25, "hChair", { scale: 0.5 });
      f.prop(4.5, 1.4, "hBookcase", { scale: 0.95, solid: true });
      f.prop(1.45, 4.45, "hLamp", { scale: 0.9, solid: true, cover: false });
    },
    officeCloset(f) {
      // the big battery the office computer runs off (the office note), against the end wall and not solid:
      // the closet's three tiles stay free, the crew's shelter in a wave (CREW_RULES.shelter, js/crew.js)
      f.prop(1.16, 6.5, "yDrum", { opts: { c: "#2f3a44" }, scale: 0.4 });
    },
    dining(f) {
      f.low(13, 2, 2, 2, { h: 0.4, tex: { name: "hTableSide", opts: { c: "#8a5a2e" } }, top: "#9a6a3e" });
      [[12.55, 2.5], [12.55, 3.5], [15.45, 2.5], [15.45, 3.5]].forEach(([x, y]) => f.prop(x, y, "hChair", { scale: 0.5 }));
      // the radio and June's ledger in the corner (WORLD.HOUSE.spots.radio). The room is a one-tile ring
      // around the table, so this is the only solid thing on the floor: a second one would wall off a pocket.
      // The set grows with the Radio room; from level 2 Pip's map and list of voices take over the table,
      // and at 3 a cork board of the town stands on it too.
      const lvl = Math.min(3, (State().save && State().save.rooms.radio) || 0);
      f.prop(15.5, 1.45, "hRadioShelf", { scale: 0.6, solid: true, opts: { lvl } });
      if (lvl >= 3) f.prop(13.55, 2.45, "hRadioBoard", { scale: 0.62, lift: 0.4, cover: false });
      if (lvl >= 2) f.prop(14.2, 3.15, "hRadioTable", { scale: 0.5, lift: 0.4, cover: false });
    },
    pingpong(f) {
      f.low(7, 9, 2, 3, { h: 0.38, tex: "hPingPong", top: "#2f6b4a" });
      f.prop(6.6, 14.5, "hArmchair", { scale: 0.5, solid: true });
      f.prop(10.5, 15.45, "hBookcase", { scale: 0.95, solid: true });
      f.prop(6.5, 7.5, "hBoxes", { scale: 0.45, solid: true });
      f.prop(10.45, 8.5, "hLamp", { scale: 0.9, solid: true, cover: false });
    },
    hallway(f) {
      f.prop(17.5, 9.5, "hPlant", { scale: 0.55, solid: true });
    },
    kitchen(f) {
      f.low(12, 6, 1, 1, counter());
      f.low(14, 6, 1, 1, counter());
      f.low(15, 6, 1, 1, { h: 0.48, tex: "hStove", top: "#2f3136" });
      f.low(15, 8, 1, 2, counter());
      f.low(13, 10, 2, 1, counter());
      f.prop(12.5, 8.5, "hFridge", { scale: 0.92, solid: true });
      f.prop(15.6, 11.6, "hDogBowl", { scale: 0.12 });
    },
    pantry(f) {
      f.prop(17.5, 6.4, "hShelves", { scale: 0.95, solid: true });
      f.prop(18.5, 6.4, "hShelves", { scale: 0.95, solid: true });
    },
    living(f) {
      f.low(14, 16, 3, 1, { h: 0.36, tex: { name: "hSofaSide", opts: { c: "#7a4a3a" } }, top: "#7a4a3a" });
      f.prop(15.5, 19.45, "hTV", { scale: 0.6, solid: true });
      f.prop(16.5, 19.5, "hPlant", { scale: 0.55, solid: true });
      f.prop(12.5, 17.5, "hArmchair", { scale: 0.5, solid: true });
      f.prop(12.45, 19.45, "hLamp", { scale: 0.9, solid: true, cover: false });
      f.prop(18.5, 17.5, "hPlant", { scale: 0.55, solid: true }); // where the radio shelf stood: Pip carried it to the dining room
      f.prop(16.5, 13.4, "hBookcase", { scale: 0.95, solid: true });
    },
    masterBath(f) {
      f.prop(1.5, 8.4, "hVanity", { scale: 0.8, solid: true });
      f.low(3, 8, 2, 1, tub());
      f.prop(4.5, 10.5, "hToilet", { scale: 0.4, solid: true });
      f.prop(1.5, 10.5, "hHamper", { scale: 0.3, solid: true });
    },
    master(f) {
      f.low(1, 14, 2, 2, bed("#6a7fa0", "#e8e2d4"));
      f.low(4, 15, 1, 1, dresser("#8a5a3e"));
      f.prop(4.5, 12.4, "hWardrobe", { scale: 0.95, solid: true });
      f.prop(3.5, 15.55, "hLamp", { scale: 0.9, solid: true, cover: false });
    },
    gusRoom(f) {
      f.low(22, 6, 2, 1, bed("#3a4a6a", "#5a6a8a"));
      f.prop(20.5, 6.5, "hGuitar", { scale: 0.65 });
      f.low(23, 9, 1, 1, dresser("#5a4a3a"));
      f.prop(21.5, 9.5, "hHamper", { scale: 0.3, solid: true });
    },
    bath(f) {
      f.prop(21.5, 11.4, "hVanity", { scale: 0.8, solid: true });
      f.prop(23.5, 11.5, "hToilet", { scale: 0.4, solid: true });
      f.low(22, 13, 2, 1, tub());
    },
    finnRoom(f) {
      f.low(22, 17, 2, 1, bed("#a04a3a", "#c06a5a"));
      f.low(22, 15, 1, 1, desk());
      f.prop(20.5, 15.4, "hBookcase", { scale: 0.95, solid: true });
      f.prop(20.6, 17.5, "hToys", { scale: 0.3 });
    },
    linenCloset(f) {
      f.prop(21.5, 19.5, "hBoxes", { scale: 0.6, solid: true });
      f.prop(22.5, 19.5, "hHamper", { scale: 0.3, solid: true });
      f.prop(23.5, 19.5, "hBoxes", { scale: 0.5, solid: true });
    },
    lucyRoom(f) {
      f.low(22, 21, 2, 1, bed("#d07aa0", "#e8a0c0"));
      f.prop(21.4, 21.5, "hTeddy", { scale: 0.3 });
      f.prop(20.6, 23.4, "hToys", { scale: 0.3 });
      f.low(22, 23, 1, 1, dresser("#e6dfcc"));
    },
    playroom(f) {
      f.low(15, 21, 1, 1, desk());
      f.prop(15.5, 21.4, "hTypewriter", { scale: 0.24, lift: 0.42 });
      f.prop(12.6, 22.5, "hToys", { scale: 0.3 });
      f.prop(14.5, 24.45, "hTeddy", { scale: 0.3 });
      f.low(12, 24, 1, 1, { h: 0.45, tex: "hShelfLow", top: wood });
    },
    toyCloset(f) {
      f.prop(18.5, 24.5, "hBoxes", { scale: 0.6, solid: true });
      f.prop(17.5, 24.45, "hToys", { scale: 0.3 });
    },
  };

  Object.assign(ZSR.Interior, {
    /** Put the cabin into the yard grid just loaded (doors, windows, what each one can take), tell the
        engine where its roof is, and note where raiders wait. Called once on entering the yard. */
    houseLoad() {
      const H = W().HOUSE;
      const S = State();
      const [ax, ay] = H.at;
      const saved = (S.save.house && S.save.house.hp) || {};
      this.hx = ax;
      this.hy = ay;
      this.barriers = {}; // "x,y" (yard) -> { kind: "door" | "window", hp, door, back, hx, hy }
      this.houseRoom = {}; // "hx,hy" (house) -> room key
      Object.entries(H.rooms).forEach(([k, r]) => {
        for (let y = r.rect[1]; y <= r.rect[3]; y++) for (let x = r.rect[0]; x <= r.rect[2]; x++) this.houseRoom[x + "," + y] = k;
      });
      this.raidSpots = [];
      H.grid.forEach((line, hy) => [...line].forEach((ch, hx) => {
        const x = ax + hx;
        const y = ay + hy;
        const key = x + "," + y;
        if (ch === "B" || ch === "J") {
          const max = S.houseMax("doors");
          const hp = saved[key] != null ? Math.min(max, saved[key]) : max;
          const d = { x, y, open: false, house: true, back: ch === "J", broken: hp <= 0 };
          if (d.broken) d.open = true;
          this.grid[y][x] = d.open ? "D" : "O";
          this.doors.push(d);
          this.barriers[key] = { kind: "door", hp: Math.max(0, hp), door: d, back: d.back, hx, hy };
        } else if (ch === "D") {
          // an inner door: walkers cannot open it, but they force a shut one open after a while
          const d = { x, y, open: true };
          this.doors.push(d);
          this.barriers[key] = { kind: "inner", hp: W().DEFENSE.innerDoorHp, max: W().DEFENSE.innerDoorHp, door: d, hx, hy };
        } else if (ch === "W") {
          const max = S.houseMax("windows");
          const hp = saved[key] != null ? Math.min(max, saved[key]) : max;
          this.barriers[key] = { kind: "window", hp: Math.max(0, hp), hx, hy };
          this.grid[y][x] = hp > 0 ? "W" : "U";
        } else if (ch === "." && this.houseRoom[hx + "," + hy] && !/Closet|porch/.test(this.houseRoom[hx + "," + hy])) {
          this.raidSpots.push({ x: x + 0.5, y: y + 0.5 });
        }
      }));
      const inHouse = (x, y) => {
        const line = H.grid[y - ay];
        return !!line && x >= ax && x - ax < line.length && line[x - ax] !== " ";
      };
      this.setHouse(inHouse, { eave: 1, pitch: 0.42, rise: 1.05, roofTex: "hRoof", ceiling: "hCeiling" });
      this.raidToast = false;
      this.raidToastAt = null;
      this.readSpot = null;
      this.houseStrength();
    },

    /** Floors, wall faces, furniture and the notes on the walls. Runs with every yard rebuild (dressYard). */
    dressHouse() {
      const H = W().HOUSE;
      const ax = this.hx;
      const ay = this.hy;
      // floors: each room's own; the porch boards; wood in the doorways
      H.grid.forEach((line, hy) => [...line].forEach((ch, hx) => {
        if (ch === " ") return;
        const room = this.houseRoom[hx + "," + hy];
        this.setFloor(ax + hx, ay + hy, ch === "," ? "hPorch" : (LOOK[room] || DEFAULT_LOOK).floor || "hWood");
      }));
      this.houseFaces();
      // furniture
      const I = this;
      const tex = (t) => (t && typeof t === "object" && !t.width ? D3().texture(t.name, I.palette, t.opts) : t);
      const f = {
        low(x0, y0, w, h, o) {
          const def = { h: o.h, tex: tex(o.tex), top: o.top, cover: !!o.cover };
          for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) I.addLow(ax + x, ay + y, def);
          return def;
        },
        prop(x, y, art, o) {
          return I.addProp(Object.assign({ x: ax + x, y: ay + y, art }, o || {}));
        },
      };
      Object.keys(H.rooms).forEach((k) => FURNISH[k] && FURNISH[k](f));
      // the notes on the walls, read up close
      H.notes.forEach((n) => this.signs.push({ x: ax + n.wall[0], y: ay + n.wall[1], face: n.face, id: "house:" + n.id, kind: "hnote", note: n.id }));
    },

    /** Every wall face of the cabin: siding, doors and windows outside (as strong and as broken as they
        are now), each room's own wallpaper inside, and the notes. Runs again when a door or a window
        cracks, breaks, is fixed or gets stronger. */
    houseFaces() {
      const H = W().HOUSE;
      const S = State();
      const ax = this.hx;
      const ay = this.hy;
      const pal = this.palette;
      const T = (name, opts) => D3().texture(name, pal, opts);
      const lv = { door: S.save.house.doors || 0, window: S.save.house.windows || 0 };
      const notes = {};
      H.notes.forEach((n) => (notes[n.wall[0] + "," + n.wall[1] + "," + n.face] = n));
      const lookAt = (hx, hy) => {
        const room = this.houseRoom[hx + "," + hy];
        if (room) return LOOK[room] || DEFAULT_LOOK;
        // a doorway: the look of a room beside it
        for (const [dx, dy] of Object.values(DIRS)) {
          const r = this.houseRoom[hx + dx + "," + (hy + dy)];
          if (r && r !== "porch") return LOOK[r] || DEFAULT_LOOK;
        }
        return DEFAULT_LOOK;
      };
      H.grid.forEach((line, hy) => [...line].forEach((ch, hx) => {
        if (!"HW#BJ".includes(ch)) return;
        const key = ax + hx + "," + (ay + hy);
        const b = this.barriers[key];
        const dmg = !b ? 0 : b.kind === "window" && b.hp <= 0 ? 2 : b.hp < b.max * 0.5 ? 1 : 0;
        const faces = {};
        Object.entries(DIRS).forEach(([side, [dx, dy]]) => {
          const n = (H.grid[hy + dy] || "")[hx + dx];
          const outside = n == null || n === " " || n === ",";
          const look = outside ? null : lookAt(hx + dx, hy + dy);
          const note = notes[hx + "," + hy + "," + side];
          if (note) faces[side] = outside ? T("hPlaque") : T("hNote", { c: look.c, pat: look.pat, kind: NOTE_KIND[note.id] || "list" });
          else if (ch === "W") faces[side] = outside ? T("hWinOut", { lvl: lv.window, dmg }) : T("hWinIn", { c: look.c, lvl: lv.window, dmg });
          else if (ch === "B" || ch === "J") faces[side] = outside ? T("hDoorOut", { lvl: lv.door, dmg, back: ch === "J" ? 1 : 0 }) : T("hDoorIn", { c: look.c, lvl: lv.door, dmg, back: ch === "J" ? 1 : 0 });
          else faces[side] = outside ? T("hSiding") : T("hPaper", { c: look.c, pat: look.pat });
        });
        this.tileTex[key] = faces;
      }));
    },

    /* ---------- Doors and windows: strength, breaking, fixing ---------- */
    /** Full strength of every door and window at today's levels; a level up mends them all. */
    houseStrength() {
      const S = State();
      const max = { door: S.houseMax("doors"), window: S.houseMax("windows") };
      let changed = false;
      Object.entries(this.barriers || {}).forEach(([key, b]) => {
        if (b.kind === "inner") return;
        const m = max[b.kind];
        if (b.max != null && m > b.max) {
          b.hp = m; // stronger now: mended and refit
          this.mendBarrier(key, b);
          changed = true;
        }
        b.max = m;
        if (b.hp > m) b.hp = m;
      });
      return changed;
    },
    /** Strength to save: "x,y" -> hp (0 is broken). */
    houseState() {
      const out = {};
      Object.entries(this.barriers || {}).forEach(([k, b]) => b.kind !== "inner" && (out[k] = Math.max(0, Math.round(b.hp))));
      return out;
    },
    /** Doors and windows below full strength: { broken, cracked }. */
    houseDamage() {
      let broken = 0;
      let cracked = 0;
      Object.values(this.barriers || {}).forEach((b) => {
        if (b.kind === "inner") return;
        if (b.hp <= 0) broken++;
        else if (b.hp < b.max) cracked++;
      });
      return { broken, cracked };
    },
    /** A walker that cannot reach its goal: the shortest way there if shut doors and whole windows gave
        way. { path: to the first of them (empty once beside it), target: its middle }, or null (no way
        even so: it claws at the fence like before). */
    yardBarrier(z, goal) {
      if (z.practice) return { path: [], target: null }; // the tutorial's practice walker waits; it never claws or breaks in
      const gw = this.gw;
      const gh = this.gh;
      const m = this.solidMask();
      const blocks = this.barriers || {};
      // outside the fence, the holes too far from it stay shut to it here too (js/yard.js yardPathBlock)
      const far = this.yardPathBlock(z);
      const shut = far && far.length ? new Set(far) : null;
      const isBarrier = (x, y) => {
        const b = blocks[x + "," + y];
        return !!b && b.hp > 0 && !(b.door && b.door.open);
      };
      const sx = Math.floor(z.x);
      const sy = Math.floor(z.y);
      const tx = Math.floor(goal.x);
      const ty = Math.floor(goal.y);
      const prev = new Int32Array(gw * gh).fill(-2);
      const q = [sy * gw + sx];
      prev[q[0]] = -1;
      let found = -1;
      for (let i = 0; i < q.length; i++) {
        const v = q[i];
        const x = v % gw;
        const y = (v / gw) | 0;
        if (x === tx && y === ty) {
          found = v;
          break;
        }
        for (const [dx, dy] of Object.values(DIRS)) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
          const k = ny * gw + nx;
          if (prev[k] !== -2 || (shut && shut.has(k)) || (m[k] && !isBarrier(nx, ny))) continue;
          prev[k] = v;
          q.push(k);
        }
      }
      if (found < 0) return null;
      const tiles = [];
      for (let v = found; v >= 0 && prev[v] !== -1; v = prev[v]) tiles.push(v);
      tiles.reverse();
      const at = tiles.findIndex((v) => isBarrier(v % gw, (v / gw) | 0));
      if (at < 0) return null;
      const center = (v) => [(v % gw) + 0.5, ((v / gw) | 0) + 0.5];
      return { path: tiles.slice(0, at).map(center), target: center(tiles[at]) };
    },
    /** A walker claws at a door or window. False once there is nothing left to claw (broken, or opened). */
    yardHitBarrier(key, dmg) {
      const b = this.barriers && this.barriers[key];
      if (!b || b.hp <= 0 || (b.door && b.door.open)) return false;
      const before = b.hp;
      b.hp -= dmg;
      if (b.kind === "inner" && b.hp <= 0) {
        // forced open, not broken: it shuts again with E, as good as before
        b.hp = b.max;
        b.door.open = true;
        this.grid[b.door.y][b.door.x] = "D";
        this.maskDirty = true;
        this.walkers.forEach((w) => (w.pathT = 0));
        Audio().play("crunch");
        return false;
      }
      if (b.hp <= 0) {
        b.hp = 0;
        if (b.kind === "window") this.grid[b.hy + this.hy][b.hx + this.hx] = "U";
        else {
          b.door.open = true;
          b.door.broken = true;
          this.grid[b.door.y][b.door.x] = "D";
        }
        this.maskDirty = true;
        this.walkers.forEach((w) => (w.pathT = 0));
        this.houseFaces();
        this.toast(b.kind === "window" ? "A window is smashed in! They can climb into the cabin." : (b.back ? "The back door" : "The front door") + " is down! They are getting into the cabin.", 3);
        Audio().play("crunch");
        return false;
      }
      if (before >= b.max * 0.5 && b.hp < b.max * 0.5) this.houseFaces(); // the cracks show
      return true;
    },
    /** A broken window or door back in one piece (the grid and the look; not the strength). */
    mendBarrier(key, b) {
      if (b.kind === "window") this.grid[b.hy + this.hy][b.hx + this.hx] = "W";
      else if (b.door.broken) b.door.broken = false; // it stays open until someone shuts it
      this.maskDirty = true;
    },
    /** Fix one door or window for scrap. */
    repairBarrier(key) {
      const S = State();
      const b = this.barriers[key];
      if (!b || b.hp >= b.max) return false;
      const cost = W().SETTINGS.houseRepairScrap;
      if (S.save.scrap < cost) {
        this.toast("Not enough scrap. " + cost + " scrap fixes a door or a window.", 3);
        Audio().play("wrong");
        return false;
      }
      const [x, y] = key.split(",").map(Number);
      if (this.walkerOnTile(x, y)) {
        this.toast("Something is in the way. Clear it first.", 2.5);
        Audio().play("wrong");
        return false;
      }
      S.save.scrap -= cost;
      this.fixBarrier(key);
      Audio().play("buy");
      this.updateHud();
      if (this.hooks.onYardChanged) this.hooks.onYardChanged();
      return true;
    },
    /** A door or window back at full strength and in one piece (the player's repair above, and Tomas's
        cabin job in js/crew.js). */
    fixBarrier(key) {
      const b = this.barriers[key];
      if (!b) return false;
      b.hp = b.max;
      this.mendBarrier(key, b);
      this.houseFaces();
      return true;
    },
    /** Fix every door and window the player can afford (the computer's button). Returns how many. */
    repairHouse() {
      let n = 0;
      for (const [key, b] of Object.entries(this.barriers || {})) {
        if (b.hp >= b.max) continue;
        if (!this.repairBarrier(key)) break;
        n++;
      }
      if (n) this.toast("Fixed " + n + " door" + (n > 1 ? "s and windows" : " or window") + ".", 3);
      return n;
    },
    /** E at a door of the cabin: a broken one is fixed (it cannot shut), any other opens and shuts. */
    yardDoor(d) {
      if (!d.house || !d.broken) return false;
      this.repairBarrier(d.x + "," + d.y);
      return true;
    },
    yardDoorHint(d) {
      if (!d.house) return null;
      if (d.broken) return "Press E to fix the broken door (" + W().SETTINGS.houseRepairScrap + " scrap)";
      return d.open ? "Press E to shut the door" : "Press E to open the door";
    },

    /* ---------- Raiders: walkers that make for the cabin and wait inside ---------- */
    yardWalkerGoal(z) {
      if (z.wreck) return this.wreckGoal(z); // a wrecker: the van or a build once inside the fence (js/yardwreck.js)
      if (!z.raid) return null;
      const p = this.player;
      // you are inside, or close: it comes for you
      if (this.indoorAt(p.x, p.y) || Math.hypot(p.x - z.x, p.y - z.y) < 5) {
        z.raid = false;
        return null;
      }
      if (!z.raidSpot && this.raidSpots) {
        // some go for the crew in the shelter (CREW_RULES.raidShelterShare, js/crew.js): they force its shut door
        // like any inner door, and one among the crew too long hurts someone off-screen
        const shelter = this.crewShelterSpots();
        const share = (W().CREW_RULES && W().CREW_RULES.raidShelterShare) || 0;
        if (shelter.length && Math.random() < share) {
          z.raidSpot = shelter[Math.floor(Math.random() * shelter.length)];
          z.raidShelter = true;
        } else {
          // somewhere to stand: not on the furniture
          const open = this.raidSpots.filter((s) => !this.solidAt(s.x, s.y));
          if (open.length) z.raidSpot = open[Math.floor(Math.random() * open.length)];
        }
      }
      if (!z.raidSpot) return null;
      if (!z.inHouse && this.indoorAt(z.x, z.y)) {
        z.inHouse = true;
        if (!this.raidToast) {
          // once a wave (yard.js updateYard clears raidToast when a wave starts)
          this.raidToast = true;
          this.raidToastAt = this.time; // it counts as the yard's "waiting in the cabin" cue (js/yard.js)
          this.toast("Walkers got into the cabin. They wait in there: clear it out.", 3.5);
        }
      }
      return z.raidSpot;
    },
    /** Any walker standing inside the cabin. Raiders wait in there out of sight, so the wave label says so while you
        are out of it (yard.js updateYard): where they are, never how many (the owner took the counts out). */
    cabinWalkers() {
      return !!this.house && this.walkers.some((z) => this.inCabin(z.x, z.y));
    },
    /** Inside the cabin's walls: under its roof, off the porch (one on the porch is in plain sight). */
    inCabin(x, y) {
      return this.indoorAt(x, y) && (this.houseRoom || {})[Math.floor(x) - this.hx + "," + (Math.floor(y) - this.hy)] !== "porch";
    },
    /** The wave is held open by walkers in the cabin: all of its walkers are out and every one left stands inside
        it (a raider at its spot waits there until you come in or near). The cues say so: a toast every
        CABIN_CUE_SECS (yard.js), the van, the bed and the computer. */
    cabinHoldsWave() {
      const ph = this.phase;
      if (!ph || ph.kind !== "wave" || ph.spawned < ph.total || !this.walkers.length || !this.house) return false;
      return this.walkers.every((z) => this.inCabin(z.x, z.y));
    },

    /* ---------- What E does in and around the cabin ---------- */
    houseFacing(cand) {
      const p = this.player;
      const H = W().HOUSE;
      Object.entries(H.spots).forEach(([name, [hx, hy]]) => cand.push({ kind: "spot", obj: name, x: this.hx + hx + 0.5, y: this.hy + hy + 0.5 }));
      // a window with damage, close by: fix it
      Object.entries(this.barriers || {}).forEach(([key, b]) => {
        if (b.kind !== "window" || b.hp >= b.max) return;
        const x = this.hx + b.hx + 0.5;
        const y = this.hy + b.hy + 0.5;
        if (Math.hypot(x - p.x, y - p.y) < 2) cand.push({ kind: "pane", obj: key, x, y });
      });
    },
    houseInteract(f) {
      const D = W().DEFENSE;
      const ph = this.phase;
      const inWave = ph && ph.kind === "wave";
      if (f.kind === "pane") return this.repairBarrier(f.obj);
      const name = f.obj;
      const busy = () => {
        this.toast(this.cabinHoldsWave() ? "Not now: walkers are still in the cabin." : "Not now: there are walkers about.", 2.5);
        Audio().play("wrong");
      };
      if (name === "bell") {
        if (inWave) {
          this.toast("They are already here.", 2);
          return;
        }
        if (this.yardHold) {
          // the first-run basics come first (js/tutorial.js)
          this.toast("Not yet. Finish the basics first.", 3);
          Audio().play("wrong");
          return;
        }
        ph.t = Math.min(ph.t, D.bellSeconds);
        ph.forced = true;
        // the bell always brings a wave: a calm that was going to stay quiet rolls again, among some and many
        // (a wave already rolled keeps its size and sides, so what Pip called stays true)
        if (!ph.next || ph.next.size === "none") ph.next = this.rollWave(true);
        this.toast("You ring the dinner bell. It carries a long way. Here they come.", 3.5);
        Audio().play("haven");
        this.updateHud();
      } else if (name === "bed") {
        const p = this.player;
        if (inWave) return busy();
        if (p.hp >= p.maxHp) {
          this.toast("You are not hurt. No need to rest.", 2.5);
          return;
        }
        if (ph.t < D.restMinCalm) {
          this.toast("Too close to the next wave to sleep.", 2.5);
          Audio().play("wrong");
          return;
        }
        ph.t -= D.restSeconds;
        p.hp = p.maxHp;
        p.hurt = 0;
        this.toast("You sleep in the big bed and wake up rested. Full health. The next wave is closer.", 3.5);
        Audio().play("correct");
        this.updateHud();
      } else if (name === "pantry") {
        this.readSpot = this.readSpot && this.readSpot.name === "pantry" ? null : { name: "pantry", x: f.x, y: f.y };
        Audio().play("click");
      } else {
        if (inWave) return busy();
        const hook = { computer: "onComputer", radio: "onRadio", typewriter: "onPractice" }[name];
        if (hook && this.hooks[hook]) this.hooks[hook]();
      }
    },
    houseHint(f) {
      const D = W().DEFENSE;
      const inWave = this.phase && this.phase.kind === "wave";
      if (f.kind === "pane") return "Press E to fix the window (" + W().SETTINGS.houseRepairScrap + " scrap)";
      const later = inWave && this.cabinHoldsWave() ? " (walkers are still in the cabin)" : " (clear the wave first)";
      switch (f.obj) {
        case "bell":
          return inWave ? "The dinner bell" : this.yardHold ? "The dinner bell (after the basics)" : "Press E to ring the dinner bell (the next wave comes now)";
        case "bed":
          return inWave ? "The big bed" + later : "Press E to rest: full health, but " + D.restSeconds + " seconds of the calm go by";
        case "pantry":
          return this.readSpot ? "Press E to put the list away" : "Press E to check the pantry and storage";
        case "computer":
          return inWave ? "The computer" + later : "Press E to use the computer: build and plan";
        case "radio":
          if (inWave) return "The radio and June's ledger" + later;
          if (!(State().save.rooms.radio > 0)) return "Press E to read June's journal (the radio needs the Radio room)";
          // a wrecked Radio tower hears nothing until it is fixed (js/yardwreck.js)
          if (!(State().roomLevel("radio") > 0)) return "Press E to read June's journal (the radio tower is wrecked: fix it in the yard)";
          return State().radioWaiting() ? "Press E to tune in: today's news" : "Press E to read June's journal and the radio again";
        case "typewriter":
          return inWave ? "The typewriter" + later : "Press E to practice typing";
        default:
          return "";
      }
    },
    /** The pantry list on the read panel: food, and everything in storage. */
    yardSpotPanel(spot) {
      const S = State();
      const s = S.save;
      const inv = Object.entries(W().ITEMS).filter(([k]) => (s.inventory[k] || 0) > 0).map(([k, it]) => s.inventory[k] + " " + it.name);
      const meta = [["Food", s.food + (s.food === 1 ? " crate" : " crates") + (s.food <= 0 ? ": the crew is hungry" : "")], ["Scrap", String(s.scrap)], ["Storage", inv.length ? inv.join(", ") : "nothing yet"], ["Medical kits packed", String(s.kits || 0)]];
      return { key: "spot:" + spot.name + ":" + meta.map((m) => m[1]).join("|"), kind: "lot", title: "Pantry and storage", status: "Day " + s.day, text: "Dan Hollis's shelf labels are still up. The crew keeps count of everything in here.", meta };
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
