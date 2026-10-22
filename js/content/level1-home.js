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
          "June painted this sign. It says GARDEN, someday. Stakes and string mark out beds in the dirt. The dirt is dark, and it sits behind the cabin. Raised beds of seeds and soil could grow food here. We need food, because each van trip eats food.",
        built: [
          "The sign says GARDEN now. One raised bed is planted with seeds. June checks the bed every morning. She looks for green shoots. The bed grows 1 food each day. It is small, but it is a start.",
          "The sign says GARDEN. Now there are more beds. Beans climb up the string. Pip counts the bean pods out loud. The beds grow 2 food each day. So our food lasts longer now.",
          "The sign says GARDEN. A water tank stands by the beds. A hose runs from the tank to each bed. June has her full garden at last, and she grins at it. It grows 3 food each day.",
        ],
      },
      farm: {
        title: "Farm field",
        empty:
          "Tomas painted this sign. It says FARM, after the Garden and the Well. Past the garden is a wide patch of grass. A stake marks each corner. A crop field here would grow food on top of the Garden. Later, it could hold animals too.",
        built: [
          "The sign says FARM. A crop field fills the grass now. Corn and beans grow in long rows. The field grows 2 food each day. That food comes on top of the Garden. Pip walks the rows at dusk.",
          "The sign says FARM. Now there is a chicken coop with wire walls. The hens are very loud at dawn. Pip collects the eggs each day. Pip gives every hen a name. The farm gives 4 food each day.",
          "The sign says FARM. Now a goat pen stands past the coop. Water from the Well fills its trough. The goats chew on everything, even the rope. Pip says goats are almost as good as a dog. The farm gives 6 food each day.",
        ],
      },
      well: {
        title: "Well site",
        empty:
          "June painted this sign: WELL. It says to dig after the Water room is built. Stones ring a spot in the yard. Water from deep down is cold and clean. It would help you heal faster in the yard. The Farm and the Lab need the Well first.",
        built: [
          "The sign says WELL. It is a well dug by hand, and lumber lines it. A bucket hangs on a rope. The water comes up cold and clean. It helps you heal faster in the yard.",
          "The sign says WELL. Now a hand pump brings the water up. Nobody needs the bucket. The water goes through a filter on the way. Pip likes to work the handle. You heal in the yard even faster.",
          "The sign says WELL. Now a pump runs on wire and fills a tank by itself. Nobody has to pump by hand. You heal in the yard faster than ever. You also start each building at full health.",
        ],
      },
      water: {
        title: "Water barrel",
        empty:
          "Tomas painted this sign: WATER, filter goes here. An empty barrel sits on two sawhorses by the back fence. Rain fills it, but the water is gray. A filter and a tank would make the water clear. Then you would heal faster in the yard.",
        built: [
          "The sign says WATER. A filter sits on top of the barrel now. Gray water goes in at the top. Clear water comes out at the tap. Tomas tastes it first and makes a face, but it is fine. You slowly heal in the yard.",
          "The sign says WATER. Now a big tank stands next to the filter. The tank is full of clean water, so nobody waits for rain. Pip checks the tank each night. You heal faster in the yard.",
          "The sign says WATER. Now two filters work, and a tank stands by them. You heal even faster in the yard. You also walk into each building at full health. That means you use fewer medical kits.",
        ],
      },
      power: {
        title: "Power pole",
        empty:
          "Tomas painted this sign: POWER, lights first. A bare pole stands by the back fence. An old coil of rope lies at its foot. Fuel, wire, and lights could go here. Then the map would show how dangerous each place is. Later, a generator could do even more.",
        built: [
          "The sign says POWER. Fuel cans sit by the pole, and wire runs up it. A string of lights works now. The map shows the danger of every place. Now you know what you drive into.",
          "The sign says POWER. Now a generator hums under a tin roof. The map still shows the danger of every place. You also find one supply crate on each drive. Tomas pats the generator and calls it a good beast.",
          "The sign says POWER. More wire runs out to the van. Now the van has headlights. They cut through night and fog. The map shows the danger of every place. You find two supply crates on each drive.",
        ],
      },
      radio: {
        title: "Radio tower",
        empty:
          "Pip painted this sign: RADIO, Pip's job. A ladder leans on a tall post here. A radio tower could go up here. It would pick up voices from town. They would play on the dining room radio. The voices would put new places on your map.",
        built: [
          "The sign says RADIO. A wood tower stands here, tied with rope. A whip antenna sits on top. A wire runs from it to the dining room. Pip sits at the radio there. Pip writes down every voice. The radio finds three new places on the map.",
          "The sign says RADIO. Now a steel tower stands here. Long wires hold it steady. A dish sits halfway up. A red light blinks on top. It reaches all over town. Pip's list gets very long. The radio finds every place on the map.",
          "The sign says RADIO. A tall red and white tower has two dishes. Two lights blink. A small hut has sun panels. In the dining room, Pip's books log the voices. A town map hangs by them. It finds every place. It shows where items are left.",
        ],
      },
      lab: {
        title: "Lab corner",
        empty:
          "June painted this sign: LAB, after the Medbay and the Well. A shady corner has an old bench. Empty jars sit on it. Herb beds and a still could go here. They would make medical kits at home. Then we would make fewer trips to the hospital.",
        built: [
          "The sign says LAB. Herb beds grow by the bench. A copper still sits on top. The still cooks herbs into medicine. It drips slowly. It makes 1 medical kit every 2 days.",
          "The sign says LAB. Now there is a clean bench with a sink. The sink runs filtered water. June keeps her hands and tools spotless. The lab makes 1 medical kit each day.",
          "The sign says LAB. Now it is a powered lab that hums off a generator. Lights glow on the bench at night. It makes 2 medical kits each day. June says Doc Lin would like this place.",
        ],
      },
    },
  };

  T.journal = [
    {
      title: "Day One, by Candle",
      text: "I write by candle in my green ledger. Our van rolls in on its last fuel. Tomas talks to it all the way. The cabin at the south end of town is empty and dry. It has a woodstove and a locking door. Pip sleeps before unpacking. You keep first watch at the window.\n\n—June",
    },
    {
      title: "The Cabin by Day",
      text: "By day, the cabin looks bigger. It is a family house with a porch. The roof is sound. An old fence circles the yard. Some boards are loose. The dirt behind the cabin is dark and good. I see it first. I write our first rule inside the door. Say where you are going before you go.\n\n—June",
    },
    {
      title: "Old but Honest",
      text: "Tomas spends the morning under the van. He comes out smiling. He says the van is old but honest, like a good mule. Then you drive out to look for supplies. I watch the road until the van comes back. Pip counts the minutes you are gone. Then Pip writes the number on the wall.\n\n—June",
    },
    {
      title: "They Come in Waves",
      text: "The biggest group yet comes to the fence at dusk. They push at the boards. Then the yard goes quiet for a while. Now I know they come in waves, with calm in between. A new rule goes on the door. Do not shout in the yard, because walkers follow sound.\n\n—June",
    },
    {
      title: "Pip Asks Questions",
      text: "Pip asks me where everyone in town went. I say some people left, and some people hid. Some are still out there, helping each other. Then Pip asks if we can keep a dog we find. I say a dog would need to eat, too. Pip says a dog would need a name, too.\n\n—June",
    },
    {
      title: "Patch Before Supper",
      text: "Our days have a rhythm now. We drive out, come home, and hold the fence. A hole in the fence does not close by itself. Someone has to patch it with scrap. So I make a rule. We patch the fence before supper. Supper is beans again, but nobody complains out loud.\n\n—June",
    },
    {
      title: "Before the Fall",
      text: "Before the Fall, I was the gardener at a school. Now I want raised beds behind the cabin. I want beans, squash, and tomatoes. My old friend Rosa ran the greenhouses at Greenhouse Row. That is west of the gas station. If anyone still has seeds, it is Rosa.\n\n—June",
    },
    {
      title: "The Red R",
      text: "People talk about a scout named Ruby. She paints a red R on buildings. Next to the R, she writes a number. It tells how many walkers she saw inside. Pip paints an R on a board. Pip puts a number next to it. A stranger who warns other strangers is a good sign.\n\n—June",
    },
    {
      title: "Wire and Stubbornness",
      text: "Tomas's father was a mechanic. He learned from Mr. Ortiz at Ortiz Auto. Tomas learned from his father. He grew up under cars, handing over wrenches. Today he fixes the van's loose mirror with wire and stubbornness. He hopes Mr. Ortiz is still out there. So do I.\n\n—June",
    },
    {
      title: "Rain and Cards",
      text: "It rains all day, and the roof leaks in two spots. We put pots under the drips. Then we play cards by the stove. Pip wins every game and will not tell us how. A rainy day with all of us inside is a good day.\n\n—June",
    },
    {
      title: "Static and Voices",
      text: "Pip finds an old radio dial in a drawer. Pip turns it for an hour. The loose dial gets only static. Pip still thinks voices are out there. Jo talks on the radio from a rooftop. Pip lists every voice we hear. The first name is June, and that is me.\n\n—June",
    },
    {
      title: "The Sunflower Kids",
      text: "Today I think of my old school garden. The kids planted sunflowers by the fence. I taught them to plant a seed one finger deep. I told them to water it every day. Where are those kids now? I do not know. I hope they remember the sunflowers.\n\n—June",
    },
    {
      title: "Counting the Food",
      text: "Every night I count the food. I write the number in this ledger. Each van trip eats food. A hungry crew makes a weak van. Our rule is that we all eat the same. We do it even when there is not much. Tomas gives Pip half his bread anyway. I pretend not to see.\n\n—June",
    },
    {
      title: "Talk of a Convoy",
      text: "People talk about the River Convoy. It is a line of boats and trucks. A police sergeant named Vega is getting it ready. It will leave north on the river road. Tomas wants to see if our van could make the trip. I am not sure I want to leave the cabin.\n\n—June",
    },
    {
      title: "Half a Month",
      text: "Tomas fixes the squeaky cabin door with wire and cooking oil. I tell him he would fix the moon. Someone just has to hand him a ladder. Pip asks if the moon is broken. We have lasted half a month at the cabin. That is longer than anyone guessed.\n\n—June",
    },
    {
      title: "The Hardest Night",
      text: "Last night was the hardest night yet. Walkers came at the fence from every side. The boards cracked, but we all stayed in place. The fence held until morning. Pip slept in the closet with a pot on their head. Pip called it a helmet.\n\n—June",
    },
    {
      title: "A Doctor Out There",
      text: "People talk about a doctor named Doc Lin. Doc Lin carries medicine around town. Doc Lin goes between the grocery, the pharmacy, and the hospital. A nurse named Ada stayed at the hospital, St. Anne Annex. She keeps the generator running there. People like that are why our town is not gone.\n\n—June",
    },
    {
      title: "Frost on the Glass",
      text: "This morning there is frost on the van's windshield. Tomas scrapes it off with an old library card. Cold mornings tell me one thing. We need blankets before we need anything else. Pip draws a dog in the frost on the window.\n\n—June",
    },
    {
      title: "A Teacher Who Counts",
      text: "There is a story about a teacher, Ms. Adler. She led her whole class out of Lincoln Middle School. People say she took them to the Public Library. But two of her students got split off. They are twins named Max and Mia. A good teacher counts heads every hour. I hope Ms. Adler is still counting.\n\n—June",
    },
    {
      title: "What We Carry",
      text: "Pip asks me if the world will ever come back. I say some of it will. The parts that people carry with them will come back. Then Pip asks which parts we carry. I say three things. We carry the rules on the door, the seeds, and each other.\n\n—June",
    },
    {
      title: "The Rules Out Loud",
      text: "After supper, I read the five door rules out loud. Say where you go. Do not shout in the yard. Patch the fence before supper. Everyone eats the same. Take what you need, and leave the rest. Pip always joins in on that last one. It is the town's rule, and a good one.\n\n—June",
    },
    {
      title: "Ruby and Dev",
      text: "Pip keeps asking about Ruby and her younger brother, Dev. People say Ruby went looking for Dev. Dev left messages for her everywhere. Pip has it all worked out. People who keep leaving messages find each other. Pip says it like a fact. I do not argue.\n\n—June",
    },
    {
      title: "Tick, Knock, Squeal",
      text: "Tomas is teaching Pip to listen to the van's engine. A tick means one thing, and a knock means another. A squeal means stop right now. Now Pip says hello to the van every morning. Tomas says the van likes it.\n\n—June",
    },
    {
      title: "Big, Messy, Honest",
      text: "My knees ache on cold mornings. So on cold days, Pip keeps the ledger. It is just in case my hands get stiff. Pip's writing is big and messy. I tell Pip that is fine. A ledger only has to be honest. It does not have to be neat.\n\n—June",
    },
    {
      title: "A Bark Past the Trees",
      text: "Last night, a dog barked somewhere past the trees. Pip stood at the window for an hour and listened. Tomas said a dog that lived this long is smart. It could find us if it wanted to. Pip left a bowl of water by the gate, just in case.\n\n—June",
    },
    {
      title: "Stories in the Wind",
      text: "Last night the wind came hard from the north. It shook the windows all night, so nobody could sleep. We told stories by the stove instead. Tomas told one about his father's garage. I told one about my school garden. Pip told one about a dog that drives a van.\n\n—June",
    },
    {
      title: "Reading by the Window",
      text: "I think about my old students when I write. Maybe some of them made it. Maybe they are in the library with the others. It helps to picture them reading by the window. Then I put the pen down. I get up and do the next job.\n\n—June",
    },
    {
      title: "What We Want",
      text: "Tomas says the van could make it up the river road. That is, if the convoy ever leaves. So I ask the crew what we want. Pip wants a dog. Tomas wants a garage. I want a garden. Then we all agree that the cabin is home for now.\n\n—June",
    },
    {
      title: "A Quiet Day",
      text: "Today is a quiet day. Sun is on the yard, and wind is in the trees. No walkers come to the fence for hours. I sit on the step and write slowly. Tomas whistles under the van. Pip ties knots in the fence rope. Quiet days are not wasted. They get us ready for loud ones.\n\n—June",
    },
    {
      title: "We Are Still Here",
      text: "Tonight I read the ledger to the crew from page one. We found the cabin and kept it. We kept each other, too. Tomorrow is the same work. It is the van, the fence, the food, and the door rules. At the bottom, I write one line. We are still here, and that is a lot.\n\n—June",
    },
  ];

  T.radio = [
    {
      title: "Jo on 88.1",
      text: "Hello out there. This is Jo on 88.1. I am talking from a rooftop downtown. Every day I read the news, warnings, and tips. They are for anyone still listening. Here is the town's rule. Take what you need, and leave the rest.\n\n(Pip writes Jo's name on the list of voices.)",
    },
    {
      title: "Jo Explains the Key Ring",
      text: "Jo here. This is how the key ring works. Each building locks its best things in a stash. So people who smash and grab get nothing. Each stash key hides in a different building. A note there says where. Ruby and I started it. Mr. Reyes of Reyes Hardware cut the first keys. Only readers find them.",
    },
    {
      title: "A Tip from Jo",
      text: "This is Jo on 88.1, with a key ring tip. Get a pen. A key is hidden at Gas-N-Go. It opens the staff locker at Corner Grocery. Where is the key? The notes inside Gas-N-Go tell you. So read them all. Read them twice if you have to.",
    },
    {
      title: "Ruby Is Still Looking",
      text: "This is Jo. I have a message from Ruby. She is the scout who paints the red R. Ruby is looking for her younger brother, Dev. Dev worked at Gas-N-Go. If you see Dev, tell him Ruby is still looking. One more thing. See the number by her red R? It counts the walkers she saw inside.",
    },
    {
      title: "Hold On, Ada",
      text: "Jo here, with a message from Doc Lin. It is for Nurse Ada at St. Anne Annex. Hold on, Ada, because I am coming. Now here is a warning from me. St. Anne Annex is the most dangerous place in town. The walkers there follow sound more than light. So move quietly inside.",
    },
    {
      title: "Sergeant Vega Speaks",
      text: "Sergeant Vega here, at the 4th Precinct. I am putting together the River Convoy. It is a line of boats and trucks. We will leave north on the river road. The plan is to go in about ten days. We need fuel, and we need boats. Most of all, we need drivers who stay calm.",
    },
    {
      title: "Doc Lin's Tip",
      text: "This is Doc Lin. Jo lets me use the microphone today. I have a key ring tip. A key is hidden at Corner Grocery. It opens the narcotics safe at Mile 9 Pharmacy. That safe holds strong medicine. Please take only what you need, because others need it too.",
    },
    {
      title: "Max and Mia Ask",
      text: "Jo here, with a message from twins named Max and Mia. They got split from their class at Lincoln Middle School. Now they are looking for their teacher, Ms. Adler. Have you seen Ms. Adler's class? Then please leave a note at the school.",
    },
    {
      title: "Walk at the Mall",
      text: "Jo here, with a warning about Northgate Mall. The walkers there move in a group. If you run, they all come running at you. So walk, and do not run. Then most of them stay put. That tip comes from Luis. He is the mall guard who never left his post.",
    },
    {
      title: "Seeds from Rosa",
      text: "Jo here, with a key ring tip. Thanks go to Mr. Reyes for this one. A key is hidden at Reyes Hardware. It opens the seed vault at Greenhouse Row. Rosa has a message for you. Take seeds, and plant them. Then save some seeds for the next person.",
    },
    {
      title: "Nurse Ada Answers",
      text: "This is Nurse Ada at St. Anne Annex. I will be calm and clear. I stayed here to keep the generator running. I also keep the records safe. Doc Lin, I heard your message. I am still waiting. If you come to this hospital, please walk softly.",
    },
    {
      title: "The Class Is Safe",
      text: "This is Mrs. Greer, the librarian. I am speaking from the Public Library, and I have good news. Ms. Adler and her class are safe here. The kids read by window light every afternoon. Max and Mia, please come to the library. Your teacher is here, and she is waiting for you.",
    },
    {
      title: "Chief Dunn's List",
      text: "This is Chief Dunn at Station 12, the fire station. I work with Sergeant Vega on the River Convoy. I keep the lists. The convoy is late, because one truck needs new engine parts. Do you want to leave with us? Then sign the list at Station 12.",
    },
    {
      title: "Parts for a Van",
      text: "Jo on 88.1, with a key ring tip. A key is hidden at Greenhouse Row. It opens the parts cage at Ortiz Auto. Mr. Ortiz would want those parts used well. He would want them to keep a van running. So if you have a van, go get them.",
    },
    {
      title: "Theo at the Tower",
      text: "This is Theo at the Water Tower. I take care of the pumps here. Dev and Mr. Ortiz are staying with me. They stay because we have clean water. Dev has a message for his sister. Ruby, I am safe with Theo, so come west. That is all. Theo out.",
    },
    {
      title: "Ruby Heads West",
      text: "Jo here, with good news. Ruby went back east to scout Ridge Lumber. Dev's message reached her there. She left one more warning on the gate. Now she is heading west to the Water Tower. Do not run the saws at Ridge Lumber. The noise brings the whole crowd from the loading dock.",
    },
    {
      title: "Together Again",
      text: "This is Theo, and I have good news. This morning, Ruby walked through the Water Tower gate. She and Dev are together again. They hugged for a long time.\n\n(At the cabin, Pip cheers very loud. June has to remind everyone of the rule. Do not shout in the yard.)",
    },
    {
      title: "A Locker Jo Knows",
      text: "Jo here, with a key ring tip. I know this place well. A key is hidden at Station 12. It opens the repair locker at Signal Electronics. Priya runs that store. She built my first radio transmitter. So be kind to her shop.",
    },
    {
      title: "Getting Closer",
      text: "Doc Lin here. I made it to Mile 9 Pharmacy with a bag of medicine. The road north to St. Anne Annex is still full of walkers. So I am waiting for a safe day. Nurse Ada, here is my message. Keep the generator going, because I am getting closer.",
    },
    {
      title: "Delayed Again",
      text: "Sergeant Vega here. The River Convoy is late again. Rain made the river too high and fast for the boats. I know you are tired, and so am I. But the plan is still good. We still need fuel, and we still need more drivers. Hang in there.",
    },
    {
      title: "Theo's Key Tip",
      text: "This is Theo at the Water Tower, with a key ring tip. A key is hidden right here at the Water Tower. It opens the principal's closet at Lincoln Middle School. One more thing. Ruby and Dev say hello to everyone who is listening.",
    },
    {
      title: "Two Extra Cots",
      text: "Mrs. Greer here. The library still stands, because reading saved this building. Every night, Ms. Adler sets out two extra cots. One cot is for Max, and one is for Mia. Twins, if you hear this, come to us. Come to the book drop, and knock.",
    },
    {
      title: "Vega's Key Tip",
      text: "Sergeant Vega here, with a key ring tip. A key is hidden at the 4th Precinct. It opens the foreman's lockbox at Ridge Lumber. Carla is the yard boss there. She says that lumber is for building, not for burning. So do what she says.",
    },
    {
      title: "A Light for Lin",
      text: "This is Nurse Ada. The hospital generator is running low. But I heard Doc Lin on the radio. It made my day. Doc Lin, here is my message. I will keep a light in the top window. Then you will know I am here.",
    },
    {
      title: "More Names, No Boats",
      text: "This is Chief Dunn with the River Convoy list. More names go on it every day, and that is good. But the convoy is late again. We do not have enough boats yet. Can you fix an engine? Then come to Station 12, because we need you.",
    },
    {
      title: "Mrs. Greer's Key Tip",
      text: "Mrs. Greer here, with a key ring tip. A key is hidden at the Public Library. It opens the jewelry vault at Northgate Mall. Please be careful at the mall. Walk there, and do not run. The walkers there chase anyone who runs.",
    },
    {
      title: "Storm Tonight",
      text: "Jo on 88.1. A storm is coming from the north tonight. Stay inside, and keep the fire low. Check the fence before dark. Walkers are slow in the wind, but they still come. So be ready, and stay warm out there.",
    },
    {
      title: "A Light Up the Hill",
      text: "This is Doc Lin. I am at the bottom of the hill below St. Anne Annex. Last night I saw a light up there. It was in the top window of the hospital. That means Nurse Ada is still there. I am still trying to reach her. Soon, Ada.",
    },
    {
      title: "First Light Tomorrow",
      text: "Sergeant Vega here. The River Convoy leaves at first light tomorrow. That is, if the river road holds. Is your name on the list? Then pack tonight. Some of you will stay behind. If you stay, keep the town's rule. Take what you need, and leave the rest.",
    },
    {
      title: "Same Time Tomorrow",
      text: "Jo here. The River Convoy did not leave this morning. Fog sat on the river road. Sergeant Vega says it will be soon. There is good news, too. Ruby and Dev are safe at the Water Tower. Nurse Ada's light is still on. Same time tomorrow on 88.1. Jo out.",
    },
  ];

  T.tags = {
    fuel: [
      "Tape on the can says MIXED. Use it in the generator only. Marker under it says to shake it before you pour.",
      "Tomas wrote a rule: fill it to the line, not the top. Fuel needs room in heat. Keep it outside, away from the stove.",
    ],
    food: [
      "The lid says beans, peaches, and rice. Hana wrote a note: eat the oldest cans first. Never eat from a can that bulges.",
      "The side says one crate for every trip. Someone drew a smiley face. Under it, they wrote one word: share.",
    ],
    lumber: [
      "A stamp on the board says it is kiln dried. It is from Ridge Lumber. Carla wrote in chalk: for fences, not for fires.",
      "A paper tag says to measure twice and cut once. Pencil marks on one board show where someone almost cut it.",
    ],
    nails: [
      "The box says the nails are three inches long. Mr. Reyes's price sticker is on it. Wear gloves. Pick up each nail you drop.",
      "Two nails in a board, at an angle, hold better than one. The box rattles, so wrap it in a shirt.",
    ],
    tools: [
      "Tape on the lid says Reyes Hardware. Bring it back when you are done. Inside are a hammer, saw, pliers, wrench, and tape.",
      "Mr. Ortiz left a note inside. Wipe the tools clean before you put them away. The wrench says righty tighty, lefty loosey.",
    ],
    parts: [
      "A tag on the box says Ortiz Auto. The parts fit most vans. Mr. Ortiz wrote: check the belt before a long drive.",
      "It lists spark plugs, a belt, and an oil filter. Turn it hand tight, then a bit more. Never use all your strength.",
    ],
    wire: [
      "The spool holds copper wire coated in plastic. Priya says to strip each end and twist the ends together. Then wrap them in tape.",
      "Never touch bare wire that is hooked to a generator. Someone drew a tiny antenna by it. It says Jo, 88.1.",
    ],
    radioParts: [
      "The box holds a tuner, a speaker, and an antenna clamp. Priya wrote on the side: keep it dry and in the bag.",
      "A note says the higher the antenna, the farther the voices. It lists radio stations. Only one is circled, and it is Jo.",
    ],
    seeds: [
      "This packet holds bush beans. Plant them one finger deep. Rosa wrote on it: soak them in water overnight first.",
      "This packet holds lettuce and carrots. Barely cover them with soil, and keep it damp. Rosa wrote: save seeds from your best plants.",
    ],
    soil: [
      "The bag says garden soil, keep dry. Rosa says to mix in old leaves and kitchen scraps. That makes the soil richer.",
      "The bag is stamped Greenhouse Row. The side says it is heavy. Lift it with your legs, not your back.",
    ],
    meds: [
      "It has a red cross. Inside are bandages, tape, wipes, and pills. Nurse Ada says: wash, press, and cover a cut. Check it daily.",
      "Doc Lin wrote: cool a burn under clean water. Do not pop the blisters. One kit gets you back on your feet.",
    ],
    waterFilter: [
      "Change the filter when the water runs slow or tastes strange. Theo wrote: let dirty water settle, then pour from the top.",
      "If you are not sure, boil the water too. Rinse the filter in clean water, never in dirty water.",
    ],
    waterTank: [
      "The side says drinking water only. Chief Dunn's tag says it is from Station 12. Keep the lid on.",
      "Scrub it with a little bleach, and rinse it well. Then fill it. Keep the tank in the shade so nothing grows inside.",
    ],
    generator: [
      "The plate says to run it outside only. Its fumes are poison in a closed room. Check the oil before every start.",
      "It is loud, and walkers hear it from far away. So run it in the day, and shut it off at night.",
    ],
    gunParts: [
      "The tag is from the police armory. Sergeant Vega signed it. The parts sit in oily paper. Keep them clean and dry.",
      "Always check that it is empty before you clean it. Point it at the ground, never at a person.",
    ],
    armorPlate: [
      "The plate is steel, and it is heavy. Chalk says to bolt it on the van door. Put it at chest height.",
      "A plate stops grabbing hands, but it does not stop crashes. Marker lines on one edge count every dent.",
    ],
    books: [
      "Inside the cover, a stamp says Public Library, please return. Mrs. Greer wrote on the box: reading saved this building.",
      "The box holds field guides, first aid, small engines, and poems. The first aid book is the one with folded corners.",
    ],
    maps: [
      "The folder holds city maps of the streets and the river road. Someone traced the road north in red pen. It says CONVOY.",
      "Some buildings have a red R in pencil. Ruby wrote on the back: R means I went in. The number means walkers.",
    ],
  };

  T.recap = {
    haul: "You came home with {items} items and {scrap} scrap.",
    nothing: "You came home with nothing this time.",
    notes: "You read {notes} new notes on this trip.",
    keys: "You found {keys} stash keys.",
    food: "The crew ate, and {food} food is left.",
    hungry: "There is no food, so the van will be weak.",
    next: "The next build is the {room}. It still needs {needs}.",
    ready: "You have everything to build the {room} now.",
  };
  // The cabin inside: what the Hollis family left on the walls, one note per room (facts: W.HOUSE_NOTES),
  // and the computer's House tab (facts: W.HOUSE_UPGRADE_FACTS).
  T.house = {
    notes: {
      porch: {
        title: "The Dinner Bell",
        text: "A carved sign says THE CABIN, THE HOLLIS FAMILY. Dan Hollis hung this iron bell. The kids heard it from the woods. A note says: ring for supper. June's chalk line: the bell carries far. Walkers come to it. Ring it only when you are ready to fight.",
      },
      foyer: {
        title: "Five Hooks by the Door",
        text: "Five hooks hang by the door. Names are over them: Kate, Dan, Gus, and Finn. A low hook says Lucy. Its tag says: last one out locks the door. The hooks are empty now. The Hollis family took their keys when they left.",
      },
      office: {
        title: "Kate's Map Desk",
        text: "Kate Hollis worked at this desk. She drew maps for the county. A sticky note is on the screen. It says the computer runs on the big battery in the closet. June keeps the base plans on it now. They cover rooms, the van, guns, and traps.",
      },
      dining: {
        title: "The Chore Chart",
        text: "A chore chart has gold stars. Gus washed the dishes. Finn took out the trash. Lucy fed Biscuit, the dog. Lucy has the most stars. One of Gus's stars is crossed out. Pip added a pencil row. It says Pip feeds the dog we do not have yet.",
      },
      kitchen: {
        title: "Kate's Note on the Fridge",
        text: "A fish magnet holds this note. Kate wrote it the morning they left. We go north with Sergeant Vega and the River Convoy. We took Biscuit, our go bags, and the last peaches. Are you kind? Then our cabin is yours now. Please keep the garden going.",
      },
      pantry: {
        title: "Labels on the Shelves",
        text: "Dan Hollis put a label on every shelf. They say beans, rice, peaches, and flour. Most shelves are bare now, but the labels are still there. The crew counts the food in here. Everything else in storage gets counted here too.",
      },
      pingpong: {
        title: "The Ping Pong Score",
        text: "A chalk scoreboard hangs over the ping pong table. The last game says Finn 21, Dad 19. Under it, Dan wrote: rematch on Sunday. Tomas and Pip play here now. Pip says the table leans to the left.",
      },
      masterBath: {
        title: "A Heart on the Mirror",
        text: "Someone drew a heart on the mirror. Three names are in it: Gus, Finn, and Lucy. A list is taped by the sink. It says Lucy must brush her teeth for two whole minutes. June left the list up.",
      },
      master: {
        title: "The Photo Over the Bed",
        text: "A photo hangs over the big bed. It shows Kate and Dan Hollis by the river. It was their wedding day. June says whoever is hurt most gets this bed. A nap here heals you to full. It takes time, and walkers keep coming while you sleep.",
      },
      living: {
        title: "Lines on the Door Frame",
        text: "Pencil lines show how tall the kids grew. Gus has the top line. Lucy's lowest line says age 3. Pip comes up between Finn and Gus. The radio shelf stood by the couch once. Pip carried it to the dining room. The crew eats there.",
      },
      gusRoom: {
        title: "Keep Out",
        text: "The sign by this door says GUS'S ROOM. KEEP OUT. THIS MEANS YOU, FINN. Gus is sixteen. He left his guitar here, and it has two broken strings. Tomas sleeps here now. He says the sign still counts, and now it means Pip.",
      },
      finnRoom: {
        title: "Finn's Treehouse Plan",
        text: "Finn drew a plan for a treehouse. It goes in the woods past the fence. The plan has a rope ladder and a lookout. It has a bucket on a pulley, too. Pip wants to build it someday. But first the fence must be strong.",
      },
      lucyRoom: {
        title: "My Dog Biscuit",
        text: "Lucy drew a dog in crayon. The dog has floppy ears. The drawing says MY DOG BISCUIT. Under it, Lucy wrote that Biscuit can sit, shake, and roll over. Pip pinned up a second drawing next to it. It shows a dog with no name yet.",
      },
      playroom: {
        title: "The Typing Board",
        text: "The play room has a little desk. An old typewriter sits on it. There is a chalkboard too. Kate wrote on it: practice typing ten minutes a day. Keep your fingers on the home row. Lucy wrote her name ten times under it.",
      },
      coatCloset: {
        title: "The Go Bag List",
        text: "A list is taped inside the closet door. It is called the go bag. It lists water, a flashlight, batteries, Biscuit's leash, and the photo album. The last line says this. If we get split up, meet at the river dock. Meet by the convoy trucks.",
      },
    },
    upgrades: {
      doors: {
        desc: "The cabin has two doors to the yard. The front door is on the porch. The back door is in the play room. Walkers pound on a shut door until it breaks. They walk right in through an open door. Each door starts at 150 strength.",
        next: [
          "A thick wooden bar goes across each door. Door strength rises to 260.",
          "Steel sheets are bolted onto both doors. Door strength rises to 400.",
          "Steel security doors take the place of the old ones. Door strength rises to 560.",
        ],
      },
      windows: {
        desc: "The cabin has many windows. Walkers smash the glass fast, and then they climb in. You cannot climb out through a broken window. The glass starts at 50 strength.",
        next: [
          "Boards go up over the glass. Window strength rises to 140.",
          "Metal shutters go up over every window. Window strength rises to 240.",
          "Steel plates cover every window, and each has a thin slot. Window strength rises to 380.",
        ],
      },
    },
  };

  /* River Landing (js/river.js): the fishing pole's tag, the sign by the parking, the chief's note on the
     dock post, and the city map's line. Facts: WORLD.RIVER_FACTS in js/story-home.js. */
  T.river = {
    blurb: "A dock on the river. Bring a pole. Fish are food.",
    rod: { name: "Chief Dunn's fishing pole", tag: "Chief Dunn's pole. His name is on the tag. His crew fished at River Landing. Take River Road. Turn onto Frog Lane. Frog Lane is past Greenhouse Row. It comes before the Water Tower. Then the road turns to dirt. Park there. Walk to the dock." },
    sign: { title: "RIVER LANDING", text: "River Landing. Dock and parking. Fish from the dock. Keep 4 fish at most. Do not drink the water." },
    note: {
      title: "Fishing tips",
      text: "Crew, read this.\n\nCast from the end of the dock. Watch the float. It dips? Pull fast! Prop the pole on the bank to rest. Its bell rings for a bite. Look back at the trees. Walkers come out.\n\nTake 4 fish at most. Then the river rests 3 days.\n\n—Chief Dunn",
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
