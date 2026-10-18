/* Wreckers and the room builds' strength, mixed into ZSR.Interior (the yard, js/yard.js).
   Owner, 2026-10-15: a quarter of a wave's walkers (DEFENSE.wreckShare, rolled at spawn in js/yard.js) are
   wreckers. Outside the fence a wrecker is an ordinary attacker (the breach rule holds it like the rest); once
   inside, it makes for the van or a room build (the nearest spot free to claw from) and claws it. It comes for you
   instead, for good, once it is hurt (traps too), once you are within DEFENSE.wreckProvoke tiles, or
   DEFENSE.wreckSeconds after it got inside.
   A build's strength is State.buildHp (save.builds, written live like the scrap: nothing saves mid-wave, and a
   death throws the wave away). Under half it shows cracks; at 0 it is wrecked: it gives no room bonus
   (State.effects) until it is fixed for SETTINGS.buildRepairScrap: E at it, the office computer's "Fix all", or
   Tomas's builds job in the calm (js/crew.js). Wreckers leave the van at DEFENSE.vanWreckFloor of its health; its
   dents show (js/van3d.js dentNow: the 3D van's sig changes and it redraws itself). God mode's "Can't die": they
   claw, nothing gives.
   Per walker: wreck (its role; false for good once provoked), wreckIn (this.time when it first stood inside),
   wreckTarget (a room id or "van"), wreckSpot ({ x, y, tx, ty, aim }: the tile it stands on, and the middle of the
   solid tile it claws: the core claws at a goal's aim once there). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const D3 = () => ZSR.Draw3;
  const W = () => ZSR.WORLD;
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const roomName = (room) => (W().BASE_ROOMS[room] && W().BASE_ROOMS[room].name) || room;
  /** "a", "a and b", "a, b and c". */
  const listWords = (parts) => (parts.length < 2 ? parts.join("") : parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1]);

  if (ZSR.Interior.REACH) ZSR.Interior.REACH.wreck = 1.8; // E fixes a build from this close (like a fence hole)

  Object.assign(ZSR.Interior, {
    /** Coming home: no wave state carried over. */
    wreckEnter() {
      this.wreckSpots = {};
      this.plotSolid = {};
      this.vanLook = null;
    },
    /** What the van looks like now, as far as its dents go: the 3D van's sig (js/van3d.js: paint, gear, dents; the
        model redraws itself when it changes, js/modelsprite.js), else the old wall face's texture. */
    vanLookNow() {
      const V = ZSR.Van3D;
      if (V && this.modelOf && this.modelOf("van")) return V.sig((State().save && State().save.upgrades) || {}, { dent: V.dentNow(), gun: true });
      return D3() ? D3().texture("vanBody", this.palette) : null;
    },

    /* ---------- What the save says about a build ---------- */
    /** 0 whole (or not built), 1 cracked (under half strength), 2 wrecked (State.buildDmg). */
    buildDmg(room) {
      return State().buildDmg(room);
    },
    /** { wrecked: [rooms], cracked: [rooms] } (State.buildDamage: the computer's row, the crew's tip, the toasts). */
    buildDamage() {
      return State().buildDamage();
    },
    /** The wrecked builds' names as words ("Garden and Well"), or "". */
    wreckedWords() {
      return listWords(State().wreckedRooms().map(roomName));
    },
    /** The plot sign's first row and status for a damaged build (js/interior.js lotPanel), or null. */
    buildMeta(room) {
      const dmg = this.buildDmg(room);
      if (!dmg) return null;
      const S = State();
      const c = W().SETTINGS.buildRepairScrap;
      // the crew's builds job fixes a wrecked build only (js/crew.js); a cracked one still works, and you brace it
      const fixer = dmg === 2 && this.crewFixer ? this.crewFixer("builds") : null;
      const how = "Face it and press E (" + c + " scrap, you have " + S.save.scrap + ")" + (fixer ? ", or " + fixer + " fixes it in the calm." : ".");
      if (dmg === 2) return { status: "wrecked", row: ["Wrecked", "Walkers wrecked it. It gives nothing until it is fixed. " + how] };
      return { status: "cracked", row: ["Cracked", "Walkers clawed it to under half strength. Brace it before they wreck it. " + how] };
    },
    /** The wave-cleared toast's part: wrecked builds (who fixes them) and a beaten van; "" when neither. */
    wreckClearedWords(vanHit) {
      const wrecked = State().wreckedRooms();
      const each = W().SETTINGS.buildRepairScrap + " scrap";
      let out = "";
      if (wrecked.length) {
        const names = listWords(wrecked.map(roomName));
        const fixer = this.crewCanPay && this.crewCanPay("builds") && this.crewFixer("builds");
        const n = wrecked.length;
        out += " Wrecked: " + names + ". " + (fixer ? fixer + " will fix " + (n > 1 ? "them (" + each + " each, from the base), or E at one fixes it now." : "it (" + each + ", from the base), or E there fixes it now.") : "E at a wrecked build fixes it for " + each + ".");
      }
      if (vanHit) out += " The van took a beating: fix it at the van or in the computer's Garage tab.";
      return out;
    },

    /* ---------- Where wreckers stand ---------- */
    /** After every dressYard: each built plot's solid tiles (its plaque aside: E there reads it) and the open tiles
        inside the fence beside them, and the same for the van. this.wreckSpots[target] = [{ x, y, tx, ty, aim }]. */
    wreckSpotsBuild() {
      const S = State();
      const Y = W().YARD;
      const gw = this.gw;
      const m = this.solidMask();
      const plaques = new Set((this.lots || []).map((l) => Math.floor(l.x) + "," + Math.floor(l.y)));
      this.wreckSpots = {};
      this.plotSolid = {};
      Object.entries(Y.plots).forEach(([room, pl]) => {
        if (!(S.save.rooms[room] > 0)) return;
        const solid = [];
        for (let y = pl.y; y < pl.y + pl.h; y++) for (let x = pl.x; x < pl.x + pl.w; x++) if (m[y * gw + x] && !plaques.has(x + "," + y)) solid.push([x, y]);
        this.plotSolid[room] = solid;
        this.wreckSpots[room] = this.spotsAround(solid);
      });
      this.wreckSpots.van = this.spotsAround(this.vanTiles || []);
      this.vanLook = this.vanLookNow(); // its look now (the dents change it: hitVan)
    },
    /** One spot per open tile inside the fence beside any of `tiles`, aimed at the first of them it touches. */
    spotsAround(tiles) {
      const gw = this.gw;
      const gh = this.gh;
      const m = this.solidMask();
      const own = new Set(tiles.map(([x, y]) => y * gw + x));
      const seen = new Set();
      const out = [];
      tiles.forEach(([x, y]) => {
        N4.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) return;
          const k = ny * gw + nx;
          if (m[k] || own.has(k) || seen.has(k) || !(this.yardInside && this.yardInside[k])) return;
          seen.add(k);
          out.push({ x: nx + 0.5, y: ny + 0.5, tx: nx, ty: ny, aim: [x + 0.5, y + 0.5] });
        });
      });
      return out;
    },
    /** A wrecked build's look: broken boards and rubble on the open ground of its plot (never solid). */
    wreckDebris(room, plot, plaque) {
      const m = this.solidMask();
      const gw = this.gw;
      const px = Math.floor(plaque.x);
      const py = Math.floor(plaque.y);
      const open = [];
      for (let y = plot.y; y < plot.y + plot.h; y++) for (let x = plot.x; x < plot.x + plot.w; x++) if (!m[y * gw + x] && !(x === px && y === py)) open.push([x, y]);
      if (!open.length) return;
      // up to three, spread over the plot (the first, the middle and the last open tile)
      const pick = [...new Set([0, open.length >> 1, open.length - 1])];
      pick.forEach((i, n) => {
        const [x, y] = open[i];
        this.addProp({ x: x + 0.5 + (n - 1) * 0.12, y: y + 0.5, art: "yDebris", opts: { v: n % 3 }, scale: 0.5 });
      });
    },

    /* ---------- Wreckers ---------- */
    /** A target still worth clawing: a build with strength left, or the van above its floor. */
    wreckLive(target) {
      if (!target) return false;
      if (target === "van") return State().save.vanHp > this.vanFloor();
      return State().buildHp(target) > 0;
    },
    /** The van's floor: wreckers leave it this much health (a trip never starts wrecked). */
    vanFloor() {
      return Math.round(State().vanMaxHp() * W().DEFENSE.vanWreckFloor);
    },
    /** Standing on its spot, clawing. */
    wreckAtSpot(z) {
      // the core's own "there" (Interior.GOAL_AT, js/interior.js stepWalker), so the claw it plays and the harm agree
      return !!(z.wreck && z.wreckSpot && Math.hypot(z.wreckSpot.x - z.x, z.wreckSpot.y - z.y) < this.GOAL_AT);
    },
    /** Where a wrecker heads (js/house.js yardWalkerGoal calls this first): its spot by a build or the van once
        it is inside the fence, else null (outside it is an attacker, under the breach rule like the rest). Once
        provoked it comes for you for good. */
    wreckGoal(z) {
      const D = W().DEFENSE;
      const p = this.player;
      // hurt counts for good: hurtT (1 s) can run out while the core skips this (a screamer's yell, a bite), so
      // any lost health counts too (makeWalker sets maxHp)
      const hurt = z.hurtT > 0 || z.hp < z.maxHp;
      const provoked = hurt || (p && Math.hypot(p.x - z.x, p.y - z.y) < D.wreckProvoke) || (z.wreckIn != null && this.time - z.wreckIn > D.wreckSeconds);
      if (provoked) return this.wreckDrop(z);
      const gx = Math.floor(z.x);
      const gy = Math.floor(z.y);
      if (!this.yardInside || !this.yardInside[gy * this.gw + gx]) return null;
      if (z.wreckIn == null) z.wreckIn = this.time;
      if (!z.wreckSpot || !this.wreckLive(z.wreckTarget)) {
        const pick = this.pickWreckTarget(z);
        if (!pick) return this.wreckDrop(z); // nothing left to wreck: it comes for you
        z.wreckTarget = pick.target;
        z.wreckSpot = pick.spot;
        z.pathT = 0;
      }
      return z.wreckSpot;
    },
    /** No longer a wrecker: an attacker like the rest, for good. */
    wreckDrop(z) {
      z.wreck = false;
      z.wreckSpot = null;
      z.wreckTarget = null;
      return null;
    },
    /** The nearest free spot (no other wrecker on it) of a target still standing, by walking distance from the
        walker: { target, spot }, or null. SCALE: one search over the yard each time a wrecker picks a target (once
        inside, and again only when its target falls), never every frame. */
    pickWreckTarget(z) {
      const gw = this.gw;
      const gh = this.gh;
      const want = new Map();
      Object.keys(this.wreckSpots || {}).forEach((target) => {
        if (!this.wreckLive(target)) return;
        this.wreckSpots[target].forEach((sp) => {
          const k = sp.ty * gw + sp.tx;
          if (want.has(k) || this.walkers.some((o) => o !== z && o.wreck && o.wreckSpot && o.wreckSpot.tx === sp.tx && o.wreckSpot.ty === sp.ty)) return;
          want.set(k, { target, spot: sp });
        });
      });
      if (!want.size) return null;
      const m = this.solidMask();
      const seen = new Uint8Array(gw * gh);
      const q = [Math.floor(z.y) * gw + Math.floor(z.x)];
      seen[q[0]] = 1;
      for (let i = 0; i < q.length; i++) {
        const v = q[i];
        if (want.has(v)) return want.get(v);
        const x = v % gw;
        const y = (v / gw) | 0;
        for (const [dx, dy] of N4) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
          const k = ny * gw + nx;
          if (seen[k] || m[k]) continue;
          seen[k] = 1;
          q.push(k);
        }
      }
      return null;
    },
    /** Every frame of a wave: each wrecker on its spot that is clawing claws its target (before the walkers move,
        so `act` is last frame's: one frame late on arrival). Not one that stands there doing something else: a
        screamer yelling at you (the core's scream comes before the claw), so the harm and the claw pose agree. */
    yardWreck(dt) {
      if (!this.walkers || !this.walkers.length) return;
      const S = State();
      const D = W().DEFENSE;
      const god = S.cheat("noDie"); // god mode: they claw, nothing gives
      let floor = null;
      for (const z of this.walkers) {
        if (z.hp <= 0 || z.act !== "claw" || !this.wreckAtSpot(z)) continue;
        const harm = god ? 0 : z.dps * (D.wreckDps == null ? 1 : D.wreckDps) * dt;
        if (z.wreckTarget === "van") {
          if (floor == null) floor = this.vanFloor();
          this.hitVan(harm, floor);
        } else this.hitBuild(z.wreckTarget, harm);
      }
    },
    /** Claw `harm` off a build (live in the save). Under half: the cracks show; at 0 it is wrecked: no room bonus
        until it is fixed (State.effects; this.fx at once), and its wreckers pick another target. False once wrecked. */
    hitBuild(room, harm) {
      const S = State();
      const max = S.buildMax(room);
      const before = S.buildHp(room);
      if (!max || before <= 0) return false;
      if (!(harm > 0)) return true;
      const hp = Math.max(0, before - harm);
      S.save.builds = S.save.builds || {};
      S.save.builds[room] = hp;
      if (hp <= 0) {
        this.fx = S.effects();
        this.walkers.forEach((w) => {
          if (w.wreckTarget === room) {
            w.wreckSpot = null;
            w.wreckTarget = null;
          }
        });
        this.dressYard();
        this.toast("Walkers wrecked the " + roomName(room) + "! It gives nothing until it is fixed.", 3.5);
        Audio().play("crunch");
        this.updateHud();
        return false;
      }
      if (before >= max * 0.5 && hp < max * 0.5) this.dressYard(); // the cracks show
      return true;
    },
    /** Claw `harm` off the van, never below its floor (live in the save). The first time in a wave it is told;
        its dents show as its health drops (the van's textures key on it). False once at the floor. */
    hitVan(harm, floor) {
      const S = State();
      const f = floor == null ? this.vanFloor() : floor;
      if (S.save.vanHp <= f) return false;
      if (!(harm > 0)) return true;
      S.save.vanHp = Math.max(f, S.save.vanHp - harm);
      const ph = this.phase;
      if (ph && !ph.vanHit) {
        ph.vanHit = true;
        this.toast("They are wrecking the van!", 3);
        Audio().play("crunch");
      }
      const look = this.vanLookNow();
      if (look !== this.vanLook) {
        // a new dent: the 3D van draws itself again (its sig changed); a van drawn as wall faces (no Model3D loaded)
        // needs its textures fetched again
        if (this.vanLook && !(this.modelOf && this.modelOf("van"))) this.refreshScene();
        this.vanLook = look;
      }
      return S.save.vanHp > f;
    },

    /* ---------- Repairs: E at a build, the computer's "Fix all", Tomas (js/crew.js) ---------- */
    /** Whole again, at full strength: its bonus is back at once. */
    mendBuild(room) {
      const S = State();
      if (S.save.builds) delete S.save.builds[room];
      this.fx = S.effects();
      if (this.mode === "yard") this.dressYard();
    },
    /** The player fixes a wrecked or cracked build for SETTINGS.buildRepairScrap (in a wave too, like the fence;
        never while a wrecker claws at it). True when done. */
    repairBuild(room) {
      const S = State();
      const cost = W().SETTINGS.buildRepairScrap;
      if (!this.buildDmg(room)) return false;
      if (S.save.scrap < cost) {
        this.toast("Not enough scrap. " + cost + " scrap fixes a build.", 3);
        Audio().play("wrong");
        return false;
      }
      if (this.walkers.some((z) => z.wreckTarget === room && this.wreckAtSpot(z))) {
        this.toast("Clear the walkers off it first.", 2.5);
        Audio().play("wrong");
        return false;
      }
      S.save.scrap -= cost;
      this.mendBuild(room);
      this.toast("The " + roomName(room) + " is fixed. It works again.", 2.5);
      Audio().play("buy");
      this.updateHud();
      if (this.hooks.onYardChanged) this.hooks.onYardChanged();
      return true;
    },
    /** Fix every wrecked, then every cracked build the scrap pays for (the computer's button: State.buildFixAll, the
        rule its price and Tomas's tip read too). Returns how many. */
    repairAllBuilds() {
      const S = State();
      const all = S.buildFixAll(this.buildDamage());
      let n = 0;
      for (const room of all.rooms) {
        if (S.save.scrap < all.each) break;
        S.save.scrap -= all.each;
        if (S.save.builds) delete S.save.builds[room];
        n++;
      }
      if (!n) return 0;
      this.fx = S.effects();
      if (this.mode === "yard") this.dressYard();
      this.toast("Fixed " + n + " build" + (n > 1 ? "s" : "") + ".", 3);
      this.updateHud();
      return n;
    },
    /** E candidates: the solid tiles of a wrecked or cracked build within reach (its plaque still reads). */
    wreckFacing(cand) {
      const p = this.player;
      const px = Math.floor(p.x);
      const py = Math.floor(p.y);
      Object.entries(this.plotSolid || {}).forEach(([room, tiles]) => {
        if (!this.buildDmg(room)) return;
        tiles.forEach(([x, y]) => {
          if (Math.abs(x - px) <= 2 && Math.abs(y - py) <= 2) cand.push({ kind: "wreck", obj: room, x: x + 0.5, y: y + 0.5 });
        });
      });
    },
    wreckHint(room) {
      const fix = W().SETTINGS.buildRepairScrap + " scrap";
      return this.buildDmg(room) === 2 ? "Press E to fix the wrecked " + roomName(room) + " (" + fix + ")" : "Press E to brace the " + roomName(room) + " (" + fix + ")";
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
