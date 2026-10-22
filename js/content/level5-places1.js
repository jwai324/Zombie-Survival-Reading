/* Reading level 5: places, part 1 (gasngo, grocery, hardware, pharmacy, autoshop, radioshack, garden). Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[5] = root.ZSR.TEXT[5] || { level: 5 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    gasngo: {
      blurb: "A small gas station on the road out of town, with fuel cans by the slushie machine and in the garage, and a locked storeroom off the back hall.",
      door: {
        title: "Ruby's Warning on the Door",
        text: "Ruby here. I taped this up in a hurry, so read it slower than I wrote it.\n\nAt least three walkers are inside. One waits in the garage, by the car lift at the back. Three is only today's count. More come as the days pass, the way puddles grow in a long rain. The sooner you go in, the better your odds.\n\nThe fuel cans are on the floor, not on the shelves. Whoever picked this place over only looked at eye level. One can sits by the slushie machine, in the front left corner. The other is in the garage on the right, by the tire tower near the big bay doors. Grab that one quietly, so you do not wake the one by the car lift.\n\nThe storeroom is locked. Do not waste your shoulder on it. The clerk left a note on the counter, right by the front door, and that note explains the lock. Read it first, then deal with the door.",
      },
      notes: {
        "gasngo-counter": {
          title: "Dev's Note at the Register",
          text: "This is Dev. I was the clerk here, back when the worst thing on a shift was a broken slushie machine. Read every word of this before your hands touch anything.\n\nThe storeroom key is in the {pick} of this counter, right under this note. Open that drawer, take the key, and it opens the storeroom door.\n\nOpen no other drawer. My sister Ruby rigged the other two with a bomb trap for looters, and it kills whoever opens one. She did it to stop the smash-and-grab crews, and it snaps shut like a mousetrap on anyone who guesses. So read the drawer's name twice, then open only that one.\n\nInside the storeroom there is more fuel, and a spool of wire that never made it out to the shelves. Wire is worth more than gold now, because everything that still runs needs some.\n\nHere is the way. Walk past the shelves to the gap in the back wall, and you will be standing in the back hall. The break room with the ice machine sits at one end of that hall. Go the other way, to the far end. The storeroom is the last door before the garage, under the STOREROOM sign. If you reach the garage door, you went one step too far.\n\nI went to Ortiz Auto, on the east side of town. The shop is still standing, and Mr. Ortiz has a truck that needs parts, patience, and another pair of hands.\n\nIf you need seeds and soil, go the other way. Rosa is at Greenhouse Row, west past the gas station. She shares with anyone who asks nicely.\n\nRuby, if this reaches you, I am sorry I did not wait. Come east.",
        },
        "gasngo-trail1": {
          title: "Ruby Follows Her Brother",
          text: "Ruby again. You found this just inside the front door, on the slushie machine side. So you already walked past the spot that keeps pulling me back here.\n\nI came back today and found my brother's note by the register. Dev's handwriting has not changed since fourth grade, all tall letters leaning forward like they are late for something. He went east to Ortiz Auto to help fix a truck. So I am going east after him. I have walked that road a hundred times in my head. Now my feet get a turn.\n\nBefore I go, I asked Jo for a favor. Jo runs the radio station on 88.1, and Jo promised to say on the air that I am looking for Dev. Every night, my name and his will drift over this town like smoke. If my brother has a radio, he will hear it. If you meet a tall kid with grease on his hands, tell him his sister is close.\n\nThere is one more thing, and it is not about Dev. I left a second note on the floor behind the counter, near the register. That is across the shop from the slushie machine. Cross to the counter, step around its end, and look down. That note explains the locks in this town, and it might be the most useful thing I ever wrote.",
        },
        "gasngo-trail2": {
          title: "For Anyone Who Reads This Far",
          text: "Ruby, one last time. This note is for anyone who reads this far, because reading this far is the whole point.\n\nJo and I made a rule, and people all over town agreed to it. Take what you need, and leave the rest. To keep the best supplies safe from smash-and-grab crews, every stash is locked. Its key is hidden in another building, with a note that says where. Crowbar crews never read anything, so they never find a single key. Only people who read can follow the trail from one building to the next. We call it the key ring.\n\nHere is your link in it. A key lies on the floor in the garage, beside the tire tower. It is a small brass key on a green plastic tag. It opens the staff locker at Corner Grocery, east of here.\n\nHana, the grocery manager, gave me this key on the first day of the ring. She pressed it into my palm and said a locker with medicine in it should not belong to whoever swings the biggest crowbar. I agreed with her then, and I still do.\n\nOne warning. The staff locker has a fussy lock. The wrong key jams it, and after that only a crowbar opens it. So remember which key this note told you about.\n\nSo go east to Corner Grocery and open the staff locker. Take what you need. Leave some for the next reader, the way someone left this note for you.",
        },
        "gasngo-dead1": {
          title: "Dev's Last Shift List",
          text: "Closing shift. Things to do before I can go home. Dev.\n\n1. Mop the floor. All of it, not just the parts the manager can see from the door. Last time I skipped the corner by the freezer, and somehow he knew.\n\n2. Fill the coffee. Both pots, plus the decaf nobody drinks. The night truck drivers want it hot and strong, and they complain like it is their job.\n\n3. Fix the ice machine. It is making that grinding noise again, like a dog chewing a rock. Kick the left side first. If that fails, kick the right side.\n\n4. Count the register twice and write the number down before I forget it. Last month I counted once and was short two dollars. I heard about it for a week.\n\n5. Restock the gum by the counter. Kids steal the mint ones first, which honestly shows good taste.\n\nAt the bottom, underlined twice: Call Ruby back. She called three times today. She says it is about the news. Some sickness across the river. Probably nothing.\n\nUnder that, in a different pen, someone else wrote:\n\nThis was his last shift before the Fall. Nothing on this list is crossed off. Not the mop, not the coffee, not the ice machine. Not the call either, and I would know, because I am the one he was supposed to call. I leave it pinned here so I remember that he meant to. R.",
        },
        "gasngo-dead2": {
          title: "A Scrap of Receipt",
          text: "A scrap of receipt, curled like a dry leaf, lies here in the back hall outside the old safe room door. The writing is shaky pencil, and the note is not signed.\n\nStoreroom key? Easy. It is in the {decoyPick} of the counter by the front door. Pull it open, grab the key, and the storeroom is yours. I did it myself. No tricks, no puzzles, no long walk across town. You are welcome.\n\nIt sounds like a friend leaning close to whisper the answer. For a moment you can almost feel the drawer handle in your hand.\n\nNow turn the receipt over and read the date printed on the front. It is from the first days after the Fall, weeks and weeks ago. Back then, the counter drawers were just drawers. They held rubber bands, old receipts, and one key.\n\nThen Ruby came back. She set her traps in the counter drawers to stop looters, and this scrap was written before she did. A drawer that was safe last month can kill you today. Whoever wrote this is not exactly lying. They are just out of date, like a map of a town that burned down.\n\nDev's note on the counter says which drawer is safe now. Read his note, not this one. Dev signs his name, and he wrote his note after the traps went in.",
        },
        "gasngo-dead3": {
          title: "Lost Dog: Peanut",
          text: "LOST DOG. PLEASE HELP.\n\nThe flyer has been taped to this spot so long that the sun has faded it to the color of weak tea. The photo is now just a pale shape, but the words still hold on.\n\nHer name is Peanut. She is brown all over, with one white ear that flops forward like a folded page. She is small and friendly and will lick your hand if you let her. She is afraid of thunder, so if a storm rolls in, look under porches, cars, and anything low and dark. Please do not chase her, because she runs from fast feet. Sit down, hold out a hand, and say her name softly.\n\nUnder the printed words, someone added a few lines by hand in blue pen.\n\nPeanut used to wait by this gas station for treats. The clerk kept a box of dog treats behind the counter just for her, even though the manager said not to. She would sit by the door with her white ear up, as patient as a statue, until he came out.\n\nThe bottom of the flyer, where the phone number was, has been torn off. Only a ragged edge is left, with half of a five and the top of a three. Maybe someone took the number to call it. Maybe someone just wanted something to hold on to.",
        },
      },
      signs: {
        "gasngo-sign1": {
          title: "Faded Store Sign",
          text: "GAS-N-GO. ALWAYS OPEN. The paint has faded to the color of old bread, and someone has crossed out ALWAYS with a thick black line. Above it they wrote NOT, so the sign now reads: Gas-N-Go, not open.",
        },
        "gasngo-sign2": {
          title: "Red Spray Paint",
          text: "A big red R, sprayed as tall as a door beside the front door, with a 3 under it. That is Ruby's mark: she counted three walkers in here. Under it, smaller and neater: Don't run. Walk and look.",
        },
        "gasngo-sign3": {
          title: "Chalk Circle",
          text: "Chalk on the wall by the old safe room door: a circle with a small key drawn inside it. The mark means this lock's key is hidden in another building. Find the note that says where, and skip the crowbar.",
        },
        "gasngo-sign4": {
          title: "STAFF ONLY",
          text: "STAFF ONLY, stamped on a metal sign beside the storeroom door. One corner is dented where someone tried a crowbar. Under it, in Dev's quick, slanted writing: Key in the counter drawers. Read my note before you open one.",
        },
      },
      key: {
        name: "Small brass key, green tag",
        tag: "The green plastic tag is scuffed white at the edges. The words on it are printed in careful capitals: LEAVE SOME FOR THE NEXT ONE. The key itself is a small brass key, warm from the floor, its teeth worn smooth by many hands.",
      },
    },

    grocery: {
      blurb: "A corner store with picked-over shelves, food left on the floor, and a walk-in cooler that still runs cold.",
      door: {
        title: "Doc Lin on the Glass",
        text: "Doc Lin wrote this in marker, so read it before the rain does.\n\nThe shelves are picked over, as bare as a winter tree. The food that is left is on the floor. Look by the fish tank in the back left corner, and by the freezers along the right wall. Bend down and look under the racks, because cans roll into strange places.\n\nWalkers get in through the loading door at the back, out by the forklift. It never shuts right, and they find it the way water finds a crack. Count on at least three inside, and more if you linger. Expect them behind you as often as in front.\n\nThe walk-in cooler stays cold, even now, and it is locked. That cold is the reason I keep coming back. The manager's note is in the office, back left, through the staff door near the fish tank. It tells you how to open the cooler. Read it before you pull on that handle.",
      },
      notes: {
        "grocery-counter": {
          title: "Hana's Cooler Trick",
          text: "I am Hana, the store manager. I locked the cooler myself, and I am not sorry.\n\nThe cooler latch sticks, but it is not broken. It just wants things done its own way, like an old cat. To open it, {moves}, in that order. Make each move smooth and steady, and the bar slides out of its catch like a sled off a hill.\n\nWork it any other way, and the latch jams tight. After that, only a crowbar opens the cooler. So do not yank, do not guess, and do not get clever. Read the line above again before your hand touches the handle.\n\nInside there is food, stacked along the walls, and one medical kit, sealed. The cold has kept everything good, which is more than I can say for the rest of this store. One kit is not much, so do not spend it on a scraped knee.\n\nThe cooler is close. Step out of this office into the back hall and walk toward the forklift. The cooler is the very next door, under the COOLER sign. If you reach the door marked STAFF LOCKER, you walked right past it.\n\nWhen the kit runs out, you will need more medicine. Try the pharmacy at Mile 9, west of here. Mile 9 Pharmacy had medicine on its shelves last week, and Mr. Okafor guards that place like a hen guards her eggs.\n\nTake what you need, and leave the rest. Close the cooler door behind you, or the cold leaks out and everything spoils.",
        },
        "grocery-trail1": {
          title: "Doc Lin's Cold Route",
          text: "Doc Lin again. If you found this by the checkout lanes, near the gumball machine, you have already seen how picked over this store is. So you should know why the cooler matters.\n\nI carry medicine. I take it from here to the pharmacy, and then north to St. Anne Annex, the hospital in the hills, where Nurse Ada stayed. Ada kept the generator running and the records straight when everyone else ran. Somebody has to bring her supplies, and somehow that somebody became me.\n\nSome of Ada's medicine has to stay cold, or it goes bad like milk in the sun. The cooler here keeps her medicine cold until I can carry it. Hana lets me use the top shelf, and she has never once asked for anything back.\n\nHere is the hard part. I have not reached Ada for weeks. The road into the hills is full of walkers now, packed shoulder to shoulder in the bends where the trees close in. Every time I try, I turn back with a full bag and an empty stomach. It feels like shouting across a canyon and hearing only my own echo.\n\nHana left a note for the next reader out on the loading dock, beside the forklift. Go through to the back and read it. It is not about me, but it might help you more than anything I can say.",
        },
        "grocery-trail2": {
          title: "Hana Hands On a Key",
          text: "Hana again. If Doc Lin sent you out to the forklift, good. She knows who reads.\n\nThere is a key in this store, and it is not for anything in this building. That is how the ring works. A key lies on the floor beside the gumball machine, near the front of the store. It is a long silver key on a red string, so it is easy to spot once you look down. It opens the narcotics safe at Mile 9 Pharmacy, west of here.\n\nThe narcotics safe holds strong medicine, the kind that cannot fall into the wrong hands. Mr. Okafor gave me this key for the ring because I never took more than I needed. He told me so over the counter one day, in that slow, serious way of his. I have tried to deserve it ever since.\n\nBe careful with it. The narcotics safe has an old lock that bites. The wrong key snaps off inside it and is gone for good, so try only the key this note describes.\n\nSo here is what I am asking. Pick up the key, carry it west to Mile 9 Pharmacy, and open the narcotics safe there. Count what you take. Leave the rest for the next reader, because there is always a next reader.\n\nAnd if you ever see Doc Lin on the road, tell her the top shelf is still cold. She will know what I mean.",
        },
        "grocery-dead1": {
          title: "A Kid's Shopping List",
          text: "A shopping list on lined paper, in big, wobbly kid handwriting. Every letter is a different size, like a crowd of people trying to squeeze onto one bus.\n\nTHINGS WE NEED.\n1. Peanut butter, the crunchy kind.\n2. Batteries, for the flashlight and the walkie talkies.\n3. Dog food, the big bag.\n4. Peanut butter again, in case we run out.\n\nNext to dog food, a grown-up has written in neat blue pen: We don't have a dog.\n\nUnder that, back in the wobbly pencil, the kid wrote one word: yet.\n\nThe word is underlined twice, hard enough to dent the paper. Then there is a drawing of a dog, or maybe a horse, with very long ears. Its tail curls up like a question mark. Someone gave it a name tag, but the name is smudged. Four legs, a big pink tongue, and a smile far too wide for any real animal.\n\nAt the bottom, the grown-up wrote one more line, smaller this time: Okay. After the storm passes, we will talk about it.\n\nThe kid wrote back in capitals: PROMISE. There is no answer after that. The rest of the page is blank, white as fresh snow, waiting for a reply that never got written.\n\nThe list is folded in four, soft at the creases, like it rode in a pocket for a long time. Then someone set it down here, under the bread sign at the top of the aisle, and walked on.",
        },
        "grocery-dead2": {
          title: "The Cooler Latch Trick",
          text: "A note on a flap of cardboard, torn from a soup box, lies on the floor just inside the front door. It is not signed, but the marker is thick and sure.\n\nCOOLER LATCH TRICK. Everybody gets this wrong, so listen. The trick is to {decoyMoves}. Do it firm, do it once, and the door swings wide. I opened it this way a dozen times. There is food for days in there, cold as winter.\n\nIt reads like advice from someone who stood right where you are standing. The words are confident, and confident words are easy to follow.\n\nBut look at the back of the cardboard. Someone sketched the latch there: a flat bar with a round knob on the end. Now walk to the cooler and look at the real one. The latch on that door is new and square, with no knob at all.\n\nThat was the trick for the old latch, before Hana put in a new one. A new latch means a new trick. Work the new latch the old way, and it jams so tight that only a crowbar will open the cooler.\n\nHana's note in the office has the trick that works now. It is signed, and it was written for this latch, not the last one. Read it before you touch that handle.",
        },
        "grocery-dead3": {
          title: "Hana's Last Schedule",
          text: "CORNER GROCERY. STAFF SCHEDULE. Posted by Hana, manager.\n\nThis is the work schedule for the week the Fall began. The paper is curled at the corners, and a coffee ring sits over Tuesday like a tiny brown moon.\n\nMONDAY: Open, Delia, crossed out, Hana written above it. Close, Marcus, crossed out, then Hana.\nTUESDAY: Open, Hana. Close, Hana. Tran gone to family upstate.\nWEDNESDAY: Open, Hana. Close, Hana.\nTHURSDAY: Open and close, Hana.\nFRIDAY: Hana.\nSATURDAY: Hana.\nSUNDAY: Close early. Lock up. Go home.\n\nHana put her own name on every shift, even the ones where the other names were crossed out. By Thursday her handwriting gets smaller and faster, like someone writing on a moving bus.\n\nThe last day just says: Close early. Lock up. Go home.\n\nThat line is written in the same black marker as the rest, firm and clear, the way a manager gives an order. It was a good plan for an ordinary bad day.\n\nUnder it, in newer ink, in blue pen that has barely faded, there are two more words:\n\nStayed anyway.\n\nThere is no explanation. No reason, no excuse, no story about the night the streets went quiet and the sirens stopped. Hana is not the kind of person who explains herself. She just shows up, every shift, and this store is still here because she did.",
        },
      },
      signs: {
        "grocery-sign1": {
          title: "Fresh Bread Sign",
          text: "Corner Grocery. Fresh bread every morning. The printed sign still hangs straight, red letters on yellow, as cheerful as ever. The bread rack under it is empty, down to the last crumb and the last twist tie.",
        },
        "grocery-sign2": {
          title: "Black Marker",
          text: "Scrawled in black marker, big and fast: THE LOADING DOOR AT THE BACK DOESN'T SHUT. Under it, underlined twice: WATCH YOUR BACK. A shaky arrow points toward the back of the store.",
        },
        "grocery-sign3": {
          title: "Soup Sale",
          text: "SALE! SOUP, TWO CANS FOR THE PRICE OF ONE. Under the price, someone added in pen: Deal still stands. Everything is free now. Take two, and leave two for the next person.",
        },
        "grocery-sign4": {
          title: "Walk-In Cooler",
          text: "WALK-IN COOLER. KEEP THE DOOR CLOSED. The printed sign is beaded with cold. Under it, in Hana's quick writing: The trick is in my note in the office. Do it any other way, and the latch jams.",
        },
      },
      key: {
        name: "Long silver key, red string",
        tag: "The key is long and silver, threaded on a red string tied in a tight double knot. A paper tag hangs from the string, and its message is short and stern: COUNT WHAT YOU TAKE. Someone has already underlined COUNT.",
      },
    },

    hardware: {
      blurb: "A big hardware store with nails up front, tools in the middle, lumber at the back, and a back room door that sticks.",
      door: {
        title: "Mr. Reyes Nailed This Up",
        text: "Mr. Reyes, the owner. My father opened this store and I have kept it standing for forty years, so I know every board in it.\n\nAt least five walkers are inside. Two stand in the middle aisles, still as shopping carts with a bad wheel. The rest are wherever the last noise was. Be ready the moment you step in.\n\nHere is where things are. Nails are by the toilet display, in the front left corner, so grab those first while the door is still close. Tools are in the middle aisle, right where those two walkers stand, so plan your path. Lumber is in the lumber racks at the back, behind all the aisles. Grab the easy things first and the hard things last.\n\nThe back room is locked, but the lock is not really the problem. My note is by the paint mixer, in the paint room at the back left. It explains the trick to that door. Read it before you start kicking.",
      },
      notes: {
        "hardware-paint": {
          title: "The Sticking Door",
          text: "Mr. Reyes again. You found the paint mixer, so you are paying attention. Good.\n\nThe back room door sticks in its frame. A storm bent that frame last spring, and the rain swelled it, so now the door sits crooked, like a tooth that grew in wrong. Here is how to open it. Push it {move1}, then {move2}. Two pushes, in that order, firm and steady.\n\nPush it any other way, and it jams for good. After that, only a crowbar opens it, and you would have to build one first. Do not shove it, kick it, or try your own ideas. This door has no patience for guesses.\n\nInside I left a water filter, a second tool kit, and a stack of lumber. I meant to come back for them, but the street filled up faster than I planned. They are yours now. Build something that lasts.\n\nTo get there, take the side door by the paint mixer. It opens into the lumber room. Walk past the lumber racks, and the back room door waits on the far side, under a sign that says BACK ROOM.\n\nIf you need more wood than that, go to Ridge Lumber on the east ridge. There are stacks of lumber in that yard, enough to board up a whole street. If you need more filters, try the Water Tower on the west side. It has more filters in its pump house, and Theo keeps the pumps running. Tell him I want my pipe wrench back.",
        },
        "hardware-trail1": {
          title: "How the Ring Began",
          text: "Mr. Reyes. If you read only one note in this store, make it this one, because it explains the keys.\n\nRuby and Jo came to me with the idea of the key ring. Ruby had been marking buildings for weeks, and Jo had been talking on the radio every night. They were tired of watching smash-and-grab crews strip the best supplies in a single afternoon. They wanted a way to lock up the good things, so only careful people could reach them.\n\nSo I cut the first keys. I used the key machine in this store, the one that hums like an old refrigerator. Fifteen keys for fifteen stashes, one for every building that agreed to join. My hands were sore for a week. Every key got its own shape, so no thief could ever copy one by guessing.\n\nHere is the rule that makes it work. No key stays in the building it opens. Each one waits somewhere else, with a note that says where to take it. You find a key in one store, and it sends you across town to another. A thief who cannot read sees a random key on the floor. A reader sees a map.\n\nMy other note is in the paint department, near the paint mixer. Walk past the aisles to the back corner under the PAINT sign. That note tells you where a key is waiting.",
        },
        "hardware-trail2": {
          title: "The Very First Key",
          text: "Mr. Reyes. You followed the trail to the paint mixer, so here is your reward.\n\nA key lies on the floor beside the toilet display, against the wall, in the front corner of the store. It is a copper key with a leaf scratched into its head. I scratched that leaf myself, with the tip of a nail, so Rosa would know it was hers. It opens the seed vault at Greenhouse Row, far west across town.\n\nThis key matters to me more than the others. It was the very first key I cut for the ring. Rosa came in with a sack of seed packets and asked me where to hide the key to her vault. I said the greenhouse, of course. She laughed at me. Then she said a hardware store is the last place a seed thief would look, and she was right. Nobody comes to a hardware store hungry for beans.\n\nSo the key stayed here, and the ring started with it. Every other key in town came after this one, like links added to a chain.\n\nThe seed vault has a plain lock. A wrong key just will not turn in it, so no harm done if you mix them up.\n\nTake the copper key. Carry it west to Greenhouse Row and open the seed vault there. Seeds are slow food, but they are the only food that makes more of itself. Take what you need, plant some, and leave the rest for the next person who reads this far.",
        },
        "hardware-dead1": {
          title: "Who Borrowed My Tools",
          text: "BORROWED TOOLS. WRITE IT DOWN OR DON'T TAKE IT.\n\nThis list is in Mr. Reyes's handwriting, thick pencil pressed hard into the paper. He kept it on a nail in the lumber racks, beside the stacked planks, so nobody could say they forgot. The edges are curled, and the paper is gray from years of greasy thumbs.\n\nCarla: one long saw. Said she needed it for the boat planks, for the convoy boats. Said she would bring it back Tuesday. It is not Tuesday anymore, but Carla always returns things, loudly, with a story.\n\nChief Dunn: two ladders. For the station roof, for the siren, for something important. He signed for them in perfect block letters and wrote down the date. I trust a man who writes the date.\n\nTheo: one pipe wrench. Never returned. Again.\n\nThe word Again is pressed so hard that the pencil tore through the paper, like a man stamping his foot.\n\nThat last line has a lot of history in it. Under it, Mr. Reyes added a tally of little marks, and there are three of them. Next to the tally he wrote: This is the third pipe wrench. Three. I am starting to think he is building a second tower out of my wrenches.\n\nAt the very bottom, smaller, as if he felt bad about grumbling: Theo keeps the town's water clean. Let him keep the wrench. But I am still writing it down.",
        },
        "hardware-dead2": {
          title: "The Back Room Trick",
          text: "A note in soft pencil, folded small and tucked behind a shelf tag here in the paint department, right outside the paint vault door. It is not signed. The writing is quick and smudged, as if the writer kept looking over one shoulder.\n\nBack room trick. The door looks locked, but it only sticks. Push it {decoyMove1}, then {decoyMove2}, and it pops open like a cork. I did it on my first try. Tools, a filter, lumber, all of it waiting. Go now, before somebody else reads this.\n\nIt sounds easy, and easy is exactly what a tired person wants to hear. The writer even sounds generous, sharing a secret instead of keeping it.\n\nBut look at the paper. It is a page torn from the store's spring calendar, and the dates on it are from before the big storm. That storm ripped shingles off the roof and soaked the walls for a week. The back room door frame bent and swelled in all that rain. A bent frame changes how a door moves.\n\nThat trick worked before the frame bent in the storm. It does not work now, and trying it could jam the door for good.\n\nMr. Reyes's note by the paint mixer has the way that works now. It was written after the storm, by the man who owns the door. Trust the newer note, and the name on it.",
        },
        "hardware-dead3": {
          title: "A Grandson's Drawing",
          text: "A crayon drawing, taped low on the side of a shelf, at just the height a kid would choose. Across the top, in wobbly green crayon: GRANDPA'S STORE. BY MATEO, AGE 6.\n\nIt shows the store as a big brown box with a red roof and a door shaped like a mouth. In front of it stands Mr. Reyes as a giant holding a hammer. He is taller than the store, taller than the trees, and almost as tall as the sun, which wears sunglasses. His mustache takes up most of his face. The hammer is bigger than a car.\n\nThe strange part is the windows. Every window in the drawing has a board nailed over it. Mateo drew each board with two black dots for the nails, careful and neat. It is the way a kid draws something he watched happen up close. Even the tiny window on the door has its own board, and its own two dots.\n\nUnder the drawing, in Mr. Reyes's thick pencil:\n\nHe is right. We did that next.\n\nThat is all, but it says plenty. A six-year-old saw what was coming before the grown-ups would admit it. He drew his grandpa as a giant who could keep them all safe. For a while, that is exactly what Mr. Reyes was. The hammer in the drawing was not so far from the truth.",
        },
      },
      signs: {
        "hardware-sign1": {
          title: "Hand-Painted Store Sign",
          text: "Reyes Hardware, hand-painted in tall red letters on a long plank. Under the name, in smaller letters: If we don't have it, you don't need it. The paint is chipped, but the boast still stands.",
        },
        "hardware-sign2": {
          title: "Ruby's Red R",
          text: "Ruby's red R by the front door, sprayed big, with a 5 under it. Under that, in her quick hand: Two in the middle aisles. Move slow and keep a shelf between you.",
        },
        "hardware-sign3": {
          title: "Keys Cut Here",
          text: "KEYS CUT HERE, with a fat arrow. Next to the arrow, someone drew a circle with a key inside. The arrow points toward the paint vault in the paint department, at the back of the store.",
        },
        "hardware-sign4": {
          title: "Marker by the Door",
          text: "Written on the wall right beside the back room door in thick black marker: IT STICKS. READ MY NOTE BY THE PAINT MIXER BEFORE YOU PUSH IT. Under it is a signature with a big loop: Mr. Reyes.",
        },
      },
      key: {
        name: "Copper key with a leaf",
        tag: "A copper key with a small leaf scratched into its head, the lines thin and careful, like a signature. Its paper tag is soft from handling, and it says in green ink: TAKE ONLY WHAT YOU NEED. Someone drew a sprout beside the words.",
      },
    },

    pharmacy: {
      blurb: "A small pharmacy with medical kits by the giant toothbrush and where the aisles cross, and a cabinet room behind a code lock.",
      door: {
        title: "Mr. Okafor's Door Note",
        text: "This is Mr. Okafor, the pharmacist. I filled prescriptions here for twenty years, and I am still careful, even now.\n\nTwo medical kits are still out on the floor. One is by the giant toothbrush, in the back left corner of the store. The other is in the middle, where the aisles cross, so you will be open on four sides while you grab it.\n\nAt least five walkers are inside, and most of them stay near the back of the store. They stand there as if they are still waiting for their names to be called. They are slow until they notice you. Then they are not.\n\nThe cabinet room is locked, and the lock takes a code. I wrote the code on my note behind the pharmacy counter. You cannot climb over that counter, so walk to its right end, by the wheelchairs, and slip around. Read the note before you try the keypad. A wrong guess sets off the alarm, and then time is what you have least of in here.",
      },
      notes: {
        "pharmacy-counter": {
          title: "The Cabinet Room Code",
          text: "Mr. Okafor again. You made it behind the counter, so the hard part is behind you.\n\nThe cabinet room door has a keypad, and I am trusting you with the code. The code is {code}: {codeSpoken}. Press each number slowly, the way you would count pills into a hand.\n\nUse that code and no other. One wrong code sets off the alarm, and the noise is terrible. Walkers pour in from the street, even through the front door, and they keep coming until they get you. There is no second try. So read the code twice before your finger touches a button.\n\nYou do not have far to go. The cabinet room door is back here behind the counter, in the corner on the same side as the wheelchairs. Look for the sign that says CABINET ROOM.\n\nInside are two more medical kits and a water filter. I put the filter in there on purpose. Dirty water makes more patients than any walker ever did, so a filter is medicine that works before you get sick.\n\nIf you need more than that, you will have to go north. St. Anne Annex is the hospital in the north hills. It still has medicine, shelves of it, and a generator that could light a whole house. But listen carefully. It is the most dangerous place in town. The halls are long and dark, and the rooms hide more than they show.\n\nGo in daylight. Go rested, with food in your stomach and a kit in your pack.",
        },
        "pharmacy-trail1": {
          title: "Doc Lin Turned Back",
          text: "Mr. Okafor. This note is about a friend, and about a road.\n\nDoc Lin stops here every few days to fill her bag for Nurse Ada. She comes in quietly, nods at me, and takes exactly what the list says. Bandages, cold packs, pills in careful little envelopes. Then she heads north toward St. Anne Annex, where Ada still keeps the lights on.\n\nLast time, she came back far too soon. Lin turned back on the road up the hill below St. Anne Annex. There were too many walkers, she said, packed into the curves like cars in a traffic jam. She sat on my counter for an hour without speaking. I have never seen her look so tired.\n\nNow she has a new plan. Sergeant Vega and Chief Dunn are putting together the River Convoy. It is a line of trucks and boats that will leave north along the river. Lin plans to ride north with the River Convoy as far as St. Anne. From there she will walk the last stretch. It is not a safe plan, but it is a plan, and she has not had one in weeks. I am packing her bag for that day already.\n\nI left a second note on the floor near the giant toothbrush, under the SMILE poster. Go and read it. It concerns a key, and you will want it.",
        },
        "pharmacy-trail2": {
          title: "The Key With Blue Paint",
          text: "Mr. Okafor again. You found the giant toothbrush, so I will assume you are someone who reads labels. Good. Labels keep people alive.\n\nA key lies on the floor beside the pill bottle, near the front of the store. It is a stubby iron key with drops of blue paint on it. It looks as if it sat too close to someone painting a fence. It opens the paint vault at Reyes Hardware, east of here across town.\n\nYou may wonder why a pharmacist holds a hardware key. That is how the ring works. Mr. Reyes cut this key himself, on the machine in his own store. Then he gave it away. He keeps none of his own keys, not one. Each key in town waits in a building it does not open. Beside it is a note like this one, saying where to take it. That way, nobody can clean out a stash just by breaking into a single store.\n\nI respect that kind of thinking. It is the same reason I never kept all my medicine on one shelf.\n\nA warning, though. The paint vault has a fussy lock. The wrong key jams it, and after that only a crowbar opens it.\n\nSo take the stubby iron key. Carry it east across town to Reyes Hardware, and open the paint vault there. Mr. Reyes would want you to take what you need and leave the rest.",
        },
        "pharmacy-dead1": {
          title: "A Bag for June",
          text: "A white paper pharmacy bag, folded over twice and stapled shut. Nobody ever picked it up. It has been sitting here so long that dust has settled in its creases like snow on a roof.\n\nThe printed label on the front says:\n\nPatient: June. Take one tablet twice a day with food, for knee pain. Do not take on an empty stomach. Refills: two.\n\nThe pills inside are for sore knees, the kind people take so they can keep working. You can hear them rattle when you lift the bag, a dry, small sound in a silent store.\n\nAcross the bottom of the bag, Mr. Okafor wrote in his neat, slanted hand: She always forgets these. Third time this month. Next time I am walking them over to her garden myself. I will stand there until she takes the first one, too.\n\nUnder that is a smaller line in the same pen: She will say her knees are fine. Her knees are not fine. She kneels in the dirt all day and then wonders why they ache.\n\nIt sounds like a man scolding an old friend, but gently, the way people do when they care. Whoever June is, she spent a lot of time on her knees in a garden, and someone noticed. That is rarer than medicine these days. Someone kept her pills waiting, just in case she came back.",
        },
        "pharmacy-dead2": {
          title: "Yellow Sticky Note",
          text: "A yellow sticky note is stuck to the floor tile just inside the front door, curling at the edges. The writing on it is neat and small, in blue ink.\n\nCabinet room code: {decoyCode}. Don't tell Mr. O I wrote it down!\n\nIt looks like something a staff member jotted down during a busy shift, so they would not forget. It looks helpful, like a friend whispering the answer during a test. Your fingers may already be itching to try it.\n\nLook closer before you do. One side of the note has faded almost white, where the sun through the front window has beaten on it for weeks. Fresh sticky notes are bright yellow. This one is older than the Fall.\n\nAcross the bottom, in a different, smaller hand, someone has added:\n\nThis is the old code. I changed it the week the Fall began, after I found this note stuck to the register where any customer could read it. The code on my counter note is the one that works. Punch in an old code, and the alarm will tell every walker on the street exactly where you are. A code you can find on the floor is not a code. It is an invitation.\n\nIt is signed Okafor, with a firm line under the name.",
        },
        "pharmacy-dead3": {
          title: "A Customer Comment Card",
          text: "A customer comment card, the kind that used to sit in a little plastic stand by the register. It is dated the week before the Fall. The customer filled it out in heavy, impatient capitals:\n\nHOW WAS YOUR VISIT TODAY? Bad.\nWHAT COULD WE DO BETTER? The line is too long. I waited forty minutes for one bottle of cough syrup. Hire more people. Open more registers. I have places to be.\n\nUnder that, Mr. Okafor answered in red pen, in small, tidy letters:\n\nThen come back when it is shorter.\n\nThat is the whole reply. No apology, no smiley face. Just one dry sentence, dropped like a pebble into a pond.\n\nYou would expect a card like this to end up in the trash. Instead, Mr. Okafor pinned the card up right here, by the checkout counter at the front, where the line used to start. Every customer waiting in that long line could read it. There are four pinholes in the corners, and the card has been put back up at least twice.\n\nMaybe he thought it was funny. Maybe he wanted his staff to laugh on a hard day. Some days the line stretched out the door, and every face in it was grumpy. Either way, the line is gone now, and so are the customers. Only the card stayed, still pinned, still waiting for that shorter line.",
        },
      },
      signs: {
        "pharmacy-sign1": {
          title: "Please Wait",
          text: "PLEASE WAIT TO BE CALLED. The sign hangs by the pharmacy counter on two thin chains. Someone added underneath in blue pen: We will call you, someday. Bring a snack. Bring a chair. Bring a good book.",
        },
        "pharmacy-sign2": {
          title: "Ruby's Red R",
          text: "Ruby's red R, sprayed fast by the front door, with a 5 under it: five walkers when she counted. Beside it, an arrow points toward the back of the store. Under the arrow: Most of them stay back there.",
        },
        "pharmacy-sign3": {
          title: "Health Poster",
          text: "A health poster with a smiling cartoon water drop: CLEAN WATER SAVES LIVES. In smaller print below: If you can't filter it, boil it. Someone has circled the word boil three times.",
        },
        "pharmacy-sign4": {
          title: "Cabinet Room Sign",
          text: "CABINET ROOM. STAFF ONLY. The sign is screwed to the door just above the keypad. Under it, in neat pen: Code changed. Use the one on the counter note. The old code sets off the alarm, and the alarm carries.",
        },
      },
      key: {
        name: "Stubby iron key, blue paint",
        tag: "A cardboard tag hangs from the stubby iron key by a twist of wire. The key is spotted with drops of blue paint, like a night sky full of tiny planets. The tag says, in square letters: Cut by Reyes.",
      },
    },

    autoshop: {
      blurb: "An auto repair shop on the east side, with engine parts on the workbenches and a generator hidden down in the service pit.",
      door: {
        title: "Dev's Chalk Note",
        text: "Dev here, from the Gas-N-Go. I made it this far, and I am leaving a map for whoever comes next.\n\nEngine parts are on the workbenches. One bench is in the back right corner of the shop, by the red tool chest. The other is in the left bay, the first bay past the waiting room. The parts are greasy, so wipe your hands before you grab them, or they will slip.\n\nAt least five walkers are inside. One stands in the parts room by the engine crane, at the back left, waiting between the shelves like a lost shopper. Do not let it pin you in there, because those shelves leave you nowhere to run.\n\nThe service pit is covered by a locked hatch, a heavy steel plate set into the floor. Mr. Ortiz left a note in the office behind the waiting room. It tells you how to work the hatch bolt. Work it any other way and it jams. Trust me, I tried.",
      },
      notes: {
        "autoshop-office": {
          title: "Mr. Ortiz on the Hatch",
          text: "This is Mr. Ortiz, and this is my shop. Thirty years of oil, sweat, and bad radio live in these walls.\n\nThe hatch over the service pit is not welded shut, but its bolt is tricky, like me. To open it, {moves}, in that order. Slow hands, steady pressure, one move and then the other.\n\nAny other way bends the bolt and jams the hatch. A bent bolt is like a bent nail: it never goes straight again. After that, only a crowbar opens the hatch. So do it once, and do it right. Measure twice, cut once, my father used to say.\n\nFinding it is the easy part. Go back through the waiting room and into the shop. The pit room stands in the middle of the shop like an island, with walls on every side. Its hatch is on the front side, the side that faces the oil drums. Look for the PIT sign on its wall.\n\nMy generator is down in the pit, where the crowds never thought to look. There are spare parts with it, and a fuel can to get it running. A generator is a heartbeat for a base. It is heavy, so lift with your legs, not your back.\n\nIf you need wire or radio parts, Signal Electronics downtown still has both on its shelves. But it sits near the walker crowds, and they drift through downtown like water finding the low ground. Go in fast, come out faster, and never stay past dark.\n\nClose the hatch behind you. Old habits.",
        },
        "autoshop-trail1": {
          title: "Dev's Message for Ruby",
          text: "Ruby, this one is for you. If anyone else is reading, please leave it here in the waiting room, so she finds it.\n\nWe did it. Mr. Ortiz and I fixed the truck together, and it runs. It coughs like an old man in the morning, and the passenger door only opens from the outside, but it runs. Mr. Ortiz says I have good hands and a bad habit of rushing. He is right about both. I took the engine apart twice before I did it slow enough to do it right.\n\nWe are driving west to the Water Tower. Theo is there, and Theo has clean water and room for two. Clean water, Ruby. Not the brown stuff we have been boiling. Mr. Ortiz knows Theo from before, and he says Theo is fair.\n\nI am sorry I did not wait for you. I know I should have. I kept thinking you would walk through that door any minute. Then the truck started, and the street was filling up, and we had to go. I hope you heard Jo on the radio.\n\nMr. Ortiz left a note at the back of the shop, beside the red tool chest. He says it is for the ring, not for you, but read it anyway. Then come west. I will be watching the road.\n\nYour brother, Dev",
        },
        "autoshop-trail2": {
          title: "A Red Key for the Chief",
          text: "Mr. Ortiz. Dev wanted me to write something nice for his sister. This is not that. This is business, and it is for anyone who reads.\n\nA key lies on the floor of the waiting room, beside the soda machine. It is a big key painted fire-engine red, on a brass ring. You cannot miss it, unless you are not looking, and most people are not. It opens the chief's locker at Station 12, north and west of here.\n\nHere is how I came to have it. I spent two long weeks fixing trucks for the River Convoy. Two fire trucks, both with brakes that squealed like a pig at a fair. Chief Dunn left this key with me as thanks. Instead of canned beans, he gave me the key to his own locker and told me to pass it on. A favor that stops with one person is only half a favor, he said.\n\nSo it waits here for the ring. No key stays in the building it opens, and no key stays in a pocket either.\n\nMind the lock. The chief's locker has an old lock that bites. The wrong key snaps off inside it and is gone for good.\n\nWalk back past this red tool chest, through the shop, to the waiting room by the front door. Pick up the red key. Drive north and west to Station 12, and open the chief's locker. Take what you need, and leave the rest. Chief Dunn will understand. He has spent his whole life giving things away.",
        },
        "autoshop-dead1": {
          title: "The Job Board",
          text: "JOBS. NO JOB TOO SMALL. SOME JOBS TOO BIG.\n\nThis is Mr. Ortiz's job board, a scratched whiteboard screwed to the wall, with a grease pencil hanging from a string. The writing has faded to a ghostly gray, but it is still easy to read.\n\nChief Dunn's fire truck: new brakes. Under it: done, tested twice, squeal fixed. The chief paid in coffee.\n\nSergeant Vega's van: new tires. Under it: done, all four. The sergeant wanted the cheap ones. I put on the good ones and charged for the cheap ones. Do not tell anyone.\n\nCarla's boat motor: not done yet. Under it, in smaller letters: needs a part I do not have. Carla calls every day to ask. Carla is very loud on the phone. Carla is very loud everywhere. I hold the phone a foot from my ear and still hear every word.\n\nAt the bottom of the board, somebody drew a tiny cartoon car with a big smile and a flat tire. Next to it, in Mr. Ortiz's square writing: A customer's kid drew this. Do not erase.\n\nThe board is a snapshot of a busy, ordinary week. The fire truck was ready. The van was ready. The boat motor never got its part, and Carla never stopped calling about it. It still sits on the back bench, waiting for a job that may never be finished.",
        },
        "autoshop-dead2": {
          title: "The Hatch Bolt Trick",
          text: "A note on a sheet of greasy shop paper, the kind mechanics use to wipe their hands, left by the pit room's locked hatch. It is not signed. The letters are smeared with black fingerprints.\n\nHatch trick, from someone who has been down there. The bolt comes out if you {decoyMoves}. That is all. Old Ortiz makes it sound like brain surgery, but it is just a bolt. Grab the generator and go.\n\nIt sounds sure of itself. It even sounds kind, like advice from someone who wants to spare you the trouble of reading.\n\nBut kneel down and look at the bolt itself. It is bright and shiny, with no rust and no scratches, and the threads still have that fresh-cut glint. Every other bolt in this shop is brown with age. This one is brand new.\n\nThat trick is how the old bolt worked. Mr. Ortiz pulled the old bolt out and put in a new one, and a new bolt moves its own way. Use the old trick on it, and you will bend the bolt and jam the hatch. Then nothing but a crowbar will get you into that pit.\n\nMr. Ortiz's note by the office tells the real trick. He put in this bolt with his own hands, so he knows exactly how it moves. Read his note before you touch the hatch.",
        },
        "autoshop-dead3": {
          title: "Photo of Two Mechanics",
          text: "An old photo, curled at the corners and shiny with fingerprints. It was tucked into the frame of a mirror here in the parts room, by the door to the shop.\n\nIn the picture, Mr. Ortiz stands in front of a tow truck. He is younger, with more hair and the same mustache. Beside him is a young mechanic in coveralls two sizes too big. They both have grease up to the elbows. Mr. Ortiz has one hand on the young man's shoulder, the way a coach stands with a player after a big win. The tow truck behind them gleams like it just rolled out of the factory.\n\nOn the back, in Mr. Ortiz's square handwriting:\n\nMy best student. He never rushed a job.\n\nUnder that, added later in a different pen:\n\nHis boy is Tomas. Same hands, same patience with an engine. He talks to motors the way his father did.\n\nLook at the photo again. The young mechanic is Tomas's father. He has the same crooked grin as Tomas, one side of his mouth higher than the other. It looks as if he just heard a joke nobody else caught. Tomas grins exactly like that when an engine finally turns over. If Tomas ever walked into this shop, Mr. Ortiz would know him in a heartbeat. He would probably hand him a wrench before saying hello.",
        },
      },
      signs: {
        "autoshop-sign1": {
          title: "Painted Shop Sign",
          text: "Ortiz Auto. Honest repairs. The words are painted in blue on a white board on the shop wall by the parts room door. Under it runs a row of greasy handprints, big and small, pressed there one at a time like signatures.",
        },
        "autoshop-sign2": {
          title: "Ruby's Red R",
          text: "Ruby's red R, sprayed beside the front door, with a 5 under it. Next to it, an arrow and a note: One by the engine crane, in the parts room. It likes the shadows. Watch the gaps.",
        },
        "autoshop-sign3": {
          title: "Safety Poster",
          text: "SAFETY FIRST: NEVER WORK UNDER A CAR ALONE. The poster shows a smiling mechanic giving a thumbs-up. Someone crossed out UNDER A CAR and wrote above it: Never work anywhere alone.",
        },
        "autoshop-sign4": {
          title: "Service Pit Plate",
          text: "A metal plate bolted to the wall beside the hatch: SERVICE PIT. KEEP THE HATCH SHUT. Under it, in chalk: The bolt bends if you work it wrong. Mr. Ortiz's note says how.",
        },
      },
      key: {
        name: "Big red key, brass ring",
        tag: "A big key painted fire-engine red, hanging on a heavy brass ring that clinks when you lift it. The leather tag is inked in block letters: RETURN THE FAVOR. The paint is worn thin where a thumb always held it.",
      },
    },

    radioshack: {
      blurb: "An electronics store downtown with spools of wire on the shelves, close to the worst of the walker crowds.",
      door: {
        title: "Jo's Sign in the Window",
        text: "Jo wrote this, and Jo does not scare easy. Still, this store gets my full attention, and it should get yours.\n\nSpools of wire are between the two long middle shelves, in the gap that runs across the store. One spool is on the TV wall side, to your left. The other is on the robot side, to your right. The crowds that cleaned this place out wanted phones and speakers, so they left the boring, useful stuff behind.\n\nAt least six walkers are inside. One waits near the right end of the counter, by the robot. It stands as still as a cardboard cutout until you get close enough for it to hear you. The others stand between the rows like fish asleep in a tank. Be ready before you cross the floor.\n\nThe manager's office is locked. The manager left a note on the counter at the back. Read the note, and do exactly what it says. The best parts in this store are behind that door.",
      },
      notes: {
        "radioshack-counter": {
          title: "Priya's Alarm and Code",
          text: "I am Priya, the manager. This store was mine for six years, and I knew every screw on every shelf. Now listen, because the order matters here.\n\nFirst, turn off the alarm. Its panel is on the right wall, by the big dish. Press the {button} button, and only that one. The little light on the panel turns green when the alarm is off.\n\nThen go to the office keypad. The code is {code}: {codeSpoken}. Press each number slowly.\n\nDo not skip a step or swap their order. A wrong button, a wrong code, or opening the office with the alarm still on sets off the alarm. Walkers pour in like floodwater, even through the front door, and they keep coming until they get you.\n\nInside the office are two boxes of radio parts and more wire than one person can carry. Take the radio parts first. They are the hardest things in town to find and the easiest to break, so carry them like eggs.\n\nThe office door is in the back wall near the robot, beside the MANAGER sign. If those round red eyes are staring down at you, you are close.\n\nIf you are still hungry for supplies, two places north of downtown are worth the drive. The 4th Precinct is the old police station, and it has gun parts. Lincoln Middle School is nearby, and it has books, boxes and boxes of them. Do not laugh. A book about engines or plants can keep you alive longer than any gun.",
        },
        "radioshack-trail1": {
          title: "Jo on 88.1",
          text: "Jo here. If you have a radio at home, you might already know my voice. If not, here is who I am.\n\nI broadcast on 88.1, every night, from a rooftop downtown. News, warnings, and messages, all of it. Which roads are blocked. Which buildings have new crowds. Who is looking for whom. It is not much, but on a dark night, a voice can feel like a lamp in a window.\n\nI did not build my first transmitter. Priya did. She built it right here in this store, from parts on these very shelves. I sat on this checkout counter and handed her screws. It was the size of a shoebox and buzzed like an angry bee. It worked on the first try, and Priya acted like that was normal.\n\nThese days I also carry messages between Doc Lin and Nurse Ada. They cannot reach each other. The road up the hill to the hospital is packed with walkers, so Lin cannot get up, and Ada will not leave her patients. So every night, I read their words out loud for them. Some nights my voice is the only bridge between them.\n\nPriya left a note on the floor below the TV wall, across the store from here. All those dead screens will be staring back at you. Go and read it. It has something you can use.",
        },
        "radioshack-trail2": {
          title: "Priya Passes On a Key",
          text: "Priya again. Jo said you would find this under the TV wall. Jo is usually right, which is annoying.\n\nA key lies on the floor beside the arcade game, near the front of the store. It is a long, thin key on a blue tag shaped like a drop of water. It opens the tool crib at the Water Tower, far west of here, across most of town.\n\nHere is the story. Jo needed an antenna up high, higher than any rooftop downtown. The Water Tower is the tallest thing for miles. So Theo, who tends the pumps out there, gave me the key to his tool crib. He said Jo and I could borrow whatever tools we needed to put an antenna on the tower. We spent three long days up there, freezing, with wrenches in our pockets. The antenna still stands, and it is why you can hear Jo all the way across the river.\n\nNow the key stays here, in the ring. That was the deal Theo and I made, shaking hands at the bottom of the ladder. A borrowed key does not go home.\n\nOne warning. The tool crib has an old lock that bites. The wrong key snaps off inside it and is gone for good.\n\nSo pick up the thin key with the blue drop. Drive west to the Water Tower and open the tool crib. And please, bring the wrench back.",
        },
        "radioshack-dead1": {
          title: "Jo's Show Plan",
          text: "TONIGHT'S SHOW. 88.1. DON'T FORGET ANYTHING, JO.\n\nThis is Jo's show plan, written in marker on the back of a cereal box and taped to a shelf. Some lines have been crossed out and rewritten so many times that the cardboard is fuzzy.\n\n1. News at dusk. Start the second the sun touches the roofs. People are home by then and listening.\n\n2. Then music. One song, maybe two. Something with a good beat that does not make anyone cry. Something people can tap a foot to while they wait.\n\n3. Then messages. Names first, then where they are, then what they want to say. Read every name twice, slowly, in case someone is listening through static.\n\nIn the margin, in big letters boxed in three times: WARNINGS FIRST, ALWAYS. Before news, before music, before anything. If a crowd is moving, people need to know that before they need anything else.\n\nAt the bottom: No sad songs. People have enough.\n\nUnder that, in smaller writing, as if Jo had lost an argument about it: Not even the good sad ones. Not even the one about the train. Especially not that one.\n\nThe plan is stained with coffee, and the tape has been replaced more than once. It looks like a plan that has been used every night for a long time, and it still holds.",
        },
        "radioshack-dead2": {
          title: "Torn Envelope",
          text: "A note on a torn envelope, left near the robot at the end of the counter. It is written in a fast, jagged scrawl, and it is not signed.\n\nHEADS UP. The alarm panel is on the wall by the big dish. The button that turns off the alarm is the {decoyButton} one. Press it, and the office is all yours. I watched the manager do it a hundred times from the counter.\n\nIt looks like a helpful tip, passed from hand to hand, the way gossip moves through a school hallway. The writer even knew where the panel was, and that part is true.\n\nBut walk to the panel and look at it before you press anything. Its screws are shiny and new, while the wall around them is gray with dust. Fresh wire peeks out from under the cover, bright copper against the old paint. Someone opened that panel and changed its insides, not long ago.\n\nThat someone was Priya. She rewired the panel after this note was written, so the buttons no longer do what they used to do. Press the color on this envelope, and the alarm will scream instead of sleep. Every walker downtown will hear it.\n\nHer note on the counter has the button that works now. Read it, and do the steps in her order.",
        },
        "radioshack-dead3": {
          title: "Repair Tag for the Chief",
          text: "A cardboard repair tag, tied with string to the handle of a heavy, scuffed radio. The radio is red, with a fire station number painted on the side in white. The tag is filled out in Priya's neat, small capitals, every box checked.\n\nREPAIR TICKET.\nOWNER: Chief Dunn.\nITEM: Station radio, handheld.\nPROBLEM: Only gets static. Owner says it worked yesterday and then stopped. Owner admits he dropped it. The dents agree.\n\nUnder WORK DONE, Priya wrote: Fixed. Loose wire inside, and a cracked antenna base. Replaced both. Tested on three channels. Clear as a bell. Please stop using it as a hammer.\n\nThen, at the very bottom, pressed hard enough to dent the cardboard:\n\nTell the convoy to stay on one channel. Every truck, every boat, one channel. If they spread out across the dial, they will lose each other on the long drive north along the river. Then nobody will hear the warnings.\n\nThe radio still sits here by the front door, fixed and waiting, its red paint dull under a skin of dust. Maybe the chief never came back for it. Maybe he found another one. Maybe he is out by the river right now, with a new radio on one channel, just as Priya told him. Either way, the tag says it all: the work is done, and the advice still stands.",
        },
      },
      signs: {
        "radioshack-sign1": {
          title: "Store Sign",
          text: "Signal Electronics, in silver letters that used to glow blue at night. Under it, in smaller print: We fix what others throw away. Nothing lights up now, but the promise still reads true.",
        },
        "radioshack-sign2": {
          title: "Ruby's Red R",
          text: "Ruby's red R, sprayed big, with a 6 under it: six walkers when she came through. Under it, in her quick hand: One by the robot, at the end of the counter. Go slow.",
        },
        "radioshack-sign3": {
          title: "Yellow Numbers",
          text: "Painted in big yellow numbers, taller than a person: 88.1. Under it, in smaller letters: Jo, every night at dusk. Someone has drawn little sound waves rippling off the numbers, like rings spreading on a pond.",
        },
        "radioshack-sign4": {
          title: "Office Door Sign",
          text: "MANAGER'S OFFICE. PLEASE KNOCK. Under the printed sign, in green marker: Priya says look under the register. Someone else has drawn a small arrow pointing toward the counter, and a smiley face that looks a little nervous.",
        },
      },
      key: {
        name: "Long thin key, blue drop tag",
        tag: "A long, thin key, light as a pencil, on a blue plastic tag shaped like a drop of water. On the tag, someone wrote in white paint marker: BRING THE WRENCH BACK. The word WRENCH is underlined twice.",
      },
    },

    garden: {
      blurb: "A row of greenhouses on the west side, with seeds, soil, and a potting shed behind a padlock.",
      door: {
        title: "Rosa Painted the Gate",
        text: "Rosa here. I ran this greenhouse before the Fall, and I still think of it as mine, walkers or not.\n\nSeed packets are in the shop by the gate, near the big gnome, sorted and labeled in my handwriting. Soil bags are in the big greenhouse with the scarecrow, stacked between the long planting tables like sandbags against a flood. They are heavy, so take one at a time.\n\nAt least five walkers are inside. One stands at the back of the big greenhouse, still as a fence post, until it hears you. The others stand among the beds, just as still, until you wake them.\n\nThe potting shed is locked, and it holds the best of what I saved. My note is on the potting bench by the palm tree, in the glass palm house at the back right. Read it, and do exactly what it says. Please close the gate behind you. The rabbits are bad enough.",
      },
      notes: {
        "garden-bench": {
          title: "Rosa's Three Watering Cans",
          text: "Rosa again. You found my bench by the palm tree, so you are halfway home.\n\nLook down by this bench. Three watering cans stand in a row, like ducks waiting for bread. The shed padlock key is in the {pick}, one of the three watering cans by this bench. Tip that one gently, let the old water run out, and the key will slide into your palm.\n\nLeave the other two cans alone. They are my walker alarm, stuffed full of bells and tin cans. Tip one over, and the noise rings out across every greenhouse. Walkers come, more and more of them, even through the gate, until they get you. I built that trap for thieves, and it cannot tell a thief from a friend.\n\nThe shed is close. Leave the palm house by the door in its front wall, and follow the path down toward the beehives. The shed door is along that path, beside a sign that says POTTING SHED. Mind the step down.\n\nThere are more seeds inside, and there is a water tank. Keep the seeds dry and out of the sun. Wet seeds rot, and rotten seeds are just dirt that cost you a trip. A tank of water, though, is pure gold for a garden.\n\nIf you need tools, or a second tank, go north and east. Station 12 is the fire station north and east of here. It has tools and water tanks in its equipment bay. Chief Dunn runs that station. Tell him Rosa sent you, and tell him the tomatoes made it.",
        },
        "garden-trail1": {
          title: "Rosa Saw Them Both",
          text: "Rosa. This is a note about a brother and a sister, and somebody should write it down.\n\nA few days ago, a rattling truck pulled up at my gate. It coughed so loudly I thought every walker in the west end would come running. Out climbed Dev and Mr. Ortiz, both greasy to the elbows. They had stopped here to fill their water jugs from my rain barrels. Dev was polite and in a hurry. Mr. Ortiz was not in a hurry about anything.\n\nThey were going north to the Water Tower. Theo has clean water there, real clean water, and Mr. Ortiz said Theo had promised them a place to stay. I filled every jug they had and gave Dev a bag of snap peas for the road.\n\nThe very next day, a girl with red paint on her sleeves came to the gate. Ruby. She was asking for Dev, and she had the same tired eyes as him. I told her where he went: north, to the Water Tower, with Mr. Ortiz. She did not even sit down. She just nodded, said thank you, and walked away.\n\nI hope they found each other. I think about it while I water, row after row, with the hose hissing like rain.\n\nMy other note is in the big greenhouse, in front of the scarecrow. Leave this palm house and cross to the big glass house with the straw man in it. Read that note next.",
        },
        "garden-trail2": {
          title: "Rosa Keeps the Ring",
          text: "Rosa again. You found the scarecrow, so you are someone who follows through. I like that in a gardener.\n\nA key lies on the floor beside the beehives, out past the potting shed. It is a greasy steel key on a loop of wire. It looks like something you would find in a coffee can of old bolts, and that is exactly why nobody takes it. It opens the parts cage at Ortiz Auto, far east across town.\n\nMr. Ortiz gave me that key the day the truck stopped here. He held it out with his greasy fingers and said, keep this, so the ring does not break. He was leaving his shop behind, and his key had to stay somewhere he was not. That is the rule. A key never stays in the building it opens. It waits in another place, with a note like this one.\n\nI did not know what a parts cage was. I still mostly do not. But I know a promise when I am handed one. I kept this key in my apron pocket until the day I set it down for you. The bees do not mind it, and they will not mind you either, if you move slowly.\n\nThe parts cage has a plain lock. A wrong key just will not turn in it.\n\nSo take the steel key. Drive east, all the way across town, to Ortiz Auto. Open the parts cage and fix something good. Then leave the rest, the way Mr. Ortiz left this key for you.",
        },
        "garden-dead1": {
          title: "Rosa's Planting Chart",
          text: "PLANTING CHART, GREENHOUSE ROW. THIS SEASON.\n\nRosa drew this chart on graph paper in green pencil, with neat little boxes for every bed. Arrows point to the sunny spots, and question marks float over the shady ones.\n\nBEANS: By the gate. They climb the fence wire and shade the path. Water every other day.\n\nTOMATOES: At the back, against the warm wall. Stake them early, before they flop over like tired kids.\n\nSQUASH: Wherever the sun hits. Squash is greedy for light and will crawl over anything to get it, including your shoes if you stand still.\n\nNext to the beans there is a small star and a note.\n\nThe beans came from seeds my old friend June gave me, years ago, wrapped in a paper napkin. June has the best hands for a garden I have ever seen. She could make a bean grow in a parking lot. She taught half the kids at the old school how to tell a weed from a seedling.\n\nAt the bottom of the chart, underlined twice, is the most important job of all: Tell June the beans came up.\n\nUnder that, newer and smaller: They came up again this year. They always do. I still have not told her. I do not know where she is, but I think she is somewhere planting something. That is what June does.",
        },
        "garden-dead2": {
          title: "A Note on a Seed Packet",
          text: "A note from a stranger, scratched in pencil on the back of an empty seed packet. It was pinned to the path, right outside the potting shed door, with a garden stake.\n\nShed key? It is in the {decoyPick}, by the potting bench. Tip it out and help yourself. The lady who runs this place thinks she is clever. She is not that clever.\n\nIt is the kind of note that makes you want to run straight to the bench. The writer sounds sure, and a little smug, which somehow makes the note easier to believe.\n\nRead the packet itself before you go. It held bean seeds, and it is stamped with last spring's date. The pencil has faded, and rain has wrinkled the paper like an old man's hand. This note has been out here a long time.\n\nBelow the stranger's words, in tidy green ink, Rosa wrote her answer:\n\nA looter read this note and came for my key. So I moved the key, and the other cans are full of bells now. Tip the wrong one, and every walker in the west end hears it.\n\nMy note on the potting bench says where the key is now. Read that one. Please do not break my padlock, and please do not trust a note that will not sign its name.",
        },
        "garden-dead3": {
          title: "Rosa's Seed-Sharing List",
          text: "SEEDS GIVEN AWAY. WRITE IT DOWN, SO I REMEMBER WHO TO ASK FOR STORIES.\n\nThis is Rosa's seed-sharing list, kept on a clipboard that hangs from a nail. Every line has a name, a seed, and a place, written in green ink.\n\nTheo took carrots for the tower. He said the soil out there is sandy, so I told him carrots love sand. He promised me a jar of clean water for every bunch that grows.\n\nCarla took sunflowers for the lumber yard. She said the yard needs something tall that is not a stack of boards. She laughed so loudly that the walkers outside turned their heads. I made her whisper her thank you.\n\nMrs. Greer took beans for the library window boxes. She says the children at the library read better with something green to look at. She is probably right. She usually is. She paid me in a stack of old garden books, which was the best trade all year.\n\nAt the bottom of the list there is room for more names. Rosa has drawn little empty boxes there, waiting to be filled.\n\nUnder the boxes she wrote: Seeds for anyone. That is the rule here. If you need some, take a packet from the shop by the gate and add your name. I want to know where my plants go. Every name on this list is a little green flag planted somewhere in town.",
        },
      },
      signs: {
        "garden-sign1": {
          title: "Wooden Sign",
          text: "Greenhouse Row. Plants, seeds, soil. The words are carved into an old wooden board and painted green. Below it, a smaller board swings on two hooks: Open from dawn to dusk.",
        },
        "garden-sign2": {
          title: "Ruby's Red R",
          text: "Ruby's red R, sprayed on a whitewashed board, with a 5 under it. Under it, in her tight, quick hand: One at the back of the big greenhouse. Stay quiet and most of them sleep on.",
        },
        "garden-sign3": {
          title: "Chalk Circle and Arrow",
          text: "A chalk circle with a key drawn inside, by the seed vault door in the shop. Under it, underlined: The key is not here. Read the notes.",
        },
        "garden-sign4": {
          title: "Potting Shed Sign",
          text: "POTTING SHED. MIND THE STEP. The letters are painted in cheerful yellow on a slab of wood. A small watering can is painted next to the words, tipped as if it is pouring.",
        },
      },
      key: {
        name: "Greasy steel key, wire loop",
        tag: "A greasy steel key on a loop of twisted wire, dark with old oil and smelling of a garage. A scrap of masking tape wraps the loop, and on it, in square marker: FIX SOMETHING GOOD. A tiny wrench is drawn beside the words.",
      },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
