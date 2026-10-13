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
    // Buildings: level5-places1.js and level5-places2.js. Home: level5-home.js.
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
