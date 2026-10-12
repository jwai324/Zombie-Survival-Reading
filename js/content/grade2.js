/* Grade 2 reading content for Zombie Survival Reading.
   See docs/CONTENT_GUIDE.md. Validate with: node tests/validate-content.js 2 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[2] = {
    grade: 2,
    havens: [
      {
        id: "g2-library-fort",
        place: "Library Fort",
        host: "Ms. Page",
        intro: "A woman with a pencil in her hair peeks over a wall of books. \"Welcome to Library Fort! We have rules, but my glasses broke. Could you read them to the new kids?\"",
        kind: "rules",
        title: "Library Fort Rules",
        text: "1. Do not pull books from the walls. The walls are made of books! If you pull one, the wall may fall.\n2. Read quietly in the fort. Biscuit is the only one who may snore.\n3. Put each book back where you found it.\n4. If a Shambler knocks, do not open the door. Read him a poem through the mail slot. Shamblers get bored and wander off.\n5. Share the good books. Do not hide them under your bed.",
        questions: [
          { type: "detail", q: "What are the walls made of?", options: ["Bricks", "Books", "Boxes"], answer: 1, hint: "Look at rule one." },
          { type: "inference", q: "Why should you read a poem to a Shambler at the door?", options: ["So he learns to read", "So he falls asleep", "So he gets bored and leaves"], answer: 2, hint: "Rule four tells you what Shamblers do when they hear a poem." },
          { type: "vocab", word: "wander", q: "What does the word \"wander\" mean here?", options: ["Walk off slowly", "Run very fast", "Sit down hard"], answer: 0, hint: "Rule four says what bored Shamblers do." }
        ],
        choice: {
          prompt: "Ms. Page says there are three ways out of the fort.",
          options: [
            { label: "The book tunnel", desc: "It is long and twisty, but no Shamblers know about it.", effects: { zombies: 0.6, length: 1.3 }, result: "The tunnel is lined with comic books. Biscuit tries to read one." },
            { label: "The front steps", desc: "It is fast, but Shamblers line up there to return their books.", effects: { zombies: 1.4, length: 0.9, scrap: 25 }, result: "Shamblers hold up overdue books. You poof them and keep the books." },
            { label: "The reading garden", desc: "It is pretty and has crates, but the sprinklers make a mist.", effects: { zombies: 1.0, fog: true, crates: 2 }, result: "Sprinklers hiss and rainbows pop up in the mist. Two crates sit by the roses." }
          ]
        }
      },
      {
        id: "g2-fire-station",
        place: "Fire Station",
        host: "Captain Ruby",
        intro: "Captain Ruby slides out from under a fire truck. \"Max keeps the garage log for me. His writing is tiny. Read me Monday so I know what got done.\"",
        kind: "log",
        title: "Garage Log, Monday",
        text: "8:00. Captain Ruby fixed the fire truck horn. It now plays a song.\n\n9:30. A Shambler bumped into the big red door. Biscuit barked once. The Shambler said sorry and left.\n\n11:00. Doc Lin patched the van tire. She made a joke about it being tired. Nobody laughed. She laughed.\n\n1:00. The crew ate lunch on the fire truck. Mia dropped her sandwich down the pole. Biscuit found it at the bottom. Lucky dog.\n\n3:00. Ruby filled the van with gas. Ready to roll!",
        questions: [
          { type: "detail", q: "What did Mia drop down the pole?", options: ["Her sandwich", "Her map", "Her hat"], answer: 0, hint: "Look at the 1:00 entry." },
          { type: "inference", q: "Who thought Doc Lin's joke was funny?", options: ["Everyone", "Only Doc Lin", "Only Biscuit"], answer: 1, hint: "Read who laughed after the tire joke." },
          { type: "vocab", word: "patched", q: "What does the word \"patched\" mean here?", options: ["Fixed", "Popped", "Painted"], answer: 0, hint: "Doc Lin did this to the tire so the van could go." }
        ],
        choice: {
          prompt: "Ruby says the fire truck road splits in two.",
          options: [
            { label: "The hose road", desc: "It is wet and slow, and Shamblers slip right off it.", effects: { zombies: 0.7, length: 1.1 }, result: "Water sprays the road. Shamblers slide away like penguins." },
            { label: "The siren road", desc: "It is short, but the horn song calls every fast Shambler in town.", effects: { zombies: 1.3, runners: 1.5, length: 0.8, scrap: 30 }, result: "The horn plays its song. Shamblers come dancing. Poof, poof, poof!" }
          ]
        }
      },
      {
        id: "g2-water-tower",
        place: "Water Tower",
        host: "Max and Mia",
        intro: "Max and Mia climb down the water tower ladder with a rolled-up map. \"We drew the whole valley from up top! Mia wrote the key. Can you read it so Max stops guessing?\"",
        kind: "map",
        title: "The Twins' Map",
        text: "The big blue circle is the water tower. The wavy blue line is Frog Creek. Do not drink from it. The frogs do. The brown line is the dirt road to town. The black line is the train track. No trains run now, so crossing is safe.\n\nThe green blobs are Shamblers. We counted nine. Most were stuck in mud by the creek. The gold stars are crates. We found three. The smudge is Biscuit. He would not sit still for his picture.",
        questions: [
          { type: "detail", q: "How many Shamblers did the twins count?", options: ["Nine", "Three", "Six"], answer: 0, hint: "Find the line right after the green blobs." },
          { type: "inference", q: "Why is Biscuit a smudge on the map?", options: ["He fell in the mud", "He kept moving", "He is very small"], answer: 1, hint: "Read what Biscuit would not do." },
          { type: "vocab", word: "smudge", q: "What does the word \"smudge\" mean here?", options: ["A small dog", "A gold star", "A messy mark"], answer: 2, hint: "It is what you get when a drawing gets rubbed." }
        ],
        choice: {
          prompt: "The twins point at three lines on the map.",
          options: [
            { label: "The dirt road", desc: "It is plain and long, and the Shamblers are busy in the mud.", effects: { zombies: 0.7, length: 1.2 }, result: "Dust puffs behind the van. The mud Shamblers wave goodbye." },
            { label: "The train track", desc: "It is bumpy and Shamblers wait there, but so do three crates.", effects: { zombies: 1.3, crates: 3, hp: -5 }, result: "Bump, bump, bump. The crates are worth it. Mia marks them off the map." },
            { label: "Frog Creek", desc: "It is shallow and quick, but the splash fogs up the windows.", effects: { fog: true, length: 0.9, scrap: 10 }, result: "Splash! Frogs ride on the hood. You can barely see the road." }
          ]
        }
      },
      {
        id: "g2-drive-in-theater",
        place: "Drive-In Theater",
        host: "Doc Lin",
        intro: "Doc Lin stands by the big screen with a bucket of popcorn. \"Grandpa Joe told this story on the radio. I wrote it down fast, and now I can't read my own writing. Help?\"",
        kind: "story",
        title: "The Shamblers See a Movie",
        text: "Last Friday we showed a cartoon at the drive-in. Biscuit got the best seat, right on the hood.\n\nHalfway through, six Shamblers shuffled in. They did not have tickets. They sat in the back row and watched. Then the cartoon duck slipped on a banana. The Shamblers laughed! It sounded like, \"Brrr-ha-ha.\" They laughed so hard they fell over. Poof, poof, poof, poof, poof, poof. Six puffs of green smoke floated away.\n\nGrandpa Joe said it was the best movie ever. We all got extra popcorn.",
        questions: [
          { type: "detail", q: "Where did Biscuit sit?", options: ["In the back row", "By the screen", "On the hood"], answer: 2, hint: "Look at the first part of the story." },
          { type: "inference", q: "Why did the Shamblers poof?", options: ["They laughed too hard", "The duck chased them", "Doc Lin shooed them"], answer: 0, hint: "Read what happened right before the poofs." },
          { type: "vocab", word: "shuffled", q: "What does the word \"shuffled\" mean here?", options: ["Ran quickly", "Walked slowly", "Jumped high"], answer: 1, hint: "It is how slow Shamblers move their feet." }
        ],
        choice: {
          prompt: "Doc Lin points past the big screen.",
          options: [
            { label: "The popcorn road", desc: "It is quick, but the big slow Shamblers love the smell of butter.", effects: { zombies: 1.2, brutes: 1.5, length: 0.9, scrap: 25 }, result: "The whole road smells like butter. Big Shamblers follow their noses. Poof!" },
            { label: "The back lot", desc: "It is long and dull, and nothing much happens there.", effects: { zombies: 0.7, length: 1.2 }, result: "You bump over speaker poles for a mile. Biscuit snores the whole way." }
          ]
        }
      },
      {
        id: "g2-mini-golf-castle",
        place: "Mini-Golf Castle",
        host: "Queen Nell",
        intro: "A woman in a paper crown leans on a putter. \"I am Queen Nell of the Mini-Golf Castle. Someone taped a poster to my drawbridge. Read it and tell me if it is good news.\"",
        kind: "poster",
        title: "Big Mini-Golf Contest!",
        text: "Saturday at noon, at the Mini-Golf Castle.\n\nAll kids may play. All dogs may play too. Bring your own ball. If you have no ball, ask Queen Nell. She has a bucket of them.\n\nThe hardest hole is the dragon. His mouth opens and shuts. Hit the ball when the mouth is open! Shamblers are not allowed. They keep eating the balls.\n\nFirst prize is a golden putter. Second prize is a pie from the bakery. Everyone gets lemonade. Come and play!",
        questions: [
          { type: "detail", q: "What is first prize?", options: ["A golden putter", "A pie", "Lemonade"], answer: 0, hint: "Look near the end for the word first." },
          { type: "inference", q: "Why are Shamblers not allowed?", options: ["They are too slow", "They have no money", "They eat the balls"], answer: 2, hint: "Read what Shamblers keep doing." },
          { type: "vocab", word: "allowed", q: "What does the word \"allowed\" mean here?", options: ["Very loud", "Let in", "Given a prize"], answer: 1, hint: "Think about why the poster says Shamblers are not this." }
        ],
        choice: {
          prompt: "Queen Nell lowers the drawbridge. Which way?",
          options: [
            { label: "The dragon hole", desc: "It is a shortcut through the dragon, but his mouth might bonk the van.", effects: { zombies: 1.0, hp: -10, scrap: 30, length: 0.8 }, result: "The mouth shuts. Bonk! But you grab a pile of scrap inside." },
            { label: "The windmill lane", desc: "It is long and gentle, and the windmill blows the Shamblers away.", effects: { zombies: 0.7, length: 1.2 }, result: "Whoosh! The windmill spins. Shamblers roll off like tumbleweeds." },
            { label: "The lemonade stand", desc: "You stop to help, and Nell fixes a dent, but Shamblers line up for lemonade too.", effects: { hp: 10, zombies: 1.2 }, result: "Queen Nell hammers out a dent while you pour. Shamblers wait in line. Politely." }
          ]
        }
      },
      {
        id: "g2-boat-dock",
        place: "Boat Dock",
        host: "Skipper Ann",
        intro: "A woman in a yellow raincoat holds up a glass bottle. \"I am Skipper Ann. This washed up under the dock this morning. There is a letter inside. Read it to me?\"",
        kind: "letter",
        title: "A Letter in a Bottle",
        text: "Dear Driver,\n\nWe are at the Old Lighthouse. Grandpa Joe is here too. The beach road is washed out. Do not take it! Take the hill road instead. Look for a yellow flag on a pole. That is the turn.\n\nBiscuit wears a tiny life jacket now. He tries to chew it off. We saw a Shambler on the beach. He tried to eat a crab. The crab pinched his nose. Poof! Hurry up, Grandpa Joe made soup.\n\nLove,\nMax and Mia",
        questions: [
          { type: "detail", q: "What should you look for at the turn?", options: ["A red barn", "A yellow flag", "A big rock"], answer: 1, hint: "Find the line about the pole." },
          { type: "inference", q: "Why did the Shambler on the beach poof?", options: ["The crab pinched him", "Biscuit bit him", "He fell in the sea"], answer: 0, hint: "Read what the crab did." },
          { type: "vocab", word: "pinched", q: "What does the word \"pinched\" mean here?", options: ["Kissed softly", "Pushed away", "Squeezed hard"], answer: 2, hint: "It is what a crab does with its claw." }
        ],
        choice: {
          prompt: "Skipper Ann points up the coast. Which road?",
          options: [
            { label: "The hill road", desc: "It is long and bendy, but it is the road the twins said to take.", effects: { zombies: 0.8, length: 1.2 }, result: "You spot the yellow flag and turn. Grandpa Joe's soup is still hot." },
            { label: "The beach road", desc: "It is short, but it is washed out, and the waves splash the van.", effects: { zombies: 1.2, hp: -10, scrap: 30, length: 0.8 }, result: "Waves slosh over the hood, but you find a pile of washed-up scrap. Crabs ride along. Pinch, poof, pinch, poof." }
          ]
        }
      },
      {
        id: "g2-radio-tower",
        place: "Radio Tower",
        host: "Grandpa Joe",
        intro: "Grandpa Joe pats the chair next to his radio. \"I keep a diary up here. My handwriting looks like a chicken walked on it. Read me Tuesday, would you?\"",
        kind: "diary",
        title: "Grandpa Joe's Diary",
        text: "Tuesday\n\nThe radio crackled, and then I heard Doc Lin. She told three puns about tires. I only laughed at one.\n\nAt lunch a Shambler stood under the tower. He moaned, \"Brrrains?\" I lowered a sandwich on a string. He sniffed it and said, \"Brrrread?\" Then he sat down and ate the whole thing. I think he was just hungry.\n\nLater I played the Bookmobile song on the radio. Max and Mia called in to sing along. Biscuit howled. It was the best part of my day.",
        questions: [
          { type: "detail", q: "What did Grandpa Joe lower on a string?", options: ["A radio", "A book", "A sandwich"], answer: 2, hint: "Look at the part about lunch." },
          { type: "inference", q: "Why did the Shambler say \"Brrrread?\"", options: ["He wanted to sing", "He smelled the sandwich", "He saw the radio"], answer: 1, hint: "Read what he did right before he spoke." },
          { type: "vocab", word: "crackled", q: "What does the word \"crackled\" mean here?", options: ["Made a popping sound", "Turned bright red", "Fell off the wall"], answer: 0, hint: "It is the sound an old radio makes before a voice comes through." }
        ],
        choice: {
          prompt: "Grandpa Joe checks the radio for the roads.",
          options: [
            { label: "The valley road", desc: "It is long and quiet, and the radio says the Shamblers all went to lunch.", effects: { zombies: 0.6, length: 1.3 }, result: "The road hums. Grandpa Joe plays your song the whole way." },
            { label: "The ridge road", desc: "It is short and windy, and the wind blows fast Shamblers up there, but crates too.", effects: { zombies: 1.2, runners: 1.5, length: 0.9, crates: 3 }, result: "Wind whistles over the ridge. Three crates glint in the sun." }
          ]
        }
      },
      {
        id: "g2-mountain-lodge",
        place: "Mountain Lodge",
        host: "Cook Ozzie",
        intro: "A round man in a flannel shirt stirs a giant pot. \"I am Ozzie. I cook for anyone who climbs this high. Doc Lin wrote down her cocoa recipe. Read it so I do not mess it up again.\"",
        kind: "recipe",
        title: "Doc Lin's Cocoa for a Crowd",
        text: "Get a big pot and eight cups of milk. Pour the milk into the pot. Warm it slowly. Do not let it boil, or it will foam over. Stir in half a cup of cocoa. Stir in half a cup of sugar. Keep stirring until it is smooth and brown.\n\nPour it into mugs. Drop six marshmallows in each mug. Seven if someone was brave today. Serve it hot, but blow first! Biscuit gets a dog treat, not cocoa. Cocoa is bad for dogs.",
        questions: [
          { type: "detail", q: "How many marshmallows go in each mug?", options: ["Eight", "Six", "Two"], answer: 1, hint: "Look at the line about mugs." },
          { type: "inference", q: "Why should you warm the milk slowly?", options: ["So it does not foam over", "So it turns brown faster", "So it gets nice and cold"], answer: 0, hint: "Read what happens if the milk boils." },
          { type: "vocab", word: "smooth", q: "What does the word \"smooth\" mean here?", options: ["Very cold", "Full of bubbles", "With no lumps"], answer: 2, hint: "You keep stirring until the cocoa looks this way." }
        ],
        choice: {
          prompt: "Ozzie points down the mountain. Which way?",
          options: [
            { label: "The switchback road", desc: "It zigzags down slowly, and the Shamblers get dizzy and give up.", effects: { zombies: 0.7, length: 1.2 }, result: "Left, right, left, right. Biscuit's ears flap at every turn." },
            { label: "The steep road", desc: "It goes straight down, which is fast, but the brakes get hot.", effects: { zombies: 1.1, length: 0.7, hp: -10, scrap: 25 }, result: "The van flies down the slope. The brakes squeal. Ozzie's cocoa sloshes." },
            { label: "The sled run", desc: "The van slides down the snow, which is fun, but the spray hides the road.", effects: { fog: true, length: 0.8, crates: 2 }, result: "Snow sprays everywhere! Max yells, \"Crate!\" and you bump right over it." }
          ]
        }
      }
    ],
    roadSigns: [
      { text: "Sign: \"Fire Station, 1 mile. Honk twice at the gate.\"", q: "What should you do at the gate?", options: ["Honk twice", "Stop and wait", "Turn around"], answer: 0 },
      { text: "Radio: \"Grandpa Joe here: Shamblers are napping at the bridge. Tiptoe the van across.\"", q: "What are the Shamblers doing at the bridge?", options: ["Dancing", "Napping", "Fishing"], answer: 1 },
      { text: "Sign on a barn: \"Fresh eggs! Leave your scrap in the can, thanks.\"", q: "Where should you leave the scrap?", options: ["In the barn", "On the road", "In the can"], answer: 2 },
      { text: "Road sign: \"Detour: the tunnel is full of bees. Use Oak Street.\"", q: "Why is the tunnel closed?", options: ["It is full of bees", "It is too dark", "It fell down"], answer: 0 },
      { text: "Radio: \"Doc Lin here: grab the crate by the big oak. It has the band-aids.\"", q: "What is in the crate?", options: ["Books", "Band-aids", "Beans"], answer: 1 },
      { text: "Sign on a gas pump: \"Pump is slow. Count to one hundred, then it works.\"", q: "How do you make the pump work?", options: ["Count to one hundred", "Hit it twice", "Call Captain Ruby"], answer: 0 },
      { text: "Chalk on the road: \"Mia was here. Crates are hidden behind the water tower.\"", q: "Where are the crates?", options: ["Under the bridge", "In the van", "Behind the water tower"], answer: 2 },
      { text: "Sign: \"Mall Rooftop Camp: the elevator is broken. Take the ramp.\"", q: "How do you get to the roof?", options: ["The elevator", "The ramp", "The stairs"], answer: 1 }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
