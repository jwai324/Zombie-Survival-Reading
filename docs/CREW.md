# The Crew at Home Base

June, Tomas and Pip live at the cabin with you. Until now they existed only in text (June's
journal, the cabin's wall notes, the plot signs). This drop puts them in the yard and the cabin:
they wander, talk, help, shelter from waves, give story quests and errands, earn your trust, and
one of Pip's quests brings home a dog. This file is the design and the contract between the files
that build it. Owner decisions are in `DESIGN.md` ("Owner decisions: the crew at home base").

Read `docs/STORY.md` (who the crew are), `docs/TEXT_GUIDE.md` (six reading levels) and
`docs/SCALING.md` (growth and old saves) first. Pronouns: June "she", Tomas "he", Pip "they/them"
at every level. The player is "you".

## How they look (art and words agree)

- **June**: in her sixties, grey hair in a bun, round glasses, a green cardigan over a work shirt,
  canvas gardening gloves, the green ledger under her arm.
- **Tomas**: seventeen, tall and lanky, dark curly hair, navy coveralls with grease smudges, a red
  rag in his back pocket, a wrench in hand.
- **Pip**: eleven, small, short hair, an orange hoodie, a walkie-talkie clipped on, a pencil behind
  one ear.
- **The dog**: a scruffy medium-size stray, sandy tan with a dark brown patch over one eye, one ear
  up and one that flops, a long tail. (Not Peanut from the Gas-N-Go flyer, who is brown with one
  white ear.)

## What the player sees

- **Wandering.** In the calm, each crew member walks between their own spots in the yard and the
  cabin (`CREW[id].posts`), stays a while doing something (standing, sitting, working, reading),
  and moves on. Some spots appear only once a room is built (June at the Garden). They are not
  solid: you and walkers pass through them, and shots pass them by (walkers ignore them).
- **Waves.** When a wave starts, the crew hurry into the shelter (`CREW_RULES.shelter`, the office
  closet) and shut its door. When the wave is cleared they come out. A raider (a walker that makes
  for the cabin) may go for the shelter: it forces the shut door like any inner door, and if it
  stands among the crew for `hurtSeconds`, one crew member is hurt off-screen. You hear a shout
  (toast). It costs 1 medical kit from storage, or 2 food if there is none, and that crew member's
  trust drops. Each crew member is hurt at most once per wave. Nobody dies; nothing is shown.
  The dog is never hurt.
- **Talking.** Look at a crew member close up and press E: a big comic speech bubble opens on the
  HUD (the read panel, styled as a bubble pointing at them). The yard keeps running. It holds, in
  order: what they did for you since you last talked (a report), one piece of useful live
  information (a tip), and one story topic (the next one they have not told you, or a repeatable
  mood line). E again closes it, or walking away. The first talk of each day earns trust.
- **Answering.** When the crew member has something to ask (a quest or errand on offer), something
  to take (a request you have filled), or the dog to name, the bubble ends with "Press E again
  ...". E then opens a short pausing card (portrait, words, buttons): "I'll do it" / "Not now";
  "Here you go"; or Pip's dog names. Locked during a wave.
- **Helping.** Jobs unlock with trust stars (`CREW[id].jobs`). Tomas walks to fence holes and
  cracked segments in the calm and fixes them, paying `SETTINGS.fenceRepairScrap` from base scrap
  each (never below 0); at 2 stars he also fixes the cabin's broken doors and windows
  (`houseRepairScrap`). He tells you about it the next time you talk. June patches you up when you
  talk to her while hurt (once per calm). Pip, as lookout, calls out the next wave's size and sides
  `lookoutSeconds` before it comes.
- **Story quests.** Five per crew member, hand-written, in order (`QUESTS`). Each asks you to bring
  home one object from one building. The request says where by the building, a compass direction
  from the cabin, a room or sign, and a landmark. The object appears in that building only once
  you accept, on a fixed spot beside that landmark. Walk over it to pick it up (its tag shows). It
  is a trip item: yours once home, lost if you die. At home June writes a line about it in her
  ledger (the day page), and you hand it over by talking to the giver: supplies, sometimes a
  lasting perk, trust, and a new story topic (`after`).
- **Errands.** Once a crew member's first story quest is handed in, and whenever they have no story
  quest to give right now (the next one is locked, or all five are done), they ask for N of an
  ordinary item (`ERRANDS`). A crew member can have one open story quest and one open errand at
  once, so an errand never holds back a story quest. Items of that kind you bring home
  after accepting count toward it; hand them over by talking (they are taken from storage). Errands
  have a deadline in days; a late one is dropped and costs a little trust.
- **Trust.** Points per crew member, shown as stars (0 to 5, `CREW_RULES.stars`). Gained by the
  first talk each day, errands and quests; lost when they are hurt in a raid, when an errand runs
  late, and when you give up a request (backpack). Stars gate story quests, jobs and topics.
- **The dog.** Pip's fifth quest. The dog barking past the trees (June's journal) is found in a
  building. You hold out Pip's treats (E) and it follows you, ignored by walkers, to the van and
  home. Pip then asks you to name it: one of Pip's three ideas, or type your own. After that it
  stays near Pip in the yard, shelters with the crew, barks when a wave comes, and eats 1 food
  every `dogFoodEvery` days.
