/* Grade 4 reading content for Zombie Survival Reading.
   Schema and calibration: docs/CONTENT_GUIDE.md. Validate with `npm test`. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[4] = {
    grade: 4,
    havens: [
      {
        id: "g4-library-fort",
        place: "Library Fort",
        host: "Jo",
        intro: "Jo sets a page on the desk, pressed flat under a dictionary. \"Found in the book return slot when we took this place. Whoever wrote it held the library before us. Read it. I want to know why the shelves are where they are.\"",
        kind: "diary",
        title: "Page from the Return Slot",
        text: "Day 19 in the library.\nI moved the last of the shelves today. The big oak ones are against the east windows now, with the heavy books on the bottom. Nobody will read the tax codes again, but they stop a window from giving. I learned that on day six, when something leaned on the glass for an hour. The glass held.\n\nWater is in the janitor's closet, in the mop buckets. I boiled all of it. The stove in the break room runs on a gas tank, and the tank is half full. That is a month if I am careful. I am careful now. I was not, before.\n\nIf you find this, the fort is yours. The shelves are a wall, not a mess. Do not move them to make the room look nice. The children's section is the safest corner: no windows, two doors, and chairs small enough to stack. I am going to the fire station to find the rest of my crew. If you meet a woman named Priya, tell her the library held.",
        questions: [
          {
            type: "detail",
            q: "Where is the water kept?",
            options: ["In the break room stove", "In the return slot", "In the mop buckets", "In the children's section"],
            answer: 2,
            hint: "Look at the start of the second paragraph."
          },
          {
            type: "inference",
            q: "Why does the writer say not to move the shelves?",
            options: ["The books are in order", "They keep the windows from breaking in", "They are too heavy to lift", "Priya wants them there"],
            answer: 1,
            hint: "Think about what happened on day six."
          },
          {
            type: "vocab",
            word: "held",
            q: "What does \"held\" mean in \"the glass held\" and \"the library held\"?",
            options: ["Fell down", "Was carried", "Opened wide", "Stayed strong"],
            answer: 3,
            hint: "Something leaned on the glass for an hour, so look at what the glass did."
          }
        ],
        choice: {
          prompt: "Jo marks the fire station on the map. \"North. Two roads, and I've only driven one of them.\"",
          options: [
            {
              label: "Main Street",
              desc: "The road Jo knows: slow, with lookouts on the rooftops, and nothing comes at you that you cannot see first.",
              effects: { zombies: 0.75, length: 1.2 },
              result: "Lookouts wave from the roofs. Main Street takes a while, and nothing surprises you."
            },
            {
              label: "The rail bridge",
              desc: "A shortcut over the river on the old rail bridge, where stalled freight cars hold scrap and whatever stayed with them.",
              effects: { zombies: 1.3, brutes: 1.4, scrap: 30, length: 0.85 },
              result: "The bridge groans under the van. Bruisers turn in the open boxcar doors, and you pull scrap from the first car you pass."
            },
            {
              label: "The campus road",
              desc: "Through the old college, short and quiet, but the fog off the river sits on it all morning.",
              effects: { fog: true, zombies: 0.9, crates: 2 },
              result: "Fog hangs between the campus buildings. You find two crates by the flagpole and do not linger."
            }
          ]
        }
      },
      {
        id: "g4-fire-station",
        place: "Fire Station",
        host: "Ruby",
        intro: "Ruby wipes her hands and does not sit down. \"You want to know why there's tape over the siren switch. I wrote it down once so I'd stop having to tell it. Read it. I'll be under the truck.\"",
        kind: "story",
        title: "Why the Siren Stays Off",
        text: "Our first week at the station, we found the ladder truck with a dead battery. I spent two days on it. On the third day it started, and the whole crew cheered. Max asked if the siren worked. I said probably. He hit the switch before I could say anything else.\n\nIt worked. It ran for forty seconds, which is how long it took me to find the fuse. Forty seconds is a long time for a sound like that to go out over an empty town. Empty of people, anyway. Rook was at the bay door before the siren stopped. He did not bark. He just stood there, looking at the road.\n\nThey came for three days. Never fast, but steady, and from every direction. The gate held, because we had built it well. We counted two hundred by the end. Nobody slept much. So the siren has tape over the switch now. Under the tape is a note that says ASK RUBY. Nobody has asked.",
        questions: [
          {
            type: "detail",
            q: "How long did the siren run?",
            options: ["Four seconds", "Forty seconds", "Three days", "Two days"],
            answer: 1,
            hint: "Look at the start of the second paragraph."
          },
          {
            type: "inference",
            q: "Why did Rook stand at the bay door without barking?",
            options: ["He wanted to go outside", "He was afraid of the siren", "He heard walkers coming", "He was waiting for Ruby"],
            answer: 2,
            hint: "Think about what Rook always hears first, and what came next."
          },
          {
            type: "vocab",
            word: "steady",
            q: "What does the word \"steady\" mean in this story?",
            options: ["Without stopping", "Very quick", "Very loud", "In a straight line"],
            answer: 0,
            hint: "Ruby uses it to describe how the walkers came for three days."
          }
        ],
        choice: {
          prompt: "Ruby slides back under the truck. \"Two roads to the Train Yard. Don't use the siren.\"",
          options: [
            {
              label: "The bypass",
              desc: "Long and wide, and most of what the siren drew has drifted away from it by now.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "The bypass is empty except for stalled cars. Nobody says the word siren."
            },
            {
              label: "Through town",
              desc: "Fast, but the siren pulled every walker in town onto these streets, and some of them never left.",
              effects: { zombies: 1.5, scrap: 35, length: 0.8 },
              result: "They are still here, slow and spread out across every block. You take the scrap off a flatbed and do not slow down."
            },
            {
              label: "Before first light",
              desc: "Take the bypass in the dark, which hides the van but leaves you only the headlights to see by.",
              effects: { night: true, zombies: 0.7, length: 1.1, crates: 1 },
              result: "You leave in the dark. The headlights find one crate on the shoulder and nothing else, which is how you like it."
            }
          ]
        }
      },
      {
        id: "g4-train-yard",
        place: "Train Yard",
        host: "Max and Mia",
        intro: "Mia spreads the map across a railroad tie and weights it with spikes. \"We mapped the yard twice. The first time was wrong. Max drew the legend and I crossed out the part that changed. Read all of it, even the crossed-out part.\"",
        kind: "map",
        title: "Train Yard Legend",
        text: "Train Yard Legend. Max drew it. Mia fixed it.\nThick lines are tracks with cars on them. Thin lines are empty tracks. A box with a roof is a shed. A box with a lock drawn on it means we checked the shed, and it was locked.\nA box with a lock and a line through it is Shed 4. It was locked on Monday. On Thursday it was open, and the lock was on the ground, not broken. Somebody has a key. We do not know who. Mia crossed it out and wrote OPEN.\n\nAn arrow with two heads is a track we drove in both directions. An arrow with one head means we only came back one way. Ask us why before you use it.\nEach small x is a walker we saw standing still. Each small s is a sprinter. There are three s marks, all near Shed 4. Mia says that is not a coincidence. Max says it might be. Rook would not go near Shed 4 at all, which is the part we agree on.",
        questions: [
          {
            type: "detail",
            q: "What does a box with a lock drawn on it mean?",
            options: ["The shed is empty", "The shed was locked when checked", "The shed holds supplies", "The shed belongs to Ruby"],
            answer: 1,
            hint: "Look at the end of the first paragraph."
          },
          {
            type: "inference",
            q: "What does the lock on the ground, not broken, tell the twins?",
            options: ["A bruiser forced the door", "The lock rusted through", "The wind blew the door open", "Someone has a key"],
            answer: 3,
            hint: "Read the sentence right after the twins describe the lock."
          },
          {
            type: "vocab",
            word: "coincidence",
            q: "What does the word \"coincidence\" mean here?",
            options: ["Something that happens by chance", "A kind of padlock", "A fast walker", "A mark on a map"],
            answer: 0,
            hint: "Mia and Max disagree about whether the s marks near Shed 4 are one."
          }
        ],
        choice: {
          prompt: "Max points at three tracks with a spike. \"Three ways out of the yard. We mapped all three.\"",
          options: [
            {
              label: "The east gate",
              desc: "A two-headed arrow, driven both ways, slow and empty.",
              effects: { zombies: 0.7, length: 1.2 },
              result: "The east gate track is as empty as the map says. Mia will want that written down."
            },
            {
              label: "Past Shed 4",
              desc: "The short track runs right by the open shed, where the three s marks are.",
              effects: { zombies: 1.2, runners: 1.8, scrap: 35, length: 0.8 },
              result: "Something fast comes out from behind Shed 4 and does not catch you. The scrap pile by the siding was worth it, probably."
            },
            {
              label: "The tunnel track",
              desc: "Through the hill, dark the whole way, and short, and nothing big fits inside.",
              effects: { night: true, brutes: 0.5, length: 0.75, zombies: 0.9 },
              result: "Headlights on. The tunnel walls slide past, and nothing big enough to worry about can follow you in."
            }
          ]
        }
      },
      {
        id: "g4-ranger-station",
        place: "Ranger Station",
        host: "Beck",
        intro: "A ranger in a faded green jacket taps a poster on the board. Someone has written across it in red marker. \"Beck. I put that up on day forty. Read the whole thing, including what's written over it. The red part is the part that matters.\"",
        kind: "poster",
        title: "MISSING, Posted Day 40",
        text: "MISSING. Posted Day 40 at the Ranger Station.\nHal Okafor, age 16. Tall, thin, brown jacket, torn left pocket. Last seen Day 38 at the north trailhead, going to check the rain gauges. He carries a green pack and a whistle. He knows the trails better than anyone here, and he knows not to walk at night.\nIf you see him, give him water and point him to the station. Do not send him toward the lake trail. The lake trail is closed. If you find his pack without him, bring the pack.\n\nWritten across the poster in red marker:\nFOUND. Day 43. Hal walked in at dawn with Rook beside him. The dog found him first, two miles up, sitting in a tree stand. The rain gauges were in his lap. He had been there two nights. He said the lake trail was full of walkers after the storm. So he went up instead of around. He was right to. Nobody takes this poster down. New people need to know that he came back. Beck.",
        questions: [
          {
            type: "detail",
            q: "What was Hal going to check when he left?",
            options: ["The lake trail", "The north gate", "The tree stand", "The rain gauges"],
            answer: 3,
            hint: "Look at the line that starts with \"Last seen.\""
          },
          {
            type: "inference",
            q: "Why was the lake trail closed?",
            options: ["A tree fell across it", "Walkers filled it after the storm", "Hal lost his pack on it", "The rain gauges were there"],
            answer: 1,
            hint: "The first part says the trail is closed, and the red part says what Hal found on it."
          },
          {
            type: "vocab",
            word: "trailhead",
            q: "What does the word \"trailhead\" mean on this poster?",
            options: ["The start of a trail", "A ranger's hat", "A kind of tree", "The top of a hill"],
            answer: 0,
            hint: "Hal was last seen there, going out to check something."
          }
        ],
        choice: {
          prompt: "Beck unpins a trail map. \"Two ways down to the quarry, and one of them is the lake trail.\"",
          options: [
            {
              label: "The lake trail",
              desc: "Closed since the storm, short and straight, and Hal says it is full of walkers with nowhere to go.",
              effects: { zombies: 1.5, scrap: 30, length: 0.8 },
              result: "Hal was right about the lake trail. It is short, it is crowded, and you pull scrap from a ranger truck on the way out."
            },
            {
              label: "The fire road",
              desc: "Around the mountain, long and dull, with one of Hal's rain gauges at every mile.",
              effects: { zombies: 0.75, length: 1.25 },
              result: "You count rain gauges all the way down. Nothing else on the fire road is counting anything."
            },
            {
              label: "The high trail",
              desc: "The way Hal went: up and over, with fog at the top, and the gear he left in the tree stand.",
              effects: { fog: true, zombies: 0.9, crates: 2, hp: -5 },
              result: "Fog closes in at the top. The tree stand is where Hal said, with two crates of gear under it, and the trail down is rough on the tires."
            }
          ]
        }
      },
      {
        id: "g4-quarry-gate",
        place: "Quarry Gate",
        host: "Teo",
        intro: "The gatekeeper, Teo, does not lift the bar until you have read the paint. \"Every word on that steel is there for a reason. Read it to me. If you skip a line, I'll know.\"",
        kind: "warning",
        title: "Painted on the Quarry Gate",
        text: "QUARRY GATE. STOP. READ. THEN KNOCK.\nNO HORNS. NO ENGINES AT THE GATE. NO SHOUTING.\nThe quarry is a bowl of stone. Every sound you make here goes to the far wall and comes back twice as loud. A car horn at this gate can be heard a mile down the road. We know this because a man leaned on his horn here in June. We spent a week clearing what it brought.\n\nNO LIGHTS AFTER DARK. We mean it. Headlights on the cliff face can be seen from the highway. Park in the trees, walk to the gate, and knock twice with your hand, not with metal.\nIf you are hurt, say so quietly, and Doc Lin will come out. If you are hungry, say so, and we will feed you. If you are loud, you will wait outside until morning. That is not a threat. It is just how stone works.\nTeo keeps the gate. Teo does not argue.",
        questions: [
          {
            type: "detail",
            q: "How should you knock at the gate?",
            options: ["Twice, with your hand", "Three times, with metal", "Once, with the horn", "Loudly, with a stick"],
            answer: 0,
            hint: "Look at the sentence that starts with \"Park in the trees.\""
          },
          {
            type: "inference",
            q: "Why is the quarry so strict about sound?",
            options: ["The workers sleep during the day", "Teo does not like noise", "The gate is made of thin wood", "The stone walls make every sound carry"],
            answer: 3,
            hint: "Read what the quarry is shaped like and what happened in June."
          },
          {
            type: "vocab",
            word: "clearing",
            q: "What does \"clearing\" mean in \"a week clearing what it brought\"?",
            options: ["Cutting down trees", "Getting rid of walkers", "Washing the gate", "Making a new path"],
            answer: 1,
            hint: "Think about what a loud horn would bring to the gate."
          }
        ],
        choice: {
          prompt: "Teo lifts the bar, quietly. \"The quarry road down to the hospital, or the long way around the lake.\"",
          options: [
            {
              label: "The quarry road",
              desc: "Steep and short, down through the cut, and whatever the horn drew in June is still drifting on it.",
              effects: { zombies: 1.3, brutes: 1.5, scrap: 30, length: 0.8 },
              result: "The cut is narrow and the bruisers are slow. You coast most of the way down with the engine off and take scrap from a loader at the bottom."
            },
            {
              label: "The lake loop",
              desc: "Flat and long, and quiet enough that Teo lets his own people walk it.",
              effects: { zombies: 0.7, length: 1.3 },
              result: "The lake loop is as quiet as promised. Rook sleeps for the first hour."
            }
          ]
        }
      },
      {
        id: "g4-hospital-annex",
        place: "Hospital Annex",
        host: "Doc Lin",
        intro: "Doc Lin hands you an envelope with a red cross drawn on it in pen. \"This was taped to the pharmacy door when we got here. Another doctor wrote it. I've read it ten times. You read it once and tell me what I keep missing.\"",
        kind: "letter",
        title: "To Whoever Opens This Door",
        text: "To whoever opens this door.\nMy name is Dr. Amara Osei. I ran this annex for sixty days after the Fall. I am leaving on foot for the coast, where my family may be. I am not leaving because the annex failed. I am leaving because I promised.\n\nThe pharmacy is locked, and the key is in the fish tank. Nobody looks in a fish tank. Antibiotics are on the second shelf, oldest first. Bandages are in the laundry room, not the supply closet. The supply closet has a window. The laundry room does not.\nThe generator runs the lights for four hours a night. Do not run it longer. It is loud, and it is the only one.\n\nThe ambulance is not here. I drove it as far as the bridge, where it died. If you need parts, it is still there with the keys in it. Nobody who needs an ambulance is going to steal one.\nBe kind to the people who come in. Most of them are more scared than sick.\nDr. Osei.",
        questions: [
          {
            type: "detail",
            q: "Where is the pharmacy key?",
            options: ["In the supply closet", "In the ambulance", "On the second shelf", "In the fish tank"],
            answer: 3,
            hint: "Look at the first sentence of the second paragraph."
          },
          {
            type: "inference",
            q: "What does Dr. Osei mean by \"I am leaving because I promised\"?",
            options: ["She promised to return the ambulance", "She promised to find her family", "She promised Doc Lin she would go", "She promised to fix the generator"],
            answer: 1,
            hint: "Read where Dr. Osei is going and who might be there."
          },
          {
            type: "vocab",
            word: "annex",
            q: "What does the word \"annex\" mean in this letter?",
            options: ["A building joined to a hospital", "A kind of medicine", "A doctor's bag", "A locked pharmacy"],
            answer: 0,
            hint: "Dr. Osei ran it for sixty days, and it has a pharmacy and a generator."
          }
        ],
        choice: {
          prompt: "Doc Lin tapes the letter back on the door. \"The coast road, or the bridge where the ambulance died.\"",
          options: [
            {
              label: "The bridge road",
              desc: "Past the dead ambulance, which still has parts in it, along with whatever found it after the doctor walked away.",
              effects: { zombies: 1.4, scrap: 35, hp: 10, length: 0.9 },
              result: "The ambulance is where the letter said. Ruby strips what the van needs while Rook watches the bridge, and you leave before whatever is coming gets there."
            },
            {
              label: "The coast road",
              desc: "Long and open along the water, with the wind in your favor and not much else on it.",
              effects: { zombies: 0.75, length: 1.25 },
              result: "The coast road is empty and loud with wind. Doc Lin says nothing for ten miles, which is new."
            },
            {
              label: "The shore after dark",
              desc: "Leave when the generator shuts off, in the dark and the quiet, where the tide leaves crates on the sand.",
              effects: { night: true, zombies: 0.9, crates: 3 },
              result: "Headlights on the wet sand. Three crates sit in the tide line, and the only sound is the water."
            }
          ]
        }
      },
      {
        id: "g4-boat-dock",
        place: "Boat Dock",
        host: "Marisol",
        intro: "Marisol pins a damp card to the rail with a clothespin. \"Every crew that leaves this dock gets ten fish and a copy of this. The numbers matter more than the steps. Read it and tell me how long it lasts you.\"",
        kind: "recipe",
        title: "Smoked Fish for the Road",
        text: "Smoked Fish for the Road. Boat Dock. Written by Marisol.\nTake ten fish, cleaned, and split them down the back. Rub each one with a spoon of salt, no more. Salt is scarce, and too much makes you thirsty, and water is scarcer. Lay them on the racks over the fire pit, skin side down.\nKeep the fire low and smoky, never hot. Use green wood, not dry. If you can see flame, it is too hot. Smoke them from dawn until the sun is high, and turn them once.\n\nWhen they are done, they bend without breaking and smell like the fire. Wrap each fish in a clean rag and keep them out of the sun.\nTen fish feed six people for five days, if nobody cheats. That is two fish a day for the whole crew, split fair. Rook gets the skins and nothing else. He will argue. Do not lose that argument.\nIf a fish smells wrong, it is wrong. Do not eat it. We have enough problems.",
        questions: [
          {
            type: "detail",
            q: "How much salt goes on each fish?",
            options: ["One spoon", "Two spoons", "A handful", "None at all"],
            answer: 0,
            hint: "Look at the second sentence of the recipe."
          },
          {
            type: "inference",
            q: "What does \"if nobody cheats\" tell you about the crew's food?",
            options: ["There is more than enough fish", "There is only just enough to go around", "The fish do not taste good", "Rook keeps stealing fish"],
            answer: 1,
            hint: "Think about why Marisol spells out exactly how many fish per day."
          },
          {
            type: "vocab",
            word: "scarce",
            q: "What does the word \"scarce\" mean in this recipe?",
            options: ["Very salty", "Easy to find", "Dried out", "Hard to find"],
            answer: 3,
            hint: "Marisol says salt is scarce and water is scarcer, so think about what that means for supplies."
          }
        ],
        choice: {
          prompt: "Marisol hands you the fish wrapped in rags. \"Two ways to the lighthouse. By water or by the shore road.\"",
          options: [
            {
              label: "The shore road",
              desc: "Sand and rock, slow and empty, with the tide on your left the whole way.",
              effects: { zombies: 0.7, length: 1.25 },
              result: "The shore road is slow and empty. The fish ration holds, and nobody cheats."
            },
            {
              label: "The ferry barge",
              desc: "Marisol's crew floats the van across the inlet, which is quick, but the fog on the water is thick and the far landing is not watched.",
              effects: { fog: true, zombies: 1.2, length: 0.8, crates: 2 },
              result: "The barge noses into fog and comes out on the far side. Two crates wait on the landing, and so does something else."
            },
            {
              label: "The cannery road",
              desc: "Through the old cannery lot, fast and full of scrap, where bruisers stand between the trucks.",
              effects: { zombies: 1.3, brutes: 1.6, scrap: 40, length: 0.85 },
              result: "The cannery lot smells like old salt. Bruisers turn slowly between the trucks, and the scrap pile by the loading door is the best you have seen in weeks."
            }
          ]
        }
      },
      {
        id: "g4-old-lighthouse",
        place: "Old Lighthouse",
        host: "Ansel",
        intro: "Ansel, the keeper, slides a ledger across the table and turns the lamp up. \"I write down every light I see on the water. Two weeks of nothing, and then this. Read the last six nights and tell me if you'd answer.\"",
        kind: "log",
        title: "Light Log, Nights 60 to 65",
        text: "Light Log. Old Lighthouse. Kept by Ansel.\nNight 60. No lights on the water. Wind from the north. Lamp run twenty minutes at full dark, same as always.\nNight 61. No lights.\nNight 62. One light, far out, low on the water. Steady, not blinking. Gone before the lamp finished its run.\nNight 63. Same light, same place. It stayed through the whole run, then went out when the lamp did.\n\nNight 64. Two lights now. The far one, and a closer one that blinks. Three short, three long, three short. I know what that means. Everyone knows what that means. I did not answer. I do not know who is out there. The lamp can be seen from the highway as well as the sea.\nNight 65. Both lights. The blinking one came closer and kept blinking for an hour. Rook sat by the door the whole time and did not growl once. Jo says a dog knows. I am going to answer tomorrow. I am writing it here so I cannot change my mind.",
        questions: [
          {
            type: "detail",
            q: "How long does the lamp run each night?",
            options: ["Ten minutes", "One hour", "All night", "Twenty minutes"],
            answer: 3,
            hint: "Look at the entry for Night 60."
          },
          {
            type: "inference",
            q: "What does Jo mean by \"a dog knows\"?",
            options: ["Rook can read light signals", "Rook stays calm when there is no danger", "Rook wants to go outside", "Rook is afraid of the sea"],
            answer: 1,
            hint: "Think about what Rook usually does when walkers are near, and what he did not do."
          },
          {
            type: "vocab",
            word: "full dark",
            q: "What does \"full dark\" mean in \"twenty minutes at full dark\"?",
            options: ["When the moon is out", "Just at sunset", "When night has completely come", "Just before dawn"],
            answer: 2,
            hint: "Think about when a lighthouse lamp would be most useful."
          }
        ],
        choice: {
          prompt: "Ansel closes the ledger. \"Two ways back to the convoy, and one is the beach where that light is headed.\"",
          options: [
            {
              label: "The cliff road",
              desc: "High and long, with the beam at your back for the first mile and nothing on the road after that.",
              effects: { zombies: 0.75, length: 1.25 },
              result: "The beam sweeps over the van twice and then falls behind. The cliff road is long and empty."
            },
            {
              label: "The beach",
              desc: "Down on the sand toward where the lights are coming in, short, and whatever washed up with the tide is still there.",
              effects: { zombies: 1.3, scrap: 30, crates: 2, length: 0.85 },
              result: "The sand is firm at the tide line. You pick up two crates and a pile of scrap, and you do not stop to see what else came in."
            },
            {
              label: "After the signal",
              desc: "Wait for Ansel to answer, then leave in the dark with whatever the light brings, while Doc Lin uses the wait to patch the van.",
              effects: { night: true, zombies: 1.0, hp: 10 },
              result: "Ansel answers: three short, three long, three short. The far light turns toward shore, and you drive out under the beam."
            }
          ]
        }
      }
    ],
    roadSigns: [
      {
        text: "Spray paint on the overpass, letters a foot high: HERD MOVED SOUTH ON DAY 50. DO NOT TAKE THE SOUTH RAMP.",
        q: "Which ramp should you avoid?",
        options: ["The north ramp", "The south ramp", "The east ramp"],
        answer: 1
      },
      {
        text: "Jo on the radio: \"Bookmobile, the Toll Plaza reports sprinters on the east approach. Come in from the west, and don't stop for the cars.\"",
        q: "Which approach should you use?",
        options: ["The west approach", "The east approach", "The toll lanes"],
        answer: 0
      },
      {
        text: "A note under a wiper blade: \"Engine is fine, tires are not. Took the spare and walked, so if you can patch two tires, this car is yours.\"",
        q: "What is wrong with the car?",
        options: ["The engine is dead", "The tires are flat", "The keys are missing"],
        answer: 1
      },
      {
        text: "Hand-lettered sign on a fence: \"We trade at the gate, not inside. Show your hands and keep your dog close.\"",
        q: "Where does trading happen?",
        options: ["At the gate", "Inside the camp", "On the road"],
        answer: 0
      },
      {
        text: "Painted on the side of a school bus: MILE 9 DINER HAS WATER, ASK FOR CASS. DO NOT ARRIVE AFTER DARK.",
        q: "Who should you ask for at the diner?",
        options: ["Ruby", "Jo", "Cass"],
        answer: 2
      },
      {
        text: "Jo on the radio: \"Fog on the river flats until noon. If you can't see the next mile marker, pull over and wait.\"",
        q: "What should you do if you cannot see the next marker?",
        options: ["Speed up", "Pull over and wait", "Turn on the siren"],
        answer: 1
      },
      {
        text: "Chalk on the road, in Mia's handwriting: \"Bridge holds a van. Does NOT hold a truck, and yes, we checked.\"",
        q: "What can the bridge hold?",
        options: ["Nothing at all", "A loaded truck", "A van"],
        answer: 2
      },
      {
        text: "A sign wired to a stalled gas tanker: \"EMPTY. We checked on Day 20 and again on Day 41, so stop wasting your time.\"",
        q: "What does the sign say about the tanker?",
        options: ["It is empty", "It is full", "It is locked"],
        answer: 0
      }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
