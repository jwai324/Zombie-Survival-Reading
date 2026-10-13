/* Reading level 1: home. Yard lot signs, June's journal, the radio, item tags, and the day recap.
   Facts: js/story-home.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[1] = root.ZSR.TEXT[1] || { level: 1 });

  T.yard = {
    lots: {
      garden: {
        title: "Garden plot",
        empty:
          "GARDEN, someday. June paints that on the sign. Stakes and string mark out beds. They sit in the dark dirt. It is right behind the cabin. Raised beds could go here. Fill them with seeds and soil. Then they grow food. Each van trip eats food.",
        built: [
          "The sign says GARDEN. One raised bed is in. Seeds sit in the soil now. June checks the bed each morning. She pokes the dirt. She looks for green. The bed grows 1 food each day. Small, but it is a start.",
          "The sign says GARDEN. Now there are more beds. Beans climb up the string. Pip counts the pods out loud. June tells Pip to count quiet. The beds grow 2 food each day. Our stock lasts a bit longer.",
          "The sign says GARDEN. A water tank stands by the beds. A hose runs from it. It feeds each bed. June has her full garden at last. She grins at it a lot. It grows 3 food each day. Nobody goes hungry here now.",
        ],
      },
      farm: {
        title: "Farm field",
        empty:
          "FARM, after the Garden and the Well. Tomas paints that on the sign. Past the garden is wide grass. A stake marks each corner. A crop field could go here. Its food adds to the Garden. Later, it could hold animals too. Hens, maybe. Goats, maybe.",
        built: [
          "The sign says FARM. A crop field fills the grass. Corn and beans grow in long rows. The rows run to the fence. The field grows 2 food each day. That is on top of the Garden. Pip walks the rows at dusk.",
          "The sign says FARM. Now there is a chicken coop. It has wire walls. The hens are loud at dawn. Very loud. Pip picks up the eggs each day. Pip names every hen. The farm gives 4 food each day.",
          "The sign says FARM. A goat pen stands past the coop. A trough fills from the Well. The goats chew on all of it. Even the rope. Goats are almost as good as dogs. Pip says so. The farm gives 6 food each day.",
        ],
      },
      well: {
        title: "Well site",
        empty:
          "WELL. Dig after the Water room is built. June paints that on the sign. Stones ring a spot by the cabin. Deep water comes up cold and clean. You would heal faster in the yard. The Farm needs the Well first. So does the Lab.",
        built: [
          "The sign says WELL. Here is a hand-dug well. Lumber lines the inside. A bucket hangs on a rope. Drop it down. Pull it up. The water is cold and clean. It helps you heal faster in the yard.",
          "The sign says WELL. No more bucket and rope. Now a hand pump lifts the water. A filter sits on the pump. Pip likes to work the handle. Push down, and water comes out. You heal in the yard even faster.",
          "The sign says WELL. Now a pump runs on wire. It fills a tank all by itself. Nobody has to pump by hand. You heal in the yard faster than ever. You start each building at full health. That is a big help.",
        ],
      },
      water: {
        title: "Water barrel",
        empty:
          "WATER, filter goes here. Tomas paints that on the sign. An empty barrel sits on two sawhorses. It is by the cabin wall. Rain fills it, but gray. A filter and tank could go here. They turn gray rain clear. Then you heal faster in the yard.",
        built: [
          "The sign says WATER. A filter sits on the barrel. Gray water goes in the top. Clear water comes out the tap. Tomas tastes it first. He makes a face. It is fine. You heal slow in the yard.",
          "The sign says WATER. Now there is a filter. A big tank sits by it. The tank is full of clean water. Nobody has to wait for rain. Pip checks the tank each night. You heal faster in the yard.",
          "The sign says WATER. Two filters work now. A tank sits by them. The water is the best in town. You heal even faster in the yard. Walk into each building at full health. That means fewer kits used up.",
        ],
      },
      power: {
        title: "Power pole",
        empty:
          "POWER, lights first. Tomas paints that on the sign. A bare pole stands by the shed. Old rope lies coiled at its foot. Fuel, wire, and lights could go here. Then the map would show danger. You would know each bad place. Later a generator could do more.",
        built: [
          "The sign says POWER. Fuel cans sit by the pole. Wire runs up it. A string of lights works now. They glow on the yard at night. The map shows danger at every place. Now you know what you drive into.",
          "The sign says POWER. A generator hums here. A tin roof keeps it dry. The map shows danger. You find one supply crate each drive. Tomas pats the generator. He calls it a good beast.",
          "The sign says POWER. More wire runs out to the van. The van has headlights now. The map shows danger. You find two supply crates each drive. The lights cut through night. They cut through fog too.",
        ],
      },
      radio: {
        title: "Radio mast",
        empty:
          "RADIO, Pip's job. Pip paints that on the sign. A tall post stands in the yard. A ladder leans on it. A radio mast could go here. It would pick up voices from town. The voices tell where places are. Then they show up on your map.",
        built: [
          "The sign says RADIO. A short mast holds up an antenna. A receiver sits under it. Static hisses out. Then voices. Pip writes down every voice. It finds three new places. They go on the map.",
          "The sign says RADIO. The mast is taller now. It reaches all over town. Every voice comes in clear. Pip's list gets long. Pip needs more paper. Now every place shows on the map.",
          "The sign says RADIO. The tall mast still stands. A shelf of books sits by it. Pip uses them for the voice log. The radio finds every place. It shows which places still have items. No more blind drives.",
        ],
      },
      lab: {
        title: "Lab corner",
        empty:
          "LAB, after the Medbay and the Well. June paints that on the sign. A shady corner has a bench. Empty jars sit on it. Herb beds could go here. So could a still. They would make med kits at home. That means fewer trips to the hospital.",
        built: [
          "The sign says LAB. Herb beds grow by the bench. A copper still sits on top. It cooks herbs into meds. It drips slow. One medical kit every 2 days. June guards it like gold.",
          "The sign says LAB. The bench is clean now. A sink sits in it. The sink runs filtered water. June keeps her hands and tools spotless. It makes 1 medical kit each day. That is one less trip out.",
          "The sign says LAB. This is a powered lab now. It hums off a generator. Lights glow on the bench at night. It makes 2 medical kits each day. Doc Lin would like this place. June says so too.",
        ],
      },
    },
  };

  T.journal = [
    {
      title: "Day One, by Candle",
      text: "Candle lit. Green ledger open. The van rolls into the yard. Last drops of fuel. Tomas talks to the engine. The whole way. Our cabin: south end of town. Empty. Dry. A woodstove. The door still locks. Pip sleeps on the bench. Bags still out. You take first watch at the window. Nothing comes.\n\n—June",
    },
    {
      title: "The Cabin by Day",
      text: "In daylight the cabin looks bigger. It is a whole family house. It has a porch. The roof is sound. An old fence circles the yard. Some boards are loose. The back dirt is dark and good. I see it first. Rule one goes inside the door. Say where you go.\n\n—June",
    },
    {
      title: "Old but Honest",
      text: "Tomas spends the morning under the van. He comes out smiling. The van is old, he says. But honest. Like a good mule. Then you drive out for supplies. I watch the road until you return. Pip counts the minutes you are gone. Pip writes the number on the wall.\n\n—June",
    },
    {
      title: "They Come in Waves",
      text: "First walkers at the fence, at dusk. They come in a group. They push at the boards. Then the yard goes quiet. For a while. So now I know. They come in waves. There is calm in between. A new rule goes on the door. No shouting in the yard. Walkers follow sound.\n\n—June",
    },
    {
      title: "Pip Asks Questions",
      text: "Pip asks where all the town went. I tell the truth. Some people left. Some hid. Some are still out there. They help each other. Then Pip asks. Can we keep a dog we find? A dog eats too, I say. And it needs a name, Pip says. Pip has thought about this.\n\n—June",
    },
    {
      title: "Patch Before Supper",
      text: "The days have a rhythm now. Drive out. Come home. Hold the fence. A fence hole does not close itself. Someone has to patch it with scrap. So I make a rule. Patch the fence before supper. Supper is beans again. Nobody says a word about it. Not out loud.\n\n—June",
    },
    {
      title: "Before the Fall",
      text: "Before the Fall, I was a gardener. I kept a school garden. I want raised beds behind the cabin. Beans, squash, and tomatoes. My old friend Rosa ran the greenhouses. They are at Greenhouse Row. That is west of the gas station. Who still has seeds? Rosa does. I bet my boots.\n\n—June",
    },
    {
      title: "The Red R",
      text: "People talk about a scout named Ruby. She paints a red R on buildings. She writes a number by it. It tells how many walkers are inside. Pip paints an R on a board. Then a number by it. A stranger who warns other strangers? That is a good sign.\n\n—June",
    },
    {
      title: "Wire and Stubbornness",
      text: "Tomas's father was a mechanic. He learned at Ortiz Auto. From Mr. Ortiz himself. Tomas learned it from his father. He grew up under cars. He handed over wrenches. Today he fixes the van's loose mirror. He uses wire and stubbornness. Is Mr. Ortiz still out there? He hopes so. So do I.\n\n—June",
    },
    {
      title: "Rain and Cards",
      text: "It rains all day. The roof leaks in two spots. We put pots under the drips. Plink, plink, plink. Then we play cards by the stove. Pip wins every game. Pip will not tell us how. Rain, and all of us inside? That is a good day. I will take it.\n\n—June",
    },
    {
      title: "Static and Voices",
      text: "Pip finds an old radio dial. It was in a drawer. Pip turns it for an hour. Only static. Pip is sure voices are out there. People say Jo talks on the radio. From a rooftop. Pip starts a list of every voice. The first name on it is June. That is me.\n\n—June",
    },
    {
      title: "The Sunflower Kids",
      text: "Today I think of my school garden. The kids plant sunflowers by the fence. I teach them to plant seeds. One finger deep. Water it every day, I tell them. Where are those kids now? I do not know. I hope they remember the sunflowers. I hope they plant more.\n\n—June",
    },
    {
      title: "Counting the Food",
      text: "Each night I count the food. I write the number in this ledger. Every trip in the van eats food. A hungry crew makes a weak van. Our rule: we all eat the same. Even when there is not much. Tomas gives Pip half his bread anyway. I pretend not to see.\n\n—June",
    },
    {
      title: "Talk of a Convoy",
      text: "There is talk of the River Convoy. Boats and trucks, in a line. A police sergeant, Vega, gets it ready. It leaves north on the river road. Could our van make the trip? Tomas wants to see. Leave the cabin? I am not sure. Pip asks if dogs can come.\n\n—June",
    },
    {
      title: "Half a Month",
      text: "Tomas fixes the squeaky cabin door. He uses a strip of wire. And some cooking oil. He would fix the moon, I say. Just hand him a ladder. Pip asks if the moon is broken. We have lasted half a month here. That is longer than anyone guessed. Even me.\n\n—June",
    },
    {
      title: "The Hardest Night",
      text: "Last night is the hardest night yet. Walkers hit the fence from every side. The boards crack. We all stay in place. Nobody runs. The fence holds until morning. Pip sleeps in the closet. Pip wears a pot on their head. Pip calls it a helmet. It is not a bad idea.\n\n—June",
    },
    {
      title: "A Doctor Out There",
      text: "People talk of a doctor, Doc Lin. Doc Lin carries meds around town. Doc Lin goes to the grocery. Then the pharmacy. Then the hospital. A nurse, Ada, stays at the hospital. It is called St. Anne Annex. She keeps the generator running. People like that keep the town alive.\n\n—June",
    },
    {
      title: "Frost on the Glass",
      text: "Frost on the van this morning. It coats the windshield. Tomas scrapes it off. He uses an old library card. Cold mornings mean one thing. We need blankets. We need them before anything else. Pip finds frost on the window too. Pip draws a dog in it. Of course Pip does.\n\n—June",
    },
    {
      title: "A Teacher Who Counts",
      text: "People tell a story about Ms. Adler. She is a teacher. She led her whole class out. They left Lincoln Middle School. Where to? The Public Library, people say. Two kids got split off. They are twins, Max and Mia. A good teacher counts heads every hour. I hope Ms. Adler is still counting.\n\n—June",
    },
    {
      title: "What We Carry",
      text: "Will the world ever come back? Pip asks me. I say some of it will. The parts people carry with them. Pip asks which parts we carry. I think about it. Then I tell Pip. The rules on the door. The seeds. And each other. Pip nods and goes to bed.\n\n—June",
    },
    {
      title: "The Rules Out Loud",
      text: "After supper, I read the door rules. Out loud. Say where you go. No shouting in the yard. Patch the fence before supper. We all eat the same. Pip wants a new rule. Take what you need, leave the rest. That is the town's rule. A good one. It goes on the door too.\n\n—June",
    },
    {
      title: "Ruby and Dev",
      text: "Pip keeps asking about Ruby. Ruby has a younger brother named Dev. People say Ruby is looking for Dev. Dev leaves messages for her. Pip has it all worked out. They keep leaving messages. So they will find each other. Pip says it like a fact. I do not argue.\n\n—June",
    },
    {
      title: "Tick, Knock, Squeal",
      text: "Tomas teaches Pip to hear the engine. A tick means one thing. A knock means something else. A squeal means stop right now. Pip learns fast. Pip says hello to the van daily. Good morning, van. Tomas says the van likes it. I think he likes it more.\n\n—June",
    },
    {
      title: "Big, Messy, Honest",
      text: "My knees ache on cold mornings. My hands get stiff too. So I teach Pip the ledger. Just in case. Pip writes big and messy. I tell Pip that is fine. A ledger need not be neat. It only has to be honest. Pip writes that down too.\n\n—June",
    },
    {
      title: "A Bark Past the Trees",
      text: "Last night, a dog barks. It is past the trees. Pip stands at the window. A whole hour. Pip just listens. Tomas says this dog must be smart. It can find us if it wants. Pip leaves water by the gate. A full bowl. Just in case.\n\n—June",
    },
    {
      title: "Stories in the Wind",
      text: "The wind comes hard from the north. It shakes the windows all night. Nobody can sleep. So we tell stories by the stove. Tomas tells one about his father's garage. I tell one about my school garden. Pip's is about a dog. The dog drives a van. That one wins.\n\n—June",
    },
    {
      title: "Reading by the Window",
      text: "I think of my old students. I do it when I write. Some of them may have made it. Maybe they are in the library. With the others. I picture them reading by the window. It helps. Then I put the pen down. I get up. I do the next job.\n\n—June",
    },
    {
      title: "What We Want",
      text: "Tomas says the van could do it. Up the river road. That is if the convoy ever leaves. So I ask the crew. What do we want? Pip wants a dog. Tomas wants a garage. I want a garden. Then we agree. The cabin is home for now.\n\n—June",
    },
    {
      title: "A Quiet Day",
      text: "A quiet day. Sun on the yard. Wind in the trees. No walkers at the fence for hours. I sit on the step. I write slow. Tomas whistles under the van. Pip ties knots in the fence rope. Quiet days are not wasted. They get you ready for loud ones.\n\n—June",
    },
    {
      title: "We Are Still Here",
      text: "I read the ledger to the crew. I start at the first page. We found the cabin. We kept it. We kept each other. Tomorrow is the same work. The van. The fence. The food. The rules on the door. At the bottom, I write this. We are still here. That is a lot.\n\n—June",
    },
  ];

  T.radio = [
    {
      title: "Jo on 88.1",
      text: "Hello out there. This is Jo on 88.1. I talk from a rooftop downtown. Each day I read the news. I give warnings. I give tips. It is for anyone still listening. Keep the town's rule. Take what you need, leave the rest.\n\n(Pip puts Jo on the voice list.)",
    },
    {
      title: "Jo Explains the Key Ring",
      text: "Jo here. Here is how the key ring works. Each building has a stash. It holds the best stuff. So smash and grab types get nothing. Its key hides in another building. A note tells where. Ruby and I started it. Mr. Reyes cut the first keys. He runs Reyes Hardware. Only readers find them.",
    },
    {
      title: "A Tip from Jo",
      text: "Jo again, on 88.1. Got a key ring tip for you. Grab a pen. A key is hidden at Gas-N-Go. It opens the staff locker. That locker is at Corner Grocery. Where is the key? Read the notes inside Gas-N-Go. They tell you. Read them all. Read them twice if you have to.",
    },
    {
      title: "Ruby Is Still Looking",
      text: "This is Jo. I have a message from Ruby. You know her. She paints the red R. She looks for her younger brother, Dev. He worked at Gas-N-Go. Do you see Dev? Tell him Ruby is still looking. One more thing. The number by her red R? It counts the walkers she saw inside.",
    },
    {
      title: "Hold On, Ada",
      text: "Jo here. This is from Doc Lin. It goes to Nurse Ada at St. Anne Annex. Ada, hold on. I am coming. Now a warning from me. No place in town is more dangerous. The walkers there follow sound. Not light. Sound. So move quiet in there. Very quiet.",
    },
    {
      title: "Sergeant Vega Speaks",
      text: "Sergeant Vega here, at the 4th Precinct. I am building the River Convoy. It is boats and trucks. We leave north on the river road. We go in about ten days. That is the plan. We need fuel. We need boats. We need drivers who stay calm. Can you help? Come see me.",
    },
    {
      title: "Doc Lin's Tip",
      text: "This is Doc Lin. Jo lends me the mike today. I have a key ring tip. Look at Corner Grocery for a key. It opens the narcotics safe. That safe is at Mile 9 Pharmacy. It holds strong meds. Please take only what you need. Others need them too. Thank you.",
    },
    {
      title: "Max and Mia Ask",
      text: "Jo here. This one is from twins. Max and Mia. They got split from their class. That was at Lincoln Middle School. Now they look for their teacher. Her name is Ms. Adler. Have you seen Ms. Adler's class? Then leave a note at the school.",
    },
    {
      title: "Walk at the Mall",
      text: "Jo with a warning. It is about Northgate Mall. The walkers there move as a group. If you run, they come running. All of them. So walk. Do not run. Then most of them stay put. That tip comes from Luis. He is the mall guard. He never left his post.",
    },
    {
      title: "Seeds from Rosa",
      text: "Jo here, with a key ring tip. Thanks to Mr. Reyes for this one. There is a key at Reyes Hardware. It opens the seed vault. The vault is at Greenhouse Row. Rosa has a word for you. Take seeds. Plant them. Save some for the next person.",
    },
    {
      title: "Nurse Ada Answers",
      text: "This is Nurse Ada at St. Anne Annex. I stay here for two jobs. I keep the generator running. I keep the records safe. Doc Lin, I hear your message. I am still here. I am still waiting. Come to the hospital? Walk soft. Please.",
    },
    {
      title: "The Class Is Safe",
      text: "This is Mrs. Greer, the librarian. I speak from the Public Library. I have good news. Ms. Adler and her class are safe here. The kids read by window light. They do it each afternoon. Max and Mia, come to the library. Your teacher is here. She waits for you.",
    },
    {
      title: "Chief Dunn's List",
      text: "Chief Dunn here, at Station 12. That is the fire station. I work with Sergeant Vega. The job is the River Convoy. I keep the lists. Bad news first. The convoy is late. One truck needs new engine parts. Do you want to leave? Sign the list at Station 12.",
    },
    {
      title: "Parts for a Van",
      text: "Jo on 88.1. I have a key ring tip. Search Greenhouse Row for a key. It opens the parts cage. That cage is at Ortiz Auto. Mr. Ortiz would want those parts used well. Like to keep a van running. Got a van? Go get them.",
    },
    {
      title: "Theo at the Tower",
      text: "This is Theo at the Water Tower. I tend the pumps here. Dev is with me. So is Mr. Ortiz. We have clean water. So they stay. Dev has a message for his sister. Ruby, I am safe with Theo. Come west. That is all. Theo out.",
    },
    {
      title: "Ruby Heads West",
      text: "Jo here, with good news. Ruby hears Dev's message. She heads west to the Water Tower. But first she leaves one more warning. It is on the Ridge Lumber gate. Do not run the saws there. The noise brings the whole crowd. They come from the loading dock.",
    },
    {
      title: "Together Again",
      text: "Theo here. I have good news. This morning, Ruby walks in. She comes through the Water Tower gate. She and Dev are together again. They hug for a long time.\n\n(At the cabin, Pip cheers. So loud! June points at the door rules. No shouting in the yard.)",
    },
    {
      title: "A Locker Jo Knows",
      text: "Jo again. Here is a key ring tip. I know this place well. A key waits at Station 12. It opens the repair locker. The locker is at Signal Electronics. Priya runs that store. She built my first radio transmitter. So be nice to her shop.",
    },
    {
      title: "Getting Closer",
      text: "Doc Lin here. I made it to Mile 9 Pharmacy. I have a bag of meds. The road north has too many walkers. It goes to St. Anne Annex. So I wait for a safe day. Nurse Ada, here is my message. Keep the generator going. I am getting closer.",
    },
    {
      title: "Delayed Again",
      text: "Sergeant Vega here. The River Convoy is late again. Rain made the river too high. It is too fast for the boats. I know. I am tired too. But the plan is still good. We still need fuel. We still need more drivers. Hang in there.",
    },
    {
      title: "Theo's Key Tip",
      text: "Theo at the Water Tower. I have a key ring tip. A key is hidden right here. It opens the principal's closet. That closet is at Lincoln Middle School. One more thing. Ruby and Dev say hello. Hello to all of you out there.",
    },
    {
      title: "Two Extra Cots",
      text: "Mrs. Greer here. The library still stands. Reading saved this building. I believe that. Each night Ms. Adler sets out two extra cots. One is for Max. One is for Mia. Twins, if you hear this, come here. Go to the book drop. Knock.",
    },
    {
      title: "Vega's Key Tip",
      text: "Sergeant Vega here. I have a key ring tip. A key hides at the 4th Precinct. It opens the foreman's lockbox. That lockbox is at Ridge Lumber. Carla says that lumber is for building. Not for burning. She is the yard boss. Do what she says.",
    },
    {
      title: "A Light for Lin",
      text: "Nurse Ada here. The hospital generator runs low. But I hear Doc Lin's voice. It is on the radio. It makes my day. Doc Lin, here is my message. I will keep a light on. It is in the top window. That way, you know I am here.",
    },
    {
      title: "More Names, No Boats",
      text: "This is Chief Dunn. I have the River Convoy list. More names are on it every day. Good. But the convoy is late again. We do not have enough boats yet. Can you fix an engine? Then come to Station 12. We need you.",
    },
    {
      title: "Mrs. Greer's Key Tip",
      text: "Mrs. Greer here, with a key ring tip. Check the Public Library for a key. It opens the jewelry vault. The vault is at Northgate Mall. Be careful at the mall. Walk there. Do not run. I mean it. Walkers there chase runners.",
    },
    {
      title: "Storm Tonight",
      text: "Jo on 88.1. A storm comes from the north tonight. Stay inside. Keep the fire low. Check the fence before dark. Bring in what can blow away. Walkers are slow in the wind. But they still come. So be ready. Stay warm out there. Stay dry.",
    },
    {
      title: "A Light Up the Hill",
      text: "This is Doc Lin. I sit below a hill. St. Anne Annex is up top. Last night I see a light. It shines in the top window. That is the hospital. Nurse Ada is still there. I am still trying to reach her. Soon, Ada.",
    },
    {
      title: "First Light Tomorrow",
      text: "Sergeant Vega here. The River Convoy leaves tomorrow. At first light. That is if the river road holds. Is your name on the list? Pack tonight. Some of you will stay behind. Then keep the town's rule. Take what you need, leave the rest.",
    },
    {
      title: "Same Time Tomorrow",
      text: "Jo here. The River Convoy stays put. It did not leave this morning. Fog sits on the river road. Sergeant Vega says soon. Some good news too. Ruby and Dev are safe. They are at the Water Tower. Nurse Ada's light is still on. Same time tomorrow on 88.1. Jo out.",
    },
  ];

  T.tags = {
    fuel: [
      "Tape on the can says MIXED. Use it in the generator only. Marker below: shake before you pour.",
      "Tomas's rule: fill to the line. Not to the top. Fuel needs room in heat. Store it outside, far from the stove.",
    ],
    food: [
      "Stamped on the lid: beans, peaches, rice. Hana's note: eat the old cans first. Never eat from a can that bulges.",
      "On the side: one crate per trip. Someone drew a smiley face. Under it they wrote one word: share.",
    ],
    lumber: [
      "End stamp: kiln dried, Ridge Lumber. Carla's chalk on the side: for fences. Not for fires. Not ever.",
      "Paper tag on the bundle: measure twice. Cut once. Pencil marks on one board. Someone almost cut it there.",
    ],
    nails: [
      "Box label: nails, three inches long. Mr. Reyes's price sticker is still on it. Wear gloves. Pick up each nail you drop.",
      "Two nails per board beat one. Drive them in at an angle. The box rattles. Wrap it in a shirt.",
    ],
    tools: [
      "Tape on the lid: Reyes Hardware. Bring it back when done. Inside: hammer, saw, pliers, wrench, tape.",
      "Mr. Ortiz's note, inside: wipe the tools clean. Then put them away. On the wrench: righty tighty, lefty loosey.",
    ],
    parts: [
      "Tag wired to the box: Ortiz Auto. Fits most vans. Mr. Ortiz wrote more. Check the belt before a long drive.",
      "Grease pencil list: plugs, belt, oil filter. Turn it hand tight. Then a bit more. Never as hard as you can.",
    ],
    wire: [
      "Copper wire, coated in plastic. Priya's note: strip each end. Twist the ends together. Then wrap them in tape.",
      "Never touch bare wire. Not if it hooks to a generator. Someone drew a tiny antenna. It says: Jo, 88.1.",
    ],
    radioParts: [
      "Box label: tuner, speaker, antenna clamp. Priya wrote on the side. Keep it dry. Keep it in the bag.",
      "Sticky note: put the antenna up high. Higher means farther voices. A list of stations is on it. Just one is circled: Jo.",
    ],
    seeds: [
      "Seed packet: bush beans. Plant them one finger deep. Rosa's note: soak them in water first. Leave them overnight.",
      "Seed packet: lettuce and carrots. Cover them just barely. Keep it damp. Rosa wrote on the back. Save the best seeds for next year.",
    ],
    soil: [
      "On the bag: garden soil, keep dry. Rosa's note: mix in old leaves. Kitchen scraps too. It makes the soil richer.",
      "Stamped on the bag: Greenhouse Row. On the side: it is heavy. Lift with your legs. Not with your back.",
    ],
    meds: [
      "A red cross kit. Inside: bandages, tape, wipes, pain pills. Nurse Ada's steps: wash the cut. Press it. Cover it. Check it every day.",
      "Doc Lin's note: cool a burn. Use clean water. Do not pop the blisters. One kit gets you back up.",
    ],
    waterFilter: [
      "Label: water slow or strange? Change the filter. Theo's tag: let dirty water settle. Then pour from the top.",
      "On the side: not sure? Boil the water too. Rinse the filter in clean water. Never in dirty water.",
    ],
    waterTank: [
      "Painted on the side: drinking water only. Chief Dunn's tag: Station 12. Keep the lid on tight.",
      "Scrub it with a bit of bleach. Rinse it well. Then fill it. Keep the tank in the shade. Then nothing grows inside.",
    ],
    generator: [
      "Warning plate: run it outside only. The fumes poison a closed room. Tape label: check oil before each start.",
      "Taped note: it is loud. Walkers hear it from far away. So run it in the day. Shut it off at night.",
    ],
    gunParts: [
      "A tag from the police armory. Sergeant Vega signed it. Wrapped in oily paper. The note: keep it clean and dry.",
      "Written on the box. Check that it is empty first. Then clean it. Point it at the ground. Never at a person.",
    ],
    armorPlate: [
      "Painted on the plate: steel, heavy. Chalk: bolt it to the van door. Put it at chest height.",
      "Sticky note: a plate stops grabbing hands. It does not stop crashes. Marker lines on the edge count dents.",
    ],
    books: [
      "Stamped inside the cover: Public Library. Please return it. Mrs. Greer wrote on the box. Reading saved this building.",
      "Box label: guides, first aid, engines, poems. A sticky note: want first aid? Look for folded corners.",
    ],
    maps: [
      "Folder label: city maps. Streets and the river road. Red pen traces the road north. It says: CONVOY.",
      "The map has red R marks. Ruby wrote on the back. A red R means I went in. The number means walkers.",
    ],
  };

  T.recap = {
    haul: "Home with {items} items and {scrap} scrap.",
    nothing: "You come home with nothing today.",
    notes: "New notes read: {notes}.",
    keys: "Stash keys found: {keys}.",
    food: "Food left in the cabin: {food}.",
    hungry: "No food, so the van runs weak.",
    next: "Next up: the {room} still needs {needs}.",
    ready: "You can build the {room} now.",
  };
  // The cabin inside: what the Hollis family left on the walls, one note per room (facts: W.HOUSE_NOTES),
  // and the computer's House tab (facts: W.HOUSE_UPGRADE_FACTS).
  T.house = {
    notes: {
      porch: {
        title: "The Dinner Bell",
        text: "A carved sign says THE CABIN. Under it: THE HOLLIS FAMILY. Dan Hollis hung this big iron bell. The kids heard it in the woods. A note says: ring for supper. June adds in chalk: it rings far. Walkers come to it. Ready to fight? Then ring it.",
      },
      foyer: {
        title: "Five Hooks by the Door",
        text: "Five hooks hang by the door. Names are over them. Kate. Dan. Gus. Finn. A low one says Lucy. Lucy's hook has a tag. Tag: last one out locks the door. The hooks are empty now. The Hollis family took their keys. They left.",
      },
      office: {
        title: "Kate's Map Desk",
        text: "Kate Hollis worked at this desk. She drew maps for the county. A sticky note is on the screen. The computer runs on a big battery. The battery is in the closet. June keeps base plans on it now. Rooms, van, guns, and traps.",
      },
      dining: {
        title: "The Chore Chart",
        text: "A chore chart has gold stars. Gus washed the dishes. Finn took out the trash. Lucy fed Biscuit the dog. Lucy has the most stars. One of Gus's stars is crossed out. Pip adds a pencil row. Pip feeds our dog. We do not have one yet.",
      },
      kitchen: {
        title: "Kate's Note on the Fridge",
        text: "A fish magnet holds this note. Kate wrote it the morning they left. We go north with the River Convoy. We ride Sergeant Vega's trucks. We take Biscuit and our go bags. We take the last peaches. Are you kind? Our cabin is yours. Keep the garden going.",
      },
      pantry: {
        title: "Labels on the Shelves",
        text: "Dan Hollis labeled each shelf. Beans. Rice. Peaches. Flour. Most shelves are bare now. The labels are still there. The crew counts the food in here. Everything in storage is counted here too.",
      },
      pingpong: {
        title: "The Ping Pong Score",
        text: "This is the ping pong room. A chalk score board hangs over the table. The last game: Finn 21, Dad 19. Dan wrote under it: rematch on Sunday. Tomas and Pip play here now. Pip says the table leans left.",
      },
      masterBath: {
        title: "A Heart on the Mirror",
        text: "Someone drew a heart on the mirror. Three names are in it. Gus. Finn. Lucy. A list is taped by the sink. It says: Lucy, brush your teeth. Brush for two whole minutes. June leaves the list up.",
      },
      master: {
        title: "The Photo Over the Bed",
        text: "A photo hangs over the big bed. It shows Kate and Dan Hollis. It is their wedding day. The river is behind them. June gives this bed to the most hurt. Sleep here to heal all the way. But it takes time. Walkers keep coming while you sleep.",
      },
      living: {
        title: "Lines on the Door Frame",
        text: "Each year the kids grew. Pencil lines on the frame show it. Gus has the top line. Lucy's low line says age 3. Pip's line falls between Finn and Gus. The radio sits by the couch. So does June's green ledger. Anyone can read old days again.",
      },
      gusRoom: {
        title: "Keep Out",
        text: "The door sign says: Gus's Room. Keep out. This means you, Finn. Gus is sixteen. He left his guitar here. It has two broken strings. Tomas sleeps here now. He says the sign still counts. It counts for Pip.",
      },
      finnRoom: {
        title: "Finn's Treehouse Plan",
        text: "Finn drew a plan for a treehouse. The tree is past the fence. The plan has a rope ladder. It has a lookout. It has a bucket on a pulley. Pip wants to build it someday. First the fence must be strong.",
      },
      lucyRoom: {
        title: "My Dog Biscuit",
        text: "Lucy drew a dog in crayon. It has floppy ears. It says: MY DOG BISCUIT. Lucy wrote more under it. Biscuit can sit. Biscuit can shake. Biscuit can roll over. Pip pins up a second drawing. It is a dog with no name yet.",
      },
      playroom: {
        title: "The Typing Board",
        text: "This play room has a little desk. An old typewriter sits on it. There is a chalkboard too. Kate wrote: practice typing ten minutes a day. Keep your fingers on the home row. Lucy wrote her name ten times below.",
      },
      coatCloset: {
        title: "The Go Bag List",
        text: "A list is taped inside the closet door. It says: the go bag. Water. A flashlight. Batteries. Biscuit's leash. The photo album. At the bottom it says this. Split up? Meet at the river dock. Meet by the convoy trucks.",
      },
    },
    upgrades: {
      doors: {
        desc: "Two doors lead to the yard. The front door is on the porch. The back door is in the play room. A shut door? Walkers pound it till it breaks. An open door? They walk right in. A door starts at 150 strength.",
        next: [
          "Each door gets a thick wood bar. Door strength rises to 260.",
          "Steel sheets get bolted on both doors. Door strength rises to 400.",
          "Steel security doors replace the old ones. Door strength rises to 560.",
        ],
      },
      windows: {
        desc: "The cabin has lots of windows. Walkers smash the glass fast. Then they climb in. You cannot climb out a broken window. Glass starts at 50 strength.",
        next: [
          "Boards go up over the glass. Window strength rises to 140.",
          "Metal shutters go on every window. Window strength rises to 240.",
          "Steel plates cover every window. Each has a thin slot. Window strength rises to 380.",
        ],
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