- **Where to find it all.** The backpack has a Crew section: each crew member's stars, their open
  request (read the request again), and the finished quests. The city map marks a building where
  an accepted story object still waits, and its panel says whose request it is.

Reading stays load-bearing: the crew never give lock answers, never tie a key to a stash, and
never reveal a place on the map. A story quest is offered only once its building is known.

## Files and owners

| File | What it holds |
|------|---------------|
| `js/story-crew.js` | Facts: `CREW` (roster, posts, jobs), `CREW_RULES`, `CREW_TALK` (topics, moods), `CREW_TIPS`, `CREW_REPORTS`, `ERRANDS`, `CREW_UI` facts for the dog card |
| `js/story-quests.js` | Facts: `QUESTS` (15 story quests, spots, rewards, perks), `DOG` |
| `js/crewstate.js` | Save and trip state, rules, rewards, perks, text accessors (`ZSR.crewText`). Mixed into `ZSR.State`. Loads after `state.js` |
| `js/state.js` | Small hook calls only: fresh save, upgrade, trip start, return home, day log, effects |
| `js/crewart.js` | Art: the crew, the dog, portraits, quest objects. Loads after `sprites3d.js` |
| `js/crew.js` | Yard runtime, mixed into `ZSR.Interior`: wandering, shelter, jobs, raids, the talk bubble, lookout, the dog in the yard. Loads after `house.js` |
| `js/yard.js`, `js/house.js`, `js/interior.js` | Hook calls into `crew.js`; REACH; the raider goal |
| `js/building.js` | Quest objects and the dog inside buildings |
| `js/main.js`, `index.html` | The crew card (offer, hand-in, dog name), hooks, the backpack and day page wiring |
| `js/backpack.js` | Crew section; quest journal lines on the day page |
| `js/map.js` | Quest markers and panel line |
| `css/crew.css` | The speech bubble, the crew card |
| `js/content/levelN-crew.js` | Words at six levels: `T.crew` |
| `tests/validate-crew.js` | Crew engine tests (in `npm test`) |
| `tests/validate-world.js`, `validate-text.js`, `validate-art.js` | Crew facts, words and art checks |

## Facts (`ZSR.WORLD`)

Every crew text fact is a `facts: [...]` array of short true sentences, like every other story
file. Numbers, people (`PEOPLE` in `tests/validate-text.js`) and place names in the facts must
appear in the words at every level. Placeholders in braces are filled by the game (see below).
Ids are permanent once shipped (saves store them): append, never rename or remove.

### `CREW` (js/story-crew.js)

