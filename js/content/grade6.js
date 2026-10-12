/* Zombie Survival Reading: grade 6 content.
   Calibration (docs/CONTENT_GUIDE.md): 230 to 280 words per passage, sentences of 26
   words or fewer, four options per question. Theme, author's purpose, multi-step
   inference, sophisticated vocabulary. Grounded survival tone for a teen audience:
   tense, quiet, hopeful in small ways. No gore, no on-page deaths, no profanity. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[6] = {
    grade: 6,
    havens: [
      {
        id: "g6-library-fort",
        place: "Library Fort",
        host: "Odette",
        intro: "A woman named Odette, whose name is first on the charter, unpins it from the wall between two shelves of encyclopedias. \"We wrote this the week we stacked the walls. Rule four gets argued about every month. Read the whole thing before you take a side.\"",
        kind: "rules",
        title: "The Library Fort Charter",
        text: "THE LIBRARY FORT CHARTER. Written by the eleven people who stacked the walls, in the first month after the Fall. Read aloud to every newcomer before they sleep inside.\n\n1. The walls are built from books, but not from good ones. Encyclopedias, phone directories, forty copies of a tax manual nobody ever opened. Anything a person might want to read stays on the shelf. A wall can be rebuilt. A story that is gone is gone.\n\n2. Quiet after sunset. Walkers follow sound. The reading lamp in the north window stays lit, because a traveler can steer by it, and because a light says someone is still here.\n\n3. Everyone teaches one thing. Engines, stitches, radio, bread. If you can read, you teach reading, because it is the rarest skill on the road and the one that keeps the others alive.\n\n4. No one goes outside the walls alone. Not for water, not for firewood, not for a minute. This rule exists because in the second week, Sam went out alone to the well at dusk and did not come back until morning. He had seen three walkers on the road and hidden in the pump house all night, and nobody knew where to look. We spent that night calling his name into the dark. He was fine. We were not. So, rule four.\n\n5. Borrowing is allowed. Hoarding is not. One book under your pillow is a comfort. Twelve is a problem for your neighbors.\n\n6. When the Bookmobile comes, we trade fairly and ask the driver to read us something before they go.\n\nSigned in pencil. Nothing worth keeping is finished on the first draft.",
        questions: [
          {
            type: "detail",
            q: "Where did Sam hide during the night he was missing?",
            options: ["In the pump house", "Behind the north wall", "Inside the Bookmobile", "In the tax manual stacks"],
            answer: 0,
            hint: "Rule four tells the story of the second week."
          },
          {
            type: "inference",
            q: "What do the founders mean by \"He was fine. We were not\"?",
            options: ["Sam was never in real danger", "Not knowing was its own harm", "Walkers reached the walls", "Sam lied about the well"],
            answer: 1,
            hint: "Think about what the others were doing all night while Sam was hidden and safe."
          },
          {
            type: "vocab",
            word: "hoarding",
            q: "What does the word \"hoarding\" mean in this passage?",
            options: ["Lending to friends", "Reading very quickly", "Keeping more than you need", "Trading books away"],
            answer: 2,
            hint: "Rule five contrasts hoarding with borrowing, and gives a number of books."
          }
        ],
        choice: {
          prompt: "Which route leaves the fort?",
          options: [
            {
              label: "The avenue",
              desc: "Residents swept it this morning, so it is quiet, but it circles the whole park before it finds the highway.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "The avenue is so still you can hear the fort's generator long after the walls are out of sight."
            },
            {
              label: "The bookshop district",
              desc: "Short and crowded, with walkers packed into the narrow streets, though the shops are still full of unclaimed salvage.",
              effects: { zombies: 1.4, length: 0.9, scrap: 30 },
              result: "Walkers stand in the bookshop doorways like customers who forgot what they came for. Ruby pulls a box of batteries from a window display without slowing down."
            },
            {
              label: "The night lamp run",
              desc: "Odette asks you to carry lamp oil to the Water Tower tonight, so the van is patched for the trip, but you drive by headlights.",
              effects: { night: true, hp: 12, crates: 1 },
              result: "The north window glows behind you for a mile, then two. It is still there when you check the mirror the third time."
            }
          ]
        }
      },
      {
        id: "g6-ranger-station",
        place: "Ranger Station",
        host: "Ranger Hale",
        intro: "Ranger Hale slides a field notebook across the desk, its cover scorched at one corner. \"A summer of watching them from the fire tower. The map on the wall is nothing without these notes. Read them to me and tell me where you'd camp.\"",
        kind: "note",
        title: "Field Notes: Where the Walkers Gather",
        text: "RANGER STATION, FIELD NOTES. Observations from the fire tower, June through September. Compiled by Ranger Hale. Corrected by anyone with better eyes.\n\nWhere they gather. Not at random. The walkers collect in three kinds of places: low ground near water, the shade under overpasses and bridges, and anywhere a sound repeats. The creek bend below the station holds twenty to thirty on any given afternoon. The overpass at mile 14 holds more, and they stand in its shade like cattle under a tree.\n\nWhy. My best guess, and it is only a guess, is that they follow the last thing that drew them and then stop. A car alarm that ran for three days in June drew forty to the lot at the trailhead. When the battery died they stayed, because nothing new called them away. Sound starts them. Nothing stops them except another sound.\n\nWhat this means for us. Noise is a tool, not just a danger. On August 2 we rang the old fire bell for ten minutes and watched the creek bend empty toward it. The crew drew water in peace for the first time in a month. Then we had forty walkers at the foot of the tower for a week. It was worth it. Barely.\n\nThe sprinters are different. They do not gather. They move alone, fast, mostly at dusk, and they are gone by full dark. I have seen four all summer. I think about them more than the others.\n\nWhere to camp. High ground, away from water, away from any bridge, and never beside anything that makes a sound you cannot stop.",
        questions: [
          {
            type: "detail",
            q: "How many walkers gathered at the trailhead after the car alarm?",
            options: ["About twenty", "About forty", "About thirty", "Only four"],
            answer: 1,
            hint: "Look under \"Why\" for the story about the alarm in June."
          },
          {
            type: "inference",
            q: "Why does the ranger call noise \"a tool, not just a danger\"?",
            options: ["Noise can move walkers on purpose", "Noise frightens the sprinters", "The bell scares walkers off", "Walkers cannot hear well"],
            answer: 0,
            hint: "Read what happened at the creek bend on August 2, and what the crew did while it was empty."
          },
          {
            type: "vocab",
            word: "compiled",
            q: "What does the word \"compiled\" mean in this passage?",
            options: ["Thrown out", "Written in code", "Read aloud", "Gathered together"],
            answer: 3,
            hint: "The notes were compiled over a whole summer of observations."
          }
        ],
        choice: {
          prompt: "Which trail from the station?",
          options: [
            {
              label: "The ridge trail",
              desc: "High, dry, and rocky, far from water or bridges, but the van crawls over the stones and rattles every bolt.",
              effects: { zombies: 0.6, length: 1.2, hp: -5 },
              result: "The valley spreads out below, gray and gold. From here the creek bend is a dark smudge, and the smudge is not moving."
            },
            {
              label: "The creek road",
              desc: "Low and fast along the water, past the bend where the walkers stand, though a stalled supply truck sits at the ford.",
              effects: { zombies: 1.4, length: 0.9, crates: 3 },
              result: "The truck sits in the ford with its tailgate down and crates in the shallows. Twenty heads turn toward the sound of the engine, all at once."
            },
            {
              label: "Ring the bell and go",
              desc: "Hale rings the fire bell to pull the creek bend empty while you slip past, and you leave him the spare parts for the week ahead.",
              effects: { zombies: 0.7, scrap: -10 },
              result: "The bell rolls out over the valley. In the mirror, the shapes at the creek turn and begin their slow walk toward the tower, and Hale, and a week of waiting."
            }
          ]
        }
      },
      {
        id: "g6-fire-station",
        place: "Fire Station",
        host: "Jo",
        intro: "Jo unfolds a newspaper page gone soft at the creases and lays it flat on the engine bay floor. \"This came out on Day 6, before the presses stopped. Last paper anybody printed around here. I want to hear how it sounded, back when we still thought it was a story.\"",
        kind: "story",
        title: "The County Register, Day 6",
        text: "THE COUNTY REGISTER. Thursday. Printed by hand on the Fire Station press because the power is out downtown.\n\nFIRE STATION HOLDS AS TOWN GATHERS\n\nBy the time the second alarm sounded on Tuesday, nobody at the Fire Station believed it was a fire. Captain Hollis had already backed both engines across the bay doors and sent her crew to put the ladders up on the roof. \"I did not know what we were facing,\" she told this reporter. \"I knew what I had. A building with thick walls and people who show up when a bell rings.\"\n\nThey came. By dusk, more than ninety residents had crossed the square to the station, carrying what they could. A woman from the hardware store brought two hundred feet of chain. The librarian brought a radio. Three teenagers brought a wheelbarrow of canned food from a store whose owner had already gone north.\n\nBelow the windows, the slow ones gathered in the square and did not leave. The crew learned quickly that shouting drew them, and that silence did not send them away. \"They are not in a hurry,\" Hollis said. \"So we will not be either.\"\n\nOn Wednesday the crew ran a hose from the roof tank to the kitchen. On Thursday morning the station cook served oatmeal to ninety-four people in shifts of twenty.\n\nThis paper will print as long as there is paper. If you are reading this somewhere else, know this. The station is holding. The bell still works. When it rings, it is not a warning. It is a call to come in.",
        questions: [
          {
            type: "detail",
            q: "What did the librarian bring to the station?",
            options: ["A radio", "A wheelbarrow of food", "Two hundred feet of chain", "A hose from the tank"],
            answer: 0,
            hint: "The paragraph that begins \"They came\" lists what people carried."
          },
          {
            type: "inference",
            q: "What is the writer's main purpose in the final paragraph?",
            options: ["To warn people away", "To tell people where to come", "To describe the square", "To explain the printing"],
            answer: 1,
            hint: "Notice who the last paragraph is speaking to, and what it says the bell means."
          },
          {
            type: "vocab",
            word: "shifts",
            q: "What does the word \"shifts\" mean in this passage?",
            options: ["Changes of clothes", "Sudden movements", "Groups taking turns", "Night watches"],
            answer: 2,
            hint: "The cook fed ninety-four people, but only twenty at a time."
          }
        ],
        choice: {
          prompt: "Which way out of town?",
          options: [
            {
              label: "Through the square",
              desc: "Short and straight, across the square where the walkers have stood since the first week, past the hardware store and its full shelves.",
              effects: { zombies: 1.4, length: 0.8, scrap: 30 },
              result: "The square is a slow gray crowd that parts for the van one body at a time. The hardware store's door is still propped open with a sack of nails."
            },
            {
              label: "The river bend",
              desc: "The long way around, quiet and shaded, with nothing to see but herons.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "Herons stand in the shallows like gray umbrellas. The station bell fades behind you until it is only the memory of a sound."
            },
            {
              label: "Pumper escort",
              desc: "Hollis drives the pumper ahead and sprays the road, which turns the walkers aside but leaves the pavement slick and the air full of mist.",
              effects: { zombies: 0.7, fog: true, hp: -5 },
              result: "The spray hangs over the road like weather. Walkers turn their faces from the water and drift toward the curb, and the van fishtails once on the wet."
            }
          ]
        }
      },
      {
        id: "g6-radio-tower",
        place: "Radio Tower",
        host: "Max",
        intro: "Max hands you Jo's radio log, open to a page where the handwriting is pressed hard enough to dent the paper. \"Jo won't talk about that night. She just says read the log. So read the log.\"",
        kind: "log",
        title: "Convoy Radio Log, Night 58",
        text: "RADIO LOG. Radio Tower relay. Operator: Jo. Rule of the log: write what happened, when it happened, and nothing you wished had happened.\n\n20:10. All stations check. Library Fort, Water Tower, Boat Dock, Overpass Camp. Four for four. Weather clear. Signal strong off the tower.\n\n21:35. Overpass Camp missed the check. Tried twice. Nothing.\n\n21:50. Called the Fort. They can see the overpass from their lookout. The lamp on the north bus is lit. No movement they can make out. Told them to keep watching.\n\n22:30. Static on every channel. Not silence. Static, which means the tower is still sending and something else is wrong. Climbed to the second platform with a lantern. Wind strong enough to lean on. Found nothing wrong at the junction box.\n\n23:15. Rook started barking at the base of the tower and would not stop. Ruby went down with the flashlight. Two walkers at the fence, drawn by the lantern. She did not use the horn. She waited them past.\n\n00:40. Overpass Camp back on the air. Their generator had flooded. Mia had climbed to the lookout and signaled the Fort with a flashlight, three long and three short, for an hour. The Fort never saw it. The Fort was watching the lamp, not the roof. I have written the signal codes down twice tonight, once for them and once for me.\n\n01:05. Static cleared. It was the wind in the guy wires, humming at the same pitch as the carrier. Nothing broken. Nothing to fix. Just a tower singing to itself.\n\n01:10. All stations check. Four for four. Going to sleep, which is a lie, but it goes in the log anyway.",
        questions: [
          {
            type: "detail",
            q: "What turned out to be causing the static on every channel?",
            options: ["A flooded generator", "Walkers at the fence", "Wind in the guy wires", "A broken junction box"],
            answer: 2,
            hint: "The 01:05 entry explains what Jo finally found."
          },
          {
            type: "inference",
            q: "Why did the Fort miss Mia's flashlight signal?",
            options: ["The lookout was asleep", "They were watching the lamp", "The flashlight was too dim", "Fog covered the overpass"],
            answer: 1,
            hint: "Compare what Jo told the Fort to watch at 21:50 with where Mia was standing."
          },
          {
            type: "vocab",
            word: "pitch",
            q: "What does the word \"pitch\" mean in this passage?",
            options: ["How high a sound is", "A kind of black tar", "A throw of a ball", "A field for games"],
            answer: 0,
            hint: "The wires were humming at the same pitch as the radio carrier."
          }
        ],
        choice: {
          prompt: "Which road from the tower?",
          options: [
            {
              label: "The relay road",
              desc: "Short and well known, straight down toward the Overpass, but Ruby's two walkers at the fence have become a dozen.",
              effects: { zombies: 1.3, length: 0.9, scrap: 25 },
              result: "The fence leans under a dozen slow shapes. Ruby counts them aloud as you pass, flat and even, like reading a parts list."
            },
            {
              label: "The long loop",
              desc: "Jo's safe route, twice the distance, with a check-in call at every mile marker.",
              effects: { zombies: 0.8, length: 1.3, hp: 5 },
              result: "Jo's voice comes through at every marker, calm and dry. \"Mile three. Still four for four.\" The tower hums behind you in the wind."
            },
            {
              label: "Leave before first light",
              desc: "Go now, in the dark, while the walkers are still at the fence and the road beyond is empty.",
              effects: { night: true, zombies: 0.7, crates: 2 },
              result: "The headlights find two crates by the mile marker, left by a crew that came through before the Fall and never came back for them."
            }
          ]
        }
      },
      {
        id: "g6-quarry-gate",
        place: "Quarry Gate",
        host: "Ruby",
        intro: "Ruby leans on the quarry gate and nods at the steel panel bolted beside it, lettered in white paint. \"Whoever ran this place took the time to write it out proper. Read it. I want to know what the horn is for before I touch anything.\"",
        kind: "warning",
        title: "Bolted to the Quarry Gate",
        text: "QUARRY GATE. READ BEFORE YOU ENTER. The gate is not locked. That is deliberate. The danger here is not getting in. It is leaving the way you came.\n\nThe pit. The quarry floor is sixty feet down. Four bruisers fell in during the first month, drawn by the rock crusher before the diesel ran out. They cannot climb the walls and they do not try. They walk the floor in slow circles, and when the wind is right you can hear them from the gate. Do not go down. Nothing down there is worth it.\n\nThe haul road. It winds from the gate to the pit floor in three long switchbacks. It is the only way down and the only way the bruisers could ever come up. We blocked it at the second turn with two dump trucks parked nose to nose. Leave the trucks alone. They are the wall.\n\nThe horn. A compressed-air horn is mounted on the crusher shed. It still works. Do not sound it unless you mean to. It carries for miles, and every walker that hears it comes to the gate. We used it once, in the fall, to pull a crowd away from the Overpass Camp while they moved their sick. It worked. It took nine days for the road to clear.\n\nWater. The pump by the shed draws from the deep pool and runs clean. That is why this place is worth holding.\n\nSupplies. Scrap steel in the lower yard. Cable on the spools. Diesel is gone. Do not ask.\n\nThe quarry is a good place because it is a hard place. Keep it that way.",
        questions: [
          {
            type: "detail",
            q: "What blocks the haul road at the second turn?",
            options: ["A locked steel gate", "Two dump trucks", "A rock slide", "A chain fence"],
            answer: 1,
            hint: "Find the paragraph about the haul road."
          },
          {
            type: "inference",
            q: "Why did the quarry crew sound the horn in the fall?",
            options: ["To call the bruisers up", "To test the horn", "To pull walkers off a camp", "To signal the convoy"],
            answer: 2,
            hint: "The paragraph about the horn says what the crew used it for, and what it cost them."
          },
          {
            type: "vocab",
            word: "deliberate",
            q: "What does the word \"deliberate\" mean in this passage?",
            options: ["Done on purpose", "Done by mistake", "Done in a hurry", "Done after dark"],
            answer: 0,
            hint: "The gate is not locked, and the writers explain right away that this is no accident."
          }
        ],
        choice: {
          prompt: "Which way from the quarry?",
          options: [
            {
              label: "The upper yard",
              desc: "Short, out past the lower yard where the scrap steel is yours for the loading, but the rutted track rattles the frame.",
              effects: { zombies: 1.2, scrap: 35, hp: -6, length: 0.9 },
              result: "Ruby loads steel until the springs complain. From the top of the track, the pit is a gray bowl with four slow shapes circling its floor."
            },
            {
              label: "The gravel road",
              desc: "Long and plain, with the old quarry trucks' ruts to follow the whole way.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "The ruts guide the van like rails. Rook watches the quarry fall away behind you and only lies down when it is gone."
            },
            {
              label: "Sound the horn",
              desc: "Ruby sounds the horn as you leave, which empties the road ahead of walkers, but it draws the bruisers in from the valley behind you.",
              effects: { zombies: 0.6, brutes: 1.6 },
              result: "The horn rolls out over the hills and keeps rolling. The road ahead clears. Something heavy in the trees behind you begins to move."
            }
          ]
        }
      },
      {
        id: "g6-greenhouse",
        place: "Greenhouse",
        host: "Priya",
        intro: "Priya, who runs the Greenhouse, hands you a card gone soft from steam, written in pencil and corrected in pen. \"We feed forty people from these beds. This is how. Read it to me, and read the note at the bottom twice.\"",
        kind: "recipe",
        title: "Greenhouse Soup for Forty",
        text: "GREENHOUSE SOUP FOR FORTY. Written by Priya, corrected by everyone who has ever burned it.\n\nYou will need: twelve pounds of potatoes, skins on. Six onions. Every carrot that is ready, and the tops. Four handfuls of dried beans, soaked since morning. Salt from the barrel. The big pot. Three hours.\n\nStep 1. Soak the beans at dawn. Beans that are not soaked do not soften, and a bean that does not soften is a stone. We learned this on Day 20, and we are still finding them.\n\nStep 2. Cut the potatoes small and leave the skins on. The skin is where the food is, and we do not have food to throw away. Peelings go to the compost, which goes to the beds, which goes to next month's soup. Nothing leaves the circle.\n\nStep 3. Fry the onions in the pot until they turn gold and the whole greenhouse smells like a kitchen again. This step is not optional. People stand in line for the smell.\n\nStep 4. Add the water, the beans, the potatoes, and the carrots, in that order. Keep the heat low. A hard boil wastes fuel and makes the potatoes fall apart.\n\nStep 5. Salt at the end, not the beginning. Taste it. Then taste it again.\n\nStep 6. Serve the Overpass crew first, since they walked. Serve the twins last, since they will take seconds anyway.\n\nNote at the bottom: Forty people is the whole camp. If the count at the gate is forty-one, add a potato. If it is thirty-nine, find out why before you serve.",
        questions: [
          {
            type: "detail",
            q: "When should the salt be added?",
            options: ["At the beginning", "With the onions", "At the end", "Before the beans"],
            answer: 2,
            hint: "Step five is about salt."
          },
          {
            type: "inference",
            q: "Why does the note say to \"find out why\" if the count is thirty-nine?",
            options: ["Someone may be missing", "There is too much soup", "The gate may be broken", "The twins took seconds"],
            answer: 0,
            hint: "Forty is the whole camp, so think about what a lower number at the gate would mean."
          },
          {
            type: "vocab",
            word: "optional",
            q: "What does the word \"optional\" mean in this passage?",
            options: ["Strictly required", "Something you may skip", "Extremely difficult", "Always done last"],
            answer: 1,
            hint: "Step three says this step is not optional, and then explains why people care about it."
          }
        ],
        choice: {
          prompt: "Which road from the greenhouse?",
          options: [
            {
              label: "The orchard lane",
              desc: "Shaded and slow, winding past every tree in the county before it reaches the main road.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "Branches scrape the roof. The orchard is empty, and the only sound for miles is apples dropping on the hood, one at a time."
            },
            {
              label: "The field road",
              desc: "A straight run through the dead corn, where walkers wander between the rows, though the harvester at the far end is full of parts.",
              effects: { zombies: 1.3, length: 0.9, scrap: 25 },
              result: "Shapes drift between the rows, half hidden by the brown stalks. The harvester sits at the far end like a beached ship, and Ruby strips it in ten minutes."
            },
            {
              label: "Haul soup to the Overpass",
              desc: "Priya loads the van with the night's soup for the Overpass crew, which pays in parts, but you leave in the dark so it arrives hot.",
              effects: { night: true, scrap: 20, hp: 5 },
              result: "The van smells like onions all the way. At the Overpass, forty people line up in the dark without a word, and the bus door opens on the count of forty."
            }
          ]
        }
      },
      {
        id: "g6-stadium-gate",
        place: "Stadium Gate",
        host: "Mia",
        intro: "Mia points to the sheet of plywood wired across the stadium turnstiles, lettered in careful block capitals. \"Whoever did this used a ruler. Read it to me. I want to copy the bell signals into the map, and I don't trust my memory.\"",
        kind: "sign",
        title: "Wired to the Stadium Turnstiles",
        text: "STADIUM GATE. CAMP INSIDE. READ THIS WHOLE SIGN BEFORE YOU TOUCH THE TURNSTILE.\n\nWho we are. Fifty-two people, most of them from the north side, living on the concourse under the upper deck. The field is our garden. The locker rooms are our storerooms. The press box is our lookout, and it is never empty.\n\nHow to come in. Stand where the camera can see you, by the ticket window. Hold up your empty hands. Wait. Someone in the press box will ring the bell. One ring means we see you. Two rings means come to the turnstile. Three rings means go away now, and do not argue, because three rings means we see something behind you that you do not.\n\nWhat the horn means. The stadium horn still works on the battery bank. We sound it only to move walkers, and only when the press box agrees. If you hear the horn, get off the road and get high. Everything that can walk will be coming toward the sound.\n\nWhat we trade. Vegetables, batteries charged off the scoreboard panels, and a place to sleep that walkers cannot reach. We need medicine, salt, and anyone who can read a wiring diagram.\n\nWhat we do not do. We do not open the gate after dark. We do not open the gate for anyone who will not show their hands. We do not open the gate for anyone the dog does not like. This is not personal. The dog has been right every time.\n\nWait for the bell. We are watching, and we are glad you are here.",
        questions: [
          {
            type: "detail",
            q: "What does one ring of the bell mean?",
            options: ["We see you", "Come to the turnstile", "Go away now", "The gate is open"],
            answer: 0,
            hint: "The section called \"How to come in\" lists what each number of rings means."
          },
          {
            type: "inference",
            q: "Why does the sign say not to argue with three rings?",
            options: ["The lookout is busy", "The bell ringer is tired", "Something is behind you", "The gate is locked anyway"],
            answer: 2,
            hint: "The sign explains that the press box can see something the visitor cannot."
          },
          {
            type: "vocab",
            word: "concourse",
            q: "What does the word \"concourse\" mean in this passage?",
            options: ["The playing field", "A wide inside walkway", "A storage locker", "The upper seats"],
            answer: 1,
            hint: "Fifty-two people live on it, under the upper deck, and the field and locker rooms are listed separately."
          }
        ],
        choice: {
          prompt: "Which way from the stadium?",
          options: [
            {
              label: "The parking lots",
              desc: "Short and wide open, across acres of stalled cars where walkers drift between the rows, but every car is salvage.",
              effects: { zombies: 1.3, length: 0.8, scrap: 30 },
              result: "Thousands of cars, parked in rows for a game that ended months ago. Shapes move between them, slow and aimless, and the van threads the gaps."
            },
            {
              label: "The rail line",
              desc: "Long and narrow along the tracks, fenced on both sides, and nothing has been seen on it in weeks.",
              effects: { zombies: 0.7, length: 1.3 },
              result: "Chain link runs on both sides like the walls of a hallway. Mia draws the fence onto the map in two long, steady lines."
            },
            {
              label: "The scoreboard run",
              desc: "Mia trades for charged batteries, which Ruby wires into the van, but the loading takes until well after dark.",
              effects: { hp: 15, night: true },
              result: "Ruby closes the hood and nods once, which is a speech from her. The press box bell rings twice as you go, and then a third time, softer, for luck."
            }
          ]
        }
      },
      {
        id: "g6-hospital-annex",
        place: "Hospital Annex",
        host: "Doc Lin",
        intro: "Doc Lin takes a folded letter from the pocket of her coat, where it has clearly lived for weeks. \"The nurse who stayed at the annex wrote this to the convoy. I meant to read it to you myself, but my eyes are tired and my voice does the wrong thing. You read it.\"",
        kind: "letter",
        title: "From the Hospital Annex",
        text: "To the Bookmobile crew, and to Lin especially,\n\nYou asked why I stayed when the main building emptied. I have given short answers for three months. You deserve the long one.\n\nOn Day 2 the hospital moved everyone it could onto buses and sent them north. The annex was the last stop before the loading dock. When the last bus pulled out, there were still six patients inside who could not be moved. Someone had to stay with them. I was the one standing closest to the door. That is the whole heroic story.\n\nThe annex is a good building. Two floors, one stairwell, and steel doors that lock from inside. There is also a pharmacy the first-week crowds never found, because it is behind a door marked LINEN. I have kept a lamp in the east window every night. The walkers gather below it, but they gather below any light. At least this way I know where they are.\n\nThree of the six walked out on their own feet by the end of the first month. Two more went north with your convoy on your last run. The sixth is Mrs. Abara, who is eighty-one and has decided she is staying as long as I am. We have reached an understanding. I read to her. She tells me I read too fast.\n\nI am writing because the pharmacy is deeper than I thought, and it should not sit here guarded by one nurse and one stubborn woman. Send Lin with a list. Send the twins with a map. And send a book with large print, because Mrs. Abara has opinions about the ones I have.\n\nNurse Calloway",
        questions: [
          {
            type: "detail",
            q: "Where is the annex pharmacy hidden?",
            options: ["Behind a door marked LINEN", "In the east stairwell", "On the loading dock", "Under the second floor"],
            answer: 0,
            hint: "The paragraph about the building explains why the crowds never found it."
          },
          {
            type: "inference",
            q: "Why does the nurse call it \"the whole heroic story\"?",
            options: ["She was ordered to stay", "She thinks it was mostly chance", "She wants to be praised", "She regrets the choice"],
            answer: 1,
            hint: "Look at the sentence just before it, about where she happened to be standing."
          },
          {
            type: "vocab",
            word: "understanding",
            q: "What does the word \"understanding\" mean in this passage?",
            options: ["A kind of medicine", "A serious argument", "A list of supplies", "An agreement between them"],
            answer: 3,
            hint: "Read what the nurse and Mrs. Abara each do for the other right after that line."
          }
        ],
        choice: {
          prompt: "Which way from the annex?",
          options: [
            {
              label: "The ambulance ramp",
              desc: "Short, down the ramp and out through the walkers below the east window, where the loading dock still holds unclaimed supplies.",
              effects: { zombies: 1.4, length: 0.8, crates: 3 },
              result: "The lamp in the east window lights a slow crowd that turns, all together, toward the engine. Three crates sit on the dock where the last bus left them."
            },
            {
              label: "The service alley",
              desc: "Long and narrow behind the hospital, quiet the whole way, but fog pools between the buildings.",
              effects: { zombies: 0.8, length: 1.2, fog: true },
              result: "The alley is a gray corridor with no ends. Rook stands at the window with his ears up and does not sit down until the buildings open out."
            },
            {
              label: "Load the pharmacy",
              desc: "Doc Lin spends the afternoon filling crates, which stocks the van's kit and pays in trade, but the road will be dark by the time she is done.",
              effects: { night: true, hp: 15, scrap: 20 },
              result: "Doc Lin comes out at dusk with four crates and a large-print novel under her arm. \"For Mrs. Abara,\" she says. \"She has opinions.\""
            }
          ]
        }
      }
    ],
    roadSigns: [
      {
        text: "Spray paint on an overpass pillar: \"DO NOT STOP IN THE SHADE. THEY STAND WHERE IT IS COOL.\"",
        q: "Where does the warning say the walkers gather?",
        options: ["In open sunlight", "In the shade", "On top of the overpass"],
        answer: 1
      },
      {
        text: "Radio, Jo: \"Stadium horn sounded at four. If you are inside two miles of it, get off the road and get high until dark.\"",
        q: "What should drivers near the stadium do?",
        options: ["Leave the road and climb", "Drive toward the horn", "Wait inside the van"],
        answer: 0
      },
      {
        text: "Hand-lettered sign on a fence: \"WELL IS GOOD. PUMP IS LOUD. ONE PERSON PUMPS, ONE PERSON WATCHES THE ROAD.\"",
        q: "What should the second person do?",
        options: ["Pump faster", "Watch the road", "Fill the jugs"],
        answer: 1
      },
      {
        text: "Note under the wiper of a stalled ambulance: \"Battery pulled Day 30 for the annex. Oxygen tanks still in the back. Lin knows. Leave the doors shut.\"",
        q: "What was taken from the ambulance?",
        options: ["The oxygen tanks", "The wipers", "The battery"],
        answer: 2
      },
      {
        text: "Painted on the quarry water tank: \"DIESEL GONE. WATER GOOD. HORN ONLY IF YOU MEAN IT.\"",
        q: "What does the sign say about the diesel?",
        options: ["There is none left", "It is for trade", "It is in the shed"],
        answer: 0
      },
      {
        text: "Radio, Jo: \"Library Fort lamp went dark at nine and relit at nine-twenty. Odette says a bulb, not trouble. Keep your check-ins coming.\"",
        q: "What does Odette say caused the dark window?",
        options: ["Walkers at the wall", "A burned-out bulb", "A radio failure"],
        answer: 1
      },
      {
        text: "Chalk on the ranger station door: \"CREEK BEND: 26 AT NOON. HIGH TRAIL CLEAR. CAMP ABOVE THE WATER.\"",
        q: "Where should you camp, according to the chalk?",
        options: ["On the high trail", "Beside the creek", "At the station door"],
        answer: 0
      },
      {
        text: "A sheet of plywood at a crossroads: \"GREENHOUSE 3 MI. BRING SEEDS, LEAVE WITH SOUP. GATE COUNT MATTERS, SO CHECK IN AND CHECK OUT.\"",
        q: "What should visitors do at the Greenhouse gate?",
        options: ["Bring soup", "Pay in batteries", "Check in and out"],
        answer: 2
      }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
