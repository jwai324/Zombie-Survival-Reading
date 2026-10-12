/* Grade 2 reading content for Zombie Survival Reading.
   See docs/CONTENT_GUIDE.md. Validate with: node tests/validate-content.js 2 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[2] = {
    grade: 2,
    havens: [
      {
        id: "g2-library-fort",
        place: "Library Fort",
        host: "Max and Mia",
        intro: "Mia holds out a notebook with the cover torn off. Max looks at the floor. \"It got rained on. Half the words ran. Jo wants it in the log. You read it. I can't look at it.\"",
        kind: "diary",
        title: "Mia's Diary, Day 52",
        text: "Day 52. The radio has been quiet for three days. Jo sits by it all night. She does not say much.\n\nMax and I walked the wall at dawn. We counted nine walkers in the lot. Last week it was four. They are coming closer. Ruby welded two more bus doors onto the wall.\n\nTonight the radio clicked. Jo grabbed the headset. It was Doc Lin. She said, \"Still here.\" Jo cried a little. Then she wrote it down.",
        questions: [
          { type: "detail", q: "How many walkers did the twins count in the lot?", options: ["Four", "Nine", "Three"], answer: 1, hint: "Look at the part about walking the wall at dawn." },
          { type: "inference", q: "Why did Ruby add more bus doors to the wall?", options: ["The walkers are coming closer", "The old doors looked bad", "Jo asked for more room"], answer: 0, hint: "Read the two lines right before Ruby's name." },
          { type: "vocab", word: "welded", q: "What does the word \"welded\" mean here?", options: ["Painted them", "Took them off", "Fixed them on"], answer: 2, hint: "Think about what Ruby did with the bus doors and the wall." }
        ],
        choice: {
          prompt: "Max spreads the map. Two roads leave the Fort, and one more if you wait.",
          options: [
            { label: "The lot road", desc: "It goes right past the nine walkers, but it is the short way.", effects: { zombies: 1.4, length: 0.8, scrap: 25 }, result: "The walkers turn as one. Ruby does not slow down, and the lot falls behind you." },
            { label: "The creek road", desc: "It loops around the lot, and it takes most of a day.", effects: { zombies: 0.8, length: 1.3 }, result: "The creek road is empty and slow. Rook sleeps with one ear up." },
            { label: "The night road", desc: "Leave after dark. Walkers see less, but so do you.", effects: { zombies: 0.9, night: true, crates: 2 }, result: "Headlights only. Mia spots two crates in the ditch." }
          ]
        }
      },
      {
        id: "g2-old-lighthouse",
        place: "Old Lighthouse",
        host: "Abe",
        intro: "An old man with a lantern waits at the bottom of the lighthouse steps. \"Name's Abe. I keep the light. The code is painted on the wall. My eyes are no good anymore. Read it, so you know what the light is telling you.\"",
        kind: "sign",
        title: "The Light Code",
        text: "THE LIGHT TALKS. LEARN IT.\n\nOne long flash: the road is clear. Come in.\nTwo short flashes: walkers on the beach. Wait.\nThree short flashes: walkers at the gate. Go back.\nNo light at all: the keeper is gone. Do not come.\n\nThe light turns on at dark. It turns off at dawn. No light? Look for a white rag on the rail. White rag means I am still here. The light just needs gas.",
        questions: [
          { type: "detail", q: "What do two short flashes mean?", options: ["Walkers on the beach", "The road is clear", "The keeper is gone"], answer: 0, hint: "Find the line that starts with two." },
          { type: "inference", q: "No light, but a white rag on the rail. What does it mean?", options: ["Abe is gone", "Walkers are at the gate", "Abe needs gas for the light"], answer: 2, hint: "Read the last three lines." },
          { type: "vocab", word: "keeper", q: "What does the word \"keeper\" mean here?", options: ["A kind of walker", "The one who runs the light", "A boat on the beach"], answer: 1, hint: "Think about who wrote the sign and what his job is." }
        ],
        choice: {
          prompt: "Abe points down the coast. Two roads.",
          options: [
            { label: "The beach road", desc: "Flat and fast, but the tide brings fog, and walkers walk the sand.", effects: { zombies: 1.2, fog: true, scrap: 20 }, result: "Fog comes off the water. Shapes move on the sand, and you do not stop to count them." },
            { label: "The cliff road", desc: "High, slow, and clear. Nothing walks up there but you.", effects: { zombies: 0.7, length: 1.2 }, result: "The cliff road is long and empty. Behind you, Abe gives one long flash: the road is clear." }
          ]
        }
      },
      {
        id: "g2-mile-9-diner",
        place: "Mile 9 Diner",
        host: "Ruby",
        intro: "Ruby slaps a page on the diner counter. Coffee rings cover half of it. \"Doc counted the stock. Something on this list does not add up. Read it and tell me what.\"",
        kind: "list",
        title: "Diner Stock, Week 8",
        text: "Counted by Doc Lin. Checked by Jo.\n\nWater: twelve jugs. Twelve on the shelf.\nBeans: twenty cans. Twenty on the shelf.\nRice: four bags. Four on the shelf.\nGas: six cans. Five on the shelf.\nMeds: two boxes. Two on the shelf.\nBatteries: one box. One on the shelf.\n\nNote from Jo: One gas can is missing. The door was locked all night. Nobody left camp. Ask Max and Mia who had the van keys last.",
        questions: [
          { type: "detail", q: "How many gas cans are on the shelf?", options: ["Six", "Four", "Five"], answer: 2, hint: "Find the line that starts with gas." },
          { type: "inference", q: "What does Jo think happened to the gas?", options: ["Walkers took it", "Someone in camp used it", "It leaked out"], answer: 1, hint: "Read Jo's note about the door and the keys." },
          { type: "vocab", word: "missing", q: "What does the word \"missing\" mean here?", options: ["Not where it should be", "Full to the top", "Too heavy to lift"], answer: 0, hint: "Compare the gas count with what is on the shelf." }
        ],
        choice: {
          prompt: "Ruby pockets the van keys. Which way from Mile 9?",
          options: [
            { label: "The highway", desc: "Fast and straight, but stalled cars line both sides for miles.", effects: { zombies: 1.3, length: 0.9, scrap: 25 }, result: "You thread the stalled lanes while Mia admits she filled the van tank last night. That was the missing can." },
            { label: "The county road", desc: "Slow and quiet, with a crate left behind by another crew.", effects: { zombies: 0.8, length: 1.2, crates: 1 }, result: "The county road is empty. Mia admits she filled the van tank last night, and Ruby almost smiles." }
          ]
        }
      },
      {
        id: "g2-train-yard",
        place: "Train Yard",
        host: "Jo",
        intro: "Jo shines a flashlight on the side of a rusted boxcar. The letters are tall and dripping. \"Somebody wanted this read. Read it, slow.\"",
        kind: "warning",
        title: "Painted on Car 40",
        text: "READ THIS BEFORE YOU GO IN.\n\nThe yard is not clear. Walkers are in cars 12 to 20. The doors are shut, but they are not locked. Do not slide any door open. Do not bang on the metal. They wake up when they hear it.\n\nThe tool shed is safe. The key is under the red brick. Take what you need. Leave the rest for the next crew. Lock it when you go.\n\nNobody got hurt here. Keep it that way.",
        questions: [
          { type: "detail", q: "Where is the shed key?", options: ["Inside car 12", "On the shed door", "Under the red brick"], answer: 2, hint: "Look at the lines about the tool shed." },
          { type: "inference", q: "Why leave some tools for the next crew?", options: ["Others will need them too", "The tools are broken", "The shed is too small"], answer: 0, hint: "Think about who else will read this wall." },
          { type: "vocab", word: "clear", q: "What does the word \"clear\" mean here?", options: ["Easy to see", "Free of walkers", "Clean and swept"], answer: 1, hint: "Read what the next line says is in the cars." }
        ],
        choice: {
          prompt: "Jo locks the shed. Which way out of the yard?",
          options: [
            { label: "Along the tracks", desc: "Straight and flat, but the tracks pass cars 12 to 20.", effects: { zombies: 1.4, length: 0.9, scrap: 30 }, result: "Metal doors rattle as you pass. Nothing slides open, and the yard falls behind." },
            { label: "The service road", desc: "It bends around the yard, and the fog off the river is thick.", effects: { zombies: 0.8, length: 1.1, fog: true }, result: "The service road is slow and gray. Rook stays quiet the whole way." }
          ]
        }
      },
      {
        id: "g2-boat-dock",
        place: "Boat Dock",
        host: "Doc Lin",
        intro: "Doc Lin hands you a letter in a plastic bag. \"Found it nailed inside the cabin of that blue boat. Someone wrote it for family. If they come through here, I want to be able to tell them what it says.\"",
        kind: "letter",
        title: "Letter in the Blue Boat",
        text: "Dee,\n\nYou made it to the dock. Good. I knew you would.\n\nThe boat has no motor. Do not try to take it out. Dad and I went north on foot. We follow the river road. We mark every turn with a blue X. Follow the X marks and you will find us.\n\nThere is food in the cooler. There is a radio in the bag. Call on channel nine at noon. We listen every day.\n\nWe are not leaving without you.\n\nMom",
        questions: [
          { type: "detail", q: "What channel should Dee call on?", options: ["Channel six", "Channel nine", "Channel two"], answer: 1, hint: "Find the line about the radio and noon." },
          { type: "inference", q: "Why did Mom and Dad mark the turns with a blue X?", options: ["So walkers stay away", "So the boat stays safe", "So Dee can follow them"], answer: 2, hint: "Read what Mom says to do with the X marks." },
          { type: "vocab", word: "cooler", q: "What does the word \"cooler\" mean here?", options: ["A box for food", "A cold wind", "A kind of boat"], answer: 0, hint: "Think about what Mom says is inside it." }
        ],
        choice: {
          prompt: "Doc puts the letter back where she found it. Which road north?",
          options: [
            { label: "The river road", desc: "The one Mom marked. Long and wet, and the fog never lifts.", effects: { zombies: 0.8, length: 1.2, fog: true }, result: "Blue X marks show up on posts and trees. Someone is still ahead of you." },
            { label: "The ridge cut", desc: "Short and dry, but sprinters use the cut too.", effects: { zombies: 1.2, runners: 1.6, length: 0.9, scrap: 25 }, result: "Something fast crosses the road behind you. Ruby does not look back." }
          ]
        }
      },
      {
        id: "g2-ranger-station",
        place: "Ranger Station",
        host: "Ruby",
        intro: "Ruby drops a grease-stained card on the hood. \"Generator steps. I wrote them half asleep. Read them back before I touch it. Skip one and we lose the lights.\"",
        kind: "manual",
        title: "Generator Start-Up",
        text: "1. Check the fuel. Half a tank or more.\n2. Open the vent on the roof. Fumes can make you sick.\n3. Turn the switch to START.\n4. Pull the cord. Pull it three times.\n5. If it does not catch, wait one minute. Try again.\n6. When it hums, flip the switch to RUN.\n7. Turn on one light at a time.\n\nRun it two hours, no more. It is loud. Shut it off before full dark. Walkers follow sound in the dark.",
        questions: [
          { type: "detail", q: "How many times do you pull the cord?", options: ["Three times", "Two times", "One time"], answer: 0, hint: "Look at step four." },
          { type: "inference", q: "Why shut the generator off before full dark?", options: ["The fuel runs out", "Walkers follow the sound", "The lights get too hot"], answer: 1, hint: "Read the last line on the card." },
          { type: "vocab", word: "catch", q: "What does the word \"catch\" mean here?", options: ["Fall over", "Get stuck", "Start running"], answer: 2, hint: "Step five says what to do if it does not happen." }
        ],
        choice: {
          prompt: "Ruby wipes her hands. Which road from the station?",
          options: [
            { label: "The logging road", desc: "Steep and short, and bruisers come down out of the trees.", effects: { zombies: 1.2, brutes: 1.6, length: 0.9, scrap: 30 }, result: "A big slow shape stands between the pines. You are past it before it turns." },
            { label: "The lake loop", desc: "Flat and long. It is the road the rangers used.", effects: { zombies: 0.7, length: 1.3 }, result: "The lake loop is quiet. Max draws the shoreline as you drive." },
            { label: "The dusk run", desc: "Leave at dusk. It gets dark fast, but there are crates at the boat ramp.", effects: { zombies: 1.0, night: true, crates: 3 }, result: "The light goes fast. Three crates sit at the ramp, right where Max said." }
          ]
        }
      },
      {
        id: "g2-toll-plaza",
        place: "Toll Plaza",
        host: "Doc Lin",
        intro: "Doc Lin peels a poster off a toll booth window. \"These are all over the plaza. Someone is looking for a kid. Read it. If we have seen him, we need to say so.\"",
        kind: "poster",
        title: "Looking for Ben",
        text: "LOOKING FOR BEN REYES. Age 16. Tall, thin, black hair. Last seen at the Toll Plaza, Day 30. He had a green pack and a red bike.\n\nBen, if you see this, come to the Water Tower. Go north on Route 4. Knock on the gate and ask for Ana. She will know your name.\n\nIf anyone has seen Ben, leave a note here. Say the day and the road. We check this booth every week.\n\nHe is not alone out there. He has us.",
        questions: [
          { type: "detail", q: "What color is Ben's bike?", options: ["Green", "Black", "Red"], answer: 2, hint: "Find the line about what Ben had with him." },
          { type: "inference", q: "Why does Ana's crew check the booth every week?", options: ["They sell tickets there", "They hope for news of Ben", "They live in the booth"], answer: 1, hint: "Read what the poster asks people to leave at the booth." },
          { type: "vocab", word: "pack", q: "What does the word \"pack\" mean here?", options: ["A bag for your back", "A group of dogs", "A deck of cards"], answer: 0, hint: "Ben had it with him, along with his bike." }
        ],
        choice: {
          prompt: "Doc tapes the poster back up. Which lane out of the plaza?",
          options: [
            { label: "Route 4 north", desc: "The way Ana's crew went. Open road, and walkers use open road.", effects: { zombies: 1.3, scrap: 20 }, result: "Far up Route 4, a red bike leans on a mile marker. Mia writes down the day and the road." },
            { label: "The frontage road", desc: "Slow, bumpy, and empty. It bends back toward the river.", effects: { zombies: 0.8, length: 1.2, hp: -5 }, result: "The frontage road rattles the van. Nothing follows, and nobody says much." }
          ]
        }
      },
      {
        id: "g2-drive-in",
        place: "Drive-In",
        host: "Jo",
        intro: "Jo spreads the log book on the ticket booth counter. \"The night the radio went quiet. I kept writing anyway. Read it. I want to hear how it sounds to someone else.\"",
        kind: "log",
        title: "Drive-In Log, Night 61",
        text: "9:00 PM. Max and Mia check in from the screen tower. All clear.\n\n10:00 PM. Ruby checks in from the gate. All clear.\n\n11:00 PM. No check-in from the tower. I call twice. Nothing.\n\n11:20 PM. Still nothing. Rook is standing at the door. He does not bark. Ruby goes up with a light.\n\n11:45 PM. Ruby calls. Both twins are fine. Their radio battery died. Mia is mad at herself. Max is laughing.\n\nMidnight. All clear. New rule: spare batteries go up the tower.",
        questions: [
          { type: "detail", q: "Who went up the tower with a light?", options: ["Jo", "Ruby", "Rook"], answer: 1, hint: "Look at the 11:20 PM line." },
          { type: "inference", q: "Why is there a new rule about batteries?", options: ["So Jo can sleep more", "So Max stops laughing", "So the radio stays on"], answer: 2, hint: "Think about why the twins missed their check-in." },
          { type: "vocab", word: "spare", q: "What does the word \"spare\" mean here?", options: ["Extra ones", "Broken ones", "Heavy ones"], answer: 0, hint: "Think about what the tower needed when the battery died." }
        ],
        choice: {
          prompt: "Jo closes the log. Where to from the Drive-In?",
          options: [
            { label: "The old highway", desc: "Short and open. Walkers like open road, and so do scrap piles.", effects: { zombies: 1.3, length: 0.9, scrap: 30 }, result: "Scrap glints in a wrecked trailer, and Ruby stops just long enough to grab it." },
            { label: "The back roads", desc: "Long and twisty. Nobody has used them in months.", effects: { zombies: 0.7, length: 1.3 }, result: "Grass grows through the back roads. Rook sleeps the whole way, which means nothing is near." },
            { label: "The night run", desc: "Leave now, in the dark, and be there by dawn.", effects: { zombies: 1.0, night: true, length: 0.9, crates: 1 }, result: "Headlights only. One crate sits at a crossroads, and you take it." }
          ]
        }
      }
    ],
    roadSigns: [
      { text: "Spray paint on the overpass: WALKERS PAST THIS POINT. NO SAFE CAMP FOR 20 MILES.", q: "How far is it to a safe camp?", options: ["Two miles", "Twenty miles", "Ten miles"], answer: 1 },
      { text: "Jo on the radio: \"Bridge at Mile 9 is out. Take the quarry road and go slow.\"", q: "Which road should you take?", options: ["The bridge", "Mile 9 road", "The quarry road"], answer: 2 },
      { text: "Hand-lettered sign on a fence: SAFE CAMP AHEAD. HONK ONCE, THEN WAIT. DO NOT GET OUT.", q: "What should you do after you honk?", options: ["Get out and knock", "Wait in the van", "Honk again"], answer: 1 },
      { text: "Note taped to a stalled car: \"Gas tank is empty. Battery is good. Take it, we did not need it.\"", q: "What is still good in the car?", options: ["The battery", "The gas", "The tires"], answer: 0 },
      { text: "Max on the radio: \"Sprinters on the hill road. Do not stop for anything until the water tower.\"", q: "When can you stop?", options: ["On the hill road", "Right now", "At the water tower"], answer: 2 },
      { text: "Paint on a garage door: NO LIGHTS AFTER DARK. THEY FOLLOW LIGHT.", q: "Why should you turn the lights off at night?", options: ["To save the battery", "Walkers follow light", "So the crew can sleep"], answer: 1 },
      { text: "Chalk on the road: \"Cole crew went west, Day 70. Three crates in the barn for whoever needs them.\"", q: "Where are the crates?", options: ["In the barn", "On the road", "In the van"], answer: 0 },
      { text: "Sign nailed to a tree: RANGER STATION 3 MILES. GATE OPENS AT DAWN. DO NOT KNOCK AT NIGHT.", q: "When does the gate open?", options: ["At night", "At noon", "At dawn"], answer: 2 }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
