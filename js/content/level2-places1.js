/* Reading level 2: places, part 1 (gasngo, grocery, hardware, pharmacy, autoshop, radioshack, garden). Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[2] = root.ZSR.TEXT[2] || { level: 2 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    /* ---------- Gas-N-Go ---------- */
    gasngo: {
      blurb: "A small gas station on the south road, with fuel and a locked storeroom.",
      door: {
        title: "Ruby's Warning on the Door",
        text: "Ruby here. Read this before you go in.\n\nAt least three walkers are inside. One is in the garage, by the car lift. The garage is on your right. More come as the days pass.\n\nOne fuel can is by the slushie machine, on your left. The other is in the garage, by the tire tower.\n\nThe storeroom is locked. The clerk left a note on the counter. It is right by the front door. Walk, do not run.",
      },
      notes: {
        "gasngo-counter": {
          title: "Dev's Note at the Register",
          text: "This is Dev. I was the clerk here. I never thought I would write a note like this.\n\nThe storeroom key is in the {pick} of this counter. Those drawers are right under this note. That key opens the storeroom door.\n\nOpen no other drawer! My sister Ruby rigged the other two. Each one has a bomb trap for looters. Open the wrong one, and it kills you.\n\nThe storeroom has more fuel and a spool of wire. Go into the back hall at the ice machine end. Walk to the far end. The storeroom is the last door before the garage.\n\nI went to Ortiz Auto, on the east side of town. The shop is still standing.\n\nNeed food? Rosa runs Greenhouse Row. It is west, past this gas station. She has seeds and soil.",
        },
        "gasngo-trail1": {
          title: "Ruby Came Back",
          text: "Ruby again. I came back here today. I found my brother's note by the register. Dev was the clerk here. He wrote that he went east, to Ortiz Auto. So I am going east, too. Right after him.\n\nHe did not wait for me. That is so Dev. He always thinks he can fix things alone.\n\nI asked Jo to say it on the radio. Jo will tell the town I am looking for Dev. If you see him, tell him to stay put.\n\nOne more thing. I left a second note for you. It is on the floor behind the counter, near the register. That is across the shop from the slushie machine. Read it.",
        },
        "gasngo-trail2": {
          title: "For Anyone Who Reads",
          text: "You read this far. Good.\n\nJo and I made a rule. Take what you need. Leave the rest. Every stash in town is locked. Its key is hidden in another building. A note there says where. So only people who read can find them.\n\nHere is your key. It lies on the floor in the garage, beside the tire tower. It is a small brass key on a green plastic tag. It opens the staff locker at Corner Grocery, east of here. Hana, the grocery manager, gave it to me. That was the first day of the ring.\n\nThe staff locker has a fussy lock. The wrong key jams it. Then only a crowbar opens it.\n\nRuby",
        },
        "gasngo-dead1": {
          title: "Dev's Last Shift List",
          text: "TO DO. Dev. My last shift before the Fall. I did not know it then.\n\nMop the floor. The whole floor, not just by the door. The boss checks under the shelves now.\n\nFill the coffee. Both pots. The truck drivers get grumpy at six.\n\nFix the ice machine. It keeps making that grinding sound. Kick it gently on the left side.\n\nAt the bottom, in bigger letters: Call Ruby back. She called three times today.\n\nNothing on the list is crossed off. The pen is still clipped to the page. The coffee pots are dry. The ice machine is quiet now. Everything is quiet now.",
        },
        "gasngo-dead2": {
          title: "A Scrap of Receipt",
          text: "A scrap of an old receipt, in shaky pencil. Nobody signed it.\n\nWant the storeroom? Here is the trick. The storeroom key is in the {decoyPick} of the counter. Just pull it open and grab the key. Easy. I did it myself.\n\nIt sounds like a good tip. But look at the date on the receipt. It is from the first week of the Fall.\n\nSince then, Ruby set her traps in the counter drawers. This scrap was written before that. The drawer it names is a trap now. Open it, and it kills you.\n\nDo not trust it. Dev's note on the counter says which drawer is safe now. Read that one first.",
        },
      },
      signs: {
        "gasngo-sign1": {
          title: "Faded Store Sign",
          text: "Gas-N-Go. Always open. Someone crossed out the word always in black marker. Above it, they wrote not. Now it says Gas-N-Go, not open.",
        },
        "gasngo-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's big red R by the front door. Under it, a 3. She counted three walkers in here. Smaller, under that: Don't run. Walk and look.",
        },
        "gasngo-sign3": {
          title: "Chalk Key Circle",
          text: "Chalk circle by the old safe room door. Small key inside. This lock's key is in another building. Find the note that says where.",
        },
        "gasngo-sign4": {
          title: "STAFF ONLY",
          text: "STAFF ONLY. A metal sign beside the storeroom door. Under it, in Dev's writing: Key in the counter drawers. Read my note before you open one.",
        },
      },
      key: {
        name: "Small brass key, green tag",
        tag: "A small brass key on a green plastic tag. The tag says: Leave some for the next one. The letters are small and neat.",
      },
    },

    /* ---------- Corner Grocery ---------- */
    grocery: {
      blurb: "A corner store with food and a walk-in cooler that still runs cold.",
      door: {
        title: "Doc Lin on the Glass",
        text: "Doc Lin wrote this. I stop here often, so read it well.\n\nThe shelves are picked over. The food that is left is on the floor. Look by the fish tank, on your left. More is by the freezers on the right.\n\nWalkers get in through the loading door at the back. It is by the forklift. Count on at least three.\n\nThe walk-in cooler is locked. The manager's note is in the office, back left.",
      },
      notes: {
        "grocery-counter": {
          title: "Hana's Cooler Trick",
          text: "I am Hana, the store manager. I know every squeak in this store.\n\nThe walk-in cooler latch sticks. To open it, {moves}, in that order. Do it just like that. Work it any other way, and the latch jams tight. After that, only a crowbar opens the cooler.\n\nLeave this office. Walk down the back hall toward the forklift. The cooler is the next door.\n\nInside there is food. There is one medical kit, too. Please take only what you need.\n\nNext, try Mile 9 Pharmacy. It is west of here. Last week it still had medicine on its shelves. Mr. Okafor runs it. He is careful, but fair.",
        },
        "grocery-trail1": {
          title: "Doc Lin's Route",
          text: "Doc Lin here. I am a doctor. These days I am mostly a mule.\n\nI carry medicine on foot. It starts here. Then it goes to the pharmacy. Then it goes north to St. Anne Annex. Nurse Ada stayed there, with the sick. She needs what I bring.\n\nThe cooler here keeps her medicine cold. It waits there until I can carry it.\n\nBut I have not reached Ada for weeks. The road into the hills is full of walkers. I keep trying. I will keep trying.\n\nHana left a note for the next reader. It is on the loading dock, beside the forklift. Go and read it.",
        },
        "grocery-trail2": {
          title: "Hana's Key for the Ring",
          text: "Hana again. You found the loading dock. Good.\n\nA key lies on the floor beside the gumball machine. That is near the front of the store. It is a long silver key on a red string.\n\nIt opens the narcotics safe at Mile 9 Pharmacy. That is west of here. Mr. Okafor gave me this key for the ring. He said I never took more than I needed.\n\nBe careful at that safe. Its old lock bites. The wrong key snaps off inside it. Then that key is gone for good.\n\nThat is how the ring works. Each key waits in another place, with a note. Take what you need. Leave the rest.",
        },
        "grocery-dead1": {
          title: "A Kid's Shopping List",
          text: "A shopping list on lined paper. The writing is big and wobbly. A kid wrote it in green crayon. A smiley face is drawn at the top.\n\nShopping list.\nPeanut butter, the crunchy kind.\nBatteries for my flashlight.\nApples, but not the green ones.\nDog food, a big bag.\n\nNext to dog food, a grown-up wrote in pen. We don't have a dog.\n\nUnder that, the kid wrote one word. It is pressed in hard: Yet.\n\nSomeone folded the list in half and kept it. Then they dropped it here. Maybe they left in a hurry. Maybe they found a dog.",
        },
        "grocery-dead2": {
          title: "Cardboard Cooler Tip",
          text: "A flap of cardboard on the floor. It was torn from a box. Nobody signed it.\n\nCOOLER TIP. The latch sticks, but there is a trick. To open it, {decoyMoves}. Easy. Works every time.\n\nIt sounds sure of itself. But the cardboard is old and soft. Water stains run across one corner.\n\nNow look at the cooler door. The latch on it is shiny and new. Hana put in a new latch after this was written. This was the trick for the old latch. Work the new one this way, and it jams.\n\nHana's note in the office has the trick that works now. Trust the manager, not the cardboard.",
        },
      },
      signs: {
        "grocery-sign1": {
          title: "Bread Sign",
          text: "Corner Grocery. Fresh bread every morning! The bread rack under the sign is empty. There are not even crumbs left on it.",
        },
        "grocery-sign2": {
          title: "Black Marker",
          text: "THE LOADING DOOR AT THE BACK DOESN'T SHUT. Under it, smaller: Watch your back. The black marker still looks fresh.",
        },
        "grocery-sign3": {
          title: "Soup Sale Sign",
          text: "SALE! Soup, two cans for the price of one! Someone added in pen: Deal still stands. Everything is free now.",
        },
        "grocery-sign4": {
          title: "Cooler Door Sign",
          text: "WALK-IN COOLER. KEEP THE DOOR CLOSED. Hana wrote under it: The trick is in my note in the office. Any other way, the latch jams.",
        },
      },
      key: {
        name: "Long silver key, red string",
        tag: "A long silver key on a red string. The tag says: Count what you take. Someone wrote it in careful capitals.",
      },
    },

    /* ---------- Reyes Hardware ---------- */
    hardware: {
      blurb: "A big hardware store east of town, with nails, tools, and lumber.",
      door: {
        title: "Mr. Reyes Nailed This Up",
        text: "Mr. Reyes, owner. This is my store. Treat it right.\n\nAt least five walkers are inside. Two are in the middle aisles. Watch those two first.\n\nNails are by the toilet display, on your left. Tools are in the middle aisle. Lumber is in the lumber racks at the back.\n\nThe back room is locked. My note is by the paint mixer, back left. It tells you how to get in.",
      },
      notes: {
        "hardware-paint": {
          title: "The Sticky Door Trick",
          text: "Mr. Reyes again. Thank you for reading this far.\n\nThe back room door sticks in its frame. It always did. To open it, push it {move1}, then {move2}. Do it in that order. Push it any other way, and it jams for good. After that, only a crowbar opens it.\n\nTake the side door by the paint mixer. Walk past the lumber racks. The back room door is there.\n\nI left a water filter in there. There is a second tool kit, too. And there is some lumber.\n\nNeed more wood? Ridge Lumber is on the east ridge. It has stacks of lumber. Carla runs that yard. Need more filters? The Water Tower is on the west side. More filters are in its pump house.",
        },
        "hardware-trail1": {
          title: "Where the Keys Were Cut",
          text: "Mr. Reyes here. Let me tell you how it started.\n\nRuby and Jo came in one cold morning. They had an idea. They called it the key ring. Lock up the best supplies. Hide each key somewhere else. Leave a note.\n\nI liked it. So I cut the first keys. I used the key machine right here in my store. Fifteen keys for fifteen stashes. It took me two whole days.\n\nThe rule is simple. No key stays in the building it opens. Each one waits somewhere else, with a note.\n\nMy other note is in the paint department. It is near the paint mixer.",
        },
        "hardware-trail2": {
          title: "The First Key I Cut",
          text: "Mr. Reyes once more. Here is your key.\n\nLook on the floor beside the toilet display. It lies against the wall. It is a copper key. A leaf is scratched into its head.\n\nIt opens the seed vault at Greenhouse Row. That is far west, across town.\n\nIt was the very first key for the ring. Rosa asked me to keep it here. She laughed. She said a hardware store was perfect. It is the last place a seed thief would look.\n\nThe seed vault has a plain lock. A wrong key just will not turn. Take this one to her vault. Then plant something.",
        },
        "hardware-dead1": {
          title: "Who Borrowed My Tools",
          text: "BORROWED TOOLS. Bring them back!\n\nCarla: one long saw. She said one week. Then she said two weeks. Carla wrote back in pencil: Still sawing. Soon.\n\nChief Dunn: two ladders. They were for the station roof. He signed for them, like a gentleman. He left a jar of nails as thanks.\n\nTheo: one pipe wrench. Never returned. Again.\n\nUnder the list, Mr. Reyes added a line. That is the third wrench for Theo. I am starting to think he collects them. Next time he pays me in water.\n\nThe list is pinned to the wall with a nail. Of course it is.",
        },
        "hardware-dead2": {
          title: "A Pencil Tip",
          text: "A note in pencil. Nobody signed it. The writer pressed hard, like they were sure.\n\nPsst. The back room door is not locked. It just sticks. Push it {decoyMove1}, then {decoyMove2}. It pops right open. Trust me.\n\nLook at the date in the corner. It is from last spring. Now look at the back room door. Its frame is bent. A storm did that, after this note was written. The old way does not work on a bent frame. Push it this way, and it jams.\n\nMr. Reyes's note by the paint mixer has the way that works now. Read that one.",
        },
      },
      signs: {
        "hardware-sign1": {
          title: "Hand-Painted Store Sign",
          text: "Reyes Hardware. The letters are hand-painted, red on white. Under the name, a promise. If we don't have it, you don't need it.",
        },
        "hardware-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R by the front door, with a 5 under it. Under that, in smaller letters: Two in the middle aisles.",
        },
        "hardware-sign3": {
          title: "KEYS CUT HERE",
          text: "KEYS CUT HERE, with an arrow. Next to it, a circle with a key inside. The arrow points to the paint vault, in the paint department.",
        },
        "hardware-sign4": {
          title: "Marker on the Door",
          text: "Marker on the back room door: It sticks. Read my note by the paint mixer before you push it. Signed: Mr. Reyes.",
        },
      },
      key: {
        name: "Copper key with a leaf",
        tag: "A copper key with a leaf scratched into its head. The tag says: Take only what you need. The leaf is small but sharp.",
      },
    },

    /* ---------- Mile 9 Pharmacy ---------- */
    pharmacy: {
      blurb: "A small pharmacy west of town, with medical kits and a cabinet room.",
      door: {
        title: "Mr. Okafor's Door Note",
        text: "Mr. Okafor, pharmacist. Please read this slowly. I wrote it slowly.\n\nOne medical kit is by the giant toothbrush. The other is in the middle, where the aisles cross.\n\nThere are at least five walkers inside. Most of them stay near the back.\n\nThe cabinet room is locked. Its code is on my note behind the counter. Go around the right end of the counter, by the wheelchairs. Use that code. Only that one.",
      },
      notes: {
        "pharmacy-counter": {
          title: "The Cabinet Room Code",
          text: "Mr. Okafor again. I was the pharmacist here for twenty years. I am careful with codes.\n\nThe cabinet room keypad code is {code}. Say it in your head: {codeSpoken}. Use that code and no other. One wrong code sets off the alarm. Then walkers pour in, even through the front door. They keep coming until they get you.\n\nThe cabinet room door is behind this counter. It is in the corner, on the same side as the wheelchairs. Inside are two more medical kits. There is a water filter, too.\n\nNeed more? St. Anne Annex is the hospital in the north hills. It still has medicine and a generator. But it is the most dangerous place in town.",
        },
        "pharmacy-trail1": {
          title: "Doc Lin Turned Back",
          text: "Mr. Okafor writing. Doc Lin stops here every few days. She fills her bag for Nurse Ada. I count every pill into it. Then she counts them again. We are both careful people.\n\nLast time, she came back too soon. She turned back on the road up the hill. That road runs below St. Anne Annex. There were too many walkers on it.\n\nNow she has a new plan. The River Convoy will go north. Lin will ride with it as far as St. Anne. Then she will walk the rest.\n\nI left a second note. It is on the floor near the giant toothbrush. Look under the SMILE poster.",
        },
        "pharmacy-trail2": {
          title: "The Key With Blue Paint",
          text: "Mr. Okafor, one more time. This note is about the key ring.\n\nA key lies on the floor beside the pill bottle. That is near the front of the store. It is a stubby iron key. It has drops of blue paint on it.\n\nIt opens the paint vault at Reyes Hardware. That is east of here, across town. Mr. Reyes cut this key himself. He keeps none of his own keys. Not one. That is how the ring works.\n\nThe paint vault has a fussy lock. The wrong key jams it. Then only a crowbar opens it. So take this key east. Then leave something for the next person.",
        },
        "pharmacy-dead1": {
          title: "A Bag for June",
          text: "A white paper bag from the pickup shelf. Nobody came for it. A printed label is stapled to the top. The staple has gone rusty.\n\nName: June.\nFor: sore knees. Take one with food.\n\nThe pills are inside. The bottle is still sealed.\n\nOn the side of the bag, Mr. Okafor wrote in pen: She always forgets these. Call her on Tuesday.\n\nUnder that, in newer ink: Could not call. The phones are down. I kept it here anyway, in case she comes.\n\nThere are lots of people named June. But one June is a gardener. Gardeners kneel in the dirt all day.",
        },
        "pharmacy-dead2": {
          title: "Yellow Sticky Note",
          text: "A yellow sticky note, curled at the edges.\n\nCabinet room code: {decoyCode}. Do NOT lose this.\n\nIt looks useful. It sits right inside the front door, where anyone would see it. The writing is neat, like Mr. Okafor's.\n\nBut the ink has faded. The sticky part has lost its stick. This note is old. Mr. Okafor changed the code after it was written. So this code is wrong now. Punch it in, and the alarm goes off.\n\nDo not trust this one. The code on the counter note is the one that works. Mr. Okafor wrote that one himself.",
        },
      },
      signs: {
        "pharmacy-sign1": {
          title: "Counter Sign",
          text: "PLEASE WAIT TO BE CALLED. A sign by the counter. Someone added in blue pen: We will call you. Someday.",
        },
        "pharmacy-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R by the front door, with a 5 under it. Five walkers when she counted. An arrow points to the back: most stay there.",
        },
        "pharmacy-sign3": {
          title: "Health Poster",
          text: "CLEAN WATER SAVES LIVES. A cartoon glass of water smiles at you. In big letters: If you can't filter it, boil it.",
        },
        "pharmacy-sign4": {
          title: "Cabinet Room Door",
          text: "CABINET ROOM. STAFF ONLY. Under it, in neat pen: Code changed. Use the one on the counter note.",
        },
      },
      key: {
        name: "Stubby iron key, blue paint",
        tag: "A stubby iron key, with drops of blue paint. The tag says: Cut by Reyes. The paint is old and dry.",
      },
    },

    /* ---------- Ortiz Auto ---------- */
    autoshop: {
      blurb: "A repair shop on the east side, with engine parts and a service pit.",
      door: {
        title: "Dev's Chalk Note",
        text: "Dev, from the Gas-N-Go. Ruby, if this is you, read the notes inside, too.\n\nEngine parts are on the workbenches. One is in the back right, by the red tool chest. One is in the left bay.\n\nAt least five walkers are inside. One wanders the parts room, by the engine crane. It never stays still.\n\nThe service pit is under a locked hatch. Mr. Ortiz left a note in the office. It is behind the waiting room.",
      },
      notes: {
        "autoshop-office": {
          title: "Mr. Ortiz on the Hatch",
          text: "This is Mr. Ortiz. I ran this shop for thirty years. I know every bolt in it.\n\nThe hatch bolt is tricky. To open it, {moves}, in that order. Do it just like that. Any other way bends the bolt. Then the hatch jams. After that, only a crowbar opens it.\n\nThe pit room stands in the middle of the shop. Its hatch is on the front side, toward the oil drums.\n\nMy generator is down in the pit. There are spare parts and a fuel can with it.\n\nSignal Electronics is downtown. It still has wire and radio parts. But it is near the walker crowds. Go in fast. Get out faster.",
        },
        "autoshop-trail1": {
          title: "Ruby, It Runs",
          text: "Ruby. It's me, Dev. If you are reading this, you came east. I knew you would.\n\nMr. Ortiz and I fixed the truck. We fixed it together. It runs! It rattles like a can of bolts, but it runs.\n\nWe are driving west to the Water Tower. Theo is there. He has clean water. He has room for two. So we are going.\n\nI am sorry I did not wait for you. I should have. I will wait at the tower. I promise.\n\nMr. Ortiz left a note, too. It is at the back of the shop, beside the red tool chest.",
        },
        "autoshop-trail2": {
          title: "Chief Dunn's Red Key",
          text: "Mr. Ortiz again. You read the boy's note. Good. Now read mine.\n\nA key lies on the floor of the waiting room. It is beside the soda machine. It is a big key, painted fire-engine red. It hangs on a brass ring.\n\nIt opens the chief's locker at Station 12. That is north and west of here. Chief Dunn left it with me. It was his thanks for fixing the convoy's trucks.\n\nIt waits here for the key ring. Every key sits in a different building.\n\nThe chief's locker has an old lock that bites. The wrong key snaps off inside it. Then that key is gone for good.",
        },
        "autoshop-dead1": {
          title: "Mr. Ortiz's Job Board",
          text: "JOB BOARD. Written in grease pencil on an old whiteboard.\n\nChief Dunn's fire truck: new brakes. Done. Tested twice on the hill.\n\nSergeant Vega's van: new tires. Done. She paid in coffee.\n\nCarla's boat motor: not done yet. It still needs a part.\n\nOld truck in the back: Dev is helping. Almost there.\n\nAt the bottom, Mr. Ortiz drew a small boat. Next to it he wrote: Soon, Carla. I promise.\n\nThe board has not been wiped in a long time. The words are smudged at the edges. Nobody came back for the boat motor. It still sits on the bench.",
        },
        "autoshop-dead2": {
          title: "Greasy Warning",
          text: "A note on greasy paper. It is torn at the top. Nobody signed it. The paper smells like old oil.\n\nThe pit hatch is easy. The bolt comes out if you {decoyMoves}. I have done it ten times. Then just lift the hatch.\n\nIt sounds like someone who knows. But look at the bolt on the hatch. It is bright and clean, with no rust at all. Mr. Ortiz put in a new bolt. This note is about the old one. Work the new bolt that way, and it bends and jams.\n\nMr. Ortiz's note by the office tells the real trick. Read that one instead.",
        },
      },
      signs: {
        "autoshop-sign1": {
          title: "Painted Shop Sign",
          text: "Ortiz Auto. Honest repairs. Under it is a row of greasy handprints. Some are big. Some are very small.",
        },
        "autoshop-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R by the front door, with a 5 under it. Next to it, an arrow. It says: One by the engine crane.",
        },
        "autoshop-sign3": {
          title: "Safety Poster",
          text: "SAFETY FIRST. Never work under a car alone. Someone added a line in marker. Never work anywhere alone. Good advice.",
        },
        "autoshop-sign4": {
          title: "Metal Plate",
          text: "SERVICE PIT. KEEP THE HATCH SHUT. Under it, in chalk: The bolt bends if you work it wrong. Mr. Ortiz's note says how.",
        },
      },
      key: {
        name: "Big red key, brass ring",
        tag: "A big key painted fire-engine red, on a brass ring. The tag says: Return the favor. It is heavy in your hand.",
      },
    },

    /* ---------- Signal Electronics ---------- */
    radioshack: {
      blurb: "An electronics store downtown with wire, near the walker crowds.",
      door: {
        title: "Jo's Sign in the Window",
        text: "Jo wrote this. Yes, that Jo. The voice on the radio.\n\nSpools of wire are between the two long middle shelves. One is on the TV wall side. One is on the robot side.\n\nAt least six walkers are inside. One stands near the right end of the counter, by the robot. Do not wake it up.\n\nThe manager's office is locked. The manager's note is on the counter at the back. Read it, and do just what it says.",
      },
      notes: {
        "radioshack-counter": {
          title: "Priya's Alarm and Code",
          text: "I am Priya, the manager. I fix things. Do this in order.\n\nFirst, turn off the alarm. Its panel is on the right wall, by the big dish. Press the {button} button. Do that first!\n\nThen go to the office door. It is in the back wall near the robot, beside the MANAGER sign. The keypad code is {code}. Say it like this: {codeSpoken}.\n\nA wrong button sets off the alarm. So does a wrong code. So does opening the office with the alarm still on. Then walkers pour in, even through the front door. They come until they get you.\n\nThe office has two boxes of radio parts and more wire.\n\nTwo places are north of downtown. The 4th Precinct police station has gun parts. Lincoln Middle School has books.",
        },
        "radioshack-trail1": {
          title: "Jo on 88.1",
          text: "Jo here. You might know my voice. I am on 88.1 every night. I talk from a rooftop downtown. I read news, warnings, and messages.\n\nIt all started in this store. Priya built my first transmitter right here. She used parts from these shelves. Wire, a box, and a lot of tape. It worked on the first try. She still brags about that.\n\nI carry messages now. Doc Lin cannot reach Nurse Ada. Ada cannot reach Lin. So I pass their words along, every night.\n\nPriya left a note for you. It is on the floor below the TV wall.",
        },
        "radioshack-trail2": {
          title: "The Water Drop Key",
          text: "Priya again. Jo told you about me. Most of it is true.\n\nHere is the key. It lies on the floor beside the arcade game. That is near the front of the store. It is a long, thin key. Its blue tag is shaped like a drop of water.\n\nIt opens the tool crib at the Water Tower. That is far west of here. Theo gave me this key. Jo and I needed his tools. We put an antenna on his tower.\n\nNow the key stays here, as part of the ring.\n\nThe tool crib has an old lock that bites. The wrong key snaps off inside it. Then that key is gone for good.",
        },
        "radioshack-dead1": {
          title: "Jo's Show Plan",
          text: "SHOW PLAN. It is taped to the shelf with silver tape. Jo wrote it in capitals.\n\nNews at dusk. Keep it short.\nThen music. Two songs, maybe three.\nThen messages. Read every name slowly.\n\nWarnings first, always. Before the news. Before anything.\n\nSay 88.1 twice. Some people tune in late.\n\nKeep the mic away from the window. Walkers hear everything. Then say goodnight, with names when you can.\n\nAt the bottom, underlined two times: No sad songs. People have enough.\n\nA coffee ring stains one corner. Someone drew a tiny radio tower in the margin. It has little lines coming off the top.",
        },
        "radioshack-dead2": {
          title: "Torn Envelope",
          text: "A note on a torn envelope. Nobody signed it. The writing is quick and sloppy.\n\nAlarm panel tip! Press the {decoyButton} button. That turns the alarm off. Then the office is all yours.\n\nThat sounds handy. But the envelope is old. It is yellow and soft, and the stamp is from before the Fall.\n\nLook at the panel by the big dish. Its wires are new. Priya rewired the panel after this note was written. So the button it names is wrong now. Press it, and the alarm goes off.\n\nPriya's note on the counter has the button that works now. Read hers.",
        },
      },
      signs: {
        "radioshack-sign1": {
          title: "Store Sign",
          text: "Signal Electronics. A big store sign, blue on gray. Under the name: We fix what others throw away.",
        },
        "radioshack-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R, with a 6 under it. Under that: One by the robot, at the end of the counter. Six walkers when she counted.",
        },
        "radioshack-sign3": {
          title: "Yellow Numbers",
          text: "88.1, painted in big yellow numbers. Under it: Jo, every night at dusk. Somebody drew little radio waves around it.",
        },
        "radioshack-sign4": {
          title: "Office Door Sign",
          text: "MANAGER'S OFFICE. PLEASE KNOCK. A neat little sign on the office door. Under it, in marker: Priya says look under the register.",
        },
      },
      key: {
        name: "Long thin key, water-drop tag",
        tag: "A long, thin key. Its blue tag is shaped like a drop of water. The tag says: Bring the wrench back.",
      },
    },

    /* ---------- Greenhouse Row ---------- */
    garden: {
      blurb: "Greenhouses on the west edge of town, with seeds, soil, and a locked shed.",
      door: {
        title: "Rosa Painted the Gate",
        text: "Rosa, who ran this greenhouse. Welcome, if you come in peace.\n\nSoil bags are in the big greenhouse, with the scarecrow. Seed packets are in the shop by the gate. Look near the big gnome.\n\nAt least five walkers are inside. One stays at the back of the big greenhouse. Keep the beds between you and it.\n\nThe potting shed is locked. My note is on the potting bench, by the palm tree. It is back right.",
      },
      notes: {
        "garden-bench": {
          title: "Rosa's Watering Cans",
          text: "Rosa again. You found my bench. Sit a minute, if it is safe.\n\nThree watering cans sit by this bench. The shed padlock key is in the {pick}. Tip that one, and the key falls out.\n\nDo not touch the other two cans! They are my walker alarm. They are full of bells and tin cans. Tip one over, and the noise brings walkers. More and more come, even through the gate. They keep coming until they get you.\n\nLeave the palm tree house. Take the path down toward the beehives. The shed door is on that path. The shed has more seeds and a water tank.\n\nThen go north. Station 12 is the fire station north of here. Its equipment bay has tools and water tanks.",
        },
        "garden-trail1": {
          title: "A Rattling Truck",
          text: "Rosa here. Let me tell you about a truck.\n\nA rattling old truck pulled up at my gate. Dev and Mr. Ortiz were in it. They stopped to fill their water jugs. I let them use my hose. The truck coughed smoke the whole time. Dev talked about his sister the whole time, too.\n\nThey were going north to the Water Tower. Theo is there. Theo has clean water.\n\nThe very next day, Ruby came. She was asking for Dev. She looked so tired. I told her where he went. She thanked me and ran north.\n\nMy other note is in the big greenhouse. It is by the scarecrow.",
        },
        "garden-trail2": {
          title: "Mr. Ortiz's Greasy Key",
          text: "Rosa, one more note. This one is about a key.\n\nLook on the floor beside the beehives. The key is there. It is greasy steel. It hangs on a loop of wire. Do not wipe it. The grease keeps the rust off.\n\nIt opens the parts cage at Ortiz Auto. That is far east, across town. Mr. Ortiz gave me this key when the truck stopped here. He did not want the ring to break.\n\nThe parts cage has a plain lock. A wrong key just will not turn. A key never stays home, so carry this one east.",
        },
        "garden-dead1": {
          title: "Rosa's Planting Chart",
          text: "PLANTING CHART. Rosa drew it in pencil, with little boxes.\n\nBeans go by the gate. They like to climb the fence.\nTomatoes go at the back. Stake them early.\nSquash goes where the sun hits. It needs the most light.\n\nA note beside the beans. My old friend June gave me these seeds. She grew them at the school garden. The squash box has a little sun drawn in it. Water every morning, before the heat.\n\nAt the bottom, circled: Tell June the beans came up!\n\nThe chart has dirt on it and a muddy thumbprint. Someone used it a lot.",
        },
        "garden-dead2": {
          title: "A Stranger's Note",
          text: "A note from a stranger. It is written on an empty seed packet.\n\nWant into the potting shed? The shed key is in the {decoyPick}. Tip it out, and you are in. You are welcome. Signed: just passing through.\n\nIt sounds like a kind tip. But turn the packet over. Rosa wrote on the back, in green ink.\n\nA looter read this note and came for my key. So I moved the key. That can is part of my alarm now. My note on the potting bench says where the key is now.\n\nRosa drew a small bean next to her words. The bean is frowning.",
        },
      },
      signs: {
        "garden-sign1": {
          title: "Wooden Sign",
          text: "Greenhouse Row. Plants, seeds, soil. Below that, in smaller letters: Open from dawn to dusk. The paint is peeling.",
        },
        "garden-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R, with a 5 under it. Under that, in a hurry: One at the back of the big greenhouse.",
        },
        "garden-sign3": {
          title: "Chalk Key Circle",
          text: "Chalk circle with a key inside, by the seed vault door. It is in the shop. Under it: Key not here. Read the notes.",
        },
        "garden-sign4": {
          title: "Potting Shed Sign",
          text: "POTTING SHED. MIND THE STEP. A small watering can is painted next to the words. The step really is high.",
        },
      },
      key: {
        name: "Greasy steel key, wire loop",
        tag: "A greasy steel key on a loop of wire. The tag says: Fix something good. It leaves grease on your fingers.",
      },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
