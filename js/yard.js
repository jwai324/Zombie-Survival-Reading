/* Yard mode for the first-person view, mixed into ZSR.Interior: the home base yard
   (cabin defense). The fence you can shoot over, holes and repairs, traps, the wave
   phases (calm / some / many), the cabin door (build menu), the van (map), the cabin's
   roof, the ground, and the yard's HUD goal.
   Yard legend (WORLD.YARD.grid): T treeline  F fence segment  H cabin wall
   B cabin door  V the van  P player start  z walker spawn (outside the fence). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const W = () => ZSR.WORLD;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // the cabin's walls stop at the eave; the roof peaks at the ridge
  const CABIN_ROOF = { eave: 1.0, ridge: 1.7, roofTex: "roof", gableTex: "gable" };

  Object.assign(ZSR.Interior, {
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
        // a gabled roof over the cabin: one entry in the shared roofs list
        this.cabin = Object.assign(cab, CABIN_ROOF);
        this.roofs.push(this.cabin);
        // windows either side of the door on the front wall
        if (this.door) {
          this.tileTex[this.door.x - 1 + "," + this.door.y] = "houseWindow";
          this.tileTex[this.door.x + 1 + "," + this.door.y] = "houseWindow";
        }
      }
      this.yardGround();
      this.fenceMax = fenceHp;
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

    /** Grass everywhere, gravel where the van parks, a worn dirt path from the cabin door to it. */
    yardGround() {
      const v = this.van;
      const d = this.door;
      if (v) for (let y = v.y - 1; y <= v.y + 1; y++) for (let x = v.x - 1; x <= v.x + 2; x++) this.setFloor(x, y, "gravel");
      if (v && d) {
        const y = d.y - 1;
        for (let x = Math.min(d.x, v.x + 3); x <= Math.max(d.x, v.x + 3); x++) this.setFloor(x, y, "dirt");
      }
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
    /** Is this tile on the fence line (whole, cracked or a hole)? The player never walks through it. */
    isFenceLine(gx, gy) {
      const Y = W().YARD.grid;
      return !!Y[gy] && Y[gy][gx] === "F";
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
      this.maskDirty = true;
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
        if (ch !== "." || this.solidAt(gx + 0.5, gy + 0.5)) break;
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

    /** Call after the build menu changed the base. Building the Walls up rebuilds the whole fence;
        nothing else touches it (holes stay until they are paid for). */
    refreshYard(opts) {
      if (this.mode !== "yard") return;
      const S = State();
      const hp = W().DEFENSE.fenceHp[S.save.rooms.walls] || W().DEFENSE.fenceHp[0];
      const grew = hp !== this.fenceMax;
      this.fenceMax = hp;
      if (grew || (opts && opts.rebuildFence)) this.patchFence();
      this.gun = ZSR.Upgrades.stats(S.save.upgrades);
      this.fx = S.effects();
      this.refreshScene(); // the van's paint may have changed
      // no free heal for stepping inside: health carries over, and a bigger maximum adds the difference
      const oldMax = this.player.maxHp;
      this.player.maxHp = S.footMaxHp();
      this.player.hp = clamp(this.player.hp + (this.player.maxHp - oldMax), 1, this.player.maxHp);
      this.traps = (S.save.yardTraps || []).map((t) => Object.assign({}, t));
      this.updateHud();
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
      this.maskDirty = true;
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

    /* ---------- Mode hooks (called by the core while mode is "yard") ---------- */
    yardUpdate(dt) {
      this.updateYard(dt);
      this.updateTraps(dt);
    },
    yardKey(k) {
      if (k !== "t" && k !== "r") return false;
      this.placeTrap(k === "t" ? "spike" : "blast");
      return true;
    },
    yardFacing(cand) {
      const p = this.player;
      if (this.door) cand.push({ kind: "door", obj: this.door, x: this.door.x + 0.5, y: this.door.y + 0.5 });
      if (this.van) cand.push({ kind: "van", obj: this.van, x: this.van.x + 1, y: this.van.y + 0.5 });
      // fence segments near the player: holes to rebuild, cracks to brace
      const Y = W().YARD.grid;
      for (let gy = Math.floor(p.y) - 2; gy <= Math.floor(p.y) + 2; gy++) for (let gx = Math.floor(p.x) - 2; gx <= Math.floor(p.x) + 2; gx++) {
        if (!Y[gy] || Y[gy][gx] !== "F") continue;
        const hp = this.fence[gx + "," + gy];
        if (hp == null) cand.push({ kind: "hole", obj: [gx, gy], x: gx + 0.5, y: gy + 0.5 });
        else if (hp < this.fenceMax * 0.5) cand.push({ kind: "crack", obj: [gx, gy], x: gx + 0.5, y: gy + 0.5 });
      }
    },
    yardInteract(f) {
      const inWave = this.phase && this.phase.kind === "wave";
      if (f.kind === "hole" || f.kind === "crack") {
        this.repairFence(f.obj[0], f.obj[1]);
      } else if (f.kind === "door" || f.kind === "van") {
        if (inWave) {
          this.toast("Not now. Clear the fence first.", 2.5);
          Audio().play("wrong");
        } else if (f.kind === "door" && this.hooks.onDoor) this.hooks.onDoor();
        else if (f.kind === "van" && this.hooks.onVan) this.hooks.onVan();
      }
    },
    yardHint(f) {
      const inWave = this.phase && this.phase.kind === "wave";
      const fix = W().SETTINGS.fenceRepairScrap + " scrap";
      if (f.kind === "hole") return "Press E to rebuild the fence (" + fix + ")";
      if (f.kind === "crack") return "Press E to brace the fence (" + fix + ")";
      if (f.kind === "door") return inWave ? "Cabin door (clear the wave first)" : "Press E to go inside and build";
      if (f.kind === "van") return inWave ? "The van (clear the wave first)" : "Press E to head out in the van";
      return "";
    },
    yardGoal() {
      const S = State();
      const broken = this.fenceHoles().length;
      const tr = S.save.traps || {};
      const held = Object.entries(W().TRAPS).filter(([k]) => tr[k] > 0).map(([k, d]) => tr[k] + " " + d.name.toLowerCase() + (tr[k] > 1 ? "s" : "") + " (" + d.key + ")");
      return "Day " + S.save.day + " · fence " + (broken ? broken + " hole" + (broken > 1 ? "s" : "") + " (E to fix)" : "whole") + " · walls " + S.save.rooms.walls + (held.length ? " · traps: " + held.join(", ") : "");
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
