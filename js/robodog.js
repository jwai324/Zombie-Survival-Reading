/* Rivet, Tomas's robot dog (the Captain Leo universe, docs/UNIVERSES.md), mixed into ZSR.Interior. Once Tomas's
   robot quest is handed in (State.roboHome, js/xoverstate.js), it follows you in the yard and inside buildings
   (it rides along in the van; it does nothing on the road or at the river). A weak helper (WORLD.ROBO): every
   zapEvery seconds it zaps the nearest awake walker within zapRange in a clear line, which hurts a little and slows
   it; a walker that reaches it bites it, and too many bites shut it down (State.roboBite) until Tomas fixes it at
   home for scrap (State.roboRepair: on arriving home and when a wave is cleared). Walkers never go for it on
   purpose: they chase you, and bite it only when it is in their reach and you are not.
   Hooks: js/yard.js (enterYard, dressYard, yardUpdate, the wave's end) and js/building.js (on entry, buildingUpdate)
   call roboEnter, roboDress, roboUpdate and roboHomeWords. Art: "roboDog" and "zapSpark" (js/crossart.js). It walks
   by the following dog's rules (dogSpot, dogBlocked, dogClear in js/building.js), with the player's solid tiles.
   In 3D (js/beast3d.js loaded) it is a live figure, Beast3D's "robodog", drawn with the walkers (prop.fig, js/interior.js
   figStep): it trots and gallops by its speed, sits turned to you, turns to the walker it zaps, flashes when bitten and
   powers down ("off"); its spark stays a flat sprite. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  if (!ZSR.Interior) return;
  const W = () => ZSR.WORLD;
  const State = () => ZSR.State;
  const D3 = () => ZSR.Draw3;
  const Audio = () => ZSR.Audio || { play() {} };
  const MOVE = {
    gap: 1.3, // it settles this far from you
    start: 1.8, // and gets going again once you are this far
    r: 0.2, // its body, against walls and shut doors
    walk: 3.3,
    run: 4.8, // past runFrom behind you
    runFrom: 3,
    far: 7, // farther than this, or `stuck` seconds out of a straight line to you, and it turns up just behind you
    stuck: 1.2,
    stepT: 0.16, // seconds a walk frame shows
    idleT: 0.8,
    zapPose: 0.3, // seconds the zap pose shows
    spark: 0.25, // seconds the spark stays on the walker it hit
  };
  const BITE_PAD = 0.2; // tiles past a walker's reach that still reach Rivet (its body)
  const RUN = [1.2, 1.8]; // in 3D, its gallop by its speed: none at 1.2 tiles a second, all of it 1.8 faster
  const HIT_FLASH = 0.15; // seconds a bite's flash shows on it (3D)
  const scale = (k) => (ZSR.CROSS_ART && ZSR.CROSS_ART.scale && ZSR.CROSS_ART.scale[k]) || { roboDog: 0.34, zapSpark: 0.32 }[k];
  const ROBO = () => Object.assign({ name: "Rivet", hp: 60, zapEvery: 1.8, zapRange: 4.5, zapDamage: 6, slow: 0.5, slowSeconds: 1.6, repairScrap: 20 }, W().ROBO || {});
  const on = (mode) => mode === "yard" || mode === "building";

  Object.assign(ZSR.Interior, {
    /** On entering the yard or a building: Rivet beside you when it is home (working, or shut down at home). */
    roboEnter() {
      this.robo = null;
      this.roboSync();
    },
    /** dressYard wiped the props: put Rivet (and its spark) back. */
    roboDress() {
      const r = this.robo;
      if (!r) return;
      this.addProp(r.prop);
      this.addProp(r.spark);
    },
    /** Rivet is here exactly while it is home in this universe (Settings may switch the universe mid-game). Out on a
        trip only while it works: shut down, it waits at home. */
    roboSync() {
      const S = State();
      const want = on(this.mode) && S && S.roboHome && S.roboHome() && (this.mode === "yard" || S.roboOn());
      if (!want) {
        if (this.robo) {
          this.robo.prop.hidden = true;
          this.robo.spark.hidden = true;
          this.robo = null;
        }
        return null;
      }
      if (this.robo) return this.robo;
      const p = this.player;
      if (!p) return null;
      const [x, y] = this.dogSpot ? this.dogSpot() : [p.x, p.y];
      const r = { x, y, pose: null, f: 0, ft: 0, left: false, moving: false, stuck: 0, zapT: ROBO().zapEvery, zapPose: 0, sparkT: 0, zapAt: null, prop: null, spark: null, fig: null };
      r.fig = this.liveFigure ? this.liveFigure("beast", "robodog", 11, Math.atan2(p.y - y, p.x - x)) : null;
      r.prop = this.addProp(r.fig ? { x, y, fig: r.fig, lift: 0, robo: true } : { x, y, img: null, scale: scale("roboDog"), lift: 0, robo: true });
      r.spark = this.addProp({ x, y, img: D3() ? D3().sprite("zapSpark", {}) : null, scale: scale("zapSpark"), lift: 0.45, hidden: true });
      this.robo = r;
      this.roboLook(S.roboOn() ? "sit" : "off", 0, false);
      if (r.fig) r.fig.pose = r.fig.wantPose = r.pose; // (as it was left: no easing into it)
      return r;
    },
    /** Its picture (f exactly 0 or 1; left only when true: one cached canvas per opts set). A live 3D figure keeps the
        names only (roboAnim draws the pose). */
    roboLook(pose, f, left) {
      const r = this.robo;
      const ff = f ? 1 : 0;
      if (r.fig) {
        r.pose = pose;
        r.f = ff;
        r.left = !!left;
        return;
      }
      if (r.prop.img && r.pose === pose && r.f === ff && r.left === !!left) return;
      r.pose = pose;
      r.f = ff;
      r.left = !!left;
      if (D3()) r.prop.img = D3().sprite("roboDog", left ? { pose, f: ff, left: true } : { pose, f: ff });
    },
    /** Each frame in the yard or a building: follow, zap, take bites. */
    roboUpdate(dt) {
      const r = this.roboSync();
      if (!r || !this.player) return;
      const S = State();
      r.ft += dt;
      r.sparkT = Math.max(0, r.sparkT - dt);
      r.spark.hidden = r.sparkT <= 0;
      const p = this.player;
      const x0 = r.x;
      const y0 = r.y;
      if (!S.roboOn()) {
        // shut down: it lies where it fell (at home, until Tomas fixes it)
        this.roboLook("off", 0, r.left);
        r.prop.x = r.x;
        r.prop.y = r.y;
        if (r.fig) this.roboAnim(r, dt, x0, y0);
        return;
      }
      const dist = Math.hypot(p.x - r.x, p.y - r.y);
      const clear = this.dogClear ? this.dogClear(r.x, r.y, p.x, p.y) : true;
      if (!r.moving && dist > MOVE.start) r.moving = true;
      else if (r.moving && dist <= MOVE.gap) r.moving = false;
      let want = 0;
      if (r.moving && clear) {
        want = Math.min((dist > MOVE.runFrom ? MOVE.run : MOVE.walk) * dt, dist - MOVE.gap);
        if (want > 0) this.moveCircle(r, ((p.x - r.x) / dist) * want, ((p.y - r.y) / dist) * want, MOVE.r, true);
      }
      const moved = Math.hypot(r.x - x0, r.y - y0);
      if (r.moving && (!clear || (want > 1e-4 && moved < want * 0.3))) r.stuck += dt;
      else r.stuck = 0;
      let jumped = false;
      if (dist > MOVE.far || r.stuck >= MOVE.stuck) {
        if (this.dogSpot) [r.x, r.y] = this.dogSpot();
        r.stuck = 0;
        r.moving = false;
        jumped = true;
      }
      this.roboZap(r, dt);
      this.roboBites(r);
      // the picture
      let left = r.left;
      if (!jumped && moved > 1e-4) {
        const across = ((r.x - x0) * -Math.sin(p.a) + (r.y - y0) * Math.cos(p.a)) / Math.max(dt, 1e-3);
        if (across < -0.4) left = true;
        else if (across > 0.4) left = false;
      }
      r.zapPose = Math.max(0, r.zapPose - dt);
      const pose = r.zapPose > 0 ? "zap" : !jumped && moved / Math.max(dt, 1e-3) > 0.5 ? "walk" : r.moving ? "stand" : "sit";
      let f = r.f;
      if (pose !== r.pose) {
        r.ft = 0;
        f = 0;
      } else if (r.ft >= (pose === "walk" ? MOVE.stepT : MOVE.idleT)) {
        r.ft = 0;
        f = f ? 0 : 1;
      }
      this.roboLook(pose, f, left);
      r.prop.x = r.x;
      r.prop.y = r.y;
      if (r.fig) this.roboAnim(r, dt, x0, y0);
    },
    /** How Rivet looks this frame, in 3D (r.fig): its pose (roboLook's name), a trot or a gallop by its speed (RUN),
        turned to the walker it zaps, else at rest to you (its head on you while you are near); shut down, still. */
    roboAnim(r, dt, x0, y0) {
      const f = r.fig;
      const p = this.player;
      const speed = dt > 0 ? Math.hypot(r.x - x0, r.y - y0) / dt : 0;
      const pose = r.pose || "sit";
      const at = pose === "zap" && r.zapAt ? r.zapAt : pose !== "off" && pose !== "walk" && p ? [p.x, p.y] : null;
      f.want = at ? Math.atan2(at[1] - r.y, at[0] - r.x) : null;
      f.wantPose = pose;
      f.wantRun = pose === "walk" ? Math.max(0, Math.min(1, (speed - RUN[0]) / RUN[1])) : 0;
      f.wantWag = pose === "off" ? 0 : 0.6;
      f.lookX = at ? at[0] : null;
      f.lookY = at ? at[1] : null;
      this.figStep(f, dt, x0, y0, r.x, r.y);
    },
    /** Zap the nearest awake walker within range, in a clear line (never the tutorial's practice walker): a little
        harm (the kill counts as yours), and it slows for a while (stepWalker reads slowT and slowMul). */
    roboZap(r, dt) {
      const R = ROBO();
      r.zapT -= dt;
      if (r.zapT > 0) return;
      let best = null;
      let bestD = R.zapRange;
      (this.walkers || []).forEach((z) => {
        if (z.hp <= 0 || !z.awake || z.practice) return;
        const d = Math.hypot(z.x - r.x, z.y - r.y);
        if (d <= bestD && this.lineClear(r.x, r.y, z.x, z.y)) {
          best = z;
          bestD = d;
        }
      });
      if (!best) {
        r.zapT = 0.25; // look again soon
        return;
      }
      r.zapT = R.zapEvery;
      r.zapPose = MOVE.zapPose;
      r.zapAt = [best.x, best.y]; // (in 3D it turns to it)
      best.slowT = R.slowSeconds;
      best.slowMul = R.slow;
      this.hurtWalker(best, R.zapDamage, r);
      r.sparkT = MOVE.spark;
      r.spark.x = best.x;
      r.spark.y = best.y;
      r.spark.hidden = false;
      Audio().play("zap");
    },
    /** A walker with Rivet in its reach (and you out of it) bites Rivet on its own bite clock. */
    roboBites(r) {
      const S = State();
      const p = this.player;
      (this.walkers || []).forEach((z) => {
        if (z.hp <= 0 || !z.awake || z.practice || z.cool > 0 || !S.roboOn()) return;
        const reach = z.reach != null ? z.reach : 0.9;
        if (Math.hypot(z.x - r.x, z.y - r.y) > reach + BITE_PAD) return;
        if (Math.hypot(z.x - p.x, z.y - p.y) < reach) return; // it is biting you
        z.cool = 1.1;
        z.biteT = 0.35;
        if (r.fig) r.fig.hit = HIT_FLASH; // (in 3D a bite's flash)
        if (S.cheat && S.cheat("noDie")) return; // god mode: nothing gives
        if (S.roboBite(z.dmg || 10)) {
          this.roboLook("off", 0, r.left);
          const n = ROBO().name;
          this.toast(n + " shut down. Tomas can fix it at home for " + ROBO().repairScrap + " scrap.", 4);
          Audio().play("wrong");
        } else Audio().play("hit");
      });
    },
    /** At home (arriving, or a wave cleared): Tomas fixes Rivet if it shut down and the base can pay. The words for
        the toast that goes with it ("" when there is nothing to say). The caller saves (the yard's sync). */
    roboHomeWords() {
      const S = State();
      if (!S || !S.roboRepair) return "";
      const paid = S.roboRepair();
      const n = ROBO().name;
      if (paid > 0 || paid === 0) {
        if (this.robo) this.roboLook("sit", 0, this.robo.left);
        return " Tomas fixed " + n + (paid > 0 ? " for " + paid + " scrap." : ".");
      }
      if (paid === -1) return " " + n + " is shut down: Tomas needs " + ROBO().repairScrap + " scrap to fix it.";
      return "";
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
