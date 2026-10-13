/* Story facts for home: June's journal, the radio, item tags, and the signs on the yard lots.
   The words at six reading levels live in js/content/. See docs/STORY.md. Loaded after js/world.js. */
(function (root) {
  "use strict";
  const W = root.ZSR.WORLD;

  /* June's journal: entry 1 is Day 1 (the night the crew finds the cabin), then one per day.
     After entry 30 the game repeats entries 21 to 30, so those ten stand on their own. */
  W.JOURNAL = [
    { id: "journal-1", facts: [
      "June writes this first entry in her green ledger by candlelight.",
      "The van rolled into the yard on its last drops of fuel, with Tomas talking to the engine the whole way.",
      "The cabin at the south end of town was empty and dry, with a woodstove and a door that still locks.",
      "Pip fell asleep on the bench before the bags were inside.",
      "You took the first watch at the window, and nothing came.",
    ] },
    { id: "journal-2", facts: [
      "In daylight the cabin is small, but the roof is sound.",
      "An old fence circles the yard, and some of its boards are loose.",
      "The dirt behind the cabin is dark and good, and June noticed it first.",
      "June wrote the first rule on the inside of the door: say where you are going before you go.",
    ] },
    { id: "journal-3", facts: [
      "Tomas spent the morning under the van and came out smiling.",
      "He says the van is old but honest, like a good mule.",
      "You drove out to look for supplies, and June watched the road until the van came back.",
      "Pip counted the minutes you were gone and wrote the number on the wall.",
    ] },
    { id: "journal-4", facts: [
      "The first walkers came to the fence at dusk.",
      "They came in a group, pushed at the boards, and then the yard went quiet for a while.",
      "June learned that they come in waves, with calm in between.",
      "A new rule went on the door: no shouting in the yard, because walkers follow sound.",
    ] },
    { id: "journal-5", facts: [
      "Pip asked where everyone in town went.",
      "June said some people left, some people hid, and some people are still out there helping each other.",
      "Pip asked if they could keep a dog if they found one.",
      "June said a dog would need to eat too, and Pip said a dog would also need a name.",
    ] },
    { id: "journal-6", facts: [
      "The days have a rhythm now: drive out, come home, hold the fence.",
      "A hole in the fence does not close by itself, so someone has to patch it with scrap.",
      "June made it a rule: patch the fence before supper.",
      "Supper was beans again, and nobody complained out loud.",
    ] },
    { id: "journal-7", facts: [
      "Before the Fall, June was the gardener at a school.",
      "She wants raised beds behind the cabin, with beans, squash and tomatoes.",
      "Her old friend Rosa ran the greenhouses at Greenhouse Row, west of the gas station.",
      "June says that if anyone still has seeds, it is Rosa.",
    ] },
    { id: "journal-8", facts: [
      "There is talk of a scout named Ruby who paints a red R on buildings.",
      "Next to the R she writes how many walkers she saw inside.",
      "Pip practiced painting the R on a board, with a number next to it.",
      "June says a stranger who leaves warnings for other strangers is a good sign.",
    ] },
    { id: "journal-9", facts: [
      "Tomas's father was a mechanic who learned the trade from Mr. Ortiz at Ortiz Auto.",
      "Tomas learned it from his father, under cars, handing over wrenches.",
      "He fixed the van's loose mirror with wire and stubbornness.",
      "He hopes Mr. Ortiz is still out there somewhere.",
    ] },
    { id: "journal-10", facts: [
      "It rained all day, and the roof leaked in two spots.",
      "The crew put pots under the drips and played cards by the stove.",
      "Pip won every game and would not explain how.",
      "June says a rainy day with everyone inside is a good day.",
    ] },
    { id: "journal-11", facts: [
      "Pip found an old radio dial in a drawer and turned it for an hour.",
      "There was only static, but Pip is sure there are voices out there.",
      "People say someone named Jo talks on the radio from a rooftop.",
      "Pip has started a list of every voice the crew hears, and the first name on it is June.",
    ] },
    { id: "journal-12", facts: [
      "June remembered her school garden and the kids who planted sunflowers by the fence.",
      "She taught them to plant a seed one finger deep and to water it every day.",
      "She wonders where those kids are now.",
      "She hopes they remember the sunflowers.",
    ] },
    { id: "journal-13", facts: [
      "June counts the food every night and writes the number in the ledger.",
      "Every trip in the van eats food, and a hungry crew makes a weak van.",
      "The rule is that everyone eats the same, even when there is not much.",
      "Tomas gave Pip half his bread anyway, and June pretended not to see.",
    ] },
    { id: "journal-14", facts: [
      "There is talk of the River Convoy, a line of boats and trucks.",
      "A police sergeant named Vega is getting it ready to leave north along the river road.",
      "Tomas wants to see if the van could make the trip.",
      "June is not sure she wants to leave the cabin.",
    ] },
    { id: "journal-15", facts: [
      "Tomas fixed the squeaky cabin door with a strip of wire and some cooking oil.",
      "June says he would fix the moon if someone handed him a ladder.",
      "Pip asked if the moon was broken.",
      "June wrote that they have lasted half a month at the cabin, which is longer than anyone guessed.",
    ] },
    { id: "journal-16", facts: [
      "Last night was the hardest night yet.",
      "Walkers came at the fence from every side, and the boards cracked.",
      "Everyone stayed in place, and the fence held until morning.",
      "Pip slept in the closet with a pot on their head and called it a helmet.",
    ] },
    { id: "journal-17", facts: [
      "There is talk of a doctor named Doc Lin who carries medicine around town.",
      "Doc Lin goes between the grocery, the pharmacy and the hospital.",
      "A nurse named Ada stayed at the hospital, St. Anne Annex, to keep the generator running.",
      "June says people like that are the reason the town is not gone.",
    ] },
    { id: "journal-18", facts: [
      "This morning there was frost on the van's windshield.",
      "Tomas scraped it off with an old library card.",
      "June says cold mornings mean the crew needs blankets before it needs anything else.",
      "Pip drew a dog in the frost on the window.",
    ] },
    { id: "journal-19", facts: [
      "There is a story about a teacher, Ms. Adler, who led her whole class out of Lincoln Middle School.",
      "People say she took them to the Public Library.",
      "Two of her students, twins named Max and Mia, got separated from the class.",
      "June says a good teacher counts heads every hour, and she hopes Ms. Adler is still counting.",
    ] },
    { id: "journal-20", facts: [
      "Pip asked if the world is ever going to come back.",
      "June said some of it will, the parts people carry with them.",
      "Pip asked which parts the crew is carrying.",
      "June said the rules on the door, the seeds, and each other.",
    ] },
    { id: "journal-21", facts: [
      "June read the rules on the door out loud after supper.",
      "Say where you go. No shouting in the yard. Patch the fence before supper. Everyone eats the same.",
      "Pip wants to add a rule: take what you need, leave the rest.",
      "June says that one is the town's rule, and it is a good one, so it goes on the door too.",
    ] },
    { id: "journal-22", facts: [
      "Pip keeps asking about Ruby and her younger brother, Dev.",
      "People say Ruby is looking for Dev, and Dev leaves messages for her.",
      "Pip says if they keep leaving messages, they will find each other.",
      "June did not argue.",
    ] },
    { id: "journal-23", facts: [
      "Tomas is teaching Pip to listen to the van's engine.",
      "A tick means one thing, a knock means another, and a squeal means stop right now.",
      "Pip now says hello to the van every morning.",
      "Tomas says the van likes it.",
    ] },
    { id: "journal-24", facts: [
      "June's knees ache on cold mornings.",
      "She showed Pip how to keep the ledger, just in case her hands get stiff.",
      "Pip's writing is big and messy, and June says that is fine.",
      "A ledger only has to be honest, not neat.",
    ] },
    { id: "journal-25", facts: [
      "A dog barked somewhere past the trees last night.",
      "Pip stood at the window for an hour, listening.",
      "Tomas said a dog that survived this long is smart enough to find the crew if it wants to.",
      "Pip left a bowl of water by the gate, just in case.",
    ] },
    { id: "journal-26", facts: [
      "The wind came hard from the north and rattled the windows all night.",
      "Nobody could sleep, so the crew told stories by the stove.",
      "Tomas told one about his father's garage, and June told one about her school garden.",
      "Pip told one about a dog that drives a van.",
    ] },
    { id: "journal-27", facts: [
      "June thinks about her old students when she writes.",
      "If any of them made it, maybe they are in the library with the others.",
      "She says it helps to picture them reading by the window.",
      "Then she gets up and does the next job.",
    ] },
    { id: "journal-28", facts: [
      "Tomas says the van could make it up the river road if the convoy ever leaves.",
      "June asked the crew what they want.",
      "Pip said a dog, Tomas said a garage, and June said a garden.",
      "They agreed that the cabin is home for now.",
    ] },
    { id: "journal-29", facts: [
      "A quiet day: sun on the yard, wind in the trees, no walkers at the fence for hours.",
      "June sat on the step and wrote slowly.",
      "Tomas whistled under the van, and Pip practiced knots on the fence rope.",
      "June says quiet days are not wasted; they are how you get ready for loud ones.",
    ] },
    { id: "journal-30", facts: [
      "June read the ledger back from the first page to the crew.",
      "They found the cabin, kept it, and kept each other.",
      "Tomorrow is the same work: the van, the fence, the food, the rules on the door.",
      "June wrote at the bottom of the page: we are still here, and that is a lot.",
    ] },
  ];

  /* The radio: one broadcast per day home once the Radio room is built.
     After broadcast 30 the game repeats broadcasts 21 to 30.
     Key-ring tips (true, checked against KEYS and LOCATIONS): 3, 7, 10, 14, 18, 21, 23, 26. */
  W.RADIO = [
    { id: "radio-1", voice: "Jo", facts: [
      "This is Jo on 88.1, talking from a rooftop downtown.",
      "Every day Jo reads out news, warnings and tips for anyone still listening.",
      "The town's rule: take what you need, leave the rest.",
      "Pip wrote Jo's name on the list of voices.",
    ] },
    { id: "radio-2", voice: "Jo", facts: [
      "Jo explains the key ring.",
      "The best supplies in each building are locked in a stash, so people who smash and grab cannot take them.",
      "The key to each stash is hidden in a different building, with a note that says where.",
      "Ruby and Jo started the key ring, and Mr. Reyes from Reyes Hardware cut the first keys.",
      "Only people who read the notes find the keys.",
    ] },
    { id: "radio-3", voice: "Jo", facts: [
      "Jo gives a key ring tip.",
      "The key hidden at Gas-N-Go opens the staff locker at Corner Grocery.",
      "The notes inside Gas-N-Go tell where the key is.",
    ] },
    { id: "radio-4", voice: "Jo", facts: [
      "Jo reads a message from Ruby, the scout who paints the red R.",
      "Ruby is looking for her younger brother, Dev, who worked at Gas-N-Go.",
      "If you see Dev, tell him Ruby is still looking.",
      "The number next to Ruby's red R is how many walkers she saw inside.",
    ] },
    { id: "radio-5", voice: "Jo", facts: [
      "Jo passes on a message from Doc Lin to Nurse Ada at St. Anne Annex: hold on, I am coming.",
      "Jo warns that St. Anne Annex is the most dangerous place in town.",
      "The walkers there follow sound more than light, so move quietly inside.",
    ] },
    { id: "radio-6", voice: "Sergeant Vega", facts: [
      "Sergeant Vega speaks from the 4th Precinct.",
      "Vega is organizing the River Convoy, boats and trucks that will leave north along the river road.",
      "The plan is to leave in about ten days.",
      "The convoy needs fuel, boats, and drivers who can stay calm.",
    ] },
    { id: "radio-7", voice: "Doc Lin", facts: [
      "Doc Lin borrows Jo's microphone to give a key ring tip.",
      "The key hidden at Corner Grocery opens the narcotics safe at Mile 9 Pharmacy.",
      "Doc Lin asks people to take only the medicine they need from that safe.",
    ] },
    { id: "radio-8", voice: "Jo", facts: [
      "Jo reads a message from twins named Max and Mia.",
      "They got separated from their class at Lincoln Middle School.",
      "They are looking for their teacher, Ms. Adler.",
      "Anyone who has seen Ms. Adler's class should leave a note at the school.",
    ] },
    { id: "radio-9", voice: "Jo", facts: [
      "Jo warns about Northgate Mall.",
      "The walkers there move in a group and come running at anyone who runs.",
      "Walk, do not run, and most of them stay put.",
      "That tip comes from Luis, the mall guard who never left his post.",
    ] },
    { id: "radio-10", voice: "Jo", facts: [
      "Jo gives a key ring tip, with thanks to Mr. Reyes.",
      "The key hidden at Reyes Hardware opens the seed vault at Greenhouse Row.",
      "Rosa says to take seeds, plant them, and save some seeds for the next person.",
    ] },
    { id: "radio-11", voice: "Nurse Ada", facts: [
      "Nurse Ada speaks from St. Anne Annex, calm and exact.",
      "She stayed to keep the generator running and the records safe.",
      "Nurse Ada heard Doc Lin's message and says she is still waiting.",
      "She asks anyone who comes to the hospital to walk softly.",
    ] },
    { id: "radio-12", voice: "Mrs. Greer", facts: [
      "Mrs. Greer, the librarian, speaks from the Public Library.",
      "Ms. Adler and her class are safe at the library.",
      "The students read by window light every afternoon.",
      "Mrs. Greer says Max and Mia should come to the library, because their teacher is there.",
    ] },
    { id: "radio-13", voice: "Chief Dunn", facts: [
      "Chief Dunn speaks from Station 12, the fire station.",
      "He works with Sergeant Vega on the River Convoy and keeps the lists.",
      "The convoy is delayed, because one of the trucks needs new engine parts.",
      "He asks anyone who wants to leave to sign the list at Station 12.",
    ] },
    { id: "radio-14", voice: "Jo", facts: [
      "Jo gives a key ring tip.",
      "The key hidden at Greenhouse Row opens the parts cage at Ortiz Auto.",
      "Jo says Mr. Ortiz would want the parts to keep a van running.",
    ] },
    { id: "radio-15", voice: "Theo", facts: [
      "Theo speaks from the Water Tower, where he tends the pumps.",
      "Dev and Mr. Ortiz are staying with him, because the Water Tower has clean water.",
      "Dev has a message for his sister: Ruby, I am safe with Theo, come west.",
    ] },
    { id: "radio-16", voice: "Jo", facts: [
      "Jo says Ruby heard Dev's message and is heading west to the Water Tower.",
      "Ruby left one more warning on the gate at Ridge Lumber.",
      "Do not run the saws at Ridge Lumber, because the noise brings the whole crowd from the loading dock.",
    ] },
    { id: "radio-17", voice: "Theo", facts: [
      "Theo has good news.",
      "Ruby walked through the gate of the Water Tower this morning.",
      "She and Dev are together again.",
      "Pip cheered so loud that June had to remind everyone about the no-shouting rule.",
    ] },
    { id: "radio-18", voice: "Jo", facts: [
      "Jo gives a key ring tip about a place Jo knows well.",
      "The key hidden at Station 12 opens the repair locker at Signal Electronics.",
      "Priya, the manager there, built Jo's first radio transmitter.",
    ] },
    { id: "radio-19", voice: "Doc Lin", facts: [
      "Doc Lin made it to Mile 9 Pharmacy with a bag of medicine.",
      "The road north to St. Anne Annex is still full of walkers, so Doc Lin is waiting for a safe day.",
      "The message to Nurse Ada: keep the generator going, I am getting closer.",
    ] },
    { id: "radio-20", voice: "Sergeant Vega", facts: [
      "Sergeant Vega says the River Convoy is delayed again.",
      "Rain made the river too high and fast for the boats.",
      "Vega sounds tired but says the plan is still good.",
      "The convoy still needs fuel and more drivers.",
    ] },
    { id: "radio-21", voice: "Theo", facts: [
      "Theo gives a key ring tip from the Water Tower.",
      "The key hidden at the Water Tower opens the principal's closet at Lincoln Middle School.",
      "Theo says Ruby and Dev say hello to everyone listening.",
    ] },
    { id: "radio-22", voice: "Mrs. Greer", facts: [
      "Mrs. Greer says the library still stands, because reading saved the building.",
      "Ms. Adler sets out two extra cots every night, one for Max and one for Mia.",
      "If the twins hear this, they should come to the book drop and knock.",
    ] },
    { id: "radio-23", voice: "Sergeant Vega", facts: [
      "Sergeant Vega gives a key ring tip.",
      "The key hidden at the 4th Precinct opens the foreman's lockbox at Ridge Lumber.",
      "Carla, the yard boss, says the lumber in there should go to building, not burning.",
    ] },
    { id: "radio-24", voice: "Nurse Ada", facts: [
      "Nurse Ada says the hospital generator is running low.",
      "She heard Doc Lin's voice on the radio, and it made her day.",
      "Her message to Doc Lin: I will keep a light in the top window so you know I am here.",
    ] },
    { id: "radio-25", voice: "Chief Dunn", facts: [
      "Chief Dunn reads the River Convoy list.",
      "More names are on it every day.",
      "The convoy is delayed again, because there are not enough boats yet.",
      "He asks for anyone who can fix an engine to come to Station 12.",
    ] },
    { id: "radio-26", voice: "Mrs. Greer", facts: [
      "Mrs. Greer gives a key ring tip.",
      "The key hidden at the Public Library opens the jewelry vault at Northgate Mall.",
      "She says to walk, not run, at the mall.",
    ] },
    { id: "radio-27", voice: "Jo", facts: [
      "Jo says a storm is coming from the north tonight.",
      "Stay inside, keep the fire low, and check the fence before dark.",
      "Walkers are slow in the wind, but they still come.",
    ] },
    { id: "radio-28", voice: "Doc Lin", facts: [
      "Doc Lin is at the bottom of the hill below St. Anne Annex.",
      "Last night Doc Lin saw a light in the top window of the hospital.",
      "Nurse Ada is still there, and Doc Lin is still trying to reach her.",
    ] },
    { id: "radio-29", voice: "Sergeant Vega", facts: [
      "Sergeant Vega says the River Convoy will leave at first light tomorrow, if the river road holds.",
      "Everyone on the list should pack tonight.",
      "Anyone who stays behind should keep the town's rule: take what you need, leave the rest.",
    ] },
    { id: "radio-30", voice: "Jo", facts: [
      "Jo says the River Convoy did not leave this morning, because fog sat on the river road.",
      "Sergeant Vega says soon.",
      "Ruby and Dev are safe at the Water Tower, and Nurse Ada's light is still on.",
      "Jo signs off the usual way: same time tomorrow on 88.1.",
    ] },
  ];

  /* Two tags per item: the label, a sticky note, writing on the side. */
  W.ITEM_TAGS = {
    fuel: [
      ["Masking tape label on the can: MIXED, generator only.", "Under it, in marker: shake before you pour."],
      ["Tomas's rule, written on the side: fill it to the line, never to the top, because fuel needs room in the heat.", "A second note: keep it outside, away from the stove."],
    ],
    food: [
      ["Stamped on the lid: canned beans, peaches and rice.", "Hana's handwriting on a sticky note: eat the oldest cans first.", "Below it: never eat from a can that bulges."],
      ["Written on the side: one crate for every trip.", "Someone drew a smiley face and wrote: share."],
    ],
    lumber: [
      ["Stamped on the end of the board: kiln dried, Ridge Lumber.", "Carla's chalk on the side: for fences, not for fires."],
      ["A paper tag stapled to the bundle: measure twice, cut once.", "Pencil marks along one board show where someone almost cut it."],
    ],
    nails: [
      ["Box label: common nails, three inches long.", "Mr. Reyes's price sticker is still on the corner.", "Written on the lid: wear gloves, and pick up every nail you drop."],
      ["Sticky note: two nails in each board, driven in at an angle, hold better than one.", "Below it: the box rattles, so wrap it in a shirt to keep it quiet."],
    ],
    tools: [
      ["Masking tape on the lid: Reyes Hardware, bring it back when you are done.", "Inside the lid, a list: hammer, saw, pliers, wrench, tape."],
      ["Mr. Ortiz's note taped inside: wipe the tools clean before you put them away.", "Scratched on the wrench: righty tighty, lefty loosey."],
    ],
    parts: [
      ["A tag wired to the box: Ortiz Auto, fits most vans.", "Mr. Ortiz wrote: check the belt before any long drive."],
      ["Grease pencil on the side: spark plugs, a belt, an oil filter.", "Sticky note: turn it hand tight, then a little more, never as hard as you can."],
    ],
    wire: [
      ["Label on the spool: copper wire, coated in plastic.", "Priya's note: strip a little plastic off each end, twist the ends together, then wrap them in tape."],
      ["Written on the side of the spool: never touch a bare wire that is hooked to a generator.", "Someone drew a tiny antenna and wrote: Jo, 88.1."],
    ],
    radioParts: [
      ["Box label: tuner, speaker, antenna clamp.", "Priya's handwriting: keep it dry, keep it in the bag."],
      ["Sticky note: the higher the antenna, the farther the voices.", "A list of stations, with only one circled: Jo."],
    ],
    seeds: [
      ["Seed packet: bush beans, plant one finger deep.", "Rosa's handwriting on the packet: soak them in water overnight first."],
      ["Seed packet: lettuce and carrots, barely cover them with soil and keep the soil damp.", "Rosa wrote on the back: save seeds from your best plants for next year."],
    ],
    soil: [
      ["Printed on the bag: garden soil, keep dry.", "Rosa's note: mix in old leaves and kitchen scraps to make it richer."],
      ["Stamped on the bag: Greenhouse Row.", "Written on the side: it is heavy, so lift with your legs, not your back."],
    ],
    meds: [
      ["A red cross on the lid, and a list inside: bandages, tape, cleaning wipes, pain pills.", "Nurse Ada's steps taped inside the lid: wash the cut, press on it to stop the bleeding, cover it, check it every day."],
      ["Doc Lin's sticky note: for a burn, cool it under clean water, and do not pop the blisters.", "Written on the side: one kit gets you back on your feet."],
    ],
    waterFilter: [
      ["Label: change the filter when the water runs slow or tastes strange.", "Theo's tag: let dirty water settle first, then pour from the top."],
      ["Written on the side: if you are not sure, boil the water too.", "Sticky note: rinse the filter in clean water, never in dirty water."],
    ],
    waterTank: [
      ["Stenciled on the side: drinking water only.", "Chief Dunn's tag: Station 12, keep the lid on."],
      ["Marker note: scrub it with a little bleach and rinse it well before you fill it.", "Below it: keep the tank in the shade so nothing grows inside."],
    ],
    generator: [
      ["Warning plate: run it outside only, because the fumes are poison in a closed room.", "Masking tape label: check the oil before every start."],
      ["Taped note: it is loud, and walkers hear it from far away.", "Below it: run it in the day and shut it off at night."],
    ],
    gunParts: [
      ["A tag from the police armory, signed by Sergeant Vega.", "Wrapped in oily paper, with a note: keep it clean and dry."],
      ["Written on the box: always check that it is empty before you clean it.", "Below it: point it at the ground, never at a person."],
    ],
    armorPlate: [
      ["Stenciled on the plate: steel, heavy.", "A chalk note: bolt it onto the van door at chest height."],
      ["Sticky note: a plate stops grabbing hands, not crashes.", "Marker lines along one edge count every dent it has taken."],
    ],
    books: [
      ["Stamped inside the first cover: Public Library, please return.", "Mrs. Greer's note on the box: reading saved this building."],
      ["Box label: field guides, first aid, small engines, poems.", "Sticky note: the first aid book is the one with the folded corners."],
    ],
    maps: [
      ["Folder label: city maps, streets and the river road.", "Someone traced the river road north in red pen and wrote: CONVOY."],
      ["Pencil marks on the map: a red R next to some buildings.", "Ruby's note on the back: a red R means I have been inside, and the number means walkers."],
    ],
  };

  /* The hand-painted sign on each outdoor lot in the yard: empty, then built levels 1 to 3. */
  W.YARD_LOTS = {
    garden: {
      empty: [
        "Stakes and string mark out beds in the dark dirt behind the cabin.",
        "June painted the sign: GARDEN, someday.",
        "Raised beds of seeds and soil here would grow food, and every trip in the van eats food.",
      ],
      built: [
        ["The sign says GARDEN, and one raised bed is planted with seeds.", "June checks it every morning.", "It grows 1 food each day."],
        ["The sign says GARDEN, and now there are more beds, with beans climbing the string.", "It grows 2 food each day."],
        ["The sign says GARDEN, and a water tank feeds the beds through a hose.", "June finally has her full garden.", "It grows 3 food each day."],
      ],
    },
    farm: {
      empty: [
        "A wide patch of grass past the garden has a stake at each corner.",
        "Tomas painted the sign: FARM, after the Garden and the Well.",
        "A crop field here would grow food on top of the Garden, and later it could hold animals.",
      ],
      built: [
        ["The sign says FARM: a crop field of corn and beans in long rows.", "It grows 2 food each day on top of the Garden."],
        ["The sign says FARM: a chicken coop with wire walls, loud at dawn.", "Pip collects the eggs.", "The farm gives 4 food each day."],
        ["The sign says FARM: a goat pen with a trough fed from the Well.", "Pip says goats are almost as good as a dog.", "The farm gives 6 food each day."],
      ],
    },
    well: {
      empty: [
        "A ring of stones marks the spot beside the cabin.",
        "June painted the sign: WELL, dig after the Water room is built.",
        "Water from deep underground comes up cold and clean, so you would heal faster in the yard.",
        "The Farm and the Lab both need the Well first.",
      ],
      built: [
        ["The sign says WELL: a hand-dug well lined with lumber, with a bucket on a rope.", "Its clean water helps you heal faster in the yard."],
        ["The sign says WELL: a hand pump with a filter now brings the water up.", "You heal in the yard even faster."],
        ["The sign says WELL: a wired pump fills a tank.", "You heal in the yard faster than ever, and you start every building at full health."],
      ],
    },
    water: {
      empty: [
        "An empty barrel sits on two sawhorses by the cabin wall.",
        "Tomas painted the sign: WATER, filter goes here.",
        "A filter and a tank here would turn gray rainwater clear, so you heal faster while you are in the yard.",
      ],
      built: [
        ["The sign says WATER: a filter on top of the barrel turns gray water clear.", "You slowly heal in the yard."],
        ["The sign says WATER: a filter and a big tank, full of clean water.", "You heal faster in the yard."],
        ["The sign says WATER: two filters and a tank.", "You heal even faster in the yard, and you walk into every building at full health."],
      ],
    },
    power: {
      empty: [
        "A bare pole stands by the shed with an old coil of rope at its foot.",
        "Tomas painted the sign: POWER, lights first.",
        "Fuel, wire and lights here would let the map show how dangerous each place is.",
        "Later a generator could do even more.",
      ],
      built: [
        ["The sign says POWER: fuel cans, wire, and a string of working lights.", "The map shows the danger of every place."],
        ["The sign says POWER: a generator hums under a tin roof.", "The map shows danger, and you find one supply crate on every drive."],
        ["The sign says POWER: more wire runs out to the van, which now has headlights.", "The map shows danger, you find two supply crates on every drive, and the headlights cut through night and fog."],
      ],
    },
    radio: {
      empty: [
        "A tall post stands in the yard with a ladder leaning on it.",
        "Pip painted the sign: RADIO, Pip's job.",
        "A radio mast here would pick up voices from town.",
        "The voices would tell you where places are, so they show up on the map.",
      ],
      built: [
        ["The sign says RADIO: a short mast with an antenna and a receiver.", "Pip writes down every voice.", "It finds three new places on the map."],
        ["The sign says RADIO: a taller mast that reaches all over town.", "It finds every place on the map."],
        ["The sign says RADIO: the tall mast, and a shelf of books Pip uses to keep the logbook of voices.", "It finds every place, and it shows which places still have items."],
      ],
    },
    lab: {
      empty: [
        "A shady corner has an old bench and a row of empty jars.",
        "June painted the sign: LAB, after the Medbay and the Well.",
        "Herb beds and a still here would make medical kits at home, so there are fewer trips to the hospital.",
      ],
      built: [
        ["The sign says LAB: herb beds and a copper still.", "It makes 1 medical kit every 2 days."],
        ["The sign says LAB: a clean bench with a sink that runs filtered water.", "It makes 1 medical kit each day."],
        ["The sign says LAB: a powered lab, humming off a generator.", "It makes 2 medical kits each day."],
      ],
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
