/* Reading level 6 (6th grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 6 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[6] = {
    level: 6,
    howto: [
      "Months after the Fall, you run the last working van out of a boarded-up house at the south end of town. That house is your home base, and it is the only place the game ever saves. Each player keeps their own labeled save, up to 4 of them, and you pick yours on the title screen. Every building in this city has walkers in it, and every building has notes. People who were there before you wrote them: where the fuel is, which door is locked and how to open it, which street is still clear. Read them and you find more and lose less.",
      "Home base is a yard, and you stand in it in first person: cabin behind you, van in the driveway, a fence around the lot. Time there runs in phases. In a calm phase nothing is at the fence. Go inside the cabin to build, where the menu pauses the yard, or climb into the van and leave. Then a wave comes, and a wave is unpredictable: sometimes a few walkers, sometimes a lot, sometimes none at all. The ones that come claw at the fence until it gives, and the Walls room is what makes that fence stronger. During a wave the cabin door and the van are locked, so whatever is at the fence is yours to deal with. The fence does not mend itself. Every hole stays open until you close it, and an open hole is an invitation the next wave will accept. Stand at the hole and press E, or use the cabin menu. Each hole costs 1 scrap, and a cracked segment can be braced for 1 scrap as well. Building Walls up rebuilds the whole fence from scratch. Later, once Walls reaches 2, you can craft traps at the workbench and set them in the yard or along the fence line. A walker that steps on one pays for it; the Spike trap comes with Walls 2 and the Blast trap with Walls 3. The game saves on arrival, after every build, and after every wave, so a wave survived is a wave banked.",
      "Open the map and choose a destination. The city is fixed and hand-drawn, fifteen locations and the base, but only a handful are known at first. Notes reveal the rest a place or two at a time, and the Radio room reveals them faster. Pick a place, watch the route draw itself across town, and drive. The road is never empty. Distance sets the length of the drive, and the destination's danger sets how many walkers cross your headlights. The Power room shows that danger before you commit. Every day you survive adds a few more. If you are still parked at a place when you open the map, you can walk straight back into it.",
      "At the door you read a note before you step inside, and it goes straight into your backpack. It tells you how many walkers wait and where the items sit, so treat it as a floor plan rather than a warning. Then you go in: first person, walkers closing, items on shelves and floors, scrap piles that pay in scrap. Every doorway inside is a real door. E opens it and E closes it, and walkers cannot open doors, which makes a closed door the cheapest wall you will ever own. Shelf and floor items return 3 days after you take them; cache items never do. Somewhere inside is a second note. Reading it is what lets you open the locked cache room, where the best items are kept. It also names the next place worth trying, and that place appears on your map. Press E at the entrance to leave. Go back in on the same trip and the building is exactly as you left it. Walkers you put down stay down, scrap you took stays taken, and doors stay as you left them. Driving home resets all of that. Nobody will ever quiz you on any of it. The notes are simply the difference between a full van and an empty one.",
      "Hurt? A Medical kit heals you to full, and the backpack carries up to 3 of them, packed from storage at the cabin. Inside a building you can also use a kit from the van's cargo, one you picked up earlier on the same trip. Drive home with your cargo. At base it moves into storage, you eat one food, and the day counter climbs. The Garden and the Farm add whatever they grew, and the Lab adds whatever it brewed. The garage repairs the van back to full for scrap: 1 scrap for every 3 health missing, and never less than 5. Once the Garage room is built, repairs are free. Spend items and scrap to raise the rooms, eight to begin with and three more late in the game: a Well, a Farm, and a Lab. Re-read every note you have found in the backpack, which opens at base, on the map, or inside a building.",
      "Building a room, upgrading the van or the gun, and crafting a trap all happen at the workbench in the garage. Each one is a short typing round. The words to type are shown on the screen beside a timer. Run out of time and you simply try again; nothing is spent until you finish, so the only thing a failed round costs you is pride. The first time, the bench teaches you where your fingers belong on the home row. Every finished round moves you to the next typing stage: single home-row keys first, then the other rows, then words, phrases, and sentences. Repairs need no typing. If you go down on the road, in a building, or in the yard, the game reloads your last base save. Everything since that save is gone. That is the whole tension. The van only counts when it comes home.",
    ],
    controls: [
      "Road: Aim with the mouse and hold to fire; A and D, or the arrow keys, slide the van across the lanes.",
      "Inside and in the yard: W A S D move, the mouse looks, and a click fires. Shift makes you run, B opens the backpack, and P or Esc pauses the game.",
      "E does it all: E reads notes, opens and closes doors, and opens a cache once you have read the note that explains how. E leaves a building, enters the cabin, starts the van, and rebuilds a hole in the fence for 1 scrap.",
      "Traps in the yard: T sets a spike trap and R sets a blast trap, on the ground in front of you or just past the fence line, where the walkers come through.",
      "Guns: Other guns lie hidden in buildings across town, and the hiding places shuffle with every new game. Walk over one to pick it up, though it only becomes yours once you carry it home. Press 1 to 5, Q, or the mouse wheel to switch guns. Hold the mouse to draw the bow, then release to shoot. In the cabin's Weapons tab, scrap buys more damage, range, fire rate, and accuracy.",
      "Backpack: Every note you have read, kept with where you found it, plus your medical kits. Use a kit to heal back to full.",
      "Workbench: Building, upgrading, and crafting are short typing rounds. Type what is on the screen before the timer runs out; running out only means you try again, and nothing is spent until you finish.",
      "Map: Tap a place, then Drive. At the place where you are parked, you can go back inside, and it will be exactly as you left it.",
    ],
    base: {
      intro: "Home base: a boarded-up house at the south end of town, a fence that holds for now, and the last van anyone has seen running. Nothing is saved anywhere else, so build here, breathe here, and go back out.",
      rooms: {
        walls: {
          desc: "Lumber, nails, and salvaged plate on the house, the fence, and the van. Every layer buys time. The fence holds longer while walkers claw at it during a wave, the van survives more on the road, and so do you on foot. A bare fence has 150 strength. Building Walls up rebuilds the whole fence, holes and all. Walls 2 unlocks the Spike trap, and Walls 3 unlocks the Blast trap.",
          next: [
            "Fence strength rises from 150 to 240. Van health rises by 20, and your health on foot rises by 20.",
            "Fence strength rises to 360. Van health rises by 40, and your health on foot rises by 40.",
            "Fence strength rises to 520. Van health rises by 60, and your health on foot rises by 60. This level needs an armor plate.",
          ],
        },
        garage: {
          desc: "A workshop where the van and the gun get stronger, and its workbench is where you build, upgrade, and craft by typing. A better garage unlocks higher upgrade tiers for both. Until the Garage room is built, a repair costs 1 scrap for every 3 health missing, and at least 5 scrap. Once it is built, the van is repaired for free every time you come home.",
          next: [
            "Van and gun upgrades up to tier 3, and free van repair at base.",
            "Van and gun upgrades up to tier 4, and free van repair at base.",
            "Van and gun upgrades up to tier 5, and free van repair at base. This level needs gun parts.",
          ],
        },
        power: {
          desc: "Fuel, wire, and a string of working lights at first, with a generator added later. Power lets the map show how dangerous each place is, scatters supply crates along your routes, and eventually lights the road itself. Night falls on the road every third day starting on day 6, and fog drifts in on some others; headlights beat both.",
          next: [
            "The map shows the danger level of every place.",
            "The map shows danger, and you find one supply crate on every drive. This level needs a generator.",
            "The map shows danger, you find two supply crates on every drive, and headlights beat night and fog.",
          ],
        },
        water: {
          desc: "A filter and a tank that turn gray water clear. Clean water means you heal while on foot. More of it means you heal faster, and at its best you walk into every building whole.",
          next: [
            "You slowly heal on foot, at rate 1.",
            "You heal on foot at rate 2.",
            "You heal on foot at rate 3, and you enter every building at full health.",
          ],
        },
        garden: {
          desc: "Raised beds of soil and seeds behind the house. The garden grows food, and food matters: every trip eats one, and a trip with no food means a weaker van.",
          next: [
            "Grows 1 food each day.",
            "Grows 2 food each day.",
            "Grows 3 food each day. This level needs a water tank.",
          ],
        },
        radio: {
          desc: "An antenna on the roof and a receiver on the kitchen table. Voices across town tell you where the places are, and later which of them still hold anything worth the drive.",
          next: [
            "Reveals 3 new places on the map.",
            "Reveals every place on the map.",
            "Reveals every place, and shows which places still hold items. This level needs a box of books.",
          ],
        },
        medbay: {
          desc: "Beds, bandages, and medical kits. Walker hits hurt less, and if you go down inside a building you can get back up once per trip. At its best, the van takes less punishment too.",
          next: [
            "Walker hits hurt you 20 percent less on foot.",
            "Hits hurt 20 percent less, and you get one revive per trip if you go down.",
            "Hits hurt 30 percent less, one revive per trip, and the van takes 20 percent less damage.",
          ],
        },
        archive: {
          desc: "Shelves of books and a drawer of city maps. The archive teaches the map what is still left at any place whose door note you have read. Then it teaches the map to mark caches, and finally to show everything, read or not.",
          next: [
            "Once you have read a place's door note, the map shows what is still there.",
            "The map shows stock for places whose door note you have read, and marks which places still have a cache.",
            "The map marks caches and shows what is left at every place, read or not. This level needs city maps.",
          ],
        },
        well: {
          desc: "A hand-dug well beside the cabin, lined with lumber and rigged to a pump. Its water comes up cold and clean from deep underground, so you heal faster on foot. The Farm and the Lab both wait on the Well before they can be built.",
          next: [
            "Needs the Water room first. Costs Lumber 2, Tool kit 1, and 60 scrap. You heal on foot at rate 2.",
            "Costs Lumber 2, Engine parts 1, Water filter 1, and 100 scrap. You heal on foot at rate 3.",
            "Costs Water tank 1, Engine parts 1, Spool of wire 1, and 150 scrap. You heal on foot at rate 4, and you start every building at full health.",
          ],
        },
        farm: {
          desc: "Farmland fenced off beside the yard: crops first, then animals. Everything it grows lands in storage on top of what the Garden gives, so the van never has to leave hungry.",
          next: [
            "A crop field, corn and beans in long rows. Needs Garden 2 and the Well. Costs Seed packets 2, Bag of soil 2, Lumber 1, and 80 scrap. The farm grows 2 food a day on top of the Garden.",
            "A chicken coop, wire-walled and loud at dawn. Needs Well 2. Costs Lumber 2, Spool of wire 1, Seed packets 1, and 120 scrap. The farm gives 4 food a day.",
            "A goat pen, with a trough fed from the Well. Needs Well 3. Costs Lumber 3, Spool of wire 2, Water tank 1, and 180 scrap. The farm gives 6 food a day.",
          ],
        },
        lab: {
          desc: "Medicine made at home. It begins as herb beds and a copper still, grows into a clean bench, and ends as a powered lab humming off the Generator. Every finished Medical kit goes into storage when a day passes, which is one less reason to drive to the hospital.",
          next: [
            "Herb beds and a still. Needs the Medbay and the Well. Costs Medical kit 1, Box of books 1, Seed packets 1, and 80 scrap. Makes 1 Medical kit every 2 days.",
            "A clean bench with a filtered sink. Needs Well 2. Costs Water filter 1, Box of books 1, Spool of wire 1, and 120 scrap. Makes 1 Medical kit a day.",
            "A powered lab. Needs Medbay 2. Costs Generator 1, Medical kit 2, Box of books 1, and 180 scrap. Makes 2 Medical kits a day.",
          ],
        },
      },
      traps: {
        spike: {
          desc: "A Spike trap: a board studded with nails, and the first thing Walls 2 unlocks. It costs Lumber 1, Box of nails 1, and 10 scrap at the workbench. Press T to set it on the tile in front of you, even across the fence line. A walker that steps on it takes 45 damage, and it lasts 3 walkers before it is spent.",
        },
        blast: {
          desc: "A Blast trap: a Fuel can wired to go off, unlocked by Walls 3. It costs Fuel can 1, Spool of wire 1, and 25 scrap at the workbench. Press R to set it on the tile in front of you. When a walker steps on it, every walker close to it takes 120 damage. One use, and then it is gone; there is no second blast.",
        },
      },
      bench: {
        intro: "This is the garage workbench. Build rooms, upgrade the van and the gun, and craft traps here by typing; nothing is spent until you finish the round.",
      },
    },
    typing: {
      fingers: [
        "Look at the middle row of letter keys on your keyboard. That is the home row, and it is where your fingers live between keystrokes. Every finger has a home key and returns to it after every reach, the way the van returns to base after every trip.",
        "Rest your left hand on A S D F, one finger to a key. Pinky on A, ring finger on S, middle finger on D, pointer on F. Rest your right hand on J K L and the ; key, which is called the semicolon. Pointer on J, middle on K, ring on L, pinky on the semicolon. Now feel the F key and the J key with your pointer fingers. Each has a small raised bump, and those bumps are landmarks: they let your hands find home without your eyes ever leaving the screen.",
        "Both thumbs rest lightly on the space bar. Either thumb taps it to put a space between words, and neither one has any other job.",
        "Each finger owns the keys directly above and below its home key. To press one, that finger reaches up or down, taps once, and comes straight back home. Keep your eyes on the screen, not on your hands, and trust the bumps on F and J to tell you where you are. Accuracy comes first; speed arrives on its own, the way it does with anything you repeat.",
      ],
      words: [
        "fence", "scrap", "cabin", "radio", "spike", "blast", "brace", "cache", "cargo", "timer",
        "armor", "latch", "hatch", "spool", "chalk", "siren", "crowd", "quiet", "ridge", "squad",
        "walker", "lumber", "filter", "garage", "garden", "repair", "danger", "runner", "medbay", "armory",
        "cooler", "engine", "drawer", "typing", "hazard", "diesel", "patrol", "signal", "static", "ration",
        "reload", "wrench", "brutes", "pantry", "silent", "storage", "kitchen", "station", "library", "counter",
        "lantern", "battery", "compass", "survive", "sunrise", "chicken", "harvest", "bandage", "shutter", "padlock",
        "antenna", "highway", "trigger", "whisper", "segment", "cracked", "sawdust", "crowbar", "breaker", "rooftop",
        "pharmacy", "driveway", "register", "hospital", "medicine", "sidewalk", "keyboard", "backpack", "cupboard", "headlamp",
        "downtown", "firewood", "precinct", "sentence", "tomatoes", "sandbags", "stubborn", "salvaged", "ignition", "corridor",
        "generator", "workbench", "semicolon", "firehouse", "landmarks", "barricade", "perimeter", "inventory", "stockroom", "ambulance",
        "headlight", "keystroke", "nightfall", "crossroad", "shortwave", "footsteps", "checklist", "scrapyard", "clipboard", "homestead",
      ],
      phrases: [
        "hold the fence line", "read the door note", "brace the cracked segment", "fix every hole", "one scrap per hole", "every hole stays open",
        "set the spike trap", "arm the blast trap", "walls two spike trap", "walls three blast trap", "forty five damage", "one blast one use",
        "pack three kits", "heal back to full", "kit from the van", "repair the van", "scrap for repairs", "free with the garage",
        "dig the well", "plant corn and beans", "wire the chicken coop", "build the goat pen", "brew medicine at home", "two food a day",
        "six food a day", "kits every two days", "two kits a day", "herb beds and still", "clean bench next", "powered lab last",
        "finish the round", "nothing is spent", "home row first", "find the bumps", "thumbs on space", "eyes on the screen",
        "fingers come home", "reach and return", "walkers cannot open doors", "close the door behind", "same trip same building", "doors stay as left",
        "the cache stays locked", "notes reveal the map", "radio finds new places", "danger on the map", "supply crate ahead", "headlights beat the fog",
        "stay quiet inside", "walk do not run", "twist the bolt left", "lift the handle", "red key only", "code on the counter",
        "key in the dictionary", "badge on the reader", "turn the dial slowly", "tip the watering can", "leave the pumps running", "saws bring the crowd",
        "drive home before dark", "the van only counts", "last save at base", "pick your own save", "four labeled saves", "calm phase then wave",
        "wave survived wave banked", "generator in the pit", "spool of wire", "box of nails", "bag of soil", "seed packets",
        "water filter", "water tank", "engine parts", "medical kit", "box of books", "fuel can",
        "tool kit", "armor plate", "city maps", "gun parts", "radio parts", "cold cooler",
      ],
      sentences: [
        "Read the door note before you step inside the building.",
        "Every doorway inside is a real door, and walkers cannot open it.",
        "Press E to open the door and E to close it.",
        "A closed door is the cheapest wall you will ever own.",
        "The fence never mends itself after a wave claws through it.",
        "Every hole in the fence stays open until you spend a scrap.",
        "Stand at the hole, press E, and the gap costs one scrap.",
        "A cracked segment can be braced for a single scrap.",
        "Building the Walls up rebuilds the entire fence from scratch.",
        "Walls two unlocks the spike trap, and Walls three unlocks the blast.",
        "Press T to set a spike trap on the tile ahead.",
        "A spike trap hurts three walkers before it is finally spent.",
        "Press R to arm a blast trap, then let them come.",
        "The blast trap goes off once, and then it is gone.",
        "Pack up to three medical kits from storage before you leave.",
        "One medical kit heals you all the way back to full.",
        "Inside a building you can use a kit from the van.",
        "The garage repairs the van for one scrap per three health.",
        "Once the Garage room is built, every repair is free.",
        "Repairs never need typing, but building and crafting always do.",
        "The well brings up cold, clean water from deep underground.",
        "The Farm and the Lab both wait on the Well first.",
        "Corn and beans in the crop field add two food a day.",
        "Chickens in the coop mean four food every single day.",
        "The goat pen pushes the farm to six food a day.",
        "Herb beds and a still make one kit every two days.",
        "The powered lab turns out two medical kits a day.",
        "Every finished kit goes into storage when a day passes.",
        "Type the words on the screen before the timer runs out.",
        "Nothing is spent until you finish the round, so try again.",
        "Your fingers rest on the home row between every keystroke.",
        "The bumps on F and J tell your hands where home is.",
        "Keep your eyes on the screen, never on your hands.",
        "Both thumbs rest lightly on the space bar and nowhere else.",
        "Go back inside and the building is exactly as you left it.",
        "Walkers you put down stay down until you drive home.",
        "Still parked somewhere, you can go back in from the map.",
        "Each player keeps a labeled save, and there are four of them.",
        "The base is still the only place the game ever saves.",
        "Go down anywhere and the game reloads your last base save.",
        "Shelf items come back three days after you take them.",
        "Cache items never come back, so choose what you carry.",
        "Dev headed east to see if Ortiz Auto was still standing.",
        "Rosa kept the greenhouses alive when the rest of town went dark.",
        "Nurse Ada stayed because someone had to, and it was her.",
        "Walk through the mall, because running wakes the whole floor at once.",
        "Do not run the saws, or the dock crowd comes fast.",
        "The Radio room pulls new places out of the static.",
        "Twist the bolt to the left and the hatch slides free.",
        "Theo keeps the pumps turning out of duty and habit.",
        "A wave survived is a wave banked in your save.",
        "The van only counts when it finally comes home again.",
        "Night falls on the road every third day from day six.",
        "Headlights from the Power room beat both the night and the fog.",
      ],
    },
    locations: {
      gasngo: {
        blurb: "A small gas station with fuel cans on the floor and a locked storeroom on the right, by the door.",
        door: {
          title: "Ruby, Taped to the Door",
          text: "Ruby. Writing fast, so forgive the handwriting. At least two walkers inside: one keeps to the back wall, and one drifts along the pumps side where the windows let the light in. That count is not a promise. More come as the days pass, so whatever you plan to do here, do it sooner. The fuel cans are on the floor, not on the shelves. Everyone who stripped this place looked at eye level and walked right past them. The storeroom on the right, next to the door, is locked. The clerk kept a note on the counter, and I would bet it explains the lock. Read it before you waste a shoulder on that door.",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Note by the Register",
            text: "This is Dev. I worked the register here for two years, which means I know every hiding place a bored clerk invents. The storeroom key is on the hook under the counter, exactly where my knee used to find it on slow nights. Reach under, feel along the lip for the hook, and take it. With that key you can open the storeroom now. There is more fuel in there than the shelves ever admitted to. There is also a spool of wire I was saving for a repair that no longer matters.\n\nI am gone by the time you read this, headed for Ortiz Auto on the east side of town. The shop is still standing, and a standing shop means a lift, a bench, and a chance at parts. If seeds and soil are what you need, go the other direction. Rosa is at Greenhouse Row, west past this gas station. She kept the greenhouses alive when the rest of the town went dark, and she deals fairly with anyone who shows up honest. Tell her Dev sent you. Lock the storeroom behind you if you can manage it. Habits are the only thing holding this place together.",
          },
        },
      },
      grocery: {
        blurb: "A corner store with food scattered on the floor and a cold, locked walk-in cooler.",
        door: {
          title: "Doc Lin on the Glass",
          text: "Doc Lin, in marker, so read this before the weather does. The front shelves are mostly picked over, stripped as clean as a prescription pad. What food is left is on the floor by the far aisle, where it fell when the first crowds shoved through. Walkers get in through the loading door at the back, and that door has never closed properly. Count on at least two inside at any hour. The walk-in cooler still stays cold, and it is locked. The manager's note is on the counter at the back wall. Read it first. The cooler is the only reason anyone should still be coming here.",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Latch",
            text: "I am Hana, the manager, and I locked the cooler deliberately. The latch is stubborn, not broken, and that distinction matters. Lift the latch while you pull on the door, and the bar slides out of its catch as if it had been waiting for you. Do both at once; either alone does nothing. That is the whole secret, so you can open the cooler now. Inside there is food, and there is one medical kit on the top shelf, still sealed. The cold has preserved everything in there. That is more than I can say for the rest of this store, or for the people who ran through it.\n\nWhen that kit is gone, you will want more medicine, and this neighborhood has one answer. Try Mile 9 Pharmacy, west of here. Last week it still had medicine on its shelves, because Mr. Okafor kept it stocked right up to the end out of sheer professional stubbornness. Take what you need and leave the rest. Someone else will stand at this counter after you, hungrier than you are and hoping just as hard.",
          },
        },
      },
      hardware: {
        blurb: "A big hardware store with nails, tools, lumber, and a locked back room.",
        door: {
          title: "Mr. Reyes Nailed This Up",
          text: "Mr. Reyes, the owner. I built this store with my own hands, so take what I say about it as fact. At least three walkers are inside: two in the middle aisles, one near the front door. The one by the door will meet you first, and the pair in the aisles will hear whatever that meeting costs. Nails are on the shelf near the front. Tools are in the middle aisle, which means they belong to those two until you decide otherwise. Lumber is at the back. Take the easy things first. The back room is locked, and the lock is not the problem. My note is by the paint shelves, and it explains the door.",
        },
        notes: {
          "hardware-paint": {
            title: "The Door That Sticks",
            text: "Mr. Reyes again. The back room door sticks, and most people quit after two shoves and a bruised shoulder. The frame swelled the winter the roof leaked, so the door sits low and drags on the sill. The trick is to lift the handle and push at the same time. Lift it high, lean your weight in, and the door pops free with a sound like a knuckle cracking. That is all it takes, so you can open the back room now. Inside I left a water filter, a second tool kit, and lumber. I meant to come back for all of it. Consider it inventory I am writing off.\n\nIf you need more wood than one back room can hold, go to Ridge Lumber on the east ridge. There are stacks of lumber in that yard, enough to board up a whole street. If filters are the problem, try the Water Tower on the west side. There are more filters in its pump house, and Theo keeps the pumps turning out of something between duty and habit. Tell him I am sorry about the invoice I never settled. He will know which one.",
          },
        },
      },
      pharmacy: {
        blurb: "A small pharmacy with medical kits on the low shelves and a locked cabinet room.",
        door: {
          title: "Mr. Okafor's Door Note",
          text: "Mr. Okafor, pharmacist. Medical kits are on the low shelves near the middle of the store. Look down rather than up; the crowds took whatever sat at eye level and missed the rest entirely. At least three walkers are inside, and most of them keep near the back by the loading door. They are slow until they notice you, and then they are not. The cabinet room is locked, and the lock takes a code rather than a key. The code is written on my note at the counter. Read it before you approach that door, or you will stand there pressing numbers for nothing.",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Room Code",
            text: "Mr. Okafor again. The cabinet room has a keypad on the door, and I am trusting you with the code: 4471. Press the numbers deliberately, wait for the click, and the lock releases. You can open the cabinet room now. Inside are two more medical kits and a water filter, because clean water prevents more harm than any pill I ever dispensed. I left them for whoever came next, and whoever came next is apparently you. Use them with some judgment.\n\nIf you need more than that, you will have to go north, and I say this with reluctance. St. Anne Annex is the hospital in the north hills. It still has medicine, and it has a generator that could light an entire base. But understand me clearly: it is the most dangerous place in town, and its dark halls conceal more than they reveal. Go in daylight. Go rested. Go with a plan for leaving before you have a plan for entering. Medicine is useless to someone who never makes it home, and I have seen that proven more often than I would like.",
          },
        },
      },
      autoshop: {
        blurb: "A repair shop with engine parts on the benches and a generator hidden in the service pit.",
        door: {
          title: "Dev's Chalk on the Door",
          text: "Dev here, from the Gas-N-Go, and I made it this far, which surprised me more than anyone. Engine parts are on the workbenches: one on the left wall, one in the back right corner. At least three walkers are inside. One wanders near the crates in the back left corner, so it will not be the first thing you meet, only the one you forget about. Do not let it come up behind you while your hands are full at a bench. The service pit is covered by a locked hatch. Mr. Ortiz left a note by the office, and that hatch will not move for anyone who has not read it.",
        },
        notes: {
          "autoshop-office": {
            title: "Mr. Ortiz on the Hatch",
            text: "This is Mr. Ortiz, and this is my shop, whatever the sign says now. The hatch over the service pit looks welded shut, but it is only stubborn, like most things in here. The bolt comes out if you twist it to the left. People turn it right, feel it bind, and give up, assuming the thing is seized. Turn it left, hard, and it slides free. That means you can open the service pit now. My generator is down in the pit, where the crowds never thought to look because nobody looks down. There are spare parts beside it, and a fuel can to get it running.\n\nIf you need wire or radio parts, Signal Electronics downtown still has both on its shelves. But it sits near the walker crowds, and they drift that way the way water finds low ground. Go in fast, come out faster, and do not linger past dark. Downtown after dark belongs to them. I have watched it from the roof of this building enough nights to say that without exaggeration.",
          },
        },
      },
      radioshack: {
        blurb: "An electronics store with spools of wire, sitting uncomfortably close to the downtown crowds.",
        door: {
          title: "Jo's Sign in the Window",
          text: "Jo. Spools of wire are on the shelves in the middle rows, where the store kept the unglamorous stock nobody bothered to steal. At least four walkers are inside. One stays near the counter on the back wall. It hears the door even from there, so be ready before you step through rather than after. The others are between you and it, among the displays. The manager's office is locked. The manager left a note on the counter at the back, and the office will not open for anyone who has not read it. The best parts in this building are behind that door, which is the only reason I am telling you any of this.",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Key Under the Register",
            text: "I am Priya, the manager, and I am the one who hid the key. The office key is taped under the register, pressed flat against the metal so no one would find it by accident. Reach under the counter and run your fingers along the back edge until you feel the tape. Peel it off, and you can open the manager's office now. Inside are two boxes of radio parts and more wire than you can carry in one trip. Take the radio parts first. They are the hardest thing in this town to find, and I say that as someone who ordered them for a living.\n\nTwo places are north of downtown, and both are worth the drive if you survive the drive. The 4th Precinct is the police station, and it has gun parts. Lincoln Middle School has books, more boxes of them than a school that size had any right to keep. The station is the harder of the two, and the walkers there are still wearing uniforms. Do not go tired, and do not go without a plan for getting out.",
          },
        },
      },
      garden: {
        blurb: "A row of greenhouses with seeds, soil, and a locked potting shed.",
        door: {
          title: "Rosa Painted the Gate",
          text: "Rosa. I ran this greenhouse before the Fall, and I will keep calling it mine until someone proves otherwise. Seed packets are on the bench near the front, sorted and labeled in my handwriting. Soil bags are stacked in the middle of the floor like sandbags, which lately is what they are. At least three walkers are inside, and one stays near the back where the glass gave out. The others move with the sun. The potting shed is locked, and it holds the best of what I managed to save. My note is on the potting bench at the back, on the right. Read it, and the shed is yours.",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Watering Can",
            text: "Rosa again. The potting shed has a padlock, and I hid the key where a thief would never think to look, because thieves do not water plants. It is in the watering can on the bench. Tip the can, let the water drain, and the key slides into your palm. With it you can open the potting shed now. There are more seeds inside, and there is a water tank. Keep the seeds dry. Wet seeds are just dirt that cost you a trip, and trips are the only currency that matters anymore.\n\nIf you need tools, or a second tank, go north. Station 12 is the fire station north of here. Its equipment bay has tools and water tanks, enough to build a garden that feeds more than one person. Chief Dunn ran that station, and I believe he is still there, because firefighters do not leave their post. Tell him Rosa sent you, and tell him the tomatoes made it. He will understand what that means, and if he does not, he will pretend to.",
          },
        },
      },
      police: {
        blurb: "The 4th Precinct: gun parts, an armor plate, and a locked armory.",
        door: {
          title: "Sergeant Vega's Notice",
          text: "Sergeant Vega. Gun parts are in the squad room, where my people set them down and did not come back for them. An armor plate is in the garage room on the right, leaning against a cruiser. At least five walkers are inside, and one of them is big. The big one waits in the garage room, beside that plate, so the plate costs more than it looks. Budget accordingly. The armory is locked, and I locked it. My note at the front desk has the combination. Read it before you try that door, because the door does not care how strong you are.",
        },
        notes: {
          "police-desk": {
            title: "The Armory Combination",
            text: "Sergeant Vega again. The armory has a dial lock, and the combination is 19-4-33. Turn it slowly: left to 19, right to 4, left to 33. Rush it and the dial slips, and you start over with less patience than before. Do it properly, and you can open the armory now. There are gun parts inside, and there is an armor plate. Take what you can carry and leave the rest in order. Someone else will read this note, and I would like them to find the place as I left it.\n\nOne more thing, since you clearly read. The Public Library is north of downtown. It has books in its archive room, more than anyone in this city ever checked out. The librarian stayed when everyone else ran. Her name is Mrs. Greer, and she knows that building the way I know this one, every door and every blind corner. If you get there, help her if you can. People who stay are the ones worth helping. That is not policy. That is just what I have learned.",
          },
        },
      },
      school: {
        blurb: "A middle school with boxes of books in the classrooms and a locked library closet.",
        door: {
          title: "Max and Mia Were Here",
          text: "Max and Mia wrote this, and we are still here, which is more than the sign out front can say. Boxes of books are in the back right classroom and in the bottom left room. At least four walkers are inside, and one patrols the hallway like a substitute who never learned the schedule. It goes back and forth, so time your move and cross behind it. The library closet is locked. The key is in the teacher's note, and that note is on the teacher's desk in the back left classroom. Read it and the closet opens. We took one box and ran. There are plenty left for you.",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk Drawer",
            text: "I am Ms. Adler, and I taught in this room for eleven years. The library closet key is in the top desk drawer. The drawer sticks, so pull it all the way out and look in the back corner, under the attendance sheets. With that key you can open the closet now. It holds boxes of books and a folder of city maps. The maps may be worth more than the books this season, but the books will outlast all of us. I used to say that to bored students. Now I actually believe it.\n\nNorthgate Mall is in the north. It has food, medicine, and wire, everything a base needs under one roof, and that is exactly why the crowds there are the worst in town. They fill the whole floor like a tide that never goes out. Go only if you must, and never alone if you can help it. I told my students the same thing about these hallways. Stay together, stay quiet, keep moving. Most of them listened, which is the best a teacher can hope for on any day, including this one.",
          },
        },
      },
      firehouse: {
        blurb: "Station 12, a fire station with tools, water tanks, and a locked equipment bay.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Chief Dunn. A tool kit is in the back office, through the door behind the desk, where I set it down. A water tank is in the truck bay on the right, strapped to the wall where the hoses used to hang. At least four walkers are inside, and one is in the truck bay. It stands between you and that tank with the patience of something that has nowhere else to be. The others wander the back halls. The equipment bay is locked, and I hold the only way in. My note is on the front desk. Read it and you will know which key, and why it matters that it is that one.",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "Chief Dunn again. Look at the key board behind this desk. There are a dozen keys hanging on it, and exactly one matters. Take the red key, and only the red one; the rest open rooms with nothing left in them. The red key opens the equipment bay lock, so you can open the equipment bay now. There is a water tank in there, plus lumber and tools. Load the tank first, because it is the heaviest, and you will not want to be carrying it last with your arms already gone.\n\nIf you need water filters, a tank alone will not save you; it only stores what you have already cleaned. Go to the Water Tower on the west side. The filters are in its pump house. Theo looks after the pumps, and he kept them running when the rest of us gave up on this town in one way or another. He is the reason the taps still work. Thank him for that, and then get back on the road before dark. That is not advice. It is procedure.",
          },
        },
      },
      hospital: {
        blurb: "St. Anne Annex, the hospital in the north hills: medicine, a generator, and the worst walkers in town.",
        door: {
          title: "Doc Lin on the Ambulance",
          text: "Doc Lin. I worked here, so trust the map I am handing you. Medical kits are in the rooms along the top hall, and there are more in the bottom left room. The generator is in the bottom right room, and it is heavy enough to change your plans. At least six walkers are inside, and they stand in the dark rooms, motionless, like coats left on hooks. They do not come out until you are close. The pharmacy stock room is locked. The nurse's note is in the top hall, and without it the stock room stays shut. Read everything in this building. It is the only thing in here that will not hurt you.",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada Stayed",
            text: "I am Nurse Ada. I stayed when the others left, because someone had to, and the someone kept turning out to be me. The stock room door takes a badge, and the reader still works, which I check every morning as if it were a pulse. My badge is in the drawer under this station, on top of the charts. Take it, hold it flat to the reader, and you can open the stock room now. There are three medical kits inside. Use them well. They are the last kits in this building, and I counted twice.\n\nStay quiet in here. The walkers in this building follow sound more than light, and the halls carry sound the way pipes carry water, farther than seems reasonable. Do not run. Do not shout, whatever you see. Walk softly and keep your light low, and they may never turn your way. I have walked these halls for weeks like that, and I am still writing, which is the only evidence I can offer. Whatever you came for, it is not worth announcing yourself over.",
          },
        },
      },
      watertower: {
        blurb: "The pump building under the Water Tower, stocked with filters and a locked pump house.",
        door: {
          title: "Theo's Note on the Gate",
          text: "Theo. I tend the pumps, and I still check them whenever the yard clears, which is less often than I would like. Water filters are on the floor by the crates, so look low and mind your footing. At least four walkers are inside the pump building. They do not leave, because nothing in there ever gives them a reason to, and you will have to deal with them yourself. The pump house is locked, and the key is not on me. My note is on the control panel inside the building. Read it, and you will know where I hid the key and what I need from you in return.",
        },
        notes: {
          "watertower-panel": {
            title: "Theo's Breaker Box",
            text: "Theo again. The pump house key is in the breaker box, the gray metal box on the wall to your left. It is not locked, because nobody steals from a breaker box, and I have been counting on that. Open it, and the key hangs on a nail inside, beside the main switch. With it you can open the pump house now. There are filters in there, a water tank, and wire. Take what you need and be quick about it. The walkers in this building hear every door, and they do not distinguish between a polite one and a careless one.\n\nIf it is medicine you need, I can only point you north. St. Anne Annex, the hospital, is north along the river road. It still has medicine, more than anywhere else left standing, and it is the most dangerous place in town. Those two facts are not a coincidence. Go in daylight or not at all, and go rested, because nobody leaves that building in a hurry. What I need from you in return is small: leave the pumps running as you found them. People downhill still drink this water without ever knowing my name, which suits me fine. You came here for water. Leave some for everyone else.",
          },
        },
      },
      lumberyard: {
        blurb: "Ridge Lumber on the east ridge, stacked with wood and guarded by a locked kiln shed.",
        door: {
          title: "Ruby's Spray Paint",
          text: "Ruby again, and I painted this one large so nobody could claim they missed it. Lumber is stacked in the racks, both in the middle of the yard and at the back. At least five walkers are inside, and they gather by the loading dock as if a truck were still coming. Stay away from the dock if you can, and take the wood from the far racks. The kiln shed is locked. The yard boss left a note on the paint rack, and it has what you need to get in. Read it before you touch that shed, and read it again before you touch anything that makes noise.",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Clipboard",
            text: "Carla here, yard boss, or whatever the title is worth now. The kiln shed has a padlock with a dial, and the code is 2218. Spin it to those numbers, and the lock drops open in your hand. You can open the kiln shed now. The lumber in there is dry, kiln dry, and dry wood is worth hauling because it does not rot on you halfway through a build. There are nails in the shed as well, boxed and sorted, because I ran a tidy yard and I see no reason to stop.\n\nDo not run the saws. Not once, not even to cut a single board down to size. The noise brings the whole dock crowd, and they come faster than you would believe from the way they stand around. One scream from a blade and the yard fills from the dock inward. Carry what you need and go. The quiet is the only fence this place has left, and it stays standing exactly as long as you respect it. Everything else here, you can take.",
          },
        },
      },
      mall: {
        blurb: "Northgate Mall in the north, stocked with everything and guarded by the biggest crowd in town.",
        door: {
          title: "Jo's Note on the Mall Doors",
          text: "Jo, and this is the big one, so read it twice. Food, medicine, and wire are spread across the store floor, which means you will cover a lot of ground with your back turned. At least six walkers are inside, and they move in a group. Where one goes, they all go, one shadow with six bodies. The security office is locked. The guard's note is by the paint display, and it explains the lock. Find the note, keep the group on the far side of the floor, and do not let yourself get caught between them and a wall. There is no second way out of a corner.",
        },
        notes: {
          "mall-guard": {
            title: "Luis Left the Code",
            text: "My name is Luis, and I worked security at this mall for six years, nights mostly. The office has a keypad by the door, and the code is 0912. Type it in, and the lock lets go. You can open the security office now. There are gun parts inside, and there are radio parts and a tool kit. I locked them up on the last day. That was when I finally understood that nobody was coming to relieve me, and the radio was never going to answer.\n\nThe walkers here come running at anyone who runs, and I have watched them longer than anyone, which is not a boast. One person breaks into a sprint and the whole floor turns at once, and they do not tire. So do not run, no matter how close they get. Walk, and most of them stay put. Running is a fire alarm to them; walking is just another body in the crowd, and they have never learned to tell the difference. It feels wrong every single time, like holding still while a wave comes in. It works anyway. I am still here because of it, and I would like you to be too.",
          },
        },
      },
      library: {
        blurb: "The Public Library north of downtown, with books, city maps, and a locked archive room.",
        door: {
          title: "Mrs. Greer's Book Drop",
          text: "Mrs. Greer, the librarian. Boxes of books are in the reading rooms on both sides of the building. At least five walkers are inside, and two are in the main hall. You will meet those two first, because every door in this building leads through that hall, which seemed like good design once. The others keep to the corners. The archive room is locked, and I keep it that way on purpose. My note is on the reference desk in the back left reading room. Read it, and the archive opens to you. Please be quiet in here. It is still a library, and I still work here.",
        },
        notes: {
          "library-desk": {
            title: "The Key in the Dictionary",
            text: "Mrs. Greer again. The archive key is inside the big dictionary on this desk, the unabridged one nobody has lifted in a decade. Open it to the middle and find the hollow cut into the pages. The key sits in that hollow, flat and cold. With it you can open the archive room now. The archive has books, and it has a folder of city maps. Those maps show every street in this town, including the ones the walkers have not found yet. You will want those when the main roads close.\n\nReading saved this building. Look at the walls on your way out. They are stacked with the books nobody wanted, the ones that sat for years without a single checkout. Now they stop walkers. Books are heavy, and it turned out that mattered more than anything printed inside them. That is a lesson I am still deciding how to feel about. Take what you came for. If you have a moment, put something back on a shelf. It helps me to see that the place still works.",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
