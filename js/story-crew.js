/* Story facts for the crew at home base (June, Tomas, Pip): who they are, where they spend the calm,
   the rules they live by, what they talk about, their live tips and reports, and their errands.
   The words at six reading levels live in js/content/levelN-crew.js. Design: docs/CREW.md.
   Loaded after js/story-home.js.
   Ids are permanent once shipped (saves store topic, mood and errand ids, and the mood and errand
   counters index these lists): append new entries, never rename, remove or reorder them.
   Every fact here must stay true for any player who meets its `when` (the journal rule), and every
   number, person and place in a fact must appear in that text at all six reading levels. */
(function (root) {
  "use strict";
  const W = root.ZSR.WORLD;

  /* ---------- Who they are, where they spend the calm, what jobs they take on ----------
     posts: `at` is a yard tile [x, y]; `house` a cabin tile [hx, hy] (yard = HOUSE.at + house).
     `room` + `level`: the post is used only once that room is built that far. Every post is open
     floor the player can reach, inside the fence, off every plot, at least 1.5 tiles from every
     HOUSE.spots entry and the van, not in the shelter, and off the line a player takes to read a
     plot sign or plaque (so a crew member never stands between you and a sign).
     Checked at room levels 0 to 3 and mixes: tests/validate-crew.js.
     SCALE: posts are hand-placed tiles; moving a plot, the van or a cabin room means re-checking them. */
  W.CREW = {
    june: {
      name: "June",
      pronoun: "she",
      color: "#5b8a3c", // her green cardigan and the green ledger
      scale: 0.9,
      jobs: [{ job: "heal", stars: 1 }],
      posts: [
        { id: "porch", house: [7, 1], pose: "sit", weight: 3 }, // on the porch, by the bench
        { id: "kitchen", house: [14, 7], pose: "stand", weight: 3 }, // at the stove (the work pose is a garden kneel)
        { id: "ledger", house: [17, 15], pose: "read", weight: 3 }, // in the living room, by the shelf with her ledger
        { id: "office", house: [3, 3], pose: "read", weight: 2 }, // the base plans at Kate's map desk
        { id: "lot", at: [13, 16], pose: "stand", weight: 2 }, // looking over the garden plot
        { id: "garden", at: [13, 18], room: "garden", level: 1, pose: "work", weight: 4 }, // tending her beds
        { id: "lab", at: [38, 12], room: "lab", level: 1, pose: "work", weight: 2 }, // her herb beds
      ],
    },
    tomas: {
      name: "Tomas",
      pronoun: "he",
      color: "#33507a", // navy coveralls
      scale: 1.0,
      jobs: [{ job: "fence", stars: 0 }, { job: "cabin", stars: 2 }],
      posts: [
        { id: "van", at: [21, 29], pose: "stand", weight: 4 }, // at the van's hood, off its parking gravel (the work pose kneels to nail a board)
        { id: "garage", at: [12, 31], pose: "work", weight: 3 }, // by the garage plot
        { id: "gusRoom", house: [22, 7], pose: "sit", weight: 3 }, // Gus's room, where he sleeps
        { id: "pingpong", house: [9, 10], pose: "stand", weight: 2 }, // at the ping pong table
        { id: "fence", at: [47, 40], pose: "stand", weight: 2 }, // checking the east fence
        { id: "power", at: [17, 12], room: "power", level: 1, pose: "work", weight: 2 }, // the lights and the generator
        { id: "water", at: [45, 12], room: "water", level: 1, pose: "work", weight: 1 }, // the filter he painted the sign for
      ],
    },
    pip: {
      name: "Pip",
      pronoun: "they", // they / them at every reading level
      color: "#e07a2a", // orange hoodie
      scale: 0.74,
      jobs: [{ job: "lookout", stars: 1 }],
      posts: [
        { id: "radioShelf", house: [13, 1], pose: "sit", weight: 4 }, // at the radio in the dining room, on the floor by the shelf
        { id: "radioLot", at: [12, 12], pose: "read", weight: 3 }, // the radio plot, with the list of voices
        { id: "radio", at: [12, 9], room: "radio", level: 1, pose: "work", weight: 3 }, // beside the radio tower
        { id: "dining", house: [15, 3], pose: "sit", weight: 2 }, // on the floor by the chore chart (the sit pose sits on the floor: the art draws no chair)
        { id: "finnRoom", house: [21, 17], pose: "read", weight: 2 }, // Finn's treehouse plan
        { id: "lucyRoom", house: [21, 22], pose: "stand", weight: 1 }, // the drawing of a dog with no name yet
        { id: "lookout", at: [27, 6], pose: "stand", weight: 2 }, // the back fence, watching the trees
        { id: "pingpong", house: [7, 12], pose: "stand", weight: 1 }, // the table that leans to the left
      ],
    },
  };

  /* ---------- The rules the crew lives by (docs/CREW.md) ---------- */
  W.CREW_RULES = {
    stars: [3, 8, 15, 24, 35], // trust points for 1..5 stars (SCALE: one entry per star)
    gain: { talk: 1, errand: 3, quest: 5 },
    loss: { hurt: 3, late: 2, giveUp: 3 },
    shelter: "officeCloset", // a HOUSE.rooms key; the crew stand on its tiles in a wave
    raidShelterShare: 0.5, // share of raiders that go for the shelter
    hurtSeconds: 6, // a raider among the crew this long hurts one of them
    hurtCost: { meds: 1, food: 2 }, // 1 medical kit from storage, else 2 food
    walkSpeed: 1.1, // tiles a second
    runSpeed: 2.6, // tiles a second, hurrying to the shelter
    dwell: [20, 50], // seconds at a post
    workSeconds: 4, // to fix one fence segment or cabin door or window
    lookoutSeconds: 15, // Pip calls the next wave this long before it comes
    healAmount: 40, // June patches you up this much, once per calm
    requestsPerCrew: 1, // SCALE: open requests of each kind (story quest, errand) per crew member; errands: 1 (one save slot)
    dogFoodEvery: 2, // the dog eats 1 food every this many days
    dogBarkRange: 10, // tiles: the dog barks when a walker is this close to the cabin in a wave
  };

  /* ---------- What they talk about ----------
     topics: one-time story topics, told in this order, each once its `when` holds (a topic whose
     `when` does not hold yet is skipped, not waited on). moods: repeatable lines, in turn, once every
     topic that can be told has been; a mood can come on day 1 and repeats forever, so it assumes
     nothing (no build, no find, no dog, no person the crew has not heard of on day 1).
     Every topic carries one true, useful thing about how the game works, checked against the code:
     the numbers are SETTINGS, DEFENSE, BASE_ROOMS, TRAPS, Upgrades and CREW_RULES values.
     Town news follows June's journal (JOURNAL): a person or a place out in town comes up no earlier than
     the ledger day that names it (Rosa 7, Ruby 8, Mr. Ortiz 9, Jo 11, the convoy 14 or the kitchen note,
     the hardest night 16, the town's rule 21). The crew's own past can come up any day.
     Note gates use notes placed at reading level 1, so every reader can unlock them.
     Topics told after a story quest is done must not contradict it, and the other way round (june-t8 and
     june-3 both touch Rosa's beans: june-t8 says nothing June could only learn from the jar).
     Keep a topic's facts under about 48 words: the level 1 words carry all of them in the `lot` range. */
  W.CREW_TALK = {
    june: {
      topics: [
        { id: "june-t1", when: { day: 1 }, facts: [
          "June was a school gardener for years before the Fall.",
          "Now she keeps the crew's days in a green ledger, one page for each day.",
          "The ledger sits on the radio shelf in the dining room, and you can read the old pages there.",
        ] },
        { id: "june-t2", when: { day: 1 }, facts: [
          "June says the crew hides in the office closet during a wave.",
          "Walkers that get into the closet can hurt someone.",
          "That costs a medical kit from storage, or 2 food if there is none, so clear the cabin fast.",
        ] },
        { id: "june-t3", when: { day: 2 }, facts: [
          "June counts the food every night and writes the number in her ledger.",
          "Every trip in the van eats 1 food crate.",
          "With no food left, the van goes out weak, so she says to bring food home whenever you can.",
        ] },
        { id: "june-t4", when: { day: 3 }, facts: [
          "June says Dan Hollis hung the dinner bell on the porch so his kids could hear it in the woods.",
          "Walkers come to it too: ring it, and a wave comes a few seconds later, every time.",
          "June misses bells that only meant supper.",
        ] },
        { id: "june-t5", when: { stars: 1 }, facts: [
          "June keeps tape and a clean cloth in her cardigan pocket, just in case.",
          "Now, if you come to her hurt, she patches you up once between waves.",
          "A medical kit still heals you all the way, and the backpack carries 3 of them.",
        ] },
        { id: "june-t6", when: { day: 7, stars: 1 }, facts: [
          "June's old friend Rosa ran the greenhouses at Greenhouse Row.",
          "June says that if anyone still has seeds, it is Rosa.",
          "Seed packets and a bag of soil start a Garden, and a Garden grows food every day.",
        ] },
        { id: "june-t7", when: { day: 9, stars: 2 }, facts: [
          "June taught her school kids to plant a seed one finger deep, then wait.",
          "She says the town's shelves work the same way: what you take from a shelf or the floor is back 3 days later.",
          "What you take from a locked room never comes back.",
        ] },
        { id: "june-t8", when: { stars: 2, note: "garden-dead1" }, facts: [
          "You tell June about Rosa's planting chart.",
          "June smiles at the last line, about her beans, and says Rosa never forgets a friend.",
          "Notes you bring home stay in your backpack, so you can read them again.",
        ] },
        { id: "june-t9", when: { day: 14, room: "garden", level: 1 }, facts: [ // day 14: the River Convoy (JOURNAL day 14)
          "June says Kate Hollis's note asked whoever found the cabin to keep the garden going, and now there is one.",
          "Each new level of the Garden grows more food each day.",
          "June says a cabin with a garden is hard to leave, even for the River Convoy.",
        ] },
        { id: "june-t10", when: { dog: true, quest: "pip-5" }, facts: [
          "June says the dog is Pip's problem, then slips it the last of her beans.",
          "She writes its supper in the ledger like everyone else's.",
          "She is glad of one thing: walkers never hurt the dog, so nobody has to guard it in a wave.",
        ] },
      ],
      moods: [
        { id: "june-m1", facts: ["June's knees ache on cold mornings.", "She says that is how she knows it is morning."] },
        { id: "june-m2", facts: ["June says the most important rule is to say where you are going before you go."] },
        { id: "june-m3", facts: ["June says quiet days are not wasted; they are how you get ready for loud ones.", "Patch the fence and count the food while it is quiet."] },
        { id: "june-m4", facts: ["June says a ledger only has to be honest, not neat.", "She writes down the bad days too."] },
        { id: "june-m5", facts: ["June wonders where her old school kids are now.", "She hopes they remember the sunflowers."] },
      ],
    },
    tomas: {
      topics: [
        { id: "tomas-t1", when: { day: 1 }, facts: [
          "Tomas is seventeen, and he keeps the van alive.",
          "He says the van is old but honest, like a good mule.",
          "Damage to the van stays from one trip to the next.",
          "Fix it at the office computer, or at the van before you go.",
        ] },
        { id: "tomas-t2", when: { day: 1 }, facts: [
          "Tomas fixes fence holes and cracks himself when it is quiet, then tells you later.",
          "Each of his fixes costs the base 1 scrap, the same as yours.",
          "Holes never close on their own; to fix one yourself, press E at the gap.",
        ] },
        { id: "tomas-t3", when: { day: 2 }, facts: [
          "Tomas says walkers listen the way he listens to an engine.",
          "Every shot you fire in the quiet brings the next wave sooner.",
          "A bow makes no sound, so walkers do not hear it.",
        ] },
        { id: "tomas-t4", when: { day: 5, stars: 1 }, facts: [
          "Tomas knows every hinge in the cabin by its squeak.",
          "He says walkers smash windows and climb in, and nobody can climb out through a broken one.",
          "A broken door or window costs 2 scrap to fix: press E at it, or use the office computer.",
        ] },
        { id: "tomas-t5", when: { day: 9, stars: 1 }, facts: [
          "Tomas learned engines from his father, handing him wrenches under cars.",
          "His father learned the trade from Mr. Ortiz at Ortiz Auto.",
          "Tomas hopes Mr. Ortiz is still out there somewhere.",
          "He says most van upgrades stop at level 2 until you build a Garage.",
        ] },
        { id: "tomas-t6", when: { room: "garage", level: 1 }, facts: [
          "Tomas finally has a garage, like the one his father worked in.",
          "With the Garage built, the van comes home fixed after every trip, for free.",
          "Each Garage level lets the van's upgrades go one level higher.",
        ] },
        { id: "tomas-t7", when: { day: 14, stars: 2 }, facts: [
          "Tomas thinks the van could make it up the river road if the River Convoy ever leaves.",
          "June is not sure she wants to go, and Tomas will not go without her.",
          "He says each Armor Plating upgrade gives the van 30 more health.",
        ] },
        { id: "tomas-t8", when: { stars: 2 }, facts: [
          "Tomas sleeps in Gus's room, and he says the KEEP OUT sign now means Pip.",
          "Gus left a guitar with two broken strings, and Tomas wants to fix it someday.",
          "Now Tomas also fixes the cabin's broken doors and windows himself when it is quiet.",
        ] },
        { id: "tomas-t9", when: { day: 9, stars: 2, note: "watertower-trail1" }, facts: [
          "You tell Tomas what Dev's note says: Mr. Ortiz is safe at the Water Tower with Theo.",
          "Tomas goes quiet, and then he grins.",
          "He says a Garage, built from engine parts and a tool kit, is the first thing Mr. Ortiz would want to see.",
        ] },
        { id: "tomas-t10", when: { day: 16, stars: 3 }, facts: [
          "Tomas remembers the night walkers hit the fence from every side, and he wants traps out first next time.",
          "Spike traps need the Walls at level 2, and blast traps need level 3.",
          "Make them at the workbench, from the office computer, then press T or R in the yard.", // the computer's Traps & tools tab opens the workbench (there is no bench to walk to)
        ] },
      ],
      moods: [
        { id: "tomas-m1", facts: ["Tomas whistles under the van and talks to the engine like an old friend."] },
        { id: "tomas-m2", facts: ["Tomas says a tick means one thing, a knock means another, and a squeal means stop right now."] },
        { id: "tomas-m3", facts: ["Tomas wipes his hands on the red rag in his back pocket.", "He says a good fix is a quiet one: no rattles, no squeaks."] },
        { id: "tomas-m4", facts: ["Tomas slips Pip half his bread, and June pretends not to see."] },
        { id: "tomas-m5", facts: ["Tomas says fuel needs room in the heat, so he fills a can to the line, never to the top."] },
        { id: "tomas-m6", facts: ["Tomas says to shut the doors inside the cabin when walkers get in.", "A shut door slows them down, even though they can force it open."] },
      ],
    },
    pip: {
      topics: [
        { id: "pip-t1", when: { day: 1 }, facts: [
          "Pip is eleven and wants a dog more than anything.",
          "Pip added a row to the Hollis chore chart: Pip feeds the dog we do not have yet.",
          "Pip says the Hollis family left notes on walls all over the cabin; walk up close to read one.",
        ] },
        { id: "pip-t2", when: { day: 3 }, facts: [
          "Pip counts the minutes you are gone and writes the number on the wall.",
          "Pip says a trip only counts once you drive home.",
          "If you go down or the van is wrecked, you lose everything from that trip and start from your last save.",
        ] },
        { id: "pip-t3", when: { day: 4 }, facts: [
          "Pip has counted every wave since the first walkers came to the fence.",
          "A small wave comes out of the trees on two sides, and a big one on all four.",
          "The warning says which sides, and sometimes the quiet ends with no wave at all.",
        ] },
        { id: "pip-t4", when: { stars: 1 }, facts: [
          "Pip watches the trees for you now.",
          "Before the quiet runs out, Pip calls out what is coming next and from which sides.",
          "June does not love Pip being the lookout, but Pip says somebody has to.",
        ] },
        { id: "pip-t5", when: { day: 8, stars: 1 }, facts: [
          "Pip practiced painting Ruby's red R on a board, with a number next to it.",
          "The number is how many walkers Ruby saw inside a building.",
          "Pip says there are more by now, because each building gets one more walker every three days, up to a limit.",
        ] },
        { id: "pip-t6", when: { day: 11, stars: 1 }, facts: [
          "Pip keeps a list of every voice the crew hears, and the first name on it is June.",
          "People say someone named Jo talks on the radio from a rooftop.",
          "Pip says the Radio room, made of radio parts and wire, finds new places for the map.",
        ] },
        { id: "pip-t7", when: { room: "radio", level: 1 }, facts: [
          "Pip finally has a radio that reaches town, and every new voice goes on the list.",
          "It plays one broadcast each day you come home.",
          "Pip moved the radio to the dining room: tune in there for each day's news, and hear old broadcasts again.",
        ] },
        { id: "pip-t8", when: { day: 21, stars: 2 }, facts: [
          "Pip got the town's own rule onto the door: take what you need, leave the rest.",
          "Pip says each stash key hides in another building, and a note there says where.",
          "A wrong key can jam a stash lock or snap off in it.",
        ] },
        { id: "pip-t9", when: { stars: 3 }, facts: [
          "Pip loves Finn Hollis's treehouse plan, with a rope ladder, a lookout and a bucket on a pulley.",
          "Pip wants to build it someday, once the fence is strong.",
          "Pip says the Walls room makes the fence stronger and gives you and the van more health.",
        ] },
        { id: "pip-t10", when: { dog: true, quest: "pip-5" }, facts: [
          "The dog follows Pip around the yard and hides in the closet with the crew in a wave.",
          "If it barks in a wave, Pip says a walker is near the cabin, so go and check.",
          "Pip is teaching it to sit, like Biscuit in Lucy's drawing.",
        ] },
      ],
      moods: [
        { id: "pip-m1", facts: ["Pip asks what the town looks like out there and listens to every word."] },
        { id: "pip-m2", facts: ["Pip practices knots on the fence rope and ties one for you, for luck."] },
        { id: "pip-m3", facts: ["Pip asks where everyone in town went.", "Pip says some people must still be out there helping each other, and Pip wants to meet them."] },
        { id: "pip-m4", facts: ["Pip says the ping pong table leans to the left, and that is the only reason Tomas wins."] },
        { id: "pip-m5", facts: ["Pip says to read every note to the end, because some notes in town are old or wrong."] },
      ],
    },
  };

  /* ---------- Live tips: one piece of useful information in every talk ----------
     The engine picks the tip that applies (docs/CREW.md has the conditions; js/crewstate.js the order) and
     fills the placeholders. Facts carry the placeholders exactly; numbers are SETTINGS values. A count that
     can be 1 goes where no plural hangs on it ("... broken doors and windows: {broken}"); crewFill only mends
     "1 holes", "1 cracked boards", "1 food crates", "1 days" and the like. Keep each tip under about 24 words
     (the `tag` range at level 1). */
  W.CREW_TIPS = {
    june: {
      hungry: { facts: ["June says the pantry is out of food.", "The van goes out weak with no food, so bring some home on the next trip."] },
      food: { facts: ["June counts {food} food crates in the pantry.", "That is enough for {days} more trips."] },
      ready: { facts: ["June says you have everything you need to build the {room} now.", "Use the office computer to build it."] },
      build: { facts: ["June says the next build is the {room}.", "It still needs {needs}."] },
      heal: { facts: ["June sees you are hurt and patches you up.", "You get back {hp} health."] },
    },
    tomas: {
      van: { facts: ["Tomas says the van has {hp} of {max} health.", "A full fix costs {cost} scrap, at the office computer or at the van."] },
      vanFree: { facts: ["Tomas says the van has {hp} of {max} health.", "With the Garage built, a fix costs nothing."] },
      fence: { facts: ["Tomas counts {holes} holes and {cracks} cracked boards in the fence.", "Holes never close on their own, and each fix you make costs 1 scrap."] }, // his own are free with the brackets (tomas-4)
      cabin: { facts: ["Tomas counts the cabin's broken doors and windows: {broken}.", "Each fix costs 2 scrap: press E at it, or use the office computer."] },
      crowbar: { facts: ["Tomas says you have no crowbar.", "A crowbar pries open one jammed lock and is used up; build one at the workbench, from the office computer."] }, // as tomas-t10
      fine: { facts: ["Tomas says the van, the fence and the cabin are all in good shape.", "Nothing needs fixing right now."] },
    },
    pip: {
      // {size} is "a small wave", "a big wave" or "no wave"; for "no wave" the engine fills {sides} so the line
      // still reads ("nowhere"), or skips the tip
      wave: { facts: ["Pip has been watching the trees from the lookout.", "Pip calls what comes next: {size}, from {sides}."] },
      keys: { facts: ["Pip says you are holding {keys}.", "Each key's note says which stash it opens, and your notes are in the backpack."] },
      // told only while a known building is not yet full (js/crewstate.js crewWalkerDays), so "up to a limit" stays true
      walkers: { facts: ["Pip keeps count: in {days} days, the buildings in town get one more walker each, up to a limit."] },
      radio: { facts: ["Pip says a new broadcast waits at the radio in the dining room each day you come home.", "Tune in there, and hear the old ones again too."] },
      // the fallback once every known building is at its walker limit (the walkers tip has nothing left to count)
      full: { facts: ["Pip says every building in town is as full of walkers as it will get.", "From now on, a place is only as dangerous as it is today."] },
    },
  };

  /* ---------- Reports: what a crew member did for you since you last talked ---------- */
  W.CREW_REPORTS = {
    fence: { facts: ["Tomas fixed {fixed} fence boards since you last talked.", "It took {scrap} scrap from the base."] },
    fenceFree: { facts: ["Tomas fixed {fixed} fence boards since you last talked.", "It cost no scrap at all."] },
    cabin: { facts: ["Tomas fixed broken doors and windows in the cabin: {fixed} in all.", "It took {scrap} scrap from the base."] },
    cabinFree: { facts: ["Tomas fixed broken doors and windows in the cabin: {fixed} in all.", "It cost no scrap at all."] },
    // {cost} is "a medical kit" (from storage), "2 food" (from the crew's food, not storage; "1 food" when only 1 was
    // left), or "nothing" when there was neither (js/crewstate.js crewHurt): the words must read with all three
    // one report for every hurt since the last talk ({cost} sums them: "2 medical kits and 2 food"), so the words
    // must read true for one wave or several
    hurt: { facts: ["Walkers got into the closet in a wave, and {who} got hurt.", "It cost the base {cost}.", "Everyone is all right now."] },
    late: { facts: ["Time ran out on the errand: {item}.", "It is off the list now, and trust dropped a little."] },
  };

  /* ---------- Errands: the ordinary asks once a crew member has no story quest to give ----------
     Asked once their first story quest is handed in, and only while they have no story quest to give right
     now (the next one is locked, or all are done); one errand and one story quest can be open at once.
     Repeatable, in turn (errandNext counts up on accept and wraps; a "Not now" offers the same one again).
     An errand whose item no known place's shelves stock is passed over for the next in turn that is (and none
     is asked while no known shelf stocks any), so every errand asked can be filled (js/crewstate.js).
     Items are ones that come back on town shelves (SETTINGS.restockDays), so a repeat errand can always be
     filled: never "food", and not radioParts or maps, which only come from caches and stashes that never
     refill. Each crew member's first errand can come on day 3, after their first story quest, so it asks for
     an item whose shelves the start places, or the main notes at the start places, lead to (seeds and soil:
     Greenhouse Row, from the Gas-N-Go note; parts: Ortiz Auto, the same; lumber: Reyes Hardware). Wire and
     books sit on shelves further out (Signal Electronics, the school, the library, the mall), so they come
     later in the turn. count: [min, max] rolled when offered (at most what about 2 restocks of the nearest
     shelves give inside `days`); days: the deadline; reward: scrap (15 to 40), kits (medical kits to
     storage) or crowbars. facts carry {count} {item} {days} {reward}. {item} is the ITEMS name ("Box of
     nails", "Fuel can"), which reads wrong after a number, so the facts put it last, as a label: "June
     needs 2 of these within 4 days: Box of nails." done is the thank-you. Keep facts under about 24 words
     (the `tag` range at level 1).
     SCALE: an errand item needs a restocking shelf in some place; check it when a place is added or moved. */
  W.ERRANDS = {
    june: [
      { id: "june-e1", item: "seeds", count: [1, 2], days: 4, reward: { scrap: 25 }, facts: [
        "June needs {count} of these within {days} days: {item}.",
        "She wants more beans growing before the cold comes.",
        "She will pay {reward}.",
      ], done: ["June tucks the seed packets into her cardigan pocket and writes them in the ledger."] },
      { id: "june-e2", item: "soil", count: [1, 2], days: 4, reward: { scrap: 20 }, facts: [
        "June needs {count} of these within {days} days: {item}.",
        "She says good dirt is half of any garden.",
        "She will pay {reward}.",
      ], done: ["June pats the soil like an old friend and says the beds will thank you."] },
      { id: "june-e3", item: "waterFilter", count: [1, 1], days: 4, reward: { kits: 1 }, facts: [
        "June needs {count} of these within {days} days: {item}.",
        "She wants clean water for the beds.",
        "She will give you {reward} from her shelf.",
      ], done: ["June rinses the filter in clean water, the way its tag says, and sets it by the sink."] },
      { id: "june-e4", item: "meds", count: [1, 2], days: 5, reward: { scrap: 35 }, facts: [
        "June needs {count} of these within {days} days: {item}.",
        "She wants kits on her shelf for scrapes and colds.",
        "She will pay {reward}.",
      ], done: ["June stocks her shelf and reads the list inside every lid."] },
    ],
    tomas: [
      { id: "tomas-e1", item: "parts", count: [1, 2], days: 4, reward: { scrap: 30 }, facts: [
        "Tomas needs {count} of these within {days} days: {item}.",
        "The van needs a new belt and spark plugs.",
        "He will pay {reward}.",
      ], done: ["Tomas sorts the parts on the porch and checks the belt twice."] },
      { id: "tomas-e2", item: "nails", count: [1, 2], days: 4, reward: { scrap: 20 }, facts: [
        "Tomas needs {count} of these within {days} days: {item}.",
        "Loose fence boards hold better with two nails each.",
        "He will pay {reward}.",
      ], done: ["Tomas wraps the box in a shirt so it will not rattle, then gets to work."] },
      { id: "tomas-e3", item: "fuel", count: [1, 2], days: 3, reward: { crowbars: 1 }, facts: [
        "Tomas needs {count} of these within {days} days: {item}.",
        "Fuel feeds the Power room and blast traps.",
        "He will trade {reward} he made himself.",
      ], done: ["Tomas stores the fuel outside, away from the stove, and never fills a can past the line."] },
      { id: "tomas-e4", item: "tools", count: [1, 1], days: 4, reward: { scrap: 30 }, facts: [
        "Tomas needs {count} of these within {days} days: {item}.",
        "His tools are worn out, and good fixes need good tools.",
        "He will pay {reward}.",
      ], done: ["Tomas wipes every tool clean before he puts it away, the way Mr. Ortiz's note says."] },
    ],
    pip: [
      { id: "pip-e1", item: "lumber", count: [1, 2], days: 4, reward: { scrap: 25 }, facts: [
        "Pip needs {count} of these within {days} days: {item}.",
        "Pip is saving boards for Finn's treehouse.",
        "Pip will pay {reward}.",
      ], done: ["Pip stacks the boards behind the cabin, ready for the day the fence is strong."] },
      { id: "pip-e2", item: "wire", count: [1, 2], days: 4, reward: { scrap: 25 }, facts: [
        "Pip needs {count} of these within {days} days: {item}.",
        "Pip wants a longer antenna, to hear farther voices.",
        "Pip will pay {reward}.",
      ], done: ["Pip winds the wire into a neat coil and labels it in big, messy letters."] },
      { id: "pip-e3", item: "books", count: [1, 2], days: 4, reward: { scrap: 30 }, facts: [
        "Pip needs {count} of these within {days} days: {item}.",
        "Pip wants something new to read by the stove at night.",
        "Pip will pay {reward}.",
      ], done: ["Pip reads the first page of every book before choosing one."] },
    ],
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
