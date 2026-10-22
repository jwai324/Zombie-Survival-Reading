/* Crossover facts: the Captain Leo universe (Settings: Universe). The river town is a colony town on Mira-8,
   next to Mira-9, about two hundred years after Captain Leo's first mission. Design and canon: docs/UNIVERSES.md
   (read it first). Words at six reading levels: js/content/levelN-leo.js (T.universe.leo, and the crew's words
   for the topics and quests below in T.crew). Loaded after js/story-quests.js.

   The one rule: the base story stays true in every universe. Nothing here edits a base fact; everything is
   added on top and shows only while Universe is Captain Leo (State.universe()).
   - The crew topics below are appended to CREW_TALK with `universe: "leo"`; the engine skips them in any other
     universe (js/crewstate.js nextTopic). They follow every base topic rule (docs/CREW.md).
   - The quests are appended to QUESTS with `universe: "leo"`: Tomas's own five-quest track, beside his base
     quests (one open on each track at once). Every base quest rule holds within the track
     (tests/validate-world.js groups a giver's quests by track).
   - The journal lines and radio broadcasts are told in order, one at a time, by this universe's own count
     (save.xover.leo), never by the day, so a player who switches the universe on late still starts at the first.
   Old saves store these ids: append, never rename, remove or reorder. */
