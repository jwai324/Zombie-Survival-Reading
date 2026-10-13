/* First person on a grid: buildings and the home-base yard.
   WASD / arrows to move and turn, mouse to look (pointer lock when allowed,
   plain mouse movement otherwise), click or Space to fire, E to interact,
   1 to 5, Q or the mouse wheel to switch guns, B for the backpack, P or Esc to pause.
   Buildings: items, notes, a locked cache room, walkers, an exit, and sometimes a gun.
   Yard: a fence you can shoot over, waves in phases (calm / some / many),
   the cabin door (build menu) and the van (map).
   Everything reads and writes the trip through ZSR.State. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const D3 = () => ZSR.Draw3;
  const W = () => ZSR.WORLD;

  const FOV = 1.22; // ~70 degrees
  const COL = 2; // pixels per ray
  const SOLID = "#SCXGLETHBVFOKW"; // blocks movement (O is a closed door, K the stash door, W a wall with a sign)
  const OPAQUE = "#SCXGLETHBVOKW"; // blocks sight and rays (fence F is see-through)
  const HEIGHT = { V: 0.8, T: 1.45 }; // wall heights in tiles; everything else is 1
  const CABIN = { eave: 1.0, ridge: 1.7 }; // the cabin's walls stop at the eave; the roof peaks at the ridge
  const WALKER_TYPES = {
    walker: { hp: 30, speed: 1.25, r: 0.32, dmgKey: "footDamageWalker", scrap: 2 },
    runner: { hp: 18, speed: 2.4, r: 0.28, dmgKey: "footDamageRunner", scrap: 3 },
    brute: { hp: 90, speed: 0.95, r: 0.4, dmgKey: "footDamageBrute", scrap: 5 },
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const normAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const TEX_OF = { S: "shelf", C: "counter", X: "crate", G: "glass", L: "locked", E: "exit", T: "tree", H: "house", B: "door", V: "van", O: "doorClosed", K: "stash", W: "sign" };
  const READ_REACH = 2.3; // how close a wall sign or a yard lot must be to read it
  const words = (t) => String(t || "").trim().split(/\s+/).filter(Boolean).length;

  const Interior = {
    canvas: null,
    ctx: null,
    running: false,
    paused: false,
    mode: null, // "building" | "yard"
    hooks: {},
    locked: false,

    init(canvas, hooks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.hooks = hooks || {};
      this.keys = {};
      this.mouseDown = false;
      const $ = (id) => document.getElementById(id);
      this.hud = { root: $("int-hud"), hpFill: $("int-hp-fill"), hpText: $("int-hp-text"), scrap: $("int-scrap"), cargo: $("int-cargo"), walkers: $("int-walkers"), gun: $("int-gun"), place: $("int-place"), goal: $("int-goal"), hint: $("int-hint"), toast: $("int-toast"), phase: $("int-phase"), read: $("int-read") };
      this.bind();
      root.addEventListener("resize", () => this.resize());
      this.resize();
    },

    resize() {
      // one physical pixel per CSS pixel: the chunky comic look survives and the per-column fills stay cheap
      const dpr = 1;
      this.dpr = dpr;
      this.W = root.innerWidth;
      this.H = root.innerHeight;
      this.canvas.width = Math.round(this.W * dpr);
      this.canvas.height = Math.round(this.H * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.imageSmoothingEnabled = false;
      this.cols = Math.ceil(this.W / COL);
      this.zbuf = new Float32Array(this.cols);
      this.fbuf = new Float32Array(this.cols);
    },

    /* ---------- Input ---------- */
    bind() {
      const c = this.canvas;
      c.addEventListener("mousedown", (e) => {
        if (!this.running || this.paused) return;
        if (e.button === 0) {
          Audio().unlock();
          this.mouseDown = true;
          if (!this.locked && c.requestPointerLock) {
            try {
              const p = c.requestPointerLock();
              if (p && p.catch) p.catch(() => {});
            } catch (err) {
              /* refused: plain mouse movement still turns */
            }
          }
        }
        e.preventDefault();
      });
      root.addEventListener("mouseup", (e) => {
        if (e.button === 0) this.mouseDown = false;
      });
      c.addEventListener("mousemove", (e) => {
        if (!this.running || this.paused) return;
        const dx = e.movementX || 0;
        if (dx) this.player.a += dx * 0.0022 * (State().settings.mouseSens || 1);
      });
      c.addEventListener("contextmenu", (e) => e.preventDefault());
      c.addEventListener(
        "wheel",
        (e) => {
          if (!this.running || this.paused) return;
          e.preventDefault();
          const now = performance.now();
          if (now - (this.wheelT || 0) < 150) return; // one notch, one gun
          this.wheelT = now;
          this.cycleWeapon(e.deltaY > 0 ? 1 : -1);
        },
        { passive: false }
      );
      document.addEventListener("pointerlockchange", () => {
        this.locked = document.pointerLockElement === c;
        if (!this.locked && this.running && !this.paused && !this.releasing && this.hooks.onPause) this.hooks.onPause();
        this.releasing = false;
      });
      // physical key positions, so WASD works on any keyboard layout
      const CODE = { KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", KeyE: "e", KeyB: "b", KeyP: "p", KeyT: "t", KeyR: "r", KeyQ: "q", Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4", Digit5: "5", Numpad1: "1", Numpad2: "2", Numpad3: "3", Numpad4: "4", Numpad5: "5", Space: " ", ShiftLeft: "shift", ShiftRight: "shift", ArrowUp: "arrowup", ArrowDown: "arrowdown", ArrowLeft: "arrowleft", ArrowRight: "arrowright", Escape: "escape" };
      const keyOf = (e) => CODE[e.code] || e.key.toLowerCase();
      root.addEventListener("keydown", (e) => {
        if (!this.running) return;
        const k = keyOf(e);
        if (this.paused) {
          // menus and the workbench own the keyboard; P and Esc still close the pause menu
          if ((k === "p" || k === "escape") && this.hooks.onPauseKey) this.hooks.onPauseKey();
          return;
        }
        if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " ", "e", "shift", "b", "t", "r"].includes(k)) e.preventDefault();
        if (e.repeat) return;
        this.keys[k] = true;
        if (k === "e") this.interact();
        if ((k === "p" || k === "escape") && this.hooks.onPause) this.hooks.onPause();
        if (k === "b" && this.hooks.onBackpack) this.hooks.onBackpack();
        if ((k === "t" || k === "r") && this.mode === "yard") this.placeTrap(k === "t" ? "spike" : "blast");
        if (k === "q") this.cycleWeapon(1);
        if (k >= "1" && k <= "5" && k.length === 1) {
          const id = ZSR.Weapons.ORDER.find((w) => ZSR.Weapons.WEAPONS[w].slot === Number(k));
          if (id) this.switchWeapon(id);
        }
      });
      root.addEventListener("keyup", (e) => {
        this.keys[keyOf(e)] = false;
      });
      // a click outside the page (the chat beside an embedded game) never sends keyup: drop keys and pause
      root.addEventListener("blur", () => {
        this.keys = {};
        this.mouseDown = false;
        if (this.running && !this.paused && this.hooks.onPause) this.hooks.onPause();
      });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden && this.running && !this.paused && this.hooks.onPause) this.hooks.onPause();
      });
    },

    /* ---------- Shared construction ---------- */
    loadGrid(rows, palette) {
      this.grid = rows.map((r) => r.split(""));
      this.gh = this.grid.length;
      this.gw = this.grid[0].length;
      this.palette = palette;
      this.items = [];
      this.notes = [];
      this.piles = [];
      this.walkers = [];
      this.fence = {}; // "x,y" -> hp
      this.doors = []; // interior doors: { x, y, open }
      this.traps = []; // yard traps: { x, y, type, uses }
      this.cacheDoor = null;
      this.stashDoor = null; // { x, y, open } opens with the key from another building
      this.keyPickup = null; // this building's key on its y spot: { x, y, from, taken }
      this.signs = []; // wall signs and graffiti: { x, y, id, kind }
      this.lots = []; // yard lots: { room, x, y }
      this.panelKey = null; // what the read-up-close panel shows now
      this.tagPanel = null; // an item tag shown for a few seconds after a pickup: { key, title, text, until }
      this.gunPickup = null; // a weapon lying in this building: { x, y, id, taken }
      this.exit = null;
      this.door = null;
      this.van = null;
      this.cabin = null;
      this.tileTex = {}; // "x,y" -> texture name override
      this.hudSig = null;
      this.spawns = [];
      this.floors = [];
      this.noise = -99;
      this.noiseR = 0; // how far the last shot carried (tiles)
      this.time = 0;
      this.shake = 0;
      this.phase = null;
    },
    startLoop() {
      this.hud.root.classList.remove("hidden");
      this.running = true;
      this.paused = false;
      this.last = 0;
      this.keys = {};
      this.mouseDown = false;
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame((ts) => this.frame(ts));
      this.updateHud();
    },
    makePlayer(x, y, a) {
      const S = State();
      const fx = S.effects();
      this.fx = fx;
      this.gun = S.weaponStats();
      const maxHp = S.footMaxHp();
      this.player = { x, y, a, hp: clamp(S.trip ? S.trip.footHp : maxHp, 1, maxHp), maxHp, cooldown: 0, bob: 0, flash: 0, flashL: 0, flashR: 0, side: "L", draw: 0, raise: 1, hurt: 0, moving: false };
    },
    makeWalker(type, x, y, hpMult) {
      const t = WALKER_TYPES[type];
      return { type, x, y, hp: Math.round(t.hp * hpMult), maxHp: Math.round(t.hp * hpMult), speed: t.speed * rand(0.9, 1.1), r: t.r, dmg: W().SETTINGS[t.dmgKey], dps: W().DEFENSE.fenceDps[type], scrap: t.scrap, awake: false, path: [], pathT: rand(0, 0.4), cool: 0, hit: 0, frame: 0, frameT: rand(0, 0.3), hurtT: 0, fenceTarget: null };
    },

    /* ---------- Buildings ---------- */
    enter(loc) {
      const S = State();
      const tpl = W().TEMPLATES[loc.template];
      this.mode = "building";
      this.loc = loc;
      this.loadGrid(tpl.grid, tpl.palette);
      const st = S.locState(loc.id);
      const snap = S.trip && S.trip.rooms && S.trip.rooms[loc.id]; // this trip's earlier visit: exactly as you left it
      const N = W().NOTES[loc.id];
      const level = S.settings.level;
      const signs = N.signs || [];
      let itemIdx = 0;
      let cacheIdx = 0;
      let stashIdx = 0;
      let signIdx = 0;
      const spotAt = {}; // note spot number -> [x, y]
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
          } else if (ch === "n" || (ch >= "1" && ch <= "7")) {
            spotAt[ch === "n" ? "1" : ch] = [cx, cy];
            this.grid[y][x] = ".";
          } else if (ch === "y") {
            if (N.key) this.keyPickup = { x: cx, y: cy, from: loc.id, taken: S.hasKeyFrom(loc.id) };
            this.grid[y][x] = ".";
          } else if (ch === "W") {
            const sg = signs[signIdx++];
            if (sg) {
              this.signs.push({ x, y, id: sg.id, kind: sg.kind });
              if (sg.kind === "graffiti") this.tileTex[x + "," + y] = "graffiti";
            }
          } else if (ch === "K") {
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
          }
          if (this.grid[y][x] === ".") this.floors.push([cx, cy]);
        }
      }
      // notes go on their numbered spots; a dead-end note above this reading level is not placed,
      // and a note that follows another (`after`) stays hidden until that one has been read
      N.notes.forEach((n) => {
        const at = spotAt[String(n.spot || 1)];
        if (!at || (n.minLevel || 1) > level) return;
        this.notes.push({ x: at[0], y: at[1], id: n.id, found: n.found, unlocks: n.unlocks, reveals: n.reveals || [], after: n.after || null, read: S.noteRead(n.id) });
      });
      const ex = this.exit.x;
      const ey = this.exit.y;
      const g = this.grid;
      const start = ey > 0 && !SOLID.includes(g[ey - 1][ex]) ? [ex + 0.5, ey - 0.5, -Math.PI / 2] : ey < this.gh - 1 && !SOLID.includes(g[ey + 1][ex]) ? [ex + 0.5, ey + 1.5, Math.PI / 2] : [ex + 1.5, ey + 0.5, 0];
      this.makePlayer(start[0], start[1], start[2]);
      if (this.fx.fullHealOnEntry) this.player.hp = this.player.maxHp;

      if (snap) {
        this.restore(snap);
      } else {
        const day = S.save.day;
        const n = W().SETTINGS.walkersPerLocation(loc.danger, day);
        // extra walkers go on floor tiles the player can actually reach, at least 6 steps from the door
        const reach = this.reachable(Math.floor(start[0]), Math.floor(start[1]));
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
      S.tripLoc(loc.id).visits += 1;
      if (!S.trip.visited.includes(loc.id)) S.trip.visited.push(loc.id);
      this.hud.place.textContent = loc.name;
      this.hud.phase.classList.add("hidden");
      this.startLoop();
      this.toast(snap ? "Back inside. It is just as you left it." : "Walkers inside. E reads notes and opens doors. B is the backpack.", 3.5);
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
    },

    /** A weapon still lying in this building goes on a floor tile well inside: the same tile on
        every visit of this save (seeded), never on an item, a note or a scrap pile, never in the
        cache. Distances count every door as open, so where doors stand never moves it. */
    placeGun(loc, start) {
      const S = State();
      const id = S.weaponAt(loc.id);
      if (!id) return;
      const cd = this.cacheDoor;
      const sd = this.stashDoor;
      const pass = (x, y) => !(cd && x === cd.x && y === cd.y) && !(sd && x === sd.x && y === sd.y) && (this.grid[y][x] === "O" || !SOLID.includes(this.grid[y][x]));
      const sx = Math.floor(start[0]);
      const sy = Math.floor(start[1]);
      const reach = new Map([[sx + "," + sy, 0]]);
      const q = [[sx, sy]];
      while (q.length) {
        const [x, y] = q.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= this.gw || ny >= this.gh || reach.has(nx + "," + ny) || !pass(nx, ny)) continue;
          reach.set(nx + "," + ny, reach.get(x + "," + y) + 1);
          q.push([nx, ny]);
        }
      }
      const busy = new Set(this.items.concat(this.notes, this.piles, this.keyPickup ? [this.keyPickup] : []).map((o) => Math.floor(o.x) + "," + Math.floor(o.y)));
      const ok = (min) => this.floors.filter(([x, y]) => {
        const k = Math.floor(x) + "," + Math.floor(y);
        return (reach.get(k) || 0) >= min && !busy.has(k);
      });
      const spots = ok(5).length ? ok(5) : ok(2);
      if (!spots.length) return;
      let h = S.save.weapons.seed || 1;
      for (const ch of loc.id) h = (h * 31 + ch.charCodeAt(0)) % 2147483647;
      const [x, y] = spots[h % spots.length];
      this.gunPickup = { x, y, id, taken: false };
    },
    /** Put a held weapon in your hands. */
    switchWeapon(id) {
      const S = State();
      if (!this.player || id === this.gun.id) return false;
      if (!S.hasWeapon(id)) {
        this.toast(ZSR.Weapons.WEAPONS[id].name + ": not found yet. It is somewhere out there.", 2.5);
        Audio().play("wrong");
        return false;
      }
      S.equipWeapon(id);
      this.gun = S.weaponStats(id);
      const p = this.player;
      p.raise = 1;
      p.draw = 0;
      p.cooldown = Math.max(p.cooldown, 0.3);
      Audio().play("equip");
      this.toast(this.gun.name, 1.5);
      this.updateHud();
      return true;
    },
    cycleWeapon(dir) {
      const held = State().weaponsHeld();
      if (held.length < 2) {
        this.toast("Only the pistol so far. Other guns are out there in the city.", 2.5);
        return;
      }
      const i = held.indexOf(this.gun.id);
      this.switchWeapon(held[(i + dir + held.length) % held.length]);
    },

    /* ---------- The yard (cabin defense) ---------- */
    enterYard(opts) {
      const S = State();
      const Y = W().YARD;
      this.mode = "yard";
      this.loc = { id: "base", name: "Home Base", cacheName: "" };
      this.loadGrid(Y.grid, Y.palette);
      const fenceHp = W().DEFENSE.fenceHp[S.save.rooms.walls] || W().DEFENSE.fenceHp[0];
      const savedFence = S.save.fence || {}; // holes and cracks never close on their own
      let start = [2.5, 2.5, -Math.PI / 2];
      let cab = null;
      for (let y = 0; y < this.gh; y++) {
        for (let x = 0; x < this.gw; x++) {
          const ch = this.grid[y][x];
          if (ch === "P") {
            start = [x + 0.5, y + 0.5, -Math.PI / 2];
            this.grid[y][x] = ".";
          } else if (ch === "z") {
            this.spawns.push([x + 0.5, y + 0.5]);
            this.grid[y][x] = ".";
          } else if (ch === "F") {
            const key = x + "," + y;
            const hp = savedFence[key] != null ? Math.min(fenceHp, savedFence[key]) : fenceHp;
            if (hp > 0) this.fence[key] = hp;
            else this.grid[y][x] = "."; // a hole
          } else if (ch === "B" || ch === "H") {
            if (ch === "B") this.door = { x, y };
            cab = cab ? { x0: Math.min(cab.x0, x), x1: Math.max(cab.x1, x + 1), y0: Math.min(cab.y0, y), y1: Math.max(cab.y1, y + 1) } : { x0: x, x1: x + 1, y0: y, y1: y + 1 };
          } else if (ch === "V" && !this.van) {
            this.van = { x, y };
          }
          if (this.grid[y][x] === ".") this.floors.push([x + 0.5, y + 0.5]);
        }
      }
      if (cab) {
        // a gabled roof: the ridge runs along the long side, the end walls carry the gable
        const alongX = cab.x1 - cab.x0 >= cab.y1 - cab.y0;
        this.cabin = Object.assign(cab, { alongX, ridge: alongX ? (cab.y0 + cab.y1) / 2 : (cab.x0 + cab.x1) / 2, half: alongX ? (cab.y1 - cab.y0) / 2 : (cab.x1 - cab.x0) / 2 });
        // windows either side of the door on the front wall
        if (this.door) {
          this.tileTex[this.door.x - 1 + "," + this.door.y] = "houseWindow";
          this.tileTex[this.door.x + 1 + "," + this.door.y] = "houseWindow";
        }
      }
      this.fenceMax = fenceHp;
      this.lots = Object.entries(Y.lots || {}).map(([room, [x, y]]) => ({ room, x: x + 0.5, y: y + 0.5 }));
      this.traps = (S.save.yardTraps || []).map((t) => Object.assign({}, t));
      this.makePlayer(start[0], start[1], start[2]);
      this.player.hp = this.player.maxHp; // home: rested
      this.waveIndex = S.save.wave || 0; // escalation survives a reload and the yard button; resets when a day passes
      this.phase = { kind: "calm", t: (opts && opts.firstCalm) || W().DEFENSE.firstCalmSeconds, total: 0, spawned: 0, spawnT: 0, size: "none" };
      this.hud.place.textContent = "Home Base";
      this.hud.phase.classList.remove("hidden");
      this.startLoop();
      const holes = this.fenceHoles().length;
      this.toast(holes ? "Home. The fence has " + holes + " hole" + (holes > 1 ? "s" : "") + ". E at a gap fixes it for 1 scrap." : "Home. Quiet for now.", holes ? 4.5 : 3);
    },

    /** Fence state to save: every segment's health; 0 is a hole. */
    fenceState() {
      const Y = W().YARD.grid;
      const out = {};
      for (let y = 0; y < this.gh; y++) for (let x = 0; x < this.gw; x++) if (Y[y][x] === "F") out[x + "," + y] = this.fence[x + "," + y] || 0;
      return out;
    },
    fenceHoles() {
      const Y = W().YARD.grid;
      const out = [];
      for (let y = 0; y < this.gh; y++) for (let x = 0; x < this.gw; x++) if (Y[y][x] === "F" && this.fence[x + "," + y] == null) out.push([x, y]);
      return out;
    },
    walkerOnTile(x, y) {
      return this.walkers.some((z) => Math.floor(z.x) === x && Math.floor(z.y) === y);
    },
    /** Rebuild one hole or brace one cracked segment. Costs scrap; returns true when done. */
    repairFence(x, y) {
      const S = State();
      const key = x + "," + y;
      const cost = W().SETTINGS.fenceRepairScrap;
      if (S.save.scrap < cost) {
        this.toast("Not enough scrap. " + cost + " scrap fixes a fence segment.", 3);
        Audio().play("wrong");
        return false;
      }
      if (this.walkerOnTile(x, y)) {
        this.toast("Something is in the gap. Clear it first.", 2.5);
        Audio().play("wrong");
        return false;
      }
      S.save.scrap -= cost;
      this.fence[key] = this.fenceMax;
      this.grid[y][x] = "F";
      Audio().play("buy");
      this.updateHud();
      if (this.hooks.onYardChanged) this.hooks.onYardChanged();
      return true;
    },
    /** Fix every hole the player can afford (the cabin menu button). Returns how many were fixed. */
    repairAllHoles() {
      let n = 0;
      for (const [x, y] of this.fenceHoles()) {
        if (!this.repairFence(x, y)) break;
        n++;
      }
      if (n) this.toast("Fence fixed: " + n + " hole" + (n > 1 ? "s" : "") + ".", 3);
      return n;
    },
    /** Put a trap on the tile in front of you (or just past the fence). */
    placeTrap(type) {
      const S = State();
      const def = W().TRAPS[type];
      if (!def) return;
      const have = (S.save.traps && S.save.traps[type]) || 0;
      if (!have) {
        this.toast("No " + def.name.toLowerCase() + "s. Craft them at the workbench in the cabin.", 3);
        Audio().play("wrong");
        return false;
      }
      const p = this.player;
      let spot = null;
      for (const d of [1.0, 2.0]) {
        const gx = Math.floor(p.x + Math.cos(p.a) * d);
        const gy = Math.floor(p.y + Math.sin(p.a) * d);
        if (gx < 0 || gy < 0 || gx >= this.gw || gy >= this.gh) break;
        const ch = this.grid[gy][gx];
        if (ch === "F" || W().YARD.grid[gy][gx] === "F") continue; // over the fence line (a hole is still the fence line)
        if (ch !== ".") break;
        if (this.lots.some((l) => Math.floor(l.x) === gx && Math.floor(l.y) === gy)) break; // not on a yard lot
        if (gx === Math.floor(p.x) && gy === Math.floor(p.y)) continue;
        if (this.traps.some((t) => t.x === gx + 0.5 && t.y === gy + 0.5)) {
          this.toast("There is already a trap there.", 2.5);
          Audio().play("wrong");
          return false;
        }
        spot = [gx, gy];
        break;
      }
      if (!spot) {
        this.toast("No room for a trap there. Face open ground or the fence.", 2.5);
        Audio().play("wrong");
        return false;
      }
      S.save.traps[type] -= 1;
      this.traps.push({ x: spot[0] + 0.5, y: spot[1] + 0.5, type, uses: def.uses });
      this.toast(def.name + " set. " + S.save.traps[type] + " left.", 2.5);
      Audio().play("pickup");
      this.updateHud();
      if (this.hooks.onYardChanged) this.hooks.onYardChanged();
      return true;
    },
    updateTraps(dt) {
      const TR = W().TRAPS;
      let changed = false;
      this.traps.forEach((tr) => {
        if (tr.uses <= 0) return;
        tr.flash = Math.max(0, (tr.flash || 0) - dt);
        const def = TR[tr.type];
        // a spike trap bites each walker once: "lasts 3 walkers", not 3 seconds of one walker standing on it
        const stepped = this.walkers.find((z) => z.hp > 0 && !(tr.hit && tr.hit.has(z)) && Math.hypot(z.x - tr.x, z.y - tr.y) < 0.55);
        if (!stepped) return;
        if (def.radius > 0.6) {
          this.walkers.forEach((z) => {
            if (Math.hypot(z.x - tr.x, z.y - tr.y) < def.radius) this.hurtWalker(z, def.damage);
          });
          tr.uses = 0;
          this.shake = State().settings.shake ? 10 : 0;
        } else {
          this.hurtWalker(stepped, def.damage);
          (tr.hit = tr.hit || new Set()).add(stepped);
          tr.uses -= 1;
        }
        tr.flash = 0.4;
        Audio().play("crunch");
        changed = true;
      });
      if (changed) {
        this.traps = this.traps.filter((t) => t.uses > 0);
        State().save.yardTraps = this.traps.map((t) => ({ x: t.x, y: t.y, type: t.type, uses: t.uses }));
        this.updateHud();
      }
    },

    /** Stop the loop and release every input hold (shared by leave and death). */
    stop() {
      this.running = false;
      this.paused = false;
      this.keys = {};
      this.mouseDown = false;
      cancelAnimationFrame(this.raf);
      this.hud.root.classList.add("hidden");
      if (this.hud.read) this.hud.read.classList.add("hidden");
      this.panelKey = null;
      this.tagPanel = null;
      this.releasing = true;
      if (document.pointerLockElement === this.canvas && document.exitPointerLock) document.exitPointerLock();
    },
    leave() {
      this.stop();
      const S = State();
      if (S.trip && this.player) S.trip.footHp = this.player.hp;
      if (S.trip && this.mode === "building" && this.loc) {
        S.trip.rooms = S.trip.rooms || {};
        S.trip.rooms[this.loc.id] = this.snapshot();
      }
    },
    /** A medical kit: back to full health (the backpack calls this). */
    heal() {
      if (!this.player) return false;
      this.player.hp = this.player.maxHp;
      this.player.hurt = 0;
      this.updateHud();
      return true;
    },
    pause() {
      if (!this.running) return;
      this.paused = true;
      this.keys = {};
      this.mouseDown = false;
      if (this.player) this.player.draw = 0; // a half-drawn bow eases off; it never looses on resume
      this.releasing = true;
      if (document.pointerLockElement === this.canvas && document.exitPointerLock) document.exitPointerLock();
    },
    resume() {
      if (!this.running) return;
      this.paused = false;
      this.last = 0;
      this.updateHud();
    },
    /** Call after the build menu changed the base. Building the Walls up rebuilds the whole fence;
        nothing else touches it (holes stay until they are paid for). */
    refreshYard(opts) {
      if (this.mode !== "yard") return;
      const S = State();
      const hp = W().DEFENSE.fenceHp[S.save.rooms.walls] || W().DEFENSE.fenceHp[0];
      const grew = hp !== this.fenceMax;
      this.fenceMax = hp;
      if (grew || (opts && opts.rebuildFence)) this.patchFence();
      this.gun = S.weaponStats(); // mods bought or a gun picked in the cabin
      this.fx = S.effects();
      // no free heal for stepping inside: health carries over, and a bigger maximum adds the difference
      const oldMax = this.player.maxHp;
      this.player.maxHp = S.footMaxHp();
      this.player.hp = clamp(this.player.hp + (this.player.maxHp - oldMax), 1, this.player.maxHp);
      this.traps = (S.save.yardTraps || []).map((t) => Object.assign({}, t));
      this.updateHud();
    },

    /** BFS step counts from a tile over walkable tiles (locked doors count as walls). */
    reachable(sx, sy) {
      const dist = new Map([[sx + "," + sy, 0]]);
      const q = [[sx, sy]];
      while (q.length) {
        const [x, y] = q.shift();
        const d = dist.get(x + "," + y);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= this.gw || ny >= this.gh) continue;
          if (SOLID.includes(this.grid[ny][nx]) || dist.has(nx + "," + ny)) continue;
          dist.set(nx + "," + ny, d + 1);
          q.push([nx, ny]);
        }
      }
      return dist;
    },

    /** Every fence segment back at full strength, whole again. */
    patchFence() {
      const Y = W().YARD.grid;
      for (let y = 0; y < this.gh; y++) for (let x = 0; x < this.gw; x++) {
        if (Y[y][x] === "F") {
          this.fence[x + "," + y] = this.fenceMax;
          this.grid[y][x] = "F";
        }
      }
    },
    solidAt(x, y) {
      const gx = Math.floor(x);
      const gy = Math.floor(y);
      if (gx < 0 || gy < 0 || gx >= this.gw || gy >= this.gh) return true;
      return SOLID.includes(this.grid[gy][gx]);
    },
    /** The player never squeezes through a breach: the fence line stays solid for them. */
    solidForPlayer(x, y) {
      if (this.solidAt(x, y)) return true;
      if (this.mode !== "yard") return false;
      const gx = Math.floor(x);
      const gy = Math.floor(y);
      if (this.lots.some((l) => Math.floor(l.x) === gx && Math.floor(l.y) === gy)) return true; // you walk around a lot, not through it
      return W().YARD.grid[gy] && W().YARD.grid[gy][gx] === "F";
    },
    opaqueAt(x, y) {
      const gx = Math.floor(x);
      const gy = Math.floor(y);
      if (gx < 0 || gy < 0 || gx >= this.gw || gy >= this.gh) return true;
      return OPAQUE.includes(this.grid[gy][gx]);
    },
    moveCircle(ent, dx, dy, r, isPlayer) {
      const solid = isPlayer ? (x, y) => this.solidForPlayer(x, y) : (x, y) => this.solidAt(x, y);
      const tryX = ent.x + dx;
      if (!solid(tryX + Math.sign(dx) * r, ent.y - r * 0.7) && !solid(tryX + Math.sign(dx) * r, ent.y + r * 0.7)) ent.x = tryX;
      const tryY = ent.y + dy;
      if (!solid(ent.x - r * 0.7, tryY + Math.sign(dy) * r) && !solid(ent.x + r * 0.7, tryY + Math.sign(dy) * r)) ent.y = tryY;
    },

    toast(text, secs) {
      this.hud.toast.textContent = text;
      this.hud.toast.classList.remove("hidden");
      clearTimeout(this.toastT);
      this.toastT = setTimeout(() => this.hud.toast.classList.add("hidden"), (secs || 2.5) * 1000);
    },

    /* ---------- Interaction ---------- */
    facing() {
      const p = this.player;
      const cand = [];
      this.notes.forEach((n) => this.noteVisible(n) && cand.push({ kind: "note", obj: n, x: n.x, y: n.y }));
      if (this.cacheDoor && !this.cacheDoor.open) cand.push({ kind: "cache", obj: this.cacheDoor, x: this.cacheDoor.x + 0.5, y: this.cacheDoor.y + 0.5 });
      if (this.stashDoor && !this.stashDoor.open) cand.push({ kind: "stash", obj: this.stashDoor, x: this.stashDoor.x + 0.5, y: this.stashDoor.y + 0.5 });
      this.doors.forEach((d) => cand.push({ kind: "idoor", obj: d, x: d.x + 0.5, y: d.y + 0.5 }));
      if (this.exit) cand.push({ kind: "exit", obj: this.exit, x: this.exit.x + 0.5, y: this.exit.y + 0.5 });
      if (this.mode === "yard" && this.door) cand.push({ kind: "door", obj: this.door, x: this.door.x + 0.5, y: this.door.y + 0.5 });
      if (this.mode === "yard" && this.van) cand.push({ kind: "van", obj: this.van, x: this.van.x + 1, y: this.van.y + 0.5 });
      if (this.mode === "yard") {
        // fence segments near the player: holes to rebuild, cracks to brace
        const Y = W().YARD.grid;
        for (let gy = Math.floor(p.y) - 2; gy <= Math.floor(p.y) + 2; gy++) for (let gx = Math.floor(p.x) - 2; gx <= Math.floor(p.x) + 2; gx++) {
          if (!Y[gy] || Y[gy][gx] !== "F") continue;
          const hp = this.fence[gx + "," + gy];
          if (hp == null) cand.push({ kind: "hole", obj: [gx, gy], x: gx + 0.5, y: gy + 0.5 });
          else if (hp < this.fenceMax * 0.5) cand.push({ kind: "crack", obj: [gx, gy], x: gx + 0.5, y: gy + 0.5 });
        }
      }
      let best = null;
      cand.forEach((c) => {
        const dx = c.x - p.x;
        const dy = c.y - p.y;
        const d = Math.hypot(dx, dy);
        const reach = c.kind === "note" ? 1.4 : c.kind === "van" ? 2.0 : c.kind === "hole" || c.kind === "crack" ? 1.8 : 1.6;
        if (d > reach) return;
        const diff = Math.abs(normAngle(Math.atan2(dy, dx) - p.a));
        if (diff > 0.95) return;
        // nearest wins, except a note you have already read steps aside for the door behind it
        const score = d + (c.kind === "note" && c.obj.read ? 1.5 : 0);
        if (!best || score < best.score) best = Object.assign({ d, score }, c);
      });
      return best;
    },
    /** Open or close an interior door. Nothing may stand in the doorway when it closes. */
    toggleDoor(d) {
      const p = this.player;
      if (d.open) {
        if (Math.floor(p.x) === d.x && Math.floor(p.y) === d.y) {
          this.toast("Step out of the doorway first.", 2);
          Audio().play("wrong");
          return;
        }
        if (this.walkerOnTile(d.x, d.y)) {
          this.toast("Something is in the doorway.", 2);
          Audio().play("wrong");
          return;
        }
        d.open = false;
        this.grid[d.y][d.x] = "O";
        // a closed door changes every path
        this.walkers.forEach((z) => (z.pathT = 0));
      } else {
        d.open = true;
        this.grid[d.y][d.x] = "D";
        this.walkers.forEach((z) => (z.pathT = 0));
      }
      Audio().play("click");
    },
    interact() {
      const f = this.facing();
      if (!f) return;
      const S = State();
      const inWave = this.phase && this.phase.kind === "wave";
      if (f.kind === "note") {
        if (this.hooks.onReadNote) this.hooks.onReadNote(f.obj, this.loc);
      } else if (f.kind === "cache") {
        const note = W().NOTES[this.loc.id].notes.find((n) => n.unlocks === this.loc.id);
        if (note && S.noteRead(note.id)) {
          this.cacheDoor.open = true;
          this.grid[this.cacheDoor.y][this.cacheDoor.x] = "D";
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
          this.doors.push({ x: d.x, y: d.y, open: true, stash: true });
          S.tripLoc(this.loc.id).stashOpened = true;
          this.toast("Your key fits. Opened: " + stashName + ".", 3);
          Audio().play("buy");
          this.updateHud();
        } else {
          this.toast("Locked: " + stashName + ". Its key is hidden in another building. Notes say where.", 3.5);
          Audio().play("wrong");
        }
      } else if (f.kind === "idoor") {
        this.toggleDoor(f.obj);
      } else if (f.kind === "hole" || f.kind === "crack") {
        this.repairFence(f.obj[0], f.obj[1]);
      } else if (f.kind === "exit") {
        if (this.hooks.onExit) this.hooks.onExit();
      } else if (f.kind === "door") {
        if (inWave) {
          this.toast("Not now. Clear the fence first.", 2.5);
          Audio().play("wrong");
        } else if (this.hooks.onDoor) this.hooks.onDoor();
      } else if (f.kind === "van") {
        if (inWave) {
          this.toast("Not now. Clear the fence first.", 2.5);
          Audio().play("wrong");
        } else if (this.hooks.onVan) this.hooks.onVan();
      }
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

    /* ---------- Reading up close: wall signs inside, lot signs in the yard, item tags ---------- */
    /** The sign or lot the player is looking at, close enough to read. */
    nearReadable() {
      const p = this.player;
      let best = null;
      // (sx, sy): the point to see. A sign is a wall tile, so that is the point of its face nearest the player.
      const consider = (x, y, sx, sy, target) => {
        const d = Math.hypot(x - p.x, y - p.y);
        if (d > READ_REACH) return;
        const diff = Math.abs(normAngle(Math.atan2(y - p.y, x - p.x) - p.a));
        if (diff > 0.8 && d > 1.1) return;
        if (!this.lineClear(p.x, p.y, sx, sy)) return; // never through a wall, a shelf or a closed door
        if (!best || d < best.d) best = { d, target };
      };
      this.signs.forEach((sg) => {
        // seen across a corner, one of the two faces at that corner must open onto something see-through
        const offX = p.x < sg.x ? -1 : p.x > sg.x + 1 ? 1 : 0;
        const offY = p.y < sg.y ? -1 : p.y > sg.y + 1 ? 1 : 0;
        if (offX && offY && this.opaqueAt(sg.x + offX + 0.5, sg.y + 0.5) && this.opaqueAt(sg.x + 0.5, sg.y + offY + 0.5)) return;
        const fx = clamp(p.x, sg.x - 0.02, sg.x + 1.02);
        const fy = clamp(p.y, sg.y - 0.02, sg.y + 1.02);
        consider(sg.x + 0.5, sg.y + 0.5, fx, fy, { sign: sg });
      });
      this.lots.forEach((lot) => consider(lot.x, lot.y, lot.x, lot.y, { lot }));
      return best ? best.target : null;
    },
    /** A cheap identity for what the panel would show, so the panel is rebuilt only when it changes. */
    readableKey(t) {
      const S = State();
      if (t.sign) return "sign:" + t.sign.id + ":" + S.settings.level;
      const lvl = S.save.rooms[t.lot.room] || 0;
      const def = W().BASE_ROOMS[t.lot.room].levels[lvl];
      const have = def ? Object.keys(def.needs).map((k) => S.save.inventory[k] || 0).join(",") + "," + S.save.scrap : "";
      return "lot:" + t.lot.room + ":" + lvl + ":" + S.settings.level + ":" + have;
    },
    signPanel(sg) {
      const t = ZSR.signText(this.loc.id, sg.id);
      return { key: "sign:" + sg.id + ":" + State().settings.level, kind: sg.kind, title: t.title, text: t.text, id: sg.id };
    },
    /** A yard lot: what it is (or could be), and what the next level needs or why it is locked. */
    lotPanel(lot) {
      const S = State();
      const room = lot.room;
      const def = W().BASE_ROOMS[room];
      const lvl = S.save.rooms[room] || 0;
      const t = ZSR.lotText(room, lvl);
      const meta = [];
      const levelText = ZSR.text();
      const next = levelText && levelText.base && levelText.base.rooms && levelText.base.rooms[room] ? levelText.base.rooms[room].next[lvl] : null;
      if (lvl >= def.levels.length) meta.push(["Built", def.name + " is fully built."]);
      else {
        const c = S.canUpgradeRoom(room);
        if (next) meta.push(["Next", next]);
        const needs = Object.entries(c.def.needs).map(([k, n]) => n + " " + W().ITEMS[k].name + " (have " + (S.save.inventory[k] || 0) + ")").concat([c.def.scrap + " scrap (have " + S.save.scrap + ")"]);
        meta.push(["Needs", needs.join(", ")]);
        if (c.locked.length) meta.push(["Locked", "Build " + c.locked.map((r) => r.name + " to level " + r.level).join(" and ") + " first."]);
        else if (c.ok) meta.push(["Ready", "You have everything. Go inside the cabin to build it."]);
        else meta.push(["Not yet", "Missing: " + Object.entries(c.missing).map(([k, n]) => n + " " + W().ITEMS[k].name).concat(c.scrapShort ? [c.scrapShort + " scrap"] : []).join(", ") + "."]);
      }
      const status = lvl ? def.name + " · level " + lvl + " of " + def.levels.length : def.name + " · empty lot";
      return { key: "lot:" + room + ":" + lvl + ":" + S.settings.level + ":" + meta.map((m) => m[1]).join("|"), kind: "lot", title: t.title, status, text: t.text, meta };
    },
    /** Show an item's tag for a few seconds after picking it up. */
    showTag(item, variant, title) {
      const S = State();
      const text = ZSR.tagText(item, variant);
      if (!text) return;
      if (S.seeTag(item) && S.trip) S.trip.wordsRead += words(text);
      this.tagPanel = { key: "tag:" + item + ":" + variant + ":" + this.time, kind: "tag", title: title || W().ITEMS[item].name, status: "The tag says", text, until: this.time + 7 };
    },
    updatePanel() {
      const near = this.nearReadable();
      const tag = !near && this.tagPanel && this.time < this.tagPanel.until ? this.tagPanel : null;
      const key = near ? this.readableKey(near) : tag ? tag.key : null;
      if (key === this.panelKey) return;
      this.panelKey = key;
      const show = near ? (near.sign ? this.signPanel(near.sign) : this.lotPanel(near.lot)) : tag;
      const el = this.hud.read;
      if (!el) return;
      if (!show) {
        el.classList.add("hidden");
        return;
      }
      if (show.kind === "sign" || show.kind === "graffiti") State().seeSign(show.id, words(show.text));
      const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      el.className = "read-panel " + show.kind;
      el.innerHTML = '<div class="rp-head"><span class="rp-title">' + esc(show.title) + "</span>" + (show.status ? '<span class="rp-status">' + esc(show.status) + "</span>" : "") + "</div>" + '<div class="rp-text">' + esc(show.text).split(/\n\s*\n/).map((x) => "<p>" + x + "</p>").join("") + "</div>" + (show.meta && show.meta.length ? '<ul class="rp-meta">' + show.meta.map(([h, v]) => "<li><strong>" + esc(h) + ":</strong> " + esc(v) + "</li>").join("") + "</ul>" : "");
    },

    /* ---------- Update ---------- */
    frame(ts) {
      if (!this.running) return;
      this.raf = requestAnimationFrame((t) => this.frame(t));
      if (!this.last) this.last = ts;
      const dt = Math.min(0.05, (ts - this.last) / 1000);
      this.last = ts;
      if (!this.paused) this.update(dt);
      this.render();
    },

    update(dt) {
      const p = this.player;
      const S = State();
      const k = this.keys;
      this.time += dt;
      if (k.arrowleft) p.a -= 2.4 * dt;
      if (k.arrowright) p.a += 2.4 * dt;
      let fwd = 0;
      let side = 0;
      if (k.w || k.arrowup) fwd += 1;
      if (k.s || k.arrowdown) fwd -= 1;
      if (k.a) side -= 1;
      if (k.d) side += 1;
      const speed = 3.1 * (k.shift ? 1.35 : 1) * (this.gun.move || 1);
      if (fwd || side) {
        const len = Math.hypot(fwd, side) || 1;
        const dx = (Math.cos(p.a) * fwd - Math.sin(p.a) * side) / len;
        const dy = (Math.sin(p.a) * fwd + Math.cos(p.a) * side) / len;
        this.moveCircle(p, dx * speed * dt, dy * speed * dt, 0.3, true);
        p.bob += dt * 9;
        p.moving = true;
      } else p.moving = false;
      p.cooldown -= dt;
      p.flash = Math.max(0, p.flash - dt);
      p.flashL = Math.max(0, p.flashL - dt);
      p.flashR = Math.max(0, p.flashR - dt);
      p.raise = Math.max(0, p.raise - dt * 3.5);
      p.hurt = Math.max(0, p.hurt - dt * 1.5);
      if (this.fx.footRegen) p.hp = Math.min(p.maxHp, p.hp + this.fx.footRegen * dt);

      const held = this.mouseDown || k[" "];
      if (this.gun.draw) {
        // the bow: hold to draw, let go to shoot; a tiny pull just lets the string back down
        if (held && p.cooldown <= 0 && p.raise <= 0) p.draw = Math.min(1, p.draw + dt / this.gun.draw);
        else if (!held && p.draw > 0) {
          if (p.draw >= 0.2) this.fire(p.draw);
          p.draw = 0;
        }
      } else if (held && p.cooldown <= 0 && p.raise <= 0) this.fire(1);

      if (this.mode === "building") this.updatePickups();
      else {
        this.updateYard(dt);
        this.updateTraps(dt);
      }

      this.walkers.forEach((z) => this.updateWalker(z, dt));
      for (let i = this.walkers.length - 1; i >= 0; i--) if (this.walkers[i].hp <= 0) this.walkers.splice(i, 1);

      if (p.hp <= 0) {
        if (this.fx.revive && S.trip && !S.trip.revived && this.mode === "building") {
          S.trip.revived = true;
          p.hp = Math.round(p.maxHp * 0.5);
          p.x = this.exit.x + 0.5;
          p.y = this.exit.y - 0.5;
          this.walkers.forEach((z) => {
            z.awake = false;
            z.cool = 2;
          });
          this.toast("Medbay kit: back up at half health.", 3);
        } else {
          this.stop();
          if (this.hooks.onDeath) this.hooks.onDeath();
          return;
        }
      }
      this.shake *= Math.pow(0.02, dt);
      // keep the HUD honest every frame (regen, spawns, breaches, kills, repairs)
      const sig = Math.round(p.hp) + "|" + this.walkers.length + "|" + Object.keys(this.fence).length + "|" + (S.trip ? S.trip.scrap : S.save.scrap);
      if (sig !== this.hudSig) this.updateHud();

      const f = this.facing();
      const inWave = this.phase && this.phase.kind === "wave";
      const fix = W().SETTINGS.fenceRepairScrap + " scrap";
      const hint = !f ? "" : f.kind === "note" ? "Press E to read the note" : f.kind === "cache" ? "Press E to open " + this.loc.cacheName : f.kind === "stash" ? (S.canOpenStash(this.loc.id) ? "Press E: your key opens " + this.loc.stashName : this.loc.stashName + ": locked (its key is in another building)") : f.kind === "idoor" ? (f.obj.open ? "Press E to close the door" : "Press E to open the door") : f.kind === "hole" ? "Press E to rebuild the fence (" + fix + ")" : f.kind === "crack" ? "Press E to brace the fence (" + fix + ")" : f.kind === "exit" ? "Press E to leave for the van" : f.kind === "door" ? (inWave ? "Cabin door (clear the wave first)" : "Press E to go inside and build") : inWave ? "The van (clear the wave first)" : "Press E to head out in the van";
      if (this.hud.hint.textContent !== hint) this.hud.hint.textContent = hint;
      this.updatePanel();
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
          this.toast("Picked up: " + W().ITEMS[it.item].name, 2);
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
        this.toast("Found: " + kt.name + ". It opens " + target.stashName + " at " + target.name + ". Get it home to keep it.", 5);
        if (kt.tag) {
          if (S.trip) S.trip.wordsRead += words(kt.tag);
          this.tagPanel = { key: "key:" + kp.from + ":" + this.time, kind: "tag", title: kt.name, status: "Opens " + target.stashName + " at " + target.name, text: kt.tag, until: this.time + 8 };
        }
        Audio().play("buy");
        this.updateHud();
      }
      const g = this.gunPickup;
      if (g && !g.taken && Math.hypot(g.x - p.x, g.y - p.y) < 0.6) {
        g.taken = true;
        S.takeWeapon(g.id);
        const name = ZSR.Weapons.WEAPONS[g.id].name;
        this.switchWeapon(g.id);
        this.toast("Found: " + name + "! Press " + ZSR.Weapons.WEAPONS[g.id].slot + " or Q to switch guns. Get it home to keep it.", 4.5);
        Audio().play("buy");
      }
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

    updateYard(dt) {
      const ph = this.phase;
      const S = State();
      const D = W().DEFENSE;
      if (ph.kind === "calm") {
        ph.t -= dt;
        if (ph.t <= 0) {
          // what comes next?
          const r = Math.random();
          const mix = D.waveMix;
          const size = r < mix.none ? "none" : r < mix.none + mix.some ? "some" : "many";
          if (size === "none") {
            this.phase = { kind: "calm", t: rand(D.calmSeconds[0], D.calmSeconds[1]), size: "none" };
            this.toast("Still quiet. Nothing at the fence.", 3);
          } else {
            this.waveIndex += 1;
            S.save.wave = this.waveIndex;
            const total = size === "some" ? D.someCount(S.save.day, this.waveIndex) : D.manyCount(S.save.day, this.waveIndex);
            this.phase = { kind: "wave", size, total, spawned: 0, spawnT: 0, t: 0 };
            this.toast(size === "many" ? "A lot of them. Hold the fence!" : "Walkers at the fence.", 2.5);
            Audio().play("haven");
          }
          this.updateHud();
        }
      } else {
        ph.t += dt;
        ph.spawnT -= dt;
        if (ph.spawned < ph.total && ph.spawnT <= 0) {
          ph.spawnT = D.spawnInterval * (ph.size === "many" ? 0.7 : 1);
          const [x, y] = this.spawns[Math.floor(Math.random() * this.spawns.length)];
          const day = S.save.day;
          const type = ph.size === "many" && ph.spawned % 5 === 4 ? "brute" : ph.spawned % 3 === 2 && day >= 2 ? "runner" : "walker";
          const z = this.makeWalker(type, x + rand(-0.3, 0.3), y + rand(-0.3, 0.3), 1 + 0.08 * (day - 1));
          z.awake = true;
          this.walkers.push(z);
          ph.spawned += 1;
        }
        if (ph.spawned >= ph.total && this.walkers.length === 0) {
          this.phase = { kind: "calm", t: rand(D.calmSeconds[0], D.calmSeconds[1]), size: "none" };
          // nobody patches the fence for you: every hole costs scrap
          const holes = this.fenceHoles().length;
          this.toast(holes ? "Wave cleared. " + holes + " hole" + (holes > 1 ? "s" : "") + " in the fence: E at a gap fixes it for " + W().SETTINGS.fenceRepairScrap + " scrap." : "Wave cleared. The fence held.", holes ? 4.5 : 3);
          Audio().play("correct");
          if (this.hooks.onWaveCleared) this.hooks.onWaveCleared();
        }
      }
      // HUD phase line (cheap enough every frame)
      const h = this.hud.phase;
      const text = ph.kind === "calm" ? "QUIET · next in " + Math.max(0, Math.ceil(this.phase.t)) + "s" : (ph.size === "many" ? "HEAVY WAVE" : "WAVE") + " · " + (ph.total - ph.spawned + this.walkers.length) + " left";
      if (h.textContent !== text) h.textContent = text;
      h.classList.toggle("alarm", ph.kind === "wave");
    },

    updateWalker(z, dt) {
      const p = this.player;
      const dx = p.x - z.x;
      const dy = p.y - z.y;
      const dist = Math.hypot(dx, dy);
      z.hit = Math.max(0, z.hit - dt);
      z.cool = Math.max(0, z.cool - dt);
      z.hurtT = Math.max(0, z.hurtT - dt);
      z.trapT = Math.max(0, (z.trapT || 0) - dt);
      z.frameT += dt;
      // running is loud: sprinting players are noticed from farther away
      const hear = this.keys.shift && this.player.moving ? 9 : 6;
      if (!z.awake && (dist < hear || (this.time - this.noise < 1.5 && dist < this.noiseR) || z.hurtT > 0)) z.awake = true;
      if (!z.awake) return;
      if (z.frameT > 0.35 / (z.speed / 1.25)) {
        z.frameT = 0;
        z.frame = z.frame ? 0 : 1;
      }
      if (dist < 0.85) {
        if (z.cool <= 0) {
          z.cool = 1.1;
          p.hp -= Math.round(z.dmg * this.fx.footDamage);
          p.hurt = 1;
          this.shake = State().settings.shake ? 8 : 0;
          Audio().play("crunch");
          this.updateHud();
        }
        return;
      }
      z.pathT -= dt;
      if (z.pathT <= 0) {
        z.pathT = 0.4;
        z.path = this.lineClearMove(z.x, z.y, p.x, p.y) ? [[p.x, p.y]] : this.bfs(z, p);
        z.fenceTarget = z.path.length ? null : this.nearestFence(z);
      }
      if (z.fenceTarget) {
        const [fx, fy] = z.fenceTarget;
        const tx = fx - z.x;
        const ty = fy - z.y;
        const d = Math.hypot(tx, ty) || 1;
        if (d < 0.95) {
          const key = Math.floor(fx) + "," + Math.floor(fy);
          if (this.fence[key] != null) {
            this.fence[key] -= z.dps * dt;
            if (this.fence[key] <= 0) {
              delete this.fence[key];
              this.grid[Math.floor(fy)][Math.floor(fx)] = ".";
              z.pathT = 0;
              this.toast("Fence breached!", 2.5);
              Audio().play("crunch");
            }
          } else z.pathT = 0;
          return;
        }
        this.moveCircle(z, (tx / d) * z.speed * dt, (ty / d) * z.speed * dt, z.r);
        return;
      }
      const target = z.path && z.path.length ? z.path[0] : null;
      if (target) {
        const tx = target[0] - z.x;
        const ty = target[1] - z.y;
        const d = Math.hypot(tx, ty) || 1;
        if (d < 0.2 && z.path.length > 1) z.path.shift();
        let vx = (tx / d) * z.speed;
        let vy = (ty / d) * z.speed;
        this.walkers.forEach((o) => {
          if (o === z) return;
          const ox = z.x - o.x;
          const oy = z.y - o.y;
          const od = Math.hypot(ox, oy);
          if (od < z.r + o.r && od > 0.001) {
            vx += (ox / od) * 1.2;
            vy += (oy / od) * 1.2;
          }
        });
        this.moveCircle(z, vx * dt, vy * dt, z.r);
      }
    },
    nearestFence(z) {
      let best = null;
      Object.keys(this.fence).forEach((k) => {
        const [x, y] = k.split(",").map(Number);
        const d = Math.hypot(x + 0.5 - z.x, y + 0.5 - z.y);
        if (!best || d < best.d) best = { d, x: x + 0.5, y: y + 0.5 };
      });
      return best ? [best.x, best.y] : null;
    },

    /** Sight line: fences do not block it. */
    lineClear(x0, y0, x1, y1) {
      const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 4);
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        if (this.opaqueAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false;
      }
      return true;
    },
    /** Walking line: fences do block it. */
    lineClearMove(x0, y0, x1, y1) {
      const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 4);
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        if (this.solidAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false;
      }
      return true;
    },
    bfs(z, p) {
      const sx = Math.floor(z.x);
      const sy = Math.floor(z.y);
      const tx = Math.floor(p.x);
      const ty = Math.floor(p.y);
      const key = (x, y) => y * this.gw + x;
      const prev = new Map();
      const q = [[sx, sy]];
      prev.set(key(sx, sy), null);
      let found = false;
      while (q.length) {
        const [x, y] = q.shift();
        if (x === tx && y === ty) {
          found = true;
          break;
        }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= this.gw || ny >= this.gh) continue;
          if (SOLID.includes(this.grid[ny][nx])) continue;
          const kk = key(nx, ny);
          if (prev.has(kk)) continue;
          prev.set(kk, [x, y]);
          q.push([nx, ny]);
        }
      }
      if (!found) return [];
      const path = [];
      let cur = [tx, ty];
      while (cur && !(cur[0] === sx && cur[1] === sy)) {
        path.push([cur[0] + 0.5, cur[1] + 0.5]);
        cur = prev.get(key(cur[0], cur[1]));
      }
      path.reverse();
      return path.length ? path : [[p.x, p.y]];
    },

    /** Damage a walker; a kill pays scrap to the trip (out there) or the save (at home). */
    hurtWalker(z, dmg) {
      if (z.hp <= 0) return;
      z.hp -= dmg;
      z.hit = 0.12;
      z.hurtT = 1;
      z.awake = true;
      if (z.hp <= 0) {
        const S = State();
        if (S.trip) {
          S.trip.walkers += 1;
          S.trip.scrap += z.scrap;
        } else {
          S.save.scrap += z.scrap;
          S.save.stats.walkers += 1;
        }
        Audio().play("poof");
        this.updateHud();
      }
    },
    /** One shot (one arrow) from the gun in hand. power 0..1 is the bow's draw. */
    fire(power) {
      const g = this.gun;
      const p = this.player;
      p.cooldown = g.interval;
      const flash = Math.min(0.08, g.interval * 0.75);
      if (g.id === "dual") {
        p.side = p.side === "R" ? "L" : "R";
        if (p.side === "R") p.flashR = flash;
        else p.flashL = flash;
      } else p.flash = flash;
      if (g.noise > 0) {
        this.noise = this.time;
        this.noiseR = g.noise;
      }
      if (g.shake && State().settings.shake) this.shake = Math.max(this.shake, g.shake);
      this.shoot(power);
      Audio().play(g.id === "bow" ? "bow" : g.id === "hmg" ? "heavy" : "shoot");
    },
    shoot(power) {
      const g = this.gun;
      const p = this.player;
      // aim error: wider on the move, and a half-drawn bow is shaky
      const spread = g.spread * (p.moving ? 1.6 : 1) * (g.draw ? 2 - power : 1);
      const hits = this.walkersOnLine((Math.random() * 2 - 1) * spread, g.range).slice(0, g.pierce);
      const dmg = g.draw ? g.damage * (0.3 + 0.7 * power) : g.damage;
      hits.forEach((z, i) => this.hurtWalker(z, Math.round(dmg * (i ? 0.6 : 1)))); // a round that went through one walker hits the next softer
      if (hits.length) Audio().play("hit");
    },
    /** Walkers under the crosshair (plus an angle), nearest first, within range and in sight. */
    walkersOnLine(angleOff, range) {
      const p = this.player;
      const a = p.a + angleOff;
      const out = [];
      this.walkers.forEach((z) => {
        const dx = z.x - p.x;
        const dy = z.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.05 || dist > (range || Infinity)) return;
        const ang = normAngle(Math.atan2(dy, dx) - a);
        const halfWidth = Math.atan2(z.r * 1.1, dist);
        if (Math.abs(ang) > halfWidth) return;
        if (!this.lineClear(p.x, p.y, z.x, z.y)) return;
        out.push({ z, dist });
      });
      return out.sort((m, n) => m.dist - n.dist).map((o) => o.z);
    },
    walkerAt(angleOff, range) {
      return this.walkersOnLine(angleOff, range)[0] || null;
    },

    updateHud() {
      const S = State();
      const p = this.player;
      const h = this.hud;
      if (!p) return;
      this.hudSig = Math.round(p.hp) + "|" + this.walkers.length + "|" + Object.keys(this.fence).length + "|" + (S.trip ? S.trip.scrap : S.save.scrap);
      const pct = clamp((p.hp / p.maxHp) * 100, 0, 100);
      h.hpFill.style.width = pct + "%";
      h.hpFill.style.background = pct > 50 ? "#7a9a3c" : pct > 25 ? "#d9a21b" : "#b3261e";
      h.hpText.textContent = Math.max(0, Math.round(p.hp));
      h.scrap.textContent = S.save.scrap + (S.trip ? S.trip.scrap : 0);
      const cargoN = S.trip ? Object.values(S.trip.cargo).reduce((a, b) => a + b, 0) : 0;
      h.cargo.textContent = cargoN;
      h.walkers.textContent = this.walkers.length;
      if (h.gun && this.gun) h.gun.textContent = this.gun.slot + " " + this.gun.name;
      if (this.mode === "building") {
        const left = this.items.filter((i) => !i.taken && !i.source).length;
        const cacheLeft = this.items.filter((i) => !i.taken && i.source === "cache").length;
        const cacheState = this.cacheDoor ? (this.cacheDoor.open ? "open" : "locked") : "none";
        const sd = this.stashDoor;
        const stashState = !sd ? "" : sd.open ? "open" : S.canOpenStash(this.loc.id) ? "you have the key" : "locked";
        h.goal.textContent = (left ? left + " item" + (left > 1 ? "s" : "") + " on the floor" : "Floor cleared") + " · " + this.loc.cacheName + ": " + cacheState + (cacheLeft && cacheState === "open" ? ", " + cacheLeft + " left" : "") + (sd ? " · " + this.loc.stashName + ": " + stashState : "");
      } else {
        const broken = this.fenceHoles().length;
        const tr = S.save.traps || {};
        const held = Object.entries(W().TRAPS).filter(([k]) => tr[k] > 0).map(([k, d]) => tr[k] + " " + d.name.toLowerCase() + (tr[k] > 1 ? "s" : "") + " (" + d.key + ")");
        h.goal.textContent = "Day " + S.save.day + " · fence " + (broken ? broken + " hole" + (broken > 1 ? "s" : "") + " (E to fix)" : "whole") + " · walls " + S.save.rooms.walls + (held.length ? " · traps: " + held.join(", ") : "");
      }
    },

    /* ---------- Render ---------- */
    render() {
      const ctx = this.ctx;
      const Wd = this.W;
      const H = this.H;
      const p = this.player;
      if (!p) return;
      const pal = this.palette;
      const cols = this.cols;
      const zbuf = this.zbuf;
      const fbuf = this.fbuf;
      const fenceCols = [];
      ctx.save();
      if (this.shake > 0.5) ctx.translate(rand(-this.shake, this.shake), rand(-this.shake, this.shake));

      // sky or ceiling, then floor
      const heavy = this.phase && this.phase.kind === "wave" && this.phase.size === "many";
      const skyTop = pal.sky ? (heavy ? "#5a3a3a" : "#7f98b3") : pal.ceiling;
      const skyBottom = pal.sky ? (heavy ? "#b06a3a" : "#c9d6df") : D3().shade(pal.ceiling, -25);
      const grad = ctx.createLinearGradient(0, 0, 0, H / 2);
      grad.addColorStop(0, skyTop);
      grad.addColorStop(1, skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, Wd, H / 2);
      const grad2 = ctx.createLinearGradient(0, H / 2, 0, H);
      grad2.addColorStop(0, D3().shade(pal.floor, -40));
      grad2.addColorStop(1, pal.floor);
      ctx.fillStyle = grad2;
      ctx.fillRect(0, H / 2, Wd, H / 2);

      const dirX = Math.cos(p.a);
      const dirY = Math.sin(p.a);
      const planeScale = Math.tan(FOV / 2);
      const planeX = -dirY * planeScale;
      const planeY = dirX * planeScale;
      const aspect = Wd / H;
      const prev = { key: null, top: 0, bottom: 0, dist: 0 };
      const edges = [];
      for (let col = 0; col < cols; col++) {
        const cameraX = (2 * (col * COL + COL / 2)) / Wd - 1;
        const rdx = dirX + planeX * cameraX * aspect;
        const rdy = dirY + planeY * cameraX * aspect;
        let mapX = Math.floor(p.x);
        let mapY = Math.floor(p.y);
        const deltaX = Math.abs(1 / (rdx || 1e-9));
        const deltaY = Math.abs(1 / (rdy || 1e-9));
        const stepX = rdx < 0 ? -1 : 1;
        const stepY = rdy < 0 ? -1 : 1;
        let sideX = rdx < 0 ? (p.x - mapX) * deltaX : (mapX + 1 - p.x) * deltaX;
        let sideY = rdy < 0 ? (p.y - mapY) * deltaY : (mapY + 1 - p.y) * deltaY;
        let side = 0;
        let tile = "#";
        let fence = null;
        for (let i = 0; i < 80; i++) {
          if (sideX < sideY) {
            sideX += deltaX;
            mapX += stepX;
            side = 0;
          } else {
            sideY += deltaY;
            mapY += stepY;
            side = 1;
          }
          if (mapX < 0 || mapY < 0 || mapX >= this.gw || mapY >= this.gh) {
            tile = "#";
            break;
          }
          tile = this.grid[mapY][mapX];
          if (tile === "F" && !fence) {
            const fp = side === 0 ? sideX - deltaX : sideY - deltaY;
            let fwx = side === 0 ? p.y + fp * rdy : p.x + fp * rdx;
            fwx -= Math.floor(fwx);
            fence = { dist: Math.max(0.05, fp), wallX: fwx, side, rdx, rdy, key: mapX + "," + mapY };
            continue;
          }
          if (OPAQUE.includes(tile)) break;
        }
        const perp = side === 0 ? sideX - deltaX : sideY - deltaY;
        const dist = Math.max(0.05, perp);
        zbuf[col] = dist;
        fbuf[col] = fence ? fence.dist : Infinity;
        const unit = H / dist; // screen pixels per world unit at this distance
        const bottom = H / 2 + unit / 2;
        let wallX = side === 0 ? p.y + perp * rdy : p.x + perp * rdx;
        wallX -= Math.floor(wallX);
        // texture columns run left to right as seen from the face's own side, so text never mirrors
        const flip = (side === 0 && rdx < 0) || (side === 1 && rdy > 0);
        let texX = Math.floor(wallX * 64);
        if (flip) texX = 63 - texX;
        const x = col * COL;
        const cab = this.cabin;
        const isCabin = cab && (tile === "H" || tile === "B");
        let zTop = HEIGHT[tile] || 1;
        let texName = this.tileTex[mapX + "," + mapY] || TEX_OF[tile] || "wall";
        if (tile === "V" && side === 0) texName = rdx > 0 ? "vanFront" : "vanBack";
        else if (tile === "V") {
          // the van's two sides share one body: wheels and doors stay put in the world, only the lettering is redrawn to read
          texName = this.van && mapX === this.van.x ? "vanCab" : "vanBody";
          if (flip) {
            texX = Math.floor(wallX * 64);
            if (texName === "vanBody") texName = "vanBodyR";
          }
        }
        let roof = null; // [yTop, yEave] screen span of the roof slope above an eave wall
        let gableY = null; // screen y of the eave on a gable end wall
        if (isCabin) {
          const eaveSide = cab.alongX ? side === 1 : side === 0; // the long walls carry the eave, the ends the gable
          const hx = p.x + perp * rdx;
          const hy = p.y + perp * rdy;
          const along = cab.alongX ? rdy : rdx; // travel across the cabin's depth (toward or away from the ridge)
          const across = cab.alongX ? rdx : rdy; // travel along its length
          const lo = cab.alongX ? cab.x0 : cab.y0;
          const hi = cab.alongX ? cab.x1 : cab.y1;
          const at = cab.alongX ? hx : hy; // position along the length
          const w = cab.alongX ? hy : hx; // position across the depth
          const slope = (z) => CABIN.eave + (CABIN.ridge - CABIN.eave) * clamp(1 - Math.abs(z - cab.ridge) / cab.half, 0, 1);
          if (eaveSide) {
            zTop = CABIN.eave;
            // the roof rises from the eave to the ridge (or to the end of the cabin if the ray leaves it first)
            const tEdge = across !== 0 ? Math.abs(((across > 0 ? hi : lo) - at) / across) * Math.abs(along) : Infinity;
            const t = Math.min(cab.half, tEdge);
            const sTop = perp + t / Math.max(1e-6, Math.abs(along));
            const zRoof = CABIN.eave + (CABIN.ridge - CABIN.eave) * (t / cab.half);
            roof = [H / 2 - (zRoof - 0.5) * (H / sTop), H / 2 - (CABIN.eave - 0.5) * unit];
          } else {
            zTop = slope(w);
            gableY = H / 2 - (CABIN.eave - 0.5) * unit;
            // the slope behind the gable climbs toward the ridge and can show above the triangle at the corners
            const toRidge = (cab.ridge - w) * along > 0 ? (cab.ridge - w) / along : 0;
            const toExit = across !== 0 ? Math.abs(((across > 0 ? hi : lo) - at) / across) : Infinity;
            const s = Math.min(toRidge, toExit);
            if (s > 0) {
              const yR = H / 2 - (slope(w + s * along) - 0.5) * (H / (perp + s));
              const yG = H / 2 - (zTop - 0.5) * unit;
              if (yR < yG) roof = [yR, yG];
            }
          }
        }
        let top = H / 2 - (zTop - 0.5) * unit;
        const tex = D3().texture(texName, pal);
        if (gableY != null && top < gableY) {
          ctx.drawImage(D3().texture("gable", pal), texX, 0, 1, 64, x, top, COL, gableY - top);
          ctx.drawImage(tex, texX, 0, 1, 64, x, gableY, COL, bottom - gableY);
        } else ctx.drawImage(tex, texX, 0, 1, 64, x, top, COL, bottom - top);
        if (roof && roof[0] < roof[1]) {
          ctx.drawImage(D3().texture("roof", pal), texX, 0, 1, 64, x, roof[0], COL, roof[1] - roof[0]);
          ctx.fillStyle = "#0f1012";
          ctx.fillRect(x, roof[1] - 1, COL, 2.5);
          top = Math.min(top, roof[0]);
        }
        const dark = Math.min(0.8, dist / (pal.sky ? 22 : 13) + (side === 1 ? 0.12 : 0));
        if (dark > 0.02) {
          ctx.fillStyle = "rgba(0,0,0," + dark.toFixed(3) + ")";
          ctx.fillRect(x, top, COL, bottom - top);
        }
        ctx.fillStyle = "#0f1012";
        const ink = Math.max(1.5, Math.min(4, unit * 0.012));
        ctx.fillRect(x, top, COL, ink);
        ctx.fillRect(x, bottom - ink, COL, ink);
        const key = mapX + "," + mapY + "," + side + tile;
        if (col > 0 && prev.key !== key && (Math.abs(prev.dist - dist) > 0.25 || prev.side !== side || prev.tile !== tile)) edges.push([x, Math.min(top, prev.top), Math.max(bottom, prev.bottom)]);
        prev.key = key;
        prev.side = side;
        prev.tile = tile;
        prev.top = top;
        prev.bottom = bottom;
        prev.dist = dist;
        if (fence) fenceCols.push([col, fence]);
      }
      ctx.fillStyle = "#0f1012";
      edges.forEach(([x, t, b]) => ctx.fillRect(x - 1, t, 2.5, b - t));

      // sprites
      const sprites = [];
      this.items.forEach((it) => !it.taken && sprites.push({ x: it.x, y: it.y, img: D3().item(it.item), scale: 0.5, lift: 0.25 }));
      this.notes.forEach((n) => this.noteVisible(n) && sprites.push({ x: n.x, y: n.y, img: D3().note(), scale: 0.42, lift: 0.3, dim: n.read ? 0.5 : 0 }));
      if (this.keyVisible()) sprites.push({ x: this.keyPickup.x, y: this.keyPickup.y, img: D3().key(), scale: 0.3, lift: 0.12 + Math.sin(this.time * 3) * 0.03, wide: 1.4 });
      if (this.lots.length) {
        const rooms = State().save.rooms;
        this.lots.forEach((lot) => sprites.push({ x: lot.x, y: lot.y, img: D3().lot(lot.room, rooms[lot.room] || 0), scale: 1.0, lift: 0, wide: 1.25 }));
      }
      this.piles.forEach((pl) => !pl.taken && sprites.push({ x: pl.x, y: pl.y, img: D3().scrap(), scale: 0.5, lift: 0.25, wide: 1.33 }));
      const gp = this.gunPickup;
      if (gp && !gp.taken) sprites.push({ x: gp.x, y: gp.y, img: D3().weaponIcon(gp.id), scale: 0.36, lift: 0.18 + Math.sin(this.time * 3) * 0.03, wide: 2 });
      this.traps.forEach((tr) => tr.uses > 0 && sprites.push({ x: tr.x, y: tr.y, img: D3().trap(tr.type, false), scale: 0.3, lift: 0, wide: 1.6, dim: tr.flash > 0 ? 0.4 : 0 }));
      this.walkers.forEach((z) => sprites.push({ x: z.x, y: z.y, img: D3().walker(z.type, z.frame, z.hit > 0), scale: z.type === "brute" ? 1.05 : 0.95, lift: 0, wide: 0.75, hp: z.hp / z.maxHp }));
      const invDet = 1 / (planeX * dirY - dirX * planeY);
      sprites.forEach((s) => {
        const sx = s.x - p.x;
        const sy = s.y - p.y;
        s.tx = invDet * (dirY * sx - dirX * sy);
        s.ty = invDet * (-planeY * sx + planeX * sy);
      });
      sprites.sort((a, b) => b.ty - a.ty);
      const drawSprite = (s) => {
        if (s.ty <= 0.1) return;
        const screenX = (Wd / 2) * (1 + s.tx / s.ty / aspect);
        const size = (H / s.ty) * s.scale;
        const sh = size;
        const sw = size * (s.wide || 1);
        const vShift = (H / s.ty) * (0.5 - s.lift) - sh / 2;
        const top = H / 2 - sh / 2 + vShift;
        const left = screenX - sw / 2;
        const iw = s.img.width;
        const startCol = Math.max(0, Math.floor(left / COL));
        const endCol = Math.min(cols - 1, Math.ceil((left + sw) / COL));
        ctx.globalAlpha = s.dim ? 1 - s.dim : 1;
        for (let c = startCol; c <= endCol; c++) {
          if (zbuf[c] <= s.ty) continue;
          const x0 = c * COL;
          const u0 = ((x0 - left) / sw) * iw;
          const u1 = ((x0 + COL - left) / sw) * iw;
          if (u1 <= 0 || u0 >= iw) continue;
          ctx.drawImage(s.img, Math.max(0, u0), 0, Math.max(1, Math.min(iw, u1) - Math.max(0, u0)), s.img.height, x0, top, COL, sh);
        }
        ctx.globalAlpha = 1;
        if (s.hp != null && s.hp < 1) {
          ctx.fillStyle = "#0f1012";
          ctx.fillRect(screenX - sw * 0.35 - 1, top - 10, sw * 0.7 + 2, 7);
          ctx.fillStyle = "#b3261e";
          ctx.fillRect(screenX - sw * 0.35, top - 9, sw * 0.7 * s.hp, 5);
        }
      };
      // beyond the fence, then the fence (half height), then this side of the fence
      const fenceAt = (s) => {
        const c = clamp(Math.floor(((Wd / 2) * (1 + s.tx / s.ty / aspect)) / COL), 0, cols - 1);
        return fbuf[c];
      };
      sprites.filter((s) => s.ty > fenceAt(s)).forEach(drawSprite);
      if (fenceCols.length) {
        const fenceTex = D3().texture("fence", pal);
        const crackTex = D3().texture("fenceCracked", pal);
        fenceCols.forEach(([col, f]) => {
          const lineH = H / f.dist;
          const top = H / 2 - lineH * 0.02;
          const h2 = lineH * 0.52;
          const hp = this.fence[f.key];
          const tex = hp != null && hp < this.fenceMax * 0.5 ? crackTex : fenceTex;
          const x = col * COL;
          const fx = (f.side === 0 && f.rdx < 0) || (f.side === 1 && f.rdy > 0) ? 63 - Math.floor(f.wallX * 64) : Math.floor(f.wallX * 64);
          ctx.drawImage(tex, fx, 0, 1, 64, x, top, COL, h2);
          const dark = Math.min(0.7, f.dist / 22 + (f.side === 1 ? 0.1 : 0));
          ctx.fillStyle = "rgba(0,0,0," + dark.toFixed(3) + ")";
          ctx.fillRect(x, top, COL, h2);
          ctx.fillStyle = "#0f1012";
          ctx.fillRect(x, top, COL, 2);
        });
      }
      sprites.filter((s) => s.ty <= fenceAt(s)).forEach(drawSprite);

      ctx.restore();
      if (p.hurt > 0) {
        const g = ctx.createRadialGradient(Wd / 2, H / 2, H * 0.3, Wd / 2, H / 2, H * 0.8);
        g.addColorStop(0, "rgba(179,38,30,0)");
        g.addColorStop(1, "rgba(179,38,30," + (0.65 * p.hurt).toFixed(2) + ")");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, Wd, H);
      }
      ZSR.Draw.vignette(ctx, Wd, H);
      const g = this.gun;
      D3().gun(ctx, Wd, H, { weapon: g.id, bob: p.moving ? p.bob : 0, flash: p.flash, flashL: p.flashL, flashR: p.flashR, draw: p.draw, loaded: p.cooldown <= 0, raise: p.raise });
      // the gap opens with the gun's spread (and closes as the bow comes to full draw); red means in range
      const gap = 4 + g.spread * H * 0.5 * (p.moving ? 1.6 : 1) * (g.draw ? 2 - p.draw : 1);
      D3().crosshair(ctx, Wd / 2, H / 2, !!this.walkerAt(0, g.range), gap);
    },

    WALKER_TYPES,
  };

  ZSR.Interior = Interior;
})(typeof globalThis !== "undefined" ? globalThis : this);
