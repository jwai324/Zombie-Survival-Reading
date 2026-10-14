/* Story facts for the crew's story quests: five per crew member, each one object to bring home from one
   building (and, for Pip, the dog). Words at six reading levels: js/content/levelN-crew.js.
   Design: docs/CREW.md. Loaded after js/story-crew.js.

   Every quest: `at` a building with a layout, `spot` plain reachable floor in that layout (never behind the
   cache door L or the stash door Q, off note spots, markers and landmark footprints), within 3 tiles of the
   `near` landmark, at most two quest spots per building (tests/validate-world.js checks all of it).
   The brief names the place, its direction from the cabin (from LOCATIONS x, y: north is up on the map),
   the room or sign (`room`, a sign painted in that layout) and `near` word for word, says what the object
   looks like as js/crewart.js draws its kind (qObj: the tape is blue, the tin red with a white band, the box
   cardboard with a red label ...), and gives the reward with every number.
   Quest 1 of each giver is at a place known at the start; quest 2 at a place the start places' main notes
   reveal. Old saves store quest ids: append new quests, never rename, remove or reorder a giver's quests.
   Nothing here gives a lock answer, names a stash, or reveals a place: a quest is offered only once its
   building is known, and its texts name no other place than its own and the places known at the start.
   The journal rule holds here too (the crew never knows a thing before June's ledger does, js/story-home.js
   JOURNAL): a quest's texts tell the crew's own past freely, but news the ledger brings on a later day (Pip's
   list of voices, day 11; the River Convoy, day 14; Ms. Adler's class, day 19; the dog barking past the trees,
   day 25) stays out of them, or the quest waits for that day.
   The objects that the town's notes already describe stay where those notes put them: June's bag of knee pills
   (pharmacy-dead1, every level) and the photo of Mr. Ortiz (autoshop-dead3, level 4 and up) are not quest
   objects, so the knee tape and the thank-you card lie elsewhere and the notes stay true. */
