/* The road: a top-down drive from one map location to another. Walkers come
   from ahead and from both shoulders; the player aims and shoots. The trip's
   van health, scrap, and walker count live in ZSR.State.trip.
   All tuning lives in DIFF and ZOMBIE_TYPES. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const Draw = () => ZSR.Draw;
  const State = () => ZSR.State;
  const Upgrades = () => ZSR.Upgrades;
  const Audio = () => ZSR.Audio;

  const DIFF = {
    baseInterval: 1.5,
    intervalStep: 0.07,
    minInterval: 0.38,
    hpStep: 0.1,
    speedStep: 0.025,
    maxSpeedMult: 1.7,
    runnerBase: 0.12,
    runnerStep: 0.05,
    bruteBase: 0.05,
    bruteStep: 0.04,
    roadScroll: 240,
    milesPerSecond: 0.11,
    sideSpawnChance: 0.45,
    crateScrap: 15,
    fogChanceAfterDay: 5,
  };
  const ZOMBIE_TYPES = {
    walker: { hp: 30, speed: 55, r: 18, dmg: 8, scrap: 1 },
    runner: { hp: 18, speed: 125, r: 15, dmg: 6, scrap: 2 },
    brute: { hp: 90, speed: 40, r: 26, dmg: 18, scrap: 4 },
  };
  const HIT_WORDS = ["BLAM!", "KRAK!", "THUD!"];
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const normAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  const Game = {
    canvas: null,
    ctx: null,
    running: false,
    paused: false,
    hooks: {},

    init(canvas, hooks) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.hooks = hooks || {};
      this.keys = {};
      this.pointer = { x: 0, y: 0, down: false, seen: false };
      const $ = (id) => document.getElementById(id);
      this.hud = { root: $("hud"), hpFill: $("hp-fill"), hpText: $("hp-text"), scrap: $("scrap-text"), miles: $("miles-text"), kills: $("kills-text"), road: $("road-text"), segFill: $("segment-fill"), banner: $("banner") };
      this.bindInput();
      root.addEventListener("resize", () => this.resize());
      this.resize();
      document.addEventListener("visibilitychange", () => {
        if (document.hidden && this.running && !this.paused && this.hooks.onPause) this.hooks.onPause();
      });
    },

    resize() {
      const dpr = Math.min(2, root.devicePixelRatio || 1);
      this.dpr = dpr;
      this.W = root.innerWidth;
      this.H = root.innerHeight;
      this.canvas.width = Math.round(this.W * dpr);
      this.canvas.height = Math.round(this.H * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.roadW = clamp(this.W * 0.62, 240, 520);
      this.roadX = (this.W - this.roadW) / 2;
      if (this.van) {
        this.van.y = this.H * 0.72;
        this.van.x = clamp(this.van.x, this.roadX - 10, this.roadX + this.roadW + 10);
      }
    },

    bindInput() {
      const c = this.canvas;
      const setAim = (e) => {
        const r = c.getBoundingClientRect();
        this.pointer.x = e.clientX - r.left;
        this.pointer.y = e.clientY - r.top;
        this.pointer.seen = true;
      };
      c.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 && e.pointerType === "mouse") return;
        Audio().unlock();
        setAim(e);
        this.pointer.down = true;
        try {
          c.setPointerCapture(e.pointerId);
        } catch (err) {
          /* ignore */
        }
        e.preventDefault();
      });
      c.addEventListener("pointermove", (e) => setAim(e));
      const up = () => (this.pointer.down = false);
      c.addEventListener("pointerup", up);
      c.addEventListener("pointercancel", up);
      c.addEventListener("contextmenu", (e) => e.preventDefault());
      const CODE = { KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", KeyP: "p", Space: " ", ArrowUp: "arrowup", ArrowDown: "arrowdown", ArrowLeft: "arrowleft", ArrowRight: "arrowright", Escape: "escape" };
      const keyOf = (e) => CODE[e.code] || e.key.toLowerCase();
      root.addEventListener("blur", () => {
        this.keys = {};
        this.pointer.down = false;
        if (this.running && !this.paused && this.hooks.onPause) this.hooks.onPause();
      });
      root.addEventListener("keydown", (e) => {
        if (!this.running) return;
        if (e.repeat) return;
        const k = keyOf(e);
        if (k === "arrowleft" || k === "a") this.keys.left = true;
        if (k === "arrowright" || k === "d") this.keys.right = true;
        if (k === " " || k === "arrowup" || k === "w") {
          this.keys.fire = true;
          e.preventDefault();
        }
        if ((k === "p" || k === "escape") && this.hooks.onPauseKey) this.hooks.onPauseKey();
      });
      root.addEventListener("keyup", (e) => {
        const k = keyOf(e);
        if (k === "arrowleft" || k === "a") this.keys.left = false;
        if (k === "arrowright" || k === "d") this.keys.right = false;
        if (k === " " || k === "arrowup" || k === "w") this.keys.fire = false;
      });
      const bindTouch = (id, key) => {
        const el = document.getElementById(id);
        if (!el) return;
        const on = (e) => {
          this.keys[key] = true;
          e.preventDefault();
        };
        const off = () => (this.keys[key] = false);
        el.addEventListener("pointerdown", on);
        el.addEventListener("pointerup", off);
        el.addEventListener("pointercancel", off);
        el.addEventListener("pointerleave", off);
      };
      bindTouch("touch-left", "left");
      bindTouch("touch-right", "right");
    },

    /** Drive to `trip.to` for `trip.seconds`; danger and day set the walkers. */
    startTrip(opts) {
      const S = State();
      const t = S.trip;
      const fx = S.effects();
      const n = opts.danger * 1.3 + (S.save.day - 1) * 0.5;
      this.stats = Upgrades().stats(S.save.upgrades);
      this.opts = opts;
      const day = S.save.day;
      this.mods = { fog: !fx.headlights && day >= DIFF.fogChanceAfterDay && Math.random() < 0.25, night: !fx.headlights && day >= 4 && day % 3 === 0, crates: fx.crates };
      const interval = Math.max(DIFF.minInterval, DIFF.baseInterval - DIFF.intervalStep * n) * (this.mods.night ? 0.85 : 1);
      this.diff = { interval, hpMult: 1 + DIFF.hpStep * n, speedMult: Math.min(DIFF.maxSpeedMult, 1 + DIFF.speedStep * n), runnerW: DIFF.runnerBase + DIFF.runnerStep * n, bruteW: DIFF.bruteBase + DIFF.bruteStep * n };
      const duration = opts.seconds;
      this.seg = { duration, elapsed: 0, ending: false, endAt: null, crateTimes: [] };
      for (let i = 0; i < (this.mods.crates || 0); i++) this.seg.crateTimes.push(rand(5, Math.max(6, duration - 8)));
      this.seg.crateTimes.sort((a, b) => a - b);
      this.van = { x: this.roadX + this.roadW / 2, y: this.H * 0.72, w: 66, h: 118, aim: -Math.PI / 2, hurt: 0, cooldown: 0, vx: 0, flash: 0 };
      this.zombies = [];
      this.bullets = [];
      this.particles = [];
      this.bursts = [];
      this.crates = [];
      this.props = [];
      this.fallen = [];
      this.scroll = 0;
      this.spawnTimer = 2.2;
      this.shake = 0;
      this.time = 0;
      this.gameOverAt = null;
      this.pointer.down = false;
      this.keys = {};
      t.miles = t.miles || 0;
      for (let i = 0; i < 10; i++) this.spawnProp(rand(-this.H, this.H));
      this.hud.root.classList.remove("hidden");
      this.hud.road.textContent = "TO: " + opts.name.toUpperCase();
      this.banner(opts.name.toUpperCase() + (this.mods.fog ? "  FOG" : "") + (this.mods.night ? "  NIGHT" : "") + (t.hungry ? "  HUNGRY" : ""), 1800);
      this.running = true;
      this.paused = false;
      this.last = 0;
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame((ts) => this.frame(ts));
    },

    pause() {
      if (!this.running) return;
      this.paused = true;
      this.pointer.down = false;
      this.keys = {};
    },
    resume() {
      if (!this.running) return;
      this.paused = false;
      this.last = 0;
    },
    stop() {
      this.running = false;
      this.paused = false;
      cancelAnimationFrame(this.raf);
      this.hud.root.classList.add("hidden");
    },

    banner(text, ms) {
      const b = this.hud.banner;
      b.textContent = text;
      b.classList.remove("hidden");
      b.style.animation = "none";
      void b.offsetWidth;
      b.style.animation = "";
      clearTimeout(this.bannerT);
      this.bannerT = setTimeout(() => b.classList.add("hidden"), ms || 1500);
    },

    pickType() {
      const w = { walker: 1, runner: this.diff.runnerW, brute: this.diff.bruteW };
      let r = Math.random() * (w.walker + w.runner + w.brute);
      for (const k of Object.keys(w)) {
        if (r < w[k]) return k;
        r -= w[k];
      }
      return "walker";
    },
    spawnZombie() {
      const type = this.pickType();
      const base = ZOMBIE_TYPES[type];
      const side = Math.random() < DIFF.sideSpawnChance ? (Math.random() < 0.5 ? "left" : "right") : "top";
      let x;
      let y;
      if (side === "top") {
        x = rand(this.roadX - 30, this.roadX + this.roadW + 30);
        y = -40;
      } else {
        x = side === "left" ? -40 : this.W + 40;
        y = rand(this.H * 0.05, this.H * 0.6);
      }
      const hp = Math.round(base.hp * this.diff.hpMult);
      this.zombies.push({ type, x, y, r: base.r, hp, maxHp: hp, speed: base.speed * this.diff.speedMult * rand(0.85, 1.15), dmg: base.dmg, scrap: base.scrap, angle: Math.PI / 2, phase: Math.random() * 6.28, hit: 0, cool: 0, kx: 0, ky: 0 });
    },
    spawnProp(y) {
      const left = Math.random() < 0.5;
      const margin = 30;
      const x = left ? rand(margin, Math.max(margin + 1, this.roadX - 50)) : rand(Math.min(this.W - margin - 1, this.roadX + this.roadW + 50), this.W - margin);
      const roll = Math.random();
      const seed = Math.floor(Math.random() * 1e6);
      let p;
      if (roll < 0.3) p = { kind: "tree", size: rand(22, 34), seed };
      else if (roll < 0.42) p = { kind: "barrel", color: ["#7a4a2a", "#5f6b3c", "#4d4f55"][Math.floor(Math.random() * 3)] };
      else if (roll < 0.52) p = { kind: "tire" };
      else if (roll < 0.64) p = { kind: "rubble", seed };
      else if (roll < 0.74) p = { kind: "barrier", rot: rand(-0.3, 0.3) };
      else if (roll < 0.84) p = { kind: "sign", text: ["KEEP OUT", "NO ENTRY", "MILE 9", "DETOUR", "QUIET"][Math.floor(Math.random() * 5)], color: ["#d9a21b", "#b3261e", "#e6dfcc"][Math.floor(Math.random() * 3)] };
      else p = { kind: "wreck", rot: rand(-0.6, 0.6), color: ["#5a4538", "#3f4a55", "#6b6b6b", "#7a3a30"][Math.floor(Math.random() * 4)] };
      p.x = x;
      p.y = y == null ? -80 : y;
      this.props.push(p);
      if (Math.random() < 0.35) this.props.push({ kind: "crack", seed: seed + 1, x: rand(this.roadX + 30, this.roadX + this.roadW - 30), y: p.y - 40 });
    },
    spawnCrate() {
      this.crates.push({ x: rand(this.roadX + 40, this.roadX + this.roadW - 40), y: -40, t: 0 });
    },

    burst(text, x, y, color, bg, size) {
      this.bursts.push({ text, x, y, t: 0, life: 0.8, color, bg, size: size || 1, rot: rand(-0.25, 0.25) });
      if (this.bursts.length > 12) this.bursts.shift();
    },
    dust(x, y, r) {
      for (let i = 0; i < 7; i++) {
        const a = Math.random() * 6.28;
        const s = rand(20, 90);
        this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 10, life: 0.5, maxLife: 0.5, size: r * rand(0.25, 0.45), color: i % 2 === 0 ? "#6b675c" : "#4a473f", grow: true });
      }
    },
    sparks(x, y, color) {
      for (let i = 0; i < 4; i++) {
        const a = Math.random() * 6.28;
        const s = rand(80, 200);
        this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.25, maxLife: 0.25, size: 3.5, color: color || "#ffe9a6" });
      }
    },

    frame(ts) {
      if (!this.running) return;
      this.raf = requestAnimationFrame((t) => this.frame(t));
      if (!this.last) this.last = ts;
      const dt = Math.min(0.05, (ts - this.last) / 1000);
      this.last = ts;
      if (!this.paused) this.update(dt);
      this.draw();
    },

    update(dt) {
      const t = State().trip;
      const stats = this.stats;
      const van = this.van;
      const seg = this.seg;
      this.time += dt;
      if (this.gameOverAt != null) {
        this.gameOverAt -= dt;
        this.shake *= 0.9;
        this.updateParticles(dt);
        if (this.gameOverAt <= 0) {
          this.stop();
          if (this.hooks.onDeath) this.hooks.onDeath();
        }
        return;
      }
      seg.elapsed += dt;
      if (!seg.ending && seg.elapsed >= seg.duration) {
        seg.ending = true;
        seg.endAt = seg.elapsed + 2.5;
        this.banner(this.opts.to === "base" ? "HOME" : "YOU'RE HERE", 2500);
      }
      if (seg.ending && seg.elapsed >= seg.endAt) {
        this.stop();
        if (this.hooks.onArrive) this.hooks.onArrive(this.opts.to);
        return;
      }
      while (seg.crateTimes.length && seg.elapsed >= seg.crateTimes[0]) {
        seg.crateTimes.shift();
        this.spawnCrate();
      }
      const scrollSpeed = DIFF.roadScroll * stats.speed;
      this.scroll += scrollSpeed * dt;
      t.miles += DIFF.milesPerSecond * stats.speed * dt;

      let dir = 0;
      if (this.keys.left) dir -= 1;
      if (this.keys.right) dir += 1;
      van.vx = dir * stats.laneSpeed;
      van.x = clamp(van.x + van.vx * dt, this.roadX - 10, this.roadX + this.roadW + 10);
      van.hurt = Math.max(0, van.hurt - dt * 2);
      van.cooldown -= dt;
      if (this.pointer.seen) van.aim = Math.atan2(this.pointer.y - (van.y + 11), this.pointer.x - van.x);
      let aim = van.aim;
      if (State().settings.aimAssist) aim = this.assist(aim);
      if ((this.pointer.down || this.keys.fire) && van.cooldown <= 0) {
        van.cooldown = stats.fireInterval;
        const n = stats.bullets;
        for (let i = 0; i < n; i++) {
          const a = aim + (i - (n - 1) / 2) * 0.14;
          this.bullets.push({ x: van.x + Math.cos(a) * 24, y: van.y + 11 + Math.sin(a) * 24, vx: Math.cos(a) * stats.bulletSpeed, vy: Math.sin(a) * stats.bulletSpeed, dmg: stats.damage });
        }
        van.flash = 0.07;
        Audio().play("shoot");
      }
      van.flash = Math.max(0, van.flash - dt);
      van.drawAim = aim;

      if (!seg.ending) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnZombie();
          this.spawnTimer = this.diff.interval * rand(0.7, 1.3);
        }
      }
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < -40 || b.x > this.W + 40 || b.y < -40 || b.y > this.H + 40) {
          this.bullets.splice(i, 1);
          continue;
        }
        for (let j = 0; j < this.zombies.length; j++) {
          const z = this.zombies[j];
          const dx = z.x - b.x;
          const dy = z.y - b.y;
          if (dx * dx + dy * dy < (z.r + 6) * (z.r + 6)) {
            z.hp -= b.dmg;
            z.hit = 0.12;
            z.kx += b.vx * 0.08;
            z.ky += b.vy * 0.08;
            this.sparks(b.x, b.y);
            Audio().play("hit");
            if (z.hp <= 0) this.killZombie(j);
            else if (Math.random() < 0.25) this.burst(HIT_WORDS[Math.floor(Math.random() * HIT_WORDS.length)], z.x, z.y - z.r, "#e8392f", "#ffcf40", 0.8);
            this.bullets.splice(i, 1);
            break;
          }
        }
      }
      const drift = scrollSpeed * 0.35;
      for (let i = this.zombies.length - 1; i >= 0; i--) {
        const z = this.zombies[i];
        const dx = van.x - z.x;
        const dy = van.y - z.y;
        const dist = Math.hypot(dx, dy) || 1;
        z.angle = Math.atan2(dy, dx);
        let vx = (dx / dist) * z.speed + z.kx;
        let vy = (dy / dist) * z.speed + drift + z.ky;
        for (let j = 0; j < this.zombies.length; j++) {
          if (i === j) continue;
          const o = this.zombies[j];
          const ox = z.x - o.x;
          const oy = z.y - o.y;
          const d2 = ox * ox + oy * oy;
          const min = z.r + o.r;
          if (d2 < min * min && d2 > 0.01) {
            const d = Math.sqrt(d2);
            vx += (ox / d) * 40;
            vy += (oy / d) * 40;
          }
        }
        z.x += vx * dt;
        z.y += vy * dt;
        z.kx *= 0.85;
        z.ky *= 0.85;
        z.hit = Math.max(0, z.hit - dt);
        z.cool = Math.max(0, z.cool - dt);
        const nx = (z.x - van.x) / (van.w / 2 + z.r * 0.8);
        const ny = (z.y - van.y) / (van.h / 2 + z.r * 0.8);
        if (nx * nx + ny * ny < 1 && z.cool <= 0) {
          z.cool = 1.0;
          z.hp -= stats.ram;
          const push = stats.ramKnock;
          z.kx = ((z.x - van.x) / Math.max(1, Math.abs(z.x - van.x))) * push;
          z.ky = -push * 0.8;
          if (z.hp <= 0) {
            this.killZombie(i);
            this.burst("THUD!", van.x, van.y - 60, "#e6dfcc", "#4b5057", 1.1);
            continue;
          }
          this.hurtVan(z.dmg, z.x, z.y);
        }
        if (z.y > this.H + 80 || z.x < -160 || z.x > this.W + 160) this.zombies.splice(i, 1);
      }
      for (let i = this.crates.length - 1; i >= 0; i--) {
        const c = this.crates[i];
        c.y += scrollSpeed * dt;
        c.t += dt;
        if (Math.abs(c.x - van.x) < van.w / 2 + 14 && Math.abs(c.y - van.y) < van.h / 2 + 14) {
          t.scrap += DIFF.crateScrap;
          this.burst("+" + DIFF.crateScrap + " SCRAP", c.x, c.y - 20, "#0f1012", "#d9a21b", 0.9);
          this.sparks(c.x, c.y, "#e6dfcc");
          Audio().play("pickup");
          this.crates.splice(i, 1);
        } else if (c.y > this.H + 60) this.crates.splice(i, 1);
      }
      for (let i = this.props.length - 1; i >= 0; i--) {
        this.props[i].y += scrollSpeed * dt;
        if (this.props[i].y > this.H + 100) this.props.splice(i, 1);
      }
      for (let i = this.fallen.length - 1; i >= 0; i--) {
        const f = this.fallen[i];
        f.y += scrollSpeed * dt;
        f.life -= dt;
        if (f.life <= 0 || f.y > this.H + 100) this.fallen.splice(i, 1);
      }
      if (this.props.length < 14 && Math.random() < dt * 1.6) this.spawnProp();
      this.updateParticles(dt);
      this.shake *= Math.pow(0.02, dt);
      this.updateHud();
    },

    assist(aim) {
      const van = this.van;
      let best = null;
      let bestDiff = 0.42;
      for (const z of this.zombies) {
        const dx = z.x - van.x;
        const dy = z.y - (van.y + 11);
        if (dx * dx + dy * dy > 650 * 650) continue;
        const a = Math.atan2(dy, dx);
        const d = Math.abs(normAngle(a - aim));
        if (d < bestDiff) {
          bestDiff = d;
          best = a;
        }
      }
      return best == null ? aim : best;
    },
    killZombie(i) {
      const z = this.zombies[i];
      const t = State().trip;
      this.zombies.splice(i, 1);
      this.dust(z.x, z.y, z.r);
      this.fallen.push({ kind: "fallen", x: z.x, y: z.y, size: z.r, rot: z.angle + rand(-0.4, 0.4), life: 3 });
      if (this.fallen.length > 24) this.fallen.shift();
      t.walkers += 1;
      t.scrap += z.scrap;
      Audio().play("poof");
    },
    hurtVan(dmg, x, y) {
      const S = State();
      const t = S.trip;
      t.vanHp -= Math.round(dmg * S.effects().vanDamage);
      this.van.hurt = 1;
      if (S.settings.shake) this.shake = 10;
      this.burst("SLAM!", this.van.x, this.van.y - 70, "#e6dfcc", "#b3261e", 1.1);
      this.sparks(x, y, "#9ea3aa");
      Audio().play("crunch");
      if (t.vanHp <= 0) {
        t.vanHp = 0;
        this.gameOverAt = 1.4;
        this.shake = 18;
        for (let k = 0; k < 24; k++) {
          const a = Math.random() * 6.28;
          const s = rand(60, 260);
          this.particles.push({ x: this.van.x, y: this.van.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1.2, maxLife: 1.2, size: rand(6, 16), color: k % 2 ? "#4a473f" : "#d9a21b", grow: true });
        }
        this.burst("WRECKED!", this.van.x, this.van.y - 40, "#b3261e", "#d9a21b", 1.8);
        Audio().play("gameover");
      }
    },
    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
      for (let i = this.bursts.length - 1; i >= 0; i--) {
        this.bursts[i].t += dt;
        if (this.bursts[i].t >= this.bursts[i].life) this.bursts.splice(i, 1);
      }
    },
    updateHud() {
      const S = State();
      const t = S.trip;
      const h = this.hud;
      const pct = clamp((t.vanHp / t.vanMaxHp) * 100, 0, 100);
      h.hpFill.style.width = pct + "%";
      h.hpFill.style.background = pct > 50 ? "#7a9a3c" : pct > 25 ? "#d9a21b" : "#b3261e";
      h.hpText.textContent = Math.max(0, Math.round(t.vanHp));
      h.scrap.textContent = S.save.scrap + t.scrap;
      h.miles.textContent = t.miles.toFixed(1);
      h.kills.textContent = t.walkers;
      h.segFill.style.width = clamp((this.seg.elapsed / this.seg.duration) * 100, 0, 100) + "%";
    },

    draw() {
      const ctx = this.ctx;
      const D = Draw();
      const van = this.van;
      if (!van) return;
      ctx.save();
      if (this.shake > 0.5) ctx.translate(rand(-this.shake, this.shake), rand(-this.shake, this.shake));
      D.road(ctx, this.W, this.H, this.roadX, this.roadW, this.scroll, this.mods.night ? { grass: "#3f3e2c", asphalt: "#2b2c30" } : this.mods.fog ? { grass: "#67654a" } : null);
      for (const p of this.props) D.prop(ctx, p);
      for (const f of this.fallen) D.prop(ctx, f);
      for (const c of this.crates) D.prop(ctx, { kind: "crate", x: c.x, y: c.y, t: c.t });
      const sorted = this.zombies.slice().sort((a, b) => a.y - b.y);
      for (const z of sorted) D.zombie(ctx, z, this.time);
      for (const b of this.bullets) D.bullet(ctx, b);
      if (this.gameOverAt == null || this.gameOverAt > 0.9) D.van(ctx, van.x, van.y, { upgrades: State().save.upgrades, aim: van.drawAim == null ? van.aim : van.drawAim, t: this.time, hurt: van.hurt, flash: van.flash });
      for (const p of this.particles) D.particle(ctx, p);
      for (const b of this.bursts) D.burst(ctx, b);
      if (this.mods.fog) D.fog(ctx, this.W, this.H, this.dpr, van.x, van.y, 300);
      if (this.mods.night) D.night(ctx, this.W, this.H, this.dpr, van.x, van.y + 11, van.drawAim == null ? van.aim : van.drawAim);
      ctx.restore();
      D.vignette(ctx, this.W, this.H);
    },

    showcase(canvas, upgrades, t) {
      const ctx = canvas.getContext("2d");
      const W = canvas.width;
      const H = canvas.height;
      const D = Draw();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const roadW = Math.min(W * 0.6, 220);
      D.road(ctx, W, H, (W - roadW) / 2, roadW, (t || 0) * 160, null);
      D.prop(ctx, { kind: "wreck", x: W * 0.12, y: H * 0.85, rot: 0.5, color: "#3f4a55" });
      D.prop(ctx, { kind: "tree", x: W * 0.88, y: H * 0.15, size: 26, seed: 5 });
      [{ type: "walker", x: W * 0.16, y: H * 0.3 + Math.sin((t || 0) * 2) * 6, r: 16, hp: 1, maxHp: 1, angle: 0.3, phase: 0, hit: 0 }, { type: "runner", x: W * 0.86, y: H * 0.58, r: 13, hp: 1, maxHp: 1, angle: Math.PI - 0.4, phase: 2, hit: 0 }].forEach((z) => D.zombie(ctx, z, t || 0));
      D.van(ctx, W / 2, H * 0.55, { upgrades, aim: -Math.PI / 2 + Math.sin((t || 0) * 1.3) * 0.5, t: t || 0, scale: Math.min(1, H / 150) });
      D.vignette(ctx, W, H);
    },

    DIFF,
    ZOMBIE_TYPES,
  };

  ZSR.Game = Game;
})(typeof globalThis !== "undefined" ? globalThis : this);
