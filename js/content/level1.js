/* Reading level 1 (1st grade) text for Zombie Survival.
   Facts come from js/world.js. See docs/TEXT_GUIDE.md.
   Validate with: node tests/validate-text.js 1 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  root.ZSR.TEXT[1] = {
    level: 1,
    howto: [
      "You have one van. It leaves from your home base. First you pick a place on the town map. The map tells you the way there in words. Read the way, and then drive. The road will not show you the way. Walkers fill the road, so keep moving. A small map in the corner shows where you are. A flag on it marks where you are going. The Radio room finds new places for your map.",
      "Each place sits at the end of a drive. A drive is a short road. You leave on it, and it takes you to a corner. That is where the roads meet. You drive in the left lane. It goes straight past side streets. Where two roads meet, the lanes work a new way. Each road gets its own lane. At a place, its drive gets a lane too. Each lane has an arrow on it. Your lane may turn! A sign tells you where each lane goes. Find your road on the sign. Then get in the lane with its arrow. Be in that lane before the white line. Press A or D to change lanes. The arrow keys and the side buttons work too. Side streets are dead ends. At the end, take the lane for your place's drive. It takes you to the door. Some places are at the end of a road. Then just drive to the end. Did you take a wrong turn? Then you go back to where you started. The van keeps its damage. You keep your scrap and your kills.",
      "A note waits at the door of each place. Read it before you go in. It tells you how many walkers wait inside. It tells you where the items are. The buildings are big inside. Each corner has a landmark, like a fish tank. The notes name the landmarks, so use them to find your way. The rooms have signs too. Press M to see a map of where you have been. Each doorway has a real door. Press E to open it or shut it. Walkers cannot open doors. The walls have signs and graffiti. Walk up to one to read it. The things on the shelves come back after 3 days. But the things in a cache never come back.",
      "Find the main note inside. It tells you how to open the cache room. The cache has the best things in the building. The note may name a new place to try, too. At a lock, do just what the note says. A wrong code or a wrong button sets off an alarm. Then walkers pour in, even through the way out. So you cannot leave. A wrong drawer or box can be a deadly trap. A wrong move or a wrong key can jam a lock. Only a crowbar opens a jammed lock. Build crowbars at the workbench. They are in the Traps & tools tab. A crowbar breaks when it pries a lock open. Each building also has a locked stash. Its key is hidden in a different building. Follow the notes to find the key. One note leads you to a second note. The second note says where the key is. It also says which stash the key opens. The key only shows how it looks, so remember the note. At a stash, you pick which key to try. Some stash locks jam on a wrong key. Some snap the wrong key off, and then it is gone. In others, a wrong key just will not turn. The things in a stash never come back. Higher reading levels have more notes. Some of those notes are wrong or out of date. Your notes and keys go in your backpack. The stock tab on the computer lists them too. Each item has a tag. Read the tag when you pick the item up. The tags stay in your backpack. Do you want to go back in? Open the map and pick the place you are at. It stays just as you left it. Are you hurt? Use a medical kit. One kit heals you to full. Your backpack holds 3 kits. Pack them at the cabin.",
      "At home you stand in the yard. Behind you is the cabin. It was the Hollis family's house. You can walk right in. The front door is on the porch. The back door is in the play room. Press E to open or shut each door. In a calm, no walkers come. A calm lasts 4 to 7 minutes. You can build, or you can leave in the van. Then a wave of walkers comes. In a wave, the van cannot leave. Walkers claw holes in the fence. The fence does not fix itself. Stand at a hole and press E to fix it. Each hole costs 1 scrap. Some walkers go for the cabin. They pound on a shut door until it breaks. They walk right in through an open door. They smash windows and climb in. You cannot climb out a broken window. Is a door or window broken? Press E there to fix it for 2 scrap. Walkers that get in wait inside. When you go in, they come out at you. The wave ends when they are all gone. You can set traps, too. Press T or R to set one. A walker that steps on a trap gets hurt. A dinner bell hangs on the porch. Ring it, and the next wave comes right away. Gunshots in a calm bring the wave sooner. The bow makes no sound. The things you build show up in the yard. They get bigger at each level. The Walls room makes the fence stronger.",
      "The computer is in the office. Press E at it to build. Each build is a typing round at the workbench. Type the words you see on the screen. A timer runs while you type. Did time run out? Then just try again. Nothing is spent until you finish. First the bench shows you where your fingers go. Then it counts down from 5. Type with care. A few good rounds move you up a stage. Do you want free practice? Use the typewriter in the play room. Repairs need no typing. Scrap fixes the van back to full. The computer can fix the fence, the doors, and the windows too. Its House tab makes the doors and windows stronger. In a wave, the computer has to wait. So do the radio and the typewriter. The pantry shelves show your food and stock. June's ledger sits by the couch, and so does the radio. You can read past days there again. The big bed heals you to full. But a minute of calm goes by while you rest. So rest in a calm, not close to a wave. The Hollis family left notes on the walls. Walk up close to read them. Each day you come home, June writes in her journal. Build the Radio room, and a radio show comes each day too. Each plot in the yard has a sign. A built room has a plaque. Walk up to one and press E to read it. It says what the room is and what it needs. It also says why it is still locked. Later, you can dig a Well for water. You can build a Farm for food. You can build a Lab to make medical kits. Each player has a save. There are up to 4 saves. Pick yours on the title screen. The game saves only at home base. If you go down, you start again from your last save.",
      "June, Tomas, and Pip are your crew. They live at the cabin with you. Walk up to one and press E to talk. The yard keeps going while you talk. Each talk tells you one useful thing. Sometimes they ask you for a favor. Press E again to say yes or not now. Find the thing in town and bring it home. Then talk to them to hand it over. Each one has trust stars. Talks and favors earn stars. They lose stars when they get hurt. A late favor costs stars too. So does giving up a favor. More stars mean more help. In a calm, Tomas fixes holes in the fence. You still pay 1 scrap for each hole. June patches you up once each calm. Pip calls out the next wave before it comes. Waves send the crew to the office closet. A walker may get in and hurt someone. That costs a medical kit. With no kit, it costs 2 food.",
    ],
    controls: [
      "Road: Aim with the mouse, and hold to shoot. A and D change lanes. So do the arrow keys and the side buttons. Your lane goes straight past side streets. Where roads meet, each road has a lane. A place's drive has a lane too. Your lane may turn! Read the sign, and get in the lane with your arrow. Be in that lane before the white line. To park, take the lane for your place's drive.",
      "Inside and in the yard: W A S D move you. The mouse looks around. Click to shoot. Hold Shift to run. B opens the backpack. M shows a map of the building. P stops the game.",
      "E does it all: E reads notes. E opens and shuts doors. E uses keypads, locks, and drawers. At a stash, E lets you pick a key. E leaves a building and starts the van. E uses the computer and things in the cabin. E rings the dinner bell. E fixes a door or window for 2 scrap. E fixes a fence hole for 1 scrap. E talks to the crew. When they ask a favor, press E again.",
      "Traps in the yard: T sets a spike trap. R sets a blast trap. The trap goes on the ground in front of you. It can go just past the fence, too.",
      "Guns: More guns hide in buildings around town. Walk over a gun to pick it up. Take it home to keep it. Press Q or 1 to 5 to pick a gun. With the bow, hold to pull it back. Let go to shoot. Make your guns better at the computer.",
      "Fishing: Press 6 or Q to hold the fishing pole. Click to cast at the water. When the float dips, click fast! If you pick a gun, the pole stays on the bank. Press E at the pole to pick it up again.",
      "Backpack: It holds your notes, your keys, and your medical kits. Use a kit to heal to full.",
      "Reading: A wall sign shows up when you walk to it. So do the notes on the cabin walls. A yard sign needs E. E reads notes, too. Item tags and keys stay in the backpack.",
      "Computer: Press E at it to build. Each build is a typing round. Type what you see, and beat the timer. Did time run out? Then try again.",
      "Map: Tap a place, and read the way there. Then tap Drive. When you are parked at a place, you can go back in.",
    ],
    road: {
      to: "To {dest}",
      here: "You are here",
      home: "Home",
      fog: "Fog",
      night: "Night",
      hungry: "Hungry",
      deadEnd: "Dead end",
      noThrough: "No way through",
      closed: "Road closed",
      lot: "Parking lot",
      hint: "Read the sign. It shows where each lane goes. Press A or D to change lanes.",
      wrongWay: "Wrong way! That road goes to {place}.",
      wrongStreet: "Wrong way! That street is {street}.",
      wrongSide: "Wrong way! {street} is a dead end.",
      wrongPlace: "That is {place}. It is not {dest}.",
      wrongLot: "This is the wrong lot. It is not {dest}.",
      wrongTitle: "Wrong way",
      tryAgain: "Try again",
      townMap: "Town map",
      goBack: "Go back to {origin}",
      routeHead: "The way there",
      routeTake: "Take {street} to {place}.",
      routeTakeStreet: "Take {street}.",
      routeStraight: "Stay in your lane past side streets. Where roads meet, read the sign. Then get in the lane for your road.",
      routeDrive: "At {dest}, take the lane for its drive. It goes to the door.",
      routeEnd: "{dest} is at the end of {street}. Drive to the end.",
    },
    base: {
      intro: "This is home base. The game saves here, and only here. Hold the fence when the walkers come. The things you build show up in the yard.",
      rooms: {
        walls: {
          desc: "Walls put boards and plates on the fence and the van. The fence starts at 150 strength. Each level makes the fence stronger. It makes the van and you tougher, too.",
          next: [
            "The fence strength goes up to 240. The van gets 20 more health. You get 20 more health on foot.",
            "The fence strength goes up to 360. The van gets 40 more health. You get 40 more health on foot.",
            "The fence strength goes up to 520. The van gets 60 more health. You get 60 more health on foot. It needs an armor plate.",
          ],
        },
        garage: {
          desc: "The Garage is a work bay for the van and its gun. Fixing the van costs 1 scrap for every 3 health it lost. It always costs at least 5 scrap. Build the Garage, and the fixes are free.",
          next: [
            "The van and its gun can go up to tier 3. Fixing the van at base is free.",
            "The van and its gun can go up to tier 4. Fixing the van at base is free.",
            "The van and its gun can go up to tier 5. Fixing the van at base is free. It needs gun parts.",
          ],
        },
        power: {
          desc: "The Power room brings fuel, wire, and lights to the base. Later it gets a generator. It shows you how dangerous each place is.",
          next: [
            "The map shows how dangerous each place is.",
            "The map shows the danger at each place. You find one supply crate on each drive.",
            "The map shows the danger at each place. You find two supply crates on each drive. The headlights cut through night and fog.",
          ],
        },
        water: {
          desc: "The Water room gives you clean water. You heal faster when you are in the yard.",
          next: [
            "You heal a little while you are in the yard.",
            "You heal faster while you are in the yard.",
            "You heal fast while you are in the yard. You start each building at full health.",
          ],
        },
        garden: {
          desc: "The Garden grows food. Each trip in the van eats one food. When there is no food, the van is weak.",
          next: [
            "The garden grows one food each day.",
            "The garden grows two food each day.",
            "The garden grows three food each day. It needs a water tank.",
          ],
        },
        radio: {
          desc: "The Radio room picks up voices from the town. The voices tell you where new places are.",
          next: [
            "It shows up to three new places on the map.",
            "It shows every place on the map.",
            "It shows every place on the map. It also shows which places still have items.",
          ],
        },
        medbay: {
          desc: "The Medbay is where you patch up. Walker hits hurt you less.",
          next: [
            "Walker hits hurt you less when you are on foot.",
            "Walker hits hurt you less. If you go down, you get back up once on each trip.",
            "Walker hits hurt you even less. You get back up once on each trip. The van takes less damage, too.",
          ],
        },
        archive: {
          desc: "The Archive keeps notes and maps in order. The map learns from what you read.",
          next: [
            "Read the door note at a place. Then the map shows what is still there.",
            "Read a door note, and the map shows what is still there. The map also marks which places have a cache.",
            "The map shows what is left at every place. It marks the caches, too.",
          ],
        },
        well: {
          desc: "The Well is dug by hand next to the cabin. It brings clean water up from deep down. You heal faster in the yard. The Farm and the Lab both need it.",
          next: [
            "You need the Water room first. It costs 60 scrap. You also need Lumber 2 and Tool kit 1. You heal in the yard at rate 2.",
            "It costs 100 scrap. You also need Lumber 2 and Engine parts 1. You need Water filter 1, too. The heal rate goes up to 3.",
            "It costs 150 scrap. You also need Water tank 1 and Engine parts 1. You need Spool of wire 1, too. The heal rate goes up to 4. You start each building at full health.",
          ],
        },
        farm: {
          desc: "The Farm is farmland next to the yard. First it grows crops, and later it keeps hens and goats. It gives you more food each day. Its food adds to the food from the Garden.",
          next: [
            "A crop field of corn and beans goes in. It needs Garden 2 and the Well first. It costs 80 scrap. You also need Seed packets 2 and Bag of soil 2. You need Lumber 1, too. It grows 2 food a day.",
            "A chicken coop goes in. It needs Well 2 first. It costs 120 scrap. You also need Lumber 2 and Spool of wire 1. You need Seed packets 1, too. The farm gives 4 food a day.",
            "A goat pen goes in. It needs Well 3 first. It costs 180 scrap. You also need Lumber 3 and Spool of wire 2. You need Water tank 1, too. The farm gives 6 food a day.",
          ],
        },
        lab: {
          desc: "The Lab makes medicine at home. A still is a pot that cooks herbs into medicine. New medical kits go into storage when a new day starts.",
          next: [
            "Herb beds and a still go in. It needs Medbay 1 and the Well first. It costs 80 scrap. You also need Medical kit 1 and Box of books 1. You need Seed packets 1, too. It makes 1 Medical kit every 2 days.",
            "A clean bench goes in. It needs Well 2 first. It costs 120 scrap. You also need Water filter 1 and Box of books 1. You need Spool of wire 1, too. It makes 1 Medical kit a day.",
            "A powered lab goes in. It needs Medbay 2 first. It costs 180 scrap. You also need Generator 1 and Medical kit 2. You need Box of books 1, too. It makes 2 Medical kits a day.",
          ],
        },
      },
      traps: {
        spike: {
          desc: "This is the Spike trap. You can make it once Walls is at level 2. It costs 10 scrap. You also need Lumber 1 and Box of nails 1. Press T to set it in front of you. It can go just past the fence, too. A walker that steps on it takes 45 damage. One trap lasts for 3 walkers.",
        },
        blast: {
          desc: "This is the Blast trap. You can make it once Walls is at level 3. It costs 25 scrap. You also need Fuel can 1 and Spool of wire 1. Press R to set it. It blows up one time. Every walker close to it takes 120 damage. It lasts for 1 use, and then it is gone.",
        },
      },
      bench: {
        intro: "This is the garage workbench. You build, upgrade, and make things here by typing. Nothing is spent until you finish.",
      },
      tools: {
        crowbar: {
          desc: "A crowbar pries open one jammed lock. It works on a cache door or a stash. The crowbar breaks when it does that. Build one here for 20 scrap. You carry all your crowbars on every trip.",
        },
      },
    },
    typing: {
      fingers: [
        "Look at the keyboard. Find the middle row of letters. That is the home row. Your fingers rest there. They go back there each time.",
        "Left hand: A S D F. Right hand: J K L. Right pinky: the ; key. That key is the semicolon. Feel F and J. Each one has a small bump. The bumps tell you where home is. No need to look down.",
        "Both thumbs rest on the space bar. Tap it with a thumb. That makes a space.",
        "Each finger owns a few keys. It reaches up or down. Then it comes back home. Keep your eyes on the screen. Not on your hands. The words will come.",
      ],
      words: [
        "van", "gas", "map", "key", "door", "fuel", "note", "nail", "wood", "wire",
        "seed", "soil", "meds", "kit", "gun", "book", "food", "well", "farm", "lab",
        "yard", "wave", "calm", "hold", "run", "walk", "hide", "pump", "tank", "trap",
        "hole", "home", "base", "shed", "road", "hill", "town", "mall", "shop", "lock",
        "code", "dark", "dusk", "rust", "bolt", "goat", "hen", "corn", "bean", "herb",
        "tool", "part", "box", "bag", "pack", "aim", "read", "sign", "gate", "wall",
        "roof", "step", "tile", "dock", "rope", "tape", "help", "safe", "save", "wait",
        "keep", "fix", "dig", "lane", "lot",
      ],
      phrases: [
        "hold fast", "read it", "go in", "get gas", "fix it", "set trap", "run home", "hold on",
        "lock door", "open door", "shut door", "grab food", "pack kit", "use kit", "dig well", "feed hens",
        "plant corn", "drive home", "save game", "find key", "read note", "take scrap", "keep calm", "stay low",
        "walk slow", "turn left", "head east", "go west", "pick up", "fix fence", "load van", "fill tank",
        "stay put", "look out", "move on", "dead end", "left lane", "turn right", "read sign",
      ],
      sentences: [
        "Read the note first.",
        "The door is shut.",
        "Press E at the door.",
        "Hold the fence, Max.",
        "Gas is on the floor.",
        "Walkers come in waves.",
        "Fix the hole with scrap.",
        "The well gives clean water.",
        "Pack a kit, then go.",
        "Dev went east to Ortiz Auto.",
        "Rosa has seeds and soil.",
        "Drive the van home now.",
        "The bell calls the walkers.",
        "Set a trap by the fence.",
        "Stay quiet in the hall.",
        "The radio finds new places.",
        "Ruby left a note.",
        "Do not run the saws.",
        "Scrap piles give scrap.",
        "The map shows the road.",
        "Walk, do not run.",
        "Nurse Ada is still here.",
        "The hens lay eggs.",
        "Get in the turn lane.",
        "Read the sign, then turn.",
        "Press M for the map.",
      ],
    },
    // Buildings: level1-places1.js and level1-places2.js. Home: level1-home.js.
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
