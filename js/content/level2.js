/* Reading level 2 (2nd grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 2 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[2] = {
    level: 2,
    howto: [
      "Your home base is a boarded-up cabin. It sits at the south end of town. You have one van, and it still runs. A fence runs around the yard. At base you stand in the yard, first person. The cabin is behind you. The van is in the driveway. Time runs in phases. In a calm phase, nothing is at the fence. Go inside to build, or leave in the van. Then a wave comes. Sometimes a few walkers. Sometimes a lot. Sometimes none at all. Walkers claw through the fence. In a wave, the cabin door is locked. So is the van. Hold the yard until the wave ends.",
      "The fence does not fix itself. Every hole stays until you fix it. Stand at the hole and press E. Or use the cabin menu. Each hole costs 1 scrap. You can brace a cracked part for 1 scrap. Every room you build shows up in the yard. It looks bigger and stronger at each level. The Walls room changes the fence itself. Build Walls up. That rebuilds the whole fence, tougher than before. Later, you can craft traps at the workbench. Set them in the yard or along the fence line. A walker that steps on one gets hurt. A Spike trap needs Walls 2. A Blast trap needs Walls 3. Later you can dig a Well for water. Build a Farm for more food. Build a Lab to make Medical kits. Each room has its own plot in the yard. An empty plot has a painted sign. A built room has a plaque. Walk up to one and press E to read it. It says what the room is. It says what the room needs. It says why it is still locked.",
      "Pick a place on the city map. Only some places are known at first. Notes and the Radio room show you more. The map shows your way there. It lists the way in words, too. Plan your trip on the map. The road will not show you the way. Walkers are on the road. Far places and bad places have more walkers. More days means more walkers, too. Before the road splits, you see a sign. It says where each lane goes. You drive in the left lane. It always goes straight past side streets and parking lots. Is your lot on the right? Move into the right lane. Is it on the left? Use the turn lane. It opens on the far left. Where roads meet, it works another way. There is one lane for each road. Your own lane may turn. Each lane has an arrow painted on it. Find your way on the sign. Get in the lane with that arrow before the white stop line. Change lanes with A and D or the arrow keys. The side buttons work too. Side streets are dead ends. At the end, turn into the lot you picked. Did you take a wrong turn? Did you miss the lot? Then you go back to where you started. You keep your damage, your scrap, and your kills. A small map shows where you are. A flag marks where you are going.",
      "At the door, you read a note first. It says how many walkers wait inside. It says where the items are. Then you go in. The buildings are big, with many rooms. Each corner has a landmark. It might be a fish tank or a fire truck. Notes name the landmarks, so steer by them. Press M. It shows a map of where you have been. Every doorway inside is a real door. Press E to open it. Press E again to close it. Walkers cannot open doors. Walkers come for you. Shoot them, or move around them. Grab items from shelves and floors. Scrap piles give scrap. Shelf items come back in 3 days. Caches never do. Find the note inside. It tells you how to open the locked cache room. The best items are in there. It often tells you which place to try next, too. Every note goes in your backpack. You can read it again any time. Each item has a tag, too. You read it when you pick the item up. Walls have signs and graffiti. Walk up to one to read it. Every building also has a locked stash. Its key is hidden in a different building. To find a key, follow the notes. One note leads to a second note. The second note says where the key is. Bring the key back to its stash. Press E, and it opens. Stash items never come back. Your keys show in the backpack. At higher reading levels, there are more notes. Some of them are wrong or out of date. Still parked at a place? Open the map. You can go back in. It is just as you left it. Driving home resets it.",
      "The garage has a workbench. Build rooms there. Rooms cost items and scrap. Upgrade the van and the gun there. Craft traps there, too. Each one is a short typing round. The words to type show on the screen. A timer runs. Run out of time, and you just try again. Nothing is spent until you finish. The first time, the bench teaches you the home row. That is where your fingers rest. Each round starts with a count down from 5. A good round has 9 of 10 keys right. A few good rounds move you up a stage. Home-row keys come first, two at a time. Then the other rows. Then words, phrases, and sentences. The cabin has free practice, too. Repairs need no typing. The garage fixes the van back to full health. You pay 1 scrap for every 3 health missing. It costs at least 5 scrap. Build the Garage room, and repairs are free.",
      "Hurt? Use a Medical kit. One kit heals you back to full health. The backpack carries up to 3 kits. Pack them from storage at the cabin. Inside a building, kits in the van's cargo work too. Drive home with your cargo. At base, cargo goes into storage. You eat one food. The day count goes up. Each day you get home, June's journal gets a page. June keeps the crew's journal. Build the Radio room, and a radio broadcast comes each day, too. Each player has their own labeled save. There are up to 4 saves. Pick yours on the title screen. The game saves only at base. It saves when you arrive. It saves after every build. It saves after every wave. If the van is wrecked, you load that save. If you go down inside, you load it. If you go down in the yard, you load it. Everything since that save is gone. So plan each trip.",
    ],
    controls: [
      "Road: Aim with the mouse and hold to fire. A and D change lanes. So do the arrow keys and the side buttons. Your left lane goes straight past side streets and lots. For a lot on the right, use the right lane. For a lot on the left, use the turn lane. It is on the far left. Where roads meet, each road has its own lane. Yours may turn. Read the sign and match the arrow. Be in that lane before the white line.",
      "Inside and in the yard: W A S D move. The mouse looks. Click to fire. Shift runs. B opens the backpack. In a building, M opens the building map. P or Esc pauses.",
      "E does it all: E reads notes. E opens and closes doors. E opens a cache once you read its note. E opens a stash once you have its key. E leaves a building and enters the cabin. E starts the van. E also fixes a fence hole for 1 scrap.",
      "Traps in the yard: T sets a spike trap. R sets a blast trap. Each goes on the ground in front of you. It can go just past the fence, too.",
      "Guns: More guns are hidden in buildings around town. Walk over one to pick it up. Bring it home to keep it. Press 1 to 5 or Q to switch guns. Hold the mouse to pull back the bow. Let go to shoot. Spend scrap at the cabin to make your guns better.",
      "Backpack: The notes you have read, your keys, item tags, and your medical kits. Use a kit to heal to full.",
      "Reading: Walk up to a sign to read it. Press E to read a note. Item tags and keys are in the backpack.",
      "Workbench: Building and upgrading is a short typing round. Type what is on the screen. Beat the timer. Out of time just means try again.",
      "Map: Tap a place and read the way there. Then tap Drive. At a place you can go back inside.",
    ],
    base: {
      intro: "This is home base. It is the only place the game saves. Build up the rooms, then head back out.",
      rooms: {
        walls: {
          desc: "Boards and plates on the fence, house, and van. The fence starts at strength 150. Walkers claw it down in a wave. Better walls mean a stronger fence. They mean more health, too. For the van, and for you on foot.",
          next: [
            "Fence strength 240. Van health up 20. Your health on foot up 20.",
            "Fence strength 360. Van health up 40. Your health on foot up 40.",
            "Fence strength 520. Van health up 60. Your health on foot up 60. Needs an armor plate.",
          ],
        },
        garage: {
          desc: "The shop for the van and the gun. A better garage unlocks better upgrades. Fixing the van costs 1 scrap for every 3 health lost, and at least 5 scrap. Build the Garage and it is free.",
          next: [
            "Van and gun upgrades up to tier 3. Free van repair at base.",
            "Van and gun upgrades up to tier 4. Free van repair at base.",
            "Van and gun upgrades up to tier 5. Free van repair at base. Needs gun parts.",
          ],
        },
        power: {
          desc: "Fuel, wire, and lights. Later, a generator. Power shows you how bad each place is. Later it helps you on the road. Night drives start on day 6. Then one comes every third day.",
          next: [
            "The map shows the danger at each place.",
            "The map shows danger. You find one supply crate on each drive. Needs the generator.",
            "The map shows danger. Two supply crates on each drive. Headlights beat night and fog.",
          ],
        },
        water: {
          desc: "Clean water. You heal while you are in the yard. More water means faster healing.",
          next: [
            "You slowly heal in the yard. Rate 1.",
            "You heal in the yard. Rate 2.",
            "You heal fast in the yard. Rate 3. You start every building at full health.",
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
          desc: "Shelves of books and maps. Read a place's door note. Then the map shows what is still there. Later it marks caches, too.",
          next: [
            "Read a door note. The map then shows what is left there.",
            "The map shows stock at places you have read. It marks which places have a cache.",
            "The map marks caches. It shows what is left everywhere. Needs city maps.",
          ],
        },
        well: {
          desc: "A hand-dug well beside the cabin. Clean water from deep underground. You heal faster in the yard. The Farm and the Lab both need it.",
          next: [
            "Needs the Water room first. Costs 60 scrap. Plus Lumber 2 and Tool kit 1. You heal in the yard at rate 2.",
            "Costs 100 scrap. Plus Lumber 2 and Engine parts 1. Plus Water filter 1. Heal rate goes up to 3.",
            "Costs 150 scrap. Plus Water tank 1 and Engine parts 1. Plus Spool of wire 1. Heal rate goes up to 4. You start every building at full health.",
          ],
        },
        farm: {
          desc: "Farmland next to the yard. First crops, then animals. More food every day. It adds to the Garden's food.",
          next: [
            "A crop field with corn and beans. Needs Garden 2 and the Well. Costs 80 scrap. Plus Seed packets 2 and Bag of soil 2. Plus Lumber 1. The farm grows 2 food a day.",
            "A chicken coop. Needs Well 2. Costs 120 scrap. Plus Lumber 2 and Spool of wire 1. Plus Seed packets 1. The farm gives 4 food a day.",
            "A goat pen. Needs Well 3. Costs 180 scrap. Plus Lumber 3 and Spool of wire 2. Plus Water tank 1. The farm gives 6 food a day.",
          ],
        },
        lab: {
          desc: "Medicine made at home. First herb beds and a still. A still boils herbs into medicine. Later, a clean bench and a powered lab. New kits go into storage when a day passes.",
          next: [
            "Herb beds and a still. Needs Medbay 1 and the Well. Costs 80 scrap. Plus Medical kit 1 and Box of books 1. Plus Seed packets 1. Makes 1 Medical kit every 2 days.",
            "A clean bench. Needs Well 2. Costs 120 scrap. Plus Water filter 1 and Box of books 1. Plus Spool of wire 1. Makes 1 Medical kit a day.",
            "A powered lab. Needs Medbay 2. Costs 180 scrap. Plus Generator 1 and Medical kit 2. Plus Box of books 1. Makes 2 Medical kits a day.",
          ],
        },
      },
      traps: {
        spike: {
          desc: "Spike trap. Walls 2 unlocks it. Costs 10 scrap. Plus Lumber 1 and Box of nails 1. Press T to set it. It goes on the ground in front of you. It can go just past the fence, too. A walker that steps on it loses 45 health. It lasts 3 walkers. Then it is used up.",
        },
        blast: {
          desc: "Blast trap. Walls 3 unlocks it. Costs 25 scrap. Plus Fuel can 1 and Spool of wire 1. Press R to set it. It blows up once. Every walker close to it loses 120 health. One use, then it is gone.",
        },
      },
      bench: {
        intro: "This is the garage workbench. Build, upgrade, and craft here by typing. Nothing is spent until you finish.",
      },
    },
    typing: {
      fingers: [
        "Look at your keyboard. Find the middle row of letter keys. That row is called the home row. Your fingers rest there between keys. They always come back to it.",
        "Your left hand goes on A S D F. Your right hand goes on J K L. Your right pinky takes the ; key. That key is the semicolon. Now feel the F key and the J key. Each one has a small bump. The bumps tell your fingers where home is. You never have to look down.",
        "Both thumbs rest on the space bar. Tap it with either thumb to make a space.",
        "Each finger owns a few keys. It reaches up or down to hit one. Then it comes right back home. Keep your eyes on the screen, not your hands. Trust the bumps. The words will come faster each round.",
      ],
      words: [
        "van", "gas", "fence", "scrap", "note", "cabin", "key", "map", "fuel", "door",
        "radio", "wire", "nails", "wood", "seed", "soil", "meds", "kit", "gun", "books",
        "food", "well", "farm", "lab", "yard", "wave", "calm", "hold", "run", "walk",
        "pump", "tank", "trap", "hole", "home", "base", "shed", "road", "hill", "town",
        "mall", "shop", "lock", "code", "dark", "rust", "bolt", "goat", "hens", "corn",
        "bean", "herb", "tool", "parts", "box", "bag", "pack", "aim", "read", "sign",
        "gate", "wall", "roof", "step", "tile", "dock", "kiln", "tape", "safe", "save",
        "wait", "fix", "dig", "spike", "blast", "brace", "crate", "store", "truck", "crowd",
        "dusk", "night", "still", "bench", "clerk", "nurse", "chief", "badge", "latch", "hatch",
        "river", "ridge", "paint", "armor", "plate", "water", "north", "south", "east", "west",
        "drive", "shoot", "cache", "glass", "panel", "pit", "shelf", "aisle", "desk", "hook",
        "eggs", "coop", "pen", "type", "timer", "round", "day", "trip", "load", "cargo",
        "lane", "lot", "flag", "turn", "globe", "robot", "dino", "bear",
      ],
      phrases: [
        "hold fast", "read it", "go in", "get gas", "fix it", "set trap", "run home", "hold on",
        "lock door", "open door", "shut door", "grab food", "pack kit", "use kit", "dig well", "feed hens",
        "plant corn", "drive home", "save game", "find key", "read note", "take scrap", "keep calm", "stay low",
        "walk slow", "turn left", "head east", "go west", "fix fence", "load van", "fill tank", "stay put",
        "look out", "move on", "brace it", "fix hole", "set spike", "make meds", "grow corn", "milk goat",
        "type fast", "home row", "drive north", "dark hall", "night drive", "calm phase", "big wave", "cold cooler",
        "back room", "pump house", "kiln shed", "red key", "stuck latch", "check map", "stay quiet", "hold yard",
        "left lane", "read sign", "stop line", "wrong turn", "find lot", "back hall",
      ],
      sentences: [
        "Read the note at the door.",
        "Press E to open the door.",
        "Walkers cannot open the doors.",
        "The fence does not fix itself.",
        "Each hole costs one scrap.",
        "Set a spike trap by the fence.",
        "The blast trap goes off once.",
        "Pack three kits before you go.",
        "One kit heals you back to full.",
        "The well gives clean water.",
        "The farm grows corn and beans.",
        "The hens lay eggs each day.",
        "The lab makes medicine at home.",
        "Dev went east to Ortiz Auto.",
        "Rosa has seeds and soil.",
        "Drive the van home before dark.",
        "The cabin door locks in a wave.",
        "Hold the yard until it ends.",
        "Type the words on the screen.",
        "Keep your eyes on the screen.",
        "Your fingers rest on the home row.",
        "Nurse Ada stayed at the hospital.",
        "Walk, do not run, Jo said.",
        "The radio finds new places.",
        "Shelf items come back in three days.",
        "Scrap piles give you scrap.",
        "The map shows the road home.",
        "Do not run the saws, Carla.",
        "Fix the van in the garage.",
        "The game saves only at base.",
        "Pick your save on the title screen.",
        "Stay quiet in the dark hall.",
        "Read the sign before the turn.",
        "Use the turn lane to go left.",
        "Press M to see the map.",
        "The food is by the fish tank.",
      ],
    },
    road: {
      to: "To {dest}",
      here: "You made it",
      home: "Home",
      fog: "Fog",
      night: "Night",
      hungry: "Hungry",
      deadEnd: "Dead end",
      noThrough: "No through road",
      closed: "Road closed",
      lot: "Parking lot",
      hint: "Read the sign. It says where each lane goes. A and D change lanes.",
      wrongWay: "Wrong way! That road goes to {place}.",
      wrongStreet: "Wrong way! That is {street}.",
      wrongSide: "Wrong way! {street} does not go through.",
      wrongPlace: "That is {place}. It is not {dest}.",
      wrongLot: "Wrong lot! That is not {dest}.",
      missed: "You drove past {dest}.",
      restart: "Back to {origin}. Try again.",
      routeHead: "The way there",
      routeTake: "Take {street} to {place}.",
      routeTakeStreet: "Take {street}.",
      routeStraight: "Stay in the left lane past side streets and lots. Where roads meet, take the lane the sign gives your road.",
      routeLeft: "{dest} is on the left. Move into the turn lane on the far left.",
      routeRight: "{dest} is on the right. Move into the right lane.",
    },
    // Buildings: level2-places1.js and level2-places2.js. Home: level2-home.js.
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