(function (root) {
  "use strict";
  const W = root.ZSR.WORLD;
  const U = "leo";

  W.UNIVERSES = W.UNIVERSES || {};
  W.UNIVERSES.leo = {
    name: "Captain Leo", // the save slot's summary (js/main.js universeTail); Settings labels the button itself
    where: "Mira-8",
    sky: "mira9", // js/crossart.js (ZSR.Crossover.sky) draws it over the yard
    // the quest whose hand-in wakes Rivet, the robot dog (ROBO below)
    robotQuest: "tomas-leo-5",
    // a journal line rides on every journalEvery-th day page; a broadcast on every radioEvery-th day the Radio
    // room hears the news (SCALE: one list each; a list told to its end stops, the radio's repeats its last third)
    journalEvery: 2,
    radioEvery: 3,
    /* June's ledger: a few lines under the day's page. The journal rule holds (never assume a build or a find). */
    journal: [
      { id: "leo-j1", facts: [
        "Mira-9 rose over the trees tonight, huge and pale, with its white clouds turning slowly.",
        "Everyone on Mira-8 grows up under it.",
        "Pip asked if anyone still lives up there.",
        "June said yes: the Mirans, the cloud-people, but that is a story for another night.",
      ] },
      { id: "leo-j2", facts: [
        "June's calendar says today would have been Founders' Day.",
        "Every year the town ate cake and told the story of Captain Leo and Co-captain Camila.",
        "They were the first kids to reach Mira-9, about two hundred years ago.",
        "Nobody baked a cake this year, but Pip told the story anyway.",
      ] },
      { id: "leo-j3", facts: [
        "Tomas asked why everyone who came to Mira-8 came as a kid.",
        "June told him about the Skip Drive: it folds space like a sheet of paper.",
        "It only works on bodies that are still growing, so only kids can ride it.",
        "June rode it when she was ten years old, with one bag and one photo.",
      ] },
      { id: "leo-j4", facts: [
        "June wrote down what the town calls the sickness across the river: the Gray.",
        "Long ago Mira-8 had a forest in the sky, like the one on Mira-9.",
        "It died before the first kids ever came.",
        "The miners across the river dug deep and brought up what was left of it.",
        "The Mirans had warned the town not to dig there.",
      ] },
      { id: "leo-j5", facts: [
        "June turned the jar on the windowsill toward the light.",
        "It holds a cloud-tree seed from Mira-9, given to her grandmother as a girl.",
        "It has never sprouted, because nobody knows the right air for it.",
        "June waters it anyway.",
      ] },
      { id: "leo-j6", facts: [
        "June remembers the old radios in town picking up three soft notes from Mira-9.",
        "It sounded like a knock on a door, and the town called it the Come Back Knock.",
        "Before the Mirans knocked, they spent many years sending numbers: one, two, three, up to ten.",
      ] },
      { id: "leo-j7", facts: [
        "Tomas fixed the porch step and talked about Koen, the builder on Captain Leo's crew.",
        "Koen built Bolt, a robot dog made of bolts and wire, and Bolt went everywhere he went.",
        "Every school on Mira-8 kept a Bolt-model robot dog to sniff the air pipes for leaks.",
      ] },
      { id: "leo-j8", facts: [
        "June read Pip the last page of Captain Leo and Co-captain Camila's mission report.",
        "Sool, the Miran, waved goodbye with three misty fingers.",
        "June says Mirans live a very long time, and Sool may still be up there.",
        "Pip waved at the sky, just in case.",
      ] },
    ],
    /* The radio: the knock and a Miran voice. Each names its speaker (voice), as the base broadcasts do. */
    radio: [
      { id: "leo-r1", voice: "Jo", facts: [
        "Before Jo's show, three soft notes came through: knock, knock, knock.",
        "Jo said the old folks call it the Come Back Knock, and it comes from Mira-9.",
        "It came every few days before the Fall too.",
        "Jo said: if you hear it, you are not alone.",
      ] },
      { id: "leo-r2", voice: "Sool", facts: [
        "After the knock, a soft voice like wind through grass came on.",
        "It said: \"Hello. I am Sool. We hear you.\"",
        "Sool said the Mirans are watching Mira-8 from their clouds.",
        "Sool said: \"Do not dig. Stay together.\"",
      ] },
      { id: "leo-r3", voice: "Jo", facts: [
        "Jo read from an old school book about the first mission.",
        "Captain Leo and five other kids flew the ship Skip-One to Mira-9 and met the Mirans.",
        "The Mirans breathe methane, and their trees float in the clouds.",
        "The Mirans counted on the radio for years before anyone came.",
      ] },
      { id: "leo-r4", voice: "Sool", facts: [
        "Sool said Mira-8 once had a sky-forest too.",
        "It went gray and quiet long before the first kids came.",
        "Sool said: \"What is gray, leave sleeping.\"",
      ] },
      { id: "leo-r5", voice: "Jo", facts: [
        "Jo said someone saw a robot dog on the river road, limping, with one blue eye blinking.",
        "Jo said it looked like an old Bolt-model, the kind every school kept.",
        "Jo asked anyone who can fix one to keep their toolbox handy.",
      ] },
      { id: "leo-r6", voice: "Sool", facts: [
        "Sool asked about the kids of Mira-8: \"Are you eating? Are you warm?\"",
        "Sool said Captain Leo promised the Mirans he would come back, and he did, many times.",
        "Sool said: \"Kids first. Kids are bravest.\"",
      ] },
      { id: "leo-r7", voice: "Jo", facts: [
        "Jo played the knock back on the air: three notes.",
        "No answer came that night.",
        "Jo said the Mirans are patient: they counted for many years before anyone answered.",
      ] },
      { id: "leo-r8", voice: "Sool", facts: [
        "Sool hummed the cloud-tree song, slow, with long notes.",
        "Sool said: \"We wait. We are friends.\"",
        "Then the knock came again, three soft notes, and the radio went quiet.",
      ] },
    ],
  };

  /* Rivet, the robot dog (Tomas's track, quest 5). Tiles, seconds, health points. A weak helper: it zaps an awake
     walker near it, which hurts a little and slows it; walkers that reach it bite it; too many bites and it shuts
     down until Tomas fixes it at the cabin for scrap. js/robodog.js. */
  W.ROBO = {
    name: "Rivet",
    hp: 60, // bites it takes before it shuts down (a plain walker's bite is 12, so five bites; a brute's 22, so three)
    zapEvery: 1.8, // seconds between zaps
    zapRange: 4.5, // tiles: it zaps the nearest awake walker this close, in a clear line
    zapDamage: 6, // a pistol shot is 12: the robot dog is a helper, not a gun
    slow: 0.5, // a zapped walker moves at this share of its speed...
    slowSeconds: 1.6, // ...for this long
    repairScrap: 20, // Tomas's price to fix it once it has shut down (at home: a trip's return or a wave's end)
  };

  /* The crew's Leo topics: told only in this universe, after any base topic that is ready (nextTopic order). */
  const topics = {
    june: [
      { id: "june-leo-t1", universe: U, when: { day: 2 }, facts: [
        "June came to Mira-8 on the Skip Drive when she was ten years old.",
        "She brought one bag and one photo of her mother's garden.",
        "She planted her first seeds on Mira-8 the week she landed.",
        "She says a new world is just a garden nobody has planted yet.",
        "June says the Garden room grows 1 food a day at its first level, and more as it grows.",
      ] },
      { id: "june-leo-t2", universe: U, when: { day: 8, stars: 1 }, facts: [
        "June keeps a cloud-tree seed from Mira-9 in a jar on the windowsill.",
        "A Miran named Sool gave seeds like it to Captain Leo's crew long ago.",
        "On Mira-9 the cloud-trees float in the sky, breathe in carbon dioxide and breathe out methane.",
        "June says the seed is waiting for the right air, and so is she.",
        "She says the Lab room, once it is built, makes medical kits as the days go by.",
      ] },
    ],
    tomas: [
      { id: "tomas-leo-t1", universe: U, when: { day: 1 }, facts: [
        "Tomas says Koen, the builder on Captain Leo's crew, is the reason he learned to fix things.",
        "Koen built Bolt, a robot dog of bolts and wire, and once fixed a ship's lights with Bolt holding the other wire.",
        "Tomas's father kept a picture of Koen over his workbench.",
        "Tomas says the Garage room lets him fix the van for free.",
      ] },
      { id: "tomas-leo-t2", universe: U, when: { day: 4, stars: 1 }, facts: [
        "Every school on Mira-8 had a Bolt-model robot dog to sniff the air pipes for leaks.",
        "Tomas says most of them shut down in the Fall, but their parts are still out there.",
        "He says a Bolt-model's nose is really a tiny chemistry kit.",
        "He says the things you take from a shelf in town come back after 3 days.",
      ] },
    ],
    pip: [
      { id: "pip-leo-t1", universe: U, when: { day: 1 }, facts: [
        "Pip was named after PIP, the helper voice on the ship Skip-One.",
        "PIP talked Captain Leo's crew all the way to Mira-9 and home again.",
        "Pip likes that PIP always had an answer and never panicked.",
        "Pip says the Radio room finds new places for the map.",
      ] },
      { id: "pip-leo-t2", universe: U, when: { day: 6, stars: 1 }, facts: [
        "Pip wants to knock back one day: three notes, sent to Mira-9.",
        "The first Mirans counted on the radio for years, hoping someone would answer.",
        "Pip says a knock with no answer is the loneliest sound there is.",
        "Once the Radio room is built, the knock comes on the radio every few days.",
      ] },
    ],
  };
  Object.entries(topics).forEach(([id, list]) => {
    const T = (W.CREW_TALK = W.CREW_TALK || {})[id];
    if (T && Array.isArray(T.topics)) T.topics.push(...list);
  });

  /* Tomas's Leo track: five parts for a shut-down Bolt-model robot dog he found by the back fence. The objects are
     drawn as js/crewart.js draws their kinds (box: cardboard, red label; jar: glass, red lid, paper label; tin: red,
     white paper band; badge: gold shield with a star on black leather; toolbox: red steel). */
  W.QUESTS = W.QUESTS || [];
  W.QUESTS.push(
    {
      id: "tomas-leo-1", giver: "tomas", universe: U,
      at: "hardware", spot: [31, 2], near: "the riding mower",
      when: { day: 3, stars: 0 },
      object: { name: "Box of leg motors", art: "box" },
      reward: { scrap: 25, items: { wire: 1 } },
      brief: [
        "Tomas found a shut-down Bolt-model robot dog by the back fence, and he wants to wake it up.",
        "First it needs new leg motors.",
        "Reyes Hardware is northeast of the cabin.",
        "A box of leg motors sits on the floor beside the riding mower.",
        "It is a cardboard box with a red label.",
        "Tomas will give you 25 scrap and 1 spool of wire.",
      ],
      tag: [
        "A cardboard box of four small leg motors, each wrapped in paper.",
        "The red label says: for school robot dogs, Bolt-model.",
      ],
      journal: [
        "You brought Tomas a box of leg motors from Reyes Hardware.",
        "The robot dog by the van can stand now, though it wobbles.",
      ],
      done: [
        "Tomas fits the leg motors into the robot dog, one leg at a time.",
        "It stands up, wobbles, and sits down again with a click.",
      ],
      after: [
        "Tomas says Bolt-model dogs were built to copy Koen's first robot dog, Bolt.",
        "Bolt went everywhere Koen went, even to Mira-9.",
        "Tomas wants this one to go everywhere you go.",
      ],
    },
    {
      id: "tomas-leo-2", giver: "tomas", universe: U,
      at: "garden", spot: [28, 18], near: "the beehives",
      when: { day: 5, stars: 1 },
      object: { name: "Jar with a nose sensor", art: "jar" },
      reward: { scrap: 30, items: { parts: 1 } },
      brief: [
        "The robot dog needs a nose: a tiny chemistry sensor that tells what something is made of.",
        "Greenhouse Row used one to test the soil.",
        "Greenhouse Row is west of the cabin.",
        "The sensor is sealed in a glass jar with a red lid, on the floor by the beehives.",
        "Tomas will give you 30 scrap and 1 box of engine parts.",
      ],
      tag: [
        "A glass jar with a red lid. Inside is a small silver sensor on a wire.",
        "The paper label says: soil tester, do not open in the rain.",
      ],
      journal: [
        "You brought Tomas the nose sensor from Greenhouse Row.",
        "He spent the evening teaching the robot dog to sniff the van's fuel line.",
      ],
      done: [
        "Tomas clicks the sensor into the robot dog's nose.",
        "It sniffs the air and beeps twice, which Tomas says means yes.",
      ],
      after: [
        "Tomas says Bolt's nose was a chemistry tester too.",
        "On Mira-9, Bolt sniffed the soft roads and found out they were grown, like coral.",
        "Tomas says a good nose is worth more than a good gun.",
      ],
    },
    {
      id: "tomas-leo-3", giver: "tomas", universe: U,
      at: "radioshack", spot: [25, 8], near: "the robot",
      when: { day: 9, stars: 2 },
      object: { name: "Tin with a battery cell", art: "tin" },
      reward: { scrap: 35, items: { radioParts: 1 } },
      brief: [
        "The robot dog's battery is dead, and only a Bolt-model cell fits it.",
        "Signal Electronics is north of the cabin.",
        "A red tin with a white paper band lies on the floor beside the robot.",
        "The battery cell is inside it.",
        "Tomas will give you 35 scrap and 1 box of radio parts.",
      ],
      tag: [
        "A red tin with a white paper band. Inside, a heavy battery cell hums softly.",
        "Someone wrote on the band: fully charged, keep dry.",
      ],
      journal: [
        "You brought Tomas a battery cell from Signal Electronics.",
        "The robot dog's eyes glowed blue for the first time, then went dark again.",
      ],
      done: [
        "Tomas snaps the battery cell into the robot dog.",
        "Its eyes glow blue for a moment, and its metal tail wags once.",
      ],
      after: [
        "Tomas says the robot dog still has no memory: it does not know who its friends are.",
        "A school's old Bolt-model dog would have one, behind its gold star badge.",
      ],
    },
    {
      id: "tomas-leo-4", giver: "tomas", universe: U,
      at: "school", spot: [33, 23], near: "the basketball hoop",
      when: { day: 14, stars: 3 },
      object: { name: "Gold star badge", art: "badge" },
      reward: { scrap: 45, items: { tools: 1 } },
      brief: [
        "Every school's robot dog wore a gold star badge with its memory chip behind it.",
        "Lincoln Middle School is northeast of the cabin.",
        "The badge lies by the basketball hoop, on a black leather fold.",
        "It is a gold shield with a star.",
        "Tomas will give you 45 scrap and 1 tool kit.",
      ],
      tag: [
        "A gold shield badge with a star, on a black leather fold.",
        "On the back: Lincoln Lions robot dog, sniffs the air pipes every Monday.",
      ],
      journal: [
        "You brought Tomas the school robot dog's gold star badge.",
        "Tomas and Pip stayed up late teaching the robot dog all our names.",
      ],
      done: [
        "Tomas moves the memory chip from the badge into the robot dog.",
        "It turns its head, looks at each of you, and beeps.",
      ],
      after: [
        "Tomas says the robot dog knows our faces now.",
        "It still needs eyes that see in the dark, and a voice to beep at us.",
        "Then it can go out with you.",
      ],
    },
    {
      id: "tomas-leo-5", giver: "tomas", universe: U,
      at: "mall", spot: [40, 7], near: "the green dino",
      when: { day: 20, stars: 4 },
      object: { name: "Toolbox of robot-dog parts", art: "toolbox" },
      reward: { scrap: 60 },
      brief: [
        "The toy store at Northgate Mall sold spare parts for robot dogs: eye lights and voice chips.",
        "Northgate Mall is northeast of the cabin.",
        "A red steel toolbox of those parts lies by the green dino.",
        "With them the robot dog can see in the dark, zap walkers and come with you.",
        "Tomas will give you 60 scrap.",
      ],
      tag: [
        "A red steel toolbox. Inside are two blue eye lights and a small voice chip.",
        "A sticker on the lid says: Toy Town, robot dog repairs.",
      ],
      journal: [
        "You brought Tomas the last parts for the robot dog, and Tomas named it Rivet.",
        "Rivet followed you around the yard all evening, beeping.",
      ],
      done: [
        "Tomas fits the eye lights and the voice chip, and the robot dog wakes up for good.",
        "Tomas names it Rivet, because it is held together with them.",
        "Rivet follows you in the yard and inside buildings and rides along in the van.",
        "It zaps walkers near it, which slows them, but it is no gun.",
        "If walkers bite it too much, it shuts down, and Tomas fixes it at home for 20 scrap.",
      ],
      after: [
        "Tomas says Koen would be proud of Rivet.",
        "Koen once wrote that a robot is only as good as the friend who fixes it.",
        "Tomas says he will always fix Rivet, no matter how many times.",
      ],
    }
  );
})(typeof globalThis !== "undefined" ? globalThis : this);
