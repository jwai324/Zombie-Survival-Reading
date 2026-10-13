/* Reading level 2: places, part 2 (police, school, firehouse, hospital, watertower, lumberyard, mall, library). Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[2] = root.ZSR.TEXT[2] || { level: 2 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    police: {
      blurb: "The 4th Precinct police station, with gun parts, armor, and a locked armory.",
      door: {
        title: "Sergeant Vega's Notice Board",
        text: "Sergeant Vega, 4th Precinct. Read this before you go in. Gun parts are in the squad room. An armor plate is in the garage room. That room is on the right.\n\nAt least five walkers are inside. One big one waits in the garage room. Do not let it corner you.\n\nThe armory is locked. I left the combination on a note. It is at the front desk.",
      },
      notes: {
        "police-desk": {
          title: "The Armory Combination",
          text: "Sergeant Vega again. You made it to the desk. Good.\n\nThe armory combination is 19-4-33. Spin the dial slow. Go left, then right, then left again. The lock is old and stiff. Pull the handle hard after the last number. Now you can open the armory. Inside are gun parts and an armor plate. Take what you need. Leave the rest for the next person.\n\nOne more thing. The Public Library is north of downtown. It has books in its archive room. The librarian stayed when the others left. Her name is Mrs. Greer. She does not scare easy. Tell her Vega sent you.",
        },
        "police-trail1": {
          title: "The River Convoy Is Real",
          text: "Sergeant Vega. Read this all the way through.\n\nThe River Convoy is real. It is not a rumor. Trucks and boats will go north. We will take the river road. It leads away from the crowds.\n\nBut it keeps getting delayed. The river is still too high. The trucks still need parts. So we wait, and we fix things.\n\nDo you want to come? Then sign up with Chief Dunn. He is at Station 12, the fire station. He keeps the list. Every name counts.\n\nMy next note is in the squad room. Go through the door behind the desk. Look in the back left corner.",
        },
        "police-trail2": {
          title: "A Key for Carla's Lockbox",
          text: "Vega again. You found the squad room. Now look down.\n\nA key lies in this room. It is in the front left corner. It sits against the left wall. It is a padlock key. It hangs on a loop of orange rope. You cannot miss the rope.\n\nIt opens the foreman's lockbox at Ridge Lumber. That yard is east of here, on the ridge. Carla runs it. She is building boats for the convoy. She gave me this key so the ring stays whole.\n\nThe ring is simple. Every stash is locked. Its key hides in another building. A note says where. Only people who read find them. Take what you need, and leave the rest.",
        },
        "police-dead1": {
          title: "Lost and Found List",
          text: "LOST AND FOUND, front desk. Items turned in this month.\n\nOne bike. It was blue, with a bent wheel. Nobody came back for it.\n\nOne trumpet. It was in a black case. A kid left it on the bus bench.\n\nOne dog leash with no dog. It was red, and well chewed. The dog never turned up.\n\nThat was the whole list. Then the Fall came. The desk sergeant stopped writing.\n\nSomeone else added a line at the bottom. The pen is different. The letters are shaky and small.\n\nIt says: one town.\n\nNobody has come to claim that, either. Maybe nobody can.",
        },
        "police-dead2": {
          title: "Numbers on a Scrap",
          text: "A torn scrap of paper, folded twice. The writing is fast and messy.\n\nARMORY COMBINATION: 33-4-19. GOT IT FROM THE SARGE.\n\nThat looks like a lucky find. It is not. Under it, in neat blue ink, someone added more.\n\n\"These are the right numbers. They are in the wrong order. Spin 33-4-19, and the dial just clicks. The door stays shut. You will waste time at that dial. Walkers will hear you trying. Whoever wrote this read it backward.\n\nDo not trust a scrap with no name on it. Go back to the front desk. The note there has the one that works.\"",
        },
      },
      signs: {
        "police-sign1": { title: "Spray paint", text: "Ruby's big red R, with a 5 under it. Smaller, below it: ONE BIG ONE IN THE GARAGE. DON'T GET CORNERED." },
        "police-sign2": { title: "The Old Wanted Board", text: "The old WANTED board. It is covered in missing-person notes. One says: Ms. Adler's class, Lincoln Middle School. Have you seen them?" },
        "police-sign3": { title: "Printed Notice", text: "RIVER CONVOY SIGN-UP. Trucks and boats, going north. Sign up at Station 12, the fire station. Ask for Chief Dunn. Bring your family." },
        "police-sign4": { title: "Armory Door Sign", text: "ARMORY. POLICE ONLY. All staff must sign in. Under it, in black marker: Combination changed. See the front desk." },
      },
      key: { name: "Padlock key on orange rope", tag: "A padlock key on a loop of orange rope. The tag says: Foreman's lockbox. Knock first. Someone wrote it in thick pencil. The rope smells like sawdust." },
    },

    school: {
      blurb: "Lincoln Middle School, with boxes of books and a locked library closet.",
      door: {
        title: "Max and Mia Were Here",
        text: "It's Max and Mia! We came back to look for our class. Boxes of books are in the back right classroom. More are in the bottom left room.\n\nAt least four walkers are inside. One walks up and down the hallway. Be quiet in there.\n\nThe library closet is locked. The key is in the teacher's note. It is in the back left classroom. Good luck!",
      },
      notes: {
        "school-classroom": {
          title: "Ms. Adler's Top Drawer",
          text: "I am Ms. Adler. I taught in this room for nine years.\n\nIf you need the library closet, the key is here. Open the top drawer of my desk. It is under the attendance book. You can open the closet now. The closet door is off the hallway, on the right. Inside are boxes of books. There is a folder of city maps, too. Please keep the maps dry. Someone will need them.\n\nIf you are going north, think twice. Northgate Mall is up there. It has food, medicine, and wire. But the crowds there are the worst in town. Go only if you must. Go in daylight, and go quietly.",
        },
        "school-trail1": {
          title: "Max, Mia: Read This",
          text: "To Max and Mia. You came back. I knew you would.\n\nThe class has gone north to the Public Library. Mrs. Greer, the librarian, will take us in. Every student is safe and counted. Every one, except the two of you. I counted three times.\n\nI will come back to check whenever I can. Wait here if it is safe. If not, come north to the library. Stay together, like we practiced. Do not go anywhere alone.\n\nSergeant Vega came looking for the class. Vega left a note for you. It is in the back right classroom. Look in its back right corner.\n\nLove, Ms. Adler",
        },
        "school-trail2": {
          title: "Sergeant Vega Came Looking",
          text: "Sergeant Vega, 4th Precinct.\n\nMax and Mia came to the station. They asked me to find their class. So I came here. I found the school empty. The class was gone. I am sorry, kids. I will keep looking.\n\nI left something for the ring. A key lies in the back left classroom. It sits against the left wall, near the back. It is a short steel key on a gray tag.\n\nIt opens the evidence locker at the 4th Precinct. The station is west of here. That is the ring. Each stash key hides in another building. Use what is inside. Then leave a note for the next one.",
        },
        "school-dead1": {
          title: "Lunch Menu, Week One",
          text: "LINCOLN MIDDLE SCHOOL LUNCH MENU. This week's meals. Free milk with every meal.\n\nMonday: chicken soup and a roll.\nTuesday: tacos.\nWednesday: pasta with red sauce.\nThursday: grilled cheese and apples.\nFriday: PIZZA!\n\nThat was the week the Fall began. The menu is still taped to the wall. The corners curl up now. Pizza Friday was a big deal here. Kids lined up early for it.\n\nUnder Friday, someone wrote in pencil. The letters are big and angry.\n\nWe never got the pizza.\n\nSomeone else drew a sad face next to it. A third kid wrote: still mad about it. Honestly, same.",
        },
        "school-dead2": {
          title: "Fire Drill Map",
          text: "FIRE DRILL MAP. Room 4. Keep this posted by the door.\n\nIf the alarm rings, stay calm. Line up at the door. Do not run. Walk out the front. Everyone meets on the sports field. Teachers count every student there. Nobody goes back inside.\n\nIt is a good plan. It was a good plan, before. A red arrow points to the field.\n\nBut the class did not go to the field. The field is empty now. Only walkers cross it.\n\nMs. Adler left a note by the front door. That note says where the class really went. Read that one.",
        },
      },
      signs: {
        "school-sign1": { title: "Classroom Poster", text: "CLASS RULES: Raise your hand. Be kind. Read every day. At the bottom, someone added in marker: Stay together." },
        "school-sign2": { title: "Spray paint", text: "Ruby's red R, with a 4 under it. Under that, smaller: ONE IN THE HALLWAY. Check both ends." },
        "school-sign3": { title: "Neat Chalk Letters", text: "Neat chalk letters, like on a blackboard. Ms. Adler's class, gone north. Under it: Read the note by the front door." },
        "school-sign4": { title: "Library Closet Door", text: "LIBRARY CLOSET. Please return books on time. Thank you! Under it, someone added: Late fees canceled. Forever." },
      },
      key: { name: "Short steel key, gray tag", tag: "A short steel key on a gray tag. The tag says: Evidence. Do not remove. Someone crossed out the words \"do not\" with a pen." },
    },

    firehouse: {
      blurb: "Station 12, the fire station, with tools, water tanks, and an equipment bay.",
      door: {
        title: "Chief Dunn's Bay Door",
        text: "Chief Dunn, Station 12. Here is what is inside. A tool kit is in the back office. Go through the door behind the desk. A water tank is in the truck bay. The bay is on the right.\n\nAt least four walkers are inside. One is in the truck bay.\n\nThe equipment bay is locked. My note is on the front desk. Read it first.",
      },
      notes: {
        "firehouse-desk": {
          title: "The Red Key on the Board",
          text: "Chief Dunn again. I keep lists, so here is one.\n\nOne: look at the key board behind this desk. Two: take the red key. It is the only red one. Three: walk to the equipment bay door. The red key opens that lock. So you can open the equipment bay now.\n\nInside there is a water tank. There is lumber, and a set of tools. Take them. We have the trucks we need.\n\nFour: need water filters? Go to the Water Tower. It is on the west side of town. The filters are in its pump house. Theo looks after the pumps. He is fair. Be fair back.",
        },
        "firehouse-trail1": {
          title: "The Convoy List",
          text: "Chief Dunn. Convoy notes. I write everything down.\n\nThe River Convoy will leave north. We take the river road. Here is what goes:\nTwo fire trucks.\nSergeant Vega's van.\nCarla's boats.\n\nMr. Ortiz fixed both trucks before he went west. He did good work. The engines purr now.\n\nThe leaving day has moved three times. The river is still too high. The boats cannot launch in that current. So we wait. I hate waiting. Vega says next week. Vega said that last week, too.\n\nMy second note is in the back office. Go through the door behind the desk. It is in the back left corner.",
        },
        "firehouse-trail2": {
          title: "Priya's Key, Not Ours",
          text: "Chief Dunn. Second note. Good, you read the first.\n\nA key lies in this back office. Look in the front left corner. It sits against the left wall. It is a small silver key. It has a yellow tag shaped like a lightning bolt.\n\nIt opens the repair locker at Signal Electronics. That shop is downtown, east of here. Priya runs it. She fixed our radios for the convoy. Then she left this key here.\n\nThat is how the ring works. Keys in the ring never stay home. Each one opens a stash in another place. Read the notes, and you find them. Take what you need, and leave the rest.",
        },
        "firehouse-dead1": {
          title: "Chief Dunn's Famous Chili",
          text: "STATION 12 CHILI. By Chief Dunn. Feeds the whole crew.\n\nWhat you need:\nBeans.\nMore beans.\nWhatever is in the can.\n\nHow to make it:\nPut it all in the pot. Add water if it looks thick. Cook it slow. Cook it slower than that. Stir when you walk past. Do not rush it.\n\nServe it hot after a long shift. Nobody complains. If they do, they wash the pot. Vega burned the rice once. We still talk about it.\n\nAt the bottom, in big letters: NEVER LET VEGA COOK.\n\nSomebody drew a little fire under the words. Somebody else wrote: fair.",
        },
        "firehouse-dead2": {
          title: "First Convoy Notice",
          text: "RIVER CONVOY NOTICE. Signed, Sergeant Vega.\n\nThe convoy leaves this week. Meet at the north bridge. Be there at dawn on Friday. Bring water and warm clothes. Bring one bag each. Kids hold hands. Do not be late. We will not wait.\n\nThe paper is stiff and old. The tape at the corners is yellow. It was the very first notice. It went up before anything went wrong.\n\nSince then, the leaving day has moved. It moved again after that. Friday came and went. Nobody left from the bridge.\n\nDo not go to the bridge at dawn. You will stand there alone.",
        },
      },
      signs: {
        "firehouse-sign1": { title: "TRUCK BAY", text: "TRUCK BAY. KEEP CLEAR. Do not park here. Do not block these doors. Trucks leave fast when the bell rings." },
        "firehouse-sign2": { title: "Safety Board", text: "SAFETY BOARD. DAYS WITHOUT AN ACCIDENT: The number is wiped off. Under it, in marker: We stopped counting." },
        "firehouse-sign3": { title: "Spray paint", text: "Ruby's red R, with a 4 under it. Smaller, below: ONE IN THE TRUCK BAY. Look before you walk in." },
        "firehouse-sign4": { title: "Chalk by the Door", text: "Chalk on the equipment bay door. RED KEY, ON THE BOARD. An arrow points back toward the desk." },
      },
      key: { name: "Silver key, lightning-bolt tag", tag: "A small silver key on a yellow tag. The tag is shaped like a lightning bolt. It says: Repair locker. Fix it, don't toss it." },
    },

    hospital: {
      blurb: "St. Anne Annex, the north hills hospital, with medicine and the worst walkers.",
      door: {
        title: "Doc Lin on the Ambulance",
        text: "Doc Lin. Read all of this. Medical kits are in the rooms along the top hall. More are in the bottom left room. The generator is in the bottom right room.\n\nAt least six walkers are inside. They stand in the dark rooms. They do not move until they hear you.\n\nThe pharmacy stock room is locked. The nurse's note is in the top hall.",
      },
      notes: {
        "hospital-hall": {
          title: "Nurse Ada Stayed",
          text: "Nurse Ada, St. Anne Annex. I stayed when the others left.\n\nThe stock room needs a badge to open. My badge is in the drawer under this station. It is the top drawer. Take the badge. Hold it to the reader by the stock room door. The light turns green. You can open the stock room now.\n\nThere are three medical kits inside. Count them. Take what you need.\n\nOne rule in here. Stay quiet. The walkers follow sound more than light. A flashlight will not bring them. A dropped can will. Walk soft. Close doors slowly. Do not call out to anyone. Not even me.",
        },
        "hospital-trail1": {
          title: "Ada Keeps Listening",
          text: "Nurse Ada. Second note. Please read it all.\n\nI stayed for a reason. The generator must keep running. It keeps the records safe. It keeps the cold medicine cold. If it stops, both are lost. Fuel goes in at dawn. I check it at dusk.\n\nEvery night I listen to Jo on 88.1. I wait for word from Doc Lin. Lin is trying to get up here. Jo says Lin will come with the River Convoy. But the convoy is late again. It is always late again.\n\nI keep the generator going anyway.\n\nMy next note is in the top right room. Look in its back right corner.",
        },
        "hospital-trail2": {
          title: "The Heavy Iron Key",
          text: "Nurse Ada. This is the note about the key.\n\nA key lies in the second room from the left. That room is along the top. Look in its back right corner. It is a heavy old iron key. It has a square head. You will feel the weight.\n\nIt opens the old safe room at Gas-N-Go. That is south of here. It is near the south end of town. Take only what you need there.\n\nRuby brought this key up here. It was her first scouting run north. She wanted the ring to close into a circle. Every key opens a stash somewhere else. This one closes the loop.",
        },
        "hospital-dead1": {
          title: "Visitor Sign-In Sheet",
          text: "ST. ANNE ANNEX. VISITOR SIGN-IN. Please print your name and the time.\n\nThe sheet is from before the Fall. Most names are a mess of pen. Mothers, sons, a pastor, a man with flowers. They came in. They signed out again.\n\nThe last name on the sheet is neat. It says Doc Lin. Next to her name, she wrote two words: back tomorrow.\n\nThen the Fall came. The rest of the sheet is blank. The pen still hangs on its string. Nobody has written on it since. Ada keeps it on the desk anyway. Tomorrow is taking a long time.",
        },
        "hospital-dead2": {
          title: "Patient Bus Notice",
          text: "NOTICE TO ALL PATIENTS AND FAMILIES.\n\nA bus will take patients out of town. It leaves from the front door. It comes every morning at eight. Bring one bag. Bring your papers. Staff will help you board. Please do not crowd the doors.\n\nThat sounds like a way out. Look at the date in the corner. The notice is from the first week of the Fall.\n\nNo bus has come since then. The road out front is empty. Grass grows in the bus lane. The bus stop sign is bent flat. If you wait out there, you wait alone. Do not wait.",
        },
      },
      signs: {
        "hospital-sign1": { title: "QUIET ZONE", text: "QUIET ZONE. Patients resting. Ada's tidy writing below: They follow sound, not light. Keep it quiet." },
        "hospital-sign2": { title: "Spray paint", text: "Ruby's red R, with a 6 under it. Smaller: THEY STAND IN THE DARK ROOMS. LOOK BEFORE YOU STEP IN." },
        "hospital-sign3": { title: "Hospital Floor Map", text: "FLOOR MAP. Wards are along the top hall. The supply cupboard is marked in the top left room. You are here." },
        "hospital-sign4": { title: "Chalk by the Stock Room", text: "Chalk by the stock room door. It is Ada's neat writing. Lin, it is all still here. Come soon." },
      },
      key: { name: "Heavy iron key, square head", tag: "A heavy old iron key with a square head. Its tag says: Old safe room. Ruby was here. The ink is red. It is cold in your hand." },
    },

    watertower: {
      blurb: "The pump building under the Water Tower, full of water filters.",
      door: {
        title: "Theo's Note on the Gate",
        text: "Theo here. I tend the pumps. Water filters are on the floor, by the crates. Grab what you need.\n\nAt least four walkers are inside the pump building. They drift around the machines. Keep the crates between you and them.\n\nThe pump house is locked. My note is on the control panel inside. Read it before you touch anything. Shut the gate behind you.",
      },
      notes: {
        "watertower-panel": {
          title: "The Key in the Breaker Box",
          text: "Theo again. You found the panel. Good. Now listen.\n\nThe pump house key is in the breaker box. The box is gray, on the wall by this panel. Open the little door. The key hangs on a hook inside. Do not touch the switches. You can open the pump house now.\n\nIn the pump house there are filters. There is a water tank and some wire, too. Take what you need. Leave the rest for the next person.\n\nNeed medicine? St. Anne Annex is the hospital. It is north, along the river road. It still has medicine. But it is the most dangerous place in town. Go slow, or do not go.",
        },
        "watertower-trail1": {
          title: "Dev's Note to Ruby",
          text: "Ruby, it's Dev. If you are reading this, you came west. You found me. Well, almost. I am sorry I left.\n\nI am safe. Theo lets me and Mr. Ortiz sleep up in the tower. It is high and dry. Nothing climbs up there. We help Theo keep the pumps running. I fix the small stuff. Mr. Ortiz fixes the big stuff.\n\nI go out on runs sometimes. If I am out when you come, wait here. Please wait. Do not go looking for me.\n\nTheo left a note for travelers. It is at the back, between the crates. Read it. It is about the ring.",
        },
        "watertower-trail2": {
          title: "Theo's Note for Travelers",
          text: "For travelers. From Theo, who tends the pumps.\n\nA key lies in the front left corner. It is on the floor. It is a small brass key. It hangs on a purple school lanyard.\n\nIt opens the principal's closet at Lincoln Middle School. The school is far east of here, across town.\n\nMax and Mia, the twins, came here. They were looking for their teacher. I gave them water. Mia had this key. They left it with me for the ring. Each stash key hides in another building. So take this one east. Leave something good behind. Then come back for water.",
        },
        "watertower-dead1": {
          title: "Theo's Water Rules",
          text: "WATER RULES. Written on a card by Theo. Pinned by the pumps.\n\nOne jug per person each day.\nKids get two.\nNobody leaves thirsty.\n\nThat is it. Three rules. Theo does not like long lists. Nobody argues with Theo's rules.\n\nThe card is soft from many hands. Someone tried to add a fourth rule. It said: Theo gets three jugs. Theo crossed it out. Next to it he wrote: no.\n\nAt the bottom there is a tally. It counts every jug Theo gave away. The marks fill the whole back of the card. Then they go onto the wall. Theo is fair like that.",
        },
        "watertower-dead2": {
          title: "Paper Plate Note",
          text: "Written in marker on a paper plate. No name on it.\n\nGOOD NEWS. The river water is clean now. I tested it myself. It is safe to drink. No need to filter. Save your filters for later. Drink up.\n\nIt sounds great. It is not true.\n\nThe river is not clean. It carries mud and worse from upstream. Theo crossed out every line. Then he wrote across the plate. In thick black letters: FILTER EVERYTHING.\n\nUnder that, smaller: Every cup. Every time. Ask me if you need a filter. A filter costs less than a fever. Sick people cannot run. Theo has seen it happen.",
        },
      },
      signs: {
        "watertower-sign1": { title: "City Sign", text: "CITY WATER WORKS. STAFF ONLY. Below it, in red: DANGER. Pumps start without warning. Keep hands clear." },
        "watertower-sign2": { title: "Big Chalk Letters", text: "Big chalk letters across the wall: Ruby, I am here. It is signed with a D. The D is underlined twice." },
        "watertower-sign3": { title: "Chalk Circle", text: "A chalk circle with a key inside. Arrow to the tool crib, back left corner. Under it: The key is not here. Read the notes." },
        "watertower-sign4": { title: "Pump House Door", text: "PUMP HOUSE. KEEP LOCKED AT ALL TIMES. Next to it is a smaller sign: BREAKER BOX. DANGER. Do not touch." },
      },
      key: { name: "Brass key, purple school lanyard", tag: "A small brass key on a purple school lanyard. The tag says: Principal's closet. Go Lions. A little lion is drawn on it." },
    },

    lumberyard: {
      blurb: "Ridge Lumber on the east ridge, stacked high with wood.",
      door: {
        title: "Ruby's Spray Paint",
        text: "Ruby. Spray-painted this so you can read it from the road. Lumber is stacked in the racks. Check the middle and the back.\n\nAt least five walkers inside. They gather by the loading dock. Stay away from the dock.\n\nThe kiln shed is locked. The yard boss left a note on the paint rack. Read it. Then go. Quiet in there. No saws.",
      },
      notes: {
        "lumberyard-rack": {
          title: "Carla's Clipboard",
          text: "Carla here! I am the yard boss. Read this whole thing!\n\nThe kiln shed has a padlock with a code. The code is 2218. Write it on your hand if you have to. Spin it in, and pull down hard. The lock is stiff, not broken. You can open the kiln shed now.\n\nInside, the lumber is dry. That is the good stuff. There are boxes of nails, too. Take what you need.\n\nNow the big rule. DO NOT RUN THE SAWS. Not once. Not for one board. The noise brings the whole dock crowd. Cut boards by hand if you must. Carry what you need. Then get out.",
        },
        "lumberyard-trail1": {
          title: "Boats for the Convoy",
          text: "Carla again! Big news, so read close.\n\nMy crew is building boats. Flat boats, for the River Convoy. We use the yard's best planks. Only the straight ones. Only the dry ones. A boat is only as good as its worst board. We sand them by hand. No saws, ever.\n\nSergeant Vega comes by every week. Vega checks the boats and checks my list. Then Vega frowns at the river. The river is still too high. We cannot launch them yet. So the boats sit here and wait. So do we.\n\nMy other note is at the back wall. It is in the middle. Go read it!",
        },
        "lumberyard-trail2": {
          title: "The Bookmark Key",
          text: "Carla, yard boss. This one is about the key ring.\n\nA key lies in the front left corner. It is on the floor. It is between the counter and the crates. Look low. It is a long, old-fashioned key. It has a round loop for a handle. It is tied to a paper bookmark.\n\nIt opens the rare book room at the Public Library. The library is north and west of here.\n\nMrs. Greer paid me with this key. She bought planks to board up her library windows. So the key lives here now, in the ring. Every stash key hides in another place. Go use it!",
        },
        "lumberyard-dead1": {
          title: "Carla's Yard Rules",
          text: "RIDGE LUMBER YARD RULES. Read them. Follow them. No excuses.\n\nWear boots. Steel toes, if you have them. Lift with your legs, not your back. Never run the saws.\n\nIt is Carla's list, in her big letters. They fill the page edge to edge. Below the list, a new rule was added. It is in a different pen. The pen pressed so hard it tore the paper.\n\nIf you hear the dock crowd, freeze.\n\nCarla underlined freeze three times. Do not run. Do not drop your boards. Stand still until the sound moves away. Then walk away slowly. Somebody learned that the hard way.",
        },
        "lumberyard-dead2": {
          title: "Code on a Receipt",
          text: "Scrawled on the back of a receipt. The pen skipped. It was written fast. The receipt is for one box of screws.\n\nKILN SHED CODE: 2281. Got it off the clipboard. Hurry.\n\nIt looks right. It is close. But it is wrong. Two of the numbers are swapped. Spin 2281, and the padlock will not budge. You will stand there tugging. The dock crowd will hear you.\n\nWhoever wrote this was in too much of a rush. Maybe they were scared. Don't be in a rush. Go find Carla's clipboard by the racks. It has the right code. Read twice, spin once.",
        },
      },
      signs: {
        "lumberyard-sign1": { title: "Big Painted Sign", text: "Ridge Lumber. Cut to order. Since 1962. Ask at the counter for a price. Under it, in chalk: Prices are free now." },
        "lumberyard-sign2": { title: "Spray paint", text: "Ruby's red R, with a 5 under it. Below, in drippy letters: THEY GATHER AT THE DOCK. STAY AWAY." },
        "lumberyard-sign3": { title: "Safety Sign", text: "SAFETY FIRST. Ear protection needed near the saws. Under it, in Carla's marker: The saws stay off. Period." },
        "lumberyard-sign4": { title: "Paint on the Shed", text: "Spray paint on the kiln shed door. CODE ON THE CLIPBOARD. A big arrow points toward the racks." },
      },
      key: { name: "Old key with bookmark tag", tag: "A long, old-fashioned key. It has a round loop for a handle. It is tied to a paper bookmark. The bookmark says: Rare books. Handle with care." },
    },

    mall: {
      blurb: "Northgate Mall in the north: goods everywhere, and the worst crowds.",
      door: {
        title: "Jo's Note on the Doors",
        text: "Jo here, from 88.1. Food, medicine, and wire are spread across the store floor.\n\nAt least six walkers are inside. They move in one group, like a school of fish. Watch the group, not one walker. Go in slow.\n\nThe security office is locked. The guard's note is by the paint display. Read it. It will keep you alive. I mean it.",
      },
      notes: {
        "mall-guard": {
          title: "Luis Left the Code",
          text: "My name is Luis. I am a security guard here. I still am. Nobody told me to stop.\n\nThe office code is 0912. Type it on the keypad by the office door. Press the green button after. You can open the security office now. Inside there are gun parts. There are radio parts and a tool kit, too.\n\nNow the important part. The walkers here watch for running. If you run, they come running at you. All of them. So walk. Walk slow and steady. Then most of them stay put. It feels wrong. Your legs will want to run. Do not let them.",
        },
        "mall-trail1": {
          title: "Luis Holds His Post",
          text: "Luis again. Guard's log, sort of.\n\nI have stayed at my post since the Fall began. Every day. I watch the crowd from the balcony. I know their habits now. They walk the same slow loop. Every day, the same path. Past the fountain, past the shoe store, back again.\n\nSergeant Vega came by last month. Vega asked me to join the River Convoy. I said no. Someone has to watch the mall. If I leave, who warns people? Vega did not argue much.\n\nMy other note is in the back left corner. Read it. It is about a key.",
        },
        "mall-trail2": {
          title: "A Key from Doc Lin",
          text: "Luis. This is about the key ring.\n\nA key lies in the front left corner. It is on the floor. Look between the counter and the crates. It is a small silver key. It has a white tag with a red cross.\n\nIt opens the supply cupboard at St. Anne Annex. That is the hospital, far west of here. It is up in the north hills.\n\nDoc Lin left it with me on a medicine run. It is for the ring. Every stash key hides in another building. Nurse Ada wants the cupboard used, not saved. So use it. That is what the ring is for.",
        },
        "mall-dead1": {
          title: "Luis's Patrol Log",
          text: "PATROL LOG. Northgate Mall. Guard on duty: Luis.\n\nMonday: Crowd quiet. Nobody running. Doors held.\nTuesday: Crowd quiet. Nobody running. Doors held.\nWednesday: Crowd quiet. Nobody running. Doors held.\n\nThe log goes on like that for pages. Same three lines, day after day. The handwriting gets smaller. The pen gets lighter. Luis does not get many visitors.\n\nThen one day is different. It says: Jo came by with batteries. Stayed for coffee. Good day. Jo's name is underlined twice.\n\nThere is a little star drawn next to it. The next day goes back to normal. Crowd quiet. Nobody running. Doors held.",
        },
        "mall-dead2": {
          title: "Pencil Note, No Name",
          text: "A note in pencil, folded small. No name at the bottom.\n\nSECURITY OFFICE CODE IS 0921. Trust me. I watched the guard type it.\n\nIt looks real. It is not. The last two numbers are swapped. Type 0921, and the keypad beeps red. Type it again, and it beeps again. Every beep is loud in here. The crowd will turn toward the sound.\n\nMaybe the writer watched from too far away. Maybe they wanted you to fail. Either way, skip it. Do not guess at a keypad here. Luis's clipboard by the shelves has the right code. Use that one.",
        },
      },
      signs: {
        "mall-sign1": { title: "Mall Banner", text: "Northgate Mall. Something for everyone! Shop, eat, and play. Open seven days a week. Someone added in marker: Even walkers." },
        "mall-sign2": { title: "Spray paint", text: "Ruby's red R, with a 6 under it. Under that, in huge letters: DON'T RUN. The letters are taller than you." },
        "mall-sign3": { title: "Store Map", text: "STORE MAP. You are here. The jewelry vault is marked in the back right corner. Someone circled it in pen." },
        "mall-sign4": { title: "Security Door Sign", text: "SECURITY. STAFF ONLY. Under it, in marker: Code by the paint display. Read it. Do not guess." },
      },
      key: { name: "Silver key, red cross tag", tag: "A small silver key on a white tag. The tag has a red cross on it. It says: Supply cupboard. Ada says use it." },
    },

    library: {
      blurb: "The Public Library north of downtown, with books, maps, and a librarian.",
      door: {
        title: "Mrs. Greer's Book Drop",
        text: "From Mrs. Greer, the librarian. Welcome, reader. Boxes of books are in the reading rooms. Those rooms are on both sides.\n\nAt least five walkers are inside. Two of them stand in the main hall. Please do not run past them. Walk slowly and keep your voice low.\n\nThe archive room is locked. My note is in the back left reading room. Quiet feet, please.",
      },
      notes: {
        "library-desk": {
          title: "The Key in the Dictionary",
          text: "Mrs. Greer again. Since you are reading, you are welcome here.\n\nThe archive key is inside the big dictionary. It sits on this desk. It is the heaviest book in the building. Open it to the letter K. K for key, of course. The key is taped to the page. You can open the archive room now. Inside are boxes of books. There is a folder of city maps, too. Return the dictionary, please.\n\nReading saved this building. The walls are stacked with books. They are the books nobody wanted. Old phone books. Tax guides. They stop the walkers just fine. A wall of words holds better than you think.",
        },
        "library-trail1": {
          title: "The Class Lives Here Now",
          text: "Mrs. Greer. A note for anyone who asks about the children.\n\nMs. Adler's class lives here now. They came north from Lincoln Middle School. I took them in on the first night. They read by window light. They keep quiet. They are very good at quiet now. Better than any class I ever had.\n\nMs. Adler still watches the front door. She waits for the twins, Max and Mia. Two of her students are still missing. She will not stop looking. If you see two lost twins, send them here.\n\nMy other note is in the back right reading room. Look in its back right corner.",
        },
        "library-trail2": {
          title: "A Key for the Mall",
          text: "Mrs. Greer. Here is the note about the key.\n\nA key lies in the back left reading room. It sits against the left wall, near the back. It is a tiny gold key. It is in a small velvet pouch. The pouch is dark blue.\n\nIt opens the jewelry vault at Northgate Mall. The mall is east of here. Do not let the vault's name fool you.\n\nLuis the guard sent it to me with Jo. He asked me to keep it for the ring. Each stash key waits in another building. A key in a library is safe. Few people read the notes. You did.",
        },
        "library-dead1": {
          title: "Class Reading Chart",
          text: "MS. ADLER'S CLASS READING CHART. One star for every book you finish!\n\nThe chart is long. It is taped across two tables. Every student's name is on it. Most rows are full of gold stars. Some rows run off the edge. Someone taped on extra paper. The stars are cut from candy wrappers.\n\nTwo names have no stars yet. Max. Mia.\n\nTheir rows are empty. But they are not crossed out. Next to them, in neat pencil: saving their stars. Ms. Adler checks it every evening.\n\nThere is a small envelope pinned there, too. It is full of gold stars. It is waiting.",
        },
        "library-dead2": {
          title: "Index Card Tip",
          text: "An index card, left just inside the front door. No name on it.\n\nARCHIVE ROOM KEY: card catalog, drawer marked A. Back of the drawer. You're welcome.\n\nIt sounds like a librarian's trick. The card catalog is right there. It has a hundred small drawers. Each drawer squeaks when it opens. You could spend an hour pulling them out.\n\nDon't. The drawer marked A holds only old cards. So do all the others. Dusty cards, and one dead spider.\n\nRead Mrs. Greer's note on the desk. It says where the key really is. Trust the librarian. Then you will know.",
        },
      },
      signs: {
        "library-sign1": { title: "QUIET, PLEASE", text: "QUIET, PLEASE. Thank you for respecting other readers. Under it, in pencil: It works on walkers too. Seriously." },
        "library-sign2": { title: "Very Small Spray Paint", text: "Ruby's red R, with a 5 under it. Both are painted very small. Like she felt bad writing on a library wall." },
        "library-sign3": { title: "Library Hours", text: "LIBRARY HOURS: Dawn until dark. Below it: No candles near the books. Fire is worse than walkers." },
        "library-sign4": { title: "Chalk by the Archive", text: "Chalk by the archive room door. Curly letters: ASK THE DICTIONARY. A small smiley face sits next to it." },
      },
      key: { name: "Tiny gold key, velvet pouch", tag: "A tiny gold key in a small velvet pouch. A paper tag is tied to the pouch. It says: Jewelry vault. Not for jewelry." },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
