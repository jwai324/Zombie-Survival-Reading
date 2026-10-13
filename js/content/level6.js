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
      "At the door you read a note before you step inside, and it goes straight into your backpack. It tells you how many walkers wait and where the items sit, so treat it as a floor plan rather than a warning. Then you go in: first person, walkers closing, items on shelves and floors, scrap piles that pay in scrap. Every doorway inside is a real door. E opens it and E closes it, and walkers cannot open doors, which makes a closed door the cheapest wall you will ever own. Shelf and floor items return 3 days after you take them; cache items never do. Somewhere inside is a second note. Reading it is what lets you open the locked cache room, where the best items are kept. It also names the next place worth trying, and that place appears on your map. Every building also has a locked stash, and its key is never in the same building; it is hidden in a different one. Only the notes lead you to it. One note sends you to a second note, and the second note says where the key is hidden and which stash it opens. Carry the key there and press E at the stash door. What is inside is yours, and stash items never come back. The walls talk too: printed signs and spray-painted graffiti, which you read just by walking up to them. At higher reading levels, each building holds more notes. Some of them are wrong or out of date, so weigh what you read before you trust it. Press E at the entrance to leave. Go back in on the same trip and the building is exactly as you left it. Walkers you put down stay down, scrap you took stays taken, and doors stay as you left them. Driving home resets all of that. Nobody will ever quiz you on any of it. The notes are simply the difference between a full van and an empty one.",
      "Hurt? A Medical kit heals you to full, and the backpack carries up to 3 of them, packed from storage at the cabin. Inside a building you can also use a kit from the van's cargo, one you picked up earlier on the same trip. Drive home with your cargo. At base it moves into storage, you eat one food, and the day counter climbs. Every day you get home, a new page of June's journal is waiting, and once the Radio room is built, a radio broadcast comes in too. The Garden and the Farm add whatever they grew, and the Lab adds whatever it brewed. The garage repairs the van back to full for scrap: 1 scrap for every 3 health missing, and never less than 5. Once the Garage room is built, repairs are free. Spend items and scrap to raise the rooms, eight to begin with and three more late in the game: a Well, a Farm, and a Lab. Out in the yard, each outdoor room has its own lot with a hand-painted sign. The sign says what the room is, what it needs, and why it is still locked. Re-read every note you have found in the backpack, which opens at base, on the map, or inside a building. The backpack also keeps every stash key you carry, which the cabin's stock tab lists as well. It holds the tags you read on items as you pick them up, too: a label, a sticky note, a scribbled warning.",
      "Building a room, upgrading the van or the gun, and crafting a trap all happen at the workbench in the garage. Each one is a short typing round. The words to type are shown on the screen beside a timer. Run out of time and you simply try again; nothing is spent until you finish, so the only thing a failed round costs you is pride. The first time, the bench teaches you where your fingers belong on the home row. Every finished round moves you to the next typing stage: single home-row keys first, then the other rows, then words, phrases, and sentences. Repairs need no typing. If you go down on the road, in a building, or in the yard, the game reloads your last base save. Everything since that save is gone. That is the whole tension. The van only counts when it comes home.",
    ],
    controls: [
      "Road: Aim with the mouse and hold to fire; A and D, or the arrow keys, slide the van across the lanes.",
      "Inside and in the yard: W A S D move, the mouse looks, and a click fires. Shift makes you run, B opens the backpack, and P or Esc pauses the game.",
      "E does it all: E reads notes and opens and closes doors. It opens a cache once you have read the note that explains how, and a stash once you carry its key. E leaves a building, enters the cabin, starts the van, and rebuilds a hole in the fence for 1 scrap.",
      "Traps in the yard: T sets a spike trap and R sets a blast trap. Each one goes on the ground in front of you or just past the fence line, where the walkers come through.",
      "Guns: Other guns lie hidden in buildings across town, and the hiding places shuffle with every new game. Walk over one to pick it up, though it only becomes yours once you carry it home. Press 1 to 5, Q, or the mouse wheel to switch guns. Hold the mouse to draw the bow, then release to shoot. In the cabin's Weapons tab, scrap buys more damage, range, fire rate, and accuracy.",
      "Reading: Walk up to a sign or a patch of graffiti and its words appear; no key is needed. Press E to read a note. Item tags and the stash keys you carry wait in the backpack.",
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
    // Buildings: level6-places1.js and level6-places2.js. Home: level6-home.js.
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
