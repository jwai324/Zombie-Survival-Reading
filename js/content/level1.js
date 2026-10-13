/* Reading level 1 (1st grade) text for Zombie Survival.
   Facts come from js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 1 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[1] = {
    level: 1,
    howto: [
      "You have one van. It leaves from home base. Pick a place on the map. The map tells the way there, in words. Read it, then drive. The road does not show the way. Walkers fill the road. Keep moving. A small map in the corner shows you. A flag marks where you are going. The Radio room finds new places. They show up on the map.",
      "You drive in the left lane. It goes straight on. It goes past side streets and lots. Is your lot on the right? Move to the right lane. Is it on the left? Use the turn lane. It opens on the far left. Where roads meet, it is not the same. Each road gets a lane. Each lane has an arrow. Your lane may turn! A sign tells where each lane goes. Find your way on it. Get in the lane with its arrow. Be in it before the white line. Pick a lane with A and D. The arrow keys work too. So do the side buttons. Side streets are dead ends. At the end, turn into your lot. Wrong turn? Missed the lot? You go back to the start. The van keeps its damage. You keep your scrap and kills.",
      "A note waits at each door. Read it. It says how many walkers wait. It says where the items are. Buildings are big inside. Each corner has a landmark. The notes name them. Use them to find your way. Rooms have signs too. Press M for a map. It shows the parts you have seen. Each doorway is a real door. Press E to open or shut it. Walkers cannot open doors. Walls have signs and graffiti. Walk up to one to read it. Shelf stuff comes back in 3 days. Caches never do.",
      "Find the note inside. It tells how to open the cache. The cache has the best stuff. It may name a new place too. Each building also has a locked stash. Its key is in a different building. Follow the notes to find it. One note leads to a second note. That note says where the key is. The key opens the stash. Stash items never come back. Higher reading levels find more notes. Some are wrong or out of date. Notes go in your backpack. Keys show there too. The cabin's stock tab lists them. Items have tags. Read one when you pick it up. Tags stay in the backpack. Want back in? Open the map. Pick the place you are at. It stays as you left it. Hurt? Use a Medical kit. One kit heals you to full. The backpack holds 3 kits. Pack them at the cabin.",
      "At home you stand in the yard. Each day home, read June's journal. She writes a new page. Build the Radio room. Then a radio broadcast comes too. Each plot in the yard has a sign. A built room gets a plaque. Walk up to one to read it. It says what the room is. It says what it needs. It says why it is locked. Calm means no walkers. Build, or leave in the van. A wave means walkers at the fence. They claw holes in it. The fence does not fix itself. Stand at a hole and press E. Each hole costs 1 scrap. Set traps too. Press T or R. A walker steps on one and gets hurt. What you build shows up in the yard. Each level makes it bigger and stronger. The Walls room changes the fence itself.",
      "Build at the workbench in the garage. Each build is a typing round. Type the words on the screen. A timer runs. Out of time? Try again. Nothing is spent till you finish. First the bench shows where your fingers go. Each round moves you up. Repairs need no typing. Scrap fixes the van to full. Later, dig a Well for water. Build a Farm for food. Build a Lab to make Medical kits. Each player has a save. Up to 4 saves. Pick yours on the title screen. The game saves at base only. Go down? You start from your last save.",
    ],
    controls: [
      "Road: Aim with the mouse. Hold to shoot. A and D change lanes. So do the arrow keys and side buttons. Your lane skips side streets and lots. Lot on the right? Use the right lane. Lot on the left? Use the turn lane. It is on the far left. Where roads meet, each road has a lane. Yours may turn! Read the sign. Get in the lane with your arrow. Be in it before the white line.",
      "Inside and in the yard: W A S D move. The mouse looks. Click shoots. Shift runs. B opens the backpack. M shows a map of the building. P stops the game.",
      "E does it all: E reads notes. E opens and shuts doors. E opens a cache. E opens a stash with its key. E leaves a building. E goes in the cabin. E starts the van. E fixes a fence hole for 1 scrap.",
      "Traps in the yard: T sets a spike trap. R sets a blast trap. It goes in front of you. Or just past the fence.",
      "Guns: More guns hide in buildings. Walk on one to get it. Take it home to keep it. Q picks a gun. So do 1 to 5. Hold to pull the bow. Let go to shoot. Use scrap at the cabin to make guns better.",
      "Backpack: Your notes and your kits. Use a kit to heal to full.",
      "Reading: Signs show when you walk up. So do yard lot signs. E reads notes. Tags and keys stay in the backpack.",
      "Workbench: Building is a typing round. Type what you see. Beat the timer. Out of time? Try again.",
      "Map: Tap a place. Read the way there. Then Drive. At a place, you can go back in.",
    ],
    road: {
      to: "To {dest}",
      here: "You are here",
      home: "Home",
      fog: "Fog",
      night: "Night",
      hungry: "Hungry",
      deadEnd: "Dead end",
      noThrough: "No way through",
      closed: "Road closed",
      lot: "Parking lot",
      hint: "Read the sign. It tells where each lane goes. Pick a lane with A and D.",
      wrongWay: "Wrong way! That road goes to {place}.",
      wrongStreet: "Wrong way! That is {street}.",
      wrongSide: "Wrong way! {street} is a dead end.",
      wrongPlace: "That is {place}, not {dest}.",
      wrongLot: "Wrong lot. This is not {dest}.",
      missed: "You went past {dest}.",
      restart: "Back to {origin}. Try again.",
      routeHead: "The way there",
      routeTake: "Take {street} to {place}.",
      routeTakeStreet: "Take {street}.",
      routeStraight: "Your lane goes past side streets and lots. Where roads meet, read the sign. Get in the lane for your road.",
      routeLeft: "{dest} is on the left. Use the turn lane. It is on the far left.",
      routeRight: "{dest} is on the right. Move to the right lane.",
    },
    base: {
      intro: "Home base. The game saves here, and only here. Hold the fence when walkers come. What you build shows up in the yard.",
      rooms: {
        walls: {
          desc: "Thick walls. The fence starts at 150 strength. Each level makes it stronger. The van and you get tougher too.",
          next: [
            "Fence strength rises to 240. Van gets 20 more health. You get 20 more too.",
            "Fence strength rises to 360. Van health bonus rises to 40. Yours too.",
            "Fence strength rises to 520. Van health bonus rises to 60. Yours too.",
          ],
        },
        garage: {
          desc: "A work bay for the van and the gun. Fixing the van costs 1 scrap per 3 health lost. It costs at least 5 scrap. Build the Garage and fixes are free.",
          next: [
            "Van and gun reach tier 3. Repairs at base are free.",
            "Van and gun reach tier 4. Repairs at base are free.",
            "Van and gun reach tier 5. Repairs at base are free.",
          ],
        },
        power: {
          desc: "Lights and juice for the base.",
          next: [
            "The map shows danger at each place.",
            "Map shows danger. You find one crate on each drive.",
            "Map shows danger. Two crates per drive. Headlights beat night and fog.",
          ],
        },
        water: {
          desc: "Clean water. You heal while on foot.",
          next: [
            "You heal a bit on foot.",
            "You heal faster on foot.",
            "You heal fast on foot. You start each building at full health.",
          ],
        },
        garden: {
          desc: "Grow food. Each trip eats one food. No food means a weak van.",
          next: [
            "One food a day.",
            "Two food a day.",
            "Three food a day.",
          ],
        },
        radio: {
          desc: "Hear the town. Find new places.",
          next: [
            "Shows up to three new places.",
            "Shows every place on the map.",
            "Shows every place. Also shows which still have items.",
          ],
        },
        medbay: {
          desc: "Patch up. Hits hurt less.",
          next: [
            "Walkers hurt you less on foot.",
            "Hurt less. One revive per trip.",
            "Hurt even less. One revive per trip. The van takes less harm too.",
          ],
        },
        archive: {
          desc: "Notes and maps, sorted and kept. The map learns what you read.",
          next: [
            "Read a door note. The map then shows that place's stock.",
            "Read a door note. The map shows its stock. It marks caches too.",
            "The map shows stock at every place. It marks caches too.",
          ],
        },
        well: {
          desc: "A hand-dug well by the cabin. Clean water from deep down. You heal faster on foot. The Farm and the Lab need it.",
          next: [
            "Needs the Water room first. Costs 60 scrap. Plus Lumber 2, Tool kit 1. You heal on foot at rate 2.",
            "Costs 100 scrap. Plus Lumber 2, Engine parts 1, Water filter 1. Heal rate goes up to 3.",
            "Costs 150 scrap. Plus Water tank 1, Engine parts 1, Spool of wire 1. Heal rate goes up to 4. You start each building at full health.",
          ],
        },
        farm: {
          desc: "Farmland next to the yard. Crops first, then hens and goats. More food each day. It adds to the Garden.",
          next: [
            "A crop field: corn and beans. Needs Garden 2 and the Well. Costs 80 scrap. Plus Seed packets 2, Bag of soil 2, Lumber 1. Grows 2 food a day.",
            "A chicken coop. Needs Well 2. Costs 120 scrap. Plus Lumber 2, Spool of wire 1, Seed packets 1. Gives 4 food a day.",
            "A goat pen. Needs Well 3. Costs 180 scrap. Plus Lumber 3, Spool of wire 2, Water tank 1. Gives 6 food a day.",
          ],
        },
        lab: {
          desc: "Make meds at home. Kits go to storage each new day.",
          next: [
            "Herb beds and a still. A still is a pot that cooks herbs into medicine. Needs Medbay 1 and the Well. Costs 80 scrap. Plus Medical kit 1, Box of books 1, Seed packets 1. Makes 1 Medical kit every 2 days.",
            "A clean bench. Needs Well 2. Costs 120 scrap. Plus Water filter 1, Box of books 1, Spool of wire 1. Makes 1 Medical kit a day.",
            "A powered lab. Needs Medbay 2. Costs 180 scrap. Plus Generator 1, Medical kit 2, Box of books 1. Makes 2 Medical kits a day.",
          ],
        },
      },
      traps: {
        spike: {
          desc: "Spike trap. Walls 2 unlocks it. Costs 10 scrap. Plus Lumber 1, Box of nails 1. Press T to set it. It goes on the tile ahead. Over the fence works too. A walker steps on it. That walker takes 45 damage. It lasts 3 walkers.",
        },
        blast: {
          desc: "Blast trap. Walls 3 unlocks it. Costs 25 scrap. Plus Fuel can 1, Spool of wire 1. Press R to set it. It blows up once. Every walker close by takes 120 damage. One use, then it is gone.",
        },
      },
      bench: {
        intro: "This is the garage workbench. Build, upgrade, and craft here by typing. Nothing is spent till you finish.",
      },
    },
    typing: {
      fingers: [
        "Look at the keyboard. Find the middle row of letters. That is the home row. Your fingers rest there. They go back there each time.",
        "Left hand: A S D F. Right hand: J K L. Right pinky: the ; key. That key is the semicolon. Feel F and J. Each one has a small bump. The bumps tell you where home is. No need to look down.",
        "Both thumbs rest on the space bar. Tap it with a thumb. That makes a space.",
        "Each finger owns a few keys. It reaches up or down. Then it comes back home. Keep your eyes on the screen. Not on your hands. The words will come.",
      ],
      words: [
        "van", "gas", "map", "key", "door", "fuel", "note", "nail", "wood", "wire",
        "seed", "soil", "meds", "kit", "gun", "book", "food", "well", "farm", "lab",
        "yard", "wave", "calm", "hold", "run", "walk", "hide", "pump", "tank", "trap",
        "hole", "home", "base", "shed", "road", "hill", "town", "mall", "shop", "lock",
        "code", "dark", "dusk", "rust", "bolt", "goat", "hen", "corn", "bean", "herb",
        "tool", "part", "box", "bag", "pack", "aim", "read", "sign", "gate", "wall",
        "roof", "step", "tile", "dock", "rope", "tape", "help", "safe", "save", "wait",
        "keep", "fix", "dig", "lane", "lot",
      ],
      phrases: [
        "hold fast", "read it", "go in", "get gas", "fix it", "set trap", "run home", "hold on",
        "lock door", "open door", "shut door", "grab food", "pack kit", "use kit", "dig well", "feed hens",
        "plant corn", "drive home", "save game", "find key", "read note", "take scrap", "keep calm", "stay low",
        "walk slow", "turn left", "head east", "go west", "pick up", "fix fence", "load van", "fill tank",
        "stay put", "look out", "move on", "dead end", "left lane", "turn right", "read sign",
      ],
      sentences: [
        "Read the note first.",
        "The door is shut.",
        "Press E at the door.",
        "Hold the fence, Max.",
        "Gas is on the floor.",
        "Walkers come in waves.",
        "Fix the hole with scrap.",
        "The well gives clean water.",
        "Pack a kit, then go.",
        "Dev went east to Ortiz Auto.",
        "Rosa has seeds and soil.",
        "Drive the van home now.",
        "The cabin door locks.",
        "Set a trap by the fence.",
        "Stay quiet in the hall.",
        "The radio finds new places.",
        "Ruby left a note.",
        "Do not run the saws.",
        "Scrap piles give scrap.",
        "The map shows the road.",
        "Walk, do not run.",
        "Nurse Ada is still here.",
        "The hens lay eggs.",
        "Get in the turn lane.",
        "Read the sign, then turn.",
        "Press M for the map.",
      ],
    },
    // Buildings: level1-places1.js and level1-places2.js. Home: level1-home.js.
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
