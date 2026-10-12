/* Grade 4 reading content for Zombie Survival Reading.
   Schema and calibration: docs/CONTENT_GUIDE.md. Validate with `npm test`. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[4] = {
    grade: 4,
    havens: [
      {
        id: "g4-fire-station",
        place: "Fire Station",
        host: "Captain Ruby",
        intro: "Captain Ruby slaps a clipboard on the hood of the van. \"The fire station crew left me a list, and half of it is scribbled. Read it to me in order, and don't skip the bad news.\"",
        kind: "list",
        title: "The Big Fix-It List",
        text: "Fix-It List for the Fire Station, written by Captain Ruby and finished by everyone else.\n\n1. Fire truck: the siren is stuck on 'quack.' Nobody knows how. Needs a new horn. Doc Lin says it sounds like a duck in a hurry.\n2. Big garage door: it opens fine but refuses to close. Oil the chain, then check the spring. Until then, Biscuit is on guard duty, which mostly means napping in the doorway.\n3. Bookmobile: left headlight is cracked. Replace it before any night driving. Also, the back seat is still full of blueberry jam jars from the School Bus Camp.\n4. Radio: Grandpa Joe reports a crackle on channel four. Probably the antenna. Max and Mia climbed the tower to look, and found a bird's nest wedged in the wires. The bird has been asked, politely, to move.\n5. Lunch: we are out of everything except crackers and jam. Somebody please drive to the Bakery.\n\nUrgent items are 1, 2, and 3. Item 4 can wait, and item 5 is Grandpa Joe's opinion.",
        questions: [
          {
            type: "detail",
            q: "What is wrong with the fire truck?",
            options: ["Its siren sounds like a duck", "Its headlight is cracked", "Its door will not close", "Its radio crackles"],
            answer: 0,
            hint: "Look at item 1 on the list."
          },
          {
            type: "inference",
            q: "Why is Biscuit on guard duty?",
            options: ["The siren is broken", "The garage door stays open", "The crackers are missing", "The radio is crackling"],
            answer: 1,
            hint: "Read what the garage door does, and what Biscuit does until it is fixed."
          },
          {
            type: "vocab",
            word: "urgent",
            q: "What does the word \"urgent\" mean in this passage?",
            options: ["Can wait a while", "Already finished", "Easy to fix", "Must be done soon"],
            answer: 3,
            hint: "The last line compares the urgent items with an item that can wait."
          }
        ],
        choice: {
          prompt: "Captain Ruby tosses you the keys. \"Three roads from here. The crew voted, but it's your van.\"",
          options: [
            {
              label: "The highway",
              desc: "Wide and fast and mostly clear of Shamblers, though it takes the long way around.",
              effects: { zombies: 0.75, length: 1.2 },
              result: "The highway hums. Grandpa Joe reads you the weather twice, just to be sure."
            },
            {
              label: "The old mill road",
              desc: "Short and rough, with runner Shamblers racing on it, but the old mill pays well in scrap.",
              effects: { zombies: 1.3, runners: 1.6, scrap: 35, length: 0.85 },
              result: "Runners sprint beside the van, trip over each other, and poof in a tidy row."
            },
            {
              label: "The night route",
              desc: "Captain Ruby patched the van and dares you to try the dark road, which is short and quiet.",
              effects: { night: true, zombies: 0.9, length: 0.8, hp: 10 },
              result: "The new headlight cuts through the dark. Ruby's patch job holds, and then some."
            }
          ]
        }
      },
      {
        id: "g4-mountain-lodge",
        place: "Mountain Lodge",
        host: "Grandpa Joe",
        intro: "Grandpa Joe pats the chair beside the fire. \"I wrote this one down so the twins would stop telling it wrong. Read it slow. The best part is the middle.\"",
        kind: "story",
        title: "The Great Pancake Avalanche",
        text: "Years ago, before the Bookmobile, I ran the kitchen at the Mountain Lodge. One winter morning, snow on the roof was so deep the lodge creaked like an old ship. Doc Lin, who was just a kid then, decided to make pancakes for the whole mountain. She mixed enough batter to fill the bathtub, which is exactly where she mixed it.\n\nThat is when the Shamblers arrived. Twenty of them shuffled up the slope, moaning 'Brrrains?' at the front door. I did not have a plan. Doc Lin had a ladle. She climbed to the roof, scooped batter onto the snow, and the whole drift let go at once. Pancake batter and snow poured down the slope in a sweet, sticky wave. The Shamblers were so confused that every single one of them poofed.\n\nWe ate pancakes for a week. The twins say the avalanche was taller than the lodge, but they were not even born yet. I say it was taller than the mountain.",
        questions: [
          {
            type: "detail",
            q: "Where did Doc Lin mix the batter?",
            options: ["In a big pot", "On the roof", "In the snow", "In the bathtub"],
            answer: 3,
            hint: "Look at the end of the first paragraph."
          },
          {
            type: "inference",
            q: "Why does Grandpa Joe mention that the twins were not born yet?",
            options: ["They are too young to cook", "They could not have seen it", "They do not like pancakes", "They were asleep upstairs"],
            answer: 1,
            hint: "Think about whether the twins could really know how tall the avalanche was."
          },
          {
            type: "vocab",
            word: "avalanche",
            q: "What does the word \"avalanche\" mean in this passage?",
            options: ["A stack of pancakes", "A big metal ladle", "Snow sliding downhill", "A loud Shambler moan"],
            answer: 2,
            hint: "Reread what happened when the whole drift let go."
          }
        ],
        choice: {
          prompt: "Grandpa Joe stirs the fire. \"Three ways down the mountain, and I've told stories about all of them.\"",
          options: [
            {
              label: "The switchback road",
              desc: "It zigzags slowly down the mountain, and the Shamblers get dizzy and give up before the third turn.",
              effects: { zombies: 0.7, length: 1.25 },
              result: "Back and forth, back and forth. Biscuit falls asleep by the fourth turn."
            },
            {
              label: "The sled run",
              desc: "Straight down and fast, with crates frozen in the snow, but big slow Shamblers fill the hill.",
              effects: { zombies: 1.2, brutes: 1.6, crates: 3, length: 0.8 },
              result: "The van skids, slides, and somehow stays upright. The crates crack free of the ice."
            },
            {
              label: "The foggy valley",
              desc: "The valley fog is thick as batter, but Joe left a stash of scrap by the old sign.",
              effects: { fog: true, zombies: 0.8, scrap: 15 },
              result: "You feel your way through the fog and find Joe's stash, right where he said."
            }
          ]
        }
      },
      {
        id: "g4-boat-dock",
        place: "Boat Dock",
        host: "Doc Lin",
        intro: "Doc Lin waves a damp envelope. \"My sister Mei lives out on Gull Island. Her letter got wet on the boat, and my glasses got wetter. Read it for me?\"",
        kind: "letter",
        title: "A Letter From Gull Island",
        text: "Dear Lin, Greetings from Gull Island, where it has rained for nine days straight. The lighthouse still works, the goats are still rude, and the ferry still runs on Tuesdays. That is how this letter reached you. We have a new problem, and it is a funny one. Three Shamblers floated over on a raft made of picnic tables. They cannot climb the dock ladder, so they just bob in the harbor and moan at the seagulls. The seagulls moan back. It is very loud.\n\nHere is my request. Please ask the Bookmobile to bring us a book about tying knots. Uncle Bo wants to build a better raft and tow the Shamblers back to the mainland. His last raft sank at the dock, and he says a proper knot would have saved it. I do not think a knot was the problem. I think the problem was the refrigerator he strapped to it.\n\nSend jam, send books, and send Biscuit if he will come. Your soggy sister, Mei.",
        questions: [
          {
            type: "detail",
            q: "How did the Shamblers get to Gull Island?",
            options: ["On the Tuesday ferry", "On a raft of picnic tables", "They swam across", "In Uncle Bo's boat"],
            answer: 1,
            hint: "Look at how the Shamblers arrived in the first paragraph."
          },
          {
            type: "inference",
            q: "Why does Mei think the knot was not the problem?",
            options: ["Uncle Bo ties great knots", "The raft was too small", "A fridge is too heavy", "The dock ladder was broken"],
            answer: 2,
            hint: "Read what Uncle Bo strapped to his last raft."
          },
          {
            type: "vocab",
            word: "mainland",
            q: "What does the word \"mainland\" mean in this passage?",
            options: ["The top of the lighthouse", "A tiny fishing boat", "The end of the dock", "The land across the water"],
            answer: 3,
            hint: "Mei lives on an island, so think about where Uncle Bo wants to tow the raft."
          }
        ],
        choice: {
          prompt: "Doc Lin folds the letter. \"The coast road splits at the pier. Which way, sailor?\"",
          options: [
            {
              label: "The beach road",
              desc: "Soft sand and slow going, but Shamblers hate sand between their toes, so it is nearly empty.",
              effects: { zombies: 0.7, length: 1.2 },
              result: "Sand hisses under the tires. A lone Shambler shakes out its shoe and wanders off."
            },
            {
              label: "The cliff road",
              desc: "Short and twisty, but wind blows Shamblers onto the road, and the fishermen pay for a delivery.",
              effects: { zombies: 1.4, scrap: 30, length: 0.85 },
              result: "The wind howls. Shamblers tumble across the road like beach balls and poof on the rocks."
            },
            {
              label: "The ferry",
              desc: "Uncle Bo's cousin will float the van across the bay, but the fog out there is famous.",
              effects: { fog: true, zombies: 0.9, length: 0.9, crates: 1 },
              result: "The ferry drops you on the far shore in thick white fog, plus a bonus crate from the deck."
            }
          ]
        }
      },
      {
        id: "g4-bakery",
        place: "Bakery",
        host: "Baker Benny",
        intro: "A flour-covered baker slides a card across the counter. \"Doc Lin wrote this recipe, and her handwriting is worse than her puns. Read it before the oven gets cold.\"",
        kind: "recipe",
        title: "Brave Bread",
        text: "Brave Bread, a recipe by Doc Lin. You will need three cups of flour, one spoon of salt, and one spoon of yeast. Add a cup of warm water. Warm means a bath for a baby, not a bath for a lobster. If the water is too hot, the yeast will not wake up. Then the bread stays flat and sad.\n\nStir everything together in a large bowl until it forms a shaggy lump. Knead it on the counter for ten minutes, pushing and folding, until it feels smooth and stretchy. This is a good job for anyone who is nervous, because you cannot punch dough too hard. Cover the bowl with a towel and let it rise for one hour. The dough should double in size.\n\nBake at 400 degrees for thirty minutes. The crust should be golden and sound hollow when you knock on it. Let it cool before slicing, or the inside will be gummy. Biscuit gets the first heel, and Grandpa Joe gets the second.",
        questions: [
          {
            type: "detail",
            q: "How long should the dough rise?",
            options: ["Ten minutes", "Thirty minutes", "One hour", "Two hours"],
            answer: 2,
            hint: "Look for the sentence about the towel."
          },
          {
            type: "inference",
            q: "What would happen if you used lobster-bath water?",
            options: ["The bread would be salty", "The bread would stay flat", "The dough would rise too much", "The crust would be too dark"],
            answer: 1,
            hint: "Figure out how hot lobster-bath water is, then find what that does to the yeast."
          },
          {
            type: "vocab",
            word: "knead",
            q: "What does the word \"knead\" mean in this passage?",
            options: ["Bake the dough", "Cut the dough", "Freeze the dough", "Push and fold the dough"],
            answer: 3,
            hint: "The sentence with the word describes what your hands do on the counter."
          }
        ],
        choice: {
          prompt: "Baker Benny hands you a warm loaf for the road. \"Three ways out of town, and I've delivered bread on all of them.\"",
          options: [
            {
              label: "The main street",
              desc: "Paved and calm, with a lookout on every roof, but it loops around every block in town.",
              effects: { zombies: 0.75, length: 1.2 },
              result: "You roll down Main Street slowly. Someone on a roof waves a wrench at you."
            },
            {
              label: "The delivery alley",
              desc: "Benny's shortcut is quick, with crates of day-old bread, but the smell draws Shamblers from blocks away.",
              effects: { zombies: 1.4, crates: 3, length: 0.85 },
              result: "Shamblers sniff the air and shuffle toward the bread smell. You grab the crates first."
            },
            {
              label: "The flour mill road",
              desc: "Dusty and dim, with flour clouds thick as fog, but the mill pays scrap for a delivery.",
              effects: { fog: true, scrap: 25, zombies: 0.9 },
              result: "Flour dust coats the windshield. The miller pays in scrap and one enormous sneeze."
            }
          ]
        }
      },
      {
        id: "g4-train-yard",
        place: "Train Yard",
        host: "Max and Mia",
        intro: "Max and Mia spread a crayon map across a railroad tie. \"We mapped every track in the yard. Mia drew it and Max wrote the key, so the words are a little wiggly.\"",
        kind: "map",
        title: "Train Yard Map Key",
        text: "The thick black lines are train tracks that still work. The thin gray lines are tracks that are rusted through. Do not drive on them, or the van will get stuck. A square with a roof is a shed. A square with an X is a locked shed. The round tower near the middle is the water tower for the old steam engines. Grandpa Joe says it leaks, which is why there is a pond under it now.\n\nTrains are drawn as long rectangles. The red train by the north gate is the one Captain Ruby fixed, and it runs. The blue train is just for sleeping in. The green train has a Shambler in the last car. It got on in the spring and cannot figure out how to get off. We bring it a sandwich on Fridays. The arrows show which way each track goes. Follow the arrows toward the east gate to leave the yard. If you follow them the other way, you end up in the pond.",
        questions: [
          {
            type: "detail",
            q: "Which train did Captain Ruby fix?",
            options: ["The blue train", "The green train", "The steam train", "The red train"],
            answer: 3,
            hint: "Look at the train parked by the north gate."
          },
          {
            type: "inference",
            q: "Which train would be the worst place to take a nap?",
            options: ["The red train", "The blue train", "The green train", "The steam engine"],
            answer: 2,
            hint: "Think about which train has a surprise passenger."
          },
          {
            type: "vocab",
            word: "rusted",
            q: "What does the word \"rusted\" mean in this passage?",
            options: ["Old, weak, and crumbly", "New and shiny", "Painted bright gray", "Covered with grass"],
            answer: 0,
            hint: "The sentence after the word says what happens if you drive on those tracks."
          }
        ],
        choice: {
          prompt: "Mia points at the east gate with a crayon. \"Three tracks lead out. Max says the middle one, but Max also eats crayons.\"",
          options: [
            {
              label: "The east gate road",
              desc: "Follow the arrows to a flat, quiet road, though it loops around the whole yard first.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "The arrows lead you out without a hitch. Mia was right, and she will not let Max forget it."
            },
            {
              label: "The freight track",
              desc: "Straight down the working rails: fast and bumpy, with spilled crates, but Shamblers nap in the boxcars.",
              effects: { zombies: 1.3, crates: 4, length: 0.85 },
              result: "The van rattles along the rails. Boxcar doors slide open and sleepy Shamblers stumble out behind you."
            },
            {
              label: "The tunnel track",
              desc: "A rail tunnel through the hill, pitch dark but very short, and the big Shamblers cannot fit inside.",
              effects: { night: true, length: 0.75, brutes: 0.5, zombies: 0.9 },
              result: "Headlights on. The tunnel walls flash past, and nothing big enough to worry about can follow you in."
            }
          ]
        }
      },
      {
        id: "g4-zoo-gate",
        place: "Zoo Gate",
        host: "Zookeeper Zed",
        intro: "A zookeeper in muddy boots hands you a notebook. \"Every day I write down what the animals and the Shamblers get up to. Read today's page so I know I'm not imagining it.\"",
        kind: "log",
        title: "Zoo Gate Daily Log",
        text: "Monday, Zoo Gate daily log, kept by Zookeeper Zed. Sunrise: Fed the penguins. Counted eleven, which is one more than yesterday. Either a penguin walked in from somewhere, or I cannot count. Mid-morning: Two Shamblers shuffled up to the gate and stood very still. The flamingos stood very still back. This went on for forty minutes. The flamingos won.\n\nNoon: Doc Lin arrived to check on the tortoise, who has been slow lately. Doc Lin says that is the normal speed for a tortoise. She also says I owe her lunch for the house call. Afternoon: A Shambler got into the petting zoo. The goats surrounded it and chewed its shoelaces until it poofed. The goats seemed proud. Evening: Counted the penguins again. Twelve. I am now fairly sure the penguins are up to something.\n\nNote for tomorrow: Ask the Bookmobile for a book about penguins, any book at all.",
        questions: [
          {
            type: "detail",
            q: "How long did the Shamblers and the flamingos stand still?",
            options: ["Ten minutes", "All afternoon", "Forty minutes", "Until noon"],
            answer: 2,
            hint: "Look at the mid-morning entry."
          },
          {
            type: "inference",
            q: "Why does Zed think the penguins are up to something?",
            options: ["They keep stealing fish", "Their number keeps growing", "They stare at the Shamblers", "They are learning to count"],
            answer: 1,
            hint: "Compare the penguin counts at sunrise and in the evening."
          },
          {
            type: "vocab",
            word: "surrounded",
            q: "What does the word \"surrounded\" mean in this passage?",
            options: ["Ran away from it", "Fed it some hay", "Hid behind it", "Gathered all around it"],
            answer: 3,
            hint: "Picture where the goats had to be to chew the Shambler's shoelaces."
          }
        ],
        choice: {
          prompt: "Zookeeper Zed unlocks the back gate. \"Three roads from the zoo, and one goes right past the penguins.\"",
          options: [
            {
              label: "The penguin path",
              desc: "A slow road around the penguin pool, nearly empty of Shamblers, because penguins find them boring.",
              effects: { zombies: 0.7, length: 1.15 },
              result: "Twelve penguins watch you pass. Make that thirteen, and you decide not to count again."
            },
            {
              label: "The safari road",
              desc: "Fast and rough through the old safari park, with leftover crates, but Shamblers roam it in herds.",
              effects: { zombies: 1.4, crates: 3, length: 0.9 },
              result: "Herds of Shamblers graze on the grass like confused cows. You weave through and collect every crate."
            },
            {
              label: "The reptile house",
              desc: "Zed's shortcut through the reptile house is dark and warm, and the tortoise promises it is short.",
              effects: { night: true, length: 0.8, zombies: 0.9 },
              result: "The reptile house is dark and steamy. The tortoise waves you through at its normal speed."
            }
          ]
        }
      },
      {
        id: "g4-ranger-station",
        place: "Ranger Station",
        host: "Ranger Ava",
        intro: "Ranger Ava pins a poster to the board and steps back. \"Somebody keeps stealing hats on the trail. I drew the suspect. Read the poster and tell me if it makes sense.\"",
        kind: "poster",
        title: "WANTED: The Hat Thief",
        text: "WANTED: The Hat Thief of Pine Ridge Trail. Over the past two weeks, seven hats have vanished from hikers' heads, including Ranger Ava's own lucky cap. The thief strikes near the picnic tables and always between noon and two. It leaves no footprints and no note. It does leave a small pile of acorn shells where the hat used to be.\n\nDescription: the size of a loaf of bread, with a big fluffy tail and cheeks full of acorns. Its face looks innocent, but it is not. Last seen scampering up the big oak with a sun hat in its mouth. Do not approach. Do not offer it a hat. It will take the hat. Do not try to climb the oak. The last hiker who tried is still up there, and we bring him sandwiches.\n\nReward: twenty scrap for every hat returned. One hundred scrap if you can teach it to read the NO HATS sign. Report sightings to Ranger Ava at the station. Bring your own hat, and hold on to it.",
        questions: [
          {
            type: "detail",
            q: "What does the thief leave behind?",
            options: ["A pile of acorn shells", "A small note", "Muddy footprints", "A sandwich"],
            answer: 0,
            hint: "Look at the end of the first paragraph."
          },
          {
            type: "inference",
            q: "What kind of animal is the Hat Thief most likely?",
            options: ["A bear", "A squirrel", "A bird", "A Shambler"],
            answer: 1,
            hint: "Use the description, the clues it leaves behind, and where it was last seen."
          },
          {
            type: "vocab",
            word: "vanished",
            q: "What does the word \"vanished\" mean in this passage?",
            options: ["Got bigger", "Turned green", "Disappeared", "Fell apart"],
            answer: 2,
            hint: "The hats were on hikers' heads, and now they are not."
          }
        ],
        choice: {
          prompt: "Ranger Ava hands you a spare hat. \"Three trails lead out of the park. Keep your hat on.\"",
          options: [
            {
              label: "The paved park road",
              desc: "Smooth, slow, and patrolled by rangers, so the Shamblers mostly stay in the woods.",
              effects: { zombies: 0.75, length: 1.2 },
              result: "Rangers wave from their trucks. Your hat stays firmly on your head."
            },
            {
              label: "The ridge trail",
              desc: "A bumpy shortcut over the ridge with crates at the campsite, but the Shamblers there are big.",
              effects: { zombies: 1.3, brutes: 1.5, crates: 3, length: 0.85 },
              result: "Big Shamblers plod across the trail and poof one by one. Something small and fluffy eyes your hat from the oak."
            },
            {
              label: "The creek crossing",
              desc: "The creek is shallow and the sandbar is full of scrap, but the water rattles the van.",
              effects: { hp: -10, scrap: 40, zombies: 0.9 },
              result: "Water sloshes up to the doors. The scrap on the sandbar is worth every rattle."
            }
          ]
        }
      },
      {
        id: "g4-old-lighthouse",
        place: "Old Lighthouse",
        host: "Keeper Nell",
        intro: "Keeper Nell blows dust off a little book. \"My diary. I write it by lamplight, and I can't read my own scrawl in the daylight. Read Thursday for me.\"",
        kind: "diary",
        title: "Keeper Nell's Diary",
        text: "Thursday. Windy, with waves the size of school buses. The lamp at the top needs cleaning every morning, because the seagulls think it is a giant egg. Today I found two of them sitting on it, looking very patient. I explained that it would never hatch. They did not believe me.\n\nAfter lunch, Captain Ruby came by to fix the generator. She said the trouble was a Shambler asleep on the switch in the engine room. When she poked it with a wrench, it said 'Brrrains?' very softly and poofed. The generator started right up. Ruby charged me one jar of pickles for the repair, which is her usual price.\n\nTonight the beam is sweeping the water again, bright as ever. Max and Mia say ships can see it from twenty miles away. I hope the Bookmobile can see it too. I have been saving a shelf of sea stories for whoever drives it. They deserve to be read.",
        questions: [
          {
            type: "detail",
            q: "What did Captain Ruby charge for the repair?",
            options: ["A jar of pickles", "Twenty scrap", "A sea story", "A giant egg"],
            answer: 0,
            hint: "Look at the end of the second paragraph."
          },
          {
            type: "inference",
            q: "Why does Nell hope the Bookmobile can see the beam?",
            options: ["She needs the generator fixed", "She is afraid of the dark", "She wants more pickles", "To have her books read"],
            answer: 3,
            hint: "Read what Nell has been saving, and who it is for."
          },
          {
            type: "vocab",
            word: "patient",
            q: "What does the word \"patient\" mean in this passage?",
            options: ["Very sick", "Willing to wait", "Angry and loud", "Ready to fly"],
            answer: 1,
            hint: "The seagulls are sitting on the lamp because they expect something to happen."
          }
        ],
        choice: {
          prompt: "Keeper Nell points the lamp down the coast. \"Two ways off the point. The beam reaches one of them.\"",
          options: [
            {
              label: "The lit coast road",
              desc: "The beam lights the whole road, so you see every Shambler coming, but it winds along every bay.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "The beam swings over the van every few seconds. The Shamblers squint and wander off."
            },
            {
              label: "The dark dune road",
              desc: "Short and beyond the beam's reach, with crates washed up on the sand, but you only have headlights.",
              effects: { night: true, crates: 3, length: 0.8, zombies: 1.1 },
              result: "Headlights on, you bump over the dunes. The crates glint in the beam of your own lights."
            }
          ]
        }
      }
    ],
    roadSigns: [
      {
        text: "Radio, Grandpa Joe: \"Fog on the river road until the sun burns it off. Headlights on and slow down.\"",
        q: "What should you do on the river road?",
        options: ["Speed up to beat the fog", "Turn on headlights and slow down", "Turn off the radio"],
        answer: 1
      },
      {
        text: "Sign on a water tower: \"MOON DINER, 8 miles. Pie is half price if you bring a book.\"",
        q: "How do you get half-price pie?",
        options: ["Bring a book", "Drive eight miles", "Order two slices"],
        answer: 0
      },
      {
        text: "Chalk on the road: \"Max and Mia were here. The bridge ahead is safe, but the one past it is NOT.\"",
        q: "Which bridge should you avoid?",
        options: ["The first bridge", "Both bridges", "The second bridge"],
        answer: 2
      },
      {
        text: "Hand-painted sign: \"Shambler crossing. They stop for nothing except a good song on the radio.\"",
        q: "What makes Shamblers stop at this crossing?",
        options: ["A good song", "A honking horn", "Bright headlights"],
        answer: 0
      },
      {
        text: "Radio, Doc Lin: \"If you see the big blue barn, you missed the turn. Go back one mile.\"",
        q: "What does seeing the blue barn mean?",
        options: ["You are almost there", "You missed the turn", "You should stop for gas"],
        answer: 1
      },
      {
        text: "Sign on a gate: \"Ranger Station closed for lunch, back at one. Do not feed the goats, no matter what they say.\"",
        q: "When will the station reopen?",
        options: ["At one", "At noon", "Tomorrow"],
        answer: 0
      },
      {
        text: "Painted on the highway: \"Scrap crates ahead, left lane only. Right lane is the Shambler nap zone.\"",
        q: "Which lane has the crates?",
        options: ["Right lane", "Both lanes", "Left lane"],
        answer: 2
      },
      {
        text: "Radio, Captain Ruby: \"Van sounding rattly? Pull in at the Fire Station, not the Gas-N-Go, because I moved my tools.\"",
        q: "Where should a rattly van go?",
        options: ["The Gas-N-Go", "The Fire Station", "The Moon Diner"],
        answer: 1
      }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
