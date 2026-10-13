/* Story facts: the extra notes, wall signs and keys inside every building.
   Structure lives in js/world.js; the words at six reading levels live in js/content/.
   See docs/STORY.md. Loaded right after js/world.js. */
(function (root) {
  "use strict";
  const W = root.ZSR.WORLD;
  const STORY = {
    /* ---------- Gas-N-Go (gas): Ruby picks up Dev's trail; the ring explained ---------- */
    gasngo: {
      notes: [
        { id: "gasngo-trail1", kind: "trail", spot: 3, found: "on the floor just inside the front door, on the left", facts: [
          "Written by Ruby.",
          "She came back here and found her brother Dev's note by the register.",
          "Dev went east to Ortiz Auto, so Ruby is going east after him.",
          "She asked Jo to say on the radio that she is looking for Dev.",
          "Ruby left a second note on the floor behind the counter, near the register.",
        ] },
        { id: "gasngo-trail2", kind: "trail", spot: 5, after: "gasngo-trail1", found: "on the floor behind the counter, near the register", reveals: ["grocery"], facts: [
          "Written by Ruby, for anyone who reads this far.",
          "A key lies on the floor just inside the front door, on the right, by the storeroom wall.",
          "It is a small brass key on a green plastic tag.",
          "It opens the staff locker at Corner Grocery, east of here.",
          "Ruby and Jo made a rule: take what you need, leave the rest; every stash is locked, and its key is hidden in another building with a note that says where, so only people who read can find it.",
          "Hana, the grocery manager, gave Ruby this key on the first day of the ring.",
        ] },
        { id: "gasngo-dead1", kind: "dead", minLevel: 1, spot: 7, found: "on the left wall, in the gap between the shelves", facts: [
          "A to-do list in Dev's handwriting, from his last shift before the Fall.",
          "Mop the floor, fill the coffee, fix the ice machine.",
          "At the bottom: call Ruby back.",
          "Nothing on the list is crossed off.",
        ] },
        { id: "gasngo-dead2", kind: "decoy", minLevel: 2, spot: 4, found: "at the back, just left of the counter", facts: [
          "A note signed only \"a friend\".",
          "It says the key to the old safe room is under the mat outside the front door.",
          "There is no mat outside the front door anymore.",
          "Someone has written NOPE across the note in red marker.",
        ] },
        { id: "gasngo-dead3", kind: "dead", minLevel: 4, spot: 2, found: "between the shelves on the left, at the front end", facts: [
          "A lost-dog flyer, faded by the sun.",
          "The dog is called Peanut: brown, one white ear, afraid of thunder.",
          "Someone added by hand that Peanut used to wait by this gas station for treats.",
          "The phone number at the bottom has been torn off.",
        ] },
        { id: "gasngo-dead4", kind: "dead", minLevel: 6, spot: 6, found: "at the front right of the shop floor, against the storeroom wall", facts: [
          "The back of a long receipt, used as a message board.",
          "One line says: gone to the Water Tower, Theo has clean water.",
          "Another says: Carla at Ridge Lumber needs strong hands, ask at the gate.",
          "The last line is Dev's: Ruby, check this board every time.",
        ] },
      ],
      signs: [
        { id: "gasngo-sign1", kind: "sign", facts: ["A faded store sign: Gas-N-Go, always open.", "Someone has crossed out \"always\" and written \"not\"."] },
        { id: "gasngo-sign2", kind: "graffiti", facts: ["Ruby's big red R, with a 2 under it: she counted two walkers in here.", "Under it, smaller: don't run, walk and look."] },
        { id: "gasngo-sign3", kind: "graffiti", facts: ["By the old safe room door, a chalk circle with a small key drawn inside it.", "It means this lock's key is hidden in another building; find the note that says where."] },
        { id: "gasngo-sign4", kind: "sign", facts: ["A metal sign over the storeroom door: Staff only.", "Under it, in Dev's writing: key on the hook, you know where."] },
      ],
      key: { id: "key-gasngo", opens: "grocery", after: "gasngo-trail2", facts: ["What it looks like: a small brass key on a green plastic tag.", "Its tag says: \"Staff locker. Leave some for the next one.\""] },
    },

    /* ---------- Corner Grocery (storeSmall): Doc Lin's route begins ---------- */
    grocery: {
      notes: [
        { id: "grocery-trail1", kind: "trail", spot: 4, found: "in the front aisle, right of the middle", facts: [
          "Written by Doc Lin.",
          "Lin carries medicine from here to the pharmacy and then north to St. Anne Annex, where Nurse Ada stayed.",
          "The cooler here keeps Ada's medicine cold until Lin can carry it.",
          "Lin has not reached Ada for weeks; the road into the hills is full of walkers.",
          "Hana left a note for the next reader in the back right corner of the store.",
        ] },
        { id: "grocery-trail2", kind: "trail", spot: 2, after: "grocery-trail1", found: "in the back right corner", reveals: ["pharmacy"], facts: [
          "Written by Hana, the store manager.",
          "A key lies at the right end of the front aisle, on the floor against the right wall.",
          "It is a long silver key on a red string.",
          "It opens the narcotics safe at Mile 9 Pharmacy, west of here.",
          "Mr. Okafor gave Hana this key for the ring because she never took more than she needed.",
        ] },
        { id: "grocery-dead1", kind: "dead", minLevel: 1, spot: 3, found: "in the front aisle, near the middle", facts: [
          "A shopping list in a kid's handwriting.",
          "Peanut butter, batteries, dog food.",
          "Next to dog food a grown-up wrote: we don't have a dog.",
          "Under that, the kid wrote: yet.",
        ] },
        { id: "grocery-dead2", kind: "decoy", minLevel: 2, spot: 6, found: "on the floor near the front door, on the right", facts: [
          "A sheet of cardboard with big letters: cooler empty, don't bother.",
          "It is not signed.",
          "The letters are shaky, as if someone wrote it in a hurry to keep others away.",
          "Hana's own note on the counter says what is really in the cooler.",
        ] },
        { id: "grocery-dead3", kind: "dead", minLevel: 4, spot: 5, found: "at the left end of the middle aisle, by the left wall", facts: [
          "Hana's work schedule for the week the Fall began.",
          "Hana put her own name on every shift.",
          "The last day just says: close early, lock up, go home.",
          "Under it, newer ink: stayed anyway.",
        ] },
        { id: "grocery-dead4", kind: "dead", minLevel: 6, spot: 7, found: "in the back aisle, right of the middle", facts: [
          "Doc Lin's checklist for Nurse Ada.",
          "Bandages and cold packs are ticked off.",
          "Insulin has a question mark next to it.",
          "At the bottom: ask Jo to tell Ada I am still coming.",
        ] },
      ],
      signs: [
        { id: "grocery-sign1", kind: "sign", facts: ["A printed sign: Corner Grocery, fresh bread every morning.", "The bread rack under it is empty."] },
        { id: "grocery-sign2", kind: "graffiti", facts: ["In black marker: the loading door at the back doesn't shut.", "Under it: watch your back."] },
        { id: "grocery-sign3", kind: "sign", facts: ["A sale sign: soup, two cans for the price of one.", "Someone added: deal still stands, everything is free now."] },
        { id: "grocery-sign4", kind: "sign", facts: ["A sign on the cooler: walk-in cooler, keep the door closed.", "Under it, in Hana's writing: lift and pull."] },
      ],
      key: { id: "key-grocery", opens: "pharmacy", after: "grocery-trail2", facts: ["What it looks like: a long silver key on a red string.", "Its tag says: \"Medicine only. Count what you take.\""] },
    },

    /* ---------- Mile 9 Pharmacy (storeSmall): Lin's road north is blocked ---------- */
    pharmacy: {
      notes: [
        { id: "pharmacy-trail1", kind: "trail", spot: 7, found: "in the back aisle, right of the middle", facts: [
          "Written by Mr. Okafor.",
          "Doc Lin stops here every few days to fill her bag for Nurse Ada.",
          "Last time, Lin turned back at the hill road below St. Anne Annex; there were too many walkers.",
          "Lin plans to ride north with the River Convoy as far as St. Anne.",
          "Mr. Okafor left a second note at the left end of the middle aisle, by the left wall.",
        ] },
        { id: "pharmacy-trail2", kind: "trail", spot: 5, after: "pharmacy-trail1", found: "at the left end of the middle aisle, by the left wall", reveals: ["hardware"], facts: [
          "Written by Mr. Okafor.",
          "A key lies at the right end of the front aisle, on the floor against the right wall.",
          "It is a stubby iron key with drops of blue paint on it.",
          "It opens the paint vault at Reyes Hardware, east of here across town.",
          "Mr. Reyes cut this key himself; he keeps none of his own keys, and that is how the ring works.",
        ] },
        { id: "pharmacy-dead1", kind: "dead", minLevel: 1, spot: 3, found: "in the front aisle, near the middle", facts: [
          "A paper pharmacy bag that nobody picked up.",
          "The name on it is June.",
          "The pills inside are for sore knees.",
          "Mr. Okafor wrote on the bag: she always forgets these.",
        ] },
        { id: "pharmacy-dead2", kind: "decoy", minLevel: 2, spot: 6, found: "on the floor near the front door, on the right", facts: [
          "A yellow sticky note.",
          "It says the cabinet room code is 4417.",
          "The note is old, from before Mr. Okafor changed the code.",
          "The code on the counter note is the one that works.",
        ] },
        { id: "pharmacy-dead3", kind: "dead", minLevel: 4, spot: 4, found: "in the front aisle, right of the middle", facts: [
          "A customer comment card from the week before the Fall.",
          "It says: the line is too long.",
          "Mr. Okafor answered in red pen: then come back when it is shorter.",
          "He pinned the card up instead of throwing it away.",
        ] },
        { id: "pharmacy-dead4", kind: "decoy", minLevel: 6, spot: 2, found: "in the back right corner", facts: [
          "A torn note with a smiley face.",
          "It says the narcotics safe key is taped under the pharmacy counter.",
          "There is only an old strip of tape under the counter now.",
          "The real key left this building when the ring began.",
        ] },
      ],
      signs: [
        { id: "pharmacy-sign1", kind: "sign", facts: ["A sign over the counter: please wait to be called.", "Someone added in pen: we will call you, someday."] },
        { id: "pharmacy-sign2", kind: "graffiti", facts: ["Ruby's red R, with a 3 under it: three walkers when she counted.", "An arrow points to the back: most of them stay back there."] },
        { id: "pharmacy-sign3", kind: "sign", facts: ["A health poster: clean water saves lives.", "It says: if you can't filter it, boil it."] },
        { id: "pharmacy-sign4", kind: "sign", facts: ["A sign on the door: cabinet room, staff only.", "Under it, in neat pen: code changed, use the one on the counter note."] },
      ],
      key: { id: "key-pharmacy", opens: "hardware", after: "pharmacy-trail2", facts: ["What it looks like: a stubby iron key with drops of blue paint on it.", "Its tag says: \"Paint vault. Cut by Reyes.\""] },
    },

    /* ---------- Reyes Hardware (storeLarge): where the keys were cut ---------- */
    hardware: {
      notes: [
        { id: "hardware-trail1", kind: "trail", spot: 6, found: "near the front, by the crates on the left", facts: [
          "Written by Mr. Reyes.",
          "Ruby and Jo came to him with the idea of the key ring.",
          "He cut the first keys on the key machine in this store: fifteen keys for fifteen stashes.",
          "No key stays in the building it opens; each one waits somewhere else with a note.",
          "His other note is in the back left corner of the store.",
        ] },
        { id: "hardware-trail2", kind: "trail", spot: 3, after: "hardware-trail1", found: "in the back left corner", reveals: ["garden"], facts: [
          "Written by Mr. Reyes.",
          "A key lies in the front left corner, on the floor between the counter and the crates.",
          "It is a copper key with a leaf scratched into its head.",
          "It opens the seed vault at Greenhouse Row, far west across town.",
          "It was the very first key he cut for the ring; Rosa said a hardware store is the last place a seed thief would look.",
        ] },
        { id: "hardware-dead1", kind: "dead", minLevel: 1, spot: 4, found: "at the back wall, in the middle", facts: [
          "Mr. Reyes's list of who borrowed his tools.",
          "Carla: one long saw.",
          "Chief Dunn: two ladders.",
          "Theo: one pipe wrench, never returned, again.",
        ] },
        { id: "hardware-dead2", kind: "decoy", minLevel: 2, spot: 7, found: "near the front, on the right, by the back room wall", facts: [
          "A note in pencil, not signed.",
          "It says the paint vault key is hidden inside a can of blue paint.",
          "Many blue paint cans on the shelves have been pried open.",
          "None of them had a key inside.",
        ] },
        { id: "hardware-dead3", kind: "dead", minLevel: 4, spot: 5, found: "on the right side, between the last shelf and the right wall", facts: [
          "A crayon drawing by Mr. Reyes's grandson.",
          "It shows the store with Mr. Reyes as a giant holding a hammer.",
          "Every window in the drawing has a board nailed over it.",
          "Mr. Reyes wrote on it: he is right, we did that next.",
        ] },
        { id: "hardware-dead4", kind: "dead", minLevel: 6, spot: 2, found: "on the right wall, at the front end of the open space", facts: [
          "An order slip from Chief Dunn for the River Convoy.",
          "Rope, chains, tarps, and nails.",
          "Mr. Reyes wrote: filled, no charge.",
          "Chief Dunn wrote back: the convoy leaves when the river drops.",
        ] },
      ],
      signs: [
        { id: "hardware-sign1", kind: "sign", facts: ["A hand-painted sign: Reyes Hardware.", "Under the name: if we don't have it, you don't need it."] },
        { id: "hardware-sign2", kind: "graffiti", facts: ["Ruby's red R, with a 3 under it.", "Under it: two in the middle aisles, one by the door."] },
        { id: "hardware-sign3", kind: "sign", facts: ["A sign with an arrow: keys cut here.", "Someone drew a circle with a key inside next to the arrow, which points toward the paint vault in the back right corner."] },
        { id: "hardware-sign4", kind: "graffiti", facts: ["Written on the back room door in marker: lift, then push.", "Mr. Reyes signed it."] },
      ],
      key: { id: "key-hardware", opens: "garden", after: "hardware-trail2", facts: ["What it looks like: a copper key with a leaf scratched into its head.", "Its tag says: \"Seed vault. Seeds for anyone.\""] },
    },

    /* ---------- Greenhouse Row (utility): Rosa saw Dev, then Ruby ---------- */
    garden: {
      notes: [
        { id: "garden-trail1", kind: "trail", spot: 6, found: "on the right wall, halfway back", facts: [
          "Written by Rosa.",
          "Dev and Mr. Ortiz stopped here in a rattling truck to fill their water jugs.",
          "They were going north to the Water Tower, where Theo has clean water.",
          "The next day Ruby came asking for Dev, and Rosa told her where he went.",
          "Rosa's other note is at the back, between the crates.",
        ] },
        { id: "garden-trail2", kind: "trail", spot: 7, after: "garden-trail1", found: "at the back, between the crates", reveals: ["autoshop"], facts: [
          "Written by Rosa.",
          "A key lies in the front left corner, on the floor.",
          "It is a greasy steel key on a loop of wire.",
          "It opens the parts cage at Ortiz Auto, far east across town.",
          "Mr. Ortiz gave Rosa the key when the truck stopped here, so the ring would not break.",
        ] },
        { id: "garden-dead1", kind: "dead", minLevel: 1, spot: 5, found: "just inside the front door, on the left", facts: [
          "Rosa's planting chart.",
          "Beans by the gate, tomatoes at the back, squash where the sun hits.",
          "The beans came from seeds her old friend June gave her.",
          "At the bottom: tell June the beans came up.",
        ] },
        { id: "garden-dead2", kind: "decoy", minLevel: 2, spot: 4, found: "just inside the front door, next to the potting shed door", facts: [
          "A note from a stranger.",
          "It says the potting shed is full of canned food.",
          "There is no canned food in the shed, only seeds and water.",
          "Rosa wrote under it: seeds are food, if you wait.",
        ] },
        { id: "garden-dead3", kind: "dead", minLevel: 4, spot: 3, found: "on the left wall, toward the front", facts: [
          "Rosa's seed-sharing list.",
          "Theo took carrots for the tower.",
          "Carla took sunflowers for the lumber yard.",
          "Mrs. Greer took beans for the library window boxes.",
        ] },
        { id: "garden-dead4", kind: "decoy", minLevel: 6, spot: 2, found: "in the back right corner", facts: [
          "An old plan of the greenhouse.",
          "It shows the seed vault in the back right corner.",
          "Rosa moved the seed vault to the back left corner long ago.",
          "Nothing is in the back right corner but broken pots.",
        ] },
      ],
      signs: [
        { id: "garden-sign1", kind: "sign", facts: ["A wooden sign: Greenhouse Row, plants, seeds, soil.", "Below it: open from dawn to dusk."] },
        { id: "garden-sign2", kind: "graffiti", facts: ["Ruby's red R, with a 3 under it.", "Under it: one at the back."] },
        { id: "garden-sign3", kind: "graffiti", facts: ["A chalk circle with a key inside, and an arrow to the seed vault in the back left corner.", "Under it: the key is not here, read the notes."] },
        { id: "garden-sign4", kind: "sign", facts: ["A painted sign: potting shed, mind the step.", "A small watering can is painted next to the words."] },
      ],
      key: { id: "key-garden", opens: "autoshop", after: "garden-trail2", facts: ["What it looks like: a greasy steel key on a loop of wire.", "Its tag says: \"Parts cage. Fix something good.\""] },
    },

    /* ---------- Ortiz Auto (shop): Dev goes west; the convoy's trucks ---------- */
    autoshop: {
      notes: [
        { id: "autoshop-trail1", kind: "trail", spot: 4, found: "near the front, left of the door", facts: [
          "Written by Dev, to his sister Ruby.",
          "Dev and Mr. Ortiz fixed the truck together, and it runs.",
          "They are driving west to the Water Tower, because Theo has clean water and room for two.",
          "Dev is sorry he did not wait for her.",
          "Mr. Ortiz left a note on the right wall, a few steps in front of the office.",
        ] },
        { id: "autoshop-trail2", kind: "trail", spot: 3, after: "autoshop-trail1", found: "on the right wall, a few steps in front of the office", reveals: ["firehouse"], facts: [
          "Written by Mr. Ortiz.",
          "A key lies against the left wall, just behind the front left corner.",
          "It is a big key painted fire-engine red, on a brass ring.",
          "It opens the chief's locker at Station 12, north and west of here.",
          "Chief Dunn left it with Mr. Ortiz as thanks for fixing the convoy's trucks; it waits here for the ring.",
        ] },
        { id: "autoshop-dead1", kind: "dead", minLevel: 1, spot: 5, found: "in the front left corner", facts: [
          "Mr. Ortiz's job board.",
          "Chief Dunn's fire truck: new brakes.",
          "Sergeant Vega's van: new tires.",
          "Carla's boat motor: not done yet.",
        ] },
        { id: "autoshop-dead2", kind: "decoy", minLevel: 2, spot: 6, found: "near the front, right of the door, by the service pit wall", facts: [
          "A note on greasy paper, not signed.",
          "It says the service pit hatch is welded shut and cannot be opened.",
          "The marks on the hatch are only paint, not a weld.",
          "Mr. Ortiz's note by the office tells the real trick.",
        ] },
        { id: "autoshop-dead3", kind: "dead", minLevel: 4, spot: 2, found: "by the workbench on the left wall", facts: [
          "An old photo of Mr. Ortiz and a young mechanic in front of a tow truck.",
          "On the back: my best student, he never rushed a job.",
          "The young mechanic is Tomas's father.",
          "He has the same crooked grin as Tomas.",
        ] },
        { id: "autoshop-dead4", kind: "dead", minLevel: 6, spot: 7, found: "at the back, next to the crates in the left corner", facts: [
          "Written by Ruby, in chalk on a crate.",
          "She got here one day after Dev left.",
          "She is going west to find him.",
          "She left her red R on the wall so Dev would know she came.",
        ] },
      ],
      signs: [
        { id: "autoshop-sign1", kind: "sign", facts: ["A painted sign: Ortiz Auto, honest repairs.", "Under it is a row of greasy handprints, big and small."] },
        { id: "autoshop-sign2", kind: "graffiti", facts: ["Ruby's red R, with a 3 under it.", "Next to it: one by the crates in the back left."] },
        { id: "autoshop-sign3", kind: "sign", facts: ["A safety poster: never work under a car alone.", "Someone added: never work anywhere alone."] },
        { id: "autoshop-sign4", kind: "sign", facts: ["A metal plate: service pit, keep the hatch shut.", "Under it, a chalk arrow curls to the left."] },
      ],
      key: { id: "key-autoshop", opens: "firehouse", after: "autoshop-trail2", facts: ["What it looks like: a big key painted fire-engine red, on a brass ring.", "Its tag says: \"Chief's locker. Return the favor.\""] },
    },

    /* ---------- Signal Electronics (storeSmall): Jo and Priya, the radio ---------- */
    radioshack: {
      notes: [
        { id: "radioshack-trail1", kind: "trail", spot: 3, found: "in the front aisle, near the middle", facts: [
          "Written by Jo.",
          "Jo broadcasts on 88.1 from a rooftop downtown every night: news, warnings, and messages.",
          "Priya built Jo's first transmitter in this store, from parts on these shelves.",
          "Jo carries messages between Doc Lin and Nurse Ada, who cannot reach each other.",
          "Priya left a note at the left end of the middle aisle, by the left wall.",
        ] },
        { id: "radioshack-trail2", kind: "trail", spot: 5, after: "radioshack-trail1", found: "at the left end of the middle aisle, by the left wall", reveals: ["watertower"], facts: [
          "Written by Priya, the manager.",
          "A key lies at the right end of the front aisle, on the floor against the right wall.",
          "It is a long, thin key on a blue tag shaped like a drop of water.",
          "It opens the tool crib at the Water Tower, far west of here.",
          "Theo gave Priya the key so she and Jo could borrow tools to put an antenna on the tower; now it stays here, in the ring.",
        ] },
        { id: "radioshack-dead1", kind: "dead", minLevel: 1, spot: 4, found: "in the front aisle, right of the middle", facts: [
          "Jo's show plan, taped to a shelf.",
          "News at dusk, then music, then messages.",
          "Warnings first, always.",
          "At the bottom: no sad songs, people have enough.",
        ] },
        { id: "radioshack-dead2", kind: "decoy", minLevel: 2, spot: 7, found: "in the back aisle, right of the middle", facts: [
          "A note on a torn envelope, not signed.",
          "It says Jo's station moved to 99.5.",
          "Jo never moved; the station is still 88.1.",
          "There is only static on 99.5.",
        ] },
        { id: "radioshack-dead3", kind: "dead", minLevel: 4, spot: 6, found: "on the floor near the front door, on the right", facts: [
          "A repair tag on a fire station radio.",
          "Owner: Chief Dunn. Problem: only gets static.",
          "Priya wrote: fixed.",
          "She added: tell the convoy to stay on one channel.",
        ] },
        { id: "radioshack-dead4", kind: "dead", minLevel: 6, spot: 2, found: "in the back right corner", facts: [
          "Jo's list of voices heard on the radio.",
          "Theo at the Water Tower, Nurse Ada at St. Anne, Sergeant Vega at the precinct.",
          "One voice nobody can place, from somewhere upriver.",
          "It only ever says: we are still here.",
        ] },
      ],
      signs: [
        { id: "radioshack-sign1", kind: "sign", facts: ["A store sign: Signal Electronics.", "Under it: we fix what others throw away."] },
        { id: "radioshack-sign2", kind: "graffiti", facts: ["Ruby's red R, with a 4 under it.", "Under it: one by the counter at the back."] },
        { id: "radioshack-sign3", kind: "graffiti", facts: ["Painted in big yellow numbers: 88.1.", "Under it: Jo, every night at dusk."] },
        { id: "radioshack-sign4", kind: "sign", facts: ["A sign on the door: manager's office, please knock.", "Under it in marker: Priya says look under the register."] },
      ],
      key: { id: "key-radioshack", opens: "watertower", after: "radioshack-trail2", facts: ["What it looks like: a long, thin key on a blue tag shaped like a drop of water.", "Its tag says: \"Tool crib. Bring the wrench back.\""] },
    },

    /* ---------- Station 12 (station): Chief Dunn's convoy list ---------- */
    firehouse: {
      notes: [
        { id: "firehouse-trail1", kind: "trail", spot: 7, found: "in the truck bay, in the front right corner", facts: [
          "Written by Chief Dunn.",
          "The River Convoy will leave north along the river road: two fire trucks, Sergeant Vega's van, and Carla's boats.",
          "Mr. Ortiz fixed both trucks before he went west.",
          "The leaving day has moved three times; the river is still too high.",
          "Chief Dunn's second note is in the back office, in the back left corner.",
        ] },
        { id: "firehouse-trail2", kind: "trail", spot: 2, after: "firehouse-trail1", found: "in the back office, in the back left corner", reveals: ["radioshack"], facts: [
          "Written by Chief Dunn.",
          "A key lies in the back office, in the front left corner, against the left wall.",
          "It is a small silver key on a yellow tag shaped like a lightning bolt.",
          "It opens the repair locker at Signal Electronics, downtown, east of here.",
          "Priya left it here after she fixed the station's radios for the convoy; keys in the ring never stay home.",
        ] },
        { id: "firehouse-dead1", kind: "dead", minLevel: 1, spot: 5, found: "in the front room, by its right wall", facts: [
          "Chief Dunn's chili recipe, pinned up for the crew.",
          "Beans, more beans, and whatever is in the can.",
          "Cook it slow.",
          "At the bottom: never let Vega cook.",
        ] },
        { id: "firehouse-dead2", kind: "decoy", minLevel: 2, spot: 3, found: "in the truck bay, on the right wall", facts: [
          "A convoy notice signed by Sergeant Vega.",
          "It says: meet at the north bridge at dawn on Friday, the convoy leaves.",
          "It is the very first notice.",
          "The leaving day has been moved since then.",
        ] },
        { id: "firehouse-dead3", kind: "dead", minLevel: 4, spot: 6, found: "in the hose room, near its door", facts: [
          "A page from Chief Dunn's convoy list.",
          "Luis is crossed out: he will not leave the mall.",
          "Doc Lin wants one seat, only as far as St. Anne.",
          "Ms. Adler and her whole class are on it, with Mrs. Greer and a question mark.",
          "At the bottom: room for more, write your name.",
        ] },
        { id: "firehouse-dead4", kind: "dead", minLevel: 6, spot: 4, found: "in the hose room, in its front left corner", facts: [
          "A thank-you drawing from a school visit before the Fall.",
          "It shows a red fire truck and a dog with spots.",
          "It says: thank you Chief Dunn, from Ms. Adler's class.",
          "Chief Dunn kept it on the wall.",
        ] },
      ],
      signs: [
        { id: "firehouse-sign1", kind: "sign", facts: ["A big sign on the wall: truck bay, keep clear."] },
        { id: "firehouse-sign2", kind: "sign", facts: ["A safety board: days without an accident.", "The number is wiped off; someone wrote: we stopped counting."] },
        { id: "firehouse-sign3", kind: "graffiti", facts: ["Ruby's red R, with a 4 under it.", "Under it: one in the truck bay."] },
        { id: "firehouse-sign4", kind: "graffiti", facts: ["Chalked by the equipment bay door: red key, on the board."] },
      ],
      key: { id: "key-firehouse", opens: "radioshack", after: "firehouse-trail2", facts: ["What it looks like: a small silver key on a yellow tag shaped like a lightning bolt.", "Its tag says: \"Repair locker. Fix it, don't toss it.\""] },
    },

    /* ---------- 4th Precinct (station): Vega plans the convoy ---------- */
    police: {
      notes: [
        { id: "police-trail1", kind: "trail", spot: 5, found: "in the front room, by its right wall", facts: [
          "Written by Sergeant Vega.",
          "The River Convoy is real: trucks and boats going north along the river road, away from the crowds.",
          "It keeps getting delayed: the river is too high, and the trucks need parts.",
          "Vega asks everyone who wants to come to sign up with Chief Dunn at Station 12.",
          "Vega's next note is in the squad room, through the door behind the desk, in the back left corner.",
        ] },
        { id: "police-trail2", kind: "trail", spot: 2, after: "police-trail1", found: "in the squad room, in the back left corner", reveals: ["lumberyard"], facts: [
          "Written by Sergeant Vega.",
          "A key lies in the squad room, in the front left corner, against the left wall.",
          "It is a padlock key on a loop of orange rope.",
          "It opens the foreman's lockbox at Ridge Lumber, east of here on the ridge.",
          "Carla is building boats for the convoy; she gave Vega this key so the ring stays whole.",
        ] },
        { id: "police-dead1", kind: "dead", minLevel: 1, spot: 7, found: "in the garage room, in the front right corner", facts: [
          "The lost-and-found list from the front desk.",
          "One bike, one trumpet, one dog leash with no dog.",
          "Someone added at the bottom: one town.",
        ] },
        { id: "police-dead2", kind: "decoy", minLevel: 2, spot: 3, found: "in the garage room, on the right wall", facts: [
          "A scrap of paper with numbers on it.",
          "It says the armory combination is 33-4-19.",
          "Those are the right numbers in the wrong order.",
          "The note on the front desk has the one that works.",
        ] },
        { id: "police-dead3", kind: "dead", minLevel: 4, spot: 4, found: "in the cell room, in its front left corner", facts: [
          "A letter Sergeant Vega never sent.",
          "It is to Vega's brother, who lives upriver.",
          "It says: hold on, we are coming up the river road.",
          "It ends: the convoy is late, but it is coming.",
        ] },
        { id: "police-dead4", kind: "dead", minLevel: 6, spot: 6, found: "in the cell room, near its door", facts: [
          "Written by Max and Mia.",
          "They asked the police to help them find Ms. Adler's class.",
          "They last saw the class at Lincoln Middle School.",
          "Sergeant Vega wrote under it: I will look.",
        ] },
      ],
      signs: [
        { id: "police-sign1", kind: "graffiti", facts: ["Ruby's red R, with a 5 under it.", "Under it: one big one in the garage, don't get cornered."] },
        { id: "police-sign2", kind: "sign", facts: ["The old wanted board is covered with missing-person notes.", "One says: Ms. Adler's class, Lincoln Middle School."] },
        { id: "police-sign3", kind: "sign", facts: ["A printed notice: River Convoy sign-up at Station 12.", "It says: ask for Chief Dunn."] },
        { id: "police-sign4", kind: "sign", facts: ["A sign on the door: armory, police only.", "Under it in marker: combination changed, see the front desk."] },
      ],
      key: { id: "key-police", opens: "lumberyard", after: "police-trail2", facts: ["What it looks like: a padlock key on a loop of orange rope.", "Its tag says: \"Foreman's lockbox. Knock first.\""] },
    },

    /* ---------- Lincoln Middle School (school): the class leaves ---------- */
    school: {
      notes: [
        { id: "school-trail1", kind: "trail", spot: 6, found: "just inside the front door, in the entry", facts: [
          "Written by Ms. Adler, to Max and Mia.",
          "The class has gone north to the Public Library, where Mrs. Greer will take them in.",
          "Every student is safe and counted, except the two of them.",
          "Ms. Adler will come back to check whenever she can.",
          "Sergeant Vega came looking for the class and left a note in the back right classroom, in its back right corner.",
        ] },
        { id: "school-trail2", kind: "trail", spot: 2, after: "school-trail1", found: "in the back right classroom, in its back right corner", reveals: ["police"], facts: [
          "Written by Sergeant Vega.",
          "A key lies in the back left classroom, against the left wall near the back.",
          "It is a short steel key on a gray tag.",
          "It opens the evidence locker at the 4th Precinct, west of here.",
          "Vega came for the class because Max and Mia asked, found the school empty, and left this key for the ring.",
        ] },
        { id: "school-dead1", kind: "dead", minLevel: 1, spot: 3, found: "at the left end of the long hallway", facts: [
          "The lunch menu for the week the Fall began.",
          "Pizza on Friday.",
          "Someone wrote under it: we never got the pizza.",
        ] },
        { id: "school-dead2", kind: "decoy", minLevel: 2, spot: 7, found: "in the middle of the back right classroom", facts: [
          "A fire drill map.",
          "It says: if the alarm rings, everyone meets on the sports field.",
          "The class did not go to the field.",
          "Ms. Adler's note by the front door says where they really went.",
        ] },
        { id: "school-dead3", kind: "dead", minLevel: 4, spot: 4, found: "at the right end of the long hallway", facts: [
          "Written by Max and Mia.",
          "They came back to the school and found Ms. Adler's note.",
          "They had looked for the class as far west as the Water Tower, where Theo gave them water.",
          "They will go north to the library at first light.",
        ] },
        { id: "school-dead4", kind: "decoy", minLevel: 6, spot: 5, found: "in the bottom left room, in its front right corner", facts: [
          "A note from the principal, from before the Fall.",
          "It says the principal's closet key hangs on the hook behind the office door.",
          "The hook is empty.",
          "Mia took the key from that hook on the day of the Fall.",
        ] },
      ],
      signs: [
        { id: "school-sign1", kind: "sign", facts: ["A classroom poster: raise your hand, be kind, read every day.", "Someone added in marker: stay together."] },
        { id: "school-sign2", kind: "graffiti", facts: ["Ruby's red R, with a 4 under it.", "Under it: one in the hallway."] },
        { id: "school-sign3", kind: "graffiti", facts: ["In neat chalk letters: Ms. Adler's class, gone north.", "Under it: read the note by the front door."] },
        { id: "school-sign4", kind: "sign", facts: ["A sign on the door: library closet, return books on time.", "Someone added: late fees canceled."] },
      ],
      key: { id: "key-school", opens: "police", after: "school-trail2", facts: ["What it looks like: a short steel key on a gray tag.", "Its tag says: \"Evidence. Do not remove.\" The words \"do not\" are crossed out."] },
    },

    /* ---------- St. Anne Annex (hospital): Ada waits for Lin ---------- */
    hospital: {
      notes: [
        { id: "hospital-trail1", kind: "trail", spot: 4, found: "at the right end of the main hall", facts: [
          "Written by Nurse Ada.",
          "She stayed to keep the generator running for the records and the cold medicine.",
          "Every night she listens to Jo on 88.1 for word from Doc Lin.",
          "Jo says Lin will come up with the River Convoy, but the convoy is late again.",
          "Ada's next note is in the top right room, in its back right corner.",
        ] },
        { id: "hospital-trail2", kind: "trail", spot: 2, after: "hospital-trail1", found: "in the top right room, in its back right corner", reveals: ["gasngo"], facts: [
          "Written by Nurse Ada.",
          "A key lies in the second room from the left along the top, in its back right corner.",
          "It is a heavy old iron key with a square head.",
          "It opens the old safe room at Gas-N-Go, south of here near the south end of town.",
          "Ruby brought it up here on her first scouting run north, so the ring would close into a circle.",
        ] },
        { id: "hospital-dead1", kind: "dead", minLevel: 1, spot: 7, found: "in the room by the entrance, in the right corner by the door", facts: [
          "A visitor sign-in sheet from before the Fall.",
          "The last name on it is Doc Lin.",
          "Next to her name she wrote: back tomorrow.",
        ] },
        { id: "hospital-dead2", kind: "decoy", minLevel: 2, spot: 3, found: "at the left end of the main hall", facts: [
          "A printed notice.",
          "It says a bus takes patients out of town from the front door every morning.",
          "The notice is from the first week of the Fall.",
          "No bus has come since then.",
        ] },
        { id: "hospital-dead3", kind: "dead", minLevel: 4, spot: 5, found: "in the bottom left room, in its front right corner", facts: [
          "Nurse Ada's generator log.",
          "Most days she writes the same two words: still running.",
          "One day says: Jo says Lin is close.",
          "That night Ada ran the generator one hour longer, to keep the front lights on.",
        ] },
        { id: "hospital-dead4", kind: "decoy", minLevel: 6, spot: 6, found: "in the second room from the left along the bottom, in its front right corner", facts: [
          "An old staff memo.",
          "It says the supply cupboard key hangs on the hook by the nurses' station.",
          "The hook is empty.",
          "That key left the building when the ring began.",
        ] },
      ],
      signs: [
        { id: "hospital-sign1", kind: "sign", facts: ["A sign: quiet zone, patients resting.", "Under it, in Ada's tidy writing: they follow sound, not light."] },
        { id: "hospital-sign2", kind: "graffiti", facts: ["Ruby's red R, with a 6 under it.", "Under it: they stand in the dark rooms, look before you step in."] },
        { id: "hospital-sign3", kind: "sign", facts: ["A hospital map: wards along the top hall.", "The supply cupboard is marked in the top left room."] },
        { id: "hospital-sign4", kind: "graffiti", facts: ["Chalked by the stock room door, in Ada's writing: Lin, it is all still here."] },
      ],
      key: { id: "key-hospital", opens: "gasngo", after: "hospital-trail2", facts: ["What it looks like: a heavy old iron key with a square head.", "Its tag says: \"Old safe room. Ruby was here.\""] },
    },

    /* ---------- Water Tower (utility): Dev is safe with Theo ---------- */
    watertower: {
      notes: [
        { id: "watertower-trail1", kind: "trail", spot: 3, found: "on the left wall, toward the front", facts: [
          "Written by Dev, to Ruby.",
          "Dev is safe; Theo lets him and Mr. Ortiz sleep up in the tower.",
          "They help Theo keep the pumps running.",
          "If Dev is out on a run when Ruby comes, she should wait here.",
          "Theo left a note for travelers at the back, between the crates.",
        ] },
        { id: "watertower-trail2", kind: "trail", spot: 7, after: "watertower-trail1", found: "at the back, between the crates", reveals: ["school"], facts: [
          "Written by Theo.",
          "A key lies in the front left corner, on the floor.",
          "It is a small brass key on a purple school lanyard.",
          "It opens the principal's closet at Lincoln Middle School, far east of here across town.",
          "Max and Mia came here looking for their teacher; Mia had the key, and they left it with Theo for the ring.",
        ] },
        { id: "watertower-dead1", kind: "dead", minLevel: 1, spot: 5, found: "just inside the front door, on the left", facts: [
          "Theo's water rules, on a card.",
          "One jug per person each day.",
          "Kids get two.",
          "Nobody leaves thirsty.",
        ] },
        { id: "watertower-dead2", kind: "decoy", minLevel: 2, spot: 6, found: "on the right wall, halfway back", facts: [
          "A note on a paper plate, not signed.",
          "It says the river water is clean now and safe to drink.",
          "It is not clean.",
          "Theo crossed it out and wrote: filter everything.",
        ] },
        { id: "watertower-dead3", kind: "dead", minLevel: 4, spot: 4, found: "just inside the front door, next to the pump house door", facts: [
          "Written by Mr. Ortiz.",
          "He is teaching Dev to rebuild the old pump motor.",
          "They still need a belt and a gasket.",
          "He wrote: the boy has good hands, like Tomas's father.",
        ] },
        { id: "watertower-dead4", kind: "dead", minLevel: 6, spot: 2, found: "in the back right corner", facts: [
          "A sketch by Jo of a radio antenna on top of the tower.",
          "Jo wrote: from up here, 88.1 would reach the whole valley.",
          "Theo wrote under it: fine, but you climb it, not me.",
        ] },
      ],
      signs: [
        { id: "watertower-sign1", kind: "sign", facts: ["A city sign: water works, staff only.", "Below it: danger, pumps start without warning."] },
        { id: "watertower-sign2", kind: "graffiti", facts: ["In big chalk letters: Ruby, I am here.", "It is signed with a D."] },
        { id: "watertower-sign3", kind: "graffiti", facts: ["A chalk circle with a key inside, and an arrow to the tool crib in the back left corner.", "Under it: the key is not here, read the notes."] },
        { id: "watertower-sign4", kind: "sign", facts: ["A sign on the door: pump house, keep locked.", "Next to it, a small sign: breaker box, danger."] },
      ],
      key: { id: "key-watertower", opens: "school", after: "watertower-trail2", facts: ["What it looks like: a small brass key on a purple school lanyard.", "Its tag says: \"Principal's closet. Go Lions.\""] },
    },

    /* ---------- Ridge Lumber (storeLarge): Carla builds the boats ---------- */
    lumberyard: {
      notes: [
        { id: "lumberyard-trail1", kind: "trail", spot: 6, found: "near the front, by the crates on the left", facts: [
          "Written by Carla, the yard boss.",
          "Her crew is building flat boats for the River Convoy from the yard's best planks.",
          "Sergeant Vega comes by every week to check the boats.",
          "The river is still too high to launch them.",
          "Carla's other note is at the back wall, in the middle.",
        ] },
        { id: "lumberyard-trail2", kind: "trail", spot: 4, after: "lumberyard-trail1", found: "at the back wall, in the middle", reveals: ["library"], facts: [
          "Written by Carla.",
          "A key lies in the front left corner, on the floor between the counter and the crates.",
          "It is a long, old-fashioned key with a round loop for a handle, tied to a paper bookmark.",
          "It opens the rare book room at the Public Library, north and west of here.",
          "Mrs. Greer paid for planks to board the library windows with this key, so it lives here now, in the ring.",
        ] },
        { id: "lumberyard-dead1", kind: "dead", minLevel: 1, spot: 3, found: "in the back left corner", facts: [
          "Carla's yard rules.",
          "Wear boots. Lift with your legs. Never run the saws.",
          "A new rule, added in a different pen: if you hear the dock crowd, freeze.",
        ] },
        { id: "lumberyard-dead2", kind: "decoy", minLevel: 2, spot: 7, found: "near the front, on the right, by the kiln shed wall", facts: [
          "A note on the back of a receipt, written in a hurry.",
          "It says the kiln shed code is 2281.",
          "That code is wrong; two numbers are swapped.",
          "Carla's clipboard has the right code.",
        ] },
        { id: "lumberyard-dead3", kind: "dead", minLevel: 4, spot: 5, found: "on the right side, between the last shelf and the right wall", facts: [
          "Carla's sketch of a flat boat.",
          "Each boat holds ten people and their bags.",
          "The convoy needs four boats.",
          "Two are done.",
        ] },
        { id: "lumberyard-dead4", kind: "decoy", minLevel: 6, spot: 2, found: "on the right wall, at the front end of the open space", facts: [
          "A note signed with a smiley face.",
          "It says the loading dock is empty and the best wood is waiting there.",
          "It is a prank: the walkers gather by the loading dock.",
          "Ruby's note on the gate says the same.",
        ] },
      ],
      signs: [
        { id: "lumberyard-sign1", kind: "sign", facts: ["A big painted sign: Ridge Lumber, cut to order."] },
        { id: "lumberyard-sign2", kind: "graffiti", facts: ["Ruby's red R, with a 5 under it.", "Under it: they gather at the dock, stay away."] },
        { id: "lumberyard-sign3", kind: "sign", facts: ["A safety sign: ear protection needed near the saws.", "Carla added in marker: the saws stay off."] },
        { id: "lumberyard-sign4", kind: "graffiti", facts: ["Spray-painted on the kiln shed door: code on the clipboard."] },
      ],
      key: { id: "key-lumberyard", opens: "library", after: "lumberyard-trail2", facts: ["What it looks like: a long, old-fashioned key with a round loop for a handle, tied to a paper bookmark.", "Its bookmark tag says: \"Rare books. Handle with care.\""] },
    },

    /* ---------- Northgate Mall (storeLarge): Luis holds his post ---------- */
    mall: {
      notes: [
        { id: "mall-trail1", kind: "trail", spot: 7, found: "near the front, on the right, by the security office wall", facts: [
          "Written by Luis, the security guard.",
          "Luis has stayed at his post since the Fall began.",
          "The crowd here walks the same slow loop every day.",
          "Sergeant Vega asked him to join the River Convoy; he said no, someone has to watch the mall.",
          "Luis's other note is in the back left corner.",
        ] },
        { id: "mall-trail2", kind: "trail", spot: 3, after: "mall-trail1", found: "in the back left corner", reveals: ["hospital"], facts: [
          "Written by Luis.",
          "A key lies in the front left corner, on the floor between the counter and the crates.",
          "It is a small silver key on a white tag with a red cross.",
          "It opens the supply cupboard at St. Anne Annex, far west of here in the north hills.",
          "Doc Lin left it with Luis for the ring on a medicine run, because Nurse Ada wants the cupboard used, not saved.",
        ] },
        { id: "mall-dead1", kind: "dead", minLevel: 1, spot: 6, found: "near the front, by the crates on the left", facts: [
          "Luis's patrol log.",
          "Most days say the same thing: crowd quiet, nobody running, doors held.",
          "One day says: Jo came by with batteries and stayed for coffee.",
        ] },
        { id: "mall-dead2", kind: "decoy", minLevel: 2, spot: 4, found: "at the back wall, in the middle", facts: [
          "A note in pencil, not signed.",
          "It says the security office code is 0921.",
          "That code is wrong; the last two numbers are swapped.",
          "Luis's clipboard has the right code.",
        ] },
        { id: "mall-dead3", kind: "dead", minLevel: 4, spot: 5, found: "on the right side, between the last shelf and the right wall", facts: [
          "A letter to Luis from his niece, carried here by Jo.",
          "She is safe at the Public Library with Ms. Adler's class.",
          "She says Mrs. Greer makes everyone read every day.",
          "She asks him to come; on the back Luis wrote: not yet.",
        ] },
        { id: "mall-dead4", kind: "decoy", minLevel: 6, spot: 2, found: "on the right wall, at the front end of the open space", facts: [
          "A note scrawled on a shopping bag.",
          "It says to run straight through the middle, because the crowd is too slow to catch you.",
          "That is wrong: the crowd here runs at anyone who runs.",
          "Luis wrote across it in big letters: no, walk.",
        ] },
      ],
      signs: [
        { id: "mall-sign1", kind: "sign", facts: ["A banner: Northgate Mall, something for everyone."] },
        { id: "mall-sign2", kind: "graffiti", facts: ["Ruby's red R, with a 6 under it.", "Under it, in huge letters: don't run."] },
        { id: "mall-sign3", kind: "sign", facts: ["A store map on the wall.", "The jewelry vault is marked in the back right corner."] },
        { id: "mall-sign4", kind: "sign", facts: ["A sign on the door: security, staff only.", "Under it in marker: code by the paint display."] },
      ],
      key: { id: "key-mall", opens: "hospital", after: "mall-trail2", facts: ["What it looks like: a small silver key on a white tag with a red cross.", "Its tag says: \"Supply cupboard. Ada says use it.\""] },
    },

    /* ---------- Public Library (school): the class is safe ---------- */
    library: {
      notes: [
        { id: "library-trail1", kind: "trail", spot: 4, found: "at the right end of the main hall", facts: [
          "Written by Mrs. Greer.",
          "Ms. Adler's class lives here now; they read by window light and keep quiet.",
          "Ms. Adler still watches the front door for the twins, Max and Mia.",
          "Mrs. Greer's other note is in the back right reading room, in its back right corner.",
        ] },
        { id: "library-trail2", kind: "trail", spot: 2, after: "library-trail1", found: "in the back right reading room, in its back right corner", reveals: ["mall"], facts: [
          "Written by Mrs. Greer.",
          "A key lies in the back left reading room, against the left wall near the back.",
          "It is a tiny gold key in a small velvet pouch.",
          "It opens the jewelry vault at Northgate Mall, east of here.",
          "Luis the guard sent it with Jo and asked Mrs. Greer to keep it for the ring.",
        ] },
        { id: "library-dead1", kind: "dead", minLevel: 1, spot: 3, found: "at the left end of the main hall", facts: [
          "The class reading chart.",
          "Each student gets a star for every book they finish.",
          "Two names have no stars yet: Max and Mia.",
          "Next to them someone wrote: saving their stars.",
        ] },
        { id: "library-dead2", kind: "decoy", minLevel: 2, spot: 6, found: "just inside the front door, in the entry", facts: [
          "A note on an index card, not signed.",
          "It says the archive room key is in the card catalog, in the drawer marked A.",
          "The drawers hold only old cards.",
          "Mrs. Greer's note on the desk says where the key really is.",
        ] },
        { id: "library-dead3", kind: "dead", minLevel: 4, spot: 5, found: "in the bottom left room, in its front right corner", facts: [
          "Mrs. Greer's shelter rules.",
          "Whisper. Read. Take turns at the window.",
          "Books nobody wants go on the walls.",
          "Never run in the library, not ever.",
        ] },
        { id: "library-dead4", kind: "decoy", minLevel: 6, spot: 7, found: "in the middle of the back right reading room", facts: [
          "A flyer, not signed.",
          "It says the River Convoy already left and anyone still here missed it.",
          "It is not true.",
          "Ms. Adler wrote on it: Jo says on the radio that the convoy is late again.",
        ] },
      ],
      signs: [
        { id: "library-sign1", kind: "sign", facts: ["A sign: quiet, please.", "Under it in pencil: it works on walkers too."] },
        { id: "library-sign2", kind: "graffiti", facts: ["Ruby's red R, with a 5 under it, painted very small.", "It looks as if she felt bad writing on a library wall."] },
        { id: "library-sign3", kind: "sign", facts: ["A sign: library hours, dawn until dark.", "Below it: no candles near the books."] },
        { id: "library-sign4", kind: "graffiti", facts: ["Chalked by the archive door: ask the dictionary."] },
      ],
      key: { id: "key-library", opens: "mall", after: "library-trail2", facts: ["What it looks like: a tiny gold key in a small velvet pouch.", "Its tag says: \"Jewelry vault. Not for jewelry.\""] },
    },
  };
  Object.entries(STORY).forEach(([id, s]) => {
    const N = W.NOTES[id];
    N.notes = N.notes.concat(s.notes);
    N.signs = s.signs;
    N.key = s.key;
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
