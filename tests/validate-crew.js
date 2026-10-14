#!/usr/bin/env node
/* The crew at home base: save state, quests, errands, the dog and the crew's words. Design: docs/CREW.md.
   Part of npm test. Sections:
     1. The loader: a browser just big enough for the game, in a fresh vm sandbox each time (loadGame).
     2. The state rules (js/crewstate.js + the hooks in js/state.js) against a small SYNTHETIC crew, so the
        logic is tested whatever the real facts say: trust and stars, talk, topics, tips, offers, quests on a
        trip and at home, errands, give up, raids, reports, the dog, perks, words, old saves.
     3. The REAL facts (js/story-crew.js, js/story-quests.js, js/content/levelN-crew.js): every text resolves
        at every level with only the placeholders the engine fills, every topic can be told, and every story
        quest runs through the state API in order with its reward and perk.
     4. The engine loads with the crew (js/crew.js, js/building.js): add yard and building simulations here,
        with loadGame({ engine: true }).
   Prints one OK line, or the errors and exit 1. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");

const errors = [];
const err = (m) => errors.push(m);
let checks = 0;
/** Count a check; record msg when it fails. */
function ok(cond, msg) {
  checks++;
  if (!cond) err(msg);
  return !!cond;
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/** Run one group of checks; a throw is an error of that group, never the end of the run. */
function group(name, fn) {
  try {
    fn();
  } catch (e) {
    err(`${name}: threw ${String(e && e.stack ? e.stack : e).split("\n").slice(0, 4).join(" | ")}`);
  }
}

/* =====================================================================================================
   1. The loader
   ===================================================================================================== */
const noop = () => {};
/** A browser for one sandbox: canvases that draw nothing, a document of plain objects, localStorage. */
function browser() {
  let pixels = null; // made inside the sandbox: pixel arrays from this realm slow the engine down a lot
  function context2d(canvas) {
    const gradient = { addColorStop: noop };
    const ctx = {
      canvas,
      globalAlpha: 1,
      lineWidth: 1,
      imageSmoothingEnabled: true,
      createImageData: (w, h) => pixels(w, h),
      getImageData: (x, y, w, h) => pixels(w, h),
      createLinearGradient: () => gradient,
      createRadialGradient: () => gradient,
      createPattern: () => ({}),
      measureText: (t) => ({ width: String(t).length * 6 }),
    };
    return new Proxy(ctx, { get: (o, k) => (k in o ? o[k] : noop) }); // every other 2D call does nothing
  }
  function element(tag) {
    const el = {
      tagName: String(tag).toUpperCase(),
      style: {},
      dataset: {},
      textContent: "",
      classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
      addEventListener: noop,
      removeEventListener: noop,
      appendChild: (c) => c,
      setAttribute: noop,
      getAttribute: () => null,
    };
    if (el.tagName === "CANVAS") {
      el.width = 300;
      el.height = 150;
      el.getContext = () => el.ctx || (el.ctx = context2d(el));
    }
    return el;
  }
  const byId = {};
  const store = new Map();
  const sb = {
    console,
    performance,
    innerWidth: 480,
    innerHeight: 270,
    addEventListener: noop,
    removeEventListener: noop,
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: noop,
    setTimeout: () => 0,
    clearTimeout: noop,
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
    document: {
      createElement: element,
      getElementById: (id) => byId[id] || (byId[id] = element("div")),
      querySelector: () => element("div"),
      querySelectorAll: () => [],
      addEventListener: noop,
      documentElement: element("html"),
      body: element("body"),
      pointerLockElement: null,
      hidden: false,
    },
  };
  sb.globalThis = sb;
  sb.window = sb;
  vm.createContext(sb);
  pixels = vm.runInContext("(w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4) })", sb);
  return { sb, element, byId, store };
}

const PAGE = [...fs.readFileSync(path.join(ROOT, "index.html"), "utf8").matchAll(/<script src="js\/([^"]+)"><\/script>/g)].map((m) => m[1]);
const FACTS = ["layouts.js", "world.js", "story.js", "story-home.js", "story-crew.js", "story-quests.js"];
const STATE = FACTS.concat(["upgrades.js", "weapons.js", "state.js", "crewstate.js"]);
const ENGINE = STATE.concat(["audio.js", "sprites.js", "sprites3d.js", "decor.js", "locks.js", "landmarks1.js", "landmarks2.js", "yardart.js", "houseart.js", "riverart.js", "crewart.js", "streets.js", "interior.js", "building.js", "yard.js", "house.js", "crew.js", "river.js"]);

/** A fresh game in its own sandbox, scripts in the page's order.
    opts: engine (the first-person engine too, with stand-in art and Interior.init), content (the six reading
    levels), afterFacts(ZSR) (runs once the story files are in: swap in a synthetic fixture there).
    Returns { sb, ZSR, W, S, I, element, byId, store }. */
function loadGame(opts) {
  const o = Object.assign({ engine: false, content: false, afterFacts: null }, opts);
  const b = browser();
  const want = o.engine ? ENGINE : STATE;
  const files = PAGE.filter((f) => want.includes(f) || (o.content && f.startsWith("content/")));
  want.forEach((f) => !files.includes(f) && fs.existsSync(path.join(ROOT, "js", f)) && files.push(f)); // the page order first, then anything it lacks
  const lastFact = Math.max(...FACTS.map((f) => files.indexOf(f)));
  files.forEach((f, i) => {
    vm.runInContext(fs.readFileSync(path.join(ROOT, "js", f), "utf8"), b.sb, { filename: "js/" + f });
    if (i === lastFact && o.afterFacts) o.afterFacts(b.sb.ZSR);
  });
  const ZSR = b.sb.ZSR;
  if (o.engine) {
    const D = ZSR.Draw3;
    // stand-in art for every decor and landmark key, as tests/validate-engine.js does
    Object.keys(ZSR.LAYOUT_DECOR || {}).forEach((k) => D.hasTexture(k) || D.registerTexture(k, noop));
    Object.keys(ZSR.LAYOUT_ART || {}).forEach((k) => D.hasSprite(k) || D.registerSprite(k, 128, 128, noop));
    ZSR.Interior.init(b.element("canvas"), {});
  }
  return Object.assign(b, { ZSR, W: ZSR.WORLD, S: ZSR.State, I: ZSR.Interior });
}
/** One trip out and home (a day passes): cargo is what the van brings back; during(trip) runs on the road. */
function tripHome(S, cargo, during) {
  S.startTrip();
  Object.assign(S.trip.cargo, cargo || {});
  if (during) during(S.trip);
  S.returnHome();
  return S.save.log[S.save.log.length - 1];
}

/* =====================================================================================================
   2. The state rules against a synthetic crew
   ===================================================================================================== */
const NOTE = "grocery-door"; // a real note (the gate of a synthetic topic)
/** A small crew, in the shapes docs/CREW.md gives: three members, a few topics, every tip, two errands, three
    story quests (one a dog). Built fresh for every sandbox. */
function fixture() {
  const f = (s) => ({ facts: [s] });
  return {
    CREW: {
      ann: { name: "Ann", pronoun: "she", color: "#5b8a3c", scale: 0.9, jobs: [{ job: "heal", stars: 1 }], posts: [] },
      bo: { name: "Bo", pronoun: "he", color: "#33507a", scale: 1, jobs: [{ job: "fence", stars: 0 }, { job: "cabin", stars: 2 }], posts: [] },
      cy: { name: "Cy", pronoun: "they", color: "#e07a2a", scale: 0.74, jobs: [{ job: "lookout", stars: 1 }], posts: [] },
    },
    CREW_RULES: { stars: [3, 8, 15, 24, 35], gain: { talk: 1, errand: 3, quest: 5 }, loss: { hurt: 3, late: 2, giveUp: 3 }, shelter: "officeCloset", hurtCost: { meds: 1, food: 2 }, healAmount: 40, lookoutSeconds: 15, requestsPerCrew: 1, dogFoodEvery: 2 },
    CREW_TALK: {
      ann: {
        topics: [
          { id: "ann-t1", when: { day: 1 }, facts: ["Ann tells the first story."] },
          { id: "ann-t2", when: { day: 3 }, facts: ["Ann tells a day three story."] },
          { id: "ann-t3", when: { stars: 1 }, facts: ["Ann trusts you a little."] },
          { id: "ann-t4", when: { quest: "ann-1" }, facts: ["Ann talks about the bag."] },
          { id: "ann-t5", when: { note: NOTE }, facts: ["Ann read the note too."] },
          { id: "ann-t6", when: { room: "garden", level: 1 }, facts: ["Ann loves the garden."] },
          { id: "ann-t7", when: { dog: true }, facts: ["Ann feeds {dog} a bean."] },
        ],
        moods: [{ id: "ann-m1", facts: ["Ann hums."] }, { id: "ann-m2", facts: ["Ann sighs."] }],
      },
      bo: { topics: [{ id: "bo-t1", when: { day: 1 }, facts: ["Bo talks about engines."] }], moods: [{ id: "bo-m1", facts: ["Bo whistles."] }] },
      cy: { topics: [], moods: [] },
    },
    CREW_TIPS: {
      ann: { hungry: f("Out of food."), food: f("{food} crates, {days} trips."), ready: f("Build the {room}."), build: f("The {room} needs {needs}."), heal: f("Back {hp} health.") },
      bo: { van: f("{hp} of {max}, {cost} scrap."), vanFree: f("{hp} of {max}, free."), fence: f("{holes} holes, {cracks} cracks."), cabin: f("{broken} broken."), crowbar: f("No crowbar."), fine: f("All fine.") },
      cy: { wave: f("{size} from {sides}."), keys: f("You hold {keys}."), walkers: f("{days} days."), radio: f("The radio.") },
    },
    CREW_REPORTS: { fence: f("Bo fixed {fixed} for {scrap} scrap."), fenceFree: f("Bo fixed {fixed} free."), cabin: f("Bo fixed {fixed} doors for {scrap}."), hurt: f("{who} was hurt; it cost {cost}."), late: f("The {item} errand ran out."), heal: f("Back {hp}.") },
    ERRANDS: {
      ann: [
        { id: "ann-e1", item: "seeds", count: [2, 3], days: 3, reward: { scrap: 25 }, facts: ["Ann asks for {count} {item} within {days} days for {reward}."], done: ["Ann thanks you for the seeds."] },
        { id: "ann-e2", item: "soil", count: [1, 1], days: 2, reward: { kits: 1 }, facts: ["Ann asks for {count} {item}."], done: ["Ann pats the soil."] },
      ],
      bo: [{ id: "bo-e1", item: "nails", count: [1, 1], days: 2, reward: { crowbars: 1 }, facts: ["Bo asks for {count} {item}."], done: ["Bo nails it."] }],
      cy: [],
    },
    QUESTS: [
      {
        id: "ann-1", giver: "ann", at: "grocery", spot: [3, 11], near: "the fish tank", when: { day: 2, stars: 0 },
        object: { name: "Ann's bag", art: "bag" }, reward: { scrap: 30, items: { lumber: 2 }, kits: 1, perk: { foodPerDay: 1, footHp: 10 } },
        brief: ["Bring Ann's bag home from Corner Grocery."], tag: ["Ann's bag."], journal: ["The bag came home."], done: ["Ann thanks you for the bag."], after: ["Ann tells you about the bag."],
      },
      {
        id: "ann-2", giver: "ann", at: "pharmacy", spot: [4, 8], near: "the giant toothbrush", when: { stars: 1 },
        object: { name: "Ann's tin", art: "tin" }, reward: { crowbars: 1, traps: { spike: 1 }, perk: { crowbarCost: 5, vanHp: 15, medsPerDay: 0.5 } },
        brief: ["Bring Ann's tin."], tag: ["Ann's tin."], journal: ["The tin came home."], done: ["Ann thanks you for the tin."], after: ["Ann tells you about the tin."],
      },
      {
        id: "bo-1", giver: "bo", at: "hardware", spot: [5, 5], near: "the paint wall", when: { day: 1 },
        object: { name: "Bo's wrench", art: "wrench" }, reward: { scrap: 20, perk: { crewRepairFree: true, scrapPerDay: 4 } },
        brief: ["Bring Bo's wrench."], tag: ["Bo's wrench."], journal: ["The wrench came home."], done: ["Bo thanks you."], after: ["Bo tells you about the wrench."],
      },
      {
        id: "cy-1", giver: "cy", kind: "dog", at: "grocery", spot: [30, 4], near: "the forklift", when: { day: 1 },
        reward: { scrap: 10 }, brief: ["Find the dog at Corner Grocery."], journal: ["The dog came home."], done: ["Cy hugs the dog."], after: ["Cy talks about the dog."],
      },
    ],
    DOG: { ideas: ["Rex", "Dot", "Moss"], facts: { ask: ["Name the dog."], named: ["{dog} it is."], pet: ["{dog} wags."] } },
  };
}
/** A new game in a fresh sandbox with the synthetic crew and no reading-level words (just the facts). */
function synthetic(edit) {
  const g = loadGame({
    afterFacts(ZSR) {
      Object.assign(ZSR.WORLD, fixture());
      ZSR.TEXT = { 1: { level: 1, crew: {} } };
      if (edit) edit(ZSR.WORLD);
    },
  });
  g.S.newGame(1, "Test");
  return g;
}

group("fresh save", () => {
  const { S } = synthetic();
  const c = S.save.crew;
  ok(c && typeof c === "object", "fresh save: no crew field");
  ["trust", "talkDay", "talks", "mood", "errand", "errandNext", "report"].forEach((k) => ok(same(Object.keys(c[k]), ["ann", "bo", "cy"]), `fresh save: crew.${k} is not one entry per CREW id (${JSON.stringify(c[k])})`));
  ok(same(c.heard, []) && same(c.quests, {}) && same(c.read, []), "fresh save: heard, quests and read start empty");
  ok(same(c.errand, { ann: null, bo: null, cy: null }), "fresh save: no errand is open");
  ok(c.dog.home === false && c.dog.name === "", "fresh save: the dog is not home and has no name");
  ok(same(S.crewIds(), ["ann", "bo", "cy"]), "crewIds: not the CREW ids");
  ok(S.trip === null, "fresh save: a trip is open");
  S.startTrip();
  ok(same(S.trip.quest, []) && S.trip.dog === false, "startTrip: trip.quest and trip.dog do not start as [] and false");
});

group("trust and stars", () => {
  const { S } = synthetic();
  ok(S.trust("ann") === 0 && S.stars("ann") === 0, "trust: a fresh crew member has trust or stars");
  S.addTrust("ann", 2);
  ok(S.stars("ann") === 0, "stars: 2 points is a star (the first is at 3)");
  S.addTrust("ann", 1);
  ok(S.trust("ann") === 3 && S.stars("ann") === 1, `stars: 3 points is not 1 star (${S.stars("ann")})`);
  S.addTrust("ann", 4);
  ok(S.stars("ann") === 1, "stars: 7 points is not 1 star");
  S.addTrust("ann", 1);
  ok(S.stars("ann") === 2, "stars: 8 points is not 2 stars");
  S.addTrust("ann", 27);
  ok(S.stars("ann") === 5, "stars: 35 points is not 5 stars");
  S.addTrust("ann", 1000);
  ok(S.stars("ann") === 5, "stars: more than the top threshold is more than 5 stars");
  ok(S.addTrust("ann", -5000) === 0 && S.trust("ann") === 0, "addTrust: trust went below 0");
  ok(S.trust("bo") === 0, "addTrust: one crew member's trust moved another's");
});

group("talk once a day", () => {
  const { S } = synthetic();
  ok(S.crewTalk("bo") === true && S.trust("bo") === 1, "crewTalk: the first talk of the day did not earn 1 trust");
  ok(S.crewTalk("bo") === false && S.trust("bo") === 1, "crewTalk: a second talk the same day earned trust");
  ok(S.crewTalk("ann") === true, "crewTalk: talking to Bo used up Ann's talk");
  tripHome(S);
  ok(S.crewTalk("bo") === true && S.trust("bo") === 2, "crewTalk: the next day's first talk did not earn trust");
  ok(S.save.crew.talks.bo === 3, `crewTalk: talks are not counted (${S.save.crew.talks.bo})`);
});

group("topics in order, when, moods", () => {
  const { S, ZSR: Z } = synthetic();
  const c = S.save.crew;
  const next = (id) => S.nextTopic(id);
  const tell = (id) => {
    const t = next(id);
    if (t) S.markTopic(id, t.id);
    return t;
  };
  ok(same(next("ann"), { id: "ann-t1", mood: false }), `nextTopic: day 1 should be ann-t1 (${JSON.stringify(next("ann"))})`);
  ok(same(next("ann"), next("ann")), "nextTopic: asking twice changed it");
  tell("ann");
  ok(c.heard.includes("ann-t1"), "markTopic: a topic told is not heard");
  // ann-t2 needs day 3, ann-t3 a star, ann-t4 a quest, ann-t5 a note, ann-t6 the garden, ann-t7 the dog: a mood now
  ok(same(tell("ann"), { id: "ann-m1", mood: true }), "nextTopic: with no topic open, not the first mood");
  ok(same(tell("ann"), { id: "ann-m2", mood: true }), "nextTopic: moods do not take turns");
  ok(same(next("ann"), { id: "ann-m1", mood: true }), "nextTopic: the moods do not wrap around");
  ok(!c.heard.includes("ann-m1"), "markTopic: a mood went into heard");
  S.addTrust("ann", 3);
  ok(next("ann").id === "ann-t3", "nextTopic: a topic whose stars are reached is not told");
  tell("ann");
  S.save.day = 3;
  ok(next("ann").id === "ann-t2", "nextTopic: a skipped topic is not told once its day comes");
  tell("ann");
  S.save.backpack.push({ noteId: NOTE, locId: "grocery", found: "", day: 3 });
  ok(next("ann").id === "ann-t5", "nextTopic: a note read does not open its topic (or ann-t4 was told before its quest)");
  tell("ann");
  S.save.rooms.garden = 1;
  ok(next("ann").id === "ann-t6", "nextTopic: a room built does not open its topic");
  tell("ann");
  c.dog.home = true;
  ok(next("ann").id === "ann-t7", "nextTopic: the dog home does not open its topic");
  tell("ann");
  c.quests["ann-1"] = { state: "done", day: 2, doneDay: 3 };
  const pay = next("ann");
  ok(pay && pay.id === "ann-1" && pay.quest === "ann-1" && !pay.mood, `nextTopic: a handed-in quest's payoff does not come first (${JSON.stringify(pay)})`);
  ok(Z.crewText("talk", "ann-1") === "Ann tells you about the bag.", "crewText: talk with a quest id is not the quest's after");
  tell("ann");
  ok(c.heard.includes("ann-1"), "markTopic: a quest payoff told is not heard");
  ok(next("ann").id === "ann-t4", "nextTopic: a done quest does not open its topic");
  tell("ann");
  ok(next("ann").mood === true, "nextTopic: with every topic told, not a mood");
  ok(next("cy") === null, "nextTopic: a crew member with no topics and no moods does not give null");
  ok(S.crewWhen({}, "ann") && S.crewWhen(null) && !S.crewWhen({ day: 99 }, "ann") && !S.crewWhen({ dog: false }, "ann"), "crewWhen: an empty when, a day not reached or dog: false while home");
});

group("tips", () => {
  const { S, W } = synthetic();
  const tip = (id, ctx) => S.crewTip(id, ctx);
  const tips = (id, ctx) => S.crewTips(id, ctx).regular.map((t) => t.tip);
  // Ann: food always applies; a build is short; hungry and heal win outright
  ok(same(tips("ann").sort(), ["build", "food"]), `tips: Ann's regular tips on a fresh save (${tips("ann")})`);
  const food = S.crewTips("ann").regular.find((t) => t.tip === "food");
  ok(food.vars.food === S.save.food && food.vars.days === Math.floor(S.save.food / W.SETTINGS.foodPerTrip), `tips: food vars ${JSON.stringify(food.vars)}`);
  const build = S.crewTips("ann").regular.find((t) => t.tip === "build");
  const nb = S.nextBuild();
  ok(build.vars.room === W.BASE_ROOMS[nb.room].name && /\d+ \w/.test(build.vars.needs), `tips: build vars ${JSON.stringify(build.vars)}`);
  ok(tip("ann", { heal: 40 }).tip !== "heal", "tips: June's patch-up is told before her heal job is unlocked (1 star)");
  S.addTrust("ann", 3);
  ok(tip("ann", { heal: 40 }).tip === "heal" && tip("ann", { heal: 40 }).vars.hp === 40, "tips: June's patch-up is not told first");
  S.addTrust("ann", -3);
  S.save.food = 0;
  ok(tip("ann").tip === "hungry", "tips: an empty pantry is not told first");
  S.save.food = 6;
  Object.keys(W.ITEMS).forEach((k) => (S.save.inventory[k] = 50));
  S.save.scrap = 9999;
  ok(tips("ann").includes("ready") && S.crewTips("ann").regular.find((t) => t.tip === "ready").vars.room === W.BASE_ROOMS[S.nextBuild().room].name, "tips: a room that can be built is not told");
  // the regular tips take turns, one further on each talk
  const seen = new Set();
  for (let i = 0; i < 4; i++) {
    S.crewTalk("ann");
    seen.add(tip("ann").tip);
  }
  ok(seen.has("ready") && seen.has("food"), `tips: Ann's tips do not take turns (${[...seen]})`);
  ok(same(tip("ann"), tip("ann")), "tips: the tip changed without a talk");
  // Bo: nothing wrong is fine; the van, the fence, the cabin and no crowbar
  S.save.crowbars = 1;
  ok(tip("bo").tip === "fine", `tips: Bo with nothing to fix is not fine (${tip("bo").tip})`);
  S.save.crowbars = 0;
  ok(tip("bo").tip === "crowbar", "tips: no crowbar is not told");
  S.save.crowbars = 1;
  S.save.vanHp = 50;
  const van = S.crewTips("bo").regular.find((t) => t.tip === "van");
  ok(van && van.vars.hp === 50 && van.vars.max === S.vanMaxHp() && van.vars.cost === S.repairCost(), `tips: van vars ${JSON.stringify(van && van.vars)}`);
  S.save.rooms.garage = 1;
  ok(same(tips("bo"), ["vanFree"]), `tips: a van fixed for free by the Garage (${tips("bo")})`);
  S.save.rooms.garage = 0;
  S.save.fence = { "1,1": 0, "2,1": 10, "3,1": 1000 };
  S.save.house.hp = { "5,5": 0, "6,5": 40 };
  const reg = S.crewTips("bo").regular;
  ok(same(reg.find((t) => t.tip === "fence").vars, { holes: 1, cracks: 1 }), "tips: fence holes and cracks from the save");
  ok(same(reg.find((t) => t.tip === "cabin").vars, { broken: 1 }), "tips: broken doors and windows from the save");
  ok(same(S.crewTips("bo", { holes: 4, cracks: 0, broken: 0 }).regular.map((t) => t.tip), ["van", "fence"]), "tips: the yard's live counts do not win over the save");
  // Pip's place: the wave (lookout job), keys, walkers, radio
  ok(same(tips("cy"), ["walkers"]), `tips: Cy's tips on a fresh save (${tips("cy")})`);
  const days = S.crewTips("cy").regular[0].vars.days;
  const d = Math.min(...W.LOCATIONS.filter((l) => l.danger > 0).map((l) => l.danger));
  const wpl = (k) => W.SETTINGS.walkersPerLocation(d, S.save.day + k);
  ok(days > 0 && wpl(days) > wpl(0) && wpl(days - 1) === wpl(0), `tips: walkers in ${days} days is not when the count goes up`);
  const wave = { size: "a big wave", sides: "the north" };
  ok(tip("cy", { wave }).tip !== "wave", "tips: the wave is called without the lookout job");
  S.addTrust("cy", 3);
  ok(tip("cy", { wave }).tip === "wave" && same(tip("cy", { wave }).vars, wave), "tips: the lookout's wave call is not told first");
  const calm = tip("cy", { wave: { size: "no wave", sides: "" } });
  ok(calm.tip === "wave" && calm.vars.sides === "nowhere", `tips: "no wave" with no sides leaves {sides} unfilled (${JSON.stringify(calm.vars)})`);
  ok(tip("cy", { wave: {} }).tip !== "wave", "tips: a wave call with no size");
  const from = Object.keys(W.KEYS)[0];
  S.save.keys[from] = { day: 1 };
  ok(same(S.crewTips("cy").regular.find((t) => t.tip === "keys").vars, { keys: "1 stash key" }), "tips: a stash key held is not told");
  S.save.loc[W.KEYS[from]] = { taken: {}, cacheTaken: {}, stashOpened: true, visits: 1 };
  ok(!tips("cy").includes("keys"), "tips: a key whose stash is open still counts");
  S.save.rooms.radio = 1;
  ok(tips("cy").includes("radio"), "tips: the radio is not told once built");
  ok(S.crewTip("nobody") === null, "tips: an unknown crew member has a tip");
});

group("jobs", () => {
  const { S } = synthetic();
  ok(same(S.crewJobs("bo"), ["fence"]) && same(S.crewJobs("ann"), []), "crewJobs: at 0 stars");
  S.addTrust("bo", 8);
  S.addTrust("ann", 3);
  ok(same(S.crewJobs("bo"), ["fence", "cabin"]) && same(S.crewJobs("ann"), ["heal"]), "crewJobs: stars do not unlock jobs");
  ok(S.crewHealAmount() === 40 && S.crewLookoutSeconds() === 15, "crewHealAmount / crewLookoutSeconds: not CREW_RULES");
});

group("offers: order and gates", () => {
  const g = synthetic();
  const { S, W, sb } = g;
  const c = S.save.crew;
  // day 1: Ann's first quest needs day 2, so an errand
  const o1 = S.offer("ann");
  ok(o1 && o1.kind === "errand" && o1.def.id === "ann-e1" && o1.count >= 2 && o1.count <= 3, `offer: day 1 should be Ann's first errand (${JSON.stringify(o1)})`);
  vm.runInContext("Math.random = (() => { let i = 0; return () => (i++ % 7) / 7; })()", sb);
  ok(same(S.offer("ann"), o1) && same(S.offer("ann"), o1), "offer: the errand count changes between calls (Math.random?)");
  const counts = new Set();
  for (let day = 1; day <= 40; day++) {
    S.save.day = day;
    counts.add(S.errandCount(o1.def));
  }
  ok(counts.has(2) && counts.has(3) && counts.size === 2, `errandCount: over 40 days not both ends of [2, 3] (${[...counts]})`);
  S.save.day = 1;
  ok(S.offer("bo").kind === "quest" && S.offer("bo").def.id === "bo-1", "offer: Bo's day-1 quest at a known place");
  ok(S.offer("cy").kind === "quest" && S.offer("cy").def.kind === "dog", "offer: Cy's dog quest");
  ok(S.offer("nobody") === null, "offer: an unknown crew member offers");
  S.save.day = 2;
  const o2 = S.offer("ann");
  ok(o2.kind === "quest" && o2.def.id === "ann-1", "offer: day 2 should be Ann's first story quest (story quests come before errands)");
  ok(S.accept("bo", { kind: "errand", def: { id: "bo-e1" }, count: 1 }) === false, "accept: a stale offer was accepted");
  ok(S.accept("ann", o2) === true && c.quests["ann-1"].state === "active" && c.quests["ann-1"].day === 2, "accept: the quest is not active from today");
  ok(S.offer("ann") === null, "offer: offered more than requestsPerCrew");
  ok(S.request("ann").kind === "quest" && S.request("ann").def.id === "ann-1" && S.handInReady("ann") === false, "request: the open quest");
  // room for two requests, ann-2's star and building in hand: only ann-1 still open holds it back
  W.CREW_RULES.requestsPerCrew = 2;
  S.addTrust("ann", 3);
  S.save.known.push("pharmacy");
  ok(S.offer("ann").kind === "errand", "offer: with ann-1 open, ann-2 is offered (or no errand with room for two)");
  S.addTrust("ann", -3);
  S.save.known.pop();
  W.CREW_RULES.requestsPerCrew = 1;
  c.quests["ann-1"].state = "done";
  ok(S.offer("ann").kind === "errand", "offer: ann-2 offered without its star");
  S.addTrust("ann", 3);
  ok(S.offer("ann").kind === "errand", "offer: ann-2 offered before its building is known");
  S.save.known.push("pharmacy");
  ok(S.offer("ann").kind === "quest" && S.offer("ann").def.id === "ann-2", "offer: ann-2 not offered once known, with the star");
  c.quests["ann-2"] = { state: "done", day: 2, doneDay: 2 };
  ok(S.offer("ann").kind === "errand", "offer: no errand once every story quest is done");
  ok(S.accept("ann") === true && S.offer("ann") === null && c.errandNext.ann === 1, "accept: with no offer given, the current one is not opened");
  ok(S.offer("cy") && S.offer("cy").kind === "quest", "offer: Cy has no errands, but the dog quest stays");
});

group("story quest: accept, pick up, death, home, hand in, perk", () => {
  const g = synthetic();
  const { S } = g;
  const ids = (loc) => S.questsAt(loc).map((q) => q.id);
  ok(same(ids("grocery"), []), "questsAt: an object shows before its quest is accepted");
  S.save.day = 2;
  S.accept("ann", S.offer("ann"));
  S.commit();
  ok(same(ids("grocery"), ["ann-1"]) && same(ids("hardware"), []), `questsAt: grocery ${ids("grocery")}`);
  S.startTrip();
  ok(S.takeQuestObject("bo-1") === false, "takeQuestObject: an object of a quest not accepted");
  ok(S.takeQuestObject("ann-1") === true && S.trip.quest.includes("ann-1"), "takeQuestObject: not put in trip.quest");
  ok(S.questHeld("ann-1") && same(ids("grocery"), []), "questsAt: an object held this trip still waits in the building");
  ok(S.takeQuestObject("ann-1") === false && S.trip.quest.length === 1, "takeQuestObject: picked up twice");
  S.abandonTrip(); // death
  ok(S.trip === null && S.save.crew.quests["ann-1"].state === "active" && !S.questHeld("ann-1") && same(ids("grocery"), ["ann-1"]), "abandonTrip: the object is not back in the building after a death");
  const fx0 = S.effects();
  const foot0 = S.footMaxHp();
  const entry = tripHome(S, {}, () => S.takeQuestObject("ann-1"));
  ok(S.save.crew.quests["ann-1"].state === "found", "returnHome: the object brought home is not found");
  ok(same(entry.quests, ["ann-1"]), `returnHome: the day log does not carry entry.quests (${JSON.stringify(entry.quests)})`);
  ok(same(ids("grocery"), []) && S.questHeld("ann-1"), "questsAt: a found object still waits");
  ok(S.handInReady("ann") && S.giveUp("ann") === false, "handInReady / giveUp: a found object is not ready, or was given up");
  const before = { scrap: S.save.scrap, lumber: S.save.inventory.lumber || 0, meds: S.save.inventory.meds || 0, trust: S.trust("ann") };
  const r = S.handIn("ann");
  ok(r && r.kind === "quest" && r.def.id === "ann-1" && r.reward.scrap === 30, `handIn: returned ${JSON.stringify(r && { kind: r.kind, id: r.def.id })}`);
  ok(S.save.scrap === before.scrap + 30 && S.save.inventory.lumber === before.lumber + 2 && S.save.inventory.meds === before.meds + 1, "handIn: scrap, items or kits not paid");
  ok(S.trust("ann") === before.trust + 5, "handIn: the quest's trust not earned");
  ok(S.save.crew.quests["ann-1"].state === "done" && S.save.crew.quests["ann-1"].doneDay === S.save.day, "handIn: the quest is not done today");
  ok(S.request("ann") === null && !S.handInReady("ann") && S.handIn("ann") === null, "handIn: the request is still open");
  const fx1 = S.effects();
  ok(fx1.foodPerDay === fx0.foodPerDay + 1 && fx1.footHp === fx0.footHp + 10 && S.footMaxHp() === foot0 + 10, "effects: the quest's perk (foodPerDay 1, footHp 10) is not in effects()");
  ok(S.crewFx().foodPerDay === 1 && S.crewFx().crowbarCost === null, "crewFx: not the done quest's perk");
  const f0 = S.save.food;
  tripHome(S);
  ok(S.save.food === Math.max(0, f0 - g.W.SETTINGS.foodPerTrip) + fx1.foodPerDay, "returnHome: the foodPerDay perk does not feed the crew");
  ok(S.nextTopic("ann").id === "ann-1", "nextTopic: the handed-in quest's payoff is not next");
});

group("give up", () => {
  const { S } = synthetic();
  S.save.day = 2;
  S.addTrust("ann", 5);
  S.accept("ann", S.offer("ann"));
  ok(S.giveUp("ann") === true && !S.save.crew.quests["ann-1"] && S.trust("ann") === 2, "giveUp: the quest is still open, or trust did not drop by loss.giveUp");
  ok(S.offer("ann").def.id === "ann-1", "giveUp: a given-up story quest is not offered again");
  ok(S.giveUp("ann") === false, "giveUp: with nothing open");
  S.accept("ann", S.offer("ann"));
  ok(S.giveUp("ann") === true && S.trust("ann") === 0, "giveUp: trust went below 0");
  // given up on the road: the object picked up does not come home
  S.accept("bo", S.offer("bo"));
  tripHome(S, {}, () => {
    S.takeQuestObject("bo-1");
    S.giveUp("bo");
    ok(!S.trip.quest.includes("bo-1"), "giveUp: the object stays in trip.quest");
  });
  ok(!S.save.crew.quests["bo-1"], "giveUp: an object given up on the road came home");
});

group("errands", () => {
  const { S, W, ZSR: Z } = synthetic((Wd) => (Wd.QUESTS = Wd.QUESTS.filter((q) => q.giver !== "ann"))); // Ann: errands only
  const c = S.save.crew;
  tripHome(S, { seeds: 5 }); // brought home before the errand: does not count
  const o = S.offer("ann");
  ok(o.kind === "errand" && o.def.id === "ann-e1", "errands: Ann's first errand");
  ok(same(S.requestVars(o), { count: o.count, item: W.ITEMS.seeds.name, days: 3, reward: "25 scrap" }), `requestVars: offer ${JSON.stringify(S.requestVars(o))}`);
  S.accept("ann", o);
  const e = c.errand.ann;
  ok(same(e, { id: "ann-e1", item: "seeds", count: o.count, have: 0, day: S.save.day, due: S.save.day + 3 }), `accept: errand ${JSON.stringify(e)}`);
  ok(c.errandNext.ann === 1, "accept: errandNext does not move on");
  ok(!S.handInReady("ann"), "errands: seeds in storage from before count");
  tripHome(S, { seeds: 1 });
  ok(c.errand.ann.have === 1, `errands: cargo after accepting does not count (have ${c.errand.ann.have})`);
  ok(S.requestVars(S.request("ann")).days === 2, "requestVars: an open errand's days are not the days left");
  ok(Z.crewFill(Z.crewText("errand", "ann-e1", "brief"), S.requestVars(S.request("ann"))).includes("within 2 days"), "requestVars: the open errand's words do not say the days left");
  tripHome(S, { seeds: 9, soil: 1 });
  ok(c.errand.ann.have === o.count, "errands: have is not capped at count (or other items count)");
  const inv = S.save.inventory.seeds;
  S.save.inventory.seeds = o.count - 1;
  ok(!S.handInReady("ann"), "handInReady: an errand with too few items in storage");
  S.save.inventory.seeds = inv;
  const scrap = S.save.scrap;
  const r = S.handIn("ann");
  ok(r && r.kind === "errand" && r.def.id === "ann-e1", "handIn: errand not handed in");
  ok(S.save.inventory.seeds === inv - o.count && S.save.scrap === scrap + 25 && S.trust("ann") === 3 && c.errand.ann === null, "handIn: errand items not taken, reward not paid, trust not earned or still open");
  // the next errand runs late
  const o2 = S.offer("ann");
  ok(o2.def.id === "ann-e2", "errands: the next errand is not the next in turn");
  S.accept("ann", o2);
  const due = c.errand.ann.due;
  ok(due === S.save.day + 2, `errands: due is not the day accepted plus its days (${due})`);
  // "within 2 days" is 2 trips: open, it reads 2 then 1 day left (never 0), and coming home on the due day unfilled drops it
  const left = [];
  while (c.errand.ann && S.save.day < due) {
    left.push(S.requestVars(S.request("ann")).days);
    tripHome(S);
  }
  ok(same(left, [2, 1]), `errands: the days left on each day it was open were ${JSON.stringify(left)}, not [2, 1]`);
  ok(S.save.day === due && c.errand.ann === null && S.trust("ann") === 1 && S.crewReport("ann").late === "soil", `errands: an errand not filled by its due day is not dropped with loss.late and a report (day ${S.save.day}, due ${due}, trust ${S.trust("ann")})`);
  ok(S.crewReportItems("ann").some((x) => x.key === "late" && x.vars.item === W.ITEMS.soil.name), "crewReportItems: late");
  // filled but not handed in: never late
  const o3 = S.offer("ann");
  S.accept("ann", o3);
  tripHome(S, { seeds: 5 });
  for (let i = 0; i < 6; i++) tripHome(S);
  ok(c.errand.ann && c.errand.ann.id === "ann-e1", "errands: a filled errand went late before it was handed in");
  ok(S.giveUp("ann") === true && c.errand.ann === null && S.trust("ann") === 0, "giveUp: an errand is still open or trust went below 0");
  // filled by the very trip that comes home on its due day: in time
  const o4 = S.offer("ann");
  S.accept("ann", o4);
  tripHome(S);
  tripHome(S, { soil: 1 });
  ok(S.save.day === c.errand.ann.due && S.handInReady("ann") && S.handIn("ann") && S.trust("ann") === 3, "errands: items brought home on the due day did not fill the errand in time");
  // reward kinds: kits and crowbars
  const b = S.offer("bo");
  ok(b.kind === "quest", "errands: Bo's story quest comes first");
  S.save.crew.quests["bo-1"] = { state: "done", day: 1, doneDay: 1 };
  const be = S.offer("bo");
  S.accept("bo", be);
  tripHome(S, { nails: 1 });
  const bars = S.save.crowbars;
  S.handIn("bo");
  ok(S.save.crowbars === bars + 1, "handIn: an errand's crowbar not paid");
});

group("raids: crewHurt", () => {
  const { S } = synthetic();
  S.addTrust("bo", 10);
  S.save.inventory.meds = 1;
  S.save.food = 5;
  ok(S.crewHurt("bo") === "a medical kit" && S.save.inventory.meds === 0 && S.save.food === 5 && S.trust("bo") === 7, "crewHurt: not 1 medical kit from storage and loss.hurt trust");
  ok(S.crewHurt("bo") === "2 food" && S.save.food === 3 && S.trust("bo") === 4, "crewHurt: with no kit, not 2 food");
  S.save.food = 1;
  ok(S.crewHurt("bo") === "1 food" && S.save.food === 0 && S.trust("bo") === 1, "crewHurt: with 1 food left, not 1 food taken and said (or food went below 0)");
  ok(S.crewHurt("bo") === "0 food" && S.save.food === 0 && S.trust("bo") === 0, "crewHurt: an empty pantry is said to lose food, or trust went below 0");
  const items = S.crewReportItems("bo").filter((x) => x.key === "hurt");
  ok(items.length === 4 && items[0].vars.who === "Bo" && items[0].vars.cost === "a medical kit" && items[1].vars.cost === "2 food" && items[2].vars.cost === "1 food", `crewReportItems: hurt ${JSON.stringify(items)}`);
  S.clearReport("bo");
  ok(same(S.crewReport("bo"), {}) && same(S.crewReportItems("bo"), []), "clearReport: the report is not empty");
});

group("work, reports, repairs", () => {
  const { S, W } = synthetic();
  ok(S.crewRepairCost("fence") === W.SETTINGS.fenceRepairScrap && S.crewRepairCost("cabin") === W.SETTINGS.houseRepairScrap, "crewRepairCost: not the usual scrap");
  S.save.scrap = W.SETTINGS.houseRepairScrap;
  ok(S.crewRepairPay("cabin") === W.SETTINGS.houseRepairScrap && S.save.scrap === 0, "crewRepairPay: not paid");
  ok(S.crewRepairPay("fence") === 0 && S.save.scrap === 0, "crewRepairPay: scrap went below 0");
  S.logWork("bo", "fence", 3, 3);
  S.logWork("bo", "cabin", 1, 2);
  S.logWork("ann", "heal", 40);
  const bo = S.crewReportItems("bo");
  ok(same(bo, [{ key: "fence", vars: { fixed: 3, scrap: 3 } }, { key: "cabin", vars: { fixed: 1, scrap: 2 } }]), `crewReportItems: work ${JSON.stringify(bo)}`);
  ok(S.crewReport("bo").scrap === 5, "logWork: report.scrap is not the scrap paid");
  ok(same(S.crewReportItems("ann"), [{ key: "heal", vars: { hp: 40 } }]), "crewReportItems: heal");
  S.save.crew.quests["bo-1"] = { state: "done", day: 1, doneDay: 1 };
  ok(S.crewFx().crewRepairFree === true && S.crewRepairCost("fence") === 0 && S.crewRepairCost("cabin") === 0, "crewRepairFree: repairs still cost scrap");
  S.clearReport("bo");
  S.logWork("bo", "fence", 2, 0);
  ok(same(S.crewReportItems("bo"), [{ key: "fenceFree", vars: { fixed: 2 } }]), "logWork: fence work with crewRepairFree is not fenceFree");
  const scrap = S.save.scrap;
  tripHome(S);
  ok(S.save.scrap === scrap + 4, `returnHome: the scrapPerDay perk did not pay (${S.save.scrap - scrap})`);
});

group("perks: crowbarCost, vanHp, medsPerDay, only once done", () => {
  const { S, W } = synthetic();
  const c = S.save.crew;
  ok(S.canCraftTool("crowbar").scrap === W.TOOLS.crowbar.scrap, "canCraftTool: not the usual crowbar cost");
  c.quests["ann-1"] = { state: "done", day: 2, doneDay: 2 }; // so ann-2 is the open one
  const van0 = S.vanMaxHp();
  c.quests["ann-2"] = { state: "found", day: 2, doneDay: null };
  ok(S.crewFx().crowbarCost === null && S.vanMaxHp() === van0, "crewFx: a quest not handed in gives its perk");
  const had = { bars: S.save.crowbars, spike: S.save.traps.spike };
  const r = S.handIn("ann");
  ok(r && r.def.id === "ann-2" && S.save.crowbars === had.bars + 1 && S.save.traps.spike === had.spike + 1, "handIn: crowbars or traps not paid");
  ok(S.canCraftTool("crowbar").scrap === 5, "canCraftTool: the crowbarCost perk is not the cost");
  S.save.scrap = 5;
  const bars = S.save.crowbars;
  ok(S.craftTool("crowbar") === true && S.save.scrap === 0 && S.save.crowbars === bars + 1, "craftTool: the crowbarCost perk is not what it takes");
  ok(S.vanMaxHp() === van0 + 15, "effects: the vanHp perk is not in the van's health");
  const meds = S.save.inventory.meds || 0;
  tripHome(S);
  tripHome(S);
  ok((S.save.inventory.meds || 0) === meds + 1, "returnHome: a medsPerDay perk of 0.5 does not make a kit in two days");
});

group("the dog", () => {
  const g = synthetic();
  const { S } = g;
  const o = S.offer("cy");
  S.accept("cy", o);
  S.commit();
  ok(same(S.questsAt("grocery").map((q) => q.id), ["cy-1"]) && S.questsAt("grocery")[0].kind === "dog", "questsAt: the dog does not wait at its building");
  ok(S.nameDog("Rex") === false, "nameDog: named before it is home");
  S.startTrip();
  ok(S.takeQuestObject("cy-1") === false, "takeQuestObject: took the dog as an object");
  ok(S.takeDog("cy-1") === true && S.trip.dog === true && S.questHeld("cy-1") && same(S.questsAt("grocery"), []), "takeDog: the dog does not follow you");
  ok(S.takeDog("cy-1") === false, "takeDog: twice");
  S.abandonTrip();
  ok(!S.dogHome() && S.save.crew.quests["cy-1"].state === "active" && S.questsAt("grocery").length === 1, "abandonTrip: the dog is not back in its building after a death");
  const entry = tripHome(S, {}, () => S.takeDog());
  ok(S.dogHome() && S.save.crew.quests["cy-1"].state === "found" && same(entry.quests, ["cy-1"]), "returnHome: the dog is not home, its quest not found, or not in entry.quests");
  ok(S.handInReady("cy") && S.handIn("cy").kind === "quest", "handIn: the dog quest");
  ok(S.dogName() === "", "dogName: named before it was named");
  ok(S.nameDog("  R3x!! the  Great-Dog's  ") === "Rx the Great-D" && S.dogName() === "Rx the Great-D", `nameDog: not sanitized (${S.dogName()})`);
  ok(S.nameDog("1234 !!") === false && S.nameDog("'-'") === false && S.nameDog("") === false && S.dogName() === "Rx the Great-D", "nameDog: a name with no letters was kept");
  ok(S.nameDog("Zoë") === "Zoë", "nameDog: a letter with an accent was dropped");
  ok(S.nameDog("Zoe\u0308") === "Zo\u00eb", "nameDog: an accent typed as a separate mark (e + U+0308) was dropped");
  const astral = "\u{1D4D0}".repeat(20); // a letter outside the BMP: two UTF-16 units each
  ok(S.nameDog(astral) === "\u{1D4D0}".repeat(14), "nameDog: the 14-character cap cuts by UTF-16 units, not characters");
  ok(S.nameDog("A".repeat(30)) === "A".repeat(14), "nameDog: a long name is not cut to 14 characters");
  ok(S.nameDog("Moss") === "Moss", "nameDog: a plain name");
  ok(g.ZSR.crewFill("{dog} wags.") === "Moss wags.", "crewFill: {dog} is not the dog's name");
  // it eats 1 food every dogFoodEvery (2) days: 3 in 6 days, never below 0
  S.save.food = 30;
  for (let i = 0; i < 6; i++) tripHome(S);
  const eaten = 30 - S.save.food - 6 * g.W.SETTINGS.foodPerTrip;
  ok(eaten === 3, `the dog: ate ${eaten} food in 6 days (1 every 2 days is 3)`);
  S.save.food = 0;
  tripHome(S);
  tripHome(S);
  ok(S.save.food === 0, "the dog: food went below 0");
  ok(S.nextTopic("ann").id === "ann-t1", "the dog: broke the topics");
});

group("words: crewText falls back to the facts, crewFill fills", () => {
  const g = synthetic();
  const { S, ZSR: Z } = g;
  Z.TEXT = {
    1: { level: 1, crew: {} },
    3: {
      level: 3,
      crew: {
        talk: { "ann-t1": { title: "Ann's story", text: "Words at three." } },
        tips: { bo: { fine: "Bo says fine at three." } },
        reports: { late: "Late {item} at three." },
        quests: { "ann-1": { title: "The bag", brief: "Brief at three." } },
        errands: { "ann-e1": { done: "Done at three." } },
        dog: { named: "{dog} at three." },
      },
    },
    5: { level: 5, crew: { talk: { "ann-t1": { title: "", text: "  " } } } },
  };
  const T = Z.crewText;
  S.settings.level = 3;
  ok(T("talk", "ann-t1") === "Words at three." && T("talk", "ann-t1", "title") === "Ann's story", "crewText: talk words at the level");
  S.settings.level = 1;
  ok(T("talk", "ann-t1") === "Words at three.", "crewText: not the nearest level that has the words");
  S.settings.level = 5;
  ok(T("talk", "ann-t1") === "Words at three.", "crewText: empty words at a level were used");
  ok(T("talk", "ann-t2") === "Ann tells a day three story." && T("talk", "ann-t2", "title") === "Ann", "crewText: talk does not fall back to the facts (title: the speaker)");
  ok(T("talk", "ann-m1") === "Ann hums.", "crewText: a mood");
  ok(T("tip", "bo", "fine") === "Bo says fine at three." && T("tip", "bo", "van") === "{hp} of {max}, {cost} scrap.", "crewText: tip");
  ok(T("report", "late") === "Late {item} at three." && T("report", null, "late") === T("report", "late") && T("report", "hurt") === "{who} was hurt; it cost {cost}.", "crewText: report");
  ok(T("quest", "ann-1", "brief") === "Brief at three." && T("quest", "ann-1", "tag") === "Ann's bag." && T("quest", "ann-1", "title") === "The bag", "crewText: quest");
  ok(T("quest", "ann-2", "title") === "Ann's tin" && T("quest", "cy-1", "title") === "Cy" && T("quest", "cy-1", "tag") === "", "crewText: quest title from the object (a dog quest: the giver), and no tag for the dog");
  ok(T("quest", "ann-1", "journal") === "The bag came home." && T("quest", "ann-1", "after") === "Ann tells you about the bag.", "crewText: quest journal and after");
  ok(T("errand", "ann-e1", "done") === "Done at three." && T("errand", "ann-e1", "title") === g.W.ITEMS.seeds.name && T("errand", "ann-e1", "brief") === "Ann asks for {count} {item} within {days} days for {reward}.", "crewText: errand");
  ok(T("dog", null, "ask") === "Name the dog." && T("dog", "named") === "{dog} at three." && T("dog", null, "pet") === "{dog} wags.", "crewText: dog");
  ok(T("talk", "nope") === "" && T("quest", "nope", "brief") === "" && T("weird", "x") === "", "crewText: an unknown text is not an empty string");
  const filled = Z.crewFill(T("errand", "ann-e1", "brief"), S.requestVars(S.offer("ann")));
  ok(!/[{}]/.test(filled) && /25 scrap/.test(filled), `crewFill: ${filled}`);
  ok(Z.crewFill("Fixed 1 holes and 2 holes in {x}.", {}) === "Fixed 1 hole and 2 holes in {x}.", "crewFill: 1 holes, or an unknown placeholder was not left");
  ok(Z.crewFill("{dog} wags.", {}) === "the dog wags." && Z.crewFill("{dog}!", { dog: "Rex" }) === "Rex!", "crewFill: {dog} with no dog home, or given");
  ok(Z.crewFill("{dog} wags.", { dog: "" }) === "the dog wags.", "crewFill: {dog} given as an empty name is left unfilled");
  ok(Z.crewName("ann") === "Ann" && Z.crewName("zed") === "zed", "crewName");
  ok(S.rewardWords({ scrap: 30, items: { lumber: 2 }, kits: 1 }) === "30 scrap, 2 " + g.W.ITEMS.lumber.name + " and 1 medical kit" && S.rewardWords({ crowbars: 2 }) === "2 crowbars", "rewardWords");
  const spike = g.W.TRAPS.spike.name;
  ok(S.rewardWords({ traps: { spike: 2 } }) === "2 " + spike + "s" && S.rewardWords({ traps: { spike: 1 } }) === "1 " + spike, `rewardWords: traps (${S.rewardWords({ traps: { spike: 2 } })})`);
});

group("words read: seeCrewTalk", () => {
  const { S } = synthetic();
  const w0 = S.save.stats.wordsRead;
  ok(S.seeCrewTalk("talk:ann-t1", 12) === true && S.save.stats.wordsRead === w0 + 12, "seeCrewTalk: words not counted");
  ok(S.seeCrewTalk("talk:ann-t1", 12) === false && S.save.stats.wordsRead === w0 + 12, "seeCrewTalk: the same text counted twice");
  ok(S.save.crew.read.includes("talk:ann-t1"), "seeCrewTalk: the key is not kept in save.crew.read");
  tripHome(S, {}, () => S.seeCrewTalk("quest:ann-1:brief", 30));
  ok(S.save.stats.wordsRead === w0 + 42, "seeCrewTalk: words read on a trip not added at home");
});

group("old saves", () => {
  const g = synthetic();
  const { S, sb, W } = g;
  const old = JSON.parse(JSON.stringify(S.save));
  delete old.crew;
  sb.localStorage.setItem("zs.save.1", JSON.stringify(old));
  S.loadSave(1);
  const c = S.save.crew;
  ok(c && same(Object.keys(c.trust), ["ann", "bo", "cy"]) && same(c.errand, { ann: null, bo: null, cy: null }) && Array.isArray(c.heard) && Array.isArray(c.read) && c.dog.home === false, "upgradeSave: a save with no crew does not get every field");
  ok(S.offer("bo") && S.crewTalk("bo"), "upgradeSave: an old save cannot talk or be offered a quest");
  S.startTrip();
  ok(same(S.trip.quest, []) && S.trip.dog === false, "startTrip: an old save's trip lacks quest and dog");
  S.trip = null;
  // a crew member added later, and fields missing from an older crew field
  S.save.crew.trust = { ann: 4 };
  delete S.save.crew.report.cy;
  delete S.save.crew.errand.cy;
  delete S.save.crew.read;
  delete S.save.crew.talks;
  delete S.save.crew.dog.fed;
  S.commit();
  W.CREW.dan = { name: "Dan", pronoun: "he", jobs: [], posts: [] };
  S.loadSave(1);
  const d = S.save.crew;
  ok(d.trust.ann === 4 && d.trust.bo === 0 && d.trust.dan === 0, `upgradeSave: trust ${JSON.stringify(d.trust)}`);
  ok(same(d.report.cy, {}) && same(d.report.dan, {}) && d.errand.cy === null && d.errand.dan === null && d.talkDay.dan === 0 && d.mood.dan === 0 && d.errandNext.dan === 0, "upgradeSave: a crew id added later does not get its fields");
  ok(Array.isArray(d.read) && d.talks.ann === 0 && d.dog.fed === 0, "upgradeSave: fields missing from an older crew field are not filled");
  ok(S.offer("dan") === null && S.nextTopic("dan") === null && S.crewTip("dan") === null && same(S.crewJobs("dan"), []), "a crew member with no facts: offers, topics, tips or jobs");
});

group("an empty roster and no quests", () => {
  const g = loadGame({
    afterFacts(Z) {
      Object.assign(Z.WORLD, { CREW: {}, CREW_TALK: {}, CREW_TIPS: {}, CREW_REPORTS: {}, ERRANDS: {}, QUESTS: [], DOG: undefined });
      delete Z.WORLD.CREW_RULES;
      Z.TEXT = {};
    },
  });
  const { S, ZSR: Z } = g;
  S.newGame(1, "Empty");
  ok(same(S.crewIds(), []) && same(S.save.crew.trust, {}), "empty roster: crew field");
  ok(S.offer("june") === null && S.nextTopic("june") === null && same(S.questsAt("grocery"), []) && S.crewTip("june") === null, "empty roster: something offered");
  tripHome(S, { seeds: 2 });
  ok(S.save.day === 2 && S.crewFx().foodPerDay === 0 && Z.crewText("dog", null, "ask") === "" && Z.crewText("talk", "x") === "", "empty roster: a day does not pass cleanly");
});

/* =====================================================================================================
   3. The real facts
   ===================================================================================================== */
// the placeholders the engine fills, by text (docs/CREW.md "Words"); {dog} is filled everywhere
const TIP_VARS = { hungry: [], food: ["food", "days"], ready: ["room"], build: ["room", "needs"], heal: ["hp"], van: ["hp", "max", "cost"], vanFree: ["hp", "max"], fence: ["holes", "cracks"], cabin: ["broken"], crowbar: [], fine: [], wave: ["size", "sides"], keys: ["keys"], walkers: ["days"], radio: [] };
const REPORT_VARS = { fence: ["fixed", "scrap"], fenceFree: ["fixed"], cabin: ["fixed", "scrap"], hurt: ["who", "cost"], late: ["item"], heal: ["hp"] };
const ERRAND_VARS = ["count", "item", "days", "reward"];
// {reward} only where the request or the thank-you is shown with its reward (the card, the bubble, the backpack); the tag
// (building), the journal line (day page), the title and the payoff topic are shown with no request at hand
const QUEST_VARS = { brief: ["reward"], done: ["reward"], title: [], tag: [], journal: [], after: [] };
const WHEN_KEYS = ["day", "stars", "quest", "note", "room", "level", "dog"];
/** A day past every `day` gate in the crew facts (topics and quests), so the late-game checks hold whatever the gates say. */
function lateDay(W) {
  const days = (W.QUESTS || []).map((q) => (q.when && q.when.day) || 0);
  Object.values(W.CREW_TALK || {}).forEach((T) => ((T && T.topics) || []).forEach((t) => days.push((t.when && t.when.day) || 0)));
  return Math.max(30, ...days) + 1;
}
let real = { quests: 0, topics: 0, texts: 0, skipped: false };

group("real facts: every crew text at every level", () => {
  const g = loadGame({ content: true });
  const { S, W, ZSR: Z } = g;
  S.newGame(1, "Words");
  const CREW = W.CREW || {};
  const QUESTS = W.QUESTS || [];
  if (!Object.keys(CREW).length && !QUESTS.length) {
    real.skipped = true;
    return;
  }
  const levels = Object.keys(Z.TEXT || {}).map(Number).sort();
  /** The text has words, and only the placeholders this text is given. */
  function text(where, t, allowed) {
    real.texts++;
    if (!ok(typeof t === "string" && t.trim().length > 0, `${where}: no words`)) return;
    const bad = [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => k !== "dog" && !allowed.includes(k));
    ok(!bad.length, `${where}: {${bad.join("}, {")}} is not filled here (allowed: ${allowed.concat("dog").join(", ")})`);
  }
  const PERKS = Object.keys(S.crewFx());
  levels.forEach((lv) => {
    S.settings.level = lv;
    const at = (s) => `level ${lv} ${s}`;
    Object.keys(CREW).forEach((id) => {
      const T = (W.CREW_TALK || {})[id] || {};
      (T.topics || []).concat(T.moods || []).forEach((tp) => {
        text(at(`talk ${tp.id}`), Z.crewText("talk", tp.id), []);
        text(at(`talk ${tp.id} title`), Z.crewText("talk", tp.id, "title"), []);
      });
      Object.keys((W.CREW_TIPS || {})[id] || {}).forEach((tip) => {
        if (ok(TIP_VARS[tip], `CREW_TIPS.${id}.${tip}: the engine has no rule for this tip`)) text(at(`tip ${id}.${tip}`), Z.crewText("tip", id, tip), TIP_VARS[tip]);
      });
      ((W.ERRANDS || {})[id] || []).forEach((e) => ["title", "brief", "done"].forEach((sub) => text(at(`errand ${e.id} ${sub}`), Z.crewText("errand", e.id, sub), ERRAND_VARS)));
    });
    Object.keys(W.CREW_REPORTS || {}).forEach((k) => {
      if (ok(REPORT_VARS[k], `CREW_REPORTS.${k}: not a report the engine gives`)) text(at(`report ${k}`), Z.crewText("report", k), REPORT_VARS[k]);
    });
    QUESTS.forEach((q) => {
      ["title", "brief", "journal", "done", "after"].concat(q.kind === "dog" ? [] : ["tag"]).forEach((sub) => text(at(`quest ${q.id} ${sub}`), Z.crewText("quest", q.id, sub), QUEST_VARS[sub]));
    });
    if (W.DOG) ["ask", "named", "pet"].forEach((k) => text(at(`dog ${k}`), Z.crewText("dog", null, k), []));
  });
  // the facts the engine reads
  Object.keys(CREW).forEach((id) => {
    const T = (W.CREW_TALK || {})[id] || {};
    (T.topics || []).forEach((tp) => ok(Object.keys(tp.when || {}).every((k) => WHEN_KEYS.includes(k)), `CREW_TALK ${tp.id}: unknown when key in ${JSON.stringify(tp.when)}`));
    ((CREW[id] || {}).jobs || []).forEach((j) => ok(["fence", "cabin", "heal", "lookout"].includes(j.job), `CREW.${id}: unknown job ${j.job}`));
    ((W.ERRANDS || {})[id] || []).forEach((e) => {
      ok(W.ITEMS[e.item] && e.item !== "food", `ERRANDS ${e.id}: item ${e.item} is not an ITEMS id (or is food)`);
      ok(Array.isArray(e.count) && e.count[0] >= 1 && e.count[1] >= e.count[0] && e.days >= 1, `ERRANDS ${e.id}: count [min, max] and days`);
    });
  });
  QUESTS.forEach((q) => {
    ok(CREW[q.giver], `QUESTS ${q.id}: giver ${q.giver} is not in CREW`);
    ok(W.LOCATIONS.some((l) => l.id === q.at), `QUESTS ${q.id}: at ${q.at} is not a LOCATIONS id`);
    ok(Object.keys(q.when || {}).every((k) => WHEN_KEYS.includes(k)), `QUESTS ${q.id}: unknown when key in ${JSON.stringify(q.when)}`);
    Object.keys((q.reward && q.reward.perk) || {}).forEach((k) => ok(PERKS.includes(k), `QUESTS ${q.id}: perk ${k} is not an engine perk (${PERKS.join(", ")})`));
    Object.keys((q.reward && q.reward.items) || {}).forEach((k) => ok(W.ITEMS[k], `QUESTS ${q.id}: reward item ${k} is not an ITEMS id`));
    Object.keys((q.reward && q.reward.traps) || {}).forEach((k) => ok(W.TRAPS[k], `QUESTS ${q.id}: reward trap ${k} is not a TRAPS id`));
  });
  ok(new Set(QUESTS.map((q) => q.id)).size === QUESTS.length, "QUESTS: an id is used twice");
  ok(QUESTS.filter((q) => q.kind === "dog").length <= 1, "QUESTS: more than one dog quest (trip.dog is one dog)");
});

group("real facts: every topic can be told, in order", () => {
  const g = loadGame();
  const { S, W } = g;
  if (!Object.keys(W.CREW || {}).length) return;
  S.newGame(1, "Topics");
  // every gate open: late in the game, full trust, every quest done, every note read, every room built, the dog home
  S.save.day = lateDay(W);
  S.crewIds().forEach((id) => S.addTrust(id, 1000));
  (W.QUESTS || []).forEach((q) => (S.save.crew.quests[q.id] = { state: "done", day: 1, doneDay: 1 }));
  Object.keys(S.save.rooms).forEach((k) => (S.save.rooms[k] = 3));
  Object.entries(W.NOTES).forEach(([locId, N]) => [N.door].concat(N.notes || []).forEach((n) => n && S.save.backpack.push({ noteId: n.id, locId, found: "", day: 1 })));
  S.save.crew.dog.home = true;
  S.crewIds().forEach((id) => {
    const T = (W.CREW_TALK || {})[id] || {};
    const told = [];
    for (let i = 0; i < 200; i++) {
      const t = S.nextTopic(id);
      if (!t || t.mood) break;
      told.push(t.id);
      S.markTopic(id, t.id);
    }
    const afters = (W.QUESTS || []).filter((q) => q.giver === id).map((q) => q.id);
    const want = afters.concat((T.topics || []).map((t) => t.id));
    real.topics += want.length;
    ok(same(told, want), `topics: ${id} told ${told.join(", ")}; want the quest payoffs then every topic in order: ${want.join(", ")}`);
    if ((T.moods || []).length) {
      const moods = [];
      for (let i = 0; i < T.moods.length; i++) {
        const t = S.nextTopic(id);
        moods.push(t.id);
        S.markTopic(id, t.id);
      }
      ok(same(moods, T.moods.map((m) => m.id)) && S.nextTopic(id).id === T.moods[0].id, `topics: ${id}'s moods do not take turns (${moods})`);
    }
  });
});

group("real facts: every story quest through the state API", () => {
  const g = loadGame();
  const { S, W } = g;
  const QUESTS = W.QUESTS || [];
  if (!QUESTS.length) return;
  S.newGame(1, "Quests");
  S.save.day = lateDay(W);
  W.LOCATIONS.forEach((l) => !S.save.known.includes(l.id) && S.save.known.push(l.id));
  S.crewIds().forEach((id) => S.addTrust(id, 1000));
  Object.entries(W.NOTES).forEach(([locId, N]) => [N.door].concat(N.notes || []).forEach((n) => n && S.save.backpack.push({ noteId: n.id, locId, found: "", day: 1 })));
  Object.keys(S.save.rooms).forEach((k) => (S.save.rooms[k] = 3));
  const done = [];
  for (let round = 0; round < QUESTS.length + 2; round++) {
    let moved = false;
    S.crewIds().forEach((id) => {
      const o = S.offer(id);
      if (!o || o.kind !== "quest") return;
      const q = o.def;
      const order = QUESTS.filter((x) => x.giver === id).map((x) => x.id);
      ok(order.indexOf(q.id) === done.filter((d) => d.startsWith(id + ":")).length, `quests: ${id} offered ${q.id} out of order`);
      ok(!S.questsAt(q.at).some((x) => x.id === q.id), `quests: ${q.id} waits in ${q.at} before it is accepted`);
      S.accept(id, o);
      ok(S.questsAt(q.at).some((x) => x.id === q.id), `quests: ${q.id} does not wait in ${q.at} once accepted`);
      const entry = tripHome(S, {}, () => ok(q.kind === "dog" ? S.takeDog(q.id) : S.takeQuestObject(q.id), `quests: ${q.id} could not be picked up`));
      ok(S.save.crew.quests[q.id].state === "found" && (entry.quests || []).includes(q.id), `quests: ${q.id} is not found at home and in the day log`);
      if (q.kind === "dog") ok(S.dogHome(), `quests: ${q.id} did not bring the dog home`);
      const scrap = S.save.scrap;
      const r = S.handIn(id);
      ok(r && r.def.id === q.id && S.save.scrap >= scrap + ((q.reward && q.reward.scrap) || 0), `quests: ${q.id} was not handed in with its scrap`);
      const perk = (q.reward && q.reward.perk) || {};
      Object.entries(perk).forEach(([k, v]) => ok(typeof v === "boolean" ? S.crewFx()[k] === v : k === "crowbarCost" ? S.crewFx()[k] <= v : S.crewFx()[k] >= v, `quests: ${q.id}'s perk ${k} is not active once done`));
      done.push(id + ":" + q.id);
      moved = true;
    });
    if (!moved) break;
  }
  real.quests = done.length;
  ok(done.length === QUESTS.length, `quests: only ${done.length} of ${QUESTS.length} story quests could be offered and done (stuck: ${QUESTS.filter((q) => !done.includes(q.giver + ":" + q.id)).map((q) => q.id).join(", ")})`);
  // afterwards: errands
  S.crewIds().forEach((id) => {
    const list = (W.ERRANDS || {})[id] || [];
    const o = S.offer(id);
    if (list.length) ok(o && o.kind === "errand" && o.count >= list[0].count[0] && o.count <= list[0].count[1], `errands: ${id} offers no errand once the story quests are done`);
  });
});

/* =====================================================================================================
   4. The engine with the crew: the yard and the buildings (js/crew.js, js/building.js)
   Add simulations here: const g = loadGame({ engine: true, content: true }); g.S.newGame(1, "Yard"); then
   g.I.enterYard(...), step g.I.yardUpdate(dt), and check g.I.crew. Keep each in its own group().
   ===================================================================================================== */
group("engine: loads with the crew state", () => {
  const g = loadGame({ engine: true });
  g.S.newGame(1, "Engine");
  ok(g.I && typeof g.I.enterYard === "function", "engine: the Interior did not load");
  ok(g.S.save.crew && typeof g.S.offer === "function", "engine: the crew state did not load with the engine");
});

if (errors.length) {
  errors.forEach((e) => console.log("ERROR " + e));
  console.log(`\n${errors.length} crew problem(s).`);
  process.exit(1);
}
console.log(
  `OK: crew: ${checks} checks. State on a synthetic crew (trust and stars, talk once a day, topics and moods, tips, offers in order with their gates, ` +
    `quests picked up, lost to a death, found at home and handed in with rewards and perks, errands, give up, raids, reports, the dog, words, old saves, an empty roster); ` +
    (real.skipped ? "the real crew facts are still empty (skipped)." : `the real facts: ${real.texts} texts at every level, ${real.topics} topics told in order, ${real.quests} story quests run through.`)
);
