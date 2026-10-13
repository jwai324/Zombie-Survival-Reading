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
      "The fence does not fix itself. Every hole stays until you fix it. Stand at the hole and press E. Or use the cabin menu. Each hole costs 1 scrap. You can brace a cracked part for 1 scrap. Every room you build shows up in the yard. It looks bigger and stronger at each level. The Walls room changes the fence itself. Build Walls up. That rebuilds the whole fence, tougher than before. Later, you can craft traps at the workbench. Set them in the yard or along the fence line. A walker that steps on one gets hurt. A Spike trap needs Walls 2. A Blast trap needs Walls 3. Later you can dig a Well for water. Build a Farm for more food. Build a Lab to make Medical kits.",
      "Pick a place on the city map. Only some places are known at first. Notes and the Radio room show you more. The map shows your way there. It lists the way in words, too. Plan your trip on the map. The road will not show you the way. Walkers are on the road. Far places and bad places have more walkers. More days means more walkers, too. Before the road splits, you see a sign. It says where each lane goes. You drive in the left lane. It always goes straight past side streets and parking lots. To turn right, move into the right lane. To turn left, use the turn lane. It opens on the far left. Where roads meet, there is one lane for each road. Each lane has an arrow painted on it. Get in your lane before the white stop line. Change lanes with A and D or the arrow keys. The side buttons work too. Side streets are dead ends. At the end, turn into the lot you picked. Did you take a wrong turn? Did you miss the lot? Then you go back to where you started. You keep your damage, your scrap, and your kills. A small map shows where you are. A flag marks where you are going.",
      "At the door, you read a note first. It says how many walkers wait inside. It says where the items are. Then you go in. The buildings are big, with many rooms. Each corner has a landmark. It might be a fish tank or a fire truck. Notes name the landmarks, so steer by them. Press M. It shows a map of where you have been. Every doorway inside is a real door. Press E to open it. Press E again to close it. Walkers cannot open doors. Walkers come for you. Shoot them, or move around them. Grab items from shelves and floors. Scrap piles give scrap. Shelf items come back in 3 days. Caches never do. Find the note inside. It tells you how to open the locked cache room. The best items are in there. It also tells you which place to try next. Every note goes in your backpack. Still parked at a place? Open the map. You can go back in. It is just as you left it. Driving home resets it.",
      "The garage has a workbench. Build rooms there. Rooms cost items and scrap. Upgrade the van and the gun there. Craft traps there, too. Each one is a short typing round. The words to type show on the screen. A timer runs. Run out of time, and you just try again. Nothing is spent until you finish. The first time, the bench teaches you the home row. That is where your fingers rest. Every finished round moves you up a stage. Single home-row keys come first. Then the other rows. Then words, phrases, and sentences. Repairs need no typing. The garage fixes the van back to full health. You pay 1 scrap for every 3 health missing. It costs at least 5 scrap. Build the Garage room, and repairs are free.",
      "Hurt? Use a Medical kit. One kit heals you back to full health. The backpack carries up to 3 kits. Pack them from storage at the cabin. Inside a building, kits in the van's cargo work too. Drive home with your cargo. At base, cargo goes into storage. You eat one food. The day count goes up. Each player has their own labeled save. There are up to 4 saves. Pick yours on the title screen. The game saves only at base. It saves when you arrive. It saves after every build. It saves after every wave. If the van is wrecked, you load that save. If you go down inside, you load it. If you go down in the yard, you load it. Everything since that save is gone. So plan each trip.",
    ],
    controls: [
      "Road: Aim with the mouse and hold to fire. A and D change lanes. So do the arrow keys and the side buttons. Your left lane goes straight past side streets and lots. To turn right, use the right lane. To turn left, use the turn lane. It is on the far left. Where roads meet, read the sign. Be in your lane before the white line.",
      "Inside and in the yard: W A S D move. The mouse looks. Click to fire. Shift runs. B opens the backpack. In a building, M opens the building map. P or Esc pauses.",
      "E does it all: E reads notes. E opens and closes doors. E opens a cache once you read its note. E leaves a building and enters the cabin. E starts the van. E also fixes a fence hole for 1 scrap.",
      "Traps in the yard: T sets a spike trap. R sets a blast trap. Each goes on the ground in front of you. It can go just past the fence, too.",
      "Backpack: The notes you have read, and your medical kits. Use a kit to heal to full.",
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
      hint: "Read the sign. It says where each lane goes. A and D change lanes. So do the arrows and side buttons.",
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
      routeStraight: "Stay in the left lane past side streets and lots.",
      routeLeft: "{dest} is on the left. Move into the turn lane on the far left.",
      routeRight: "{dest} is on the right. Move into the right lane.",
    },
    locations: {
      gasngo: {
        blurb: "A gas station with a garage, fuel, and a locked storeroom.",
        door: {
          title: "Ruby's Warning",
          text: "Ruby here. At least three walkers inside. One is in the garage, by the car lift. More come as days pass. One fuel can is by the slushie machine. The other is in the garage, by the tire tower. The storeroom is locked. Clerk's note: the counter by the front door.",
        },
        notes: {
          "gasngo-counter": {
            title: "Dev's Note at the Register",
            text: "This is Dev. I ran the register here. The storeroom key is on the hook under this counter. You can open the storeroom now. It has more fuel and a spool of wire.\n\nGo into the back hall. Start at the end by the ice machine. Walk to the far end. The storeroom is the last door before the garage.\n\nI went to Ortiz Auto. It is on the east side of town. The shop still stands. Rosa is at Greenhouse Row, west past here. She has seeds and soil.",
          },
        },
      },
      grocery: {
        blurb: "A corner store with food and a cold cooler.",
        door: {
          title: "Doc Lin on the Glass",
          text: "Doc Lin. The shelves are picked over. Food is on the floor by the fish tank. More is by the freezers on the right. Walkers come in the back loading door, by the forklift. Count on at least three. The cooler is locked. The manager's note is in the office, back left.",
        },
        notes: {
          "grocery-counter": {
            title: "Hana's Cooler Trick",
            text: "I am Hana, the store manager. The cooler latch is stuck, not broken. Lift the latch while you pull. It opens every time. So you can open the cooler now. Inside there is food and one medical kit.\n\nLeave this office. Walk down the hall toward the forklift. The cooler is the next door.\n\nTry Mile 9 Pharmacy next. It is west of here. Last week it still had medicine on the shelves.",
          },
        },
      },
      hardware: {
        blurb: "A big hardware store with nails, tools, and lumber.",
        door: {
          title: "Mr. Reyes Nailed This Up",
          text: "Mr. Reyes, the owner. At least five walkers inside. Two are in the middle aisles. Nails are by the toilet display. Tools are in the middle aisle. Lumber is in the lumber racks at the back. The back room is locked. My note is by the paint mixer, back left.",
        },
        notes: {
          "hardware-paint": {
            title: "The Sticky Door Trick",
            text: "Mr. Reyes again. The back room door just sticks. Lift the handle and push hard. You can open the back room now. It holds a water filter and a second tool kit. There is lumber, too.\n\nTake the side door by the paint mixer. Go past the lumber racks. The back room door is there.\n\nNeed more wood? Ridge Lumber is on the east ridge. It has stacks of lumber. Need more filters? The Water Tower is on the west side. More filters are in its pump house.",
          },
        },
      },
      pharmacy: {
        blurb: "A small pharmacy with medical kits and a cabinet room.",
        door: {
          title: "Mr. Okafor's Door Note",
          text: "Mr. Okafor, pharmacist. One medical kit is by the giant toothbrush. The other is in the middle, where the aisles cross. At least five walkers inside. Most are near the back. The cabinet room is locked. Its code is on a note behind the counter. Get back there at the right end, by the wheelchairs.",
        },
        notes: {
          "pharmacy-counter": {
            title: "The Cabinet Room Code",
            text: "Mr. Okafor here. The cabinet room code is 4471. Punch it in and the door opens. You can open the cabinet room now. Inside are two more medical kits. There is a water filter, too.\n\nThe door is behind this counter. It is in the corner toward the wheelchairs.\n\nNeed more? Go north. St. Anne Annex is the hospital in the north hills. It still has medicine and a generator. But be careful. It is the most dangerous place in town.",
          },
        },
      },
      autoshop: {
        blurb: "A repair shop with engine parts and a generator pit.",
        door: {
          title: "Dev's Chalk Note",
          text: "Dev, from the Gas-N-Go. Engine parts sit on workbenches. One is back right, by the red tool chest. One is in the left bay. At least five walkers inside. One walks the parts room, by the engine crane. The service pit hatch is locked. Note from Mr. Ortiz: the office, behind the waiting room.",
        },
        notes: {
          "autoshop-office": {
            title: "Mr. Ortiz on the Hatch",
            text: "This is Mr. Ortiz. The hatch bolt looks stuck. It is not. Twist the bolt to the left. It comes out. You can open the service pit now. My generator is down in the pit. Spare parts and a fuel can are with it.\n\nThe pit room is in the middle of the shop. The hatch faces the front, toward the oil drums.\n\nSignal Electronics is downtown. It still has wire and radio parts. But it is near the walker crowds. Go in fast, and get out faster.",
          },
        },
      },
      radioshack: {
        blurb: "An electronics store with wire, near the walker crowds.",
        door: {
          title: "Jo's Sign in the Window",
          text: "Jo wrote this. Spools of wire are between the two long middle shelves. One is on the TV wall side. One is on the robot side. At least six walkers inside. One waits by the robot, past the counter's right end. The manager's office is locked. The manager's note is on the back counter.",
        },
        notes: {
          "radioshack-counter": {
            title: "Priya's Key Under the Register",
            text: "I am Priya, the manager. The office key is taped under the register. Feel for it. Now you can open my office. Inside are two boxes of radio parts. There is more wire, too.\n\nMy office door is in the back wall. It is just left of the robot.\n\nTwo places are north of downtown. The 4th Precinct is the police station. It has gun parts. Lincoln Middle School has books. Both are worth the drive.",
          },
        },
      },
      garden: {
        blurb: "Greenhouses with seeds, soil, and a locked potting shed.",
        door: {
          title: "Rosa Painted the Gate",
          text: "Rosa, who ran this greenhouse. Soil: the big greenhouse, with the scarecrow. Seeds: the shop by the gate, near the big gnome. At least five walkers inside. One is at the back of the big greenhouse. The potting shed is locked. My note: potting bench, by the palm tree, back right.",
        },
        notes: {
          "garden-bench": {
            title: "Rosa's Watering Can",
            text: "Rosa again. The shed has a padlock. The key is in the watering can. Reach in and grab it. You can open the potting shed now. There are more seeds in the shed. There is a water tank, too.\n\nLeave the palm tree house. Take the path down to the beehives. The shed door is on that path.\n\nStation 12 is the fire station. It is north of here. Its equipment bay has tools and water tanks.",
          },
        },
      },
      police: {
        blurb: "The police station: gun parts, armor, and an armory.",
        door: {
          title: "Sergeant Vega's Notice",
          text: "Sergeant Vega. Gun parts: the squad room, left of the long hall. Armor plate: the garage, on the right. It is by the riot shields. At least eight walkers inside. A big one waits in the garage. It is by the police bike. The armory is locked. My note at the front desk has the combination.",
        },
        notes: {
          "police-desk": {
            title: "The Armory Combination",
            text: "Sergeant Vega again. The armory combination is 19-4-33. Spin it slow. Left, right, left. You can open the armory now. There are gun parts inside. There is an armor plate, too.\n\nGo to the back hall. Head toward the police bike. The armory is the last door before the garage.\n\nThe Public Library is north of downtown. It has books in its archive room. The librarian stayed. Her name is Mrs. Greer.",
          },
        },
      },
      school: {
        blurb: "A middle school with books and a locked library closet.",
        door: {
          title: "Max and Mia Were Here",
          text: "Max and Mia. Books: the music room, by the drum set. Also the front office, behind the lion statue. At least six walkers inside. One walks the main hallway. The library closet is locked. The key is in the teacher's note. That note is back left, in the science room. It is by the big brain.",
        },
        notes: {
          "school-classroom": {
            title: "Ms. Adler's Desk",
            text: "I am Ms. Adler. I taught in this room. The library closet key is in my desk. Open the top drawer. You can open the closet now. It holds books and a folder of city maps.\n\nWalk the hallway toward the drum set room. The library is next to it. Its closet is in the back corner, drum set side.\n\nNorthgate Mall is to the north. It has food, medicine, and wire. But the crowds there are the worst in town. Go only if you must.",
          },
        },
      },
      firehouse: {
        blurb: "A fire station with tools and water tanks.",
        door: {
          title: "Chief Dunn's Bay Door",
          text: "Chief Dunn. Tool kit: the office behind the watch desk. Water tank: the truck bay, on the right wall. It is past the gear racks. At least six walkers inside. Two are in the truck bay. The equipment bay is locked. My note: the watch desk, by the spotted dog.",
        },
        notes: {
          "firehouse-desk": {
            title: "The Red Key",
            text: "Chief Dunn again. Look at the board of keys by this desk. Take the red key. It opens the equipment bay lock. You can open the bay now. It has a water tank, some lumber, and tools.\n\nGo to the back of the truck bay. The equipment bay is beside the fire truck. It is on the gear racks side.\n\nNeed water filters? Try the Water Tower. It is on the west side of town. The filters are in its pump house. Theo looks after the pumps.",
          },
        },
      },
      hospital: {
        blurb: "The north hills hospital, with medicine and the worst walkers.",
        door: {
          title: "Doc Lin on the Ambulance",
          text: "Doc Lin. Medical kits: a patient room next to the x-ray machine. And by the giant teddy bear, in the gift shop. Generator: the utility room, on the right. At least nine walkers inside. They stand in the dark rooms. The pharmacy stock room is locked. Nurse's note: the nurses' station, in the middle.",
        },
        notes: {
          "hospital-hall": {
            title: "Nurse Ada Stayed",
            text: "I am Nurse Ada. I stayed when the others left. The stock room needs a badge. Mine is in the drawer under this station. Take it. You can open the stock room now. There are three medical kits inside.\n\nThe stock room door is in this room. It is across the walkway from this desk. It is on the angel statue side.\n\nStay quiet in here. The walkers follow sound more than light. Do not run. Do not shout. Walk soft, and they may not turn.",
          },
        },
      },
      watertower: {
        blurb: "The pump building under the tower, full of water filters.",
        door: {
          title: "Theo's Fence Note",
          text: "Theo here. I tend the pumps. One water filter is by the crates. They are near the big red wheel. The other is in the boat workshop, by the rowboat. At least six walkers are inside the pump building. The pump house is locked. My note is on the control panel, back right.",
        },
        notes: {
          "watertower-panel": {
            title: "The Key in the Breaker Box",
            text: "Theo again. The pump house key is in the breaker box. That is the gray box on the wall. You can open the pump house now. It has filters, a water tank, and wire.\n\nGo past the blue pump into the pump hall. The pump house door is at the back, near you. The big red wheel is far from it.\n\nSt. Anne Annex is the hospital. It is north, along the river road. It still has medicine. But it is the most dangerous place in town.",
          },
        },
      },
      lumberyard: {
        blurb: "A lumber yard on the east ridge, stacked with wood.",
        door: {
          title: "Ruby's Spray Paint",
          text: "Ruby again. Lumber is in the long racks in the middle. One more stack is out back, by the log pile. At least eight walkers inside. They gather by the loading dock and the flatbed truck. The kiln shed is locked. The yard boss left a note on a clipboard. It is by the band saw.",
        },
        notes: {
          "lumberyard-rack": {
            title: "Carla's Clipboard",
            text: "Carla here. I am the yard boss. The kiln shed has a padlock with a code. The code is 2218. You can open the kiln shed now. The lumber in there is dry. There are nails, too.\n\nLeave the band saw shop. Walk along the back wall of the rack hall. Go toward the log pile. The kiln shed door is in that wall.\n\nDo not run the saws. Not even once. The noise brings the whole dock crowd. Carry what you need and go.",
          },
        },
      },
      mall: {
        blurb: "The big north mall, full of goods and walkers.",
        door: {
          title: "Jo's Mall Door Note",
          text: "Jo here. Food: the food court, at the back. Medicine: the pharmacy, on the left. Wire: the gadget store, on the right. It is next to the orange tent. At least nine walkers inside. They walk the main hall in a group. The security office is locked. Guard's note: the play area, by the green dino.",
        },
        notes: {
          "mall-guard": {
            title: "Luis Left the Code",
            text: "My name is Luis. I was a security guard here. The office code is 0912. Type it on the keypad. You can open the security office now. There are gun parts in there. There are radio parts and a tool kit, too.\n\nGo to the back of the food court. Take the kitchen door. Turn right. The office is behind the green dino.\n\nThe walkers here come running if you run. So walk. Then most of them stay put. It feels wrong, but it works.",
          },
        },
      },
      library: {
        blurb: "The library north of downtown, with books and maps.",
        door: {
          title: "Mrs. Greer's Book Drop",
          text: "Mrs. Greer, librarian. Books: the stacks on both sides of the main hall. More are in the children's room, by the toy castle. At least eight walkers inside. Two are in the main hall. The archive room is locked. My note is on the reference desk. It is by the giant globe, back left.",
        },
        notes: {
          "library-desk": {
            title: "The Key in the Dictionary",
            text: "Mrs. Greer again. The big dictionary on this desk has the archive key. Open the book to the middle. The key is taped there. You can open the archive room now. It has books and a folder of city maps.\n\nGo to the back end of the main hall. The archive door is there. It sits between two rooms. One has the giant globe. One has the tall clock.\n\nReading saved this building. The walls are stacked with the books nobody wanted.",
          },
        },
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
