/* Building mode for the first-person view, mixed into ZSR.Interior: entering a place
   from its layout (legend v2), the trip snapshot for a return visit, pickups, notes,
   the locked cache room, the stash (its key is hidden in another building) and this building's
   own stash key, wall signs read up close, decor and landmarks, a gun lying on the floor (when
   this save hid one here), a crew member's story object waiting for an accepted quest and the
   stray dog that follows you once you hold out Pip's treats (docs/CREW.md), the building's HUD
   goal, and the M map (only what you have seen; kept in the trip and, once home, in the save).

   Legend v2 (see js/layouts.js):
     #  wall              W  wall with a window      .  floor
     D  door              L  locked cache door       E  entrance / exit
     Q  stash door (opens with a key found in another building)
     S  shelf  X  crates  G  glass case (all full height)
     C  counter  K  table / desk  R  bed / bench (low: solid, see-through, shoot over)
     1 2 3 4  landmark anchors (floor + landmark prop)
     i item  c cache item  k stash item  y this building's stash key
     n note spot 1 (the main note)  $ scrap pile
     z walker anchor: a tile a note names (NOTES[id].walkers); other walkers spawn at random (planWalkers)
   Any other character is floor. The layout's `spots` place note spots 2 to 7, its `signs`
   the wall signs and its `walkerZones` the areas a note's walkers keep to (js/layouts.js). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const D3 = () => ZSR.Draw3;
  const W = () => ZSR.WORLD;
  const Locks = () => ZSR.Locks;
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
  const SIDES = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
  const cap = (t) => String(t).charAt(0).toUpperCase() + String(t).slice(1);
  /* The fixture a search happens at (WORLD.LOCKS): its art and what the prompt and hint call it. */
  const FIXTURES = {
    drawers: { art: "fixDrawers", name: "the drawers", ask: "Which drawer do you open?" },
    cans: { art: "fixCans", name: "the watering cans", ask: "Which can do you look in?" },
    keyboard: { art: "fixKeyboard", name: "the key board", ask: "Which key do you take?" },
    breakers: { art: "fixBreakers", name: "the breaker boxes", ask: "Which box do you open?" },
    books: { art: "fixBooks", name: "the big books", ask: "Which book do you open?" },
  };
  /* What a wrong move costs, said when it happens (the notes warn of it first). */
  const FAIL_SAY = {
    trap: "It was rigged. The note warned you.",
    alarm: "That set off the alarm!",
    jam: "It sticks fast. The lock is jammed now. A crowbar from the workbench will pry it open.",
  };
  /* The dog in a building (the dog quest, docs/CREW.md). Tiles, tiles a second, seconds, radians. It follows you
     along the way you went and settles `gap` behind you, by your own walking rules (moveCircle, solidForPlayer). */
  const DOG = {
    gap: 1.2, // it stops this far from you (along its way to you)
    start: 1.6, // and gets up again once you are this far
    r: 0.2, // its body, against walls and closed doors
    walk: 3.3, // a little faster than you walk...
    run: 4.8, // ...and faster than you sprint, once it is more than `runFrom` behind
    runFrom: 3,
    far: 6, // farther than this from you, or `stuck` seconds unable to move, and it catches up at once:
    stuck: 2, // it turns up just behind you,
    hide: 1.05, // this far off where you look when it can (out of sight)
    spacing: 0.25, // a point of your way every this far, while it cannot see you
    stepT: 0.16, // seconds a walk frame shows
    idleT: 0.8, // seconds a sitting (breathing) frame shows
    aim: 0.4, // half its width (tiles) that counts as right under the crosshair (E prefers it there)
    gallop: [1.2, 1.8], // in 3D, its gallop by its speed: none at 1.2 tiles a second, all of it 1.8 faster (as at home)
  };
  // SCALE: points of your way the dog remembers while it cannot see you (spacing 0.25: 40 tiles of corridor);
  // a building with longer ways out of its sight just has it catch up at once past this
  const TRAIL_MAX = 160;
  const normAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  /** A crew sprite's prop scale (tiles tall) from the art (ZSR.CREW_ART.scale), else the contract's. */
  const artScale = (kind) => (ZSR.CREW_ART && ZSR.CREW_ART.scale && ZSR.CREW_ART.scale[kind]) || { crewDog: 0.36, qObj: 0.3 }[kind] || 1;
  /** A story object's name: "Bag of sunflower seeds". */
  const objName = (def) => (def && def.object && def.object.name) || "something";
  /** The name in running text: "the bag of sunflower seeds", but "Rosa's jar of beans" as it is. */
  const inText = (name) => (/^\S+'s\b/.test(name) ? name : "the " + name.charAt(0).toLowerCase() + name.slice(1));

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
      this.alarm = null; // the alarm, once it rings: walkers pour in until you go down
      this.deathReason = null;
      this.placeLock(spotAt["1"]);
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

      // what lies on the floor goes down first, so no walker starts on it (planWalkers)
      this.placeGun(loc, start);
      this.placeRod(loc, tpl);
      this.placeQuestObjects(loc);
      if (this.roboEnter) this.roboEnter(); // Rivet comes in with you, in the Captain Leo universe (js/robodog.js)
      if (snap) {
        this.restore(snap);
      } else {
        const day = S.save.day;
        const hpMult = W().walkerHpMult("building", day);
        this.planWalkers(loc, tpl, start, W().SETTINGS.walkersPerLocation(loc.danger, day), day).forEach((w) => this.walkers.push(this.makeWalker(w.type, w.x, w.y, hpMult)));
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

    /** Where a building's `n` walkers start on a visit with no snapshot, and their kinds, on `day` (the save's
        day when left out): [{ x, y, type, rule }] (tile centres; rule: the index of the NOTES[id].walkers rule
        that placed it, -1 for the others). rng: the dice (Math.random). Called once the gun, the pole and the
        quest objects lie where they lie. Each walker starts on its own tile of floor the player can walk to
        (through the doors they can open, never in a locked room), at least walkerSpawn.minSteps from the start,
        never on a busy tile (spawnBusy), and out of earshot of the start where there is room (farther than
        Interior.HEAR in a straight line: minSteps along a diagonal is nearer than that, and a walker that close
        would wake as you come in; a rule's tiles with no such tile left still get its walker, nearer). First the
        note's rules, in order (WORLD.NOTES says what each field means): a rule's tiles are its z anchors' rings
        (r steps, doors shut) inside its zone, or its whole zone; a rule that names a landmark (`near`) rings the
        landmark's footprint itself, so "one by the robot" starts within r steps of the robot. They are closed
        to the other walkers (an exact rule closes its whole zone), so "one by the robot" stays one. Then the
        rest, over what is left (only inside an `all` rule's zone). Spacing: `gap` tiles apart where there is
        room (a rule's group by its anchors: `groupGap`), then closer, never two on a tile. Kinds: a rule's
        `type`, else the place's mix (placeMix). tests/validate-world.js (R6) checks every rule always has room,
        so the fallbacks never break a rule with today's layouts. */
    planWalkers(loc, tpl, start, n, day, rng) {
      const rnd = rng || Math.random;
      const today = day || State().save.day;
      const WS = W().SETTINGS.walkerSpawn;
      const rules = (W().NOTES[loc.id] || {}).walkers || [];
      const zones = tpl.walkerZones || {};
      const key = (x, y) => x + "," + y;
      const inRects = (rects, x, y) => rects.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
      const reach = this.reachable(Math.floor(start[0]), Math.floor(start[1]), true);
      const busy = this.spawnBusy(loc, tpl);
      const pool = []; // [tx, ty]: where a walker may start
      this.floors.forEach(([fx, fy]) => {
        const x = Math.floor(fx);
        const y = Math.floor(fy);
        if ((reach.get(key(x, y)) || 0) >= WS.minSteps && !busy.has(key(x, y))) pool.push([x, y]);
      });
      const inPool = new Set(pool.map(([x, y]) => key(x, y)));
      const hear = this.HEAR + 0.5; // (the half: a walker's middle, not its tile's edge)
      const quiet = ([x, y]) => Math.hypot(x + 0.5 - start[0], y + 0.5 - start[1]) >= hear;
      const anchors = []; // the z tiles, in reading order
      tpl.grid.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) if (row[x] === "z") anchors.push([x, y]);
      });
      const placed = [];
      const used = new Set();
      const closed = new Set(); // tiles the other walkers may not start on
      const spaced = (x, y, gap) => placed.every((p) => (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y) >= gap * gap);
      const pick = (cands, gaps) => {
        // out of earshot first (every spacing), then anywhere
        const calm = cands.filter(quiet);
        for (const list of calm.length < cands.length ? [calm, cands] : [cands]) {
          for (const gap of gaps) {
            const ok = list.filter(([x, y]) => !used.has(key(x, y)) && spaced(x, y, gap));
            if (ok.length) return ok[Math.floor(rnd() * ok.length)];
          }
        }
        return null;
      };
      const put = ([x, y], type, rule) => {
        used.add(key(x, y));
        placed.push({ x, y, type, rule });
      };
      let allZone = null;
      rules.forEach((r, ri) => {
        const Z = (r.zone && zones[r.zone]) || null;
        if (r.all) {
          if (Z) allZone = Z;
          return;
        }
        const own = (list) => list.filter(([x, y]) => inPool.has(key(x, y)) && (!Z || inRects(Z, x, y)));
        // its tiles: one ring per anchor, or the whole zone; one that names a landmark: one ring round its footprint
        const mark = r.near != null ? this.landmarkRect(r.near) : null;
        const rings = mark ? [own(this.ringFrom(mark[0], mark[1], r.r || WS.ring, mark[2], mark[3]))] : (Array.isArray(r.z) ? r.z : []).map((zi) => (anchors[zi] ? own(this.ringFrom(anchors[zi][0], anchors[zi][1], r.r || WS.ring)) : []));
        const area = rings.length ? [].concat(...rings) : Z ? own(pool) : [];
        area.forEach(([x, y]) => closed.add(key(x, y)));
        if (r.exact && Z) own(pool).forEach(([x, y]) => closed.add(key(x, y)));
        const want = Math.min(n - placed.length, this.ruleCount(r, n));
        for (let k = 0; k < want; k++) {
          const t = rings.length ? pick(rings[k % rings.length], [WS.groupGap, 1]) || pick(area, [WS.groupGap, 1]) : pick(area, [WS.gap, WS.groupGap, 1]);
          if (t) put(t, r.type || null, ri); // no room (never with today's layouts: R6): the rest below keeps the count
        }
      });
      const rest = pool.filter(([x, y]) => !closed.has(key(x, y)) && (!allZone || inRects(allZone, x, y)));
      while (placed.length < n) {
        const t = pick(rest, [WS.gap, WS.groupGap, 1]) || pick(pool, [1]);
        if (!t) break;
        put(t, null, -1);
      }
      const mix = this.placeMix("building", loc, today);
      return placed.map((p) => ({ x: p.x + 0.5, y: p.y + 0.5, type: p.type || W().pickWalkerType(mix, rnd), rule: p.rule }));
    },
    /** How many walkers a note's rule places when the building holds `total`: max(n, ceil(share x total)). */
    ruleCount(r, total) {
      return r.all ? 0 : Math.max(r.n || 0, r.share ? Math.ceil(r.share * total) : 0);
    },
    /** Tiles no walker starts on ("x,y"): every item, cache and stash spot and the key and scrap piles (taken or
        not), every note spot (at any reading level), the landmarks, every story quest's spot here (in any state),
        and the gun and the fishing pole lying here. */
    spawnBusy(loc, tpl) {
      const busy = new Set();
      tpl.grid.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) if ("ickny$1234".includes(row[x])) busy.add(x + "," + y);
      });
      Object.values(tpl.spots || {}).forEach(([x, y]) => busy.add(x + "," + y));
      (W().QUESTS || []).forEach((q) => q && q.at === loc.id && Array.isArray(q.spot) && busy.add(q.spot[0] + "," + q.spot[1]));
      [this.gunPickup, this.rodPickup].forEach((o) => o && busy.add(Math.floor(o.x) + "," + Math.floor(o.y)));
      return busy;
    },
    /** Tiles within r steps of (ax, ay) walking with every door shut, so inside that tile's room: [[x, y], ...].
        With (bx, by): of any tile of the rect from (ax, ay) to (bx, by) (a landmark's footprint, solid or not). */
    ringFrom(ax, ay, r, bx, by) {
      const m = this.solidMask();
      const gw = this.gw;
      const seen = new Set();
      const out = [];
      for (let y = ay; y <= (by == null ? ay : by); y++) {
        for (let x = ax; x <= (bx == null ? ax : bx); x++) {
          seen.add(x + "," + y);
          out.push([x, y]);
        }
      }
      let edge = out.slice();
      for (let d = 0; d < r; d++) {
        const next = [];
        edge.forEach(([x, y]) => {
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx;
            const ny = y + dy;
            const k = nx + "," + ny;
            if (nx < 0 || ny < 0 || nx >= gw || ny >= this.gh || seen.has(k) || m[ny * gw + nx] || this.grid[ny][nx] === "D") continue;
            seen.add(k);
            next.push([nx, ny]);
          }
        });
        out.push(...next);
        edge = next;
      }
      return out;
    },
    /** The footprint of the landmark called `name` here (its def's foot round its tile): [x0, y0, x1, y1], or null. */
    landmarkRect(name) {
      const lm = (this.landmarks || []).find((m) => m.def && m.def.name === name);
      if (!lm) return null;
      const [fw, fh] = lm.def.foot || [1, 1];
      return [lm.x - (fw >> 1), lm.y - (fh >> 1), lm.x + (fw >> 1), lm.y + (fh >> 1)];
    },
    /** The walker kinds of this place, "building" or "alarm" (WORLD.walkerWeights by danger, day and theme), less
        any kind a note's rule keeps to its own walkers (`only`: "One of them is big"). */
    placeMix(where, loc, day) {
      const mix = W().walkerWeights(where, { danger: loc.danger || 0, day, place: loc.id });
      ((W().NOTES[loc.id] || {}).walkers || []).forEach((r) => r.only && r.type && delete mix[r.type]);
      return mix;
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

    /** The cache lock's fixtures (WORLD.LOCKS): the search fixture on the counter or desk beside the main
        note, and the alarm panel on its wall. */
    placeLock(noteAt) {
      const L = Locks() && Locks().spec(this.loc.id);
      this.lockFix = null;
      this.lockPanel = null;
      if (!L) return;
      const st = State().locState(this.loc.id);
      if (L.search && noteAt) {
        const nx = Math.floor(noteAt[0]);
        const ny = Math.floor(noteAt[1]);
        const low = (x, y) => !!this.grid[y] && "CK".includes(this.grid[y][x]);
        const near = [[0, -1], [1, 0], [-1, 0], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy]) => [nx + dx, ny + dy]);
        const at = near.find(([x, y]) => low(x, y)) || near.find(([x, y]) => this.grid[y] && this.grid[y][x] === ".") || [nx, ny];
        const lift = { C: 0.45, K: 0.4 }[this.grid[at[1]][at[0]]] || 0;
        const F = FIXTURES[L.search.fixture] || FIXTURES.drawers;
        const img = D3().hasSprite(F.art) ? D3().sprite(F.art) : null;
        this.lockFix = { x: at[0] + 0.5, y: at[1] + 0.5, tx: at[0], ty: at[1], fixture: L.search.fixture };
        if (img) this.addProp({ x: at[0] + 0.5, y: at[1] + 0.5, img, scale: 0.34, lift, solid: false });
      }
      if (L.panel) {
        const [x, y, face] = L.panel.at;
        this.lockPanel = { x, y, face, off: st.alarmOff };
        this.paintPanel();
      }
    },
    paintPanel() {
      const pn = this.lockPanel;
      if (!pn || !D3().hasTexture("alarmPanel")) return;
      const tex = D3().texture(pn.off ? "alarmPanelOff" : "alarmPanel", this.palette);
      const k = pn.x + "," + pn.y;
      const cur = this.tileTex[k];
      const faces = cur && typeof cur === "object" && !cur.width ? cur : {};
      faces[pn.face] = tex;
      this.tileTex[k] = faces;
      if (this.refreshScene) this.refreshScene();
    },

    /* ---------- The locks: the player must do what the notes say ---------- */
    /** Pause for the lock prompt (js/locks.js); `then(result)` runs once it closes and the game is back. */
    lockPrompt(opts, then) {
      this.pause();
      const open = () =>
        Locks().prompt(
          Object.assign({}, opts, {
            onDone: (r) => {
              if (!this.running) return;
              this.resume();
              if (r && r.god) {
                this.toast("God mode. It opens.", 2.5);
                Audio().play("haven");
              }
              then(r || { cancel: true });
            },
          })
        );
      // the first lock: June's hint card first (owner decision 11: read the note, do just what it says; never the
      // answer). Not the crowbar prompt: it is no puzzle, and a jammed lock in an old save could be the first prompt met
      if (ZSR.Tutorial && opts.kind !== "crowbar") ZSR.Tutorial.first("lock", open);
      else open();
    },
    openCache(god) {
      const S = State();
      const cd = this.cacheDoor;
      cd.open = true;
      this.grid[cd.y][cd.x] = "D";
      this.maskDirty = true;
      this.doors.push({ x: cd.x, y: cd.y, open: true, cache: true });
      S.tripLoc(this.loc.id).cacheOpened = true;
      this.walkers.forEach((z) => (z.pathT = 0));
      const L = Locks().spec(this.loc.id);
      if (!god && L && L.panel && !S.locState(this.loc.id).alarmOff) {
        this.toast("Opened: " + this.loc.cacheName + ". But the alarm was still on!", 3);
        this.startAlarm();
      } else {
        this.toast("Opened: " + this.loc.cacheName + ".", 3);
        Audio().play("buy");
      }
      this.updateHud();
    },
    openStash(msg) {
      const d = this.stashDoor;
      d.open = true;
      this.grid[d.y][d.x] = "D";
      this.maskDirty = true;
      this.doors.push({ x: d.x, y: d.y, open: true, stash: true });
      State().tripLoc(this.loc.id).stashOpened = true;
      this.walkers.forEach((z) => (z.pathT = 0));
      this.toast(msg || "Opened: " + (this.loc.stashName || "the stash") + ".", 3);
      Audio().play("buy");
      this.updateHud();
    },
    /** A mistake costs what the note warned: "trap" (you go down), "alarm" (it rings), "jam" (the cache or stash jams). */
    lockFail(kind, which, say) {
      if (kind === "trap") return this.dieBy((say ? say + " " : "") + FAIL_SAY.trap);
      if (kind === "alarm") {
        this.toast((say ? say + " " : "") + FAIL_SAY.alarm, 3);
        return this.startAlarm();
      }
      if (kind === "jam") {
        State().tripLoc(this.loc.id)[which === "stash" ? "stashJammed" : "cacheJammed"] = true;
        this.toast((say ? say + " " : "") + FAIL_SAY.jam, 5);
        Audio().play("crunch");
        this.updateHud();
        return;
      }
      this.toast(say || "Nothing happens.", 3);
      Audio().play("wrong");
    },
    /** Down at once (a booby trap): no Medbay kit gets you up from this. */
    dieBy(reason) {
      if (State().cheat("noDie")) {
        this.toast("God mode: " + reason, 4);
        return;
      }
      this.deathReason = reason;
      Audio().play("poof");
      this.stop();
      if (this.hooks.onDeath) this.hooks.onDeath();
    },
    /** The alarm rings: walkers pour in, from deep inside and through the way out, until you go down (WORLD.ALARM).
        Their kinds: the place's alarm mix, less a kind a note keeps to one walker (placeMix). */
    startAlarm() {
      if (this.alarm) return;
      const loc = this.loc || {};
      const mix = this.placeMix("alarm", loc, State().save.day);
      this.alarm = { t: 0, next: W().ALARM.first, siren: 0, mix };
      this.toast("ALARM! Walkers are pouring in, even through the way out.", 4);
      this.updateHud();
    },
    updateAlarm(dt) {
      const A = this.alarm;
      if (!A) return;
      A.t += dt;
      A.next -= dt;
      A.siren -= dt;
      if (A.siren <= 0) {
        A.siren = 0.9;
        Audio().play("alarm");
      }
      if (A.next > 0) return;
      const AL = W().ALARM;
      A.next = Math.max(AL.minGap, AL.gap - A.t * AL.speedup); // faster and faster
      if (this.walkers.length >= AL.cap) return;
      const hpMult = W().walkerHpMult("alarm", State().save.day);
      const p = this.player;
      const add = (x, y) => {
        if (this.walkers.length >= AL.cap) return; // two a tick never overshoot the cap
        const z = this.makeWalker(W().pickWalkerType(A.mix || { walker: 1 }), x, y, hpMult);
        z.awake = true;
        this.walkers.push(z);
      };
      // one through the way out, so there is no leaving
      add(this.startPos[0] + rand(-0.15, 0.15), this.startPos[1] + rand(-0.15, 0.15));
      // and one from somewhere deeper in the building, farther than farFrom from you, on a tile no walker stands on
      // when there is one: floor it can walk to you from with the doors as they stand (walkers cannot open doors);
      // when you are shut in with no such floor, floor walkable from the way in through the doors (never a locked
      // room), where it waits for you behind a door
      if (this.walkers.length >= AL.cap) return;
      const area = this.alarmAreas(A);
      const gw = this.gw;
      const taken = new Set();
      this.walkers.forEach((z) => taken.add(Math.floor(z.y) * gw + Math.floor(z.x)));
      const ins = [Math.floor(p.y) * gw + Math.floor(p.x), Math.floor(this.startPos[1]) * gw + Math.floor(this.startPos[0])];
      const floors = this.floors;
      const px = p.x;
      const py = p.y;
      const r2 = AL.farFrom * AL.farFrom;
      const far = [];
      const free = [];
      for (let k = 0; k < 2; k++) {
        const lab = k ? area.through : area.here;
        const id = lab[ins[k]];
        if (id < 0) continue;
        for (let i = 0; i < floors.length; i++) {
          const f = floors[i]; // a tile centre
          const t = Math.floor(f[1]) * gw + Math.floor(f[0]);
          if (lab[t] !== id || (f[0] - px) * (f[0] - px) + (f[1] - py) * (f[1] - py) <= r2) continue;
          far.push(f);
          if (!taken.has(t)) free.push(f);
        }
        if (!far.length) continue;
        const from = free.length ? free : far;
        const [x, y] = from[Math.floor(Math.random() * from.length)];
        add(x, y);
        return;
      }
    },
    /** The building's walkable areas for the alarm's deeper walkers: `here` numbers each tile's area with the doors
        as they stand, `through` with every closed door open (locked doors stay walls), as reachable() walks them;
        -1 is solid. Kept on the alarm until a door opens or shuts, so a spawn tick does no search of the grid. */
    alarmAreas(A) {
      const sig = this.doors.map((d) => this.grid[d.y][d.x]).join("");
      if (A.areas && A.areas.sig === sig && A.areas.here.length === this.gw * this.gh) return A.areas;
      A.areas = { sig, here: this.areaLabels(false), through: this.areaLabels(true) };
      return A.areas;
    },
    /** Each tile's walkable area (Int32Array, -1 solid): 4-way connected floor of the movement mask, with closed
        doors passable when throughDoors. */
    areaLabels(throughDoors) {
      const m = this.solidMask();
      const gw = this.gw;
      const n = gw * this.gh;
      const lab = new Int32Array(n).fill(-1);
      const q = new Int32Array(n);
      const open = (i) => !m[i] || (throughDoors && this.grid[(i / gw) | 0][i % gw] === "O");
      let id = 0;
      let tail = 0;
      const push = (j) => {
        if (lab[j] >= 0 || !open(j)) return;
        lab[j] = id;
        q[tail++] = j;
      };
      for (let s = 0; s < n; s++) {
        if (lab[s] >= 0 || !open(s)) continue;
        let head = 0;
        tail = 0;
        push(s);
        while (head < tail) {
          const i = q[head++];
          const x = i % gw;
          if (x > 0) push(i - 1);
          if (x < gw - 1) push(i + 1);
          if (i >= gw) push(i - gw);
          if (i + gw < n) push(i + gw);
        }
        id++;
      }
      return lab;
    },
    /** The cache door: whatever its lock asks for (WORLD.LOCKS). */
    cacheInteract() {
      const S = State();
      const id = this.loc.id;
      const L = Locks().spec(id);
      const st = S.locState(id);
      if (st.cacheJammed) return this.crowbarPrompt("cache");
      if (!L) return this.openCache(false);
      const d = L.door;
      if (d.kind === "found") {
        if (st.cacheKey) return this.openCache(false);
        this.toast("Locked. It opens with " + L.search.find + ". A note here says where that is.", 3.5);
        Audio().play("wrong");
        return;
      }
      const a = Locks().answer(id);
      const opts = d.kind === "code"
        ? { kind: "code", caption: "Code lock", title: cap(this.loc.cacheName), text: "Type the code, then press Try it.", pattern: d.pattern }
        : { kind: "moves", caption: "Stuck", title: cap(this.loc.cacheName), text: "Pick the moves in order, then press Try it.", words: d.words, steps: a.moves.length };
      this.lockPrompt(opts, (r) => {
        if (r.cancel) return;
        if (r.god) return this.openCache(true);
        const ok = d.kind === "code" ? r.value === a.code.replace(/\D/g, "") : r.value.join("|") === a.moves.join("|");
        if (ok) return this.openCache(false);
        this.lockFail(d.fail, "cache", d.kind === "code" ? "Wrong code." : "Wrong moves.");
      });
    },
    /** The fixture by the main note: the right one holds what opens the cache door. */
    searchInteract() {
      const S = State();
      const id = this.loc.id;
      const L = Locks().spec(id);
      if (S.locState(id).cacheKey) {
        this.toast("You already have " + L.search.find + ".", 2.5);
        return;
      }
      const F = FIXTURES[L.search.fixture] || FIXTURES.drawers;
      const a = Locks().answer(id);
      this.lockPrompt({ kind: "choice", caption: "Search", title: cap(F.name), text: F.ask, go: "Open it", options: L.search.options.map((o) => ({ label: cap(o), value: o })) }, (r) => {
        if (r.cancel) return;
        if (r.god || r.value === a.pick) {
          S.tripLoc(id).cacheKey = true;
          this.toast("Found: " + L.search.find + ". It opens " + this.loc.cacheName + ".", 3.5);
          Audio().play("pickup");
          this.updateHud();
          return;
        }
        const say = L.search.fail === "jam" ? "You try that key in the lock of " + this.loc.cacheName + "." : "Not that one!";
        this.lockFail(L.search.fail, "cache", say);
      });
    },
    /** The alarm panel: press the right button before the door. */
    panelInteract() {
      const S = State();
      const id = this.loc.id;
      const L = Locks().spec(id);
      const pn = this.lockPanel;
      if (pn.off || S.locState(id).alarmOff) {
        this.toast("The alarm is off. Its light is green.", 2.5);
        return;
      }
      const a = Locks().answer(id);
      this.lockPrompt({ kind: "choice", caption: "Alarm panel", title: "The alarm panel", text: "Which button do you press?", go: "Press it", options: L.panel.options.map((o) => ({ label: cap(o) + " button", value: o })) }, (r) => {
        if (r.cancel) return;
        if (r.god || r.value === a.button) {
          S.tripLoc(id).alarmOff = true;
          pn.off = true;
          this.paintPanel();
          this.toast("The light turns green. The alarm is off.", 3);
          Audio().play("correct");
          return;
        }
        this.lockFail("alarm", "cache", "Wrong button.");
      });
    },
    /** The stash: try one of your keys. Which one fits, only the notes say. */
    stashInteract() {
      const S = State();
      const id = this.loc.id;
      const stashName = this.loc.stashName || "the stash";
      if (S.locState(id).stashJammed) return this.crowbarPrompt("stash");
      // its key snapped off in a wrong lock: a key is never found twice, so this stash stays shut (god mode still tries)
      const src = S.keySourceFor(id);
      if (src && S.keyBroken(src) && !S.god) {
        this.toast("Locked: " + stashName + ". Its key snapped off in a wrong lock. It is gone for good.", 4);
        Audio().play("wrong");
        return;
      }
      const held = S.keysHeld().filter((k) => !k.broken);
      if (!held.length) {
        this.toast("Locked: " + stashName + ". Its key is hidden in another building. Notes say where.", 3.5);
        Audio().play("wrong");
        return;
      }
      const L = Locks().spec(id);
      const right = S.keySourceFor(id);
      const options = held.map((k) => {
        const from = W().LOCATIONS.find((l) => l.id === k.from);
        return { label: ZSR.keyText(k.from).name, sub: "found at " + (from ? from.name : k.from), value: k.from };
      });
      this.lockPrompt({ kind: "choice", caption: "Stash", title: cap(stashName), text: "Which key do you try?", go: "Try this key", options }, (r) => {
        if (r.cancel) return;
        if (r.god) return this.openStash();
        if (r.value === right) return this.openStash("Your key fits. Opened: " + stashName + ".");
        const fail = (L && L.stashFail) || "none";
        const name = ZSR.keyText(r.value).name;
        if (fail === "break") {
          S.breakKey(r.value);
          this.toast("Wrong key! " + name + " snaps off in the lock. It is gone.", 4.5);
          Audio().play("crunch");
          this.updateHud();
        } else if (fail === "jam") this.lockFail("jam", "stash", "Wrong key!");
        else this.lockFail("none", "stash", "Wrong key. It will not turn.");
      });
    },
    /** A jammed lock: a crowbar from the workbench pries it open, and is spent. */
    crowbarPrompt(which) {
      const S = State();
      const n = S.crowbarsLeft();
      const name = which === "stash" ? this.loc.stashName || "the stash" : this.loc.cacheName;
      this.lockPrompt({ kind: "crowbar", caption: "Jammed", title: cap(name), text: "It is jammed tight. A crowbar can pry it open, and the crowbar breaks doing it. You have " + n + " crowbar" + (n === 1 ? "" : "s") + ". Build them at the office computer, in the Traps & tools tab (a short typing round at the workbench).", go: "Use a crowbar" /* (the computer's tab name: js/base.js TABS) */, goDisabled: n < 1 }, (r) => {
        if (r.cancel) return;
        if (!r.god && !S.useCrowbar()) return;
        const tl = S.tripLoc(this.loc.id);
        if (which === "stash") {
          tl.stashJammed = false;
          this.openStash("Pried open: " + name + ".");
        } else {
          tl.cacheJammed = false;
          this.openCache(true);
        }
      });
    },

    /** What this building looks like right now, so a return visit on the same trip finds it unchanged. */
    snapshot() {
      return {
        // (a walker's look and the way it faces come back too; a screamer that screamed does not scream again at once)
        walkers: this.walkers.map((z) => ({ type: z.type, x: z.x, y: z.y, hp: z.hp, maxHp: z.maxHp, seed: z.seed, heading: z.heading, screamed: !!z.screamed })),
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
        if (w.seed != null) z.seed = w.seed;
        if (w.heading != null) z.heading = w.heading;
        if (w.screamed) {
          z.screamed = true;
          z.screamT = W().SCREAM.cooldown;
        }
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
        never on a landmark's tiles, an item, a note, a scrap pile or a story quest's spot. Distances count every
        door as open, so where doors stand never moves it. Never behind the stash door either. */
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
      // every story quest's spot in this building (where its object or the dog waits) is busy too, whatever that
      // quest's state, so the gun's tile never moves as quests open and close. A gun the seed puts on a quest spot
      // takes the next tile of the same list instead (the list itself is left as it was, so every other gun stays
      // where it always lay): this moved a few guns' tiles once, the day the crew's quests came in.
      const quest = new Set((W().QUESTS || []).filter((q) => q && q.at === loc.id && Array.isArray(q.spot)).map((q) => q.spot[0] + "," + q.spot[1]));
      const free = ([x, y]) => !quest.has(Math.floor(x) + "," + Math.floor(y));
      const spots = [10, 5, 2].map(ok).find((list) => list.some(free));
      if (!spots) return;
      let h = S.save.weapons.seed || 1;
      for (const ch of loc.id) h = (h * 31 + ch.charCodeAt(0)) % 2147483647;
      let i = h % spots.length;
      while (!free(spots[i])) i = (i + 1) % spots.length;
      const [x, y] = spots[i];
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

    /* ---------- The crew's story quests (docs/CREW.md) ---------- */
    /** What waits here for an accepted story quest (State.questsAt: never one you already hold this trip, so a
        return visit rebuilds it from State): each story object lies on its spot (a qObj prop; walk over it), and
        the dog sits on its spot until you hold out the treats (E). The dog already following you this trip
        (trip.dog) comes in with you, beside you at the entrance; while it does, no other dog waits (one per trip). */
    placeQuestObjects(loc) {
      const S = State();
      this.questPickups = [];
      this.tripDog = null;
      const following = !!(S.trip && S.trip.dog);
      (S.questsAt ? S.questsAt(loc.id) : []).forEach((def) => {
        if (!def || !Array.isArray(def.spot)) return;
        const x = def.spot[0] + 0.5;
        const y = def.spot[1] + 0.5;
        if (def.kind === "dog") {
          if (!following && !this.tripDog) this.makeTripDog(x, y, def, false);
          return;
        }
        const prop = this.addProp({ x, y, art: "qObj", opts: { kind: def.object && def.object.art }, scale: artScale("qObj"), lift: 0 });
        this.questPickups.push({ id: def.id, def, x, y, taken: false, prop });
      });
      if (following) {
        const [x, y] = this.dogSpot();
        this.makeTripDog(x, y, null, true);
      }
    },
    /** The dog's state in this building: waiting on its quest's spot (def), or following you. Its prop is not solid. In
        3D (js/beast3d.js) it is a live figure, Beast3D's "dog" (prop.fig: tripDogAnim). */
    makeTripDog(x, y, def, follow) {
      const p = this.player;
      const d = { x, y, def, follow, pose: null, f: 0, ft: Math.random() * DOG.idleT, left: false, moving: false, spd: 0, stuck: 0, trail: [], seen: p ? [p.x, p.y] : null, prop: null, fig: null };
      d.fig = this.liveFigure ? this.liveFigure("beast", "dog", 7, p ? Math.atan2(p.y - y, p.x - x) : 0) : null;
      if (d.fig) d.fig.pose = d.fig.wantPose = "sit";
      d.prop = this.addProp(d.fig ? { x, y, fig: d.fig, lift: 0 } : { x, y, img: null, scale: artScale("crewDog"), lift: 0 });
      this.tripDog = d;
      this.dogLook(d, "sit", 0, false);
      return d;
    },
    /** Its picture: pose and frame (f exactly 0 or 1, and `left` only when true: Draw3 keeps one canvas per opts set). A
        live 3D figure keeps the names only (tripDogAnim draws the pose). */
    dogLook(d, pose, f, left) {
      const ff = f ? 1 : 0;
      if (d.fig) {
        d.pose = pose;
        d.f = ff;
        d.left = !!left;
        return;
      }
      if (d.prop.img && d.pose === pose && d.f === ff && d.left === !!left) return;
      d.pose = pose;
      d.f = ff;
      d.left = !!left;
      d.prop.img = D3().sprite("crewDog", left ? { pose, f: ff, left: true } : { pose, f: ff });
    },
    /** The dog's body at (x, y) would touch something solid for you (a wall, a closed door, a counter). */
    dogBlocked(x, y) {
      const r = DOG.r;
      return this.solidForPlayer(x - r, y - r) || this.solidForPlayer(x + r, y - r) || this.solidForPlayer(x - r, y + r) || this.solidForPlayer(x + r, y + r);
    },
    /** The dog can walk straight from (x0, y0) to (x1, y1): its whole body clears every wall on the way. */
    dogClear(x0, y0, x1, y1) {
      const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.2);
      for (let i = 1; i <= n; i++) if (this.dogBlocked(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n)) return false;
      return true;
    },
    /** Where the dog turns up beside you: about DOG.gap behind you, on floor it can stand on and walk straight to
        you from, out of your view when such a spot exists (else the best one in it). [x, y] */
    dogSpot() {
      const p = this.player;
      let best = null;
      const consider = (x, y, extra) => {
        if (this.dogBlocked(x, y) || !this.dogClear(p.x, p.y, x, y)) return;
        const off = Math.abs(normAngle(Math.atan2(y - p.y, x - p.x) - p.a));
        const score = (off >= DOG.hide ? 0 : 10) + Math.abs(Math.hypot(x - p.x, y - p.y) - DOG.gap) + extra;
        if (!best || score < best.score) best = { x, y, score };
      };
      // straight behind you, then a little to either side
      [0, 0.5, -0.5, 1, -1].forEach((da) => [DOG.gap, 0.8].forEach((r) => consider(p.x - Math.cos(p.a + da) * r, p.y - Math.sin(p.a + da) * r, 0)));
      // else the middle of a tile around you (in a narrow spot behind you is a wall)
      const px = Math.floor(p.x);
      const py = Math.floor(p.y);
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx || dy) consider(px + dx + 0.5, py + dy + 0.5, 0.2);
      return best ? [best.x, best.y] : [p.x, p.y];
    },
    /** E at the waiting dog: you hold out the treats and it follows you (State.takeDog: this trip only). */
    dogTreat(d) {
      const S = State();
      if (!d || d.follow) return;
      const giver = d.def ? ZSR.crewName(d.def.giver) : "";
      if (!S.takeDog || !S.takeDog(d.def && d.def.id)) {
        this.toast("The dog backs away from you.", 2.5);
        Audio().play("wrong");
        return;
      }
      const p = this.player;
      d.follow = true;
      d.moving = false;
      d.stuck = 0;
      d.trail.length = 0;
      d.seen = [p.x, p.y];
      // the last, shortest one is for Huge text on a small screen (toastFit keeps the longest that fits)
      const msgs = ["The dog eats " + (giver ? giver + "'s" : "the") + " treat and wags its tail. It will follow you to the van and home.", "The dog eats the treat. It will follow you now.", "The dog follows you."];
      this.toastFit(msgs, this.readSecs(msgs[0], 4.5), true);
      Audio().play("buy");
      this.updateHud();
    },
    /** The dog each frame: waiting, it sits and breathes; following, it comes after you along the way you went
        (straight to you when it can walk there, else to the newest point of your way it can walk straight to),
        settles DOG.gap from you and sits, and turns up just behind you when it falls far back or gets stuck (a
        door shut between you). Walkers never look at it and shots pass it by: it is only a prop. */
    updateTripDog(dt) {
      const d = this.tripDog;
      if (!d) return;
      const S = State();
      d.ft += dt;
      if (!d.follow) {
        if (d.def && S.questState && S.questState(d.def.id) !== "active") return this.dropTripDog(); // given up from the backpack
        if (d.ft >= DOG.idleT) {
          d.ft = 0;
          this.dogLook(d, "sit", d.f ? 0 : 1, d.left);
        }
        if (d.fig) this.tripDogAnim(d, dt, d.x, d.y, "sit");
        return;
      }
      if (!S.trip || !S.trip.dog) return this.dropTripDog(); // given up from the backpack: it trots off
      const p = this.player;
      const x0 = d.x;
      const y0 = d.y;
      let goal;
      let path;
      let lost = false;
      if (this.dogClear(d.x, d.y, p.x, p.y)) {
        d.trail.length = 0;
        // where it last could walk straight to you: kept in one array (no allocation a frame); the trail copies it
        if (d.seen) {
          d.seen[0] = p.x;
          d.seen[1] = p.y;
        } else d.seen = [p.x, p.y];
        goal = d.seen;
        path = Math.hypot(p.x - d.x, p.y - d.y);
      } else {
        // out of a straight line: your way since it last could walk straight to you
        const tr = d.trail;
        if (!tr.length) tr.push(d.seen ? [d.seen[0], d.seen[1]] : [p.x, p.y]);
        const last = tr[tr.length - 1];
        if (Math.hypot(p.x - last[0], p.y - last[1]) >= DOG.spacing) tr.push([p.x, p.y]);
        for (let j = tr.length - 1; j > 0; j--) {
          if (Math.hypot(tr[j][0] - d.x, tr[j][1] - d.y) <= DOG.far && this.dogClear(d.x, d.y, tr[j][0], tr[j][1])) {
            // a shortcut: the newest point it can walk straight to (dropped in place: no array a frame)
            tr.copyWithin(0, j);
            tr.length -= j;
            break;
          }
        }
        // still longer than it can remember after every shortcut: it has lost your way and catches up at once
        // (below), however well it is walking (a stuck timer would restart each frame it moves)
        lost = tr.length > TRAIL_MAX;
        goal = tr[0];
        path = Math.hypot(goal[0] - d.x, goal[1] - d.y) + Math.hypot(p.x - tr[tr.length - 1][0], p.y - tr[tr.length - 1][1]);
        for (let i = 1; i < tr.length; i++) path += Math.hypot(tr[i][0] - tr[i - 1][0], tr[i][1] - tr[i - 1][1]);
      }
      if (!d.moving && path > DOG.start) d.moving = true;
      else if (d.moving && path <= DOG.gap + 0.02) d.moving = false; // there (give or take a rounding)
      let want = 0;
      if (d.moving) {
        want = Math.min((path > DOG.runFrom ? DOG.run : DOG.walk) * dt, path - DOG.gap);
        const gx = goal[0] - d.x;
        const gy = goal[1] - d.y;
        const gd = Math.hypot(gx, gy);
        if (want > 0 && gd > 1e-4) {
          const step = Math.min(want, gd); // never past a point of your way
          this.moveCircle(d, (gx / gd) * step, (gy / gd) * step, DOG.r, true);
          if (d.trail.length && Math.hypot(goal[0] - d.x, goal[1] - d.y) < 0.05) d.trail.shift();
        }
      }
      const moved = Math.hypot(d.x - x0, d.y - y0);
      if (d.moving && want > 1e-4 && moved < want * 0.3) d.stuck += dt;
      else d.stuck = 0;
      let jumped = false;
      if (lost || Math.hypot(p.x - d.x, p.y - d.y) > DOG.far || d.stuck >= DOG.stuck) {
        [d.x, d.y] = this.dogSpot();
        d.trail.length = 0;
        d.seen = [p.x, p.y];
        d.stuck = 0;
        d.moving = false;
        jumped = true;
      }
      // the picture: walking, waiting at a shut door (stand), or sitting once it has caught up; it faces left when
      // it goes left across your view (against the view's right-hand direction, -sin a, cos a)
      const sp = jumped ? 0 : moved / Math.max(dt, 1e-3);
      d.spd = jumped ? 0 : d.spd * 0.75 + sp * 0.25;
      let left = d.left;
      if (!jumped && moved > 1e-4) {
        const across = ((d.x - x0) * -Math.sin(p.a) + (d.y - y0) * Math.cos(p.a)) / Math.max(dt, 1e-3);
        if (across < -0.4) left = true;
        else if (across > 0.4) left = false;
      }
      const pose = d.spd > 0.5 ? "walk" : d.moving ? "stand" : "sit";
      let f = d.f;
      if (pose !== d.pose) {
        d.ft = 0;
        f = 0;
      } else if (d.ft >= (pose === "walk" ? DOG.stepT : DOG.idleT)) {
        d.ft = 0;
        f = f ? 0 : 1;
      }
      this.dogLook(d, pose, f, left);
      d.prop.x = d.x;
      d.prop.y = d.y;
      if (d.fig) this.tripDogAnim(d, dt, x0, y0, pose);
    },
    /** How the dog looks this frame, in 3D (d.fig): walking or galloping by its speed (DOG.gallop: keeping up with you
        it gallops), sitting or standing turned to you when you are in sight (its head on you, the tail going), else as
        it was. */
    tripDogAnim(d, dt, x0, y0, pose) {
      const f = d.fig;
      const p = this.player;
      const speed = dt > 0 ? Math.hypot(d.x - x0, d.y - y0) / dt : 0;
      const moving = pose === "walk";
      const see = p && Math.hypot(p.x - d.x, p.y - d.y) <= DOG.far && this.lineClear(d.x, d.y, p.x, p.y);
      f.want = !moving && see ? Math.atan2(p.y - d.y, p.x - d.x) : null;
      f.wantPose = pose;
      f.wantRun = moving ? Math.max(0, Math.min(1, (speed - DOG.gallop[0]) / DOG.gallop[1])) : 0;
      f.wantWag = see ? (d.follow ? 0.8 : 0.6) : 0.4;
      f.lookX = see ? p.x : null;
      f.lookY = see ? p.y : null;
      this.figStep(f, dt, x0, y0, d.x, d.y);
    },
    /** The dog leaves the scene (its quest was given up): its picture goes. */
    dropTripDog() {
      const d = this.tripDog;
      if (d && d.prop) d.prop.hidden = true;
      this.tripDog = null;
      this.updateHud();
    },
    /** The following dog's body is in this open door's doorway (shutting it would shut on the dog). */
    dogInDoorway(door) {
      const d = this.tripDog;
      if (!door || !door.open || !d || !d.follow) return false;
      return Math.abs(d.x - door.x - 0.5) < 0.5 + DOG.r && Math.abs(d.y - door.y - 0.5) < 0.5 + DOG.r;
    },
    /** E at an open door the following dog stands in. It trails you, so right after you walk through a door and
        turn round it sits in that doorway: a refusal would mean you could never shut a door behind you while it
        follows. So it never shuts on the dog: the dog trots through to your side first (the nearest spot there to
        where it stands, else beside you), and the core shuts the door. Returns true only to refuse (no spot). */
    buildingDoor(door) {
      if (!this.dogInDoorway(door)) return false;
      const p = this.player;
      if ((Math.floor(p.x) === door.x && Math.floor(p.y) === door.y) || this.walkerOnTile(door.x, door.y)) return false; // the core refuses
      const d = this.tripDog;
      // where it can stand on your side: worked out as if the door were shut already (a shut door is solid)
      this.grid[door.y][door.x] = "O";
      this.maskDirty = true;
      const ok = (x, y) => !this.dogBlocked(x, y) && this.dogClear(p.x, p.y, x, y);
      let best = null;
      const cx = door.x + 0.5;
      const cy = door.y + 0.5;
      const dl = Math.hypot(p.x - cx, p.y - cy) || 1;
      for (const t of [0.75, 0.9, 1.1, 1.3]) {
        for (const s of [0, 0.3, -0.3]) {
          // from the door toward you, a little to either side
          const x = cx + ((p.x - cx) / dl) * t - ((p.y - cy) / dl) * s;
          const y = cy + ((p.y - cy) / dl) * t + ((p.x - cx) / dl) * s;
          const dd = Math.hypot(x - d.x, y - d.y);
          if ((!best || dd < best.dd) && ok(x, y)) best = { x, y, dd };
        }
      }
      const spot = best ? [best.x, best.y] : this.dogSpot();
      this.grid[door.y][door.x] = "D";
      this.maskDirty = true;
      d.x = spot[0];
      d.y = spot[1];
      d.prop.x = d.x;
      d.prop.y = d.y;
      d.trail.length = 0;
      d.seen = [p.x, p.y];
      d.moving = false;
      d.stuck = 0;
      if (!this.dogInDoorway(door)) return false;
      this.toast("The dog is in the doorway.", 2); // nowhere on your side for it (never seen in the layouts)
      Audio().play("wrong");
      return true;
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
        // which stash it opens is in the note, not on the key: read it again before you try the key
        const msgs = ["Found: " + kt.name + ". The note says which stash it opens. Get it home to keep it.", "Found: " + kt.name + "."];
        this.toastFit(msgs, this.readSecs(msgs[0], 5), true);
        if (kt.tag) {
          if (S.trip) S.trip.wordsRead += ZSR.wordCount(kt.tag);
          this.tagPanel = { key: "key:" + kp.from + ":" + this.time, kind: "tag", title: kt.name, status: "A stash key", text: kt.tag, until: this.time + this.readSecs(kt.tag, 8) };
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
      (this.questPickups || []).forEach((q) => {
        if (q.taken) return;
        if (S.questState && S.questState(q.id) !== "active") {
          // given up from the backpack while you are in here: it is not wanted any more
          q.taken = true;
          q.prop.hidden = true;
          this.updateHud();
          return;
        }
        if (Math.hypot(q.x - p.x, q.y - p.y) >= 0.6 || !S.takeQuestObject(q.id)) return;
        // a trip item like the gun: yours once it is home, lost if you go down; the giver gets it by talking
        q.taken = true;
        q.prop.hidden = true;
        const name = objName(q.def);
        const giver = ZSR.crewName(q.def.giver);
        const msgs = ["Found: " + name + ". Bring it home to " + giver + ".", "Found: " + name + ".", "Found it!"]; // the last: Huge text, small screen
        this.toastFit(msgs, this.readSecs(msgs[0], 4.5), true);
        // the words at the reading level, any placeholder filled (a tag may name the reward)
        const tag = ZSR.crewFill(ZSR.crewText("quest", q.id, "tag"), S.requestVars ? S.requestVars({ kind: "quest", def: q.def }) : {}).trim();
        if (tag) {
          S.seeCrewTalk("quest:" + q.id + ":tag", ZSR.wordCount(tag)); // its words count once, toward this trip
          this.tagPanel = { key: "quest:" + q.id + ":" + this.time, kind: "tag", title: name, status: "For " + giver, text: tag, until: this.time + this.readSecs(tag, 8) };
        }
        Audio().play("buy");
        this.updateHud();
      });
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
    buildingUpdate(dt) {
      this.updatePickups();
      this.updateAlarm(dt || 0);
      this.updateTripDog(dt || 0);
      if (this.roboUpdate) this.roboUpdate(dt || 0);
    },
    buildingFacing(cand) {
      this.notes.forEach((n) => this.noteVisible(n) && cand.push({ kind: "note", obj: n, x: n.x, y: n.y }));
      // the waiting dog, in sight (REACH.dog); right under the crosshair it wins over a door beside it
      const dg = this.tripDog;
      const p = this.player;
      const dd = dg ? Math.hypot(dg.x - p.x, dg.y - p.y) : Infinity;
      if (dg && !dg.follow && dd <= ((this.REACH && this.REACH.dog) || 2.2) && this.lineClear(p.x, p.y, dg.x, dg.y)) {
        const aimed = Math.abs(normAngle(Math.atan2(dg.y - p.y, dg.x - p.x) - p.a)) <= Math.atan2(DOG.aim, dd);
        cand.push({ kind: "dog", obj: dg, x: dg.x, y: dg.y, aim: aimed ? 0.6 : 0 });
      }
      if (this.cacheDoor && !this.cacheDoor.open) cand.push({ kind: "cache", obj: this.cacheDoor, x: this.cacheDoor.x + 0.5, y: this.cacheDoor.y + 0.5 });
      if (this.stashDoor && !this.stashDoor.open) cand.push({ kind: "stash", obj: this.stashDoor, x: this.stashDoor.x + 0.5, y: this.stashDoor.y + 0.5 });
      if (this.lockFix) cand.push({ kind: "fixture", obj: this.lockFix, x: this.lockFix.x, y: this.lockFix.y });
      const pn = this.lockPanel;
      if (pn) {
        const [dx, dy] = SIDES[pn.face] || [0, 0];
        cand.push({ kind: "panel", obj: pn, x: pn.x + 0.5 + dx * 0.5, y: pn.y + 0.5 + dy * 0.5 });
      }
      if (this.exit) cand.push({ kind: "exit", obj: this.exit, x: this.exit.x + 0.5, y: this.exit.y + 0.5 });
    },
    buildingInteract(f) {
      const S = State();
      if (f.kind === "note") {
        if (this.hooks.onReadNote) this.hooks.onReadNote(f.obj, this.loc);
      } else if (f.kind === "cache") {
        this.cacheInteract();
      } else if (f.kind === "stash") {
        this.stashInteract();
      } else if (f.kind === "fixture") {
        this.searchInteract();
      } else if (f.kind === "panel") {
        this.panelInteract();
      } else if (f.kind === "dog") {
        this.dogTreat(f.obj);
      } else if (f.kind === "exit") {
        if (this.alarm) {
          this.toast("Walkers pack the way out. There is no getting out now.", 3);
          Audio().play("wrong");
          return;
        }
        if (this.hooks.onExit) this.hooks.onExit();
      }
    },
    buildingHint(f) {
      if (f.kind === "note") return "Press E to read the note";
      const S = State();
      const st = S.locState(this.loc.id);
      const L = Locks() && Locks().spec(this.loc.id);
      if (f.kind === "cache") {
        if (st.cacheJammed) return cap(this.loc.cacheName) + " is jammed: press E to pry it open";
        const k = L && L.door.kind;
        if (k === "code") return "Press E to use the keypad";
        if (k === "moves") return "Press E to work the lock";
        if (k === "found" && !st.cacheKey) return cap(this.loc.cacheName) + ": locked";
        return "Press E to open " + this.loc.cacheName;
      }
      if (f.kind === "stash") {
        if (st.stashJammed) return cap(this.loc.stashName) + " is jammed: press E to pry it open";
        const src = S.keySourceFor(this.loc.id);
        if (src && S.keyBroken(src) && !S.god) return cap(this.loc.stashName) + ": locked. Its key is gone.";
        return "Press E to try a key in " + this.loc.stashName;
      }
      if (f.kind === "fixture") return st.cacheKey ? "You already searched " + (FIXTURES[f.obj.fixture] || FIXTURES.drawers).name : "Press E to search " + (FIXTURES[f.obj.fixture] || FIXTURES.drawers).name;
      if (f.kind === "panel") return f.obj.off ? "The alarm panel: off" : "Press E to use the alarm panel";
      if (f.kind === "dog") return f.obj.def ? "Press E to hold out " + ZSR.crewName(f.obj.def.giver) + "'s treats" : "";
      if (f.kind === "exit") return this.alarm ? "Walkers pack the way out" : "Press E to leave for the van";
      return "";
    },
    buildingGoal() {
      const left = this.items.filter((i) => !i.taken && !i.source).length;
      const cacheLeft = this.items.filter((i) => !i.taken && i.source === "cache").length;
      const st = State().locState(this.loc.id);
      const cacheState = this.cacheDoor ? (this.cacheDoor.open ? "open" : st.cacheJammed ? "jammed" : "locked") : "none";
      const sd = this.stashDoor;
      const stashState = !sd ? "" : sd.open ? "open" : st.stashJammed ? "jammed" : "locked";
      // a story object (or the dog) still waiting here for a crew member's request (the M map never shows it)
      const finds = (this.questPickups || []).filter((q) => !q.taken).map((q) => "Find " + inText(objName(q.def)) + " for " + ZSR.crewName(q.def.giver));
      const dg = this.tripDog;
      if (dg && !dg.follow && dg.def) finds.push("Find the dog for " + ZSR.crewName(dg.def.giver)); // a stray until it is home
      return (this.alarm ? "ALARM! · " : "") + (left ? left + " item" + (left > 1 ? "s" : "") + " on the floor" : "Floor cleared") + " · " + this.loc.cacheName + ": " + cacheState + (cacheLeft && cacheState === "open" ? ", " + cacheLeft + " left" : "") + (sd ? " · " + this.loc.stashName + ": " + stashState : "") + finds.map((t) => " · " + t).join("");
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