```js
W.CREW = {
  june: {
    name: "June", pronoun: "she", color: "#5b8a3c", // bubble and map accent
    scale: 0.9, // sprite height as a share of a walker's (Pip about 0.74)
    jobs: [{ job: "heal", stars: 1 }], // engine jobs: fence, cabin, heal, lookout
    posts: [
      // where they spend the calm; `at` is a yard tile [x, y] or `house` a cabin tile [hx, hy]
      // (yard = HOUSE.at + house); `room` and `level`: shown only once that room is built that far;
      // pose: stand | sit | work | read; weight: how often it is picked
      { id: "porch", house: [7, 1], pose: "sit", weight: 3 },
      { id: "garden", at: [13, 18], room: "garden", level: 1, pose: "work", weight: 4 },
    ],
  },
  tomas: { ... }, pip: { ... },
};
```

Posts must be open floor the player can reach, inside the fence, outside every plot rectangle
(builds fill plots), at least 1.5 tiles from every `HOUSE.spots` entry and the van, and not in the
shelter. `tests/validate-crew.js` checks every post at room levels 0 and 3. Give each crew member
5 to 8 posts across the yard and the cabin, true to the story (June: porch, garden, kitchen,
living room by her ledger; Tomas: by the van, the garage plot, Gus's room where he sleeps, the
ping pong room; Pip: the radio shelf in the living room, the radio plot, the dining room, Finn's
room).

### `CREW_RULES` (js/story-crew.js)

```js
W.CREW_RULES = {
  stars: [3, 8, 15, 24, 35], // trust points for 1..5 stars (SCALE: one entry per star)
  gain: { talk: 1, errand: 3, quest: 5 },
  loss: { hurt: 3, late: 2, giveUp: 3 },
  shelter: "officeCloset", // a HOUSE.rooms key; the crew stand on its tiles in a wave
  raidShelterShare: 0.5, // share of raiders that go for the shelter
  hurtSeconds: 6, // a raider among the crew this long hurts one of them
  hurtCost: { meds: 1, food: 2 }, // 1 medical kit from storage, else 2 food
  walkSpeed: 1.1, runSpeed: 2.6, // tiles a second (run: to the shelter)
  dwell: [20, 50], // seconds at a post
  workSeconds: 4, // to fix one fence segment or cabin door or window
  lookoutSeconds: 15, // Pip calls the next wave this long before it comes
  healAmount: 40, // June patches you up this much, once per calm
  requestsPerCrew: 1, // SCALE: open requests of each kind (story quest, errand) per crew member
  dogFoodEvery: 2, // the dog eats 1 food every this many days
  dogBarkRange: 10, // tiles: the dog barks when a walker is this close to the cabin in a wave
};
```

### `CREW_TALK` (js/story-crew.js)

```js
W.CREW_TALK = {
  june: {
    // one-time story topics, told in this order, each once its `when` holds
    topics: [
      { id: "june-t1", when: { day: 1 }, facts: [...] },
      { id: "june-t2", when: { day: 3, stars: 1 }, facts: [...] },
      { id: "june-t5", when: { stars: 2, note: "garden-dead1" }, facts: [...] }, // reacts to a note read
      { id: "june-t7", when: { quest: "june-2" }, facts: [...] }, // after a quest is done
    ],
    // repeatable mood lines, in turn, once every topic that can be told has been
    moods: [{ id: "june-m1", facts: [...] }, ...],
  },
  tomas: { ... }, pip: { ... },
};
```

`when` keys (all optional, all must hold): `day` (at least), `stars` (at least), `quest` (that
quest done), `note` (that note read, `State.noteRead`), `room` + `level` (built that far), `dog`
(true: the dog is home). 8 to 10 topics and 4 to 6 moods per crew member. Topics are character:
their past, their worries and hopes, the town's threads as they hear them, the Hollis family,
each other. Every topic must be true for any player who meets its `when` (the journal rule:
never assume a build or a find the `when` does not guarantee).

### `CREW_TIPS` (js/story-crew.js)

Live useful information. The engine decides which tip applies (in this order, first that applies),
fills the placeholders, and the words give it voice. Each crew member has the tip ids below; the
facts carry the placeholders exactly.

