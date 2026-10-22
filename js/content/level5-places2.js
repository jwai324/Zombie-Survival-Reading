/* Reading level 5: places, part 2 (police, school, firehouse, hospital, watertower, lumberyard, mall, library). Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md.
   SCALE: new places go in a new part file (level5-places3.js ...) with its own script tag, not in this one. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[5] = root.ZSR.TEXT[5] || { level: 5 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    /* ---------- 4th Precinct ---------- */
    police: {
      blurb: "The 4th Precinct north of downtown: gun parts, an armor plate, a locked armory, and Sergeant Vega's plans for the River Convoy.",
      door: {
        title: "Sergeant Vega's Notice",
        text: "Sergeant Vega, 4th Precinct. Read this whole notice before you touch the door, because this building punishes people who hurry.\n\nGun parts are in the squad room, on the left side of the long hall that runs back from the lobby. An armor plate is in the garage on the right, by the riot shields near the front. At least eight walkers are inside. One of them is big, bigger than anyone I ever booked, and it waits by the police bike at the back of the garage. The plate sits closer to you than it does, so grab it and do not wander deeper. The others stand in the halls like officers on a shift that never ends.\n\nThe armory is locked, and I locked it myself. I left the combination on a note at the front desk, just inside the door. Read that note first. The armory door does not care how strong you are.",
      },
      notes: {
        "police-desk": {
          title: "The Armory Combination",
          text: "Sergeant Vega again. If you are reading this at the front desk, you made it through the door, so take one slow breath. Then do these steps in order.\n\nFirst, turn off the alarm. Its panel is on the left wall, by the coffee machine, here in the lobby. Press the {button} button, and nothing else.\n\nThen go to the armory. The combination is {code}. Enter it slowly, one number at a time.\n\nGet any part of this wrong, and the station alarm goes off. A wrong button, a wrong number, or opening the armory with the alarm still on will do it. Walkers pour in, even through the front door, and they keep coming until they get you. The siren on this roof was built to wake a sleeping city, and it still can.\n\nInside the armory are gun parts and an armor plate. Take what you can carry, and leave the rest for the next reader.\n\nTo reach it, take the long hall straight back from the lobby until it ends at the back hall. Then follow the back hall toward the garage, where the police bike is parked. The armory is near that end, the last door before the garage, marked ARMORY. Keep an ear on that garage, because the big one hears everything.\n\nOne more thing, since you clearly can read. The Public Library is north of downtown. It has books in its archive room, more than this town ever checked out. The librarian stayed when everyone else ran. If you go, knock first and keep your voice down. Tell her Sergeant Vega sent you.",
        },
        "police-trail1": {
          title: "The Convoy Is Real",
          text: "Sergeant Vega. People keep asking me if the River Convoy is real. So I am writing the answer under this REPORT IT poster, where I can stop repeating it.\n\nIt is real. Trucks and boats, going north along the river, away from the crowds that fill this town like water fills a basement. The road by the river runs flat and open. Walkers gather where people gather, and nobody lives out there, so the road stays clear. That is the whole idea. Away from people, the walkers thin out like smoke in a breeze.\n\nThe convoy keeps getting delayed, and I will not pretend otherwise. The river is too high, so the boats cannot launch without getting smashed against the bridge. The trucks need parts, and parts are the hardest thing in town to find. Every delay costs us another week.\n\nIf you want to come, sign up with Chief Dunn at Station 12. He keeps the list, and he keeps it honest. Nobody gets bumped for being young, old, or slow. Tell him Vega sent you. He will find you a seat, even if it is on a crate.\n\nThere is more, but not for this wall. My next note is in the K9 room, beside the dog kennel. Take the long hall back to the back hall, and look for the K9 UNIT sign.",
        },
        "police-trail2": {
          title: "A Key for the Ring",
          text: "Vega again. You followed the first note to the dog kennel, which tells me you read carefully. Good. This note is only for that kind of person.\n\nHere is how the key ring works, in case nobody told you. Ruby and Jo started it, and Mr. Reyes cut the keys. Every building has a stash, and every stash is locked. The key to each one is hidden in a different building, with a note that says where. Smash-and-grab crews never find them, because they never stop to read. You did.\n\nThe key in this building lies on the floor of the lobby, beside the coffee machine. It is a padlock key on a loop of orange rope, bright enough to spot even in this gloom. You would not have seen it on the way in. It opens the foreman's lockbox at Ridge Lumber, east of here on the ridge.\n\nCarla, the yard boss out there, is building boats for the River Convoy. She runs her crew the way a storm runs a coastline, loud and without stopping. When I last checked the boats, she pressed this key into my hand. She said a ring only works if every link holds. She gave it to me so the ring stays whole.\n\nThe foreman's lockbox has a plain lock. A wrong key just will not turn in it. So carry this key east to her lockbox, and knock first. Carla means it.",
        },
        "police-dead1": {
          title: "Lost and Found",
          text: "LOST AND FOUND, FRONT DESK. That is what the printed header says, in the stiff block letters of a form nobody expected to matter. Below it, someone kept the list going long after the phones went dead.\n\nItem one: one bike. Blue, with a bent front wheel and a bell that still rings. Found leaning on the front steps the morning the sirens started. Nobody came back for it. Someone oiled the chain anyway, every few weeks, as if it might be needed again.\n\nItem two: one trumpet. Dented case, school sticker on the side, sheet music folded inside the lid. Somebody practiced that song hard, because the corners of the page are as soft as cloth.\n\nItem three: one dog leash with no dog. Red nylon, the clip still closed, as if the dog slipped its collar and ran. The officer at the desk wrote: owner may come looking. Then, later, in a different pen: or the dog might.\n\nThe list stops there, three lines long, while the world outside got lost in ways no form could hold. The handwriting grows shakier with each line, the way handwriting does when a building is emptying around you.\n\nAt the very bottom, someone added one more line in thick black marker. It is not really an item. It just says: one town. Maybe it is a joke. It does not read like one.",
        },
        "police-dead2": {
          title: "Numbers on a Scrap",
          text: "Torn from a ticket book, folded twice, and tucked behind a bracket on the far wall of the garage:\n\nTo whoever is next. I know the armory combination. It is {decoyCode}. I copied it off the sergeant's own notepad, back when this place still had coffee and paperwork. Turn the alarm off first, then key it in, and the gear is yours. You earned it just by getting past the big one in here.\n\nIt sounds like a gift from a stranger who wanted someone to win. The handwriting is neat, too, which makes it feel trustworthy.\n\nTurn the scrap over before you trust it. On the back is a printed ticket, and the date on it is from the month before the Fall. Whoever wrote these numbers copied them a long time ago.\n\nSince then, things have changed. That is the old combination, from before Sergeant Vega changed it. Vega changed every lock in the building when the crowds came. Old numbers on a new lock do not just fail quietly. They set off the station alarm, and then the whole street comes in through the front door.\n\nThe note on the front desk has the combination that works. Vega wrote it after the change and signed it. Read that one, and leave this scrap where you found it.",
        },
        "police-dead3": {
          title: "A Letter Never Sent",
          text: "Little brother,\n\nI have started this letter nine times. Every time, a radio call or a walker at the door cut me off. So this time I am writing it in a holding cell. The bars at least make me feel like something is locked on the right side.\n\nI know you are upriver. Jo heard a voice on the radio from up your way, and I have decided it was you. I am allowed one stubborn hope. You always said the farm at the bend could hold out through anything. Prove it. Keep the stove lit and the door barred, the way Dad taught us.\n\nHold on. That is the whole message, so if this paper tears, keep that part. Hold on, because we are coming up along the river. Trucks, boats, people, and as much food as we can carry. Your name is on the convoy list under mine, even though you never signed anything in your life.\n\nI will not lie to you, because I never could. We have been delayed. The river runs high and angry, and the trucks keep breaking in new and creative ways. But Carla is building boats, and the list grows longer every day.\n\nThe convoy is late, but it is coming. So am I.\n\nVega\n\nThe envelope beside it has Vega's brother's name on the front, and no stamp. Sergeant Vega never sent it.",
        },
      },
      signs: {
        "police-sign1": {
          title: "Red Spray Paint",
          text: "A big red R sprayed by the front door, and an 8 under it. Ruby's mark, same as everywhere in town. Below that, in a hurry: one big one in the garage. don't get cornered.",
        },
        "police-sign2": {
          title: "The Old Wanted Board",
          text: "WANTED, says the header, but nobody is wanted for anything now. The board is covered with missing-person notes, layers deep, like leaves after a storm. One card near the top says: Ms. Adler's class, Lincoln Middle School.",
        },
        "police-sign3": {
          title: "River Convoy Sign-Up",
          text: "PRINTED NOTICE. River Convoy sign-up at Station 12. Trucks and boats, north along the river. All ages welcome. Ask for Chief Dunn. Bring what you can carry, and nothing you cannot.",
        },
        "police-sign4": {
          title: "ARMORY, POLICE ONLY",
          text: "A metal sign on the door: ARMORY. POLICE ONLY. ALL STAFF MUST SIGN IN. Under it, in black marker, in neat square letters: combination changed, see the front desk. Somebody underlined see twice.",
        },
      },
      key: {
        name: "Padlock key on orange rope",
        tag: "A strip of orange tape is folded around the rope, and on it someone printed two words: \"Knock first.\" The key itself is a plain padlock key, scuffed bright at the tip. The loop of orange rope smells like sawdust.",
      },
    },

    /* ---------- Lincoln Middle School ---------- */
    school: {
      blurb: "Lincoln Middle School north of downtown, with boxes of books in the music room and the front office, and a locked library closet.",
      door: {
        title: "Max and Mia Were Here",
        text: "Max and Mia wrote this. We are twins, we are thirteen, and we are still here, no matter what these empty halls say.\n\nThere are two boxes of books on the floor. One is in the music room with the drum set, off the right end of the main hallway. The other is in the front office, through the door behind the lion statue. At least six walkers are inside. One stands in the main hallway like a hall monitor who never heard the last bell. It hears you before it sees you, so keep your distance or put it down quietly.\n\nThe library closet is locked. The key is in our teacher's note, on the desk just inside the science room door, back left, the room with the big brain. Read it, and do just what it says. We took one box of books and ran. There are plenty left for you. If you see Ms. Adler anywhere, tell her we are coming.",
      },
      notes: {
        "school-classroom": {
          title: "Ms. Adler's Desk",
          text: "My name is Ms. Adler, and this was my classroom, right beside the big brain. Twenty-six desks, one broken pencil sharpener, and a window that never closed all the way.\n\nThe library closet key is in the {pick} of this desk, right under this note. Open that drawer, and the key sits in the back corner, under the attendance sheets.\n\nOpen no other drawer. Max and Mia, two of my students, tied air horns to the other two. Open one, and the noise brings every walker in the school, even through the front door, until they get you. An air horn cannot tell a looter from a friend.\n\nInside the closet are boxes of books and a folder of city maps. The maps show every street, alley, and bridge in town. Today they may be worth more than the books, but the books will outlast us all.\n\nHere is the way. Step into the main hallway and walk toward the music room with the drum set, away from the big brain. The library is the room just before it, next door to the drums. Its closet is tucked into the back corner of the library, on the drum set side.\n\nIf you need more than paper, Northgate Mall is in the north. It has food, medicine, and wire. But the crowds there are the worst in town. They fill the halls like a tide that never goes out. Go only if you must. Stay together, stay quiet, and keep moving.",
        },
        "school-trail1": {
          title: "To Max and Mia",
          text: "Max. Mia. If you are reading this, you came back through the front door, and I knew you would.\n\nThe class has gone northwest to the Public Library. Mrs. Greer, the librarian, will take us in. She has thick walls, high windows, and more books than we could read in ten lifetimes. I keep picturing your faces when you see the stacks. Max, you will want the dinosaur books. Mia, you will want all of them.\n\nEvery student is safe and counted, except the two of you. I count the class every morning, and every morning I come up two short, like a sum that will not balance. Do not take that as blame. A crowd swallowed half the street that day. It was not your fault.\n\nI will come back here to check whenever I can. If you see a fresh pencil mark at the bottom of this page, it means I was here. Walk northwest to the library in daylight and knock three times. Mrs. Greer knows your names, because I told her.\n\nWhen I came back to check yesterday, I found that Sergeant Vega had been here, looking for the class. The sergeant left a note in the music room, beside the drum set. Follow the main hallway all the way to the music end. Read it too. It is not exactly for you two, but it matters.\n\nWith love, Ms. Adler",
        },
        "school-trail2": {
          title: "Vega Kept a Promise",
          text: "Sergeant Vega, 4th Precinct. Two kids walked into my station a while back, twins. They left a note asking the police to find their class. Max and Mia. The paper was still damp from the rain. I wrote under it that I would look, and I meant it.\n\nSo I came. I found the school empty, the desks pushed to the walls, and chalk dust on everything like the first snow. No class, no teacher, no kids. Ms. Adler's note by the front door says they went northwest to the library. That is a better ending than most I walk into.\n\nWhile I am here, I am doing my part for the key ring. Every stash in town is locked, and its key waits in another building with a note like this one. Only readers find them.\n\nThe key I brought lies on the gym floor, under the basketball hoop. It is a short steel key on a gray tag. It opens the evidence locker at the 4th Precinct, west of here. Yes, my own station. Keys in the ring never stay home. The evidence locker has a fussy lock: the wrong key jams it, and after that only a crowbar opens it.\n\nI am writing this beside the drum set, and I did not touch it, though I wanted to. If the twins come back, tell them I looked. Tell them I kept my word. A promise to a kid is still a promise, Fall or no Fall.",
        },
        "school-dead1": {
          title: "The Last Lunch Menu",
          text: "LINCOLN LIONS LUNCH MENU, it says across the top, in a cheerful font beside a cartoon lion in a chef's hat. The week printed below is the week the Fall began.\n\nMonday: chicken nuggets, green beans, and a fruit cup. Someone drew a tiny frowning face next to the green beans, which seems unfair to the beans.\n\nTuesday: taco day. A student wrote BEST DAY in the margin and underlined it three times. Someone else wrote: every day is taco day if you believe.\n\nWednesday: spaghetti with meat sauce and garlic bread. Wednesday is the day the buses stopped coming on time. Nobody wrote anything next to Wednesday.\n\nThursday: turkey sandwiches, carrot sticks, and milk. The school closed early on Thursday. That milk is probably still in the cafeteria fridge, and nobody should open that door, ever.\n\nFriday: pizza. Friday was supposed to be pizza. It is printed in big letters, with a slice drawn next to it and little lines of steam rising like a promise.\n\nUnder Friday, someone wrote in pencil, pressing so hard the paper tore a little: we never got the pizza.\n\nIt is a silly thing to be sad about. Everyone who reads it seems to stop anyway. The corner of the menu is worn soft, as if many thumbs have rested there. In the bottom corner, someone drew a small slice of pizza with a smile.",
        },
        "school-dead2": {
          title: "A Paper Football",
          text: "A note on lined paper, folded into a tight triangle like a paper football. Someone left it in the middle of the gym, toward the cafeteria side. The writing is a kid's, round and careful.\n\nLibrary closet key: it is in the {decoyPick} of Ms. Adler's desk, in the science room. Just open it and take it. Ms. A said it was okay. Signed, M.\n\nIt reads like a message from one student to another. It is friendly and simple, and it even sounds like a teacher said yes.\n\nUnfold the triangle all the way, though. There is more on the inside flap, in a second, messier hand.\n\nMia, you wrote this BEFORE we rigged the drawers! Now the other two have air horns on them, and that one is one of them. Fix it! This is Max.\n\nSo the M was Mia. She wrote this note before the twins rigged the desk drawers to stop looters. Back then, any drawer was safe to open. Now the wrong one blasts a horn that brings every walker in the building, and there is no way out after that.\n\nMs. Adler's own note on the desk says which drawer is safe. Read hers. She wrote it after the horns went on, and she checked every drawer twice.",
        },
        "school-dead3": {
          title: "Max and Mia Again",
          text: "MAX AND MIA WERE HERE AGAIN. That is Max writing. Mia says the capitals are too loud, but this is good news, so it gets capitals.\n\nWe came back to the school and found Ms. Adler's note by the front door! She is okay. The whole class is okay! They went northwest to the library, and everyone is counted except us, which means she is still counting us. Mia cried. Mia says to write that Max cried first. Fine. We both cried. Then we ate a whole can of peaches to celebrate.\n\nThis is Mia now. Before we came back, we looked everywhere for the class. We went as far west as the Water Tower, which is a really long walk when your shoes are falling apart. Theo lives there and runs the pumps. He gave us water, real clean water, and he did not ask for anything. He just said kids get two jugs.\n\nMax again. We are going northwest to the library at first light. Not tonight, because Mia says the dark makes walkers bold, and she is usually right, which is annoying. We will sleep in the music room with the door shut and a chair under the handle. Max snores, so Mia gets the couch.\n\nMs. Adler, if you come back here before we find you, WAIT. We are on our way.\n\nLove, Max and Mia",
        },
      },
      signs: {
        "school-sign1": {
          title: "Classroom Poster",
          text: "A bright classroom poster with a smiling cartoon lion: RAISE YOUR HAND. BE KIND. READ EVERY DAY. At the bottom, in thick black marker, someone added a fourth rule: STAY TOGETHER.",
        },
        "school-sign2": {
          title: "Red R in the Hall",
          text: "Ruby's red R sprayed on the cinder block, with a 6 painted under it. Beneath, smaller: one in the hallway. it stands like a guard. it hears you first. go quiet.",
        },
        "school-sign3": {
          title: "Chalk Message",
          text: "In neat, round chalk letters, the kind a teacher writes on a board: \"Ms. Adler's class, gone northwest.\" Under it, smaller and underlined: read the note by the front door. Somebody drew a small arrow toward it.",
        },
        "school-sign4": {
          title: "LIBRARY CLOSET",
          text: "A brass sign on the door: LIBRARY CLOSET. PLEASE RETURN BOOKS ON TIME. Taped under it, a strip of paper in a student's handwriting: late fees canceled, by order of the end of the world.",
        },
      },
      key: {
        name: "Short steel key, gray tag",
        tag: "The gray tag is a plain one, with a blank box for a number. It says: \"Do not remove.\" Someone has crossed out the words \"do not\" with one firm line. The key is short, steel, and worn smooth.",
      },
    },

    /* ---------- Station 12 ---------- */
    firehouse: {
      blurb: "Station 12, a fire station north of town with tools, water tanks, a locked equipment bay, and Chief Dunn's convoy lists.",
      door: {
        title: "Chief Dunn's Bay Door",
        text: "Chief Dunn, Station 12. I run this station by lists, so here is yours.\n\nOne: the watch desk is the first thing you see when you walk in. The spotted dog sits beside it, as if it were still on duty. My note is on that desk.\n\nTwo: a tool kit is in the office behind the watch desk.\n\nThree: a water tank is in the truck bay, on the right wall, past the gear racks. It is heavy, so bring both hands.\n\nFour: at least six walkers are inside, and two of them stand in the truck bay. They wait between you and that tank like bad dogs on a short chain. The rest are spread through the other rooms, still as moths on a window.\n\nFive: the equipment bay is locked, and my note tells you how to open it. Read it before you try anything clever. Clever people break locks. Readers open them.",
      },
      notes: {
        "firehouse-desk": {
          title: "The Key Board",
          text: "Chief Dunn again. Look at the key board beside this desk. Four keys hang there, each one a different color.\n\nThe equipment bay opens with the {pick} on the key board by this desk. Take that one, and only that one.\n\nTake no other key. The others are for old locks: trucks that will not start and a shed that burned down years ago. Try a wrong one in the bay door, and it jams the bay lock. After that, only a crowbar opens it. So check the color twice, because in bad light, colors lie.\n\nInside the bay you will find a water tank, a stack of lumber, and a set of tools. Load the tank first. It is the heaviest thing in there, and you will not want to carry it last while your arms are shaking.\n\nFrom here, go through the side door into the truck bay. The fire truck is parked at the back, as big as a house on wheels. The equipment bay is at the back of the truck bay too, beside the fire truck, on the gear racks side. Look for the sign that says EQUIPMENT.\n\nA tank holds water, but it does not clean it. If you need filters, go to the Water Tower on the west side of town. There are filters in its pump house. Theo looks after the pumps out there. Tell him Station 12 says thank you, and get back on the road before dark.",
        },
        "firehouse-trail1": {
          title: "Convoy Plan, Posted",
          text: "CONVOY PLAN, posted by Chief Dunn beside the gear racks. Read it, then read it again, because I have rewritten it more times than I like.\n\nThe River Convoy will leave north along the river. Here is what goes.\n\nTwo fire trucks, Engine 12 and the old ladder truck, both from this station.\n\nSergeant Vega's van, with Vega at the wheel.\n\nCarla's boats, flat and wide, floating alongside on the river with people and bags.\n\nBoth trucks run, and that is thanks to Mr. Ortiz. He fixed them before he went west. He worked under those engines for two weeks and would not take a thing for it. He said a convoy that breaks down on the road is worse than no convoy at all.\n\nNow the bad news. The leaving day has moved three times, and every time for the same reason. The river is still too high. It roars past the north bridge like a freight train that never ends. Carla's boats would not last an hour in it. So we wait, and we check the water mark every morning.\n\nMy second note is in the bunk room, near the brass pole. Take the hall that runs from this truck bay toward the back of the station, and look for the BUNKS sign.",
        },
        "firehouse-trail2": {
          title: "Keys Never Stay Home",
          text: "Dunn. You found the second note by the brass pole, so you are the kind of person the key ring was built for. Let me explain it the way it was explained to me.\n\nRuby and Jo started the ring, and Mr. Reyes cut the keys. Every stash in town is locked, and its key is hidden in another building, next to a note that says where. Smash-and-grab crews tear a place apart and leave with nothing, because the key was never there. Readers walk in, read, and walk out with what they need.\n\nThe key here lies on the truck bay floor, beside the fire truck. It is a small silver key on a yellow tag shaped like a lightning bolt. You cannot miss that tag. It is the color of a warning light. It opens the repair locker at Signal Electronics, downtown, east of here.\n\nPriya, the manager at Signal Electronics, left it with me after she fixed the station's radios for the convoy. Every handset was dead or full of static when she came. When she left, they all talked to each other like old friends. I offered to pay her. She handed me this key instead and said keys in the ring never stay home. So it waits out by the fire truck, for you.\n\nThe repair locker has a plain lock. A wrong key just will not turn in it.",
        },
        "firehouse-dead1": {
          title: "Station 12 Chili",
          text: "STATION 12 CHILI, the famous one. Pinned up for the crew by Chief Dunn, who wants everyone to know it won the county cook-off three years running. It did not. It came in second twice and was disqualified once, for reasons the chief will not discuss. Something about a pot, a parking lot, and the mayor's shoes.\n\nIngredients: beans. More beans. Whatever is in the can. Read the label if it still has one. If it does not, open it and trust your nose. Your nose has never lied to you.\n\nStep one. Put everything in the big pot. Not the small pot. The small pot is for coffee, and nobody touches it.\n\nStep two. Light the burner low. Lower than that.\n\nStep three. Cook it slow. Slow is the whole secret. Chili is like a fire in a wall: rush it, and it gets away from you. Let it creep, and it does what you want.\n\nStep four. Stir every time you walk past. If you never walk past, you are not doing your job.\n\nStep five. Feed everyone, newest crew first, chief last. That is how a station eats.\n\nAt the bottom, underlined twice, in the chief's blocky letters: Never let Vega cook.\n\nUnder that, in different handwriting: That was one time, and the smoke alarm was already broken. Vega.\n\nAnd under that, back in the chief's letters: NEVER.",
        },
        "firehouse-dead2": {
          title: "On the Back of a Roster",
          text: "A note on the back of a duty roster, pinned in the truck bay by its right wall. It is not signed. The writing is big and blocky, like a firefighter in a hurry.\n\nTo the B shift. The equipment bay opens with the {decoyPick} on the board by the watch desk. Do not bother the chief about it. Just grab it and go.\n\nIt reads like an everyday message between crew members, the kind of note you would trust without a second thought. The roster on the other side even lists real names and real shifts.\n\nLook at those shifts, though. The last one listed is the week before the Fall. Nobody has worked a B shift here since. The note on the back is just as old as the roster on the front.\n\nSince then, the chief changed the bay lock. That key fit the old lock, before the chief changed it. Now it fits nothing in the bay but trouble. Put a wrong key in the new lock, and the lock jams. Then only a crowbar will open the bay door.\n\nThe chief's note on the watch desk says which key fits now. Walk back to the spotted dog, read the note there, and trust the newest words in the building.",
        },
        "firehouse-dead3": {
          title: "Passenger List, Page Two",
          text: "RIVER CONVOY PASSENGER LIST, PAGE 2. Chief Dunn's handwriting, square and careful, fills every line. Some entries are crossed out. Some have notes squeezed into the margins.\n\nLuis, Northgate Mall security. This line has a single neat stroke through it. Beside it: he will not leave the mall. Says somebody has to watch it. Asked twice. Will ask again. He is a stubborn man, and I respect a stubborn man.\n\nDoc Lin. One seat, only as far as St. Anne. She will step off at the foot of the hill and walk up to the hospital. She wants nothing else from us. She left a bag of medicine for the trip anyway, labeled, sorted, and counted twice.\n\nMs. Adler and her whole class. A long column of small names follows, each with a tick mark. The number at the bottom has been erased and rewritten many times. The paper there has worn thin, like a step in an old house.\n\nMrs. Greer. After her name, a large question mark. Next to it: will she leave the books? Probably not. Ask anyway.\n\nThe rest of the page is blank lines, a whole ladder of them. At the very bottom, in bigger letters than anything else on the sheet, the chief wrote: Room for more. Write your name.\n\nThe pen hangs beside the list on a string, waiting. Three new names were added last week.",
        },
      },
      signs: {
        "firehouse-sign1": {
          title: "TRUCK BAY",
          text: "Huge white letters on red paint, taller than a person: TRUCK BAY. KEEP CLEAR. The letters were made to be read through smoke, and they still shout across the dark. Nobody parks there now.",
        },
        "firehouse-sign2": {
          title: "Safety Board",
          text: "A safety board: THIS STATION HAS GONE ___ DAYS WITHOUT AN ACCIDENT. The number has been wiped off with a thumb. In the blank, someone wrote: we stopped counting, a long time ago.",
        },
        "firehouse-sign3": {
          title: "Red Spray Paint",
          text: "Ruby's red R, sprayed fast by the front door, with a 6 under it. Underneath, in drips: two in the truck bay. go slow and keep the bay door shut.",
        },
        "firehouse-sign4": {
          title: "Chalk by the Bay",
          text: "Chalked beside the equipment bay door, in big square letters: THE BAY KEY IS ON THE BOARD. Under it, smaller: the chief's note says which one. An arrow points back toward the watch desk.",
        },
      },
      key: {
        name: "Silver key, lightning bolt tag",
        tag: "The yellow plastic tag is cut in the shape of a lightning bolt, bright as a warning light. It says: \"Fix it, don't toss it.\" The small silver key is bright and clean, with sharp little teeth.",
      },
    },

    /* ---------- St. Anne Annex ---------- */
    hospital: {
      blurb: "St. Anne Annex, the hospital in the north hills, with medicine, a generator, Nurse Ada, and the worst walkers in town.",
      door: {
        title: "Nurse Ada on the Ambulance",
        text: "Nurse Ada. I stayed in this building when the others left, so trust the map I am about to give you.\n\nOne medical kit is in the patient room next to the x-ray machine, off the back hall on the left. Another is by the giant teddy bear in the gift shop, just off the front lobby on the left. The generator is in the utility room, on the right side of the building. It is heavy, so take it last. Your arms will thank you on the way out.\n\nAt least nine walkers are inside. They stand in the dark rooms like coats on hooks, still and patient, and they do not move until you are close. Look into every room before you step in.\n\nThe pharmacy stock room is locked. My note is at the nurses' station, in the middle of the building. It says what opens the stock room. If Doc Lin ever makes it up the hill, tell her I am still here.",
      },
      notes: {
        "hospital-hall": {
          title: "Nurse Ada Stayed",
          text: "Nurse Ada. I stayed. Someone had to keep the generator fed and the records dry. I do not regret it. Most days.\n\nThe pharmacy stock room has a badge lock. The reader still runs on the generator, which is one more reason I keep it going. The stock room badge, white on a blue clip, is in the {pick} of this station, right under this note. Take it, and hold it to the reader by the stock room door. The light blinks green after two seconds.\n\nOpen no other drawer. They are wired to the crash cart alarm, and it is loud enough to wake the whole hill. It brings walkers, more and more, even through the front doors, until they get you. There is no switch to turn it off once it starts.\n\nYou barely have to move. The stock room door is in this nurses' station room itself, across its walkway from the desk, on the angel statue side.\n\nThere are three medical kits inside. I counted them twice this morning and once more after lunch, because counting is how I stay calm. Three. Use them well.\n\nOne more instruction, and it is the important one. Stay quiet. The walkers here follow sound more than light. A flashlight beam across their faces does little. A dropped tray brings the whole hall. These halls carry sound the way pipes carry water, from room to room. Walk softly, close doors gently, and breathe through your nose.",
        },
        "hospital-trail1": {
          title: "Why I Stayed",
          text: "Nurse Ada. A log entry, left here at the chapel end of the hall, since nobody else is here to read my reports.\n\nPeople ask on the radio why I stayed. Here is the exact answer. The generator runs the cold room, and the cold room keeps the medicine that spoils in heat. It also keeps the lights on over the records, which hold the name of every patient this building ever treated. If the generator stops, the medicine spoils and the records go dark. So I stayed to keep the generator running. It is that simple, and it is that hard.\n\nEvery night at dusk I sit by the radio and listen to Jo on 88.1. Jo reads the news, the warnings, and the messages. I listen for one name: Doc Lin. Some nights there is word. Most nights there is static, and I go to bed on static.\n\nJo says Lin will come up with the River Convoy, riding with it as far as the foot of the hill. I believe Jo. But the convoy is late again. It has been late so many times that late feels like a place, a town where Lin lives now.\n\nI have a second note for you. It is in the x-ray room, beside the x-ray machine, at the far end of this hall. Walk the whole hall, away from the chapel, and look for the X-RAY sign.",
        },
        "hospital-trail2": {
          title: "The Ring Closes",
          text: "Nurse Ada, second note. You came looking, which means you read the first one. Thank you. Here is something useful in return.\n\nThere is a key in this building, but not in this room. It lies on the chapel floor, beside the angel statue, at the other end of the hall from this x-ray machine. It is a heavy old iron key with a square head, made for a door older than anyone alive. It looks like it belongs in a castle, not a gas station. It opens the old safe room at Gas-N-Go, south of here, near the south end of town.\n\nYou may know the key ring already. If not, here are the rules. Every stash is locked. Its key waits in another building, beside a note that says where. Only people who read ever find them, and that keeps the best supplies away from people who smash and grab.\n\nRuby brought this key up here on her first scouting run north. She sat in the hall with a cup of my coffee and explained the whole ring to me. This key is the last link, she said. Leave it here, and the ring closes into a circle. So I set it down by the angel, where it would be safe.\n\nThe old safe room has an old lock that bites. The wrong key snaps off inside it and is gone for good. Please carry this one south. Ruby was right about the circle.",
        },
        "hospital-dead1": {
          title: "Visitor Sign-In Sheet",
          text: "ST. ANNE ANNEX VISITOR SIGN-IN. The clipboard hangs from a nail by the door, with a pen still tied to it by a length of string. The sheet is from before the Fall, from an ordinary day, and that is the strangest thing about it.\n\nThe columns are neat: name, time in, time out, who you are visiting. Most of the names are strangers. A grandmother visiting a grandson with a broken arm. A man carrying flowers to the third floor. A delivery driver whose handwriting bounces like a ball. Somebody's dad, in at seven and out at nine, visiting a baby born that morning. He drew a tiny heart instead of signing out. Nobody ever corrected it.\n\nThe last name on the sheet is Doc Lin. Her handwriting is quick and slanted, the writing of someone who signed in here a hundred times and never thought about it. In the column for who you are visiting, she wrote one word: Ada.\n\nIn the time out column, there is no time. Instead, next to her name, she wrote: back tomorrow. Two words, underlined once.\n\nShe did not come back the next day, or the day after that. The sheet never got another name, and her notes across town say she is still trying. The pen on its string has swung against the wall many times. It rubbed a pale mark into the paint, like a clock that only counts doors.",
        },
        "hospital-dead2": {
          title: "An Old Staff Memo",
          text: "An old staff memo, pinned to the wall at the x-ray end of the main hall. It is printed on hospital paper, with a blue cross at the top and a typed signature from the front office.\n\nTO ALL NIGHT STAFF. For safety, the pharmacy stock room badge is now kept in the {decoyPick} of the nurses' station. Return it there after every use. Do not take it home. Thank you.\n\nIt looks official, and official things are easy to trust. The paper is crisp, the words are polite, and the memo even says please and thank you.\n\nBut look at the date typed at the bottom. This memo was printed in the month before the Fall, when the front office still had staff and a printer that worked. A lot has changed since then. The front office is empty now, and the printer is cold. Only one person still keeps this building running.\n\nThat person is Nurse Ada. She moved the badge after the memo was printed, and now the other drawers are wired to the crash cart alarm. Open the wrong one, and the alarm calls every walker on the hill.\n\nHer note on the station says where the badge is now. It is handwritten and signed, and it is newer than anything a printer made.",
        },
        "hospital-dead3": {
          title: "Generator Log",
          text: "GENERATOR LOG, kept by Nurse Ada. Black pen, one line per day, the handwriting so even it could have been printed.\n\nDay 41. Fuel checked. Oil checked. Still running.\nDay 42. Still running.\nDay 43. Still running.\nDay 44. Belt squeaking. Tightened it. Still running.\nDay 45. Still running.\n\nThe pages go on like that, a long column of the same two words, steady as a heartbeat on a monitor. Still running. Still running. The words never change, and that is the point. A generator that is still running means a building that is still holding. Some days she adds the weather. Most days she does not.\n\nThen one entry is different.\n\nDay 52. Jo says Lin is close.\n\nUnder that line, for the first time, the handwriting changes. It is still neat, but it leans forward. It looks as if it is hurrying somewhere.\n\nRan the generator one hour longer tonight, to keep the front lights on. If she comes up the hill in the dark, she will see the building lit. She will know which door.\n\nDay 53. Still running. Fuel low. Worth it.\n\nAfter that, the log goes back to the old rhythm, line after line: still running, still running. But every so often, in the margin next to a day, there is a tiny drawing of a lit window. Ada never explains it. She does not need to.",
        },
      },
      signs: {
        "hospital-sign1": {
          title: "QUIET ZONE",
          text: "A blue hospital sign: QUIET ZONE. PATIENTS RESTING. Under it, in Ada's tidy, upright writing: they follow sound, not light. Keep your voice down and your feet soft. She underlined sound twice.",
        },
        "hospital-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R, with a 9 sprayed under it. Then, in smaller letters running down the wall: they stand in the dark rooms. look before you step in. every time. no rushing.",
        },
        "hospital-sign3": {
          title: "Hospital Floor Map",
          text: "A framed floor map with a YOU ARE HERE dot near the bottom. Patient rooms run all along the main hall, room after room. A tiny label next to the chapel, off the main hall, reads: SUPPLY CUPBOARD.",
        },
        "hospital-sign4": {
          title: "Chalk by the Stock Room",
          text: "Chalked beside the stock room door, in Ada's tidy hand, the letters small and careful: Lin, it is all still here. Under it, a row of chalk marks counts the weeks she has waited.",
        },
      },
      key: {
        name: "Heavy iron key, square head",
        tag: "The tag is a scrap of cardboard tied on with wire. In thick red letters it says: \"Ruby was here.\" The key is heavy old iron with a square head, cold enough to make your hand ache.",
      },
    },

    /* ---------- Water Tower ---------- */
    watertower: {
      blurb: "The pump building under the Water Tower on the west side, with water filters, a locked pump house, and Theo's clean water.",
      door: {
        title: "Theo's Fence Note",
        text: "Theo. I tend the pumps here, and I am writing this on the fence gate because it is the first thing anyone touches.\n\nTwo water filters are lying loose. One is by the crates near the big red wheel, in the back left corner of the pump hall. The other is in the boat workshop on the right, by the rowboat. Look low. People always look up at the pipes and walk right past them.\n\nAt least six walkers are inside the pump building. The pumps hum, and the hum seems to hold them there, the way a porch light holds moths. They do not wander off, so you will have to get past them.\n\nThe pump house is locked, and I do not carry the key. My note is on the control panel, in the back right room. Read it before you try the pump house door. Take what you need, and leave the rest for the next thirsty person.",
      },
      notes: {
        "watertower-panel": {
          title: "Theo's Breaker Box",
          text: "Theo again. This is the control panel. Do not touch the red switches, or the big pump starts with a bang that every walker in the valley can hear.\n\nNow look at the wall right beside this panel. The pump house key is in the {pick}, one of the three breaker boxes by this panel. Open its little door, and the key hangs on a nail inside, next to the main switch.\n\nOpen neither of the other two boxes. They are live, humming with power from the pumps, and the shock kills. It would stop your heart before you could let go. Nobody steals from a breaker box, and that is exactly why I chose them. Fear makes a better lock than any padlock.\n\nTake the key, and you can open the pump house. Step out of this room and edge past the blue pump, then take the door into the pump hall. The pump house door is at the back of the hall, at the blue pump end, far from the big red wheel. A sign beside it says PUMP HOUSE. Inside are filters, a water tank, and a coil of wire.\n\nOne more thing, and it may matter more than the filters. If you need medicine, St. Anne Annex is the hospital, northeast up Hill Road. It still has medicine. But it is the most dangerous place in town. The walkers there wait in the dark rooms like a held breath. Go in daylight, rested and quiet.",
        },
        "watertower-trail1": {
          title: "Ruby, It Is Me",
          text: "Ruby,\n\nIt is me. Dev. If you are reading this, you followed every mark I left. You came all the way here, and I owe you a thousand apologies. Here is the first one: I am sorry. Here is the most important part: I am safe.\n\nTheo runs the Water Tower, and he lets me and Mr. Ortiz sleep up in the tower itself. You climb a ladder that goes on forever. At the top there is a round room with a view of the whole town. At night the walkers below look like ants that forgot their way home. Nothing down there can climb up after us.\n\nWe earn our place. Mr. Ortiz and I help Theo keep the pumps running, and I am getting good at it. Belts, valves, filters. It is like fixing the truck, only wetter. Mr. Ortiz says I have good hands. I think he is just being nice.\n\nIf I am out on a run when you get here, wait. Please wait. Do not go looking for me. Theo knows my routes, and I always come back by dark. Sit on the steps and yell up at the tower if you want.\n\nTheo also left a note for travelers in the pump hall, between the crates near the big red wheel. Go through to the back of this building and read it. He explains things better than I do.\n\nYour brother, Dev",
        },
        "watertower-trail2": {
          title: "For Travelers",
          text: "Theo. For travelers.\n\nYou probably know the key ring by now. If not, here it is. Every stash in town is locked, and its key is hidden in another building with a note that says where. Take what you need, and leave the rest. People who smash and grab never find the keys, because they never stop to read.\n\nThe key in this building lies on the floor beside the green tanks, in the chlorine room near the front. It is a small brass key on a purple school lanyard, the kind kids wear with a student card. It opens the principal's closet at Lincoln Middle School, far east of here, across town.\n\nHere is how it got here. Two kids walked up to my gate one evening, twins, Max and Mia. They were dusty and thirsty and arguing about whose idea the walk had been. They were looking for their teacher and their whole class. I gave them water and a place to sit by this big red wheel.\n\nThen Mia pulled this lanyard out of her pocket. She had taken the key from the principal's office on the day of the Fall. She said it should be in the ring, where it would help somebody. So they left it with me, and Mia made me promise to say she gave it up on purpose.\n\nThe principal's closet has a fussy lock. The wrong key jams it, and after that only a crowbar opens it.\n\nI hope they found their teacher. Kids like that deserve a good ending.",
        },
        "watertower-dead1": {
          title: "Theo's Water Rules",
          text: "THEO'S WATER RULES. Printed in thick pencil on an index card, then covered in clear tape so the damp cannot get at it. The card is nailed to a post at eye level, where nobody can claim they did not see it.\n\nRule one. One jug per person, each day. Not one jug per family. Not one jug per truck. One jug for each person standing in front of me. I count heads, not hands.\n\nRule two. Kids get two. Growing is thirsty work, and I am not going to argue about it. If you are not sure whether you count as a kid, you probably do not.\n\nRule three. Nobody leaves thirsty. If you came with nothing to trade, you still get your jug. If you came to make trouble, you still get your jug, and then you leave.\n\nUnder the rules Theo added later: Bring the jug back. Up here, empty jugs are worth almost as much as full ones. Cracked jugs get patched, not tossed.\n\nDo not drink from the river. I do not care how clear it looks. Clear does not mean clean.\n\nAt the bottom, in someone else's handwriting, round and careful: Theo gave us two each and did not even ask our names. Thank you.\n\nUnder that, in Theo's pencil again: Rules are rules. But he left a third jug on the shelf, just in case.",
        },
        "watertower-dead2": {
          title: "Good News on a Plate",
          text: "Written in blue marker on a paper plate, left in the blue pump room by its far wall. The letters are big and wobbly, as if the writer was in a very good mood. There is no name, just a smiley face with too many teeth.\n\nGOOD NEWS! The pump house key is in the {decoyPick}, by the control panel. Pop the little door and grab it off the nail. Easy. Theo thinks breaker boxes scare people. Not me!\n\nIt sounds cheerful and certain, like a neighbor shouting a tip over a fence. Somebody really did find the key in that box once. The plate is not lying about that.\n\nBut look at the plate itself. It is soft and stained, with a ring where a soup bowl sat on it weeks ago. The marker has started to fade. This plate has been sitting here a long time.\n\nSince then, Theo rewired the boxes, and he moved the key after he rewired them. That box is live now. Open it, and the shock is waiting where the key used to hang. A breaker box does not give second chances.\n\nUnder the smiley face, in Theo's careful pencil: Moved it. Read my note on the control panel. It says which box is safe.",
        },
        "watertower-dead3": {
          title: "Rebuilding the Old Motor",
          text: "Mr. Ortiz. Shop notes, Water Tower edition.\n\nThe old pump motor in this building has been dead longer than I have been here. Theo calls it the anchor, because all it does is sit there and weigh the place down. I am teaching Dev to rebuild it, piece by piece, the way I was taught when I was younger than he is.\n\nOn the first day, we took it apart and laid every bolt on a towel in order. Dev wanted to skip ahead. I made him draw each part first. A motor is a story, I told him. Read it out of order, and it makes no sense.\n\nLater that week, we scrubbed the rust off with vinegar and a wire brush. Then the bearings went back in. The shaft spins now, as smooth as a skater on new ice.\n\nWe still need two things: a belt and a gasket. The belt has to be the right width, or it will slip and squeal. The gasket has to seal tight, or the motor will leak oil like a cracked cup. If you find either one, leave it on this ledge.\n\nOne more line, for my own record. The boy has good hands, like Tomas's father. I taught that man too, long ago, in my own shop. He never rushed a job either. Neither does Dev, once he slows down enough to see the parts.",
        },
      },
      signs: {
        "watertower-sign1": {
          title: "CITY WATER WORKS",
          text: "A white city sign with a blue water drop: WATER WORKS. STAFF ONLY. Below it, a yellow warning plate: DANGER. PUMPS START WITHOUT WARNING. Keep your hands clear. The paint on the warning plate is fresh.",
        },
        "watertower-sign2": {
          title: "Big Chalk Letters",
          text: "In huge chalk letters, each one as tall as a kid: \"Ruby, I am here.\" Underneath, a single D, drawn twice to make it thick. Someone keeps the chalk fresh, every few days.",
        },
        "watertower-sign3": {
          title: "Chalk Circle",
          text: "A chalk circle with a small key drawn inside, by the tool crib door in the boat workshop. Under it: the key is not here. read the notes.",
        },
        "watertower-sign4": {
          title: "PUMP HOUSE",
          text: "A stenciled sign on the door: PUMP HOUSE. KEEP LOCKED. Under it, in Theo's tidy pen: The key is in a breaker box by the control panel. Read my note there first. Two of them are live. Someone added a lightning bolt in chalk.",
        },
      },
      key: {
        name: "Brass key, purple school lanyard",
        tag: "A purple school lanyard, printed with tiny lions, ends in a paper tag. In marker it says: \"Go Lions.\" The small brass key is scratched, as if it rode in a kid's pocket for a long time.",
      },
    },

    /* ---------- Ridge Lumber ---------- */
    lumberyard: {
      blurb: "Ridge Lumber on the east ridge: racks of lumber, a locked kiln shed, Carla's convoy boats, and a crowd at the loading dock.",
      door: {
        title: "Ruby's Spray Paint",
        text: "Ruby. Painted this one big so nobody misses it.\n\nLumber is in the long racks in the middle of the rack hall, more wood than one van can carry. One more stack sits out back by the log pile, in the open yard, and a big walker stands guard beside it.\n\nAt least eight walkers inside. A crowd of them gathers by the loading dock and the flatbed truck. They stand packed together, waiting for a delivery that will never come. Do not go near the dock. Do not make noise near the dock. Do not run the saws. The noise brings the whole dock crowd. If one of them turns, freeze, and count to ten before you move.\n\nThe kiln shed is locked. The yard boss left a note on a clipboard by the band saw, in the saw shop at the back left. It tells you how to open the shed. She knows her stuff. Read the note.\n\nOne more thing. If you see a kid named Dev, tell him his sister is still looking. Tell him to stay put.\n\nR.",
      },
      notes: {
        "lumberyard-rack": {
          title: "Carla's Clipboard",
          text: "Carla here, yard boss. Yes, I write in capitals sometimes. I TALK that way too. Ask anyone.\n\nThe kiln shed padlock opens with the code {code}: {codeSpoken}. Put in the numbers slowly, one at a time, and give the lock a good yank when you are done.\n\nGet it right the first time. A wrong code locks the old padlock up for good. It is a stubborn old thing, older than me, and it does not forgive. After that, only a crowbar opens it.\n\nTo find the shed, step out of this band saw shop into the rack hall. Follow the back wall toward the log pile. The kiln shed door is in that wall, beside a sign that says KILN. You cannot miss it unless you are looking at the dock, and you should not be looking at the dock.\n\nInside you will find dry lumber and a box of nails. The kiln dried that wood before the power went out. Now it is light and straight, and it will not rot or warp on you.\n\nNow LISTEN, because this part matters most. Do not run the saws. Not once. Not even to see if they still work. They do still work, and that is the problem. The noise brings the whole dock crowd, every last one, faster than you would ever guess. One scream from a blade, and the yard fills up like a bathtub. Carry the wood out by hand.",
        },
        "lumberyard-trail1": {
          title: "Boats for the Convoy",
          text: "Carla again. If you are standing in my sales office, watch your feet. Half my crew sleeps on this floor.\n\nMy crew is building boats for the River Convoy. Flat boats, wide and low, the kind that sit on the water like a leaf and carry more than you would think. We build them from the yard's best planks. Those are the long straight ones I used to save for rich customers with fancy decks. No more fancy decks. Now those planks are going to carry people north, away from this town.\n\nSergeant Vega comes by every week to check the boats. Vega knocks on every hull, squints at every seam, and asks the same question every time: are they ready? I give the same answer every time. The boats are ready. The river is not.\n\nThe river is still too high to launch them. It runs brown and fast, full of whole trees, and it would flip a flat boat like a pancake. So we wait, and we keep building, because waiting with empty hands drives me up the wall.\n\nMy other note is out back in the yard, near the log pile. Cross the rack hall to the open yard at the far back. Mind the big one by the logs, and keep away from the dock. Read that one too. It is about the ring.",
        },
        "lumberyard-trail2": {
          title: "Carla's Fair Trade",
          text: "Carla, second note. You made it out to the log pile in one piece, I hope. You want the key. Good. Here is the key.\n\nFirst, the ring, in case nobody told you. Ruby and Jo set it up, and Mr. Reyes cut the keys. Every stash in town is locked. Every key is hidden in a different building, with a note that says where. Readers find them. Window smashers do not. I love it.\n\nThe key in my yard lies on the floor of the sales office, beside the wooden bear, just inside the front door. It is a long, old-fashioned key with a round loop for a handle, like a key from a castle movie. It is tied to a paper bookmark, so nobody mistakes it for scrap. It opens the rare book room at the Public Library, north and west of here.\n\nHere is how I got it. Mrs. Greer, the librarian, came to my gate one morning in a raincoat and very sensible shoes. She needed planks to board up the library windows. I asked how she meant to pay. She held out this key and said, the rare book room. I told her I was not much for old books. She said, then pass it on to someone who is. So it lives here now, in the ring. Fair trade.\n\nOne warning. The rare book room has an old lock that bites. The wrong key snaps off inside it and is gone for good.",
        },
        "lumberyard-dead1": {
          title: "Ridge Lumber Yard Rules",
          text: "RIDGE LUMBER YARD RULES. Posted by Carla, the yard boss. Read them. Follow them. No exceptions, not even for the owner's nephew. Especially not for him. He knows what he did.\n\nRule one. Wear boots. Real boots, with steel in the toes. A falling board does not care how much you paid for your sneakers.\n\nRule two. Lift with your legs, not your back. Bend your knees, keep the load close, and stand up slow. Backs do not grow on trees. Lumber does, and that is the whole point of this business.\n\nRule three. Never run the saws without ear protection. Never run them while someone stands in the blade line. Never run them near closing time, when people are tired and careless.\n\nRule four. Sweep up your sawdust. A dusty yard is a slippery yard. A slippery yard is a broken wrist.\n\nSomeone, probably Carla, has drawn a thick line through most of rule three. Over it, in black marker, are four words: never run the saws. PERIOD. The marker pressed so hard it bled through the paper.\n\nAt the very bottom there is one more rule, added later in a different pen, blue and shaky, as if written fast. Rule five. If you hear the dock crowd, freeze. Do not run. Do not talk. Do not even breathe loud. Wait until the shuffling stops, then wait a little longer.",
        },
        "lumberyard-dead2": {
          title: "Code on a Receipt",
          text: "Scrawled on the back of a long receipt for nails and wood glue, and stuck in the crack of the kiln shed door. The pen dug in so hard it nearly went through:\n\nKILN SHED CODE IS {decoyCode}!! I know it for sure. Get in, grab the dry wood, get out. The dock crowd is restless today, so do not hang around. Good luck to whoever finds this. Pay it forward.\n\nNo name. Just a smear of sawdust where a thumb pressed down.\n\nIt feels like a gift, written fast by someone who wanted to help before running. The two exclamation points make it sound even surer.\n\nNow read the receipt on the front. The date printed at the top is from the spring before the Fall. Whoever wrote these numbers got them a long time ago, maybe from a crew member, maybe over a shoulder.\n\nBelow it, in a different pen, are neat block capitals that look like Carla's:\n\nOLD CODE. I CHANGED THE PADLOCK. That code was good once, before I changed it. Try it now, and the padlock locks up for good, and then you need a crowbar. Meanwhile, every rattle carries straight to the dock.\n\nThe code that works now is on Carla's clipboard by the band saw. Read that one. It is the only one that works.",
        },
        "lumberyard-dead3": {
          title: "Sketch of a Flat Boat",
          text: "A big sheet of brown paper, unrolled and held flat by four nails. On it, in carpenter's pencil, is Carla's sketch of a flat boat. It is drawn from above and from the side, with every measurement along the edges.\n\nThe boat is wide and shallow, shaped like a shoebox with the front end sloped up. That way it slides over waves instead of cutting through them. Little arrows show where the oars go and where the bags get tied down.\n\nNotes run down the margin in Carla's loud handwriting.\n\nEach boat holds ten people and their bags. Ten. Not eleven. I do not care if the eleventh person is small. Overload a flat boat, and the river comes in over the side.\n\nThe convoy needs four boats. Four boats means forty seats. Add the trucks and the sergeant's van, and that is about everybody on the chief's list.\n\nTwo are done. They sit out past the log pile, beyond the back fence, under tarps. They are sanded smooth and sealed with tar. No paint; paint is heavy.\n\nThe other two are still just frames, like the ribs of a whale on a beach. They need planks, rope, and about three weeks of good weather.\n\nAt the bottom, circled twice: When the river drops, we are ready. Under that, smaller: the river does not care that we are ready.",
        },
      },
      signs: {
        "lumberyard-sign1": {
          title: "Ridge Lumber Sign",
          text: "A huge painted sign along the front wall, beside the door, green letters on white boards: \"Ridge Lumber. Cut to order.\" A painted saw blade sits under the words. Someone has painted over the saw.",
        },
        "lumberyard-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R, sprayed in one long stroke, with an 8 under it. Below: they gather at the dock. stay away. An arrow points away from the dock, toward the gate.",
        },
        "lumberyard-sign3": {
          title: "Safety Sign",
          text: "A yellow safety sign with a picture of earmuffs: EAR PROTECTION NEEDED NEAR THE SAWS. Under it, in Carla's thick marker: the saws stay off. Nobody needs earmuffs now. Every plug in the yard is pulled out.",
        },
        "lumberyard-sign4": {
          title: "Spray Paint",
          text: "Spray-painted on the wall beside the kiln shed door in tall, dripping letters: CODE ON THE CLIPBOARD. An arrow points back toward the saw shop, where the yard boss keeps her clipboard by the band saw. Under the arrow: read it, then go.",
        },
      },
      key: {
        name: "Old-fashioned key with bookmark",
        tag: "The paper bookmark is printed with a little owl and a stack of books. Across it, in neat ink, it says: \"Handle with care.\" The key is long and old-fashioned, with a round loop for a handle.",
      },
    },

    /* ---------- Northgate Mall ---------- */
    mall: {
      blurb: "Northgate Mall in the north, full of goods, guarded by Luis, and home to the biggest walker crowd in town.",
      door: {
        title: "Jo's Mall Door Note",
        text: "Jo here, the voice on 88.1, writing instead of talking for once. This is the big one, so listen up.\n\nFood is in the food court at the back of the mall. Medicine is in the pharmacy on the left side of the main hall. Wire is in the gadget store on the right, next door to the sports store with the orange tent. You will cover a lot of ground, so plan your path before you take one step.\n\nAt least nine walkers are inside, and many of them stand along the main hall, still as mannequins until something wakes them. They drift together, like birds in a flock. Never let them pin you against a wall.\n\nThe security office is locked. The guard's note is in the play area by the green dino, back right, and it tells you how to get in. The guard is Luis. If he is around, say hi from Jo. Tell him the candy is on its way.",
      },
      notes: {
        "mall-guard": {
          title: "Luis Left the Code",
          text: "My name is Luis. I worked security at this mall for nine years, and I am still working it. Nobody ever told me to go home.\n\nDo this in order. First, turn off the alarm. Its panel is on the left wall, by the rocking horse in Toy Town. Press the {button} button, and only that one.\n\nThen the office code is {code}: {codeSpoken}. Press it in slowly, one number at a time, and wait for the green light.\n\nA wrong button, a wrong code, or opening the office with the alarm still on sets off the mall alarm. Walkers pour in, even through the front doors, and they keep coming until they get you. In a building this big, there is nowhere to hide from that noise.\n\nInside the office are gun parts, radio parts, and a tool kit. I locked them up on the last day, when I understood nobody was coming to relieve me.\n\nThe office sits right behind the green dino, but a wall stands in between. Go to the food court and take the kitchen door at the back, then turn right. Follow that hall toward the green dino's end of the mall, to the door marked SECURITY.\n\nNow the rule that keeps you safe in here. The walkers come running at anyone who runs. Every walker near you turns at once, and they do not get tired. So walk. Even when they are close, walk, and most of them stay put. Your legs will beg you to run. Do not listen to your legs. Listen to me.",
        },
        "mall-trail1": {
          title: "Luis Holds His Post",
          text: "Luis. Post report, left here by the front doors where everyone comes in.\n\nI have stayed at my post since the Fall began. Not because I am brave. A guard who leaves his post is just a man in a uniform. I have never been good at being just anything.\n\nThe crowd here walks the same slow loop every day. I have timed it. They start by the front doors in the morning and drift down one side. They cross the back at noon and come up the other side by evening. Then they stand in the main hall all night, swaying like tall grass with no wind. If you know the loop, you know where they will be. Their loop is a clock, and I have learned to read it.\n\nSergeant Vega came by last month. We sat on a bench in the main hall, and Vega asked me to join the River Convoy. A seat in the convoy, north, away from all this. It was a kind offer. I almost said yes. I said no. Someone has to watch the mall. Someone has to tell the next person to walk, not run.\n\nMy other note is in the sports store, beside the orange tent. Walk up to the main hall, follow it to the SPORTS sign, and step into the store with the tent. Walk.",
        },
        "mall-trail2": {
          title: "Used, Not Saved",
          text: "Luis again. You walked to the orange tent without running. Good. You are learning.\n\nYou may already know about the key ring. If not, here is the short version. Every stash in town is locked, and every key hides in a different building, with a note that says where. Only readers find the keys. People who smash glass and grab never do. I approve. It is basically security, and I know security.\n\nThe key in this mall lies on the floor of Toy Town, beside the rocking horse, at the far end of the main hall. It is a small silver key on a white tag with a red cross. It opens the supply cupboard at St. Anne Annex, far west of here in the north hills.\n\nDoc Lin brought it here on one of her medicine runs. She rested in my office and drank two cups of my coffee. Then she handed me the key and told me why. Nurse Ada, up at St. Anne, wants the cupboard used, not saved. Ada says supplies on a shelf help no one, but supplies in the right bag save lives. That sounds like Ada. I have never met her, but I feel like I have.\n\nThe supply cupboard has a plain lock. A wrong key just will not turn in it.\n\nSo here it waits, for you. Walk the main hall to Toy Town. Do not run.",
        },
        "mall-dead1": {
          title: "Patrol Log",
          text: "PATROL LOG, NORTHGATE. Officer: Luis. Post: main floor. The log book is thick and blue, with a pen tucked into the spine. Most of the pages look exactly alike. Luis writes in small, square capitals, like a man filling out a form for a judge.\n\nMonday. Morning round: crowd quiet, nobody running, doors held. Noon round: crowd quiet, nobody running, doors held. Evening round: same.\n\nTuesday. Crowd quiet. Nobody running. Doors held.\n\nWednesday. Crowd quiet. Nobody running. Doors held. Fixed the squeaky wheel on the cart.\n\nFriday. Crowd quiet. Nobody running. Doors held. Rain on the skylights all day.\n\nThursday. Crowd quiet. Nobody running. Doors held.\n\nThe days go on like that, page after page, the same three phrases marching down the lines like soldiers. Some readers would call it boring. Luis would call it a good week. In a place like this, boring means nobody got hurt.\n\nThen, halfway through the book, one entry is different. The handwriting is looser, almost cheerful.\n\nSaturday. Crowd quiet. Nobody running. Doors held. Jo came by with batteries for my radio and a bag of hard candy. Jo stayed for coffee. We talked for two hours about music and about nothing at all. First time I have laughed since the Fall. Jo says the station reaches the whole north side now. Jo says people listen. Good.\n\nThe next page goes back to the old phrases. Crowd quiet. Nobody running. Doors held.",
        },
        "mall-dead2": {
          title: "Pencil on a Flyer",
          text: "Pencil on the back of a folded flyer for a shoe sale, left among the tables in the food court. The lead is pressed so lightly it almost vanishes:\n\nSecurity office code: {decoyCode}. I got it straight from a guard's notebook, back when there were three guards here and a coffee cart by the door. The office has the good stuff, gun parts, radio parts, everything. Take only half. I will be back for the rest.\n\nThe note is not signed. The handwriting is quick and sloppy, and it sounds like someone who knows this place well.\n\nLook at the flyer, though. The shoe sale it announces ended the month before the Fall. Three guards and a coffee cart are only a memory now. One guard is left, and he does not leave his codes lying around.\n\nUnder the pencil, in firm blue ink, someone has added a reply:\n\nThat is the old code, from before I changed it. Press it now, and the alarm goes off, and every walker in this mall comes running. My clipboard in the play area has the code that works now. Read that one, and walk there. Do not run. Luis",
        },
        "mall-dead3": {
          title: "Letter from His Niece",
          text: "Dear Uncle Luis,\n\nJo said this letter could ride along on the next run. I am writing as small as I can to fit everything on one page.\n\nI am safe. I am at the Public Library with Ms. Adler's class. They let me stay even though I was never in her class. Ms. Adler says a class is whoever shows up, and I showed up.\n\nMrs. Greer makes everyone read every day. Every single day, even on what used to be Saturdays. At first I thought it was a punishment. Now I read two books a week. I finished a whole book about a lighthouse keeper who never leaves his post. It made me think of you. You would like it. The keeper fixes the light every night, even when no ships come.\n\nThe library is warm in the afternoon. We sit in a line along the windows and follow the sun across the floor like cats. The walls are stacked with books nobody wanted, and the walkers never get in.\n\nPlease come. There is room. I saved you a chair by the window. Mrs. Greer says there is always room for one more reader.\n\nLove, Sofia\n\nThe letter has been folded and unfolded so many times that the creases have gone soft as cloth. On the back, in Luis's square printing, there is one line: not yet.",
        },
      },
      signs: {
        "mall-sign1": {
          title: "Mall Banner",
          text: "A long vinyl banner on the wall at the end of the main hall, bright as a birthday: \"Northgate Mall. Something for everyone.\" One corner has torn loose and droops toward the floor like a tired flag.",
        },
        "mall-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R by the front doors, with a 9 under it. Below that, in letters as tall as a door, sprayed in three colors so nobody could ever miss them: DON'T RUN. Under that, smaller: walk. always walk.",
        },
        "mall-sign3": {
          title: "Store Map",
          text: "A mall map behind scratched plastic, with a red YOU ARE HERE dot in the main hall. Inside the gadget store, at its front wall, a small gold square is labeled JEWELRY VAULT. Someone circled it in pen.",
        },
        "mall-sign4": {
          title: "SECURITY, STAFF ONLY",
          text: "A metal sign by the door: SECURITY. STAFF ONLY. Under it, in black marker, in neat square letters: code on the clipboard by the green dino. The letters look like a guard wrote them.",
        },
      },
      key: {
        name: "Silver key, red cross tag",
        tag: "The white plastic tag has a red cross printed on one side. On the other side, in tidy pen, it says: \"Ada says use it.\" The small silver key is bright and clean, as if someone polished it.",
      },
    },

    /* ---------- Public Library ---------- */
    library: {
      blurb: "The Public Library north of downtown, with books, city maps, a locked archive room, and a whole class reading by window light.",
      door: {
        title: "Mrs. Greer's Book Drop",
        text: "Mrs. Greer, librarian, writing on the book drop, the one slot in town still open for returns.\n\nBooks are waiting in three places. Two boxes are in the stacks on both sides of the main hall, one to the left and one to the right. The third is in the children's room by the toy castle, at the front left. All are packed and labeled by subject, as is proper.\n\nAt least eight walkers are inside. Two of them are in the main hall, and you will meet those two first, because nearly every door opens off that hall. They stand like readers who have lost their place. The others keep to the corners, like patrons who prefer the stacks.\n\nThe archive room is locked, and I keep it that way on purpose. My note is on the reference desk by the giant globe, in the back left room, where the answers have always been. Read it, and do exactly what it says. And please, be quiet. It is still a library.",
      },
      notes: {
        "library-desk": {
          title: "Three Big Books",
          text: "Mrs. Greer again. You found the reference desk by the giant globe. For thirty-one years I sat here and answered questions, so here is one more answer.\n\nThe archive key is inside the {pick}, one of the three big books on this desk. Years ago I cut a small hollow in its pages, a crime I confess freely. The key sits in that hollow, flat and cold, like a pressed flower.\n\nOpen neither of the other two books. I hid a blast trap in each one, for book thieves, and it kills. I am not proud of it, but thieves came, and I had children to protect. So read my words twice, then open only the book I named.\n\nTake the key, and you can open the archive room. Inside are books and a folder of city maps. Those maps show every street, alley, and footbridge in town.\n\nGo out the door of this room into the main hall, and head for the back end of the hall. The archive door is right there, between the room with the giant globe and the room with the tall clock. Look for the sign that says ARCHIVE.\n\nNow let me tell you something I believe completely. Reading saved this building. When the crowds came, we had no boards and no nails. We had books. Look at the walls on your way out. They are stacked floor to ceiling with the books nobody wanted. Paper, packed tight enough, is as stubborn as brick.",
        },
        "library-trail1": {
          title: "A Class by Window Light",
          text: "Mrs. Greer. A short history of the present, pinned by the BOOKS N-Z sign, since someone ought to keep one.\n\nMs. Adler's class lives here now. They arrived on a gray evening, a crowd of children in two straight lines. They walked behind their teacher, holding hands like paper dolls. Ms. Adler had told them a library is the safest building in any story, and they believed her. Now so do I.\n\nThey read by window light, because candles and paper make poor roommates. Every morning they drag their chairs to the high windows. They follow the sunlight across the floor, like cats chasing a warm patch. They keep quiet without being told. Children understand quiet better than adults think. A whisper, to them, is a kind of armor.\n\nMs. Adler still watches the front door for the twins, Max and Mia. Two of her students were lost in the crowds on the first day. She counts the class every morning and comes up two short. Then she takes her tea to the front window and stands there, watching the street, until the light goes. I do not tell her to stop. Some books you do not close until the last page.\n\nMy other note is in the periodicals room, beside the tall clock. Follow the main hall toward the back, and look for the PERIODICALS sign. The tall clock stopped long ago, but it is hard to miss.",
        },
        "library-trail2": {
          title: "A Catalog of Keys",
          text: "Mrs. Greer. You found the tall clock, so you deserve to know how the key ring works.\n\nEvery stash in this town is locked. Its key is hidden in a different building, beside a note that explains where. Ruby and Jo devised it, and Mr. Reyes cut the keys. It is, in its way, a library system: a catalog of keys, open to anyone who can read the cards. The smash-and-grab crowd never finds a thing. They have never been patient readers.\n\nThe key in this building lies on the floor of the children's room, beside the toy castle, at the front of the library. It is a tiny gold key in a small velvet pouch, dark blue, the kind a ring comes in. It opens the jewelry vault at Northgate Mall, east of here.\n\nLuis the guard sent it with Jo. Jo arrived at our door one evening with a crate of batteries, a stack of letters for the children, and this pouch. Luis asked me to keep it for the ring. He wrote that a mall guard should not hold his own vault's key. A librarian, he said, was the most honest keeper he could think of. I was flattered. The children guard the castle, and now they guard the key as well.\n\nA warning: the jewelry vault has a fussy lock. The wrong key jams it, and after that only a crowbar opens it.\n\nTake it east. And if you see Luis, tell him his niece finished another book.",
        },
        "library-dead1": {
          title: "The Reading Chart",
          text: "BOOKS WE HAVE READ, says the top of the chart, in Ms. Adler's neat teacher print. It is a long sheet of brown paper taped to the wall. Names run down the left side, and rows of gold foil stars stretch to the right like little parades.\n\nThe rule is printed under the title: one star for every book you finish. Not for starting. Not for the pictures. For finishing. Ms. Adler is strict about that.\n\nSome rows are long. One girl has so many stars that her row ran off the paper. Someone taped on a second sheet just for her. A boy near the bottom has only four, but each one is huge. He must have pressed them on with his whole hand. Next to his name, someone drew a tiny dragon.\n\nNear the bottom of the chart are two names side by side: Max and Mia. Their rows are empty. Every morning, someone dusts them anyway. Not a single star, not yet. The paper there is perfectly clean, as if nobody dares to touch it.\n\nBut next to the empty rows, someone wrote in pencil, small and careful: saving their stars.\n\nUnder the chart, on the floor, there is a little paper envelope. Inside are dozens of gold stars, counted and waiting. On the front, in a child's wobbly letters: for when they get here.",
        },
        "library-dead2": {
          title: "An Index Card Tip",
          text: "A white index card, typed on an old typewriter so the letters bite into the paper. It was propped up in the lobby, just inside the front door, where every visitor would see it first.\n\nTO THE NEXT VISITOR. The archive room key is inside the {decoyPick} on the reference desk. Open it to the middle and there it is. The librarian thinks nobody knows. I know. Now you know too.\n\nIt is not signed, and it sounds so sure of itself that you can almost feel the heavy cover in your hands.\n\nTurn the card over before you trust it. On the back, in tidy pencil, someone has written a reply:\n\nA thief read this card once and came for my key. I found the book open on my desk, and the key still in it. After that, I moved the key, and I set my traps in the other books. The book named on this card may not be the safe one anymore. Open the wrong book now, and the blast will not care whether you are a thief or a reader.\n\nI left this card here on purpose, as a lesson. Do not trust an old answer just because it was right once. My note on the desk says which book is safe.\n\nMrs. Greer",
        },
        "library-dead3": {
          title: "Shelter Rules",
          text: "SHELTER RULES, by order of Mrs. Greer, head librarian. Hand-lettered on heavy paper, framed, and hung low so the smallest readers can see it too.\n\nOne. Whisper. Walkers hear a shout through three walls. They do not hear a whisper through one. Besides, this is a library, and some rules are older than the Fall.\n\nTwo. Read. Every day, every person, at least one chapter. Reading puts your mind somewhere other than here, and that is a kind of rest. Ms. Adler checks. So do I. No one has ever skipped twice.\n\nThree. Take turns at the window. The window seats have the best light and the best view of the street. Everyone wants them. Everyone gets them, two hours at a time, in order. Whoever sits at the window also keeps watch.\n\nFour. Books nobody wants go on the walls. If a book has not been checked out in ten years, it has a new job now. Stack it tight against the windows and doors, spines facing in. A book that stops a walker has finally found its reader.\n\nFive. Never run in the library. Not ever. Not when you are late, not when you are scared, not when something bangs on the door. Running makes noise, and noise is an invitation.\n\nThese rules are not suggestions. Anyone who breaks rule five shelves books for a week. I have a great many books.",
        },
      },
      signs: {
        "library-sign1": {
          title: "QUIET, PLEASE",
          text: "A small brass plaque on the main hall wall by the stacks: QUIET, PLEASE. Under it, written in pencil so faint you have to lean in: it works on walkers too. Somebody drew a small smile under it.",
        },
        "library-sign2": {
          title: "A Very Small R",
          text: "Ruby's red R, with an 8 under it, but tiny this time, no bigger than a thumbprint. It looks as if she felt bad writing on a library wall. Next to it, even smaller: sorry.",
        },
        "library-sign3": {
          title: "Library Hours",
          text: "A printed sign in a wooden frame: LIBRARY HOURS. The old times are taped over, and new ones written in: dawn until dark. Below it, in red: no candles near the books. Ever.",
        },
        "library-sign4": {
          title: "Chalk by the Archive",
          text: "Beside the archive door, someone has chalked a line in neat, curly letters, the kind a librarian uses on a book cart. It reads: ask Mrs. Greer's note before you open a book. A small chalk arrow points toward the reference room with the giant globe.",
        },
      },
      key: {
        name: "Tiny gold key, velvet pouch",
        tag: "A paper tag is tied to the drawstring of the velvet pouch. In square printing, it says: \"Not for show.\" Inside the pouch, the tiny gold key shines like a coin at the bottom of a well.",
      },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
