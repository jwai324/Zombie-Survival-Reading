/* Reading level 1 (1st grade) text for Zombie Survival.
   Facts come from js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 1 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[1] = {
    level: 1,
    howto: [
      "You have one van. It runs from home base. Pick a place on the map. Then drive there. The road has walkers. Keep moving. The Radio room finds new places. They show up on the map.",
      "A note waits at the door. Read it. It says how many walkers wait. It says where the items are. Then go in. Each doorway is a real door. Press E to open it. Press E to shut it. Walkers cannot open doors. Grab what you find. Shelf stuff comes back in 3 days. Caches never do.",
      "Find the note inside. It tells how to open the cache. The cache has the best stuff. It names a new place too. Notes go in your backpack. Want back in? Open the map. Pick the place you are at. It stays as you left it. Hurt? Use a Medical kit. One kit heals you to full. The backpack holds 3 kits. Pack them at the cabin.",
      "At home you stand in the yard. Calm means no walkers. Build, or leave in the van. A wave means walkers at the fence. They claw holes in it. The fence does not fix itself. Stand at a hole and press E. Each hole costs 1 scrap. Build Walls up to remake it all. Set traps too. Press T or R. A walker steps on one and gets hurt.",
      "Build at the workbench in the garage. Each build is a typing round. Type the words on the screen. A timer runs. Out of time? Try again. Nothing is spent till you finish. First the bench shows where your fingers go. Each round moves you up. Repairs need no typing. Scrap fixes the van to full.",
      "Later, dig a Well for water. Build a Farm for food. Build a Lab to make Medical kits. Each player has a save. Up to 4 saves. Pick yours on the title screen. The game saves at base only. Go down, and you start from your last save.",
    ],
    controls: [
      "Road: Aim with the mouse. Hold to shoot. A and D move the van.",
      "Inside and in the yard: W A S D move. The mouse looks. Click shoots. Shift runs. B opens the backpack. P stops the game.",
      "E does it all: E reads notes. E opens and shuts doors. E opens a cache. E leaves a building. E goes in the cabin. E starts the van. E fixes a fence hole for 1 scrap.",
      "Traps in the yard: T sets a spike trap. R sets a blast trap. It goes in front of you, or just past the fence.",
      "Backpack: Your notes and your kits. Use a kit to heal to full.",
      "Workbench: Building is a typing round. Type what you see. Beat the timer. Out of time? Try again.",
      "Map: Tap a place. Then Drive. At a place, you can go back in.",
    ],
    base: {
      intro: "Home base. The game saves here, and only here. Hold the fence when walkers come.",
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
        "keep", "fix", "dig",
      ],
      phrases: [
        "hold fast", "read it", "go in", "get gas", "fix it", "set trap", "run home", "hold on",
        "lock door", "open door", "shut door", "grab food", "pack kit", "use kit", "dig well", "feed hens",
        "plant corn", "drive home", "save game", "find key", "read note", "take scrap", "keep calm", "stay low",
        "walk slow", "turn left", "head east", "go west", "pick up", "fix fence", "load van", "fill tank",
        "stay put", "look out", "move on",
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
      ],
    },
    locations: {
      gasngo: {
        blurb: "Fuel cans on a gas station floor.",
        door: {
          title: "Ruby's Warning",
          text: "At least two walkers. One: back wall. One: by the pumps. More come each day.\n\nFuel: floor. Storeroom: right side, next to the door. Locked. Clerk's note: counter.\n\n—Ruby",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Counter Note",
            text: "The storeroom key hangs under the counter. You can open the storeroom now. More fuel is in there. Wire too.\n\nI go east to Ortiz Auto. It still stands. Rosa has seeds and soil. She is at Greenhouse Row. Go west, past the gas station.\n\n—Dev, the clerk",
          },
        },
      },
      grocery: {
        blurb: "Small store, food on the floor.",
        door: {
          title: "Marker on the Glass",
          text: "Front shelves: bare. Food: on the floor, far aisle. Walkers use the back loading door. At least two.\n\nCooler is cold and locked. Manager's note: counter, back wall.\n\n—Doc Lin",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Trick",
            text: "I run this store. The cooler latch sticks. Lift it as you pull. Then it opens. Food is inside. One med kit too.\n\nNeed more meds? Mile 9 Pharmacy is west of here. Meds sit on its shelves. As of last week.\n\n—Hana, manager",
          },
        },
      },
      hardware: {
        blurb: "Nails, tools, and lumber under one roof.",
        door: {
          title: "Nailed to the Door",
          text: "At least three walkers. Two: mid aisles. One: front door. Nails up front. Tools mid aisle. Lumber: back.\n\nBack room is locked. Note by the paint shelves.\n\n—Mr. Reyes, owner",
        },
        notes: {
          "hardware-paint": {
            title: "The Sticky Door",
            text: "The back room door sticks. Lift the handle and push. Then it opens. A water filter is inside. A second tool kit and lumber too.\n\nRidge Lumber is on the east ridge. It has stacks of lumber. The Water Tower: west side. Its pump house has more filters.\n\n—Mr. Reyes",
          },
        },
      },
      pharmacy: {
        blurb: "Med kits, behind three walkers.",
        door: {
          title: "Under the Tape",
          text: "Med kits: low shelves, mid store. At least three walkers. Most are near the back.\n\nCabinet room is locked. My counter note has the code.\n\n—Mr. Okafor, pharmacist",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Code",
            text: "The cabinet room code is 4471. Punch it in. The door opens. Two more med kits are inside. And a water filter.\n\nThe hospital is St. Anne Annex. It is in the north hills. It still has meds. A generator too. It is the worst place in town.\n\n—Mr. Okafor",
          },
        },
      },
      autoshop: {
        blurb: "Engine parts up top, generator below.",
        door: {
          title: "Chalk on the Bay Door",
          text: "Engine parts: two benches. Left wall, back right. At least three walkers. One by the crates, back left.\n\nPit hatch is locked. Mr. Ortiz's note: by the office.\n\n—Dev, Gas-N-Go",
        },
        notes: {
          "autoshop-office": {
            title: "The Hatch Bolt",
            text: "The hatch has one bolt. Twist it left. It comes out. Then the pit opens. The generator is down there. Spare parts too. And a fuel can.\n\nSignal Electronics is downtown. It still has wire. And radio parts. But the walker crowds are close. Be fast.\n\n—Mr. Ortiz",
          },
        },
      },
      radioshack: {
        blurb: "Wire and radio parts near downtown crowds.",
        door: {
          title: "Cardboard in the Window",
          text: "Wire spools are on the shelves. Middle rows. At least four walkers. One near the back counter.\n\nThe manager's office is locked. Manager's note: back counter.\n\n—Jo",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Office Key",
            text: "The office key is under the register. Taped there. You can open my office now. Two boxes of radio parts are inside. And wire.\n\nGo north of downtown. The 4th Precinct police station is there. It has gun parts. Lincoln Middle School is there too. It has books.\n\n—Priya, manager",
          },
        },
      },
      garden: {
        blurb: "Seeds and soil at Rosa's greenhouses.",
        door: {
          title: "Paint on the Gate",
          text: "Seed packets: front bench. Soil bags: stacked mid-room. At least three walkers. One in back.\n\nPotting shed is locked. My note: potting bench, back right.\n\n—Rosa, who ran the greenhouse",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Shed Key",
            text: "The shed has a padlock. The key is in the watering can. Fish it out. Now you can open the shed. More seeds are in there. A water tank too.\n\nStation 12 is the fire station. It is north of here. Its equipment bay has tools. And water tanks.\n\n—Rosa",
          },
        },
      },
      police: {
        blurb: "Gun parts and armor, five walkers deep.",
        door: {
          title: "Notice Board",
          text: "Gun parts: squad room. Armor plate: garage room, right side. At least five walkers. Big one: garage room.\n\nArmory is locked. My front desk note has the code.\n\n—Sergeant Vega",
        },
        notes: {
          "police-desk": {
            title: "The Armory Code",
            text: "The armory lock is a dial. The code is 19-4-33. Spin it. The door opens. Gun parts are inside. An armor plate too.\n\nThe Public Library is north of downtown. It has books in its archive room. The librarian is still there.\n\n—Sergeant Vega",
          },
        },
      },
      school: {
        blurb: "Classrooms of books, maps in the closet.",
        door: {
          title: "Max and Mia's Note",
          text: "Books: back right classroom, bottom left room. At least four walkers. One in the hall.\n\nLibrary closet is locked. Key: in the teacher's note. Back left classroom.\n\n—Max and Mia",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk Drawer",
            text: "The closet key is in my desk. Top drawer. Now you can open the library closet. Books are inside. And a folder of city maps.\n\nNorthgate Mall is north of here. It has food, meds, and wire. But the crowds there are the worst. Worst in town.\n\n—Ms. Adler, teacher",
          },
        },
      },
      firehouse: {
        blurb: "Tools and water tanks at Station 12.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Tool kit: back office. Door behind the desk. Water tank: truck bay, right side. At least four walkers. One: truck bay.\n\nEquipment bay: locked. My note: front desk.\n\n—Chief Dunn",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "The red key is on the board. It opens the equipment bay. Go open it now. A water tank is in there. Lumber too. And tools.\n\nThe Water Tower: west side. Filters are in its pump house. Get some.\n\n—Chief Dunn",
          },
        },
      },
      hospital: {
        blurb: "Meds and a generator, worst in town.",
        door: {
          title: "On the Ambulance Doors",
          text: "Med kits: top hall rooms, bottom left. Generator: bottom right room. At least six walkers. They wait in dark rooms.\n\nStock room: locked. Nurse's note: top hall.\n\n—Doc Lin",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada's Badge",
            text: "I am still here. The stock room needs a badge. Look in the drawer under this station. Swipe it and the door opens. Three med kits are in there.\n\nStay quiet. The walkers here follow sound. Not light. Do not shout.\n\n—Nurse Ada",
          },
        },
      },
      watertower: {
        blurb: "Water filters, out on the west side.",
        door: {
          title: "On the Fence Gate",
          text: "Water filters: floor, by the crates. At least four walkers. In the pump building.\n\nPump house is locked. My note is on the panel inside.\n\n—Theo, I tend the pumps",
        },
        notes: {
          "watertower-panel": {
            title: "Theo's Panel Note",
            text: "Pump house key: in the breaker box. Grab it. Now you can open the pump house. Filters are in there. A water tank too. And wire.\n\nSt. Anne Annex is the hospital. Go north on the river road. It still has meds. It is the worst place in town.\n\n—Theo",
          },
        },
      },
      lumberyard: {
        blurb: "Lumber stacks, a dock full of walkers.",
        door: {
          title: "Spray Paint on the Gate",
          text: "Lumber is in the racks. Middle and back. At least five walkers. They gather by the loading dock.\n\nKiln shed is locked. Yard boss's note: on the paint rack.\n\n—Ruby",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Kiln Code",
            text: "I run this yard. The kiln shed has a padlock. The code is 2218. Punch it in. The shed opens. Dry lumber is in there. Nails too.\n\nDo not run the saws. The noise brings the dock crowd. All of them.\n\n—Carla, yard boss",
          },
        },
      },
      mall: {
        blurb: "Food, meds, wire, and the biggest crowd.",
        door: {
          title: "Jo's Mall Warning",
          text: "Food, meds, wire: all over the floor. At least six walkers. They move as one group.\n\nSecurity office is locked. Guard's note is by the paint display.\n\n—Jo",
        },
        notes: {
          "mall-guard": {
            title: "The Guard's Code",
            text: "I guard this mall. The office code is 0912. Punch it in. It opens. Gun parts are inside. Radio parts too. And a tool kit.\n\nRun, and the walkers here come running. Walk, and most of them stay put.\n\n—Luis, mall security",
          },
        },
      },
      library: {
        blurb: "Books both sides, maps in the archive.",
        door: {
          title: "On the Book Drop",
          text: "Book boxes are in the reading rooms. Both sides. At least five walkers. Two in the main hall.\n\nArchive room: locked. My note: back left reading room.\n\n—Mrs. Greer, librarian",
        },
        notes: {
          "library-desk": {
            title: "The Dictionary Key",
            text: "The archive key is in a book. The big dictionary on this desk. Open it. Now the archive room opens. Books are in there. And a folder of city maps.\n\nReading keeps this building safe. The walls are stacked with books. The ones no one wanted.\n\n—Mrs. Greer",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