| Crew | Tip id | When | Placeholders |
|------|--------|------|--------------|
| June | `hungry` | food is 0 | |
| June | `food` | always (fallback) | `{food}` crates, `{days}` trips it lasts |
| June | `ready` | a room can be built now | `{room}` |
| June | `build` | the next build is short of items | `{room}`, `{needs}` ("2 Lumber and 1 Box of nails") |
| June | `heal` | you are hurt and she can heal (job) | `{hp}` she gives back |
| Tomas | `van` | the van is below full | `{hp}`, `{max}`, `{cost}` scrap to fix |
| Tomas | `vanFree` | the van is below full, Garage built | `{hp}`, `{max}` |
| Tomas | `fence` | holes or cracks | `{holes}`, `{cracks}` |
| Tomas | `cabin` | broken doors or windows | `{broken}` |
| Tomas | `crowbar` | no crowbars | |
| Tomas | `fine` | always (fallback) | |
| Pip | `wave` | lookout job and a wave is coming in the calm | `{size}` ("a small wave" / "a big wave" / "no wave"), `{sides}` |
| Pip | `keys` | holding stash keys | `{keys}` |
| Pip | `walkers` | always (fallback) | `{days}` days until the town gets more walkers |
| Pip | `radio` | Radio room built | |

### `CREW_REPORTS` (js/story-crew.js)

What a crew member says they did since you last talked. Keys: `fence` (`{fixed}` segments,
`{scrap}` scrap), `fenceFree` (`{fixed}`, a perk made it free), `cabin` (`{fixed}`, `{scrap}`),
`hurt` (`{who}` was hurt in a raid, `{cost}` what it took: "a medical kit" / "2 food"), `late`
(`{item}`, an errand ran out), `heal` (`{hp}`). Each is `{ facts: [...] }`.

### `ERRANDS` (js/story-crew.js)

```js
W.ERRANDS = {
  june: [
    // count: [min, max] rolled when offered; days: the deadline; reward: what it pays
    { id: "june-e1", item: "seeds", count: [2, 3], days: 4, reward: { scrap: 25 }, facts: [...], done: [...] },
  ],
  tomas: [...], pip: [...],
};
```

