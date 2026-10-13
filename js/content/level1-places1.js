/* Reading level 1: places, part 1 (gasngo, grocery, hardware, pharmacy, autoshop, radioshack, garden).
   Facts: js/world.js and js/story.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[1] = root.ZSR.TEXT[1] || { level: 1 });
  T.locations = T.locations || {};
  Object.assign(T.locations, {
    /* ---------- Gas-N-Go ---------- */
    gasngo: {
      blurb: "Fuel cans on a gas station floor, and Ruby's red R.",
      door: {
        title: "Ruby's Warning",
        text: "At least three walkers inside. One is in the garage, by the car lift. More come each day.\n\nFuel: one can by the slushie machine. One more in the garage, by the tire tower.\n\nThe storeroom is locked. The clerk's note is on the counter. It is by the front door, on the right.\n\n—Ruby",
      },
      notes: {
        "gasngo-counter": {
          title: "Dev's Counter Note",
          text: "I am Dev. I am the clerk here. Well, I was.\n\nThe storeroom key hangs on a hook. The hook is under this counter. Reach down and feel for it. Now you can open the storeroom. More fuel is in there. A spool of wire too.\n\nTake the back hall. Go away from the ice machine. The storeroom is the last door before the garage.\n\nI go east to Ortiz Auto. The shop still stands. Need seeds or soil? See Rosa at Greenhouse Row. Head west, past the gas station.\n\n—Dev, the clerk",
        },
        "gasngo-trail1": {
          title: "Ruby Goes East",
          text: "I am back. Dev is not. He is my kid brother.\n\nI find his note by the register. He goes east to Ortiz Auto. So I go east too. Right now.\n\nI ask Jo for help. Jo is on the radio each night. Jo will say my name. Jo will say I look for Dev.\n\nI leave a second note. It is on the floor behind the counter. Look near the register. That is across the shop from the slushie machine.\n\n—Ruby",
        },
        "gasngo-trail2": {
          title: "For Those Who Read",
          text: "You read this far.\n\nA key lies on the floor in the garage. It is by the tire tower. Small brass key. Green plastic tag. It opens the staff locker. It is at Corner Grocery. Go east.\n\nJo and I made a rule. Take what you need. Leave the rest. Each stash is locked. Its key hides in another building. A note says where. So only readers find them.\n\nHana runs the grocery. She gave me this key. That was day one of the ring.\n\n—Ruby",
        },
        "gasngo-dead1": {
          title: "Dev's Last Shift",
          text: "A to-do list. It is in Dev's hand. It is from his last shift. That shift was just before the Fall. The paper is soft and gray.\n\nTO DO:\nMop the floor.\nFill the coffee.\nFix the ice machine.\n\nAt the bottom, small: Call Ruby back.\n\nNot one thing is crossed off. The mop still leans on a shelf. The coffee pot is still empty. Did Ruby ever get that call?",
        },
      },
      signs: {
        "gasngo-sign1": {
          title: "Faded Store Sign",
          text: "Faded red letters: Gas-N-Go, always open. Someone crossed out “always.” Over it, in pen: “not.”",
        },
        "gasngo-sign2": {
          title: "Red Spray Paint",
          text: "A big red R by the door. Under it, a 3. Ruby counted three walkers here. Below: Don't run. Walk and look.",
        },
        "gasngo-sign3": {
          title: "Chalk Circle",
          text: "Chalk by the old safe room door. A circle, key inside. The key is in another building. A note says where.",
        },
        "gasngo-sign4": {
          title: "STAFF ONLY",
          text: "A metal sign by the storeroom door. STAFF ONLY. Dev wrote under it. “Key on the hook. You know where.”",
        },
      },
      key: {
        name: "Small brass key, green tag",
        tag: "The tag says: “Staff locker. Leave some for the next one.” The key is small and brass. The tag is green plastic.",
      },
    },

    /* ---------- Corner Grocery ---------- */
    grocery: {
      blurb: "Small store, food on the floor, a cold locked cooler.",
      door: {
        title: "Marker on the Glass",
        text: "Front shelves are picked over. The food left is on the floor. Look by the fish tank. More is by the freezers, on the right.\n\nWalkers get in at the back. They use the loading door, by the forklift. Count on three, at least.\n\nThe walk-in cooler is cold and locked. The manager's note is in the office. That is back left.\n\n—Doc Lin",
      },
      notes: {
        "grocery-counter": {
          title: "Hana's Cooler Trick",
          text: "This is Hana. I run this store. I still do, sort of.\n\nThe cooler latch sticks. Do not yank it. Lift the latch up. Pull at the same time. It opens. You can open the cooler now. Food is inside. So is one med kit.\n\nLeave this office. Go down the back hall, toward the forklift. The cooler is the next door. Shut it when you go.\n\nNeed more meds? Try Mile 9 Pharmacy. It is west of here. Last week, its shelves had meds.\n\n—Hana, manager",
        },
        "grocery-trail1": {
          title: "Doc Lin's Route",
          text: "I am Doc Lin. I carry meds. They go from here to the pharmacy. Then I go north to St. Anne Annex. Nurse Ada stayed there.\n\nThe cooler here keeps her meds cold. They wait in it for me.\n\nI have not seen Ada in weeks. Walkers fill the road into the hills. I try. I turn back. I try again.\n\nHana left a note for the next reader. It is on the loading dock, by the forklift.\n\n—Doc Lin",
        },
        "grocery-trail2": {
          title: "Hana Hides a Key",
          text: "Hana again. You found my note. Good.\n\nGo to the front of the store. Find the gumball machine. A key is on the floor beside it. It is a long silver key. It hangs on a red string.\n\nIt opens the narcotics safe. That safe is at Mile 9 Pharmacy. It is west of here.\n\nMr. Okafor gave me this key. It is for the ring. Why me? I never take more than I need. So take what you need. Leave the rest.\n\n—Hana",
        },
        "grocery-dead1": {
          title: "A Kid's Shopping List",
          text: "A shopping list. The letters are big and wobbly. A kid wrote it.\n\nPeanut butter.\nBatteries.\nDog food.\n\nA grown-up wrote next to dog food. It says: We don't have a dog.\n\nThe kid wrote under that: Yet.\n\nSomeone kept this list. It is folded small. The corners are soft from hands. Maybe the kid got the dog. Maybe the dog is out there now. Waiting.",
        },
      },
      signs: {
        "grocery-sign1": {
          title: "Store Sign",
          text: "Corner Grocery. Fresh bread every morning! The bread rack below is empty. Not one crumb.",
        },
        "grocery-sign2": {
          title: "Black Marker",
          text: "Black marker. The back loading door doesn't shut. Under that, smaller: Watch your back.",
        },
        "grocery-sign3": {
          title: "Soup Sale",
          text: "Soup sale! Two cans for the price of one! Someone added in pen: Deal still stands. It's all free now.",
        },
        "grocery-sign4": {
          title: "Cooler Door",
          text: "Walk-in cooler. Keep the door closed. Hana wrote under it: Lift and pull.",
        },
      },
      key: {
        name: "Long silver key, red string",
        tag: "The tag says: “Medicine only. Count what you take.” It is a long silver key. It hangs on a red string.",
      },
    },

    /* ---------- Reyes Hardware ---------- */
    hardware: {
      blurb: "Nails, tools, and lumber, where the ring's keys were cut.",
      door: {
        title: "Nailed to the Door",
        text: "At least five walkers inside. Two are in the middle aisles. Watch them first.\n\nNails are by the toilet display. Tools are in the middle aisle. Lumber is in the racks at the back.\n\nThe back room is locked. My note is by the paint mixer. That is back left.\n\n—Mr. Reyes, owner",
      },
      notes: {
        "hardware-paint": {
          title: "The Sticky Door",
          text: "You found my note in the paint. Good eye.\n\nThe back room door sticks. Do not kick it. Grab the handle. Lift it up. Then push hard. The door gives. You can open the back room now. A water filter is inside. So is a second tool kit. There is lumber too.\n\nTake the side door by the paint mixer. The back room is past the lumber racks.\n\nNeed more wood? Ridge Lumber is on the east ridge. Need filters? Try the Water Tower, west side. Its pump house has more.\n\n—Mr. Reyes",
        },
        "hardware-trail1": {
          title: "Fifteen Keys",
          text: "Ruby and Jo came to me. They had a plan. A ring of keys. One key for each stash.\n\nI cut the first keys here. I used this store's key machine. Fifteen keys for fifteen stashes. My hands still ache.\n\nThe rule is plain. No key stays in its own building. Each key waits somewhere else. A note waits with it.\n\nMy other note is under the PAINT sign. Look by the paint mixer.\n\n—Mr. Reyes",
        },
        "hardware-trail2": {
          title: "The First Key Cut",
          text: "Here is the key. Find the toilet display. It is near the front. The key is on the floor beside it. Look against the wall.\n\nIt is a copper key. A leaf is scratched into its head. It opens the seed vault. The vault is at Greenhouse Row. That is far west, across town.\n\nIt is the first key I cut. The very first, for the ring. Rosa picked this spot. A seed thief looks for seeds. Not nails. He looks in a hardware store last.\n\n—Mr. Reyes",
        },
        "hardware-dead1": {
          title: "Who Has My Tools",
          text: "BORROWED TOOLS. Mr. Reyes keeps this list on a nail.\n\nCarla: one long saw.\nChief Dunn: two ladders.\nTheo: one pipe wrench. Never returned. Again.\n\nThe word “again” is dug in hard. The pencil almost went through. Mr. Reyes writes neat and small. Not this time. Theo tends the pumps out west. Maybe the wrench is there. Maybe it is lost for good.",
        },
      },
      signs: {
        "hardware-sign1": {
          title: "Painted Sign",
          text: "Reyes Hardware, in big painted letters. Below: If we don't have it? You don't need it.",
        },
        "hardware-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R by the front door. A 5 under it. Below: Two in the middle aisles.",
        },
        "hardware-sign3": {
          title: "Keys Cut Here",
          text: "Keys cut here. An arrow points to the paint vault. It is in the paint room. Beside it, a key in a circle.",
        },
        "hardware-sign4": {
          title: "Marker on the Door",
          text: "Marker on the back room door. LIFT, THEN PUSH. Mr. Reyes signed it.",
        },
      },
      key: {
        name: "Copper key with a leaf",
        tag: "The tag says: “Seed vault. Seeds for anyone.” The key is copper. A leaf is scratched into its head.",
      },
    },

    /* ---------- Mile 9 Pharmacy ---------- */
    pharmacy: {
      blurb: "Med kits on low shelves, behind five walkers.",
      door: {
        title: "Under the Tape",
        text: "Med kits sit low. One is by the giant toothbrush. One is in the middle, where the aisles cross.\n\nAt least five walkers inside. Most stay near the back. Go slow.\n\nThe cabinet room is locked. The code is on my note. It is behind the counter. Go in at the right end, by the wheelchairs.\n\n—Mr. Okafor, pharmacist",
      },
      notes: {
        "pharmacy-counter": {
          title: "The Cabinet Code",
          text: "Mr. Okafor here. I write codes down with care. Read this one with care too.\n\nThe cabinet room code is 4471. Four, four, seven, one. Punch it in. Check each number. The door opens. You can open the cabinet room now. Two more med kits are inside. So is a water filter.\n\nIts door is behind this counter. It is in the corner by the wheelchairs.\n\nSt. Anne Annex is the hospital. It is up in the north hills. It still has meds. It has a generator too. It is the worst place in town.\n\n—Mr. Okafor",
        },
        "pharmacy-trail1": {
          title: "Doc Lin Turns Back",
          text: "Doc Lin comes in every few days. She fills her bag here. It is all for Nurse Ada.\n\nLast time, she took the road up the hill. It runs below St. Anne Annex. Too many walkers stood on it. She had to turn back.\n\nNow she has a new plan. She will ride with the River Convoy. It goes north. She rides as far as St. Anne.\n\nI left a second note. It is on the floor, near the giant toothbrush.\n\n—Mr. Okafor",
        },
        "pharmacy-trail2": {
          title: "A Key With Blue Paint",
          text: "Here is the key. Go to the front of the store. Find the pill bottle. The key is on the floor beside it.\n\nIt is a stubby iron key. Drops of blue paint dot it. It opens the paint vault. That vault is at Reyes Hardware. That is east of here, across town.\n\nMr. Reyes cut this key himself. He keeps none of his own keys. Not one. That is how the ring works. Each key waits somewhere else.\n\n—Mr. Okafor",
        },
        "pharmacy-dead1": {
          title: "A Bag for June",
          text: "A paper bag sits on a shelf. No one came for it. It is stapled shut. The name on it is June. The pills inside are for sore knees.\n\nMr. Okafor wrote on it in pen. “She always forgets these.”\n\nThe bag is gray with dust. Someone drew a smile by her name. He knew her well. Somewhere out there, June's knees still hurt.",
        },
      },
      signs: {
        "pharmacy-sign1": {
          title: "Counter Sign",
          text: "A sign hangs by the counter. Please wait to be called. Added in pen: “We will call you. Someday.”",
        },
        "pharmacy-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R by the front door. A 5 under it. Five walkers then. An arrow: most stay in back.",
        },
        "pharmacy-sign3": {
          title: "Health Poster",
          text: "Clean water saves lives. If you can't filter it, boil it. A kettle is drawn below.",
        },
        "pharmacy-sign4": {
          title: "Door Sign",
          text: "Cabinet room. Staff only. Neat pen below: Code changed. Use the one on the counter note.",
        },
      },
      key: {
        name: "Stubby iron key, blue paint",
        tag: "The tag says: “Paint vault. Cut by Reyes.” The key is stubby and iron. Drops of blue paint dot it.",
      },
    },

    /* ---------- Ortiz Auto ---------- */
    autoshop: {
      blurb: "Engine parts on the benches, a generator in the pit.",
      door: {
        title: "Chalk on the Bay Door",
        text: "Engine parts sit on the workbenches. One is back right. It is by the red tool chest. One is in the left bay.\n\nAt least five walkers inside. One walks the parts room, by the engine crane.\n\nThe service pit has a locked hatch. Mr. Ortiz left a note in the office. It is behind the waiting room.\n\n—Dev, from the Gas-N-Go",
      },
      notes: {
        "autoshop-office": {
          title: "The Hatch Bolt",
          text: "Mr. Ortiz. This is my shop. Years of oil soak these floors.\n\nThe pit hatch has one big bolt. Twist it left. Not right. Left. The bolt comes out. Lift the hatch. You can open the service pit now. A generator sits down there. Spare parts too. And a fuel can.\n\nThe pit room is in the middle of the shop. Its hatch is on the front side. That side faces the oil drums.\n\nNeed wire or radio parts? Go downtown. Signal Electronics has both. But walker crowds are near it.\n\n—Mr. Ortiz",
        },
        "autoshop-trail1": {
          title: "Dev, to His Sister",
          text: "Ruby, this is for you. It is Dev.\n\nMr. Ortiz and I fixed the truck together. It runs! It shakes and it rattles. But it runs.\n\nWe drive west now. We go to the Water Tower. Theo is there. He has clean water. He has room for two.\n\nI did not wait for you. I am sorry. Please come find me.\n\nMr. Ortiz left a note too. It is at the back of the shop. Look by the red tool chest.\n\n—Dev",
        },
        "autoshop-trail2": {
          title: "The Red Key",
          text: "Mr. Ortiz again. Now, the key.\n\nGo to the waiting room. Find the soda machine. The key is on the floor beside it.\n\nIt is a big key. It is painted fire-engine red. It hangs on a brass ring. It opens the chief's locker. That is at Station 12. That is north and west of here.\n\nChief Dunn left it with me. It was his thanks. I fixed the convoy trucks. It waits here now, for the ring.\n\n—Mr. Ortiz",
        },
        "autoshop-dead1": {
          title: "The Job Board",
          text: "A job board hangs on the wall. Mr. Ortiz writes in thick chalk.\n\nJOBS:\nChief Dunn's fire truck: new brakes.\nSergeant Vega's van: new tires.\nCarla's boat motor: not done yet.\n\nThe chalk is smeared. But someone wipes the board clean. The shop looks still open. Like someone will walk in. As if a van is due today.",
        },
      },
      signs: {
        "autoshop-sign1": {
          title: "Shop Sign",
          text: "Ortiz Auto. Honest repairs. Under it, a row of handprints. Big and small. All greasy.",
        },
        "autoshop-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R by the front door. A 5 under it. Next to it: One by the engine crane.",
        },
        "autoshop-sign3": {
          title: "Safety Poster",
          text: "Safety first! Never work under a car alone. Someone added: Never work anywhere alone.",
        },
        "autoshop-sign4": {
          title: "Metal Plate",
          text: "Service pit. Keep the hatch shut. Under it, a chalk arrow. It curls to the left.",
        },
      },
      key: {
        name: "Big red key, brass ring",
        tag: "The tag says: “Chief's locker. Return the favor.” The key is big. It is painted fire-engine red. It hangs on a brass ring.",
      },
    },

    /* ---------- Signal Electronics ---------- */
    radioshack: {
      blurb: "Wire and radio parts near the downtown crowds.",
      door: {
        title: "Cardboard in the Window",
        text: "Jo here. Yes, the radio Jo.\n\nWire is between the two long middle shelves. One spool is on the TV wall side. One is on the robot side.\n\nAt least six walkers inside. One is by the robot. That is the right end of the counter.\n\nThe manager's office is locked. Her note is on the counter at the back.\n\n—Jo",
      },
      notes: {
        "radioshack-counter": {
          title: "Priya's Office Key",
          text: "I am Priya. I run this store. I still fix things here.\n\nMy office key is under the register. It is taped there. Reach under. Peel off the tape. Now you can open the manager's office. Two boxes of radio parts are inside. More wire too.\n\nThe office door is in the back wall. It is near the robot. Look for the MANAGER sign.\n\nNeed more? Go north of downtown. The 4th Precinct is the police station. It has gun parts. Lincoln Middle School has books.\n\n—Priya, manager",
        },
        "radioshack-trail1": {
          title: "Jo on 88.1",
          text: "Jo again. You know my voice. I am on 88.1. I talk from a rooftop downtown. I do it every night. News. Warnings. Messages.\n\nPriya built my first transmitter. She built it right here. She used parts from these shelves.\n\nDoc Lin can't reach Nurse Ada. Ada can't reach Lin. So I pass their words along.\n\nPriya left a note for you. It is on the floor, below the TV wall.\n\n—Jo",
        },
        "radioshack-trail2": {
          title: "A Key Like a Raindrop",
          text: "Priya here. Go to the front of the store. Find the arcade game. The key is on the floor beside it.\n\nIt is long and thin. Its tag is blue. It is shaped like a water drop. It opens the tool crib. The crib is at the Water Tower. That is far west of here.\n\nTheo gave me this key. Jo and I needed his tools. We put an antenna on his tower. Now the key stays here. It is part of the ring.\n\n—Priya",
        },
        "radioshack-dead1": {
          title: "Jo's Show Plan",
          text: "Jo's show plan. It is taped to a shelf.\n\nSHOW PLAN\nNews at dusk.\nThen music.\nThen messages.\nWarnings first. Always.\n\nBig letters at the bottom. No sad songs. People have enough.\n\nA coffee ring stains one corner. The tape is old and yellow. Jo has run this show for ages. Every night, the same plan. Jo plans each night. Nothing is left to luck.",
        },
      },
      signs: {
        "radioshack-sign1": {
          title: "Store Sign",
          text: "Signal Electronics. Smaller words below. We fix what others throw away.",
        },
        "radioshack-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R. A 6 under it. One by the robot. At the end of the counter.",
        },
        "radioshack-sign3": {
          title: "Yellow Numbers",
          text: "Big yellow numbers: 88.1. Under it: Jo, every night at dusk. Painted tall on the wall.",
        },
        "radioshack-sign4": {
          title: "Office Door",
          text: "Manager's office. Please knock. Someone wrote below. Priya says look under the register.",
        },
      },
      key: {
        name: "Thin key, blue drop tag",
        tag: "The tag says: “Tool crib. Bring the wrench back.” Long, thin key. The tag is a blue water drop.",
      },
    },

    /* ---------- Greenhouse Row ---------- */
    garden: {
      blurb: "Seeds and soil at Rosa's greenhouses, out west.",
      door: {
        title: "Paint on the Gate",
        text: "Rosa here. I ran this greenhouse.\n\nSoil is in the big greenhouse, by the scarecrow. Seeds are in the shop by the gate. Look near the big gnome.\n\nAt least five walkers inside. One is at the back of the big greenhouse.\n\nThe potting shed is locked. My note is on the potting bench. It is by the palm tree, back right.\n\n—Rosa",
      },
      notes: {
        "garden-bench": {
          title: "Rosa's Shed Key",
          text: "You made it to my bench. Good.\n\nThe shed has a padlock. The key is in the watering can. Tip the can. Shake it. The key drops out. Now you can open the potting shed. More seeds are in there. A water tank too. Take some seeds. Leave some.\n\nGo from the palm tree house toward the beehives. The shed door is on that path.\n\nWant tools? Try Station 12. It is the fire station, north of here. Its equipment bay has tools and water tanks.\n\n—Rosa",
        },
        "garden-trail1": {
          title: "A Rattling Truck",
          text: "A truck came by. It rattled so loud. I hid at first. Then I saw who it was. Dev and Mr. Ortiz. They filled their water jugs here.\n\nThey were going north. To the Water Tower. Theo has clean water there.\n\nThe next day, Ruby came. She asked for Dev. I told her where he went. She left fast.\n\nI left one more note. It is in the big greenhouse. Look by the scarecrow.\n\n—Rosa",
        },
        "garden-trail2": {
          title: "Keep the Ring Moving",
          text: "Now the key. Go out to the beehives. The key is on the floor beside them.\n\nIt is a steel key. It is greasy. It hangs on a loop of wire. It opens the parts cage. The cage is at Ortiz Auto. That is far east, across town.\n\nMr. Ortiz gave me this key. That was when the truck stopped here. The ring must not break, he said. So keep it moving. That is the deal.\n\n—Rosa",
        },
        "garden-dead1": {
          title: "Rosa's Planting Chart",
          text: "Rosa's planting chart. It is drawn in pencil. Small boxes mark each bed.\n\nBeans by the gate.\nTomatoes at the back.\nSquash where the sun hits.\n\nThe beans came from June. June is an old friend. She gave Rosa the seeds.\n\nAt the bottom, a note to self. Tell June the beans came up.\n\nA small sun is drawn by it. The box by it is still blank.",
        },
      },
      signs: {
        "garden-sign1": {
          title: "Wooden Sign",
          text: "Greenhouse Row. Plants, seeds, soil. Below it: Open from dawn to dusk.",
        },
        "garden-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R. A 5 under it. Below that: One at the back of the big greenhouse.",
        },
        "garden-sign3": {
          title: "Chalk Circle",
          text: "Chalk circle, key inside, by the seed vault door. That door is in the shop. Key not here. Read the notes.",
        },
        "garden-sign4": {
          title: "Potting Shed Sign",
          text: "Potting shed. Mind the step. Beside the words, a small watering can. It is painted too.",
        },
      },
      key: {
        name: "Greasy steel key, wire loop",
        tag: "The tag says: “Parts cage. Fix something good.” The key is steel and greasy. It hangs on a loop of wire.",
      },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
