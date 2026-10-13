/* Reading level 2 (2nd grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 2 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[2] = {
    level: 2,
    howto: [
      "Your home base is a boarded-up house. It sits at the south end of town. You have one van, and it still runs. A fence runs around the yard. At base you stand in the yard, first person. The cabin is behind you. The van is in the driveway. Time runs in phases. In a calm phase, nothing is at the fence. Go inside to build, or leave in the van. Then a wave comes. Sometimes a few walkers. Sometimes a lot. Sometimes none at all. Walkers claw through the fence. In a wave, the cabin door is locked. So is the van. Hold the yard until the wave ends.",
      "The fence does not fix itself. Every hole stays until you fix it. Stand at the hole and press E. Or use the cabin menu. Each hole costs 1 scrap. You can brace a cracked part for 1 scrap. The Walls room makes the fence stronger. Build Walls up. That rebuilds the whole fence. Later, you can craft traps at the workbench. Set them in the yard or along the fence line. A walker that steps on one gets hurt. A Spike trap needs Walls 2. A Blast trap needs Walls 3. Later you can dig a Well for water. Build a Farm for more food. Build a Lab to make Medical kits. Each outdoor room has its own lot in the yard. Every lot has a painted sign. Walk up to it to read it. It says what the room is. It says what the room needs. It also says why it is still locked.",
      "Pick a place on the map. Only some places are known at first. Notes and the Radio room show you more. The road is drawn for you. Then you drive. Walkers are on the road. Far places and bad places have more walkers. More days means more walkers, too. Still parked at a place? Open the map. You can go back in from there. The place is just as you left it. Walkers you shot stay down. Scrap you took stays taken. Doors stay as you left them. Driving home resets all of that.",
      "At the door, you read a note first. It says how many walkers wait inside. It says where the items are. Then you go in. Every doorway inside is a real door. Press E to open it. Press E again to close it. Walkers cannot open doors. Walkers come for you. Shoot them, or move around them. Grab items from shelves and floors. Each item has a tag. You read it when you pick the item up. Tags stay in your backpack. Scrap piles give scrap. Shelf items come back in 3 days. Caches never do. Find the note inside. Read it. It tells you how to open the locked cache room. The best items are in there. It also tells you which place to try next. Every note goes in your backpack. You can read it again any time. Walls have signs and graffiti, too. Walk up to one to read it. Every building also has a locked stash. Its key is hidden in a different building. To find a key, follow the notes. One note leads to a second note. The second note says where the key is. Bring the key back to its stash. Press E, and the stash opens. Stash items never come back. Your keys show in the backpack. They show in the cabin's stock tab, too. At higher reading levels, each building has more notes. Some of those notes are wrong or out of date.",
      "The garage has a workbench. Build rooms there. Rooms cost items and scrap. Upgrade the van and the gun there. Craft traps there, too. Each one is a short typing round. The words to type show on the screen. A timer runs. Run out of time, and you just try again. Nothing is spent until you finish. The first time, the bench teaches you the home row. That is where your fingers rest. Every finished round moves you up a stage. Single home-row keys come first. Then the other rows. Then words, phrases, and sentences. Repairs need no typing. The garage fixes the van back to full health. You pay 1 scrap for every 3 health missing. It costs at least 5 scrap. Build the Garage room, and repairs are free.",
      "Hurt? Use a Medical kit. One kit heals you back to full health. The backpack carries up to 3 kits. Pack them from storage at the cabin. Inside a building, kits in the van's cargo work too. Drive home with your cargo. At base, cargo goes into storage. You eat one food. The day count goes up. Each day you get home, June's journal gets a page. June keeps the crew's journal. Build the Radio room, and you get more. A radio broadcast comes each day, too. Each player has their own labeled save. There are up to 4 saves. Pick yours on the title screen. The game saves only at base. It saves when you arrive. It saves after every build. It saves after every wave. If the van is wrecked, you load that save. If you go down inside, you load it. If you go down in the yard, you load it. Everything since that save is gone. So plan each trip.",
    ],
    controls: [
      "Road: Aim with the mouse and hold to fire. A and D, or the arrows, slide the van.",
      "Inside and in the yard: W A S D move, the mouse looks, and a click fires. Shift runs. B opens the backpack. P or Esc pauses.",
      "E does it all: E reads notes, opens and closes doors, and opens a cache once you read its note. E opens a stash, too, once you have its key. E leaves a building, enters the cabin, and starts the van. E also fixes a fence hole for 1 scrap.",
      "Traps in the yard: T sets a spike trap and R sets a blast trap, on the ground in front of you or just past the fence.",
      "Guns: More guns are hidden in buildings around town. Walk over one to pick it up, then bring it home to keep it. Press 1 to 5 or Q to switch guns. Hold the mouse to pull back the bow, and let go to shoot. Spend scrap at the cabin to make your guns better.",
      "Backpack: The notes you have read, and your medical kits. Use a kit to heal to full.",
      "Reading: Walk up to a sign to read it. Press E to read a note. Item tags and keys are in the backpack.",
      "Workbench: Building and upgrading is a short typing round. Type what is on the screen before the timer runs out. Out of time just means try again.",
      "Map: Tap a place, then Drive. At a place you can go back inside.",
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
          desc: "Clean water. You heal while you are on foot. More water means faster healing.",
          next: [
            "You slowly heal on foot. Rate 1.",
            "You heal on foot. Rate 2.",
            "You heal fast on foot. Rate 3. You start every building at full health.",
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
          desc: "A hand-dug well beside the cabin. Clean water from deep underground. You heal faster on foot. The Farm and the Lab both need it.",
          next: [
            "Needs the Water room first. Costs 60 scrap. Plus Lumber 2 and Tool kit 1. You heal on foot at rate 2.",
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
      ],
      phrases: [
        "hold fast", "read it", "go in", "get gas", "fix it", "set trap", "run home", "hold on",
        "lock door", "open door", "shut door", "grab food", "pack kit", "use kit", "dig well", "feed hens",
        "plant corn", "drive home", "save game", "find key", "read note", "take scrap", "keep calm", "stay low",
        "walk slow", "turn left", "head east", "go west", "fix fence", "load van", "fill tank", "stay put",
        "look out", "move on", "brace it", "fix hole", "set spike", "make meds", "grow corn", "milk goat",
        "type fast", "home row", "drive north", "dark hall", "night drive", "calm phase", "big wave", "cold cooler",
        "back room", "pump house", "kiln shed", "red key", "stuck latch", "check map", "stay quiet", "hold yard",
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
      ],
    },
    locations: {
      gasngo: {
        blurb: "A small gas station with fuel and a locked storeroom.",
        door: {
          title: "Ruby's Warning",
          text: "Ruby here. At least two walkers inside. One near the back wall. One on the pumps side. More come as days pass. Fuel cans are on the floor, not the shelves. Locked storeroom: on the right, next to the door. Clerk's note: on the counter.",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Note at the Register",
            text: "This is Dev. I ran the register here. The storeroom key is on the hook under the counter. You can open the storeroom now. There is more fuel in there. There is a spool of wire, too.\n\nI am going to Ortiz Auto. It is on the east side of town. The shop is still standing. Rosa is at Greenhouse Row. That is west, past this gas station. She has seeds and soil.",
          },
        },
      },
      grocery: {
        blurb: "A corner store with food and a cold cooler.",
        door: {
          title: "Doc Lin on the Glass",
          text: "Doc Lin. The front shelves are mostly picked over. Leftover food is on the floor, far aisle. Walkers get in through the back loading door. Expect at least two. The walk-in cooler is cold and locked. Manager's note: on the counter at the back wall.",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Trick",
            text: "I am Hana, the store manager. The cooler latch is stuck, not broken. Lift the latch while you pull. It opens every time. So you can open the cooler now. Inside there is food. There is one medical kit, too.\n\nTry Mile 9 Pharmacy next. It is west of here. Last week it still had medicine on the shelves. I hope it still does.",
          },
        },
      },
      hardware: {
        blurb: "A big hardware store with nails, tools, and lumber.",
        door: {
          title: "Mr. Reyes Nailed This Up",
          text: "Mr. Reyes, owner. At least three walkers inside. Two are in the middle aisles. One is near the front door. Nails: shelf near the front. Tools: middle aisle. Lumber: the back. The back room is locked. My note is by the paint shelves.",
        },
        notes: {
          "hardware-paint": {
            title: "The Sticky Door Trick",
            text: "Mr. Reyes again. The back room door just sticks. Lift the handle and push hard. You can open the back room now. I left a water filter in there. There is a second tool kit and some lumber.\n\nNeed more wood? Ridge Lumber is on the east ridge. It has stacks of lumber. Need more filters? The Water Tower is on the west side. More filters are in its pump house.",
          },
        },
      },
      pharmacy: {
        blurb: "A small pharmacy with medical kits and a cabinet room.",
        door: {
          title: "Mr. Okafor's Door Note",
          text: "Mr. Okafor, pharmacist. Medical kits are on the low shelves. Look near the middle of the store. At least three walkers are inside. Most of them stay near the back. The cabinet room is locked. The code is on my note at the counter.",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Room Code",
            text: "Mr. Okafor here. The cabinet room code is 4471. Punch it in and the door opens. You can open the cabinet room now. Inside are two more medical kits. There is a water filter, too.\n\nIf you need more, go north. St. Anne Annex is the hospital in the north hills. It still has medicine and a generator. But be careful. It is the most dangerous place in town.",
          },
        },
      },
      autoshop: {
        blurb: "A repair shop with engine parts and a generator pit.",
        door: {
          title: "Dev's Chalk Note",
          text: "Dev, from the Gas-N-Go. Engine parts: on the workbenches. One on the left wall. One in the back right corner. At least three walkers inside. One wanders by the crates, back left corner. The service pit hatch is locked. Mr. Ortiz's note: by the office.",
        },
        notes: {
          "autoshop-office": {
            title: "Mr. Ortiz on the Hatch",
            text: "This is Mr. Ortiz. The hatch bolt looks stuck. It is not. Twist the bolt to the left. It comes right out. You can open the service pit now. My generator is down in the pit. There are spare parts and a fuel can with it.\n\nSignal Electronics is downtown. It still has wire and radio parts. But it is near the walker crowds. Go in fast, and get out faster.",
          },
        },
      },
      radioshack: {
        blurb: "An electronics store with wire, near the walker crowds.",
        door: {
          title: "Jo's Sign in the Window",
          text: "Jo wrote this. Spools of wire are on the shelves. Check the middle rows. At least four walkers are inside. One stays near the counter on the back wall. The manager's office is locked. The manager's note is on the counter at the back.",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Key Under the Register",
            text: "I am Priya, the manager. The office key is taped under the register. Feel for it. Now you can open my office. Inside are two boxes of radio parts. There is more wire, too.\n\nTwo places are north of downtown. The 4th Precinct is the police station. It has gun parts. Lincoln Middle School has books. Both are worth the drive.",
          },
        },
      },
      garden: {
        blurb: "Greenhouses with seeds, soil, and a locked potting shed.",
        door: {
          title: "Rosa Painted the Gate",
          text: "Rosa, who ran this greenhouse. Seed packets: the bench near the front. Soil bags: stacked in the middle. At least three walkers inside. One stays near the back. The potting shed is locked. My note: potting bench at the back, on the right.",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Watering Can",
            text: "Rosa again. The shed has a padlock. The key is in the watering can. Reach in and grab it. You can open the potting shed now. There are more seeds in the shed. There is a water tank, too.\n\nStation 12 is the fire station. It is north of here. The equipment bay has tools and water tanks. Chief Dunn left his notes there. Read them.",
          },
        },
      },
      police: {
        blurb: "The police station: gun parts, armor, and an armory.",
        door: {
          title: "Sergeant Vega's Notice",
          text: "Sergeant Vega. Gun parts: squad room. Armor plate: the garage room on the right. At least five walkers inside. One big one waits in the garage room. The armory is locked. My note at the front desk has the combination.",
        },
        notes: {
          "police-desk": {
            title: "The Armory Combination",
            text: "Sergeant Vega again. The armory combination is 19-4-33. Spin it slow. Left, right, left. You can open the armory now. There are gun parts inside. There is an armor plate, too. Take what you can carry.\n\nThe Public Library is north of downtown. It has books in its archive room. The librarian stayed. Her name is Mrs. Greer.",
          },
        },
      },
      school: {
        blurb: "A middle school with boxes of books in the classrooms.",
        door: {
          title: "Max and Mia Were Here",
          text: "Max and Mia. Boxes of books: back right classroom and bottom left room. At least four walkers inside. One walks the hallway. The library closet is locked. The key is in the teacher's note. Find it in the back left classroom.",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk",
            text: "I am Ms. Adler. I taught in this room. The library closet key is in my desk. Open the top drawer. You can open the closet now. It holds boxes of books. There is a folder of city maps, too. Keep them dry.\n\nNorthgate Mall is to the north. It has food, medicine, and wire. But the crowds there are the worst in town. Go only if you must.",
          },
        },
      },
      firehouse: {
        blurb: "A fire station with tools and water tanks.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Chief Dunn. Tool kit: the back office. Go through the door behind the desk. Water tank: the truck bay on the right. At least four walkers inside. One is in the truck bay. The equipment bay is locked. My note is on the front desk.",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "Chief Dunn again. Look at the key board behind the desk. Take the red key. It opens the equipment bay lock. You can open the bay now. There is a water tank in there. There is lumber and a set of tools, too.\n\nNeed water filters? Try the Water Tower. It is on the west side of town. The filters are in its pump house. Theo looks after the pumps.",
          },
        },
      },
      hospital: {
        blurb: "The north hills hospital, with medicine and the worst walkers.",
        door: {
          title: "Doc Lin on the Ambulance",
          text: "Doc Lin. Medical kits: the rooms along the top hall. More in the bottom left room. Generator: bottom right room. At least six walkers inside. They stand in the dark rooms. The pharmacy stock room is locked. Nurse's note: top hall.",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada Stayed",
            text: "I am Nurse Ada. I stayed when the others left. The stock room needs a badge. Mine is in the drawer under this station. Take it. You can open the stock room now. There are three medical kits inside. Use them well.\n\nStay quiet in here. The walkers follow sound more than light. Do not run. Do not shout. Walk soft, and they may not turn.",
          },
        },
      },
      watertower: {
        blurb: "The pump building under the tower, full of water filters.",
        door: {
          title: "Theo's Fence Note",
          text: "Theo here. I tend the pumps. Water filters are on the floor by the crates. At least four walkers are inside the pump building. The pump house is locked. My note is on the control panel inside.",
        },
        notes: {
          "watertower-panel": {
            title: "The Key in the Breaker Box",
            text: "Theo again. The pump house key is in the breaker box. Open the gray box on the wall. The key hangs inside. You can open the pump house now. There are filters in there. There is a water tank and some wire, too.\n\nSt. Anne Annex is the hospital. It is north, along the river road. It still has medicine. But it is the most dangerous place in town.",
          },
        },
      },
      lumberyard: {
        blurb: "A lumber yard on the east ridge, stacked with wood.",
        door: {
          title: "Ruby's Spray Paint",
          text: "Ruby again. Lumber is stacked in the racks. Check the middle and the back. At least five walkers are inside. They gather by the loading dock. The kiln shed is locked. The yard boss left a note on the paint rack.",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Clipboard",
            text: "Carla here. I am the yard boss. The kiln shed has a padlock with a code. The code is 2218. You can open the kiln shed now. The lumber in there is dry. There are nails, too.\n\nDo not run the saws. Not even once. The noise brings the whole dock crowd. Carry what you need and go.",
          },
        },
      },
      mall: {
        blurb: "The big north mall, full of goods and walkers.",
        door: {
          title: "Jo's Mall Door Note",
          text: "Jo here. Food, medicine, and wire are spread across the store floor. At least six walkers are inside. They move in one group. The security office is locked. The guard's note is by the paint display.",
        },
        notes: {
          "mall-guard": {
            title: "Luis Left the Code",
            text: "My name is Luis. I was a security guard here. The office code is 0912. Type it on the keypad. You can open the security office now. There are gun parts in there. There are radio parts and a tool kit, too.\n\nThe walkers here move as a group. If you run, they come running at you. So walk. Then most of them stay put. It feels wrong, but it works.",
          },
        },
      },
      library: {
        blurb: "The library north of downtown, with books and maps.",
        door: {
          title: "Mrs. Greer's Book Drop",
          text: "Mrs. Greer, librarian. Boxes of books are in the reading rooms. Those rooms are on both sides. At least five walkers are inside. Two are in the main hall. The archive room is locked. My note is in the back left reading room.",
        },
        notes: {
          "library-desk": {
            title: "The Key in the Dictionary",
            text: "Mrs. Greer again. The archive key is in the big dictionary. It is on this desk. Open the book to the middle. The key is taped there. You can open the archive room now. It has boxes of books. There is a folder of city maps, too.\n\nReading saved this building. The walls are stacked with books. They are the books nobody wanted. They stop the walkers just fine.",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
