/* Reading level 5: the crew's story quests and errands (T.crew.quests, T.crew.errands). The talk, tips,
   reports and the dog are in level5-crew.js. Facts: js/story-quests.js and js/story-crew.js (ERRANDS).
   See docs/CREW.md and docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[5] = root.ZSR.TEXT[5] || { level: 5 });
  T.crew = T.crew || {};
  T.crew.quests = Object.assign(T.crew.quests || {}, {
    /* ---------- June ---------- */
    "june-1": {
      title: "Bag of sunflower seeds",
      brief: "June wants to plant sunflowers along the fence, like the kids at her old school did every spring. She says a row of tall yellow faces would make the cabin look lived in, and maybe a little braver. Corner Grocery is east of the cabin. The seeds lie on the floor by the fish tank, near the SEAFOOD sign. Look for a brown paper bag with a sunflower drawn on the front, about the size of a loaf of bread. June will give you 20 scrap and 1 seed packet for it. She says the seeds are worth more than they look, the way most small things are.",
      tag: "A brown paper bag of sunflower seeds from the bulk bins, folded over twice at the top. The price sticker on the front says: for snacks or for planting. Whoever priced it could not decide, so now the choice is yours.",
      journal: "You brought home a bag of sunflower seeds today. I planted them along the fence before supper, one finger deep, the old way. Pip watered every one, like a nurse making rounds, and called them June's sunflowers. I expect yellow faces by summer.",
      done: "June holds the bag in both hands, as if it were full of gold instead of seeds. She shakes it gently and listens to the dry whisper inside. She says sunflowers grow taller than the fence and turn their faces to the sun. They follow it across the sky like a crowd watching a very slow ball game. Walkers will not care about flowers, she admits. The crew will, though, and on a gray morning that matters more than you would think. She tucks the bag into her cardigan pocket and pats it twice.",
      after: "June talks about her old school garden. Every spring, her students planted sunflowers by the school fence. Every fall, they saved the seeds in paper envelopes with their names on them. That way each kid planted their own seeds again, like a story with a sequel. One boy wrote down how tall his sunflower was every single day, even on weekends. June says that boy would be good at keeping a ledger. She suspects she caught the habit from him.",
    },
    "june-2": {
      title: "Roll of knee tape",
      brief: "June's knees ache when she kneels in the garden, and lately they creak louder than the porch steps. She says the dirt is willing, but her knees have filed a complaint. Mr. Okafor at Mile 9 Pharmacy, northwest of the cabin, sold a tape that holds a sore knee steady. A roll lies on the floor by the giant toothbrush, just outside the STAFF ONLY door. It is a wide roll of bright blue tape, easy to spot on a gray floor. June will give you 30 scrap and 1 medical kit. The kit is for you, she says, since the tape is for her.",
      tag: "A wide roll of stretchy blue tape from Mile 9 Pharmacy, still sealed in its plastic. The label says: for sore knees and ankles. Underneath, someone added in pen: wrap it snug, but never tight.",
      journal: "You brought me a roll of knee tape from Mile 9 Pharmacy today. I taped both knees and worked in the dirt until supper, kneeling like a girl again. Tomas says June hums when she is happy. I hummed all afternoon.",
      done: "June laughs out loud when she sees the tape. She says Mr. Okafor told her to buy this exact tape for years, and she always said next week. Next week finally came. She wraps her knees right away, snug as a pair of socks. With her knees taped, she can kneel in the dirt again for as long as the garden needs her. Because she can work longer, the beds grow more. From now on, the crew gets 1 more food every day.",
      after: "June tells you about Mr. Okafor, the pharmacist at Mile 9 Pharmacy. For twenty years, he kept her knee pills ready in a paper bag with her name on it. For twenty years, she forgot to pick them up. He never scolded her. He just smiled and slid the bag across the counter, as patient as a clock. She paid him back in tomatoes every summer, the fattest ones she grew. June says the town was full of people who kept things safe for each other. She hopes it still is.",
    },
    "june-3": {
      title: "Rosa's jar of beans",
      brief: "Every autumn, June's old friend Rosa saved her a jar of beans grown from June's own seeds. It was their way of saying the year had been a good one, even when it had not. June has not had her jar since the Fall, and she misses it the way you miss a song nobody sings anymore. Rosa's place, Greenhouse Row, is west of the cabin. The jar sits under the seed racks by the gate, beside the big gnome. It has a red lid, and speckled beans fill it to the top. June will give you 30 scrap, 2 seed packets and 1 bag of soil.",
      tag: "A glass jar of dry speckled beans with a red lid, packed so full that it barely rattles. Rosa's label is in neat green letters: For June. The beans came up. It is short, the way Rosa always wrote, and warm all the same.",
      journal: "You brought home Rosa's jar of beans from Greenhouse Row. I read the label three times, then set the jar on the windowsill, where the morning light makes the beans glow. Tomas asked why I keep smiling at a jar. Because the label says For June, I told him.",
      done: "June reads the label and does not say anything for a long time. She just smiles, turning the jar slowly in her hands so the beans tumble against the glass like tiny marbles. Then she says Rosa never wasted words, not in a letter, not on a seed packet, not even on a birthday card. These, she says, are the best ones Rosa ever wrote. She sets the jar on the windowsill, right where the morning sun will find it first.",
      after: "June tells you how she met Rosa. It was at a plant sale, years ago. They both reached for the last tomato plant at the same moment, two hands on one little pot. Neither would let go, so they shared it, and they split the tomatoes all summer. After that, they traded seeds every spring: June's beans for Rosa's squash, like two kids swapping lunches. June will save the best beans from this jar for Rosa. She says a trade is not finished until both sides have planted.",
    },
    "june-4": {
      title: "First-aid book",
      brief: "June wants a first-aid book, so she can patch the crew up better. She knows the basics, she says, but basics only stretch so far, like a blanket that is too short for the bed. The Public Library is north of the cabin. The book lies on the floor of the MEDIA room, beside the owl statue, as if someone dropped it in a hurry. It is a thick blue book with folded page corners, so somebody already marked the useful parts. June will give you 40 scrap and 1 medical kit for it.",
      tag: "A thick blue first-aid book from the Public Library, its spine cracked from use. The corners are folded down on the pages about cuts, burns and sprains, like little flags marking the places someone needed most.",
      journal: "You brought me a first-aid book from the Public Library today. I read it by the stove until the candle burned down to a stub. Then I kept going by the glow of the coals. At dawn Tomas found me there and called me Student June. I did not argue.",
      done: "June has already started reading before you finish handing it over. She runs a finger down the folded corners and nods. She says the folded corners show which pages helped people most, like footprints worn into a path. Now she knows better ways to clean a cut and wrap a sprain. Because of that, when she patches you up, it does more good. From now on, her patch-up gives you 20 more health. You are still not allowed to need it, she says.",
      after: "June tells you she learned first aid in her school garden, not in a hospital. Kids got bee stings and scraped knees there all the time, because a garden full of children is never quiet for long. So the school nurse taught her what to do. June kept bandages in the tool shed, right next to the trowels, and lollipops for the brave ones. The crew is braver than any of those kids, June says, but they still get no lollipops. Pip has asked twice. The answer is still no.",
    },
    "june-5": {
      title: "Garden club seed box",
      brief: "June wants good seeds for a bigger garden, one that could feed the crew through a long winter. Years ago, she helped the garden club at Lincoln Middle School, northeast of the cabin. The club kept its best seeds in a box, the way a family keeps its good dishes. The box is in the SCIENCE room, on the floor beside the big brain. It is a cardboard box with a red label on the lid. June will give you 50 scrap, 2 seed packets and 2 bags of soil. She says a school saves more than one kind of thing.",
      tag: "A cardboard box full of paper seed envelopes, sorted by plant and standing in neat rows like cards in a file. The red label on the lid says: Lincoln Garden Club, save your best seeds.",
      journal: "You brought home the garden club's seed box from Lincoln Middle School. Pip and I sorted the envelopes on the kitchen table until late, reading every name out loud. At midnight Pip yawned and said, 'June, the seeds will keep until morning.' I kept going anyway.",
      done: "June reads every envelope out loud, like a teacher calling roll: beans, squash, corn, peppers and sunflowers. Her voice goes a little thick on the sunflowers. Then she gets to work. She plants the seeds in every spare corner of the yard. That includes the strip by the porch that Tomas swore was only good for weeds. More plants mean more to harvest. From now on, the crew gets 2 more food every day. June says the yard has finally stopped being a yard and started being a garden.",
      after: "June found the kids' names on the seed envelopes, written in pencil in big, careful letters. Some names had little drawings beside them: a sun, a worm, a lopsided carrot. She hopes those kids are safe, wherever they are tonight. She will save seeds from this harvest for them, in fresh envelopes with their names copied on. Someday someone may come asking. June says a seed is a promise that there will be a next year. She plans to keep every promise in that box.",
    },

    /* ---------- Tomas ---------- */
    "tomas-1": {
      title: "Socket wrench",
      brief: "Tomas's wrench was his father's, and it is worn so smooth that it slips off bolts like a bar of wet soap. He says he would rather not scrape his knuckles finding out how far it can go. Reyes Hardware is northeast of the cabin. A new socket wrench lies by the tool wall, beside the orange ladder. It has a red handle and a shiny silver head that catches the light. Tomas will give you 25 scrap and 1 box of nails. He says a good tool pays for itself in a week, and he plans to prove it.",
      tag: "A socket wrench with a red handle, still hanging from its shop clip. Mr. Reyes's price sticker is on the handle, from back when tools cost money instead of courage.",
      journal: "You brought Tomas a new socket wrench from Reyes Hardware. He spent the whole evening under the van, only his boots showing, and came out whistling like a kettle. I have not heard that tune in weeks.",
      done: "Tomas tries the wrench on the tightest bolt on the van, the one he calls Old Stubborn. It turns on the first pull, and he grins like he just won a race. He says his father's wrench goes on the shelf now, for luck, not for work. It has earned a rest, he says, after more years under cars than Tomas has been alive. He sets it up there carefully, handle out, the way you would hang a medal.",
      after: "Tomas tells you how he learned to fix things. As a small boy, he lay beside his father under cars and handed him the tools. But there was a rule: he had to say each tool's name first. If he said the wrong name, his father did not scold him. He just waited, hand out, quiet as a stopped engine, until Tomas got it right. Tomas says that is how he learned to read the labels on everything. He still reads every label twice.",
    },
    "tomas-2": {
      title: "Thank-you card",
      brief: "Years ago, Tomas's father sent his old teacher, Mr. Ortiz, a thank-you card. Tomas never saw what it said, and now he wants to read it more than he wants new tires. Ortiz Auto is east of the cabin. The card lies in the PARTS room, on the floor beside the engine crane, probably knocked off a shelf. It is in a white envelope with a red seal, so it stands out against the oily floor. Tomas will give you 30 scrap, 1 box of engine parts and 1 spool of wire. He says some things you cannot buy, only find.",
      tag: "A thank-you card in a white envelope with a red seal, soft at the corners from being handled. Inside, in careful slanted pen: thank you for teaching me never to rush a job.",
      journal: "You brought Tomas his father's thank-you card from Ortiz Auto. He propped it on the van's dashboard, so it rides along on every trip now. It is a passenger who never complains about the music. I approve.",
      done: "Tomas knows the handwriting at once: it is his father's, slanted like letters leaning into the wind. He reads the card twice, slowly, the second time with his lips moving. Then he folds it back into the envelope. He says his father never said thank you out loud, not to anyone. So it is good to see it written down, proof that he felt it. Tomas clears his throat and goes to check the van's oil, which does not need checking.",
      after: "Tomas tells you about his father's garage. It was small, with one lift, a coffee can of loose bolts, and a radio. The radio only played old songs, no matter where you turned the dial. Over the door, his father painted Mr. Ortiz's rule in white letters: never rush a job. Tomas read it every morning, the way some people read the weather. He wants to show Mr. Ortiz the van someday. He says the old man would find three things wrong with it, and Tomas would fix all of them.",
    },
    "tomas-3": {
      title: "Fire crew toolbox",
      brief: "Tomas wants to make crowbars from scrap, but first he needs a good pry bar to copy. He says copying a tool is like tracing a map: the hard part is finding one worth tracing. The fire crew at Station 12, northwest of the cabin, kept one in their toolbox. Their toolbox lies by the gear racks, near the big door marked RESCUE. It is a long red toolbox with a gray handle, heavy enough to make you grunt. Tomas will give you 40 scrap and 1 crowbar for it. He calls the crowbar a down payment.",
      tag: "A long red toolbox with Station 12 painted on the side in gold letters, chipped from years on a fire truck. A heavy pry bar lies inside, strong enough to argue with almost any lock.",
      journal: "You brought home the fire crew's toolbox from Station 12. Tomas traced the pry bar on the back of a cardboard box before supper, measuring every curve twice. Pip had to wave a spoon at Tomas before he remembered to eat.",
      done: "Tomas studies the pry bar from end to end, turning it in the light like a jeweler with a ring. He taps it, weighs it, and measures the bend at the tip. Now he knows exactly how it was made, so he can make crowbars the same way, from scrap. Less guessing means less waste. From now on, a crowbar costs only 10 scrap to build. Tomas says every jammed lock in town should be nervous.",
      after: "Tomas once went to Station 12 with his father, to fix the fire truck. He was nine, and the truck looked as big as a house. The fire crew let him sit in the driver's seat, but touch nothing, so he sat on his hands the whole time. Afterward, Chief Dunn shook his hand like a grown man's. Chief Dunn said a good tool is one you trust when you are scared. Tomas says the van is like that, and so is the crew.",
    },
    "tomas-4": {
      title: "Box of fence brackets",
      brief: "Every fence fix eats scrap, and Tomas hates watching the pile shrink. Steel brackets would let him fix the fence with old boards instead of scrap. Carla, the yard boss at Ridge Lumber, northeast of the cabin, kept a box of them for exactly this kind of job. It is in the SAW SHOP, on the floor beside the band saw. It is a heavy cardboard box with a red label, and it clinks when you lift it. Tomas will give you 45 scrap, 2 pieces of lumber and 2 spike traps. He says it is the best trade he has offered yet.",
      tag: "A heavy box of steel fence brackets from Ridge Lumber, each one bent into a neat L like a folded arm. Carla wrote on the red label in thick marker: two screws each, and it holds.",
      journal: "You brought Tomas a box of fence brackets from Ridge Lumber. He lined them up on the porch by size, like soldiers waiting for orders, and would not let anyone step over them. I had to walk the long way around.",
      done: "Tomas opens the box and counts the brackets twice, then once more because he liked the number. With these, he can fix the fence and the cabin with old boards now, the warped ones nobody wanted. Old boards cost nothing, so his fixes cost nothing either. From now on, the crew's repairs cost no scrap at all. Every fix he makes with an old board leaves that scrap for something else. Tomas says the scrap pile can finally stop holding its breath.",
      after: "Tomas tells you why he likes fixing the fence so much. Under a car, his father always did the hard part, and Tomas held the light. He held that light for years, steady as a lighthouse, watching every move. The fence is the first big job that is all his own, start to finish. Nobody checks his work but the walkers, and so far they have not gotten through. He scratches a small T on every board he puts back. Count them, he says, and you will know how busy he has been.",
    },
    "tomas-5": {
      title: "Rescue van manual",
      brief: "Tomas needs a service manual to rebuild the van from the ground up. His father used to fix the rescue van at St. Anne Annex, northwest of the cabin, and that van has the same engine as the crew's van. Few places in town are as dangerous, Tomas warns, so go in quietly and come out quicker. The manual is in the garage behind the EMERGENCY sign, beside the rescue van. It is a thick blue book, greasy at the edges. Tomas will give you 70 scrap and 2 boxes of engine parts. He says he would go himself, but June hid his boots.",
      tag: "A thick service manual for the rescue van, blue and greasy, its pages swollen from years in a garage. Someone wrote notes in pencil in the margins, small and slanted, on almost every page.",
      journal: "You brought home the rescue van's manual from St. Anne Annex. Tomas read it at the kitchen table all night, one finger moving under every line. At dawn I found him asleep on chapter nine. I let him sleep.",
      done: "Tomas flips the pages, then stops at the notes in the margins. The handwriting is his father's, slanted the same way as on the thank-you card. For a moment he just stands there, holding the book very carefully. Then he gets to work. With the manual, he rebuilds the van piece by piece, the right way this time. A stronger van can take more hits before it fails. From now on, the van has 40 more health when it is fully fixed.",
      after: "Tomas shows you the manual again, open to a page soft with fingerprints. His father wrote small notes on every page of it: check the belt, listen for the knock, never rush a job. Some notes are jokes, Tomas says, like the one that just says ugh beside a rusty bolt. Tomas says reading them feels like working next to his father again, under the same car, passing the same wrench. He reads one page every night, the way June reads her ledger. He is in no hurry to finish.",
    },

    /* ---------- Pip (they/them) ---------- */
    "pip-1": {
      title: "Tin of dog treats",
      brief: "Pip wants to be ready for a dog, even though the crew has none yet. Pip says a dog is like rain: you cannot make it come, but you can set out a bucket. In this case, the bucket is treats. Gas-N-Go is west of the cabin. A tin of dog treats lies on the floor by the slushie machine, under the LOTTO poster. The tin is red, with a white band around the middle, and it should rattle when you shake it. Pip will give you 20 scrap and 1 spool of wire, which Pip was saving for something important.",
      tag: "A red tin of dog treats with a white band around the middle and a cartoon bone on the lid. It rattles like a maraca when you pick it up, and it is almost full.",
      journal: "You brought Pip a tin of dog treats from Gas-N-Go. Pip put it under their drawing of a dog with no name yet. It was like setting a plate for a guest who is running late. I know hope when I see it.",
      done: "Pip shakes the tin next to one ear and listens to it rattle, eyes closed, like someone listening to a seashell. Then Pip counts the treats, twice, and writes the number on the wall. Pip says a dog will come to someone who has treats, and now the crew has treats. That puts the crew halfway there. The other half, Pip says, is just a dog, and dogs are not something you can find on a shelf.",
      after: "Pip tells you about Biscuit, the Hollis family's dog, as if Biscuit were an old friend. Lucy's drawing says Biscuit could sit, shake and roll over, all three, which Pip finds very impressive. Biscuit went north with the family, Pip says, probably with one ear flapping out a truck window. Pip hopes Biscuit gets lots of treats up there. If the Hollises come back, Pip says, Biscuit will have a friend here, waiting by the gate.",
    },
    "pip-2": {
      title: "Binoculars",
      brief: "Pip keeps watch from the back fence and wants to see walkers coming from farther away. Right now, Pip says, the trees hide too much, like a curtain that never opens. The pump crew at the Water Tower, northwest of the cabin, kept binoculars to watch the river rise and fall. They lie in the WORKSHOP, on the floor beside the rowboat. They are in a yellow case with a brown strap, bright enough to spot from the doorway. Pip will give you 30 scrap and 1 box of radio parts. Pip calls that a fair trade for eyes that see twice as far.",
      tag: "Black binoculars in a scuffed yellow case, the lenses wrapped in a soft cloth. Scratched into the brown strap in small, careful letters: river watch. Someone once kept an eye on the water every day.",
      journal: "You brought Pip binoculars from the Water Tower. Pip watched the trees from the porch roof until I called them down for supper, three times. 'June has the loudest supper voice in town,' Pip says. I do not love that roof.",
      done: "Pip looks through the binoculars at everything: the van, the fence, a crow, even at you, up close. Your nose looks the size of a door. Then Pip climbs to the porch roof to test them properly. From up there, Pip can see walkers in the trees much sooner, like spotting a storm before the thunder. More warning means more time to get ready. When Pip keeps watch, Pip calls each wave 10 seconds sooner from now on.",
      after: "Pip tells you what they saw from the porch roof one evening. Far past the trees, a thin line of smoke rose from a chimney, as straight as a pencil line against the sunset. It stayed for an hour, and then it was gone. Pip says smoke means somebody is cooking supper, so somebody is still out there. Pip drew the smoke on the wall, with a big question mark next to it. Pip wants to know whose supper it was.",
    },
    "pip-3": {
      title: "Broken boom box",
      brief: "Pip has a plan to turn dirt into scrap. The yard is full of old nails and bolts, buried like seeds nobody wanted. Pip wants a big magnet to pull them out. Tomas says every big speaker has a big magnet inside, so Pip needs a speaker. Signal Electronics is north of the cabin. A broken boom box lies there by the TV wall, just outside the REPAIRS room. It is blue-green, with two big round speakers like a pair of owl eyes. Pip will give you 35 scrap and 1 box of books for it. Pip promises the plan will pay that back.",
      tag: "A blue-green boom box with two big round speakers and a cracked handle. A paper repair tag hangs from the dial: speakers fine, everything else broken. For once, that is exactly the right way around.",
      journal: "You brought Pip a broken boom box from Signal Electronics. Pip took the magnet out and dragged it around the yard on a string until dark. It looked like walking a very small, very heavy pet. It came back wearing nails.",
      done: "Pip pries the big magnet out of one speaker with a screwdriver and a lot of grunting. Then Pip ties it to a long string. Every evening, Pip drags it along the fence. Nails and bolts jump out of the dirt and cling to it like burrs. Tomas sorts them into a can. A little scrap every day adds up, the way raindrops fill a bucket. From now on, Pip brings in 3 scrap every day.",
      after: "Pip shows you what the magnet pulled out of the dirt. It is laid out on the porch step in a careful row, like a museum display. There were nails, bolts, a bottle cap and a small metal tag shaped like a bone. Pip turns the tag over and over. The name on it is worn away, too smooth to read, so it could belong to any dog at all. So Pip keeps it for the dog the crew does not have yet. Pip says a dog needs a tag, and now the tag needs a dog.",
    },
    "pip-4": {
      title: "Dog leash",
      brief: "Pip wants a leash ready for the day the crew finds a dog. Pip is sure that day is coming, the way spring comes after a long winter. Pip once saw a leash in the lost-and-found box at the 4th Precinct, north of the cabin. Now it lies in the GARAGE, on the floor beside the riot shields, as if someone dropped it on the way out. It is red, with a metal clip that shines. Pip will give you 50 scrap, 1 spool of wire and 1 box of books. Pip says that is everything in the savings jar, and the leash is worth it.",
      tag: "A red dog leash with a metal clip, the strap faded pink where the sun hit it. A paper tag on it says, in neat block letters: found by the front steps, no dog. The last two words are the saddest part.",
      journal: "You brought Pip a red dog leash from the 4th Precinct. Pip hung it on a hook by the front door, where a leash belongs, right beside the Hollis name hooks. Tomas and I pretend not to notice Pip checking it.",
      done: "Pip clips the leash to their belt to practice. Then Pip walks a lap of the yard with the empty end trailing behind, as if an invisible dog were trotting along. At the gate, Pip stops and says sit, very firmly, to nobody. Pip says the crew has treats and a leash now, like a table set for dinner. All that is missing is the dog. Pip says it as if the dog is only running a little late.",
      after: "Pip tells you about a police dog that once visited Pip's class, back when there were classes. It was a big shepherd with a black nose and ears like two radar dishes. It sat still while the whole class talked, laughed and dropped pencils. It moved only when the officer said one quiet word. Not a shout, Pip says, just one word. Pip says a dog chooses its people, so Pip is practicing being calm and quiet. Today Pip stayed quiet for almost an hour, a new record.",
    },
    "pip-5": {
      title: "The dog past the trees",
      brief: "Through the binoculars, Pip saw the dog that barks past the trees slip into Corner Grocery, east of the cabin. Pip has not stopped bouncing since. The dog sleeps on the LOADING DOCK, beside the forklift, curled up like a question mark. It is sandy tan, with a dark brown patch over one eye, one ear up and one that flops. Pip gives you a handful of treats from the tin. Hold one out (press E), and the dog will follow you to the van. Walkers leave it alone, so you only have to watch out for yourself. Pip will give you 60 scrap, 1 box of radio parts and 1 box of books.",
      journal: "You brought a dog home from Corner Grocery today. Pip smiled all evening, so wide I worried about their cheeks, and the dog drank from Pip's bowl by the gate. That bowl waited a long time. I am glad it was not for nothing.",
      done: "Pip kneels down in the dirt, and the dog licks their face from chin to forehead, which Pip says counts as hello. The two of them stay like that for a long time. Then Pip gets serious, like someone reading the rules on the door. The dog eats 1 food every 2 days, so the pantry has one more mouth to feed. In return, it barks when walkers come close to the cabin, a warning bell with a wagging tail.",
      after: "Pip says {dog} has a home now, and so does the crew, which Pip says was only half true before. A home needs a dog, in Pip's opinion. Pip wants to build Finn's treehouse one day, with a rope ladder and a lookout. It will have a bucket on a pulley so {dog} can ride up too. June says the dog stays on the ground, where dogs belong, and that is final. Pip just says they will see. Tomas has already started measuring the bucket.",
    },
  });
  T.crew.errands = Object.assign(T.crew.errands || {}, {
    /* ---------- June ---------- */
    "june-e1": {
      title: "Seeds before the cold",
      brief: "June needs {count} of these within {days} days: {item}. She wants more beans growing before the cold comes. One hard frost can end a garden overnight, like a door slamming shut. She will pay {reward}.",
      done: "June tucks the seed packets into her cardigan pocket, where they rustle like dry leaves. Then she writes them in the ledger right away. She says beans planted this week will be on the table before the frost.",
    },
    "june-e2": {
      title: "Good dirt for the beds",
      brief: "June needs {count} of these within {days} days: {item}. She says good dirt is half of any garden, and patience is the other half. Her beds are running thin, like soup with too much water. She will pay {reward}.",
      done: "June pats the soil like an old friend she has not seen in years. She works it into the beds with her bare hands, then says the beds will thank you, probably in tomatoes.",
    },
    "june-e3": {
      title: "Clean water for the beds",
      brief: "June needs {count} of these within {days} days: {item}. She wants clean water for the beds, because dirty rainwater can carry sickness straight into the roots. She will give you {reward} from her shelf in return.",
      done: "June reads the tag on the filter before anything else, the way she reads seed packets. Then she rinses the filter in clean water, the way its tag says, and sets it by the sink to dry.",
    },
    "june-e4": {
      title: "Kits for June's shelf",
      brief: "June needs {count} of these within {days} days: {item}. She wants kits on her shelf for scrapes and colds, because small troubles grow big when nobody treats them. She will pay {reward}.",
      done: "June stocks her shelf, lining up the kits like books in a library. She opens every lid and reads the list inside, item by item. That way she knows what she has before anyone needs it.",
    },

    /* ---------- Tomas ---------- */
    "tomas-e1": {
      title: "Parts for the van",
      brief: "Tomas needs {count} of these within {days} days: {item}. The van needs a new belt and spark plugs. Lately the engine coughs like a grumpy old man on a cold morning. He will pay {reward}.",
      done: "Tomas sorts the parts on the porch in neat rows, smallest to biggest. He checks the belt twice, bending it to look for cracks, because a belt that snaps on the road strands everyone.",
    },
    "tomas-e2": {
      title: "Nails for loose boards",
      brief: "Tomas needs {count} of these within {days} days: {item}. Loose fence boards hold better with two nails each, he says, because one nail lets a board swing like a gate. He will pay {reward}.",
      done: "Tomas wraps the box in an old shirt so it will not rattle, since even a rattle can carry to the trees. Then he gets to work, and soon the loose boards stop swinging.",
    },
    "tomas-e3": {
      title: "Fuel for the yard",
      brief: "Tomas needs {count} of these within {days} days: {item}. Fuel feeds the Power room and blast traps, and both of them go hungry fast. In return, he will trade {reward} he made himself, and he is proud of it.",
      done: "Tomas stores the fuel outside, away from the stove, where a spark cannot reach it. He never fills a can past the line, because fuel needs room in the heat, like bread rising in a pan.",
    },
    "tomas-e4": {
      title: "New tools for Tomas",
      brief: "Tomas needs {count} of these within {days} days: {item}. His tools are worn out, and good fixes need good tools. A dull saw, he says, only teaches you to lose your temper. He will pay {reward}.",
      done: "Tomas lays out every tool on a rag, neat as a chef's knives. He wipes each one clean before he puts it away, the way Mr. Ortiz's note says, so rust never gets a head start.",
    },

    /* ---------- Pip (they/them) ---------- */
    "pip-e1": {
      title: "Boards for the treehouse",
      brief: "Pip needs {count} of these within {days} days: {item}. Pip is saving boards for Finn's treehouse, the one on the plan in Finn's room, with a rope ladder and a lookout. Pip will pay {reward}.",
      done: "Pip stacks the boards behind the cabin, straight and square, then counts them out loud twice. They wait there, ready for the day the fence is strong enough that Pip can build up instead of out.",
    },
    "pip-e2": {
      title: "Wire for a longer antenna",
      brief: "Pip needs {count} of these within {days} days: {item}. Pip wants a longer antenna, to hear farther voices, because every new voice could be someone who needs help. Pip will pay {reward}.",
      done: "Pip winds the wire into a neat coil, tight as a garden hose on its reel. Then Pip labels it in big, messy letters: FOR THE ANTENNA, DO NOT TOUCH. Under that, Pip adds: THIS MEANS TOMAS.",
    },
    "pip-e3": {
      title: "Something new to read",
      brief: "Pip needs {count} of these within {days} days: {item}. Pip wants something new to read by the stove at night, and has read every book in the cabin at least twice. Pip will pay {reward}.",
      done: "Pip spreads the books across the floor and reads the first page of every one before choosing. Pip says a first page is like a handshake: it tells you whether you want to keep going.",
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
