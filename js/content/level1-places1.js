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
        text: "At least two walkers inside. One by the back wall. One on the pump side. More come each day.\n\nFuel cans sit on the floor. Not on the shelves. The storeroom is on the right. It is next to the door. Locked. The clerk's note is on the counter.\n\n—Ruby",
      },
      notes: {
        "gasngo-counter": {
          title: "Dev's Counter Note",
          text: "I am Dev. I am the clerk here. Well, I was.\n\nThe storeroom key hangs on a hook. The hook is under this counter. Reach down and feel for it. Take the key. Now you can open the storeroom. More fuel is in there. A spool of wire too.\n\nI go east to Ortiz Auto. It is on the east side. The shop still stands. I need a truck that runs.\n\nNeed seeds or soil? Go see Rosa at Greenhouse Row. Head west, past the gas station.\n\n—Dev, the clerk",
        },
        "gasngo-trail1": {
          title: "Ruby Goes East",
          text: "I am back. Dev is not. He is my kid brother.\n\nI find his note by the register. He goes east to Ortiz Auto. So I go east too. Right now.\n\nI ask Jo for help. Jo is on the radio each night. Jo will say my name. Jo will say I look for Dev. Hear it? Then you know me.\n\nOne more thing. I leave a second note. It is behind the counter. It is on the floor. Look near the register.\n\n—Ruby",
        },
        "gasngo-trail2": {
          title: "For Those Who Read",
          text: "You read this far.\n\nA key lies on the floor. It is just inside the front door. Look right, by the storeroom wall. Small brass key. Green plastic tag. It opens the staff locker. It is at Corner Grocery. Go east.\n\nJo and I made a rule. Take what you need. Leave the rest. Each stash is locked. Its key hides in another building. A note says where. So only readers find them.\n\nHana runs the grocery. She gave me this key. That was day one of the ring.\n\n—Ruby",
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
          text: "A big red R. Under it, a 2. Ruby counted two walkers here. Smaller, below: Don't run. Walk and look.",
        },
        "gasngo-sign3": {
          title: "Chalk Circle",
          text: "Chalk on the old safe room door. A circle, key inside. The key is in another building. A note says where.",
        },
        "gasngo-sign4": {
          title: "STAFF ONLY",
          text: "A metal sign over the storeroom door. STAFF ONLY. Dev wrote under it. “Key on the hook. You know where.”",
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
        text: "Front shelves are picked over. The food left is on the floor. Check the far aisle.\n\nWalkers get in at the back. They use the loading door. Count on two, at least.\n\nThe walk-in cooler is cold and locked. The manager's note is on the counter. That is at the back wall.\n\n—Doc Lin",
      },
      notes: {
        "grocery-counter": {
          title: "Hana's Cooler Trick",
          text: "This is Hana. I run this store. I still do, sort of.\n\nThe cooler latch sticks. Do not yank it. Lift the latch up. Pull at the same time. Lift and pull. It opens. You can open the cooler now. Food is inside. So is one med kit. Take what you need.\n\nNeed more meds? Try Mile 9 Pharmacy. It is west of here. Last week, its shelves had meds. Things change fast, though.\n\nShut the cooler door when you go.\n\n—Hana, manager",
        },
        "grocery-trail1": {
          title: "Doc Lin's Route",
          text: "I am Doc Lin. I carry meds. They go from here to the pharmacy. Then I go north to St. Anne Annex. Nurse Ada stayed there.\n\nThe cooler here keeps her meds cold. They wait in it for me.\n\nI have not seen Ada in weeks. Walkers fill the road into the hills. I try. I turn back. I try again.\n\nHana left a note. It is for the next reader. Find it in the back right corner.\n\n—Doc Lin",
        },
        "grocery-trail2": {
          title: "Hana Hides a Key",
          text: "Hana again. You found my note. Good.\n\nGo to the front aisle. Walk to the right end. A key is on the floor there. It lies against the right wall. It is a long silver key. It hangs on a red string.\n\nIt opens the narcotics safe. That safe is at Mile 9 Pharmacy. It is west of here.\n\nMr. Okafor gave me this key. It is for the ring. Why me? I never take more than I need. So take what you need. Leave the rest.\n\n—Hana",
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
        text: "At least three walkers inside. Two are in the middle aisles. One is near the front door. Watch that one first.\n\nNails are near the front. Tools are in the middle aisle. Lumber is at the back.\n\nThe back room is locked. My note is by the paint shelves.\n\n—Mr. Reyes, owner",
      },
      notes: {
        "hardware-paint": {
          title: "The Sticky Door",
          text: "You found my note in the paint. Good eye.\n\nThe back room door sticks. It always did. Do not kick it. Grab the handle. Lift it up. Then push hard. The door gives. You can open the back room now.\n\nA water filter is inside. So is a second tool kit. There is lumber too.\n\nNeed more wood? Ridge Lumber is on the east ridge. It has stacks of lumber. Need more filters? Try the Water Tower, west side. Its pump house has more.\n\n—Mr. Reyes",
        },
        "hardware-trail1": {
          title: "Fifteen Keys",
          text: "Ruby and Jo came to me. They had a plan. A ring of keys. One key for each stash.\n\nI cut the first keys here. I used this store's key machine. Fifteen keys for fifteen stashes. My hands still ache.\n\nThe rule is plain. No key stays in its own building. Each key waits somewhere else. A note waits with it.\n\nMy other note is at the back. Go to the back left corner.\n\n—Mr. Reyes",
        },
        "hardware-trail2": {
          title: "The First Key Cut",
          text: "Here is the key. It is in the front left corner. It is on the floor. Look between the counter and the crates.\n\nIt is a copper key. A leaf is scratched into its head. It opens the seed vault. The vault is at Greenhouse Row. That is far west, across town.\n\nIt is the first key I cut. The very first, for the ring. Rosa picked this spot. A seed thief looks for seeds. Not nails. He looks in a hardware store last.\n\n—Mr. Reyes",
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
          text: "Ruby's red R, a 3 under it. Below: Two in the middle aisles. One by the door.",
        },
        "hardware-sign3": {
          title: "Keys Cut Here",
          text: "Keys cut here. The arrow points back right. It points at the paint vault. Beside it, a circle with a key.",
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
      blurb: "Med kits on low shelves, behind three walkers.",
      door: {
        title: "Under the Tape",
        text: "Med kits are on the low shelves. Look near the middle of the store. Bend down. They sit low.\n\nAt least three walkers inside. Most stay near the back. Go slow.\n\nThe cabinet room is locked. The code is on my note. My note is at the counter.\n\n—Mr. Okafor, pharmacist",
      },
      notes: {
        "pharmacy-counter": {
          title: "The Cabinet Code",
          text: "Mr. Okafor here. I write codes down with care. Read this one with care too.\n\nThe cabinet room code is 4471. Four, four, seven, one. Punch it in. Check each number. The door opens. You can open the cabinet room now. Two more med kits are inside. So is a water filter.\n\nSt. Anne Annex is the hospital. It is up in the north hills. It still has meds. It has a generator too. It is the worst place in town. Do not go there alone.\n\n—Mr. Okafor",
        },
        "pharmacy-trail1": {
          title: "Doc Lin Turns Back",
          text: "Doc Lin comes in every few days. She fills her bag here. It is all for Nurse Ada.\n\nLast time, she reached the hill road. That road runs below St. Anne Annex. Too many walkers stood on it. She had to turn back.\n\nNow she has a new plan. She will ride with the River Convoy. It goes north. She rides as far as St. Anne.\n\nI left a second note. Go to the middle aisle. Walk to the left end. It is by the left wall.\n\n—Mr. Okafor",
        },
        "pharmacy-trail2": {
          title: "A Key With Blue Paint",
          text: "Here is the key. Go to the front aisle. Walk to the right end. It is on the floor. It lies against the right wall.\n\nIt is a stubby iron key. Drops of blue paint dot it. It opens the paint vault. That vault is at Reyes Hardware. That is east of here, across town.\n\nMr. Reyes cut this key himself. He keeps none of his own keys. Not one. That is how the ring works. Each key waits somewhere else.\n\n—Mr. Okafor",
        },
        "pharmacy-dead1": {
          title: "A Bag for June",
          text: "A paper bag sits on a shelf. No one came for it. It is stapled shut. The name on it is June. The pills inside are for sore knees.\n\nMr. Okafor wrote on it in pen. “She always forgets these.”\n\nThe bag is gray with dust. Someone drew a smile by her name. He knew her well. Somewhere out there, June's knees still hurt.",
        },
      },
      signs: {
        "pharmacy-sign1": {
          title: "Counter Sign",
          text: "A sign hangs over the counter. Please wait to be called. Added in pen: “We will call you. Someday.”",
        },
        "pharmacy-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R. A 3 under it. Three walkers when she counted. An arrow points to the back. Most stay back there.",
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
        text: "Engine parts sit on the workbenches. One bench is on the left wall. One is in the back right corner.\n\nAt least three walkers inside. One walks by the crates. Back left corner.\n\nThe service pit has a locked hatch. Mr. Ortiz left a note by the office.\n\n—Dev, from the Gas-N-Go",
      },
      notes: {
        "autoshop-office": {
          title: "The Hatch Bolt",
          text: "Mr. Ortiz. This is my shop. Years of oil soak these floors.\n\nThe pit hatch has one big bolt. Twist it left. Not right. Left. The bolt comes out. Lift the hatch. You can open the service pit now.\n\nA generator sits down in the pit. Spare parts are there too. So is a fuel can.\n\nNeed wire? Need radio parts? Go downtown. Signal Electronics still has both. But the walker crowds are near it. Park close. Be quick.\n\n—Mr. Ortiz",
        },
        "autoshop-trail1": {
          title: "Dev, to His Sister",
          text: "Ruby, this is for you. It is Dev.\n\nMr. Ortiz and I fixed the truck together. It runs! It shakes and it rattles. But it runs.\n\nWe drive west now. We go to the Water Tower. Theo is there. He has clean water. He has room for two.\n\nI did not wait for you. I am sorry. Please come find me.\n\nMr. Ortiz left a note too. It is on the right wall. It is near the office. It is a few steps in front.\n\n—Dev",
        },
        "autoshop-trail2": {
          title: "The Red Key",
          text: "Mr. Ortiz again. Now, the key.\n\nGo to the left wall. Find the front left corner. The key is just behind it. It lies against the wall.\n\nIt is a big key. It is painted fire-engine red. It hangs on a brass ring. It opens the chief's locker. That is at Station 12. That is north and west of here.\n\nChief Dunn left it with me. It was his thanks. I fixed the convoy trucks. It waits here now, for the ring.\n\n—Mr. Ortiz",
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
          text: "Ruby's red R. A 3 under it. Next to it: One by the crates. Back left.",
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
        text: "Jo here. Yes, the radio Jo.\n\nSpools of wire sit on the shelves. Check the middle rows.\n\nAt least four walkers inside. One stands near the counter. That counter is on the back wall.\n\nThe manager's office is locked. The manager left a note. It is on the back counter.\n\n—Jo",
      },
      notes: {
        "radioshack-counter": {
          title: "Priya's Office Key",
          text: "I am Priya. I run this store. I still fix things here.\n\nMy office key is under the register. It is taped there. Reach under. Peel off the tape. Now you can open the manager's office. Two boxes of radio parts are inside. More wire too.\n\nNeed more? Go north of downtown. Two places are there. One is the 4th Precinct. That is the police station. It has gun parts. The other is Lincoln Middle School. It has books.\n\n—Priya, manager",
        },
        "radioshack-trail1": {
          title: "Jo on 88.1",
          text: "Jo again. You know my voice. I am on 88.1. I talk from a rooftop downtown. I do it every night. News. Warnings. Messages.\n\nPriya built my first transmitter. She built it right here. She used parts from these shelves.\n\nDoc Lin can't reach Nurse Ada. Ada can't reach Lin. So I pass their words along.\n\nPriya left a note for you. Go to the middle aisle. It is at the left end. By the left wall.\n\n—Jo",
        },
        "radioshack-trail2": {
          title: "A Key Like a Raindrop",
          text: "Priya here. Go to the front aisle. Walk to its right end. The key is on the floor. It lies against the right wall.\n\nIt is long and thin. Its tag is blue. It is shaped like a water drop. It opens the tool crib. The crib is at the Water Tower. That is far west of here.\n\nTheo gave me this key. Jo and I needed his tools. We put an antenna on his tower. Now the key stays here. It is part of the ring.\n\n—Priya",
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
          text: "Ruby's red R. A 4 under it. One by the counter. At the back.",
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
        text: "Rosa here. I ran this greenhouse.\n\nSeed packets sit on the front bench. Soil bags are stacked in the middle.\n\nAt least three walkers inside. One is near the back.\n\nThe potting shed is locked. My note is on the potting bench. Look at the back, on the right.\n\n—Rosa",
      },
      notes: {
        "garden-bench": {
          title: "Rosa's Shed Key",
          text: "You made it to my bench. Good.\n\nThe shed has a padlock. The key is in the watering can. The can is on this bench. Tip the can. Shake it. The key drops out. Now you can open the potting shed.\n\nMore seeds are in the shed. A water tank is in there too. Take some seeds. Leave some.\n\nWant tools? Try Station 12. It is the fire station. Go north of here. Its equipment bay has tools. It has water tanks too.\n\n—Rosa",
        },
        "garden-trail1": {
          title: "A Rattling Truck",
          text: "A truck came by. It rattled so loud. I hid at first. Then I saw who it was. Dev and Mr. Ortiz. They filled their water jugs here.\n\nThey were going north. To the Water Tower. Theo has clean water there.\n\nThe next day, Ruby came. She asked for Dev. I told her where he went. She left fast.\n\nI left one more note. It is at the back. Look between the crates.\n\n—Rosa",
        },
        "garden-trail2": {
          title: "Keep the Ring Moving",
          text: "Now the key. It is in the front left corner. It is on the floor.\n\nIt is a steel key. It is greasy. It hangs on a loop of wire. It opens the parts cage. The cage is at Ortiz Auto. That is far east, across town.\n\nMr. Ortiz gave me this key. That was when the truck stopped here. The ring must not break, he said. So keep it moving. That is the deal.\n\n—Rosa",
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
          text: "Ruby's red R. A 3 under it. Below that: One at the back.",
        },
        "garden-sign3": {
          title: "Chalk Circle",
          text: "Chalk circle, key inside. Arrow: seed vault, back left corner. Under it: The key is not here. Read the notes.",
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
