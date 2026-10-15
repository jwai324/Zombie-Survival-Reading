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
     4. The engine with the real facts and words (js/crew.js, js/building.js), Math.random seeded: the yard (the crew's
        props, every post at every room level, ten minutes of wandering, the fence and cabin jobs, the shelter in a
        wave, a raid, Pip's calls, facing and E, the bubble and the card, the dog at home and its name), the buildings
        (story objects placed once accepted and walked onto, a death, home; the dog through the doors; guns off the
        quest spots) and a whole play-through (every story quest, errands, perks, the save loaded back each day).
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
// the fact files, in page order, as index.html loads them: the layouts, the world and every js/story*.js (a fact
// file split off into another story file, story-quests2.js say, is loaded and checked here too)
const FACTS = PAGE.filter((f) => f === "layouts.js" || f === "world.js" || /^story[\w-]*\.js$/.test(f));
if (!["layouts.js", "world.js", "story-crew.js"].every((f) => FACTS.includes(f))) throw new Error("validate-crew: index.html does not load layouts.js, world.js and story-crew.js (" + FACTS.join(", ") + ")");
const STATE = FACTS.concat(["upgrades.js", "weapons.js", "state.js", "crewstate.js"]);
const ENGINE = STATE.concat(["audio.js", "sprites.js", "sprites3d.js", "walker3d.js", "walker3d-looks.js", "decor.js", "locks.js", "landmarks1.js", "landmarks2.js", "yardart.js", "houseart.js", "riverart.js", "crewart.js", "streets.js", "interior.js", "building.js", "yard.js", "house.js", "crew.js", "river.js"]);

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
      cy: { wave: f("{size} from {sides}."), keys: f("You hold {keys}."), walkers: f("{days} days."), radio: f("The radio."), full: f("Every building is full.") },
    },
    CREW_REPORTS: { fence: f("Bo fixed {fixed} for {scrap} scrap."), fenceFree: f("Bo fixed {fixed} free."), cabin: f("Bo fixed {fixed} doors for {scrap}."), cabinFree: f("Bo fixed {fixed} doors free."), hurt: f("{who} was hurt; it cost {cost}."), late: f("The {item} errand ran out.") },
    ERRANDS: {
      ann: [
        { id: "ann-e1", item: "seeds", count: [2, 3], days: 3, reward: { scrap: 25 }, facts: ["Ann asks for {count} {item} within {days} days for {reward}."], done: ["Ann thanks you for the seeds."] },
        { id: "ann-e2", item: "soil", count: [1, 1], days: 2, reward: { kits: 1 }, facts: ["Ann asks for {count} {item}."], done: ["Ann pats the soil."] },
        // nails: on the shelves of Reyes Hardware, known at the start (seeds and soil: Greenhouse Row, which is not)
        { id: "ann-e3", item: "nails", count: [1, 1], days: 2, reward: { scrap: 15 }, facts: ["Ann asks for {count} {item}."], done: ["Ann hangs a picture."] },
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
  const { S, W } = synthetic();
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
  // trust stops at the top star's points, so one loss at five stars shows as four
  const top = W.CREW_RULES.stars[W.CREW_RULES.stars.length - 1];
  ok(S.trust("ann") === top, `addTrust: trust ran past the top star's ${top} points (${S.trust("ann")})`);
  S.addTrust("ann", -W.CREW_RULES.loss.hurt);
  ok(S.stars("ann") === 4 && S.trust("ann") === top - W.CREW_RULES.loss.hurt, `addTrust: one loss at five stars does not show as four (${S.trust("ann")} points, ${S.stars("ann")} stars)`);
  // an older save that ran past the top: its first loss shows too
  S.save.crew.trust.ann = 86;
  S.addTrust("ann", -1);
  ok(S.trust("ann") === top - 1 && S.stars("ann") === 4, `addTrust: a save holding 86 points lost 1 and still shows ${S.stars("ann")} stars (${S.trust("ann")} points)`);
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
  // the known buildings (not River Landing, which has no walkers): the quietest is the last to fill
  const buildings = () => W.LOCATIONS.filter((l) => l.danger > 0 && !l.outdoor && l.type !== "base" && S.isKnown(l.id));
  const d = Math.min(...buildings().map((l) => l.danger));
  const wpl = (k) => W.SETTINGS.walkersPerLocation(d, S.save.day + k);
  ok(days > 0 && wpl(days) > wpl(0) && wpl(days - 1) === wpl(0), `tips: walkers in ${days} days is not when the count goes up`);
  // full: a building whose count never rises again (SETTINGS.walkersPerLocation's cap)
  const fullOn = (dd) => {
    for (let day = 1; day <= 1000; day++) if (W.SETTINGS.walkersPerLocation(dd, day) === W.SETTINGS.walkersPerLocation(dd, day + 1000)) return day;
    return null;
  };
  const day0 = S.save.day;
  const known0 = S.save.known.slice();
  const lastFull = fullOn(d);
  if (ok(lastFull, "tips: the quietest known building never fills, so Pip's walkers tip can never be checked at the cap")) {
    S.save.day = lastFull - 1;
    ok(tips("cy").includes("walkers") && S.crewTips("cy").regular.find((t) => t.tip === "walkers").vars.days === 1, "tips: the walkers tip is not told the day before the last known building fills");
    ok(!S.crewTips("cy").fallback.length, "tips: Pip's fallback (full) applies while a known building still fills");
    S.save.day = lastFull;
    ok(!tips("cy").includes("walkers"), `tips: Pip's walkers tip is told on day ${lastFull}, with every known building full`);
    // with nothing else to tell, Pip says the town is as full as it gets (the fallback): every talk tells one thing
    const full = S.crewTip("cy");
    ok(full && full.tip === "full" && same(full.vars, {}), `tips: with every known building full, Pip's tip is ${JSON.stringify(full)}, not the fallback "full"`);
    ok(S.crewTip("bo").tip !== "full", "tips: a crew member without the full tip told it");
  }
  // only the known buildings count: with only the busiest building known, the tip stops once that one is full,
  // while a quieter one, not yet known, still fills
  const busy = W.LOCATIONS.filter((l) => l.danger > 0 && !l.outdoor && l.type !== "base").sort((a, b) => b.danger - a.danger)[0];
  const busyFull = fullOn(busy.danger);
  if (busyFull && busyFull < lastFull) {
    S.save.known = ["base", busy.id];
    S.save.day = busyFull;
    ok(!tips("cy").includes("walkers"), `tips: Pip's walkers tip is told on day ${busyFull} with only ${busy.id} known, and it is full`);
    S.save.known.push(known0.find((k) => W.LOCATIONS.some((l) => l.id === k && l.danger === d && !l.outdoor)));
    ok(tips("cy").includes("walkers"), `tips: Pip's walkers tip is not told on day ${busyFull} with a quieter building known, not yet full`);
  }
  S.save.day = day0;
  S.save.known = known0;
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
  // told until its words have been read once (State.seeCrewTalk keeps "tip:<crew>:radio"), never again after
  S.seeCrewTalk("tip:cy:radio", 9);
  ok(!tips("cy").includes("radio"), "tips: the radio tip comes back after it was read");
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
  // day 1: Ann's first quest needs day 2, and errands wait for her first story quest to be handed in
  ok(S.offer("ann") === null, `offer: day 1, before Ann's first story quest is handed in, she asks for something (${JSON.stringify(S.offer("ann"))})`);
  ok(S.offer("bo").kind === "quest" && S.offer("bo").def.id === "bo-1", "offer: Bo's day-1 quest at a known place");
  ok(S.offer("cy").kind === "quest" && S.offer("cy").def.kind === "dog", "offer: Cy's dog quest");
  ok(S.offer("nobody") === null, "offer: an unknown crew member offers");
  S.save.day = 2;
  const o2 = S.offer("ann");
  ok(o2.kind === "quest" && o2.def.id === "ann-1", "offer: day 2 should be Ann's first story quest");
  ok(S.accept("bo", { kind: "errand", def: { id: "bo-e1" }, count: 1 }) === false, "accept: a stale offer was accepted");
  ok(S.accept("ann", o2) === true && c.quests["ann-1"].state === "active" && c.quests["ann-1"].day === 2, "accept: the quest is not active from today");
  ok(S.offer("ann") === null, "offer: with ann-1 open (not handed in), an errand or a second story quest is offered");
  ok(S.request("ann").kind === "quest" && S.request("ann").def.id === "ann-1" && S.handInReady("ann") === false, "request: the open quest");
  // room for two story quests, ann-2's star and building in hand: ann-1 still open holds it back (in order)
  W.CREW_RULES.requestsPerCrew = 2;
  S.addTrust("ann", 3);
  S.save.known.push("pharmacy");
  ok(S.offer("ann") === null, "offer: with ann-1 open, ann-2 is offered out of order (or an errand before ann-1 is handed in)");
  S.addTrust("ann", -3);
  S.save.known.pop();
  W.CREW_RULES.requestsPerCrew = 1;
  c.quests["ann-1"].state = "done";
  // ann-1 handed in: no story quest to give (ann-2 needs a star and Mile 9 Pharmacy), so an errand. Seeds and soil are
  // on no known shelf (Greenhouse Row is not known), so the turn passes over them to the nails
  const o1 = S.offer("ann");
  ok(o1 && o1.kind === "errand" && o1.def.id === "ann-e3" && o1.count === 1, `offer: with no story quest to give, not the first errand whose item a known place stocks (${JSON.stringify(o1 && o1.def.id)})`);
  S.save.known.push("garden");
  const o3 = S.offer("ann");
  // Greenhouse Row has one seed shelf, back every restockDays (3): in the errand's 3 days it gives 1, so [2, 3] asks 1
  ok(o3 && o3.def.id === "ann-e1" && o3.count === 1 && S.crewShelfSupply("seeds", 3) === 1, `offer: once Greenhouse Row is known, the errand first in turn (seeds) is not asked for the 1 its one shelf can give in 3 days (${JSON.stringify(o3 && { id: o3.def.id, count: o3.count })})`);
  vm.runInContext("Math.random = (() => { let i = 0; return () => (i++ % 7) / 7; })()", sb);
  ok(same(S.offer("ann"), o3) && same(S.offer("ann"), o3), "offer: the errand count changes between calls (Math.random?)");
  // with shelves enough (two more seed spots there), the count is rolled from [2, 3] by the seed and the day
  const garden = W.LOCATIONS.find((l) => l.id === "garden");
  const gardenItems = garden.items;
  garden.items = gardenItems.concat(["seeds", "seeds"]);
  const counts = new Set();
  for (let day = 1; day <= 40; day++) {
    S.save.day = day;
    counts.add(S.errandCount(o3.def));
  }
  ok(counts.has(2) && counts.has(3) && counts.size === 2, `errandCount: over 40 days not both ends of [2, 3] (${[...counts]})`);
  garden.items = gardenItems;
  S.save.day = 2;
  const was = S.save.known.slice();
  S.save.known = was.filter((k) => k === "base");
  ok(S.offer("ann") === null, "offer: an errand whose item no known place stocks is asked");
  S.save.known = was.filter((k) => k !== "garden");
  ok(S.offer("ann").kind === "errand", "offer: ann-2 offered without its star");
  S.addTrust("ann", 3);
  ok(S.offer("ann").kind === "errand", "offer: ann-2 offered before its building is known");
  S.save.known.push("pharmacy");
  ok(S.offer("ann").kind === "quest" && S.offer("ann").def.id === "ann-2", "offer: ann-2 not offered once known, with the star");
  c.quests["ann-2"] = { state: "done", day: 2, doneDay: 2 };
  ok(S.offer("ann").kind === "errand", "offer: no errand once every story quest is done");
  ok(S.accept("ann") === true && S.offer("ann") === null && c.errand.ann.id === "ann-e3" && c.errandNext.ann === 3, `accept: with no offer given, the current one is not opened, or the turn does not move past the errands passed over (errandNext ${c.errandNext.ann})`);
  ok(S.offer("cy") && S.offer("cy").kind === "quest", "offer: Cy has no errands, but the dog quest stays");
});

