/* Reading level 1: the crew's story quests and errands (T.crew.quests, T.crew.errands). The talk, tips,
   reports and the dog are in level1-crew.js. Facts: js/story-quests.js and js/story-crew.js (ERRANDS).
   See docs/CREW.md and docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[1] = root.ZSR.TEXT[1] || { level: 1 });
  T.crew = T.crew || {};
  T.crew.quests = Object.assign(T.crew.quests || {}, {
    /* ---------- June ---------- */
    "june-1": {
      title: "Bag of sunflower seeds",
      brief:
        "June wants to plant sunflowers by the fence. Her old school kids did that too. Go to Corner Grocery, east of the cabin. Find the fish tank by the SEAFOOD sign. The seeds lie on the floor there. Look for a brown paper bag with a sunflower. You get 20 scrap and 1 seed packet.",
      tag: "This paper bag holds sunflower seeds. They come from the big bins. The price sticker says: for snacks or for planting.",
      journal: "You brought a bag of sunflower seeds. I planted them by the fence, one finger deep. Pip watered every one. June's giants, Pip says.",
      done: "June holds the bag like it is gold. She says sunflowers grow taller than the fence. They turn their faces to the sun. June thanks you with a big smile.",
      after:
        "June tells you about her school garden. Each spring, kids planted sunflowers by the school fence. Each fall, they saved the seeds in envelopes. Each kid wrote their name on one. One boy wrote down his sunflower's height every day. June says he would keep a good ledger.",
    },
    "june-2": {
      title: "Roll of knee tape",
      brief:
        "June's knees ache when she kneels in the garden. Go to Mile 9 Pharmacy, northwest of the cabin. Mr. Okafor sold tape there for sore knees. A roll lies by the giant toothbrush. It is outside the STAFF ONLY door. The roll is wide and blue. You get 30 scrap and 1 medical kit.",
      tag: "It is a wide roll of blue tape. It comes from Mile 9 Pharmacy. The label says: for sore knees and ankles.",
      journal: "You brought me knee tape from Mile 9 Pharmacy. I taped my knees and worked in the dirt until supper. Not bad for June.",
      done: "June laughs. She says Mr. Okafor was right. For years, he told her to buy this tape. Now she can kneel in the dirt again. So the crew gets 1 more food every day. June thanks you.",
      after:
        "June tells you about Mr. Okafor. He kept her knee pills in a paper bag. For twenty years, she forgot to pick them up. She paid him back in tomatoes every summer. June says the town was like that. People kept things safe for each other.",
    },
    "june-3": {
      title: "Rosa's jar of beans",
      brief:
        "June's friend Rosa grew beans from June's seeds. Each fall, Rosa saved June a jar. Go to Greenhouse Row, west of the cabin. Look under the seed racks by the big gnome. The jar has a red lid and spotted beans. You get 30 scrap and 2 seed packets. June adds 1 bag of soil.",
      tag: "This glass jar holds dry, spotted beans. It has a red lid. Rosa's label says: For June. The beans came up.",
      journal: "You brought home Rosa's jar from Greenhouse Row. The label says: For June. I read it three times. I put it in the window.",
      done: "June reads the label. Then she smiles for a long time. She says Rosa never wasted words. These words are Rosa's best ever, June says. She hugs the jar and thanks you.",
      after:
        "June tells you about Rosa. They met at a plant sale. They both grabbed the last tomato plant. So they shared it. Then they traded seeds every spring. June gave beans, and Rosa gave squash. June will save the best beans from this jar. They are for Rosa.",
    },
    "june-4": {
      title: "First-aid book",
      brief:
        "June wants a first-aid book. It can help her patch up the crew. Go to the Public Library, north of the cabin. In the MEDIA room, find the owl statue. The book lies on the floor there. It is thick and blue, with folded page corners. June gives you 40 scrap and 1 medical kit.",
      tag: "This thick blue book comes from the Public Library. Some page corners are folded down. Those pages are about cuts, burns and sprains.",
      journal: "You brought me the Public Library's first-aid book. I read it by the stove until the candle burned down. Tomas calls me Student June.",
      done: "June thanks you and starts to read right away. She says the folded corners show the best pages. Those pages helped people the most. Now her patch-up gives you 20 more health.",
      after:
        "June learned first aid in her school garden. Kids got bee stings and scraped knees. So the nurse showed her what to do. She kept bandages in the tool shed. Brave kids got lollipops. June says the crew is braver. But the crew gets no lollipops.",
    },
    "june-5": {
      title: "Garden club seed box",
      brief:
        "June wants seeds for a bigger garden. Go to Lincoln Middle School, northeast of the cabin. June once helped its garden club save seeds. Look in the SCIENCE room, by the big brain. Find a seed box with a red label. You get 50 scrap and 2 seed packets. June adds 2 bags of soil.",
      tag: "This cardboard box is full of seed envelopes. They are sorted by plant. The red label says: Lincoln Garden Club. Save your best seeds.",
      journal: "You brought the seed box from Lincoln Middle School. Pip and I sorted seeds at the kitchen table. Late, Pip yawned: Good night, June.",
      done: "June reads every envelope out loud. There are beans, squash, corn, peppers and sunflowers. She plants them in every corner of the yard. Now the crew gets 2 more food every day. June thanks you.",
      after:
        "June found the kids' names on the envelopes. They wrote them in pencil. June hopes those kids are safe, wherever they are. She will save seeds from this crop for them. June says a seed is a promise. It promises that next year will come.",
    },

    /* ---------- Tomas ---------- */
    "tomas-1": {
      title: "Socket wrench",
      brief:
        "Tomas has his father's old wrench. It is worn so smooth that it slips. Go to Reyes Hardware, northeast of the cabin. A new socket wrench lies by the tool wall. It is beside the orange ladder. It has a red handle and a silver head. You get 25 scrap and 1 box of nails.",
      tag: "This socket wrench has a red handle. It is still on its shop clip. Mr. Reyes's price sticker is on the handle.",
      journal: "You brought Tomas a new wrench from Reyes Hardware. He worked under the van all evening. Then he came out whistling.",
      done: "Tomas tries the wrench on a bolt and grins. He puts his father's wrench on the shelf. It stays there for luck, not for work. Tomas thanks you.",
      after:
        "Tomas tells you how he learned to fix things. When he was small, he handed his father tools. But first he had to say each tool's name. If he said the wrong name, his father waited. So Tomas learned to read the labels on everything.",
    },
    "tomas-2": {
      title: "Thank-you card",
      brief:
        "Tomas wants to read his father's thank-you card. His father's teacher, Mr. Ortiz, got it. Ortiz Auto is east of the cabin. Look in the PARTS room, by the engine crane. Find a white envelope with a red seal. You get 30 scrap and 1 spool of wire. Tomas adds 1 box of engine parts.",
      tag: "This white envelope has a red seal. A thank-you card is inside. It says: Thank you for teaching me. Never rush a job.",
      journal: "You brought Tomas his father's card from Ortiz Auto. He put it on the van's dashboard. Now it rides along on every trip.",
      done: "Tomas knows the writing at once. It is his father's. He reads the card twice. His father never said thank you out loud. So Tomas is glad to see it written down. Then Tomas thanks you, out loud.",
      after:
        "Tomas tells you about his father's garage. It was small, with one lift. Its radio only played old songs. His father painted Mr. Ortiz's rule over the door. It said: never rush a job. Tomas wants to show Mr. Ortiz the van someday.",
    },
    "tomas-3": {
      title: "Fire crew toolbox",
      brief:
        "Tomas wants to make crowbars from scrap. He needs a pry bar to copy. Go to Station 12, northwest of the cabin. Its fire crew kept one in their toolbox. Look by the gear racks near the RESCUE door. Find a long red toolbox with a gray handle. You get 40 scrap and 1 crowbar.",
      tag: "Station 12 is painted on this long red toolbox. A heavy pry bar lies inside.",
      journal: "You brought home the toolbox from Station 12. Before supper, Tomas drew the pry bar. He used the back of a box.",
      done: "Tomas checks the pry bar from end to end. Now he can make crowbars like it, from scrap. Each one costs only 10 scrap to make. Tomas thanks you.",
      after:
        "Tomas went to Station 12 with his father. They fixed the fire truck. Tomas sat in the driver's seat but touched nothing. Chief Dunn talked about good tools. He said you trust them when you are scared. Tomas says the van is like that. So is the crew.",
    },
    "tomas-4": {
      title: "Box of fence brackets",
      brief:
        "Steel fence brackets let Tomas use boards, not scrap. Go to Ridge Lumber, northeast of the cabin. Carla, the yard boss, kept a box there. Look in the SAW SHOP, by the band saw. The heavy box has a red label. You get 45 scrap and 2 spike traps. Tomas adds 2 pieces of lumber.",
      tag: "This box from Ridge Lumber holds steel fence brackets. It is heavy. Carla's red label says to use two screws each. Then it holds.",
      journal: "You brought Tomas fence brackets from Ridge Lumber. He lined them up on the porch by size. I had to step around them.",
      done: "Tomas opens the box and counts the brackets twice. Now old boards fix the fence and the cabin. From now on, the crew's fixes cost no scrap. Tomas thanks you.",
      after:
        "Tomas tells you why he likes fixing the fence. Under a car, his father did the hard part. Tomas just held the light. The fence is his own first big job. He scratches a small T on each board.",
    },
    "tomas-5": {
      title: "Rescue van manual",
      brief:
        "Tomas needs a manual to rebuild the van. Go to St. Anne Annex, northwest of the cabin. It is very dangerous. Tomas's father fixed its rescue van. It has our engine. Look behind the EMERGENCY sign, by that van. Find a thick blue book. Tomas pays 70 scrap. He adds 2 boxes of engine parts.",
      tag: "This thick manual is for the rescue van. It is blue and greasy. Pencil notes fill the edges of each page.",
      journal: "You brought home the rescue van's manual. It came from St. Anne Annex. Tomas read it at the kitchen table all night.",
      done: "Tomas stops at the pencil notes. The writing is his father's. It matches the thank-you card. With the manual, he rebuilds the van. Now a fully fixed van has 40 more health. Tomas thanks you.",
      after:
        "Tomas's father wrote notes on every page. One says check the belt. One says listen for the knock. One says never rush a job. Tomas feels like he works with his father again. He reads one page every night. June reads her ledger that way too.",
    },

    /* ---------- Pip ---------- */
    "pip-1": {
      title: "Tin of dog treats",
      brief:
        "Pip wants to be ready for a dog. The crew has no dog yet. Go to Gas-N-Go, west of the cabin. Look by the slushie machine, under the LOTTO poster. A tin of dog treats lies there. The tin is red, with a white band. Pip pays 20 scrap and 1 spool of wire.",
      tag: "This red tin has a white band. Dog treats are inside. It rattles, and it is almost full.",
      journal: "You brought Pip dog treats from Gas-N-Go. Pip set the tin under their dog drawing. That dog has no name yet.",
      done: "Pip shakes the tin and listens to it rattle. Pip says dogs come to people with treats. Now the crew has treats. Pip thanks you with a big grin.",
      after:
        "Pip tells you about Biscuit, the Hollis family's dog. Biscuit could sit, shake and roll over. Lucy's drawing says so. Biscuit went north with the family. Pip hopes Biscuit gets lots of treats. The Hollises may come back someday. Then Biscuit will have a friend here.",
    },
    "pip-2": {
      title: "Binoculars",
      brief:
        "Pip wants to see walkers from farther away. Go to the Water Tower, northwest of the cabin. Its pump crew used binoculars to watch the river. The binoculars are in the WORKSHOP, by the rowboat. Find a yellow case with a brown strap. You get 30 scrap. Pip adds 1 box of radio parts.",
      tag: "These black binoculars sit in a yellow case. Someone scratched words on the strap. The words say: river watch.",
      journal: "You brought Pip binoculars from the Water Tower. Pip watched the trees from the porch roof. I called: Supper, Pip! Pip said: Coming, June!",
      done: "Pip looks at everything through the binoculars, even you. From the porch roof, Pip sees walkers much sooner. On watch, Pip calls waves 10 seconds sooner now. Pip thanks you and grins.",
      after:
        "Pip saw something from the porch roof. Far past the trees, smoke rose from a chimney. Pip says smoke means someone is cooking supper. So someone is still out there. Pip drew the smoke on the wall. Next to it is a question mark.",
    },
    "pip-3": {
      title: "Broken boom box",
      brief:
        "Pip wants a big magnet. It can pull nails from the dirt for scrap. Tomas says big speakers have big magnets. Go to Signal Electronics, north of the cabin. Look by the TV wall, outside the REPAIRS room. Find a blue-green boom box with two speakers. Pip pays 35 scrap and 1 box of books.",
      tag: "This blue-green boom box has two big round speakers. A repair tag says the speakers are fine. Everything else is broken.",
      journal: "You brought Pip a boom box from Signal Electronics. Pip took out the magnet. Pip dragged it around the yard until dark.",
      done: "Pip pulls the big magnet out of one speaker. Pip ties it to a string. Every evening, Pip drags it along the fence. It pulls up nails and bolts. Now Pip brings in 3 scrap every day. Pip thanks you.",
      after:
        "Pip shows you what the magnet found. There are nails, bolts and a bottle cap. There is a metal tag shaped like a bone. The name on it is worn away. So Pip keeps the tag for a dog. The crew does not have that dog yet.",
    },
    "pip-4": {
      title: "Dog leash",
      brief:
        "Pip wants a leash ready for a dog. Go to the 4th Precinct, north of the cabin. Pip saw one in its lost-and-found. Look on the GARAGE floor, by the riot shields. The leash is red, with a metal clip. Pip pays 50 scrap and 1 spool of wire. Pip adds 1 box of books.",
      tag: "This red leash has a metal clip. Its paper tag says: found by the front steps. No dog was with it.",
      journal: "You brought Pip a leash from the 4th Precinct. Pip hung it by the front door. That is where a leash belongs.",
      done: "Pip clips the leash to their belt to practice. Now the crew has treats and a leash. All that is missing is the dog. Pip thanks you.",
      after:
        "Pip tells you about a police dog. It came to Pip's class once. It sat still while the whole class talked. The officer said one quiet word. Then it moved. Pip says a dog picks its people. So Pip practices being calm and quiet.",
    },
    "pip-5": {
      title: "A dog for Pip",
      brief:
        "Pip's binoculars found the barking dog. Go to Corner Grocery, east of the cabin. It sleeps by the forklift on the LOADING DOCK. It is sandy tan, with a dark eye patch. Hold out Pip's treats with E. It follows you to the van, safe from walkers. Pip pays 60 scrap and 1 box of books. Pip adds 1 box of radio parts.",
      journal: "You brought a dog home from Corner Grocery. Pip smiled all evening. The dog drank from Pip's bowl by the gate.",
      done: "Pip kneels down, and the dog licks their face. Pip says thank you, again and again. The dog eats 1 food every 2 days. It barks when walkers come close to the cabin.",
      after:
        "Pip says {dog} has a home now. So does the crew. Pip wants to build Finn's treehouse one day. It will have a bucket on a pulley. Then {dog} can ride up too. June says {dog} stays on the ground. Pip says they will see.",
    },
  });
  T.crew.errands = Object.assign(T.crew.errands || {}, {
    "june-e1": {
      title: "Seeds for more beans",
      brief: "June needs {count} of these in {days} days: {item}. She wants more beans to grow before the cold. She will pay {reward}.",
      done: "June tucks the seed packets in her sweater pocket. Then she writes them in her ledger.",
    },
    "june-e2": {
      title: "Good dirt for the beds",
      brief: "June needs {count} of these in {days} days: {item}. She says good dirt is half of any garden. She will pay {reward}.",
      done: "June pats the soil like an old friend. She says the beds will thank you.",
    },
    "june-e3": {
      title: "Clean water for the beds",
      brief: "June needs {count} of these in {days} days: {item}. She wants clean water for the beds. She will give you {reward} from her shelf.",
      done: "June rinses the filter in clean water. Its tag says to do that. Then she sets it by the sink.",
    },
    "june-e4": {
      title: "Kits for June's shelf",
      brief: "June needs {count} of these in {days} days: {item}. Her shelf needs kits for scrapes and colds. She will pay {reward}.",
      done: "June fills her shelf with the kits. She reads the list inside every lid.",
    },
    "tomas-e1": {
      title: "Parts for the van",
      brief: "Tomas needs {count} of these in {days} days: {item}. The van needs a new belt and spark plugs. He will pay {reward}.",
      done: "Tomas sorts the parts on the porch. He checks the belt two times.",
    },
    "tomas-e2": {
      title: "Nails for the fence",
      brief: "Tomas needs {count} of these in {days} days: {item}. Loose fence boards hold better with two nails each. He will pay {reward}.",
      done: "Tomas wraps the box in a shirt. That way it will not rattle. Then he gets to work.",
    },
    "tomas-e3": {
      title: "Fuel for power and traps",
      brief: "Tomas needs {count} of these in {days} days: {item}. Fuel feeds the Power room and blast traps. He will trade {reward} he made himself.",
      done: "Tomas keeps the fuel outside, away from the stove. He never fills a can past the line.",
    },
    "tomas-e4": {
      title: "Good tools for good fixes",
      brief: "Tomas needs {count} of these in {days} days: {item}. His tools are worn out. Good fixes need good tools. He will pay {reward}.",
      done: "Tomas wipes each tool clean, then puts it away. That is what Mr. Ortiz's note says.",
    },
    "pip-e1": {
      title: "Boards for the treehouse",
      brief: "Pip needs {count} of these in {days} days: {item}. Pip is saving boards for Finn's treehouse. Pip will pay {reward}.",
      done: "Pip stacks the boards behind the cabin. They wait there until the fence is strong.",
    },
    "pip-e2": {
      title: "Wire for an antenna",
      brief: "Pip needs {count} of these in {days} days: {item}. Pip wants a longer antenna to hear farther voices. Pip will pay {reward}.",
      done: "Pip winds the wire into a neat coil. Pip labels it in big, messy letters.",
    },
    "pip-e3": {
      title: "Books to read at night",
      brief: "Pip needs {count} of these in {days} days: {item}. Pip wants something new to read by the stove. Pip will pay {reward}.",
      done: "Pip reads the first page of every book. Then Pip picks one to read.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
