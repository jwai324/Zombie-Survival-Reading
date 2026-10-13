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
        text: "Ruby. Read this before you open the door.\n\nAt least two walkers are inside. One stands near the back wall. The other drifts by the pumps side, close to the dirty windows. More come as the days pass, so do not wait around. Get in, and get out.\n\nThe fuel cans are on the floor, not on the shelves. Look low. The storeroom is on the right, next to the door, and it is locked. Do not kick it. The clerk kept a note on the counter. It tells you how to get in.",
      },
      notes: {
        "gasngo-counter": {
          title: "Dev's Note at the Register",
          text: "This is Dev. I was the clerk here, the night guy who ran the register. If you are reading this, you got past the walkers. Nice work.\n\nThe storeroom key is on the hook under the counter. Reach under and feel along the wood, and you will find it. Take it off the hook. Now you can open the storeroom, the locked door on the right. There is more fuel in there, and a spool of wire. I stacked it all by the back shelf.\n\nI am going to Ortiz Auto, on the east side of town. The shop is still standing, and Mr. Ortiz knows trucks. If I can fix one, my sister and I can leave.\n\nNeed to grow food? Rosa is at Greenhouse Row. Go west, past this gas station. She has seeds and soil, and she shares. Tell her Dev sent you.",
        },
        "gasngo-trail1": {
          title: "Ruby Picks Up the Trail",
          text: "Ruby again. I came back here today. I had to see this place one more time.\n\nDev is my little brother. His note was by the register, right where he left it. He made it out. He went east to Ortiz Auto to fix a truck. So I am going east after him. I leave at first light, and I travel light.\n\nI asked Jo to put it on the radio. Every night she will say that Ruby is looking for Dev. If you hear him, or see him, tell him to stay put. Tell him I am coming.\n\nOne more thing. I left a second note for you. It is on the floor behind the counter, near the register. Read it. It is about the key ring, and it matters more than this one.",
        },
        "gasngo-trail2": {
          title: "For Anyone Who Reads This Far",
          text: "Ruby here. You read this far. Good. That is the whole point.\n\nJo and I made a rule: take what you need, leave the rest. Some people smash and grab everything. So every stash in town is locked now. Its key is hidden in another building, with a note that says where. Only people who read can find them. We call it the key ring.\n\nHere is your link in the ring. A key lies on the floor just inside the front door. It is on the right, by the storeroom wall. It is a small brass key on a green plastic tag. It opens the staff locker at Corner Grocery, east of here.\n\nHana, the grocery manager, gave me this key. That was the first day of the ring. Do not let her down.",
        },
        "gasngo-dead1": {
          title: "Dev's Last To-Do List",
          text: "A to-do list is stuck between the shelves, in Dev's messy handwriting. The date at the top is his last shift before the Fall.\n\nDEV, SATURDAY NIGHT.\nMop the floor. All of it, not just the middle.\nFill the coffee. Both pots, because the truck drivers get grumpy.\nFix the ice machine. It sounds like a sick goose again.\n\nAt the bottom, in pen pressed in hard: Call Ruby back! He underlined it twice.\n\nNothing on the list is crossed off. Not one thing. The pen is still clipped to the paper. The mop bucket stands by the shelf, dry and dusty now. The coffee pots still sit on the burner, empty and stained.\n\nWhatever happened that night, it happened before Dev got to any of it. You wonder if he ever called her back. You hope he did.",
        },
        "gasngo-dead2": {
          title: "A Tip From a Friend",
          text: "Hey, you. Yes, you, with the flashlight.\n\nI know this place. I used to come here every day. The old safe room key is under the mat. It is outside the front door. I put it there myself. Just lift the mat and grab it. Easy. The safe room has the good stuff. Do not waste time on the other notes in here.\n\nA friend.\n\nThat is all it says, and it is signed only \"a friend.\" Across the whole note, someone has written NOPE in big red marker. The letters run from corner to corner.\n\nThink about it. You walked in through that front door a few minutes ago. There is no mat out there anymore. There is only bare concrete. A pale square shows where a mat used to lie. Whoever wrote this wanted you outside, alone, bending down in the open.",
        },
      },
      signs: {
        "gasngo-sign1": { title: "Faded Store Sign", text: "Gas-N-Go. Always open. The red letters are faded by the sun. Someone crossed out \"always\" and wrote \"not\" above it in black." },
        "gasngo-sign2": { title: "Red Spray Paint", text: "A big red R, sprayed fast. Under it, a 2. Ruby counted two walkers in here. Smaller, below that: DON'T RUN. WALK AND LOOK." },
        "gasngo-sign3": { title: "Chalk by the Safe Room", text: "By the old safe room door: a chalk circle. A small key is drawn inside. This lock's key is hidden in another building. Find the note that says where." },
        "gasngo-sign4": { title: "STAFF ONLY", text: "STAFF ONLY, on a metal sign over the storeroom door. Under it, in Dev's quick pen: key on the hook, you know where." },
      },
      key: { name: "Small brass key, green tag", tag: "\"Staff locker. Leave some for the next one.\" The green plastic tag is scratched and bent at one corner. The small brass key is worn shiny at the tip. Someone has used it a lot." },
    },

    grocery: {
      blurb: "A corner store with leftover food on the floor and a cold walk-in cooler.",
      door: {
        title: "Doc Lin on the Glass",
        text: "Doc Lin, written in marker on this glass. I pass through here often, so listen.\n\nThe front shelves are mostly picked over. Do not waste time on them. The food that is left is on the floor by the far aisle.\n\nWalkers get in through the loading door at the back. It does not shut anymore. Count on at least two inside, maybe more.\n\nThe walk-in cooler still stays cold, and it is locked. The manager's note is on the counter at the back wall. Read it, and the cooler will open.",
      },
      notes: {
        "grocery-counter": {
          title: "Hana's Cooler Trick",
          text: "I am Hana, the store manager. I ran this place for six years, and I still do, more or less.\n\nThe walk-in cooler is not broken. The latch just sticks. Lift the latch while you pull the door toward you. Lift and pull, both at once. It will swing open with a little sigh of cold air. So you can open the cooler now.\n\nInside there is food, and there is one medical kit. The cold keeps it all good. Close the door behind you, or the cold leaks out.\n\nWhen you need more medicine, go to Mile 9 Pharmacy. It is west of here. Last week it still had medicine on its shelves. Mr. Okafor runs it, and he is careful.\n\nTake what you need. Leave the rest for the next person. That is the rule here.",
        },
        "grocery-trail1": {
          title: "Doc Lin's Medicine Run",
          text: "Doc Lin again. If you found this, you are in the front aisle, so stay low.\n\nI am a doctor, and I carry medicine across town. It starts here. From here I go to the pharmacy, and then north to St. Anne Annex. Nurse Ada stayed at St. Anne when the others left. She keeps the generator going, and she keeps the records.\n\nSome of her medicine has to stay cold. The cooler here keeps Ada's medicine cold until I can carry it. Hana never asks for anything back.\n\nI have not reached Ada for weeks. The road into the hills is full of walkers. Some days I get halfway. I keep trying anyway. She is waiting, and so are her patients.\n\nHana left a note for the next reader. It is in the back right corner of the store. Go read it.",
        },
        "grocery-trail2": {
          title: "Hana's Link in the Ring",
          text: "Hana here, in the back corner, where nobody looks. You looked. Good.\n\nYou have heard of the key ring by now. Every stash in town is locked. Its key waits in another building, with a note like this one.\n\nHere is the key I keep for the ring. It lies at the right end of the front aisle. Look on the floor, against the right wall. It is a long silver key on a red string. The string is long enough to wear around your neck.\n\nThat key opens the narcotics safe at Mile 9 Pharmacy, west of here. The safe holds medicine, so be careful with it.\n\nMr. Okafor gave me this key for the ring. He said it was because I never took more than I needed. Do the same, please. Somebody sick may need what you leave.",
        },
        "grocery-dead1": {
          title: "A Kid's Shopping List",
          text: "A shopping list is folded into a tiny square. The paper is lined, torn from a school notebook. The writing is big and round, in purple pen. A kid wrote this.\n\nSHOPPING LIST.\nPeanut butter, the crunchy kind.\nBatteries, for the flashlight and the game.\nDog food.\n\nA grown-up wrote next to it in blue ink: we don't have a dog.\n\nUnder that, in purple pen again, pressed hard: yet. Someone drew a little dog in the corner, with a wagging tail. It is not a good drawing, but it is a happy one.\n\nSomeone kept this list. It was tucked between two cans, like a bookmark. Maybe the kid will come back for it. Maybe the kid has a dog by now. You hope so. Out here, a dog would be good company, and a good set of ears.",
        },
        "grocery-dead2": {
          title: "Cardboard by the Door",
          text: "COOLER EMPTY. DON'T BOTHER.\n\nThe words are on a torn sheet of cardboard, in thick black marker. It lies on the floor near the front door, on the right. Anyone walking in would see it first. That seems to be the idea.\n\nThere is no name on it. The letters are shaky and uneven. The last word runs off the edge. Whoever wrote it was in a hurry. Maybe they wanted the cooler for themselves. Or maybe they were scared, and did not want strangers near the back. A sign like this keeps other people away.\n\nBut Hana ran this store. Her own note is on the counter at the back. Her note says what is really in the cooler. Trust the manager over a scrap of cardboard. Then go see for yourself. The cooler is worth the walk.",
        },
      },
      signs: {
        "grocery-sign1": { title: "Store Sign", text: "Corner Grocery. Fresh bread every morning! The printed letters are cheerful and orange. The bread rack under the sign is empty. Not even crumbs are left." },
        "grocery-sign2": { title: "Black Marker", text: "Black marker, big and fast. THE LOADING DOOR AT THE BACK DOESN'T SHUT. Under it, underlined twice: watch your back. The ink has run." },
        "grocery-sign3": { title: "Sale Sign", text: "SALE! Soup, two cans for the price of one. The price tag is still stuck on. Someone added in pen: deal still stands, everything is free now." },
        "grocery-sign4": { title: "Cooler Door Sign", text: "WALK-IN COOLER. Keep the door closed. Under it, in Hana's neat writing: lift and pull. She drew a little arrow pointing up at the latch." },
      },
      key: { name: "Long silver key, red string", tag: "\"Medicine only. Count what you take.\" The long silver key hangs from a red string. The string is tied in a tight double knot. It will not slip off." },
    },

    hardware: {
      blurb: "Reyes Hardware, a big store with nails, tools, lumber, and a locked back room.",
      door: {
        title: "Mr. Reyes Nailed This Up",
        text: "This is Mr. Reyes, the owner. This is my store, and I want it back someday. So be careful in there.\n\nAt least three walkers are inside. Two stay in the middle aisles. One waits near the front door, close to where you come in.\n\nNails are near the front. Watch your step, because some are loose on the floor. Tools are in the middle aisle. Lumber is at the back.\n\nThe back room is locked. My note is by the paint shelves. It tells you the trick for that door.",
      },
      notes: {
        "hardware-paint": {
          title: "The Sticking Door",
          text: "Mr. Reyes again. You found my paint shelf, so you can read. Good.\n\nThe back room door sticks. It has stuck for twenty years, and I never fixed it. Most people pull and give up. I tried to fix it once, and it got worse. The trick is to lift the handle and push, at the same time. Lift, then push hard with your shoulder. You will hear a pop when it gives. Do that, and you can open the back room now.\n\nInside I left a water filter, a second tool kit, and lumber. The lumber is good pine. Do not waste it.\n\nNeed more wood? Go to Ridge Lumber, on the east ridge. It has stacks of lumber, and Carla runs the yard. Need more filters? Try the Water Tower on the west side. Its pump house has more filters. Theo runs the pumps, and he is fair.",
        },
        "hardware-trail1": {
          title: "Where the Keys Were Cut",
          text: "Mr. Reyes here. People ask me how the key ring started. It started right here, in my store.\n\nRuby and Jo came in one cold morning. They had an idea. Lock every stash in town, and hide each key in some other building. Leave a note that says where. Then only people who read would find the good stuff.\n\nI liked it. I have a key machine in this store. I know how to use it. So I cut the first keys on that machine. Fifteen keys for fifteen stashes. It took me two whole days. My hands still ache when I think of it. I am proud of every one.\n\nThe rule is simple. No key stays in the building it opens. Each one waits somewhere else, with a note.\n\nMy other note is in the back left corner of the store. Go find it.",
        },
        "hardware-trail2": {
          title: "The Very First Key",
          text: "Mr. Reyes, in the back corner. You walked the whole store to get here. That is the kind of reader I trust.\n\nA key lies in the front left corner. It is on the floor, between the counter and the crates. It is a copper key with a leaf scratched into its head. I scratched that leaf myself. Its head is round, and the leaf points up.\n\nThat key opens the seed vault at Greenhouse Row. Greenhouse Row is far west, across town. Rosa runs it, and she grows food for half this town.\n\nThis was the very first key I cut for the ring. Rosa asked me to keep it here. She said a hardware store is the last place a seed thief would look. She was right. People come here for hammers, not beans.\n\nTake the key. Leave the seeds you do not need.",
        },
        "hardware-dead1": {
          title: "Who Borrowed What",
          text: "BORROWED TOOLS. BRING THEM BACK!\n\nThe list is taped to the back wall, in Mr. Reyes's big square letters. The paper is curled from damp. Some names are old and faded. Three are newer.\n\nCarla: one long saw. She said a week.\nChief Dunn: two ladders. For the convoy, he says.\nTheo: one pipe wrench. Never returned. Again.\n\nThe word again is underlined three times, hard enough to tear the paper. Beside Theo's name, Mr. Reyes drew a tiny wrench with a sad face.\n\nUnder the list, in smaller writing: If you see these people, remind them. Nicely. Then remind them again.\n\nMost of the hooks on the wall beside the list are empty. Half the town owes Mr. Reyes a tool. Nails are not on the list. Nobody borrows nails. They just take them.",
        },
        "hardware-dead2": {
          title: "Inside the Blue Paint",
          text: "Psst. Here is a secret.\n\nThe paint vault key is hidden inside a can of blue paint. Open the blue cans and dig around. It is at the bottom of one of them.\n\nThe note is in pencil, on the back of a paint chip card. There is no name on it.\n\nLook at the paint shelves in this store. Many blue paint cans have been pried open. Lids lie on the floor, bent by screwdrivers. Blue drips run down the shelves and dry on the tiles. Somebody dug through every can, up to the elbow. Blue footprints lead away down the aisle. Then they stop. Mr. Reyes would be furious about the mess.\n\nNone of them had a key inside. Whoever wrote this guessed wrong, or lied. A real key in this town comes with a real name on the note.",
        },
      },
      signs: {
        "hardware-sign1": { title: "Hand-Painted Sign", text: "Reyes Hardware, painted by hand in red and gold. Under the name: If we don't have it, you don't need it." },
        "hardware-sign2": { title: "Red Spray Paint", text: "Ruby's red R, sprayed big, with a 3 under it. Below that: two in the middle aisles, one by the door." },
        "hardware-sign3": { title: "KEYS CUT HERE", text: "KEYS CUT HERE, with a long arrow. It points to the paint vault in the back right corner. Next to it, someone drew a circle with a key inside." },
        "hardware-sign4": { title: "Marker on the Door", text: "Written on the back room door in thick marker: LIFT, THEN PUSH. Signed underneath: Mr. Reyes. He even drew a little arrow pointing up." },
      },
      key: { name: "Copper key with a leaf", tag: "\"Seed vault. Seeds for anyone.\" The copper key has a small leaf scratched by hand into its round head. The copper has turned a little green at the edges." },
    },

    pharmacy: {
      blurb: "Mile 9 Pharmacy, a small drugstore with medical kits and a locked cabinet room.",
      door: {
        title: "Mr. Okafor's Door Note",
        text: "From Mr. Okafor, the pharmacist. Please read all of this before you go in.\n\nThe medical kits are on the low shelves near the middle of the store. Look down, not up. The high shelves were emptied a long time ago.\n\nAt least three walkers are inside. Most of them stay near the back, so the front is your best side.\n\nThe cabinet room is locked. I put a keypad on that door myself. The code is written on my note at the counter. Use that code and no other.",
      },
      notes: {
        "pharmacy-counter": {
          title: "The Cabinet Room Code",
          text: "Mr. Okafor here. I am a careful man, so I will be careful with this.\n\nThe cabinet room has a keypad on the door. The code is 4471. I wrote it here, and only here, on purpose. Say it with me: four, four, seven, one. Type it in slowly, then wait for the click. The lock lets go, and you can open the cabinet room now.\n\nInside are two more medical kits and a water filter. Those kits are sealed and clean. I kept them back for a hard day. If you are here, your day is probably hard.\n\nIf you need more than that, you must go north. St. Anne Annex is the hospital in the north hills. It still has medicine, and it has a generator. But hear me. It is the most dangerous place in town. Go in daylight, and go with a plan.",
        },
        "pharmacy-trail1": {
          title: "Doc Lin's Bag",
          text: "Mr. Okafor again. This note is about my friend, Doc Lin.\n\nEvery few days, Lin stops here to fill her bag. She packs bandages, pills, and anything that will last the trip. All of it is for Nurse Ada, up at the hospital.\n\nLast time, Lin turned back. She got as far as the hill road below St. Anne Annex. There were too many walkers on it, so she came back down. She was angry for two days. Lin is the bravest person I know. She is also the most stubborn. I worry about her.\n\nNow she has a new plan. She will ride north with the River Convoy as far as St. Anne. She only needs one seat, she says.\n\nI left a second note for you. It is at the left end of the middle aisle, by the left wall.",
        },
        "pharmacy-trail2": {
          title: "The Key With Blue Paint",
          text: "Mr. Okafor, with the second note, as promised.\n\nThere is a key in this store, but it opens nothing here. It lies at the right end of the front aisle. Look on the floor, against the right wall. It is a stubby iron key with drops of blue paint on it. Pick it up, and keep it safe in your pack.\n\nThat key opens the paint vault at Reyes Hardware. The store is east of here, across town. The vault holds strong things. You will see.\n\nMr. Reyes cut this key himself, on his own machine. He keeps none of his own keys. Every key he cuts goes to some other building. That is how the key ring works. No stash holds its own key, so nobody can grab it all. That is the whole idea.\n\nCount what you take. Leave the rest.",
        },
        "pharmacy-dead1": {
          title: "A Bag for June",
          text: "A white paper pharmacy bag, folded shut at the top and stapled twice. A printed label is stuck to the front. Nobody ever picked it up. The staples have rusted a little.\n\nThe name on the label is June, in capital letters. The pills inside are for sore knees. The label says to take one each morning with food.\n\nAcross the bottom of the bag, in Mr. Okafor's tidy blue pen, there is a note: she always forgets these. Mr. Okafor must have known her well.\n\nThe bag sat behind the counter for a long time. Then someone moved it out here, to the front aisle. Maybe they meant to deliver it.\n\nYou think of June back at the cabin, kneeling in the dirt to plant. Her knees do creak. Maybe it is the same June.",
        },
        "pharmacy-dead2": {
          title: "A Yellow Sticky Note",
          text: "A yellow sticky note lies on the floor. It is near the front door, on the right. It has lost most of its stick. The writing is in pencil, quick and slanted. Someone was in a hurry to remember it.\n\nCABINET ROOM CODE: 4417. Don't tell anyone!\n\nIt looks useful. It looks like the answer. But look closer. The note is old and faded. It is from before Mr. Okafor changed the code. There is even a sign about the new code on the cabinet room door.\n\nThis old code will not work. Someone else may have tried it already. Do not be the next one. The keypad will just beep at you, and beeping draws walkers. The code on the counter note is the one that works. Use that one, and leave this one on the floor.",
        },
      },
      signs: {
        "pharmacy-sign1": { title: "Counter Sign", text: "PLEASE WAIT TO BE CALLED. The sign hangs over the counter on two thin chains. Someone added in pen: we will call you, someday." },
        "pharmacy-sign2": { title: "Red Spray Paint", text: "Ruby's red R, with a 3 under it. Three walkers when she counted. An arrow points to the back: most of them stay back there." },
        "pharmacy-sign3": { title: "Health Poster", text: "CLEAN WATER SAVES LIVES. A cartoon drop of water smiles at the top. The words below it say: If you can't filter it, boil it." },
        "pharmacy-sign4": { title: "CABINET ROOM", text: "CABINET ROOM. STAFF ONLY. Under it, in neat pen: code changed, use the one on the counter note. Signed, Mr. Okafor." },
      },
      key: { name: "Stubby iron key, blue paint", tag: "\"Paint vault. Cut by Reyes.\" The stubby iron key has drops of blue paint on it. It looks like it sat under a busy brush. The tag is a scrap of cardboard on a wire." },
    },

    autoshop: {
      blurb: "Ortiz Auto, a repair shop with engine parts and a generator down in the service pit.",
      door: {
        title: "Dev's Chalk on the Garage",
        text: "Dev here, from the Gas-N-Go. I wrote this in chalk, so read it before the rain does.\n\nEngine parts are on the workbenches. One bench is on the left wall. The other is in the back right corner.\n\nAt least three walkers are inside. One wanders near the crates in the back left corner. It moves slow, but it does not stop.\n\nThe service pit is covered by a locked hatch. Do not waste time on it. Mr. Ortiz left a note by the office. It tells you how to open the hatch.",
      },
      notes: {
        "autoshop-office": {
          title: "Mr. Ortiz on the Hatch",
          text: "This is Mr. Ortiz. I have fixed cars in this shop for thirty years. I can fix this problem for you too.\n\nThe hatch over the service pit looks stuck, but it is not. The bolt comes out if you twist it to the left. Most people twist it right, because that is how bolts usually go. Not this one. Give it a hard turn to the left, and it slides free. Then lift the hatch with both hands. It is heavy. After that, you can open the service pit.\n\nMy generator is down in the pit. There are spare parts with it, and a fuel can. Treat that generator kindly. It still runs. The pit smells like oil, but you get used to it.\n\nSignal Electronics is downtown. It still has wire and radio parts on its shelves. But it is near the walker crowds. Go in fast, and come out faster.",
        },
        "autoshop-trail1": {
          title: "Ruby, It Runs",
          text: "Ruby, it's me. It's Dev. If anyone else finds this, please leave it here for my sister.\n\nWe did it. Mr. Ortiz and I fixed the truck together, and it runs! It coughs a lot, but it runs. He let me do the brakes all by myself.\n\nWe are driving west to the Water Tower. Theo is there, and he has clean water. He says he has room for two.\n\nI'm sorry I did not wait for you, Ruby. I really am. The walkers were getting thick on this street, and Mr. Ortiz said go now. So we went. I know you are angry. You can yell at me later. Please come find us.\n\nMr. Ortiz left a note on the right wall. It is a few steps in front of the office. Read that one too.",
        },
        "autoshop-trail2": {
          title: "The Fire-Engine Red Key",
          text: "Mr. Ortiz again. Dev is a good kid, and a fast learner. Now, business.\n\nA key lies against the left wall, just behind the front left corner. You cannot miss the color. Red is hard to lose, which is the point. It is a big key painted fire-engine red, on a brass ring.\n\nThat key opens the chief's locker at Station 12. The station is north and west of here.\n\nChief Dunn left it with me as thanks. I fixed the convoy's trucks, both of them. He would not let me refuse. But I do not keep keys for myself. That is not how the ring works. So the key waits here, for whoever reads this far.\n\nPick it up and keep it safe. Use what is in that locker well. Then return the favor to somebody.",
        },
        "autoshop-dead1": {
          title: "Mr. Ortiz's Job Board",
          text: "A whiteboard hangs on the wall here, smudged with grease. Across the top, in Mr. Ortiz's blocky writing: JOBS THIS WEEK.\n\nChief Dunn's fire truck: new brakes.\nSergeant Vega's van: new tires.\nCarla's boat motor: not done yet.\n\nNext to the boat motor, someone drew a little boat with a sad face. Below it, Mr. Ortiz wrote: Carla, I need one more part. Stop asking.\n\nEvery job on this board is for the River Convoy. The trucks, the van, the boats. You can see the plan in it, even on a dusty whiteboard. People are getting ready to leave. Grease prints cover the edges, where hands grabbed the board. In the corner, a small note says: Dev, sweep the floor.\n\nThe marker hangs on a string. It is dried out now. Nobody has added a job in a long time.",
        },
        "autoshop-dead2": {
          title: "Welded Shut?",
          text: "DON'T BOTHER WITH THE PIT. The hatch is welded shut. It cannot be opened. I tried for an hour. Save your time.\n\nThe note is on a scrap of greasy paper, folded in half. There is no name. Somebody wiped their hands on it after writing.\n\nYou look at the service pit wall beside you. The hatch does have a shiny line along its edge. From far away, it looks like a weld. Up close, it is only silver paint. It is still a little tacky in places. Someone painted it on purpose. You can scratch it off with a fingernail.\n\nWhoever wrote this tried the wrong way, or wanted you to quit. Mr. Ortiz's note by the office tells the real trick. Read it before you give up on that hatch. Then look for yourself.",
        },
      },
      signs: {
        "autoshop-sign1": { title: "Shop Sign", text: "Ortiz Auto. Honest repairs. Under the painted letters is a row of greasy handprints. Some are big, and some are small, like a kid's." },
        "autoshop-sign2": { title: "Red Spray Paint", text: "Ruby's red R, with a 3 under it. Next to it, in smaller paint: one by the crates in the back left." },
        "autoshop-sign3": { title: "Safety Poster", text: "SAFETY FIRST: Never work under a car alone. A cartoon man gives a thumbs up. Someone added in marker: never work anywhere alone." },
        "autoshop-sign4": { title: "Metal Plate", text: "SERVICE PIT. KEEP THE HATCH SHUT. The metal plate is bolted to the wall. Under it, a chalk arrow curls to the left." },
      },
      key: { name: "Big red key, brass ring", tag: "\"Chief's locker. Return the favor.\" The big key is painted fire-engine red, and the paint is chipped. It hangs on a heavy brass ring that clanks. You will not lose this one." },
    },

    radioshack: {
      blurb: "Signal Electronics, a downtown store with spools of wire, close to the walker crowds.",
      door: {
        title: "Jo's Sign in the Window",
        text: "Jo wrote this. Yes, the Jo from the radio. Hi.\n\nSpools of wire are on the shelves in the middle rows. Grab them on your way through.\n\nAt least four walkers are inside. One stays near the counter on the back wall. It will hear the door, so be ready the second you step in.\n\nThe manager's office is locked. The manager left a note on the counter at the back. Read it before you touch that door. It will save you a lot of noise.",
      },
      notes: {
        "radioshack-counter": {
          title: "Priya's Key Under the Register",
          text: "I am Priya, the manager of Signal Electronics. Or I was, back when we had customers.\n\nThe office key is taped under the register. Reach under the counter and feel along the edge. You will find a strip of silver tape. Peel it back slowly, so the key does not drop and roll away. Turn the key gently, because the lock is old. Then you can open the manager's office.\n\nInside are two boxes of radio parts, and there is more wire. Take the parts first. They are hard to find now. A good radio can save a lot of lives. Jo would tell you the same.\n\nTwo places are north of downtown. The 4th Precinct is the police station, and it has gun parts. Lincoln Middle School has books. Both are worth the drive. The station is the harder one, so do not go there tired.",
        },
        "radioshack-trail1": {
          title: "Jo on 88.1",
          text: "Jo again. If you have a radio, you might know my voice.\n\nEvery night I broadcast on 88.1, from a rooftop downtown. I read the news. I give warnings about walkers and bad roads. Then I pass on messages for people who cannot reach each other.\n\nPriya built my first transmitter right here in this store. She made it from parts on these very shelves. It was ugly, and it buzzed, and it worked. Tune in at dusk, and you will hear it.\n\nMost nights I carry messages between Doc Lin and Nurse Ada. Lin is down in town, and Ada is up at the hospital. They cannot reach each other, so they talk through me. Lin sounds tired lately. Ada sounds tired too.\n\nPriya left a note for you. It is at the left end of the middle aisle, by the left wall.",
        },
        "radioshack-trail2": {
          title: "A Key Shaped Like Water",
          text: "Priya again. Jo always says I talk too much, so I will keep this short.\n\nA key lies at the right end of the front aisle. It is on the floor, against the right wall. It is a long, thin key on a blue tag. The tag is shaped like a drop of water. You will spot the blue from the door.\n\nThat key opens the tool crib at the Water Tower, far west of here. Theo keeps the tower running.\n\nTheo gave me the key for a good reason. Jo and I needed tools to put an antenna on the tower. With it, her signal reaches the whole town. We borrowed the tools, and we brought them back. Mostly.\n\nNow the key stays here, in the ring. Bring the wrench back, please. Theo is still upset about the last one.",
        },
        "radioshack-dead1": {
          title: "Jo's Show Plan",
          text: "A sheet of paper is taped to the shelf, written in fat green marker. At the top: THE SHOW, EVERY NIGHT.\n\nNews at dusk. Then music. Then messages. Next to music, she wrote: old songs only.\n\nUnder that, in bigger letters, boxed in twice: WARNINGS FIRST. ALWAYS.\n\nThere are little notes in the margins. One says: read the walker counts slowly, people write them down. Another says: say the names right, every time. A third just says: drink water, your voice cracks. That one has a star next to it.\n\nAt the bottom of the page, underlined: No sad songs. People have enough.\n\nThe tape is old, and one corner has come loose. A coffee ring stains the other corner. Jo must have made this plan back when the station was new. It looks like she still follows it.",
        },
        "radioshack-dead2": {
          title: "Station Moved?",
          text: "JO'S STATION MOVED TO 99.5. TELL EVERYONE.\n\nThe words are scrawled on a torn envelope, in blue pen. There is no name, and no date. The envelope is empty. The pen pressed hard, like someone wanted it to look official.\n\nIt sounds like real news. If it were true, you would want to know. But it is not true. Some people might believe it, and that is the danger. Jo never moved. Her station is still 88.1, every night at dusk, the same as always. The big yellow numbers on the wall here say so.\n\nAnyone who tunes to 99.5 gets only static. Hiss, crackle, and nothing else. Maybe someone made a mistake. Maybe someone wanted Jo's listeners to lose her. Jo would laugh at this, then get angry. Either way, stay on 88.1. Do not pass this on.",
        },
      },
      signs: {
        "radioshack-sign1": { title: "Store Sign", text: "Signal Electronics. Under the name, in smaller letters: We fix what others throw away. Two letters have fallen off the big sign." },
        "radioshack-sign2": { title: "Red Spray Paint", text: "Ruby's red R, sprayed tall, with a 4 under it. Under that: one by the counter at the back. The paint dripped." },
        "radioshack-sign3": { title: "Yellow Numbers", text: "Painted in big yellow numbers across the wall: 88.1. Under it, smaller: Jo, every night at dusk. Tune in, and stay safe." },
        "radioshack-sign4": { title: "Office Door Sign", text: "MANAGER'S OFFICE. PLEASE KNOCK. Under it, in marker: Priya says look under the register. Someone drew a smiling face next to it." },
      },
      key: { name: "Long thin key, blue tag", tag: "\"Tool crib. Bring the wrench back.\" The long, thin key hangs from a blue tag. The tag is shaped like a drop of water. It is as light as a pencil." },
    },

    garden: {
      blurb: "Greenhouse Row, a line of glass greenhouses with seeds, soil, and a locked potting shed.",
      door: {
        title: "Rosa Painted the Gate",
        text: "Rosa here. I ran this greenhouse for many years, before the Fall and after it.\n\nSeed packets are on the bench near the front. Soil bags are stacked in the middle of the floor. They are heavy, so lift with your legs.\n\nAt least three walkers are inside. One stays near the back, among the tall plants. Watch for leaves that move.\n\nThe potting shed is locked. My note is on the potting bench at the back, on the right. It tells you how to open the shed.",
      },
      notes: {
        "garden-bench": {
          title: "Rosa's Watering Can",
          text: "Rosa again. Sit for a second if you can. This bench has held a lot of tired people.\n\nThe potting shed has a padlock on it. The key is in the watering can on this bench. The can is green, with a dent in the side. Tip it over, slowly, and let the key slide out. It may come out with a splash of old water. With that key, you can open the potting shed now.\n\nThere are more seeds inside, and there is a water tank. Keep the seeds dry. Wet seeds rot, and then they are no good to anyone. Seeds are worth more than gold now.\n\nStation 12 is the fire station, north of here. Its equipment bay has tools and water tanks. Chief Dunn runs that station. Tell him Rosa sent you, and he might even smile.",
        },
        "garden-trail1": {
          title: "A Rattling Truck",
          text: "Rosa writing. I like to keep track of who passes through.\n\nA few days ago, a rattling truck pulled up at my gate. You could hear it from a mile off. Dev was driving, and Mr. Ortiz sat beside him. Dev looked happy, and very tired. They stopped to fill their water jugs at my tap.\n\nThey told me they were going north to the Water Tower. Theo has clean water there, and room for them both.\n\nThe very next day, a girl came asking for Dev. She had red paint on her hands. It was Ruby, his sister. I could see it in her face. I told her where he went. She thanked me and left right away. She did not even rest.\n\nMy other note is at the back, between the crates. Read it next.",
        },
        "garden-trail2": {
          title: "Mr. Ortiz's Greasy Key",
          text: "Rosa again, from between the crates.\n\nA key lies in the front left corner, on the floor. It is a greasy steel key on a loop of wire. Wipe your hands after. That grease does not wash out of anything. I still have some on my best apron.\n\nThat key opens the parts cage at Ortiz Auto. The shop is far east, across town. The parts cage holds good things for a mechanic.\n\nMr. Ortiz gave me this key when the truck stopped here. He was leaving his shop behind, maybe for good. He did not want the ring to break because of him. So he pressed the key into my hand. I said it was too greasy for my seeds. He laughed, and I kept it anyway.\n\nFix something good with what you find there.",
        },
        "garden-dead1": {
          title: "Rosa's Planting Chart",
          text: "A planting chart is pinned up just inside the door. It is drawn on brown paper in colored pencil. Little arrows show where each crop goes. A yellow sun is drawn in the top corner.\n\nBEANS by the gate.\nTOMATOES at the back.\nSQUASH where the sun hits.\n\nThe tomatoes are drawn in red, of course. Next to the beans, Rosa drew a tiny smiling seed. She wrote: these came from June, my old friend. She gave me a whole jar of them.\n\nThe beans have three check marks. The tomatoes have one. The squash has a question mark, and the word maybe.\n\nAt the very bottom, circled twice: Tell June the beans came up!\n\nYou know a June, back at the cabin. She plants anything that will grow. Maybe this is the same June.",
        },
        "garden-dead2": {
          title: "Canned Food in the Shed?",
          text: "Hey. The potting shed is FULL of canned food. Beans, soup, peaches, all of it. Stacked to the roof. Get in there before someone else does!\n\nThe note is from a stranger. It hangs just inside the front door, right next to the potting shed door. The writing is big and excited. Whoever wrote it never signed it.\n\nIt is wrong. There is no canned food in the shed. There never was. The shed holds seeds and a tank of water, and nothing else. Someone guessed, or wanted a crowd to fight over nothing. A crowd at the shed would bring walkers too.\n\nRosa wrote an answer under it, in neat green pencil. Seeds are food, if you wait.\n\nShe is right, of course. It just takes a whole season. Plant them, and you will see.",
        },
      },
      signs: {
        "garden-sign1": { title: "Wooden Sign", text: "Greenhouse Row. Plants, seeds, soil. Carved into an old board, with a painted vine. Below it: open from dawn to dusk." },
        "garden-sign2": { title: "Red Spray Paint", text: "Ruby's red R on the wall, with a 3 under it. Under that, in a quick hand: one at the back." },
        "garden-sign3": { title: "Chalk Circle", text: "A chalk circle with a key inside. An arrow points to the seed vault in the back left corner. Under it: the key is not here, read the notes." },
        "garden-sign4": { title: "Potting Shed Sign", text: "POTTING SHED. MIND THE STEP. A small watering can is painted next to the words, in green. The step really is high." },
      },
      key: { name: "Greasy steel key, wire loop", tag: "\"Parts cage. Fix something good.\" The greasy steel key hangs on a twisted loop of wire. It smells like motor oil and leaves marks on your fingers." },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