group("requests: one story quest and one errand at once", () => {
  const g = synthetic();
  const { S } = g;
  const c = S.save.crew;
  const kinds = () => S.requests("ann").map((r) => r.kind + ":" + r.def.id);
  S.save.day = 2;
  S.accept("ann", S.offer("ann"));
  c.quests["ann-1"].state = "found";
  ok(S.offer("ann") === null, "requests: a found story quest not handed in opens errands");
  ok(S.handIn("ann", "ann-e3") === null && S.handIn("ann", "ann-1").def.id === "ann-1", "handIn: with an id, not that request (or one that is not open)");
  // no story quest to give (ann-2 needs a star): an errand (nails: the only item on a known shelf)
  const e = S.offer("ann");
  ok(e && e.kind === "errand" && e.def.id === "ann-e3", "requests: no errand once the first story quest is handed in");
  S.accept("ann", e);
  ok(c.errandNext.ann === 3, `accept: the turn does not move past the two errands passed over (errandNext ${c.errandNext.ann})`);
  // the errand open never holds back the next story quest
  S.addTrust("ann", 3);
  S.save.known.push("pharmacy");
  const q = S.offer("ann");
  ok(q && q.kind === "quest" && q.def.id === "ann-2", "requests: an open errand holds back the story quest");
  S.accept("ann", q);
  ok(same(kinds(), ["quest:ann-2", "errand:ann-e3"]), `requests: not one open story quest and one open errand (${kinds()})`);
  ok(S.offer("ann") === null, "offer: a third request with a story quest and an errand open");
  ok(S.request("ann").def.id === "ann-2" && !S.handInReady("ann"), "request: with nothing filled, not the story quest first");
  tripHome(S, { nails: 1 });
  ok(S.request("ann").def.id === "ann-e3" && S.handInReady("ann"), "request: the filled errand is not shown first");
  c.quests["ann-2"].state = "found";
  ok(S.request("ann").def.id === "ann-2", "request: with both filled, not the story quest first");
  const scrap = S.save.scrap;
  const r1 = S.handIn("ann", "ann-e3");
  ok(r1 && r1.kind === "errand" && S.save.scrap === scrap + 15 && same(kinds(), ["quest:ann-2"]), "handIn: with the errand's id, not the errand");
  const r2 = S.handIn("ann");
  ok(r2 && r2.def.id === "ann-2" && same(kinds(), []), "handIn: without an id, not the filled story quest");
  // giving up without an id: an errand still open before a story quest still open; a filled errand last
  const g2 = synthetic((Wd) => (Wd.QUESTS = Wd.QUESTS.map((x) => (x.id === "ann-2" ? Object.assign({}, x, { when: {} }) : x))));
  const S2 = g2.S;
  const c2 = S2.save.crew;
  const kinds2 = () => S2.requests("ann").map((r) => r.kind + ":" + r.def.id);
  S2.save.day = 2;
  S2.save.known.push("pharmacy");
  S2.accept("ann", S2.offer("ann"));
  c2.quests["ann-1"].state = "done";
  S2.accept("ann", S2.offer("ann")); // ann-2
  S2.accept("ann", S2.offer("ann")); // the nails
  ok(same(kinds2(), ["quest:ann-2", "errand:ann-e3"]), `giveUp: setup (${kinds2()})`);
  S2.addTrust("ann", 20);
  ok(S2.giveUp("ann") === true && same(kinds2(), ["quest:ann-2"]) && S2.trust("ann") === 17, "giveUp: without an id, the open errand is not the one dropped first");
  ok(S2.offer("ann").kind === "errand", "giveUp: once the errand is given up, no next errand is asked");
  S2.accept("ann", S2.offer("ann"));
  S2.save.inventory.nails = 5;
  c2.errand.ann.have = c2.errand.ann.count;
  ok(S2.giveUp("ann") === true && same(kinds2().map((k) => k.split(":")[0]), ["errand"]), "giveUp: without an id, a filled errand is dropped before the story quest still open");
  ok(S2.giveUp("ann", "nope") === false && S2.giveUp("ann", c2.errand.ann.id) === true && same(kinds2(), []), "giveUp: with an id, not that request");
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
  // the day it comes home the recap counts it; June's ledger line waits for the hand-in (the next day page)
  ok(entry.recap.quests === 1 && !entry.quests, `returnHome: the day the object came home, the recap does not count it or the ledger line came before the hand-in (${JSON.stringify({ recap: entry.recap.quests, quests: entry.quests })})`);
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
  ok(same(S.save.crew.ledger, ["ann-1"]), `handIn: the quest is not on crew.ledger for the next day page (${JSON.stringify(S.save.crew.ledger)})`);
  const f0 = S.save.food;
  const next = tripHome(S);
  ok(S.save.food === Math.max(0, f0 - g.W.SETTINGS.foodPerTrip) + fx1.foodPerDay, "returnHome: the foodPerDay perk does not feed the crew");
  ok(same(next.quests, ["ann-1"]) && same(S.save.crew.ledger, []) && !next.recap.quests, `returnHome: the day page after the hand-in does not carry June's ledger line for ann-1 (${JSON.stringify(next.quests)}; ledger ${JSON.stringify(S.save.crew.ledger)})`);
  ok(!tripHome(S).quests, "returnHome: the ledger line was written twice");
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
  // Ann: errands only; Greenhouse Row with a second seed shelf, so her seed errand can ask for 2 in its 3 days
  const { S, W, ZSR: Z } = synthetic((Wd) => {
    Wd.QUESTS = Wd.QUESTS.filter((q) => q.giver !== "ann");
    Wd.LOCATIONS = Wd.LOCATIONS.map((l) => (l.id === "garden" ? Object.assign({}, l, { items: l.items.concat(["seeds"]) }) : l));
  });
  const c = S.save.crew;
  S.save.known.push("garden"); // Greenhouse Row's shelves hold the seeds and the soil
  tripHome(S, { seeds: 5 }); // brought home before the errand: does not count
  const o = S.offer("ann");
  ok(o.kind === "errand" && o.def.id === "ann-e1" && o.count === 2, `errands: Ann's first errand (${JSON.stringify(o && { id: o.def.id, count: o.count })}; 2 seed shelves give 2 in 3 days)`);
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
  ok(o3.def.id === "ann-e3", "errands: the third errand is not next in turn");
  S.accept("ann", o3);
  tripHome(S, { nails: 5 });
  for (let i = 0; i < 6; i++) tripHome(S);
  ok(c.errand.ann && c.errand.ann.id === "ann-e3", "errands: a filled errand went late before it was handed in");
  ok(S.requestVars(S.request("ann")).days === 2, `requestVars: a filled errand past its day does not read as the deadline it was given (${S.requestVars(S.request("ann")).days} days)`);
  // filled, then the items used from storage (a build, a packed kit, a raid's medical kit): it waits, never late
  S.save.inventory.nails = 0;
  ok(!S.handInReady("ann"), "errands: a filled errand with its items gone from storage can be handed in");
  for (let i = 0; i < 3; i++) tripHome(S);
  ok(c.errand.ann && c.errand.ann.id === "ann-e3" && S.crewReport("ann").late !== "nails", "errands: a filled errand went late once its items were used from storage");
  ok(S.requestVars(S.request("ann")).days >= 1, "requestVars: a filled errand reads 0 days");
  tripHome(S, { nails: 1 });
  ok(S.handInReady("ann"), "errands: a filled errand is not ready once storage holds its count again");
  ok(S.giveUp("ann") === true && c.errand.ann === null && S.trust("ann") === 0, "giveUp: an errand is still open or trust went below 0");
  // filled by the very trip that comes home on its due day: in time (the turn wraps round to the first errand)
  const o4 = S.offer("ann");
  ok(o4.def.id === "ann-e1", "errands: the turn does not wrap round to the first errand");
  S.accept("ann", o4);
  tripHome(S);
  tripHome(S);
  tripHome(S, { seeds: o4.count });
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

group("errands: two crew members asking for the same item share the cargo", () => {
  // one nail shelf (Reyes Hardware) gives 1 box in the errands' 2 days: once Ann's errand is open, Bo's would have
  // nothing left on the shelves, so Bo is not asked for it
  const one = synthetic();
  one.S.save.day = 2;
  one.S.save.crew.quests["ann-1"] = { state: "done", day: 2, doneDay: 2 };
  one.S.save.crew.quests["bo-1"] = { state: "done", day: 1, doneDay: 1 };
  ok(one.S.offer("bo") && one.S.offer("bo").def.item === "nails", "errands: setup, Bo asks for nails");
  one.S.accept("ann", one.S.offer("ann"));
  ok(one.S.offer("bo") === null, `errands: with the one nail shelf spoken for by Ann's open errand, Bo still asks for nails (${JSON.stringify(one.S.offer("bo"))})`);
  // two nail shelves: both ask, and they share the cargo
  const { S } = synthetic((Wd) => (Wd.LOCATIONS = Wd.LOCATIONS.map((l) => (l.id === "hardware" ? Object.assign({}, l, { items: l.items.concat(["nails"]) }) : l))));
  const c = S.save.crew;
  S.save.day = 2;
  c.quests["ann-1"] = { state: "done", day: 2, doneDay: 2 };
  c.quests["bo-1"] = { state: "done", day: 1, doneDay: 1 };
  const a = S.offer("ann");
  S.accept("ann", a);
  const b = S.offer("bo");
  ok(a && a.def.item === "nails" && b && b.def.item === "nails", `errands: setup, Ann and Bo both ask for nails (${a && a.def.id}, ${b && b.def.id})`);
  S.accept("bo", b);
  S.save.inventory.nails = 0;
  tripHome(S, { nails: 1 });
  ok(c.errand.ann.have + c.errand.bo.have === 1, `errands: 1 Box of nails brought home counted for both (Ann ${c.errand.ann.have}, Bo ${c.errand.bo.have})`);
  tripHome(S, { nails: 1 });
  ok(c.errand.ann.have === 1 && c.errand.bo.have === 1 && S.handInReady("ann") && S.handInReady("bo"), "errands: the second Box of nails did not fill the other errand");
  ok(S.handIn("ann") && S.handIn("bo") && S.save.inventory.nails === 0, "errands: both not handed in with the 2 brought home");
  // the cargo goes to the errand due first: Bo's, accepted a day later with more days, waits for Ann's
  c.errand.ann = { id: "ann-e3", item: "nails", count: 1, have: 0, day: 5, due: 7 };
  c.errand.bo = { id: "bo-e1", item: "nails", count: 1, have: 0, day: 4, due: 6 };
  tripHome(S, { nails: 1 });
  ok(c.errand.bo.have === 1 && c.errand.ann.have === 0, `errands: the one box went to ${c.errand.ann.have ? "Ann's" : "nobody's"} errand, not Bo's (due first)`);
});

/** One trip a day that takes every shelf spot of `item` that is back, in every known place (as a player bent on
    the errand would), and brings it home. Returns how many it brought. */
function shelfTrip(S, W, item) {
  S.startTrip();
  let got = 0;
  W.LOCATIONS.forEach((l) =>
    (l.items || []).forEach((k, i) => {
      if (k !== item || !S.isKnown(l.id) || !S.itemAvailable(l.id, "i" + i)) return;
      S.takeItem(l.id, "i" + i, false);
      S.trip.cargo[item] = (S.trip.cargo[item] || 0) + 1;
      got++;
    })
  );
  S.returnHome();
  return got;
}

group("errands: the count is what the known shelves can give in time", () => {
  // Ann asks for 2 boxes of nails within 4 days; Reyes Hardware (known at the start) has one nail shelf
  const E = { id: "ann-e9", item: "nails", count: [2, 2], days: 4, reward: { scrap: 20 }, facts: ["Ann asks for {count} {item} within {days} days."], done: ["Ann hangs a picture."] };
  const edit = (Wd) => {
    Wd.QUESTS = Wd.QUESTS.filter((q) => q.giver !== "ann");
    Wd.ERRANDS.ann = [E];
  };
  const probe = synthetic(edit);
  const hw = probe.W.LOCATIONS.find((l) => l.id === "hardware");
  const spots = hw.items.map((k, i) => (k === "nails" ? "i" + i : null)).filter(Boolean);
  if (!ok(probe.S.isKnown("hardware") && spots.length === 1, `errands: setup, Reyes Hardware is not known at the start with one nail shelf (${spots})`)) return;
  const R = probe.W.SETTINGS.restockDays;
  // the shelf emptied 1, 2 or 3 (restockDays) days before the errand is asked, or never: 1, 1, 2, 2
  [1, 2, R, null].forEach((ago) => {
    const { S, W } = synthetic(edit);
    const c = S.save.crew;
    S.save.day = 20;
    if (ago != null) S.save.loc.hardware = { taken: { [spots[0]]: S.save.day - ago }, cacheOpened: false, cacheTaken: {}, visits: 1 };
    const o = S.offer("ann");
    const want = ago == null || ago >= R ? 2 : 1;
    const when = ago == null ? "never emptied" : `emptied ${ago} day(s) before`;
    if (!ok(o && o.def.id === E.id && o.count === want, `errands: with the only nail shelf ${when}, Ann asks for ${o && o.count}, not ${want}`)) return;
    ok(same(S.offer("ann"), o) && S.errandCount(E) === o.count, `errands: the capped count changes between calls (${when})`);
    S.accept("ann", o);
    const trips = [];
    for (let k = 0; k < 8 && c.errand.ann && c.errand.ann.have < c.errand.ann.count; k++) trips.push(shelfTrip(S, W, "nails"));
    const e = c.errand.ann;
    ok(e && e.have >= e.count && !S.crewReport("ann").late && S.save.day <= e.due, `errands: with the only nail shelf ${when}, the errand for ${o.count} was not filled by taking that shelf on every trip it was back (${trips.join(" ")}; ${e ? "have " + e.have : "dropped late"})`);
  });
  // a second known place with the item raises the cap (Ridge Lumber's three lumber shelves beside Reyes Hardware's one)
  const g2 = synthetic((Wd) => {
    edit(Wd);
    Wd.ERRANDS.ann = [Object.assign({}, E, { id: "ann-e8", item: "lumber", count: [5, 5] })];
  });
  const S2 = g2.S;
  const lumber = (known) => {
    S2.save.known = S2.save.known.filter((k) => k !== "lumberyard").concat(known ? ["lumberyard"] : []);
    return S2.crewShelfSupply("lumber", 4);
  };
  const shelves = (id) => g2.W.LOCATIONS.find((l) => l.id === id).items.filter((k) => k === "lumber").length;
  const per = 1 + Math.floor(3 / R); // trips a fresh shelf gives in 4 days
  ok(lumber(false) === shelves("hardware") * per && lumber(true) === (shelves("hardware") + shelves("lumberyard")) * per, `crewShelfSupply: lumber in 4 days is ${lumber(false)} (Reyes Hardware) and ${lumber(true)} (with Ridge Lumber), not ${per} a shelf`);
  ok(S2.offer("ann").count === Math.min(5, lumber(true)), `errandCount: with Ridge Lumber known, the lumber errand asks for ${S2.offer("ann").count}, not ${Math.min(5, lumber(true))}`);
});

group("raids: crewHurt", () => {
  const g = synthetic();
  const { S } = g;
  S.addTrust("bo", 10);
  S.save.inventory.meds = 1;
  S.save.food = 5;
  ok(S.crewHurt("bo") === "a medical kit" && S.save.inventory.meds === 0 && S.save.food === 5 && S.trust("bo") === 7, "crewHurt: not 1 medical kit from storage and loss.hurt trust");
  ok(S.crewHurt("bo") === "2 food" && S.save.food === 3 && S.trust("bo") === 4, "crewHurt: with no kit, not 2 food");
  S.save.food = 1;
  ok(S.crewHurt("bo") === "1 food" && S.save.food === 0 && S.trust("bo") === 1, "crewHurt: with 1 food left, not 1 food taken and said (or food went below 0)");
  // nothing to take: the report says it cost nothing ("It cost the base nothing"), never "0 food"
  ok(S.crewHurt("bo") === "nothing" && S.save.food === 0 && S.trust("bo") === 0, "crewHurt: an empty pantry is not said to cost nothing (\"0 food\"?), or trust went below 0");
  // every hurt since the last talk is one paragraph, its cost summed ("nothing" left out beside a real cost)
  const items = S.crewReportItems("bo").filter((x) => x.key === "hurt");
  ok(same(items, [{ key: "hurt", vars: { who: "Bo", cost: "a medical kit and 3 food" } }]), `crewReportItems: four hurts are not one report costing "a medical kit and 3 food" (${JSON.stringify(items)})`);
  S.clearReport("bo");
  ok(same(S.crewReport("bo"), {}) && same(S.crewReportItems("bo"), []), "clearReport: the report is not empty");
  const cost = (list) => {
    S.crewReport("bo").hurt = list;
    const it = S.crewReportItems("bo").filter((x) => x.key === "hurt");
    S.clearReport("bo");
    return it.length === 1 ? it[0].vars.cost : JSON.stringify(it);
  };
  const IT = g.W.ITEMS;
  ok(cost(["a medical kit"]) === "a medical kit" && cost(["2 food"]) === "2 food" && cost(["nothing"]) === "nothing", "crewReportItems: one hurt's cost is not crewHurt's word");
  ok(cost(["a medical kit", "a medical kit", "2 food", "2 food"]) === "2 " + IT.meds.many + " and 4 food", `crewReportItems: hurts summed as "${cost(["a medical kit", "a medical kit", "2 food", "2 food"])}"`);
  ok(cost(["nothing", "nothing"]) === "nothing" && cost(["nothing", "1 food"]) === "1 food" && cost(["3 medical kits", "nothing"]) === "3 " + IT.meds.many, "crewReportItems: \"nothing\" is said beside a real cost, or not when every hurt cost nothing");
  ok(same(S.crewReportItems("bo"), []) && (S.crewReport("bo").hurt = []) && same(S.crewReportItems("bo"), []), "crewReportItems: an empty hurt list is a report");
});

group("work, reports, repairs", () => {
  const { S, W } = synthetic();
  ok(S.crewRepairCost("fence") === W.SETTINGS.fenceRepairScrap && S.crewRepairCost("cabin") === W.SETTINGS.houseRepairScrap, "crewRepairCost: not the usual scrap");
  S.save.scrap = W.SETTINGS.houseRepairScrap;
  ok(S.crewRepairPay("cabin") === W.SETTINGS.houseRepairScrap && S.save.scrap === 0, "crewRepairPay: not paid");
  ok(S.crewRepairPay("fence") === 0 && S.save.scrap === 0, "crewRepairPay: scrap went below 0");
  S.logWork("bo", "fence", 3, 3);
  S.logWork("bo", "cabin", 1, 2);
  const bo = S.crewReportItems("bo");
  ok(same(bo, [{ key: "fence", vars: { fixed: 3, scrap: 3 } }, { key: "cabin", vars: { fixed: 1, scrap: 2 } }]), `crewReportItems: work ${JSON.stringify(bo)}`);
  ok(S.crewReport("bo").scrap === 5, "logWork: report.scrap is not the scrap paid");
  // June's patch-up is told by her heal tip as it happens, never as a report (an older save's report.heal is not told)
  S.crewReport("ann").heal = 40;
  ok(same(S.crewReportItems("ann"), []), `crewReportItems: a patch-up is told as a report (${JSON.stringify(S.crewReportItems("ann"))})`);
  S.clearReport("ann");
  S.save.crew.quests["bo-1"] = { state: "done", day: 1, doneDay: 1 };
  ok(S.crewFx().crewRepairFree === true && S.crewRepairCost("fence") === 0 && S.crewRepairCost("cabin") === 0, "crewRepairFree: repairs still cost scrap");
  S.clearReport("bo");
  S.logWork("bo", "fence", 2, 0);
  ok(same(S.crewReportItems("bo"), [{ key: "fenceFree", vars: { fixed: 2 } }]), "logWork: fence work with crewRepairFree is not fenceFree");
  S.clearReport("bo");
  S.logWork("bo", "cabin", 1, S.crewRepairPay("cabin"));
  S.logWork("bo", "cabin", 1, 0);
  ok(same(S.crewReport("bo"), { cabinFree: 2 }) && same(S.crewReportItems("bo"), [{ key: "cabinFree", vars: { fixed: 2 } }]), `logWork: cabin work with crewRepairFree is not cabinFree (${JSON.stringify(S.crewReport("bo"))})`);
  // a fix logged with no scrap paid is never told as "it took 0 scrap" (an old report, or a caller that paid nothing)
  S.clearReport("bo");
  Object.assign(S.crewReport("bo"), { fence: 2, cabin: 1, scrapBy: { fence: 2 } });
  ok(same(S.crewReportItems("bo"), [{ key: "fence", vars: { fixed: 2, scrap: 2 } }, { key: "cabinFree", vars: { fixed: 1 } }]), `crewReportItems: a fix that took no scrap is told as costing scrap (${JSON.stringify(S.crewReportItems("bo"))})`);
  S.clearReport("bo");
  S.logWork("bo", "fence", 1, 1); // paid before the perk came: still told with its scrap
  ok(same(S.crewReportItems("bo"), [{ key: "fence", vars: { fixed: 1, scrap: 1 } }]), "logWork: a paid fix with the perk active lost its scrap");
  S.clearReport("bo");
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
  S.save.vanHp = van0; // a full van
  const r = S.handIn("ann");
  // the van's health rises with its maximum (as the Walls room and the armor do): a full van stays full
  ok(S.save.vanHp === van0 + 15 && S.save.vanHp === S.vanMaxHp(), `handIn: the vanHp perk (+15) left a full van at ${S.save.vanHp} of ${S.vanMaxHp()}`);
  ok(r && r.def.id === "ann-2" && S.save.crowbars === had.bars + 1 && S.save.traps.spike === had.spike + 1, "handIn: crowbars or traps not paid");
  ok(S.canCraftTool("crowbar").scrap === 5, "canCraftTool: the crowbarCost perk is not the cost");
  S.save.scrap = 5;
  const bars = S.save.crowbars;
  ok(S.craftTool("crowbar") === true && S.save.scrap === 0 && S.save.crowbars === bars + 1, "craftTool: the crowbarCost perk is not what it takes");
  ok(S.vanMaxHp() === van0 + 15, "effects: the vanHp perk is not in the van's health");
  // a damaged van gets the perk's health too, never past the maximum
  const g2 = synthetic();
  const S2 = g2.S;
  S2.save.crew.quests["ann-1"] = { state: "done", day: 2, doneDay: 2 };
  S2.save.crew.quests["ann-2"] = { state: "found", day: 2, doneDay: null };
  S2.save.vanHp = 50;
  S2.handIn("ann");
  ok(S2.save.vanHp === 65, `handIn: the vanHp perk (+15) took a van at 50 to ${S2.save.vanHp}, not 65`);
  const max2 = S2.vanMaxHp(); // with the perk
  S2.save.crew.quests["ann-2"] = { state: "found", day: 2, doneDay: null };
  S2.save.vanHp = max2 - 3;
  S2.handIn("ann");
  ok(S2.save.vanHp === max2 && S2.vanMaxHp() === max2, `handIn: the vanHp perk took the van past its maximum (${S2.save.vanHp} of ${S2.vanMaxHp()})`);
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
  ok(S.dogHome() && S.save.crew.quests["cy-1"].state === "found" && entry.recap.quests === 1 && !entry.quests, "returnHome: the dog is not home, its quest not found, not in the recap, or its ledger line came before the hand-in");
  ok(S.handInReady("cy") && S.handIn("cy").kind === "quest" && same(S.save.crew.ledger, ["cy-1"]), "handIn: the dog quest (and onto crew.ledger)");
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

group("the journal: pages that wish for a dog, once it is home", () => {
  const { S } = synthetic();
  const page = (id, dogWish) => ({ id, dogWish, facts: ["A page."] });
  // nine pages: 1 to 6 once, then 7, 8 and 9 repeat (the last third); 3, 7 and 9 wish for a dog
  const J = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => page("p" + i, [3, 7, 9].includes(i)));
  const days = 20;
  const plain = Array.from({ length: days }, (_, n) => S.cycleIndex(n, J.length));
  const run = () => Array.from({ length: days }, (_, n) => S.journalIndex(n, J));
  ok(same(run(), plain), `journalIndex: a page was skipped with no dog home (${run()})`);
  S.save.crew.dog.home = true;
  const dog = run();
  ok(same(dog.slice(0, 6), plain.slice(0, 6)), `journalIndex: a one-time page before the repeat moved (${dog.slice(0, 6)})`);
  ok(dog.slice(6).every((i) => i === 7), `journalIndex: with the dog home, the repeat is not the one page that wishes for none (${dog.slice(6)})`);
  // only page 7 wishes for a dog: the first pass gives its day to page 8, and the repeat goes round 8 and 9 in turn,
  // never the same page two days running
  const two = J.map((p, i) => (i === 7 ? page("p8", false) : i === 8 ? page("p9", false) : p));
  const dog2 = Array.from({ length: days }, (_, n) => S.journalIndex(n, two));
  ok(same(dog2.slice(6, 9), [7, 7, 8]), `journalIndex: in the first pass a dog-wish page does not give way to the next page in the window (${dog2.slice(6, 9)})`);
  const rep2 = dog2.slice(9);
  ok(rep2.every((i, k) => (i === 7 || i === 8) && (!k || i !== rep2[k - 1])), `journalIndex: with the dog home, the repeat writes a page two days running or a page that wishes for a dog (${rep2})`);
  // a longer window keeps its order: twelve pages, the last four repeat, the second of them wishes for a dog
  const twelve = Array.from({ length: 12 }, (_, i) => page("q" + (i + 1), i === 9));
  const rep3 = Array.from({ length: 9 }, (_, k) => S.journalIndex(12 + k, twelve));
  ok(same(rep3, [8, 10, 11, 8, 10, 11, 8, 10, 11]), `journalIndex: the repeat with the dog home is not the window's other pages in order (${rep3})`);
  const all = J.map((p, i) => (i >= 6 ? page(p.id, true) : p));
  ok(same(Array.from({ length: days }, (_, n) => S.journalIndex(n, all)), plain), "journalIndex: with every repeating page wishing for a dog, the day's own page is not kept");
  ok(S.journalIndex(0, []) === null, "journalIndex: an empty journal");
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
  const filled = Z.crewFill(T("errand", "ann-e1", "brief"), S.requestVars({ kind: "errand", def: g.W.ERRANDS.ann[0], count: 2 }));
  ok(!/[{}]/.test(filled) && /25 scrap/.test(filled), `crewFill: ${filled}`);
  ok(Z.crewFill("Fixed 1 holes and 2 holes in {x}.", {}) === "Fixed 1 hole and 2 holes in {x}.", "crewFill: 1 holes, or an unknown placeholder was not left");
  ok(Z.crewFill("{dog} wags.", {}) === "the dog wags." && Z.crewFill("{dog}!", { dog: "Rex" }) === "Rex!", "crewFill: {dog} with no dog home, or given");
  ok(Z.crewFill("{dog} wags.", { dog: "" }) === "the dog wags.", "crewFill: {dog} given as an empty name is left unfilled");
  ok(Z.crewName("ann") === "Ann" && Z.crewName("zed") === "zed", "crewName");
  // items counted in running text (ITEMS one / many), never the label: "2 pieces of lumber", not "2 Lumber"
  const IT = g.W.ITEMS;
  ok(S.rewardWords({ scrap: 30, items: { lumber: 2 }, kits: 1 }) === "30 scrap, 2 " + IT.lumber.many + " and 1 medical kit" && S.rewardWords({ crowbars: 2 }) === "2 crowbars", `rewardWords (${S.rewardWords({ scrap: 30, items: { lumber: 2 }, kits: 1 })})`);
  ok(S.rewardWords({ scrap: 20, items: { seeds: 1 } }) === "20 scrap and 1 " + IT.seeds.one && S.rewardWords({ items: { soil: 2, nails: 1 } }) === "2 " + IT.soil.many + " and 1 " + IT.nails.one, `rewardWords: one and many (${S.rewardWords({ scrap: 20, items: { seeds: 1 } })}; ${S.rewardWords({ items: { soil: 2, nails: 1 } })})`);
  const spike = g.W.TRAPS.spike.name.toLowerCase();
  ok(S.rewardWords({ traps: { spike: 2 } }) === "2 " + spike + "s" && S.rewardWords({ traps: { spike: 1 } }) === "1 " + spike, `rewardWords: traps, in running text (${S.rewardWords({ traps: { spike: 2 } })})`);
  ok(Z.itemCount("nails", 1) === "1 " + IT.nails.one && Z.itemCount("nails", 3) === "3 " + IT.nails.many && Z.itemCount("nope", 2) === "2 nope", "itemCount: one, many, or an unknown item");
});

group("the day's recap: counted items, and a day that brought home only a story object", () => {
  const { S, W, ZSR: Z } = synthetic();
  const IT = W.ITEMS;
  // the fallback templates (this synthetic game has no recap words): "nothing" is the empty-handed line
  const empty = Z.recapText({ items: 0, scrap: 0, notes: 0, keys: 0, food: 3, hungry: false, next: null });
  ok(/nothing/i.test(empty), `recapText: an empty-handed day does not say so (${empty})`);
  const quest = Z.recapText({ items: 0, scrap: 0, notes: 0, keys: 0, quests: 1, food: 3, hungry: false, next: null });
  ok(!/nothing/i.test(quest) && quest.trim(), `recapText: a day that brought home a story object reads as empty-handed (${quest})`);
  const next = { room: Object.keys(W.BASE_ROOMS)[0], missing: { lumber: 2, nails: 1 }, scrap: 40, ready: false };
  const r = Z.recapText({ items: 3, scrap: 5, food: 3, hungry: false, next });
  ok(r.includes("2 " + IT.lumber.many + ", 1 " + IT.nails.one + " and 40 scrap"), `recapText: what a build still needs is not counted in running text (${r})`);
  // the day log: a trip that brings home only a story object keeps it in the recap (its ledger line waits for the hand-in)
  S.save.day = 2;
  S.accept("ann", S.offer("ann"));
  const entry = tripHome(S, {}, () => S.takeQuestObject("ann-1"));
  ok(entry.recap.quests === 1 && !entry.quests && !/nothing/i.test(Z.recapText(entry.recap)), `logDay: a day that brought home only ann-1 reads ${JSON.stringify(entry.recap)}: ${Z.recapText(entry.recap)}`);
  const plain = tripHome(S);
  ok(!("quests" in plain.recap) && !plain.quests && /nothing/i.test(Z.recapText(plain.recap)), "logDay: an empty-handed day after it is not empty-handed");
  // the build tip's {needs}, counted the same way
  S.save.inventory = {};
  const tip = S.crewTips("ann").regular.find((t) => t.tip === "build");
  ok(tip && !/\b\d+ [A-Z]/.test(tip.vars.needs), `tips: build {needs} gives an item's label after its count (${tip && tip.vars.needs})`);
});

group("June's ledger: a quest's line on the first day page after its hand-in", () => {
  const { S } = synthetic();
  const c = S.save.crew;
  S.save.day = 2;
  S.accept("ann", S.offer("ann"));
  const home = tripHome(S, {}, () => S.takeQuestObject("ann-1"));
  ok(home.recap.quests === 1 && !home.quests, `ledger: the day ann-1 came home (not yet handed over) has its line (${JSON.stringify(home.quests)})`);
  ok(!tripHome(S).quests, "ledger: a day before the hand-in has the line");
  // two hand-ins at home the same day: both lines on the next page, in the order handed in
  S.handIn("ann");
  S.accept("bo", S.offer("bo"));
  c.quests["bo-1"].state = "found";
  S.handIn("bo");
  const page = tripHome(S);
  ok(same(page.quests, ["ann-1", "bo-1"]) && same(c.ledger, []), `ledger: the page after two hand-ins carries ${JSON.stringify(page.quests)}, not ["ann-1", "bo-1"]`);
  ok(!tripHome(S).quests, "ledger: a line was written on a second page");
  // a save from an older build wrote the line on the day the object came home: handed in now, it is not written again
  c.quests["cy-1"] = { state: "found", day: S.save.day, doneDay: null };
  c.dog.home = true;
  S.save.log[S.save.log.length - 1].quests = ["cy-1"];
  S.handIn("cy");
  ok(!tripHome(S).quests && same(c.ledger, []), "ledger: a line already on an earlier page was written again");
  // a save with no crew.ledger gets one
  delete c.ledger;
  ok(Array.isArray(S.crewSave().ledger) && same(S.crewSave().ledger, []), "ledger: an older crew field without ledger is not filled in");
});

group("medical kits packed at the cabin: the caller saves, so a wave's death undoes the wave", () => {
  const { S, store } = synthetic();
  S.save.inventory.meds = 3;
  S.addTrust("ann", 10);
  S.commit();
  const saved = store.get("zs.save.1");
  // a wave: a raider hurts Ann (crewHurt), then you pack a kit from the backpack (the yard's sync saves nothing
  // mid-wave, so packKit must not either), then you die in that wave
  S.crewHurt("ann");
  ok(S.packKit() === true && S.save.kits === 1 && store.get("zs.save.1") === saved, "packKit: packing a kit wrote the save (mid-wave, it keeps the raid's hurt past a death)");
  ok(S.unpackKit() === true && S.packKit() === true && store.get("zs.save.1") === saved, "unpackKit: putting a kit back wrote the save");
  S.abandonTrip();
  ok(S.save.inventory.meds === 3 && !(S.save.kits > 0) && S.trust("ann") === 10 && !S.crewReport("ann").hurt, `packKit: after a death in the wave the reload keeps meds ${S.save.inventory.meds}, kits ${S.save.kits}, trust ${S.trust("ann")}, report ${JSON.stringify(S.crewReport("ann"))}`);
  // in the calm the caller saves it (js/backpack.js: syncYard, or a commit away from the yard), and it is kept
  S.packKit();
  S.commit();
  S.abandonTrip();
  ok(S.save.kits === 1 && S.save.inventory.meds === 2, "packKit: a kit packed and saved in the calm was lost");
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
const TIP_VARS = { hungry: [], food: ["food", "days"], ready: ["room"], build: ["room", "needs"], heal: ["hp"], van: ["hp", "max", "cost"], vanFree: ["hp", "max"], fence: ["holes", "cracks"], cabin: ["broken"], crowbar: [], fine: [], wave: ["size", "sides"], keys: ["keys"], walkers: ["days"], radio: [], full: [] };
const REPORT_VARS = { fence: ["fixed", "scrap"], fenceFree: ["fixed"], cabin: ["fixed", "scrap"], cabinFree: ["fixed"], hurt: ["who", "cost"], late: ["item"] };
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
  // every item counts in running text (ITEMS one / many: rewards, {needs}, the hand-in line), keeping the noun the
  // briefs promise (tests/validate-world.js: the last word of the label, less a plural s)
  Object.entries(W.ITEMS).forEach(([k, it]) => {
    const noun = it.name.toLowerCase().split(/\s+/).pop().replace(/s$/, "");
    ok(typeof it.one === "string" && typeof it.many === "string" && it.one.trim() && it.many.trim() && it.one !== it.many, `ITEMS.${k}: needs one and many, the item counted in running text ("1 ${it.name.toLowerCase()}", "2 ...")`);
    ok(it.one === it.one.toLowerCase() && it.many === it.many.toLowerCase(), `ITEMS.${k}: one / many are running text, lower case (${it.one} / ${it.many})`);
    ok(String(it.one).includes(noun) && String(it.many).includes(noun), `ITEMS.${k}: one / many (${it.one} / ${it.many}) lose the noun the briefs promise ("${noun}")`);
  });
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

group("real facts: the dog's topics wait for its hand-in (the thank-you and the name come first)", () => {
  const g = loadGame();
  const { S, W } = g;
  const dq = (W.QUESTS || []).find((q) => q.kind === "dog");
  if (!dq) return;
  S.newGame(1, "Dog topics");
  // every gate open but the dog quest: the dog is home, its quest found, not yet handed in
  S.save.day = lateDay(W);
  S.crewIds().forEach((id) => S.addTrust(id, 1000));
  (W.QUESTS || []).forEach((q) => (S.save.crew.quests[q.id] = { state: q === dq ? "found" : "done", day: 1, doneDay: q === dq ? null : 1 }));
  Object.keys(S.save.rooms).forEach((k) => (S.save.rooms[k] = 3));
  Object.entries(W.NOTES).forEach(([locId, N]) => [N.door].concat(N.notes || []).forEach((n) => n && S.save.backpack.push({ noteId: n.id, locId, found: "", day: 1 })));
  S.save.crew.dog.home = true;
  const dogTopics = [];
  Object.values(W.CREW_TALK || {}).forEach((T) => ((T && T.topics) || []).forEach((t) => t.when && t.when.dog && dogTopics.push(t.id)));
  const tellAll = (id) => {
    const told = [];
    for (let i = 0; i < 200; i++) {
      const t = S.nextTopic(id);
      if (!t || t.mood) break;
      told.push(t.id);
      S.markTopic(id, t.id);
    }
    return told;
  };
  const early = [].concat(...S.crewIds().map(tellAll)).filter((t) => dogTopics.includes(t));
  ok(!early.length, `topics: ${early.join(", ")} told with the dog home but ${dq.id} not yet handed in (its thank-you and its name come first)`);
  S.save.crew.quests[dq.id] = { state: "done", day: 1, doneDay: 1 };
  const later = [].concat(...S.crewIds().map(tellAll));
  ok(dogTopics.every((t) => later.includes(t)), `topics: once ${dq.id} is handed in, not every dog topic is told (${dogTopics.filter((t) => !later.includes(t)).join(", ")})`);
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
      ok(S.save.crew.quests[q.id].state === "found" && entry.recap.quests === 1 && !(entry.quests || []).includes(q.id), `quests: ${q.id} is not found at home and in the day's recap (or its ledger line came before the hand-in)`);
      if (q.kind === "dog") ok(S.dogHome(), `quests: ${q.id} did not bring the dog home`);
      const scrap = S.save.scrap;
      const r = S.handIn(id);
      ok(r && r.def.id === q.id && S.save.scrap >= scrap + ((q.reward && q.reward.scrap) || 0), `quests: ${q.id} was not handed in with its scrap`);
      const perk = (q.reward && q.reward.perk) || {};
      Object.entries(perk).forEach(([k, v]) => ok(typeof v === "boolean" ? S.crewFx()[k] === v : k === "crowbarCost" ? S.crewFx()[k] <= v : S.crewFx()[k] >= v, `quests: ${q.id}'s perk ${k} is not active once done`));
      const page = tripHome(S);
      ok((page.quests || []).includes(q.id), `quests: ${q.id}'s ledger line is not on the day page after its hand-in (${JSON.stringify(page.quests)})`);
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

group("real facts: every errand can be filled, even the day after its shelves were emptied", () => {
  const g = loadGame();
  const { S, W } = g;
  const R = W.SETTINGS.restockDays;
  const bad = [];
  let tried = 0;
  Object.entries(W.ERRANDS || {}).forEach(([id, list]) =>
    (list || []).forEach((def) => {
      // only the start places known, then every place: the item's shelves in each, emptied 1 to restockDays days
      // before the errand is asked (the likeliest case: you came home with them yesterday), or never
      [false, true].forEach((all) =>
        [1, 2, R, null].forEach((ago) => {
          S.newGame(1, "Errand");
          if (all) W.LOCATIONS.forEach((l) => !S.isKnown(l.id) && S.save.known.push(l.id));
          if (!S.crewItemStocked(def.item)) return;
          S.save.day = 20;
          W.LOCATIONS.forEach((l) => {
            const taken = {};
            (l.items || []).forEach((k, i) => k === def.item && ago != null && (taken["i" + i] = S.save.day - ago));
            S.save.loc[l.id] = { taken, cacheOpened: true, cacheTaken: {}, visits: 1 };
          });
          // the most it asks for over a few seeds (the roll), then that errand, filled shelf by shelf
          let count = 0;
          for (let seed = 1; seed <= 12; seed++) {
            S.save.lockSeed = seed;
            count = Math.max(count, S.errandCount(def));
          }
          for (let seed = 1; seed <= 12 && S.errandCount(def) !== count; seed++) S.save.lockSeed = seed;
          S.save.crew.errand[id] = { id: def.id, item: def.item, count, have: 0, day: S.save.day, due: S.save.day + def.days };
          const trips = [];
          for (let k = 0; k < def.days + 2 && S.save.crew.errand[id] && S.save.crew.errand[id].have < count; k++) trips.push(shelfTrip(S, W, def.item));
          tried++;
          const e = S.save.crew.errand[id];
          if (!(e && e.have >= e.count)) bad.push(`${def.id} (${count} ${def.item}, ${def.days} days, ${all ? "every place" : "the start places"} known, shelves ${ago == null ? "full" : "emptied " + ago + " day(s) before"}): trips gave ${trips.join(" ")}`);
        })
      );
    })
  );
  ok(tried > 0, "errands: no real errand could be tried on a known shelf");
  ok(!bad.length, `errands: asked for more than the known shelves give in time: ${bad.slice(0, 4).join("; ")}`);
});

group("real facts: June's ledger never wishes for a dog that is home", () => {
  const g = loadGame();
  const { S, W } = g;
  const J = W.JOURNAL || [];
  if (!J.length) return;
  S.newGame(1, "Ledger");
  const wish = (e) => !!(J[e.journal] && J[e.journal].dogWish);
  for (let i = 0; i < J.length * 2; i++) tripHome(S);
  const before = S.save.log.slice(-J.length);
  ok(before.every((e) => e.journal === S.cycleIndex(e.day - 1, J.length)), "journal: with no dog home, a page is not the day's own");
  ok(before.some(wish), "journal: no repeating page wishes for a dog (nothing for the skip to test)");
  S.save.crew.dog.home = true;
  for (let i = 0; i < J.length; i++) tripHome(S);
  const after = S.save.log.slice(-J.length);
  ok(!after.some(wish), `journal: with the dog home, a page that wishes for one was written (${after.filter(wish).map((e) => J[e.journal].id)})`);
  const loop = S.cycleLoop(J.length);
  ok(after.every((e) => e.journal >= J.length - loop), "journal: with the dog home, a page from outside the repeat was written");
  ok(after.every((e, k) => !k || e.journal !== after[k - 1].journal), `journal: with the dog home, a page was written two days running (${after.map((e) => e.journal + 1)})`);
});

group("real facts: quests wait for their days, errands for the first quest", () => {
  const g = loadGame();
  const { S, W } = g;
  const QUESTS = W.QUESTS || [];
  if (!QUESTS.length) return;
  S.newGame(1, "Gates");
  W.LOCATIONS.forEach((l) => !S.save.known.includes(l.id) && S.save.known.push(l.id));
  S.crewIds().forEach((id) => S.addTrust(id, 1000));
  const c = S.save.crew;
  // each giver's quests in order: not on the day before its `when.day`, then on that day
  QUESTS.forEach((q) => {
    const day = (q.when && q.when.day) || 1;
    if (day > 1) {
      S.save.day = day - 1;
      const o = S.offer(q.giver);
      ok(!(o && o.def.id === q.id), `quests: ${q.id} is offered on day ${day - 1}, before its day ${day}`);
    }
    S.save.day = day;
    const o = S.offer(q.giver);
    ok(o && o.kind === "quest" && o.def.id === q.id, `quests: ${q.id} is not offered on its day ${day} (${JSON.stringify(o && o.def.id)})`);
    c.quests[q.id] = { state: "done", day, doneDay: day };
  });
  // errands: none before a crew member's first story quest is handed in, then one (whose item a known shelf holds)
  const g2 = loadGame();
  const S2 = g2.S;
  S2.newGame(1, "Errands");
  S2.save.day = 2;
  S2.crewIds().forEach((id) => {
    const first = QUESTS.find((q) => q.giver === id);
    if (!first) return;
    const o = S2.offer(id);
    ok(o && o.kind === "quest" && o.def.id === first.id, `errands: ${id}'s first story quest is not offered on day 2`);
    S2.accept(id, o);
    ok(S2.offer(id) === null, `errands: ${id} asks for an errand before the first story quest is handed in`);
    S2.save.crew.quests[first.id].state = "found";
    S2.handIn(id);
    S2.save.day = 3;
    const e = S2.offer(id);
    if (((W.ERRANDS || {})[id] || []).some((x) => S2.crewItemStocked(x.item))) ok(e && e.kind === "errand" && S2.crewItemStocked(e.def.item), `errands: ${id} asks for no errand, or one no known shelf stocks, after the first story quest (${JSON.stringify(e && e.def.id)})`);
    S2.save.day = 2;
  });
});

/* =====================================================================================================
   4. The engine with the crew: the yard and the cabin (js/crew.js), the buildings (js/building.js), and a whole
      play-through. Every group runs the real engine with the real facts and the six levels' words
      (loadGame({ engine: true, content: true })), Math.random seeded inside the sandbox so each run plays the same.
      The yard is stepped with Interior.update(0.05) (20 frames a second, the loop stopped); in the buildings the
      player walks with the real controls (W toward each next tile, a shut door opened as E opens it).
   ===================================================================================================== */
const sim = { yard: 0, building: 0, loop: 0 }; // checks run in each part (for the summary)
/** A group whose checks count toward one part of the summary. */
function simGroup(part, name, fn) {
  const c0 = checks;
  group(name, fn);
  sim[part] += checks - c0;
}
/** The sandbox's Math.random from a seed (a small LCG). */
function seedRandom(g, seed) {
  vm.runInContext(`Math.random = ((s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)(${seed >>> 0})`, g.sb);
}
/** The whole game in a sandbox with Math.random seeded, and stand-ins for what js/main.js gives the engine (it is not
    loaded here): ZSR.Main.syncYard as main.js has it (the yard's fence, traps and cabin into the save, then a commit;
    never in a wave; g.syncs counts the calls) and hooks.onCrewCard (g.cards records each card asked for). Every
    toast is recorded (g.toasts: { text, t, phase, left }: the scene's time, the phase kind and its seconds left). */
function engineGame(seed) {
  const g = loadGame({ engine: true, content: true });
  const { I, S } = g;
  seedRandom(g, seed);
  g.toasts = [];
  const toast = I.toast;
  I.toast = function (text, secs, pickup) {
    g.toasts.push({ text: String(text), t: this.time, phase: this.phase ? this.phase.kind : null, left: this.phase ? this.phase.t : null });
    return toast.call(this, text, secs, pickup);
  };
  g.cards = [];
  I.hooks.onCrewCard = (id, action) => g.cards.push([id, action]);
  g.syncs = 0;
  g.ZSR.Main = {
    syncYard() {
      g.syncs++;
      if (I.mode !== "yard" || !S.save || (I.phase && I.phase.kind === "wave")) return;
      S.save.fence = I.fenceState();
      S.save.yardTraps = I.traps.filter((t) => t.uses > 0).map((t) => ({ x: t.x, y: t.y, type: t.type, uses: t.uses }));
      S.save.house.hp = I.houseState();
      S.commit();
    },
  };
  return g;
}
/** A new save (edit(S, W) on it first), then home to the yard as js/main.js goes there: no trip, a long first calm,
    the loop stopped (the test steps it), and a player no walker can bring down. */
function homeYard(g, edit) {
  const { S, I } = g;
  S.newGame(1, "Sim");
  S.trip = null;
  if (edit) edit(S, g.W);
  I.enterYard({ firstCalm: 999 });
  I.stop();
  I.player.maxHp = I.player.hp = 1e9;
  g.toasts.length = 0;
  g.cards.length = 0;
  return I;
}
/** Step the scene `secs` seconds at 20 frames a second; each(t) after every frame (return false to stop). */
function stepFor(g, secs, each) {
  let t = 0;
  while (t < secs - 1e-9) {
    g.I.update(0.05);
    t += 0.05;
    if (each && each(t) === false) break;
  }
  return t;
}
const crewOf = (g, id) => (g.I.crew || []).find((c) => c.id === id);
/** Keep a crew member still at (x, y): at no post, dwelling a long while, with no job to look for. */
function hold(g, id, x, y) {
  const c = crewOf(g, id);
  Object.assign(c, { x, y, state: "dwell", t: 1e6, jobT: 1e6, path: [], post: null, job: null });
  g.I.crewPlace(c);
  return c;
}
/** The player at (x, y), looking at (tx, ty). */
function standAt(g, x, y, tx, ty) {
  const p = g.I.player;
  p.x = x;
  p.y = y;
  p.a = Math.atan2(ty - y, tx - x);
  return p;
}
const tileKey = (e) => Math.floor(e.x) + "," + Math.floor(e.y);
/** Whose job this is (CREW[id].jobs): { id, stars } of the first crew member with it, or null. */
function jobOf(W, job) {
  for (const [id, c] of Object.entries(W.CREW || {})) {
    const j = (c.jobs || []).find((x) => x && x.job === job);
    if (j) return { id, stars: j.stars || 0 };
  }
  return null;
}
/** Trust points for this many stars. */
const trustFor = (W, stars) => (stars > 0 ? W.CREW_RULES.stars[stars - 1] : 0);
/** The yard's tiles inside the fence ring ("x,y"): not on the fence line, and not reachable from the grid's edge
    without crossing it (a hole is still the fence line). */
function insideFence(W) {
  const G = W.YARD.grid;
  const h = G.length;
  const w = Math.max(...G.map((r) => r.length));
  const out = new Set();
  const seen = new Set();
  const q = [];
  for (let x = 0; x < w; x++) q.push([x, 0], [x, h - 1]);
  for (let y = 0; y < h; y++) q.push([0, y], [w - 1, y]);
  q.forEach(([x, y]) => seen.add(x + "," + y));
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const k = nx + "," + ny;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || seen.has(k) || G[ny][nx] === "F") continue;
      seen.add(k);
      q.push([nx, ny]);
    }
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (G[y][x] !== "F" && !seen.has(x + "," + y)) out.add(x + "," + y);
  return out;
}
/** The fence line's tiles [x, y], and a few picked from it: the middle of each side, and the corners. */
function fenceTiles(W) {
  const F = [];
  W.YARD.grid.forEach((row, y) => [...row].forEach((ch, x) => ch === "F" && F.push([x, y])));
  const xs = F.map(([x]) => x);
  const ys = F.map(([, y]) => y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const mid = (list) => list.sort((a, b) => a[0] - b[0] || a[1] - b[1])[list.length >> 1];
  return {
    all: F,
    n: mid(F.filter(([, y]) => y === y0)),
    s: mid(F.filter(([, y]) => y === y1)),
    e: mid(F.filter(([x]) => x === x1)),
    w: mid(F.filter(([x]) => x === x0)),
    corner: F.find(([x, y]) => x === x0 && y === y0),
  };
}
const shelterKeys = (I) => new Set(I.crewShelterTiles().map((t) => Math.floor(t.x) + "," + Math.floor(t.y)));
const POSES = ["stand", "sit", "work", "read", "walk"];

/* ---------- The yard ---------- */
simGroup("yard", "engine: loads with the crew state", () => {
  const g = loadGame({ engine: true });
  g.S.newGame(1, "Engine");
  ok(g.I && typeof g.I.enterYard === "function", "engine: the Interior did not load");
  ok(g.S.save.crew && typeof g.S.offer === "function", "engine: the crew state did not load with the engine");
});

simGroup("yard", "yard: the crew's props, ten minutes of calm, a build", () => {
  const g = engineGame(101);
  const { I, S, W, ZSR: Z } = g;
  homeYard(g);
  const ids = Object.keys(W.CREW).filter((id) => (W.CREW[id].posts || []).length);
  ok(ids.length && same(I.crew.map((c) => c.id), ids), `yard: the crew in the yard (${I.crew.map((c) => c.id)}) are not every CREW id with posts (${ids})`);
  const scale = (Z.CREW_ART && Z.CREW_ART.scale && Z.CREW_ART.scale.crew) || 0;
  ok(scale > 0, "yard: CREW_ART.scale.crew is missing");
  // (a) the prop: in the scene, at their feet, the crew's prop scale (CREW_ART.scale.crew) times theirs, 0.75 wide, never solid, and one
  // cached picture per opts set ({ who, pose, f }, f exactly 0 or 1)
  const propBad = [];
  const props = (when) =>
    I.crew.forEach((c) => {
      const pr = c.prop;
      const o = (pr && pr.opts) || {};
      const why = !pr || !I.props.includes(pr) ? "not in the scene" : pr.art !== "crew" ? `art ${pr.art}` : Math.abs(pr.scale - W.CREW[c.id].scale * scale) > 1e-9 ? `scale ${pr.scale}` : pr.wide !== 0.75 ? `wide ${pr.wide}` : pr.solid || pr.lift ? "solid or lifted" : !same(Object.keys(o).sort(), ["f", "pose", "who"]) || o.who !== c.id || !POSES.includes(o.pose) || (o.f !== 0 && o.f !== 1) ? `opts ${JSON.stringify(o)}` : !pr.img ? "no picture" : pr.x !== c.x || pr.y !== c.y ? "not where they stand" : "";
      if (why && !propBad.some((x) => x.startsWith(c.id + "'s"))) propBad.push(`${c.id}'s prop ${when}: ${why}`);
    });
  props("on entry");
  ok(!I.crew.some((c) => I.blockers.has(tileKey(c))), "yard: a crew member's tile is solid (props are never solid)");
  // (c) ten minutes of calm: never on a tile they may not stand on, always inside the fence, three posts or more each
  const inside = insideFence(W);
  const off = [];
  const out = [];
  const posts = {};
  let frame = 0;
  stepFor(g, 600, () => {
    const pass = I.crewPass();
    I.crew.forEach((c) => {
      const [x, y] = [Math.floor(c.x), Math.floor(c.y)];
      if (!pass(x, y) && off.length < 3) off.push(`${c.id} at ${c.x.toFixed(2)},${c.y.toFixed(2)}`);
      if (!inside.has(x + "," + y) && out.length < 3) out.push(`${c.id} at ${c.x.toFixed(2)},${c.y.toFixed(2)}`);
      if (c.state === "dwell" && c.post) (posts[c.id] = posts[c.id] || new Set()).add(c.post.id);
    });
    if (++frame % 3 === 0) props("in the calm"); // every pose and frame lasts longer than 3 frames
  });
  ok(!propBad.length, `yard: ${propBad.join("; ")}`);
  ok(!off.length, `yard: in ten minutes of calm a crew member stood where crewPass() says no (${off.join("; ")})`);
  ok(!out.length, `yard: in ten minutes of calm a crew member left the fence ring (${out.join("; ")})`);
  ids.forEach((id) => ok(posts[id] && posts[id].size >= 3, `yard: ${id} kept to ${posts[id] ? [...posts[id]].join(", ") : "no post"} in ten minutes (3 or more posts)`));
  ok(I.phase.kind === "calm" && !g.toasts.length, `yard: ten quiet minutes made toasts (${g.toasts.map((x) => x.text).join(" | ")})`);
  // a build: every room to level 3 at once (refreshYard puts the builds up), with one of the crew caught where a
  // build goes up and another walking a way planned across a plot before it was built; nobody is left inside a
  // build or walks into one, and they go on
  const rooms = (lv) => {
    Object.keys(S.save.rooms).forEach((k) => (S.save.rooms[k] = lv));
    I.refreshYard();
  };
  rooms(3);
  const plots = Object.values(W.YARD.plots);
  const built = [];
  plots.forEach((pl) => {
    for (let y = pl.y; y < pl.y + pl.h; y++) for (let x = pl.x; x < pl.x + pl.w; x++) if (I.solidAt(x + 0.5, y + 0.5)) built.push([x, y, pl]);
  });
  rooms(0);
  const across = I.crew[1];
  const way = built
    .map(([x, y, pl]) => {
      const pass0 = I.crewPass();
      if (!pass0(pl.x - 1, y) || !pass0(pl.x + pl.w, y)) return null;
      const path = I.crewPath(pl.x - 0.5, y + 0.5, pl.x + pl.w, y);
      return path && path.length === 1 ? { path, from: [pl.x - 0.5, y + 0.5] } : null; // one straight walk over the plot
    })
    .find(Boolean);
  if (ok(across && way, "yard: setup, no plot to plan a walk across")) {
    Object.assign(across, { x: way.from[0], y: way.from[1], path: way.path, state: "walk", post: null, job: null });
  }
  rooms(3);
  if (ok(built.length, "yard: setup, no build stands on a plot at level 3")) {
    const c = I.crew[0];
    c.x = built[0][0] + 0.5;
    c.y = built[0][1] + 0.5;
    c.state = "walk";
    c.path = [];
  }
  I.update(0.05);
  const pass = I.crewPass();
  ok(I.crew.every((c) => pass(Math.floor(c.x), Math.floor(c.y))), `yard: after a build a crew member is stuck in it (${I.crew.filter((c) => !pass(Math.floor(c.x), Math.floor(c.y))).map((c) => c.id)})`);
  ok(I.crew.every((c) => I.props.includes(c.prop)), "yard: after refreshYard a crew member is no longer in the scene (crewDress)");
  const at = I.crew.map((c) => [c.x, c.y]);
  const moved = new Set();
  const off2 = [];
  stepFor(g, 120, () => {
    const ps = I.crewPass();
    I.crew.forEach((c, i) => {
      if (Math.hypot(c.x - at[i][0], c.y - at[i][1]) > 1) moved.add(c.id);
      if (!ps(Math.floor(c.x), Math.floor(c.y)) && off2.length < 3) off2.push(c.id + " at " + c.x.toFixed(2) + "," + c.y.toFixed(2));
    });
  });
  ok(!off2.length && moved.size === I.crew.length, `yard: after the build the crew do not wander freely (stuck: ${I.crew.filter((c) => !moved.has(c.id)).map((c) => c.id)}; on a blocked tile: ${off2})`);
});

simGroup("yard", "yard: every post at room levels 0 to 3 and mixes", () => {
  const g = engineGame(102);
  const { I, S, W } = g;
  homeYard(g);
  const inside = insideFence(W);
  const H = W.HOUSE;
  const [ax, ay] = H.at;
  const spots = Object.entries(H.spots).map(([name, [sx, sy]]) => [name, ax + sx + 0.5, ay + sy + 0.5]);
  const van = [];
  W.YARD.grid.forEach((row, y) => [...row].forEach((ch, x) => ch === "V" && van.push([x + 0.5, y + 0.5])));
  const sh = H.rooms[W.CREW_RULES.shelter].rect;
  const rooms = Object.keys(S.save.rooms);
  const rnd = ((s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)(77);
  const configs = [0, 1, 2, 3].map((lv) => ["level " + lv, Object.fromEntries(rooms.map((k) => [k, lv]))]);
  for (let i = 0; i < 4; i++) configs.push(["mix " + (i + 1), Object.fromEntries(rooms.map((k) => [k, Math.floor(rnd() * 4)]))]);
  const all = [];
  Object.entries(W.CREW).forEach(([id, c]) => (c.posts || []).forEach((post) => all.push({ id, post })));
  ok(all.length >= Object.keys(W.CREW).length * 2, "posts: too few to check");
  const bad = [];
  configs.forEach(([name, lv]) => {
    Object.assign(S.save.rooms, lv);
    I.dressYard(); // the builds of these levels go up (and the crew are put back in the scene)
    const pass = I.crewPass();
    const reach = I.reachable(Math.floor(I.player.x), Math.floor(I.player.y), true); // the player, opening doors
    all.forEach(({ id, post }) => {
      const [x, y] = I.crewPostTile(post);
      const cx = x + 0.5;
      const cy = y + 0.5;
      const near = (list) => list.find(([, px, py]) => Math.hypot(px - cx, py - cy) < 1.5);
      const spot = near(spots);
      const why =
        I.grid[y][x] !== "." || I.solidAt(cx, cy) || !pass(x, y)
          ? `not open floor ('${I.grid[y][x]}')`
          : !reach.has(x + "," + y)
            ? "out of the player's reach"
            : !inside.has(x + "," + y)
              ? "outside the fence"
              : Object.values(W.YARD.plots).some((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h)
                ? "on a plot"
                : spot
                  ? `within 1.5 tiles of the cabin's ${spot[0]}`
                  : van.some(([vx, vy]) => Math.hypot(vx - cx, vy - cy) < 1.5)
                    ? "within 1.5 tiles of the van"
                    : x - ax >= sh[0] && x - ax <= sh[2] && y - ay >= sh[1] && y - ay <= sh[3]
                      ? "in the shelter"
                      : "";
      if (why && bad.length < 6) bad.push(`${name}: ${id}'s post ${post.id} at ${x},${y} is ${why}`);
    });
    // the crew walk between their open posts: each one reaches every other on the crew's rules
    Object.keys(W.CREW).forEach((id) => {
      const open = all.filter((a) => a.id === id && I.crewPostOpen(a.post)).map((a) => I.crewPostTile(a.post));
      if (!open.length) return;
      const dist = I.crewDist(open[0][0], open[0][1], pass);
      const lost = open.filter(([x, y]) => dist[y * I.gw + x] < 0);
      if (lost.length && bad.length < 6) bad.push(`${name}: ${id} cannot walk between posts (${lost.map((t) => t.join(",")).join("; ")})`);
    });
  });
  ok(!bad.length, `posts: ${bad.join("; ")}`);
});

simGroup("yard", "yard: the fence job mends holes and cracks, paying from the base's scrap", () => {
  const g = engineGame(103);
  const { I, S, W } = g;
  const fx = jobOf(W, "fence");
  if (!ok(fx, "repairs: nobody has the fence job")) return;
  const cost = W.SETTINGS.fenceRepairScrap;
  const FT = fenceTiles(W);
  const key = (t) => t.join(",");
  const hp0 = W.DEFENSE.fenceHp[0];
  // two holes and one crack, scrap for two fixes
  homeYard(g, (S) => {
    S.addTrust(fx.id, trustFor(W, fx.stars));
    S.save.fence = { [key(FT.n)]: 0, [key(FT.s)]: 0, [key(FT.e)]: Math.floor(hp0 * 0.3) };
    S.save.scrap = 2 * cost;
  });
  const left = () => I.crewFenceDamage().length;
  ok(left() === 3 && I.fenceHoles().length === 2, `repairs: setup, ${left()} damaged segments`);
  const fixes = [];
  let n = left();
  let t0 = g.toasts.length;
  stepFor(g, 240, (t) => {
    const now = left();
    if (now !== n) {
      fixes.push({ t, toasts: g.toasts.slice(t0).map((x) => x.text) });
      n = now;
    }
    t0 = g.toasts.length;
    return fixes.length < 2;
  });
  const rep = S.crewReport(fx.id);
  ok(fixes.length === 2 && left() === 1, `repairs: with scrap for two, ${fixes.length} fixed in 4 minutes (${left()} left)`);
  ok(S.save.scrap === 0, `repairs: scrap left ${S.save.scrap} (two fixes paid, never below 0)`);
  ok(rep.fence === 2 && rep.scrap === 2 * cost && !rep.fenceFree, `repairs: the report is ${JSON.stringify(rep)}, not { fence: 2, scrap: ${2 * cost} }`);
  ok(fixes.every((f) => !f.toasts.length) && !g.toasts.length, `repairs: a toast at the moment of a fix (${g.toasts.map((x) => x.text).join(" | ")}); the report tells it`);
  // the third waits for scrap, then is fixed
  stepFor(g, 90);
  ok(left() === 1 && !g.toasts.length, "repairs: a segment was fixed with no scrap to pay for it");
  S.save.scrap = cost;
  const t3 = stepFor(g, 180, () => left() > 0);
  ok(left() === 0 && S.save.scrap === 0 && S.crewReport(fx.id).fence === 3, `repairs: once scrap was back the last segment was not fixed and paid for (${left()} left after ${t3.toFixed(0)} s, scrap ${S.save.scrap})`);
  // with the crewRepairFree perk the fixes cost nothing and are told as free
  const free = (W.QUESTS || []).find((q) => q.reward && q.reward.perk && q.reward.perk.crewRepairFree);
  if (free) {
    homeYard(g, (S) => {
      S.addTrust(fx.id, trustFor(W, fx.stars));
      S.save.crew.quests[free.id] = { state: "done", day: 1, doneDay: 1 };
      S.save.fence = { [key(FT.n)]: 0, [key(FT.w)]: 0 };
      S.save.scrap = 0;
    });
    stepFor(g, 240, () => left() > 0);
    const r2 = S.crewReport(fx.id);
    ok(left() === 0 && S.save.scrap === 0, `repairs: with crewRepairFree and no scrap, ${left()} holes left (scrap ${S.save.scrap})`);
    ok(r2.fenceFree === 2 && !r2.fence && !r2.scrap && same(S.crewReportItems(fx.id).map((x) => x.key), ["fenceFree"]), `repairs: free fixes reported as ${JSON.stringify(r2)}`);
  }
});

simGroup("yard", "yard: the fence job keeps back the scrap a ready build needs", () => {
  const g = engineGame(113);
  const { I, S, W } = g;
  const fx = jobOf(W, "fence");
  if (!ok(fx, "reserve: nobody has the fence job")) return;
  const cost = W.SETTINGS.fenceRepairScrap;
  const FT = fenceTiles(W);
  const key = (t) => t.join(",");
  const hp0 = W.DEFENSE.fenceHp[0];
  let room = null;
  let lv = null;
  // the cheapest room you could build: its items in storage and exactly its scrap; a hole and a crack in the fence
  homeYard(g, (S) => {
    S.addTrust(fx.id, trustFor(W, fx.stars));
    const open = Object.keys(W.BASE_ROOMS).filter((r) => {
      const c = S.canUpgradeRoom(r);
      return !c.maxed && !c.locked.length;
    });
    room = open.sort((a, b) => W.BASE_ROOMS[a].levels[S.save.rooms[a]].scrap - W.BASE_ROOMS[b].levels[S.save.rooms[b]].scrap)[0];
    lv = W.BASE_ROOMS[room].levels[S.save.rooms[room]];
    Object.entries(lv.needs).forEach(([k, n]) => (S.save.inventory[k] = n));
    S.save.scrap = lv.scrap;
    S.save.fence = { [key(FT.n)]: 0, [key(FT.e)]: Math.floor(hp0 * 0.3) };
  });
  const nb = S.nextBuild();
  if (!ok(nb && nb.ready && I.crewScrapReserve() === lv.scrap, `reserve: setup, the ${room} is not the ready next build (${JSON.stringify(nb)}, reserve ${I.crewScrapReserve()})`)) return;
  const left = () => I.crewFenceDamage().length;
  stepFor(g, 120);
  ok(left() === 2 && S.save.scrap === lv.scrap && S.canUpgradeRoom(nb.room).ok, `reserve: with a build ready and only its scrap, the crew spent ${lv.scrap - S.save.scrap} scrap on the fence (${left()} of 2 left)`);
  // scrap above the build's: they spend that and no more
  S.save.scrap = lv.scrap + cost;
  stepFor(g, 180, () => left() > 1);
  stepFor(g, 60);
  ok(left() === 1 && S.save.scrap === lv.scrap && S.canUpgradeRoom(nb.room).ok, `reserve: with ${cost} scrap above the build's, ${2 - left()} fixed and ${S.save.scrap} scrap left (want 1 fixed, ${lv.scrap} left)`);
  // no build ready (an item it needs gone): the usual scrap pays as before
  const item = Object.keys(lv.needs)[0];
  if (item) {
    S.save.inventory[item] = 0;
    ok(I.crewScrapReserve() === 0, "reserve: scrap kept back with no build ready");
    stepFor(g, 180, () => left() > 0);
    ok(left() === 0 && S.save.scrap === lv.scrap - cost, `reserve: with no build ready the last segment was not fixed with the usual scrap (${left()} left, scrap ${S.save.scrap})`);
  }
});

simGroup("yard", "yard: the cabin job fixes a smashed window, and a corner hole is reached", () => {
  const g = engineGame(104);
  const { I, S, W } = g;
  const fx = jobOf(W, "fence");
  const cx = jobOf(W, "cabin");
  if (!ok(fx && cx && fx.id === cx.id, "repairs: the fence and cabin jobs are not one crew member's (this simulation needs both)")) return;
  const FT = fenceTiles(W);
  homeYard(g, (S) => {
    S.addTrust(cx.id, trustFor(W, cx.stars));
    S.save.fence = { [FT.corner.join(",")]: 0 };
    S.save.scrap = 50;
  });
  const win = Object.keys(I.barriers).find((k) => I.barriers[k].kind === "window");
  I.yardHitBarrier(win, 1e9);
  const b = I.barriers[win];
  ok(b.hp === 0, "repairs: setup, the window did not smash");
  let cornerAt = null;
  let winAt = null;
  stepFor(g, 400, (t) => {
    if (cornerAt == null && !I.crewFenceDamage().length) cornerAt = t;
    if (winAt == null && b.hp >= b.max) winAt = t;
    return winAt == null || cornerAt == null;
  });
  ok(cornerAt != null, `repairs: the corner hole at ${FT.corner} was never fixed (no tile beside it reached)`);
  ok(winAt != null && winAt >= cornerAt, `repairs: the smashed window was ${winAt == null ? "never fixed" : "fixed before the fence"} at ${cx.stars} stars`);
  const [wx, wy] = win.split(",").map(Number);
  ok(I.grid[wy][wx] !== "U", "repairs: the fixed window still lets walkers climb in");
  const rep = S.crewReport(cx.id);
  ok(rep.cabin === 1 && rep.fence === 1 && rep.scrap === W.SETTINGS.houseRepairScrap + W.SETTINGS.fenceRepairScrap, `repairs: the report is ${JSON.stringify(rep)}, not { fence: 1, cabin: 1 } with their scrap`);
  // below the cabin job's stars a smashed window waits for you
  if (cx.stars > 0) {
    homeYard(g, (S) => (S.save.scrap = 50));
    I.yardHitBarrier(win, 1e9);
    stepFor(g, 120);
    ok(I.barriers[win].hp === 0, `repairs: the window was fixed below ${cx.stars} stars`);
  }
});

simGroup("yard", "yard: a wave sends the crew (and the dog) into the shelter", () => {
  const g = engineGame(105);
  const { I, W } = g;
  [false, true].forEach((dog) => {
    homeYard(g, (S) => {
      if (dog) S.save.crew.dog.home = true;
    });
    Object.assign(I.phase, { next: { size: "some", sides: ["n"] }, t: 0.01 });
    const sh = shelterKeys(I);
    ok(sh.size > 0, "shelter: no shelter tiles");
    const off = [];
    stepFor(g, 20, () => {
      const pass = I.crewPass();
      I.crew.forEach((c) => !pass(Math.floor(c.x), Math.floor(c.y)) && off.length < 3 && off.push(c.id));
    });
    const who = dog ? "with the dog home" : "";
    ok(I.phase.kind === "wave", `shelter ${who}: no wave began`);
    ok(I.crew.every((c) => c.state === "shelter" && sh.has(tileKey(c))), `shelter ${who}: after 20 s not every crew member is in the shelter (${I.crew.map((c) => c.id + ":" + c.state + "@" + tileKey(c)).join(", ")})`);
    ok(I.crewShelterDoors().length && I.crewShelterDoors().every((d) => !d.open), `shelter ${who}: the shelter's door is not shut`);
    ok(!off.length, `shelter ${who}: on the way a crew member stood where crewPass() says no (${off})`);
    if (dog) {
      const d = I.dog;
      ok(d && d.home && sh.has(tileKey(d.home)) && Math.hypot(d.x - d.home.x, d.y - d.home.y) < 0.3, `shelter: the dog is not in the shelter (${d && d.x.toFixed(2)},${d && d.y.toFixed(2)})`);
      const wave = g.toasts.find((x) => x.phase === "wave");
      ok(wave && /bark/i.test(wave.text), `shelter: the wave toast does not bark (${wave && wave.text})`);
    }
  });
});

simGroup("yard", "yard: a raider in the shelter hurts one crew member, once", () => {
  const g = engineGame(106);
  const { I, S, W, store } = g;
  const R = W.CREW_RULES;
  const ids = Object.keys(W.CREW);
  homeYard(g, (S) => {
    S.save.inventory.meds = 1;
    ids.forEach((id) => S.addTrust(id, 10));
  });
  S.commit();
  // you out at the far fence, well away from the cabin (a raider near you comes for you instead)
  const inside = [...insideFence(W)].map((k) => k.split(",").map(Number)).filter(([x, y]) => !I.solidAt(x + 0.5, y + 0.5) && !I.indoorAt(x + 0.5, y + 0.5));
  const sh0 = I.crewShelterTiles()[0];
  const far = inside.sort((a, b) => Math.hypot(b[0] - sh0.x, b[1] - sh0.y) - Math.hypot(a[0] - sh0.x, a[1] - sh0.y))[0];
  standAt(g, far[0] + 0.5, far[1] + 0.5, sh0.x, sh0.y);
  // a wave with nothing left to come out of the trees: it lasts until the test says so
  I.phase = { kind: "wave", size: "some", total: 1, spawned: 0, spawnT: 1e9, t: 0, sides: ["n"] };
  let commits = 0;
  const commit = S.commit;
  S.commit = function () {
    if (I.phase && I.phase.kind === "wave") commits++;
    return commit.apply(this, arguments);
  };
  const saved = store.get("zs.save.1");
  stepFor(g, 30, () => !(I.crewWaveInfo && I.crewWaveInfo.shut));
  const info = I.crewWaveInfo;
  if (!ok(info && info.shut, "raid: the crew never shut themselves in")) return;
  const door = I.crewShelterDoors()[0];
  // a raider starts by the shelter's door, on the other side, and makes for a shelter tile
  const tiles = shelterKeys(I);
  const by = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [door.x + dx, door.y + dy]).find(([x, y]) => !tiles.has(x + "," + y) && !I.solidAt(x + 0.5, y + 0.5));
  const raider = (spot) => {
    const z = I.makeWalker("walker", by[0] + 0.5, by[1] + 0.5, 1);
    Object.assign(z, { awake: true, raid: true, raidSpot: spot, raidShelter: true });
    I.walkers.push(z);
    return z;
  };
  const trust0 = Object.fromEntries(ids.map((id) => [id, S.trust(id)]));
  const food0 = S.save.food;
  const spots = I.crewShelterSpots();
  raider(spots[0]);
  let forced = false;
  let firstAt = null;
  stepFor(g, 60, (t) => {
    if (door.open && !door.broken) forced = true;
    if (firstAt == null && info.hurt.size) firstAt = t;
    return firstAt == null || t < firstAt + 3 * R.hurtSeconds; // and a while longer among them
  });
  ok(forced, "raid: the raider did not force the shelter's door open (or broke it)");
  const hurt = [...info.hurt];
  ok(hurt.length === 1, `raid: one raider among the crew for ${(3 * R.hurtSeconds).toFixed(0)} s after the first hurt ${hurt.length} of them (${hurt}); a raider hurts one crew member`);
  const h = hurt[0];
  ok(h && S.save.inventory.meds === 0 && S.save.food === food0, `raid: the hurt did not cost the 1 medical kit in storage (meds ${S.save.inventory.meds}, food ${food0} -> ${S.save.food})`);
  ok(h && S.trust(h) === trust0[h] - R.loss.hurt && ids.filter((id) => id !== h).every((id) => S.trust(id) === trust0[id]), `raid: trust did not drop by loss.hurt (${R.loss.hurt}) for ${h} alone (${ids.map((id) => id + " " + trust0[id] + "->" + S.trust(id))})`);
  const shout = g.toasts.find((x) => /shout/i.test(x.text));
  ok(shout && h && shout.text.includes(g.ZSR.crewName(h)), `raid: no shout toast naming ${h} (${g.toasts.map((x) => x.text).join(" | ")})`);
  ok(same(S.crewReport(h).hurt, ["a medical kit"]), `raid: ${h}'s report ${JSON.stringify(S.crewReport(h))}`);
  // more raiders, more hurt, but nobody twice: one more goes for the tile of the one already hurt, then one for each
  // shelter tile, each sent once the one before has hurt someone and been put down (so a raider that stays among
  // them never blocks the next: with more crew than shelter tiles they share tiles, docs/SCALING.md). The hurts after
  // the kit cost 2 food each, and once every crew member is hurt, a raider hurts nobody
  const downHurters = () => I.walkers.forEach((z) => z.crewHurt && z.hp > 0 && I.hurtWalker(z, 1e6));
  downHurters();
  const hurtAt = I.crew.find((c) => c.id === h);
  const sent = [{ x: hurtAt.x, y: hurtAt.y }].concat(spots);
  // enough raiders for every crew member, whatever the tiles: the spots again until all are hurt (or a round hurts nobody)
  for (let round = 0; round < ids.length && info.hurt.size < ids.length; round++) {
    const before = info.hurt.size;
    (round ? spots : sent).forEach((spot) => {
      if (info.hurt.size >= ids.length) return;
      raider(spot);
      stepFor(g, 25);
      downHurters();
    });
    if (info.hurt.size === before) break;
  }
  const reps = ids.map((id) => (S.crewReport(id).hurt || []).length);
  ok(info.hurt.size === ids.length && reps.every((n) => n === 1), `raid: the raiders hurt ${info.hurt.size} of ${ids.length} (hurts in the reports: ${ids.map((id, i) => id + " " + reps[i])}); every crew member once, nobody twice`);
  ok(S.save.food === Math.max(0, food0 - R.hurtCost.food * (info.hurt.size - 1)), `raid: the ${info.hurt.size - 1} hurts after the kit ran out did not cost ${R.hurtCost.food} food each (${food0} -> ${S.save.food})`);
  // and one more among them, with everyone hurt already: nobody is hurt twice
  raider(spots[0]);
  stepFor(g, 25);
  ok(ids.every((id) => (S.crewReport(id).hurt || []).length === 1), "raid: a raider among a crew already all hurt hurt one of them again");
  ok(commits === 0 && store.get("zs.save.1") === saved, `raid: the game saved mid-wave (${commits} commits)`);
  // cleared: the door opens at once, and they come out
  I.walkers.forEach((z) => I.hurtWalker(z, 1e6));
  I.phase.spawned = I.phase.total;
  door.open = false; // shut again, as the crew would have it (the raiders forced it)
  I.grid[door.y][door.x] = "O";
  I.maskDirty = true;
  stepFor(g, 5, () => I.phase.kind !== "calm");
  ok(I.phase.kind === "calm" && door.open, "raid: the shelter's door did not open once the wave was cleared");
  let outAt = null;
  stepFor(g, 40, (t) => {
    if (I.crew.every((c) => !tiles.has(tileKey(c)))) outAt = t;
    return outAt == null;
  });
  ok(outAt != null && outAt <= 30, `raid: the crew did not come out of the shelter within 30 s of the clear (${outAt})`);
  S.commit = commit;
});

simGroup("yard", "yard: the lookout calls real waves only", () => {
  const g = engineGame(107);
  const { I, S, W, ZSR: Z } = g;
  const lk = jobOf(W, "lookout");
  if (!ok(lk, "lookout: nobody has the lookout job")) return;
  const SIZE = { some: "a small wave", many: "a big wave" };
  /** A calm 20 s from its end, with `next` rolled; Pip at `stars`; the bell rung if asked. Returns what was said. */
  function calm(stars, next, bell) {
    homeYard(g, (S) => S.addTrust(lk.id, trustFor(W, stars)));
    Object.assign(I.phase, { t: 20, next, called: false, forced: false });
    delete I.phase.lookT;
    if (bell) I.houseInteract({ kind: "spot", obj: "bell", x: 0, y: 0 });
    g.toasts.length = 0;
    let wave = null;
    stepFor(g, 22, () => {
      if (!wave && I.phase.kind === "wave") wave = { size: I.phase.size, sides: I.phase.sides.slice() };
    });
    const said = g.toasts.filter((x) => x.phase === "calm" && !/still quiet/i.test(x.text));
    return { said, wave };
  }
  const secs = S.crewLookoutSeconds();
  const big = { size: "many", sides: ["n", "e"] };
  const a = calm(lk.stars, big);
  const call = a.said[0];
  ok(a.said.length === 1, `lookout: at ${lk.stars} star(s), ${a.said.length} calls before the wave (${a.said.map((x) => x.text).join(" | ")})`);
  if (call) {
    ok(call.left <= secs + 1e-6 && call.left > secs - 0.1, `lookout: called with ${call.left.toFixed(2)} s left, not ${secs}`);
    ok(call.text.includes(SIZE.many) && ["n", "e"].every((s) => call.text.includes(I.waveWhere([s]))), `lookout: the call does not name "${SIZE.many}" and both sides: ${call.text}`);
  }
  ok(a.wave && a.wave.size === "many" && same(a.wave.sides, ["n", "e"]), `lookout: the wave that came (${JSON.stringify(a.wave)}) is not the one called`);
  if (lk.stars > 0) {
    const b = calm(lk.stars - 1, big);
    ok(!b.said.length && b.wave, `lookout: called below ${lk.stars} star(s) (${b.said.map((x) => x.text)})`);
  }
  const c = calm(lk.stars, { size: "none", sides: [] });
  ok(!c.said.length && !c.wave && g.toasts.some((x) => /still quiet/i.test(x.text)), `lookout: a calm that stays quiet was called (${c.said.map((x) => x.text).join(" | ")})`);
  const d = calm(lk.stars, big, true);
  ok(!d.said.length && d.wave && d.wave.size === "many", `lookout: called after the dinner bell (${d.said.map((x) => x.text).join(" | ")})`);
});

/* ---------- Talking: E, the bubble, the card ---------- */
/** An open stretch of yard with room around it: the inside tile farthest from anything solid (plots, the cabin,
    the van, the fence), so a crew member held there and the player beside them see only each other. */
function openGround(g) {
  const { I, W } = g;
  let best = null;
  insideFence(W).forEach((k) => {
    const [x, y] = k.split(",").map(Number);
    let r = 0;
    while (r < 6) {
      let clear = true;
      for (let dy = -r - 1; dy <= r + 1 && clear; dy++) for (let dx = -r - 1; dx <= r + 1 && clear; dx++) if (I.solidAt(x + dx + 0.5, y + dy + 0.5) || W.YARD.grid[y + dy][x + dx] === "F") clear = false;
      if (!clear) break;
      r++;
    }
    if (!best || r > best.r) best = { x: x + 0.5, y: y + 0.5, r };
  });
  return best;
}

simGroup("yard", "yard: facing a crew member, and never in the way of the cabin's spots or the van", () => {
  const g = engineGame(108);
  const { I, W } = g;
  homeYard(g);
  const heal = jobOf(W, "heal") || { id: Object.keys(W.CREW)[0] };
  const who = heal.id;
  const name = g.ZSR.crewName(who);
  const o = openGround(g);
  ok(o && o.r >= 3, "facing: no open ground in the yard to test on");
  const c = hold(g, who, o.x, o.y);
  standAt(g, o.x, o.y + 1.5, c.x, c.y);
  let f = I.facing();
  ok(f && f.kind === "crew" && f.obj === c, `facing: looking at ${name} 1.5 tiles away is ${f ? f.kind : "nothing"}`);
  ok(f && I.yardHint(f).startsWith("Press E to talk to " + name), `facing: the hint is "${f && I.yardHint(f)}"`);
  I.player.a += 0.5;
  f = I.facing();
  ok(!(f && f.kind === "crew"), "facing: a crew member 0.5 rad off the crosshair takes E");
  // standing in the way of a cabin spot or the van, a crew member never takes E from it
  const H = W.HOUSE;
  const [ax, ay] = H.at;
  const reach = I.reachable(Math.floor(I.player.x), Math.floor(I.player.y), true);
  /** Every place to stand within `r` of (x, y) from which facing() is `want`, with `id` held between you and it. */
  function between(id, x, y, r, want) {
    let tried = 0;
    let stolen = 0;
    reach.forEach((v, k) => {
      const [tx, ty] = k.split(",").map(Number);
      const px = tx + 0.5;
      const py = ty + 0.5;
      if (Math.hypot(px - x, py - y) > r) return;
      standAt(g, px, py, x, y);
      hold(g, id, -50, -50); // out of the way first
      const f0 = I.facing();
      if (!f0 || !want(f0)) return;
      [0.4, 0.5, 0.6].forEach((s) => {
        hold(g, id, px + (x - px) * s, py + (y - py) * s);
        const cand = [];
        I.crewFacing(cand);
        if (!cand.some((x0) => x0.kind === "crew")) return; // not in view from here: proves nothing
        tried++;
        const f1 = I.facing();
        if (!f1 || !want(f1)) stolen++;
      });
    });
    return { tried, stolen };
  }
  Object.entries(H.spots).forEach(([spot, [sx, sy]]) => {
    const r = between(who, ax + sx + 0.5, ay + sy + 0.5, 1.5, (x) => x.kind === "spot" && x.obj === spot);
    ok(r.tried > 0, `facing: ${name} could not be put between you and the cabin's ${spot}`);
    ok(!r.stolen, `facing: ${name} in the way took E from the cabin's ${spot} (${r.stolen} of ${r.tried} places)`);
  });
  const fixer = (jobOf(W, "fence") || { id: who }).id;
  const v = between(fixer, I.van.x + 1, I.van.y + 0.5, 2.0, (x) => x.kind === "van");
  ok(v.tried > 0 && !v.stolen, `facing: ${g.ZSR.crewName(fixer)} in the way took E from the van (${v.stolen} of ${v.tried} places)`);
});

simGroup("yard", "yard: talking: June's patch-up, the bubble, words counted once, walking away", () => {
  const g = engineGame(109);
  const { I, S, W, ZSR: Z } = g;
  const heal = jobOf(W, "heal");
  if (!ok(heal, "talk: nobody has the heal job")) return;
  const who = heal.id;
  homeYard(g, (S) => S.addTrust(who, trustFor(W, Math.max(1, heal.stars))));
  const o = openGround(g);
  const c = hold(g, who, o.x, o.y);
  const p = standAt(g, o.x, o.y + 1.5, c.x, c.y);
  p.maxHp = S.footMaxHp();
  p.hp = Math.max(1, p.maxHp - S.crewHealAmount() - 20);
  I.update(0.05);
  const hp0 = p.hp;
  const w0 = S.save.stats.wordsRead;
  I.interact();
  ok(I.talk && I.talk.id === who, "talk: E at June did not open the bubble");
  if (!I.talk) return;
  ok(Math.abs(p.hp - hp0 - S.crewHealAmount()) < 1e-6, `talk: the patch-up gave ${(p.hp - hp0).toFixed(1)} health, not crewHealAmount() ${S.crewHealAmount()}`);
  const panel = I.talk.panel;
  I.update(0.05);
  ok(String(I.hud.read.className).split(/\s+/).includes("talk") && I.panelKey === panel.key, `talk: the read panel is not the bubble (class "${I.hud.read.className}")`);
  const max = W.CREW_RULES.stars.length;
  ok(panel.status === "★".repeat(S.stars(who)) + "☆".repeat(max - S.stars(who)) && panel.title === Z.crewName(who), `talk: the bubble's stars or name: ${panel.title} ${panel.status}`);
  ok(S.save.stats.wordsRead - w0 === Z.wordCount(panel.text), `talk: the first bubble counted ${S.save.stats.wordsRead - w0} words, not its ${Z.wordCount(panel.text)}`);
  ok(!S.crewReportItems(who).some((r) => r.key === "heal"), "talk: the patch-up told now was logged to be told again");
  // the yard runs on while the bubble is open
  const left = I.phase.t;
  stepFor(g, 2);
  ok(I.talk && I.phase.t < left - 1.9, "talk: the calm's clock stopped while the bubble was open (or it closed)");
  // more talks the same calm: no second patch-up, no heal report, and words already read never count again
  I.interact();
  ok(!I.talk, "talk: E again with nothing to ask did not close the bubble");
  const healTip = Z.crewFill(Z.crewText("tip", who, "heal"), { hp: S.crewHealAmount() }).trim();
  let healed = 0;
  let reported = 0;
  let recounted = 0;
  let quiet = 0;
  for (let i = 0; i < 12; i++) {
    p.hp = Math.max(1, p.maxHp - 60);
    const hp1 = p.hp;
    const w1 = S.save.stats.wordsRead;
    const read1 = new Set(S.save.crew.read).size;
    if (S.crewReportItems(who).some((r) => r.key === "heal")) reported++;
    I.interact();
    if (!I.talk) break;
    if (p.hp !== hp1) healed++;
    if (healTip && I.talk.panel.text.includes(healTip)) reported++; // the patch-up told again, as if it healed
    if (new Set(S.save.crew.read).size === read1) {
      quiet++;
      if (S.save.stats.wordsRead !== w1) recounted++;
    }
    I.interact();
  }
  ok(!healed, `talk: patched up ${healed} more times in the same calm`);
  ok(!reported, "talk: the patch-up was told again (as a report, or her heal tip with no patch-up)");
  ok(!recounted, `talk: ${recounted} bubbles with nothing new in them counted their words again`);
  ok(quiet > 0, "talk: twelve talks never repeated a text (nothing to check words-once against)");
  // walking three tiles away (backing off, S held) closes it
  I.interact();
  ok(I.talk, "talk: could not reopen the bubble");
  const y0 = I.player.y;
  I.keys.s = true;
  stepFor(g, 3, () => I.player.y - y0 < 3);
  I.keys.s = false;
  ok(I.player.y - y0 >= 3 && !I.talk && I.panelKey == null, `talk: walking 3 tiles away (${(I.player.y - y0).toFixed(2)}) did not close the bubble`);
  ok(c.state !== "talk", "talk: June stayed stopped after the bubble closed");
});

simGroup("yard", "yard: asking: the offer, the card, an errand's hand-in line", () => {
  const g = engineGame(110);
  const { I, S, W, ZSR: Z } = g;
  const first = (W.QUESTS || []).find((q) => q.when && q.when.day);
  if (!ok(first, "ask: no quest with a day to test the offer on")) return;
  const who = first.giver;
  const name = Z.crewName(who);
  homeYard(g, (S) => {
    S.save.day = first.when.day;
    S.addTrust(who, trustFor(W, first.when.stars || 0));
    if (!S.isKnown(first.at)) S.save.known.push(first.at);
  });
  ok(S.offer(who) && S.offer(who).def.id === first.id, `ask: setup, ${who} does not offer ${first.id}`);
  const o = openGround(g);
  const c = hold(g, who, o.x, o.y);
  standAt(g, o.x, o.y + 1.5, c.x, c.y);
  I.update(0.05);
  const need = W.CREW[who].pronoun === "they" ? "they need something" : W.CREW[who].pronoun + " needs something";
  ok(I.hud.hint.textContent === "Press E to talk to " + name + " (" + need + ")", `ask: the hint is "${I.hud.hint.textContent}"`);
  I.interact();
  ok(I.talk && I.talk.action === "offer" && same(I.talk.panel.meta[0], ["Press E again", name + " has a favor to ask"]), `ask: the bubble does not end with the favor (${JSON.stringify(I.talk && I.talk.panel.meta)})`);
  I.update(0.05);
  ok(I.hud.hint.textContent === "", `ask: with the question in the bubble the hint says "${I.hud.hint.textContent}"`);
  I.interact();
  ok(same(g.cards, [[who, "offer"]]), `ask: E again did not ask for the offer card (${JSON.stringify(g.cards)})`);
  // the card (js/main.js): "I'll do it" accepts, then crewCardDone
  const offer = S.offer(who);
  const accepted = S.accept(who, offer);
  I.crewCardDone(who, "offer", { accepted, kind: offer.kind, id: offer.def.id, title: "" });
  ok(accepted && S.request(who) && S.request(who).def.id === first.id && S.questState(first.id) === "active", "ask: after the card the request is not open");
  ok(!I.talk && c.state !== "talk", "ask: the bubble stayed open after the card");
  ok(g.syncs > 0 && JSON.parse(g.store.get("zs.save.1")).crew.quests[first.id], "ask: the accepted request was not saved (syncYard)");
  // an errand filled and in storage: the bubble's line counts its items in running text ("2 boxes of nails")
  const errands = Object.entries(W.ERRANDS || {}).find(([, list]) => list && list.length);
  if (errands) {
    const [eid, list] = errands;
    const e = list[0];
    const IT = W.ITEMS[e.item];
    [1, 2].forEach((n) => {
      S.save.crew.errand[eid] = { id: e.id, item: e.item, count: n, have: n, day: S.save.day, due: S.save.day + 3 };
      S.save.inventory[e.item] = n;
      const act = I.crewAction(eid);
      const want = "give " + Z.crewName(eid) + " " + n + " " + (n === 1 ? IT.one : IT.many);
      ok(act && act.action === "handIn" && act.line === want, `ask: the errand's hand-in line is "${act && act.line}", not "${want}"`);
    });
    // open and not yet filled: the bubble names it under the words, in plain English, and the hint says so on its
    // last day (the crew never said a word about it before "time ran out")
    const ce = crewOf(g, eid);
    if (ok(ce, `ask: ${eid} is not in the yard`)) {
      hold(g, eid, o.x + 2, o.y);
      standAt(g, o.x + 2, o.y + 1.5, o.x + 2, o.y);
      const line = (count, have, left) => {
        S.save.crew.errand[eid] = { id: e.id, item: e.item, count, have, day: S.save.day, due: S.save.day + left };
        I.crewOpen(eid);
        const meta = I.talk ? I.talk.panel.meta : [];
        I.crewTalkEnd();
        const row = meta.find((m) => m[0] === "Errand");
        return row ? row[1] : null;
      };
      const many = "2 " + IT.many;
      ok(line(2, 0, 3) === many + ", 3 days left", `ask: an open errand's bubble line is "${line(2, 0, 3)}", not "${many}, 3 days left"`);
      ok(line(2, 1, 1) === many + ", 1 brought home, 1 day left", `ask: an open errand's last-day line is "${line(2, 1, 1)}"`);
      ok(line(2, 2, 1) === null, "ask: a filled errand is still named as open in the bubble");
      const hint = (left) => {
        S.save.crew.errand[eid] = { id: e.id, item: e.item, count: 2, have: 0, day: S.save.day, due: S.save.day + left };
        S.save.inventory[e.item] = 0;
        ce.hint = null;
        return I.crewHint({ kind: "crew", obj: ce });
      };
      ok(/\(.*errand: 1 day left\)$/.test(hint(1)) && !/errand/.test(hint(2)), `ask: the hint on an errand's last day is "${hint(1)}" (the day before: "${hint(2)}")`);
    }
    S.save.crew.errand[eid] = null;
  }
  // a hand-in: no toast over the bubble that opens again (the card said what it paid), and that bubble tells the
  // payoff the hand-in earned without the tip read a moment ago (no new talk is counted)
  S.save.crew.quests[first.id].state = "found";
  hold(g, who, o.x, o.y);
  standAt(g, o.x, o.y + 1.5, o.x, o.y);
  I.crewOpen(who);
  const tip = S.crewTip(who, I.crewTipCtx(who));
  const tipText = tip ? Z.crewFill(Z.crewText("tip", who, tip.tip), tip.vars).trim() : "";
  ok(I.talk && I.talk.action === "handIn" && tipText && I.talk.panel.text.includes(tipText.slice(0, 20)), `ask: setup, the bubble before the hand-in (${I.talk && I.talk.action}) has no tip`);
  const talks = S.save.crew.talks[who];
  const toasts = g.toasts.length;
  I.interact();
  ok(same(g.cards[g.cards.length - 1], [who, "handIn"]), `ask: E did not ask for the hand-in card (${JSON.stringify(g.cards)})`);
  const res = S.handIn(who, first.id);
  I.crewCardDone(who, "handIn", res);
  ok(g.toasts.length === toasts, `ask: the hand-in made a toast over the bubble (${g.toasts.slice(toasts).map((x) => x.text).join(" | ")})`);
  const after = Z.crewFill(Z.crewText("quest", first.id, "after")).trim();
  ok(I.talk && I.talk.id === who && I.talk.panel.text.includes(after.slice(0, 30)), `ask: after the hand-in the bubble did not open again with the payoff (${I.talk && I.talk.panel.text.slice(0, 80)})`);
  // no tip at all: not the one just read, nor the next in turn (a tip that applies now, of any class)
  const tipsNow = S.crewTips(who, I.crewTipCtx(who));
  const told = tipsNow.urgent.concat(tipsNow.regular, tipsNow.fallback).map((t) => Z.crewFill(Z.crewText("tip", who, t.tip), t.vars).trim().slice(0, 20)).concat([tipText.slice(0, 20)]);
  ok(I.talk && !told.some((x) => x && I.talk.panel.text.includes(x)), `ask: the bubble opened again after the hand-in tells a tip (${I.talk && I.talk.panel.text.slice(0, 120)})`);
  ok(S.save.crew.talks[who] === talks, `ask: the bubble opened again counted a new talk (${talks} -> ${S.save.crew.talks[who]})`);
  if (I.talk) I.crewTalkEnd();
});

simGroup("yard", "yard: the dog at home: near Pip, then trailing, sheltering, barking, petted", () => {
  const g = engineGame(111);
  const { I, S, W, ZSR: Z } = g;
  const dq = (W.QUESTS || []).find((q) => q.kind === "dog");
  if (!ok(dq && W.DOG, "dog: no dog quest")) return;
  const lead = dq.giver;
  const dogScale = Z.CREW_ART.scale.crewDog;
  /** Run `secs` in the calm: the dog's distances to its leader while they walk (after 3 s) and at rest after a walk. */
  function follow(named) {
    homeYard(g, (S) => {
      S.save.crew.dog.home = true;
      S.save.crew.dog.name = named ? W.DOG.ideas[0] : "";
    });
    const c = crewOf(g, lead);
    const d = I.dog;
    const walking = [];
    const rest = [];
    const all = [];
    let off = 0;
    let props = "";
    let walkT = 0;
    let still = 0;
    let walked = false;
    stepFor(g, 200, () => {
      const pass = I.crewPass();
      const dist = Math.hypot(d.x - c.x, d.y - c.y);
      all.push(dist);
      if (!pass(Math.floor(d.x), Math.floor(d.y))) off++;
      const o = d.prop.opts || {};
      if (!props && (d.prop.art !== "crewDog" || Math.abs(d.prop.scale - dogScale) > 1e-9 || d.prop.solid || !I.props.includes(d.prop) || (o.f !== 0 && o.f !== 1) || ("left" in o && o.left !== true) || !same(Object.keys(o).filter((k) => k !== "left").sort(), ["f", "pose"]))) props = JSON.stringify({ art: d.prop.art, scale: d.prop.scale, opts: o });
      if (c.state === "walk") {
        walkT += 0.05;
        still = 0;
        walked = true;
      } else {
        walkT = 0;
        still += 0.05;
      }
      if (walkT > 3) walking.push(dist);
      if (walked && still > 3) rest.push(dist);
    });
    return { walking, rest, all, off, props, walked };
  }
  const st = (a) => (a.length ? `${Math.min(...a).toFixed(2)} to ${Math.max(...a).toFixed(2)}` : "none");
  const u = follow(false);
  ok(u.walked && Math.max(...u.all) <= 0.8, `dog: unnamed, it strayed from ${lead} (${st(u.all)} tiles); it sits right by them`);
  ok(!u.off && !u.props, `dog: unnamed, ${u.off} frames on a blocked tile; prop ${u.props}`);
  const n = follow(true);
  const mean = n.walking.reduce((a, b) => a + b, 0) / Math.max(1, n.walking.length);
  ok(n.walking.length && Math.min(...n.walking) >= 1.0 && Math.max(...n.walking) <= 1.8 && Math.abs(mean - 1.5) <= 0.2, `dog: named, it does not trail about 1.5 tiles behind ${lead} as they walk (${st(n.walking)}, mean ${mean.toFixed(2)})`);
  ok(n.rest.length && Math.max(...n.rest) <= 1.7, `dog: named, at rest it is not by ${lead} (${st(n.rest)})`);
  ok(!n.off && !n.props, `dog: named, ${n.off} frames on a blocked tile; prop ${n.props}`);
  // a wave: its bark joins the wave's toast, and it shelters with them
  Object.assign(I.phase, { next: { size: "some", sides: ["s"] }, t: 0.01 });
  stepFor(g, 20);
  const wave = g.toasts.find((x) => x.phase === "wave");
  ok(wave && wave.text.includes(W.DOG.ideas[0] + " barks"), `dog: the wave's toast has no bark (${wave && wave.text})`);
  const d = I.dog;
  ok(d.home && shelterKeys(I).has(tileKey(d.home)) && Math.hypot(d.x - d.home.x, d.y - d.home.y) < 0.3, "dog: it did not shelter with the crew");
  // E pets it
  homeYard(g, (S) => {
    S.save.crew.dog.home = true;
    S.save.crew.dog.name = W.DOG.ideas[1];
  });
  const o = openGround(g);
  hold(g, lead, o.x - 1, o.y);
  I.dog.x = o.x + 0.6;
  I.dog.y = o.y;
  standAt(g, o.x + 0.6, o.y + 1.5, I.dog.x, I.dog.y);
  const f = I.facing();
  ok(f && f.kind === "dog" && I.yardHint(f) === "Press E to pet " + W.DOG.ideas[1], `dog: facing it gives ${f && f.kind} "${f && I.yardHint(f)}"`);
  const w0 = S.save.stats.wordsRead;
  I.interact();
  ok(I.talk && I.talk.id === "dog" && I.talk.panel.title === W.DOG.ideas[1] && I.talk.panel.text.trim(), "dog: E did not pet it (its bubble)");
  ok(I.talk && S.save.stats.wordsRead - w0 === Z.wordCount(I.talk.panel.text) && S.save.crew.read.includes("dog:pet"), "dog: the pat's words were not counted");
});

simGroup("yard", "yard: the dog quest handed in, then the dog named", () => {
  const g = engineGame(112);
  const { I, S, W, ZSR: Z } = g;
  const dq = (W.QUESTS || []).find((q) => q.kind === "dog");
  if (!ok(dq && W.DOG, "dog: no dog quest")) return;
  const lead = dq.giver;
  homeYard(g, (S) => {
    S.save.day = Math.max(S.save.day, (dq.when && dq.when.day) || 1);
    (W.QUESTS || []).filter((q) => q.giver === lead && q !== dq).forEach((q) => (S.save.crew.quests[q.id] = { state: "done", day: 2, doneDay: 2 }));
    S.save.crew.quests[dq.id] = { state: "found", day: S.save.day, doneDay: null };
    S.save.crew.dog.home = true;
    S.addTrust(lead, trustFor(W, (dq.when && dq.when.stars) || 0));
  });
  const o = openGround(g);
  const c = hold(g, lead, o.x, o.y);
  I.dog.x = o.x + 0.6;
  I.dog.y = o.y - 0.4;
  standAt(g, o.x, o.y + 1.5, c.x, c.y);
  const f = I.facing();
  ok(f && f.kind === "crew" && f.obj === c, `dog: with the dog beside ${lead}, looking at ${lead} gives ${f && f.kind}`);
  I.interact();
  ok(I.talk && I.talk.action === "handIn", `dog: the bubble's question is ${I.talk && I.talk.action}, not handIn`);
  I.interact();
  ok(same(g.cards, [[lead, "handIn"]]), `dog: the cards asked for: ${JSON.stringify(g.cards)}`);
  const res = S.handIn(lead, dq.id);
  const toasts = g.toasts.length;
  I.crewCardDone(lead, "handIn", res);
  ok(g.toasts.length === toasts, `dog: a toast over the bubble after the hand-in (${g.toasts.slice(toasts).map((x) => x.text).join(" | ")}); the card said what it paid`);
  ok(I.talk && I.talk.action === "name", `dog: after the hand-in the bubble did not reopen to name the dog (${I.talk && I.talk.action})`);
  I.update(0.05);
  I.interact();
  ok(same(g.cards[g.cards.length - 1], [lead, "name"]), `dog: E did not ask for the name card (${JSON.stringify(g.cards)})`);
  const name = S.nameDog(W.DOG.ideas[2] || W.DOG.ideas[0]);
  I.crewCardDone(lead, "name", { name });
  const last = g.toasts[g.toasts.length - 1];
  ok(name && last && last.text.includes(name), `dog: no toast names the dog (${last && last.text})`);
  ok(!I.talk, "dog: the bubble stayed open after naming");
  ok(JSON.parse(g.store.get("zs.save.1")).crew.dog.name === name, "dog: the name is not in the save");
  ok(I.crewAction(lead) === null || I.crewAction(lead).action !== "name", "dog: the dog is asked for a name again");
});

/* ---------- The buildings ---------- */
/** Tiles the player can walk to from a tile, opening shut doors on the way (never the cache or stash door):
    Map "x,y" -> the tile it was reached from (null at the start). */
function playerWays(I, from) {
  const ok2 = (x, y) => x >= 0 && y >= 0 && x < I.gw && y < I.gh && (I.grid[y][x] === "O" || !I.solidForPlayer(x + 0.5, y + 0.5));
  const prev = new Map([[from.join(","), null]]);
  const q = [from];
  for (let i = 0; i < q.length; i++) {
    const [x, y] = q[i];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = x + dx + "," + (y + dy);
      if (prev.has(k) || !ok2(x + dx, y + dy)) continue;
      prev.set(k, [x, y]);
      q.push([x + dx, y + dy]);
    }
  }
  return prev;
}
/** The tiles from the player's tile to `to` ([x, y]), or null when there is no way. */
function playerPath(I, to) {
  const from = [Math.floor(I.player.x), Math.floor(I.player.y)];
  const prev = playerWays(I, from);
  if (!prev.has(to.join(","))) return null;
  const out = [];
  for (let c = to; c; c = prev.get(c.join(","))) out.push(c);
  return out.reverse();
}
/** Walk the player along tiles with the real controls: W held, facing the next tile's middle, each frame stepped;
    a shut door ahead is opened as E opens it (the building's Door hook, then toggleDoor). each() runs after every
    frame (false stops). True once at the last tile. */
function walk(g, tiles, each) {
  const { I } = g;
  const p = I.player;
  try {
    for (let i = 1; i < tiles.length; i++) {
      const [tx, ty] = tiles[i];
      const door = I.doors.find((d) => d.x === tx && d.y === ty && !d.open);
      if (door && !I.modeCall("Door", door)) I.toggleDoor(door);
      for (let n = 0; Math.hypot(tx + 0.5 - p.x, ty + 0.5 - p.y) > 0.12; n++) {
        if (n > 120) return false; // stuck on something
        p.a = Math.atan2(ty + 0.5 - p.y, tx + 0.5 - p.x);
        I.keys.w = true;
        I.update(0.05);
        if (each && each() === false) return false;
      }
    }
    return true;
  } finally {
    I.keys.w = false;
  }
}
/** Into a building on a trip (S.trip open): its walkers gone, so nothing gets in the way of the checks. */
function enterBuilding(g, loc) {
  const { I } = g;
  I.enter(loc);
  I.stop();
  I.walkers.length = 0;
  I.player.maxHp = I.player.hp = 1e9;
  I.toastPickup = false;
  return I;
}
const placeOf = (W, id) => W.LOCATIONS.find((l) => l.id === id);
const accept = (S, q) => {
  if (!S.isKnown(q.at)) S.save.known.push(q.at);
  S.save.crew.quests[q.id] = { state: "active", day: S.save.day, doneDay: null };
  S.commit();
};

simGroup("building", "buildings: a story object (or the dog) waits only once its quest is accepted", () => {
  const g = engineGame(201);
  const { I, S, W, ZSR: Z } = g;
  const QS = W.QUESTS || [];
  const qScale = Z.CREW_ART.scale.qObj;
  QS.forEach((q) => {
    S.newGame(1, "Sim");
    const loc = placeOf(W, q.at);
    if (!S.isKnown(q.at)) S.save.known.push(q.at);
    S.startTrip();
    enterBuilding(g, loc);
    const none = !I.questPickups.length && !I.tripDog && !I.props.some((pr) => pr.art === "qObj");
    ok(none, `buildings: in ${loc.id} before ${q.id} is accepted, a story object or the dog waits`);
    S.trip = null;
    accept(S, q);
    S.startTrip();
    enterBuilding(g, loc);
    const x = q.spot[0] + 0.5;
    const y = q.spot[1] + 0.5;
    const giver = Z.crewName(q.giver);
    if (q.kind === "dog") {
      const d = I.tripDog;
      ok(d && !d.follow && d.x === x && d.y === y && d.prop && !d.prop.solid && I.props.includes(d.prop), `buildings: ${q.id}: the dog does not sit on its spot ${q.spot} (${d && d.x},${d && d.y})`);
      ok(!I.questPickups.length, `buildings: ${q.id}: a story object waits with the dog`);
    } else {
      const pk = I.questPickups.find((o) => o.id === q.id);
      const pr = pk && pk.prop;
      ok(I.questPickups.length === 1 && pr && pr.x === x && pr.y === y && I.props.includes(pr), `buildings: ${q.id}: its object is not on the spot ${q.spot} in ${loc.id}`);
      ok(pr && pr.art === "qObj" && pr.opts && pr.opts.kind === q.object.art && Math.abs(pr.scale - qScale) < 1e-9 && !pr.solid && !pr.hidden && !I.solidAt(x, y), `buildings: ${q.id}: its prop is ${pr && JSON.stringify({ art: pr.art, opts: pr.opts, scale: pr.scale, solid: pr.solid })}`);
      ok(!I.tripDog, `buildings: ${q.id}: the dog waits with a story object`);
    }
    ok(I.hud.goal.textContent.includes("Find") && I.hud.goal.textContent.includes(giver), `buildings: ${q.id}: the goal line does not say what to find for ${giver} ("${I.hud.goal.textContent}")`);
    S.trip = null;
  });
});

simGroup("building", "buildings: walking onto every story object, a death, a second trip, home", () => {
  const g = engineGame(202);
  const { I, S, W, ZSR: Z } = g;
  const nothing = (Z.textAt((t) => (t.recap && t.recap.haul ? t.recap : null)) || {}).nothing;
  (W.QUESTS || []).filter((q) => q.kind !== "dog").forEach((q) => {
    S.newGame(1, "Sim");
    accept(S, q);
    const loc = placeOf(W, q.at);
    S.startTrip();
    enterBuilding(g, loc);
    // nothing else to pick up or read on the way: only the object's tag counts toward words read
    I.items.forEach((it) => (it.taken = true));
    I.piles.forEach((pl) => (pl.taken = true));
    [I.keyPickup, I.rodPickup, I.gunPickup].forEach((x) => x && (x.taken = true));
    S.trip.signs = (S.trip.signs || []).concat(I.signs.map((sg) => sg.id));
    const pk = I.questPickups.find((o) => o.id === q.id);
    const path = playerPath(I, q.spot);
    if (!ok(pk && path, `buildings: ${q.id}: no way to its spot ${q.spot} in ${loc.id}`)) return;
    const w0 = S.trip.wordsRead;
    let at = null;
    const there = walk(g, path, () => {
      if (S.trip.quest.includes(q.id)) {
        at = Math.hypot(I.player.x - pk.x, I.player.y - pk.y);
        return false;
      }
    });
    ok(at != null && at < 0.6, `buildings: ${q.id}: walking onto it did not pick it up (${there ? "at the spot" : "the walk stopped"}; trip.quest ${S.trip.quest})`);
    if (at == null) return;
    I.update(0.05);
    const tag = I.tagPanel;
    ok(pk.prop.hidden && pk.taken, `buildings: ${q.id}: its prop still shows after the pick-up`);
    // (a wall sign in reading reach takes the read panel first, as for any item's tag)
    ok(tag && tag.title === q.object.name && tag.status.includes(Z.crewName(q.giver)) && (I.panelKey === tag.key || I.nearReadable()), `buildings: ${q.id}: the tag panel does not show ${q.object.name} for ${Z.crewName(q.giver)} (${tag && tag.title}, ${tag && tag.status})`);
    ok(tag && S.trip.wordsRead - w0 === Z.wordCount(tag.text) && S.save.crew.read.includes("quest:" + q.id + ":tag"), `buildings: ${q.id}: its tag's words counted ${S.trip.wordsRead - w0}, not ${tag && Z.wordCount(tag.text)}`);
    stepFor(g, 1);
    ok(S.trip.wordsRead - w0 === Z.wordCount(tag ? tag.text : ""), `buildings: ${q.id}: its tag's words counted again`);
    // back in on the same trip: nothing waits (you have it)
    I.buildingLeave();
    enterBuilding(g, loc);
    ok(!I.questPickups.length && !I.props.some((pr) => pr.art === "qObj" && !pr.hidden), `buildings: ${q.id}: back in on the same trip, it waits again`);
    // a death throws the trip away: on the next trip it waits again
    S.abandonTrip();
    ok(S.questState(q.id) === "active" && !S.questHeld(q.id), `buildings: ${q.id}: after a death it is not still waiting`);
    S.startTrip();
    enterBuilding(g, loc);
    const again = I.questPickups.find((o) => o.id === q.id);
    ok(again && !again.prop.hidden, `buildings: ${q.id}: after a death the next trip does not find it`);
    I.items.forEach((it) => (it.taken = true));
    I.piles.forEach((pl) => (pl.taken = true));
    if (again) {
      standAt(g, again.x, again.y, again.x, again.y - 1);
      I.updatePickups();
    }
    I.buildingLeave();
    // home: found, counted in the day's recap, and a day that brought only it is not "nothing" (June's ledger line
    // waits for the hand-in: the next day page)
    S.returnHome();
    const entry = S.save.log[S.save.log.length - 1];
    ok(S.questState(q.id) === "found" && entry && entry.recap.quests === 1 && !entry.quests, `buildings: ${q.id}: home, it is ${S.questState(q.id)} and the day log has ${JSON.stringify(entry && { recap: entry.recap.quests, quests: entry.quests })}`);
    const recap = Z.recapText(entry.recap);
    ok(recap && (!nothing || !recap.includes(nothing)), `buildings: ${q.id}: the day it came home reads "${nothing}"`);
  });
});

simGroup("building", "buildings: the dog follows you through the doors and home", () => {
  const g = engineGame(203);
  const { I, S, W, ZSR: Z } = g;
  const q = (W.QUESTS || []).find((x) => x.kind === "dog");
  if (!ok(q, "dog: no dog quest")) return;
  S.newGame(1, "Sim");
  accept(S, q);
  const loc = placeOf(W, q.at);
  S.startTrip();
  enterBuilding(g, loc);
  const d = I.tripDog;
  if (!ok(d && !d.follow, `dog: it does not wait in ${loc.id}`)) return;
  // walk up to it, look at it, hold out the treats
  const ways = playerWays(I, [Math.floor(I.player.x), Math.floor(I.player.y)]);
  const near = [...ways.keys()].map((k) => k.split(",").map(Number)).filter(([x, y]) => {
    const r = Math.hypot(x + 0.5 - d.x, y + 0.5 - d.y);
    return r >= 1 && r <= 1.8 && I.lineClear(x + 0.5, y + 0.5, d.x, d.y) && !I.solidForPlayer(x + 0.5, y + 0.5);
  });
  const path = near.length && playerPath(I, near[0]);
  if (!ok(path && walk(g, path), `dog: no way to walk up to the dog in ${loc.id}`)) return;
  standAt(g, I.player.x, I.player.y, d.x, d.y);
  const f = I.facing();
  ok(f && f.kind === "dog" && I.buildingHint(f) === "Press E to hold out " + Z.crewName(q.giver) + "'s treats", `dog: facing it gives ${f && f.kind} "${f && I.buildingHint(f)}"`);
  I.interact();
  ok(S.trip.dog === true && d.follow, "dog: E with the treats did not make it follow you");
  I.toastPickup = false;
  // to the far end of the building (doors on the way) and back: never in a wall, never far, sits by you when you stop
  const ways2 = playerWays(I, [Math.floor(I.player.x), Math.floor(I.player.y)]);
  const steps = (k) => {
    let n = 0;
    for (let c = k.split(",").map(Number); ways2.get(c.join(",")); c = ways2.get(c.join(","))) n++;
    return n;
  };
  const farKey = [...ways2.keys()].reduce((a, k) => (steps(k) > steps(a) ? k : a));
  const start = [Math.floor(I.player.x), Math.floor(I.player.y)];
  const bad = { wall: 0, far: 0 };
  const watch = () => {
    if (I.solidForPlayer(d.x, d.y)) bad.wall++;
    if (Math.hypot(d.x - I.player.x, d.y - I.player.y) > 6.3) bad.far++;
  };
  const out = playerPath(I, farKey.split(",").map(Number));
  const doorsOnWay = out ? out.filter(([x, y]) => I.grid[y][x] === "O").length : 0;
  ok(out && walk(g, out, watch), `dog: could not walk to the far end of ${loc.id}`);
  stepFor(g, 3, watch);
  const sitFar = Math.hypot(d.x - I.player.x, d.y - I.player.y);
  ok(d.pose === "sit" && sitFar <= 1.65, `dog: after 3 s still at the far end it is ${d.pose}, ${sitFar.toFixed(2)} tiles away`);
  const back = playerPath(I, start);
  ok(back && walk(g, back, watch), `dog: could not walk back from the far end of ${loc.id}`);
  stepFor(g, 3, watch);
  const sitBack = Math.hypot(d.x - I.player.x, d.y - I.player.y);
  ok(d.pose === "sit" && sitBack <= 1.65, `dog: after 3 s still back at the start it is ${d.pose}, ${sitBack.toFixed(2)} tiles away`);
  ok(doorsOnWay > 0, `dog: the walk in ${loc.id} went through no door (nothing to check the doors with)`);
  ok(!bad.wall && !bad.far, `dog: on the walk it was in a wall ${bad.wall} frames and over 6.3 tiles away ${bad.far} frames`);
  // a door shut with the dog in its doorway: the dog comes through to your side first
  const door = I.doors.find((x) => out && out.some(([tx, ty]) => tx === x.x && ty === x.y));
  if (door) {
    if (!door.open) I.toggleDoor(door);
    const ways3 = playerWays(I, [door.x, door.y]);
    // the tile beside the door on your side (the nearer one)
    const side = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      .map(([dx, dy]) => [door.x + dx, door.y + dy])
      .filter(([x, y]) => ways3.has(x + "," + y) && !I.solidForPlayer(x + 0.5, y + 0.5))
      .sort((a, b) => Math.hypot(a[0] + 0.5 - I.player.x, a[1] + 0.5 - I.player.y) - Math.hypot(b[0] + 0.5 - I.player.x, b[1] + 0.5 - I.player.y))[0];
    const path3 = side && playerPath(I, side);
    if (ok(path3 && walk(g, path3), "dog: could not stand beside the door")) {
      d.x = door.x + 0.5;
      d.y = door.y + 0.5;
      d.prop.x = d.x;
      d.prop.y = d.y;
      standAt(g, I.player.x, I.player.y, door.x + 0.5, door.y + 0.5);
      ok(I.dogInDoorway(door), "dog: setup, it is not in the doorway");
      const f2 = I.facing();
      ok(f2 && f2.kind === "idoor" && f2.obj === door, `dog: facing the door gives ${f2 && f2.kind}`);
      I.interact();
      const toYou = (d.x - door.x - 0.5) * (I.player.x - door.x - 0.5) + (d.y - door.y - 0.5) * (I.player.y - door.y - 0.5) > 0;
      ok(!door.open && !I.dogInDoorway(door) && toYou && !I.solidForPlayer(d.x, d.y), `dog: E at the door with the dog in it: door ${door.open ? "open" : "shut"}, dog at ${d.x.toFixed(2)},${d.y.toFixed(2)} (${toYou ? "your side" : "the far side"})`);
      // left behind the shut door (it got there first), you walk on: it catches up rather than stay shut in
      const far = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [door.x + dx, door.y + dy]).find(([x, y]) => !I.solidForPlayer(x + 0.5, y + 0.5) && Math.hypot(x + 0.5 - I.player.x, y + 0.5 - I.player.y) > 1.5);
      const mine = I.reachable(Math.floor(I.player.x), Math.floor(I.player.y), false); // this side of the shut door
      const away = [...mine.entries()].filter(([, n]) => n >= 5 && n <= 8).map(([k]) => k.split(",").map(Number))[0];
      const path4 = away && playerPath(I, away);
      if (ok(far && path4 && !path4.some(([x, y]) => x === door.x && y === door.y), "dog: setup, nowhere to leave the dog behind the door")) {
        d.x = far[0] + 0.5;
        d.y = far[1] + 0.5;
        d.trail.length = 0;
        let worst = 0;
        const track = () => {
          worst = Math.max(worst, Math.hypot(d.x - I.player.x, d.y - I.player.y));
          if (I.solidForPlayer(d.x, d.y)) bad.wall++;
        };
        walk(g, path4, track);
        stepFor(g, 4, track);
        const end = Math.hypot(d.x - I.player.x, d.y - I.player.y);
        ok(worst <= 6.3 && end <= 1.65 && d.pose === "sit" && !door.open, `dog: shut behind a door it did not catch up (as far as ${worst.toFixed(2)} tiles, ${end.toFixed(2)} at the end, ${d.pose}; door ${door.open ? "open" : "shut"})`);
      }
    }
  }
  I.buildingLeave();
  S.returnHome();
  const last = S.save.log[S.save.log.length - 1];
  ok(S.dogHome() && S.questState(q.id) === "found" && last.recap.quests === 1 && !last.quests, `dog: home, it is not home, its quest not found or not in the day's recap (${JSON.stringify(last.recap)})`);
});

simGroup("building", "buildings: a gun never lies on a story quest's spot, and keeps its tile", () => {
  const g = engineGame(204);
  const { I, S, W, ZSR: Z } = g;
  const gun = Z.Weapons.ORDER.find((id) => Z.Weapons.WEAPONS[id].danger);
  const QS = W.QUESTS || [];
  const places = [...new Set(QS.map((q) => q.at))];
  const tile = () => (I.gunPickup ? Math.floor(I.gunPickup.x) + "," + Math.floor(I.gunPickup.y) : null);
  const bad = [];
  places.forEach((at) => {
    const loc = placeOf(W, at);
    const spots = new Set(QS.filter((q) => q.at === at).map((q) => q.spot.join(",")));
    S.newGame(1, "Sim");
    S.save.weapons.where = { [gun]: at };
    S.save.weapons.seed = 1;
    if (!S.isKnown(at)) S.save.known.push(at);
    // the same tile with no quest open, and with every quest here accepted
    S.startTrip();
    enterBuilding(g, loc);
    const none = tile();
    S.trip = null;
    QS.filter((q) => q.at === at).forEach((q) => accept(S, q));
    S.startTrip();
    enterBuilding(g, loc);
    const all = tile();
    if (!none || none !== all) bad.push(`${at}: the gun lies at ${none} with no quest open and ${all} with them all accepted`);
    // over a few seeds: where it lies is where it lay before the quests came, unless that is a quest's spot
    const Q = W.QUESTS;
    for (let seed = 1; seed <= 6; seed++) {
      S.save.weapons.seed = seed;
      W.QUESTS = [];
      I.placeGun(loc, I.startPos);
      const raw = tile();
      W.QUESTS = Q;
      I.placeGun(loc, I.startPos);
      const now = tile();
      if (spots.has(now)) bad.push(`${at} seed ${seed}: the gun lies on a quest's spot ${now}`);
      else if (!spots.has(raw) && now !== raw) bad.push(`${at} seed ${seed}: the quests moved the gun from ${raw} to ${now}`);
    }
    // a quest spot right where the gun would lie: it takes the next tile instead
    S.save.weapons.seed = 1;
    W.QUESTS = [];
    I.placeGun(loc, I.startPos);
    const raw = tile();
    W.QUESTS = Q.concat([{ id: "zz-test", giver: QS[0].giver, at, spot: raw.split(",").map(Number) }]);
    I.placeGun(loc, I.startPos);
    if (tile() === raw || !tile()) bad.push(`${at}: with a quest spot on the gun's tile ${raw}, it still lies there (or nowhere)`);
    W.QUESTS = Q;
    S.trip = null;
  });
  ok(!bad.length, `guns: ${bad.slice(0, 6).join("; ")}`);
});

/* ---------- A whole play-through ---------- */
simGroup("loop", "play-through: every story quest, the errands, the perks and the save, day by day", () => {
  const g = engineGame(301);
  const { I, S, W, ZSR: Z } = g;
  const QS = W.QUESTS || [];
  if (!QS.length) return;
  S.newGame(1, "Loop");
  const ids = S.crewIds();
  const toFind = W.LOCATIONS.filter((l) => l.type !== "base").map((l) => l.id);
  const PERKS = Object.keys(S.crewFx());
  const counts = { offers: 0, errands: 0, quests: 0, perks: 0, days: 0, saves: 0 };
  const bad = [];
  const fail = (m) => bad.length < 8 && bad.push(`day ${S.save.day}: ${m}`);
  /** What a perk changes, read off the game (not crewFx): effects(), the van, your health, the crew's numbers. */
  const perkNow = () => {
    const fx = S.effects();
    return { foodPerDay: fx.foodPerDay, medsPerDay: fx.medsPerDay, footHp: S.footMaxHp(), vanHp: S.vanMaxHp(), lookoutEarly: S.crewLookoutSeconds(), healAmount: S.crewHealAmount(), crowbarCost: S.canCraftTool("crowbar").scrap, crewRepairFree: S.crewRepairCost("fence") === 0, scrapPerDay: S.crewFx().scrapPerDay };
  };
  const maxDays = Math.max(40, ...QS.map((q) => ((q.when && q.when.day) || 1) + 15));
  let oldChecked = false;
  let handed = []; // story quests handed in at home today: June's ledger lines on the next day page
  for (let n = 0; n < maxDays; n++) {
    // home: talk to each of the crew; answer what they ask (the card, as js/main.js shows it)
    S.trip = null;
    I.enterYard({ firstCalm: 999 });
    I.stop();
    ids.forEach((id) => {
      const c = crewOf(g, id);
      if (!c) return;
      standAt(g, c.x, c.y + 0.5, c.x, c.y);
      I.crewOpen(id);
      for (let k = 0; I.talk && I.talk.action && k < 6; k++) {
        const a = I.talk.action;
        if (a === "offer") {
          const o = S.offer(id);
          counts.offers++;
          if (o.kind === "errand") {
            counts.errands++;
            if (!S.crewErrandsOpen(id)) fail(`${id} asked for an errand (${o.def.id}) before the first story quest was handed in`);
            if (!S.crewItemStocked(o.def.item)) fail(`${id} asked for ${o.def.item}, which no known shelf stocks`);
          }
          const yes = S.accept(id, o);
          if (!yes) fail(`${id}'s offer ${o.def.id} could not be accepted`);
          I.crewCardDone(id, "offer", { accepted: yes, kind: o.kind, id: o.def.id, title: "" });
        } else if (a === "handIn") {
          const r = S.request(id);
          const was = perkNow();
          const res = S.handIn(id, r.def.id);
          if (!res) fail(`${id}: ${r.def.id} could not be handed in`);
          I.crewCardDone(id, "handIn", res);
          if (res && res.kind === "quest") {
            counts.quests++;
            handed.push(res.def.id);
            const perk = (res.def.reward && res.def.reward.perk) || {};
            const now = perkNow();
            Object.entries(perk).forEach(([k, v]) => {
              counts.perks++;
              const okP = k === "crowbarCost" ? now[k] === Math.min(v, was[k]) : typeof v === "boolean" ? now[k] === v : Math.abs(now[k] - was[k] - v) < 1e-9;
              if (!PERKS.includes(k) || !okP) fail(`${res.def.id}'s perk ${k} ${v} did not apply (${was[k]} -> ${now[k]})`);
            });
          }
        } else if (a === "name") {
          I.crewCardDone(id, "name", { name: S.nameDog(W.DOG.ideas[0]) });
        }
      }
      if (I.talk) I.crewTalkEnd();
    });
    if (QS.every((q) => S.questState(q.id) === "done") && (!S.dogHome() || S.dogName())) break;
    // a trip: every open story object (or the dog) picked up where it waits, each errand's items off the shelves,
    // and one more place found (as a note would show it)
    S.startTrip();
    const picked = [];
    QS.filter((q) => S.questState(q.id) === "active").forEach((q) => {
      const loc = placeOf(W, q.at);
      enterBuilding(g, loc);
      if (q.kind === "dog") I.dogTreat(I.tripDog);
      else {
        standAt(g, q.spot[0] + 0.5, q.spot[1] + 0.5, 0, 0);
        I.updatePickups();
      }
      if (S.questHeld(q.id)) picked.push(q.id);
      else fail(`${q.id} could not be picked up in ${loc.id}`);
      I.buildingLeave();
    });
    // each open errand's items off the known places' shelves, as a player would get them: every shelf spot of the
    // item that is back (never more than the errand still needs). No items are made up: an errand asks only for
    // what those shelves can give in its days, so none ever runs late
    const lateBefore = ids.map((id) => S.crewReport(id).late || null);
    const need = {}; // per item, what the open errands still need (two crew members may ask for the same item)
    ids.forEach((id) => {
      const e = S.save.crew.errand[id];
      if (e && e.have < e.count) need[e.item] = (need[e.item] || 0) + e.count - e.have;
    });
    W.LOCATIONS.forEach((l) =>
      (l.items || []).forEach((k, i) => {
        if (!(need[k] > 0) || !S.isKnown(l.id) || !S.itemAvailable(l.id, "i" + i)) return;
        S.takeItem(l.id, "i" + i, false);
        S.trip.cargo[k] = (S.trip.cargo[k] || 0) + 1;
        need[k]--;
      })
    );
    const next = toFind.find((id) => !S.isKnown(id));
    if (next) S.reveal([next]);
    S.returnHome();
    counts.days++;
    ids.forEach((id, i) => S.crewReport(id).late && S.crewReport(id).late !== lateBefore[i] && fail(`${id}'s errand for ${S.crewReport(id).late} ran late although its shelves were emptied on every trip`));
    const entry = S.save.log[S.save.log.length - 1];
    if ((entry.recap.quests || 0) !== picked.length) fail(`the day's recap counts ${entry.recap.quests || 0} story objects, not the ${picked.length} brought home`);
    if (!same((entry.quests || []).slice().sort(), handed.slice().sort())) fail(`the day page's ledger lines ${JSON.stringify(entry.quests)} are not the ${JSON.stringify(handed)} handed in the day before`);
    handed = [];
    // the save, as written, loads back the same
    const json = JSON.stringify(S.save);
    S.loadSave(1);
    counts.saves++;
    if (JSON.stringify(S.save) !== json) fail("the save did not load back the same");
    // once, mid-game: the same save from before the crew came (no crew field) loads into another slot and plays on
    if (!oldChecked && S.save.day >= 6) {
      oldChecked = true;
      const old = JSON.parse(json);
      delete old.crew;
      g.store.set("zs.save.2", JSON.stringify(old));
      S.loadSave(2);
      const c = S.save.crew;
      if (!c || !same(Object.keys(c.trust), ids) || !ids.every((id) => S.trust(id) === 0) || Object.keys(c.quests).length || c.dog.home) fail(`an old save without crew loaded as ${JSON.stringify(c && { trust: c.trust, quests: c.quests })}`);
      tripHome(S);
      if (S.save.day !== old.day + 1) fail("an old save without crew could not play a day");
      S.loadSave(1);
    }
  }
  const done = QS.filter((q) => S.questState(q.id) === "done").length;
  ok(done === QS.length, `play-through: ${done} of ${QS.length} story quests done in ${counts.days} days (open: ${QS.filter((q) => S.questState(q.id) !== "done").map((q) => q.id + " " + S.questState(q.id))})`);
  ok(!S.dogHome() || S.dogName(), "play-through: the dog came home but was never named");
  ok(counts.errands > 0 && counts.perks > 0, `play-through: no errands (${counts.errands}) or perks (${counts.perks}) along the way`);
  const fx = S.crewFx();
  const want = {};
  QS.forEach((q) => Object.entries((q.reward && q.reward.perk) || {}).forEach(([k, v]) => (want[k] = k === "crowbarCost" ? Math.min(want[k] == null ? v : want[k], v) : typeof v === "boolean" ? want[k] || v : (want[k] || 0) + v)));
  ok(Object.entries(want).every(([k, v]) => (typeof v === "number" ? Math.abs(fx[k] - v) < 1e-9 : fx[k] === v)), `play-through: the perks at the end ${JSON.stringify(fx)} are not every quest's (${JSON.stringify(want)})`);
  ok(oldChecked, "play-through: the old save was never tried");
  ok(!bad.length, `play-through: ${bad.join("; ")}`);
  sim.loopDays = counts.days;
  sim.loopQuests = done;
  sim.loopErrands = counts.errands;
});

if (errors.length) {
  errors.forEach((e) => console.log("ERROR " + e));
  console.log(`\n${errors.length} crew problem(s).`);
  process.exit(1);
}
console.log(
  `OK: crew: ${checks} checks. State on a synthetic crew (trust and stars, talk once a day, topics and moods, tips, offers in order with their gates, ` +
    `one story quest and one errand open at once, errands after the first quest and only for stocked items, quests picked up, lost to a death, found at home and handed in with rewards and perks, errands, give up, raids, reports (free fixes never "0 scrap"), the dog and the ledger, words, old saves, an empty roster); ` +
    (real.skipped ? "the real crew facts are still empty (skipped); " : `the real facts: ${real.texts} texts at every level, ${real.topics} topics told in order, ${real.quests} story quests run through, each on its day, and a ledger that never wishes for a dog at home; `) +
    `the engine: the yard (${sim.yard} checks: props, posts at every room level, ten minutes of wandering, Tomas's repairs, the shelter, a raid, Pip's calls, facing, the bubble, the card, the dog), ` +
    `the buildings (${sim.building} checks: every story object waits once accepted and is walked onto, a death, home; the dog through the doors; guns off the quest spots) ` +
    `and a play-through (${sim.loop} checks: ${sim.loopQuests || 0} story quests and ${sim.loopErrands || 0} errands in ${sim.loopDays || 0} days, the save loaded back each day).`
);
