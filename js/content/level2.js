/* Reading level 2 (2nd grade) text for Zombie Survival.
   Facts live in js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 2 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[2] = {
    level: 2,
    howto: [
      "The Fall came months ago. Walkers took over this river town. Most people ran, hid, or headed north. You stayed with your crew and one old van. It is the last working van in town. One night, it rolled into a quiet yard. The tank was down to its last drops of fuel. Tomas talked to the engine the whole way there. That first night, you took the first watch. Nothing came. June wrote that on the first page of her ledger.",
      "The yard sits at the south end of town. Behind it stands a big family house. A carved sign by the door calls it the cabin. It was the Hollis family's home. Kate drew maps for the county. Dan hung the dinner bell on the porch. Their kids were Gus, Finn, and Lucy. Their dog was named Biscuit. The family left to join the River Convoy. The convoy plans to head north by the river road. Kate left a note on the fridge before they went. It says the cabin is yours if you are kind. It also asks you to keep her garden going. The Hollises left with a plan, so they may return. For now, the cabin is your home base. It is the only place the game saves. If you go down, you return to your last save.",
      "June, Tomas, and Pip are your crew. June is in her sixties. She used to be a school gardener. She writes about each day in a green ledger. June is not sure she wants to leave the cabin. Tomas is seventeen, and his dad taught him engines. He keeps the van alive with wire and hard work. Pip is eleven and asks the hardest questions. Pip wants a dog more than anything. Once you build the radio, Pip will run it. Pip will list every voice heard on the air. Walk up to one of them to talk. Each talk gives you something useful. Sometimes they ask you for a favor. Bring what they need home from town. Each of them has trust stars. Talks and favors earn stars. More stars mean more help.",
      "Your crew lives among the Hollis family's things now. Tomas sleeps in Gus's old room. The sign on its door still says KEEP OUT. Pip's height is marked on the living room door frame. The mark sits between Finn's and Gus's. Pip wants to build the treehouse Finn drew. June's ledger sits by the radio in the dining room. The family left notes on the walls of every room. Walk up close to read them. They tell you who lived here, and what they hoped.",
      "People still live out in the town. They hide in shops, schools, and towers. A scout is searching for her younger brother. A doctor carries medicine from place to place. Two twins are looking for their teacher. These people leave notes for whoever comes next. So read every note you find. The door note tells you how many walkers wait inside. Other notes tell you where the good things are. One note explains how to open the cache room. Do exactly what it says. A wrong code sets off an alarm. Then walkers pour in, and you cannot leave. A wrong move can jam a lock. Some notes are old, and some are wrong. Read to the end before you trust one. The people out there made a rule together. Take what you need, and leave the rest. They locked the best supplies away in stashes. Every building has one stash. Its key is hidden in a different building. Only the notes tell you where. One note leads you to a second note. The second note says where the key is hidden. It also says which stash the key opens. People who read find the keys. People who smash and grab never do.",
      "The van is how you reach the town. You choose a place on the town map. The map tells you the way there in words. The road itself will not show you the way. Signs tell you where each lane goes. Where roads meet, your own lane may turn! Find your road on the sign early. Get into its lane before the white line. Did you take a wrong turn? Then the drive starts over.",
      "Home is never safe for long. In a calm, no walkers come. You can build, or you can drive to town. Then a wave of walkers arrives. They claw holes in the fence. Some of them go for the cabin. A hole stays open until you fix it. Every fix costs scrap. Dan's dinner bell still hangs on the porch. It used to call the family to supper. Now the bell calls walkers instead. Ring it only when you are ready. You build by typing at the workbench. Kate left a chalkboard note in the play room. It says to keep your fingers on the home row. Everything you build makes the cabin stronger.",
    ],
    controls: [
      "Road: Aim with the mouse and hold to fire. A and D change lanes. So do the arrow keys and the side buttons. Your left lane goes straight past side streets. Where roads meet, each road has its own lane. So does the drive of a place there. Yours may turn. Read the sign and match the arrow. Be in that lane before the white line. To park, take your place's drive.",
      "Inside and in the yard: W A S D move. The mouse looks. Click to fire. Shift runs. B opens the backpack. In a building, M opens the building map. P or Esc pauses.",
      "E does it all: E reads notes. E opens and closes doors, the cabin's too. E uses keypads, locks, and drawers. At a stash, E lets you try a key. E leaves a building and starts the van. E uses the computer and the things in the cabin. E rings the dinner bell. E fixes a broken door or window for 2 scrap. E also fixes a fence hole for 1 scrap. E talks to the crew: June, Tomas, and Pip. When one asks a favor, press E again.",
      "Traps in the yard: T sets a spike trap. R sets a blast trap. Each goes on the ground in front of you. It can go just past the fence, too.",
      "Guns: More guns are hidden in buildings around town. Walk over one to pick it up. Bring it home to keep it. Press 1 to 5 or Q to switch guns. Hold the mouse to pull back the bow. Let go to shoot. Spend scrap at the computer to make your guns better.",
      "Fishing: 6 or Q holds the pole. Click to cast at the water. When the float dips, click fast. Pick a gun with the line out, and the pole stays propped on the bank. E picks it up again.",
      "Backpack: The notes you have read, your keys, item tags, and your medical kits. Use a kit to heal to full.",
      "Reading: Walk up to a sign to read it. The notes on the cabin walls work the same way. Press E to read a note. Item tags and keys are in the backpack.",
      "Computer: Press E at it to build and upgrade. Each one is a short typing round. Type what is on the screen. Beat the timer. Out of time just means try again.",
      "Map: Tap a place and read the way there. Then tap Drive. At a place you can go back inside.",
    ],
    base: {
      intro: "This is home base. It is the only place the game saves. Build up the rooms, then head back out.",
      rooms: {
        walls: {
          desc: "Boards and plates on the fence and the van. The fence starts at strength 150. Walkers claw it down in a wave. Better walls mean a stronger fence. They mean more health, too. For the van, and for you on foot.",
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
          desc: "Clean water. You heal faster while you are in the yard. More water means faster healing.",
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
          desc: "A radio tower in the yard. It is wired to the radio in the dining room. It picks up voices from across town. They tell you where places are.",
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
      tools: {
        crowbar: {
          desc: "A crowbar pries open one jammed lock, a cache door or a stash. It breaks doing it. Build it at the workbench for 20 scrap. You carry all you have on every trip.",
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
        "The dinner bell calls the next wave.",
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
      wrongTitle: "Wrong way",
      tryAgain: "Try again",
      townMap: "Town map",
      goBack: "Go back to {origin}",
      routeHead: "The way there",
      routeTake: "Take {street} to {place}.",
      routeTakeStreet: "Take {street}.",
      routeStraight: "Stay in your left lane past side streets. Where roads meet, get in the lane for your road. The sign shows it.",
      routeDrive: "At {dest}, take the lane for its drive. It goes to the door.",
      routeEnd: "{dest} is at the end of {street}. Drive to the end of it.",
    },
    // Buildings: level2-places1.js and level2-places2.js. Home: level2-home.js.
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
