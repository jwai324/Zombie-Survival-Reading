/* Reading level 3: the crew's story quests and errands (T.crew.quests, T.crew.errands). The talk, tips,
   reports and the dog are in level3-crew.js. Facts: js/story-quests.js and js/story-crew.js (ERRANDS).
   See docs/CREW.md and docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });
  T.crew = T.crew || {};
  T.crew.quests = Object.assign(T.crew.quests || {}, {
    /* ---------- June ---------- */
    "june-1": {
      title: "Bag of sunflower seeds",
      brief: "June wants to plant sunflowers along the fence. The kids at her old school did that every year. Corner Grocery is east of the cabin. The seeds lie on the floor by the fish tank, near the SEAFOOD sign. Look for a brown paper bag with a sunflower on it. “A fence looks less sad with flowers on it,” June says. She will give you 20 scrap and 1 seed packet.",
      tag: "A brown paper bag of sunflower seeds, scooped from the bulk bins. A sunflower is printed on the front. The price sticker says: for snacks or for planting.",
      journal: "You brought home a bag of sunflower seeds. I planted them along the fence, one finger deep. Pip watered every one and whispered, “Grow, June's sunflowers.”",
      done: "June holds the bag in both hands, as if it were full of gold. She shakes it softly and listens to the seeds. “Sunflowers grow taller than the fence,” June says. “They turn their faces to the sun all day long.” She smiles at you over her glasses. Then she goes to find a trowel.",
      after: "June tells you about her old school garden. Every spring, her students planted sunflowers by the school fence. Every fall, they saved the seeds in envelopes with their names on them. One boy wrote down how tall his sunflower was, every single day. “That boy would be good at keeping a ledger,” June says. “Better than me, maybe.”",
    },
    "june-2": {
      title: "Roll of knee tape",
      brief: "June's knees ache when she kneels in the garden. She does not like to say so. Mr. Okafor at Mile 9 Pharmacy sold tape that holds a sore knee steady. The pharmacy is northwest of the cabin. A roll lies on the floor by the giant toothbrush. It is just outside the STAFF ONLY door. Look for a wide roll of blue tape. June will give you 30 scrap and 1 medical kit.",
      tag: "A wide roll of blue tape from Mile 9 Pharmacy. The label says: for sore knees and ankles. Wrap it snug, not tight.",
      journal: "You brought me a roll of knee tape from Mile 9 Pharmacy. I taped both knees and worked in the dirt until supper. Tomas called me Speedy June all evening.",
      done: "June laughs when she sees the blue tape. “Mr. Okafor told me to buy this for years,” she says. “I never listened.” June tapes both knees right away. Now she can kneel in the dirt again, as long as she likes. From now on, the crew gets 1 more food every day.",
      after: "June tells you about Mr. Okafor. For twenty years, he kept her knee pills ready in a paper bag. For twenty years, she forgot to pick them up. She paid him back in tomatoes every summer. June says the town was full of people like him. They kept things safe for each other, and they still do.",
    },
    "june-3": {
      title: "Rosa's jar of beans",
      brief: "June's old friend Rosa grew beans from June's seeds. Every fall, Rosa saved a jar of them for June. June hopes Rosa saved one this year, too. Rosa's place, Greenhouse Row, is west of the cabin. The jar is under the seed racks by the gate, beside the big gnome. It has a red lid and speckled beans inside. June will give you 30 scrap, 2 seed packets and 1 bag of soil.",
      tag: "A glass jar of dry speckled beans with a red lid. The beans rattle when you tip it. Rosa's label says: For June. The beans came up.",
      journal: "You brought home Rosa's jar of beans from Greenhouse Row. The label says: For June. I read it three times. Then I put the jar on the windowsill.",
      done: "June reads the label out loud: For June. The beans came up. Then she smiles for a long time and does not say a word. At last she says Rosa never wasted words. “These are the best ones Rosa ever wrote.” June sets the jar where the morning sun can find it.",
      after: "June tells you about Rosa. They met at a plant sale, years ago. They both reached for the last tomato plant, and neither one let go. So they shared it. After that, they traded seeds every spring: June's beans for Rosa's squash. June will save the best beans from this jar for Rosa. “Rosa will want some back,” June says.",
    },
    "june-4": {
      title: "First-aid book",
      brief: "June wants a first-aid book, so she can patch the crew up better. “Tape and a clean cloth only go so far,” she says. The Public Library is north of the cabin. The book lies on the floor of the MEDIA room, beside the owl statue. It is a thick blue book. Someone folded down the corners of its pages. June will give you 40 scrap and 1 medical kit.",
      tag: "A thick blue first-aid book from the Public Library. A due date is stamped inside. The corners are folded down on the pages about cuts, burns and sprains.",
      journal: "You brought me a first-aid book from the Public Library. I read it by the stove until the candle burned all the way down. “June, it is late,” Tomas said. Not for a student, I said.",
      done: "June starts reading before you even let go of the book. She taps a folded corner. June says the folded corners show which pages helped people most. “Someone used this book well,” she says. “Now I will too.” From now on, when June patches you up, you get 20 more health.",
      after: "June learned first aid in her school garden. Kids got bee stings and scraped knees there all the time. So the school nurse taught her what to do. June kept bandages in the tool shed, and lollipops for the brave ones. “This crew is braver than all of them,” June says. “You still get no lollipops.”",
    },
    "june-5": {
      title: "Garden club seed box",
      brief: "June wants good seeds for a bigger garden. She once helped the garden club at Lincoln Middle School. The club kept its best seeds in a box. The school is northeast of the cabin. The box is in the SCIENCE room, on the floor beside the big brain. It is a cardboard box with a red label. “Those kids saved the good ones,” June says. She will give you 50 scrap, 2 seed packets and 2 bags of soil.",
      tag: "A cardboard box full of paper seed envelopes, sorted by plant. The red label says: Lincoln Garden Club, save your best seeds.",
      journal: "You brought home the garden club's seed box from Lincoln Middle School. Pip and I sorted the envelopes on the kitchen table until late. “June, we need a bigger yard,” Pip said.",
      done: "June opens the box and reads every envelope out loud. There are beans, squash, corn, peppers and sunflowers. She plants the seeds in every spare corner of the yard. June says the yard will soon be more garden than yard. From now on, the crew gets 2 more food every day.",
      after: "June found the kids' names on the seed envelopes, written in pencil. Some names are neat, and some are very messy. She hopes those kids are safe, wherever they are. June will save seeds from this harvest for them. She will use new envelopes with the same names. She says a seed is a promise. “It says there will be a next year.”",
    },

    /* ---------- Tomas ---------- */
    "tomas-1": {
      title: "Socket wrench",
      brief: "Tomas's wrench was his father's. It is worn so smooth now that it slips on the bolts. “I keep scraping my knuckles,” Tomas says. Reyes Hardware is northeast of the cabin. A new socket wrench lies by the tool wall, beside the orange ladder. It has a red handle and a shiny silver head. Tomas will give you 25 scrap and 1 box of nails.",
      tag: "A socket wrench with a red handle, still on its shop clip. Mr. Reyes's price sticker is on the handle. The silver head has never touched a bolt.",
      journal: "You brought Tomas a new socket wrench from Reyes Hardware. He spent the whole evening under the van. He came out whistling and covered in grease.",
      done: "Tomas tries the new wrench on a rusty bolt. It turns on the first try, and he grins. “It does not slip,” Tomas says. He wipes his father's old wrench with his red rag. That one goes on the shelf now. “For luck,” he says, “not for work.”",
      after: "Tomas tells you how he learned to fix things. As a small boy, he handed his father the tools. But first, he had to say each tool's name out loud. If he said the wrong name, his father just waited. Tomas laughs. He says that is how he learned to read the labels on everything.",
    },
    "tomas-2": {
      title: "Thank-you card",
      brief: "Tomas's father once sent his old teacher, Mr. Ortiz, a thank-you card. Tomas wants to read it. Ortiz Auto is east of the cabin. The card lies in the PARTS room, on the floor beside the engine crane. It is in a white envelope with a red seal. “I only know that Dad sent it,” Tomas says. Tomas offers 30 scrap, 1 box of engine parts and 1 spool of wire.",
      tag: "A thank-you card in a white envelope with a red seal. The card inside is written in neat blue ink. It says: thank you for teaching me never to rush a job.",
      journal: "You brought Tomas his father's thank-you card from Ortiz Auto. He propped it on the van's dashboard. Now it rides along on every trip.",
      done: "Tomas knows the handwriting at once. It is his father's. He reads the card twice, slowly, and then he is quiet for a while. “Dad never said thank you out loud,” Tomas says. “So it is good to see it written down.”",
      after: "Tomas tells you about his father's garage. It was small, with one lift. It had a radio that only played old songs. Over the door, his father painted Mr. Ortiz's rule: never rush a job. Tomas wants to show Mr. Ortiz the van someday. “He would find ten things wrong with it,” Tomas says, grinning.",
    },
    "tomas-3": {
      title: "Fire crew toolbox",
      brief: "Tomas wants to make crowbars from scrap. To do that, he needs a good pry bar to copy. The fire crew at Station 12 kept one in their toolbox. Station 12 is northwest of the cabin. The toolbox lies by the gear racks, near the big door marked RESCUE. It is a long red toolbox with a gray handle. Tomas will give you 40 scrap and 1 crowbar.",
      tag: "A long red toolbox with Station 12 painted on the side in white letters. It is heavy. A strong steel pry bar lies inside.",
      journal: "You brought home the fire crew's toolbox from Station 12. Tomas drew the pry bar on the back of a cereal box before supper.",
      done: "Tomas studies the pry bar from end to end. He measures it with his fingers and taps it on his boot. “I can make these now, from scrap,” Tomas says. “Same shape, same bend.” From now on, a crowbar costs only 10 scrap to build.",
      after: "Tomas once went to Station 12 with his father, to fix the fire truck. The fire crew let him sit in the driver's seat. He was not allowed to touch anything. Chief Dunn told him something he still remembers. A good tool is one you trust when you are scared. Tomas says the van is like that, and so is the crew.",
    },
    "tomas-4": {
      title: "Box of fence brackets",
      brief: "Steel brackets would let Tomas fix the fence with old boards instead of scrap. “Old boards are free,” he says. “Scrap is not.” Carla, the yard boss at Ridge Lumber, kept a box of them. Ridge Lumber is northeast of the cabin. The box is in the SAW SHOP, on the floor beside the band saw. It is a heavy cardboard box with a red label. Tomas will give you 45 scrap, 2 pieces of lumber and 2 spike traps.",
      tag: "A heavy box of steel fence brackets from Ridge Lumber. Carla wrote on the red label in marker: two screws each, and it holds.",
      journal: "You brought Tomas a box of fence brackets from Ridge Lumber. He lined them all up on the porch by size. I had to step over them on my way to bed.",
      done: "Tomas opens the box and counts the brackets twice. Then he counts them a third time, just to be sure. With these, he can fix the fence and the cabin with old boards. “No more scrap for my fixes,” Tomas says. From now on, the crew's repairs cost no scrap.",
      after: "Tomas tells you why he likes fixing the fence. Under a car, his father always did the hard part. Tomas just held the light. The fence is the first big job that is all his own. He scratches a small T on every board he puts back. “So the fence knows who to thank,” Tomas says.",
    },
    "tomas-5": {
      title: "Rescue van manual",
      brief: "Tomas needs a service manual to rebuild the van. His father used to fix the rescue van at St. Anne Annex. That van has the same engine as ours. St. Anne Annex is northwest of the cabin. Few places in town are as dangerous, so be careful. The manual is in the garage behind the EMERGENCY sign, beside the rescue van. It is a thick blue book. Tomas will give you 70 scrap and 2 boxes of engine parts.",
      tag: "A thick service manual for the rescue van. The blue cover is greasy with old thumbprints. Someone wrote small notes in pencil in the margins.",
      journal: "You brought home the rescue van's manual from St. Anne Annex. Tomas read it at the kitchen table all night. I left the lamp on for him.",
      done: "Tomas flips the pages, then stops at the notes in the margins. The handwriting is his father's, the same as on the thank-you card. He does not say anything for a long time. Then Tomas gets to work and rebuilds the van. From now on, the van has 40 more health when it is fully fixed.",
      after: "Tomas shows you the manual. His father wrote small notes on every page. Check the belt. Listen for the knock. Never rush a job. Tomas says it feels like working next to his father again. He reads one page every night, the way June reads her ledger.",
    },

    /* ---------- Pip ---------- */
    "pip-1": {
      title: "Tin of dog treats",
      brief: "Pip wants to be ready for a dog, though the crew has none yet. “A dog will come one day,” Pip says. “It will be hungry.” Gas-N-Go is west of the cabin. A tin of dog treats lies by the slushie machine, under the LOTTO poster. The tin is red, with a white band. Pip will give you 20 scrap and 1 spool of wire.",
      tag: "A red tin of dog treats with a white band around the middle. It rattles when you shake it, and it is almost full.",
      journal: "You brought Pip a tin of dog treats from Gas-N-Go. Pip put it under their drawing of a dog with no name yet. We still have no dog, but we are ready.",
      done: "Pip shakes the tin and listens to it rattle. Then Pip shakes it again, closer to one ear. Pip says a dog will come to someone who has treats. “And now we have treats,” Pip says. Pip sets the tin on the shelf with the label facing out, ready.",
      after: "Pip tells you about Biscuit, the Hollis family's dog. Lucy's drawing says Biscuit could sit, shake and roll over. Biscuit went north with the family. Pip hopes Biscuit gets lots of treats on the trip. If the Hollises come back, Pip says, Biscuit will have a friend here. Pip is sure of it.",
    },
    "pip-2": {
      title: "Binoculars",
      brief: "Pip keeps watch at the back fence. Pip wants to see walkers coming from farther away. The pump crew at the Water Tower kept binoculars to watch the river. The Water Tower is northwest of the cabin. The binoculars lie in the WORKSHOP, on the floor beside the rowboat. They are in a yellow case with a brown strap. Pip will give you 30 scrap and 1 box of radio parts.",
      tag: "Black binoculars in a yellow case, with a brown strap. Two words are scratched into the strap: river watch. The lenses are clean.",
      journal: "You brought Pip binoculars from the Water Tower. Pip watched the trees from the porch roof until supper. I called them down. “Coming, June!” Pip said, and stayed up there ten more minutes.",
      done: "Pip looks through the binoculars at everything, even at you, up close. “Your nose is huge,” Pip says. From the porch roof, Pip can see walkers in the trees much sooner. From now on, when Pip keeps watch, Pip calls each wave 10 seconds sooner.",
      after: "Pip tells you what they saw from the porch roof. Far past the trees, a thin line of smoke rose from a chimney. Pip says smoke means somebody is cooking supper. “So somebody is still out there,” Pip says. Pip drew the smoke on the wall in pencil, with a question mark.",
    },
    "pip-3": {
      title: "Broken boom box",
      brief: "Pip wants a big magnet to pull nails from the dirt for scrap. Tomas says every big speaker has a big magnet inside. Signal Electronics is north of the cabin. A broken boom box lies by the TV wall, just outside the REPAIRS room. It is blue-green, with two big round speakers. “It does not have to play,” Pip says. Pip will give you 35 scrap and 1 box of books.",
      tag: "A blue-green boom box with two big round speakers. A paper repair tag hangs from the handle. It says: speakers fine, everything else broken.",
      journal: "You brought Pip a broken boom box from Signal Electronics. Pip took the magnet out and dragged it around the yard until dark.",
      done: "Pip takes the big magnet out of one speaker and ties on a string. Every evening, Pip drags it along the fence. Nails and bolts jump up out of the dirt and stick to it. From now on, Pip brings in 3 scrap every day.",
      after: "Pip shows you what the magnet pulled out of the dirt. There were nails, bolts and a bottle cap. There was also a small metal tag shaped like a bone. The name on the tag is worn away. So Pip keeps it for the dog the crew does not have yet. “It can get a new name,” Pip says.",
    },
    "pip-4": {
      title: "Dog leash",
      brief: "Pip wants a leash ready for the day the crew finds a dog. Pip once saw one in the lost-and-found box at the 4th Precinct. The 4th Precinct is north of the cabin. The leash lies in the GARAGE, on the floor beside the riot shields. It is red, with a metal clip. “A dog needs a leash, like a van needs keys,” Pip says. Pip offers 50 scrap, 1 spool of wire and 1 box of books.",
      tag: "A red dog leash with a shiny metal clip. A paper tag is tied to the loop. It says: found by the front steps, no dog.",
      journal: "You brought Pip a red dog leash from the 4th Precinct. Pip hung it on a hook by the front door, where a leash belongs.",
      done: "Pip clips the leash to their belt to practice. Then Pip walks in a slow circle with it, very calm and very quiet. Pip says the crew has treats and a leash now. “All that is missing is the dog,” Pip says.",
      after: "Pip tells you about a police dog that once visited Pip's class. It sat very still while the whole class talked. It moved only when the officer said one quiet word. Pip says a dog chooses its people. So Pip is practicing being calm and quiet. Pip is not very good at it yet.",
    },
    "pip-5": {
      title: "The stray dog",
      brief: "Through the binoculars, Pip saw the dog that barks past the trees. It slipped into Corner Grocery, east of the cabin. It sleeps on the LOADING DOCK, beside the forklift. It is sandy tan, with a dark brown patch over one eye. Pip gives you some treats. Hold one out (press E), and the dog will follow you to the van. Walkers leave it alone. Pip offers 60 scrap, 1 box of radio parts and 1 box of books.",
      journal: "You brought a dog home from Corner Grocery. Pip smiled all evening. The dog drank from Pip's bowl by the gate. I did not say a word.",
      done: "Pip kneels down, and the dog licks their face. Pip laughs so loud that June comes out to look. The dog eats 1 food every 2 days. It barks when walkers come close to the cabin, so it keeps watch too. Pip says that makes two lookouts now.",
      after: "Pip says {dog} has a home now, and so does the crew. Pip still wants to build Finn's treehouse one day. It will have a bucket on a pulley, so {dog} can ride up. June says the dog stays on the ground. Pip just says, “We will see.”",
    },
  });
  T.crew.errands = Object.assign(T.crew.errands || {}, {
    /* ---------- June ---------- */
    "june-e1": {
      title: "Seeds before the cold",
      brief: "June needs {count} of these within {days} days: {item}. She wants more beans in the ground before the cold comes. “Beans hate frost, and so do my knees,” June says. She will pay {reward}.",
      done: "June tucks the seed packets into her cardigan pocket and pats it twice. Then she writes them in the ledger. June says the beans are already in a hurry to grow.",
    },
    "june-e2": {
      title: "Good dirt for the beds",
      brief: "June needs {count} of these within {days} days: {item}. She says good dirt is half of any garden. The other half is waiting, and she is good at that. June will pay {reward}.",
      done: "June pats the soil like an old friend. She opens one bag, smells it, and smiles. June says the beds will thank you, and so will she.",
    },
    "june-e3": {
      title: "Clean water for the beds",
      brief: "June needs {count} of these within {days} days: {item}. She wants clean water for the garden beds, because dirty water makes sick plants. June will give you {reward} from her shelf.",
      done: "June rinses the filter in clean water, the way its tag says. Then she sets it by the sink to dry. June says the beds will drink well tonight.",
    },
    "june-e4": {
      title: "Kits for June's shelf",
      brief: "June needs {count} of these within {days} days: {item}. She wants kits on her shelf for scrapes and colds. “Better to have one and not need it,” June says. She will pay {reward}.",
      done: "June stocks her shelf with the kits. She opens every lid and reads the list inside, one line at a time. June says a kit you understand is worth two.",
    },

    /* ---------- Tomas ---------- */
    "tomas-e1": {
      title: "Parts for the van",
      brief: "Tomas needs {count} of these within {days} days: {item}. The van needs a new belt and spark plugs. “Hear that squeal? That is the belt,” Tomas says. He will pay {reward}.",
      done: "Tomas sorts the parts on the porch. Big ones go on one side, and small ones on the other. He checks the new belt twice. Tomas says the van will purr tonight.",
    },
    "tomas-e2": {
      title: "Nails for the fence",
      brief: "Tomas needs {count} of these within {days} days: {item}. Loose fence boards hold better with two nails each. One nail is a hope, but two are a plan. He will pay {reward}.",
      done: "Tomas wraps the box in an old shirt, so it will not rattle. Walkers follow sounds, he says. Then Tomas grabs his hammer and gets to work on the fence.",
    },
    "tomas-e3": {
      title: "Fuel for power and traps",
      brief: "Tomas needs {count} of these within {days} days: {item}. Fuel feeds the Power room and blast traps. Tomas will trade you {reward} he made himself. He says it is a good, strong one.",
      done: "Tomas stores the fuel outside, away from the stove. He never fills a can past the line. Tomas says fuel needs room to breathe in the heat.",
    },
    "tomas-e4": {
      title: "Good tools for Tomas",
      brief: "Tomas needs {count} of these within {days} days: {item}. His tools are worn out, and good fixes need good tools. Tomas says a bad tool makes a bad fix. He will pay {reward}.",
      done: "Tomas wipes every tool clean, the way Mr. Ortiz's note says. Only then does he put them away, in a neat row. Tomas says that is how a shop should look.",
    },

    /* ---------- Pip ---------- */
    "pip-e1": {
      title: "Boards for the treehouse",
      brief: "Pip needs {count} of these within {days} days: {item}. Pip is saving boards for Finn's treehouse. It will have a rope ladder and a lookout someday. Pip will pay {reward}.",
      done: "Pip stacks the boards behind the cabin, neat and square. They are ready for the day the fence is strong. Pip says the treehouse is getting closer.",
    },
    "pip-e2": {
      title: "Wire for a longer antenna",
      brief: "Pip needs {count} of these within {days} days: {item}. Pip wants a longer antenna, to hear voices that are farther away. Pip will pay {reward}, and say thank you twice.",
      done: "Pip winds the wire into a neat coil. Then Pip labels it in big, messy letters: ANTENNA WIRE, DO NOT TOUCH. Pip says that rule means Tomas.",
    },
    "pip-e3": {
      title: "Something new to read",
      brief: "Pip needs {count} of these within {days} days: {item}. Pip wants something new to read by the stove at night. Pip likes dog books best. Pip will pay {reward}.",
      done: "Pip reads the first page of every book before choosing one. It takes a long time. Pip says the first page is where a book says hello.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
