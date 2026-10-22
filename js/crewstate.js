/* The crew's save state, mixed into ZSR.State: trust, talk, requests (story quests and errands),
   rewards and perks, reports of their work, the dog, and the crew's words at the reading level.
   Facts: js/story-crew.js and js/story-quests.js. Design: docs/CREW.md. Loaded after js/state.js.
   Every fact is read when it is needed, never at load, so an empty roster or quest list is fine. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});
  const W = () => ZSR.WORLD || {};

  /* ---------- The facts, safe to read while they are still empty ---------- */
  // the contract's values (docs/CREW.md), used only for a rule CREW_RULES leaves out
  const DEFAULT_RULES = { stars: [3, 8, 15, 24, 35], gain: { talk: 1, errand: 3, quest: 5 }, loss: { hurt: 3, late: 2, giveUp: 3 }, hurtCost: { meds: 1, food: 2 }, healAmount: 40, lookoutSeconds: 15, requestsPerCrew: 1, dogFoodEvery: 2 };
  function rules() {
    const R = W().CREW_RULES || {};
    const out = Object.assign({}, DEFAULT_RULES, R);
    ["gain", "loss", "hurtCost"].forEach((k) => (out[k] = Object.assign({}, DEFAULT_RULES[k], R[k])));
    if (!Array.isArray(out.stars)) out.stars = [];
    return out;
  }
  const roster = () => W().CREW || {};
  /* The crossover universes (docs/UNIVERSES.md): a topic or quest with `universe` is told or offered only while that
     universe is on (State.universe, js/xoverstate.js; without it, as in the tests that load no crossover state, off).
     A crossover quest is its giver's own track: one open on it beside one open on the base track. */
  const universeOn = () => (ZSR.State && ZSR.State.universe ? ZSR.State.universe() : "off");
  const inUniverse = (x) => !!x && (!x.universe || x.universe === universeOn());
  const trackOf = (q) => (q && q.universe) || null;
  const allQuests = () => (Array.isArray(W().QUESTS) ? W().QUESTS : []);
  const questList = () => allQuests().filter(inUniverse);
  // any quest by id, whatever universe is on: a save keeps the state of every quest it ever opened
  const questDef = (qid) => allQuests().find((q) => q.id === qid) || null;
  const errandsOf = (id) => ((W().ERRANDS || {})[id] || []).filter(Boolean);
  function errandDef(eid) {
    for (const list of Object.values(W().ERRANDS || {})) {
      const e = (list || []).find((x) => x && x.id === eid);
      if (e) return e;
    }
    return null;
  }
  const talkOf = (id) => (W().CREW_TALK || {})[id] || {};
  // an item's label ("Box of nails": an errand's {item}, "2 of these: Box of nails"), and the item counted in running
  // text ("2 boxes of nails": rewards and {needs}; ZSR.itemCount in js/state.js, from ITEMS one / many)
  const itemName = (k) => (W().ITEMS && W().ITEMS[k] ? W().ITEMS[k].name : String(k));
  const itemCount = (k, n) => (ZSR.itemCount ? ZSR.itemCount(k, n) : n + " " + itemName(k));
  const roomName = (k) => (W().BASE_ROOMS && W().BASE_ROOMS[k] ? W().BASE_ROOMS[k].name : String(k));
  /** "a", "a and b", "a, b and c". */
  function listWords(parts) {
    return parts.length < 2 ? parts.join("") : parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
  }
  /** Every hurt since the last talk, summed in words (the hurt report's {cost}): each entry is a crewHurt word ("a
      medical kit", "2 medical kits", "2 food", "nothing"); the kits are counted with the ITEMS forms, then the food:
      "a medical kit and 2 food", "2 medical kits and 3 food". "nothing" only when every hurt cost nothing; a word not of these kinds is kept. */
  function hurtCostWords(list) {
    let meds = 0;
    let food = 0;
    const other = [];
    list.forEach((w) => {
      const t = String(w).trim();
      let m;
      if ((m = /^(a|an|\d+) medical kits?$/i.exec(t))) meds += /^\d+$/.test(m[1]) ? Number(m[1]) : 1;
      else if ((m = /^(\d+) food$/i.exec(t))) food += Number(m[1]);
      else if (t.toLowerCase() !== "nothing" && !other.includes(t)) other.push(t);
    });
    // one kit reads as crewHurt says it ("a medical kit"); more are counted ("2 medical kits")
    const one = W().ITEMS && W().ITEMS.meds && W().ITEMS.meds.one;
    const kits = meds === 1 && one ? (/^[aeiou]/i.test(one) ? "an " : "a ") + one : itemCount("meds", meds);
    const parts = (meds ? [kits] : []).concat(food ? [food + " food"] : [], other);
    return parts.length ? listWords(parts) : "nothing";
  }
  /** A reward in plain words: "30 scrap", "30 scrap, 2 pieces of lumber and 1 medical kit", as the briefs promise it. */
  function rewardWords(r) {
    r = r || {};
    const parts = [];
    if (r.scrap) parts.push(r.scrap + " scrap");
    Object.entries(r.items || {}).forEach(([k, n]) => n && parts.push(itemCount(k, n)));
    if (r.kits) parts.push(r.kits === 1 ? "1 medical kit" : r.kits + " medical kits");
    if (r.crowbars) parts.push(r.crowbars === 1 ? "1 crowbar" : r.crowbars + " crowbars");
    // trap names are singular labels ("Spike trap"): in running text "1 spike trap", "2 spike traps"
    Object.entries(r.traps || {}).forEach(([k, n]) => {
      const name = W().TRAPS && W().TRAPS[k] ? W().TRAPS[k].name : k;
      if (n) parts.push(n + " " + name.charAt(0).toLowerCase() + name.slice(1) + (n === 1 ? "" : "s"));
    });
    return listWords(parts);
  }
  /** A number in [0, 1) from this save's seed and a key: the same every time it is asked (FNV-1a, then mixed). */
  function roll(seed, key) {
    const s = String(seed) + "|" + key;
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }

  // the perks a story quest can give (docs/CREW.md "Perks"), with their value when none is active
  const PERKS = { foodPerDay: 0, medsPerDay: 0, footHp: 0, vanHp: 0, scrapPerDay: 0, crewRepairFree: false, lookoutEarly: 0, healAmount: 0, crowbarCost: null };
  const DOG_NAME_MAX = 14; // letters in the dog's name (the card's text box and the HUD)
  const CRACKED = 0.5; // a fence segment below this share of its health is cracked (as js/yard.js yardFacing; a yard build: State.buildDmg)
  // days Pip looks ahead for the town's next walker (SETTINGS.walkersPerLocation). SCALE: a slower walker curve
  // (one more every 60 days or more) needs this longer, or Pip's walkers tip goes quiet
  const WALKER_LOOKAHEAD = 60;
  // a repair report and its words when the fix cost no scrap (CREW_REPORTS keys), in the order they are told
  const FREE_REPORT = { fence: "fenceFree", cabin: "cabinFree", builds: "buildsFree" };
  const CREW_FIELDS = ["trust", "talkDay", "talks", "heard", "mood", "quests", "errand", "errandNext", "report", "dog", "read", "ledger"]; // save.crew

  /* ---------- Tips: the one piece of useful live information in every talk ----------
     A rule returns the placeholders for the words when its tip applies, else null. Only tips the crew member
     has a CREW_TIPS entry for count. Read literally, "first that applies" in docs/CREW.md would hide every
     tip listed after an always-true one (June's ready, build and heal; Pip's radio), so:
     - URGENT tips (in this order) win outright: June patching you up, the pantry empty, Pip's wave call;
     - otherwise the REGULAR tips that apply take turns, one further on each talk (save.crew.talks), so the
       crew says something new each time (June's food always applies, so she always has one; Pip's walkers
       tip goes quiet once every known building is at the walker cap, about day 33, and the radio tip is
       told once, so Pip needs the fallback below);
     - FALLBACK only when nothing else applies, the first of the speaker's in list order: Tomas's "fine" (all
       is well), Pip's "full" (every known building is as full of walkers as it gets).
     `ctx` is what only the yard knows: { heal: hp June gives back now, wave: { size, sides } (the next
     wave's words, in the calm), holes, cracks, broken (live counts; else they are read from the save), wrecked
     (the wrecked builds' room ids; else State.wreckedRooms) }.
     A tip told once (lanky, armored, screamer, wreckers) is told until its words have been read (seeCrewTalk keeps
     "tip:<crew>:<tip>"); the walker kinds' tips wait for the first one met (save.met, js/interior.js).
     A new tip id needs a rule here and a place in one of the three lists. */
  /** A tip told once, after the player first met that kind of walker (save.met[type]). */
  const metOnce = (S, id, tip, type) => ((S.save.met || {})[type] != null && !S.crewSave().read.includes("tip:" + id + ":" + tip) ? {} : null);
  /** The damaged yard builds { wrecked, cracked } (room ids): each the yard's live list (ctx.wrecked, ctx.cracked),
      else the save's (State.buildDamage). */
  const damageOf = (S, ctx) => {
    const live = (k) => (ctx && Array.isArray(ctx[k]) ? ctx[k] : null);
    const save = live("wrecked") && live("cracked") ? null : S.buildDamage();
    return { wrecked: live("wrecked") || save.wrecked, cracked: live("cracked") || save.cracked };
  };
  /** Any yard build wrecked, or cracked: the game says such a build needs fixing (the lot panel, the computer's Fix
      all), so Tomas's "nothing needs fixing" is not said while one is. */
  const buildsHurt = (S, ctx) => {
    const d = damageOf(S, ctx);
    return d.wrecked.length + d.cracked.length > 0;
  };
  const TIP_RULES = {
    // June's patch-up: only with the heal job unlocked (CREW[id].jobs), whatever the yard passes
    heal: (S, ctx, id) => (ctx.heal > 0 && S.crewJobs(id).includes("heal") ? { hp: Math.round(ctx.heal) } : null),
    hungry: (S) => (S.save.food <= 0 ? {} : null),
    // Pip's call: only with the lookout job; "no wave" comes with no sides, so {sides} reads "nowhere"
    wave: (S, ctx, id) => (ctx.wave && ctx.wave.size && S.crewJobs(id).includes("lookout") ? { size: ctx.wave.size, sides: ctx.wave.sides || "nowhere" } : null),
    van: (S) => {
      const max = S.vanMaxHp();
      return S.save.vanHp < max && !S.effects().freeRepair ? { hp: Math.floor(S.save.vanHp), max, cost: S.repairCost() } : null;
    },
    vanFree: (S) => {
      const max = S.vanMaxHp();
      return S.save.vanHp < max && S.effects().freeRepair ? { hp: Math.floor(S.save.vanHp), max } : null;
    },
    fence: (S, ctx) => {
      const f = S.crewFenceDamage(ctx);
      return f.holes + f.cracks > 0 ? f : null;
    },
    cabin: (S, ctx) => {
      const broken = ctx.broken != null ? ctx.broken : S.crewCabinBroken();
      return broken > 0 ? { broken } : null;
    },
    ready: (S) => {
      const nb = S.nextBuild();
      return nb && nb.ready ? { room: roomName(nb.room) } : null;
    },
    build: (S) => {
      const nb = S.nextBuild();
      if (!nb || nb.ready) return null;
      const needs = Object.entries(nb.missing || {}).map(([k, n]) => itemCount(k, n)).concat(nb.scrap ? [nb.scrap + " scrap"] : []);
      return needs.length ? { room: roomName(nb.room), needs: listWords(needs) } : null;
    },
    keys: (S) => {
      const n = S.crewKeysUnused();
      return n > 0 ? { keys: n === 1 ? "1 stash key" : n + " stash keys" } : null;
    },
    crowbar: (S) => (S.crowbarsLeft() < 1 ? {} : null),
    // the Radio room built: told until its words have been read once (seeCrewTalk keeps the key), so a fixed
    // line does not come back every other talk for the rest of the game
    // (a wrecked Radio tower hears nothing: roomLevel is 0 until it is fixed)
    radio: (S, ctx, id) => ((S.roomLevel ? S.roomLevel("radio") : S.save.rooms.radio || 0) > 0 && !S.crewSave().read.includes("tip:" + id + ":radio") ? {} : null),
    food: (S) => {
      const per = (W().SETTINGS && W().SETTINGS.foodPerTrip) || 1;
      const c = S.crewSave();
      const R = rules();
      const dog = !!(c.dog && c.dog.home) && R.dogFoodEvery > 0;
      let left = Math.max(0, S.save.food), day = S.save.day || 1, fed = (c.dog && c.dog.fed) || 0, days = 0;
      // trips the pantry covers: each eats foodPerTrip, and the dog eats 1 every dogFoodEvery days (crewDayPassed)
      while (left > 0) {
        left -= per;
        day += 1;
        if (dog && day - fed >= R.dogFoodEvery) { left -= 1; fed = day; }
        days += 1;
      }
      return { food: S.save.food, days };
    },
    // the van, the fence and the cabin are fine (the regular tips say otherwise first), and so is every build
    fine: (S, ctx) => (buildsHurt(S, ctx) ? null : {}),
    walkers: (S) => {
      const days = S.crewWalkerDays();
      return days ? { days } : null;
    },
    // the walkers tip has nothing left to count: every known building is at its walker cap (or none is known)
    full: (S) => (S.crewWalkerDays() ? null : {}),
    // the walker kinds, told once each after the first one met (save.met): Tomas the lanky and the armored, Pip the screamer
    lanky: (S, ctx, id) => metOnce(S, id, "lanky", "lanky"),
    armored: (S, ctx, id) => metOnce(S, id, "armored", "armored"),
    screamer: (S, ctx, id) => metOnce(S, id, "screamer", "screamer"),
    // the wreckers, told once, as soon as a yard build stands (something for them to wreck)
    wreckers: (S, ctx, id) => (Object.keys((W().YARD && W().YARD.plots) || {}).some((r) => (S.save.rooms[r] || 0) > 0) && !S.crewSave().read.includes("tip:" + id + ":wreckers") ? {} : null),
    // while a build is wrecked: {rooms} names them ("Garden and Well"), {cost} the scrap to fix it all yourself: the
    // office computer's "Fix all" price (State.buildFixAll: the cracked builds too), never a second count of it
    wrecked: (S, ctx) => {
      const dmg = damageOf(S, ctx);
      if (!dmg.wrecked.length) return null;
      return { rooms: listWords(dmg.wrecked.map(roomName)), cost: S.buildFixAll(dmg).cost };
    },
  };
  const URGENT = ["heal", "hungry", "wave", "lanky", "armored", "screamer", "wreckers"];
  const REGULAR = ["van", "vanFree", "fence", "wrecked", "cabin", "ready", "build", "keys", "crowbar", "food", "walkers", "radio"];
  const FALLBACK = ["fine", "full"];

  const CrewState = {
    /* ---------- The save's crew field ---------- */
    crewIds() {
      return Object.keys(roster());
    },
    /** The fresh `crew` object for freshSave: one entry per CREW id in every per-crew map. */
    crewFresh() {
      const per = (v) => {
        const o = {};
        this.crewIds().forEach((id) => (o[id] = typeof v === "function" ? v() : v));
        return o;
      };
      return {
        trust: per(0), // points
        talkDay: per(0), // the last day a talk earned trust
        talks: per(0), // talks so far (the tips take turns)
        heard: [], // topic ids told (a story quest's id once its payoff topic is told)
        mood: per(0), // the next mood line
        quests: {}, // quest id -> { state: "active" | "found" | "done", day, doneDay }
        // the open errand: { id, item, count, have, day, due }. due = the day it was accepted + its days: come home
        // on that day without it filled and it is dropped, so "within 4 days" is 4 trips and never reads "0 days"
        errand: per(null),
        errandNext: per(0), // which errand comes next (counts up; the list wraps)
        report: per(() => ({})), // what they did since you last talked
        dog: { home: false, name: "", fed: 0 }, // fed: the last day the dog ate
        // crew text keys whose words were counted (seeCrewTalk). SCALE: one short key per crew text ever read
        // (topics, moods, quest and errand texts); at many hundreds of texts, pack it like the explored maps
        read: [],
        // story quests handed in since the last day page: June writes their ledger lines on the next one
        // (crewLedgerDrain, from returnHome), once the giver has the object, never on the day it only came home
        ledger: [],
      };
    },
    /** Fill a save's `crew`: an old save without one gets it whole; a crew id added later gets its fields. */
    crewUpgrade(s) {
      if (!s) return s;
      const fresh = this.crewFresh();
      if (!s.crew || typeof s.crew !== "object") {
        s.crew = fresh;
        return s;
      }
      const c = s.crew;
      Object.keys(fresh).forEach((k) => {
        if (c[k] == null || typeof c[k] !== "object" || Array.isArray(c[k]) !== Array.isArray(fresh[k])) c[k] = fresh[k];
      });
      this.crewIds().forEach((id) => {
        ["trust", "talkDay", "talks", "mood", "errandNext"].forEach((k) => {
          if (typeof c[k][id] !== "number" || !isFinite(c[k][id])) c[k][id] = 0;
        });
        if (c.errand[id] === undefined) c.errand[id] = null;
        if (!c.report[id] || typeof c.report[id] !== "object") c.report[id] = {};
      });
      Object.keys(fresh.dog).forEach((k) => {
        if (c.dog[k] == null) c.dog[k] = fresh.dog[k];
      });
      return s;
    },
    /** The save's crew field (filled in first if anything is missing). */
    crewSave() {
      const s = this.save;
      if (!s.crew || CREW_FIELDS.some((k) => s.crew[k] == null)) this.crewUpgrade(s);
      return s.crew;
    },

    /* ---------- Trust and stars ---------- */
    trust(id) {
      return this.crewSave().trust[id] || 0;
    },
    /** Stars 0..CREW_RULES.stars.length: one for every threshold the trust has reached. */
    stars(id) {
      const t = this.trust(id);
      return rules().stars.filter((n) => t >= n).length;
    },
    /** Add (or, with a negative n, take) trust: never below 0, never above the top star's points (the last
        CREW_RULES.stars entry), so a loss at five stars always shows as four. Points an older save holds above
        the top count as the top before the change, so its first loss shows too. Returns the new points. */
    addTrust(id, n) {
      const c = this.crewSave();
      const stars = rules().stars;
      const top = stars.length ? stars[stars.length - 1] : Infinity;
      c.trust[id] = Math.max(0, Math.min(top, Math.min(top, c.trust[id] || 0) + (n || 0)));
      return c.trust[id];
    },
    /** A talk (call it once each time the bubble opens, before crewTip and offer, so both stay the same while
        it is open): counts the talk (the tips take turns); the first one each day earns trust (true). */
    crewTalk(id) {
      const c = this.crewSave();
      c.talks[id] = (c.talks[id] || 0) + 1;
      if (c.talkDay[id] === this.save.day) return false;
      c.talkDay[id] = this.save.day;
      this.addTrust(id, rules().gain.talk);
      return true;
    },

    /* ---------- What they talk about ---------- */
    /** Does a `when` hold (every key given)? `id`: whose stars count (else the best of the crew). */
    crewWhen(when, id) {
      if (!when) return true;
      const s = this.save;
      if (when.day != null && s.day < when.day) return false;
      if (when.stars != null) {
        const st = id ? this.stars(id) : Math.max(0, ...this.crewIds().map((i) => this.stars(i)));
        if (st < when.stars) return false;
      }
      if (when.quest != null && this.questState(when.quest) !== "done") return false;
      if (when.note != null && !this.noteRead(when.note)) return false;
      // a room's topic waits while its build is wrecked (roomLevel 0): its words give the room's bonus as working
      // ("the van comes home fixed", "a broadcast each day"), which a wrecked build does not give until it is fixed
      if (when.room != null && (this.roomLevel ? this.roomLevel(when.room) : s.rooms[when.room] || 0) < (when.level != null ? when.level : 1)) return false;
      if (when.dog != null && !!when.dog !== this.dogHome()) return false;
      return true;
    },
    /** The next thing to tell: a handed-in story quest's payoff first ({ id: quest id, quest }), then the
        first untold topic whose `when` holds, else the next mood in turn ({ id, mood: true }); null if none.
        ZSR.crewText("talk", id) gives the words for all three. */
    nextTopic(id) {
      const c = this.crewSave();
      const after = questList().find((q) => q.giver === id && this.questState(q.id) === "done" && !c.heard.includes(q.id) && ZSR.crewText("quest", q.id, "after"));
      if (after) return { id: after.id, mood: false, quest: after.id };
      const T = talkOf(id);
      const topic = (T.topics || []).find((t) => t && inUniverse(t) && !c.heard.includes(t.id) && this.crewWhen(t.when, id));
      if (topic) return { id: topic.id, mood: false };
      const moods = (T.moods || []).filter(Boolean);
      if (!moods.length) return null;
      return { id: moods[(c.mood[id] || 0) % moods.length].id, mood: true };
    },
    /** Record it told: a topic (or quest payoff) is heard; a mood moves the turn on past it. */
    markTopic(id, topicId) {
      const c = this.crewSave();
      const moods = (talkOf(id).moods || []).filter(Boolean);
      const mi = moods.findIndex((m) => m.id === topicId);
      if (mi >= 0) c.mood[id] = (mi + 1) % moods.length;
      else if (topicId && !c.heard.includes(topicId)) c.heard.push(topicId);
      return true;
    },
    /** Every tip of this crew member that applies now, by class: { urgent, regular, fallback }, each a list
        of { tip, vars } in rule order. */
    crewTips(id, ctx) {
      const tips = (W().CREW_TIPS || {})[id] || {};
      const cx = ctx || {};
      const pick = (list) =>
        list.reduce((out, tip) => {
          const vars = tips[tip] ? TIP_RULES[tip](this, cx, id) : null;
          if (vars) out.push({ tip, vars });
          return out;
        }, []);
      return { urgent: pick(URGENT), regular: pick(REGULAR), fallback: pick(FALLBACK) };
    },
    /** The tip to tell now: { tip, vars } (CREW_TIPS[id][tip] and its placeholders), or null. The same until
        the next crewTalk (the regular tips take turns by the talk count). */
    crewTip(id, ctx) {
      const t = this.crewTips(id, ctx);
      if (t.urgent.length) return t.urgent[0];
      if (t.regular.length) return t.regular[(this.crewSave().talks[id] || 0) % t.regular.length];
      return t.fallback[0] || null;
    },
    /** Fence damage as the save holds it (or the yard's live counts in ctx): { holes, cracks }. */
    crewFenceDamage(ctx) {
      if (ctx && ctx.holes != null) return { holes: ctx.holes, cracks: ctx.cracks || 0 };
      const D = W().DEFENSE || {};
      const hp = (D.fenceHp && (D.fenceHp[this.save.rooms.walls || 0] || D.fenceHp[0])) || 1;
      let holes = 0;
      let cracks = 0;
      Object.values(this.save.fence || {}).forEach((v) => {
        if (v <= 0) holes++;
        else if (v < hp * CRACKED) cracks++;
      });
      return { holes, cracks };
    },
    /** The cabin's broken doors and windows as the save holds them. */
    crewCabinBroken() {
      return Object.values((this.save.house && this.save.house.hp) || {}).filter((v) => v <= 0).length;
    },
    /** Stash keys held, whole, whose stash is still shut. */
    crewKeysUnused() {
      return this.keysHeld().filter((k) => !k.broken && k.opens && !this.locState(k.opens).stashOpened).length;
    },
    /** Days until the known buildings that are not full yet get one more walker each; 0 once every known
        building is at the cap of SETTINGS.walkersPerLocation (or none is known), so Pip's walkers tip is skipped
        and its words stay true (Pip's fallback tip "full" says so instead). Buildings only: River Landing (outdoor) and the base have no walkers. */
    crewWalkerDays() {
      const SET = W().SETTINGS || {};
      if (!SET.walkersPerLocation) return 0;
      const day = this.save.day;
      const dangers = new Set((W().LOCATIONS || []).filter((l) => l.danger > 0 && !l.outdoor && l.type !== "base" && this.isKnown(l.id)).map((l) => l.danger));
      let best = 0;
      dangers.forEach((d) => {
        const now = SET.walkersPerLocation(d, day);
        // a building whose count does not rise within the lookahead is at the cap
        for (let k = 1; k <= WALKER_LOOKAHEAD && (!best || k < best); k++) {
          if (SET.walkersPerLocation(d, day + k) > now) {
            best = k;
            break;
          }
        }
      });
      return best;
    },

    /* ---------- Jobs and perks ---------- */
    /** Job keys (fence, builds, cabin, heal, lookout) this crew member's stars unlock. */
    crewJobs(id) {
      const st = this.stars(id);
      return ((roster()[id] || {}).jobs || []).filter((j) => j && st >= (j.stars || 0)).map((j) => j.job);
    },
    /** Perk totals from the story quests handed in. Numbers add up; crewRepairFree is any; crowbarCost the lowest. */
    crewFx() {
      const fx = Object.assign({}, PERKS);
      const c = this.save && this.save.crew;
      if (!c || !c.quests) return fx;
      questList().forEach((q) => {
        const perk = q.reward && q.reward.perk;
        const st = c.quests[q.id];
        if (!perk || !st || st.state !== "done") return;
        Object.entries(perk).forEach(([k, v]) => {
          if (!(k in PERKS)) return;
          if (k === "crowbarCost") fx[k] = fx[k] == null ? v : Math.min(fx[k], v);
          else if (typeof v === "boolean") fx[k] = fx[k] || v;
          else if (typeof v === "number") fx[k] += v;
        });
      });
      return fx;
    },
    /** How much June's patch-up gives back (CREW_RULES.healAmount plus the perk). */
    crewHealAmount() {
      return (rules().healAmount || 0) + this.crewFx().healAmount;
    },
    /** How long before a wave Pip calls it (CREW_RULES.lookoutSeconds plus the perk). */
    crewLookoutSeconds() {
      return (rules().lookoutSeconds || 0) + this.crewFx().lookoutEarly;
    },
    /** Scrap one crew repair costs: "fence" (a hole or crack), "builds" (a wrecked room build: a cracked one still
        works; the player braces it) or "cabin" (a door or window); 0 with the perk. */
    crewRepairCost(kind) {
      if (this.crewFx().crewRepairFree) return 0;
      const SET = W().SETTINGS || {};
      return (kind === "cabin" ? SET.houseRepairScrap : kind === "builds" ? SET.buildRepairScrap : SET.fenceRepairScrap) || 0;
    },
    /** Pay for one crew repair from the base's scrap, never below 0. Returns the scrap paid. */
    crewRepairPay(kind) {
      const paid = Math.max(0, Math.min(this.crewRepairCost(kind), this.save.scrap || 0));
      this.save.scrap -= paid;
      return paid;
    },

    /* ---------- Requests: story quests and errands ---------- */
    questDef(qid) {
      return questDef(qid);
    },
    errandDef(eid) {
      return errandDef(eid);
    },
    /** "active" | "found" | "done", or null (not accepted). */
    questState(qid) {
      const st = this.crewSave().quests[qid];
      return st ? st.state : null;
    },
    /** This giver's story quests in order: [{ def, st }] (st null until accepted). For the backpack. */
    crewQuests(id) {
      const c = this.crewSave();
      return questList().filter((q) => q.giver === id).map((q) => ({ def: q, st: c.quests[q.id] || null }));
    },
    /** Every open request of this crew member: [{ kind: "quest" | "errand", def, st }], story quests first. A crew
        member can have one open story quest and one open errand at once (CREW_RULES.requestsPerCrew of each kind). */
    requests(id) {
      const c = this.crewSave();
      const out = [];
      questList().forEach((q) => {
        const st = q.giver === id && c.quests[q.id];
        if (st && (st.state === "active" || st.state === "found")) out.push({ kind: "quest", def: q, st });
      });
      const e = c.errand[id];
      if (e) out.push({ kind: "errand", def: errandDef(e.id) || { id: e.id, item: e.item, reward: {} }, st: e });
      return out;
    },
    /** The open request to show (one ready to hand in first, a story quest before an errand), or null. */
    request(id) {
      const list = this.requests(id);
      return list.find((r) => this.requestReady(r)) || list[0] || null;
    },
    /** Is this request filled: the story object at home, or the errand's count brought home and in storage. */
    requestReady(r) {
      if (!r || !r.st) return false;
      if (r.kind === "quest") return r.st.state === "found";
      return (r.st.have || 0) >= r.st.count && ((this.save.inventory || {})[r.st.item] || 0) >= r.st.count;
    },
    handInReady(id) {
      return this.requests(id).some((r) => this.requestReady(r));
    },
    /** The giver's next story quest in order on a track (null: the base quests; a universe id: that universe's
        own), whatever its gates: null while the one before is open, or when all are done. */
    nextStoryQuest(id, track) {
      const c = this.crewSave();
      for (const q of questList()) {
        if (q.giver !== id || trackOf(q) !== (track || null)) continue;
        const st = c.quests[q.id];
        if (!st) return q;
        if (st.state !== "done") return null;
      }
      return null;
    },
    /** How many items this errand asks for if offered today: rolled from the save's seed, the errand and the day
        (never Math.random), so it stays the same while the bubble and the card are open; then capped at what the
        known places' shelves can give on the trips it allows (crewShelfSupply), so every errand asked can be
        filled, even the day after you emptied the only shelf that stocks it. At least 1: an errand's days are at
        least SETTINGS.restockDays, so any shelf comes back once in time. The same all day (the shelves' taken
        days change only when a day passes). */
    errandCount(def) {
      const range = Array.isArray(def.count) ? def.count : [def.count || 1, def.count || 1];
      const lo = Math.max(1, range[0] || 1);
      const hi = Math.max(lo, range[1] || lo);
      const rolled = lo + Math.floor(roll(this.save.lockSeed || 0, def.id + "|" + this.save.day) * (hi - lo + 1));
      return Math.max(1, Math.min(rolled, this.crewErrandSpare(def)));
    },
    /** The shelf pickups this errand could have if accepted today: crewShelfSupply less what the open errands for
        the same item still need (they came first and share the cargo, earliest due first: crewTripHome). Below 1,
        the errand is passed over in the turn (crewErrandTurn), so one asked can always be filled. */
    crewErrandSpare(def) {
      const c = this.crewSave();
      const owed = Object.values(c.errand).reduce((n, e) => n + (e && e.item === def.item ? Math.max(0, e.count - (e.have || 0)) : 0), 0);
      return this.crewShelfSupply(def.item, def.days || 1) - owed;
    },
    /** How many of this item the known places' shelves can give on the trips from today to today + days - 1
        (an errand accepted today with `days`: the trip that comes home on its due day is the last that counts).
        Each shelf spot (LOCATIONS items, spot key "i" + index, as js/building.js keys them) gives one now if it is
        back (SETTINGS.restockDays after it was taken), then one every restockDays. Caches and stashes never refill,
        so they do not count. Read from the save, never this trip's overlay. */
    crewShelfSupply(item, days) {
      const s = this.save;
      const restock = Math.max(1, (W().SETTINGS && W().SETTINGS.restockDays) || 1);
      const today = s.day;
      const last = today + Math.max(1, days || 1) - 1;
      let n = 0;
      (W().LOCATIONS || []).forEach((l) => {
        if (!this.isKnown(l.id)) return;
        const taken = (s.loc && s.loc[l.id] && s.loc[l.id].taken) || {};
        (l.items || []).forEach((k, i) => {
          if (k !== item) return;
          const when = taken["i" + i];
          const first = when == null ? today : Math.max(today, when + restock);
          if (first <= last) n += 1 + Math.floor((last - first) / restock);
        });
      });
      return n;
    },
    /** What they would ask now: { kind: "quest", def } or { kind: "errand", def, count }, or null.
        The story quest when one can be offered: in order, once the one before is done, its `when` holds, its
        building is known, and fewer than CREW_RULES.requestsPerCrew of their story quests are open. Else an
        errand (errandOffer). Errands never hold back a story quest: one can be open while a story quest is
        offered, accepted or open, so a crew member can have one of each. */
    offer(id) {
      if (!roster()[id]) return null;
      // god mode (js/god.js): a story quest picked in the menu is offered now, whatever its gates and order
      const forced = this.god && this.god.offer[id] && questDef(this.god.offer[id]);
      if (forced && forced.giver === id && !this.questState(forced.id)) return { kind: "quest", def: forced };
      // the base track first, then the universe's own (each holds its own open quest: requestsPerCrew per track)
      const tracks = [null].concat(universeOn() !== "off" ? [universeOn()] : []);
      for (const tr of tracks) {
        const q = this.nextStoryQuest(id, tr);
        const open = this.requests(id).filter((r) => r.kind === "quest" && trackOf(r.def) === tr).length;
        if (q && open < this.crewPerKind() && this.crewWhen(q.when, id) && this.isKnown(q.at)) return { kind: "quest", def: q };
      }
      return this.errandOffer(id);
    },
    /** Open requests of each kind a crew member may have (CREW_RULES.requestsPerCrew, at least 1). */
    crewPerKind() {
      return Math.max(1, Math.floor(rules().requestsPerCrew) || 1);
    },
    /** The errand they would ask for now, { kind: "errand", def, count }, or null: only once their first story
        quest is handed in (a crew member with no story quests asks from the start), only while no errand of
        theirs is open, and only one whose item a known place's shelves stock (with a pickup in its days that the
        open errands for the same item leave over). Errands come in turn
        (save.crew.errandNext); one whose item no known place stocks is passed over for the next that is (the turn
        moves past both when that one is accepted, so it comes round again later). The same all day: the count is
        rolled from the seed and the day. */
    errandOffer(id) {
      const c = this.crewSave();
      // SCALE: the save holds one open errand per crew member (crew.errand[id]); requestsPerCrew above 1 would need
      // crew.errand[id] to become a list (with an upgrade for old saves)
      if (c.errand[id] || !this.crewErrandsOpen(id)) return null;
      const def = this.crewErrandTurn(id).def;
      return def ? { kind: "errand", def, count: this.errandCount(def) } : null;
    },
    /** Errands start once this crew member's first story quest is handed in (at once if they give none). */
    crewErrandsOpen(id) {
      const first = questList().find((q) => q.giver === id && !trackOf(q));
      return !first || this.questState(first.id) === "done";
    },
    /** The next errand in turn whose item a known place stocks, with a shelf pickup in its days that no other
        open errand needs (crewErrandSpare): { def, skip } (skip: how many in the turn were passed over), or
        { def: null } when none is. */
    crewErrandTurn(id) {
      const list = errandsOf(id);
      const at = this.crewSave().errandNext[id] || 0;
      for (let k = 0; k < list.length; k++) {
        const def = list[(at + k) % list.length];
        if (this.crewItemStocked(def.item) && this.crewErrandSpare(def) >= 1) return { def, skip: k };
      }
      return { def: null, skip: 0 };
    },
    /** Do the shelves of a known place hold this item (LOCATIONS items: they come back, SETTINGS.restockDays)?
        Caches and stashes never refill, so they do not count. */
    crewItemStocked(item) {
      return (W().LOCATIONS || []).some((l) => (l.items || []).includes(item) && this.isKnown(l.id));
    },
    /** Open the request on offer (it must still be what offer(id) gives). True when opened. */
    accept(id, offer) {
      const now = this.offer(id);
      const o = offer || now;
      if (!now || !o || !o.def || now.kind !== o.kind || now.def.id !== o.def.id) return false;
      const c = this.crewSave();
      const day = this.save.day;
      if (now.kind === "quest") c.quests[now.def.id] = { state: "active", day, doneDay: null };
      else {
        // the turn moves on past this errand (and past any passed over for want of a known shelf to fill it)
        const skip = this.crewErrandTurn(id).skip;
        c.errand[id] = { id: now.def.id, item: now.def.item, count: now.count, have: 0, day, due: day + (now.def.days || 1) };
        c.errandNext[id] = (c.errandNext[id] || 0) + skip + 1;
      }
      return true;
    },
    /** Drop an open request, costing trust: the one with this def id, or without one, the one you have least to
        lose by: a request still being worked on before one filled and waiting, an errand before a story quest.
        A story object already home is handed in, never given up. A dropped story quest is offered again later. */
    giveUp(id, reqId) {
      const rank = (x) => (this.requestReady(x) ? 2 : 0) + (x.kind === "quest" ? 1 : 0);
      const r = this.requests(id)
        .filter((x) => (!reqId || x.def.id === reqId) && !(x.kind === "quest" && x.st.state === "found"))
        .sort((a, b) => rank(a) - rank(b))[0];
      if (!r) return false;
      const c = this.crewSave();
      if (r.kind === "quest") {
        delete c.quests[r.def.id];
        const t = this.trip;
        if (t) {
          t.quest = (t.quest || []).filter((q) => q !== r.def.id);
          if (t.dog && (t.dogQuest === r.def.id || (!t.dogQuest && r.def.kind === "dog"))) {
            t.dog = false;
            t.dogQuest = null;
          }
        }
      } else c.errand[id] = null;
      this.addTrust(id, -rules().loss.giveUp);
      return true;
    },
    /** Hand in a filled request: pay out, close it, earn trust. Returns { kind, def, reward } or null. reqId (a
        def id) picks which; without it, the one request(id) shows: the first filled one, a story quest first.
        A story quest goes on crew.ledger (its ledger line on the next day page) and a vanHp perk tops up the van. */
    handIn(id, reqId) {
      const r = this.requests(id).find((x) => (!reqId || x.def.id === reqId) && this.requestReady(x));
      if (!r) return null;
      const R = rules();
      const reward = (r.def && r.def.reward) || {};
      if (r.kind === "quest") {
        r.st.state = "done";
        r.st.doneDay = this.save.day;
        this.addTrust(id, R.gain.quest);
        // June's ledger line for it goes on the next day page, now that the giver has it (the dog's too)
        const c = this.crewSave();
        if (!c.ledger.includes(r.def.id)) c.ledger.push(r.def.id);
        // a van health perk raises the van's health with its maximum (as the Walls room and the armor do), so
        // a full van stays full instead of arriving with a repair bill
        const vanHp = reward.perk && reward.perk.vanHp;
        if (typeof vanHp === "number" && vanHp > 0) this.save.vanHp = Math.min(this.vanMaxHp(), (this.save.vanHp || 0) + vanHp);
      } else {
        const inv = this.save.inventory;
        inv[r.st.item] = Math.max(0, (inv[r.st.item] || 0) - r.st.count);
        this.crewSave().errand[id] = null;
        this.addTrust(id, R.gain.errand);
      }
      this.payReward(reward);
      return { kind: r.kind, def: r.def, reward };
    },
    /** A reward into the save: scrap, items to storage (food to the crew's food), kits into storage as medical
        kits, crowbars, traps into stock. A perk is active once its quest is done (handIn tops up the van for vanHp). */
    payReward(reward) {
      const s = this.save;
      const r = reward || {};
      if (r.scrap) s.scrap = (s.scrap || 0) + r.scrap;
      Object.entries(r.items || {}).forEach(([k, n]) => {
        if (k === "food") s.food = (s.food || 0) + n;
        else s.inventory[k] = (s.inventory[k] || 0) + n;
      });
      if (r.kits) s.inventory.meds = (s.inventory.meds || 0) + r.kits;
      if (r.crowbars) s.crowbars = (s.crowbars || 0) + r.crowbars;
      Object.entries(r.traps || {}).forEach(([k, n]) => (s.traps[k] = (s.traps[k] || 0) + n));
    },
    /** The placeholders for a request's or an offer's words: { reward } for a story quest; an errand adds
        { count, item, days } (days: its deadline when offered; once open, the days (trips) left, at least 1, since
        an errand not filled by its day is dropped; once filled, when nothing hangs on the days any more, the
        deadline it was given, so "Read it again" reads as it was asked and never "within 0 days"). */
    requestVars(r) {
      if (!r || !r.def) return {};
      const reward = rewardWords(r.def.reward);
      if (r.kind !== "errand") return { reward };
      const st = r.st;
      let days = r.def.days;
      if (st) {
        const d = (st.have || 0) >= st.count ? st.due - st.day : st.due - this.save.day;
        days = isFinite(d) ? Math.max(1, d) : Math.max(1, r.def.days || 1); // a save missing its days still reads a number
      }
      return { count: st ? st.count : r.count, item: itemName(st ? st.item : r.def.item), days, reward };
    },
    rewardWords(reward) {
      return rewardWords(reward);
    },

    /* ---------- Story objects and the dog on a trip ---------- */
    /** Active story quests whose object (or the dog) waits in this building: not held this trip, not found. */
    questsAt(locId) {
      return questList().filter((q) => q.at === locId && this.questState(q.id) === "active" && !this.questHeld(q.id));
    },
    /** Its object is held (picked up this trip, or the dog following you), or already found or done. */
    questHeld(qid) {
      const st = this.questState(qid);
      if (st === "found" || st === "done") return true;
      const t = this.trip;
      if (!t) return false;
      if ((t.quest || []).includes(qid)) return true;
      const q = questDef(qid);
      return !!(q && q.kind === "dog" && t.dog && (!t.dogQuest || t.dogQuest === qid));
    },
    /** Pick up a story object (this trip only: lost if you die). */
    takeQuestObject(qid) {
      const q = questDef(qid);
      if (!this.trip || !q || q.kind === "dog" || this.questState(qid) !== "active" || this.questHeld(qid)) return false;
      (this.trip.quest = this.trip.quest || []).push(qid);
      return true;
    },
    /** The dog follows you this trip (trip.dog; trip.dogQuest names its quest). qid optional. */
    takeDog(qid) {
      const q = qid ? questDef(qid) : questList().find((x) => x.kind === "dog" && this.questState(x.id) === "active");
      if (!this.trip || !q || q.kind !== "dog" || this.questState(q.id) !== "active" || this.trip.dog) return false;
      this.trip.dog = true;
      this.trip.dogQuest = q.id;
      return true;
    },
    dogHome() {
      return !!(this.save && this.save.crew && this.save.crew.dog && this.save.crew.dog.home);
    },
    dogName() {
      return (this.save && this.save.crew && this.save.crew.dog && this.save.crew.dog.name) || "";
    },
    /** Name the dog: letters, spaces, ' and - only, 1 to 14 characters, trimmed. Returns the name kept, or false. */
    nameDog(name) {
      if (!this.dogHome()) return false;
      // NFC first, so an accent typed as a separate mark ("e" + U+0301) joins its letter instead of being
      // stripped; the length counts characters (code points), so a letter outside the BMP is never cut in half
      const letters = String(name == null ? "" : name)
        .normalize("NFC")
        .replace(/[^\p{L}' -]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
      const clean = Array.from(letters).slice(0, DOG_NAME_MAX).join("").trim();
      if (!/\p{L}/u.test(clean)) return false;
      this.crewSave().dog.name = clean;
      return clean;
    },

    /* ---------- Reports: what they did since you last talked ---------- */
    crewReport(id) {
      return this.crewSave().report[id] || {};
    },
    clearReport(id) {
      this.crewSave().report[id] = {};
    },
    /** Add work to the report. kind: "fence", "builds" or "cabin" (n fixed, scrap paid; a fix that paid nothing
        because it cost nothing, with the crewRepairFree perk, is logged as "fenceFree", "buildsFree" or
        "cabinFree"), or one of those free keys. (June's patch-up is told by her heal tip in the bubble that heals
        you, never as a report.) Returns the report. */
    logWork(id, kind, n, scrap) {
      const c = this.crewSave();
      const r = (c.report[id] = c.report[id] || {});
      const count = n == null ? 1 : n;
      let k = kind;
      if (k in FREE_REPORT && !(scrap > 0) && this.crewRepairCost(k) === 0) k = FREE_REPORT[k];
      r[k] = (r[k] || 0) + count;
      if (scrap > 0) {
        const by = (r.scrapBy = r.scrapBy || {});
        by[k] = (by[k] || 0) + scrap;
        r.scrap = (r.scrap || 0) + scrap;
      }
      return r;
    },
    /** The report as words to say, in order: [{ key, vars }] for ZSR.crewText("report", key) + ZSR.crewFill.
        Fixes that took no scrap are told with the free words, so a report never says "It took 0 scrap". Every
        hurt since the last talk is one item (several waves can pass between talks), its {cost} the sum. */
    crewReportItems(id) {
      const r = this.crewReport(id);
      const by = r.scrapBy || {};
      const out = [];
      Object.keys(FREE_REPORT).forEach((k) => {
        const paid = by[k] || 0;
        const free = (r[FREE_REPORT[k]] || 0) + (paid > 0 ? 0 : r[k] || 0);
        if (paid > 0 && r[k]) out.push({ key: k, vars: { fixed: r[k], scrap: paid } });
        if (free) out.push({ key: FREE_REPORT[k], vars: { fixed: free } });
      });
      const hurt = (Array.isArray(r.hurt) ? r.hurt : []).filter((x) => x != null && x !== "");
      if (hurt.length) out.push({ key: "hurt", vars: { who: ZSR.crewName(id), cost: hurtCostWords(hurt) } });
      if (r.late) out.push({ key: "late", vars: { item: itemName(r.late) } });
      return out;
    },
    /** A raider got among the crew in the shelter: 1 medical kit from storage, else 2 food (never below 0);
        their trust drops and their report says so. Returns the cost word: "a medical kit", or the food it really
        took ("2 food"; "1 food" when only 1 was left; "nothing" when the pantry was already empty, so the report
        reads "It cost the base nothing", never "0 food"), so the report never claims more than was lost. */
    crewHurt(id) {
      const s = this.save;
      const R = rules();
      const meds = R.hurtCost.meds || 1;
      const food = R.hurtCost.food || 0;
      let word;
      if ((s.inventory.meds || 0) >= meds) {
        s.inventory.meds -= meds;
        word = meds === 1 ? "a medical kit" : meds + " medical kits";
      } else {
        const took = Math.max(0, Math.min(food, s.food || 0));
        s.food = Math.max(0, (s.food || 0) - took);
        word = took > 0 ? took + " food" : "nothing";
      }
      this.addTrust(id, -R.loss.hurt);
      const r = (this.crewSave().report[id] = this.crewSave().report[id] || {});
      (r.hurt = r.hurt || []).push(word);
      return word;
    },
    /** Words of a crew text read for the first time count toward words read (once per key). */
    seeCrewTalk(key, words) {
      const c = this.crewSave();
      if (!key || c.read.includes(key)) return false;
      c.read.push(key);
      if (this.trip) this.trip.wordsRead += words || 0;
      else this.save.stats.wordsRead += words || 0;
      return true;
    },

    /* ---------- Home from a trip (called by returnHome in js/state.js) ---------- */
    /** Before the day passes: story objects and the dog brought home become found, and an open errand counts
        the cargo of its item. Returns the quest ids brought home (the day's recap counts them, recap.quests, so a
        day that brought home only one of those is not "empty-handed"; the ledger line waits for the hand-in). */
    crewTripHome(t) {
      const c = this.crewSave();
      const home = [];
      (t.quest || []).forEach((qid) => {
        const st = c.quests[qid];
        if (st && st.state === "active" && !home.includes(qid)) {
          st.state = "found";
          home.push(qid);
        }
      });
      if (t.dog) {
        const q = t.dogQuest ? questDef(t.dogQuest) : questList().find((x) => x.kind === "dog" && this.questState(x.id) === "active");
        const st = q && c.quests[q.id];
        if (st && st.state === "active") {
          st.state = "found";
          home.push(q.id);
          c.dog.home = true;
          c.dog.fed = this.save.day;
        }
      }
      // errands are accepted at home, so all of this trip's cargo came after it. Each item counts once: two
      // crew members asking for the same item share the cargo, the errand due first first (then roster order),
      // never both count it; errandCount left the shelves' pickups for the ones already open
      const left = Object.assign({}, t.cargo);
      const order = this.crewIds().concat(Object.keys(c.errand).filter((id) => !roster()[id]));
      order
        .slice()
        .sort((a, b) => ((c.errand[a] && c.errand[a].due) || 0) - ((c.errand[b] && c.errand[b].due) || 0) || order.indexOf(a) - order.indexOf(b))
        .forEach((id) => {
          const e = c.errand[id];
          if (!e) return;
          const n = Math.min(left[e.item] || 0, Math.max(0, e.count - (e.have || 0)));
          if (n > 0) {
            e.have = (e.have || 0) + n;
            left[e.item] -= n;
          }
        });
      return home;
    },
    /** The story quests handed in since the last day page, for this day page's entry.quests (June's ledger line
        for each): crew.ledger, emptied. One already on an earlier page is left out (a save from before the line
        waited for the hand-in wrote it on the day the object came home). */
    crewLedgerDrain() {
      const c = this.crewSave();
      const list = c.ledger.slice();
      c.ledger = [];
      const written = new Set();
      (this.save.log || []).forEach((e) => (e && Array.isArray(e.quests) ? e.quests : []).forEach((q) => written.add(q)));
      return list.filter((q, i) => q && !written.has(q) && list.indexOf(q) === i);
    },
    /** After the day passes: an errand whose deadline day has come and is not filled is dropped (trust, report
        `late`): accepted on day 1 with 4 days (due 5), the trips of days 1 to 4 count, and the one that brings it
        home on day 5 still fills it (crewTripHome runs first). Filled means its count was brought home in time:
        if some of it was used from storage since (a build, a packed kit, a raid's medical kit), it waits for
        storage to hold the count again and never goes late (the backpack says "Keep N in storage"). The dog eats
        1 food every dogFoodEvery days; the scrapPerDay perk pays. */
    crewDayPassed() {
      const s = this.save;
      const c = this.crewSave();
      const R = rules();
      Object.keys(c.errand).forEach((id) => {
        const e = c.errand[id];
        if (!e || s.day < e.due || (e.have || 0) >= e.count) return;
        c.errand[id] = null;
        this.addTrust(id, -R.loss.late);
        (c.report[id] = c.report[id] || {}).late = e.item;
      });
      if (c.dog.home && R.dogFoodEvery > 0 && s.day - (c.dog.fed || 0) >= R.dogFoodEvery) {
        s.food = Math.max(0, (s.food || 0) - 1);
        c.dog.fed = s.day;
      }
      const fx = this.crewFx();
      if (fx.scrapPerDay) s.scrap += fx.scrapPerDay;
    },
  };
  Object.assign(ZSR.State, CrewState);

  /* ---------- The crew's words at the reading level (T.crew in js/content/levelN-crew.js) ---------- */
  /** A text if it has words (a string, or an entry's text), else null. */
  function words(v) {
    if (typeof v === "string") return v.trim() ? v : null;
    if (v && typeof v === "object" && typeof v.text === "string") return v.text.trim() ? v.text : null;
    return null;
  }
  const factsText = (f) => (Array.isArray(f) ? f.join(" ") : typeof f === "string" ? f : "");
  /** A topic's or mood's facts, and whose they are. */
  function talkFacts(id) {
    const T = W().CREW_TALK || {};
    for (const who of Object.keys(T)) {
      const e = ((T[who] && T[who].topics) || []).concat((T[who] && T[who].moods) || []).find((x) => x && x.id === id);
      if (e) return { who, facts: e.facts };
    }
    return null;
  }
  const level = (pick) => ZSR.textAt((t) => words(pick(t.crew)));
  /** The words at the reading level (nearest level that has them), else the facts joined, else "".
      Placeholders are left for ZSR.crewFill. Always a string.
      - talk (id = topic or mood id, or a quest id for its payoff; sub = "text" | "title")
      - tip (id = crew id, sub = tip id) - report (id or sub = report key)
      - quest (id = quest id, sub = brief | tag | journal | done | after | title)
      - errand (id = errand id, sub = title | brief | done) - dog (sub or id = ask | named | pet) */
  ZSR.crewText = function crewText(kind, id, sub) {
    const Wd = W();
    if (kind === "talk") {
      if (questDef(id)) return crewText("quest", id, sub === "title" ? "title" : "after"); // a quest's payoff, told as a topic
      const key = sub === "title" ? "title" : "text";
      const e = level((c) => c.talk[id][key]);
      if (e) return e;
      const f = talkFacts(id);
      return !f ? "" : key === "title" ? ZSR.crewName(f.who) : factsText(f.facts);
    }
    if (kind === "tip") {
      const e = level((c) => c.tips[id][sub]);
      return e || factsText((((Wd.CREW_TIPS || {})[id] || {})[sub] || {}).facts);
    }
    if (kind === "report") {
      const key = sub || id;
      const e = level((c) => c.reports[key]);
      return e || factsText(((Wd.CREW_REPORTS || {})[key] || {}).facts);
    }
    if (kind === "quest") {
      const key = sub || "brief";
      const e = level((c) => c.quests[id][key]);
      if (e) return e;
      const q = questDef(id);
      if (!q) return "";
      if (key === "title") return q.object && q.object.name ? q.object.name : ZSR.crewName(q.giver);
      return factsText(q[key]);
    }
    if (kind === "errand") {
      const key = sub || "brief";
      const e = level((c) => c.errands[id][key]);
      if (e) return e;
      const d = errandDef(id);
      if (!d) return "";
      if (key === "title") return itemName(d.item);
      return factsText(key === "brief" ? d.facts : d[key]);
    }
    if (kind === "dog") {
      const key = sub || id;
      const e = level((c) => c.dog[key]);
      return e || factsText(((Wd.DOG || {}).facts || {})[key]);
    }
    return "";
  };
  /** Fill {placeholders} from vars ({dog} is the dog's name unless given). One left unknown stays as it is.
      "1 holes" reads "1 hole", as in ZSR.recapText (the words are written for any number). */
  ZSR.crewFill = function crewFill(text, vars) {
    const S = ZSR.State;
    const o = Object.assign({}, vars);
    if (o.dog == null || o.dog === "") o.dog = (S && S.save && S.dogName()) || "the dog"; // a caller may pass dogName() before it has one
    return String(text == null ? "" : text)
      .replace(/\{(\w+)\}/g, (m, k) => (o[k] != null && o[k] !== "" ? String(o[k]) : m))
      .replace(/\b1 ((?:more |cracked |stash |food |fence )?)(hole|board|segment|day|trip|crate|key|walker)s\b/g, "1 $1$2");
  };
  /** A crew member's name (their id if the roster lacks them). */
  ZSR.crewName = function crewName(id) {
    const c = roster()[id];
    return (c && c.name) || String(id == null ? "" : id);
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
