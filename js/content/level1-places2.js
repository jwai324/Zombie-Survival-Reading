/* Reading level 1: places, part 2 (police, school, firehouse, hospital, watertower, lumberyard, mall, library).
   Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md.
   SCALE: new places go in a new part file (level1-places3.js ...) with its own script tag, not in this one. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[1] = root.ZSR.TEXT[1] || { level: 1 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    /* ---------- 4th Precinct ---------- */
    police: {
      blurb: "The police station has gun parts, armor, and a locked armory.",
      door: {
        title: "Sergeant Vega's Notice Board",
        text: "This is Sergeant Vega. I work at this police station.\n\nGun parts are in the squad room. It is on the left side of the long hall. An armor plate is in the garage, on the right. It sits by the riot shields.\n\nThere are at least eight walkers inside. One of them is big. It waits in the garage, by the police bike. Do not let it trap you.\n\nThe armory is locked. I left the code on a note at the front desk. Read that note before you try the door.\n\n—Sergeant Vega",
      },
      notes: {
        "police-desk": {
          title: "How to Open the Armory",
          text: "This is Sergeant Vega. Do these steps in this order.\n\nFirst, turn off the alarm. The alarm panel is on the left wall, by the coffee machine. Press the {button} button on the panel. Then go to the armory door. Put in the code {code}.\n\nDo not get it wrong. A wrong button sets off the station alarm. A wrong number does too. So does opening the door while the alarm is still on. Then walkers pour in, even through the front door. They do not stop until they get you.\n\nThe armory has gun parts and an armor plate. Walk down the back hall toward the police bike. The armory is the last door before the garage.\n\nDo you need books? Go to the Public Library, north of downtown. Its books are in the archive room. The librarian stayed there.\n\n—Sergeant Vega",
        },
        "police-trail1": {
          title: "The Convoy Is Real",
          text: "This is Sergeant Vega. I want you to know something.\n\nThe River Convoy is real. It is not just talk. Trucks and boats will go north along the river. They will take us far from the big crowds of walkers.\n\nBut the convoy keeps getting late. The river is too high to go yet. The trucks still need parts, too. So we wait, and we fix things.\n\nDo you want to come with us? Then sign up with Chief Dunn. He is at Station 12, the fire station.\n\nMy next note is in the K9 room. Look beside the dog kennel.\n\n—Sergeant Vega",
        },
        "police-trail2": {
          title: "A Key on Orange Rope",
          text: "This is Sergeant Vega again. You read my first note, so here is a key.\n\nGo to the lobby and find the coffee machine. The key is on the floor beside it. It is a padlock key on a loop of orange rope.\n\nThis key opens the foreman's lockbox at Ridge Lumber. Ridge Lumber is east of here, up on the ridge. Carla runs it, and she builds boats for the convoy. She gave me this key so the ring stays whole.\n\nThe lockbox has a plain lock. A wrong key will just not turn in it.\n\n—Sergeant Vega",
        },
        "police-dead1": {
          title: "Lost and Found",
          text: "This is the lost and found list from the front desk.\n\nOne bike was turned in. It is blue, and its front wheel is bent. One trumpet was turned in. It still plays, but not well. One dog leash was turned in, but no dog came with it.\n\nNobody came back for these things. The bike and the trumpet are gone now.\n\nThen someone added a new line at the bottom. They used a new pen. The letters are big and slow. The line says: One town.",
        },
        "police-dead2": {
          title: "Numbers on a Scrap",
          text: "This is a small scrap of paper. It has numbers on it in pencil.\n\nThe top line says: ARMORY CODE. Under that it says {decoyCode}. The numbers are big and dark, because someone pressed hard.\n\nIs this the code you need? Look at the bottom of the scrap before you try it. A small line there says: This is the old code. Sergeant Vega changed it.\n\nSo these numbers will not work now. A wrong number sets off the alarm. Go to the front desk instead. The note there has the code that works.",
        },
      },
      signs: {
        "police-sign1": { title: "Red spray paint", text: "By the front door is Ruby's red R and an 8. Under it: ONE BIG ONE IN THE GARAGE. DON'T GET CORNERED." },
        "police-sign2": { title: "Wanted board", text: "The old wanted board is full of notes about missing people. One says: Ms. Adler's class, Lincoln Middle School." },
        "police-sign3": { title: "RIVER CONVOY", text: "A printed notice says: River Convoy sign-up at Station 12. Ask for Chief Dunn." },
        "police-sign4": { title: "ARMORY", text: "The door sign says: ARMORY. POLICE ONLY. Under it, in marker: The code is new. See the front desk." },
      },
      key: { name: "Padlock key on orange rope", tag: "A padlock key hangs on a loop of orange rope. Its tag says: Knock first." },
    },

    /* ---------- Lincoln Middle School ---------- */
    school: {
      blurb: "The middle school has books, maps, and a locked closet.",
      door: {
        title: "Max and Mia's Note",
        text: "Hi! We are Max and Mia. We are twins, and this is our school.\n\nThere are two boxes of books. One box is in the music room, by the drum set. The other box is in the front office, behind the lion statue.\n\nThere are at least six walkers inside. One of them stands in the main hallway.\n\nThe library closet is locked. Our teacher left a note that tells where the key is. The note is on a desk by the science room door. That room is back left, with the big brain.\n\n—Max and Mia",
      },
      notes: {
        "school-classroom": {
          title: "Ms. Adler's Desk Drawer",
          text: "I am Ms. Adler. I teach in this room.\n\nThe key to the library closet is in this desk. Look right under this note. Open the {pick} and take the key.\n\nDo not open any other drawer! Max and Mia tied air horns to the other two. The noise of a horn brings every walker in the school. They come in, even through the front door. They do not stop until they get you.\n\nThe closet has books and a folder of city maps. To get there, follow the main hallway toward the drum set room. The library is the room next to it. Its closet is in the back corner, on the drum set side.\n\nNorthgate Mall is to the north. It has food, medicine, and wire. But the crowds there are the worst in town.\n\n—Ms. Adler, teacher",
        },
        "school-trail1": {
          title: "For Max and Mia",
          text: "Max and Mia, this note is for you. It is from Ms. Adler.\n\nIf you read this, you came back. I am so glad. Our class went north to the Public Library. Mrs. Greer will take us in there.\n\nEvery kid in our class is safe. I count them each night. Each one is there but you two.\n\nI will come back here to check when I can.\n\nSergeant Vega came here to look for our class. Vega left a note in the music room. Look beside the drum set.\n\n—Ms. Adler",
        },
        "school-trail2": {
          title: "Vega Finds an Empty School",
          text: "This is Sergeant Vega. Max and Mia asked me to find their class. So I came here, but the school was empty.\n\nI left a key here for the ring. Go to the gym and find the basketball hoop. The key is on the floor under it. It is a short steel key on a gray tag.\n\nThis key opens the evidence locker at the 4th Precinct. That police station is west of here.\n\nThe evidence locker has a fussy lock. A wrong key jams it. After that, only a crowbar can open it.\n\n—Sergeant Vega",
        },
        "school-dead1": {
          title: "Lunch This Week",
          text: "This is the lunch menu for one week. It was the week the Fall began.\n\nMonday was soup and rolls. Tuesday was tacos. Wednesday was fish sticks. Thursday was pasta and corn. Friday was PIZZA!\n\nA kid drew lots of stars next to Friday. Some stars are in pen. Some are in green crayon.\n\nThe page curls at the edges now. It still hangs by one tack.\n\nA kid wrote at the bottom: We never got the pizza. A small sad face is under it.",
        },
        "school-dead2": {
          title: "A Kid's Note",
          text: "This note is on lined paper. The letters are big, like a kid wrote them.\n\nIt says: Ms. Adler's desk has the closet key. It is in the {decoyPick}. Go get it!\n\nThat sounds easy. But look at the name at the bottom. It says Mia. Mia wrote this before she and Max rigged the desk drawers. They tied air horns to them after that. So this note is out of date. A wrong drawer sets off a horn.\n\nMs. Adler left her own note on the desk. It says which drawer is safe. Read that one first.",
        },
      },
      signs: {
        "school-sign1": { title: "Class poster", text: "A class poster says: RAISE YOUR HAND. BE KIND. READ EVERY DAY. Someone wrote under it: Stay together." },
        "school-sign2": { title: "Red spray paint", text: "Ruby's red R is here, with a 6 under it. Under that: ONE IN THE HALLWAY." },
        "school-sign3": { title: "Neat chalk letters", text: "Someone wrote in neat chalk: Ms. Adler's class went north. Under it: Read the note by the front door." },
        "school-sign4": { title: "LIBRARY CLOSET", text: "The door sign says: LIBRARY CLOSET. RETURN BOOKS ON TIME. Someone added: Late fees are canceled." },
      },
      key: { name: "Short steel key, gray tag", tag: "A short steel key has a gray tag. The tag says: Do not remove. Someone crossed out the words do not." },
    },

    /* ---------- Station 12 ---------- */
    firehouse: {
      blurb: "The fire station has tools, water tanks, and a locked bay.",
      door: {
        title: "Chief Dunn's Bay Door",
        text: "This is Chief Dunn of Station 12. Here is what you need to know.\n\nA tool kit is in the office, behind the watch desk. A water tank is in the truck bay, on the right wall. It is past the gear racks.\n\nThere are at least six walkers inside. Two of them are in the truck bay.\n\nThe equipment bay is locked. My note is on the watch desk, by the spotted dog. Read it first.\n\n—Chief Dunn",
      },
      notes: {
        "firehouse-desk": {
          title: "The Key Board",
          text: "Chief Dunn here. I like lists, so here is one.\n\nOne: Find the key board. It hangs by this desk.\nTwo: Take the {pick} from the board. That key opens the equipment bay.\nThree: Take no other key. The other keys are for old locks. A wrong key jams the bay lock. After that, only a crowbar can open it.\n\nThe bay has a water tank, lumber, and tools. It is at the back of the truck bay. Find the fire truck. The bay door is beside it, on the gear racks side.\n\nDo you need water filters? Go to the Water Tower on the west side. Its pump house has filters.\n\n—Chief Dunn",
        },
        "firehouse-trail1": {
          title: "Convoy List",
          text: "This is the convoy list from Chief Dunn.\n\nThe River Convoy will go north along the river. Here is what goes with it. Two fire trucks will go. Sergeant Vega's van will go. Carla's boats will go, too.\n\nMr. Ortiz fixed both fire trucks before he went west. They run well now.\n\nBut the day we leave keeps moving. It has moved three times. The river is still too high.\n\nMy second note is in the bunk room. Look near the brass pole.\n\n—Chief Dunn",
        },
        "firehouse-trail2": {
          title: "The Lightning Bolt Key",
          text: "You found my second note. Good. Now I can tell you about the key.\n\nGo to the truck bay and find the fire truck. The key is on the floor beside it. It is a small silver key. Its yellow tag is shaped like a lightning bolt.\n\nThis key opens the repair locker at Signal Electronics. That shop is downtown, east of here. Priya fixed our radios for the convoy. Then she left this key with me. Keys in the ring never stay home.\n\nThe repair locker has a plain lock. A wrong key will just not turn.\n\n—Chief Dunn",
        },
        "firehouse-dead1": {
          title: "Station 12 Chili",
          text: "This is Chief Dunn's chili recipe. He pinned it up for the whole crew.\n\nHere is what you need. You need beans. You need more beans. Then you add what is in the can. Any can will do.\n\nDump it all in the big pot and stir it well. Cook it slow, because slow is the trick. Do not rush good chili.\n\nA grease spot sits on the corner. The page smells like smoke.\n\nThe last line is in big letters. It says: Never let Vega cook.",
        },
        "firehouse-dead2": {
          title: "Note on a Duty List",
          text: "This note is on the back of a duty list. Nobody signed it.\n\nIt says: The equipment bay key is on the key board. Take the {decoyPick}. It opens the bay.\n\nThat sounds like good help. But read the small line under it. Someone added it later in pencil. It says: That key fit the old lock. Then the chief changed the lock.\n\nSo this note is out of date. A wrong key jams the bay lock. The chief left his own note on the watch desk. It says which key fits now.",
        },
      },
      signs: {
        "firehouse-sign1": { title: "TRUCK BAY", text: "A big sign on the wall says: TRUCK BAY. KEEP CLEAR." },
        "firehouse-sign2": { title: "Safety board", text: "A safety board says: DAYS WITHOUT AN ACCIDENT. The number is wiped off. Someone wrote: We stopped counting." },
        "firehouse-sign3": { title: "Red spray paint", text: "By the front door is Ruby's red R and a 6. Under that: TWO IN THE TRUCK BAY." },
        "firehouse-sign4": { title: "Chalk by the door", text: "Chalk is by the equipment bay door. It says: The bay key is on the board. The chief's note says which one." },
      },
      key: { name: "Silver key, lightning bolt tag", tag: "A small silver key has a yellow tag. The tag is shaped like a lightning bolt. It says: Fix it, don't toss it." },
    },

    /* ---------- St. Anne Annex ---------- */
    hospital: {
      blurb: "The hospital in the hills has medicine and the worst walkers.",
      door: {
        title: "On the Ambulance Doors",
        text: "This is Doc Lin. Read this before you go in.\n\nOne medical kit is in a patient room. That room is next to the x-ray machine. Another medical kit is in the gift shop. It is by the giant teddy bear. The generator is in the utility room, on the right.\n\nThere are at least nine walkers inside. They stand still in the dark rooms. So look before you step into a room.\n\nThe pharmacy stock room is locked. The nurse left a note at the nurses' station. It is in the middle of the building.\n\n—Doc Lin",
      },
      notes: {
        "hospital-hall": {
          title: "Nurse Ada's Badge",
          text: "I am Nurse Ada. I stayed here when the others left.\n\nThe stock room opens with a badge. The badge is white, on a blue clip. It is in this station, right under this note. Open the {pick} and take the badge. Then hold the badge to the reader by the stock room door.\n\nOpen no other drawer! The other drawers are wired to the alarm on the crash cart. The alarm brings more and more walkers. They come in, even through the front doors. They do not stop until they get you.\n\nThe stock room has three medical kits. Its door is in this same room. Cross the walkway from this desk. The door is on the angel statue side.\n\nStay quiet in here. These walkers follow sound more than light.\n\n—Nurse Ada",
        },
        "hospital-trail1": {
          title: "Ada's Night Log",
          text: "This is the log of Nurse Ada.\n\nI stay here for two things. I keep the records safe, and I keep the medicine cold. Both need power, so I keep the generator running.\n\nEach night I turn on the radio. Jo talks on 88.1, and I listen for word from Doc Lin. Jo says Lin will come up with the River Convoy. But the convoy is late again.\n\nSo I keep the lights low, and I wait.\n\nMy next note is in the x-ray room. Look beside the x-ray machine.\n\n—Nurse Ada",
        },
        "hospital-trail2": {
          title: "The Square Iron Key",
          text: "This is my second note. Please read all of it.\n\nA key waits in the chapel. Find the angel statue there. The key is on the floor beside it. It is a heavy old iron key with a square head.\n\nThis key opens the old safe room at Gas-N-Go. Gas-N-Go is south of here, near the south end of town. Ruby brought the key up here on her first scout run north. She did it so the ring would close into a circle.\n\nBe careful at the old safe room. Its old lock bites. A wrong key snaps off inside it and is gone for good.\n\n—Nurse Ada",
        },
        "hospital-dead1": {
          title: "Visitor Sign-In Sheet",
          text: "This is a visitor sign-in sheet. It is from before the Fall.\n\nThe sheet is full of names. Some names are neat, and some are messy. Each name has a time next to it.\n\nThe last name on the sheet is Doc Lin. She wrote two words next to her name. They say: Back tomorrow.\n\nNo name comes after hers. The pen still hangs on its string. The page is gray with dust now. Nobody has come back to sign it.",
        },
        "hospital-dead2": {
          title: "Old Staff Memo",
          text: "This is an old memo for the hospital staff. It is typed and neat.\n\nIt is about the nurses' station. It says: The stock room badge is in the {decoyPick}.\n\nThat looks like the answer. But look at the date at the top. The memo is old. Nurse Ada moved the badge after it was printed. So the memo is wrong now. A wrong drawer sets off the alarm.\n\nAda left her own note on the nurses' station. It says where the badge is now. Read her note, not this one.",
        },
      },
      signs: {
        "hospital-sign1": { title: "QUIET ZONE", text: "A sign says: QUIET ZONE. PATIENTS RESTING. Under it, in Ada's neat writing: They follow sound, not light." },
        "hospital-sign2": { title: "Red spray paint", text: "Ruby's red R has a 9 under it. Below: THEY STAND IN THE DARK ROOMS. LOOK BEFORE YOU STEP IN." },
        "hospital-sign3": { title: "Hospital map", text: "A map shows patient rooms all along the main hall. The supply cupboard is off the hall, next to the chapel." },
        "hospital-sign4": { title: "Chalk by the door", text: "Ada wrote in chalk by the stock room door. It says: Lin, it is all still here." },
      },
      key: { name: "Heavy iron key, square head", tag: "A heavy old iron key has a square head. Its tag says: Ruby was here." },
    },

    /* ---------- Water Tower ---------- */
    watertower: {
      blurb: "The pumps on the west side have water filters.",
      door: {
        title: "On the Fence Gate",
        text: "This is Theo. I take care of the pumps here.\n\nThere are two water filters. One is by the crates, near the big red wheel. The other is in the boat workshop, by the rowboat.\n\nThere are at least six walkers inside the pump building. So go slow.\n\nThe pump house is locked. My note is on the control panel. The panel is in the back right room. Read the note before you touch anything.\n\nBe fair, and take only what you need.\n\n—Theo",
      },
      notes: {
        "watertower-panel": {
          title: "Theo's Breaker Boxes",
          text: "This is Theo. I tend the pumps. It is quiet work, and I like it.\n\nThere are three breaker boxes by this panel. The pump house key is in the {pick}. Open that box and take the key.\n\nDo not open the other two boxes! They are live with power. The shock from them kills.\n\nThe pump house has filters, a water tank, and wire. Its door is at the back of the pump hall. Go to the blue pump end, away from the big red wheel.\n\nDo you need medicine? St. Anne Annex is the hospital. Take Hill Road north to get there. It still has medicine. But it is the most dangerous place in town.\n\n—Theo",
        },
        "watertower-trail1": {
          title: "Dev to Ruby",
          text: "Ruby, it is me, Dev. I am safe. I mean it.\n\nTheo lets Mr. Ortiz and me stay here. We sleep up in the tower. It sways a bit in the wind. We help Theo keep the pumps running. I fix things, and Mr. Ortiz fixes my fixes.\n\nAm I out on a run when you come? Then please wait here for me.\n\nTheo left a note for travelers. It is in the pump hall, between the crates. Look near the big red wheel.\n\n—Dev",
        },
        "watertower-trail2": {
          title: "For Travelers, From Theo",
          text: "This note is for travelers. It is from Theo.\n\nA key waits in here. Find the green tanks. The key is on the floor beside them. It is a small brass key on a purple school lanyard.\n\nThis key opens the principal's closet at Lincoln Middle School. The school is far east of here, across town. Max and Mia came by here. They were looking for their teacher. Mia had this key. They left it with me for the ring.\n\nThe principal's closet has a fussy lock. A wrong key jams it. After that, only a crowbar can open it.\n\n—Theo",
        },
        "watertower-dead1": {
          title: "Theo's Water Rules",
          text: "These are Theo's water rules. He wrote them on a card. The card is wet at the edges, but the ink still holds.\n\nEach person gets one jug a day. Kids get two jugs. Nobody leaves here thirsty.\n\nThat is the whole list. There is no rule about who you are. There is no rule about where you come from.\n\nAt the bottom, in small print, Theo wrote more. Ask me, and I will fill your jug. Please do not take the hose.\n\n—Theo",
        },
        "watertower-dead2": {
          title: "Note on a Paper Plate",
          text: "Someone wrote this note on a paper plate. There is no name on it.\n\nIt says: The pump house key is in the {decoyPick}. It is by the control panel. Just open the box and grab it.\n\nThat sounds like a quick way in. But read the line on the back of the plate. It says: Theo rewired that box, and then he moved the key. That box is live now. Its shock can kill you.\n\nTheo left his own note on the control panel. It says which box is safe.",
        },
      },
      signs: {
        "watertower-sign1": { title: "WATER WORKS", text: "A city sign says: WATER WORKS. STAFF ONLY. Below it: DANGER. PUMPS START WITHOUT WARNING." },
        "watertower-sign2": { title: "Big chalk letters", text: "Big chalk letters say: Ruby, I am here. It is signed with a D." },
        "watertower-sign3": { title: "Chalk in the boat workshop", text: "A chalk key in a circle marks the tool crib door here. Under it: Key not here. Read the notes." },
        "watertower-sign4": { title: "PUMP HOUSE", text: "PUMP HOUSE. KEEP LOCKED. Theo wrote: Key in a breaker box by the control panel. Read my note first. Two are live." },
      },
      key: { name: "Brass key, purple school lanyard", tag: "A small brass key hangs on a purple school lanyard. Its tag says: Go Lions." },
    },

    /* ---------- Ridge Lumber ---------- */
    lumberyard: {
      blurb: "A lumber yard on the ridge, with a dock full of walkers.",
      door: {
        title: "Spray Paint on the Gate",
        text: "This is Ruby. I painted this note on the gate.\n\nLumber is in the long racks, in the middle of the yard. One more stack is out back, by the log pile. But a big walker stands by the log pile, too.\n\nThere are at least eight walkers inside. A crowd waits by the loading dock and the flatbed truck. So stay away from the dock.\n\nThe kiln shed is locked. The yard boss left a note on a clipboard. It is by the band saw.\n\nDo not run the saws. The noise brings the dock crowd.\n\n—Ruby",
      },
      notes: {
        "lumberyard-rack": {
          title: "Carla's Kiln Code",
          text: "Hey, you! I am Carla, and I am the yard boss here.\n\nThe kiln shed has a padlock with a code. The code is {code}. You say it like this: {codeSpoken}. Put in that code and no other.\n\nA wrong code locks up the old padlock for good. Then the lock is jammed, and only a crowbar can open it.\n\nThe shed has dry lumber and nails. To get there, leave the band saw shop by its door. Follow the back wall of the rack hall toward the log pile. The shed door is in that wall.\n\nNow here is the big rule. DO NOT RUN THE SAWS. The noise brings the whole dock crowd.\n\n—Carla, yard boss",
        },
        "lumberyard-trail1": {
          title: "Boat News From Carla",
          text: "Here is boat news from Carla!\n\nMy crew builds flat boats for the River Convoy. We use the best planks in the yard. These boats will float. I promise.\n\nSergeant Vega comes by every week to check the boats. Vega nods a lot, and that means good.\n\nBut the river is still too high. So we cannot launch the boats yet. We wait, and we sand.\n\nMy other note is out back in the yard. Look near the log pile.\n\n—Carla",
        },
        "lumberyard-trail2": {
          title: "The Bookmark Key",
          text: "You found it! Good reading. Here is the deal.\n\nGo to the sales office and find the wooden bear. The key is on the floor beside it. It is a long, old key. Its handle is a round loop. A paper bookmark is tied to it.\n\nThis key opens the rare book room at the Public Library. Go north and west from here. Mrs. Greer paid me with this key. She needed planks to board up her windows. So the key lives here now, in the ring.\n\nThe rare book room has an old lock that bites. A wrong key snaps off in it and is gone for good.\n\n—Carla",
        },
        "lumberyard-dead1": {
          title: "Yard Rules",
          text: "These are the yard rules. Carla wrote them, and she wants you to live by them.\n\nRule one: Wear boots. Wear real boots.\nRule two: Lift with your legs, not your back.\nRule three: Never run the saws. NEVER.\n\nA new rule was added at the bottom. It is in a different pen. The ink is blue, not black, and the letters lean hard.\n\nRule four: Do you hear the dock crowd? Then freeze. Do not move, and do not talk. Wait until they pass.",
        },
        "lumberyard-dead2": {
          title: "Code on a Receipt",
          text: "Someone wrote this note on the back of a receipt. The letters are fast and messy.\n\nIt says: KILN SHED CODE. Then it says {decoyCode}. Under that it says: Hurry!\n\nIt looks like a lucky find. But turn the receipt over and read the date. This note is old. Carla changed the padlock after it was written. So this is the old code, and it will not work now. A wrong code jams the old padlock.\n\nCarla's clipboard is by the band saw. It has the code that works now.",
        },
      },
      signs: {
        "lumberyard-sign1": { title: "Painted yard sign", text: "A big painted sign says: Ridge Lumber. Cut to order." },
        "lumberyard-sign2": { title: "Red spray paint", text: "Ruby's red R has an 8 under it. Below: THEY GATHER AT THE DOCK. STAY AWAY." },
        "lumberyard-sign3": { title: "SAFETY FIRST", text: "A safety sign says: EAR PROTECTION NEEDED NEAR THE SAWS. Carla added in marker: The saws stay off." },
        "lumberyard-sign4": { title: "Spray paint", text: "Someone sprayed paint beside the kiln shed door. It says: CODE ON THE CLIPBOARD." },
      },
      key: { name: "Old key tied to a bookmark", tag: "A long, old key has a round loop for a handle. A paper bookmark is tied on. It says: Handle with care." },
    },

    /* ---------- Northgate Mall ---------- */
    mall: {
      blurb: "The big mall has food, medicine, wire, and the worst crowds.",
      door: {
        title: "Jo's Mall Warning",
        text: "This is Jo from the radio. Today my words are on this door.\n\nFood is in the food court, at the back. Medicine is in the pharmacy, on the left. Wire is in the gadget store, on the right. That store is next door to the orange tent.\n\nThere are at least nine walkers inside. Many of them stand along the main hall.\n\nThe security office is locked. The guard left a note in the play area. Look by the green dino.\n\n—Jo",
      },
      notes: {
        "mall-guard": {
          title: "The Guard's Code",
          text: "My name is Luis. I am a guard at this mall. Nobody told me to stop, so I still guard it.\n\nFirst, turn off the alarm. The alarm panel is on the left wall, by the rocking horse. Press the {button} button. Then go to the office door. The code is {code}. That is {codeSpoken}.\n\nA wrong button sets off the mall alarm. A wrong code does too. So does opening the office while the alarm is on. Then walkers pour in, even through the front doors. They do not stop until they get you.\n\nThe office has gun parts, radio parts, and a tool kit. Go to the back of the food court. Take the kitchen door and turn right. The office is behind the green dino.\n\nThe walkers here run at anyone who runs. So walk, and most of them stay put.\n\n—Luis",
        },
        "mall-trail1": {
          title: "Luis Holds His Post",
          text: "This is the post log of Luis, the mall guard.\n\nI am still at my post. I have been here since the Fall began. I do not plan to leave.\n\nThe crowd here walks the same slow loop every day. They go past the shoes and past the food court. Then they go around again.\n\nSergeant Vega came by. Vega wants me to join the River Convoy. I said no, because someone has to watch the mall.\n\nMy other note is in the sports store. Look beside the orange tent.\n\n—Luis",
        },
        "mall-trail2": {
          title: "The Red Cross Key",
          text: "This is my second note. It is Luis again.\n\nGo to Toy Town and find the rocking horse. A key is on the floor beside it. It is a small silver key. Its white tag has a red cross on it.\n\nThis key opens the supply cupboard at St. Anne Annex. That is far west of here, up in the north hills. Doc Lin left it with me on a medicine run. Nurse Ada wants that cupboard used, not saved.\n\nThe supply cupboard has a plain lock. A wrong key will just not turn.\n\n—Luis",
        },
        "mall-dead1": {
          title: "Patrol Log",
          text: "This is the patrol log of Luis, the mall guard.\n\nOn Monday, the crowd was quiet. Nobody ran, and the doors held. On Tuesday, the crowd was quiet. Nobody ran, and the doors held. Wednesday was the same. Thursday was the same, with rain on the roof.\n\nOn Friday, Jo came by with new batteries. Jo stayed for coffee, and we talked for an hour. The coffee was bad, but the talk was good.\n\nOn Saturday, the crowd was quiet. The doors held.",
        },
        "mall-dead2": {
          title: "Pencil Note, No Name",
          text: "This note is in pencil, and it has no name on it.\n\nIt says: SECURITY OFFICE CODE. Then it says {decoyCode}. Under that it says: I saw the guard put it in.\n\nThat sounds like a good tip. But look at the bottom of the page. Someone wrote a small line there. It says: Luis changed the code after this.\n\nSo this is the old code, and it will not work now. A wrong code sets off the mall alarm. Luis left his clipboard by the green dino. It has the code that works now.",
        },
      },
      signs: {
        "mall-sign1": { title: "Big banner", text: "A big banner says: Northgate Mall. Something for everyone! It sags in the middle." },
        "mall-sign2": { title: "Red spray paint", text: "By the front doors is Ruby's red R and a 9. Under that, in huge letters: DON'T RUN." },
        "mall-sign3": { title: "Store map", text: "There is a store map. It marks the jewelry vault. The vault is in the gadget store, at its front wall." },
        "mall-sign4": { title: "SECURITY", text: "SECURITY. STAFF ONLY. Someone wrote under it in marker: The code is on the clipboard. It is by the green dino." },
      },
      key: { name: "Silver key, red cross tag", tag: "A small silver key has a white tag with a red cross. It says: Ada says use it." },
    },

    /* ---------- Public Library ---------- */
    library: {
      blurb: "The library north of downtown has books, maps, and a librarian.",
      door: {
        title: "On the Book Drop",
        text: "Welcome. I am Mrs. Greer, the librarian. Please keep your voice down in here.\n\nBooks are in the stacks on both sides of the main hall. More books are in the children's room, by the toy castle.\n\nThere are at least eight walkers inside. Two of them walk in the main hall.\n\nThe archive room is locked. My note is on the reference desk. It is by the giant globe, at the back left.\n\n—Mrs. Greer, librarian",
      },
      notes: {
        "library-desk": {
          title: "Three Big Books",
          text: "This is Mrs. Greer, at the reference desk. Of course I hide things in books.\n\nThere are three big books on this desk. The archive key is inside the {pick}. Open that book and take the key.\n\nDo not open the other two books! I hid a blast trap in each one to stop book thieves. The blast kills.\n\nThe archive has books and a folder of city maps. Its door is at the back end of the main hall. It sits between two rooms. One room has the giant globe. The other room has the tall clock.\n\nReading saved this building. The walls are stacked with books that nobody wanted.\n\n—Mrs. Greer",
        },
        "library-trail1": {
          title: "Our Guests",
          text: "This is a note from Mrs. Greer.\n\nMs. Adler's class lives here now. They are good guests. They read by the light from the windows. They keep quiet, and they wash their own cups.\n\nMs. Adler still watches the front door. She waits for the twins, Max and Mia. She looks each day, and she looks again each night. I bring her tea, but she does not drink it.\n\nMy other note is in the periodicals room. That is the room with the magazines. Look beside the tall clock.\n\n—Mrs. Greer",
        },
        "library-trail2": {
          title: "The Velvet Pouch",
          text: "Well done. You read on, so here is your reward.\n\nGo to the children's room and find the toy castle. A key is on the floor beside it. It is a tiny gold key in a small velvet pouch.\n\nThis key opens the jewelry vault at Northgate Mall. The mall is east of here. Luis, the mall guard, sent the key with Jo. He asked me to keep it for the ring.\n\nThe jewelry vault has a fussy lock. A wrong key jams it. After that, only a crowbar can open it.\n\n—Mrs. Greer",
        },
        "library-dead1": {
          title: "Class Reading Chart",
          text: "This is the class reading chart. Each kid gets one star for each book they finish.\n\nThe chart is long. Each name has gold stars next to it. Some rows run off the page. Some kids read fast, and some read slow. But all of them read.\n\nTwo rows are still empty. They belong to Max and Mia. They have no stars yet.\n\nSomeone wrote next to them in neat pen: Saving their stars. A box of stars is taped below. It is still full.",
        },
        "library-dead2": {
          title: "Tip on an Index Card",
          text: "This note is on a small index card. Nobody signed it.\n\nIt says: The archive room key is inside the {decoyPick}. It is on the reference desk.\n\nThat sounds like a good tip. But there is more on the back of the card. Mrs. Greer wrote it in red ink. It says: A thief read this card. So I moved the key and set my traps.\n\nNow a wrong book has a blast trap in it. Mrs. Greer left her own note on the desk. It says which book is safe.",
        },
      },
      signs: {
        "library-sign1": { title: "QUIET, PLEASE", text: "A sign says: QUIET, PLEASE. Under it, in pencil: It works on walkers too." },
        "library-sign2": { title: "Tiny red paint", text: "Ruby painted a red R and an 8 here. She made them very small. She seems sorry to paint a library wall." },
        "library-sign3": { title: "LIBRARY HOURS", text: "A sign says: LIBRARY HOURS, DAWN UNTIL DARK. Below it: No candles near the books." },
        "library-sign4": { title: "Chalk by the door", text: "This chalk is by the archive door. It says: Read Mrs. Greer's note first. Then open a book." },
      },
      key: { name: "Tiny gold key, velvet pouch", tag: "A tiny gold key sits in a small velvet pouch. Its tag says: Not for show." },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