(function (root) {
  "use strict";
  const W = root.ZSR.WORLD;

  W.QUESTS = [
    /* ---------- June: the garden, her knees, Rosa, first aid, seeds for everyone ---------- */
    {
      id: "june-1", giver: "june",
      at: "grocery", spot: [3, 11], near: "the fish tank", room: "SEAFOOD",
      when: { day: 2, stars: 0 },
      object: { name: "Bag of sunflower seeds", art: "seeds" },
      reward: { scrap: 20, items: { seeds: 1 } },
      brief: [
        "June wants to plant sunflowers along the fence, like the kids at her old school.",
        "Corner Grocery is east of the cabin.",
        "The seeds lie on the floor by the fish tank, near the SEAFOOD sign.",
        "They are in a brown paper bag with a sunflower on it.",
        "June will give you 20 scrap and 1 seed packet.",
      ],
      tag: [
        "A paper bag of sunflower seeds from the bulk bins.",
        "The price sticker says: for snacks or for planting.",
      ],
      journal: [
        "You brought home a bag of sunflower seeds.",
        "June planted them along the fence, one finger deep, and Pip watered every one.",
      ],
      done: [
        "June holds the bag as if it were full of gold.",
        "She says sunflowers grow taller than the fence and turn their faces to the sun.",
      ],
      after: [
        "June talks about her old school garden.",
        "Every spring her students planted sunflowers by the school fence.",
        "Every fall they saved the seeds in envelopes with their names on them.",
        "One boy wrote down how tall his sunflower was every day.",
        "June says that boy would be good at keeping a ledger.",
      ],
    },
    {
      // not June's bag of knee pills: pharmacy-dead1 shows that bag in the cross aisle at every reading level
      id: "june-2", giver: "june",
      at: "pharmacy", spot: [4, 8], near: "the giant toothbrush", room: "STAFF ONLY",
      when: { stars: 1 },
      object: { name: "Roll of knee tape", art: "tape" },
      reward: { scrap: 30, kits: 1, perk: { foodPerDay: 1 } },
      brief: [
        "June's knees ache when she kneels in the garden.",
        "Mr. Okafor at Mile 9 Pharmacy, northwest of the cabin, sold tape that holds a sore knee steady.",
        "A roll lies on the floor by the giant toothbrush, outside the STAFF ONLY door.",
        "It is a wide roll of blue tape.",
        "June will give you 30 scrap and 1 medical kit.",
      ],
      tag: [
        "A wide roll of blue tape from Mile 9 Pharmacy.",
        "The label says: for sore knees and ankles.",
      ],
      journal: [
        "You brought June a roll of knee tape from Mile 9 Pharmacy.",
        "She taped her knees and worked in the dirt until supper.",
      ],
      done: [
        "June laughs and says Mr. Okafor told her to buy this tape for years.",
        "With her knees taped, she can kneel in the dirt again.",
        "From now on the crew gets 1 more food every day.",
      ],
      after: [
        "June tells you about Mr. Okafor.",
        "For twenty years he kept her knee pills ready in a paper bag, and for twenty years she forgot to pick them up.",
        "She paid him back in tomatoes every summer.",
        "June says the town was full of people who kept things safe for each other.",
      ],
    },
    {
      id: "june-3", giver: "june",
      at: "garden", spot: [1, 18], near: "the big gnome",
      when: { stars: 2 },
      object: { name: "Rosa's jar of beans", art: "jar" },
      reward: { scrap: 30, items: { seeds: 2, soil: 1 } },
      brief: [
        "Every fall, June's old friend Rosa saved her a jar of beans grown from June's seeds.",
        "Rosa's place, Greenhouse Row, is west of the cabin.",
        "The jar is under the seed racks by the gate, beside the big gnome.",
        "It has a red lid and speckled beans inside.",
        "June will give you 30 scrap, 2 seed packets and 1 bag of soil.",
      ],
      tag: [
        "A glass jar of dry speckled beans with a red lid.",
        "Rosa's label says: For June. The beans came up.",
      ],
      journal: [
        "You brought home Rosa's jar of beans from Greenhouse Row.",
        "June read the label three times, then put the jar on the windowsill.",
      ],
      done: [
        "June reads the label and smiles for a long time.",
        "She says Rosa never wasted words, and these are the best ones she ever wrote.",
      ],
      after: [
        "June tells you about Rosa.",
        "They met at a plant sale, both reaching for the last tomato plant, and they shared it.",
        "After that they traded seeds every spring: June's beans for Rosa's squash.",
        "June will save the best beans from this jar for Rosa.",
      ],
    },
    {
      id: "june-4", giver: "june",
      at: "library", spot: [33, 24], near: "the owl statue", room: "MEDIA",
      when: { stars: 3 },
      object: { name: "First-aid book", art: "book" },
      reward: { scrap: 40, kits: 1, perk: { healAmount: 20 } },
      brief: [
        "June wants a first-aid book, so she can patch the crew up better.",
        "The Public Library is north of the cabin.",
        "The book lies on the floor of the MEDIA room, beside the owl statue.",
        "It is a thick blue book with folded page corners.",
        "June will give you 40 scrap and 1 medical kit.",
      ],
      tag: [
        "A thick blue first-aid book from the Public Library.",
        "The corners are folded down on the pages about cuts, burns and sprains.",
      ],
      journal: [
        "You brought June a first-aid book from the Public Library.",
        "She read it by the stove until the candle burned down.",
      ],
      done: [
        "June has already started reading.",
        "She says the folded corners show which pages helped people most.",
        "From now on her patch-up gives you 20 more health.",
      ],
      after: [
        "June learned first aid in her school garden.",
        "Kids got bee stings and scraped knees there, so the school nurse taught her what to do.",
        "She kept bandages in the tool shed, and lollipops for the brave ones.",
        "The crew is braver, June says, but they still get no lollipops.",
      ],
    },
    {
      id: "june-5", giver: "june",
      at: "school", spot: [5, 4], near: "the big brain", room: "SCIENCE",
      when: { stars: 4 },
      object: { name: "Garden club seed box", art: "box" },
      reward: { scrap: 50, items: { seeds: 2, soil: 2 }, perk: { foodPerDay: 2 } },
      brief: [
        "June wants good seeds for a bigger garden.",
        "She once helped the garden club at Lincoln Middle School, northeast of the cabin, and it kept its best seeds in a box.",
        "The box is in the SCIENCE room, on the floor beside the big brain.",
        "It is a cardboard box with a red label.",
        "June will give you 50 scrap, 2 seed packets and 2 bags of soil.",
      ],
      tag: [
        "A cardboard box full of seed envelopes, sorted by plant.",
        "The red label says: Lincoln Garden Club, save your best seeds.",
      ],
      journal: [
        "You brought home the garden club's seed box from Lincoln Middle School.",
        "June and Pip sorted the envelopes on the kitchen table until late.",
      ],
      done: [
        "June reads every envelope out loud: beans, squash, corn, peppers and sunflowers.",
        "She plants the seeds in every spare corner of the yard.",
        "From now on the crew gets 2 more food every day.",
      ],
      after: [
        "June found the kids' names on the envelopes, written in pencil.",
        "She hopes those kids are safe, wherever they are.",
        "She will save seeds from this harvest for them.",
        "She says a seed is a promise that there will be a next year.",
      ],
    },

    /* ---------- Tomas: his father's tools, Mr. Ortiz, crowbars, the fence, the van ---------- */
    {
      id: "tomas-1", giver: "tomas",
      at: "hardware", spot: [33, 19], near: "the orange ladder",
      when: { day: 2, stars: 0 },
      object: { name: "Socket wrench", art: "wrench" },
      reward: { scrap: 25, items: { nails: 1 } },
      brief: [
        "Tomas's wrench was his father's, and it is worn so smooth that it slips.",
        "Reyes Hardware is northeast of the cabin.",
        "A new socket wrench lies by the tool wall, beside the orange ladder.",
        "It has a red handle and a shiny silver head.",
        "Tomas will give you 25 scrap and 1 box of nails.",
      ],
      tag: [
        "A socket wrench with a red handle, still on its shop clip.",
        "Mr. Reyes's price sticker is on the handle.",
      ],
      journal: [
        "You brought Tomas a new socket wrench from Reyes Hardware.",
        "He spent the whole evening under the van and came out whistling.",
      ],
      done: [
        "Tomas tries the wrench on a bolt and grins.",
        "He says his father's wrench goes on the shelf now, for luck, not for work.",
      ],
      after: [
        "Tomas tells you how he learned to fix things.",
        "As a small boy he handed his father the tools, but he had to say each tool's name first.",
        "If he said the wrong name, his father waited.",
        "Tomas says that is how he learned to read the labels on everything.",
      ],
    },
    {
      // not the photo of Mr. Ortiz: autoshop-dead3 shows that photo by the shop door from reading level 4
      id: "tomas-2", giver: "tomas",
      at: "autoshop", spot: [4, 6], near: "the engine crane", room: "PARTS",
      when: { stars: 1 },
      object: { name: "Thank-you card", art: "letter" },
      reward: { scrap: 30, items: { parts: 1, wire: 1 } },
      brief: [
        "Tomas's father once sent his old teacher, Mr. Ortiz, a thank-you card, and Tomas wants to read it.",
        "Ortiz Auto is east of the cabin.",
        "The card lies in the PARTS room, on the floor beside the engine crane.",
        "It is in a white envelope with a red seal.",
        "Tomas will give you 30 scrap, 1 box of engine parts and 1 spool of wire.",
      ],
      tag: [
        "A thank-you card in a white envelope with a red seal.",
        "Inside: thank you for teaching me never to rush a job.",
      ],
      journal: [
        "You brought Tomas his father's thank-you card from Ortiz Auto.",
        "He propped it on the van's dashboard, so it rides along on every trip.",
      ],
      done: [
        "Tomas knows the handwriting at once: it is his father's.",
        "He reads the card twice.",
        "He says his father never said thank you out loud, so it is good to see it written down.",
      ],
      after: [
        "Tomas tells you about his father's garage.",
        "It was small, with one lift and a radio that only played old songs.",
        "Over the door his father painted Mr. Ortiz's rule: never rush a job.",
        "Tomas wants to show Mr. Ortiz the van someday.",
      ],
    },
    {
      id: "tomas-3", giver: "tomas",
      at: "firehouse", spot: [29, 23], near: "the gear racks", room: "RESCUE",
      when: { stars: 2 },
      object: { name: "Fire crew toolbox", art: "toolbox" },
      reward: { scrap: 40, crowbars: 1, perk: { crowbarCost: 10 } },
      brief: [
        "Tomas wants to make crowbars from scrap, so he needs a good pry bar to copy.",
        "The fire crew at Station 12, northwest of the cabin, kept one in their toolbox.",
        "Their toolbox lies by the gear racks, near the big door marked RESCUE.",
        "It is a long red toolbox with a gray handle.",
        "Tomas will give you 40 scrap and 1 crowbar.",
      ],
      tag: [
        "A long red toolbox with Station 12 painted on the side.",
        "A heavy pry bar lies inside.",
      ],
      journal: [
        "You brought home the fire crew's toolbox from Station 12.",
        "Tomas drew the pry bar on the back of a box before supper.",
      ],
      done: [
        "Tomas studies the pry bar from end to end.",
        "He can make crowbars the same way now, from scrap.",
        "From now on a crowbar costs only 10 scrap to build.",
      ],
      after: [
        "Tomas once went to Station 12 with his father, to fix the fire truck.",
        "The fire crew let him sit in the driver's seat, but touch nothing.",
        "Chief Dunn said a good tool is one you trust when you are scared.",
        "Tomas says the van is like that, and so is the crew.",
      ],
    },
    {
      id: "tomas-4", giver: "tomas",
      at: "lumberyard", spot: [5, 5], near: "the band saw", room: "SAW SHOP",
      when: { stars: 3 },
      object: { name: "Box of fence brackets", art: "box" },
      reward: { scrap: 45, items: { lumber: 2 }, traps: { spike: 2 }, perk: { crewRepairFree: true } },
      brief: [
        "Steel brackets would let Tomas fix the fence with old boards instead of scrap.",
        "Carla, the yard boss at Ridge Lumber, northeast of the cabin, kept a box of them.",
        "It is in the SAW SHOP, on the floor beside the band saw.",
        "It is a heavy cardboard box with a red label.",
        "Tomas will give you 45 scrap, 2 pieces of lumber and 2 spike traps.",
      ],
      tag: [
        "A heavy box of steel fence brackets from Ridge Lumber.",
        "Carla wrote on the red label: two screws each, and it holds.",
      ],
      journal: [
        "You brought Tomas a box of fence brackets from Ridge Lumber.",
        "He lined them up on the porch by size.",
      ],
      done: [
        "Tomas opens the box and counts the brackets twice.",
        "He can fix the fence and the cabin with old boards now.",
        "From now on the crew's repairs cost no scrap.",
      ],
      after: [
        "Tomas tells you why he likes fixing the fence.",
        "Under a car, his father did the hard part, and Tomas held the light.",
        "The fence is the first big job that is all his own.",
        "He scratches a small T on every board he puts back.",
      ],
    },
    {
      id: "tomas-5", giver: "tomas",
      at: "hospital", spot: [32, 28], near: "the rescue van", room: "EMERGENCY",
      when: { stars: 4 },
      object: { name: "Rescue van manual", art: "book" },
      reward: { scrap: 70, items: { parts: 2 }, perk: { vanHp: 40 } },
      brief: [
        "Tomas needs a service manual to rebuild the van.",
        "His father used to fix the rescue van at St. Anne Annex, northwest of the cabin, and it has our van's engine.",
        "Few places in town are as dangerous.",
        "The manual is in the garage behind the EMERGENCY sign, beside the rescue van.",
        "It is a thick blue book.",
        "Tomas will give you 70 scrap and 2 boxes of engine parts.",
      ],
      tag: [
        "A thick service manual for the rescue van, blue and greasy.",
        "Someone wrote notes in pencil in the margins.",
      ],
      journal: [
        "You brought home the rescue van's manual from St. Anne Annex.",
        "Tomas read it at the kitchen table all night.",
      ],
      done: [
        "Tomas stops at the notes in the margins: the handwriting is his father's, as on the thank-you card.",
        "With the manual he rebuilds the van.",
        "From now on the van has 40 more health when it is fully fixed.",
      ],
      after: [
        "His father wrote small notes on every page of the manual: check the belt, listen for the knock, never rush a job.",
        "Tomas says it feels like working next to him again.",
        "He reads one page every night, the way June reads her ledger.",
      ],
    },

    /* ---------- Pip: ready for a dog, the lookout, scrap, a leash, and the dog ---------- */
    {
      id: "pip-1", giver: "pip",
      at: "gasngo", spot: [1, 16], near: "the slushie machine", room: "LOTTO",
      when: { day: 2, stars: 0 },
      object: { name: "Tin of dog treats", art: "tin" },
      reward: { scrap: 20, items: { wire: 1 } },
      brief: [
        "Pip wants to be ready for a dog, even though the crew has none yet.",
        "Gas-N-Go is west of the cabin.",
        "A tin of dog treats lies by the slushie machine, under the LOTTO poster.",
        "The tin is red, with a white band.",
        "Pip will give you 20 scrap and 1 spool of wire.",
      ],
      tag: [
        "A red tin of dog treats with a white band.",
        "It rattles, and it is almost full.",
      ],
      journal: [
        "You brought Pip a tin of dog treats from Gas-N-Go.",
        "Pip put it under their drawing of a dog with no name yet.",
      ],
      done: [
        "Pip shakes the tin and listens to it rattle.",
        "Pip says a dog will come to someone who has treats, and now the crew has treats.",
      ],
      after: [
        "Pip tells you about Biscuit, the Hollis family's dog.",
        "Lucy's drawing says Biscuit could sit, shake and roll over.",
        "Biscuit went north with the family, and Pip hopes Biscuit gets lots of treats.",
        "If the Hollises come back, Pip says, Biscuit will have a friend here.",
      ],
    },
    {
      id: "pip-2", giver: "pip",
      at: "watertower", spot: [21, 20], near: "the rowboat", room: "WORKSHOP",
      when: { stars: 1 },
      object: { name: "Binoculars", art: "bag" },
      reward: { scrap: 30, items: { radioParts: 1 }, perk: { lookoutEarly: 10 } },
      brief: [
        "Pip keeps watch and wants to see walkers coming from farther away.",
        "The pump crew at the Water Tower, northwest of the cabin, kept binoculars to watch the river.",
        "They lie in the WORKSHOP, on the floor beside the rowboat.",
        "They are in a yellow case with a brown strap.",
        "Pip will give you 30 scrap and 1 box of radio parts.",
      ],
      tag: [
        "Black binoculars in a yellow case.",
        "Scratched on the strap: river watch.",
      ],
      journal: [
        "You brought Pip binoculars from the Water Tower.",
        "Pip watched the trees from the porch roof until June called them down for supper.",
      ],
      done: [
        "Pip looks through the binoculars at everything, even at you, up close.",
        "From the porch roof, Pip can see walkers in the trees much sooner.",
        "When Pip keeps watch, Pip calls each wave 10 seconds sooner from now on.",
      ],
      after: [
        "Pip tells you what they saw from the porch roof.",
        "Far past the trees, a thin line of smoke rose from a chimney.",
        "Pip says smoke means somebody is cooking supper, so somebody is still out there.",
        "Pip drew the smoke on the wall, with a question mark.",
      ],
    },
    {
      id: "pip-3", giver: "pip",
      at: "radioshack", spot: [5, 7], near: "the TV wall", room: "REPAIRS",
      when: { stars: 2 },
      object: { name: "Broken boom box", art: "radio" },
      reward: { scrap: 35, items: { books: 1 }, perk: { scrapPerDay: 3 } },
      brief: [
        "Pip wants a big magnet to pull nails out of the dirt for scrap.",
        "Tomas says every big speaker has a big magnet inside.",
        "Signal Electronics is north of the cabin.",
        "A broken boom box lies there by the TV wall, just outside the REPAIRS room.",
        "It is blue-green, with two big round speakers.",
        "Pip will give you 35 scrap and 1 box of books.",
      ],
      tag: [
        "A blue-green boom box with two big round speakers.",
        "A repair tag says: speakers fine, everything else broken.",
      ],
      journal: [
        "You brought Pip a broken boom box from Signal Electronics.",
        "Pip took the magnet out and dragged it around the yard until dark.",
      ],
      done: [
        "Pip pulls the big magnet out of one speaker and ties it to a string.",
        "Every evening Pip drags it along the fence and pulls up nails and bolts.",
        "From now on Pip brings in 3 scrap every day.",
      ],
      after: [
        "Pip shows you what the magnet pulled out of the dirt.",
        "There were nails, bolts, a bottle cap and a small metal tag shaped like a bone.",
        "The name on the tag is worn away, so Pip keeps it for the dog the crew does not have yet.",
      ],
    },
    {
      id: "pip-4", giver: "pip",
      at: "police", spot: [31, 23], near: "the riot shields", room: "GARAGE",
      when: { stars: 3 },
      object: { name: "Dog leash", art: "leash" },
      reward: { scrap: 50, items: { wire: 1, books: 1 } },
      brief: [
        "Pip wants a leash ready for the day the crew finds a dog.",
        "Pip once saw one in the lost-and-found box at the 4th Precinct, north of the cabin.",
        "The leash lies in the GARAGE, on the floor beside the riot shields.",
        "It is red, with a metal clip.",
        "Pip will give you 50 scrap, 1 spool of wire and 1 box of books.",
      ],
      tag: [
        "A red dog leash with a metal clip.",
        "A paper tag on it says: found by the front steps, no dog.",
      ],
      journal: [
        "You brought Pip a red dog leash from the 4th Precinct.",
        "Pip hung it by the front door, where a leash belongs.",
      ],
      done: [
        "Pip clips the leash to their belt to practice.",
        "Pip says the crew has treats and a leash now.",
        "All that is missing is the dog.",
      ],
      after: [
        "Pip tells you about a police dog that once visited Pip's class.",
        "It sat still while the whole class talked, and it moved only when the officer said one quiet word.",
        "Pip says a dog chooses its people, so Pip is practicing being calm and quiet.",
      ],
    },
    // the dog: Pip's fifth quest. No object or tag: the spot is where the dog sits. You hold out Pip's treats
    // (E) and it follows you to the van; walkers ignore it. Named afterwards (W.DOG).
    // Day 28: it is the dog June's ledger hears barking past the trees (JOURNAL day 25), and on day 28 Pip
    // still tells June that a dog is what Pip wants, so the dog comes home after that page is written
    // (tests/validate-world.js: no earlier than the last ledger page that mentions a dog).
    {
      id: "pip-5", giver: "pip", kind: "dog",
      at: "grocery", spot: [30, 4], near: "the forklift", room: "LOADING DOCK",
      when: { day: 28, stars: 4 },
      reward: { scrap: 60, items: { radioParts: 1, books: 1 } },
      brief: [
        "Through the binoculars, Pip saw the dog that barks past the trees slip into Corner Grocery, east of the cabin.",
        "It sleeps on the LOADING DOCK, beside the forklift.",
        "It is sandy tan, with a dark brown patch over one eye.",
        "Pip gives you treats: hold one out (press E), and the dog will follow you to the van.",
        "Walkers leave it alone.",
        "Pip will give you 60 scrap, 1 box of radio parts and 1 box of books.",
      ],
      journal: [
        "You brought a dog home from Corner Grocery.",
        "Pip smiled all evening, and the dog drank from Pip's bowl by the gate.",
      ],
      done: [
        "Pip kneels down, and the dog licks their face.",
        "The dog eats 1 food every 2 days, and it barks when walkers come close to the cabin.",
      ],
      after: [
        "Pip says the dog has a home now, and so does the crew.",
        "Pip wants to build Finn's treehouse one day, with a bucket on a pulley so the dog can come up too.",
        "June says the dog stays on the ground, and Pip says they will see.",
      ],
    },
  ];

  /* The dog's name: Pip's three ideas (short, plain, not a person in tests/validate-text.js PEOPLE, not
     Biscuit or Peanut), or your own. The card's words: ask, then named and pet once it has a name. */
  W.DOG = {
    ideas: ["Patch", "Sunny", "Scout"],
    facts: {
      ask: [
        "Pip asks you to give the dog a name.",
        "Pip has three ideas, but you found the dog, so you choose.",
      ],
      named: [
        "Pip says {dog} is a good name.",
        "Pip writes {dog} on the list of voices, because a bark is a voice too.",
      ],
      pet: [
        "{dog} leans on your legs and thumps its tail.",
        "Pip says {dog} likes you best, after Pip.",
      ],
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
