/* Reading level 2 (2nd grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 2 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[2] = {
    level: 2,
    howto: [
      "Your home base is a boarded-up house. It sits at the south end of town. You have one van, and it still runs. A fence runs around the yard. Walkers come at the fence in waves. Between waves it is calm. That is when you build or leave. In a wave, clear the fence first. Each day you drive out for supplies. Then you drive home.",
      "Pick a place on the map. Only some places are known at first. Notes and the Radio room show you more. The road is drawn for you. Then you drive. Walkers are on the road. Far places and bad places have more walkers. More days means more walkers, too.",
      "At the door, you read a note first. It says how many walkers wait inside. It says where the items are. Then you go in. Walkers come for you. Shoot them, or move around them. Grab items from shelves and floors. Find the note inside. Read it. It tells you how to open the locked cache room. The best items are in there. It also tells you which place to try next. Every note goes in your backpack. You can read it again any time.",
      "Drive home with your cargo. At base, cargo goes into storage. You eat one food. The day count goes up. Use items and scrap to upgrade rooms. Upgrade the van and the gun in the garage. The game saves only at base. It saves on its own. If the van is wrecked, you load that save. If you go down inside, you load it. If you go down in the yard, you load it. Everything since that save is gone. So plan each trip.",
    ],
    base: {
      intro: "This is home base. It is the only place the game saves. Build up the rooms, then head back out.",
      rooms: {
        walls: {
          desc: "Boards and plates on the fence, house, and van. The fence holds longer in a wave. Thicker walls mean more health. For the van, and for you on foot.",
          next: [
            "The fence holds longer. Van health up 20. Your health on foot up 20.",
            "The fence holds longer. Van health up 40. Your health on foot up 40.",
            "The fence holds longer. Van health up 60. Your health on foot up 60. Needs an armor plate.",
          ],
        },
        garage: {
          desc: "The shop for the van and the gun. A better garage unlocks better upgrades. It also fixes the van for free.",
          next: [
            "Van and gun upgrades up to tier 3. Free van repair at base.",
            "Van and gun upgrades up to tier 4. Free van repair at base.",
            "Van and gun upgrades up to tier 5. Free van repair at base. Needs gun parts.",
          ],
        },
        power: {
          desc: "A generator and lights. Power shows you how bad each place is. Later it helps you on the road.",
          next: [
            "The map shows the danger at each place.",
            "The map shows danger. You find one supply crate on each drive.",
            "The map shows danger. Two supply crates on each drive. Headlights beat night and fog.",
          ],
        },
        water: {
          desc: "Clean water. You heal while you are on foot. More water means faster healing.",
          next: [
            "You slowly heal on foot. Rate 1.",
            "You heal on foot. Rate 2.",
            "You heal fast on foot. Rate 3. You start every building at full health.",
          ],
        },
        garden: {
          desc: "Beds of dirt and seeds. The garden grows food. Every trip eats one food. No food means a weak van.",
          next: [
            "Grows 1 food a day.",
            "Grows 2 food a day.",
            "Grows 3 food a day. Needs a water tank.",
          ],
        },
        radio: {
          desc: "A radio on the roof. It picks up voices from across town. They tell you where places are.",
          next: [
            "Shows 3 new places on the map.",
            "Shows every place on the map.",
            "Shows every place. Also shows which places still have items.",
          ],
        },
        medbay: {
          desc: "A room with beds and medical kits. Doc's rules. You get hurt less, and you can get back up.",
          next: [
            "Walker hits hurt you 20 percent less on foot.",
            "Hits hurt 20 percent less. One revive per trip if you go down.",
            "Hits hurt 30 percent less. One revive per trip. The van takes 20 percent less damage.",
          ],
        },
        archive: {
          desc: "Shelves of books and maps. Your notes show what is left at each place. The map learns it, too.",
          next: [
            "Backpack notes show what is still at that place.",
            "Notes show stock. The map shows which places have a cache.",
            "Notes show stock. The map shows caches and what is left everywhere.",
          ],
        },
      },
    },
    locations: {
      gasngo: {
        blurb: "A small gas station with fuel and a locked storeroom.",
        door: {
          title: "Ruby's Warning",
          text: "Ruby here. At least two walkers inside. One near the back wall. One on the pumps side. More come as days pass. Fuel cans are on the floor, not the shelves. Locked storeroom: on the right, by the door. Clerk's note: on the counter.",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Note at the Register",
            text: "This is Dev. I ran the register here. The storeroom key is on the hook under the counter. You can open the storeroom now. There is more fuel in there. There is a spool of wire, too.\n\nI am going to Ortiz Auto. It is on the east side of town. The shop is still standing. Rosa is at Greenhouse Row. That is west, past this gas station. She has seeds and soil.",
          },
        },
      },
      grocery: {
        blurb: "A corner store with food and a cold cooler.",
        door: {
          title: "Doc Lin on the Glass",
          text: "Doc Lin. The front shelves are mostly picked over. Leftover food is on the floor, far aisle. Walkers get in through the back loading door. Expect at least two. The walk-in cooler is cold and locked. Manager's note: on the counter at the back wall.",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Trick",
            text: "I am Hana, the store manager. The cooler latch is stuck, not broken. Lift the latch while you pull. It opens every time. So you can open the cooler now. Inside there is food. There is one medical kit, too.\n\nTry Mile 9 Pharmacy next. It is west of here. Last week it still had medicine on the shelves. I hope it still does.",
          },
        },
      },
      hardware: {
        blurb: "A big hardware store with nails, tools, and lumber.",
        door: {
          title: "Mr. Reyes Nailed This Up",
          text: "Mr. Reyes, owner. At least three walkers inside. Two are in the middle aisles. One is near the front door. Nails: shelf near the front. Tools: middle aisle. Lumber: the back. The back room is locked. My note is by the paint shelves.",
        },
        notes: {
          "hardware-paint": {
            title: "The Sticky Door Trick",
            text: "Mr. Reyes again. The back room door just sticks. Lift the handle and push hard. You can open the back room now. I left a water filter in there. There is a second tool kit and some lumber.\n\nNeed more wood? Ridge Lumber is on the east ridge. It has stacks of lumber. Need more filters? The Water Tower is on the west side. More filters are in its pump house.",
          },
        },
      },
      pharmacy: {
        blurb: "A small pharmacy with medical kits and a cabinet room.",
        door: {
          title: "Mr. Okafor's Door Note",
          text: "Mr. Okafor, pharmacist. Medical kits are on the low shelves. Look near the middle of the store. At least three walkers are inside. Most of them stay near the back. The cabinet room is locked. The code is on my note at the counter.",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Room Code",
            text: "Mr. Okafor here. The cabinet room code is 4471. Punch it in and the door opens. You can open the cabinet room now. Inside are two more medical kits. There is a water filter, too.\n\nIf you need more, go north. St. Anne Annex is the hospital in the north hills. It still has medicine and a generator. But be careful. It is the most dangerous place in town.",
          },
        },
      },
      autoshop: {
        blurb: "A repair shop with engine parts and a generator pit.",
        door: {
          title: "Dev's Chalk Note",
          text: "Dev, from the Gas-N-Go. Engine parts: on the workbenches. One on the left wall. One in the back right corner. At least three walkers inside. One wanders by the crates, back left corner. The service pit hatch is locked. Mr. Ortiz's note: by the office.",
        },
        notes: {
          "autoshop-office": {
            title: "Mr. Ortiz on the Hatch",
            text: "This is Mr. Ortiz. The hatch bolt looks stuck. It is not. Twist the bolt to the left. It comes right out. You can open the service pit now. My generator is down in the pit. There are spare parts and a fuel can with it.\n\nSignal Electronics is downtown. It still has wire and radio parts. But it is near the walker crowds. Go in fast, and get out faster.",
          },
        },
      },
      radioshack: {
        blurb: "An electronics store with wire, near the walker crowds.",
        door: {
          title: "Jo's Sign in the Window",
          text: "Jo wrote this. Spools of wire are on the shelves. Check the middle rows. At least four walkers are inside. One stays near the counter on the back wall. The manager's office is locked. The manager's note is on the counter at the back.",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Key Under the Register",
            text: "I am Priya, the manager. The office key is taped under the register. Feel for it. Now you can open my office. Inside are two boxes of radio parts. There is more wire, too.\n\nTwo places are north of downtown. The 4th Precinct is the police station. It has gun parts. Lincoln Middle School has books. Both are worth the drive.",
          },
        },
      },
      garden: {
        blurb: "Greenhouses with seeds, soil, and a locked potting shed.",
        door: {
          title: "Rosa Painted the Gate",
          text: "Rosa, who ran this greenhouse. Seed packets are on the bench near the front. Soil bags are stacked in the middle. At least three walkers inside. One stays near the back. The potting shed is locked. My note is on the potting bench, back right.",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Watering Can",
            text: "Rosa again. The shed has a padlock. The key is in the watering can. Reach in and grab it. You can open the potting shed now. There are more seeds in the shed. There is a water tank, too.\n\nStation 12 is the fire station. It is north of here. The equipment bay has tools and water tanks. Chief Dunn runs it. Tell him Rosa sent you.",
          },
        },
      },
      police: {
        blurb: "The police station: gun parts, armor, and an armory.",
        door: {
          title: "Sergeant Vega's Notice",
          text: "Sergeant Vega. Gun parts: squad room. Armor plate: the garage room on the right. At least five walkers inside. One big one waits in the garage room. The armory is locked. My note at the front desk has the combination.",
        },
        notes: {
          "police-desk": {
            title: "The Armory Combination",
            text: "Sergeant Vega again. The armory combination is 19-4-33. Spin it slow. Left, right, left. You can open the armory now. There are gun parts inside. There is an armor plate, too. Take what you can carry.\n\nThe Public Library is north of downtown. It has books in its archive room. The librarian stayed. Her name is Mrs. Greer.",
          },
        },
      },
      school: {
        blurb: "A middle school with boxes of books in the classrooms.",
        door: {
          title: "Max and Mia Were Here",
          text: "Max and Mia. Boxes of books: back right classroom and bottom left room. At least four walkers inside. One walks the hallway. The library closet is locked. The key is in the teacher's note. Find it in the back left classroom.",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk",
            text: "I am Ms. Adler. I taught in this room. The library closet key is in my desk. Open the top drawer. You can open the closet now. It holds boxes of books. There is a folder of city maps, too. Keep them dry.\n\nNorthgate Mall is to the north. It has food, medicine, and wire. But the crowds there are the worst in town. Go only if you must.",
          },
        },
      },
      firehouse: {
        blurb: "A fire station with tools and water tanks.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Chief Dunn. Tool kit: the back office. Go through the door behind the desk. Water tank: the truck bay on the right. At least four walkers inside. One is in the truck bay. The equipment bay is locked. My note is on the front desk.",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "Chief Dunn again. Look at the key board behind the desk. Take the red key. It opens the equipment bay lock. You can open the bay now. There is a water tank in there. There is lumber and a set of tools, too.\n\nNeed water filters? Try the Water Tower. It is on the west side of town. The filters are in its pump house. Theo looks after the pumps.",
          },
        },
      },
      hospital: {
        blurb: "The north hills hospital, with medicine and the worst walkers.",
        door: {
          title: "Doc Lin on the Ambulance",
          text: "Doc Lin. Medical kits: the rooms along the top hall. More in the bottom left room. Generator: bottom right room. At least six walkers inside. They stand in the dark rooms. The pharmacy stock room is locked. Nurse's note: top hall.",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada Stayed",
            text: "I am Nurse Ada. I stayed when the others left. The stock room needs a badge. Mine is in the drawer under this station. Take it. You can open the stock room now. There are three medical kits inside. Use them well.\n\nStay quiet in here. The walkers follow sound more than light. Do not run. Do not shout. Walk soft, and they may not turn.",
          },
        },
      },
      watertower: {
        blurb: "The pump building under the tower, full of water filters.",
        door: {
          title: "Theo's Fence Note",
          text: "Theo here. I tend the pumps. Water filters are on the floor by the crates. At least four walkers are inside the pump building. The pump house is locked. My note is on the control panel inside.",
        },
        notes: {
          "watertower-panel": {
            title: "Turn the Valve",
            text: "Theo again. The pump house key is in the breaker box. Open the gray box on the wall. The key hangs inside. You can open the pump house now. There are filters in there. There is a water tank and some wire, too.\n\nSt. Anne Annex is the hospital. It is north, along the river road. It still has medicine. But it is the most dangerous place in town.",
          },
        },
      },
      lumberyard: {
        blurb: "A lumber yard on the east ridge, stacked with wood.",
        door: {
          title: "Ruby's Spray Paint",
          text: "Ruby again. Lumber is stacked in the racks. Check the middle and the back. At least five walkers are inside. They gather by the loading dock. The kiln shed is locked. The yard boss left a note on the paint rack.",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Clipboard",
            text: "Carla here. I am the yard boss. The kiln shed has a padlock with a code. The code is 2218. You can open the kiln shed now. The lumber in there is dry. There are nails, too.\n\nDo not run the saws. Not even once. The noise brings the whole dock crowd. Carry what you need and go.",
          },
        },
      },
      mall: {
        blurb: "The big north mall, full of goods and walkers.",
        door: {
          title: "Jo's Mall Door Note",
          text: "Jo here. Food, medicine, and wire are spread across the store floor. At least six walkers are inside. They move in one group. The security office is locked. The guard's note is by the paint display.",
        },
        notes: {
          "mall-guard": {
            title: "Luis Left the Code",
            text: "My name is Luis. I was a security guard here. The office code is 0912. Type it on the keypad. You can open the security office now. There are gun parts in there. There are radio parts and a tool kit, too.\n\nThe walkers here move as a group. If you run, they come running at you. So walk. Then most of them stay put. It feels wrong, but it works.",
          },
        },
      },
      library: {
        blurb: "The library north of downtown, with books and maps.",
        door: {
          title: "Mrs. Greer's Book Drop",
          text: "Mrs. Greer, librarian. Boxes of books are in the reading rooms. Those rooms are on both sides. At least five walkers are inside. Two are in the main hall. The archive room is locked. My note is in the back left reading room.",
        },
        notes: {
          "library-desk": {
            title: "The Key in the Dictionary",
            text: "Mrs. Greer again. The archive key is in the big dictionary. It is on this desk. Open the book to the middle. The key is taped there. You can open the archive room now. It has boxes of books. There is a folder of city maps, too.\n\nReading saved this building. The walls are stacked with books. They are the books nobody wanted. They stop the walkers just fine.",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
