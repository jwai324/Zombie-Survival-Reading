/* Grade 1 reading content for Zombie Survival Reading.
   See docs/CONTENT_GUIDE.md. Validate with: node tests/validate-content.js 1 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[1] = {
    grade: 1,
    havens: [
      {
        id: "g1-red-barn",
        place: "Red Barn",
        host: "Captain Ruby",
        intro: "Captain Ruby wipes her hands on a rag. \"Biscuit left a note on the barn door. Doc Lin wrote it for him. He is a dog. Can you read it to me?\"",
        kind: "note",
        title: "A Note From Biscuit",
        text: "Hi, pal! I am in the barn. I dig a hole by the door. I hide six bones in it. Do not step there! The hay is soft. I nap on the hay. Come find me. Bring a snack. Woof!\n\nLove, Biscuit",
        questions: [
          { type: "detail", q: "How many bones does Biscuit hide?", options: ["Four bones", "Ten bones", "Six bones"], answer: 2, hint: "Look for the number in the line about bones." },
          { type: "inference", q: "Why does Biscuit say not to step there?", options: ["The hole is there", "The hay is wet", "The door is shut"], answer: 0, hint: "Think about what Biscuit digs right before that line." },
          { type: "vocab", word: "nap", q: "What does the word \"nap\" mean here?", options: ["A fast run", "A loud bark", "A short sleep"], answer: 2, hint: "Biscuit does this on the soft hay." }
        ],
        choice: {
          prompt: "Captain Ruby points at two roads. Which one?",
          options: [
            { label: "The farm road", desc: "It is flat and slow, and few Shamblers walk on it.", effects: { zombies: 0.8, length: 1.1 }, result: "The farm road is calm. Biscuit sticks his head out the window." },
            { label: "The corn road", desc: "It is short, but Shamblers hide in the corn, and so do crates.", effects: { zombies: 1.3, length: 0.9, crates: 3 }, result: "Corn stalks slap the van. Three crates sit in the road!" }
          ]
        }
      },
      {
        id: "g1-gas-n-go",
        place: "Gas-N-Go",
        host: "Max and Mia",
        intro: "Max and Mia run up with a crayon list. \"We made a list for the trip! Can you read it? We want to see if we got it all.\"",
        kind: "list",
        title: "Trip List",
        text: "1. Gas for the van.\n2. Ten cans of beans.\n3. Dog food for Biscuit.\n4. One big jug of water.\n5. Six books to read.\n6. A hat for Grandpa Joe.\n\nMax packs the food. Mia packs the books. Biscuit packs nothing. He is a dog.",
        questions: [
          { type: "detail", q: "How many cans of beans are on the list?", options: ["Six cans", "One can", "Ten cans"], answer: 2, hint: "Find the line about beans." },
          { type: "inference", q: "Who packs the beans?", options: ["Max", "Mia", "Biscuit"], answer: 0, hint: "Beans are food, so look for who packs the food." },
          { type: "vocab", word: "jug", q: "What does the word \"jug\" mean here?", options: ["A kind of bean", "A big bottle", "A soft bed"], answer: 1, hint: "It holds the water for the trip." }
        ],
        choice: {
          prompt: "The van is full of gas. Which way out of town?",
          options: [
            { label: "Main Street", desc: "It is wide and bright, but lots of Shamblers shop there.", effects: { zombies: 1.3, scrap: 25 }, result: "You roll down Main Street. Shamblers bump into shop doors. Poof, poof!" },
            { label: "The back lane", desc: "It is thin and long, and no one goes there.", effects: { zombies: 0.7, length: 1.2 }, result: "The back lane is quiet. Mia draws the way on her map." },
            { label: "The car wash", desc: "It is fast and soapy, but the bubbles make it hard to see.", effects: { fog: true, hp: 10, length: 0.9 }, result: "Bubbles fly everywhere! You can barely see, but the van sparkles." }
          ]
        }
      },
      {
        id: "g1-bakery",
        place: "Bakery",
        host: "Doc Lin",
        intro: "Doc Lin holds up a card with flour on it. \"I want to bake buns for the crew. But I got flour on my glasses. Can you read the card?\"",
        kind: "recipe",
        title: "Sun Buns",
        text: "Get milk, two eggs, flour, and honey. Mix the milk and eggs. Add the flour. Stir it well. Add the honey last. Make six round balls. Bake them till they are gold. Let them cool. Then eat them with Biscuit. He loves buns! Share with a pal.",
        questions: [
          { type: "detail", q: "What do you add last?", options: ["The milk", "The honey", "The eggs"], answer: 1, hint: "Find the line with the word last." },
          { type: "inference", q: "Why do you let the buns cool?", options: ["They are wet", "They are hot", "They are cold"], answer: 1, hint: "Think about what the buns feel like right after baking." },
          { type: "vocab", word: "stir", q: "What does the word \"stir\" mean here?", options: ["Mix it around", "Cut it up", "Throw it out"], answer: 0, hint: "You do this with a spoon after you add the flour." }
        ],
        choice: {
          prompt: "Doc Lin packs two bags of buns. Which road?",
          options: [
            { label: "The hill road", desc: "It is short and steep, and Shamblers roll down hills.", effects: { zombies: 1.3, length: 0.9, scrap: 20 }, result: "Shamblers tumble down the hill like green balls. Poof!" },
            { label: "The lake road", desc: "It is long and flat, and only cows live out there.", effects: { zombies: 0.7, length: 1.2 }, result: "Cows moo at the van. Biscuit moos back. Sort of." }
          ]
        }
      },
      {
        id: "g1-toy-shop",
        place: "Toy Shop",
        host: "Grandpa Joe",
        intro: "Grandpa Joe sits in a big chair by the toy shelf. \"I wrote a tale for the kids. My eyes are tired. You read it to them.\"",
        kind: "story",
        title: "The Shambler and the Yo-Yo",
        text: "A Shambler walks into the toy shop. He sees a red yo-yo. He picks it up. The yo-yo goes down. The yo-yo comes up. It bops him on the nose! Poof! He turns into green smoke. The yo-yo falls on the rug. Max picks it up. Now it is his.",
        questions: [
          { type: "detail", q: "What color is the yo-yo?", options: ["Green", "Red", "Blue"], answer: 1, hint: "Look at the line where the Shambler sees it." },
          { type: "inference", q: "Why does the Shambler poof?", options: ["Max yells at him", "He trips on the rug", "The yo-yo hits him"], answer: 2, hint: "Think about what happens right before the poof." },
          { type: "vocab", word: "bops", q: "What does the word \"bops\" mean here?", options: ["Hits", "Hugs", "Hides"], answer: 0, hint: "Think about what a yo-yo does when it comes up fast." }
        ],
        choice: {
          prompt: "Grandpa Joe points out the shop window. Which road?",
          options: [
            { label: "The bridge road", desc: "It is fast, but lots of Shamblers nap on the bridge.", effects: { zombies: 1.4, length: 0.9, scrap: 30 }, result: "The Shamblers wake up and bump into each other. Poof, poof, poof!" },
            { label: "The river road", desc: "It is slow and safe, and Biscuit likes the ducks.", effects: { zombies: 0.8, length: 1.2 }, result: "The van hums by the river. Biscuit counts the ducks. He gets to three." }
          ]
        }
      },
      {
        id: "g1-school-bus-camp",
        place: "School Bus Camp",
        host: "Bus Driver Bea",
        intro: "A tall woman with a whistle waves you over. \"I am Bea. I drive the bus. The kids need to hear the rules. Can you read them out loud?\"",
        kind: "rules",
        title: "Bus Camp Rules",
        text: "1. Sit in your seat.\n2. No yelling on the bus.\n3. Pets ride in the back. Yes, Biscuit, you too.\n4. Share your snacks.\n5. If you see a Shambler, say \"Beep!\" Bea will honk the horn. Shamblers do not like the horn.\n6. Have fun. We are a team.",
        questions: [
          { type: "detail", q: "Where do pets ride?", options: ["In the back", "In the front", "On the roof"], answer: 0, hint: "Find the rule about pets." },
          { type: "inference", q: "Why does Bea honk the horn?", options: ["To say hi to Biscuit", "To wake up the kids", "To make Shamblers go away"], answer: 2, hint: "Read what rule five says Shamblers think of the horn." },
          { type: "vocab", word: "share", q: "What does the word \"share\" mean here?", options: ["Give some to others", "Eat them all up", "Hide them away"], answer: 0, hint: "Rule four is about snacks and friends." }
        ],
        choice: {
          prompt: "Bea starts the bus. What do we do?",
          options: [
            { label: "Follow the bus", desc: "The bus is slow, but its horn sends Shamblers away.", effects: { zombies: 0.7, length: 1.1 }, result: "Beep! Beep! The bus clears the road. You just follow along." },
            { label: "Race ahead", desc: "You get there fast, but no horn helps you.", effects: { zombies: 1.3, length: 0.8, scrap: 20 }, result: "You zoom past the bus. The kids wave from the windows." },
            { label: "The dirt road", desc: "It is dusty and hard to see, but crates sit out there.", effects: { zombies: 1.0, fog: true, crates: 3 }, result: "Dust puffs up all around. Cough! But look, three crates!" }
          ]
        }
      },
      {
        id: "g1-zoo-gate",
        place: "Zoo Gate",
        host: "Zookeeper Sam",
        intro: "A man in a tan hat leans on the zoo gate. \"I am Sam. I feed the animals. Someone put up a new sign. What does it say?\"",
        kind: "sign",
        title: "Zoo Gate Sign",
        text: "The zoo is open! Kids get in free. Dogs get in free too. Do not feed the goats. They eat hats. Pet the bunnies. Be gentle. Say hi to Pip the owl. She says hi back. Shamblers may not come in. They bump the fence. Have a fun day!",
        questions: [
          { type: "detail", q: "What do the goats eat?", options: ["Hats", "Buns", "Owls"], answer: 0, hint: "Read the line right after the goat rule." },
          { type: "inference", q: "Why can't Shamblers come in?", options: ["They eat hats", "They bump the fence", "They are too tall"], answer: 1, hint: "Look at what the sign says Shamblers do." },
          { type: "vocab", word: "gentle", q: "What does the word \"gentle\" mean here?", options: ["Fast and loud", "Big and tall", "Soft and kind"], answer: 2, hint: "You should be this way when you pet a bunny." }
        ],
        choice: {
          prompt: "Sam opens the back gate. Which path?",
          options: [
            { label: "The giraffe path", desc: "It is long, but the giraffes keep watch for you.", effects: { zombies: 0.7, length: 1.2 }, result: "The giraffes peek over the trees. No Shamblers get past them." },
            { label: "The monkey path", desc: "It is quick, but the monkeys throw bananas, and Shamblers love bananas.", effects: { zombies: 1.4, length: 0.9, scrap: 25 }, result: "Bananas fly! Shamblers slip on the peels. Poof! Poof!" }
          ]
        }
      },
      {
        id: "g1-greenhouse",
        place: "Greenhouse",
        host: "Farmer Fern",
        intro: "A woman with dirt on her nose waves from the tomato rows. \"I am Fern. Grandpa Joe sent me a letter. I can grow peas, but words are hard for me. Help?\"",
        kind: "letter",
        title: "A Letter From Grandpa Joe",
        text: "Dear Fern,\n\nThe radio works again! Max and Mia say hi. Biscuit says woof. The van will come to you soon. Please save some peas for them. Peas make the crew strong. And save a big pumpkin for me. I like pumpkin pie.\n\nYour pal,\nGrandpa Joe",
        questions: [
          { type: "detail", q: "What does Grandpa Joe want Fern to save for him?", options: ["Some peas", "A big pumpkin", "A radio"], answer: 1, hint: "Find the line with the word me." },
          { type: "inference", q: "What will Grandpa Joe do with the pumpkin?", options: ["Feed Biscuit", "Give it to Max", "Make a pie"], answer: 2, hint: "Read what Grandpa Joe likes at the end." },
          { type: "vocab", word: "crew", q: "What does the word \"crew\" mean here?", options: ["The van team", "A big meal", "A kind of radio"], answer: 0, hint: "Grandpa Joe means Max, Mia, Biscuit, and you." }
        ],
        choice: {
          prompt: "Fern points to two gates. Which one?",
          options: [
            { label: "The pumpkin patch", desc: "The vines are slow to drive on, but Shamblers get stuck in them.", effects: { zombies: 0.7, length: 1.2 }, result: "Vines wrap the Shamblers up like gifts. The van creeps through." },
            { label: "The sunflower row", desc: "It is quick, but the flowers hide Shamblers and a few crates.", effects: { zombies: 1.3, length: 0.9, crates: 2 }, result: "Sunflowers bonk the windshield. Max spots two crates!" }
          ]
        }
      },
      {
        id: "g1-moon-diner",
        place: "Moon Diner",
        host: "Max",
        intro: "Max unrolls a map on a diner table. \"Mia and I drew this. But Mia wrote the words. Her writing is tiny. Can you read it?\"",
        kind: "map",
        title: "Moon Diner Map",
        text: "The star is the diner. You are here. The blue line is the river. The red line is the big road. The green dots are trees. The green blob is a Shambler. Do not wave at him. Turn at the big tree. The next town is by the lake.",
        questions: [
          { type: "detail", q: "What is the blue line?", options: ["The road", "The river", "The lake"], answer: 1, hint: "Find the line that says blue." },
          { type: "inference", q: "Why should you not wave at the blob?", options: ["It is a Shambler", "It is a tree", "It is a rock"], answer: 0, hint: "Read what the green blob is." },
          { type: "vocab", word: "blob", q: "What does the word \"blob\" mean here?", options: ["A thin line", "A tall tree", "A round lump"], answer: 2, hint: "It is a shape on the map, not a line and not a dot." }
        ],
        choice: {
          prompt: "Max taps two lines on the map. Which way?",
          options: [
            { label: "The big road", desc: "It is quick and smooth, but Shamblers like it too.", effects: { zombies: 1.3, length: 0.9, scrap: 20 }, result: "The van zips down the big road. Shamblers wave. You do not wave back." },
            { label: "The tree path", desc: "It is long and shady, and Shamblers get lost in it.", effects: { zombies: 0.7, length: 1.2 }, result: "Leaves tap the roof. Biscuit sniffs each tree as you pass." }
          ]
        }
      }
    ],
    roadSigns: [
      { text: "Sign: \"SLOW. Cows on the road.\"", q: "Why should you go slow?", options: ["Cows are on the road", "The road is wet", "Kids are at play"], answer: 0 },
      { text: "Radio: \"Grandpa Joe here. Turn left at the red barn.\"", q: "Where do you turn left?", options: ["At the gas pump", "At the red barn", "At the lake"], answer: 1 },
      { text: "Sign on a shop: \"Gas-N-Go. Free pie with gas!\"", q: "What do you get with gas?", options: ["A map", "A hat", "Free pie"], answer: 2 },
      { text: "Sign: \"Bridge out! Use the dirt road.\"", q: "Which road should you use?", options: ["The bridge", "The dirt road", "The big road"], answer: 1 },
      { text: "Radio: \"Max here. Three crates sit by the gas pump.\"", q: "How many crates are by the pump?", options: ["One", "Two", "Three"], answer: 2 },
      { text: "Sign: \"Rest stop: dogs welcome. No Shamblers.\"", q: "Who can stop here?", options: ["Dogs", "Shamblers", "No one"], answer: 0 },
      { text: "Radio: \"Mia here: honk in the tunnel. Shamblers do not like honks.\"", q: "What should you do in the tunnel?", options: ["Stop", "Honk", "Turn back"], answer: 1 },
      { text: "Sign: \"Water Tower, 2 miles. Fill up here.\"", q: "How far is the Water Tower?", options: ["Two miles", "Ten miles", "One mile"], answer: 0 }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
