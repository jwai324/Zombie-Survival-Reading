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
  const questList = () => (Array.isArray(W().QUESTS) ? W().QUESTS : []);
  const questDef = (qid) => questList().find((q) => q.id === qid) || null;
  const errandsOf = (id) => ((W().ERRANDS || {})[id] || []).filter(Boolean);
  function errandDef(eid) {
    for (const list of Object.values(W().ERRANDS || {})) {
      const e = (list || []).find((x) => x && x.id === eid);
      if (e) return e;
    }
    return null;
  }
  const talkOf = (id) => (W().CREW_TALK || {})[id] || {};
  const itemName = (k) => (W().ITEMS && W().ITEMS[k] ? W().ITEMS[k].name : String(k));
  const roomName = (k) => (W().BASE_ROOMS && W().BASE_ROOMS[k] ? W().BASE_ROOMS[k].name : String(k));
  /** "a", "a and b", "a, b and c". */
  function listWords(parts) {
    return parts.length < 2 ? parts.join("") : parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
  }
  /** A reward in plain words: "30 scrap", "30 scrap, 2 Lumber and 1 medical kit". */
  function rewardWords(r) {
    r = r || {};
    const parts = [];
    if (r.scrap) parts.push(r.scrap + " scrap");
    Object.entries(r.items || {}).forEach(([k, n]) => n && parts.push(n + " " + itemName(k)));
    if (r.kits) parts.push(r.kits === 1 ? "1 medical kit" : r.kits + " medical kits");
    if (r.crowbars) parts.push(r.crowbars === 1 ? "1 crowbar" : r.crowbars + " crowbars");
    // trap names are singular ("Spike trap"): "1 Spike trap", "2 Spike traps"
    Object.entries(r.traps || {}).forEach(([k, n]) => n && parts.push(n + " " + (W().TRAPS && W().TRAPS[k] ? W().TRAPS[k].name : k) + (n === 1 ? "" : "s")));
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
  const CRACKED = 0.5; // a fence segment below this share of its health is cracked (as js/yard.js yardFacing)
  // days Pip looks ahead for the town's next walker (SETTINGS.walkersPerLocation). SCALE: a slower walker curve
  // (one more every 60 days or more) needs this longer, or Pip's walkers tip goes quiet
  const WALKER_LOOKAHEAD = 60;
  const CREW_FIELDS = ["trust", "talkDay", "talks", "heard", "mood", "quests", "errand", "errandNext", "report", "dog", "read"]; // save.crew

  /* ---------- Tips: the one piece of useful live information in every talk ----------
     A rule returns the placeholders for the words when its tip applies, else null. Only tips the crew member
     has a CREW_TIPS entry for count. Read literally, "first that applies" in docs/CREW.md would hide every
     tip listed after an always-true one (June's ready, build and heal; Pip's radio), so:
     - URGENT tips (in this order) win outright: June patching you up, the pantry empty, Pip's wave call;
     - otherwise the REGULAR tips that apply take turns, one further on each talk (save.crew.talks), so the
       crew says something new each time (food and walkers always apply, so June and Pip always have one);
     - FALLBACK ("fine") only when nothing else applies (it says all is well).
     `ctx` is what only the yard knows: { heal: hp June gives back now, wave: { size, sides } (the next
     wave's words, in the calm), holes, cracks, broken (live counts; else they are read from the save) }.
     A new tip id needs a rule here and a place in one of the three lists. */
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
      const needs = Object.entries(nb.missing || {}).map(([k, n]) => n + " " + itemName(k)).concat(nb.scrap ? [nb.scrap + " scrap"] : []);
      return needs.length ? { room: roomName(nb.room), needs: listWords(needs) } : null;
    },
    keys: (S) => {
      const n = S.crewKeysUnused();
      return n > 0 ? { keys: n === 1 ? "1 stash key" : n + " stash keys" } : null;
    },
    crowbar: (S) => (S.crowbarsLeft() < 1 ? {} : null),
    radio: (S) => ((S.save.rooms.radio || 0) > 0 ? {} : null),
    food: (S) => {
      const per = (W().SETTINGS && W().SETTINGS.foodPerTrip) || 1;
      return { food: S.save.food, days: Math.floor(Math.max(0, S.save.food) / per) };
    },
    fine: () => ({}),
    walkers: (S) => {
      const days = S.crewWalkerDays();
      return days ? { days } : null;
    },
  };
  const URGENT = ["heal", "hungry", "wave"];
  const REGULAR = ["van", "vanFree", "fence", "cabin", "ready", "build", "keys", "crowbar", "food", "walkers", "radio"];
  const FALLBACK = ["fine"];

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
    /** Add (or, with a negative n, take) trust; never below 0. Returns the new points. */
    addTrust(id, n) {
      const c = this.crewSave();
      c.trust[id] = Math.max(0, (c.trust[id] || 0) + (n || 0));
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
      if (when.room != null && (s.rooms[when.room] || 0) < (when.level != null ? when.level : 1)) return false;
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
      const topic = (T.topics || []).find((t) => t && !c.heard.includes(t.id) && this.crewWhen(t.when, id));
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
    /** Days until the town's buildings get one more walker each (0: they never will). */
    crewWalkerDays() {
      const SET = W().SETTINGS || {};
      const dangers = (W().LOCATIONS || []).filter((l) => l.danger > 0).map((l) => l.danger);
      if (!SET.walkersPerLocation || !dangers.length) return 0;
      const d = Math.min(...dangers); // the quietest place: the last one to reach the cap
      const now = SET.walkersPerLocation(d, this.save.day);
      for (let k = 1; k <= WALKER_LOOKAHEAD; k++) if (SET.walkersPerLocation(d, this.save.day + k) > now) return k;
      return 0;
    },

    /* ---------- Jobs and perks ---------- */
    /** Job keys (fence, cabin, heal, lookout) this crew member's stars unlock. */
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
    /** Scrap one crew repair costs: "fence" (a hole or crack) or "cabin" (a door or window); 0 with the perk. */
    crewRepairCost(kind) {
      if (this.crewFx().crewRepairFree) return 0;
      const SET = W().SETTINGS || {};
      return (kind === "cabin" ? SET.houseRepairScrap : SET.fenceRepairScrap) || 0;
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
    /** Every open request of this crew member: [{ kind: "quest" | "errand", def, st }]. */
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
    /** The open request (one ready to hand in first), or null. */
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
    /** The giver's next story quest in order, whatever its gates: null while the one before is open, or when all are done. */
    nextStoryQuest(id) {
      const c = this.crewSave();
      for (const q of questList()) {
        if (q.giver !== id) continue;
        const st = c.quests[q.id];
        if (!st) return q;
        if (st.state !== "done") return null;
      }
      return null;
    },
    /** How many items this errand asks for if offered today: rolled from the save's seed, the errand and the day
        (never Math.random), so it stays the same while the bubble and the card are open. */
    errandCount(def) {
      const range = Array.isArray(def.count) ? def.count : [def.count || 1, def.count || 1];
      const lo = Math.max(1, range[0] || 1);
      const hi = Math.max(lo, range[1] || lo);
      return lo + Math.floor(roll(this.save.lockSeed || 0, def.id + "|" + this.save.day) * (hi - lo + 1));
    },
    /** What they would ask now: { kind: "quest", def } or { kind: "errand", def, count }, or null. A story quest
        comes in order, once the one before is done, its `when` holds and its building is known; an errand only
        when no story quest can be offered. Nothing while CREW_RULES.requestsPerCrew requests are open. */
    offer(id) {
      if (!roster()[id]) return null;
      if (this.requests(id).length >= rules().requestsPerCrew) return null;
      const q = this.nextStoryQuest(id);
      if (q && this.crewWhen(q.when, id) && this.isKnown(q.at)) return { kind: "quest", def: q };
      const c = this.crewSave();
      const list = errandsOf(id);
      if (c.errand[id] || !list.length) return null;
      const def = list[(c.errandNext[id] || 0) % list.length];
      return { kind: "errand", def, count: this.errandCount(def) };
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
        c.errand[id] = { id: now.def.id, item: now.def.item, count: now.count, have: 0, day, due: day + (now.def.days || 1) };
        c.errandNext[id] = (c.errandNext[id] || 0) + 1;
      }
      return true;
    },
    /** Drop the open request (or the one with this def id), costing trust. A story object already home is
        handed in, never given up. A dropped story quest is offered again later. */
    giveUp(id, reqId) {
      const r = this.requests(id).find((x) => (!reqId || x.def.id === reqId) && !(x.kind === "quest" && x.st.state === "found"));
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
    /** Hand in a filled request: pay out, close it, earn trust. Returns { kind, def, reward } or null. */
    handIn(id) {
      const r = this.requests(id).find((x) => this.requestReady(x));
      if (!r) return null;
      const R = rules();
      const reward = (r.def && r.def.reward) || {};
      if (r.kind === "quest") {
        r.st.state = "done";
        r.st.doneDay = this.save.day;
        this.addTrust(id, R.gain.quest);
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
        kits, crowbars, traps into stock. A perk needs nothing here: it is active once its quest is done. */
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
        { count, item, days } (days: its deadline when offered, the days (trips) left once open: at least 1 while
        it can still be filled; 0 only for one already filled and waiting to be handed in). */
    requestVars(r) {
      if (!r || !r.def) return {};
      const reward = rewardWords(r.def.reward);
      if (r.kind !== "errand") return { reward };
      const st = r.st;
      return { count: st ? st.count : r.count, item: itemName(st ? st.item : r.def.item), days: st ? Math.max(0, st.due - this.save.day) : r.def.days, reward };
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
    /** Add work to the report. kind: "fence" (becomes fenceFree with the crewRepairFree perk), "fenceFree",
        "cabin" (n fixed, scrap paid), or "heal" (n = health given back). */
    logWork(id, kind, n, scrap) {
      const c = this.crewSave();
      const r = (c.report[id] = c.report[id] || {});
      const count = n == null ? 1 : n;
      let k = kind;
      if (k === "fence" && this.crewFx().crewRepairFree) k = "fenceFree";
      r[k] = (r[k] || 0) + count;
      if (scrap > 0) {
        const by = (r.scrapBy = r.scrapBy || {});
        const sk = k === "fenceFree" ? "fence" : k;
        by[sk] = (by[sk] || 0) + scrap;
        r.scrap = (r.scrap || 0) + scrap;
      }
      return r;
    },
    /** The report as words to say, in order: [{ key, vars }] for ZSR.crewText("report", key) + ZSR.crewFill. */
    crewReportItems(id) {
      const r = this.crewReport(id);
      const by = r.scrapBy || {};
      const out = [];
      if (r.fence) out.push({ key: "fence", vars: { fixed: r.fence, scrap: by.fence || 0 } });
      if (r.fenceFree) out.push({ key: "fenceFree", vars: { fixed: r.fenceFree } });
      if (r.cabin) out.push({ key: "cabin", vars: { fixed: r.cabin, scrap: by.cabin || 0 } });
      (r.hurt || []).forEach((cost) => out.push({ key: "hurt", vars: { who: ZSR.crewName(id), cost } }));
      if (r.late) out.push({ key: "late", vars: { item: itemName(r.late) } });
      if (r.heal) out.push({ key: "heal", vars: { hp: r.heal } });
      return out;
    },
    /** A raider got among the crew in the shelter: 1 medical kit from storage, else 2 food (never below 0);
        their trust drops and their report says so. Returns the cost word: "a medical kit", or the food it really
        took ("2 food"; "1 food" when only 1 was left, "0 food" when the pantry was already empty), so the report
        never claims more than was lost. */
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
        word = took + " food";
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
        the cargo of its item. Returns the quest ids brought home (the day log's entry.quests). */
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
      // errands are accepted at home, so all of this trip's cargo came after it
      Object.values(c.errand).forEach((e) => {
        const n = e ? (t.cargo || {})[e.item] || 0 : 0;
        if (n > 0) e.have = Math.min(e.count, (e.have || 0) + n);
      });
      return home;
    },
    /** After the day passes: an errand whose deadline day has come and is not filled is dropped (trust, report
        `late`): accepted on day 1 with 4 days (due 5), the trips of days 1 to 4 count, and the one that brings it
        home on day 5 still fills it (crewTripHome runs first). The dog eats 1 food every dogFoodEvery days; the
        scrapPerDay perk pays. */
    crewDayPassed() {
      const s = this.save;
      const c = this.crewSave();
      const R = rules();
      Object.keys(c.errand).forEach((id) => {
        const e = c.errand[id];
        if (!e || s.day < e.due || this.requestReady({ kind: "errand", st: e })) return;
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
