/* Reading level 3: places, part 1 (gasngo, grocery, hardware, pharmacy, autoshop, radioshack, garden). Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    gasngo: {
      blurb: "A small gas station on the south road, with fuel on the floor and a locked storeroom.",
      door: {
        title: "Ruby's Warning on the Door",
        text: "Ruby. Read this before you open the door.\n\nAt least three walkers are inside. One stands in the garage, by the car lift. More come as the days pass, so do not wait around. Get in, and get out.\n\nThe fuel cans are on the floor, not on the shelves. One is by the slushie machine, on your left as you walk in. The other is in the garage, by the tire tower. The storeroom is locked. Do not kick it. The clerk kept a note on the counter, right by the front door. It tells you how to get in.",
      },
      notes: {
        "gasngo-counter": {
          title: "Dev's Note at the Register",
          text: "This is Dev. I was the clerk here, the night guy who ran the register. If you are reading this, you got past the walkers. Nice work.\n\nThe storeroom key is in the {pick} of this counter, right under this note. That key opens the storeroom door. Open that drawer and no other one. My sister Ruby rigged the other two drawers with a bomb trap for looters. Open the wrong one, and it kills you. I mean it.\n\nThere is more fuel in the storeroom, and a spool of wire.\n\nGo through the gap at the back of the shop into the back hall. The ice machine is in the break room at one end. Walk the other way, all the way down. The storeroom is the last door before the garage.\n\nI am going to Ortiz Auto, on the east side of town. The shop is still standing, and Mr. Ortiz knows trucks.\n\nNeed to grow food? Rosa is at Greenhouse Row. Go west, past this gas station. She has seeds and soil, and she shares.",
        },
        "gasngo-trail1": {
          title: "Ruby Picks Up the Trail",
          text: "Ruby again. I came back here today. I had to see this place one more time.\n\nDev is my little brother. His note was by the register, right where he left it. He made it out. He went east to Ortiz Auto to fix a truck. So I am going east after him. I leave at first light, and I travel light.\n\nI asked Jo to put it on the radio. Every night she will say that Ruby is looking for Dev. If you hear him, or see him, tell him to stay put. Tell him I am coming.\n\nOne more thing. I left a second note for you. It is on the floor behind the counter, near the register. That is across the shop from the slushie machine. Read it. It is about the key ring, and it matters more than this one.",
        },
        "gasngo-trail2": {
          title: "For Anyone Who Reads This Far",
          text: "Ruby here. You read this far. Good. That is the whole point.\n\nJo and I made a rule: take what you need, leave the rest. Some people smash and grab everything. So every stash in town is locked now. Its key is hidden in another building, with a note that says where. Only people who read can find them. We call it the key ring.\n\nHere is your link in the ring. A key lies on the floor in the garage, beside the tire tower. It is a small brass key on a green plastic tag. It opens the staff locker at Corner Grocery, east of here.\n\nHana, the grocery manager, gave me this key. That was the first day of the ring. Do not let her down.\n\nOne warning. The staff locker has a fussy lock. The wrong key jams it, and after that only a crowbar opens it.",
        },
        "gasngo-dead1": {
          title: "Dev's Last To-Do List",
          text: "A to-do list lies on the break room floor, by the ice machine. It is in Dev's messy handwriting. The date at the top is his last shift before the Fall.\n\nDEV, FRIDAY NIGHT.\nMop the floor. All of it, not just the middle.\nFill the coffee. Both pots, because the truck drivers get grumpy.\nFix the ice machine. It sounds like a sick goose again.\n\nAt the bottom, in pen pressed in hard: Call Ruby back! He underlined it twice. Beside it: about the news, some sickness across the river. Probably nothing.\n\nNothing on the list is crossed off. Not one thing. The pen is still clipped to the paper. The mop bucket stands by the shelf, dry and dusty now. The coffee pots still sit on the burner, empty and stained.\n\nWhatever happened that night, it happened before Dev got to any of it. You wonder if he ever called her back. You hope he did.",
        },
        "gasngo-dead2": {
          title: "A Scrap of Receipt",
          text: "Storeroom key is in the {decoyPick} of the counter. Just reach in and grab it. Easy.\n\nThat is what the note says. It is written in shaky pencil on a scrap of receipt. It lies in the back hall, outside the old safe room door. There is no name on it.\n\nIt sounds helpful, and it was true once. Whoever wrote it knew this shop. Now turn the receipt over. The date on the front is from the first week of the Fall. That was before Ruby set her traps in the counter drawers. Back then, any drawer was safe. Now only one is.\n\nRuby rigged the other drawers to stop looters. Open the wrong one, and you will not walk out. So do not trust a scrap with no name. Dev's note on the counter says which drawer is safe now. Dev was the clerk here, and he knows.",
        },
      },
      signs: {
        "gasngo-sign1": { title: "Faded Store Sign", text: "Gas-N-Go. Always open. The red letters are faded by the sun. Someone crossed out \"always\" and wrote \"not\" above it in black." },
        "gasngo-sign2": { title: "Red Spray Paint", text: "A big red R by the front door, sprayed fast. Under it, a 3. Ruby counted three walkers in here. Smaller, below that: DON'T RUN. WALK AND LOOK." },
        "gasngo-sign3": { title: "Chalk by the Safe Room", text: "By the old safe room door: a chalk circle. A small key is drawn inside. This lock's key is hidden in another building. Find the note that says where." },
        "gasngo-sign4": { title: "STAFF ONLY", text: "STAFF ONLY, on a metal sign beside the storeroom door. Under it, in Dev's quick pen: Key in the counter drawers. Read my note before you open one!" },
      },
      key: { name: "Small brass key, green tag", tag: "\"Leave some for the next one.\" The green plastic tag is scratched and bent at one corner. The small brass key is worn shiny at the tip. Someone has used it a lot." },
    },

    grocery: {
      blurb: "A corner store with leftover food on the floor and a cold walk-in cooler.",
      door: {
        title: "Doc Lin on the Glass",
        text: "Doc Lin, written in marker on this glass. I pass through here often, so listen.\n\nThe shelves are picked over. Do not waste time on them. The food that is left is on the floor. Look by the fish tank, and by the freezers on the right.\n\nWalkers get in through the loading door at the back, by the forklift. It does not shut anymore. Count on at least three inside.\n\nThe walk-in cooler still stays cold, and it is locked. The manager's note is in the office, at the back on the left. Read it, and it tells you how to open the cooler.",
      },
      notes: {
        "grocery-counter": {
          title: "Hana's Cooler Trick",
          text: "I am Hana, the store manager. I ran this place for six years, and I still do, more or less.\n\nThe walk-in cooler is not broken. The latch just sticks. To open it, {moves}, in that order. Do it slowly, one step at a time. The door will swing open with a little sigh of cold air.\n\nDo not work the latch any other way. If you do, it jams tight. After that, only a crowbar will open the cooler.\n\nStep out of this office into the back hall. Turn toward the forklift. The cooler is the very next door down the hall.\n\nInside there is food, and there is one medical kit. The cold keeps it all good. Close the door behind you, or the cold leaks out.\n\nWhen you need more medicine, go to Mile 9 Pharmacy. It is west of here. Last week it still had medicine on its shelves.\n\nTake what you need. Leave the rest for the next person. That is the rule here.",
        },
        "grocery-trail1": {
          title: "Doc Lin's Medicine Run",
          text: "Doc Lin again. If you found this, you are by the checkout lanes, so stay low.\n\nI am a doctor, and I carry medicine across town. It starts here. From here I go to the pharmacy, and then north to St. Anne Annex. Nurse Ada stayed at St. Anne when the others left. She keeps the generator going, and she keeps the records.\n\nSome of her medicine has to stay cold. The cooler here keeps Ada's medicine cold until I can carry it. Hana never asks for anything back.\n\nI have not reached Ada for weeks. The road into the hills is full of walkers. Some days I get halfway. I keep trying anyway. She is waiting, and so are her patients.\n\nHana left a note for the next reader. It is out on the loading dock, beside the forklift. Go read it.",
        },
        "grocery-trail2": {
          title: "Hana's Link in the Ring",
          text: "Hana here, out on the loading dock, where nobody looks. You looked. Good.\n\nYou have heard of the key ring by now. Every stash in town is locked. Its key waits in another building, with a note like this one.\n\nHere is the key I keep for the ring. It lies on the floor beside the gumball machine, near the front of the store. It is a long silver key on a red string. The string is long enough to wear around your neck.\n\nThat key opens the narcotics safe at Mile 9 Pharmacy, west of here. The safe holds medicine, so be careful with it. It has an old lock that bites. The wrong key snaps off inside it and is gone for good.\n\nMr. Okafor gave me this key for the ring. He said it was because I never took more than I needed. Do the same, please.",
        },
        "grocery-dead1": {
          title: "A Kid's Shopping List",
          text: "A shopping list is folded into a tiny square. The paper is lined, torn from a school notebook. The writing is big and round, in purple pen. A kid wrote this.\n\nSHOPPING LIST.\nPeanut butter, the crunchy kind.\nBatteries, for the flashlight and the game.\nDog food.\n\nA grown-up wrote next to it in blue ink: we don't have a dog.\n\nUnder that, in purple pen again, pressed hard: yet. Someone drew a little dog in the corner, with a wagging tail. It is not a good drawing, but it is a happy one.\n\nSomeone kept this list. It was tucked between two cans, like a bookmark. Maybe the kid will come back for it. Maybe the kid has a dog by now. You hope so. Out here, a dog would be good company, and a good set of ears.",
        },
        "grocery-dead2": {
          title: "Cardboard by the Door",
          text: "Cooler trick: {decoyMoves}. Works every time!\n\nThe words are on a torn flap of cardboard, in thick black marker. It lies on the floor just inside the front door. Anyone walking in would see it first. There is no name on it.\n\nIt sounds like a real tip, and once it was. Whoever wrote it knew this store. But look at the cooler door when you get there. The latch is shiny and new. The screws around it are bright, with no rust at all. Hana put in a new latch, and this trick was for the old one.\n\nWork the new latch the wrong way, and it jams tight. Then you need a crowbar to get in. Hana's note in the office has the trick that works now. Trust the manager over a flap of cardboard.",
        },
      },
      signs: {
        "grocery-sign1": { title: "Store Sign", text: "Corner Grocery. Fresh bread every morning! The printed letters are cheerful and orange. The bread rack under the sign is empty. Not even crumbs are left." },
        "grocery-sign2": { title: "Black Marker", text: "Black marker, big and fast. THE LOADING DOOR AT THE BACK DOESN'T SHUT. Under it, underlined twice: watch your back. The ink has run." },
        "grocery-sign3": { title: "Sale Sign", text: "SALE! Soup, two cans for the price of one. The price tag is still stuck on. Someone added in pen: deal still stands, everything is free now." },
        "grocery-sign4": { title: "Cooler Door Sign", text: "WALK-IN COOLER. Keep the door closed. Under it, in Hana's neat writing: The trick is in my note in the office. Do it any other way, and the latch jams." },
      },
      key: { name: "Long silver key, red string", tag: "\"Count what you take.\" The long silver key hangs from a red string. The string is tied in a tight double knot. It will not slip off." },
    },

    hardware: {
      blurb: "Reyes Hardware, a big store with nails, tools, lumber, and a locked back room.",
      door: {
        title: "Mr. Reyes Nailed This Up",
        text: "This is Mr. Reyes, the owner. This is my store, and I want it back someday. So be careful in there.\n\nAt least five walkers are inside. Two of them stay in the middle aisles.\n\nNails are by the toilet display, near the front on your left. Watch your step, because some are loose on the floor. Tools are in the middle aisle. Lumber is in the lumber racks at the back.\n\nThe back room is locked. My note is by the paint mixer, in the back left corner. It tells you the trick for that door.",
      },
      notes: {
        "hardware-paint": {
          title: "The Sticking Door",
          text: "Mr. Reyes again. You found my paint mixer, so you can read. Good.\n\nThe back room door sticks in its frame. It has stuck for twenty years. To open it, push it {move1}, then {move2}. Use your shoulder, and push hard each time. You will hear a pop when it gives.\n\nPush it any other way, and the door jams for good. After that, only a crowbar opens it. So read this twice before you push.\n\nTake the side door by the paint mixer. It opens into the lumber racks. Walk past the racks, and the back room door is right there.\n\nInside I left a water filter, a second tool kit, and lumber. The lumber is good pine.\n\nNeed more wood? Go to Ridge Lumber, on the east ridge. Carla runs the yard. Need more filters? Try the Water Tower on the west side. Its pump house has more filters.",
        },
        "hardware-trail1": {
          title: "Where the Keys Were Cut",
          text: "Mr. Reyes here. People ask me how the key ring started. It started right here, in my store.\n\nRuby and Jo came in one cold morning. They had an idea. Lock every stash in town, and hide each key in some other building. Leave a note that says where. Then only people who read would find the good stuff.\n\nI liked it. I have a key machine in this store. I know how to use it. So I cut the first keys on that machine. Fifteen keys for fifteen stashes. It took me two whole days. My hands still ache when I think of it. I am proud of every one.\n\nThe rule is simple. No key stays in the building it opens. Each one waits somewhere else, with a note.\n\nMy other note is in the paint department, near the paint mixer. Go find it.",
        },
        "hardware-trail2": {
          title: "The Very First Key",
          text: "Mr. Reyes, by the paint mixer. You walked the whole store to get here. That is the kind of reader I trust.\n\nA key lies on the floor beside the toilet display, against the wall. It is a copper key with a leaf scratched into its head. I scratched that leaf myself. Its head is round, and the leaf points up.\n\nThat key opens the seed vault at Greenhouse Row. Greenhouse Row is far west, across town. Rosa runs it, and she grows food for half this town.\n\nThis was the very first key I cut for the ring. Rosa asked me to keep it here. She said a hardware store is the last place a seed thief would look. She was right. People come here for hammers, not beans.\n\nThe seed vault has a plain lock. A wrong key just will not turn in it.",
        },
        "hardware-dead1": {
          title: "Who Borrowed What",
          text: "BORROWED TOOLS. BRING THEM BACK!\n\nThe list is nailed to a post in the lumber racks, in Mr. Reyes's big square letters. The paper is curled from damp. Some names are old and faded. Three are newer.\n\nCarla: one long saw. She said a week.\nChief Dunn: two ladders. For the station roof, he says.\nTheo: one pipe wrench. Never returned. Again.\n\nThe word again is underlined three times, hard enough to tear the paper. Beside Theo's name, Mr. Reyes drew a tiny wrench with a sad face.\n\nUnder the list, in smaller writing: If you see these people, remind them. Nicely. Then remind them again.\n\nMost of the tool hooks near the list are empty. Half the town owes Mr. Reyes a tool. Nails are not on the list. Nobody borrows nails. They just take them.",
        },
        "hardware-dead2": {
          title: "A Paint Chip Tip",
          text: "Psst. Here is a tip. The back room door opens if you push it {decoyMove1}, then {decoyMove2}. I did it myself. It works.\n\nThe note is in pencil, on the back of a paint chip card. It lies in the paint department, outside the paint vault door. There is no name on it.\n\nIt sounds sure of itself, and maybe it worked once. But read the bottom corner. In smaller pencil, the same hand wrote a date. That date is from before the big storm. The storm bent the back room door frame. Since then, the door needs a new way.\n\nPush it the old way now, and the door jams for good. Then only a crowbar gets you in. Mr. Reyes's note by the paint mixer has the way that works now. It is his store, so trust his note.",
        },
      },
      signs: {
        "hardware-sign1": { title: "Hand-Painted Sign", text: "Reyes Hardware, painted by hand in red on white. Under the name: If we don't have it, you don't need it." },
        "hardware-sign2": { title: "Red Spray Paint", text: "Ruby's red R by the front door, sprayed big, with a 5 under it. Below that: two in the middle aisles." },
        "hardware-sign3": { title: "KEYS CUT HERE", text: "KEYS CUT HERE, with a long arrow. It points to the paint vault in the paint department. Next to it, someone drew a circle with a key inside." },
        "hardware-sign4": { title: "Marker by the Door", text: "Written on the wall beside the back room door in thick marker: IT STICKS. READ MY NOTE BY THE PAINT MIXER BEFORE YOU PUSH IT. Signed underneath: Mr. Reyes." },
      },
      key: { name: "Copper key with a leaf", tag: "\"Take only what you need.\" The copper key has a small leaf scratched by hand into its round head. The copper has turned a little green at the edges." },
    },

    pharmacy: {
      blurb: "Mile 9 Pharmacy, a small drugstore with medical kits and a locked cabinet room.",
      door: {
        title: "Mr. Okafor's Door Note",
        text: "From Mr. Okafor, the pharmacist. Please read all of this before you go in.\n\nTwo medical kits are out on the floor. One is by the giant toothbrush. The other is in the middle, where the aisles cross.\n\nAt least five walkers are inside. Most of them stay near the back, so the front is your best side.\n\nThe cabinet room is locked. Its code is on my note behind the counter. Get behind the counter at the right end, by the wheelchairs. Use that code and no other.",
      },
      notes: {
        "pharmacy-counter": {
          title: "The Cabinet Room Code",
          text: "Mr. Okafor here. I am a careful man, so I will be careful with this.\n\nThe cabinet room has a keypad on the door. The code is {code}. Say it with me: {codeSpoken}. Type it in slowly, then wait for the click. The lock lets go, and the door opens.\n\nUse that code and no other. One wrong code sets off the alarm. Then walkers pour in, more and more. They even come through the front door, so you cannot get out. They keep coming until they get you. Check each number before you press it.\n\nThe door is back here, behind the counter. It is in the corner on the same side as the wheelchairs. Inside are two more medical kits and a water filter.\n\nIf you need more than that, you must go north. St. Anne Annex is the hospital in the north hills. It still has medicine, and it has a generator. But it is the most dangerous place in town. Go in daylight, and go with a plan.",
        },
        "pharmacy-trail1": {
          title: "Doc Lin's Bag",
          text: "Mr. Okafor again. This note is about my friend, Doc Lin.\n\nEvery few days, Lin stops here to fill her bag. She packs bandages, pills, and anything that will last the trip. All of it is for Nurse Ada, up at the hospital.\n\nLast time, Lin turned back. She got as far as the road up the hill below St. Anne Annex. There were too many walkers on it, so she came back down. She was angry for two days. Lin is the bravest person I know. She is also the most stubborn. I worry about her.\n\nNow she has a new plan. She will ride north with the River Convoy as far as St. Anne. She only needs one seat, she says.\n\nI left a second note for you. It is on the floor near the giant toothbrush, under the SMILE poster.",
        },
        "pharmacy-trail2": {
          title: "The Key With Blue Paint",
          text: "Mr. Okafor, with the second note, as promised.\n\nThere is a key in this store, but it opens nothing here. It lies on the floor beside the pill bottle, near the front of the store. It is a stubby iron key with drops of blue paint on it. Pick it up, and keep it safe in your pack.\n\nThat key opens the paint vault at Reyes Hardware. The store is east of here, across town. The vault holds strong things. You will see.\n\nThe paint vault has a fussy lock. The wrong key jams it, and after that only a crowbar opens it.\n\nMr. Reyes cut this key himself, on his own machine. He keeps none of his own keys. Every key he cuts goes to some other building. That is how the key ring works.",
        },
        "pharmacy-dead1": {
          title: "A Bag for June",
          text: "A white paper pharmacy bag, folded shut at the top and stapled twice. A printed label is stuck to the front. Nobody ever picked it up. The staples have rusted a little.\n\nThe name on the label is June, in capital letters. The pills inside are for sore knees. The label says to take one with food, twice a day.\n\nMr. Okafor wrote a note across the bottom in tidy blue pen. It says: she always forgets these. Mr. Okafor must have known her well.\n\nThe bag sat behind the counter for a long time. Then someone moved it out here, to the cross aisle. Maybe they meant to deliver it.\n\nYou think of June back at the cabin, kneeling in the dirt to plant. Her knees do creak. Maybe it is the same June.",
        },
        "pharmacy-dead2": {
          title: "A Yellow Sticky Note",
          text: "A yellow sticky note lies on the floor, just inside the front door. It has lost most of its stick. The writing is in ink, neat and small. Someone wanted to remember it.\n\nCABINET ROOM CODE: {decoyCode}. Don't tell anyone!\n\nIt looks useful. It looks like the answer, and someone kept it safe for a long time. But look closer. The ink has faded, and the paper has gone soft at the edges. This note is old. It is from before Mr. Okafor changed the code. There is even a sign about the new code on the cabinet room door.\n\nThis old code will not work. Type it into the keypad, and the alarm goes off. Walkers will pour in through every door. The code on the counter note is the one that works. Use that one, and leave this one on the floor.",
        },
      },
      signs: {
        "pharmacy-sign1": { title: "Counter Sign", text: "PLEASE WAIT TO BE CALLED. The sign hangs by the pharmacy counter on two thin chains. Someone added in pen: we will call you, someday." },
        "pharmacy-sign2": { title: "Red Spray Paint", text: "Ruby's red R by the front door, with a 5 under it. Five walkers when she counted. An arrow points to the back: most of them stay back there." },
        "pharmacy-sign3": { title: "Health Poster", text: "CLEAN WATER SAVES LIVES. A cartoon drop of water smiles at the top. The words below it say: If you can't filter it, boil it." },
        "pharmacy-sign4": { title: "CABINET ROOM", text: "CABINET ROOM. STAFF ONLY. Under it, in neat pen: code changed, use the one on the counter note. Signed, Mr. Okafor." },
      },
      key: { name: "Stubby iron key, blue paint", tag: "\"Cut by Reyes.\" The stubby iron key has drops of blue paint on it. It looks like it sat under a busy brush. The tag is a scrap of cardboard on a wire." },
    },

    autoshop: {
      blurb: "Ortiz Auto, a repair shop with engine parts and a generator down in the service pit.",
      door: {
        title: "Dev's Chalk on the Garage",
        text: "Dev here, from the Gas-N-Go. I wrote this in chalk, so read it before the rain does.\n\nEngine parts are on the workbenches. One bench is at the back right, by the red tool chest. The other is in the left bay.\n\nAt least five walkers are inside. One stands in the parts room, by the engine crane. It stays still until it hears you.\n\nThe service pit is under a locked hatch. Do not waste time on it. Mr. Ortiz left a note in the office, behind the waiting room. It tells you how to open the hatch.",
      },
      notes: {
        "autoshop-office": {
          title: "Mr. Ortiz on the Hatch",
          text: "This is Mr. Ortiz. I have fixed cars in this shop for thirty years.\n\nThe hatch over the service pit looks stuck, but it is not. The bolt is just tricky. To open it, {moves}, in that order. Take your time, and do each step with care. Then the bolt slides free, and the hatch comes open.\n\nWork the bolt any other way, and it bends. A bent bolt jams the hatch shut. After that, only a crowbar opens it. So get it right the first time.\n\nThe pit room stands in the middle of the shop. Its hatch is on the front side, toward the oil drums.\n\nMy generator is down in the pit. There are spare parts with it, and a fuel can. Treat that generator kindly.\n\nSignal Electronics is downtown. It still has wire and radio parts on its shelves. But it is near the walker crowds. Go in fast, and come out faster.",
        },
        "autoshop-trail1": {
          title: "Ruby, It Runs",
          text: "Ruby, it's me. It's Dev. If anyone else finds this, please leave it here for my sister.\n\nWe did it. Mr. Ortiz and I fixed the truck together, and it runs! It coughs a lot, but it runs. He let me do the brakes all by myself.\n\nWe are driving west to the Water Tower. Theo is there, and he has clean water. He says he has room for two.\n\nI'm sorry I did not wait for you, Ruby. I really am. The walkers were getting thick on this street, and Mr. Ortiz said go now. So we went. I know you are angry. You can yell at me later. Please come find us.\n\nMr. Ortiz left a note at the back of the shop, beside the red tool chest. Read that one too.",
        },
        "autoshop-trail2": {
          title: "The Fire-Engine Red Key",
          text: "Mr. Ortiz again. Dev is a good kid, and a fast learner. Now, business.\n\nA key lies on the floor of the waiting room, beside the soda machine. You cannot miss the color. Red is hard to lose, which is the point. It is a big key painted fire-engine red, on a brass ring.\n\nThat key opens the chief's locker at Station 12. The station is north and west of here. The chief's locker has an old lock that bites. The wrong key snaps off inside it and is gone for good.\n\nChief Dunn left it with me as thanks. I fixed the convoy's trucks, both of them. He would not let me refuse. But I do not keep keys for myself. That is not how the ring works. So the key waits here, for whoever reads this far.\n\nUse what is in that locker well. Then return the favor.",
        },
        "autoshop-dead1": {
          title: "Mr. Ortiz's Job Board",
          text: "A whiteboard hangs by the waiting room chairs, smudged with grease. Across the top, in Mr. Ortiz's blocky writing: JOBS THIS WEEK.\n\nChief Dunn's fire truck: new brakes.\nSergeant Vega's van: new tires.\nCarla's boat motor: not done yet.\n\nNext to the boat motor, someone drew a little boat with a sad face. Below it, Mr. Ortiz wrote: Carla, I need one more part. Stop asking.\n\nMost of the jobs on this board are for the River Convoy. The trucks, the van, the boats. You can see the plan in it, even on a dusty whiteboard. People are getting ready to leave. Grease prints cover the edges, where hands grabbed the board. In the corner, a small note says: Dev, sweep the floor.\n\nThe grease pencil hangs on a string. It is dried out now. Nobody has added a job in a long time.",
        },
        "autoshop-dead2": {
          title: "The Hatch Trick",
          text: "Hatch trick: {decoyMoves}. The bolt slides right out. Trust me.\n\nThe note is on a scrap of greasy paper, folded in half. It lies by the pit room's locked hatch. There is no name. Somebody wiped their hands on it after writing.\n\nIt sounds like someone who knew this shop. Maybe they did. But look at the bolt on the hatch beside you. It is bright and new, with no grease on it yet. Every other bolt in this shop is black with oil. Mr. Ortiz put in a new bolt, and this trick was for the old one.\n\nTry the old trick on the new bolt, and it bends and jams. Then only a crowbar opens the hatch. Mr. Ortiz's note by the office tells the real trick. Read it before you touch that bolt.",
        },
      },
      signs: {
        "autoshop-sign1": { title: "Shop Sign", text: "Ortiz Auto. Honest repairs. Under the painted letters is a row of greasy handprints. Some are big, and some are small, like a kid's." },
        "autoshop-sign2": { title: "Red Spray Paint", text: "Ruby's red R by the front door, with a 5 under it. Next to it, in smaller paint: one by the engine crane." },
        "autoshop-sign3": { title: "Safety Poster", text: "SAFETY FIRST: Never work under a car alone. A cartoon man gives a thumbs up. Someone added in marker: never work anywhere alone." },
        "autoshop-sign4": { title: "Metal Plate", text: "SERVICE PIT. KEEP THE HATCH SHUT. The metal plate is bolted to the wall. Under it, in chalk: The bolt bends if you work it wrong. Mr. Ortiz's note says how." },
      },
      key: { name: "Big red key, brass ring", tag: "\"Return the favor.\" The big key is painted fire-engine red, and the paint is chipped. It hangs on a heavy brass ring that clanks. You will not lose this one." },
    },

    radioshack: {
      blurb: "Signal Electronics, a downtown store with spools of wire, close to the walker crowds.",
      door: {
        title: "Jo's Sign in the Window",
        text: "Jo wrote this. Yes, the Jo from the radio. Hi.\n\nSpools of wire are between the two long shelves in the middle. One is on the TV wall side, and one is on the robot side.\n\nAt least six walkers are inside. One is near the right end of the counter, by the robot. It will hear you once you get close, so be ready before you cross the floor.\n\nThe manager's office is locked. The manager left a note on the counter at the back. Read it before you touch that door. It will save you a lot of noise.",
      },
      notes: {
        "radioshack-counter": {
          title: "Priya's Alarm and Code",
          text: "I am Priya, the manager of Signal Electronics. Or I was, back when we had customers.\n\nMy office has two locks, and the order matters. First, turn off the alarm. Its panel is on the right wall, by the big dish. Press the {button} button. Do that before anything else.\n\nThen go to the office keypad. The code is {code}: {codeSpoken}. Type it slowly.\n\nA wrong button sets off the alarm. So does a wrong code. So does opening the office while the alarm is still on. Then walkers pour in, even through the front door. They keep coming until they get you.\n\nMy office door is in the back wall, near the robot, beside the MANAGER sign. Inside are two boxes of radio parts, and there is more wire. Take the parts first.\n\nTwo places are north of downtown. The 4th Precinct is the police station, and it has gun parts. Lincoln Middle School has books. Both are worth the drive.",
        },
        "radioshack-trail1": {
          title: "Jo on 88.1",
          text: "Jo again. If you have a radio, you might know my voice.\n\nEvery night I broadcast on 88.1, from a rooftop downtown. I read the news. I give warnings about walkers and bad roads. Then I pass on messages for people who cannot reach each other.\n\nPriya built my first transmitter right here in this store. She made it from parts on these very shelves. It was ugly, and it buzzed, and it worked. Tune in at dusk, and you will hear it.\n\nMost nights I carry messages between Doc Lin and Nurse Ada. Lin is down in town, and Ada is up at the hospital. They cannot reach each other, so they talk through me. Lin sounds tired lately. Ada sounds tired too.\n\nPriya left a note for you. It is on the floor below the TV wall.",
        },
        "radioshack-trail2": {
          title: "A Key Shaped Like Water",
          text: "Priya again. Jo always says I talk too much, so I will keep this short.\n\nA key lies on the floor beside the arcade game, near the front of the store. It is a long, thin key on a blue tag. The tag is shaped like a drop of water. You will spot the blue from the door.\n\nThat key opens the tool crib at the Water Tower, far west of here. The tool crib has an old lock that bites. The wrong key snaps off inside it and is gone for good.\n\nTheo gave me the key for a good reason. Jo and I needed tools to put an antenna on the tower. With it, her signal reaches the whole town. We borrowed the tools, and we brought them back. Mostly.\n\nNow the key stays here, in the ring. Bring the wrench back, please.",
        },
        "radioshack-dead1": {
          title: "Jo's Show Plan",
          text: "A sheet of paper is taped to the shelf, written in fat green marker. At the top: THE SHOW, EVERY NIGHT.\n\nNews at dusk. Then music. Then messages. Next to music, she wrote: old songs only.\n\nUnder that, in bigger letters, boxed in twice: WARNINGS FIRST. ALWAYS.\n\nThere are little notes in the margins. One says: read the walker counts slowly, people write them down. Another says: say the names right, every time. A third just says: drink water, your voice cracks. That one has a star next to it.\n\nAt the bottom of the page, underlined: No sad songs. People have enough.\n\nThe tape is old, and one corner has come loose. A coffee ring stains the other corner. Jo must have made this plan back when the station was new. It looks like she still follows it.",
        },
        "radioshack-dead2": {
          title: "Which Button?",
          text: "Alarm panel: press the {decoyButton} button. Then you are clear.\n\nThe words are scrawled on a torn envelope, in blue pen. It lies near the robot, at the end of the counter. There is no name. The pen pressed hard, like someone wanted it to look official.\n\nIt sounds like a real tip. Somebody must have watched the panel once. But look at the envelope again. It is a bill for this store, from the month the Fall began. The panel has changed since then. Priya rewired it after this note was written. The buttons do new jobs now.\n\nPress the wrong button, and the alarm goes off. Walkers pour in, even through the front door. Priya's note on the counter has the button that works now. Read hers, and leave this one.",
        },
      },
      signs: {
        "radioshack-sign1": { title: "Store Sign", text: "Signal Electronics. Under the name, in smaller letters: We fix what others throw away. Two letters have fallen off the big sign." },
        "radioshack-sign2": { title: "Red Spray Paint", text: "Ruby's red R, sprayed tall, with a 6 under it. Under that: one by the robot, at the end of the counter. The paint dripped." },
        "radioshack-sign3": { title: "Yellow Numbers", text: "Painted in big yellow numbers across the wall: 88.1. Under it, smaller: Jo, every night at dusk. Tune in, and stay safe." },
        "radioshack-sign4": { title: "Office Door Sign", text: "MANAGER'S OFFICE. PLEASE KNOCK. Under it, in marker: Priya says look under the register. Someone drew a smiling face next to it." },
      },
      key: { name: "Long thin key, blue tag", tag: "\"Bring the wrench back.\" The long, thin key hangs from a blue tag. The tag is shaped like a drop of water. It is as light as a pencil." },
    },

    garden: {
      blurb: "Greenhouse Row, a line of glass greenhouses with seeds, soil, and a locked potting shed.",
      door: {
        title: "Rosa Painted the Gate",
        text: "Rosa here. I ran this greenhouse for many years, before the Fall and after it.\n\nSoil is in the big greenhouse, the one with the scarecrow. Seeds are in the shop by the gate, near the big gnome.\n\nAt least five walkers are inside. One stays at the back of the big greenhouse, among the tall plants. Watch for leaves that move.\n\nThe potting shed is locked. My note is on the potting bench by the palm tree, at the back on the right. It tells you how to open the shed.",
      },
      notes: {
        "garden-bench": {
          title: "Rosa's Watering Cans",
          text: "Rosa again. This bench has held a lot of tired people.\n\nThe potting shed has a padlock on it. The key is in the {pick}. That is one of the three watering cans by this bench. Tip that one over, slowly, and let the key slide out. With that key, you can open the potting shed.\n\nLeave the other two cans alone. They are my walker alarm. I filled them with bells and tin cans. Tip one over, and the noise brings walkers, more and more. They even come in through the gate, so you cannot leave. They keep coming until they get you.\n\nTo find the shed, leave the palm tree house. Take the path down toward the beehives. The shed door is on that path.\n\nThere are more seeds inside, and there is a water tank. Keep the seeds dry.\n\nStation 12 is the fire station, north and east of here. Its equipment bay has tools and water tanks. Tell Chief Dunn that Rosa sent you.",
        },
        "garden-trail1": {
          title: "A Rattling Truck",
          text: "Rosa writing. I like to keep track of who passes through.\n\nA few days ago, a rattling truck pulled up at my gate. You could hear it from a mile off. Dev was driving, and Mr. Ortiz sat beside him. Dev looked happy, and very tired. They stopped to fill their water jugs at my tap.\n\nThey told me they were going north to the Water Tower. Theo has clean water there, and room for them both.\n\nThe very next day, a girl came asking for Dev. She had red paint on her hands. It was Ruby, his sister. I could see it in her face. I told her where he went. She thanked me and left right away. She did not even rest.\n\nMy other note is in the big greenhouse, by the scarecrow. Read it next.",
        },
        "garden-trail2": {
          title: "Mr. Ortiz's Greasy Key",
          text: "Rosa again, from the big greenhouse, in front of the scarecrow.\n\nA key lies on the floor beside the beehives. It is a greasy steel key on a loop of wire. Wipe your hands after. That grease does not wash out of anything. I still have some on my best apron.\n\nThat key opens the parts cage at Ortiz Auto. The shop is far east, across town. The parts cage has a plain lock. A wrong key just will not turn in it.\n\nMr. Ortiz gave me this key when the truck stopped here. He was leaving his shop behind, maybe for good. He did not want the ring to break because of him. So he pressed the key into my hand. I said it was too greasy for my seeds. He laughed, and I kept it anyway.",
        },
        "garden-dead1": {
          title: "Rosa's Planting Chart",
          text: "A planting chart is pinned up in the shop, just inside the gate. It is drawn on brown paper in colored pencil. Little arrows show where each crop goes. A yellow sun is drawn in the top corner.\n\nBEANS by the gate.\nTOMATOES at the back.\nSQUASH where the sun hits.\n\nThe tomatoes are drawn in red, of course. Next to the beans, Rosa drew a tiny smiling seed. She wrote: these came from June, my old friend. She gave me a whole jar of them.\n\nThe beans have three check marks. The tomatoes have one. The squash has a question mark, and the word maybe.\n\nAt the very bottom, circled twice: Tell June the beans came up!\n\nYou know a June, back at the cabin. She plants anything that will grow. Maybe this is the same June.",
        },
        "garden-dead2": {
          title: "A Seed Packet Tip",
          text: "Shed key is in the {decoyPick} by the bench. Help yourself!\n\nThe note is from a stranger, written on an empty seed packet. It lies on the path, right outside the potting shed door. The writing is big and friendly. Nobody signed it.\n\nIt sounds kind, and it was true once. But turn the packet over. Rosa wrote on the back, in neat green pencil. \"A looter read this note and came for my shed. So I moved the key. This note is old now.\"\n\nThe cans by the bench are not all safe anymore. The wrong one is full of bells and tin cans. Tip it, and the noise brings walkers, more and more, even through the gate. Rosa's note on the potting bench says where the key is now. Read hers, not this one.",
        },
      },
      signs: {
        "garden-sign1": { title: "Wooden Sign", text: "Greenhouse Row. Plants, seeds, soil. Carved into an old board, with a painted vine. Below it: open from dawn to dusk." },
        "garden-sign2": { title: "Red Spray Paint", text: "Ruby's red R on the wall, with a 5 under it. Under that, in a quick hand: one at the back of the big greenhouse." },
        "garden-sign3": { title: "Chalk Circle", text: "A chalk circle with a key inside, by the seed vault door in the shop. Under it: the key is not here, read the notes." },
        "garden-sign4": { title: "Potting Shed Sign", text: "POTTING SHED. MIND THE STEP. A small watering can is painted next to the words. The step really is high." },
      },
      key: { name: "Greasy steel key, wire loop", tag: "\"Fix something good.\" The greasy steel key hangs on a twisted loop of wire. It smells like motor oil and leaves marks on your fingers." },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
