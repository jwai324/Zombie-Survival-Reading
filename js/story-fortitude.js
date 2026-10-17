/* Crossover facts: the Fortitude Chronicles universe (Settings: Universe). The river town is on Earth, hundreds of
   years after Book 4. Only Book 1 events are ever named: the game never mentions anything from Books 2 to 4, and
   Book 1 is ancient history (lessons, statues, replicas, old records). Nobody in town knew a Book 1 character.
   The Fall began at the Waiting Vault across the river, a public cryosleep vault whose timer and cooling failed
   together; why stays open. Design and canon: docs/UNIVERSES.md (read it first). Words at six reading levels:
   js/content/levelN-fortitude.js (T.universe.fortitude, and the crew's words for the topics and quests below in
   T.crew). Loaded after js/story-leo.js.

   The same rules as js/story-leo.js: nothing here edits a base fact; topics and quests carry
   `universe: "fortitude"` and show only in this universe; journal lines and broadcasts are told in order by this
   universe's own count. Pip's track decodes the radio's bursts: old records of the Fortitude Accord, kept by an
   archive nobody can find. The Book 1 keepsakes (a pod tag, an Accord page, an Abyss Explorer pin) are the track's
   story objects, with their tags at six levels. Old saves store these ids: append, never rename, remove or reorder. */