3 to 4 errands per crew member, items true to them (June: seeds, soil, waterFilter, meds; Tomas: parts, nails, lumber, wire, fuel, tools; Pip:
radioParts, wire, books, maps). Item ids from `ITEMS`, never "food". Facts carry `{count}`,
`{item}` (the item's name), `{days}` and `{reward}` ("30 scrap"). Rewards: scrap 15 to 40, or a
medical kit, or a crowbar.

### `QUESTS` and `DOG` (js/story-quests.js)

```js
W.QUESTS = [
  {
    id: "june-1", giver: "june", // order within a giver is the array order
    at: "pharmacy", // a LOCATIONS id with a layout (never base or river)
    spot: [8, 14], // the object's tile in that layout: plain reachable floor
    near: "the giant toothbrush", // a landmark of that layout within 3 tiles of the spot
    room: "PHARMACY", // optional: a room sign the words may name
    when: { day: 2, stars: 0 }, // plus: the previous quest of this giver done, and `at` known
    object: { name: "June's pill bag", art: "bag" }, // art: one of the quest object kinds below
    reward: { scrap: 30, items: { meds: 1 }, perk: { foodPerDay: 1 } },
    brief: [...], // the request: why, where (place, direction from the cabin, room, landmark), what it looks like, the reward
    tag: [...], // the object's tag, shown on pickup
    journal: [...], // June's ledger line on the day it comes home
    done: [...], // the thank-you when you hand it over (and what the perk does)
    after: [...], // a new story topic told afterwards (the payoff)
  },
  // the dog: Pip's fifth quest
  { id: "pip-5", giver: "pip", kind: "dog", at: "...", spot: [x, y], near: "...", when: {...}, reward: {...}, brief: [...], journal: [...], done: [...], after: [...] },
];
W.DOG = { ideas: ["...", "...", "..."], facts: { ask: [...], named: [...], pet: [...] } };
```

- Five quests per crew member, 15 in all. Order by stars and days: quest 1 at 0 stars and day 2,
  2 at 1 star and day 4, 3 at 2 stars and day 8, 4 at 3 stars and day 13, 5 at 4 stars and day 19
  (the dog, pip-5, day 28: the journal still wants a dog on day 28). Early quests should target places known at the start
  (Gas-N-Go, Corner Grocery, Reyes Hardware) or found early; later ones may go further.
- Each building holds at most two quest spots. A spot is plain floor (`.`) reachable from the
  entrance without passing the cache (`L`) or stash (`Q`) door, not a marker tile, note spot,
  sign tile, rod tile or landmark footprint, and within 3 tiles of `near`. `tests/validate-world.js`
  checks it.
- Quest object kinds (`object.art`, drawn by `js/crewart.js` as sprite `qObj` with `{ kind }`):
  `bag`, `photo`, `box`, `book`, `tin`, `leash`, `toolbox`, `radio`, `jar`, `letter`, `seeds`,
  `blanket`, `tape`, `badge`, `wrench`.
- Rewards: `scrap` (20 to 80), `items` (ids from `ITEMS`; favor what the base is short of:
  lumber, wire, nails, books, seeds, parts, soil), `kits` (medical kits straight to storage),
  `crowbars`, `traps` ({ spike, blast }), and `perk`. Not every quest has a perk; aim for two or
  three per crew member, the strongest on quest 5.
- **Perks** (lasting, active once that quest is done). Engine keys, nothing else:
  `foodPerDay` (+n food a day), `medsPerDay` (+n medical kits a day, fractions build up),
  `footHp` (+n health on foot), `vanHp` (+n van health), `scrapPerDay` (+n scrap each day home),
  `crewRepairFree` (true: crew repairs cost no scrap), `lookoutEarly` (+n seconds of warning),
  `healAmount` (+n to June's patch-up), `crowbarCost` (crowbars cost n scrap). The `done` facts
  say what the perk does in plain words with its number.
- The dog quest (`kind: "dog"`) has no `object` or `tag`. Its spot is where the dog sits. Its
  `brief` says Pip gives you treats to hold out. `DOG.ideas` are Pip's three name ideas (short,
  plain, not a person in `PEOPLE`, not "Biscuit" or "Peanut").

## Save state

New top-level `save.crew`, filled into old saves by `upgradeSave` (no version bump):

```js
crew: {
  trust: { june: 0, tomas: 0, pip: 0 },   // points (one key per CREW id)
  talkDay: { june: 0, ... },               // the last day a talk earned trust
  heard: [],                               // topic ids told
  mood: { june: 0, ... },                  // next mood line
  quests: { "june-1": { state: "active" | "found" | "done", day, doneDay } },
  errand: { june: null | { id, item, count, have, day, due } },
  errandNext: { june: 0, ... },            // which errand comes next
  report: { june: {}, ... },               // { fence, fenceFree, cabin, scrap, hurt: [..], late: item, heal }
  dog: { home: false, name: "" },
}
```

Trip additions: `trip.quest: []` (quest ids whose object was picked up this trip), `trip.dog:
false` (the dog is following you this trip). Death drops both (`abandonTrip` reloads).
`returnHome` merges them: each quest in `trip.quest` becomes `found` (and goes on the day log as
`entry.quests`); `trip.dog` sets the dog quest `found` and `crew.dog.home = true`. It also adds
cargo of an active errand's item to `have` (capped at `count`), drops errands past `due` (trust
loss, report `late`), feeds the dog (1 food every `dogFoodEvery` days), and adds `scrapPerDay`.
Crew state changes at the base are saved through `ZSR.Main.syncYard()` (never mid-wave).

## State API (`js/crewstate.js`, methods on `ZSR.State`)

