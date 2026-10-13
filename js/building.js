/* Building mode for the first-person view, mixed into ZSR.Interior: entering a place
   from its layout (legend v2), the trip snapshot for a return visit, pickups, notes,
   the locked cache room, decor and landmarks, and the building's HUD goal.

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
      this.toast(snap ? "Back inside. It is just as you left it." : "Walkers inside. E reads notes and opens doors. B is the backpack.", 3.5);
    },

    /** Per-tile floors, wall decor and the four corner landmarks, from the layout's optional fields. */
    dressLayout(tpl) {
      const D = D3();
      if (tpl.floors && tpl.floorKey) {
        tpl.floors.forEach((row, y) => {
          for (let x = 0; x < row.length; x++) if (tpl.floorKey[row[x]]) this.setFloor(x, y, tpl.floorKey[row[x]]);
        });
      }
      // decor is drawn by registered textures; until one exists for a key the wall stays plain
      (tpl.decor || []).forEach((d) => {
        if (!this.grid[d.y] || !DECOR_ON.includes(this.grid[d.y][d.x]) || !D.hasTexture(d.tex)) return;
        const opts = Object.assign({}, d);
        delete opts.x;
        delete opts.y;
        delete opts.tex;
        delete opts.face;
        const tex = D.texture(d.tex, this.palette, Object.keys(opts).length ? opts : undefined);
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
      };
    },
    restore(snap) {
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
      if (S.trip && this.loc) {
        S.trip.rooms = S.trip.rooms || {};
        S.trip.rooms[this.loc.id] = this.snapshot();
      }
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
