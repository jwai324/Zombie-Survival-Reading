/* Building mode for the first-person view, mixed into ZSR.Interior: entering a place
   from its layout (legend v2), the trip snapshot for a return visit, pickups, notes,
   the locked cache room, the stash (its key is hidden in another building) and this building's
   own stash key, wall signs read up close, decor and landmarks, a gun lying on the floor (when
   this save hid one here), the building's HUD goal, and the M map (only what you have seen;
   kept in the trip and, once home, in the save).

   Legend v2 (see js/layouts.js):
     #  wall              W  wall with a window      .  floor
     D  door              L  locked cache door       E  entrance / exit
     Q  stash door (opens with a key found in another building)
     S  shelf  X  crates  G  glass case (all full height)
     C  counter  K  table / desk  R  bed / bench (low: solid, see-through, shoot over)
     1 2 3 4  landmark anchors (floor + landmark prop)
     i item  c cache item  k stash item  y this building's stash key
     n note spot 1 (the main note)  z walker spawn  $ scrap pile
   Any other character is floor. The layout's `spots` place note spots 2 to 7 and its `signs`
   the wall signs (js/layouts.js). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const D3 = () => ZSR.Draw3;
  const W = () => ZSR.WORLD;
  const rand = (a, b) => a + Math.random() * (b - a);
  const KEEP = "#W.DLQESXGCKR"; // tiles that stay as they are; the markers become floor
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
      const N = W().NOTES[loc.id];
      let itemIdx = 0;
      let cacheIdx = 0;
      let stashIdx = 0;
      const spotAt = {}; // note spot number -> [x, y]
      Object.entries(tpl.spots || {}).forEach(([n, [x, y]]) => (spotAt[n] = [x + 0.5, y + 0.5]));
      for (let y = 0; y < this.gh; y++) {
        for (let x = 0; x < this.gw; x++) {
          const ch = this.grid[y][x];
          const cx = x + 0.5;
          const cy = y + 0.5;
          if (ch === "i") {
            const key = loc.items[itemIdx];
            if (key) this.items.push({ spot: "i" + itemIdx, x: cx, y: cy, item: key, source: false, taken: !S.itemAvailable(loc.id, "i" + itemIdx) });
            itemIdx++;
            this.grid[y][x] = ".";
          } else if (ch === "c") {
            const key = loc.cache[cacheIdx];
            if (key) this.items.push({ spot: "c" + cacheIdx, x: cx, y: cy, item: key, source: "cache", taken: !!st.cacheTaken["c" + cacheIdx] });
            cacheIdx++;
            this.grid[y][x] = ".";
          } else if (ch === "k") {
            const key = (loc.stash || [])[stashIdx];
            if (key) this.items.push({ spot: "k" + stashIdx, x: cx, y: cy, item: key, source: "stash", taken: !!st.stashTaken["k" + stashIdx] });
            stashIdx++;
            this.grid[y][x] = ".";
          } else if (ch === "n") {
            spotAt["1"] = [cx, cy];
            this.grid[y][x] = ".";
          } else if (ch === "y") {
            if (N.key) this.keyPickup = { x: cx, y: cy, from: loc.id, taken: S.hasKeyFrom(loc.id) };
            this.grid[y][x] = ".";
          } else if (ch === "Q") {
            this.stashDoor = { x, y, open: st.stashOpened };
            if (st.stashOpened) {
              this.doors.push({ x, y, open: true, stash: true });
              this.grid[y][x] = "D";
            }
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
      // notes go on their numbered spots; a dead-end note above this reading level is not placed,
      // and a note that follows another (`after`) stays hidden until that one has been read
      const level = S.settings.level;
      N.notes.forEach((n) => {
        const at = spotAt[String(n.spot || 1)];
        if (!at || (n.minLevel || 1) > level) return;
        this.notes.push({ x: at[0], y: at[1], id: n.id, found: n.found, unlocks: n.unlocks, reveals: n.reveals || [], after: n.after || null, read: S.noteRead(n.id) });
      });
      this.dressLayout(tpl);
      this.placeSigns(tpl, N.signs || []);
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
      this.placeGun(loc, start);
      this.placeRod(loc, tpl);
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
    toastFit(texts, secs, pickup) {
      const el = this.hud.toast;
      for (const t of texts) {
        this.toast(t, secs, pickup);
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

    /** The wall signs and graffiti you read up close: the layout's `signs` ([x, y, face]) in order, one per
        story sign. Drawn over any decor on that face; read from the side it faces. */
    placeSigns(tpl, list) {
      (tpl.signs || []).forEach(([x, y, face], i) => {
        const sg = list[i];
        if (!sg) return;
        this.signs.push({ x, y, face: face || null, id: sg.id, kind: sg.kind });
        const tex = D3().texture(sg.kind === "graffiti" ? "readGraffiti" : "readSign", this.palette);
        const k = x + "," + y;
        if (!face) this.tileTex[k] = tex;
        else {
          const cur = this.tileTex[k];
          const faces = cur && typeof cur === "object" && !cur.width ? cur : {};
          faces[face] = tex;
          this.tileTex[k] = faces;
        }
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

    /** A gun still lying in this building goes on a floor tile well inside: the same tile on every visit
        of this save (seeded), on open floor you can walk to with every door open, never in the cache room,
        never on a landmark's tiles, an item, a note or a scrap pile. Distances count every door as open,
        so where doors stand never moves it. Never behind the stash door either. */
    placeGun(loc, start) {
      const S = State();
      const id = S.weaponAt(loc.id);
      if (!id) return;
      const gw = this.gw;
      const m = this.solidMask();
      const cd = this.cacheDoor;
      const sd = this.stashDoor;
      const shut = (d, x, y) => d && x === d.x && y === d.y;
      const pass = (x, y) => !shut(cd, x, y) && !shut(sd, x, y) && (!m[y * gw + x] || this.grid[y][x] === "O");
      const sx = Math.floor(start[0]);
      const sy = Math.floor(start[1]);
      const reach = new Map([[sx + "," + sy, 0]]);
      const q = [[sx, sy]];
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= gw || ny >= this.gh || reach.has(nx + "," + ny) || !pass(nx, ny)) continue;
          reach.set(nx + "," + ny, reach.get(x + "," + y) + 1);
          q.push([nx, ny]);
        }
      }
      const busy = new Set(this.items.concat(this.notes, this.piles, this.keyPickup ? [this.keyPickup] : []).map((o) => Math.floor(o.x) + "," + Math.floor(o.y)));
      this.landmarks.forEach((lm) => {
        const f = lm.def && Array.isArray(lm.def.foot) ? lm.def.foot : [1, 1];
        for (let y = lm.y - (f[1] >> 1) - 1; y <= lm.y + (f[1] >> 1) + 1; y++) for (let x = lm.x - (f[0] >> 1) - 1; x <= lm.x + (f[0] >> 1) + 1; x++) busy.add(x + "," + y);
      });
      const ok = (min) => this.floors.filter(([x, y]) => {
        const k = Math.floor(x) + "," + Math.floor(y);
        return (reach.get(k) || 0) >= min && !busy.has(k);
      });
      const spots = [10, 5, 2].map(ok).find((list) => list.length);
      if (!spots) return;
      let h = S.save.weapons.seed || 1;
      for (const ch of loc.id) h = (h * 31 + ch.charCodeAt(0)) % 2147483647;
      const [x, y] = spots[h % spots.length];
      this.gunPickup = { x, y, id, taken: false };
    },

    /** Chief Dunn's fishing pole, on its layout's rod spot (Station 12's equipment bay) until you have it. */
    placeRod(loc, tpl) {
      const R = W().RIVER;
      this.rodPickup = null;
      if (!R || R.rod.at !== loc.id || !Array.isArray(tpl.rod) || State().hasRod()) return;
      const [x, y] = tpl.rod;
      this.rodPickup = { x: x + 0.5, y: y + 0.5, taken: false };
      this.rodPickup.prop = this.addProp({ x: x + 0.5, y: y + 0.5, art: "rodItem", scale: 0.2, lift: 0 });
    },

    noteWasRead(noteObj) {
      noteObj.read = true;
      const added = State().reveal(noteObj.reveals);
      const followed = this.notes.some((n) => n.after === noteObj.id);
      const key = W().NOTES[this.loc.id] && W().NOTES[this.loc.id].key;
      const keyNow = key && key.after === noteObj.id && this.keyPickup && !this.keyPickup.taken;
      const msgs = [];
      if (added.length) msgs.push("New place on the map: " + added.map((id) => W().LOCATIONS.find((l) => l.id === id).name).join(", "));
      if (followed) msgs.push("The note points to another one. Go and find it.");
      if (keyNow) msgs.push("A key is hidden in here. The note says where.");
      if (msgs.length) this.toast(msgs.join(" · "), 4.5);
      this.mapImg = null;
      this.updateHud();
    },
    /** A note shows once the note it follows has been read. */
    noteVisible(n) {
      return !n.after || State().noteRead(n.after);
    },
    keyVisible() {
      const k = this.keyPickup;
      const K = this.loc && W().NOTES[this.loc.id] && W().NOTES[this.loc.id].key;
      return !!k && !k.taken && !!K && State().noteRead(K.after);
    },

    updatePickups() {
      const p = this.player;
      const S = State();
      this.items.forEach((it) => {
        if (it.taken) return;
        if (Math.hypot(it.x - p.x, it.y - p.y) < 0.6) {
          it.taken = true;
          S.trip.cargo[it.item] = (S.trip.cargo[it.item] || 0) + 1;
          S.takeItem(this.loc.id, it.spot, it.source);
          const msg = "Picked up: " + W().ITEMS[it.item].name;
          this.toast(msg, this.readSecs(msg, 3), true);
          this.showTag(it.item, Number(it.spot.slice(1)) % 2, W().ITEMS[it.item].name);
          Audio().play("pickup");
          this.updateHud();
        }
      });
      const kp = this.keyPickup;
      if (kp && this.keyVisible() && Math.hypot(kp.x - p.x, kp.y - p.y) < 0.6) {
        kp.taken = true;
        S.takeKey(kp.from);
        const kt = ZSR.keyText(kp.from);
        const target = W().LOCATIONS.find((l) => l.id === W().KEYS[kp.from]);
        const msgs = ["Found: " + kt.name + ". It opens " + target.stashName + " at " + target.name + ". Get it home to keep it.", "Found: " + kt.name + "."];
        this.toastFit(msgs, this.readSecs(msgs[0], 5), true);
        if (kt.tag) {
          if (S.trip) S.trip.wordsRead += ZSR.wordCount(kt.tag);
          this.tagPanel = { key: "key:" + kp.from + ":" + this.time, kind: "tag", title: kt.name, status: "Opens " + target.stashName + " at " + target.name, text: kt.tag, until: this.time + this.readSecs(kt.tag, 8) };
        }
        Audio().play("buy");
        this.updateHud();
      }
      const rp = this.rodPickup;
      if (rp && !rp.taken && Math.hypot(rp.x - p.x, rp.y - p.y) < 0.6) {
        // the pole is yours once it is home; its tag is how you learn where River Landing is
        rp.taken = true;
        rp.prop.hidden = true;
        S.takeRod();
        const added = S.reveal(W().RIVER.rod.reveals);
        const rt = ZSR.riverText("rod");
        const place = added.length ? " New place on the map: " + added.map((id) => W().LOCATIONS.find((l) => l.id === id).name).join(", ") + "." : "";
        const msgs = ["Found: " + rt.name + "! Press 6 to hold it. Get it home to keep it." + place, "Found: " + rt.name + "! 6 holds it." + place, "Found: " + rt.name + "!"];
        this.toastFit(msgs, this.readSecs(msgs[0], 5), true);
        if (rt.tag) {
          if (S.seeTag("rod") && S.trip) S.trip.wordsRead += ZSR.wordCount(rt.tag);
          this.tagPanel = { key: "rod:" + this.time, kind: "tag", title: rt.name, status: "The tag says", text: rt.tag, until: this.time + this.readSecs(rt.tag, 9) };
        }
        Audio().play("buy");
        this.updateHud();
      }
      const g = this.gunPickup;
      if (g && !g.taken && Math.hypot(g.x - p.x, g.y - p.y) < 0.6) {
        // straight into your hands; it is yours once you get it home
        g.taken = true;
        S.takeWeapon(g.id);
        const w = ZSR.Weapons.WEAPONS[g.id];
        this.switchWeapon(g.id);
        const msgs = ["Found: " + w.name + "! Press " + w.slot + " or Q to switch guns. Get it home to keep it.", "Found: " + w.name + "! " + w.slot + " or Q switches."];
        this.toastFit(msgs, this.readSecs(msgs[0], 4.5), true);
        Audio().play("buy");
      }
      this.piles.forEach((pl) => {
        if (pl.taken) return;
        if (Math.hypot(pl.x - p.x, pl.y - p.y) < 0.6) {
          pl.taken = true;
          S.trip.scrap += pl.value;
          this.toast("+" + pl.value + " scrap", 2.5);
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
      this.notes.forEach((n) => this.noteVisible(n) && cand.push({ kind: "note", obj: n, x: n.x, y: n.y }));
      if (this.cacheDoor && !this.cacheDoor.open) cand.push({ kind: "cache", obj: this.cacheDoor, x: this.cacheDoor.x + 0.5, y: this.cacheDoor.y + 0.5 });
      if (this.stashDoor && !this.stashDoor.open) cand.push({ kind: "stash", obj: this.stashDoor, x: this.stashDoor.x + 0.5, y: this.stashDoor.y + 0.5 });
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
      } else if (f.kind === "stash") {
        const stashName = this.loc.stashName || "the stash";
        if (S.canOpenStash(this.loc.id)) {
          const d = this.stashDoor;
          d.open = true;
          this.grid[d.y][d.x] = "D";
          this.maskDirty = true;
          this.doors.push({ x: d.x, y: d.y, open: true, stash: true });
          S.tripLoc(this.loc.id).stashOpened = true;
          this.toast("Your key fits. Opened: " + stashName + ".", 3);
          Audio().play("buy");
          this.updateHud();
        } else {
          this.toast("Locked: " + stashName + ". Its key is hidden in another building. Notes say where.", 3.5);
          Audio().play("wrong");
        }
      } else if (f.kind === "exit") {
        if (this.hooks.onExit) this.hooks.onExit();
      }
    },
    buildingHint(f) {
      if (f.kind === "note") return "Press E to read the note";
      if (f.kind === "cache") return "Press E to open " + this.loc.cacheName;
      if (f.kind === "stash") return State().canOpenStash(this.loc.id) ? "Press E: your key opens " + this.loc.stashName : this.loc.stashName + ": locked (its key is in another building)";
      if (f.kind === "exit") return "Press E to leave for the van";
      return "";
    },
    buildingGoal() {
      const left = this.items.filter((i) => !i.taken && !i.source).length;
      const cacheLeft = this.items.filter((i) => !i.taken && i.source === "cache").length;
      const cacheState = this.cacheDoor ? (this.cacheDoor.open ? "open" : "locked") : "none";
      const sd = this.stashDoor;
      const stashState = !sd ? "" : sd.open ? "open" : State().canOpenStash(this.loc.id) ? "you have the key" : "locked";
      return (left ? left + " item" + (left > 1 ? "s" : "") + " on the floor" : "Floor cleared") + " · " + this.loc.cacheName + ": " + cacheState + (cacheLeft && cacheState === "open" ? ", " + cacheLeft + " left" : "") + (sd ? " · " + this.loc.stashName + ": " + stashState : "");
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
          } else if ("ODLQE".includes(grid[y][x])) {
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
      const sd = this.stashDoor;
      const LEGEND = [["you", "you"], ["door", "door"], ["open", "open door"], ["locked", "locked door"]];
      if ((cd && cd.open && show[cd.y * gw + cd.x]) || (sd && sd.open && show[sd.y * gw + sd.x])) LEGEND.push(["opened", "unlocked door"]);
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
        if (!this.seen[ty * gw + tx] || !this.noteVisible(n)) return;
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
        // sized for the text, but never much more than its own few tiles (big text on a small screen makes small tiles)
        const bw = Math.max(f[0] * T * (f[0] > 1 ? 1 : 1.5), Math.min(fs * (f[0] > 1 ? 3.8 : 2.2), T * (f[0] > 1 ? f[0] + 4 : 4)));
        const bh = Math.max(f[1] * T * (f[1] > 1 ? 1 : 1.5), Math.min(fs * 2.2, T * 4));
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

      // labels: the landmark names (as the notes say them, without "the"), the exit, you. When the text is big
      // for the tiles (Huge text on a small screen), a label pays for every explored tile it would hide, and it
      // may stand in the strip above or below the map (on its badge's side) instead, tied to it by a line.
      const crowd = Math.max(0, Math.min(0.6, ((fs * 1.5) / T - 1.6) * 0.3));
      const hides = (q) => {
        if (!crowd) return 0;
        let a = 0;
        const x0 = Math.max(0, Math.floor((q[0] - ox) / T));
        const x1 = Math.min(gw - 1, Math.floor((q[2] - ox) / T));
        const y0 = Math.max(0, Math.floor((q[1] - oy) / T));
        const y1 = Math.min(gh - 1, Math.floor((q[3] - oy) / T));
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            if (show[y * gw + x]) a += Math.max(0, Math.min(q[2], ox + (x + 1) * T) - Math.max(q[0], ox + x * T)) * Math.max(0, Math.min(q[3], oy + (y + 1) * T) - Math.max(q[1], oy + y * T));
          }
        }
        return a * crowd;
      };
      const stripR = side ? lx - pad * 0.5 : bounds[2]; // a strip label stays clear of the legend beside the map
      const placed = [];
      const label = (text, r, font) => {
        g.font = font;
        const tw = g.measureText(text).width + fs * 0.6;
        const th = Math.round(fs * 1.5);
        const cx = (r[0] + r[2]) / 2;
        const cy = (r[1] + r[3]) / 2;
        const gap = Math.max(3, fs * 0.25);
        const cands = [[r[2] + gap, cy - th / 2], [r[0] - gap - tw, cy - th / 2], [cx - tw / 2, r[3] + gap], [cx - tw / 2, r[1] - gap - th], [r[2] + gap, r[3] - th * 0.3], [r[0] - gap - tw, r[3] - th * 0.3], [r[2] + gap, r[1] - th * 0.7], [r[0] - gap - tw, r[1] - th * 0.7]];
        if (crowd) cands.push([Math.max(bounds[0], Math.min(cx - tw / 2, stripR - tw)), cy < oy + mapH / 2 ? oy - sideH + (sideH - th) / 2 : oy + mapH + (sideH - th) / 2]);
        const over = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
        let best = null;
        cands.forEach(([x, y], i) => {
          const q = [x, y, x + tw, y + th];
          let s = i * 2 + hides(q);
          rects.forEach((o) => (s += over(q, o) * (o[4] || 1)));
          s += (Math.max(0, bounds[0] - q[0]) + Math.max(0, q[2] - bounds[2]) + Math.max(0, bounds[1] - q[1]) + Math.max(0, q[3] - bounds[3])) * th * 6;
          if (!best || s < best.s) best = { q, s };
        });
        const q = best.q;
        const dx = Math.max(0, bounds[0] - q[0]) - Math.max(0, q[2] - bounds[2]);
        const dy = Math.max(0, bounds[1] - q[1]) - Math.max(0, q[3] - bounds[3]);
        const x = Math.round(q[0] + dx);
        const y = Math.round(q[1] + dy);
        rects.push([x, y, x + tw, y + th, 3]); // a label over a label is the worst place of all
        // a label that stands away from what it names is tied to it by a line
        const ax = Math.max(r[0], Math.min(x + tw / 2, r[2]));
        const ay = Math.max(r[1], Math.min(y + th / 2, r[3]));
        const bx = Math.max(x, Math.min(ax, x + tw));
        const by = Math.max(y, Math.min(ay, y + th));
        placed.push({ text, font, x, y, tw, th, lead: Math.hypot(bx - ax, by - ay) > gap * 2 ? [ax, ay, bx, by] : null });
      };
      badges.forEach((b) => label(b.lm.def.name.replace(/^the\s+/i, ""), b.r, "700 " + fs + "px " + BODY));
      if (this.exit && show[this.exit.y * gw + this.exit.x]) {
        const ex = ox + this.exit.x * T;
        const ey = oy + this.exit.y * T;
        label("EXIT", [ex, ey, ex + T, ey + T], "700 " + fs + "px " + HEAD);
      }
      label("you", youRect, "700 " + fs + "px " + BODY);

      // BACK over the far wall (the notes' back and front): in the middle, or the free stretch of its strip
      // nearest the middle when labels stand there (left out when they fill it; the EXIT still marks the front)
      g.font = "700 " + Math.round(fs * 0.85) + "px " + HEAD;
      const backW = g.measureText("BACK").width + fs * 0.4;
      let from = ox;
      const fits = [];
      placed.filter((l) => l.y < oy && l.y + l.th > oy - sideH).map((l) => [l.x, l.x + l.tw]).sort((a, b) => a[0] - b[0]).concat([[ox + mapW, ox + mapW]]).forEach(([a, b]) => {
        if (a - from >= backW) fits.push(Math.max(from + backW / 2, Math.min(ox + mapW / 2, a - backW / 2)));
        from = Math.max(from, b);
      });
      if (fits.length) {
        g.fillStyle = "#5d5a52";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("BACK", fits.reduce((m, v) => (Math.abs(v - ox - mapW / 2) < Math.abs(m - ox - mapW / 2) ? v : m)), oy - sideH / 2);
      }

      placed.forEach((l) => {
        if (!l.lead) return;
        g.beginPath();
        g.moveTo(l.lead[0], l.lead[1]);
        g.lineTo(l.lead[2], l.lead[3]);
        g.strokeStyle = MAP.label;
        g.lineWidth = 6;
        g.stroke();
        g.strokeStyle = INK;
        g.lineWidth = 2.5;
        g.stroke();
      });
      placed.forEach((l) => {
        g.font = l.font;
        g.fillStyle = MAP.label;
        g.fillRect(l.x, l.y, l.tw, l.th);
        g.strokeStyle = INK;
        g.lineWidth = 2;
        g.strokeRect(l.x, l.y, l.tw, l.th);
        g.fillStyle = INK;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(l.text, l.x + l.tw / 2, l.y + l.th / 2 + fs * 0.04);
      });

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
          } else if (ch === "O" || ch === "D" || ch === "L" || ch === "Q") {
            const across = isWall(x - 1, y) || isWall(x + 1, y); // walls left and right: the door spans the tile left to right
            const at = (d) => d && d.x === x && d.y === y;
            const kind = ch === "L" || ch === "Q" ? "locked" : ch === "O" ? "door" : at(this.cacheDoor) || at(this.stashDoor) ? "opened" : "open";
            this.mapDoor(g, sx, sy, T, kind, across);
            if (ch === "L" || ch === "Q") icons.push(() => this.mapLock(g, sx + T / 2, sy + T / 2, iconS * 1.1));
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