| Method | Does |
|--------|------|
| `crewIds()` | `Object.keys(W.CREW)` |
| `crewFresh()` | the fresh `crew` object for `freshSave` |
| `crewUpgrade(s)` | fill a save's `crew` (per crew id); called by `upgradeSave` |
| `trust(id)`, `stars(id)` | points; stars 0..`stars.length` |
| `addTrust(id, n)` | never below 0 |
| `crewTalk(id)` | first talk today: +gain.talk, returns true |
| `crewWhen(when)` | does a `when` hold |
| `nextTopic(id)` | `{ id, mood }` the next topic to tell, or the next mood |
| `markTopic(id, topicId)` | record it told (topic heard, or mood index advanced) |
| `crewTip(id)` | `{ tip, vars }` the tip that applies now |
| `crewJobs(id)` | job keys unlocked by stars |
| `crewFx()` | perk totals from done quests: `{ foodPerDay, medsPerDay, footHp, vanHp, scrapPerDay, crewRepairFree, lookoutEarly, healAmount, crowbarCost }` |
| `request(id)` | the open request: `{ kind: "quest" | "errand", def, st }` or null |
| `offer(id)` | what they would ask now: `{ kind: "quest", def }` or `{ kind: "errand", def, count }` or null |
| `accept(id, offer)` | open the request |
| `giveUp(id)` | drop the open request (trust loss) |
| `handInReady(id)` | the request is filled (story object found, or errand `have` reached and items in storage) |
| `handIn(id)` | pay out, close, trust gain; returns `{ kind, def, reward }` |
| `questsAt(locId)` | active story quests whose object waits in that building (not held, not found) |
| `questHeld(qid)` | its object is held (this trip) or found/done |
| `takeQuestObject(qid)` | pick it up (trip) |
| `takeDog(qid)` | the dog follows you (trip) |
| `dogHome()`, `dogName()`, `nameDog(name)` | the dog at home; its name (letters, spaces, `'` and `-`, 1 to 14 characters) |
| `crewReport(id)`, `clearReport(id)` | what they did; cleared once told |
| `logWork(id, kind, n, scrap)` | add to the report |
| `crewHurt(id)` | pay the cost (kit, else food), trust loss, report; returns the cost word |

`State.effects()` adds `foodPerDay`, `medsPerDay`, `footHp` and `vanHp` from `crewFx()`. Crowbar
cost: `canCraftTool(type).scrap` and `craftTool` use `crowbarCost` when a perk sets one.

As built, beyond the table (js/crewstate.js):

- **Order of a talk.** When the bubble opens call `crewTalk(id)` once, then `crewReportItems(id)`
  (then `clearReport(id)`), `crewTip(id, ctx)`, `nextTopic(id)` (then `markTopic`), `offer(id)` /
  `request(id)` / `handInReady(id)`. Offers stay the same within a day.
- `crewWhen(when, id)`: `id` is whose stars count.
- `nextTopic(id)` tells a handed-in quest's payoff first: `{ id: qid, mood: false, quest: qid }`;
  `crewText("talk", qid)` is that quest's `after`.
