/* First person on a grid: buildings and the home-base yard.
   WASD / arrows to move and turn, mouse to look (pointer lock when allowed,
   plain mouse movement otherwise), click or Space to fire, E to interact,
   B for the backpack, P or Esc to pause.
   Buildings: items, notes, a locked cache room, walkers, an exit.
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
  const SOLID = "#SCXGLETHBVF"; // blocks movement
  const OPAQUE = "#SCXGLETHBV"; // blocks sight and rays (fence F is see-through)
  const WALKER_TYPES = {
    walker: { hp: 30, speed: 1.25, r: 0.32, dmgKey: "footDamageWalker", scrap: 2 },
    runner: { hp: 18, speed: 2.4, r: 0.28, dmgKey: "footDamageRunner", scrap: 3 },
    brute: { hp: 90, speed: 0.95, r: 0.4, dmgKey: "footDamageBrute", scrap: 5 },
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const normAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const TEX_OF = { S: "shelf", C: "counter", X: "crate", G: "glass", L: "locked", E: "exit", T: "tree", H: "house", B: "door", V: "van" };

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
      this.hud = { root: $("int-hud"), hpFill: $("int-hp-fill"), hpText: $("int-hp-text"), scrap: $("int-scrap"), cargo: $("int-cargo"), walkers: $("int-walkers"), place: $("int-place"), goal: $("int-goal"), hint: $("int-hint"), toast: $("int-toast"), phase: $("int-phase") };
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
      document.addEventListener("pointerlockchange", () => {
        this.locked = document.pointerLockElement === c;
        if (!this.locked && this.running && !this.paused && !this.releasing && this.hooks.onPause) this.hooks.onPause();
        this.releasing = false;
      });
      // physical key positions, so WASD works on any keyboard layout
      const CODE = { KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", KeyE: "e", KeyB: "b", KeyP: "p", Space: " ", ShiftLeft: "shift", ShiftRight: "shift", ArrowUp: "arrowup", ArrowDown: "arrowdown", ArrowLeft: "arrowleft", ArrowRight: "arrowright", Escape: "escape" };
      const keyOf = (e) => CODE[e.code] || e.key.toLowerCase();
      root.addEventListener("keydown", (e) => {
        if (!this.running) return;
        const k = keyOf(e);
        if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " ", "e", "shift", "b"].includes(k) && !this.paused) e.preventDefault();
        if (e.repeat) return;
        this.keys[k] = true;
        if (this.paused) return;
        if (k === "e") this.interact();
        if ((k === "p" || k === "escape") && this.hooks.onPause) this.hooks.onPause();
        if (k === "b" && this.hooks.onBackpack) this.hooks.onBackpack();
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
      this.cacheDoor = null;
      this.exit = null;
      this.spawns = [];
      this.floors = [];
      this.noise = -99;
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
      this.gun = ZSR.Upgrades.stats(S.save.upgrades);
      const maxHp = S.footMaxHp();
      this.player = { x, y, a, hp: clamp(S.trip ? S.trip.footHp : maxHp, 1, maxHp), maxHp, cooldown: 0, bob: 0, flash: 0, hurt: 0, moving: false };
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
          } else if (ch === "L") {
            this.cacheDoor = { x, y, open: st.cacheOpened };
            if (st.cacheOpened) this.grid[y][x] = "D";
          } else if (ch === "E") {
            this.exit = { x, y };
          }
          if (this.grid[y][x] === ".") this.floors.push([cx, cy]);
        }
      }
      const ex = this.exit.x;
      const ey = this.exit.y;
      const g = this.grid;
      const start = ey > 0 && !SOLID.includes(g[ey - 1][ex]) ? [ex + 0.5, ey - 0.5, -Math.PI / 2] : ey < this.gh - 1 && !SOLID.includes(g[ey + 1][ex]) ? [ex + 0.5, ey + 1.5, Math.PI / 2] : [ex + 1.5, ey + 0.5, 0];
      this.makePlayer(start[0], start[1], start[2]);
      if (this.fx.fullHealOnEntry) this.player.hp = this.player.maxHp;

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
      S.tripLoc(loc.id).visits += 1;
      if (!S.trip.visited.includes(loc.id)) S.trip.visited.push(loc.id);
      this.hud.place.textContent = loc.name;
      this.hud.phase.classList.add("hidden");
      this.startLoop();
      this.toast("You're in. Walkers inside. E reads notes and opens doors. B opens the backpack.", 4);
    },

    /* ---------- The yard (cabin defense) ---------- */
    enterYard(opts) {
      const S = State();
      const Y = W().YARD;
      this.mode = "yard";
      this.loc = { id: "base", name: "Home Base", cacheName: "" };
      this.loadGrid(Y.grid, Y.palette);
      this.door = null;
      this.van = null;
      const fenceHp = W().DEFENSE.fenceHp[S.save.rooms.walls] || W().DEFENSE.fenceHp[0];
      let start = [2.5, 2.5, -Math.PI / 2];
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
            this.fence[x + "," + y] = fenceHp;
          } else if (ch === "B") {
            this.door = { x, y };
          } else if (ch === "V" && !this.van) {
            this.van = { x, y };
          }
          if (this.grid[y][x] === ".") this.floors.push([x + 0.5, y + 0.5]);
        }
      }
      this.fenceMax = fenceHp;
      this.makePlayer(start[0], start[1], start[2]);
      this.player.hp = this.player.maxHp; // home: rested
      this.waveIndex = 0;
      this.phase = { kind: "calm", t: (opts && opts.firstCalm) || W().DEFENSE.firstCalmSeconds, total: 0, spawned: 0, spawnT: 0, size: "none" };
      this.hud.place.textContent = "Home Base";
      this.hud.phase.classList.remove("hidden");
      this.startLoop();
      this.toast("Home. It's quiet for now. E at the cabin door builds; E at the van heads out.", 5);
    },

    leave() {
      this.running = false;
      this.paused = false;
      cancelAnimationFrame(this.raf);
      this.hud.root.classList.add("hidden");
      this.releasing = true;
      if (document.pointerLockElement === this.canvas && document.exitPointerLock) document.exitPointerLock();
      if (State().trip && this.player) State().trip.footHp = this.player.hp;
    },
    pause() {
      if (!this.running) return;
      this.paused = true;
      this.keys = {};
      this.mouseDown = false;
      this.releasing = true;
      if (document.pointerLockElement === this.canvas && document.exitPointerLock) document.exitPointerLock();
    },
    resume() {
      if (!this.running) return;
      this.paused = false;
      this.last = 0;
      this.updateHud();
    },
    /** Call after the build menu changed the base (walls level, repairs). */
    refreshYard() {
      if (this.mode !== "yard") return;
      const S = State();
      const hp = W().DEFENSE.fenceHp[S.save.rooms.walls] || W().DEFENSE.fenceHp[0];
      this.fenceMax = hp;
      Object.keys(this.fence).forEach((k) => (this.fence[k] = hp));
      this.gun = ZSR.Upgrades.stats(S.save.upgrades);
      this.fx = S.effects();
      this.player.maxHp = S.footMaxHp();
      this.player.hp = this.player.maxHp;
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

    solidAt(x, y) {
      const gx = Math.floor(x);
      const gy = Math.floor(y);
      if (gx < 0 || gy < 0 || gx >= this.gw || gy >= this.gh) return true;
      return SOLID.includes(this.grid[gy][gx]);
    },
    opaqueAt(x, y) {
      const gx = Math.floor(x);
      const gy = Math.floor(y);
      if (gx < 0 || gy < 0 || gx >= this.gw || gy >= this.gh) return true;
      return OPAQUE.includes(this.grid[gy][gx]);
    },
    moveCircle(ent, dx, dy, r) {
      const tryX = ent.x + dx;
      if (!this.solidAt(tryX + Math.sign(dx) * r, ent.y - r * 0.7) && !this.solidAt(tryX + Math.sign(dx) * r, ent.y + r * 0.7)) ent.x = tryX;
      const tryY = ent.y + dy;
      if (!this.solidAt(ent.x - r * 0.7, tryY + Math.sign(dy) * r) && !this.solidAt(ent.x + r * 0.7, tryY + Math.sign(dy) * r)) ent.y = tryY;
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
      this.notes.forEach((n) => cand.push({ kind: "note", obj: n, x: n.x, y: n.y }));
      if (this.cacheDoor && !this.cacheDoor.open) cand.push({ kind: "cache", obj: this.cacheDoor, x: this.cacheDoor.x + 0.5, y: this.cacheDoor.y + 0.5 });
      if (this.exit) cand.push({ kind: "exit", obj: this.exit, x: this.exit.x + 0.5, y: this.exit.y + 0.5 });
      if (this.door) cand.push({ kind: "door", obj: this.door, x: this.door.x + 0.5, y: this.door.y + 0.5 });
      if (this.van) cand.push({ kind: "van", obj: this.van, x: this.van.x + 1, y: this.van.y + 0.5 });
      let best = null;
      cand.forEach((c) => {
        const dx = c.x - p.x;
        const dy = c.y - p.y;
        const d = Math.hypot(dx, dy);
        const reach = c.kind === "note" ? 1.4 : c.kind === "van" ? 2.0 : 1.6;
        if (d > reach) return;
        const diff = Math.abs(normAngle(Math.atan2(dy, dx) - p.a));
        if (diff > 0.95) return;
        if (!best || d < best.d) best = Object.assign({ d }, c);
      });
      return best;
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
          S.tripLoc(this.loc.id).cacheOpened = true;
          this.toast("Opened: " + this.loc.cacheName + ".", 3);
          Audio().play("buy");
          this.updateHud();
        } else {
          this.toast("Locked. A note in this building says how to open it.", 3);
          Audio().play("wrong");
        }
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
      if (added.length) this.toast("New place on the map: " + added.map((id) => W().LOCATIONS.find((l) => l.id === id).name).join(", "), 4);
      this.updateHud();
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
      const speed = 3.1 * (k.shift ? 1.35 : 1);
      if (fwd || side) {
        const len = Math.hypot(fwd, side) || 1;
        const dx = (Math.cos(p.a) * fwd - Math.sin(p.a) * side) / len;
        const dy = (Math.sin(p.a) * fwd + Math.cos(p.a) * side) / len;
        this.moveCircle(p, dx * speed * dt, dy * speed * dt, 0.3);
        p.bob += dt * 9;
        p.moving = true;
      } else p.moving = false;
      p.cooldown -= dt;
      p.flash = Math.max(0, p.flash - dt);
      p.hurt = Math.max(0, p.hurt - dt * 1.5);
      if (this.fx.footRegen) p.hp = Math.min(p.maxHp, p.hp + this.fx.footRegen * dt);

      if ((this.mouseDown || k[" "]) && p.cooldown <= 0) {
        p.cooldown = this.gun.fireInterval;
        p.flash = 0.08;
        this.noise = this.time;
        this.shoot();
        Audio().play("shoot");
      }

      if (this.mode === "building") this.updatePickups();
      else this.updateYard(dt);

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
          this.toast("The Medbay kit brings you back. Half health. Be careful.", 4);
        } else {
          this.running = false;
          if (this.hooks.onDeath) this.hooks.onDeath();
          return;
        }
      }
      this.shake *= Math.pow(0.02, dt);

      const f = this.facing();
      const inWave = this.phase && this.phase.kind === "wave";
      const hint = !f ? "" : f.kind === "note" ? "Press E to read the note" : f.kind === "cache" ? "Press E to open " + this.loc.cacheName : f.kind === "exit" ? "Press E to leave for the van" : f.kind === "door" ? (inWave ? "Cabin door (clear the wave first)" : "Press E to go inside and build") : inWave ? "The van (clear the wave first)" : "Press E to head out in the van";
      if (this.hud.hint.textContent !== hint) this.hud.hint.textContent = hint;
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
            const total = size === "some" ? D.someCount(S.save.day, this.waveIndex) : D.manyCount(S.save.day, this.waveIndex);
            this.phase = { kind: "wave", size, total, spawned: 0, spawnT: 0, t: 0 };
            this.toast(size === "many" ? "A lot of them. Hold the fence!" : "Walkers at the fence.", 3);
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
          // the crew patches the fence between waves
          Object.keys(this.fence).forEach((k) => (this.fence[k] = this.fenceMax));
          for (let y = 0; y < this.gh; y++) for (let x = 0; x < this.gw; x++) if (W().YARD.grid[y][x] === "F" && this.grid[y][x] === ".") this.grid[y][x] = "F";
          this.toast("Wave cleared. The fence is patched. Build while it's quiet.", 4);
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
      z.frameT += dt;
      // running is loud: sprinting players are noticed from farther away
      const hear = this.keys.shift && this.player.moving ? 9 : 6;
      if (!z.awake && (dist < hear || (this.time - this.noise < 1.5 && dist < 11) || z.hurtT > 0)) z.awake = true;
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

    shoot() {
      const n = this.gun.bullets;
      for (let s = 0; s < n; s++) {
        const off = (s - (n - 1) / 2) * 0.06;
        const target = this.walkerAt(off);
        if (target) {
          target.hp -= this.gun.damage;
          target.hit = 0.12;
          target.hurtT = 1;
          target.awake = true;
          Audio().play("hit");
          if (target.hp <= 0) {
            const S = State();
            if (S.trip) {
              S.trip.walkers += 1;
              S.trip.scrap += target.scrap;
            } else {
              S.save.scrap += target.scrap;
              S.save.stats.walkers += 1;
            }
            Audio().play("poof");
            this.updateHud();
          }
        }
      }
    },
    walkerAt(angleOff) {
      const p = this.player;
      const a = p.a + angleOff;
      let best = null;
      this.walkers.forEach((z) => {
        const dx = z.x - p.x;
        const dy = z.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.05) return;
        const ang = normAngle(Math.atan2(dy, dx) - a);
        const halfWidth = Math.atan2(z.r * 1.1, dist);
        if (Math.abs(ang) > halfWidth) return;
        if (!this.lineClear(p.x, p.y, z.x, z.y)) return;
        if (!best || dist < best.dist) best = { z, dist };
      });
      return best ? best.z : null;
    },

    updateHud() {
      const S = State();
      const p = this.player;
      const h = this.hud;
      if (!p) return;
      const pct = clamp((p.hp / p.maxHp) * 100, 0, 100);
      h.hpFill.style.width = pct + "%";
      h.hpFill.style.background = pct > 50 ? "#7a9a3c" : pct > 25 ? "#d9a21b" : "#b3261e";
      h.hpText.textContent = Math.max(0, Math.round(p.hp));
      h.scrap.textContent = S.save.scrap + (S.trip ? S.trip.scrap : 0);
      const cargoN = S.trip ? Object.values(S.trip.cargo).reduce((a, b) => a + b, 0) : 0;
      h.cargo.textContent = cargoN;
      h.walkers.textContent = this.walkers.length;
      if (this.mode === "building") {
        const left = this.items.filter((i) => !i.taken && !i.fromCache).length;
        const cacheLeft = this.items.filter((i) => !i.taken && i.fromCache).length;
        const cacheState = this.cacheDoor ? (this.cacheDoor.open ? "open" : "locked") : "none";
        h.goal.textContent = (left ? left + " item" + (left > 1 ? "s" : "") + " on the floor" : "Floor cleared") + " · " + this.loc.cacheName + ": " + cacheState + (cacheLeft && cacheState === "open" ? ", " + cacheLeft + " left" : "");
      } else {
        const broken = Object.values(W().YARD.grid.join("")).filter((c) => c === "F").length - Object.keys(this.fence).length;
        h.goal.textContent = "Day " + S.save.day + " · fence " + (broken ? broken + " gap" + (broken > 1 ? "s" : "") : "intact") + " · walls level " + S.save.rooms.walls;
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
            fence = { dist: Math.max(0.05, fp), wallX: fwx, side, key: mapX + "," + mapY };
            continue;
          }
          if (OPAQUE.includes(tile)) break;
        }
        const perp = side === 0 ? sideX - deltaX : sideY - deltaY;
        const dist = Math.max(0.05, perp);
        zbuf[col] = dist;
        fbuf[col] = fence ? fence.dist : Infinity;
        const lineH = H / dist;
        const top = H / 2 - lineH / 2;
        const bottom = H / 2 + lineH / 2;
        let wallX = side === 0 ? p.y + perp * rdy : p.x + perp * rdx;
        wallX -= Math.floor(wallX);
        const tex = D3().texture(TEX_OF[tile] || "wall", pal);
        const x = col * COL;
        ctx.drawImage(tex, Math.floor(wallX * 64), 0, 1, 64, x, top, COL, lineH);
        const dark = Math.min(0.8, dist / (pal.sky ? 22 : 13) + (side === 1 ? 0.12 : 0));
        if (dark > 0.02) {
          ctx.fillStyle = "rgba(0,0,0," + dark.toFixed(3) + ")";
          ctx.fillRect(x, top, COL, lineH);
        }
        ctx.fillStyle = "#0f1012";
        const ink = Math.max(1.5, Math.min(4, lineH * 0.012));
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
      this.notes.forEach((n) => sprites.push({ x: n.x, y: n.y, img: D3().note(), scale: 0.42, lift: 0.3, dim: n.read ? 0.5 : 0 }));
      this.piles.forEach((pl) => !pl.taken && sprites.push({ x: pl.x, y: pl.y, img: D3().scrap(), scale: 0.5, lift: 0.25, wide: 1.33 }));
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
          ctx.drawImage(tex, Math.floor(f.wallX * 64), 0, 1, 64, x, top, COL, h2);
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
      D3().gun(ctx, Wd, H, { bob: p.moving ? p.bob : 0, flash: p.flash });
      D3().crosshair(ctx, Wd / 2, H / 2, !!this.walkerAt(0));
    },

    WALKER_TYPES,
  };

  ZSR.Interior = Interior;
})(typeof globalThis !== "undefined" ? globalThis : this);
