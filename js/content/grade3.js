/* Grade 3 reading content for Zombie Survival Reading.
   Schema and calibration: docs/CONTENT_GUIDE.md. Validate with `npm test`. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[3] = {
    grade: 3,
    havens: [
      {
        id: "g3-gas-n-go",
        place: "Gas-N-Go",
        host: "Captain Ruby",
        intro: "Captain Ruby wipes her hands on a rag. \"New rules on the wall. Read them out loud so the twins stop arguing with me.\"",
        kind: "rules",
        title: "Garage Rules",
        text: "Welcome to the Gas-N-Go garage. Here are the rules, and I mean every one of them. Rule one: put every tool back on its hook when you are done. A tidy garage is a fast garage. Rule two: nobody drives a van with a flat tire. We keep a spare tire by the door, so use it. Rule three: Biscuit may not nap under the lift. He is a good dog, but he snores like a tractor.\n\nRule four: if a Shambler wanders in, do not panic. Honk the horn twice and it will shuffle right back out. Shamblers are not mean, just lost. The last rule is my favorite. Anyone who reads these rules out loud gets a free oil change. Yes, that means you. Signed, Captain Ruby.",
        questions: [
          {
            type: "detail",
            q: "What should you do if a Shambler wanders into the garage?",
            options: ["Hide under the lift", "Honk the horn twice", "Call Captain Ruby", "Give it a tire"],
            answer: 1,
            hint: "Look at rule four."
          },
          {
            type: "inference",
            q: "Why does Captain Ruby say a tidy garage is a fast garage?",
            options: ["Clean tools shine brighter", "Biscuit likes it clean", "Tools are easy to find", "Clean vans drive faster"],
            answer: 2,
            hint: "Think about what happens when every tool is back on its hook."
          },
          {
            type: "vocab",
            word: "spare",
            q: "What does the word \"spare\" mean in this passage?",
            options: ["A broken one", "A tiny one", "A red one", "An extra one"],
            answer: 3,
            hint: "Rule two says why the spare tire is kept by the door."
          }
        ],
        choice: {
          prompt: "Captain Ruby points at the map with a wrench. \"Three ways out. Pick one before Biscuit wakes up.\"",
          options: [
            {
              label: "The highway",
              desc: "It is wide and open with few Shamblers, but it is a long drive.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "The highway hums under your tires. Biscuit hangs his head out the window and grins."
            },
            {
              label: "The old quarry road",
              desc: "It is short and bumpy, with crates of scrap, but Shamblers nap there.",
              effects: { zombies: 1.3, crates: 3, length: 0.9 },
              result: "Rocks rattle under the van. A sleepy Shambler waves as you bounce past."
            },
            {
              label: "Through the car wash",
              desc: "The van comes out shiny, but the soap fog follows you down the road.",
              effects: { fog: true, hp: 10 },
              result: "Suds fly everywhere. The van sparkles, and a cloud of bubbles trails behind you."
            }
          ]
        }
      },
      {
        id: "g3-library-fort",
        place: "Library Fort",
        host: "Max and Mia",
        intro: "Max and Mia unroll a crayon map across the checkout desk. \"We drew the whole fort. Can you read the key? Max wrote it, and his letters wiggle.\"",
        kind: "map",
        title: "Map Key for Library Fort",
        text: "This is the map of Library Fort, drawn by Max and Mia. The key tells you what each mark means. A blue square is a door you can open. A red square is a door that is stuck, so do not try it. A green circle is a safe spot with snacks. A yellow star is the radio room, where Grandpa Joe sits. A paw print is Biscuit's bed, and he does not share it.\n\nThe wavy lines are the moat. It is only a kiddie pool, but Shamblers will not step in water. The dotted line is the secret path from the garage to the roof. Only the crew knows about it, so keep it quiet. If you see an X, dig there. Mia buried a jar of jellybeans, and she forgot which X is real.",
        questions: [
          {
            type: "detail",
            q: "What does a yellow star mean on the map?",
            options: ["A stuck door", "The radio room", "A snack spot", "Biscuit's bed"],
            answer: 1,
            hint: "Find the sentence about the yellow star."
          },
          {
            type: "inference",
            q: "Which mark should you follow to reach the roof without being seen?",
            options: ["The blue square", "The wavy lines", "The dotted line", "The yellow star"],
            answer: 2,
            hint: "Look for the path that only the crew knows about."
          },
          {
            type: "vocab",
            word: "moat",
            q: "What does the word \"moat\" mean in this passage?",
            options: ["Water around a fort", "A tall stone wall", "A hidden door", "A big flag"],
            answer: 0,
            hint: "Read what the wavy lines really are."
          }
        ],
        choice: {
          prompt: "Max and Mia point at three roads on their map. \"We drew them all. Which one?\"",
          options: [
            {
              label: "The paved road",
              desc: "Mia drew it straight and smooth, with few Shamblers, but it is long.",
              effects: { zombies: 0.8, length: 1.15 },
              result: "The road is as smooth as the map said. Mia waves until you are out of sight."
            },
            {
              label: "The bumpy farm road",
              desc: "Max drew lots of Shamblers on it, but also four crates of scrap.",
              effects: { zombies: 1.4, crates: 4 },
              result: "Max was right about the Shamblers. He was also right about the crates."
            },
            {
              label: "The tunnel",
              desc: "It is dark inside, but Max says it is short and empty.",
              effects: { night: true, zombies: 0.9, length: 0.8 },
              result: "You flick on the headlights. Your own echo is the only thing that follows you."
            }
          ]
        }
      },
      {
        id: "g3-moon-diner",
        place: "Moon Diner",
        host: "Doc Lin",
        intro: "Doc Lin slides a flour-dusted card across the counter. \"My pancakes keep coming out flat as a Shambler's brain. Read the recipe and tell me what I'm missing.\"",
        kind: "recipe",
        title: "Moon Pancakes",
        text: "You will need two cups of flour and two eggs. Add one cup of milk and a big spoon of honey. Last, add one spoon of baking powder. The baking powder is what makes the pancakes puff up like little moons. Mix the dry things in one bowl and the wet things in another. Then pour them together and stir, but only ten times. A lumpy batter makes a fluffy pancake.\n\nHeat the pan until a drop of water dances on it. Pour in a circle the size of your hand. When bubbles pop on top, flip it once. Do not flip it twice, no matter how much Biscuit begs. Stack them high, add butter, and eat them while the moon is still up. Makes eight pancakes, or four if Doc Lin is hungry.",
        questions: [
          {
            type: "detail",
            q: "How many times should you stir the batter?",
            options: ["Ten times", "Two times", "Eight times", "Four times"],
            answer: 0,
            hint: "Look at what to do right after you pour the two bowls together."
          },
          {
            type: "inference",
            q: "What would happen if you forgot the baking powder?",
            options: ["The pancakes would burn", "The pancakes would be sweet", "The pancakes would be lumpy", "The pancakes would be flat"],
            answer: 3,
            hint: "Think about what the baking powder does to the pancakes."
          },
          {
            type: "vocab",
            word: "batter",
            q: "What does the word \"batter\" mean in this passage?",
            options: ["A baseball player", "The pancake mix", "A hot pan", "A kind of honey"],
            answer: 1,
            hint: "The word comes right after the two bowls get stirred together."
          }
        ],
        choice: {
          prompt: "Doc Lin wipes the counter. \"Three ways out of town. Pick one before the syrup sets.\"",
          options: [
            {
              label: "The flat valley road",
              desc: "Few Shamblers and an easy drive, but it winds a long way around.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "The valley road is calm. Doc Lin's pancakes sit warm on the seat beside you."
            },
            {
              label: "The pass over the hills",
              desc: "Steep and short, with scrap at the top, but the Shamblers are bouncy.",
              effects: { zombies: 1.3, runners: 1.4, scrap: 30, length: 0.9 },
              result: "The van groans up the pass. Bouncy Shamblers poof like popcorn behind you."
            },
            {
              label: "The syrup factory road",
              desc: "The sweet air makes a sticky fog, but the factory pays in scrap.",
              effects: { fog: true, scrap: 20 },
              result: "Sweet fog rolls over the windshield. Biscuit licks the glass."
            }
          ]
        }
      },
      {
        id: "g3-radio-tower",
        place: "Radio Tower",
        host: "Grandpa Joe",
        intro: "Grandpa Joe hands you a clipboard with the pencil still tied to it. \"My eyes are tired from the dials. Read me yesterday's log, and don't skip the good parts.\"",
        kind: "log",
        title: "Radio Log, Tuesday",
        text: "6 AM: Tower is quiet. Coffee is hot. Biscuit is asleep on my feet. 8 AM: Captain Ruby calls from the Gas-N-Go. She needs a new fan belt. I tell her the Bookmobile is on the way. 10 AM: A strange signal on channel nine. Someone keeps saying 'brains' very slowly. I think a Shambler found a walkie-talkie. I say 'no thank you' and it stops. 11 AM: Max and Mia report a crate of books on the north road.\n\n1 PM: Doc Lin calls to tell a joke. What do you call a Shambler with a map? Lost anyway. I laugh so hard I knock over the coffee. 3 PM: Clouds to the west. I warn every haven to shut the windows. 5 PM: The Bookmobile reports in. I switch on the tower light and sign off.",
        questions: [
          {
            type: "detail",
            q: "What does Captain Ruby need?",
            options: ["A new fan belt", "A crate of books", "A cup of coffee", "A walkie-talkie"],
            answer: 0,
            hint: "Check the 8 AM entry."
          },
          {
            type: "inference",
            q: "Why does Grandpa Joe think a Shambler found a walkie-talkie?",
            options: ["Doc Lin told him so", "The voice only says 'brains'", "He saw one on the road", "The signal was very loud"],
            answer: 1,
            hint: "Read what the strange voice on channel nine keeps saying."
          },
          {
            type: "vocab",
            word: "signal",
            q: "What does the word \"signal\" mean in this passage?",
            options: ["A bright light", "A road sign", "A radio message", "A loud bell"],
            answer: 2,
            hint: "The signal comes in on channel nine, and someone is talking."
          }
        ],
        choice: {
          prompt: "Grandpa Joe taps the map on the wall. \"Which way, kiddo? I'll radio ahead.\"",
          options: [
            {
              label: "The north road",
              desc: "The twins saw a crate of books there, but they saw Shamblers too.",
              effects: { zombies: 1.3, crates: 2, scrap: 15 },
              result: "You find the crate right where the twins said. The Shamblers find you a moment later."
            },
            {
              label: "The west road",
              desc: "Clouds are rolling in that way, so it is gray and slow but empty.",
              effects: { zombies: 0.7, fog: true, length: 1.1 },
              result: "The clouds swallow the road. Grandpa Joe's voice on the radio keeps you company."
            }
          ]
        }
      },
      {
        id: "g3-red-barn",
        place: "Red Barn",
        host: "Farmer Pat",
        intro: "Farmer Pat pulls a note off a nail by the barn door. \"My helper Skip left this and ran off. I can read 'goat,' and that's about it.\"",
        kind: "note",
        title: "A Note From Skip",
        text: "Farmer Pat, I took the tractor. Do not be mad. Gus the goat chewed through the fence again. He went over the hill toward the pond. I saw him eat a hat on the way. I think it was yours. Biscuit went with me, so I am not alone. We will be back before the sun goes down.\n\nPlease feed the hens at noon if I am late. They get grumpy when they are hungry. The seed is in the red can, not the blue one. The blue can is nails. If a Shambler shows up, do not worry. Gus already scared one off this morning. He butted it right into the hay, and it poofed. That goat is a hero. Your friend, Skip.",
        questions: [
          {
            type: "detail",
            q: "Where is the hen seed kept?",
            options: ["In the blue can", "In the red can", "In the hay", "On the tractor"],
            answer: 1,
            hint: "Look at the part about feeding the hens."
          },
          {
            type: "inference",
            q: "Why does Skip say not to worry about Shamblers?",
            options: ["Biscuit is guarding the barn", "Shamblers never visit farms", "Gus can scare them off", "Farmer Pat has a big hat"],
            answer: 2,
            hint: "Think about what Gus did this morning."
          },
          {
            type: "vocab",
            word: "butted",
            q: "What did Gus do when he \"butted\" the Shambler?",
            options: ["Hit it with his head", "Licked it all over", "Sang it a song", "Ran away from it"],
            answer: 0,
            hint: "Picture where the Shambler ended up right after Gus butted it."
          }
        ],
        choice: {
          prompt: "Farmer Pat points past the pond. \"Three ways to the next haven. Mind the goat.\"",
          options: [
            {
              label: "Around the pond",
              desc: "A smooth dirt road with few Shamblers, but it loops the long way around.",
              effects: { zombies: 0.8, length: 1.2 },
              result: "Ducks scatter as you roll by. Somewhere on the hill, a goat burps."
            },
            {
              label: "Over the hill",
              desc: "Short and steep, but every Shambler Gus ever scared off lives up there.",
              effects: { zombies: 1.4, length: 0.85, scrap: 25 },
              result: "The van bounces over the hill. Gus the goat watches from a rock, chewing a hat."
            },
            {
              label: "The hay field",
              desc: "The hay bales hide crates, but the dust is as thick as fog.",
              effects: { fog: true, crates: 2 },
              result: "Hay dust fills the air. Biscuit sneezes seven times in a row."
            }
          ]
        }
      },
      {
        id: "g3-mini-golf-castle",
        place: "Mini-Golf Castle",
        host: "King Toby",
        intro: "A man in a cardboard crown bows low. \"I am King Toby of the Mini-Golf Castle. My royal poster is done, but is it any good? Read it to me, please.\"",
        kind: "poster",
        title: "Putt-Putt Party",
        text: "PUTT-PUTT PARTY at the Mini-Golf Castle! This Saturday, from noon until the stars come out. All eighteen holes are open, even the windmill. Bring your own putter or borrow one from the king. Prizes for the best score, the worst score, and the silliest hat. Doc Lin will serve lemonade, and Grandpa Joe will play music on the radio.\n\nRules of the castle: No running on the greens. No feeding the moat fish. If a Shambler wanders onto hole seven, let it finish. They are terrible at golf, but they try hard. The castle gate closes at dark, so do not dawdle. Cost to enter: one book for the Bookmobile. The royal library is nearly empty, and the king is bored. Come one, come all!",
        questions: [
          {
            type: "detail",
            q: "What does it cost to enter the party?",
            options: ["One book", "One putter", "One silly hat", "One lemonade"],
            answer: 0,
            hint: "Find the line that starts with 'Cost to enter.'"
          },
          {
            type: "inference",
            q: "Why does the king ask for books instead of scrap?",
            options: ["He sells them for scrap", "His library is almost empty", "Shamblers like to read", "He needs them for prizes"],
            answer: 1,
            hint: "Read the sentence right after the cost to enter."
          },
          {
            type: "vocab",
            word: "dawdle",
            q: "What does the word \"dawdle\" mean in this passage?",
            options: ["Run fast", "Shout loudly", "Move slowly", "Hide away"],
            answer: 2,
            hint: "The gate closes at dark, so think about what you should not do."
          }
        ],
        choice: {
          prompt: "King Toby waves his putter at the road. \"Which way shall you go, brave reader?\"",
          options: [
            {
              label: "The royal road",
              desc: "Smooth and well lit, with guards at each gate, but a long ride.",
              effects: { zombies: 0.7, length: 1.25 },
              result: "Cardboard guards salute as you pass. The road is long, but the view is royal."
            },
            {
              label: "The windmill shortcut",
              desc: "Fast and twisty, with scrap at the end, but the windmill spits out Shamblers.",
              effects: { zombies: 1.4, runners: 1.3, scrap: 30, length: 0.85 },
              result: "You zip past the windmill. Shamblers tumble out behind you and poof one after another."
            },
            {
              label: "Through the moat",
              desc: "The king pays you to splash through, but the water bangs up the van.",
              effects: { hp: -10, scrap: 35, zombies: 0.9 },
              result: "Splash! Fish scatter, the king cheers, and the van drips for a mile."
            }
          ]
        }
      },
      {
        id: "g3-school-bus-camp",
        place: "School Bus Camp",
        host: "Bus Driver Bea",
        intro: "Bus Driver Bea hands you an envelope covered in stickers. \"The kids wrote you a letter. They won't let me read it, so it's your job.\"",
        kind: "letter",
        title: "Dear Bookmobile",
        text: "Dear Bookmobile, We are the kids of School Bus Camp. There are nine of us, plus Biscuit when he visits. We live in three yellow buses parked in a circle. Bus One is for sleeping. Bus Two is for eating. Bus Three is for reading, but it is almost empty. We have read every book on it twice, even the one about rocks.\n\nWe heard you are coming our way. Please bring books about dragons, space, and dogs. Nora wants a joke book, and Sam wants a cookbook with pictures. We will trade you a jar of blueberry jam for each book. We made the jam ourselves, so it might be a little runny. Bus Driver Bea says you can park next to Bus Two for supper. Your friends, the Camp Kids.",
        questions: [
          {
            type: "detail",
            q: "Which bus is for reading?",
            options: ["Bus One", "Bus Two", "Bus Three", "Bea's bus"],
            answer: 2,
            hint: "Each bus has a job, so find the one with the books."
          },
          {
            type: "inference",
            q: "How do the kids probably feel about the book on rocks?",
            options: ["It is their favorite", "It is a bit boring", "It is about dragons", "It is brand new"],
            answer: 1,
            hint: "Look at the way the kids mention reading the rock book."
          },
          {
            type: "vocab",
            word: "trade",
            q: "What does the word \"trade\" mean in this passage?",
            options: ["Hide something", "Throw something", "Read something", "Swap something"],
            answer: 3,
            hint: "The kids will give jam, and they want something back for it."
          }
        ],
        choice: {
          prompt: "Bus Driver Bea unfolds a map on the hood. \"Two roads from camp. Choose wisely, and watch the jam.\"",
          options: [
            {
              label: "The school road",
              desc: "It is short and pays well, but Shamblers swing at the playground.",
              effects: { zombies: 1.3, length: 0.85, scrap: 20 },
              result: "Shamblers creak back and forth on the swings. One waves, and you wave back."
            },
            {
              label: "The lake road",
              desc: "Longer and quieter, with a few crates the kids left out for you.",
              effects: { zombies: 0.8, length: 1.15, crates: 2 },
              result: "The lake glitters. You spot the crates right where the kids said they would be."
            }
          ]
        }
      },
      {
        id: "g3-water-tower",
        place: "Water Tower",
        host: "Lookout Lou",
        intro: "Lookout Lou climbs down the ladder and hands you a page. \"I wrote down what happened last week. Everyone says I tell it wrong. You read it.\"",
        kind: "story",
        title: "The Day Biscuit Rang the Bell",
        text: "Last Tuesday, I was on top of the water tower, watching the road. The big bell hung next to me. One ring means 'all clear.' Two rings mean 'Shamblers coming.' Three rings mean 'lunch is ready.' I was so sleepy that I dozed off. While I snored, Biscuit climbed the ladder all by himself. Nobody knew a dog could do that.\n\nBiscuit saw six Shamblers shuffling up the road. He grabbed the bell rope in his teeth and pulled. Ring, ring! Down below, Captain Ruby heard it and started the van. She drove in circles until every Shambler got dizzy and poofed. Then Biscuit pulled the rope again, but only once. All clear. He got a whole sausage, and I got a bucket of cold water.",
        questions: [
          {
            type: "detail",
            q: "What do two rings of the bell mean?",
            options: ["All clear", "Shamblers coming", "Lunch is ready", "Biscuit is here"],
            answer: 1,
            hint: "Look at the list of what each number of rings means."
          },
          {
            type: "inference",
            q: "Why did Lookout Lou get a bucket of cold water?",
            options: ["To give to Biscuit", "To put out a fire", "For sleeping on the job", "To fill the tower"],
            answer: 2,
            hint: "Think about what Lou was doing when the Shamblers came."
          },
          {
            type: "vocab",
            word: "dozed",
            q: "What does the word \"dozed\" mean in this passage?",
            options: ["Fell down", "Ran away", "Rang the bell", "Fell asleep"],
            answer: 3,
            hint: "Lou was sleepy, and the next sentence says he snored."
          }
        ],
        choice: {
          prompt: "Lookout Lou points from the top of the tower. \"I can see all three roads from here. Here's what I see.\"",
          options: [
            {
              label: "The straight road",
              desc: "I see a long, flat, empty road with one Shambler asleep on it.",
              effects: { zombies: 0.7, length: 1.2 },
              result: "The road is as empty as Lou promised. The sleeping Shambler never even wakes up."
            },
            {
              label: "The ridge road",
              desc: "I see crates on the ridge, and big Shamblers guarding every one.",
              effects: { zombies: 1.2, brutes: 1.5, crates: 3, length: 0.9 },
              result: "Big Shamblers lumber toward the van. They are slow, and the crates are worth it."
            },
            {
              label: "The creek bed",
              desc: "I see a short rocky creek bed with crates, but rocks hurt tires.",
              effects: { hp: -10, crates: 2, length: 0.8, zombies: 0.9 },
              result: "Rocks clang under the van. You grab the crates and promise the tires a rest."
            }
          ]
        }
      }
    ],
    roadSigns: [
      {
        text: "Sign on a barn: \"Fresh eggs ahead. Honk twice and Farmer Pat will come out.\"",
        q: "How should you call Farmer Pat?",
        options: ["Ring a bell", "Honk twice", "Wave a flag"],
        answer: 1
      },
      {
        text: "Radio: \"Bridge is closed. Take the dirt road past the gas station.\"",
        q: "Which road should you take?",
        options: ["The dirt road", "The bridge", "The river road"],
        answer: 0
      },
      {
        text: "Sign: \"SLOW, Shamblers crossing. They will not move faster if you honk.\"",
        q: "What should you do here?",
        options: ["Honk loudly", "Speed up", "Slow down"],
        answer: 2
      },
      {
        text: "Chalk on the road: \"Max and Mia were here. Crates are hidden behind the blue mailbox.\"",
        q: "Where are the crates?",
        options: ["Behind the blue mailbox", "Under the bridge", "Inside the gas station"],
        answer: 0
      },
      {
        text: "Note taped to a pump: \"This pump is empty. The one by the ice machine still works.\"",
        q: "Which pump works?",
        options: ["The first pump", "The one by the ice machine", "None of the pumps"],
        answer: 1
      },
      {
        text: "Radio: \"Doc Lin here, fog on the coast road until noon. Keep your lights on.\"",
        q: "What should you keep on?",
        options: ["Your hat", "Your radio", "Your lights"],
        answer: 2
      },
      {
        text: "Sign on a diner: \"Pie is free for anyone who reads this out loud.\"",
        q: "How do you get free pie?",
        options: ["Pay with scrap", "Read the sign out loud", "Bring a book"],
        answer: 1
      },
      {
        text: "Painted on a water tower: \"Next haven: 12 miles. Last gas for 30 miles.\"",
        q: "How far is the next haven?",
        options: ["12 miles", "30 miles", "3 miles"],
        answer: 0
      }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
