/* Reading level 3 (3rd grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 3 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[3] = {
    level: 3,
    howto: [
      "Your home base is a boarded-up house at the south end of town. You have one van, and it still runs. Every day you drive out for supplies, and every night you bring them home. Inside every building there are walkers, and there are notes. People who were there before you wrote the notes. Read them, and you find more and lose less. No one tests you on them. They are just useful.",
      "You stand in the yard, first person, with a fence around the lot. Time runs in calm phases and waves. In a calm phase, nothing is at the fence. Go inside the cabin to build, or leave in the van. Then a wave comes. Sometimes it is a few walkers, sometimes a lot, and sometimes none at all. Walkers claw through the fence. During a wave, the cabin door and the van are locked. You have to hold the yard. The fence does not fix itself. Every hole stays until you fix it. Stand at the hole and press E, or use the cabin menu. Each hole costs 1 scrap. A cracked part of the fence can be braced for 1 scrap, too. Every room you build shows up in the yard. It looks bigger and stronger at each level. The Walls room changes the fence itself, and each level rebuilds the whole fence. Later, you can craft traps at the workbench. Set them along the fence line. A walker that steps on one is hurt. A Spike trap needs Walls 2, and a Blast trap needs Walls 3. Late in the game, dig a Well for clean water. Then build a Farm for crops and animals. A Lab makes Medical kits at home.",
      "Open the map and pick a place. Only a few places are known at first. Notes and the Radio room reveal the rest. Plan your trip on the map. The road will not show you the way. The map lists the way there in words, one road at a time. Then you drive. Before each turn, a sign says where each lane goes. Read it. Then get in the lane for your way before the white stop line. Use A and D, the arrow keys, or the side buttons. The left lane always goes straight past side streets and parking lots. Side streets are dead ends. At the end, turn into the lot of the place you picked. A wrong turn or a missed lot sends you back to where you started. You keep your damage, your scrap, and your kills. A small map in the corner shows where you are. A flag on it marks where you are going. Walkers wander the road. Far places and dangerous places have more of them. More come as the days pass. Still parked at a place? Open the map, and you can go back in from there.",
      "At the door you read a note before you go in. It tells you how many walkers wait inside and where the items are. Buildings are big, with halls, side rooms, and dead ends. Each corner has a landmark, something big you will not forget. It might be a green dino or a big red wheel. The notes name these landmarks, so steer by them. Press M for a map of the parts you have seen. Every doorway inside is a real door. Press E to open it, and press E again to close it. Walkers cannot open doors. Walkers come for you, so shoot them or slip around them. Grab items from shelves and floors, and take scrap from the piles. Shelf items come back three days after you take them. Cache items never do. Find the note inside and read it. It tells you how to open the locked cache room. The best items are in there. It also names the next place to try. That place then shows up on the map. Every note you read goes in your backpack. You can open the backpack at base, on the map, or inside a building. You can go back into a building on the same trip. It is just as you left it. Walkers you put down stay down, and doors stay as you left them. Driving home resets all of that.",
      "Hurt? Use a Medical kit, and it heals you to full. The backpack carries up to 3 kits. Pack them from storage at the cabin. Inside a building, you can also use a kit from the van's cargo. Drive home with your cargo. At base, cargo goes into storage, and you eat one food. The Garden and the Farm add food, and the day count goes up. The garage repairs the van back to full for scrap. It costs 1 scrap for every 3 health missing, and at least 5 scrap. Once the Garage room is built, repairs are free.",
      "Build rooms, upgrade the van or gun, and craft traps at the workbench. The workbench is in the garage. Each one is a short typing round. Repairs need no typing. The words to type are shown on the screen, with a timer. Run out of time, and you simply try again. Nothing is spent until you finish. The first time, the bench teaches you where to put your fingers. That is the home row. Every finished round moves you to the next typing stage. Single home-row keys come first, then the other rows. Then come words, phrases, and sentences. Each player has their own labeled save, and there are up to 4. Pick yours on the title screen. The base is still the only place the game saves. It saves when you arrive, after every build, and after every wave. Three things end a run. The van gets wrecked, you go down inside, or the yard is overrun. Then the game loads your last base save. Everything since that save is gone, so plan each trip with care.",
    ],
    controls: [
      "Road: Aim with the mouse and hold to fire. A and D, the arrow keys, or the side buttons change lanes. Read each sign. Get in the lane for your way before the white line.",
      "Inside and in the yard: W A S D move, the mouse looks, and a click fires. Shift makes you run, and B opens the backpack. P or Esc pauses the game. Inside a building, M opens a map of the parts you have seen.",
      "E does it all: E reads notes and opens and closes doors. It opens a cache once you have read its note. E also leaves a building, enters the cabin, and starts the van. It rebuilds a hole in the fence for 1 scrap.",
      "Traps in the yard: T sets a spike trap, and R sets a blast trap. Each trap goes on the ground in front of you, or past the fence.",
      "Backpack: Every note you have read, and your medical kits. Use a kit to heal back to full.",
      "Workbench: Building, upgrading, and crafting are short typing rounds. Type what is on the screen before the timer runs out. Out of time only means try again.",
      "Map: Tap a place, then Drive. The map lists the way there in words. At the place where you are parked, you can go back inside.",
    ],
    road: {
      to: "To {dest}",
      here: "You made it",
      home: "Home safe",
      fog: "Fog",
      night: "Night",
      hungry: "Hungry",
      deadEnd: "Dead end",
      noThrough: "No through road",
      closed: "Road closed",
      lot: "Parking lot",
      hint: "Read the sign. Pick a lane with A and D, the arrow keys, or the side buttons.",
      wrongWay: "Wrong way! That road goes to {place}.",
      wrongStreet: "Wrong way! That is {street}.",
      wrongSide: "Wrong way! {street} does not go through.",
      wrongPlace: "That is {place}, not {dest}.",
      wrongLot: "That lot is not {dest}.",
      missed: "You drove past {dest}.",
      restart: "Back to {origin}. Try it again.",
      routeHead: "The way there",
      routeTake: "Take {street} to {place}.",
      routeTakeStreet: "Take {street}.",
      routeStraight: "Go straight past side streets and other places.",
      routeLeft: "{dest} is on the left. Get in the left lane.",
      routeRight: "{dest} is on the right. Get in the right lane.",
    },
    base: {
      intro: "This is home base, the only place the game saves. Build up the rooms, fix the van, and head back out.",
      rooms: {
        walls: {
          desc: "Boards and plates on the fence, the house, and the van. Thicker walls make the fence stronger, so walkers take longer to claw through. They also mean more health for the van, and for you on foot. The fence starts at 150 strength.",
          next: [
            "Fence strength goes from 150 to 240. Van health up by 20. Your health on foot up by 20.",
            "Fence strength goes up to 360. Van health up by 40. Your health on foot up by 40.",
            "Fence strength goes up to 520. Van health up by 60. Your health on foot up by 60. This level needs an armor plate.",
          ],
        },
        garage: {
          desc: "The shop for the van and the gun. A better garage unlocks higher upgrade tiers, and it repairs the van for free. Until then, a repair costs 1 scrap for every 3 health missing. It costs at least 5 scrap.",
          next: [
            "Van and gun upgrades up to tier 3. Free van repair at base.",
            "Van and gun upgrades up to tier 4. Free van repair at base.",
            "Van and gun upgrades up to tier 5. Free van repair at base. This level needs gun parts.",
          ],
        },
        power: {
          desc: "Fuel, wire, and a string of lights, with a generator later on. Power shows how dangerous each place is. Later it adds supply crates on drives, and headlights for night and fog.",
          next: [
            "The map shows the danger level at every place.",
            "The map shows danger. You find one supply crate on each drive. This level needs a generator.",
            "The map shows danger. You find two supply crates on each drive. Headlights beat night and fog. Night drives start on day 6 and come every third day after that.",
          ],
        },
        water: {
          desc: "Clean water from a filter and a tank. You heal while you are on foot, and more water means faster healing.",
          next: [
            "You slowly heal on foot, at rate 1.",
            "You heal on foot at rate 2.",
            "You heal on foot at rate 3. You also start every building at full health.",
          ],
        },
        garden: {
          desc: "Beds of soil and seeds. The garden grows food. Every trip eats one food, and no food means a weaker van.",
          next: [
            "Grows 1 food each day.",
            "Grows 2 food each day.",
            "Grows 3 food each day. This level needs a water tank.",
          ],
        },
        radio: {
          desc: "A radio on the roof. It picks up voices from across town, and they tell you where places are.",
          next: [
            "Reveals 3 new places on the map.",
            "Reveals every place on the map.",
            "Reveals every place, and shows which places still have items. This level needs a box of books.",
          ],
        },
        medbay: {
          desc: "A room with beds and medical kits. You get hurt less, and you can get back up after you go down.",
          next: [
            "Walker hits hurt you 20 percent less on foot.",
            "Hits hurt 20 percent less. One revive per trip if you go down.",
            "Hits hurt 30 percent less. One revive per trip. The van takes 20 percent less damage.",
          ],
        },
        archive: {
          desc: "Shelves of books and maps. Read a place's door note, and the map shows what is still there. Later the map marks caches too.",
          next: [
            "Once you read a place's door note, the map shows what is still there.",
            "The map shows what is left at places you have read. It also marks which places have a cache.",
            "The map marks caches. It shows what is left at every place, read or not. This level needs city maps.",
          ],
        },
        well: {
          desc: "A hand-dug well beside the cabin. It gives clean water from deep underground, so you heal faster on foot. The Farm and the Lab both need the Well.",
          next: [
            "Needs the Water room first. Costs Lumber 2, Tool kit 1, and 60 scrap. You heal on foot at rate 2.",
            "Costs Lumber 2, Engine parts 1, Water filter 1, and 100 scrap. You heal on foot at rate 3.",
            "Costs Water tank 1, Engine parts 1, Spool of wire 1, and 150 scrap. You heal on foot at rate 4. You also start every building at full health.",
          ],
        },
        farm: {
          desc: "Farmland next to the yard. First a crop field, then animals. The farm grows more food every day, on top of the Garden.",
          next: [
            "A crop field of corn and beans. Needs Garden 2 and the Well. Costs Seed packets 2, Bag of soil 2, Lumber 1, and 80 scrap. The farm grows 2 food a day.",
            "A chicken coop. Needs Well 2. Costs Lumber 2, Spool of wire 1, Seed packets 1, and 120 scrap. The farm gives 4 food a day.",
            "A goat pen. Needs Well 3. Costs Lumber 3, Spool of wire 2, Water tank 1, and 180 scrap. The farm gives 6 food a day.",
          ],
        },
        lab: {
          desc: "Medicine made at home. First come herb beds and a still. A still boils herbs into medicine. Then comes a clean bench, and then a powered lab. New kits go into storage when a day passes.",
          next: [
            "Herb beds and a still. Needs Medbay 1 and the Well. Costs Medical kit 1, Box of books 1, Seed packets 1, and 80 scrap. Makes 1 Medical kit every 2 days.",
            "A clean bench. Needs Well 2. Costs Water filter 1, Box of books 1, and Spool of wire 1. It also costs 120 scrap. Makes 1 Medical kit a day.",
            "A powered lab. Needs Medbay 2. Costs Generator 1, Medical kit 2, Box of books 1, and 180 scrap. Makes 2 Medical kits a day.",
          ],
        },
      },
      traps: {
        spike: {
          desc: "A Spike trap. Walls 2 unlocks it. It costs Lumber 1, Box of nails 1, and 10 scrap. Press T to set it on the tile in front of you. You can set it on the other side of the fence, too. A walker that steps on it takes 45 damage. It lasts 3 walkers, and then it is spent.",
        },
        blast: {
          desc: "A Blast trap. Walls 3 unlocks it. It costs Fuel can 1, Spool of wire 1, and 25 scrap. Press R to set it. When a walker steps on it, it blows up once. Every walker close to it takes 120 damage. One use, and then it is gone.",
        },
      },
      bench: {
        intro: "This is the garage workbench. Build rooms, upgrade the van and gun, and craft traps here by typing. Nothing is spent until you finish the round.",
      },
    },
    typing: {
      fingers: [
        "Look at your keyboard and find the middle row of letter keys. That row is called the home row. Your fingers rest there, and they always come back to it.",
        "Put your left hand on A S D F, one finger per key. Put your right hand on J K L and the ; key. That last key is the semicolon, and your right pinky takes it. Now feel the F key and the J key. Each one has a small bump. The bumps tell your fingers where home is, so you never look down.",
        "Both thumbs rest on the space bar. Tap it with either thumb to make a space.",
        "Each finger owns a few keys above and below its home key. It reaches up or down to hit one, then comes right back home. Keep your eyes on the screen, not on your hands. Trust the bumps, and the words will come faster every round.",
      ],
      words: [
        "van", "gas", "fence", "scrap", "walker", "note", "cabin", "key", "map", "fuel",
        "door", "radio", "wire", "nails", "lumber", "seeds", "soil", "meds", "kit", "gun",
        "books", "food", "well", "farm", "lab", "yard", "wave", "calm", "hold", "run",
        "walk", "pump", "tank", "trap", "hole", "home", "base", "shed", "road", "hills",
        "town", "mall", "shop", "lock", "code", "dark", "bolt", "goat", "hens", "corn",
        "beans", "herbs", "tools", "parts", "box", "bag", "pack", "aim", "read", "sign",
        "gate", "wall", "roof", "step", "tile", "dock", "kiln", "tape", "save", "wait",
        "fix", "dig", "spike", "blast", "brace", "crate", "store", "truck", "crowd", "dusk",
        "night", "still", "bench", "clerk", "nurse", "chief", "badge", "latch", "hatch", "river",
        "ridge", "paint", "armor", "plate", "water", "north", "south", "east", "west", "drive",
        "shoot", "cache", "glass", "panel", "pit", "shelf", "aisle", "desk", "hook", "eggs",
        "coop", "pen", "type", "timer", "round", "day", "trip", "load", "cargo", "filter",
        "garage", "garden", "repair", "supply", "danger", "runner", "brute", "medbay", "school", "police",
        "armory", "cooler", "engine", "spool", "squad", "office", "window", "marker", "chalk", "screen",
        "finger", "thumb", "bump", "reach", "drawer", "handle", "rooms", "build", "craft", "tier",
        "typing", "phrase", "words", "stage", "siren", "ammo", "pumps", "paper", "pencil", "hazard",
      ],
      phrases: [
        "hold the fence", "read the note", "open the door", "shut the door", "fix the hole", "brace the fence", "set a trap", "spike trap",
        "blast trap", "pack a kit", "use a kit", "dig the well", "feed the hens", "plant the corn", "milk the goat", "make meds",
        "drive home", "save the game", "find the key", "take the scrap", "keep calm", "stay low", "walk slow", "turn left",
        "head east", "go west", "load the van", "fill the tank", "stay put", "look out", "move on", "type fast",
        "home row", "night drive", "calm phase", "big wave", "cold cooler", "back room", "pump house", "kiln shed",
        "red key", "stuck latch", "check the map", "stay quiet", "hold the yard", "clean water", "fresh eggs", "corn and beans",
        "lock the door", "grab the fuel", "run for home", "scrap pile", "cache room", "door note", "garage bench", "finish the round",
      ],
      sentences: [
        "Read the note before you go in.",
        "Press E to open the door.",
        "Walkers cannot open the doors inside.",
        "The fence does not fix itself.",
        "Each hole in the fence costs one scrap.",
        "Set a spike trap along the fence line.",
        "The blast trap goes off only once.",
        "Pack three kits before you leave the cabin.",
        "One kit heals you back to full.",
        "The well gives clean water from deep down.",
        "The farm grows corn and beans by the yard.",
        "The hens in the coop lay eggs each day.",
        "The lab makes medicine right at home.",
        "Dev went east to Ortiz Auto.",
        "Rosa left seeds and soil for you.",
        "Drive the van home before dark falls.",
        "The cabin door locks during a wave.",
        "Hold the yard until the wave ends.",
        "Type the words you see on the screen.",
        "Keep your eyes on the screen, not your hands.",
        "Your fingers rest on the home row.",
        "Nurse Ada stayed when the others left.",
        "Walk, do not run, Luis wrote.",
        "The radio finds new places across town.",
        "Shelf items come back in three days.",
        "Scrap piles give you scrap for repairs.",
        "The map draws the road home for you.",
        "Do not run the saws, Carla warned.",
        "The garage fixes the van for scrap.",
        "The game saves only at home base.",
        "Pick your save on the title screen.",
        "Stay quiet in the dark hospital halls.",
        "Theo keeps the pumps running at the tower.",
        "Chief Dunn left the red key on the board.",
        "Lift the latch while you pull the cooler door.",
        "The storeroom key hangs under the counter.",
        "Walkers at the mall move as one group.",
        "Nothing is spent until you finish the round.",
        "Brace a cracked fence for one scrap.",
        "Doors stay as you left them inside.",
      ],
    },
    locations: {
      gasngo: {
        blurb: "A small gas station with fuel on the floor and a locked storeroom.",
        door: {
          title: "Ruby's Warning",
          text: "Ruby here. At least three walkers are inside. One stands in the garage, by the car lift. More come as the days pass, so do not wait around. There are two fuel cans. One is by the slushie machine, at the front on the left. The other is in the garage, by the tire tower. The storeroom is locked. The clerk left a note on the counter by the front door.",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Note at the Register",
            text: "This is Dev. I was the clerk here. The storeroom key hangs on the hook under this counter. Reach under and feel for it. With that key, you can open the storeroom now. There is more fuel in there, and a spool of wire.\n\nGo through the gap at the back of the shop into the back hall. The ice machine is in the room at the left end. Walk the other way, all the way down. The storeroom is the last door before the garage.\n\nI went to Ortiz Auto on the east side of town. The shop is still standing. Rosa is at Greenhouse Row, west past this gas station. She has seeds and soil to share.",
          },
        },
      },
      grocery: {
        blurb: "A corner store with leftover food and a cold walk-in cooler.",
        door: {
          title: "Doc Lin on the Glass",
          text: "Doc Lin. The shelves are picked over, so do not waste time on them. The food that is left is on the floor. Look by the fish tank, and by the freezers on the right. Walkers get in through the loading door at the back, by the forklift. Count on at least three. The cooler is locked. The manager's note is in the office, at the back on the left.",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Trick",
            text: "I am Hana, the store manager. The cooler latch is stuck, not broken. Lift the latch while you pull on the door, and it opens. So you can open the cooler now. Inside there is food, and there is one medical kit. The cold has kept it all good.\n\nStep out of this office into the back hall. Turn toward the forklift. The cooler is the very next door, just right of this office.\n\nWhen you need more medicine, try Mile 9 Pharmacy. It is west of here. Last week it still had medicine on its shelves. Take what you need, and leave the rest for the next person.",
          },
        },
      },
      hardware: {
        blurb: "A big hardware store with nails, tools, lumber, and a locked back room.",
        door: {
          title: "Mr. Reyes Nailed This Up",
          text: "Mr. Reyes, the owner. At least five walkers are inside, and two are in the middle aisles. Nails are by the toilet display, near the front. Tools are in the middle aisle. Lumber is in the lumber racks at the back. The back room is locked. My note is by the paint mixer, in the back left corner. Watch the aisles on your way there.",
        },
        notes: {
          "hardware-paint": {
            title: "The Sticking Door",
            text: "Mr. Reyes again. The back room door sticks, and most people give up on it. The trick is to lift the handle and push at the same time. Do that, and you can open the back room now. Inside I left a water filter, a second tool kit, and lumber.\n\nTo get there, take the side door by the paint mixer. It opens into the lumber racks. Walk past the racks, and the back room door is right there.\n\nNeed more wood? Ridge Lumber on the east ridge has stacks of lumber. Need more filters? The Water Tower on the west side has more in its pump house.",
          },
        },
      },
      pharmacy: {
        blurb: "A small pharmacy with medical kits and a locked cabinet room.",
        door: {
          title: "Mr. Okafor's Door Note",
          text: "Mr. Okafor, the pharmacist. Two medical kits are out on the floor. One is by the giant toothbrush. The other is in the middle, where the aisles cross. At least five walkers are inside, and most are near the back. The cabinet room is locked. Its code is on my note behind the counter. Get behind the counter at the right end, by the wheelchairs.",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Room Code",
            text: "Mr. Okafor here. The cabinet room has a keypad on the door. The code is 4471. Type it in, and the lock clicks open. You can open the cabinet room now. Inside are two more medical kits and a water filter. I left them for whoever came next.\n\nThe door is back here, behind the counter. It is in the corner on the same side as the wheelchairs.\n\nIf you need more than that, go north. St. Anne Annex is the hospital in the north hills. It still has medicine, and it has a generator. But it is the most dangerous place in town. Go with a plan.",
          },
        },
      },
      autoshop: {
        blurb: "A repair shop with engine parts and a generator down in the service pit.",
        door: {
          title: "Dev's Chalk Note",
          text: "Dev here, from the Gas-N-Go. Engine parts are on the workbenches. One bench is at the back right, by the red tool chest. The other is in the left bay. At least five walkers are inside. One wanders the parts room, by the engine crane. The service pit is under a locked hatch. Mr. Ortiz left a note in the office, behind the waiting room.",
        },
        notes: {
          "autoshop-office": {
            title: "Mr. Ortiz on the Hatch",
            text: "This is Mr. Ortiz. The hatch over the service pit looks stuck, but it is not. The bolt comes out if you twist it to the left. Give it a hard turn, and it slides free. You can open the service pit now. My generator is down in the pit, with spare parts and a fuel can.\n\nThe pit room stands in the middle of the shop. Its hatch is on the front side, toward the oil drums.\n\nSignal Electronics is downtown. It still has wire and radio parts. But it is near the walker crowds. Go in fast, and get out faster.",
          },
        },
      },
      radioshack: {
        blurb: "An electronics store with spools of wire, close to the walker crowds.",
        door: {
          title: "Jo's Sign in the Window",
          text: "Jo wrote this. Spools of wire are between the two long shelves in the middle. One is on the TV wall side, and one is on the robot side. At least six walkers are inside. One is near the right end of the counter, by the robot. It will hear the door, so be ready. The manager's office is locked. The manager left a note on the counter at the back.",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Key Under the Register",
            text: "I am Priya, the manager. The office key is taped under the register. Reach under the counter and feel along the edge. Peel it off, and you can open the manager's office now. Inside are two boxes of radio parts, and there is more wire.\n\nMy office door is in the back wall, just left of the robot. You cannot miss that robot.\n\nTwo places are north of downtown. The 4th Precinct is the police station, and it has gun parts. Lincoln Middle School has books. Both are worth the drive, but the station is the harder one. Do not go there tired.",
          },
        },
      },
      garden: {
        blurb: "A row of greenhouses with seeds, soil, and a locked potting shed.",
        door: {
          title: "Rosa Painted the Gate",
          text: "Rosa here. I ran this greenhouse. Soil is in the big greenhouse, the one with the scarecrow. Seeds are in the shop by the gate, near the big gnome. At least five walkers are inside. One stays at the back of the big greenhouse. The potting shed is locked. My note is on the potting bench by the palm tree, back right.",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Watering Can",
            text: "Rosa again. The potting shed has a padlock on it. The key is in the watering can on this bench. Tip the can, and let the key slide out. You can open the potting shed now. There are more seeds inside, and there is a water tank.\n\nTo find the shed, leave the palm tree house. Take the path down toward the beehives. The shed door is on that path.\n\nStation 12 is the fire station north of here. Its equipment bay has tools and water tanks. Chief Dunn ran that station, and I think he is still there. Tell him Rosa sent you.",
          },
        },
      },
      police: {
        blurb: "The 4th Precinct: gun parts, an armor plate, and a locked armory.",
        door: {
          title: "Sergeant Vega's Notice",
          text: "Sergeant Vega. Gun parts are in the squad room, to the left of the long hall. An armor plate is in the garage on the right, by the riot shields. At least eight walkers are inside. A big one waits by the police bike in the garage. The armory is locked. I left the combination on a note at the front desk. Read it first.",
        },
        notes: {
          "police-desk": {
            title: "The Armory Combination",
            text: "Sergeant Vega again. The armory has a dial lock, and the combination is 19-4-33. Turn it slow: left, then right, then left. You can open the armory now. There are gun parts inside, and there is an armor plate.\n\nThe armory is at the right end of the back hall. That is the end toward the police bike.\n\nThe Public Library is north of downtown. It has books in its archive room. The librarian stayed when everyone else left. Her name is Mrs. Greer, and she knows that building better than anyone. If you get there, help her if you can.",
          },
        },
      },
      school: {
        blurb: "A middle school with boxes of books in classrooms and a locked library closet.",
        door: {
          title: "Max and Mia Were Here",
          text: "Max and Mia wrote this. There are two boxes of books. One is in the music room, with the drum set. The other is in the front office, behind the lion statue. At least six walkers are inside. One is in the main hallway, so time your move. The library closet is locked. The key is in the teacher's note. It is in the science room, back left, by the big brain.",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk",
            text: "I am Ms. Adler, and I taught in this room. The library closet key is in my top desk drawer. Pull the drawer all the way out, since it sticks. With that key, you can open the closet now. It holds books and a folder of city maps. The maps are worth more than the books right now.\n\nThe library is the room next to the one with the drum set. The closet is in the back right corner of the library.\n\nNorthgate Mall is in the north. It has food, medicine, and wire. But the crowds there are the worst in town. Go only if you must.",
          },
        },
      },
      firehouse: {
        blurb: "Station 12, a fire station with tools, water tanks, and a locked equipment bay.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Chief Dunn. A tool kit is in the office, behind the watch desk. A water tank is in the truck bay. It is on the right wall, past the gear racks. At least six walkers are inside, and two are in the truck bay. The equipment bay is locked. My note is on the watch desk, by the spotted dog. That dog is only a statue.",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "Chief Dunn again. Look at the key board on the wall by this desk. Take the red key, and only the red one. It opens the equipment bay lock, so you can open the equipment bay now. In there is a water tank, plus lumber and tools. Load the tank first, since it is the heaviest.\n\nThe equipment bay is at the back of the truck bay. It is to the right of the fire truck.\n\nIf you need water filters, go to the Water Tower on the west side. The filters are in its pump house. Theo looks after the pumps there.",
          },
        },
      },
      hospital: {
        blurb: "St. Anne Annex, the north hills hospital, with medicine and the worst walkers.",
        door: {
          title: "Doc Lin on the Ambulance",
          text: "Doc Lin. One medical kit is in the patient room next to the x-ray machine. One more is by the giant teddy bear in the gift shop. The generator is in the utility room, on the right side. At least nine walkers are inside. They stand still in the dark rooms. The pharmacy stock room is locked. The nurse's note is at the nurses' station, in the middle.",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada Stayed",
            text: "I am Nurse Ada. I stayed when the others left, because someone had to. The stock room door needs a badge. My badge is in the drawer under this station. Take it, and you can open the stock room now. There are three medical kits inside.\n\nThe stock room door is just across the corridor from this station. It is on the angel statue side.\n\nStay quiet in here. The walkers in this building follow sound more than light. Do not run, and do not shout. Walk soft, and they may not turn your way.",
          },
        },
      },
      watertower: {
        blurb: "The pump building under the Water Tower, stocked with water filters.",
        door: {
          title: "Theo's Fence Note",
          text: "Theo here. I tend the pumps. There are two water filters inside. One is by the crates near the big red wheel. The other is in the boat workshop, by the rowboat. At least six walkers are inside the pump building. They do not leave, so be ready. The pump house is locked. My note is on the control panel, in the back right room.",
        },
        notes: {
          "watertower-panel": {
            title: "The Breaker Box Key",
            text: "Theo again. The pump house key is in the breaker box. That is the gray metal box on the wall, and it is not locked. Open it, and the key hangs on a nail inside. With it, you can open the pump house now. There are filters in there, a water tank, and wire.\n\nThe pump house door is at the back of the pump hall. Look for it just right of the big red wheel.\n\nIf you need medicine, go to St. Anne Annex. It is the hospital, north along the river road. It still has medicine. But it is the most dangerous place in town.",
          },
        },
      },
      lumberyard: {
        blurb: "Ridge Lumber on the east ridge, stacked with wood and a locked kiln shed.",
        door: {
          title: "Ruby's Spray Paint",
          text: "Ruby again. Lumber is in the long racks in the middle. One more stack is out back, by the log pile. At least eight walkers are inside. They gather by the loading dock and the flatbed truck. Stay away from that side. The kiln shed is locked. The yard boss left a note on a clipboard by the band saw.",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Clipboard",
            text: "Carla here, the yard boss. The kiln shed has a padlock with a dial on it. The code is 2218. Spin it to those numbers, and the lock drops open. You can open the kiln shed now. The lumber in there is dry, and there are nails too.\n\nLeave the band saw shop and step into the rack hall. The kiln shed door is in the back wall, right of this shop.\n\nDo not run the saws. Not even once. The noise brings the whole dock crowd, and they come fast. Carry what you need and go.",
          },
        },
      },
      mall: {
        blurb: "Northgate Mall in the north, full of goods and the biggest walker crowd.",
        door: {
          title: "Jo's Mall Door Note",
          text: "Jo here. Food is in the food court at the back. Medicine is in the pharmacy on the left. Wire is in the gadget store on the right. It is next door to the orange tent. At least nine walkers are inside. They move in a group along the main hall. The security office is locked. The guard's note is in the play area, by the green dino.",
        },
        notes: {
          "mall-guard": {
            title: "Luis Left the Code",
            text: "My name is Luis, and I worked security at this mall. The office has a keypad by the door. The code is 0912. Type it in, and the lock lets go. You can open the security office now. There are gun parts inside, plus radio parts and a tool kit.\n\nGo to the back of the food court and take the kitchen door. Then turn right. The office is behind the green dino.\n\nThe walkers here come running at anyone who runs. So do not run, no matter how close they get. Walk, and most of them stay put.",
          },
        },
      },
      library: {
        blurb: "The Public Library north of downtown, with books, maps, and a locked archive room.",
        door: {
          title: "Mrs. Greer's Book Drop",
          text: "Mrs. Greer, the librarian. Books are in the stacks on both sides of the main hall. More are in the children's room, by the toy castle. At least eight walkers are inside, and two are in the main hall. You will meet those two first. The archive room is locked. My note is on the reference desk by the giant globe, back left.",
        },
        notes: {
          "library-desk": {
            title: "The Key in the Dictionary",
            text: "Mrs. Greer again. The archive key is inside the big dictionary on this desk. Open the book to the middle, and find the hole cut in the pages. The key sits in that hole. With it, you can open the archive room now. The archive has books and a folder of city maps.\n\nThe archive door is at the back end of the main hall. It is between two rooms. One is this room, with the giant globe. The other has the tall clock.\n\nReading saved this building. Look at the walls on your way out. They are stacked with the books nobody wanted.",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
