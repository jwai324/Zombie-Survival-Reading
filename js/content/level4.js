/* Reading level 4 (4th grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 4 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[4] = {
    level: 4,
    howto: [
      "Your home base is a boarded-up house at the south end of town. A fence rings the yard, and your van waits in the driveway. Each day you drive out for supplies, and each night you haul them home. The base is the only place the game saves, so every trip starts and ends there.",
      "At home you stand in the yard, first person, with the cabin behind you. Time there runs in phases. In a calm phase nothing is at the fence. Go inside to build, or leave in the van. Then a wave comes. Sometimes it is a few walkers, sometimes a lot, and sometimes none at all. Walkers claw through the fence, and the Walls room makes that fence stronger. In a wave the cabin door and the van are locked, so you hold the yard. Between waves the fence is patched. The game saves when you arrive, after every build, and after every wave.",
      "Open the map and choose a destination. Only a few places are known at first; notes and the Radio room reveal the rest. The route is drawn for you, and then you drive. Walkers roam the road. Distant places and dangerous places have more of them, and every day that passes adds more. Power in the base shows how dangerous each place is before you commit.",
      "At the door you read a note before you step inside. It tells you how many walkers wait in there and where the items sit. Then you go in. Walkers come for you, so shoot them or slip past. Gather items from shelves and floors, and grab scrap wherever it is piled. Somewhere inside is a second note. Read it, because it explains how to open the locked cache room, where the best items are kept. Reading that note is what lets you open the door. The note also names another place worth trying, and that place appears on your map. Every note you read is kept in your backpack. Open the backpack at base, on the map, or inside a building; inside, it pauses the action.",
      "Drive home with your cargo, or chain a few more stops first. At base, cargo moves into storage and you eat one food. The Garden adds food, the day counter climbs, and the game saves. Spend items and scrap to upgrade the eight rooms. Upgrade the van and the gun in the garage. You can die on the road, inside a building, or in the yard. If you do, the game reloads your last base save. Everything since that save is lost. That is the tension, so plan every trip with care.",
    ],
    base: {
      intro: "Home base: the one place the game saves. Build the rooms, patch the van, and get back out before the next wave.",
      rooms: {
        walls: {
          desc: "Boards, braces, and steel plates on the house, the fence, and the van. Thicker walls mean a tougher fence, more van health, and more health for you on foot. A stronger fence holds longer when a wave hits the yard.",
          next: [
            "Van health up by 20, and your health on foot up by 20. Fence strength rises from 150 to 240.",
            "Van health up by 40, and your health on foot up by 40. Fence strength rises to 360.",
            "Van health up by 60, and your health on foot up by 60. Fence strength rises to 520. This level needs an armor plate.",
          ],
        },
        garage: {
          desc: "A workshop for the van and the gun. A better garage unlocks higher upgrade tiers, and it repairs the van for free whenever you are home.",
          next: [
            "Van and gun upgrades up to tier 3. Free van repair at base.",
            "Van and gun upgrades up to tier 4. Free van repair at base.",
            "Van and gun upgrades up to tier 5. Free van repair at base. This level needs gun parts.",
          ],
        },
        power: {
          desc: "Fuel, wire, and a string of work lights, with a generator added later. Power reveals how dangerous each place is, and later it improves every drive.",
          next: [
            "The map shows the danger level at every place.",
            "The map shows danger. You also find one supply crate on each drive. This level needs a generator.",
            "The map shows danger. You find two supply crates on each drive. Headlights beat night and fog. Night drives come on day 6, day 9, and every third day after that.",
          ],
        },
        water: {
          desc: "Clean water from a filter and a tank. You recover health while on foot, and more water means faster recovery.",
          next: [
            "You slowly recover health on foot, at rate 1.",
            "You recover health on foot at rate 2.",
            "You recover health on foot at rate 3, and you enter every building at full health.",
          ],
        },
        garden: {
          desc: "Raised beds of soil and seeds. The garden grows food. Every trip eats one food, and leaving with no food means a weaker van.",
          next: [
            "Grows 1 food each day.",
            "Grows 2 food each day.",
            "Grows 3 food each day. This level needs a water tank.",
          ],
        },
        radio: {
          desc: "An antenna on the roof. It picks up voices from across town, and they tell you where the other places are.",
          next: [
            "Reveals 3 new places on the map.",
            "Reveals every place on the map.",
            "Reveals every place, and shows which places still hold items. This level needs a box of books.",
          ],
        },
        medbay: {
          desc: "A room with cots and medical kits. Hits hurt less, and you can get back up once after you go down.",
          next: [
            "Walker hits hurt you 20 percent less on foot.",
            "Hits hurt 20 percent less. One revive per trip if you go down.",
            "Hits hurt 30 percent less. One revive per trip. The van takes 20 percent less damage.",
          ],
        },
        archive: {
          desc: "Shelves of books and a drawer of city maps. Once you have read a place's door note, the map shows what is still there. Later the map marks every locked cache, and at last it shows stock everywhere.",
          next: [
            "Once you have read a place's door note, the map shows what is still there.",
            "The map shows what is left at places whose door note you have read. It also marks which places still have a locked cache.",
            "The map marks caches and shows what is left at every place, read or not. This level needs city maps.",
          ],
        },
      },
    },
    locations: {
      gasngo: {
        blurb: "A small gas station with fuel cans on the floor and a locked storeroom by the door.",
        door: {
          title: "Ruby's Warning on the Door",
          text: "Ruby here, and I will keep this short. At least two walkers are inside. One lingers near the back wall, and one by the pumps side. More drift in as the days pass, so do not put this off. The fuel cans are on the floor, not on the shelves, so look low. The storeroom on the right, next to the door, is locked. The clerk kept a note on the counter, and it is worth reading before you try that door.",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Note at the Register",
            text: "This is Dev. I was the clerk here, and I worked the register until the last day. The storeroom key hangs on the hook under the counter. Crouch and feel along the underside until you find it. With that key, you can open the storeroom now. There is more fuel in there, and a spool of wire that I never got around to selling.\n\nI am heading to Ortiz Auto on the east side of town. The shop is still standing, and Mr. Ortiz knows engines better than anyone. Rosa is at Greenhouse Row, which is west, past this gas station. She has seeds and soil, and she will trade fairly. Tell her Dev sent you, and she will listen.",
          },
        },
      },
      grocery: {
        blurb: "A corner store with leftover food on the floor and a cold, locked walk-in cooler.",
        door: {
          title: "Doc Lin on the Glass",
          text: "Doc Lin wrote this. The front shelves are mostly picked over, so do not waste time on them. The food that is left is on the floor by the far aisle. Walkers get in through the loading door at the back, and they keep coming. Count on at least two inside. The walk-in cooler stays cold, and it is locked. The manager's note is on the counter at the back wall. Read it before you fight the cooler door.",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Trick",
            text: "I am Hana, the store manager. The cooler latch is stubborn, but it is not broken. Lift the latch while you pull on the door, and it swings open. So you can open the cooler now. Inside there is food, and there is one medical kit. The cold has kept everything in good shape, so take it all.\n\nWhen you need medicine, try Mile 9 Pharmacy. It is west of here, down the main road. Last week it still had medicine on its shelves. Mr. Okafor ran that pharmacy, and he was careful about keeping it stocked. Take what you need and leave the rest for whoever comes next. Someone always does.",
          },
        },
      },
      hardware: {
        blurb: "A big hardware store with nails, tools, lumber, and a locked back room.",
        door: {
          title: "Mr. Reyes Nailed This Up",
          text: "Mr. Reyes, the owner. At least three walkers are inside. Two roam the middle aisles, and one waits near the front door, so it meets you first. Nails are on the shelf near the front. Tools are in the middle aisle, and lumber is stacked at the back. Everything you need is here if you move with purpose. The back room is locked. My note is by the paint shelves, and it explains the door.",
        },
        notes: {
          "hardware-paint": {
            title: "The Sticking Door",
            text: "Mr. Reyes again. The back room door sticks, and most people give up on it after one shove. The trick is to lift the handle and push at the same time. Do that, and you can open the back room now. Inside I left a water filter, a second tool kit, and a stack of lumber. I hid them there on purpose, so use them well.\n\nIf you need more wood, go to Ridge Lumber on the east ridge. The yard has stacks of lumber, more than one van could carry. If you need more filters, try the Water Tower on the west side. There are more filters in its pump house. Theo runs the pumps, and he is fair with strangers.",
          },
        },
      },
      pharmacy: {
        blurb: "A small pharmacy with medical kits on the low shelves and a locked cabinet room.",
        door: {
          title: "Mr. Okafor's Door Note",
          text: "Mr. Okafor, the pharmacist. Medical kits are on the low shelves near the middle of the store. Look down, not up; people always miss them. At least three walkers are inside, and most of them stay near the back. They are slow until they notice you, so be careful. The cabinet room is locked, and the lock takes a code. The code is written on my note at the counter. Read it before you go deeper.",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Room Code",
            text: "Mr. Okafor here. The cabinet room has a keypad beside the door. The code is 4471. Press the numbers slowly, and the lock clicks open. You can open the cabinet room now. Inside are two more medical kits and a water filter. I set them aside for whoever came next, and that is you.\n\nIf you need more than that, you will have to go north. St. Anne Annex is the hospital in the north hills. It still has medicine, and it has a generator that could power a whole base. But listen to me on this. It is the most dangerous place in town. Go in daylight, go rested, and go with a plan for getting out.",
          },
        },
      },
      autoshop: {
        blurb: "Ortiz Auto, a repair shop with engine parts on the benches and a generator in the service pit.",
        door: {
          title: "Dev's Chalk Note",
          text: "Dev here, from the Gas-N-Go. Engine parts are on the workbenches. One bench is on the left wall, and the other is in the back right corner. At least three walkers are inside. One wanders near the crates in the back left corner, so watch that side. The service pit is covered by a locked hatch, and the hatch will not budge. Mr. Ortiz left a note by the office that explains it.",
        },
        notes: {
          "autoshop-office": {
            title: "Mr. Ortiz on the Hatch",
            text: "This is Mr. Ortiz. The hatch over the service pit looks jammed, but it is only bolted. The bolt comes out if you twist it to the left. Give it one hard turn, and it slides free. You can open the service pit now. My generator is down in the pit, wrapped in a tarp. There are spare parts beside it, and a full fuel can.\n\nSignal Electronics is downtown. It still has wire and radio parts on the shelves, because nobody thinks of them as food. But it is near the walker crowds, and they drift that way after dark. Go in fast and come out faster. Do not stay past sunset, whatever you find in there.",
          },
        },
      },
      radioshack: {
        blurb: "Signal Electronics, an electronics store with spools of wire, close to the walker crowds downtown.",
        door: {
          title: "Jo's Sign in the Window",
          text: "Jo wrote this. Spools of wire are on the shelves in the middle rows, right where the aisles meet. At least four walkers are inside, and one stays near the counter on the back wall. It will hear you coming, so have your gun up before you step in. The manager's office is locked, and the key is not on any ring. The manager left a note on the counter at the back. Read it before you waste time on that door.",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Key Under the Register",
            text: "I am Priya, the manager. The office key is taped under the register. Reach under the counter and feel along the front edge until you touch the tape. Peel it off, and you can open the manager's office now. Inside are two boxes of radio parts, and there is more wire. Take the radio parts first, since nobody else in town has any.\n\nTwo places worth knowing are north of downtown. The 4th Precinct is the police station, and it has gun parts. Lincoln Middle School has books, boxes of them. Both are worth the drive, but the station is the harder one by far. Do not go there tired, and do not go there hurt.",
          },
        },
      },
      garden: {
        blurb: "Greenhouse Row, a line of greenhouses with seeds, soil, and a locked potting shed.",
        door: {
          title: "Rosa Painted the Gate",
          text: "Rosa here. I ran this greenhouse before the Fall, and I still think of it as mine. Seed packets are on the bench near the front. Soil bags are stacked in the middle of the floor, heavy but worth it. At least three walkers are inside, and one keeps to the back among the dead plants. The potting shed is locked. My note is on the potting bench at the back, on the right. It tells you how to get in.",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Watering Can",
            text: "Rosa again. The potting shed has a padlock on it, and I hid the key where nobody would look. It is in the watering can on this bench. Tip the can and let the key slide out into your hand. You can open the potting shed now. There are more seeds inside, and there is a water tank. Keep the seeds dry, or they are no good to anyone.\n\nStation 12 is the fire station north of here. Its equipment bay has tools and water tanks, the big kind. Chief Dunn ran that station, and I believe he is still holding it. He is gruff, but he helped me board up this place. Tell him Rosa sent you.",
          },
        },
      },
      police: {
        blurb: "The 4th Precinct, a police station with gun parts, an armor plate, and a locked armory.",
        door: {
          title: "Sergeant Vega's Notice",
          text: "Sergeant Vega. Gun parts are in the squad room. An armor plate is in the garage room on the right, leaning against a cruiser. At least five walkers are inside, and one of them is big. The big one waits in the garage room, so do not go in there carelessly. The armory is locked behind a dial. I left the combination on a note at the front desk. Read it before you touch the armory door.",
        },
        notes: {
          "police-desk": {
            title: "The Armory Combination",
            text: "Sergeant Vega again. The armory has a dial lock, and the combination is 19-4-33. Turn it slowly: left, then right, then left again. You can open the armory now. There are gun parts inside, and there is an armor plate. Take what you can carry and leave the rest for the next survivor who reads this.\n\nThe Public Library is north of downtown. It has books in its archive room, more than you would believe. The librarian stayed when everyone else fled. Her name is Mrs. Greer, and she knows that building better than anyone alive. If you get there, help her if you can. She has done more for this town than I have.",
          },
        },
      },
      school: {
        blurb: "Lincoln Middle School, with boxes of books in the classrooms and a locked library closet.",
        door: {
          title: "Max and Mia Were Here",
          text: "Max and Mia wrote this. Boxes of books are in the back right classroom and the bottom left room. At least four walkers are inside, and one patrols the hallway. It shuffles back and forth, so time your move and go when its back is turned. The library closet is locked. The key is in the teacher's note, and that note is in the back left classroom. Find it first, then go for the closet.",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk",
            text: "I am Ms. Adler, and I taught in this room for eleven years. The library closet key is in the top desk drawer. Pull the drawer all the way out, because it sticks halfway. With that key, you can open the closet now. It holds boxes of books and a folder of city maps. The maps are worth more than the books right now, so take them first.\n\nNorthgate Mall is in the north. It has food, medicine, and wire, enough to keep a base going for weeks. But the crowds there are the worst in town. They fill the whole floor, and they move together. Go only if you must, and never go in without a way back out.",
          },
        },
      },
      firehouse: {
        blurb: "Station 12, a fire station with tools, water tanks, and a locked equipment bay.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Chief Dunn. A tool kit is in the back office, through the door behind the desk. A water tank is in the truck bay on the right. At least four walkers are inside, and one is in the truck bay. It stands between you and the tank, so deal with it first. The equipment bay is locked, and the lock is a good one. My note is on the front desk. It tells you which key.",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "Chief Dunn again. Look at the key board behind this desk. Take the red key, and only the red one. The others are for trucks that will never run again. It opens the equipment bay lock. You can open the equipment bay now. There is a water tank in there, plus lumber and a set of tools. Load the tank first, since it is the heaviest and the hardest to replace.\n\nIf you need water filters, go to the Water Tower on the west side. The filters are in its pump house. Theo looks after the pumps. He kept them running when the rest of us gave up, and he never asked for thanks. Thank him anyway.",
          },
        },
      },
      hospital: {
        blurb: "St. Anne Annex, the hospital in the north hills, with medicine, a generator, and the worst walkers.",
        door: {
          title: "Doc Lin on the Ambulance",
          text: "Doc Lin. Medical kits are in the rooms along the top hall, and more are in the bottom left room. The generator is in the bottom right room. At least six walkers are inside, and they stand in the dark rooms. They do not stir until you are close, and then they come all at once. The pharmacy stock room is locked. The nurse's note is in the top hall. Read it before you go looking for that room.",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada Stayed",
            text: "I am Nurse Ada. I stayed when the others left, because somebody had to watch over this place. The stock room door needs a badge to open, and mine still works. The badge is in the drawer under this station. Take it, and you can open the stock room now. There are three medical kits inside. Use them wisely, because they are the last kits in this building.\n\nStay quiet in here, above everything else. The walkers in this building follow sound more than light. Do not run, and do not shout, even when it gets bad. Walk softly, keep your light low, and most of them will never turn your way. The ones that do, you can handle.",
          },
        },
      },
      watertower: {
        blurb: "The Water Tower's pump building on the west side, stocked with water filters.",
        door: {
          title: "Theo's Fence Note",
          text: "Theo here. I tend the pumps, and I still check on them whenever I can. Water filters are on the floor by the crates, so look low and look carefully. At least four walkers are inside the pump building. They never leave, so you will have to deal with every one of them. The pump house is locked. My note is on the control panel inside. Read it before you try the pump house door.",
        },
        notes: {
          "watertower-panel": {
            title: "Theo's Breaker Box",
            text: "Theo again. The pump house key is in the breaker box. That is the gray metal box on the wall, and it is not locked. Open it, and the key hangs on a nail inside the lid. With it, you can open the pump house now. There are filters in there, a water tank, and a spool of wire. Take what you need and be quick about it.\n\nOne more thing, and it matters if you ever run short of medicine. St. Anne Annex, the hospital, is north along the river road. It still has medicine on its shelves. But it is the most dangerous place in town, worse than anywhere I have seen. Go in daylight, go rested, and keep your exit in mind the whole time.",
          },
        },
      },
      lumberyard: {
        blurb: "Ridge Lumber on the east ridge, stacked with wood and guarded by a locked kiln shed.",
        door: {
          title: "Ruby's Spray Paint",
          text: "Ruby again. Lumber is stacked in the racks, both in the middle of the yard and at the back. At least five walkers are inside, and they gather by the loading dock. Stay clear of the dock if you can, because they move as a pack. The kiln shed is locked. The yard boss left a note on the paint rack. Read it before you touch that shed, or you will waste your time.",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Clipboard",
            text: "Carla here, the yard boss. The kiln shed has a padlock with a dial on it. The code is 2218. Spin it to those numbers, and the lock drops open. You can open the kiln shed now. The lumber in there is dry, and dry wood is worth hauling. There are nails in the shed too, a whole box of them.\n\nDo not run the saws. Not even once, not even for a second, no matter how tempting it is. The noise brings the whole dock crowd, and they come faster than you would think. Carry what you need and go. Silence is the only thing keeping this yard yours. Respect that, and the yard will keep giving.",
          },
        },
      },
      mall: {
        blurb: "Northgate Mall in the north, full of supplies and the biggest walker crowd in town.",
        door: {
          title: "Jo's Mall Door Note",
          text: "Jo here. Food, medicine, and wire are spread across the store floor, so you will cover a lot of ground. At least six walkers are inside, and they move in a group. Where one goes, they all go, and they do not split up. The security office is locked. The guard's note is by the paint display. Read it before you try the office, because the lock takes a code.",
        },
        notes: {
          "mall-guard": {
            title: "Luis Left the Code",
            text: "My name is Luis, and I worked security at this mall. The office has a keypad beside the door. The code is 0912. Type it in, and the lock lets go. You can open the security office now. There are gun parts inside, and there are radio parts and a tool kit. I locked them up on the last day, before the crowd came through the doors.\n\nThe walkers here move as one group. They come running at anyone who runs, and they do not get tired. So do not run, no matter how close they get. Walk, and most of them stay put. It feels wrong every single time, but it works. Trust it, and keep your pace steady.",
          },
        },
      },
      library: {
        blurb: "The Public Library north of downtown, with books, city maps, and a locked archive room.",
        door: {
          title: "Mrs. Greer's Book Drop",
          text: "Mrs. Greer, the librarian. Boxes of books are in the reading rooms on both sides of the building. At least five walkers are inside, and two of them are in the main hall. You will meet those two first, so be ready the moment you step in. The archive room is locked. My note is in the back left reading room. Read it, and the archive will open for you.",
        },
        notes: {
          "library-desk": {
            title: "The Key in the Dictionary",
            text: "Mrs. Greer again. The archive key is inside the big dictionary on this desk. Open the book to the middle and find the hollow cut into the pages. The key rests in that hollow. With it, you can open the archive room now. The archive has books, and it has a folder of city maps. Those maps show every street and alley in this town.\n\nReading saved this building. Look at the walls on your way out. They are stacked with the books nobody wanted, the ones nobody checked out in years. Now they stop walkers. Books are heavy, and it turns out that matters. Take what you need, but leave the walls standing.",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
