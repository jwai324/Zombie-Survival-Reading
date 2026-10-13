/* Reading level 3: places, part 2 (police, school, firehouse, hospital, watertower, lumberyard, mall, library). Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    police: {
      blurb: "The 4th Precinct, north of downtown: gun parts, an armor plate, and a locked armory.",
      door: {
        title: "Sergeant Vega's Notice",
        text: "Sergeant Vega, 4th Precinct. I pinned this to the board so you see it first.\n\nGun parts are in the squad room, on the left side of the long hall. An armor plate is in the garage on the right, by the riot shields.\n\nAt least eight walkers are inside. A big one waits by the police bike in the garage. Do not let it pin you in a corner.\n\nThe armory is locked. I left the combination on a note at the front desk. Read it before you touch the dial.",
      },
      notes: {
        "police-desk": {
          title: "The Armory Combination",
          text: "Sergeant Vega again. You made it to the front desk, so you are doing fine.\n\nThe armory has a dial lock on a steel door. The combination is 19-4-33. Spin the dial a few times to clear it. Then stop on 19, then 4, then 33. Pull the handle down hard. You can open the armory now.\n\nTake the long hall to the back hall, and head toward the police bike. The armory is the last door before the garage. Inside are gun parts and an armor plate. Take only what you can carry.\n\nOne more thing before you go. The Public Library is north of downtown. It has books in its archive room. The librarian stayed when everyone else left. Her name is Mrs. Greer. She is stubborn, and she is right more often than I am. If you get there, tell her the 4th Precinct says hello.",
        },
        "police-trail1": {
          title: "The River Convoy Is Real",
          text: "Vega here. People keep asking if the River Convoy is just talk. It is not. It is real, and I am the one who has to make it work.\n\nHere is the plan. Trucks and boats go north along the river. We leave the town and the crowds behind us. Upriver there are fewer walkers and more room to grow food.\n\nHere is the problem. It keeps getting delayed. The river is still too high for the boats. The trucks need parts, and parts are hard to find. So we wait, and we fix, and we wait some more.\n\nIf you want a seat, sign up with Chief Dunn at Station 12. He keeps the list, and he never loses it.\n\nThere is more you should know. My next note is in the K9 room, beside the dog kennel. Go read it.",
        },
        "police-trail2": {
          title: "A Key on Orange Rope",
          text: "Vega again. You found the K9 room, so now for the key.\n\nGo back out to the lobby, by the front door. The key lies on the floor beside the coffee machine. It is a padlock key on a loop of orange rope. You cannot miss the rope.\n\nThat key opens the foreman's lockbox at Ridge Lumber. The yard is east of here, up on the ridge. Carla runs it, and she is building boats for the convoy. She gave me this key so the ring stays whole.\n\nYou may not know about the ring yet. Every stash in town is locked. Its key is hidden in another building, with a note that says where. Only people who read can find them. Take what you need and leave the rest.\n\nCarla says to knock before you open her lockbox. She is joking, mostly.",
        },
        "police-dead1": {
          title: "Lost and Found List",
          text: "FRONT DESK: LOST AND FOUND.\n\nThis list was taped to the front desk before the Fall. Someone moved it out here to the garage. Maybe they wanted it out of the way. Maybe they wanted to keep it safe.\n\nItems turned in this month:\nOne bike. Blue, with a bent front wheel. Found by the bus stop.\nOne trumpet. In its case, with sheet music still inside.\nOne dog leash with no dog. Red, and still clipped shut.\n\nNobody came back for any of it. The bike is gone now, and the trumpet is gone too. The leash still hangs on a hook by the desk.\n\nAt the bottom, someone added a line in thick black pen. The letters are pressed hard into the paper. It says: one town.\n\nUnder that, in pencil, another hand wrote: still ours.",
        },
        "police-dead2": {
          title: "Numbers on a Scrap",
          text: "ARMORY: 33-4-19. Spin it slow. Got it from a guy who got it from Vega. Trust me, it works.\n\nThat is all it says. It is a scrap of notebook paper, taped to the wall. The handwriting is fast and sloppy. Whoever wrote it was in a hurry, or scared, or both.\n\nLook closer, though. Those are the right numbers in the wrong order. It is the real combination read backward. Try it on the dial, and the handle will not move. You will stand there, turning the dial. Meanwhile, the big one in this room turns toward you.\n\nDo not waste the time. The note on the front desk has the combination that works. It is in Vega's own writing. Go by that one, not by a guy who knew a guy.",
        },
      },
      signs: {
        "police-sign1": { title: "Ruby's Red R", text: "A big red R by the front door, Ruby's mark, with an 8 sprayed under it. Below that, in quick drippy letters: ONE BIG ONE IN THE GARAGE. DON'T GET CORNERED." },
        "police-sign2": { title: "The Old Wanted Board", text: "WANTED, says the old board, but the wanted faces are gone. Missing-person notes cover every inch now. One says: Ms. Adler's class, Lincoln Middle School. Have you seen them?" },
        "police-sign3": { title: "River Convoy Notice", text: "NOTICE: River Convoy sign-up at Station 12. Trucks and boats, north along the river. Ask for Chief Dunn. Bring your name and your people." },
        "police-sign4": { title: "ARMORY", text: "ARMORY. POLICE ONLY. NO EXCEPTIONS. Under it, in black marker: Combination changed. See the front desk. Do not guess. Guessing takes too long in here." },
      },
      key: { name: "Padlock key on orange rope", tag: "A strip of tape is wrapped around the rope. It says: \"Foreman's lockbox. Knock first.\" The key is a plain padlock key, worn bright. It hangs on a loop of orange rope." },
    },

    school: {
      blurb: "Lincoln Middle School: boxes of books in the classrooms and a locked library closet.",
      door: {
        title: "Max and Mia Were Here",
        text: "Max and Mia here! We are twins, and we go to school here. Well, we did.\n\nThere are two boxes of books. One is in the music room, with the drum set. The other is in the front office, behind the lion statue.\n\nAt least six walkers are inside. One walks the main hallway, back and forth, all day long. Wait until it turns, then go!\n\nThe library closet is locked. The key is in our teacher's note. It is in the science room, at the back on the left, by the big brain. That was our room!",
      },
      notes: {
        "school-classroom": {
          title: "Ms. Adler's Desk Drawer",
          text: "My name is Ms. Adler. I taught science in this room.\n\nThe library closet key is in the top drawer of this desk. The drawer sticks, so pull hard and lift a little. The key is the only one in there. With it, you can open the library closet now. The closet holds books and a folder of city maps. Take the maps first.\n\nGo out to the main hallway and walk toward the drum set room. The library is the room next to it. The closet is in its back corner, on the drum set side.\n\nIf you need food or medicine, try Northgate Mall in the north. It has food, medicine, and wire. But the crowds there are the worst in town. Go only if you must.\n\nPlease be kind to this room. Some of my students will want to come back.",
        },
        "school-trail1": {
          title: "For Max and Mia",
          text: "Max, Mia, this is for you. If anyone else finds it, please leave it here.\n\nI am so sorry we lost you in the rush. I looked for you until dark. Then I had to move the class.\n\nWe have gone north to the Public Library. Mrs. Greer, the librarian, will take us in. She has thick walls and a lot of quiet. Every student is safe and counted. Every student except the two of you.\n\nI will come back here to check whenever I can. If you find this, stay together. Walk, do not run, and go north to the library.\n\nOne more thing. When I came back today, I saw that Sergeant Vega had been here. Vega came looking for our class. Vega left a note in the music room, beside the drum set. Read it.\n\nWith love, Ms. Adler",
        },
        "school-trail2": {
          title: "Vega Checked the School",
          text: "Sergeant Vega. Two kids named Max and Mia came to my station. They asked me to find their class. So I came, and I found this school empty.\n\nNo class, and no twins either. I hope they find the note by the front door.\n\nI did not want the trip to be for nothing. So I left a key here for the ring. Go to the gym. The key lies on the floor, under the basketball hoop. It is a short steel key on a gray tag.\n\nIt opens the evidence locker at the 4th Precinct. That is my station, west of here. The locker has good gear in it.\n\nThat is how the ring works. Every stash is locked, and its key is hidden in another building. A note always says where. Only people who read can find them. So read everything.",
        },
        "school-dead1": {
          title: "The Last Lunch Menu",
          text: "LINCOLN LIONS LUNCH MENU.\n\nMonday: chicken soup and a roll.\nTuesday: tacos, with corn on the side.\nWednesday: noodles with butter, or salad.\nThursday: fish sticks. Sorry.\nFriday: PIZZA!\n\nSomebody drew a little star by Friday. The menu is still pinned to the hall board. The paper has gone yellow, and one corner is torn away. This was the week the Fall began.\n\nUnder the menu, in pencil, a kid wrote one line. The letters lean hard to the right, like they were written fast.\n\nWe never got the pizza.\n\nBelow that, a few other kids added their names. Then somebody wrote: when this is over, pizza for everyone. Nobody has crossed it out. Somebody else drew a pizza slice with a smiling face. It is not a good drawing, but it is a hopeful one.",
        },
        "school-dead2": {
          title: "The Fire Drill Map",
          text: "FIRE DRILL: THIS ROOM.\n\nThe map shows this gym in red. A thick arrow runs out the door and down the hall. It ends at a green square outside.\n\nIf the alarm rings, everyone meets on the sports field. Line up by class. Stay with your teacher. Wait for the head count. Do not go back inside for anything.\n\nIt looks like a plan, and it was a good one once. But the class did not go to the field. Nobody is out there now except walkers. The grass is tall, and the stands are empty.\n\nThe drill map is not the real story. The class went somewhere much safer. Ms. Adler left a note by the front door, just inside. That note says where the class really went. Read that one, and skip the field.",
        },
      },
      signs: {
        "school-sign1": { title: "Classroom Poster", text: "OUR CLASS RULES: Raise your hand. Be kind. Read every day. At the bottom, someone added in green marker: Stay together. Always." },
        "school-sign2": { title: "Ruby's Red R", text: "Ruby's red R, sprayed fast, with a 6 under it. Below, smaller: ONE IN THE HALLWAY. WAIT FOR IT TO TURN, THEN MOVE." },
        "school-sign3": { title: "Chalk on the Wall", text: "In neat chalk letters, like on a chalkboard: Ms. Adler's class, gone north. Under it, just as neat: Read the note by the front door." },
        "school-sign4": { title: "Library Closet Door", text: "LIBRARY CLOSET. Please return all books on time. Someone added in pen, under it: Late fees canceled. Forever. Signed, the students." },
      },
      key: { name: "Short steel key, gray tag", tag: "The gray tag says: \"Evidence. Do not remove.\" Someone crossed out the words \"do not\" with a heavy line. The key is short and steel. It is plain and scratched." },
    },

    firehouse: {
      blurb: "Station 12, a fire station with tools, a water tank, and a locked equipment bay.",
      door: {
        title: "Chief Dunn's Bay Door",
        text: "Chief Dunn, Station 12. Read this all the way through.\n\nA tool kit is in the office, behind the watch desk. A water tank is in the truck bay, on the right wall, past the gear racks.\n\nAt least six walkers are inside, and two are in the truck bay. Go in ready.\n\nThe equipment bay is locked. My note is on the watch desk, by the spotted dog. That dog is only a statue. Take it slow, and keep your way out clear. That is rule one, always.",
      },
      notes: {
        "firehouse-desk": {
          title: "Take the Red Key",
          text: "Chief Dunn. This is the watch desk, and somebody always sat here. Now it is just me, and my lists.\n\nLook at the key board on the wall behind you. Every hook has a label, and most are empty. Take the red key, and only the red one. It opens the equipment bay lock. So you can open the equipment bay now.\n\nThe equipment bay is at the back of the truck bay. It is beside the fire truck, on the gear racks side. In the bay there is a water tank, a stack of lumber, and tools. Load the tank first, since it is the heaviest.\n\nYou will need filters for that water. Go to the Water Tower on the west side. It has filters in its pump house. Theo looks after the pumps out there. Tell him the chief says thanks.",
        },
        "firehouse-trail1": {
          title: "Convoy List, Page One",
          text: "Chief Dunn. I keep lists, so here is the one that matters most.\n\nRIVER CONVOY: WHAT WE HAVE.\nTwo fire trucks, both from this station.\nSergeant Vega's van, full of gear.\nCarla's boats, built at the lumber yard.\n\nThe plan is to leave north along the river. Trucks on the road, boats on the water, all of us together.\n\nMr. Ortiz fixed both trucks before he went west. He did it with half the parts he needed. I owe that man a hot meal.\n\nThe bad news is the date. The leaving day has moved three times now. The river is still too high, and the boats cannot launch yet. So we wait.\n\nI wrote a second note for you. It is in the bunk room, near the brass pole.",
        },
        "firehouse-trail2": {
          title: "Priya's Lightning Bolt Key",
          text: "Chief Dunn again. Good, you found the bunk room.\n\nNow go back to the truck bay. A key lies on the floor beside the fire truck. It is a small silver key on a yellow tag. The tag is shaped like a lightning bolt.\n\nThat key opens the repair locker at Signal Electronics. The store is downtown, east of here. Priya runs it. She came up here and fixed every radio in the station. The convoy needs them, so we can talk truck to truck. She would not take any pay. She left this key instead.\n\nWhy is her key here and not in her own store? That is the ring. Every stash is locked, and its key is hidden somewhere else. A note always tells you where. Only people who read can find them. Keys in the ring never stay home.",
        },
        "firehouse-dead1": {
          title: "Chief Dunn's Chili",
          text: "STATION 12 CHILI.\nBy Chief Dunn. Feeds a whole shift, or one hungry rookie.\n\nWhat you need:\nBeans.\nMore beans.\nWhatever is in the can. Read the label first. Or don't. It all works.\n\nWhat you do:\nDump it all in the big pot. Add water if it looks thick. Cook it slow. Do not rush it, and do not leave it alone. Stir it when the alarm is quiet.\n\nThe card is pinned up by the CHILI NIGHT board. Grease spots cover the corners. Someone has made this chili a lot of times. The whole station must have smelled like beans.\n\nAt the bottom, in red pen, the chief added one more rule. It is underlined twice.\n\nNever let Vega cook.\n\nNext to it, in someone else's writing: That was ONE time.",
        },
        "firehouse-dead2": {
          title: "The First Convoy Notice",
          text: "RIVER CONVOY: WE LEAVE FRIDAY.\n\nMeet at the north bridge at dawn on Friday. The convoy leaves on time. Bring one bag each, and all the water you can carry. Be there early, or be left behind.\nSigned, Sergeant Vega.\n\nThe paper is stiff and faded from the sun. The tape has dried out at the corners. It looks official, and for a second you feel hope.\n\nLook at it again, though. This is the very first notice. It went up before anyone knew how high the river would get. The leaving day has been moved since then. It has moved more than once.\n\nNobody is waiting at the north bridge this Friday. Check the newer lists before you go anywhere. Chief Dunn keeps those lists, and he keeps them up to date. Old paper tells old news.",
        },
      },
      signs: {
        "firehouse-sign1": { title: "TRUCK BAY", text: "TRUCK BAY. KEEP CLEAR AT ALL TIMES. Trucks may leave without warning. Do not park, stand, or wait in front of these doors." },
        "firehouse-sign2": { title: "Safety Board", text: "THIS STATION HAS GONE ___ DAYS WITHOUT AN ACCIDENT. The number is wiped clean. Written in its place, in marker: we stopped counting." },
        "firehouse-sign3": { title: "Ruby's Red R", text: "Ruby's red R by the front door, with a 6 under it. Under that, quick and drippy: TWO IN THE TRUCK BAY. CHECK BEHIND THE TANK." },
        "firehouse-sign4": { title: "Chalk by the Door", text: "Chalked by the equipment bay door, big and quick: RED KEY. ON THE BOARD. An arrow points back toward the front desk." },
      },
      key: { name: "Silver key, lightning bolt tag", tag: "The yellow tag is shaped like a lightning bolt. It says: \"Repair locker. Fix it, don't toss it.\" The key itself is small and silver, with a bright shine." },
    },

    hospital: {
      blurb: "St. Anne Annex, the north hills hospital: medicine, a generator, and the worst walkers.",
      door: {
        title: "Doc Lin on the Ambulance",
        text: "Doc Lin. I wrote this on my last run north.\n\nOne medical kit is in the patient room next to the x-ray machine. One more is by the giant teddy bear in the gift shop. The generator is in the utility room, on the right side.\n\nAt least nine walkers are inside. They stand still in the dark rooms, so look before you step in.\n\nThe pharmacy stock room is locked. The nurse's note is at the nurses' station, in the middle. Ada, if you are still in there, hold on. I am coming as soon as I can.",
      },
      notes: {
        "hospital-hall": {
          title: "Nurse Ada at the Station",
          text: "Nurse Ada, St. Anne Annex. I stayed when the others left. Someone had to.\n\nThe pharmacy stock room has a badge lock. My badge is in the drawer under this station. The badge is white, on a blue clip. Hold it flat against the reader by the door. Then you can open the stock room now.\n\nThe stock room door is right here in the nurses' station. It is across the walkway from this desk, on the angel statue side. Inside are three medical kits. That is all that is left.\n\nNow listen, because this matters most. Stay quiet in here. The walkers in this building follow sound more than light. A flashlight will not turn them. A dropped tray will. Do not run. Do not shout. Close every door slowly.\n\nIf you see Doc Lin, tell her I am still here.",
        },
        "hospital-trail1": {
          title: "Waiting by the Radio",
          text: "Nurse Ada. People ask why I stayed. Here is the answer, in order.\n\nOne: the generator. Someone has to keep it running.\nTwo: the records. Every patient this place ever had is in them.\nThree: the cold medicine. Some of it must stay cold, or it spoils.\n\nSo I stay, and I keep the lights low.\n\nEvery night I turn on the radio. I listen to Jo on 88.1. Jo reads the news and the warnings. I listen for one name only, and that name is Doc Lin.\n\nJo says Lin will come up with the River Convoy. But the convoy is late again. It is always late again. I write the date down each time, then cross it out.\n\nI left another note for you. It is in the x-ray room, beside the x-ray machine.",
        },
        "hospital-trail2": {
          title: "The Iron Key",
          text: "Nurse Ada again. Thank you for reading this far.\n\nThere is a key in this building. It lies on the chapel floor, beside the angel statue. It is a heavy old iron key with a square head. It looks older than the hospital.\n\nIt opens the old safe room at Gas-N-Go. That is south of here, near the south end of town.\n\nRuby brought it up here on her first scouting run north. She sat right here and explained the ring to me. Every stash in town is locked. Its key is hidden in another building, with a note that says where. Only people who read can find them. This key closes the ring into a circle. The last link leads back to the first.\n\nRuby has a good heart. Tell her I said so.",
        },
        "hospital-dead1": {
          title: "Visitor Sign-In Sheet",
          text: "ST. ANNE ANNEX: VISITOR SIGN-IN.\nPlease print your name, the time, and who you came to see.\n\nThe sheet is still on its clipboard by the door. The pen is still tied to it with string. Most of the names are smudged now. People signed in to see a mother, a son, a friend after surgery.\n\nThe last name on the sheet is Doc Lin. Her writing is small and quick, the way doctors write. In the box for who she came to see, she wrote: Ada.\n\nNext to her name, she added two words.\n\nBack tomorrow.\n\nNobody signed in after that. The rest of the page is blank. Someone has drawn a small circle around those two words, very neatly. It looks like Nurse Ada's careful pen. She must read this sheet a lot.",
        },
        "hospital-dead2": {
          title: "Bus Notice for Patients",
          text: "NOTICE TO PATIENTS AND FAMILIES.\n\nA bus will take patients out of town every morning. It leaves from the front door at seven sharp. Bring your papers and one small bag. Staff will help anyone who cannot walk. Please do not crowd the doors.\n\nThe notice is printed on clean white paper. The hospital name is at the top. It looks calm and official. It almost makes you want to wait by the door.\n\nCheck the date in the corner. The notice is from the first week of the Fall. No bus has come since then. Not one. The bus stop out front is empty, and its sign has fallen over.\n\nDo not wait for a ride here. Nobody is coming in the morning. If you want to leave town, ask about the River Convoy instead.",
        },
      },
      signs: {
        "hospital-sign1": { title: "QUIET ZONE", text: "QUIET ZONE. PATIENTS RESTING. Under it, in Ada's tidy writing: They follow sound, not light. Soft steps, please. Close doors gently." },
        "hospital-sign2": { title: "Ruby's Red R", text: "Ruby's red R, sprayed over the old paint, with a 9 under it. Below: THEY STAND IN THE DARK ROOMS. LOOK BEFORE YOU STEP IN." },
        "hospital-sign3": { title: "Hospital Map", text: "YOU ARE HERE. A floor map shows patient rooms all along the main hall. A small box off the main hall, next to the chapel, is marked: Supply cupboard." },
        "hospital-sign4": { title: "Chalk by the Stock Room", text: "Chalk by the stock room door, in Ada's neat writing. It says: Lin, it is all still here. I kept it for you. Come soon." },
      },
      key: { name: "Heavy iron key, square head", tag: "A paper tag on a string says: \"Old safe room. Ruby was here.\" The key is heavy old iron, with a square head. It feels cold in your hand." },
    },

    watertower: {
      blurb: "The pump building under the Water Tower on the west side, stocked with water filters.",
      door: {
        title: "Theo's Fence Note",
        text: "Theo here. I tend the pumps, and this gate is mine to watch.\n\nThere are two water filters inside. One is by the crates near the big red wheel. The other is in the boat workshop, by the rowboat.\n\nAt least six walkers are inside the pump building. The hum of the pumps draws them in and keeps them there. Walk around them, not through them.\n\nThe pump house is locked. My note is on the control panel, in the back right room. Take what you need, and leave some for the next person.",
      },
      notes: {
        "watertower-panel": {
          title: "The Breaker Box Key",
          text: "Theo. You found the panel. Good.\n\nThe pump house key is in the breaker box. That is the gray metal box on the wall, with the danger sign. It looks scary, but the breakers are all off. Open the little door. The key hangs on a nail inside. With it, you can open the pump house now.\n\nGo past the blue pump and into the pump hall. The pump house door is at the back of the hall, at the blue pump end. The big red wheel is at the far end. Inside there are filters, a water tank, and wire. Leave at least one filter if you can.\n\nIf you need medicine, St. Anne Annex is the hospital, north up Hill Road. It still has medicine. But it is the most dangerous place in town. Do not go there alone.",
        },
        "watertower-trail1": {
          title: "Ruby, It's Dev",
          text: "Ruby, it's Dev. If you are reading this, you followed me all the way here. I knew you would.\n\nI am safe. I mean it. Theo lets me and Mr. Ortiz sleep up in the tower. It is high and dry, and nothing climbs that ladder. At night we can see the whole town.\n\nWe help Theo keep the pumps running. Mr. Ortiz fixes the motors. I carry, I clean, and I learn. I am getting good at it.\n\nIf I am out on a run when you get here, wait for me. Do not go looking. Just wait here, and I will come back.\n\nAlso, Theo left a note for travelers. It is in the pump hall, between the crates near the big red wheel. Read it. Theo is fair, and he looks out for people. Tell Jo on the radio that you found me.\n\nYour brother,\nDev",
        },
        "watertower-trail2": {
          title: "For Travelers, From Theo",
          text: "Theo. This note is for travelers, so I will keep it plain.\n\nThere is a key in this building. It lies on the floor beside the green tanks. It is a small brass key on a purple school lanyard.\n\nIt opens the principal's closet at Lincoln Middle School. The school is far east of here, across town. It is a long drive, but it is worth it.\n\nTwo kids brought me that key. Max and Mia are twins, and they came here looking for their teacher. I gave them water and a place to rest. Mia had the key in her pocket. They left it with me for the ring.\n\nYou may know the ring by now. Every stash is locked, and its key is hidden in another building. A note always says where. Only people who read can find them.",
        },
        "watertower-dead1": {
          title: "Theo's Water Rules",
          text: "WATER RULES.\nWritten by Theo on an index card, in square capital letters.\n\nOne jug per person, each day. Fill it at the tap by the gate.\nKids get two jugs. They are still growing.\nWash your hands before you touch the tap.\nNever drink from the river.\nBring your jug back. Jugs are hard to find now.\nNobody leaves thirsty.\n\nThe card is nailed to the wall just inside the door. The last rule is written bigger than the others. It is underlined twice.\n\nSomeone has drawn a small heart in the corner. Someone else wrote, in a kid's hand: thank you Theo. Under that, Theo added: you are welcome. Now go wash your hands. A line of jugs sits under the card, clean and ready. Each one has a name on a strip of tape.",
        },
        "watertower-dead2": {
          title: "Paper Plate Note",
          text: "Good news, everybody! The river water is clean now. It is safe to drink, right from the bank. I drank it all week, and I feel fine. No need to wait in line for jugs anymore.\n\nThat is what the note says. It is written on a paper plate in blue crayon. There is no name on it.\n\nDo not trust it. The river water is not clean. It looks clear in the sun, but clear is not the same as safe.\n\nTheo crossed the whole note out with a thick black line. Under it, in his square capitals, he wrote two words.\n\nFILTER EVERYTHING.\n\nUnder that, smaller: Every drop. Every time. Ask me if you need a filter. I would rather give one away than see you sick. Theo means it, too. There is a box of old filters by the door.",
        },
      },
      signs: {
        "watertower-sign1": { title: "City Water Works", text: "CITY WATER WORKS. STAFF ONLY. Below it, a yellow sign: DANGER. PUMPS START WITHOUT WARNING. Keep your hands and feet clear of all moving parts." },
        "watertower-sign2": { title: "Big Chalk Letters", text: "In big chalk letters, across half the wall: Ruby, I am here! Wait for me! It is signed with one fat letter: D." },
        "watertower-sign3": { title: "Chalk Circle", text: "A chalk circle with a key drawn inside, by the tool crib door in the boat workshop. Under it: The key is not here. Read the notes." },
        "watertower-sign4": { title: "Pump House Door", text: "PUMP HOUSE. KEEP LOCKED. Next to it, a small red sign on a gray box: BREAKER BOX. DANGER. HIGH VOLTAGE. Theo has drawn a smiley face on it." },
      },
      key: { name: "Brass key, purple lanyard", tag: "A card clipped to the purple school lanyard reads: \"Principal's closet. Go Lions.\" The key on it is small and brass. It jingles when you walk, so hold it still." },
    },

    lumberyard: {
      blurb: "Ridge Lumber on the east ridge: racks of wood, a dock crowd, and a locked kiln shed.",
      door: {
        title: "Ruby's Spray Paint",
        text: "Ruby. I marked this gate so you would see it from the road.\n\nLumber is in the long racks in the middle. One more stack is out back, by the log pile. A big walker stands right by it.\n\nAt least eight walkers are inside. A crowd of them gathers by the loading dock and the flatbed truck. Stay away from that side.\n\nThe kiln shed is locked. The yard boss left a note on a clipboard by the band saw. Read it before you touch the shed. Then load up and get out.",
      },
      notes: {
        "lumberyard-rack": {
          title: "Carla's Clipboard",
          text: "CARLA HERE! Yard boss! If you can read this, you are standing too close to my band saw. Today that is fine.\n\nThe kiln shed has a padlock with a number dial. The code is 2218. Spin it to 2, then 2, then 1, then 8. Give it a good yank, and the lock drops open. You can open the kiln shed now.\n\nLeave the band saw shop and step into the rack hall. Follow the back wall toward the log pile. The kiln shed door is in that wall. The lumber in the shed is dry, and there are nails too.\n\nNow the big rule. DO NOT RUN THE SAWS. Not once. Not even to cut one board. The noise brings the whole dock crowd, and they come fast. Carry what you need and go quietly.\n\nThanks for reading. Most people do not.\nCarla",
        },
        "lumberyard-trail1": {
          title: "Boats for the Convoy",
          text: "Carla, yard boss, again! You keep finding my notes. I like you already.\n\nBig news. My crew is building flat boats for the River Convoy. They are wide and steady, good for a full load. We use the best planks in the yard. The straight ones, with no knots. I picked every one myself.\n\nSergeant Vega comes by every week to check the boats. Vega knocks on each one, nods, and writes in a little book. Then Vega asks the same question. When can they launch?\n\nMy answer is always the same. Not yet. The river is still too high to launch them. The water is fast and full of logs.\n\nI wrote you one more note. It is out back in the yard, near the log pile. Watch for the big one out there, and walk quietly.",
        },
        "lumberyard-trail2": {
          title: "A Key with a Bookmark",
          text: "Carla again! Out back by the log pile. You found it. Good.\n\nNow for the key. A key lies on the floor of the sales office, beside the wooden bear. It is a long, old-fashioned key with a round loop for a handle. A paper bookmark is tied to it with string.\n\nThat key opens the rare book room at the Public Library. The library is north and west of here.\n\nMrs. Greer came up here one day with a wagon. She needed planks to board the library windows. She had no money, so she paid me with this key. It lives here now, in the ring.\n\nThe ring is simple. Every stash is locked, and its key is hidden in another building. A note always says where. Only people who read can find them. Mrs. Greer liked that rule a lot.",
        },
        "lumberyard-dead1": {
          title: "Ridge Lumber Yard Rules",
          text: "YARD RULES.\nBy order of Carla, yard boss. No arguing.\n\nWear boots. Real boots, not sneakers.\nLift with your legs, not your back. Your back has to last.\nNever run the saws. I mean never.\nStack it the way you found it.\nSay thank you to the forklift. It has feelings.\n\nThe sheet is nailed to the post in the corner. The paint on it is chipped, and the corners curl up.\n\nAt the bottom, there is a new rule. It is written in a different pen, blue instead of black. The letters are shaky, as if written in a hurry.\n\nIf you hear the dock crowd, freeze. Do not run. Do not talk. Just freeze until they pass. Then count to one hundred, slowly. Then walk. Someone drew a check mark next to it. Maybe they tried it once.",
        },
        "lumberyard-dead2": {
          title: "Code on a Receipt",
          text: "KILN SHED CODE 2281. GOT IT FROM THE CREW. HURRY.\n\nThat is all, scrawled on the back of an old receipt. The front shows a sale from before the Fall. Two boxes of screws and a bag of ice.\n\nThe writing is fast and messy. The pen ran out halfway through the last word. Whoever wrote it was in a rush, and maybe scared.\n\nThe code looks close, and close is the trap. It is wrong. Two of the numbers are swapped at the end. Spin the dial to 2281, and the lock will not budge. You will stand by the shed, tugging, while the dock crowd listens.\n\nCarla's clipboard by the band saw has the right code. Trust the clipboard. Carla writes things down with care, even when she yells.",
        },
      },
      signs: {
        "lumberyard-sign1": { title: "Painted Yard Sign", text: "Ridge Lumber. Cut to order. The words are painted in tall green letters on a long board. A pine tree stands at each end." },
        "lumberyard-sign2": { title: "Ruby's Red R", text: "Ruby's red R, sprayed tall, with an 8 under it. Below, in fast letters: THEY GATHER AT THE DOCK. STAY AWAY." },
        "lumberyard-sign3": { title: "Safety Sign", text: "CAUTION: EAR PROTECTION NEEDED NEAR THE SAWS. Under it, Carla added in thick marker: The saws stay off! No ear protection needed now!" },
        "lumberyard-sign4": { title: "Spray Paint on the Door", text: "Spray-painted across the kiln shed door, in big black letters: CODE ON THE CLIPBOARD. An arrow points toward the racks. The paint has dripped a little." },
      },
      key: { name: "Long key with a bookmark", tag: "The paper bookmark tied to it says: \"Rare books. Handle with care.\" The key is long and old-fashioned, with a round loop for a handle. It is heavier than it looks." },
    },

    mall: {
      blurb: "Northgate Mall in the north: goods across the floor and the biggest walker crowd in town.",
      door: {
        title: "Jo's Mall Door Note",
        text: "Jo here, the voice on the radio. Listen up.\n\nFood is in the food court at the back. Medicine is in the pharmacy on the left. Wire is in the gadget store on the right, next door to the orange tent.\n\nAt least nine walkers are inside. Many of them stand along the main hall. They move in a group, like one big animal.\n\nThe security office is locked. The guard's note is in the play area, by the green dino. Read it first. Then walk, and keep walking. Whatever you do, do not run in there.",
      },
      notes: {
        "mall-guard": {
          title: "Luis Left the Code",
          text: "My name is Luis. I am a security guard, and this mall is my post.\n\nThe security office has a keypad by its door. The code is 0912. Type it slowly and press the green button. The lock lets go with a click. You can open the security office now.\n\nGo to the back of the food court and take the kitchen door. Then turn right. The office is behind the green dino. Inside are gun parts, radio parts, and a tool kit.\n\nNow the important part. The walkers here watch for one thing. They come running at anyone who runs. It does not matter how fast you are. They are faster when they are all together.\n\nSo walk. Walk slowly, even when it feels wrong. Walk, and most of them stay put. I have watched this crowd every day for months. Trust me on this one.",
        },
        "mall-trail1": {
          title: "Still at My Post",
          text: "Luis again. I have stayed at my post since the Fall began. That is a long time to stand in one place. My feet agree.\n\nI know this crowd now. They walk the same slow loop every day. Past the shoe store, around the fountain, back by the food court. Then they do it again. If you learn the loop, you can slip around it.\n\nSergeant Vega came by last month. Vega asked me to join the River Convoy. It was a seat on a truck, north along the river. It was a kind offer, and I said no.\n\nSomeone has to watch the mall. People still come here for food and medicine. Someone has to tell them to walk, not run.\n\nI left another note for you. It is in the sports store, beside the orange tent. Walk there. Do not run.",
        },
        "mall-trail2": {
          title: "A Key from Doc Lin",
          text: "Luis. You made it to the sports store. Now cross the mall, slowly.\n\nA key lies on the floor of Toy Town, beside the rocking horse. It is a small silver key on a white tag. The tag has a red cross on it.\n\nIt opens the supply cupboard at St. Anne Annex. That is the hospital, far west of here in the north hills.\n\nDoc Lin left it with me on a medicine run. She stopped here to rest her feet. She said Nurse Ada wants the cupboard used, not saved. Medicine on a shelf helps nobody.\n\nSo the key stays here, in the ring. Every stash is locked, and its key is hidden in another building. A note always says where. Only people who read can find them. You read, so it is yours.",
        },
        "mall-dead1": {
          title: "Luis's Patrol Log",
          text: "PATROL LOG. Guard on duty: Luis.\n\nDay 40. Crowd quiet. Nobody running. Doors held.\nDay 41. Crowd quiet. Nobody running. Doors held.\nDay 42. Crowd quiet. Nobody running. Doors held.\n\nThe log goes on like that for pages. The same six words, in the same neat hand. You can almost hear him say them out loud, standing by the doors.\n\nThen one day is different.\n\nDay 57. Jo came by with batteries and stayed for coffee. Crowd quiet. Good day.\n\nThe words \"good day\" are underlined. Somebody drew a tiny coffee cup next to them. It is not Luis's style. Jo, maybe.\n\nThen the next page goes back to the same six words. Crowd quiet. Nobody running. Doors held. Luis does not get many visitors. You can tell he liked that one.",
        },
        "mall-dead2": {
          title: "Pencil Note, No Name",
          text: "Security office: 0921. Trust me, I watched the guard type it.\n\nThat is the whole note, in light gray pencil. It is folded in half and wedged under a food court tray. There is no name on it.\n\nIt looks real enough. The first two numbers are right. But the code is wrong, because the last two numbers are swapped. Type 0921 into that keypad, and you get a red light. You also get a loud beep. In this mall, a loud beep is the last thing you want.\n\nWhoever wrote it saw the guard type fast. They got close, but close does not open doors.\n\nLuis's clipboard by the green dino has the right code. Luis wrote it himself, in ink. Use that one. Then walk to the office, slowly, and keep your head down.",
        },
      },
      signs: {
        "mall-sign1": { title: "Old Banner", text: "A long, faded banner hangs over the floor: Welcome to Northgate Mall! Something for everyone! One corner has come loose and sways." },
        "mall-sign2": { title: "Ruby's Red R", text: "Ruby's red R by the front doors, with a 9 under it. Under that, in huge letters that run down the wall: DON'T RUN. The letters are taller than you are." },
        "mall-sign3": { title: "Store Map", text: "YOU ARE HERE. A store map on the wall shows every aisle. The jewelry vault is marked with a gold star, inside the gadget store, at its front wall." },
        "mall-sign4": { title: "SECURITY", text: "SECURITY. STAFF ONLY. Under it, in black marker: Code on the clipboard by the green dino. Walk, don't run. Signed with a little badge drawing." },
      },
      key: { name: "Silver key, red cross tag", tag: "The white tag has a red cross on one side. The other side says: \"Supply cupboard. Ada says use it.\" The key is small and silver, and it smells a little like soap." },
    },

    library: {
      blurb: "The Public Library north of downtown: books on every wall, maps, and a locked archive room.",
      door: {
        title: "Mrs. Greer's Book Drop",
        text: "From Mrs. Greer, the librarian. Please read this slowly, as you would any good page.\n\nBooks are in the stacks on both sides of the main hall. More are in the children's room, by the toy castle.\n\nAt least eight walkers are inside. Two of them stand in the main hall, so you will meet them first.\n\nThe archive room is locked. My note is on the reference desk, by the giant globe, at the back on the left. Please keep your voice low in here. The walkers here mind noise more than I do.",
      },
      notes: {
        "library-desk": {
          title: "The Key in the Dictionary",
          text: "Mrs. Greer again. Welcome to the reference desk. In better days, people asked me questions here. Now I leave the answers in writing.\n\nThe archive key is inside the big dictionary on this desk. Open it to the letter K. Yes, K for key. I could not resist. A small hollow is cut in the pages, and the key sits inside. With it, you can open the archive room now.\n\nThe archive door is at the back end of the main hall. It is between two rooms. One is this room, with the giant globe. The other has the tall clock. The archive has books and a folder of city maps.\n\nOne last thing. Reading saved this building. Look at the walls as you leave. They are stacked high with the books nobody wanted. Every unread book became a brick.",
        },
        "library-trail1": {
          title: "A Class in the Stacks",
          text: "Mrs. Greer. A small update for anyone keeping track.\n\nMs. Adler's class lives here now. They came in one rainy evening, wet and tired, in a long quiet line. I counted them twice. Now they sleep among the shelves.\n\nWe do not light candles near the books. So the children read by window light, in shifts. They keep quiet, because quiet keeps us safe. They are very good at it now. Better than most adults.\n\nMs. Adler still watches the front door. Every morning and every evening she stands there. She is waiting for the twins, Max and Mia. They were lost in the rush, and she has not stopped looking.\n\nIf you have seen two thirteen-year-olds on the road, please tell us.\n\nMy other note is in the periodicals room, beside the tall clock.",
        },
        "library-trail2": {
          title: "A Tiny Gold Key",
          text: "Mrs. Greer again. Thank you for walking all the way back here.\n\nThere is a key in this library. It lies on the floor of the children's room, beside the toy castle. It is a tiny gold key in a small velvet pouch. The pouch is dark and easy to miss.\n\nIt opens the jewelry vault at Northgate Mall. The mall is east of here.\n\nLuis the guard sent it to me with Jo. Jo brought it in a coat pocket, with a kind letter. Luis asked me to keep it for the ring. I said yes, of course.\n\nHere is how the ring works. Every stash is locked, and its key is hidden in another building. A note always says where. Only people who read can find them. As a librarian, I approve.",
        },
        "library-dead1": {
          title: "The Class Reading Chart",
          text: "Ms. Adler's class: books we finished.\n\nA big chart is taped to the wall. Each student gets a gold star for every book they finish. Every row has a name and a line of stars.\n\nSome rows are long. One boy has nineteen stars, all crammed together. One girl drew her own stars when the gold ones ran out. A few rows have just two or three.\n\nTwo names at the bottom have no stars yet. Max. Mia.\n\nNext to them, in neat teacher writing, someone wrote three words.\n\nSaving their stars.\n\nUnder that, a whole row of kids signed their names. Each one added a little star of their own, in pencil. They are waiting too. Somebody has already picked out books for the twins. Two thin ones sit on the shelf below the chart.",
        },
        "library-dead2": {
          title: "Index Card Tip",
          text: "ARCHIVE KEY: card catalog, drawer A. A for archive. Easy.\n\nThat is what the index card says. It is tucked into the frame of the front door. You could not miss it. There is no name on it. The writing is neat, like someone who has used a card catalog before.\n\nIt sounds clever, and that is the trouble. The drawers hold only old cards. Drawer A has cards for books about apples, art, and Alaska. No key. People have pulled every drawer out and dumped them. Cards lie on the floor like snow.\n\nDo not waste your time on the drawers. Mrs. Greer's note on the reference desk says where the key really is. She hid it, so she knows. Whoever wrote this card was guessing, and guessing is not reading.",
        },
      },
      signs: {
        "library-sign1": { title: "QUIET, PLEASE", text: "QUIET, PLEASE. The old brass sign still hangs by the stacks. Under it, someone wrote in pencil: It works on walkers too. Trust us." },
        "library-sign2": { title: "A Very Small R", text: "Ruby's red R, with an 8 under it, painted very small in a corner. It looks like she felt bad writing on a library wall." },
        "library-sign3": { title: "Library Hours", text: "LIBRARY HOURS: DAWN UNTIL DARK. Below it, a new card in careful print: No candles near the books. Not one. Not ever." },
        "library-sign4": { title: "Chalk by the Archive", text: "Chalked by the archive door, in tidy letters: Ask the dictionary. Someone drew a small open book next to the words, with a key inside." },
      },
      key: { name: "Tiny gold key, velvet pouch", tag: "A little card in the velvet pouch says: \"Jewelry vault. Not for jewelry.\" The key inside is tiny and gold. It is smaller than your thumbnail, so hold it tight." },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
