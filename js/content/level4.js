/* Reading level 4 (4th grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 4 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[4] = {
    level: 4,
    howto: [
      "Your home base is a boarded-up house at the south end of town. A fence rings the yard, and your van waits in the driveway. Each day you drive out for supplies, and each night you haul them home. Every building holds walkers, and every building holds notes from the people who came before you. Read them, and you find more and lose less. Nobody tests you on them; they are simply useful. The base is the only place the game saves. Each player has their own labeled save, and the game holds up to 4 of them. Pick yours on the title screen, and every trip starts and ends at home.",
      "At home you stand in the yard, first person, with the cabin behind you. Everything you build shows up out here. Each room gets its own plot inside the fence. At every level, its building looks bigger and stronger. Time in the yard runs in phases. In a calm phase nothing is at the fence. Go inside to build, or leave in the van. Then a wave comes. Sometimes it is a few walkers, sometimes a lot, and sometimes none at all. Walkers claw through the fence, and during a wave the cabin door and the van are locked. You hold the yard. The fence does not fix itself. Every hole stays open until you repair it, and each hole costs 1 scrap. Stand at the hole and press E, or use the cabin menu. A cracked segment can be braced for 1 scrap as well. The Walls room changes the fence itself, and building Walls up rebuilds the whole fence, tougher than before. Later you can craft traps at the workbench. Set them in the yard or along the fence line. A walker that steps on one is hurt. The Spike trap needs Walls 2, and the Blast trap needs Walls 3. The game saves when you arrive, after every build, and after every wave.",
      "Open the city map and choose where to go. Only a few places are known at first; notes and the Radio room reveal the rest. Plan the trip on the map, because it shows the route and lists the way there in words. Out on the road, nothing shows you the route. Before each junction or turn, a sign tells you where each lane goes. The van drives in the left of your two lanes. That lane always goes straight past side streets and parking lots. To turn into a lot on the right, move into the right lane. For a lot on the left, move into the extra turn lane that opens on the far left. Junctions work differently. Where roads meet, each road out gets its own lane, in the same order as the sign's arrows. Your own lane may be the one that turns. Each lane has its arrow painted on it. Find your way on the sign, and be in the lane with that arrow before the white stop line. Change lanes with A and D, the arrow keys, or the side buttons. Side streets are dead ends, so stay out of them. At the end of the trip, turn into your destination's parking lot. Take a wrong turn or miss the lot, and you go back to where you started. You keep any damage, scrap, and kills from that try. A small minimap shows where you are and flags where you are going. Walkers roam the road, too. Distant and dangerous places have more of them, and every day adds more. Power in the base shows how dangerous each place is before you commit. Still parked at a place? Open the map, and you can go straight back inside.",
      "At the door you read a note before you step inside. It tells you how many walkers wait in there and where the items sit. The buildings are big, with rooms, halls, and dead ends. Each corner has a landmark to steer by, such as a fire truck or a giant globe. The notes name these landmarks. Press M for a map of the parts you have already seen. Every doorway inside is a real door. Press E to open it, and press E again to close it. Walkers cannot open doors, so a closed door keeps them out. Shoot the walkers or slip past them. Gather items from shelves and floors, and grab scrap wherever it is piled. Shelf items come back three days after you take them, but cache items never do. Somewhere inside is a second note. It explains how to open the locked cache room, where the best items are kept. It tells you the way to that door, too. Reading that note is what lets you open it. Often the note names another place worth trying, and that place appears on your map. Every note you read is kept in your backpack. Open the backpack at base, on the map, or inside a building; inside, it pauses the action. Go back into a building on the same trip, and it is exactly as you left it. Driving home resets it.",
      "Hurt? Use a Medical kit, and it heals you back to full health. The backpack carries up to 3 kits, and you pack them from storage at the cabin. Inside a building you can also use a kit from the van's cargo. Drive home with your cargo, or chain a few more stops first. At base, cargo moves into storage and you eat one food. The Garden and the Farm add food, the day counter climbs, and the game saves. The garage repairs the van back to full health for scrap. It costs 1 scrap for every 3 health missing, and at least 5 scrap. Once the Garage room is built, repairs are free. Repairs need no typing. Late in the game, dig a Well for clean water. Then build a Farm for crops and animals, and a Lab that makes Medical kits at home.",
      "You build rooms, upgrade the van and gun, and craft traps at the garage workbench. Each one is a short typing round. The words to type are shown on the screen, with a timer. Run out of time and you simply try again; nothing is spent until you finish. The first time, the bench teaches you where your fingers go on the home row. Every finished round moves you to the next typing stage. Single home-row keys come first, then the other rows, then words, phrases, and sentences. You can die on the road, inside a building, or in the yard. If you do, the game reloads your last base save, and everything since that save is lost. That is the tension, so plan every trip with care.",
    ],
    controls: [
      "Road: Aim with the mouse and hold to fire. A and D, the arrow keys, or the side buttons change lanes. Your left lane goes straight past side streets and lots. For a lot, the right lane turns right, and a turn lane on the far left turns left. Where roads meet, each road has its own lane and yours may turn, so match the sign's arrow. Be in that lane before the white stop line.",
      "Inside and in the yard: W A S D move, the mouse looks, and a click fires. Shift makes you run, B opens the backpack, and P or Esc pauses the game. Inside a building, M opens a map of the parts you have seen.",
      "E does it all: E reads notes and opens and closes doors. It opens a cache once you have read the note that explains it. E also leaves a building, enters the cabin, and starts the van. It rebuilds a hole in the fence for 1 scrap.",
      "Traps in the yard: T sets a spike trap, and R sets a blast trap. Each one goes on the ground in front of you, or just past the fence line.",
      "Backpack: Every note you have read, kept with where you found it, plus your medical kits. Use a kit to heal back to full.",
      "Workbench: Building, upgrading, and crafting are short typing rounds. Type what is on the screen before the timer runs out; running out only means you try again.",
      "Map: Tap a place, and the map shows the route and the way there in words. Then tap Drive. At the place where you are parked, you can go back inside.",
    ],
    base: {
      intro: "Home base: the one place the game saves. Build the rooms, patch the van, and get back out before the next wave.",
      rooms: {
        walls: {
          desc: "Boards, braces, and steel plates on the house, the fence, and the van. Thicker walls mean a tougher fence, more van health, and more health for you on foot. A stronger fence holds longer when a wave hits the yard. Building Walls up rebuilds the whole fence. Walls 2 unlocks the Spike trap, and Walls 3 unlocks the Blast trap.",
          next: [
            "Van health up by 20, and your health on foot up by 20. Fence strength rises from 150 to 240.",
            "Van health up by 40, and your health on foot up by 40. Fence strength rises to 360.",
            "Van health up by 60, and your health on foot up by 60. Fence strength rises to 520. This level needs an armor plate.",
          ],
        },
        garage: {
          desc: "A workshop for the van and the gun. Its workbench is where you build, upgrade, and craft by typing. A better garage unlocks higher upgrade tiers, and it repairs the van for free whenever you are home. Until then, a repair costs 1 scrap for every 3 health missing, and at least 5 scrap.",
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
        well: {
          desc: "A hand-dug well beside the cabin. It gives clean water from deep underground, so you heal faster while you are on foot. The Farm and the Lab both need the Well before they can be built.",
          next: [
            "Needs the Water room first. Costs Lumber 2, Tool kit 1, and 60 scrap. You heal on foot at rate 2.",
            "Costs Lumber 2, Engine parts 1, Water filter 1, and 100 scrap. You heal on foot at rate 3.",
            "Costs Water tank 1, Engine parts 1, Spool of wire 1, and 150 scrap. You heal on foot at rate 4, and you start every building at full health.",
          ],
        },
        farm: {
          desc: "Farmland beside the yard, with crops first and animals later. The farm grows extra food every day, on top of what the Garden gives you.",
          next: [
            "A crop field of corn and beans. Needs Garden 2 and the Well. Costs Seed packets 2, Bag of soil 2, Lumber 1, and 80 scrap. The farm grows 2 food a day.",
            "A chicken coop. Needs Well 2. Costs Lumber 2, Spool of wire 1, Seed packets 1, and 120 scrap. The farm gives 4 food a day.",
            "A goat pen. Needs Well 3. Costs Lumber 3, Spool of wire 2, Water tank 1, and 180 scrap. The farm gives 6 food a day.",
          ],
        },
        lab: {
          desc: "Medicine made at home. It starts with herb beds and a still, a kind of brewing pot. Next comes a clean bench, and at last a powered lab. Finished kits go into storage when a day passes.",
          next: [
            "Herb beds and a still. Needs Medbay 1 and the Well. Costs Medical kit 1, Box of books 1, Seed packets 1, and 80 scrap. Makes 1 Medical kit every 2 days.",
            "A clean bench. Needs Well 2. Costs Water filter 1, Box of books 1, Spool of wire 1, and 120 scrap. Makes 1 Medical kit a day.",
            "A powered lab. Needs Medbay 2. Costs Generator 1, Medical kit 2, Box of books 1, and 180 scrap. Makes 2 Medical kits a day.",
          ],
        },
      },
      traps: {
        spike: {
          desc: "A Spike trap, unlocked by Walls 2. It costs Lumber 1, Box of nails 1, and 10 scrap. Press T to set it on the ground in front of you, or just past the fence. A walker that steps on it takes 45 damage. It hurts 3 walkers, and then it is spent.",
        },
        blast: {
          desc: "A Blast trap, unlocked by Walls 3. It costs Fuel can 1, Spool of wire 1, and 25 scrap. Press R to set it on the ground in front of you, or just past the fence. When a walker steps on it, it goes off. Every walker close to it takes 120 damage. One use, and then it is gone.",
        },
      },
      bench: {
        intro: "This is the garage workbench. Build rooms, upgrade the van and the gun, and craft traps here by typing. Nothing is spent until you finish the round.",
      },
    },
    typing: {
      fingers: [
        "Look at the middle row of letter keys on your keyboard. That row is called the home row, and your fingers rest there between keystrokes. Every finger has a home key, and it returns there after every reach.",
        "Rest your left hand on A S D F, one finger on each key. Rest your right hand on J K L and the ; key, which is the semicolon. Your right pinky takes the semicolon. Now feel the F key and the J key. Each one has a small raised bump. Those bumps tell your pointer fingers where home is, so you never have to look down.",
        "Both thumbs rest lightly on the space bar. Tap it with either thumb to put a space between words.",
        "Each finger owns the keys above and below its home key. It reaches up or down to press one, then comes straight back home. Keep your eyes on the screen, not on your hands. Trust the bumps on F and J, and the words come faster with every round.",
      ],
      words: [
        "fence", "scrap", "walker", "note", "cabin", "fuel", "door", "radio", "wire", "nails",
        "lumber", "seeds", "soil", "meds", "books", "food", "well", "farm", "yard", "wave",
        "calm", "hold", "walk", "pump", "tank", "trap", "hole", "home", "base", "shed",
        "road", "hills", "town", "mall", "shop", "lock", "code", "dark", "bolt", "goat",
        "hens", "corn", "beans", "herbs", "tools", "parts", "pack", "read", "sign", "gate",
        "wall", "roof", "step", "tile", "dock", "kiln", "tape", "save", "wait", "spike",
        "blast", "brace", "crate", "store", "truck", "crowd", "dusk", "night", "still", "bench",
        "clerk", "nurse", "chief", "badge", "latch", "hatch", "river", "ridge", "paint", "armor",
        "plate", "water", "north", "south", "east", "west", "drive", "shoot", "cache", "glass",
        "panel", "shelf", "aisle", "desk", "hook", "eggs", "coop", "type", "timer", "round",
        "trip", "load", "cargo", "filter", "garage", "garden", "repair", "supply", "danger", "runner",
        "brute", "medbay", "school", "police", "armory", "cooler", "engine", "spool", "squad", "office",
        "window", "marker", "chalk", "screen", "finger", "thumb", "bump", "reach", "drawer", "handle",
        "rooms", "build", "craft", "tier", "typing", "phrase", "words", "stage", "siren", "pumps",
        "paper", "pencil", "hazard", "storage", "kitchen", "station", "library", "counter", "lantern", "battery",
        "ladder", "boards", "planks", "compass", "shovel", "bucket", "diesel", "patrol", "survive", "sunset",
        "sunrise", "morning", "evening", "chicken", "harvest", "bandage", "doctor", "shutter", "padlock", "keypad",
        "crates", "signal", "antenna", "voices", "static", "tower", "bridge", "highway", "carry", "hunger",
        "ration", "weapon", "pistol", "rifle", "barrel", "bullet", "reload", "trigger", "scope", "sprint",
        "crouch", "dodge", "sneak", "quiet", "silent", "noise", "sound", "listen", "whisper", "wrench",
        "lane", "robot", "globe", "minimap",
      ],
      phrases: [
        "hold the fence", "read the note", "open the door", "shut the door", "fix the hole", "brace the fence", "set a trap", "spike trap",
        "blast trap", "pack a kit", "use a kit", "dig the well", "feed the hens", "plant the corn", "milk the goat", "brew the meds",
        "drive home", "save the game", "find the key", "take the scrap", "stay calm", "keep low", "walk slowly", "turn left",
        "head east", "go west", "load the van", "fill the tank", "stay put", "watch out", "move on", "type faster",
        "home row", "night drive", "calm phase", "big wave", "cold cooler", "back room", "pump house", "kiln shed",
        "red key", "stuck latch", "check the map", "stay quiet", "hold the yard", "clean water", "fresh eggs", "lock the door",
        "grab the fuel", "run for home", "scrap pile", "cache room", "door note", "garage bench", "finish the round", "repair the van",
        "craft a trap", "build a room", "upgrade the gun", "danger level", "supply crate", "goat pen", "chicken coop", "crop field",
        "herb beds", "powered lab", "clean bench", "every finger", "space bar", "home keys",
        "read the sign", "change lanes", "left lane", "dead end",
      ],
      sentences: [
        "Read the door note before you step inside.",
        "Press E to open the door, then close it.",
        "Walkers cannot open the doors inside a building.",
        "The fence does not repair itself after a wave.",
        "Every hole in the fence costs one scrap.",
        "Set a spike trap along the fence line.",
        "The blast trap goes off only once.",
        "Pack three kits before you leave the cabin.",
        "One medical kit heals you back to full.",
        "The well gives clean water from deep underground.",
        "The farm grows corn and beans beside the yard.",
        "The chickens in the coop lay eggs every day.",
        "The lab makes medicine right at home base.",
        "Dev headed east to find Ortiz Auto.",
        "Rosa left seeds and soil at Greenhouse Row.",
        "Drive the van home before the light fades.",
        "The cabin door locks the moment a wave begins.",
        "Hold the yard until the wave finally ends.",
        "Type the words you see on the screen.",
        "Keep your eyes on the screen, not your hands.",
        "Your fingers rest on the home row between keys.",
        "Nurse Ada stayed behind when the others left.",
        "Walk, do not run, the mall guard wrote.",
        "The Radio room finds new places across town.",
        "Shelf items come back three days after you take them.",
        "Scrap piles pay for repairs and traps.",
        "Read the sign and get in your lane.",
        "Do not run the saws, Carla warned.",
        "The garage repairs the van for a little scrap.",
        "The game saves only when you are home.",
        "Pick your own save on the title screen.",
        "Stay quiet in the dark halls of the hospital.",
        "Theo keeps the pumps running at the Water Tower.",
        "Chief Dunn left the red key on the board.",
        "Lift the latch while you pull the cooler door.",
        "The storeroom key hangs on a hook under the counter.",
        "Walkers at the mall move together as one group.",
        "Nothing is spent until you finish the typing round.",
        "Brace a cracked fence segment for one scrap.",
        "Doors stay exactly as you left them inside.",
        "The goat pen needs the Well at level three.",
        "Night drives start on day six, then every third day.",
        "Each finger reaches out and comes straight back home.",
        "Power shows how dangerous each place is on the map.",
      ],
    },
    locations: {
      gasngo: {
        blurb: "A gas station with a garage, fuel cans on the floor, and a locked storeroom.",
        door: {
          title: "Ruby's Warning on the Door",
          text: "Ruby here, and I will keep this short. At least three walkers are inside. One stands in the garage by the car lift. More drift in as the days pass, so do not put this off. The fuel cans are on the floor, not on the shelves. One is by the slushie machine, in the front corner on your left. The other is in the garage on the right, by the tire tower. The storeroom is locked. The clerk left a note on the counter by the front door. Read it before you try that door.",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Note at the Register",
            text: "This is Dev. I was the clerk here, and I worked this register until the last day. The storeroom key hangs on the hook under the counter. Crouch and feel along the underside until you find it. With that key, you can open the storeroom now. There is more fuel in there, and a spool of wire I never got around to selling.\n\nThe storeroom is off the back hall. The ice machine sits at one end of that hall. Walk to the far end, away from it. The storeroom is the last door before the garage.\n\nI am heading to Ortiz Auto on the east side of town. The shop is still standing, and Mr. Ortiz knows engines better than anyone. Rosa is at Greenhouse Row, west past this gas station. She has seeds and soil, and she trades fairly. Tell her Dev sent you.",
          },
        },
      },
      grocery: {
        blurb: "A corner store with leftover food on the floor and a cold, locked walk-in cooler.",
        door: {
          title: "Doc Lin on the Glass",
          text: "Doc Lin wrote this. The shelves are picked over, so do not waste time on them. The food that is left sits on the floor. Look by the fish tank on the left wall, and by the freezers on the right. Walkers get in through the loading door at the back, by the forklift, and they keep on coming. Count on at least three inside. The walk-in cooler is locked. The manager's note is in the office, back left. Read it before you fight with the cooler door.",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Trick",
            text: "I am Hana, the store manager. The cooler latch is stubborn, but it is not broken. Lift the latch while you pull on the door, and it swings open. So you can open the cooler now. Inside there is food, and there is one medical kit. The cold has kept everything in good shape, so take it all.\n\nYou will not have to look far. Step out of this office into the back hall and head toward the forklift. The cooler is the very next door along the hall, with COOLER on its sign.\n\nWhen you need medicine, try Mile 9 Pharmacy. It is west of here, past the gas station. Last week it still had medicine on its shelves. Mr. Okafor runs it, and he is careful about keeping it stocked. Take what you need, and leave the rest for whoever comes next.",
          },
        },
      },
      hardware: {
        blurb: "A big hardware store with nails, tools, lumber, and a locked back room.",
        door: {
          title: "Mr. Reyes Nailed This Up",
          text: "Mr. Reyes, the owner. At least five walkers are inside, and two of them roam the middle aisles. Move with purpose and keep your eyes up. Nails are by the toilet display, in the front corner on your left. Tools are in the middle aisle. Lumber is in the lumber racks at the back of the store. Everything you need is here if you stay calm. The back room is locked. My note is by the paint mixer, back left, and it explains the door.",
        },
        notes: {
          "hardware-paint": {
            title: "The Sticking Door",
            text: "Mr. Reyes again. The back room door sticks, and most people give up after one shove. The trick is to lift the handle and push at the same time. Do that, and you can open the back room now. Inside I left a water filter, a second tool kit, and a stack of lumber. I hid them there on purpose, so use them well.\n\nGetting there is simple. Take the side door here, by the paint mixer. It leads into the lumber room. Walk on past the lumber racks, and you reach the back room door.\n\nIf you need more wood, go to Ridge Lumber on the east ridge. The yard has stacks of lumber, more than one van could carry. If you need more filters, try the Water Tower on the west side. There are more filters in its pump house.",
          },
        },
      },
      pharmacy: {
        blurb: "A pharmacy with medical kits among the aisles and a locked cabinet room behind the counter.",
        door: {
          title: "Mr. Okafor's Door Note",
          text: "Mr. Okafor, the pharmacist. One medical kit is by the giant toothbrush, on the left side of the store. The other is in the middle, where the aisles cross. At least five walkers are inside, and most of them stay near the back. They are slow until they notice you, so be careful. The cabinet room is locked, and its lock takes a code. The code is on my note behind the counter. Get behind the counter at its right end, by the wheelchairs.",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Room Code",
            text: "Mr. Okafor here. The cabinet room has a keypad beside the door. The code is 4471. Press the numbers slowly, and the lock clicks open. You can open the cabinet room now. Inside are two more medical kits and a water filter. I set them aside for whoever came next, and that is you.\n\nYou are close already. The cabinet room door is back here behind the counter. Look to the corner on the same side as the wheelchairs.\n\nIf you need more than that, you will have to go north. St. Anne Annex is the hospital in the north hills. It still has medicine, and a generator that could power a whole base. But listen to me on this. It is the most dangerous place in town. Go in daylight, go rested, and plan your way out before you go in.",
          },
        },
      },
      autoshop: {
        blurb: "Ortiz Auto, a repair shop with engine parts on the benches and a generator in the service pit.",
        door: {
          title: "Dev's Chalk Note",
          text: "Dev here, from the Gas-N-Go. Engine parts are on the workbenches. One bench is in the back right corner, by the red tool chest. The other is in the left bay. At least five walkers are inside. One wanders the parts room by the engine crane, so watch that side. The service pit is under a locked hatch, and the hatch will not budge. Mr. Ortiz left a note in the office behind the waiting room. It explains how to get in.",
        },
        notes: {
          "autoshop-office": {
            title: "Mr. Ortiz on the Hatch",
            text: "This is Mr. Ortiz. The hatch over the service pit looks jammed, but it is only bolted. The bolt comes out if you twist it to the left. Give it one hard turn, and it slides free. You can open the service pit now. My generator is down in the pit, wrapped in a tarp. There are spare parts beside it, and a full fuel can.\n\nThe pit room stands in the middle of the shop, inside its own walls. Walk around to its front side, toward the oil drums. That is where the hatch is.\n\nSignal Electronics is downtown. It still has wire and radio parts, because nobody thinks of them as food. But it is near the walker crowds, and they drift that way after dark. Go in fast and come out faster. Do not stay past sunset.",
          },
        },
      },
      radioshack: {
        blurb: "Signal Electronics, an electronics store with spools of wire, close to the walker crowds downtown.",
        door: {
          title: "Jo's Sign in the Window",
          text: "Jo wrote this. Two spools of wire lie between the two long middle shelves. One is on the TV wall side, to your left. The other is on the robot side, to your right. At least six walkers are inside. One stands near the right end of the counter, by the robot. It will hear you once you get close, so have your gun up before you cross the floor. The manager's office is locked. The manager left a note on the counter at the back. Read it first.",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Key Under the Register",
            text: "I am Priya, the manager. The office key is taped under the register. Reach under the counter and feel along the front edge until you touch the tape. Peel it off, and you can open the manager's office now. Inside are two boxes of radio parts, and there is more wire. Take the radio parts first, since nobody else in town has any.\n\nThe office door is in the back wall, just left of the robot. You cannot miss that robot.\n\nTwo places worth knowing are north of downtown. The 4th Precinct is the police station, and it has gun parts. Lincoln Middle School has books, boxes of them. Both are worth the drive, but the station is the harder one by far. Do not go there tired, and do not go there hurt.",
          },
        },
      },
      garden: {
        blurb: "Greenhouse Row, a line of greenhouses with seeds, soil, and a locked potting shed.",
        door: {
          title: "Rosa Painted the Gate",
          text: "Rosa here. I ran this greenhouse before everything fell apart, and I still think of it as mine. Soil is in the big greenhouse, the one with the scarecrow. Seeds are in the shop by the gate, near the big gnome. At least five walkers are inside. One keeps to the back of the big greenhouse, among the dead plants. The potting shed is locked. My note is on the potting bench by the palm tree, back right. It tells you how to get in.",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Watering Can",
            text: "Rosa again. The potting shed has a padlock, and I hid the key where nobody would look. It is in the watering can on this bench. Tip the can and let the key slide into your hand. You can open the potting shed now. There are more seeds inside, and a water tank. Keep the seeds dry, or they are no good to anyone.\n\nLeave this palm tree house by its door, and follow the path down toward the beehives. The shed door is right on that path.\n\nStation 12 is the fire station north of here. Its equipment bay has tools and water tanks, the big kind. Chief Dunn ran that station, and I believe he is still holding it. He is gruff, but he helped me board up this place. Tell him Rosa sent you.",
          },
        },
      },
      police: {
        blurb: "The 4th Precinct, a police station with gun parts, an armor plate, and a locked armory.",
        door: {
          title: "Sergeant Vega's Notice",
          text: "Sergeant Vega. Gun parts are in the squad room, left of the long hall. An armor plate is in the garage on the right, by the riot shields. At least eight walkers are inside, and one of them is big. The big one waits by the police bike in the garage, so do not go in there carelessly. The armory is locked behind a dial. I left the combination on a note at the front desk. Read it before you touch the armory door.",
        },
        notes: {
          "police-desk": {
            title: "The Armory Combination",
            text: "Sergeant Vega again. The armory has a dial lock, and the combination is 19-4-33. Turn it slowly: left, then right, then left again. You can open the armory now. There are gun parts inside, and an armor plate. Take what you can carry, and leave the rest for the next survivor.\n\nThe armory is near the end of the back hall, toward the police bike. It is the last door before the garage, so you never have to go near that bike.\n\nThe Public Library is north of downtown. It has books in its archive room, more than you would believe. The librarian stayed when everyone else fled. Her name is Mrs. Greer, and she knows that building better than anyone alive. If you get there, help her if you can.",
          },
        },
      },
      school: {
        blurb: "Lincoln Middle School, with boxes of books, a walker in the hallway, and a locked library closet.",
        door: {
          title: "Max and Mia Were Here",
          text: "Max and Mia wrote this. There are two boxes of books. One is in the music room with the drum set. The other is in the front office, behind the lion statue. At least six walkers are inside, and one stands in the main hallway. It does not move until it notices you, so give it room. The library closet is locked. The teacher's note says where the key is. That note is in the science room, back left, by the big brain. Find that note first.",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk",
            text: "I am Ms. Adler, and I taught science in this room for eleven years. The library closet key is in the top drawer of this desk. Pull the drawer all the way out, because it sticks halfway. With that key, you can open the closet now. It holds books and a folder of city maps. The maps are worth more than the books right now, so take them first.\n\nGo out to the main hallway and follow it toward the drum set room. The library is the room next to it. Its closet is in the back corner, on the drum set side.\n\nNorthgate Mall is in the north. It has food, medicine, and wire, enough to keep a base going for weeks. But the crowds there are the worst in town, and they move together. Go only if you must, and never without a way back out.",
          },
        },
      },
      firehouse: {
        blurb: "Station 12, a fire station with tools, water tanks, and a locked equipment bay.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Chief Dunn. A tool kit is in the office behind the watch desk. A water tank is in the truck bay, on the right wall, past the gear racks. At least six walkers are inside, and two of them are in the truck bay. They stand between you and that tank, so deal with them first. The equipment bay is locked, and the lock is a good one. My note is on the watch desk, by the spotted dog. It tells you which key.",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "Chief Dunn again. Look at the key board on the wall by this desk. Take the red key, and only the red one. The others are for trucks that will never run again. The red key opens the equipment bay lock, so you can open the equipment bay now. There is a water tank in there, plus lumber and a set of tools. Load the tank first, since it is the hardest to replace.\n\nGo into the truck bay and walk all the way to the back. The equipment bay door is there, beside the fire truck on the gear racks side.\n\nIf you need water filters, go to the Water Tower on the west side. The filters are in its pump house. Theo looks after the pumps. He kept them running when the rest of us gave up.",
          },
        },
      },
      hospital: {
        blurb: "St. Anne Annex, the hospital in the north hills, with medicine, a generator, and the worst walkers.",
        door: {
          title: "Doc Lin on the Ambulance",
          text: "Doc Lin. One medical kit is in the patient room next to the x-ray machine. Another is by the giant teddy bear in the gift shop. The generator is in the utility room, on the right side. At least nine walkers are inside, and they stand in the dark rooms. They do not stir until you are close, and then they come all at once. The pharmacy stock room is locked. The nurse's note is at the nurses' station in the middle.",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada Stayed",
            text: "I am Nurse Ada. I stayed when the others left, because somebody had to watch over this place. The stock room door needs a badge, and mine still works. The badge is in the drawer under this station. Take it, and you can open the stock room now. There are three medical kits inside. Use them wisely, because nobody is making more.\n\nYou barely have to walk. The stock room door opens off this same room, across the walkway from the desk. It is on the same side as the angel statue.\n\nStay quiet in here, above everything else. The walkers in this building follow sound more than light. Do not run, and do not shout, even when it gets bad. Walk softly, and most of them will never turn your way.",
          },
        },
      },
      watertower: {
        blurb: "The Water Tower's pump building on the west side, stocked with water filters.",
        door: {
          title: "Theo's Fence Note",
          text: "Theo here. I tend the pumps, and I still check on them whenever I can. One water filter is by the crates near the big red wheel. The other is in the boat workshop, by the rowboat. At least six walkers are inside the pump building. They never leave, so you will have to deal with every one of them. The pump house is locked. My note is on the control panel in the back right room. Read it before you try the pump house door.",
        },
        notes: {
          "watertower-panel": {
            title: "Theo's Breaker Box",
            text: "Theo again. The pump house key is in the breaker box. That is the gray metal box on the wall, and it is not locked. Open it, and the key hangs on a nail inside the lid. With it, you can open the pump house now. There are filters in there, a water tank, and a spool of wire.\n\nThe pump house sits inside the pump hall, the big room past the blue pump. Its door is at the back, at the blue pump end, far from the big red wheel.\n\nOne more thing, in case you ever run short of medicine. St. Anne Annex, the hospital, is north up Hill Road. It still has medicine on its shelves. But it is the most dangerous place in town, worse than anywhere I have seen. Go in daylight, and keep your exit in mind the whole time.",
          },
        },
      },
      lumberyard: {
        blurb: "Ridge Lumber on the east ridge, stacked with wood and guarded by a locked kiln shed.",
        door: {
          title: "Ruby's Spray Paint",
          text: "Ruby again. Lumber is in the long racks in the middle. One more stack is out back by the log pile, where a big walker stands guard. At least eight walkers are inside. A crowd of them gathers by the loading dock and the flatbed truck. Stay clear of the dock if you can. The kiln shed is locked. The yard boss left a note on a clipboard by the band saw. Read it before you touch that shed, or you will waste your time.",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Clipboard",
            text: "Carla here, the yard boss. The kiln shed has a padlock with a dial on it. The code is 2218. Spin it to those numbers, and the lock drops open. You can open the kiln shed now. The lumber in there is dry, and dry wood is worth hauling. There is a whole box of nails in the shed too.\n\nStep out of this band saw shop into the rack hall. Follow the back wall toward the log pile. The kiln shed door is a short walk along, in that same wall.\n\nDo not run the saws. Not even once, not even for a second, no matter how tempting it is. The noise brings the whole dock crowd, and they come faster than you would think. Carry what you need and go. Silence is the only thing keeping this yard yours.",
          },
        },
      },
      mall: {
        blurb: "Northgate Mall in the north, full of supplies and the biggest walker crowd in town.",
        door: {
          title: "Jo's Mall Door Note",
          text: "Jo here. Food is in the food court at the back. Medicine is in the pharmacy on the left. Wire is in the gadget store on the right, next door to the orange tent. At least nine walkers are inside, and many of them stand along the main hall. A gunshot wakes the ones nearby. The security office is locked. The guard's note is in the play area, by the green dino. Read it before you try the office, because the lock takes a code.",
        },
        notes: {
          "mall-guard": {
            title: "Luis Left the Code",
            text: "My name is Luis, and I worked security at this mall. The office has a keypad beside the door. The code is 0912. Type it in, and the lock lets go. You can open the security office now. There are gun parts inside, plus radio parts and a tool kit. I locked them up on the last day, before the crowd came through the doors.\n\nThe office is right behind the green dino, but there is no way through from here. Go to the food court and take the kitchen door at the back. Turn right, and follow that hall to the office.\n\nThe walkers here come running at anyone who runs. So do not run, no matter how close they get. Walk, and most of them stay put. It feels wrong every single time, but it works.",
          },
        },
      },
      library: {
        blurb: "The Public Library north of downtown, with books, city maps, and a locked archive room.",
        door: {
          title: "Mrs. Greer's Book Drop",
          text: "Mrs. Greer, the librarian. Books are in the stacks on both sides of the main hall. There are more in the children's room, by the toy castle. At least eight walkers are inside, and two of them are in the main hall. You will meet those two first, so be ready the moment you step in. The archive room is locked. My note is on the reference desk by the giant globe, back left. Read it, and the archive will open for you.",
        },
        notes: {
          "library-desk": {
            title: "The Key in the Dictionary",
            text: "Mrs. Greer again. The archive key is inside the big dictionary on this desk. Open the book to the middle and find the hollow cut into the pages. The key rests in that hollow. With it, you can open the archive room now. The archive has books, and a folder of city maps that show every street in town.\n\nStep back out into the main hall and look to its back end. The archive door is there. It is between the rooms with the giant globe and the tall clock.\n\nReading saved this building. Look at the walls on your way out. They are stacked with the books nobody wanted, the ones nobody checked out in years. Now they stop walkers. Take what you need, but leave the walls standing.",
          },
        },
      },
    },
    road: {
      to: "To {dest}",
      here: "You made it",
      home: "Home safe",
      fog: "Fog",
      night: "Night",
      hungry: "Hungry",
      deadEnd: "Dead end",
      noThrough: "No through road",
      closed: "Road closed",
      lot: "Parking lot",
      hint: "Read the sign to see where each lane goes, then pick your lane with A and D.",
      wrongWay: "Wrong way! That road leads to {place}.",
      wrongStreet: "Wrong way! You turned onto {street}.",
      wrongSide: "Wrong turn! {street} does not go through.",
      wrongPlace: "Wrong lot! That is {place}, not {dest}.",
      wrongLot: "Wrong lot! That parking lot is not {dest}.",
      missed: "You drove right past {dest}.",
      restart: "Back to {origin}. Read the signs and try again.",
      routeHead: "The way there",
      routeTake: "Take {street} to {place}.",
      routeTakeStreet: "Take {street}.",
      routeStraight: "Keep to the left lane past side streets and other lots. Where roads meet, take the lane the sign gives your road.",
      routeLeft: "{dest} is on the left. Move into the turn lane that opens on the far left.",
      routeRight: "{dest} is on the right. Move into the right lane.",
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
