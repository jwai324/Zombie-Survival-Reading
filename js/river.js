/* River Landing, mixed into ZSR.Interior: the bank at the end of Frog Lane (WORLD.RIVER.grid), first person
   under open sky. The van on the dirt turnout, a sign, a dock with a note on its post, and the river.
   Walkers come out of the trees now and then (WORLD.RIVER.walkerEvery), one at a time or two together;
   a shot brings the next one sooner (the bow is silent).
   Fishing, with the pole in your hands (6, Q or the wheel): click to cast (the bobber lands on the water
   ahead), wait for a bite (the bobber dips and splashes), click within WORLD.RIVER.hook seconds to land
   it; a click while you wait reels in. Look around all you like: the bobber stays where it landed and the
   line runs out to it. Take a gun with the line out and the pole is propped on the bank, line still in:
   a bite then rings its bell and the fish stays on until you take the pole back (E at it). Each fish is
   one food in the van (State.catchFish), up to WORLD.RIVER.cap a trip; then the river rests.
   E at the sign or the note reads it; E at the van leaves. Words come from ZSR.riverText. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const D3 = () => ZSR.Draw3;
  const W = () => ZSR.WORLD;
  const RV = () => ZSR.WORLD.RIVER;
  const rand = (a, b) => a + Math.random() * (b - a);
  const SIGN_SCALE = { normal: 1, large: 1.3, huge: 2 }; // the sign's title grows with the text size, like the yard's

  Object.assign(ZSR.Interior, {
    enterRiver(loc) {
      const S = State();
      const R = RV();
      this.mode = "river";
      this.loc = loc;
      this.loadGrid(R.grid, R.palette);
      this.water = new Uint8Array(this.gw * this.gh);
      this.riverSpots = []; // the sign and the note: read with E (the core's read panel, via readSpot)
      let start = [22.5, 18.5, Math.PI]; // facing west, at the water
      const k = SIGN_SCALE[root.document && document.documentElement.getAttribute("data-size")] || 1;
      for (let y = 0; y < this.gh; y++) {
        for (let x = 0; x < this.gw; x++) {
          const ch = this.grid[y][x];
          const cx = x + 0.5;
          const cy = y + 0.5;
          // the far bank and the edges are a wall of trees; a tree out on the grass is a tree (solid, and cover)
          const edge = x === 0 || y === 0 || x === this.gw - 1 || y === this.gh - 1;
          if ((ch === "T" && edge) || ch === "V") {
            if (ch === "V" && !this.van) this.van = { x, y };
            continue;
          }
          if (ch === "T") {
            this.grid[y][x] = ".";
            this.addProp({ x: cx, y: cy, art: "riverTree", opts: { v: (x * 7 + y * 3) % 3 }, scale: 2.1, solid: true });
            continue;
          }
          this.grid[y][x] = ".";
          if (ch === "~") {
            // the river: you can see and shoot across it, never walk on it
            this.setFloor(x, y, "water");
            this.water[y * this.gw + x] = 1;
            this.blockers.add(x + "," + y);
          } else if (ch === "=") this.setFloor(x, y, "planks");
          else if (ch === "," || ch === ":") this.setFloor(x, y, "dirt");
          else if (ch === "P") {
            start = [cx, cy, Math.PI];
            this.setFloor(x, y, "dirt");
          } else if (ch === "S") {
            this.setFloor(x, y, "dirt");
            this.addProp({ x: cx, y: cy, art: "riverSign", opts: { t: loc.name }, scale: 1.25 * k, solid: true });
            this.riverSpots.push({ name: "sign", x: cx, y: cy });
          } else if (ch === "N") {
            this.setFloor(x, y, "dirt");
            this.addProp({ x: cx, y: cy, art: "dockPost", scale: 1.1, solid: true, cover: false });
            this.riverSpots.push({ name: "note", x: cx, y: cy });
          } else if (ch === "z") this.spawns.push([cx, cy]);
        }
      }
      this.dressBank();
      this.makePlayer(start[0], start[1], start[2]);
      this.startPos = start;
      this.fishing = { state: "idle", t: 0, bobber: null, propped: null, ringT: 0, castT: 0, catchT: 0, waitT: 0 };
      this.riverSpawnT = rand(R.walkerEvery[0] * 0.5, R.walkerEvery[1] * 0.5); // the first one comes a little sooner
      S.tripLoc(loc.id).visits += 1;
      if (!S.trip.visited.includes(loc.id)) S.trip.visited.push(loc.id);
      this.hud.place.textContent = loc.name;
      this.hud.phase.classList.remove("hidden");
      this.hud.phase.classList.remove("alarm");
      this.startLoop();
      const tips = S.hasRod()
        ? ["The river is past the dock. Press 6 for the fishing pole, then click to cast. Watch the trees behind you.", "Press 6 for the pole. Click to cast."]
        : ["No fishing pole yet. There is one at Station 12. E at the van leaves.", "No fishing pole yet."];
      this.toastFit(tips, 5);
    },

    /** Reeds and rocks along the bank, the same every visit. */
    dressBank() {
      let s = 7;
      const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
      // along the mud of the east bank (grid column 9), north to south
      for (let y = 2; y < this.gh - 2; y++) {
        if (y >= 15 && y <= 19) continue; // the dock and its post
        const roll = r();
        if (roll < 0.45) this.addProp({ x: 9.15 + r() * 0.3, y: y + 0.3 + r() * 0.4, art: "reeds", scale: 0.55 + r() * 0.25 });
        else if (roll < 0.55) this.addProp({ x: 9.4, y: y + 0.5, art: "rock", scale: 0.3 });
      }
    },

    isWater(x, y) {
      const gx = Math.floor(x);
      const gy = Math.floor(y);
      return gx >= 0 && gy >= 0 && gx < this.gw && gy < this.gh && this.water[gy * this.gw + gx] === 1;
    },

    /* ---------- Fishing ---------- */
    /** A click with the pole in hand: cast, reel in, or hook the fish that is biting. */
    riverRodClick() {
      const f = this.fishing;
      if (f.state === "idle") this.castLine();
      else if (f.state === "wait") this.reelIn("You reel the line in.");
      else if (f.state === "bite") this.landFish();
      return true;
    },
    castLine() {
      const S = State();
      const R = RV();
      const p = this.player;
      if (S.fishLeft() <= 0) {
        const days = S.riverRestDays();
        this.toast(days ? "Nothing is biting. The river is fished out. Come back in " + days + " day" + (days > 1 ? "s" : "") + "." : "That is " + R.cap + " fish. Leave the rest, so there are fish next time.", 4);
        Audio().play("wrong");
        return;
      }
      // the farthest water ahead, within the cast, that nothing stands in front of
      let at = null;
      for (let d = R.castMax; d >= R.castMin; d -= 0.25) {
        const x = p.x + Math.cos(p.a) * d;
        const y = p.y + Math.sin(p.a) * d;
        if (this.isWater(x, y) && this.lineClear(p.x, p.y, x, y)) {
          at = { x, y };
          break;
        }
      }
      if (!at) {
        this.toast("Face the water to cast. The end of the dock is best.", 3);
        Audio().play("wrong");
        return;
      }
      const f = this.fishing;
      f.state = "wait";
      f.t = rand(R.bite[0], R.bite[1]);
      f.castT = 1;
      f.bobber = this.addProp({ x: at.x, y: at.y, art: "bobber", opts: { dip: 0 }, scale: 0.26, lift: 0 });
      Audio().play("cast");
    },
    /** Line out of the water: the bobber comes in. */
    reelIn(msg) {
      const f = this.fishing;
      this.dropProp(f.bobber);
      this.dropProp(f.propped);
      f.bobber = null;
      f.propped = null;
      f.state = "idle";
      if (msg) this.toast(msg, 2);
      Audio().play("reel");
    },
    landFish() {
      const S = State();
      const f = this.fishing;
      this.reelIn(null);
      if (!S.catchFish()) return;
      f.catchT = 1.8;
      const left = S.fishLeft();
      this.toast("You caught a fish! That is 1 more food. " + (left ? left + " more to catch on this trip." : "That is enough for today: let the river rest."), 4);
      Audio().play("correct");
      this.updateHud();
    },
    dropProp(pr) {
      if (!pr) return;
      const i = this.props.indexOf(pr);
      if (i >= 0) this.props.splice(i, 1);
    },
    /** Going for a gun with the line out: the pole is propped on the bank, the line stays in. */
    riverRodAway() {
      const f = this.fishing;
      if (f.state === "idle" || f.propped) return;
      const p = this.player;
      // a little ahead of you, on land
      let x = p.x + Math.cos(p.a) * 0.5;
      let y = p.y + Math.sin(p.a) * 0.5;
      if (this.solidAt(x, y)) {
        x = p.x;
        y = p.y;
      }
      f.propped = this.addProp({ x, y, art: "rodPropped", opts: { ring: 0 }, scale: 0.55 });
      f.ringT = 0;
      this.toast("You prop the pole on the bank. The line stays in. Its bell rings if a fish bites.", 3.5);
    },
    /** 6 or Q while the pole is propped: it is out on the bank, go and get it. */
    riverRodSelect() {
      const f = this.fishing;
      if (!f.propped) return true;
      this.toast("Your pole is propped on the bank. Walk to it and press E.", 3);
      Audio().play("wrong");
      return false;
    },
    /** E at the propped pole: back in your hands; a fish already biting gives you a fresh moment to hook it. */
    takeProppedRod() {
      const f = this.fishing;
      this.dropProp(f.propped);
      f.propped = null;
      this.selectRod();
      if (f.state === "bite") {
        f.t = RV().hook + 0.5;
        this.toast("A fish is on! Click now!", 2.5);
      }
    },
    riverRodView() {
      const f = this.fishing;
      const bite = f.state === "bite";
      return { bend: bite ? 0.7 + 0.3 * Math.sin(this.time * 18) : 0, cast: f.castT, out: !!f.bobber, line: f.bobber && !f.propped ? { x: f.bobber.x, y: f.bobber.y } : null, fish: f.catchT > 0, fishT: this.time * 6 };
    },
    updateFishing(dt) {
      const S = State();
      const R = RV();
      const f = this.fishing;
      const p = this.player;
      f.castT = Math.max(0, f.castT - dt * 2.5);
      f.catchT = Math.max(0, f.catchT - dt);
      if (f.state === "wait") {
        f.t -= dt;
        if (f.bobber) f.bobber.lift = 0.015 * Math.sin(this.time * 2.6);
        if (f.t <= 0 && S.fishLeft() > 0) {
          f.state = "bite";
          f.t = R.hook;
          f.ringT = 0;
          if (f.bobber) {
            f.bobber.img = D3().sprite("bobber", { dip: 1 });
            f.bobber.lift = 0;
          }
          Audio().play("splash");
          if (!f.propped) this.toast("A bite! Click now!", R.hook);
        }
      } else if (f.state === "bite") {
        if (f.propped) {
          // the fish stays on: the bell rings until you take the pole back
          f.ringT -= dt;
          if (f.ringT <= 0) {
            f.ringT = 1.6;
            Audio().play("bell");
            f.propped.img = D3().sprite("rodPropped", { ring: 1 });
            this.toast("The bell on the pole is ringing! A fish is on. Go and press E at the pole.", 2.5);
          } else if (f.ringT < 1.1) f.propped.img = D3().sprite("rodPropped", { ring: 0 });
        } else {
          f.t -= dt;
          if (f.t <= 0) {
            // too slow: it got away, the bobber bobs back up and the wait starts over
            f.state = "wait";
            f.t = rand(R.bite[0], R.bite[1]);
            if (f.bobber) f.bobber.img = D3().sprite("bobber", { dip: 0 });
            this.toast("It got away. Keep the line in: another one will bite.", 2.5);
          }
        }
      }
      // walked off with the line out: it would snag, so it comes in
      if (f.bobber && !f.propped && this.tool === "rod" && Math.hypot(f.bobber.x - p.x, f.bobber.y - p.y) > R.castMax + 3) this.reelIn("Too far from the line. You reel it in.");
    },

    /* ---------- Walkers out of the trees ---------- */
    updateRiverWalkers(dt) {
      const R = RV();
      const S = State();
      this.riverSpawnT -= dt;
      if (this.riverSpawnT > 0) return;
      this.riverSpawnT = rand(R.walkerEvery[0], R.walkerEvery[1]);
      const p = this.player;
      const far = this.spawns.filter(([x, y]) => Math.hypot(x - p.x, y - p.y) > 9);
      const pool = far.length ? far : this.spawns;
      const n = Math.random() < R.pairChance ? 2 : 1;
      const day = S.save.day;
      const mix = W().walkerWeights("river", { day }); // WORLD.RIVER.walkerMix, by the day
      let seen = false;
      for (let i = 0; i < n; i++) {
        const [x, y] = pool[Math.floor(Math.random() * pool.length)];
        const type = W().pickWalkerType(mix);
        const z = this.makeWalker(type, x + rand(-0.3, 0.3), y + rand(-0.3, 0.3), W().walkerHpMult("river", day));
        z.awake = true;
        this.walkers.push(z);
        if (Math.abs(this.sideOf(z.x, z.y)) < 0.6) seen = true;
      }
      // no count: you see them, you do not count them (owner, 2026-10-15)
      this.toast(seen ? "Something is coming out of the trees!" : "Branches snap behind you. Something is coming.", 3);
      this.updateHud();
    },

    /* ---------- Mode hooks (called by the core while mode is "river") ---------- */
    riverUpdate(dt) {
      this.updateFishing(dt);
      this.updateRiverWalkers(dt);
      // the line's state on the HUD's phase box
      const f = this.fishing;
      const S = State();
      const left = S.fishLeft();
      const text = f.state === "bite" ? (f.propped ? "FISH ON! THE BELL!" : "BITE! CLICK!") : f.state === "wait" ? (f.propped ? "POLE PROPPED · LINE IN" : "LINE IN · WAIT") : !S.hasRod() ? "NO POLE" : left ? "FISH: " + left + " TO CATCH" : "FISHED OUT";
      const h = this.hud.phase;
      if (h.textContent !== text) h.textContent = text;
      h.classList.toggle("alarm", f.state === "bite");
    },
    riverFacing(cand) {
      if (this.van) cand.push({ kind: "van", obj: this.van, x: this.van.x + 1, y: this.van.y + 0.5 });
      this.riverSpots.forEach((sp) => cand.push({ kind: "lot", obj: sp, x: sp.x, y: sp.y }));
      const pr = this.fishing && this.fishing.propped;
      if (pr) cand.push({ kind: "rod", obj: pr, x: pr.x, y: pr.y });
    },
    riverInteract(f) {
      if (f.kind === "lot") {
        this.readSpot = this.readSpot && this.readSpot.name === f.obj.name ? null : f.obj; // E again puts it away
        Audio().play("click");
      } else if (f.kind === "rod") this.takeProppedRod();
      else if (f.kind === "van") {
        // the pole comes along: a propped one is picked up on the way
        if (this.fishing.state !== "idle") this.reelIn(null);
        if (this.hooks.onExit) this.hooks.onExit();
      }
    },
    riverHint(f) {
      if (f.kind === "lot") return this.readSpot === f.obj ? "Press E to stop reading" : f.obj.name === "sign" ? "Press E to read the sign" : "Press E to read the note";
      if (f.kind === "rod") return this.fishing.state === "bite" ? "Press E: a fish is on!" : "Press E to pick up the pole";
      if (f.kind === "van") return "Press E to leave in the van";
      return "";
    },
    /** The sign or the note, read up close (the core's read panel). */
    riverSpotPanel(spot) {
      const t = ZSR.riverText(spot.name);
      return { key: "river:" + spot.name + ":" + State().settings.level, kind: "sign", id: "river-" + spot.name, title: t.title, status: spot.name === "note" ? "Nailed to the dock post" : "", text: t.text };
    },
    riverGoal() {
      const S = State();
      const caught = (S.trip && S.trip.fish) || 0;
      return "Fish caught: " + caught + (S.hasRod() ? "" : " · you need a fishing pole") + " · E at the van leaves";
    },
    /** A shot carries over the water: the next walker comes sooner. */
    riverNoise() {
      this.riverSpawnT = Math.min(this.riverSpawnT, rand(6, 14));
    },
    riverLeave() {
      this.fishing = null;
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