(function (root) {
  "use strict";
  const W = root.ZSR.WORLD;
  const U = "fortitude";

  W.UNIVERSES = W.UNIVERSES || {};
  W.UNIVERSES.fortitude = {
    name: "Fortitude",
    where: "Earth",
    sky: "ring", // the old shipyard ring across the sky, and Mars as a bright point (js/crossover.js)
    journalEvery: 2,
    radioEvery: 3,
    journal: [
      { id: "fort-j1", facts: [
        "June showed Pip the thin silver line across the sky.",
        "It is the old shipyard ring, built hundreds of years ago from a black metal called Indestructium.",
        "Pip thought it was a scratch on the window.",
      ] },
      { id: "fort-j2", facts: [
        "Across the river stands the Waiting Vault, where people slept in cold pods to skip ahead to a better time.",
        "June never trusted it.",
        "She says a person should live their days, not skip them.",
      ] },
      { id: "fort-j3", facts: [
        "Every school on Earth teaches the story of Dr. Camila Reyes, who saw the Fortitude fleet first.",
        "Pip can name her whole team: Zoe, Kennedy, Ava, Patriya and Annabelle.",
        "June says that was hundreds of years ago, but it still feels close some nights.",
      ] },
      { id: "fort-j4", facts: [
        "June wrote down what she remembers of the first week of the Fall.",
        "The alarms at the Waiting Vault rang across the river for two days.",
        "Then the sleepers walked out, and they were not right.",
        "June does not like to write about it, so she stopped there.",
      ] },
      { id: "fort-j5", facts: [
        "Pip asked what a Fortitude looks like.",
        "June described the picture of Valen in her old school book: nine feet tall, four arms and two big dark eyes.",
        "Valen was the Fortitude who learned the words help, thank you and together.",
      ] },
      { id: "fort-j6", facts: [
        "Tomas burned his hand on the van's engine today, not badly.",
        "June told him the old saying from the story of the Fortitude: if you stop failing, you stop learning.",
        "Tomas said he would rather learn with gloves on.",
      ] },
      { id: "fort-j7", facts: [
        "On clear nights Mars shows as a bright point low in the sky.",
        "June says the Fortitude live there, on the world that was chosen for them, so Earth could stay ours.",
        "Pip wonders if a Fortitude kid is looking back at us.",
      ] },
      { id: "fort-j8", facts: [
        "Pip found a picture of the Abyss Explorer, the little silver submarine that dove seven miles down.",
        "Its crew brought up the first piece of Indestructium.",
        "Pip says being brave is just going down anyway.",
      ] },
    ],
    radio: [
      { id: "fort-r1", voice: "Jo", facts: [
        "Under Jo's voice came fast clicks, like a machine reading numbers.",
        "Jo said the clicks have come every few days since the Fall.",
        "Nobody knows who sends them.",
      ] },
      { id: "fort-r2", voice: "Jo", facts: [
        "Jo counted the clicks out loud: 1, 2, 3, then 5, then 8.",
        "Jo said it sounds like math, not talk.",
        "Jo asked anyone who knows old codes to listen.",
      ] },
      { id: "fort-r3", voice: "Jo", facts: [
        "Jo read from an old book: the Fortitude talk in bursts of math that make pictures.",
        "Their language has no word for maybe, please, help, together or friend.",
        "Jo said the bursts on 88.1 sound just like that.",
      ] },
      { id: "fort-r4", voice: "Jo", facts: [
        "Jo said someone remembers the Accord Archive, a machine that kept the records of the Fortitude Accord.",
        "Nobody knows where it is, or if it still runs.",
        "Jo said the clicks came again tonight, right on time.",
      ] },
      { id: "fort-r5", voice: "Jo", facts: [
        "Jo said the bursts are getting longer.",
        "Jo asked whoever sends them to say hello in plain words.",
        "Only clicks came back.",
      ] },
      { id: "fort-r6", voice: "Jo", facts: [
        "Jo said a machine that keeps records for hundreds of years must have someone looking after it.",
        "Or it is very well built.",
        "Jo said either way, it is good company on a quiet night.",
      ] },
    ],
  };

  /* The crew's Fortitude topics: Book 1 only, as history. */
  const topics = {
    june: [
      { id: "june-fort-t1", universe: U, when: { day: 2 }, facts: [
        "June never trusted the Waiting Vault across the river.",
        "People slept there in cold pods to skip ahead to a better time.",
        "June says a person should live their days, not skip them.",
        "She says the big bed in the cabin heals you fully, but it takes time.",
      ] },
      { id: "june-fort-t2", universe: U, when: { day: 8, stars: 1 }, facts: [
        "June's school taught an old saying: if you stop failing, you stop learning.",
        "It comes from the story of Dr. Camila Reyes and her team, hundreds of years ago.",
        "June says a wrong key can jam a stash lock, and a crowbar from the workbench pries it open.",
      ] },
    ],
    tomas: [
      { id: "tomas-fort-t1", universe: U, when: { day: 1 }, facts: [
        "Tomas says the black metal in old reactor plates is Indestructium: it cannot be bent, burned or broken.",
        "Kennedy, the engineer on Dr. Camila Reyes's team, gave it that name.",
        "Tomas wishes he could build a van out of it.",
        "He says the Walls room makes the fence stronger and gives you and the van more health.",
      ] },
      { id: "tomas-fort-t2", universe: U, when: { day: 4, stars: 1 }, facts: [
        "Tomas says the first fusion reactor ran for 10 seconds before a coil failed.",
        "Kennedy was burned, and the team learned to stop rushing.",
        "Tomas says a good fix is a slow fix.",
        "He says the van comes home fixed for free once the Garage room is built.",
      ] },
    ],
    pip: [
      { id: "pip-fort-t1", universe: U, when: { day: 1 }, facts: [
        "Pip can name Dr. Camila Reyes's whole team: Zoe, Kennedy, Ava, Patriya and Annabelle.",
        "Valen, the Fortitude who answered their messages, learned the words help, thank you and together.",
        "Pip says to read every note to the end, because some notes in town are old or wrong.",
      ] },
      { id: "pip-fort-t2", universe: U, when: { day: 6, stars: 1 }, facts: [
        "Pip read that the Fortitude talk in bursts of math that make pictures.",
        "Ava learned their language by listening to the patterns of ocean waves.",
        "Once the Radio room is built, Pip listens for strange bursts every few days.",
      ] },
    ],
  };
  Object.entries(topics).forEach(([id, list]) => {
    const T = (W.CREW_TALK = W.CREW_TALK || {})[id];
    if (T && Array.isArray(T.topics)) T.topics.push(...list);
  });

  /* Pip's Fortitude track: decoding the bursts. It starts once the Radio room is built (the bursts come on it).
     Objects as js/crewart.js draws their kinds (radio: a boom box, two speakers, a dial, an antenna; tin: red,
     white paper band; book: thick blue hardback, folded page corners; letter: white envelope, red seal; badge:
     gold shield with a star on black leather). */
  W.QUESTS = W.QUESTS || [];
  W.QUESTS.push(
    {
      id: "pip-fort-1", giver: "pip", universe: U,
      at: "gasngo", spot: [4, 3], near: "the ice machine",
      when: { day: 3, stars: 0, room: "radio", level: 1 },
      object: { name: "Boom box with a tape deck", art: "radio" },
      reward: { scrap: 20, items: { books: 1 } },
      brief: [
        "Pip wants to record the bursts on the radio and play them back slowly.",
        "Gas-N-Go is west of the cabin.", // as pip-1 says it (it sits on the line between west and northwest)
        "An old boom box with a tape deck sits on the floor by the ice machine.",
        "It has two speakers, a dial and an antenna.",
        "Pip will give you 20 scrap and 1 box of books.",
      ],
      tag: [
        "A boom box with two speakers, a dial and an antenna, and a tape still inside.",
        "Someone wrote on the tape: road trip songs, side A.",
      ],
      journal: [
        "You brought Pip a boom box from Gas-N-Go.",
        "Pip recorded the bursts over the road trip songs and played them back slowly all evening.",
      ],
      done: [
        "Pip records a burst and plays it back slowly.",
        "Each click becomes a dot, and the dots start to make a shape.",
      ],
      after: [
        "Pip says the bursts are pictures, just like the old books said.",
        "Played slowly, one burst draws a sleeping pod, and Pip wants something to compare it with.",
        "Pip says a pod tag from the Waiting Vault would help.",
      ],
    },
    {
      id: "pip-fort-2", giver: "pip", universe: U,
      at: "pharmacy", spot: [26, 16], near: "the pill bottle",
      when: { day: 6, stars: 1 },
      object: { name: "Tin with a pod tag", art: "tin" },
      reward: { scrap: 30, kits: 1 },
      brief: [
        "Someone brought a metal tag from a Waiting Vault pod to Mile 9 Pharmacy.",
        "Pip wants to compare its numbers with the bursts.",
        "Mile 9 Pharmacy is northwest of the cabin.",
        "A red tin with a white paper band lies on the floor by the pill bottle, with the tag inside.",
        "Pip will give you 30 scrap and 1 medical kit.",
      ],
      tag: [
        "A red tin with a white paper band. Inside is a cold metal tag stamped with a long number.",
        "The band says: Waiting Vault, pod tag, return to the front desk.",
      ],
      journal: [
        "You brought Pip a pod tag from Mile 9 Pharmacy.",
        "Pip held it up to the radio and wrote numbers until the candle burned down.",
      ],
      done: [
        "Pip lines up the tag's number with the numbers in the bursts.",
        "They are made the same way: the bursts are records, kept by a machine.",
      ],
      after: [
        "Pip decoded the first record.",
        "It says: \"We acknowledge your intelligence.\"",
        "Those were the first words the Fortitude ever sent to Earth, hundreds of years ago.",
        "Pip says somewhere an old archive is still reading its records out loud.",
      ],
    },
    {
      id: "pip-fort-3", giver: "pip", universe: U,
      at: "library", spot: [6, 3], near: "the giant globe",
      when: { day: 10, stars: 2 },
      object: { name: "The Arrival of the Fortitude", art: "book" },
      reward: { scrap: 35, items: { books: 1 } },
      brief: [
        "Pip needs the old history book The Arrival of the Fortitude, to match the bursts' pictures to its drawings.",
        "The Public Library is north of the cabin.",
        "The book lies on the floor beside the giant globe.",
        "It is a thick blue book with folded page corners.",
        "Pip will give you 35 scrap and 1 box of books.",
      ],
      tag: [
        "A thick blue book with folded page corners: The Arrival of the Fortitude.",
        "A library stamp inside says: most borrowed book, every year.",
      ],
      journal: [
        "You brought Pip The Arrival of the Fortitude from the Public Library.",
        "Pip read it out loud at supper, and nobody minded.",
      ],
      done: [
        "Pip finds a drawing in the book that matches a burst: a crowd of people under umbrellas.",
        "Pip says the next record is ready to read.",
      ],
      after: [
        "Pip decoded the second record.",
        "It is the Fortitude Accord, signed in New York on a rainy morning.",
        "Pip says the Accord was the day two kinds of people agreed to share the stars.",
      ],
    },
    {
      id: "pip-fort-4", giver: "pip", universe: U,
      at: "police", spot: [2, 23], near: "the coffee machine",
      when: { day: 15, stars: 3 },
      object: { name: "Copy of an Accord page", art: "letter" },
      reward: { scrap: 45, items: { wire: 1 } },
      brief: [
        "The 4th Precinct kept a copy of a page of the Fortitude Accord, framed by the door, for luck.",
        "Pip wants to check the bursts against the real words.",
        "The 4th Precinct is north of the cabin.",
        "The page is in a white envelope with a red seal, on the floor by the coffee machine.",
        "Pip will give you 45 scrap and 1 spool of wire.",
      ],
      tag: [
        "A white envelope with a red seal. Inside is a copy of a page of the Fortitude Accord.",
        "Someone wrote on the envelope: old, but it still means something.",
      ],
      journal: [
        "You brought Pip a copy of an Accord page from the 4th Precinct.",
        "Pip pinned it over the radio, next to the list of voices.",
      ],
      done: [
        "The words on the page match the burst word for word.",
        "Pip says the archive is real, and it is still running.",
      ],
      after: [
        "Pip decoded the third record: a message from Valen to Dr. Camila Reyes.",
        "It says: \"Hello, Camila. I was not sure you would ever see me.\"",
        "Pip read it twice, very quietly.",
      ],
    },
    {
      id: "pip-fort-5", giver: "pip", universe: U,
      at: "firehouse", spot: [1, 4], near: "the brass pole",
      when: { day: 21, stars: 4 },
      object: { name: "Abyss Explorer pin", art: "badge" },
      reward: { scrap: 60, items: { radioParts: 1 } },
      brief: [
        "The last bursts keep drawing one shape: the Abyss Explorer, the little submarine from the old story.",
        "Station 12's chief kept an Abyss Explorer pin by the brass pole.",
        "Station 12 is northwest of the cabin.",
        "It is a gold badge with a star, on a black leather fold.",
        "Pip will give you 60 scrap and 1 box of radio parts.",
      ],
      tag: [
        "A gold badge with a star, on a black leather fold.",
        "Stamped on the back: Abyss Explorer, seven miles down.",
      ],
      journal: [
        "You brought Pip an Abyss Explorer pin from Station 12.",
        "Pip wore it to supper and decoded the last record before bed.",
      ],
      done: [
        "Pip pins the badge to the radio shelf and plays the last burst slowly.",
        "The picture is the submarine, and then words.",
      ],
      after: [
        "Pip decoded the fourth record: \"We will not take Earth.\"",
        "Every record ends with a number that counts up, and the newest number is from this year.",
        "Pip says someone, or something, is still adding records.",
        "Pip wants to find out who.",
      ],
    }
  );
})(typeof globalThis !== "undefined" ? globalThis : this);
