/* Grade 1 reading content for Zombie Survival Reading.
   See docs/CONTENT_GUIDE.md. Validate with: node tests/validate-content.js 1 */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.CONTENT = root.ZSR.CONTENT || {};
  root.ZSR.CONTENT[1] = {
    grade: 1,
    havens: [
      {
        id: "g1-school-bus-wall",
        place: "School Bus Wall",
        host: "Jo",
        intro: "Jo points at the south gate. There is red paint on the steel. \"Someone painted that last night. I can't see it from here. Read it to me.\"",
        kind: "warning",
        title: "Red Paint on the Gate",
        text: "STOP. Do not use this gate. The lock is bent. Walkers push on it at night. Use the bus door. Knock three times. Wait for Ruby. She will open it. Do not knock more. Walkers hear knocks. Keep Rook close. He hears them first.",
        questions: [
          { type: "detail", q: "How many times do you knock?", options: ["Two times", "Five times", "Three times"], answer: 2, hint: "Find the line about the bus door." },
          { type: "inference", q: "Why keep Rook close?", options: ["He can warn you", "He is cold", "He likes the bus"], answer: 0, hint: "Read the last line about what Rook hears." },
          { type: "vocab", word: "bent", q: "What does the word \"bent\" mean here?", options: ["Locked tight", "Out of shape", "Painted red"], answer: 1, hint: "Think about what the walkers do to the lock at night." }
        ],
        choice: {
          prompt: "Ruby opens the bus door. Which road next?",
          options: [
            { label: "The town road", desc: "It is short, but walkers stand in the street.", effects: { zombies: 1.3, length: 0.9, scrap: 20 }, result: "Dead cars fill the street, and walkers turn as you pass. Ruby does not slow down." },
            { label: "The field road", desc: "It is long and flat, and few walkers go there.", effects: { zombies: 0.8, length: 1.2 }, result: "Tall grass hides the ditch. Rook watches the window the whole way." }
          ]
        }
      },
      {
        id: "g1-gas-n-go",
        place: "Gas-N-Go",
        host: "Ruby",
        intro: "Ruby slides a torn page under the van door. \"Doc wrote the list. The ink ran. Tell me what we have and what we do not.\"",
        kind: "list",
        title: "Pump Shed List",
        text: "Gas: two cans. Full.\nOil: one can. Full.\nWater: six jugs. Four left.\nBeans: ten cans. Ten left.\nRice: one bag. Gone.\nMeds for Doc: one box. Gone.\n\nWe need rice. We need the meds more. Max knows a store on Elm. Go at dawn. Take Rook.",
        questions: [
          { type: "detail", q: "How many jugs of water are left?", options: ["Six", "Four", "Ten"], answer: 1, hint: "Find the line about water." },
          { type: "inference", q: "What will the crew do at the store?", options: ["Get rice and meds", "Fill the gas cans", "Sleep for the night"], answer: 0, hint: "Think about what the list says the crew needs." },
          { type: "vocab", word: "gone", q: "What does the word \"gone\" mean here?", options: ["Still full", "Put away", "Used up"], answer: 2, hint: "Look at what the list says about rice and meds." }
        ],
        choice: {
          prompt: "Ruby taps the map. Two ways to Elm.",
          options: [
            { label: "The main road", desc: "Short and fast, but cars block it and walkers wait there.", effects: { zombies: 1.3, length: 0.9, scrap: 25 }, result: "You weave past dead cars. Ruby grabs scrap from a truck bed." },
            { label: "The back lot", desc: "Long and quiet, and the dark comes before you get there.", effects: { zombies: 0.8, length: 1.2, night: true }, result: "The sun drops and you drive by headlight. Rook does not bark once." }
          ]
        }
      },
      {
        id: "g1-water-tower",
        place: "Water Tower",
        host: "Jo",
        intro: "Jo turns the log book so you can see it. \"I wrote this last night. My hand shook. Read it back to me.\"",
        kind: "log",
        title: "Tower Log, Day 60",
        text: "6:10. Max calls in. All clear.\n7:00. Mia calls in. All clear.\n7:30. No call from Doc.\n8:00. No call from Doc.\n8:20. Static. Then a voice. It is Doc. She is at the dam. Her truck is stuck. She is safe.\n8:30. Ruby goes to get her. Rook goes too.",
        questions: [
          { type: "detail", q: "Where is Doc?", options: ["At the dam", "At the tower", "On the road"], answer: 0, hint: "Look at the 8:20 line." },
          { type: "inference", q: "How does Jo feel at 8:20?", options: ["Bored", "Glad", "Mad"], answer: 1, hint: "Think about what the voice on the radio says." },
          { type: "vocab", word: "static", q: "What does the word \"static\" mean here?", options: ["A clear voice", "A loud horn", "Radio noise"], answer: 2, hint: "It is what Jo hears right before the voice." }
        ],
        choice: {
          prompt: "Jo marks two roads to the dam.",
          options: [
            { label: "The dam road", desc: "It runs by the water, and the fog is thick at dawn.", effects: { zombies: 0.9, fog: true }, result: "Gray fog sits on the road. You go slow, and Rook keeps his head up." },
            { label: "The ridge road", desc: "It is high and clear, but sprinters run on the ridge.", effects: { zombies: 1.2, runners: 1.5, scrap: 25 }, result: "Something runs by the trees. Ruby does not slow down, and you make the dam by noon." }
          ]
        }
      },
      {
        id: "g1-overpass-camp",
        place: "Overpass Camp",
        host: "Doc Lin",
        intro: "Doc Lin hands you a folded page. \"This was taped to a post. It is for someone's brother. If he comes through, I want to know what it says.\"",
        kind: "letter",
        title: "For Sam",
        text: "Sam,\n\nI wait two days. I can not wait more. I go north with the vans. Jo has a radio. Call her. Say my name. The map is under the big rock. Stay off the bridge. It is not safe. I will come back for you.\n\nTess",
        questions: [
          { type: "detail", q: "Where is the map?", options: ["In the van", "Under the big rock", "On the bridge"], answer: 1, hint: "Find the line with the word map." },
          { type: "inference", q: "How does Tess feel about Sam?", options: ["She wants him back", "She is mad at him", "She does not care"], answer: 0, hint: "Read the last line before her name." },
          { type: "vocab", word: "safe", q: "What does the word \"safe\" mean here?", options: ["Very far", "Wet and cold", "Free from harm"], answer: 2, hint: "Tess says to stay off the bridge, then says this." }
        ],
        choice: {
          prompt: "Doc points past the overpass. Two ways north.",
          options: [
            { label: "The bridge", desc: "Tess says it is not safe, but it is fast.", effects: { zombies: 1.4, length: 0.8, scrap: 30 }, result: "The bridge shakes under the van. Walkers crowd the far end, and Ruby guns it." },
            { label: "The long way", desc: "It goes around the river, and it takes all day.", effects: { zombies: 0.8, length: 1.3 }, result: "You pass the big rock and Doc looks under it. The map is gone, so Sam must have it." },
            { label: "The dark way", desc: "Wait for dark. Walkers see less at night, but so do you.", effects: { zombies: 0.9, night: true, crates: 2 }, result: "You roll out at dark with the lights low. Two crates sit by the road." }
          ]
        }
      },
      {
        id: "g1-fire-station",
        place: "Fire Station",
        host: "Ruby",
        intro: "Ruby jabs a thumb at the sheet on the bay door. \"The new kids do not read it. Read it out loud, so they hear it from you.\"",
        kind: "rules",
        title: "Bay Door Rules",
        text: "1. The bay door stays shut.\n2. Two people open it.\n3. No lights after dark.\n4. If Rook growls, get in the truck.\n5. Do not cross the red line.\n6. Call Jo at six. Call her at nine.\n7. A walker gets in? Ring the bell. Do not run.",
        questions: [
          { type: "detail", q: "When do you call Jo?", options: ["At noon and six", "At dark and dawn", "At six and nine"], answer: 2, hint: "Look at rule six." },
          { type: "inference", q: "What does it mean when Rook growls?", options: ["He wants food", "A walker is near", "He wants out"], answer: 1, hint: "Think about why rule four says to get in the truck." },
          { type: "vocab", word: "cross", q: "What does the word \"cross\" mean here?", options: ["Go past it", "Paint over it", "Stand on it"], answer: 0, hint: "Rule five is about the red line." }
        ],
        choice: {
          prompt: "Ruby lifts the bay door. Which way out?",
          options: [
            { label: "Main Street", desc: "Fast, but the stalled cars hide walkers.", effects: { zombies: 1.3, length: 0.9, scrap: 20 }, result: "You thread past dead cars. A walker turns, but you are past it." },
            { label: "The rail path", desc: "Slow and bumpy, but walkers do not climb the rail bed.", effects: { zombies: 0.7, length: 1.2, hp: -5 }, result: "The van jolts over the ties. Nothing follows." },
            { label: "The dark run", desc: "Go now, in the dark, and get the crates Max saw.", effects: { zombies: 1.0, night: true, crates: 3 }, result: "Headlights only. Max counts three crates off his map, and you get them all." }
          ]
        }
      },
      {
        id: "g1-greenhouse",
        place: "Greenhouse",
        host: "Max and Mia",
        intro: "Mia unrolls a map on the plant bench. Max holds the corners down. \"I drew it. Mia wrote the key. Read it so we both get it right.\"",
        kind: "map",
        title: "Mia's Map Key",
        text: "The green box is here. The blue line is the creek. Cross it at the rocks. The bridge is down. The red X is a walker nest. Stay far from it. The black dots are cars. Some have gas. The star is the next camp. Two days by van.",
        questions: [
          { type: "detail", q: "What is the red X?", options: ["The next camp", "A walker nest", "The creek"], answer: 1, hint: "Find the line that says red." },
          { type: "inference", q: "Why cross the creek at the rocks?", options: ["The bridge is down", "The rocks are dry", "The water is warm"], answer: 0, hint: "Read the line right after the rocks." },
          { type: "vocab", word: "nest", q: "What does the word \"nest\" mean here?", options: ["A bird's home", "A kind of car", "Where walkers gather"], answer: 2, hint: "The map says to stay far from it." }
        ],
        choice: {
          prompt: "Max taps the map. Two ways to the star.",
          options: [
            { label: "By the cars", desc: "Short, and some cars have gas, but the nest is close.", effects: { zombies: 1.4, length: 0.9, scrap: 30 }, result: "Ruby pulls gas from a dead van. Something moans past the trees, and you do not stay." },
            { label: "By the creek", desc: "Long and wet, and the fog sits on the water.", effects: { zombies: 0.8, length: 1.2, fog: true }, result: "Fog rolls off the creek. You cross at the rocks, and the van makes it." }
          ]
        }
      },
      {
        id: "g1-radio-tower",
        place: "Radio Tower",
        host: "Doc Lin",
        intro: "Doc Lin wipes grease off a card with her sleeve. \"The well pump. Ruby wrote the steps. Get them wrong and there is no water tonight. Read them.\"",
        kind: "manual",
        title: "How to Run the Pump",
        text: "1. Check the gas. Fill it if low.\n2. Turn the red key.\n3. Pull the cord hard. Pull it two times.\n4. Wait for the hum.\n5. Open the tap slow.\n6. Fill the tanks.\n7. Turn the key off.\n\nIt is loud. Walkers hear it. Run it one hour. No more.",
        questions: [
          { type: "detail", q: "How many times do you pull the cord?", options: ["One time", "Two times", "Four times"], answer: 1, hint: "Look at step three." },
          { type: "inference", q: "Why run the pump one hour only?", options: ["The gas is low", "The tap leaks", "Walkers hear it"], answer: 2, hint: "Read the lines after step seven." },
          { type: "vocab", word: "hum", q: "What does the word \"hum\" mean here?", options: ["A low sound", "A bright light", "A cold wind"], answer: 0, hint: "Step four says to wait for it after you pull the cord." }
        ],
        choice: {
          prompt: "Doc fills the tanks. Which road out?",
          options: [
            { label: "The quarry road", desc: "Steep and short, but bruisers walk the quarry.", effects: { zombies: 1.2, brutes: 1.5, length: 0.9, scrap: 25 }, result: "A big shape stands at the quarry edge. It is slow, and you are not." },
            { label: "The farm road", desc: "Flat and long, with a crate out in the fields.", effects: { zombies: 0.8, length: 1.2, crates: 1 }, result: "Dead corn stands in the fields. Mia spots a crate by a fence." }
          ]
        }
      },
      {
        id: "g1-quarry-gate",
        place: "Quarry Gate",
        host: "Max and Mia",
        intro: "Max pulls a note off a stalled truck by the gate. Rain has blurred the ink. \"Someone left this for the next crew. That is us. Read it.\"",
        kind: "note",
        title: "Note on the Truck",
        text: "Next van:\n\nThis truck is dead. Take the gas. The keys are on the seat. Do not go in the pit. Walkers are in it. They can not climb out. But they are still there. We go west. Look for a white flag. That is us. Good luck.\n\nThe Cole crew",
        questions: [
          { type: "detail", q: "Where are the keys?", options: ["On the seat", "In the pit", "By the flag"], answer: 0, hint: "Find the line with the word keys." },
          { type: "inference", q: "What does the Cole crew want you to do?", options: ["Fix the truck", "Wait for them", "Take what you need"], answer: 2, hint: "Read what they say to take." },
          { type: "vocab", word: "dead", q: "What does the word \"dead\" mean here?", options: ["Is very old", "Does not run", "Is on fire"], answer: 1, hint: "Think about a truck you have to leave behind." }
        ],
        choice: {
          prompt: "Mia looks west. Two roads.",
          options: [
            { label: "West by day", desc: "The road is open, but walkers walk it too.", effects: { zombies: 1.2, scrap: 20 }, result: "Dust and sun. Far off, a white rag flaps on a pole." },
            { label: "West at dark", desc: "Wait for night. Fewer walkers see you, but you see less.", effects: { zombies: 0.8, night: true, length: 1.1 }, result: "Headlights cut the dark, and Rook sleeps the whole way." }
          ]
        }
      }
    ],
    roadSigns: [
      { text: "Paint on the overpass: WALKERS PAST THIS LINE. GO BACK.", q: "What should you do here?", options: ["Go back", "Go on", "Stop and wait"], answer: 0 },
      { text: "Jo on the radio: \"Bridge is out at Mile 9. Use the hill road.\"", q: "Which road should you use?", options: ["The bridge", "The hill road", "Mile 9"], answer: 1 },
      { text: "Sign on a fence: SAFE CAMP. KNOCK THREE TIMES.", q: "How do you get in?", options: ["Climb the fence", "Call on the radio", "Knock three times"], answer: 2 },
      { text: "Note on a car: \"Gas is gone. Tire is good. Take it.\"", q: "What can you take?", options: ["The gas", "The tire", "The car"], answer: 1 },
      { text: "Max on the radio: \"Two crates by the gas sign. Hurry.\"", q: "Where are the crates?", options: ["By the gas sign", "By the bridge", "In the van"], answer: 0 },
      { text: "Paint on a wall: NO LIGHTS AT NIGHT. THEY SEE LIGHT.", q: "What should you not do at night?", options: ["Drive fast", "Use lights", "Make noise"], answer: 1 },
      { text: "Sign on a gate: WATER TOWER. CLEAN WATER. FILL UP.", q: "What can you get here?", options: ["Gas", "Food", "Clean water"], answer: 2 },
      { text: "Mia on the radio: \"Sprinters on Elm. Do not stop.\"", q: "What is on Elm?", options: ["Sprinters", "Crates", "A camp"], answer: 0 }
    ]
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
