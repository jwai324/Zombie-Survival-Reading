/* Grade 3 reading content for Zombie Survival Reading.
   Schema and calibration: docs/CONTENT_GUIDE.md. Validate with `npm test`. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[3] = {
    grade: 3,
    havens: [
      {
        id: "g3-overpass-camp",
        place: "Overpass Camp",
        host: "Jo",
        intro: "Jo slides a creased page across the table and taps the middle of it. \"Night twelve. I was on the radio, and then I wasn't. Read it back to me and tell me what's missing.\"",
        kind: "log",
        title: "Radio Log, Night 12",
        text: "Overpass Camp. Radio log, Night 12. Kept by Jo.\n9:10 PM. Ruby calls from the garage. The van is fixed. She will sleep there.\n10:40 PM. Max and Mia check in from the hill. No walkers on the road.\n12:05 AM. Doc Lin asks for the weather. I tell her rain by morning.\n12:30 AM. Rook is at the door. He is not barking, but he will not lie down. He hears walkers before any of us do.\n\n4:50 AM. Back. The power went out, and the radio went with it.\n4:55 AM. Called the hill. The twins answer on the second try. Both fine.\n5:10 AM. Called the garage. No answer.\n5:40 AM. Ruby walks in through the gate. The garage radio died with the power. Everyone is counted. Rain starts.",
        questions: [
          {
            type: "detail",
            q: "What happened when Jo called the garage at 5:10 AM?",
            options: ["The twins answered", "Nobody answered", "Ruby said the van was fixed", "The power came back on"],
            answer: 1,
            hint: "Find the 5:10 AM line."
          },
          {
            type: "inference",
            q: "Why did Jo call the hill and the garage as soon as the power came back?",
            options: ["To ask about the weather", "To report the rain", "To order more fuel", "To make sure everyone was safe"],
            answer: 3,
            hint: "Think about what Jo could not do while the radio was dead."
          },
          {
            type: "vocab",
            word: "counted",
            q: "What does \"counted\" mean when Jo writes \"Everyone is counted\"?",
            options: ["Everyone is safe and here", "Everyone is asleep", "Everyone is out on the road", "Everyone is on the radio"],
            answer: 0,
            hint: "Jo writes it right after Ruby walks in through the gate."
          }
        ],
        choice: {
          prompt: "Jo folds the page. \"Two roads to the Gas-N-Go, and the rain is not going to wait for you.\"",
          options: [
            {
              label: "The hill road",
              desc: "The twins watched it all night and saw no walkers, but it is the long way around.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "The hill road stays quiet the whole way. Rook lies down for the first time since midnight."
            },
            {
              label: "The river road",
              desc: "Shorter, and the stalled cars on it still hold scrap, but the rain brings fog up off the river.",
              effects: { zombies: 1.2, fog: true, scrap: 20, length: 0.9 },
              result: "Fog sits on the river road like a lid. You pull scrap from two stalled cars and do not stay long."
            },
            {
              label: "Wait for noon",
              desc: "Leave when the rain stops, so fewer walkers are moving, but you will still be driving after dark.",
              effects: { zombies: 0.9, night: true, crates: 1 },
              result: "The rain quits at noon. The light goes before you do, and the headlights find one crate by the road."
            }
          ]
        }
      },
      {
        id: "g3-gas-n-go",
        place: "Gas-N-Go",
        host: "Ruby",
        intro: "Ruby drops a clipboard on the hood of the van and does not pick it up. \"I count fuel on Mondays. Max counted on Thursday. Read both and tell me if I'm wrong.\"",
        kind: "list",
        title: "Fuel Count, Monday and Thursday",
        text: "Gas-N-Go fuel count. Monday, by Ruby.\nRed cans, full: 12. Red cans, empty: 4. Oil: 9 quarts. Fan belts: 2.\nRule: the van takes two cans for one full run. Nobody takes fuel without a mark on the board by the door. No mark, no fuel.\n\nThursday count, by Max.\nRed cans, full: 7. Red cans, empty: 6. Oil: 9 quarts. Fan belts: 2.\nBoard by the door: Ruby, two cans, Tuesday, for the Bookmobile run. Nothing else is written.\nMax: I counted twice. Then I counted a third time, because Ruby would ask. The numbers did not change. The gate was locked every night this week, and the lock is not broken.",
        questions: [
          {
            type: "detail",
            q: "How many cans does the van use for one full run?",
            options: ["One can", "Four cans", "Two cans", "Seven cans"],
            answer: 2,
            hint: "Look at the rule under Monday's count."
          },
          {
            type: "inference",
            q: "What do the two counts show?",
            options: ["Max counted the wrong cans", "Someone took fuel without a mark", "The van used up all the fuel", "Ruby forgot to count the oil"],
            answer: 1,
            hint: "Compare the number of full cans with what is written on the board."
          },
          {
            type: "vocab",
            word: "run",
            q: "What does the word \"run\" mean in \"the Bookmobile run\"?",
            options: ["A fast jog", "A broken engine", "A fuel can", "A delivery trip"],
            answer: 3,
            hint: "Think about what the van does with two cans of fuel."
          }
        ],
        choice: {
          prompt: "Ruby points down the road with the clipboard. \"Two ways to the Toll Plaza. Whichever you pick, I fill the tank for it.\"",
          options: [
            {
              label: "The county road",
              desc: "Long and open, and Ruby has driven it twice this month without seeing a walker.",
              effects: { zombies: 0.7, length: 1.25 },
              result: "The county road stays empty. Ruby's two cans get you there with a little to spare."
            },
            {
              label: "The truck stop cut",
              desc: "Short, but the lot is full of stalled trucks, and the bruisers stand between them.",
              effects: { zombies: 1.3, brutes: 1.5, scrap: 30, length: 0.85 },
              result: "You thread the van between the trucks. Bruisers turn slowly as you pass, and an open trailer gives up its scrap."
            }
          ]
        }
      },
      {
        id: "g3-toll-plaza",
        place: "Toll Plaza",
        host: "Doc Lin",
        intro: "Doc Lin hands you a folded page with tape still hanging off one corner. \"This was on the booth window. Somebody is looking for a sister. Read it, and then we decide if we carry it.\"",
        kind: "letter",
        title: "For Dana",
        text: "Dana, if you come through the toll plaza, stop and read this.\nWe waited here four days, like we said. The water ran low on day three. On day four a convoy came through, and they had room. We went with them. I am sorry. I did not want to break the plan.\nWe are headed to the Water Tower camp on Route 9. The convoy leader says it has a well and a gate. Ask for Mara. That is me, in case you forgot what I look like.\n\nI left your blue jacket in the booth, under the counter. There is a can of peaches in the pocket. Save it for the road.\nIf you are reading this, you made it this far. That is the hard part. Keep going.\nMara.",
        questions: [
          {
            type: "detail",
            q: "Where did Mara leave the blue jacket?",
            options: ["In the convoy truck", "Under the booth counter", "At the Water Tower camp", "On the road to Route 9"],
            answer: 1,
            hint: "Look for the sentence about the jacket."
          },
          {
            type: "inference",
            q: "Why did Mara leave before Dana got there?",
            options: ["She forgot the plan", "Dana told her to go", "The booth was locked", "Water was low and a convoy had room"],
            answer: 3,
            hint: "Read what happened on day three and day four."
          },
          {
            type: "vocab",
            word: "convoy",
            q: "What does the word \"convoy\" mean in this letter?",
            options: ["A group of trucks traveling together", "A locked toll booth", "A kind of water pump", "A place to sleep"],
            answer: 0,
            hint: "Mara says the convoy came through and had room."
          }
        ],
        choice: {
          prompt: "Doc Lin tucks the letter into her jacket. \"Route 9 to the Water Tower, or the long way past the lake. We carry it either way.\"",
          options: [
            {
              label: "Route 9",
              desc: "Straight to the Water Tower, but the convoy that passed here left walkers following its tracks.",
              effects: { zombies: 1.3, scrap: 20, length: 0.9 },
              result: "Route 9 is littered with what the convoy dropped. Walkers drift along the same ruts, and you keep the window up."
            },
            {
              label: "The lake road",
              desc: "Longer and quiet, with the water on one side and nothing on the other.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "Nothing moves on the lake road but the water. Doc Lin reads the letter twice."
            },
            {
              label: "The toll lanes",
              desc: "The plaza lanes are jammed with cars, and each car is a chance at scrap or a dent.",
              effects: { zombies: 1.0, crates: 3, hp: -10 },
              result: "You scrape the van through the jammed lanes. Three crates, two new dents."
            }
          ]
        }
      },
      {
        id: "g3-school-bus-wall",
        place: "School Bus Wall",
        host: "Harlan",
        intro: "A tall man with a whistle on a cord points at the painted board by the gate. \"Harlan. I keep the gate. Read those out loud. New people always skip rule four.\"",
        kind: "rules",
        title: "Rules of the Wall",
        text: "Rules of the School Bus Wall. Read them before you come in.\nRule one: no engines running inside the wall. Sound carries.\nRule two: the gate opens at dawn and closes at dusk. If you are late, you wait outside. Nobody likes this rule. It is still the rule.\nRule three: every person signs the board, in and out. We count twice a day.\n\nRule four: nobody goes over the wall at night, not even to help. In the spring, two of us went over to help a stranger. The gate stood open for five minutes. Walkers took half the garden, and we nearly lost more than that. Now we lower a rope and a light. The stranger climbs, or waits for dawn. The rope is by the bell. Harlan.",
        questions: [
          {
            type: "detail",
            q: "When does the gate close?",
            options: ["At noon", "At dawn", "At dusk", "At midnight"],
            answer: 2,
            hint: "Rule two tells you about the gate."
          },
          {
            type: "inference",
            q: "Why does rule four exist?",
            options: ["Walkers got in while the gate stood open", "The rope was lost in the spring", "Strangers are never let in", "The bell is too loud at night"],
            answer: 0,
            hint: "Read what happened in the spring."
          },
          {
            type: "vocab",
            word: "carries",
            q: "What does \"carries\" mean in \"Sound carries\"?",
            options: ["Holds something heavy", "Travels a long way", "Stops at the wall", "Gets quieter"],
            answer: 1,
            hint: "Think about why a running engine inside the wall would be a problem."
          }
        ],
        choice: {
          prompt: "Harlan lifts the bar on the gate. \"Two roads out. One goes past the old school. One goes across the fields.\"",
          options: [
            {
              label: "The school road",
              desc: "Past the bus lot, where the doors hang open and walkers wander between the buses.",
              effects: { zombies: 1.3, crates: 2, scrap: 15, length: 0.9 },
              result: "You roll past the bus lot slow. Doors hang open, and two crates sit on the curb where someone dropped them."
            },
            {
              label: "The field road",
              desc: "Dirt and ruts across open ground, slow going, but you can see a long way in every direction.",
              effects: { zombies: 0.8, length: 1.15, hp: -5 },
              result: "The ruts shake the van, but nothing comes at you across the open ground."
            }
          ]
        }
      },
      {
        id: "g3-water-tower",
        place: "Water Tower",
        host: "Ines",
        intro: "A woman with grease to her elbows hands you a plastic sheet covered in marker. \"Ines. I run the pump. The factory sheet is wrong in two places, and somebody fixed it by hand. Read all of it, fixes too.\"",
        kind: "manual",
        title: "Hand Pump, Model 40",
        text: "Hand Pump, Model 40. How to start it.\n1. Open the valve on the left. (Marker: It is on the RIGHT now.)\n2. Pour one cup of water into the top. This is called priming. The pump will not pull without it.\n3. Work the handle ten times, slowly. Water should come on the tenth stroke. (Marker: Twenty strokes. The pipe is deeper than it was.)\n4. Close the valve when you are done.\n\nMarker, at the bottom:\nDo NOT pump after dark. The handle squeaks, and the sound goes across the field. We learned that the hard way. Oil the handle every Sunday, and keep the priming cup full. If the water comes up brown, stop and tell Ines. Do not drink it. Do not let Rook drink it either. He will try.",
        questions: [
          {
            type: "detail",
            q: "How many strokes does the marker note say to use?",
            options: ["Ten strokes", "Four strokes", "One stroke", "Twenty strokes"],
            answer: 3,
            hint: "Look at the note after step three."
          },
          {
            type: "inference",
            q: "Why should nobody use the pump after dark?",
            options: ["The water is brown at night", "The valve sticks in the cold", "The squeak could draw walkers", "Ines is asleep by then"],
            answer: 2,
            hint: "The note at the bottom says what the handle does and where the sound goes."
          },
          {
            type: "vocab",
            word: "priming",
            q: "What does the word \"priming\" mean in this manual?",
            options: ["Adding water so the pump can pull", "Oiling the handle", "Closing the valve", "Painting the pump"],
            answer: 0,
            hint: "Step two explains it."
          }
        ],
        choice: {
          prompt: "Ines wipes her hands and nods at the field. \"Two roads from the tower, and the field between them.\"",
          options: [
            {
              label: "The paved road",
              desc: "Smooth and long, past the farms, where the walkers are few and slow.",
              effects: { zombies: 0.75, length: 1.2 },
              result: "The road hums. Farm gates stand open on both sides, and nothing comes through them."
            },
            {
              label: "Across the field",
              desc: "Short and straight through tall grass, where you cannot see what is standing in it.",
              effects: { zombies: 1.3, runners: 1.4, scrap: 25, length: 0.8 },
              result: "Grass drags on the doors. Twice something stands up in it, and twice you are already past."
            },
            {
              label: "The back road at night",
              desc: "Wait for dark and take the back road, where nothing moves after sunset, but neither can you see.",
              effects: { night: true, zombies: 0.9, crates: 2 },
              result: "Headlights only. You find two crates by the mile marker, right where Ines said they would be."
            }
          ]
        }
      },
      {
        id: "g3-radio-tower",
        place: "Radio Tower",
        host: "Max and Mia",
        intro: "Max unrolls a map on the hood while Mia pins the corners with rocks. \"We mapped the valley from the top of the tower. One mark is crossed out. Read the legend so Jo knows which one.\"",
        kind: "map",
        title: "Legend for the Valley Map",
        text: "Legend for the Valley Map. Drawn by Max and Mia from the Radio Tower.\nA black line is a road that cars can use. A broken line is a road with stalled cars on it.\nA triangle is a camp with people. A triangle with a dot is a camp that answers on the radio.\nA circle with a W is clean water. There were two on the map. There is one now.\n\nThe W by the creek is crossed out. We went down on Tuesday, and the water was cloudy. Doc Lin says to boil it or not to use it. Small arrows show which way the walkers were moving when we looked. Most of the arrows point at the highway. The star is the Bookmobile. You are the star. Mia.",
        questions: [
          {
            type: "detail",
            q: "What does a triangle with a dot mean?",
            options: ["Clean water", "A road with stalled cars", "Where the van is parked", "A camp that answers the radio"],
            answer: 3,
            hint: "Find the two sentences about triangles."
          },
          {
            type: "inference",
            q: "Why is the W by the creek crossed out?",
            options: ["The creek dried up", "The twins ran out of ink", "The water was not safe", "Walkers were standing in it"],
            answer: 2,
            hint: "Read what the twins found on Tuesday."
          },
          {
            type: "vocab",
            word: "legend",
            q: "What does the word \"legend\" mean here?",
            options: ["An old story", "A key that explains the marks", "A tall tower", "A kind of road"],
            answer: 1,
            hint: "Look at what the whole page is for."
          }
        ],
        choice: {
          prompt: "Mia taps the arrows with her pencil. \"They all point at the highway. So which way do you want?\"",
          options: [
            {
              label: "The highway",
              desc: "Fast and straight, but the arrows say the walkers are drifting that way too.",
              effects: { zombies: 1.4, scrap: 30, length: 0.85 },
              result: "The arrows were right. The highway is crowded, and the shoulder is full of scrap."
            },
            {
              label: "The back valley",
              desc: "Away from the arrows, on a broken line, where the stalled cars make you weave.",
              effects: { zombies: 0.7, length: 1.2, hp: -5 },
              result: "You weave between stalled cars for an hour. Nothing follows."
            },
            {
              label: "Up the ridge",
              desc: "A black line the twins have not driven yet, high and short, with cloud sitting on top of it.",
              effects: { zombies: 1.0, fog: true, crates: 2 },
              result: "Cloud covers the ridge road. You find two crates in the fog and never see who left them."
            }
          ]
        }
      },
      {
        id: "g3-greenhouse",
        place: "Greenhouse",
        host: "Wen",
        intro: "A gardener with dirt under her nails nods at the back door. The letters on it are a foot tall. \"Wen. I grow what we eat. I painted that in May. Read it, and don't skip the part about the roof.\"",
        kind: "warning",
        title: "Painted on the Back Door",
        text: "WARNING. READ THIS BEFORE YOU OPEN THE BACK DOOR.\nThe back door opens on the low field. The low field floods when it rains. When the water rises, walkers come down the creek with it. They do not climb out. They do not turn back. They stand in the water until it drops. Then they are in the field.\n\nSo: after rain, keep the back door shut for two days. Count them. Use the front door, even though it is farther. Check the field from the roof first. If the field is still wet, it is not empty. Three of us learned this in May. All three are fine. The paint is so it stays that way. The tomatoes are worth it. Wen.",
        questions: [
          {
            type: "detail",
            q: "How long should the back door stay shut after rain?",
            options: ["One day", "Two days", "One week", "Until May"],
            answer: 1,
            hint: "Look for the sentence that starts with \"So.\""
          },
          {
            type: "inference",
            q: "Why check the field from the roof first?",
            options: ["To see if the tomatoes are ripe", "To watch the creek rise", "To see if walkers are standing in it", "To find the front door"],
            answer: 2,
            hint: "Think about what the water brings down the creek."
          },
          {
            type: "vocab",
            word: "floods",
            q: "What does the word \"floods\" mean in this warning?",
            options: ["Fills up with water", "Grows tall grass", "Dries out", "Turns to mud"],
            answer: 0,
            hint: "The sentence about the low field and rain tells you."
          }
        ],
        choice: {
          prompt: "Wen walks you to the front door, the long way. \"Two ways to the diner. The creek, or the ridge.\"",
          options: [
            {
              label: "The ridge road",
              desc: "High and dry, with a view of everything below, but it adds an hour.",
              effects: { zombies: 0.75, length: 1.25 },
              result: "From the ridge you can see the whole low field. It is wet, and it is not empty."
            },
            {
              label: "The creek road",
              desc: "Quick, but it runs beside the water, and you know what comes down the creek.",
              effects: { zombies: 1.4, runners: 1.3, scrap: 30, length: 0.9 },
              result: "The creek road is fast and bad. You keep the windows up and the speed up, and the scrap pays for it."
            }
          ]
        }
      },
      {
        id: "g3-mile-9-diner",
        place: "Mile 9 Diner",
        host: "Cass",
        intro: "Cass pulls a note from under the register and smooths it flat. \"This was here when we opened the place up. Whoever wrote it knew the diner. Read it. We still don't know who they were.\"",
        kind: "note",
        title: "Note Under the Register",
        text: "To whoever comes next.\nThe coffee is in the back, in the tin marked FLOUR. The flour is in the tin marked COFFEE. Do not ask. The cooler has not run since the Fall. Do not open it.\nThe key to the roof hatch is taped under the pie case. The roof is the only place you can see the whole highway. Go up at dawn and at dusk. Count the cars. If the count changes, something moved them.\n\nI stayed nine days. I left when the count changed. I went north, toward the stadium. I took the radio and left the batteries. The radio does not work. The batteries do. Lock the back door. It sticks, so lift it as you turn.\nGood luck. The pie is gone. I am not sorry about that.",
        questions: [
          {
            type: "detail",
            q: "Where is the key to the roof hatch?",
            options: ["In the coffee tin", "In the cooler", "By the back door", "Under the pie case"],
            answer: 3,
            hint: "Find the sentence about the key."
          },
          {
            type: "inference",
            q: "Why did the writer count the cars on the highway?",
            options: ["To know if anything was moving out there", "To find a car that still runs", "To pass the time on the roof", "To make a list for Cass"],
            answer: 0,
            hint: "Read what the writer says a change in the count means."
          },
          {
            type: "vocab",
            word: "sticks",
            q: "What does \"sticks\" mean in \"It sticks, so lift it as you turn\"?",
            options: ["Is made of wood", "Is hard to open", "Is painted red", "Is always unlocked"],
            answer: 1,
            hint: "The second half of the sentence tells you how to deal with it."
          }
        ],
        choice: {
          prompt: "Cass folds the note back under the register. \"North on the highway toward the stadium, or the service road out back.\"",
          options: [
            {
              label: "North on the highway",
              desc: "Open and fast, and the car count has not changed in a week.",
              effects: { zombies: 0.8, length: 1.15 },
              result: "The highway is as still as the count said. You pass the same cars the note was written about."
            },
            {
              label: "The service road",
              desc: "Behind the diner, past the loading docks, short but with every dock door standing open.",
              effects: { zombies: 1.3, brutes: 1.4, scrap: 25, length: 0.85 },
              result: "Bruisers stand in the open dock doors and turn as you pass. The scrap on the loading ramp is worth the look."
            },
            {
              label: "Go at dusk",
              desc: "Climb up, count the cars one more time, and leave when the light is low.",
              effects: { night: true, zombies: 0.9, scrap: 10 },
              result: "The count holds. You pull out as the sun drops, and the headlights do the rest."
            }
          ]
        }
      }
    ],
    roadSigns: [
      {
        text: "Spray paint on the overpass: WALKERS PAST MILE 12. STAY ON THE LEFT SIDE.",
        q: "Which side of the road should you stay on?",
        options: ["The left side", "The right side", "The middle"],
        answer: 0
      },
      {
        text: "Jo on the radio: \"Bridge at the river is out. Take the mill road and keep your lights low.\"",
        q: "What should you do with your lights?",
        options: ["Turn them off", "Keep them low", "Flash them twice"],
        answer: 1
      },
      {
        text: "A note on a stalled car: \"Out of gas, not out of hope. Went east on foot, day 30.\"",
        q: "Which way did the driver go?",
        options: ["West", "North", "East"],
        answer: 2
      },
      {
        text: "Hand-lettered sign on a fence: \"Dogs bark at the gate, and walkers do not. Listen before you knock.\"",
        q: "What should you do before you knock?",
        options: ["Listen", "Honk", "Climb the fence"],
        answer: 0
      },
      {
        text: "Painted on the side of a bus: CAMP MOVED. FOLLOW THE RED ARROWS, NOT THE BLUE ONES.",
        q: "Which arrows should you follow?",
        options: ["The blue ones", "The red ones", "Both colors"],
        answer: 1
      },
      {
        text: "Jo on the radio: \"Sprinters seen near the quarry at dusk. Do not stop there after four.\"",
        q: "When should you avoid the quarry?",
        options: ["Before noon", "At dawn", "After four"],
        answer: 2
      },
      {
        text: "Chalk on the road: \"M + M. Crates in the ditch, left side, past the sign for Route 9.\"",
        q: "Where are the crates?",
        options: ["Left ditch, past the sign", "Right ditch, before the sign", "Inside the Route 9 booth"],
        answer: 0
      },
      {
        text: "Sign on a gate: WATER INSIDE, KNOCK THREE TIMES AND WAIT. WE WILL SEE YOU BEFORE YOU SEE US.",
        q: "How many times should you knock?",
        options: ["Once", "Twice", "Three times"],
        answer: 2
      }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
