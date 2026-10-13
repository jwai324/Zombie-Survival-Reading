/* Building mode for the first-person view, mixed into ZSR.Interior: entering a place
   from its layout (legend v2), the trip snapshot for a return visit, pickups, notes,
   the locked cache room, decor and landmarks, the building's HUD goal, and the M map
   (only what you have seen; kept in the trip and, once home, in the save).

   Legend v2 (see js/layouts.js):
     #  wall              W  wall with a window      .  floor
     D  door              L  locked cache door       E  entrance / exit
     S  shelf  X  crates  G  glass case (all full height)
     C  counter  K  table / desk  R  bed / bench (low: solid, see-through, shoot over)
     1 2 3 4  landmark anchors (floor + landmark prop)
     i item  c cache item  n note  z walker spawn  $ scrap pile
   Any other character is floor. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const D3 = () => ZSR.Draw3;
  const W = () => ZSR.WORLD;
  const rand = (a, b) => a + Math.random() * (b - a);
  const KEEP = "#W.DLESXGCKR"; // tiles that stay as they are; the markers become floor
  const DECOR_ON = "#WSXG"; // decor goes on plain wall-like tiles, never on a door, the exit or the cache door

  /* The map's look: flat comic fills on paper, ink walls */
  const INK = "#0f1012";
  const HEAD = "Oswald, Impact, 'Arial Narrow', sans-serif";
  const BODY = "Inter, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
  const COMIC = "Bangers, Impact, sans-serif";
  const MAP = { paper: "#e6dfcc", fog: "#c9bea2", label: "#fbfaf4", door: "#6b3f22", open: "#d9a21b", locked: "#c42d24", exit: "#7a9a3c", you: "#d4322a", note: "#f0c247", read: "#cfcabd" };
  const MAP_FLOOR = { tile: "#f3eee0", checker: "#ece5d3", linoleum: "#efe9da", carpet: "#ecd9d0", wood: "#eddcbf", concrete: "#e3e0d8", dirt: "#e6d5b8", grate: "#dcdfe0", grass: "#dce8c6", gravel: "#e2ddd2", planks: "#ecdab8" };
  const MAP_FIX = { S: "#66717d", X: "#b0702e", G: "#8fc8d4", C: "#d0b070", K: "#a8825a", R: "#dde3ea" }; // shelves, crates, glass cases, counters, tables, beds
  const LM_RING = { 1: "#2f5f9e", 2: "#b3261e", 3: "#7a9a3c", 4: "#6b4fa0" };
  /** Canvas text the player must read scales with the text size setting (Huge is about twice Normal). */
  const textScale = () => ({ large: 1.3, huge: 2 }[root.document && document.documentElement.getAttribute("data-size")] || 1);
  let floorColors = null; // Draw3 floor id -> map color
  let fogTile = null; // the fog's dots, one pattern tile (mapFog)

  Object.assign(ZSR.Interior, {
    /** The layout of a place: its own in ZSR.LAYOUTS (by id), else WORLD.TEMPLATES by its template. */
    layoutFor(loc) {
      const T = W().TEMPLATES || {};
      const L = ZSR.LAYOUTS || {};
      return L[loc.id] || T[loc.template] || L[loc.template] || T[loc.id];
    },

    enter(loc) {
      const S = State();
      const tpl = this.layoutFor(loc);
      this.mode = "building";
      this.loc = loc;
      this.layout = tpl;
      this.loadGrid(tpl.grid, tpl.palette);
      const st = S.locState(loc.id);
      const snap = S.trip && S.trip.rooms && S.trip.rooms[loc.id]; // this trip's earlier visit: exactly as you left it
      const notes = W().NOTES[loc.id].notes;
      let itemIdx = 0;
      let cacheIdx = 0;
      let noteIdx = 0;
      for (let y = 0; y < this.gh; y++) {
        for (let x = 0; x < this.gw; x++) {
          const ch = this.grid[y][x];
          const cx = x + 0.5;
          const cy = y + 0.5;
          if (ch === "i") {
            const key = loc.items[itemIdx];
            if (key) this.items.push({ spot: "i" + itemIdx, x: cx, y: cy, item: key, fromCache: false, taken: !S.itemAvailable(loc.id, "i" + itemIdx) });
            itemIdx++;
            this.grid[y][x] = ".";
          } else if (ch === "c") {
            const key = loc.cache[cacheIdx];
            if (key) this.items.push({ spot: "c" + cacheIdx, x: cx, y: cy, item: key, fromCache: true, taken: !!st.cacheTaken["c" + cacheIdx] });
            cacheIdx++;
            this.grid[y][x] = ".";
          } else if (ch === "n") {
            const n = notes[noteIdx++];
            if (n) this.notes.push({ x: cx, y: cy, id: n.id, found: n.found, unlocks: n.unlocks, reveals: n.reveals || [], read: S.noteRead(n.id) });
            this.grid[y][x] = ".";
          } else if (ch === "$") {
            this.piles.push({ x: cx, y: cy, value: Math.round(rand(W().SETTINGS.scrapPileValue[0], W().SETTINGS.scrapPileValue[1])), taken: false });
            this.grid[y][x] = ".";
          } else if (ch === "z") {
            this.spawns.push([cx, cy]);
            this.grid[y][x] = ".";
          } else if (ch === "D") {
            // every doorway is a real door: closed until you open it
            this.doors.push({ x, y, open: false });
            this.grid[y][x] = "O";
          } else if (ch === "L") {
            this.cacheDoor = { x, y, open: st.cacheOpened };
            if (st.cacheOpened) {
              this.doors.push({ x, y, open: true, cache: true });
              this.grid[y][x] = "D";
            }
          } else if (ch === "E") {
            this.exit = { x, y };
          } else if (ch >= "1" && ch <= "4") {
            this.landmarks.push({ id: ch, x, y, def: (tpl.landmarks && tpl.landmarks[ch]) || null });
            this.grid[y][x] = ".";
          } else if (!KEEP.includes(ch)) this.grid[y][x] = ".";
        }
      }
      this.dressLayout(tpl);
      this.markSeen(st.seen); // what you saw here before: saved, or earlier this trip
      this.mapOpen = false;
      const mask = this.solidMask();
      for (let y = 0; y < this.gh; y++) for (let x = 0; x < this.gw; x++) if (this.grid[y][x] === "." && !mask[y * this.gw + x]) this.floors.push([x + 0.5, y + 0.5]);

      // start just inside the entrance, facing in
      const ex = this.exit.x;
      const ey = this.exit.y;
      let start = [ex + 1.5, ey + 0.5, 0];
      for (const [dx, dy, a] of [[0, -1, -Math.PI / 2], [0, 1, Math.PI / 2], [1, 0, 0], [-1, 0, Math.PI]]) {
        const x = ex + dx;
        const y = ey + dy;
        if (x >= 0 && y >= 0 && x < this.gw && y < this.gh && !this.solidAt(x + 0.5, y + 0.5)) {
          start = [x + 0.5, y + 0.5, a];
          break;
        }
      }
      this.startPos = start;
      this.makePlayer(start[0], start[1], start[2]);
      if (this.fx.fullHealOnEntry) this.player.hp = this.player.maxHp;

      if (snap) {
        this.restore(snap);
      } else {
        const day = S.save.day;
        const n = W().SETTINGS.walkersPerLocation(loc.danger, day);
        // extra walkers go on floor tiles the player can actually reach (through the doors they can open,
        // not into the locked cache room), at least 6 steps from the door
        const reach = this.reachable(Math.floor(start[0]), Math.floor(start[1]), true);
        const far = this.floors.filter(([x, y]) => (reach.get(Math.floor(x) + "," + Math.floor(y)) || 0) >= 6);
        const spots = this.spawns.slice();
        while (spots.length < n && far.length) spots.push(far.splice(Math.floor(Math.random() * far.length), 1)[0]);
        const hpMult = 1 + 0.1 * (day - 1);
        spots.slice(0, n).forEach(([x, y], i) => {
          const type = loc.danger >= 4 && i === 0 ? "brute" : loc.danger >= 2 && i % 3 === 1 ? "runner" : loc.danger >= 3 && i % 4 === 3 ? "brute" : "walker";
          this.walkers.push(this.makeWalker(type, x, y, hpMult));
        });
      }
      S.tripLoc(loc.id).visits += 1;
      if (!S.trip.visited.includes(loc.id)) S.trip.visited.push(loc.id);
      this.hud.place.textContent = loc.name;
      this.hud.phase.classList.add("hidden");
      this.startLoop();
      this.syncMapBtn();
      const tips = snap ? ["Back inside. It is just as you left it. M is the map.", "Back inside. M is the map."] : ["Walkers inside. E reads notes and opens doors. B is the backpack. M is the map.", "Walkers inside. M is the map."];
      this.toastFit(tips.concat("M is the map."), 4.5);
    },
    /** A toast with the longest of `texts` that fits on the screen: Huge text on a small screen gets a short one. */
    toastFit(texts, secs) {
      const el = this.hud.toast;
      for (const t of texts) {
        this.toast(t, secs);
        if (!(el.offsetTop < 0)) return; // its layout box, before the pop animation's scale
      }
    },
    /** The HUD's Map button: shown in buildings only. Checked every frame (drawOverlay), so the yard hides it too. */
    syncMapBtn() {
      const btn = this.mapBtn || (this.mapBtn = document.getElementById("int-btn-map"));
      if (!btn) return;
      if (!this.mapBtnWired) {
        this.mapBtnWired = true;
        btn.addEventListener("click", () => {
          if (btn.blur) btn.blur(); // so Enter or Space cannot press it again later
          this.openMap();
        });
      }
      const on = this.mode === "building";
      if (this.mapBtnOn !== on) {
        this.mapBtnOn = on;
        btn.classList.toggle("hidden", !on);
      }
    },
    /** Mark tiles seen from a packed map (State.packSeen); a map for another layout size is ignored. */
    markSeen(packed) {
      const bits = packed ? State().unpackSeen(packed, this.gw, this.gh) : null;
      if (bits) for (let i = 0; i < bits.length; i++) if (bits[i]) this.seen[i] = 1;
    },

    /** Per-tile floors, wall decor and the four corner landmarks, from the layout's optional fields. */
    dressLayout(tpl) {
      const D = D3();
      if (tpl.floors && tpl.floorKey) {
        tpl.floors.forEach((row, y) => {
          for (let x = 0; x < row.length; x++) if (tpl.floorKey[row[x]]) this.setFloor(x, y, tpl.floorKey[row[x]]);
        });
      }
      // decor is drawn by registered textures (decor.js); until one exists for a key the wall stays plain.
      // Its opts are the entry's text, plus a per-tile variant for some kinds (Decor.optsFor)
      const Dec = ZSR.Decor;
      (tpl.decor || []).forEach((d) => {
        if (!this.grid[d.y] || !DECOR_ON.includes(this.grid[d.y][d.x]) || !D.hasTexture(d.tex)) return;
        let opts;
        if (Dec && Dec.optsFor) opts = Dec.optsFor(d);
        else {
          opts = Object.assign({}, d);
          delete opts.x;
          delete opts.y;
          delete opts.tex;
          delete opts.face;
          if (!Object.keys(opts).length) opts = undefined;
        }
        const tex = D.texture(d.tex, this.palette, opts);
        const k = d.x + "," + d.y;
        if (!d.face) this.tileTex[k] = tex;
        else {
          // only the named side of the tile (n / e / s / w) shows it
          const cur = this.tileTex[k];
          const faces = cur && typeof cur === "object" && !cur.width ? cur : {};
          faces[d.face] = tex;
          this.tileTex[k] = faces;
        }
      });
      // landmarks: their art when registered, a labeled stand-in until then. `size` is the height in tiles
      // (under the ceiling at most 0.98, the art keeping its shape); a big one with `foot: [w, h]` blocks
      // all w x h tiles around its anchor and is drawn w * 0.95 tiles wide whatever its height
      this.landmarks.forEach((lm) => {
        const def = lm.def || { name: "landmark " + lm.id };
        const opts = {};
        if (def.color) opts.color = def.color;
        if (def.label) opts.label = def.label;
        const foot = Array.isArray(def.foot) && def.foot[0] > 0 && def.foot[1] > 0 ? def.foot : null;
        const art = def.art && D.hasSprite(def.art) ? D.sprite(def.art, opts) : null;
        const img = art || D.sprite(foot && foot[0] > 1 ? "placeholderWide" : "placeholder", { name: def.name, color: def.color });
        lm.prop = this.addProp({ x: lm.x + 0.5, y: lm.y + 0.5, img, scale: def.size || 1.6, lift: 0, span: foot && foot[0] > 1 ? foot[0] * 0.95 : 0, foot, solid: !!def.solid, landmark: lm.id });
      });
    },

    /** What this building looks like right now, so a return visit on the same trip finds it unchanged. */
    snapshot() {
      return {
        walkers: this.walkers.map((z) => ({ type: z.type, x: z.x, y: z.y, hp: z.hp, maxHp: z.maxHp })),
        piles: this.piles.map((pl) => pl.taken),
        doors: this.doors.map((d) => ({ x: d.x, y: d.y, open: d.open })), // by position: the cache door joins the list late
        seen: State().packSeen(this.seen, this.gw, this.gh),
      };
    },
    restore(snap) {
      this.markSeen(snap.seen);
      snap.walkers.forEach((w) => {
        const z = this.makeWalker(w.type, w.x, w.y, 1);
        z.hp = w.hp;
        z.maxHp = w.maxHp;
        z.cool = 1;
        this.walkers.push(z);
      });
      snap.piles.forEach((taken, i) => {
        if (this.piles[i]) this.piles[i].taken = taken;
      });
      snap.doors.forEach((s) => {
        const d = this.doors.find((o) => o.x === s.x && o.y === s.y);
        if (!d) return;
        d.open = s.open;
        this.grid[d.y][d.x] = s.open ? "D" : "O";
      });
      this.maskDirty = true;
    },

    noteWasRead(noteObj) {
      noteObj.read = true;
      const added = State().reveal(noteObj.reveals);
      if (added.length) this.toast("New place on the map: " + added.map((id) => W().LOCATIONS.find((l) => l.id === id).name).join(", "), 4);
      this.updateHud();
    },

    updatePickups() {
      const p = this.player;
      const S = State();
      this.items.forEach((it) => {
        if (it.taken) return;
        if (Math.hypot(it.x - p.x, it.y - p.y) < 0.6) {
          it.taken = true;
          S.trip.cargo[it.item] = (S.trip.cargo[it.item] || 0) + 1;
          S.takeItem(this.loc.id, it.spot, it.fromCache);
          this.toast("Picked up: " + W().ITEMS[it.item].name, 2);
          Audio().play("pickup");
          this.updateHud();
        }
      });
      this.piles.forEach((pl) => {
        if (pl.taken) return;
        if (Math.hypot(pl.x - p.x, pl.y - p.y) < 0.6) {
          pl.taken = true;
          S.trip.scrap += pl.value;
          this.toast("+" + pl.value + " scrap", 1.5);
          Audio().play("pickup");
          this.updateHud();
        }
      });
    },

    /* ---------- Mode hooks (called by the core while mode is "building") ---------- */
    buildingUpdate() {
      this.updatePickups();
    },
    buildingFacing(cand) {
      this.notes.forEach((n) => cand.push({ kind: "note", obj: n, x: n.x, y: n.y }));
      if (this.cacheDoor && !this.cacheDoor.open) cand.push({ kind: "cache", obj: this.cacheDoor, x: this.cacheDoor.x + 0.5, y: this.cacheDoor.y + 0.5 });
      if (this.exit) cand.push({ kind: "exit", obj: this.exit, x: this.exit.x + 0.5, y: this.exit.y + 0.5 });
    },
    buildingInteract(f) {
      const S = State();
      if (f.kind === "note") {
        if (this.hooks.onReadNote) this.hooks.onReadNote(f.obj, this.loc);
      } else if (f.kind === "cache") {
        const note = W().NOTES[this.loc.id].notes.find((n) => n.unlocks === this.loc.id);
        if (note && S.noteRead(note.id)) {
          this.cacheDoor.open = true;
          this.grid[this.cacheDoor.y][this.cacheDoor.x] = "D";
          this.maskDirty = true;
          this.doors.push({ x: this.cacheDoor.x, y: this.cacheDoor.y, open: true, cache: true });
          S.tripLoc(this.loc.id).cacheOpened = true;
          this.toast("Opened: " + this.loc.cacheName + ".", 3);
          Audio().play("buy");
          this.updateHud();
        } else {
          this.toast("Locked. A note here says how.", 3);
          Audio().play("wrong");
        }
      } else if (f.kind === "exit") {
        if (this.hooks.onExit) this.hooks.onExit();
      }
    },
    buildingHint(f) {
      if (f.kind === "note") return "Press E to read the note";
      if (f.kind === "cache") return "Press E to open " + this.loc.cacheName;
      if (f.kind === "exit") return "Press E to leave for the van";
      return "";
    },
    buildingGoal() {
      const left = this.items.filter((i) => !i.taken && !i.fromCache).length;
      const cacheLeft = this.items.filter((i) => !i.taken && i.fromCache).length;
      const cacheState = this.cacheDoor ? (this.cacheDoor.open ? "open" : "locked") : "none";
      return (left ? left + " item" + (left > 1 ? "s" : "") + " on the floor" : "Floor cleared") + " · " + this.loc.cacheName + ": " + cacheState + (cacheLeft && cacheState === "open" ? ", " + cacheLeft + " left" : "");
    },
    buildingLeave() {
      const S = State();
      this.closeMap(false);
      if (S.trip && this.loc) {
        S.trip.rooms = S.trip.rooms || {};
        const snap = (S.trip.rooms[this.loc.id] = this.snapshot());
        // the explored map rides in the trip's overlay too, and joins the save when you get home
        const tl = S.tripLoc(this.loc.id);
        tl.seen = S.mergeSeen(tl.seen, snap.seen);
      }
    },

    /* ---------- The building map (M) ----------
       A paper map over the paused scene: only tiles you have seen (this.seen), walls and
       fixtures, doors open or closed, the locked cache door, the exit, the landmarks (their
       own art in a badge, and their plain names, the words the notes use), the notes you have
       found, and you. No walkers and no items: the notes say where things are. M, Esc or a
       click closes it; P goes on to the pause menu, B to the backpack. */
    modeKey(k, paused) {
      if (this.mode !== "building") return false;
      if (this.mapOpen && !paused) this.closeMap(false); // the game was resumed from elsewhere
      if (this.mapOpen) {
        if (k === "m" || k === "escape") this.closeMap(true);
        else if (k === "p") {
          // the pause menu resumes the game when it closes
          this.closeMap(false);
          if (this.hooks.onPause) this.hooks.onPause();
        } else if (k === "b") {
          this.closeMap(false);
          if (this.hooks.onBackpack) this.hooks.onBackpack();
        }
        return true; // the map holds the keyboard while it is open
      }
      if (paused || k !== "m") return false;
      this.openMap();
      return true;
    },
    openMap() {
      if (!this.running || this.mode !== "building" || this.paused) return; // never over another pause
      this.pause();
      this.mapOpen = true;
      this.holdFrame = true; // the scene under the map is still: the core draws it once, not every frame
      this.mapImg = null;
      this.hud.root.classList.add("hidden");
      if (this.canvas.style) this.canvas.style.cursor = "pointer";
      if (!this.mapClick) {
        // a click anywhere closes it (the core ignores clicks while paused, so this click never fires)
        this.mapClick = (e) => {
          if (!this.mapOpen || !this.running) return;
          e.preventDefault();
          this.closeMap(true);
        };
        this.canvas.addEventListener("mousedown", this.mapClick);
      }
      Audio().play("click");
    },
    closeMap(resume) {
      if (!this.mapOpen) return;
      this.mapOpen = false;
      this.holdFrame = false;
      this.mapImg = null;
      if (this.canvas.style) this.canvas.style.cursor = "";
      if (this.running) this.hud.root.classList.remove("hidden");
      if (resume) this.resume();
    },
    /** Called by the core after each frame it draws: the map, drawn once per opening and kept while paused
        (while it is open the core draws one frame and holds it: holdFrame). */
    drawOverlay(ctx, Wd, H) {
      this.syncMapBtn();
      if (!this.mapOpen) return;
      if (!this.paused || this.mode !== "building") return this.closeMap(false);
      const key = Wd + "x" + H + "x" + textScale();
      if (!this.mapImg || this.mapKey !== key) {
        this.mapImg = this.drawMap(Wd, H);
        this.mapKey = key;
      }
      ctx.drawImage(this.mapImg, 0, 0);
    },

    /** Which tiles the map shows: every seen tile, plus walls and doors right beside seen open floor
        (rays seldom hit a room's corner tiles, and the outline should still close). */
    mapShown() {
      const gw = this.gw;
      const gh = this.gh;
      const seen = this.seen;
      const grid = this.grid;
      const OPQ = this.OPAQUE;
      const show = new Uint8Array(gw * gh);
      const openSeen = (x, y) => x >= 0 && y >= 0 && x < gw && y < gh && seen[y * gw + x] && !OPQ.includes(grid[y][x]);
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const i = y * gw + x;
          if (seen[i]) show[i] = 1;
          else if ("#WSXG".includes(grid[y][x])) {
            for (let dy = -1; dy <= 1 && !show[i]; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && openSeen(x + dx, y + dy)) show[i] = 1;
          } else if ("ODLE".includes(grid[y][x])) {
            if (openSeen(x - 1, y) || openSeen(x + 1, y) || openSeen(x, y - 1) || openSeen(x, y + 1)) show[i] = 1;
          }
        }
      }
      return show;
    },

    /** The whole map screen as a canvas the size of the view. */
    drawMap(Wd, H) {
      const c = document.createElement("canvas");
      c.width = Wd;
      c.height = H;
      const g = c.getContext("2d");
      const k = textScale();
      const gw = this.gw;
      const gh = this.gh;
      const fs = Math.round(15 * k); // labels and legend
      const pad = Math.round(14 * Math.min(k, 1.5));
      const capH = Math.round(30 * k);
      const edge = Math.round(12 * Math.min(k, 1.5));
      const sideH = Math.round(fs * 1.7); // the BACK label strip above the map, the EXIT strip below it
      g.fillStyle = "rgba(15,16,18,0.74)";
      g.fillRect(0, 0, Wd, H);
      const show = this.mapShown();

      // the legend, laid out beside the map or under it, whichever leaves the bigger map
      // (the red open door of a cache room you unlocked gets a row once it is on the map)
      const cd = this.cacheDoor;
      const LEGEND = [["you", "you"], ["door", "door"], ["open", "open door"], ["locked", "locked door"]];
      if (cd && cd.open && show[cd.y * gw + cd.x]) LEGEND.push(["opened", "unlocked door"]);
      LEGEND.push(["exit", "exit"], ["note", "note"], ["read", "note you read"], ["fog", "not seen yet"], ["key", "close map"]);
      g.font = "700 " + fs + "px " + HEAD;
      const sw = Math.round(fs * 1.25);
      const items = LEGEND.map(([kind, text]) => ({ kind, text: text.toUpperCase(), w: sw + fs * 0.5 + g.measureText(text.toUpperCase()).width }));
      const rowH = Math.round(fs * 1.75);
      const colW = Math.max(...items.map((it) => it.w));
      const availW = Wd - 2 * edge - 2 * pad;
      const availH = H - 2 * edge - capH - pad - 2 * sideH;
      const wrap = (width) => {
        const rows = [[]];
        let x = 0;
        items.forEach((it) => {
          if (x && x + it.w > width) {
            rows.push([]);
            x = 0;
          }
          rows[rows.length - 1].push(it);
          x += it.w + fs * 1.2;
        });
        return rows;
      };
      const tSide = Math.floor(Math.min((availW - colW - pad * 1.5) / gw, availH / gh));
      const rows = wrap(availW);
      const tUnder = Math.floor(Math.min(availW / gw, (availH - rows.length * rowH - pad * 0.5) / gh));
      const side = tSide >= tUnder;
      const T = Math.max(3, side ? tSide : tUnder);
      const mapW = T * gw;
      const mapH = T * gh;
      const rowW = (r) => r.reduce((a, it) => a + it.w, 0) + (r.length - 1) * fs * 1.2;
      const contentW = side ? mapW + pad * 1.5 + colW : Math.max(mapW, ...rows.map(rowW));
      const contentH = side ? Math.max(mapH + 2 * sideH, items.length * rowH) : mapH + 2 * sideH + pad * 0.5 + rows.length * rowH;
      const pw = Math.min(Wd - 2 * edge, Math.max(contentW + 2 * pad, capH * 6));
      const ph = Math.min(H - 2 * edge, contentH + capH + pad);
      const px = Math.round((Wd - pw) / 2);
      const py = Math.round((H - ph) / 2);
      const ox = side ? px + pad : px + Math.round((pw - mapW) / 2);
      const oy = py + capH + sideH;

      // the paper panel and its caption tab
      const sh = Math.round(6 * Math.min(k, 1.5));
      g.fillStyle = INK;
      g.fillRect(px + sh, py + sh, pw, ph);
      g.fillStyle = MAP.paper;
      g.fillRect(px, py, pw, ph);
      g.strokeStyle = INK;
      g.lineWidth = 4;
      g.strokeRect(px, py, pw, ph);

      this.drawMapTiles(g, ox, oy, T, fs, show);
      // where the legend goes (drawn last)
      const lx = ox + mapW + pad * 1.5;
      const ly = oy - sideH + Math.max(0, (mapH + 2 * sideH - items.length * rowH) / 2);
      const legendTop = oy + mapH + sideH + pad * 0.5;
      const rects = [side ? [lx - pad * 0.5, ly, px + pw, ly + items.length * rowH] : [px, legendTop, px + pw, legendTop + rows.length * rowH]]; // what labels must not cover
      const bounds = [px + 4, py + capH * 0.5, px + pw - 4, py + ph - 4];

      // notes you have found
      this.notes.forEach((n) => {
        const tx = Math.floor(n.x);
        const ty = Math.floor(n.y);
        if (!this.seen[ty * gw + tx]) return;
        const s = Math.max(T * 0.9, fs * 0.8);
        this.mapNote(g, ox + n.x * T, oy + n.y * T, s, n.read);
        rects.push([ox + n.x * T - s / 2, oy + n.y * T - s / 2, ox + n.x * T + s / 2, oy + n.y * T + s / 2]);
      });
      // landmarks you have seen: a badge with their own picture
      const badges = [];
      this.landmarks.forEach((lm) => {
        const def = lm.def;
        if (!def) return;
        const f = Array.isArray(def.foot) ? def.foot : [1, 1];
        let seen = false;
        for (let y = lm.y - (f[1] >> 1); y <= lm.y + (f[1] >> 1); y++) for (let x = lm.x - (f[0] >> 1); x <= lm.x + (f[0] >> 1); x++) if (x >= 0 && y >= 0 && x < gw && y < gh && this.seen[y * gw + x]) seen = true;
        if (!seen) return;
        const cx = ox + (lm.x + 0.5) * T;
        const cy = oy + (lm.y + 0.5) * T;
        const bw = Math.max(f[0] * T * (f[0] > 1 ? 1 : 1.5), fs * (f[0] > 1 ? 3.8 : 2.2));
        const bh = Math.max(f[1] * T * (f[1] > 1 ? 1 : 1.5), fs * 2.2);
        const r = [cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2];
        badges.push({ lm, r });
        rects.push(r);
      });
      badges.forEach((b) => this.mapBadge(g, b.lm, b.r));
      // you: a view cone and an arrow
      const p = this.player;
      const yx = ox + p.x * T;
      const yy = oy + p.y * T;
      const ys = Math.max(T * 0.85, fs * 0.8);
      g.fillStyle = "rgba(240,194,71,0.4)";
      g.beginPath();
      g.moveTo(yx, yy);
      g.arc(yx, yy, Math.max(T * 3.5, ys * 3), p.a - 0.55, p.a + 0.55);
      g.closePath();
      g.fill();
      this.mapArrow(g, yx, yy, p.a, ys);
      const youRect = [yx - ys, yy - ys, yx + ys, yy + ys];
      rects.push(youRect);

      // labels: the landmark names (as the notes say them, without "the"), the exit, you
      const label = (text, r, font) => {
        g.font = font;
        const tw = g.measureText(text).width + fs * 0.6;
        const th = Math.round(fs * 1.5);
        const cx = (r[0] + r[2]) / 2;
        const cy = (r[1] + r[3]) / 2;
        const gap = Math.max(3, fs * 0.25);
        const cands = [[r[2] + gap, cy - th / 2], [r[0] - gap - tw, cy - th / 2], [cx - tw / 2, r[3] + gap], [cx - tw / 2, r[1] - gap - th], [r[2] + gap, r[3] - th * 0.3], [r[0] - gap - tw, r[3] - th * 0.3], [r[2] + gap, r[1] - th * 0.7], [r[0] - gap - tw, r[1] - th * 0.7]];
        const over = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
        let best = null;
        cands.forEach(([x, y], i) => {
          const q = [x, y, x + tw, y + th];
          let s = i * 2;
          rects.forEach((o) => (s += over(q, o)));
          s += (Math.max(0, bounds[0] - q[0]) + Math.max(0, q[2] - bounds[2]) + Math.max(0, bounds[1] - q[1]) + Math.max(0, q[3] - bounds[3])) * th * 6;
          if (!best || s < best.s) best = { q, s };
        });
        const q = best.q;
        const dx = Math.max(0, bounds[0] - q[0]) - Math.max(0, q[2] - bounds[2]);
        const dy = Math.max(0, bounds[1] - q[1]) - Math.max(0, q[3] - bounds[3]);
        const x = Math.round(q[0] + dx);
        const y = Math.round(q[1] + dy);
        rects.push([x, y, x + tw, y + th]);
        g.fillStyle = MAP.label;
        g.fillRect(x, y, tw, th);
        g.strokeStyle = INK;
        g.lineWidth = 2;
        g.strokeRect(x, y, tw, th);
        g.fillStyle = INK;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(text, x + tw / 2, y + th / 2 + fs * 0.04);
      };
      badges.forEach((b) => label(b.lm.def.name.replace(/^the\s+/i, ""), b.r, "700 " + fs + "px " + BODY));
      if (this.exit && show[this.exit.y * gw + this.exit.x]) {
        const ex = ox + this.exit.x * T;
        const ey = oy + this.exit.y * T;
        label("EXIT", [ex, ey, ex + T, ey + T], "700 " + fs + "px " + HEAD);
      }
      label("you", youRect, "700 " + fs + "px " + BODY);

      // BACK over the far wall: the notes' back and front
      g.font = "700 " + Math.round(fs * 0.85) + "px " + HEAD;
      g.fillStyle = "#5d5a52";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("BACK", ox + mapW / 2, oy - sideH / 2);

      // the legend
      const swatch = (it, x, y) => this.mapSwatch(g, it.kind, x, y, sw);
      const legendText = (it, x, y) => {
        g.font = "700 " + fs + "px " + HEAD;
        g.fillStyle = INK;
        g.textAlign = "left";
        g.textBaseline = "middle";
        g.fillText(it.text, x + sw + fs * 0.5, y + sw / 2 + fs * 0.04);
      };
      if (side) {
        items.forEach((it, i) => {
          swatch(it, lx, ly + i * rowH);
          legendText(it, lx, ly + i * rowH);
        });
      } else {
        rows.forEach((r, j) => {
          let x = px + (pw - rowW(r)) / 2;
          const y = legendTop + j * rowH;
          r.forEach((it) => {
            swatch(it, x, y);
            legendText(it, x, y);
            x += it.w + fs * 1.2;
          });
        });
      }

      // the caption tab over the panel's corner, like the paper screens
      const name = "MAP · " + ((this.loc && this.loc.name) || "").toUpperCase();
      g.font = Math.round(capH * 0.68) + "px " + COMIC;
      const cw = Math.min(pw - 8, g.measureText(name).width + capH * 0.8);
      g.fillStyle = INK;
      g.fillRect(px - 4 + 3, py - 4 + 3, cw, capH);
      g.fillStyle = "#d9a21b";
      g.fillRect(px - 4, py - 4, cw, capH);
      g.strokeStyle = INK;
      g.lineWidth = 4;
      g.strokeRect(px - 4, py - 4, cw, capH);
      g.fillStyle = INK;
      g.textAlign = "left";
      g.textBaseline = "middle";
      g.fillText(name, px - 4 + capH * 0.4, py - 4 + capH / 2 + 1, cw - capH * 0.6);
      return c;
    },

    /** The map's tiles (`show` from mapShown): fog, floors (tinted by kind), ink walls, fixtures as blocks, doors, the exit. */
    drawMapTiles(g, ox, oy, T, fs, show) {
      const gw = this.gw;
      const gh = this.gh;
      const grid = this.grid;
      const D = D3();
      if (!floorColors) {
        floorColors = {};
        Object.keys(MAP_FLOOR).forEach((n) => {
          const id = D.floorId(n);
          if (id >= 0) floorColors[id] = MAP_FLOOR[n];
        });
      }
      // not seen yet: darker paper with dots
      this.mapFog(g, ox, oy, T * gw, T * gh);
      const at = (x, y) => (x < 0 || y < 0 || x >= gw || y >= gh ? "#" : grid[y][x]);
      const isWall = (x, y) => "#W".includes(at(x, y));
      const shown = (x, y) => x >= 0 && y >= 0 && x < gw && y < gh && show[y * gw + x];
      const lw = Math.max(1.5, T * 0.1);
      const icons = [];
      const iconS = Math.max(T, fs * 0.95);
      // floors first, so fixtures, doors and walls sit on them
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          if (!show[y * gw + x] || isWall(x, y)) continue;
          g.fillStyle = floorColors[this.floorKind[y * gw + x]] || MAP_FLOOR.tile;
          g.fillRect(ox + x * T, oy + y * T, T, T);
        }
      }
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          if (!show[y * gw + x]) continue;
          const ch = grid[y][x];
          const sx = ox + x * T;
          const sy = oy + y * T;
          if (ch === "#" || ch === "W") {
            g.fillStyle = INK;
            g.fillRect(sx - 0.25, sy - 0.25, T + 0.5, T + 0.5);
            if (ch === "W") {
              g.fillStyle = "#8fb8cc";
              if (isWall(x - 1, y) || isWall(x + 1, y)) g.fillRect(sx + T * 0.15, sy + T * 0.38, T * 0.7, T * 0.24);
              else g.fillRect(sx + T * 0.38, sy + T * 0.15, T * 0.24, T * 0.7);
            }
          } else if (MAP_FIX[ch]) {
            // a fixture: one block per run of the same kind, outlined where the run ends
            const same = (dx, dy) => at(x + dx, y + dy) === ch && shown(x + dx, y + dy);
            const ins = Math.max(1, T * 0.12);
            const l = same(-1, 0) ? 0 : ins;
            const r = same(1, 0) ? 0 : ins;
            const u = same(0, -1) ? 0 : ins;
            const d = same(0, 1) ? 0 : ins;
            g.fillStyle = MAP_FIX[ch];
            g.fillRect(sx + l, sy + u, T - l - r, T - u - d);
            g.fillStyle = INK;
            if (l) g.fillRect(sx + l, sy + u, lw, T - u - d);
            if (r) g.fillRect(sx + T - r - lw, sy + u, lw, T - u - d);
            if (u) g.fillRect(sx + l, sy + u, T - l - r, lw);
            if (d) g.fillRect(sx + l, sy + T - d - lw, T - l - r, lw);
            if (ch === "X") {
              g.fillStyle = "rgba(15,16,18,0.45)";
              g.fillRect(sx + T * 0.3, sy + T * 0.3, T * 0.4, T * 0.4);
            }
          } else if (ch === "O" || ch === "D" || ch === "L") {
            const across = isWall(x - 1, y) || isWall(x + 1, y); // walls left and right: the door spans the tile left to right
            const kind = ch === "L" ? "locked" : ch === "O" ? "door" : this.cacheDoor && this.cacheDoor.x === x && this.cacheDoor.y === y ? "opened" : "open";
            this.mapDoor(g, sx, sy, T, kind, across);
            if (ch === "L") icons.push(() => this.mapLock(g, sx + T / 2, sy + T / 2, iconS * 1.1));
          } else if (ch === "E") {
            const out = y === gh - 1 ? Math.PI / 2 : y === 0 ? -Math.PI / 2 : x === 0 ? Math.PI : 0;
            icons.push(() => this.mapExit(g, sx + (T - iconS) / 2, sy + (T - iconS) / 2, iconS, out));
          }
        }
      }
      g.strokeStyle = INK;
      g.lineWidth = 2.5;
      g.strokeRect(ox, oy, T * gw, T * gh);
      // the padlock and the exit stay big enough to spot at any text size, even over the walls beside them
      icons.forEach((f) => f());
    },
    /** Fog over a w x h box: darker paper with a half-drop grid of dots, one pattern fill. */
    mapFog(g, x, y, w, h) {
      if (!fogTile) {
        // one 8 x 14 tile of the grid: a dot in each row, the second row's shifted half a step
        fogTile = document.createElement("canvas");
        fogTile.width = 8;
        fogTile.height = 14;
        const t = fogTile.getContext("2d");
        t.fillStyle = "rgba(15,16,18,0.22)";
        t.fillRect(2, 2, 2, 2);
        t.fillRect(6, 9, 2, 2);
      }
      g.fillStyle = MAP.fog;
      g.fillRect(x, y, w, h);
      const dots = g.createPattern(fogTile, "repeat");
      if (!dots) return;
      g.save();
      g.translate(x, y); // the pattern starts at the box's corner
      g.fillStyle = dots;
      g.fillRect(0, 0, w, h);
      g.restore();
    },

    /** A door on the map in a T x T cell. kind: door (closed), open, locked (the cache door), opened (cache, open). */
    mapDoor(g, sx, sy, T, kind, across) {
      g.save();
      g.translate(sx + T / 2, sy + T / 2);
      if (!across) g.rotate(Math.PI / 2);
      const lw = Math.max(1.5, T * 0.1);
      if (kind === "door" || kind === "locked") {
        const big = kind === "locked" ? 1.3 : 1;
        g.fillStyle = kind === "locked" ? MAP.locked : MAP.door;
        g.fillRect(-T / 2, (-T * 0.22) * big, T, T * 0.44 * big);
        g.strokeStyle = INK;
        g.lineWidth = lw;
        g.strokeRect(-T / 2, (-T * 0.22) * big, T, T * 0.44 * big);
      } else {
        // open: the jambs, and the leaf swung back against one of them, out into the room
        g.fillStyle = INK;
        g.fillRect(-T / 2, -T * 0.3, lw * 1.2, T * 0.6);
        g.fillRect(T / 2 - lw * 1.2, -T * 0.3, lw * 1.2, T * 0.6);
        const leaf = Math.max(2.5, T * 0.2);
        g.fillStyle = kind === "opened" ? MAP.locked : MAP.open;
        g.fillRect(-T / 2, -T * 0.9, leaf, T * 0.9);
        g.strokeStyle = INK;
        g.lineWidth = Math.max(1, T * 0.07);
        g.strokeRect(-T / 2, -T * 0.9, leaf, T * 0.9);
      }
      g.restore();
    },
    /** A padlock about s tall, centered. */
    mapLock(g, cx, cy, s) {
      const lw = Math.max(1.5, s * 0.12);
      g.strokeStyle = INK;
      g.lineWidth = lw * 1.9;
      g.beginPath();
      g.arc(cx, cy - s * 0.12, s * 0.22, Math.PI, 0);
      g.stroke();
      g.strokeStyle = "#c3c7cb";
      g.lineWidth = lw * 0.8;
      g.stroke();
      g.fillStyle = "#e0b43a";
      g.fillRect(cx - s * 0.32, cy - s * 0.12, s * 0.64, s * 0.5);
      g.strokeStyle = INK;
      g.lineWidth = lw;
      g.strokeRect(cx - s * 0.32, cy - s * 0.12, s * 0.64, s * 0.5);
      g.fillStyle = INK;
      g.fillRect(cx - lw / 2, cy + s * 0.02, lw, s * 0.2);
    },
    /** The exit: a green tile with a white arrow pointing out of the building (angle `out`). */
    mapExit(g, sx, sy, T, out) {
      g.fillStyle = MAP.exit;
      g.fillRect(sx, sy, T, T);
      g.strokeStyle = INK;
      g.lineWidth = Math.max(1.5, T * 0.1);
      g.strokeRect(sx, sy, T, T);
      g.save();
      g.translate(sx + T / 2, sy + T / 2);
      g.rotate(out);
      g.fillStyle = "#fbfaf4";
      g.beginPath();
      g.moveTo(T * 0.38, 0);
      g.lineTo(-T * 0.05, -T * 0.32);
      g.lineTo(-T * 0.05, -T * 0.12);
      g.lineTo(-T * 0.36, -T * 0.12);
      g.lineTo(-T * 0.36, T * 0.12);
      g.lineTo(-T * 0.05, T * 0.12);
      g.lineTo(-T * 0.05, T * 0.32);
      g.closePath();
      g.fill();
      g.lineWidth = Math.max(1, T * 0.05);
      g.stroke();
      g.restore();
    },
    /** A note on the map: a yellow paper with "!" until you have read it, then a gray one with a tick. */
    mapNote(g, cx, cy, s, read) {
      g.save();
      g.translate(cx, cy);
      g.rotate(-0.12);
      g.fillStyle = "rgba(15,16,18,0.45)";
      g.fillRect(-s * 0.4 + 2, -s * 0.5 + 2, s * 0.8, s);
      g.fillStyle = read ? MAP.read : MAP.note;
      g.fillRect(-s * 0.4, -s * 0.5, s * 0.8, s);
      g.strokeStyle = INK;
      g.lineWidth = Math.max(1.5, s * 0.1);
      g.strokeRect(-s * 0.4, -s * 0.5, s * 0.8, s);
      if (read) {
        g.strokeStyle = "#3f6a2a";
        g.lineWidth = Math.max(1.5, s * 0.14);
        g.beginPath();
        g.moveTo(-s * 0.22, 0);
        g.lineTo(-s * 0.04, s * 0.2);
        g.lineTo(s * 0.24, -s * 0.24);
        g.stroke();
      } else {
        g.fillStyle = INK;
        g.fillRect(-s * 0.06, -s * 0.34, s * 0.12, s * 0.42);
        g.fillRect(-s * 0.06, s * 0.18, s * 0.12, s * 0.12);
      }
      g.restore();
    },
    /** You on the map: a red arrow pointing the way you face. */
    mapArrow(g, cx, cy, a, s) {
      g.save();
      g.translate(cx, cy);
      g.rotate(a);
      g.beginPath();
      g.moveTo(s * 0.95, 0);
      g.lineTo(-s * 0.6, -s * 0.62);
      g.lineTo(-s * 0.25, 0);
      g.lineTo(-s * 0.6, s * 0.62);
      g.closePath();
      g.fillStyle = MAP.you;
      g.fill();
      g.strokeStyle = INK;
      g.lineWidth = Math.max(2, s * 0.16);
      g.lineJoin = "round";
      g.stroke();
      g.restore();
    },
    /** A landmark's badge over its tiles: cream card, a colored ring, its own art fitted inside. */
    mapBadge(g, lm, r) {
      const w = r[2] - r[0];
      const h = r[3] - r[1];
      const ring = (lm.def && lm.def.color) || LM_RING[lm.id] || "#d9a21b";
      g.fillStyle = "rgba(15,16,18,0.5)";
      g.fillRect(r[0] + 3, r[1] + 3, w, h);
      g.fillStyle = MAP.label;
      g.fillRect(r[0], r[1], w, h);
      g.strokeStyle = ring;
      g.lineWidth = 3;
      g.strokeRect(r[0] + 3.5, r[1] + 3.5, w - 7, h - 7);
      g.strokeStyle = INK;
      g.lineWidth = 2.5;
      g.strokeRect(r[0], r[1], w, h);
      const img = lm.prop && lm.prop.img;
      if (img && img.width > 0 && img.height > 0) {
        const s = Math.min((w - 10) / img.width, (h - 10) / img.height);
        const iw = img.width * s;
        const ih = img.height * s;
        g.imageSmoothingEnabled = true;
        g.drawImage(img, r[0] + (w - iw) / 2, r[1] + (h - ih) / 2, iw, ih);
      }
    },
    /** One legend swatch, s x s, at (x, y). */
    mapSwatch(g, kind, x, y, s) {
      const cx = x + s / 2;
      const cy = y + s / 2;
      if (kind === "you") return this.mapArrow(g, cx, cy, -Math.PI / 2, s * 0.5);
      if (kind === "note" || kind === "read") return this.mapNote(g, cx, cy, s * 0.9, kind === "read");
      if (kind === "exit") return this.mapExit(g, x, y, s, Math.PI / 2);
      if (kind === "key") {
        g.fillStyle = "#f3eee0";
        g.fillRect(x, y, s, s);
        g.strokeStyle = INK;
        g.lineWidth = 2;
        g.strokeRect(x, y, s, s);
        g.font = "700 " + Math.round(s * 0.62) + "px " + HEAD;
        g.fillStyle = INK;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("M", cx, cy + s * 0.04);
        return;
      }
      if (kind === "fog") this.mapFog(g, x, y, s, s);
      else {
        // a door between two bits of wall, kept inside its box: an open one sits low, its leaf swung up into the room
        const dy = kind === "open" || kind === "opened" ? s * 0.2 : 0;
        g.save();
        g.beginPath();
        g.rect(x - s * 0.25, y, s * 1.5, s);
        g.clip();
        g.fillStyle = MAP_FLOOR.tile;
        g.fillRect(x, y, s, s);
        g.fillStyle = INK;
        g.fillRect(x - s * 0.25, y + dy * 2, s * 0.25, s - dy * 2); // level with the open door's jambs
        g.fillRect(x + s, y + dy * 2, s * 0.25, s - dy * 2);
        this.mapDoor(g, x, y + dy, s, kind, true);
        g.restore();
        if (kind === "locked") this.mapLock(g, cx, cy, s * 0.95);
      }
      g.strokeStyle = INK;
      g.lineWidth = 2;
      g.strokeRect(x, y, s, s);
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
