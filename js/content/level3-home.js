/* Reading level 3: home. Yard lot signs, June's journal, the radio, item tags, and the day recap.
   Facts: js/story-home.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[3] = root.ZSR.TEXT[3] || { level: 3 });

  T.yard = {
    lots: {
      garden: {
        title: "Garden plot",
        empty: "GARDEN, someday. That is what June painted on this sign. Stakes and string mark out beds in the dark dirt behind the cabin. Nothing grows here yet. Raised beds of seeds and soil would grow food. That matters, because every trip in the van eats food. To start, the beds need 2 Seed packets and 1 Bag of soil. They also need 40 scrap. Build it from the cabin. June is already picking spots for the beans.",
        built: [
          "The sign says GARDEN now, and the word someday is painted over. One raised bed is planted with seeds. Small green leaves have pushed up through the soil. June checks it every morning, before anyone else is up. It grows 1 food each day. That is not much, but it is food you did not drive for. More beds would need seeds, soil, and 80 scrap.",
          "The sign says GARDEN, and now there are more beds. Beans climb the string in green spirals, and squash leaves spread out wide. Pip has started naming the squash. June says that is a bad idea, because you cannot eat a friend. The garden grows 2 food each day. A water tank and a hose would make it grow more. That last step also needs seeds, soil, and 120 scrap.",
          "The sign says GARDEN. A water tank feeds the beds through a long hose. No more hauling buckets from the barrel. Beans, squash and tomatoes fill every row. June finally has her full garden, and she stands in it a lot. She says she is checking for bugs. Mostly she is just smiling. It grows 3 food each day, the most these beds can give.",
        ],
      },
      farm: {
        title: "Farm field",
        empty: "Tomas painted this sign: FARM, after the Garden and the Well. A wide patch of grass past the garden has a stake at each corner. A crop field here would grow food on top of the Garden. Later, it could hold animals too. For now, the lot stays locked. First the Garden must reach level 2, and the Well must be dug. Then the field needs 2 Seed packets, 2 bags of soil, and 1 Lumber. It also takes 80 scrap.",
        built: [
          "The sign says FARM: a crop field of corn and beans in long rows. Tomas dug the rows himself, and they are only a little crooked. The field grows 2 food each day on top of the Garden. The crew still eats the same, but now there is more to share. Next could come a chicken coop. That needs Well 2, lumber, wire, seeds, and 120 scrap.",
          "The sign says FARM: a chicken coop with wire walls. The hens are loud at dawn, louder than any alarm clock. Pip collects the eggs each morning. Pip counts them in a whisper, because of the rule. The farm gives 4 food each day now. A goat pen would add even more. It needs Well 3, lumber, wire, a water tank, and 180 scrap.",
          "The sign says FARM: a goat pen with a trough fed from the Well. The goats eat almost everything. One of them chewed a corner off the sign. Pip says goats are almost as good as a dog. Almost. Tomas says goats are worse than walkers, but he scratches their ears anyway. The farm gives 6 food each day, and it cannot get any bigger.",
        ],
      },
      well: {
        title: "Well site",
        empty: "June painted the sign: WELL, dig after the Water room is built. A ring of stones marks the spot in the middle of the yard. Deep under the stones, the water is cold and clean. Water from down there would help you heal faster in the yard. The Farm and the Lab both need the Well first, so this lot matters. To dig it, you need 2 Lumber, 1 Tool kit, and 60 scrap.",
        built: [
          "The sign says WELL: a hand-dug well lined with lumber. A bucket hangs on a rope, and the rope creaks on every pull. Tomas says the creak is a feature. The water comes up cold, clean, and a little sweet. Its clean water helps you heal faster in the yard. A hand pump would work even better. It needs lumber, engine parts, a water filter, and 100 scrap.",
          "The sign says WELL: a hand pump with a filter brings the water up. No more rope burns on anyone's hands. Pip likes to work the handle and count the strokes out loud, but softly. You heal in the yard even faster than before. The Farm and the Lab can grow bigger now, too. A wired pump would need a water tank, engine parts, wire, and 150 scrap.",
          "The sign says WELL: a wired pump fills a tank all by itself. When the yard is quiet, you can hear it hum. You heal in the yard faster than ever. You also start every building at full health, which feels like a gift. Tomas wired the pump in one long afternoon. June baked him a cake out of beans to say thanks. Nobody asked how.",
        ],
      },
      water: {
        title: "Water barrel",
        empty: "Tomas painted the sign: WATER, filter goes here. An empty barrel sits on two sawhorses by the back fence. When it rains, gray water fills it up. A filter and a tank here would turn that rainwater clear. Then you would heal faster while you are in the yard. To start, it needs 1 Water filter and 40 scrap. The Well waits on this lot, so build it early.",
        built: [
          "The sign says WATER: a filter sits on top of the barrel. Gray water goes in at the top. Clear water drips out at the bottom, one slow drop at a time. It is slow, but it works. Because of it, you slowly heal in the yard. A big tank would hold much more. That needs a water tank, another filter, and 80 scrap.",
          "The sign says WATER: a filter and a big tank, full of clean water. The tank sits in the shade so nothing grows inside it. You heal faster in the yard now. June washes her hands at the spout. She says it feels like the old days. Two filters would make it even better. That needs a tank, 2 filters, and 120 scrap.",
          "The sign says WATER: two filters and a tank, working side by side. The water runs clear and cold, with no smell at all. You heal even faster in the yard. Better still, you walk into every building at full health. Tomas checks the filters once a week. Pip checks them every single day, just in case Tomas missed something.",
        ],
      },
      power: {
        title: "Power pole",
        empty: "Tomas painted the sign: POWER, lights first. A bare pole stands by the back fence. An old coil of rope lies at its foot. Fuel, wire and lights here would show how dangerous each place is. You could pick your drives with your eyes open. Later a generator could do even more. To start, it needs 2 Fuel cans, 1 Spool of wire, and 60 scrap.",
        built: [
          "The sign says POWER: fuel cans, wire, and a string of working lights. At night the yard glows a soft yellow. The map shows the danger of every place before you drive. Less guessing means fewer bad trips, and fewer close calls. A generator would add more. It needs a generator, 2 fuel cans, and 100 scrap.",
          "The sign says POWER: a generator hums under a tin roof. It runs in the day and stays off at night, because walkers hear it. The map shows danger, and you find one supply crate on every drive. Tomas says the hum helps him think. Headlights for the van would be next. They need wire, fuel, and 150 scrap.",
          "The sign says POWER. More wire runs out to the van, which now has headlights. The map shows danger, and you find two supply crates on every drive. The headlights cut through night and fog like a knife. Tomas tested them by flashing the cabin window at midnight. June was not amused, but Pip clapped.",
        ],
      },
      radio: {
        title: "Radio tower",
        empty: "Pip painted the sign: RADIO, Pip's job. A tall post stands in the yard with a ladder leaning on it. A radio tower here would pick up voices from town. A wire would carry them to the radio in the dining room. The voices would tell you where places are, so they show up on the map. It needs 1 Radio parts, 1 Spool of wire, and 50 scrap.",
        built: [
          "The sign says RADIO: a timber tower lashed with rope. A thin whip antenna sticks up from the top. A wire runs from it to the radio in the dining room. Pip sits there every night with a pencil. Pip writes down every voice, even the ones that only cough. It finds three new places on the map. A steel tower needs radio parts, 2 spools of wire, and 100 scrap.",
          "The sign says RADIO: a steel tower on guy wires. A dish sits halfway up, and a red light blinks on top. It reaches all over town. The voices come in clearer now, and there are more of them. It finds every place on the map. Pip has filled four pages of the list already. The last step builds a taller tower. It needs radio parts, wire, a box of books, and 150 scrap.",
          "The sign says RADIO: a tall red and white tower. It has two dishes and two blinking lights. A little equipment hut with solar panels sits at its foot. In the dining room, Pip's books keep the logbook of voices. A map of the town hangs next to it. Every name is in there, spelled right, mostly. It finds every place, and it shows which places still have items. Now you know where to drive before you even start the van.",
        ],
      },
      lab: {
        title: "Lab corner",
        empty: "June painted the sign: LAB, after the Medbay and the Well. A shady corner has an old bench and a row of empty jars. Herb beds and a still here would make medical kits at home. That means fewer trips to the hospital, and fewer close calls. To start, it needs a Medical kit, a Box of books, and Seed packets. It also needs 80 scrap.",
        built: [
          "The sign says LAB: herb beds and a copper still. A still boils herbs down into medicine. It smells like mint and old socks. It makes 1 medical kit every 2 days. New kits go into storage when a day passes. A clean bench would come next. It needs Well 2, a water filter, books, wire, and 120 scrap.",
          "The sign says LAB: a clean bench with a sink that runs filtered water. June wipes the bench down twice a day. It makes 1 medical kit each day now. That is one less reason to drive to the hospital in the hills. A powered lab needs Medbay 2 and a generator. It also needs 2 medical kits, books, and 180 scrap.",
          "The sign says LAB: a powered lab, humming off a generator. Glass jars line the shelves, and June labeled every one in neat print. It makes 2 medical kits each day. June says a real doctor would be proud of it. Pip says a real doctor would want to borrow it. And maybe keep it.",
        ],
      },
    },
  };

  T.journal = [
    {
      title: "By Candlelight",
      text: "This is the first page of my green ledger. I am writing by candlelight, so forgive the wobbly lines. The van rolled into the yard on its last drops of fuel. Tomas talked to the engine the whole way, and I think it listened. The cabin at the south end of town was empty and dry. It has a woodstove, and the door still locks. Pip fell asleep on the bench before the bags were even inside. You took the first watch at the window. Good night, from June.",
    },
    {
      title: "Bigger than It Looked",
      text: "In daylight the cabin is bigger than it looked last night. It is a whole family house with a porch, and the roof is sound. An old fence circles the yard. Some of its boards are loose. Behind the cabin, the dirt is dark and good. I noticed it first, of course. Old gardeners always look down. Tonight I wrote our first rule on the inside of the door. Say where you are going before you go. Pip read it twice and asked, “Even to the bathroom?” Yes, Pip. Even there. — June",
    },
    {
      title: "The Old Mule",
      text: "Tomas spent the morning under the van. When he slid out, he was smiling and covered in grease. He says the van is old but honest, like a good mule. I have never met a mule I trusted, but I trust Tomas. In the afternoon you drove out to look for supplies. I watched the road the whole time, until the van came back. “June, you are allowed to blink,” Pip told me. Pip counted the minutes you were gone. Then Pip wrote the number on the wall in pencil.",
    },
    {
      title: "The Biggest Wave Yet",
      text: "The biggest group yet came to the fence at dusk, all at once. They pushed at the boards until the wood groaned. Then, just like that, the yard went quiet for a while. I sat up late and thought about it. By now I have learned that they come in waves, with calm in between. That is something we can plan around. So a new rule went on the door tonight. No shouting in the yard, because walkers follow sound. Pip whispered, “June, can I still sing?” Only very, very softly.",
    },
    {
      title: "Where Everyone Went",
      text: "Pip asked me where everyone in town went. It is a fair question, and I wanted to answer it honestly. I said some people left, and some people hid. And some people are still out there, helping each other. Pip thought about that for a long time. Then Pip asked if we could keep a dog if we found one. I said a dog would need to eat too. Pip said a dog would also need a name. That was not my point, but it was a good point. — June",
    },
    {
      title: "Patch Before Supper",
      text: "The days have a rhythm now. Drive out, come home, hold the fence. It sounds simple, and some days it even is. Here is what I learned today. A hole in the fence does not close by itself. Someone has to patch it with scrap, every single time. So I made it a rule. Patch the fence before supper. Tomas grumbled about it, but he did it first. Supper was beans again. Nobody complained out loud, and I am counting that as a win. — June",
    },
    {
      title: "Waiting on Seeds",
      text: "Before the Fall, I was the gardener at a school. I want a little of that back. I picture raised beds behind the cabin, with beans, squash and tomatoes. The dirt is ready, and so am I. All we need now are seeds. My old friend Rosa ran the greenhouses at Greenhouse Row. That is west of the gas station. If anyone still has seeds, it is Rosa. She once grew a pumpkin the size of a tire. I told Pip, and Pip did not believe me. — June",
    },
    {
      title: "The Red R",
      text: "People talk about a scout named Ruby. She paints a red R on buildings around town. Next to the R, she writes how many walkers she saw inside. It is simple, and it could save a life. Pip practiced painting the R on a board today. Pip put a number next to it, very neat. Then Pip painted three more, just for practice. A stranger who leaves warnings for other strangers is a good sign. It means someone still cares about people they will never meet. — June",
    },
    {
      title: "Under the Cars",
      text: "Tomas told me about his father tonight. His father was a mechanic. He learned the trade from Mr. Ortiz at Ortiz Auto. Tomas learned it from his father, lying under cars and handing over wrenches. Today he fixed the van's loose mirror. He used wire and pure stubbornness, and it has not moved since. He hopes Mr. Ortiz is still out there somewhere. So do I. A man who taught that well should meet his students' students. I told Tomas so, and he went red to the ears.",
    },
    {
      title: "Rain and Cards",
      text: "It rained all day. The roof leaked in two spots, and one was right over my chair. We put pots under the drips and listened to them plink. Then we played cards by the stove. Pip won every game. Pip would not explain how, and Tomas checked both sleeves twice. Nothing. A rainy day with everyone inside is a good day. No one on the road, and no one at the fence. Just the stove, the pots, and a card shark named Pip. — June",
    },
    {
      title: "Static and Voices",
      text: "Pip found an old radio dial in a kitchen drawer. Pip turned it slowly for an hour. There was only static from the loose dial, a long gray hiss. Still, Pip is sure there are voices out there. Jo talks on the radio from a rooftop. Pip keeps a list of every voice the crew hears. The first name on it is mine. “June,” it says, in big letters. I am honored, and a little worried about the spelling.",
    },
    {
      title: "Sunflowers by the Fence",
      text: "Today I remembered my school garden. One spring, the kids planted sunflowers along the fence. I taught them to plant a seed one finger deep. I taught them to water it every day, even on weekends. Some of them did, and some of them tried. The sunflowers grew taller than all of us. I wonder where those kids are now. I hope they are safe, wherever they went. I hope they remember the sunflowers. I still remember every one of their faces. — June",
    },
    {
      title: "Counting the Food",
      text: "I count the food every night now. I write the number here, in this ledger, so we never have to guess. Every trip in the van eats food. A hungry crew makes a weak van. A weak van is a danger to everyone. So the rule is simple. Everyone eats the same, even when there is not much. Tonight there was not much. Tomas gave Pip half his bread anyway. I pretended not to see. Some rules can bend a little. — June",
    },
    {
      title: "Talk of a Convoy",
      text: "There is talk of the River Convoy. It is a line of boats and trucks. A police sergeant named Vega is getting it ready. The plan is to leave north along the river road. Tomas wants to see if the van could make the trip. He already has a list of parts it would need. I am not sure I want to leave the cabin. The roof leaks, but it is our roof. We will talk about it again. Not tonight, though. — June",
    },
    {
      title: "Half a Month",
      text: "Tomas fixed the squeaky cabin door today. He used a strip of wire and some cooking oil. Now it swings without a sound. I told him he would fix the moon if someone handed him a ladder. Pip looked worried and asked if the moon was broken. No, Pip. The moon is fine. Here is the real news. We have lasted half a month at the cabin. That is longer than anyone guessed, me included. I wrote it down twice, to be sure. — June",
    },
    {
      title: "The Hardest Night",
      text: "Last night was the hardest night yet. Walkers came at the fence from every side. The boards cracked, and I was sure one would give. Nobody ran, and nobody shouted. Everyone stayed in place and did their job. The fence held until morning, and so did we. Pip slept in the closet with a pot on their head. Pip called it a helmet. This morning I put the pot back on the stove. It still has a dent in it. — June",
    },
    {
      title: "Doc Lin's Rounds",
      text: "There is talk of a doctor named Doc Lin. Doc Lin carries medicine around town, mostly on foot. The route goes between the grocery, the pharmacy and the hospital. Back and forth, rain or not. A nurse named Ada stayed at the hospital, St. Anne Annex. She stayed to keep the generator running. I think about those two a lot. People like that are the reason the town is not gone. We should try to be people like that, too. — June",
    },
    {
      title: "Frost on the Glass",
      text: "This morning there was frost on the van's windshield. Tomas scraped it off with an old library card. He says it is the most use that card ever got. Cold mornings worry me. Before we need anything else, we need blankets. A cold crew sleeps badly, and a tired crew makes mistakes. So blankets go at the top of the list. Pip drew a dog in the frost on the window. It had a long tail and a very big smile. — June",
    },
    {
      title: "Counting Heads",
      text: "People tell a story about a teacher named Ms. Adler. She led her whole class out of Lincoln Middle School. People say she took them to the Public Library. Two of her students got separated from the class. They are twins, named Max and Mia. I keep thinking about those two. A good teacher counts heads every hour. I know, because I used to. I hope Ms. Adler is still counting, and I hope her count comes out right. — June",
    },
    {
      title: "What We Carry",
      text: "Pip asked me if the world is ever going to come back. I took a long time to answer. I said some of it will, the parts people carry with them. Pip asked which parts our crew is carrying. I pointed at the door first, at the rules. Then I pointed out the back window, at the dirt where the seeds go. Then I pointed at Tomas, and at Pip, and at me. The rules, the seeds, and each other, I said. Pip nodded slowly. — June",
    },
    {
      title: "The Rules, Out Loud",
      text: "After supper, I read the five rules on the door out loud. Say where you go. No shouting in the yard. Patch the fence before supper. Everyone eats the same. Take what you need, leave the rest. Pip always joins in on the last one, loud and proud. I tell Pip that one is the town's rule, not just ours. But it is a good one. It looks fine on our door, in Pip's big, loopy letters. — June",
    },
    {
      title: "Messages Find People",
      text: "Pip keeps asking about Ruby and her younger brother, Dev. People say Ruby went looking for Dev all over town. They say Dev left messages for her wherever he went. Notes, chalk, paint on the walls. Pip has thought about this a lot. Pip says people who keep leaving messages find each other. It is that simple, Pip says. I did not argue. Some days, the simple answer is the truest one anyone gives. — June",
    },
    {
      title: "Engine Talk",
      text: "Tomas is teaching Pip to listen to the van's engine. They lie side by side on the cold ground under it. A tick means one thing. A knock means another. A squeal means stop right now, no matter what. Pip took notes, of course, with drawings. Now Pip says hello to the van every morning, very politely. Tomas says the van likes it. I have decided not to ask how he knows. Some things are between a mechanic and his van. — June",
    },
    {
      title: "Big, Messy Letters",
      text: "My knees ache on cold mornings. I think they are older than the cabin. On those mornings, I have Pip keep the ledger. That is just in case my hands get stiff. Pip writes big and messy, with loops on every letter. I tell Pip that is fine. A ledger only has to be honest, not neat. Today Pip wrote the date, the food count, and a small drawing of the van. The van had a face. I kept the drawing. — June",
    },
    {
      title: "A Bark Past the Trees",
      text: "A dog barked somewhere past the trees last night. Just three barks, and then nothing. Pip stood at the window for an hour, listening. Tomas said a dog that survived this long must be smart. Smart enough to find the crew, he said, if it wants to. This morning Pip left a bowl of water by the gate, just in case. I did not say a word about it. I may have filled the bowl again at noon. — June",
    },
    {
      title: "Stories in the Wind",
      text: "The wind came hard from the north and rattled the windows all night. Nobody could sleep, so we told stories by the stove. Tomas told one about his father's garage and the smell of hot oil. I told one about my school garden and a very brave tomato. Pip told one about a dog that drives a van. It was the best story by far. The dog parks badly, but everyone forgives it. — June",
    },
    {
      title: "Reading by the Window",
      text: "I think about my old students when I write in here. If any of them made it, maybe they are in the library. It helps to picture them reading by the window. I see them turning pages, heads close together. One reads too slowly, and another one reads ahead. Someone is whispering the hard words. Then I close the ledger and get up. There is always a next job, and I do it. — June",
    },
    {
      title: "What We Want",
      text: "Tomas says the van could make it up the river road. That is, if the convoy ever leaves. So tonight I asked the crew what they want. Pip said a dog, right away. Tomas said a garage, with real tools on the wall. I said a garden, and they both rolled their eyes at me. We talked for a long time after that. In the end, we agreed. The cabin is home for now. — June",
    },
    {
      title: "A Quiet Day",
      text: "A quiet day, the first in a while. Sun on the yard and wind in the trees. No walkers at the fence for hours. I sat on the step and wrote slowly, just because I could. Tomas whistled under the van. Pip practiced knots on the fence rope, tongue sticking out. Quiet days are not wasted. They are how you get ready for loud ones. Tomorrow may be loud. Today was not. — June",
    },
    {
      title: "Still Here",
      text: "Tonight I read the ledger back to the crew, from the very first page. It took a while, and Pip asked for the funny parts twice. We found the cabin. We kept it, and we kept each other. Tomorrow is the same work as today. The van, the fence, the food, the rules on the door. At the bottom of this page, I wrote one more line. We are still here, and that is a lot. — June",
    },
  ];

  T.radio = [
    {
      title: "Jo on 88.1",
      text: "This is Jo on 88.1, talking from a rooftop downtown. If you can hear me, you made it this far. Good. Every day I read out news, warnings and tips. They are for anyone still listening, wherever you are. Here is the first thing to know. The town has one rule. Take what you need, leave the rest. Keep that rule, and the town keeps going. Same time tomorrow. (At the cabin, Pip wrote Jo's name on the list of voices.)",
    },
    {
      title: "How the Key Ring Works",
      text: "Jo here, on 88.1. Today I want to explain the key ring. In each building, the best supplies are locked in a stash. That way, people who smash and grab cannot take them. The key to each stash is hidden in a different building. A note there says where it is. Ruby and I started the key ring. Mr. Reyes from Reyes Hardware cut the first keys. So here is the trick. Only people who read the notes find the keys.",
    },
    {
      title: "A Key at Gas-N-Go",
      text: "Jo again, with a key ring tip. Grab a pencil and write this down. The key hidden at Gas-N-Go opens the staff locker at Corner Grocery. Do not tear Gas-N-Go apart looking for it. The notes inside Gas-N-Go tell you where the key is. Read one, and it points you to the next. Follow them, and you will find it. Then drive to Corner Grocery and open that locker. Leave something good behind if you can.",
    },
    {
      title: "Ruby Is Still Looking",
      text: "This is Jo, with a message from Ruby. You know Ruby. She is the scout who paints the red R. Ruby is looking for her younger brother, Dev. Dev worked at Gas-N-Go, behind the register. If you see Dev, tell him Ruby is still looking. Tell him she has not stopped. One more thing about Ruby's marks. The number next to her red R is how many walkers she saw inside. Trust that number. She counts carefully.",
    },
    {
      title: "Hold On, Ada",
      text: "Jo here. I have a message to pass on. It is from Doc Lin, to Nurse Ada at St. Anne Annex. Here it is, word for word. Hold on, I am coming. Now a warning for everyone else. St. Anne Annex is the most dangerous place in town. The walkers there follow sound more than light. So move quietly inside. No running, no shouting, and no dropped cans. Soft steps get you in, and soft steps get you out.",
    },
    {
      title: "Sergeant Vega Speaks",
      text: "This is Sergeant Vega, speaking from the 4th Precinct. I am organizing the River Convoy. That means boats and trucks, leaving north along the river road. The plan is to leave in about ten days. To do that, the convoy needs three things. It needs fuel. It needs boats. And it needs drivers who can stay calm when things go wrong. If that sounds like you, come to the 4th Precinct and find me. Vega out.",
    },
    {
      title: "Doc Lin Borrows the Mic",
      text: "Hello, this is Doc Lin. Jo let me borrow the microphone for a minute. I have a key ring tip for you. The key hidden at Corner Grocery opens the narcotics safe at Mile 9 Pharmacy. That safe holds real medicine, the strong kind. So please, listen to me. Take only the medicine you need from that safe. Someone else will need the rest, maybe tomorrow. Maybe that someone will be you. Thank you. Back to Jo.",
    },
    {
      title: "A Message from the Twins",
      text: "Jo here. I have a message from twins named Max and Mia. They are thirteen, and they sound brave. They got separated from their class at Lincoln Middle School. Now they are looking for their teacher, Ms. Adler. Have you seen Ms. Adler's class? Then please leave a note at the school. Max and Mia go back there to check. Even a few words will help. Let's get these two back where they belong.",
    },
    {
      title: "Walk, Don't Run",
      text: "Jo here, with a warning about Northgate Mall. The walkers there move in a group, all together. If anyone runs, they come running at that person. So here is the trick. Walk, do not run, and most of them stay put. It feels wrong, I know. Your legs will want to run. That tip comes from Luis, the mall guard who never left his post. He has watched that crowd for months. Trust Luis on this one.",
    },
    {
      title: "Seeds for the Next Person",
      text: "Jo here, with a key ring tip. Big thanks to Mr. Reyes for this one. The key hidden at Reyes Hardware opens the seed vault at Greenhouse Row. Rosa runs Greenhouse Row, and she asked me to pass something on. Take the seeds, and plant them. Then save some seeds for the next person. That is how a garden keeps going. Rosa says it is how a town keeps going, too. I think she is right.",
    },
    {
      title: "Nurse Ada Checks In",
      text: "This is Nurse Ada, speaking from St. Anne Annex. I will be brief, because the generator needs me. I stayed here to keep it running. I also stayed to keep the records safe. Someone has to. I heard Doc Lin's message on this station. I am still waiting, and I am still here. A request for anyone who comes to the hospital. Walk softly. The walkers in these halls hear everything. Thank you. Ada out.",
    },
    {
      title: "Mrs. Greer's Good News",
      text: "Good afternoon. This is Mrs. Greer, the librarian, speaking from the Public Library. I have news that many of you have asked about. Ms. Adler and her class are safe here at the library. The students read by window light every afternoon. They are doing well, and they read faster every week. Now, a message for Max and Mia. Please come to the library. Your teacher is here, and she is waiting for you.",
    },
    {
      title: "Chief Dunn Keeps the List",
      text: "Chief Dunn here, from Station 12, the fire station. I work with Sergeant Vega on the River Convoy. My job is keeping the lists, and I keep them well. Here is the news. The convoy is delayed. One of the trucks needs new engine parts. We do not have them yet. Do you want to leave with the convoy? Then come and sign the list at Station 12. Print clearly, please. Dunn out.",
    },
    {
      title: "Open the Parts Cage",
      text: "Jo here, with another key ring tip. This one is for the drivers out there. The key hidden at Greenhouse Row opens the parts cage at Ortiz Auto. That cage is full of good engine parts. I knew Mr. Ortiz a little, back before. He would want those parts used to keep a van running. Not sitting in a cage, gathering dust. So go get them. Keep your van alive, and keep moving.",
    },
    {
      title: "Theo at the Pumps",
      text: "This is Theo, speaking from the Water Tower. I tend the pumps here, day and night. Lately, I have two guests. Dev and Mr. Ortiz are staying with me. They came because the Water Tower has clean water. Dev asked me to send a message to his sister. He made me practice it twice. Here it is. Ruby, I am safe with Theo, come west. That is all he wanted to say. Theo out.",
    },
    {
      title: "Ruby Heads West",
      text: "Jo here, with good news for once. Ruby had gone back east to scout Ridge Lumber. Dev's message reached her there. She is heading west to the Water Tower right now. Before she left, Ruby left one more warning. She painted it on the gate at Ridge Lumber. Here is what it says. Do not run the saws at Ridge Lumber. The noise brings the whole crowd from the loading dock. Listen to Ruby on this. She has been right every time so far.",
    },
    {
      title: "Together Again",
      text: "This is Theo, at the Water Tower, and I have good news. Ruby walked through our gate this morning. Dev saw her first. He dropped a full bucket of water and did not even notice. She and Dev are together again. They have not stopped talking since. I may never get my bucket back. That is all from me. Theo out. (At the cabin, Pip let out a huge cheer. It was so loud that June had to remind everyone about the no-shouting rule.)",
    },
    {
      title: "Where Jo Got Started",
      text: "Jo here, with a key ring tip about a place I know well. The key hidden at Station 12 opens the repair locker at Signal Electronics. Signal Electronics is where this whole station started. Priya, the manager there, built my first radio transmitter. She built it out of parts nobody else wanted. So if you open that locker, be good to what is inside. Some of my best days happened in that shop.",
    },
    {
      title: "Doc Lin Gets Closer",
      text: "This is Doc Lin. I made it to Mile 9 Pharmacy with a bag of medicine. The trip was long, but I am fine. The road north to St. Anne Annex is still full of walkers. So I am waiting here for a safe day. I check the road every morning. A message to Nurse Ada, if you are listening. Keep the generator going. I am getting closer. Every day, I am getting closer.",
    },
    {
      title: "The Convoy Waits Again",
      text: "Sergeant Vega here. I will not pretend this is good news. The River Convoy is delayed again. Rain made the river too high and too fast for the boats. We cannot launch in water like that. I am tired, and I will admit it. But the plan is still good. We still need fuel, and we still need more drivers. If you can help, come to the 4th Precinct. Vega out.",
    },
    {
      title: "Theo's Key Ring Tip",
      text: "Theo here, at the Water Tower. Jo asked me to share a key ring tip. The key hidden at the Water Tower opens the principal's closet. That closet is at Lincoln Middle School. Read the notes in our pump building, and they will lead you to it. One more thing before I go. Ruby and Dev say hello to everyone listening. They are sitting right next to me, waving at the radio. I told them you cannot see that. Theo out.",
    },
    {
      title: "Two Extra Cots",
      text: "This is Mrs. Greer, at the Public Library. The library still stands. I believe reading saved this building, and I will not change my mind. Every night, Ms. Adler sets out two extra cots. One is for Max, and one is for Mia. She makes them up with clean blankets, just in case. Max and Mia, if you hear this, come to the book drop. Knock, and we will open the door. Your cots are waiting.",
    },
    {
      title: "Lumber for Building",
      text: "Sergeant Vega here, with a key ring tip. The key hidden at the 4th Precinct opens the foreman's lockbox at Ridge Lumber. I asked Carla, the yard boss, about that lumber. Carla says it should go to building, not burning. Build a fence with it. Build a shelf, or a bed, or a ramp for a boat. Just do not burn it for warmth if you can help it. Carla will know. Vega out.",
    },
    {
      title: "A Light in the Window",
      text: "This is Nurse Ada at St. Anne Annex. The hospital generator is running low. I am saving every drop of fuel I can. But I have good news, too. I heard Doc Lin's voice on the radio. It made my whole day. So here is my message to Doc Lin. I will keep a light in the top window. That way you know I am here. Look up when you reach the hill. Ada out.",
    },
    {
      title: "More Names, Not Enough Boats",
      text: "Chief Dunn here, at Station 12. I am reading the River Convoy list. More names are on it every day. That is the good part. Here is the bad part. The convoy is delayed again, because there are not enough boats yet. We need more, and we need them to float. Can you fix an engine? Then come to Station 12. Right now, we need you more than we need anything. Dunn out.",
    },
    {
      title: "Mrs. Greer's Key Tip",
      text: "Mrs. Greer here, at the Public Library, with a key ring tip. The key hidden at the Public Library opens the jewelry vault at Northgate Mall. The notes in our reading rooms will guide you to it. Please read them all the way to the end. Skimming is how people miss things. One more thing, from a librarian who listens to Jo. At the mall, walk, do not run. Running brings the whole crowd.",
    },
    {
      title: "Storm from the North",
      text: "Jo here, with a weather warning. A storm is coming from the north tonight. It will be big, and it will be loud. So stay inside, and keep the fire low. Check the fence before dark, every single board. Walkers are slow in the wind, but they still come. Do not let the noise fool you into thinking you are alone. Ride it out tonight. I will talk to you in the morning.",
    },
    {
      title: "Doc Lin Sees the Light",
      text: "This is Doc Lin. I am at the bottom of the hill below St. Anne Annex. I am close now, very close. Last night I saw a light in the top window of the hospital. It was small, but it was there all night. Nurse Ada is still there. She kept her word. I am still trying to reach her. The hill is crowded with walkers, but I will find a way up.",
    },
    {
      title: "First Light Tomorrow",
      text: "Sergeant Vega here. Listen closely. The River Convoy will leave at first light tomorrow, if the river road holds. Everyone on the list should pack tonight. Pack light, and pack smart. Some of you are staying behind, and that is all right. If you stay, keep the town's rule. Take what you need, leave the rest. Look after each other while we are gone. Vega out.",
    },
    {
      title: "Fog on the River Road",
      text: "Jo here. The River Convoy did not leave this morning. Fog sat on the river road, thick as soup. Nobody could see a thing. Sergeant Vega says soon, and I believe Vega. Now some good news to end with. Ruby and Dev are safe at the Water Tower. Nurse Ada's light is still on, up in that top window. Hang in there, all of you. Same time tomorrow on 88.1.",
    },
  ];

  T.tags = {
    fuel: [
      "A strip of masking tape on the can says MIXED, generator only. Under it, someone added in black marker: shake before you pour. The marker is smeared from greasy hands.",
      "Tomas's rule is written on the side. Fill it to the line, never to the top. Fuel needs room in the heat. A second note says: keep it outside, away from the stove.",
    ],
    food: [
      "Stamped on the lid: canned beans, peaches and rice. Hana's sticky note says to eat the oldest cans first. Below it, she wrote one more rule: never eat from a can that bulges.",
      "Written on the side of the crate: one crate for every trip. Someone drew a smiley face next to it. Under the face is one word in big letters: share.",
    ],
    lumber: [
      "Stamped on the end of the board: kiln dried, Ridge Lumber. Carla's chalk runs along the side: for fences, not for fires. She underlined fences.",
      "A paper tag is stapled to the bundle: measure twice, cut once. Pencil marks along one board show where someone almost cut it. Good thing they measured a second time.",
    ],
    nails: [
      "Box label: common nails, three inches long. Mr. Reyes's price sticker is still on the corner. Written on the lid: wear gloves, and pick up every nail you drop.",
      "Sticky note: two nails in each board hold better than one. Drive them in at an angle. Below it: the box rattles. Wrap it in a shirt to keep it quiet.",
    ],
    tools: [
      "Masking tape on the lid: Reyes Hardware, bring it back when you are done. Inside the lid is a list in pencil. Hammer, saw, pliers, wrench, tape. All five are here.",
      "Mr. Ortiz taped a note inside: wipe the tools clean before you put them away. Someone scratched words into the wrench handle: righty tighty, lefty loosey.",
    ],
    parts: [
      "A tag is wired to the box: Ortiz Auto, fits most vans. Mr. Ortiz added a line: check the belt before any long drive. Tomas would agree.",
      "Grease pencil on the side: spark plugs, a belt, an oil filter. A sticky note says: turn it hand tight, then a little more. Never as hard as you can.",
    ],
    wire: [
      "Label on the spool: copper wire, coated in plastic. Priya's note is tucked inside the core. Strip a little plastic off each end. Twist the ends together, then wrap them in tape.",
      "On the side of the spool: never touch a bare wire. Not if it is hooked to a generator. Someone drew a tiny antenna beside it and wrote: Jo, 88.1.",
    ],
    radioParts: [
      "Box label: tuner, speaker, antenna clamp. Priya's handwriting runs across the flap: keep it dry, keep it in the bag. She underlined the word dry three times.",
      "A sticky note says: the higher the antenna, the farther the voices. Below it is a list of stations. Only one name is circled, in red ink: Jo.",
    ],
    seeds: [
      "Seed packet: bush beans, plant one finger deep. Rosa's handwriting is on the packet too: soak them in water overnight first. She says they wake up faster that way.",
      "Seed packet: lettuce and carrots. Barely cover them with soil, and keep the soil damp. Rosa wrote on the back: save seeds from your best plants for next year.",
    ],
    soil: [
      "Printed on the bag: garden soil, keep dry. Rosa's note is pinned to the top with a clothespin. Mix in old leaves and kitchen scraps to make it richer.",
      "Stamped on the bag: Greenhouse Row. On the side, in thick marker: it is heavy. Lift with your legs, not your back. Your back will thank you.",
    ],
    meds: [
      "A red cross is on the lid. Inside: bandages, tape, cleaning wipes, pain pills. Nurse Ada taped her steps there too. Wash the cut, press to stop bleeding, cover it, check it daily.",
      "Doc Lin's sticky note: for a burn, cool it under clean water. Do not pop the blisters. Written on the side: one kit gets you back on your feet.",
    ],
    waterFilter: [
      "Label: change the filter when the water runs slow or tastes strange. Theo's tag hangs from the handle. Let dirty water settle first, then pour from the top.",
      "Written on the side: if you are not sure, boil the water too. A sticky note says: rinse the filter in clean water, never in dirty water.",
    ],
    waterTank: [
      "Stenciled on the side: drinking water only. Chief Dunn's tag is tied to the handle: Station 12, keep the lid on. Somebody listened, because the lid is still on.",
      "Marker note: scrub it with a little bleach. Rinse it well before you fill it. Below it: keep the tank in the shade so nothing grows inside.",
    ],
    generator: [
      "Warning plate: run it outside only. The fumes are poison in a closed room. A masking tape label sits below the plate: check the oil before every start.",
      "Taped note: it is loud, and walkers hear it from far away. Below it, someone added a plan. Run it in the day, and shut it off at night.",
    ],
    gunParts: [
      "A tag from the police armory, signed by Sergeant Vega. The parts are wrapped in oily paper. A note on top says: keep it clean and dry.",
      "Written on the box: always check that it is empty before you clean it. Below it, in bigger letters: point it at the ground, never at a person.",
    ],
    armorPlate: [
      "Stenciled on the plate: steel, heavy. It is not kidding about heavy. A chalk note: bolt it onto the van door at chest height.",
      "Sticky note: a plate stops grabbing hands, not crashes. Marker lines along one edge count every dent it has taken. There are a lot of lines.",
    ],
    books: [
      "Stamped inside the first cover: Public Library, please return. Mrs. Greer's note is taped to the top of the box: reading saved this building. She signed it with a small star.",
      "Box label: field guides, first aid, small engines, poems. Sticky note: the first aid book is the one with the folded corners. Somebody needed it in a hurry.",
    ],
    maps: [
      "Folder label: city maps, streets and the river road. Someone traced the river road north in red pen. Next to the line, in capital letters, one word: CONVOY.",
      "Pencil marks on the map: a red R next to some buildings. Ruby's note is on the back. A red R means I have been inside. The number means walkers.",
    ],
  };

  T.recap = {
    haul: "We brought home {items} items and {scrap} scrap from today's trip.",
    nothing: "We came home with empty hands this time, but we all came home.",
    notes: "You read {notes} new notes out there today.",
    keys: "You found {keys} stash keys, so a locked door somewhere just got easier.",
    food: "We have {food} food left in storage after supper.",
    hungry: "We are out of food, so the van is weaker on the next trip.",
    next: "The next build is the {room}, and it still needs {needs}.",
    ready: "Everything is here to build the {room}, so head to the computer.",
  };

  // The cabin inside: what the Hollis family left on the walls, one note per room (facts: W.HOUSE_NOTES),
  // and the computer's House tab (facts: W.HOUSE_UPGRADE_FACTS).
  T.house = {
    notes: {
      porch: {
        title: "The Bell on the Porch",
        text: "A carved wooden sign by the front door says THE CABIN. Under it, smaller, it says THE HOLLIS FAMILY. Dan Hollis hung a big iron dinner bell on the porch. The kids could hear it all the way from the woods. A note under the bell says: ring for supper. June added her own line in chalk. The bell carries far, and walkers come to it. Ring it only when you are ready to fight.",
      },
      foyer: {
        title: "Five Hooks by the Door",
        text: "Five hooks line the wall by the door. Each has a name painted over it. The names are Kate, Dan, Gus, and Finn, and a low hook says Lucy. A paper tag hangs on the last hook. It says: last one out locks the door. Every hook is empty now. The Hollis family took their keys with them when they left.",
      },
      office: {
        title: "Kate's Map Desk",
        text: "Kate Hollis worked at this desk. She drew maps for the county. Rolled-up maps still lean in the corner. A sticky note on the screen says the computer runs off a big battery. The battery sits in the closet. Now June keeps the base plans on it. The rooms, the van, the guns, and the traps are all in there. If you want to build something, start here.",
      },
      dining: {
        title: "The Chore Chart",
        text: "A chore chart hangs on the dining room wall, dotted with gold stars. Gus washed the dishes, and Finn took out the trash. Lucy fed Biscuit, the dog. Lucy has the most stars by far. Someone crossed out one of Gus's stars, and nobody wrote down why. Pip added a new row at the bottom in pencil. It says: Pip feeds the dog we do not have yet.",
      },
      kitchen: {
        title: "Kate's Note on the Fridge",
        text: "A magnet shaped like a fish holds a note on the fridge. Kate wrote it the morning the family left. We are going north with Sergeant Vega and the River Convoy. We took Biscuit, our go bags, and the last of the canned peaches. If you find our cabin and you are kind, it is yours now. Please keep the garden going. —Kate",
      },
      pantry: {
        title: "Dan's Shelf Labels",
        text: "Dan Hollis put a label on every shelf: beans, rice, peaches, flour. He used a label maker, and the letters are perfectly straight. Most of the shelves are bare now. The labels are still there, waiting. The crew keeps count of the food in here. Everything else in storage gets counted here too, item by item.",
      },
      pingpong: {
        title: "The Ping Pong Scoreboard",
        text: "A chalk scoreboard hangs over the ping pong table. The last game reads Finn 21, Dad 19. Under it, in Dan's writing, it says: rematch on Sunday. The rematch is still waiting. Tomas and Pip play here now, and they keep score on the same board. Pip says the table leans to the left, which is why Pip loses.",
      },
      masterBath: {
        title: "A Heart on the Mirror",
        text: "Someone drew a heart on the bathroom mirror in red marker. Three names are inside it: Gus, Finn, and Lucy. A list is taped by the sink. It says: brush your teeth for two whole minutes, Lucy. June left the list up. She says some rules are worth keeping, even in a house full of strangers.",
      },
      master: {
        title: "The Wedding Photo",
        text: "A photo hangs over the big bed. It shows Kate and Dan Hollis on their wedding day by the river. They are laughing at something. June says whoever is hurt the most gets this bed. A nap here heals you all the way. But it takes time, and the walkers keep coming while you sleep.",
      },
      living: {
        title: "Lines on the Door Frame",
        text: "Pencil lines on the door frame show how tall the kids grew each year. Gus has the top line, near the very top of the frame. Lucy's lowest line says age 3. Pip stood against the frame for a new mark. It came up between Finn and Gus. The radio shelf used to stand here by the couch. Then Pip carried it to the dining room, where the crew eats.",
      },
      gusRoom: {
        title: "Gus's Keep Out Sign",
        text: "A sign by the door says: Gus's Room. Keep Out. This Means You, Finn. Gus is sixteen. He left behind a guitar with two broken strings. It still leans in the corner. Tomas sleeps in here now. He says the sign still counts, only now it means Pip.",
      },
      finnRoom: {
        title: "Finn's Treehouse Plan",
        text: "Finn drew a plan for a treehouse and taped it on the wall by his bed. It goes in the woods past the fence. The plan has a rope ladder and a lookout at the top. A bucket on a pulley hauls things up. Every part has a label in careful letters. Pip wants to build it someday, after the fence is strong.",
      },
      lucyRoom: {
        title: "Lucy's Dog Drawing",
        text: "A crayon drawing is taped on the wall beside the bed. It shows a dog with big floppy ears. The top says: MY DOG BISCUIT. Under it, Lucy wrote that Biscuit can sit, shake, and roll over. Pip pinned a second drawing right next to it. It is a dog too, but it has no name yet.",
      },
      playroom: {
        title: "The Chalkboard Rule",
        text: "The play room has a little desk with an old typewriter on it. A chalkboard hangs on the wall. On the board Kate wrote: practice your typing for ten minutes a day. Keep your fingers on the home row. Lucy wrote her name ten times under it, bigger each time. The typewriter still works if you press hard.",
      },
      coatCloset: {
        title: "The Go Bag List",
        text: "A list is taped inside the coat closet door. At the top it says: the go bag. Below that: water, a flashlight, batteries, Biscuit's leash, and the photo album. At the bottom, underlined twice, is one more line. If we get split up, meet at the river dock by the convoy trucks.",
      },
    },
    upgrades: {
      doors: {
        desc: "The cabin has two doors to the yard. One is the front door on the porch. The other is the back door in the play room. Walkers pound on a closed door until it breaks. An open door lets them walk right in. A door starts with 150 strength.",
        next: [
          "A thick wooden bar goes across each door. Door strength rises from 150 to 260.",
          "Steel sheets are bolted onto both doors. Door strength rises to 400.",
          "Steel security doors replace the old ones. Door strength rises to 560.",
        ],
      },
      windows: {
        desc: "The cabin has many windows. Walkers smash the glass fast and climb in. You cannot climb out through a broken window. Glass starts with 50 strength.",
        next: [
          "Boards go up over the glass. Window strength rises from 50 to 140.",
          "Metal shutters go up over every window. Window strength rises to 240.",
          "Steel plates with a narrow slot cover every window. Window strength rises to 380.",
        ],
      },
    },
  };

  /* River Landing (js/river.js): the fishing pole's tag, the sign by the parking, the chief's note on the
     dock post, and the city map's line. Facts: WORLD.RIVER_FACTS in js/story-home.js. */
  T.river = {
    blurb: "A wooden dock at the end of a dirt road, right on the river. With a fishing pole, every fish you catch is food.",
    rod: { name: "Chief Dunn's fishing pole", tag: "Chief Dunn's fishing pole, with his name on the tag. His crew fished at River Landing on their days off. Take River Road and turn onto Frog Lane. It is between Greenhouse Row and the Water Tower. Past the corner the pavement ends, and a dirt road runs down to the river. Park on the dirt and walk to the dock." },
    sign: { title: "RIVER LANDING", text: "River Landing: fishing dock and parking. Fish from the dock, out past the reeds. Keep 4 fish at most and let the rest grow. Do not drink the river water." },
    note: {
      title: "Fishing, the station way",
      text: "For my crew.\n\nCast from the end of the dock, where the water is deep. Then watch the float. When it dips under, pull right away. A slow pull loses the fish every time.\n\nNeed both hands? Prop the pole on the bank. Its bell rings when a fish bites. The fish stays on until you grab it.\n\nWalkers come out of the trees behind you, so look back between bites.\n\nTake 4 fish at most. Then let the river rest for 3 days.\n\n—Chief Dunn",
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
