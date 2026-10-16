/* Reading level 2: places, part 2 (police, school, firehouse, hospital, watertower, lumberyard, mall, library). Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md.
   SCALE: new places go in a new part file (level2-places3.js ...) with its own script tag, not in this one. */
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
        text: "Sergeant Vega, 4th Precinct. Read this before you go in.\n\nGun parts are in the squad room, left of the long hall. An armor plate is in the garage, on the right. It is by the riot shields.\n\nAt least eight walkers are inside. A big one waits in the garage, by the police bike. Do not let it corner you.\n\nThe armory is locked. I left the combination on a note. It is at the front desk.",
      },
      notes: {
        "police-desk": {
          title: "The Armory Combination",
          text: "Sergeant Vega again. You made it to the desk. Good. Now do this in order.\n\nFirst, turn off the alarm. Its panel is on the left wall, by the coffee machine. Press the {button} button. Do that first!\n\nThen go to the armory. Take the back hall toward the police bike. The armory is the last door before the garage. Its combination is {code}.\n\nA wrong button sets off the station alarm. So does a wrong number. So does opening the armory with the alarm still on. Then walkers pour in, even through the front door. They come until they get you.\n\nInside are gun parts and an armor plate.\n\nThe Public Library is north of downtown. It has books in its archive room. The librarian stayed.",
        },
        "police-trail1": {
          title: "The River Convoy Is Real",
          text: "Sergeant Vega. Read this all the way through.\n\nThe River Convoy is real. It is not a rumor. Trucks and boats will go north. We will go along the river. That leads away from the crowds.\n\nBut it keeps getting delayed. The river is still too high. The trucks still need parts. So we wait, and we fix things.\n\nDo you want to come? Then sign up with Chief Dunn. He is at Station 12, the fire station. He keeps the list. Every name counts.\n\nMy next note is in the K9 room. It is beside the dog kennel.",
        },
        "police-trail2": {
          title: "A Key for Carla's Lockbox",
          text: "Vega again. You found the dog kennel. Good.\n\nNow go back to the lobby. A key lies on the floor there. It is beside the coffee machine. It is a padlock key. It hangs on a loop of orange rope.\n\nIt opens the foreman's lockbox at Ridge Lumber. That yard is east of here, on the ridge. Carla runs it. She is building boats for the convoy. She gave me this key so the ring stays whole.\n\nThe foreman's lockbox has a plain lock. A wrong key just will not turn. Take what you need, and leave the rest.",
        },
        "police-dead1": {
          title: "Lost and Found List",
          text: "LOST AND FOUND, front desk. Items turned in this month.\n\nOne bike. It was blue, with a bent wheel. Nobody came back for it.\n\nOne trumpet. It was in a black case. A kid left it on the bus bench.\n\nOne dog leash with no dog. It was red, and well chewed. The dog never turned up.\n\nThat was the whole list. Then the Fall came. The desk sergeant stopped writing.\n\nSomeone else added a line at the bottom. The pen is different. The letters are shaky and small.\n\nIt says: one town.\n\nNobody has come to claim that, either. Maybe nobody can.",
        },
        "police-dead2": {
          title: "Numbers on a Scrap",
          text: "A torn scrap of paper, folded twice. The writing is fast and messy.\n\nARMORY COMBINATION: {decoyCode}. GOT IT FROM THE SARGE.\n\nThat looks like a lucky find. The armory has gun parts. Who would not want them?\n\nBut look at the back of the scrap. It is an old duty list, from the first week of the Fall. These numbers are just as old. Sergeant Vega changed the combination after that. So this one is wrong now. Spin it in, and the station alarm goes off.\n\nDo not trust a scrap with no name on it. The note on the front desk has the one that works.",
        },
      },
      signs: {
        "police-sign1": { title: "Spray paint", text: "Ruby's big red R by the front door, with an 8 under it. Smaller, below it: ONE BIG ONE IN THE GARAGE. DON'T GET CORNERED." },
        "police-sign2": { title: "The Old Wanted Board", text: "The old WANTED board. It is covered in missing-person notes. One says: Ms. Adler's class, Lincoln Middle School. Have you seen them?" },
        "police-sign3": { title: "Printed Notice", text: "RIVER CONVOY SIGN-UP. Trucks and boats, going north. Sign up at Station 12, the fire station. Ask for Chief Dunn. Bring your family." },
        "police-sign4": { title: "Armory Door Sign", text: "ARMORY. POLICE ONLY. All staff must sign in. Under it, in black marker: Combination changed. See the front desk." },
      },
      key: { name: "Padlock key on orange rope", tag: "A padlock key on a loop of orange rope. The tag says: Knock first. Someone wrote it in thick pencil. The rope smells like sawdust." },
    },

    school: {
      blurb: "Lincoln Middle School, with boxes of books and a locked library closet.",
      door: {
        title: "Max and Mia Were Here",
        text: "It's Max and Mia! We came back to look for our class.\n\nBoxes of books are in the music room, by the drum set. More are in the front office, behind the lion statue.\n\nAt least six walkers are inside. One walks up and down the main hallway. Be quiet in there.\n\nThe library closet is locked. The key is in the teacher's note. It is in the science room, back left, by the big brain. Good luck!",
      },
      notes: {
        "school-classroom": {
          title: "Ms. Adler's Desk Drawers",
          text: "I am Ms. Adler. I taught in this room for nine years.\n\nThe library closet key is in the {pick} of this desk. The drawers are right under this note.\n\nOpen no other drawer! Max and Mia tied air horns to the other two. The noise brings every walker in the school. They come even through the front door. They keep coming until they get you.\n\nFollow the main hallway toward the drum set room. The library is the room next to it. Its closet is in the back corner, on the drum set side. Inside are books and a folder of city maps.\n\nNorthgate Mall is up north. It has food, medicine, and wire. But the crowds there are the worst in town.",
        },
        "school-trail1": {
          title: "Max, Mia: Read This",
          text: "To Max and Mia. You came back. I knew you would.\n\nThe class has gone north to the Public Library. Mrs. Greer, the librarian, will take us in. Every student is safe and counted. Every one, except the two of you. I counted three times.\n\nI will come back to check whenever I can. Wait here if it is safe. If not, come north to the library. Stay together, like we practiced. Do not go anywhere alone.\n\nSergeant Vega came looking for the class. Vega left a note for you. It is in the music room, beside the drum set.\n\nLove, Ms. Adler",
        },
        "school-trail2": {
          title: "Sergeant Vega Came Looking",
          text: "Sergeant Vega, 4th Precinct.\n\nMax and Mia came to the station. They asked me to find their class. So I came here. I found the school empty. The class was gone. I am sorry, kids. I will keep looking.\n\nI left something for the ring. A key lies on the gym floor. It is under the basketball hoop. It is a short steel key on a gray tag.\n\nIt opens the evidence locker at the 4th Precinct. The station is west of here. That locker has a fussy lock. The wrong key jams it. Then only a crowbar opens it.",
        },
        "school-dead1": {
          title: "Lunch Menu, Week One",
          text: "LINCOLN MIDDLE SCHOOL LUNCH MENU. This week's meals. Free milk with every meal.\n\nMonday: chicken soup and a roll.\nTuesday: tacos.\nWednesday: pasta with red sauce.\nThursday: grilled cheese and apples.\nFriday: PIZZA!\n\nThat was the week the Fall began. The menu is still taped to the wall. The corners curl up now. Pizza Friday was a big deal here. Kids lined up early for it.\n\nUnder Friday, someone wrote in pencil. The letters are big and angry.\n\nWe never got the pizza.\n\nSomeone else drew a sad face next to it. A third kid wrote: still mad about it. Honestly, same.",
        },
        "school-dead2": {
          title: "A Kid's Secret Note",
          text: "A note on lined paper. The writing is big and round, like a kid's.\n\nCLOSET KEY: in the {decoyPick} of Ms. Adler's desk!! Don't tell anyone.\n\nIt looks like a real secret. Kids know where teachers hide things. At the bottom is a drawing of two stick kids.\n\nBut look at the name under the drawing. It says Mia. She wrote this early on. That was before she and Max rigged the desk drawers with air horns. Now that drawer has a horn on it. Open it, and the noise brings walkers.\n\nMs. Adler's own note on the desk says which drawer is safe. Read hers first.",
        },
      },
      signs: {
        "school-sign1": { title: "Classroom Poster", text: "CLASS RULES: Raise your hand. Be kind. Read every day. At the bottom, someone added in marker: Stay together." },
        "school-sign2": { title: "Spray paint", text: "Ruby's red R, with a 6 under it. Under that, smaller: ONE IN THE HALLWAY. Check both ends." },
        "school-sign3": { title: "Neat Chalk Letters", text: "Neat chalk letters, like on a blackboard. Ms. Adler's class, gone north. Under it: Read the note by the front door." },
        "school-sign4": { title: "Library Closet Door", text: "LIBRARY CLOSET. Please return books on time. Thank you! Under it, someone added: Late fees canceled. Forever." },
      },
      key: { name: "Short steel key, gray tag", tag: "A short steel key on a gray tag. The tag says: Do not remove. Someone crossed out the words \"do not\" with a pen." },
    },

    firehouse: {
      blurb: "Station 12, the fire station, with tools, water tanks, and an equipment bay.",
      door: {
        title: "Chief Dunn's Bay Door",
        text: "Chief Dunn, Station 12. Here is what is inside.\n\nA tool kit is in the office behind the watch desk. A water tank is in the truck bay, on the right wall. It is past the gear racks.\n\nAt least six walkers are inside. Two are in the truck bay.\n\nThe equipment bay is locked. My note is on the watch desk, by the spotted dog. Read it first.",
      },
      notes: {
        "firehouse-desk": {
          title: "The Key Board List",
          text: "Chief Dunn again. I keep lists, so here is one.\n\nOne: look at the key board by this desk. Two: take the {pick}. That key opens the equipment bay. Three: take no other key! The others are for old locks. A wrong one jams the bay lock. After that, only a crowbar opens it.\n\nFour: walk to the back of the truck bay. The equipment bay is beside the fire truck, on the gear racks side. Inside there is a water tank. There is lumber, and a set of tools.\n\nFive: need water filters? Go to the Water Tower. It is on the west side of town. The filters are in its pump house.",
        },
        "firehouse-trail1": {
          title: "The Convoy List",
          text: "Chief Dunn. Convoy notes. I write everything down.\n\nThe River Convoy will leave north. We go along the river. Here is what goes:\nTwo fire trucks.\nSergeant Vega's van.\nCarla's boats.\n\nMr. Ortiz fixed both trucks before he went west. He did good work. The engines purr now.\n\nThe leaving day has moved three times. The river is still too high. The boats cannot launch in that current. So we wait. I hate waiting. Vega says next week. Vega said that last week, too.\n\nMy second note is in the bunk room. It is near the brass pole.",
        },
        "firehouse-trail2": {
          title: "Priya's Key, Not Ours",
          text: "Chief Dunn. Second note. Good, you read the first.\n\nA key lies on the truck bay floor. It is beside the fire truck. It is a small silver key. It has a yellow tag shaped like a lightning bolt.\n\nIt opens the repair locker at Signal Electronics. That shop is downtown, east of here. Priya runs it. She fixed our radios for the convoy. Then she left this key here.\n\nKeys in the ring never stay home.\n\nThe repair locker has a plain lock. A wrong key just will not turn. Take what you need, and leave the rest.",
        },
        "firehouse-dead1": {
          title: "Chief Dunn's Famous Chili",
          text: "STATION 12 CHILI. By Chief Dunn. Feeds the whole crew.\n\nWhat you need:\nBeans.\nMore beans.\nWhatever is in the can.\n\nHow to make it:\nPut it all in the pot. Add water if it looks thick. Cook it slow. Cook it slower than that. Stir when you walk past. Do not rush it.\n\nServe it hot after a long shift. Nobody complains. If they do, they wash the pot. Vega burned the rice once. We still talk about it.\n\nAt the bottom, in big letters: NEVER LET VEGA COOK.\n\nSomebody drew a little fire under the words. Somebody else wrote: fair.",
        },
        "firehouse-dead2": {
          title: "Duty Roster Tip",
          text: "A note on the back of a duty roster. Nobody signed it.\n\nEquipment bay: use the {decoyPick} on the board. Quick and easy.\n\nIt looks like a tip from the crew. The whole crew's names are on the front of the roster.\n\nBut look at the dates on the roster. They are from before the Fall. Back then, that key fit the old lock. Then the chief changed the lock. Now that key is wrong. Try it, and the bay lock jams. Then only a crowbar opens it.\n\nThe chief's note on the watch desk says which key fits now. Read that one first.",
        },
      },
      signs: {
        "firehouse-sign1": { title: "TRUCK BAY", text: "TRUCK BAY. KEEP CLEAR. Do not park here. Do not block these doors. Trucks leave fast when the bell rings." },
        "firehouse-sign2": { title: "Safety Board", text: "SAFETY BOARD. DAYS WITHOUT AN ACCIDENT: The number is wiped off. Under it, in marker: We stopped counting." },
        "firehouse-sign3": { title: "Spray paint", text: "Ruby's red R by the front door, with a 6 under it. Smaller, below: TWO IN THE TRUCK BAY. Look before you walk in." },
        "firehouse-sign4": { title: "Chalk by the Door", text: "Chalk by the equipment bay door. THE BAY KEY IS ON THE BOARD. Under it: The chief's note says which one." },
      },
      key: { name: "Silver key, lightning-bolt tag", tag: "A small silver key on a yellow tag. The tag is shaped like a lightning bolt. It says: Fix it, don't toss it." },
    },

    hospital: {
      blurb: "St. Anne Annex, the north hills hospital, with medicine and the worst walkers.",
      door: {
        title: "Doc Lin on the Ambulance",
        text: "Doc Lin. Read all of this.\n\nOne medical kit is in a patient room next to the x-ray machine. Another is by the giant teddy bear, in the gift shop. The generator is in the utility room, on the right.\n\nAt least nine walkers are inside. They stand in the dark rooms. They do not move until they hear you.\n\nThe pharmacy stock room is locked. The nurse's note is at the nurses' station, in the middle.",
      },
      notes: {
        "hospital-hall": {
          title: "Nurse Ada Stayed",
          text: "Nurse Ada, St. Anne Annex. I stayed when the others left.\n\nThe stock room needs a badge. It is white, on a blue clip. It is in the {pick} of this station. The drawers are right under this note. Hold the badge to the reader by the stock room door.\n\nOpen no other drawer! They are wired to the crash cart alarm. It brings walkers, more and more. They come even through the front doors. They keep coming until they get you.\n\nThe stock room door is in this room. It is across the walkway from this desk, on the angel statue side. There are three medical kits inside.\n\nStay quiet in here. The walkers follow sound more than light.",
        },
        "hospital-trail1": {
          title: "Ada Keeps Listening",
          text: "Nurse Ada. Second note. Please read it all.\n\nI stayed for a reason. The generator must keep running. It keeps the records safe. It keeps the cold medicine cold. If it stops, both are lost. Fuel goes in at dawn. I check it at dusk.\n\nEvery night I listen to Jo on 88.1. I wait for word from Doc Lin. Lin is trying to get up here. Jo says Lin will come with the River Convoy. But the convoy is late again. It is always late again.\n\nI keep the generator going anyway.\n\nMy next note is in the x-ray room. It is beside the x-ray machine.",
        },
        "hospital-trail2": {
          title: "The Heavy Iron Key",
          text: "Nurse Ada. This is the note about the key.\n\nA key lies on the chapel floor. It is beside the angel statue. It is a heavy old iron key. It has a square head. You will feel the weight.\n\nIt opens the old safe room at Gas-N-Go. That is south of here. It is near the south end of town. Take only what you need there.\n\nRuby brought this key up here. It was her first scouting run north. She wanted the ring to close into a circle.\n\nThe old safe room has an old lock that bites. The wrong key snaps off inside it. Then that key is gone for good.",
        },
        "hospital-dead1": {
          title: "Visitor Sign-In Sheet",
          text: "ST. ANNE ANNEX. VISITOR SIGN-IN. Please print your name and the time.\n\nThe sheet is from before the Fall. Most names are a mess of pen. Mothers, sons, a pastor, a man with flowers. They came in. They signed out again.\n\nThe last name on the sheet is neat. It says Doc Lin. Next to her name, she wrote two words: back tomorrow.\n\nThen the Fall came. The rest of the sheet is blank. The pen still hangs on its string. Nobody has written on it since. Ada keeps it by the door anyway. Tomorrow is taking a long time.",
        },
        "hospital-dead2": {
          title: "Old Staff Memo",
          text: "An old staff memo, printed on hospital paper.\n\nTO ALL STAFF. The stock room badge is kept in the {decoyPick} of the nurses' station. Return it after every use. Thank you.\n\nIt looks official. It has the hospital name at the top. It even has a little stamp.\n\nBut look at the date. The memo is old. Nurse Ada moved the badge after it was printed. Now that drawer is wired to the crash cart alarm. Open it, and walkers pour in.\n\nAda's note on the station says where the badge is now. Trust Ada, not the memo.",
        },
      },
      signs: {
        "hospital-sign1": { title: "QUIET ZONE", text: "QUIET ZONE. Patients resting. Ada's tidy writing below: They follow sound, not light. Keep it quiet." },
        "hospital-sign2": { title: "Spray paint", text: "Ruby's red R, with a 9 under it. Smaller: THEY STAND IN THE DARK ROOMS. LOOK BEFORE YOU STEP IN." },
        "hospital-sign3": { title: "Hospital Floor Map", text: "FLOOR MAP. Patient rooms run all along the main hall. The supply cupboard is marked next to the chapel, off the main hall." },
        "hospital-sign4": { title: "Chalk by the Stock Room", text: "Chalk by the stock room door. It is Ada's neat writing. Lin, it is all still here. Come soon." },
      },
      key: { name: "Heavy iron key, square head", tag: "A heavy old iron key with a square head. Its tag says: Ruby was here. The ink is red. It is cold in your hand." },
    },

    watertower: {
      blurb: "The pump building under the Water Tower, full of water filters.",
      door: {
        title: "Theo's Note on the Gate",
        text: "Theo here. I tend the pumps.\n\nOne water filter is by the crates, near the big red wheel. The other is in the boat workshop, by the rowboat.\n\nAt least six walkers are inside the pump building. They drift around the machines.\n\nThe pump house is locked. My note is on the control panel, in the back right room. Read it before you touch anything. Shut the gate behind you.",
      },
      notes: {
        "watertower-panel": {
          title: "Three Breaker Boxes",
          text: "Theo again. You found the panel. Good. Now listen close.\n\nThree breaker boxes hang by this panel. The pump house key is in the {pick}. Open that one, and take the key.\n\nOpen neither of the other two boxes! They are live. The shock kills. Do not touch them at all.\n\nThe pump house door is at the back of the pump hall. It is at the blue pump end, away from the big red wheel. In the pump house there are filters. There is a water tank and some wire, too.\n\nNeed medicine? St. Anne Annex is the hospital. It is north, up Hill Road. It still has medicine. But it is the most dangerous place in town.",
        },
        "watertower-trail1": {
          title: "Dev's Note to Ruby",
          text: "Ruby, it's Dev. If you are reading this, you came west. You found me. Well, almost. I am sorry I left.\n\nI am safe. Theo lets me and Mr. Ortiz sleep up in the tower. It is high and dry. Nothing climbs up there. We help Theo keep the pumps running. I fix the small stuff. Mr. Ortiz fixes the big stuff.\n\nI go out on runs sometimes. If I am out when you come, wait here. Please wait. Do not go looking for me.\n\nTheo left a note for travelers. It is in the pump hall, between the crates. They are near the big red wheel. Read it. It is about the ring.",
        },
        "watertower-trail2": {
          title: "Theo's Note for Travelers",
          text: "For travelers. From Theo, who tends the pumps.\n\nA key lies on the floor beside the green tanks. It is a small brass key. It hangs on a purple school lanyard.\n\nIt opens the principal's closet at Lincoln Middle School. The school is far east of here, across town.\n\nMax and Mia, the twins, came here. They were looking for their teacher. I gave them water. Mia had this key. They left it with me for the ring.\n\nThe principal's closet has a fussy lock. The wrong key jams it. Then only a crowbar opens it. So take this one east. Then come back for water.",
        },
        "watertower-dead1": {
          title: "Theo's Water Rules",
          text: "WATER RULES. Written on a card by Theo. Pinned by the pumps.\n\nOne jug per person each day.\nKids get two.\nNobody leaves thirsty.\n\nThat is it. Three rules. Theo does not like long lists. Nobody argues with Theo's rules.\n\nThe card is soft from many hands. Someone tried to add a fourth rule. It said: Theo gets three jugs. Theo crossed it out. Next to it he wrote: no.\n\nAt the bottom there is a tally. It counts every jug Theo gave away. The marks fill the whole back of the card. Then they go onto the wall. Theo is fair like that.",
        },
        "watertower-dead2": {
          title: "Paper Plate Note",
          text: "Written in marker on a paper plate. No name on it.\n\nPUMP HOUSE KEY: in the {decoyPick}. Just open it and grab it. Easy!\n\nIt sounds simple. The plate is from a party, with little balloons on the rim. The marker is faded.\n\nThis note is old. Theo rewired the breaker boxes after it was written. Then he moved the key. The box this plate names is live now. Open it, and the shock kills.\n\nTheo's note on the control panel says which box is safe. Read that one first.",
        },
      },
      signs: {
        "watertower-sign1": { title: "City Sign", text: "CITY WATER WORKS. STAFF ONLY. Below it, in red: DANGER. Pumps start without warning. Keep hands clear." },
        "watertower-sign2": { title: "Big Chalk Letters", text: "Big chalk letters across the wall: Ruby, I am here. It is signed with a D. The D is underlined twice." },
        "watertower-sign3": { title: "Chalk Circle", text: "A chalk circle with a key inside. It is by the tool crib door, in the boat workshop. Under it: Key not here. Read the notes." },
        "watertower-sign4": { title: "Pump House Door", text: "PUMP HOUSE. KEEP LOCKED. Theo wrote under it: Key in a breaker box by the control panel. Read my note there first. Two are live." },
      },
      key: { name: "Brass key, purple school lanyard", tag: "A small brass key on a purple school lanyard. The tag says: Go Lions. A little lion is drawn on it." },
    },

    lumberyard: {
      blurb: "Ridge Lumber on the east ridge, stacked high with wood.",
      door: {
        title: "Ruby's Spray Paint",
        text: "Ruby. I spray-painted this so you can read it from the road.\n\nLumber is in the long racks in the middle. One more stack is out back, by the log pile. A big walker stands there.\n\nAt least eight walkers are inside. A crowd gathers by the loading dock and the flatbed truck. Stay away from the dock.\n\nThe kiln shed is locked. The yard boss left a note on a clipboard. It is by the band saw. Quiet in there. No saws.",
      },
      notes: {
        "lumberyard-rack": {
          title: "Carla's Clipboard",
          text: "Carla here! I am the yard boss. Read this whole thing!\n\nThe kiln shed padlock opens with a code. The code is {code}. Say it in your head: {codeSpoken}. Get it right the first time. A wrong code locks the old padlock up for good. After that, only a crowbar opens it.\n\nLeave the band saw shop by its door. Follow the back wall of the rack hall toward the log pile. The kiln shed door is in that wall.\n\nInside, the lumber is dry. That is the good stuff. There are nails, too.\n\nNow the big rule. DO NOT RUN THE SAWS. Not once. The noise brings the whole dock crowd.",
        },
        "lumberyard-trail1": {
          title: "Boats for the Convoy",
          text: "Carla again! Big news, so read close.\n\nMy crew is building boats. Flat boats, for the River Convoy. We use the yard's best planks. Only the straight ones. Only the dry ones. A boat is only as good as its worst board. We sand them by hand. No saws, ever.\n\nSergeant Vega comes by every week. Vega checks the boats and checks my list. Then Vega frowns at the river. The river is still too high. We cannot launch them yet. So the boats sit here and wait. So do we.\n\nMy other note is out back in the yard. It is near the log pile. Go read it!",
        },
        "lumberyard-trail2": {
          title: "The Bookmark Key",
          text: "Carla, yard boss. This one is about the key ring.\n\nA key lies on the floor of the sales office. It is beside the wooden bear. Look low. It is a long, old-fashioned key. It has a round loop for a handle. It is tied to a paper bookmark.\n\nIt opens the rare book room at the Public Library. The library is north and west of here.\n\nMrs. Greer paid me with this key. She bought planks to board up her library windows. So the key lives here now, in the ring.\n\nThe rare book room has an old lock that bites. The wrong key snaps off inside it. Then that key is gone for good.",
        },
        "lumberyard-dead1": {
          title: "Carla's Yard Rules",
          text: "RIDGE LUMBER YARD RULES. Read them. Follow them. No excuses.\n\nWear boots. Steel toes, if you have them. Lift with your legs, not your back. Never run the saws.\n\nIt is Carla's list, in her big letters. They fill the page edge to edge. Below the list, a new rule was added. It is in a different pen. The pen pressed so hard it tore the paper.\n\nIf you hear the dock crowd, freeze.\n\nCarla underlined freeze three times. Do not run. Do not drop your boards. Stand still until the sound moves away. Then walk away slowly. Somebody learned that the hard way.",
        },
        "lumberyard-dead2": {
          title: "Code on a Receipt",
          text: "Scrawled on the back of a receipt. The pen skipped. It was written in a hurry.\n\nKILN SHED CODE: {decoyCode}. Got it off the clipboard. Hurry.\n\nIt looks right. It says it came from the clipboard. But look at the date on the receipt. It is from months ago.\n\nCarla changed the padlock after that. This is the old code. Spin it in, and the old padlock locks up for good. Then only a crowbar opens it.\n\nDo not rush. Go find Carla's clipboard by the band saw. It has the code that works now. Read twice, spin once.",
        },
      },
      signs: {
        "lumberyard-sign1": { title: "Big Painted Sign", text: "Ridge Lumber. Cut to order. Since 1962. Ask at the counter for a price. Under it, in chalk: Prices are free now." },
        "lumberyard-sign2": { title: "Spray paint", text: "Ruby's red R, with an 8 under it. Below, in drippy letters: THEY GATHER AT THE DOCK. STAY AWAY." },
        "lumberyard-sign3": { title: "Safety Sign", text: "SAFETY FIRST. Ear protection needed near the saws. Under it, in Carla's marker: The saws stay off. Period." },
        "lumberyard-sign4": { title: "Paint on the Shed", text: "Spray paint on the kiln shed door. CODE ON THE CLIPBOARD. A big arrow points toward the saw shop." },
      },
      key: { name: "Old key with bookmark tag", tag: "A long, old-fashioned key. It has a round loop for a handle. It is tied to a paper bookmark. The bookmark says: Handle with care." },
    },

    mall: {
      blurb: "Northgate Mall in the north: goods everywhere, and the worst crowds.",
      door: {
        title: "Jo's Note on the Doors",
        text: "Jo here, from 88.1.\n\nFood is in the food court, at the back. Medicine is in the pharmacy, on the left. Wire is in the gadget store, on the right. It is next door to the orange tent.\n\nAt least nine walkers are inside. Many stand along the main hall. Watch the group, not one walker.\n\nThe security office is locked. The guard's note is in the play area, by the green dino. Read it. It will keep you alive.",
      },
      notes: {
        "mall-guard": {
          title: "Luis Left the Code",
          text: "My name is Luis. I am a security guard here. I still am.\n\nDo this in order. First, turn off the alarm. Its panel is on the left wall, by the rocking horse. Press the {button} button. Do that first!\n\nThen go to the office. Take the kitchen door at the back of the food court. Turn right. The office is behind the green dino. The code is {code}. Say it like this: {codeSpoken}.\n\nA wrong button sets off the mall alarm. So does a wrong code. So does opening the office with the alarm still on. Then walkers pour in, even through the front doors. They come until they get you.\n\nInside are gun parts, radio parts, and a tool kit.\n\nThe walkers here run at anyone who runs. So walk, and most of them stay put.",
        },
        "mall-trail1": {
          title: "Luis Holds His Post",
          text: "Luis again. Guard's log, sort of.\n\nI have stayed at my post since the Fall began. Every day. I watch the crowd from the balcony. I know their habits now. They walk the same slow loop. Every day, the same path. Past the fountain, past the shoe store, back again.\n\nSergeant Vega came by last month. Vega asked me to join the River Convoy. I said no. Someone has to watch the mall. If I leave, who warns people? Vega did not argue much.\n\nMy other note is in the sports store. It is beside the orange tent. Read it. It is about a key.",
        },
        "mall-trail2": {
          title: "A Key from Doc Lin",
          text: "Luis. This is about the key ring.\n\nA key lies on the floor of Toy Town. It is beside the rocking horse. It is a small silver key. It has a white tag with a red cross.\n\nIt opens the supply cupboard at St. Anne Annex. That is the hospital, far west of here. It is up in the north hills.\n\nDoc Lin left it with me on a medicine run. It is for the ring. Nurse Ada wants the cupboard used, not saved.\n\nThe supply cupboard has a plain lock. A wrong key just will not turn.",
        },
        "mall-dead1": {
          title: "Luis's Patrol Log",
          text: "PATROL LOG. Northgate Mall. Guard on duty: Luis.\n\nMonday: Crowd quiet. Nobody running. Doors held.\nTuesday: Crowd quiet. Nobody running. Doors held.\nWednesday: Crowd quiet. Nobody running. Doors held.\n\nThe log goes on like that for pages. Same three lines, day after day. The handwriting gets smaller. The pen gets lighter. Luis does not get many visitors.\n\nThen one day is different. It says: Jo came by with batteries. Stayed for coffee. Good day. Jo's name is underlined twice.\n\nThere is a little star drawn next to it. The next day goes back to normal. Crowd quiet. Nobody running. Doors held.",
        },
        "mall-dead2": {
          title: "Pencil Note, No Name",
          text: "A note in pencil, folded small. No name at the bottom.\n\nSECURITY OFFICE CODE IS {decoyCode}. Trust me. I watched the guard type it.\n\nIt sounds sure. Maybe the writer really did watch the guard.\n\nBut the paper is yellow and soft. It has been folded and unfolded many times. This is the old code. Luis changed it after this note was written. Type it now, and the mall alarm goes off.\n\nDo not guess at a keypad here. Luis's clipboard, by the green dino, has the code that works now. Use that one.",
        },
      },
      signs: {
        "mall-sign1": { title: "Mall Banner", text: "Northgate Mall. Something for everyone! Shop, eat, and play. Open seven days a week. Someone added in marker: Even walkers." },
        "mall-sign2": { title: "Spray paint", text: "Ruby's red R by the front doors, with a 9 under it. Under that, in huge letters: DON'T RUN. The letters are taller than you." },
        "mall-sign3": { title: "Store Map", text: "STORE MAP. You are here. The jewelry vault is marked inside the gadget store, at its front wall. Someone circled it in pen." },
        "mall-sign4": { title: "Security Door Sign", text: "SECURITY. STAFF ONLY. Under it, in marker: Code on the clipboard by the green dino. Do not guess." },
      },
      key: { name: "Silver key, red cross tag", tag: "A small silver key on a white tag. The tag has a red cross on it. It says: Ada says use it." },
    },

    library: {
      blurb: "The Public Library north of downtown, with books, maps, and a librarian.",
      door: {
        title: "Mrs. Greer's Book Drop",
        text: "From Mrs. Greer, the librarian. Welcome, reader.\n\nBooks are in the stacks on both sides of the main hall. More are in the children's room, by the toy castle.\n\nAt least eight walkers are inside. Two of them stand in the main hall. Please do not run past them.\n\nThe archive room is locked. My note is on the reference desk. It is by the giant globe, back left. Quiet feet, please.",
      },
      notes: {
        "library-desk": {
          title: "Three Big Books",
          text: "Mrs. Greer again. Since you are reading, you are welcome here.\n\nThree big books sit on this desk. The archive key is inside the {pick}. Open that one, and the key is there.\n\nOpen neither of the other two books! I hid a blast trap in each one, for book thieves. It kills. Pick the right book.\n\nThe archive door is at the back end of the main hall. It sits between two rooms. One has the giant globe. One has the tall clock. Inside are books and a folder of city maps.\n\nReading saved this building. The walls are stacked with books. They are the books nobody wanted.",
        },
        "library-trail1": {
          title: "The Class Lives Here Now",
          text: "Mrs. Greer. A note for anyone who asks about the children.\n\nMs. Adler's class lives here now. They came north from Lincoln Middle School. I took them in on the first night. They read by window light. They keep quiet. They are very good at quiet now. Better than any class I ever had.\n\nMs. Adler still watches the front door. She waits for the twins, Max and Mia. Two of her students are still missing. She will not stop looking. If you see two lost twins, send them here.\n\nMy other note is in the periodicals room. It is beside the tall clock.",
        },
        "library-trail2": {
          title: "A Key for the Mall",
          text: "Mrs. Greer. Here is the note about the key.\n\nA key lies on the floor of the children's room. It is beside the toy castle. It is a tiny gold key. It is in a small velvet pouch. The pouch is dark blue.\n\nIt opens the jewelry vault at Northgate Mall. The mall is east of here.\n\nLuis the guard sent it to me with Jo. He asked me to keep it for the ring.\n\nThe jewelry vault has a fussy lock. The wrong key jams it. Then only a crowbar opens it. Few people read the notes. You did.",
        },
        "library-dead1": {
          title: "Class Reading Chart",
          text: "MS. ADLER'S CLASS READING CHART. One star for every book you finish!\n\nThe chart is long. It is taped across two tables. Every student's name is on it. Most rows are full of gold stars. Some rows run off the edge. Someone taped on extra paper. The stars are cut from candy wrappers.\n\nTwo names have no stars yet. Max. Mia.\n\nTheir rows are empty. But they are not crossed out. Next to them, in neat pencil: saving their stars. Ms. Adler checks it every evening.\n\nThere is a small envelope pinned there, too. It is full of gold stars. It is waiting.",
        },
        "library-dead2": {
          title: "Index Card Tip",
          text: "An index card, left just inside the front door. No name on it.\n\nARCHIVE ROOM KEY: inside the {decoyPick}, on the reference desk. You're welcome.\n\nIt sounds like a librarian's tip. The writing is neat. The card is from the library's own box.\n\nBut a thief read this card once. After that, Mrs. Greer moved the key. Then she set her traps. The book this card names holds a blast trap now. Open it, and it kills.\n\nMrs. Greer's note on the desk says which book is safe. Read hers before you open any book.",
        },
      },
      signs: {
        "library-sign1": { title: "QUIET, PLEASE", text: "QUIET, PLEASE. Thank you for respecting other readers. Under it, in pencil: It works on walkers too. Seriously." },
        "library-sign2": { title: "Very Small Spray Paint", text: "Ruby's red R, with an 8 under it. Both are painted very small. Like she felt bad writing on a library wall." },
        "library-sign3": { title: "Library Hours", text: "LIBRARY HOURS: Dawn until dark. Below it: No candles near the books. Fire is worse than walkers." },
        "library-sign4": { title: "Chalk by the Archive", text: "This chalk is by the archive room door. It says: Ask Mrs. Greer's note first. Then open a book. A smiley face sits next to it." },
      },
      key: { name: "Tiny gold key, velvet pouch", tag: "A tiny gold key in a small velvet pouch. A paper tag is tied to the pouch. It says: Not for show." },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
