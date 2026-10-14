/* The crew in the yard and the cabin, mixed into ZSR.Interior after js/yard.js and js/house.js:
   - Wandering. In the calm each crew member walks between their own spots (CREW[id].posts: a post whose
     room is not built that far is skipped), stays a while in its pose, and moves on. Paths are a BFS on
     the player's rules (the fence line is always solid, a broken window too); a shut cabin door is no
     wall to them: they open it, pass, and shut it behind them. They are props, never solid: you, walkers
     and shots pass them by.
   - Waves (crewWave): they run to the shelter (CREW_RULES.shelter, a HOUSE.rooms key: one tile each, the
     dog shares its leader's) and shut its door once all are in. Some raiders go for the shelter (js/house.js
     yardWalkerGoal); one that stands among them hurtSeconds hurts one of them off-screen (State.crewHurt:
     supplies and trust; once per member per wave; the dog never). They come out when it is cleared.
   - Jobs in the calm (State.crewJobs): the fence job walks to the nearest hole or cracked segment, works
     workSeconds and fixes it, paying from the base's scrap (State.crewRepairPay); the cabin job does the
     same for the cabin's damaged doors and windows. No toast: they tell you when you next talk (a report).
     The lookout job calls the next wave (phase.next, rolled when the calm began: js/yard.js) as a toast
     State.crewLookoutSeconds() before it comes. The heal job patches you up when you talk while hurt.
   - Talking (E, crosshair on them): a speech bubble on the read panel (kind "talk"; the yard keeps
     running): a report of their work, one live tip, one story topic, and what they want ("Press E again":
     the crew card in js/main.js through hooks.onCrewCard; it calls crewCardDone after). Words that run past
     the bubble's edge (a short window, Huge text) are read on with E first ("Press E to read on"). A talk is
     saved as it opens (syncYard, in the calm), so a wave that closes the bubble loses nothing.
   - The dog once it is home: it follows its leader (the dog quest's giver), shelters, barks at a wave.
   Facts: js/story-crew.js, js/story-quests.js. State: js/crewstate.js. Art: js/crewart.js. Design: docs/CREW.md. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const State = () => ZSR.State;
  const Audio = () => ZSR.Audio;
  const D3 = () => ZSR.Draw3;
  const W = () => ZSR.WORLD;
  const rand = (a, b) => a + Math.random() * (b - a);
  const normAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const N8 = N4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]); // a fence corner is only reached across a diagonal

  // the contract's values (docs/CREW.md), for a rule CREW_RULES leaves out
  const RULES = { shelter: "officeCloset", raidShelterShare: 0.5, hurtSeconds: 6, walkSpeed: 1.1, runSpeed: 2.6, dwell: [20, 50], workSeconds: 4, dogBarkRange: 10 };
  const rules = () => Object.assign({}, RULES, W().CREW_RULES);
  const SHELTER_LATE = 20; // seconds: a crew member not in the shelter by then is simply there
  const AIM = 0.45; // half the width (tiles) under the crosshair that counts as looking at a crew member
  const DOG_AIM = 0.35; // ... at the dog
  const AIM_BONUS = 0.6; // a crew member right under the crosshair counts this much nearer than other things E can use
  const SPOT_AIM = 0.45; // radians: a cabin spot or the van this close to the crosshair keeps E (the crew step aside)
  const HURT_RANGE = 1; // tiles: a walker this close to a sheltered crew member is among them
  const JOB_EVERY = 3; // seconds between looks for a job while at a post
  const DOG_GAP = 1.5; // tiles the named dog keeps behind its leader (the unnamed one sits right by them)
  const BARK_EVERY = 25; // seconds between barks in a wave
  const SIZE_WORDS = { none: "no wave", some: "a small wave", many: "a big wave" }; // Pip's call ({size})
  const TRAIL_MAX = 240; // SCALE: points of the leader's way the dog remembers (a longer yard walks farther between stops)

  /** "the office closet", "Rosa's jar of beans": a name in running text (a possessive first word keeps its capital). */
  function inText(name, article) {
    const s = String(name || "");
    if (/^\S+'s\b/.test(s)) return s;
    return (article ? article + " " : "") + s.charAt(0).toLowerCase() + s.slice(1);
  }
  const pron = (id) => {
    const c = (W().CREW || {})[id];
    return (c && c.pronoun) || "they";
  };
  /** "she has" / "they have": the pronoun with a verb in agreement (they takes the plain form). */
  const says = (id, one, many) => pron(id) + " " + (pron(id) === "they" ? many : one);
  /** Words filled for the bubble: {dog} is "the dog" until it has a name, so a sentence that starts with it
      gets its capital ("The dog leans on your legs ..."). */
  const sentence = (text) => String(text || "").replace(/(^|[.!?]\s+)the dog\b/g, (m, a) => a + "The dog");
  const REACH_OPEN = 1.2; // tiles: you or the dog this close to a door a crew member opened keeps it open (you are following)

  Object.assign(ZSR.Interior, {
    /* ---------- Entering the yard ---------- */
    /** The crew (one per CREW id with posts) at their spots, and the dog once it is home. Called from enterYard
        after the cabin loads and before dressYard, which puts them in the scene (crewDress). */
    crewEnter() {
      const S = State();
      const Y = W().YARD.grid;
      this.talk = null;
      this.talkN = this.talkN || 0;
      this.crewSheltering = false;
      this.crewWaveInfo = null;
      this.crewFenceTiles = [];
      for (let y = 0; y < Y.length; y++) for (let x = 0; x < Y[y].length; x++) if (Y[y][x] === "F") this.crewFenceTiles.push([x, y]);
      const R = rules();
      const roster = W().CREW || {};
      this.crew = [];
      S.crewIds().forEach((id) => {
        const def = roster[id];
        if (!def || !(def.posts || []).length) return;
        const c = { id, def, x: 0, y: 0, post: null, state: "dwell", path: [], t: 0, pose: "stand", f: 0, ft: rand(0, 1), prop: null, facing: Math.PI / 2, job: null, home: null, jobT: rand(0, JOB_EVERY) };
        const post = this.crewPickPost(c, false);
        if (post) {
          const [tx, ty] = this.crewPostTile(post);
          c.x = tx + 0.5;
          c.y = ty + 0.5;
          c.post = post;
          c.pose = post.pose || "stand";
        }
        c.t = rand(2, R.dwell[1]); // they do not all set off at once
        c.prop = { x: c.x, y: c.y, art: "crew", opts: null, img: null, scale: (def.scale || 1) * this.crewArtScale("crew"), lift: 0, wide: 0.75, crew: id };
        this.crewLook(c, c.pose, 0);
        this.crew.push(c);
      });
      this.dog = null;
      if (S.dogHome()) {
        const lead = this.crewDogLeader();
        const at = lead || this.crew[0] || { x: this.player ? this.player.x : 1, y: this.player ? this.player.y : 1 };
        this.dog = { x: at.x + 0.45, y: at.y + 0.2, pose: "sit", f: 0, ft: 0, left: false, heading: 0, trail: [], prop: null, t: rand(4, 9), barkT: 0, sit: true };
        this.dog.prop = { x: this.dog.x, y: this.dog.y, art: "crewDog", opts: null, img: null, scale: this.crewArtScale("crewDog"), lift: 0, dog: true };
        this.crewDogLook("sit", 0, false);
      }
    },
    /** dressYard wiped the props: put the crew and the dog back (the same prop objects, their pictures kept). A
        build may have gone up across a way planned before it: crewUpdate plans those again (crewReroute). */
    crewDress() {
      (this.crew || []).forEach((c) => c.prop && this.addProp(c.prop));
      if (this.dog && this.dog.prop) this.addProp(this.dog.prop);
      this.crewRerouteDue = true;
    },
    /** After the yard is rebuilt: a walk planned before a build went up goes round it now (with no way left, they
        stop and choose again), and the dog, if its leader's footsteps cross the build, joins them at once (it
        would walk into the build). Nobody walks into something just built. */
    crewReroute(pass) {
      this.crewRerouteDue = false;
      (this.crew || []).forEach((c) => {
        if ((c.state !== "walk" && c.state !== "run") || !c.path || !c.path.length) return;
        const end = c.path[c.path.length - 1];
        const path = this.crewPath(c.x, c.y, Math.floor(end[0]), Math.floor(end[1]), end);
        if (path) c.path = path;
        else if (c.state === "walk") {
          c.path = [];
          c.job = null;
          c.state = "idle";
        }
      });
      const d = this.dog;
      const lead = d && this.crewDogLeader();
      if (lead && d.trail.some(([x, y]) => !pass(Math.floor(x), Math.floor(y)))) this.crewDogTo(lead.x + 0.3, lead.y + 0.15);
    },
    /** A sprite kind's prop scale from the art (ZSR.CREW_ART.scale), else the contract's. */
    crewArtScale(kind) {
      const A = ZSR.CREW_ART && ZSR.CREW_ART.scale;
      return (A && A[kind]) || { crew: 0.95, crewDog: 0.36, qObj: 0.3 }[kind] || 1;
    },
    /** The crew member's picture: pose and frame (f exactly 0 or 1: Draw3 keeps one canvas per opts set). */
    crewLook(c, pose, f) {
      const ff = f ? 1 : 0;
      if (c.prop.img && c.pose === pose && c.f === ff) return;
      c.pose = pose;
      c.f = ff;
      c.prop.opts = { who: c.id, pose, f: ff };
      c.prop.img = D3().sprite("crew", c.prop.opts);
    },
    crewDogLook(pose, f, left) {
      const d = this.dog;
      const ff = f ? 1 : 0;
      if (d.prop.img && d.pose === pose && d.f === ff && d.left === !!left) return;
      d.pose = pose;
      d.f = ff;
      d.left = !!left;
      d.prop.opts = left ? { pose, f: ff, left: true } : { pose, f: ff };
      d.prop.img = D3().sprite("crewDog", d.prop.opts);
    },

    /* ---------- Where they can go ---------- */
    crewPostTile(post) {
      if (post.at) return [post.at[0], post.at[1]];
      const [ax, ay] = W().HOUSE.at;
      return [ax + post.house[0], ay + post.house[1]];
    },
    /** A post is in use once its room is built that far (no room: always). */
    crewPostOpen(post) {
      if (!post.room) return true;
      return (State().save.rooms[post.room] || 0) >= (post.level != null ? post.level : 1);
    },
    /** A weighted pick among this crew member's open posts, not one another crew member is at or making for,
        and (when it has a choice) not the one it is at. checkTiles: skip a post whose tile is blocked now. */
    crewPickPost(c, checkTiles, avoid) {
      const pass = checkTiles ? this.crewPass() : null;
      const taken = new Set((this.crew || []).filter((o) => o !== c && o.post).map((o) => this.crewPostTile(o.post).join(",")));
      let list = (c.def.posts || []).filter((p) => this.crewPostOpen(p) && !taken.has(this.crewPostTile(p).join(",")) && (!avoid || !avoid.includes(p)));
      if (pass) list = list.filter((p) => pass(...this.crewPostTile(p)));
      if (list.length > 1 && c.post) list = list.filter((p) => p !== c.post);
      const total = list.reduce((a, p) => a + (p.weight || 1), 0);
      let r = Math.random() * total;
      for (const p of list) {
        r -= p.weight || 1;
        if (r <= 0) return p;
      }
      return list[list.length - 1] || null;
    },
    /** Can a crew member stand on or walk through a tile? The player's rules (js/interior.js solidForPlayer:
        the fence line, broken windows, walls, furniture), except that a shut cabin door lets them through. */
    crewPass() {
      const m = this.solidMask();
      const gw = this.gw;
      const gh = this.gh;
      const grid = this.grid;
      const fence = W().YARD.grid;
      return (x, y) => {
        if (x < 0 || y < 0 || x >= gw || y >= gh) return false;
        if (fence[y] && fence[y][x] === "F") return false;
        const ch = grid[y][x];
        if (ch === "O") return true;
        return ch !== "U" && !m[y * gw + x];
      };
    },
    /** Steps from a tile to every tile they can reach (Int32Array, -1 where they cannot). */
    crewDist(sx, sy, pass) {
      const gw = this.gw;
      const n = gw * this.gh;
      const dist = new Int32Array(n).fill(-1);
      const q = new Int32Array(n);
      let head = 0;
      let tail = 0;
      if (!pass(sx, sy)) return dist;
      dist[sy * gw + sx] = 0;
      q[tail++] = sy * gw + sx;
      while (head < tail) {
        const v = q[head++];
        const x = v % gw;
        const y = (v / gw) | 0;
        for (const [dx, dy] of N4) {
          const nx = x + dx;
          const ny = y + dy;
          if (!pass(nx, ny)) continue;
          const k = ny * gw + nx;
          if (dist[k] >= 0) continue;
          dist[k] = dist[v] + 1;
          q[tail++] = k;
        }
      }
      return dist;
    },
    /** A walking path from (x, y) to the middle of tile (tx, ty) (or to `to`, a point on it): tile centers with
        the corners cut where the way is clear, ending at the point. [] when already there; null when there
        is no way. Computed rarely (on setting off), so it can afford a full BFS. */
    crewPath(x, y, tx, ty, to) {
      const pass = this.crewPass();
      const gw = this.gw;
      const sx = Math.floor(x);
      const sy = Math.floor(y);
      const end = to || [tx + 0.5, ty + 0.5];
      if (!pass(tx, ty)) return null;
      if (sx === tx && sy === ty) return [end];
      const n = gw * this.gh;
      const prev = new Int32Array(n).fill(-2);
      const q = new Int32Array(n);
      let head = 0;
      let tail = 0;
      const s0 = sy * gw + sx;
      const goal = ty * gw + tx;
      prev[s0] = -1;
      q[tail++] = s0;
      let found = false;
      while (head < tail) {
        const v = q[head++];
        if (v === goal) {
          found = true;
          break;
        }
        const vx = v % gw;
        const vy = (v / gw) | 0;
        for (const [dx, dy] of N4) {
          const nx = vx + dx;
          const ny = vy + dy;
          if (!pass(nx, ny)) continue;
          const k = ny * gw + nx;
          if (prev[k] !== -2) continue;
          prev[k] = v;
          q[tail++] = k;
        }
      }
      if (!found) return null;
      const tiles = [];
      for (let v = goal; v !== s0 && v >= 0; v = prev[v]) tiles.push([(v % gw) + 0.5, ((v / gw) | 0) + 0.5]);
      tiles.reverse();
      tiles[tiles.length - 1] = end;
      return this.crewSmooth(x, y, tiles, pass);
    },
    /** Cut the corners of a tile path where a body (0.2 tiles each way) fits along the straight line. */
    crewSmooth(x, y, pts, pass) {
      const R = 0.2;
      const clear = (ax, ay, bx, by) => {
        const n = Math.ceil(Math.hypot(bx - ax, by - ay) * 5);
        for (let i = 1; i <= n; i++) {
          const px = ax + ((bx - ax) * i) / n;
          const py = ay + ((by - ay) * i) / n;
          if (!pass(Math.floor(px - R), Math.floor(py - R)) || !pass(Math.floor(px + R), Math.floor(py - R)) || !pass(Math.floor(px - R), Math.floor(py + R)) || !pass(Math.floor(px + R), Math.floor(py + R))) return false;
        }
        return true;
      };
      const out = [];
      let ax = x;
      let ay = y;
      let i = 0;
      while (i < pts.length) {
        let j = i;
        while (j + 1 < pts.length && clear(ax, ay, pts[j + 1][0], pts[j + 1][1])) j++;
        out.push(pts[j]);
        [ax, ay] = pts[j];
        i = j + 1;
      }
      return out;
    },
    /** Set off for a point: a path there, or false when there is no way. */
    crewGo(c, tx, ty, to) {
      const path = this.crewPath(c.x, c.y, tx, ty, to);
      if (!path) return false;
      c.path = path;
      return true;
    },
    /** Never stuck inside something (a build went up on their spot): to the nearest tile they can stand on. */
    crewUnstick(ent, pass) {
      const sx = Math.floor(ent.x);
      const sy = Math.floor(ent.y);
      if (pass(sx, sy)) return false;
      for (let r = 1; r < 10; r++) {
        for (let y = sy - r; y <= sy + r; y++) {
          for (let x = sx - r; x <= sx + r; x++) {
            if (Math.max(Math.abs(x - sx), Math.abs(y - sy)) !== r || !pass(x, y) || this.grid[y][x] === "O") continue;
            ent.x = x + 0.5;
            ent.y = y + 0.5;
            return true;
          }
        }
      }
      return false;
    },
    /** Walk along the path at `speed` tiles a second; true once at its end. A shut door ahead opens. */
    crewMove(c, dt, speed) {
      let step = speed * dt;
      let moved = false;
      while (c.path.length && step > 1e-6) {
        const [tx, ty] = c.path[0];
        const dx = tx - c.x;
        const dy = ty - c.y;
        const d = Math.hypot(dx, dy);
        if (d > 1e-4) c.facing = Math.atan2(dy, dx);
        if (d <= step) {
          c.x = tx;
          c.y = ty;
          step -= d;
          c.path.shift();
        } else {
          c.x += (dx / d) * step;
          c.y += (dy / d) * step;
          step = 0;
        }
        moved = true;
      }
      if (moved) this.crewDoorAhead(c);
      return !c.path.length;
    },
    /** A shut cabin door just ahead opens for them (crewDoorsBehind shuts it again). */
    crewDoorAhead(c) {
      const ax = Math.floor(c.x + Math.cos(c.facing) * 0.6);
      const ay = Math.floor(c.y + Math.sin(c.facing) * 0.6);
      if (!this.grid[ay] || this.grid[ay][ax] !== "O") return;
      const d = this.doors.find((o) => o.x === ax && o.y === ay);
      if (!d || d.open) return;
      this.crewSetDoor(d, true);
      if (!c.doors) c.doors = [];
      if (!c.doors.includes(d)) c.doors.push(d);
    },
    /** Every frame: a door they opened shuts once they are through and the doorway is clear (a walker in it
        keeps it open until it moves on). */
    crewDoorsBehind(c) {
      if (c.doors && c.doors.length) c.doors = c.doors.filter((d) => !this.crewShutBehind(d, c));
    },
    /** Shut a door a crew member opened once they are clear of it and nobody stands in it, nor is about to
        go through it after them (you, or the dog on its leader's heels). True when done with it. */
    crewShutBehind(d, c) {
      if (!d.open || d.broken) return true;
      if (this.crewWaveInfo && this.crewWaveInfo.doors.includes(d)) return true; // the shelter's: shut once all are in (crewShelterDoor)
      if (Math.hypot(d.x + 0.5 - c.x, d.y + 0.5 - c.y) < 1.0) return false;
      if (this.crewDoorBusy(d)) return false;
      const near =(e) => e && Math.hypot(d.x + 0.5 - e.x, d.y + 0.5 - e.y) < REACH_OPEN;
      if (near(this.player) || near(this.dog)) return false;
      this.crewSetDoor(d, false);
      return true;
    },
    /** Someone (you, a walker, a crew member, the dog) stands in this doorway. */
    crewDoorBusy(d) {
      const p = this.player;
      const on = (e) => e && Math.floor(e.x) === d.x && Math.floor(e.y) === d.y;
      return on(p) || this.walkerOnTile(d.x, d.y) || (this.crew || []).some(on) || on(this.dog);
    },
    crewSetDoor(d, open) {
      if (!!d.open === open) return;
      d.open = open;
      this.grid[d.y][d.x] = open ? "D" : "O";
      this.maskDirty = true;
      this.walkers.forEach((z) => (z.pathT = 0)); // a door changes every path
    },

    /* ---------- Every frame (from yardUpdate) ---------- */
    crewUpdate(dt) {
      if (!this.crew) return;
      const ph = this.phase;
      const wave = !!ph && ph.kind === "wave";
      // a wave that began without crewWave (a test, a phase set by hand) still sends them to the shelter
      if (wave !== !!this.crewSheltering) {
        const bark = this.crewWave(wave);
        if (bark) this.toast(bark, 3);
      }
      const R = rules();
      const pass = this.crewPass();
      if (this.crewRerouteDue) this.crewReroute(pass);
      this.crew.forEach((c) => this.crewStep(c, dt, R, pass, wave));
      if (this.dog) this.crewDogStep(dt, R, pass, wave);
      if (wave) {
        this.crewShelterDoor();
        this.crewRaid(dt, R);
        this.crewBark(dt, R);
      } else this.crewLookout();
      this.crewBubbleLook();
    },
    /** One crew member: walk, dwell, work, run to the shelter, or wait there. */
    crewStep(c, dt, R, pass, wave) {
      c.ft -= dt;
      this.crewDoorsBehind(c);
      // the bubble went without crewTalkEnd (the scene stopped with it open): back to what they were doing
      if (c.state === "talk" && !(this.talk && this.talk.c === c)) this.crewTalkResume(c);
      if (c.state === "talk") {
        // they stop for the bubble and stay, in the pose they were in (or standing, if they were walking)
        if (c.ft <= 0) {
          c.ft = rand(0.7, 1.3);
          this.crewLook(c, c.pose === "walk" ? "stand" : c.pose, c.f ? 0 : 1);
        }
        return this.crewPlace(c);
      }
      if (c.state !== "shelter" && c.state !== "run" && this.crewUnstick(c, pass)) {
        c.path = [];
        c.state = "idle";
      }
      if (c.state === "run") {
        c.t -= dt;
        const there = this.crewMove(c, dt, R.runSpeed);
        if (there || c.t <= 0) {
          // in, or late: they are simply there
          c.x = c.home.x;
          c.y = c.home.y;
          c.path = [];
          c.state = "shelter";
          c.ft = 0;
          if (this.dog && c === this.crewDogLeader() && c.t <= 0) this.crewDogTo(c.home.x + 0.3, c.home.y + 0.15);
        } else this.crewWalkFrames(c, R.runSpeed / R.walkSpeed);
      } else if (c.state === "shelter") {
        if (c.ft <= 0) {
          c.ft = rand(0.8, 1.4);
          this.crewLook(c, "stand", c.f ? 0 : 1);
        }
      } else if (c.state === "walk") {
        if (this.crewMove(c, dt, R.walkSpeed)) {
          if (c.job) {
            c.state = "work";
            c.t = R.workSeconds;
            c.ft = 0;
          } else {
            c.state = "dwell";
            c.t = rand(R.dwell[0], R.dwell[1]);
            c.ft = 0;
          }
        } else this.crewWalkFrames(c, 1);
      } else if (c.state === "work") {
        if (!this.crewJobLive(c.job)) {
          c.job = null;
          c.state = "idle";
        } else {
          if (c.ft <= 0) {
            c.ft = 0.45;
            this.crewLook(c, "work", c.f ? 0 : 1);
          }
          c.t -= dt;
          if (c.t <= 0 && this.crewJobDone(c)) {
            c.job = null;
            c.state = "idle";
          }
        }
      } else if (c.state === "dwell") {
        c.t -= dt;
        if (c.ft <= 0) {
          const pose = (c.post && c.post.pose) || "stand";
          c.ft = pose === "work" ? 0.45 : rand(0.7, 1.3);
          this.crewLook(c, pose, c.f ? 0 : 1);
        }
        c.jobT -= dt;
        if (c.jobT <= 0) {
          c.jobT = JOB_EVERY;
          if (!wave && this.crewTryJob(c)) return this.crewPlace(c);
        }
        if (c.t <= 0) c.state = "idle";
      }
      if (c.state === "idle" && !wave) {
        if (!this.crewTryJob(c)) this.crewWander(c, R);
      }
      this.crewPlace(c);
    },
    crewPlace(c) {
      c.prop.x = c.x;
      c.prop.y = c.y;
    },
    /** Walking frames: a step every 0.28 s at walking pace (faster when they run). */
    crewWalkFrames(c, k) {
      if (c.ft > 0 && c.pose === "walk") return;
      c.ft = 0.28 / (k || 1);
      this.crewLook(c, "walk", c.pose === "walk" && !c.f ? 1 : 0);
    },
    /** Off to another post; a post with no way there is skipped for another; none at all: stay a while. */
    crewWander(c, R) {
      const tried = [];
      for (let i = 0; i < 4; i++) {
        const post = this.crewPickPost(c, true, tried);
        if (!post) break;
        tried.push(post);
        const [tx, ty] = this.crewPostTile(post);
        if (this.crewGo(c, tx, ty)) {
          c.post = post;
          c.state = "walk";
          c.ft = 0;
          return true;
        }
      }
      c.state = "dwell"; // nowhere to go just now: stand a while where they are
      c.post = null;
      c.t = rand(5, 10);
      return false;
    },

    /* ---------- Jobs ---------- */
    /** A job for this crew member now (their stars unlock it; never in a wave): the nearest fence segment to
        fix, else (cabin job) the nearest damaged door or window, that the base can pay for. Sets off; true if so. */
    crewTryJob(c) {
      const S = State();
      const jobs = S.crewJobs(c.id);
      const kinds = ["fence", "cabin"].filter((k) => jobs.includes(k) && this.crewCanPay(k));
      if (!kinds.length) return false;
      const targets = [];
      if (kinds.includes("fence")) this.crewFenceDamage().forEach(([x, y]) => targets.push({ kind: "fence", key: x + "," + y, x, y }));
      // the fence first: the cabin's doors and windows only once the fence is whole
      if (!targets.length && kinds.includes("cabin")) {
        Object.entries(this.barriers || {}).forEach(([key, b]) => {
          if (b.kind === "inner" || b.hp >= b.max) return;
          const [x, y] = key.split(",").map(Number);
          targets.push({ kind: "cabin", key, x, y });
        });
      }
      if (!targets.length) return false;
      const pass = this.crewPass();
      const gw = this.gw;
      const dist = this.crewDist(Math.floor(c.x), Math.floor(c.y), pass);
      let best = null;
      targets.forEach((t) => {
        N8.forEach(([dx, dy]) => {
          const sx = t.x + dx;
          const sy = t.y + dy;
          if (sx < 0 || sy < 0 || sx >= gw || sy >= this.gh || this.grid[sy][sx] === "O") return;
          const d = dist[sy * gw + sx];
          if (d >= 0 && (!best || d < best.d)) best = { d, t, sx, sy };
        });
      });
      if (!best) return false;
      // stand on the tile beside it, a little toward it
      const to = [best.sx + 0.5 + (best.t.x - best.sx) * 0.15, best.sy + 0.5 + (best.t.y - best.sy) * 0.15];
      if (!this.crewGo(c, best.sx, best.sy, to)) return false;
      c.job = best.t;
      c.state = "walk";
      c.ft = 0;
      return true;
    },
    /** Fence segments with a hole or a crack (below half strength, as yardFacing shows them): [[x, y]]. */
    crewFenceDamage() {
      const out = [];
      const half = this.fenceMax * 0.5;
      (this.crewFenceTiles || []).forEach(([x, y]) => {
        const hp = this.fence[x + "," + y];
        if (hp == null || hp < half) out.push([x, y]);
      });
      return out;
    },
    /** The base can pay for one repair of this kind (or it is free with the perk). */
    crewCanPay(kind) {
      const S = State();
      return (S.save.scrap || 0) >= S.crewRepairCost(kind);
    },
    /** The job's target still needs fixing. */
    crewJobLive(job) {
      if (!job) return false;
      if (job.kind === "fence") {
        const hp = this.fence[job.key];
        return hp == null || hp < this.fenceMax * 0.5;
      }
      const b = this.barriers && this.barriers[job.key];
      return !!b && b.hp < b.max;
    },
    /** The work is done: fixed and paid for (never while a walker stands in it; never if the scrap ran out).
        No toast: they tell you when you next talk (State.logWork). True when they are done with it. */
    crewJobDone(c) {
      const S = State();
      const job = c.job;
      if (!this.crewJobLive(job)) return true;
      if (!this.crewCanPay(job.kind)) return true;
      if (this.walkerOnTile(job.x, job.y)) return false; // wait for it to move
      const paid = S.crewRepairPay(job.kind);
      if (job.kind === "fence") this.mendFence(job.x, job.y);
      else this.fixBarrier(job.key);
      S.logWork(c.id, job.kind, 1, paid);
      this.updateHud();
      if (this.hooks.onYardChanged) this.hooks.onYardChanged();
      return true;
    },
    /** The name of a crew member whose stars unlock this job ("fence", "cabin"), or null (the wave-cleared toast). */
    crewFixer(job) {
      const S = State();
      const c = (this.crew || []).find((m) => S.crewJobs(m.id).includes(job));
      return c ? ZSR.crewName(c.id) : null;
    },

    /* ---------- Waves: the shelter ---------- */
    /** The shelter's floor tiles in the yard grid, the one farthest from its door first: [{ x, y }] (tile middles). */
    crewShelterTiles() {
      const H = W().HOUSE;
      const room = H.rooms && H.rooms[rules().shelter];
      if (!room) return [];
      const [ax, ay] = H.at;
      const out = [];
      for (let hy = room.rect[1]; hy <= room.rect[3]; hy++) for (let hx = room.rect[0]; hx <= room.rect[2]; hx++) if ((H.grid[hy] || "")[hx] === ".") out.push({ x: ax + hx + 0.5, y: ay + hy + 0.5 });
      const doors = this.crewShelterDoors();
      const near = (t) => Math.min(...doors.map((d) => Math.hypot(d.x + 0.5 - t.x, d.y + 0.5 - t.y)).concat([99]));
      return out.sort((a, b) => near(b) - near(a));
    },
    /** Raiders that go for the shelter take one of its tiles as their goal (js/house.js yardWalkerGoal). */
    crewShelterSpots() {
      if (!this.crew || !this.crew.length) return [];
      return this._shelterSpots || (this._shelterSpots = this.crewShelterTiles().map((t) => ({ x: t.x, y: t.y })));
    },
    /** The inner doors into the shelter: the door objects beside its tiles. */
    crewShelterDoors() {
      const H = W().HOUSE;
      const room = H.rooms && H.rooms[rules().shelter];
      if (!room) return [];
      const [ax, ay] = H.at;
      const inRoom = (x, y) => x - ax >= room.rect[0] && x - ax <= room.rect[2] && y - ay >= room.rect[1] && y - ay <= room.rect[3];
      return Object.values(this.barriers || {})
        .filter((b) => b.kind === "inner" && N4.some(([dx, dy]) => inRoom(b.door.x + dx, b.door.y + dy)))
        .map((b) => b.door);
    },
    /** A wave starts (on) or is cleared. On: everyone runs for the shelter (an open bubble closes, a job is
        dropped); returns the dog's bark for the wave toast ("" with no dog). Off: they open its door and
        go back to their spots. */
    crewWave(on) {
      if (!this.crew) return "";
      if (!!this.crewSheltering === !!on) return "";
      this.crewSheltering = !!on;
      this._shelterSpots = null;
      if (!on) {
        (this.crewWaveInfo ? this.crewWaveInfo.doors : this.crewShelterDoors()).forEach((d) => this.crewSetDoor(d, true));
        this.crewWaveInfo = null;
        this.crew.forEach((c) => {
          c.state = "dwell"; // a moment to come out, not all at once
          c.post = null;
          c.t = rand(1, 4);
          c.ft = 0;
          c.home = null;
          c.path = [];
          c.jobT = 0;
        });
        if (this.dog) this.dog.home = null;
        return "";
      }
      if (this.talk) this.crewTalkEnd();
      const tiles = this.crewShelterTiles();
      this.crewWaveInfo = { hurt: new Set(), shut: false, doors: this.crewShelterDoors(), barkT: BARK_EVERY * 0.4 };
      if (!tiles.length) return "";
      // the smallest farthest from the door; more crew than tiles share them. SCALE: a bigger crew needs a
      // bigger shelter room (CREW_RULES.shelter), or they stand two to a tile
      const order = this.crew.slice().sort((a, b) => (a.def.scale || 1) - (b.def.scale || 1));
      order.forEach((c, i) => {
        const t = tiles[i % tiles.length];
        const shared = i >= tiles.length;
        c.home = { x: t.x + (shared ? 0.22 : 0), y: t.y + (shared ? -0.12 : 0) };
        c.job = null;
        c.state = "run";
        c.t = SHELTER_LATE;
        c.ft = 0;
        if (!this.crewGo(c, Math.floor(t.x), Math.floor(t.y), [c.home.x, c.home.y])) c.path = []; // no way: they are there when time is up
      });
      if (!this.dog) return "";
      const lead = this.crewDogLeader();
      this.dog.home = lead && lead.home ? { x: lead.home.x + 0.3, y: lead.home.y + 0.15 } : null;
      return this.crewDogBark("wave");
    },
    /** Once everyone is in, the shelter's door shuts (not while someone stands in the doorway). */
    crewShelterDoor() {
      const info = this.crewWaveInfo;
      if (!info || info.shut) return;
      if (!this.crew.every((c) => c.state === "shelter")) return;
      if (this.dog && this.dog.home && Math.hypot(this.dog.x - this.dog.home.x, this.dog.y - this.dog.home.y) > 0.3) return;
      if (info.doors.some((d) => d.open && this.crewDoorBusy(d))) return;
      info.doors.forEach((d) => this.crewSetDoor(d, false));
      info.shut = true;
    },
    /** A walker among the sheltered crew (within HURT_RANGE, in sight) for hurtSeconds hurts one of them
        off-screen: you hear a shout; State.crewHurt takes a kit (else food) and trust. One raider hurts one crew
        member (docs/CREW.md: "if it stands among the crew for hurtSeconds, one crew member is hurt"), never all
        of them in turn while you are out at the fence; each crew member is hurt at most once a wave. */
    crewRaid(dt, R) {
      const info = this.crewWaveInfo;
      if (!info) return;
      for (const z of this.walkers) {
        if (z.hp <= 0 || z.crewHurt) continue;
        // the nearest sheltered crew member not yet hurt this wave, close and in sight (no lists: every frame of a wave)
        let c = null;
        let best = Infinity;
        for (const m of this.crew) {
          if (m.state !== "shelter" || info.hurt.has(m.id)) continue;
          const d = Math.hypot(m.x - z.x, m.y - z.y);
          if (d <= HURT_RANGE && d < best && this.lineClear(z.x, z.y, m.x, m.y)) {
            best = d;
            c = m;
          }
        }
        if (!c) {
          z.crewT = 0;
          continue;
        }
        z.crewT = (z.crewT || 0) + dt;
        if (z.crewT < R.hurtSeconds) continue;
        z.crewT = 0;
        z.crewHurt = true;
        info.hurt.add(c.id);
        State().crewHurt(c.id);
        const room = W().HOUSE.rooms[R.shelter];
        this.toast("You hear " + ZSR.crewName(c.id) + " shout from " + inText(room ? room.name : "the shelter", room ? "the" : "") + "! A walker got in with the crew.", 4);
        Audio().play("wrong");
      }
    },

    /* ---------- The lookout ---------- */
    /** Pip (the lookout job) calls the next wave (phase.next) lookoutSeconds (with perks) before it comes. Only a
        real wave: a calm that stays quiet is not called ("Still quiet" says so when it ends). Not after the
        dinner bell: that wave comes at once, and its own toast says where. */
    crewLookout() {
      const ph = this.phase;
      if (!ph || ph.kind !== "calm" || !ph.next || ph.called || ph.forced) return;
      if (!ph.next.size || ph.next.size === "none") return;
      const S = State();
      if (ph.lookT == null) ph.lookT = S.crewLookoutSeconds();
      if (ph.t > ph.lookT) return;
      ph.called = true;
      const c = this.crew.find((m) => S.crewJobs(m.id).includes("lookout"));
      if (!c) return;
      const text = sentence(ZSR.crewFill(ZSR.crewText("tip", c.id, "wave"), this.crewWaveVars(ph.next)));
      if (!text) return;
      S.seeCrewTalk("tip:" + c.id + ":wave", ZSR.wordCount(text));
      this.toast(text, this.readSecs(text, 4));
      Audio().play("equip"); // a crackle on the walkie-talkie
    },
    /** {size} and {sides} for a wave roll. */
    crewWaveVars(next) {
      return { size: SIZE_WORDS[next.size] || SIZE_WORDS.none, sides: next.sides && next.sides.length ? this.waveWhere(next.sides) : "nowhere" };
    },

    /* ---------- The dog at home ---------- */
    /** The crew member the dog follows: the dog quest's giver (else the first of the crew). */
    crewDogLeader() {
      const q = (W().QUESTS || []).find((x) => x && x.kind === "dog");
      return (this.crew || []).find((c) => q && c.id === q.giver) || (this.crew || [])[0] || null;
    },
    crewDogTo(x, y) {
      const d = this.dog;
      if (!d) return;
      d.x = x;
      d.y = y;
      d.trail = [];
    },
    /** The dog: on its leader's heels (named: DOG_GAP behind; not named yet: sitting right by them), in their
        footsteps, so it never cuts through a wall; in a wave, into the shelter with them. */
    crewDogStep(dt, R, pass, wave) {
      const d = this.dog;
      const lead = this.crewDogLeader();
      d.ft -= dt;
      d.barkT = Math.max(0, d.barkT - dt);
      if (!lead) return this.crewDogPlace();
      if (!pass(Math.floor(d.x), Math.floor(d.y)) && !(d.home && Math.hypot(d.x - d.home.x, d.y - d.home.y) < 0.5)) this.crewDogTo(lead.x + 0.3, lead.y + 0.15);
      // the leader's footsteps
      const last = d.trail[d.trail.length - 1] || [d.x, d.y];
      if (Math.hypot(lead.x - last[0], lead.y - last[1]) > 0.3) {
        d.trail.push([lead.x, lead.y]);
        if (d.trail.length > TRAIL_MAX) this.crewDogTo(lead.x + 0.3, lead.y + 0.15); // lost the trail: by them again
      }
      const named = !!State().dogName();
      const sheltered = wave && lead.state === "shelter" && d.home;
      const gap = sheltered ? 0 : named ? DOG_GAP : 0.55;
      // how far behind the leader along the trail
      let left = 0;
      let px = d.x;
      let py = d.y;
      for (const [tx, ty] of d.trail) {
        left += Math.hypot(tx - px, ty - py);
        px = tx;
        py = ty;
      }
      left += Math.hypot(lead.x - px, lead.y - py);
      let moving = false;
      if (sheltered) {
        // the last steps in: to its spot by the leader
        const dx = d.home.x - d.x;
        const dy = d.home.y - d.y;
        const dd = Math.hypot(dx, dy);
        const step = R.runSpeed * 1.1 * dt;
        if (dd > 0.02 && d.trail.length === 0) {
          d.x += (dx / dd) * Math.min(dd, step);
          d.y += (dy / dd) * Math.min(dd, step);
          d.heading = Math.atan2(dy, dx);
          moving = dd > step;
        } else if (dd > 0.02) moving = this.crewDogTrail(d, step * 1.2, 0, lead);
        else d.trail = [];
      } else if (left > gap + 0.15) {
        const speed = (lead.state === "run" ? R.runSpeed : R.walkSpeed) * (left > gap + 2 ? 1.6 : 1.1);
        moving = this.crewDogTrail(d, Math.min(speed * dt, left - gap), gap, lead);
      }
      // the picture: walking, barking, or at rest (the unnamed dog sits by its leader; the named one stands
      // and wags, and sits down now and then)
      let pose;
      if (d.barkT > 0) pose = "bark";
      else if (moving) pose = "walk";
      else {
        d.t -= dt;
        if (d.t <= 0) {
          d.t = rand(5, 11);
          d.sit = !named || !d.sit;
        }
        pose = named && !sheltered && !d.sit ? "stand" : "sit";
      }
      if (d.ft <= 0) {
        d.ft = pose === "walk" ? 0.16 : pose === "bark" ? 0.2 : pose === "stand" ? 0.35 : 1.1;
        d.f = d.f ? 0 : 1;
      }
      // it faces left on screen when it heads leftward as you see it (the art faces right)
      const p = this.player;
      const left2 = p ? Math.cos(d.heading) * -Math.sin(p.a) + Math.sin(d.heading) * Math.cos(p.a) < 0 : false;
      this.crewDogLook(pose, d.f, left2);
      this.crewDogPlace();
    },
    /** Along the leader's footsteps by `step` tiles (never closer than `gap` behind). True if it moved. */
    crewDogTrail(d, step, gap, lead) {
      let moved = false;
      while (step > 1e-6) {
        const tgt = d.trail[0] || (gap === 0 ? [lead.x, lead.y] : null);
        if (!tgt) break;
        const dx = tgt[0] - d.x;
        const dy = tgt[1] - d.y;
        const dd = Math.hypot(dx, dy);
        if (dd > 1e-4) d.heading = Math.atan2(dy, dx);
        if (dd <= step) {
          d.x = tgt[0];
          d.y = tgt[1];
          step -= dd;
          if (d.trail.length) d.trail.shift();
          else break;
        } else {
          d.x += (dx / dd) * step;
          d.y += (dy / dd) * step;
          step = 0;
        }
        moved = true;
      }
      return moved;
    },
    crewDogPlace() {
      const d = this.dog;
      d.prop.x = d.x;
      d.prop.y = d.y;
    },
    /** A bark: the toast's words (the caller shows them) and the sound. "wave": a wave is coming; "near": a
        walker close to the cabin. */
    crewDogBark(why) {
      const d = this.dog;
      if (!d) return "";
      d.barkT = 1.2;
      Audio().play("hit");
      const name = State().dogName() || "The dog";
      const room = W().HOUSE.rooms[rules().shelter];
      if (why === "wave") return name + " barks at the trees and runs for " + inText(room ? room.name : "the shelter", room ? "the" : "") + " with the crew.";
      return name + " barks from " + inText(room ? room.name : "the shelter", room ? "the" : "") + ": walkers are close to the cabin!";
    },
    /** In a wave, a walker within dogBarkRange of the cabin sets the dog barking (now and then, not on and on). */
    crewBark(dt, R) {
      const info = this.crewWaveInfo;
      if (!this.dog || !info) return;
      info.barkT -= dt;
      if (info.barkT > 0) return;
      const H = W().HOUSE;
      const [ax, ay] = H.at;
      const x1 = ax + Math.max(...H.grid.map((l) => l.length));
      const y1 = ay + H.grid.length;
      const near = this.walkers.some((z) => {
        const dx = Math.max(ax - z.x, 0, z.x - x1);
        const dy = Math.max(ay - z.y, 0, z.y - y1);
        return z.hp > 0 && Math.hypot(dx, dy) <= R.dogBarkRange;
      });
      if (!near) {
        info.barkT = 0.5;
        return;
      }
      info.barkT = BARK_EVERY;
      this.toast(this.crewDogBark("near"), 3);
    },

    /* ---------- Facing, E and the hint ---------- */
    /** A crew member (or the dog) right under the crosshair, close and in sight. Never one that would take E from
        a cabin spot or the van you are looking at. In a wave only a hint (they are hiding), and without the aim
        bonus: E does nothing for them then, so the shelter's door beside them keeps it. */
    crewFacing(cand) {
      if (!this.crew || (!this.crew.length && !this.dog)) return;
      const p = this.player;
      const REACH = this.REACH || {};
      const wave = this.phase && this.phase.kind === "wave";
      const aimAt = (x, y) => Math.abs(normAngle(Math.atan2(y - p.y, x - p.x) - p.a));
      const busy = cand.some((c) => (c.kind === "spot" || c.kind === "van" || c.kind === "pane") && Math.hypot(c.x - p.x, c.y - p.y) <= (REACH[c.kind] || 1.6) && aimAt(c.x, c.y) <= SPOT_AIM);
      if (busy) return;
      const look = (x, y, half, reach) => {
        const d = Math.hypot(x - p.x, y - p.y);
        return d <= reach && d > 0.05 && aimAt(x, y) <= Math.atan2(half, d) && this.lineClear(p.x, p.y, x, y);
      };
      let central = Infinity; // the aimed crew member nearest the crosshair
      this.crew.forEach((c) => {
        if (!look(c.x, c.y, AIM, REACH.crew || 2.2)) return;
        cand.push({ kind: "crew", obj: c, x: c.x, y: c.y, aim: wave ? 0 : AIM_BONUS, wave });
        central = Math.min(central, aimAt(c.x, c.y));
      });
      // the dog sits right by its leader: it takes E only when it is nearer the crosshair than they are
      const d = this.dog;
      if (d && !wave && look(d.x, d.y, DOG_AIM, REACH.dog || 2.2) && aimAt(d.x, d.y) < central) cand.push({ kind: "dog", obj: d, x: d.x, y: d.y, aim: central < Infinity ? AIM_BONUS + 2 : AIM_BONUS });
    },
    crewInteract(f) {
      if (f.wave || (this.phase && this.phase.kind === "wave")) return; // hiding: not now
      if (this.talk && this.crewTalkKey(f)) return;
      if (this.talk) this.crewTalkEnd();
      if (f.kind === "dog") this.crewDogOpen();
      else this.crewOpen(f.obj.id);
    },
    crewHint(f) {
      const S = State();
      if (f.kind === "dog") {
        if (this.talk && this.talk.id === "dog") return this.talk.more ? "Press E to read on" : "Press E to close";
        return "Press E to pet " + (S.dogName() || "the dog");
      }
      const c = f.obj;
      const name = ZSR.crewName(c.id);
      if (f.wave) {
        const room = W().HOUSE.rooms[rules().shelter];
        return name + " is hiding in " + inText(room ? room.name : "the shelter", room ? "the" : "");
      }
      // more words below the fold come first; then the bubble itself says "Press E again: ..."
      if (this.talk && this.talk.id === c.id) return this.talk.more ? "Press E to read on" : this.talk.action ? "" : "Press E to close";
      // what they have for you, looked up twice a second, not every frame
      if (!c.hint || this.time - c.hint.t > 0.5) c.hint = { t: this.time, news: S.crewReportItems(c.id).length > 0, need: !!this.crewAction(c.id) };
      const { news, need } = c.hint;
      const extra = news && need ? says(c.id, "has", "have") + " news and " + (pron(c.id) === "they" ? "need" : "needs") + " something" : news ? says(c.id, "has", "have") + " news" : need ? says(c.id, "needs", "need") + " something" : "";
      return "Press E to talk to " + name + (extra ? " (" + extra + ")" : "");
    },

    /* ---------- The speech bubble ---------- */
    /** What they would ask of you now: { action: "handIn" | "name" | "offer", line } or null. A request filled
        first; then the dog's name (its quest's giver, once the dog is home); then a new request. */
    crewAction(id) {
      const S = State();
      const name = ZSR.crewName(id);
      if (S.handInReady(id)) {
        const r = S.request(id);
        let what = "";
        if (r && r.kind === "quest" && r.def.kind === "dog") return { action: "handIn", line: name + " wants to thank you for the dog" };
        if (r && r.kind === "quest") what = inText(ZSR.crewText("quest", r.def.id, "title"), "the");
        else if (r) {
          // the items counted in running text: "give Tomas 2 boxes of nails" (ITEMS one / many)
          const v = S.requestVars(r);
          const item = (r.st && r.st.item) || r.def.item;
          what = ZSR.itemCount ? ZSR.itemCount(item, v.count) : v.count + " " + v.item;
        }
        return { action: "handIn", line: "give " + name + " " + (what || "what you found") };
      }
      const dq = (W().QUESTS || []).find((q) => q && q.kind === "dog");
      if (dq && dq.giver === id && S.dogHome() && !S.dogName()) return { action: "name", line: "name the dog" };
      if (S.offer(id)) return { action: "offer", line: name + " has a favor to ask" };
      return null;
    },
    /** Live counts for the tips, and June's patch-up: she heals you now when the heal job is unlocked, you are
        hurt and she has not yet this calm (State.crewHealAmount). Her heal tip tells it as it happens, so it is
        never logged for a report too (the next talk would tell it again). */
    crewTipCtx(id) {
      const S = State();
      const ph = this.phase;
      const half = this.fenceMax * 0.5;
      let holes = 0;
      let cracks = 0;
      (this.crewFenceTiles || []).forEach(([x, y]) => {
        const hp = this.fence[x + "," + y];
        if (hp == null) holes++;
        else if (hp < half) cracks++;
      });
      const ctx = { holes, cracks, broken: this.houseDamage().broken };
      const p = this.player;
      if (ph && ph.kind === "calm" && !ph.crewHealed && p && p.hp < p.maxHp - 0.5 && S.crewJobs(id).includes("heal")) {
        const hp = Math.round(Math.min(S.crewHealAmount(), p.maxHp - p.hp));
        if (hp >= 1) {
          ctx.heal = hp;
          ctx.healed = true;
        }
      }
      // Pip's call is told once Pip has called it (lookoutSeconds before the wave); before that, Pip's other tips
      if (ph && ph.kind === "calm" && ph.next && ph.called) ctx.wave = this.crewWaveVars(ph.next);
      return ctx;
    },
    /** Open the bubble: talk (once), report, tip, topic, and what they want. Built once; State.seeCrewTalk counts
        each text's words the first time it is read. */
    crewOpen(id) {
      const S = State();
      const c = (this.crew || []).find((m) => m.id === id);
      if (!c) return;
      S.crewTalk(id);
      const paras = [];
      S.crewReportItems(id).forEach((r) => paras.push({ key: "report:" + r.key, text: ZSR.crewFill(ZSR.crewText("report", r.key), r.vars) }));
      S.clearReport(id);
      const ctx = this.crewTipCtx(id);
      const tip = S.crewTip(id, ctx);
      if (tip) paras.push({ key: "tip:" + id + ":" + tip.tip, text: ZSR.crewFill(ZSR.crewText("tip", id, tip.tip), tip.vars) });
      if (ctx.healed && tip && tip.tip === "heal") {
        const p = this.player;
        p.hp = Math.min(p.maxHp, p.hp + ctx.heal);
        p.hurt = 0;
        this.phase.crewHealed = true;
        Audio().play("correct");
        this.updateHud();
      }
      const t = S.nextTopic(id);
      if (t) {
        paras.push({ key: t.quest ? "quest:" + t.quest + ":after" : "talk:" + t.id, text: ZSR.crewFill(ZSR.crewText("talk", t.id), {}) });
        S.markTopic(id, t.id);
      }
      const act = this.crewAction(id);
      const shown = paras.filter((x) => x.text && x.text.trim()).map((x) => ({ key: x.key, text: sentence(x.text) }));
      shown.forEach((x) => S.seeCrewTalk(x.key, ZSR.wordCount(x.text)));
      const stars = Math.max(0, Math.min(S.stars(id), ((W().CREW_RULES || {}).stars || []).length));
      const max = ((W().CREW_RULES || {}).stars || []).length;
      const panel = {
        key: "talk:" + id + ":" + ++this.talkN,
        kind: "talk",
        cls: "crew-" + id,
        color: c.def.color || "",
        title: ZSR.crewName(id),
        status: max ? "★".repeat(stars) + "☆".repeat(max - stars) : "",
        text: shown.map((x) => x.text).join("\n\n"),
        meta: act ? [["Press E again", act.line]] : [],
      };
      this.crewTalkHold(c);
      this.talk = { id, panel, action: act ? act.action : null, line: act ? act.line : "", c, more: false };
      this.crewBubbleColor(panel.color);
      c.hint = null;
      Audio().play("click");
      this.crewTalkSave();
    },
    /** What a talk changed (trust, the topic told, the report cleared, words read) is saved at once, in the calm:
        a wave that starts while the bubble is open closes it when nothing may be saved, and dying in that wave
        reloads the last save. */
    crewTalkSave() {
      if (this.phase && this.phase.kind === "wave") return;
      if (ZSR.Main && ZSR.Main.syncYard) ZSR.Main.syncYard();
    },
    /** The dog's bubble: a pat, in its own words. */
    crewDogOpen() {
      const S = State();
      const d = this.dog;
      if (!d) return;
      const text = sentence(ZSR.crewFill(ZSR.crewText("dog", null, "pet"), {}));
      if (text) S.seeCrewTalk("dog:pet", ZSR.wordCount(text));
      const panel = { key: "talk:dog:" + ++this.talkN, kind: "talk", cls: "crew-dog", color: "#c8a060", title: S.dogName() || "The dog", status: "", text, meta: [] };
      this.talk = { id: "dog", panel, action: null, line: "", c: null, more: false };
      this.crewBubbleColor(panel.color);
      d.barkT = 0;
      Audio().play("click");
      this.crewTalkSave();
    },
    /** The speaker stops and stays while the bubble is open; what they were doing resumes after. */
    crewTalkHold(c) {
      if (c.state === "talk") return;
      c.resume = { state: c.state, t: c.t };
      c.state = "talk";
      if (c.pose === "walk") this.crewLook(c, "stand", 0);
    },
    /** Where the bubble's speaker stands (js/interior.js nearReadable closes it past READ_REACH + 0.4). */
    crewSpeaker(talk) {
      if (!talk) return null;
      if (talk.id === "dog") return this.dog;
      return talk.c || null;
    },
    /** E with the bubble open, facing its speaker or nothing: their question (the crew card, js/main.js), or
        close it. Facing something else, E goes to that thing. True when E was used here. */
    crewTalkKey(f) {
      const t = this.talk;
      if (!t) return false;
      const same = !f || (f.kind === "crew" && f.obj.id === t.id) || (f.kind === "dog" && t.id === "dog");
      if (!same) return false;
      // words still below the bubble's edge (a short window, Huge text): E reads on before it asks or closes
      if (this.crewBubblePage()) {
        Audio().play("click");
        return true;
      }
      const wave = this.phase && this.phase.kind === "wave";
      if (t.action && !wave && this.hooks.onCrewCard) {
        const S = State();
        // what the card changes is read back in crewCardDone, whatever the card passes
        t.before = { reqs: S.requests(t.id).map((r) => r.def.id), dog: S.dogName() };
        Audio().play("click");
        this.hooks.onCrewCard(t.id, t.action);
        return true;
      }
      this.crewTalkEnd();
      Audio().play("click");
      return true;
    },
    /** Close the bubble: the speaker goes back to what they were doing, and the talk is saved (syncYard). */
    crewTalkEnd(noSave) {
      const t = this.talk;
      if (!t) return;
      this.talk = null;
      if (t.c) this.crewTalkResume(t.c);
      if (!noSave && ZSR.Main && ZSR.Main.syncYard) ZSR.Main.syncYard();
    },
    /** The speaker goes back to what they were doing before the bubble (walking on, working, or at their post). */
    crewTalkResume(c) {
      if (c.state !== "talk") return;
      const r = c.resume || { state: "idle", t: 0 };
      c.state = r.state === "walk" || r.state === "work" || r.state === "dwell" ? r.state : "idle";
      c.t = Math.max(r.t || 0, c.state === "dwell" ? 2 : 0);
      c.ft = 0;
      c.resume = null;
      c.hint = null;
    },
    /** The crew card is closed (js/main.js calls this, then resume): a toast for what changed, and the bubble
        closes, or opens again after a hand-in (their thanks lead straight into the story it earned). */
    crewCardDone(id, action, result) {
      const S = State();
      const t = this.talk;
      const before = (t && t.id === id && t.before) || { reqs: [], dog: "" };
      const name = ZSR.crewName(id);
      const now = S.requests(id);
      let reopen = false;
      if (action === "offer") {
        const fresh = now.find((r) => !before.reqs.includes(r.def.id));
        // a card that reports { accepted } says so itself (js/main.js): no second toast over it
        if (fresh && !(result && typeof result === "object" && "accepted" in result)) {
          const title = fresh.kind === "quest" ? ZSR.crewText("quest", fresh.def.id, "title") : ZSR.crewText("errand", fresh.def.id, "title");
          this.toast("Added to your backpack: " + name + "'s request" + (title ? ", " + title : "") + ".", 3.5);
          Audio().play("pickup");
        }
      } else if (action === "handIn") {
        const gone = before.reqs.find((rid) => !now.some((r) => r.def.id === rid));
        const def = gone ? S.questDef(gone) || S.errandDef(gone) : result && result.def;
        if (def) {
          const words = S.rewardWords(def.reward);
          // scrap, storage, crowbars and traps are all "at the base" (not all of it goes into storage)
          this.toast(words ? "From " + name + ": " + words + ". It is all at the base now." : name + " thanks you.", 3.5);
          Audio().play("buy");
          reopen = true;
        }
      } else if (action === "name") {
        const dn = S.dogName();
        if (dn && dn !== before.dog) {
          this.toast("The dog is called " + dn + " now.", 3);
          Audio().play("correct");
        }
      }
      const c = t && t.c;
      this.crewTalkEnd(true);
      const p = this.player;
      if (reopen && c && p && !(this.phase && this.phase.kind === "wave") && Math.hypot(c.x - p.x, c.y - p.y) <= 2.6) this.crewOpen(id);
      if (ZSR.Main && ZSR.Main.syncYard) ZSR.Main.syncYard();
    },
    /** The bubble's look on the read panel: the speaker's color, and its tail toward their side of the view. */
    crewBubbleColor(color) {
      const el = this.hud && this.hud.read;
      if (el && el.style && el.style.setProperty) el.style.setProperty("--crew", color || "#4b5057");
    },
    crewBubbleLook() {
      const t = this.talk;
      const el = this.hud && this.hud.read;
      if (!t || !el || !el.dataset) return;
      // more words below its edge? (the hint says "Press E to read on"); looked up a few times a second, not every frame
      if (!(this.time < t.moreT)) {
        t.moreT = this.time + 0.25;
        t.more = this.crewBubbleMore();
      }
      // css/crew.css fades the last line while there is more (the class goes when the panel is rebuilt)
      if (this.panelKey === t.panel.key && el.classList && el.classList.contains("more") !== !!t.more) el.classList.toggle("more", !!t.more);
      const sp = this.crewSpeaker(t);
      if (!sp || !this.player) return;
      const side = this.sideOf(sp.x, sp.y);
      const tail = side < -0.18 ? "left" : side > 0.18 ? "right" : "mid";
      if (el.dataset.tail !== tail) el.dataset.tail = tail;
    },
    /** The box that scrolls when the bubble's words run past its edge: the words (wide screens), the whole
        bubble (Huge text), or null when it all shows. Only once the read panel shows this bubble. */
    crewBubbleScroller() {
      const t = this.talk;
      const el = this.hud && this.hud.read;
      if (!t || !el || this.panelKey !== t.panel.key || typeof el.querySelector !== "function") return null;
      const words = el.querySelector(".rp-text");
      if (words && words.scrollHeight > words.clientHeight + 2) return words;
      return el.scrollHeight > el.clientHeight + 2 ? el : null;
    },
    /** Words still below the bubble's edge. */
    crewBubbleMore() {
      const s = this.crewBubbleScroller();
      return !!s && s.scrollTop + s.clientHeight < s.scrollHeight - 2;
    },
    /** E with words below the edge: on by a page (the last line read stays in view). True if it moved on. The
        read panel never takes the mouse (it is locked to the view), so E is the way through a long bubble. */
    crewBubblePage() {
      const s = this.crewBubbleScroller();
      const t = this.talk;
      if (!s || s.scrollTop + s.clientHeight >= s.scrollHeight - 2) return false;
      const cs = root.getComputedStyle ? root.getComputedStyle(s) : null;
      const line = (cs && (parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.45)) || 24;
      const top = Math.min(s.scrollHeight - s.clientHeight, s.scrollTop + Math.max(line, s.clientHeight - line * 1.2));
      s.scrollTop = top;
      t.more = top + s.clientHeight < s.scrollHeight - 2;
      t.moreT = this.time + 0.25;
      return true;
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
