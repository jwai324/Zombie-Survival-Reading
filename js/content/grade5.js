/* Zombie Survival Reading: grade 5 content.
   Calibration (docs/CONTENT_GUIDE.md): 180 to 230 words per passage, sentences of 22
   words or fewer, four options per question. Cause and effect, figurative language,
   character motivation. Mildly eerie is fine; scary is not. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[5] = {
    grade: 5,
    havens: [
      {
        id: "g5-old-lighthouse",
        place: "Old Lighthouse",
        host: "Keeper Ines",
        intro: "Keeper Ines meets you at the bottom of the creaky stairs, lantern in hand. \"Fog's coming in. Read last night's log while I put the kettle on, and tell me if I sound brave.\"",
        kind: "log",
        title: "Keeper's Log: Old Lighthouse",
        text: "Keeper's Log, Old Lighthouse. Keeper on duty: Ines Marsh.\n\nMonday, 6:10 p.m. Fog rolled in thick as oatmeal. I lit the great lamp, and the beam swept over the gray water like a long yellow arm. Two Shamblers wandered down the beach. They stopped, stared up at the light, and said, \"Brrrains?\" The light did not answer. They got bored and walked off into the sea foam.\n\nMonday, 9:40 p.m. The lamp sputtered, flickered, and went dark. The stairs creaked as I climbed all 112 steps with a flashlight in my teeth. I found the cause quickly. A seagull had built a nest on the generator switch, and the weight of the nest had flipped it off. I moved the nest to the windowsill. The gull glared at me the entire time.\n\nTuesday, 7:00 a.m. The light is steady again. The fishing boat from Boat Dock saw the beam and found the harbor in the dark. That is why I keep climbing those creaky stairs every single night. Somebody out in the fog is always looking for a little light.\n\nNote to the Bookmobile: please bring a book about seagulls. I would like to understand my enemy.",
        questions: [
          {
            type: "detail",
            q: "What caused the lamp to go dark on Monday night?",
            options: ["The fog soaked the wires", "Shamblers bumped the generator", "A gull's nest flipped the switch", "The keeper forgot to light it"],
            answer: 2,
            hint: "Look at the 9:40 p.m. entry, where Ines climbs the stairs to find the cause."
          },
          {
            type: "inference",
            q: "Why does Ines keep climbing the stairs every night?",
            options: ["To chase away the seagull", "So boats can find the harbor", "Because she is afraid of fog", "To count the Shamblers below"],
            answer: 1,
            hint: "Read the Tuesday entry and notice what the fishing boat was able to do."
          },
          {
            type: "vocab",
            word: "sputtered",
            q: "What does the word \"sputtered\" mean in this passage?",
            options: ["Flickered and coughed", "Shone brighter than ever", "Spun around in circles", "Hummed a quiet tune"],
            answer: 0,
            hint: "The lamp sputtered right before it went dark, so think about what a lamp does just before it fails."
          }
        ],
        choice: {
          prompt: "Which road along the coast?",
          options: [
            {
              label: "The cliff road",
              desc: "Short and steep with a strong wind that blows the fog away, but Shamblers love to sunbathe on the cliff tops.",
              effects: { zombies: 1.3, scrap: 25 },
              result: "The van hugs the cliff edge. Far below, the waves clap like an audience that has seen this trick before."
            },
            {
              label: "The beach road",
              desc: "Long and flat and nearly empty, but the fog sits on the sand like a wet gray blanket.",
              effects: { zombies: 0.8, length: 1.2, fog: true },
              result: "Sand hisses under the tires. Somewhere in the fog, the lighthouse beam swings past like a slow hello."
            },
            {
              label: "The gull's shortcut",
              desc: "Ines swears the seagull knows a path through the dunes, and she tucked a spare tire and a crate of parts in your van for the trouble.",
              effects: { hp: 10, crates: 2, zombies: 1.1 },
              result: "The gull flies ahead, squawking directions. It is either guiding you or complaining. You follow it anyway."
            }
          ]
        }
      },
      {
        id: "g5-gas-n-go",
        place: "Gas-N-Go",
        host: "Captain Ruby",
        intro: "Captain Ruby wipes her hands on a rag and points at a laminated card taped to the pump. \"Nobody ever reads the instructions. Be the first. The van will thank you.\"",
        kind: "rules",
        title: "How to Work the Hand-Crank Pump",
        text: "HAND-CRANK FUEL PUMP, GAS-N-GO. Read every step before you touch the crank. Written by Captain Ruby, who has fixed this pump nine times and would like to stop.\n\n1. Check the gauge on the side of the tank. If the needle sits in the red, the tank is empty, so cranking will only give you a sore arm.\n\n2. Flip the brass lever to PRIME. This fills the hose with fuel. Wait until the hose stops gurgling, which means the air bubbles are out. Skip this step and the pump spits air instead of gas. Then the van will cough all the way to the next town.\n\n3. Crank slowly, like you are stirring thick soup. Cranking fast makes the pump squeal, and that squeal is a dinner bell to a Shambler. Last week a crew cranked fast, and twelve Shamblers showed up asking for brains. Nobody was hurt, but it took an hour to shoo them off.\n\n4. Stop when the nozzle clicks. Do not top off. Fuel on the ground makes the lot slippery, and a slipping Shambler is funny for exactly one second.\n\n5. Flip the lever back to OFF and hang up the hose. Wipe your hands on the rag, not on Biscuit.\n\nThank you for reading all five steps. Most people read step one and start cranking.",
        questions: [
          {
            type: "detail",
            q: "What does it mean when the gauge needle sits in the red?",
            options: ["The pump is primed", "The hose is full", "The nozzle is stuck", "The tank is empty"],
            answer: 3,
            hint: "Step one explains what the needle is telling you."
          },
          {
            type: "inference",
            q: "Why does Ruby want people to crank slowly?",
            options: ["It fills the tank faster", "The squeal attracts Shamblers", "It keeps the hose clean", "The crank snaps if turned fast"],
            answer: 1,
            hint: "Step three describes what the squeal sounds like to a Shambler."
          },
          {
            type: "vocab",
            word: "gurgling",
            q: "What does the word \"gurgling\" mean in this passage?",
            options: ["Leaking onto the ground", "Smelling like gasoline", "Making bubbling sounds", "Shaking back and forth"],
            answer: 2,
            hint: "Step two says what the gurgling means is happening inside the hose."
          }
        ],
        choice: {
          prompt: "Which way out of the station?",
          options: [
            {
              label: "The highway",
              desc: "Fast and straight, but highways are where the Shambler traffic jams happen, and they drop scrap when they poof.",
              effects: { zombies: 1.4, scrap: 30 },
              result: "The engine purrs on the fresh fuel. Up ahead, a line of Shamblers is waiting at a stoplight that no longer works."
            },
            {
              label: "The farm road",
              desc: "Slow, bumpy, and quiet, with a long detour around a cornfield that nobody has harvested in ages.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "Corn taller than the van rustles on both sides. Biscuit sticks his head out the window and sneezes at the pollen."
            },
            {
              label: "Ruby's test drive",
              desc: "Ruby tuned your engine for free, but she wants you to take the night road so she can hear how it sounds in the dark.",
              effects: { night: true, hp: 15 },
              result: "The headlights carve two tunnels into the dark. Ruby's voice crackles on the radio: \"Sounds good. Don't scratch it.\""
            }
          ]
        }
      },
      {
        id: "g5-drive-in-theater",
        place: "Drive-In Theater",
        host: "Penny the Projectionist",
        intro: "Penny the projectionist hands you a crumpled poster from the ticket booth. \"Show starts at dusk. Read the rules first, especially the part about popcorn.\"",
        kind: "poster",
        title: "Tonight at the Starlight Drive-In",
        text: "STARLIGHT DRIVE-IN THEATER. Now showing every night at dusk!\n\nTONIGHT'S FEATURE: \"Attack of the Giant Zucchini.\" A farm, a vegetable, and a very bad idea. Rated G for Goofy.\n\nADMISSION: One can of food per car, or one good joke per person. Jokes are judged by Doc Lin, so puns earn double.\n\nPARKING: Face the screen. The screen is a giant white sail, and it catches the wind, so park away from the bottom edge on breezy nights.\n\nSOUND: Hang the gray speaker on your window and turn the knob to the left. Keep it low. Loud sound carries across the field, and Shamblers follow sound the way moths follow a porch light.\n\nSHAMBLER POLICY: Shamblers are welcome to watch from the back row. They do not understand movies, but they enjoy the flickering. If one leans on your hood, honk twice and it will shuffle off. Do not share your popcorn. They will try to eat the bucket.\n\nSNACK BAR: Open until the second reel. We are out of butter, but we have plenty of salt and hope.\n\nCLOSING: When the screen goes dark, drive out slowly with your headlights off until you reach the gate. Lights would draw a crowd, and that crowd would not be here for the movie.\n\nSee you under the stars.",
        questions: [
          {
            type: "detail",
            q: "What should you do if a Shambler leans on your hood?",
            options: ["Share your popcorn", "Turn up the speaker", "Flash your headlights", "Honk twice"],
            answer: 3,
            hint: "Find the Shambler Policy section of the poster."
          },
          {
            type: "inference",
            q: "Why does the poster say to keep the speaker low?",
            options: ["The speakers break easily", "Other cars want quiet", "Loud sound draws Shamblers", "The movie has no sound"],
            answer: 2,
            hint: "The Sound section compares Shamblers to moths."
          },
          {
            type: "vocab",
            word: "admission",
            q: "What does the word \"admission\" mean in this passage?",
            options: ["The price to get in", "The name of the movie", "A place to park", "A rule about snacks"],
            answer: 0,
            hint: "The Admission line tells what each car must give before the show."
          }
        ],
        choice: {
          prompt: "Which road after the show?",
          options: [
            {
              label: "The back field",
              desc: "Dark and quiet, and Penny asks you to keep your headlights off, so you will drive the long way by moonlight.",
              effects: { night: true, zombies: 0.8, length: 1.1 },
              result: "The moon is a nightlight over the field. Behind you, the Shamblers in the back row are still waiting for the credits."
            },
            {
              label: "The front gate",
              desc: "Lit, fast, and crowded with Shamblers who came for the flickering, but the snack truck dropped crates all along the drive.",
              effects: { zombies: 1.4, crates: 3 },
              result: "Shamblers turn toward your headlights like sunflowers. You weave between them, and a crate of popcorn salt thumps into the van."
            }
          ]
        }
      },
      {
        id: "g5-water-tower",
        place: "Water Tower",
        host: "Biscuit",
        intro: "Biscuit trots up with a damp envelope in his mouth and drops it on your boot. It is addressed to \"The Bookmobile, wherever it is.\"",
        kind: "letter",
        title: "A Letter From the Water Tower",
        text: "Dear Bookmobile,\n\nMy name is Pip, and I am ten. I live on top of the Water Tower with my aunt and eleven chickens. You might have seen the words I painted on the tank. They say BOOKS PLEASE in letters as tall as a door. I used all the yellow paint, so Aunt Dee was not thrilled, but she did not make me scrub it off.\n\nHere is why I painted it. Every night Aunt Dee reads to the chickens, because she says it keeps them calm. The problem is that we only have one book, and it is a manual for a lawn mower. The chickens know every page. So do I. I can tell you exactly how to change a spark plug, and I am not even allowed to touch one.\n\nI hear the Bookmobile has shelves that go on forever. If you can spare anything with a dragon in it, or a map, or a mystery, we would be so grateful. I will pay in eggs. The chickens agreed, mostly.\n\nBiscuit is carrying this letter because he is the bravest dog in the county. He also likes our chickens, in a friendly way.\n\nYour friend,\nPip\n\nP.S. The ladder has 88 rungs. Bring strong arms and a light lunch.",
        questions: [
          {
            type: "detail",
            q: "What is the only book Pip and Aunt Dee have?",
            options: ["A map of the county", "A lawn mower manual", "A book about dragons", "A guide to chickens"],
            answer: 1,
            hint: "Look in the second paragraph, where Pip explains the problem."
          },
          {
            type: "inference",
            q: "Why did Pip paint BOOKS PLEASE on the tank?",
            options: ["To make Aunt Dee angry", "To use up the yellow paint", "To decorate the tower", "To get new books to read"],
            answer: 3,
            hint: "Pip says \"Here is why I painted it\" and then explains."
          },
          {
            type: "vocab",
            word: "thrilled",
            q: "What does the word \"thrilled\" mean in this passage?",
            options: ["Very pleased", "Very frightened", "Very tired", "Very confused"],
            answer: 0,
            hint: "Pip used up all the paint, so think about how Aunt Dee would feel about that."
          }
        ],
        choice: {
          prompt: "Where to from the tower?",
          options: [
            {
              label: "Climb the tower first",
              desc: "Aunt Dee will patch the van and fill your water jugs, but the climb takes a while, and Shamblers gather below while you are up there.",
              effects: { hp: 15, length: 1.1, zombies: 1.1 },
              result: "Eighty-eight rungs later, Pip hugs a stack of dragon books. The chickens inspect you and decide you are acceptable."
            },
            {
              label: "The canal road",
              desc: "Flat and quiet, but the mist off the canal hides the ditches, so you will have to drive slowly and carefully.",
              effects: { zombies: 0.8, fog: true, length: 1.1 },
              result: "The canal mist swallows the road ahead. Biscuit rides on the dashboard, nose first, like a furry hood ornament."
            },
            {
              label: "The egg farm shortcut",
              desc: "Pip knows a gravel road past the egg farm, which is short and fast, except that every Shambler for miles loves eggs.",
              effects: { zombies: 1.4, length: 0.8, scrap: 25 },
              result: "Gravel pings off the van. The Shamblers at the egg farm look up, egg yolk on their chins, and say \"Brrrains?\" with their mouths full."
            }
          ]
        }
      },
      {
        id: "g5-moon-diner",
        place: "Moon Diner",
        host: "Doc Lin",
        intro: "Doc Lin slides a flour-dusted recipe card across the counter. \"Read this before you touch the griddle. The last cook skipped a step, and we ate frisbees for a week.\"",
        kind: "recipe",
        title: "Full Moon Pancakes",
        text: "FULL MOON PANCAKES, Moon Diner house recipe. Makes a stack as tall as Biscuit. Out of this world, if we do say so ourselves.\n\nYou will need: two cups of flour. Two spoonfuls of sugar. A pinch of salt. One spoonful of baking soda. Two eggs. Two cups of milk. A lump of butter the size of a walnut.\n\nStep 1. Mix the flour, sugar, salt, and baking soda in the big blue bowl. The soda is the secret. It makes tiny bubbles when it meets the milk, and those bubbles are what make the pancakes puff up. No soda, no puff, and you get a frisbee.\n\nStep 2. Crack the eggs into the milk and whisk until it looks like sunshine. Pour that into the dry bowl.\n\nStep 3. Stir until the batter looks like wet sand, lumpy and thick. Do not stir it smooth. Too much stirring squeezes out the bubbles, and the pancakes come out flat and sad.\n\nStep 4. Heat the griddle until a drop of water dances on it. Pour the batter in big round moons.\n\nStep 5. Flip when the edges look dry. Flip only once. Pancakes, like Shamblers, get confused if you turn them around too much.\n\nServe with the last of the syrup. Share with anyone who walks in, except Shamblers. They only want brains, and we are fresh out.",
        questions: [
          {
            type: "detail",
            q: "What makes the pancakes puff up?",
            options: ["The lump of butter", "Bubbles from the baking soda", "Whisking the eggs hard", "A very hot griddle"],
            answer: 1,
            hint: "Step one explains the secret ingredient."
          },
          {
            type: "inference",
            q: "What happens if you stir the batter until it is smooth?",
            options: ["The pancakes burn", "The griddle gets too hot", "The pancakes come out flat", "The batter turns to sand"],
            answer: 2,
            hint: "Step three warns about too much stirring."
          },
          {
            type: "vocab",
            word: "batter",
            q: "What does the word \"batter\" mean in this passage?",
            options: ["A kind of pan", "A person who hits a ball", "The syrup on top", "The uncooked mix"],
            answer: 3,
            hint: "In step three, the batter is what you stir, and in step four it is what you pour."
          }
        ],
        choice: {
          prompt: "Which way from the diner?",
          options: [
            {
              label: "Moon Road",
              desc: "Doc Lin says the moon is full, so the road is dark but the Shamblers are sleepy and few.",
              effects: { night: true, zombies: 0.8 },
              result: "The moon rides along above the van like a pancake nobody flipped. Doc Lin's laugh follows you out of the lot."
            },
            {
              label: "Syrup Lane",
              desc: "A syrup truck spilled here last spring, so Shamblers get stuck in the goo, but the van crawls too and the road drags on.",
              effects: { zombies: 0.7, length: 1.3 },
              result: "The tires make a sound like someone pulling off a sticker. A Shambler stuck in the syrup waves politely as you pass."
            },
            {
              label: "The truck stop",
              desc: "A short run past a tipped-over supply truck, with lots of crates on the road and lots of Shamblers trying to unload them.",
              effects: { zombies: 1.4, crates: 3, length: 0.9 },
              result: "Shamblers are stacking crates in a wobbly tower. You collect the ones that rolled away before anyone notices."
            }
          ]
        }
      },
      {
        id: "g5-greenhouse",
        place: "Greenhouse",
        host: "Rosa the Gardener",
        intro: "Rosa the gardener wipes dirt from her hands and opens a notebook with a pressed tomato leaf in it. \"My diary. Read yesterday's page and tell me I am not losing my mind.\"",
        kind: "diary",
        title: "Greenhouse Diary, Day 41",
        text: "Day 41 in the Greenhouse.\n\nThe tomatoes are finally blushing red. I have talked to them every morning since they were seedlings, and I like to think the pep talks helped. Grandpa Joe calls me the vegetable whisperer. I will take it.\n\nSomething strange happened at dusk. I was watering the beans when a shape pressed against the glass wall. It was round and pale, and it fogged the glass with every breath. My heart drummed. Then the shape said, \"Brrrains?\" in the most hopeful voice, and I laughed so hard I spilled the watering can. It was only a Shambler who wanted to see the tomatoes. It stood there for an hour, leaving nose prints on the glass.\n\nThat gave me an idea. I moved the mint plants to the doorway. Shamblers hate mint. The smell makes them sneeze, and a sneezing Shambler forgets what it came for. By bedtime my visitor had wandered off to bother the scarecrow instead.\n\nWhy do I keep this place going when every pane needs patching? Because the haven eats what I grow. Because Max and Mia ask for strawberries every single day. Because a sprout pushing up through the dirt is the bravest thing I know. Tomorrow I plant more mint. Lots more.",
        questions: [
          {
            type: "detail",
            q: "Why did Rosa move the mint plants to the doorway?",
            options: ["The smell makes Shamblers sneeze", "Mint grows better by the door", "The scarecrow needed shade", "Grandpa Joe asked for mint"],
            answer: 0,
            hint: "Look at the paragraph that begins \"That gave me an idea.\""
          },
          {
            type: "inference",
            q: "What keeps Rosa working in the greenhouse?",
            options: ["She is hiding from Shamblers", "She wants to win a prize", "The haven depends on her food", "Grandpa Joe orders her to"],
            answer: 2,
            hint: "The last paragraph answers the question Rosa asks herself."
          },
          {
            type: "vocab",
            word: "blushing",
            q: "What does the word \"blushing\" mean in this passage?",
            options: ["Falling off", "Turning red", "Growing taller", "Drying out"],
            answer: 1,
            hint: "The first line describes what the tomatoes are doing as they ripen."
          }
        ],
        choice: {
          prompt: "Which road out of the valley?",
          options: [
            {
              label: "The orchard lane",
              desc: "Shady and calm, but it winds around every apple tree in the county before it reaches the main road.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "Apples thump onto the roof as you pass under the branches. Biscuit catches one and looks very pleased."
            },
            {
              label: "The scarecrow field",
              desc: "A straight shot through the corn, where the scarecrows confuse the Shamblers, but there are a great many Shamblers to confuse.",
              effects: { zombies: 1.3, length: 0.9, scrap: 20 },
              result: "Shamblers are hugging the scarecrows and saying \"Brrrains?\" to the straw. One scarecrow is wearing a Shambler's hat now."
            },
            {
              label: "Mint delivery",
              desc: "Rosa fills your van with mint, which makes Shamblers sneeze and flee, but the smell is so strong your eyes water and the road blurs.",
              effects: { zombies: 0.7, fog: true, scrap: 10 },
              result: "The van smells like toothpaste. Every Shambler you pass sneezes, forgets what it was doing, and wanders off."
            }
          ]
        }
      },
      {
        id: "g5-mini-golf-castle",
        place: "Mini-Golf Castle",
        host: "Max and Mia",
        intro: "Max and Mia unroll a map covered in crayon symbols. \"We drew the whole course,\" says Mia. \"The legend explains everything,\" says Max. \"Mostly,\" says Mia.",
        kind: "map",
        title: "Map Legend: Castle Course",
        text: "MAP LEGEND, MINI-GOLF CASTLE. Symbols drawn by Max, words by Mia. Read the legend before you read the map, or you will walk into the moat.\n\nStar: Safe spots. Hole 1 and Hole 9 are inside the castle walls. The walls are plastic, but the Shamblers do not know that.\n\nFlag: Lookout posts. Hole 3 has a tower shaped like a giant golf ball. Climb it to see the whole course, from the parking lot to the pond.\n\nWave: Water hazards. The moat is real water, about knee deep. Shamblers walk into it and then stand there, dripping and confused, until someone leads them out.\n\nSpinning Arrow: The windmill at Hole 5. Its arms still turn in a breeze. We call it the castle's bouncer. Shamblers try to walk through it, get bonked by an arm, and poof into green smoke.\n\nDragon: Hole 7, the big purple dragon. Its mouth is where we keep the supply stash. Putt the ball into the mouth and the stash door clicks open. Treasure means scrap, snacks, and one very old sleeping bag.\n\nExclamation Point: Hole 8. Nothing bad lives there. The fountain is just broken, and it sprays you no matter where you stand.\n\nX: The gate. Captain Ruby fixed the hinge. It swings shut by itself, which is handy when the Shamblers show up for a game.",
        questions: [
          {
            type: "detail",
            q: "Where is the supply stash hidden?",
            options: ["Inside the windmill", "At the top of the tower", "In the dragon's mouth", "Under the broken fountain"],
            answer: 2,
            hint: "Find the Dragon symbol in the legend."
          },
          {
            type: "inference",
            q: "Why do the twins call the windmill \"the castle's bouncer\"?",
            options: ["It bounces golf balls high", "It knocks Shamblers away", "It is the castle's biggest toy", "It spins when the wind blows"],
            answer: 1,
            hint: "Read what happens to Shamblers at Hole 5, and think about what a bouncer at a door does."
          },
          {
            type: "vocab",
            word: "hazards",
            q: "What does the word \"hazards\" mean in this passage?",
            options: ["Fun bonus holes", "Places to rest", "Colors on the map", "Spots that cause trouble"],
            answer: 3,
            hint: "The Wave symbol explains what the moat does to anyone who walks into it."
          }
        ],
        choice: {
          prompt: "Which exit from the castle?",
          options: [
            {
              label: "Through the moat",
              desc: "The Shamblers are all standing in the moat, dripping and confused, so the road beyond is nearly empty, but driving through water is rough on the engine.",
              effects: { zombies: 0.6, hp: -10 },
              result: "Water sloshes over the hood. The Shamblers in the moat watch you pass with deep interest and do not move an inch."
            },
            {
              label: "Past the windmill",
              desc: "The bouncer is busy today, with Shamblers lining up to get bonked, and every one that poofs drops a little scrap.",
              effects: { zombies: 1.3, scrap: 25 },
              result: "Bonk. Poof. Bonk. Poof. The windmill keeps a steady rhythm, and you scoop up scrap like it is raining nickels."
            },
            {
              label: "The parking lot",
              desc: "A long loop around the empty lot, where Max says a few supply crates are hidden between the cars.",
              effects: { length: 1.2, crates: 2 },
              result: "Max was right. Two crates are tucked behind a minivan with a bumper sticker that says MY OTHER CAR IS A GOLF CART."
            }
          ]
        }
      },
      {
        id: "g5-radio-tower",
        place: "Radio Tower",
        host: "Grandpa Joe",
        intro: "Grandpa Joe pats the stool beside the radio. \"Sit. I have a story about this tower, and I promise it only takes half as long as it sounds.\"",
        kind: "story",
        title: "The Night the Tower Hummed",
        text: "The radio tower is a tall steel skeleton, and on windy nights it hums like a tuning fork. That was the night the signal died. One minute I was reading the weather to six havens, and the next, silence. My speaker just hissed like a kettle.\n\nNow, I am a radio man, not a climber. My knees creak louder than that tower. But six havens were waiting on the weather. A storm was coming, and they needed to know when to shut their gates. So I put on my boots and started up the ladder.\n\nHalfway up, I heard \"Brrrains?\" from below. A Shambler had followed the humming. It was trying to climb, but it kept grabbing the same rung and stepping on its own foot. Then Biscuit came tearing across the lot. He did not bite it. He barked once, the Shambler jumped, and it poofed into green smoke from pure surprise.\n\nAt the top I found the trouble. The wind had shaken the antenna wire loose, and it was slapping the tower like a jump rope. I twisted it back on, and the speaker crackled to life. Six havens cheered. My knees did not.\n\nSo when people ask why I keep that radio on all night, I tell them this. A voice in the dark is a kind of lighthouse. Somebody always needs one.",
        questions: [
          {
            type: "detail",
            q: "What did Grandpa Joe find at the top of the tower?",
            options: ["A bird's nest", "A loose antenna wire", "A Shambler on the ladder", "A broken speaker"],
            answer: 1,
            hint: "Look at the paragraph that begins \"At the top.\""
          },
          {
            type: "inference",
            q: "Why did Grandpa Joe climb the tower even though he is not a climber?",
            options: ["The havens needed the weather", "He wanted to see the storm", "Biscuit chased him up", "He likes the humming sound"],
            answer: 0,
            hint: "The second paragraph explains what the six havens were waiting for."
          },
          {
            type: "vocab",
            word: "crackled",
            q: "What does the word \"crackled\" mean in this passage?",
            options: ["Went quiet", "Fell apart", "Heated up", "Popped and buzzed"],
            answer: 3,
            hint: "The speaker crackled right after Joe fixed the wire, so think about what a speaker does when it comes back on."
          }
        ],
        choice: {
          prompt: "Which way into the weather?",
          options: [
            {
              label: "Wait out the storm",
              desc: "Stay an extra hour while the storm passes, so Ruby can patch the van, but the road will be dark by the time you leave.",
              effects: { hp: 15, night: true },
              result: "Rain drums on the roof while Ruby hammers on the bumper. When you roll out, the puddles are full of stars."
            },
            {
              label: "Race the storm",
              desc: "Leave right now and drive fast on a short, clear road, except that the Shamblers are out stretching their legs before the rain.",
              effects: { zombies: 1.3, length: 0.8, scrap: 20 },
              result: "Thunder grumbles behind you like a hungry stomach. The Shamblers on the road look up at the sky and forget about you entirely."
            },
            {
              label: "The valley road",
              desc: "The storm already passed through the valley, so it is quiet, but it is a long loop with mist pooled in every low spot.",
              effects: { zombies: 0.8, length: 1.2, fog: true },
              result: "Mist fills the valley like milk in a bowl. Grandpa Joe's voice follows you on the radio, reading the weather to anyone listening."
            }
          ]
        }
      }
    ],
    roadSigns: [
      {
        text: "Painted on a barn roof: \"BRIDGE OUT AT MILE 12. TAKE THE DIRT ROAD ON THE LEFT, NOT THE RIGHT.\"",
        q: "Which way should you turn at mile 12?",
        options: ["Left onto the dirt road", "Right onto the dirt road", "Straight across the bridge"],
        answer: 0
      },
      {
        text: "Radio, Grandpa Joe: \"Fog on the coast road until noon. Keep your lights low and your speed lower.\"",
        q: "What does Joe want drivers to do in the fog?",
        options: ["Turn their lights up high", "Slow down with low lights", "Wait until midnight to drive"],
        answer: 1
      },
      {
        text: "Sign on a farm gate: \"Shambler crossing for the next two miles. They are slow, so you do not have to be.\"",
        q: "What is the sign warning about?",
        options: ["A slippery road", "A closed gate", "Shamblers crossing the road"],
        answer: 2
      },
      {
        text: "Chalk on the road: \"Ruby was here. Free tire patch at the Fire Station if you say the password: BISCUIT.\"",
        q: "What is the password for a free tire patch?",
        options: ["Ruby", "Biscuit", "Fire Station"],
        answer: 1
      },
      {
        text: "A hand-painted board: \"Mini-Golf Castle this way, 3 miles. Moat closed today for Shambler drying.\"",
        q: "How far away is the Mini-Golf Castle?",
        options: ["3 miles", "13 miles", "30 miles"],
        answer: 0
      },
      {
        text: "Radio, Doc Lin: \"Puns are free today at the Moon Diner. The pancakes are flipping amazing.\"",
        q: "What is Doc Lin telling drivers about?",
        options: ["Free tires at the garage", "Pancakes at the diner", "A new radio show"],
        answer: 1
      },
      {
        text: "Sign nailed to a tree: \"If the Water Tower lights are flashing, Pip is saying hello. Flash your headlights back twice.\"",
        q: "What should you do when the tower lights flash?",
        options: ["Honk your horn twice", "Drive faster past it", "Flash your lights twice"],
        answer: 2
      },
      {
        text: "Sign on the drive-in gate: \"Headlights OFF past this point. The movie is better in the dark, and so are you.\"",
        q: "What must you do past the gate?",
        options: ["Turn off your headlights", "Turn on your radio", "Honk at the screen"],
        answer: 0
      }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
