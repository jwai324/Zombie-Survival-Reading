/* Reading level 5: home. Yard lot signs, June's journal, the radio, item tags, and the day recap.
   Facts: js/story-home.js. See docs/TEXT_GUIDE.md. */
(function (root) {
  root.ZSR = root.ZSR || {};
  root.ZSR.TEXT = root.ZSR.TEXT || {};
  const T = (root.ZSR.TEXT[5] = root.ZSR.TEXT[5] || { level: 5 });

  T.yard = {
    lots: {
      garden: {
        title: "Garden plot",
        empty: "GARDEN, someday. June painted those words on a scrap of board and pushed it into the dark dirt behind the cabin. Stakes and string mark out beds as neat as the lines in a notebook, though nothing grows in them yet. June noticed this soil on the second day, and she has been waiting ever since. Raised beds of seeds and soil here would grow food. That matters, because every trip in the van eats food, and the cupboard only empties on its own. To build the first bed, bring home 2 seed packets, 1 bag of soil, and 40 scrap.",
        built: [
          "GARDEN, says the sign, and this time it is true. One raised bed is planted with seeds, and tiny green shoots have pushed up through the soil like fingers testing the air. June checks it every morning, kneeling in the dirt with her ledger on her knee. It grows 1 food each day. That is not a feast, but it means the cupboard is never quite as empty as the road makes it. One more seed packet, one more bag of soil, and 80 scrap would add more beds.",
          "The sign still says GARDEN, but the plot has grown. Now there are more beds, and bean vines climb the string like kids racing up a rope in gym class. June hums while she weeds, and Tomas says it is the happiest sound in the yard. The garden grows 2 food each day now, enough that one bad trip does not mean an empty supper. June says the last step needs water that does not come from a bucket. Bring 2 seed packets, 1 bag of soil, 1 water tank, and 120 scrap.",
          "GARDEN, says the sign, and June finally has her full garden. A water tank feeds the beds through a hose, so the soil stays dark and damp even on the hottest afternoons. Tomatoes hang heavy as red lanterns, and squash leaves spread wide enough to hide Pip's boots. It grows 3 food each day. On good days June carries the harvest in her apron, because no basket is big enough. She says this is what she pictured on the first night, when the dirt was only dirt.",
        ],
      },
      farm: {
        title: "Farm field",
        empty: "FARM, after the Garden and the Well. Tomas painted the sign in letters so big they almost ran off the board. A wide patch of grass lies past the garden. A stake marks each corner, like the frame of a picture nobody has drawn yet. A crop field here would grow food on top of the Garden, and later it could hold animals too. It stays locked for a reason, because crops need clean water and a garden that already works. Build Garden 2 and the Well first. Then bring 2 seed packets, 2 bags of soil, 1 lumber, and 80 scrap.",
        built: [
          "FARM, reads the sign, and the grass is gone. In its place is a crop field of corn and beans. The long rows run as straight as lines on a road map. The corn rustles at night, which made Pip jumpy for the whole first week. Now Pip says it sounds like the field is whispering secrets. It grows 2 food each day on top of the Garden, so the van rarely has to leave hungry. Next comes a chicken coop, which needs Well 2, plus 2 lumber, 1 spool of wire, 1 seed packet, and 120 scrap.",
          "FARM, says the sign, and the farm is loud now. A chicken coop with wire walls stands at the end of the rows. The hens start complaining at dawn, like an alarm clock nobody can switch off. Pip collects the eggs every morning and counts them out loud, one by one, like a bank teller. The farm gives 4 food each day, and breakfast is no longer just beans. Tomas wants goats next. That means Well 3, 3 lumber, 2 spools of wire, 1 water tank, and 180 scrap.",
          "FARM, reads the sign, and the yard has a few stubborn new neighbors. A goat pen stands past the coop, with a trough fed from the Well, so the water never runs dry. The goats will eat almost anything, including, once, the corner of June's ledger. Pip says goats are almost as good as a dog, though Pip still wants the dog. The farm gives 6 food each day. On most nights now, nobody at the cabin goes to bed hungry, and June has stopped frowning at the cupboard.",
        ],
      },
      well: {
        title: "Well site",
        empty: "WELL, dig after the Water room is built. June painted the sign herself and set it beside a ring of stones next to the cabin. The stones sit in a careful circle, like a promise waiting to be kept. Water from deep underground comes up cold and clean, so you would heal faster in the yard. The well stays locked until the Water room stands, because you should learn to clean water before you dig for more. The Farm and the Lab both need the Well first. To dig, bring 2 lumber, 1 tool kit, and 60 scrap.",
        built: [
          "WELL, says the sign, and now there is a hole in the ground worth having. It is a hand-dug well lined with lumber, with a bucket on a rope. Drop the bucket, and a splash echoes far below, like a coin landing in a very deep pocket. Its clean water helps you heal faster in the yard. Tomas says the crank squeaks like the old cabin door did. Next, a hand pump would bring the water up faster. It needs 2 lumber, 1 set of engine parts, 1 water filter, and 100 scrap.",
          "WELL, reads the sign, but the bucket and rope are gone. A hand pump with a filter now brings the water up, cold and clear, after a few strong pushes on the handle. Pip likes to pump it until the handle groans in protest. You heal in the yard even faster now, because cleaner water helps a body mend quicker. The last step is a wired pump that fills a tank by itself. It needs 1 water tank, 1 set of engine parts, 1 spool of wire, and 150 scrap.",
          "WELL, says the sign, and the well practically runs itself. A wired pump hums softly and fills a tank, so clean water is always waiting, even after the longest trip. You heal in the yard faster than ever, and you start every building at full health. That changes how a trip feels. You walk through each door strong and steady, like someone who slept well, even on the nights you did not. June calls the well the quiet hero of the yard, because nobody notices it until it stops.",
        ],
      },
      water: {
        title: "Water station",
        empty: "WATER, filter goes here. Tomas painted the sign and nailed it above an empty barrel that sits on two sawhorses by the cabin wall. Right now the barrel catches nothing but leaves and gray rainwater that smells like an old sock. A filter and a tank here would turn that gray rainwater clear, so you heal faster while you are in the yard. Without clean water, every scrape stays a scrape until you find a medical kit. To start, bring 1 water filter and 40 scrap, and the barrel finally gets a job.",
        built: [
          "WATER, says the sign, and the barrel is finally useful. A filter on top of the barrel turns gray water clear. It works one slow drip at a time, like a clock that counts in drops. You slowly heal in the yard. It is not fast, but it is steady, and steady keeps a crew alive. A big tank would hold more water and heal you faster. It needs 1 water tank, 1 water filter, and 80 scrap, and Tomas has already cleared a spot for it.",
          "WATER, reads the sign, and now there is plenty of it. A filter and a big tank stand together against the cabin wall, full of clean water. It tastes like nothing at all, which is exactly how water should taste. You heal faster in the yard, because a full tank means nobody has to ration a sip after a hard day. One more filter would finish the job. It needs 1 water tank, 2 water filters, and 120 scrap, so keep an eye out at the Water Tower.",
          "WATER, says the sign, and the station is complete. Two filters and a tank work side by side, so the water runs clear even after a storm stirs up the barrel. You heal even faster in the yard, and you walk into every building at full health. That means each trip starts with a clean slate instead of yesterday's bruises. Tomas tapped the tank with a wrench, and it rang like a bell. He claims that is a good sign, and nobody has the heart to argue.",
        ],
      },
      power: {
        title: "Power pole",
        empty: "POWER, lights first. Tomas painted the sign and hung it on a bare pole by the shed. An old coil of rope lies at its foot like a sleeping snake. Fuel, wire and lights here would let the map show how dangerous each place is before you drive there. Knowing the danger first means fewer nasty surprises at a door. Later a generator could do even more, out on the road. To start, bring 2 fuel cans, 1 spool of wire, and 60 scrap.",
        built: [
          "POWER, says the sign, and the pole finally does something. Fuel cans, wire, and a string of working lights run from the shed to the cabin. After dark they glow like a row of small moons. Because of them, the map shows the danger of every place, so you know what waits before you go. Pip calls it the worry meter. Next comes a generator, which would also turn up supplies on the road. It needs 1 generator, 2 fuel cans, and 100 scrap.",
          "POWER, reads the sign, and the yard has a heartbeat now. A generator hums under a tin roof, steady and low, like a big animal purring in its sleep. The map shows danger, and you find one supply crate on every drive. Those crates add up fast, the way pennies fill a jar. More wire could run power all the way out to the van. It needs 2 spools of wire, 3 fuel cans, and 150 scrap, and Tomas has already measured the distance twice.",
          "POWER, says the sign, and the wires reach farther than ever. More wire runs out to the van, which now has headlights. They cut through night and fog like a knife through bread. The map shows danger, you find two supply crates on every drive, and the dark no longer owns the road. Night drives used to feel like driving into a closet with the door shut. Now the way ahead is bright. Tomas says the van has never looked so proud of itself.",
        ],
      },
      radio: {
        title: "Radio mast",
        empty: "RADIO, Pip's job. Pip painted the sign in careful capital letters. It leans against a tall post in the yard, and a ladder leans there too. A radio mast here would pick up voices from town, voices that have been talking into the static for months. The voices would tell you where places are, so they show up on the map. Pip has already cleared a shelf for the logbook, just in case. To build it, bring 1 box of radio parts, 1 spool of wire, and 50 scrap.",
        built: [
          "RADIO, says the sign, and the post has become a mast. A short mast with an antenna and a receiver crackles to life every evening. It pulls words out of the hiss like fish out of muddy water. Pip writes down every voice, along with the time and the weather. It finds three new places on the map. A taller mast would reach all over town. It needs another box of radio parts, 2 spools of wire, and 100 scrap, and Pip reminds everyone daily.",
          "RADIO, reads the sign, and the mast stands taller than the cabin roof. It reaches all over town now, so voices arrive from rooftops, towers and basements every night. It finds every place on the map. Pip sits by the receiver with a sharp pencil, ready, like a goalie waiting for the ball. The last step needs one thing you will not find on a shelf of wires: books. Bring 1 box of radio parts, 2 spools of wire, 1 box of books, and 150 scrap.",
          "RADIO, says the sign, and below the tall mast stands a shelf of books. Pip uses them to keep the logbook of voices, matching each name to a place and a day. Because of that logbook, the radio finds every place, and it shows which places still have items. That saves wasted trips to buildings that have been picked clean. Pip says a voice is just noise until someone writes it down. June says that is the smartest thing anyone has said all month.",
        ],
      },
      lab: {
        title: "Lab corner",
        empty: "LAB, after the Medbay and the Well. June painted the sign and leaned it against an old bench in a shady corner. Beside it, a row of empty jars catch the light like glass eyes. Herb beds and a still here would make medical kits at home, so there are fewer trips to the hospital. Fewer trips means fewer chances to get hurt. The lab stays locked until the Medbay and the Well are built. Then bring 1 medical kit, 1 box of books, 1 seed packet, and 80 scrap.",
        built: [
          "LAB, says the sign, and the corner smells green now. Herb beds grow mint and yarrow in tidy rows, and a copper still drips beside them, slow as honey off a spoon. It makes 1 medical kit every 2 days, which June calls medicine on a payment plan. A clean bench would make kits faster. That needs Well 2, plus 1 water filter, 1 box of books, 1 spool of wire, and 120 scrap. June has already cleared a spot in the shade.",
          "LAB, reads the sign, and the corner looks almost like a real clinic. A clean bench stands in the shade, with a sink that runs filtered water, so nothing gets dirty before it gets used. It makes 1 medical kit each day. June scrubs the bench so often that you could see your face in it. A powered lab would double that. It needs Medbay 2, plus 1 generator, 2 medical kits, 1 box of books, and 180 scrap.",
          "LAB, says the sign, and the corner hums. A powered lab runs off a generator, with lamps that never flicker and a small fan that keeps the air moving. It makes 2 medical kits each day. Because of that, a cut or a bad fall no longer means a risky trip uptown for medicine. The kits stack up in storage like a wall of quiet insurance. June says Doc Lin would be proud. Pip says the lab sounds like a beehive, only less likely to sting.",
        ],
      },
    },
  };

  T.journal = [
    {
      title: "Day One by Candlelight",
      text: "My name is June. This green ledger is the only clean thing I own, so I am writing in it by candlelight. The van rolled into the yard on its last drops of fuel. Tomas talked to the engine the whole way, coaxing it like a nervous horse, and I think it listened. The cabin sits at the south end of town. It is empty and dry, with a woodstove and a door that still locks. After weeks of broken doors, the click of that lock sounded like music. Pip fell asleep on the bench before the bags were even inside, one shoe still on. You took the first watch at the window. I lay awake listening for trouble, but nothing came. For one whole night, nothing came.",
    },
    {
      title: "The Cabin in Daylight",
      text: "In daylight, the cabin turned out to be bigger than it looked last night. It is a whole family house with a porch out front. The roof is sound, which matters more than size when the rain comes. An old fence circles the yard like a tired arm around a shoulder. Some of its boards are loose, and Tomas has already counted them twice. I noticed the dirt first, though. Behind the cabin it is dark and good, the kind that crumbles in your hand and smells alive. Tomas teased me for kneeling in it before breakfast. Then I took a pencil and wrote our first rule on the inside of the door. Say where you are going before you go. Pip read it out loud three times and named it June's Rule Number One. Nobody argued.",
    },
    {
      title: "Old but Honest",
      text: "Tomas spent the whole morning under the van, with only his boots sticking out like a pair of question marks. When he finally slid out, he was smiling, with grease up to his elbows. He says the van is old but honest, like a good mule. It will not win any races, but it will not lie to you either. Then you drove out to look for supplies. I stood at the window and watched the road until the van came back, and I did not sit down once. Pip says I looked like a hawk on a fence post, so now I am June the Hawk. Pip counted the minutes you were gone and wrote the number on the wall in pencil. Next time, Pip says, that number has to be smaller.",
    },
    {
      title: "Walkers at Dusk",
      text: "The first walkers came to the fence at dusk. We heard them before we saw them, a dragging shuffle like wet leaves pushed by the wind. They came in a group and pushed at the boards until the whole fence groaned. Then, as suddenly as they arrived, the yard went quiet for a while. Tomas whispered, 'Write this down, June.' So here is what I learned today. They come in waves, with calm in between, like the tide at the beach where I grew up. The calm is not peace. It is only a breath before the next push. So a new rule went on the door: no shouting in the yard, because walkers follow sound. Pip whispered the rule twice, just to practice being quiet.",
    },
    {
      title: "Where Everyone Went",
      text: "Pip asked me tonight where everyone in town went. It is the kind of question that sits on your chest like a cat that refuses to move. I took my time. I said some people left, some people hid, and some people are still out there helping each other. I believe that last part, or I would not have said it. Pip thought about it while poking the fire with a stick. Then came the next question: could we keep a dog if we found one? I said a dog would need to eat too, and food does not grow on fences. Pip nodded seriously and said a dog would also need a name. I could not argue with that logic. Tomas laughed so hard he snorted. 'June, you lost that one,' he said.",
    },
    {
      title: "Fence Before Supper",
      text: "The days have a rhythm now, steady as a heartbeat: drive out, come home, hold the fence. I am learning to like it, the way you learn to like a song you have heard too often. Today the walkers opened a hole near the gate. A hole in the fence does not close by itself, no matter how hard you glare at it. Someone has to patch it with scrap, nail by nail. So I made it a rule, and Pip wrote it on the door in very large letters: patch the fence before supper. A full stomach makes you lazy, and lazy is how holes grow. Supper was beans again. Nobody complained out loud, but Pip asked, 'June, are beans a food group or a punishment?' I am still deciding.",
    },
    {
      title: "Before the Fall",
      text: "Before the Fall, I was the gardener at a school. Pip finds this hilarious and says June the Gardener sounds like a superhero with a very small cape. Maybe so, but my hands remember the work. I want raised beds behind the cabin, with beans, squash and tomatoes, all lined up like students in a class photo. The dirt is ready. What I lack is seeds. My old friend Rosa ran the greenhouses at Greenhouse Row, west of the gas station. She could grow roses in a parking lot and tomatoes in a teacup. If anyone still has seeds, it is Rosa. I am as sure of that as I am of the sunrise. If you drive west, look for her, and tell her June sends her love.",
    },
    {
      title: "The Red R",
      text: "There is talk of a scout named Ruby who paints a red R on buildings all over town. Next to the R, she writes how many walkers she saw inside. It is a simple system, but it could save a life, like a lighthouse made of paint. Pip spent the whole afternoon practicing. Pip painted the R on a board, over and over, with a number next to it each time. The early ones looked like a pretzel in a hurry, but the last one was very good. Tomas hung it by the gate as a joke. I am not laughing at the idea, though. A stranger who leaves warnings for other strangers is a good sign. It means kindness is still out there. 'You like her already, June,' Tomas said. He is right.",
    },
    {
      title: "Wire and Stubbornness",
      text: "Tomas told me about his father tonight. His father was a mechanic who learned the trade from Mr. Ortiz at Ortiz Auto, on the east side of town. Tomas learned it from his father the same way, lying under cars and handing over wrenches before he could spell the word. He says engines are like people. They grumble, but they tell you what is wrong if you listen. Today he fixed the van's loose mirror with wire and stubbornness, which seem to be his two favorite tools. The mirror no longer shakes like a nervous leaf. Then he went quiet. He hopes Mr. Ortiz is still out there somewhere, under a truck, still arguing with bolts. 'Write that down, June,' he said. So I did.",
    },
    {
      title: "Rain on the Roof",
      text: "It rained all day, hard and gray, as if the sky were trying to wash the whole town clean. The roof leaked in two spots, one over the bench and one right above my chair, which felt personal. We put pots under the drips, and they played a slow, plinking song all afternoon. Then we played cards by the stove. Pip won every game and would not explain how, only grinned like a fox in a henhouse. Tomas checked Pip's sleeves for hidden cards and found nothing but lint. I have decided not to ask. Here is what I want to remember. A rainy day with everyone inside is a good day. Nobody had to drive out, and nobody had to wait at the window. 'You are smiling, June,' Tomas said. I was.",
    },
    {
      title: "Static and Voices",
      text: "Pip found an old radio dial in a kitchen drawer, under a tangle of string and dead batteries. It was not attached to anything, but Pip turned it for an hour anyway, holding it close to one ear. There was only static, a long dry hiss like sand pouring out of a bag. Still, Pip is sure there are voices out there. People say someone named Jo talks on the radio from a rooftop, reading the news to anyone who will listen. Pip believes it completely. So now Pip has started a list of every voice the crew hears. The first name on it is June. I am honored, and also a little suspicious, because Pip wrote my name in purple crayon and drew a crown over it.",
    },
    {
      title: "Sunflowers by the Fence",
      text: "Today I remembered my school garden, out of nowhere, while I was hanging laundry. One spring, the kids planted sunflowers by the fence. By summer, those flowers stood taller than the principal, nodding over the fence like curious neighbors. I taught the kids to plant a seed one finger deep and to water it every day. They did, even when nothing seemed to happen. Especially then, I told them, because roots grow first, where nobody can see. I wonder where those kids are now. Some of them would be grown, taller than the sunflowers. I hope they remember the sunflowers. I hope they remember that waiting is part of growing. Pip found me staring at a wet shirt and asked if I was okay. 'June is fine,' I said. 'Just remembering.'",
    },
    {
      title: "Counting the Food",
      text: "Every night I count the food and write the number in the ledger. The numbers march down the page like soldiers, and some nights the line gets very short. Here is the math I keep coming back to. Every trip in the van eats food, because nobody drives well on an empty stomach. A hungry crew makes a weak van, and a weak van brings home less. It is a circle, and it can spin the wrong way fast. So the rule is simple: everyone eats the same, even when there is not much. Tonight there was not much. Tomas gave Pip half his bread anyway, sliding it across the table when he thought nobody was looking. I pretended not to see. Some rules June is happy to watch bend.",
    },
    {
      title: "Talk of the Convoy",
      text: "There is talk in town of the River Convoy, a line of boats and trucks. A police sergeant named Vega is getting it ready to leave north along the river road. People say there are safer towns up north, with walls and gardens and doctors. Tomas lit up like a lamp when he heard. He wants to see if the van could make the trip, and he has already started a list of parts. I understand. He is seventeen, and the road feels like an open door. But I am not sure I want to leave the cabin. I have planted my heart here like a seed, and seeds do not like being dug up. Pip asked, 'June, do you want to go?' I said I need to think about it.",
    },
    {
      title: "Half a Month",
      text: "The cabin door has squeaked since the first night, a long, sad squeal like a cat stepping on a whistle. Today Tomas fixed it with a strip of wire and some cooking oil. Now it swings open without a sound, which feels almost spooky. I told him he would fix the moon if someone handed him a ladder. Pip looked up from the floor, very worried, and asked if the moon was broken. We laughed until the beans went cold. Then I opened the ledger and did the math. We have lasted half a month at the cabin. That is longer than anyone guessed, including me, and I am usually the hopeful one. Half a month of locked doors and full nights. I am proud of this crew. June",
    },
    {
      title: "The Hardest Night",
      text: "Last night was the hardest night yet. I am writing this with shaking hands, so forgive the messy letters. The walkers came at the fence from every side at once, like water pressing against a dam. The boards cracked, one after another, sharp as snapping branches in the dark. Nobody panicked. Everyone stayed in place, Tomas at the gate, you along the back, and me with the lantern by the door. The fence held until morning, and when the sun came up, the yard was quiet. Pip slept in the closet with a pot on their head and called it a helmet. I found Pip there at dawn, still snoring, the pot tipped over one eye. Pip says the helmet worked. June agrees, completely.",
    },
    {
      title: "People Like That",
      text: "There is talk of a doctor named Doc Lin who carries medicine around town. Doc Lin goes between the grocery, the pharmacy and the hospital, on foot, with a heavy bag over one shoulder. Imagine walking those streets on purpose, again and again, so that strangers can get better. People say there is a nurse named Ada too. She stayed at the hospital, St. Anne Annex, up in the north hills, to keep the generator running. Everyone else left, but she stayed, like a candle someone forgot to blow out. Pip asked if they were heroes. I said they are people who decided to keep working. People like that are the reason the town is not gone. June believes that, and so should you.",
    },
    {
      title: "Frost on the Windshield",
      text: "This morning there was frost on the van's windshield, thin and white, like lace someone spread out overnight. Tomas scraped it off with an old library card he found in the glove box. He says the card finally earned its keep, since nobody had checked out a book with it in years. The cold got into my knees and stayed there. Cold mornings mean the crew needs blankets before it needs anything else. You cannot think about food or fuel when your teeth are chattering like a typewriter. So blankets go at the top of the list, above beans and nails. Pip drew a dog in the frost on the window, with floppy ears and a long tail. Pip named it Frost. June approves of the name.",
    },
    {
      title: "Ms. Adler Counts Heads",
      text: "There is a story going around about a teacher, Ms. Adler, who led her whole class out of Lincoln Middle School when the halls filled with walkers. People say she took them to the Public Library and kept them there. A whole class, crossing town like a line of ducklings behind their mother. But two of her students got separated from the class. They are twins, named Max and Mia, and nobody knows where they are. That part keeps me awake. I worked in a school for years. A good teacher counts heads every hour, even when she is tired, even when she is scared. I hope Ms. Adler is still counting, and I hope her count comes out right someday. June, school gardener, signing off.",
    },
    {
      title: "What We Carry",
      text: "Pip asked a big question tonight, the kind that lands on the table like a heavy stone. Is the world ever going to come back? Tomas stopped chewing. I put down my spoon and took a moment, because Pip deserves the truth and not a bedtime story. I said some of it will come back, the parts people carry with them. Buildings fall and roads crack, but what you know and who you love can travel. Pip thought about that for a long time. Then came the second question: which parts is the crew carrying? I pointed at the door first. The rules on the door, I said. The seeds, when we find them. And each other. Pip nodded slowly. June hopes that answer was good enough.",
    },
    {
      title: "The Rules on the Door",
      text: "After supper, I read the rules on the door out loud, the way my old principal used to read the morning news. Say where you go. No shouting in the yard. Patch the fence before supper. Everyone eats the same. Four rules, written in different hands, and every one of them was learned the hard way. Pip listened with arms crossed, like a judge at a contest. Then Pip said we needed one more: take what you need, leave the rest. I smiled, because that one is not ours. That is the town's rule, the one the whole key ring is built on. But it is a good one, maybe the best one. So it goes on the door too. Pip wrote it at the bottom, big enough to read from the yard. June",
    },
    {
      title: "Messages for Each Other",
      text: "Pip keeps asking about Ruby and her younger brother, Dev. After every trip, the first question is the same: any news? People say Ruby is looking for Dev, crossing town from one end to the other. And Dev leaves messages for her, on walls and counters and doors, like breadcrumbs in an old fairy tale. Pip has thought about this very carefully, the way Pip thinks about everything important. Pip says if they keep leaving messages, they will find each other. It is just a matter of time and paper. I know how big this town is, and how many walkers stand between those walls. Tomas raised an eyebrow at me. But June did not argue. Some hopes are worth guarding, like a match in the wind.",
    },
    {
      title: "Listening to the Engine",
      text: "Tomas is teaching Pip to listen to the van's engine. They stand by the open hood every morning, heads tilted like two birds listening for worms. Tomas says an engine talks all the time, if you know its language. A tick means one thing, usually something small. A knock means another, and that one makes Tomas frown. A squeal means stop right now, no arguments, no matter where you are. Pip has memorized all three and quizzes me at breakfast. I have failed twice. Now Pip says hello to the van every morning, very politely, and pats the hood like the neck of a horse. Tomas says the van likes it. I asked how he knows. He says it starts faster. June is not convinced.",
    },
    {
      title: "An Honest Ledger",
      text: "My knees ache on cold mornings. They creak like the old porch steps at my school, and they tell me the weather before the sky does. My hands are starting to complain too. So today I showed Pip how to keep the ledger, just in case my hands get stiff. We sat at the table with the green book open between us. I showed Pip where the food count goes, where the trips go, and where the rules go. Pip's writing is big and messy, with letters that lean on each other like tired friends. Pip apologized for it. I said that is fine. A ledger only has to be honest, not neat. The truth does not need pretty handwriting. June, a teacher again, for one afternoon.",
    },
    {
      title: "A Bowl by the Gate",
      text: "A dog barked somewhere past the trees last night. Three short barks, then silence, then one more, like a question asked into the dark. Pip was out of bed before the echo faded. Pip stood at the window for an hour, listening, nose almost touching the cold glass. Nothing else came. In the morning, Tomas tried to help. He said a dog that survived this long is smart enough to find the crew if it wants to. Dogs know where the kind people are, he said, because they can smell it. I do not know if that is true, but Pip believed it, and that was the point. Pip left a bowl of water by the gate, just in case. June checked it twice today. Still full.",
    },
    {
      title: "Stories in the Wind",
      text: "The wind came hard from the north last night. It rattled the windows all night, like someone outside wanted very badly to come in. Nobody could sleep, so we gave up trying. The crew pulled chairs close to the stove and told stories by its glow. Tomas went first. He told one about his father's garage, where the radio was always on and the coffee was always burnt. I could almost smell the oil. Then I told one about my school garden. One year a pumpkin grew so big it would not fit through the gate. Pip went last. Pip told one about a dog that drives a van, wears goggles, and never runs out of fuel. It was the best story by far. June gave it a gold star.",
    },
    {
      title: "Reading by the Window",
      text: "I think about my old students when I write. Their names come back to me one at a time, like birds landing on a wire. Some of them were quiet. Some of them were loud enough to rattle the greenhouse glass. If any of them made it, maybe they are in the library with the others, the class that people talk about. I hope so. It helps to picture them reading by the window, with sun on the pages and nothing at the door. Worry is a heavy coat, and that picture lets me take it off for a minute. Then I get up and do the next job. The fence will not mend itself, and the beans will not count themselves. June, back to work.",
    },
    {
      title: "What We Want",
      text: "Tomas says the van could make it up the river road if the convoy ever leaves. He has checked the tires, the belts and the fuel lines twice. He says it with a spark in his eyes, like a kid watching the road for a parade. So tonight I asked the crew a serious question: what do we actually want? Pip answered first, without even looking up. A dog. Tomas thought for longer. A garage, he said, with his own name painted over the door. Then they both looked at me. I said a garden, a real one, with roots that go deep. June keeps it simple. We talked until the stove burned low. In the end, we all agreed. The cabin is home for now.",
    },
    {
      title: "A Quiet Day",
      text: "A quiet day. Sun on the yard, wind in the trees, and no walkers at the fence for hours. The whole world seemed to be holding its breath, but in a good way, like the last long note of a song. I sat on the step and wrote slowly, letting each word take its time. Tomas whistled under the van, an old tune his father used to hum. Pip practiced knots on the fence rope, tying and untying them until the rope looked tired. Nobody rushed. Some people think quiet days are wasted days. They are wrong. Quiet days are not wasted; they are how you get ready for loud ones. You rest, you mend, you sharpen. Then the noise comes, and you are ready. June knows.",
    },
    {
      title: "We Are Still Here",
      text: "Tonight I read the ledger back to the crew, starting from the very first page. My handwriting changes as the pages go, from shaky to steady, like a road coming out of fog. Pip's big messy letters show up near the end. We listened to all of it: the frost, the rain, the hardest night, the bowl by the gate. Here is what it says, when you strip it down. We found the cabin. We kept it. And we kept each other, which was the harder job. Tomorrow is the same work as always: the van, the fence, the food, the rules on the door. Nothing fancy, nothing new. At the bottom of the page, I wrote one more line. We are still here, and that is a lot. June",
    },
  ];

  T.radio = [
    {
      title: "Jo on 88.1",
      text: "This is Jo on 88.1, talking from a rooftop downtown. If you can hear me, hello, and welcome to the only station still on the air. The wind up here is cold and the pigeons are rude, but the view is worth it. Every day I will read out news, warnings and tips for anyone still listening. Think of me as the town's bulletin board, only louder and with worse jokes. First, the most important thing I will ever say on this show. The town has a rule now: take what you need, leave the rest. Somebody after you is hungry too. Same time tomorrow on 88.1. Jo, signing off. At the cabin, Pip wrote Jo's name on the list of voices, right under June.",
    },
    {
      title: "How the Key Ring Works",
      text: "Jo here on 88.1, and tonight I want to explain the key ring. You have probably found a locked door in some store that would not budge, no matter how hard you pulled. That is a stash. The best supplies in each building are locked in a stash, so people who smash and grab cannot take them. Smashing gets you nothing but sore knuckles. The key to each stash is hidden in a different building, with a note that says where. Follow the note, find the key, and carry it across town to the right door. Ruby and I started the key ring together. Mr. Reyes from Reyes Hardware cut the first keys on his own machine. Here is the secret. Only people who read the notes find the keys.",
    },
    {
      title: "Tip: The Gas Station Key",
      text: "Good evening, this is Jo, and tonight I have a key ring tip. Grab a pencil, because I will only say it once, and the batteries on this rooftop are not getting any younger. The key hidden at Gas-N-Go opens the staff locker at Corner Grocery. Do not go tearing the gas station apart looking for it, either. The notes inside Gas-N-Go tell you where the key is, one note leading to the next, like stepping stones across a creek. Read them in order, and do not skip any. Then drive to the grocery, find the staff locker, and turn the key. Take what you need from it, and leave the rest for the next person who reads. Jo out, and good hunting.",
    },
    {
      title: "A Message from Ruby",
      text: "This is Jo, and tonight the mailbag has a message from Ruby. You know Ruby, even if you have never met her. She is the scout who paints the red R on buildings all over town. Here is what she asked me to read. Ruby is looking for her younger brother, Dev. He worked the counter at Gas-N-Go before everything went sideways. Ruby says he talks about engines the way other people talk about the weather, all day long. If you see Dev, tell him Ruby is still looking. Tell him she has not given up, not for one single day. And a reminder from Ruby herself: the number next to her red R is how many walkers she saw inside. Trust that number. Jo out.",
    },
    {
      title: "Hold On, Ada",
      text: "Jo on 88.1, passing along a message. This one goes out to Nurse Ada at St. Anne Annex, from Doc Lin. Ada, if you can hear this, here are Doc Lin's exact words: hold on, I am coming. Short and strong, like all the best messages. Now, for everyone else, a warning from me. St. Anne Annex is the most dangerous place in town. I am not saying that to be dramatic. I am saying it because people keep walking in like it is a shopping trip. The walkers there follow sound more than light. A flashlight will not wake them, but a dropped can will ring through those halls like a church bell. So move quietly inside, slow and soft. Jo out.",
    },
    {
      title: "Sergeant Vega Calling",
      text: "This is Sergeant Vega, speaking from the 4th Precinct. Jo was kind enough to patch me through, so I will keep this short. I have a lot of work and not much daylight. I am organizing the River Convoy. That means boats on the water and trucks on the river road, all heading north together. People say the towns up there are safer. We plan to leave in about ten days. That is not a promise, but it is a plan, and a plan is more than most people have right now. Here is what the convoy needs. Fuel, as much as you can spare. Boats, as long as they float. And drivers who can stay calm when the road gets ugly. Vega out.",
    },
    {
      title: "Doc Lin Borrows the Mic",
      text: "Hello, this is Doc Lin. Jo let me borrow the microphone tonight, so I will try not to sound like a lecture. I have a key ring tip, and it matters to me personally. The key hidden at Corner Grocery opens the narcotics safe at Mile 9 Pharmacy. Follow the notes at the grocery, and they will lead you to it. Now please listen carefully, because this is the part that counts. That safe holds strong medicine. In the wrong amount, it does more harm than good. I am asking you, as a doctor and as a neighbor, to take only the medicine you need from that safe. Someone sick will come after you. Leave them something to find. Thank you, and stay well.",
    },
    {
      title: "The Twins Are Looking",
      text: "Jo here, and tonight the message comes from two people at once. They are twins named Max and Mia, and they wrote it together, finishing each other's sentences on the page. Here is what they say. They got separated from their class at Lincoln Middle School, on the day the halls filled up and everyone ran. They have been looking ever since. They are tired, but they are not quitting. They are looking for their teacher, Ms. Adler. She is the one who always counted heads, they wrote, even on field trips to the park. Anyone who has seen Ms. Adler's class should leave a note at the school. Even a small note helps, because the twins check back when they can. Jo out.",
    },
    {
      title: "Walk, Do Not Run",
      text: "Jo on 88.1 with a warning, and you will want to remember this one. It is about Northgate Mall. The walkers there move in a group, like a flock of birds that turns all at once. And they come running at anyone who runs. It sounds backward, I know. Every part of you will want to sprint for the exit. Do not do it. Walk, do not run, and most of them stay put. Slow feet look like one of them. Fast feet look like a fire alarm. That tip comes from Luis, the mall guard who never left his post. He has watched that crowd longer than anyone, and he is still there to tell about it. Thanks, Luis. Jo out.",
    },
    {
      title: "Tip: The Seed Vault",
      text: "Jo again, with a key ring tip, and a big thank you to Mr. Reyes, who cut half the keys in this town with his own two hands. The key hidden at Reyes Hardware opens the seed vault at Greenhouse Row. The notes inside the hardware store will point the way, so read them before you start tearing up the paint aisle. I talked to Rosa about that vault, and she had a message to go with it. Take the seeds and plant them. Do not hoard them in a drawer, where they turn into expensive dust. And save some seeds for the next person. A seed you save today is a garden for somebody else next spring. Those are Rosa's words, not mine. Jo out.",
    },
    {
      title: "Nurse Ada Answers",
      text: "This is Nurse Ada, speaking from St. Anne Annex. Jo, thank you for the use of the frequency. I will be brief and exact, because the battery on this radio is precious. I stayed here to keep the generator running and the records safe. Every patient who came through these doors has a file, and every file matters to somebody. The generator still runs, and I check it every morning at the same hour. I heard Doc Lin's message. Lin, I am still waiting, and I am still here. To anyone who comes to the hospital, I ask one thing. Walk softly. The halls carry every sound, the way pipes carry water, and the walkers are always listening. Nurse Ada, signing off.",
    },
    {
      title: "Safe at the Library",
      text: "Good evening. This is Mrs. Greer, the librarian, speaking from the Public Library. I have never spoken on the radio before, so forgive me if I whisper. Old habits. I have wonderful news to share. Ms. Adler and her class are safe at the library. They arrived weeks ago, tired and dusty, and she counted every head at the door. The students read by window light every afternoon, because the lamps no longer work and the sun still does. They have finished half the adventure shelf already. And now, a message for two people in particular. Max and Mia, if you hear this, come to the library. Your teacher is here, and she has been waiting for you. Mrs. Greer, signing off.",
    },
    {
      title: "Chief Dunn Keeps the List",
      text: "Chief Dunn here, speaking from Station 12, the fire station. I work with Sergeant Vega on the River Convoy. Vega handles the plans, and I keep the lists. Lists of trucks, lists of boats, lists of names. If it can be counted, I have counted it twice. Now for the news, and it is not the news I wanted to give. The convoy is delayed, because one of the trucks needs new engine parts. A convoy is like a chain. It only moves as fast as its weakest link, and right now that link has a cracked engine. We will fix it. In the meantime, I have a job for you. Anyone who wants to leave should sign the list at Station 12. Dunn out.",
    },
    {
      title: "Tip: The Parts Cage",
      text: "Jo here, with another key ring tip, and this one is for the drivers out there. The key hidden at Greenhouse Row opens the parts cage at Ortiz Auto. Read the notes among the greenhouses, and they will lead you to the key. Rosa hides things well, so do not expect it to sit in plain sight. Then head east to the auto shop and find the cage. Inside are the kinds of parts that keep a tired engine breathing. Now, I knew Mr. Ortiz a little. He was gruff, and he hated small talk, but he loved engines more than almost anything. Mr. Ortiz would want those parts to keep a van running. So go make him proud, and drive carefully. Jo out.",
    },
    {
      title: "Theo at the Water Tower",
      text: "This is Theo, speaking from the Water Tower. I tend the pumps out here, and most days the only voices I hear are the pipes knocking. Today is different, because I have two guests. Dev and Mr. Ortiz are staying with me, because the Water Tower has clean water, and clean water is worth a long walk. Mr. Ortiz already fixed my squeaky pump, which I did not ask him to do. Dev has been pacing all morning, waiting for his turn at the microphone. So here he is, and here is his message for his sister, word for word. Ruby, I am safe with Theo. Come west. That is all he wanted to say. He said it three times, just to be sure. Theo out.",
    },
    {
      title: "Ruby Heads West",
      text: "Jo on 88.1, and I have been grinning all day. Ruby heard Dev's message. She is heading west to the Water Tower right now, walking faster than she has walked in months, I bet. Before she left, though, Ruby did what Ruby always does. She left one more warning, painted on the gate at Ridge Lumber, so here it is for everyone. Do not run the saws at Ridge Lumber. Not even for one quick cut. The noise brings the whole crowd from the loading dock, and they pour out like water through a broken dam. Carry your boards out by hand instead. It is slower, but slow is how you get home. Ruby, safe travels. Jo out.",
    },
    {
      title: "Together Again",
      text: "Theo here, at the Water Tower, and for once I have good news, the best kind there is. Ruby walked through the gate of the Water Tower this morning, dusty from the road, with red paint on her hands. Dev saw her from the pump house and dropped a whole bucket of water. She and Dev are together again. They have not stopped talking since, and Mr. Ortiz says his ears are tired. I have never seen two people smile so hard. To everyone who passed along a message, thank you. It worked. Theo out. Back at the cabin, Pip cheered so loud that June had to remind everyone about the no-shouting rule. She was smiling the whole time she did it.",
    },
    {
      title: "Tip: The Repair Locker",
      text: "Jo here, and tonight's key ring tip is about a place I know well. Very well, in fact. The key hidden at Station 12 opens the repair locker at Signal Electronics. The notes inside the fire station will lead you to it, so read every one. Signal Electronics is downtown, close to the crowds, so go in fast and come out faster. Here is why that store matters to me. Priya, the manager there, built my first radio transmitter out of a junk box and a lot of patience. Without Priya, there would be no 88.1. There would just be me on a roof, talking to pigeons. So treat her store kindly, and close the doors behind you. Jo out.",
    },
    {
      title: "Doc Lin Gets Closer",
      text: "This is Doc Lin, on Jo's microphone again. Good news first. I made it to Mile 9 Pharmacy with a bag of medicine, and the bag is heavier than when I started. Bad news second. The road north to St. Anne Annex is still full of walkers, standing in the street like cars in a traffic jam. I could try it, but a doctor who never arrives helps no one. So I am waiting for a safe day, and I check the road every morning. And now my message, the one that matters most. Ada, keep the generator going. I am getting closer. Every day, a little closer, one street at a time. Doc Lin out.",
    },
    {
      title: "Delayed Again",
      text: "Sergeant Vega here, from the 4th Precinct. I wish I had better news tonight. The River Convoy is delayed again. The rain this week made the river too high and too fast for the boats. Put a boat on that water now, and the current would carry it off like a leaf in a gutter. So we wait. I will be honest with you, because you deserve honesty. Vega sounds tired tonight, I know, and Vega is tired. My whole crew is tired. But the plan is still good. A good plan does not stop being good because the weather is rude. Here is what the convoy still needs. Fuel, and more drivers. If you can bring either, come to the precinct. Vega out.",
    },
    {
      title: "Theo's Key Tip",
      text: "This is Theo, at the Water Tower, with a key ring tip. Jo asked me to share one, and I figure I owe this town a favor or two. The key hidden at the Water Tower opens the principal's closet at Lincoln Middle School. The notes around the pump building will lead you there, one after the other, like footprints in wet sand. The school is north of downtown, so plan for a longer drive. Keep the doors closed behind you, and walk softly in those hallways. Before I go, two people here are tugging at my sleeve. Ruby and Dev say hello to everyone listening. They also say thank you for every message you passed along. Theo out.",
    },
    {
      title: "Two Extra Cots",
      text: "This is Mrs. Greer, at the Public Library. The library still stands. I say that every time, because every time it feels like a small miracle. Reading saved this building. The books nobody wanted are stacked against the walls now, thick as bricks, and they hold the walkers back. Ms. Adler has a habit I want you to know about. Every night she sets out two extra cots, one for Max and one for Mia. She makes them up with blankets and fluffs the pillows, even though they stay empty. Her students help her do it, without being asked. Max, Mia, if you hear this, come to the book drop and knock. We will open it. Mrs. Greer, signing off.",
    },
    {
      title: "Vega's Key Tip",
      text: "Sergeant Vega on the air, with a key ring tip. I do not usually give these out, but Jo talked me into it. The key hidden at the 4th Precinct opens the foreman's lockbox at Ridge Lumber. Read every note in my station. The trail is there, and it is honest. Ridge Lumber sits on the east ridge, so give yourself time for the drive. I spoke to Carla, the yard boss, about that lockbox. Carla is loud, but she is fair, and she was very clear. The lumber in there should go to building, not burning. Fences, walls, roofs, beds for gardens. Not a bonfire, however cold the night gets. Respect that, and she will respect you. Vega out.",
    },
    {
      title: "A Light in the Window",
      text: "Nurse Ada at St. Anne Annex. I will be exact, as always. The hospital generator is running low. I have turned off every light I can spare and shut every door I can close. Still, the fuel gauge drops like a stone in a pond. But something good happened too. I heard Doc Lin's voice on the radio, and it made my day. It made my whole week, if I am honest. It is strange how much one voice can weigh. So here is my message to Doc Lin. Lin, I will keep a light in the top window, so you know I am here. Look up the hill at night. I will not let it go out. Ada out.",
    },
    {
      title: "The List Grows",
      text: "Chief Dunn at Station 12, reading the River Convoy list. I will not read every name tonight, because the list keeps growing and Jo needs the air. More names are on it every day. Some are in neat print, and some are in crayon, from kids who signed for their whole family. That is the good news. Here is the hard part. The convoy is delayed again, because there are not enough boats yet. We have trucks, we have people, and we have a river. What we lack is enough boats to carry them all. If you know where a boat is, tell us. And if you can fix an engine, come to Station 12. Bring your tools and your patience. Dunn out.",
    },
    {
      title: "Mrs. Greer's Key Tip",
      text: "Mrs. Greer here, from the Public Library, with a key ring tip. It feels a little strange for a librarian to give directions to a jewelry store, but here we are. The key hidden at the Public Library opens the jewelry vault at Northgate Mall. Read the notes in my reading rooms, and they will guide you to it. Please put the books back where you found them. Now, about that mall. I have heard the stories, and so have you. Walk, do not run, at the mall. Running wakes the whole crowd, and they will follow you like a rumor through a small town. Walk slowly and steadily, as if you were browsing the shelves. Mrs. Greer, signing off.",
    },
    {
      title: "Storm from the North",
      text: "Jo on 88.1, with a weather warning, and I want you to take this one seriously. A storm is coming from the north tonight. Up here on the roof, I can already see the clouds stacking up like dark laundry on a line. Here is what to do. Stay inside. Keep the fire low, so a spark does not find the roof. And check the fence before dark, every board and every corner. Once the wind starts howling, you will not want to go out. One more thing. Walkers are slow in the wind, stumbling like kites with no string. But they still come. Wind does not stop them; it only slows them down. Hold tight, everyone. Jo out.",
    },
    {
      title: "The Light Is On",
      text: "This is Doc Lin. I am at the bottom of the hill below St. Anne Annex, closer than I have ever been. I am speaking softly, because the walkers on this hill have sharp ears. Last night I looked up, and I saw it. A light, in the top window of the hospital. Small and yellow and steady, like a lighthouse built for one person. I stood there for a long time, just looking at it. Nurse Ada is still there. She kept her promise. Now I have to keep mine. The road up the hill is still crowded, but I am still trying to reach her, one careful step at a time. Ada, I saw your light. Doc Lin out.",
    },
    {
      title: "Pack Tonight",
      text: "Sergeant Vega, from the 4th Precinct, and this is the announcement we have all been waiting for. The River Convoy will leave at first light tomorrow, if the river road holds. The water is down, the boats are ready, and the trucks finally have their parts. Everyone on the list should pack tonight. Take only what you can carry, and be at the river before dawn. Do not be late, because the convoy will not wait. To anyone who stays behind, I respect that choice. This town still needs people. So keep the town's rule, the one that got us all this far: take what you need, leave the rest. Look after each other. Vega out.",
    },
    {
      title: "Same Time Tomorrow",
      text: "Jo on 88.1, and here is the news. The River Convoy did not leave this morning. Fog sat on the river road, thick as wet wool, and nobody could see past their own hood. Driving blind with a line of trucks is a good way to lose a line of trucks. Sergeant Vega says soon. I believe it, mostly. Now the good news, because there is always some if you look. Ruby and Dev are safe at the Water Tower, and Theo says they eat like a pack of wolves. Nurse Ada's light is still on, up in that top window, steady as ever. So the town holds on, one more day. Same time tomorrow on 88.1. This is Jo, signing off.",
    },
  ];

  T.tags = {
    fuel: [
      "A strip of masking tape runs across the can, pressed down hard: MIXED, generator only. Under it, in thick black marker: shake before you pour. The fuel sloshes inside like a restless little sea, so whoever wrote this meant every word.",
      "Tomas's rule is written on the side. Fill it to the line, never to the top, because fuel needs room in the heat. A second note sits lower down, in smaller letters: keep it outside, away from the stove. Tomas underlined outside twice.",
    ],
    food: [
      "Stamped on the lid: canned beans, peaches and rice. A sticky note in Hana's handwriting is pressed to the top: eat the oldest cans first. Below it she added a warning: never eat from a can that bulges. A swollen can is trouble wearing a label.",
      "Written on the side in thick marker: one crate for every trip. Somebody drew a lopsided smiley face next to it and wrote one word underneath: share. The smiley face is smudged, as if a lot of thumbs have carried this crate before yours.",
    ],
    lumber: [
      "Stamped on the end of the board: kiln dried, Ridge Lumber. Carla's chalk runs along the side in big, loud letters: for fences, not for fires. The chalk has smeared in places, but the message is as clear as a shout across a lumberyard.",
      "A paper tag is stapled to the bundle: measure twice, cut once. Pencil marks along one board show where someone almost cut it, then changed their mind. The near miss sits there like a lesson, reminding you that one wrong cut cannot be taken back.",
    ],
    nails: [
      "The box label reads: common nails, three inches long. Mr. Reyes's price sticker is still on the corner, from back when nails cost money. On the lid someone wrote: wear gloves, and pick up every nail you drop. A loose nail waits patiently for a boot.",
      "A sticky note on the side: two nails in each board, driven in at an angle, hold better than one. Below it: the box rattles, so wrap it in a shirt to keep it quiet. In a town full of walkers, even a rattle carries like a shout.",
    ],
    tools: [
      "Masking tape on the lid says: Reyes Hardware, bring it back when you are done. Inside the lid, a neat list is taped in place: hammer, saw, pliers, wrench, tape. Each tool sits in its own slot, so you can tell at a glance if one wandered off.",
      "Mr. Ortiz's note is taped inside: wipe the tools clean before you put them away. Somebody scratched a reminder into the wrench handle: righty tighty, lefty loosey. The letters are worn smooth, like a song a whole garage once knew by heart.",
    ],
    parts: [
      "A tag is wired to the box: Ortiz Auto, fits most vans. Underneath, Mr. Ortiz wrote in neat block letters: check the belt before any long drive. A belt that snaps halfway down the road turns a van into a very heavy, very loud chair.",
      "Grease pencil on the side lists what is inside: spark plugs, a belt, an oil filter. A sticky note adds: turn it hand tight, then a little more, never as hard as you can. Force breaks what patience could have fixed in half the time.",
    ],
    wire: [
      "The label on the spool says: copper wire, coated in plastic. Priya's note is taped beside it: strip a little plastic off each end, twist the ends together, then wrap them in tape. Her handwriting is tiny and tidy, as careful as her wiring.",
      "Written on the side of the spool: never touch a bare wire that is hooked to a generator. Someone drew a tiny antenna next to the warning and wrote: Jo, 88.1. It looks like a doodle, but it reads like an invitation to listen.",
    ],
    radioParts: [
      "The box label reads: tuner, speaker, antenna clamp. Priya's handwriting runs across the top: keep it dry, keep it in the bag. One drop of rain in the wrong place can turn a radio into a box of silence. Radio parts are rare, so guard them.",
      "A sticky note on the lid: the higher the antenna, the farther the voices. Below it is a list of stations, most of them crossed out after months of static. Only one is circled, with a firm loop of ink that nearly tore the paper: Jo.",
    ],
    seeds: [
      "The seed packet says: bush beans, plant one finger deep. Rosa's handwriting crowds the back of the packet: soak them in water overnight first. A soaked bean wakes up faster, she explains underneath, like a sleeper splashed with cold water in the morning.",
      "The seed packet says: lettuce and carrots, barely cover them with soil and keep the soil damp. On the back, Rosa wrote in green ink: save seeds from your best plants for next year. A garden that saves its own seeds never really ends.",
    ],
    soil: [
      "Printed on the bag: garden soil, keep dry. Rosa's note is tucked under the folded top: mix in old leaves and kitchen scraps to make it richer. Today's potato peels, she wrote at the bottom, are next summer's tomatoes, so throw nothing away.",
      "Stamped on the bag: Greenhouse Row. Written on the side in marker: it is heavy, so lift with your legs, not your back. The bag sags like a sleeping dog when you pick it up, and your back will quickly agree with the marker.",
    ],
    meds: [
      "A red cross on the lid, and a list inside: bandages, tape, cleaning wipes, pain pills. Nurse Ada's steps are taped under the lid. Wash the cut, press on it to stop the bleeding, cover it, check it every day. Her handwriting is calm and exact.",
      "Doc Lin's sticky note clings to the side: for a burn, cool it under clean water, and do not pop the blisters. Written below in marker: one kit gets you back on your feet. Doc Lin underlined the word one, as if to say do not waste it.",
    ],
    waterFilter: [
      "The label says: change the filter when the water runs slow or tastes strange. Theo's tag hangs from the handle: let dirty water settle first, then pour from the top. Patience, he means, is part of the filter too, and the mud agrees.",
      "Written on the side: if you are not sure, boil the water too. A sticky note adds: rinse the filter in clean water, never in dirty water. Washing a filter in mud is like cleaning a window with a muddy rag, and just as useless.",
    ],
    waterTank: [
      "Stenciled on the side in tall letters: drinking water only. Chief Dunn's tag is tied to the handle: Station 12, keep the lid on. An open tank catches leaves, bugs and trouble, and the chief always kept a tidy station, right down to the lids.",
      "A marker note on the lid: scrub it with a little bleach and rinse it well before you fill it. Below it: keep the tank in the shade so nothing grows inside. Sunlight on still water can turn a clean tank into a green swamp in a week.",
    ],
    generator: [
      "A warning plate is bolted to the frame: run it outside only, because the fumes are poison in a closed room. Masking tape below it says: check the oil before every start. An engine without oil is a fire waiting for an excuse.",
      "A note is taped to the handle: it is loud, and walkers hear it from far away. Below it: run it in the day and shut it off at night. After dark, its steady hum would carry across town like a drumbeat calling the whole crowd.",
    ],
    gunParts: [
      "A tag from the police armory is tied to the box, signed by Sergeant Vega in quick, sharp letters. The parts are wrapped in oily paper, with a note tucked inside: keep it clean and dry. Rust works slowly, but it never takes a day off.",
      "Written on the box in heavy marker: always check that it is empty before you clean it. Below it: point it at the ground, never at a person. The rules are short on purpose, because they are the kind you can only break once.",
    ],
    armorPlate: [
      "Stenciled on the plate: steel, heavy. Both words are true, and your arms will agree before you reach the van. A chalk note runs along the bottom edge: bolt it onto the van door at chest height. That is where grabbing hands reach first.",
      "A sticky note clings to the plate: a plate stops grabbing hands, not crashes. Marker lines along one edge count every dent it has taken, neat as tally marks on a scoreboard. There are a lot of lines, and the plate is still in one piece.",
    ],
    books: [
      "Stamped inside the first cover: Public Library, please return. Mrs. Greer's note is taped to the box in tidy cursive: reading saved this building. She means it in more ways than one, because the unwanted books now hold the walkers back.",
      "The box label lists what is inside: field guides, first aid, small engines, poems. A sticky note adds: the first aid book is the one with the folded corners. Someone has needed those pages more than once, and quickly, judging by the creases.",
    ],
    maps: [
      "The folder label reads: city maps, streets and the river road. Someone traced the river road north in red pen, pressing so hard the paper nearly tore. Beside it, in capital letters, is one word: CONVOY. The red line looks like hope.",
      "Pencil marks dot the map, with a red R next to some buildings. Ruby's note on the back explains it: a red R means I have been inside, and the number means walkers. Read the map like her trail, and you will know where to step.",
    ],
  };

  T.recap = {
    haul: "The van rolled home with {items} items and {scrap} scrap rattling in the back, and all of it was worth the drive.",
    nothing: "The van came home empty this time, but the crew came home too, and June says that still counts for something.",
    notes: "You read {notes} notes today, and each one is folded into your backpack, waiting for a second look.",
    keys: "You carried {keys} stash keys home, and each one opens a locked door somewhere else in town.",
    food: "After supper, the cupboard holds {food} food, and June wrote that number in her green ledger.",
    hungry: "The cupboard is empty, so the crew goes to bed hungry, and tomorrow the van will be weaker on the road.",
    next: "Next on the list is the {room} room, which still needs {needs}.",
    ready: "Everything is here to build the {room} room, so head to the computer in the office.",
  };

  // The cabin inside: what the Hollis family left on the walls, one note per room (facts: W.HOUSE_NOTES),
  // and the computer's House tab (facts: W.HOUSE_UPGRADE_FACTS).
  T.house = {
    notes: {
      porch: {
        title: "The Bell That Calls Them",
        text: "A carved wooden sign hangs by the front door: THE CABIN, and under it, in smaller letters, THE HOLLIS FAMILY. Dan Hollis hung a big iron dinner bell on the porch so the kids could hear it from the woods. It reached them wherever their games had taken them. A faded note under the bell still says: ring for supper.\n\nJune added her own line in chalk, and it changes everything. The bell carries far, and walkers come to it the way moths come to a porch light. Ring it only when you are ready to fight.",
      },
      foyer: {
        title: "Five Empty Hooks",
        text: "Five hooks line the wall beside the door, and someone painted a name above each one. Kate, Dan, Gus, Finn, and a low hook for Lucy, set at the height of a small hand. A paper tag on that last hook says: last one out locks the door. It reads like a rule repeated a thousand times, until even the youngest knew it by heart.\n\nThe hooks are empty now. The Hollis family took their keys with them when they left, the way people do when they plan to come home.",
      },
      office: {
        title: "Kate's Desk and the Computer",
        text: "Kate Hollis worked at this desk, drawing maps for the county. Rolled maps still lean in the corner like a quiver of arrows, and her pencils sit sharpened in a mug. A sticky note on the computer screen explains that it runs off the big battery in the closet. Because of that, the screen still glows when the rest of the town is dark.\n\nJune keeps the base plans on it now: the rooms, the van, the guns, and the traps. Kate charted a county; June charts a yard. Both of them would say the details matter.",
      },
      dining: {
        title: "The Chore Chart",
        text: "A chore chart hangs on the dining room wall, glittering with gold stars. Each kid had a job: Gus washed the dishes, Finn took out the trash, and Lucy fed Biscuit, the dog. Lucy has the most stars, a long shining row that leaves her brothers far behind. Someone crossed out one of Gus's stars with an angry line of marker, and nobody left an explanation.\n\nPip added a new row in pencil at the bottom: Pip feeds the dog we do not have yet. It is the most hopeful chore on the chart.",
      },
      kitchen: {
        title: "Kate's Note on the Fridge",
        text: "A note hangs on the fridge, held up by a magnet shaped like a fish. Kate wrote it the morning the family left, and the pen pressed so hard it nearly tore the paper.\n\n“We are going north with the River Convoy, on Sergeant Vega's trucks. We took Biscuit, our go bags, and the last of the canned peaches. If you find our cabin and you are kind, it is yours now. Please keep the garden going. —Kate”\n\nJune says it is the most generous thing anyone ever wrote to a stranger, and she intends to deserve it.",
      },
      pantry: {
        title: "The Pantry Shelves",
        text: "Dan Hollis put a label on every shelf in the pantry: beans, rice, peaches, flour. The labels are printed in neat black letters, the work of a man who liked to know where things belonged. Most of the shelves are bare now, so the labels read less like a list and more like a wish.\n\nThis is where the crew keeps count. The food gets counted here, and so does everything else in storage, from nails to medical kits. When a shelf fills up, everyone can see it, and that does more for morale than any speech.",
      },
      pingpong: {
        title: "Rematch on Sunday",
        text: "A chalk scoreboard hangs over the ping pong table, and the last game is still on it: Finn 21, Dad 19. Underneath, Dan wrote a promise: rematch on Sunday. The chalk has gone soft and smudged, but nobody in the crew will wipe it off.\n\nTomas and Pip play here now, keeping score on the bottom half of the board. Pip says the table leans to the left, which is why Pip's shots keep curving off the edge. Tomas says the table is fine and Pip is simply losing.",
      },
      masterBath: {
        title: "The Heart on the Mirror",
        text: "Someone drew a heart on the bathroom mirror in red marker, and inside it wrote three names: Gus, Finn, and Lucy. Every morning that heart was the first thing the family saw, and now it is the first thing the crew sees. A list is taped beside the sink: brush your teeth for two whole minutes, Lucy. A small smiley face follows it, half a warning and half a joke.\n\nJune left the list up. She says rules written with love should outlast the people who needed them.",
      },
      master: {
        title: "The Big Bed",
        text: "A photo hangs over the big bed: Kate and Dan Hollis on their wedding day. They stand by the river with the wind in their hair. They look young and a little nervous, as if the whole future were waiting just outside the frame.\n\nJune has a rule for this room: whoever is hurt the most gets this bed. A nap here heals you all the way, but it takes time. The yard never gives time away freely, because the walkers keep coming while you sleep.",
      },
      living: {
        title: "The Door Frame",
        text: "Pencil lines climb the living room door frame, each one dated, showing how tall the kids grew each year. Gus has the top line, nearly brushing the top of the frame. Lucy's lowest line says age 3, barely above the baseboard. When Pip stood against the frame for a mark, it landed between Finn and Gus. Pip was quietly pleased about that for a whole day.\n\nThe radio and June's green ledger sit on the shelf by the couch. Anyone can sit down there and read the past days again.",
      },
      gusRoom: {
        title: "Gus's Room",
        text: "A sign is taped to the door: Gus's Room. Keep Out. This Means You, Finn. Gus is sixteen, the age when a closed door is a whole country. He left behind a guitar with two broken strings. It is propped in the corner as if it were waiting for him to come back.\n\nTomas sleeps here now. He says the sign still counts, only the name has changed: these days it means Pip. Pip ignores it with great dignity.",
      },
      finnRoom: {
        title: "The Treehouse Plan",
        text: "Finn drew a plan for a treehouse and pinned it above his bed, where he could study it before he fell asleep. It goes in the woods past the fence, in a tree he circled twice. There is a rope ladder, a lookout with a railing, and a bucket on a pulley for snacks and comic books. Finn measured everything, so the plan looks less like a daydream and more like a promise.\n\nPip wants to build it someday, after the fence is strong. Until then, the plan stays on the wall.",
      },
      lucyRoom: {
        title: "Lucy's Drawing of Biscuit",
        text: "A crayon drawing is taped beside Lucy's bed. It shows a dog with floppy ears as big as wings, and across the top, in wobbly letters: MY DOG BISCUIT. Under it Lucy wrote, with great pride, that Biscuit can sit, shake, and roll over. The drawing has been colored so hard that the crayon shines.\n\nPip pinned a second drawing next to it: a dog with no name yet. It sits beside Biscuit like a question waiting for an answer.",
      },
      playroom: {
        title: "The Typing Chalkboard",
        text: "The play room has a little desk with an old typewriter on it. It is heavy as a toolbox and loud as rain on a tin roof. A chalkboard hangs above the desk. On it Kate wrote: practice your typing for ten minutes a day, with your fingers on the home row. Under that, Lucy wrote her name ten times, each one a bit straighter, like a fence going up board by board.\n\nThe typewriter still works. Anyone in the crew can sit here and practice, and the clacking keys make the house feel lived in.",
      },
      coatCloset: {
        title: "The Go Bag List",
        text: "A list is taped inside the coat closet door, headed THE GO BAG. It reads: water, a flashlight, batteries, Biscuit's leash, and the photo album. The photo album is the only item that will not keep anyone alive. It made the list anyway. That says a lot about the Hollis family.\n\nAt the bottom, underlined twice, is the plan for the worst case. If we get split up, meet at the river dock by the convoy trucks.",
      },
    },
    upgrades: {
      doors: {
        desc: "The cabin has two doors to the yard: the front door on the porch and the back door in the play room. Walkers pound on a closed door until it breaks, and an open door lets them walk right in. Each door starts with 150 strength.",
        next: [
          "A thick wooden bar goes across each door, so door strength rises from 150 to 260.",
          "Steel sheets are bolted onto both doors, raising door strength to 400.",
          "Steel security doors replace the old wooden ones, raising door strength to 560.",
        ],
      },
      windows: {
        desc: "The cabin has many windows, and every one is a weak spot: walkers smash the glass fast and climb in. You cannot climb out through a broken window, so a smashed window is only ever a way in. Glass starts with 50 strength.",
        next: [
          "Boards go up over the glass, so window strength rises from 50 to 140.",
          "Metal shutters go up over every window, raising window strength to 240.",
          "Steel plates with a narrow slot cover every window, raising window strength to 380.",
        ],
      },
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
