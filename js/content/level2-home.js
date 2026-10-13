/* Reading level 2: home. Yard lot signs, June's journal, the radio, item tags, and the day recap.
   Facts: js/story-home.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[2] = root.ZSR.TEXT[2] || { level: 2 });

  T.yard = {
    lots: {
      garden: {
        title: "Garden, someday",
        empty: "Stakes and string mark out beds in the dirt. The dirt is dark and good. It sits behind the cabin. June painted the sign herself. It says GARDEN, someday. Raised beds could go here. They need seeds and soil. Then they would grow food. That matters a lot. Every trip in the van eats food.",
        built: [
          "The sign says GARDEN now. Someone crossed out the word someday. One raised bed is planted with seeds. Small green shoots poke up in rows. June checks the bed every morning. She pulls weeds before anyone else is up. It grows 1 food each day. It is not much yet. But it is a start.",
          "The sign still says GARDEN. Now there are more beds. Beans climb the string toward the sun. The leaves are big and green. Pip counts the bean pods out loud. Tomas built a gate to keep rabbits out. The garden grows 2 food each day now. Tonight the beans are not from a can.",
          "The sign says GARDEN in fresh paint. A water tank stands at the end of the beds. A hose runs from the tank to every bed. Nobody has to haul buckets now. June finally has her full garden. She walked the rows and did not say a word. It grows 3 food each day.",
        ],
      },
      farm: {
        title: "Farm field",
        empty: "A wide patch of grass lies past the garden. There is a stake at each corner. Tomas painted the sign. It says FARM, after the Garden and the Well. So build those two first. A crop field here would grow food. That food comes on top of the Garden. Later the field could hold animals, too.",
        built: [
          "The sign says FARM. Behind it is a crop field. Corn and beans grow in long rows. The corn is taller than Pip now. Tomas walks the rows at dusk with a stick. He says he is guarding the corn. The field grows 2 food each day. That is on top of the Garden.",
          "The sign says FARM, and now it clucks. A chicken coop stands there with wire walls. The hens are loud at dawn. Nobody needs an alarm anymore. Pip collects the eggs every morning. Pip names each hen, too. June says the names are getting strange. The farm gives 4 food each day now.",
          "The sign says FARM, with a goat drawn under it. Now there is a goat pen. A trough sits by the fence. Water from the Well fills it. The goats eat almost anything, even rope. Pip says goats are almost as good as a dog. The farm gives 6 food each day.",
        ],
      },
      well: {
        title: "Well, dig later",
        empty: "A ring of stones sits beside the cabin. June painted the sign: WELL. Under that: dig after the Water room is built. Deep under the ground, the water is cold and clean. With it, you would heal faster on foot. The Farm and the Lab both need the Well first.",
        built: [
          "The sign says WELL. It is a hand-dug well. Its walls are lined with lumber. A bucket hangs on a rope. The water comes up cold. It tastes like stone and rain. Its clean water helps you heal faster on foot. Tomas says he dug enough for a lifetime.",
          "The sign says WELL. No more bucket. A hand pump stands over the hole now. Pump the handle, and water comes up. It goes through a filter on the way. Pip likes to work the pump. Tomas oiled it, so it does not squeak. You heal on foot even faster than before.",
          "The sign says WELL. A wired pump hums by the stones. It fills a tank all on its own. Nobody pumps by hand now. You heal on foot faster than ever. You start every building at full health, too. June says the well is the heart of the yard.",
        ],
      },
      water: {
        title: "Water, filter here",
        empty: "An empty barrel sits on two sawhorses. It is by the cabin wall. Tomas painted the sign: WATER, filter goes here. Rainwater fills the barrel, but it is gray. Nobody wants to drink it like that. A filter and a tank would turn it clear. Clean water means you heal while on foot.",
        built: [
          "The sign says WATER. A filter sits on top of the barrel now. Gray water goes in at the top. Clear water drips out at the bottom. It is slow, but it works. You slowly heal while you are on foot. Pip watches the drips like a TV show.",
          "The sign says WATER. Next to the barrel stands a big tank. The filter feeds it all day. The tank is full of clean water. Nobody drinks gray water anymore. You heal faster while on foot. Tomas tapped the tank and smiled at the sound. Full tanks ring low.",
          "The sign says WATER. Now there are two filters on the barrel. A big tank stands next to them. The water is as clear as glass. You heal even faster on foot. You also walk into every building at full health. That is a big deal out there.",
        ],
      },
      power: {
        title: "Power, lights first",
        empty: "A bare pole stands by the shed. An old coil of rope sits at its foot. Tomas painted the sign: POWER, lights first. He talks about it a lot. Fuel, wire, and lights could go here. Then the map would show how dangerous each place is. Later, a generator could do even more.",
        built: [
          "The sign says POWER. Fuel cans sit under the pole. Wire runs up to a string of lights. The lights work. They are warm and yellow. Pip stared at them for a long time. Now the map shows the danger of every place. You can see which ones to fear.",
          "The sign says POWER. Now a generator hums under a tin roof. It is loud, so Tomas runs it by day. The map still shows the danger of every place. Now you find one supply crate on every drive, too. Tomas named the generator Big Lou. Pip says that is a terrible name.",
          "The sign says POWER. More wire runs out to the van. The van has headlights now. They cut through night and fog. Tomas polished them twice. The map shows the danger of every place. You find two supply crates on every drive. Night drives feel a little less scary now.",
        ],
      },
      radio: {
        title: "Radio, Pip's job",
        empty: "A tall post stands in the yard. A ladder leans on it. Pip painted the sign: RADIO, Pip's job. A radio mast could go up here. It would pick up voices from town. The voices would say where places are. Then those places would show up on the map. Pip checks the post every day, just in case.",
        built: [
          "The sign says RADIO. A short mast stands on the post. It has an antenna and a receiver. Voices crackle out of it at night. Pip writes down every voice in a notebook. The radio finds three new places on the map. Pip wants a taller mast already.",
          "The sign says RADIO. The mast is taller now. Tomas helped Pip climb up and bolt it. Now it reaches all over town. Voices come in from every side. The radio finds every place on the map. Pip's notebook is almost full. June gave Pip a new one from her pile.",
          "The sign says RADIO. The tall mast still stands. Now a shelf of books sits under it. Pip uses them to keep the logbook of voices. It is neat now, sort of. The radio finds every place. It shows which places still have items, too. So you never drive out for nothing.",
        ],
      },
      lab: {
        title: "Lab, after Medbay",
        empty: "A shady corner holds an old bench. A row of empty jars sits on it. June painted the sign. It says LAB, after the Medbay and the Well. Herb beds and a still could go here. They would make medical kits at home. That means fewer trips to the hospital. Nobody likes those trips.",
        built: [
          "The sign says LAB. Herb beds grow by the bench now. A copper still sits on top. The still boils herbs down into medicine. The whole corner smells like mint. It makes 1 medical kit every 2 days. June keeps the jars in a neat row. Each one has a label.",
          "The sign says LAB. Now there is a clean bench. It has a sink, and the sink runs filtered water. Nothing gets dirty here. Tomas has to wash his hands twice to come in. June made that rule, and she means it. It makes 1 medical kit each day.",
          "The sign says LAB. Now it is a powered lab. It hums off a generator. Lights glow over the bench all night. Machines mix the medicine faster than hands can. It makes 2 medical kits each day. Pip calls it the robot kitchen. Fewer trips to the hospital means fewer close calls.",
        ],
      },
    },
  };

  T.journal = [
    { title: "The First Night", text: "June here, writing by candlelight in my green ledger. The van rolled in on its last drops of fuel. Tomas talked to it the whole way. We found a cabin at the south end of town. It is empty and dry, with a woodstove. The door still locks. Pip fell asleep on the bench. The bags were not even inside. You took the first watch at the window. Nothing came." },
    { title: "The Cabin in Daylight", text: "In daylight, the cabin is small. But the roof is sound. Tomas climbed up and stomped on it to be sure. An old fence circles the yard. Some of its boards are loose. Behind the cabin, the dirt is dark and good. I noticed it first. Tomas says June always looks down. I wrote our first rule inside the door today. Say where you are going before you go." },
    { title: "The Van Goes Out", text: "Tomas spent the morning under the van. He came out smiling, with grease on his nose. He says the van is old but honest. Like a good mule, he says. Then you drove out to look for supplies. I watched the road until the van came back. Pip counted every minute you were gone. Then Pip wrote the number on the wall. I did not make Pip wash it off.\n\n- June" },
    { title: "Walkers at Dusk", text: "The first walkers came to the fence at dusk. They came in a group. They pushed at the boards and moaned. Then they drifted off. After that, the yard went quiet for a while. So now I know. They come in waves, with calm in between. We added a new rule to the door. No shouting in the yard. Walkers follow sound.\n\n- June" },
    { title: "Pip's Big Questions", text: "Pip asked me where everyone in town went. I said some people left. Some people hid. And some are still out there, helping each other. Then Pip asked about a dog. Could we keep one if we found one? I said a dog would need to eat, too. Pip said a dog would also need a name. June, you worry about the wrong things, Pip said." },
    { title: "Fence Before Supper", text: "The days have a rhythm now. Drive out. Come home. Hold the fence. A hole in the fence does not close by itself. Someone has to patch it with scrap. So I made it a rule. Patch the fence before supper. Supper was beans again tonight. Nobody complained out loud. Tomas made a face, though. I wrote that down too.\n\n- June" },
    { title: "Before the Fall", text: "Before the Fall, I was the gardener at a school. I still dream in rows of green. I want raised beds behind the cabin. Beans, squash and tomatoes, to start. My old friend Rosa ran the greenhouses at Greenhouse Row. That is west of the gas station. If anyone still has seeds, it is Rosa. She never threw a seed away in her life.\n\n- June" },
    { title: "The Red R", text: "People talk about a scout named Ruby. She paints a red R on buildings. Next to the R, she writes a number. It is how many walkers she saw inside. Pip practiced on a board all afternoon. A big red R, with a 3 next to it. The paint dripped a little. Here is what I think. A stranger who warns strangers is a good sign.\n\n- June" },
    { title: "Wire and Stubbornness", text: "Tomas told me about his father tonight. His father was a mechanic. He learned the trade from Mr. Ortiz at Ortiz Auto. Tomas learned it from his father. He spent years under cars, handing over wrenches. Today he fixed the van's loose mirror. He used wire and stubbornness. Mostly stubbornness. He hopes Mr. Ortiz is still out there somewhere. So do I." },
    { title: "Cards by the Stove", text: "It rained all day. The roof leaked in two spots. We put pots under the drips. Plink, plunk, plink. Then we played cards by the stove. Pip won every game. Pip would not explain how. Tomas checked the deck for extra aces. He found none. A rainy day with everyone inside is a good day.\n\n- June" },
    { title: "Static and Voices", text: "Pip found an old radio dial in a drawer. Pip turned it for an hour. There was only static. Pip is sure there are voices out there anyway. People say someone named Jo talks on the radio. Jo talks from a rooftop, they say. Now Pip has started a list. It will hold every voice we hear. The first name on it is June. I felt oddly proud." },
    { title: "Sunflowers by the Fence", text: "Today I remembered my school garden. The kids planted sunflowers by the fence. Some grew taller than the teachers. I taught them the rule. Plant a seed one finger deep. Water it every day. I wonder where those kids are now. I hope they remember the sunflowers. I hope they plant some somewhere.\n\n- June" },
    { title: "Counting the Food", text: "Every night I count the food. Then I write the number in this ledger. Every trip in the van eats food. A hungry crew makes a weak van. So here is the rule. Everyone eats the same, even when there is not much. Tonight there was not much. Tomas gave Pip half his bread anyway. I pretended not to see.\n\n- June" },
    { title: "Talk of a Convoy", text: "There is talk of the River Convoy. It is a long line of boats and trucks. A police sergeant named Vega is getting it ready. The plan is to leave north along the river road. Tomas wonders if the van could make the trip. He already has a list of parts. I am not sure I want to leave the cabin.\n\n- June" },
    { title: "Half a Month", text: "Tomas fixed the squeaky cabin door today. He used a strip of wire and some cooking oil. I told him he would fix the moon. Somebody just has to hand him a ladder. Pip asked if the moon was broken. Nobody had a good answer. We have lasted half a month at the cabin now. That is longer than anyone guessed.\n\n- June" },
    { title: "The Hardest Night", text: "Last night was the hardest night yet. Walkers came at the fence from every side. We heard the boards crack. Nobody ran. Everyone stayed in place. The fence held until morning. Pip slept in the closet, a pot on their head. Pip called it a helmet. I did not argue. It looked like a good helmet.\n\n- June" },
    { title: "The Doctor and the Nurse", text: "There is talk of a doctor called Doc Lin. Doc Lin carries medicine all around town. The route goes from the grocery to the pharmacy. Then on to the hospital. A nurse named Ada stayed at the hospital. It is called St. Anne Annex. She keeps the generator running there. People like that are why this town is not gone.\n\n- June" },
    { title: "Frost on the Glass", text: "This morning there was frost on the van's windshield. Tomas scraped it off with an old library card. He says it is the first time he used one. Cold mornings mean one thing to me. We need blankets before we need anything else. Pip drew a dog in the frost on the window. It had very long ears.\n\n- June" },
    { title: "The Teacher Who Counted", text: "I heard a story about a teacher, Ms. Adler. She led her whole class out of Lincoln Middle School. People say she took them to the Public Library. But two of her students got separated from the class. They are twins, named Max and Mia. A good teacher counts heads every hour. I hope Ms. Adler is still counting.\n\n- June" },
    { title: "What We Carry", text: "Pip asked me a hard one tonight. Is the world ever going to come back? I said some of it will. The parts people carry with them will come back. Then Pip asked which parts we are carrying. I had to think. Then I said three things. The rules on the door. The seeds. And each other.\n\n- June" },
    { title: "The Rules on the Door", text: "After supper, I read the door rules out loud. Say where you go. No shouting in the yard. Patch the fence before supper. Everyone eats the same. Then Pip wanted to add a rule. Take what you need, leave the rest. I said that one is the town's rule. It is a good one. So it goes on our door too.\n\n- June" },
    { title: "Messages for Each Other", text: "Pip keeps asking about Ruby and her younger brother, Dev. People say Ruby is out looking for Dev. And Dev leaves messages for her wherever he goes. Pip has a theory about it. If they keep leaving messages, they will find each other. Pip said it like a fact. I did not argue. Nobody should argue with hope.\n\n- June" },
    { title: "Engine Lessons", text: "Tomas is teaching Pip to listen to the van's engine. A tick means one thing. A knock means another. A squeal means stop, right now. Pip took notes on the back of a seed packet. Now Pip says hello to the van every morning. Tomas says the van likes it. I say the van is a van. Then I say good morning to it too." },
    { title: "Big, Messy Writing", text: "My knees ache on cold mornings now. So today I showed Pip how to keep the ledger. It is just in case my hands get stiff. Pip's writing is big and messy. The letters lean like a bad fence. I told Pip that is fine. A ledger only has to be honest. It does not have to be neat.\n\n- June" },
    { title: "A Dog Past the Trees", text: "Last night a dog barked somewhere past the trees. Pip stood at the window for an hour, listening. Tomas said something wise for once. A dog that survived this long is smart. It could find us if it wants to. This morning I found a bowl by the gate. Pip had filled it with water. Just in case, Pip said." },
    { title: "Stories in the Wind", text: "The wind came hard from the north. It rattled the windows all night. Nobody could sleep, so we told stories by the stove. Tomas told one about his father's garage. I told one about my school garden. June always tells that one, Tomas said. Pip told one about a dog that drives a van. It was the best story by far." },
    { title: "Picturing Them Reading", text: "I think about my old students when I write. Some of them must have made it. Maybe they are in the library now, with the others. It helps to picture them there. They are reading by the window, in the good light. Then I put the pen down. I get up and do the next job. Today that was the fence.\n\n- June" },
    { title: "What We Want", text: "Tomas has a thought. The van could make it up the river road. That is, if the convoy ever leaves. So I asked the crew what they want. Pip said a dog. Of course. Tomas said a garage of his own. I said a garden, the big kind. Then we looked around the room. We agreed the cabin is home for now.\n\n- June" },
    { title: "A Quiet Day", text: "Today was a quiet day. Sun on the yard. Wind in the trees. No walkers at the fence for hours. I sat on the step and wrote slowly. The good kind of slow. Tomas whistled under the van. Pip practiced knots on the fence rope. Quiet days are not wasted. They are how you get ready for loud ones.\n\n- June" },
    { title: "Still Here", text: "Tonight I read the ledger back to the crew. I started from the very first page. We found this cabin. We kept it. We kept each other, too. Tomorrow is the same work. The van and the fence. The food and the rules on the door. At the bottom of the page, I wrote one line. We are still here, and that is a lot.\n\n- June" },
  ];

  T.radio = [
    { title: "Jo on 88.1", text: "This is Jo on 88.1. I am talking from a rooftop downtown. Every day, I read out the news. I read warnings and tips, too. It is for anyone still listening. So listen up. Here is the town's rule. Take what you need, leave the rest. Same time tomorrow.\n\nPip wrote Jo's name on the list of voices." },
    { title: "How the Key Ring Works", text: "Jo here. Let me explain the key ring. Each building keeps its best supplies in a locked stash. That way, people who smash and grab cannot take them. Each stash key is hidden in a different building. A note there says where. Ruby and I started the key ring. Mr. Reyes from Reyes Hardware cut the first keys. Only people who read the notes find the keys." },
    { title: "Tip: The Gas-N-Go Key", text: "This is Jo, with a key ring tip. Write this one down. There is a key hidden at Gas-N-Go. It opens the staff locker at Corner Grocery. Where is the key? I will not just tell you. The notes inside Gas-N-Go tell you where it is. Read them all. That is how the ring works. Good luck out there." },
    { title: "A Message from Ruby", text: "Jo here. I have a message from Ruby. She is the scout who paints the red R. Ruby is looking for her younger brother, Dev. Dev used to work at Gas-N-Go. If you see Dev, tell him one thing. Ruby is still looking. One more thing about that red R. See the number next to it? That is how many walkers she saw inside." },
    { title: "Hold On, Ada", text: "Jo on the air. This message is from Doc Lin. It goes to Nurse Ada at St. Anne Annex. Here it is. Hold on, Ada. I am coming. Now a warning from me. St. Anne Annex is the most dangerous place in town. The walkers there follow sound more than light. So move quietly inside. No running. No talking." },
    { title: "Sergeant Vega's Plan", text: "This is Sergeant Vega. I am speaking from the 4th Precinct. I am putting together the River Convoy. It is a line of boats and trucks. We will leave north along the river road. The plan is to go in about ten days. We need fuel. We need boats. Most of all, we need drivers who can stay calm." },
    { title: "Doc Lin's Key Tip", text: "Hello. This is Doc Lin. Jo let me borrow the microphone today. I have a key ring tip for you. A key is hidden at Corner Grocery. It opens the narcotics safe at Mile 9 Pharmacy. Read the notes at the grocery to find it. Please, one thing. Take only the medicine you need from that safe. Someone else will need the rest." },
    { title: "Max and Mia Are Looking", text: "Jo here, with a message from two kids. They are twins, named Max and Mia. They got separated from their class at Lincoln Middle School. Now they are looking for their teacher, Ms. Adler. Have you seen Ms. Adler's class? Then leave a note at the school. The twins check there. Let's help them out, people." },
    { title: "Walk, Do Not Run", text: "Jo here, with a warning about Northgate Mall. The walkers there move in one big group. If you run, they come running at you. So walk. Do not run. Then most of them stay put. I know it feels wrong. This tip comes from Luis. He is the mall guard who never left his post. Thanks, Luis." },
    { title: "Seeds for the Next Person", text: "Jo again, with a key ring tip. Big thanks to Mr. Reyes for this one. A key is hidden at Reyes Hardware. It opens the seed vault at Greenhouse Row. Rosa runs Greenhouse Row, and she has a message. Take seeds. Plant them. Then save some seeds for the next person. That is how a garden keeps going." },
    { title: "Nurse Ada Answers", text: "This is Nurse Ada at St. Anne Annex. I will be calm and exact. I stayed here for two reasons. I keep the generator running. I keep the records safe. I heard Doc Lin's message on the radio. I am still waiting, Lin. If you come to this hospital, walk softly. Every step counts in here." },
    { title: "The Class Is Safe", text: "Good evening. This is Mrs. Greer, the librarian. I am speaking from the Public Library. I have good news. Ms. Adler and her class are safe here. The students read by window light every afternoon. They are quiet, mostly. Max and Mia, please listen. Come to the library. Your teacher is here, and she is waiting." },
    { title: "Chief Dunn's List", text: "This is Chief Dunn at Station 12, the fire station. I work with Sergeant Vega on the River Convoy. My job is the lists. Here is the news. The convoy is delayed. One of our trucks needs new engine parts. Do you want to leave with us? Then come sign the list at Station 12. Bring a pen if you have one." },
    { title: "Parts for a Van", text: "Jo here, and I have a key ring tip. A key is hidden at Greenhouse Row. Look around the greenhouses and read the notes. That key opens the parts cage at Ortiz Auto. I knew Mr. Ortiz a little. He would want those parts used. He would want them to keep a van running. So go keep yours running." },
    { title: "Theo at the Pumps", text: "Hello out there. My name is Theo. I tend the pumps at the Water Tower. Two guests are staying with me. They are Dev and Mr. Ortiz. They came because the Water Tower has clean water. Dev asked me to pass on a message. Here it is, word for word. Ruby, I am safe with Theo. Come west." },
    { title: "Ruby Heads West", text: "Jo here. Ruby heard Dev's message! She is heading west to the Water Tower right now. But she left one more warning first. It is painted on the gate at Ridge Lumber. Do not run the saws at Ridge Lumber. The noise brings the whole crowd from the loading dock. Ruby's words, not mine. Good luck, Ruby." },
    { title: "Together Again", text: "Theo here, at the Water Tower. I have good news today. Ruby walked through our gate this morning. She was tired and dusty. Dev saw her first. Now they are together again. They have not stopped talking since. That is all I have. It is enough.\n\nPip cheered so loud at the cabin. June had to remind everyone about the no-shouting rule." },
    { title: "Jo's Old Friend Priya", text: "Jo here. Today's tip is about a place I know well. It is a key ring tip. A key is hidden at Station 12. It opens the repair locker at Signal Electronics. Why do I know that store? Priya is the manager there. She built my first radio transmitter. Without Priya, there would be no Jo on 88.1. So thank her if you see her." },
    { title: "Doc Lin Gets Closer", text: "Doc Lin here, on Jo's radio again. I made it to Mile 9 Pharmacy. I brought a bag of medicine with me. Walkers still fill the road north to St. Anne Annex. So I am waiting for a safe day. I am not giving up. Ada, if you can hear me, keep the generator going. I am getting closer." },
    { title: "Delayed Again", text: "Sergeant Vega here. I am sorry to say it. The River Convoy is delayed again. All this rain made the river too high. The water is too fast for the boats. I will be honest. I am tired. But the plan is still good. We still need fuel. We still need more drivers. Come to the 4th Precinct if you can help." },
    { title: "Hello from Ruby and Dev", text: "Theo here, at the Water Tower. I have a key ring tip for you. A key is hidden here at the Water Tower. It opens the principal's closet at Lincoln Middle School. Read the notes in the pump building to find it. Ruby and Dev are here, too. They say hello to everyone listening. Right now they are arguing about the last cookie." },
    { title: "Two Extra Cots", text: "Mrs. Greer here, at the library. Our building still stands. Reading saved it, I always say. Every night, Ms. Adler sets out two extra cots. One is for Max. One is for Mia. She does it without fail. Max and Mia, if you hear this, come to us. Come to the book drop and knock. We will open the door." },
    { title: "Building, Not Burning", text: "Sergeant Vega here, with a key ring tip. A key is hidden at my station, the 4th Precinct. It opens the foreman's lockbox at Ridge Lumber. Carla is the yard boss out there. She asked me to pass this on. The lumber in that box is for building. It is not for burning. Carla was very clear about that. She was also very loud." },
    { title: "A Light in the Window", text: "This is Nurse Ada. The hospital generator is running low. I have been careful with every drop. I heard Doc Lin's voice on the radio. It made my whole day. So here is my message, Lin. I will keep a light in the top window. Then you will know I am here. Look for it." },
    { title: "Names on the List", text: "Chief Dunn here. Tonight I read the River Convoy list. More names are on it every day. That is the good news. The bad news is the convoy is delayed again. There are not enough boats yet. One more thing. Can you fix an engine? Then come to Station 12. We need you more than ever." },
    { title: "Mrs. Greer's Key Tip", text: "Mrs. Greer here, with a key ring tip. A key is hidden at the Public Library. Read the notes in our halls to find it. It opens the jewelry vault at Northgate Mall. Jewels are not much use now, but who knows? Now, please remember one thing at the mall. Walk, do not run. I want my readers back." },
    { title: "A Storm from the North", text: "Jo here, with a weather warning. A storm is coming from the north tonight. It is a big one. Stay inside. Keep the fire low. Check the fence before dark, not after. The walkers are slow in the wind. But they still come. I will be on my roof, holding my antenna. Wish me luck." },
    { title: "I See Your Light", text: "Doc Lin here. I am at the bottom of the hill now. St. Anne Annex is right above me. Last night I saw a light. It was in the top window of the hospital. That means Nurse Ada is still there. I am still trying to reach her. Ada, I see your light. Keep it burning." },
    { title: "Pack Tonight", text: "Sergeant Vega here. This is the news we waited for. The River Convoy leaves at first light tomorrow. That is, if the river road holds. Everyone on the list, pack tonight. Pack light. Some of you are staying behind. That is fine. Keep the town's rule. Take what you need, leave the rest." },
    { title: "Same Time Tomorrow", text: "Jo here. The River Convoy did not leave this morning. Fog sat on the river road, thick as soup. Sergeant Vega says soon. We have heard that before. But here is some good news. Ruby and Dev are safe at the Water Tower. And Nurse Ada's light is still on. That is it for today. Same time tomorrow on 88.1." },
  ];

  T.tags = {
    fuel: [
      "Masking tape label on the can: MIXED, generator only. Under it, in marker: shake before you pour. Somebody underlined shake twice.",
      "Tomas's rule on the side: fill it to the line. Never to the top. Fuel needs room in the heat. Also: keep it outside, away from the stove.",
    ],
    food: [
      "Stamped on the lid: canned beans, peaches and rice. Hana's sticky note: eat the oldest cans first. Never eat from a can that bulges.",
      "Written on the side: one crate for every trip. Someone drew a smiley face next to it. Under the face, one word: share.",
    ],
    lumber: [
      "Stamped on the end: kiln dried, Ridge Lumber. Carla's chalk on the side: for fences, not for fires. The chalk is underlined.",
      "A paper tag is stapled to the bundle. It says: measure twice, cut once. Pencil marks show where someone almost cut one board.",
    ],
    nails: [
      "Box label: common nails, three inches long. Mr. Reyes's price sticker is still on the corner. On the lid: wear gloves. Pick up every nail you drop.",
      "Sticky note: two nails per board hold better than one. Drive them in at an angle. The box rattles. Wrap it in a shirt to keep it quiet.",
    ],
    tools: [
      "Masking tape on the lid: Reyes Hardware. Bring it back when you are done. Inside the lid, a list: hammer, saw, pliers, wrench, tape.",
      "Mr. Ortiz taped a note inside: wipe the tools clean first. Then put them away. Scratched on the wrench: righty tighty, lefty loosey.",
    ],
    parts: [
      "Tag wired to the box: Ortiz Auto, fits most vans. Mr. Ortiz added: check the belt before a long drive. He underlined belt.",
      "Grease pencil: spark plugs, a belt, an oil filter. Sticky note: turn it hand tight, then a little more. Never turn it as hard as you can.",
    ],
    wire: [
      "Label on the spool: copper wire, coated in plastic. Priya's note: strip a little plastic off each end. Twist the ends together. Then wrap them in tape.",
      "Written on the spool: never touch a bare wire. Not if it is hooked to a generator. Someone drew a tiny antenna and wrote: Jo, 88.1.",
    ],
    radioParts: [
      "Box label: tuner, speaker, antenna clamp. Priya wrote on the side: keep it dry. Keep it in the bag. Her writing is very neat.",
      "Sticky note: the higher the antenna, the farther the voices. Below it, a list of stations. Only one is circled: Jo. It is circled three times.",
    ],
    seeds: [
      "Seed packet: bush beans, plant one finger deep. Rosa wrote on it: soak them in water overnight first. June knows this one by heart.",
      "Seed packet: lettuce and carrots. Barely cover them with soil. Keep the soil damp. Rosa's note: save seeds from your best plants. Keep them for next year.",
    ],
    soil: [
      "Printed on the bag: garden soil, keep dry. Rosa's note: mix in old leaves and kitchen scraps. It makes the soil richer.",
      "Stamped on the bag: Greenhouse Row. On the side, in marker: it is heavy. Lift with your legs, not your back. Tomas did not read this in time.",
    ],
    meds: [
      "Red cross on the lid. Inside: bandages, tape, cleaning wipes, pain pills. Nurse Ada's steps: wash the cut, press to stop bleeding. Cover it. Check it every day.",
      "Doc Lin's sticky note: cool a burn under clean water. Do not pop the blisters. On the side, a promise. One kit gets you back on your feet.",
    ],
    waterFilter: [
      "Label: change the filter when water runs slow. Change it if the water tastes strange, too. Theo's tag: let dirty water settle first. Then pour from the top.",
      "On the side: not sure? Boil the water too. Sticky note: rinse the filter in clean water. Never rinse it in dirty water.",
    ],
    waterTank: [
      "Stenciled on the side: drinking water only. Chief Dunn's tag: Station 12, keep the lid on. Someone added: we mean it. The lid is chained to the handle.",
      "Marker note: scrub it with a little bleach. Rinse it well before you fill it. Keep the tank in the shade, so nothing grows inside.",
    ],
    generator: [
      "Warning plate: run it outside only. The fumes are poison in a closed room. Masking tape label: check the oil before every start.",
      "Taped note: it is loud. Walkers hear it from far away. Below that: run it in the day. Shut it off at night.",
    ],
    gunParts: [
      "A tag from the police armory, signed by Sergeant Vega. The parts are wrapped in oily paper. A note says: keep it clean and dry.",
      "On the box: always check that it is empty. Do that before you clean it. Point it at the ground, never at a person.",
    ],
    armorPlate: [
      "Stenciled on the plate: steel, heavy. Chalk note: bolt it onto the van door. Put it at chest height. It takes two people to lift.",
      "Sticky note: a plate stops grabbing hands, not crashes. Marker lines along one edge count every dent it took. There are a lot of lines.",
    ],
    books: [
      "Stamped inside the first cover: Public Library, please return. Mrs. Greer's note on the box: reading saved this building. Bring them back.",
      "Box label: field guides, first aid, small engines, poems. Sticky note: the first aid book has folded corners. Use that one first.",
    ],
    maps: [
      "Folder label: city maps, streets and the river road. Someone traced the river road north in red pen. Next to it: CONVOY.",
      "Pencil marks: a red R next to some buildings. Ruby's note on the back explains it. A red R means I have been inside. The number means walkers.",
    ],
  };

  T.recap = {
    haul: "You brought home {items} items and {scrap} scrap.",
    nothing: "You came home with nothing this time.",
    notes: "You read {notes} new notes out there.",
    keys: "You found {keys} new keys today.",
    food: "The crew ate, and {food} food is left.",
    hungry: "No food, so the van is weaker next trip.",
    next: "To build {room}, you still need {needs}.",
    ready: "Everything is here to build {room} now.",
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
