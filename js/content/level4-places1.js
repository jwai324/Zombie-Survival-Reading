/* Reading level 4: places, part 1 (gasngo, grocery, hardware, pharmacy, autoshop, radioshack, garden). Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[4] = root.ZSR.TEXT[4] || { level: 4 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    /* ---------- Gas-N-Go ---------- */
    gasngo: {
      blurb: "A small gas station with a garage, fuel cans on the floor, and a locked storeroom off the back hall.",
      door: {
        title: "Ruby's Note on the Door",
        text: "Ruby. Read this before you touch the handle.\n\nAt least three walkers are in there. One stands in the garage on the right, by the car lift. The others could be anywhere. That is today's count, not tomorrow's. More come as the days pass, so if you want this place, come soon.\n\nThe fuel cans are on the floor, not on the shelves. One sits by the slushie machine, in the front corner on your left. The other is in the garage, by the tire tower. Look low, not high.\n\nThe storeroom is locked. Do not kick it. The clerk kept a note on the counter by the front door. It tells you how to get in. Read first, then open.",
      },
      notes: {
        "gasngo-counter": {
          title: "Dev's Note at the Register",
          text: "This is Dev. I was the night clerk here. I was still behind this register when the lights went out for good. If you are reading this, you got past the walkers. That makes you tougher than most.\n\nThe storeroom key is in the {pick} of this counter, right under this note. Open that drawer, and only that one. The key inside opens the storeroom door. Inside there is more fuel, stacked against the far wall, and a spool of wire.\n\nNow the warning, so please read it twice. Open no other drawer. My sister Ruby rigged the other two with a bomb trap for looters. It is not a bluff. Open the wrong drawer, and the blast kills whoever opens it. Say the name of the right drawer out loud before you pull.\n\nThe storeroom is off the back hall. The ice machine sits at one end of that hall. Walk to the far end, away from it. The storeroom is the last door before the garage.\n\nI am heading to Ortiz Auto, on the east side of town. The shop is still standing, and Mr. Ortiz can fix almost anything with an engine. If you need seeds or soil, go see Rosa at Greenhouse Row. It is west, past this gas station.",
        },
        "gasngo-trail1": {
          title: "Ruby Goes East",
          text: "Ruby again. If you read my door note, you know I keep things short. This one is longer. Bear with me.\n\nI came back here after a week of scouting the north side. Dev was gone. His note was still by the register, right where he always said he would leave word. My little brother writes the way he talks, fast and sure of himself. He went east to Ortiz Auto to fix a truck. Then the two of us could finally leave town.\n\nSo I am going east after him. Today, before the light goes.\n\nI asked Jo to say it on the radio, on her nightly show. Ruby is looking for Dev. If you see a skinny kid in a gas station vest, tell him I am coming. Tell him to stay put for once in his life.\n\nThere is one more thing in this building you should see. I left a second note on the floor behind the counter, near the register. It is across the shop from the slushie machine. That one is for anyone who reads this far. Most people never do.",
        },
        "gasngo-trail2": {
          title: "Ruby Explains the Ring",
          text: "You read this far. Good. That is the whole point.\n\nHere is how it works now. Jo and I made a rule: take what you need, leave the rest. Every stash in town is locked. Its key is hidden in another building, with a note that says where. Smash-and-grab crews do not read notes. People like you do. So only people who read can find the keys.\n\nThere is a key in this building. It lies on the floor in the garage, beside the tire tower. It is a small brass key on a green plastic tag. You will walk right past it if you are not looking down.\n\nThat key opens the staff locker at Corner Grocery, east of here. Hana, the grocery manager, gave it to me on the first day of the ring. She trusted me with her best supplies. Now I am trusting you.\n\nBe careful at that locker, because it has a fussy lock. The wrong key jams it, and after that only a crowbar opens it.\n\nTake what you need from the staff locker, and leave some for the next one. That is the deal.\n\nRuby.",
        },
        "gasngo-dead1": {
          title: "Dev's Last To-Do List",
          text: "SHIFT LIST. Friday night. Dev, closing.\n\nMop the floor. All of it this time, even behind the drink cooler, or the boss will notice again.\nFill the coffee. Both pots. The truckers get grumpy after midnight if it runs out.\nFix the ice machine. It is making that grinding noise again. Kick the left side, gently.\nRestock the gum by the register. The mint kind always sells out first.\nCount the drawer twice before locking up.\n\nAnd at the very bottom, underlined twice: Call Ruby back. She called three times today. She says it is about the news. Some sickness across the river. Probably nothing. It is always important with her. Call her back anyway, before she drives over here and yells.\n\nThe list is written in Dev's quick, slanted handwriting, on the back of a fuel receipt. It was taped to the break room wall on his last shift before the Fall. The paper has curled, and the ink has gone a little gray.\n\nNothing on the list is crossed off. Not one line. The mop still leans in its bucket by the ice machine. The coffee pots sit empty and stained. The ice machine is silent now, with its door hanging open. Nobody ever called anyone back.",
        },
        "gasngo-dead2": {
          title: "Pencil on a Receipt",
          text: "The note is a scrap of receipt paper, curled at the edges. The writing is shaky pencil, pressed hard, as if the writer's hand would not stop trembling. It is not signed.\n\nFound the storeroom key. It is in the {decoyPick} of the counter, by the register. I saw the clerk drop it in there on his last night. Do not waste time searching the shelves. Just pull that drawer, grab the key, and get to the storeroom. Be quick, before the walker by the car lift hears you. There is fuel back there, I know it.\n\nThe pencil runs out at the edge of the paper. On the front is a receipt for two snacks and a soda. The date on it is from the very first week of the Fall.\n\nThat date matters. This scrap was written before Ruby set her traps in the counter drawers. Back then, any drawer was safe to open. Now only one is. Whoever wrote this never knew about the traps.\n\nDev's note on the counter is newer. It says which drawer is safe now. Read his, not this.",
        },
        "gasngo-dead3": {
          title: "Lost Dog Named Peanut",
          text: "LOST DOG. PLEASE HELP.\n\nHer name is Peanut. She is a small brown dog with one white ear that flops over. She is very friendly and will come if you say her name in a happy voice. She wears a red collar with a little bell. You may hear her before you see her.\n\nPeanut is afraid of thunder. When a storm comes, she runs and hides in tight places. She may be under a porch, a car, or a shed. Please check before you close your doors.\n\nShe has been missing since the big storm on Tuesday night. We miss her very much. Our kids cannot sleep.\n\nREWARD if found. Call us any time, day or night.\n\nThe flyer is taped to the end of a shelf in the middle of the shop. It has been there a long time. The sun has faded the photo until Peanut is only a pale shape with one lighter ear.\n\nSomeone has added a line by hand, in blue pen. Peanut used to wait by this gas station for treats. I always gave her one. D.\n\nBelow that, the bottom strip is gone. The phone number has been torn off, leaving a ragged edge.",
        },
      },
      signs: {
        "gasngo-sign1": {
          title: "Faded Store Sign",
          text: "Faded red letters on a long plastic sign: Gas-N-Go, always open. Someone has crossed out the word always and written not above it in thick black marker. Fair enough.",
        },
        "gasngo-sign2": {
          title: "Red Spray Paint",
          text: "A big red R by the front door, sprayed in one fast stroke, with a 3 painted under it. Ruby counted three walkers in here. Smaller, underneath: Don't run. Walk and look.",
        },
        "gasngo-sign3": {
          title: "Chalk Circle",
          text: "A chalk circle by the old safe room door, with a small key drawn inside it. It means this lock's key is hidden in another building. Find the note that says where.",
        },
        "gasngo-sign4": {
          title: "STAFF ONLY",
          text: "A metal sign screwed to the wall beside the storeroom door: STAFF ONLY. Under it, in Dev's quick, slanted writing: Key in the counter drawers. Read my note before you open one.",
        },
      },
      key: {
        name: "Small brass key, green tag",
        tag: "A small brass key on a green plastic tag, worn smooth at the edges from many pockets. The tag says, in careful printing: Leave some for the next one. The brass has turned slightly green.",
      },
    },

    /* ---------- Corner Grocery ---------- */
    grocery: {
      blurb: "Corner Grocery, a neighborhood store with leftover food on the floor and a cold, locked walk-in cooler.",
      door: {
        title: "Doc Lin on the Glass",
        text: "Doc Lin, writing on the glass because I am out of paper.\n\nThe shelves are mostly picked over. Do not spend your strength there. The food that is left is on the floor. Look by the fish tank, along the left wall, and by the freezers on the right. It was knocked down in the first rush and never picked up.\n\nWalkers get in through the loading door at the back, by the forklift. It does not latch anymore, so they keep wandering in. Count on at least three inside, and expect more if you linger.\n\nThe walk-in cooler still stays cold, and it is locked. The manager's note is in the office, back left. Read it before you pull on that door. It saves time, and it saves noise.",
      },
      notes: {
        "grocery-counter": {
          title: "Hana's Cooler Trick",
          text: "Hana here. I have managed this store for six years, and I am still managing it, sort of.\n\nFirst, the cooler. Its latch sticks, and everyone who tries the door thinks it is broken. It is not. There is a trick, and it only works one way. To open it, {moves}, in that order. Take a breath first, and do each move slowly and on purpose.\n\nWork the latch any other way, and it jams tight. I mean jammed for good. After that, only a crowbar opens the cooler, and you would have to go home and build one. So read the trick twice before you touch the handle.\n\nYou will not have to look far. Step out of this office into the back hall and head toward the forklift. The cooler is the very next door along the hall, with COOLER on its sign.\n\nInside there is food, more than these shelves have held in a month. There is also one medical kit, sealed and waiting.\n\nIf you need medicine, go to Mile 9 Pharmacy, west of here. Last week it still had medicine on its shelves. Mr. Okafor runs it. He is careful, so do not be greedy there.",
        },
        "grocery-trail1": {
          title: "Doc Lin's Medicine Route",
          text: "Doc Lin. If you are reading this, please do not empty the cooler completely. Let me explain why.\n\nI carry medicine along a route. I start here, at the grocery. Then I go to the pharmacy and fill my bag. From there I head north, up into the hills, to St. Anne Annex. Nurse Ada stayed there when everyone else left. She keeps the generator running and the patient records safe.\n\nSome of what Ada needs must stay cold. Hana lets me keep it in the cooler here, until I can carry it the whole way. A cold pack lasts about a day in my bag. That is just enough.\n\nBut I have not reached Ada for weeks now. The road into the hills is full of walkers. Every time I try, I turn back. I hate turning back. Ada must think I have given up on her.\n\nHana left a note for the next reader, out on the loading dock, beside the forklift. Head to the back of the store, where the loading door is. She knows more than I do about what is hidden here.",
        },
        "grocery-trail2": {
          title: "Hana's Key for the Ring",
          text: "Hana again. Doc Lin sent you back here, I bet. She sends everyone.\n\nHere is what I know about the ring. Every stash in town is locked, and every key sits in some other building. Ruby and Jo set it up. People who read find the keys. People who smash things find locked doors.\n\nThere is a key in this store. It lies on the floor beside the gumball machine, near the front of the store, not far from the checkout lanes. It is a long silver key on a red string. Look for a flash of red on the tiles.\n\nThat key opens the narcotics safe at Mile 9 Pharmacy, west of here. Mr. Okafor gave it to me for the ring. He told me why, too. He said I never took more than I needed, not once, not even in the first bad week. I still do not.\n\nBe careful at the safe, because its old lock bites. Put the wrong key in it, and the key snaps off inside and is gone for good.\n\nSo open the narcotics safe, count what you take, and leave the rest for Doc Lin.",
        },
        "grocery-dead1": {
          title: "A Kid's Shopping List",
          text: "SHOPPING LIST\n\nPeanut butter. The crunchy kind, NOT the smooth kind.\nBatteries. For the flashlight AND the game.\nDog food.\n\nThe list is written in big green crayon letters, on the back of a school worksheet. Next to dog food, a grown-up has written in neat blue pen: We don't have a dog.\n\nUnder that, in green crayon again, pressed so hard the paper tore a little: Yet.\n\nThe list is folded into a small square and left at the top of aisle 2, under the BREAD sign. Someone must have dropped it while shopping, long before the Fall. On the other side is a math worksheet. Most of the answers are right.\n\nIn the margin, somebody drew a dog with floppy ears and a huge pink tongue. The dog is labeled ROCKET. Then that name is crossed out and changed to CAPTAIN. Then that is crossed out too, and changed back to ROCKET. A dog that does not exist yet already has two names.\n\nAt the bottom, a teacher has written in red: Good work, but please stay on task.\n\nPip would like this kid.",
        },
        "grocery-dead2": {
          title: "Cardboard Latch Tip",
          text: "A flap of cardboard lies on the floor just inside the front door. It was torn from a cereal box, and the writing is in thick black marker. It is not signed.\n\nCOOLER TIP. The walk-in cooler at the back is still cold, and it is full of food. The latch sticks, but there is a trick. Do it exactly like this: {decoyMoves}. Do it firmly, in one smooth go. I have done it a dozen times, and it works every time. Tell your friends, but not too many friends.\n\nThe cardboard is soft and stained, as if it lay in a puddle for a while. A price sticker on the back has gone pale. This tip has been here a long time.\n\nHere is the problem. That was the trick for the old latch. The old one broke in the first month, and Hana put in a new one. The new latch works a different way. Work it wrong, and it jams.\n\nHana's note in the office, back left, has the trick that works now. Read that one before you touch the cooler.",
        },
        "grocery-dead3": {
          title: "Hana's Last Work Schedule",
          text: "CORNER GROCERY STAFF SCHEDULE\nPosted by Hana, manager. Please check your shifts.\n\nMonday. Morning: Hana. Evening: Hana.\nTuesday. Morning: Hana. Evening: Hana.\nWednesday. Morning: Hana. Evening: Hana.\nThursday. Morning: Hana. Evening: Hana.\nFriday. Morning: Hana. Evening: Hana.\nSaturday. Morning: Hana. Evening: Hana.\nSunday. Close early. Lock up. Go home.\n\nIt is Hana's work schedule for the week the Fall began. Hana put her own name on every single shift. Small notes are squeezed into the margins in pencil.\n\nNext to Monday: Everyone else called out or went to family. That is fine. I have the keys, and I know where everything is. I can do it.\n\nNext to Tuesday: Half the town came in for batteries and candles. Ran out of both by dinner.\n\nNext to Wednesday: Bread truck did not come. Milk truck did not come. Sold out of water by noon.\n\nNext to Thursday: People are scared. Gave the last flashlights away. Did not charge anyone.\n\nNext to Friday: Radio says stay inside. Kept the doors open until dark anyway. Some folks had nowhere else to buy food.\n\nUnder the last line, in newer ink, darker and steadier than the rest:\n\nStayed anyway.",
        },
      },
      signs: {
        "grocery-sign1": {
          title: "Bread Sign",
          text: "A cheerful printed sign with a smiling loaf of bread: Corner Grocery, fresh bread every morning! The wire bread rack under it is empty, except for dust and one twist tie.",
        },
        "grocery-sign2": {
          title: "Black Marker",
          text: "Black marker, big and slanted across the wall: The loading door at the back doesn't shut. Under it, underlined twice: Watch your back. An arrow points toward the back of the store.",
        },
        "grocery-sign3": {
          title: "Soup Sale",
          text: "A bright orange sale sign: SOUP, TWO CANS FOR THE PRICE OF ONE! Someone has added underneath, in pen: Deal still stands. Everything is free now.",
        },
        "grocery-sign4": {
          title: "Walk-In Cooler",
          text: "A printed sign on the cooler door: WALK-IN COOLER. KEEP THE DOOR CLOSED. Under it, in Hana's small, neat writing: The trick is in my note in the office. Do it any other way, and the latch jams.",
        },
      },
      key: {
        name: "Long silver key, red string",
        tag: "A long silver key, threaded on a loop of red string that is tied in a double knot. A paper tag hangs from the string. It says, in neat print: Count what you take.",
      },
    },

    /* ---------- Reyes Hardware ---------- */
    hardware: {
      blurb: "Reyes Hardware, a big hardware store with nails, tools, lumber, and a locked back room.",
      door: {
        title: "Mr. Reyes Nailed This Up",
        text: "This store belongs to me, Mr. Reyes, the owner. Forty years behind that counter, and I am not giving it up to anything.\n\nAt least five walkers are inside. Two stand in the middle aisles. The rest are wherever they like. Have your gun ready before you step in, and keep your eyes up.\n\nNails are by the toilet display, in the front corner on your left. Tools are in the middle aisle, on the floor between the shelves. Lumber is in the lumber racks at the back of the store, stacked flat.\n\nThe back room is locked. My note is by the paint mixer, in the back left corner, and it explains the trick to that door. Read it. Do not force my door.",
      },
      notes: {
        "hardware-paint": {
          title: "The Sticking Door",
          text: "Mr. Reyes again. You found the paint mixer, so you have sharp eyes. Good.\n\nNow, the back room. Its door sticks in its frame. It always stuck, even before the Fall, and I never fixed it because it kept customers out. People shove it, kick it, and give up. There is a right way. To open it, push it {move1}, then {move2}. Two pushes, in that order, and nothing else.\n\nPush it any other way, and it jams for good. The frame bites down on the door, and no hand can shift it. After that, only a crowbar opens it. So read those two words again before you lay a hand on it.\n\nGetting there is simple. Take the side door here, by the paint mixer. It leads into the lumber room. Walk on past the lumber racks, and you reach the back room door.\n\nInside I left a water filter, a second tool kit, and a stack of good lumber. I hid them there on purpose, for someone who reads.\n\nIf you need more wood, go to Ridge Lumber, on the east ridge. Carla has stacks of lumber taller than a van. If you need more filters, go to the Water Tower, on the west side of town. Its pump house has more filters.",
        },
        "hardware-trail1": {
          title: "Where the Keys Were Cut",
          text: "Mr. Reyes. Let me tell you how the key ring started, because it started right here.\n\nRuby and Jo walked in one gray morning. Ruby had a list of every building with a lock worth keeping. Jo had the idea. Lock the best supplies away, they said, and hide each key somewhere else. Leave a note that says where. People who smash and grab will never find them. People who read will.\n\nI liked it at once. Reading is a habit, and habits are honest.\n\nSo I cut the first keys on the key machine in this store. It sits behind the checkout counters, near the front. Fifteen keys for fifteen stashes. It took me two days and most of my blanks. My hands were sore for a week.\n\nHere is the rule I care about most. No key stays in the building it opens. Each one waits somewhere else, with a note. That way, every key points you onward.\n\nMy other note is in the paint department, near the paint mixer. Head for the back of the store, under the big PAINT sign. It tells you about the key I hid here.",
        },
        "hardware-trail2": {
          title: "The First Key I Cut",
          text: "Mr. Reyes, by the paint mixer, as promised.\n\nMy key lies on the floor beside the toilet display, against the wall. Kneel down and look in the gap. It is a copper key with a leaf scratched into its head. I scratched that leaf myself, with a nail, so nobody would mistake it.\n\nThat key opens the seed vault at Greenhouse Row. Greenhouse Row is far west across town, past the gas station. Rosa runs it. The seed vault has a plain lock, so a wrong key just will not turn in it.\n\nIt was the very first key I cut for the ring. Rosa came in the next day with a bag of bean seeds for me. She wanted her vault key kept here, of all places. I asked her why. She laughed and said a hardware store is the last place a seed thief would look. Seed thieves want food, she said, not nails. She was right. Nobody has touched it.\n\nWhen you open the seed vault, take a few packets and plant them somewhere. Rosa would want that more than anything. Seeds only matter once they are in the dirt.",
        },
        "hardware-dead1": {
          title: "Borrowed Tools Ledger",
          text: "BORROWED TOOLS. Reyes Hardware.\nWrite your name. Bring it back. That is the whole system.\n\nCarla: one long saw.\nMr. Reyes added: For the boat planks. Her crew is building boats for the River Convoy. She will return it sharper than she took it. She always does.\n\nChief Dunn: two ladders.\nAdded: Both aluminum, the tall ones. He says they are for the station roof. He signed for them twice, because he is a list man, like me.\n\nTheo: one pipe wrench. Never returned. Again.\nAdded, pressed hard into the paper: This is the third wrench, Theo. The THIRD. I know the pumps need it. I know the pumps are important. I would still like my wrench.\n\nAt the bottom of the page, a different hand has written: Will bring it back next week, promise. T.\n\nUnder that, Mr. Reyes wrote one word: Sure.\n\nThe list is clipped to a board in the lumber racks, by the stacked planks, beside an empty hook. The hook has a strip of tape over it, with PIPE WRENCH written in marker. The tape is starting to peel. Theo has not been back since.",
        },
        "hardware-dead2": {
          title: "A Paint Chip Card",
          text: "A note in pencil, folded into a paint chip card, sits on the floor outside the paint vault door. It is not signed.\n\nTo whoever comes next: the back room door looks stuck, but it is not locked. I worked here on weekends, so I know its moods. Push it {decoyMove1}, then {decoyMove2}. Lean your weight into the second push, and the door pops free. Inside are a water filter and a whole tool kit. The old man left them for himself, but he will not miss them.\n\nThe pencil is smudged, and the card is dusty. The paint shades printed on it are called Storm Gray, Thunder Blue, and Rain Cloud.\n\nThat is almost funny, because of the storm. A hard storm came through after this note was written. The wind bent the back room door frame, and now the door sits crooked. The old way of pushing it does not work anymore. Push it wrong now, and it jams.\n\nThis note was written before the frame bent in the storm. Mr. Reyes's note by the paint mixer has the way that works now. Read his before you touch that door.",
        },
        "hardware-dead3": {
          title: "My Grandson's Drawing",
          text: "A crayon drawing on thick yellow paper hangs at the end of the aisles, by the garden center door. A strip of tape holds it up.\n\nIt shows Reyes Hardware from the outside. The building is a big brown box with a red roof. Over the door, in wobbly letters, it says REYES HARDWARE, with the S drawn backward.\n\nMr. Reyes is in the drawing too. He is a giant, much taller than the store. He has a gray mustache, a red shirt, and a hammer as big as a car. He is smiling. The sun has a face and is smiling too.\n\nEvery window in the drawing has a board nailed over it. The boards are brown crayon, drawn in crosses. Each nail is a careful black dot. There are a lot of dots.\n\nAt the top, in the same wobbly letters: GRANDPA'S STORE.\n\nAlong the bottom, Mr. Reyes has written in pen:\n\nMy grandson drew this the week the Fall began. None of us knew yet what was coming. He is right. We did that next. Boards on every window, two nails each, just like the picture. That boy always did notice the details.",
        },
      },
      signs: {
        "hardware-sign1": {
          title: "Hand-Painted Store Sign",
          text: "A big hand-painted sign in red and white: Reyes Hardware. Under the name, in smaller letters: If we don't have it, you don't need it. The paint is chipped, but every letter is still straight.",
        },
        "hardware-sign2": {
          title: "Spray Paint",
          text: "Ruby's red R by the front door, sprayed tall, with a 5 under it. Below that, smaller and quicker: Two in the middle aisles. Count the others as you go.",
        },
        "hardware-sign3": {
          title: "KEYS CUT HERE",
          text: "A printed sign with a black arrow: KEYS CUT HERE. Someone has drawn a chalk circle with a key inside, right next to the arrow. The arrow points toward the paint vault, in the paint department.",
        },
        "hardware-sign4": {
          title: "Marker by the Door",
          text: "Written on the wall right beside the back room door, in thick black marker: IT STICKS. Read my note by the paint mixer before you push it. Signed underneath, with a proud flourish: Mr. Reyes.",
        },
      },
      key: {
        name: "Copper key with a leaf",
        tag: "A copper key with a small leaf scratched into its head. Its cardboard tag is tied on with a bit of green twine. The tag says, in green ink: Take only what you need. The twine is frayed at both ends.",
      },
    },

    /* ---------- Mile 9 Pharmacy ---------- */
    pharmacy: {
      blurb: "Mile 9 Pharmacy, a small drugstore with medical kits on the floor and a locked cabinet room.",
      door: {
        title: "Mr. Okafor's Door Note",
        text: "From Mr. Okafor, the pharmacist. Please read all of this.\n\nThere are two medical kits out on the floor. One is by the giant toothbrush, on the left side of the store. The other is in the middle, where the aisles cross. Both sit low, where the bandages used to be. People in a hurry look up and miss them.\n\nAt least five walkers are inside. Most of them stay near the back. They are slow, but they do not stop once they turn toward you.\n\nThe cabinet room is locked with a keypad. The code is on my note behind the counter. Get behind the counter at its right end, by the wheelchairs. Do not guess the code. A wrong guess costs far more than time.",
      },
      notes: {
        "pharmacy-counter": {
          title: "The Cabinet Room Code",
          text: "Mr. Okafor. You made it behind the counter. Well done.\n\nThe cabinet room has a keypad beside its door. The code is {code}: {codeSpoken}. Press each number firmly, and wait for the small green light after each one. The lock clicks when it lets go.\n\nUse that code and no other. Do not guess, and do not try an old code you found somewhere. One wrong code sets off the alarm. The noise carries for blocks. Walkers pour in, even through the front door, and they keep coming until they get you. You cannot simply walk back out.\n\nYou are close already. The cabinet room door is back here behind the counter, in the corner on the same side as the wheelchairs.\n\nInside are two more medical kits and a water filter. I packed the kits myself. Each one has bandages, tape, and pain tablets, checked and sealed. Please take only what you need.\n\nIf you need more than that, you will have to go north. St. Anne Annex is the hospital in the north hills. It still has medicine, and it has a generator. Nurse Ada stayed there to keep it running. But I must be honest with you. It is the most dangerous place in town. Go in daylight, and go rested.",
        },
        "pharmacy-trail1": {
          title: "Doc Lin Turned Back",
          text: "Mr. Okafor. A word about Doc Lin, since you may meet her.\n\nDoc Lin stops here every few days. She fills her bag from my shelves, always for Nurse Ada at the hospital. She writes down everything she takes, down to the last tablet. I respect that very much.\n\nLast time she came back early. Her bag was still full. She had turned back on the road up the hill below St. Anne Annex. There were too many walkers on it, she said, a whole line of them across the road. She sat on my counter for an hour and did not speak.\n\nNow she has a new plan. Sergeant Vega and Chief Dunn are putting together the River Convoy, trucks and boats going north. Lin plans to ride north with the convoy as far as St. Anne. Then she will walk the last stretch to Ada. I hope the convoy leaves soon. She is tired of waiting.\n\nI left a second note on the floor near the giant toothbrush, under the SMILE poster. It is about something I was asked to keep safe.",
        },
        "pharmacy-trail2": {
          title: "A Key With Blue Paint",
          text: "Mr. Okafor, by the giant toothbrush, as promised.\n\nYou have heard about the key ring by now, I expect. Every stash in town is locked. Its key waits in another building, with a note like this one. I agreed to hold one key, and I take that seriously.\n\nThe key lies on the floor beside the pill bottle, near the front of the store. It is a stubby iron key with drops of blue paint on it. The paint makes it look like trash, which is the point. Thieves step over trash.\n\nThat key opens the paint vault at Reyes Hardware, east of here across town. Mr. Reyes cut this key himself, on his own machine. Then he gave it away. He keeps none of his own keys, not one. That is how the ring works. Nobody guards their own door. Everybody guards someone else's.\n\nThe paint vault has a fussy lock. The wrong key jams it, and after that only a crowbar opens it.\n\nWhen you open the paint vault, remember who made the key. Take what helps you, and leave the rest.",
        },
        "pharmacy-dead1": {
          title: "An Unclaimed Prescription",
          text: "A white paper pharmacy bag, folded over twice at the top and stapled shut. It lies in the cross aisle, between the shelves. Other bags nobody came back for are scattered nearby.\n\nPatient: June.\nFor: sore knees.\nTake one tablet with food, twice a day. Do not take more than four in one day.\nPharmacist: Mr. Okafor.\nReady for pickup.\n\nAcross the front, in Mr. Okafor's tidy blue pen:\n\nShe always forgets these. Every single month. She comes in to tell me about her tomatoes, chats for twenty minutes, and leaves without her pills. Then she calls from the school garden, out of breath. She asks me to hold them one more day. I always do. I even drew a small tomato next to her name, to tease her.\n\nUnder that, he wrote more, in smaller letters.\n\nJune, if you ever see this, the pills are still here. Your knees will thank you. Come and get them. You do not even have to talk about tomatoes. Well. Maybe a little.\n\nThe pills inside rattle when you lift the bag. Nobody has opened it. The staples are still tight.",
        },
        "pharmacy-dead2": {
          title: "Yellow Sticky Note",
          text: "A yellow sticky note, curled at one corner, lies on the floor just inside the front door.\n\nCABINET ROOM CODE: {decoyCode}.\nStaff only! Do NOT share with customers.\nRemember to clear the keypad after you close the door, or it beeps all night.\n\nBelow it, in a different pen, smaller:\n\nNew guy, this is for you. Don't lose it again.\n\nIt looks official. The handwriting is neat, and the warning sounds like a real pharmacy rule. Anyone in a hurry would trust it.\n\nBut look closer. The yellow has faded almost to white on the side that faced the window. The glue gave out long ago, and the note fell off the wall. It is old, from back when the store still had a new guy, customers, and a line.\n\nMr. Okafor changes his codes often. He is careful that way. After the first week of the Fall, he changed this one. Now this old code only sets off the alarm.\n\nThe code on his counter note is the one that works. Go read that one instead.",
        },
        "pharmacy-dead3": {
          title: "A Customer Comment Card",
          text: "HOW DID WE DO? We value your feedback! Please drop this card in the box by the door.\n\nDate: a Tuesday, the week before the Fall.\nRate your visit, from one to five stars: one star.\n\nComments: The line is too long. I waited forty minutes for one bottle of cough syrup. There was only one person working. There were six people in line, and one of them was singing. Please hire more staff. Also, the music is too loud.\n\nUnder the printed lines, Mr. Okafor answered in red pen:\n\nThen come back when it is shorter.\n\nHe did not throw the card away. He pinned it up by the checkout counter at the front. A gold star sticker sits beside his answer. Someone else drew a smiley face next to the star.\n\nUnder it is a newer line, in the same red pen.\n\nI would give a great deal for that long line now. Forty minutes, six people, the singing, all of it. If the writer of this card is still out there, come back. There is no line at all.",
        },
      },
      signs: {
        "pharmacy-sign1": {
          title: "Counter Sign",
          text: "A neat printed sign stands by the pharmacy counter: PLEASE WAIT TO BE CALLED. Someone has added underneath, in blue pen: We will call you. Someday.",
        },
        "pharmacy-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R by the front door, with a 5 under it. Five walkers when she counted. A long red arrow points toward the back of the store: Most of them stay back there.",
        },
        "pharmacy-sign3": {
          title: "Health Poster",
          text: "A faded health poster shows a smiling cartoon drop of water: CLEAN WATER SAVES LIVES. In smaller print at the bottom: If you can't filter it, boil it. Every time.",
        },
        "pharmacy-sign4": {
          title: "CABINET ROOM",
          text: "A sign on the door: CABINET ROOM. STAFF ONLY. Under it, in small, neat pen: Code changed. Use the one on the counter note, not the old sticky.",
        },
      },
      key: {
        name: "Stubby iron key, blue paint",
        tag: "A stubby iron key, speckled with drops of blue paint, on a scrap of cardboard tied with wire. The tag says: Cut by Reyes. The letters are stamped, not written. The wire is twisted tight.",
      },
    },

    /* ---------- Ortiz Auto ---------- */
    autoshop: {
      blurb: "Ortiz Auto, a repair shop on the east side with engine parts on the benches and a locked service pit.",
      door: {
        title: "Dev's Chalk on the Door",
        text: "Hey. It's Dev, from the Gas-N-Go. Chalk is all I had, so I wrote big.\n\nEngine parts are on the workbenches. One bench is in the back right corner, by the red tool chest. The other is in the left bay.\n\nAt least five walkers are inside. One of them stands in the parts room by the engine crane, still as a tool on a hook. Cross that side quietly so it does not hear you.\n\nThe service pit is covered by a locked hatch, a big steel one. Don't bother prying it. Mr. Ortiz left a note in the office behind the waiting room. It explains the trick. Read the note, and do exactly what it says.",
      },
      notes: {
        "autoshop-office": {
          title: "Mr. Ortiz on the Hatch",
          text: "This is Mr. Ortiz. Thirty years I have run this shop, and not one car left here worse than it came in.\n\nThe hatch over the service pit looks jammed, but it is only bolted. The bolt is tricky. I put it in strange on purpose, so thieves would fight it and give up. To open it, {moves}, in that order. Two moves, firm and slow, and the bolt slides right out.\n\nDo not try any other way. Any other way bends the bolt and jams the hatch. A bent bolt does not come back. After that, only a crowbar opens it, and that is a long trip home to build one.\n\nThe pit room stands in the middle of the shop, inside its own walls. Walk around to its front side, toward the oil drums. That is where the hatch is.\n\nThe generator is down in the pit, wrapped in a gray tarp. There are spare parts beside it, and a full fuel can. The generator runs rough for a minute, then settles. Be patient with it.\n\nIf you need wire or radio parts, go to Signal Electronics, downtown. The shelves still have both. But it sits near the walker crowds. Go early, and leave before sunset.",
        },
        "autoshop-trail1": {
          title: "Ruby, We Fixed the Truck",
          text: "Ruby,\n\nIf you are reading this, you followed me east, just like I knew you would. You never could leave a note unread.\n\nGood news first. Mr. Ortiz and I fixed the truck together, and it runs. It took eleven days, two busted knuckles, and a lot of grumbling. The engine coughs a little, but it goes.\n\nHere is the part you will not like. We are driving west to the Water Tower. Theo has clean water there, and room for two. Mr. Ortiz says a truck is no good without water for the people in it. He is right. You know he is right. I hate it when he is right.\n\nI am sorry I did not wait for you. I wanted to. But the walkers on this street get thicker every night, and Mr. Ortiz is not young. I could not ask him to stay.\n\nCome west. I will watch for you every day.\n\nMr. Ortiz left a note at the back of the shop, beside the red tool chest. Read it. He already trusts whoever reads it.\n\nYour brother, Dev.",
        },
        "autoshop-trail2": {
          title: "Chief Dunn's Red Key",
          text: "Mr. Ortiz. The boy told you where to find me. Good.\n\nBefore I go west, I have one more job. There is a key in this shop, and it belongs to the ring. It lies on the floor of the waiting room, beside the soda machine. Look low, along the floor by the machine. It is a big key painted fire-engine red, on a brass ring. You cannot miss it, unless you are not looking.\n\nThat key opens the chief's locker at Station 12. The fire station is north and west of here, a fair drive.\n\nChief Dunn left it with me as thanks. I fixed the convoy's trucks for him, both fire trucks, new brakes and all. He would not let me refuse payment. So he gave me this key, and I gave it to the ring.\n\nBe careful at the chief's locker. Its old lock bites: the wrong key snaps off inside it and is gone for good.\n\nOpen the chief's locker. Take what helps you. Then pass the favor on, the way Chief Dunn did. A favor only counts if it keeps moving.",
        },
        "autoshop-dead1": {
          title: "The Job Board",
          text: "ORTIZ AUTO: JOBS IN THE SHOP\nDone jobs get a check mark.\n\nChief Dunn's fire truck: new brakes. Check.\nMr. Ortiz added: Front and back. The pads were worn down to metal. He drove it here anyway, with the siren off, very slowly.\n\nSergeant Vega's van: new tires. Check.\nAdded: All four. Vega asked for the cheapest ones. I gave her the good ones. She does not need to know.\n\nCarla's boat motor: not done yet.\nAdded: Needs a new pull cord and a part I do not have. Carla says the boats can wait, but the river will not. She means it as a joke. I do not think it is a joke.\n\nThe list is written in black grease pencil on a whiteboard in the waiting room, by the chairs. Below it, a last line has been squeezed in at the bottom, smaller:\n\nNext: the convoy trucks. All of them. Hope for parts.\n\nNobody has wiped the board since the Fall. A few of the letters have smudged where someone leaned against it. The tray underneath still holds three stubs of grease pencil, worn almost to nothing.",
        },
        "autoshop-dead2": {
          title: "Greasy Hatch Tip",
          text: "A note on greasy brown paper is tucked under the edge of the hatch, by the pit room. Grease thumbprints cover the corners. It is not signed.\n\nHATCH. Don't waste your time prying at it. The bolt comes out easy if you {decoyMoves}. That's it. I watched the old man do it a hundred times while I waited for my car. He never even looked down. There's a generator in that pit, and he's not using it.\n\nThe paper is soft with oil, and the pencil has nearly worn away in places. A date in the corner is from long before the Fall. Back then, this shop still had customers waiting for their cars.\n\nThat is the catch. This was how the old bolt worked. The old bolt wore out, and Mr. Ortiz put in a new one. The new bolt works a different way. A wrong move bends it and jams the hatch.\n\nMr. Ortiz's note by the office tells the real trick. It is pinned to the office window, behind the waiting room. Read that one, not this one.",
        },
        "autoshop-dead3": {
          title: "An Old Shop Photo",
          text: "An old photo, faded to yellows and browns. It is tucked into the frame of a mirror in the parts room, by the door to the shop.\n\nTwo men stand in front of a tow truck. The truck is bright orange, with ORTIZ AUTO painted on the door in white letters. The older man is Mr. Ortiz, with more hair and less gray. He rests one hand on the truck's bumper, like it is an old friend.\n\nThe younger man is maybe twenty. He wears oil-stained coveralls and holds a wrench up to the camera, as if it were a prize. He has a crooked grin, lopsided, higher on the left side.\n\nOn the back of the photo, in Mr. Ortiz's square handwriting:\n\nMy best student. He never rushed a job. Not once, not even when I yelled. He listened to engines the way other people listen to music.\n\nYou know that grin. The young mechanic is Tomas's father. He has the same crooked grin as Tomas, the one Tomas wears when a stubborn engine finally starts. Tomas has talked about his father's old teacher. Here they both are, on the wall.",
        },
      },
      signs: {
        "autoshop-sign1": {
          title: "Shop Sign",
          text: "A painted wooden sign: Ortiz Auto, honest repairs. Under it runs a row of greasy handprints, big and small. It looks like a family of mechanics signed their names.",
        },
        "autoshop-sign2": {
          title: "Spray Paint",
          text: "Ruby's red R by the front door, with a 5 under it. Next to it, an arrow and a few quick words: One by the engine crane. It stands still until it hears you.",
        },
        "autoshop-sign3": {
          title: "Safety Poster",
          text: "A yellow safety poster: NEVER WORK UNDER A CAR ALONE. Someone has crossed out under a car and written anywhere above it. Now it reads: never work anywhere alone.",
        },
        "autoshop-sign4": {
          title: "SERVICE PIT",
          text: "A metal plate bolted to the wall: SERVICE PIT. KEEP THE HATCH SHUT. Under it, in chalk: The bolt bends if you work it wrong. Mr. Ortiz's note says how.",
        },
      },
      key: {
        name: "Big red key, brass ring",
        tag: "A big key painted fire-engine red, swinging from a heavy brass ring. The paint is chipped along the teeth. A leather tag on the ring says: Return the favor. It is heavy enough to feel in your pocket.",
      },
    },

    /* ---------- Signal Electronics ---------- */
    radioshack: {
      blurb: "Signal Electronics, a downtown electronics store with spools of wire, close to the walker crowds.",
      door: {
        title: "Jo's Sign in the Window",
        text: "This is Jo, from 88.1. You have probably heard my voice. Now read my handwriting.\n\nSpools of wire lie between the two long middle shelves. One is on the TV wall side, to your left. The other is on the robot side, to your right. Copper, mostly. Grab all you can carry.\n\nAt least six walkers are inside. One stands near the right end of the counter, by the robot, and does not wander far. The rest stand between the aisles. Keep the shelves between you and them.\n\nThe manager's office is locked. Priya, the manager, left a note on the counter at the back. Read it before you touch the office door. Trust me, that office does not forgive guesses.\n\nStay safe out there. Stay tuned.",
      },
      notes: {
        "radioshack-counter": {
          title: "Priya's Alarm and Code",
          text: "Priya here. I managed this store, and before that, I fixed everything that came through the door. Read all of this before you touch anything.\n\nFirst, turn off the alarm. Its panel is on the right wall, by the big dish. Press the {button} button, and only that one. Do this before anything else.\n\nThen go to the office. The keypad code is {code}: {codeSpoken}. Press each number firmly.\n\nNow the warning. A wrong button sets off the alarm. So does a wrong code. So does opening the office with the alarm still on. The noise is terrible, and walkers pour in, even through the front door. They keep coming until they get you.\n\nThe office door is in the back wall, near the robot, beside the MANAGER sign. You cannot miss that robot.\n\nThe office has two boxes of radio parts and more wire. The radio parts are the important ones. With them, you could build a radio of your own and hear Jo every night.\n\nTwo more places are worth your time. Both are north of downtown. The 4th Precinct is the police station, and it has gun parts. Lincoln Middle School has books, whole boxes of them. The school is easier. Go to the station only when you are rested.",
        },
        "radioshack-trail1": {
          title: "How Jo Got on the Air",
          text: "Jo here. You have heard me, maybe without knowing it was me. Let me tell you how it started.\n\nI broadcast on 88.1 every night, from a rooftop downtown. News, warnings, and messages. Which roads are blocked. Which buildings have new crowds. Who is looking for whom. Who has been found.\n\nNone of it would exist without Priya. She built my first transmitter right here in this store, from parts on these shelves. It took her three nights. The first time it worked, we sat on the floor and laughed until we cried.\n\nNow I carry messages. The most important ones go between Doc Lin and Nurse Ada. Lin is down in town, and Ada is up at the hospital. The road between them is full of walkers. They cannot reach each other, so they reach me. Every night, I read their words out loud, so the other one can hear.\n\nPriya left a note on the floor below the TV wall. She wants you to see it. So do I. Go on, it is a short walk.",
        },
        "radioshack-trail2": {
          title: "A Key Shaped Like Water",
          text: "Priya, below the TV wall. Jo said you would come.\n\nThere is a key in this store, and it is part of the ring. It lies on the floor beside the arcade game, near the front of the store. It is a long, thin key on a blue tag shaped like a drop of water.\n\nThat key opens the tool crib at the Water Tower, far west of here. It sits past the edge of town.\n\nHere is the story. Jo wanted an antenna on top of the water tower. From up there, her station could reach the whole valley. So Theo gave me the key to his tool crib. Jo and I could borrow his tools to put the antenna up. It is up now, and her signal reaches the whole valley.\n\nNow the key stays here, in the ring. Theo said that was better than giving it back.\n\nBe careful at the tool crib, because its old lock bites. The wrong key snaps off inside it and is gone for good.\n\nOpen the tool crib, and take what you need. And please, bring the wrench back. Theo counts his wrenches.",
        },
        "radioshack-dead1": {
          title: "Jo's Show Plan",
          text: "88.1 NIGHT SHOW: THE PLAN\n(Taped to this shelf so I stop changing it. Jo.)\n\nNews at dusk, every night, no matter what.\n\nWarnings first, always. Before anything else, before hello. Crowds on the move, roads to avoid, fires, floods. If someone tunes in for one minute, that minute should keep them alive.\n\nThen the rest of the news. Who reached where. What is still standing. What got picked clean.\n\nThen music. Three songs, maybe four. Something with a beat. Keep the volume low on the roof, because the street hears it too.\n\nThen a tip, if I have one. A stash, a safe road, a garden with seeds to spare. One tip a night, never more, so people keep listening.\n\nThen messages. Read every one out loud, slowly, twice. Names first, so people can stop and listen. Lin to Ada. Ada to Lin. Ruby to Dev. Anybody to anybody.\n\nSign off the same way every night. Stay safe. Stay tuned.\n\nAt the bottom, underlined three times: No sad songs. People have enough.\n\nBelow that, in Priya's handwriting: What about one sad song, on Sundays?\n\nAnd under it, in Jo's: No.",
        },
        "radioshack-dead2": {
          title: "Ink on an Envelope",
          text: "A torn envelope lies near the robot, at the end of the counter. Someone wrote on the back of it in blue ink, in a hurry. It is not signed.\n\nALARM PANEL. Big gray box on the wall by the dish. Four colored buttons. The one that turns the alarm off is the {decoyButton} one. Press it, wait for the light to go green, and the office is yours. I saw the manager do it on my last day of work. She did it without even looking.\n\nThe ink has smeared where a wet thumb pressed it. The envelope is addressed to the store, and the postmark is from before the Fall. The note is older than it looks.\n\nThat matters here. After this note was written, Priya rewired the panel. She moved the wires around on purpose, so old tips like this one would fail. The button that worked back then sets off the alarm now.\n\nPriya's note on the counter has the button that works now. Read hers, and trust hers.",
        },
        "radioshack-dead3": {
          title: "A Fire Station Repair Tag",
          text: "SIGNAL ELECTRONICS: REPAIR TAG\nKeep this half. Bring it back to pick up your item.\n\nTicket number: 0347.\nItem: handheld radio, red, from the fire station.\nOwner: Chief Dunn, Station 12.\nProblem: Only gets static.\n\nIn the chief's blocky letters: Worked fine Monday. Tuesday, nothing but hiss. Dropped it once, maybe twice. Need it for the convoy.\n\nRepair notes: In Priya's quick handwriting: Loose wire at the antenna. Cracked case, taped. Battery clip bent back into shape. Tested on three channels. Chief, please stop dropping it. It is a radio, not a hammer.\n\nFixed.\n\nThen, underlined, in the same hand:\n\nTell the convoy to stay on one channel. Every truck, every boat, the same one. When people spread out across five channels, nobody hears the warning in time. Pick one. Write it on the dashboards. Chief, I mean it.\n\nThe tag is torn along its dotted line, and the other half is gone with the chief. This half is still tied to the radio, which sits on the floor near the front door, fixed and waiting. Nobody ever came back for it. The convoy will need every radio it can get.",
        },
      },
      signs: {
        "radioshack-sign1": {
          title: "Store Sign",
          text: "A store sign that used to light up, dark now: Signal Electronics. Under it, in smaller blue letters: We fix what others throw away. Somebody has drawn a small smiley face beside the slogan.",
        },
        "radioshack-sign2": {
          title: "Spray Paint",
          text: "Ruby's red R, with a 6 under it. Six walkers when she came through. Beneath that, quick and slanted: One by the robot, at the end of the counter. It never leaves.",
        },
        "radioshack-sign3": {
          title: "Yellow Numbers",
          text: "Painted in huge yellow numbers, taller than you: 88.1. Under them, in smaller yellow letters: Jo, every night at dusk. Tune in. Somebody is listening. The paint has dripped a little.",
        },
        "radioshack-sign4": {
          title: "Office Door Sign",
          text: "A sign beside the office door: MANAGER'S OFFICE. PLEASE KNOCK. Under it, in black marker: Priya says look under the register. Don't knock. Something might answer. That last line is underlined.",
        },
      },
      key: {
        name: "Long thin key, blue tag",
        tag: "A long, thin key on a blue plastic tag shaped like a drop of water. The tag says, in small white letters: Bring the wrench back. Someone has underlined wrench twice.",
      },
    },

    /* ---------- Greenhouse Row ---------- */
    garden: {
      blurb: "Greenhouse Row, a line of glass greenhouses on the west side with seeds, soil, and a locked potting shed.",
      door: {
        title: "Rosa Painted the Gate",
        text: "Rosa here. I ran this greenhouse for twenty years, and I painted this gate myself, twice.\n\nSeed packets are in the shop by the gate, near the big gnome. Grab those first. They weigh nothing and they are worth everything. Soil bags are in the big greenhouse, the one with the scarecrow. They are heavy, so take one at a time.\n\nAt least five walkers are inside. One stays at the back of the big greenhouse, among the dead tomato vines. The others stand among the beds until something wakes them.\n\nThe potting shed is locked. My note is on the potting bench by the palm tree, in the back right. It tells you how to get in without breaking my lock. Please do not break my lock.",
      },
      notes: {
        "garden-bench": {
          title: "Rosa's Watering Cans",
          text: "Rosa again. You made it to the palm tree. Mind the broken pots.\n\nThe potting shed has a padlock, and I hid its key where a stranger would never guess. Look at the three watering cans by this bench. The key is in the {pick}. Tip that one, and only that one, and the key slides out of the spout into your hand.\n\nDo not touch the other two cans. They are my walker alarm. I filled them with bells and tin cans. Tip one over, and the noise rings across the whole row. Walkers come, more and more of them, even through the gate. They keep coming until they get you.\n\nLeave this palm house by its door, and follow the path down toward the beehives. The shed door is right on that path, under the POTTING SHED sign.\n\nThe shed has more seeds, sorted and labeled, and a water tank. Seeds keep for years if you keep them dry and dark. The tank is for your garden at home.\n\nIf you need tools or more water tanks, go to Station 12. It is the fire station, north and east of here. Its equipment bay has tools and water tanks, the big kind. Chief Dunn runs the station. Tell him Rosa sent you.",
        },
        "garden-trail1": {
          title: "The Rattling Truck",
          text: "Rosa. I want to write this down while I remember it clearly.\n\nA few days ago, a truck came rattling up the road. I heard it a mile off. It sounded like a washing machine full of forks. I almost hid.\n\nIt was Dev, the boy from the Gas-N-Go, and old Mr. Ortiz from the auto shop. They had fixed that truck between them, somehow. They stopped here to fill their water jugs from my rain barrels. Dev talked the whole time. Mr. Ortiz said maybe four words.\n\nThey were going north to the Water Tower. Theo has clean water there, and a place to sleep. Dev said it was the right choice, though he did not look happy about it.\n\nThe very next day, Ruby came. She was asking for Dev, of course. She had chased him clear across town. I told her where he went, north to the tower, with Mr. Ortiz. She left before I could even offer her tea.\n\nMy other note is in the big greenhouse, by the scarecrow. It is about something Mr. Ortiz left with me.",
        },
        "garden-trail2": {
          title: "Mr. Ortiz's Greasy Key",
          text: "Rosa, by the scarecrow. Thank you for reading on.\n\nWhen the truck stopped here, Mr. Ortiz pulled me aside. He pressed a key into my hand, still warm from his pocket. He said, Rosa, the ring cannot break just because I am leaving. Keep this for whoever reads.\n\nSo here it is. The key lies on the floor beside the beehives. Walk softly there, because the bees still work. It is a greasy steel key on a loop of wire. My fingers were black for a day after holding it.\n\nThat key opens the parts cage at Ortiz Auto. The shop is far east across town, past the grocery and the hardware store. It is a long drive, so plan for it. The parts cage has a plain lock, so a wrong key just will not turn in it.\n\nMr. Ortiz gave me the key so the ring would not break. That was the whole reason. He could have taken it with him. He could have kept the parts for himself. He did not.\n\nOpen the parts cage, and fix something good with what you find. He would like that.",
        },
        "garden-dead1": {
          title: "Rosa's Planting Chart",
          text: "GREENHOUSE ROW: SPRING PLANTING CHART. By Rosa.\n\nBeans by the gate. Two long rows, with strings to climb. They like the cool air when the gate opens.\n\nTomatoes at the back. Six plants, staked. They want the warm glass and the shade of the back wall in the afternoon.\n\nSquash where the sun hits. The middle beds, under the big panes. Squash spreads like gossip, so give it room.\n\nHerbs in pots along the left wall. Basil, mint, and something June swears is oregano.\n\nThe chart is drawn in pencil on graph paper, with little circles for each plant. Next to the beans is an arrow and a note. These beans came from seeds my old friend June gave me. She saved them from her school garden. She has been saving the same beans for thirty years. They come up every time, rain or drought.\n\nAt the bottom, underlined twice: Tell June the beans came up.\n\nBelow that, in newer ink: Still have not told her. Have not seen her since the Fall. If anyone knows a June who keeps a green ledger, tell her for me.",
        },
        "garden-dead2": {
          title: "A Seed Packet Note",
          text: "An empty seed packet lies on the path, just outside the potting shed door. The picture on the front shows fat orange carrots. On the back, in pencil, a stranger has written a note.\n\nShed key: in the {decoyPick}, by the bench in the palm house. The lady who runs this place told me herself. She trusts people, which is nice. Tip it out, open the padlock, and there are seeds and a water tank inside. Leave her some seeds. She was kind to me.\n\nIt is a friendly note. The writer even drew a little smiling sun. It sounds true, and once it was.\n\nBut somebody else read this packet too. A looter found it, tipped out the key, and took half the seeds in the shed. Rosa found the shed open the next morning. After that, she moved the key. She also filled the other cans with bells and tin cans, as a walker alarm.\n\nSo this packet is out of date. Tip the can it names, and you may ring the bells. Rosa's note on the potting bench says where the key is now. Read hers.",
        },
        "garden-dead3": {
          title: "Who Took What Seeds",
          text: "SEED SHARING LIST\nTake what you will plant. Write it down, so I know what grows where. Rosa.\n\nTheo: carrots, two packets, for the tower.\nRosa added: He says the ground by the pumps stays damp. Carrots will love that. Told him to thin them early.\n\nCarla: sunflowers, one packet, for the lumber yard.\nAdded: For the edge of the yard, she says, to cheer up her crew. Sunflowers grow fast and tall. They will be taller than her stacks of planks by summer.\n\nMrs. Greer: beans, one packet, for the library window boxes.\nAdded: She asked which beans read best. I said the climbing kind. She laughed. The class will water them, and Ms. Adler will make it a lesson.\n\nAt the bottom of the page, Rosa wrote a last line.\n\nEvery packet that leaves this greenhouse makes the town a little greener. When you plant one, add your name below. Even a single pot on a windowsill counts.\n\nThere is room for many more names. So far, only these three are written. The list is pinned up near the front of the big greenhouse.",
        },
      },
      signs: {
        "garden-sign1": {
          title: "Wooden Sign",
          text: "A carved wooden sign, painted green: Greenhouse Row. Plants, seeds, soil. Below it, on a smaller board that swings from two hooks: Open from dawn to dusk.",
        },
        "garden-sign2": {
          title: "Spray Paint",
          text: "Ruby's red R, sprayed across a dusty whitewashed board, with a 5 under it. Under that, short and quick: One at the back of the big greenhouse. Stay low.",
        },
        "garden-sign3": {
          title: "Chalk Circle",
          text: "A chalk circle with a key drawn inside, by the seed vault door in the shop. Under it, printed carefully: The key is not here. Read the notes.",
        },
        "garden-sign4": {
          title: "Potting Shed Sign",
          text: "A painted sign by the shed door: POTTING SHED. MIND THE STEP. A small watering can is painted next to the words. Three blue drops fall from its spout.",
        },
      },
      key: {
        name: "Greasy steel key, wire loop",
        tag: "A greasy steel key on a twisted loop of wire. A strip of masking tape wraps the wire, and it says, in black marker: Fix something good. The tape is covered in thumbprints.",
      },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
