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
      "A note waits at each door. Read it. It says how many walkers wait. It says where the items are. Buildings are big inside. Each corner has a landmark. The notes name them. Use them to find your way. Press M for a map. It shows the parts you have seen. Each doorway is a real door. Press E to open or shut it. Walkers cannot open doors. Shelf stuff comes back in 3 days. Caches never do.",
      "Find the note inside. It tells how to open the cache. The cache has the best stuff. It may name a new place too. Notes go in your backpack. Want back in? Open the map. Pick the place you are at. It stays as you left it. Hurt? Use a Medical kit. One kit heals you to full. The backpack holds 3 kits. Pack them at the cabin.",
      "At home you stand in the yard. Calm means no walkers. Build, or leave in the van. A wave means walkers at the fence. They claw holes in it. The fence does not fix itself. Stand at a hole and press E. Each hole costs 1 scrap. Set traps too. Press T or R. A walker steps on one and gets hurt. What you build shows up in the yard. Each level makes it bigger and stronger. The Walls room changes the fence itself. Later, dig a Well for water. Build a Farm for food. Build a Lab to make Medical kits.",
      "Build at the workbench in the garage. Each build is a typing round. Type the words on the screen. A timer runs. Out of time? Try again. Nothing is spent till you finish. First the bench shows where your fingers go. Repairs need no typing. Scrap fixes the van to full. Each player has a save. Up to 4 saves. Pick yours on the title screen. The game saves at base only. Go down? You start from your last save.",
    ],
    controls: [
      "Road: Aim with the mouse. Hold to shoot. A and D change lanes. So do the arrow keys and side buttons. Your lane skips side streets and lots. Lot on the right? Use the right lane. Lot on the left? Use the turn lane. It is on the far left. Where roads meet, each road has a lane. Yours may turn! Read the sign. Get in the lane with your arrow. Be in it before the white line.",
      "Inside and in the yard: W A S D move. The mouse looks. Click shoots. Shift runs. B opens the backpack. M shows a map of the building. P stops the game.",
      "E does it all: E reads notes. E opens and shuts doors. E opens a cache. E leaves a building. E goes in the cabin. E starts the van. E fixes a fence hole for 1 scrap.",
      "Traps in the yard: T sets a spike trap. R sets a blast trap. It goes in front of you. Or just past the fence.",
      "Guns: More guns hide in buildings. Walk on one to get it. Take it home to keep it. Q picks a gun. So do 1 to 5. Hold to pull the bow. Let go to shoot. Use scrap at the cabin to make guns better.",
      "Backpack: Your notes and your kits. Use a kit to heal to full.",
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
    locations: {
      gasngo: {
        blurb: "Fuel cans on a gas station floor.",
        door: {
          title: "Ruby's Warning",
          text: "At least three walkers. More come each day. One is in the garage, by the car lift.\n\nFuel: by the slushie machine. More in the garage, by the tire tower.\n\nStoreroom: locked. Clerk's note: front counter.\n\n—Ruby",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Counter Note",
            text: "Key: on the hook under this counter. Now you can open the storeroom. It has more fuel and wire.\n\nTake the back hall. Go away from the ice machine. Storeroom: last door before the garage.\n\nI head east to Ortiz Auto. It still stands. Rosa is west, at Greenhouse Row. She has seeds and soil.\n\n—Dev, the clerk",
          },
        },
      },
      grocery: {
        blurb: "Small store, food on the floor.",
        door: {
          title: "Marker on the Glass",
          text: "Shelves: bare. Food: on the floor, by the fish tank. More by the freezers, right side.\n\nAt least three walkers. They use the loading door, back by the forklift.\n\nCooler: locked. Manager's note: office, back left.\n\n—Doc Lin",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Trick",
            text: "I run this store. The cooler latch sticks. Lift it as you pull. Then it opens. Food is inside. One med kit too.\n\nLeave this office. Go toward the forklift. The cooler is the next door.\n\nNeed meds? Mile 9 Pharmacy is west of here. Its shelves had meds last week.\n\n—Hana, manager",
          },
        },
      },
      hardware: {
        blurb: "Nails, tools, and lumber under one roof.",
        door: {
          title: "Nailed to the Door",
          text: "At least five walkers. Two are in the middle aisles.\n\nNails: by the toilet display. Tools: middle aisle. Lumber: in the back racks.\n\nBack room: locked. My note: by the paint mixer, back left.\n\n—Mr. Reyes, owner",
        },
        notes: {
          "hardware-paint": {
            title: "The Sticky Door",
            text: "The back room door sticks. Lift the handle, then push. It opens. Inside: a water filter, a tool kit, lumber.\n\nTake the side door by the paint mixer. The back room is past the lumber racks.\n\nRidge Lumber is on the east ridge. It has stacks of lumber. The Water Tower is west. Its pump house has filters.\n\n—Mr. Reyes",
          },
        },
      },
      pharmacy: {
        blurb: "Med kits, behind five walkers.",
        door: {
          title: "Under the Tape",
          text: "At least five walkers. Most are in back.\n\nMed kits: by the giant toothbrush. One more where the aisles cross.\n\nCabinet room: locked. Code note: behind the counter. Go in on the right, by the wheelchairs.\n\n—Mr. Okafor",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Code",
            text: "Cabinet room code: 4471. Punch it in. It opens. Two more med kits are inside. And a water filter.\n\nIts door is behind this counter. Corner by the wheelchairs.\n\nSt. Anne Annex is the hospital. It is in the north hills. It still has meds. A generator too. It is the worst place in town.\n\n—Mr. Okafor",
          },
        },
      },
      autoshop: {
        blurb: "Engine parts up top, generator below.",
        door: {
          title: "Chalk on the Bay Door",
          text: "At least five walkers. One roams by the engine crane.\n\nEngine parts: on the benches. Back right, by the red tool chest. Left bay too.\n\nPit hatch: locked. Ortiz's note: office, behind the waiting room.\n\n—Dev, Gas-N-Go",
        },
        notes: {
          "autoshop-office": {
            title: "The Hatch Bolt",
            text: "Twist the hatch bolt left. It comes out. Now the pit opens. The generator is down there. Spare parts too. And a fuel can.\n\nThe pit room is in the middle. Hatch: front side, toward the oil drums.\n\nSignal Electronics is downtown. It still has wire and radio parts. But the walker crowds are close.\n\n—Mr. Ortiz",
          },
        },
      },
      radioshack: {
        blurb: "Wire and radio parts near downtown crowds.",
        door: {
          title: "Cardboard in the Window",
          text: "Wire: between the long middle shelves. One spool on the TV wall side. One on the robot side.\n\nAt least six walkers. One by the robot, at the counter's right end.\n\nOffice: locked. Manager's note: back counter.\n\n—Jo",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Office Key",
            text: "Key: taped under the register. Now you can open my office. Two boxes of radio parts are inside. More wire too.\n\nThe office door is in the back wall. It is just left of the robot.\n\nGo north of downtown. The 4th Precinct has gun parts. That is the police station. Lincoln Middle School has books.\n\n—Priya, manager",
          },
        },
      },
      garden: {
        blurb: "Seeds and soil at Rosa's greenhouses.",
        door: {
          title: "Paint on the Gate",
          text: "Soil: my big greenhouse, by the scarecrow. Seeds: by the big gnome, near the gate.\n\nAt least five walkers. One in back of the big greenhouse.\n\nPotting shed: locked. My note: by the palm tree, back right.\n\n—Rosa",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Shed Key",
            text: "Padlock key: in the watering can. Fish it out. Now you can open the potting shed. It has more seeds and a water tank.\n\nGo from the palm tree house toward the beehives. The shed door is on that path.\n\nStation 12, the fire station, is north. Its equipment bay has tools and water tanks.\n\n—Rosa",
          },
        },
      },
      police: {
        blurb: "Gun parts and armor, eight walkers deep.",
        door: {
          title: "Notice Board",
          text: "At least eight walkers. Gun parts: squad room, left of the long hall.\n\nGarage: on the right. Big walker: by the police bike. Armor plate: by the riot shields.\n\nArmory: locked. Code: my note, front desk.\n\n—Sergeant Vega",
        },
        notes: {
          "police-desk": {
            title: "The Armory Code",
            text: "The armory lock is a dial. The code is 19-4-33. Spin it. The door opens. Inside: gun parts and an armor plate.\n\nGo to the back hall. Head toward the police bike. Armory: last door before the garage.\n\nThe Public Library is north of downtown. Its archive room has books. The librarian is still there.\n\n—Sergeant Vega",
          },
        },
      },
      school: {
        blurb: "Classrooms of books, maps in the closet.",
        door: {
          title: "Max and Mia's Note",
          text: "Books: music room, by the drum set. And the front office, behind the lion statue.\n\nAt least six walkers. One in the main hall.\n\nLibrary closet: locked. Key: science teacher's note, by the big brain.\n\n—Max and Mia",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk Drawer",
            text: "Key: my top desk drawer. Now the library closet opens. Inside: books, a folder of city maps.\n\nTake the main hall. Head for the drum set room. The library is next to it. Closet: back corner, drum set side.\n\nNorthgate Mall is north. It has food, meds, and wire. Its crowds are the worst in town.\n\n—Ms. Adler, teacher",
          },
        },
      },
      firehouse: {
        blurb: "Tools and water tanks at Station 12.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Tool kit: office, behind the watch desk. Water tank: past the gear racks, right wall.\n\nAt least six walkers. Two in the truck bay.\n\nEquipment bay: locked. My note: watch desk, by the spotted dog.\n\n—Chief Dunn",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "The red key is on the board. It opens the equipment bay. Go open it now. Inside: a water tank, lumber, tools.\n\nGo to the back of the truck bay. Locked door: by the fire truck. It is on the gear racks side.\n\nThe Water Tower is on the west side. Its pump house has filters.\n\n—Chief Dunn",
          },
        },
      },
      hospital: {
        blurb: "Meds and a generator, worst in town.",
        door: {
          title: "On the Ambulance Doors",
          text: "Med kits: room next to the x-ray machine. And by the giant teddy bear. Generator: utility room, right side.\n\nAt least nine walkers, in dark rooms.\n\nStock room: locked. Note: nurses' station, in the middle.\n\n—Doc Lin",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada's Badge",
            text: "I am still here. The stock room needs a badge. Badge: in the drawer under this station. Swipe it. The door opens. Three med kits are inside.\n\nStock room door: in this room. Cross the walkway from this desk. It is on the angel statue side.\n\nStay quiet. Walkers here follow sound more than light. Do not shout.\n\n—Nurse Ada",
          },
        },
      },
      watertower: {
        blurb: "Water filters, out on the west side.",
        door: {
          title: "On the Fence Gate",
          text: "Filters: by the crates near the big red wheel. And in the boat shop, by the rowboat.\n\nAt least six walkers inside.\n\nPump house: locked. My note: control panel, back right room.\n\n—Theo, I tend the pumps",
        },
        notes: {
          "watertower-panel": {
            title: "Theo's Panel Note",
            text: "Key: in the breaker box. Now the pump house opens. Inside: filters, a water tank, wire.\n\nIts door: back of the pump hall. It is at the blue pump end. Not by the big red wheel.\n\nSt. Anne Annex, the hospital, is north. Take Hill Road. It still has meds. It is the worst place in town.\n\n—Theo",
          },
        },
      },
      lumberyard: {
        blurb: "Lumber stacks, a dock full of walkers.",
        door: {
          title: "Spray Paint on the Gate",
          text: "Lumber: middle racks. More by the log pile. A big walker waits there!\n\nAt least eight walkers. A group is at the dock and flatbed truck.\n\nKiln shed: locked. Yard boss's note: clipboard by the band saw.\n\n—Ruby",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Kiln Code",
            text: "The kiln shed has a padlock. The code is 2218. Punch it in. The shed opens. Dry lumber is in there. Nails too.\n\nDoor: back wall of the rack hall. Leave the saw shop. Go along it toward the log pile.\n\nDo not run the saws. The noise brings the dock crowd. All of them.\n\n—Carla, yard boss",
          },
        },
      },
      mall: {
        blurb: "Food, meds, wire, and the biggest crowd.",
        door: {
          title: "Jo's Mall Warning",
          text: "Food: food court, in back. Meds: pharmacy, on the left. Wire: gadget store, by the orange tent.\n\nAt least nine walkers. Lots of them stand in the main hall.\n\nOffice: locked. Guard's note: by the green dino.\n\n—Jo",
        },
        notes: {
          "mall-guard": {
            title: "The Guard's Code",
            text: "I guard this mall. The office code is 0912. Punch it in. It opens. Inside: gun parts, radio parts, a tool kit.\n\nGo to the back of the food court. Take the kitchen door. Turn right. The office is behind the green dino.\n\nRun, and the walkers here come running. Walk, and most of them stay put.\n\n—Luis, mall security",
          },
        },
      },
      library: {
        blurb: "Books both sides, maps in the archive.",
        door: {
          title: "On the Book Drop",
          text: "Books: stacks, both sides of the main hall. And the kids' room, by the toy castle.\n\nAt least eight walkers. Two in the main hall.\n\nArchive: locked. My note: by the giant globe, back left.\n\n—Mrs. Greer, librarian",
        },
        notes: {
          "library-desk": {
            title: "The Dictionary Key",
            text: "Key: in the big dictionary on this desk. Now the archive room opens. Inside: books and a folder of city maps.\n\nWalk to the back of the main hall. The archive door is there. Giant globe room: left. Tall clock room: right.\n\nReading saved this place. The walls are stacks of books no one wanted.\n\n—Mrs. Greer",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
