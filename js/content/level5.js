/* Reading level 5 (5th grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 5 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[5] = {
    level: 5,
    howto: [
      "Months after the Fall, you run the last working van out of a boarded-up house at the south end of town. That house is your home base, and it is the only place where the game saves. Each player has their own labeled save, and there are up to 4 of them. Pick yours on the title screen, and every trip begins and ends at that house. Everything you bring back ends up there, and everything you build starts there.",
      "Home base is cabin defense. You stand in the yard in first person. The cabin is behind you, the van sits in the driveway, and a fence rings the lot. Time runs in phases. During a calm, nothing touches the fence, so go inside to build or climb into the van and leave. Then a wave comes. Sometimes it is a few walkers, sometimes a lot, and sometimes nothing at all. Walkers claw through the fence if you let them. During a wave the cabin door and the van are locked, so you hold the yard with what you have. The fence never fixes itself. Every hole stays open until you repair it, and every open hole is a doorway for the next wave. Stand at the hole and press E, or use the cabin menu. Each hole costs 1 scrap to rebuild. A cracked fence segment can be braced for 1 scrap too. The Walls room makes the fence stronger, and building Walls up rebuilds the whole fence. Later you can craft traps at the workbench and set them in the yard or along the fence line. A walker that steps on one is hurt. The Spike trap needs Walls 2, and the Blast trap needs Walls 3. The game saves when you arrive, after every build, and after every wave. Late in the game, dig a Well for clean water. Then build a Farm for crops and animals, and a Lab that turns herbs and clean water into Medical kits at home. Each outdoor room has its own lot in the yard, marked by a hand-painted sign. Walk up to a sign to read what that room is, what it needs, and why it may still be locked.",
      "Open the map and choose a place. Only a few spots are known at first. Notes reveal the rest a place or two at a time, and the Radio room reveals them faster. Once you pick a destination, the route is drawn across the city and you drive. The road is never empty. Far places and dangerous places carry more walkers, and every day that passes adds a few more. The Power room shows how dangerous each place is before you commit. If you open the map while you are still parked at a place, you can go straight back inside it.",
      "At the door, you read a note before you step inside. It tells you how many walkers wait and where the items are, so read it like a map. Then you go in. Every doorway inside a building is a real door. Press E to open it, and press E again to close it. Walkers cannot open doors, so a closed door buys you a breath when you need one. Walkers come for you, so shoot them or slip around them. Items sit on shelves and floors, and scrap piles pay in scrap. Shelf and floor items come back 3 days after you take them, but cache items never do. Somewhere inside is another note. Reading it is what lets you open the locked cache room, where the best items wait. It also names the next place to try, and that place appears on the map. Every building also hides a stash, a second locked room whose key is hidden in a different building. To find a key, follow the notes. One note tells you where a second note is. The second note says where the key is and which stash it opens. Carry the key to that stash and press E to open it, but stash items never come back once you take them. Keys show in your backpack and on the cabin's stock tab. Walls carry signs and graffiti, and you read them by walking up close. Every item has a tag that you read when you pick it up. The more you can read, the more notes you find in each building. Some of them are wrong or out of date, so read with care. Every note you read goes into your backpack, along with your item tags. The backpack opens at base, on the map, or inside a building. Go back into a building on the same trip, and it is exactly as you left it. Walkers you put down stay down, scrap you took stays taken, and doors stay as you left them. Driving home resets all of that.",
      "Hurt? A Medical kit heals you back to full. The backpack carries up to 3 kits, and you pack them from storage at the cabin. Inside a building you can also use a kit from the van's cargo. Drive home with your cargo. At base, cargo moves into storage, you eat one food, the Garden and the Farm add food, and the day counter rises. Every day you get home, a new page of June's journal waits for you, with a short recap of the trip. Once the Radio room is built, a radio broadcast comes in each day too. The garage repairs the van back to full for scrap: 1 scrap for every 3 health missing, and at least 5. Once the Garage room is built, repairs are free. Repairs never need typing.",
      "Building a room, upgrading the van or the gun, and crafting a trap all happen at the workbench in the garage. Each one is a short typing round. The words to type are shown on the screen, with a timer ticking beside them. Run out of time and you simply try again, because nothing is spent until you finish. The first time, the bench teaches you where to put your fingers on the home row. Every finished round moves you up a typing stage. Single home-row keys come first, then the other rows, then words, phrases, and sentences. If you die on the road, inside a building, or in the yard, the game reloads your last base save. Everything since that save is gone, so every trip is a bet. Make it a smart one.",
    ],
    controls: [
      "Road: Aim with the mouse and hold to fire; A and D, or the arrow keys, slide the van across the lanes.",
      "Inside and in the yard: W A S D move, the mouse looks, and a click fires. Shift makes you run, B opens the backpack, and P or Esc pauses the game.",
      "E does it all: E reads notes and opens and closes doors. It opens a cache once you have read the note that explains how. It opens a stash too, once you carry its key. E leaves a building, enters the cabin, starts the van, and rebuilds a hole in the fence for 1 scrap.",
      "Traps in the yard: T sets a spike trap and R sets a blast trap. Each one goes on the ground in front of you, or just past the fence line where the walkers come through.",
      "Guns: Other guns lie hidden in buildings across town, and the hiding places change every game. Walk over one to pick it up, but it only becomes yours once you bring it home. Press 1 to 5, Q, or the mouse wheel to switch guns. Hold the mouse to draw the bow and release it to shoot. The cabin's Weapons tab turns scrap into more damage, range, fire rate, and accuracy.",
      "Backpack: Every note you have read, kept with where you found it, plus your medical kits. Use a kit to heal back to full.",
      "Reading: Walk up to a sign or a patch of graffiti to read it, and press E to read a note. Item tags and stash keys are kept in the backpack.",
      "Workbench: Building, upgrading, and crafting are short typing rounds. Type what is on the screen before the timer runs out. Running out only means you try again, and nothing is spent until you finish.",
      "Map: Tap a place, then Drive. At the place where you are parked, you can go back inside, and it will be exactly as you left it.",
    ],
    base: {
      intro: "Home base: a boarded-up house, a fence, and the last van in town. It is the only place the game saves, so build here, breathe here, and then go back out.",
      rooms: {
        walls: {
          desc: "Boards, plates, and nails on the house, the fence, and the van. Thicker walls mean the fence holds longer against clawing walkers, the van takes more hits, and so do you on foot. A bare fence has 150 strength. Building Walls up rebuilds the whole fence. Walls 2 unlocks the Spike trap, and Walls 3 unlocks the Blast trap.",
          next: [
            "Fence strength rises from 150 to 240. Van health rises by 20, and your health on foot rises by 20.",
            "Fence strength rises to 360. Van health rises by 40, and your health on foot rises by 40.",
            "Fence strength rises to 520. Van health rises by 60, and your health on foot rises by 60. This level needs an armor plate.",
          ],
        },
        garage: {
          desc: "The shop where the van and the gun get stronger. Its workbench is where you build, upgrade, and craft by typing. A better garage unlocks higher upgrade tiers. Until the Garage room is built, a repair costs 1 scrap for every 3 health missing, and at least 5 scrap. Once it is built, the van is repaired for free each time you come home.",
          next: [
            "Van and gun upgrades up to tier 3. Free van repair at base.",
            "Van and gun upgrades up to tier 4. Free van repair at base.",
            "Van and gun upgrades up to tier 5. Free van repair at base. This level needs gun parts.",
          ],
        },
        power: {
          desc: "Fuel, wire, and a string of lights at first, with a generator added later. Power lets the map show how dangerous each place is. Later it drops supply crates on your drives, and at last it lights the road itself. Night falls on the road on day 6, and every third day after that.",
          next: [
            "The map shows the danger level at every place.",
            "The map shows danger, and you find one supply crate on every drive. This level needs a generator.",
            "The map shows danger, you find two supply crates on every drive, and headlights beat night and fog.",
          ],
        },
        water: {
          desc: "A filter and a tank turn gray water clear. Clean water means you heal while on foot, and more water means faster healing.",
          next: [
            "You slowly heal on foot, at rate 1.",
            "You heal on foot at rate 2.",
            "You heal on foot at rate 3, and you start every building at full health.",
          ],
        },
        garden: {
          desc: "Raised beds of soil and seeds behind the house. The garden grows food. Every trip eats one food, and a trip with no food means a weaker van.",
          next: [
            "Grows 1 food each day.",
            "Grows 2 food each day.",
            "Grows 3 food each day. This level needs a water tank.",
          ],
        },
        radio: {
          desc: "An antenna on the roof and a radio on the kitchen table. Voices from across town tell you where places are, and later what is left in them.",
          next: [
            "Reveals 3 new places on the map.",
            "Reveals every place on the map.",
            "Reveals every place, and shows which places still have items. This level needs a box of books.",
          ],
        },
        medbay: {
          desc: "A room with beds, bandages, and medical kits. Walker hits hurt less, and if you go down inside a building, you can get back up once.",
          next: [
            "Walker hits hurt you 20 percent less on foot.",
            "Hits hurt 20 percent less, and you get one revive per trip if you go down.",
            "Hits hurt 30 percent less, one revive per trip, and the van takes 20 percent less damage.",
          ],
        },
        archive: {
          desc: "Shelves of books and city maps. Read a place's door note, and the map shows what is still there. Later the map marks caches, and at last it shows stock everywhere.",
          next: [
            "Once you have read a place's door note, the map shows what is still there.",
            "The map shows what is left at places whose door note you have read, and it marks which places hold a cache.",
            "The map marks caches and shows what is left at every place, read or not. This level needs city maps.",
          ],
        },
        well: {
          desc: "A hand-dug well beside the cabin. Its water comes up cold and clean from deep underground, so you heal faster while you are on foot. The Farm and the Lab both need the Well before they can be built.",
          next: [
            "Needs the Water room first. Costs Lumber 2, Tool kit 1, and 60 scrap. You heal on foot at rate 2.",
            "Costs Lumber 2, Engine parts 1, Water filter 1, and 100 scrap. You heal on foot at rate 3.",
            "Costs Water tank 1, Engine parts 1, Spool of wire 1, and 150 scrap. You heal on foot at rate 4, and you start every building at full health.",
          ],
        },
        farm: {
          desc: "Farmland next to the yard, crops first and animals after. It grows extra food every day on top of what the Garden gives, so the van almost never has to leave hungry.",
          next: [
            "A crop field of corn and beans. Needs Garden 2 and the Well. Costs Seed packets 2, Bag of soil 2, Lumber 1, and 80 scrap. The farm grows 2 food a day.",
            "A chicken coop. Needs Well 2. Costs Lumber 2, Spool of wire 1, Seed packets 1, and 120 scrap. The farm gives 4 food a day.",
            "A goat pen. Needs Well 3. Costs Lumber 3, Spool of wire 2, Water tank 1, and 180 scrap. The farm gives 6 food a day.",
          ],
        },
        lab: {
          desc: "Medicine made at home. It begins as herb beds and a still, grows into a clean bench, and ends as a powered lab. Every finished kit goes into storage when a day passes.",
          next: [
            "Herb beds and a still. Needs Medbay 1 and the Well. Costs Medical kit 1, Box of books 1, Seed packets 1, and 80 scrap. Makes 1 Medical kit every 2 days.",
            "A clean bench. Needs Well 2. Costs Water filter 1, Box of books 1, Spool of wire 1, and 120 scrap. Makes 1 Medical kit a day.",
            "A powered lab. Needs Medbay 2. Costs Generator 1, Medical kit 2, Box of books 1, and 180 scrap. Makes 2 Medical kits a day.",
          ],
        },
      },
      traps: {
        spike: {
          desc: "A Spike trap, unlocked by Walls 2. It costs Lumber 1, Box of nails 1, and 10 scrap. Press T to set it on the tile in front of you, even across the fence. A walker that steps on it takes 45 damage. It lasts 3 walkers, and then it is spent.",
        },
        blast: {
          desc: "A Blast trap, unlocked by Walls 3. It costs Fuel can 1, Spool of wire 1, and 25 scrap. Press R to set it on the tile in front of you. When a walker steps on it, it goes off, and every walker close to it takes 120 damage. One use, and then it is gone.",
        },
      },
      bench: {
        intro: "This is the garage workbench. Build rooms, upgrade the van and the gun, and craft traps here by typing. Nothing is spent until you finish the round.",
      },
    },
    typing: {
      fingers: [
        "Look at the middle row of letter keys on your keyboard. That row is the home row, and it is where your fingers live between keys. Every finger has a home key, and it returns there after every reach, the way you return to base after every trip.",
        "Rest your left hand on A S D F, one finger per key. Your left pinky sits on A, and your left pointer sits on F. Rest your right hand on J K L and the ; key, which is called the semicolon. Your right pointer takes J, and your right pinky takes the semicolon. Now feel the F key and the J key. Each one has a small raised bump under your fingertip. Those bumps are landmarks, so your pointer fingers can find home without your eyes ever leaving the screen.",
        "Both thumbs rest lightly on the space bar. Tap it with either thumb to put a space between words.",
        "Each finger owns the keys straight above and below its home key. To press one, that finger reaches up or down, taps once, and comes straight back home. Keep your eyes on the screen, not on your hands. Trust the bumps on F and J. Speed comes with practice, but accuracy comes first.",
      ],
      words: [
        "fuel", "door", "road", "yard", "food", "wave", "calm", "hold", "read", "wall",
        "bolt", "trap", "well", "farm", "pack", "note", "trip", "lock", "code", "dark",
        "gate", "roof", "tile", "dock", "kiln", "tape", "save", "wait", "hook", "desk",
        "coop", "type", "goat", "corn", "eggs", "hens", "shed", "mall", "shop", "town",
        "home", "base", "hole", "pump", "tank", "load", "bump", "keys", "step", "dusk",
        "fence", "scrap", "cabin", "radio", "nails", "seeds", "books", "tools", "parts", "spike",
        "blast", "brace", "crate", "store", "truck", "crowd", "night", "still", "bench", "clerk",
        "nurse", "chief", "badge", "latch", "hatch", "river", "ridge", "paint", "armor", "plate",
        "water", "north", "south", "drive", "shoot", "cache", "glass", "panel", "shelf", "aisle",
        "timer", "round", "cargo", "spool", "squad", "chalk", "thumb", "reach", "build", "craft",
        "stage", "siren", "pumps", "beans", "herbs", "goats", "walls", "rooms", "words", "pinky",
        "quiet", "boots", "chain", "walker", "lumber", "filter", "garage", "garden", "repair", "supply",
        "danger", "runner", "medbay", "school", "police", "armory", "cooler", "engine", "office", "window",
        "marker", "screen", "finger", "drawer", "handle", "typing", "phrase", "hazard", "ladder", "boards",
        "planks", "shovel", "bucket", "diesel", "patrol", "sunset", "doctor", "signal", "voices", "static",
        "bridge", "hunger", "ration", "weapon", "pistol", "barrel", "bullet", "reload", "sprint", "crouch",
        "listen", "wrench", "pantry", "silent", "brutes", "storage", "kitchen", "station", "library", "counter",
        "lantern", "battery", "compass", "survive", "sunrise", "morning", "evening", "chicken", "harvest", "bandage",
        "shutter", "padlock", "antenna", "highway", "trigger", "whisper", "segment", "cracked", "phrases", "sawdust",
        "pharmacy", "driveway", "register", "hospital", "medicine", "sidewalk", "keyboard", "backpack", "cupboard", "headlamp",
        "downtown", "firewood", "precinct", "sentence", "tomatoes",
      ],
      phrases: [
        "hold the fence", "read the note", "open the door", "shut the door", "fix the hole", "brace the fence", "set a trap", "spike trap",
        "blast trap", "pack a kit", "use a kit", "dig the well", "feed the hens", "plant the corn", "milk the goat", "brew the medicine",
        "drive home fast", "save the game", "find the key", "take the scrap", "stay calm", "keep low", "walk slowly", "turn left",
        "head east", "go west", "load the van", "fill the tank", "stay put", "watch the dock", "move on", "type faster",
        "home row", "night drive", "calm phase", "big wave", "cold cooler", "back room", "pump house", "kiln shed",
        "red key", "stuck latch", "check the map", "stay quiet", "hold the yard", "clean water", "fresh eggs", "lock the door",
        "grab the fuel", "run for home", "scrap pile", "cache room", "door note", "garage bench", "finish the round", "repair the van",
        "craft a trap", "build a room", "upgrade the gun", "danger level", "supply crate", "goat pen", "chicken coop", "crop field",
        "herb beds", "powered lab", "clean bench", "every finger", "space bar", "home keys", "walkers at the gate", "boards on the wall",
        "key on the hook", "one more trip", "back to base", "lights off at dusk", "the map is torn", "the last van", "fuel in the can", "a calm night",
      ],
      sentences: [
        "Read the door note before you step inside the building.",
        "Press E to open the door, then close it behind you.",
        "Walkers cannot open doors, so a closed door buys you time.",
        "The fence never fixes itself after a wave tears through.",
        "Every hole in the fence costs one scrap to repair.",
        "Set a spike trap along the fence line before dark.",
        "The blast trap goes off once, and then it is gone.",
        "Pack three medical kits before you leave the cabin.",
        "One medical kit heals you all the way back to full.",
        "The well gives cold clean water from deep underground.",
        "The farm grows corn and beans right beside the yard.",
        "Chickens in the coop mean fresh eggs every morning.",
        "The lab turns herbs and books into medicine at home.",
        "Dev headed east to find Ortiz Auto still standing.",
        "Rosa kept the greenhouses alive when the town went dark.",
        "Drive the van home before the light drains from the sky.",
        "The cabin door locks the moment a wave begins.",
        "Hold the yard until the last walker finally drops.",
        "Type the words on the screen before the timer runs out.",
        "Keep your eyes on the screen, not on your hands.",
        "Your fingers rest on the home row between every key.",
        "Nurse Ada stayed behind to keep the hospital lights on.",
        "Walk, do not run, or the mall crowd will chase you.",
        "The Radio room pulls new places out of the static.",
        "Shelf items return three days after you take them.",
        "Scrap piles pay for repairs, traps, and new rooms.",
        "Do not run the saws, or the dock crowd comes.",
        "The garage repairs the van for a handful of scrap.",
        "The game saves only when you are home at the base.",
        "Pick your own labeled save on the title screen.",
        "Stay quiet in the dark halls of the hospital.",
        "Theo keeps the pumps running at the Water Tower.",
        "Chief Dunn left the red key hanging on the board.",
        "Lift the latch while you pull on the cooler door.",
        "The storeroom key hangs on a hook under the counter.",
        "Walkers at the mall move together like one long shadow.",
        "Nothing is spent until you finish the typing round.",
        "Brace a cracked fence segment for a single scrap.",
        "A trip with no food leaves the van weak.",
        "Far places and dangerous places carry more walkers on the road.",
        "The bumps on F and J mark home for your fingers.",
        "Carla warned that the saw noise brings the whole dock crowd.",
        "Every note you read goes straight into your backpack.",
        "Reading the second note is what opens the cache room.",
        "Sergeant Vega locked the armory and left the combination.",
        "The goats in the pen give the most food of all.",
        "Go down on the road, and your last save reloads.",
        "Each finger reaches for a key and then comes home.",
        "Your thumbs rest on the space bar between words.",
        "The librarian stacked unwanted books against the walls.",
      ],
    },
    locations: {
      gasngo: {
        blurb: "A small gas station with fuel cans on the floor and a locked storeroom on the right by the door.",
        door: {
          title: "Ruby's Warning on the Door",
          text: "Ruby here, and I am writing fast. At least two walkers are inside. One stays near the back wall, and one drifts along the pumps side, close to the windows. That count only grows. More come as the days pass, so the longer you wait, the worse this place gets. The fuel cans are on the floor, not on the shelves. Whoever picked the shelves clean never looked down. The storeroom on the right, next to the door, is locked. The clerk kept a note on the counter, and I think it explains the lock. Read it before you waste time on that door.",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Note at the Register",
            text: "This is Dev. I was the clerk here, which means I know every hiding place in this building. The storeroom key hangs on the hook under the counter, right where my knees used to bump it. Reach under, feel for the hook, and take it. With that key in your hand, you can open the storeroom now. There is more fuel back there, and a spool of wire that the shelves never showed anyone.\n\nI am leaving for Ortiz Auto on the east side of town. The shop is still standing, and a standing shop means a working lift and a chance at parts. If you need seeds and soil, go the other way. Rosa is at Greenhouse Row, west past this gas station. She kept the greenhouses alive when the town went dark, and she will trade with anyone honest. Tell her Dev sent you. Lock the storeroom behind you if you can.",
          },
        },
      },
      grocery: {
        blurb: "A corner store with food left on the floor and a cold, locked walk-in cooler.",
        door: {
          title: "Doc Lin on the Glass",
          text: "Doc Lin wrote this in marker, so read it before the rain does. The front shelves are mostly picked over, stripped like bones. The food that is left is on the floor by the far aisle, where it fell when the first crowds pushed through. Walkers get in through the loading door at the back, and that door never shuts right. Count on at least two inside at any time. The walk-in cooler still stays cold, and it is locked. The manager's note is on the counter at the back wall. Read it, because the cooler is the only reason to come here.",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Trick",
            text: "I am Hana, the store manager, and I locked the cooler on purpose. The latch is stubborn, not broken. Lift it while you pull on the door, and the bar slides out of its catch like a key turning. Do both at once or it will not budge. That is all it takes, so you can open the cooler now. Inside there is food, and there is one medical kit on the top shelf. The cold has kept everything good, which is more than I can say for the rest of this store.\n\nWhen the kit runs out, you will need more medicine. Try Mile 9 Pharmacy, west of here. Last week it still had medicine on its shelves, and Mr. Okafor kept it stocked right up to the end. Take what you need and leave the rest. Someone else will stand at this counter after you, hungry and hoping.",
          },
        },
      },
      hardware: {
        blurb: "A big hardware store with nails, tools, lumber, and a locked back room.",
        door: {
          title: "Mr. Reyes Nailed This Up",
          text: "Mr. Reyes, the owner. I built this store, so I know what I am saying. At least three walkers are inside. Two drift through the middle aisles, and one stays near the front door, so you meet it first. Nails are on the shelf near the front. Tools are in the middle aisle, right where those two walkers roam, and lumber is at the back. Get the easy things first. The back room is locked, and the lock is not the problem. My note is by the paint shelves, and it explains the door.",
        },
        notes: {
          "hardware-paint": {
            title: "The Sticking Door",
            text: "Mr. Reyes again. The back room door sticks, and most people give up after two shoves. The frame swelled when the roof leaked, so the door sits low and drags. The trick is to lift the handle and push at the same time. Lift it high, lean in, and the door pops free like a cork. That means you can open the back room now. Inside I left a water filter, a second tool kit, and a stack of lumber. I meant to come back for it and never did.\n\nIf you need more wood than that, go to Ridge Lumber on the east ridge. There are stacks of lumber in the yard, enough to board up a whole street. If you need more filters, try the Water Tower on the west side. There are filters in its pump house, and Theo keeps the pumps running. Tell him I am sorry about the bill I never paid.",
          },
        },
      },
      pharmacy: {
        blurb: "A small pharmacy with medical kits on the low shelves and a locked cabinet room.",
        door: {
          title: "Mr. Okafor's Door Note",
          text: "Mr. Okafor, the pharmacist. Medical kits are on the low shelves near the middle of the store. Look down, not up, because the crowds grabbed what was at eye level and missed the rest. At least three walkers are inside, and most of them stay near the back of the store. They are slow until they see you. The cabinet room is locked, and the lock takes a code. The code is written on my note at the counter. Read it first, or you will stand at that door for nothing.",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Room Code",
            text: "Mr. Okafor here. The cabinet room has a keypad on the door, and I am trusting you with the code. It is 4471. Press the numbers slowly, wait for the click, and the lock lets go. You can open the cabinet room now. Inside are two more medical kits and a water filter, because clean water matters as much as medicine. I left them for whoever came next, and that is you.\n\nIf you need more than that, you will have to go north. St. Anne Annex is the hospital in the north hills. It still has medicine, and it has a generator that could light a whole base. But hear me on this. It is the most dangerous place in town, and the dark halls hide more than they show. Go in daylight, go rested, and go with a plan. Medicine does no good to someone who never makes it home.",
          },
        },
      },
      autoshop: {
        blurb: "A repair shop with engine parts on the benches and a generator down in the service pit.",
        door: {
          title: "Dev's Chalk Note",
          text: "Dev here, from the Gas-N-Go, and I made it this far. Engine parts are on the workbenches. One bench is on the left wall, and one is in the back right corner, past the lift. At least three walkers are inside. One wanders near the crates in the back left corner, so do not let it pin you back there. The service pit is covered by a locked hatch. Mr. Ortiz left a note by the office, and the hatch will not move until you read it.",
        },
        notes: {
          "autoshop-office": {
            title: "Mr. Ortiz on the Hatch",
            text: "This is Mr. Ortiz, and this is my shop. The hatch over the service pit looks welded shut, but it is only stubborn. The bolt comes out if you twist it to the left. Most people turn it right, feel it bind, and give up. Turn it left, hard, and it slides free. You can open the service pit now. My generator is down in the pit where the crowds never thought to look. There are spare parts with it, and a fuel can to get it running.\n\nIf you need wire or radio parts, Signal Electronics downtown still has both on its shelves. But it sits near the walker crowds, and they drift that way like water finding low ground. Go in fast and come out faster. Do not stay past dark, because downtown after dark belongs to them.",
          },
        },
      },
      radioshack: {
        blurb: "An electronics store with spools of wire, sitting close to the walker crowds downtown.",
        door: {
          title: "Jo's Sign in the Window",
          text: "Jo wrote this, and Jo does not scare easy. Spools of wire are on the shelves in the middle rows, where the store kept the boring stuff nobody stole. At least four walkers are inside. One stays near the counter on the back wall. It will hear the door open, so be ready before you cross the floor. The others drift between the rows. The manager's office is locked. The manager left a note on the counter at the back, and the office will not open until you read it. The best parts in this store are behind that door.",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Key Under the Register",
            text: "I am Priya, the manager. The office key is taped under the register, pressed flat against the metal so no one would feel it by accident. Reach under the counter and run your fingers along the back edge. Peel it off, and you can open the manager's office now. Inside are two boxes of radio parts and more wire than you can carry. Take the radio parts first, because they are the hardest thing in town to find.\n\nTwo places are north of downtown, and both are worth the drive. The 4th Precinct is the police station, and it has gun parts. Lincoln Middle School has books, boxes and boxes of them. The station is the harder of the two, and the walkers there wear badges. Do not go there tired, and do not go there without a plan for getting out.",
          },
        },
      },
      garden: {
        blurb: "A row of greenhouses with seeds, soil, and a locked potting shed.",
        door: {
          title: "Rosa Painted the Gate",
          text: "Rosa here. I ran this greenhouse before the Fall, and I still think of it as mine. Seed packets are on the bench near the front, sorted and labeled. Soil bags are stacked in the middle of the floor like sandbags. At least three walkers are inside, and one stays near the back where the glass is broken. The others move with the sun. The potting shed is locked, and it holds the best of what I saved. My note is on the potting bench at the back, on the right. Read it, and the shed is yours.",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Watering Can",
            text: "Rosa again. The potting shed has a padlock, and I hid the key where a thief would never think to look. It is in the watering can on the bench. Tip the can, let the water run out, and the key slides into your hand. With it, you can open the potting shed now. There are more seeds inside, and there is a water tank. Keep the seeds dry, because wet seeds are just dirt that cost you a trip.\n\nIf you need tools, or a second tank, go north. Station 12 is the fire station north of here. Its equipment bay has tools and water tanks, enough to set up a real garden. Chief Dunn ran that station, and I believe he is still there. Firefighters do not leave their post. Tell him Rosa sent you, and tell him the tomatoes made it.",
          },
        },
      },
      police: {
        blurb: "The 4th Precinct: gun parts, an armor plate, and a locked armory.",
        door: {
          title: "Sergeant Vega's Notice",
          text: "Sergeant Vega. Gun parts are in the squad room, where my people left them. An armor plate is in the garage room on the right, leaning against a cruiser. At least five walkers are inside, and one of them is big. The big one waits in the garage room, right next to that plate, so the plate costs more than it looks. The armory is locked, and I locked it myself. My note at the front desk has the combination. Read it first, because the armory door does not care how strong you are.",
        },
        notes: {
          "police-desk": {
            title: "The Armory Combination",
            text: "Sergeant Vega again. The armory has a dial lock, and the combination is 19-4-33. Turn it slow: left to 19, right to 4, left to 33. Rush it and the dial slips, and you start over. Do it right, and you can open the armory now. There are gun parts inside, and there is an armor plate. Take only what you can carry, and leave the rest for the next one who reads this.\n\nOne more thing, since you can read. The Public Library is north of downtown. It has books in its archive room, more than anyone ever checked out. The librarian stayed when everyone else ran. Her name is Mrs. Greer, and she knows that building the way I know this one. If you get there, help her if you can. People who stay are the ones worth helping.",
          },
        },
      },
      school: {
        blurb: "A middle school with boxes of books in the classrooms and a locked library closet.",
        door: {
          title: "Max and Mia Were Here",
          text: "Max and Mia wrote this, and we are still here. Boxes of books are in the back right classroom and in the bottom left room. At least four walkers are inside, and one walks the hallway like a slow guard. It goes back and forth, so time your move and cross behind it. The library closet is locked. The key is in the teacher's note, and that note is in the back left classroom. Read it and the closet opens. We took one box and ran. There are plenty left for you.",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk",
            text: "I am Ms. Adler, and I taught in this room. The library closet key is in the top desk drawer. The drawer sticks, so pull it all the way out and look in the back corner. With that key, you can open the closet now. It holds boxes of books and a folder of city maps. Right now the maps may be worth more than the books, but the books will outlast all of us.\n\nNorthgate Mall is in the north. It has food, medicine, and wire, everything a base needs under one roof. But the crowds there are the worst in town. They fill the whole floor like a tide that never goes out. Go only if you must, and never alone if you can help it. I told my students the same thing about the hallways. Stay together, stay quiet, and keep moving.",
          },
        },
      },
      firehouse: {
        blurb: "Station 12, a fire station with tools, water tanks, and a locked equipment bay.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Chief Dunn. A tool kit is in the back office, through the door behind the desk. A water tank is in the truck bay on the right, strapped to the wall. At least four walkers are inside, and one is in the truck bay. It stands between you and that tank like a bad dog on a chain. The others wander the back halls. The equipment bay is locked, and I hold the only way in. My note is on the front desk. Read it and you will know which key.",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "Chief Dunn again. Look at the key board behind this desk. There are a dozen keys on it, and only one matters. Take the red key, and only the red one. It opens the equipment bay lock, so you can open the equipment bay now. There is a water tank in there, plus lumber and a set of tools. Load the tank first, because it is the heaviest and you will not want to carry it last.\n\nIf you need water filters, the tank alone will not help you. Go to the Water Tower on the west side. The filters are in its pump house. Theo looks after the pumps, and he kept them running when the rest of us gave up on this town. He is the reason the taps still work. Thank him for that, and then get back on the road before dark.",
          },
        },
      },
      hospital: {
        blurb: "St. Anne Annex, the hospital in the north hills, with medicine, a generator, and the worst walkers in town.",
        door: {
          title: "Doc Lin on the Ambulance",
          text: "Doc Lin. I worked here, so trust the map I am giving you. Medical kits are in the rooms along the top hall, and there are more in the bottom left room. The generator is in the bottom right room, and it is heavy. At least six walkers are inside, and they stand in the dark rooms like coats on hooks. They do not come out until you are close. The pharmacy stock room is locked. The nurse's note is in the top hall, and without it the stock room stays shut.",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada Stayed",
            text: "I am Nurse Ada. I stayed when the others left, because someone had to keep the lights on. The stock room door needs a badge to open, and the reader still works. My badge is in the drawer under this station, on top of the charts. Take it, hold it to the reader, and you can open the stock room now. There are three medical kits inside. Use them well, because they are the last kits in this building, and I counted twice.\n\nStay quiet in here. The walkers in this building follow sound more than light, and the halls carry sound like pipes carry water. Do not run, and do not shout, no matter what you see. Walk soft and keep your light low. They may never turn your way. I have walked these halls for weeks that way, and I am still writing.",
          },
        },
      },
      watertower: {
        blurb: "The pump building under the Water Tower, stocked with water filters and a locked pump house.",
        door: {
          title: "Theo's Fence Note",
          text: "Theo here. I tend the pumps, and I still check them when the yard is clear. Water filters are on the floor by the crates, so look low and watch your step. At least four walkers are inside the pump building. They do not leave, because nothing in there ever draws them out. You will have to deal with them. The pump house is locked, and the key is not on me. My note is on the control panel inside the building. Read it, and you will know where I hid the key.",
        },
        notes: {
          "watertower-panel": {
            title: "Theo's Breaker Box",
            text: "Theo again. The pump house key is in the breaker box, the gray metal box on the wall to your left. It is not locked, because nobody steals from a breaker box. Open it, and the key hangs on a nail inside, next to the main switch. With it, you can open the pump house now. There are filters in there, a water tank, and wire. Take what you need and be quick about it, because the walkers hear every door.\n\nOne more thing, and it matters more than the filters. If you need medicine, St. Anne Annex is the hospital, north along the river road. It still has medicine, more than any place left standing. But it is the most dangerous place in town. The halls are dark, and the walkers there wait in the rooms like a held breath. Go in daylight, and do not go alone if you can help it. The river road is quiet. The hospital is not.",
          },
        },
      },
      lumberyard: {
        blurb: "Ridge Lumber on the east ridge, stacked with wood and guarded by a locked kiln shed.",
        door: {
          title: "Ruby's Spray Paint",
          text: "Ruby again, and this one I painted big so you cannot miss it. Lumber is stacked in the racks, both in the middle of the yard and at the back. At least five walkers are inside, and they gather by the loading dock like they are waiting for a truck. Stay away from the dock if you can, and take the wood from the far racks. The kiln shed is locked. The yard boss left a note on the paint rack, and it has what you need. Read it before you touch that shed.",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Clipboard",
            text: "Carla here, the yard boss. The kiln shed has a padlock with a dial, and the code is 2218. Spin it to those numbers, and the lock drops open in your hand. You can open the kiln shed now. The lumber in there is dry, and dry wood is worth hauling because it does not rot on you. There are nails in the shed too, boxed and ready.\n\nDo not run the saws. Not even once, not even to cut a board in half. The noise brings the whole dock crowd, and they come fast, faster than you would think from how they stand. One scream from a blade and the yard fills up. Carry what you need and go. The quiet is the only fence this place has left, and it is yours as long as you keep it.",
          },
        },
      },
      mall: {
        blurb: "Northgate Mall in the north, full of goods and the biggest walker crowd in town.",
        door: {
          title: "Jo's Mall Door Note",
          text: "Jo here, and this is the big one. Food, medicine, and wire are spread across the store floor, so you will cover a lot of ground. At least six walkers are inside, and they move in a group. Where one goes, they all go, like a shadow that follows one body. The security office is locked. The guard's note is by the paint display, and it explains the lock. Find the note, keep the group on the far side, and do not get caught between them and a wall.",
        },
        notes: {
          "mall-guard": {
            title: "Luis Left the Code",
            text: "My name is Luis, and I worked security at this mall. The office has a keypad by the door, and the code is 0912. Type it in, and the lock lets go. You can open the security office now. There are gun parts inside, and there are radio parts and a tool kit. I locked them up on the last day, when I understood that nobody was coming to relieve me.\n\nThe walkers here move as one group, and I have watched them for a long time. They come running at anyone who runs, and they do not get tired. So do not run, no matter how close they get. Walk, and most of them stay put. Running is a fire alarm to them. Walking is just another body in the crowd. It feels wrong every single time, like holding still while a wave comes in, but it works. I am still here because of it.",
          },
        },
      },
      library: {
        blurb: "The Public Library north of downtown, with books, city maps, and a locked archive room.",
        door: {
          title: "Mrs. Greer's Book Drop",
          text: "Mrs. Greer, the librarian. Boxes of books are in the reading rooms on both sides of the building. At least five walkers are inside, and two are in the main hall. You will meet those two first, because every door leads through that hall. The others keep to the corners. The archive room is locked, and I keep it that way on purpose. My note is in the back left reading room, on the reference desk. Read it, and the archive opens to you. Please be quiet in here. It is still a library.",
        },
        notes: {
          "library-desk": {
            title: "The Key in the Dictionary",
            text: "Mrs. Greer again. The archive key is inside the big dictionary on this desk. Open the book to the middle and find the hole cut in the pages. The key sits in that hole, flat and cold. With it, you can open the archive room now. The archive has books, and it has a folder of city maps. Those maps show every street in this town, including the ones the walkers have not found yet.\n\nReading saved this building. Look at the walls on your way out. They are stacked with the books nobody wanted, the ones that sat for years without a single checkout. Now they stop walkers. Books are heavy, and it turned out that mattered more than anything inside them. Take what you came for, and if you have a moment, put something back on a shelf. It helps me to see the place still works.",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
