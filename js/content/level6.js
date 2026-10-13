/* Reading level 6 (6th grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 6 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[6] = {
    level: 6,
    howto: [
      "Months after the Fall, you run the last working van out of a boarded-up house at the south end of town. That house is your home base, and it is the only place the game ever saves. Each player keeps their own labeled save, up to 4 of them, and you pick yours on the title screen. Every building in this city has walkers in it, and every building has notes. People who were there before you wrote them: where the fuel is, which door is locked and how to open it, which street is still clear. Read them and you find more and lose less. If you go down on the road, in a building, or in the yard, the game reloads your last base save, and everything since is gone. The van only counts when it comes home.",
      "Home base is a yard, and you stand in it in first person: cabin behind you, van in the driveway, a fence around the lot. Every room you build appears in that yard, and each level makes it look bigger and sturdier, so your progress is something you can walk around. Time there runs in phases. In a calm phase nothing is at the fence. Go inside the cabin to build, where the menu pauses the yard, or climb into the van and leave. Then a wave comes, and a wave is unpredictable: sometimes a few walkers, sometimes a lot, sometimes none at all. The ones that come claw at the fence until it gives. The Walls room changes the fence itself, trading it for something tougher at every level. During a wave the cabin door and the van are locked, so whatever is at the fence is yours to deal with. The fence does not mend itself. Every hole stays open until you close it, and an open hole is an invitation the next wave will accept. Stand at the hole and press E, or use the cabin menu. Each hole costs 1 scrap, and a cracked segment can be braced for 1 scrap as well. Building Walls up rebuilds the whole fence from scratch. Once Walls reaches 2, you can craft traps at the workbench and set them in the yard or along the fence line. The Spike trap comes with Walls 2 and the Blast trap with Walls 3. The game saves on arrival, after every build, and after every wave, so a wave survived is a wave banked.",
      "Open the map and choose a destination. The city is fixed and hand-drawn, fifteen locations and the base, but only a handful are known at first. Notes reveal the rest a place or two at a time, and the Radio room reveals them faster. Plan on the city map, because the road itself will not show you the way. Pick a place and the map spells out the route in words: which streets to take, and which side of the road your lot is on. Distance sets the length of the drive, and the destination's danger sets how many walkers cross your headlights. The Power room shows that danger before you commit, and every day you survive adds a few more. If you are still parked at a place when you open the map, you can walk straight back into it.",
      "On the road, the van rolls forward on its own while you aim and fire. Before every junction a sign tells you where each lane goes, so read it early. Get into the right lane before the white stop line, using A and D, the arrow keys, or the side buttons. The left lane always carries you straight on, past side streets and parking lots, and every side street is a dead end. At the end of the drive, swing into the right lot. Take a wrong turn or miss your lot, and the drive starts over from where you set out. The damage, scrap, and kills from the failed attempt stay with you. A minimap at the top shows where you are and flags where you are going, but it never draws the route; that part is your job.",
      "At the door you read a note before you step inside, and it goes straight into your backpack. It tells you how many walkers wait and where the items sit, so treat it as a floor plan rather than a warning. The buildings are big, with halls, side rooms, and dead ends. Every corner holds a landmark you cannot mistake, such as a fire truck, a giant globe, or a green dino. The notes steer you by them. Press M for a map of the parts you have already seen. Every doorway inside is a real door: E opens it and E closes it. Walkers cannot open doors, which makes a closed door the cheapest wall you will ever own. Shelf and floor items return 3 days after you take them; cache items never do. Somewhere inside is a second note. Reading it lets you open the locked cache room, where the best items are kept, and it names the next place worth trying. Press E at the entrance to leave. Go back in on the same trip and the building is exactly as you left it, down to the doors; driving home resets all of it. Re-read any note you have found in the backpack, which opens at base, on the map, or inside a building.",
      "Hurt? A Medical kit heals you to full, and the backpack carries up to 3 of them, packed from storage at the cabin. Inside a building you can also use a kit from the van's cargo. Drive home and the cargo moves into storage, you eat one food, and the day counter climbs. The Garden, the Farm, and the Lab add whatever they produced. The garage repairs the van for 1 scrap per 3 health missing, never less than 5, and for free once the Garage room is built. Spend items and scrap to raise the rooms, eight at first and three late in the game: a Well, a Farm, and a Lab. Building a room, upgrading the van or the gun, and crafting a trap all happen at the garage workbench, as short typing rounds. Type the words on the screen before the timer runs out. Run out and you simply try again, because nothing is spent until you finish. The bench first teaches you the home row, then moves you from single keys to words, phrases, and sentences. Repairs need no typing.",
    ],
    controls: [
      "Road: Aim with the mouse and hold to fire. A and D, the arrow keys, or the side buttons change lanes. Read the sign before each junction, and be in your lane before the white stop line.",
      "Inside and in the yard: W A S D move, the mouse looks, and a click fires. Shift makes you run, and B opens the backpack. M opens a map of the parts of a building you have seen, and P or Esc pauses the game.",
      "E does it all: E reads notes, opens and closes doors, and opens a cache once you have read the note that explains how. E leaves a building, enters the cabin, starts the van, and rebuilds a hole in the fence for 1 scrap.",
      "Traps in the yard: T sets a spike trap and R sets a blast trap. Each goes on the ground in front of you or just past the fence line, where the walkers come through.",
      "Backpack: Every note you have read, kept with where you found it, plus your medical kits. Use a kit to heal back to full.",
      "Workbench: Building, upgrading, and crafting are short typing rounds. Type what is on the screen before the timer runs out; running out only means you try again, and nothing is spent until you finish.",
      "Map: Tap a place, then Drive, and read the route it spells out before you go. At the place where you are parked, you can go back inside, and it will be exactly as you left it.",
    ],
    road: {
      to: "Bound for {dest}",
      here: "You made it",
      home: "Home again",
      fog: "Thick fog",
      night: "After dark",
      hungry: "No rations",
      deadEnd: "Dead end",
      noThrough: "No through road",
      closed: "Road closed",
      lot: "Parking lot",
      hint: "Read the sign, then claim your lane with A and D, the arrow keys, or the side buttons before the white line.",
      wrongWay: "Wrong turn. That road leads to {place}.",
      wrongStreet: "Wrong turn. That is {street}, and it is not your way.",
      wrongSide: "Wrong turn. {street} leads nowhere.",
      wrongPlace: "Wrong lot. That is {place}, not {dest}.",
      wrongLot: "Wrong lot. This is not {dest}.",
      missed: "You overshot {dest}.",
      restart: "Back to {origin}. Run it again; the damage stays.",
      routeHead: "Your route",
      routeTake: "Follow {street} to {place}.",
      routeTakeStreet: "Follow {street}.",
      routeStraight: "Keep to the left lane past side streets and other lots.",
      routeLeft: "{dest} is on the left. Take the left turn lane into its lot.",
      routeRight: "{dest} is on the right. Take the right lane into its lot.",
    },
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
        blurb: "A gas station with a garage bay, fuel cans on the floor, and a locked storeroom off the back hall.",
        door: {
          title: "Ruby, Taped to the Door",
          text: "Ruby. Writing fast, so forgive the handwriting. At least three walkers are inside, and one of them stands in the garage by the car lift, under arms that will never raise another car. That count is not a promise. More come as the days pass, so whatever you plan to do here, do it sooner. The fuel cans are on the floor, not on the shelves; everyone who stripped this place looked at eye level and walked right past them. One sits by the slushie machine, off to your left as you come in. The other is in the garage, beside the tire tower, which means crossing the same concrete as the thing by the lift. The storeroom is locked. The clerk left a note on the counter by the front door, and I would bet it explains the lock. Read it before you waste a shoulder on that door.",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Note by the Register",
            text: "This is Dev. I worked the register here for two years, which means I know every hiding place a bored clerk invents. The storeroom key is on the hook under this counter, exactly where my knee used to find it on slow nights. Reach under, feel along the lip for the hook, and take it. With that key you can open the storeroom now. There is more fuel in there than the shelves ever admitted to. There is also a spool of wire I was saving for a repair that no longer matters.\n\nThe storeroom is off the back hall, behind the shelves. Find the ice machine in the break room at one end, then walk the hall away from it, all the way down. The storeroom is the last door before the garage. If you reach the garage, you went one door too far, and the thing by the car lift will make sure you notice.\n\nI am gone by the time you read this, headed for Ortiz Auto on the east side of town. The shop is still standing, and a standing shop means a lift, a bench, and a chance at parts. If seeds and soil are what you need, go the other direction. Rosa is at Greenhouse Row, west past this gas station. She kept the greenhouses alive when the rest of the town went dark, and she deals fairly with anyone who shows up honest. Tell her Dev sent you.",
          },
        },
      },
      grocery: {
        blurb: "A corner store with food on the floor, walkers at the loading door, and a cold, locked walk-in cooler.",
        door: {
          title: "Doc Lin on the Glass",
          text: "Doc Lin, in marker, so read this before the weather does. The shelves are picked over, stripped as clean as a prescription pad. What food remains is on the floor, where it fell when the first crowds shoved through. Some lies by the fish tank at the left end of the store, and more by the freezers along the right wall. Walkers get in through the loading door at the back, by the forklift. That door has never closed properly, and nothing I tried changed that. Count on at least three inside at any hour, and assume the next one is already on its way. The walk-in cooler still runs cold, and it is locked. The manager's note is in the office, back left, through the staff door. Read it first. The cooler is the only reason anyone should still be coming here.",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Latch",
            text: "I am Hana, the manager, and I locked the cooler deliberately. The latch is stubborn, not broken, and that distinction matters. Lift the latch while you pull on the door, and the bar slides out of its catch as if it had been waiting for you. Do both at once; either alone does nothing. That is the whole secret, so you can open the cooler now. Inside there is food, and one medical kit on the top shelf, still sealed. The cold has preserved everything in there. That is more than I can say for the rest of this store, or for the people who ran through it.\n\nFinding it is easy. Step out of this office into the back corridor and turn right, toward the forklift and the loading dock. The cooler is the very next door. Do not keep walking past it. The walkers come in by that forklift, and the corridor funnels them straight at you.\n\nWhen that kit is gone, you will want more medicine, and this neighborhood has one answer. Try Mile 9 Pharmacy, west of here. Last week it still had medicine on its shelves, because Mr. Okafor kept it stocked out of sheer professional stubbornness. Take what you need and leave the rest. Someone else will sit at this desk after you, hungrier than you are and hoping just as hard.",
          },
        },
      },
      hardware: {
        blurb: "A big hardware store with nails, tools, lumber, and a locked back room past the lumber racks.",
        door: {
          title: "Mr. Reyes Nailed This Up",
          text: "Mr. Reyes, the owner. I built this store with my own hands, so take what I say about it as fact. At least five walkers are inside, and two of them drift through the middle aisles. The tools are in the middle aisle, which means they belong to those two until you decide otherwise. Nails are by the toilet display in the front left corner, the sale stack nobody ever bought from. Lumber is in the lumber racks at the back, beyond the aisles. Take the easy things first, and keep an ear on the aisles while you do. The back room is locked, and the lock is not the real problem. My note is by the paint mixer, back left, tucked into the paint shelf. It explains the door, and the door is worth the walk.",
        },
        notes: {
          "hardware-paint": {
            title: "The Door That Sticks",
            text: "Mr. Reyes again. The back room door sticks, and most people quit after two shoves and a bruised shoulder. The frame swelled the winter the roof leaked, so the door sits low and drags on the sill. The trick is to lift the handle and push at the same time. Lift it high, lean your weight in, and the door pops free with a sound like a knuckle cracking. That is all it takes, so you can open the back room now. Inside I left a water filter, a second tool kit, and lumber. I meant to come back for all of it. Consider it inventory I am writing off.\n\nDo not go back through the aisles to reach it. Take the side door by the paint mixer, into the lumber room, and walk on past the lumber racks. The back room door is beyond them, marked for staff only.\n\nIf you need more wood than one back room can hold, go to Ridge Lumber on the east ridge. There are stacks of lumber in that yard, enough to board up a whole street. If filters are the problem, try the Water Tower on the west side; there are more filters in its pump house. Theo keeps those pumps turning out of something between duty and habit. Tell him I am sorry about the invoice I never settled. He will know which one.",
          },
        },
      },
      pharmacy: {
        blurb: "A pharmacy with medical kits on the floor and a locked cabinet room behind the counter.",
        door: {
          title: "Mr. Okafor's Door Note",
          text: "Mr. Okafor, pharmacist. Two medical kits are still out on the floor. One lies by the giant toothbrush on the left, a dental display that outlived the dentist who paid for it. The other is in the middle of the store, where the aisles cross. Look down rather than up; the crowds took whatever sat at eye level and missed the rest. At least five walkers are inside, and most of them keep near the back, behind the counter and in the rooms beyond it. They are slow until they notice you, and then they are not. The cabinet room is locked, and its lock takes a code rather than a key. The code is on my note behind the pharmacy counter. The only way behind it is at the right end, by the wheelchairs.",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Room Code",
            text: "Mr. Okafor again. The cabinet room has a keypad on its door, and I am trusting you with the code: 4471. Press the numbers deliberately, wait for the click, and the lock releases. You can open the cabinet room now. Inside are two more medical kits and a water filter, because clean water prevents more harm than any pill I ever dispensed. I left them for whoever came next, and whoever came next is apparently you. Use them with some judgment.\n\nYou are standing almost on top of it. The cabinet room door is back here behind the counter, in the corner on the same side as the wheelchairs. Turn toward them, follow the back wall, and you will find a door marked for no entry, which you may now ignore.\n\nIf you need more than that, you will have to go north, and I say this with reluctance. St. Anne Annex is the hospital in the north hills. It still has medicine, and it has a generator that could light an entire base. But understand me clearly: it is the most dangerous place in town, and its dark halls conceal more than they reveal. Go in daylight. Go rested. Go with a plan for leaving before you have a plan for entering. Medicine is useless to someone who never makes it home.",
          },
        },
      },
      autoshop: {
        blurb: "A repair shop with engine parts on the benches and a generator hidden in the service pit.",
        door: {
          title: "Dev's Chalk on the Door",
          text: "Dev here, from the Gas-N-Go, and I made it this far, which surprised me more than anyone. Engine parts are on the workbenches. One set is in the back right corner of the shop, by the red tool chest. The other is in the left bay, the first one you reach from the waiting room. At least five walkers are inside. One wanders the parts room by the engine crane, so it will not be the first thing you meet, only the one you forget about. Do not let it come up behind you while your hands are full at a bench. The service pit is under a locked hatch. Mr. Ortiz left a note in the office behind the waiting room, and that hatch will not move for anyone who has not read it.",
        },
        notes: {
          "autoshop-office": {
            title: "Mr. Ortiz on the Hatch",
            text: "This is Mr. Ortiz, and this is my shop, whatever the sign says now. The hatch over the service pit looks welded shut, but it is only stubborn, like most things in here. The bolt comes out if you twist it to the left. People turn it right, feel it bind, and give up, assuming the thing is seized. Turn it left, hard, and it slides free. That means you can open the service pit now. My generator is down there, where the crowds never thought to look, with spare parts beside it and a fuel can to get it running.\n\nThe pit room stands by itself in the middle of the shop floor, walled in so nobody drives into it. Go out through the waiting room into the shop and circle it. The hatch is on the front side, the side that faces the oil drums. If you are staring at the red tool chest, you have gone around the wrong way.\n\nIf you need wire or radio parts, Signal Electronics downtown still has both. But it sits near the walker crowds, and they drift that way the way water finds low ground. Go in fast, come out faster, and do not linger past dark. Downtown after dark belongs to them. I have watched it from the roof of this building enough nights to say so without exaggeration.",
          },
        },
      },
      radioshack: {
        blurb: "An electronics store with spools of wire, sitting uncomfortably close to the downtown crowds.",
        door: {
          title: "Jo's Sign in the Window",
          text: "Jo. Spools of wire are lying between the two long middle shelves, where the store kept the unglamorous stock nobody bothered to steal. One is on the TV wall side, to the left; the other is on the robot side, to the right. At least six walkers are inside. One stands near the right end of the counter, by the robot, as though it were still waiting to be served. It hears the door even from there, so be ready before you step through rather than after. The others are between you and it, among the displays and the dead screens. The manager's office is locked. The manager left a note on the counter at the back, and the office will not open for anyone who has not read it.",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Key Under the Register",
            text: "I am Priya, the manager, and I am the one who hid the key. The office key is taped under the register, pressed flat against the metal so no one would find it by accident. Reach under the counter and run your fingers along the back edge until you feel the tape. Peel it off, and you can open the manager's office now. Inside are two boxes of radio parts and more wire than you can carry in one trip. Take the radio parts first. They are the hardest thing in this town to find, and I say that as someone who ordered them for a living.\n\nThe office is close. Walk to the right end of this counter, toward the robot with our name on its chest. The office door is in the back wall, just left of the robot, under the sign that says private. Mind whoever is standing there.\n\nTwo places north of downtown are worth the drive, if you survive the drive. The 4th Precinct is the police station, and it has gun parts. Lincoln Middle School has books, more boxes of them than a school that size had any right to keep. The station is the harder of the two, and the walkers there are still wearing uniforms. Do not go tired, and do not go without a plan for getting out.",
          },
        },
      },
      garden: {
        blurb: "Greenhouses and a garden shop with seeds, soil, and a locked potting shed.",
        door: {
          title: "Rosa Painted the Gate",
          text: "Rosa. I ran this greenhouse before the Fall, and I will keep calling it mine until someone proves otherwise. Seed packets are in the shop by the gate, near the big gnome, sorted and labeled in my handwriting. Soil is in the big greenhouse, the one with the scarecrow standing guard over beds that no longer need guarding. At least five walkers are inside, and one keeps to the back of the big greenhouse, among the rows where the glass gave out. The others move with the sun. The potting shed is locked, and it holds the best of what I managed to save. My note is on the potting bench by the palm tree, in the back right glasshouse. Read it, and the shed is yours.",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Watering Can",
            text: "Rosa again. The potting shed has a padlock, and I hid the key where a thief would never think to look, because thieves do not water plants. It is in the watering can on this bench. Tip the can, let the water drain, and the key slides into your palm. With it you can open the potting shed now. There are more seeds inside, and there is a water tank. Keep the seeds dry. Wet seeds are just dirt that cost you a trip, and trips are the only currency that matters anymore.\n\nThe shed is close. Leave the palm tree house by its door and take the path down toward the beehives. The shed door is along that path, on your left as you go, before you reach the hives. The bees have outlasted everyone else here, so give them room.\n\nIf you need tools, or a second tank, go north. Station 12 is the fire station north of here, and its equipment bay has tools and water tanks. Chief Dunn ran that station, and I believe he is still there, because firefighters do not leave their post. Tell him Rosa sent you, and tell him the tomatoes made it. He will understand what that means, and if he does not, he will pretend to.",
          },
        },
      },
      police: {
        blurb: "The 4th Precinct: gun parts, an armor plate, and a locked armory.",
        door: {
          title: "Sergeant Vega's Notice",
          text: "Sergeant Vega. Gun parts are in the squad room, to the left of the long hall that runs back from the lobby. My people set them down there and did not come back for them. An armor plate is in the garage on the right, leaning by the riot shields. At least eight walkers are inside, and one of them is big. The big one waits in the garage by the police bike, so that plate costs more than it looks. Budget accordingly, and do not let the size of the garage fool you into thinking there is room to run. The armory is locked, and I locked it. The combination is on my note at the front desk, just inside this door. Read it before you try the armory, because that door does not care how strong you are.",
        },
        notes: {
          "police-desk": {
            title: "The Armory Combination",
            text: "Sergeant Vega again. The armory has a dial lock, and the combination is 19-4-33. Turn it slowly: left to 19, right to 4, left to 33. Rush it and the dial slips, and you start over with less patience than before. Do it properly, and you can open the armory now. There are gun parts inside, and there is an armor plate. Take what you can carry and leave the rest in order.\n\nGetting there means crossing the building. Walk the long hall straight back to the back hall, then turn right and follow it toward the police bike in the garage. The armory is at the right end of the back hall, the last door before the garage. If you can see that bike, you are close enough to be seen by whatever stands beside it.\n\nOne more thing, since you clearly read. The Public Library is north of downtown. It has books in its archive room, more than anyone in this city ever checked out. The librarian stayed when everyone else ran. Her name is Mrs. Greer, and she knows that building the way I know this one, every door and every blind corner. If you get there, help her if you can. People who stay are the ones worth helping. That is not policy; it is just what I have learned.",
          },
        },
      },
      school: {
        blurb: "A middle school with boxes of books in its rooms and a locked library closet.",
        door: {
          title: "Max and Mia Were Here",
          text: "Max and Mia wrote this, and we are still here, which is more than the sign out front can say. There are two boxes of books we could not carry. One is in the music room, beside the drum set nobody has played since the bells stopped. The other is in the front office, right behind the lion statue that guards the lobby. At least six walkers are inside. One patrols the main hallway like a substitute who never learned the schedule, back and forth, so time your crossing and slip in behind it. The library closet is locked. The key is in the teacher's note on the desk in the science room, back left, beside the big brain model. Read it and the closet opens. We took one box and ran. There are plenty left for you.",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk Drawer",
            text: "I am Ms. Adler, and I taught science in this room for eleven years, under the glassy stare of that big brain. The library closet key is in the top drawer of this desk. The drawer sticks, so pull it all the way out and look in the back corner, under the attendance sheets. With that key you can open the closet now. It holds books and a folder of city maps. The maps may be worth more than the books this season, but the books will outlast all of us. I used to say that to bored students. Now I actually believe it.\n\nWalk the main hallway to the right. The library is the room next door to the one with the drum set, and its closet is in the back right corner, past the shelves. Cross the hallway quickly; voices carried in it even when it was full of children.\n\nNorthgate Mall is in the north. It has food, medicine, and wire, everything a base needs under one roof, and that is exactly why the crowds there are the worst in town. They fill the whole floor like a tide that never goes out. Go only if you must, and never alone if you can help it. I told my students the same thing about these hallways: stay together, stay quiet, keep moving.",
          },
        },
      },
      firehouse: {
        blurb: "Station 12, a fire station with tools, water tanks, and a locked equipment bay.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Chief Dunn. A tool kit is in the office behind the watch desk, where I set it down at the end of my last shift. A water tank is strapped to the right wall of the truck bay, past the gear racks where our coats still hang in a row. At least six walkers are inside, and two of them are in the truck bay. They stand between you and that tank with the patience of things that have nowhere else to be. The others drift through the bunks and the back halls. The equipment bay is locked, and I hold the only way in. My note is on the watch desk, beside the spotted dog, the statue the kids used to pat on school tours. Read it and you will know which key opens the bay.",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "Chief Dunn again. Look at the key board on the wall beside this desk. There are a dozen keys hanging on it, and exactly one matters. Take the red key, and only the red one; the rest open rooms with nothing left in them. The red key opens the equipment bay lock, so you can open the equipment bay now. There is a water tank in there, plus lumber and tools. Load the tank first, because it is the heaviest, and you will not want to carry it last with your arms already gone.\n\nThe bay is in the far corner of the station. Go through the side door into the truck bay and head for the back, keeping the fire truck on your left. The equipment bay door is at the back of the truck bay, right of the fire truck. Count the two in there before you commit to the walk.\n\nIf you need water filters, a tank alone will not save you; it only stores what you have already cleaned. Go to the Water Tower on the west side. The filters are in its pump house. Theo looks after the pumps, and he kept them running when the rest of us gave up on this town in one way or another. Thank him for that, and then get back on the road before dark. That is not advice. It is procedure.",
          },
        },
      },
      hospital: {
        blurb: "St. Anne Annex, the hospital in the north hills: medicine, a generator, and the worst walkers in town.",
        door: {
          title: "Doc Lin on the Ambulance",
          text: "Doc Lin. I worked here, so trust the map I am handing you. One medical kit is in the patient room next to the x-ray machine, off the back corridor on the left. Another is in the gift shop, by the giant teddy bear, just inside the lobby on your left. The generator is in the utility room, on the right side of the building, and it is heavy enough to change your plans. At least nine walkers are inside. They stand in the dark rooms, motionless, like coats left on hooks, and they do not come out until you are close. The pharmacy stock room is locked. The nurse's note is at the nurses' station in the middle, and without it the stock room stays shut. Read everything here. It is the only thing in this building that will not hurt you.",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada Stayed",
            text: "I am Nurse Ada. I stayed when the others left, because someone had to, and the someone kept turning out to be me. The stock room door takes a badge, and the reader still works; I check it every morning as if it were a pulse. My badge is in the drawer under this station, on top of the charts. Take it, hold it flat to the reader, and you can open the stock room now. There are three medical kits inside. Use them well. They are the last kits in this building, and I counted twice.\n\nYou barely have to move. The stock room door is across the corridor from this station, on the angel statue side, the same side as the chapel. Put the counter at your back, take a few steps, and you are there.\n\nStay quiet in here. The walkers in this building follow sound more than light, and the halls carry sound the way pipes carry water, farther than seems reasonable. Do not run. Do not shout, whatever you see. Walk softly and keep your light low, and they may never turn your way. I have walked these halls for weeks like that, and I am still writing, which is the only evidence I can offer. Whatever you came for, it is not worth announcing yourself over.",
          },
        },
      },
      watertower: {
        blurb: "The pump building under the Water Tower, stocked with filters and a locked pump house.",
        door: {
          title: "Theo's Note on the Gate",
          text: "Theo. I tend the pumps here, and I still check them whenever the yard clears, which is less often than I would like. One water filter is by the crates near the big red wheel, the valve that feeds the whole tower. The other is in the boat workshop, beside the rowboat we used to check the river intake. At least six walkers are inside the pump building. They do not leave, because nothing in there ever gives them a reason to, so you will have to deal with them yourself. The pump house is locked, and the key is not on me. My note is on the control panel in the back right room. Read it, and you will know where I hid the key and what I need from you in return.",
        },
        notes: {
          "watertower-panel": {
            title: "Theo's Breaker Box",
            text: "Theo again. The pump house key is in the breaker box, the gray metal box on the wall of this room. It is not locked, because nobody steals from a breaker box, and I have been counting on that. Open it, and the key hangs on a nail beside the main switch. With it you can open the pump house now. There are filters in there, a water tank, and wire. Take what you need and be quick about it. The walkers in this building hear every door, and they do not distinguish between a polite one and a careless one.\n\nTo reach it, go back out to the pump hall and find the big red wheel. The pump house door is at the back of the pump hall, right of the big red wheel, under a sign that says keep out. You have my permission to ignore it.\n\nIf it is medicine you need, I can only point you north. St. Anne Annex, the hospital, is north along the river road. It still has medicine, more than anywhere else left standing, and it is the most dangerous place in town. Those two facts are not a coincidence. Go in daylight or not at all. What I need from you in return is small: leave the pumps running as you found them. People downhill still drink this water without knowing my name, which suits me fine.",
          },
        },
      },
      lumberyard: {
        blurb: "Ridge Lumber on the east ridge, stacked with wood and guarded by a locked kiln shed.",
        door: {
          title: "Ruby's Spray Paint",
          text: "Ruby again, and I painted this one large so nobody could claim they missed it. Lumber is stacked in the long racks in the middle of the building, more than you could haul in a week. One more stack sits out back by the log pile, in the open yard behind the racks. At least eight walkers are inside, and they gather by the loading dock and the flatbed truck, as if a delivery were still coming. Stay away from the dock if you can, and take your wood from the racks on the left, far from that crowd. The kiln shed is locked. The yard boss left a note on a clipboard by the band saw, in the saw shop at the back. Read it before you touch that shed, and read it twice before you touch anything that makes noise.",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Clipboard",
            text: "Carla here, yard boss, or whatever that title is worth now. The kiln shed has a padlock with a dial, and the code is 2218. Spin it to those numbers, and the lock drops open in your hand. You can open the kiln shed now. The lumber in there is dry, kiln dry, and dry wood is worth hauling because it does not rot on you halfway through a build. There are nails in the shed as well, boxed and sorted, because I ran a tidy yard and I see no reason to stop.\n\nLeave the saw shop by its door into the rack hall and turn right along the back wall. The kiln shed door is in that back wall, right of the band saw shop, with a warning about the heat painted beside it. The heat is long gone. The warning stayed.\n\nDo not run the saws. Not once, not even to trim a single board. The noise brings the whole dock crowd, the ones loitering around the flatbed truck. They come faster than you would believe from the way they stand there. One scream from a blade and the yard fills from the dock inward. Carry what you need and go. The quiet is the only fence this place has left, and it stands exactly as long as you respect it.",
          },
        },
      },
      mall: {
        blurb: "Northgate Mall in the north, stocked with everything and guarded by the biggest crowd in town.",
        door: {
          title: "Jo's Note on the Mall Doors",
          text: "Jo, and this is the big one, so read it twice. Food is in the food court at the back, past the tables. Medicine is in the pharmacy on the left. Wire is in the gadget store on the right, next door to the sports shop with the orange tent. That spreads you across a lot of floor with your back turned. At least nine walkers are inside, and they move in a group along the main hall. Where one goes, they all go, one shadow with nine bodies. The security office is locked. The guard's note is in the play area by the green dino, back right. Keep the group on the far side of the hall, and do not get caught between them and a wall. There is no second way out of a corner.",
        },
        notes: {
          "mall-guard": {
            title: "Luis Left the Code",
            text: "My name is Luis, and I worked security at this mall for six years, nights mostly. The office has a keypad by the door, and the code is 0912. Type it in, and the lock lets go. You can open the security office now. There are gun parts inside, and there are radio parts and a tool kit. I locked them up on the last day, when I finally understood that nobody was coming to relieve me.\n\nThe office sits behind the green dino, but there is no way into it from this play area. Cross to the food court, take the kitchen door at the back, and turn right down the service corridor. Follow it to the end. The office is right there, behind the dino.\n\nThe walkers here come running at anyone who runs, and I have watched them longer than anyone, which is not a boast. One person breaks into a sprint and the whole floor turns at once, and they do not tire. So do not run, no matter how close they get. Walk, and most of them stay put. Running is a fire alarm to them; walking is just another body in the crowd. It feels wrong every single time, like holding still while a wave comes in. It works anyway. I am still here because of it.",
          },
        },
      },
      library: {
        blurb: "The Public Library north of downtown, with books, city maps, and a locked archive room.",
        door: {
          title: "Mrs. Greer's Book Drop",
          text: "Mrs. Greer, the librarian. Books are in the stacks on both sides of the main hall, still shelved by the alphabet out of a habit I cannot break. More are in the children's room by the toy castle, front left, where story time always ran long. At least eight walkers are inside, and two of them are in the main hall. You will meet those two first, because every room in this building opens off that hall, which seemed like good design once. The others keep to the corners and the quiet rooms. The archive room is locked, and I keep it that way on purpose. My note is on the reference desk by the giant globe, back left. Read it, and the archive opens to you. Please be quiet in here. It is still a library, and I still work here.",
        },
        notes: {
          "library-desk": {
            title: "The Key in the Dictionary",
            text: "Mrs. Greer again. The archive key is inside the big dictionary on this desk, the unabridged one nobody has lifted in a decade. Open it to the middle and find the hollow cut into the pages. The key sits in that hollow, flat and cold. With it you can open the archive room now. The archive has books, and a folder of city maps that show every street in this town, including the ones the walkers have not found yet. You will want those when the main roads close.\n\nLeave this room by its door into the main hall and turn toward the back. The archive door is at the back end of the main hall, between the rooms with the giant globe and the tall clock. A sign beside it asks for quiet. Mind the two in the hall.\n\nReading saved this building. Look at the walls on your way out. They are stacked with the books nobody wanted, the ones that sat for years without a single checkout. Now they stop walkers. Books are heavy, and it turned out that mattered more than anything printed inside them. That is a lesson I am still deciding how to feel about. Take what you came for. If you have a moment, put something back on a shelf.",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