- `crewTip(id, ctx)`: urgent tips win (June `heal` and `hungry`, Pip `wave`), the others that apply
  take turns one per talk, and the fallback shows only when nothing else applies. `ctx`: `heal` (hp
  June gives back now, only when she heals now), `wave: { size, sides }` (Pip's call in the calm),
  live `holes`, `cracks`, `broken`. `crewTips(id, ctx)` lists every tip that applies.
- Reports: `crewReportItems(id)` -> `[{ key, vars }]`, words through
  `ZSR.crewFill(ZSR.crewText("report", key), vars)`. Jobs: `paid = crewRepairPay("fence" | "cabin")`
  (0 with `crewRepairFree`; never below 0), then `logWork(id, "fence" | "cabin", 1, paid)` ("fence"
  becomes `fenceFree` when free), `logWork(id, "heal", hp)`. `crewHealAmount()`,
  `crewLookoutSeconds()` include the perks. `crewHurt(id)` returns the cost words ("a medical kit",
  "2 food", or less food when the pantry is short).
- Requests: `request(id)` (the one ready to hand in first), `requests(id)` (all open),
  `requestVars(offerOrRequest)` -> `{ reward }` for a quest, `{ count, item, days, reward }` for an
  errand (`days`: the deadline when offered; trips left once open). An errand is due on the day it
  was accepted plus its days: come home that day with it unfilled and it is dropped (trust loss,
  `late` report). A filled errand never goes late. A found story object cannot be given up.
  `crewQuests(id)` -> `[{ def, st }]` for the backpack. After the dog quest is handed in the name
  card is due while `dogHome() && !dogName()`.
- Save extras: `crew.talks` (talk count per crew member: tips take turns), `crew.read` (text keys
  whose words were counted, `seeCrewTalk(key, words)`; keys `talk:<id>`, `tip:<crew>:<tip>`,
  `quest:<qid>:<sub>`, `errand:<eid>:<sub>`, `dog:<key>`), `crew.dog.fed`, `report[id].scrapBy`,
  `trip.dogQuest`. Nothing in js/crewstate.js commits: the caller calls `ZSR.Main.syncYard()` (at
  the base) after the bubble closes, a card closes, or a give-up.
- `ZSR.crewFill`: `{dog}` is the dog's name or "the dog"; "1 holes" and the like become singular.
- The journal: once the dog is home, `logDay` skips the pages that wish for a dog (`dogWish: true` in
  `JOURNAL`) when the ledger repeats.

## Words (`T.crew` in `js/content/levelN-crew.js` and `levelN-quests.js`)

```js
// levelN-crew.js
T.crew = T.crew || {};
T.crew.talk = Object.assign(T.crew.talk || {}, { "june-t1": { title, text }, "june-m1": { title, text } }); // every topic and mood
T.crew.tips = Object.assign(T.crew.tips || {}, { june: { food: "...{food}...{days}..." }, tomas: {}, pip: {} });
T.crew.reports = Object.assign(T.crew.reports || {}, { fence, fenceFree, cabin, cabinFree, hurt, late, heal });
T.crew.dog = Object.assign(T.crew.dog || {}, { ask, named, pet });
// levelN-quests.js
T.crew.quests = Object.assign(T.crew.quests || {}, { "june-1": { title, brief, tag, journal, done, after } }); // dog quest: no tag
T.crew.errands = Object.assign(T.crew.errands || {}, { "june-e1": { title, brief, done } });
```

Each part file merges into `T.crew`, never replaces it. The rules for these words (lengths by kind,
the speaker rule, placeholders per kind, quest titles, briefs that name the place, the landmark, the
room sign in capitals, the direction and the reward, people and places a crew text may name, Pip's
pronoun, the How it works crew paragraph and the controls' E line) are in `docs/TEXT_GUIDE.md`
("The crew's words") and enforced by `node tests/validate-text.js` (`--crew=strict` lists what a
level still lacks; `--crew=present` checks only what is written).

As built in phase 2 (beyond the tables above): `handIn(id, reqId)` and `giveUp(id, reqId)` take a
request id; errands are offered only after a crew member's first story quest is handed in, only
for items a known place's shelves stock (`errandOffer`, `crewErrandsOpen`, `crewErrandTurn`,
`crewItemStocked`), and an errand filled in time never goes late; `cabinFree` joins the reports;
Pip's `walkers` tip applies only while a known building is below the walker cap; E with a long
bubble open first pages through it ("Press E to read on"); the crew card's DOM is
`#screen-crew` (styles in css/style.css), `ZSR.Main = { syncYard, confirm, onCrewCard }`.

## Engine contract (yard, cabin, UI)

- `Interior.crew`: runtime list `[{ id, x, y, post, state, path, t, pose, f, prop, facing }]`
  plus `Interior.dog` once home. Built by `crewEnter()` from `enterYard`, re-added to props by
  `crewDress()` from `dressYard`, moved by `crewUpdate(dt)` from `yardUpdate`. Props are not solid.
  Sprite: `D3().sprite("crew", { who, pose, f })` at scale `CREW[id].scale * CREW_ART.scale.crew`
  (0.95, the walkers' scale), lift 0, wide 0.75; f is exactly 0 or 1 (every opts set is a cached
  canvas). Dog: `D3().sprite("crewDog", { pose, f })` (pose stand | walk | sit | bark; add
  `left: true` only to face left) at `CREW_ART.scale.crewDog` (0.36). Quest objects:
  `qObj { kind }` at `CREW_ART.scale.qObj` (0.3). Portraits: `crewFace { who }`, 256 x 256.
  The art's work, sit and read poses draw their own small floor props.
- Facing: `crewFacing(cand)` from `yardFacing` pushes `{ kind: "crew", obj }` only when the
  crosshair is on them (angle within `atan2(0.45, dist)`), within `REACH.crew` (2.2) and in line
  of sight, so crew never steal E from the cabin's spots. `yardInteract` / `yardHint` route
  `kind: "crew"` (and `"dog"`) to `crewInteract(f)` / `crewHint(f)`.
- The bubble: `this.talk = { id, panel }` built once on open (`crewPanel(id)`), shown through the
  read panel with `kind: "talk"` (`updatePanel` takes it before signs). It closes past
  `READ_REACH + 0.4` from the speaker or on E. Words count once per text (`State.seeCrewTalk`).
- E while the bubble is open and an action is pending calls `this.hooks.onCrewCard(id, action)`
  with action `"offer" | "handIn" | "name"`. `main.js` pauses, shows `#screen-crew`, and on close
  calls `Interior.crewCardDone()` then `Interior.resume()`, and `syncYard()`.
- The shelter is the office closet (three tiles). Its two solid box stacks give way to the big
  battery against the end wall (not solid), so three crew and the dog fit.
- Waves: `crewWave(true)` at a wave's start (hurry to the shelter, shut its door once inside),
  `crewWave(false)` when cleared. `yardWalkerGoal` sends `raidShelterShare` of raiders to a shelter
  tile; `crewUpdate` times raiders among the crew and calls `State.crewHurt`.
- Jobs: `crewUpdate` walks Tomas to the nearest hole or crack (then broken cabin door or window at
  2 stars), works `workSeconds`, fixes it through the yard's repair path without the player's
  toast, pays from `save.scrap` (or free with `crewRepairFree`), `State.logWork`, then
  `hooks.onYardChanged()`. Lookout: the calm pre-rolls the next wave (`phase.next = { size,
  sides }`), and Pip's call (`CREW_TIPS.pip.wave` words) is a toast `lookoutSeconds` (+perk)
  before it.
- Building: `placeQuestObjects(loc)` adds a `qObj` prop on each spot from `State.questsAt`; walking
  over it calls `State.takeQuestObject` and shows its tag. The dog: E at it calls `State.takeDog`,
  then it follows you (walkers ignore it); leaving with it puts it in the van. `placeGun` treats
  every quest spot as busy.

## Fact rules the validators hold (tests/validate-world.js)

Beyond the shapes above: a quest's brief facts contain the place name, `near` word for word, its
`room`, the giver's name, "<n> scrap" and every reward count with its item's noun, and "<direction>
of the cabin" (the 8-way bearing from the base on the city map, north up; within 10 degrees of an
edge the neighbour is allowed). Spot distance is measured to the nearest landmark footprint tile
(Chebyshev), and a spot may not touch a footprint, even diagonally. Quest texts name only their own
place, places known at the start, or the same giver's earlier quest places; no crew fact names a
stash; no "left of" or "right of" in a brief. Quest i needs exactly i stars. The dog quest's day is
at least the last journal page that mentions a dog; its done facts give "every <dogFoodEvery> days"
when they mention food. A `done` fact states each whole-number perk value.

## Tests

`tests/validate-crew.js` (in `npm test`): posts open and reachable at room levels 0 and 3; crew
wander without entering solid tiles or crossing the fence; reach the shelter in a wave and come
out after; a raider among them costs a kit (else 2 food) and trust, once per member per wave; Tomas
fixes holes and pays scrap, not below 0, and reports it; talk trust once a day; topics in order and
`when`; every quest offered in order, its object hidden until accepted, picked up, found at home,
handed in with its reward and perk; errands count cargo and expire; the dog follows, comes home,
is named and eats; an old save without `crew` loads; every crew text resolves at every level.
