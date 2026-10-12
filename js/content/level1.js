/* Reading level 1 (1st grade) text for Zombie Survival.
   Facts come from js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 1 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[1] = {
    level: 1,
    howto: [
      "You have one van. It runs from your home base. Pick a place on the map. Then drive there. The road has walkers. Keep moving.",
      "A note waits at the door. Read it. It says how many walkers wait. It says where the items are. Then go in. Walkers come for you. Fight them. Grab what you find. Scrap piles give scrap.",
      "Find the note inside. Read it. It tells how to open the cache. The cache has the best stuff. The note also names a new place. That place shows up on the map. Every note goes in your backpack. Read them again any time.",
      "Drive your cargo home. Use it to build rooms. Upgrade the van and gun. The game saves at base only. Wreck the van? You lose the trip. Go down inside? Same thing. You start from your last save. So pick when to head home.",
    ],
    base: {
      intro: "Home base is the one safe spot. The game saves here, and only here.",
      rooms: {
        walls: {
          desc: "Thick walls. They make the van and you tougher.",
          next: [
            "Van gets 20 more health. You get 20 more too.",
            "Van gets 40 more health. You get 40 more too.",
            "Van gets 60 more health. You get 60 more too.",
          ],
        },
        garage: {
          desc: "A work bay for van and gun.",
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
            "Shows three new places on the map.",
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
          desc: "Notes and maps, sorted and kept.",
          next: [
            "Notes show what a place still has.",
            "Notes show what is left. The map shows caches.",
            "Notes show what is left. The map shows caches and stock.",
          ],
        },
      },
    },
    locations: {
      gasngo: {
        blurb: "Fuel cans on a gas station floor.",
        door: {
          title: "Ruby's Warning",
          text: "At least two walkers. One at the back wall. One by the pumps. More come each day.\n\nFuel cans: on the floor. Back storeroom is locked. Clerk's note: counter.\n\n—Ruby",
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
          text: "Front shelves are bare. Food: on the floor, far aisle. Walkers use the back loading door. At least two.\n\nCooler is cold and locked. Manager's note: front counter.\n\n—Doc Lin",
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
          text: "Three walkers at least. Big one by the back lumber racks. Nails up front. Tools mid aisle.\n\nBack room is locked. Note by the paint shelves.\n\n—Mr. Reyes, owner",
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
          text: "Engine parts are on two benches. Front, back right. At least three walkers. One by the door crates.\n\nPit hatch is locked. Mr. Ortiz's note: by the office.\n\n—Dev, Gas-N-Go",
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
          text: "Wire spools are on the shelves. Middle rows. At least four walkers. One is near the front counter.\n\nThe manager's office is locked. Manager's note is up front.\n\n—Jo",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Office Key",
            text: "The office key is under the register. Taped there. You can open my office now. Two boxes of radio parts are inside. More wire too.\n\nGo north of downtown. The 4th Precinct is there. It has gun parts. Lincoln Middle School is there too. It has books.\n\n—Priya, manager",
          },
        },
      },
      garden: {
        blurb: "Seeds and soil at Rosa's greenhouses.",
        door: {
          title: "Paint on the Gate",
          text: "Seed packets: front bench. Soil bags: stacked mid-room. At least three walkers. One in back.\n\nPotting shed is locked. My note: shelf by the bench.\n\n—Rosa, who ran the greenhouse",
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
          text: "Book boxes: classrooms, right side. At least four walkers. One in the hall.\n\nLibrary closet is locked. The key is in the teacher's note. First classroom.\n\n—Max and Mia",
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
          text: "Tool kit: front office. Water tank: truck bay, right side. At least four walkers. One in the truck bay.\n\nEquipment bay is locked. My note: front desk.\n\n—Chief Dunn",
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
            text: "Pump house key: in the breaker box. Grab it. Now you can open the pump house. Filters are in there. A water tank too. And wire.\n\nOne more thing. Turn the valve by the door. Do it before you leave. Then the tower keeps feeding the town.\n\n—Theo",
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
            text: "I guard this mall. The office code is 0912. Punch it in. It opens. Gun parts are inside. Radio parts too. And a tool kit.\n\nThe walkers here move as a pack. They chase anyone who runs. So walk. Walk, and they lose you.\n\n—Luis, mall security",
          },
        },
      },
      library: {
        blurb: "Books both sides, maps in the archive.",
        door: {
          title: "On the Book Drop",
          text: "Book boxes are in the reading rooms. Both sides. At least five walkers. Two in the main hall.\n\nArchive room is locked. My note: first reading room.\n\n—Mrs. Greer, librarian",
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
