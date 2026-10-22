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
      blurb: "A small gas station with fuel cans, a locked storeroom, and Ruby's red R on the door.",
      door: {
        title: "Ruby's Warning",
        text: "This is Ruby. Read my note before you go in.\n\nThere are at least three walkers inside. One is in the garage, by the car lift. More walkers come as the days pass.\n\nThere are two fuel cans. One is by the slushie machine. The other is in the garage, by the tire tower.\n\nThe storeroom is locked. The clerk left a note about it. His note is on the counter by the front door.\n\n—Ruby",
      },
      notes: {
        "gasngo-counter": {
          title: "Dev's Counter Note",
          text: "I am Dev, and I was the clerk here. My sister Ruby set a trap in this counter. So read all of this.\n\nThe storeroom key is in a drawer of this counter. The drawers are right under this note. The key is in the {pick}. It opens the storeroom door.\n\nDo not open any other drawer! Ruby rigged the other two with a bomb. It is a trap for looters. It kills the one who opens it.\n\nThe storeroom has more fuel and a spool of wire. To get there, go to the back hall. Walk to the end far from the ice machine. The storeroom is the last door before the garage.\n\nI went to Ortiz Auto. It is on the east side of town. The shop still stands. Do you need seeds or soil? Then see Rosa at Greenhouse Row. It is west, past this gas station.\n\n—Dev",
        },
        "gasngo-trail1": {
          title: "Ruby Goes East",
          text: "This is Ruby again. I came back here to find my brother, Dev. He was gone, but his note was here. I found it by the register.\n\nDev went east to Ortiz Auto. So I am going east too, right after him.\n\nI asked Jo for help. Jo talks on the radio every night. Jo will tell the town I am looking for Dev.\n\nI left a second note for you. It is on the floor behind the counter, near the register. That is across the shop from the slushie machine.\n\n—Ruby",
        },
        "gasngo-trail2": {
          title: "For Those Who Read",
          text: "Ruby here. You read this far, so this note is for you.\n\nJo and I made a rule. Take what you need, and leave the rest. Every stash is locked. Its key is hidden in another building. A note there says where. So only people who read can find the keys.\n\nGo into the garage and find the tire tower. The key lies on the floor beside it. It is a small brass key on a green plastic tag. It opens the staff locker at Corner Grocery. It is east of here.\n\nHana runs the grocery. She gave me this key on day one of the ring.\n\nThe staff locker has a fussy lock. A wrong key jams it. Then only a crowbar can open it.\n\n—Ruby",
        },
        "gasngo-dead1": {
          title: "Dev's Last Shift",
          text: "This is a to-do list. Dev wrote it on his last shift, just before the Fall. The paper is soft and gray now.\n\nTO DO:\nMop the floor.\nFill the coffee.\nFix the ice machine.\n\nAt the bottom, in small letters, it says: Call Ruby back.\n\nNot one thing on the list is crossed off. The mop still leans in its bucket. The coffee pot is still empty. The ice machine is still broken. Did Dev ever call Ruby back? The list does not say.",
        },
        "gasngo-dead2": {
          title: "A Scrap of Receipt",
          text: "This is a scrap of a receipt. Someone wrote on it in shaky pencil. No one signed it.\n\nIt says: Do you want the storeroom key? It is in the counter by the front door. Look in the {decoyPick}. Just open it and take the key.\n\nThat sounds easy. But the pencil is faded, so the note is old. Someone wrote it before Ruby set traps in the drawers. Back then, every drawer was safe. Now two of them hold a bomb.\n\nSo do not trust this scrap. Dev's note on the counter says which drawer is safe now. Read his note first.",
        },
      },
      signs: {
        "gasngo-sign1": {
          title: "Faded Store Sign",
          text: "The faded sign says: Gas-N-Go, always open. Someone crossed out the word always. Over it, they wrote not.",
        },
        "gasngo-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R has a 3 under it. She counted three walkers here. Small words say: Don't run. Walk and look.",
        },
        "gasngo-sign3": {
          title: "Chalk Circle",
          text: "A chalk circle and key mark the old safe room door. This lock's key is in another building. A note says where.",
        },
        "gasngo-sign4": {
          title: "STAFF ONLY",
          text: "The sign by the storeroom says STAFF ONLY. Dev wrote: The key is in a counter drawer. Read my note first!",
        },
      },
      key: {
        name: "Small brass key, green tag",
        tag: "A small brass key hangs on a green plastic tag. The tag says: Leave some for the next one.",
      },
    },

    /* ---------- Corner Grocery ---------- */
    grocery: {
      blurb: "A small corner store with food on the floor and a cold, locked cooler.",
      door: {
        title: "Marker on the Glass",
        text: "This is Doc Lin. I stop here a lot, so I left this note.\n\nThe shelves are picked over. The food that is left is on the floor. Look by the fish tank. There is more by the freezers, on the right.\n\nWalkers get in at the back. They come through the loading door, by the forklift. Count on at least three walkers.\n\nThe cooler is locked. The manager left a note about it. Her note is in the office, in the back left corner.\n\n—Doc Lin",
      },
      notes: {
        "grocery-counter": {
          title: "Hana's Cooler Trick",
          text: "I am Hana, and I run this store. This note tells you how to open the cooler.\n\nThe cooler latch sticks, so you need a trick. Do it this way: {moves}. Do it in that order, and the latch lets go.\n\nDo not work the latch any other way. If you do, it jams tight. Then only a crowbar can open the cooler.\n\nThere is food in the cooler, and one medical kit. Take only what you need.\n\nTo get there, go out of this office. Walk down the back hall, toward the forklift. The cooler is the next door.\n\nDo you need more medicine? Try Mile 9 Pharmacy. It is west of here. Last week, its shelves still had medicine.\n\n—Hana",
        },
        "grocery-trail1": {
          title: "Doc Lin's Route",
          text: "I am Doc Lin, and I am a doctor. I carry medicine across town. First I take it from here to the pharmacy. Then I take it north to St. Anne Annex. Nurse Ada stayed there to help the sick.\n\nThe cooler here keeps her medicine cold. It waits in the cooler until I can carry it.\n\nBut I have not reached Ada for weeks. The road into the hills is full of walkers. I try, and I turn back. Then I try again.\n\nHana left a note for the next reader. It is on the loading dock, beside the forklift.\n\n—Doc Lin",
        },
        "grocery-trail2": {
          title: "Hana Hides a Key",
          text: "This is Hana again. You found my note on the dock. Good.\n\nThere is a key at the front of the store. Find the gumball machine. The key lies on the floor beside it. It is a long silver key on a red string.\n\nThis key opens the narcotics safe at Mile 9 Pharmacy. That is west of here. Mr. Okafor gave me this key for the ring. He chose me because I never took more than I needed.\n\nThe narcotics safe has an old lock that bites. A wrong key snaps off inside it. Then that key is gone for good.\n\nSo take what you need, and leave the rest.\n\n—Hana",
        },
        "grocery-dead1": {
          title: "A Kid's Shopping List",
          text: "This is a shopping list. A kid wrote it, because the letters are big and wobbly.\n\nPeanut butter.\nBatteries.\nDog food.\n\nA grown-up wrote next to the dog food. It says: We don't have a dog.\n\nUnder that, the kid wrote one more word: Yet.\n\nSomeone kept this list for a long time. It is folded up small. The corners are soft from hands. Maybe the kid got that dog after all. Maybe the dog is out there now, and it is waiting.",
        },
        "grocery-dead2": {
          title: "A Cardboard Tip",
          text: "This note is on a flap of cardboard. No one signed it.\n\nIt says: The cooler latch sticks, but I know the trick. Do it like this: {decoyMoves}. Then the cooler opens, and the food is yours.\n\nThe note sounds sure. But look at the cardboard. It is old and stained. This trick was for the old latch. Hana put in a new latch after that. The old trick does not work on it. It will jam the new latch.\n\nHana's note is in the office. It has the trick that works now. Read her note, not this one.",
        },
      },
      signs: {
        "grocery-sign1": {
          title: "Store Sign",
          text: "The sign says: Corner Grocery, fresh bread every morning! The bread rack under it is empty.",
        },
        "grocery-sign2": {
          title: "Black Marker",
          text: "Black marker says: The back loading door doesn't shut. Under it, smaller: Watch your back.",
        },
        "grocery-sign3": {
          title: "Soup Sale",
          text: "The sale sign says: Soup, two cans for the price of one! Someone added: The deal still stands. Everything is free now.",
        },
        "grocery-sign4": {
          title: "Cooler Door",
          text: "Walk-in cooler: keep the door closed. Hana wrote: My note in the office has the trick. Other ways jam the latch.",
        },
      },
      key: {
        name: "Long silver key, red string",
        tag: "A long silver key hangs on a red string. Its tag says: Count what you take.",
      },
    },

    /* ---------- Reyes Hardware ---------- */
    hardware: {
      blurb: "A big hardware store with nails, tools, and lumber, where the ring's keys were cut.",
      door: {
        title: "Nailed to the Door",
        text: "I am Mr. Reyes, and I own this store.\n\nThere are at least five walkers inside. Two are in the middle aisles, so watch those two first.\n\nThe nails are by the toilet display. The tools are in the middle aisle. The lumber is in the lumber racks at the back.\n\nThe back room is locked. I left a note about it. My note is by the paint mixer, in the back left corner.\n\n—Mr. Reyes, owner",
      },
      notes: {
        "hardware-paint": {
          title: "The Sticky Door",
          text: "Mr. Reyes here. You found my note in the paint shelf. Good eye.\n\nThe back room door sticks in its frame. So do not kick it. Push it {move1}, then push it {move2}. Do it in that order, and the door gives.\n\nIf you push it any other way, it jams for good. Then only a crowbar can open it.\n\nThere is a water filter in the back room. There is a second tool kit and some lumber too.\n\nTo get there, take the side door by the paint mixer. The back room door is past the lumber racks.\n\nDo you need more wood? Ridge Lumber is on the east ridge. It has stacks of lumber. Do you need more filters? The Water Tower is on the west side. Its pump house has more filters.\n\n—Mr. Reyes",
        },
        "hardware-trail1": {
          title: "Fifteen Keys",
          text: "Mr. Reyes here. Let me tell you how the key ring began.\n\nRuby and Jo came to my store with a plan. They would lock up each stash in town. Then they would hide each key in a different building.\n\nSo I cut the first keys. I made them on the key machine in this store. I cut fifteen keys for fifteen stashes. My hands still ache.\n\nThe rule is plain. No key stays in the building it opens. Each key waits somewhere else, with a note that says where.\n\nMy other note is in the paint department. Look near the paint mixer.\n\n—Mr. Reyes",
        },
        "hardware-trail2": {
          title: "The First Key Cut",
          text: "Mr. Reyes again. Here is the key.\n\nFind the toilet display near the front of the store. The key lies on the floor beside it, against the wall. It is a copper key. A leaf is scratched into its head.\n\nThis key opens the seed vault at Greenhouse Row. That is far west, across town.\n\nIt was the very first key I cut for the ring. Rosa chose this spot for it. She said a seed thief looks for seeds, not nails. So he would look in a hardware store last.\n\nThe seed vault has a plain lock. A wrong key just will not turn in it.\n\n—Mr. Reyes",
        },
        "hardware-dead1": {
          title: "Who Has My Tools",
          text: "This list hangs on a nail. Mr. Reyes keeps track of who borrowed his tools.\n\nBORROWED TOOLS:\nCarla: one long saw.\nChief Dunn: two ladders.\nTheo: one pipe wrench. Never returned. Again.\n\nThe word again is dug in hard. The pencil almost went through the paper. Mr. Reyes writes small and neat, but not this time.\n\nTheo works the pumps at the Water Tower, out west. Maybe the wrench is out there with him. Maybe it is lost for good.",
        },
        "hardware-dead2": {
          title: "A Pencil Tip",
          text: "This note is in pencil. No one signed it.\n\nIt says: The back room door is not locked. It just sticks. Push it {decoyMove1}, then push it {decoyMove2}. It opens every time. I did it myself.\n\nThat used to be true. But then a big storm bent the door frame. Now the old way does not work. A wrong push will jam that door.\n\nMr. Reyes knows the new way. His note is by the paint mixer. It tells the way that works now. Read his note, not this one.",
        },
      },
      signs: {
        "hardware-sign1": {
          title: "Painted Sign",
          text: "The painted sign says: Reyes Hardware. Under it: If we don't have it, you don't need it.",
        },
        "hardware-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R by the front door has a 5 under it. Under that, she wrote: Two in the middle aisles.",
        },
        "hardware-sign3": {
          title: "Keys Cut Here",
          text: "Keys cut here, says the sign. A circled key is by it. The arrow points to the paint vault, by the paints.",
        },
        "hardware-sign4": {
          title: "Marker by the Door",
          text: "Marker by this door says: It sticks. Read my note by the paint mixer before you push. Mr. Reyes signed it.",
        },
      },
      key: {
        name: "Copper key with a leaf",
        tag: "A copper key has a leaf scratched into its head. Its tag says: Take only what you need.",
      },
    },

    /* ---------- Mile 9 Pharmacy ---------- */
    pharmacy: {
      blurb: "A small drugstore with medical kits on the floor. At least five walkers wait inside.",
      door: {
        title: "Under the Tape",
        text: "I am Mr. Okafor, the pharmacist. Please read this with care.\n\nThere are two medical kits out here. One is by the giant toothbrush. The other is in the middle, where the aisles cross.\n\nThere are at least five walkers inside. Most of them stay near the back, so go slow.\n\nThe cabinet room is locked. Its code is on my note behind the counter. To get behind the counter, go in at the right end. That is by the wheelchairs.\n\n—Mr. Okafor, pharmacist",
      },
      notes: {
        "pharmacy-counter": {
          title: "The Cabinet Code",
          text: "Mr. Okafor here. I am careful with codes, so please be careful too.\n\nThe cabinet room has a keypad. The code is {code}. Say it like this: {codeSpoken}. Punch in each number with care.\n\nUse that code and no other. One wrong code sets off the alarm. Then walkers pour in, even through the front door. They keep coming until they get you.\n\nThe cabinet room has two more medical kits. It has a water filter too.\n\nThe cabinet room door is behind this counter. It is in the back corner. It is on the same side as the wheelchairs.\n\nSt. Anne Annex is the hospital in the north hills. It still has medicine and a generator. But it is the most dangerous place in town.\n\n—Mr. Okafor",
        },
        "pharmacy-trail1": {
          title: "Doc Lin Turns Back",
          text: "Mr. Okafor here. Doc Lin comes in every few days. She fills her bag with medicine here. All of it is for Nurse Ada.\n\nLast time, Lin took the road up the hill. That road runs below St. Anne Annex. Too many walkers stood on it, so she had to turn back.\n\nNow Lin has a new plan. The River Convoy is going north. Lin will ride with it as far as St. Anne.\n\nI left a second note for you. It is on the floor near the giant toothbrush.\n\n—Mr. Okafor",
        },
        "pharmacy-trail2": {
          title: "A Key With Blue Paint",
          text: "Mr. Okafor again. This note is about a key.\n\nGo to the front of the store. Find the pill bottle there. The key lies on the floor beside it. It is a stubby iron key. It has drops of blue paint on it.\n\nThis key opens the paint vault at Reyes Hardware. That store is east of here, across town. Mr. Reyes cut this key himself. But he keeps none of his own keys. That is how the ring works.\n\nThe paint vault has a fussy lock. A wrong key jams it. Then only a crowbar can open it.\n\n—Mr. Okafor",
        },
        "pharmacy-dead1": {
          title: "A Bag for June",
          text: "This is a paper bag from the pharmacy. No one came to pick it up. It is stapled shut, and it is gray with dust.\n\nThe name on the bag is June. The pills inside are for sore knees.\n\nMr. Okafor wrote on the bag in pen. He wrote: She always forgets these.\n\nSomeone drew a small smile by her name. Mr. Okafor knew June well. Maybe she will come back for her pills one day. Somewhere out there, her knees still hurt.",
        },
        "pharmacy-dead2": {
          title: "A Yellow Sticky Note",
          text: "This is a yellow sticky note. It is on the floor by the front door.\n\nIt says: The cabinet room code is {decoyCode}. Do not lose this!\n\nThat looks like a big help. But look at the note again. The ink is faded. The sticky part has lost its stick. This note is old. Mr. Okafor changed the code after someone wrote it. So this code is wrong now. A wrong code sets off the alarm.\n\nThe code on the counter note is the one that works. Mr. Okafor wrote that note himself.",
        },
      },
      signs: {
        "pharmacy-sign1": {
          title: "Counter Sign",
          text: "A sign by the counter says: Please wait to be called. Someone added in pen: We will call you, someday.",
        },
        "pharmacy-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R has a 5 under it. She counted five walkers. An arrow points back, where most of them stay.",
        },
        "pharmacy-sign3": {
          title: "Health Poster",
          text: "A health poster says: Clean water saves lives. If you can't filter it, boil it.",
        },
        "pharmacy-sign4": {
          title: "Door Sign",
          text: "The door sign says: Cabinet room, staff only. Under it, in neat pen: Code changed. Use the one on the counter note.",
        },
      },
      key: {
        name: "Stubby iron key, blue paint",
        tag: "A stubby iron key has drops of blue paint on it. Its tag says: Cut by Reyes.",
      },
    },

    /* ---------- Ortiz Auto ---------- */
    autoshop: {
      blurb: "A car repair shop with engine parts on the benches and a pit under a locked hatch.",
      door: {
        title: "Chalk on the Bay Door",
        text: "This is Dev, from the Gas-N-Go. Ruby, if you read this, read the notes inside too.\n\nThere are engine parts on the workbenches. One is in the back right, by the red tool chest. The other is in the left bay.\n\nThere are at least five walkers inside. One stands in the parts room, by the engine crane.\n\nThe service pit is under a locked hatch. Mr. Ortiz left a note about it. His note is in the office, behind the waiting room.\n\n—Dev",
      },
      notes: {
        "autoshop-office": {
          title: "The Hatch Bolt",
          text: "This is Mr. Ortiz. I ran this shop for years. I know every bolt in it.\n\nThe pit hatch has one big bolt, and it is tricky. To get it out, do this: {moves}. Do it in that order. Then the hatch opens.\n\nIf you work the bolt any other way, it bends. Then the hatch jams, and only a crowbar can open it.\n\nMy generator is down in the pit. There are spare parts and a fuel can there too.\n\nThe pit room stands in the middle of the shop. Its hatch is on the front side, toward the oil drums.\n\nDo you need wire or radio parts? Go downtown to Signal Electronics. It still has both. But it is near the walker crowds, so be quick.\n\n—Mr. Ortiz",
        },
        "autoshop-trail1": {
          title: "Dev, to His Sister",
          text: "Ruby, this note is for you. It is me, Dev.\n\nMr. Ortiz and I fixed the old truck together. It runs! It shakes and it rattles, but it runs.\n\nNow we are driving west to the Water Tower. We are going there because Theo has clean water. He has room for two people.\n\nI am sorry that I did not wait for you. Please come and find me there.\n\nMr. Ortiz left a note too. It is beside the red tool chest. That is at the back of the shop.\n\n—Dev",
        },
        "autoshop-trail2": {
          title: "The Red Key",
          text: "Mr. Ortiz again. Now I will tell you about the key.\n\nGo to the waiting room and find the soda machine. The key lies on the floor beside it. It is a big key, painted fire-engine red. It hangs on a brass ring.\n\nThis key opens the chief's locker at Station 12. That is north and west of here. Chief Dunn left the key with me. It was his thanks, because I fixed the convoy's trucks. Now it waits here for the ring.\n\nThe chief's locker has an old lock that bites. A wrong key snaps off inside it. Then that key is gone for good.\n\n—Mr. Ortiz",
        },
        "autoshop-dead1": {
          title: "The Job Board",
          text: "This is a job board on the wall. Mr. Ortiz wrote the jobs on it in thick grease pencil.\n\nJOBS:\nChief Dunn's fire truck: new brakes.\nSergeant Vega's van: new tires.\nCarla's boat motor: not done yet.\n\nThe writing is smeared now. No one will come for the van or the truck today. But the board still makes the shop look open. It looks like Mr. Ortiz will walk in soon. Then he will pick up a wrench and get to work.",
        },
        "autoshop-dead2": {
          title: "A Greasy Tip",
          text: "This note is on greasy paper. No one signed it.\n\nIt says: Do you want to get into the pit? The bolt is easy. Just do this: {decoyMoves}. Then the bolt comes right out.\n\nThat was true once, for the old bolt. But the old bolt wore out. So Mr. Ortiz put in a new one. The new bolt does not work this way. A wrong move bends it and jams the hatch.\n\nMr. Ortiz left his own note at the office. It tells the real trick for the new bolt. Read his note, not this one.",
        },
      },
      signs: {
        "autoshop-sign1": {
          title: "Shop Sign",
          text: "The painted sign says: Ortiz Auto, honest repairs. Under it is a row of greasy handprints, big and small.",
        },
        "autoshop-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R by the front door has a 5 under it. Next to it, she wrote: One by the engine crane.",
        },
        "autoshop-sign3": {
          title: "Safety Poster",
          text: "A safety poster says: Never work under a car alone. Someone added: Never work anywhere alone.",
        },
        "autoshop-sign4": {
          title: "Metal Plate",
          text: "The plate says: Keep the pit hatch shut. Chalk adds: Work the bolt wrong and it bends. Mr. Ortiz's note says how.",
        },
      },
      key: {
        name: "Big red key, brass ring",
        tag: "A big key is painted fire-engine red. It hangs on a brass ring. Its tag says: Return the favor.",
      },
    },

    /* ---------- Signal Electronics ---------- */
    radioshack: {
      blurb: "An electronics store downtown with wire and radio parts, near the walker crowds.",
      door: {
        title: "Cardboard in the Window",
        text: "Jo here. Yes, I am the Jo from the radio.\n\nThere are two spools of wire. They are between the two long middle shelves. One is on the TV wall side. The other is on the robot side.\n\nThere are at least six walkers inside. One stands by the robot, at the right end of the counter.\n\nThe manager's office is locked. The manager left a note about it. Her note is on the counter at the back.\n\n—Jo",
      },
      notes: {
        "radioshack-counter": {
          title: "Priya's Office Code",
          text: "I am Priya, and I run this store. The office has an alarm, so do these steps in order.\n\nFirst, turn off the alarm. Its panel is on the right wall, by the big dish. Press the {button} button.\n\nNext, go to the office door. Punch in the code {code}. Say it like this: {codeSpoken}.\n\nBe careful! A wrong button sets off the alarm. So does a wrong code. So does opening the door with the alarm still on. Then walkers pour in, even through the front door. They keep coming until they get you.\n\nThe office has two boxes of radio parts and more wire. Its door is in the back wall, near the robot. It is beside the MANAGER sign.\n\nThe 4th Precinct is the police station. It has gun parts. Lincoln Middle School has books. Both are north of downtown.\n\n—Priya",
        },
        "radioshack-trail1": {
          title: "Jo on 88.1",
          text: "Jo here again. You may know my voice. I talk on the radio at 88.1. I talk from a rooftop downtown every night. I read news, warnings, and messages.\n\nPriya built my first transmitter in this store. That is the box that sends my voice out. She made it from parts on these shelves.\n\nDoc Lin can not reach Nurse Ada. Ada can not reach Lin either. So I pass their words along on the radio.\n\nPriya left a note for you. It is on the floor, below the TV wall.\n\n—Jo",
        },
        "radioshack-trail2": {
          title: "A Key Like a Raindrop",
          text: "Priya here. Now I will tell you about the key.\n\nGo to the front of the store. Find the arcade game there. The key lies on the floor beside it. It is a long, thin key. Its blue tag is shaped like a drop of water.\n\nThis key opens the tool crib at the Water Tower. That is far west of here. Theo gave me the key. Jo and I needed his tools. We put an antenna on his tower. Now the key stays here, as part of the ring.\n\nThe tool crib has an old lock that bites. A wrong key snaps off inside it. Then that key is gone for good.\n\n—Priya",
        },
        "radioshack-dead1": {
          title: "Jo's Show Plan",
          text: "This is Jo's show plan. It is taped to a shelf. The tape is old and yellow.\n\nSHOW PLAN:\nNews at dusk.\nThen music.\nThen messages.\nWarnings first. Always.\n\nAt the bottom, in big letters, Jo wrote: No sad songs. People have enough.\n\nA coffee cup left a brown ring on one corner. Jo has used this plan every night for a long time. Jo plans each show with care and leaves nothing to luck.",
        },
        "radioshack-dead2": {
          title: "A Torn Envelope",
          text: "This note is on a torn envelope. No one signed it.\n\nIt says: The alarm panel is by the big dish. To turn the alarm off, press the {decoyButton} button. Then you can open the office.\n\nThat sounds like a big help. But this note is old. Priya rewired the alarm panel after someone wrote it. So the {decoyButton} button does not turn the alarm off now. A wrong button sets the alarm off instead.\n\nPriya's note is on the counter. It has the button that works now. Read her note before you press a thing.",
        },
      },
      signs: {
        "radioshack-sign1": {
          title: "Store Sign",
          text: "The store sign says: Signal Electronics. Under it, small words say: We fix what others throw away.",
        },
        "radioshack-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R has a 6 under it. Under it: One by the robot, at the end of the counter.",
        },
        "radioshack-sign3": {
          title: "Yellow Numbers",
          text: "Big yellow numbers are painted tall on the wall: 88.1. Under them it says: Jo, every night at dusk.",
        },
        "radioshack-sign4": {
          title: "Office Door",
          text: "The sign beside the door says: Manager's office, please knock. Someone wrote under it in marker: Priya says look under the register.",
        },
      },
      key: {
        name: "Thin key, blue drop tag",
        tag: "A long, thin key hangs on a blue tag. The tag is shaped like a drop of water. It says: Bring the wrench back.",
      },
    },

    /* ---------- Greenhouse Row ---------- */
    garden: {
      blurb: "Rosa's greenhouses out west, with seeds, soil, and a locked potting shed.",
      door: {
        title: "Paint on the Gate",
        text: "This is Rosa. I ran this greenhouse.\n\nThe soil is in the big greenhouse, with the scarecrow. The seeds are in the shop by the gate. Look near the big gnome.\n\nThere are at least five walkers inside. One is at the back of the big greenhouse.\n\nThe potting shed is locked. I left a note about it. My note is on the potting bench, by the palm tree. That is at the back on the right.\n\n—Rosa",
      },
      notes: {
        "garden-bench": {
          title: "Rosa's Shed Key",
          text: "Rosa here. You made it to my bench. Good.\n\nThe potting shed has a padlock. Three watering cans sit by this bench. The key is in one of them. Look in the {pick}. Tip it, and the key drops out.\n\nDo not tip the other two cans! They are my walker alarm. They are full of bells and tin cans. The noise brings walkers, more and more. They come in even through the gate. They keep coming until they get you.\n\nThe shed has more seeds and a water tank. Take some seeds, and leave some.\n\nGo out of the palm tree house. Take the path down toward the beehives. The shed door is on that path.\n\nDo you need tools? Station 12 is the fire station, north and east of here. Its equipment bay has tools and water tanks.\n\n—Rosa",
        },
        "garden-trail1": {
          title: "A Rattling Truck",
          text: "Rosa here. A truck came by my gate one day. It rattled so loud that I hid. Then I saw who it was. It was Dev and Mr. Ortiz. They stopped here to fill their water jugs.\n\nThey were going north to the Water Tower. Theo is there, and he has clean water.\n\nThe next day, Ruby came here. She was looking for Dev. I told her where he went, and she left fast.\n\nI left one more note for you. It is in the big greenhouse, by the scarecrow.\n\n—Rosa",
        },
        "garden-trail2": {
          title: "Keep the Ring Moving",
          text: "Rosa again. Now I will tell you about the key.\n\nGo out to the beehives. The key lies on the floor beside them. It is a greasy steel key. It hangs on a loop of wire.\n\nThis key opens the parts cage at Ortiz Auto. That is far east, across town. Mr. Ortiz gave me this key when his truck stopped here. He did not want the ring to break. So keep the ring moving, and take the key east.\n\nThe parts cage has a plain lock. A wrong key just will not turn in it.\n\n—Rosa",
        },
        "garden-dead1": {
          title: "Rosa's Planting Chart",
          text: "This is Rosa's planting chart. She drew it in pencil. Each bed has a small box.\n\nBeans go by the gate.\nTomatoes go at the back.\nSquash goes where the sun hits.\n\nThe beans came from seeds. Rosa's old friend June gave them to her.\n\nAt the bottom, Rosa wrote a note to herself. It says: Tell June the beans came up.\n\nShe drew a small sun next to it. But the box by that note is still blank. Did Rosa ever get to tell June?",
        },
        "garden-dead2": {
          title: "Note on a Seed Packet",
          text: "This note is on an empty seed packet. A stranger wrote it.\n\nIt says: The shed key is in the {decoyPick}. Just tip it out and walk in. You are welcome.\n\nThat was true once. But a looter read this note and came for the shed. So Rosa moved the key to a new can. Now the {decoyPick} is part of her walker alarm. It is full of bells.\n\nRosa's note is on the potting bench. It says where the key is now. Read her note before you tip a can.",
        },
      },
      signs: {
        "garden-sign1": {
          title: "Wooden Sign",
          text: "The wooden sign says: Greenhouse Row. Plants, seeds, soil. Below it: Open from dawn to dusk.",
        },
        "garden-sign2": {
          title: "Red Spray Paint",
          text: "Ruby's red R has a 5 under it. Under that, she wrote: One at the back of the big greenhouse.",
        },
        "garden-sign3": {
          title: "Chalk Circle",
          text: "A key in a chalk circle marks the shop's seed vault door. Under it: The key is not here. Read the notes.",
        },
        "garden-sign4": {
          title: "Potting Shed Sign",
          text: "The painted sign says: Potting shed. Mind the step. A small watering can is painted next to the words.",
        },
      },
      key: {
        name: "Greasy steel key, wire loop",
        tag: "A greasy steel key hangs on a loop of wire. Its tag says: Fix something good.",
      },
    },
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
