/* Zombie Survival Reading: grade 6 content.
   Calibration (docs/CONTENT_GUIDE.md): 230 to 280 words per passage, sentences of 26
   words or fewer, four options per question. Theme, author's purpose, multi-step
   inference, sophisticated vocabulary. Mildly eerie is fine; scary is not. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[6] = {
    grade: 6,
    havens: [
      {
        id: "g6-library-fort",
        place: "Library Fort",
        host: "Doc Lin",
        intro: "Doc Lin meets you between two walls of encyclopedias. \"Welcome to the fort. House rules first. And no, 'overdue' is not a pun, it's a lifestyle.\"",
        kind: "rules",
        title: "The Library Fort Charter",
        text: "THE LIBRARY FORT CHARTER. Adopted by everyone who sleeps between the shelves. Read it aloud to newcomers, slowly, with feeling.\n\nArticle 1. The fort is built from books, but no good book is a brick. The walls are made of encyclopedias, phone directories, and forty copies of a tax manual nobody has ever opened. Any book a person might actually want to read stays on the shelf.\n\nArticle 2. Quiet hours begin at sunset. This is not because Shamblers hear well. It is because reading by candlelight is a sacred thing, and a sacred thing deserves a little hush.\n\nArticle 3. Every resident teaches one person one thing. Grandpa Joe teaches radio repair. Doc Lin teaches first aid and, against our wishes, puns. Captain Ruby teaches engines. If you can read, you teach reading, because that is the rarest skill on this road.\n\nArticle 4. The reading lamp in the north window stays lit all night, so travelers can steer by it. A Shambler once steered by it too and spent the night with its nose against the glass, moaning softly at the atlas section. It did no harm, and the atlas was not offended.\n\nArticle 5. Borrowing is allowed. Hoarding is not. One book under your pillow is a friend. Twelve books under your pillow is a lumpy mattress and a problem for your neighbors.\n\nArticle 6. When the Bookmobile comes, we trade fairly, we say thank you, and we ask the driver to read us something before they go. A road is long. A story makes it shorter.\n\nSigned in pencil, so we can revise it. Nothing worth keeping is finished on the first draft.",
        questions: [
          {
            type: "detail",
            q: "Which books are used to build the fort walls?",
            options: ["Books nobody wants to read", "Atlases and travel maps", "Picture books for children", "Doc Lin's pun collection"],
            answer: 0,
            hint: "Article 1 explains what the walls are made of."
          },
          {
            type: "inference",
            q: "Why is the charter signed in pencil?",
            options: ["Pens are hard to find", "So the rules can change later", "Pencil is quieter at night", "The ink attracts Shamblers"],
            answer: 1,
            hint: "Read the last two lines and think about what a first draft is for."
          },
          {
            type: "vocab",
            word: "hoarding",
            q: "What does the word \"hoarding\" mean in this passage?",
            options: ["Reading very quickly", "Lending to friends", "Writing in the margins", "Keeping more than you need"],
            answer: 3,
            hint: "Article 5 contrasts hoarding with borrowing and describes twelve books under one pillow."
          }
        ],
        choice: {
          prompt: "Which route leaves the fort?",
          options: [
            {
              label: "The quiet avenue",
              desc: "Residents swept it clear this morning, so it is calm, but it takes the long way around the park.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "The avenue is so quiet you can almost hear pages turning back at the fort. Biscuit yawns and curls up on the passenger seat."
            },
            {
              label: "The bookshop district",
              desc: "Short and crowded, because Shamblers gather by the old bookstores for the smell of paper, and they drop scrap when they poof.",
              effects: { zombies: 1.4, scrap: 30, length: 0.9 },
              result: "Shamblers press their faces to the bookshop windows, sighing at the covers. They cannot read, but they can admire."
            },
            {
              label: "Candlelit alley",
              desc: "Doc Lin loads a crate of candles and tightens every bolt on the van, but the alley is dark and your headlights will be the only light.",
              effects: { night: true, hp: 15, crates: 1 },
              result: "Candle flames wink in the fort's windows behind you. Doc Lin calls out, \"Don't get wick-ed out there!\" and nobody laughs."
            }
          ]
        }
      },
      {
        id: "g6-train-yard",
        place: "Train Yard",
        host: "Captain Ruby",
        intro: "Captain Ruby hands you a clipboard smudged with grease. \"Dispatch log. Read today's entries and tell me if the plan sounds as crazy out loud as it does in my head.\"",
        kind: "log",
        title: "Dispatcher's Log, Train Yard",
        text: "TRAIN YARD DISPATCH LOG. Dispatcher: Captain Ruby. Rule of the log: write what happened, not what you wished had happened.\n\n05:30. Woke to the sound of the old switch engine idling. Nobody started it. Investigated with a wrench and a flashlight. Found a Shambler sitting in the cab, pressing buttons at random. It had turned on the wipers, the bell, and the heater, and looked deeply pleased with itself. Escorted it off the yard. It waved.\n\n07:15. Inventory. Three boxcars of canned peaches, one tank car of water, and a flatcar carrying a carousel horse that nobody can explain. The peaches go to Moon Diner. The horse stays. Morale matters.\n\n09:40. Max and Mia report that the eastbound track is blocked by a fallen signal tower. This is a problem, because the eastbound track is the only one that reaches Mountain Lodge before the snow. Solution: hook the switch engine to the flatcar and drag the tower aside. The engine needs fuel first. Fuel is at Gas-N-Go. Gas-N-Go is twenty miles west. Everything on this road is twenty miles from something.\n\n13:00. Fog settled over the yard, thick enough to lose a boxcar in. Shamblers drifted in like slow balloons. They are harmless in fog, since they cannot find anything, including each other. We counted eleven bumping gently into the same water tank.\n\n16:20. Grandpa Joe radioed the weather: clear tomorrow, snow in six days. That is our deadline for the eastbound track. The Bookmobile arrives tonight. The driver can read the engine manual, which none of us can. That is the whole plan, and I believe in it.\n\nEnd of log. Peaches for dinner.",
        questions: [
          {
            type: "detail",
            q: "What is blocking the eastbound track?",
            options: ["A boxcar of peaches", "A stuck switch engine", "A crowd of Shamblers", "A fallen signal tower"],
            answer: 3,
            hint: "Check the 09:40 entry."
          },
          {
            type: "inference",
            q: "Why does Ruby need the Bookmobile driver tonight?",
            options: ["To deliver the peaches", "To drive to Gas-N-Go", "To read the engine manual", "To count the Shamblers"],
            answer: 2,
            hint: "The 16:20 entry explains the whole plan."
          },
          {
            type: "vocab",
            word: "morale",
            q: "What does the word \"morale\" mean in this passage?",
            options: ["The price of goods", "How hopeful people feel", "A rule in the log", "The weight of a car"],
            answer: 1,
            hint: "Ruby keeps the carousel horse for a reason, and she gives that reason in two words."
          }
        ],
        choice: {
          prompt: "Which way out of the yard?",
          options: [
            {
              label: "Follow the rails",
              desc: "Smooth gravel beside the track makes for a fast, short run, but the fog is still thick in the cuttings.",
              effects: { fog: true, length: 0.8, zombies: 0.9 },
              result: "The rails hum beside you. Shapes drift in the fog, bump into each other, and apologize in moans."
            },
            {
              label: "The crossing road",
              desc: "Paved and plain, except that Shamblers like to wait at the crossing gates for a train that never comes, so expect a crowd.",
              effects: { zombies: 1.3, scrap: 25 },
              result: "The crossing bell dings for no one. A row of Shamblers waits patiently behind the gate, and a few of them wave as you pass."
            },
            {
              label: "Haul the flatcar",
              desc: "Ruby hitches the carousel horse's flatcar behind your van for the next haven, which is heavy and slow, but she pays well for the favor.",
              effects: { length: 1.3, scrap: 40, brutes: 1.3 },
              result: "The carousel horse grins over your shoulder the whole way. It is the strangest escort you have ever had, and the most cheerful."
            }
          ]
        }
      },
      {
        id: "g6-mountain-lodge",
        place: "Mountain Lodge",
        host: "Biscuit",
        intro: "Biscuit drags a snow-damp notebook from under a bunk and drops it in your lap. The cover reads PROPERTY OF THE LODGE, DO NOT BURN FOR WARMTH.",
        kind: "diary",
        title: "Lodge Diary: The Long Snow",
        text: "Day 3 of the long snow. The lodge creaks like an old ship, and the wind outside makes a sound I have decided to call singing. It is not singing. But if I call it howling, I will not sleep.\n\nDay 4. The pantry holds forty cans of soup and one very small jar of cinnamon. We are rationing the cinnamon. Elsa claims a pinch each morning keeps our spirits up. She may be right. It is hard to despair while sniffing cinnamon.\n\nDay 6. A Shambler appeared at the window in the middle of the blizzard. Snow had piled on its head like a tall white hat, so it looked less like a monster and more like a confused pastry chef. Elsa opened the window a crack and said, \"Not today, thank you,\" and it nodded and plodded off. I wrote that down because I want to remember it exactly.\n\nDay 8. The generator sputtered twice and quit. We assumed the cold had done it. Then we found the real culprit: a squirrel had stuffed the air vent with pinecones. It is comforting to know that even now, the squirrels are still hard at work.\n\nDay 10. Grandpa Joe's voice came through the radio for the first time in a week. The pass is open. The Bookmobile is coming. Elsa cried, and then said it was the cinnamon. I did not argue.\n\nDay 11. Final entry before we pack. I kept this diary so that someone, someday, would know we were here and that we were not afraid. That is only half true. We were afraid. We just kept the cinnamon going anyway.",
        questions: [
          {
            type: "detail",
            q: "What really made the generator quit?",
            options: ["The cold froze it", "The Shambler bumped it", "It ran out of fuel", "Pinecones in the air vent"],
            answer: 3,
            hint: "The Day 8 entry names the real culprit."
          },
          {
            type: "inference",
            q: "What does the writer mean by \"we just kept the cinnamon going anyway\"?",
            options: ["They ran out of soup", "They stayed hopeful despite fear", "They were never really afraid", "They cooked for the Shambler"],
            answer: 1,
            hint: "Look at what Elsa says the cinnamon is for on Day 4, then reread Day 11."
          },
          {
            type: "vocab",
            word: "rationing",
            q: "What does the word \"rationing\" mean in this passage?",
            options: ["Sharing out small amounts", "Throwing it all away", "Hiding it from others", "Cooking it very slowly"],
            answer: 0,
            hint: "Day 4 mentions one very small jar and a pinch each morning."
          }
        ],
        choice: {
          prompt: "Which way down the mountain?",
          options: [
            {
              label: "The plowed pass",
              desc: "Grandpa Joe says the pass is open, and the switchbacks are long but clear and quiet.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "Snowbanks tower on both sides like white hallways. Somewhere above, the lodge's cinnamon smell follows you down."
            },
            {
              label: "The sled run",
              desc: "Steep, fast, and a little wild, because Shamblers slide down it on their backs, which is funny right up until they land near you.",
              effects: { zombies: 1.3, length: 0.8, scrap: 25 },
              result: "Shamblers whoosh past on their backs, arms out, enjoying themselves immensely. One of them is still wearing the snow hat."
            },
            {
              label: "Night descent",
              desc: "Elsa fits the lodge's spare snow chains on your tires and packs you a thermos of cinnamon tea, but by the time she is done, it is dark.",
              effects: { night: true, hp: 15, crates: 1 },
              result: "The chains bite into the snow, and the headlights turn the flakes into falling sparks. The tea is still warm at the bottom."
            }
          ]
        }
      },
      {
        id: "g6-boat-dock",
        place: "Boat Dock",
        host: "Grandpa Joe",
        intro: "Grandpa Joe unfolds a letter that smells of salt. \"From my old friend at the harbor. My eyes are not what they were. Read it to me?\"",
        kind: "letter",
        title: "A Letter From the Harbor",
        text: "Dear Joe,\n\nGreetings from the Boat Dock, where the gulls are loud, the fish are stubborn, and the coffee tastes like the inside of a boot. I would not trade it for anything.\n\nYou asked about the fog bell. Yes, we ring it every night, three slow strokes at dusk and three at dawn. Here is why. Last month the fishing boat Marigold lost her way in a fog so dense that the crew could not see the bow from the stern. They had no light to steer by, but they heard the bell from the Old Lighthouse far across the bay. They followed the sound home. Since then the Lighthouse rings for us, and we ring for them. We are two ends of one rope.\n\nThe Shamblers here have taken up fishing, in a manner of speaking. They stand at the end of the pier and stare at the water with tremendous patience. They never catch anything, since they have no rods, but they seem content. One fell in on Tuesday. It floated like a cork, looked mildly astonished, and drifted out to a sandbar, where it is still standing. We bring it a hat on sunny days.\n\nI am writing for a reason beyond gossip. The Marigold's crew found a crate of charts in a sealed locker, showing harbors along the coast. We cannot read them, Joe. The symbols are a riddle to us. If the Bookmobile driver can read them, we could map every safe harbor from here to the mountains.\n\nSend the reader. We will send fish. Not the Shamblers' fish, since there are none.\n\nYour friend across the water,\nCaptain Oyelaran",
        questions: [
          {
            type: "detail",
            q: "How many strokes of the bell are rung at dusk?",
            options: ["One", "Two", "Three", "Six"],
            answer: 2,
            hint: "The second paragraph describes when and how the bell is rung."
          },
          {
            type: "inference",
            q: "What is the main reason the captain wrote this letter?",
            options: ["To complain about the coffee", "To describe the fishing Shamblers", "To invite Joe for a visit", "To ask for a chart reader"],
            answer: 3,
            hint: "The captain says there is \"a reason beyond gossip,\" so look at what comes right after."
          },
          {
            type: "vocab",
            word: "dense",
            q: "What does the word \"dense\" mean in this passage?",
            options: ["Very thick", "Very cold", "Very salty", "Very bright"],
            answer: 0,
            hint: "The fog was so dense that the crew could not see from one end of their own boat to the other."
          }
        ],
        choice: {
          prompt: "Which road along the harbor?",
          options: [
            {
              label: "Pier road",
              desc: "Short and flat and lined with fishing Shamblers who are too patient to notice you, but the fog off the water is thick.",
              effects: { zombies: 0.7, fog: true, length: 0.9 },
              result: "The fishing Shamblers do not even turn their heads. Far across the bay, the lighthouse bell answers the dock bell, three and three."
            },
            {
              label: "The cannery hill",
              desc: "A steep road past the old cannery, where crates of supplies spilled down the slope and plenty of Shamblers are rummaging through them.",
              effects: { zombies: 1.4, crates: 3 },
              result: "The cannery smells like a thousand old sardines. Shamblers on the hill hold up cans and look at you hopefully, as if you have the opener."
            },
            {
              label: "Ferry crossing",
              desc: "The captain floats your van across the bay on a barge, which is peaceful, but the salt spray is hard on the paint.",
              effects: { zombies: 0.6, hp: -8, length: 1.1 },
              result: "Gulls escort the barge like a noisy honor guard. The Shambler on the sandbar tips its hat as you drift by."
            }
          ]
        }
      },
      {
        id: "g6-mall-rooftop",
        place: "Mall Rooftop",
        host: "Max and Mia",
        intro: "Max and Mia spread a hand-drawn map across the hood of your van. \"We surveyed the whole roof,\" says Max. \"Read the legend before you step on anything,\" says Mia.",
        kind: "map",
        title: "Rooftop Map Legend",
        text: "MALL ROOFTOP, LEGEND AND NOTES. Surveyed by Max and Mia over three days, with a borrowed telescope and one sunburn each. North is toward the big pretzel sign.\n\nSolid Line: The main roof. It is flat, tarred, and sturdy enough for the whole haven to sleep on. Rain collects in the low corner by the vents, so that corner is the garden now. We grow lettuce in shopping carts.\n\nDashed Line: The glass skylights. Do not walk on them. They look like floor, but they are the ceiling of the food court, where the Shamblers hold their endless, silent meetings.\n\nLadder Symbol: The three ways up. The east ladder is the only one that reaches the ground. The others end on the parking garage, which is handy only if you are a pigeon.\n\nTriangle: The lookout, on top of the elevator shed. From there you can see the highway, the river, and, on a clear day, the Water Tower flashing hello at sunset.\n\nSpiral: The rooftop playground slide. It spits you out on the second floor by the shoe store. Use it only in an emergency, and tuck your elbows.\n\nCircle With a Dot: The escalator doors. They are chained. Behind them the escalators still run for nobody. The Shamblers tried once. They rode up, got confused, rode down, and did this all afternoon. We timed them. Forty-one laps.\n\nStar: The Bookmobile parking spot in the loading dock, under the awning, out of the rain and out of sight.\n\nIf you can read this legend, you can find the garden, the lookout, and the way down without ever meeting a Shambler. That is the point of a map.",
        questions: [
          {
            type: "detail",
            q: "Which ladder reaches all the way to the ground?",
            options: ["The north ladder", "The west ladder", "The east ladder", "The garage ladder"],
            answer: 2,
            hint: "Find the Ladder Symbol in the legend."
          },
          {
            type: "inference",
            q: "Why does the legend warn not to walk on the dashed lines?",
            options: ["They are slippery with rain", "They are glass, not floor", "They mark where the garden grows", "They lead to the slide"],
            answer: 1,
            hint: "The Dashed Line entry explains what the skylights really are."
          },
          {
            type: "vocab",
            word: "sturdy",
            q: "What does the word \"sturdy\" mean in this passage?",
            options: ["Smooth and shiny", "Hot in the sun", "Dark and slippery", "Strong and solid"],
            answer: 3,
            hint: "The Solid Line entry says the roof is sturdy enough for the whole haven to do something."
          }
        ],
        choice: {
          prompt: "Which way down from the mall?",
          options: [
            {
              label: "The east ladder",
              desc: "The slow, safe climb down to a quiet side street behind the loading dock.",
              effects: { zombies: 0.8, length: 1.1 },
              result: "Rung by rung, the roof garden shrinks above you. Mia waves a lettuce leaf goodbye."
            },
            {
              label: "The loading ramp",
              desc: "A short ramp straight into the main lot, where the food court Shamblers have just let out of their meeting.",
              effects: { zombies: 1.4, scrap: 30 },
              result: "The meeting is over, and the whole crowd shuffles into the lot. They seem to have decided nothing, as usual."
            },
            {
              label: "The parking garage",
              desc: "Mia found a ramp down from the garage's top deck, and it is dark inside, but there are forgotten supply crates on every level.",
              effects: { night: true, crates: 3, zombies: 1.1 },
              result: "Your headlights sweep across empty parking spaces and a pyramid of shopping carts. A Shambler is asleep in a sedan, snoring."
            }
          ]
        }
      },
      {
        id: "g6-ranger-station",
        place: "Ranger Station",
        host: "Ranger Okafor",
        intro: "Ranger Okafor taps a list pinned beside the door. \"A whole summer of field notes. Read them and you'll know more about Shamblers than the Shamblers do.\"",
        kind: "list",
        title: "Field Notes: What We Know About Shamblers",
        text: "RANGER STATION FIELD NOTES. Observations on Shamblers, compiled over one summer by Ranger Okafor, with help from Biscuit, who contributed mainly by barking.\n\n1. Shamblers are slow. Not just slow walkers, but slow thinkers. If you stand still, it takes one about a minute to decide you are interesting. By then you are elsewhere.\n\n2. They follow sound, light, and smell, in that order. A dropped pan draws three. A lantern draws two. A pot of chili draws every Shambler in the valley and, honestly, several rangers.\n\n3. They cannot climb. They try, but their knees do not bend the right way. Any ladder, stairway, or tall rock is a safe place to eat lunch.\n\n4. They dislike mint, rain, and surprises. A sudden sneeze makes one poof into green smoke on the spot. Grandpa Joe claims a loud enough hiccup works too. This is unconfirmed.\n\n5. They are curious about reflections. We watched one spend an afternoon trying to shake hands with itself in a pond. It left disappointed but unharmed.\n\n6. They are not cruel, only hungry and mixed up. We keep the gates shut and the chili lid on, and we have never had a problem that lasted longer than an hour.\n\n7. They cannot read. This is the most important note on the list. A sign that says KEEP OUT means nothing to them. A sign that says FREE BRAINS means nothing to them either. But to us, a sign is a map, a warning, and a promise. Reading is the fence that keeps a haven safe.\n\nPin this list by the door. Add to it. Correct it. Field notes are never finished.",
        questions: [
          {
            type: "detail",
            q: "According to the notes, what do Shamblers follow first?",
            options: ["Smell", "Light", "Sound", "Warmth"],
            answer: 2,
            hint: "Note 2 lists three things in a specific order."
          },
          {
            type: "inference",
            q: "Why does the ranger call note 7 the most important?",
            options: ["Reading protects the haven", "Shamblers hate all signs", "Signs scare Shamblers away", "Rangers write the signs"],
            answer: 0,
            hint: "Note 7 ends with a sentence about a fence."
          },
          {
            type: "vocab",
            word: "unconfirmed",
            q: "What does the word \"unconfirmed\" mean in this passage?",
            options: ["Proven true", "Written in pencil", "Very loud", "Not yet proven"],
            answer: 3,
            hint: "Note 4 says Grandpa Joe claims something, and the last word describes that claim."
          }
        ],
        choice: {
          prompt: "Which trail from the station?",
          options: [
            {
              label: "The ridge trail",
              desc: "High and rocky, which keeps it nearly empty since Shamblers cannot climb, but the van crawls over the stones and rattles every bolt.",
              effects: { zombies: 0.6, length: 1.2, hp: -5 },
              result: "The whole valley spreads out below, green and gold. Biscuit barks at a hawk, and the hawk ignores him."
            },
            {
              label: "The creek road",
              desc: "Low and fast through the pines toward a chili cook-off at the far end, with every Shambler in the valley heading the same way.",
              effects: { zombies: 1.4, scrap: 30, length: 0.9 },
              result: "The smell of chili rolls up the road, and so do the Shamblers. You beat them to the cook-off and are handed a bowl."
            },
            {
              label: "The firebreak",
              desc: "Okafor sends you down the wide dirt firebreak with a crate of supplies, but the dust hangs in the air like fog.",
              effects: { fog: true, crates: 2, scrap: 10 },
              result: "Dust billows behind the van in a long tan cloud. Okafor's parting advice crackles over the radio: \"Chili lid ON.\""
            }
          ]
        }
      },
      {
        id: "g6-fire-station",
        place: "Fire Station",
        host: "Chief Vega",
        intro: "Chief Vega unpins a yellowed clipping from the station wall. \"Our one and only newspaper story. The reporter was ten. It is better than it sounds.\"",
        kind: "story",
        title: "The Day the Bell Rang Itself",
        text: "From The Haven Herald, written and illustrated by Mia, age ten.\n\nFIRE STATION. On Tuesday morning, the old brass bell at the Fire Station rang eleven times with nobody pulling the rope. Residents assumed it was a drill. It was not a drill.\n\nChief Vega climbed to the bell tower to investigate, carrying a mop in case of trouble. There she discovered a Shambler wedged upside down inside the bell, moaning \"Brrrains?\" in a voice that made the whole bell boom. \"It wandered up the back stairs and tried to hug the bell,\" the Chief told this reporter. \"The bell did not hug back.\"\n\nWith the help of Captain Ruby, a ladder, and a great deal of patience, the Shambler was tipped out of the bell. It landed on a pile of fire hoses, sat up, looked around in wonder, and poofed into green smoke. Nobody was hurt. The bell was fine. The hoses were slightly rumpled.\n\nThe real story, however, happened in the yard. When the bell rang, every resident of the haven ran toward the station instead of away from it. Doc Lin came with her kit. Grandpa Joe came with his radio. Max came with a map, in case the emergency needed directions. \"That is what the bell is for,\" said Chief Vega. \"Not to warn people off, but to call them together.\"\n\nThe Chief has since posted a new sign on the back stairs. It reads: NO HUGGING THE BELL. Residents report that the Shamblers cannot read it, but it makes everyone feel better anyway.\n\nThis reporter was given a juice box for her trouble.",
        questions: [
          {
            type: "detail",
            q: "What did Chief Vega carry up to the bell tower?",
            options: ["A ladder", "A mop", "A fire hose", "A radio"],
            answer: 1,
            hint: "The second paragraph says what she took in case of trouble."
          },
          {
            type: "inference",
            q: "What does the Chief mean when she says the bell is to \"call them together\"?",
            options: ["It frightens Shamblers off", "It is only used for drills", "It brings the haven to help", "It wakes residents each morning"],
            answer: 2,
            hint: "Look at what the residents did when the bell rang, and what each of them brought."
          },
          {
            type: "vocab",
            word: "wedged",
            q: "What does the word \"wedged\" mean in this passage?",
            options: ["Stuck tightly", "Sleeping soundly", "Swinging freely", "Ringing loudly"],
            answer: 0,
            hint: "It took a ladder and a great deal of patience to get the Shambler out of the bell."
          }
        ],
        choice: {
          prompt: "Which way out of town?",
          options: [
            {
              label: "Main street",
              desc: "The bell drew a crowd of Shamblers to the station, and main street is short but runs straight through them.",
              effects: { zombies: 1.4, length: 0.8, scrap: 25 },
              result: "The crowd parts like slow green curtains. Several Shamblers try to hug the van. The van does not hug back."
            },
            {
              label: "The river bend",
              desc: "The long way around, quiet and shady, with nothing to see but herons.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "Herons stand in the shallows like gray umbrellas. The bell fades behind you until it is just the memory of a sound."
            },
            {
              label: "Hose truck escort",
              desc: "Ruby drives ahead in the hose truck spraying the road, which soaks the Shamblers and sends them wandering, but the spray cuts your view and the pavement is slick.",
              effects: { zombies: 0.7, fog: true, hp: -5 },
              result: "Soggy Shamblers wander off in every direction, shaking themselves like dogs. The van fishtails once, and Biscuit pretends he meant to do that."
            }
          ]
        }
      },
      {
        id: "g6-zoo-gate",
        place: "Zoo Gate",
        host: "Admiral the Tortoise",
        intro: "Admiral the tortoise blinks at you slowly from the zoo gate. A folded note is tucked under the strap on his shell, and he seems to expect you to read it.",
        kind: "note",
        title: "Taped to the Zoo Gate",
        text: "To whoever reads this next,\n\nI am the last zookeeper, and I am leaving the gate unlocked on purpose. Before you panic, read the whole note. Nothing in here will chase you. The lions left with the circus people two summers ago, and good luck to them all.\n\nWhat remains: fourteen goats, a tortoise named Admiral, three flamingos, and a parrot who knows one rude word. Also a family of otters who have claimed the fountain as their kingdom. They are all fed. The feeding schedule is pinned inside the gatehouse. The goats eat anything, including the schedule, so I made four copies.\n\nA word about the Shamblers. They visit most evenings and stand in front of the empty lion enclosure, waiting. I believe they think the lions will come back. In an odd way I admire their loyalty. They have never once bothered the goats. The goats, frankly, bother them.\n\nI am heading north to the Ranger Station, where my sister is. I did not leave because the zoo is dangerous. I left because it is lonely, and loneliness is a slower kind of danger. I would rather be useful among people than safe among goats.\n\nIf you are the Bookmobile, please read to Admiral before you go. His book is a field guide to reptiles, and he enjoys hearing it. He is one hundred and four. He has heard it many times. He does not mind.\n\nPlease water the otters' fountain. Please talk to the parrot, but not too much.\n\nHal",
        questions: [
          {
            type: "detail",
            q: "Why did Hal make four copies of the feeding schedule?",
            options: ["The otters splash it", "The goats eat it", "The parrot tears it", "The wind blows it away"],
            answer: 1,
            hint: "The second paragraph says what the goats will eat."
          },
          {
            type: "inference",
            q: "Why did Hal leave the zoo?",
            options: ["The Shamblers frightened him", "The animals were unfed", "He felt too lonely there", "His sister needed a doctor"],
            answer: 2,
            hint: "Hal gives one reason he did not leave and one reason he did."
          },
          {
            type: "vocab",
            word: "enclosure",
            q: "What does the word \"enclosure\" mean in this passage?",
            options: ["A fenced animal area", "A kind of animal feed", "A map of the zoo", "A lock on the gate"],
            answer: 0,
            hint: "The Shamblers wait in front of the lion enclosure, which has been empty since the lions left."
          }
        ],
        choice: {
          prompt: "Which way north?",
          options: [
            {
              label: "The goat path",
              desc: "Fourteen goats trot ahead of the van and eat every weed on the road, which is slow, but Shamblers steer well clear of goats.",
              effects: { zombies: 0.7, length: 1.2 },
              result: "The goats lead, the van follows, and the Shamblers keep their distance. One goat eats a road sign on the way."
            },
            {
              label: "The flamingo marsh",
              desc: "A short causeway across the marsh, where mist rises at dusk and Shamblers wade around looking for lions, but supply crates float by the rails.",
              effects: { fog: true, length: 0.8, zombies: 1.2, crates: 2 },
              result: "Flamingos stand on one leg and watch you pass. The Shamblers in the marsh are stuck, cheerful, and up to their knees in mud."
            },
            {
              label: "The parade route",
              desc: "Straight through town, fast and wide, with the otters riding on your roof for luck and every Shambler coming out to watch the parade.",
              effects: { zombies: 1.4, scrap: 30 },
              result: "The otters chirp from the roof like a tiny marching band. The Shamblers line the street and wave, which is the politest ambush ever."
            }
          ]
        }
      }
    ],
    roadSigns: [
      {
        text: "Spray-painted on an overpass: \"DETOUR. Highway 9 is closed past the river. Follow the orange arrows to the Train Yard.\"",
        q: "What should drivers follow to reach the Train Yard?",
        options: ["The river", "The orange arrows", "Highway 9"],
        answer: 1
      },
      {
        text: "Radio, Grandpa Joe: \"Snow on the pass after dark. If you are not at the Mountain Lodge by sunset, camp at the Ranger Station instead.\"",
        q: "Where should a late driver stop for the night?",
        options: ["The Mountain Lodge", "The top of the pass", "The Ranger Station"],
        answer: 2
      },
      {
        text: "Sign on the Boat Dock gate: \"Three bells at dusk means the fog is in. No boats out, no vans on the pier.\"",
        q: "What do three bells at dusk mean?",
        options: ["The fog has come in", "Dinner is ready", "A boat is arriving"],
        answer: 0
      },
      {
        text: "Chalk on the Library Fort wall: \"Quiet hours after sunset. Whisper, or the atlas section will shush you.\"",
        q: "What should visitors do after sunset?",
        options: ["Leave the fort", "Keep their voices low", "Read the atlas"],
        answer: 1
      },
      {
        text: "Hand-lettered board by the road: \"Fire Station ahead. If the bell is ringing, drive TOWARD it. That is what it is for.\"",
        q: "What should you do if you hear the bell?",
        options: ["Drive away from it", "Turn off your engine", "Drive toward the station"],
        answer: 2
      },
      {
        text: "Radio, Doc Lin: \"Mall Rooftop has lettuce to trade. Use the east ladder only. The others lead nowhere, which is a pointless way to climb.\"",
        q: "Which ladder should you use at the mall?",
        options: ["The east ladder", "The west ladder", "Any ladder you like"],
        answer: 0
      },
      {
        text: "Sign on the Zoo Gate: \"Goats loose on the road for the next mile. They have the right of way, and they know it.\"",
        q: "Who has the right of way on this stretch of road?",
        options: ["The vans", "The goats", "The Shamblers"],
        answer: 1
      },
      {
        text: "Painted on a water tank: \"Mile 40. Fuel at Gas-N-Go, twenty miles west. Everything is twenty miles from something.\"",
        q: "How far away is the fuel?",
        options: ["Forty miles west", "Twenty miles east", "Twenty miles west"],
        answer: 2
      }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
