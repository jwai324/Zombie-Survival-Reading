/* Reading level 2: the crew's story quests and errands (T.crew.quests, T.crew.errands). The talk, tips,
   reports and the dog are in level2-crew.js. Facts: js/story-quests.js and js/story-crew.js (ERRANDS).
   See docs/CREW.md and docs/TEXT_GUIDE.md.
   Level 2: sentences of 10 words or fewer, simple words, simple past is fine, whole sentences.
   Quest brief 35 to 72 words; done and after 30 to 62; tag, journal, errand brief and done 14 to 30.
   The journal line is June's ledger (her voice, "I"). June is "she", Tomas "he", Pip "they", the dog "it". */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[2] = root.ZSR.TEXT[2] || { level: 2 });
  T.crew = T.crew || {};
  T.crew.quests = Object.assign(T.crew.quests || {}, {
    /* ---------- June: the garden, her knees, Rosa, first aid, seeds for everyone ---------- */
    "june-1": {
      title: "Bag of sunflower seeds",
      brief:
        "June wants to plant sunflowers along the fence. The kids at her old school did that every spring. Corner Grocery is east of the cabin. Go to the fish tank, near the SEAFOOD sign. The seeds lie on the floor there. They are in a brown paper bag. It has a sunflower on it. June will give you 20 scrap and 1 seed packet.",
      tag: "This paper bag came from the bulk bins. It holds sunflower seeds. The price sticker says: for snacks or for planting.",
      journal:
        "You brought home a bag of sunflower seeds. I planted them along the fence, one finger deep. Pip watered every one. Pip calls them June's giants.",
      done: "June holds the bag like it is full of gold. She shakes it by her ear and smiles. She says sunflowers grow taller than the fence. They turn their faces to the sun all day. June says the yard needs something tall and bright. Then she thanks you.",
      after:
        "June talks about her old school garden. Every spring, her students planted sunflowers by the school fence. Every fall, they saved the seeds in envelopes. Each kid wrote their name on one. One boy wrote down how tall his sunflower was. He did it every day. June smiles. She says that boy would keep a good ledger.",
    },
    "june-2": {
      title: "Roll of knee tape",
      brief:
        "June's knees ache when she kneels in the garden. Mr. Okafor at Mile 9 Pharmacy sold tape for that. It holds a sore knee steady. The pharmacy is northwest of the cabin. A roll lies on the floor by the giant toothbrush. It is outside the STAFF ONLY door. Look for a wide roll of blue tape. June will give you 30 scrap and 1 medical kit.",
      tag: "This is a wide roll of blue tape. It came from Mile 9 Pharmacy. The label says: for sore knees and ankles.",
      journal:
        "You brought me a roll of knee tape. It came from Mile 9 Pharmacy. I taped my knees. I worked in the dirt until supper. Not bad for old June.",
      done: "June laughs. Mr. Okafor told her to buy this tape for years. She never listened. Now her knees are taped. She can kneel in the dirt again. More kneeling means more weeding, and more food. From now on, you get 1 more food every day.",
      after:
        "June tells you about Mr. Okafor. For twenty years, he kept her knee pills ready. They waited for her in a paper bag. For twenty years, she forgot to pick them up. She paid him back in tomatoes every summer. June says the town was full of people like that. They kept things safe for each other.",
    },
    "june-3": {
      title: "Rosa's jar of beans",
      brief:
        "June's old friend Rosa grew beans from June's seeds. Every fall, Rosa saved June a jar of them. Rosa's place is Greenhouse Row, west of the cabin. The jar is under the seed racks by the gate. It sits beside the big gnome. It has a red lid and spotted beans inside. June will give you 30 scrap and 2 seed packets. She adds 1 bag of soil.",
      tag: "This glass jar has a red lid. Dry spotted beans fill it. Rosa's label says: For June. The beans came up.",
      journal:
        "You brought home Rosa's jar of beans from Greenhouse Row. The label says: For June. I read it three times. Then I put the jar on the windowsill.",
      done: "June reads the label. Then she smiles for a long time. She says Rosa never wasted words. Rosa wrote the way she planted, small and neat. June says these are the best words Rosa ever wrote. She sets the jar in the sun and thanks you.",
      after:
        "June tells you about Rosa. They met at a plant sale. They both reached for the last tomato plant. So they shared it. After that, they traded seeds every spring. June gave beans, and Rosa gave squash. June will save the best beans from this jar. They are for Rosa, when they meet again.",
    },
    "june-4": {
      title: "First-aid book",
      brief:
        "June wants a first-aid book. She says tape and a cloth only go so far. With a book, she can patch the crew up better. The Public Library is north of the cabin. In its MEDIA room, look beside the owl statue. The book lies on the floor. It is thick and blue, with folded page corners. June will give you 40 scrap and 1 medical kit.",
      tag: "This thick blue first-aid book is from the Public Library. Some corners are folded down. They mark the pages about cuts, burns and sprains.",
      journal:
        "You brought me a first-aid book from the Public Library. I read it by the stove. I read until the candle burned down. Now Tomas calls me Nurse June.",
      done: "June has already started reading. She shows you the folded corners. She says they show which pages helped people most. Somebody read those pages again and again. From now on, her patch-up gives you 20 more health. June says she will practice on Tomas first.",
      after:
        "June learned first aid in her school garden. Kids got bee stings and scraped knees there. So the school nurse taught her what to do. June kept bandages in the tool shed. She kept lollipops there too, for the brave ones. The crew is braver, June says. But they still get no lollipops.",
    },
    "june-5": {
      title: "Garden club seed box",
      brief:
        "June wants good seeds for a bigger garden. She once helped the garden club at Lincoln Middle School. The club kept its best seeds in a box. The school is northeast of the cabin. The box is in the SCIENCE room. Look on the floor by the big brain. It is cardboard, with a red label. June will give you 50 scrap and 2 seed packets. She adds 2 bags of soil.",
      tag: "This cardboard box is full of seed envelopes. They are sorted by plant. The red label says: Lincoln Garden Club. Save your best seeds.",
      journal:
        "You brought home a seed box from Lincoln Middle School. Pip and I sorted the envelopes on the kitchen table. We worked until Pip yawned: Good night, June.",
      done: "June reads every envelope out loud. There are beans, squash, corn, peppers and sunflowers. She plants seeds in every spare corner of the yard. Tomas has to step around the rows now. From now on, you get 2 more food every day. June thanks you with dirt on her hands.",
      after:
        "June found the kids' names on the envelopes. They wrote them in pencil, in big letters. June hopes those kids are safe, wherever they are. She will save seeds from this harvest for them. June says a seed is a promise. It promises that there will be a next year.",
    },

    /* ---------- Tomas: his father's tools, Mr. Ortiz, crowbars, the fence, the van ---------- */
    "tomas-1": {
      title: "Socket wrench",
      brief:
        "Tomas's wrench was his father's. Now it is worn so smooth that it slips. Tomas says the van needs a good wrench. Reyes Hardware is northeast of the cabin. A new socket wrench lies there by the tool wall. It is beside the orange ladder. It has a red handle and a shiny silver head. Tomas will pay 25 scrap and 1 box of nails.",
      tag: "This socket wrench has a red handle. It is still on its shop clip. Mr. Reyes's price sticker is on the handle.",
      journal:
        "You brought Tomas a new socket wrench from Reyes Hardware. He spent the whole evening under the van. He came out whistling, with grease on his nose.",
      done: "Tomas tries the wrench on a bolt and grins. It does not slip at all. He says his father's wrench goes on the shelf now. It is there for luck, not for work. Tomas says thanks, and he means it. Then he is back under the van.",
      after:
        "Tomas tells you how he learned to fix things. As a small boy, he handed his father the tools. But first he had to say each tool's name. If he said the wrong name, his father just waited. Tomas says that is how he learned to read labels. He reads the labels on everything now.",
    },
    "tomas-2": {
      title: "Thank-you card",
      brief:
        "Tomas's father once sent his old teacher a thank-you card. The teacher was Mr. Ortiz. Tomas wants to read that card. Ortiz Auto is east of the cabin. The card lies in the PARTS room. It is on the floor beside the engine crane. It is in a white envelope with a red seal. Tomas will pay 30 scrap and 1 spool of wire. He adds 1 box of engine parts.",
      tag: "This white envelope has a red seal. A thank-you card is inside. It says: Thank you for teaching me. You taught me never to rush a job.",
      journal:
        "You brought Tomas his father's thank-you card from Ortiz Auto. He propped it on the van's dashboard. It rides along on every trip. Tomas taps it for luck.",
      done: "Tomas knows the handwriting at once. It is his father's. He reads the card twice. He says his father never said thank you out loud. So it is good to see it written down. Tomas clears his throat. Then he thanks you, out loud.",
      after:
        "Tomas tells you about his father's garage. It was small, with one lift. It had a radio that only played old songs. Over the door, his father painted Mr. Ortiz's rule. It said: never rush a job. Tomas wants to show Mr. Ortiz the van someday. He says he will wash it first.",
    },
    "tomas-3": {
      title: "Fire crew toolbox",
      brief:
        "Tomas wants to make crowbars from scrap. First he needs a good pry bar to copy. The fire crew at Station 12 kept one. It is in their toolbox. Station 12 is northwest of the cabin. The toolbox lies by the gear racks. That is near the big door marked RESCUE. It is long and red, with a gray handle. Tomas will give you 40 scrap and 1 crowbar.",
      tag: "This toolbox is long and red. Station 12 is painted on its side. A heavy pry bar lies inside.",
      journal:
        "You brought home the fire crew's toolbox from Station 12. Before supper, Tomas drew the pry bar. He drew it on the back of a box.",
      done: "Tomas studies the pry bar from end to end. He taps it and listens to it ring. He can make crowbars the same way now, from scrap. From now on, building a crowbar takes only 10 scrap. Tomas grins and thanks you.",
      after:
        "Tomas once went to Station 12 with his father. They came to fix the fire truck. The fire crew let him sit in the driver's seat. But he could touch nothing. Chief Dunn said something Tomas never forgot. A good tool is one you trust when scared. Tomas says the van is like that. So is the crew.",
    },
    "tomas-4": {
      title: "Box of fence brackets",
      brief:
        "Tomas wants steel brackets for the fence. Then he can fix it with old boards, not scrap. Carla, the yard boss at Ridge Lumber, kept a box. Ridge Lumber is northeast of the cabin. Look in the SAW SHOP, beside the band saw. It is heavy cardboard, with a red label. Tomas will give you 45 scrap and 2 spike traps. He adds 2 pieces of lumber.",
      tag: "This heavy box holds steel fence brackets. It came from Ridge Lumber. Carla wrote on the red label. It says: two screws each, and it holds.",
      journal:
        "You brought Tomas a box of brackets from Ridge Lumber. He lined them up on the porch by size. I stepped around them all evening.",
      done: "Tomas opens the box and counts the brackets twice. Now he fixes the fence and cabin with old boards. From now on, the crew's repairs cost no scrap. Tomas says scrap is for better things. He thanks you and gets to work.",
      after:
        "Tomas tells you why he likes fixing the fence. Under a car, his father did the hard part. Tomas just held the light. But the fence is different. It is the first big job all his own. He scratches a small T on each board he fixes. Go look, he says. They are everywhere.",
    },
    "tomas-5": {
      title: "Rescue van manual",
      brief:
        "Tomas needs a service manual to rebuild the van. His father fixed the rescue van at St. Anne Annex. Both vans have the same engine. The Annex is northwest of the cabin. Tomas says few places are as dangerous. The manual is in the garage behind the EMERGENCY sign. Look beside the rescue van for a thick blue book. Tomas will give you 70 scrap. He adds 2 boxes of engine parts.",
      tag: "This thick service manual is for the rescue van. It is blue and greasy. Someone wrote pencil notes along the edges of the pages.",
      journal:
        "You brought home the rescue van manual. It came from St. Anne Annex. Tomas read it at the kitchen table all night. I made him tea, and it went cold.",
      done: "Tomas stops at the pencil notes on the pages. The handwriting is his father's. It is the same as on the thank-you card. With the manual, Tomas rebuilds the van. From now on, the van can hold 40 more health. Tomas says thank you very quietly.",
      after:
        "Tomas shows you the manual. His father wrote small notes on every page. One says: check the belt. Another says: listen for the knock. A third says: never rush a job. It feels like working beside his father again, Tomas says. He reads one page every night. June reads her ledger the same way.",
    },

    /* ---------- Pip: ready for a dog, the lookout, scrap, a leash, and the dog ---------- */
    "pip-1": {
      title: "Tin of dog treats",
      brief:
        "Pip wants to be ready for a dog. The crew has no dog yet. But Pip says a dog could come any day. Gas-N-Go is west of the cabin. A tin of dog treats lies by the slushie machine. It is under the LOTTO poster. The tin is red, with a white band. Pip will pay 20 scrap and 1 spool of wire.",
      tag: "This red tin has a white band. Dog treats are inside. It rattles when you shake it. It is almost full.",
      journal:
        "You brought Pip a tin of dog treats from Gas-N-Go. Pip set it under their drawing of a dog. The dog in the drawing has no name yet.",
      done: "Pip shakes the tin and listens to it rattle. Pip says a dog will come to someone with treats. And now the crew has treats. Pip hugs the tin and thanks you. Then Pip asks how long treats stay good. Pip wants to be sure.",
      after:
        "Pip tells you about Biscuit, the Hollis family's dog. Lucy's drawing says Biscuit could sit, shake and roll over. Biscuit went north with the family. Pip hopes Biscuit gets lots of treats up there. If the Hollises come back, Biscuit will have a friend. Pip says that is one more reason for a dog.",
    },
    "pip-2": {
      title: "Binoculars",
      brief:
        "Pip keeps watch for the crew. Pip wants to see walkers coming from farther away. The pump crew at the Water Tower had binoculars. They used them to watch the river. The Water Tower is northwest of the cabin. The binoculars lie on the WORKSHOP floor, beside the rowboat. They are in a yellow case with a brown strap. Pip will give you 30 scrap. Pip adds 1 box of radio parts.",
      tag: "These black binoculars came in a yellow case. Someone scratched two words on the strap. The words say: river watch.",
      journal:
        "You brought Pip binoculars from the Water Tower. Pip watched the trees from the porch roof. I called Pip down for supper. Pip said: Coming, June!",
      done: "Pip looks through the binoculars at everything. Pip even looks at you, up close, and giggles. Pip keeps watch from the porch roof now. Pip can see walkers in the trees much sooner. From now on, Pip calls each wave 10 seconds sooner.",
      after:
        "Pip tells you what they saw from the porch roof. Far past the trees, a thin line of smoke rose. It came from a chimney. Pip says smoke means somebody is cooking supper. So somebody is still out there. Pip drew the smoke on the wall. Next to it, Pip drew a question mark.",
    },
    "pip-3": {
      title: "Broken boom box",
      brief:
        "Pip wants a big magnet. It could pull nails out of the dirt for scrap. Tomas says every big speaker has a big magnet inside. Signal Electronics is north of the cabin. A broken boom box lies there by the TV wall. It is just outside the REPAIRS room. It is blue-green, with two big round speakers. Pip will give you 35 scrap. Pip adds 1 box of books.",
      tag: "This blue-green boom box has two big round speakers. A repair tag hangs on it. The tag says: speakers fine, everything else broken.",
      journal:
        "You brought Pip a broken boom box from Signal Electronics. Pip took the magnet out. Then Pip dragged it around the yard until dark. I heard it clink all evening.",
      done: "Pip pulls the big magnet out of one speaker. Pip ties it to a string. Every evening, Pip drags it along the fence. It pulls up nails and bolts. From now on, Pip brings in 3 scrap every day. Pip says the dirt is full of treasure.",
      after:
        "Pip shows you what the magnet pulled from the dirt. There were nails, bolts and a bottle cap. There was a small metal tag shaped like a bone. The name on the tag is worn away. So Pip keeps it for a dog. The crew does not have that dog yet.",
    },
    "pip-4": {
      title: "Dog leash",
      brief:
        "Pip wants a leash for the day a dog comes. Pip once saw one at the 4th Precinct. It was in the lost-and-found box. The precinct is north of the cabin. The leash lies in the GARAGE. Look on the floor by the riot shields. It is red, with a metal clip. Pip will pay 50 scrap and 1 spool of wire. Pip adds 1 box of books.",
      tag: "This red dog leash has a metal clip. A paper tag hangs on it. The tag says: found by the front steps, no dog.",
      journal:
        "You brought Pip a red leash from the 4th Precinct. Pip hung it by the front door. A leash belongs there. Pip checks the hook every day.",
      done: "Pip clips the leash to their belt to practice. Then Pip walks the empty leash around the porch. Pip says the crew has treats and a leash now. All that is missing is the dog. Pip thanks you and looks out at the trees.",
      after:
        "Pip tells you about a police dog. It once came to Pip's class. It sat still while the whole class talked. It moved only when the officer said one quiet word. Pip says a dog chooses its people. So Pip is practicing being calm and quiet. Pip is not very good at it yet.",
    },
    // the dog: no tag (no object to pick up); {dog} is "the dog" until Pip's card names it
    "pip-5": {
      title: "The stray dog",
      brief:
        "Pip's binoculars found the barking dog. It slipped into Corner Grocery, east of the cabin. It sleeps on the LOADING DOCK, beside the forklift. It is sandy tan, with a dark brown eye patch. Take Pip's treats. Press E at the dog to hold one out. It follows you to the van. Walkers leave it alone. Pip pays 60 scrap and 1 box of books. Pip adds 1 box of radio parts.",
      journal:
        "You brought a dog home from Corner Grocery. Pip smiled all evening. The dog drank from Pip's bowl by the gate. I added one more supper to the ledger.",
      done: "Pip kneels down, and {dog} licks their face. Pip laughs and says thank you, again and again. The dog eats 1 food every 2 days. It also barks when walkers come close to the cabin. Pip says that makes it a lookout, too.",
      after:
        "Pip says {dog} has a home now. So does the crew. Pip wants to build Finn's treehouse one day. It will have a bucket on a pulley. Then {dog} can ride up too. June says {dog} stays on the ground. Pip grins and says they will see.",
    },
  });
  T.crew.errands = Object.assign(T.crew.errands || {}, {
    "june-e1": {
      title: "Seeds for more beans",
      brief: "June needs {count} of these within {days} days: {item}. She wants more beans to grow before the cold comes. She will pay {reward}.",
      done: "June tucks the seed packets into her cardigan pocket. Then she writes them in the ledger. She pats the pocket twice, just to be sure.",
    },
    "june-e2": {
      title: "Good dirt for the beds",
      brief: "June needs {count} of these within {days} days: {item}. She says good dirt is half of any garden. The other half is work. She will pay {reward}.",
      done: "June pats the soil like an old friend. She says the beds will thank you. Beds are slow, so June says thanks for them.",
    },
    "june-e3": {
      title: "Clean water for the beds",
      brief: "June needs {count} of these within {days} days: {item}. She wants clean water for the beds. Her beans hate gray water. She will give you {reward} from her shelf.",
      done: "June rinses the filter in clean water. That is what its tag says to do. Then she sets it by the sink.",
    },
    "june-e4": {
      title: "Kits for June's shelf",
      brief: "June needs {count} of these within {days} days: {item}. She wants kits on her shelf for scrapes and colds. Somebody always needs one. She will pay {reward}.",
      done: "June stocks her shelf with the kits. She reads the list inside every lid. She likes to know what she has.",
    },
    "tomas-e1": {
      title: "Parts for the van",
      brief: "Tomas needs {count} of these within {days} days: {item}. The van needs a new belt and spark plugs. He says the old belt is getting loud. He will pay {reward}.",
      done: "Tomas sorts the parts on the porch. He checks the new belt twice. Then he pats the van like a good mule.",
    },
    "tomas-e2": {
      title: "Nails for the fence",
      brief: "Tomas needs {count} of these within {days} days: {item}. Loose fence boards hold better with two nails each. One nail lets a board wiggle. He will pay {reward}.",
      done: "Tomas wraps the box in an old shirt. That way it will not rattle. Then he gets to work on the fence.",
    },
    "tomas-e3": {
      title: "Fuel for power and traps",
      brief: "Tomas needs {count} of these within {days} days: {item}. Fuel feeds the Power room and blast traps. He will trade {reward} he made himself. He is proud of it.",
      done: "Tomas stores the fuel outside, away from the stove. He never fills a can past the line. Fuel needs room in the heat, he says.",
    },
    "tomas-e4": {
      title: "Good tools for good fixes",
      brief: "Tomas needs {count} of these within {days} days: {item}. His tools are worn out. Good fixes need good tools. Even his pliers are tired, he says. He will pay {reward}.",
      done: "Tomas wipes every tool clean before he puts it away. Mr. Ortiz's note says to do it that way. Tomas always does.",
    },
    "pip-e1": {
      title: "Boards for the treehouse",
      brief: "Pip needs {count} of these within {days} days: {item}. Pip is saving boards for Finn's treehouse. It will have a rope ladder and a lookout. Pip will pay {reward}.",
      done: "Pip stacks the boards behind the cabin. They are ready for the day the fence is strong. Pip counts them every morning.",
    },
    "pip-e2": {
      title: "Wire for a longer antenna",
      brief: "Pip needs {count} of these within {days} days: {item}. Pip wants a longer antenna, to hear farther voices. Pip wants to know who is out there. Pip will pay {reward}.",
      done: "Pip winds the wire into a neat coil. Then Pip labels it in big, messy letters. The label says: ANTENNA WIRE, DO NOT TOUCH.",
    },
    "pip-e3": {
      title: "Books to read at night",
      brief: "Pip needs {count} of these within {days} days: {item}. At night, Pip reads by the stove. Pip wants something new. Pip read the old ones twice. Pip will pay {reward}.",
      done: "Pip reads the first page of every book. Then Pip picks one to read first. Pip says a first page is like a handshake.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
