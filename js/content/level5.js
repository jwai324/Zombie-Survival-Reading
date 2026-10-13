/* Reading level 5 (5th grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 5 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[5] = {
    level: 5,
    howto: [
      "Months after the Fall, you run the last working van out of a boarded-up house at the south end of town. That house is your home base, and it is the only place where the game saves. There are up to 4 saves, and each player has their own labeled one, so pick yours on the title screen. The game saves when you arrive, after every build, and after every wave. Every trip begins and ends at that house. Everything you bring back lands there, and everything you build grows from there.",
      "Home base is cabin defense. You stand in the yard in first person. The cabin is behind you, the van sits in the driveway, and a fence rings the lot. Time runs in phases. During a calm, nothing touches the fence, so go inside to build or climb into the van and leave. Then a wave comes. Sometimes it is a few walkers, sometimes a flood, and sometimes nothing at all. During a wave the cabin door and the van are locked, so you hold the yard with what you have. The fence never fixes itself. Every hole stays open until you repair it, and every open hole is a doorway for the next wave. Stand at the hole and press E, or use the cabin menu. Each hole costs 1 scrap to rebuild, and a cracked fence segment can be braced for 1 scrap too. Later you can craft traps at the workbench and set them in the yard or just past the fence. A walker that steps on one gets hurt. The Spike trap needs Walls 2, and the Blast trap needs Walls 3.",
      "Open the city map and choose a place. Only a few spots are known at first. Notes reveal the rest a place or two at a time, and the Radio room reveals them faster. Once you pick a place, the map lists the way there in words, one street at a time. Read it before you go, because the road itself will not show you the route. Before every junction, a sign tells you where each lane goes. Get into the lane for your way before the white stop line. Use A and D, the arrow keys, or the side buttons. Your usual left lane always rolls straight past side streets and parking lots, and every side street is a dead end. At the end of the drive, turn into the lot of the place you chose. Take a wrong turn or miss that lot, and the drive starts over from where you set out. The damage, scrap, and kills from the failed try stay with you, like bruises from a bad fall. A small minimap at the top shows where you are and flags where you are going. It never draws the route for you. The road is never empty. Far places and dangerous places carry more walkers, and every day that passes adds a few more. The Power room shows how dangerous each place is before you commit.",
      "At the door, you read a note before you step inside. It tells you how many walkers wait and where the items are, so read it like a map. Buildings are big, full of rooms, long halls, and dead ends. Each corner holds a landmark you cannot miss, like a giant toothbrush or a green dino. The notes steer you by them. Press M for a map of every part you have seen so far. Every doorway inside is a real door. Press E to open it, and press E again to close it. Walkers cannot open doors, so a closed door buys you a breath when you need one. Shoot the walkers or slip around them. Items sit on shelves and floors, and scrap piles pay in scrap. Shelf and floor items come back 3 days after you take them, but cache items never do. Somewhere inside is another note. Reading it is what lets you open the locked cache room, where the best items wait. It also names the next place to try, and that place appears on the map. Every note you read goes into your backpack, which opens at base, on the map, or inside a building. Go back into a building on the same trip, and it is exactly as you left it. If you open the map while you are still parked at a place, you can go straight back inside. Driving home resets all of that.",
      "Hurt? A Medical kit heals you back to full. The backpack carries up to 3 kits, and you pack them from storage at the cabin. Inside a building you can also use a kit from the van's cargo. Drive home with your cargo. At base, cargo moves into storage, you eat one food, the Garden and the Farm add food, and the day counter rises. The garage repairs the van back to full for scrap: 1 scrap for every 3 health missing, and at least 5. Once the Garage room is built, repairs are free, and they never need typing.",
      "Building a room, upgrading the van or the gun, and crafting a trap all happen at the workbench in the garage. Each one is a short typing round. The words appear on the screen with a timer ticking beside them. Run out of time and you simply try again, because nothing is spent until you finish. The first time, the bench teaches you where your fingers go on the home row. Every finished round moves you up a typing stage, from single home-row keys to the other rows, then words, phrases, and sentences. What you build does not hide in a menu. Every room you build shows up in the yard, and it looks bigger and stronger at each level. The Walls room changes the fence itself, and your upgrades show on the van and the gun. Late in the game, dig a Well for clean water. Then build a Farm for crops and animals, and a Lab that turns herbs and clean water into Medical kits at home. If you die on the road, inside a building, or in the yard, the game reloads your last base save. Everything since that save is gone, so every trip is a bet. Make it a smart one.",
    ],
    controls: [
      "Road: Aim with the mouse and hold to fire. A and D, the arrow keys, or the side buttons change lanes. Read each sign, and be in the lane for your way before the white stop line.",
      "Inside and in the yard: W A S D move, the mouse looks, and a click fires. Shift makes you run, and B opens the backpack. M opens a map of the parts of a building you have seen, and P or Esc pauses the game.",
      "E does it all: E reads notes, opens and closes doors, and opens a cache once you have read its note. E also leaves a building, enters the cabin, starts the van, and rebuilds a hole in the fence for 1 scrap.",
      "Traps in the yard: T sets a spike trap and R sets a blast trap. Each one goes on the ground in front of you or just past the fence line, where the walkers come through.",
      "Backpack: Every note you have read, kept with where you found it, plus your medical kits. Use a kit to heal back to full.",
      "Workbench: Building, upgrading, and crafting are short typing rounds. Type what is on the screen before the timer runs out. Running out only means you try again, and nothing is spent until you finish.",
      "Map: Tap a place, read the way there, then Drive. At the place where you are parked, you can go back inside, and it will be exactly as you left it.",
    ],
    road: {
      to: "Heading to {dest}",
      here: "You made it",
      home: "Home safe",
      fog: "Thick fog",
      night: "Night",
      hungry: "Hungry",
      deadEnd: "Dead end",
      noThrough: "No through road",
      closed: "Road closed",
      lot: "Parking lot",
      hint: "Read the sign. Pick your lane before the white line with A and D, the arrow keys, or the side buttons.",
      wrongWay: "Wrong way! That road leads to {place}.",
      wrongStreet: "Wrong way! You turned onto {street}.",
      wrongSide: "Wrong way! {street} leads nowhere.",
      wrongPlace: "Wrong lot! This is {place}, not {dest}.",
      wrongLot: "Wrong lot! This is not {dest}.",
      missed: "You drove right past {dest}.",
      restart: "Back to {origin}. Try the drive again.",
      routeHead: "How to get there",
      routeTake: "Follow {street} to {place}.",
      routeTakeStreet: "Follow {street}.",
      routeStraight: "Stay in your left lane to roll straight past side streets and other lots.",
      routeLeft: "At the end, {dest} is on the left. Move into the far left lane to turn in.",
      routeRight: "At the end, {dest} is on the right. Move into the right lane to turn in.",
    },
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
        blurb: "A small gas station with fuel cans by the slushie machine and in the garage, and a locked storeroom off the back hall.",
        door: {
          title: "Ruby's Warning on the Door",
          text: "Ruby here, and I am writing fast. At least three walkers are inside, and one of them waits in the garage by the car lift. That number will not stay at three. More drift in as the days pass, so every day you wait makes this place worse. One fuel can sits on the floor by the slushie machine, in the front left corner. The other is in the garage, by the tire tower near the big bay doors. The storeroom is locked, and I could not budge it. The clerk left a note on the counter by the front door, so read that before you fight the lock. Grab the cans, read the note, and do not wake the one by the car lift.",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Note at the Register",
            text: "This is Dev. I was the clerk here, which means I know every hiding spot in this building. The storeroom key hangs on the hook under this counter, right where my knees used to bump it. Reach under, feel along the wood, and lift it off. With that key in your hand, you can open the storeroom now. Back there is more fuel, plus a spool of wire that never made it to the shelves.\n\nHere is how to find it. Walk past the shelves to the gap in the back wall, and you will be standing in the back hall. The ice machine sits in the break room at one end of that hall. Go the other way, to the far end. The storeroom is the last door before the garage, so if you reach the garage door, you went one step too far.\n\nI am headed to Ortiz Auto on the east side of town. The shop is still standing, and a standing shop means tools and a working lift. If you need seeds and soil, go the other way. Rosa is at Greenhouse Row, west past this gas station. She trades with anyone honest, so tell her Dev sent you.",
          },
        },
      },
      grocery: {
        blurb: "A corner store with food left on the floor and a cold, locked walk-in cooler.",
        door: {
          title: "Doc Lin on the Glass",
          text: "Doc Lin wrote this in marker, so read it before the rain does. The shelves are picked over, stripped like bones after a hard winter. What food is left lies on the floor. Look by the fish tank in the back left corner, and by the freezers along the right wall. Walkers get in through the loading door at the back, by the forklift. That door never shuts right, so count on at least three inside, and more if you linger. The cooler is locked. The manager's note is in the office, back left, through the staff door near the fish tank. Read it, because the cooler is the only real prize in this store. Do not leave without it.",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Trick",
            text: "I am Hana, the store manager, and I locked the cooler on purpose. The latch is stubborn, not broken. Lift it while you pull on the door, and the bar slides out of its catch like a key turning. Do both at once, or it will not budge. That is the whole trick, so you can open the cooler now. Inside there is food, and there is one medical kit on the top shelf. The cold kept it all good, which is more than I can say for the rest of this store.\n\nStep out of this office into the hall and turn right, toward the forklift. The cooler is the very next door. If you reach the door marked STOCK, you walked right past it.\n\nWhen that kit runs out, you will need more medicine. Try Mile 9 Pharmacy, west of here. Last week it still had medicine on its shelves, and Mr. Okafor kept it stocked right up to the end. Take what you need and leave the rest. Someone else will stand at this desk after you, hungry and hoping, and they will need something too.",
          },
        },
      },
      hardware: {
        blurb: "A big hardware store with nails, tools, lumber, and a locked back room.",
        door: {
          title: "Mr. Reyes Nailed This Up",
          text: "Mr. Reyes, the owner. I built this store board by board, so trust what I tell you. At least five walkers are inside, and two of them shuffle through the middle aisles like lost customers. Nails are by the toilet display in the front left corner, so grab those first while the door is still close. Tools are in the middle aisle, right where those two walkers roam. Lumber is in the lumber racks at the back, behind all the aisles. The back room is locked, and the lock is not the real problem. My note is by the paint mixer, back left, in the paint room. Read it, and you will know how to beat that door.",
        },
        notes: {
          "hardware-paint": {
            title: "The Sticking Door",
            text: "Mr. Reyes again. The back room door sticks, and most people give up after two shoves. The frame swelled when the roof leaked, so the door sits low and drags on the floor. The trick is to lift the handle and push at the same time. Lift it high, lean in, and the door pops free like a cork from a bottle. That means you can open the back room now. Inside I left a water filter, a second tool kit, and a stack of lumber. I meant to come back for them and never did.\n\nTo get there, take the side door by the paint mixer. It opens into the lumber room. Walk past the lumber racks. The back room door waits on the far side, in the back wall, beside a sign that says BACK ROOM.\n\nIf you need more wood than that, drive to Ridge Lumber on the east ridge. Its yard holds stacks of lumber, enough to board up a whole street. If you need more filters, try the Water Tower on the west side. There are more filters in its pump house, and Theo keeps the pumps running. Tell him I am sorry about the bill I never paid.",
          },
        },
      },
      pharmacy: {
        blurb: "A small pharmacy with medical kits on the floor and a locked cabinet room behind the counter.",
        door: {
          title: "Mr. Okafor's Door Note",
          text: "Mr. Okafor, the pharmacist. Two medical kits are still out on the floor. One is by the giant toothbrush in the back left corner of the store. The other is in the middle, where the aisles cross, so you will be exposed from four sides while you grab it. At least five walkers are inside, and most of them stay near the back. They are slow until they see you, and then they are not slow at all. The cabinet room is locked, and it takes a code. The code is on my note behind the counter. You cannot climb over that counter, so walk to its right end, by the wheelchairs, and slip around. Read the note first, or you will stand at that door for nothing.",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Room Code",
            text: "Mr. Okafor here. The cabinet room has a keypad on its door, and I am trusting you with the code. It is 4471. Press the numbers slowly, wait for the click, and the lock lets go. You can open the cabinet room now. Inside are two more medical kits and a water filter, because clean water matters as much as medicine. I left them for whoever came next, and that is you.\n\nYou do not have far to go. The cabinet room door is back here behind the counter, in the corner on the same side as the wheelchairs. Keep the counter at your back, walk right, and look for the sign that says CABINET ROOM.\n\nIf you need more than that, you will have to go north. St. Anne Annex is the hospital in the north hills. It still has medicine, and it has a generator that could light a whole base. But hear me on this. It is the most dangerous place in town, and its dark halls hide more than they show. Go in daylight, go rested, and go with a plan. Medicine does no good to someone who never makes it home.",
          },
        },
      },
      autoshop: {
        blurb: "A repair shop with engine parts on the benches and a generator down in the service pit.",
        door: {
          title: "Dev's Chalk Note",
          text: "Dev here, from the Gas-N-Go, and I made it this far on fumes and luck. Engine parts are on the workbenches. One bench is in the back right corner, by the red tool chest. The other is in the left bay, the first bay past the waiting room. At least five walkers are inside. One wanders the parts room by the engine crane, back left, so do not let it pin you in there. The service pit is under a locked hatch. Mr. Ortiz left a note in the office behind the waiting room, and that hatch will not move until you read it. Grab the parts, read the note, and keep your back to a wall whenever you can.",
        },
        notes: {
          "autoshop-office": {
            title: "Mr. Ortiz on the Hatch",
            text: "This is Mr. Ortiz, and this is my shop. The hatch over the service pit looks welded shut, but it is only stubborn. The bolt comes out if you twist it to the left. Most people turn it right, feel it bind, and give up. Turn it left, hard, and it slides free. You can open the service pit now. My generator is down in the pit, where the crowds never thought to look. There are spare parts with it, and a fuel can to get it running.\n\nFinding it is the easy part. Go back through the waiting room and into the shop. The pit room stands in the middle of the shop like an island, with walls on every side. Its hatch is on the front side, the side that faces the oil drums. If you see a sign that says PIT, you are close.\n\nIf you need wire or radio parts, Signal Electronics downtown still has both on its shelves. But it sits near the walker crowds, and they drift that way like water finding low ground. Go in fast and come out faster. Do not stay past dark, because downtown after dark belongs to them.",
          },
        },
      },
      radioshack: {
        blurb: "An electronics store with spools of wire, sitting close to the walker crowds downtown.",
        door: {
          title: "Jo's Sign in the Window",
          text: "Jo wrote this, and Jo does not scare easy. Spools of wire are between the two long middle shelves, in the gap that runs across the store. One spool is on the TV wall side, to your left. The other is on the robot side, to your right. At least six walkers are inside. One waits near the right end of the counter, by the robot. It will hear the door the moment you open it. Be ready before you cross the floor. The manager's office is locked. The manager left a note on the counter at the back, and the office will not open until you read it. The best parts in this whole store are behind that door.",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Key Under the Register",
            text: "I am Priya, the manager. The office key is taped under the register, pressed flat against the metal so no one would feel it by accident. Reach under and run your fingers along the back edge. Peel it off, and you can open the manager's office now. Inside are two boxes of radio parts and more wire than you can carry. Take the radio parts first, because they are the hardest thing in town to find.\n\nThe office door is close. It is in the back wall, just left of the robot. Face the back wall and walk right, toward the robot, until you find the door marked MANAGER. If those round red eyes are staring down at you, you went a few steps too far.\n\nTwo places north of downtown are worth the drive. The 4th Precinct is the police station, and it has gun parts. Lincoln Middle School has books, boxes and boxes of them. The station is the harder of the two, and the walkers there still wear their badges. Do not go there tired, and do not go there without a plan for getting out.",
          },
        },
      },
      garden: {
        blurb: "A row of greenhouses with seeds, soil, and a locked potting shed.",
        door: {
          title: "Rosa Painted the Gate",
          text: "Rosa here. I ran this greenhouse before the Fall, and I still think of it as mine. Seed packets are in the shop by the gate, near the big gnome, sorted and labeled the way I left them. Soil is in the big greenhouse with the scarecrow, between the long planting tables. At least five walkers are inside. One stands at the back of the big greenhouse, still as a fence post, until it hears you. The others wander with the sun. The potting shed is locked, and it holds the best of what I saved. My note is on the potting bench by the palm tree, in the glasshouse at the back right. Read it, and the shed is yours.",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Watering Can",
            text: "Rosa again. The potting shed has a padlock, and I hid the key where a thief would never think to look. It is in the watering can on this bench. Tip the can, let the water run out, and the key slides into your hand. With it, you can open the potting shed now. There are more seeds inside, and there is a water tank. Keep the seeds dry, because wet seeds are just dirt that cost you a trip.\n\nThe shed is close. Leave the palm tree house by the door in its front wall, and follow the path down toward the beehives. The shed door is on that path, on your left, beside a sign that says POTTING SHED. If you hear bees humming in your ears, you went too far.\n\nIf you need tools or a second tank, go north. Station 12 is the fire station north of here. Its equipment bay has tools and water tanks, enough to set up a real garden. Chief Dunn ran that station, and I believe he is still there, because firefighters do not leave their post. Tell him Rosa sent you, and tell him the tomatoes made it.",
          },
        },
      },
      police: {
        blurb: "The 4th Precinct: gun parts, an armor plate, and a locked armory.",
        door: {
          title: "Sergeant Vega's Notice",
          text: "Sergeant Vega. Gun parts are in the squad room, left of the long hall that runs back from the lobby. An armor plate is in the garage on the right, by the riot shields near the front. At least eight walkers are inside, and one of them is big. That big one waits by the police bike at the back of the garage. The plate sits closer to you than it does, so grab it and do not wander deeper. The armory is locked, and I locked it myself. My note at the front desk has the combination. Read it first, because the armory door does not care how strong you are.",
        },
        notes: {
          "police-desk": {
            title: "The Armory Combination",
            text: "Sergeant Vega again. The armory has a dial lock, and the combination is 19-4-33. Turn it slow: left to 19, right to 4, left to 33. Rush it and the dial slips, and you start over. Do it right, and you can open the armory now. There are gun parts inside, and there is an armor plate. Take only what you can carry, and leave the rest for the next one who reads this.\n\nTo reach it, take the long hall straight back from the lobby until it ends at the back hall. Turn right, toward the police bike in the garage. The armory is at the right end of the back hall, the last door before the garage, marked ARMORY. Keep an ear on that garage, because the big one hears everything.\n\nOne more thing, since you can read. The Public Library is north of downtown. It has books in its archive room, more than anyone ever checked out. The librarian stayed when everyone else ran. Her name is Mrs. Greer, and she knows that building the way I know this one. Help her if you can, because people who stay are the ones worth helping.",
          },
        },
      },
      school: {
        blurb: "A middle school with boxes of books in the music room and the front office, and a locked library closet.",
        door: {
          title: "Max and Mia Were Here",
          text: "Max and Mia wrote this, and we are still here, somehow. There are two boxes of books on the floor. One is in the music room with the drum set, off the right end of the main hallway. The other is in the front office, through the door behind the lion statue. At least six walkers are inside, and one walks the main hallway like a slow guard on patrol. It goes back and forth, so time your move and cross behind it. The library closet is locked. The key is in the teacher's note, in the science room at the back left, by the big brain. Read it, and the closet opens. We took one box and ran, so there are plenty left for you.",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk",
            text: "I am Ms. Adler, and I taught science in this room, right beside the big brain. The library closet key is in the top desk drawer. The drawer sticks, so pull it all the way out and feel in the back corner. With that key, you can open the closet now. It holds books and a folder of city maps. Right now the maps may be worth more than the books, but the books will outlast all of us.\n\nHere is the way. Step into the main hallway and walk right, toward the music room with the drum set. The library is the room just before it, next door to the drums. Its closet is tucked into the back right corner of the library.\n\nNorthgate Mall is in the north. It has food, medicine, and wire, everything a base needs under one roof. But the crowds there are the worst in town, and they fill the halls like a tide that never goes out. Go only if you must, and never alone if you can help it. I told my students the same thing about the hallways. Stay together, stay quiet, and keep moving.",
          },
        },
      },
      firehouse: {
        blurb: "Station 12, a fire station with tools, water tanks, and a locked equipment bay.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Chief Dunn. The watch desk is the first thing you see when you walk in. The spotted dog sits beside it, as if it were still on duty. My note is on that desk, and it tells you how to open the equipment bay, which is locked. A tool kit is in the office behind the watch desk. A water tank is in the truck bay, on the right wall, past the gear racks. At least six walkers are inside, and two of them stand in the truck bay. They wait between you and that tank like bad dogs on a chain. Get the note and the tool kit first, and then deal with the bay.",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "Chief Dunn again. Look at the key board on the wall by this desk. There are a dozen keys on it, and only one matters. Take the red key, and only the red one. It opens the equipment bay lock, so you can open the equipment bay now. There is a water tank in there, plus lumber and a set of tools. Load the tank first, because it is the heaviest, and you will not want to carry it last.\n\nFrom here, go through the side door into the truck bay. The fire truck is parked at the back, as big as a house on wheels. The equipment bay is at the back of the truck bay too, just right of the fire truck. Look for the sign that says EQUIPMENT. Watch the shadows along the walls as you cross.\n\nIf you need water filters, a tank alone will not help you. Go to the Water Tower on the west side. The filters are in its pump house. Theo looks after the pumps, and he kept them running when the rest of us gave up on this town. Thank him for the clean water, and then get back on the road before dark.",
          },
        },
      },
      hospital: {
        blurb: "St. Anne Annex, the hospital in the north hills, with medicine, a generator, and the worst walkers in town.",
        door: {
          title: "Doc Lin on the Ambulance",
          text: "Doc Lin. I worked here, so trust the map I am giving you. One medical kit is in the patient room next to the x-ray machine, off the back hall on the left. Another is by the giant teddy bear in the gift shop, just off the front lobby on the left. The generator is in the utility room, on the right side of the building, and it is heavy. At least nine walkers are inside. They stand in the dark rooms like coats on hooks, and they do not come out until you are close. The pharmacy stock room is locked. The nurse's note is at the nurses' station in the middle of the building, and without it, the stock room stays shut.",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada Stayed",
            text: "I am Nurse Ada. I stayed when the others left, because someone had to keep the lights on. The stock room door needs a badge, and the reader still works. My badge is in the drawer under this station, on top of the charts. Take it, hold it to the reader, and you can open the stock room now. There are three medical kits inside. Use them well, because they are the last kits in this building, and I counted twice.\n\nYou barely have to move. The stock room door is right across the corridor from this station, on the angel statue side, the side toward the chapel. Look for the sign that says PHARMACY beside it. Four steps, and you are there.\n\nStay quiet in here. The walkers in this building follow sound more than light, and these halls carry sound the way pipes carry water. Do not run, and do not shout, no matter what you see. Walk soft and keep your light low, and they may never turn your way. I have walked these halls for weeks that way, and I am still writing.",
          },
        },
      },
      watertower: {
        blurb: "The pump building under the Water Tower, stocked with water filters and a locked pump house.",
        door: {
          title: "Theo's Fence Note",
          text: "Theo here. I tend the pumps, and I still check on them when the yard is clear. Two water filters are lying loose. One is by the crates near the big red wheel, in the back left corner of the pump hall. The other is in the boat workshop on the right, by the rowboat. At least six walkers are inside the pump building. They do not leave, because nothing in there ever draws them out, so you will have to deal with them. The pump house is locked, and the key is not on me. My note is on the control panel in the back right room. Read it, and you will know where I hid the key.",
        },
        notes: {
          "watertower-panel": {
            title: "Theo's Breaker Box",
            text: "Theo again. The pump house key is in the breaker box, the gray metal box on the wall by this panel. It is not locked, because nobody steals from a breaker box. Open it, and the key hangs on a nail inside, next to the main switch. With it, you can open the pump house now. There are filters in there, a water tank, and wire. Take what you need and be quick, because the walkers hear every door.\n\nStep out of this room and edge past the blue pump, then take the door that leads into the pump hall. The pump house door is at the back of the pump hall, right of the big red wheel. A sign beside it says PUMP HOUSE.\n\nOne more thing, and it matters more than the filters. If you need medicine, St. Anne Annex is the hospital, north along the river road. It still has medicine, more than any place left standing. But it is the most dangerous place in town. The halls are dark, and the walkers there wait in the rooms like a held breath. Go in daylight, and do not go alone if you can help it. The river road is quiet, but the hospital is not.",
          },
        },
      },
      lumberyard: {
        blurb: "Ridge Lumber on the east ridge, stacked with wood and guarded by a locked kiln shed.",
        door: {
          title: "Ruby's Spray Paint",
          text: "Ruby again, and this one I painted big so you cannot miss it. Lumber is in the long racks in the middle of the rack hall, more wood than one van can carry. One more stack sits out back by the log pile, in the open yard. At least eight walkers are inside. They gather by the loading dock and the flatbed truck on the right side. It looks like they are waiting for a delivery that will never come. Stay away from the dock if you can. The kiln shed is locked. The yard boss left a note on a clipboard by the band saw, in the saw shop at the back left. Read it before you touch that shed.",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Clipboard",
            text: "Carla here, the yard boss. The kiln shed has a padlock with a dial, and the code is 2218. Spin it to those numbers, and the lock drops open in your hand. You can open the kiln shed now. The lumber in there is dry, and dry wood is worth hauling, because it does not warp or rot on you. There are boxes of nails in the shed too, ready to go.\n\nStep out of the band saw shop into the rack hall and walk along the back wall, away from the saw. The kiln shed door is in that back wall, just right of the band saw shop, beside a sign that says KILN. If you feel warm air on your face, you found it.\n\nDo not run the saws. Not even once, not even to cut a board in half. The noise brings the whole dock crowd, and they come faster than you would think from how they stand around. One scream from a blade, and the yard fills up like a flooded ditch. Carry what you need and go. The quiet is the only fence this place has left, and it is yours as long as you keep it.",
          },
        },
      },
      mall: {
        blurb: "Northgate Mall in the north, full of goods and the biggest walker crowd in town.",
        door: {
          title: "Jo's Mall Door Note",
          text: "Jo here, and this is the big one. Food is in the food court at the back of the mall. Medicine is in the pharmacy on the left side of the main hall. Wire is in the gadget store on the right, next door to the sports store with the orange tent. At least nine walkers are inside, and they move in a group along the main hall. Where one goes, they all go, like a shadow that follows one body. The security office is locked. The guard's note is in the play area by the green dino, back right. Find the note and keep the group on the far side of the hall. Do not get caught between them and a wall.",
        },
        notes: {
          "mall-guard": {
            title: "Luis Left the Code",
            text: "My name is Luis, and I worked security at this mall. The office has a keypad by the door, and the code is 0912. Type it in, and the lock lets go. You can open the security office now. There are gun parts inside, plus radio parts and a tool kit. I locked them up on the last day, when I understood that nobody was coming to take my shift.\n\nThe office sits right behind the green dino, but a wall stands in between, so the way in is not straight. Go to the food court and take the kitchen door at the back. Turn right in the hall behind it, and follow that hall to the end. The office door is there, marked SECURITY.\n\nThe walkers here move as one group, and I have watched them for a long time. They come running at anyone who runs, and they never get tired. So do not run, no matter how close they get. Walk, and most of them stay put. Running is a fire alarm to them, and walking is just another body in the crowd. It feels wrong every single time, but it works. I am still here because of it.",
          },
        },
      },
      library: {
        blurb: "The Public Library north of downtown, with books, city maps, and a locked archive room.",
        door: {
          title: "Mrs. Greer's Book Drop",
          text: "Mrs. Greer, the librarian. Books are waiting in three places. Two boxes are in the stacks on both sides of the main hall, one to the left and one to the right. The third is in the children's room by the toy castle, at the front left. At least eight walkers are inside, and two of them are in the main hall. You will meet those two first, because nearly every door opens off that hall. The archive room is locked, and I keep it that way on purpose. My note is on the reference desk by the giant globe, in the back left room. Read it, and the archive opens to you. Please be quiet in here. It is still a library.",
        },
        notes: {
          "library-desk": {
            title: "The Key in the Dictionary",
            text: "Mrs. Greer again. The archive key is inside the big dictionary on this desk. Open the book to the middle and find the hole cut in the pages. The key sits in that hole, flat and cold. With it, you can open the archive room now. The archive has books, and it has a folder of city maps. Those maps show every street in this town, including the ones the walkers have not found yet.\n\nGo out the door of this room into the main hall, and turn left, toward the back of the building. The archive door is at the very back end of the main hall. It sits between the room with the giant globe and the room with the tall clock. Look for the sign that says ARCHIVE beside it.\n\nReading saved this building. Look at the walls on your way out. They are stacked with the books nobody wanted, the ones that sat for years without a single checkout. Now they stop walkers. Books are heavy, and it turned out that mattered more than anything printed inside them. Take what you came for, and if you have a moment, put something back on a shelf.",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
