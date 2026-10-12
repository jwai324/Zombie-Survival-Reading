/* Reading level 3 (3rd grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 3 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[3] = {
    level: 3,
    howto: [
      "Your home base is a boarded-up house at the south end of town. You have one van, and it still runs. Every day you drive out for supplies, and every night you bring them home. At base you stand in the yard, with a fence around the lot. In calm time, go inside the cabin to build, or leave in the van. Then a wave comes, and walkers claw at the fence. Some waves are nothing, and some are a crowd. Stronger Walls make the fence hold longer. The base is the only place where the game saves. It saves when you arrive, after every build, and after every wave.",
      "Open the map and pick a place. Only a few places are known at first. Notes and the Radio room reveal the rest. The route is drawn for you, and then you drive. Walkers wander the road. Far places and dangerous places have more of them. The more days pass, the more walkers there are.",
      "At the door you read a note before you go in. It tells you how many walkers wait inside and where the items are. Then you go in. Walkers come for you, so shoot them or slip around them. Grab items from shelves and floors. Those items come back three days after you take them. Cache items never do. Find the note inside and read it. It tells you how to open the locked cache room. The best items are kept in there. It also names the next place to try. That place then shows up on the map. Every note you read goes in your backpack. You can open the backpack at base, on the map, or inside a building.",
      "Drive home with your cargo. At base, cargo goes into storage, and you eat one food. The Garden adds food, and the day count goes up. Use items and scrap to upgrade the rooms. Upgrade the van and the gun in the garage. Three things end a run. The van gets wrecked, you go down inside, or the yard is overrun. Then the game loads your last base save. Everything since that save is gone, so plan each trip with care.",
    ],
    base: {
      intro: "This is home base, the only place the game saves. Build up the rooms, fix the van, and head back out.",
      rooms: {
        walls: {
          desc: "Boards and plates on the fence, the house, and the van. Thicker walls make the fence hold longer. They also mean more health for the van, and for you on foot.",
          next: [
            "Van health up by 20. Your health on foot up by 20. The fence holds longer.",
            "Van health up by 40. Your health on foot up by 40. The fence holds longer.",
            "Van health up by 60. Your health on foot up by 60. The fence holds longer. This level needs an armor plate.",
          ],
        },
        garage: {
          desc: "The shop for the van and the gun. A better garage unlocks higher upgrade tiers, and it repairs the van for free.",
          next: [
            "Van and gun upgrades up to tier 3. Free van repair at base.",
            "Van and gun upgrades up to tier 4. Free van repair at base.",
            "Van and gun upgrades up to tier 5. Free van repair at base. This level needs gun parts.",
          ],
        },
        power: {
          desc: "A generator and a string of lights. Power shows how dangerous each place is, and later it helps on the road.",
          next: [
            "The map shows the danger level at every place.",
            "The map shows danger. You find one supply crate on each drive.",
            "The map shows danger. You find two supply crates on each drive. Headlights beat night and fog.",
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
          desc: "Shelves of books and maps. Your notes learn what is left at each place, and so does the map.",
          next: [
            "Backpack notes show what is still at each place.",
            "Notes show stock. The map marks which places have a cache.",
            "Notes show stock. The map marks caches and what is left at every place. This level needs city maps.",
          ],
        },
      },
    },
    locations: {
      gasngo: {
        blurb: "A small gas station with fuel on the floor and a locked storeroom.",
        door: {
          title: "Ruby's Warning",
          text: "Ruby here. At least two walkers are inside. One stays near the back wall, and one by the pumps side. More come as the days pass, so do not wait. The fuel cans are on the floor, not on the shelves. The storeroom is on the right, next to the door, and it is locked. The clerk kept a note on the counter.",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Note at the Register",
            text: "This is Dev. I was the clerk here, and I ran the register. The storeroom key is on the hook under the counter. Feel for it with your hand. With that key, you can open the storeroom now. There is more fuel in there, and a spool of wire.\n\nI am going to Ortiz Auto on the east side of town. The shop is still standing, so I will try there first. Rosa is at Greenhouse Row. That is west, past this gas station. She has seeds and soil, and she left them out for people like you. Tell her Dev sent you.",
          },
        },
      },
      grocery: {
        blurb: "A corner store with leftover food and a cold walk-in cooler.",
        door: {
          title: "Doc Lin on the Glass",
          text: "Doc Lin. The front shelves are mostly picked over. The food that is left is on the floor by the far aisle. Walkers get in through the loading door at the back. Count on at least two. The walk-in cooler stays cold, and it is locked. The manager's note is on the counter at the back wall.",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Trick",
            text: "I am Hana, the store manager. The cooler latch is stuck, not broken. Lift the latch while you pull on the door, and it opens. So you can open the cooler now. Inside there is food, and there is one medical kit. The cold has kept it all good.\n\nWhen you need more medicine, try Mile 9 Pharmacy. It is west of here. Last week it still had medicine on its shelves. Mr. Okafor ran it, and he kept it stocked. Take what you need and leave the rest for the next person.",
          },
        },
      },
      hardware: {
        blurb: "A big hardware store with nails, tools, lumber, and a locked back room.",
        door: {
          title: "Mr. Reyes Nailed This Up",
          text: "Mr. Reyes, the owner. At least three walkers are inside. Two stay in the middle aisles, and one waits near the front door. Nails are near the front. Tools are in the middle aisle, and lumber is at the back. The back room is locked. My note is by the paint shelves.",
        },
        notes: {
          "hardware-paint": {
            title: "The Sticking Door",
            text: "Mr. Reyes again. The back room door sticks, and most people give up on it. The trick is to lift the handle and push at the same time. Do that, and you can open the back room now. Inside I left a water filter, a second tool kit, and lumber.\n\nIf you need more wood, go to Ridge Lumber on the east ridge. It has stacks of lumber in the yard. If you need more filters, try the Water Tower on the west side. There are more filters in its pump house. Theo runs the pumps, and he is fair.",
          },
        },
      },
      pharmacy: {
        blurb: "A small pharmacy with medical kits and a locked cabinet room.",
        door: {
          title: "Mr. Okafor's Door Note",
          text: "Mr. Okafor, the pharmacist. Medical kits are on the low shelves near the middle of the store. Look down, not up. At least three walkers are inside, and most of them stay near the back. The cabinet room is locked. The code is written on my note at the counter.",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Room Code",
            text: "Mr. Okafor here. The cabinet room has a keypad on the door. The code is 4471. Type it in, and the lock clicks open. You can open the cabinet room now. Inside are two more medical kits and a water filter. I left them for whoever came next.\n\nIf you need more than that, you will have to go north. St. Anne Annex is the hospital in the north hills. It still has medicine, and it has a generator. But hear me on this. It is the most dangerous place in town. Go in daylight, and go with a plan.",
          },
        },
      },
      autoshop: {
        blurb: "A repair shop with engine parts and a generator down in the service pit.",
        door: {
          title: "Dev's Chalk Note",
          text: "Dev here, from the Gas-N-Go. Engine parts are on the workbenches. One bench is on the left wall. The other is in the back right corner. At least three walkers are inside. One wanders near the crates in the back left corner. The service pit is covered by a locked hatch. Mr. Ortiz left a note by the office.",
        },
        notes: {
          "autoshop-office": {
            title: "Mr. Ortiz on the Hatch",
            text: "This is Mr. Ortiz. The hatch over the service pit looks stuck, but it is not. The bolt comes out if you twist it to the left. Give it a hard turn, and it slides free. You can open the service pit now. My generator is down in the pit. There are spare parts with it, and a fuel can.\n\nSignal Electronics is downtown. It still has wire and radio parts on the shelves. But it is near the walker crowds, and they drift that way at night. Go in fast and come out faster. Do not stay past dark.",
          },
        },
      },
      radioshack: {
        blurb: "An electronics store with spools of wire, close to the walker crowds.",
        door: {
          title: "Jo's Sign in the Window",
          text: "Jo wrote this. Spools of wire are on the shelves in the middle rows. At least four walkers are inside. One stays near the counter on the back wall. It will hear the door, so be ready. The manager's office is locked. The manager left a note on that back counter. Read it before you try that door.",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Key Under the Register",
            text: "I am Priya, the manager. The office key is taped under the register. Reach under the counter and feel along the edge. Peel it off, and you can open the manager's office now. Inside are two boxes of radio parts, and there is more wire. Take the parts first, since they are hard to find.\n\nTwo places are north of downtown. The 4th Precinct is the police station, and it has gun parts. Lincoln Middle School has books. Both are worth the drive, but the station is the harder one. Do not go there tired.",
          },
        },
      },
      garden: {
        blurb: "A row of greenhouses with seeds, soil, and a locked potting shed.",
        door: {
          title: "Rosa Painted the Gate",
          text: "Rosa here. I ran this greenhouse before the Fall. Seed packets are on the bench near the front. Soil bags are stacked in the middle of the floor. At least three walkers are inside, and one stays near the back. The potting shed is locked. My note is on the potting bench at the back, on the right.",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Watering Can",
            text: "Rosa again. The potting shed has a padlock on it. The key is in the watering can on the bench. Tip the can and let the key slide out. You can open the potting shed now. There are more seeds inside, and there is a water tank. Keep the seeds dry, or they are no good to anyone.\n\nStation 12 is the fire station north of here. Its equipment bay has tools and water tanks. Chief Dunn ran that station, and I think he is still there. Tell him Rosa sent you.",
          },
        },
      },
      police: {
        blurb: "The 4th Precinct: gun parts, an armor plate, and a locked armory.",
        door: {
          title: "Sergeant Vega's Notice",
          text: "Sergeant Vega. Gun parts are in the squad room. An armor plate is in the garage room on the right. At least five walkers are inside, and one of them is big. The big one waits in the garage room. The armory is locked. My note at the front desk has the combination. Read it first.",
        },
        notes: {
          "police-desk": {
            title: "The Armory Combination",
            text: "Sergeant Vega again. The armory has a dial lock, and the combination is 19-4-33. Turn it slow: left, then right, then left. You can open the armory now. There are gun parts inside, and there is an armor plate. Take only what you can carry, and leave the rest for the next one.\n\nThe Public Library is north of downtown. It has books in its archive room. The librarian stayed when everyone else left. Her name is Mrs. Greer, and she knows that building better than anyone. If you get there, help her if you can.",
          },
        },
      },
      school: {
        blurb: "A middle school with boxes of books in classrooms and a locked library closet.",
        door: {
          title: "Max and Mia Were Here",
          text: "Max and Mia wrote this. Boxes of books are in the back right classroom and the bottom left room. At least four walkers are inside, and one walks the hallway. It goes back and forth, so time your move. The library closet is locked. The key is in the teacher's note. Find it in the back left classroom.",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk",
            text: "I am Ms. Adler, and I taught in this room. The library closet key is in the top desk drawer. Pull the drawer all the way out, since it sticks. With that key, you can open the closet now. It holds boxes of books and a folder of city maps. The maps are worth more than the books right now.\n\nNorthgate Mall is in the north. It has food, medicine, and wire. But the crowds there are the worst in town. They fill the whole floor. Go only if you must, and never alone if you can help it.",
          },
        },
      },
      firehouse: {
        blurb: "Station 12, a fire station with tools, water tanks, and a locked equipment bay.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Chief Dunn. A tool kit is in the back office. Go through the door behind the desk. A water tank is in the truck bay on the right. At least four walkers are inside, and one is in the truck bay. It stands between you and the tank. The equipment bay is locked. My note is on the front desk.",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "Chief Dunn again. Look at the key board behind this desk. Take the red key, and only the red one. It opens the equipment bay lock. You can open the equipment bay now. There is a water tank in there, plus lumber and a set of tools. Load the tank first, since it is the heaviest.\n\nIf you need water filters, go to the Water Tower on the west side. The filters are in its pump house. Theo looks after the pumps. He kept them running when the rest of us gave up. Thank him for that.",
          },
        },
      },
      hospital: {
        blurb: "St. Anne Annex, the north hills hospital, with medicine and the worst walkers.",
        door: {
          title: "Doc Lin on the Ambulance",
          text: "Doc Lin. Medical kits are in the rooms along the top hall. There are more in the bottom left room. The generator is in the bottom right room. At least six walkers are inside, and they stand in the dark rooms. They do not come out until you are close. The pharmacy stock room is locked. The nurse's note is in the top hall.",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada Stayed",
            text: "I am Nurse Ada. I stayed when the others left, because someone had to. The stock room door needs a badge to open. My badge is in the drawer under this station. Take it, and you can open the stock room now. There are three medical kits inside. Use them well, because they are the last kits in this place.\n\nStay quiet in here. The walkers in this building follow sound more than light. Do not run, and do not shout. Walk soft, keep your light low, and they may not turn your way.",
          },
        },
      },
      watertower: {
        blurb: "The pump building under the Water Tower, stocked with water filters.",
        door: {
          title: "Theo's Fence Note",
          text: "Theo here. I tend the pumps, and I still check them when I can. Water filters are on the floor by the crates, so look low. At least four walkers are inside the pump building. They do not leave, so you will have to deal with them. The pump house is locked. My note is on the control panel inside.",
        },
        notes: {
          "watertower-panel": {
            title: "The Breaker Box Key",
            text: "Theo again. The pump house key is in the breaker box. That is the gray metal box on the wall, and it is not locked. Open it, and the key hangs on a nail inside. With it, you can open the pump house now. There are filters in there, a water tank, and wire. Take what you need and be quick about it.\n\nIf you need medicine, go to St. Anne Annex. It is the hospital, north along the river road. It still has medicine. But it is the most dangerous place in town. Do not go there alone, and do not go at night.",
          },
        },
      },
      lumberyard: {
        blurb: "Ridge Lumber on the east ridge, stacked with wood and a locked kiln shed.",
        door: {
          title: "Ruby's Spray Paint",
          text: "Ruby again. Lumber is stacked in the racks, both in the middle and at the back. At least five walkers are inside, and they gather by the loading dock. Stay away from the dock if you can. The kiln shed is locked. The yard boss left a note on the paint rack. Read it before you touch that shed.",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Clipboard",
            text: "Carla here, the yard boss. The kiln shed has a padlock with a dial on it. The code is 2218. Spin it to those numbers, and the lock drops open. You can open the kiln shed now. The lumber in there is dry, and dry wood is worth hauling. There are nails in the shed, too.\n\nDo not run the saws. Not even once, not even for a second. The noise brings the whole dock crowd, and they come fast. Carry what you need and go. The quiet is the only thing keeping this yard yours.",
          },
        },
      },
      mall: {
        blurb: "Northgate Mall in the north, full of goods and the biggest walker crowd.",
        door: {
          title: "Jo's Mall Door Note",
          text: "Jo here. Food, medicine, and wire are spread across the store floor. You will have to cover a lot of ground. At least six walkers are inside, and they move in a group. Where one goes, they all go. The security office is locked. The guard's note is by the paint display.",
        },
        notes: {
          "mall-guard": {
            title: "Luis Left the Code",
            text: "My name is Luis, and I worked security at this mall. The office has a keypad by the door. The code is 0912. Type it in, and the lock lets go. You can open the security office now. There are gun parts inside, and there are radio parts and a tool kit. I locked them up on the last day.\n\nThe walkers here move as one group. They come running at anyone who runs. So do not run, no matter how close they get. Walk, and most of them stay put. It feels wrong every time, but it works.",
          },
        },
      },
      library: {
        blurb: "The Public Library north of downtown, with books, maps, and a locked archive room.",
        door: {
          title: "Mrs. Greer's Book Drop",
          text: "Mrs. Greer, the librarian. Boxes of books are in the reading rooms on both sides of the building. At least five walkers are inside, and two are in the main hall. You will meet those two first. The archive room is locked. My note is in the back left reading room.",
        },
        notes: {
          "library-desk": {
            title: "The Key in the Dictionary",
            text: "Mrs. Greer again. The archive key is inside the big dictionary on this desk. Open the book to the middle and find the hole cut in the pages. The key sits in that hole. With it, you can open the archive room now. The archive has books, and it has a folder of city maps. Those maps show every street in this town.\n\nReading saved this building. Look at the walls on your way out. They are stacked with the books nobody wanted. Nobody checked them out in years, and now they stop walkers. Books are heavy, and that turned out to matter.",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
