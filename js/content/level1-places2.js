/* Reading level 1: places, part 2 (police, school, firehouse, hospital, watertower, lumberyard, mall, library).
   Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[1] = root.ZSR.TEXT[1] || { level: 1 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    /* ---------- 4th Precinct ---------- */
    police: {
      blurb: "Gun parts and armor, five walkers deep.",
      door: {
        title: "Notice Board",
        text: "Gun parts are in the squad room. An armor plate waits on the right. It is in the garage room.\n\nFive walkers at least. One is big. It waits in the garage room.\n\nThe armory is locked. The code is on my note. Look on the front desk.\n\n—Sergeant Vega",
      },
      notes: {
        "police-desk": {
          title: "The Armory Code",
          text: "This is Vega. I am tired. I keep this short.\n\nThe armory lock is a dial. The code is 19-4-33. Spin right to 19. Spin left to 4. Spin right to 33. Then pull. The door opens. You can open it now. Gun parts are inside. So is an armor plate. Take what you need.\n\nWant books? Go to the Public Library. It is north of downtown. Its books are in the archive room. The librarian stayed. She is still there.\n\n—Sergeant Vega",
        },
        "police-trail1": {
          title: "The Convoy Is Real",
          text: "The River Convoy is real. It is not a joke. Trucks and boats go north. They take the river road. They leave the crowds behind us.\n\nBut we keep putting it off. The river is too high. The trucks need parts. So we wait some more.\n\nDo you want to come? Sign up with Chief Dunn. He is at Station 12.\n\nFind my next note. It is in the squad room. Go through the door behind the desk. Look in the back left corner.\n\n—Sergeant Vega",
        },
        "police-trail2": {
          title: "Vega's Squad Room Key",
          text: "You read this far. Good. Here is a key.\n\nIt is in this squad room. Look in the front left corner. It is on the floor. It is by the left wall. It is a padlock key. A loop of orange rope holds it.\n\nIt opens the foreman's lockbox. That is at Ridge Lumber. Go east, up on the ridge. Carla builds boats there for the convoy. She gave me this key. Now the key ring stays whole. No key stays home.\n\n—Sergeant Vega",
        },
        "police-dead1": {
          title: "Lost and Found",
          text: "LOST AND FOUND. Front desk list.\n\nOne bike. It is blue. The front wheel is bent.\nOne trumpet. It still plays. Not well.\nOne dog leash. No dog.\n\nNo one comes back for these. The bike still leans on the wall. The trumpet sits in a box. The leash hangs by the door.\n\nA new line is at the bottom. It is in a new pen. The letters are big and slow. It says: One town.",
        },
      },
      signs: {
        "police-sign1": { title: "Red spray paint", text: "Ruby's red R. A 5 under it. ONE BIG ONE IN THE GARAGE. DON'T GET CORNERED." },
        "police-sign2": { title: "Wanted board", text: "The old wanted board. Now it is full of missing notes. One says: Ms. Adler's class. Lincoln Middle School." },
        "police-sign3": { title: "RIVER CONVOY", text: "RIVER CONVOY. Trucks and boats, going north. Sign up at Station 12. Ask for Chief Dunn." },
        "police-sign4": { title: "ARMORY", text: "ARMORY. POLICE ONLY. Under it, in black marker: Code changed. See the front desk." },
      },
      key: { name: "Padlock key on orange rope", tag: "The tag says: Foreman's lockbox. Knock first. It is a padlock key. It hangs on orange rope." },
    },

    /* ---------- Lincoln Middle School ---------- */
    school: {
      blurb: "Classrooms of books, maps in the closet.",
      door: {
        title: "Max and Mia's Note",
        text: "Hi! We are Max and Mia. Books are in two rooms. The back right classroom. The bottom left room.\n\nFour walkers at least. One is in the hallway.\n\nThe library closet is locked. Find the teacher's note. It is in the back left classroom. It tells where the key is.\n\n—Max and Mia",
      },
      notes: {
        "school-classroom": {
          title: "Ms. Adler's Desk Drawer",
          text: "This is my room. I am Ms. Adler. I teach here.\n\nThe library closet key is here. It is in my desk. Open the top drawer. The key is at the back. Now you can open the closet. Books are inside. So is a folder of city maps. Take them. Maps help you find your way.\n\nNorthgate Mall is north of here. It has food. It has meds and wire. But its crowds are the worst. Go slow. Go with a plan.\n\n—Ms. Adler, teacher",
        },
        "school-trail1": {
          title: "For Max and Mia",
          text: "Max. Mia. If you read this, you came back. I am so glad.\n\nThe class is north of here now. We are at the Public Library. Mrs. Greer takes us in. Every kid is safe. I count them each night. Each one but you two.\n\nI will come back here to check. I come when I can.\n\nSergeant Vega came to look for us. Vega left a note too. It is in the back right classroom. Look in its back right corner.\n\n—Ms. Adler",
        },
        "school-trail2": {
          title: "Vega Finds an Empty School",
          text: "Sergeant Vega here. Max and Mia asked me for help. They want their class back. So I came. The school is empty. No class. No teacher.\n\nI leave a key for the ring. It is in the back left classroom. It sits by the left wall. Look near the back. It is a short steel key. It has a gray tag.\n\nIt opens the evidence locker. That is at the 4th Precinct. It is west of here. Each key hides in a new place. That is the ring.\n\n—Sergeant Vega",
        },
        "school-dead1": {
          title: "Lunch This Week",
          text: "LUNCH THIS WEEK.\n\nMonday: tacos.\nTuesday: soup and rolls.\nWednesday: fish sticks.\nThursday: pasta and corn.\nFriday: PIZZA!\n\nA kid drew stars next to Friday. Lots of stars. Some are in pen. Some are in green crayon.\n\nThe page is curled at the edges. It still hangs by one tack.\n\nA kid wrote at the bottom. We never got the pizza.\n\nUnder that is a small sad face.",
        },
      },
      signs: {
        "school-sign1": { title: "Class poster", text: "RAISE YOUR HAND. BE KIND. READ EVERY DAY. Under it, in marker: Stay together." },
        "school-sign2": { title: "Red spray paint", text: "Ruby's red R. A 4 under it. Then: One in the hallway." },
        "school-sign3": { title: "Neat chalk letters", text: "In neat chalk letters: Ms. Adler's class, gone north. Read the note by the front door." },
        "school-sign4": { title: "LIBRARY CLOSET", text: "LIBRARY CLOSET. Return books on time. Someone adds in pen: Late fees canceled." },
      },
      key: { name: "Short steel key, gray tag", tag: "The gray tag says: Evidence. Do not remove. But \"do not\" is crossed out. A short steel key." },
    },

    /* ---------- Station 12 ---------- */
    firehouse: {
      blurb: "Tools and water tanks at Station 12.",
      door: {
        title: "Chief Dunn's Bay Door",
        text: "Station 12. Here is the list.\n\nTool kit: back office. Use the door behind the desk. Water tank: truck bay, on the right. Walkers: four at least. One is in the truck bay.\n\nThe equipment bay is locked. My note is on the front desk. Read it first.\n\n—Chief Dunn",
      },
      notes: {
        "firehouse-desk": {
          title: "The Red Key",
          text: "Chief Dunn here. This is the watch desk. I keep lists. So here is one.\n\nOne. Look at the key board. Two. Find the red key. It is the only red one. Three. It opens the equipment bay. Go open it now. Four. Take what is inside. There is a water tank. There is lumber. There are tools.\n\nNeed water filters? Go to the Water Tower. It is on the west side. Filters are in its pump house.\n\n—Chief Dunn",
        },
        "firehouse-trail1": {
          title: "Convoy List",
          text: "CONVOY LIST. Chief Dunn.\n\nThe River Convoy goes north. It takes the river road. Here is what goes. Two fire trucks. Sergeant Vega's van. Carla's boats.\n\nMr. Ortiz fixed both trucks. He did it before he went west. They run well now.\n\nThe leave day keeps moving. It has moved three times. The river is still too high.\n\nMy second note is in back. Find the back office. Look in the back left corner.\n\n—Chief Dunn",
        },
        "firehouse-trail2": {
          title: "The Lightning Bolt Key",
          text: "You found my second note. Good. Now the key.\n\nIt is in this back office. Look in the front left corner. It sits by the left wall. It is a small silver key. Its yellow tag is a lightning bolt.\n\nIt opens the repair locker. That is at Signal Electronics. It is downtown, east of here. Priya left it with me. She fixed our radios for the convoy. Keys in the ring never stay home. So this one waits here.\n\n—Chief Dunn",
        },
        "firehouse-dead1": {
          title: "Station 12 Chili",
          text: "STATION 12 CHILI. Feeds the whole crew.\n\nYou need:\nBeans.\nMore beans.\nWhat is in the can. Any can.\n\nDump it all in the big pot. Stir it well. Cook it slow. Slow is the trick. Do not rush good chili.\n\nA grease spot sits on the corner. The page smells like smoke.\n\nThe last line is in big letters. Never let Vega cook.\n\n—Chief Dunn",
        },
      },
      signs: {
        "firehouse-sign1": { title: "TRUCK BAY", text: "TRUCK BAY. KEEP CLEAR. Big red letters, tall as a kid." },
        "firehouse-sign2": { title: "Safety board", text: "DAYS WITHOUT AN ACCIDENT. The number is wiped off. In marker: We stopped counting." },
        "firehouse-sign3": { title: "Red spray paint", text: "Ruby's red R. A 4 under it. Then: One in the truck bay." },
        "firehouse-sign4": { title: "Chalk by the door", text: "Chalk by the equipment bay door. Red key. On the board." },
      },
      key: { name: "Silver key, lightning bolt tag", tag: "The yellow tag says: Repair locker. Fix it, don't toss it. A small silver key. The tag is a lightning bolt." },
    },

    /* ---------- St. Anne Annex ---------- */
    hospital: {
      blurb: "Meds and a generator, worst in town.",
      door: {
        title: "On the Ambulance Doors",
        text: "Med kits: in the top hall rooms. More are in the bottom left room. The generator: bottom right room.\n\nSix walkers at least. They stand in the dark rooms. Look before you step in.\n\nThe stock room is locked. The nurse's note: top hall.\n\n—Doc Lin",
      },
      notes: {
        "hospital-hall": {
          title: "Nurse Ada's Badge",
          text: "Nurse Ada. Day shift, night shift. Every shift. I stayed.\n\nThe pharmacy stock room needs a badge. The badge is in the drawer. The drawer is under this station. Hold the badge to the pad. The light turns green. Now you can open the stock room. Three med kits are inside. Take them. People need them.\n\nOne rule here. Stay quiet. These walkers follow sound. Light does not bother them much. Sound does. Walk soft. Shut doors with care.\n\n—Nurse Ada",
        },
        "hospital-trail1": {
          title: "Ada's Night Log",
          text: "Log. Nurse Ada.\n\nI stay for two things. The records. The cold meds. Both need the generator. So I keep it running.\n\nEach night I turn on the radio. Jo is on 88.1. I wait for word from Doc Lin. Jo says Lin is coming. Lin will ride with the River Convoy. But the convoy is late. Late again.\n\nI keep the lights low. I keep the kettle warm.\n\nFind my next note. It is in the top right room. Look in its back right corner.\n\n—Ada",
        },
        "hospital-trail2": {
          title: "The Square Iron Key",
          text: "Note two. Read it all.\n\nA key waits up here. Go to the top row of rooms. Count from the left. Go into the second room. Look in its back right corner. The key is heavy and old. It is iron. It has a square head.\n\nIt opens the old safe room. That is at Gas-N-Go. It is south of here. It sits at the town's south end. Ruby brought it up. It was her first scout run north. Now the ring closes. It is a full circle.\n\n—Nurse Ada",
        },
        "hospital-dead1": {
          title: "Visitor Sign-In Sheet",
          text: "VISITOR SIGN-IN. Please print your name.\n\nThe sheet is full of names. Some are neat. Some are scrawls. Each one has a time.\n\nThe last line is quick and sharp. Doc Lin. Next to her name are two words. Back tomorrow.\n\nNo name comes after hers. The pen still hangs on its string. The page is gray with dust.",
        },
      },
      signs: {
        "hospital-sign1": { title: "QUIET ZONE", text: "QUIET ZONE. PATIENTS RESTING. Under it, in Ada's neat hand. They follow sound, not light." },
        "hospital-sign2": { title: "Red spray paint", text: "Ruby's red R. A 6 under it. They stand in the dark rooms. Look before you step in." },
        "hospital-sign3": { title: "Hospital map", text: "HOSPITAL MAP. Wards along the top hall. A box marks the supply cupboard. It is in the top left room." },
        "hospital-sign4": { title: "Chalk by the door", text: "In chalk, by the stock room door. It is Ada's writing. Lin, it is all still here." },
      },
      key: { name: "Heavy iron key, square head", tag: "The tag says: Old safe room. Ruby was here. The key is heavy, old iron. Its head is square." },
    },

    /* ---------- Water Tower ---------- */
    watertower: {
      blurb: "Water filters, out on the west side.",
      door: {
        title: "On the Fence Gate",
        text: "Water filters are on the floor. Look by the crates. Four walkers at least. They are in the pump building. Go slow.\n\nThe pump house is locked. My note is on the panel inside. It tells you how to get in.\n\nBe fair. Take what you need.\n\n—Theo, I tend the pumps",
      },
      notes: {
        "watertower-panel": {
          title: "Theo's Panel Note",
          text: "This is Theo. I tend the pumps. Quiet work. I like it.\n\nFind the breaker box. The pump house key is there. The box is gray, on the wall. Open the lid. The key hangs on a nail inside. Now you can open the pump house. Filters are in there. A water tank too. And wire.\n\nNeed meds? St. Anne Annex is the hospital. Take the river road north. It still has meds. It is the worst place in town. Do not go alone.\n\n—Theo",
        },
        "watertower-trail1": {
          title: "Dev to Ruby",
          text: "Ruby,\n\nIt's me, Dev. I am safe. I mean it. Theo lets us stay. Mr. Ortiz and I sleep up top. It sways a bit in the wind. You get used to it.\n\nWe help Theo keep the pumps running. I fix stuff. Mr. Ortiz fixes my fixes.\n\nAm I out on a run? Wait here. Please. Do not go looking.\n\nTheo has a note for travelers. Look at the back, between the crates.\n\n—Dev",
        },
        "watertower-trail2": {
          title: "For Travelers, From Theo",
          text: "For travelers. From Theo.\n\nA key waits in here. It is on the floor. Look in the front left corner. It is a small brass key. It hangs on a purple school lanyard.\n\nIt opens the principal's closet. That is at Lincoln Middle School. The school is far east, across town. Max and Mia came by. They look for their teacher. Mia had this key. They left it with me. It is for the ring. Now it waits for you.\n\n—Theo",
        },
        "watertower-dead1": {
          title: "Theo's Water Rules",
          text: "THEO'S WATER RULES.\n\nThe card is wet at the edges. The ink still holds.\n\nOne jug per person. Each day.\nKids get two jugs.\nNobody leaves thirsty.\n\nThat is all of it. No rule on who you are. No rule on where you come from. No rule on what you bring.\n\nAt the bottom, in small print. Ask, and I fill it. Do not take the hose.\n\n—Theo",
        },
      },
      signs: {
        "watertower-sign1": { title: "WATER WORKS", text: "WATER WORKS. STAFF ONLY. DANGER: Pumps start without warning." },
        "watertower-sign2": { title: "Big chalk letters", text: "Big chalk letters: Ruby, I am here. It is signed with a D." },
        "watertower-sign3": { title: "Chalk circle", text: "Chalk circle, key inside. Arrow to the tool crib, back left. Key not here. Read the notes." },
        "watertower-sign4": { title: "PUMP HOUSE", text: "PUMP HOUSE. KEEP LOCKED. A small sign is next to it. BREAKER BOX. DANGER." },
      },
      key: { name: "Brass key, purple school lanyard", tag: "The lanyard tag says: Principal's closet. Go Lions. A small brass key. A purple school lanyard." },
    },

    /* ---------- Ridge Lumber ---------- */
    lumberyard: {
      blurb: "Lumber stacks, a dock full of walkers.",
      door: {
        title: "Spray Paint on the Gate",
        text: "Lumber: in the racks. Middle and back. Walkers: five at least. They bunch up by the loading dock. Stay off the dock.\n\nKiln shed: locked. The yard boss left a note. It is on the paint rack. Read it. Then go in.\n\nDon't be loud.\n\n—Ruby",
      },
      notes: {
        "lumberyard-rack": {
          title: "Carla's Kiln Code",
          text: "HEY. YOU. Yes, you. I'm Carla. I run this yard. Welcome!\n\nThe kiln shed has a padlock. The code is 2218. Spin it in. Pull hard. It sticks a bit. Then the shed opens. Dry lumber is in there. Nails too. Take some. Build something good.\n\nNow the big rule. DO NOT RUN THE SAWS. Not even once. The noise brings the dock crowd. The whole crowd. Trust me on this one.\n\n—Carla, yard boss",
        },
        "lumberyard-trail1": {
          title: "Boat News From Carla",
          text: "BOAT NEWS, from Carla!\n\nMy crew builds flat boats. They are for the River Convoy. We use the yard's best planks. Only the best. These boats will float. I swear it.\n\nSergeant Vega comes by each week. Vega checks the boats. Vega nods a lot. That means good.\n\nBut the river is still too high. We can't launch yet. So we wait. And we sand.\n\nFind my other note. It is on the back wall. Look in the middle.\n\n—Carla",
        },
        "lumberyard-trail2": {
          title: "The Bookmark Key",
          text: "You found it! Good reader. Here's the deal.\n\nGo to the front left corner. A key lies there. It is on the floor. Look between the counter and the crates. It is long and old. Its handle is a round loop. A paper bookmark is tied on.\n\nIt opens the rare book room. That is at the Public Library. Go north and west from here. Mrs. Greer paid me with this key. I gave her planks for her windows. So it lives here now. That is the ring.\n\n—Carla",
        },
        "lumberyard-dead1": {
          title: "Yard Rules",
          text: "YARD RULES, by Carla. Read them. Live by them.\n\nOne. Wear boots. Real boots.\nTwo. Lift with your legs. Not your back.\nThree. Never run the saws. NEVER.\n\nA new line is at the bottom. It is in a new pen. Blue, not black. The letters lean hard.\n\nFour. Hear the dock crowd? Freeze. Do not move. Do not talk. Wait it out.",
        },
      },
      signs: {
        "lumberyard-sign1": { title: "Painted yard sign", text: "Ridge Lumber. Cut to order. Big white paint on a long board." },
        "lumberyard-sign2": { title: "Red spray paint", text: "Ruby's red R. A 5 under it. THEY GATHER AT THE DOCK. STAY AWAY." },
        "lumberyard-sign3": { title: "SAFETY FIRST", text: "SAFETY FIRST. Ear protection needed near the saws. Carla adds in marker. The saws stay off." },
        "lumberyard-sign4": { title: "Spray paint", text: "Spray paint on the kiln shed door. CODE ON THE CLIPBOARD." },
      },
      key: { name: "Old key tied to a bookmark", tag: "The bookmark says: Rare books. Handle with care. A long, old key. Its handle is a round loop." },
    },

    /* ---------- Northgate Mall ---------- */
    mall: {
      blurb: "Food, meds, wire, and the biggest crowd.",
      door: {
        title: "Jo's Mall Warning",
        text: "Jo here. Off the air, on the door.\n\nFood, meds, and wire are all over. Six walkers at least. They move as one big group. Watch the group, not one.\n\nThe security office is locked. The guard left a note. It is by the paint display.\n\n—Jo",
      },
      notes: {
        "mall-guard": {
          title: "The Guard's Code",
          text: "My name is Luis. I guard this mall. I still do. Nobody told me to stop.\n\nThe security office code is 0912. Punch it in on the pad. Wait for the click. Then the door opens. You can go in now. Gun parts are inside. Radio parts too. And a tool kit.\n\nNow listen. This part is big. Run, and they all come running. Every one. Walk, and most stay put. So walk. Slow and calm.\n\n—Luis, mall security",
        },
        "mall-trail1": {
          title: "Luis Holds His Post",
          text: "Post log. Luis.\n\nI am still at my post. I have been here since the Fall. I do not plan to leave.\n\nThe crowd here walks a loop. The same slow loop. Every day. Past the shoes. Past the food court. Back again. I know it by heart.\n\nSergeant Vega came by. Vega wants me in the River Convoy. I said no. Someone has to watch the mall.\n\nFind my other note. It is in the back left corner.\n\n—Luis",
        },
        "mall-trail2": {
          title: "The Red Cross Key",
          text: "Second note. Luis again.\n\nA key is on the floor. It is in the front left corner. Look between the counter and the crates. It is a small silver key. Its tag is white. It has a red cross.\n\nIt opens the supply cupboard at St. Anne Annex. That is far west. It is up in the north hills. Doc Lin left it with me. She was on a med run. Nurse Ada wants that cupboard used. Not saved. That is the ring.\n\n—Luis",
        },
        "mall-dead1": {
          title: "Patrol Log",
          text: "PATROL LOG. Luis.\n\nMonday. Crowd quiet. Nobody running. Doors held.\nTuesday. Crowd quiet. Nobody running. Doors held.\nWednesday. Same.\nThursday. Same. Rain on the roof.\n\nFriday. Jo comes by! Jo brings new batteries. Jo stays for coffee. We talk for an hour. The coffee is bad. The talk is good.\n\nSaturday. Crowd quiet. Doors held.",
        },
      },
      signs: {
        "mall-sign1": { title: "Big banner", text: "Northgate Mall. Something for everyone! The banner sags in the middle." },
        "mall-sign2": { title: "Red spray paint", text: "Ruby's red R. A 6 under it. Under that, in huge letters: DON'T RUN." },
        "mall-sign3": { title: "Store map", text: "STORE MAP. YOU ARE HERE. The jewelry vault is marked. It is in the back right corner." },
        "mall-sign4": { title: "SECURITY", text: "SECURITY. STAFF ONLY. Under it, in marker. Code by the paint display." },
      },
      key: { name: "Silver key, red cross tag", tag: "The white tag says: Supply cupboard. Ada says use it. A small silver key. The tag has a red cross." },
    },

    /* ---------- Public Library ---------- */
    library: {
      blurb: "Books both sides, maps in the archive.",
      door: {
        title: "On the Book Drop",
        text: "Welcome. Please keep your voice down.\n\nBook boxes wait in the reading rooms. They are on both sides. Five walkers at least. Two roam the main hall.\n\nThe archive room is locked. My note is in back. Find the back left reading room.\n\nMind the quiet.\n\n—Mrs. Greer, librarian",
      },
      notes: {
        "library-desk": {
          title: "The Dictionary Key",
          text: "Mrs. Greer, at the reference desk.\n\nI hide things in books. Of course I do. The archive key is in the dictionary. It is on this desk. Turn to the K page. K for key. There it is. Now you can open the archive room. Books are inside. So is a folder of city maps.\n\nReading saved this building. Look at the walls. We stack them with books. The books no one wanted. They keep the walkers out.\n\n—Mrs. Greer",
        },
        "library-trail1": {
          title: "Our Guests",
          text: "A note from Mrs. Greer.\n\nMs. Adler's class lives here now. They are good guests. They read by window light. They keep quiet. They wash their own cups.\n\nMs. Adler still watches the front door. She waits for the twins. Max and Mia. Each day she looks. Each night she looks again. I bring her tea. She does not drink it.\n\nMy other note is in back. Find the back right reading room. Look in its back right corner.\n\n—Mrs. Greer",
        },
        "library-trail2": {
          title: "The Velvet Pouch",
          text: "Well done. You read on. Here is your reward.\n\nA key waits in back. Find the back left reading room. It sits by the left wall. Look near the back. It is tiny and gold. It rests in a small velvet pouch.\n\nIt opens the jewelry vault. That is at Northgate Mall. The mall is east of here. Luis the guard sent it. Jo brought it to me. Luis asked me to hold it. I keep it for the ring. Now it is yours to use.\n\n—Mrs. Greer",
        },
        "library-dead1": {
          title: "Class Reading Chart",
          text: "CLASS READING CHART. One star for each book you finish.\n\nThe chart is long. Each name has gold stars. Some rows run off the page. Some kids read fast. Some read slow. All of them read.\n\nTwo rows are empty. Max. Mia. No stars yet.\n\nNext to them, in neat pen. Saving their stars.\n\nA box of stars is taped below. It is still full.",
        },
      },
      signs: {
        "library-sign1": { title: "QUIET, PLEASE", text: "QUIET, PLEASE. Under it, in pencil. It works on walkers too." },
        "library-sign2": { title: "Tiny red paint", text: "Ruby's red R. A 5 under it. Very small, as if she felt bad. It is a library wall, after all." },
        "library-sign3": { title: "LIBRARY HOURS", text: "LIBRARY HOURS: Dawn until dark. Below it: No candles near the books." },
        "library-sign4": { title: "Chalk by the door", text: "In chalk, by the archive room door. Ask the dictionary." },
      },
      key: { name: "Tiny gold key, velvet pouch", tag: "The pouch tag says: Jewelry vault. Not for jewelry. A tiny gold key. A small velvet pouch." },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
