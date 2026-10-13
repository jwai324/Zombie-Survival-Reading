/* Reading level 4: places, part 2 (police, school, firehouse, hospital, watertower, lumberyard, mall, library). Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[4] = root.ZSR.TEXT[4] || { level: 4 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    /* ---------- 4th Precinct ---------- */
    police: {
      blurb: "The 4th Precinct, a police station north of downtown with gun parts, an armor plate, and a locked armory.",
      door: {
        title: "Sergeant Vega's Notice Board",
        text: "Sergeant Vega, 4th Precinct. I pinned this to the notice board because people still read notice boards.\n\nGun parts are in the squad room, left of the long hall. An armor plate is in the garage on the right, by the riot shields, leaning against a dead cruiser.\n\nAt least eight walkers are inside, and one of them is big. The big one waits by the police bike in the garage, so do not let it pin you against the wall. The others drift between rooms, so check each doorway before you cross it.\n\nThe armory is locked behind a combination dial. I left the combination on a note at the front desk. Read it first and save yourself the guessing.",
      },
      notes: {
        "police-desk": {
          title: "The Armory Combination",
          text: "Sergeant Vega again. If you are reading this, you made it to the front desk. That means you already know more than most. Catch your breath, and keep one eye on the door behind you.\n\nThe armory has a dial lock, and the combination is 19-4-33. Turn left to 19, right to 4, then left to 33, and pull hard. You can open the armory now. Inside are gun parts and an armor plate. I counted them myself before I locked up. Take what you need, and leave the rest on the rack for the next reader.\n\nThe armory is near the end of the back hall, toward the police bike. It is the last door before the garage, under the ARMORY sign. You never have to go near that bike.\n\nNow, the other thing. The Public Library is north of downtown, a short drive from here. Its archive room holds books, crates of them. The librarian stayed when the rest of the street emptied out. Her name is Mrs. Greer, and she runs that building like a ship. If you go, knock first and say who sent you. She does not open for people who shout. Honestly, I respect that.",
        },
        "police-trail1": {
          title: "The River Convoy Is Real",
          text: "You have probably heard rumors on the radio by now. Here is the truth, from the person organizing it. The River Convoy is real. Trucks and boats will go north along the river, away from the crowds that fill this town. We are not just running away. We are going somewhere with fewer walkers and more room to grow food.\n\nIt keeps getting delayed, and I will not pretend otherwise. The river is too high for the boats to launch safely. The trucks need parts we have not found yet. Every week I pick a date, and every week the water rises again. Still, the plan holds.\n\nIf you want to come, sign up with Chief Dunn at Station 12. He keeps the list, and he keeps it honest. Bring your own water and one bag you can carry for miles. If you can fix engines, drive a truck, or row a boat, say so. Skills move you up the list.\n\nMy next note is in the K9 room, beside the dog kennel. Follow the back hall to the K9 UNIT sign.\n\nSergeant Vega",
        },
        "police-trail2": {
          title: "A Key for Carla's Lockbox",
          text: "Vega again. You found the second note, so you read carefully. Good. Now head back out to the lobby. A key lies on the floor there, beside the coffee machine. It is a padlock key on a loop of orange rope, hard to miss once you know.\n\nThat key opens the foreman's lockbox at Ridge Lumber, east of here on the ridge. Carla runs that yard, and right now she is building boats for the convoy. She gave me this key so the ring stays whole. Her words were simpler: no key stays in the house it opens.\n\nYou may not know about the ring yet. Survivors made a rule: take what you need, leave the rest. Every stash is locked, and its key is hidden in another building. A note always says where. People who smash and grab never find the keys. People who read always do.\n\nSo take the rope key east to the yard. Walk, do not run, and stay away from the loading dock. If you can, leave something useful in the lockbox. That keeps the ring turning.",
        },
        "police-dead1": {
          title: "Lost and Found List",
          text: "LOST AND FOUND, FRONT DESK. Describe each item clearly and write the date it came in. Owners must show a photo ID to claim anything.\n\nOne bike. Blue frame, bent front wheel, a lightning bolt sticker on the seat. Found leaning on the station steps on a Monday morning. Nobody has called about it, which is strange for a bike this nice.\n\nOne trumpet. Dented bell, case missing, still plays one sad note if you push hard. Found on a bus bench outside the middle school. Probably belongs to a kid in the band. Holding it until somebody asks.\n\nOne dog leash with no dog. Red nylon, worn soft at the handle, the clip still closed. Found on the sidewalk by the river path. Checked the park twice and put up a flyer. No dog anywhere. If a lost dog turns up anywhere, bring it straight to this desk.\n\nThat is where the desk clerk's neat printing stops. Someone added one more line at the bottom, in thick black marker. The letters are pressed so hard that the paper tore.\n\nOne town.",
        },
        "police-dead2": {
          title: "Numbers on a Scrap",
          text: "ARMORY: 33-4-19.\n\nFound this taped inside a garage locker. I am pretty sure it is the combination for the armory dial. One of the officers wrote it on his hand every shift, and I copied it before he left. Spin left to 33, right to 4, then left to 19. Go slowly, because the dial skips if you rush it. If it fails the first time, try again with steadier hands. Bring a big bag, because there is more in there than one person can carry. Do not tell the crowd from the bridge camp. They would clean it out in a day and never leave a thing for anyone else.\n\nUnder that, in a different pen, the letters slanting hard:\n\nTried it six times. The dial will not budge. These are the right numbers in the wrong order, so somebody copied them backward. Stop wasting time out here in the garage with the big one nearby. The note on the front desk has the combination that works. Sergeant Vega wrote it, and Vega does not get numbers wrong. Ever.",
        },
        "police-dead3": {
          title: "A Letter Never Sent",
          text: "Dear brother,\n\nI do not know if this will ever reach you. There is no mail, and the phones went quiet months ago. I am writing anyway, because writing keeps my hands still at night. I am still at the precinct. The walls are thick, the doors are steel, and I can sleep here most nights.\n\nYou always said I was too stubborn to quit. You were right, and I have put that to good use. Some of us are building a convoy, trucks and boats together. We will travel north along the river, toward you. I think of your farm upriver every time I look at the water. I hope the fences held. I hope you planted the beans like you promised.\n\nSo hold on. We are coming up along the river, and we are bringing people who can work. Keep a light in the window if you can spare the fuel. I will be watching for it from the first truck. Save me a seat at the table, and save some of those beans.\n\nThe convoy is late, but it is coming.\n\nVega",
        },
      },
      signs: {
        "police-sign1": { title: "Red Spray Paint", text: "A big red R by the front door, sprayed fast, with an 8 underneath it. Ruby counted eight walkers in here. Below it, in smaller letters: ONE BIG ONE IN THE GARAGE. DON'T GET CORNERED." },
        "police-sign2": { title: "The Old Wanted Board", text: "WANTED, says the old board, but the wanted posters are gone. Missing-person notes cover it now, pinned three deep. One is printed in careful letters: Ms. Adler's class, Lincoln Middle School. Have you seen them?" },
        "police-sign3": { title: "Printed Notice", text: "NOTICE: River Convoy sign-up is now at Station 12, the fire station. Ask for Chief Dunn. Bring your name, your skills, and one bag per person. Boats and trucks, heading north." },
        "police-sign4": { title: "ARMORY, POLICE ONLY", text: "ARMORY. POLICE ONLY. AUTHORIZED STAFF MUST SIGN IN. Under it, in black marker: Combination changed. See the front desk. Do not waste your time guessing at the dial." },
      },
      key: { name: "Padlock key on orange rope", tag: "Foreman's lockbox. Knock first. The words are burned into a scrap of pine with a hot nail. The key is a stubby padlock key. It hangs on a loop of bright orange rope, frayed at the knot." },
    },

    /* ---------- Lincoln Middle School ---------- */
    school: {
      blurb: "Lincoln Middle School north of downtown, with boxes of books in the classrooms and a locked library closet.",
      door: {
        title: "Max and Mia Were Here",
        text: "Max and Mia wrote this! Okay, Mia is writing, and Max is holding the flashlight. We go to school here, or we did.\n\nThere are two boxes of books. One is in the music room, with the drum set. The other is in the front office, behind the lion statue. We stacked them ourselves for the book fair.\n\nAt least six walkers are inside. One is in the main hallway, and it walks back and forth all day. Wait until it turns around, then go.\n\nThe library closet is locked. The key is explained in our teacher's note, on her desk in the science room. That is back left, by the big brain. Read hers before you try the closet door. Also, if you see her, tell her we are looking!",
      },
      notes: {
        "school-classroom": {
          title: "Ms. Adler's Desk",
          text: "My name is Ms. Adler, and I taught in this room for eleven years. If you are reading this, please treat the room kindly.\n\nThe library closet key is in the top drawer of this desk. The drawer sticks halfway, so pull it all the way out and reach to the back. The key hangs on a ring with a paper star, a gift from a student. You can open the library closet now.\n\nGo out to the main hallway and follow it toward the drum set room. The library is the room next to it. Its closet is in the back corner, on the drum set side.\n\nInside are boxes of books and a folder of city maps. Take the maps first. They show every street, and streets matter more than stories right now. That hurts me to write.\n\nIf you need food, medicine, or wire, Northgate Mall is in the north. It has all three, more than any store in town. But the crowds there are the worst in town. They fill the floor and move together like one slow animal. Go only if you have no other choice. Go in daylight, and keep your exit in sight.",
        },
        "school-trail1": {
          title: "To Max and Mia",
          text: "Max, Mia, if you find this, stop and breathe. You are not in trouble. I am so sorry we lost you in the crowd that morning.\n\nThe class has gone north to the Public Library. Mrs. Greer, the librarian, will take us in. She has thick walls, high windows, and more books than we could ever finish. Every student is safe and counted, except the two of you. I count you anyway, every night, out loud. Nobody is allowed to sit in your seats.\n\nI will come back here to check whenever I can. If you read this, go north to the library in daylight, and stay together. Hold hands crossing the open streets, even if Max complains about it.\n\nP.S. I came back today, as I promised. Sergeant Vega came looking for the class while we were gone. Vega left a note in the music room, beside the drum set. Follow the main hallway to the MUSIC sign. Read it, because it is for whoever finds this. Then please, leave my note here for the twins.\n\nMs. Adler",
        },
        "school-trail2": {
          title: "Vega Came for the Class",
          text: "Sergeant Vega, 4th Precinct. Two kids named Max and Mia left a note at my station. They asked the police to help them find their class. So I came. I found the school empty, with chairs up on the desks and coats still on the hooks. Ms. Adler's note says the class is safe. I am glad somebody wrote that down.\n\nWhile I am here, I am leaving something for the ring. A key lies on the gym floor, under the basketball hoop. It is a short steel key on a gray tag. It opens the evidence locker at the 4th Precinct, west of here. Yes, my own station. Keys in the ring never stay home, so mine lives here now.\n\nIf you have not heard of the ring, here it is. Take what you need and leave the rest. Every stash is locked, and its key waits in another building, with a note like this one. Readers find the keys. Looters never do. Go west, use the key, and leave the locker better than you found it.",
        },
        "school-dead1": {
          title: "This Week's Lunch Menu",
          text: "LINCOLN LIONS LUNCH MENU. All meals come with milk or juice and a piece of fruit. Please tell the office about any allergies.\n\nMonday: chicken noodle soup with crackers and a side salad.\n\nTuesday: tacos with rice and beans. Hot sauce is available if you ask nicely.\n\nWednesday: spaghetti with meat sauce and garlic bread. Napkins are at the end of the line.\n\nThursday: turkey sandwiches, carrot sticks, and an oatmeal cookie.\n\nFriday: PIZZA DAY! Cheese or pepperoni, two slices each. Thank you to the Parent Club for paying for it.\n\nComing soon: the spring book fair in the library. Bring your reading logs, and bring a little money for the poster sale!\n\nSomebody drew a smiling slice of pizza in the corner, with little stars around it. Under Friday, a student wrote in small, neat pencil: This was the week the Fall began. We never got the pizza.\n\nUnder that, in a different pencil: I would trade my whole backpack for that pizza now.\n\nAnd under that, in pen: Same. Extra cheese. Whoever is reading this, save me a slice.",
        },
        "school-dead2": {
          title: "Fire Drill Map",
          text: "FIRE DRILL PLAN. Post this map by the classroom door, where every student can see it.\n\nWhen the alarm rings, stop what you are doing. Leave your bags and your books behind. Line up quietly at the door. The teacher takes the class list and the red folder. Walk, do not run, down the long hallway and out the front doors. Turn left at the flagpole and follow the fence.\n\nIf the alarm rings, everyone meets on the sports field, behind the bleachers. Stand in your class line until the teacher calls your name. Nobody leaves the field until the principal says it is safe. Then we walk back inside together, quietly.\n\nSomeone has drawn a shaky arrow on the map in marker, pointing to the field. Under it, a kid wrote: That is where Ms. Adler would take us. Look there first!\n\nUnder that, in pen, a different hand: Checked the field twice. Long grass and nobody in it. The class did not go to the field. Ms. Adler's note by the front door says where they really went.",
        },
        "school-dead3": {
          title: "We Found Her Note!",
          text: "IT'S MAX AND MIA AGAIN! We came back to the school, and we found Ms. Adler's note by the front door. She is okay. Everyone is okay! Mia cried. Max says he did not cry, but he did, a little.\n\nWe looked everywhere for the class. We went as far west as the Water Tower, which took two whole days of walking. A man named Theo lives there and runs the pumps. He gave us water, as much as we wanted, and he did not ask for anything back. He told us to filter everything and to walk, not run. We left him something to say thank you. It was important, but Mia says it is a secret.\n\nNow we know where to go. The class is at the library, north of here. It is getting dark, so we are sleeping in the music room tonight with the door shut. We will go north to the library at first light. Do not worry, we will stay together the whole way.\n\nIf you see Ms. Adler before we do, tell her we are coming!",
        },
      },
      signs: {
        "school-sign1": { title: "Classroom Poster", text: "OUR CLASS RULES: Raise your hand. Be kind. Read every day. Someone has added a fourth rule at the bottom, in thick blue marker: Stay together." },
        "school-sign2": { title: "Red R in the Hall", text: "Ruby's red R, sprayed quick and crooked, with a 6 under it. Six walkers in here. Smaller, underneath: ONE IN THE HALLWAY. WAIT FOR IT TO TURN." },
        "school-sign3": { title: "Neat Chalk Letters", text: "In neat, teacher-straight chalk letters: Ms. Adler's class, gone north. Under it, a little smaller: Read the note by the front door. Every one of us is counted." },
        "school-sign4": { title: "LIBRARY CLOSET", text: "LIBRARY CLOSET. Please return all books on time. Thank you, readers! Someone has added below it, in red pen: Late fees canceled. End of the world discount." },
      },
      key: { name: "Short steel key, gray tag", tag: "Evidence. Do not remove. The words \"do not\" are crossed out with two hard lines of pen. Now it just says remove. The key is short, plain steel, and the gray tag is soft from handling." },
    },

    /* ---------- Station 12 ---------- */
    firehouse: {
      blurb: "Station 12, the fire station, with tools, water tanks, and a locked equipment bay.",
      door: {
        title: "Chief Dunn's Bay Door",
        text: "Chief Dunn, Station 12. I keep lists, so here is the list for this building.\n\nOne: a tool kit is in the office behind the watch desk. Two: a water tank is in the truck bay, on the right wall, past the gear racks.\n\nThree: at least six walkers are inside, and two of them are in the truck bay. They stand between you and that tank. Deal with them before you start lifting anything heavy. The rest wander the front room and the offices.\n\nFour: the equipment bay is locked, and the lock is a good one. My note is on the watch desk, by the spotted dog. It tells you exactly which key to use. Read it, then get to work.",
      },
      notes: {
        "firehouse-desk": {
          title: "The Red Key",
          text: "Chief Dunn again. This is the watch desk, where somebody sat day and night for thirty years. Tonight that somebody is you.\n\nLook at the key board on the wall by this desk. There are a dozen hooks, and most of them hold truck keys. Ignore those, because those trucks will never roll again. Take the red key, the only red one on the board. It opens the equipment bay lock. You can open the equipment bay now.\n\nGo into the truck bay and walk all the way to the back. The equipment bay door is there, beside the fire truck, on the gear racks side. Look for the EQUIPMENT sign.\n\nInside the bay are a water tank, a stack of lumber, and a full set of tools. Load the tank first. It is the heaviest thing in there and the hardest to find anywhere else. Hang the red key back on its hook when you leave. Habits matter.\n\nIf you need water filters, drive to the Water Tower on the west side. The filters are in its pump house. Theo looks after the pumps there. He kept the water running when the rest of us quit. He never asked for thanks, so thank him anyway.",
        },
        "firehouse-trail1": {
          title: "Convoy List: Vehicles",
          text: "RIVER CONVOY: VEHICLES. Chief Dunn keeps this list. Do not move it, and do not doodle on it.\n\nThe River Convoy will leave north along the river, whenever it leaves. Here is what goes with it.\n\nTwo fire trucks, Engine 12 and the old ladder truck. Both run now. Mr. Ortiz fixed both trucks before he went west. He replaced a fuel pump, two belts, and most of my patience. Then he shook my hand and said they would outlive us both.\n\nSergeant Vega's van, the gray one with the cage in the back. Vega drives it, and nobody else touches the radio.\n\nCarla's boats, flat and wide, built at her lumber yard. They carry people and bags, while the trucks haul the heavy load.\n\nThe leaving day has moved three times now. First it was the bridge, then the fuel, then the rain. The river is still too high to launch the boats safely. So we wait, and we check the water every morning.\n\nMy second note is in the bunk room, near the brass pole. Look for the BUNKS sign.",
        },
        "firehouse-trail2": {
          title: "Priya's Key, Our Thanks",
          text: "Chief Dunn. You found the second note, which means you read the first one all the way through. Good habit.\n\nA key lies on the truck bay floor, beside the fire truck. It is a small silver key on a yellow tag shaped like a lightning bolt. You will spot the yellow first.\n\nThat key opens the repair locker at Signal Electronics, downtown, east of here. Priya runs that store. She left this key with me after she fixed the station's radios for the convoy. She would not take payment, so she took a promise instead. Keys in the ring never stay home, she said.\n\nHere is how the ring works, if nobody has told you. Take what you need, and leave the rest. Every stash is locked, and its key is hidden in a different building. A note like this one says where. People who smash and grab never find the keys. People who read do.\n\nSo drive east, open the repair locker, and fix what you can. Then tell Priya the chief says thanks.",
        },
        "firehouse-dead1": {
          title: "Chief Dunn's Famous Chili",
          text: "STATION 12 CHILI. Feeds one hungry crew after a long night. Recipe by Chief Dunn, perfected over twenty winters.\n\nIngredients: Beans. More beans. Whatever is in the can, as long as the can is not bulging. An onion if you can find one. Salt if anyone still has salt. A spoonful of hot sauce for courage.\n\nDirections: Dump everything in the big pot. Stir it with the long spoon from the drawer by the sink. Then cook it slow, on low heat, for as long as you can stand to wait. Cook it slow. I mean it. Fast chili is just hot beans with a bad attitude. Stir every ten minutes, and scrape the bottom so nothing burns. If it sticks, add water, not hot sauce. Hot sauce is not a fix for anything.\n\nServe it in mugs if the bowls are gone. Leftovers taste better the next day, if there are ever leftovers.\n\nUnderlined three times at the bottom: Never let Vega cook. Vega once burned a pot of water in this kitchen. I have witnesses. The smoke alarm still flinches when Vega walks by.",
        },
        "firehouse-dead2": {
          title: "Convoy Leaves Friday",
          text: "NOTICE TO ALL SURVIVORS.\n\nThe River Convoy is ready. Meet at the north bridge at dawn on Friday. The convoy leaves at first light, with or without you, so do not be late.\n\nBring one bag per person, packed tight. Bring water for three days and food that does not need cooking. Wear boots you can walk in for a long time. Children ride in the trucks. Adults who can row will ride in the boats. If you have tools, bring them, because we will need to build where we land.\n\nTell your neighbors. Tell the people at the mall and the library. Tell Jo, so she can say it on the radio every night until Friday. Nobody who wants to come gets left behind. If you cannot walk to the bridge, send word, and a truck will come for you.\n\nSigned, Sergeant Vega.\n\nAcross the top corner, in Chief Dunn's blocky pencil: FIRST NOTICE. OUT OF DATE. The leaving day has been moved since then, more than once. Check my newest list before you walk anywhere at dawn. The bridge is cold and empty that early.",
        },
        "firehouse-dead3": {
          title: "Convoy List: People",
          text: "RIVER CONVOY: PEOPLE. Page two. Chief Dunn keeps this list honest, so write clearly.\n\nLuis, mall security. His name is crossed out with one firm line. Next to it, Dunn wrote: He will not leave the mall. Says somebody has to watch it. Asked twice. Will ask again.\n\nDoc Lin wants one seat, only as far as St. Anne. She says Nurse Ada is waiting up there. Lin means to walk the last part herself if she has to. Seat saved in truck one.\n\nMs. Adler and her whole class. Every student is on the list by name, in Ms. Adler's neat handwriting. They will need a truck to themselves and a lot of snacks.\n\nMrs. Greer, with a question mark. She says she will come if the books can come too. Dunn wrote under that: How many books? Mrs. Greer wrote back: All of them.\n\nAt the bottom, in big letters: ROOM FOR MORE. WRITE YOUR NAME. Three blank lines wait under it, ready for anyone brave enough to sign. A pencil hangs beside the page on a string, so nobody has an excuse.",
        },
      },
      signs: {
        "firehouse-sign1": { title: "TRUCK BAY", text: "TRUCK BAY. KEEP CLEAR AT ALL TIMES. Do not park here, and do not block the doors. Trucks may leave without warning. Emergency vehicles only, by order of the Fire Chief." },
        "firehouse-sign2": { title: "Safety Board", text: "STATION 12 SAFETY BOARD. This station has gone ___ days without an accident. The number has been wiped off with a sleeve. Across the blank, in marker: We stopped counting." },
        "firehouse-sign3": { title: "Ruby's Red R", text: "A red R by the front door, sprayed in one quick loop, with a 6 under it. Ruby counted six walkers here. Under that, smaller: TWO IN THE TRUCK BAY. CHECK BEHIND THE TANK." },
        "firehouse-sign4": { title: "Chalk by the Bay", text: "Chalked on the wall beside the equipment bay door, in tall, quick letters: RED KEY. ON THE BOARD. An arrow points back toward the watch desk." },
      },
      key: { name: "Silver key, lightning bolt tag", tag: "Repair locker. Fix it, don't toss it. The words are written in tiny black letters on a yellow plastic tag cut like a lightning bolt. The key itself is small and silver, bright as a new coin." },
    },

    /* ---------- St. Anne Annex ---------- */
    hospital: {
      blurb: "St. Anne Annex, the hospital in the north hills, with medicine, a generator, and the worst walkers in town.",
      door: {
        title: "Doc Lin on the Ambulance",
        text: "Doc Lin, in grease pencil on the ambulance doors. I come up here when I can, and I never get to stay long enough. Medical kits are in the rooms along the top hall, and more are in the bottom left room. The generator is in the bottom right room, near the entrance.\n\nAt least six walkers are inside. They stand in the dark rooms, still as coats on hooks, until something wakes them. Look into every room before you step through the door. The pharmacy stock room is locked. The nurse's note is in the top hall, at the nurses' station. Read it before you go hunting for that door.",
      },
      notes: {
        "hospital-hall": {
          title: "Nurse Ada Stayed",
          text: "This is Nurse Ada. I worked at St. Anne for twelve years, and I stayed when the others left. Someone had to keep the lights on and the records safe. That someone turned out to be me.\n\nThe pharmacy stock room needs a staff badge. My spare badge is in the drawer under this station, the shallow one on the left. It is clipped to a blue lanyard. Hold the badge flat against the gray reader by the stock room door until the light turns green. The stock room can be opened now. Its door is off the main hall, on the front side, a little right of center. Inside are three medical kits, sealed and in date. I checked them myself, twice, the way I check everything.\n\nStay quiet in here, above everything else. The walkers in this building follow sound more than light. A flashlight will not turn their heads, but a dropped can will turn every head on the floor. Walk softly. Close doors gently. Do not call out, even to a friend. If you must speak, whisper, and keep it short.",
        },
        "hospital-trail1": {
          title: "Listening to 88.1",
          text: "Nurse Ada, night log. I write this at the right end of the main hall, where the radio gets the best signal.\n\nPeople ask why I stayed. The answer is simple. The generator has to keep running, for the records and for the cold medicine. If the power fails for one long day, the medicine in the cold room spoils. Months of careful work would be gone by morning. So I stay, and I keep the generator fed.\n\nEvery night I sit right here and listen to Jo on 88.1. Jo reads the news, the warnings, and the messages people send in. I listen for one name. I am waiting for word from Doc Lin. We worked the same night shift for six years. She promised she would come back up the hill.\n\nLast night Jo said Lin will come up with the River Convoy, on the trucks heading north. But the convoy is late again. It is always late again.\n\nMy next note is in the top right room, in its back right corner. You will want to read it.",
        },
        "hospital-trail2": {
          title: "The Key That Closes the Ring",
          text: "Nurse Ada again. Thank you for reading this far. Most people never do.\n\nThere is a key in this building, and it is not mine to keep. It lies in the second room from the left along the top hall, in its back right corner. It is a heavy old iron key with a square head. It looks like it belongs in a museum. You will feel the weight of it in your pocket.\n\nIt opens the old safe room at Gas-N-Go, south of here, near the south end of town. Ruby brought it up here on her first scouting run north. She is the scout who paints the red R on the walls. She said the ring had to close into a circle. So the last key had to lead back to the first door.\n\nThe ring is a simple rule. Take what you need and leave the rest. Every stash is locked, and every key hides in another building, with a note that says where. Only readers find them.\n\nTake the iron key south. Someday, come back and tell me what was in that safe room.",
        },
        "hospital-dead1": {
          title: "Visitor Sign-In Sheet",
          text: "ST. ANNE ANNEX VISITOR SIGN-IN. All visitors must sign in at the front desk and wear a badge at all times. Please wash your hands before entering any patient room.\n\nR. Patel, nine in the morning to half past ten, room four. Brought flowers.\n\nT. Brooks, eleven to noon, room seven. Dropped off a phone charger.\n\nThe Okonjo family, one to three in the afternoon, room two. Birthday cake, with permission from the nurse.\n\nJ. Ramirez, half past two to three, room four. Second visit this week.\n\nDoc Lin, late evening, staff floor. She signed the visitor sheet anyway, as a joke for the night nurses.\n\nDoc Lin is the last name on the sheet. Nobody has signed in since, and nobody has signed out. Her signature is quick and tilted, the way doctors write. Next to her name, in the time-out box, she wrote two words: back tomorrow.\n\nThe rest of the page is empty, line after line, all the way to the bottom. The pen is still tied to the clipboard with a piece of string, waiting for the next visitor.",
        },
        "hospital-dead2": {
          title: "Patient Bus Notice",
          text: "ATTENTION PATIENTS AND FAMILIES.\n\nBecause of the current emergency, St. Anne Annex is moving patients to a safe hospital outside of town. A bus takes patients out of town from the front door every morning. Boarding begins at seven o'clock sharp. The bus leaves at half past seven, whether it is full or not.\n\nEach patient may bring one small bag. Please bring your medicine in its original bottle, with your name on the label. A nurse will ride with every group. Family members may ride if seats are left. Wheelchairs will be loaded first.\n\nDo not wait in the parking lot. Wait inside the front doors, where staff can see you. Thank you for your patience and your calm. Together we will get through this.\n\nThe paper has gone yellow, and its corners curl. It is dated the first week of the Fall. Someone has drawn a line through the bus times. Next to them, in pencil: No bus has come since then. Do not wait by the door. Walk out on your own feet, and keep going. Nobody is coming to drive you.",
        },
        "hospital-dead3": {
          title: "Nurse Ada's Generator Log",
          text: "GENERATOR LOG, ST. ANNE. Kept by Nurse Ada. Check the fuel at dawn and dusk. Record the hours.\n\nDay 41. Fuel at half. Still running.\n\nDay 42. Still running.\n\nDay 43. Topped up from the ambulance tank. Still running.\n\nDay 44. Rain all day. Still running.\n\nDay 45. Still running.\n\nMost days I only need the two words. Still running. They are the best two words I know.\n\nDay 46. Jo says Lin is close. Jo said it on 88.1 at dusk, plain as anything: Doc Lin is close, and she is coming. I wrote it down so I would still believe it in the morning.\n\nDay 46, later. I ran the generator one hour longer tonight. I wanted the front lights on. Anyone walking up the hill could see the building from the road. It cost fuel I should have saved. I do not regret it, not one drop.\n\nDay 47. Still running. No sign of her yet. Lights off at the usual hour.\n\nDay 48. Still running. Still waiting. Both are fine. Fuel is low, so I will ask Jo to pass that on.",
        },
      },
      signs: {
        "hospital-sign1": { title: "QUIET ZONE", text: "QUIET ZONE. PATIENTS RESTING. Please lower your voice. Under it, in Nurse Ada's tidy writing: They follow sound, not light. Whisper, or do not speak at all." },
        "hospital-sign2": { title: "Ruby's Count", text: "Ruby's red R, with a 6 sprayed under it. Six walkers. Below, in smaller letters: THEY STAND IN THE DARK ROOMS. LOOK BEFORE YOU STEP IN." },
        "hospital-sign3": { title: "Hospital Floor Map", text: "YOU ARE HERE, says a red dot by the front doors. The wards run along the top hall, one room after another. In the top left room, a small box is labeled SUPPLY CUPBOARD." },
        "hospital-sign4": { title: "Chalk by the Stock Room", text: "Chalked beside the stock room door, in Nurse Ada's small, even letters: Lin, it is all still here. The chalk has been traced over more than once to keep it fresh." },
      },
      key: { name: "Heavy iron key, square head", tag: "Old safe room. Ruby was here. The words are scratched into a scrap of leather tied to the bow. The key is heavy old iron with a square head, and it fills your whole palm." },
    },

    /* ---------- Water Tower ---------- */
    watertower: {
      blurb: "The Water Tower on the west side, a pump building with water filters and a locked pump house.",
      door: {
        title: "Theo's Note on the Gate",
        text: "This is Theo. I tend the pumps here, and I have for twenty years, since long before the Fall. Read this before you open the gate. Water filters are on the floor by the crates, not on any shelf. Look low, and look carefully.\n\nAt least four walkers are inside the pump building. They drift between the crates and the walls, and the hum of the pumps hides their steps. Count them as you go, and do not trust the quiet corners. The pump house is locked. My note is on the control panel inside, toward the back on the right. It tells you how to get in. Close the gate behind you, please.",
      },
      notes: {
        "watertower-panel": {
          title: "Theo's Breaker Box",
          text: "Theo again. You made it to the panel, so you have dealt with the worst of them. Sit for a minute if you need to. Breathe.\n\nThe pump house key is in the breaker box. That is the gray metal box on the wall by the pump house door. It has a yellow danger sign. Do not let the sign scare you, because the power to it is off. Open the lid, and the key hangs on a nail inside. With it, you can open the pump house now. The pump house door is up front, just right of the entrance. Inside are filters, a water tank, and a spool of wire. Take what you need, and leave a filter if you can spare one.\n\nOne more thing, in case you run short of medicine. St. Anne Annex, the hospital, is north along the river road. It still has medicine on its shelves, and a nurse who stayed. But it is the most dangerous place in town, worse than anywhere I have walked. Go in daylight, go rested, and keep your way out in mind.",
        },
        "watertower-trail1": {
          title: "Ruby, I Made It",
          text: "Ruby, it's Dev. I am safe. Read that twice, because I know you. I am safe, I am eating, and I sleep with a roof over my head.\n\nMr. Ortiz and I made it here from the auto shop. Theo lets us sleep up in the tower, high above the walkers. You can see the whole west side from up there. At night it is so quiet you can hear the river. We help Theo keep the pumps running. Mr. Ortiz fixes the motors, and I carry everything heavy, which is everything.\n\nIf I am out on a run when you come, wait here. Please. Do not go looking for me. Theo will give you water and a corner to sleep in. I always come back, the same way you always did. I heard Jo say your name on the radio, so I know you are looking.\n\nTheo left a note for travelers at the back, between the crates. Read it. He explains the key ring better than I can. Then sit down, drink some water, and wait for me.\n\nYour annoying little brother,\n\nDev",
        },
        "watertower-trail2": {
          title: "For Travelers Who Read",
          text: "For travelers, from Theo.\n\nIf you are reading this, you are the kind of person the ring was built for. So here is a key.\n\nIt lies in the front left corner, on the floor, not far from the door you came in. It is a small brass key on a purple school lanyard. That key opens the principal's closet at Lincoln Middle School, far east of here across town. It is a long drive, so plan your fuel.\n\nTwo kids brought it here, twins named Max and Mia. They came looking for their teacher and her class. They were tired, thirsty, and braver than most adults I know. Mia had kept the key in her pocket since the day the Fall began. She left it with me for the ring.\n\nThe ring is simple. Take what you need, leave the rest. Every stash is locked. Its key is hidden in a different building, with a note that says where. Smash-and-grab people never find them. Readers do. Be a reader, and when you open that closet, think of two brave kids.",
        },
        "watertower-dead1": {
          title: "Theo's Water Rules",
          text: "WATER RULES, by Theo. Read them before you fill anything.\n\nOne. One jug per person each day. A jug is the white plastic kind with the blue cap, stacked by the gate. Fill it at the tap marked CLEAN, never at the river hose.\n\nTwo. Kids get two jugs. They are growing, and they run around more than the rest of us. Do not argue with me about this. I will not change my mind.\n\nThree. Bring the jug back empty. Jugs are harder to find than water. A cracked jug is still a jug, so bring that back too.\n\nFour. Filter anything that did not come out of the clean tap. Boil it too, if you have the fuel.\n\nFive. Nobody leaves thirsty. Not strangers, not people I do not like, not people who were rude at the gate. If you came here dry, you leave here with water. That is the most important rule on this card.\n\nAt the bottom, smaller: Questions? Find me at the pumps. Complaints? Find me later. Much later, after the pumps are fed and I have had my coffee.",
        },
        "watertower-dead2": {
          title: "Good News on a Plate",
          text: "GOOD NEWS, EVERYONE!\n\nThe river water is clean now and safe to drink. I tested it myself, three days in a row, and I never got sick. The current carries everything bad downstream, so the water up here is fresh. No need to waste filters anymore. Save them for trading. Just dip your bottle in at the bend below the tower, where the water runs fast. It tastes a little like metal, but that is only the rocks. Tell everybody. We do not have to line up at the pumps every morning like sheep.\n\nThat is all written in blue pen on a paper plate, with no name signed anywhere. The plate is stuck to the wall with chewing gum.\n\nAcross the whole thing, in thick black marker, Theo crossed it out with a big X. Then he wrote, in letters you could read from the door: IT IS NOT CLEAN. FILTER EVERYTHING. Under that, smaller: Two people got sick last week from that bend. Whoever wrote this, come and talk to me. I am not angry. I just want nobody else drinking from that river. Theo",
        },
        "watertower-dead3": {
          title: "Mr. Ortiz on the Motor",
          text: "Work notes, Mr. Ortiz. Pump motor number two, the old one by the pump house door.\n\nI am teaching Dev to rebuild the old pump motor, one piece at a time. We took it apart on a tarp, and he labeled every bolt with tape and a marker. Nobody taught him that. He just did it. The bearings are good. The windings are better than I hoped. The housing has a crack, but a crack can be welded.\n\nWe still need a belt and a gasket. The belt has to be the wide kind, from a truck or a big mower. The gasket can be cut from rubber, if we find a sheet thick enough. If you see either one, bring it to Theo. He will trade fair water for it.\n\nDev asked me today why I never get angry at engines. I told him engines only do what you ask. People are harder.\n\nThe boy has good hands, like Tomas's father. I taught that man too, back at the shop. I hope his son is keeping some old van alive.",
        },
      },
      signs: {
        "watertower-sign1": { title: "City Water Works", text: "CITY WATER WORKS. STAFF ONLY. Below it, on a yellow metal plate: DANGER. PUMPS START WITHOUT WARNING. Keep hands and loose clothing clear of all moving parts." },
        "watertower-sign2": { title: "Big Chalk Letters", text: "In big chalk letters, as tall as a kid: Ruby, I am here. It is signed with a single D, underlined twice. Someone traces over it whenever the rain fades it." },
        "watertower-sign3": { title: "Chalk Circle and Arrow", text: "A chalk circle with a small key drawn inside it. An arrow points to the tool crib in the back left corner. Under it: The key is not here. Read the notes." },
        "watertower-sign4": { title: "PUMP HOUSE", text: "PUMP HOUSE. KEEP LOCKED AT ALL TIMES. Next to it hangs a smaller sign with a yellow lightning bolt: BREAKER BOX. DANGER. Authorized staff only. Do not open with wet hands." },
      },
      key: { name: "Brass key, purple school lanyard", tag: "Principal's closet. Go Lions. The words are printed in faded gold on a purple school lanyard. The key itself is small and brass, worn smooth at the edges from riding in a pocket." },
    },

    /* ---------- Ridge Lumber ---------- */
    lumberyard: {
      blurb: "Ridge Lumber on the east ridge, stacked with wood, crowded at the loading dock, with a locked kiln shed.",
      door: {
        title: "Ruby's Spray Paint",
        text: "Ruby. Painted fast, so read fast. Lumber is stacked in the racks, in the middle of the yard and along the back. Plenty for everyone, so take only what your van can hold.\n\nAt least five walkers are inside. They gather by the loading dock and mostly stay there, swaying like they are waiting for a delivery. Do not give them a reason to move. No shouting, no dropped boards, no engines left running at the gate. The kiln shed is locked. The yard boss, Carla, left a note on the paint rack inside. Read it before you touch that shed. If you see a kid named Dev, tell him his sister came through here.",
      },
      notes: {
        "lumberyard-rack": {
          title: "Carla's Clipboard",
          text: "Carla here, THE YARD BOSS! If my handwriting is big, it is because everything about me is big. Ask anyone.\n\nThe kiln shed has a combination padlock, the kind with four little wheels. The code is 2218. Roll the wheels to 2, 2, 1, 8, then give the lock a firm tug. It drops open. You can open the kiln shed now. The shed is at the front, on the right, past the end of the racks. Inside is dry lumber, the good stuff, cured before the power died. Dry wood is light and straight and worth every trip. There is also a whole box of nails, so grab it.\n\nNow the serious part, so listen close. Do NOT run the saws. Not to cut one board, not for one second, not even to see if they work. They do work. The noise brings the whole dock crowd, every last one, and they come faster than you would believe. I have seen it happen, and I do not want to see it again. Carry your boards out by hand, quietly, and come back tomorrow for more. The yard will still be here.",
        },
        "lumberyard-trail1": {
          title: "Boats for the Convoy",
          text: "Carla again! You have probably noticed the yard looks emptier than a lumber yard should. That is because my crew is building boats. Flat boats, wide and steady, for the River Convoy. We are using the yard's best planks, the long cedar ones I saved for a rich man's deck. That deck never got built. Good. Those planks float better than they would have sat.\n\nSergeant Vega comes by every week to check the boats. Vega knocks on every hull, studies every seam, and asks the same question. Are they ready? I always say almost. Vega always sighs. It is a routine by now, like clockwork.\n\nThe truth is, the boats are fine. The river is the problem. It is still too high to launch them. The current would flip a flat boat like a pancake. I am not losing my crew to hurry. So we wait, we sand, and we watch the water drop an inch a day.\n\nMy other note is at the back wall, in the middle. Go read it. There is something in it for you.",
        },
        "lumberyard-trail2": {
          title: "Mrs. Greer Paid in Keys",
          text: "Carla, back wall. Glad you came.\n\nThere is a key in this yard that is not mine. It lies in the front left corner, on the floor between the counter and the crates. It is a long, old-fashioned key with a round loop for a handle. A paper bookmark is tied to the loop with string, so you cannot miss it.\n\nThat key opens the rare book room at the Public Library, north and west of here. Here is how it ended up in a lumber yard. Mrs. Greer, the librarian, needed planks to board up the library windows. Money is worth nothing now, so she paid me with this key. I told her I did not need a key. Then she told me about the ring, and I changed my mind.\n\nThe ring goes like this. Take what you need, leave the rest. Every stash is locked, and its key is hidden in another building, with a note to say where. Grabbers never find them. Readers always do.\n\nSo the key lives here now, in the ring. Take it north and west. Mrs. Greer will be glad.",
        },
        "lumberyard-dead1": {
          title: "Ridge Lumber Yard Rules",
          text: "RIDGE LUMBER YARD RULES. Posted by Carla, yard boss. Read them. Follow them. No exceptions, not even for family.\n\nRule one. Wear boots. Real boots, with thick soles. Sneakers are not boots. The nails in this yard do not care how cool your shoes look.\n\nRule two. Lift with your legs, not your back. Bend your knees, keep the board close, and stand up slow. I have seen strong people hurt themselves with one bad lift.\n\nRule three. Never run the saws. This rule was here before the Fall, because saws do not forgive mistakes. Now it matters twice as much, for reasons everyone knows.\n\nRule four. Stack it the way you found it. Long boards on the bottom, short ones on top.\n\nRule five. Leave the yard cleaner than you found it. Sweep up the sawdust, and put the gloves back on the hook.\n\nAdded at the bottom, in a different pen, pressed deep: NEW RULE. If you hear the dock crowd, freeze. Do not run, and do not drop what you are holding. Just freeze and wait until they settle. Then walk.",
        },
        "lumberyard-dead2": {
          title: "Hurried Receipt Note",
          text: "RIDGE LUMBER, receipt number 0447. Twelve boards, one box of deck screws, paid in cash. Thank you for your business!\n\nOn the back, in a messy scrawl:\n\nKiln shed code is 2281. Got it from one of Carla's crew, the tall one with the beard. Go at night, when the yard is dark and the crew is down at the boats. The shed is full of dry wood, enough to build a cabin. Roll the wheels, and the lock pops right off. Bring a cart and two friends. Do not let Carla catch you, because she yells louder than a walker crowd. Seriously, she is terrifying when she is mad.\n\nUnder that, in huge handwriting, pressed so hard the pen went through:\n\nNICE TRY. That code is wrong. Two numbers are swapped, because my crew is smarter than you think. The right code is on my clipboard by the racks, for anyone who reads instead of sneaks. And you are welcome to the wood anyway. Just ask at the gate like a person. I say yes more often than you would guess.\n\nCarla",
        },
        "lumberyard-dead3": {
          title: "Sketch of a Flat Boat",
          text: "FLAT BOAT, RIVER CONVOY MODEL. Drawn by Carla on the back of a lumber order, with arrows pointing to every part.\n\nBottom: a double layer of cedar planks, sealed with tar. Flat, so it will not tip in shallow water.\n\nSides: knee high. High enough to keep the river out, low enough to climb over.\n\nBenches: five across, with two people on each bench.\n\nLoad: each boat holds ten people and their bags. No more. I do not care who asks.\n\nPoles: two per boat, long ones, for pushing off rocks.\n\nRope: twenty feet at each end, so the boats can tie together at night.\n\nPaint: none. Paint is heavy, and walkers do not care about color.\n\nIn a box at the bottom of the page, Carla keeps count. The convoy needs four boats. Two are done. Two to go, and they will be the best two, because now we know what we are doing.\n\nNext to the box is a tiny boat with a smiling face. Under it, someone wrote: Vega says hurry. Carla wrote back: Vega can hold a hammer.",
        },
      },
      signs: {
        "lumberyard-sign1": { title: "Painted Yard Sign", text: "Ridge Lumber, cut to order. Decks, fences, sheds, and barns, built to last. Ask at the counter for a free quote. Family owned for three generations." },
        "lumberyard-sign2": { title: "Ruby's Mark", text: "Ruby's red R, big and dripping, with a 5 under it. Five walkers in here. Under it: THEY GATHER AT THE DOCK. STAY AWAY. I MEAN IT." },
        "lumberyard-sign3": { title: "Saw Safety Sign", text: "CAUTION: EAR PROTECTION NEEDED NEAR THE SAWS. Carla has added in thick marker, right across the bottom: The saws stay off. Forever. Ask me why, and I will tell you loudly." },
        "lumberyard-sign4": { title: "Kiln Shed Door", text: "Spray-painted across the kiln shed door, in big orange letters: CODE ON THE CLIPBOARD. An arrow points back toward the racks on the left. Do not guess." },
      },
      key: { name: "Long key with a bookmark", tag: "Rare books. Handle with care. The words are inked on a paper bookmark tied to the key. The key is long and old-fashioned, with a round loop for a handle and tiny teeth." },
    },

    /* ---------- Northgate Mall ---------- */
    mall: {
      blurb: "Northgate Mall in the north, full of supplies and home to the biggest walker crowd in town.",
      door: {
        title: "Jo's Warning on the Doors",
        text: "Jo here, from 88.1. Some things do not fit in a broadcast, so I am writing them here. Food, medicine, and wire are spread across the store floor. Nothing is in one place, so you will cover a lot of ground. Pack light, and leave your hands free.\n\nAt least six walkers are inside, and they move in a group. Where one goes, the rest follow, like a slow tide. Never get caught between them and the doors. The security office is locked. The guard's note is by the paint display, among the shelves on the left. Read it before you try the office. Luis knows this crowd better than anybody alive.",
      },
      notes: {
        "mall-guard": {
          title: "Luis Left the Code",
          text: "My name is Luis. I am a security guard at Northgate Mall, and I still wear the uniform. Somebody has to look official around here.\n\nThe security office has a keypad beside the door. The code is 0912. Press the numbers firmly, one at a time, and wait for the green light. The lock lets go with a click. You can open the security office now. The door is at the front, on the right. Inside are gun parts, radio parts, and a tool kit. I locked them up on the last normal day, before the crowd came through the glass.\n\nNow the important part. I have watched these walkers for months from behind the counter. I keep a notebook and a lot of patience. They come running at anyone who runs. A fast shape sets them off every time, like dogs after a ball. But if you walk, most of them stay put. They turn their heads, they sway, and then they forget you. It feels wrong every single time. Your legs will beg you to run. Do not listen to your legs. Walk.",
        },
        "mall-trail1": {
          title: "Still at My Post",
          text: "Luis, security. Day one hundred and something. I stopped counting exactly.\n\nI have stayed at my post since the Fall began. People ask why. The answer is that this mall was my job, and nobody ever told me to stop. So I did not.\n\nHere is what I know. The crowd here walks the same slow loop every single day. They start by the food court in the morning and drift past the shoe stores by noon. By dusk they bunch up near the fountain, like they are waiting for a bus. Learn the loop, and you can work around it, the way you would work around traffic.\n\nSergeant Vega came by last month and asked me to join the River Convoy. Good offer. Trucks, boats, a fresh start upriver. I said no. Someone has to watch the mall. Someone has to keep the doors held and leave notes for people like you. Vega shook my hand and did not argue, which I respected.\n\nMy other note is in the back left corner. Read that one too. It matters more than this one.",
        },
        "mall-trail2": {
          title: "A Key From Doc Lin",
          text: "Luis again. Back left corner, as promised.\n\nThere is a key here for you. It lies in the front left corner, on the floor between the counter and the crates. It is a small silver key on a white tag with a red cross. You will see the red cross even in bad light.\n\nThat key opens the supply cupboard at St. Anne Annex, far west of here in the north hills. It is a hard trip to a hard place, so be ready. Doc Lin left the key with me on one of her medicine runs. She said Nurse Ada wants the cupboard used, not saved. Medicine on a shelf helps nobody, Ada says.\n\nMaybe you know about the ring already. If not, here it is. Take what you need, leave the rest. Every stash is locked, and its key sits in a different building, with a note saying where. People who smash and grab never find the keys. People who read always do.\n\nSo take it west, open the supply cupboard, and use what is inside. Then tell Nurse Ada a mall guard says hello.",
        },
        "mall-dead1": {
          title: "Luis's Patrol Log",
          text: "PATROL LOG, NORTHGATE MALL. Officer: Luis. Shift: all of them.\n\nMonday. Crowd quiet, nobody running, doors held.\n\nTuesday. Crowd quiet, nobody running, doors held.\n\nWednesday. Crowd quiet, nobody running, doors held. Heard a dog bark somewhere outside. Could not find it.\n\nThursday. Rain on the skylights all day. The crowd stood still and listened to it. Doors held.\n\nFriday. Jo came by with batteries and stayed for coffee. She brought news from downtown and a joke I will not write down. First visitor in three weeks. We drank the coffee black, out of paper cups from the food court. Then we watched the crowd walk its loop. Jo says I should get out more. I told her I get out every day, all the way to the fountain.\n\nSaturday. Crowd quiet, nobody running, doors held.\n\nSunday. Crowd quiet, nobody running, doors held.\n\nMost days say the same thing. That is the point. Quiet is a good day. Quiet means the plan works. Boring means alive, and I will take boring every single time.\n\nNext week, same log. Same words, I hope.",
        },
        "mall-dead2": {
          title: "Pencil Note, No Name",
          text: "Security office code: 0921.\n\nI watched the guard punch it in from behind the shoe rack, so I know it is right. Zero, nine, two, one. He did it fast, but I have good eyes. The office is at the front on the right, with a gray keypad by the door. Inside there are gun parts and radio stuff, enough to set up a whole camp. Get in, grab it, and get out before the crowd comes around the loop. Do not worry about the guard. He talks a lot, but he will not stop you. He is usually up front, watching the doors.\n\nUnder it, in neat block letters, a different hand:\n\nThat code is wrong. The last two numbers are swapped, because you watched from too far away. Punch in 0921, and the keypad flashes red and beeps, and the whole crowd hears it. Do not do that. Luis's clipboard by the shelves has the right code. Read that one, and you will not need to spy on anybody.\n\nAlso, I do talk a lot. It keeps me company. L.",
        },
        "mall-dead3": {
          title: "A Letter From Sofia",
          text: "Dear Uncle Luis,\n\nJo said she would carry this to you. I am writing as fast as I can. I am safe. I am at the Public Library with Ms. Adler's class. They found me on the road and let me come with them. I am not even in their grade, but nobody minded.\n\nIt is not so bad here. The windows are high, and the walls are made of books stacked to the ceiling. Mrs. Greer makes everyone read every day. Even me, even on Saturdays. I finished three mysteries this week, and one was about a mall, which made me think of you. We eat beans and crackers, and we whisper all the time. At night Ms. Adler reads to us by the window. She does all the voices, even the scary ones.\n\nPlease come. You could be the library guard instead. Mrs. Greer says she would like that, and she does not say that about anybody.\n\nLove, Sofia\n\nOn the back, in Luis's handwriting, small and careful, he wrote two words: not yet. The paper has been folded and unfolded so many times it is soft.",
        },
      },
      signs: {
        "mall-sign1": { title: "Faded Banner", text: "A long banner hangs over the shelves: Northgate Mall. Something for everyone! The corners droop, and the smiling shoppers printed on it have faded to pale ghosts." },
        "mall-sign2": { title: "Huge Red Letters", text: "Ruby's red R, with a 6 under it. Six walkers, all together. Under it, in letters as tall as a door: DON'T RUN. The paint has dripped all the way to the floor." },
        "mall-sign3": { title: "Store Map", text: "A store map behind scratched plastic. YOU ARE HERE, by the front doors. Someone has circled one spot in marker: the jewelry vault, in the back right corner." },
        "mall-sign4": { title: "SECURITY, STAFF ONLY", text: "SECURITY. STAFF ONLY. NO ADMITTANCE. Under it, in black marker: Code by the paint display. Read the clipboard, not the scraps of paper lying around the store." },
      },
      key: { name: "Silver key, red cross tag", tag: "Supply cupboard. Ada says use it. The words are written on a white tag with a red cross in one corner. The key is small and silver, and it is tied on with clean white thread." },
    },

    /* ---------- Public Library ---------- */
    library: {
      blurb: "The Public Library north of downtown, with books, city maps, and a locked archive room.",
      door: {
        title: "Mrs. Greer's Book Drop",
        text: "Mrs. Greer, head librarian, writing on the book drop because people still notice it. Boxes of books are in the reading rooms on both sides of the building, packed and labeled. Please take the ones marked for trade first.\n\nAt least five walkers are inside. Two of them stand in the main hall, and you will meet them first. Be ready the moment you step in. Please do not knock over any shelves while you deal with them. The archive room is locked. My note is in the back left reading room, on the reference desk. Read it carefully, and the archive will open for you. Return what you can, when you can.",
      },
      notes: {
        "library-desk": {
          title: "The Key in the Dictionary",
          text: "Mrs. Greer again, from the reference desk. Welcome. I am sorry about the dust and the walkers; neither one meets library standards.\n\nThe archive key is inside the big dictionary on this desk. It is as heavy as a cinder block, so open it where it lies. Turn to the middle, around the letter M. You will find a hollow cut neatly into the pages. I cut it myself, and it nearly broke my heart. The key rests in that hollow. You can open the archive room now. Its door is off the main hall, near the right end, on the side nearest the entrance. Inside are books and a folder of city maps. The maps show every street, alley, and footbridge in town.\n\nReading saved this building, and I mean that plainly. When the Fall came, we stacked the books nobody wanted along the walls. Old encyclopedias, phone books, forty copies of one diet book. Now the walls are stacked two deep, and walkers cannot push through. Books are heavy. That turns out to matter a great deal. Take what you need, but please leave the walls standing.",
        },
        "library-trail1": {
          title: "The Class Lives Here Now",
          text: "A note from Mrs. Greer, for anyone wondering about the children.\n\nYes, there are children here. Ms. Adler's class lives here now. They came in a long, quiet line one gray morning, holding hands. Their teacher walked at the back, counting heads. I had cots in the storeroom and soup on the camp stove. That was enough to start.\n\nThey read by window light, since we have no power to spare. Every morning the students pull their chairs into the bright squares on the floor. They follow the sun across the room all day. They keep quiet, too. I have never had better patrons, and I have been a librarian for thirty-one years.\n\nMs. Adler still watches the front door for the twins, Max and Mia. She sits by the entry with a book open on her lap, but she rarely turns a page. Every time the door creaks, she looks up. If you see two thirteen-year-olds on the road, send them north to us.\n\nMy other note is in the back right reading room, in its back right corner.",
        },
        "library-trail2": {
          title: "A Velvet Pouch for the Ring",
          text: "Mrs. Greer, back right reading room. Thank you for reading on. You are exactly the kind of patron I hoped for.\n\nA key lies in the back left reading room, against the left wall near the back. It is a tiny gold key in a small velvet pouch, dark blue, with a drawstring. Do not mistake it for a lost earring. It opens the jewelry vault at Northgate Mall, east of here.\n\nLuis the guard sent it with Jo, on one of her trips with radio batteries. He asked me to keep it for the ring. I think he chose a library because he knew I would not lose it. I have not lost a book in thirty-one years, and I will not start with a key.\n\nYou may not know the ring. Take what you need and leave the rest. Every stash is locked, and its key is kept in another building, with a note that says where. The ones who smash and grab never find them. The ones who read always do. Rather like libraries, really.\n\nTake the key east. Walk through that mall; do not run.",
        },
        "library-dead1": {
          title: "Class Reading Chart",
          text: "MS. ADLER'S CLASS READING CHART. One gold star for every book you finish. Write the title on the back, so we can all see what you read.\n\nThe chart is a long sheet of poster paper. It is taped low on the wall, where every student can reach. Each student has a row. Most rows are crowded with stars, gold and silver. When the real stars ran out, the class drew more in yellow marker. One row has so many stars that they climb into the row above.\n\nTwo names near the bottom have no stars yet: Max and Mia. Their rows are clean and empty, white space from end to end.\n\nNext to their names, someone wrote in careful pencil: saving their stars. Under that, in a dozen different handwritings, the class added more. We will save them seats too. One star each, the day they walk in. Tell them to hurry up.\n\nAt the very bottom of the chart, Ms. Adler wrote: Every row gets filled. That is a promise. Next to it, a student added a small gold star, just in case.",
        },
        "library-dead2": {
          title: "Index Card in the Entry",
          text: "Archive room key: card catalog, drawer marked A.\n\nThat is all the front of the card says. It is typed on an old typewriter, the letters a little crooked. No name is signed. On the back, there is more, in a smaller hand:\n\nI worked here part time before the Fall. The staff always hid spare keys in the card catalog, because nobody uses it anymore. Look for the big wooden cabinet with the tiny drawers. Drawer A is in the top left corner. Pull it all the way out, and the key is taped underneath. Easy.\n\nBelow that, someone else has written in red pen:\n\nChecked. Pulled drawer A all the way out. Pulled drawers B through Z as well, while I was at it. The drawers hold only old cards, thousands of them, and one dusty moth. No key anywhere. Mrs. Greer's note on the reference desk says where the key really is. Read that one instead.\n\nA third note, in neat librarian's cursive: Please put the drawers back in order. Alphabetical order, if you please. M. G.",
        },
        "library-dead3": {
          title: "Rules of the Shelter",
          text: "PUBLIC LIBRARY SHELTER RULES. Posted by Mrs. Greer, head librarian. These are not suggestions.\n\nOne. Whisper. Sound carries in a building this size, and the walkers outside listen better than any patron ever did. If you must laugh, laugh into a pillow.\n\nTwo. Read. Every person reads every day, at least one chapter, no excuses. Adults too. Reading keeps the mind busy and the fear small.\n\nThree. Take turns at the window. The window seats have the best light and the best view of the street. Two hours each, then switch. Whoever sits at the window also watches the road.\n\nFour. Books nobody wants go on the walls. Before you add a book to the wall, ask me first. I will tell you if it is truly unwanted. Old phone books count. Poetry does not.\n\nFive. Never run in the library. Not ever. Not when you are late, not when you are scared, not when you hear something at the door. Running is loud, and loud is dangerous.\n\nBreak rule five, and you will shelve books for a week. I have a great many books.",
        },
      },
      signs: {
        "library-sign1": { title: "QUIET, PLEASE", text: "QUIET, PLEASE. Thank you for respecting other readers. Under it, someone has added in light pencil: It works on walkers too. Trust me on this one." },
        "library-sign2": { title: "A Very Small R", text: "Ruby's red R, painted very small, with a tiny 5 under it. Next to it, smaller still: sorry. It looks as if she felt bad writing on a library wall." },
        "library-sign3": { title: "Library Hours", text: "LIBRARY HOURS: DAWN UNTIL DARK. The old opening times are taped over. Below, in Mrs. Greer's firm hand: No candles near the books. No exceptions, not even for poetry." },
        "library-sign4": { title: "Chalk by the Archive", text: "Chalked beside the archive door, in small, tidy letters: Ask the dictionary. Under it, a tiny drawing of a thick book with a key inside it." },
      },
      key: { name: "Tiny gold key, velvet pouch", tag: "Jewelry vault. Not for jewelry. The words are stitched in thread on a slip of cloth inside the pouch. The key is tiny and gold, no longer than your little finger, and easy to lose." },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
