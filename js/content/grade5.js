/* Zombie Survival Reading: grade 5 content.
   Calibration (docs/CONTENT_GUIDE.md): 180 to 230 words per passage, sentences of 22
   words or fewer, four options per question. Cause and effect, figurative language,
   character motivation. Grounded survival tone for a teen audience: tense, quiet,
   hopeful in small ways. No gore, no on-page deaths, no profanity. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[5] = {
    grade: 5,
    havens: [
      {
        id: "g5-old-lighthouse",
        place: "Old Lighthouse",
        host: "Keeper Vance",
        intro: "Keeper Vance meets you at the foot of the tower stairs with a lantern in one hand. \"The log is on the table. I never finished the second entry. You'll see why. Read it, and then tell me if the beam still looks steady from the road.\"",
        kind: "log",
        title: "Keeper's Log, Old Lighthouse",
        text: "Keeper's Log. Old Lighthouse, north point. Keeper on duty: M. Vance.\n\nOct 2, 6:40 p.m. Fog on the water by five. Lit the lamp early. The beam swept the bay like a slow hand wiping a window. Counted four walkers on the beach below, all facing the light. They do not climb. They stand and wait, which is worse in its own way.\n\nOct 2, 9:15 p.m. Generator coughing. Fuel is low, two days at most. Heard an engine out on the water, then nothing. Went down to the rocks with the lantern to check the\n\nOct 5, 7:00 a.m. Three days gone. The engine I heard was the Boat Dock crew, drifting in blind with a dead motor. They had no light but mine. I stood on the rocks and swung the lantern until they found the channel. Then we spent two nights hauling their spare fuel up 112 steps, one can at a time. The lamp never went dark. That is the whole job, and it is enough.\n\nOct 5, 8:30 a.m. Fuel: eleven days. Walkers on the beach: six. They have not moved. Note for the Bookmobile: bring a spare belt for the generator, and bring the dock crew something to read. They earned it.",
        questions: [
          {
            type: "detail",
            q: "How many walkers did the keeper count on the beach on Oct 2?",
            options: ["Two", "Four", "Six", "Eleven"],
            answer: 1,
            hint: "Look at the first entry, where the keeper counts what is standing on the beach."
          },
          {
            type: "inference",
            q: "Why does the second entry stop in the middle of a sentence?",
            options: ["The pen ran dry", "The generator finally quit", "The keeper went to help", "Walkers got through the door"],
            answer: 2,
            hint: "The Oct 5 entry explains what the keeper was doing for three days."
          },
          {
            type: "vocab",
            word: "swept",
            q: "What does the word \"swept\" mean in this passage?",
            options: ["Cleaned with a broom", "Flashed and went dark", "Pointed straight up", "Moved slowly across"],
            answer: 3,
            hint: "The beam swept the bay the way a slow hand wipes a window."
          }
        ],
        choice: {
          prompt: "Which way off the point?",
          options: [
            {
              label: "The shore road",
              desc: "Flat and short, but the beach walkers are already facing the road, and the fog will follow you inland.",
              effects: { zombies: 1.3, length: 0.9, fog: true, scrap: 20 },
              result: "Sand hisses under the tires. Behind you the beam swings out over the water, steady as a clock."
            },
            {
              label: "The cliff switchbacks",
              desc: "Long, slow climbs with a clear view down, and nothing can reach the road from below.",
              effects: { zombies: 0.7, length: 1.2 },
              result: "The van strains up the grade. From the third turn you can see the six shapes on the beach, still facing a light they will never reach."
            },
            {
              label: "Wait for the fuel run",
              desc: "Vance patches the van's radiator while the dock crew refuels, but you leave after dark.",
              effects: { hp: 12, night: true },
              result: "The radiator holds. The headlights cut two pale tunnels into the dark, and the lighthouse beam sweeps over the van once, like a hand on your shoulder."
            }
          ]
        }
      },
      {
        id: "g5-train-yard",
        place: "Train Yard",
        host: "Ruby",
        intro: "Ruby wipes grease onto her jeans and nods at a chalkboard bolted inside the dispatcher's shack. \"Somebody kept that board every day until they didn't. Read it to me. I want to know which trains we're still waiting on.\"",
        kind: "list",
        title: "Arrivals Board, Train Yard",
        text: "ARRIVALS BOARD. Train Yard, north shed. Chalk only. Do not erase a line until the train is in.\n\n1. The 6:10 freight from the city. Due Day 1. Never arrived. Jo raised the engineer on the radio for two minutes on Day 3, then static. The line stays up.\n\n2. The grain train from the valley. Due Day 2. Arrived Day 9, pushed in by hand for the last half mile. Eleven cars of oats. We eat because of those eleven cars.\n\n3. The tanker from the refinery. Due Day 2. Never arrived. Max and Mia found it on Day 30, stopped on the trestle north of here. The trestle is out behind it. The fuel is still inside, and the walkers gather on the near bank at dusk, so nobody has tried.\n\n4. The 8:45 passenger train. Due Day 1. Arrived Day 1, empty, every door open, every seat clean. Nobody has explained it. Nobody has tried very hard.\n\n5. The hospital supply car. Due Day 4. Arrived Day 6, which counts as on time now. Doc Lin cried, then denied it.\n\nRule of the board: a line that stays up is not a lie. It is a promise that we are still listening.",
        questions: [
          {
            type: "detail",
            q: "Which train arrived on Day 9?",
            options: ["The 6:10 freight", "The grain train", "The tanker", "The 8:45 passenger train"],
            answer: 1,
            hint: "Scan the board for the line that mentions Day 9."
          },
          {
            type: "inference",
            q: "Why has nobody tried to get the fuel from the tanker?",
            options: ["The fuel leaked out", "The trestle is too far", "Walkers gather near it at dusk", "Jo said to leave it"],
            answer: 2,
            hint: "The tanker's line ends with the word \"so,\" which gives the reason."
          },
          {
            type: "vocab",
            word: "trestle",
            q: "What does the word \"trestle\" mean in this passage?",
            options: ["A rail bridge", "A train station", "A fuel tank", "A signal light"],
            answer: 0,
            hint: "The tanker is stopped on the trestle, and the trestle is out behind it, above a bank."
          }
        ],
        choice: {
          prompt: "Which way out of the yard?",
          options: [
            {
              label: "Follow the rails north",
              desc: "A short run along the gravel toward the trestle, where the walkers gather at dusk, but there is salvage all along the bank.",
              effects: { zombies: 1.4, length: 0.9, scrap: 30 },
              result: "The rails hum beside the van. Up ahead the tanker sits on the broken trestle, patient as a held breath."
            },
            {
              label: "The county road",
              desc: "Long, paved, and quiet, with nothing to see but fence posts and empty fields.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "Fence posts tick past like seconds. Rook sleeps with his chin on the dashboard, which means the road is clear."
            },
            {
              label: "The grain spur at night",
              desc: "Ruby fixes the brakes while you wait for dark, and the spur runs quiet behind the silos, but you drive it by headlights alone.",
              effects: { night: true, hp: 10, crates: 1 },
              result: "The silos stand over the spur like sleeping giants. A dropped supply crate glints in the headlights where the oat train stopped."
            }
          ]
        }
      },
      {
        id: "g5-boat-dock",
        place: "Boat Dock",
        host: "Jo",
        intro: "Jo hands you an envelope stiff with dried salt. \"From the harbor captain. She sent it up the coast with the last fuel run. I've read it twice. I want to hear it out loud.\"",
        kind: "letter",
        title: "To the Convoy, from the Harbor",
        text: "To the Bookmobile crew,\n\nYou asked why the boats stay tied up when the water looks calm. I owe you a straight answer, so here it is.\n\nOn Day 12 we sent the Marigold out to look for the ferry. She had a full tank, a good crew, and a radio. The fog came off the water at four o'clock, the way it does here, thick as wet wool. She never found the ferry. She found the shoals instead, and spent the night aground while the crew listened to walkers moaning somewhere on the beach. They could not see them. That was the worst part, they said. Not seeing.\n\nAt dawn the fog thinned and the tide lifted her off. She came home with every hand aboard. I tied her to the pier myself, and then I tied every other boat beside her.\n\nWe are not afraid of the water. We are afraid of the fog, and of what waits where we cannot see. So the boats stay tied until Jo's weather says clear for two days running.\n\nSend the twins down when you can. We need a chart of the shoals, and they draw better than anyone I have left.\n\nCaptain Reyes, Boat Dock",
        questions: [
          {
            type: "detail",
            q: "What did the Marigold find instead of the ferry?",
            options: ["The shoals", "A second boat", "The lighthouse", "The harbor"],
            answer: 0,
            hint: "Look at the paragraph about Day 12 and what the boat ran into."
          },
          {
            type: "inference",
            q: "Why does Captain Reyes keep the boats tied up?",
            options: ["The crews are too tired", "The engines need fuel", "The fog hides the danger", "The water is too rough"],
            answer: 2,
            hint: "The captain says what the crew is afraid of, and it is not the water."
          },
          {
            type: "vocab",
            word: "aground",
            q: "What does the word \"aground\" mean in this passage?",
            options: ["Floating out at sea", "Tied to the pier", "Sinking in a storm", "Stuck on the bottom"],
            answer: 3,
            hint: "The Marigold found the shoals, and at dawn the tide had to lift her off."
          }
        ],
        choice: {
          prompt: "Which road up from the harbor?",
          options: [
            {
              label: "The pier road at dusk",
              desc: "Short and flat, but the fog comes off the water at four, and the beach walkers come with it.",
              effects: { fog: true, zombies: 1.2, length: 0.8, scrap: 20 },
              result: "Fog swallows the end of the pier before you reach it. Somewhere to the left, something moans, low and patient."
            },
            {
              label: "The cannery hill",
              desc: "A steep, long climb past the old cannery, well above the fog line and nearly empty.",
              effects: { zombies: 0.7, length: 1.2 },
              result: "The road climbs out of the gray. From the top, the harbor is a white bowl with the masts of tied boats poking through."
            },
            {
              label: "Ride the fuel barge",
              desc: "Reyes floats the van across the inlet, which skips the walkers on the road, but the salt spray is hard on the van.",
              effects: { zombies: 0.6, hp: -8, length: 0.9 },
              result: "The barge creaks under the van's weight. Reyes does not take her eyes off the water once, and neither does Rook."
            }
          ]
        }
      },
      {
        id: "g5-mountain-lodge",
        place: "Mountain Lodge",
        host: "Doc Lin",
        intro: "Doc Lin pulls a notebook from a drawer in the lodge kitchen, its pages wavy from damp. \"Somebody rode out the big snow in here. Read me the last pages. I want to know how they kept their heads.\"",
        kind: "diary",
        title: "Lodge Diary, the Long Snow",
        text: "Day 3 of the snow. The drifts reached the second-floor windows this morning. The lodge groans in the wind like a ship that wants to be somewhere else. We have forty cans of soup, a full woodpile, and one deck of cards with the jack of hearts missing.\n\nDay 5. Two walkers stood in the yard all day with snow piling on their shoulders. They did not try the door. They do not seem to feel the cold, and that is the eeriest thing about them. Kai says they are waiting for spring, same as us.\n\nDay 7. The generator quit at dusk. We thought the cold had killed it. Kai dug into the intake with a spoon and found the vent packed with pine needles, blown in by the storm. Twenty minutes later the lights came back. We cheered like it was a holiday.\n\nDay 9. Rationing the soup now, one can between us each night. Kai dealt the cards and we played with a sock for the jack of hearts.\n\nDay 11. A voice on the radio at last, scratchy and far away. Jo, from the convoy. The pass opens in two days. I did not cry. Kai did, and I will never say so.\n\nDay 12. Packing. We were afraid the whole time. We just kept the fire going anyway.",
        questions: [
          {
            type: "detail",
            q: "What was really blocking the generator vent?",
            options: ["Ice from the storm", "Pine needles", "A pile of snow", "A broken belt"],
            answer: 1,
            hint: "The Day 7 entry tells what Kai found with the spoon."
          },
          {
            type: "inference",
            q: "What does the writer mean by \"we just kept the fire going anyway\"?",
            options: ["They were never afraid", "They had too much wood", "They kept going despite fear", "They burned the cards"],
            answer: 2,
            hint: "Read the two sentences before it, and think about what the fire stands for."
          },
          {
            type: "vocab",
            word: "rationing",
            q: "What does the word \"rationing\" mean in this passage?",
            options: ["Sharing out small amounts", "Throwing the rest away", "Heating until it boils", "Hiding it from Kai"],
            answer: 0,
            hint: "The Day 9 entry says how much soup they allowed themselves each night."
          }
        ],
        choice: {
          prompt: "Which way down the mountain?",
          options: [
            {
              label: "The plowed pass",
              desc: "Jo says the pass is open, and the switchbacks are long, clear, and quiet.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "Snowbanks stand on both sides like white hallways. The lodge shrinks in the mirror until it is a dark dot on a white page."
            },
            {
              label: "The ski lift road",
              desc: "Steep and short, past the lift where the big walkers stand in rows, but the lift shed is full of parts.",
              effects: { zombies: 1.3, brutes: 1.4, length: 0.8, scrap: 25 },
              result: "The chairs hang still above the slope. Below them, a row of heavy shapes turns toward the sound of the engine, slow as the lift itself."
            },
            {
              label: "Leave after dark",
              desc: "Doc Lin fits the chains and checks the heater while you wait, but by the time she is done the sun is gone.",
              effects: { night: true, hp: 12 },
              result: "The chains bite into the packed snow. In the headlights, the flakes come at the windshield like falling sparks."
            }
          ]
        }
      },
      {
        id: "g5-water-tower",
        place: "Water Tower",
        host: "Theo",
        intro: "Theo, who keeps the pump at the Water Tower, hands you a card wrapped in packing tape. \"Instructions. Every crew skips step two and then wonders why the pump screams. Read it to me, all of it, before anyone touches the handle.\"",
        kind: "manual",
        title: "Hand Pump: Start-Up Steps",
        text: "WATER TOWER HAND PUMP. Read every step before you touch the handle. Written by Theo, who has rebuilt this pump three times and would like to stop.\n\n1. Check the sight glass on the tank. If the water line is below the red mark, the tank is nearly dry. Pumping a dry tank burns out the seals.\n\n2. Open the brass valve marked PRIME. Wait until the hose stops gurgling. That sound is air leaving the line. Skip this step and the pump squeals, and the squeal carries half a mile on a still day. The walkers in the creek bed hear it and start walking. They are slow, but they do not stop.\n\n3. Work the handle at a steady pace, about one stroke per second. Faster does not fill the jugs faster. It only makes noise.\n\n4. Stop when the jug is full to the neck. Water on the ground turns to mud, and mud turns to tracks that anyone can follow.\n\n5. Close the valve. Hang the hose. Wipe the handle so it does not rust.\n\nIf you hear Rook growl while you are pumping, stop and listen. The dog knows before the rest of us do.\n\nMost crews read step one and start pumping. Be the crew that reads step two.",
        questions: [
          {
            type: "detail",
            q: "What does it mean if the water line is below the red mark?",
            options: ["The tank is full", "The valve is open", "The tank is nearly dry", "The pump is primed"],
            answer: 2,
            hint: "Step one explains what the sight glass is telling you."
          },
          {
            type: "inference",
            q: "Why does Theo warn so strongly about the squeal?",
            options: ["It burns out the seals", "It wakes the whole camp", "It cracks the hose", "It draws the walkers"],
            answer: 3,
            hint: "Step two says how far the squeal carries and who hears it."
          },
          {
            type: "vocab",
            word: "steady",
            q: "What does the word \"steady\" mean in this passage?",
            options: ["Fast and hard", "Even and regular", "Loud and sharp", "Short and sudden"],
            answer: 1,
            hint: "Step three gives the pace in strokes per second."
          }
        ],
        choice: {
          prompt: "Which way from the tower?",
          options: [
            {
              label: "The creek bed road",
              desc: "Short and low, straight past the walkers who heard the pump, but a stalled supply truck sits in the creek bed.",
              effects: { zombies: 1.4, length: 0.8, crates: 3 },
              result: "The truck lies on its side in the dry creek, crates spilled down the bank. Slow shapes are already turning toward the engine noise."
            },
            {
              label: "The ridge track",
              desc: "Long, dry, and empty, with the tower in sight the whole way.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "The tower stays in the mirror for an hour, a gray tank on stilts. Theo's light blinks once from the catwalk as you go."
            },
            {
              label: "Haul water for Theo",
              desc: "Theo loads the van with full jugs for the next camp, which pays well, but the weight is hard on the springs.",
              effects: { scrap: 30, hp: -8, length: 1.1 },
              result: "The van rides low and heavy. Every bump sloshes, and Rook gives the jugs a look of deep suspicion."
            }
          ]
        }
      },
      {
        id: "g5-gas-n-go",
        place: "Gas-N-Go",
        host: "Mia",
        intro: "Mia points her flashlight at the wall behind the register, where someone painted a warning in three colors. \"I copied it into the map, but Max says I got the order wrong. Read it to me straight off the wall.\"",
        kind: "warning",
        title: "Painted Behind the Register",
        text: "READ THIS BEFORE YOU PUMP.\n\nThe sprinters hunt this lot at dusk. Not the slow ones. The fast ones. They come out of the car wash when the light goes orange, and they are quiet until they are not.\n\nPump at noon. Noon only. The sun is high, the shadows are short, and the sprinters stay in the dark of the wash bay. We have watched them for six weeks from the roof. They have never come out before the light turns.\n\nDo not use the pump on the end. The hose is cut. The pump by the door works if you crank it slow. The one in the middle works but sticks, so bring a second person to hold the lever.\n\nIf you hear the bay door rattle, you have about a minute. Do not run for the road. Climb the ladder on the ice machine and pull it up after you. They cannot climb. We learned that the hard way, but we learned it.\n\nLeave this wall alone. Add to it if you know something true. Paint over it and you are putting the next crew in danger.\n\nSigned by six of us. Two are still here. The rest went north with the fuel. The lot is yours at noon.",
        questions: [
          {
            type: "detail",
            q: "When is it safe to pump fuel at this lot?",
            options: ["At dawn", "At noon", "At dusk", "At night"],
            answer: 1,
            hint: "One short line near the top of the wall gives the only safe time."
          },
          {
            type: "inference",
            q: "Why do the writers say to climb the ice machine instead of running?",
            options: ["Sprinters cannot climb", "The road is blocked", "The van is too slow", "The gate is locked"],
            answer: 0,
            hint: "Read the paragraph about the bay door, and what the writers learned the hard way."
          },
          {
            type: "vocab",
            word: "sticks",
            q: "What does the word \"sticks\" mean in this passage?",
            options: ["Leaks on the ground", "Spins too fast", "Makes a loud noise", "Jams and stops moving"],
            answer: 3,
            hint: "The middle pump sticks, so a second person has to hold the lever."
          }
        ],
        choice: {
          prompt: "Which road leaves the lot?",
          options: [
            {
              label: "The noon highway",
              desc: "Straight and fast, but sprinters hunt the on-ramp where the cars stalled, and there is salvage in every one.",
              effects: { zombies: 1.2, runners: 1.6, scrap: 30, length: 0.9 },
              result: "Stalled cars line the ramp with their doors open. Something fast moves between them, keeping pace with the van for a long moment, then dropping back."
            },
            {
              label: "The farm road",
              desc: "Slow and bumpy, with a long detour around the fields, where nothing fast has ever been seen.",
              effects: { zombies: 0.8, runners: 0.6, length: 1.2 },
              result: "Dead corn rustles on both sides. Mia rides with her map on her knees, marking every turn in pencil."
            },
            {
              label: "The underpass",
              desc: "Short and quick, under the highway where the lights are out, so you drive by headlights alone.",
              effects: { night: true, length: 0.8, crates: 2 },
              result: "The dark under the highway is total. Two crates sit on the shoulder in the headlights, exactly where the painted map said they would."
            }
          ]
        }
      },
      {
        id: "g5-overpass-camp",
        place: "Overpass Camp",
        host: "Max",
        intro: "Max spreads a hand-drawn map across the hood of the van and holds the corners down with wrenches. \"Mia drew it, I wrote the legend. Read the legend first, or you'll end up on the wrong side of the fence.\"",
        kind: "map",
        title: "Overpass Camp: Map Legend",
        text: "OVERPASS CAMP. Map by Mia, legend by Max. North is toward the stalled fuel truck.\n\nSolid line: the overpass. Our camp is on top, two lanes wide, with a school bus parked across each end. The buses are the gates.\n\nDashed line: the chain fence along the on-ramps. It is strong, but it is only chain. Walkers lean on it at night, and you can hear it creak from the tents. Do not sleep near the dashed line.\n\nTriangle: the lookout, on the roof of the north bus. From there you can see the river, the Water Tower, and the highway for two miles both ways. Mia counts the walkers at dawn and writes the number on the bus door.\n\nCircle: the water barrels, under the tarp, filled from the rain gutters on the big sign.\n\nX: the dry culvert under the far end. It runs under the highway and comes out by the creek. We use it when the buses cannot open. Walkers do not go into it, because it is dark and narrow, and they only follow what they can see.\n\nStar: the Bookmobile spot, behind the south bus, out of sight from the road.\n\nRead this, and you can find water, a way out, and a place to sleep where the fence does not creak. That is the whole point of a map.",
        questions: [
          {
            type: "detail",
            q: "Where does Mia write the walker count each morning?",
            options: ["On the water barrels", "On the fence post", "On the map legend", "On the bus door"],
            answer: 3,
            hint: "Find the Triangle entry about the lookout."
          },
          {
            type: "inference",
            q: "Why do walkers stay out of the culvert?",
            options: ["It is full of water", "The buses block it", "They only follow what they see", "Rook guards the entrance"],
            answer: 2,
            hint: "The X entry explains what the culvert is like and what walkers follow."
          },
          {
            type: "vocab",
            word: "culvert",
            q: "What does the word \"culvert\" mean in this passage?",
            options: ["A tunnel under a road", "A tall lookout tower", "A chain fence", "A parked school bus"],
            answer: 0,
            hint: "The X entry says where the culvert runs and where it comes out."
          }
        ],
        choice: {
          prompt: "Which way off the overpass?",
          options: [
            {
              label: "The north ramp",
              desc: "Short, down past the leaning fence and the stalled fuel truck, where the walkers are thickest and the truck is full of parts.",
              effects: { zombies: 1.4, length: 0.9, scrap: 30 },
              result: "The fence creaks as you pass. Shapes lean on it, slow and silent, turning their heads to follow the sound of the engine."
            },
            {
              label: "The culvert route",
              desc: "Long and slow, crawling through the culvert and along the creek bed, but nothing follows you in there.",
              effects: { zombies: 0.7, length: 1.3 },
              result: "The culvert swallows the van like a throat. When you come out by the creek, the camp is a dark line against the sky behind you."
            },
            {
              label: "The river road",
              desc: "Flat and quiet, with two crates cached by the bridge, but fog comes up off the river as the light fails.",
              effects: { fog: true, zombies: 0.9, crates: 2 },
              result: "The river breathes fog across the road. Max taps the map and says the crates are twenty yards past the bridge, and he is right."
            }
          ]
        }
      },
      {
        id: "g5-mile-9-diner",
        place: "Mile 9 Diner",
        host: "Sal",
        intro: "Sal, who runs the grill at the diner, taps a sheet pinned to the corkboard by the door. \"The board is for messages. That one has been up the longest. Read it, and read what's written across it, too.\"",
        kind: "poster",
        title: "Pinned to the Diner Board",
        text: "MISSING. Have you seen Elena Cruz?\n\nAge 16. Brown hair, usually in a braid. Green rain jacket with a torn left pocket. Last seen Day 19 on the river road, walking north toward the Water Tower. She carried a red backpack and a map she drew herself.\n\nShe knows how to read a compass. She knows not to travel at dusk. She knows to leave a stacked-stone marker at every turn, three stones high, with the top stone pointing the way she went.\n\nIf you see a stack of three stones on the river road, please follow it and write down where it points. Leave word at the Mile 9 Diner. Ask for her father, Tomas. I am here every day.\n\nShe is not lost. She is just not found yet.\n\n(Written across the poster in red marker, in a different hand:)\n\nDAY 41. FOUND. She reached the Water Tower on Day 24 and stayed to help Theo with the pump. Jo got the word on the radio this morning. Her stone markers were there the whole way, three high, every turn. Tomas rode out with the convoy at noon.\n\nLeave this up. Somebody else needs to know it can go this way.",
        questions: [
          {
            type: "detail",
            q: "What marker did Elena leave at every turn?",
            options: ["A red ribbon", "Three stacked stones", "A chalk arrow", "A torn map page"],
            answer: 1,
            hint: "The third paragraph lists the things Elena knows how to do."
          },
          {
            type: "inference",
            q: "Why does the red marker ask people to leave the poster up?",
            options: ["So Tomas can find it again", "Because the board is empty", "To give other people hope", "Because Elena is still missing"],
            answer: 2,
            hint: "Read the last line, and think about who \"somebody else\" might be."
          },
          {
            type: "vocab",
            word: "hand",
            q: "What does the word \"hand\" mean in the line \"in a different hand\"?",
            options: ["A person's handwriting", "A part of the body", "A deck of cards", "A kind of help"],
            answer: 0,
            hint: "The red marker note was written by a different person than the poster."
          }
        ],
        choice: {
          prompt: "Which road from the diner?",
          options: [
            {
              label: "The river road north",
              desc: "The way Elena went, short and marked with stones, but the walkers follow the water at this time of year.",
              effects: { zombies: 1.3, length: 0.9, scrap: 25 },
              result: "Three stones stand at the first turn, the top one pointing north. Slow shapes stand in the shallows below, facing the current."
            },
            {
              label: "The county highway",
              desc: "Long and open, with stalled cars pushed to the shoulder for miles.",
              effects: { zombies: 0.8, length: 1.2, crates: 1 },
              result: "Someone cleared this road a long time ago and left a crate on the shoulder for whoever came next. You take it, and you leave a note."
            },
            {
              label: "Ride with Tomas",
              desc: "Tomas rides along to the tower and pays in diner stock, but he wants to leave at once, and the light is already going.",
              effects: { night: true, scrap: 20 },
              result: "Tomas sits in the passenger seat with his hands folded and does not say a word for ten miles. Then he says, \"Three high. Every turn,\" and nothing else."
            }
          ]
        }
      }
    ],
    roadSigns: [
      {
        text: "Spray paint on an overpass pillar: \"SPRINTERS IN THE CAR WASH. PUMP AT NOON ONLY.\"",
        q: "When should you stop for fuel?",
        options: ["At noon", "At dusk", "After dark"],
        answer: 0
      },
      {
        text: "Radio, Jo: \"Fog on the coast road until two. If you can't see the next pole, pull over and wait it out.\"",
        q: "What does Jo want drivers to do if they cannot see the next pole?",
        options: ["Turn on the high beams", "Pull over and wait", "Turn back to the harbor"],
        answer: 1
      },
      {
        text: "A sign wired to a farm fence: \"Three stones stacked at a turn means someone went that way. Do not knock them down.\"",
        q: "What do three stacked stones mean?",
        options: ["The road is closed", "There is water near", "Someone went that way"],
        answer: 2
      },
      {
        text: "Note taped to a stalled sedan: \"Tank is empty, battery is good. Take what you need and shut the doors. Walkers follow open doors.\"",
        q: "What should you do after taking parts from the car?",
        options: ["Leave a note", "Close the doors", "Drain the tank"],
        answer: 1
      },
      {
        text: "Painted on a water tank: \"MILE 9 DINER, 4 MILES. HOT FOOD UNTIL DARK. NO ONE SERVED AFTER.\"",
        q: "When does the diner stop serving?",
        options: ["At dark", "At noon", "At dawn"],
        answer: 0
      },
      {
        text: "Radio, Jo: \"Train Yard reports the trestle is out north of the tanker. Nobody crosses it, not even on foot.\"",
        q: "What is wrong north of the tanker?",
        options: ["The yard is closed", "The road is flooded", "The trestle is out"],
        answer: 2
      },
      {
        text: "Chalk on a bus door: \"Walker count at dawn: 14. Yesterday: 9. Keep the north gate shut.\"",
        q: "What has the walker count done since yesterday?",
        options: ["Gone up", "Gone down", "Stayed the same"],
        answer: 0
      },
      {
        text: "Hand-lettered board at a fork: \"LEFT: Lighthouse, 6 miles, fog after four. RIGHT: Lodge road, closed by snow.\"",
        q: "Which way reaches the lighthouse?",
        options: ["Right", "Straight on", "Left"],
        answer: 2
      }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
