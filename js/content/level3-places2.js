/* Reading level 3: places, part 2 (police, school, firehouse, hospital, watertower, lumberyard, mall, library). Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md.
   SCALE: new places go in a new part file (level3-places3.js ...) with its own script tag, not in this one. */
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
        text: "Sergeant Vega, 4th Precinct. I pinned this to the board so you see it first.\n\nGun parts are in the squad room, on the left side of the long hall. An armor plate is in the garage on the right, by the riot shields.\n\nAt least eight walkers are inside. A big one waits by the police bike in the garage. Do not let it pin you in a corner.\n\nThe armory is locked. I left the combination on a note at the front desk. Read it before you touch the keypad.",
      },
      notes: {
        "police-desk": {
          title: "The Armory Combination",
          text: "Sergeant Vega again. You made it to the front desk, so you are doing fine.\n\nDo this in order. First, turn off the alarm. Its panel is on the left wall, by the coffee machine. Press the {button} button, and only that one.\n\nThen go to the armory. It has a keypad on a steel door. The combination is {code}. Press the numbers slowly, one at a time.\n\nGet any of this wrong, and the station alarm goes off. A wrong button does it. A wrong number does it. Opening the armory with the alarm still on does it too. Then walkers pour in, even through the front door. They keep coming until they get you.\n\nTake the long hall to the back hall, and head toward the police bike. The armory is the last door before the garage. Inside are gun parts and an armor plate.\n\nThe Public Library is north of downtown. It has books in its archive room. The librarian stayed when everyone else left. Tell Mrs. Greer the 4th Precinct says hello.",
        },
        "police-trail1": {
          title: "The River Convoy Is Real",
          text: "Vega here. People keep asking if the River Convoy is just talk. It is not. It is real, and I am the one who has to make it work.\n\nHere is the plan. Trucks and boats go north along the river. We leave the town and the crowds behind us. Upriver there are fewer walkers and more room to grow food.\n\nHere is the problem. It keeps getting delayed. The river is still too high for the boats. The trucks need parts, and parts are hard to find. So we wait, and we fix, and we wait some more.\n\nIf you want a seat, sign up with Chief Dunn at Station 12. He keeps the list, and he never loses it.\n\nThere is more you should know. My next note is in the K9 room, beside the dog kennel. Go read it.",
        },
        "police-trail2": {
          title: "A Key on Orange Rope",
          text: "Vega again. You found the K9 room, so now for the key.\n\nGo back out to the lobby, by the front door. The key lies on the floor beside the coffee machine. It is a padlock key on a loop of orange rope. You cannot miss the rope.\n\nThat key opens the foreman's lockbox at Ridge Lumber. The yard is east of here, up on the ridge. Carla runs it, and she is building boats for the convoy. She gave me this key so the ring stays whole.\n\nThe foreman's lockbox has a plain lock. A wrong key just will not turn in it.\n\nYou may not know about the ring yet. Every stash in town is locked. Its key is hidden in another building, with a note that says where. Only people who read can find them.",
        },
        "police-dead1": {
          title: "Lost and Found List",
          text: "FRONT DESK: LOST AND FOUND.\n\nThis list was taped to the front desk before the Fall. Someone moved it out here to the garage. Maybe they wanted it out of the way. Maybe they wanted to keep it safe.\n\nItems turned in this month:\nOne bike. Blue, with a bent front wheel. Found by the bus stop.\nOne trumpet. In its case, with sheet music still inside.\nOne dog leash with no dog. Red, and still clipped shut.\n\nNobody came back for any of it. The bike is gone now, and the trumpet is gone too.\n\nAt the bottom, someone added a line in thick black pen. The letters are pressed hard into the paper. It says: one town.\n\nUnder that, in pencil, another hand wrote: still ours.",
        },
        "police-dead2": {
          title: "Numbers on a Scrap",
          text: "ARMORY: {decoyCode}. Punch it in slow. Got it from a guy who got it from Vega. Trust me, it works.\n\nThat is all it says. It is a scrap of notebook paper, left along the far wall of the garage. The handwriting is fast and sloppy. Whoever wrote it was in a hurry.\n\nIt sounds sure, and maybe it worked once. But think about the armory door. There is a newer sign on it. It says the combination was changed. Sergeant Vega changed it after too many people knew the old one. This scrap has the old numbers.\n\nTry them on the keypad, and the station alarm goes off. Walkers pour in, even through the front door. The note on the front desk has the combination that works. It is in Vega's own writing. Go by that one, not by a guy who knew a guy.",
        },
      },
      signs: {
        "police-sign1": { title: "Ruby's Red R", text: "A big red R by the front door, Ruby's mark, with an 8 sprayed under it. Below that, in quick drippy letters: ONE BIG ONE IN THE GARAGE. DON'T GET CORNERED." },
        "police-sign2": { title: "The Old Wanted Board", text: "WANTED, says the old board, but the wanted faces are gone. Missing-person notes cover every inch now. One says: Ms. Adler's class, Lincoln Middle School. Have you seen them?" },
        "police-sign3": { title: "River Convoy Notice", text: "NOTICE: River Convoy sign-up at Station 12. Trucks and boats, north along the river. Ask for Chief Dunn. Bring your name and your people." },
        "police-sign4": { title: "ARMORY", text: "ARMORY. POLICE ONLY. NO EXCEPTIONS. Under it, in black marker: Combination changed. See the front desk. Do not guess. Guessing takes too long in here." },
      },
      key: { name: "Padlock key on orange rope", tag: "A strip of tape is wrapped around the rope. It says: \"Knock first.\" The key is a plain padlock key, worn bright. It hangs on a loop of orange rope." },
    },

    school: {
      blurb: "Lincoln Middle School: boxes of books in the music room and the front office, and a locked library closet.",
      door: {
        title: "Max and Mia Were Here",
        text: "Max and Mia here! We are twins, and we go to school here. Well, we did.\n\nThere are two boxes of books. One is in the music room, with the drum set. The other is in the front office, behind the lion statue.\n\nAt least six walkers are inside. One stands in the main hallway. It wakes up if it hears you. Keep back, or put it down first!\n\nThe library closet is locked. The key is in our teacher's note. It is on the desk by the science room door, at the back on the left. That is the room with the big brain. It was our room!",
      },
      notes: {
        "school-classroom": {
          title: "Ms. Adler's Desk Drawers",
          text: "My name is Ms. Adler. I taught science in this room.\n\nThe library closet key is in the {pick} of this desk, right under this note. Open that drawer and no other. Max and Mia tied air horns to the other two drawers. Open the wrong one, and the horn blasts. The noise brings every walker in the school. They even come in through the front door, until they get you.\n\nWith the key, you can open the library closet. It holds books and a folder of city maps. Take the maps first.\n\nGo out to the main hallway and walk toward the drum set room. The library is the room next to it. The closet is in its back corner, on the drum set side.\n\nIf you need food or medicine, try Northgate Mall in the north. It has food, medicine, and wire. But the crowds there are the worst in town. Go only if you must.",
        },
        "school-trail1": {
          title: "For Max and Mia",
          text: "Max, Mia, this is for you. If anyone else finds it, please leave it here.\n\nI am so sorry we lost you in the rush. I looked for you until dark. Then I had to move the class.\n\nWe have gone north to the Public Library. Mrs. Greer, the librarian, will take us in. She has thick walls and a lot of quiet. Every student is safe and counted. Every student except the two of you.\n\nI will come back here to check whenever I can. If you find this, stay together. Walk, do not run, and go north to the library.\n\nOne more thing. When I came back today, I saw that Sergeant Vega had been here. Vega came looking for our class. Vega left a note in the music room, beside the drum set. Read it.\n\nWith love, Ms. Adler",
        },
        "school-trail2": {
          title: "Vega Checked the School",
          text: "Sergeant Vega. Two kids named Max and Mia came to my station. They asked me to find their class. So I came, and I found this school empty.\n\nNo class, and no twins either. I hope they find the note by the front door.\n\nI did not want the trip to be for nothing. So I left a key here for the ring. Go to the gym. The key lies on the floor, under the basketball hoop. It is a short steel key on a gray tag.\n\nIt opens the evidence locker at the 4th Precinct. That is my station, west of here. The locker has good gear in it. It also has a fussy lock. The wrong key jams it, and after that only a crowbar opens it.\n\nThat is how the ring works. Every stash is locked, and its key is hidden in another building. A note always says where. So read everything.",
        },
        "school-dead1": {
          title: "The Last Lunch Menu",
          text: "LINCOLN LIONS LUNCH MENU.\n\nMonday: chicken soup and a roll.\nTuesday: tacos, with corn on the side.\nWednesday: noodles with butter, or salad.\nThursday: fish sticks. Sorry.\nFriday: PIZZA!\n\nSomebody drew a little star by Friday. The menu is still pinned to the hall board. The paper has gone yellow, and one corner is torn away. This was the week the Fall began.\n\nUnder the menu, in pencil, a kid wrote one line. The letters lean hard to the right, like they were written fast.\n\nWe never got the pizza.\n\nBelow that, a few other kids added their names. Then somebody wrote: when this is over, pizza for everyone. Nobody has crossed it out. Somebody else drew a pizza slice with a smiling face. It is not a good drawing, but it is a hopeful one.",
        },
        "school-dead2": {
          title: "A Note in Purple Pen",
          text: "The closet key is in the {decoyPick} of Ms. Adler's desk. Go get it!\n\nThe note is on lined paper, torn from a school notebook. It lies in the middle of the gym. The writing is big and round, in purple pen. A kid wrote this.\n\nIt sounds sure, and it was right once. Look at the bottom of the page. The kid signed it with a small heart and one name: Mia. Mia wrote this before she and Max rigged the desk drawers. Now two of those drawers have air horns tied inside. Open the wrong one, and the noise brings every walker in the school.\n\nSo this note is out of date. Ms. Adler's own note is on the desk, in the science room. It says which drawer is safe. Read that one before you touch a drawer.",
        },
      },
      signs: {
        "school-sign1": { title: "Classroom Poster", text: "OUR CLASS RULES: Raise your hand. Be kind. Read every day. At the bottom, someone added in green marker: Stay together. Always." },
        "school-sign2": { title: "Ruby's Red R", text: "Ruby's red R, sprayed fast, with a 6 under it. Below, smaller: ONE IN THE HALLWAY. KEEP BACK. IT HEARS." },
        "school-sign3": { title: "Chalk on the Wall", text: "In neat chalk letters, like on a chalkboard: Ms. Adler's class, gone north. Under it, just as neat: Read the note by the front door." },
        "school-sign4": { title: "Library Closet Door", text: "LIBRARY CLOSET. Please return all books on time. Someone added in pen, under it: Late fees canceled. Forever. Signed, the students." },
      },
      key: { name: "Short steel key, gray tag", tag: "The gray tag says: \"Do not remove.\" Someone crossed out the words \"do not\" with a heavy line. The key is short and steel. It is plain and scratched." },
    },

    firehouse: {
      blurb: "Station 12, a fire station with tools, a water tank, and a locked equipment bay.",
      door: {
        title: "Chief Dunn's Bay Door",
        text: "Chief Dunn, Station 12. Read this all the way through.\n\nA tool kit is in the office, behind the watch desk. A water tank is in the truck bay, on the right wall, past the gear racks.\n\nAt least six walkers are inside, and two are in the truck bay. Go in ready.\n\nThe equipment bay is locked. My note is on the watch desk, by the spotted dog. That dog is only a statue. Take it slow, and keep your way out clear. That is rule one, always.",
      },
      notes: {
        "firehouse-desk": {
          title: "The Key Board",
          text: "Chief Dunn. This is the watch desk, and somebody always sat here. Now it is just me, and my lists.\n\nLook at the key board by this desk. It holds four keys, each one a different color. The equipment bay opens with the {pick}. Take that one, and only that one.\n\nThe other keys are for old locks. Put a wrong one in the bay lock, and it jams. After that, only a crowbar opens it. So check the color twice.\n\nThe equipment bay is at the back of the truck bay. It is beside the fire truck, on the gear racks side. In the bay there is a water tank, a stack of lumber, and tools. Load the tank first, since it is the heaviest.\n\nYou will need filters for that water. Go to the Water Tower on the west side. It has filters in its pump house. Tell Theo the chief says thanks.",
        },
        "firehouse-trail1": {
          title: "Convoy List, Page One",
          text: "Chief Dunn. I keep lists, so here is the one that matters most.\n\nRIVER CONVOY: WHAT WE HAVE.\nTwo fire trucks, both from this station.\nSergeant Vega's van, full of gear.\nCarla's boats, built at the lumber yard.\n\nThe plan is to leave north along the river. Trucks on the road, boats on the water, all of us together.\n\nMr. Ortiz fixed both trucks before he went west. He did it with half the parts he needed. I owe that man a hot meal.\n\nThe bad news is the date. The leaving day has moved three times now. The river is still too high, and the boats cannot launch yet. So we wait.\n\nI wrote a second note for you. It is in the bunk room, near the brass pole.",
        },
        "firehouse-trail2": {
          title: "Priya's Lightning Bolt Key",
          text: "Chief Dunn again. Good, you found the bunk room.\n\nNow go back to the truck bay. A key lies on the floor beside the fire truck. It is a small silver key on a yellow tag. The tag is shaped like a lightning bolt.\n\nThat key opens the repair locker at Signal Electronics. The store is downtown, east of here. The repair locker has a plain lock. A wrong key just will not turn in it.\n\nPriya runs that store. She came up here and fixed every radio in the station. The convoy needs them, so we can talk truck to truck. She would not take any pay. She left this key instead.\n\nWhy is her key here and not in her own store? That is the ring. Every stash is locked, and its key is hidden somewhere else. Keys in the ring never stay home.",
        },
        "firehouse-dead1": {
          title: "Chief Dunn's Chili",
          text: "STATION 12 CHILI.\nBy Chief Dunn. Feeds a whole shift, or one hungry rookie.\n\nWhat you need:\nBeans.\nMore beans.\nWhatever is in the can. Read the label first. Or don't. It all works.\n\nWhat you do:\nDump it all in the big pot. Add water if it looks thick. Cook it slow. Do not rush it, and do not leave it alone. Stir it when the alarm is quiet.\n\nThe card is pinned up by the CHILI NIGHT board. Grease spots cover the corners. Someone has made this chili a lot of times. The whole station must have smelled like beans.\n\nAt the bottom, in red pen, the chief added one more rule. It is underlined twice.\n\nNever let Vega cook.\n\nNext to it, in someone else's writing: That was ONE time.",
        },
        "firehouse-dead2": {
          title: "On a Duty Roster",
          text: "Bay key: the {decoyPick} on the board. Grab it and go.\n\nThe note is written on the back of a duty roster. It lies in the truck bay, by the right wall. Nobody signed it.\n\nIt sounds like inside news, from someone who worked here. Maybe they did. But flip the roster over. The names on the front are from the old shifts, before the Fall. The chief changed the bay lock after that. The key this note names fit the old lock. It does not fit the new one.\n\nPut the wrong key in the bay lock, and it jams. Then you need a crowbar to get in. The chief's note on the watch desk says which key fits now. Chief Dunn keeps his lists up to date. Trust his note over this one.",
        },
      },
      signs: {
        "firehouse-sign1": { title: "TRUCK BAY", text: "TRUCK BAY. KEEP CLEAR AT ALL TIMES. Trucks may leave without warning. Do not park, stand, or wait in front of these doors." },
        "firehouse-sign2": { title: "Safety Board", text: "THIS STATION HAS GONE ___ DAYS WITHOUT AN ACCIDENT. The number is wiped clean. Written in its place, in marker: we stopped counting." },
        "firehouse-sign3": { title: "Ruby's Red R", text: "Ruby's red R by the front door, with a 6 under it. Under that, quick and drippy: TWO IN THE TRUCK BAY." },
        "firehouse-sign4": { title: "Chalk by the Door", text: "Chalked by the equipment bay door, big and quick: THE BAY KEY IS ON THE BOARD. THE CHIEF'S NOTE SAYS WHICH ONE." },
      },
      key: { name: "Silver key, lightning bolt tag", tag: "The yellow tag is shaped like a lightning bolt. It says: \"Fix it, don't toss it.\" The key itself is small and silver, with a bright shine." },
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
          text: "Nurse Ada, St. Anne Annex. I stayed when the others left. Someone had to.\n\nThe pharmacy stock room has a badge lock. My badge is white, on a blue clip. It is in the {pick} of this station, right under this note. Hold it flat against the reader by the stock room door, and the door opens.\n\nOpen no other drawer. The other drawers are wired to the crash cart alarm. Open one, and the alarm brings walkers, more and more. They even come in through the front doors, until they get you.\n\nThe stock room door is right here in the nurses' station room. It is across the walkway from this desk, on the angel statue side. Inside are three medical kits. That is all that is left.\n\nNow listen, because this matters too. Stay quiet in here. The walkers in this building follow sound more than light. Do not run. Close every door slowly.\n\nIf you see Doc Lin, tell her I am still here.",
        },
        "hospital-trail1": {
          title: "Waiting by the Radio",
          text: "Nurse Ada. People ask why I stayed. Here is the answer, in order.\n\nOne: the generator. Someone has to keep it running.\nTwo: the records. Every patient this place ever had is in them.\nThree: the cold medicine. Some of it must stay cold, or it spoils.\n\nSo I stay, and I keep the lights low.\n\nEvery night I turn on the radio. I listen to Jo on 88.1. Jo reads the news and the warnings. I listen for one name only, and that name is Doc Lin.\n\nJo says Lin will come up with the River Convoy. But the convoy is late again. It is always late again. I write the date down each time, then cross it out.\n\nI left another note for you. It is in the x-ray room, beside the x-ray machine.",
        },
        "hospital-trail2": {
          title: "The Iron Key",
          text: "Nurse Ada again. Thank you for reading this far.\n\nThere is a key in this building. It lies on the chapel floor, beside the angel statue. It is a heavy old iron key with a square head. It looks older than the hospital.\n\nIt opens the old safe room at Gas-N-Go. That is south of here, near the south end of town. The old safe room has an old lock that bites. The wrong key snaps off inside it and is gone for good.\n\nRuby brought it up here on her first scouting run north. She sat right here and explained the ring to me. Every stash in town is locked. Its key is hidden in another building, with a note that says where. This key closes the ring into a circle.\n\nRuby has a good heart. Tell her I said so.",
        },
        "hospital-dead1": {
          title: "Visitor Sign-In Sheet",
          text: "ST. ANNE ANNEX: VISITOR SIGN-IN.\nPlease print your name, the time, and who you came to see.\n\nThe sheet is still on its clipboard by the door. The pen is still tied to it with string. Most of the names are smudged now. People signed in to see a mother, a son, a friend after surgery.\n\nThe last name on the sheet is Doc Lin. Her writing is small and quick, the way doctors write. In the box for who she came to see, she wrote: Ada.\n\nNext to her name, she added two words.\n\nBack tomorrow.\n\nNobody signed in after that. The rest of the page is blank. Someone has drawn a small circle around those two words, very neatly. It looks like Nurse Ada's careful pen. She must read this sheet a lot.",
        },
        "hospital-dead2": {
          title: "An Old Staff Memo",
          text: "STAFF MEMO. The stock room badge is kept in the {decoyPick} of the nurses' station. Return it there after every use.\n\nThe memo is printed on clean white paper, with the hospital name at the top. It lies at the x-ray end of the main hall. It looks calm and official.\n\nIt was true once. But check the date in the corner. The memo is from before the Fall. Nurse Ada moved the badge after it was printed. Now the other drawers are wired to the crash cart alarm. Open the wrong one, and the alarm brings every walker in the building.\n\nSo do not go by the memo. Ada's note on the nurses' station says where the badge is now. She wrote it by hand, and she is still here. Trust the nurse over the printer.",
        },
      },
      signs: {
        "hospital-sign1": { title: "QUIET ZONE", text: "QUIET ZONE. PATIENTS RESTING. Under it, in Ada's tidy writing: They follow sound, not light. Soft steps, please. Close doors gently." },
        "hospital-sign2": { title: "Ruby's Red R", text: "Ruby's red R, sprayed over the old paint, with a 9 under it. Below: THEY STAND IN THE DARK ROOMS. LOOK BEFORE YOU STEP IN." },
        "hospital-sign3": { title: "Hospital Map", text: "YOU ARE HERE. A floor map shows patient rooms all along the main hall. A small box off the main hall, next to the chapel, is marked: Supply cupboard." },
        "hospital-sign4": { title: "Chalk by the Stock Room", text: "Chalk by the stock room door, in Ada's neat writing. It says: Lin, it is all still here. I kept it for you. Come soon." },
      },
      key: { name: "Heavy iron key, square head", tag: "A paper tag on a string says: \"Ruby was here.\" The key is heavy old iron, with a square head. It feels cold in your hand." },
    },

    watertower: {
      blurb: "The pump building under the Water Tower on the west side, stocked with water filters.",
      door: {
        title: "Theo's Fence Note",
        text: "Theo here. I tend the pumps, and this gate is mine to watch.\n\nThere are two water filters inside. One is by the crates near the big red wheel. The other is in the boat workshop, by the rowboat.\n\nAt least six walkers are inside the pump building. The hum of the pumps draws them in and keeps them there. Walk around them, not through them.\n\nThe pump house is locked. My note is on the control panel, in the back right room. Take what you need, and leave some for the next person.",
      },
      notes: {
        "watertower-panel": {
          title: "Three Breaker Boxes",
          text: "Theo. You found the control panel. Good.\n\nThe pump house key is in the {pick}. That is one of the three breaker boxes by this panel. Open that box, and the key hangs on a nail inside. With it, you can open the pump house.\n\nOpen neither of the other two boxes. They are live, and the shock kills. Do not touch them, not even to look. I mean it.\n\nGo into the pump hall. The pump house door is at the back of the hall, at the blue pump end. The big red wheel is at the other end, away from it. Inside there are filters, a water tank, and wire. Leave at least one filter if you can.\n\nIf you need medicine, St. Anne Annex is the hospital, north up Hill Road. It still has medicine. But it is the most dangerous place in town. Do not go there alone.",
        },
        "watertower-trail1": {
          title: "Ruby, It's Dev",
          text: "Ruby, it's Dev. If you are reading this, you followed me all the way here. I knew you would.\n\nI am safe. I mean it. Theo lets me and Mr. Ortiz sleep up in the tower. It is high and dry, and nothing climbs that ladder. At night we can see the whole town.\n\nWe help Theo keep the pumps running. Mr. Ortiz fixes the motors. I carry, I clean, and I learn. I am getting good at it.\n\nIf I am out on a run when you get here, wait for me. Do not go looking. Just wait here, and I will come back.\n\nAlso, Theo left a note for travelers. It is in the pump hall, between the crates near the big red wheel. Read it. Theo is fair, and he looks out for people. Tell Jo on the radio that you found me.\n\nYour brother,\nDev",
        },
        "watertower-trail2": {
          title: "For Travelers, From Theo",
          text: "Theo. This note is for travelers, so I will keep it plain.\n\nThere is a key in this building. It lies on the floor beside the green tanks. It is a small brass key on a purple school lanyard.\n\nIt opens the principal's closet at Lincoln Middle School. The school is far east of here, across town. The principal's closet has a fussy lock. The wrong key jams it, and after that only a crowbar opens it.\n\nTwo kids brought me that key. Max and Mia are twins, and they came here looking for their teacher. I gave them water and a place to rest. Mia had the key in her pocket. They left it with me for the ring.\n\nYou may know the ring by now. Every stash is locked, and its key is hidden in another building. A note always says where.",
        },
        "watertower-dead1": {
          title: "Theo's Water Rules",
          text: "WATER RULES.\nWritten by Theo on an index card, in square capital letters.\n\nOne jug per person, each day. Fill it at the tap by the gate.\nKids get two jugs. They are still growing.\nNobody leaves thirsty.\n\nUnder the rules, in smaller letters, Theo added more. Wash your hands before you touch the tap. Never drink from the river. Bring your jug back, because jugs are hard to find now.\n\nThe card is nailed to the wall just inside the door. The last rule is written bigger than the others. It is underlined twice.\n\nSomeone has drawn a small heart in the corner. Someone else wrote, in a kid's hand: thank you Theo. Under that, Theo added: you are welcome. Now go wash your hands. A line of jugs sits under the card, clean and ready. Each one has a name on a strip of tape.",
        },
        "watertower-dead2": {
          title: "Paper Plate Note",
          text: "Pump house key: in the {decoyPick}. Just open it and grab the key.\n\nThat is what the note says. It is written on a paper plate in blue marker. It is nailed to the far wall of the blue pump room. There is no name on it.\n\nIt sounds easy. Whoever wrote it seemed to know this place. Now turn the plate over. Theo found it and wrote on the back, in his square capitals. THIS IS OLD. I REWIRED THE BOXES AND MOVED THE KEY. THAT BOX IS LIVE NOW.\n\nA live box is deadly. Open it, and the shock kills you. Theo left the plate here so people would see his warning. His note on the control panel says which box is safe. Read it before you touch a single breaker box.",
        },
      },
      signs: {
        "watertower-sign1": { title: "City Water Works", text: "CITY WATER WORKS. STAFF ONLY. Below it, a yellow sign: DANGER. PUMPS START WITHOUT WARNING. Keep your hands and feet clear of all moving parts." },
        "watertower-sign2": { title: "Big Chalk Letters", text: "In big chalk letters, across half the wall: Ruby, I am here! It is signed with one fat letter: D." },
        "watertower-sign3": { title: "Chalk Circle", text: "A chalk circle with a key drawn inside, by the tool crib door in the boat workshop. Under it: The key is not here. Read the notes." },
        "watertower-sign4": { title: "Pump House Door", text: "PUMP HOUSE. KEEP LOCKED. Under it, in Theo's neat pen: The key is in a breaker box by the control panel. Read my note there first. Two boxes are live." },
      },
      key: { name: "Brass key, purple lanyard", tag: "A card clipped to the purple school lanyard reads: \"Go Lions.\" The key on it is small and brass. It jingles when you walk, so hold it still." },
    },

    lumberyard: {
      blurb: "Ridge Lumber on the east ridge: racks of wood, a dock crowd, and a locked kiln shed.",
      door: {
        title: "Ruby's Spray Paint",
        text: "Ruby. I marked this gate so you would see it from the road.\n\nLumber is in the long racks in the middle. One more stack is out back, by the log pile. A big walker stands right by it.\n\nAt least eight walkers are inside. A crowd of them gathers by the loading dock and the flatbed truck. Stay away from that side.\n\nThe kiln shed is locked. The yard boss left a note on a clipboard by the band saw. Read it before you touch the shed. And do not run the saws. The noise brings the dock crowd. Then load up and get out.",
      },
      notes: {
        "lumberyard-rack": {
          title: "Carla's Clipboard",
          text: "CARLA HERE! Yard boss! If you can read this, you are standing too close to my band saw. Today that is fine.\n\nThe kiln shed has an old padlock with a number dial. The code is {code}: {codeSpoken}. Spin the dial to each number, slowly. Give it a good yank, and the lock drops open.\n\nGet one number wrong, and the old padlock locks up for good. It jams, and after that only a crowbar opens it. So check each number twice.\n\nLeave by the band saw shop door and step into the rack hall. Follow the back wall toward the log pile. The kiln shed door is in that wall. The lumber in the shed is dry, and there are nails too.\n\nNow the big rule. DO NOT RUN THE SAWS. Not once. The noise brings the whole dock crowd, and they come fast. Carry what you need and go quietly.\n\nThanks for reading. Most people do not.\nCarla",
        },
        "lumberyard-trail1": {
          title: "Boats for the Convoy",
          text: "Carla, yard boss, again! You keep finding my notes. I like you already.\n\nBig news. My crew is building flat boats for the River Convoy. They are wide and steady, good for a full load. We use the best planks in the yard. The straight ones, with no knots. I picked every one myself.\n\nSergeant Vega comes by every week to check the boats. Vega knocks on each one, nods, and writes in a little book. Then Vega asks the same question. When can they launch?\n\nMy answer is always the same. Not yet. The river is still too high to launch them. The water is fast and full of logs.\n\nI wrote you one more note. It is out back in the yard, near the log pile. Watch for the big one out there, and walk quietly.",
        },
        "lumberyard-trail2": {
          title: "A Key with a Bookmark",
          text: "Carla again! Out back by the log pile. You found it. Good.\n\nNow for the key. A key lies on the floor of the sales office, beside the wooden bear. It is a long, old-fashioned key with a round loop for a handle. A paper bookmark is tied to it with string.\n\nThat key opens the rare book room at the Public Library. The library is north and west of here. The rare book room has an old lock that bites. The wrong key snaps off inside it and is gone for good.\n\nMrs. Greer came up here one day with a wagon. She needed planks to board the library windows. She had no money, so she paid me with this key. It lives here now, in the ring.\n\nThe ring is simple. Every stash is locked, and its key is hidden in another building. A note always says where.",
        },
        "lumberyard-dead1": {
          title: "Ridge Lumber Yard Rules",
          text: "YARD RULES.\nBy order of Carla, yard boss. No arguing.\n\nWear boots. Real boots, not sneakers.\nLift with your legs, not your back. Your back has to last.\nNever run the saws. I mean never.\nStack it the way you found it.\nSay thank you to the forklift. It has feelings.\n\nThe sheet is nailed to the post in the corner. The paint on it is chipped, and the corners curl up.\n\nAt the bottom, there is a new rule. It is written in a different pen, blue instead of black. The letters are shaky, as if written in a hurry.\n\nIf you hear the dock crowd, freeze. Do not run. Do not talk. Just freeze until they pass. Then count to one hundred, slowly. Then walk. Someone drew a check mark next to it. Maybe they tried it once.",
        },
        "lumberyard-dead2": {
          title: "Code on a Receipt",
          text: "KILN SHED CODE: {decoyCode}. GOT IT FROM THE CREW. HURRY.\n\nThat is all, scrawled on the back of an old receipt. It lies in the rack hall, outside the kiln shed door. The writing is fast and messy. The pen ran out halfway through the last word.\n\nIt sounds like inside news from the crew. Maybe it was, once. But look at the front of the receipt. The date on it is from months ago. Carla changed the padlock code after that. So this receipt has the old code.\n\nSpin the dial to the old code, and the padlock jams for good. Then only a crowbar opens it. You will stand by the shed, tugging, while the dock crowd listens.\n\nCarla's clipboard by the band saw has the code that works now. Trust the clipboard.",
        },
      },
      signs: {
        "lumberyard-sign1": { title: "Painted Yard Sign", text: "Ridge Lumber. Cut to order. The words are painted in tall green letters on a long board. A pine tree stands at each end." },
        "lumberyard-sign2": { title: "Ruby's Red R", text: "Ruby's red R, sprayed tall, with an 8 under it. Below, in fast letters: THEY GATHER AT THE DOCK. STAY AWAY." },
        "lumberyard-sign3": { title: "Safety Sign", text: "CAUTION: EAR PROTECTION NEEDED NEAR THE SAWS. Under it, Carla added in thick marker: The saws stay off! No ear protection needed now!" },
        "lumberyard-sign4": { title: "Spray Paint by the Door", text: "Spray-painted on the wall beside the kiln shed door, in big black letters: CODE ON THE CLIPBOARD. An arrow points toward the racks. The paint has dripped a little." },
      },
      key: { name: "Long key with a bookmark", tag: "The paper bookmark tied to it says: \"Handle with care.\" The key is long and old-fashioned, with a round loop for a handle. It is heavier than it looks." },
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
          text: "My name is Luis. I am a security guard, and this mall is my post.\n\nThe security office has two locks, so do them in order. First, turn off the alarm. Its panel is on the left wall, by the rocking horse. Press the {button} button. Then go to the office keypad. The code is {code}: {codeSpoken}. Type it slowly.\n\nA wrong button sets off the mall alarm. So does a wrong code. So does opening the office while the alarm is still on. Then walkers pour in, even through the front doors. They keep coming until they get you.\n\nGo to the back of the food court and take the kitchen door. Then turn right. The office is behind the green dino. Inside are gun parts, radio parts, and a tool kit.\n\nOne more thing. The walkers here come running at anyone who runs. So walk, even when it feels wrong. Walk, and most of them stay put.",
        },
        "mall-trail1": {
          title: "Still at My Post",
          text: "Luis again. I have stayed at my post since the Fall began. That is a long time to stand in one place. My feet agree.\n\nI know this crowd now. They walk the same slow loop every day. Past the shoe store, past the Book Nook, back by the food court. Then they do it again. If you learn the loop, you can slip around it.\n\nSergeant Vega came by last month. Vega asked me to join the River Convoy. It was a seat on a truck, north along the river. It was a kind offer, and I said no.\n\nSomeone has to watch the mall. People still come here for food and medicine. Someone has to tell them to walk, not run.\n\nI left another note for you. It is in the sports store, beside the orange tent. Walk there. Do not run.",
        },
        "mall-trail2": {
          title: "A Key from Doc Lin",
          text: "Luis. You made it to the sports store. Now cross the mall, slowly.\n\nA key lies on the floor of Toy Town, beside the rocking horse. It is a small silver key on a white tag. The tag has a red cross on it.\n\nIt opens the supply cupboard at St. Anne Annex. That is the hospital, far west of here in the north hills. The supply cupboard has a plain lock. A wrong key just will not turn in it.\n\nDoc Lin left it with me on a medicine run. She stopped here to rest her feet. She said Nurse Ada wants the cupboard used, not saved. Medicine on a shelf helps nobody.\n\nSo the key stays here, in the ring. Every stash is locked, and its key is hidden in another building. You read, so it is yours.",
        },
        "mall-dead1": {
          title: "Luis's Patrol Log",
          text: "PATROL LOG. Guard on duty: Luis.\n\nDay 40. Crowd quiet. Nobody running. Doors held.\nDay 41. Crowd quiet. Nobody running. Doors held.\nDay 42. Crowd quiet. Nobody running. Doors held.\n\nThe log goes on like that for pages. The same six words, in the same neat hand. You can almost hear him say them out loud, standing by the doors.\n\nThen one day is different.\n\nDay 57. Jo came by with batteries and stayed for coffee. Crowd quiet. Good day.\n\nThe words \"good day\" are underlined. Somebody drew a tiny coffee cup next to them. It is not Luis's style. Jo, maybe.\n\nThen the next page goes back to the same six words. Crowd quiet. Nobody running. Doors held. Luis does not get many visitors. You can tell he liked that one.",
        },
        "mall-dead2": {
          title: "Pencil Note, No Name",
          text: "Security office: {decoyCode}. Trust me, I watched the guard type it.\n\nThat is the whole note, in light gray pencil. It is folded in half and wedged under a food court tray. There is no name on it.\n\nIt looks real enough. Someone stood close and watched the keypad. But that was a long time ago. The pencil has faded, and the tray is thick with dust. Luis saw people watching him. So he changed the code, and this one is old now.\n\nType the old code into that keypad, and the mall alarm goes off. Walkers pour in, even through the front doors. In this mall, that is the last thing you want.\n\nLuis's clipboard by the green dino has the code that works now. Luis wrote it himself, in ink. Use that one.",
        },
      },
      signs: {
        "mall-sign1": { title: "Old Banner", text: "A long, faded banner hangs over the floor: Welcome to Northgate Mall! Something for everyone! One corner has come loose and sways." },
        "mall-sign2": { title: "Ruby's Red R", text: "Ruby's red R by the front doors, with a 9 under it. Under that, in huge letters that run down the wall: DON'T RUN. The letters are taller than you are." },
        "mall-sign3": { title: "Store Map", text: "YOU ARE HERE. A store map on the wall shows every aisle. The jewelry vault is marked with a gold star, inside the gadget store, at its front wall." },
        "mall-sign4": { title: "SECURITY", text: "SECURITY. STAFF ONLY. Under it, in black marker: Code on the clipboard by the green dino. Walk, don't run. Signed with a little badge drawing." },
      },
      key: { name: "Silver key, red cross tag", tag: "The white tag has a red cross on one side. The other side says: \"Ada says use it.\" The key is small and silver, and it smells a little like soap." },
    },

    library: {
      blurb: "The Public Library north of downtown: books on every wall, maps, and a locked archive room.",
      door: {
        title: "Mrs. Greer's Book Drop",
        text: "From Mrs. Greer, the librarian. Please read this slowly, as you would any good page.\n\nBooks are in the stacks on both sides of the main hall. More are in the children's room, by the toy castle.\n\nAt least eight walkers are inside. Two of them stand in the main hall, so you will meet them first.\n\nThe archive room is locked. My note is on the reference desk, by the giant globe, at the back on the left. Please keep your voice low in here. The walkers here mind noise more than I do.",
      },
      notes: {
        "library-desk": {
          title: "Three Big Books",
          text: "Mrs. Greer again. Welcome to the reference desk. In better days, people asked me questions here. Now I leave the answers in writing.\n\nThree big books sit on this desk. The archive key is inside the {pick}. Open that book, and the key sits in a hollow cut in the pages. With it, you can open the archive room.\n\nOpen neither of the other two books. I hid a blast trap in each one, for book thieves. Open the wrong book, and the blast kills. Thieves do not read notes. You do.\n\nThe archive door is at the back end of the main hall. It is between two rooms. One is this room, with the giant globe. The other has the tall clock. The archive has books and a folder of city maps.\n\nOne last thing. Reading saved this building. Look at the walls as you leave. They are stacked high with the books nobody wanted.",
        },
        "library-trail1": {
          title: "A Class in the Stacks",
          text: "Mrs. Greer. A small update for anyone keeping track.\n\nMs. Adler's class lives here now. They came in one rainy evening, wet and tired, in a long quiet line. I counted them twice. Now they sleep among the shelves.\n\nWe do not light candles near the books. So the children read by window light, in shifts. They keep quiet, because quiet keeps us safe. They are very good at it now. Better than most adults.\n\nMs. Adler still watches the front door. Every morning and every evening she stands there. She is waiting for the twins, Max and Mia. They were lost in the rush, and she has not stopped looking.\n\nIf you have seen two thirteen-year-olds on the road, please tell us.\n\nMy other note is in the periodicals room, beside the tall clock.",
        },
        "library-trail2": {
          title: "A Tiny Gold Key",
          text: "Mrs. Greer again. Thank you for walking all the way back here.\n\nThere is a key in this library. It lies on the floor of the children's room, beside the toy castle. It is a tiny gold key in a small velvet pouch. The pouch is dark and easy to miss.\n\nIt opens the jewelry vault at Northgate Mall. The mall is east of here. The jewelry vault has a fussy lock. The wrong key jams it, and after that only a crowbar opens it.\n\nLuis the guard sent it to me with Jo. Jo brought it in a coat pocket, with a kind letter. Luis asked me to keep it for the ring. I said yes, of course.\n\nHere is how the ring works. Every stash is locked, and its key is hidden in another building. A note always says where. As a librarian, I approve.",
        },
        "library-dead1": {
          title: "The Class Reading Chart",
          text: "Ms. Adler's class: books we finished.\n\nA big chart is taped to the wall. Each student gets a gold star for every book they finish. Every row has a name and a line of stars.\n\nSome rows are long. One boy has nineteen stars, all crammed together. One girl drew her own stars when the gold ones ran out. A few rows have just two or three.\n\nTwo names at the bottom have no stars yet. Max. Mia.\n\nNext to them, in neat teacher writing, someone wrote three words.\n\nSaving their stars.\n\nUnder that, a whole row of kids signed their names. Each one added a little star of their own, in pencil. They are waiting too. Somebody has already picked out books for the twins. Two thin ones sit on the shelf below the chart.",
        },
        "library-dead2": {
          title: "Index Card Tip",
          text: "Archive key: inside the {decoyPick} on the reference desk. Easy.\n\nThat is what the index card says. It is tucked into the frame of the front door, in the lobby. There is no name on it. The writing is neat, like someone who has used a card catalog before.\n\nIt sounds clever, and it was true once. But read the back of the card. One more line is there, in tidy print. A thief read this card, so Mrs. Greer moved the key. Then she set her traps in the books on the desk. The wrong book now holds a blast trap.\n\nDo not trust a card with no name. Mrs. Greer's note on the reference desk says which book is safe. She hid the key, so she knows. Read her note before you open a single book.",
        },
      },
      signs: {
        "library-sign1": { title: "QUIET, PLEASE", text: "QUIET, PLEASE. The old brass sign still hangs by the stacks. Under it, someone wrote in pencil: It works on walkers too. Trust us." },
        "library-sign2": { title: "A Very Small R", text: "Ruby's red R, with an 8 under it, painted very small in a corner. It looks like she felt bad writing on a library wall." },
        "library-sign3": { title: "Library Hours", text: "LIBRARY HOURS: DAWN UNTIL DARK. Below it, a new card in careful print: No candles near the books. Not one. Not ever." },
        "library-sign4": { title: "Chalk by the Archive", text: "Chalked by the archive door, in tidy letters: Ask Mrs. Greer's note before you open a book. Someone drew a small open book next to the words." },
      },
      key: { name: "Tiny gold key, velvet pouch", tag: "A little card in the velvet pouch says: \"Not for show.\" The key inside is tiny and gold. It is smaller than your thumbnail, so hold it tight." },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
