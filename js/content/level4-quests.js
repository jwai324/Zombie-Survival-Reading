/* Reading level 4: the crew's story quests and errands (T.crew.quests, T.crew.errands). The talk, tips,
   reports and the dog are in level4-crew.js. Facts: js/story-quests.js and js/story-crew.js (ERRANDS).
   See docs/CREW.md and docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[4] = root.ZSR.TEXT[4] || { level: 4 });
  T.crew = T.crew || {};
  T.crew.quests = Object.assign(T.crew.quests || {}, {
    /* ---------- June: the garden, her knees, Rosa, first aid, seeds for everyone ---------- */
    "june-1": {
      title: "Bag of sunflower seeds",
      brief: "June wants to plant sunflowers along the fence, like the kids at her old school did every spring. She says a fence looks a lot less grim with tall yellow faces peeking over it.\n\nCorner Grocery is east of the cabin. The seeds lie on the floor by the fish tank, near the SEAFOOD sign. Look for a brown paper bag with a sunflower printed on the front. June will give you 20 scrap and 1 seed packet for it.",
      tag: "A brown paper bag of sunflower seeds from the bulk bins, rolled shut at the top. The price sticker says: for snacks or for planting. Someone circled the word planting twice in pencil.",
      journal: "You brought home a bag of sunflower seeds. I planted them along the fence, one finger deep, and Pip watered every one. “June, how long until they bloom?” Pip asked. Not long enough, I said.",
      done: "June holds the bag in both hands, as if it were full of gold. She gives it a gentle shake and smiles at the dry rattle inside. She says sunflowers grow taller than the fence and turn their faces to the sun. “Walkers never look up,” she adds. “Flowers do.” She is already looking at the fence, picking the spot for the first row.",
      after: "June talks about her old school garden while she paces out the new row by the fence. Every spring, her students planted sunflowers by the school fence. Every fall, they saved the seeds in envelopes with their names on them. One boy wrote down how tall his sunflower was every day, even the rainy ones. He measured with a yardstick taller than he was. June says that boy would be good at keeping a ledger.",
    },
    "june-2": {
      title: "Roll of knee tape",
      brief: "June's knees ache when she kneels in the garden, and the cold mornings make it worse. She says her knees are older than the cabin and twice as noisy.\n\nMile 9 Pharmacy is northwest of the cabin. Mr. Okafor there sold a tape that holds a sore knee steady. A roll lies on the floor by the giant toothbrush, outside the STAFF ONLY door. It is a wide roll of blue tape. June will give you 30 scrap and 1 medical kit.",
      tag: "A wide roll of blue tape from Mile 9 Pharmacy. The label says: for sore knees and ankles. Below it, in small print: stretch it gently, and never wrap it too tight.",
      journal: "You brought me a roll of knee tape from Mile 9 Pharmacy. I taped both knees and worked in the dirt until supper, kneeling like a young woman again. “June, you are humming,” Tomas said. I was.",
      done: "June laughs out loud when she sees the blue tape. She says Mr. Okafor told her to buy this tape for years, and she always said next week. She wraps both knees on the spot, snug but not too tight. With her knees taped, she can kneel in the dirt again and tend the beds all day. More hours in the garden mean more to eat. From now on, the crew gets 1 more food every day.",
      after: "June tells you about Mr. Okafor, the careful pharmacist at Mile 9. For twenty years, he kept her knee pills ready in a paper bag with her name on it. For twenty years, she forgot to pick them up. He never scolded her once. She paid him back in tomatoes every summer, the fattest ones she grew. June says the town was full of people who kept things safe for each other. She thinks some of them still are.",
    },
    "june-3": {
      title: "Rosa's jar of beans",
      brief: "Every fall, June's old friend Rosa saved her a jar of beans grown from June's own seeds. It was their yearly trade, and June misses it more than she admits.\n\nRosa's place, Greenhouse Row, is west of the cabin. The jar sits under the seed racks by the gate, beside the big gnome. It has a red lid and speckled beans inside. June will give you 30 scrap, 2 seed packets and 1 bag of soil.",
      tag: "A glass jar of dry speckled beans with a red lid, packed so full it barely rattles. Rosa's label is written in neat green ink: For June. The beans came up.",
      journal: "You brought home Rosa's jar of beans from Greenhouse Row. I read the label three times, then set the jar on the sunny windowsill. “June, are you crying?” Pip asked. Dust, I said.",
      done: "June reads the label and smiles for a long time without saying a word. She turns the jar slowly, and the speckled beans tumble against the glass like tiny marbles. Then she says Rosa never wasted words, not on a letter and not on a seed packet. These, she says, are the best ones Rosa ever wrote. She holds the jar close for a moment before she finds it a safe spot.",
      after: "June tells you about Rosa, her oldest friend in town. They met at a plant sale years ago, both reaching for the last tomato plant. Neither one would let go, so they shared it and split the tomatoes all summer. After that, they traded seeds every spring: June's beans for Rosa's squash. June will save the best beans from this jar for Rosa. She says a trade is not finished until both friends have planted.",
    },
    "june-4": {
      title: "First-aid book",
      brief: "June wants a first-aid book, so she can patch the crew up better. She knows bandages and bee stings, but the crew keeps finding new ways to get scraped.\n\nThe Public Library is north of the cabin. The book lies on the floor of the MEDIA room, beside the owl statue. It is a thick blue book with folded page corners. Someone marked the useful pages, June guesses, and that saves her a lot of reading. June will give you 40 scrap and 1 medical kit.",
      tag: "A thick blue first-aid book from the Public Library, its spine cracked from use. The corners are folded down on the pages about cuts, burns and sprains. The due date stamped inside is long past.",
      journal: "You brought me a first-aid book from the Public Library. I read it by the stove until the candle burned down to a stub. “June, it is late,” Tomas said. Not for a student, I said.",
      done: "June has already started reading before you finish handing it over. She runs a finger along the folded corners. She says those corners show which pages helped people most, like a path worn into grass. Now she knows better ways to clean a scrape and wrap a sprain. From now on, her patch-up gives you 20 more health. You are still not allowed to need it, she adds.",
      after: "June tells you she learned first aid in her school garden, not in a hospital. Kids got bee stings and scraped knees there all the time. So the school nurse taught her what to do. She kept bandages in the tool shed, right beside the trowels, and lollipops for the brave ones. The crew is braver, June says, but they still get no lollipops. Pip has asked twice, and the answer is still no.",
    },
    "june-5": {
      title: "Garden club seed box",
      brief: "June wants good seeds for a bigger garden, one that could feed the crew through a long winter. She once helped the garden club at Lincoln Middle School, northeast of the cabin. The club kept its best seeds in a box, the way a family keeps its good dishes.\n\nThe box is in the SCIENCE room, on the floor beside the big brain. It is a cardboard box with a red label. June will give you 50 scrap, 2 seed packets and 2 bags of soil.",
      tag: "A cardboard box full of paper seed envelopes, sorted by plant and standing in tidy rows. The red label says: Lincoln Garden Club, save your best seeds. Every envelope has a name penciled on it.",
      journal: "You brought home the garden club's seed box from Lincoln Middle School. Pip and I sorted the envelopes on the kitchen table until late. “June, there are sunflowers in here,” Pip said. Of course there are.",
      done: "June reads every envelope out loud, like a teacher calling roll: beans, squash, corn, peppers and sunflowers. Her voice catches a little on the sunflowers. Then she rolls up her sleeves. She plants the seeds in every spare corner of the yard, even the patch Tomas called hopeless. From now on, the crew gets 2 more food every day. June says the yard has finally become a garden.",
      after: "June found the kids' names on the envelopes, written in pencil in big, careful letters. Some had tiny drawings beside them: a sun, a worm, a lopsided carrot. She hopes those kids are safe, wherever they are tonight. She will save seeds from this harvest for them, in new envelopes with their names copied on. June says a seed is a promise that there will be a next year.",
    },

    /* ---------- Tomas: his father's tools, Mr. Ortiz, crowbars, the fence, the van ---------- */
    "tomas-1": {
      title: "Socket wrench",
      brief: "Tomas's wrench was his father's, and it is worn so smooth that it slips off bolts. It slipped twice this week, and he has the scraped knuckles to prove it. He says a slipping wrench is worse than no wrench at all.\n\nReyes Hardware is northeast of the cabin. A new socket wrench lies by the tool wall, beside the orange ladder. It has a red handle and a shiny silver head. Tomas will give you 25 scrap and 1 box of nails.",
      tag: "A socket wrench with a red handle and a shiny silver head, still on its shop clip. Mr. Reyes's price sticker is on the handle, with two words scrawled under the price: lifetime warranty.",
      journal: "You brought Tomas a new socket wrench from Reyes Hardware. He spent the whole evening under the van and came out whistling, with grease to his elbows. “June, the van runs smoother already,” he said. I took his word for it.",
      done: "Tomas tries the wrench on the most stubborn bolt on the van. It turns on the first pull, and he grins from ear to ear. He says his father's wrench goes on the shelf now, for luck, not for work. It has earned a rest after all those years under cars. He props it on the shelf in Gus's room, handle out, like a trophy.",
      after: "Tomas tells you how he learned to fix things. As a small boy, he lay beside his father under cars and handed him the tools. But he had to say each tool's name first. If he said the wrong name, his father simply waited, with his hand held out. He never scolded, and he never gave a hint. Tomas says that is how he learned to read the labels on everything.",
    },
    "tomas-2": {
      title: "Thank-you card",
      brief: "Tomas's father once sent his old teacher, Mr. Ortiz, a thank-you card. Tomas has never read it, and he wants to. He says his father never said much out loud, so whatever he wrote down must have mattered.\n\nOrtiz Auto is east of the cabin. The card lies in the PARTS room, on the floor beside the engine crane. It is in a white envelope with a red seal. Tomas will give you 30 scrap, 1 box of engine parts and 1 spool of wire.",
      tag: "A thank-you card in a white envelope with a red seal, soft at the corners from handling. Inside, in slanted pen: thank you for teaching me never to rush a job.",
      journal: "You brought Tomas his father's thank-you card from Ortiz Auto. He propped it on the van's dashboard, so it rides along on every trip. “June, the van has a co-pilot now,” he said. Pip asked if it needs a seatbelt.",
      done: "Tomas knows the handwriting at once: it is his father's, every letter leaning forward. He reads the card twice, slowly. He says his father never said thank you out loud. So it is good to see it written down, plain as a label. Tomas folds the card back into its envelope with great care. Then he goes to check the van's oil, which does not need checking.",
      after: "Tomas tells you about his father's garage. It was small, with one lift, a coffee can of loose bolts, and a radio. The radio only played old songs, no matter how you turned the dial. Over the door, his father painted Mr. Ortiz's rule: never rush a job. Tomas read it every morning on his way in. He wants to show Mr. Ortiz the van someday. He says the old man would find three things wrong, and Tomas would fix them all.",
    },
    "tomas-3": {
      title: "Fire crew toolbox",
      brief: "Tomas wants to make crowbars from scrap, so he needs a good pry bar to copy. Fire crews pry open stuck doors for a living, so theirs should be the best in town.\n\nThe fire crew at Station 12, northwest of the cabin, kept a pry bar in their toolbox. Their toolbox lies by the gear racks, near the big door marked RESCUE. It is a long red toolbox with a gray handle. Tomas will give you 40 scrap and 1 crowbar.",
      tag: "A long red toolbox with Station 12 painted on the side in white letters. A heavy pry bar lies inside, wrapped in an old rag. It is chipped and scuffed, and clearly well loved.",
      journal: "You brought home the fire crew's toolbox from Station 12. Tomas drew the pry bar on the back of a box before supper, measuring every curve twice. “June, look at that bend,” he said. I looked. It was a bend.",
      done: "Tomas studies the pry bar from end to end, turning it slowly in the light. He taps it, weighs it in his hand, and measures the bend at the tip. He can make crowbars the same way now, from scrap. From now on, a crowbar costs only 10 scrap to build. Tomas says every jammed lock in town should start worrying.",
      after: "Tomas once went to Station 12 with his father, to fix the fire truck. He was nine, and the truck looked as big as a house. The fire crew let him sit in the driver's seat, but touch nothing. He sat on his hands. Afterward, Chief Dunn said a good tool is one you trust when you are scared. Tomas says the van is like that, and so is the crew.",
    },
    "tomas-4": {
      title: "Box of fence brackets",
      brief: "Every fence repair eats scrap, and Tomas hates watching the pile shrink. Steel brackets would let him fix the fence with old boards instead of scrap.\n\nCarla, the yard boss at Ridge Lumber, northeast of the cabin, kept a box of these brackets. It is in the SAW SHOP, on the floor beside the band saw. It is a heavy cardboard box with a red label. Tomas will give you 45 scrap, 2 pieces of lumber and 2 spike traps.",
      tag: "A heavy box of steel fence brackets from Ridge Lumber, each one bent into a neat L. Carla wrote on the red label in thick marker: two screws each, and it holds.",
      journal: "You brought Tomas a box of fence brackets from Ridge Lumber. He lined them up on the porch by size, like soldiers on parade. “June, do not step on the small ones,” he warned. I tiptoed around his army.",
      done: "Tomas opens the box and counts the brackets twice, lips moving. Then he grins. He can fix the fence and the cabin with old boards now, the ones nobody wants. A bracket on each side, two screws each, and a loose board holds like new. From now on, the crew's repairs cost no scrap. Tomas says the scrap pile can finally stop shrinking.",
      after: "Tomas tells you why he likes fixing the fence. Under a car, his father always did the hard part, and Tomas held the light. He held a lot of lights over the years. The fence is the first big job that is all his own, start to finish. He scratches a small T on every board he puts back. Look closely, and you will find his mark all around the yard.",
    },
    "tomas-5": {
      title: "Rescue van manual",
      brief: "Tomas needs a service manual to rebuild the van from the ground up. His father used to fix the rescue van at St. Anne Annex, northwest of the cabin. That rescue van has the same engine as the crew's van.\n\nBe careful: few places in town are as dangerous. The manual is in the garage behind the EMERGENCY sign, beside the rescue van. It is a thick blue book. Tomas says to go in at full health, move quietly, and leave once you have it. He will give you 70 scrap and 2 boxes of engine parts.",
      tag: "A thick service manual for the rescue van, blue and greasy, with a bent cover. Someone wrote notes in pencil in the margins, in small, slanted letters, on nearly every page.",
      journal: "You brought home the rescue van's manual from St. Anne Annex. Tomas read it at the kitchen table all night, one finger on the margins. At dawn he said, “June, somebody knew this engine.” I made him breakfast.",
      done: "Tomas flips through the manual and stops at the notes in the margins. The handwriting is his father's, the same as on the thank-you card. He goes very quiet for a while. Then he rolls up his sleeves. With the manual, he rebuilds the van, bolt by bolt and belt by belt. From now on, the van has 40 more health when it is fully fixed.",
      after: "Tomas shows you the manual. His father wrote small notes on every page. They say: check the belt, listen for the knock, never rush a job. Some notes are jokes, and one is a grocery list. Tomas says it feels like working next to him again. He reads one page every night by the stove, the way June reads her ledger. He is in no hurry to reach the last page.",
    },

    /* ---------- Pip: ready for a dog, the lookout, scrap, a leash, and the dog ---------- */
    "pip-1": {
      title: "Tin of dog treats",
      brief: "Pip wants to be ready for a dog, even though the crew has none yet. Pip has already drawn a dog with no name and pinned it up in Lucy's room. Now Pip wants something a real dog would come running for.\n\nGas-N-Go is west of the cabin. A tin of dog treats lies by the slushie machine, under the LOTTO poster. The tin is red, with a white band around the middle. Pip will give you 20 scrap and 1 spool of wire.",
      tag: "A red tin of dog treats with a white band around the middle. It rattles when you shake it, and it is almost full. The lid says: for good dogs only.",
      journal: "You brought Pip a tin of dog treats from Gas-N-Go. Pip put it under their drawing of a dog with no name yet. “June, now the drawing has snacks,” Pip said. I could not argue with that.",
      done: "Pip shakes the tin and listens to it rattle, eyes closed, as if it were music. Then Pip shakes it again, just to be sure. Pip says a dog will come to someone who has treats, and now the crew has treats. Then the tin goes under Pip's drawing of a dog, ready for the real one.",
      after: "Pip tells you about Biscuit, the Hollis family's dog. Lucy's drawing says Biscuit could sit, shake and roll over. Pip has practiced all three commands on a sock, just in case. Biscuit went north with the family, and Pip hopes Biscuit gets lots of treats on the road. If the Hollises come back, Pip says, Biscuit will have a friend here.",
    },
    "pip-2": {
      title: "Binoculars",
      brief: "Pip keeps watch over the trees and wants to see walkers coming from farther away. Pip says the trees hide too much, and a lookout who sees late is barely a lookout.\n\nThe pump crew at the Water Tower, northwest of the cabin, kept binoculars to watch the river. They lie in the WORKSHOP, on the floor beside the rowboat. They are in a yellow case with a brown strap. Pip will give you 30 scrap and 1 box of radio parts.",
      tag: "Black binoculars in a yellow case with a brown strap, dusty but unbroken. Scratched on the strap: river watch. The lenses are clean, as if someone wiped them every morning.",
      journal: "You brought Pip binoculars from the Water Tower. Pip watched the trees from the porch roof until I called them down for supper, twice. “June, I can see the hills,” Pip said. The hills will keep until morning.",
      done: "Pip looks through the binoculars at everything, even at you, up close, and giggles at your giant eye. Then Pip climbs to the porch roof to test them properly. From up there, Pip can see walkers in the trees much sooner. When Pip keeps watch, Pip calls each wave 10 seconds sooner from now on. Pip says ten seconds is enough time to tie both shoes.",
      after: "Pip tells you what they saw from the porch roof. Far past the trees, a thin line of smoke rose from a chimney into the still air. Pip says smoke means somebody is cooking supper, so somebody is still out there. Pip drew the smoke on the wall in pencil, with a question mark beside it. Pip wants to know whose supper it was.",
    },
    "pip-3": {
      title: "Broken boom box",
      brief: "Pip wants a big magnet to pull nails out of the dirt for scrap. The yard is full of old nails and bolts, and Pip wants every one. Tomas says every big speaker has a big magnet inside.\n\nSignal Electronics is north of the cabin. A broken boom box lies there by the TV wall, just outside the REPAIRS room. It is blue-green, with two big round speakers. Pip will give you 35 scrap and 1 box of books.",
      tag: "A blue-green boom box with two big round speakers and a cracked handle. A repair tag says: speakers fine, everything else broken. It is heavier than it looks.",
      journal: "You brought Pip a broken boom box from Signal Electronics. Pip took the magnet out and dragged it around the yard until dark. “June, the dirt is full of treasure,” Pip announced. It was full of nails.",
      done: "Pip pulls the big magnet out of one speaker, with a little help from Tomas's screwdriver. Pip ties it to a long string and tests it on a spoon. The spoon jumps. Every evening, Pip drags the magnet along the fence and pulls up nails and bolts. From now on, Pip brings in 3 scrap every day.",
      after: "Pip shows you what the magnet pulled out of the dirt, all in a row on the porch. There were nails, bolts, a bottle cap and a small metal tag shaped like a bone. The name on the tag is worn away. So Pip keeps it for the dog the crew does not have yet. Pip says every dog deserves a tag, even one that has not shown up.",
    },
    "pip-4": {
      title: "Dog leash",
      brief: "Pip wants a leash ready for the day the crew finds a dog. Pip says being ready is half of any plan, which is something June says too.\n\nPip once saw a leash in the lost-and-found box at the 4th Precinct, north of the cabin. The leash lies in the GARAGE now, on the floor beside the riot shields. It is red, with a metal clip. Pip will give you 50 scrap, 1 spool of wire and 1 box of books.",
      tag: "A red dog leash with a metal clip, a little chewed at the handle. A paper tag on it says: found by the front steps, no dog. Somebody drew a sad face beside the words.",
      journal: "You brought Pip a red dog leash from the 4th Precinct. Pip hung it by the front door, where a leash belongs, beside the name hooks. “June, it looks like it is waiting,” Pip said. It does.",
      done: "Pip clips the leash to their belt to practice and walks a slow lap around the yard. The empty leash trails behind like a tail. Pip says the crew has treats and a leash now. All that is missing is the dog. Pip says it the way June talks about the weather: calm, certain, and not up for debate.",
      after: "Pip tells you about a police dog that once visited Pip's class. It sat perfectly still while the whole class talked at once. It moved only when the officer said one quiet word. Pip still does not know what the word was. Pip says a dog chooses its people, so Pip is practicing being calm and quiet. So far, Pip has managed almost a whole minute.",
    },
    "pip-5": {
      title: "The dog past the trees",
      brief: "Through the binoculars, Pip saw a dog slip into Corner Grocery, east of the cabin. It is the one that barks past the trees at night. It sleeps on the LOADING DOCK, beside the forklift. It is sandy tan, with a dark brown patch over one eye.\n\nPip gives you a pocket full of treats. Hold one out to the dog (press E), and it will follow you to the van. Walkers leave it alone. Pip says to be gentle: it is a good dog, just a lonely one. Pip will give you 60 scrap, 1 box of radio parts and 1 box of books.",
      journal: "You brought a dog home from Corner Grocery. Pip smiled all evening, and the dog drank from Pip's bowl by the gate. “June, it likes us,” Pip whispered. I pretended I was not smiling too.",
      done: "Pip kneels down, and {dog} licks their face from chin to hairline. Pip laughs so hard that June stops to watch. The dog needs feeding, though: it eats 1 food every 2 days. In return, it barks when walkers come close to the cabin. Pip says that makes it a lookout too, the best one the crew has ever had.",
      after: "Pip says {dog} has a home now, and so does the crew. Pip wants to build Finn's treehouse one day, with a rope ladder and a lookout. It will have a bucket on a pulley, so the dog can come up too. June says the dog stays on the ground. Pip says they will see, and the dog's tail thumps in agreement.",
    },
  });
  T.crew.errands = Object.assign(T.crew.errands || {}, {
    "june-e1": {
      title: "Seeds before the cold",
      brief: "June needs {count} of these within {days} days: {item}. She wants more beans growing before the cold comes, while the soil is still warm. She will pay {reward}, and she calls that a bargain for a winter of beans.",
      done: "June tucks the seed packets into her cardigan pocket and writes them in the ledger. She underlines that line twice. She says the beans will be in the ground by sundown.",
    },
    "june-e2": {
      title: "Good dirt for the beds",
      brief: "June needs {count} of these within {days} days: {item}. She says good dirt is half of any garden, and the other half is patience. The beds are getting thin, and thin soil grows thin beans. She will pay {reward}.",
      done: "June pats the soil like an old friend and says the beds will thank you. She spreads it with her bare hands, humming, and leaves her gloves in her pocket for once.",
    },
    "june-e3": {
      title: "Clean water for the beds",
      brief: "June needs {count} of these within {days} days: {item}. She wants clean water for the beds, because muddy rainwater makes the plants sick. She will give you {reward} from her shelf, the one she saves for emergencies.",
      done: "June rinses the filter in clean water, the way its tag says, and sets it by the sink. She says the beans will taste the difference, and so will the crew.",
    },
    "june-e4": {
      title: "Kits for June's shelf",
      brief: "June needs {count} of these within {days} days: {item}. She wants kits on her shelf for scrapes and colds. Somebody always gets a scrape, and winter is coming. She will pay {reward}, and gladly.",
      done: "June stocks her shelf and reads the list inside every lid, checking each item off in pencil. Then she lines up the kits and tells everyone to stay out of trouble anyway.",
    },
    "tomas-e1": {
      title: "Parts for the van",
      brief: "Tomas needs {count} of these within {days} days: {item}. The van needs a new belt and spark plugs. The old belt is cracked and could snap any day. He will pay {reward}.",
      done: "Tomas sorts the parts on the porch and checks the belt twice. Then he slides under the van with a flashlight in his teeth. Before long, the engine hums like a happy cat.",
    },
    "tomas-e2": {
      title: "Nails for the fence",
      brief: "Tomas needs {count} of these within {days} days: {item}. Loose fence boards hold better with two nails each, and he has run out of good ones. He will pay {reward}, plus his thanks.",
      done: "Tomas wraps the box in a shirt so it will not rattle, then gets to work. By supper, the loose boards along the back fence each have two fresh nails in them.",
    },
    "tomas-e3": {
      title: "Fuel for power and traps",
      brief: "Tomas needs {count} of these within {days} days: {item}. Fuel feeds the Power room and blast traps, and both are always hungry. He will trade {reward} he made himself, and he says it is a good one.",
      done: "Tomas stores the fuel outside, away from the stove, and never fills a can past the line. He says fuel needs room to breathe in the heat, just like people do.",
    },
    "tomas-e4": {
      title: "New tools for old jobs",
      brief: "Tomas needs {count} of these within {days} days: {item}. His tools are worn out, and good fixes need good tools. A bent screwdriver turns a short job into an hour of grumbling. He will pay {reward}.",
      done: "Tomas wipes every tool clean before he puts it away, the way Mr. Ortiz's note says. Then he hangs each one up in a neat row, in order from small to big.",
    },
    "pip-e1": {
      title: "Boards for the treehouse",
      brief: "Pip needs {count} of these within {days} days: {item}. Pip is saving boards for Finn's treehouse, the one in the plan on Finn's wall. Pip will pay {reward} and promises you the first climb.",
      done: "Pip stacks the boards behind the cabin, ready for the day the fence is strong. Pip counts them twice and pins a note with the number beside Finn's treehouse plan.",
    },
    "pip-e2": {
      title: "Wire for a longer antenna",
      brief: "Pip needs {count} of these within {days} days: {item}. Pip wants a longer antenna, to hear farther voices. Somewhere past the hills, Pip is sure, someone is talking and nobody is listening yet. Pip will pay {reward}.",
      done: "Pip winds the wire into a neat coil and labels it in big, messy letters. The label says: ANTENNA WIRE, DO NOT TOUCH, THIS MEANS YOU TOMAS.",
    },
    "pip-e3": {
      title: "Something new to read",
      brief: "Pip needs {count} of these within {days} days: {item}. Pip wants something new to read by the stove at night. The old books have been read so often that the pages are falling out. Pip will pay {reward}.",
      done: "Pip reads the first page of every book before choosing one. That takes most of the evening. Then Pip picks the thickest book and reads it aloud to the crew by the stove.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
